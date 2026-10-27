/* Gabaritos suspeitos (Administração), a partir das respostas de todos os usuários
   (supabase/question_answer_stats.sql: primeira tentativa de cada pessoa, 5 pessoas ou mais).
   Uma questão é suspeita quando, comparando com o gabarito atual:
   - 25% ou menos das pessoas acertam; ou
   - uma alternativa errada é marcada por metade ou mais e supera a do gabarito.
   Elas entram na fila "Gabarito suspeito" e, para a administração, cada questão com dados mostra
   a distribuição das respostas. */

const SUSPICIOUS_MIN_USERS = 5;

state.answerStats = new Map();
state.answerStatsStatus = "idle";

function answerStatsFor(question) {
  const stats = state.answerStats.get(String(question?.id));
  if (!stats) return null;
  const key = effectiveQuestion(question).correctAnswer;
  const entries = Object.entries(stats.answers).sort((a, b) => b[1] - a[1]);
  const correct = stats.answers[key] || 0;
  const [topWrong, topWrongCount] = entries.find(([letter]) => letter !== key) || [null, 0];
  const correctShare = correct / stats.users;
  const topWrongShare = topWrongCount / stats.users;
  const suspicious = stats.users >= SUSPICIOUS_MIN_USERS && (correctShare <= 0.25 || (topWrongShare >= 0.5 && topWrongCount > correct));
  return { ...stats, key, entries, correctShare, topWrong, topWrongShare, suspicious };
}

/* Usado pelo filtro da Administração (applyFilters) e pelo resumo de pendências. */
function suspiciousAnswerIds() {
  const ids = new Set();
  const byId = new Map(allStudyQuestions().map((question) => [String(question.id), question]));
  for (const id of state.answerStats.keys()) {
    const question = byId.get(id);
    if (question && answerStatsFor(question)?.suspicious) ids.add(question.id);
  }
  return ids;
}

async function loadAnswerStats() {
  if (!state.supabase || !state.isAdmin) return;
  state.answerStatsStatus = "loading";
  const stats = new Map();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await state.supabase.rpc("question_answer_stats").range(from, from + 999);
    if (error) {
      console.warn("question_answer_stats indisponível:", error.message);
      state.answerStatsStatus = "unavailable";
      renderPendingSummary();
      return;
    }
    for (const row of data || []) stats.set(String(row.question_id), { users: Number(row.users) || 0, answers: row.answers || {} });
    if (!data || data.length < 1000) break;
  }
  state.answerStats = stats;
  state.answerStatsStatus = "ready";
  renderPendingSummary();
  if (el.status?.value === "suspicious-key") applyFilters({ preserveCurrent: true });
  else render();
}

function renderAnswerStatsBox() {
  const box = document.querySelector("#answerStatsAdmin");
  if (!box) return;
  const question = currentQuestion();
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  const stats = state.isAdmin && question && !examLocked ? answerStatsFor(question) : null;
  box.hidden = !stats;
  if (!stats) {
    box.dataset.renderedHtml = "";
    return;
  }
  const html = `
    <strong>${stats.suspicious ? "Gabarito suspeito · " : ""}Respostas de ${stats.users} pessoas (1ª tentativa)</strong>
    <div class="answer-stats">
      ${(effectiveQuestion(question).options || []).map((option) => {
        const n = stats.answers[option.letter] || 0;
        const percent = Math.round((n / stats.users) * 100);
        const tone = option.letter === stats.key ? "key" : option.letter === stats.topWrong && stats.suspicious ? "warn" : "";
        return `<div class="answer-stat ${tone}"><b>${escapeHtml(option.letter)}</b><i style="--w:${percent}%"></i><span>${percent}%${option.letter === stats.key ? " · gabarito" : ""}</span></div>`;
      }).join("")}
    </div>
    ${stats.suspicious ? `<p class="panel-line">${stats.correctShare <= 0.25 ? `Só ${Math.round(stats.correctShare * 100)}% acertam.` : ""} ${stats.topWrong && stats.topWrongShare >= 0.5 ? `A maioria marca ${escapeHtml(stats.topWrong)}.` : ""} Confira o gabarito oficial e o enunciado; se estiverem certos, a questão só é difícil.</p>` : ""}`;
  if (box.dataset.renderedHtml !== html) {
    box.innerHTML = html;
    box.dataset.renderedHtml = html;
  }
}

(function setupSuspiciousAnswers() {
  const baseLoadQuestionErrorStats = loadQuestionErrorStats;
  loadQuestionErrorStats = function loadQuestionErrorStatsWithAnswers(...args) {
    loadAnswerStats();
    return baseLoadQuestionErrorStats.apply(this, args);
  };

  const baseRender = render;
  render = function renderWithAnswerStats(...args) {
    const result = baseRender.apply(this, args);
    renderAnswerStatsBox();
    return result;
  };
})();
