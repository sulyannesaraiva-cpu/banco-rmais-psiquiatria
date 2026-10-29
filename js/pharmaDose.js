/* Troca de medicamentos com doses em mg (Trocar) e retirada gradual (Retirar).
   Substitui renderPharmaSwitch() de js/pharmaSim.js; usa data/pharmaSwitch.js e data/pharmaDose.js.
   É uma simulação didática: o ritmo real é guiado pelos sintomas de retirada e pelo paciente. */

function doseRound(d) {
  if (d >= 10) return Math.round(d / 2.5) * 2.5;
  if (d >= 5) return Math.round(d * 2) / 2;
  if (d >= 1) return Math.round(d * 4) / 4;
  return Math.max(0.01, Math.round(d * 100) / 100);
}

function doseFmt(d) {
  if (d === null || d === undefined) return "—";
  if (d === 0) return "0";
  return `${String(Math.round(d * 100) / 100).replace(".", ",")} mg`;
}

function doseInfo(id) {
  return window.PHARMA_DOSE.drugs[id];
}

function doseCurrent(id) {
  const info = doseInfo(id);
  const saved = Number((state.pharma.switchDoses || {})[id]);
  if (!saved) return info.med;
  return Math.min(info.range[1], Math.max(Math.min(info.range[0], info.med) / 4, saved));
}

/* Metades semanais até ficar abaixo de 1/4 da dose mínima eficaz (como no exemplo do Maudsley). */
function doseHalvings(dose, floor) {
  const out = [];
  let d = dose;
  for (let i = 0; i < 8; i += 1) {
    d /= 2;
    out.push(doseRound(d));
    if (d < floor) break;
  }
  return out;
}

function pharmaSwitchSchedule(plan, fromId, toId, dose) {
  const A = doseInfo(fromId);
  const B = doseInfo(toId);
  const start = doseRound(plan.low ? B.med / 4 : B.med / 2);
  const rows = [{ label: "Hoje", a: dose, b: null, days: 0 }];
  const week = () => `Semana ${Math.floor(rows.reduce((sum, row) => sum + row.days, 0) / 7) + 1}`;
  const push = (a, b, note) => rows.push({ label: week(), a, b, note, days: 7 });
  const steps = doseHalvings(dose, A.med / 4);
  if (plan.type === "cross") {
    steps.forEach((a, i) => push(a, i === 0 ? start : B.med));
    push(0, B.med, "subir acima da dose mínima se precisar");
  } else if (plan.type === "direct") {
    let d = dose;
    while (d > A.med * 1.01) {
      d = Math.max(A.med, doseRound(d / 2));
      push(d, null, "descer até a dose mínima eficaz");
    }
    push(0, B.med, plan.toFluoxetine ? "alguns dias de sobreposição ajudam (fluoxetina demora a subir)" : "parar um e começar o outro no dia seguinte");
  } else if (plan.type === "halve") {
    const half = doseRound(dose / 2);
    push(half, start, "metade do primeiro + começa o novo");
    doseHalvings(half, A.med / 4).forEach((a) => push(a, B.med));
    push(0, B.med);
  } else {
    if (plan.type === "taper" && !plan.noTaper) steps.forEach((a) => push(a, null));
    const wait = Array.isArray(plan.wait) ? plan.wait : plan.wait ? [plan.wait, plan.wait] : null;
    if (wait) rows.push({ label: "Intervalo", a: 0, b: null, days: wait[1], gap: true, note: `sem antidepressivo: ${pharmaSwitchWaitText(plan.wait)}` });
    else push(0, null, "parar");
    push(0, start, plan.low ? "começar em dose baixa" : "começar com metade da dose mínima");
    push(0, B.med);
  }
  return rows;
}

