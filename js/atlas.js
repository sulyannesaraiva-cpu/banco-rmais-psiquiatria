/* Atlas de vias (Simular → Vias). Desenha os módulos de data/atlas.js dentro do #pharmaPanel.
   O primeiro módulo é o circuito motor dos núcleos da base: cenários (normal, Parkinson,
   antipsicótico, Huntington, lesão do subtalâmico) mudam a atividade de cada estrutura e a
   espessura das conexões; "Seguir o sinal" acende o circuito passo a passo. */

const ATLAS_KEY = "banco-rmais-atlas";
const ATLAS_SIGN_COLORS = { "+": "#009e73", "-": "#c2410c", da: "#e69f00" };

state.atlas = (() => {
  const fallback = { module: null, scenario: "normal", step: null };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(ATLAS_KEY) || "{}") };
  } catch {
    return fallback;
  }
})();

function saveAtlasState() {
  try {
    localStorage.setItem(ATLAS_KEY, JSON.stringify(state.atlas));
  } catch {}
}

function renderAtlasHome() {
  const modules = window.ATLAS.modules.map((module) => module.ready
    ? `<button type="button" class="pharma-hub-card" data-atlas-module="${module.id}" style="--c:${module.color}">
        <span class="pharma-hub-tag">${escapeHtml(module.tag)}</span>
        <span class="pharma-hub-text"><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.text)}</small></span>
        <span aria-hidden="true" class="pharma-hub-arrow">›</span>
      </button>`
    : `<div class="pharma-hub-card soon" style="--c:${module.color}" aria-disabled="true">
        <span class="pharma-hub-tag">${escapeHtml(module.tag)}</span>
        <span class="pharma-hub-text"><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.text)} · em breve</small></span>
      </div>`).join("");
  return `
    <p class="atlas-group">Circuitos da psiquiatria</p>
    <div class="pharma-hub-list">${modules}</div>
    <p class="atlas-group">Vias clássicas · em breve</p>
    <div class="atlas-soon">${window.ATLAS.classic.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>
    <p class="pharma-disclaimer">Esquemas didáticos, desenhados para este site e conferidos com as fontes citadas em cada módulo.</p>`;
}

function atlasScenario() {
  const basal = window.ATLAS.basal;
  return basal.scenarios.find((item) => item.id === state.atlas.scenario) || basal.scenarios[0];
}

function atlasBasalSvg(scenario, step) {
  const basal = window.ATLAS.basal;
  const activity = (id) => scenario.activity[id] ?? 1;
  const lit = step === null || step === undefined ? null : new Set(basal.steps[step].edges);
  const markers = Object.entries(ATLAS_SIGN_COLORS).map(([sign, color], index) => `<marker id="atlas-m${index}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${color}"/></marker>`).join("");
  const markerId = (sign) => `atlas-m${Object.keys(ATLAS_SIGN_COLORS).indexOf(sign)}`;
  const edges = basal.edges.map((edge) => {
    const width = Math.max(1.5, Math.min(12, 2 + activity(edge.from) * 4));
    const dim = lit && !lit.has(edge.id);
    const blocked = scenario.blocked === edge.id;
    return `<path d="${edge.path}" class="atlas-edge${dim ? " dim" : ""}${lit && lit.has(edge.id) ? " lit" : ""}${blocked ? " blocked" : ""}" stroke="${ATLAS_SIGN_COLORS[edge.sign]}" stroke-width="${width.toFixed(1)}" marker-end="url(#${markerId(edge.sign)})"></path>`;
  }).join("");
  const nodes = Object.entries(basal.nodes).map(([id, node]) => {
    const level = activity(id);
    const badge = level >= 1.2 ? "↑ mais ativo" : level <= 0.8 ? "↓ menos ativo" : "";
    const tone = level >= 1.2 ? "up" : level <= 0.8 ? "down" : "";
    const lesion = scenario.lesion === id;
    return `
      <g class="atlas-node ${tone}${lesion ? " lesion" : ""}">
        <rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="16"></rect>
        <text x="${node.x + node.w / 2}" y="${node.y + node.h / 2 - 2}" text-anchor="middle" class="atlas-node-label">${escapeHtml(node.label)}</text>
        <text x="${node.x + node.w / 2}" y="${node.y + node.h / 2 + 16}" text-anchor="middle" class="atlas-node-sub">${lesion ? "lesão" : escapeHtml(badge || node.sub)}</text>
      </g>`;
  }).join("");
  const labels = basal.edges.filter((edge) => edge.label).map((edge) => {
    const positions = { "snc-str2": [184, 160], "snc-str1": [300, 274], "str1-gpi": [584, 300], "str2-gpe": [120, 290], "gpi-tha": [578, 520], "tha-ctx": [742, 330] };
    const [x, y] = positions[edge.id] || [0, 0];
    return `<text x="${x}" y="${y}" class="atlas-edge-label" fill="${ATLAS_SIGN_COLORS[edge.sign]}"${edge.id === "tha-ctx" ? ` transform="rotate(90 ${x} ${y})"` : ""}>${escapeHtml(edge.label)}</text>`;
  }).join("");
  const block = scenario.blocked ? `<g class="atlas-block"><circle cx="184" cy="201" r="14"></circle><text x="184" y="206" text-anchor="middle">✕</text></g>` : "";
  return `
    <svg class="atlas-svg" viewBox="0 0 780 650" role="img" aria-label="Circuito motor dos núcleos da base: ${escapeHtml(scenario.label)}">
      <defs>${markers}</defs>
      ${edges}${nodes}${labels}${block}
    </svg>`;
}

