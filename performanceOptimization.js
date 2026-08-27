/* Otimizações de renderização: evita recomputações analíticas pesadas durante fluxos ativos de questões. */
(function setupRenderPerformanceOptimization() {
  const legacyRenderStats = renderStats;
  const legacyRenderDashboard = renderDashboard;

  function heavyAnalyticsVisible() {
    return ["overview", "today", "history", "activity", "exams", "notes", "flashcards"].includes(state.activeTab);
  }

  renderStats = function renderStatsOptimized() {
    if (hasActiveQuestionFlow()) return;
    return legacyRenderStats();
  };

  renderDashboard = function renderDashboardOptimized() {
    if (hasActiveQuestionFlow()) return;
    if (!heavyAnalyticsVisible()) return;
    return legacyRenderDashboard();
  };
})();
