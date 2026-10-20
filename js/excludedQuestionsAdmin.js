/* Exclusão administrativa reversível e global de questões fora do escopo da Psiquiatria. */
(function setupExcludedQuestionsAdmin() {
  const editorPanel = document.querySelector("#editorPanel");
  const editorActions = editorPanel?.querySelector(".editor-actions");
  const adminPanel = document.querySelector("#topicsPanel .panel-section");
  if (!editorActions || !adminPanel) return;

  function syncGlobalExclusionsIntoState() {
    const globalIds = Object.entries(state.globalCorrections || {})
      .filter(([, correction]) => Boolean(correction?.excluded))
      .map(([questionId]) => questionId);
    state.excluded = [...new Set([...(state.excluded || []), ...globalIds])];
    saveExcluded();
  }
  syncGlobalExclusionsIntoState();

  const deleteButton = document.createElement("button");
  deleteButton.id = "excludeFromEditorBtn";
  deleteButton.type = "button";
  deleteButton.className = "danger-lite";
  deleteButton.textContent = "Excluir questão";
  deleteButton.title = "Retirar esta questão do banco de estudo e enviar para Questões excluídas";
  editorActions.appendChild(deleteButton);

  const excludedSection = document.createElement("section");
  excludedSection.className = "study-section admin-excluded-section";
  excludedSection.innerHTML = `
    <div>
      <h3>Questões excluídas <span id="excludedAdminCount">0</span></h3>
      <p class="panel-line">Questões retiradas do banco por não pertencerem ao escopo da Psiquiatria. A exclusão vale para todos os usuários e pode ser revertida.</p>
    </div>
    <label class="field compact-field">
      <span>Buscar nas excluídas</span>
      <input id="excludedAdminSearch" type="search" placeholder="prova, tema ou enunciado" />
    </label>
    <div id="excludedAdminList" class="history-list"></div>
  `;
  adminPanel.appendChild(excludedSection);

  const countEl = excludedSection.querySelector("#excludedAdminCount");
  const searchEl = excludedSection.querySelector("#excludedAdminSearch");
  const listEl = excludedSection.querySelector("#excludedAdminList");

  function excludedQuestions() {
    const ids = new Set(state.excluded || []);
    return allStudyQuestions().filter((question) => ids.has(question.id));
  }

  function questionLabel(question) {
    const source = question.examTag || question.source || question.institution || "Banco";
    const number = question.number ? ` · Questão ${question.number}` : "";
    return `${source}${number}`;
  }

  function renderExcludedAdmin() {
    if (!state.isAdmin) {
      excludedSection.hidden = true;
      return;
    }
    excludedSection.hidden = false;
    syncGlobalExclusionsIntoState();
    const query = normalize(searchEl.value || "");
    const allExcluded = excludedQuestions();
    const visible = allExcluded.filter((question) => {
      if (!query) return true;
      return normalize(`${questionLabel(question)} ${question.topic || ""} ${question.text || ""}`).includes(query);
    });
    countEl.textContent = `(${allExcluded.length})`;
    listEl.innerHTML = visible.length
      ? visible.map((question) => `
          <div class="history-item">
            <div>
              <strong>${escapeHtml(questionLabel(question))}</strong>
              <span>${escapeHtml(question.topic || topicForQuestion(question) || "Sem tema")}</span>
              <small>${escapeHtml((question.text || "").slice(0, 240))}${(question.text || "").length > 240 ? "…" : ""}</small>
            </div>
            <button type="button" data-restore-excluded="${escapeHtml(question.id)}">Restaurar</button>
          </div>
        `).join("")
      : `<p class="panel-line">${allExcluded.length ? "Nenhuma questão excluída corresponde à busca." : "Nenhuma questão excluída."}</p>`;
  }

  function removeFromActiveQueue(questionId) {
    const oldIndex = state.index;
    state.filtered = (state.filtered || []).filter((question) => question.id !== questionId);
    state.sessionIds = (state.sessionIds || []).filter((id) => id !== questionId);
    state.spacedReviewIds = (state.spacedReviewIds || []).filter((id) => id !== questionId);
    state.dangerousReviewIds = (state.dangerousReviewIds || []).filter((id) => id !== questionId);
    state.smartTrainingIds = (state.smartTrainingIds || []).filter((id) => id !== questionId);
    state.examSetIds = (state.examSetIds || []).filter((id) => id !== questionId);
    state.index = Math.min(oldIndex, Math.max(state.filtered.length - 1, 0));
  }

  deleteButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!state.isAdmin) return;
    const question = currentQuestion();
    if (!question) return;
    if (!window.confirm("Excluir esta questão do banco? Ela deixará de aparecer para todos os usuários e ficará disponível em Administração > Questões excluídas para restauração.")) return;

    const current = state.globalCorrections[question.id] || state.corrections[question.id] || {};
    const correction = { ...current, excluded: true };
    const savedGlobally = await saveGlobalCorrection(question.id, correction);
    if (!savedGlobally) {
      setSyncStatus("Não foi possível excluir globalmente. Tente novamente.");
      return;
    }
    state.globalCorrections[question.id] = correction;
    if (!state.excluded.includes(question.id)) state.excluded.push(question.id);
    saveExcluded();
    state.editing = false;
    removeFromActiveQueue(question.id);
    if (typeof saveActiveStudyState === "function") saveActiveStudyState();
    setSyncStatus("Questão excluída do banco e enviada para Administração > Questões excluídas.");
    renderExcludedAdmin();
    if (state.filtered.length && hasActiveQuestionFlow()) render();
    else applyFilters({ preserveCurrent: true });
  }, true);

  listEl.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-restore-excluded]");
    if (!button || !state.isAdmin) return;
    const questionId = button.dataset.restoreExcluded;
    const current = state.globalCorrections[questionId] || {};
    const correction = { ...current, excluded: false };
    const savedGlobally = await saveGlobalCorrection(questionId, correction);
    if (!savedGlobally) {
      setSyncStatus("Não foi possível restaurar a questão. Tente novamente.");
      return;
    }
    state.globalCorrections[questionId] = correction;
    state.excluded = (state.excluded || []).filter((id) => id !== questionId);
    saveExcluded();
    setSyncStatus("Questão restaurada ao banco de estudo para todos os usuários.");
    renderExcludedAdmin();
    renderTopics();
  });

  searchEl.addEventListener("input", renderExcludedAdmin);
  document.querySelectorAll('[data-tab="topics"]').forEach((button) => button.addEventListener("click", () => setTimeout(renderExcludedAdmin, 0)));
  renderExcludedAdmin();
})();
