/* Navegação por áreas no celular: Hoje · Estudar · Simular · Prática · Você.
   - Estudar reúne Temas, Provas, Flashcards e Desempenho; o seletor do topo (#studySubnav) troca
     entre elas.
   - Simular abre o simulador de fármacos (e, no futuro, os pacientes simulados).
   - Prática leva ao site de escalas e exame psíquico.
   - Você abre a gaveta, que no celular fica só com conta, anotações, tema e administração. */

const PRACTICE_URL = "https://escalas.psiquiatriaemquestao.com.br/";

const BOTTOM_NAV_TABS = {
  today: ["overview", "today"],
  study: ["activity", "exams", "flashcards", "history"],
  simulate: ["pharma"],
  practice: [],
  you: ["notes", "topics"],
};

const STUDY_SUBNAV_TABS = ["activity", "exams", "flashcards", "history"];

function renderBottomNav() {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;
  const drawerOpen = isMobileLayout() && !state.sidebarCollapsed;
  nav.querySelectorAll("[data-nav]").forEach((button) => {
    const key = button.dataset.nav;
    const active = drawerOpen ? key === "you" : BOTTOM_NAV_TABS[key].includes(state.activeTab);
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

/* O seletor de Estudar aparece nas telas dessas abas, nunca por cima de uma questão em andamento. */
function renderStudySubnav() {
  const subnav = document.querySelector("#studySubnav");
  if (!subnav) return;
  const onAreaScreen = document.body.classList.contains("tab-view-active") || document.body.classList.contains("flashcard-active");
  const visible = STUDY_SUBNAV_TABS.includes(state.activeTab) && onAreaScreen;
  subnav.hidden = !visible;
  if (!visible) return;
  subnav.querySelectorAll("[data-subnav]").forEach((button) => {
    const active = button.dataset.subnav === state.activeTab;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

(function setupBottomNav() {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-nav]");
    if (!button) return;
    const key = button.dataset.nav;
    state.bottomNavKey = key;
    if (key === "practice") {
      window.location.href = PRACTICE_URL;
      return;
    }
    if (key === "you") {
      setSidebarCollapsed(!state.sidebarCollapsed);
      renderBottomNav();
      return;
    }
    /* Estudar volta para a última sub-área usada (Temas na primeira vez). */
    const target = key === "today"
      ? "overview"
      : key === "simulate"
      ? "pharma"
      : STUDY_SUBNAV_TABS.includes(state.lastStudyTab) ? state.lastStudyTab : "activity";
    setSidebarCollapsed(true);
    setTab(target, { fromNav: true });
    renderBottomNav();
  });

  document.querySelector("#studySubnav")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subnav]");
    if (!button) return;
    setTab(button.dataset.subnav, { fromNav: true });
  });

  const baseRender = render;
  render = function renderWithAreaNav(...args) {
    const result = baseRender.apply(this, args);
    if (STUDY_SUBNAV_TABS.includes(state.activeTab)) state.lastStudyTab = state.activeTab;
    renderStudySubnav();
    renderBottomNav();
    return result;
  };
  renderBottomNav();
})();
