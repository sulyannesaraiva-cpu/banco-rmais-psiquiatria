/* Reportar erro na questão (ver supabase/question_reports.sql).
   - Qualquer pessoa logada: "Reportar erro nesta questão" (gabarito errado, texto cortado, falta
     figura...), com um campo opcional para explicar.
   - Administração: os reportes abertos entram na fila "Reportadas pelos usuários" (Administração >
     Pendências do banco) e aparecem embaixo da questão, com "Marcar como resolvido". O menu mostra
     quantas questões reportadas estão esperando. */

const REPORT_REASONS = [
  ["gabarito", "Gabarito errado"],
  ["texto", "Enunciado ou alternativa com erro ou cortado"],
  ["figura", "Falta figura ou imagem"],
  ["tema", "Tema ou classificação errada"],
  ["comentario", "Comentário com erro"],
  ["outro", "Outro problema"],
];
const REPORTED_BY_ME_KEY = "banco-rmais-reported-questions";

state.openReports = new Map();
state.openReportsStatus = "idle";
state.reportFormFor = null;
state.reportedByMe = new Set(readStoredJson(REPORTED_BY_ME_KEY, []));

function reportReasonLabel(value) {
  return (REPORT_REASONS.find(([key]) => key === value) || [null, value])[1];
}

/* Usado pelo filtro da Administração (applyFilters) e pelo resumo de pendências. */
function reportedQuestionIds() {
  return new Set(state.openReports.keys());
}

async function loadOpenReports() {
  if (!state.supabase || !state.isAdmin) return;
  state.openReportsStatus = "loading";
  const { data, error } = await state.supabase
    .from("question_reports")
    .select("id, question_id, author_name, reason, details, created_at")
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    console.warn("reportes indisponíveis:", error.message);
    state.openReportsStatus = "unavailable";
    renderPendingSummary();
    return;
  }
  const byQuestion = new Map();
  for (const row of data || []) {
    const id = String(row.question_id);
    if (!byQuestion.has(id)) byQuestion.set(id, []);
    byQuestion.get(id).push(row);
  }
  state.openReports = byQuestion;
  state.openReportsStatus = "ready";
  state.openReportsLoadedAt = Date.now();
  renderPendingSummary();
  if (el.status?.value === "reported") applyFilters({ preserveCurrent: true });
  else render();
}

async function sendQuestionReport(question, reason, details) {
  const status = document.querySelector("#reportStatus");
  const { error } = await state.supabase.from("question_reports").insert({
    question_id: question.id,
    user_id: state.authUser.id,
    author_name: authorNameForUser(),
    reason,
    details: details || null,
  });
  if (error) {
    status.hidden = false;
    status.textContent = /does not exist|schema cache/i.test(error.message)
      ? "O envio de reportes ainda não foi ativado no banco. Use os comentários da questão por enquanto."
      : `Não foi possível enviar: ${error.message}`;
    return false;
  }
  state.reportedByMe.add(question.id);
  localStorage.setItem(REPORTED_BY_ME_KEY, JSON.stringify([...state.reportedByMe].slice(-500)));
  if (state.isAdmin) loadOpenReports();
  return true;
}

async function resolveQuestionReports(questionId) {
  const { error } = await state.supabase
    .from("question_reports")
    .update({ resolved_at: new Date().toISOString(), resolved_by: state.authUser.id })
    .eq("question_id", questionId)
    .is("resolved_at", null);
  if (error) {
    setSyncStatus(`Erro ao resolver reporte: ${error.message}`);
    return;
  }
  state.openReports.delete(questionId);
  renderPendingSummary();
  if (el.status?.value === "reported") applyFilters({ preserveCurrent: true });
  else render();
}

