/* Neuroanatomia, "Vias e lesões": nervos cranianos (tronco encefálico) e territórios arteriais.
   Usa os dados de data/atlasClinical.js e entra no despacho de renderAtlas() de js/atlas.js. */

/* ---------- Nervos cranianos e tronco encefálico ---------- */

const CN_LABELS = [
  ["III", 96, 142, 106], ["IV", 122, 96, 118, true], ["V", 168, 48, 170], ["VII", 214, 98, 236], ["VIII", 232, 104, 241],
  ["VI", 252, 140, 240], ["IX", 274, 108, 272], ["X", 294, 110, 292], ["XI", 314, 112, 316], ["XII", 344, 130, 340],
];
const CN_LEVEL_BANDS = { mesencefalo: [20, 118], ponte: [118, 234], bulbo: [234, 400] };

function atlasBrainstemSvg(lesion) {
  const data = window.ATLAS.cranial;
  const outline = "M78 20 H222 L204 118 C246 122 256 150 256 176 C256 206 244 228 204 232 L194 240 L184 400 H116 L106 240 L96 232 C56 228 44 206 44 176 C44 150 54 122 96 118 Z";
  const band = lesion ? CN_LEVEL_BANDS[lesion.level] : null;
  const nerves = CN_LABELS.map(([n, ly, px, py, behind]) => `
    <line x1="34" y1="${ly - 4}" x2="${px}" y2="${py}" class="cn-nerve${behind ? " behind" : ""}"></line>
    <text x="10" y="${ly}" class="cn-nerve-label">${n}</text>`).join("");
  const markers = data.lesions.map((item) => `
    <g class="cn-mark${lesion?.id === item.id ? " on" : ""}" data-atlas-cn="${item.id}" role="button" aria-label="${escapeHtml(item.name)}">
      <circle cx="${item.marker[0]}" cy="${item.marker[1]}" r="11"></circle>
      <text x="${item.marker[0]}" y="${item.marker[1] + 4}" text-anchor="middle">${item.n}</text>
    </g>`).join("");
  const levels = data.levels.map((level) => {
    const [top, bottom] = CN_LEVEL_BANDS[level.id];
    return `<text x="264" y="${(top + bottom) / 2}" class="cn-level-label">${escapeHtml(level.label)}</text>
      <text x="264" y="${(top + bottom) / 2 + 15}" class="cn-level-sub">${escapeHtml(level.nerves)}</text>`;
  }).join("");
  return `
    <svg class="atlas-svg cn-svg" viewBox="0 0 356 412" role="img" aria-label="Tronco encefálico em vista anterior, com os nervos cranianos e os pontos de lesão">
      <defs><clipPath id="cn-stem"><path d="${outline}"></path></clipPath></defs>
      <path d="${outline}" class="cn-stem"></path>
      ${band ? `<rect x="40" y="${band[0]}" width="220" height="${band[1] - band[0]}" class="cn-band" clip-path="url(#cn-stem)"></rect>` : ""}
      <path d="M118 22 L146 112 M182 22 L154 112" class="cn-detail"></path>
      <path d="M62 150 C110 140 190 140 238 150 M58 190 C110 200 190 200 242 190" class="cn-detail"></path>
      <path d="M150 240 V400 M134 244 V396 M166 244 V396" class="cn-detail"></path>
      <ellipse cx="116" cy="290" rx="8" ry="22" class="cn-olive"></ellipse><ellipse cx="184" cy="290" rx="8" ry="22" class="cn-olive"></ellipse>
      <line x1="40" y1="118" x2="260" y2="118" class="cn-divider"></line>
      <line x1="40" y1="234" x2="260" y2="234" class="cn-divider"></line>
      ${levels}${nerves}${markers}
      <text x="150" y="410" text-anchor="middle" class="cn-level-sub">pirâmides e decussação</text>
    </svg>`;
}

