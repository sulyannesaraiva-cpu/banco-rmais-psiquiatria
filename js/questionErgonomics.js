/* Ergonomia ao resolver questões.
   1. Celular: com uma letra marcada e ainda não confirmada, o botão principal da barra fixa
      (ao alcance do polegar) vira "Confirmar". No simulado continua "Próxima" (lá só se salva).
   2. Marca-texto no enunciado: selecionar um trecho mostra o botão "Grifar"; tocar no grifo
      remove. Os grifos ficam guardados por questão neste navegador. */

const HIGHLIGHTS_KEY = "banco-rmais-highlights";

/* ---------- 1. Confirmar na barra do celular ---------- */

function syncMobileConfirm() {
  const nav = document.querySelector(".question-nav");
  const confirm = document.querySelector("#confirmAnswerBtn");
  if (!nav || !confirm) return;
  let button = document.querySelector("#navConfirmBtn");
  if (!button) {
    button = document.createElement("button");
    button.id = "navConfirmBtn";
    button.type = "button";
    button.className = "nav-confirm";
    button.textContent = "Confirmar";
    button.addEventListener("click", () => {
      if (!confirm.disabled) confirm.click();
    });
    document.querySelector("#nextBtn")?.after(button);
  }
  const mobile = typeof isMobileLayout === "function" && isMobileLayout();
  const simulation = Boolean(state.examSimulationActive && !state.examSimulationFinished);
  const ready = !confirm.disabled && confirm.offsetParent !== null;
  const show = mobile && !simulation && ready;
  button.hidden = !show;
  nav.classList.toggle("confirm-mode", show);
}

/* ---------- 2. Marca-texto ---------- */

function readHighlights() {
  try {
    return JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY)) || {};
  } catch {
    return {};
  }
}

function writeHighlights(all) {
  try {
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
  } catch {
    /* sem espaço: o grifo vale só até recarregar */
  }
}

function currentQuestionIdForHighlight() {
  return state.filtered?.[state.index]?.id || null;
}

/* Nós de texto do enunciado, sem o rótulo "Caso clínico" (que muda conforme a questão anterior). */
function highlightTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement?.closest("summary") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function highlightOffset(root, container, offset) {
  let total = 0;
  for (const node of highlightTextNodes(root)) {
    if (node === container) return total + offset;
    total += node.textContent.length;
  }
  /* A seleção terminou num elemento (não num texto): conta tudo antes dele. */
  if (container.nodeType === Node.ELEMENT_NODE) {
    const child = container.childNodes[offset];
    let count = 0;
    for (const node of highlightTextNodes(root)) {
      if (child && (child === node || child.contains(node))) return count;
      count += node.textContent.length;
    }
    return count;
  }
  return null;
}

function applyHighlights() {
  const root = document.querySelector("#questionText");
  const qid = currentQuestionIdForHighlight();
  if (!root || !qid) return;
  const ranges = (readHighlights()[qid] || []).slice().sort((a, b) => a[0] - b[0]);
  const signature = `${qid}|${root.dataset.rendered?.length || 0}|${JSON.stringify(ranges)}`;
  if (root.dataset.hlSignature === signature && (ranges.length === 0 || root.querySelector("mark.q-hl"))) return;
  /* Volta ao enunciado limpo antes de aplicar (evita grifo dentro de grifo). */
  if (root.querySelector("mark.q-hl") && root.dataset.rendered) {
    const openCase = root.querySelector("details.question-case")?.open;
    root.innerHTML = root.dataset.rendered;
    const details = root.querySelector("details.question-case");
    if (details && openCase !== undefined) details.open = openCase;
  }
  root.dataset.hlSignature = signature;
  if (!ranges.length) return;
  let pos = 0;
  for (const node of highlightTextNodes(root)) {
    const start = pos;
    const end = pos + node.textContent.length;
    pos = end;
    const pieces = ranges
      .map(([s, e], i) => [Math.max(s, start), Math.min(e, end), i])
      .filter(([s, e]) => e > s);
    if (!pieces.length) continue;
    const frag = document.createDocumentFragment();
    let cursor = start;
    const text = node.textContent;
    pieces.forEach(([s, e, i]) => {
      if (s > cursor) frag.append(text.slice(cursor - start, s - start));
      const mark = document.createElement("mark");
      mark.className = "q-hl";
      mark.dataset.hl = String(i);
      mark.title = "Tocar para remover o grifo";
      mark.textContent = text.slice(s - start, e - start);
      frag.append(mark);
      cursor = e;
    });
    if (cursor < end) frag.append(text.slice(cursor - start));
    node.replaceWith(frag);
  }
}

