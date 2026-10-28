/* Simulador de psicofarmacologia (aba "Simulador"). Dados por classe em data/pharmaSim.js
   (antipsicóticos) e data/pharmaSimAntidepressants.js. Nos antidepressivos, a primeira tela mostra
   os sistemas de serotonina, noradrenalina e dopamina, e a sinapse mostra o mecanismo de cada
   remédio (recaptação, freio α2, MAO ou receptor). Nos estabilizadores (data/pharmaSimStabilizers.js),
   a primeira tela mostra os alvos no terminal nervoso e as fases em que cada um funciona, e a
   segunda vira "Nível e interações" (faixas de nível sérico, interações e titulação da lamotrigina).
   Nos ansiolíticos e hipnóticos (data/pharmaSimAnxiolytics.js), a primeira tela mostra o receptor
   GABA-A por subunidade α, o α2δ e o 5-HT1A, e a segunda vira "Meia-vida e retirada" (curva de
   concentração com uso diário, parada abrupta e conversor de dose equivalente ao diazepam).
   Nos psicoestimulantes (data/pharmaSimStimulants.js), a primeira tela mostra pré-frontal,
   estriado/accumbens e corpo, e a segunda vira "Ao longo do dia" (curva de efeito por formulação,
   horário da dose e cobertura de escola, tarde e sono).
   - Vias e receptores: corte do cérebro com as 4 vias dopaminérgicas coloridas conforme o remédio
     escolhido, perfil de receptores e "o que esperar" (efeitos relativos).
   - Comparar: dois remédios lado a lado, com o porquê das diferenças.
   - Sinapse: receptores D2 ocupados conforme o controle de ocupação, com as faixas clássicas.
   - Treino: rodadas de 10 perguntas ("qual é o remédio por este perfil?" e "qual tem mais risco de…?").
   Material didático e simplificado; não serve para prescrição. */

const PHARMA_KEY = "banco-rmais-pharma-sim";
const PHARMA_LEVELS = ["desprezível", "fraca", "moderada", "forte", "muito forte"];
const PHARMA_EFFECT_LEVELS = ["muito baixo", "baixo", "moderado", "alto"];
const PHARMA_TONES = {
  good: { color: "#0b6b70", label: "efeito terapêutico" },
  ok: { color: "#4f8f92", label: "efeito pequeno" },
  warn: { color: "#b7791f", label: "risco moderado" },
  high: { color: "#c2410c", label: "risco alto" },
  low: { color: "#9fb3b6", label: "risco baixo" },
};

state.pharma = (() => {
  const fallback = { cls: "antipsicoticos", mode: "paths", drug: "haloperidol", a: "olanzapina", b: "aripiprazol", occupancy: 70 };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(PHARMA_KEY) || "{}") };
  } catch {
    return fallback;
  }
})();

function savePharmaState() {
  try {
    localStorage.setItem(PHARMA_KEY, JSON.stringify(state.pharma));
  } catch {}
}

/* Classe em estudo (antipsicóticos, antidepressivos): cada uma tem seus alvos, efeitos e remédios. */
function pharmaClass() {
  const sim = window.PHARMA_SIM || {};
  return sim[state.pharma.cls] || sim.antipsicoticos;
}

function pharmaIsAntidepressant() {
  return pharmaClass()?.id === "antidepressivos";
}

function pharmaDrugGroup(drug) {
  return drug.group || (drug.generation === 1 ? "1ª geração" : "2ª geração");
}

/* Ocupação inicial típica do alvo principal ao escolher um remédio na sinapse. */
function pharmaDefaultOccupancy(drug) {
  if (drug.mech) return drug.mech.type === "mao" ? 90 : drug.mech.target === "SERT" ? 80 : 70;
  return pharmaIsPartial(drug, "D2") ? 90 : drug.receptors.D2 <= 1 ? 55 : 70;
}

function setPharmaClass(id) {
  const cls = (window.PHARMA_SIM || {})[id];
  if (!cls || state.pharma.cls === id) return;
  state.pharma.cls = id;
  Object.assign(state.pharma, cls.defaults);
  state.pharma.occupancy = pharmaDefaultOccupancy(pharmaDrug(cls.defaults.drug));
  resetPharmaLevel(pharmaDrug(cls.defaults.drug));
  state.pharmaQuiz = null;
}

function pharmaIsStabilizer() {
  return pharmaClass()?.kind === "stabilizer";
}

/* Nível sérico e interações escolhidas voltam ao padrão ao trocar de remédio. */
function resetPharmaLevel(drug) {
  state.pharma.level = drug?.level ? drug.level.start : null;
  state.pharma.inter = [];
}

/* ---------- Estabilizadores: mecanismos, fases, nível e interações ---------- */

const PHARMA_TARGET_COLORS = { NA: "#0072b2", CA: "#009e73", GLU: "#d55e00", GABA: "#b0418a", INTRA: "#e69f00" };
const PHARMA_ACTION_LABELS = ["sem ação", "ação leve", "ação moderada", "ação forte", "ação principal"];
const PHARMA_EVIDENCE_LABELS = ["sem evidência", "fraca", "moderada", "forte"];

function pharmaStabilizerSvg(drug) {
  const r = drug.receptors;
  const cls = (id) => `pharma-target${r[id] === 0 ? " faint" : ""}${r[id] >= 3 ? " strong" : ""}`;
  const c = PHARMA_TARGET_COLORS;
  return `
    <svg class="pharma-brain" viewBox="0 0 560 330" role="img" aria-label="Terminal nervoso com os alvos dos estabilizadores de humor">
      <path d="M20 118 H250 C262 64 330 40 380 46 C452 54 498 104 494 160 C490 220 438 246 372 246 C318 246 268 226 250 172 H20 Z" class="pharma-brain-outline"></path>
      <path d="M40 290 H520" class="syn-postline"></path>
      <text x="280" y="318" text-anchor="middle" class="pharma-label small">Neurônio seguinte</text>
      <g class="${cls("NA")}" style="--t:${c.NA}">
        <rect x="128" y="108" width="34" height="20" rx="5"></rect><rect x="128" y="162" width="34" height="20" rx="5"></rect>
        <text x="145" y="98" text-anchor="middle" class="pharma-label">Na⁺</text>
      </g>
      <g class="${cls("CA")}" style="--t:${c.CA}">
        <rect x="300" y="236" width="30" height="20" rx="5"></rect>
        <text x="315" y="274" text-anchor="middle" class="pharma-label">Ca²⁺</text>
      </g>
      <g class="${cls("GLU")}" style="--t:${c.GLU}">
        <circle cx="390" cy="200" r="16"></circle><circle cx="432" cy="182" r="16"></circle>
        <circle cx="386" cy="198" r="3" class="dot"></circle><circle cx="395" cy="204" r="3" class="dot"></circle><circle cx="428" cy="178" r="3" class="dot"></circle><circle cx="437" cy="186" r="3" class="dot"></circle>
        <path d="M410 238 V282" class="arrow"></path>
        <text x="452" y="226" class="pharma-label">Glutamato</text>
      </g>
      <g class="${cls("GABA")}" style="--t:${c.GABA}">
        <circle cx="488" cy="42" r="26"></circle>
        <circle cx="480" cy="40" r="3" class="dot"></circle><circle cx="492" cy="48" r="3" class="dot"></circle><circle cx="494" cy="34" r="3" class="dot"></circle>
        <text x="488" y="88" text-anchor="middle" class="pharma-label">GABA</text>
      </g>
      <g class="${cls("INTRA")}" style="--t:${c.INTRA}">
        <rect x="300" y="96" width="132" height="54" rx="10"></rect>
        <text x="366" y="118" text-anchor="middle" class="pharma-label small">inositol · GSK-3</text>
        <text x="366" y="136" text-anchor="middle" class="pharma-label small">proteína quinase C</text>
      </g>
      <text x="60" y="150" class="pharma-label small">axônio</text>
    </svg>`;
}