function atlasSectionSvg(lesion) {
  const data = window.ATLAS.cranial;
  const section = data.sections[lesion.level];
  const level = data.levels.find((item) => item.id === lesion.level);
  const hit = new Set(lesion.hit);
  const shade = lesion.shade;
  const parts = section.parts.map((part) => {
    const on = hit.has(part.id);
    const mirror = part.x === 160 ? "" : `<circle cx="${320 - part.x}" cy="${part.y}" r="${part.r}" class="cn-part${part.hole ? " hole" : ""}${lesion.both && on ? " hit" : ""}"></circle>`;
    return `${mirror}<circle cx="${part.x}" cy="${part.y}" r="${part.r}" class="cn-part${part.hole ? " hole" : ""}${on ? " hit" : ""}"></circle>
      <text x="${part.lx ?? part.x + part.r + 4}" y="${part.ly ?? part.y + 4}" class="cn-part-label${on ? " hit" : ""}">${escapeHtml(part.label)}</text>`;
  }).join("");
  const fibers = section.fibers.map((fiber) => {
    const on = hit.has(fiber.id);
    return `<path d="${fiber.d}" class="cn-fiber${on ? " hit" : ""}"></path><path d="${fiber.d}" transform="translate(320,0) scale(-1,1)" class="cn-fiber${lesion.both && on ? " hit" : ""}"></path>`;
  }).join("");
  return `
    <svg class="atlas-svg cn-section" viewBox="0 0 384 230" role="img" aria-label="Corte do ${escapeHtml(level.label.toLowerCase())} com a área lesada">
      <defs><clipPath id="cn-cut"><path d="${section.outline}"></path></clipPath></defs>
      <path d="${section.outline}" class="cn-stem"></path>
      ${section.hole ? `<path d="${section.hole}" class="cn-hole"></path>` : ""}
      ${section.dividers.map((d) => `<path d="${d}" class="cn-divider" clip-path="url(#cn-cut)"></path>`).join("")}
      <ellipse cx="${shade.cx}" cy="${shade.cy}" rx="${shade.rx}" ry="${shade.ry}" class="cn-shade" clip-path="url(#cn-cut)"></ellipse>
      ${section.zones.map(([name, x, y]) => `<text x="${x}" y="${y}" class="cn-zone">${name}</text>`).join("")}
      <line x1="160" y1="14" x2="160" y2="212" class="cn-midline"></line>
      ${fibers}${parts}
      <text x="100" y="224" text-anchor="middle" class="cn-level-sub">${lesion.both ? "dos dois lados" : "lado oposto"}</text>
      <text x="220" y="224" text-anchor="middle" class="cn-level-sub">${lesion.both ? "" : "lado da lesão"}</text>
      <text x="4" y="16" class="cn-level-sub">↑ dorsal</text>
    </svg>`;
}

function atlasFaceSvg(type) {
  /* Paciente de frente: o lado direito dele fica à esquerda de quem olha. Lesão à direita. */
  const info = window.ATLAS.cranial.face[type];
  const leftSide = type === "periferica"; /* periférica direita: metade esquerda do desenho */
  const x = leftSide ? 0 : 80;
  const top = info.upper ? 0 : 92;
  const mouth = leftSide ? "M58 128 Q80 136 102 124" : "M58 124 Q80 136 102 128";
  const eye = (cx, weak) => weak
    ? `<ellipse cx="${cx}" cy="78" rx="11" ry="9" class="face-eye open"></ellipse><circle cx="${cx}" cy="80" r="3.5" class="face-pupil"></circle>`
    : `<ellipse cx="${cx}" cy="78" rx="11" ry="5" class="face-eye"></ellipse><circle cx="${cx}" cy="78" r="3" class="face-pupil"></circle>`;
  const wrinkles = (from, to, weak) => weak ? "" : [38, 46, 54].map((y) => `<path d="M${from} ${y} Q${(from + to) / 2} ${y - 4} ${to} ${y}" class="face-line"></path>`).join("");
  const upperWeakLeft = info.upper && leftSide;
  return `
    <svg viewBox="0 0 160 186" class="face-svg" role="img" aria-label="Paralisia facial ${escapeHtml(info.label.toLowerCase())}">
      <defs><clipPath id="face-clip"><ellipse cx="80" cy="92" rx="58" ry="76"></ellipse></clipPath></defs>
      <ellipse cx="80" cy="92" rx="58" ry="76" class="face-shape"></ellipse>
      <rect x="${x}" y="${top}" width="80" height="${180 - top}" class="face-weak" clip-path="url(#face-clip)"></rect>
      <line x1="80" y1="18" x2="80" y2="166" class="face-mid"></line>
      ${wrinkles(36, 72, upperWeakLeft)}${wrinkles(88, 124, false)}
      ${eye(56, upperWeakLeft)}${eye(104, false)}
      <path d="M80 92 L74 112 H86" class="face-line"></path>
      <path d="${mouth}" class="face-mouth"></path>
      <text x="40" y="184" text-anchor="middle" class="tract-body-side">D</text>
      <text x="120" y="184" text-anchor="middle" class="tract-body-side">E</text>
    </svg>`;
}

