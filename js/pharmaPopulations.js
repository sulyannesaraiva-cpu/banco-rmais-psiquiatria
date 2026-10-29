/* Populações especiais na tela de cada remédio (data/pharmaPopulations.js).
   Seis botões coloridos pelo tom; o clique abre o resumo sem redesenhar a tela. */

function pharmaPopulationData(drugId) {
  const data = window.PHARMA_POPULATIONS;
  if (!data) return null;
  const alias = data.alias[drugId];
  const entry = data.drugs[alias ? alias.to : drugId];
  return entry ? { entry, alias } : null;
}

function pharmaPopulationDetail(drugId, fieldId) {
  const data = window.PHARMA_POPULATIONS;
  const found = pharmaPopulationData(drugId);
  const field = data.fields.find((f) => f.id === fieldId);
  if (!found || !field) return "";
  const [tone, text] = found.entry[fieldId] || ["low", "Sem dados nas fontes consultadas."];
  const toneInfo = data.tones[tone];
  const cls = typeof pharmaClass === "function" ? pharmaClass() : null;
  const classNote = cls && data.classNotes[cls.id] ? data.classNotes[cls.id][fieldId] : "";
  const aliasName = found.alias && found.alias.to !== drugId && typeof pharmaDrug === "function" ? (pharmaDrug(found.alias.to)?.name || "") : "";
  return `
    <div class="pop-detail" style="--c:${toneInfo.color}">
      <div class="pop-detail-head"><strong>${escapeHtml(field.label)}</strong><span>${escapeHtml(toneInfo.label)}</span></div>
      <p>${escapeHtml(text)}</p>
      ${found.alias?.note ? `<p class="pop-note">${escapeHtml(found.alias.note)}</p>` : aliasName ? `<p class="pop-note">Mesmos dados de ${escapeHtml(aliasName)}.</p>` : ""}
      ${classNote ? `<p class="pop-note"><b>Na classe:</b> ${escapeHtml(classNote.replace(/^Na classe( \([^)]*\))?: /, ""))}</p>` : ""}
    </div>`;
}

function pharmaPopulationsBlock(drug) {
  const data = window.PHARMA_POPULATIONS;
  const found = data && pharmaPopulationData(drug.id);
  if (!found) return "";
  const open = state.pharma.pop && found.entry[state.pharma.pop] ? state.pharma.pop : null;
  return `
    <div class="pop-block" data-pop-drug="${escapeHtml(drug.id)}">
      <b>Populações especiais</b>
      <div class="pop-chips">
        ${data.fields.map((f) => {
          const tone = (found.entry[f.id] || ["low"])[0];
          const color = data.tones[tone].color;
          return `<button type="button" class="pop-chip${open === f.id ? " on" : ""}" data-pop-field="${f.id}" style="--c:${color}" aria-pressed="${open === f.id}" title="${escapeHtml(data.tones[tone].label)}"><i style="background:${color}"></i>${escapeHtml(f.label)}</button>`;
        }).join("")}
      </div>
      <div class="pop-slot">${open ? pharmaPopulationDetail(drug.id, open) : ""}</div>
    </div>`;
}

(function setupPharmaPopulations() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-pop-field]");
    if (!chip) return;
    const block = chip.closest("[data-pop-drug]");
    const field = chip.dataset.popField;
    const next = state.pharma.pop === field ? null : field;
    state.pharma.pop = next;
    savePharmaState();
    block.querySelectorAll("[data-pop-field]").forEach((b) => {
      const on = b.dataset.popField === next;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    block.querySelector(".pop-slot").innerHTML = next ? pharmaPopulationDetail(block.dataset.popDrug, next) : "";
  });
})();
