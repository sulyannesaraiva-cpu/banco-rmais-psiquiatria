/* Persistência robusta de sessões ativas entre troca de aba, suspensão, descarte e recarregamento. */
(function setupSessionPersistence() {
  const SESSION_KEY = "banco-rmais-active-question-flow-v3";
  const LEGACY_SESSION_KEY = "banco-rmais-active-question-flow-v2";
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const STARTUP_GUARD_MS = 20000;
  const startupDeadline = Date.now() + STARTUP_GUARD_MS;

  function activeMode() {
    if (state.examSimulationActive) return "exam-simulation";
    if (state.examSetActive) return "exam-set";
    if (state.examActive) return "exam";
    if (state.topicActive) return "topic";
    if (state.sessionActive) return "session";
    if (state.spacedReviewActive) return "spaced-review";
    if (state.dangerousReviewActive) return "dangerous-review";
    if (state.smartTrainingActive) return "smart-training";
    return null;
  }

  function hasActiveFlow() {
    return Boolean(activeMode());
  }

  function currentQuestionId() {
    return state.filtered?.[Math.max(0, Number(state.index || 0))]?.id || "";
  }

  function saveSnapshot() {
    const mode = activeMode();
    if (!mode || !Array.isArray(state.filtered) || !state.filtered.length) return false;

    const snapshot = {
      version: 3,
      mode,
      activeTab: state.activeTab,
      filteredIds: state.filtered.map((question) => question.id).filter(Boolean),
      currentQuestionId: currentQuestionId(),
      index: Math.max(0, Number(state.index || 0)),
      filterKey: state.filterKey || "",
      topicIds: [...(state.topicIds || [])],
      sessionIds: [...(state.sessionIds || [])],
      spacedReviewIds: [...(state.spacedReviewIds || [])],
      dangerousReviewIds: [...(state.dangerousReviewIds || [])],
      smartTrainingIds: [...(state.smartTrainingIds || [])],
      examSetIds: [...(state.examSetIds || [])],
      activeExamId: state.activeExamId || "",
      examSimulationFinished: Boolean(state.examSimulationFinished),
      examSimulationStartedAt: state.examSimulationStartedAt || null,
      examSimulationElapsedMs: Number(state.examSimulationElapsedMs || 0),
      examSimulationErrorIds: [...(state.examSimulationErrorIds || [])],
      examSimulationAnswers: { ...(state.examSimulationAnswers || {}) },
      selectedTopics: Array.isArray(state.selectedTopics) ? [...state.selectedTopics] : [],
      selectedSubthemes: Array.isArray(state.selectedSubthemes) ? [...state.selectedSubthemes] : [],
      refineSubthemes: Boolean(state.refineSubthemes),
      activeAnswers: { ...(state.activeAnswers || {}) },
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.warn("Não foi possível salvar a sessão ativa.", error);
      return false;
    }
  }

  function clearSnapshot() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }

  function loadSnapshot() {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
      const saved = JSON.parse(raw || "null");
      if (!saved || ![2, 3].includes(saved.version)) return null;
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
    state.examSimulationActive = false;
    state.examSetActive = false;
    state.examSetIds = [];
  }

  function fallbackTabFor(mode) {
    if (mode === "exam" || mode === "exam-set" || mode === "exam-simulation") return "exams";
    if (mode === "spaced-review") return "today";
    if (mode === "dangerous-review" || mode === "smart-training") return "overview";
    return "activity";
  }

  function restoreSnapshot(options = {}) {
    const saved = loadSnapshot();
    if (!saved) return false;
    if (!state.questions.length && !state.exams.length) return false;

    const force = Boolean(options.force);
    if (!force && hasActiveFlow() && Array.isArray(state.filtered) && state.filtered.length) return false;

    const questionMap = new Map(allStudyQuestions().map((question) => [question.id, question]));
    const questions = saved.filteredIds.map((id) => questionMap.get(id)).filter(Boolean);
    if (!questions.length) {
      clearSnapshot();
      return false;
    }

    resetQuestionModes();
    state.filtered = questions;
    state.filterKey = saved.filterKey || "";
    state.activeAnswers = { ...(saved.activeAnswers || {}) };

    let restoredIndex = Math.min(Math.max(0, Number(saved.index || 0)), questions.length - 1);
    if (saved.currentQuestionId) {
      const questionIndex = questions.findIndex((question) => question.id === saved.currentQuestionId);
      if (questionIndex >= 0) restoredIndex = questionIndex;
    }
    state.index = restoredIndex;

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
    } else if (saved.mode === "exam-set") {
      state.examSetActive = true;
      state.examSetIds = [...(saved.examSetIds || saved.filteredIds)];
    } else if (saved.mode === "exam") {
      state.examActive = true;
      state.activeExamId = saved.activeExamId || state.activeExamId || "";
    } else if (saved.mode === "exam-simulation") {
      state.examActive = true;
      state.examSimulationActive = true;
      state.activeExamId = saved.activeExamId || state.activeExamId || "";
      state.examSimulationFinished = Boolean(saved.examSimulationFinished);
      state.examSimulationStartedAt = saved.examSimulationStartedAt || null;
      state.examSimulationElapsedMs = Number(saved.examSimulationElapsedMs || 0);
      state.examSimulationErrorIds = [...(saved.examSimulationErrorIds || [])];
      state.examSimulationAnswers = { ...(saved.examSimulationAnswers || {}) };
    }

    const fallbackTab = fallbackTabFor(saved.mode);
    const safeTab = saved.activeTab && saved.activeTab !== "topics" ? saved.activeTab : fallbackTab;
    setTab(safeTab);
    render();
    saveSnapshot();
    return true;
  }

  function restoreIfNeeded() {
    const saved = loadSnapshot();
    if (!saved) return false;
    const currentMissing = !Array.isArray(state.filtered) || !state.filtered.length;
    if (!hasActiveFlow() || currentMissing) return restoreSnapshot({ force: true });
    return false;
  }

  // O núcleo já chama saveActiveStudyState ao responder/mudar de questão.
  // Aproveitamos esse ponto para manter nosso snapshot atualizado imediatamente.
  if (typeof saveActiveStudyState === "function") {
    const originalSaveActiveStudyState = saveActiveStudyState;
    saveActiveStudyState = function persistentSaveActiveStudyState(...args) {
      const result = originalSaveActiveStudyState.apply(this, args);
      saveSnapshot();
      return result;
    };
  }

  // Se o núcleo encerrar uma prova/simulado, remove também o snapshot ampliado.
  if (typeof clearActiveStudyState === "function") {
    const originalClearActiveStudyState = clearActiveStudyState;
    clearActiveStudyState = function persistentClearActiveStudyState(...args) {
      clearSnapshot();
      return originalClearActiveStudyState.apply(this, args);
    };
  }

  // Os botões de encerramento de bloco foram vinculados antes desta extensão;
  // usamos captura apenas para limpar o snapshot antes do handler original.
  [el.endTopic, el.endSession, el.finishSession, el.endSpacedReview, el.endDangerousReview]
    .filter(Boolean)
    .forEach((button) => button.addEventListener("click", clearSnapshot, true));

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveSnapshot();
    } else {
      setTimeout(restoreIfNeeded, 80);
      setTimeout(restoreIfNeeded, 500);
    }
  });

  window.addEventListener("blur", saveSnapshot);
  window.addEventListener("focus", () => {
    setTimeout(restoreIfNeeded, 80);
    setTimeout(restoreIfNeeded, 500);
  });
  window.addEventListener("pagehide", saveSnapshot);
  window.addEventListener("pageshow", () => setTimeout(restoreIfNeeded, 100));
  window.addEventListener("beforeunload", saveSnapshot);
  document.addEventListener("freeze", saveSnapshot);
  document.addEventListener("resume", () => setTimeout(restoreIfNeeded, 100));

  // Salva periodicamente enquanto a sessão está ativa. Isso protege contra
  // descarte abrupto da aba, quando pagehide/beforeunload podem não ocorrer.
  setInterval(() => {
    if (hasActiveFlow()) saveSnapshot();
  }, 1500);

  // Durante a inicialização, autenticação e sincronização podem redesenhar a
  // aplicação depois da primeira restauração. Reaplicamos a sessão por alguns
  // segundos sempre que ela tiver sido apagada pelo bootstrap.
  const startupGuard = setInterval(() => {
    restoreIfNeeded();
    if (Date.now() >= startupDeadline) clearInterval(startupGuard);
  }, 300);

  setTimeout(restoreIfNeeded, 100);
})();
