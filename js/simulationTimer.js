/* Simulado cronometrado e relatório do simulado.
   - Relógio na tela da prova: contagem regressiva com o tempo total (3 min por questão), aviso nos
     15 minutos finais e entrega automática quando o tempo acaba. Pode ser trocado por cronômetro
     simples na aba Provas ("Tempo de prova com contagem regressiva").
   - Tempo gasto em cada questão durante o simulado (só enquanto a página está visível).
   - Relatório logo após finalizar, acima do mapa de questões: nota, acertos por tema, evolução
     nos simulados anteriores, tempo médio por questão e as questões em que mais demorou. */

const SIM_MINUTES_PER_QUESTION = 3;
const SIM_WARNING_MS = 15 * 60 * 1000;
const SIM_COUNTDOWN_KEY = "banco-rmais-sim-countdown";
const SIM_TIMES_KEY = "banco-rmais-sim-question-times";
const SIM_SLOWEST_SHOWN = 5;

state.simCountdown = localStorage.getItem(SIM_COUNTDOWN_KEY) !== "off";
state.simTimes = readStoredJson(SIM_TIMES_KEY, null);
state.simTimeUp = false;
state.simLastTick = 0;

function simulationRunning() {
  return Boolean(state.examSimulationActive && !state.examSimulationFinished && state.examSimulationStartedAt);
}

function simulationLimitMs() {
  return state.filtered.length * SIM_MINUTES_PER_QUESTION * 60 * 1000;
}

