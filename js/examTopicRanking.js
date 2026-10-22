/* Ranking dos temas mais cobrados por banca (aba Provas).
   Conta as questões das provas reais da banca escolhida por tema (o mesmo tema do Estudo por
   temas), mostra a fatia de cada tema, os subtemas que mais aparecem, o seu acerto no tema e um
   botão para treinar as questões daquele tema naquela banca (não feitas primeiro). Começa na
   banca do plano de estudos, se houver. */

const RANKING_SHOWN = 12;
const RANKING_SUBTHEMES = 3;
const RANKING_BLOCK = 30;

state.rankingInstitution = null;
let rankingCache = { key: "", rows: [], total: 0, exams: 0 };

function rankingExams(institution) {
  return state.exams.filter((exam) => !exam.custom && (institution === "Todas" || exam.institution === institution));
}

function rankingRows(institution) {
  const exams = rankingExams(institution);
  /* Correções da administração podem mudar o tema de uma questão: entram na chave do cache. */
  const key = `${institution}|${exams.length}|${Object.keys(state.globalCorrections || {}).length}|${Object.keys(state.corrections || {}).length}`;
  if (rankingCache.key === key) return rankingCache;
  const byTopic = new Map();
  let total = 0;
  for (const exam of exams) {
    for (const question of exam.questions || []) {
      if (isExcluded(question.id) || effectiveQuestion(question).annulled) continue;
      const topic = topicForQuestion(question);
      const row = byTopic.get(topic) || { topic, count: 0, questions: [], subthemes: new Map() };
      row.count += 1;
      row.questions.push(question);
      const subtheme = questionSubtheme(question);
      if (subtheme && subtheme !== "Subtema a revisar") row.subthemes.set(subtheme, (row.subthemes.get(subtheme) || 0) + 1);
      byTopic.set(topic, row);
      total += 1;
    }
  }
  const rows = [...byTopic.values()].sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic, "pt-BR"));
  rankingCache = { key, rows, total, exams: exams.length };
  return rankingCache;
}

function rankingDefaultInstitution() {
  const planned = state.studyPlan?.targetExam;
  const institutions = new Set(state.exams.map((exam) => exam.institution));
  return planned && institutions.has(planned) ? planned : "Todas";
}

function personalAccuracy(questions) {
  let answered = 0;
  let correct = 0;
  for (const question of questions) {
    const grade = getProgress(question.id).grade;
    if (!grade) continue;
    answered += 1;
    if (grade === "correct") correct += 1;
  }
  return { answered, accuracy: answered ? correct / answered : 0 };
}

function renderExamTopicRanking() {
  const host = document.querySelector("#examTopicRanking");
  const select = document.querySelector("#rankingInstitution");
  if (!host || !select) return;
  if (!select.options.length) {
    const institutions = [...new Set(state.exams.filter((exam) => !exam.custom).map((exam) => exam.institution).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    select.innerHTML = ['<option value="Todas">Todas as bancas</option>', ...institutions.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)].join("");
  }
  state.rankingInstitution ||= rankingDefaultInstitution();
  if (select.value !== state.rankingInstitution) select.value = state.rankingInstitution;

  const { rows, total, exams } = rankingRows(state.rankingInstitution);
  const top = rows.slice(0, RANKING_SHOWN);
  const max = top[0]?.count || 1;
  const html = total
    ? `<p class="panel-line">${total.toLocaleString("pt-BR")} ${total === 1 ? "questão" : "questões"} em ${pluralize(exams, "prova", "provas")}${state.rankingInstitution === "Todas" ? "" : ` da ${escapeHtml(state.rankingInstitution)}`}.</p>
      <ol class="ranking-list">
        ${top.map((row, index) => {
          const share = Math.round((row.count / total) * 100);
          const mine = personalAccuracy(row.questions);
          const unseen = row.questions.filter((question) => !getProgress(question.id).grade && isReadyQuestion(effectiveQuestion(question))).length;
          const subthemes = [...row.subthemes.entries()].sort((a, b) => b[1] - a[1]).slice(0, RANKING_SUBTHEMES);
          const tone = !mine.answered ? "" : mine.accuracy >= 0.7 ? "good" : mine.accuracy >= 0.5 ? "mid" : "bad";
          return `
            <li>
              <div class="ranking-head">
                <span class="ranking-pos">${index + 1}</span>
                <strong>${escapeHtml(row.topic)}</strong>
                <b>${share}%</b>
              </div>
              <i class="ranking-bar" style="--w:${Math.round((row.count / max) * 100)}%"></i>
              <div class="ranking-meta">
                <span>${pluralize(row.count, "questão", "questões")}</span>
                <span class="${tone}">${mine.answered ? `seu acerto: ${Math.round(mine.accuracy * 100)}% (${mine.answered})` : "você ainda não fez"}</span>
                <button type="button" class="link-btn" data-ranking-train="${escapeHtml(row.topic)}">Treinar${unseen ? ` · ${unseen} inéditas` : ""}</button>
              </div>
              ${subthemes.length ? `<p class="ranking-subthemes">${subthemes.map(([name, count]) => `${escapeHtml(name)} <small>(${count})</small>`).join(" · ")}</p>` : ""}
            </li>`;
        }).join("")}
      </ol>
      ${rows.length > RANKING_SHOWN ? `<p class="panel-line">Mais ${pluralize(rows.length - RANKING_SHOWN, "tema", "temas")} com menos questões.</p>` : ""}`
    : '<p class="panel-line">Nenhuma questão de prova desta banca.</p>';
  if (host.dataset.renderedHtml !== html) {
    host.innerHTML = html;
    host.dataset.renderedHtml = html;
  }
}

function startRankingTraining(topic) {
  const row = rankingRows(state.rankingInstitution || "Todas").rows.find((item) => item.topic === topic);
  if (!row) return;
  const ready = row.questions.filter((question) => isReadyQuestion(effectiveQuestion(question)));
  const unseen = shuffle(ready.filter((question) => !getProgress(question.id).grade));
  const seen = state.unseenOnly ? [] : shuffle(ready.filter((question) => getProgress(question.id).grade));
  const questions = [...unseen, ...seen].slice(0, RANKING_BLOCK);
  if (!questions.length) return;
  const bank = state.rankingInstitution === "Todas" ? "todas as bancas" : state.rankingInstitution;
  startStudyRun(questions, { kind: "ranking", label: `${topic} · ${bank}` });
}

(function setupExamTopicRanking() {
  const card = document.querySelector("#examTopicRankingCard");
  if (!card) return;
  card.addEventListener("change", (event) => {
    if (event.target.id !== "rankingInstitution") return;
    state.rankingInstitution = event.target.value;
    renderExamTopicRanking();
  });
  card.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ranking-train]");
    if (button) startRankingTraining(button.dataset.rankingTrain);
  });

  /* Calcula só quando a aba Provas está aberta e o cartão expandido. */
  card.addEventListener("toggle", () => {
    if (card.open) renderExamTopicRanking();
  });
  const baseRenderExams = renderExams;
  renderExams = function renderExamsWithRanking(...args) {
    const result = baseRenderExams.apply(this, args);
    if (card.open && state.activeTab === "exams") renderExamTopicRanking();
    return result;
  };
})();
