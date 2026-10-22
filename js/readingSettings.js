/* Ajuste de leitura (botão "Aa" no topo): tamanho da letra, espaçamento entre linhas e fonte do
   enunciado, das alternativas, do comentário e da anotação. Fica salvo neste aparelho (no
   celular e no computador cada um pode ter o seu). */

const READING_KEY = "banco-rmais-reading";
const READING_SIZES = [
  [0.9, "Menor"],
  [1, "Padrão"],
  [1.12, "Grande"],
  [1.25, "Maior"],
  [1.4, "Muito grande"],
];

state.reading = { size: 1, spacing: "normal", font: "sans", ...readStoredJson(READING_KEY, {}) };

function applyReadingSettings() {
  const { size, spacing, font } = state.reading;
  const zoom = (READING_SIZES[size] || READING_SIZES[1])[0];
  document.body.style.setProperty("--reading-zoom", String(zoom));
  document.body.classList.toggle("reading-airy", spacing === "airy");
  document.body.classList.toggle("reading-serif", font === "serif");
}

function saveReadingSettings() {
  try {
    localStorage.setItem(READING_KEY, JSON.stringify(state.reading));
  } catch (error) {
    /* sem armazenamento: vale só nesta visita */
  }
  applyReadingSettings();
  renderReadingPanel();
}

function renderReadingPanel() {
  const panel = document.querySelector("#readingPanel");
  if (!panel) return;
  const { size, spacing, font } = state.reading;
  panel.querySelector("[data-reading-label]").textContent = (READING_SIZES[size] || READING_SIZES[1])[1];
  panel.querySelector('[data-reading="smaller"]').disabled = size <= 0;
  panel.querySelector('[data-reading="larger"]').disabled = size >= READING_SIZES.length - 1;
  panel.querySelectorAll("[data-reading-spacing]").forEach((button) => button.classList.toggle("active", button.dataset.readingSpacing === spacing));
  panel.querySelectorAll("[data-reading-font]").forEach((button) => button.classList.toggle("active", button.dataset.readingFont === font));
}

(function setupReadingSettings() {
  const button = document.querySelector("#readingBtn");
  const panel = document.querySelector("#readingPanel");
  if (!button || !panel) return;
  applyReadingSettings();
  renderReadingPanel();

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(panel.hidden);
  });

  panel.addEventListener("click", (event) => {
    const action = event.target.closest("[data-reading]")?.dataset.reading;
    const spacing = event.target.closest("[data-reading-spacing]")?.dataset.readingSpacing;
    const font = event.target.closest("[data-reading-font]")?.dataset.readingFont;
    if (action === "smaller") state.reading.size = Math.max(0, state.reading.size - 1);
    if (action === "larger") state.reading.size = Math.min(READING_SIZES.length - 1, state.reading.size + 1);
    if (action === "reset") state.reading = { size: 1, spacing: "normal", font: "sans" };
    if (spacing) state.reading.spacing = spacing;
    if (font) state.reading.font = font;
    if (action || spacing || font) saveReadingSettings();
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !panel.contains(event.target) && event.target !== button) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
})();
