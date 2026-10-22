/* Histórico de simulados.
   - Cada simulado finalizado é guardado (prova, data, nota, acertos/erros/brancas, tempo e quais
     questões foram erradas) no navegador e na conta, junto das configurações.
   - Aba Provas: "Seus simulados", com a variação em relação à tentativa anterior da mesma prova,
     "Refazer erros" (só as questões erradas naquele simulado) e "Refazer prova".
   - Resultado logo após finalizar: compara com a tentativa anterior da mesma prova. */

const SIMULATION_HISTORY_KEY = "banco-rmais-simulation-history";
const SIMULATION_HISTORY_LIMIT = 100;
const SIMULATION_HISTORY_SHOWN = 8;

state.simulationHistory = readStoredJson(SIMULATION_HISTORY_KEY, []);
if (!Array.isArray(state.simulationHistory)) state.simulationHistory = [];

function saveSimulationHistory() {
  state.simulationHistory = state.simulationHistory
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, SIMULATION_HISTORY_LIMIT);
  try {
    localStorage.setItem(SIMULATION_HISTORY_KEY, JSON.stringify(state.simulationHistory));
  } catch (error) {
    console.warn("histórico de simulados não salvo:", error.message);
  }
  if (typeof scheduleCloudSettingsSync === "function") scheduleCloudSettingsSync();
}

/* Chamado pelo núcleo em finishExamSimulation, depois de corrigir a prova. */
function recordSimulationResult() {
  const exam = currentExam();
  if (!exam) return null;
  const stats = examSimulationStats();
  const entry = {
    id: `${Date.now()}-${exam.id}`,
    examId: exam.id,
    title: exam.title || exam.id,
    institution: exam.institution || "",
    /* Simulado personalizado: guarda o conjunto sorteado para "Refazer prova" repetir as mesmas questões. */
    questionIds: exam.custom ? exam.questions.map((question) => question.id) : undefined,
    finishedAt: Date.now(),
    durationMs: Math.round(state.examSimulationElapsedMs || 0),
    total: stats.questions.length,
    correct: stats.correct.length,
    wrong: stats.wrong.length,
    blank: stats.blank,
    score: stats.accuracy,
    errorIds: stats.wrong.map((question) => question.id),
  };
  state.simulationHistory.unshift(entry);
  saveSimulationHistory();
  return entry;
}

function simulationHistoryForSync() {
  return state.simulationHistory;
}

/* Junta o histórico da conta com o do navegador (por id; nada é apagado). */
function applySimulationHistoryFromCloud(remote) {
  if (!Array.isArray(remote)) return;
  const known = new Set(state.simulationHistory.map((entry) => entry.id));
  let added = 0;
  for (const entry of remote) {
    if (entry?.id && !known.has(entry.id)) {
      state.simulationHistory.push(entry);
      added += 1;
    }
  }
  if (added) saveSimulationHistory();
}

function previousSimulationOf(entry) {
  return state.simulationHistory.find((item) => item.examId === entry.examId && item.finishedAt < entry.finishedAt) || null;
}

function simulationDelta(entry) {
  const previous = previousSimulationOf(entry);
  if (!previous) return "";
  const diff = entry.score - previous.score;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "±";
  const tone = diff > 0 ? "good" : diff < 0 ? "bad" : "same";
  return `<span class="sim-delta ${tone}" title="Tentativa anterior: ${previous.score}% em ${new Date(previous.finishedAt).toLocaleDateString("pt-BR")}">${sign}${Math.abs(diff)} pts</span>`;
}

