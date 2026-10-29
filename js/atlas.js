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
  const card = (module) => module.ready
    ? `<button type="button" class="pharma-hub-card" data-atlas-module="${module.id}" style="--c:${module.color}">
        <span class="pharma-hub-tag">${escapeHtml(module.tag)}</span>
        <span class="pharma-hub-text"><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.text)}</small></span>
        <span aria-hidden="true" class="pharma-hub-arrow">›</span>
      </button>`
    : `<div class="pharma-hub-card soon" style="--c:${module.color}" aria-disabled="true">
        <span class="pharma-hub-tag">${escapeHtml(module.tag)}</span>
        <span class="pharma-hub-text"><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.text)} · em breve</small></span>
      </div>`;
  return `
    <p class="atlas-group">Circuitos e sistemas</p>
    <div class="pharma-hub-list">${window.ATLAS.modules.map(card).join("")}</div>
    <p class="atlas-group">Vias e lesões</p>
    <div class="pharma-hub-list">${window.ATLAS.classicModules.map(card).join("")}</div>
    <div class="atlas-soon">${window.ATLAS.classic.map((name) => `<span>${escapeHtml(name)} · em breve</span>`).join("")}</div>
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
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
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
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
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
        <h4>Simular lesão</h4>
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
          : `<div class="pharma-reading tone-low"><strong>${escapeHtml(active.syndrome)}</strong><span>Escolha um ponto da alça em “Simular lesão” para ver o que acontece.</span></div>`}
        <h4>Correlação clínica</h4>
        ${active.disorders.map((item) => `<div class="pharma-reading tone-ok"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.text)}</span></div>`).join("")}
      </section>
    </div>
    <p class="pharma-disclaimer">Modelo clássico de alças paralelas, simplificado para estudo: os circuitos reais se cruzam e se influenciam.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-frontoestriatais", label: "Circuitos frontoestriatais" }, "paths", active.label) : ""}`;
}

/* ---------- Sistema límbico e circuito de Papez ---------- */

const ATLAS_LIMBIC_COLOR = "#b0418a";

function atlasLimbicSvg(lesion, step) {
  const limbic = window.ATLAS.limbic;
  const hurt = new Set(lesion ? lesion.nodes : []);
  const lit = step === null ? null : new Set(limbic.steps[step].edges);
  const edges = limbic.edges.map((edge) => {
    const broken = hurt.has(edge.from) || hurt.has(edge.to);
    const cls = ["limbic-edge", edge.extra ? "extra" : "", broken ? "broken" : "", lit && !lit.has(edge.id) ? "dim" : "", lit && lit.has(edge.id) ? "lit" : ""].join(" ");
    return `<path d="${edge.path}" class="${cls}" marker-end="url(#limbic-head)"></path>`;
  }).join("");
  const nodes = Object.entries(limbic.nodes).map(([id, node]) => `
    <g class="limbic-node${node.extra ? " extra" : ""}${hurt.has(id) ? " lesion" : ""}">
      <rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="16"></rect>
      <text x="${node.x + node.w / 2}" y="${node.y + (node.sub ? 25 : 34)}" text-anchor="middle" class="atlas-node-label">${escapeHtml(node.label)}</text>
      ${node.sub || hurt.has(id) ? `<text x="${node.x + node.w / 2}" y="${node.y + 44}" text-anchor="middle" class="atlas-node-sub">${hurt.has(id) ? "lesão" : escapeHtml(node.sub)}</text>` : ""}
    </g>`).join("");
  const labels = limbic.edges.filter((edge) => edge.label).map(() => `<text x="620" y="292" text-anchor="end" class="atlas-edge-label limbic-label">trato mamilotalâmico</text>`).join("");
  return `
    <svg class="atlas-svg" viewBox="0 0 760 520" role="img" aria-label="Circuito de Papez${lesion ? ` com lesão: ${escapeHtml(lesion.label.toLowerCase())}` : ""}">
      <defs><marker id="limbic-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${ATLAS_LIMBIC_COLOR}"/></marker></defs>
      ${edges}${nodes}${labels}
      <text x="380" y="250" text-anchor="middle" class="limbic-center">circuito de Papez</text>
    </svg>`;
}

