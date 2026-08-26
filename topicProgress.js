/* Progresso persistente por tema: continuar pendentes, ver todas e acompanhar conclusão. */
(function setupPersistentTopicProgress() {
  const TOPIC_MODE_KEY = "banco-rmais-topic-mode";

  if (!document.querySelector("#topicProgressStyles")) {
    const style = document.createElement("style");
    style.id = "topicProgressStyles";
    style.textContent = `
      .topic-progress-panel{margin:12px 0 16px;min-width:0}
      .topic-progress-details{border:1px solid var(--border,#dfe3e8);border-radius:12px;background:var(--surface,#fff);overflow:hidden}
      .topic-progress-summary{cursor:pointer;list-style:none;padding:11px 12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px}
      .topic-progress-summary::-webkit-details-marker{display:none}
      .topic-progress-summary::after{content:"▾";font-size:.82rem;opacity:.65;transition:transform .15s ease}
      .topic-progress-details:not([open]) .topic-progress-summary::after{transform:rotate(-90deg)}
      .topic-progress-body{padding:0 10px 10px}
      .topic-progress-intro{display:block;margin:0 2px 9px;font-size:.78rem;line-height:1.35;opacity:.7}
      .topic-progress-list{display:grid;gap:8px;min-width:0}
      .topic-progress-item{display:block;min-width:0;padding:10px;border:1px solid var(--border,#dfe3e8);border-radius:10px;background:var(--surface,#fff)}
      .topic-progress-item.topic-complete{opacity:.78}
      .topic-progress-copy{min-width:0}
      .topic-progress-copy>strong{display:block;font-size:.9rem;line-height:1.25;overflow-wrap:anywhere}
      .topic-progress-copy>span{display:block;margin-top:4px;font-size:.76rem;line-height:1.3;opacity:.72}
      .topic-progress-track{height:5px;margin-top:8px;border-radius:999px;overflow:hidden;background:rgba(127,127,127,.18)}
      .topic-progress-track i{display:block;height:100%;background:currentColor;opacity:.55}
      .topic-progress-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;margin-top:9px;min-width:0}
      .topic-progress-actions button{min-width:0;width:100%;padding:7px 6px;font-size:.72rem;line-height:1.15;white-space:normal}
      @media(max-width:720px){.topic-progress-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

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

    if (mode === "all") {
      restorePosition(state.filterKey);
    } else {
      state.index = 0;
    }

    state.index = Math.min(state.index, questions.length - 1);
    setTab("activity");
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
    const answeredTotal = topics.reduce((sum, topic) => sum + topicStats(topic).answered, 0);
    const questionTotal = topics.reduce((sum, topic) => sum + topicStats(topic).total, 0);
    const openState = panel.querySelector("details")?.open || false;

    panel.innerHTML = `
      <details class="topic-progress-details" ${openState ? "open" : ""}>
        <summary class="topic-progress-summary">
          <span>Progresso por tema</span>
          <small>${answeredTotal}/${questionTotal}</small>
        </summary>
        <div class="topic-progress-body">
          <span class="topic-progress-intro">Veja quanto falta em cada tema e escolha entre continuar só as pendentes ou abrir todas.</span>
          <div class="topic-progress-list">
            ${topics.map((topic) => {
              const stats = topicStats(topic);
              const doneClass = stats.remaining === 0 && stats.total ? " topic-complete" : "";
              return `
                <article class="topic-progress-item${doneClass}">
                  <div class="topic-progress-copy">
                    <strong>${escapeHtml(topic)}</strong>
                    <span>${stats.answered}/${stats.total} feitas · ${stats.remaining} faltam · ${stats.percent}%</span>
                    <div class="topic-progress-track" aria-label="${stats.percent}% concluído"><i style="width:${stats.percent}%"></i></div>
                  </div>
                  <div class="topic-progress-actions">
                    <button type="button" data-topic-continue="${escapeHtml(topic)}" ${stats.remaining === 0 ? "disabled" : ""}>Continuar</button>
                    <button type="button" class="outline-btn" data-topic-all="${escapeHtml(topic)}">Ver todas</button>
                  </div>
                </article>`;
            }).join("")}
          </div>
        </div>
      </details>`;

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
