/* Progresso persistente por tema: continuar pendentes, ver todas e acompanhar conclusão. */
(function setupPersistentTopicProgress() {
  const TOPIC_MODE_KEY = "banco-rmais-topic-mode";

  function topicSelectionKey(topics, mode = "all") {
    const cleanTopics = [...(topics || [])].map(String).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const subthemes = state.refineSubthemes ? [...(state.selectedSubthemes || [])].map(String).sort() : [];
    return `topic-progress:${mode}:${JSON.stringify({ topics: cleanTopics, subthemes })}`;
  }

  function topicStats(topic) {
    const questions = topicQuestions(topic);
    const answered = questions.filter((question) => Boolean(getProgress(question.id).grade));
    const remaining = Math.max(questions.length - answered.length, 0);
    const percent = questions.length ? Math.round((answered.length / questions.length) * 100) : 0;
    return { total: questions.length, answered: answered.length, remaining, percent };
  }

  function setSingleTopic(topic) {
    state.selectedTopics = [topic];
    localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics));
    renderTopicChecklist();
  }

  function startSelectedTopics(mode = "pending") {
    const topics = topicsForTopicMode();
    if (!topics.length) {
      if (el.topicModeLine) el.topicModeLine.textContent = "Selecione pelo menos um tema.";
      setTab("activity");
      return;
    }

    legacyStartTopic();

    if (mode === "pending") {
      state.filtered = state.filtered.filter((question) => !getProgress(question.id).grade);
      state.index = 0;
      state.filterKey = topicSelectionKey(topics, "pending");
      localStorage.setItem(TOPIC_MODE_KEY, "pending");
      if (!state.filtered.length) {
        if (el.topicModeLine) el.topicModeLine.textContent = "Tema concluído: não há questões pendentes neste recorte.";
        render();
        return;
      }
    } else {
      state.filterKey = topicSelectionKey(topics, "all");
      localStorage.setItem(TOPIC_MODE_KEY, "all");
      restorePosition(state.filterKey);
    }

    render();
  }

  function openTopic(topic, mode) {
    setSingleTopic(topic);
    startSelectedTopics(mode);
  }

  function renderTopicProgressPanel() {
    if (!el.topicModeLine || !state.questions.length) return;
    let panel = document.querySelector("#topicProgressPanel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "topicProgressPanel";
      panel.className = "topic-progress-panel";
      el.topicModeLine.insertAdjacentElement("afterend", panel);
    }

    const topics = allTopics();
    panel.innerHTML = `
      <div class="topic-progress-head">
        <div>
          <strong>Progresso por tema</strong>
          <span>Continue apenas as pendentes ou abra o banco completo do tema.</span>
        </div>
      </div>
      <div class="topic-progress-list">
        ${topics.map((topic) => {
          const stats = topicStats(topic);
          const doneClass = stats.remaining === 0 && stats.total ? " topic-complete" : "";
          return `
            <article class="topic-progress-item${doneClass}" data-topic-progress-item="${escapeHtml(topic)}">
              <div class="topic-progress-copy">
                <strong>${escapeHtml(topic)}</strong>
                <span>${stats.answered}/${stats.total} respondidas · ${stats.remaining} faltam · ${stats.percent}% concluído</span>
                <div class="topic-progress-track" aria-label="${stats.percent}% concluído"><i style="width:${stats.percent}%"></i></div>
              </div>
              <div class="topic-progress-actions">
                <button type="button" data-topic-continue="${escapeHtml(topic)}" ${stats.remaining === 0 ? "disabled" : ""}>Continuar pendentes</button>
                <button type="button" class="outline-btn" data-topic-all="${escapeHtml(topic)}">Ver todas</button>
              </div>
            </article>`;
        }).join("")}
      </div>`;

    panel.querySelectorAll("[data-topic-continue]").forEach((button) => {
      button.addEventListener("click", () => openTopic(button.dataset.topicContinue, "pending"));
    });
    panel.querySelectorAll("[data-topic-all]").forEach((button) => {
      button.addEventListener("click", () => openTopic(button.dataset.topicAll, "all"));
    });
  }

  const legacyRenderTopicChecklist = renderTopicChecklist;
  renderTopicChecklist = function renderTopicChecklistWithProgress() {
    const result = legacyRenderTopicChecklist();
    renderTopicProgressPanel();
    return result;
  };

  const legacyStartTopic = startTopic;

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

  renderTopicProgressPanel();
})();
