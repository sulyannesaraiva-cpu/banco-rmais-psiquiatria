/* Segurança: eventos adversos graves e emergências (data/pharmaSafety.js).
   Ferramenta da Psicofarmacologia e alertas na tela de cada remédio. */

function pharmaSafetyEventsFor(clsId, drugId) {
  return (window.PHARMA_SAFETY?.events || []).filter((event) => event.drugs.some((g) => g.cls === clsId && g.ids.includes(drugId)));
}

function pharmaSafetyChips(drug) {
  const cls = typeof pharmaClass === "function" ? pharmaClass() : null;
  if (!cls) return "";
  const events = pharmaSafetyEventsFor(cls.id, drug.id);
  if (!events.length) return "";
  return `
    <div class="pharma-safety-chips">
      <b>Segurança</b>
      ${events.map((e) => `<button type="button" class="pharma-toggle" data-pharma-safety-open="${e.id}" style="--c:${e.color}"><i style="background:${e.color}"></i>${escapeHtml(e.title)}</button>`).join("")}
    </div>`;
}

function pharmaSafetyDrugName(clsId, drugId) {
  const drug = (window.PHARMA_SIM[clsId]?.drugs || []).find((d) => d.id === drugId);
  return drug ? drug.name : drugId;
}

function renderPharmaSafety() {
  const data = window.PHARMA_SAFETY;
  const event = data.events.find((e) => e.id === state.pharma.safety) || null;
  const refCount = ((window.PHARMA_REFS || {}).seguranca?.paths || []).length;
  const list = (title, items, tone) => (items?.length ? `<div class="pharma-reading tone-${tone}"><strong>${title}</strong><span>${items.map((t) => `• ${escapeHtml(t)}`).join("<br>")}</span></div>` : "");
  const drugGroups = event ? event.drugs.map((g) => `
    <div class="safety-drugs">
      <span class="safety-class">${escapeHtml(window.PHARMA_SIM[g.cls]?.label || g.cls)}</span>
      <div class="pharma-toggles">${g.ids.map((id) => `<button type="button" class="pharma-toggle" data-safety-drug="${g.cls}:${id}">${escapeHtml(pharmaSafetyDrugName(g.cls, id))}</button>`).join("")}</div>
      ${g.note ? `<small>${escapeHtml(g.note)}</small>` : ""}
    </div>`).join("") : "";
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-pharma-hub>← Psicofarmacologia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Segurança</h2>
        <p>Eventos graves e emergências com psicofármacos: quando suspeitar, como confirmar, o que fazer e como prevenir.</p>
      </div>
    </header>
    <div class="safety-list">
      ${data.events.map((e) => `<button type="button" class="safety-card${event?.id === e.id ? " on" : ""}" data-safety-event="${e.id}" style="--c:${e.color}" aria-pressed="${event?.id === e.id}">
        <span class="safety-tag">${escapeHtml(e.tag)}</span>
        <span class="safety-text"><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.summary)}</small></span>
      </button>`).join("")}
    </div>
    ${event ? `
      <section class="pharma-card safety-detail" style="--c:${event.color}">
        <div class="pharma-card-head"><h3>${escapeHtml(event.title)}</h3><span>${escapeHtml(event.urgency)}</span></div>
        <p class="safety-onset"><b>Quando aparece:</b> ${escapeHtml(event.onset)}</p>
        <div class="pharma-grid">
          <div>
            ${list("Quando suspeitar", event.signs, "high")}
            ${list("Como confirmar", event.check, "low")}
            ${list("O que fazer", event.manage, "warn")}
          </div>
          <div>
            ${list("Fatores de risco", event.risk, "low")}
            ${list("Prevenção e seguimento", event.prevent, "ok")}
            ${event.differential ? `<div class="pharma-reading tone-low"><strong>Diferencial</strong><span>${escapeHtml(event.differential)}</span></div>` : ""}
          </div>
        </div>
        <h4>Remédios do simulador ligados a este evento</h4>
        ${drugGroups}
      </section>` : `<div class="pharma-reading tone-low"><strong>Escolha um evento</strong><span>Na tela de cada remédio, os eventos graves ligados a ele aparecem em "Segurança".</span></div>`}
    <p class="pharma-disclaimer">Material didático para estudo; em emergência, seguir protocolos do serviço. Doses citadas são as do livro de referência.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "seguranca", label: "Segurança" }, "paths", event ? event.title : "Segurança") : ""}`;
}

(function setupPharmaSafety() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-pharma-safety-open], [data-safety-event], [data-safety-drug]");
    if (!target) return;
    const data = target.dataset;
    if (data.pharmaSafetyOpen !== undefined) {
      state.pharma.view = "safety";
      state.pharma.safety = data.pharmaSafetyOpen || null;
    } else if (data.safetyEvent) {
      state.pharma.safety = state.pharma.safety === data.safetyEvent ? null : data.safetyEvent;
    } else if (data.safetyDrug) {
      const [cls, id] = data.safetyDrug.split(":");
      setPharmaClass(cls);
      state.pharma.view = "class";
      state.pharma.mode = "paths";
      state.pharma.drug = id;
      state.pharma.occupancy = pharmaDefaultOccupancy(pharmaDrug(id));
      resetPharmaLevel(pharmaDrug(id));
    }
    state.pharma.sourcesOpen = false;
    savePharmaState();
    renderPharmaPanel();
    const detail = (data.safetyEvent || data.pharmaSafetyOpen) && panel.querySelector(".safety-detail");
    (detail || panel).scrollIntoView({ block: "start" });
  });
})();