function renderAtlasBasal() {
  const basal = window.ATLAS.basal;
  const scenario = atlasScenario();
  const step = Number.isInteger(state.atlas.step) ? state.atlas.step : null;
  const scenarios = basal.scenarios.map((item) => `<button type="button" class="pharma-chip ${item.id === scenario.id ? "on" : ""}" data-atlas-scenario="${item.id}" aria-pressed="${item.id === scenario.id}">${escapeHtml(item.label)}</button>`).join("");
  const refCount = ((window.PHARMA_REFS || {})["atlas-nucleos-base"]?.paths || []).length;
  const stepBox = step === null
    ? `<button type="button" class="primary-btn atlas-trace" data-atlas-step="0">Seguir o sinal, passo a passo</button>`
    : `
      <div class="pharma-reading tone-ok atlas-step">
        <strong>Seguir o sinal · passo ${step + 1} de ${basal.steps.length}</strong>
        <span>${escapeHtml(basal.steps[step].text)}</span>
        <div class="pharma-tour-actions atlas-step-actions">
          <button type="button" data-atlas-step="${step - 1}" ${step === 0 ? "disabled" : ""}>Voltar</button>
          ${step + 1 < basal.steps.length ? `<button type="button" class="next" data-atlas-step="${step + 1}">Próximo</button>` : '<button type="button" class="next" data-atlas-step="-1">Ver o circuito todo</button>'}
        </div>
      </div>`;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Vias</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Núcleos da base</h2>
        <p>A via direta solta o tálamo e facilita o movimento; a indireta o freia. A dopamina puxa o equilíbrio para a direta.</p>
      </div>
    </header>
    <div class="pharma-chips" role="group" aria-label="Cenário">${scenarios}</div>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Circuito motor</h3><span>esquema didático · não em escala</span></div>
        ${atlasBasalSvg(scenario, step)}
        <div class="atlas-legend">
          <span><i style="background:${ATLAS_SIGN_COLORS["+"]}"></i>excitatório (glutamato)</span>
          <span><i style="background:${ATLAS_SIGN_COLORS["-"]}"></i>inibitório (GABA)</span>
          <span><i style="background:${ATLAS_SIGN_COLORS.da}"></i>dopamina</span>
          <span>espessura = atividade da origem</span>
        </div>
        ${stepBox}
      </section>
      <section class="pharma-card">
        <h3>${escapeHtml(scenario.label)}</h3>
        <div class="pharma-reading tone-ok"><strong>O que muda</strong><span>${escapeHtml(scenario.change)}</span></div>
        <div class="pharma-reading tone-${scenario.tone}"><strong>Resultado</strong><span>${escapeHtml(scenario.result)}</span></div>
        ${scenario.link ? `<button type="button" class="link-btn atlas-link" data-atlas-link="${scenario.id}">${escapeHtml(scenario.link.label)} ›</button>` : ""}
      </section>
    </div>
    <p class="pharma-disclaimer">Modelo clássico de vias direta e indireta, simplificado para estudo: o circuito real tem muito mais conexões.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-nucleos-base", label: "Núcleos da base" }, "paths", "Circuito motor") : ""}`;
}

