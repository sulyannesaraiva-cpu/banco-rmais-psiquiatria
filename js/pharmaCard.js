/* Busca única, ficha do remédio e perfil do paciente.
   - Busca no topo da Psicofarmacologia: nome do remédio ou nome comercial (data/pharmaBrazil.js).
   - Ficha: resumo de todas as ferramentas para um remédio, com atalhos para cada uma.
   - Perfil do paciente: preenchido uma vez, muda a ficha, as populações especiais,
     as interações (remédios em uso, tabagismo) e os níveis séricos (sexo, tabagismo). */

const PHARMA_PATIENT_FIELDS = [
  { id: "age", label: "Idade", options: [["", "Adulto"], ["crianca", "Criança ou adolescente"], ["idoso", "Idoso"]] },
  { id: "sex", label: "Sexo", options: [["", "Não informar"], ["f", "Feminino"], ["m", "Masculino"]] },
  { id: "repro", label: "Gestação", options: [["", "Não"], ["gestante", "Gestante"], ["amamentando", "Amamentando"]] },
  { id: "renal", label: "Rim", options: [["", "Normal"], ["leve", "Insuficiência leve a moderada"], ["grave", "Insuficiência grave"]] },
  { id: "hepatic", label: "Fígado", options: [["", "Normal"], ["leve", "Insuficiência leve a moderada"], ["grave", "Insuficiência grave"]] },
  { id: "smoke", label: "Tabagismo", options: [["", "Não fuma"], ["fuma", "Fuma"], ["parou", "Parou agora"], ["voltou", "Voltou a fumar"]] },
];

function pharmaPatient() {
  const p = state.pharma.patient || {};
  return { age: p.age || "", sex: p.sex || "", repro: p.repro || "", renal: p.renal || "", hepatic: p.hepatic || "", smoke: p.smoke || "", meds: Array.isArray(p.meds) ? p.meds : [], comorb: Array.isArray(p.comorb) ? p.comorb : [], prio: Array.isArray(p.prio) ? p.prio : [] };
}

function pharmaPatientActive(p = pharmaPatient()) {
  return Boolean(p.age || p.sex || p.repro || p.renal || p.hepatic || p.smoke || p.meds.length || p.comorb.length);
}

/* Campos de populações especiais que o perfil torna relevantes. */
function pharmaPatientPopFields(p = pharmaPatient()) {
  const out = [];
  if (p.repro === "gestante") out.push("g");
  if (p.repro === "amamentando") out.push("a");
  if (p.age === "crianca") out.push("c");
  if (p.age === "idoso") out.push("i");
  if (p.renal) out.push("r");
  if (p.hepatic) out.push("h");
  return out;
}

function pharmaPatientSummary(p = pharmaPatient()) {
  const prefix = { renal: "Rim: ", hepatic: "Fígado: ", smoke: "Tabagismo: " };
  const parts = PHARMA_PATIENT_FIELDS.filter((f) => p[f.id]).map((f) => {
    const label = f.options.find(([v]) => v === p[f.id])[1];
    return prefix[f.id] ? prefix[f.id] + label.toLowerCase() : label;
  });
  const meds = p.meds.map((id) => pharmaFindDrug(id)?.drug.name).filter(Boolean);
  if (meds.length) parts.push(`em uso: ${meds.join(", ")}`);
  const conds = p.comorb.map((id) => (window.PHARMA_COMORB?.conditions || []).find((c) => c.id === id)?.label).filter(Boolean);
  if (conds.length) parts.push(conds.join(", "));
  return parts.join(" · ");
}