function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(hours ? 2 : 1, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

function formatSeconds(seconds) {
  const value = Math.round(seconds || 0);
  if (value < 60) return `${value} s`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${minutes} min ${String(rest).padStart(2, "0")} s` : `${minutes} min`;
}

/* ---------- tempo por questão ---------- */

function simTimesForCurrentRun() {
  const key = `${state.activeExamId}|${state.examSimulationStartedAt}`;
  if (state.simTimes?.key !== key) state.simTimes = { key, times: {} };
  return state.simTimes.times;
}

function trackSimulationTime() {
  const now = Date.now();
  const delta = state.simLastTick ? now - state.simLastTick : 0;
  state.simLastTick = now;
  if (!simulationRunning() || document.visibilityState !== "visible" || state.tabViewOpen) return;
  const question = currentQuestion();
  if (!question || delta <= 0) return;
  const times = simTimesForCurrentRun();
  /* Intervalos longos (aba em segundo plano, computador suspenso) não contam. */
  times[question.id] = (times[question.id] || 0) + Math.min(delta, 5000) / 1000;
  try {
    localStorage.setItem(SIM_TIMES_KEY, JSON.stringify(state.simTimes));
  } catch (error) {
    /* sem espaço: o relatório fica só sem o tempo por questão */
  }
}

/* ---------- relógio ---------- */

/* Enquanto o simulado corre, os comentários da questão ficam ocultos (podem entregar o gabarito). */
function syncSimulationRunningState() {
  const running = simulationRunning();
  document.body.classList.toggle("sim-running", running);
  const accordion = document.querySelector("#commentsAccordion");
  if (!accordion) return;
  let note = document.querySelector("#simCommentsNote");
  if (running && !note) {
    note = document.createElement("p");
    note.id = "simCommentsNote";
    note.className = "sim-comments-note";
    note.textContent = "Comentários da questão ficam ocultos até finalizar o simulado.";
    accordion.after(note);
  }
  if (note) note.hidden = !running;
}

function renderSimClock() {
  syncSimulationRunningState();
  const clock = document.querySelector("#simClock");
  if (!clock) return;
  const elapsed = activeExamElapsedMs();
  /* Tempo esgotado: entrega a prova mesmo se a pessoa estiver em outra aba do site. */
  if (simulationRunning() && state.simCountdown && simulationLimitMs() - elapsed <= 0) {
    state.simTimeUp = true;
    clock.hidden = true;
    finishExamSimulation();
    return;
  }
  const visible = simulationRunning() && !state.tabViewOpen && state.activeTab !== "flashcards";
  clock.hidden = !visible;
  if (!visible) return;
  let text;
  let tone = "";
  if (state.simCountdown) {
    const remaining = simulationLimitMs() - elapsed;
    const warning = remaining <= SIM_WARNING_MS;
    tone = warning ? "warning" : "";
    text = `<span>Tempo restante</span><strong>${formatClock(remaining)}</strong>${warning ? "<em>Últimos 15 minutos: confira as questões em branco.</em>" : ""}`;
  } else {
    text = `<span>Tempo de prova</span><strong>${formatClock(elapsed)}</strong>`;
  }
  clock.className = `sim-clock ${tone}`;
  if (clock.dataset.renderedHtml !== text) {
    clock.innerHTML = text;
    clock.dataset.renderedHtml = text;
  }
}

function renderSimCountdownToggle() {
  const toggle = document.querySelector("#simCountdownToggle");
  if (toggle) toggle.checked = state.simCountdown;
}

/* ---------- relatório ---------- */

function simulationTopicRows() {
  const byTopic = new Map();
  for (const question of state.filtered) {
    const topic = topicForQuestion(question);
    const row = byTopic.get(topic) || { topic, total: 0, correct: 0, wrong: 0, blank: 0 };
    const selected = state.examSimulationAnswers[question.id];
    row.total += 1;
    if (!selected) row.blank += 1;
    else if (selected === question.correctAnswer) row.correct += 1;
    else row.wrong += 1;
    byTopic.set(topic, row);
  }
  return [...byTopic.values()].sort((a, b) => a.correct / a.total - b.correct / b.total || b.total - a.total);
}

function simulationSlowest(times) {
  const indexById = new Map(state.filtered.map((question, index) => [question.id, index]));
  return Object.entries(times || {})
    .filter(([id]) => indexById.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, SIM_SLOWEST_SHOWN)
    .map(([id, seconds]) => {
      const question = state.filtered[indexById.get(id)];
      const selected = state.examSimulationAnswers[id];
      return { id, index: indexById.get(id), seconds, result: !selected ? "em branco" : selected === question.correctAnswer ? "acertou" : "errou" };
    });
}

function simulationReportHtml() {
  const rows = simulationTopicRows();
  const topicsHtml = rows
    .map((row) => {
      const percent = Math.round((row.correct / row.total) * 100);
      const tone = percent >= 70 ? "good" : percent >= 50 ? "mid" : "bad";
      return `<li class="${tone}"><span>${escapeHtml(row.topic)}</span><b>${row.correct}/${row.total}</b><i style="--w:${percent}%"></i></li>`;
    })
    .join("");

  const history = (state.simulationHistory || []).slice(0, 6).reverse();
  const evolutionHtml = history.length > 1
    ? `<div class="sim-report-block">
        <h4>Seus últimos simulados</h4>
        <ol class="sim-evolution">${history.map((entry, index) => `<li class="${index === history.length - 1 ? "current" : ""}" title="${escapeHtml(entry.title)}"><i style="--h:${Math.max(entry.score, 4)}%"></i><b>${entry.score}%</b><span>${new Date(entry.finishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span></li>`).join("")}</ol>
      </div>`
    : "";

  /* Depois de recarregar a página, o tempo por questão vem do que ficou guardado no navegador. */
  const times = state.simFinishedTimes || (String(state.simTimes?.key || "").startsWith(`${state.activeExamId}|`) ? state.simTimes.times : {});
  const total = state.filtered.length || 1;
  const average = (state.examSimulationElapsedMs || 0) / 1000 / total;
  const slowest = simulationSlowest(times);
  const timeHtml = `
    <div class="sim-report-block">
      <h4>Tempo</h4>
      <p class="panel-line">Média de <strong>${formatSeconds(average)}</strong> por questão (referência: ${SIM_MINUTES_PER_QUESTION} min).${average > SIM_MINUTES_PER_QUESTION * 60 * 1.05 ? " Acima do ritmo de prova." : ""}</p>
      ${slowest.length ? `<p class="panel-line">Onde você mais demorou:</p>
        <ul class="sim-slowest">${slowest.map((item) => `<li><button type="button" class="link-btn" data-sim-goto="${item.index}">Questão ${item.index + 1}</button><span>${formatSeconds(item.seconds)}</span><em class="${item.result === "acertou" ? "good" : "bad"}">${item.result}</em></li>`).join("")}</ul>` : ""}
    </div>`;

  return `
    <details class="sim-report" open>
      <summary><strong>Relatório do simulado</strong><span>toque para recolher</span></summary>
      ${state.simTimeUp ? '<p class="sim-timeup">Tempo esgotado: a prova foi entregue automaticamente.</p>' : ""}
      <div class="sim-report-summary">${el.examResult?.innerHTML || ""}</div>
      <div class="sim-report-block">
        <h4>Acertos por tema</h4>
        <ul class="sim-topics">${topicsHtml}</ul>
      </div>
      ${evolutionHtml}
      ${timeHtml}
    </details>`;
}

function renderSimReport() {
  const box = document.querySelector("#simReport");
  if (!box) return;
  const visible = state.examSimulationActive && state.examSimulationFinished && !state.tabViewOpen && state.activeTab !== "flashcards" && state.filtered.length > 0;
  box.hidden = !visible;
  if (!visible) {
    box.dataset.renderedHtml = "";
    return;
  }
  const html = simulationReportHtml();
  if (box.dataset.renderedHtml !== html) {
    const open = box.querySelector("details")?.open ?? true;
    box.innerHTML = html;
    box.dataset.renderedHtml = html;
    const details = box.querySelector("details");
    if (details) details.open = open;
  }
}

/* Resumo do relatório guardado no histórico (para a conta): acertos por tema, tempo médio e as
   questões mais demoradas. */
function simulationReportSummary(times) {
  const total = state.filtered.length || 1;
  return {
    byTopic: simulationTopicRows().map((row) => [row.topic, row.correct, row.total]),
    averageSeconds: Math.round((state.examSimulationElapsedMs || 0) / 1000 / total),
    slowest: simulationSlowest(times).map((item) => [item.id, Math.round(item.seconds)]),
    timeUp: state.simTimeUp || undefined,
  };
}

(function setupSimulationTimer() {
  const toggle = document.querySelector("#simCountdownToggle");
  toggle?.addEventListener("change", () => {
    state.simCountdown = toggle.checked;
    localStorage.setItem(SIM_COUNTDOWN_KEY, state.simCountdown ? "on" : "off");
    renderSimClock();
  });

  document.querySelector("#simReport")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-review-exam-errors]")) {
      reviewExamSimulationErrors();
      return;
    }
    const goto = event.target.closest("[data-sim-goto]");
    if (goto) {
      state.index = Number(goto.dataset.simGoto) || 0;
      render();
      document.querySelector(".question-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  const baseStartExamSimulation = startExamSimulation;
  startExamSimulation = function startExamSimulationWithClock(...args) {
    state.simTimeUp = false;
    state.simFinishedTimes = null;
    state.simLastTick = 0;
    return baseStartExamSimulation.apply(this, args);
  };

  const baseFinishExamSimulation = finishExamSimulation;
  finishExamSimulation = function finishExamSimulationWithReport(...args) {
    if (!state.examSimulationActive || state.examSimulationFinished) return baseFinishExamSimulation.apply(this, args);
    trackSimulationTime();
    state.simFinishedTimes = { ...simTimesForCurrentRun() };
    return baseFinishExamSimulation.apply(this, args);
  };

  const baseRecordSimulationResult = recordSimulationResult;
  recordSimulationResult = function recordSimulationResultWithReport(...args) {
    const entry = baseRecordSimulationResult.apply(this, args);
    if (entry) {
      Object.assign(entry, simulationReportSummary(state.simFinishedTimes));
      saveSimulationHistory();
    }
    return entry;
  };

  setInterval(() => {
    trackSimulationTime();
    renderSimClock();
  }, 1000);

  const baseRender = render;
  render = function renderWithSimulationClock(...args) {
    const result = baseRender.apply(this, args);
    renderSimClock();
    renderSimReport();
    renderSimCountdownToggle();
    return result;
  };
})();
