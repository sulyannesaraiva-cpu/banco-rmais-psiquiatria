/* Cartões dos meus erros (Hoje > Outras revisões).
   - "Criar cartões": transforma de uma vez as questões erradas que ainda não viraram cartão em
     flashcards do deck "Meus cartões" (pergunta na frente; resposta e ponto-chave do comentário
     no verso). Eles entram vencidos na revisão espaçada de flashcards.
   - Opção de criar o cartão automaticamente a cada erro (inclusive ao corrigir um simulado). */

const AUTO_ERROR_CARDS_KEY = "banco-rmais-auto-error-cards";

state.autoErrorCards = localStorage.getItem(AUTO_ERROR_CARDS_KEY) === "on";
state.pendingErrorCards = new Map();

function wrongQuestionsWithoutCard() {
  return allStudyQuestions().filter((question) => {
    if (isExcluded(question.id) || getProgress(question.id).grade !== "wrong") return false;
    return isReadyQuestion(effectiveQuestion(question)) && !hasCustomCardFor(question);
  });
}

function renderErrorCards() {
  const line = document.querySelector("#errorCardsLine");
  const button = document.querySelector("#createErrorCardsBtn");
  const toggle = document.querySelector("#autoErrorCardsToggle");
  if (!line || !button) return;
  const missing = wrongQuestionsWithoutCard().length;
  const made = customFlashcardDeck()?.cards.length || 0;
  const text = missing
    ? `${pluralize(missing, "questão errada ainda não virou cartão", "questões erradas ainda não viraram cartão")}.${made ? ` Você já tem ${pluralize(made, "cartão", "cartões")} em "Meus cartões".` : ""}`
    : made
      ? `Todas as suas questões erradas já viraram cartão (${pluralize(made, "cartão", "cartões")} em "Meus cartões").`
      : "Quando você errar questões, elas podem virar flashcards da revisão espaçada.";
  if (line.textContent !== text) line.textContent = text;
  button.disabled = !missing;
  button.textContent = missing ? `Criar ${pluralize(missing, "cartão", "cartões")}` : "Criar cartões";
  if (toggle) toggle.checked = state.autoErrorCards;
}

function flushPendingErrorCards() {
  const questions = [...state.pendingErrorCards.values()];
  state.pendingErrorCards.clear();
  if (questions.length) createFlashcardsFromQuestions(questions);
}

(function setupErrorFlashcards() {
  document.querySelector("#createErrorCardsBtn")?.addEventListener("click", () => {
    const created = createFlashcardsFromQuestions(wrongQuestionsWithoutCard());
    render();
    const line = document.querySelector("#errorCardsLine");
    if (line && created) line.textContent = `${pluralize(created, "cartão criado", "cartões criados")}. Eles aparecem na revisão de flashcards (aba Flashcards > Meus cartões) e na tela Hoje.`;
  });

  document.querySelector("#autoErrorCardsToggle")?.addEventListener("change", (event) => {
    state.autoErrorCards = event.target.checked;
    localStorage.setItem(AUTO_ERROR_CARDS_KEY, state.autoErrorCards ? "on" : "off");
  });

  /* Cada erro salvo vira cartão no modo automático; junta os de uma mesma correção (simulado)
     para salvar e sincronizar uma vez só. */
  const baseSaveAttempt = saveAttempt;
  saveAttempt = function saveAttemptWithErrorCard(question, progress, ...rest) {
    const result = baseSaveAttempt.call(this, question, progress, ...rest);
    if (state.autoErrorCards && question && progress?.grade === "wrong" && !hasCustomCardFor(question)) {
      if (!state.pendingErrorCards.size) setTimeout(flushPendingErrorCards, 0);
      state.pendingErrorCards.set(question.id, question);
    }
    return result;
  };

  const baseRender = render;
  render = function renderWithErrorCards(...args) {
    const result = baseRender.apply(this, args);
    if (!document.querySelector("#startPanel")?.hidden) renderErrorCards();
    return result;
  };
})();
