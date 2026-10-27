/* Confirmar o tema de uma questão de prova com um clique (Administração).
   Nas questões com tema incerto (classificação automática com pouca confiança), aparece no topo
   da questão: o tema automático, até 3 sugestões como botões, "Outro tema" e "Pular". O tema
   escolhido vira o tema da questão para todos (correção publicada) e, na fila "Tema incerto",
   a próxima questão aparece em seguida. */

function topicConfirmTopics() {
  return [...new Set(allStudyQuestions().map((question) => topicForQuestion(question)))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

async function confirmQuestionTopic(question, topic) {
  const status = document.querySelector("#topicConfirmStatus");
  if (status) status.textContent = "Salvando…";
  const correction = { ...(state.globalCorrections[question.id] || {}), ...(state.corrections[question.id] || {}), studyTopic: topic };
  delete correction.reviewedAt;
  const saved = await saveGlobalCorrection(question.id, correction);
  if (!saved) {
    /* Sem conexão com a conta: guarda neste navegador, como o editor faz. */
    state.corrections[question.id] = correction;
    saveCorrections();
    clearClassificationCache();
  }
  if (el.status?.value === "uncertain-topic") applyFilters({ preserveCurrent: true });
  else render();
}

function renderTopicConfirm() {
  const box = document.querySelector("#topicConfirmAdmin");
  if (!box) return;
  const question = currentQuestion();
  const visible = Boolean(state.isAdmin && question && typeof hasUncertainStudyTopic === "function" && hasUncertainStudyTopic(question) && typeof examTopicSuggestions === "function");
  box.hidden = !visible;
  if (!visible) {
    box.dataset.renderedHtml = "";
    return;
  }
  const suggestions = examTopicSuggestions(question);
  const confidence = Math.round((examTopicConfidence(question) || 0) * 100);
  const others = topicConfirmTopics().filter((topic) => !suggestions.includes(topic));
  const html = `
    <div class="topic-confirm-head">
      <strong>Qual o tema desta questão?</strong>
      <span>Automático: ${escapeHtml(topicForQuestion(question))} (confiança ${confidence}%)</span>
    </div>
    <div class="topic-confirm-actions">
      ${suggestions.map((topic, index) => `<button type="button" class="${index === 0 ? "primary-btn" : "outline-btn"}" data-confirm-topic="${escapeHtml(topic)}">${escapeHtml(topic)}</button>`).join("")}
      <select data-confirm-other aria-label="Outro tema">
        <option value="">Outro tema…</option>
        ${others.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join("")}
      </select>
      <button type="button" class="link-btn" data-confirm-skip>Pular</button>
    </div>
    <small id="topicConfirmStatus" class="panel-line"></small>`;
  if (box.dataset.renderedHtml !== html) {
    box.innerHTML = html;
    box.dataset.renderedHtml = html;
  }
}

(function setupTopicConfirm() {
  const box = document.querySelector("#topicConfirmAdmin");
  if (!box) return;
  box.addEventListener("click", (event) => {
    const question = currentQuestion();
    if (!question) return;
    const button = event.target.closest("[data-confirm-topic]");
    if (button) {
      confirmQuestionTopic(question, button.dataset.confirmTopic);
      return;
    }
    if (event.target.closest("[data-confirm-skip]") && state.index < state.filtered.length - 1) {
      state.index += 1;
      render();
    }
  });
  box.addEventListener("change", (event) => {
    const select = event.target.closest("[data-confirm-other]");
    const question = currentQuestion();
    if (select?.value && question) confirmQuestionTopic(question, select.value);
  });

  const baseRender = render;
  render = function renderWithTopicConfirm(...args) {
    const result = baseRender.apply(this, args);
    renderTopicConfirm();
    return result;
  };
})();
