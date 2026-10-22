/* Flashcards de hoje: uma fila única que junta os cartões vencidos de todos os decks e alguns
   cartões novos por dia (limite configurável na aba Flashcards: 0, 10, 20 ou 30). Os novos são
   escolhidos pelos assuntos que mais caem na prova do plano e pelos seus pontos fracos, variando
   os temas. Antes, "Revisar flashcards" abria só o deck do primeiro cartão vencido e os cartões
   novos nunca entravam no estudo do dia.
   - Tela Hoje: a linha de flashcards e o "Continuar" depois do bloco de questões abrem esta fila.
   - Aba Flashcards: cada deck mostra "X novos · Y para revisar". */

const FLASHCARD_NEW_LIMIT_KEY = "banco-rmais-flashcard-new-per-day";
const FLASHCARD_SESSION_KEY = "banco-rmais-flashcard-session";
const FLASHCARD_NEW_OPTIONS = [0, 10, 20, 30];
const FLASHCARD_REVIEW_CAP = 100;

state.flashcardNewPerDay = (() => {
  const raw = localStorage.getItem(FLASHCARD_NEW_LIMIT_KEY);
  const saved = raw === null ? NaN : Number(raw);
  return FLASHCARD_NEW_OPTIONS.includes(saved) ? saved : 10;
})();
state.flashcardSession = readStoredJson(FLASHCARD_SESSION_KEY, null);
if (state.flashcardSession && state.flashcardSession.date !== localDayKey()) state.flashcardSession = null;

function isNewFlashcard(cardId) {
  const progress = state.flashcardProgress[cardId];
  return !progress || (!progress.reviewedAt && !progress.nextReviewAt && !progress.lastGrade);
}

function isTodayIso(value) {
  return Boolean(value) && localDayKey(new Date(value)) === localDayKey();
}

/* Cartões novos já estudados hoje (contam no limite diário). */
function newFlashcardsStudiedToday() {
  return Object.values(state.flashcardProgress || {}).filter((progress) => isTodayIso(progress?.firstSeenAt)).length;
}

function flashcardItemSubtheme(item) {
  return typeof flashcardSubtheme === "function" ? flashcardSubtheme(item) : item.deck.title;
}

/* Novos cartões do dia: frequência do assunto na prova do plano + pontos fracos + importância,
   no máximo um terço do limite por assunto. */