function renderAtlasLimbic() {
  const limbic = window.ATLAS.limbic;
  const lesion = limbic.lesions.find((item) => item.id === state.atlas.limbicLesion) || null;
  const step = Number.isInteger(state.atlas.step) ? state.atlas.step : null;
  const refCount = ((window.PHARMA_REFS || {})["atlas-limbico"]?.paths || []).length;
  const lesionButtons = limbic.lesions.map((item) => `<button type="button" class="pharma-toggle ${lesion?.id === item.id ? "on" : ""}" data-atlas-limbic="${item.id}" aria-pressed="${lesion?.id === item.id}">${escapeHtml(item.label)}</button>`).join("");
  const stepBox = step === null
    ? `<button type="button" class="primary-btn atlas-trace" data-atlas-step="0">Seguir o sinal, passo a passo</button>`
    : `
      <div class="pharma-reading tone-ok atlas-step">
        <strong>Seguir o sinal · passo ${step + 1} de ${limbic.steps.length}</strong>
        <span>${escapeHtml(limbic.steps[step].text)}</span>
        <div class="pharma-tour-actions atlas-step-actions">
          <button type="button" data-atlas-step="${step - 1}" ${step === 0 ? "disabled" : ""}>Voltar</button>
          ${step + 1 < limbic.steps.length ? `<button type="button" class="next" data-atlas-step="${step + 1}">Próximo</button>` : '<button type="button" class="next" data-atlas-step="-1">Ver o circuito todo</button>'}
        </div>
      </div>`;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Sistema límbico e Papez</h2>
        <p>Papez descreveu em 1937 um circuito de emoção e memória: hipocampo, fórnix, corpos mamilares, núcleo anterior do tálamo e giro do cíngulo. Depois entraram a amígdala e o orbitofrontal.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Circuito de Papez</h3><span>esquema didático · não em escala</span></div>
        ${atlasLimbicSvg(lesion, step)}
        ${stepBox}
        <h4>Simular lesão</h4>
        <div class="pharma-toggles">${lesionButtons}${lesion ? '<button type="button" class="pharma-toggle" data-atlas-limbic="">Tirar a lesão</button>' : ""}</div>
      </section>
      <section class="pharma-card">
        ${lesion ? `
          <h3>${escapeHtml(lesion.syndrome)}</h3>
          <div class="pharma-reading tone-warn"><strong>Causa</strong><span>${escapeHtml(lesion.cause)}</span></div>
          <div class="pharma-reading tone-high"><strong>O que aparece</strong><ul class="fronto-signs">${lesion.signs.map((sign) => `<li>${escapeHtml(sign)}</li>`).join("")}</ul></div>`
          : `<h3>Memória e emoção</h3><div class="pharma-reading tone-low"><strong>Escolha uma lesão</strong><span>Em “Simular lesão”, toque numa estrutura para ver a síndrome.</span></div>`}
        <h4>Correlação clínica</h4>
        ${limbic.psychiatry.map((item) => `<div class="pharma-reading tone-ok"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.text)}</span></div>`).join("")}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado para estudo: as estruturas límbicas têm muitas outras conexões.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-limbico", label: "Sistema límbico e Papez" }, "paths", lesion ? lesion.syndrome : "Circuito de Papez") : ""}`;
}

/* ---------- Sistemas de neurotransmissores: mapa sagital com um sistema por vez ---------- */

const ATLAS_BRAIN_OUTLINE = "M70 225 C58 140 130 58 250 48 C372 38 482 90 507 178 C526 248 492 298 432 312 C400 320 372 316 352 328 C337 343 331 366 302 368 C272 370 264 346 250 332 C200 327 120 318 90 288 C78 276 72 256 70 225 Z";

function atlasCurve(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.min(60, Math.abs(a.x - b.x) * 0.25 + 10);
  return `M${a.x} ${a.y} Q${mx.toFixed(0)} ${my.toFixed(0)} ${b.x} ${b.y}`;
}

function atlasNeuroSvg(system) {
  const neuro = window.ATLAS.neuro;
  const pts = neuro.points;
  const used = new Set(system.paths.flatMap(([from, to]) => [from, to]));
  const paths = system.paths.map(([from, to]) => `<path d="${atlasCurve(pts[from], pts[to])}" class="neuro-path" stroke="${system.color}"></path>`).join("");
  /* Rótulos em posição fixa; os núcleos de origem, muito juntos no tronco, ganham linha-guia. */
  const dots = [...used].map((id) => {
    const point = pts[id];
    const origin = point.origin && system.paths.some(([from]) => from === id);
    const leader = origin ? `<line x1="${point.x}" y1="${point.y}" x2="${point.lx + (point.anchor === "end" ? 3 : -3)}" y2="${point.ly - 4}" class="neuro-leader"></line>` : "";
    return `${leader}<circle cx="${point.x}" cy="${point.y}" r="${origin ? 8 : 6}" class="neuro-dot${origin ? " origin" : ""}" stroke="${system.color}"></circle><text x="${point.lx}" y="${point.ly}" text-anchor="${point.anchor}" class="neuro-label${origin ? " origin" : ""}">${escapeHtml(point.label)}</text>`;
  }).join("");
  return `
    <svg class="atlas-svg" viewBox="10 30 550 380" role="img" aria-label="Corte sagital com as projeções de ${escapeHtml(system.label.toLowerCase())}">
      <path d="${ATLAS_BRAIN_OUTLINE}" class="pharma-brain-outline"></path>
      <ellipse cx="420" cy="318" rx="62" ry="34" class="pharma-brain-cerebellum"></ellipse>
      <path d="M296 330 C298 356 294 380 288 398" class="pharma-brain-stem"></path>
      ${paths}${dots}
    </svg>`;
}

