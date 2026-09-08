/* Persistência de sessões ativas de questões entre troca de aba, suspensão e recarregamento. */
(function setupSessionPersistence() {
  const SESSION_KEY = "banco-rmais-active-question-flow-v2";
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  let restoreAttempted = false;

  function activeMode() {
    if (state.topicActive) return "topic";
    if (state.sessionActive) return "session";
    if (state.spacedReviewActive) return "spaced-review";
    if (state.dangerousReviewActive) return "dangerous-review";
    if (state.smartTrainingActive) return "smart-training";
    return null;
  }

  function saveSnapshot() {
    const mode = activeMode();
    if (!mode || !Array.isArray(state.filtered) || !state.filtered.length) return;
    const snapshot = {
      version: 2,
      mode,
      activeTab: state.activeTab,
      filteredIds: state.filtered.map((question) => question.id).filter(Boolean),
      index: Math.max(0, Number(state.index || 0)),
      filterKey: state.filterKey || "",
      topicIds: [...(state.topicIds || [])],
      sessionIds: [...(state.sessionIds || [])],
      spacedReviewIds: [...(state.spacedReviewIds || [])],
      dangerousReviewIds: [...(state.dangerousReviewIds || [])],
      smartTrainingIds: [...(state.smartTrainingIds || [])],
      selectedTopics: Array.isArray(state.selectedTopics) ? [...state.selectedTopics] : [],
      selectedSubthemes: Array.isArray(state.selectedSubthemes) ? [...state.selectedSubthemes] : [],
      refineSubthemes: Boolean(state.refineSubthemes),
      activeAnswers: { ...(state.activeAnswers || {}) },
      updatedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  }

  function clearSnapshot() {
    localStorage.removeItem(SESSION_KEY);
  }

  function loadSnapshot() {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!saved || saved.version !== 2) return null;
      if (!saved.updatedAt || Date.now() - saved.updatedAt > MAX_AGE_MS) {
        clearSnapshot();
        return null;
      }
      if (!Array.isArray(saved.filteredIds) || !saved.filteredIds.length) return null;
      return saved;
    } catch {
      return null;
    }
  }

  function resetQuestionModes() {
    state.topicActive = false;
    state.topicIds = [];
    state.sessionActive = false;
    state.sessionIds = [];
    state.spacedReviewActive = false;
    state.spacedReviewIds = [];
    state.dangerousReviewActive = false;
    state.dangerousReviewIds = [];
    state.smartTrainingActive = false;
    state.smartTrainingIds = [];
    state.examActive = false;
    state.examSetActive = false;
  }

  function restoreSnapshot() {
    if (restoreAttempted) return;
    const saved = loadSnapshot();
    if (!saved) {
      restoreAttempted = true;
      return;
    }
    if (!state.questions.length && !state.exams.length) return;

    const questionMap = new Map(allStudyQuestions().map((question) => [question.id, question]));
    const questions = saved.filteredIds.map((id) => questionMap.get(id)).filter(Boolean);
    if (!questions.length) {
      clearSnapshot();
      restoreAttempted = true;
      return;
    }

    resetQuestionModes();
    state.filtered = questions;
    state.index = Math.min(Math.max(0, Number(saved.index || 0)), questions.length - 1);
    state.filterKey = saved.filterKey || "";
    state.activeAnswers = { ...(saved.activeAnswers || {}) };

    state.selectedTopics = Array.isArray(saved.selectedTopics) ? saved.selectedTopics : state.selectedTopics;
    state.selectedSubthemes = Array.isArray(saved.selectedSubthemes) ? saved.selectedSubthemes : state.selectedSubthemes;
    state.refineSubthemes = Boolean(saved.refineSubthemes);
    localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics || []));
    localStorage.setItem("banco-rmais-selected-subthemes", JSON.stringify(state.selectedSubthemes || []));
    localStorage.setItem("banco-rmais-refine-subthemes", String(state.refineSubthemes));

    if (saved.mode === "topic") {
      state.topicActive = true;
      state.topicIds = [...(saved.topicIds || saved.selectedTopics || [])];
    } else if (saved.mode === "session") {
      state.sessionActive = true;
      state.sessionIds = [...(saved.sessionIds || saved.filteredIds)];
    } else if (saved.mode === "spaced-review") {
      state.spacedReviewActive = true;
      state.spacedReviewIds = [...(saved.spacedReviewIds || saved.filteredIds)];
    } else if (saved.mode === "dangerous-review") {
      state.dangerousReviewActive = true;
      state.dangerousReviewIds = [...(saved.dangerousReviewIds || saved.filteredIds)];
    } else if (saved.mode === "smart-training") {
      state.smartTrainingActive = true;
      state.smartTrainingIds = [...(saved.smartTrainingIds || saved.filteredIds)];
    }

    const fallbackTab = saved.mode === "spaced-review" ? "today" : saved.mode === "dangerous-review" || saved.mode === "smart-training" ? "overview" : "activity";
    const safeTab = saved.activeTab && saved.activeTab !== "topics" ? saved.activeTab : fallbackTab;
    setTab(safeTab);
    render();
    restoreAttempted = true;
  }

  function scheduleRestore() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (state.questions.length || state.exams.length) {
        clearInterval(timer);
        setTimeout(restoreSnapshot, 250);
        return;
      }
      if (attempts >= 100) {
        clearInterval(timer);
        restoreAttempted = true;
      }
    }, 100);
  }

  function wrapEndFunction(name) {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function wrappedEndFunction(...args) {
      clearSnapshot();
      return original.apply(this, args);
    };
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveSnapshot();
  });
  window.addEventListener("pagehide", saveSnapshot);
  window.addEventListener("beforeunload", saveSnapshot);

  ["endTopic", "endSession", "endSpacedReview", "endDangerousReview", "endSmartTraining"].forEach(wrapEndFunction);

  scheduleRestore();
})();