function pharmaSwitchDoseSvg(rows, a, b, fromId, toId) {
  const total = rows.reduce((sum, row) => sum + row.days, 0) || 7;
  const x = (day) => 92 + (day / total) * 488;
  const maxA = rows[0].a || 1;
  const maxB = Math.max(doseInfo(toId).med, ...rows.map((row) => row.b || 0));
  let day = 0;
  const bars = [];
  rows.forEach((row) => {
    if (!row.days) return;
    const x1 = x(day);
    const w = x(day + row.days) - x1;
    if (row.gap) bars.push(`<rect x="${x1.toFixed(1)}" y="16" width="${w.toFixed(1)}" height="130" class="switch-gap"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="30" text-anchor="middle" class="pharma-label small">intervalo</text>`);
    if (row.a) {
      const h = (row.a / maxA) * 40;
      bars.push(`<rect x="${x1.toFixed(1)}" y="${(80 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar old"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="${(76 - h).toFixed(1)}" text-anchor="middle" class="pharma-label small">${String(row.a).replace(".", ",")}</text>`);
    }
    if (row.b) {
      const h = (row.b / maxB) * 40;
      bars.push(`<rect x="${x1.toFixed(1)}" y="${(150 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar new"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="${(146 - h).toFixed(1)}" text-anchor="middle" class="pharma-label small">${String(row.b).replace(".", ",")}</text>`);
    }
    day += row.days;
  });
  const ticks = [];
  const step = total > 45 ? 14 : 7;
  for (let d = 0; d <= total; d += step) ticks.push(`<text x="${x(d)}" y="168" text-anchor="middle" class="pharma-label small">${d}</text>`);
  return `
    <svg class="pharma-kinetics" viewBox="0 0 600 176" role="img" aria-label="Doses semana a semana na troca de ${escapeHtml(a.name)} para ${escapeHtml(b.name)}">
      <text x="8" y="58" class="pharma-label small">${escapeHtml(a.name)}</text>
      <text x="8" y="128" class="pharma-label small">${escapeHtml(b.name)}</text>
      <line x1="92" y1="80" x2="580" y2="80" class="kin-axis"></line>
      <line x1="92" y1="150" x2="580" y2="150" class="kin-axis"></line>
      ${bars.join("")}${ticks.join("")}
      <text x="580" y="12" text-anchor="end" class="pharma-label small">dias no eixo · números em mg/dia</text>
    </svg>`;
}

function doseInputHtml(id, field) {
  const info = doseInfo(id);
  const value = doseCurrent(id);
  return `<label class="dose-input"><span>Dose atual (mg/dia)</span><input type="number" inputmode="decimal" min="${Math.min(info.range[0], info.med) / 4}" max="${info.range[1]}" step="any" value="${value}" data-dose-input="${field}" data-dose-drug="${id}"></label>`;
}

function renderSwitchTabs(tab) {
  return `<div class="segmented dem-stages switch-tabs" role="group" aria-label="Troca ou retirada">
    <button type="button" class="${tab === "switch" ? "active" : ""}" data-switch-tab="switch" aria-pressed="${tab === "switch"}">Trocar</button>
    <button type="button" class="${tab === "taper" ? "active" : ""}" data-switch-tab="taper" aria-pressed="${tab === "taper"}">Retirar</button>
  </div>`;
}

