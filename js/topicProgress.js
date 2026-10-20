/* Estudo de um tema: "Continuar" abre só as pendentes daquele tema. */
(function setupPersistentTopicProgress() {
  const TOPIC_MODE_KEY = "banco-rmais-topic-mode";

  function topicSelectionKey(topics, mode = "all") {
    const cleanTopics = [...(topics || [])].map(String).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return `topic-progress:${mode}:${JSON.stringify({ topics: cleanTopics, subthemes: [] })}`;
  }

  function setSingleTopic(topic) {
    state.selectedTopics = [topic];
    localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics));
  }

  function resetOtherStudyModes() {
    state.sessionActive = false;
    state.sessionIds = [];
    state.examActive = false;
    clearExamSimulationState();
    state.examSetActive = false;
    state.examSetIds = [];
    state.spacedReviewActive = false;
    state.spacedReviewIds = [];
    state.smartTrainingActive = false;
    state.smartTrainingIds = [];
    state.dangerousReviewActive = false;
    state.dangerousReviewIds = [];
  }

  function selectedTopicQuestionList() {
    return selectedContentQuestions().slice();
  }

  function startSelectedTopics(mode = "pending") {
    const topics = topicsForTopicMode();
    if (!topics.length) {
      if (el.topicModeLine) el.topicModeLine.textContent = "Selecione pelo menos um tema.";
      setTab("activity");
      return;
    }

    resetOtherStudyModes();
    state.topicActive = true;
    state.topicIds = topics;
    state.activeAnswers = {};

    const allQuestions = selectedTopicQuestionList();
    const questions = mode === "pending"
      ? allQuestions.filter((question) => !getProgress(question.id).grade)
      : allQuestions;

    state.filtered = questions;
    state.filterKey = topicSelectionKey(topics, mode);
    localStorage.setItem(TOPIC_MODE_KEY, mode);

    if (!questions.length) {
      state.index = 0;
      if (el.topicModeLine) {
        el.topicModeLine.textContent = mode === "pending"
          ? "Tema concluído: não há questões pendentes neste recorte."
          : "Nenhuma questão encontrada para este tema.";
      }
      setTab("activity");
      render();
      return;
    }

    if (mode === "all") restorePosition(state.filterKey);
    else state.index = 0;

    state.index = Math.min(state.index, questions.length - 1);
    setTab("activity");
    render();
  }

  function openTopic(topic, mode) {
    setSingleTopic(topic);
    startSelectedTopics(mode);
  }

  /* "Continuar" fica em cada linha da lista de temas (renderTopicChecklist no núcleo). */
  el.topicChecklist?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-continue]");
    if (!button || button.disabled) return;
    event.preventDefault();
    openTopic(button.dataset.topicContinue, "pending");
  });

  if (el.startTopic) {
    el.startTopic.textContent = "Continuar pendentes";
    el.startTopic.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      startSelectedTopics("pending");
    }, true);
  }

  const legacyRender = render;
  render = function renderWithTopicProgress() {
    const result = legacyRender();
    if (state.topicActive && el.position && state.filtered.length) {
      const topics = state.topicIds || [];
      const mode = localStorage.getItem(TOPIC_MODE_KEY) || "all";
      const answeredInView = state.filtered.filter((question) => Boolean(getProgress(question.id).grade)).length;
      const remainingInView = Math.max(state.filtered.length - answeredInView, 0);
      el.position.title = mode === "pending"
        ? `${state.filtered.length} questões pendentes neste recorte`
        : `${answeredInView} respondidas · ${remainingInView} faltam em ${topics.join(", ")}`;
    }
    return result;
  };
})();