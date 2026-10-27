/* Plano de estudo personalizado e tela "Hoje".
   - Plano: banca-alvo, área, data da prova e minutos por dia (sincroniza com a conta
     junto das demais configurações).
   - Hoje: meta do dia, fila "Seu estudo de hoje" (revisões vencidas + questões novas
     priorizadas pela banca e pelos seus pontos fracos), sequência de dias e temas a reforçar.
   - Resumo ao finalizar o estudo do dia.
   O estudo do dia roda como uma sessão comum (sessionActive), então saída, finalização,
   persistência ao recarregar e sincronização continuam as mesmas do resto do app. */

const STUDY_PLAN_KEY = "banco-rmais-study-plan";
const STUDY_RUN_KEY = "banco-rmais-study-run";
const PLAN_MINUTE_OPTIONS = [30, 60, 90, 120];
/* "Só revisar agora": no máximo esta quantidade de revisões vencidas por bloco. */
const REVIEW_ONLY_LIMIT = 40;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

function readStoredJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

state.studyPlan = readStoredJson(STUDY_PLAN_KEY, null);
state.studyRun = readStoredJson(STUDY_RUN_KEY, null);
state.planDraft = null;
state.todaySummary = null;
let todayDataCache = { key: "", data: null };

/* ---------- datas ---------- */

function localDayKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfLocalDay(timestamp = Date.now()) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function daysUntilExam(plan = state.studyPlan) {
  if (!plan?.examDate) return null;
  const [year, month, day] = String(plan.examDate).split("-").map(Number);
  if (!year || !month || !day) return null;
  const examDay = new Date(year, month - 1, day).getTime();
  return Math.round((examDay - startOfLocalDay()) / DAY_MS);
}

