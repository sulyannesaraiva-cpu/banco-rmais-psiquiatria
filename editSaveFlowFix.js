/* Preserva a sessão ativa ao editar e salvar uma questão dentro de um bloco. */
(function setupEditSaveFlowFix() {
  if (!el.saveEdit) return;

  el.saveEdit.addEventListener("click", async (event) => {
    if (!hasActiveQuestionFlow()) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!state.isAdmin) return;
    const question = currentQuestion();
    if (!question) return;

    const originalIndex = state.index;
    const originalTab = state.activeTab;
    const originalFiltered = state.filtered;
    const originalFlags = {
      sessionActive: state.sessionActive,
      topicActive: state.topicActive,
      examActive: state.examActive,
      examSetActive: state.examSetActive,
      spacedReviewActive: state.spacedReviewActive,
      smartTrainingActive: state.smartTrainingActive,
      dangerousReviewActive: state.dangerousReviewActive,
    };

    const correction = collectEditor();
    const savedGlobally = await saveGlobalCorrection(question.id, correction);
    if (!savedGlobally) {
      state.corrections[question.id] = correction;
      saveCorrections();
    }

    // Restaura explicitamente o contexto do bloco e evita applyFilters(), que pode desmontar a fila.
    state.filtered = originalFiltered;
    state.index = Math.min(originalIndex, Math.max(state.filtered.length - 1, 0));
    Object.assign(state, originalFlags);
    state.activeTab = originalTab;
    state.editing = false;

    if (el.pendingReviewReason) {
      el.pendingReviewReason.textContent = correction.maintenanceFlagged
        ? "Pendências: sinalizada para manutenção."
        : "Edição salva.";
    }

    if (typeof saveActiveStudyState === "function") saveActiveStudyState();
    render();
  }, true);
})();
