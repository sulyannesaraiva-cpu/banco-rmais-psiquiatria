/* Caderno de erros para imprimir ou salvar em PDF (Hoje > Outras revisões > Caderno de erros).
   Abre uma página própria para impressão com as questões erradas, agrupadas por tema: enunciado,
   alternativas com a sua resposta e a correta marcadas, motivo do erro, sua anotação e comentário. */
(function setupErrorNotebookPrint() {
  const button = document.querySelector("#printErrorsBtn");
  const topicSelect = document.querySelector("#printErrorsTopic");
  if (!button || !topicSelect) return;

  function wrongQuestions() {
    return allStudyQuestions().filter((question) => {
      if (isExcluded(question.id)) return false;
      return getProgress(question.id).grade === "wrong" && isReadyQuestion(effectiveQuestion(question));
    });
  }

  function examTitleOf(question) {
    const exam = state.exams.find((item) => (item.questions || []).includes(question));
    return exam ? exam.title : `Didática · Questão ${question.number || ""}`;
  }

  function refreshTopics() {
    const counts = new Map();
    for (const question of wrongQuestions()) {
      const topic = topicForQuestion(question);
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
    const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
    const html = [
      `<option value="Todos">Todos os temas (${total})</option>`,
      ...[...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR")).map(([topic, n]) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)} (${n})</option>`),
    ].join("");
    if (topicSelect.dataset.renderedHtml !== html) {
      const current = topicSelect.value || "Todos";
      topicSelect.innerHTML = html;
      topicSelect.dataset.renderedHtml = html;
      topicSelect.value = counts.has(current) ? current : "Todos";
    }
    button.disabled = !total;
  }

  function questionHtml(question, number) {
    const view = effectiveQuestion(question);
    const progress = getProgress(question.id);
    const options = (view.options || []).map((option) => {
      const marks = [];
      if (option.letter === view.correctAnswer) marks.push("correta");
      if (option.letter === progress.selected && option.letter !== view.correctAnswer) marks.push("sua resposta");
      const cls = option.letter === view.correctAnswer ? "ok" : marks.length ? "bad" : "";
      return `<li class="${cls}"><b>${escapeHtml(option.letter)})</b> ${escapeHtml(option.text)}${marks.length ? ` <em>— ${marks.join(", ")}</em>` : ""}</li>`;
    }).join("");
    const reason = progress.errorType ? `<p class="meta">Motivo marcado: ${escapeHtml(errorTypeLabel(progress.errorType))}</p>` : "";
    const noteText = typeof questionNoteText === "function" ? questionNoteText(question.id) : String(progress.note || "").trim();
    const note = noteText ? `<div class="note"><strong>Sua anotação</strong><p>${escapeHtml(noteText)}</p></div>` : "";
    const explanation = String(view.explanation || "").trim()
      ? `<div class="explanation"><strong>Comentário</strong>${renderSafeMarkdown(view.explanation)}</div>`
      : "";
    return `
      <article>
        <p class="meta">${number}. ${escapeHtml(examTitleOf(question))} · ${escapeHtml(questionSubtheme(question))}</p>
        <p class="stem">${escapeHtml(String(view.text || "").replace(REFERENCE_CITATION, ""))}</p>
        ${view.image ? `<img src="${escapeHtml(new URL(view.image, location.href).href)}" alt="Figura da questão">` : ""}
        <ol class="options">${options}</ol>
        ${reason}
        ${note}
        ${explanation}
      </article>`;
  }

  function printNotebook() {
    const chosen = topicSelect.value || "Todos";
    const questions = wrongQuestions().filter((question) => chosen === "Todos" || topicForQuestion(question) === chosen);
    if (!questions.length) return;
    const byTopic = new Map();
    for (const question of questions) {
      const topic = topicForQuestion(question);
      if (!byTopic.has(topic)) byTopic.set(topic, []);
      byTopic.get(topic).push(question);
    }
    let number = 0;
    const sections = [...byTopic.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
      .map(([topic, items]) => `<section><h2>${escapeHtml(topic)} <small>(${items.length})</small></h2>${items.map((question) => questionHtml(question, ++number)).join("")}</section>`)
      .join("");
    const today = new Date().toLocaleDateString("pt-BR");
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Caderno de erros · Banco R+</title>
      <style>
        body{font:13px/1.5 Georgia,"Times New Roman",serif;color:#111;margin:24px auto;max-width:760px;padding:0 16px}
        header{border-bottom:2px solid #111;margin-bottom:16px;padding-bottom:8px}
        h1{font:700 20px Arial,sans-serif;margin:0}
        header p{margin:4px 0 0;color:#555;font:12px Arial,sans-serif}
        h2{font:700 15px Arial,sans-serif;margin:22px 0 8px;padding:4px 8px;background:#eee}
        h2 small{font-weight:400;color:#555}
        article{break-inside:avoid;border-bottom:1px solid #ddd;padding:10px 0}
        .meta{margin:0 0 4px;color:#555;font:11px Arial,sans-serif}
        .stem{margin:0 0 6px;white-space:pre-wrap}
        article img{display:block;max-width:100%;max-height:320px;margin:0 0 6px}
        .options{margin:0;padding-left:0;list-style:none}
        .options li{margin:2px 0;padding:2px 6px;border-radius:4px}
        .options li.ok{background:#e7f6ec}
        .options li.bad{background:#fde8e8}
        .options em{color:#555;font-size:11px}
        .explanation{margin-top:6px;padding:6px 10px;border-left:3px solid #2563eb;background:#f3f6fd}
        .explanation p{margin:4px 0}
        .note{margin-top:6px;padding:6px 10px;border-left:3px solid #d97706;background:#fdf6ec}
        .note p{margin:4px 0;white-space:pre-wrap}
        @media print{body{margin:0}h2{background:#eee !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head><body>
      <header><h1>Caderno de erros</h1><p>${escapeHtml(chosen === "Todos" ? "Todos os temas" : chosen)} · ${questions.length} questões · ${today} · Banco R+ Psiquiatria</p></header>
      ${sections}
      <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script>
      </body></html>`;
    const win = window.open("", "_blank");
    if (!win) {
      alert("O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente de novo.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  button.addEventListener("click", printNotebook);

  const baseRenderErrorNotebook = renderErrorNotebook;
  renderErrorNotebook = function renderErrorNotebookWithPrint(...args) {
    const result = baseRenderErrorNotebook.apply(this, args);
    refreshTopics();
    return result;
  };
})();