function formatMinutes(ms) {
  if (ms > 0 && ms < 60000) return "menos de 1 min";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${String(rest).padStart(2, "0")}min` : `${hours}h`;
}

/* ---------- plano ---------- */

function questionsGoalForMinutes(minutes) {
  // ≈ 1,5 min por questão: 30 min → 20, 1 h → 40, 1h30 → 60, 2 h → 80
  return Math.max(10, Math.round(((Number(minutes) || 60) * (2 / 3)) / 5) * 5);
}

/* Bancas do plano (uma ou mais, guardadas como "ENARE + SES-DF"). */
function planExamList(plan = state.studyPlan) {
  const value = String(plan?.targetExam || "");
  if (!value || value === "Todas") return [];
  return value.split("+").map((item) => item.trim()).filter(Boolean);
}

/* "na ENARE" ou "nas provas ENARE e SES-DF", para frases como "o que mais cai na prova". */
function planExamPhrase(plan = state.studyPlan) {
  const list = planExamList(plan);
  if (!list.length) return "nas provas";
  if (list.length === 1) return `na ${list[0]}`;
  return `nas provas ${list.slice(0, -1).join(", ")} e ${list[list.length - 1]}`;
}

function planTargetLabel(plan = state.studyPlan) {
  if (!plan || !plan.targetExam || plan.targetExam === "Todas") return "Plano geral";
  return plan.targetArea && plan.targetArea !== "Todas" ? `${plan.targetExam} · ${plan.targetArea}` : plan.targetExam;
}

function applyPlanToReviewTargets(plan) {
  state.reviewTargetExam = plan?.targetExam || "Todas";
  state.reviewTargetArea = plan?.targetArea || "Todas";
  localStorage.setItem("banco-rmais-review-target-exam", state.reviewTargetExam);
  localStorage.setItem("banco-rmais-review-target-area", state.reviewTargetArea);
  if (typeof empiricalExamFrequencyCache !== "undefined") empiricalExamFrequencyCache.clear();
}

function saveStudyPlan(plan) {
  const { targetExam, targetArea, examDate, minutesPerDay } = plan;
  state.studyPlan = { targetExam, targetArea, examDate, minutesPerDay, updatedAt: Date.now() };
  localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(state.studyPlan));
  applyPlanToReviewTargets(state.studyPlan);
  todayDataCache.key = "";
  if (state.cloudReady && typeof syncSettingsToCloud === "function") syncSettingsToCloud();
}

/* Chamado por applySettingsPayload quando a conta traz um plano salvo em outro aparelho. */
function applyStudyPlanFromCloud(plan) {
  if (!plan || typeof plan !== "object") return;
  if (state.studyPlan?.updatedAt && plan.updatedAt && state.studyPlan.updatedAt >= plan.updatedAt) return;
  state.studyPlan = plan;
  localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(plan));
  applyPlanToReviewTargets(plan);
  todayDataCache.key = "";
  // Formulário aberto automaticamente na primeira visita e ainda não mexido: dá lugar ao plano da conta.
  if (state.planDraft && !state.planDraft.touched && !state.planDraft.openedByUser) state.planDraft = null;
}

function defaultPlanDraft({ openedByUser = false } = {}) {
  const plan = state.studyPlan || {};
  return {
    openedByUser,
    touched: false,
    targetExam: plan.targetExam || state.reviewTargetExam || "Todas",
    targetArea: plan.targetArea || "Todas",
    examDate: plan.examDate || "",
    minutesPerDay: plan.minutesPerDay || 60,
  };
}

/* ---------- dados do estudo ---------- */

function todayStudyPool() {
  return allStudyQuestions().filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
}

function attemptTimestamp(attempt) {
  const value = Date.parse(attempt?.answered_at || "");
  return Number.isFinite(value) ? value : null;
}

function studyDaySet() {
  const days = new Set();
  for (const attempt of state.attempts || []) {
    const ts = attemptTimestamp(attempt);
    if (ts) days.add(localDayKey(ts));
  }
  for (const progress of Object.values(state.flashcardProgress || {})) {
    const reviewed = progress?.reviewedAt || progress?.lastReviewedAt;
    const ts = reviewed ? new Date(reviewed).getTime() : null;
    if (ts && Number.isFinite(ts)) days.add(localDayKey(ts));
  }
  return days;
}

function studyStreak(days = studyDaySet()) {
  const today = startOfLocalDay();
  let cursor = days.has(localDayKey(today)) ? today : today - DAY_MS;
  let current = 0;
  while (days.has(localDayKey(cursor))) {
    current += 1;
    cursor -= DAY_MS;
  }
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let previous = null;
  for (const key of sorted) {
    const [y, m, d] = key.split("-").map(Number);
    const ts = new Date(y, m - 1, d).getTime();
    run = previous !== null && Math.round((ts - previous) / DAY_MS) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = ts;
  }
  const week = [];
  for (let i = 6; i >= 0; i -= 1) {
    const ts = today - i * DAY_MS;
    week.push({ initial: WEEKDAY_INITIALS[new Date(ts).getDay()], studied: days.has(localDayKey(ts)), isToday: i === 0 });
  }
  return { current, best: Math.max(best, current), week };
}

function answeredTodayIds() {
  const start = startOfLocalDay();
  const ids = new Set();
  for (const attempt of state.attempts || []) {
    const ts = attemptTimestamp(attempt);
    if (ts && ts >= start) ids.add(attempt.question_id);
  }
  return ids;
}

function examFrequencyShare(plan = state.studyPlan) {
  if (!plan?.targetExam || plan.targetExam === "Todas" || typeof empiricalExamFrequencyProfile !== "function") return null;
  const profile = empiricalExamFrequencyProfile(plan.targetExam, plan.targetArea || "Todas");
  if (!profile || profile.totalQuestions < 20) return null;
  return (subtheme) => (profile.subthemeCounts.get(subtheme) || 0) / profile.totalQuestions;
}

function topExamSubthemes(plan, limit = 3) {
  if (!plan?.targetExam || plan.targetExam === "Todas" || typeof empiricalExamFrequencyProfile !== "function") return [];
  const profile = empiricalExamFrequencyProfile(plan.targetExam, plan.targetArea || "Todas");
  if (!profile || profile.totalQuestions < 20) return [];
  return [...profile.subthemeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label]) => label);
}

function computeTodayData() {
  const plan = state.studyPlan;
  const cacheKey = [
    localDayKey(), plan?.updatedAt || 0, Object.keys(state.progress || {}).length, (state.attempts || []).length,
    (state.excluded || []).length, Object.keys(state.flashcardProgress || {}).length, Math.floor(Date.now() / 60000),
  ].join("|");
  if (todayDataCache.key === cacheKey) return todayDataCache.data;

  const now = Date.now();
  const pool = todayStudyPool();
  const doneToday = answeredTodayIds();
  const goal = questionsGoalForMinutes(plan?.minutesPerDay);
  const share = examFrequencyShare(plan);

  const subthemes = new Map();
  const due = [];
  const fresh = [];
  for (const question of pool) {
    const progress = getProgress(question.id);
    const subtheme = questionSubtheme(question);
    const stats = subthemes.get(subtheme) || { label: subtheme, answered: 0, correct: 0, unanswered: 0, due: 0 };
    if (progress.grade) {
      stats.answered += 1;
      if (progress.grade === "correct") stats.correct += 1;
    } else {
      stats.unanswered += 1;
    }
    const isDue = Boolean(progress.nextReviewAt && progress.nextReviewAt <= now);
    if (isDue) stats.due += 1;
    subthemes.set(subtheme, stats);
    if (doneToday.has(question.id)) continue;
    if (isDue) due.push(question);
    else if (!progress.grade) fresh.push(question);
  }
  due.sort((a, b) => (getProgress(a.id).nextReviewAt || 0) - (getProgress(b.id).nextReviewAt || 0));

  const remainingGoal = Math.max(goal - doneToday.size, 0);
  const reviewCount = Math.min(due.length, Math.ceil(remainingGoal * 0.6));
  const newCount = Math.min(Math.max(remainingGoal - reviewCount, 0), fresh.length);
  /* Flashcards de hoje (js/flashcardDaily.js): vencidos + novos do limite diário. */
  const flashcardQueue = typeof dailyFlashcardQueue === "function" ? dailyFlashcardQueue() : null;
  const flashcardsReview = flashcardQueue ? flashcardQueue.due.length : typeof flashcardReviewItems === "function" ? flashcardReviewItems({ dueOnly: true }).length : 0;
  const flashcardsNew = flashcardQueue ? flashcardQueue.fresh.length : 0;
  const flashcardsDue = flashcardsReview + flashcardsNew;

  const weak = [...subthemes.values()]
    .filter((item) => item.label !== "Subtema a revisar" && item.answered >= 5)
    .map((item) => ({ ...item, accuracy: item.correct / item.answered, share: share ? share(item.label) : 0 }))
    .filter((item) => item.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy || b.share - a.share)
    .slice(0, 3);

  const data = {
    plan, goal, doneToday: doneToday.size, remainingGoal, due, fresh, reviewCount, newCount, flashcardsDue, flashcardsReview, flashcardsNew,
    subthemes, weak, share, streak: studyStreak(), daysLeft: daysUntilExam(plan),
    estimatedMinutes: Math.round((reviewCount + newCount) * 1.5 + Math.min(flashcardsDue, 20) * 0.5),
  };
  todayDataCache = { key: cacheKey, data };
  return data;
}

/* Escolhe as questões novas: frequência na banca + seus pontos fracos, variando os temas. */
function pickNewQuestions(data, count) {
  if (count <= 0) return [];
  const accuracyBySubtheme = new Map([...data.subthemes.values()].map((item) => [item.label, item.answered >= 5 ? item.correct / item.answered : null]));
  const scored = shuffle(data.fresh).map((question, order) => {
    const subtheme = questionSubtheme(question);
    const frequency = data.share ? Math.min(data.share(subtheme) * 12, 1.6) : 0;
    const accuracy = accuracyBySubtheme.get(subtheme);
    const weakness = accuracy === null || accuracy === undefined ? 0.2 : Math.max(0, 0.75 - accuracy) * 3;
    return { question, subtheme, score: frequency + weakness + (1 - order / Math.max(data.fresh.length, 1)) * 0.6 };
  }).sort((a, b) => b.score - a.score);
  const perSubtheme = new Map();
  const limit = Math.max(3, Math.ceil(count / 6));
  const picked = [];
  for (const item of scored) {
    const used = perSubtheme.get(item.subtheme) || 0;
    if (used >= limit) continue;
    picked.push(item.question);
    perSubtheme.set(item.subtheme, used + 1);
    if (picked.length >= count) break;
  }
  if (picked.length < count) {
    const chosen = new Set(picked.map((question) => question.id));
    for (const item of scored) {
      if (picked.length >= count) break;
      if (!chosen.has(item.question.id)) picked.push(item.question);
    }
  }
  return picked;
}

/* ---------- blocos de estudo ---------- */

function startStudyRun(questions, { kind, label }) {
  if (!questions.length) return false;
  state.sessionCompletionMessage = "";
  state.activeAnswers = {};
  state.topicActive = false;
  state.topicIds = [];
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.examSetIds = [];
  state.spacedReviewActive = false;
  state.spacedReviewIds = [];
  state.smartTrainingActive = false;
  state.smartTrainingIds = [];
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.todaySummary = null;
  state.sessionActive = true;
  state.sessionIds = questions.map((question) => question.id);
  state.filtered = questions;
  state.index = 0;
  /* Estado anterior das questões já vistas, para mostrar o motivo de cada uma estar na fila. */
  const prior = {};
  for (const question of questions) {
    const progress = getProgress(question.id);
    if (progress.grade) prior[question.id] = { grade: progress.grade, lastWrongAt: progress.lastWrongAt || null, updatedAt: progress.updatedAt || null };
  }
  state.studyRun = { kind, label, ids: state.sessionIds, prior, date: localDayKey(), startedAt: Date.now() };
  localStorage.setItem(STUDY_RUN_KEY, JSON.stringify(state.studyRun));
  setTab("activity");
  render();
  return true;
}

function activeStudyRun() {
  const run = state.studyRun;
  if (!run || !state.sessionActive || !Array.isArray(run.ids)) return null;
  const ids = state.sessionIds || [];
  if (ids.length !== run.ids.length || ids[0] !== run.ids[0]) return null;
  return run;
}

function studyRunLabel() {
  return activeStudyRun()?.label || "";
}

function shortDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/* Etiqueta com o motivo da questão estar no bloco ("Revisão · você errou em 12/10", "Nova"). */
function studyRunTagFor(question) {
  const run = activeStudyRun();
  if (!run || !question) return "";
  const prior = run.prior?.[question.id];
  if (prior) {
    if (prior.grade === "wrong" || prior.lastWrongAt) {
      const when = shortDate(prior.lastWrongAt || prior.updatedAt);
      return when ? `Revisão · você errou em ${when}` : "Revisão · você errou esta";
    }
    return "Revisão programada";
  }
  return run.kind === "today" ? "Nova" : "";
}

/* Ação de encerrar o bloco ativo, conforme o modo (botão na barra de progresso). */
function runFinishAction() {
  if (state.examSimulationActive) {
    return state.examSimulationFinished
      ? { label: "Sair do simulado", run: endExam }
      : { label: "Finalizar simulado", run: finishExamSimulation };
  }
  if (state.sessionActive || state.smartTrainingActive) return { label: "Finalizar", run: finishSession };
  if (state.examActive || state.examSetActive) return { label: "Finalizar e ver resultado", run: finishExamStudy };
  if (state.topicActive) return { label: "Sair do tema", run: endSession };
  if (state.spacedReviewActive) return { label: "Sair da revisão", run: endSpacedReview };
  if (state.dangerousReviewActive) return { label: "Sair das perigosas", run: endDangerousReview };
  return null;
}

/* Barra de progresso do bloco ativo, acima do mapa de questões, com o botão de encerrar. */
function renderRunProgress() {
  const box = document.querySelector("#runProgress");
  if (!box) return;
  const visible = hasActiveQuestionFlow() && state.activeTab !== "flashcards" && !state.tabViewOpen && state.filtered.length > 0;
  box.hidden = !visible;
  if (!visible) return;
  const total = state.filtered.length;
  const answered = state.examSimulationActive
    ? state.filtered.filter((question) => state.examSimulationAnswers[question.id]).length
    : isActiveAttemptMode() ? currentRunAnsweredQuestions().length : state.filtered.filter((question) => getProgress(question.id).grade).length;
  const remaining = Math.max(total - answered, 0);
  const action = runFinishAction();
  /* Treino de prova (não simulado) também pode ser só pausado. */
  const pauseAvailable = (state.examActive || state.examSetActive) && !state.examSimulationActive;
  const armed = state.runFinishArmedAt && Date.now() - state.runFinishArmedAt < 4000;
  const verb = state.examSimulationActive && !state.examSimulationFinished ? "marcadas" : "respondidas";
  const html = `
    <div class="run-progress-line">
      <strong>${answered} de ${total} ${verb}</strong>
      <span>${remaining ? `faltam ${remaining}` : "bloco completo"}</span>
      ${pauseAvailable ? '<button type="button" class="run-finish run-pause" data-run-pause title="Sai sem fechar a prova; ao abrir de novo, continua de onde parou">Sair da prova</button>' : ""}
      ${action ? `<button type="button" class="run-finish ${armed ? "armed" : ""}" data-run-finish>${armed ? "Toque de novo para confirmar" : escapeHtml(action.label)}</button>` : ""}
    </div>
    <div class="run-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${answered}" aria-label="Questões ${verb} no bloco"><i style="width:${Math.round((answered / total) * 100)}%"></i></div>`;
  if (box.dataset.renderedHtml !== html) {
    box.innerHTML = html;
    box.dataset.renderedHtml = html;
  }
}

(function setupRunFinishButton() {
  const box = document.querySelector("#runProgress");
  if (!box) return;
  box.addEventListener("click", (event) => {
    if (event.target.closest("[data-run-pause]")) {
      state.runFinishArmedAt = 0;
      pauseExamStudy();
      render();
      return;
    }
    if (!event.target.closest("[data-run-finish]")) return;
    const action = runFinishAction();
    if (!action) return;
    if (state.runFinishArmedAt && Date.now() - state.runFinishArmedAt < 4000) {
      state.runFinishArmedAt = 0;
      action.run();
      // Bloco encerrado: limpa a cópia de recuperação, que o reabriria ao recarregar. Não usa
      // clearActiveStudyState, que apagaria também a posição de uma prova pausada.
      if (!hasActiveQuestionFlow()) clearRecoverySnapshot();
      render();
      return;
    }
    state.runFinishArmedAt = Date.now();
    render();
    setTimeout(() => {
      if (state.runFinishArmedAt && Date.now() - state.runFinishArmedAt >= 4000) {
        state.runFinishArmedAt = 0;
        render();
      }
    }, 4100);
  });
})();

function clearStudyRun() {
  state.studyRun = null;
  localStorage.removeItem(STUDY_RUN_KEY);
}

function startTodayRun({ extra = false } = {}) {
  const data = computeTodayData();
  let reviews;
  let fresh;
  if (extra || data.remainingGoal === 0) {
    reviews = data.due.slice(0, 4);
    fresh = pickNewQuestions(data, 10 - reviews.length);
  } else {
    reviews = data.due.slice(0, data.reviewCount);
    fresh = pickNewQuestions(data, data.newCount);
    const short = data.remainingGoal - reviews.length - fresh.length;
    if (short > 0) reviews = data.due.slice(0, data.reviewCount + short);
  }
  const queue = [...reviews, ...fresh];
  if (!queue.length && typeof dailyFlashcardCount === "function" && dailyFlashcardCount()) {
    state.todayNotice = "";
    startDueFlashcardsReview();
    return;
  }
  if (!queue.length) {
    state.todayNotice = "Você já respondeu todas as questões disponíveis por enquanto. Que tal revisar flashcards ou fazer um simulado?";
    render();
    return;
  }
  state.todayNotice = "";
  startStudyRun(queue, { kind: "today", label: extra ? "Estudo extra de hoje" : "Estudo de hoje" });
}

function startReinforceRun(subtheme) {
  const now = Date.now();
  const pool = todayStudyPool().filter((question) => questionSubtheme(question) === subtheme);
  const due = pool.filter((question) => (getProgress(question.id).nextReviewAt || Infinity) <= now);
  const fresh = shuffle(pool.filter((question) => !getProgress(question.id).grade));
  const wrong = shuffle(pool.filter((question) => getProgress(question.id).grade === "wrong" && !due.includes(question)));
  const queue = [...new Set([...due, ...fresh, ...wrong])].slice(0, 20);
  startStudyRun(queue, { kind: "reinforce", label: `Reforço: ${subtheme}` });
}

/* Chamado pelo núcleo em finishSession(), antes de limpar o estado do bloco. */
function handleStudyRunFinish() {
  const run = activeStudyRun();
  if (!run) return;
  const answered = currentRunAnsweredQuestions();
  const correct = answered.filter((question) => currentAttemptFor(question.id).grade === "correct");
  const wrong = answered.filter((question) => currentAttemptFor(question.id).grade === "wrong");
  const timeMs = answered.reduce((total, question) => total + Math.min(getProgress(question.id).lastElapsedMs || 0, 15 * 60000), 0);
  const errorTypes = new Map();
  for (const question of wrong) {
    const type = getProgress(question.id).errorType || "unclassified";
    errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
  }
  const tomorrowEnd = startOfLocalDay() + 2 * DAY_MS;
  const tomorrowReviews = todayStudyPool().filter((question) => {
    const next = getProgress(question.id).nextReviewAt;
    return next && next < tomorrowEnd;
  }).length;
  state.todaySummary = {
    kind: run.kind,
    label: run.label,
    total: state.filtered.length,
    answered: answered.length,
    correct: correct.length,
    wrongIds: wrong.map((question) => question.id),
    accuracy: answered.length ? Math.round((correct.length / answered.length) * 100) : 0,
    timeMs,
    errorTypes: [...errorTypes.entries()].sort((a, b) => b[1] - a[1]),
    improvement: subthemeImprovement(answered),
    tomorrowReviews,
  };
  clearStudyRun();
  returnToTodayAfterRun();
}

/* Chamado pelo núcleo em endSession() ("Sair do bloco"). */
function handleStudyRunExit() {
  clearStudyRun();
  returnToTodayAfterRun();
}

/* O estudo do dia começa na tela Hoje e volta para ela (com o resumo) ao terminar.
   Roda depois que a função de encerramento do núcleo termina de trocar de aba. */
function returnToTodayAfterRun() {
  queueMicrotask(() => {
    if (hasActiveQuestionFlow()) return;
    setTab("overview");
    render();
  });
}

function subthemeImprovement(answeredQuestions) {
  const touched = new Set(answeredQuestions.map((question) => questionSubtheme(question)));
  const weekStart = Date.now() - 7 * DAY_MS;
  const monthStart = Date.now() - 37 * DAY_MS;
  /* Subtema recalculado pelo banco atual (o gravado na tentativa pode ser de uma regra antiga). */
  const questionsById = new Map(allStudyQuestions().map((question) => [question.id, question]));
  const subthemeOf = (attempt) => {
    const question = questionsById.get(attempt.question_id);
    return question ? questionSubtheme(question) : attempt.subtema;
  };
  let best = null;
  for (const subtheme of touched) {
    const recent = { total: 0, correct: 0 };
    const before = { total: 0, correct: 0 };
    for (const attempt of state.attempts || []) {
      if (subthemeOf(attempt) !== subtheme) continue;
      const ts = attemptTimestamp(attempt);
      if (!ts || ts < monthStart) continue;
      const bucket = ts >= weekStart ? recent : before;
      bucket.total += 1;
      if (attempt.is_correct) bucket.correct += 1;
    }
    if (recent.total < 5 || before.total < 5) continue;
    const from = Math.round((before.correct / before.total) * 100);
    const to = Math.round((recent.correct / recent.total) * 100);
    if (to - from >= 5 && (!best || to - from > best.to - best.from)) best = { subtheme, from, to };
  }
  return best;
}

/* ---------- tela ---------- */

const TODAY_ICONS = {
  review: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 4v5h-5"></path></svg>',
  cards: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2"></rect><path d="M7 3h12a2 2 0 0 1 2 2v12"></path></svg>',
  target: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle></svg>',
  flame: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"></path></svg>',
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg>',
  check: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>',
  up: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"></path><path d="M15 7h6v6"></path></svg>',
  calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M8 3v4"></path><path d="M16 3v4"></path></svg>',
};

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}

function todayDateLabel() {
  const text = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function accuracyChipClass(accuracy) {
  if (accuracy < 0.6) return "today-chip weak";
  if (accuracy < 0.7) return "today-chip mid";
  return "today-chip good";
}

function renderPlanForm() {
  const draft = state.planDraft || (state.planDraft = defaultPlanDraft());
  const exams = typeof availableReviewExamTargets === "function" ? availableReviewExamTargets() : [];
  const selectedExams = planExamList(draft);
  const areas = draft.targetExam !== "Todas" && typeof availableReviewExamAreas === "function" ? availableReviewExamAreas(draft.targetExam) : [];
  if (draft.targetArea !== "Todas" && !areas.includes(draft.targetArea)) draft.targetArea = "Todas";
  const editing = Boolean(state.studyPlan);
  const goal = questionsGoalForMinutes(draft.minutesPerDay);
  const top = topExamSubthemes(draft);
  const days = daysUntilExam(draft);
  const chip = (attr, value, label, active) =>
    `<button type="button" class="plan-chip" ${attr}="${escapeHtml(value)}" aria-pressed="${active}">${escapeHtml(label)}</button>`;
  const preview = [
    days !== null && days > 0 ? `Faltam <strong>${days} dias</strong> para a prova.` : "",
    top.length ? `Mais tempo em <strong>${top.map(escapeHtml).join("</strong>, <strong>")}</strong>, que são os temas que mais caem ${escapeHtml(planExamPhrase(draft))}.` : "",
    draft.targetExam === "Todas" ? "Sem banca definida, o plano equilibra todos os temas." : "",
  ].filter(Boolean).join(" ");
  return `
    <div class="plan-form">
      <div class="plan-head">
        <h2>${editing ? "Editar plano de estudo" : "Monte seu plano de estudo"}</h2>
        <p>Com isso o site escolhe o que você estuda a cada dia e prioriza o que mais cai na sua prova.</p>
      </div>
      <fieldset class="plan-field">
        <legend>Quais provas você vai fazer? <span class="plan-optional">(pode marcar mais de uma)</span></legend>
        <div class="plan-chip-grid">
          ${chip("data-plan-exam", "Todas", "Ainda não sei", !selectedExams.length)}
          ${exams.map((exam) => chip("data-plan-exam", exam, exam, selectedExams.includes(exam))).join("")}
        </div>
      </fieldset>
      ${areas.length > 1 ? `
      <fieldset class="plan-field">
        <legend>Área</legend>
        <div class="plan-chip-row">
          ${chip("data-plan-area", "Todas", "Todas as áreas", draft.targetArea === "Todas")}
          ${areas.map((area) => chip("data-plan-area", area, area, draft.targetArea === area)).join("")}
        </div>
      </fieldset>` : ""}
      <div class="plan-field">
        <label for="planExamDate">${selectedExams.length > 1 ? "Data da primeira prova" : "Data da prova"} <span class="plan-optional">(opcional)</span></label>
        <input id="planExamDate" type="date" value="${escapeHtml(draft.examDate)}" min="${localDayKey()}">
      </div>
      <fieldset class="plan-field">
        <legend>Quanto tempo por dia?</legend>
        <div class="plan-segmented">
          ${PLAN_MINUTE_OPTIONS.map((minutes) => chip("data-plan-minutes", String(minutes), minutes < 60 ? `${minutes} min` : minutes === 60 ? "1 h" : minutes === 90 ? "1h30" : "2 h+", Number(draft.minutesPerDay) === minutes)).join("")}
        </div>
      </fieldset>
      <div class="plan-preview">
        <span class="plan-preview-kicker">Seu plano</span>
        <div class="plan-preview-goal"><strong>${goal}</strong><span>questões por dia, somando revisões e novas</span></div>
        ${preview ? `<p>${preview}</p>` : ""}
      </div>
      <div class="plan-actions">
        <button type="button" class="primary-btn today-cta" data-today-action="save-plan">${editing ? "Salvar plano" : "Criar meu plano"}</button>
        ${editing ? '<button type="button" class="outline-btn" data-today-action="cancel-plan">Cancelar</button>' : ""}
      </div>
    </div>`;
}

function renderTodaySummary(summary) {
  const streak = studyStreak();
  const flashcardsDue = typeof dailyFlashcardCount === "function" ? dailyFlashcardCount() : typeof flashcardReviewItems === "function" ? flashcardReviewItems({ dueOnly: true }).length : 0;
  const title = summary.kind === "today" ? "Estudo de hoje concluído" : "Bloco concluído";
  const streakLine = streak.current > 1
    ? `${streak.current} dias seguidos.${streak.best > streak.current ? ` Seu recorde é ${streak.best}.` : " É o seu recorde!"}`
    : "Primeiro dia da sua sequência. Volte amanhã para mantê-la.";
  return `
    <div class="today-summary">
      <div class="today-summary-head">
        <span class="today-summary-icon">${TODAY_ICONS.check}</span>
        <h2>${title}</h2>
        <p>${escapeHtml(streakLine)}</p>
      </div>
      <div class="today-stat-grid">
        <div class="today-stat"><span>Questões</span><strong>${summary.answered}<small>/${summary.total}</small></strong></div>
        <div class="today-stat"><span>Acerto</span><strong class="today-accent-text">${summary.accuracy}%</strong></div>
        <div class="today-stat"><span>Tempo líquido</span><strong>${formatMinutes(summary.timeMs)}</strong></div>
        <div class="today-stat"><span>Erros</span><strong>${summary.wrongIds.length}</strong></div>
      </div>
      ${summary.improvement ? `
      <div class="today-card today-improvement">
        ${TODAY_ICONS.up}
        <div><strong>Você subiu em ${escapeHtml(summary.improvement.subtheme)}</strong><span>${summary.improvement.from}% → ${summary.improvement.to}% de acerto nesta semana</span></div>
      </div>` : ""}
      ${summary.wrongIds.length ? `
      <div class="today-card">
        <h3>Para revisar com calma</h3>
        ${summary.errorTypes.map(([type, count]) => `<div class="today-row-split"><span>${escapeHtml(type === "unclassified" ? "Sem motivo marcado" : errorTypeLabel(type))}</span><strong>${pluralize(count, "questão", "questões")}</strong></div>`).join("")}
        <button type="button" class="outline-btn" data-today-action="review-errors">Revisar ${pluralize(summary.wrongIds.length, "erro", "erros")} agora</button>
      </div>` : ""}
      <div class="today-card today-inline">
        ${TODAY_ICONS.calendar}
        <div><strong>Amanhã</strong><span>${pluralize(summary.tomorrowReviews, "revisão programada", "revisões programadas")}${state.studyPlan ? ` · meta de ${questionsGoalForMinutes(state.studyPlan.minutesPerDay)} questões` : ""}</span></div>
      </div>
      <div class="today-actions-stack">
        ${flashcardsDue ? `<button type="button" class="primary-btn today-cta" data-today-action="flashcards">Continuar: ${pluralize(flashcardsDue, "flashcard", "flashcards")} de hoje</button>` : ""}
        <button type="button" class="${flashcardsDue ? "outline-btn" : "primary-btn today-cta"}" data-today-action="close-summary">Voltar para Hoje</button>
      </div>
    </div>`;
}

function renderTodayDashboard(data) {
  const plan = data.plan;
  const progressPercent = Math.min(100, Math.round((data.doneToday / Math.max(data.goal, 1)) * 100));
  const goalDone = data.remainingGoal === 0;
  const daysLabel = data.daysLeft === null ? "" : data.daysLeft > 1 ? `${data.daysLeft}` : data.daysLeft === 1 ? "1" : data.daysLeft === 0 ? "Hoje" : "";
  const rows = [];
  if (!goalDone && data.reviewCount) rows.push({ icon: "review", tone: "warn", title: pluralize(data.reviewCount, "revisão vencida", "revisões vencidas"), text: "Questões que você errou ou estão no ponto de rever" });
  if (!goalDone && data.newCount) rows.push({ icon: "target", tone: "good", title: pluralize(data.newCount, "questão nova", "questões novas"), text: plan?.targetExam && plan.targetExam !== "Todas" ? `Dos temas que mais caem ${planExamPhrase(plan)} e dos seus pontos fracos` : "Dos seus pontos fracos, variando os temas" });
  if (data.flashcardsDue) {
    const parts = [data.flashcardsReview ? pluralize(data.flashcardsReview, "para revisar", "para revisar") : "", data.flashcardsNew ? pluralize(data.flashcardsNew, "novo", "novos") : ""].filter(Boolean).join(" · ");
    rows.push({ icon: "cards", tone: "info", title: `${pluralize(data.flashcardsDue, "flashcard", "flashcards")} hoje`, text: `${parts}${goalDone ? "" : " · depois das questões"}`, action: "flashcards", actionLabel: goalDone ? "Revisar" : "Só flashcards" });
  }
  const blockInProgress = hasActiveQuestionFlow() && state.filtered.length > 0;

  return `
    <div class="today-dashboard">
      <section class="today-hero">
        <div class="today-hero-top">
          <div>
            <span class="today-hero-kicker">${plan?.targetExam && plan.targetExam !== "Todas" ? "Sua prova" : "Seu plano"}</span>
            <strong class="today-hero-title">${escapeHtml(planTargetLabel(plan))}</strong>
          </div>
          ${daysLabel ? `<div class="today-hero-days"><strong>${daysLabel}</strong><span>${data.daysLeft > 1 ? "dias" : data.daysLeft === 1 ? "dia" : "é o dia"}</span></div>` : ""}
        </div>
        <div class="today-hero-goal">
          <div class="today-hero-goal-line"><span>Meta de hoje</span><strong>${Math.min(data.doneToday, data.goal)} de ${data.goal} questões</strong></div>
          <div class="today-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${data.goal}" aria-valuenow="${Math.min(data.doneToday, data.goal)}" aria-label="Meta de questões de hoje"><i style="width:${progressPercent}%"></i></div>
        </div>
      </section>

      <section class="today-card today-main-card">
        <div class="today-card-head">
          <h2>${goalDone ? "Meta de hoje cumprida" : "Seu estudo de hoje"}</h2>
          ${!goalDone && data.estimatedMinutes ? `<span>≈ ${data.estimatedMinutes} min</span>` : ""}
        </div>
        ${goalDone ? `<p class="today-muted">Você já respondeu ${data.doneToday} questões hoje. Pode parar por aqui ou fazer mais um bloco curto.</p>` : ""}
        ${state.todayNotice ? `<p class="today-notice">${escapeHtml(state.todayNotice)}</p>` : ""}
        <div class="today-rows">
          ${rows.map((row) => `
            <div class="today-row">
              <span class="today-row-icon ${row.tone}">${TODAY_ICONS[row.icon]}</span>
              <div class="today-row-text"><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.text)}</span></div>
              ${row.action ? `<button type="button" class="outline-btn today-row-btn" data-today-action="${row.action}">${row.actionLabel}</button>` : ""}
            </div>`).join("")}
        </div>
        ${blockInProgress
          ? `<button type="button" class="primary-btn today-cta" data-today-action="resume">Continuar o bloco (${state.index + 1} de ${state.filtered.length}) ${TODAY_ICONS.arrow}</button>`
          : `<button type="button" class="primary-btn today-cta" data-today-action="${goalDone ? "start-extra" : "start"}">${goalDone ? "Estudar mais 10 questões" : "Começar"} ${TODAY_ICONS.arrow}</button>`}
        ${!blockInProgress && data.due.length ? `<button type="button" class="outline-btn today-review-only" data-today-action="review-due">Só revisar agora · ${pluralize(Math.min(data.due.length, REVIEW_ONLY_LIMIT), "questão vencida", "questões vencidas")}</button>` : ""}
      </section>
    </div>`;
}

/* Tela "Outras revisões": sequência de dias, pontos fracos e, logo abaixo (fixos no index.html),
   as revisões especiais e as outras formas de estudar. Hoje fica só com a prova e o estudo do dia. */
function renderTodayMore(data) {
  const plan = data?.plan;
  const weakHtml = !data
    ? ""
    : data.weak.length
    ? data.weak.map((item) => {
        const pending = item.unanswered + item.due;
        const hot = item.share >= 0.06 && plan?.targetExam && plan.targetExam !== "Todas";
        return `
          <div class="today-weak-row">
            <div class="today-weak-text">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${hot ? `Cai muito ${escapeHtml(planExamPhrase(plan))} · ` : ""}${pluralize(pending, "pendente", "pendentes")}</span>
            </div>
            <span class="${accuracyChipClass(item.accuracy)}">${Math.round(item.accuracy * 100)}%</span>
            <button type="button" class="outline-btn" data-today-action="reinforce" data-subtheme="${escapeHtml(item.label)}">Treinar</button>
          </div>`;
      }).join("")
    : '<p class="today-muted">Responda pelo menos 5 questões de um tema para ver seus pontos fracos aqui.</p>';
  return `
    <div class="today-dashboard">
      <div class="today-more-head">
        <button type="button" class="link-btn" data-today-action="back-today">← Voltar para Hoje</button>
      </div>
      ${data ? `
      <div class="today-columns">
        <section class="today-card">
          <div class="today-streak-head">
            <span class="today-flame">${TODAY_ICONS.flame}</span>
            <strong>${data.streak.current ? pluralize(data.streak.current, "dia seguido", "dias seguidos") : "Comece sua sequência hoje"}</strong>
            ${data.streak.best > 1 ? `<span class="today-muted">· recorde: ${data.streak.best}</span>` : ""}
          </div>
          <div class="today-week" aria-label="Dias estudados nesta semana">
            ${data.streak.week.map((day) => `<div class="today-day ${day.studied ? "studied" : ""} ${day.isToday ? "is-today" : ""}"><span aria-hidden="true"></span><small>${day.isToday ? "Hoje" : day.initial}</small></div>`).join("")}
          </div>
        </section>
        <section class="today-card">
          <div class="today-card-head"><h3>Reforçar esta semana</h3></div>
          ${weakHtml}
        </section>
      </div>` : ""}
    </div>`;
}

const TODAY_MORE_LINK = `<button type="button" class="today-more-link" data-today-action="more"><span><strong>Outras revisões</strong><small>Erros, etiquetas, véspera, pontos fracos e outras formas de estudar</small></span>${"›"}</button>`;

function renderTodayPanel() {
  const container = document.querySelector("#todayContent");
  if (!container) return;
  /* Sem plano salvo existe um rascunho automático; só a edição aberta pela pessoa fecha a subtela. */
  const moreView = state.todayView === "more" && !state.todaySummary && !state.planDraft?.openedByUser;
  document.querySelector("#startPanel")?.classList.toggle("show-more", moreView);
  el.source.textContent = todayDateLabel();
  el.title.textContent = moreView ? "Outras revisões" : state.todaySummary ? "Bom trabalho!" : state.studyPlan && !state.planDraft ? greetingForNow() : "Seu plano";
  let html;
  if (moreView) html = renderTodayMore(state.studyPlan ? computeTodayData() : null);
  else if (state.todaySummary) html = renderTodaySummary(state.todaySummary);
  else if (!state.studyPlan || state.planDraft) html = renderPlanForm() + (state.planDraft?.openedByUser ? "" : TODAY_MORE_LINK);
  else {
    html = renderTodayDashboard(computeTodayData()) + TODAY_MORE_LINK;
    /* O botão "Continuar o bloco" já está no cartão do dia: a faixa do topo seria repetida. */
    if (el.tabViewBack && hasActiveQuestionFlow() && state.filtered.length > 0) el.tabViewBack.hidden = true;
  }
  if (container.dataset.renderedHtml !== html) {
    container.innerHTML = html;
    container.dataset.renderedHtml = html;
  }
  const editButton = document.querySelector("#editPlanBtn");
  if (editButton) editButton.hidden = !state.studyPlan || Boolean(state.planDraft) || Boolean(state.todaySummary);
}

/* ---------- interações ---------- */

function handleTodayClick(event) {
  const target = event.target.closest("[data-today-action], [data-plan-exam], [data-plan-area], [data-plan-minutes]");
  if (!target) return;
  if (state.planDraft && (target.dataset.planExam !== undefined || target.dataset.planArea !== undefined || target.dataset.planMinutes !== undefined)) {
    state.planDraft.touched = true;
  }
  if (target.dataset.planExam !== undefined) {
    /* Várias provas: cada toque marca ou desmarca a banca; "Ainda não sei" limpa a seleção. */
    const value = target.dataset.planExam;
    const selected = new Set(planExamList(state.planDraft));
    if (value === "Todas") selected.clear();
    else if (selected.has(value)) selected.delete(value);
    else selected.add(value);
    const ordered = availableReviewExamTargets().filter((exam) => selected.has(exam));
    state.planDraft.targetExam = ordered.length ? ordered.join(" + ") : "Todas";
    state.planDraft.targetArea = "Todas";
    render();
    return;
  }
  if (target.dataset.planArea !== undefined) {
    state.planDraft.targetArea = target.dataset.planArea;
    render();
    return;
  }
  if (target.dataset.planMinutes !== undefined) {
    state.planDraft.minutesPerDay = Number(target.dataset.planMinutes);
    render();
    return;
  }
  const action = target.dataset.todayAction;
  if (action === "save-plan") {
    const dateInput = document.querySelector("#planExamDate");
    if (dateInput) state.planDraft.examDate = dateInput.value || "";
    saveStudyPlan(state.planDraft);
    state.planDraft = null;
    render();
  } else if (action === "cancel-plan") {
    state.planDraft = null;
    render();
  } else if (action === "edit-plan") {
    state.planDraft = defaultPlanDraft({ openedByUser: true });
    render();
  } else if (action === "start") {
    startTodayRun();
  } else if (action === "start-extra") {
    startTodayRun({ extra: true });
  } else if (action === "review-due") {
    state.todayNotice = "";
    startStudyRun(computeTodayData().due.slice(0, REVIEW_ONLY_LIMIT), { kind: "review", label: "Revisões vencidas" });
  } else if (action === "reinforce") {
    startReinforceRun(target.dataset.subtheme);
  } else if (action === "flashcards") {
    state.todaySummary = null;
    startDueFlashcardsReview();
  } else if (action === "review-errors") {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    const questions = (state.todaySummary?.wrongIds || []).map((id) => byId.get(id)).filter(Boolean);
    startStudyRun(questions, { kind: "errors", label: "Revisão dos erros de hoje" });
  } else if (action === "close-summary") {
    state.todaySummary = null;
    render();
  } else if (action === "more") {
    state.todayView = "more";
    render();
    window.scrollTo(0, 0);
  } else if (action === "back-today") {
    state.todayView = null;
    render();
    window.scrollTo(0, 0);
  } else if (action === "resume") {
    returnToQuestion();
  }
}

function handleTodayChange(event) {
  if (event.target.id === "planExamDate" && state.planDraft) {
    state.planDraft.touched = true;
    state.planDraft.examDate = event.target.value || "";
    render();
  }
}

(function setupTodayPanel() {
  const panel = document.querySelector("#startPanel");
  if (!panel) return;
  panel.addEventListener("click", handleTodayClick);
  panel.addEventListener("change", handleTodayChange);
  document.querySelector("#editPlanBtn")?.addEventListener("click", () => {
    state.planDraft = defaultPlanDraft({ openedByUser: true });
    render();
  });
  document.querySelector("#goFlashcardsTodayBtn")?.addEventListener("click", () => {
    setTab("flashcards", { fromNav: true });
    render();
  });
  if (state.studyPlan) applyPlanToReviewTargets(state.studyPlan);
})();
