/* Modo "Só questões inéditas": com ele ligado, nenhum bloco repete questão já respondida até
   esgotar o banco. Vale para:
   - Estudo por temas: o bloco usa só as não feitas e não mistura revisões vencidas;
   - Provas > Treinar questões: só as questões ainda não feitas das provas filtradas;
   - Simulado personalizado: sorteia só entre as não feitas;
   - Busca de questões: "Estudar" abre só as não feitas encontradas.
   O mesmo interruptor aparece no Estudo por temas e em Provas, com a contagem de inéditas. */

const UNSEEN_ONLY_KEY = "banco-rmais-unseen-only";

state.unseenOnly = localStorage.getItem(UNSEEN_ONLY_KEY) === "on";

function isUnseenQuestion(question) {
  return !getProgress(question.id).grade;
}

function onlyUnseenIfEnabled(questions) {
  return state.unseenOnly ? questions.filter(isUnseenQuestion) : questions;
}

function setUnseenOnly(value) {
  state.unseenOnly = Boolean(value);
  localStorage.setItem(UNSEEN_ONLY_KEY, state.unseenOnly ? "on" : "off");
  if (state.unseenOnly) {
    state.sessionPoolMode = "new";
    saveSessionPoolMode();
  }
  render();
  /* Atualiza o botão "Estudar" da busca, se houver resultados na tela. */
  document.querySelector("#questionSearchInput")?.dispatchEvent(new Event("input"));
}

function unseenCounts(questions) {
  let total = 0;
  let unseen = 0;
  for (const question of questions) {
    if (isExcluded(question.id) || !isReadyQuestion(effectiveQuestion(question))) continue;
    total += 1;
    if (isUnseenQuestion(question)) unseen += 1;
  }
  return { total, unseen };
}

function renderUnseenToggles() {
  const panelsVisible = ["activity", "exams"].includes(state.activeTab) && !document.querySelector("#tabView")?.hidden;
  if (!panelsVisible) return;
  document.querySelectorAll("[data-unseen-toggle]").forEach((input) => {
    input.checked = state.unseenOnly;
  });
  const bank = unseenCounts(allStudyQuestions());
  const exams = typeof examsForStudyFilters === "function" ? unseenCounts(examsForStudyFilters().flatMap((exam) => exam.questions || [])) : null;
  const format = (n) => n.toLocaleString("pt-BR");
  document.querySelectorAll("[data-unseen-line]").forEach((line) => {
    const scope = line.dataset.unseenLine;
    const counts = scope === "exams" && exams ? exams : bank;
    const where = scope === "exams" ? "nas provas filtradas" : "no banco";
    const text = counts.unseen
      ? `${format(counts.unseen)} de ${format(counts.total)} questões ${where} ainda inéditas para você.`
      : `Você já fez todas as ${format(counts.total)} questões ${where}.`;
    if (line.textContent !== text) line.textContent = text;
  });
}

(function setupUnseenMode() {
  document.addEventListener("change", (event) => {
    const input = event.target.closest?.("[data-unseen-toggle]");
    if (input) setUnseenOnly(input.checked);
  });

  /* Escolher "Todas" ou "Só erradas" no bloco desliga o modo (são questões já feitas). */
  el.sessionPoolGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pool]");
    if (button && button.dataset.pool !== "new" && state.unseenOnly) {
      state.unseenOnly = false;
      localStorage.setItem(UNSEEN_ONLY_KEY, "off");
      render();
    }
  });
  if (state.unseenOnly) state.sessionPoolMode = "new";

  const baseStartSession = startSession;
  startSession = function startSessionUnseen(...args) {
    if (!state.unseenOnly) return baseStartSession.apply(this, args);
    const includeReviews = state.includeReviewsInSession;
    state.sessionPoolMode = "new";
    state.includeReviewsInSession = false;
    try {
      return baseStartSession.apply(this, args);
    } finally {
      state.includeReviewsInSession = includeReviews;
    }
  };

  const baseStartExamSet = startExamSet;
  startExamSet = function startExamSetUnseen(...args) {
    if (!state.unseenOnly) return baseStartExamSet.apply(this, args);
    const exams = examsForStudyFilters();
    const questions = exams
      .flatMap((exam) => exam.questions || [])
      .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)) && isUnseenQuestion(question));
    if (!questions.length) {
      el.examSetLine.textContent = exams.length
        ? "Você já fez todas as questões destas provas. Desligue \"Só questões inéditas\" para refazer."
        : "Nenhuma prova encontrada com esses filtros.";
      setTab("exams");
      return;
    }
    startStudyRun(questions, { kind: "exam-unseen", label: "Provas filtradas · só inéditas" });
  };

  if (typeof customSimulationPool === "function") {
    const baseCustomSimulationPool = customSimulationPool;
    customSimulationPool = function customSimulationPoolUnseen(...args) {
      return onlyUnseenIfEnabled(baseCustomSimulationPool.apply(this, args));
    };
  }

  const baseRender = render;
  render = function renderWithUnseenMode(...args) {
    const result = baseRender.apply(this, args);
    renderUnseenToggles();
    return result;
  };
})();
