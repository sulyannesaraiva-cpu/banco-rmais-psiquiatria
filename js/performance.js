/* Painel de Desempenho (área principal quando a aba Desempenho está aberta e não há bloco ativo).
   - Filtros por período e banca.
   - Cartões: questões, taxa de acerto, tempo líquido e sequência.
   - Evolução (por dia, semana ou mês, conforme o período), mapa de temas por acerto,
     motivos de erro e um próximo passo sugerido.
   Também mantém o registro diário de estudo (tempo, questões, flashcards), que sincroniza
   com a conta junto das configurações. */

const STUDY_LOG_KEY = "banco-rmais-study-log";
const PERFORMANCE_PERIODS = [
  { id: "7d", label: "7 dias", days: 7 },
  { id: "30d", label: "30 dias", days: 30 },
  { id: "6m", label: "6 meses", days: 182 },
  { id: "all", label: "Tudo", days: null },
];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

state.studyLog = readStoredJson(STUDY_LOG_KEY, {});
state.performancePeriod = localStorage.getItem("banco-rmais-performance-period") || "30d";
state.performanceExam = localStorage.getItem("banco-rmais-performance-exam") || "Todas";

/* ---------- registro diário ---------- */

function saveStudyLog() {
  const keys = Object.keys(state.studyLog).sort();
  for (const key of keys.slice(0, Math.max(0, keys.length - 400))) delete state.studyLog[key];
  localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(state.studyLog));
}

function studyLogEntry(timestamp = Date.now()) {
  const key = localDayKey(timestamp);
  const entry = state.studyLog[key] || { ms: 0, questions: 0, correct: 0, flashcards: 0 };
  state.studyLog[key] = entry;
  return entry;
}

/* Chamado pelo núcleo em saveAttempt (cada questão confirmada). */
function recordStudyLogAttempt(attempt, progress) {
  const entry = studyLogEntry();
  entry.questions += 1;
  if (attempt?.is_correct) entry.correct += 1;
  entry.ms += Math.min(Number(progress?.lastElapsedMs) || 0, 10 * 60000);
  saveStudyLog();
}

/* Chamado pelo núcleo em scheduleFlashcardGrade (cada flashcard avaliado). */
function recordStudyLogFlashcard() {
  const entry = studyLogEntry();
  entry.flashcards += 1;
  entry.ms += 20000;
  saveStudyLog();
}

function studyLogForSync() {
  return state.studyLog;
}

function applyStudyLogFromCloud(log) {
  if (!log || typeof log !== "object") return;
  for (const [key, remote] of Object.entries(log)) {
    const local = state.studyLog[key];
    if (!local || (remote?.questions || 0) + (remote?.flashcards || 0) > (local.questions || 0) + (local.flashcards || 0)) {
      state.studyLog[key] = remote;
    }
  }
  saveStudyLog();
}

/* ---------- dados ---------- */

function questionIndexById() {
  const map = new Map();
  for (const question of state.questions || []) map.set(question.id, { question, institution: "" });
  for (const exam of state.exams || []) {
    for (const question of exam.questions || []) map.set(question.id, { question, institution: exam.institution || exam.provider || "" });
  }
  return map;
}

function periodStart(periodId) {
  const period = PERFORMANCE_PERIODS.find((item) => item.id === periodId) || PERFORMANCE_PERIODS[1];
  return period.days ? startOfLocalDay() - (period.days - 1) * DAY_MS : 0;
}