function renderStabilizerMech(drug) {
  const rows = Object.fromEntries(pharmaClass().receptors.map((target) => {
    const value = drug.receptors[target.id] ?? 0;
    return [target.id, { name: target.label, text: target.role, badge: PHARMA_ACTION_LABELS[value], badgeTone: value >= 3 ? "good" : value ? "ok" : "low", faint: value === 0 }];
  }));
  const indications = pharmaClass().indications.map((item) => {
    const value = drug.indications[item.id] ?? 0;
    return `<span class="pharma-effect evidence-${value}">${escapeHtml(item.label)}: ${PHARMA_EVIDENCE_LABELS[value]}</span>`;
  }).join("");
  return `
    <div class="pharma-chips" role="group" aria-label="Estabilizadores de humor">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Onde age · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
        ${pharmaStabilizerSvg(drug)}
        <div class="pharma-paths">${pharmaPathRows(rows, PHARMA_TARGET_COLORS)}</div>
      </section>
      <section class="pharma-card">
        <h3>Para que fase serve</h3>
        <div class="pharma-effects">${indications}</div>
        <p class="pharma-extra">${escapeHtml(drug.extra)}</p>
        <h4>O que vigiar</h4>
        <div class="pharma-effects">${pharmaEffectChips(drug)}</div>
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

function pharmaFormatLevel(value, level) {
  return Number(value).toFixed(level.decimals).replace(".", ",");
}

function pharmaLevelZone(level, value) {
  return level.zones.find((zone) => value < zone.to) || level.zones[level.zones.length - 1];
}

function pharmaZonesBar(level, marks) {
  let from = level.min;
  const span = level.max - level.min;
  const zones = level.zones.map((zone) => {
    const width = ((Math.min(zone.to, level.max) - from) / span) * 100;
    from = zone.to;
    return `<span class="z-${zone.tone}" style="flex:${width}" title="${escapeHtml(zone.label)}"></span>`;
  }).join("");
  const pins = marks.map((mark) => `<i class="pharma-pin ${mark.kind}" style="left:${Math.min(100, ((mark.value - level.min) / span) * 100)}%"></i>`).join("");
  const band = marks.find((mark) => mark.kind === "band");
  const bandHtml = band ? `<b class="pharma-band" style="left:${((band.from - level.min) / span) * 100}%;width:${((Math.min(band.value, level.max) - band.from) / span) * 100}%"></b>` : "";
  return `<div class="pharma-levelbar"><div class="pharma-zones">${zones}</div>${bandHtml}${pins}</div>`;
}

function renderStabilizerLevelView(drug) {
  const level = drug.level;
  const value = state.pharma.level ?? level.start;
  const zone = pharmaLevelZone(level, value);
  const active = level.interactions.filter((item) => state.pharma.inter.includes(item.id));
  const rising = active.filter((item) => item.factor > 1);
  const falling = active.filter((item) => item.factor > 0 && item.factor < 1);
  const marks = [{ kind: "now", value }];
  let projection = "";
  if (rising.length) {
    const top = Math.min(level.max, value * Math.max(...rising.map((item) => item.factor)));
    marks.push({ kind: "band", from: value, value: top });
    projection = `<div class="pharma-reading tone-${pharmaLevelZone(level, top).tone}"><strong>Pode chegar a ~${pharmaFormatLevel(top, level)} ${level.unit}${top >= level.max ? " ou mais" : ""} · ${escapeHtml(pharmaLevelZone(level, top).label)}</strong><span>${escapeHtml(rising.map((item) => item.effect).join(" "))}${rising.length > 1 ? " Combinações somam o risco." : ""}</span></div>`;
  } else if (falling.length) {
    const low = value * falling[0].factor;
    marks.push({ kind: "after", value: low });
    projection = `<div class="pharma-reading tone-${pharmaLevelZone(level, low).tone}"><strong>Depois da autoindução: ~${pharmaFormatLevel(low, level)} ${level.unit} · ${escapeHtml(pharmaLevelZone(level, low).label)}</strong><span>${escapeHtml(falling[0].effect)}</span></div>`;
  }
  const textOnly = active.filter((item) => item.factor === 0);
  return `
    ${pharmaZonesBar(level, marks)}
    <div class="pharma-reading tone-${zone.tone}">
      <strong>${pharmaFormatLevel(value, level)} ${level.unit} · ${escapeHtml(zone.label)}</strong>
      <span>${escapeHtml(zone.text)}</span>
    </div>
    ${projection}
    ${textOnly.map((item) => `<div class="pharma-reading tone-warn"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.effect)}</span></div>`).join("")}`;
}

function renderStabilizerTitration(drug) {
  const titration = drug.titration;
  const active = titration.modifiers.filter((item) => state.pharma.inter.includes(item.id));
  /* Com valproato, vale a regra do valproato mesmo que haja indutor junto. */
  const modifier = active.find((item) => item.id === "valproato") || active[0];
  const factor = modifier ? modifier.factor : 1;
  const rows = titration.weeks.map((week) => `<tr><th scope="row">${escapeHtml(week.label)}</th><td>${(week.dose * factor).toString().replace(".", ",")} mg/dia</td></tr>`).join("");
  return `
    <table class="pharma-table"><thead><tr><th scope="col">Período</th><th scope="col">Dose diária</th></tr></thead><tbody>${rows}</tbody></table>
    ${modifier ? `<div class="pharma-reading tone-warn"><strong>${escapeHtml(modifier.label)}</strong><span>${escapeHtml(modifier.effect)}</span></div>` : ""}
    <div class="pharma-reading tone-high"><strong>Por que devagar?</strong><span>Subir rápido (ou somar valproato sem reduzir a dose) aumenta o risco de rash grave, inclusive Stevens-Johnson. Se ficar mais de 5 meias-vidas sem tomar, recomeça a titulação.</span></div>`;
}

function renderStabilizerLevel(drug) {
  let left;
  let right;
  if (drug.level) {
    const level = drug.level;
    left = `
      <h3>Nível sérico · ${escapeHtml(drug.name)}</h3>
      <label class="pharma-slider-label" for="pharmaLevel">Arraste para simular o nível no sangue (${level.unit})</label>
      <input id="pharmaLevel" class="pharma-slider" type="range" min="${level.min}" max="${level.max}" step="${level.step}" value="${state.pharma.level ?? level.start}" data-pharma-level>
      <div id="pharmaLevelView">${renderStabilizerLevelView(drug)}</div>`;
    right = level.interactions.length
      ? `<h3>Interações</h3><p class="pharma-extra">Ligue para ver o que acontece com o nível.</p>
         <div class="pharma-toggles">${level.interactions.map((item) => `<button type="button" class="pharma-toggle ${state.pharma.inter.includes(item.id) ? "on" : ""}" data-pharma-inter="${item.id}" aria-pressed="${state.pharma.inter.includes(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div>`
      : `<h3>Interações</h3><p class="pharma-extra">${escapeHtml(drug.extra)}</p>`;
  } else if (drug.titration) {
    left = `<h3>Titulação · ${escapeHtml(drug.name)}</h3><p class="pharma-extra">A lamotrigina não tem faixa de nível usada na prática: o cuidado está na velocidade de subida.</p>${renderStabilizerTitration(drug)}`;
    right = `<h3>Associações</h3><p class="pharma-extra">Ligue para ver como a dose muda.</p>
      <div class="pharma-toggles">${drug.titration.modifiers.map((item) => `<button type="button" class="pharma-toggle ${state.pharma.inter.includes(item.id) ? "on" : ""}" data-pharma-inter="${item.id}" aria-pressed="${state.pharma.inter.includes(item.id)}">${escapeHtml(item.label)}</button>`).join("")}</div>`;
  } else {
    left = `<h3>Nível sérico · ${escapeHtml(drug.name)}</h3><p class="pharma-extra">Sem faixa de nível usada na prática. O que mais pesa é o sódio: a hiponatremia é mais frequente que com a carbamazepina, sobretudo em idosos e com diuréticos.</p>`;
    right = `<h3>Interações</h3><p class="pharma-extra">${escapeHtml(drug.extra)}</p>`;
  }
  return `
    <div class="pharma-chips" role="group" aria-label="Estabilizadores de humor">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">${left}</section>
      <section class="pharma-card">${right}${pharmaStudyLink(drug)}</section>
    </div>`;
}

function pharmaDrug(id) {
  const drugs = pharmaClass()?.drugs || [];
  return drugs.find((drug) => drug.id === id) || drugs[0];
}

function pharmaIsPartial(drug, receptor) {
  return (drug.pa || []).includes(receptor);
}

/* Quantas questões do banco citam o remédio (enunciado ou alternativas). */
const pharmaQuestionCounts = new Map();
function pharmaQuestionCount(drug) {
  if (pharmaQuestionCounts.has(drug.id)) return pharmaQuestionCounts.get(drug.id);
  if (typeof allStudyQuestions !== "function") return 0;
  const terms = drug.search.map((term) => normalize(term));
  const count = allStudyQuestions().filter((question) => {
    const view = effectiveQuestion(question);
    const text = normalize([view.text, ...(view.options || []).map((option) => option.text)].join(" "));
    return terms.some((term) => text.includes(term));
  }).length;
  pharmaQuestionCounts.set(drug.id, count);
  return count;
}

/* Estado de cada via dopaminérgica para o remédio. */
function pharmaPathways(drug) {
  const partial = pharmaIsPartial(drug, "D2");
  const d2 = drug.receptors.D2;
  const ht2a = drug.receptors["5HT2A"];
  const park = drug.effects.parkinsonism;
  const prl = drug.effects.prolactin;
  const levelTone = (value) => (value >= 3 ? "high" : value === 2 ? "warn" : "low");
  return {
    mesolimbic: {
      name: "Mesolímbica",
      tone: "good",
      text: partial ? "Agonismo parcial estabiliza a dopamina: melhora dos sintomas positivos" : "Bloqueio D2: melhora dos sintomas positivos",
    },
    mesocortical: partial
      ? { name: "Mesocortical", tone: "ok", text: "Agonismo parcial pode até aumentar a dopamina aqui: pouca piora de negativos" }
      : ht2a >= d2
      ? { name: "Mesocortical", tone: "ok", text: "Bloqueio 5-HT2A libera dopamina aqui: menor piora de negativos e cognição" }
      : { name: "Mesocortical", tone: "warn", text: "Bloqueio D2 pode piorar sintomas negativos e cognitivos" },
    nigrostriatal: {
      name: "Nigroestriatal",
      tone: levelTone(park),
      text: `Parkinsonismo: risco ${PHARMA_EFFECT_LEVELS[park]}${park <= 1 && !partial && ht2a >= d2 ? " (5-HT2A protege)" : ""}`,
    },
    tuberoinfundibular: {
      name: "Tuberoinfundibular",
      tone: levelTone(prl),
      text: drug.id === "aripiprazol" ? "Prolactina: muito baixa, pode até cair" : `Prolactina: aumento ${PHARMA_EFFECT_LEVELS[prl]}`,
    },
  };
}

/* Cada via tem uma cor fixa (paleta segura para daltonismo, Okabe-Ito); a gravidade do efeito vai
   numa etiqueta no balão, e a via pouco afetada pelo remédio aparece tracejada e mais clara. */
const PHARMA_PATHWAY_COLORS = {
  mesolimbic: "#0b6b70",
  mesocortical: "#d55e00",
  nigrostriatal: "#0072b2",
  tuberoinfundibular: "#b0418a",
};

function pharmaPathFaint(path) {
  return path.tone === "low" || path.tone === "ok";
}

function pharmaBrainSvg(paths) {
  const c = (key) => `${PHARMA_PATHWAY_COLORS[key]}" class="pharma-path${pharmaPathFaint(paths[key]) ? " faint" : ""}`;
  const n = (key) => PHARMA_PATHWAY_COLORS[key];
  return `
    <svg class="pharma-brain" viewBox="0 0 560 400" role="img" aria-label="Corte do cérebro com as quatro vias dopaminérgicas">
      <path d="M70 225 C58 140 130 58 250 48 C372 38 482 90 507 178 C526 248 492 298 432 312 C400 320 372 316 352 328 C337 343 331 366 302 368 C272 370 264 346 250 332 C200 327 120 318 90 288 C78 276 72 256 70 225 Z" class="pharma-brain-outline"></path>
      <ellipse cx="420" cy="318" rx="62" ry="34" class="pharma-brain-cerebellum"></ellipse>
      <path d="M296 330 C298 356 294 380 288 398" class="pharma-brain-stem"></path>
      <path d="M296 288 C262 252 182 222 126 168" stroke="${c("mesocortical")}"></path>
      <path d="M296 288 C272 272 236 246 206 232" stroke="${c("mesolimbic")}"></path>
      <path d="M316 278 C306 242 282 206 256 190" stroke="${c("nigrostriatal")}"></path>
      <path d="M246 266 C244 280 241 290 237 304" stroke="${c("tuberoinfundibular")}"></path>
      <circle cx="296" cy="288" r="9" class="pharma-node-origin"></circle>
      <circle cx="316" cy="278" r="9" class="pharma-node-origin"></circle>
      <circle cx="126" cy="168" r="8" class="pharma-node" stroke="${n("mesocortical")}"></circle>
      <circle cx="206" cy="232" r="8" class="pharma-node" stroke="${n("mesolimbic")}"></circle>
      <circle cx="256" cy="190" r="8" class="pharma-node" stroke="${n("nigrostriatal")}"></circle>
      <ellipse cx="236" cy="310" rx="10" ry="8" class="pharma-node" stroke="${n("tuberoinfundibular")}"></ellipse>
      <text x="104" y="150" class="pharma-label">Córtex pré-frontal</text>
      <text x="140" y="256" class="pharma-label">N. accumbens</text>
      <text x="236" y="176" class="pharma-label">Estriado</text>
      <text x="150" y="330" class="pharma-label">Hipófise</text>
      <text x="320" y="302" class="pharma-label small">ATV</text>
      <text x="334" y="276" class="pharma-label small">Subst. negra</text>
    </svg>`;
}

function pharmaReceptorRows(drug) {
  return pharmaClass().receptors.map((receptor) => {
    const value = drug.receptors[receptor.id] ?? 0;
    const partial = pharmaIsPartial(drug, receptor.id);
    return `
      <div class="pharma-receptor" title="${escapeHtml(receptor.role)}">
        <strong>${escapeHtml(receptor.label)}</strong>
        <span class="pharma-bar" role="img" aria-label="${escapeHtml(receptor.label)}: afinidade ${PHARMA_LEVELS[value]}"><i class="${partial ? "partial" : ""}" style="width:${Math.max(4, value * 25)}%"></i></span>
        <small>${(pharmaIsStabilizer() ? PHARMA_ACTION_LABELS : PHARMA_LEVELS)[value]}${partial ? " · agonista parcial" : ""}</small>
      </div>`;
  }).join("");
}

function pharmaEffectChips(drug) {
  return pharmaClass().effects.map((effect) => {
    const value = drug.effects[effect.id] ?? 0;
    return `<span class="pharma-effect level-${value}" title="Por quê: ${escapeHtml(effect.why)}">${escapeHtml(effect.label)}: ${PHARMA_EFFECT_LEVELS[value]}</span>`;
  }).join("");
}

function pharmaStudyLink(drug) {
  const count = pharmaQuestionCount(drug);
  return `
    <button type="button" class="pharma-study" data-pharma-study="${escapeHtml(drug.id)}" ${count ? "" : "disabled"}>
      <span class="pharma-study-tag">Estudo</span>
      <span>${count ? `${pluralize(count, "questão do banco cita", "questões do banco citam")} ${escapeHtml(drug.name.toLowerCase())}` : `Nenhuma questão do banco cita ${escapeHtml(drug.name.toLowerCase())} ainda`}</span>
      <span aria-hidden="true">›</span>
    </button>`;
}

function pharmaDrugChips(selected) {
  return pharmaClass().drugs.map((drug) => `
    <button type="button" class="pharma-chip ${drug.id === selected ? "on" : ""}" data-pharma-drug="${drug.id}" aria-pressed="${drug.id === selected}">${escapeHtml(drug.name)}</button>`).join("");
}

/* ---------- Ansiolíticos e hipnóticos: GABA-A, meia-vida, retirada e equivalência ---------- */

const PHARMA_ANX_COLORS = { A1: "#0072b2", A23: "#009e73", A5: "#e69f00", A2D: "#d55e00", HT1A: "#b0418a" };

function pharmaIsAnxiolytic() {
  return pharmaClass()?.kind === "anxiolytic";
}

function pharmaHalfLifeMid(drug) {
  return (drug.halfLife[0] + drug.halfLife[1]) / 2;
}

function pharmaHalfLifeText(drug) {
  const [low, high] = drug.halfLife;
  const fmt = (value) => String(value).replace(".", ",");
  return low === high ? `~${fmt(low)} h` : `${fmt(low)}–${fmt(high)} h`;
}

function pharmaPentamer(x, y) {
  const subunits = Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return `<circle cx="${(x + Math.cos(angle) * 27).toFixed(1)}" cy="${(y + Math.sin(angle) * 27).toFixed(1)}" r="16"></circle>`;
  }).join("");
  return `${subunits}<circle cx="${x}" cy="${y}" r="8" class="pore"></circle>`;
}

