/* Bootstrap da aplicação: carrega o núcleo original junto com a extensão de frequência empírica por banca. */
(async function bootstrapBancoRmais() {
  try {
    const [coreResponse, reviewResponse] = await Promise.all([
      fetch("app-core.js"),
      fetch("reviewExamFrequency.js"),
    ]);

    if (!coreResponse.ok) throw new Error("Falha ao carregar app-core.js");
    if (!reviewResponse.ok) throw new Error("Falha ao carregar reviewExamFrequency.js");

    const [coreSource, reviewSource] = await Promise.all([
      coreResponse.text(),
      reviewResponse.text(),
    ]);

    const combinedScript = document.createElement("script");
    combinedScript.textContent = `${coreSource}\n\n${reviewSource}\n//# sourceURL=banco-rmais-app-bundle.js`;
    document.head.appendChild(combinedScript);
  } catch (error) {
    console.error("Erro ao iniciar Banco R+:", error);
    const sourceLabel = document.querySelector("#sourceLabel");
    const questionTitle = document.querySelector("#questionTitle");
    if (sourceLabel) sourceLabel.textContent = "Falha ao carregar aplicação";
    if (questionTitle) questionTitle.textContent = error.message;
  }
})();