function performanceBuckets(periodId, attempts) {
  const now = Date.now();
  const buckets = [];
  if (periodId === "7d") {
    for (let i = 6; i >= 0; i -= 1) {
      const start = startOfLocalDay() - i * DAY_MS;
      buckets.push({ start, end: start + DAY_MS, label: i === 0 ? "Hoje" : WEEKDAY_INITIALS[new Date(start).getDay()] });
    }
  } else if (periodId === "30d") {
    for (let i = 4; i >= 0; i -= 1) {
      const end = startOfLocalDay() + DAY_MS - i * 7 * DAY_MS;
      buckets.push({ start: end - 7 * DAY_MS, end, label: i === 0 ? "Esta sem." : `${i} sem.` });
    }
  } else {
    const months = periodId === "6m" ? 6 : 12;
    const today = new Date();
    for (let i = months - 1; i >= 0; i -= 1) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1).getTime();
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1).getTime();
      buckets.push({ start, end, label: MONTH_SHORT[new Date(start).getMonth()] });
    }
  }
  for (const bucket of buckets) {
    bucket.total = 0;
    bucket.correct = 0;
  }
  for (const attempt of attempts) {
    const bucket = buckets.find((item) => attempt.ts >= item.start && attempt.ts < item.end && attempt.ts <= now);
    if (!bucket) continue;
    bucket.total += 1;
    if (attempt.is_correct) bucket.correct += 1;
  }
  return buckets;
}

function computePerformanceData() {
  const periodId = state.performancePeriod;
  const exam = state.performanceExam;
  const since = periodStart(periodId);
  const index = questionIndexById();
  const inExam = (questionId) => exam === "Todas" || index.get(questionId)?.institution === exam;

  const allAttempts = (state.attempts || [])
    .map((attempt) => ({ ...attempt, ts: attemptTimestamp(attempt) }))
    .filter((attempt) => attempt.ts && inExam(attempt.question_id));
  const attempts = allAttempts.filter((attempt) => attempt.ts >= since);
  const correct = attempts.filter((attempt) => attempt.is_correct).length;

  const logEntries = Object.entries(state.studyLog || {}).filter(([key]) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).getTime() >= since;
  });
  const logStart = Object.keys(state.studyLog || {}).sort()[0] || null;
  const timeMs = logEntries.reduce((sum, [, entry]) => sum + (entry.ms || 0), 0);
  const flashcards = logEntries.reduce((sum, [, entry]) => sum + (entry.flashcards || 0), 0);

  const subthemes = new Map();
  for (const attempt of attempts) {
    const label = attempt.subtema || (index.get(attempt.question_id) ? questionSubtheme(index.get(attempt.question_id).question) : "");
    if (!label || label === "Subtema a revisar") continue;
    const item = subthemes.get(label) || { label, total: 0, correct: 0 };
    item.total += 1;
    if (attempt.is_correct) item.correct += 1;
    subthemes.set(label, item);
  }
  const topicMap = [...subthemes.values()]
    .filter((item) => item.total >= 3)
    .map((item) => ({ ...item, accuracy: item.correct / item.total }))
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);

  const errorTypes = new Map();
  let wrongTotal = 0;
  for (const attempt of attempts) {
    if (attempt.is_correct) continue;
    wrongTotal += 1;
    const type = attempt.error_type || getProgress(attempt.question_id).errorType || "unclassified";
    errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
  }

  const plan = state.studyPlan;
  const share = examFrequencyShare(exam !== "Todas" ? { targetExam: exam, targetArea: "Todas" } : plan);
  const focusExam = exam !== "Todas" ? exam : plan?.targetExam && plan.targetExam !== "Todas" ? plan.targetExam : "";
  const next = topicMap
    .filter((item) => item.total >= 5 && item.accuracy < 0.7)
    .map((item) => ({ ...item, share: share ? share(item.label) : 0 }))
    .sort((a, b) => (b.share >= 0.06) - (a.share >= 0.06) || a.accuracy - b.accuracy)[0] || null;
  if (next) {
    next.pending = todayStudyPool().filter((question) => questionSubtheme(question) === next.label && (!getProgress(question.id).grade || (getProgress(question.id).nextReviewAt || Infinity) <= Date.now())).length;
  }

  return {
    periodId, exam, attempts, correct,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
    timeMs, flashcards, logStart,
    streak: studyStreak(),
    buckets: performanceBuckets(periodId, allAttempts),
    topicMap,
    errorTypes: [...errorTypes.entries()].sort((a, b) => b[1] - a[1]),
    wrongTotal,
    next, focusExam,
    exams: typeof availableReviewExamTargets === "function" ? availableReviewExamTargets() : [],
  };
}

