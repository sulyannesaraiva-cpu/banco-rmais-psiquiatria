/* Comparação com os outros usuários (totais anônimos; ver supabase/community_stats.sql):
   - na questão, depois de responder: "48% das pessoas erraram esta questão" (5+ pessoas);
   - no resultado do simulado de prova real: "Média de quem fez este simulado: 61% (12 pessoas)".
   Carregado ao entrar na conta e guardado no navegador por 12 horas. Sem as funções no banco
   (ou sem login), nada aparece. */

const COMMUNITY_STATS_KEY = "banco-rmais-community-stats";
const COMMUNITY_STATS_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function readCommunityStats() {
  const saved = readStoredJson(COMMUNITY_STATS_KEY, null);
  if (!saved?.questions) return null;
  return {
    savedAt: saved.savedAt || 0,
    questions: new Map(saved.questions),
    exams: new Map(saved.exams || []),
  };
}

state.communityStats = readCommunityStats();

async function fetchAllRows(rpcName) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; from < 20000; from += pageSize) {
    const { data, error } = await state.supabase.rpc(rpcName).range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function loadCommunityStats({ force = false } = {}) {
  if (!state.supabase || !state.authUser) return;
  if (!force && state.communityStats && Date.now() - state.communityStats.savedAt < COMMUNITY_STATS_MAX_AGE_MS) return;
  try {
    const [questionRows, examRows] = await Promise.all([fetchAllRows("question_difficulty"), fetchAllRows("exam_simulation_stats")]);
    const questions = questionRows.map((row) => [String(row.question_id), [Number(row.users) || 0, Number(row.users_wrong) || 0]]);
    const exams = examRows.map((row) => [String(row.exam_id), [Number(row.users) || 0, Number(row.average_score) || 0]]);
    localStorage.setItem(COMMUNITY_STATS_KEY, JSON.stringify({ savedAt: Date.now(), questions, exams }));
    state.communityStats = readCommunityStats();
    render();
  } catch (error) {
    console.warn("estatísticas da comunidade indisponíveis:", error.message);
  }
}

function questionCommunityLine(question) {
  const entry = state.communityStats?.questions.get(String(question?.id));
  if (!entry) return "";
  const [users, wrong] = entry;
  const percent = Math.round((wrong / users) * 100);
  return `${percent}% das ${users} pessoas que responderam erraram esta questão.`;
}

function examCommunityLine(examId) {
  const entry = state.communityStats?.exams.get(String(examId));
  if (!entry) return "";
  const [users, average] = entry;
  return `<p class="panel-line community-line">Média de quem fez este simulado: <strong>${Math.round(average)}%</strong> (${users} pessoas).</p>`;
}

(function setupCommunityStats() {
  const baseLoadCloudState = loadCloudState;
  loadCloudState = async function loadCloudStateWithCommunity(...args) {
    const result = await baseLoadCloudState.apply(this, args);
    loadCommunityStats();
    return result;
  };

  const baseRender = render;
  render = function renderWithCommunity(...args) {
    const result = baseRender.apply(this, args);
    const line = document.querySelector("#communityLine");
    if (line) {
      const question = currentQuestion();
      const answered = question && el.answer?.classList.contains("visible");
      const text = answered ? questionCommunityLine(question) : "";
      line.hidden = !text;
      if (line.textContent !== text) line.textContent = text;
    }
    return result;
  };

  const baseRenderExamResult = renderExamResult;
  renderExamResult = function renderExamResultWithCommunity(...args) {
    const result = baseRenderExamResult.apply(this, args);
    if (el.examResult && state.examSimulationActive && state.examSimulationFinished) {
      el.examResult.insertAdjacentHTML("beforeend", examCommunityLine(state.activeExamId));
    }
    return result;
  };
})();
