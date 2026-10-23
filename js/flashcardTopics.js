/* Flashcards por tema (aba Flashcards > "Por tema"): os cartões de todos os decks agrupados nos
   mesmos temas do Estudo por temas, com os subtemas dentro. Cada tema mostra quantos cartões
   tem (novos e para revisar) e quantas questões existem no banco, e "Estudar" abre uma sessão
   com os cartões dele (vencidos primeiro, depois os novos). "Por deck" mantém a lista antiga. */

const FLASHCARD_VIEW_KEY = "banco-rmais-flashcard-view";
const FLASHCARD_TOPIC_SESSION_SIZE = 30;
/* Cartões sem subtema reconhecido ficam no tema da área do deck. */
const FLASHCARD_AREA_TOPIC = {
  Psicogeriatria: "Saúde do Idoso",
  PIA: "Psiquiatria Infantil",
  Forense: "Forense e Ética",
  Psicoterapia: "Psicoterapias",
  Psicofarmacologia: "Psicofarmacologia e terapêutica psiquiátrica",
  "Dependência Química": "Intoxicação por Drogas e Dependência Química",
};
const FLASHCARD_OTHER_TOPIC = "Outros cartões";

state.flashcardView = localStorage.getItem(FLASHCARD_VIEW_KEY) === "decks" ? "decks" : "topics";
state.flashcardTopicNotice = "";
let flashcardTopicCache = { key: "", topics: new Map(), questionCounts: new Map() };

