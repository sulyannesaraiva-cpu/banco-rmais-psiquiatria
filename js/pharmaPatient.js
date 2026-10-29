/* Aba Paciente do Simular: perfil, comorbidades, prioridades e escolha dentro de uma classe.
   O resultado separa os remédios em preferir, cautela e evitar, sempre com os motivos e a fonte.
   Não dá nota única nem "o melhor": a decisão fica com quem estuda. */

function pharmaComorbSrc(cond) {
  const src = (window.PHARMA_COMORB.sources || {})[cond.src] || cond.src;
  return `${src}, ${cond.where}`;
}

/* Motivos que vêm das comorbidades marcadas. kind: good, caution ou avoid. */
function pharmaComorbReasons(item, p) {
  const data = window.PHARMA_COMORB;
  if (!data) return [];
  const out = [];
  p.comorb.forEach((condId) => {
    const cond = data.conditions.find((c) => c.id === condId);
    if (!cond) return;
    const rules = cond.rules[item.cls.id] || {};
    [["prefer", "good"], ["caution", "caution"], ["avoid", "avoid"]].forEach(([key, kind]) => {
      (rules[key] || []).forEach(([ids, text, srcKey, where]) => {
        if (!ids.includes(item.drug.id)) return;
        const src = srcKey ? `${data.sources[srcKey] || srcKey}, ${where}` : pharmaComorbSrc(cond);
        out.push({ kind, cond: cond.label, text, src });
      });
    });
    (cond.effects || []).forEach((hook) => {
      if (!hook.classes.includes(item.cls.id)) return;
      const level = item.drug.effects?.[hook.key];
      if (level != null && level >= hook.min) out.push({ kind: hook.tone, cond: cond.label, text: hook.text, src: "níveis de efeito do simulador" });
    });
  });
  return out;
}

const PHARMA_PRIO_LEVELS = ["nenhum", "leve", "moderado", "forte"];

/* Todos os motivos para um remédio, com o perfil inteiro. */
function pharmaPatientReasons(item, p) {
  const reasons = pharmaComorbReasons(item, p);
  const popData = window.PHARMA_POPULATIONS;
  const pop = popData && typeof pharmaPopulationData === "function" ? pharmaPopulationData(item.drug.id) : null;
  if (pop) {
    pharmaPatientPopFields(p).forEach((f) => {
      const entry = pop.entry[f];
      if (!entry) return;
      const field = popData.fields.find((x) => x.id === f);
      const kind = { high: "avoid", warn: "caution", low: "caution", ok: "good" }[entry[0]];
      reasons.push({ kind, cond: field.label, text: entry[0] === "low" ? `Poucos dados. ${entry[1]}` : entry[1], src: "Dieckmann e Haddad (2025); gestação e lactação: CANMAT 2024" });
    });
  }
  const meds = p.meds.filter((id) => id !== item.drug.id);
  if (meds.length && typeof pharmaCrossInteractions === "function") {
    pharmaCrossInteractions([item.drug.id, ...meds]).forEach((i) => {
      reasons.push({ kind: i.tone === "high" ? "avoid" : "caution", cond: "Interação", text: `${i.title}. ${i.text}`, src: i.source });
    });
  }
  if (p.smoke && typeof pharmaSmokingWarnings === "function") {
    pharmaSmokingWarnings([item.drug.id], p.smoke).filter((w) => w.tone !== "good").forEach((w) => reasons.push({ kind: "caution", cond: "Tabagismo", text: w.text, src: w.source }));
  }
  const prios = (window.PHARMA_COMORB?.priorities || []).filter((x) => p.prio.includes(x.id));
  prios.forEach((prio) => {
    const key = prio.key[item.cls.id];
    if (!key) return;
    const level = item.drug.effects?.[key];
    if (level == null) return;
    const name = prio.label.replace(/^(Evitar|Quer) /, "").replace(/ \(.*\)$/, "");
    if (prio.want) {
      if (level >= 2) reasons.push({ kind: "good", cond: "Prioridade", text: `Sedação ${PHARMA_PRIO_LEVELS[level]}: ajuda no sono.`, src: "níveis de efeito do simulador" });
      else if (level === 0) reasons.push({ kind: "note", cond: "Prioridade", text: "Não seda: não ajuda no sono.", src: "níveis de efeito do simulador" });
    } else if (level >= 3) reasons.push({ kind: "caution", cond: "Prioridade", text: `${name.charAt(0).toUpperCase() + name.slice(1)}: efeito forte.`, src: "níveis de efeito do simulador" });
    else if (level === 2) reasons.push({ kind: "note", cond: "Prioridade", text: `${name.charAt(0).toUpperCase() + name.slice(1)}: efeito moderado.`, src: "níveis de efeito do simulador" });
    else if (level === 0) reasons.push({ kind: "good", cond: "Prioridade", text: `Pouco ou nenhum efeito de ${name}.`, src: "níveis de efeito do simulador" });
  });
  const br = (window.PHARMA_BRAZIL || {})[item.drug.id];
  if (br && br.available === false) reasons.push({ kind: "caution", cond: "Brasil", text: "Sem venda no Brasil.", src: "Dieckmann e Haddad (2025), Nomes no Brasil" });
  return reasons;
}