function pharmaAnxSvg(drug) {
  const r = drug.receptors;
  const cls = (id) => `pharma-target${r[id] === 0 ? " faint" : ""}${r[id] >= 3 ? " strong" : ""}`;
  const c = PHARMA_ANX_COLORS;
  return `
    <svg class="pharma-brain" viewBox="0 0 560 300" role="img" aria-label="Receptores GABA-A com subunidades α1, α2/α3 e α5, canal de cálcio com α2δ e receptor 5-HT1A">
      <g class="${cls("A1")}" style="--t:${c.A1}">${pharmaPentamer(80, 96)}<text x="80" y="160" text-anchor="middle" class="pharma-label">GABA-A</text><text x="80" y="178" text-anchor="middle" class="pharma-label small">com α1</text></g>
      <g class="${cls("A23")}" style="--t:${c.A23}">${pharmaPentamer(200, 96)}<text x="200" y="160" text-anchor="middle" class="pharma-label">GABA-A</text><text x="200" y="178" text-anchor="middle" class="pharma-label small">com α2/α3</text></g>
      <g class="${cls("A5")}" style="--t:${c.A5}">${pharmaPentamer(320, 96)}<text x="320" y="160" text-anchor="middle" class="pharma-label">GABA-A</text><text x="320" y="178" text-anchor="middle" class="pharma-label small">com α5</text></g>
      <g class="${cls("A2D")}" style="--t:${c.A2D}">
        <rect x="420" y="62" width="34" height="70" rx="8"></rect><rect x="458" y="62" width="34" height="70" rx="8"></rect>
        <circle cx="510" cy="58" r="16"></circle>
        <text x="476" y="160" text-anchor="middle" class="pharma-label">Canal de Ca²⁺</text><text x="476" y="178" text-anchor="middle" class="pharma-label small">subunidade α2δ</text>
      </g>
      <g class="${cls("HT1A")}" style="--t:${c.HT1A}">
        <path d="M232 268 v-36 h14 v20 h20 v-20 h14 v36 z"></path>
        <text x="300" y="246" class="pharma-label">5-HT1A</text><text x="300" y="264" class="pharma-label small">receptor de serotonina</text>
      </g>
      <text x="200" y="22" text-anchor="middle" class="pharma-label small">Cl⁻ entra pelo poro central quando o GABA abre o canal</text>
    </svg>`;
}

function renderAnxMech(drug) {
  const rows = Object.fromEntries(pharmaClass().receptors.map((target) => {
    const value = drug.receptors[target.id] ?? 0;
    const partial = pharmaIsPartial(drug, target.id);
    return [target.id, { name: target.label, text: target.role, badge: partial && value ? "agonista parcial" : PHARMA_ACTION_LABELS[value], badgeTone: value >= 3 ? "good" : value ? "ok" : "low", faint: value === 0 }];
  }));
  const indications = pharmaClass().indications.map((item) => {
    const value = drug.indications[item.id] ?? 0;
    return `<span class="pharma-effect evidence-${value}">${escapeHtml(item.label)}: ${PHARMA_EVIDENCE_LABELS[value]}</span>`;
  }).join("");
  return `
    <div class="pharma-chips" role="group" aria-label="Ansiolíticos e hipnóticos">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Onde age · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))} · meia-vida ${pharmaHalfLifeText(drug)}</span></div>
        ${pharmaAnxSvg(drug)}
        <div class="pharma-paths">${pharmaPathRows(rows, PHARMA_ANX_COLORS)}</div>
      </section>
      <section class="pharma-card">
        <h3>Para que serve</h3>
        <div class="pharma-effects">${indications}</div>
        <p class="pharma-extra">${escapeHtml(drug.extra)}</p>
        <h4>O que vigiar</h4>
        <div class="pharma-effects">${pharmaEffectChips(drug)}</div>
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

/* Curva didática de concentração: uma dose por dia (à noite), eliminação de primeira ordem com a
   meia-vida média do remédio; 1,0 = pico de uma dose isolada. */
function pharmaKinetics(drug, days, stopped) {
  const k = Math.log(2) / pharmaHalfLifeMid(drug);
  const doses = Array.from({ length: days }, (_, i) => i * 24);
  const end = (days + 5) * 24;
  const points = [];
  for (let t = 0; t <= end; t += 2) {
    const given = stopped ? doses.filter((dose) => dose <= t) : Array.from({ length: Math.floor(t / 24) + 1 }, (_, i) => i * 24);
    points.push([t, given.reduce((sum, dose) => sum + Math.exp(-k * (t - dose)), 0)]);
  }
  const accumulation = 1 / (1 - Math.exp(-k * 24));
  const morning = Math.exp(-k * 8) * doses.reduce((sum, dose) => sum + Math.exp(-k * ((days - 1) * 24 - dose)), 0);
  return { points, end, accumulation, morning, steadyDays: (4.5 * pharmaHalfLifeMid(drug)) / 24, lastDose: (days - 1) * 24 };
}

function pharmaKineticsSvg(drug, days, stopped) {
  const data = pharmaKinetics(drug, days, stopped);
  const top = Math.max(1.2, ...data.points.map((point) => point[1])) * 1.08;
  const x = (t) => 40 + (t / data.end) * 540;
  const y = (c) => 200 - (c / top) * 180;
  const line = data.points.map((point) => `${x(point[0]).toFixed(1)},${y(point[1]).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: Math.floor(data.end / 24) + 1 }, (_, i) => i).filter((i) => i % (data.end > 24 * 14 ? 2 : 1) === 0)
    .map((i) => `<line x1="${x(i * 24)}" y1="200" x2="${x(i * 24)}" y2="204" class="kin-axis"></line><text x="${x(i * 24)}" y="218" text-anchor="middle" class="pharma-label small">${i}</text>`).join("");
  return `
    <svg class="pharma-kinetics" viewBox="0 0 600 230" role="img" aria-label="Curva de concentração de ${escapeHtml(drug.name)} com uma dose por dia por ${days} dias">
      <line x1="40" y1="200" x2="580" y2="200" class="kin-axis"></line>
      <line x1="40" y1="${y(1)}" x2="580" y2="${y(1)}" class="kin-ref"></line>
      <text x="578" y="${y(1) - 5}" text-anchor="end" class="pharma-label small kin-ref-label">pico de uma dose</text>
      ${stopped ? `<line x1="${x(data.lastDose + 24)}" y1="20" x2="${x(data.lastDose + 24)}" y2="200" class="kin-stop"></line><text x="${x(data.lastDose + 24) + 4}" y="32" class="pharma-label small">parou</text>` : ""}
      <polyline points="${line}" class="kin-line"></polyline>
      ${ticks}
      <text x="580" y="218" text-anchor="end" class="pharma-label small">dias</text>
    </svg>`;
}

function pharmaWithdrawalText(drug) {
  const half = pharmaHalfLifeMid(drug);
  if (drug.id === "buspirona") return "Sem síndrome de retirada nem dependência relevantes.";
  if (half <= 8) return "Meia-vida curta: o nível cai em horas. Retirada e rebote (insônia, ansiedade) podem começar já no dia seguinte e são mais intensos.";
  if (half <= 20) return "Meia-vida intermediária: a retirada costuma aparecer em 1 a 2 dias e é intensa; troca por diazepam e redução gradual ajudam.";
  return "Meia-vida longa: o nível cai devagar, como uma redução automática. A retirada aparece mais tarde (vários dias) e costuma ser mais suave, mas o acúmulo pesa em idosos e na doença hepática.";
}

function renderAnxKineticsView(drug) {
  const days = state.pharma.days || 7;
  const stopped = Boolean(state.pharma.stopped);
  const data = pharmaKinetics(drug, days, stopped);
  const pct = (value) => `${Math.round(value * 100)}%`;
  return `
    ${pharmaKineticsSvg(drug, days, stopped)}
    <div class="pharma-reading tone-${data.accumulation >= 2 ? "warn" : "good"}">
      <strong>Acúmulo com uso diário: ${data.accumulation.toFixed(1).replace(".", ",")} vezes o pico de uma dose</strong>
      <span>Chega ao equilíbrio em cerca de ${data.steadyDays < 1 ? "menos de 1 dia" : `${Math.round(data.steadyDays)} ${Math.round(data.steadyDays) === 1 ? "dia" : "dias"}`} (4 a 5 meias-vidas).</span>
    </div>
    <div class="pharma-reading tone-${data.morning >= 0.5 ? "high" : data.morning >= 0.25 ? "warn" : "good"}">
      <strong>Na manhã seguinte (8 h depois da dose): ${pct(data.morning)} do pico de uma dose</strong>
      <span>${data.morning >= 0.5 ? "Sobra muito remédio de manhã: risco de ressaca, sonolência ao dirigir e quedas." : data.morning >= 0.25 ? "Ainda sobra parte do efeito pela manhã." : "Pouco resto pela manhã: menos ressaca."}</span>
    </div>
    ${stopped ? `<div class="pharma-reading tone-warn"><strong>Depois de parar</strong><span>${escapeHtml(pharmaWithdrawalText(drug))}</span></div>` : ""}`;
}

function pharmaEqChoice(drug) {
  const options = pharmaClass().drugs.filter((item) => item.eq);
  const chosen = options.find((item) => item.id === state.pharma.eqDrug) || options.find((item) => item.id === drug.id) || options[0];
  const dose = Number(state.pharma.eqDose ?? chosen.eq);
  return { options, chosen, dose: Number.isFinite(dose) ? dose : chosen.eq };
}

function renderAnxEquivalenceResult(drug) {
  const { options, chosen, dose } = pharmaEqChoice(drug);
  const diazepam = (dose / chosen.eq) * 10;
  const fmt = (value) => (Math.round(value * 100) / 100).toString().replace(".", ",");
  return `<div class="pharma-reading tone-good"><strong>≈ ${fmt(diazepam)} mg de diazepam</strong><span>${options.filter((item) => item.id !== chosen.id && item.id !== "diazepam").map((item) => `${escapeHtml(item.name)} ${fmt((diazepam / 10) * item.eq)} mg`).join(" · ")}</span></div>`;
}

