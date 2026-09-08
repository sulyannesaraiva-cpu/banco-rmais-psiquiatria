/* Bootstrap da aplicação: carrega o núcleo original e extensões isoladas. */
(async function bootstrapBancoRmais() {
  try {
    const [coreResponse, reviewResponse, topicProgressResponse, performanceResponse, sessionPersistenceResponse, maintenanceFlowResponse] = await Promise.all([
      fetch("app-core.js"),
      fetch("reviewExamFrequency.js"),
      fetch("topicProgress.js"),
      fetch("performanceOptimization.js"),
      fetch("sessionPersistence.js"),
      fetch("maintenanceFlowFix.js"),
    ]);

    if (!coreResponse.ok) throw new Error("Falha ao carregar app-core.js");
    if (!reviewResponse.ok) throw new Error("Falha ao carregar reviewExamFrequency.js");
    if (!topicProgressResponse.ok) throw new Error("Falha ao carregar topicProgress.js");
    if (!performanceResponse.ok) throw new Error("Falha ao carregar performanceOptimization.js");
    if (!sessionPersistenceResponse.ok) throw new Error("Falha ao carregar sessionPersistence.js");
    if (!maintenanceFlowResponse.ok) throw new Error("Falha ao carregar maintenanceFlowFix.js");

    const [coreSource, reviewSource, topicProgressSource, performanceSource, sessionPersistenceSource, maintenanceFlowSource] = await Promise.all([
      coreResponse.text(),
      reviewResponse.text(),
      topicProgressResponse.text(),
      performanceResponse.text(),
      sessionPersistenceResponse.text(),
      maintenanceFlowResponse.text(),
    ]);

    const combinedScript = document.createElement("script");
    combinedScript.textContent = `${coreSource}\n\n${reviewSource}\n\n${topicProgressSource}\n\n${performanceSource}\n\n${sessionPersistenceSource}\n\n${maintenanceFlowSource}\n//# sourceURL=banco-rmais-app-bundle.js`;
    document.head.appendChild(combinedScript);
  } catch (error) {
    console.error("Erro ao iniciar Banco R+:", error);
    const sourceLabel = document.querySelector("#sourceLabel");
    const questionTitle = document.querySelector("#questionTitle");
    if (sourceLabel) sourceLabel.textContent = "Falha ao carregar aplicação";
    if (questionTitle) questionTitle.textContent = error.message;
  }
})();