function renderSwitchWithDoses(drugs, fromId, toId) {
  const data = window.PHARMA_SWITCH;
  const doseData = window.PHARMA_DOSE;
  const a = drugs.find((drug) => drug.id === fromId);
  const b = drugs.find((drug) => drug.id === toId);
  const options = (selected) => drugs.map((drug) => `<option value="${drug.id}" ${drug.id === selected ? "selected" : ""}>${escapeHtml(drug.name)}</option>`).join("");
  const plan = fromId === toId ? null : pharmaSwitchPlan(fromId, toId);
  const dose = doseCurrent(fromId);
  const rows = plan ? pharmaSwitchSchedule(plan, fromId, toId, dose) : [];
  const notes = [];
  if (plan) {
    if (plan.from === "flx" || plan.to === "flx") notes.push(data.notes.flx);
    if (plan.from === "fvx" || plan.to === "fvx") notes.push(data.notes.fvx);
    if (plan.from === "bup" || plan.to === "bup") notes.push(data.notes.bup);
    if (plan.from === "ago" || plan.to === "ago") notes.push(data.notes.ago);
    if (fromId === "vortioxetina" || toId === "vortioxetina") notes.push(data.notes.vortioxetina);
    if (toId === "duloxetina" && (plan.from === "ssri" || fromId === "venlafaxina")) notes.push(data.notes.duloxetina);
    if (plan.toFluoxetine) notes.push(data.notes.toFluoxetine);
    if (doseInfo(fromId).highRisk) notes.push(`${a.name} está entre os antidepressivos mais associados a sintomas de retirada: degraus mais lentos podem ser necessários.`);
  }
  const serotonergic = ["mao", "moc"].includes(plan?.from) || ["mao", "moc"].includes(plan?.to);
  const tone = !plan ? "low" : plan.type === "direct" ? "good" : plan.type === "cross" || plan.type === "halve" ? "ok" : "warn";
  const typeLabel = { cross: "Redução cruzada", direct: "Troca direta", halve: "Metade + acréscimo", stop: "Parar e esperar", taper: plan?.wait ? "Reduzir, parar e esperar" : "Reduzir, parar e começar" };
  const medText = (id) => `${doseInfo(id).medNote || String(doseInfo(id).med).replace(".", ",")} mg/dia`;
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>De</span><select data-pharma-switch="from">${options(fromId)}</select></label>
          <button type="button" class="link-btn" data-pharma-switch-swap aria-label="Inverter">⇄</button>
          <label><span>Para</span><select data-pharma-switch="to">${options(toId)}</select></label>
        </div>
        <div class="switch-pick">${doseInputHtml(fromId, "switch")}
          <p class="dose-med">Dose mínima eficaz: <b>${escapeHtml(a.name)}</b> ${escapeHtml(medText(fromId))}${b && fromId !== toId ? ` · <b>${escapeHtml(b.name)}</b> ${escapeHtml(medText(toId))}` : ""}</p>
        </div>
        ${plan ? `
          <div class="pharma-reading tone-${tone}"><strong>${typeLabel[plan.type]}</strong><span>${escapeHtml(pharmaSwitchText(plan, a, b))}</span></div>
          ${pharmaSwitchDoseSvg(rows, a, b, fromId, toId)}
          <div class="atlas-legend"><span><i style="background:#9fb3b6"></i>${escapeHtml(a.name)}</span><span><i style="background:#0b6b70"></i>${escapeHtml(b.name)}</span></div>
          <table class="dose-table">
            <thead><tr><th></th><th>${escapeHtml(a.name)}</th><th>${escapeHtml(b.name)}</th><th></th></tr></thead>
            <tbody>${rows.map((row, i) => `<tr class="${row.gap ? "gap" : ""}"><th>${escapeHtml(row.label)}</th><td>${row.a === 0 && i > 0 ? (rows[i - 1].a > 0 ? "parar" : "—") : doseFmt(row.a)}</td><td>${doseFmt(row.b)}</td><td>${escapeHtml(row.note || "")}</td></tr>`).join("")}</tbody>
          </table>
          <div class="pharma-reading tone-warn"><strong>Na vida real</strong><span>${escapeHtml(doseData.patient)}</span></div>`
          : `<div class="pharma-reading tone-low"><strong>Escolha dois antidepressivos diferentes</strong><span>A troca é calculada a partir do grupo de cada um (ISRS, IRSN, tricíclico, IMAO etc.).</span></div>`}
      </section>
      <section class="pharma-card">
        ${notes.length ? `<h3>Atenção nesta troca</h3>${notes.map((note) => `<div class="pharma-reading tone-warn"><span>${escapeHtml(note)}</span></div>`).join("")}` : ""}
        ${serotonergic ? `<div class="pharma-reading tone-high"><strong>IMAO na troca</strong><span>Muitos casos graves de síndrome serotoninérgica envolvem um IMAO (inclusive moclobemida) com ISRS: respeitar o intervalo.</span></div>` : ""}
        <h4>Como o cronograma foi montado</h4>
        <div class="pharma-reading tone-ok"><span>${escapeHtml(doseData.example)}</span></div>
        <h4>Regras gerais</h4>
        <ul class="fronto-signs">${data.general.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h4>Retirada ou síndrome serotoninérgica?</h4>
        <div class="pharma-reading tone-low"><strong>Retirada</strong><span>${escapeHtml(doseData.withdrawal)}</span></div>
        ${data.serotoninSyndrome.map((item) => `<div class="pharma-reading tone-${item.level === "Grave" ? "high" : item.level === "Moderada" ? "warn" : "ok"}"><strong>Serotoninérgica ${item.level.toLowerCase()}</strong><span>${escapeHtml(item.text)}</span></div>`).join("")}
      </section>
    </div>`;
}

/* ---------- Retirar: redução proporcional (hiperbólica) ---------- */

function taperRiskLevel(drugId) {
  const use = state.pharma.taperUse || "mid";
  const history = Boolean(state.pharma.taperHistory);
  if (use === "gt24" || history || doseInfo(drugId).highRisk) return "high";
  if (use === "lt6") return "low";
  return "mid";
}

function taperSteps(dose, pct, floor) {
  const steps = [dose];
  let d = dose;
  for (let i = 0; i < 80 && d > floor; i += 1) {
    d *= 1 - pct / 100;
    steps.push(doseRound(d));
  }
  return steps;
}

function sertOccupancy(dose, med) {
  const ed50 = med * (100 / window.PHARMA_DOSE.sertAtMed - 1);
  return dose <= 0 ? 0 : (100 * dose) / (dose + ed50);
}

function taperSvg(steps, info, weeks) {
  const n = steps.length;
  const x = (i) => 50 + (i / n) * 530;
  const max = steps[0];
  const bars = steps.map((d, i) => {
    const h = (d / max) * 110;
    return `<rect x="${x(i).toFixed(1)}" y="${(140 - h).toFixed(1)}" width="${(x(i + 1) - x(i) - 1).toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar old"></rect>`;
  }).join("");
  const occ = info.sert ? `<polyline points="${steps.map((d, i) => `${(x(i) + (x(i + 1) - x(i)) / 2).toFixed(1)},${(140 - sertOccupancy(d, info.med) * 1.1).toFixed(1)}`).join(" ")}" class="taper-occ"></polyline>` : "";
  const ticks = [];
  const every = Math.max(1, Math.ceil(n / 8));
  for (let i = 0; i < n - every / 2; i += every) ticks.push(`<text x="${x(i).toFixed(1)}" y="158" text-anchor="middle" class="pharma-label small">${Math.round((i * weeks) / 4.3)}</text>`);
  return `
    <svg class="pharma-kinetics" viewBox="0 0 600 168" role="img" aria-label="Dose em cada degrau da retirada">
      <line x1="50" y1="140" x2="580" y2="140" class="kin-axis"></line>
      ${bars}${occ}${ticks.join("")}
      <text x="46" y="34" text-anchor="end" class="pharma-label small">${String(max).replace(".", ",")} mg</text>
      <text x="580" y="158" text-anchor="end" class="pharma-label small">meses</text>
    </svg>`;
}

function taperLinearCompare(dose, info) {
  /* Mesma dose retirada em 4 degraus iguais (linear) × degraus proporcionais: queda de ocupação do SERT a cada passo. */
  const linear = [1, 0.75, 0.5, 0.25, 0].map((f) => dose * f);
  const drops = linear.slice(1).map((d, i) => sertOccupancy(linear[i], info.med) - sertOccupancy(d, info.med));
  return `<div class="taper-compare">${drops.map((drop, i) => `<div><span>${doseFmt(doseRound(linear[i]))} → ${linear[i + 1] ? doseFmt(doseRound(linear[i + 1])) : "0"}</span><i style="width:${Math.max(4, drop)}%"></i><b>−${Math.round(drop)} pontos</b></div>`).join("")}</div>`;
}

function renderTaper(drugs) {
  const doseData = window.PHARMA_DOSE;
  const drugId = doseInfo(state.pharma.taperDrug) ? state.pharma.taperDrug : "sertralina";
  const drug = drugs.find((item) => item.id === drugId);
  const info = doseInfo(drugId);
  const dose = doseCurrent(drugId);
  const level = taperRiskLevel(drugId);
  const risk = doseData.risk[level];
  const pct = Number(state.pharma.taperPct) || risk.pct;
  const weeks = Number(state.pharma.taperWeeks) === 4 ? 4 : 2;
  const steps = taperSteps(dose, pct, info.med * 0.01);
  const months = (n) => Math.round((n * weeks) / 4.3);
  const shown = steps.length > 12 ? [...steps.slice(0, 8).map((d, i) => [i, d]), null, ...steps.slice(-3).map((d, i) => [steps.length - 3 + i, d])] : steps.map((d, i) => [i, d]);
  const use = state.pharma.taperUse || "mid";
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>Antidepressivo</span><select data-taper-field="drug">${drugs.map((item) => `<option value="${item.id}" ${item.id === drugId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>
          ${doseInputHtml(drugId, "taper")}
        </div>
        <div class="switch-pick taper-risk">
          <label><span>Tempo de uso</span><select data-taper-field="use">
            <option value="lt6" ${use === "lt6" ? "selected" : ""}>menos de 6 meses</option>
            <option value="mid" ${use === "mid" ? "selected" : ""}>6 a 24 meses</option>
            <option value="gt24" ${use === "gt24" ? "selected" : ""}>mais de 24 meses</option>
          </select></label>
          <label class="taper-check"><input type="checkbox" data-taper-field="history" ${state.pharma.taperHistory ? "checked" : ""}> <span>Retirada difícil no passado</span></label>
        </div>
        <div class="pharma-reading tone-${level === "high" ? "high" : level === "mid" ? "warn" : "ok"}"><strong>Risco ${risk.label.toLowerCase()} de retirada · sugestão: ${risk.range}</strong><span>${escapeHtml(risk.text)}</span></div>
        <div class="switch-pick">
          <label><span>Redução por degrau</span><select data-taper-field="pct">${[5, 10, 15, 20, 25, 50].map((p) => `<option value="${p}" ${p === pct ? "selected" : ""}>${p}% da última dose</option>`).join("")}</select></label>
          <label><span>Intervalo</span><select data-taper-field="weeks"><option value="2" ${weeks === 2 ? "selected" : ""}>a cada 2 semanas</option><option value="4" ${weeks === 4 ? "selected" : ""}>a cada 4 semanas</option></select></label>
        </div>
        <div class="pharma-reading tone-low"><strong>${steps.length - 1} degraus · cerca de ${months(steps.length)} meses</strong><span>Simulação: o ritmo real se ajusta aos sintomas, degrau a degrau.</span></div>
        ${taperSvg(steps, info, weeks)}
        <div class="atlas-legend"><span><i style="background:#9fb3b6"></i>dose (mg/dia)</span>${info.sert ? '<span><i style="background:#d55e00"></i>ocupação estimada do SERT</span>' : ""}</div>
        <table class="dose-table">
          <thead><tr><th>Degrau</th><th>Dose</th><th>Semana</th></tr></thead>
          <tbody>${shown.map((item) => item ? `<tr><th>${item[0] === 0 ? "Hoje" : item[0]}</th><td>${doseFmt(item[1])}</td><td>${item[0] * weeks}</td></tr>` : '<tr class="gap"><th>…</th><td>…</td><td></td></tr>').join("")}
            <tr><th>Fim</th><td>parar</td><td>${steps.length * weeks}</td></tr></tbody>
        </table>
        ${steps[steps.length - 1] < 1 ? '<p class="pharma-extra">As últimas doses ficam abaixo de 1 mg: na prática exigem solução oral ou formulação manipulada.</p>' : ""}
      </section>
      <section class="pharma-card">
        ${info.sert ? `<h3>Por que reduzir em porcentagem?</h3>
          <p class="pharma-extra">A ocupação do SERT segue uma curva hiperbólica: perto de zero, poucos mg mudam muito o efeito. Tirar ${escapeHtml(drug.name.toLowerCase())} em 4 degraus iguais de mg:</p>
          ${taperLinearCompare(dose, info)}
          <p class="pharma-extra">O último degrau derruba a ocupação muito mais que o primeiro. Degraus proporcionais (${pct}% da última dose) mantêm a queda parecida a cada passo.</p>` : `<h3>Retirada gradual</h3><p class="pharma-extra">O princípio da redução proporcional vale para os outros antidepressivos, mesmo sem um alvo único para medir a ocupação.</p>`}
        ${info.longHalfLife ? '<div class="pharma-reading tone-warn"><strong>Fluoxetina</strong><span>A meia-vida longa atrasa os sintomas de retirada por semanas: avaliar com mais tempo antes do próximo degrau.</span></div>' : ""}
        <h4>Como conduzir</h4>
        <ul class="fronto-signs">${doseData.taperRules.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="pharma-reading tone-low"><strong>Retirada ou recaída?</strong><span>${escapeHtml(doseData.withdrawal)}</span></div>
        <div class="pharma-reading tone-warn"><strong>Na vida real</strong><span>${escapeHtml(doseData.patient)}</span></div>
      </section>
    </div>`;
}

renderPharmaSwitch = function renderPharmaSwitchWithDoses() {
  const data = window.PHARMA_SWITCH;
  const drugs = (window.PHARMA_SIM.antidepressivos?.drugs || []).filter((drug) => data.groupOf[drug.id] && doseInfo(drug.id));
  const fromId = data.groupOf[state.pharma.switchFrom] ? state.pharma.switchFrom : "sertralina";
  const toId = data.groupOf[state.pharma.switchTo] ? state.pharma.switchTo : "mirtazapina";
  const tab = state.pharma.switchTab === "taper" ? "taper" : "switch";
  const refCount = ((window.PHARMA_REFS || {}).troca?.paths || []).length;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-pharma-hub>← Psicofarmacologia</button>
          <button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>
        </div>
        <h2>Troca de medicamentos</h2>
        <p>Antidepressivos, com doses em mg: passar de um para outro (Trocar) ou parar aos poucos (Retirar), conforme o Maudsley.</p>
      </div>
    </header>
    ${renderSwitchTabs(tab)}
    ${tab === "taper" ? renderTaper(drugs) : renderSwitchWithDoses(drugs, fromId, toId)}
    <p class="pharma-disclaimer">Simulação didática para estudo, não para prescrição. As doses de cada degrau são exemplos: o ritmo real respeita os sintomas de retirada e as condições de cada paciente.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "troca", label: "Troca de medicamentos" }, "paths", tab === "taper" ? "Retirada" : "Troca") : ""}`;
};

(function setupPharmaDose() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-switch-tab]");
    if (!target) return;
    state.pharma.switchTab = target.dataset.switchTab;
    if (state.pharma.switchTab === "taper" && !state.pharma.taperDrug) state.pharma.taperDrug = state.pharma.switchFrom || "sertralina";
    savePharmaState();
    renderPharmaPanel();
  });
  panel.addEventListener("change", (event) => {
    const el = event.target;
    if (el.matches("[data-dose-input]")) {
      const value = Number(String(el.value).replace(",", "."));
      if (value > 0) state.pharma.switchDoses = { ...(state.pharma.switchDoses || {}), [el.dataset.doseDrug]: value };
    } else if (el.matches("[data-taper-field]")) {
      const field = el.dataset.taperField;
      if (field === "drug") { state.pharma.taperDrug = el.value; state.pharma.taperPct = null; }
      if (field === "use") { state.pharma.taperUse = el.value; state.pharma.taperPct = null; }
      if (field === "history") { state.pharma.taperHistory = el.checked; state.pharma.taperPct = null; }
      if (field === "pct") state.pharma.taperPct = Number(el.value);
      if (field === "weeks") state.pharma.taperWeeks = Number(el.value);
    } else return;
    savePharmaState();
    renderPharmaPanel();
  });
})();