function renderAtlasNeuro() {
  const neuro = window.ATLAS.neuro;
  const system = neuro.systems.find((item) => item.id === state.atlas.system) || neuro.systems[0];
  const refCount = ((window.PHARMA_REFS || {})["atlas-neurotransmissores"]?.paths || []).length;
  const chips = neuro.systems.map((item) => `<button type="button" class="pharma-chip ${item.id === system.id ? "on" : ""}" data-atlas-system="${item.id}" aria-pressed="${item.id === system.id}" style="--chip:${item.color}">${escapeHtml(item.label)}</button>`).join("");
  const row = (label, text, tone = "ok") => `<div class="pharma-reading tone-${tone}"><strong>${label}</strong><span>${escapeHtml(text)}</span></div>`;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Sistemas de neurotransmissores</h2>
        <p>Poucos núcleos pequenos no tronco e no prosencéfalo basal projetam para o cérebro inteiro. É neles que a maioria dos psicofármacos age.</p>
      </div>
    </header>
    <div class="pharma-chips" role="group" aria-label="Sistema">${chips}</div>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>${escapeHtml(system.label)}</h3><span>corte sagital esquemático</span></div>
        ${atlasNeuroSvg(system)}
        ${system.paths.some((path) => path[2]) ? `<div class="neuro-named">${system.paths.filter((path) => path[2]).map(([from, to, name]) => `<span><i style="background:${system.color}"></i><b>${escapeHtml(name)}</b> ${escapeHtml(neuro.points[from].label)} → ${escapeHtml(neuro.points[to].label)}</span>`).join("")}</div>` : ""}
        <p class="pharma-extra">Círculo escuro: núcleo de origem. Círculo claro: principais alvos.</p>
      </section>
      <section class="pharma-card">
        ${row("De onde sai", system.origin)}
        ${row("Para onde vai", system.targets)}
        ${row("Para que serve", system.role, "good")}
        ${row("Quando falha ou sobra", system.clinic, "warn")}
        ${row("Fármacos que agem aqui", system.drugs)}
        ${system.link ? `<button type="button" class="link-btn atlas-link" data-atlas-drugs="${system.link.cls}">${escapeHtml(system.link.label)} ›</button>` : ""}
      </section>
    </div>
    <p class="pharma-disclaimer">Mapa simplificado para estudo: cada sistema tem muito mais alvos do que os desenhados.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-neurotransmissores", label: "Sistemas de neurotransmissores" }, "paths", system.label) : ""}`;
}

/* ---------- Eixo hipotálamo-hipófise-adrenal ---------- */

