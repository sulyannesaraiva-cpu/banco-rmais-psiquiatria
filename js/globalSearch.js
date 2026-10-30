/* Busca global: Ctrl+K (ou Cmd+K) de qualquer tela, e o botão "Buscar" do menu.
   Encontra remédios (pelo nome ou nome comercial, abre a ficha), ferramentas e módulos do
   Laboratório, e sempre oferece buscar o termo nas questões. */

const GLOBAL_SEARCH_TOOLS = [
  { label: "Paciente simulado", hint: "Laboratório · perfil, comorbidades e escolha na classe", terms: "paciente simulado comorbidade perfil escolher", go: { section: "patient" } },
  { label: "Interações", hint: "Laboratório · ferramenta", terms: "interacao interacoes cyp qt serotoninergica", go: { view: "cross", crossTab: "inter" } },
  { label: "Troca e retirada", hint: "Laboratório · ferramenta", terms: "troca retirada desmame equivalencia benzodiazepinico switch taper", go: { view: "switch" } },
  { label: "Segurança", hint: "Laboratório · eventos graves", terms: "seguranca sindrome neuroleptica maligna serotoninergica agranulocitose emergencia", go: { view: "safety" } },
  { label: "Níveis séricos", hint: "Laboratório · antipsicóticos e clozapina", terms: "nivel serico plasmatico clozapina dosagem", go: { view: "levels" } },
  { label: "Comparar efeitos", hint: "Laboratório · um efeito em todas as classes", terms: "comparar efeitos qtc peso sedacao prolactina", go: { view: "cross", crossTab: "effect" } },
  { label: "Psicofarmacologia", hint: "Laboratório · classes e mecanismo", terms: "psicofarmacologia classes mecanismo", go: { section: "drugs" } },
];

function globalSearchNorm(text) {
  return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function globalSearchResults(query) {
  const q = globalSearchNorm(query);
  const out = [];
  if (q.length < 2) return out;
  if (typeof pharmaSearch === "function") {
    pharmaSearch(query).slice(0, 6).forEach(({ item, brand }) => {
      out.push({ kind: "Remédio", label: item.name, hint: `${item.clsLabel}${brand ? ` · nome comercial: ${brand}` : ""}`, run: () => globalOpenDrug(item.cls, item.id) });
    });
  }
  GLOBAL_SEARCH_TOOLS.filter((t) => globalSearchNorm(`${t.label} ${t.terms}`).includes(q)).forEach((t) => {
    out.push({ kind: "Laboratório", label: t.label, hint: t.hint, run: () => globalOpenLab(t.go) });
  });
  const atlas = window.ATLAS ? [...(window.ATLAS.modules || []), ...(window.ATLAS.classicModules || [])] : [];
  atlas.filter((m) => m.ready !== false && globalSearchNorm(`${m.title} ${m.text}`).includes(q)).slice(0, 4).forEach((m) => {
    out.push({ kind: "Neuroanatomia", label: m.title, hint: m.text, run: () => globalOpenAtlas(m.id) });
  });
  out.push({ kind: "Questões", label: `Buscar "${query.trim()}" nas questões`, hint: "Estudo · busca por palavra", run: () => globalSearchQuestions(query.trim()) });
  return out;
}

function globalOpenDrug(cls, id) {
  if (typeof pharmaOpenCard !== "function") return;
  state.pharma.section = "drugs";
  pharmaOpenCard(cls, id);
  savePharmaState();
  setTab("pharma", { fromNav: true });
  renderPharmaPanel();
}

function globalOpenLab(go) {
  state.pharma.section = go.section || "drugs";
  state.pharma.view = go.view || "hub";
  if (go.crossTab) state.pharma.crossTab = go.crossTab;
  state.pharma.sourcesOpen = false;
  savePharmaState();
  setTab("pharma", { fromNav: true });
  const panel = document.querySelector("#pharmaPanel");
  if (panel) panel.dataset.renderedHtml = "";
  renderPharmaPanel();
}

function globalOpenAtlas(moduleId) {
  state.pharma.section = "atlas";
  state.pharma.view = "hub";
  if (state.atlas) state.atlas.module = moduleId;
  if (typeof saveAtlasState === "function") saveAtlasState();
  savePharmaState();
  setTab("pharma", { fromNav: true });
  renderPharmaPanel();
}

function globalSearchQuestions(term) {
  setTab("activity", { fromNav: true });
  const input = document.querySelector("#questionSearchInput");
  if (!input) return;
  input.value = term;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.scrollIntoView({ behavior: "smooth", block: "center" });
}

function openGlobalSearch() {
  document.querySelector("#globalSearch")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "globalSearch";
  dialog.className = "global-search";
  dialog.setAttribute("aria-label", "Busca global");
  dialog.innerHTML = `
    <div class="gs-box">
      <input type="search" class="gs-input" placeholder="Buscar remédio, nome comercial, ferramenta ou tema…" aria-label="Buscar no site" autocomplete="off">
      <ul class="gs-list" role="listbox"></ul>
      <p class="gs-foot"><kbd>↑</kbd><kbd>↓</kbd> escolher · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> fechar</p>
    </div>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector(".gs-input");
  const list = dialog.querySelector(".gs-list");
  let results = [];
  let active = 0;
  const draw = () => {
    results = globalSearchResults(input.value);
    active = Math.min(active, Math.max(0, results.length - 1));
    list.innerHTML = results.length
      ? results.map((r, i) => `<li role="option" aria-selected="${i === active}" class="${i === active ? "on" : ""}" data-gs="${i}"><small>${escapeHtml(r.kind)}</small><strong>${escapeHtml(r.label)}</strong><span>${escapeHtml(r.hint)}</span></li>`).join("")
      : `<li class="gs-empty">Digite pelo menos duas letras.</li>`;
  };
  const run = (i) => {
    const r = results[i];
    if (!r) return;
    dialog.close();
    r.run();
  };
  input.addEventListener("input", () => {
    active = 0;
    draw();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { active = Math.min(active + 1, results.length - 1); draw(); event.preventDefault(); }
    else if (event.key === "ArrowUp") { active = Math.max(active - 1, 0); draw(); event.preventDefault(); }
    else if (event.key === "Enter") { run(active); event.preventDefault(); }
  });
  list.addEventListener("click", (event) => {
    const li = event.target.closest("[data-gs]");
    if (li) run(Number(li.dataset.gs));
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove());
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  draw();
  input.focus();
}

(function setupGlobalSearch() {
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (document.querySelector("#globalSearch")) return;
      openGlobalSearch();
    }
  }, true);
  /* Botão no menu lateral, logo abaixo das três áreas. */
  const sw = document.querySelector(".pq-switch");
  if (sw && !document.querySelector("#globalSearchBtn")) {
    const button = document.createElement("button");
    button.id = "globalSearchBtn";
    button.type = "button";
    button.className = "global-search-btn";
    button.innerHTML = `<span>Buscar</span><kbd>Ctrl K</kbd>`;
    button.addEventListener("click", openGlobalSearch);
    sw.after(button);
  }
})();