function renderAnxEquivalence(drug) {
  const { options, chosen, dose } = pharmaEqChoice(drug);
  return `
    <h3>Dose equivalente</h3>
    <div class="pharma-eq">
      <label><span>Remédio</span><select data-pharma-eq="drug">${options.map((item) => `<option value="${item.id}" ${item.id === chosen.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>
      <label><span>Dose (mg)</span><input type="number" min="0" step="0.25" value="${dose}" data-pharma-eq="dose" inputmode="decimal"></label>
    </div>
    <div id="pharmaEqResult">${renderAnxEquivalenceResult(drug)}</div>
    <p class="pharma-extra">Equivalências aproximadas, para orientar a troca por diazepam na retirada; ajustar pelos sintomas. Midazolam, eszopiclona, pregabalina e buspirona não entram na tabela.</p>`;
}

function renderAnxKinetics(drug) {
  const days = state.pharma.days || 7;
  return `
    <div class="pharma-chips" role="group" aria-label="Ansiolíticos e hipnóticos">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Concentração · ${escapeHtml(drug.name)}</h3><span>meia-vida ${pharmaHalfLifeText(drug)}</span></div>
        <label class="pharma-slider-label" for="pharmaDays">Dias de uso, uma dose à noite: <strong data-pharma-days-label>${days}</strong></label>
        <input id="pharmaDays" class="pharma-slider" type="range" min="1" max="21" step="1" value="${days}" data-pharma-days>
        <div class="pharma-toggles"><button type="button" class="pharma-toggle ${state.pharma.stopped ? "on" : ""}" data-pharma-stop aria-pressed="${Boolean(state.pharma.stopped)}">Parar de repente depois do último dia</button></div>
        <div id="pharmaKineticsView">${renderAnxKineticsView(drug)}</div>
        <p class="pharma-extra">Modelo didático: eliminação simples com a meia-vida média; o efeito clínico pode durar menos que a meia-vida, e metabólitos ativos (como os do diazepam) prolongam a ação.</p>
      </section>
      <section class="pharma-card">${renderAnxEquivalence(drug)}${pharmaStudyLink(drug)}</section>
    </div>`;
}

/* ---------- Psicoestimulantes e TDAH: regiões, alvos e perfil ao longo do dia ---------- */

const PHARMA_REGION_COLORS = { pfc: "#0072b2", striatum: "#d55e00", body: "#b0418a" };
const PHARMA_REGION_LABELS = ["sem efeito direto", "efeito leve", "efeito moderado", "efeito forte"];

function pharmaIsStimulant() {
  return pharmaClass()?.kind === "stimulant";
}

function pharmaStimRegions(drug) {
  const r = drug.regions;
  const level = (value) => ({ badge: value < 0 ? "reduz" : PHARMA_REGION_LABELS[value], badgeTone: value < 0 ? "warn" : value >= 2 ? "good" : value === 1 ? "ok" : "low", faint: value === 0 });
  return {
    pfc: { name: "Pré-frontal", ...level(r.pfc), text: "Dopamina e noradrenalina: atenção, memória de trabalho e controle de impulsos" },
    striatum: { name: "Estriado e accumbens", ...level(r.striatum), text: r.striatum ? "Dopamina: hiperatividade e recompensa; subidas rápidas aqui dão potencial de abuso" : "Sem subida de dopamina aqui: sem potencial de abuso" },
    body: {
      name: "Corpo",
      ...level(r.body),
      text: r.body < 0 ? "Agonismo α2 no tronco cerebral reduz a saída simpática: pressão e frequência caem" : "Noradrenalina no corpo: pressão e frequência sobem, apetite cai",
    },
  };
}

function pharmaStimSvg(regions) {
  const stroke = (key) => `${PHARMA_REGION_COLORS[key]}" class="pharma-path${regions[key].faint ? " faint" : ""}`;
  const node = (key) => PHARMA_REGION_COLORS[key];
  return `
    <svg class="pharma-brain" viewBox="0 0 560 400" role="img" aria-label="Corte do cérebro com pré-frontal, estriado e accumbens, e a saída para o corpo">
      <path d="M70 225 C58 140 130 58 250 48 C372 38 482 90 507 178 C526 248 492 298 432 312 C400 320 372 316 352 328 C337 343 331 366 302 368 C272 370 264 346 250 332 C200 327 120 318 90 288 C78 276 72 256 70 225 Z" class="pharma-brain-outline"></path>
      <ellipse cx="420" cy="318" rx="62" ry="34" class="pharma-brain-cerebellum"></ellipse>
      <path d="M296 330 C298 356 294 380 288 398" class="pharma-brain-stem"></path>
      <path d="M296 288 C262 252 182 222 126 168" stroke="${stroke("pfc")}"></path>
      <path d="M326 318 C392 250 300 120 150 150" stroke="${stroke("pfc")}"></path>
      <path d="M296 288 C272 272 236 246 206 232" stroke="${stroke("striatum")}"></path>
      <path d="M296 288 C290 250 276 210 256 190" stroke="${stroke("striatum")}"></path>
      <path d="M318 330 C318 356 312 378 306 398" stroke="${stroke("body")}"></path>
      <circle cx="296" cy="288" r="9" class="pharma-node-origin"></circle>
      <circle cx="326" cy="318" r="9" class="pharma-node-origin"></circle>
      <circle cx="126" cy="168" r="8" class="pharma-node" stroke="${node("pfc")}"></circle>
      <circle cx="150" cy="150" r="7" class="pharma-node" stroke="${node("pfc")}"></circle>
      <circle cx="206" cy="232" r="8" class="pharma-node" stroke="${node("striatum")}"></circle>
      <circle cx="256" cy="190" r="8" class="pharma-node" stroke="${node("striatum")}"></circle>
      <text x="92" y="132" class="pharma-label">Córtex pré-frontal</text>
      <text x="140" y="256" class="pharma-label">N. accumbens</text>
      <text x="236" y="176" class="pharma-label">Estriado</text>
      <text x="306" y="282" class="pharma-label small">ATV</text>
      <text x="338" y="346" class="pharma-label small">L. coeruleus</text>
      <text x="316" y="394" class="pharma-label small">para o coração e os vasos</text>
    </svg>`;
}

function renderStimMech(drug) {
  const regions = pharmaStimRegions(drug);
  const indications = pharmaClass().indications.map((item) => {
    const value = drug.indications[item.id] ?? 0;
    return `<span class="pharma-effect evidence-${value}">${escapeHtml(item.label)}: ${PHARMA_EVIDENCE_LABELS[value]}</span>`;
  }).join("");
  return `
    <div class="pharma-chips" role="group" aria-label="Psicoestimulantes e TDAH">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Onde age · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
        ${pharmaStimSvg(regions)}
        <div class="pharma-paths">${pharmaPathRows(regions, PHARMA_REGION_COLORS)}</div>
      </section>
      <section class="pharma-card">
        <h3>Alvos</h3>
        <div class="pharma-receptors">${pharmaReceptorRows(drug)}</div>
        <p class="pharma-extra">${escapeHtml(drug.extra)}</p>
        <h4>Quando escolher</h4>
        <div class="pharma-effects">${indications}</div>
        <h4>O que vigiar</h4>
        <div class="pharma-effects">${pharmaEffectChips(drug)}</div>
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

/* Efeito relativo (0 a ~1) na hora "clock" para uma dose às "dose" horas: soma dos componentes da
   formulação, cada um em forma de trapézio (sobe, platô, desce em 1,5 h). */
function pharmaStimEffect(drug, clock, dose, repeat) {
  const doses = repeat && drug.day.repeat ? [dose, dose + 4] : [dose];
  return doses.reduce((total, given) => total + drug.day.components.reduce((sum, part) => {
    const x = clock - given;
    if (x < part.start || x >= part.dur) return sum;
    const value = x < part.start + part.rise ? (x - part.start) / part.rise : x < part.dur - 1.5 ? 1 : (part.dur - x) / 1.5;
    return sum + part.w * value;
  }, 0), 0);
}

const PHARMA_STIM_THRESHOLD = 0.35;

function pharmaStimCoverage(drug, dose, repeat) {
  const points = [];
  for (let clock = 6; clock <= 24.001; clock += 0.25) points.push([clock, pharmaStimEffect(drug, clock, dose, repeat)]);
  const useful = points.filter((point) => point[1] >= PHARMA_STIM_THRESHOLD);
  return { points, from: useful.length ? useful[0][0] : null, to: useful.length ? useful[useful.length - 1][0] : null };
}

function pharmaClock(value) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return minutes ? `${hours}h${String(minutes).padStart(2, "0")}` : `${hours}h`;
}

function pharmaStimDaySvg(drug, dose, repeat) {
  const data = pharmaStimCoverage(drug, dose, repeat);
  const top = Math.max(1.05, ...data.points.map((point) => point[1])) * 1.05;
  const x = (clock) => 40 + ((clock - 6) / 18) * 540;
  const y = (value) => 190 - (value / top) * 170;
  const band = (from, to, label, cls) => `<rect x="${x(from)}" y="20" width="${x(to) - x(from)}" height="170" class="day-band ${cls}"></rect><text x="${(x(from) + x(to)) / 2}" y="34" text-anchor="middle" class="pharma-label small">${label}</text>`;
  const line = data.points.map((point) => `${x(point[0]).toFixed(1)},${y(point[1]).toFixed(1)}`).join(" ");
  const ticks = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((clock) => `<line x1="${x(clock)}" y1="190" x2="${x(clock)}" y2="194" class="kin-axis"></line><text x="${x(clock)}" y="208" text-anchor="middle" class="pharma-label small">${clock}h</text>`).join("");
  return `
    <svg class="pharma-kinetics" viewBox="0 0 600 220" role="img" aria-label="Efeito de ${escapeHtml(drug.name)} ao longo do dia com dose às ${pharmaClock(dose)}">
      ${band(8, 12, "escola ou trabalho", "school")}${band(13, 18, "tarefas da tarde", "afternoon")}${band(22, 24, "sono", "sleep")}
      <line x1="40" y1="190" x2="580" y2="190" class="kin-axis"></line>
      <line x1="40" y1="${y(PHARMA_STIM_THRESHOLD)}" x2="580" y2="${y(PHARMA_STIM_THRESHOLD)}" class="kin-ref"></line>
      <text x="578" y="${y(PHARMA_STIM_THRESHOLD) - 5}" text-anchor="end" class="pharma-label small">efeito útil</text>
      <polygon points="${x(6)},190 ${line} ${x(24)},190" class="day-area"></polygon>
      <polyline points="${line}" class="kin-line"></polyline>
      <line x1="${x(dose)}" y1="190" x2="${x(dose)}" y2="176" class="day-dose"></line>
      ${repeat && drug.day.repeat ? `<line x1="${x(dose + 4)}" y1="190" x2="${x(dose + 4)}" y2="176" class="day-dose"></line>` : ""}
      ${ticks}
    </svg>`;
}

function renderStimDayView(drug) {
  const dose = state.pharma.doseTime ?? 7;
  const repeat = Boolean(state.pharma.repeat);
  const data = pharmaStimCoverage(drug, dose, repeat);
  const at = (clock) => pharmaStimEffect(drug, clock, dose, repeat);
  const covers = (from, to) => data.from !== null && data.from <= from + 0.5 && data.to >= to - 0.5;
  const night = at(22);
  const lastDrop = drug.day.components.length === 1 && drug.day.components[0].dur <= 5;
  return `
    ${pharmaStimDaySvg(drug, dose, repeat)}
    <div class="pharma-reading tone-good"><strong>${data.from === null ? "Efeito abaixo do útil" : `Efeito útil das ${pharmaClock(data.from)} às ${pharmaClock(data.to)}`}</strong><span>Início ${escapeHtml(drug.day.onset)} depois da dose; duração ${escapeHtml(drug.day.duration)} (Maudsley, tabela 5.10).</span></div>
    <div class="pharma-reading tone-${covers(8, 12) ? "good" : "warn"}"><strong>Escola ou trabalho (8h–12h): ${covers(8, 12) ? "coberto" : "não coberto por inteiro"}</strong><span>Tarefas da tarde (13h–18h): ${covers(13, 18) ? "cobertas" : "não cobertas por inteiro"}.${!covers(13, 18) && drug.day.repeat && !repeat ? " Uma segunda dose ajuda." : ""}</span></div>
    <div class="pharma-reading tone-${night >= 0.2 ? "high" : "good"}"><strong>Às 22h: ${night >= 0.2 ? "ainda há efeito — risco de insônia" : "efeito já passou"}</strong><span>${night >= 0.2 ? "Dose mais cedo ou formulação mais curta." : "Menos risco de atrapalhar o sono."}${lastDrop ? " A queda rápida no fim de cada dose pode trazer rebote (irritabilidade, piora dos sintomas)." : ""}</span></div>`;
}

function renderStimDay(drug) {
  if (drug.day.weeks) {
    return `
      <div class="pharma-chips" role="group" aria-label="Psicoestimulantes e TDAH">${pharmaDrugChips(drug.id)}</div>
      <div class="pharma-grid">
        <section class="pharma-card">
          <div class="pharma-card-head"><h3>Ao longo do dia · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
          <div class="pharma-reading tone-ok"><strong>Não tem curva de horas: o efeito se instala em ${escapeHtml(drug.day.weeks)}</strong><span>Depois disso cobre o dia todo, sem picos nem rebote no fim da tarde. Não serve para uso "quando precisar".</span></div>
          <p class="pharma-extra">${escapeHtml(drug.extra)}</p>
        </section>
        <section class="pharma-card"><h3>Por que não é estimulante</h3><p class="pharma-extra">Não aumenta a dopamina no accumbens de forma rápida, por isso não tem o potencial de abuso dos estimulantes. É uma alternativa quando há risco de desvio, tiques ou intolerância.</p>${pharmaStudyLink(drug)}</section>
      </div>`;
  }
  const dose = state.pharma.doseTime ?? 7;
  return `
    <div class="pharma-chips" role="group" aria-label="Psicoestimulantes e TDAH">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Ao longo do dia · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
        <label class="pharma-slider-label" for="pharmaDose">Horário da dose: <strong data-pharma-dose-label>${pharmaClock(dose)}</strong></label>
        <input id="pharmaDose" class="pharma-slider" type="range" min="6" max="12" step="0.5" value="${dose}" data-pharma-dose>
        ${drug.day.repeat ? `<div class="pharma-toggles"><button type="button" class="pharma-toggle ${state.pharma.repeat ? "on" : ""}" data-pharma-repeat aria-pressed="${Boolean(state.pharma.repeat)}">Segunda dose 4 h depois</button></div>` : ""}
        <div id="pharmaDayView">${renderStimDayView(drug)}</div>
        <p class="pharma-extra">Curva didática montada com o início e a duração de cada formulação; o efeito real varia de pessoa para pessoa e com a dose.</p>
      </section>
      <section class="pharma-card"><h3>Formulação</h3><p class="pharma-extra">${escapeHtml(drug.extra)}</p>${pharmaStudyLink(drug)}</section>
    </div>`;
}

function pharmaStimCues(drug) {
  const r = drug.receptors;
  const cues = [];
  if (r.REL >= 3) cues.push("faz o neurônio liberar dopamina: anfetamina");
  else if (r.DAT >= 3 && r.NET >= 2) cues.push("bloqueia DAT e NET: metilfenidato");
  if (r.NET >= 4 && r.DAT === 0) cues.push("só NET, sem DAT: atomoxetina");
  if (r.A2A >= 3) cues.push("agonista α2A, sem mexer nos transportadores");
  return `${cues.length ? `Pistas: ${cues.join("; ")}. ` : ""}${drug.extra}`;
}

/* "Qual destas formulações cobre mais (ou menos) horas do dia?" e "Qual leva semanas?". */
function pharmaDurationQuestion(drugs) {
  const timed = drugs.filter((drug) => drug.day && !drug.day.weeks);
  if (timed.length < 4) return null;
  const span = (drug) => {
    const data = pharmaStimCoverage(drug, 7, false);
    return data.from === null ? 0 : data.to - data.from;
  };
  const pool = pharmaShuffle(timed).slice(0, 4);
  const sorted = [...pool].sort((a, b) => span(a) - span(b));
  const longest = Math.random() < 0.5;
  if (span(sorted[3]) - span(sorted[2]) < 0.5 || span(sorted[1]) - span(sorted[0]) < 0.5) return null;
  return { type: "duration", longest, correct: (longest ? sorted[3] : sorted[0]).id, options: pool.map((drug) => drug.id) };
}

function pharmaWeeksQuestion(drugs) {
  const slow = drugs.filter((drug) => drug.day?.weeks);
  const fast = drugs.filter((drug) => drug.day && !drug.day.weeks);
  if (!slow.length || fast.length < 3) return null;
  const correct = slow[Math.floor(Math.random() * slow.length)];
  return { type: "weeks", correct: correct.id, options: pharmaShuffle([correct, ...pharmaShuffle(fast).slice(0, 3)]).map((drug) => drug.id) };
}

/* ---------- Antidepressivos: sistemas de serotonina, noradrenalina e dopamina ---------- */

const PHARMA_SYSTEM_COLORS = { serotonin: "#b0418a", noradrenaline: "#0072b2", dopamine: "#d55e00" };
const PHARMA_BOOST_LABELS = ["sem efeito direto", "aumento leve", "aumento moderado", "aumento forte"];

function pharmaSystems(drug) {
  const boost = drug.boost || {};
  const level = (value) => ({ badge: PHARMA_BOOST_LABELS[value], badgeTone: value >= 2 ? "good" : value === 1 ? "ok" : "low", faint: value === 0 });
  return {
    serotonin: {
      name: "Serotonina",
      ...level(boost.serotonin || 0),
      text: boost.serotonin ? "Da rafe para o córtex, o sistema límbico e a medula: humor e ansiedade; no intestino e na medula, náusea e disfunção sexual" : "Este remédio não aumenta a serotonina diretamente",
    },
    noradrenaline: {
      name: "Noradrenalina",
      ...level(boost.noradrenaline || 0),
      text: boost.noradrenaline ? "Do locus coeruleus para o córtex e o cerebelo: energia, atenção e dor; pode dar sudorese, taquicardia e aumento da pressão" : "Este remédio não aumenta a noradrenalina diretamente",
    },
    dopamine: {
      name: "Dopamina no pré-frontal",
      ...level(boost.dopamine || 0),
      text: boost.dopamine ? "No pré-frontal quase não há DAT: quem recapta a dopamina é o NET. Mais dopamina aqui: motivação e concentração" : "Sem aumento relevante de dopamina",
    },
  };
}

function pharmaSystemsSvg(systems) {
  const stroke = (key) => `${PHARMA_SYSTEM_COLORS[key]}" class="pharma-path${systems[key].faint ? " faint" : ""}`;
  const node = (key) => PHARMA_SYSTEM_COLORS[key];
  return `
    <svg class="pharma-brain" viewBox="0 0 560 400" role="img" aria-label="Corte do cérebro com os sistemas de serotonina, noradrenalina e dopamina">
      <path d="M70 225 C58 140 130 58 250 48 C372 38 482 90 507 178 C526 248 492 298 432 312 C400 320 372 316 352 328 C337 343 331 366 302 368 C272 370 264 346 250 332 C200 327 120 318 90 288 C78 276 72 256 70 225 Z" class="pharma-brain-outline"></path>
      <ellipse cx="420" cy="318" rx="62" ry="34" class="pharma-brain-cerebellum"></ellipse>
      <path d="M296 330 C298 356 294 380 288 398" class="pharma-brain-stem"></path>
      <path d="M302 330 C250 318 172 262 142 196" stroke="${stroke("serotonin")}"></path>
      <path d="M302 330 C282 316 256 306 236 300" stroke="${stroke("serotonin")}"></path>
      <path d="M302 330 C300 356 296 378 291 396" stroke="${stroke("serotonin")}"></path>
      <path d="M326 318 C392 250 342 112 222 98" stroke="${stroke("noradrenaline")}"></path>
      <path d="M326 318 C356 326 384 326 404 318" stroke="${stroke("noradrenaline")}"></path>
      <path d="M296 288 C262 252 182 222 126 168" stroke="${stroke("dopamine")}"></path>
      <circle cx="302" cy="330" r="9" class="pharma-node-origin"></circle>
      <circle cx="326" cy="318" r="9" class="pharma-node-origin"></circle>
      <circle cx="296" cy="288" r="8" class="pharma-node-origin"></circle>
      <circle cx="142" cy="196" r="7" class="pharma-node" stroke="${node("serotonin")}"></circle>
      <circle cx="236" cy="300" r="7" class="pharma-node" stroke="${node("serotonin")}"></circle>
      <circle cx="222" cy="98" r="7" class="pharma-node" stroke="${node("noradrenaline")}"></circle>
      <circle cx="404" cy="318" r="7" class="pharma-node" stroke="${node("noradrenaline")}"></circle>
      <circle cx="126" cy="168" r="7" class="pharma-node" stroke="${node("dopamine")}"></circle>
      <text x="96" y="150" class="pharma-label">Córtex pré-frontal</text>
      <text x="206" y="84" class="pharma-label">Córtex</text>
      <text x="150" y="322" class="pharma-label">Hipotálamo</text>
      <text x="392" y="370" class="pharma-label">Cerebelo</text>
      <text x="304" y="396" class="pharma-label small">Medula</text>
      <text x="306" y="282" class="pharma-label small">ATV</text>
      <text x="256" y="352" class="pharma-label small">Rafe</text>
      <text x="338" y="346" class="pharma-label small">L. coeruleus</text>
    </svg>`;
}

function pharmaPathRows(paths, colors) {
  return Object.entries(paths).map(([key, path]) => `
    <div class="pharma-path-row" style="--path:${colors[key]}">
      <i class="${path.faint ? "faint" : ""}"></i>
      <span><strong>${path.name}</strong> · ${escapeHtml(path.text)}</span>
      <em class="pharma-severity tone-${path.badgeTone}">${path.badge}</em>
    </div>`).join("");
}

function renderPharmaPaths() {
  const drug = pharmaDrug(state.pharma.drug);
  if (pharmaIsStabilizer()) return renderStabilizerMech(drug);
  if (pharmaIsAnxiolytic()) return renderAnxMech(drug);
  if (pharmaIsStimulant()) return renderStimMech(drug);
  const antidepressant = pharmaIsAntidepressant();
  let figure;
  let rows;
  let title;
  if (antidepressant) {
    const systems = pharmaSystems(drug);
    figure = pharmaSystemsSvg(systems);
    rows = pharmaPathRows(systems, PHARMA_SYSTEM_COLORS);
    title = "Sistemas de monoaminas";
  } else {
    const paths = pharmaPathways(drug);
    Object.values(paths).forEach((path) => Object.assign(path, { badge: PHARMA_TONES[path.tone].label, badgeTone: path.tone, faint: pharmaPathFaint(path) }));
    figure = pharmaBrainSvg(paths);
    rows = pharmaPathRows(paths, PHARMA_PATHWAY_COLORS);
    title = "Vias dopaminérgicas";
  }
  return `
    <div class="pharma-chips" role="group" aria-label="${escapeHtml(pharmaClass().label)}">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>${title} · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
        ${figure}
        <div class="pharma-paths">${rows}</div>
      </section>
      <section class="pharma-card">
        <h3>${antidepressant ? "Perfil de alvos" : "Perfil de receptores"}</h3>
        <div class="pharma-receptors">${pharmaReceptorRows(drug)}</div>
        <p class="pharma-extra">${escapeHtml(drug.extra)}</p>
        <h4>O que esperar</h4>
        <div class="pharma-effects">${pharmaEffectChips(drug)}</div>
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

function pharmaDrugSelect(name, selected) {
  return `<select data-pharma-compare="${name}" aria-label="${name === "a" ? "Primeiro remédio" : "Segundo remédio"}">
    ${pharmaClass().drugs.map((drug) => `<option value="${drug.id}" ${drug.id === selected ? "selected" : ""}>${escapeHtml(drug.name)}</option>`).join("")}
  </select>`;
}

function renderPharmaCompare() {
  const a = pharmaDrug(state.pharma.a);
  const b = pharmaDrug(state.pharma.b);
  const receptorRows = pharmaClass().receptors.map((receptor) => {
    const va = a.receptors[receptor.id] ?? 0;
    const vb = b.receptors[receptor.id] ?? 0;
    return `
      <div class="pharma-compare-row">
        <strong>${escapeHtml(receptor.label)}</strong>
        <div>
          <span class="pharma-bar a" role="img" aria-label="${escapeHtml(a.name)}: ${PHARMA_LEVELS[va]}"><i class="${pharmaIsPartial(a, receptor.id) ? "partial" : ""}" style="width:${Math.max(4, va * 25)}%"></i></span>
          <span class="pharma-bar b" role="img" aria-label="${escapeHtml(b.name)}: ${PHARMA_LEVELS[vb]}"><i class="${pharmaIsPartial(b, receptor.id) ? "partial" : ""}" style="width:${Math.max(4, vb * 25)}%"></i></span>
        </div>
      </div>`;
  }).join("");
  const effectRows = pharmaClass().effects.map((effect) => {
    const va = a.effects[effect.id] ?? 0;
    const vb = b.effects[effect.id] ?? 0;
    return `<tr><th scope="row">${escapeHtml(effect.label)}</th><td class="level-${va}">${PHARMA_EFFECT_LEVELS[va]}</td><td class="level-${vb}">${PHARMA_EFFECT_LEVELS[vb]}</td></tr>`;
  }).join("");
  const reasons = pharmaClass().effects
    .filter((effect) => Math.abs((a.effects[effect.id] ?? 0) - (b.effects[effect.id] ?? 0)) >= 2)
    .map((effect) => {
      const higher = (a.effects[effect.id] ?? 0) > (b.effects[effect.id] ?? 0) ? a : b;
      return `<li><strong>${escapeHtml(effect.label)}</strong> maior com ${escapeHtml(higher.name.toLowerCase())}: ${escapeHtml(effect.why)}.</li>`;
    });
  if (pharmaIsPartial(a, "D2") !== pharmaIsPartial(b, "D2")) {
    const partial = pharmaIsPartial(a, "D2") ? a : b;
    reasons.push(`<li><strong>${escapeHtml(partial.name)}</strong> é agonista parcial D2: poupa a prolactina e o parkinsonismo, mas pode causar acatisia.</li>`);
  }
  return `
    <div class="pharma-compare-pick">
      <label class="pharma-pick a"><i></i>${pharmaDrugSelect("a", a.id)}</label>
      <label class="pharma-pick b"><i></i>${pharmaDrugSelect("b", b.id)}</label>
    </div>
    ${a.id === b.id ? '<p class="panel-line">Escolha dois remédios diferentes para comparar.</p>' : ""}
    ${a.halfLife && b.halfLife ? `<p class="pharma-extra">Meia-vida: ${escapeHtml(a.name)} ${pharmaHalfLifeText(a)} · ${escapeHtml(b.name)} ${pharmaHalfLifeText(b)}</p>` : ""}
    ${a.day && b.day ? `<p class="pharma-extra">Duração: ${[a, b].map((item) => `${escapeHtml(item.name)} ${item.day.weeks ? `efeito em ${escapeHtml(item.day.weeks)}` : escapeHtml(item.day.duration)}`).join(" · ")}</p>` : ""}
    <div class="pharma-grid">
      <section class="pharma-card">
        <h3>${pharmaIsStabilizer() ? "Mecanismos" : pharmaIsAntidepressant() ? "Alvos" : "Receptores"}</h3>
        <div class="pharma-compare-legend"><span class="a">${escapeHtml(a.name)}</span><span class="b">${escapeHtml(b.name)}</span><span class="partial-key">listrado = agonista parcial</span></div>
        ${receptorRows}
      </section>
      <section class="pharma-card">
        <h3>Efeitos</h3>
        <table class="pharma-table">
          <thead><tr><th scope="col">Efeito</th><th scope="col">${escapeHtml(a.name)}</th><th scope="col">${escapeHtml(b.name)}</th></tr></thead>
          <tbody>${effectRows}</tbody>
        </table>
        ${reasons.length ? `<div class="pharma-why"><strong>Por quê?</strong><ul>${reasons.join("")}</ul></div>` : ""}
      </section>
    </div>`;
}

/* ---------- Sinapse: ocupação de D2 ---------- */

/* Faixas clássicas de ocupação de D2 para antagonistas (Kapur et al., 2000): resposta a partir de
   ~65%, prolactina acima de ~72%, extrapiramidais acima de ~78%. */
function pharmaOccupancyReading(drug, occupancy) {
  if (pharmaIsPartial(drug, "D2")) {
    return {
      tone: occupancy >= 80 ? "good" : "ok",
      title: occupancy >= 80 ? "Faixa clínica dos agonistas parciais (acima de ~80–90%)" : "Ocupação ainda baixa para um agonista parcial",
      text: "Mesmo ocupando quase todos os receptores, o agonista parcial mantém parte da ativação de D2. Por isso há pouco parkinsonismo e a prolactina não sobe; a acatisia pode aparecer.",
    };
  }
  const lowD2 = drug.receptors.D2 <= 1;
  const note = lowD2 ? " Na dose usual, este remédio ocupa menos D2 (muitas vezes abaixo de 60%) e se solta rápido do receptor: o efeito não depende só de D2." : "";
  if (occupancy < 65) return { tone: "low", title: "Abaixo de ~65%: pouco efeito antipsicótico", text: `Poucos receptores bloqueados para reduzir os sintomas positivos.${note}` };
  if (occupancy <= 72) return { tone: "good", title: "~65–72%: faixa terapêutica", text: `Bloqueio suficiente na via mesolímbica, ainda abaixo dos limiares de prolactina e extrapiramidais.${note}` };
  if (occupancy <= 78) return { tone: "warn", title: "~72–78%: terapêutico, prolactina subindo", text: `A via tuberoinfundibular já sente o bloqueio: risco de hiperprolactinemia.${note}` };
  return { tone: "high", title: "Acima de ~78%: risco de extrapiramidais", text: `O bloqueio na via nigroestriatal passa do limite: parkinsonismo, distonia, acatisia.${note}` };
}

const PHARMA_RECEPTOR_ORDER = [4, 1, 7, 2, 9, 0, 5, 8, 3, 6];

function pharmaSynapseSvg(drug, occupancy) {
  const partial = pharmaIsPartial(drug, "D2");
  const occupied = Math.round(occupancy / 10);
  const taken = new Set(PHARMA_RECEPTOR_ORDER.slice(0, occupied));
  const receptors = Array.from({ length: 10 }, (_, index) => {
    const x = 36 + index * 32;
    const blocked = taken.has(index);
    const receptor = `<path d="M${x - 9} 214 v-14 h5 v8 h8 v-8 h5 v14 z" class="syn-receptor ${blocked ? (partial ? "partial" : "blocked") : ""}"></path>`;
    const ligand = blocked
      ? `<rect x="${x - 7}" y="194" width="14" height="10" rx="5" class="syn-drug ${partial ? "partial" : ""}"></rect>`
      : index % 3 === 0
      ? `<circle cx="${x}" cy="200" r="4" class="syn-dopamine"></circle>`
      : "";
    return receptor + ligand;
  }).join("");
  const freeDopamine = [60, 98, 132, 170, 204, 238, 276, 300].map((x, index) => `<circle cx="${x}" cy="${150 + (index % 3) * 12}" r="4" class="syn-dopamine"></circle>`).join("");
  return `
    <svg class="pharma-synapse" viewBox="0 0 360 290" role="img" aria-label="Sinapse dopaminérgica com ${occupancy}% dos receptores D2 ocupados por ${escapeHtml(drug.name)}">
      <path d="M30 0 H330 V70 C330 116 280 128 180 128 C80 128 30 116 30 70 Z" class="syn-pre"></path>
      <circle cx="120" cy="52" r="17" class="syn-vesicle"></circle><circle cx="180" cy="40" r="17" class="syn-vesicle"></circle><circle cx="240" cy="54" r="17" class="syn-vesicle"></circle>
      <circle cx="114" cy="48" r="3.5" class="syn-dopamine"></circle><circle cx="125" cy="56" r="3.5" class="syn-dopamine"></circle><circle cx="174" cy="36" r="3.5" class="syn-dopamine"></circle><circle cx="186" cy="44" r="3.5" class="syn-dopamine"></circle><circle cx="236" cy="50" r="3.5" class="syn-dopamine"></circle><circle cx="246" cy="58" r="3.5" class="syn-dopamine"></circle>
      <text x="44" y="24" class="pharma-label small">Neurônio dopaminérgico</text>
      ${freeDopamine}
      <path d="M20 290 V226 C20 216 60 212 180 212 C300 212 340 216 340 226 V290 Z" class="syn-post"></path>
      ${receptors}
      <text x="180" y="262" text-anchor="middle" class="pharma-label small">Receptores D2 pós-sinápticos</text>
    </svg>`;
}

function renderPharmaSynapseView(drug) {
  if (drug.mech) return renderAdSynapseView(drug);
  const occupancy = state.pharma.occupancy;
  const reading = pharmaOccupancyReading(drug, occupancy);
  const partial = pharmaIsPartial(drug, "D2");
  return `
    <div class="pharma-synapse-wrap">${pharmaSynapseSvg(drug, occupancy)}</div>
    <div class="pharma-legend">
      <span><i class="dot"></i>dopamina</span>
      <span><i class="pill ${partial ? "partial" : ""}"></i>${escapeHtml(drug.name)}${partial ? " (agonista parcial)" : ""}</span>
      <span><i class="rec"></i>receptor D2</span>
    </div>
    <div class="pharma-reading tone-${reading.tone}">
      <strong>${occupancy}% de ocupação · ${escapeHtml(reading.title)}</strong>
      <span>${escapeHtml(reading.text)}</span>
    </div>`;
}

/* ---------- Sinapse dos antidepressivos ---------- */

const PHARMA_MECH_TEXT = {
  reuptake: { SERT: "Ocupação do transportador de serotonina (SERT)", NET: "Ocupação do transportador de noradrenalina (NET)" },
  alpha2: "Ocupação dos autorreceptores α2 (o freio)",
  mao: "Inibição da MAO",
  receptor: { "5HT2A": "Ocupação dos receptores 5-HT2A", "5HT2C": "Ocupação dos receptores 5-HT2C" },
};

function pharmaMechLabel(drug) {
  const mech = drug.mech;
  const entry = PHARMA_MECH_TEXT[mech.type];
  return typeof entry === "string" ? entry : entry[mech.target];
}

function pharmaTransmitterColors(drug) {
  const text = drug.mech.transmitter;
  const colors = [];
  if (text.includes("serotonina")) colors.push(PHARMA_SYSTEM_COLORS.serotonin);
  if (text.includes("noradrenalina")) colors.push(PHARMA_SYSTEM_COLORS.noradrenaline);
  if (text.includes("dopamina")) colors.push(PHARMA_SYSTEM_COLORS.dopamine);
  return colors.length ? colors : [PHARMA_SYSTEM_COLORS.serotonin];
}

/* Faixa de ocupação do SERT: ~80% nas doses mínimas eficazes dos ISRS (Meyer et al., 2004). */
function pharmaAdReading(drug, occupancy) {
  const mech = drug.mech;
  if (mech.type === "reuptake" && mech.target === "SERT") {
    const extra = drug.id === "vortioxetina" ? " Na vortioxetina, a ocupação vai de cerca de 50% (5 mg) a mais de 80% (20 mg)." : "";
    const lag = " A melhora leva semanas: depende da dessensibilização dos autorreceptores 5-HT1A.";
    if (occupancy < 60) return { tone: "low", title: "Abaixo de ~60%: pouco bloqueio do SERT", text: `Pouca serotonina extra na fenda.${extra}` };
    if (occupancy < 80) return { tone: "ok", title: "~60–80%: chegando à faixa das doses usuais", text: `Mais serotonina na fenda a cada transportador bloqueado.${extra}${lag}` };
    return { tone: "good", title: "~80% ou mais: faixa das doses usuais", text: `Nas doses mínimas eficazes dos ISRS o SERT já fica perto de 80% ocupado; subir a dose aumenta pouco a ocupação e mais os efeitos colaterais.${extra}${lag}` };
  }
  if (mech.type === "reuptake") {
    const extra = drug.id === "bupropiona" ? " Em estudos de PET, a bupropiona ocupa só cerca de 25% do DAT nas doses clínicas; parte do efeito vem do NET e dos metabólitos." : "";
    if (occupancy < 50) return { tone: "low", title: "Pouco bloqueio do NET", text: `Pouca noradrenalina extra.${extra}` };
    return { tone: "good", title: "NET bloqueado", text: `Sobra noradrenalina na fenda; no pré-frontal, onde quase não há DAT, sobra também dopamina.${extra}` };
  }
  if (mech.type === "alpha2") {
    if (occupancy < 50) return { tone: "low", title: "Freio α2 ainda ativo", text: "A noradrenalina liberada se liga ao α2 do próprio neurônio e freia a liberação." };
    return { tone: "good", title: "Freio α2 solto", text: "Sai mais noradrenalina e, pelos heterorreceptores α2 dos neurônios de serotonina, mais serotonina. O bloqueio de 5-HT2A, 5-HT2C e 5-HT3 poupa disfunção sexual e náusea; o de H1 explica sono e apetite." };
  }
  if (mech.type === "mao") {
    const kind = mech.irreversible
      ? "Inibição irreversível: a enzima só volta quando o neurônio fabrica nova (cerca de 2 semanas). Por isso a dieta sem tiramina e o intervalo para trocar de antidepressivo."
      : "Inibição reversível e só da MAO-A: a tiramina em excesso desloca o remédio, com menor risco de crise hipertensiva.";
    if (occupancy < 80) return { tone: "ok", title: "MAO parcialmente inibida", text: `Parte das monoaminas ainda é degradada dentro do neurônio. ${kind}` };
    return { tone: "good", title: "MAO inibida", text: `Sobram serotonina, noradrenalina e dopamina dentro do neurônio para serem liberadas. ${kind}` };
  }
  if (drug.id === "agomelatina") {
    return { tone: occupancy >= 50 ? "good" : "low", title: occupancy >= 50 ? "5-HT2C bloqueado" : "Pouco bloqueio de 5-HT2C", text: "O bloqueio de 5-HT2C libera noradrenalina e dopamina no pré-frontal; o agonismo MT1/MT2 ajuda a ressincronizar o ritmo circadiano. Não aumenta a serotonina." };
  }
  return { tone: occupancy >= 50 ? "good" : "low", title: occupancy >= 50 ? "5-HT2A bloqueado" : "Pouco bloqueio de 5-HT2A", text: "O bloqueio de 5-HT2A melhora o sono e evita a disfunção sexual do excesso de serotonina. Em dose baixa, com H1 e α1, age como hipnótico; em dose antidepressiva, soma o bloqueio do SERT." };
}

function pharmaAdSynapseSvg(drug, occupancy) {
  const mech = drug.mech;
  const blocked = new Set(PHARMA_RECEPTOR_ORDER.slice(0, Math.round(occupancy / 10)));
  const colors = pharmaTransmitterColors(drug);
  const xs = Array.from({ length: 10 }, (_, index) => 50 + index * 29);
  let targets = "";
  if (mech.type === "reuptake" || mech.type === "alpha2") {
    targets = xs.map((x, index) => {
      const icon = mech.type === "reuptake"
        ? `<rect x="${x - 7}" y="112" width="14" height="16" rx="4" class="syn-transporter"></rect><rect x="${x - 1.5}" y="112" width="3" height="16" class="syn-channel"></rect>`
        : `<path d="M${x - 8} 112 v12 h5 v-6 h6 v6 h5 v-12 z" class="syn-autoreceptor"></path>`;
      return icon + (blocked.has(index) ? `<rect x="${x - 7}" y="128" width="14" height="9" rx="4.5" class="syn-drug"></rect>` : "");
    }).join("");
  } else if (mech.type === "mao") {
    targets = xs.map((x, index) => {
      const y = index % 2 ? 92 : 80;
      return `<path d="M${x + 6} ${y - 4} A7 7 0 1 0 ${x + 6} ${y + 4} L${x} ${y} Z" class="syn-mao ${blocked.has(index) ? "inhibited" : ""}"></path>${blocked.has(index) ? `<rect x="${x - 2}" y="${y - 4}" width="12" height="8" rx="4" class="syn-drug"></rect>` : ""}`;
    }).join("");
  } else {
    targets = xs.map((x, index) => `<path d="M${x - 9} 214 v-14 h5 v8 h8 v-8 h5 v14 z" class="syn-receptor ${blocked.has(index) ? "blocked" : ""}"></path>${blocked.has(index) ? `<rect x="${x - 7}" y="194" width="14" height="10" rx="5" class="syn-drug"></rect>` : ""}`).join("");
  }
  const rising = mech.type === "receptor" ? 5 : 3 + Math.round((occupancy / 100) * 9);
  const dots = Array.from({ length: rising }, (_, index) => {
    const x = 52 + ((index * 73) % 256);
    const y = 148 + ((index * 17) % 40);
    return `<circle cx="${x}" cy="${y}" r="4" fill="${colors[index % colors.length]}"></circle>`;
  }).join("");
  const postReceptors = mech.type === "receptor" ? "" : xs.map((x) => `<path d="M${x - 9} 214 v-14 h5 v8 h8 v-8 h5 v14 z" class="syn-receptor"></path>`).join("");
  return `
    <svg class="pharma-synapse" viewBox="0 0 360 290" role="img" aria-label="Sinapse com ${escapeHtml(pharmaMechLabel(drug).toLowerCase())} em ${occupancy}%">
      <path d="M30 0 H330 V70 C330 116 280 128 180 128 C80 128 30 116 30 70 Z" class="syn-pre"></path>
      ${mech.type === "mao" ? "" : '<circle cx="120" cy="52" r="15" class="syn-vesicle"></circle><circle cx="180" cy="40" r="15" class="syn-vesicle"></circle><circle cx="240" cy="54" r="15" class="syn-vesicle"></circle>'}
      <text x="44" y="22" class="pharma-label small">Neurônio pré-sináptico</text>
      ${targets}
      ${dots}
      <path d="M20 290 V226 C20 216 60 212 180 212 C300 212 340 216 340 226 V290 Z" class="syn-post"></path>
      ${postReceptors}
      <text x="180" y="262" text-anchor="middle" class="pharma-label small">Neurônio pós-sináptico</text>
    </svg>`;
}

function renderAdSynapseView(drug) {
  const occupancy = state.pharma.occupancy;
  const reading = pharmaAdReading(drug, occupancy);
  const mech = drug.mech;
  const targetLegend = { reuptake: '<i class="tr"></i>transportador', alpha2: '<i class="rec"></i>autorreceptor α2', mao: '<i class="mao"></i>MAO', receptor: '<i class="rec"></i>receptor' }[mech.type];
  return `
    <div class="pharma-synapse-wrap">${pharmaAdSynapseSvg(drug, occupancy)}</div>
    <div class="pharma-legend">
      ${pharmaTransmitterColors(drug).map((color) => `<span><i class="dot" style="background:${color}"></i>${color === PHARMA_SYSTEM_COLORS.serotonin ? "serotonina" : color === PHARMA_SYSTEM_COLORS.noradrenaline ? "noradrenalina" : "dopamina"}</span>`).join("")}
      <span><i class="pill"></i>${escapeHtml(drug.name)}</span>
      <span>${targetLegend}</span>
    </div>
    <div class="pharma-reading tone-${reading.tone}">
      <strong>${occupancy}% · ${escapeHtml(reading.title)}</strong>
      <span>${escapeHtml(reading.text)}</span>
    </div>`;
}

function renderAdSynapse(drug) {
  const mech = drug.mech;
  const sert = mech.type === "reuptake" && mech.target === "SERT";
  return `
    <div class="pharma-chips" role="group" aria-label="Antidepressivos">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Sinapse · ${escapeHtml(drug.name)}</h3><span>${escapeHtml(pharmaDrugGroup(drug))}</span></div>
        <div id="pharmaSynapseView">${renderAdSynapseView(drug)}</div>
      </section>
      <section class="pharma-card">
        <h3>${escapeHtml(pharmaMechLabel(drug))}</h3>
        <label class="pharma-slider-label" for="pharmaOccupancy">Arraste para simular uma dose maior ou menor</label>
        <input id="pharmaOccupancy" class="pharma-slider" type="range" min="0" max="100" step="1" value="${state.pharma.occupancy}" data-pharma-occupancy>
        ${sert ? '<div class="pharma-zones"><span class="z-low" style="flex:60">pouco efeito</span><span class="z-warn" style="flex:20">60–80</span><span class="z-good" style="flex:20">doses usuais</span></div>' : ""}
        <p class="pharma-extra">Cada alvo desenhado vale 10%. Neurotransmissor que sobra na fenda: ${escapeHtml(mech.transmitter)}.</p>
        ${sert ? '<p class="pharma-extra">Ocupação do SERT nas doses usuais conforme estudos de PET (Meyer et al., 2004); valores aproximados.</p>' : ""}
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

function renderPharmaSynapse() {
  const drug = pharmaDrug(state.pharma.drug);
  if (pharmaIsStabilizer()) return renderStabilizerLevel(drug);
  if (pharmaIsAnxiolytic()) return renderAnxKinetics(drug);
  if (pharmaIsStimulant()) return renderStimDay(drug);
  if (drug.mech) return renderAdSynapse(drug);
  const partial = pharmaIsPartial(drug, "D2");
  return `
    <div class="pharma-chips" role="group" aria-label="Antipsicótico">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Sinapse dopaminérgica · ${escapeHtml(drug.name)}</h3><span>${partial ? "agonista parcial D2" : "antagonista D2"}</span></div>
        <div id="pharmaSynapseView">${renderPharmaSynapseView(drug)}</div>
      </section>
      <section class="pharma-card">
        <h3>Ocupação de D2</h3>
        <label class="pharma-slider-label" for="pharmaOccupancy">Arraste para simular uma dose maior ou menor</label>
        <input id="pharmaOccupancy" class="pharma-slider" type="range" min="0" max="100" step="1" value="${state.pharma.occupancy}" data-pharma-occupancy>
        ${partial
          ? '<div class="pharma-zones partial"><span style="flex:80">ocupação baixa</span><span style="flex:20">faixa clínica</span></div>'
          : '<div class="pharma-zones"><span class="z-low" style="flex:65">pouco efeito</span><span class="z-good" style="flex:7">65–72</span><span class="z-warn" style="flex:6">prol.</span><span class="z-high" style="flex:22">extrapiramidais</span></div>'}
        <p class="pharma-extra">Cada receptor desenhado vale 10%. A dopamina compete com o remédio pelos receptores que sobram livres.</p>
        <p class="pharma-extra">Limiares de ocupação conforme Kapur et al. (2000), estudo clássico com haloperidol e risperidona; valores aproximados.</p>
        ${pharmaStudyLink(drug)}
      </section>
    </div>`;
}

/* ---------- Treino ---------- */

function pharmaShuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pharmaProfileDistance(a, b) {
  const receptors = pharmaClass().receptors.map((receptor) => receptor.id);
  const levels = receptors.reduce((sum, id) => sum + Math.abs((a.receptors[id] ?? 0) - (b.receptors[id] ?? 0)), 0);
  return levels + (pharmaIsPartial(a, "D2") !== pharmaIsPartial(b, "D2") ? 3 : 0);
}

function pharmaProfileQuestion(drugs) {
  const correct = drugs[Math.floor(Math.random() * drugs.length)];
  const others = pharmaShuffle(drugs.filter((drug) => drug.id !== correct.id && pharmaProfileDistance(drug, correct) >= 3)).slice(0, 3);
  if (others.length < 3) return null;
  return { type: "profile", correct: correct.id, options: pharmaShuffle([correct, ...others]).map((drug) => drug.id) };
}

function pharmaEffectQuestion(drugs) {
  const effect = pharmaClass().effects[Math.floor(Math.random() * pharmaClass().effects.length)];
  const level = (drug) => drug.effects[effect.id] ?? 0;
  const top = pharmaShuffle(drugs.filter((drug) => level(drug) >= 2));
  for (const correct of top) {
    const others = pharmaShuffle(drugs.filter((drug) => level(drug) <= level(correct) - 2)).slice(0, 3);
    if (others.length === 3) return { type: "effect", effect: effect.id, correct: correct.id, options: pharmaShuffle([correct, ...others]).map((drug) => drug.id) };
  }
  return null;
}

/* "Nível de lítio de 1,8 mmol/L: em que faixa está?" (só para remédios com faixa de nível). */
function pharmaLevelQuestion(drugs) {
  const withLevel = drugs.filter((drug) => drug.level);
  if (!withLevel.length) return null;
  const drug = withLevel[Math.floor(Math.random() * withLevel.length)];
  const zones = drug.level.zones;
  const index = Math.floor(Math.random() * zones.length);
  const from = index ? zones[index - 1].to : drug.level.min;
  const to = Math.min(zones[index].to, drug.level.max);
  const value = pharmaFormatLevel(from + (to - from) / 2, drug.level);
  const others = pharmaShuffle(zones.map((_, i) => i).filter((i) => i !== index)).slice(0, 3);
  const labels = Object.fromEntries(zones.map((zone, i) => [`z${i}`, zone.label]));
  return { type: "level", drug: drug.id, value, correct: `z${index}`, options: pharmaShuffle([index, ...others]).map((i) => `z${i}`), labels };
}

/* "Qual destes tem a meia-vida mais longa/curta?" só com faixas de meia-vida que não se sobrepõem,
   para não haver resposta ambígua. */
function pharmaHalfLifeQuestion(drugs) {
  const pool = [];
  const apart = (a, b) => a.halfLife[1] < b.halfLife[0] || b.halfLife[1] < a.halfLife[0];
  for (const drug of pharmaShuffle(drugs.filter((item) => item.halfLife))) {
    if (pool.every((item) => apart(item, drug))) pool.push(drug);
    if (pool.length === 4) break;
  }
  if (pool.length < 4) return null;
  const longest = Math.random() < 0.5;
  const sorted = [...pool].sort((a, b) => pharmaHalfLifeMid(a) - pharmaHalfLifeMid(b));
  const correct = longest ? sorted[3] : sorted[0];
  return { type: "halflife", longest, correct: correct.id, options: pool.map((drug) => drug.id) };
}

/* "Quantos mg de X equivalem a 10 mg de diazepam?" (tabela de equivalência). */
function pharmaEquivalenceQuestion(drugs) {
  const withEq = drugs.filter((drug) => drug.eq && drug.id !== "diazepam");
  if (!withEq.length) return null;
  const drug = withEq[Math.floor(Math.random() * withEq.length)];
  const values = [...new Set(drugs.filter((item) => item.eq).map((item) => item.eq))];
  const others = pharmaShuffle(values.filter((value) => value !== drug.eq)).slice(0, 3);
  if (others.length < 3) return null;
  const labels = Object.fromEntries(values.map((value) => [`q${value}`, `${String(value).replace(".", ",")} mg`]));
  return { type: "equivalence", drug: drug.id, correct: `q${drug.eq}`, options: pharmaShuffle([drug.eq, ...others]).map((value) => `q${value}`), labels };
}

function newPharmaQuiz() {
  const drugs = pharmaClass().drugs;
  const stabilizer = pharmaIsStabilizer();
  const anxiolytic = pharmaIsAnxiolytic();
  const stimulant = pharmaIsStimulant();
  const questions = [];
  let guard = 0;
  while (questions.length < 10 && guard < 300) {
    guard += 1;
    const roll = Math.random();
    const question = stabilizer && roll < 0.4
      ? pharmaLevelQuestion(drugs)
      : stimulant && roll < 0.2
      ? pharmaDurationQuestion(drugs)
      : stimulant && roll < 0.35
      ? pharmaWeeksQuestion(drugs)
      : anxiolytic && roll < 0.25
      ? pharmaHalfLifeQuestion(drugs)
      : anxiolytic && roll < 0.45
      ? pharmaEquivalenceQuestion(drugs)
      : roll < 0.75 ? pharmaEffectQuestion(drugs) : pharmaProfileQuestion(drugs);
    if (!question) continue;
    const key = `${question.type}|${question.drug || ""}|${question.correct}|${question.effect || ""}`;
    if (questions.some((item) => `${item.type}|${item.drug || ""}|${item.correct}|${item.effect || ""}` === key)) continue;
    questions.push(question);
  }
  return { questions, index: 0, answers: [] };
}

function pharmaAdCues(drug) {
  const r = drug.receptors;
  const cues = [];
  if (r.MAO >= 3) cues.push("inibe a MAO, sem agir em transportadores");
  if (r.A2 >= 3) cues.push("bloqueia α2 sem bloquear a recaptação");
  if (drug.group === "ISRS") cues.push("SERT forte e quase só ele: ISRS");
  else if (drug.group === "IRSN") cues.push("SERT e NET, sem receptores; o NET pesa mais conforme a dose: IRSN");
  else if (drug.group === "Tricíclico") cues.push("transportadores mais muitos receptores: tricíclico");
  if (r.NET >= 2 && r.DAT >= 2 && r.SERT === 0) cues.push("NET e DAT, sem SERT");
  if (r["5HT2A"] >= 4) cues.push("5-HT2A muito forte");
  if (r.H1 >= 3) cues.push("H1 forte (sedação, peso)");
  if (r.M1 >= 3) cues.push("M1 forte (anticolinérgico)");
  if (r.A1 >= 3) cues.push("α1 forte (hipotensão)");
  return `${cues.length ? `Pistas: ${cues.join("; ")}. ` : ""}${drug.extra}`;
}

function pharmaStabilizerCues(drug) {
  const r = drug.receptors;
  const cues = [];
  if (r.INTRA >= 4) cues.push("age sobretudo dentro da célula (inositol, GSK-3): lítio");
  if (r.GABA >= 3) cues.push("aumenta o GABA");
  if (r.NA >= 4) cues.push("bloqueio forte de canais de sódio");
  if (r.GLU >= 3) cues.push("reduz bem a liberação de glutamato");
  if (r.CA >= 2) cues.push("também bloqueia canais de cálcio");
  return `${cues.length ? `Pistas: ${cues.join("; ")}. ` : ""}${drug.extra}`;
}

function pharmaAnxCues(drug) {
  const r = drug.receptors;
  const cues = [];
  if (r.A1 >= 3 && r.A23 >= 3 && r.A5 >= 3) cues.push("GABA-A com α1, α2/α3 e α5 por igual: benzodiazepínico");
  else if (r.A1 >= 3 && r.A23 <= 2) cues.push("preferência por GABA-A com α1: Z-drug (hipnótico)");
  if (r.A2D >= 3) cues.push("α2δ dos canais de cálcio: gabapentinoide");
  if (r.HT1A >= 3) cues.push("agonista parcial 5-HT1A, fora do GABA-A");
  return `${cues.length ? `Pistas: ${cues.join("; ")}. ` : ""}${drug.extra}`;
}

function pharmaProfileExplanation(drug) {
  if (pharmaIsStabilizer()) return pharmaStabilizerCues(drug);
  if (pharmaIsAnxiolytic()) return pharmaAnxCues(drug);
  if (pharmaIsStimulant()) return pharmaStimCues(drug);
  if (drug.mech) return pharmaAdCues(drug);
  const r = drug.receptors;
  const cues = [];
  if (pharmaIsPartial(drug, "D2")) cues.push("D2 como agonista parcial (barra listrada)");
  else if (r.D2 >= 4 && r["5HT2A"] <= 1) cues.push("D2 muito forte com pouco 5-HT2A: perfil de primeira geração de alta potência");
  else if (r.D2 <= 1) cues.push("D2 fraco");
  else if (r["5HT2A"] >= r.D2) cues.push("5-HT2A igual ou maior que D2: perfil atípico");
  if (r.H1 >= 3) cues.push("H1 forte (sedação, peso)");
  if (r.M1 >= 3) cues.push("M1 forte (anticolinérgico)");
  if (r.A1 >= 3) cues.push("α1 forte (hipotensão)");
  if (r.H1 === 0 && r.M1 === 0 && !pharmaIsPartial(drug, "D2")) cues.push("quase sem H1 e M1");
  return `${cues.length ? `Pistas: ${cues.join("; ")}. ` : ""}${drug.extra}`;
}

function renderPharmaQuiz() {
  if (!state.pharmaQuiz || !state.pharmaQuiz.questions.length) state.pharmaQuiz = newPharmaQuiz();
  const quiz = state.pharmaQuiz;
  const total = quiz.questions.length;
  if (quiz.index >= total) {
    const right = quiz.answers.filter((answer, index) => answer === quiz.questions[index].correct).length;
    const missed = [...new Set(quiz.questions.filter((question, index) => quiz.answers[index] !== question.correct).map((question) => question.drug || question.correct))];
    return `
      <section class="pharma-card pharma-quiz-end">
        <h3>Rodada concluída: ${right} de ${total}</h3>
        ${missed.length ? `<p class="pharma-extra">Vale rever: ${missed.map((id) => `<button type="button" class="link-btn" data-pharma-review="${id}">${escapeHtml(pharmaDrug(id).name)}</button>`).join(" · ")}</p>` : '<p class="pharma-extra">Acertou tudo.</p>'}
        <button type="button" class="primary-btn" data-pharma-quiz="restart">Nova rodada</button>
      </section>`;
  }
  const question = quiz.questions[quiz.index];
  const answered = quiz.answers[quiz.index];
  const label = (id) => (question.labels ? question.labels[id] : pharmaDrug(id).name);
  const correct = question.drug ? pharmaDrug(question.drug) : pharmaDrug(question.correct);
  const effect = question.effect ? pharmaClass().effects.find((item) => item.id === question.effect) : null;
  const profilePrompt = pharmaIsStabilizer()
    ? "Este perfil de mecanismos é de qual estabilizador?"
    : pharmaIsAnxiolytic() || pharmaIsStimulant() ? "Este perfil de alvos é de qual remédio?"
    : pharmaIsAntidepressant() ? "Este perfil de alvos é de qual antidepressivo?" : "Este perfil de receptores é de qual antipsicótico?";
  const prompt = question.type === "profile"
    ? profilePrompt
    : question.type === "level"
    ? `Nível de ${correct.name.toLowerCase()} de ${question.value} ${correct.level.unit}: em que faixa está?`
    : question.type === "halflife"
    ? `Qual destes tem a meia-vida mais ${question.longest ? "longa" : "curta"}?`
    : question.type === "equivalence"
    ? `Quantos mg de ${correct.name.toLowerCase()} equivalem a cerca de 10 mg de diazepam?`
    : question.type === "duration"
    ? `Com uma dose às 7h, qual destes cobre ${question.longest ? "mais" : "menos"} horas do dia?`
    : question.type === "weeks"
    ? "Qual destes leva semanas para fazer efeito?"
    : `Qual destes tem o maior risco de ${effect.label.toLowerCase()}?`;
  const options = question.options.map((id) => {
    const state_ = answered ? (id === question.correct ? "right" : id === answered ? "wrong" : "") : "";
    return `<button type="button" class="pharma-option ${state_}" data-pharma-answer="${id}" ${answered ? "disabled" : ""}>${escapeHtml(label(id))}${state_ === "right" ? " ✓" : state_ === "wrong" ? " ✗" : ""}</button>`;
  }).join("");
  const explanation = !answered
    ? ""
    : question.type === "profile"
    ? pharmaProfileExplanation(correct)
    : question.type === "level"
    ? correct.level.zones[Number(question.correct.slice(1))].text
    : question.type === "halflife"
    ? `${question.options.map((id) => `${pharmaDrug(id).name}: ${pharmaHalfLifeText(pharmaDrug(id))}`).join("; ")}.`
    : question.type === "equivalence"
    ? `Tabela aproximada: ${pharmaClass().drugs.filter((item) => item.eq).map((item) => `${item.name} ${String(item.eq).replace(".", ",")} mg`).join(" · ")}.`
    : question.type === "duration"
    ? `Duração (Maudsley, tabela 5.10): ${question.options.map((id) => `${pharmaDrug(id).name} ${pharmaDrug(id).day.duration}`).join("; ")}.`
    : question.type === "weeks"
    ? `${correct.name}: efeito em ${correct.day.weeks}. Os estimulantes agem no mesmo dia, em minutos a horas.`
    : `${correct.name}: ${effect.label.toLowerCase()} ${PHARMA_EFFECT_LEVELS[correct.effects[effect.id]]}. Por quê: ${effect.why}. ${question.options.filter((id) => id !== correct.id).map((id) => `${pharmaDrug(id).name}: ${PHARMA_EFFECT_LEVELS[pharmaDrug(id).effects[effect.id]]}`).join("; ")}.`;
  const correctLabel = label(question.correct);
  return `
    <section class="pharma-card pharma-quiz">
      <div class="pharma-quiz-top"><strong>Pergunta ${quiz.index + 1} de ${total}</strong><span>${quiz.answers.filter((answer, index) => answer === quiz.questions[index].correct).length} acertos</span></div>
      <div class="pharma-quiz-bar"><i style="width:${(quiz.index / total) * 100}%"></i></div>
      <h3>${escapeHtml(prompt)}</h3>
      ${question.type === "profile" ? `<div class="pharma-receptors">${pharmaReceptorRows(correct)}</div>` : ""}
      <div class="pharma-options">${options}</div>
      ${answered ? `
        <div class="pharma-feedback ${answered === question.correct ? "right" : "wrong"}">
          <strong>${answered === question.correct ? `Isso! ${escapeHtml(correctLabel)}.` : `Era: ${escapeHtml(correctLabel)}.`}</strong>
          <span>${escapeHtml(explanation)}</span>
        </div>
        <button type="button" class="primary-btn" data-pharma-quiz="next">${quiz.index + 1 === total ? "Ver resultado" : "Próxima"}</button>` : ""}
    </section>`;
}

function renderPharmaPanel() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel || !window.PHARMA_SIM) return;
  const mode = ["paths", "compare", "synapse", "quiz"].includes(state.pharma.mode) ? state.pharma.mode : "paths";
  const modeButton = (id, label) => `<button type="button" data-pharma-mode="${id}" class="${mode === id ? "active" : ""}" aria-pressed="${mode === id}">${label}</button>`;
  const body = mode === "compare" ? renderPharmaCompare() : mode === "synapse" ? renderPharmaSynapse() : mode === "quiz" ? renderPharmaQuiz() : renderPharmaPaths();
  const cls = pharmaClass();
  const classButtons = Object.values(window.PHARMA_SIM).map((item) => `<button type="button" data-pharma-class="${item.id}" class="${item.id === cls.id ? "active" : ""}" aria-pressed="${item.id === cls.id}">${escapeHtml(item.label)}</button>`).join("");
  const html = `
    <header class="pharma-head">
      <div>
        <h2>Simulador de psicofarmacologia</h2>
        <p>${escapeHtml(cls.tagline)}</p>
      </div>
      <div class="pharma-switches">
        <div class="segmented pharma-classes" role="group" aria-label="Classe">${classButtons}</div>
        <div class="segmented pharma-modes" role="group" aria-label="Modo">
          ${modeButton("paths", pharmaIsStabilizer() ? "Mecanismos e fases" : pharmaIsAnxiolytic() || pharmaIsStimulant() ? "Mecanismos e usos" : pharmaIsAntidepressant() ? "Sistemas e alvos" : "Vias e receptores")}${modeButton("compare", "Comparar")}${modeButton("synapse", pharmaIsStabilizer() ? "Nível e interações" : pharmaIsAnxiolytic() ? "Meia-vida e retirada" : pharmaIsStimulant() ? "Ao longo do dia" : "Sinapse")}${modeButton("quiz", "Treino")}
        </div>
      </div>
    </header>
    ${body}
    <p class="pharma-disclaimer">Material didático e simplificado, para estudo. ${escapeHtml(cls.source)} Não usar para prescrição.</p>`;
  if (panel.dataset.renderedHtml !== html) {
    panel.innerHTML = html;
    panel.dataset.renderedHtml = html;
  }
}

