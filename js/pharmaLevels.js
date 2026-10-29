/* Níveis séricos de antipsicóticos (data/pharmaLevels.js).
   Ferramenta da Psicofarmacologia: dose → nível esperado, régua com limiar, ponto de futilidade
   e alerta, leitura de um nível medido e seção da clozapina. */

function pharmaLevelsState() {
  const data = window.PHARMA_AP_LEVELS;
  const lv = state.pharma.levels || {};
  const drug = data.drugs.find((d) => d.id === lv.drug) || data.drugs.find((d) => d.id === "clozapina");
  return {
    drug,
    dose: Number(lv.dose) > 0 ? Number(lv.dose) : pharmaLevelsDefaultDose(drug),
    sex: lv.sex ? (lv.sex === "m" ? "m" : "f") : (state.pharma.patient?.sex === "m" ? "m" : "f"),
    smoke: lv.smoke ? (lv.smoke === "fuma" ? "fuma" : "nao") : (["fuma", "voltou"].includes(state.pharma.patient?.smoke) ? "fuma" : "nao"),
    cyp: lv.cyp === "im" ? "im" : "em",
    measured: Number(lv.measured) > 0 ? Number(lv.measured) : null,
    speed: lv.speed === "fast" ? "fast" : "slow",
  };
}

function pharmaLevelsDefaultDose(drug) {
  const defaults = { haloperidol: 5, flufenazina: 10, clorpromazina: 300, zuclopentixol: 20, amissulprida: 400, risperidona: 4, paliperidona: 6, olanzapina: 15, clozapina: 300, aripiprazol: 15, brexpiprazol: 2, cariprazina: 3, lurasidona: 80, asenapina: 10 };
  return defaults[drug.id] || 10;
}

function pharmaLevelsRatio(drug, s) {
  const r = drug.ratio;
  if (typeof r === "number") return r;
  if (r.by === "smoke") return r[s.smoke];
  if (r.by === "sex") return r[s.sex];
  if (r.by === "cyp") return r[s.cyp];
  if (r.by === "dose") return s.dose > r.cut ? r.high : r.low;
  if (r.by === "sexSmoke") return r[s.sex + (s.smoke === "fuma" ? "f" : "n")];
  return 0;
}

function pharmaLevelsFutility(drug, s) {
  if (drug.futility) return drug.futility;
  const probe = { ...s, dose: drug.maxDose };
  return drug.maxDose * pharmaLevelsRatio(drug, probe);
}