function pickNewFlashcards(limit) {
  if (limit <= 0) return [];
  /* Não usa computeTodayData (que já pergunta por esta fila): calcula aqui o acerto por assunto. */
  const share = typeof examFrequencyShare === "function" ? examFrequencyShare(state.studyPlan) : null;
  const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
  const totals = new Map();
  for (const [id, progress] of Object.entries(state.progress || {})) {
    const question = progress?.grade && byId.get(id);
    if (!question) continue;
    const subtheme = questionSubtheme(question);
    const row = totals.get(subtheme) || { answered: 0, correct: 0 };
    row.answered += 1;
    if (progress.grade === "correct") row.correct += 1;
    totals.set(subtheme, row);
  }
  const accuracy = new Map([...totals.entries()].map(([label, row]) => [label, row.answered >= 5 ? row.correct / row.answered : null]));
  const data = { share };
  const candidates = [];
  for (const deck of state.flashcards || []) {
    const cards = flashcardCardsForDeck(deck, { applyImportance: false });
    cards.forEach((card, order) => {
      if (!isNewFlashcard(card.id)) return;
      const item = { deck, card };
      const subtheme = flashcardItemSubtheme(item);
      const share = data?.share ? data.share(subtheme) : 0;
      const acc = accuracy.get(subtheme);
      const weakness = acc === null || acc === undefined ? 0 : Math.max(0, 0.75 - acc) * 4;
      const importance = Number(card.importance || 3);
      /* Dentro do deck mantém a ordem (do básico ao específico). */
      candidates.push({ item, subtheme, score: importance + share * 25 + weakness - order * 0.02 });
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  const perSubtheme = new Map();
  const cap = Math.max(2, Math.ceil(limit / 3));
  const picked = [];
  for (const candidate of candidates) {
    if (picked.length >= limit) break;
    const used = perSubtheme.get(candidate.subtheme) || 0;
    if (used >= cap) continue;
    perSubtheme.set(candidate.subtheme, used + 1);
    picked.push(candidate.item);
  }
  return picked;
}

/* Fila de hoje (sem montar sessão): vencidos + novos que ainda cabem no limite. */
let dailyQueueCache = { key: "", due: [], fresh: [] };
function dailyFlashcardQueue() {
  const key = [localDayKey(), Object.keys(state.flashcardProgress || {}).length, newFlashcardsStudiedToday(), state.flashcardNewPerDay, state.studyPlan?.updatedAt || 0, (state.flashcards || []).length, Math.floor(Date.now() / 60000)].join("|");
  if (dailyQueueCache.key !== key) {
    const due = flashcardReviewItems({ dueOnly: true }).slice(0, FLASHCARD_REVIEW_CAP);
    const remainingNew = Math.max(0, state.flashcardNewPerDay - newFlashcardsStudiedToday());
    dailyQueueCache = { key, due, fresh: pickNewFlashcards(remainingNew) };
  }
  return dailyQueueCache;
}

function dailyFlashcardCount() {
  const queue = dailyFlashcardQueue();
  return queue.due.length + queue.fresh.length;
}

function saveFlashcardSession() {
  if (state.flashcardSession) localStorage.setItem(FLASHCARD_SESSION_KEY, JSON.stringify(state.flashcardSession));
  else localStorage.removeItem(FLASHCARD_SESSION_KEY);
}

function flashcardItemById(cardId) {
  for (const deck of state.flashcards || []) {
    const card = (deck.cards || []).find((item) => item.id === cardId);
    if (card) return { deck, card };
  }
  return null;
}

function startDailyFlashcardSession() {
  const queue = dailyFlashcardQueue();
  const items = [...queue.due, ...queue.fresh];
  if (!items.length) {
    state.todayNotice = "Nenhum flashcard para hoje. Você pode abrir o banco de flashcards e estudar um deck.";
    setTab("overview");
    render();
    return;
  }
  startFlashcardSession(items, { label: "Flashcards de hoje" });
}

/* Sessão com uma lista própria de cartões (de qualquer deck): a de hoje ou a de um tema. */
function startFlashcardSession(items, { label, returnTab = "overview" } = {}) {
  if (!items.length) return;
  state.flashcardSession = {
    date: localDayKey(),
    label,
    returnTab,
    ids: items.map((item) => item.card.id),
    index: 0,
    newIds: items.filter((item) => isNewFlashcard(item.card.id)).map((item) => item.card.id),
    graded: 0,
  };
  saveFlashcardSession();
  openFlashcardReviewItem(items[0]);
}

function flashcardSessionActive() {
  const session = state.flashcardSession;
  return Boolean(session && session.date === localDayKey() && session.index < session.ids.length);
}

function advanceFlashcardSession() {
  const session = state.flashcardSession;
  session.index += 1;
  session.graded += 1;
  while (session.index < session.ids.length && !flashcardItemById(session.ids[session.index])) session.index += 1;
  saveFlashcardSession();
  if (session.index >= session.ids.length) {
    const total = session.graded;
    const label = session.label || "Flashcards de hoje";
    const returnTab = session.returnTab || "overview";
    state.flashcardSession = null;
    saveFlashcardSession();
    const message = returnTab === "overview"
      ? `${label} concluídos: ${pluralize(total, "cartão", "cartões")}.`
      : `${label}: ${pluralize(total, "cartão estudado", "cartões estudados")}. Eles voltam na revisão de hoje quando vencerem.`;
    if (returnTab === "overview") state.todayNotice = message;
    else state.flashcardTopicNotice = message;
    state.flashcardRevealed = false;
    setTab(returnTab);
    render();
    return;
  }
  const next = flashcardItemById(session.ids[session.index]);
  openFlashcardReviewItem(next);
}

function renderFlashcardSessionBar() {
  const bar = document.querySelector("#flashcardSessionBar");
  if (!bar) return;
  const active = state.activeTab === "flashcards" && flashcardSessionActive();
  bar.hidden = !active;
  if (!active) return;
  const session = state.flashcardSession;
  const current = session.ids[session.index];
  const isNew = session.newIds.includes(current);
  const html = `<strong>${escapeHtml(session.label || "Flashcards de hoje")} · ${session.index + 1} de ${session.ids.length}</strong><span>${isNew ? "cartão novo" : "revisão"}</span><button type="button" class="link-btn" data-flashcard-session="stop">Parar</button>`;
  if (bar.dataset.renderedHtml !== html) {
    bar.innerHTML = html;
    bar.dataset.renderedHtml = html;
  }
}

function renderFlashcardNewLimit() {
  const group = document.querySelector("#flashcardNewLimit");
  if (!group) return;
  group.querySelectorAll("[data-flashcard-new]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.flashcardNew) === state.flashcardNewPerDay);
  });
  const line = document.querySelector("#flashcardDailyLine");
  if (line) {
    const queue = dailyFlashcardQueue();
    const text = queue.due.length || queue.fresh.length
      ? `Hoje: ${pluralize(queue.due.length, "para revisar", "para revisar")} e ${pluralize(queue.fresh.length, "novo", "novos")}.`
      : "Nada pendente para hoje.";
    if (line.textContent !== text) line.textContent = text;
  }
  const start = document.querySelector("#flashcardDailyStart");
  if (start) start.disabled = !dailyFlashcardCount() || flashcardSessionActive();
}

(function setupFlashcardDaily() {
  /* Primeira vez que um cartão é estudado conta no limite de novos do dia. */
  const baseScheduleFlashcardGrade = scheduleFlashcardGrade;
  scheduleFlashcardGrade = function scheduleFlashcardGradeWithFirstSeen(cardId, grade, ...rest) {
    const wasNew = isNewFlashcard(cardId);
    const result = baseScheduleFlashcardGrade.call(this, cardId, grade, ...rest);
    if (wasNew && state.flashcardProgress[cardId]) {
      state.flashcardProgress[cardId].firstSeenAt = new Date().toISOString();
      saveFlashcardState();
    }
    return result;
  };

  /* Na sessão de hoje, avaliar o cartão leva ao próximo da fila (de qualquer deck). */
  const baseGradeFlashcard = gradeFlashcard;
  gradeFlashcard = function gradeFlashcardInSession(grade, ...rest) {
    const session = state.flashcardSession;
    const card = currentFlashcard();
    if (!flashcardSessionActive() || !card || card.id !== session.ids[session.index]) return baseGradeFlashcard.call(this, grade, ...rest);
    scheduleFlashcardGrade(card.id, grade);
    state.flashcardRevealed = false;
    advanceFlashcardSession();
  };

  /* "Revisar flashcards" (Hoje, resumo do bloco) abre a fila de hoje. */
  startDueFlashcardsReview = function startDueFlashcardsReviewDaily() {
    startDailyFlashcardSession();
  };

  document.querySelector("#flashcardSessionBar")?.addEventListener("click", (event) => {
    if (!event.target.closest('[data-flashcard-session="stop"]')) return;
    state.flashcardSession = null;
    saveFlashcardSession();
    render();
  });

  document.querySelector("#flashcardNewLimit")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flashcard-new]");
    if (!button) return;
    state.flashcardNewPerDay = Number(button.dataset.flashcardNew);
    localStorage.setItem(FLASHCARD_NEW_LIMIT_KEY, String(state.flashcardNewPerDay));
    dailyQueueCache.key = "";
    render();
  });
  document.querySelector("#flashcardDailyStart")?.addEventListener("click", () => startDailyFlashcardSession());

  const baseRender = render;
  render = function renderWithFlashcardDaily(...args) {
    const result = baseRender.apply(this, args);
    renderFlashcardSessionBar();
    if (state.activeTab === "flashcards") renderFlashcardNewLimit();
    return result;
  };
})();