function renderAtlasCranial() {
  const data = window.ATLAS.cranial;
  const lesion = data.lesions.find((item) => item.id === state.atlas.cn) || null;
  const faceType = state.atlas.face === "central" ? "central" : "periferica";
  const face = data.face[faceType];
  const refCount = ((window.PHARMA_REFS || {})["atlas-nervos-cranianos"]?.paths || []).length;
  const buttons = data.lesions.map((item) => `<button type="button" class="pharma-toggle ${lesion?.id === item.id ? "on" : ""}" data-atlas-cn="${item.id}"><b>${item.n}</b> ${escapeHtml(item.name.replace("Síndrome de ", "").replace("Síndrome do ", ""))}</button>`).join("");
  const list = (items, tone, title) => items?.length
    ? `<div class="pharma-reading tone-${tone}"><strong>${title}</strong><span>${items.map((text) => `• ${escapeHtml(text)}`).join("<br>")}</span></div>` : "";
  const levelName = lesion ? data.levels.find((item) => item.id === lesion.level).label : "";
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Nervos cranianos e tronco encefálico</h2>
        <p>${escapeHtml(data.rule)}</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid cn-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Vista anterior</h3><span>toque num número para lesionar</span></div>
        ${atlasBrainstemSvg(lesion)}
        <h4>Simular lesão</h4>
        <div class="pharma-toggles optic-buttons cn-buttons">${buttons}</div>
        ${lesion ? '<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-cn="">Tirar a lesão</button></div>' : ""}
      </section>
      <section class="pharma-card">
        ${lesion ? `
          <h3>${escapeHtml(lesion.name)}</h3>
          <p class="cn-where">${escapeHtml(levelName)} · ${escapeHtml(lesion.where)}</p>
          ${atlasSectionSvg(lesion)}
          ${list(lesion.same, "high", "Do lado da lesão")}
          ${list(lesion.opposite, "warn", "Do lado oposto")}
          ${list(lesion.bilateral, "high", "Dos dois lados")}
          ${lesion.note ? `<div class="pharma-reading tone-ok"><strong>Preservado</strong><span>${escapeHtml(lesion.note)}</span></div>` : ""}
          <div class="pharma-reading tone-low"><strong>Causa típica</strong><span>${escapeHtml(lesion.cause)}</span></div>
          ${lesion.psych ? `<div class="pharma-reading tone-ok"><strong>Correlação clínica</strong><span>${escapeHtml(lesion.psych)}</span></div>` : ""}`
          : `<h3>Nervos do tronco, por nível</h3>
            <div class="cn-table">${data.levels.map((level) => `
              <p class="atlas-group">${escapeHtml(level.label)}</p>
              ${data.nerves.filter((nerve) => nerve.level === level.id).map((nerve) => `<div class="cn-row"><b>${nerve.n}</b><span><strong>${escapeHtml(nerve.name)}</strong> ${escapeHtml(nerve.role)}</span></div>`).join("")}`).join("")}
            </div>
            <div class="pharma-reading tone-ok"><strong>Para a prova e para a clínica</strong><span>${escapeHtml(data.cognition)}</span></div>`}
      </section>
      <section class="pharma-card cn-face-card">
        <div class="pharma-card-head"><h3>Paralisia facial: central ou periférica?</h3><span>lesão do lado direito</span></div>
        <div class="segmented dem-stages" role="group" aria-label="Tipo de paralisia facial">
          ${["periferica", "central"].map((type) => `<button type="button" class="${faceType === type ? "active" : ""}" data-atlas-face="${type}" aria-pressed="${faceType === type}">${data.face[type].label}</button>`).join("")}
        </div>
        <div class="cn-face">
          <figure>${atlasFaceSvg(faceType)}<figcaption>Em cor, a parte da face paralisada</figcaption></figure>
          <div class="pharma-reading tone-high"><strong>${escapeHtml(face.where)}</strong><span>${escapeHtml(face.text)}</span></div>
        </div>
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: os cortes juntam estruturas de alturas um pouco diferentes do mesmo nível e não mostram todos os núcleos.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-nervos-cranianos", label: "Nervos cranianos" }, "paths", lesion ? lesion.name : "Tronco encefálico") : ""}`;
}

/* ---------- Territórios arteriais ---------- */

const ARTERY_LATERAL = "M24 96 C18 52 62 16 128 14 C194 12 240 44 242 92 C244 118 232 136 214 140 C204 156 178 160 158 150 C138 160 106 162 92 144 C78 154 44 146 34 124 C28 114 25 106 24 96 Z";
const ARTERY_HEMI = "M128 16 C84 12 34 32 24 82 C18 116 30 148 54 166 C68 176 86 172 96 160 C104 168 118 170 128 164 Z";


function atlasArteryLateralSvg(selected) {
  const sel = (ids) => (!selected ? 0.55 : ids.includes(selected.id) && !selected.deep ? 0.95 : 0.12);
  return `
    <svg viewBox="0 0 260 172" class="artery-svg" role="img" aria-label="Face lateral do hemisfério com os territórios arteriais">
      <defs><clipPath id="art-lat"><path d="${ARTERY_LATERAL}"></path></clipPath></defs>
      <g clip-path="url(#art-lat)">
        <rect x="0" y="0" width="260" height="180" fill="#d55e00" opacity="${sel(["acm-esq", "acm-dir"])}"></rect>
        <path d="M206 30 L270 36 L270 180 L104 180 L116 156 C150 152 188 140 200 110 C206 88 210 60 206 30 Z" class="artery-under"></path>
        <path d="M206 30 L270 36 L270 180 L104 180 L116 156 C150 152 188 140 200 110 C206 88 210 60 206 30 Z" fill="#009e73" opacity="${sel(["acp-esq", "acp-bi"])}"></path>
        <path d="M14 70 C36 18 120 -2 214 30 L208 44 C130 16 58 28 30 82 Z" class="artery-under"></path>
        <path d="M14 70 C36 18 120 -2 214 30 L208 44 C130 16 58 28 30 82 Z" fill="#0072b2" opacity="${sel(["aca"])}"></path>
      </g>
      <path d="${ARTERY_LATERAL}" class="artery-outline"></path>
      <path d="M72 102 C108 92 140 96 172 110" class="artery-fissure"></path>
      <path d="M128 16 C122 46 116 70 112 96" class="artery-fissure"></path>
      <text x="30" y="166" class="artery-label">frente</text>
      <text x="236" y="166" text-anchor="end" class="artery-label">trás</text>
    </svg>`;
}