function addHighlightFromSelection() {
  const root = document.querySelector("#questionText");
  const qid = currentQuestionIdForHighlight();
  const sel = window.getSelection();
  if (!root || !qid || !sel || sel.isCollapsed || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;
  let s = highlightOffset(root, range.startContainer, range.startOffset);
  let e = highlightOffset(root, range.endContainer, range.endOffset);
  if (s == null || e == null || e <= s) return;
  const all = readHighlights();
  /* Junta com grifos que se sobrepõem. */
  const merged = [];
  [...(all[qid] || []), [s, e]].sort((a, b) => a[0] - b[0]).forEach(([a, b]) => {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  });
  all[qid] = merged;
  writeHighlights(all);
  sel.removeAllRanges();
  hideHighlightButton();
  applyHighlights();
}

function removeHighlight(index) {
  const qid = currentQuestionIdForHighlight();
  if (!qid) return;
  const all = readHighlights();
  const ranges = (all[qid] || []).slice().sort((a, b) => a[0] - b[0]);
  ranges.splice(index, 1);
  if (ranges.length) all[qid] = ranges;
  else delete all[qid];
  writeHighlights(all);
  applyHighlights();
}

function highlightButton() {
  let button = document.querySelector("#highlightBtn");
  if (!button) {
    button = document.createElement("button");
    button.id = "highlightBtn";
    button.type = "button";
    button.className = "highlight-btn";
    button.textContent = "Grifar";
    button.hidden = true;
    /* mousedown: impede que o clique desfaça a seleção antes de grifar. */
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", addHighlightFromSelection);
    document.body.appendChild(button);
  }
  return button;
}

function hideHighlightButton() {
  const button = document.querySelector("#highlightBtn");
  if (button) button.hidden = true;
}

function updateHighlightButton() {
  const root = document.querySelector("#questionText");
  const sel = window.getSelection();
  if (!root || !sel || sel.isCollapsed || !sel.rangeCount || !root.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    hideHighlightButton();
    return;
  }
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (!rect.width && !rect.height) return hideHighlightButton();
  const button = highlightButton();
  button.hidden = false;
  const top = rect.top - 44 < 8 ? rect.bottom + 8 : rect.top - 44;
  const left = Math.min(Math.max(8, rect.left + rect.width / 2 - 36), window.innerWidth - 88);
  button.style.top = `${Math.round(top)}px`;
  button.style.left = `${Math.round(left)}px`;
}

(function setupQuestionErgonomics() {
  let timer = null;
  document.addEventListener("selectionchange", () => {
    clearTimeout(timer);
    timer = setTimeout(updateHighlightButton, 120);
  });
  window.addEventListener("scroll", hideHighlightButton, { passive: true });

  document.addEventListener("click", (event) => {
    const mark = event.target.closest("#questionText mark.q-hl");
    if (!mark) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    removeHighlight(Number(mark.dataset.hl));
  });

  const baseRender = render;
  render = function renderWithErgonomics(...args) {
    const result = baseRender.apply(this, args);
    applyHighlights();
    syncMobileConfirm();
    return result;
  };
  window.addEventListener("resize", syncMobileConfirm);
  /* Marcar uma letra pode não passar pelo render completo: reavalia depois do clique. */
  document.addEventListener("click", (event) => {
    if (event.target.closest(".option, #confirmAnswerBtn")) setTimeout(syncMobileConfirm, 0);
  });
})();
