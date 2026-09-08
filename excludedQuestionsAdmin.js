/* Exclusão administrativa reversível de questões fora do escopo da Psiquiatria. */
(function setupExcludedQuestionsAdmin() {
  const editorPanel = document.querySelector("#editorPanel");
  const editorActions = editorPanel?.querySelector(".editor-actions");
  const adminPanel = document.querySelector("#topicsPanel .panel-section");
  if (!editorActions || !adminPanel) return;

  const deleteButton = document.createElement("button");
  deleteButton.id = "excludeFromEditorBtn";
  deleteButton.type = "button";
  deleteButton.className = "danger-btn";
  deleteButton.textContent = "Excluir questão";
  deleteButton.title = "Retirar esta questão do banco de estudo e enviar para Questões excluídas";
  editorActions.appendChild(deleteButton);

  const excludedSection = document.createElement("section");
  excludedSection.className = "admin-excluded-section";
  excludedSection.innerHTML = `
    <div class="admin-subsection-head">
      <div>
        <h3>Questões excluídas</h3>
        <p class="panel-line">Questões retiradas do banco de estudo por não pertencerem ao escopo da Psiquiatria. A exclusão é reversível.</p>
      </div>
      <strong id="excludedAdminCount">0</strong>
    </div>
    <input id="excludedAdminSearch" type="search" placeholder="Buscar por prova, tema ou enunciado" />
    <div id="excludedAdminList" class="excluded-admin-list"></div>
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
    const query = normalize(searchEl.value || "");
    const allExcluded = excludedQuestions();
    const visible = allExcluded.filter((question) => {
      if (!query) return true;
      const haystack = normalize(`${questionLabel(question)} ${question.topic || ""} ${question.text || ""}`);
      return haystack.includes(query);
    });
    countEl.textContent = String(allExcluded.length);
    listEl.innerHTML = visible.length
      ? visible.map((question) => `
          <article class="excluded-admin-item">
            <div>
              <strong>${escapeHtml(questionLabel(question))}</strong>
              <small>${escapeHtml(question.topic || topicForQuestion(question) || "Sem tema")}</small>
              <p>${escapeHtml((question.text || "").slice(0, 280))}${(question.text || "").length > 280 ? "…" : ""}</p>
            </div>
            <button type="button" class="restore-excluded-btn" data-restore-excluded="${escapeHtml(question.id)}">Restaurar</button>
          </article>
        `).join("")
      : `<p class="panel-line">${allExcluded.length ? "Nenhuma questão excluída corresponde à busca." : "Nenhuma questão excluída."}</p>`;
  }

  function removeFromActiveQueue(questionId) {
    const oldIndex = state.index;
    state.filtered = (state.filtered || []).filter((question) => question.id !== questionId);
    state.sessionIds = (state.sessionIds || []).filter((id) => id !== questionId);
    state.topicIds = (state.topicIds || []).filter((id) => id !== questionId);
    state.spacedReviewIds = (state.spacedReviewIds || []).filter((id) => id !== questionId);
    state.dangerousReviewIds = (state.dangerousReviewIds || []).filter((id) => id !== questionId);
    state.smartTrainingIds = (state.smartTrainingIds || []).filter((id) => id !== questionId);
    state.examSetIds = (state.examSetIds || []).filter((id) => id !== questionId);
    state.index = Math.min(oldIndex, Math.max(state.filtered.length - 1, 0));
  }

  deleteButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!state.isAdmin) return;
    const question = currentQuestion();
    if (!question) return;
    const confirmed = window.confirm("Excluir esta questão do banco de estudo? Ela será enviada para Administração > Questões excluídas e poderá ser restaurada depois.");
    if (!confirmed) return;

    if (!state.excluded.includes(question.id)) state.excluded.push(question.id);
    saveExcluded();
    state.editing = false;
    removeFromActiveQueue(question.id);
    if (typeof saveActiveStudyState === "function") saveActiveStudyState();
    if (typeof setSyncStatus === "function") setSyncStatus("Questão excluída do banco de estudo. Ela pode ser restaurada em Administração > Questões excluídas.");
    renderExcludedAdmin();

    if (state.filtered.length && hasActiveQuestionFlow()) render();
    else applyFilters({ preserveCurrent: true });
  }, true);

  listEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-restore-excluded]");
    if (!button || !state.isAdmin) return;
    const questionId = button.dataset.restoreExcluded;
    state.excluded = (state.excluded || []).filter((id) => id !== questionId);
    saveExcluded();
    if (typeof setSyncStatus === "function") setSyncStatus("Questão restaurada ao banco de estudo.");
    renderExcludedAdmin();
    renderTopics();
  });

  searchEl.addEventListener("input", renderExcludedAdmin);

  const originalRenderAdminAccess = typeof renderAdminAccess === "function" ? renderAdminAccess : null;
  if (originalRenderAdminAccess) {
    renderAdminAccess = function renderAdminAccessWithExcluded(...args) {
      const result = originalRenderAdminAccess.apply(this, args);
      renderExcludedAdmin();
      return result;
    };
  }

  document.querySelectorAll('[data-tab="topics"]').forEach((button) => {
    button.addEventListener("click", () => setTimeout(renderExcludedAdmin, 0));
  });

  renderExcludedAdmin();
})();