function pharmaLevelsFmt(value) {
  if (value == null || !isFinite(value)) return "–";
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return value.toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function pharmaLevelsZone(value, drug, s) {
  const futility = pharmaLevelsFutility(drug, s);
  if (value < drug.threshold) return { id: "below", tone: "warn", label: "Abaixo do limiar", text: "Chance de resposta menor. Se não houve resposta, há espaço para subir a dose (se tolerada) antes de considerar falha do remédio." };
  if (drug.alert && value >= drug.alert) return { id: "alert", tone: "high", label: "No nível de alerta do laboratório", text: "Reavaliar efeitos adversos e o motivo do nível alto (inibidor, coleta fora do vale, erro de laboratório). Nem sempre exige reduzir." };
  if (value >= futility) return { id: "futile", tone: "high", label: "Acima do ponto de futilidade", text: "Subir mais raramente ajuda (menos de 5% respondem). Sem resposta aqui, pensar em trocar ou em clozapina." };
  return { id: "range", tone: "ok", label: "Entre o limiar e o ponto de futilidade", text: "Faixa de resposta. Sem resposta e com boa tolerância, ainda é possível subir até perto do ponto de futilidade." };
}

function pharmaLevelsScale(drug, s, expected, measured) {
  const futility = pharmaLevelsFutility(drug, s);
  const top = Math.max(futility, drug.alert || 0, expected, measured || 0) * 1.15;
  const pos = (v) => Math.max(0, Math.min(100, (v / top) * 100));
  /* Rótulos perto das bordas alinham para dentro, para não vazar da tela. */
  const mark = (v, cls, label) => {
    const p = pos(v);
    const shift = p < 18 ? "0" : p > 82 ? "-100%" : "-50%";
    return `<span class="lv-mark ${cls}" style="left:${p}%;transform:translateX(${shift})"><em>${label}</em></span>`;
  };
  return `
    <div class="lv-scale" role="img" aria-label="Régua de nível sérico">
      <div class="lv-bar">
        <span class="lv-zone below" style="width:${pos(drug.threshold)}%"></span>
        <span class="lv-zone range" style="left:${pos(drug.threshold)}%;width:${pos(futility) - pos(drug.threshold)}%"></span>
        <span class="lv-zone futile" style="left:${pos(futility)}%;width:${100 - pos(futility)}%"></span>
        ${drug.alert ? `<span class="lv-alert" style="left:${pos(drug.alert)}%" title="Alerta AGNP/ASCP"></span>` : ""}
        <span class="lv-pin expected" style="left:${pos(expected)}%" title="Esperado"></span>
        ${measured ? `<span class="lv-pin measured" style="left:${pos(measured)}%" title="Medido"></span>` : ""}
      </div>
      <div class="lv-marks">
        ${mark(drug.threshold, "t", `Limiar ${pharmaLevelsFmt(drug.threshold)}`)}
        ${mark(futility, "f", `Futilidade ${pharmaLevelsFmt(futility)}`)}
      </div>
      <div class="lv-legend">
        <span><i class="expected"></i>Esperado pela dose</span>
        ${measured ? `<span><i class="measured"></i>Medido</span>` : ""}
        ${drug.alert ? `<span><i class="alert"></i>Alerta do laboratório: ${pharmaLevelsFmt(drug.alert)}</span>` : ""}
      </div>
    </div>`;
}

function pharmaLevelsMeasuredReading(expected, measured) {
  if (!measured) return "";
  const ratio = measured / expected;
  let tone = "ok";
  let text = "Dentro da variação esperada (até cerca de 30%) para quem toma a dose certa.";
  if (ratio < 0.5) {
    tone = "high";
    text = "Bem abaixo do esperado (menos da metade). Pensar em falha de adesão, mas antes conferir horário da coleta, indutores (fumo, carbamazepina) e metabolizador rápido. Um segundo nível na mesma dose ajuda a separar.";
  } else if (ratio < 0.7) {
    tone = "warn";
    text = "Abaixo do esperado, além da variação habitual. Conferir adesão, horário da coleta e indutores; repetir na mesma dose.";
  } else if (ratio > 2) {
    tone = "high";
    text = "Muito acima do esperado. Pensar em inibidor de CYP, metabolizador lento, coleta fora do vale (perto do pico) ou, na clozapina, infecção. Avaliar efeitos adversos.";
  } else if (ratio > 1.3) {
    tone = "warn";
    text = "Acima do esperado, além da variação habitual. Conferir inibidores, horário da coleta e função hepática ou renal.";
  }
  return `<div class="pharma-reading tone-${tone}"><strong>Medido × esperado: ${pharmaLevelsFmt(measured)} ÷ ${pharmaLevelsFmt(expected)} = ${pharmaLevelsFmt(ratio)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function pharmaLevelsResult(drug, s) {
  const ratio = pharmaLevelsRatio(drug, s);
  const expected = s.dose * ratio;
  const zone = pharmaLevelsZone(s.measured || expected, drug, s);
  const futility = pharmaLevelsFutility(drug, s);
  const doseFor = (level) => level / ratio;
  return `
    <div class="lv-numbers">
      <div><small>Nível esperado</small><strong>${pharmaLevelsFmt(expected)} ng/mL</strong><span>${pharmaLevelsFmt(s.dose)} mg × ${pharmaLevelsFmt(ratio)}</span></div>
      <div><small>Dose para o limiar</small><strong>≈ ${pharmaLevelsFmt(doseFor(drug.threshold))} mg/dia</strong><span>limiar ${drug.thresholdText ? escapeHtml(drug.thresholdText) : pharmaLevelsFmt(drug.threshold)} ng/mL</span></div>
      <div><small>Ponto de futilidade</small><strong>${drug.futilityText ? escapeHtml(drug.futilityText) : pharmaLevelsFmt(futility)} ng/mL</strong><span>${drug.futilityAtMax ? "nível na dose máxima" : `≈ ${pharmaLevelsFmt(doseFor(futility))} mg/dia`}</span></div>
    </div>
    ${pharmaLevelsScale(drug, s, expected, s.measured)}
    <div class="pharma-reading tone-${zone.tone}"><strong>${s.measured ? "Nível medido" : "Nível esperado"}: ${escapeHtml(zone.label)}</strong><span>${escapeHtml(zone.text)}</span></div>
    ${pharmaLevelsMeasuredReading(expected, s.measured)}`;
}

function pharmaLevelsClozapine(s) {
  const c = window.PHARMA_AP_LEVELS.clozapine;
  const t = c.titration[s.speed];
  return `
    <section class="pharma-card lv-cloz">
      <div class="pharma-card-head"><h3>Clozapina na prática</h3><span>Clozapine Handbook</span></div>
      <h4>Titulação inicial</h4>
      <div class="pharma-toggles" role="group" aria-label="Ritmo da titulação">
        ${["slow", "fast"].map((k) => `<button type="button" class="pharma-toggle${s.speed === k ? " on" : ""}" data-lv-speed="${k}" aria-pressed="${s.speed === k}">${escapeHtml(c.titration[k].label)}</button>`).join("")}
      </div>
      <div class="lv-table-wrap">
        <table class="lv-table">
          <thead><tr><th>Dia</th><th>Não fumante</th><th>Fumante</th></tr></thead>
          <tbody>${t.days.map((d, i) => `<tr><td>${d}</td><td>${pharmaLevelsFmt(t.nonsmoker[i])} mg</td><td>${pharmaLevelsFmt(t.smoker[i])} mg</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="lv-small">${escapeHtml(c.titration.note)}</p>
      <div class="lv-cards">
        ${c.cards.map((card) => `<div class="pharma-reading tone-${card.tone}"><strong>${escapeHtml(card.title)}</strong><span>${card.items.map((i) => `• ${escapeHtml(i)}`).join("<br>")}</span></div>`).join("")}
      </div>
    </section>`;
}

function renderPharmaLevels() {
  const data = window.PHARMA_AP_LEVELS;
  const s = pharmaLevelsState();
  const drug = s.drug;
  const r = drug.ratio;
  const refCount = ((window.PHARMA_REFS || {}).niveis?.paths || []).length;
  const seg = (attr, options, value) => `<div class="pharma-toggles" role="group">${options.map(([v, label]) => `<button type="button" class="pharma-toggle${value === v ? " on" : ""}" ${attr}="${v}" aria-pressed="${value === v}">${label}</button>`).join("")}</div>`;
  const needsSex = typeof r === "object" && (r.by === "sex" || r.by === "sexSmoke");
  const needsSmoke = typeof r === "object" && (r.by === "smoke" || r.by === "sexSmoke");
  const needsCyp = typeof r === "object" && r.by === "cyp";
  return `
    <header class="pharma-head">
      <div>
        <div class="pharma-head-top">
          <button type="button" class="link-btn pharma-back" data-pharma-hub>← Psicofarmacologia</button>
          ${refCount ? `<button type="button" class="pharma-sources-btn" data-pharma-sources aria-haspopup="dialog">Fontes · ${refCount}</button>` : ""}
        </div>
        <h2>Níveis séricos</h2>
        <p>Antipsicóticos: que nível esperar com a dose, onde ele cai na régua (limiar, ponto de futilidade, alerta) e como ler um nível medido.</p>
      </div>
    </header>
    <div class="lv-drugs" role="group" aria-label="Antipsicótico">
      ${data.drugs.map((d) => `<button type="button" class="pharma-chip${d.id === drug.id ? " on" : ""}" data-lv-drug="${d.id}" aria-pressed="${d.id === drug.id}">${escapeHtml(d.name)}</button>`).join("")}
    </div>
    <section class="pharma-card lv-calc">
      <div class="pharma-card-head"><h3>${escapeHtml(drug.name)}</h3><span>vale de 12 h, dose à noite</span></div>
      <div class="lv-inputs">
        <label class="lv-field"><span>Dose diária (mg)</span><input type="number" inputmode="decimal" min="0" step="any" value="${s.dose}" data-lv-input="dose"></label>
        <label class="lv-field"><span>Nível medido (ng/mL), opcional</span><input type="number" inputmode="decimal" min="0" step="any" value="${s.measured || ""}" placeholder="—" data-lv-input="measured"></label>
      </div>
      ${needsSex ? `<div class="lv-opt"><span>Sexo</span>${seg("data-lv-sex", [["f", "Feminino"], ["m", "Masculino"]], s.sex)}</div>` : ""}
      ${needsSmoke ? `<div class="lv-opt"><span>Tabagismo</span>${seg("data-lv-smoke", [["nao", "Não fuma"], ["fuma", "Fuma"]], s.smoke)}</div>` : ""}
      ${needsCyp ? `<div class="lv-opt"><span>CYP2D6</span>${seg("data-lv-cyp", [["em", "Normal"], ["im", "Intermediário"]], s.cyp)}</div>` : ""}
      <div class="lv-result">${pharmaLevelsResult(drug, s)}</div>
      ${drug.ratioNote ? `<p class="lv-small">${escapeHtml(drug.ratioNote)}</p>` : ""}
      ${drug.note ? `<p class="lv-small">${escapeHtml(drug.note)}</p>` : ""}
      <p class="lv-small">O nível esperado é uma média populacional sem inibidores nem indutores; a variação entre pessoas é grande.</p>
    </section>
    ${drug.id === "clozapina" ? pharmaLevelsClozapine(s) : ""}
    <section class="pharma-card">
      <div class="pharma-card-head"><h3>Como usar o nível</h3></div>
      <div class="lv-rules">${data.rules.map((rule) => `<div class="pharma-reading tone-low"><strong>${escapeHtml(rule.title)}</strong><span>${escapeHtml(rule.text)}</span></div>`).join("")}</div>
      <p class="lv-small">${data.noData.map((d) => `<b>${escapeHtml(d.name)}:</b> ${escapeHtml(d.text)}`).join(" ")}</p>
    </section>
    <p class="pharma-disclaimer">Material didático para estudo. Valores de referência do livro citado; conferir a faixa do laboratório e o quadro clínico.</p>
    ${state.pharma.sourcesOpen ? renderPharmaSources({ id: "niveis", label: "Níveis séricos" }, "paths", drug.name) : ""}`;
}

(function setupPharmaLevels() {
  const panel = document.querySelector("#pharmaPanel");
  if (!panel) return;
  const save = (patch) => {
    state.pharma.levels = { ...(state.pharma.levels || {}), ...patch };
    savePharmaState();
  };
  panel.addEventListener("click", (event) => {
    const target = event.target.closest("[data-pharma-levels-open], [data-lv-drug], [data-lv-sex], [data-lv-smoke], [data-lv-cyp], [data-lv-speed]");
    if (!target) return;
    const d = target.dataset;
    if (d.pharmaLevelsOpen !== undefined) {
      state.pharma.view = "levels";
      state.pharma.sourcesOpen = false;
      savePharmaState();
    } else if (d.lvDrug) save({ drug: d.lvDrug, dose: null, measured: null });
    else if (d.lvSex) save({ sex: d.lvSex });
    else if (d.lvSmoke) save({ smoke: d.lvSmoke });
    else if (d.lvCyp) save({ cyp: d.lvCyp });
    else if (d.lvSpeed) save({ speed: d.lvSpeed });
    renderPharmaPanel();
    if (d.pharmaLevelsOpen !== undefined) panel.scrollIntoView({ block: "start" });
  });
  /* Digitar não redesenha a tela inteira (o campo perderia o foco): só o resultado. */
  panel.addEventListener("input", (event) => {
    const input = event.target.closest("[data-lv-input]");
    if (!input) return;
    const value = input.value === "" ? null : Number(String(input.value).replace(",", "."));
    save({ [input.dataset.lvInput]: value });
    const s = pharmaLevelsState();
    const box = panel.querySelector(".lv-result");
    if (box) box.innerHTML = pharmaLevelsResult(s.drug, s);
    panel.dataset.renderedHtml = "";
  });
})();