/* ---------- Circuitos frontoestriatais: três alças paralelas e "lesione e veja" ---------- */

function atlasFrontoSvg(active, lesionAt) {
  const fronto = window.ATLAS.fronto;
  const rows = { cortex: 40, striatum: 170, pallidum: 300, thalamus: 430 };
  const columns = fronto.circuits.map((circuit, index) => {
    const x = 20 + index * 250;
    const on = circuit.id === active.id;
    const boxes = fronto.levels.map((level) => {
      const y = rows[level.id];
      const lesion = on && lesionAt === level.id;
      return `
        <g class="fronto-node${lesion ? " lesion" : ""}">
          <rect x="${x}" y="${y}" width="210" height="76" rx="14"></rect>
          <text x="${x + 105}" y="${y + 30}" text-anchor="middle" class="fronto-level">${escapeHtml(level.label)}</text>
          ${wrapSvgText(lesion ? "lesão" : circuit.nodes[level.id], x + 105, y + 50, 26)}
        </g>`;
    }).join("");
    const arrows = [["cortex", "striatum"], ["striatum", "pallidum"], ["pallidum", "thalamus"]]
      .map(([from, to]) => `<path d="M${x + 105} ${rows[from] + 78} V${rows[to] - 4}" class="fronto-arrow" marker-end="url(#fronto-head-${circuit.id})"></path>`).join("");
    const back = `<path d="M${x + 212} ${rows.thalamus + 38} H${x + 228} V${rows.cortex + 38} H${x + 216}" class="fronto-arrow back" marker-end="url(#fronto-head-${circuit.id})"></path>`;
    return `<g class="fronto-loop${on ? " on" : ""}" style="--c:${circuit.color}">${arrows}${back}${boxes}<text x="${x + 105}" y="24" text-anchor="middle" class="fronto-title">${escapeHtml(circuit.label)}</text></g>`;
  }).join("");
  const heads = fronto.circuits.map((circuit) => `<marker id="fronto-head-${circuit.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${circuit.color}"/></marker>`).join("");
  /* No celular, enquadra só a alça escolhida (as três lado a lado ficariam ilegíveis). */
  const index = fronto.circuits.indexOf(active);
  const box = typeof isMobileLayout === "function" && isMobileLayout() ? `${10 + index * 250} 0 250 520` : "0 0 760 520";
  return `<svg class="atlas-svg" viewBox="${box}" role="img" aria-label="Três alças frontoestriatais paralelas; em destaque, a ${escapeHtml(active.label.toLowerCase())}"><defs>${heads}</defs>${columns}</svg>`;
}

/* Quebra um rótulo em até duas linhas dentro do bloco. */
function wrapSvgText(text, x, y, max) {
  const words = String(text).split(" ");
  const lines = [""];
  words.forEach((word) => {
    const line = lines[lines.length - 1];
    if ((line + " " + word).trim().length > max && line) lines.push(word);
    else lines[lines.length - 1] = (line + " " + word).trim();
  });
  return lines.slice(0, 2).map((line, index) => `<text x="${x}" y="${y + index * 15}" text-anchor="middle" class="fronto-sub">${escapeHtml(line)}</text>`).join("");
}