function pharmaPatientEvaluate(clsId, p) {
  const cls = window.PHARMA_SIM[clsId];
  if (!cls) return [];
  return cls.drugs.map((drug) => {
    const item = { drug, cls };
    const reasons = pharmaPatientReasons(item, p);
    const count = (k) => reasons.filter((r) => r.kind === k).length;
    const group = count("avoid") ? "avoid" : count("caution") ? "caution" : count("good") ? "good" : "neutral";
    return { item, reasons, group, good: count("good"), caution: count("caution") };
  }).sort((a, b) => b.good - a.good || a.caution - b.caution || a.item.drug.name.localeCompare(b.item.drug.name, "pt-BR"));
}

function pharmaPatientRow(row) {
  const order = { avoid: 0, caution: 1, note: 2, good: 3 };
  const reasons = [...row.reasons].sort((a, b) => order[a.kind] - order[b.kind]);
  return `
    <div class="pt-row pt-${row.group}">
      <button type="button" class="pt-name" data-pcard-open="${row.item.cls.id}:${row.item.drug.id}">${escapeHtml(row.item.drug.name)} <span aria-hidden="true">›</span></button>
      ${reasons.length ? `<ul class="pt-reasons">${reasons.map((r) => `<li class="pt-r-${r.kind}"><b>${escapeHtml(r.cond)}:</b> ${escapeHtml(r.text)} <small>${escapeHtml(r.src)}</small></li>`).join("")}</ul>` : `<p class="pt-none">Nada no perfil muda a escolha deste remédio.</p>`}
    </div>`;
}

function pharmaPatientResults(clsId, p) {
  const rows = pharmaPatientEvaluate(clsId, p);
  const data = window.PHARMA_COMORB;
  const notes = p.comorb.map((id) => data.conditions.find((c) => c.id === id)).filter((c) => c && c.note && (c.noteAll || !c.rules[clsId])).map((c) => `<b>${escapeHtml(c.label)}:</b> ${escapeHtml(c.note)}`);
  const noRules = p.comorb.map((id) => data.conditions.find((c) => c.id === id)).filter((c) => c && !c.rules[clsId] && !c.note && !(c.effects || []).some((h) => h.classes.includes(clsId))).map((c) => c.label);
  const groups = [
    ["good", "Mais favoráveis", "Têm ponto a favor para este perfil e nenhum alerta."],
    ["neutral", "Sem alerta nas fontes", "Nenhuma regra das fontes, nem a favor nem contra, para este perfil: não quer dizer que sejam seguros."],
    ["caution", "Usar com cautela", "Têm algum alerta, mas podem ser usados com ajuste ou monitorização."],
    ["avoid", "Evitar", "Contraindicação ou risco alto para este perfil."],
  ];
  return `
    ${notes.length ? `<p class="pt-small">${notes.join("<br>")}</p>` : ""}
    ${noRules.length ? `<p class="pt-small">Sem regra das fontes para esta classe em: ${escapeHtml(noRules.join(", "))}.</p>` : ""}
    ${groups.map(([id, title, hint]) => {
      const list = rows.filter((r) => r.group === id);
      if (id === "neutral") {
        if (!list.length) return "";
        return `
        <div class="pt-group pt-group-neutral">
          <div class="pt-group-head"><strong>${title}</strong><span>${list.length}</span></div>
          <small class="pt-hint">${hint}</small>
          <div class="pharma-toggles">${list.map((r) => `<button type="button" class="pharma-toggle" data-pcard-open="${r.item.cls.id}:${r.item.drug.id}">${escapeHtml(r.item.drug.name)}</button>`).join("")}</div>
        </div>`;
      }
      return `
        <div class="pt-group pt-group-${id}">
          <div class="pt-group-head"><strong>${title}</strong><span>${list.length}</span></div>
          <small class="pt-hint">${hint}</small>
          ${list.length ? list.map(pharmaPatientRow).join("") : `<p class="pt-none">Nenhum.</p>`}
        </div>`;
    }).join("")}`;
}