function atlasArteryCoronalSvg(selected) {
  /* Corte coronal com o lado direito do paciente à esquerda de quem olha (como na imagem). */
  const half = (patientSide) => {
    const hemiOk = selected && (selected.hemi === "both" || selected.hemi === patientSide);
    const op = (ids) => (!selected ? 0.55 : ids.includes(selected.id) && hemiOk ? 0.95 : 0.12);
    return `
      <g clip-path="url(#art-hemi)">
        <rect x="0" y="0" width="130" height="190" fill="#d55e00" opacity="${op(["acm-esq", "acm-dir"])}"></rect>
        <path d="M128 0 L94 0 C98 40 106 64 128 76 Z" class="artery-under"></path>
        <path d="M128 0 L94 0 C98 40 106 64 128 76 Z" fill="#0072b2" opacity="${op(["aca"])}"></path>
        <path d="M128 98 C112 98 100 108 98 122 C90 140 80 156 60 172 L128 190 Z" class="artery-under"></path>
        <path d="M128 98 C112 98 100 108 98 122 C90 140 80 156 60 172 L128 190 Z" fill="#009e73" opacity="${op(["acp-esq", "acp-bi"])}"></path>
      </g>
      <path d="M72 62 C88 54 106 56 110 62 L112 98 C106 110 96 116 80 112 C68 104 64 80 72 62 Z" fill="#e69f00" opacity="${selected?.id === "acm-prof" && hemiOk ? 0.95 : selected ? 0 : 0.4}"></path>
      <path d="M98 104 L112 102 L114 128 L94 134 Z" fill="#cc79a7" opacity="${selected?.id === "coroidea" && hemiOk ? 0.95 : selected ? 0 : 0.4}"></path>
      <path d="${ARTERY_HEMI}" class="artery-outline"></path>
      <ellipse cx="121" cy="72" rx="6" ry="11" class="artery-ventricle"></ellipse>
      <ellipse cx="108" cy="72" rx="7" ry="9" class="artery-deep"></ellipse>
      <ellipse cx="82" cy="94" rx="12" ry="18" class="artery-deep"></ellipse>
      <ellipse cx="117" cy="112" rx="11" ry="11" class="artery-deep"></ellipse>
      <path d="M97 64 L104 64 L108 118 L99 120 Z" class="artery-capsule"></path>
      <ellipse cx="92" cy="146" rx="9" ry="6" class="artery-deep"></ellipse>`;
  };
  return `
    <svg viewBox="0 0 260 196" class="artery-svg" role="img" aria-label="Corte coronal com os territórios arteriais superficiais e profundos">
      <defs><clipPath id="art-hemi"><path d="${ARTERY_HEMI}"></path></clipPath></defs>
      <g>${half("D")}</g>
      <g transform="translate(260,0) scale(-1,1)">${half("E")}</g>
      <text x="40" y="192" text-anchor="middle" class="tract-body-side">D</text>
      <text x="220" y="192" text-anchor="middle" class="tract-body-side">E</text>
    </svg>`;
}

function atlasArteryBody(selected) {
  /* Bonequinho de frente; o déficit fica do lado oposto ao hemisfério lesado. */
  const shape = "M60 40 C40 40 32 46 30 60 L22 112 L32 114 L40 70 L40 130 L36 196 L50 196 L58 136 L62 136 L70 196 L84 196 L80 130 L80 70 L88 114 L98 112 L90 60 C88 46 80 40 60 40 Z";
  const body = selected.hemi === "D" ? "E" : "D";
  const left = body === "D"; /* lado direito do paciente fica à esquerda do desenho */
  const parts = selected.body || {};
  const fill = selected.color;
  const regions = [];
  if (parts.face) regions.push(`<rect x="${left ? 40 : 60}" y="6" width="20" height="32" fill="${fill}" opacity="${parts.face * 0.8}" clip-path="url(#art-head)"></rect>`);
  if (parts.arm) regions.push(`<rect x="${left ? 18 : 78}" y="52" width="24" height="66" fill="${fill}" opacity="${parts.arm * 0.8}" clip-path="url(#art-body)"></rect>`);
  if (parts.leg) regions.push(`<rect x="${left ? 30 : 60}" y="128" width="30" height="72" fill="${fill}" opacity="${parts.leg * 0.8}" clip-path="url(#art-body)"></rect>`);
  return `
    <svg viewBox="0 0 120 210" class="tract-body" aria-hidden="true">
      <defs><clipPath id="art-body"><path d="${shape}"></path></clipPath><clipPath id="art-head"><circle cx="60" cy="22" r="15"></circle></clipPath></defs>
      <circle cx="60" cy="22" r="15" class="tract-body-shape"></circle>
      <path d="${shape}" class="tract-body-shape"></path>
      ${regions.join("")}
      <text x="30" y="208" text-anchor="middle" class="tract-body-side">D</text>
      <text x="90" y="208" text-anchor="middle" class="tract-body-side">E</text>
    </svg>`;
}

function arteryBlindFields(selected) {
  if (!selected?.field) return { OE: [], OD: [] };
  if (selected.hemi === "both") return { OE: ["ts", "ti", "ns", "ni"], OD: ["ts", "ti", "ns", "ni"] };
  /* Hemisfério direito → perde a metade esquerda do campo (temporal do OE, nasal do OD). */
  return selected.hemi === "D" ? { OE: ["ts", "ti"], OD: ["ns", "ni"] } : { OE: ["ns", "ni"], OD: ["ts", "ti"] };
}

