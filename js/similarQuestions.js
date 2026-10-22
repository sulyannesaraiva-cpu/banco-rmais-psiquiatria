/* Questões parecidas ao errar.
   Depois de um erro (fora do simulado em andamento), sugere até 3 questões do mesmo subtema,
   escolhidas pelas palavras em comum com a questão errada, com as inéditas primeiro.
   - Num bloco (Hoje, temas, busca, etiquetas, ranking): "Resolver em seguida" põe as parecidas
     logo depois da questão atual, sem sair do bloco.
   - Em prova, tema ou revisão: "Treinar estas agora" abre um bloco só com elas (a prova fica
     salva onde parou). */

const SIMILAR_SHOWN = 3;

state.similarAdded = {};
let similarIndexCache = { key: "", bySubtheme: new Map(), byTopic: new Map(), words: new Map() };

function similarIndex() {
  const questions = allStudyQuestions();
  const key = `${questions.length}|${Object.keys(state.globalCorrections || {}).length}|${Object.keys(state.corrections || {}).length}|${(state.excludedIds || []).length}`;
  if (similarIndexCache.key === key) return similarIndexCache;
  const bySubtheme = new Map();
  const byTopic = new Map();
  for (const question of questions) {
    if (isExcluded(question.id)) continue;
    const subtheme = questionSubtheme(question);
    const topic = topicForQuestion(question);
    if (!bySubtheme.has(subtheme)) bySubtheme.set(subtheme, []);
    bySubtheme.get(subtheme).push(question);
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic).push(question);
  }
  similarIndexCache = { key, bySubtheme, byTopic, words: new Map() };
  return similarIndexCache;
}

function similarWords(question) {
  const cache = similarIndexCache.words;
  if (!cache.has(question.id)) {
    const view = effectiveQuestion(question);
    cache.set(question.id, conceptWords(`${String(view.text || "").replace(REFERENCE_CITATION, "")} ${(view.options || []).map((option) => option.text).join(" ")}`));
  }
  return cache.get(question.id);
}

function similarQuestionsFor(question, limit = SIMILAR_SHOWN) {
  const index = similarIndex();
  const subtheme = questionSubtheme(question);
  const inRun = new Set(state.filtered.map((item) => item.id));
  const usable = (item) => item.id !== question.id && !inRun.has(item.id) && isReadyQuestion(effectiveQuestion(item));
  let candidates = subtheme && subtheme !== "Subtema a revisar" ? (index.bySubtheme.get(subtheme) || []).filter(usable) : [];
  if (candidates.length < limit) {
    const known = new Set(candidates.map((item) => item.id));
    candidates = candidates.concat((index.byTopic.get(topicForQuestion(question)) || []).filter((item) => usable(item) && !known.has(item.id)));
  }
  const words = similarWords(question);
  const sameSubtheme = (item) => questionSubtheme(item) === subtheme;
  return candidates
    .map((item) => {
      const other = similarWords(item);
      let overlap = 0;
      for (const word of other) if (words.has(word)) overlap += 1;
      const similarity = overlap / Math.sqrt(Math.max(words.size, 1) * Math.max(other.size, 1));
      const unseen = !getProgress(item.id).grade;
      return { item, score: similarity + (sameSubtheme(item) ? 0.3 : 0) + (unseen ? 0.2 : 0) };
    })
    .sort((a, b) => b.score - a.score || String(a.item.id).localeCompare(String(b.item.id)))
    .slice(0, limit)
    .map((entry) => entry.item);
}

function similarSourceLabel(question) {
  const exam = state.exams.find((item) => (item.questions || []).includes(question));
  return exam ? exam.title || exam.institution : `Didática · ${topicForQuestion(question)}`;
}

function similarStatusLabel(question) {
  const grade = getProgress(question.id).grade;
  if (!grade) return ["new", "inédita"];
  return grade === "wrong" ? ["bad", "você errou"] : ["good", "você acertou"];
}

function similarSnippet(question) {
  const text = String(effectiveQuestion(question).text || "").replace(REFERENCE_CITATION, "").replace(/\s+/g, " ").trim();
  return text.length > 170 ? `${text.slice(0, 167).trimEnd()}…` : text;
}

