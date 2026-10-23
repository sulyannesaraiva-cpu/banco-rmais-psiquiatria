/* Questões ↔ flashcards.
   - "Revisar o conceito": depois de um erro, mostra no próprio cartão da questão os
     flashcards do mesmo subtema (com resposta e nota, sem sair do bloco).
   - "Virar flashcard": transforma a questão num cartão do deck "Meus cartões", que
     entra na revisão espaçada. Os cartões criados sincronizam com a conta. */

const CUSTOM_FLASHCARDS_KEY = "banco-rmais-custom-flashcards";
const CUSTOM_DECK_ID = "meus-cartoes";
const CUSTOM_DECK_AREA = "Meus cartões";
const CONCEPT_STOPWORDS = new Set([
  "paciente", "pacientes", "anos", "idade", "quadro", "seguir", "sobre", "apresenta", "assinale", "alternativa", "correta",
  "incorreta", "clinico", "clinica", "caso", "quais", "qual", "sendo", "acordo", "considerando", "relacao", "respeito",
  "itens", "julgue", "afirmativa", "conduta", "diagnostico", "tratamento", "exceto", "sexo", "masculino", "feminino",
  "historia", "atendimento", "consulta", "durante", "ainda", "entre", "outros", "outras", "pode", "podem", "deve", "devem",
]);

let conceptIndexCache = { key: "", bySubtheme: new Map() };
state.conceptView = null;

function customFlashcardDeck() {
  return (window.BANCO_RMAIS_FLASHCARDS?.decks || []).find((deck) => deck.id === CUSTOM_DECK_ID) || null;
}

(function installCustomFlashcardDeck() {
  const root = window.BANCO_RMAIS_FLASHCARDS || (window.BANCO_RMAIS_FLASHCARDS = { decks: [] });
  if (!Array.isArray(root.decks)) root.decks = [];
  if (root.decks.some((deck) => deck.id === CUSTOM_DECK_ID)) return;
  root.decks.push({
    id: CUSTOM_DECK_ID,
    title: "Meus cartões (das questões)",
    area: CUSTOM_DECK_AREA,
    module: CUSTOM_DECK_AREA,
    basis: "Criados por você a partir das questões",
    priorities: ["repeated-error"],
    importance: 5,
    cards: readStoredJson(CUSTOM_FLASHCARDS_KEY, []),
  });
})();

function saveCustomFlashcards() {
  const deck = customFlashcardDeck();
  localStorage.setItem(CUSTOM_FLASHCARDS_KEY, JSON.stringify(deck?.cards || []));
  conceptIndexCache.key = "";
  if (state.cloudReady && typeof syncSettingsToCloud === "function") syncSettingsToCloud();
}

/* Enviado junto das configurações da conta (currentSettingsPayload). */
function customFlashcardsForSync() {
  return customFlashcardDeck()?.cards || [];
}

/* Chamado por applySettingsPayload: junta os cartões criados em outro aparelho. */
function applyCustomFlashcardsFromCloud(cards) {
  const deck = customFlashcardDeck();
  if (!deck || !Array.isArray(cards)) return;
  const known = new Set(deck.cards.map((card) => card.id));
  let added = 0;
  for (const card of cards) {
    if (card?.id && !known.has(card.id)) {
      deck.cards.push(card);
      added += 1;
    }
  }
  if (added) localStorage.setItem(CUSTOM_FLASHCARDS_KEY, JSON.stringify(deck.cards));
}

function customCardIdFor(question) {
  return `qcard-${question.id}`;
}

function hasCustomCardFor(question) {
  const id = customCardIdFor(question);
  return Boolean(customFlashcardDeck()?.cards.some((card) => card.id === id));
}

function flashcardFrontFromQuestion(question) {
  const text = String(effectiveQuestion(question).text || "").replace(/\s+/g, " ").trim();
  if (text.length <= 480) return text;
  // Mantém o fim, onde fica a pergunta, começando numa frase completa.
  const tail = text.slice(-460);
  const cut = tail.search(/[.?!:]\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/);
  return `…${cut >= 0 && cut < 220 ? tail.slice(cut + 2) : tail}`;
}

function flashcardBackFromQuestion(question) {
  const view = effectiveQuestion(question);
  const option = (view.options || []).find((item) => item.letter === view.correctAnswer);
  const isTrueFalse = (view.options || []).length === 2 && view.options.every((item) => ["C", "E"].includes(item.letter));
  const answer = isTrueFalse ? (view.correctAnswer === "C" ? "CERTO" : "ERRADO") : `${view.correctAnswer}) ${option?.text || ""}`;
  const source = [question.examTag || question.source, question.title].filter(Boolean).join(" · ");
  const keyPoint = flashcardKeyPoint(view.explanation);
  return `${answer}${keyPoint ? ` · Ponto-chave: ${keyPoint}` : ""}${source ? ` — da questão ${source}` : ""}`;
}