function openPharmaStudy(drug) {
  setTab("activity", { fromNav: true });
  const input = document.querySelector("#questionSearchInput");
  if (!input) return;
  input.value = drug.search[0];
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.scrollIntoView({ behavior: "smooth", block: "center" });
}

(function setupPharmaSim() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-pharma-drug], [data-pharma-class], [data-pharma-mode], [data-pharma-study], [data-pharma-answer], [data-pharma-quiz], [data-pharma-review], [data-pharma-inter], [data-pharma-stop], [data-pharma-repeat]");
    if (!target) return;
    const data = target.dataset;
    if (data.pharmaStop !== undefined) state.pharma.stopped = !state.pharma.stopped;
    else if (data.pharmaRepeat !== undefined) state.pharma.repeat = !state.pharma.repeat;
    else if (data.pharmaDrug) {
      state.pharma.drug = data.pharmaDrug;
      /* Ao trocar de remédio na sinapse, começa numa ocupação típica dele. */
      state.pharma.occupancy = pharmaDefaultOccupancy(pharmaDrug(data.pharmaDrug));
      resetPharmaLevel(pharmaDrug(data.pharmaDrug));
    } else if (data.pharmaInter) {
      const list = state.pharma.inter || [];
      state.pharma.inter = list.includes(data.pharmaInter) ? list.filter((id) => id !== data.pharmaInter) : [...list, data.pharmaInter];
    } else if (data.pharmaClass) setPharmaClass(data.pharmaClass);
    else if (data.pharmaMode) state.pharma.mode = data.pharmaMode;
    else if (data.pharmaStudy) {
      openPharmaStudy(pharmaDrug(data.pharmaStudy));
      return;
    } else if (data.pharmaAnswer) {
      const quiz = state.pharmaQuiz;
      if (quiz && quiz.answers[quiz.index] === undefined) quiz.answers[quiz.index] = data.pharmaAnswer;
    } else if (data.pharmaQuiz === "next") state.pharmaQuiz.index += 1;
    else if (data.pharmaQuiz === "restart") state.pharmaQuiz = newPharmaQuiz();
    else if (data.pharmaReview) {
      state.pharma.drug = data.pharmaReview;
      state.pharma.mode = "paths";
    }
    savePharmaState();
    renderPharmaPanel();
    if (data.pharmaQuiz || data.pharmaReview) panel.scrollIntoView({ block: "start" });
  });
  /* O controle de ocupação atualiza só o desenho da sinapse, para não interromper o arraste. */
  panel.addEventListener("input", (event) => {
    if (event.target.matches("[data-pharma-dose]")) {
      state.pharma.doseTime = Number(event.target.value);
      const view = panel.querySelector("#pharmaDayView");
      if (view) view.innerHTML = renderStimDayView(pharmaDrug(state.pharma.drug));
      const label = panel.querySelector("[data-pharma-dose-label]");
      if (label) label.textContent = pharmaClock(state.pharma.doseTime);
      panel.dataset.renderedHtml = "";
      savePharmaState();
      return;
    }
    if (event.target.matches("[data-pharma-days]")) {
      state.pharma.days = Number(event.target.value);
      const view = panel.querySelector("#pharmaKineticsView");
      if (view) view.innerHTML = renderAnxKineticsView(pharmaDrug(state.pharma.drug));
      const label = panel.querySelector("[data-pharma-days-label]");
      if (label) label.textContent = state.pharma.days;
      panel.dataset.renderedHtml = "";
      savePharmaState();
      return;
    }
    if (event.target.matches('[data-pharma-eq="dose"]')) {
      state.pharma.eqDose = Number(String(event.target.value).replace(",", "."));
      const view = panel.querySelector("#pharmaEqResult");
      if (view) view.innerHTML = renderAnxEquivalenceResult(pharmaDrug(state.pharma.drug));
      panel.dataset.renderedHtml = "";
      savePharmaState();
      return;
    }
    if (event.target.matches("[data-pharma-level]")) {
      state.pharma.level = Number(event.target.value);
      const view = panel.querySelector("#pharmaLevelView");
      if (view) view.innerHTML = renderStabilizerLevelView(pharmaDrug(state.pharma.drug));
      panel.dataset.renderedHtml = "";
      savePharmaState();
      return;
    }
    if (!event.target.matches("[data-pharma-occupancy]")) return;
    state.pharma.occupancy = Number(event.target.value);
    const view = panel.querySelector("#pharmaSynapseView");
    if (view) view.innerHTML = renderPharmaSynapseView(pharmaDrug(state.pharma.drug));
    panel.dataset.renderedHtml = "";
    savePharmaState();
  });
  panel.addEventListener("change", (event) => {
    if (event.target.matches('[data-pharma-eq="drug"]')) {
      state.pharma.eqDrug = event.target.value;
      state.pharma.eqDose = pharmaDrug(event.target.value).eq;
      savePharmaState();
      renderPharmaPanel();
      return;
    }
    const which = event.target.dataset?.pharmaCompare;
    if (!which) return;
    state.pharma[which] = event.target.value;
    savePharmaState();
    renderPharmaPanel();
  });

  const baseRender = render;
  render = function renderWithPharma(...args) {
    const result = baseRender.apply(this, args);
    if (state.activeTab === "pharma") renderPharmaPanel();
    return result;
  };
})();
