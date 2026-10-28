/* Simulador de psicofarmacologia (aba "Simulador"). Dados por classe em data/pharmaSim.js
   (antipsicóticos) e data/pharmaSimAntidepressants.js. Nos antidepressivos, a primeira tela mostra
   os sistemas de serotonina, noradrenalina e dopamina, e a sinapse mostra o mecanismo de cada
   remédio (recaptação, freio α2, MAO ou receptor).
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
  state.pharmaQuiz = null;
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
        <small>${PHARMA_LEVELS[value]}${partial ? " · agonista parcial" : ""}</small>
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
    <div class="pharma-grid">
      <section class="pharma-card">
        <h3>${pharmaIsAntidepressant() ? "Alvos" : "Receptores"}</h3>
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

function newPharmaQuiz() {
  const drugs = pharmaClass().drugs;
  const questions = [];
  let guard = 0;
  while (questions.length < 10 && guard < 200) {
    guard += 1;
    const question = Math.random() < 0.5 ? pharmaProfileQuestion(drugs) : pharmaEffectQuestion(drugs);
    if (!question) continue;
    const key = `${question.type}|${question.correct}|${question.effect || ""}`;
    if (questions.some((item) => `${item.type}|${item.correct}|${item.effect || ""}` === key)) continue;
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

function pharmaProfileExplanation(drug) {
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
    const missed = [...new Set(quiz.questions.filter((question, index) => quiz.answers[index] !== question.correct).map((question) => question.correct))];
    return `
      <section class="pharma-card pharma-quiz-end">
        <h3>Rodada concluída: ${right} de ${total}</h3>
        ${missed.length ? `<p class="pharma-extra">Vale rever: ${missed.map((id) => `<button type="button" class="link-btn" data-pharma-review="${id}">${escapeHtml(pharmaDrug(id).name)}</button>`).join(" · ")}</p>` : '<p class="pharma-extra">Acertou tudo.</p>'}
        <button type="button" class="primary-btn" data-pharma-quiz="restart">Nova rodada</button>
      </section>`;
  }
  const question = quiz.questions[quiz.index];
  const answered = quiz.answers[quiz.index];
  const correct = pharmaDrug(question.correct);
  const effect = question.effect ? pharmaClass().effects.find((item) => item.id === question.effect) : null;
  const prompt = question.type === "profile"
    ? pharmaIsAntidepressant() ? "Este perfil de alvos é de qual antidepressivo?" : "Este perfil de receptores é de qual antipsicótico?"
    : `Qual destes tem o maior risco de ${effect.label.toLowerCase()}?`;
  const options = question.options.map((id) => {
    const drug = pharmaDrug(id);
    const state_ = answered ? (id === question.correct ? "right" : id === answered ? "wrong" : "") : "";
    return `<button type="button" class="pharma-option ${state_}" data-pharma-answer="${id}" ${answered ? "disabled" : ""}>${escapeHtml(drug.name)}${state_ === "right" ? " ✓" : state_ === "wrong" ? " ✗" : ""}</button>`;
  }).join("");
  const explanation = !answered
    ? ""
    : question.type === "profile"
    ? pharmaProfileExplanation(correct)
    : `${correct.name}: ${effect.label.toLowerCase()} ${PHARMA_EFFECT_LEVELS[correct.effects[effect.id]]}, por ${effect.why}. ${question.options.filter((id) => id !== correct.id).map((id) => `${pharmaDrug(id).name}: ${PHARMA_EFFECT_LEVELS[pharmaDrug(id).effects[effect.id]]}`).join("; ")}.`;
  return `
    <section class="pharma-card pharma-quiz">
      <div class="pharma-quiz-top"><strong>Pergunta ${quiz.index + 1} de ${total}</strong><span>${quiz.answers.filter((answer, index) => answer === quiz.questions[index].correct).length} acertos</span></div>
      <div class="pharma-quiz-bar"><i style="width:${(quiz.index / total) * 100}%"></i></div>
      <h3>${escapeHtml(prompt)}</h3>
      ${question.type === "profile" ? `<div class="pharma-receptors">${pharmaReceptorRows(correct)}</div>` : ""}
      <div class="pharma-options">${options}</div>
      ${answered ? `
        <div class="pharma-feedback ${answered === question.correct ? "right" : "wrong"}">
          <strong>${answered === question.correct ? `Isso! ${escapeHtml(correct.name)}.` : `Era ${escapeHtml(correct.name)}.`}</strong>
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
          ${modeButton("paths", pharmaIsAntidepressant() ? "Sistemas e alvos" : "Vias e receptores")}${modeButton("compare", "Comparar")}${modeButton("synapse", "Sinapse")}${modeButton("quiz", "Treino")}
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
    const target = event.target.closest("[data-pharma-drug], [data-pharma-class], [data-pharma-mode], [data-pharma-study], [data-pharma-answer], [data-pharma-quiz], [data-pharma-review]");
    if (!target) return;
    const data = target.dataset;
    if (data.pharmaDrug) {
      state.pharma.drug = data.pharmaDrug;
      /* Ao trocar de remédio na sinapse, começa numa ocupação típica dele. */
      state.pharma.occupancy = pharmaDefaultOccupancy(pharmaDrug(data.pharmaDrug));
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
    if (!event.target.matches("[data-pharma-occupancy]")) return;
    state.pharma.occupancy = Number(event.target.value);
    const view = panel.querySelector("#pharmaSynapseView");
    if (view) view.innerHTML = renderPharmaSynapseView(pharmaDrug(state.pharma.drug));
    panel.dataset.renderedHtml = "";
    savePharmaState();
  });
  panel.addEventListener("change", (event) => {
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