function atlasHpaSvg(scenario, dex) {
  const hpa = window.ATLAS.hpa;
  const nodes = hpa.nodes;
  const level = (id) => scenario.activity[id] ?? 1;
  const width = (id) => Math.max(1.5, Math.min(11, 2 + level(id) * 4)).toFixed(1);
  const feedbackWidth = Math.max(1.5, scenario.feedback * 6).toFixed(1);
  const box = (id) => {
    const node = nodes[id];
    const value = level(id);
    const tone = value >= 1.2 ? "up" : value <= 0.8 ? "down" : "";
    const badge = value >= 1.2 ? "↑ mais ativo" : value <= 0.8 ? "↓ menos ativo" : node.sub;
    return `<g class="atlas-node ${tone}"><rect x="${node.x}" y="${node.y}" width="220" height="64" rx="16"></rect><text x="${node.x + 110}" y="${node.y + 27}" text-anchor="middle" class="atlas-node-label">${escapeHtml(node.label)}</text><text x="${node.x + 110}" y="${node.y + 46}" text-anchor="middle" class="atlas-node-sub">${escapeHtml(badge)}</text></g>`;
  };
  const hormone = (x, y, text) => `<text x="${x}" y="${y}" class="hpa-hormone">${escapeHtml(text)}</text>`;
  const dexBox = dex ? `
    <g class="hpa-ext"><rect x="560" y="290" width="170" height="58" rx="14"></rect><text x="645" y="316" text-anchor="middle" class="atlas-node-label">Dexametasona</text><text x="645" y="334" text-anchor="middle" class="atlas-node-sub">teste de supressão</text></g>
    <path d="M558 314 H496" class="hpa-arrow minus" stroke-width="4" marker-end="url(#hpa-minus)"></path>` : "";
  const exoBox = scenario.exogenous ? `
    <g class="hpa-ext"><rect x="560" y="392" width="170" height="58" rx="14"></rect><text x="645" y="418" text-anchor="middle" class="atlas-node-label">Corticoide externo</text><text x="645" y="436" text-anchor="middle" class="atlas-node-sub">dose alta</text></g>` : "";
  return `
    <svg class="atlas-svg" viewBox="0 0 760 480" role="img" aria-label="Eixo hipotálamo-hipófise-adrenal: ${escapeHtml(scenario.label)}">
      <defs>
        <marker id="hpa-plus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#009e73"/></marker>
        <marker id="hpa-minus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#c2410c"/></marker>
      </defs>
      <path d="M380 86 V126" class="hpa-arrow plus" stroke-width="${width("estresse")}" marker-end="url(#hpa-plus)"></path>
      <path d="M252 162 H266" class="hpa-arrow minus" stroke-width="${width("hipocampo")}" marker-end="url(#hpa-minus)"></path>
      <path d="M380 196 V256" class="hpa-arrow plus" stroke-width="${width("hipotalamo")}" marker-end="url(#hpa-plus)"></path>
      ${hormone(392, 232, hpa.hormones.hipotalamo)}
      <path d="M380 326 V386" class="hpa-arrow plus" stroke-width="${width("hipofise")}" marker-end="url(#hpa-plus)"></path>
      ${hormone(392, 362, hpa.hormones.hipofise)}
      <path d="M492 422 H540 V170 H496" class="hpa-arrow minus feedback" stroke-width="${feedbackWidth}" marker-end="url(#hpa-minus)"></path>
      <path d="M540 292 H496" class="hpa-arrow minus feedback" stroke-width="${feedbackWidth}" marker-end="url(#hpa-minus)"></path>
      <path d="M540 170 V110 H140 V126" class="hpa-arrow minus feedback" stroke-width="${feedbackWidth}" marker-end="url(#hpa-minus)"></path>
      ${hormone(270, 474, `${hpa.hormones.adrenal}${scenario.exogenous ? " + corticoide" : ""} → feedback negativo (tracejado)`)}
      ${scenario.exogenous ? '<path d="M558 421 H546" class="hpa-arrow plus" stroke-width="5" marker-end="url(#hpa-plus)"></path>' : ""}
      ${Object.keys(nodes).map(box).join("")}
      ${dexBox}${exoBox}
    </svg>`;
}

function renderAtlasHpa() {
  const hpa = window.ATLAS.hpa;
  const scenario = hpa.scenarios.find((item) => item.id === state.atlas.hpa) || hpa.scenarios[0];
  const dex = Boolean(state.atlas.dex) && !scenario.exogenous;
  const refCount = ((window.PHARMA_REFS || {})["atlas-hha"]?.paths || []).length;
  const chips = hpa.scenarios.map((item) => `<button type="button" class="pharma-chip ${item.id === scenario.id ? "on" : ""}" data-atlas-hpa="${item.id}" aria-pressed="${item.id === scenario.id}">${escapeHtml(item.label)}</button>`).join("");
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Eixo hipotálamo-hipófise-adrenal</h2>
        <p>A resposta hormonal ao estresse: hipotálamo, hipófise e adrenal em cadeia, com o cortisol freando o próprio eixo.</p>
      </div>
    </header>
    <div class="pharma-chips" role="group" aria-label="Cenário">${chips}</div>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>A alça do cortisol</h3><span>esquema didático</span></div>
        ${atlasHpaSvg(scenario, dex)}
        <div class="atlas-legend">
          <span><i style="background:#009e73"></i>estimula</span>
          <span><i style="background:#c2410c"></i>inibe (feedback negativo tracejado)</span>
          <span>espessura = força</span>
        </div>
        ${scenario.exogenous ? "" : `<div class="pharma-toggles"><button type="button" class="pharma-toggle ${dex ? "on" : ""}" data-atlas-dex aria-pressed="${dex}">Dar dexametasona (teste de supressão)</button></div>`}
      </section>
      <section class="pharma-card">
        <h3>${escapeHtml(scenario.label)}</h3>
        <div class="pharma-reading tone-ok"><strong>O que muda</strong><span>${escapeHtml(scenario.change)}</span></div>
        <div class="pharma-reading tone-${scenario.tone}"><strong>Resultado</strong><span>${escapeHtml(scenario.result)}</span></div>
        ${dex ? `<div class="pharma-reading tone-warn"><strong>Teste de supressão com dexametasona</strong><span>${escapeHtml(scenario.dex)}</span></div>` : ""}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: o eixo recebe muitas outras influências (neurotransmissores, sistema imune, ritmo circadiano).</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-hha", label: "Eixo hipotálamo-hipófise-adrenal" }, "paths", scenario.label) : ""}`;
}