function pharmaNorm(text) {
  return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/* Índice de busca: nome, termos do simulador e nomes comerciais no Brasil. */
function pharmaSearchIndex() {
  if (pharmaSearchIndex.cache) return pharmaSearchIndex.cache;
  const seen = new Set();
  const index = [];
  pharmaAllDrugs().forEach(({ drug, cls }) => {
    if (!cls.drugs.includes(drug) || seen.has(drug.id) || drug.kind === "eps") return;
    seen.add(drug.id);
    const br = (window.PHARMA_BRAZIL || {})[drug.id];
    const brands = br && br.names ? br.names.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [];
    index.push({ id: drug.id, cls: cls.id, name: drug.name, clsLabel: cls.label, terms: [drug.name, ...(drug.search || [])].map(pharmaNorm), brands, brandTerms: brands.map(pharmaNorm) });
  });
  pharmaSearchIndex.cache = index;
  return index;
}

function pharmaSearch(query) {
  const q = pharmaNorm(query);
  if (q.length < 2) return [];
  const hits = [];
  pharmaSearchIndex().forEach((item) => {
    const byName = item.terms.some((t) => t.startsWith(q)) ? 0 : item.terms.some((t) => t.includes(q)) ? 1 : null;
    const brandIdx = item.brandTerms.findIndex((t) => t.startsWith(q) || t.includes(q));
    if (byName !== null) hits.push({ item, rank: byName });
    else if (brandIdx >= 0) hits.push({ item, rank: 2, brand: item.brands[brandIdx] });
  });
  return hits.sort((a, b) => a.rank - b.rank || a.item.name.localeCompare(b.item.name)).slice(0, 8);
}

function pharmaSearchResults(query) {
  const hits = pharmaSearch(query);
  if (pharmaNorm(query).length < 2) return "";
  if (!hits.length) return `<p class="pharma-extra">Nada encontrado para "${escapeHtml(query)}".</p>`;
  return hits.map(({ item, brand }) => `
    <button type="button" class="pcard-hit" data-pcard-open="${item.cls}:${item.id}">
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.clsLabel)}${brand ? ` · nome comercial: ${escapeHtml(brand)}` : ""}</small>
    </button>`).join("");
}

function pharmaMedOptions(exclude) {
  return Object.values(window.PHARMA_SIM).map((cls) => `<optgroup label="${escapeHtml(cls.label)}">${cls.drugs.filter((d) => d.kind !== "eps" && !exclude.includes(d.id)).map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("")}</optgroup>`).join("");
}

function pharmaPatientForm(forceOpen) {
  const p = pharmaPatient();
  const open = forceOpen || state.pharma.patientOpen;
  const summary = pharmaPatientSummary(p);
  return `
    <section class="pharma-card pcard-patient${open ? " open" : ""}">
      ${forceOpen ? `<div class="pcard-patient-head"><span><strong>Perfil do paciente</strong><small>${summary ? escapeHtml(summary) : "Preencha o que se aplica; o resto fica como caso geral."}</small></span></div>` : `<button type="button" class="pcard-patient-head" data-pf-toggle aria-expanded="${Boolean(open)}">
        <span><strong>Perfil do paciente</strong><small>${summary ? escapeHtml(summary) : "Não preenchido: as ferramentas mostram o caso geral."}</small></span>
        <span aria-hidden="true">${open ? "▴" : "▾"}</span>
      </button>`}
      ${open ? `
        <div class="pcard-fields">
          ${PHARMA_PATIENT_FIELDS.map((f) => `
            <label class="pcard-field"><span>${f.label}</span>
              <select data-pf-field="${f.id}">${f.options.map(([v, label]) => `<option value="${v}" ${p[f.id] === v ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>
            </label>`).join("")}
        </div>
        <div class="pcard-meds">
          <span>Remédios em uso</span>
          ${p.meds.map((id) => `<button type="button" class="pharma-chip on" data-pf-med-remove="${id}" aria-label="Tirar ${escapeHtml(pharmaFindDrug(id)?.drug.name || id)}">${escapeHtml(pharmaFindDrug(id)?.drug.name || id)} ×</button>`).join("")}
          ${p.meds.length < 4 ? `<select data-pf-med-add aria-label="Adicionar remédio em uso"><option value="">+ remédio</option>${pharmaMedOptions(p.meds)}</select>` : ""}
        </div>
        <div class="pcard-actions">
          ${pharmaPatientActive(p) ? `<button type="button" class="link-btn" data-pf-clear>Limpar perfil</button>` : ""}
          <small>Fica salvo só neste aparelho.</small>
        </div>` : ""}
    </section>`;
}

function pharmaSearchBox() {
  const q = state.pharma.searchQuery || "";
  return `
    <div class="pcard-search">
      <input type="search" data-pcard-search value="${escapeHtml(q)}" placeholder="Buscar remédio ou nome comercial (ex.: Rivotril)" aria-label="Buscar remédio" autocomplete="off">
      <div class="pcard-hits" role="list">${pharmaSearchResults(q)}</div>
    </div>`;
}

/* ---------- Ficha do remédio ---------- */

function pharmaCardLevels(drugId, p) {
  const data = window.PHARMA_AP_LEVELS;
  const lv = data && data.drugs.find((d) => d.id === drugId);
  if (!lv) return "";
  const r = lv.ratio;
  const smoke = p.smoke === "fuma" || p.smoke === "voltou" ? "fuma" : "nao";
  const s = { sex: p.sex === "m" ? "m" : "f", smoke, cyp: "em", dose: 0 };
  const ratio = typeof r === "number" ? r : r.by === "smoke" ? r[smoke] : r.by === "sex" ? r[s.sex] : r.by === "sexSmoke" ? r[s.sex + (smoke === "fuma" ? "f" : "n")] : r.by === "cyp" ? r.em : r.low;
  const dose = lv.threshold / ratio;
  const fmt = typeof pharmaLevelsFmt === "function" ? pharmaLevelsFmt : (v) => v.toFixed(1);
  const assumed = [];
  if (typeof r === "object" && (r.by === "sex" || r.by === "sexSmoke")) assumed.push(p.sex ? (p.sex === "m" ? "masculino" : "feminino") : "feminino (sexo não informado)");
  if (typeof r === "object" && (r.by === "smoke" || r.by === "sexSmoke")) assumed.push(smoke === "fuma" ? "fumante" : "não fumante");
  return `<div class="pharma-reading tone-low"><strong>Nível sérico</strong><span>Limiar terapêutico ${lv.thresholdText ? escapeHtml(lv.thresholdText) : fmt(lv.threshold)} ng/mL, alcançado em média com ≈ ${fmt(dose)} mg/dia${assumed.length ? ` (${escapeHtml(assumed.join(", "))})` : ""}.</span></div>`;
}

function pharmaCardForPatient(item, p) {
  const out = [];
  const pop = window.PHARMA_POPULATIONS && pharmaPopulationData(item.drug.id);
  const tones = (window.PHARMA_POPULATIONS || {}).tones || {};
  pharmaPatientPopFields(p).forEach((f) => {
    if (!pop || !pop.entry[f]) return;
    const [tone, text] = pop.entry[f];
    const field = window.PHARMA_POPULATIONS.fields.find((x) => x.id === f);
    let extra = "";
    if ((f === "r" && p.renal === "grave") || (f === "h" && p.hepatic === "grave")) extra = " Perfil: insuficiência grave.";
    if ((f === "r" && p.renal === "leve") || (f === "h" && p.hepatic === "leve")) extra = " Perfil: insuficiência leve a moderada.";
    out.push({ tone: tone === "ok" ? "good" : tone === "low" ? "low" : tone, title: `${field.label} · ${tones[tone]?.label || ""}`, text: text + extra });
  });
  if (p.meds.length && typeof pharmaCrossInteractions === "function") {
    const picks = [item.drug.id, ...p.meds.filter((id) => id !== item.drug.id)];
    if (picks.length >= 2) {
      const inter = pharmaCrossInteractions(picks);
      if (inter.length) inter.forEach((i) => out.push({ tone: i.tone, title: `Interação · ${i.title}`, text: i.text, source: i.source }));
      else out.push({ tone: "good", title: "Interações com os remédios em uso", text: "Nenhuma regra desta lista didática para a combinação. Isso não garante que não exista interação." });
    }
  }
  if (p.smoke && typeof pharmaSmokingWarnings === "function") {
    pharmaSmokingWarnings([item.drug.id], p.smoke).filter((w) => w.tone !== "good").forEach((w) => out.push({ tone: w.tone, title: w.title, text: w.text, source: w.source }));
  }
  /* Comorbidades (aba Paciente). */
  if (p.comorb.length && typeof pharmaComorbReasons === "function") {
    const toneOf = { avoid: "high", caution: "warn", good: "good" };
    pharmaComorbReasons(item, p).forEach((r) => out.push({ tone: toneOf[r.kind] || "low", title: `${r.cond} · ${r.kind === "avoid" ? "evitar" : r.kind === "caution" ? "cautela" : "favorável"}`, text: r.text, source: r.src }));
  }
  return out;
}

function renderPharmaCard() {
  const ref = state.pharma.card || {};
  const item = pharmaFindDrug(ref.id);
  if (!item) {
    state.pharma.view = "hub";
    return renderPharmaHub();
  }
  const { drug, cls } = item;
  const p = pharmaPatient();
  const card = (i) => `<div class="pharma-reading tone-${i.tone}"><strong>${escapeHtml(i.title)}</strong><span>${escapeHtml(i.text)}</span>${i.source ? `<small class="cross-source">Fonte: ${escapeHtml(i.source)}</small>` : ""}</div>`;
  const forPatient = pharmaPatientActive(p) ? pharmaCardForPatient(item, p) : [];
  const rank = { high: 0, warn: 1, low: 2, ok: 3, good: 3 };
  forPatient.sort((a, b) => (rank[a.tone] ?? 2) - (rank[b.tone] ?? 2));
  const events = typeof pharmaSafetyEventsFor === "function" ? pharmaSafetyEventsFor(cls.id, drug.id) : [];
  const doseCls = { antidepressivos: "ad", antipsicoticos: "ap", ansioliticos: "bz" }[cls.id];
  const canSwitch = doseCls && typeof doseDrugs === "function" && doseDrugs(doseCls).some((d) => d.id === drug.id);
  const hasLevels = (window.PHARMA_AP_LEVELS?.drugs || []).some((d) => d.id === drug.id);
  const count = typeof pharmaQuestionCount === "function" ? pharmaQuestionCount(drug) : 0;
  const go = (attr, label) => `<button type="button" class="pharma-toggle" ${attr}>${label}</button>`;
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top"><button type="button" class="link-btn pharma-back" data-pharma-hub>← ${state.pharma.section === "patient" ? "Paciente simulado" : "Psicofarmacologia"}</button></div>
        <h2>${escapeHtml(drug.name)}</h2>
        <p>${escapeHtml(cls.label)} · ficha com o resumo de todas as ferramentas.</p>
      </div>
    </header>
    ${pharmaPatientForm()}
    ${pharmaPatientActive(p) ? `
      <section class="pharma-card pcard-for">
        <div class="pharma-card-head"><h3>Para este paciente</h3><span>${forPatient.length ? `${forPatient.length} ${forPatient.length === 1 ? "ponto" : "pontos"}` : "nada específico"}</span></div>
        ${forPatient.length ? forPatient.map(card).join("") : `<p class="pharma-extra">O perfil não muda nada para ${escapeHtml(drug.name.toLowerCase())} nas fontes do simulador.</p>`}
      </section>` : ""}
    <section class="pharma-card">
      <div class="pharma-card-head"><h3>Abrir em</h3></div>
      <div class="pharma-toggles pcard-go">
        ${go(`data-pcard-go="mech"`, "Mecanismo e efeitos")}
        ${go(`data-pcard-go="inter"`, p.meds.length ? "Interações com os em uso" : "Interações")}
        ${canSwitch ? go(`data-pcard-go="switch"`, "Troca e retirada") : ""}
        ${hasLevels ? go(`data-pcard-go="levels"`, "Níveis séricos") : ""}
        ${count ? go(`data-pharma-study="${drug.id}"`, `${count} ${count === 1 ? "questão" : "questões"} do banco`) : ""}
      </div>
    </section>
    <section class="pharma-card pcard-summary">
      <div class="pharma-card-head"><h3>Resumo</h3></div>
      ${typeof brazilCard === "function" ? brazilCard(drug.id, drug.name) : ""}
      ${hasLevels ? pharmaCardLevels(drug.id, p) : ""}
      ${events.length ? `
        <div class="pharma-safety-chips"><b>Segurança</b>${events.map((e) => `<button type="button" class="pharma-toggle" data-pharma-safety-open="${e.id}" style="--c:${e.color}"><i style="background:${e.color}"></i>${escapeHtml(e.title)}</button>`).join("")}</div>` : ""}
      ${typeof pharmaPopulationsBlock === "function" ? pharmaPopulationsBlock(drug) : ""}
    </section>
    <p class="pharma-disclaimer">Material didático e simplificado, para estudo. Não usar para prescrição.</p>`;
}

/* A ficha usa a classe do remédio (notas de classe, segurança). */
function pharmaOpenCard(clsId, drugId) {
  setPharmaClass(clsId);
  state.pharma.view = "card";
  state.pharma.card = { cls: clsId, id: drugId };
  state.pharma.patientOpen = false;
  state.pharma.sourcesOpen = false;
}

/* Hub: busca e perfil acima das classes. Ficha: nova vista. */
(function setupPharmaCard() {
  if (typeof renderPharmaHub !== "function") return;
  const baseHub = renderPharmaHub;
  renderPharmaHub = function () {
    if (state.pharma.view === "card") return renderPharmaCard();
    if (state.pharma.section === "patient" && typeof renderPatientTab === "function") return renderPatientTab();
    const html = baseHub();
    if (state.pharma.section === "atlas") return html;
    return html.replace('<p class="atlas-group">Classes</p>', `${pharmaSearchBox()}<p class="atlas-group">Classes</p>`);
  };

  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  const savePatient = (patch) => {
    state.pharma.patient = { ...pharmaPatient(), ...patch };
    savePharmaState();
  };
  const rerender = () => {
    panel.dataset.renderedHtml = "";
    renderPharmaPanel();
  };

  panel.addEventListener("click", (event) => {
    const t = event.target.closest("[data-pcard-open], [data-pcard-go], [data-pf-toggle], [data-pf-med-remove], [data-pf-clear]");
    if (!t) return;
    const d = t.dataset;
    if (d.pcardOpen) {
      const [cls, id] = d.pcardOpen.split(":");
      pharmaOpenCard(cls, id);
      state.pharma.searchQuery = "";
      savePharmaState();
      rerender();
      panel.scrollIntoView({ block: "start" });
      return;
    }
    if (d.pcardGo) {
      const ref = state.pharma.card || {};
      const item = pharmaFindDrug(ref.id);
      if (!item) return;
      const p = pharmaPatient();
      if (d.pcardGo === "mech") {
        setPharmaClass(item.cls.id);
        state.pharma.view = "class";
        state.pharma.mode = "paths";
        state.pharma.drug = item.drug.id;
        state.pharma.occupancy = pharmaDefaultOccupancy(pharmaDrug(item.drug.id));
        resetPharmaLevel(pharmaDrug(item.drug.id));
      } else if (d.pcardGo === "inter") {
        state.pharma.view = "cross";
        state.pharma.crossTab = "inter";
        state.pharma.crossPicks = [item.drug.id, ...p.meds.filter((id) => id !== item.drug.id)].slice(0, 3);
        if (p.smoke) state.pharma.smoking = p.smoke;
      } else if (d.pcardGo === "switch") {
        const doseCls = { antidepressivos: "ad", antipsicoticos: "ap", ansioliticos: "bz" }[item.cls.id];
        state.pharma.view = "switch";
        state.pharma.doseClass = doseCls;
        state.pharma.switchTab = "switch";
        if (doseCls === "ad") state.pharma.switchFrom = item.drug.id;
        if (doseCls === "ap") state.pharma.apFrom = item.drug.id;
        if (doseCls === "bz") state.pharma.bzFrom = item.drug.id;
      } else if (d.pcardGo === "levels") {
        state.pharma.view = "levels";
        state.pharma.levels = { ...(state.pharma.levels || {}), drug: item.drug.id, dose: null, measured: null };
      }
      state.pharma.sourcesOpen = false;
      savePharmaState();
      rerender();
      panel.scrollIntoView({ block: "start" });
      return;
    }
    if (d.pfToggle !== undefined) {
      state.pharma.patientOpen = !state.pharma.patientOpen;
      savePharmaState();
    } else if (d.pfMedRemove) {
      savePatient({ meds: pharmaPatient().meds.filter((id) => id !== d.pfMedRemove) });
    } else if (d.pfClear !== undefined) {
      state.pharma.patient = {};
      savePharmaState();
    }
    rerender();
  });

  panel.addEventListener("change", (event) => {
    const field = event.target.closest("[data-pf-field]");
    const add = event.target.closest("[data-pf-med-add]");
    if (field) savePatient({ [field.dataset.pfField]: field.value });
    else if (add && add.value) savePatient({ meds: [...pharmaPatient().meds, add.value].slice(0, 4) });
    else return;
    rerender();
  });

  /* Digitar na busca só troca a lista de resultados (o campo mantém o foco). */
  panel.addEventListener("input", (event) => {
    const input = event.target.closest("[data-pcard-search]");
    if (!input) return;
    state.pharma.searchQuery = input.value;
    const box = panel.querySelector(".pcard-hits");
    if (box) box.innerHTML = pharmaSearchResults(input.value);
    panel.dataset.renderedHtml = "";
  });

  panel.addEventListener("keydown", (event) => {
    const input = event.target.closest("[data-pcard-search]");
    if (!input || event.key !== "Enter") return;
    const first = panel.querySelector(".pcard-hit");
    if (first) first.click();
  });
})();
