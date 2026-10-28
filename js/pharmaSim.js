/* Simulador de psicofarmacologia (aba "Simulador"). Dados em data/pharmaSim.js.
   - Vias e receptores: corte do cérebro com as 4 vias dopaminérgicas coloridas conforme o remédio
     escolhido, perfil de receptores e "o que esperar" (efeitos relativos).
   - Comparar: dois remédios lado a lado, com o porquê das diferenças.
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
  const fallback = { mode: "paths", drug: "haloperidol", a: "olanzapina", b: "aripiprazol" };
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

function pharmaDrug(id) {
  const drugs = window.PHARMA_SIM?.drugs || [];
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

function pharmaBrainSvg(paths) {
  const c = (key) => PHARMA_TONES[paths[key].tone].color;
  return `
    <svg class="pharma-brain" viewBox="0 0 560 400" role="img" aria-label="Corte do cérebro com as quatro vias dopaminérgicas">
      <path d="M70 225 C58 140 130 58 250 48 C372 38 482 90 507 178 C526 248 492 298 432 312 C400 320 372 316 352 328 C337 343 331 366 302 368 C272 370 264 346 250 332 C200 327 120 318 90 288 C78 276 72 256 70 225 Z" class="pharma-brain-outline"></path>
      <ellipse cx="420" cy="318" rx="62" ry="34" class="pharma-brain-cerebellum"></ellipse>
      <path d="M296 330 C298 356 294 380 288 398" class="pharma-brain-stem"></path>
      <path d="M296 288 C262 252 182 222 126 168" stroke="${c("mesocortical")}" class="pharma-path"></path>
      <path d="M296 288 C272 272 236 246 206 232" stroke="${c("mesolimbic")}" class="pharma-path"></path>
      <path d="M316 278 C306 242 282 206 256 190" stroke="${c("nigrostriatal")}" class="pharma-path"></path>
      <path d="M246 266 C244 280 241 290 237 304" stroke="${c("tuberoinfundibular")}" class="pharma-path"></path>
      <circle cx="296" cy="288" r="9" class="pharma-node-origin"></circle>
      <circle cx="316" cy="278" r="9" class="pharma-node-origin"></circle>
      <circle cx="126" cy="168" r="8" class="pharma-node" stroke="${c("mesocortical")}"></circle>
      <circle cx="206" cy="232" r="8" class="pharma-node" stroke="${c("mesolimbic")}"></circle>
      <circle cx="256" cy="190" r="8" class="pharma-node" stroke="${c("nigrostriatal")}"></circle>
      <ellipse cx="236" cy="310" rx="10" ry="8" class="pharma-node" stroke="${c("tuberoinfundibular")}"></ellipse>
      <text x="104" y="150" class="pharma-label">Córtex pré-frontal</text>
      <text x="140" y="256" class="pharma-label">N. accumbens</text>
      <text x="236" y="176" class="pharma-label">Estriado</text>
      <text x="150" y="330" class="pharma-label">Hipófise</text>
      <text x="320" y="302" class="pharma-label small">ATV</text>
      <text x="334" y="276" class="pharma-label small">Subst. negra</text>
    </svg>`;
}

function pharmaReceptorRows(drug) {
  return window.PHARMA_SIM.receptors.map((receptor) => {
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
  return window.PHARMA_SIM.effects.map((effect) => {
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
  return window.PHARMA_SIM.drugs.map((drug) => `
    <button type="button" class="pharma-chip ${drug.id === selected ? "on" : ""}" data-pharma-drug="${drug.id}" aria-pressed="${drug.id === selected}">${escapeHtml(drug.name)}</button>`).join("");
}

function renderPharmaPaths() {
  const drug = pharmaDrug(state.pharma.drug);
  const paths = pharmaPathways(drug);
  return `
    <div class="pharma-chips" role="group" aria-label="Antipsicótico">${pharmaDrugChips(drug.id)}</div>
    <div class="pharma-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Vias dopaminérgicas · ${escapeHtml(drug.name)}</h3><span>${drug.generation === 1 ? "1ª geração" : "2ª geração"}</span></div>
        ${pharmaBrainSvg(paths)}
        <div class="pharma-paths">
          ${Object.values(paths).map((path) => `
            <div class="pharma-path-row tone-${path.tone}">
              <i style="background:${PHARMA_TONES[path.tone].color}"></i>
              <span><strong>${path.name}</strong> · ${escapeHtml(path.text)}</span>
            </div>`).join("")}
        </div>
      </section>
      <section class="pharma-card">
        <h3>Perfil de receptores</h3>
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
    ${window.PHARMA_SIM.drugs.map((drug) => `<option value="${drug.id}" ${drug.id === selected ? "selected" : ""}>${escapeHtml(drug.name)}</option>`).join("")}
  </select>`;
}

function renderPharmaCompare() {
  const a = pharmaDrug(state.pharma.a);
  const b = pharmaDrug(state.pharma.b);
  const receptorRows = window.PHARMA_SIM.receptors.map((receptor) => {
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
  const effectRows = window.PHARMA_SIM.effects.map((effect) => {
    const va = a.effects[effect.id] ?? 0;
    const vb = b.effects[effect.id] ?? 0;
    return `<tr><th scope="row">${escapeHtml(effect.label)}</th><td class="level-${va}">${PHARMA_EFFECT_LEVELS[va]}</td><td class="level-${vb}">${PHARMA_EFFECT_LEVELS[vb]}</td></tr>`;
  }).join("");
  const reasons = window.PHARMA_SIM.effects
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
        <h3>Receptores</h3>
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

function renderPharmaPanel() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel || !window.PHARMA_SIM) return;
  const mode = state.pharma.mode === "compare" ? "compare" : "paths";
  const html = `
    <header class="pharma-head">
      <div>
        <h2>Simulador de psicofarmacologia</h2>
        <p>Antipsicóticos: como o perfil de receptores explica o efeito e os efeitos colaterais.</p>
      </div>
      <div class="segmented pharma-modes" role="group" aria-label="Modo">
        <button type="button" data-pharma-mode="paths" class="${mode === "paths" ? "active" : ""}" aria-pressed="${mode === "paths"}">Vias e receptores</button>
        <button type="button" data-pharma-mode="compare" class="${mode === "compare" ? "active" : ""}" aria-pressed="${mode === "compare"}">Comparar</button>
      </div>
    </header>
    ${mode === "compare" ? renderPharmaCompare() : renderPharmaPaths()}
    <p class="pharma-disclaimer">Material didático e simplificado, para estudo. Afinidades em níveis qualitativos, conferidas com Stahl (Prescriber's Guide, 8ª ed.); efeitos relativos conforme Maudsley Prescribing Guidelines (15ª ed., tabela 1.7). Não usar para prescrição.</p>`;
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
    const target = event.target.closest("[data-pharma-drug], [data-pharma-mode], [data-pharma-study]");
    if (!target) return;
    if (target.dataset.pharmaDrug) state.pharma.drug = target.dataset.pharmaDrug;
    else if (target.dataset.pharmaMode) state.pharma.mode = target.dataset.pharmaMode;
    else if (target.dataset.pharmaStudy) {
      openPharmaStudy(pharmaDrug(target.dataset.pharmaStudy));
      return;
    }
    savePharmaState();
    renderPharmaPanel();
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