function renderPatientTab() {
  const data = window.PHARMA_COMORB;
  const p = pharmaPatient();
  const clsId = data.classes.includes(state.pharma.patientClass) ? state.pharma.patientClass : "antidepressivos";
  const refCount = ((window.PHARMA_REFS || {}).paciente?.paths || []).length;
  const section = (id, label) => `<button type="button" class="${id === "patient" ? "active" : ""}" data-sim-section="${id}" aria-pressed="${id === "patient"}">${label}</button>`;
  return `
    <header class="pharma-head pharma-hub-head">
      <div>
        <div class="pharma-head-top">
          <h2>Paciente</h2>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <p>Monte um paciente e compare os remédios de uma classe: o que preferir, o que usar com cautela e o que evitar, com o motivo e a fonte.</p>
      </div>
      <div class="segmented pharma-sections" role="group" aria-label="Seção">
        ${section("drugs", "Psicofarmacologia")}${section("atlas", "Neuroanatomia")}${section("patient", "Paciente")}
      </div>
    </header>
    ${pharmaPatientForm(true)}
    <section class="pharma-card">
      <div class="pharma-card-head"><h3>Comorbidades</h3><span>${p.comorb.length ? `${p.comorb.length} marcada${p.comorb.length > 1 ? "s" : ""}` : "nenhuma"}</span></div>
      ${data.groups.map((g) => {
        const conds = data.conditions.filter((c) => c.group === g.id);
        if (!conds.length) return "";
        return `<div class="pt-cond-group"><small>${escapeHtml(g.label)}</small><div class="pharma-toggles">${conds.map((c) => `<button type="button" class="pharma-toggle${p.comorb.includes(c.id) ? " on" : ""}" data-pt-comorb="${c.id}" aria-pressed="${p.comorb.includes(c.id)}">${escapeHtml(c.label)}</button>`).join("")}</div></div>`;
      }).join("")}
    </section>
    <section class="pharma-card">
      <div class="pharma-card-head"><h3>Prioridades</h3><span>o que buscar ou evitar</span></div>
      <div class="pharma-toggles">${data.priorities.map((x) => `<button type="button" class="pharma-toggle${p.prio.includes(x.id) ? " on" : ""}" data-pt-prio="${x.id}" aria-pressed="${p.prio.includes(x.id)}">${escapeHtml(x.label)}</button>`).join("")}</div>
    </section>
    <section class="pharma-card pt-result">
      <div class="pharma-card-head"><h3>Escolher dentro da classe</h3></div>
      <div class="pharma-chips" role="group" aria-label="Classe">
        ${data.classes.map((id) => `<button type="button" class="pharma-chip${id === clsId ? " on" : ""}" data-pt-class="${id}" aria-pressed="${id === clsId}">${escapeHtml(window.PHARMA_SIM[id]?.label || id)}</button>`).join("")}
      </div>
      ${pharmaPatientResults(clsId, p)}
      <p class="pt-small">A separação soma os motivos acima (regra nossa); não é uma recomendação publicada. Toque no nome do remédio para abrir a ficha.</p>
    </section>
    <p class="pharma-disclaimer">Material didático para estudo. A escolha real depende da indicação, da história de resposta e da preferência do paciente.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "paciente", label: "Paciente" }, "paths", "Escolha por perfil") : ""}`;
}

(function setupPharmaPatient() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const t = event.target.closest("[data-pt-comorb], [data-pt-prio], [data-pt-class]");
    if (!t) return;
    const d = t.dataset;
    const p = pharmaPatient();
    const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    if (d.ptComorb) state.pharma.patient = { ...p, comorb: toggle(p.comorb, d.ptComorb) };
    else if (d.ptPrio) {
      let prio = toggle(p.prio, d.ptPrio);
      const conflict = (window.PHARMA_COMORB.priorities.find((x) => x.id === d.ptPrio) || {}).conflicts;
      if (conflict && prio.includes(d.ptPrio)) prio = prio.filter((x) => x !== conflict);
      state.pharma.patient = { ...p, prio };
    } else if (d.ptClass) state.pharma.patientClass = d.ptClass;
    savePharmaState();
    const y = window.scrollY;
    panel.dataset.renderedHtml = "";
    renderPharmaPanel();
    window.scrollTo(0, y);
  });
})();