/* ---------- Vias motoras e sensitivas: onde cruzam e "onde está a lesão" ---------- */

const ATLAS_SIDE_X = { E: 250, D: 510 };
const ATLAS_SIDE_NAME = { E: "esquerdo", D: "direito" };
const otherSide = (side) => (side === "E" ? "D" : "E");

/* De que lado do neuroeixo a via (que serve o lado B do corpo) passa em cada nível. */
function tractSideAt(tract, body, levelId) {
  const level = window.ATLAS.longTracts.levels.find((item) => item.id === levelId);
  if (level.brain) return otherSide(body);
  return tract.cross === "medula" ? otherSide(body) : body;
}

function longTractDeficits(lesion) {
  if (!lesion) return [];
  const data = window.ATLAS.longTracts;
  return data.tracts.map((tract) => ({ tract, sides: ["E", "D"].filter((body) => tractSideAt(tract, body, lesion.level) === lesion.side) }));
}

function atlasLongSvg(body, lesion) {
  const data = window.ATLAS.longTracts;
  const y = Object.fromEntries(data.levels.map((level) => [level.id, level.y]));
  const offsets = { motor: -40, dorsal: 0, pain: 40 };
  const bands = data.levels.map((level) => `
    <g class="tract-level${level.noLesion ? " muted" : ""}">
      <line x1="150" y1="${level.y}" x2="610" y2="${level.y}"></line>
      <text x="380" y="${level.y - 8}" text-anchor="middle" class="tract-level-label">${escapeHtml(level.label)}</text>
    </g>`).join("");
  const paths = data.tracts.map((tract) => {
    const opp = ATLAS_SIDE_X[otherSide(body)] + offsets[tract.id];
    const same = ATLAS_SIDE_X[body] + offsets[tract.id];
    let d;
    if (tract.cross === "bulbo" && tract.id === "motor") {
      d = `M${opp} ${y.cortex} V${y.bulbo} L${same} ${y.bulbo + 40} V470`;
    } else if (tract.cross === "bulbo") {
      /* Via ascendente: começa embaixo, no lado do corpo, e cruza no bulbo. */
      d = `M${same} 470 V${y.bulbo + 40} L${opp} ${y.bulbo} V${y.cortex}`;
    } else {
      d = `M${same} 470 V452 L${opp} 432 V${y.cortex}`;
    }
    const dir = tract.id === "motor" ? "url(#tract-down)" : "url(#tract-up)";
    return `<path d="${d}" class="tract-path" stroke="${tract.color}" marker-${tract.id === "motor" ? "end" : "end"}="${dir}"></path>`;
  }).join("");
  const mark = lesion ? `<g class="tract-lesion"><circle cx="${ATLAS_SIDE_X[lesion.side]}" cy="${y[lesion.level]}" r="18"></circle><text x="${ATLAS_SIDE_X[lesion.side]}" y="${y[lesion.level] + 6}" text-anchor="middle">✕</text></g>` : "";
  const markers = data.tracts.map((tract) => `<marker id="tract-${tract.id === "motor" ? "down" : "up"}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#4f6469"/></marker>`).join("");
  return `
    <svg class="atlas-svg" viewBox="120 0 520 480" role="img" aria-label="Vias longas que servem o lado ${ATLAS_SIDE_NAME[body]} do corpo">
      <defs>${markers}</defs>
      <text x="${ATLAS_SIDE_X.E}" y="18" text-anchor="middle" class="tract-side">lado esquerdo</text>
      <text x="${ATLAS_SIDE_X.D}" y="18" text-anchor="middle" class="tract-side">lado direito</text>
      <line x1="380" y1="24" x2="380" y2="476" class="tract-midline"></line>
      ${bands}${paths}${mark}
    </svg>`;
}

/* Bonequinho de frente: o lado direito do paciente fica à esquerda de quem olha. */
function atlasBodyFigure(id, sides, extent, color) {
  const top = extent === "cervical" ? 48 : extent === "toracica" ? 88 : 40;
  const shape = "M60 40 C40 40 32 46 30 60 L22 112 L32 114 L40 70 L40 130 L36 196 L50 196 L58 136 L62 136 L70 196 L84 196 L80 130 L80 70 L88 114 L98 112 L90 60 C88 46 80 40 60 40 Z";
  const halves = sides.map((side) => {
    const x = side === "D" ? 0 : 60;
    return `<rect x="${x}" y="${top}" width="60" height="${200 - top}" fill="${color}" opacity="0.75" clip-path="url(#body-${id})"></rect>`;
  }).join("");
  return `
    <svg viewBox="0 0 120 210" class="tract-body" aria-hidden="true">
      <defs><clipPath id="body-${id}"><path d="${shape}"></path></clipPath></defs>
      <circle cx="60" cy="22" r="15" class="tract-body-shape"></circle>
      <path d="${shape}" class="tract-body-shape"></path>
      ${halves}
      <text x="30" y="208" text-anchor="middle" class="tract-body-side">D</text>
      <text x="90" y="208" text-anchor="middle" class="tract-body-side">E</text>
    </svg>`;
}

