/* Bootstrap da aplicação: carrega o núcleo original e extensões isoladas. */
(async function bootstrapBancoRmais() {
  try {
    /* Provas suplementares ficam isoladas para não reescrever os arquivos gigantes do banco principal. */
    await import("./data/unifespConcursos2025Loader.js");
    await import("./data/unifespPIA2025.js");
    await import("./data/unifespPsiquiatria2016.js");
    await import("./data/unifespPsiquiatria2018.js");
    await import("./data/enarePsiquiatria2027.js");

    /* SES-DF: carregamento resiliente, sem depender apenas da execução no HTML. */
    try {
      const expected = [0,1,2,3,4,5];
      const partNames = [1,2,3,4,6,7];
      const loadScript = (src) => new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Falha ao carregar " + src));
        document.head.appendChild(script);
      });
      for (let i=0;i<expected.length;i++) {
        if (typeof window.SESDF_DATA_PARTS?.[i] !== "string") {
          await loadScript("./data/sesdfDataPart" + partNames[i] + ".js?v=20261013-retry");
        }
      }
      if (!window.pako?.ungzip && typeof DecompressionStream === "undefined") {
        await loadScript("https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js");
      }
      if (!window.SESDF_EXTRA_EXAMS_READY || window.SESDF_LOAD_STATUS?.ok === false) {
        window.SESDF_EXTRA_EXAMS_READY = undefined;
        await loadScript("./data/sesdfLoader.js?v=20261013-retry");
      }
      await window.SESDF_EXTRA_EXAMS_READY;
      const loaded = window.BANCO_RMAIS_EXAMS?.exams?.filter(e => e.institution === "SES-DF") || [];
      if (loaded.length !== 2 || loaded.reduce((n,e)=>n+e.questions.length,0)!==220) {
        throw new Error("SES-DF incompleta após carregamento: " + loaded.length + " provas");
      }
      console.info("SES-DF validada: 2 provas / 220 questões");
    } catch (sesdfError) {
      window.SESDF_LOAD_STATUS={ok:false,error:String(sesdfError?.message || sesdfError)};
      console.error("SES-DF não carregada:", sesdfError);
    }

    /* Reorganização apenas da UNIFESP: Área passa a separar residência de não residência. */
    await import("./data/unifespProcessTypeOrganizer.js");

    const [coreResponse, reviewResponse, topicProgressResponse, performanceResponse, sessionPersistenceResponse, maintenanceFlowResponse, editSaveFlowResponse, authSyncFlowResponse, excludedQuestionsResponse] = await Promise.all([
      fetch("app-core.js"), fetch("reviewExamFrequency.js"), fetch("topicProgress.js?v=20261007-topic2"), fetch("performanceOptimization.js"), fetch("sessionPersistence.js"), fetch("maintenanceFlowFix.js"), fetch("editSaveFlowFix.js"), fetch("authSyncFlowFix.js"), fetch("excludedQuestionsAdmin.js"),
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
    if (window.UNIFESP_EXTRA_EXAMS_READY) await window.UNIFESP_EXTRA_EXAMS_READY;
    const [coreSource, reviewSource, topicProgressSource, performanceSource, sessionPersistenceSource, maintenanceFlowSource, editSaveFlowSource, authSyncFlowSource, excludedQuestionsSource] = await Promise.all([coreResponse.text(), reviewResponse.text(), topicProgressResponse.text(), performanceResponse.text(), sessionPersistenceResponse.text(), maintenanceFlowResponse.text(), editSaveFlowResponse.text(), authSyncFlowResponse.text(), excludedQuestionsResponse.text()]);
    const combinedScript = document.createElement("script");
    combinedScript.textContent = `${coreSource}\n\n${reviewSource}\n\n${topicProgressSource}\n\n${performanceSource}\n\n${sessionPersistenceSource}\n\n${maintenanceFlowSource}\n\n${editSaveFlowSource}\n\n${authSyncFlowSource}\n\n${excludedQuestionsSource}\n//# sourceURL=banco-rmais-app-bundle.js`;
    document.head.appendChild(combinedScript);
    await import("./data/globalBankCounter.js");
  } catch (error) {
    console.error("Erro ao iniciar Banco R+:", error);
    const sourceLabel = document.querySelector("#sourceLabel"); const questionTitle = document.querySelector("#questionTitle");
    if (sourceLabel) sourceLabel.textContent = "Falha ao carregar aplicação";
    if (questionTitle) questionTitle.textContent = error.message;
  }
})();
