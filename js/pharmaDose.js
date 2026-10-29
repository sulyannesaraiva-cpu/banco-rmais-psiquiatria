/* Troca de medicamentos com doses em mg: antidepressivos, antipsicóticos e benzodiazepínicos,
   cada um com "Trocar" e "Retirar" (redução proporcional da última dose).
   Substitui renderPharmaSwitch() de js/pharmaSim.js; usa data/pharmaSwitch.js e data/pharmaDose.js.
   É uma simulação didática: o ritmo real é guiado pelos sintomas de retirada e pelo paciente. */

const DOSE_CLASSES = [
  { id: "ad", label: "Antidepressivos", sim: "antidepressivos" },
  { id: "ap", label: "Antipsicóticos", sim: "antipsicoticos" },
  { id: "bz", label: "Benzodiazepínicos", sim: "ansioliticos" },
];

function doseRound(d) {
  if (d >= 10) return Math.round(d / 2.5) * 2.5;
  if (d >= 5) return Math.round(d * 2) / 2;
  if (d >= 1) return Math.round(d * 4) / 4;
  return Math.max(0.01, Math.round(d * 100) / 100);
}

function doseNum(d) {
  return String(Math.round(d * 100) / 100).replace(".", ",");
}

function doseFmt(d) {
  if (d === null || d === undefined) return "—";
  if (d === 0) return "0";
  return `${doseNum(d)} mg`;
}

function doseTable(cls) {
  const data = window.PHARMA_DOSE;
  return cls === "ap" ? data.ap.drugs : cls === "bz" ? data.bz.drugs : data.drugs;
}

function doseInfo(id) {
  const data = window.PHARMA_DOSE;
  return data.drugs[id] || data.ap.drugs[id] || data.bz.drugs[id];
}

function doseDefault(info) {
  return info.dose || info.med || info.eq || info.range[0];
}

function doseCurrent(id) {
  const info = doseInfo(id);
  const saved = Number((state.pharma.switchDoses || {})[id]);
  if (!saved) return Math.min(info.range[1], doseDefault(info));
  return Math.min(info.range[1], Math.max(info.range[0] / 4, saved));
}

