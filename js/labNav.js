/* Três áreas no topo do menu: Estudo · Laboratório · Prática clínica.
   - Estudo: questões, provas, flashcards, desempenho e anotações.
   - Laboratório: simuladores e ferramentas, um ambiente para testar possibilidades e aprender.
   - Prática clínica: o site de escalas (link externo).
   O nome do Laboratório fica numa constante só, para trocar quando o nome final for escolhido. */

const LAB_NAME = "Laboratório";

/* Telas de ferramenta abertas pelo menu lateral (view do simulador). */
const LAB_TOOL_VIEWS = { inter: "cross", effect: "cross", switch: "switch", safety: "safety", levels: "levels" };

function labActiveToolKey() {
  const v = state.pharma?.view;
  if (v === "cross") return state.pharma.crossTab === "inter" ? "inter" : "effect";
  return Object.keys(LAB_TOOL_VIEWS).find((k) => LAB_TOOL_VIEWS[k] === v && k !== "inter" && k !== "effect") || null;
}

function syncLabArea() {
  const inLab = state.activeTab === "pharma";
  document.body.classList.toggle("area-lab", inLab);
  document.querySelectorAll(".pq-switch [data-area]").forEach((a) => {
    const on = (a.dataset.area === "lab") === inLab;
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.querySelectorAll(".lab-name").forEach((n) => { n.textContent = LAB_NAME; });
  if (!inLab) return;
  /* Item ativo do menu: ferramenta aberta, ou a seção (Psicofarmacologia, Neuroanatomia, Paciente). */
  const tool = labActiveToolKey();
  const section = ["atlas", "patient"].includes(state.pharma.section) ? state.pharma.section : "drugs";
  document.querySelectorAll(".tab[data-sim-target]").forEach((b) => {
    const on = b.dataset.simView ? b.dataset.simView === tool && section === "drugs" : b.dataset.simTarget === section && !(section === "drugs" && tool);
    b.classList.toggle("active", on);
  });
  const title = document.querySelector("#questionTitle");
  if (title && document.body.classList.contains("tab-view-active")) {
    title.textContent = section === "atlas" ? "Neuroanatomia" : section === "patient" ? "Paciente simulado" : tool ? (document.querySelector(`.tab[data-sim-view="${tool}"]`)?.textContent || "Psicofarmacologia") : "Psicofarmacologia";
  }
}

(function setupLabNav() {
  /* A troca de área no topo não recarrega a página. */
  document.addEventListener("click", (event) => {
    const link = event.target.closest(".pq-switch [data-area]");
    if (!link) return;
    event.preventDefault();
    if (link.dataset.area === "lab") {
      state.pharma.section = state.pharma.section === "atlas" || state.pharma.section === "patient" ? state.pharma.section : "drugs";
      state.pharma.view = "hub";
      savePharmaState();
      setTab("pharma", { fromNav: true });
    } else {
      const studyTabs = ["overview", "activity", "exams", "flashcards", "history", "notes"];
      setTab(studyTabs.includes(state.lastStudyTab) ? state.lastStudyTab : "overview", { fromNav: true });
    }
    syncLabArea();
  });

  /* Itens de ferramenta no menu lateral: depois do handler que escolhe a seção, abre a ferramenta. */
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".tab[data-sim-view]");
    if (!button) return;
    const key = button.dataset.simView;
    state.pharma.view = LAB_TOOL_VIEWS[key] || "hub";
    if (key === "inter" || key === "effect") state.pharma.crossTab = key;
    state.pharma.sourcesOpen = false;
    savePharmaState();
    setTimeout(syncLabArea, 0);
  }, true);

  const baseSync = typeof syncSimTabs === "function" ? syncSimTabs : null;
  if (baseSync) {
    syncSimTabs = function syncSimTabsWithLab(...args) {
      const result = baseSync.apply(this, args);
      syncLabArea();
      return result;
    };
  }
  syncLabArea();
})();