function renderAtlasLong() {
  const data = window.ATLAS.longTracts;
  const body = state.atlas.tractBody === "E" ? "E" : "D";
  const lesion = state.atlas.tractLesion || null;
  const deficits = longTractDeficits(lesion);
  const refCount = ((window.PHARMA_REFS || {})["atlas-vias-longas"]?.paths || []).length;
  const level = lesion ? data.levels.find((item) => item.id === lesion.level) : null;
  const lesionButtons = data.levels.filter((item) => !item.noLesion).map((item) => `
    <div class="tract-pick">
      <span>${escapeHtml(item.label)}</span>
      ${["D", "E"].map((side) => `<button type="button" class="pharma-toggle ${lesion && lesion.level === item.id && lesion.side === side ? "on" : ""}" data-atlas-tract-lesion="${item.id}:${side}">${side === "D" ? "direito" : "esquerdo"}</button>`).join("")}
    </div>`).join("");
  const describe = (sides) => (sides.length === 2 ? "dos dois lados" : sides.length ? `no lado ${ATLAS_SIDE_NAME[sides[0]]} do corpo` : "sem déficit");
  const extent = level ? (level.brain ? "em todo o hemicorpo" : level.below) : "";
  const isBrownSequard = lesion && !level.brain;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Vias motoras e sensitivas</h2>
        <p>Três vias longas, três lugares de cruzamento. Saber onde cada uma cruza é o que permite dizer onde está a lesão.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Vias que servem o lado ${ATLAS_SIDE_NAME[body]} do corpo</h3><span>esquema didático</span></div>
        <div class="segmented dem-stages" role="group" aria-label="Lado do corpo">
          <button type="button" class="${body === "D" ? "active" : ""}" data-atlas-tract-body="D" aria-pressed="${body === "D"}">Lado direito do corpo</button>
          <button type="button" class="${body === "E" ? "active" : ""}" data-atlas-tract-body="E" aria-pressed="${body === "E"}">Lado esquerdo do corpo</button>
        </div>
        ${atlasLongSvg(body, lesion)}
        <div class="atlas-legend">${data.tracts.map((tract) => `<span><i style="background:${tract.color}"></i>${escapeHtml(tract.label)} (cruza no ${tract.cross})</span>`).join("")}</div>
        <h4>Simular lesão</h4>
        <div class="tract-picks">${lesionButtons}</div>
        ${lesion ? '<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-tract-lesion="">Tirar a lesão</button></div>' : ""}
      </section>
      <section class="pharma-card">
        ${lesion ? `
          <h3>Lesão: ${escapeHtml(level.label.toLowerCase())}, lado ${ATLAS_SIDE_NAME[lesion.side]}</h3>
          <div class="tract-bodies">${deficits.map(({ tract, sides }) => `<figure>${atlasBodyFigure(tract.id, sides, lesion.level, tract.color)}<figcaption>${escapeHtml(tract.short)}</figcaption></figure>`).join("")}</div>
          ${deficits.map(({ tract, sides }) => `<div class="pharma-reading tone-${sides.length ? "high" : "low"}"><strong>${escapeHtml(tract.short)}: ${describe(sides)}${sides.length ? `, ${escapeHtml(extent)}` : ""}</strong><span>${sides.length ? escapeHtml(tract.deficit) : "Esta via não passa por aqui deste lado."}</span></div>`).join("")}
          ${isBrownSequard ? `<div class="pharma-reading tone-warn"><strong>Síndrome de Brown-Séquard</strong><span>${escapeHtml(data.brownSequard)}</span></div>` : `<div class="pharma-reading tone-warn"><strong>Acima das decussações</strong><span>Lesões no encéfalo, acima do bulbo, dão déficits do lado oposto do corpo para as três vias.</span></div>`}`
          : `<h3>Onde cada via cruza</h3>${data.tracts.map((tract) => `<div class="pharma-reading tone-ok"><strong style="color:${tract.color}">${escapeHtml(tract.label)}</strong><span>${escapeHtml(tract.note)}</span></div>`).join("")}`}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: não mostra a face (via corticonuclear), as áreas exatas do córtex nem o trato corticoespinal anterior.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-vias-longas", label: "Vias motoras e sensitivas" }, "paths", lesion ? "Lesão" : "Vias") : ""}`;
}

/* ---------- Via óptica: lesões A a F e defeitos de campo visual ---------- */