function renderAtlasArteries() {
  const data = window.ATLAS.arteries;
  const selected = data.list.find((item) => item.id === state.atlas.artery) || null;
  const refCount = ((window.PHARMA_REFS || {})["atlas-territorios"]?.paths || []).length;
  const buttons = data.list.map((item) => `<button type="button" class="pharma-toggle ${selected?.id === item.id ? "on" : ""}" data-atlas-artery="${item.id}"><i class="artery-dot" style="background:${item.color}"></i>${escapeHtml(item.label)}</button>`).join("");
  const hemiText = selected ? (selected.hemi === "both" ? "dois hemisférios" : `hemisfério ${selected.hemi === "D" ? "direito" : "esquerdo"}`) : "";
  const blind = arteryBlindFields(selected);
  const hasBody = selected && Object.keys(selected.body || {}).length;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Territórios arteriais</h2>
        <p>Cada artéria irriga um pedaço do encéfalo. Saber o que existe em cada território permite prever o quadro de um AVC: a perna na cerebral anterior, face e braço na cerebral média, a visão na cerebral posterior.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid cn-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Mapa dos territórios</h3><span>esquema didático</span></div>
        <div class="artery-views">
          <figure>${atlasArteryLateralSvg(selected)}<figcaption>Face lateral</figcaption></figure>
          <figure>${atlasArteryCoronalSvg(selected)}<figcaption>Corte coronal</figcaption></figure>
        </div>
        <div class="atlas-legend">
          <span><i style="background:#0072b2"></i>cerebral anterior</span><span><i style="background:#d55e00"></i>cerebral média</span>
          <span><i style="background:#e69f00"></i>lenticuloestriadas</span><span><i style="background:#cc79a7"></i>coróidea anterior</span><span><i style="background:#009e73"></i>cerebral posterior</span>
        </div>
        <h4>Simular oclusão</h4>
        <div class="pharma-toggles artery-buttons">${buttons}</div>
        ${selected ? '<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-artery="">Tirar a oclusão</button></div>' : ""}
      </section>
      <section class="pharma-card">
        ${selected ? `
          <h3>${escapeHtml(selected.label)}</h3>
          <p class="cn-where">${escapeHtml(hemiText)}${selected.deep ? " · território profundo (veja o corte coronal)" : ""}</p>
          <div class="artery-effects${hasBody && selected.field ? "" : " solo"}">
            ${hasBody ? `<figure>${atlasArteryBody(selected)}<figcaption>Força e sensibilidade</figcaption></figure>` : ""}
            ${selected.field ? `<div class="field-pair">
              <figure>${atlasFieldSvg("OE", blind.OE)}<figcaption>Olho esquerdo</figcaption></figure>
              <figure>${atlasFieldSvg("OD", blind.OD)}<figcaption>Olho direito</figcaption></figure>
            </div>` : ""}
          </div>
          <div class="pharma-reading tone-low"><strong>O que irriga</strong><span>${escapeHtml(selected.where)}</span></div>
          <div class="pharma-reading tone-high"><strong>Quadro</strong><span>${selected.deficits.map((text) => `• ${escapeHtml(text)}`).join("<br>")}</span></div>
          ${selected.bilateral ? `<div class="pharma-reading tone-warn"><strong>Dos dois lados</strong><span>${escapeHtml(selected.bilateral)}</span></div>` : ""}
          ${selected.psych ? `<div class="pharma-reading tone-ok"><strong>Correlação clínica</strong><span>${escapeHtml(selected.psych)}</span></div>` : ""}
          ${selected.goto ? `<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-module="${selected.goto.module}">Ver ${escapeHtml(selected.goto.label)} ›</button></div>` : ""}`
          : `<h3>Escolha uma artéria</h3>
            <div class="pharma-reading tone-ok"><strong>Regra prática</strong><span>Déficit maior na perna: cerebral anterior. Face e braço mais que a perna, com afasia ou negligência: cerebral média. Hemianopsia sem fraqueza: cerebral posterior. Hemicorpo inteiro por igual, sem sinais corticais: lesão pequena e profunda, na cápsula interna.</span></div>
            <div class="pharma-reading tone-low"><strong>Tronco encefálico</strong><span>${escapeHtml(data.basilar)}</span></div>
            <div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-module="nervos-cranianos">Ver Nervos cranianos ›</button></div>`}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: os limites entre territórios variam de pessoa para pessoa, e o corte junta estruturas de alturas diferentes.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-territorios", label: "Territórios arteriais" }, "paths", selected ? selected.label : "Territórios") : ""}`;
}

/* ---------- Afasias ---------- */

function aphasiaFromAnswers(q) {
  const data = window.ATLAS.aphasia;
  if (!q || [q.fluent, q.comp, q.rep].some((v) => v === undefined || v === null)) return null;
  return data.syndromes.find((s) => s.answers.fluent === q.fluent && s.answers.comp === q.comp && s.answers.rep === q.rep) || null;
}

