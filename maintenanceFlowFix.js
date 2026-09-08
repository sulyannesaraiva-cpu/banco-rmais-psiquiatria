/* Mantém a sessão de estudo ao enviar uma questão para manutenção. */
(function setupMaintenanceBackgroundQueueFix() {
  if (!el.sendMaintenance) return;

  async function queueCurrentQuestionForMaintenance(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!state.isAdmin) return;
    const question = currentQuestion();
    if (!question) return;

    const current = state.corrections[question.id] || state.globalCorrections[question.id] || {};
    const correction = {
      ...current,
      maintenanceFlagged: true,
    };

    const savedGlobally = await saveGlobalCorrection(question.id, correction);
    if (!savedGlobally) {
      state.corrections[question.id] = correction;
      saveCorrections();
    }

    if (el.pendingReviewReason) {
      el.pendingReviewReason.textContent = "Pendências: sinalizada para manutenção.";
    }
    if (typeof setSyncStatus === "function") {
      setSyncStatus("Questão enviada para manutenção. Sua sessão foi mantida.");
    }

    // Mantém integralmente o fluxo de estudo atual: não altera aba, filtro,
    // fila, índice ou flags de sessão. Apenas atualiza o estado visual local.
    const effective = effectiveQuestion(question);
    if (el.pendingReviewPanel && state.isAdmin) {
      el.pendingReviewPanel.hidden = !needsBankReview(effective);
    }

    if (typeof saveActiveStudyState === "function") saveActiveStudyState();
  }

  el.sendMaintenance.addEventListener("click", queueCurrentQuestionForMaintenance, true);
})();