/* Primeira frase com conteúdo do comentário da questão, para o verso do cartão: sem Markdown e
   pulando frases que só anunciam o gabarito ("Alternativa D – correta.", "A alternativa correta é a B."). */
function flashcardKeyPoint(explanation) {
  const text = String(explanation || "")
    .split("\n")
    .map((line) => line.replace(/^\s*(>\s*)+/, "").replace(/^\s*#{1,3}\s*/, "").replace(/^\s*[-*•]\s+/, ""))
    .join(" ")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [text];
  const announcesAnswer = (sentence) =>
    /^\s*(coment[aá]rio\s*:?\s*)?((a\s+)?(alternativa|resposta|letra)\b|gabarito\b)/i.test(sentence) && sentence.length < 120;
  const sentence = (sentences.find((item) => item.trim().length >= 30 && !announcesAnswer(item)) || sentences[0])
    .trim()
    .replace(/^coment[aá]rio\s*:?\s*/i, "");
  return sentence.length > 260 ? `${sentence.slice(0, 257).trimEnd()}…` : sentence;
}

function createFlashcardFromQuestion(question) {
  createFlashcardsFromQuestions([question]);
}

/* Cria os cartões de várias questões de uma vez (salva e sincroniza uma vez só). */
function createFlashcardsFromQuestions(questions) {
  const deck = customFlashcardDeck();
  if (!deck) return 0;
  let created = 0;
  for (const question of questions) {
    if (!question || hasCustomCardFor(question)) continue;
    const card = buildFlashcardFromQuestion(question);
    deck.cards.push(card);
    // Já entra como vencido: aparece na revisão de flashcards e na tela Hoje.
    state.flashcardProgress[card.id] = { ...(state.flashcardProgress[card.id] || {}), nextReviewAt: new Date().toISOString() };
    created += 1;
  }
  if (!created) return 0;
  saveFlashcardState();
  saveCustomFlashcards();
  return created;
}

function buildFlashcardFromQuestion(question) {
  const subtheme = questionSubtheme(question);
  return {
    id: customCardIdFor(question),
    front: flashcardFrontFromQuestion(question),
    back: flashcardBackFromQuestion(question),
    topic: subtheme,
    tags: [subtheme],
    module: CUSTOM_DECK_AREA,
    priorities: ["repeated-error"],
    importance: 5,
    sourceQuestionId: question.id,
    createdAt: new Date().toISOString(),
  };
}

/* ---------- flashcards do mesmo conceito ---------- */

function conceptWords(text) {
  return new Set(
    normalize(text)
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 5 && !CONCEPT_STOPWORDS.has(word)),
  );
}

function flashcardSubtheme(item) {
  if (typeof itemSubthemeForExamFrequency === "function") return itemSubthemeForExamFrequency(item);
  return questionSubtheme({ id: `flashcard:${item.card.id}`, source: item.deck.title, topic: item.card.topic || "", title: (item.card.tags || []).join(" "), text: item.card.front || "", options: [{ letter: "A", text: item.card.back || "" }] });
}

function conceptIndex() {
  const items = allFlashcardItems();
  const key = `${items.length}`;
  if (conceptIndexCache.key === key) return conceptIndexCache.bySubtheme;
  const bySubtheme = new Map();
  const deckSubthemes = new Map();
  for (const item of items) {
    const subtheme = flashcardSubtheme(item);
    if (!subtheme || subtheme === "Subtema a revisar") continue;
    const list = bySubtheme.get(subtheme) || [];
    list.push({ ...item, subtheme, words: conceptWords(`${item.card.front || ""} ${item.card.back || ""} ${(item.card.tags || []).join(" ")}`) });
    bySubtheme.set(subtheme, list);
    const counts = deckSubthemes.get(item.deck.id) || new Map();
    counts.set(subtheme, (counts.get(subtheme) || 0) + 1);
    deckSubthemes.set(item.deck.id, counts);
  }
  /* Assunto principal de cada deck: o subtema da maioria dos cartões. Um cartão classificado num
     subtema diferente do do seu deck (ex.: "delirium x psicose" no deck de Delirium) só entra
     quando tem bastante coisa em comum com a questão. */
  for (const list of bySubtheme.values()) {
    for (const item of list) {
      const counts = deckSubthemes.get(item.deck.id);
      const main = counts ? [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0] : item.subtheme;
      item.offDeck = item.deck.id !== CUSTOM_DECK_ID && !item.card.subtheme && main !== item.subtheme;
    }
  }
  conceptIndexCache = { key, bySubtheme };
  return bySubtheme;
}

const CONCEPT_MIN_OVERLAP = 2;
const CONCEPT_MIN_OVERLAP_OFF_DECK = 4;

function relatedFlashcards(question, limit = 3) {
  const subtheme = questionSubtheme(question);
  const candidates = (conceptIndex().get(subtheme) || []).filter((item) => item.card.id !== customCardIdFor(question));
  if (!candidates.length) return [];
  const view = effectiveQuestion(question);
  const words = conceptWords(`${view.text || ""} ${(view.options || []).map((option) => option.text).join(" ")}`);
  return candidates
    .map((item) => {
      let overlap = 0;
      for (const word of item.words) if (words.has(word)) overlap += 1;
      return { item, overlap };
    })
    /* Só cartões que de fato falam do assunto da questão (antes entrava qualquer cartão do subtema,
       mesmo sem nenhuma palavra em comum). */
    .filter(({ item, overlap }) => overlap >= (item.offDeck ? CONCEPT_MIN_OVERLAP_OFF_DECK : CONCEPT_MIN_OVERLAP))
    .sort((a, b) => b.overlap - a.overlap || String(a.item.card.id).localeCompare(String(b.item.card.id), "pt-BR"))
    .slice(0, limit)
    .map((entry) => entry.item);
}

/* ---------- painel no cartão da questão ---------- */

const CONCEPT_GRADES = [["again", "Errei"], ["hard", "Difícil"], ["good", "Bom"], ["easy", "Fácil"]];

function renderConceptPanel(question, progress, examLocked) {
  const panel = document.querySelector("#conceptPanel");
  if (!panel) return;
  if (!question || examLocked || !progress?.grade) {
    panel.hidden = true;
    panel.dataset.renderedHtml = "";
    return;
  }
  if (state.conceptView?.questionId !== question.id) state.conceptView = { questionId: question.id, index: 0, revealed: false, graded: {} };
  const view = state.conceptView;
  const related = progress.grade === "wrong" ? relatedFlashcards(question) : [];
  view.count = related.length;
  const current = related[Math.min(view.index, Math.max(related.length - 1, 0))];
  const graded = current ? view.graded[current.card.id] : null;
  const made = hasCustomCardFor(question);

  const conceptHtml = current ? `
    <div class="concept-block">
      <div class="concept-head">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2"></rect><path d="M7 3h12a2 2 0 0 1 2 2v12"></path></svg>
        <strong>Revisar o conceito</strong>
        <span>${related.length > 1 ? `${view.index + 1} de ${related.length} flashcards do assunto` : "1 flashcard do assunto"}</span>
      </div>
      <div class="concept-card">
        <span class="concept-card-topic">${escapeHtml(current.card.topic || current.deck.title || "")}</span>
        <p class="concept-card-front">${escapeHtml(current.card.front || "")}</p>
        ${view.revealed ? `<p class="concept-card-back">${escapeHtml(current.card.back || "")}</p>` : ""}
      </div>
      ${!view.revealed ? '<button type="button" class="concept-btn primary" data-concept-action="reveal">Mostrar resposta</button>' : ""}
      ${view.revealed && !graded ? `<div class="concept-grades" role="group" aria-label="Como foi este flashcard?">${CONCEPT_GRADES.map(([value, label]) => `<button type="button" class="concept-btn" data-concept-action="grade" data-grade="${value}">${label}</button>`).join("")}</div>` : ""}
      ${graded ? `<p class="concept-done">Anotado: ${escapeHtml((CONCEPT_GRADES.find(([value]) => value === graded) || [])[1] || "")}. Este cartão volta na sua revisão de flashcards.</p>` : ""}
      ${view.revealed && related.length > 1 && view.index < related.length - 1 ? '<button type="button" class="concept-btn" data-concept-action="next">Próximo flashcard</button>' : ""}
    </div>` : "";

  const makeHtml = made
    ? '<p class="concept-made">Flashcard criado. Ele aparece na sua revisão de flashcards e na tela Hoje.</p>'
    : `<div class="concept-make">
        <button type="button" class="concept-btn" data-concept-action="make-card">Virar flashcard</button>
        <span>Transforma esta questão num cartão que entra na sua revisão espaçada.</span>
      </div>`;

  const html = `${conceptHtml}${makeHtml}`;
  if (panel.dataset.renderedHtml !== html) {
    panel.innerHTML = html;
    panel.dataset.renderedHtml = html;
  }
  panel.classList.toggle("has-concept", Boolean(current));
  panel.hidden = false;
}

(function setupConceptPanel() {
  const panel = document.querySelector("#conceptPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-concept-action]");
    if (!button) return;
    const question = currentQuestion();
    const view = state.conceptView;
    if (!question || !view || view.questionId !== question.id) return;
    const action = button.dataset.conceptAction;
    if (action === "make-card") {
      createFlashcardFromQuestion(question);
      render();
      return;
    }
    const related = relatedFlashcards(question);
    const current = related[Math.min(view.index, Math.max(related.length - 1, 0))];
    if (!current) return;
    if (action === "reveal") view.revealed = true;
    if (action === "grade") {
      scheduleFlashcardGrade(current.card.id, button.dataset.grade);
      view.graded[current.card.id] = button.dataset.grade;
    }
    if (action === "next") {
      view.index = Math.min(view.index + 1, related.length - 1);
      view.revealed = false;
    }
    render();
  });
})();
