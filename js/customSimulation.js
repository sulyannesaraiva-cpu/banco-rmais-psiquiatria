/* Simulado personalizado (aba Provas): sorteia questões de provas por banca, tema e quantidade e
   roda como um simulado comum. Vira uma "prova virtual" (id "custom-..."): currentExam() a devolve
   enquanto estiver ativa, então correção, resultado, histórico e retomada ao recarregar funcionam
   como nas provas reais. "Refazer prova" no histórico refaz o mesmo conjunto de questões. */

const CUSTOM_SIMULATION_KEY = "banco-rmais-custom-simulation";
const CUSTOM_SIMULATION_SIZES = [20, 30, 50, 80, 100];
const CUSTOM_MINUTES_PER_QUESTION = 3;

state.customSimulationSize = Number(localStorage.getItem("banco-rmais-custom-simulation-size")) || 50;

/* Prova virtual guardada (id, título, banca e ids das questões), montada sob demanda. */
function customSimulationExam() {
  if (state.customSimulation?.questions) return state.customSimulation;
  const saved = readStoredJson(CUSTOM_SIMULATION_KEY, null);
  if (!saved?.id || !Array.isArray(saved.questionIds) || !state.questions.length) return null;
  const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
  const questions = saved.questionIds.map((id) => byId.get(id)).filter(Boolean);
  if (!questions.length) return null;
  state.customSimulation = buildCustomExam(saved, questions);
  return state.customSimulation;
}

function buildCustomExam(meta, questions) {
  return {
    id: meta.id,
    custom: true,
    title: meta.title,
    institution: meta.institution,
    year: new Date(Number(meta.id.split("-")[1]) || Date.now()).getFullYear(),
    area: "Simulado personalizado",
    questionCount: questions.length,
    questions,
  };
}

function customSimulationPool(institution, topic) {
  const examByQuestion = new Map();
  for (const exam of state.exams) for (const question of exam.questions || []) examByQuestion.set(question.id, exam);
  return examStudyQuestions().filter((question) => {
    const view = effectiveQuestion(question);
    if (isExcluded(question.id) || view.annulled || !isReadyQuestion(view)) return false;
    if (institution !== "Todas" && (examByQuestion.get(question.id)?.institution || "") !== institution) return false;
    if (topic !== "Todos" && topicForQuestion(question) !== topic) return false;
    return true;
  });
}

function startCustomSimulation({ institution, topic, size, preferUnseen, questionIds = null, id = null }) {
  let questions;
  if (questionIds) {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    questions = questionIds.map((questionId) => byId.get(questionId)).filter(Boolean);
  } else {
    const pool = shuffle(customSimulationPool(institution, topic));
    const ordered = preferUnseen
      ? [...pool.filter((question) => !getProgress(question.id).grade), ...pool.filter((question) => getProgress(question.id).grade)]
      : pool;
    questions = ordered.slice(0, size);
  }
  if (!questions.length) {
    setCustomSimulationLine("Nenhuma questão de prova com esses filtros.");
    return;
  }
  const parts = [institution !== "Todas" ? institution : "Várias bancas", topic !== "Todos" ? topic : null].filter(Boolean);
  const meta = {
    id: id || `custom-${Date.now()}`,
    title: `Personalizado · ${parts.join(" · ")} · ${questions.length} questões`,
    institution: institution !== "Todas" ? institution : "",
    questionIds: questions.map((question) => question.id),
  };
  localStorage.setItem(CUSTOM_SIMULATION_KEY, JSON.stringify(meta));
  state.customSimulation = buildCustomExam(meta, questions);
  state.activeExamId = meta.id;
  if (el.examSelect) el.examSelect.value = "";
  startExamSimulation();
}

function setCustomSimulationLine(text) {
  const line = document.querySelector("#customSimLine");
  if (line) line.textContent = text;
}

function renderCustomSimulationForm() {
  const examSelect = document.querySelector("#customSimExam");
  const topicSelect = document.querySelector("#customSimTopic");
  if (!examSelect || !topicSelect) return;
  if (!examSelect.options.length) {
    const institutions = [...new Set(state.exams.map((exam) => exam.institution).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    examSelect.innerHTML = ['<option value="Todas">Todas as bancas</option>', ...institutions.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)].join("");
  }
  const examTopics = [...new Set(examStudyQuestions().map((question) => topicForQuestion(question)))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const topicHtml = ['<option value="Todos">Todos os temas</option>', ...examTopics.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)].join("");
  if (topicSelect.dataset.renderedHtml !== topicHtml) {
    const current = topicSelect.value || "Todos";
    topicSelect.innerHTML = topicHtml;
    topicSelect.dataset.renderedHtml = topicHtml;
    topicSelect.value = examTopics.includes(current) ? current : "Todos";
  }
  document.querySelectorAll("#customSimSize [data-sim-size]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.simSize) === state.customSimulationSize);
  });
  const available = customSimulationPool(examSelect.value, topicSelect.value);
  const size = Math.min(state.customSimulationSize, available.length);
  const minutes = size * CUSTOM_MINUTES_PER_QUESTION;
  const unseen = available.filter((question) => !getProgress(question.id).grade).length;
  setCustomSimulationLine(available.length
    ? `${pluralize(available.length, "questão disponível", "questões disponíveis")} (${unseen} nunca feitas) · tempo de referência: ${minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`}`
    : "Nenhuma questão de prova com esses filtros.");
  const start = document.querySelector("#customSimStart");
  if (start) start.disabled = !available.length || state.examSimulationActive;
}

(function setupCustomSimulation() {
  const card = document.querySelector("#customSimulation");
  if (!card) return;

  const baseCurrentExam = currentExam;
  currentExam = function currentExamWithCustom() {
    if (String(state.activeExamId || "").startsWith("custom-")) {
      const custom = customSimulationExam();
      if (custom && custom.id === state.activeExamId) return custom;
    }
    return baseCurrentExam();
  };

  card.addEventListener("change", () => renderCustomSimulationForm());
  card.addEventListener("click", (event) => {
    const sizeButton = event.target.closest("[data-sim-size]");
    if (sizeButton) {
      state.customSimulationSize = Number(sizeButton.dataset.simSize);
      localStorage.setItem("banco-rmais-custom-simulation-size", String(state.customSimulationSize));
      renderCustomSimulationForm();
      return;
    }
    if (event.target.closest("#customSimStart")) {
      startCustomSimulation({
        institution: document.querySelector("#customSimExam").value,
        topic: document.querySelector("#customSimTopic").value,
        size: state.customSimulationSize,
        preferUnseen: document.querySelector("#customSimUnseen").checked,
      });
    }
  });

  const baseRenderExams = renderExams;
  renderExams = function renderExamsWithCustomSimulation(...args) {
    const result = baseRenderExams.apply(this, args);
    renderCustomSimulationForm();
    return result;
  };
})();