function renderQuestionReport() {
  const box = document.querySelector("#questionReport");
  if (!box) return;
  const question = currentQuestion();
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  box.hidden = !question || examLocked;
  if (box.hidden) return;

  const button = document.querySelector("#reportQuestionBtn");
  const form = document.querySelector("#reportQuestionForm");
  const status = document.querySelector("#reportStatus");
  const formOpen = state.reportFormFor === question.id;
  form.hidden = !formOpen;
  button.hidden = formOpen;
  if (!formOpen && status.dataset.questionId !== question.id) {
    status.hidden = true;
    status.textContent = "";
  }
  button.textContent = state.reportedByMe.has(question.id) ? "Reportar outro erro nesta questão" : "Reportar erro nesta questão";

  const adminBox = document.querySelector("#questionReportsAdmin");
  const reports = state.isAdmin ? state.openReports.get(question.id) || [] : [];
  adminBox.hidden = !reports.length;
  const html = reports.length
    ? `<strong>${pluralize(reports.length, "reporte aberto", "reportes abertos")}</strong>
      <ul>${reports.map((report) => `<li><b>${escapeHtml(reportReasonLabel(report.reason))}</b>${report.details ? ` — ${escapeHtml(report.details)}` : ""}<small>${escapeHtml(report.author_name || "Usuário")} · ${escapeHtml(formatCommentDate(report.created_at))}</small></li>`).join("")}</ul>
      <button type="button" class="outline-btn" data-resolve-reports="${escapeHtml(question.id)}">Marcar como resolvido</button>`
    : "";
  if (adminBox.dataset.renderedHtml !== html) {
    adminBox.innerHTML = html;
    adminBox.dataset.renderedHtml = html;
  }
}

/* Contador de reportes abertos no menu (Administração) e no botão "Mais" do celular. */
function renderReportBadges() {
  const count = state.isAdmin ? state.openReports.size : 0;
  const targets = [
    document.querySelector('.tab[data-tab="topics"]'),
    document.querySelector('#bottomNav [data-nav="more"]'),
  ];
  for (const target of targets) {
    if (!target) continue;
    let badge = target.querySelector(".nav-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nav-badge";
      target.appendChild(badge);
    }
    badge.hidden = !count;
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.title = count ? `${pluralize(count, "questão reportada", "questões reportadas")} esperando revisão` : "";
  }
}

(function setupQuestionReports() {
  const box = document.querySelector("#questionReport");
  if (!box) return;
  const reasonSelect = document.querySelector("#reportReason");
  reasonSelect.innerHTML = REPORT_REASONS.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("");
  const status = document.querySelector("#reportStatus");
  const details = document.querySelector("#reportDetails");

  box.addEventListener("click", (event) => {
    const question = currentQuestion();
    if (!question) return;
    if (event.target.closest("#reportQuestionBtn")) {
      if (!state.authUser || !state.supabase) {
        status.hidden = false;
        status.dataset.questionId = question.id;
        status.textContent = "Entre na conta para reportar um erro.";
        return;
      }
      state.reportFormFor = question.id;
      status.hidden = true;
      details.value = "";
      renderQuestionReport();
      details.focus();
      return;
    }
    if (event.target.closest("#reportCancel")) {
      state.reportFormFor = null;
      renderQuestionReport();
      return;
    }
    const resolve = event.target.closest("[data-resolve-reports]");
    if (resolve) resolveQuestionReports(resolve.dataset.resolveReports);
  });

  document.querySelector("#reportQuestionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = currentQuestion();
    if (!question || !state.authUser) return;
    const submit = event.target.querySelector("[type=submit]");
    submit.disabled = true;
    const ok = await sendQuestionReport(question, reasonSelect.value, details.value.trim());
    submit.disabled = false;
    if (!ok) return;
    state.reportFormFor = null;
    status.hidden = false;
    status.dataset.questionId = question.id;
    status.textContent = "Obrigado! O reporte foi enviado para a revisão do banco.";
    renderQuestionReport();
  });

  const baseLoadQuestionErrorStats = loadQuestionErrorStats;
  loadQuestionErrorStats = function loadQuestionErrorStatsWithReports(...args) {
    loadOpenReports();
    return baseLoadQuestionErrorStats.apply(this, args);
  };

  /* Novos reportes chegam sem recarregar: confere de novo a cada 10 minutos e ao voltar à aba. */
  setInterval(() => {
    if (state.isAdmin && document.visibilityState === "visible") loadOpenReports();
  }, 10 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (state.isAdmin && document.visibilityState === "visible" && Date.now() - (state.openReportsLoadedAt || 0) > 60 * 1000) loadOpenReports();
  });

  const baseRender = render;
  render = function renderWithQuestionReport(...args) {
    const result = baseRender.apply(this, args);
    renderQuestionReport();
    renderReportBadges();
    return result;
  };
})();