function renderSimilarPanel() {
  const panel = document.querySelector("#similarPanel");
  if (!panel) return;
  const question = currentQuestion();
  const progress = question ? displayProgressFor(question.id) : null;
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  const visible = question && !examLocked && progress?.grade === "wrong";
  panel.hidden = !visible;
  if (!visible) {
    panel.dataset.renderedHtml = "";
    return;
  }
  const added = state.similarAdded[question.id];
  const similar = added ? [] : similarQuestionsFor(question);
  if (!added && !similar.length) {
    panel.hidden = true;
    return;
  }
  const inBlock = state.sessionActive && !state.examSimulationActive;
  const html = added
    ? `<p class="similar-done">${pluralize(added, "questão parecida entra", "questões parecidas entram")} logo depois desta.</p>`
    : `
      <div class="similar-head">
        <strong>Questões parecidas</strong>
        <span>${escapeHtml(questionSubtheme(question))}</span>
      </div>
      <ol class="similar-list">
        ${similar.map((item) => {
          const [tone, label] = similarStatusLabel(item);
          return `<li><small>${escapeHtml(similarSourceLabel(item))} · <em class="${tone}">${label}</em></small><p>${escapeHtml(similarSnippet(item))}</p></li>`;
        }).join("")}
      </ol>
      <div class="similar-actions">
        ${inBlock
          ? `<button type="button" class="concept-btn primary" data-similar-action="insert">Resolver ${similar.length === 1 ? "esta" : `estas ${similar.length}`} em seguida</button>`
          : `<button type="button" class="concept-btn primary" data-similar-action="block">Treinar ${similar.length === 1 ? "esta" : `estas ${similar.length}`} agora</button>`}
        <span>${inBlock ? "Entram logo depois desta questão, no mesmo bloco." : state.examActive || state.examSetActive ? "A prova fica salva onde você parou." : "Abre um bloco só com elas."}</span>
      </div>`;
  panel.dataset.ids = similar.map((item) => item.id).join(",");
  if (panel.dataset.renderedHtml !== html) {
    panel.innerHTML = html;
    panel.dataset.renderedHtml = html;
  }
}

/* Põe as parecidas logo depois da questão atual, no bloco em andamento. */
function insertSimilarQuestions(question, similar) {
  const fresh = similar.filter((item) => !state.filtered.some((existing) => existing.id === item.id));
  if (!fresh.length) return;
  state.filtered.splice(state.index + 1, 0, ...fresh);
  state.sessionIds = state.filtered.map((item) => item.id);
  const run = state.studyRun;
  if (run && Array.isArray(run.ids)) {
    run.ids = [...state.sessionIds];
    for (const item of fresh) {
      const progress = getProgress(item.id);
      if (progress.grade) run.prior = { ...(run.prior || {}), [item.id]: { grade: progress.grade, lastWrongAt: progress.lastWrongAt || null, updatedAt: progress.updatedAt || null } };
    }
    localStorage.setItem(STUDY_RUN_KEY, JSON.stringify(run));
  }
  state.similarAdded[question.id] = fresh.length;
  render();
}

(function setupSimilarQuestions() {
  const panel = document.querySelector("#similarPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-similar-action]");
    const question = currentQuestion();
    if (!button || !question) return;
    const byId = new Map(allStudyQuestions().map((item) => [item.id, item]));
    const similar = String(panel.dataset.ids || "").split(",").map((id) => byId.get(id)).filter(Boolean);
    if (!similar.length) return;
    if (button.dataset.similarAction === "insert") {
      insertSimilarQuestions(question, similar);
      return;
    }
    if (state.examActive || state.examSetActive) pauseExamStudy();
    startStudyRun(similar, { kind: "similar", label: `Parecidas · ${questionSubtheme(question)}` });
  });

  const baseRender = render;
  render = function renderWithSimilarQuestions(...args) {
    const result = baseRender.apply(this, args);
    renderSimilarPanel();
    return result;
  };
})();