function atlasAphasiaSvg(selected) {
  const data = window.ATLAS.aphasia;
  const hit = new Set(selected ? selected.regions : []);
  const shades = Object.entries(data.regions).filter(([id]) => hit.has(id)).map(([, r]) => `<ellipse cx="${r.cx}" cy="${r.cy}" rx="${r.rx}" ry="${r.ry}" class="aph-lesion" clip-path="url(#aph-brain)"></ellipse>`).join("");
  const label = (id, x, y, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="aph-label${hit.has(id) ? " on" : ""}">${escapeHtml(data.regions[id].label)}</text>`;
  return `
    <svg viewBox="12 8 240 162" class="artery-svg aph-svg" role="img" aria-label="Hemisfério esquerdo visto pela esquerda, com as áreas da linguagem">
      <defs><clipPath id="aph-brain"><path d="${ARTERY_LATERAL}"></path></clipPath></defs>
      <path d="${ARTERY_LATERAL}" class="aph-brain"></path>
      <path d="M72 102 C108 92 140 96 172 110" class="artery-fissure"></path>
      <path d="M128 16 C122 46 116 70 112 96" class="artery-fissure"></path>
      ${shades}
      <ellipse cx="74" cy="90" rx="17" ry="11" class="aph-area"></ellipse>
      <ellipse cx="168" cy="120" rx="19" ry="11" class="aph-area"></ellipse>
      <path d="M84 82 C102 66 150 66 168 109" class="aph-arcuate"></path>
      ${label("broca", 74, 93)}${label("wernicke", 168, 123)}
      <text x="124" y="62" text-anchor="middle" class="aph-label small">fascículo arqueado</text>
      ${hit.has("msa") ? label("msa", 92, 30) : ""}${hit.has("posterior") ? label("posterior", 250, 44, "end") : ""}${hit.has("angular") ? label("angular", 196, 86) : ""}${hit.has("supramarginal") ? label("supramarginal", 154, 84) : ""}${hit.has("temporalPole") ? label("temporalPole", 92, 145) : ""}
      <text x="30" y="166" class="artery-label">frente</text>
      <text x="236" y="166" text-anchor="end" class="artery-label">trás</text>
    </svg>`;
}

function renderAtlasAphasia() {
  const data = window.ATLAS.aphasia;
  const q = state.atlas.aphasiaQ || {};
  const selected = data.syndromes.find((s) => s.id === state.atlas.aphasia) || aphasiaFromAnswers(q);
  const refCount = ((window.PHARMA_REFS || {})["atlas-afasias"]?.paths || []).length;
  const answerBtn = (question, value) => {
    const on = q[question.id] === value;
    return `<button type="button" class="${on ? "active" : ""}" data-aph-q="${question.id}:${value ? "1" : "0"}" aria-pressed="${on}">${escapeHtml(value ? question.yes : question.no)}</button>`;
  };
  const chip = (level) => `<span class="aph-chip ${level}">${escapeHtml(data.levelLabels[level])}</span>`;
  const artery = selected?.artery ? window.ATLAS.arteries.list.find((a) => a.id === selected.artery) : null;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Afasias</h2>
        <p>Três perguntas classificam as afasias clássicas: a fala é fluente? compreende? repete? Lesões na frente da fissura lateral tiram a fluência; atrás, a compreensão; no arco entre elas, a repetição.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Hemisfério esquerdo</h3><span>esquema didático</span></div>
        ${atlasAphasiaSvg(selected)}
        <h4>Diagnóstico em três perguntas</h4>
        ${data.questions.map((question) => `<div class="aph-q"><span>${escapeHtml(question.label)}</span><div class="segmented dem-stages">${answerBtn(question, true)}${answerBtn(question, false)}</div></div>`).join("")}
        <h4>Ou escolha a síndrome</h4>
        <div class="pharma-toggles aph-buttons">${data.syndromes.map((s) => `<button type="button" class="pharma-toggle ${selected?.id === s.id ? "on" : ""}" data-aph-syndrome="${s.id}">${escapeHtml(s.name.replace(/^Afasia (de )?/, ""))}</button>`).join("")}</div>
        ${selected || Object.keys(q).length ? '<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-aph-syndrome="">Limpar</button></div>' : ""}
      </section>
      <section class="pharma-card">
        ${selected ? `
          <h3>${escapeHtml(selected.name)}</h3>
          <div class="aph-profile">${Object.entries(data.profileLabels).map(([key, labelText]) => `<div><b>${escapeHtml(labelText)}</b>${chip(selected.profile[key])}</div>`).join("")}</div>
          <div class="pharma-reading tone-high"><strong>Como fala</strong><span>${escapeHtml(selected.speech)}</span></div>
          <div class="pharma-reading tone-low"><strong>Onde é a lesão</strong><span>${escapeHtml(selected.lesion)}</span></div>
          <div class="pharma-reading tone-warn"><strong>Sinais associados</strong><span>${escapeHtml(selected.signs)}</span></div>
          ${selected.behavior ? `<div class="pharma-reading tone-ok"><strong>Comportamento</strong><span>${escapeHtml(selected.behavior)}</span></div>` : ""}
          ${selected.psych ? `<div class="pharma-reading tone-ok"><strong>Correlação clínica</strong><span>${escapeHtml(selected.psych)}</span></div>` : ""}
          ${artery ? `<div class="pharma-toggles"><button type="button" class="pharma-toggle" data-aph-artery="${artery.id}">Ver ${escapeHtml(artery.label.toLowerCase())} em Territórios arteriais ›</button></div>` : ""}`
          : `<h3>Responda as perguntas</h3>
            <div class="pharma-reading tone-ok"><strong>Fluente ou não fluente?</strong><span>Não fluente: pouca fala, com esforço, frases curtas; lesão anterior, em geral com hemiparesia direita. Fluente: fala solta, com parafasias; lesão posterior, muitas vezes sem déficit motor.</span></div>
            <div class="pharma-reading tone-low"><strong>Repetição</strong><span>Repetição preservada indica que o arco perissilviano (Broca, fascículo arqueado, Wernicke) está intacto: são as afasias transcorticais e a anômica.</span></div>`}
      </section>
      <section class="pharma-card cn-face-card">
        <div class="pharma-card-head"><h3>Afasia de Wernicke, delirium, esquizofrenia ou mania?</h3><span>Yudofsky, tabela 15-2</span></div>
        <div class="aph-compare-wrap">
          <table class="dose-table aph-compare">
            <thead><tr><th></th>${data.compare.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>
            <tbody>${data.compare.rows.map((row) => `<tr><th>${escapeHtml(row[0])}</th>${row.slice(1).map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        ${data.compare.tips.map((tip) => `<div class="pharma-reading tone-ok"><span>${escapeHtml(tip)}</span></div>`).join("")}
        <h4>Outros transtornos da comunicação</h4>
        ${data.others.map((o) => `<div class="pharma-reading tone-low"><strong>${escapeHtml(o.name)}</strong><span>${escapeHtml(o.text)}</span></div>`).join("")}
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: as síndromes puras são raras, os limites variam e muitas afasias mudam de tipo durante a recuperação.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-afasias", label: "Afasias" }, "paths", selected ? selected.name : "Afasias") : ""}`;
}

/* ---------- Lobos cerebrais ---------- */

function atlasLobesSvg(activeId) {
  const data = window.ATLAS.lobes;
  const lobes = data.order.map((id) => {
    const lobe = data.list[id];
    const on = id === activeId;
    return `<path d="${lobe.path}" fill="${lobe.color}" class="lobe-area${on ? " on" : ""}" opacity="${activeId ? (on ? 0.85 : 0.18) : 0.5}" data-lobe="${id}" clip-path="url(#lobe-brain)"></path>`;
  }).join("");
  const labels = data.order.map((id) => {
    const lobe = data.list[id];
    return `<text x="${lobe.labelAt[0]}" y="${lobe.labelAt[1]}" text-anchor="middle" class="lobe-label${id === activeId ? " on" : ""}" data-lobe="${id}">${escapeHtml(lobe.label)}</text>`;
  }).join("");
  return `
    <svg viewBox="12 8 240 162" class="artery-svg lobe-svg" role="img" aria-label="Hemisfério visto de lado, com os quatro lobos">
      <defs><clipPath id="lobe-brain"><path d="${ARTERY_LATERAL}"></path></clipPath></defs>
      <path d="${ARTERY_LATERAL}" class="aph-brain"></path>
      ${lobes}
      <path d="${ARTERY_LATERAL}" class="artery-outline"></path>
      <path d="M72 102 C108 92 140 96 172 110" class="artery-fissure"></path>
      <path d="M128 16 C122 46 116 70 112 96" class="artery-fissure"></path>
      ${labels}
      <text x="30" y="166" class="artery-label">frente</text>
      <text x="236" y="166" text-anchor="end" class="artery-label">trás</text>
    </svg>`;
}

function renderAtlasLobes() {
  const data = window.ATLAS.lobes;
  const lobeId = data.list[state.atlas.lobe] ? state.atlas.lobe : "frontal";
  const lobe = data.list[lobeId];
  const regionIndex = Math.min(Number(state.atlas.lobeRegion) || 0, lobe.regions.length - 1);
  const region = lobe.regions[regionIndex];
  const sides = [["E", "Esquerda"], ["D", "Direita"], ["B", "Dos dois lados"]].filter(([key]) => key !== "B" || region.B);
  const side = sides.some(([key]) => key === state.atlas.lobeSide) ? state.atlas.lobeSide : "E";
  const refCount = ((window.PHARMA_REFS || {})["atlas-lobos"]?.paths || []).length;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-atlas-home>← Neuroanatomia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Lobos cerebrais</h2>
        <p>O que se perde em cada região do córtex, e por que o lado da lesão importa: à esquerda, linguagem e material verbal; à direita, espaço, faces, música e consciência do déficit.</p>
      </div>
    </header>
    <div class="pharma-grid atlas-grid">
      <section class="pharma-card">
        <div class="pharma-card-head"><h3>Toque num lobo</h3><span>esquema didático</span></div>
        ${atlasLobesSvg(lobeId)}
        <div class="segmented dem-stages lobe-tabs" role="group" aria-label="Lobo">
          ${data.order.map((id) => `<button type="button" class="${id === lobeId ? "active" : ""}" data-lobe="${id}" aria-pressed="${id === lobeId}">${escapeHtml(data.list[id].label)}</button>`).join("")}
        </div>
        <p class="pharma-extra">${escapeHtml(lobe.intro)}</p>
        <h4>Região</h4>
        <div class="pharma-toggles">${lobe.regions.map((r, i) => `<button type="button" class="pharma-toggle ${i === regionIndex ? "on" : ""}" data-lobe-region="${i}">${escapeHtml(r.name)}</button>`).join("")}</div>
        <h4>Lado da lesão</h4>
        <div class="segmented dem-stages" role="group" aria-label="Lado da lesão">
          ${sides.map(([key, labelText]) => `<button type="button" class="${key === side ? "active" : ""}" data-lobe-side="${key}" aria-pressed="${key === side}">${labelText}</button>`).join("")}
        </div>
        <div class="pharma-reading tone-high"><strong>${escapeHtml(region.name)} · ${escapeHtml(sides.find(([key]) => key === side)[1].toLowerCase())}</strong><span>${escapeHtml(region[side])}</span></div>
        ${side !== "B" && region.E && region.D ? `<div class="lobe-compare"><div><b>Esquerda</b><span>${escapeHtml(region.E)}</span></div><div><b>Direita</b><span>${escapeHtml(region.D)}</span></div></div>` : ""}
      </section>
      <section class="pharma-card">
        <h3>Lobo ${escapeHtml(lobe.label.toLowerCase())}</h3>
        ${lobe.syndromes ? `<h4>Três síndromes frontais</h4>${lobe.syndromes.map((s) => `<div class="pharma-reading tone-low"><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.text)}</span></div>`).join("")}` : ""}
        <h4>Sinais que ajudam a localizar</h4>
        <ul class="fronto-signs">${lobe.signs.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
        <h4>Correlação clínica</h4>
        ${lobe.psych.map((p) => `<div class="pharma-reading tone-ok"><span>${escapeHtml(p)}</span></div>`).join("")}
        <div class="pharma-toggles"><button type="button" class="pharma-toggle" data-atlas-module="${lobe.link.module}">Ver ${escapeHtml(lobe.link.label)} ›</button></div>
      </section>
      <section class="pharma-card cn-face-card">
        <div class="pharma-card-head"><h3>Dominância hemisférica</h3><span>aproximação</span></div>
        <table class="dose-table lobe-dominance"><thead><tr><th>Hemisfério esquerdo</th><th>Hemisfério direito</th></tr></thead>
          <tbody>${data.dominance.left.map((l, i) => `<tr><td>${escapeHtml(l)}</td><td>${escapeHtml(data.dominance.right[i])}</td></tr>`).join("")}</tbody></table>
        <p class="pharma-extra">${escapeHtml(data.dominance.note)}</p>
      </section>
    </div>
    <p class="pharma-disclaimer">Esquema simplificado: os limites entre lobos e regiões são aproximados, lesões reais raramente respeitam uma só região e o hemisfério dominante para a linguagem é o esquerdo na maioria das pessoas.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "atlas-lobos", label: "Lobos cerebrais" }, "paths", `${lobe.label}: ${region.name}`) : ""}`;
}

/* ---------- Despacho e cliques ---------- */

const baseRenderAtlas = renderAtlas;
renderAtlas = function renderAtlasWithClinical() {
  if (state.atlas.module === "nervos-cranianos") return renderAtlasCranial();
  if (state.atlas.module === "territorios-arteriais") return renderAtlasArteries();
  if (state.atlas.module === "afasias") return renderAtlasAphasia();
  if (state.atlas.module === "lobos") return renderAtlasLobes();
  return baseRenderAtlas();
};

(function setupAtlasClinical() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-atlas-cn], [data-atlas-face], [data-atlas-artery], [data-aph-q], [data-aph-syndrome], [data-aph-artery], [data-lobe], [data-lobe-region], [data-lobe-side]");
    if (!target) return;
    const data = target.dataset;
    if (data.atlasCn !== undefined) state.atlas.cn = data.atlasCn && state.atlas.cn !== data.atlasCn ? data.atlasCn : null;
    else if (data.atlasFace) state.atlas.face = data.atlasFace;
    else if (data.lobe) {
      state.atlas.lobe = data.lobe;
      state.atlas.lobeRegion = 0;
    } else if (data.lobeRegion !== undefined) state.atlas.lobeRegion = Number(data.lobeRegion);
    else if (data.lobeSide) state.atlas.lobeSide = data.lobeSide;
    else if (data.aphQ) {
      const [key, value] = data.aphQ.split(":");
      state.atlas.aphasiaQ = { ...(state.atlas.aphasiaQ || {}), [key]: value === "1" };
      state.atlas.aphasia = null;
    } else if (data.aphSyndrome !== undefined) {
      const s = window.ATLAS.aphasia.syndromes.find((item) => item.id === data.aphSyndrome);
      state.atlas.aphasia = s ? s.id : null;
      state.atlas.aphasiaQ = s ? { ...s.answers } : {};
    } else if (data.aphArtery) {
      state.atlas.module = "territorios-arteriais";
      state.atlas.artery = data.aphArtery;
    } else if (data.atlasArtery !== undefined) state.atlas.artery = data.atlasArtery && state.atlas.artery !== data.atlasArtery ? data.atlasArtery : null;
    state.pharma.sourcesOpen = false;
    saveAtlasState();
    renderPharmaPanel();
  });
})();
