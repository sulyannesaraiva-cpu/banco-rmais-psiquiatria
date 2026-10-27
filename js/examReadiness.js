/* "Até a prova" (aba Desempenho): progresso por tema do Estudo por temas, ordenado pelo peso do
   tema nas provas da banca do plano. Para cada tema: peso na prova, quanto do banco já foi feito,
   acerto e situação (Prioridade / Atenção / Em dia), com botão para treinar. No topo, o ritmo
   necessário para ver as questões que faltam até a data da prova comparado ao ritmo real das
   últimas 2 semanas. Sem data da prova no plano, mostra o progresso e pede a data. */

const READINESS_PACE_DAYS = 14;
const READINESS_BLOCK = 20;

function readinessExams(plan) {
  const exams = state.exams.filter((exam) => !exam.custom && examMatchesReviewTarget(exam, plan?.targetExam || "Todas", plan?.targetArea || "Todas"));
  return exams.length ? exams : state.exams.filter((exam) => !exam.custom);
}

function recentDailyPace() {
  const since = Date.now() - READINESS_PACE_DAYS * DAY_MS;
  const answered = (state.attempts || []).filter((attempt) => (Date.parse(attempt.answered_at || "") || 0) >= since).length;
  return answered / READINESS_PACE_DAYS;
}

function computeReadiness() {
  const plan = state.studyPlan;
  const exams = readinessExams(plan);
  const weights = new Map();
  let examTotal = 0;
  for (const exam of exams) {
    for (const question of exam.questions || []) {
      if (isExcluded(question.id)) continue;
      const topic = topicForQuestion(question);
      weights.set(topic, (weights.get(topic) || 0) + 1);
      examTotal += 1;
    }
  }
  const byTopic = new Map();
  for (const question of todayStudyPool()) {
    const topic = topicForQuestion(question);
    const row = byTopic.get(topic) || { topic, total: 0, done: 0, correct: 0, questions: [] };
    const grade = getProgress(question.id).grade;
    row.total += 1;
    row.questions.push(question);
    if (grade) {
      row.done += 1;
      if (grade === "correct") row.correct += 1;
    }
    byTopic.set(topic, row);
  }
  const rows = [...byTopic.values()].map((row) => {
    const weight = examTotal ? (weights.get(row.topic) || 0) / examTotal : 0;
    const coverage = row.total ? row.done / row.total : 0;
    const accuracy = row.done >= 5 ? row.correct / row.done : null;
    let status = "ok";
    if (weight >= 0.05 && ((accuracy !== null && accuracy < 0.65) || coverage < 0.3)) status = "priority";
    else if ((accuracy !== null && accuracy < 0.7) || coverage < 0.5) status = "attention";
    return { ...row, weight, coverage, accuracy, status };
  }).sort((a, b) => b.weight - a.weight || b.total - a.total);

  const remaining = rows.reduce((sum, row) => sum + row.total - row.done, 0);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const daysLeft = typeof daysUntilExam === "function" ? daysUntilExam(plan) : null;
  const pace = recentDailyPace();
  const needed = daysLeft && daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null;
  const projected = daysLeft && daysLeft > 0 ? Math.min(total, (total - remaining) + Math.round(pace * daysLeft)) : null;
  return { plan, rows, remaining, total, daysLeft, pace, needed, projected, examLabel: plan?.targetExam && plan.targetExam !== "Todas" ? plan.targetExam : "todas as bancas" };
}

const READINESS_STATUS = {
  priority: ["Prioridade", "bad"],
  attention: ["Atenção", "mid"],
  ok: ["Em dia", "good"],
};