function doseDrugs(cls) {
  const meta = DOSE_CLASSES.find((item) => item.id === cls);
  const table = doseTable(cls);
  const drugs = (window.PHARMA_SIM[meta.sim]?.drugs || []).filter((drug) => table[drug.id]);
  if (cls === "ad") return drugs.filter((drug) => window.PHARMA_SWITCH.groupOf[drug.id]);
  return drugs;
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

function scheduleWeekLabel(rows) {
  const days = rows.reduce((sum, row) => sum + row.days, 0);
  return `Semana ${Math.floor(days / 7) + 1}`;
}

/* ---------- Antidepressivos: tabela de trocas do Maudsley ---------- */

function pharmaSwitchSchedule(plan, fromId, toId, dose) {
  const A = doseInfo(fromId);
  const B = doseInfo(toId);
  const start = doseRound(plan.low ? B.med / 4 : B.med / 2);
  const rows = [{ label: "Hoje", a: dose, b: null, days: 0 }];
  const push = (a, b, note) => rows.push({ label: scheduleWeekLabel(rows), a, b, note, days: 7 });
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

/* ---------- Antipsicóticos: regras de troca do Stahl ---------- */

const AP_LOW_SEDATION = ["risperidona", "ziprasidona", "lurasidona", "haloperidol"];

function apSwitchSchedule(fromId, toId, dose) {
  const A = doseInfo(fromId);
  const B = doseInfo(toId);
  const target = B.med;
  const slow = B.slowStart && AP_LOW_SEDATION.includes(fromId);
  const rows = [{ label: "Hoje", a: dose, b: null, days: 0 }];
  const push = (a, b, note, days = 7) => rows.push({ label: scheduleWeekLabel(rows), a, b, note, days });
  if (slow) {
    push(dose, doseRound(target / 4), "novo em dose baixa: sobe devagar pela sedação");
    push(dose, doseRound(target / 2));
  } else {
    push(dose, target, "começar com metade e chegar à dose-alvo em 3–7 dias");
  }
  const offSteps = { none: [], w1: [0.5], w4: [0.75, 0.5, 0.25], w4plus: [0.75, 0.5, 0.25] }[A.off];
  const stepDays = A.off === "w4plus" ? 14 : 7;
  offSteps.forEach((f) => push(doseRound(dose * f), target, A.off === "w4plus" ? "degraus de 2 semanas" : "", stepDays));
  push(0, target, A.off === "none" ? "pode parar quando o novo está na dose-alvo" : "");
  return rows;
}

/* ---------- Benzodiazepínicos: passar para diazepam aos poucos ---------- */

function bzToDiazepam(fromId, dose) {
  const info = doseInfo(fromId);
  return doseRound((dose / info.eq) * 10);
}

function bzSwitchSchedule(fromId, dose) {
  const total = bzToDiazepam(fromId, dose);
  const rows = [{ label: "Hoje", a: dose, b: null, days: 0 }];
  [0.25, 0.5, 0.75, 1].forEach((f, i) => rows.push({
    label: scheduleWeekLabel(rows),
    a: f === 1 ? 0 : doseRound(dose * (1 - f)),
    b: doseRound(total * f),
    note: i === 0 ? "troca uma parte da dose por semana" : f === 1 ? "só diazepam; daqui segue a retirada" : "",
    days: 7,
  }));
  return rows;
}

/* ---------- Gráfico e tabela da troca ---------- */

function pharmaSwitchDoseSvg(rows, a, b, bMax) {
  const total = rows.reduce((sum, row) => sum + row.days, 0) || 7;
  const x = (day) => 92 + (day / total) * 488;
  const maxA = rows[0].a || 1;
  const maxB = Math.max(bMax || 0, ...rows.map((row) => row.b || 0)) || 1;
  let day = 0;
  const bars = [];
  rows.forEach((row) => {
    if (!row.days) return;
    const x1 = x(day);
    const w = x(day + row.days) - x1;
    if (row.gap) bars.push(`<rect x="${x1.toFixed(1)}" y="16" width="${w.toFixed(1)}" height="130" class="switch-gap"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="30" text-anchor="middle" class="pharma-label small">intervalo</text>`);
    if (row.a) {
      const h = (row.a / maxA) * 40;
      bars.push(`<rect x="${x1.toFixed(1)}" y="${(80 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar old"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="${(76 - h).toFixed(1)}" text-anchor="middle" class="pharma-label small">${doseNum(row.a)}</text>`);
    }
    if (row.b) {
      const h = (row.b / maxB) * 40;
      bars.push(`<rect x="${x1.toFixed(1)}" y="${(150 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar new"></rect><text x="${(x1 + w / 2).toFixed(1)}" y="${(146 - h).toFixed(1)}" text-anchor="middle" class="pharma-label small">${doseNum(row.b)}</text>`);
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

function scheduleHtml(rows, a, b, bMax) {
  return `
    ${pharmaSwitchDoseSvg(rows, a, b, bMax)}
    <div class="atlas-legend"><span><i style="background:#9fb3b6"></i>${escapeHtml(a.name)}</span><span><i style="background:#0b6b70"></i>${escapeHtml(b.name)}</span></div>
    <table class="dose-table">
      <thead><tr><th></th><th>${escapeHtml(a.name)}</th><th>${escapeHtml(b.name)}</th><th></th></tr></thead>
      <tbody>${rows.map((row, i) => `<tr class="${row.gap ? "gap" : ""}"><th>${escapeHtml(row.label)}</th><td>${row.a === 0 && i > 0 ? (rows[i - 1].a > 0 ? "parar" : "—") : doseFmt(row.a)}</td><td>${doseFmt(row.b)}</td><td>${escapeHtml(row.note || "")}</td></tr>`).join("")}</tbody>
    </table>`;
}

function doseInputHtml(id, field, label = "Dose atual (mg/dia)") {
  const info = doseInfo(id);
  const value = doseCurrent(id);
  return `<label class="dose-input"><span>${label}</span><input type="number" inputmode="decimal" min="${info.range[0] / 4}" max="${info.range[1]}" step="any" value="${value}" data-dose-input="${field}" data-dose-drug="${id}"></label>`;
}

function drugOptions(drugs, selected, skip = []) {
  return drugs.filter((drug) => !skip.includes(drug.id)).map((drug) => `<option value="${drug.id}" ${drug.id === selected ? "selected" : ""}>${escapeHtml(drug.name)}</option>`).join("");
}

function patientCard() {
  return `<div class="pharma-reading tone-warn"><strong>Na vida real</strong><span>${escapeHtml(window.PHARMA_DOSE.patient)}</span></div>`;
}

/* ---------- Trocar ---------- */

function renderSwitchAd(drugs) {
  const data = window.PHARMA_SWITCH;
  const doseData = window.PHARMA_DOSE;
  const fromId = data.groupOf[state.pharma.switchFrom] ? state.pharma.switchFrom : "sertralina";
  const toId = data.groupOf[state.pharma.switchTo] ? state.pharma.switchTo : "mirtazapina";
  const a = drugs.find((drug) => drug.id === fromId);
  const b = drugs.find((drug) => drug.id === toId);
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
  const medText = (id) => `${doseInfo(id).medNote || doseNum(doseInfo(id).med)} mg/dia`;
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>De</span><select data-pharma-switch="from">${drugOptions(drugs, fromId)}</select></label>
          <button type="button" class="link-btn" data-pharma-switch-swap aria-label="Inverter">⇄</button>
          <label><span>Para</span><select data-pharma-switch="to">${drugOptions(drugs, toId)}</select></label>
        </div>
        <div class="switch-pick">${doseInputHtml(fromId, "switch")}
          <p class="dose-med">Dose mínima eficaz: <b>${escapeHtml(a.name)}</b> ${escapeHtml(medText(fromId))}${b && fromId !== toId ? ` · <b>${escapeHtml(b.name)}</b> ${escapeHtml(medText(toId))}` : ""}</p>
        </div>
        ${plan ? `
          <div class="pharma-reading tone-${tone}"><strong>${typeLabel[plan.type]}</strong><span>${escapeHtml(pharmaSwitchText(plan, a, b))}</span></div>
          ${scheduleHtml(rows, a, b, doseInfo(toId).med)}
          ${patientCard()}`
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

function renderSwitchAp(drugs) {
  const ap = window.PHARMA_DOSE.ap;
  const fromId = ap.drugs[state.pharma.apFrom] ? state.pharma.apFrom : "risperidona";
  let toId = ap.drugs[state.pharma.apTo] && state.pharma.apTo !== "clozapina" ? state.pharma.apTo : "aripiprazol";
  const a = drugs.find((drug) => drug.id === fromId);
  const b = drugs.find((drug) => drug.id === toId);
  const A = doseInfo(fromId);
  const B = doseInfo(toId);
  const same = fromId === toId;
  const pair = (fromId === "risperidona" && toId === "paliperidona") || (fromId === "paliperidona" && toId === "risperidona");
  const rows = same ? [] : apSwitchSchedule(fromId, toId, doseCurrent(fromId));
  const medText = (info) => info.med ? `${doseNum(info.med)} mg/dia (primeiro episódio: ${doseNum(info.medFirst)} mg)` : "não está na tabela";
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>De</span><select data-ap-switch="from">${drugOptions(drugs, fromId)}</select></label>
          <label><span>Para</span><select data-ap-switch="to">${drugOptions(drugs, toId, ["clozapina"])}</select></label>
        </div>
        <div class="switch-pick">${doseInputHtml(fromId, "switch")}
          <p class="dose-med">Dose mínima eficaz (multiepisódio): <b>${escapeHtml(b.name)}</b> ${escapeHtml(medText(B))}. Clozapina não aparece em "Para": começa por titulação própria, com monitorização do hemograma.</p>
        </div>
        ${same ? `<div class="pharma-reading tone-low"><strong>Escolha dois antipsicóticos diferentes</strong><span>O cronograma depende de quanto tempo o antigo leva para sair e de como o novo começa.</span></div>` : `
          <div class="pharma-reading tone-ok"><strong>Titulação cruzada</strong><span>${escapeHtml(b.name)} sobe até a dose-alvo enquanto ${escapeHtml(a.name.toLowerCase())} se mantém; depois o antigo sai: ${escapeHtml(ap.offText[A.off])}.${A.analogy ? " O Stahl não traz esquema próprio para este remédio: tempo por semelhança farmacológica." : ""}</span></div>
          ${pair ? '<div class="pharma-reading tone-high"><strong>Risperidona e paliperidona</strong><span>A paliperidona é o metabólito ativo da risperidona: não usar as duas juntas. Na prática, a troca entre elas é quase uma troca direta.</span></div>' : ""}
          ${scheduleHtml(rows, a, b, B.med)}
          ${patientCard()}`}
      </section>
      <section class="pharma-card">
        <h4>Como trocar antipsicóticos</h4>
        <ul class="fronto-signs">${ap.rules.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="pharma-reading tone-low"><strong>Retirada ou recaída?</strong><span>${escapeHtml(ap.withdrawal)}</span></div>
      </section>
    </div>`;
}

function renderSwitchBz(drugs) {
  const bz = window.PHARMA_DOSE.bz;
  const choices = drugs.filter((drug) => drug.id !== "diazepam" && !bz.drugs[drug.id].zdrug);
  const fromId = choices.some((drug) => drug.id === state.pharma.bzFrom) ? state.pharma.bzFrom : "alprazolam";
  const a = drugs.find((drug) => drug.id === fromId);
  const b = drugs.find((drug) => drug.id === "diazepam");
  const dose = doseCurrent(fromId);
  const total = bzToDiazepam(fromId, dose);
  const rows = bzSwitchSchedule(fromId, dose);
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>De</span><select data-bz-switch="from">${drugOptions(choices, fromId)}</select></label>
          ${doseInputHtml(fromId, "switch")}
        </div>
        <div class="pharma-reading tone-ok"><strong>${escapeHtml(a.name)} ${doseFmt(dose)} ≈ diazepam ${doseFmt(total)}</strong><span>Equivalência aproximada: ${escapeHtml(a.name.toLowerCase())} ${doseNum(bz.drugs[fromId].eq)} mg ≈ diazepam 10 mg.</span></div>
        ${scheduleHtml(rows, a, b, total)}
        <div class="pharma-toggles"><button type="button" class="pharma-toggle" data-bz-to-taper="${total}">Retirar o diazepam a partir de ${doseFmt(total)} ›</button></div>
        ${patientCard()}
      </section>
      <section class="pharma-card">
        <h4>Por que passar para diazepam?</h4>
        <div class="pharma-reading tone-ok"><span>${escapeHtml(bz.switchText)}</span></div>
        <h4>Equivalências (≈ 10 mg de diazepam)</h4>
        <table class="dose-table"><tbody>${drugs.map((drug) => `<tr><th>${escapeHtml(drug.name)}</th><td>${doseFmt(bz.drugs[drug.id].eq)}</td><td>${bz.drugs[drug.id].long ? "meia-vida longa" : bz.drugs[drug.id].zdrug ? "hipnótico Z" : "meia-vida curta ou intermediária"}</td></tr>`).join("")}</tbody></table>
        <div class="pharma-reading tone-low"><strong>Retirada</strong><span>${escapeHtml(bz.withdrawal)}</span></div>
      </section>
    </div>`;
}

/* ---------- Retirar: redução proporcional ---------- */

function taperState(cls) {
  state.pharma.taper = state.pharma.taper || {};
  state.pharma.taper[cls] = state.pharma.taper[cls] || {};
  return state.pharma.taper[cls];
}

function taperDefaults(cls) {
  return { ad: "sertralina", ap: "olanzapina", bz: "diazepam" }[cls];
}

function taperRisk(cls, drugId, t) {
  const data = window.PHARMA_DOSE;
  if (cls === "ad") {
    const use = t.use || "mid";
    const level = use === "gt24" || t.history || doseInfo(drugId).highRisk ? "high" : use === "lt6" ? "low" : "mid";
    return { level, ...data.risk[level] };
  }
  if (cls === "ap") {
    const level = t.use === "lt12" ? "low" : "high";
    return { level, ...data.ap.risk[level] };
  }
  const level = t.use === "lt6" && !t.history && doseInfo(drugId).long ? "low" : "high";
  return { level, ...data.bz.risk[level] };
}

function taperUseOptions(cls, use) {
  const opts = cls === "ad"
    ? [["lt6", "menos de 6 meses"], ["mid", "6 a 24 meses"], ["gt24", "mais de 24 meses"]]
    : cls === "ap" ? [["lt12", "menos de 1 ano"], ["gt12", "mais de 1 ano"]]
      : [["lt6", "menos de 6 meses"], ["gt6", "mais de 6 meses"]];
  const current = use || (cls === "ad" ? "mid" : opts[1][0]);
  return opts.map(([value, label]) => `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`).join("");
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

/* Ocupação do alvo principal, quando há modelo: SERT (antidepressivos que agem nele), D2 (só
   olanzapina, a partir do Maudsley) e GABA-A (benzodiazepínicos, em equivalente de diazepam). */
function taperTarget(cls, drugId) {
  const info = doseInfo(drugId);
  const data = window.PHARMA_DOSE;
  if (cls === "ad" && info.sert) {
    const ed50 = info.med * (100 / data.sertAtMed - 1);
    return { label: "ocupação estimada do SERT", occ: (d) => (d <= 0 ? 0 : (100 * d) / (d + ed50)) };
  }
  if (cls === "ap" && drugId === "olanzapina") return { label: "bloqueio D2 estimado", occ: (d) => (d <= 0 ? 0 : (100 * d) / (d + data.ap.olanzapineEd50)) };
  if (cls === "bz") {
    const toDiaz = 10 / info.eq;
    return { label: "ocupação estimada do GABA-A", occ: (d) => (d <= 0 ? 0 : (100 * d * toDiaz) / (d * toDiaz + data.bz.ed50Diazepam)) };
  }
  return null;
}

function taperSvg(steps, target, weeks) {
  const n = steps.length;
  const x = (i) => 50 + (i / n) * 530;
  const max = steps[0];
  const bars = steps.map((d, i) => {
    const h = (d / max) * 110;
    return `<rect x="${x(i).toFixed(1)}" y="${(140 - h).toFixed(1)}" width="${Math.max(0.5, x(i + 1) - x(i) - 1).toFixed(1)}" height="${h.toFixed(1)}" class="switch-bar old"></rect>`;
  }).join("");
  const occ = target ? `<polyline points="${steps.map((d, i) => `${(x(i) + (x(i + 1) - x(i)) / 2).toFixed(1)},${(140 - target.occ(d) * 1.1).toFixed(1)}`).join(" ")}" class="taper-occ"></polyline>` : "";
  const ticks = [];
  const every = Math.max(1, Math.ceil(n / 8));
  for (let i = 0; i < n - every / 2; i += every) ticks.push(`<text x="${x(i).toFixed(1)}" y="158" text-anchor="middle" class="pharma-label small">${Math.round((i * weeks) / 4.3)}</text>`);
  return `
    <svg class="pharma-kinetics" viewBox="0 0 600 168" role="img" aria-label="Dose em cada degrau da retirada">
      <line x1="50" y1="140" x2="580" y2="140" class="kin-axis"></line>
      ${bars}${occ}${ticks.join("")}
      <text x="46" y="34" text-anchor="end" class="pharma-label small">${doseNum(max)} mg</text>
      <text x="580" y="158" text-anchor="end" class="pharma-label small">meses</text>
    </svg>`;
}

function taperLinearCompare(dose, target) {
  /* Mesma dose retirada em 4 degraus iguais (linear): queda de ocupação a cada passo. */
  const linear = [1, 0.75, 0.5, 0.25, 0].map((f) => dose * f);
  const drops = linear.slice(1).map((d, i) => target.occ(linear[i]) - target.occ(d));
  return `<div class="taper-compare">${drops.map((drop, i) => `<div><span>${doseFmt(doseRound(linear[i]))} → ${linear[i + 1] ? doseFmt(doseRound(linear[i + 1])) : "0"}</span><i style="width:${Math.max(4, drop)}%"></i><b>−${Math.round(drop)} pontos</b></div>`).join("")}</div>`;
}

function renderTaper(cls, drugs) {
  const data = window.PHARMA_DOSE;
  const t = taperState(cls);
  const drugId = drugs.some((item) => item.id === t.drug) ? t.drug : taperDefaults(cls);
  const drug = drugs.find((item) => item.id === drugId);
  const info = doseInfo(drugId);
  const dose = doseCurrent(drugId);
  const risk = taperRisk(cls, drugId, t);
  const pct = Number(t.pct) || risk.pct;
  const weekOptions = cls === "ap" ? [4, 8, 12] : [2, 4];
  const weeks = weekOptions.includes(Number(t.weeks)) ? Number(t.weeks) : cls === "ad" ? 2 : cls === "ap" ? 8 : 4;
  const floor = cls === "ad" ? info.med * 0.01 : cls === "ap" ? dose / 80 : info.eq / 100;
  const steps = taperSteps(dose, pct, floor);
  const months = Math.round((steps.length * weeks) / 4.3);
  const shown = steps.length > 12 ? [...steps.slice(0, 8).map((d, i) => [i, d]), null, ...steps.slice(-3).map((d, i) => [steps.length - 3 + i, d])] : steps.map((d, i) => [i, d]);
  const target = taperTarget(cls, drugId);
  const rules = cls === "ap" ? data.ap.taperRules : cls === "bz" ? data.bz.taperRules : data.taperRules;
  const withdrawal = cls === "ap" ? data.ap.withdrawal : cls === "bz" ? data.bz.withdrawal : data.withdrawal;
  const tone = risk.level === "high" ? "high" : risk.level === "mid" ? "warn" : "ok";
  const why = target
    ? `<h3>Por que reduzir em porcentagem?</h3>
      <p class="pharma-extra">A ocupação do alvo segue uma curva hiperbólica: perto de zero, poucos mg mudam muito o efeito. Tirar ${escapeHtml(drug.name.toLowerCase())} em 4 degraus iguais de mg:</p>
      ${taperLinearCompare(dose, target)}
      <p class="pharma-extra">O último degrau derruba a ocupação muito mais que o primeiro. Degraus proporcionais (${pct}% da última dose) mantêm a queda parecida a cada passo.</p>`
    : `<h3>Retirada gradual</h3><p class="pharma-extra">${cls === "ap" ? escapeHtml(data.ap.olanzapineExample) + " A redução proporcional vale para os outros antipsicóticos e para todos os receptores que eles bloqueiam." : "O princípio da redução proporcional vale também para os remédios sem um alvo único para medir a ocupação."}</p>`;
  return `
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="switch-pick">
          <label><span>Remédio</span><select data-taper-field="drug">${drugOptions(drugs, drugId)}</select></label>
          ${doseInputHtml(drugId, "taper")}
        </div>
        <div class="switch-pick taper-risk">
          <label><span>Tempo de uso</span><select data-taper-field="use">${taperUseOptions(cls, t.use)}</select></label>
          ${cls === "ap" ? "" : `<label class="taper-check"><input type="checkbox" data-taper-field="history" ${t.history ? "checked" : ""}> <span>Retirada difícil no passado</span></label>`}
        </div>
        <div class="pharma-reading tone-${tone}"><strong>Risco ${risk.label.toLowerCase()} de retirada · sugestão: ${risk.range}</strong><span>${escapeHtml(risk.text)}</span></div>
        <div class="switch-pick">
          <label><span>Redução por degrau</span><select data-taper-field="pct">${[5, 10, 15, 20, 25, 50].map((p) => `<option value="${p}" ${p === pct ? "selected" : ""}>${p}% da última dose</option>`).join("")}</select></label>
          <label><span>Intervalo</span><select data-taper-field="weeks">${weekOptions.map((w) => `<option value="${w}" ${w === weeks ? "selected" : ""}>a cada ${w % 4 === 0 && w > 4 ? `${w / 4} meses` : w === 4 ? "4 semanas" : `${w} semanas`}</option>`).join("")}</select></label>
        </div>
        <div class="pharma-reading tone-low"><strong>${steps.length - 1} degraus · cerca de ${months} meses</strong><span>Simulação: o ritmo real se ajusta aos sintomas, degrau a degrau.</span></div>
        ${taperSvg(steps, target, weeks)}
        <div class="atlas-legend"><span><i style="background:#9fb3b6"></i>dose (mg/dia)</span>${target ? `<span><i style="background:#d55e00"></i>${target.label}</span>` : ""}</div>
        <table class="dose-table">
          <thead><tr><th>Degrau</th><th>Dose</th><th>Semana</th></tr></thead>
          <tbody>${shown.map((item) => item ? `<tr><th>${item[0] === 0 ? "Hoje" : item[0]}</th><td>${doseFmt(item[1])}</td><td>${item[0] * weeks}</td></tr>` : '<tr class="gap"><th>…</th><td>…</td><td></td></tr>').join("")}
            <tr><th>Fim</th><td>parar</td><td>${steps.length * weeks}</td></tr></tbody>
        </table>
        ${steps[steps.length - 1] < 1 ? '<p class="pharma-extra">As últimas doses ficam abaixo de 1 mg: na prática exigem solução oral ou formulação manipulada.</p>' : ""}
      </section>
      <section class="pharma-card">
        ${why}
        ${info.longHalfLife ? '<div class="pharma-reading tone-warn"><strong>Fluoxetina</strong><span>A meia-vida longa atrasa os sintomas de retirada por semanas: avaliar com mais tempo antes do próximo degrau.</span></div>' : ""}
        ${cls === "ap" && drugId === "clozapina" ? '<div class="pharma-reading tone-high"><strong>Clozapina</strong><span>Parada brusca pode dar rebote colinérgico (náusea, vômitos, diarreia, sudorese), distonias, discinesias e catatonia: retirar devagar.</span></div>' : ""}
        <h4>Como conduzir</h4>
        <ul class="fronto-signs">${rules.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="pharma-reading tone-low"><strong>Retirada ou recaída?</strong><span>${escapeHtml(withdrawal)}</span></div>
        ${patientCard()}
      </section>
    </div>`;
}

/* ---------- Página ---------- */

renderPharmaSwitch = function renderPharmaSwitchWithDoses() {
  const cls = DOSE_CLASSES.some((item) => item.id === state.pharma.doseClass) ? state.pharma.doseClass : "ad";
  const tab = state.pharma.switchTab === "taper" ? "taper" : "switch";
  const drugs = doseDrugs(cls);
  const refCount = ((window.PHARMA_REFS || {}).troca?.paths || []).length;
  const switchLabel = cls === "bz" ? "Passar para diazepam" : "Trocar";
  const body = tab === "taper" ? renderTaper(cls, drugs) : cls === "ap" ? renderSwitchAp(drugs) : cls === "bz" ? renderSwitchBz(drugs) : renderSwitchAd(drugs);
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-pharma-hub>← Psicofarmacologia</button>
          <button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>
        </div>
        <h2>Troca de medicamentos</h2>
        <p>Doses em mg para trocar de remédio ou parar aos poucos, conforme o Maudsley e o Stahl.</p>
      </div>
    </header>
    <div class="segmented dem-stages dose-classes" role="group" aria-label="Classe">
      ${DOSE_CLASSES.map((item) => `<button type="button" class="${cls === item.id ? "active" : ""}" data-dose-class="${item.id}" aria-pressed="${cls === item.id}">${item.label}</button>`).join("")}
    </div>
    <div class="segmented dem-stages switch-tabs" role="group" aria-label="Troca ou retirada">
      <button type="button" class="${tab === "switch" ? "active" : ""}" data-switch-tab="switch" aria-pressed="${tab === "switch"}">${switchLabel}</button>
      <button type="button" class="${tab === "taper" ? "active" : ""}" data-switch-tab="taper" aria-pressed="${tab === "taper"}">Retirar</button>
    </div>
    ${body}
    <p class="pharma-disclaimer">Simulação didática para estudo, não para prescrição. As doses de cada degrau são exemplos: o ritmo real respeita os sintomas de retirada e as condições de cada paciente.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "troca", label: "Troca de medicamentos" }, "paths", tab === "taper" ? "Retirada" : "Troca") : ""}`;
};

(function setupPharmaDose() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-switch-tab], [data-dose-class], [data-bz-to-taper]");
    if (!target) return;
    const data = target.dataset;
    const cls = state.pharma.doseClass || "ad";
    if (data.doseClass) state.pharma.doseClass = data.doseClass;
    else if (data.bzToTaper) {
      state.pharma.switchDoses = { ...(state.pharma.switchDoses || {}), diazepam: Number(data.bzToTaper) };
      taperState("bz").drug = "diazepam";
      state.pharma.switchTab = "taper";
    } else {
      state.pharma.switchTab = data.switchTab;
      /* Ao abrir "Retirar", começa pelo remédio que estava em "De". */
      const from = cls === "ad" ? state.pharma.switchFrom : cls === "ap" ? state.pharma.apFrom : state.pharma.bzFrom;
      if (data.switchTab === "taper" && from && !taperState(cls).drug) taperState(cls).drug = from;
    }
    savePharmaState();
    renderPharmaPanel();
  });
  panel.addEventListener("change", (event) => {
    const el = event.target;
    const cls = state.pharma.doseClass || "ad";
    if (el.matches("[data-dose-input]")) {
      const value = Number(String(el.value).replace(",", "."));
      if (value > 0) state.pharma.switchDoses = { ...(state.pharma.switchDoses || {}), [el.dataset.doseDrug]: value };
    } else if (el.matches("[data-ap-switch]")) {
      state.pharma[el.dataset.apSwitch === "from" ? "apFrom" : "apTo"] = el.value;
    } else if (el.matches("[data-bz-switch]")) {
      state.pharma.bzFrom = el.value;
    } else if (el.matches("[data-taper-field]")) {
      const t = taperState(cls);
      const field = el.dataset.taperField;
      if (field === "drug") { t.drug = el.value; t.pct = null; }
      if (field === "use") { t.use = el.value; t.pct = null; }
      if (field === "history") { t.history = el.checked; t.pct = null; }
      if (field === "pct") t.pct = Number(el.value);
      if (field === "weeks") t.weeks = Number(el.value);
    } else return;
    savePharmaState();
    renderPharmaPanel();
  });
})();
