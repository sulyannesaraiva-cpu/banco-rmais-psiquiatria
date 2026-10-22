/* Etiquetas pessoais e anotação visível na questão.
   - Etiquetas ("Rever na véspera", "Decorar", "Dúvida", "Importante"): marcadas em cada questão,
     guardadas no progresso (sincroniza com a conta). Hoje > Outras revisões > "Minhas etiquetas"
     monta um bloco só com as questões de uma etiqueta.
   - Anotação: quando a questão tem anotação privada, ela aparece no próprio cartão (sem abrir
     "Anotação privada"), inclusive quando a questão volta na revisão. */

const QUESTION_LABELS = [
  ["vespera", "Rever na véspera"],
  ["decorar", "Decorar"],
  ["duvida", "Dúvida"],
  ["importante", "Importante"],
];

function questionLabelsOf(questionId) {
  const labels = getProgress(questionId).labels;
  return Array.isArray(labels) ? labels : [];
}

function toggleQuestionLabel(questionId, label) {
  const current = new Set(questionLabelsOf(questionId));
  if (current.has(label)) current.delete(label);
  else current.add(label);
  const previous = getProgress(questionId);
  state.progress[questionId] = { ...previous, labels: [...current], updatedAt: Date.now() };
  saveProgress();
}

function labeledQuestions(label) {
  return allStudyQuestions().filter((question) => !isExcluded(question.id) && questionLabelsOf(question.id).includes(label) && isReadyQuestion(effectiveQuestion(question)));
}

function questionNoteText(questionId) {
  const note = Object.prototype.hasOwnProperty.call(state.privateNotes || {}, questionId) ? state.privateNotes[questionId] : getProgress(questionId).note;
  return String(note || "").trim();
}

function renderQuestionLabels() {
  const row = document.querySelector("#questionLabels");
  if (!row) return;
  const question = currentQuestion();
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  row.hidden = !question || examLocked;
  if (row.hidden) return;
  const active = new Set(questionLabelsOf(question.id));
  const html = `<span>Etiquetas</span>${QUESTION_LABELS.map(([value, label]) => `<button type="button" data-question-label="${value}" aria-pressed="${active.has(value)}" class="${active.has(value) ? "active" : ""}">${escapeHtml(label)}</button>`).join("")}`;
  if (row.dataset.renderedHtml !== html) {
    row.innerHTML = html;
    row.dataset.renderedHtml = html;
  }
}

function renderMyNote() {
  const box = document.querySelector("#myNoteBox");
  if (!box) return;
  const question = currentQuestion();
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  const note = question && !examLocked ? questionNoteText(question.id) : "";
  box.hidden = !note;
  const text = document.querySelector("#myNoteText");
  if (text && text.textContent !== note) text.textContent = note;
}

function renderLabelReviews() {
  const host = document.querySelector("#labelReviews");
  if (!host) return;
  const counts = QUESTION_LABELS.map(([value, label]) => [value, label, labeledQuestions(value).length]);
  const any = counts.some(([, , count]) => count);
  const html = any
    ? counts.map(([value, label, count]) => `<button type="button" class="outline-btn" data-label-review="${value}" ${count ? "" : "disabled"}>${escapeHtml(label)} <small>${count}</small></button>`).join("")
    : '<p class="panel-line">Marque etiquetas nas questões (embaixo das alternativas) para estudá-las juntas aqui.</p>';
  if (host.dataset.renderedHtml !== html) {
    host.innerHTML = html;
    host.dataset.renderedHtml = html;
  }
}

(function setupQuestionLabels() {
  document.querySelector("#questionLabels")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question-label]");
    const question = currentQuestion();
    if (!button || !question) return;
    toggleQuestionLabel(question.id, button.dataset.questionLabel);
    renderQuestionLabels();
  });

  document.querySelector("#labelReviews")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-label-review]");
    if (!button || button.disabled) return;
    const value = button.dataset.labelReview;
    const label = (QUESTION_LABELS.find(([key]) => key === value) || [])[1] || value;
    const questions = labeledQuestions(value);
    startStudyRun(questions, { kind: "label", label: `Etiqueta: ${label}` });
  });

  document.querySelector("#myNoteEdit")?.addEventListener("click", () => {
    const input = document.querySelector("#noteInput");
    const details = input?.closest("details");
    if (details) details.open = true;
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
  });

  const baseRender = render;
  render = function renderWithLabels(...args) {
    const result = baseRender.apply(this, args);
    renderQuestionLabels();
    renderMyNote();
    if (!document.querySelector("#startPanel")?.hidden) renderLabelReviews();
    return result;
  };

  /* A anotação carregada da conta chega depois do render: atualiza o quadro. */
  const baseRenderQuestionDiscussion = renderQuestionDiscussion;
  renderQuestionDiscussion = function renderQuestionDiscussionWithNote(...args) {
    const result = baseRenderQuestionDiscussion.apply(this, args);
    renderMyNote();
    return result;
  };
})();
