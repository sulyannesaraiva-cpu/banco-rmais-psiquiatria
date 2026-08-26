/* Bootstrap da aplicação: carrega o núcleo original e extensões isoladas. */
(async function bootstrapBancoRmais() {
  try {
    const [coreResponse, reviewResponse, topicProgressResponse] = await Promise.all([
      fetch("app-core.js"),
      fetch("reviewExamFrequency.js"),
      fetch("topicProgress.js"),
    ]);

    if (!coreResponse.ok) throw new Error("Falha ao carregar app-core.js");
    if (!reviewResponse.ok) throw new Error("Falha ao carregar reviewExamFrequency.js");
    if (!topicProgressResponse.ok) throw new Error("Falha ao carregar topicProgress.js");

    const [coreSource, reviewSource, topicProgressSource] = await Promise.all([
      coreResponse.text(),
      reviewResponse.text(),
      topicProgressResponse.text(),
    ]);

    const combinedScript = document.createElement("script");
    combinedScript.textContent = `${coreSource}\n\n${reviewSource}\n\n${topicProgressSource}\n//# sourceURL=banco-rmais-app-bundle.js`;
    document.head.appendChild(combinedScript);
  } catch (error) {
    console.error("Erro ao iniciar Banco R+:", error);
    const sourceLabel = document.querySelector("#sourceLabel");
    const questionTitle = document.querySelector("#questionTitle");
    if (sourceLabel) sourceLabel.textContent = "Falha ao carregar aplicação";
    if (questionTitle) questionTitle.textContent = error.message;
  }
})();
