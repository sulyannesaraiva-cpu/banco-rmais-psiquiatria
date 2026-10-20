/* Barra de navegação inferior no celular: Hoje · Estudar · Flashcards · Desempenho · Mais.
   No celular ela substitui a gaveta lateral como navegação principal; a gaveta continua
   existindo para filtros e opções ("Estudar" e "Mais" a abrem). */

const BOTTOM_NAV_TABS = {
  today: ["overview", "today"],
  study: ["activity", "exams"],
  flashcards: ["flashcards"],
  performance: ["history"],
  more: ["notes", "topics"],
};

function renderBottomNav() {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;
  const drawerOpen = isMobileLayout() && !state.sidebarCollapsed;
  nav.querySelectorAll("[data-nav]").forEach((button) => {
    const key = button.dataset.nav;
    const drawerKey = state.bottomNavKey === "study" && BOTTOM_NAV_TABS.study.includes(state.activeTab) ? "study" : "more";
    const active = drawerOpen ? key === drawerKey : key === "more" ? BOTTOM_NAV_TABS.more.includes(state.activeTab) : BOTTOM_NAV_TABS[key].includes(state.activeTab);
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
    if (key === "today") {
      setTab("overview");
      setSidebarCollapsed(true);
      render();
    } else if (key === "study") {
      setTab("activity");
      setSidebarCollapsed(false);
    } else if (key === "flashcards") {
      setSidebarCollapsed(true);
      setTab("flashcards");
    } else if (key === "performance") {
      setTab("history");
      // Com um bloco ativo a área principal mostra a questão; os números ficam na gaveta.
      setSidebarCollapsed(!hasActiveQuestionFlow());
      render();
    } else if (key === "more") {
      setSidebarCollapsed(!state.sidebarCollapsed);
    }
    renderBottomNav();
  });
  renderBottomNav();
})();
