/* Barra de navegação inferior no celular: Hoje · Estudar · Flashcards · Desempenho · Mais.
   Cada botão abre o conteúdo da aba na área principal; "Mais" abre a gaveta, que no
   celular é só o menu completo (abas, conta e tema). */

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
    const active = drawerOpen ? key === "more" : BOTTOM_NAV_TABS[key].includes(state.activeTab);
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
    const target = { today: "overview", study: "activity", flashcards: "flashcards", performance: "history" }[key];
    if (target) {
      setSidebarCollapsed(true);
      setTab(target, { fromNav: true });
    } else if (key === "more") {
      setSidebarCollapsed(!state.sidebarCollapsed);
    }
    renderBottomNav();
  });
  renderBottomNav();
})();
