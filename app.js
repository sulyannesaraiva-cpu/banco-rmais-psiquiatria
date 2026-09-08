/* Bootstrap da aplicação: carrega o núcleo original e extensões isoladas. */
(async function bootstrapBancoRmais() {
  try {
    const [coreResponse, reviewResponse, topicProgressResponse, performanceResponse, sessionPersistenceResponse, maintenanceFlowResponse, editSaveFlowResponse, authSyncFlowResponse, excludedQuestionsResponse] = await Promise.all([
      fetch("app-core.js"),
      fetch("reviewExamFrequency.js"),
      fetch("topicProgress.js"),
      fetch("performanceOptimization.js"),
      fetch("sessionPersistence.js"),
      fetch("maintenanceFlowFix.js"),
      fetch("editSaveFlowFix.js"),
      fetch("authSyncFlowFix.js"),
      fetch("excludedQuestionsAdmin.js"),
    ]);

    if (!coreResponse.ok) throw new Error("Falha ao carregar app-core.js");
    if (!reviewResponse.ok) throw new Error("Falha ao carregar reviewExamFrequency.js");
    if (!topicProgressResponse.ok) throw new Error("Falha ao carregar topicProgress.js");
    if (!performanceResponse.ok) throw new Error("Falha ao carregar performanceOptimization.js");
    if (!sessionPersistenceResponse.ok) throw new Error("Falha ao carregar sessionPersistence.js");
    if (!maintenanceFlowResponse.ok) throw new Error("Falha ao carregar maintenanceFlowFix.js");
    if (!editSaveFlowResponse.ok) throw new Error("Falha ao carregar editSaveFlowFix.js");
    if (!authSyncFlowResponse.ok) throw new Error("Falha ao carregar authSyncFlowFix.js");
    if (!excludedQuestionsResponse.ok) throw new Error("Falha ao carregar excludedQuestionsAdmin.js");

    const [coreSource, reviewSource, topicProgressSource, performanceSource, sessionPersistenceSource, maintenanceFlowSource, editSaveFlowSource, authSyncFlowSource, excludedQuestionsSource] = await Promise.all([
      coreResponse.text(),
      reviewResponse.text(),
      topicProgressResponse.text(),
      performanceResponse.text(),
      sessionPersistenceResponse.text(),
      maintenanceFlowResponse.text(),
      editSaveFlowResponse.text(),
      authSyncFlowResponse.text(),
      excludedQuestionsResponse.text(),
    ]);

    const combinedScript = document.createElement("script");
    combinedScript.textContent = `${coreSource}\n\n${reviewSource}\n\n${topicProgressSource}\n\n${performanceSource}\n\n${sessionPersistenceSource}\n\n${maintenanceFlowSource}\n\n${editSaveFlowSource}\n\n${authSyncFlowSource}\n\n${excludedQuestionsSource}\n//# sourceURL=banco-rmais-app-bundle.js`;
    document.head.appendChild(combinedScript);
  } catch (error) {
    console.error("Erro ao iniciar Banco R+:", error);
    const sourceLabel = document.querySelector("#sourceLabel");
    const questionTitle = document.querySelector("#questionTitle");
    if (sourceLabel) sourceLabel.textContent = "Falha ao carregar aplicação";
    if (questionTitle) questionTitle.textContent = error.message;
  }
})();