function renderAtlasFronto() {
  const fronto = window.ATLAS.fronto;
  const active = fronto.circuits.find((item) => item.id === state.atlas.circuit) || fronto.circuits[0];
  const lesionAt = state.atlas.lesionAt || null;
  const refCount = ((window.PHARMA_REFS || {})["atlas-frontoestriatais"]?.paths || []).length;
  const circuits = fronto.circuits.map((item) => `<button type="button" class="pharma-chip ${item.id === active.id ? "on" : ""}" data-atlas-circuit="${item.id}" aria-pressed="${item.id === active.id}">${escapeHtml(item.label)}</button>`).join("");
  const lesionButtons = fronto.levels.map((level) => `<button type="button" class="pharma-toggle ${lesionAt === level.id ? "on" : ""}" data-atlas-lesion="${level.id}" aria-pressed="${lesionAt === level.id}">${escapeHtml(level.label)}</button>`).join("");
  const lesionLabel = lesionAt ? fronto.levels.find((level) => level.id === lesionAt).label.toLowerCase() : "";
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Vias</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Circuitos frontoestriatais</h2>
        <p>Três alças paralelas saem do córtex pré-frontal, passam pelo estriado, pálido e tálamo e voltam ao mesmo córtex. Cada uma sustenta um tipo de comportamento.</p>
      </div>
    </header>
    <div class="pharma-chips" role="group" aria-label="Circuito">${circuits}</div>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Alças córtex-estriado-tálamo</h3><span>esquema didático · não em escala</span></div>
        ${atlasFrontoSvg(active, lesionAt)}
        <h4>Lesione e veja</h4>
        <p class="pharma-extra">Escolha onde lesionar a alça ${escapeHtml(active.label.toLowerCase())}:</p>
        <div class="pharma-toggles">${lesionButtons}${lesionAt ? '<button type="button" class="pharma-toggle" data-atlas-lesion="">Tirar a lesão</button>' : ""}</div>
      </section>
      <section class="pharma-card">
        <h3>${escapeHtml(active.label)}</h3>
        <div class="pharma-reading tone-ok"><strong>Para que serve</strong><span>${escapeHtml(active.function)}</span></div>
        ${lesionAt ? `
          <div class="pharma-reading tone-high">
            <strong>Lesão no ${escapeHtml(lesionLabel)}: ${escapeHtml(active.syndrome.toLowerCase())}</strong>
            <ul class="fronto-signs">${active.signs.map((sign) => `<li>${escapeHtml(sign)}</li>`).join("")}</ul>
          </div>
          <div class="pharma-reading tone-warn"><strong>Por que o lugar quase não muda</strong><span>${escapeHtml(fronto.keyPoint)}</span></div>`
          : `<div class="pharma-reading tone-low"><strong>${escapeHtml(active.syndrome)}</strong><span>Escolha um ponto da alça em “Lesione e veja” para ver o que acontece.</span></div>`}
        <h4>Na psiquiatria</h4>
        ${active.disorders.map((item) => `<div class="pharma-reading tone-ok"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.text)}</span></div>`).join("")}
      </section>
    </div>
    <p class="pharma-disclaimer">Modelo clássico de alças paralelas, simplificado para estudo: os circuitos reais se cruzam e se influenciam.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-frontoestriatais", label: "Circuitos frontoestriatais" }, "paths", active.label) : ""}`;
}

function renderAtlas() {
  if (state.atlas.module === "nucleos-base") return renderAtlasBasal();
  if (state.atlas.module === "frontoestriatais") return renderAtlasFronto();
  return null;
}

(function setupAtlas() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-atlas-module], [data-atlas-home], [data-atlas-scenario], [data-atlas-step], [data-atlas-link], [data-sim-section], [data-atlas-circuit], [data-atlas-lesion]");
    if (!target) return;
    const data = target.dataset;
    if (data.simSection) {
      state.pharma.section = data.simSection;
      state.pharma.view = "hub";
      state.atlas.module = null;
    } else if (data.atlasModule) {
      state.atlas.module = data.atlasModule;
      state.atlas.step = null;
      state.atlas.lesionAt = null;
    } else if (data.atlasHome !== undefined) state.atlas.module = null;
    else if (data.atlasScenario) state.atlas.scenario = data.atlasScenario;
    else if (data.atlasCircuit) {
      state.atlas.circuit = data.atlasCircuit;
      state.atlas.lesionAt = null;
    } else if (data.atlasLesion !== undefined) state.atlas.lesionAt = data.atlasLesion || null;
    else if (data.atlasStep !== undefined) {
      const step = Number(data.atlasStep);
      state.atlas.step = step < 0 ? null : step;
    } else if (data.atlasLink) {
      const scenario = window.ATLAS.basal.scenarios.find((item) => item.id === data.atlasLink);
      if (scenario?.link) {
        state.pharma.section = "drugs";
        setPharmaClass(scenario.link.cls);
        state.pharma.view = "class";
        state.pharma.mode = scenario.link.mode;
        savePharmaState();
      }
    }
    state.pharma.sourcesOpen = false;
    saveAtlasState();
    savePharmaState();
    renderPharmaPanel();
    if (data.atlasModule || data.atlasHome !== undefined || data.atlasLink || data.simSection) panel.scrollIntoView({ block: "start" });
  });
})();