/* Tema de cada subtema: o tema em que a maioria das questões daquele subtema está. */
function flashcardTopicIndex() {
  const decks = state.flashcards || [];
  const key = `${decks.reduce((total, deck) => total + (deck.cards || []).length, 0)}|${Object.keys(state.globalCorrections || {}).length}|${(state.excluded || []).length}`;
  if (flashcardTopicCache.key === key) return flashcardTopicCache;

  const votes = new Map();
  const questionCounts = new Map();
  for (const question of allStudyQuestions()) {
    if (isExcluded(question.id)) continue;
    const topic = topicForQuestion(question);
    questionCounts.set(topic, (questionCounts.get(topic) || 0) + 1);
    const subtheme = questionSubtheme(question);
    const counts = votes.get(subtheme) || new Map();
    counts.set(topic, (counts.get(topic) || 0) + 1);
    votes.set(subtheme, counts);
  }
  const topicOfSubtheme = new Map([...votes.entries()].map(([subtheme, counts]) => [subtheme, [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]]));

  const topics = new Map();
  const add = (topic, group, item) => {
    if (!topics.has(topic)) topics.set(topic, new Map());
    const groups = topics.get(topic);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  };
  for (const deck of decks) {
    /* Deck escrito para um tema (data/highlightsFlashcards.js): todos os cartões ficam nele. */
    if (deck.studyTopic) {
      for (const card of flashcardCardsForDeck(deck, { applyImportance: false })) add(deck.studyTopic, deck.title, { deck, card });
      continue;
    }
    const entries = flashcardCardsForDeck(deck, { applyImportance: false }).map((card) => {
      const item = { deck, card };
      const subtheme = flashcardItemSubtheme(item);
      const known = subtheme && subtheme !== "Subtema a revisar";
      return { item, subtheme, known, topic: known ? topicOfSubtheme.get(subtheme) : null };
    });
    /* Tema principal do deck: o da maioria dos cartões (ou o da área do deck). */
    const votesByTopic = new Map();
    for (const entry of entries) if (entry.topic) votesByTopic.set(entry.topic, (votesByTopic.get(entry.topic) || 0) + 1);
    const mainTopic = [...votesByTopic.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || FLASHCARD_AREA_TOPIC[deck.area] || FLASHCARD_OTHER_TOPIC;
    for (const entry of entries) {
      /* Cartão com subtema declarado fica no tema dele. Sem declaração, um cartão que a
         classificação automática mandou para outro tema (ex.: "delirium x psicose" no deck de
         Delirium) continua no tema do próprio deck. */
      if (entry.item.card.subtheme && entry.topic) add(entry.topic, entry.subtheme, entry.item);
      else if (entry.known && (entry.topic === mainTopic || entry.topic === FLASHCARD_AREA_TOPIC[deck.area])) add(entry.topic, entry.subtheme, entry.item);
      else add(mainTopic, deck.title, entry.item);
    }
  }
  flashcardTopicCache = { key, topics, questionCounts };
  return flashcardTopicCache;
}

function flashcardCounts(items) {
  const now = Date.now();
  let fresh = 0;
  let due = 0;
  for (const item of items) {
    const next = state.flashcardProgress[item.card.id]?.nextReviewAt;
    if (!next) fresh += 1;
    else if (new Date(next).getTime() <= now) due += 1;
  }
  return { total: items.length, fresh, due };
}

function flashcardCountsLabel(counts) {
  return [pluralize(counts.total, "cartão", "cartões"), counts.fresh ? pluralize(counts.fresh, "novo", "novos") : "", counts.due ? `${counts.due} para revisar` : ""].filter(Boolean).join(" · ");
}

/* Vencidos primeiro (os mais atrasados antes), depois os novos na ordem do deck; se não houver
   nenhum dos dois, os próximos a vencer (revisão adiantada). */
function flashcardSessionItems(items) {
  const now = Date.now();
  const nextOf = (item) => {
    const next = state.flashcardProgress[item.card.id]?.nextReviewAt;
    return next ? new Date(next).getTime() : null;
  };
  const due = items.filter((item) => nextOf(item) !== null && nextOf(item) <= now).sort((a, b) => nextOf(a) - nextOf(b));
  const fresh = items.filter((item) => nextOf(item) === null);
  let queue = [...due, ...fresh];
  if (!queue.length) queue = [...items].sort((a, b) => nextOf(a) - nextOf(b));
  return queue.slice(0, FLASHCARD_TOPIC_SESSION_SIZE);
}

function renderFlashcardTopics() {
  const host = document.querySelector("#flashcardTopicList");
  const deckView = document.querySelector("#flashcardDeckView");
  if (!host) return;
  document.querySelectorAll("#flashcardViewToggle [data-flashcard-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.flashcardView === state.flashcardView);
  });
  const showTopics = state.flashcardView === "topics";
  host.hidden = !showTopics;
  if (deckView) deckView.hidden = showTopics;
  if (!showTopics) return;

  const { topics, questionCounts } = flashcardTopicIndex();
  const order = [...allTopics(), ...[...topics.keys()].filter((topic) => !allTopics().includes(topic))];
  const open = new Set([...host.querySelectorAll("details[open]")].map((details) => details.dataset.flashcardTopic));
  const rows = order.map((topic) => {
    const groups = topics.get(topic);
    const items = groups ? [...groups.values()].flat() : [];
    const questions = questionCounts.get(topic) || 0;
    if (!items.length) {
      return `<div class="flashcard-topic empty"><strong>${escapeHtml(topic)}</strong><span>Sem cartões ainda · ${pluralize(questions, "questão", "questões")} no banco</span></div>`;
    }
    const counts = flashcardCounts(items);
    const subRows = [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([group, groupItems]) => `
        <div class="flashcard-subtopic">
          <span>${escapeHtml(group)}</span>
          <small>${escapeHtml(flashcardCountsLabel(flashcardCounts(groupItems)))}</small>
          <button type="button" class="link-btn" data-flashcard-study-topic="${escapeHtml(topic)}" data-flashcard-study-group="${escapeHtml(group)}">Estudar</button>
        </div>`)
      .join("");
    return `
      <details class="flashcard-topic" data-flashcard-topic="${escapeHtml(topic)}" ${open.has(topic) ? "open" : ""}>
        <summary>
          <div class="flashcard-topic-text">
            <strong>${escapeHtml(topic)}</strong>
            <span>${escapeHtml(flashcardCountsLabel(counts))} · ${pluralize(questions, "questão", "questões")}</span>
          </div>
          <button type="button" class="outline-btn" data-flashcard-study-topic="${escapeHtml(topic)}">Estudar</button>
        </summary>
        <div class="flashcard-subtopics">${subRows}</div>
      </details>`;
  });
  const notice = state.flashcardTopicNotice ? `<p class="flashcard-topic-notice">${escapeHtml(state.flashcardTopicNotice)}</p>` : "";
  const html = `${notice}${rows.join("")}`;
  if (host.dataset.renderedHtml !== html) {
    host.innerHTML = html;
    host.dataset.renderedHtml = html;
  }
}

(function setupFlashcardTopics() {
  document.querySelector("#flashcardViewToggle")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flashcard-view]");
    if (!button) return;
    state.flashcardView = button.dataset.flashcardView;
    localStorage.setItem(FLASHCARD_VIEW_KEY, state.flashcardView);
    render();
  });

  document.querySelector("#flashcardTopicList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flashcard-study-topic]");
    if (!button) return;
    event.preventDefault();
    const topic = button.dataset.flashcardStudyTopic;
    const group = button.dataset.flashcardStudyGroup;
    const groups = flashcardTopicIndex().topics.get(topic);
    if (!groups) return;
    const items = group ? groups.get(group) || [] : [...groups.values()].flat();
    state.flashcardTopicNotice = "";
    startFlashcardSession(flashcardSessionItems(items), { label: group || topic, returnTab: "flashcards" });
  });

  const baseRender = render;
  render = function renderWithFlashcardTopics(...args) {
    const result = baseRender.apply(this, args);
    if (state.activeTab === "flashcards") renderFlashcardTopics();
    return result;
  };
})();
