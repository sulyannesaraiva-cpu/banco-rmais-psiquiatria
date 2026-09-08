/* Impede que sincronizações de autenticação desmontem um bloco de questões ativo. */
(function setupAuthSyncFlowFix() {
  if (typeof loadCloudState !== "function") return;

  loadCloudState = async function loadCloudStatePreservingActiveFlow() {
    if (!state.authUser || !state.supabase) return;

    const activeContext = hasActiveQuestionFlow() && Array.isArray(state.filtered) && state.filtered.length
      ? {
          filtered: [...state.filtered],
          index: state.index,
          activeTab: state.activeTab,
          filterKey: state.filterKey,
          selectedTopics: Array.isArray(state.selectedTopics) ? [...state.selectedTopics] : [],
          selectedSubthemes: Array.isArray(state.selectedSubthemes) ? [...state.selectedSubthemes] : [],
          refineSubthemes: Boolean(state.refineSubthemes),
          activeAnswers: { ...(state.activeAnswers || {}) },
          topicActive: state.topicActive,
          topicIds: [...(state.topicIds || [])],
          sessionActive: state.sessionActive,
          sessionIds: [...(state.sessionIds || [])],
          smartTrainingActive: state.smartTrainingActive,
          smartTrainingIds: [...(state.smartTrainingIds || [])],
          spacedReviewActive: state.spacedReviewActive,
          spacedReviewIds: [...(state.spacedReviewIds || [])],
          dangerousReviewActive: state.dangerousReviewActive,
          dangerousReviewIds: [...(state.dangerousReviewIds || [])],
          examActive: state.examActive,
          examSimulationActive: state.examSimulationActive,
          examSetActive: state.examSetActive,
          examSetIds: [...(state.examSetIds || [])],
          activeExamId: state.activeExamId,
        }
      : null;

    setSyncStatus("Carregando progresso da conta...");
    const [{ data: progressRows, error: progressError }, { data: settingsRow, error: settingsError }] = await Promise.all([
      state.supabase.from("user_progress").select("question_id, progress"),
      state.supabase.from("user_settings").select("settings").eq("user_id", state.authUser.id).maybeSingle(),
    ]);

    if (progressError || settingsError) {
      setSyncStatus(`Erro ao carregar conta: ${(progressError || settingsError).message}`);
      return;
    }

    const cloudProgress = {};
    for (const row of progressRows || []) cloudProgress[row.question_id] = row.progress || {};
    state.progress = { ...state.progress, ...cloudProgress };
    localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));

    if (settingsRow?.settings) applySettingsPayload(settingsRow.settings);
    state.cloudReady = true;
    await Promise.all([syncProgressToCloud(), syncSettingsToCloud()]);
    setSyncStatus(state.isAdmin ? "Conta sincronizada. Perfil administrador." : "Conta sincronizada.");

    if (activeContext) {
      state.filtered = activeContext.filtered;
      state.index = Math.min(Math.max(0, Number(activeContext.index || 0)), Math.max(activeContext.filtered.length - 1, 0));
      state.activeTab = activeContext.activeTab;
      state.filterKey = activeContext.filterKey;
      state.selectedTopics = activeContext.selectedTopics;
      state.selectedSubthemes = activeContext.selectedSubthemes;
      state.refineSubthemes = activeContext.refineSubthemes;
      state.activeAnswers = activeContext.activeAnswers;
      state.topicActive = activeContext.topicActive;
      state.topicIds = activeContext.topicIds;
      state.sessionActive = activeContext.sessionActive;
      state.sessionIds = activeContext.sessionIds;
      state.smartTrainingActive = activeContext.smartTrainingActive;
      state.smartTrainingIds = activeContext.smartTrainingIds;
      state.spacedReviewActive = activeContext.spacedReviewActive;
      state.spacedReviewIds = activeContext.spacedReviewIds;
      state.dangerousReviewActive = activeContext.dangerousReviewActive;
      state.dangerousReviewIds = activeContext.dangerousReviewIds;
      state.examActive = activeContext.examActive;
      state.examSimulationActive = activeContext.examSimulationActive;
      state.examSetActive = activeContext.examSetActive;
      state.examSetIds = activeContext.examSetIds;
      state.activeExamId = activeContext.activeExamId;

      localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics || []));
      localStorage.setItem("banco-rmais-selected-subthemes", JSON.stringify(state.selectedSubthemes || []));
      localStorage.setItem("banco-rmais-refine-subthemes", String(state.refineSubthemes));

      renderTopics();
      render();
      if (typeof saveActiveStudyState === "function") saveActiveStudyState();
      return;
    }

    renderTopics();
    applyFilters({ preserveCurrent: true });
  };
})();
