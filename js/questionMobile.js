/* Tela da questão mais limpa no celular (no computador nada muda):
   - o contador "13 / 30" abre e fecha o mapa do bloco;
   - "Anterior · 13/30 · Próxima" fica numa barra fixa acima da barra de baixo (só CSS);
   - etiquetas, conceito (virar flashcard, questões parecidas), anotação, discussão e "mais"
     (gabarito, marcar acerto/erro, editar, reportar) ficam atrás de uma linha de ferramentas:
     cada botão mostra só a sua seção;
   - comentário longo aparece recolhido, com "Ler mais". */

const QUESTION_TOOL_TARGETS = {
  labels: ["#questionLabels"],
  concept: ["#conceptPanel", "#similarPanel"],
  note: ["#noteAccordion"],
  comments: ["#commentsAccordion"],
  more: ["#moreToolsDetails", "#questionReport"],
};

let questionToolsFor = null;

function setQuestionTool(tool) {
  const current = document.body.dataset.qtool || "";
  const next = tool === current ? "" : tool;
  document.body.dataset.qtool = next;
  document.querySelectorAll("#questionToolbar [data-qtool]").forEach((button) => {
    const active = button.dataset.qtool === next;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (!next) return;
  const targets = QUESTION_TOOL_TARGETS[next].map((selector) => document.querySelector(selector)).filter(Boolean);
  targets.forEach((target) => {
    if (target.tagName === "DETAILS") target.open = true;
  });
  const first = targets.find((target) => !target.hidden);
  first?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderQuestionMobile() {
  const toolbar = document.querySelector("#questionToolbar");
  if (!toolbar) return;
  const question = typeof currentQuestion === "function" ? currentQuestion() : null;
  const questionId = question?.id || null;
  /* Ao trocar de questão: ferramentas fechadas, mapa fechado e comentário recolhido de novo. */
  if (questionId !== questionToolsFor) {
    questionToolsFor = questionId;
    document.body.dataset.qtool = "";
    document.body.classList.remove("map-open");
    document.querySelector("#explanationPanel")?.classList.remove("expanded");
    toolbar.querySelectorAll("[data-qtool]").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
  }
  /* Ferramenta sem conteúdo agora (ex.: conceito antes de responder) fica desabilitada. */
  toolbar.querySelectorAll("[data-qtool]").forEach((button) => {
    const targets = QUESTION_TOOL_TARGETS[button.dataset.qtool].map((selector) => document.querySelector(selector)).filter(Boolean);
    button.disabled = !targets.some((target) => !target.hidden);
  });
  const position = document.querySelector("#positionLabel");
  position?.setAttribute("aria-expanded", String(document.body.classList.contains("map-open")));
  clampExplanation();
}

function clampExplanation() {
  const panel = document.querySelector("#explanationPanel");
  const text = document.querySelector("#explanationText");
  if (!panel || !text) return;
  let more = panel.querySelector(".explanation-more");
  if (!more) {
    more = document.createElement("button");
    more.type = "button";
    more.className = "link-btn explanation-more";
    more.addEventListener("click", () => {
      panel.classList.toggle("expanded");
      clampExplanation();
    });
    text.insertAdjacentElement("afterend", more);
  }
  const mobile = typeof isMobileLayout === "function" && isMobileLayout();
  if (!mobile || panel.hidden) {
    panel.classList.remove("clamped");
    more.hidden = true;
    return;
  }
  const expanded = panel.classList.contains("expanded");
  panel.classList.add("clamped");
  const long = text.scrollHeight > 190;
  panel.classList.toggle("clamped", long && !expanded);
  more.hidden = !long;
  more.textContent = expanded ? "Ler menos" : "Ler mais";
}

(function setupQuestionMobile() {
  document.querySelector("#questionToolbar")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-qtool]");
    if (button && !button.disabled) setQuestionTool(button.dataset.qtool);
  });
  document.querySelector("#positionLabel")?.addEventListener("click", () => {
    document.body.classList.toggle("map-open");
    renderQuestionMobile();
  });
  document.querySelector("#questionMap")?.addEventListener("click", (event) => {
    if (event.target.closest("button")) document.body.classList.remove("map-open");
  });

  const baseRender = render;
  render = function renderWithQuestionMobile(...args) {
    const result = baseRender.apply(this, args);
    renderQuestionMobile();
    return result;
  };
})();