function atlasFieldSvg(eye, blind) {
  /* Campo visual visto pelo paciente: no olho esquerdo, o campo temporal fica à esquerda;
     no direito, à direita. */
  const temporalLeft = eye === "OE";
  const quad = { ts: [temporalLeft ? 0 : 1, 0], ti: [temporalLeft ? 0 : 1, 1], ns: [temporalLeft ? 1 : 0, 0], ni: [temporalLeft ? 1 : 0, 1] };
  const parts = Object.entries(quad).map(([id, [col, row]]) => {
    const x = col ? 50 : 10;
    const y = row ? 50 : 10;
    const d = `M50 50 L${col ? 90 : 10} 50 A40 40 0 0 ${col === row ? 1 : 0} 50 ${row ? 90 : 10} Z`;
    return `<path d="${d}" class="field-quad${blind.includes(id) ? " blind" : ""}"></path>`;
  }).join("");
  return `
    <svg viewBox="0 0 100 112" class="field-eye" role="img" aria-label="Campo visual do olho ${eye === "OE" ? "esquerdo" : "direito"}">
      ${parts}
      <circle cx="50" cy="50" r="40" class="field-ring"></circle>
      <line x1="50" y1="10" x2="50" y2="90" class="field-axis"></line><line x1="10" y1="50" x2="90" y2="50" class="field-axis"></line>
      <text x="${temporalLeft ? 14 : 86}" y="108" text-anchor="middle" class="field-label">T</text>
      <text x="${temporalLeft ? 86 : 14}" y="108" text-anchor="middle" class="field-label">N</text>
    </svg>`;
}

function atlasOpticSvg(lesion) {
  const points = { A: [470, 110], B: [380, 175], C: [478, 172], D: [461, 238], E: [486, 330], F: [452, 418] };
  const markers = Object.entries(points).map(([id, [x, y]]) => `<g class="optic-mark${lesion?.id === id ? " on" : ""}" data-atlas-optic="${id}"><circle cx="${x}" cy="${y}" r="13"></circle><text x="${x}" y="${y + 5}" text-anchor="middle">${id}</text></g>`).join("");
  return `
    <svg class="atlas-svg optic-svg" viewBox="150 20 460 430" role="img" aria-label="Via óptica vista de cima, com os pontos de lesão A a F">
      <circle cx="290" cy="60" r="34" class="optic-eye"></circle><text x="290" y="64" text-anchor="middle" class="optic-text">OE</text>
      <circle cx="470" cy="60" r="34" class="optic-eye"></circle><text x="470" y="64" text-anchor="middle" class="optic-text">OD</text>
      <path d="M300 92 L380 170 L470 260" class="optic-fiber nasal"></path>
      <path d="M460 92 L380 170 L290 260" class="optic-fiber nasal"></path>
      <path d="M262 84 C268 140 300 190 292 256" class="optic-fiber temporal"></path>
      <path d="M498 84 C492 140 460 190 468 256" class="optic-fiber temporal"></path>
      <ellipse cx="290" cy="268" rx="22" ry="12" class="optic-lgn"></ellipse>
      <ellipse cx="470" cy="268" rx="22" ry="12" class="optic-lgn"></ellipse>
      <path d="M290 280 C260 330 270 380 310 420" class="optic-radiation"></path>
      <path d="M470 280 C500 330 490 380 450 420" class="optic-radiation"></path>
      <path d="M260 430 Q310 400 360 430" class="optic-cortex"></path>
      <path d="M400 430 Q450 400 500 430" class="optic-cortex"></path>
      <text x="380" y="150" text-anchor="middle" class="optic-text small">quiasma</text>
      <text x="160" y="300" class="optic-text small">corpo geniculado</text>
      <text x="170" y="360" class="optic-text small">radiação</text>
      <text x="380" y="448" text-anchor="middle" class="optic-text small">córtex visual (área 17)</text>
      ${markers}
    </svg>`;
}

