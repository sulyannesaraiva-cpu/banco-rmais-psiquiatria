/* Revisão de véspera: uma revisão final montada para a prova do plano.
   - Questões: todas com a etiqueta "Rever na véspera", os erros dos últimos 30 dias e as questões
     perigosas, só dos temas que mais pesam na banca (os 6 de maior peso), até 40, em ordem de peso.
   - Flashcards: cartões desses temas que estão vencidos ou que você marcou como "Errei" ou
     "Difícil"; sem nenhum, os de importância máxima. Até 30.
   Aparece em Hoje > Outras revisões e, nos 7 dias antes da prova, em destaque no topo de Hoje. */

const VESPERA_TOPICS = 6;
const VESPERA_QUESTIONS = 40;
const VESPERA_FLASHCARDS = 30;
const VESPERA_WRONG_DAYS = 30;

function vesperaTopics() {
  if (typeof computeReadiness !== "function") return [];
  return computeReadiness().rows.filter((row) => row.weight > 0).slice(0, VESPERA_TOPICS).map((row) => row.topic);
}

function vesperaQuestions(topics) {
  const order = new Map(topics.map((topic, index) => [topic, index]));
  const since = Date.now() - VESPERA_WRONG_DAYS * DAY_MS;
  const picked = [];
  for (const question of todayStudyPool()) {
    const progress = getProgress(question.id);
    const labeled = Array.isArray(progress.labels) && progress.labels.includes("vespera");
    const topic = topicForQuestion(question);
    const inTopics = order.has(topic);
    const recentWrong = progress.grade === "wrong" && (progress.lastWrongAt || progress.updatedAt || 0) >= since;
    const dangerous = typeof isDangerousQuestion === "function" && isDangerousQuestion(question);
    if (labeled || (inTopics && (recentWrong || dangerous))) {
      picked.push({ question, rank: labeled ? -1 : order.get(topic) ?? 99 });
    }
  }
  return picked.sort((a, b) => a.rank - b.rank).slice(0, VESPERA_QUESTIONS).map((item) => item.question);
}

function vesperaFlashcards(topics) {
  if (typeof flashcardTopicIndex !== "function") return [];
  const index = flashcardTopicIndex();
  const items = topics.flatMap((topic) => [...(index.topics.get(topic)?.values() || [])].flat());
  const now = Date.now();
  const hard = items.filter((item) => {
    const progress = state.flashcardProgress[item.card.id];
    if (!progress?.nextReviewAt) return false;
    return new Date(progress.nextReviewAt).getTime() <= now || ["again", "hard"].includes(progress.lastGrade);
  });
  const pool = hard.length ? hard : items.filter((item) => Number(item.card.importance || item.deck.importance || 3) >= 5);
  return pool.slice(0, VESPERA_FLASHCARDS);
}

let vesperaCache = { key: "", data: null };
function vesperaData() {
  const key = [localDayKey(), state.studyPlan?.updatedAt || 0, Object.keys(state.progress || {}).length, Object.keys(state.flashcardProgress || {}).length, Math.floor(Date.now() / 60000)].join("|");
  if (vesperaCache.key !== key) {
    const topics = vesperaTopics();
    vesperaCache = { key, data: { topics, questions: topics.length ? vesperaQuestions(topics) : [], cards: topics.length ? vesperaFlashcards(topics) : [] } };
  }
  return vesperaCache.data;
}

function vesperaHtml({ highlight = false } = {}) {
  const plan = state.studyPlan;
  const { topics, questions, cards } = vesperaData();
  if (!topics.length) return "";
  const daysLeft = typeof daysUntilExam === "function" ? daysUntilExam(plan) : null;
  const when = daysLeft === 0 ? "A prova é hoje" : daysLeft === 1 ? "A prova é amanhã" : daysLeft > 1 ? `Faltam ${daysLeft} dias para a prova` : "Revisão final";
  return `
    <div class="vespera ${highlight ? "highlight" : ""}">
      ${highlight ? `<strong class="vespera-title">${escapeHtml(when)}: hora da revisão de véspera</strong>` : ""}
      <p class="panel-line">Temas que mais caem na ${escapeHtml(plan?.targetExam && plan.targetExam !== "Todas" ? plan.targetExam : "prova")}: ${topics.map(escapeHtml).join(", ")}.</p>
      <div class="vespera-actions">
        <button type="button" class="${highlight ? "primary-btn" : "outline-btn"}" data-vespera="questions" ${questions.length ? "" : "disabled"}>Questões da véspera · ${questions.length}</button>
        <button type="button" class="outline-btn" data-vespera="flashcards" ${cards.length ? "" : "disabled"}>Flashcards da véspera · ${cards.length}</button>
      </div>
      <small class="panel-line">Questões: as marcadas com "Rever na véspera", seus erros dos últimos 30 dias e as perigosas desses temas. Flashcards: os vencidos ou difíceis desses temas.</small>
    </div>`;
}

function renderVespera() {
  const inside = document.querySelector("#vesperaReview");
  const top = document.querySelector("#vesperaCard");
  if (!inside && !top) return;
  const daysLeft = typeof daysUntilExam === "function" ? daysUntilExam(state.studyPlan) : null;
  const near = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && !state.planDraft && !state.todaySummary;
  const insideHtml = vesperaHtml() || '<p class="panel-line">Crie seu plano de estudo com a banca da prova para montar a revisão de véspera.</p>';
  if (inside && inside.dataset.renderedHtml !== insideHtml) {
    inside.innerHTML = insideHtml;
    inside.dataset.renderedHtml = insideHtml;
  }
  if (top) {
    const topHtml = near ? vesperaHtml({ highlight: true }) : "";
    top.hidden = !topHtml;
    if (top.dataset.renderedHtml !== topHtml) {
      top.innerHTML = topHtml;
      top.dataset.renderedHtml = topHtml;
    }
  }
}

(function setupVespera() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-vespera]");
    if (!button || button.disabled) return;
    const { questions, cards } = vesperaData();
    if (button.dataset.vespera === "questions") startStudyRun(questions, { kind: "vespera", label: "Revisão de véspera" });
    else startFlashcardSession(cards, { label: "Flashcards da véspera", returnTab: "overview" });
  });

  const baseRender = render;
  render = function renderWithVespera(...args) {
    const result = baseRender.apply(this, args);
    if (!document.querySelector("#startPanel")?.hidden) renderVespera();
    return result;
  };
})();
