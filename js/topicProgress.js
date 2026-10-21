/* Estudo de um tema ou subtema pela lista de temas:
   "Continuar" abre só as pendentes; "Ver todas" abre todas (e volta à última questão vista). */
(function setupPersistentTopicProgress() {
  const TOPIC_MODE_KEY = "banco-rmais-topic-mode";

  function topicSelectionKey(topics, mode = "all", subtheme = "") {
    const cleanTopics = [...(topics || [])].map(String).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return `topic-progress:${mode}:${JSON.stringify({ topics: cleanTopics, subthemes: subtheme ? [subtheme] : [] })}`;
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

  function topicQuestionList(topics, subtheme) {
    return topics.flatMap((topic) => {
      const questions = topicQuestions(topic);
      const inGroup = subtheme
        ? new Set((topicSubthemeGroups(topic, questions).find((group) => group.key === subtheme)?.questions || []).map((question) => question.id))
        : null;
      return questions.filter((question) => isReadyQuestion(effectiveQuestion(question)) && (!inGroup || inGroup.has(question.id)));
    });
  }

  /* Abre os temas pedidos (e, se houver, só um subtema) sem mexer nos temas marcados para o bloco. */
  function startSelectedTopics(mode = "pending", topics = topicsForTopicMode(), subtheme = "") {
    if (!topics.length) {
      if (el.topicModeLine) el.topicModeLine.textContent = "Selecione pelo menos um tema.";
      setTab("activity");
      return;
    }

    resetOtherStudyModes();
    state.topicActive = true;
    state.topicIds = topics;
    state.topicSubtheme = subtheme || "";
    state.activeAnswers = {};

    const allQuestions = topicQuestionList(topics, subtheme);
    const questions = mode === "pending"
      ? allQuestions.filter((question) => !getProgress(question.id).grade)
      : allQuestions;

    state.filtered = questions;
    state.filterKey = topicSelectionKey(topics, mode, subtheme);
    localStorage.setItem(TOPIC_MODE_KEY, mode);

    if (!questions.length) {
      state.index = 0;
      if (el.topicModeLine) {
        el.topicModeLine.textContent = mode === "pending"
          ? "Concluído: não há questões pendentes neste recorte."
          : "Nenhuma questão encontrada neste recorte.";
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

  /* Botões "Continuar" / "Ver todas" de cada tema e subtema (renderTopicChecklist no núcleo). */
  el.topicChecklist?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-run-topic]");
    if (!button || button.disabled) return;
    event.preventDefault();
    startSelectedTopics(button.dataset.runMode, [button.dataset.runTopic], button.dataset.runSubtheme);
  });

  /* Lembra quais temas estão com os subtemas abertos ("toggle" não borbulha: captura). */
  el.topicChecklist?.addEventListener("toggle", (event) => {
    const details = event.target.closest?.("[data-topic-subthemes]");
    if (!details) return;
    state.openTopicSubthemes ||= new Set();
    if (details.open) state.openTopicSubthemes.add(details.dataset.topicSubthemes);
    else state.openTopicSubthemes.delete(details.dataset.topicSubthemes);
  }, true);

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
      const scope = state.topicSubtheme ? `${topics.join(", ")} · ${state.topicSubtheme === OTHER_SUBTHEMES ? "Outros" : state.topicSubtheme}` : topics.join(", ");
      el.position.title = mode === "pending"
        ? `${state.filtered.length} questões pendentes neste recorte`
        : `${answeredInView} respondidas · ${remainingInView} faltam em ${scope}`;
    }
    return result;
  };
})();
