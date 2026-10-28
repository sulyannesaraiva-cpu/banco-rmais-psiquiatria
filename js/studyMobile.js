/* Estudar por temas mais enxuto no celular (no computador nada muda):
   - "Filtros", ao lado da busca, abre e fecha só inéditas, origem (Todas/Didáticas/Provas), busca
     de tema e marcar/desmarcar; o número mostra quantos filtros estão ativos;
   - barra fixa "Começar bloco" acima da barra de baixo, com quantos temas estão marcados e um
     atalho para as opções do bloco (quantidade, só não feitas...). */

function studyActiveFilterCount() {
  let count = 0;
  if (document.querySelector("#studyFilters [data-unseen-toggle]")?.checked) count += 1;
  if (state.topicSource && state.topicSource !== "mixed") count += 1;
  if ((document.querySelector("#topicPanelSearch")?.value || "").trim()) count += 1;
  return count;
}

function renderStudyMobile() {
  const button = document.querySelector("#studyFiltersBtn");
  if (button) {
    const open = document.body.classList.contains("study-filters-open");
    button.setAttribute("aria-expanded", String(open));
    button.classList.toggle("active", open);
    const badge = button.querySelector(".study-filters-count");
    const count = studyActiveFilterCount();
    if (badge) {
      badge.hidden = !count;
      badge.textContent = String(count);
    }
  }
  const bar = document.querySelector("#blockQuickBar");
  if (!bar) return;
  const onTopics = state.activeTab === "activity" && document.body.classList.contains("tab-view-active");
  bar.hidden = !onTopics;
  if (!onTopics) return;
  const checked = document.querySelectorAll('#topicChecklist .topic-row-main input[type="checkbox"]:checked').length;
  const label = bar.querySelector("[data-quickbar-count]");
  if (label) label.textContent = checked ? `${checked} ${checked === 1 ? "tema marcado" : "temas marcados"}` : "Nenhum tema marcado";
  const start = bar.querySelector('[data-quickbar="start"]');
  if (start) {
    start.disabled = !checked;
    start.textContent = `Começar bloco de ${state.sessionSize || 30}`;
  }
}

(function setupStudyMobile() {
  document.querySelector("#studyFiltersBtn")?.addEventListener("click", () => {
    document.body.classList.toggle("study-filters-open");
    renderStudyMobile();
  });
  document.querySelector("#blockQuickBar")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-quickbar]")?.dataset.quickbar;
    if (action === "start") document.querySelector("#startSessionBtn")?.click();
    else if (action === "adjust") document.querySelector(".block-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  /* Marcar ou desmarcar temas e mudar filtros atualizam a barra na hora. */
  document.querySelector("#activityPanel")?.addEventListener("change", () => renderStudyMobile());
  /* Botões como Todas/Didáticas/Provas mudam o estado sem redesenhar a tela inteira. */
  document.querySelector("#activityPanel")?.addEventListener("click", () => setTimeout(renderStudyMobile, 0), true);
  document.querySelector("#topicPanelSearch")?.addEventListener("input", () => renderStudyMobile());

  const baseRender = render;
  render = function renderWithStudyMobile(...args) {
    const result = baseRender.apply(this, args);
    renderStudyMobile();
    return result;
  };
})();