function readinessHtml() {
  const data = computeReadiness();
  const format = (n) => Math.round(n).toLocaleString("pt-BR");
  const done = data.total - data.remaining;
  let summary;
  if (data.daysLeft === null) {
    summary = `<p class="panel-line">Você já fez ${format(done)} de ${format(data.total)} questões do banco. <button type="button" class="link-btn" data-readiness-plan>Informe a data da prova no seu plano</button> para ver o ritmo necessário.</p>`;
  } else if (data.daysLeft <= 0) {
    summary = `<p class="panel-line">A data da prova do plano já passou. Você fez ${format(done)} de ${format(data.total)} questões. <button type="button" class="link-btn" data-readiness-plan>Atualizar o plano</button></p>`;
  } else {
    const onTrack = data.pace >= data.needed;
    summary = `
      <div class="readiness-summary">
        <div><strong>${pluralize(data.daysLeft, "dia", "dias")}</strong><span>até a prova</span></div>
        <div><strong>${format(data.remaining)}</strong><span>questões inéditas</span></div>
        <div><strong>${format(data.needed)}/dia</strong><span>para ver todas</span></div>
        <div class="${onTrack ? "good" : "bad"}"><strong>${data.pace >= 1 ? format(data.pace) : data.pace.toFixed(1).replace(".", ",")}/dia</strong><span>seu ritmo (14 dias)</span></div>
      </div>
      <p class="panel-line">${onTrack
        ? "No seu ritmo atual, você vê todo o banco antes da prova."
        : `No seu ritmo atual, você chega à prova com cerca de ${Math.round((data.projected / data.total) * 100)}% do banco feito. Priorize os temas marcados como Prioridade, que pesam mais ${escapeHtml(planExamPhrase(data.plan))}.`}</p>`;
  }
  const rows = data.rows.map((row) => {
    const [label, tone] = READINESS_STATUS[row.status];
    const coverage = Math.round(row.coverage * 100);
    return `
      <li>
        <div class="readiness-head">
          <strong>${escapeHtml(row.topic)}</strong>
          <span class="readiness-status ${tone}">${label}</span>
        </div>
        <div class="readiness-meta">
          <span>${row.weight ? `${(row.weight * 100).toFixed(1).replace(".", ",")}% da prova` : "fora das provas"}</span>
          <span>${row.done}/${row.total} feitas (${coverage}%)</span>
          <span>${row.accuracy === null ? "acerto: poucas respostas" : `acerto ${Math.round(row.accuracy * 100)}%`}</span>
          <button type="button" class="link-btn" data-readiness-train="${escapeHtml(row.topic)}">Treinar</button>
        </div>
        <i class="readiness-bar" style="--w:${coverage}%"></i>
      </li>`;
  }).join("");
  return `
    <section class="today-card readiness" aria-label="Até a prova">
      <div class="today-card-head"><h3>Até a prova</h3><span>${escapeHtml(data.examLabel)} · temas pelo peso na prova</span></div>
      ${summary}
      <ol class="readiness-list">${rows}</ol>
    </section>`;
}

/* Bloco do tema: inéditas primeiro, depois as erradas, depois as demais. */
function startReadinessTraining(topic) {
  const questions = todayStudyPool().filter((question) => topicForQuestion(question) === topic);
  const unseen = shuffle(questions.filter((question) => !getProgress(question.id).grade));
  const wrong = shuffle(questions.filter((question) => getProgress(question.id).grade === "wrong"));
  const rest = state.unseenOnly ? [] : shuffle(questions.filter((question) => getProgress(question.id).grade === "correct"));
  const queue = [...unseen, ...wrong, ...rest].slice(0, READINESS_BLOCK);
  if (queue.length) startStudyRun(queue, { kind: "readiness", label: `Até a prova · ${topic}` });
}

(function setupExamReadiness() {
  const panel = document.querySelector("#performancePanel");
  if (!panel) return;
  panel.addEventListener("click", (event) => {
    const train = event.target.closest("[data-readiness-train]");
    if (train) {
      startReadinessTraining(train.dataset.readinessTrain);
      return;
    }
    if (event.target.closest("[data-readiness-plan]")) {
      state.planDraft = defaultPlanDraft({ openedByUser: true });
      setTab("overview");
      render();
    }
  });

  const baseRenderPerformancePanel = renderPerformancePanel;
  renderPerformancePanel = function renderPerformancePanelWithReadiness(...args) {
    const result = baseRenderPerformancePanel.apply(this, args);
    const html = readinessHtml();
    let host = panel.querySelector("#readinessHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "readinessHost";
      /* Logo depois dos cartões de resumo, antes da evolução. */
      const cards = panel.querySelector(".perf-cards");
      if (cards) cards.after(host);
      else panel.prepend(host);
    }
    if (host.dataset.renderedHtml !== html) {
      host.innerHTML = html;
      host.dataset.renderedHtml = html;
    }
    return result;
  };
})();
