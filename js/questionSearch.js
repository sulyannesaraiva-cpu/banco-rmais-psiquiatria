/* Busca de questões para quem estuda (topo do Estudo por temas).
   Procura todas as palavras digitadas (sem acento, sem diferenciar maiúsculas) no enunciado e nas
   alternativas de didáticas e provas; "Estudar estas" abre um bloco só com as encontradas. */
(function setupQuestionSearch() {
  const input = document.querySelector("#questionSearchInput");
  const results = document.querySelector("#questionSearchResults");
  if (!input || !results) return;

  const MIN_LENGTH = 3;
  const PREVIEWS = 4;
  const MAX_BLOCK = 200;
  const searchText = new Map();
  let timer = null;
  let lastMatches = [];

  function textOf(question) {
    const view = effectiveQuestion(question);
    const key = `${question.id}|${view.text?.length}|${view.options?.length}`;
    let entry = searchText.get(question.id);
    if (!entry || entry.key !== key) {
      entry = { key, value: normalize([view.text, ...(view.options || []).map((option) => option.text)].join(" ")) };
      searchText.set(question.id, entry);
    }
    return entry.value;
  }

  function terms(query) {
    return normalize(query).split(/\s+/).map((term) => term.trim()).filter((term) => term.length >= 2);
  }

  function search(query) {
    const wanted = terms(query);
    if (!wanted.length || normalize(query).trim().length < MIN_LENGTH) return [];
    return allStudyQuestions().filter((question) => {
      if (isExcluded(question.id) || !isReadyQuestion(effectiveQuestion(question))) return false;
      const text = textOf(question);
      return wanted.every((term) => text.includes(term));
    });
  }

  /* Trecho em volta da primeira palavra encontrada (no enunciado ou, se não estiver nele, na
     alternativa que a contém), com as palavras destacadas. */
  function snippet(question, query) {
    const view = effectiveQuestion(question);
    const wanted = terms(query);
    const hasTerm = (text) => wanted.some((term) => normalize(text).includes(term));
    const stem = String(view.text || "").replace(REFERENCE_CITATION, "");
    const option = hasTerm(stem) ? null : (view.options || []).find((item) => hasTerm(item.text || ""));
    const prefix = option ? `<em>Alternativa ${escapeHtml(option.letter)}:</em> ` : "";
    return prefix + highlight(option ? String(option.text) : stem, wanted);
  }

  function highlight(original, wanted) {
    const plain = normalize(original);
    const positions = wanted.map((term) => plain.indexOf(term)).filter((index) => index >= 0);
    const first = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, first - 60);
    let piece = original.slice(start, start + 180);
    let html = escapeHtml(piece);
    const pieceNorm = normalize(piece);
    /* Marca sobre o texto original usando as posições achadas no texto sem acento (mesmo tamanho). */
    const marks = [];
    for (const term of wanted) {
      let from = 0;
      while ((from = pieceNorm.indexOf(term, from)) >= 0) {
        marks.push([from, from + term.length]);
        from += term.length;
      }
    }
    if (marks.length && pieceNorm.length === piece.length) {
      marks.sort((a, b) => a[0] - b[0]);
      let out = "";
      let cursor = 0;
      for (const [a, b] of marks) {
        if (a < cursor) continue;
        out += escapeHtml(piece.slice(cursor, a)) + `<mark>${escapeHtml(piece.slice(a, b))}</mark>`;
        cursor = b;
      }
      html = out + escapeHtml(piece.slice(cursor));
    }
    return `${start > 0 ? "…" : ""}${html}${start + 180 < original.length ? "…" : ""}`;
  }

  function sourceLabel(question) {
    const exam = state.exams.find((item) => (item.questions || []).includes(question));
    return exam ? exam.title || exam.institution : `Didática · ${topicForQuestion(question)}`;
  }

  function render() {
    const query = input.value;
    if (normalize(query).trim().length < MIN_LENGTH) {
      results.innerHTML = "";
      lastMatches = [];
      return;
    }
    lastMatches = search(query);
    if (!lastMatches.length) {
      results.innerHTML = `<p class="panel-line">Nenhuma questão com "${escapeHtml(query.trim())}".</p>`;
      return;
    }
    const examIds = new Set(examStudyQuestions().map((question) => question.id));
    const fromExams = lastMatches.filter((question) => examIds.has(question.id)).length;
    const done = lastMatches.filter((question) => getProgress(question.id).grade).length;
    const studyCount = blockQuestions().length;
    const studyLabel = state.unseenOnly
      ? studyCount ? `Estudar ${studyCount === 1 ? "a inédita" : `as ${studyCount} inéditas`}` : "Todas já feitas"
      : `Estudar ${lastMatches.length > MAX_BLOCK ? `as primeiras ${MAX_BLOCK}` : lastMatches.length === 1 ? "esta" : "estas"}`;
    results.innerHTML = `
      <div class="search-summary">
        <span><strong>${lastMatches.length}</strong> ${lastMatches.length === 1 ? "questão" : "questões"} · ${fromExams} de provas · ${done} já feitas</span>
        <button type="button" class="primary-btn" data-search-study ${studyCount ? "" : "disabled"}>${studyLabel}</button>
      </div>
      <div class="search-previews">
        ${lastMatches.slice(0, PREVIEWS).map((question) => `
          <div class="search-preview">
            <small>${escapeHtml(sourceLabel(question))}</small>
            <p>${snippet(question, query)}</p>
          </div>`).join("")}
      </div>`;
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 200);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && lastMatches.length) startSearchBlock();
  });
  results.addEventListener("click", (event) => {
    if (event.target.closest("[data-search-study]")) startSearchBlock();
  });

  /* Com "Só questões inéditas" ligado (js/unseenMode.js), só as ainda não feitas. */
  function blockQuestions() {
    const pool = state.unseenOnly ? lastMatches.filter((question) => !getProgress(question.id).grade) : lastMatches;
    return pool.slice(0, MAX_BLOCK);
  }

  function startSearchBlock() {
    const questions = blockQuestions();
    if (!questions.length) return;
    startStudyRun(questions, { kind: "search", label: `Busca: ${input.value.trim()}` });
  }
})();