function formatSimulationDuration(ms) {
  const minutes = Math.round((ms || 0) / 60000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/* Linha de comparação no resultado, logo após finalizar o simulado. */
function simulationComparisonLine() {
  const latest = state.simulationHistory[0];
  if (!latest || !state.examSimulationFinished || latest.examId !== state.activeExamId) return "";
  const previous = previousSimulationOf(latest);
  if (!previous) return '<p class="panel-line">Primeira vez que você faz este simulado. Ele fica guardado em "Seus simulados".</p>';
  const diff = latest.score - previous.score;
  return `<p class="panel-line">Na tentativa anterior (${new Date(previous.finishedAt).toLocaleDateString("pt-BR")}) você fez ${previous.score}%. ${diff > 0 ? `Subiu ${diff} pontos.` : diff < 0 ? `Caiu ${Math.abs(diff)} pontos.` : "Mesma nota."}</p>`;
}

function renderSimulationHistory() {
  const host = document.querySelector("#simulationHistory");
  if (!host) return;
  const entries = state.simulationHistory.slice(0, SIMULATION_HISTORY_SHOWN);
  const html = entries.length
    ? `<h4>Seus simulados</h4>
      <div class="sim-list">
        ${entries.map((entry) => `
          <article class="sim-item">
            <div class="sim-item-head">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${new Date(entry.finishedAt).toLocaleDateString("pt-BR")} · ${formatSimulationDuration(entry.durationMs)}</span>
            </div>
            <div class="sim-item-score">
              <strong>${entry.score}%</strong>
              ${simulationDelta(entry)}
              <span>${entry.correct} acertos · ${entry.wrong} erros · ${entry.blank} brancas</span>
            </div>
            <div class="sim-item-actions">
              <button type="button" class="outline-btn" data-sim-errors="${escapeHtml(entry.id)}" ${entry.errorIds?.length ? "" : "disabled"}>Refazer erros (${entry.errorIds?.length || 0})</button>
              <button type="button" class="link-btn" data-sim-retake="${escapeHtml(entry.examId)}">Refazer prova</button>
            </div>
          </article>`).join("")}
      </div>`
    : `<h4>Seus simulados</h4><p class="panel-line">Ainda não há simulados. Escolha uma prova e toque em "Simular": o resultado fica guardado aqui para você comparar depois.</p>`;
  if (host.dataset.renderedHtml !== html) {
    host.innerHTML = html;
    host.dataset.renderedHtml = html;
  }
}

/* Refaz só as questões erradas de um simulado, como treino (com gabarito na hora). */
function startSimulationErrorsReview(entryId) {
  const entry = state.simulationHistory.find((item) => item.id === entryId);
  if (!entry?.errorIds?.length) return;
  const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
  const questions = entry.errorIds.map((id) => byId.get(id)).filter((question) => question && !isExcluded(question.id));
  if (!questions.length) return;
  startStudyRun(questions, { kind: "errors", label: `Erros do simulado ${entry.title}` });
}

function retakeSimulation(examId) {
  if (String(examId).startsWith("custom-") && typeof startCustomSimulation === "function") {
    const entry = state.simulationHistory.find((item) => item.examId === examId && item.questionIds?.length);
    if (entry) startCustomSimulation({ institution: entry.institution || "Todas", topic: "Todos", questionIds: entry.questionIds, id: examId });
    return;
  }
  if (!el.examSelect) return;
  el.examSelect.value = examId;
  el.examSelect.dispatchEvent(new Event("change", { bubbles: true }));
  startExamSimulation();
}

(function setupSimulationHistory() {
  const host = document.querySelector("#simulationHistory");
  if (!host) return;
  host.addEventListener("click", (event) => {
    const errors = event.target.closest("[data-sim-errors]");
    if (errors && !errors.disabled) {
      startSimulationErrorsReview(errors.dataset.simErrors);
      return;
    }
    const retake = event.target.closest("[data-sim-retake]");
    if (retake) retakeSimulation(retake.dataset.simRetake);
  });

  const baseRenderExams = renderExams;
  renderExams = function renderExamsWithHistory(...args) {
    const result = baseRenderExams.apply(this, args);
    renderSimulationHistory();
    return result;
  };

  const baseRenderExamResult = renderExamResult;
  renderExamResult = function renderExamResultWithComparison(...args) {
    const result = baseRenderExamResult.apply(this, args);
    if (el.examResult && state.examSimulationActive && state.examSimulationFinished) {
      el.examResult.insertAdjacentHTML("beforeend", simulationComparisonLine());
    }
    return result;
  };
})();