function renderAtlasOptic() {
  const optic = window.ATLAS.optic;
  const lesion = optic.lesions.find((item) => item.id === state.atlas.optic) || null;
  const refCount = ((window.PHARMA_REFS || {})["atlas-via-optica"]?.paths || []).length;
  const buttons = optic.lesions.map((item) => `<button type="button" class="pharma-toggle ${lesion?.id === item.id ? "on" : ""}" data-atlas-optic="${item.id}"><b>${item.id}</b> ${escapeHtml(item.label)}</button>`).join("");
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Via óptica</h2>
        <p>As fibras das retinas nasais cruzam no quiasma; as temporais não. Por isso, antes do quiasma o defeito é de um olho, no quiasma é heterônimo e depois dele é homônimo.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Vista de cima</h3><span>toque numa letra para lesionar</span></div>
        ${atlasOpticSvg(lesion)}
        <div class="atlas-legend"><span><i style="background:#0072b2"></i>fibras da retina nasal (cruzam)</span><span><i style="background:#d55e00"></i>fibras da retina temporal (não cruzam)</span></div>
        <div class="pharma-toggles optic-buttons">${buttons}</div>
      </section>
      <section class="pharma-card">
        <h3>Campos visuais</h3>
        <div class="field-pair">
          <figure>${atlasFieldSvg("OE", lesion?.blind.OE || [])}<figcaption>Olho esquerdo</figcaption></figure>
          <figure>${atlasFieldSvg("OD", lesion?.blind.OD || [])}<figcaption>Olho direito</figcaption></figure>
        </div>
        ${lesion
          ? `<div class="pharma-reading tone-high"><strong>${lesion.id}. ${escapeHtml(lesion.name)}</strong><span>${escapeHtml(lesion.text)}</span></div>`
          : '<div class="pharma-reading tone-low"><strong>Sem lesão</strong><span>Escolha um ponto de A a F. Em preto, a parte do campo visual que se perde (T = temporal, N = nasal).</span></div>'}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: não considera a sobreposição parcial dos campos dos dois olhos.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-via-optica", label: "Via óptica" }, "paths", lesion ? lesion.name : "Via óptica") : ""}`;
}

function renderAtlas() {
  if (state.atlas.module === "vias-longas") return renderAtlasLong();
  if (state.atlas.module === "via-optica") return renderAtlasOptic();
  if (state.atlas.module === "hha") return renderAtlasHpa();
  if (state.atlas.module === "neurotransmissores") return renderAtlasNeuro();
  if (state.atlas.module === "limbico") return renderAtlasLimbic();
  if (state.atlas.module === "nucleos-base") return renderAtlasBasal();
  if (state.atlas.module === "frontoestriatais") return renderAtlasFronto();
  return null;
}

(function setupAtlas() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-atlas-module], [data-atlas-home], [data-atlas-scenario], [data-atlas-step], [data-atlas-link], [data-sim-section], [data-atlas-circuit], [data-atlas-lesion], [data-atlas-limbic], [data-atlas-system], [data-atlas-drugs], [data-atlas-hpa], [data-atlas-dex], [data-atlas-tract-body], [data-atlas-tract-lesion], [data-atlas-optic], [data-atlas-goto]");
    if (!target) return;
    const data = target.dataset;
    if (data.atlasGoto) {
      /* "Ver no atlas" a partir de uma classe de fármacos. */
      const link = PHARMA_ATLAS_LINKS[data.atlasGoto];
      state.pharma.section = "atlas";
      state.pharma.view = "hub";
      state.atlas.module = link.module;
      state.atlas.step = null;
      if (link.scenario) state.atlas.scenario = link.scenario;
      if (link.system) state.atlas.system = link.system;
    } else if (data.simSection) {
      state.pharma.section = data.simSection;
      state.pharma.view = "hub";
      state.atlas.module = null;
    } else if (data.atlasModule) {
      state.atlas.module = data.atlasModule;
      state.atlas.step = null;
      state.atlas.lesionAt = null;
      state.atlas.limbicLesion = null;
    } else if (data.atlasHome !== undefined) state.atlas.module = null;
    else if (data.atlasScenario) state.atlas.scenario = data.atlasScenario;
    else if (data.atlasCircuit) {
      state.atlas.circuit = data.atlasCircuit;
      state.atlas.lesionAt = null;
    } else if (data.atlasLesion !== undefined) state.atlas.lesionAt = data.atlasLesion || null;
    else if (data.atlasSystem) state.atlas.system = data.atlasSystem;
    else if (data.atlasHpa) state.atlas.hpa = data.atlasHpa;
    else if (data.atlasTractBody) state.atlas.tractBody = data.atlasTractBody;
    else if (data.atlasTractLesion !== undefined) {
      const [level, side] = data.atlasTractLesion.split(":");
      state.atlas.tractLesion = level ? { level, side } : null;
    } else if (data.atlasOptic) state.atlas.optic = state.atlas.optic === data.atlasOptic ? null : data.atlasOptic;
    else if (data.atlasDex !== undefined) state.atlas.dex = !state.atlas.dex;
    else if (data.atlasDrugs) {
      state.pharma.section = "drugs";
      setPharmaClass(data.atlasDrugs);
      state.pharma.view = "class";
      state.pharma.mode = "paths";
    } else if (data.atlasLimbic !== undefined) {
      state.atlas.limbicLesion = data.atlasLimbic || null;
      state.atlas.step = null;
    }
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
    if (typeof syncSimTabs === "function") syncSimTabs();
    if (data.atlasGoto || data.atlasModule || data.atlasHome !== undefined || data.atlasLink || data.atlasDrugs || data.simSection) panel.scrollIntoView({ block: "start" });
  });
})();