/* ---------- tela ---------- */

function topicTileClass(accuracy) {
  if (accuracy >= 0.7) return "perf-tile strong";
  if (accuracy >= 0.6) return "perf-tile mid";
  return "perf-tile weak";
}

function renderPerformancePanel() {
  const panel = document.querySelector("#performancePanel");
  if (!panel) return;
  el.source.textContent = "Desempenho";
  el.title.textContent = "Seu desempenho";
  const data = computePerformanceData();
  const maxBucket = Math.max(1, ...data.buckets.map((bucket) => bucket.total));
  const periodLabel = (PERFORMANCE_PERIODS.find((item) => item.id === data.periodId) || {}).label || "";
  const logSince = data.logStart ? data.logStart.split("-").reverse().slice(0, 2).join("/") : "";
  const empty = !data.attempts.length;

  const html = `
    <div class="perf-filters">
      <div class="perf-periods" role="group" aria-label="Período">
        ${PERFORMANCE_PERIODS.map((period) => `<button type="button" data-perf-period="${period.id}" aria-pressed="${period.id === data.periodId}">${period.label}</button>`).join("")}
      </div>
      <label class="perf-exam">
        <span>Banca</span>
        <select data-perf-exam>
          <option value="Todas" ${data.exam === "Todas" ? "selected" : ""}>Todas</option>
          ${data.exams.map((exam) => `<option value="${escapeHtml(exam)}" ${data.exam === exam ? "selected" : ""}>${escapeHtml(exam)}</option>`).join("")}
        </select>
      </label>
    </div>

    <section class="perf-cards">
      <div class="perf-card"><span>Questões</span><strong>${data.attempts.length.toLocaleString("pt-BR")}</strong>${data.flashcards && data.exam === "Todas" ? `<small>+ ${pluralize(data.flashcards, "flashcard", "flashcards")}</small>` : `<small>${data.exam !== "Todas" ? `de provas da ${escapeHtml(data.exam)}` : escapeHtml(periodLabel.toLowerCase())}</small>`}</div>
      <div class="perf-card"><span>Taxa de acerto</span><strong class="perf-accent">${data.accuracy === null ? "—" : `${data.accuracy}%`}</strong><small>${data.attempts.length ? `${data.correct.toLocaleString("pt-BR")} de ${data.attempts.length.toLocaleString("pt-BR")}` : "sem respostas no período"}</small></div>
      <div class="perf-card"><span>Tempo líquido</span><strong>${data.timeMs ? formatMinutes(data.timeMs) : "—"}</strong><small>${data.exam !== "Todas" ? "total, todas as bancas" : logSince ? `registrado desde ${logSince}` : "começa a contar hoje"}</small></div>
      <div class="perf-card"><span>Sequência</span><strong>${pluralize(data.streak.current, "dia", "dias")}</strong><small>recorde: ${data.streak.best}</small></div>
    </section>

    ${empty ? `<section class="today-card"><p class="today-muted">Nenhuma questão respondida ${data.exam !== "Todas" ? `de provas da ${escapeHtml(data.exam)} ` : ""}neste período. Responda algumas questões e volte aqui para ver sua evolução.</p></section>` : `
    <section class="today-card">
      <div class="today-card-head"><h3>Evolução</h3><span>barras: questões · número: % de acerto</span></div>
      <div class="perf-chart" style="grid-template-columns: repeat(${data.buckets.length}, minmax(0, 1fr))">
        ${data.buckets.map((bucket, i) => {
          const last = i === data.buckets.length - 1;
          const height = Math.max(bucket.total ? 6 : 2, Math.round((bucket.total / maxBucket) * 132));
          return `<div class="perf-col">
            <span class="perf-col-acc ${last ? "current" : ""}">${bucket.total ? Math.round((bucket.correct / bucket.total) * 100) : ""}</span>
            <div class="perf-bar ${last ? "current" : ""}" style="height:${height}px" title="${bucket.total} questões"></div>
            <span class="perf-col-label">${escapeHtml(bucket.label)}</span>
          </div>`;
        }).join("")}
      </div>
    </section>

    <section class="today-card">
      <div class="today-card-head"><h3>Mapa de temas</h3><span>toque num tema para treinar só ele</span></div>
      ${data.topicMap.length ? `
      <div class="perf-tiles">
        ${data.topicMap.map((item) => `<button type="button" class="${topicTileClass(item.accuracy)}" data-perf-train="${escapeHtml(item.label)}"><span>${escapeHtml(item.label)}</span><strong>${Math.round(item.accuracy * 100)}%</strong><small>${pluralize(item.total, "questão", "questões")}</small></button>`).join("")}
      </div>
      <div class="perf-legend">
        <span><i class="strong"></i>70% ou mais</span><span><i class="mid"></i>60–69%</span><span><i class="weak"></i>abaixo de 60%</span>
      </div>` : '<p class="today-muted">Responda pelo menos 3 questões de um tema no período para ele aparecer aqui.</p>'}
    </section>

    ${data.wrongTotal ? `
    <section class="today-card">
      <div class="today-card-head"><h3>Por que você erra</h3><span>${pluralize(data.wrongTotal, "erro", "erros")} no período</span></div>
      ${data.errorTypes.map(([type, count]) => {
        const percent = Math.round((count / data.wrongTotal) * 100);
        return `<div class="perf-reason"><div class="perf-reason-line"><span>${escapeHtml(type === "unclassified" ? "Sem motivo marcado" : errorTypeLabel(type))}</span><strong>${percent}%</strong></div><div class="perf-reason-bar ${type === "unclassified" ? "muted" : ""}"><i style="width:${percent}%"></i></div></div>`;
      }).join("")}
      ${(data.errorTypes[0] && data.errorTypes[0][0] === "unclassified") ? '<p class="today-muted">Dica: depois de errar, marque o tipo de erro. Assim este quadro mostra onde você mais tropeça.</p>' : ""}
    </section>` : ""}

    ${data.next ? `
    <section class="perf-next">
      <span class="perf-next-kicker">Próximo passo</span>
      <strong>${escapeHtml(data.next.label)}${data.next.share >= 0.06 && data.focusExam ? ` cai muito na ${escapeHtml(data.focusExam)} e` : ""} está em ${Math.round(data.next.accuracy * 100)}%.${data.next.pending ? ` ${pluralize(data.next.pending, "questão pendente", "questões pendentes")}.` : ""}</strong>
      <button type="button" data-perf-train="${escapeHtml(data.next.label)}">Treinar agora</button>
    </section>` : ""}`}`;
  if (panel.dataset.renderedHtml !== html) {
    panel.innerHTML = html;
    panel.dataset.renderedHtml = html;
  }
}

(function setupPerformancePanel() {
  const panel = document.querySelector("#performancePanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const period = event.target.closest("[data-perf-period]");
    if (period) {
      state.performancePeriod = period.dataset.perfPeriod;
      localStorage.setItem("banco-rmais-performance-period", state.performancePeriod);
      render();
      return;
    }
    const train = event.target.closest("[data-perf-train]");
    if (train) startReinforceRun(train.dataset.perfTrain);
  });
  panel.addEventListener("change", (event) => {
    if (!event.target.matches("[data-perf-exam]")) return;
    state.performanceExam = event.target.value;
    localStorage.setItem("banco-rmais-performance-exam", state.performanceExam);
    render();
  });
})();
