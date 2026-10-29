// Fluxos principais do Banco R+. Cada teste abre o site limpo (sem login, sem dados salvos).
const { test, expect } = require("@playwright/test");

/* Troca de aba pelo menu (no celular o menu fica na gaveta; o clique por script vale nos dois). */
async function goTab(page, tab) {
  await page.evaluate((name) => document.querySelector(`[data-tab="${name}"]`).click(), tab);
}

async function openSite(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForFunction(() => typeof state !== "undefined" && state.questions.length > 1000 && state.exams.length > 10);
  return errors;
}

/* Marca a alternativa certa da questão atual e confirma. */
async function answerCurrent(page) {
  const letter = await page.evaluate(() => effectiveQuestion(currentQuestion()).correctAnswer);
  await page.locator(`#optionsList [data-option="${letter}"]`).click();
  await page.locator("#confirmAnswerBtn").click();
}

test("carrega o banco sem erros", async ({ page }) => {
  const errors = await openSite(page);
  const counts = await page.evaluate(() => ({ questions: state.questions.length, exams: state.exams.length, topics: allTopics().length }));
  expect(counts.questions).toBeGreaterThan(1500);
  expect(counts.exams).toBeGreaterThan(40);
  expect(counts.topics).toBeGreaterThan(15);
  expect(errors).toEqual([]);
});

test("estudo por temas: bloco, resposta e finalizar", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  await expect(page.locator("#optionsList [data-option]").first()).toBeVisible();
  await answerCurrent(page);
  await expect(page.locator("#answerBox")).toContainText("Gabarito");
  expect(await page.evaluate(() => currentRunAnsweredQuestions().length)).toBe(1);
  await page.evaluate(() => finishSession());
  expect(await page.evaluate(() => hasActiveQuestionFlow())).toBe(false);
  expect(errors).toEqual([]);
});

test("tema: Continuar e Ver todas", async ({ page }) => {
  await openSite(page);
  await goTab(page, "activity");
  const row = page.locator(".topic-row").first();
  await row.locator(":scope > .topic-row-actions [data-run-mode=all]").click();
  const all = await page.evaluate(() => ({ topic: state.topicActive, n: state.filtered.length }));
  expect(all.topic).toBe(true);
  expect(all.n).toBeGreaterThan(5);
});

test("prova: sair guarda a posição e não reabre sozinha", async ({ page }) => {
  await openSite(page);
  await goTab(page, "exams");
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamBtn").click();
  await answerCurrent(page);
  await page.locator("#nextBtn").click();
  await page.locator("#nextBtn").click();
  const indexBefore = await page.evaluate(() => state.index);
  await page.locator("[data-run-pause]").click();
  expect(await page.evaluate(() => state.examActive)).toBe(false);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => state.examActive)).toBe(false);
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamBtn").click();
  expect(await page.evaluate(() => state.index)).toBe(indexBefore);
});

test("prova pausada mantém a posição depois de fazer e finalizar outro bloco", async ({ page }) => {
  await openSite(page);
  await goTab(page, "exams");
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamBtn").click();
  for (let i = 0; i < 3; i += 1) await page.locator("#nextBtn").click();
  const indexBefore = await page.evaluate(() => state.index);
  await page.locator("[data-run-pause]").click();
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  await answerCurrent(page);
  await page.locator("[data-run-finish]").click();
  await page.locator("[data-run-finish]").click();
  expect(await page.evaluate(() => hasActiveQuestionFlow())).toBe(false);
  await goTab(page, "exams");
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamBtn").click();
  expect(await page.evaluate(() => state.index)).toBe(indexBefore);
});

test("prova: sair durante a carga da conta (logada) não reabre a prova", async ({ page }) => {
  await openSite(page);
  /* Conta simulada com rede lenta (1,5 s), como a renovação do login. */
  await page.evaluate(() => {
    const slow = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 1500));
    const chain = () => {
      const c = {
        select: () => c, eq: () => c, order: () => c,
        range: () => slow({ data: [], error: null }),
        maybeSingle: () => slow({ data: null, error: null }),
        upsert: () => slow({ error: null }),
        insert: () => slow({ error: null }),
        then: (resolve, reject) => slow({ data: [], error: null }).then(resolve, reject),
      };
      return c;
    };
    state.supabase = { from: () => chain(), rpc: () => chain() };
    state.authUser = { id: "teste" };
  });
  await goTab(page, "exams");
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamBtn").click();
  await page.evaluate(() => { window.__load = loadCloudState(); });
  await page.waitForTimeout(300);
  await page.locator("[data-run-pause]").click();
  await page.evaluate(() => window.__load);
  expect(await page.evaluate(() => state.examActive)).toBe(false);
});

test("simulado: finaliza, guarda no histórico e conta no Desempenho", async ({ page }) => {
  await openSite(page);
  await goTab(page, "exams");
  await page.locator("#examSelect").selectOption("abp-2022-2022-2");
  await page.locator("#startExamSimulationBtn").click();
  for (let i = 0; i < 3; i += 1) {
    const letter = await page.evaluate(() => effectiveQuestion(currentQuestion()).correctAnswer);
    await page.locator(`#optionsList [data-option="${letter}"]`).click();
    await page.locator("#nextBtn").click();
  }
  const attemptsBefore = await page.evaluate(() => state.attempts.length);
  await page.evaluate(() => finishExamSimulation());
  const result = await page.evaluate(() => ({ history: state.simulationHistory.length, score: state.simulationHistory[0]?.correct }));
  expect(result.history).toBe(1);
  expect(result.score).toBe(3);
  expect(await page.evaluate(() => state.attempts.length)).toBe(attemptsBefore + 3);
});

test("tentativas feitas sem internet sobem para a conta sem duplicar", async ({ page }) => {
  await openSite(page);
  const result = await page.evaluate(async () => {
    const q = state.questions;
    const at = (min) => new Date(Date.now() - min * 60000).toISOString();
    const cloud = [{ question_id: q[4].id, answered_at: at(10), is_correct: true }];
    state.attempts = [
      { question_id: q[0].id, answered_at: at(50), is_correct: true, user_id: null },
      { question_id: q[1].id, answered_at: at(40), is_correct: false, user_id: "outra-pessoa" },
      { question_id: q[4].id, answered_at: cloud[0].answered_at, is_correct: true, user_id: "eu" },
    ];
    let inserts = 0;
    const chain = () => {
      const c = {
        select: () => c, eq: () => c, order: () => c,
        range: async (from, to) => ({ data: cloud.slice(from, to + 1), error: null }),
        insert: async (rows) => { inserts += rows.length; cloud.push(...rows); return { error: null }; },
      };
      return c;
    };
    state.supabase = { from: chain };
    state.authUser = { id: "eu" };
    await loadCloudAttempts();
    const first = inserts;
    await loadCloudAttempts();
    return { first, second: inserts - first };
  });
  expect(result.first).toBe(1);
  expect(result.second).toBe(0);
});

test("simulado personalizado: filtros, histórico e refazer o mesmo conjunto", async ({ page }) => {
  await openSite(page);
  await goTab(page, "exams");
  await page.locator("#customSimExam").selectOption("USP");
  await page.locator('[data-sim-size="20"]').click();
  await page.locator("#customSimStart").click();
  const run = await page.evaluate(() => {
    const institutionOf = new Map();
    state.exams.forEach((exam) => (exam.questions || []).forEach((q) => institutionOf.set(q.id, exam.institution)));
    return { simulation: state.examSimulationActive, n: state.filtered.length, allUSP: state.filtered.every((q) => institutionOf.get(q.id) === "USP"), ids: state.filtered.map((q) => q.id) };
  });
  expect(run.simulation).toBe(true);
  expect(run.n).toBe(20);
  expect(run.allUSP).toBe(true);
  await page.evaluate(() => { finishExamSimulation(); endExam(); });
  const entry = await page.evaluate(() => state.simulationHistory[0]);
  expect(entry.institution).toBe("USP");
  expect(entry.questionIds).toEqual(run.ids);
  await page.locator("[data-sim-retake]").first().click();
  expect(await page.evaluate(() => state.filtered.map((q) => q.id))).toEqual(run.ids);
});

test("busca de questões abre um bloco", async ({ page }) => {
  await openSite(page);
  await goTab(page, "activity");
  await page.locator("#questionSearchInput").fill("clozapina");
  await expect(page.locator("[data-search-study]")).toBeVisible();
  await page.locator("[data-search-study]").click();
  const run = await page.evaluate(() => ({ active: state.sessionActive, n: state.filtered.length }));
  expect(run.active).toBe(true);
  expect(run.n).toBeGreaterThan(10);
});

test("Hoje: plano e Só revisar agora", async ({ page }) => {
  await openSite(page);
  await page.evaluate(() => {
    const questions = allStudyQuestions().filter((q) => isReadyQuestion(effectiveQuestion(q))).slice(0, 12);
    for (const q of questions) state.progress[q.id] = { grade: "wrong", updatedAt: Date.now() - 86400e3, nextReviewAt: Date.now() - 3600e3, review: true };
    saveStudyPlan({ targetExam: "Todas", targetArea: "Todas", minutesPerDay: 60, examDate: "" });
    state.planDraft = null;
    setTab("overview");
    render();
  });
  await expect(page.locator("[data-today-action=review-due]")).toBeVisible();
  await page.locator("[data-today-action=review-due]").click();
  expect(await page.evaluate(() => state.filtered.length)).toBe(12);
});

test("simulado com tempo: entrega automática e relatório na tela da prova", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "exams");
  await page.locator('[data-sim-size="20"]').click();
  await page.locator("#customSimStart").click();
  await expect(page.locator("#simClock")).toContainText("Tempo restante");
  await page.evaluate(() => {
    state.filtered.slice(0, 10).forEach((q) => (state.examSimulationAnswers[q.id] = q.correctAnswer));
    state.examSimulationStartedAt = Date.now() - 20 * 3 * 60000 - 1000;
  });
  await expect(page.locator("#simReport")).toContainText("Tempo esgotado");
  await expect(page.locator("#simReport")).toContainText("Acertos por tema");
  const entry = await page.evaluate(() => state.simulationHistory[0]);
  expect(entry.correct).toBe(10);
  expect(entry.byTopic.length).toBeGreaterThan(0);
  expect(entry.timeUp).toBe(true);
  expect(errors).toEqual([]);
});

test("etiquetas, cartões dos erros e reportar sem login", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  /* No celular, etiquetas e "reportar" ficam atrás da linha de ferramentas da questão. */
  const mobile = await page.evaluate(() => isMobileLayout());
  if (mobile) await page.locator('[data-qtool="labels"]').click();
  await page.locator('[data-question-label="decorar"]').click();
  if (mobile) await page.locator('[data-qtool="more"]').click();
  await page.locator("#reportQuestionBtn").click();
  await expect(page.locator("#reportStatus")).toContainText("Entre na conta");
  const letter = await page.evaluate(() => {
    const q = effectiveQuestion(currentQuestion());
    return q.options.find((o) => o.letter !== q.correctAnswer).letter;
  });
  await page.locator(`#optionsList [data-option="${letter}"]`).click();
  await page.locator("#confirmAnswerBtn").click();
  await page.evaluate(() => { finishSession(); setTab("overview"); render(); });
  await page.locator('[data-today-action="more"]').click();
  await expect(page.locator("#todayReviews")).toBeVisible();
  await expect(page.locator('[data-label-review="decorar"]')).toContainText("1");
  await page.locator("#createErrorCardsBtn").click();
  expect(await page.evaluate(() => customFlashcardDeck().cards.length)).toBe(1);
  await page.locator('[data-label-review="decorar"]').click();
  expect(await page.evaluate(() => ({ active: state.sessionActive, n: state.filtered.length }))).toEqual({ active: true, n: 1 });
  expect(errors).toEqual([]);
});

test("só inéditas e ranking de temas por banca", async ({ page }) => {
  const errors = await openSite(page);
  await page.evaluate(() => {
    state.exams.flatMap((e) => e.questions || []).slice(0, 30).forEach((q) => (state.progress[q.id] = { grade: "correct", selected: q.correctAnswer }));
    saveProgress();
  });
  await goTab(page, "exams");
  await page.locator(".exam-study-card [data-unseen-toggle]").check();
  await page.locator("#startExamSetBtn").click();
  const run = await page.evaluate(() => ({ n: state.filtered.length, anyDone: state.filtered.some((q) => getProgress(q.id).grade) }));
  expect(run.n).toBeGreaterThan(100);
  expect(run.anyDone).toBe(false);
  await page.evaluate(() => endSession());
  await goTab(page, "exams");
  await expect(page.locator("#examTopicRanking .ranking-list li").first()).toBeVisible();
  await page.locator("[data-ranking-train]").first().click();
  expect(await page.evaluate(() => state.sessionActive && state.filtered.length > 0)).toBe(true);
  expect(errors).toEqual([]);
});

test("questões parecidas ao errar entram no bloco", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  const letter = await page.evaluate(() => {
    const q = effectiveQuestion(currentQuestion());
    return q.options.find((o) => o.letter !== q.correctAnswer).letter;
  });
  await page.locator(`#optionsList [data-option="${letter}"]`).click();
  await page.locator("#confirmAnswerBtn").click();
  await expect(page.locator("#similarPanel")).toContainText("Questões parecidas");
  const before = await page.evaluate(() => state.filtered.length);
  await page.locator('[data-similar-action="insert"]').click();
  await expect(page.locator("#similarPanel")).toContainText("logo depois desta");
  expect(await page.evaluate(() => state.filtered.length)).toBeGreaterThan(before);
  expect(errors).toEqual([]);
});

test("ajuste de leitura: tamanho, espaçamento e fonte ficam salvos", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  await page.locator("#readingBtn").click();
  await page.locator('[data-reading="larger"]').click();
  await page.locator('[data-reading-spacing="airy"]').click();
  await page.locator('[data-reading-font="serif"]').click();
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("#questionText")).zoom)).toBe("1.12");
  await answerCurrent(page);
  await expect(page.locator("#answerBox")).toContainText("Gabarito");
  await page.reload();
  await page.waitForFunction(() => typeof state !== "undefined" && state.questions.length > 1000);
  expect(await page.evaluate(() => state.reading)).toEqual({ size: 2, spacing: "airy", font: "serif" });
  expect(errors).toEqual([]);
});

test("flashcards de hoje: vencidos de vários decks + limite de novos", async ({ page }) => {
  const errors = await openSite(page);
  const queue = await page.evaluate(() => {
    const past = new Date(Date.now() - 86400e3).toISOString();
    state.flashcards.slice(0, 3).forEach((deck) => (state.flashcardProgress[deck.cards[0].id] = { reviewedAt: past, nextReviewAt: past, lastGrade: "good", streak: 1 }));
    saveFlashcardState();
    const q = dailyFlashcardQueue();
    return { due: q.due.length, fresh: q.fresh.length };
  });
  expect(queue).toEqual({ due: 3, fresh: 10 });
  await page.evaluate(() => startDueFlashcardsReview());
  await expect(page.locator("#flashcardSessionBar")).toContainText("1 de 13");
  for (let i = 0; i < 13; i += 1) {
    await page.locator("#showFlashcardAnswerBtn").click();
    await page.locator('[data-flashcard-grade="good"]').click();
  }
  const after = await page.evaluate(() => ({ session: state.flashcardSession, remaining: dailyFlashcardCount(), tab: state.activeTab }));
  expect(after).toEqual({ session: null, remaining: 0, tab: "overview" });
  expect(errors).toEqual([]);
});

test("flashcards por tema: mesmos temas do estudo e sessão do tema", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "flashcards");
  await expect(page.locator('[data-flashcard-topic="Transtornos Psicóticos"]')).toBeVisible();
  const topics = await page.evaluate(() => [...flashcardTopicIndex().topics.keys()].every((topic) => allTopics().includes(topic) || topic === "Outros cartões"));
  expect(topics).toBe(true);
  await page.locator('[data-flashcard-topic="Transtornos Psicóticos"] summary [data-flashcard-study-topic]').click();
  await expect(page.locator("#flashcardSessionBar")).toContainText("Transtornos Psicóticos");
  expect(await page.evaluate(() => currentFlashcard().subtheme)).toBe("Esquizofrenia e psicoses");
  expect(errors).toEqual([]);
});

test("até a prova: ritmo necessário e treino por tema", async ({ page }) => {
  const errors = await openSite(page);
  await page.evaluate(() => {
    const d = new Date(Date.now() + 60 * 86400e3);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    saveStudyPlan({ targetExam: "ENARE", targetArea: "Todas", minutesPerDay: 60, examDate: iso });
    state.planDraft = null;
  });
  await goTab(page, "history");
  await expect(page.locator("#readinessHost")).toContainText("60 dias");
  await page.locator("[data-readiness-train]").first().click();
  const run = await page.evaluate(() => ({ active: state.sessionActive, n: state.filtered.length }));
  expect(run.active).toBe(true);
  expect(run.n).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("revisão de véspera: cartão perto da prova e blocos de questões e flashcards", async ({ page }) => {
  const errors = await openSite(page);
  await page.evaluate(() => {
    const d = new Date(Date.now() + 3 * 86400e3);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    saveStudyPlan({ targetExam: "ENARE", targetArea: "Todas", minutesPerDay: 60, examDate: iso });
    state.planDraft = null;
    todayStudyPool().slice(0, 200).forEach((q, i) => { state.progress[q.id] = { grade: i % 3 ? "correct" : "wrong", selected: q.correctAnswer, lastWrongAt: Date.now() - 86400e3 }; });
    saveProgress();
    setTab("overview");
    render();
  });
  await expect(page.locator("#vesperaCard")).toContainText("revisão de véspera");
  await page.locator('#vesperaCard [data-vespera="questions"]').click();
  const run = await page.evaluate(() => ({ active: state.sessionActive, n: state.filtered.length }));
  expect(run.active).toBe(true);
  expect(run.n).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("plano com mais de uma prova e boas-vindas para quem chega", async ({ page }) => {
  const errors = await openSite(page);
  await expect(page.locator("#welcomeCard")).toContainText("Bem-vindo");
  await page.locator('[data-welcome="close"]').click();
  await expect(page.locator("#welcomeCard")).toBeHidden();
  await page.locator('[data-plan-exam="ENARE"]').click();
  await page.locator('[data-plan-exam="SES-DF"]').click();
  await page.locator('[data-today-action="save-plan"]').click();
  const plan = await page.evaluate(() => ({ exam: state.studyPlan.targetExam, exams: readinessExams(state.studyPlan).map((exam) => exam.institution) }));
  expect(plan.exam).toBe("ENARE + SES-DF");
  expect([...new Set(plan.exams)].sort()).toEqual(["ENARE", "SES-DF"]);
  expect(errors).toEqual([]);
});

test("simulador de fármacos: vias, receptores, comparar e questões do remédio", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await expect(page.locator(".pharma-hub-card[data-pharma-class]")).toHaveCount(7);
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await expect(page.locator("#pharmaPanel .pharma-brain")).toBeVisible();
  await page.locator('[data-pharma-drug="haloperidol"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("Parkinsonismo: risco alto");
  await page.locator('[data-pharma-drug="aripiprazol"]').click();
  await expect(page.locator("#pharmaPanel .pharma-receptors")).toContainText("agonista parcial");
  await page.locator('[data-pharma-mode="compare"]').click();
  await page.locator('[data-pharma-compare="a"]').selectOption("olanzapina");
  await page.locator('[data-pharma-compare="b"]').selectOption("aripiprazol");
  await expect(page.locator("#pharmaPanel .pharma-why")).toContainText("Ganho de peso");
  await page.locator('[data-pharma-mode="paths"]').click();
  await page.locator('[data-pharma-drug="clozapina"]').click();
  await page.locator("[data-pharma-study]").click();
  await expect(page.locator("#questionSearchInput")).toHaveValue("clozapina");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: sinapse com ocupação e rodada de treino", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="haloperidol"]').click();
  await page.locator("[data-pharma-occupancy]").evaluate((input) => {
    input.value = "85";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#pharmaSynapseView .pharma-reading")).toContainText("extrapiramidais");
  await page.locator('[data-pharma-drug="aripiprazol"]').click();
  await expect(page.locator("#pharmaSynapseView .pharma-reading")).toContainText("agonista parcial");
  await page.locator('[data-pharma-mode="quiz"]').click();
  for (let i = 0; i < 10; i += 1) {
    await page.locator("[data-pharma-answer]").first().click();
    await expect(page.locator(".pharma-feedback")).toBeVisible();
    await page.locator('[data-pharma-quiz="next"]').click();
  }
  await expect(page.locator(".pharma-quiz-end")).toContainText("Rodada concluída");
  await page.locator('[data-pharma-quiz="restart"]').click();
  await expect(page.locator(".pharma-quiz")).toContainText("Pergunta 1 de 10");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: antidepressivos (sistemas, sinapse e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="antidepressivos"]').click();
  await page.locator('[data-pharma-mode="paths"]').click();
  await page.locator('[data-pharma-drug="bupropiona"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("Serotonina");
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("sem efeito direto");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="mirtazapina"]').click();
  await expect(page.locator("#pharmaSynapseView .pharma-reading")).toContainText("α2");
  await page.locator('[data-pharma-drug="tranilcipromina"]').click();
  await expect(page.locator("#pharmaSynapseView .pharma-reading")).toContainText("irreversível");
  await page.locator('[data-pharma-mode="compare"]').click();
  await page.locator('[data-pharma-compare="a"]').selectOption("sertralina");
  await page.locator('[data-pharma-compare="b"]').selectOption("amitriptilina");
  await expect(page.locator("#pharmaPanel .pharma-why")).toContainText("Anticolinérgico");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  await page.locator("[data-pharma-hub]").click();
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await page.locator('[data-pharma-mode="quiz"]').click();
  await expect(page.locator(".pharma-quiz")).toContainText("Pergunta 1 de 10");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: estabilizadores (mecanismos, nível, interações e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="estabilizadores"]').click();
  await page.locator('[data-pharma-mode="paths"]').click();
  await page.locator('[data-pharma-drug="lamotrigina"]').click();
  await expect(page.locator("#pharmaPanel .pharma-effects").first()).toContainText("Prevenção de depressão: forte");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="litio"]').click();
  await page.locator("[data-pharma-level]").evaluate((input) => {
    input.value = "1.8";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#pharmaLevelView")).toContainText("Toxicidade");
  await page.locator('[data-pharma-inter="tiazidico"]').click();
  await expect(page.locator("#pharmaLevelView")).toContainText("Pode chegar a");
  await page.locator('[data-pharma-drug="lamotrigina"]').click();
  await page.locator('[data-pharma-inter="valproato"]').click();
  await expect(page.locator(".pharma-table")).toContainText("12,5 mg/dia");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulador de fármacos: ansiolíticos (GABA-A, meia-vida, equivalência e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="ansioliticos"]').click();
  await page.locator('[data-pharma-mode="paths"]').click();
  await page.locator('[data-pharma-drug="zolpidem"]').click();
  await expect(page.locator("#pharmaPanel .pharma-effects").first()).toContainText("Insônia: forte");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="diazepam"]').click();
  await expect(page.locator("#pharmaKineticsView")).toContainText("Acúmulo com uso diário");
  await page.locator("[data-pharma-stop]").click();
  await expect(page.locator("#pharmaKineticsView")).toContainText("Meia-vida longa");
  await page.locator('[data-pharma-eq="drug"]').selectOption("clonazepam");
  await page.locator('[data-pharma-eq="dose"]').fill("2");
  await expect(page.locator("#pharmaEqResult")).toContainText("40 mg de diazepam");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulador de fármacos: psicoestimulantes e TDAH (regiões, dia e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="estimulantes"]').click();
  await page.locator('[data-pharma-mode="paths"]').click();
  await page.locator('[data-pharma-drug="atomoxetina"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("sem potencial de abuso");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="metilfenidato-li"]').click();
  await expect(page.locator("#pharmaDayView")).toContainText("Efeito útil");
  await page.locator("[data-pharma-repeat]").click();
  await page.locator("[data-pharma-dose]").evaluate((input) => {
    input.value = "8";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("[data-pharma-dose-label]")).toHaveText("8h");
  await page.locator('[data-pharma-drug="guanfacina"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("semanas");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulador de fármacos: demências (vias, indicação, pulso e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="demencias"]').click();
  await page.locator('[data-pharma-drug="memantina"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("canal NMDA");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="donepezila"]').click();
  await page.locator('[data-pharma-dtype="lewy"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Só se donepezila e rivastigmina não forem toleradas");
  await page.locator("[data-pharma-pulse]").evaluate((input) => {
    input.value = "48";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#pharmaPulseView")).toContainText("investigar a causa");
  await page.locator('[data-pharma-inter="cyp"]').click();
  await page.locator('[data-pharma-drug="rivastigmina-oral"]').click();
  await expect(page.locator("#pharmaPulseView")).toContainText("Sem interação relevante");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulador de fármacos: dependência química (receptor, dissulfiram e treino)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="dependencia"]').click();
  await page.locator('[data-pharma-drug="dissulfiram"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("ALDH");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator("[data-pharma-drinks]").evaluate((input) => {
    input.value = "4";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#pharmaAldhView")).toContainText("Reação grave");
  await page.locator('[data-pharma-drug="buprenorfina"]').click();
  await page.locator("[data-pharma-bg]").click();
  await expect(page.locator("#pharmaAddView")).toContainText("Abstinência precipitada");
  await page.locator("[data-pharma-adddose]").evaluate((input) => {
    input.value = "0";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("[data-pharma-adddose-label]")).toHaveText("0%");
  await page.locator('[data-pharma-mode="quiz"]').click();
  await page.locator("[data-pharma-answer]").first().click();
  await expect(page.locator(".pharma-feedback")).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulador de fármacos: complementos (depósito, hipnóticos novos e escetamina)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await page.locator('[data-pharma-drug="brexpiprazol"]').click();
  await expect(page.locator("#pharmaPanel .pharma-receptors")).toContainText("agonista parcial");
  await page.locator('[data-pharma-mode="depot"]').click();
  await page.locator('[data-pharma-depot="aripiprazol-1m"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("14 dias");
  await page.locator("[data-pharma-depotstop]").click();
  await expect(page.locator("#pharmaPanel")).toContainText("Depois da última injeção");
  await page.locator('[data-pharma-mode="eps"]').click();
  await page.locator('[data-pharma-eps="discinesia"]').click();
  await expect(page.locator("#pharmaPanel .eps-steps")).toContainText("Suspender o anticolinérgico");
  await page.locator("[data-pharma-sources]").click();
  await expect(page.locator(".pharma-sources")).toContainText("tabela 1.28");
  await page.locator(".pharma-sources [data-pharma-sources-close]").click();
  await expect(page.locator(".pharma-sources")).toHaveCount(0);
  await page.locator("[data-pharma-hub]").click();
  await page.locator('[data-pharma-class="ansioliticos"]').click();
  await page.locator('[data-pharma-drug="suvorexanto"]').click();
  await expect(page.locator("#pharmaPanel .pharma-paths")).toContainText("Orexina");
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator("[data-pharma-stop]").click();
  await expect(page.locator("#pharmaKineticsView")).toContainText("Sem evidência de dependência");
  await page.locator("[data-pharma-hub]").click();
  await page.locator('[data-pharma-class="antidepressivos"]').click();
  await page.locator('[data-pharma-mode="synapse"]').click();
  await page.locator('[data-pharma-drug="escetamina"]').click();
  await expect(page.locator("#pharmaSynapseView")).toContainText("NMDA bloqueado");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: roteiro guiado até a checagem", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="dependencia"]').click();
  await page.locator('[data-pharma-tour-start="dq-precipitada"]').click();
  await expect(page.locator(".pharma-tour")).toContainText("Passo 1 de 3");
  await expect(page.locator("#pharmaAddView")).toContainText("Efeito teto");
  await page.locator("[data-pharma-tour-next]").click();
  await page.locator("[data-pharma-tour-next]").click();
  await expect(page.locator("#pharmaAddView")).toContainText("Abstinência precipitada");
  await page.locator("[data-pharma-tour-next]").click();
  await page.locator('[data-pharma-tour-answer="0"]').click();
  await expect(page.locator(".pharma-tour")).toContainText("Isso!");
  await page.locator(".pharma-tour-actions [data-pharma-tour-exit]").click();
  await expect(page.locator(".pharma-tour")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("simulador de fármacos: entre classes (por efeito e interações)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-cross-open="effect"]').click();
  await page.locator('[data-pharma-cross-effect="qt"]').click();
  await expect(page.locator("#pharmaPanel .cross-rank")).toContainText("Metadona");
  await page.locator("[data-pharma-hub]").click();
  await page.locator('[data-pharma-cross-open="inter"]').click();
  await page.locator("[data-pharma-cross-add]").selectOption("tranilcipromina");
  await page.locator("[data-pharma-cross-add]").selectOption("sertralina");
  await expect(page.locator("#pharmaPanel")).toContainText("Síndrome serotoninérgica: potencialmente fatal");
  await page.locator('[data-pharma-cross-remove="sertralina"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Escolha pelo menos dois");
  expect(errors).toEqual([]);
});
test("atlas de vias: núcleos da base (cenários, seguir o sinal e fontes)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="nucleos-base"]').click();
  await expect(page.locator("#pharmaPanel .atlas-svg")).toBeVisible();
  await page.locator('[data-atlas-scenario="parkinson"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("bradicinesia");
  await page.locator('[data-atlas-step="0"]').click();
  await expect(page.locator(".atlas-step")).toContainText("passo 1 de 6");
  await page.locator("[data-pharma-sources]").click();
  await expect(page.locator(".pharma-sources")).toContainText("Clinical Neurology for Psychiatrists");
  await page.locator(".pharma-sources [data-pharma-sources-close]").click();
  await page.locator('[data-atlas-scenario="antipsicotico"]').click();
  await page.locator("[data-atlas-link]").click();
  await expect(page.locator("#pharmaPanel .eps-steps")).toBeVisible();
  expect(errors).toEqual([]);
});
test("atlas de vias: circuitos frontoestriatais (lesione e veja)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="frontoestriatais"]').click();
  await page.locator('[data-atlas-circuit="cingulado"]').click();
  await page.locator('[data-atlas-lesion="thalamus"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Lesão no tálamo: síndrome apática");
  await expect(page.locator("#pharmaPanel")).toContainText("mutismo acinético");
  await page.locator('[data-atlas-circuit="orbitofrontal"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("TOC");
  await page.locator("[data-pharma-sources]").click();
  await expect(page.locator(".pharma-sources")).toContainText("Cummings");
  expect(errors).toEqual([]);
});
test("atlas de vias: sistema límbico e Papez (lesione e veja, seguir o sinal)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="limbico"]').click();
  await page.locator('[data-atlas-limbic="korsakoff"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Wernicke-Korsakoff");
  await expect(page.locator("#pharmaPanel")).toContainText("tiamina");
  await page.locator('[data-atlas-limbic="kluver"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Hiperoralidade");
  await page.locator('[data-atlas-step="0"]').click();
  await expect(page.locator(".atlas-step")).toContainText("passo 1 de 6");
  await page.locator("[data-pharma-sources]").click();
  await expect(page.locator(".pharma-sources")).toContainText("Quevedo");
  expect(errors).toEqual([]);
});
test("atlas de vias: neurotransmissores (sistemas e atalho para os fármacos)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="neurotransmissores"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("mesolímbica");
  await page.locator('[data-atlas-system="orexina"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("narcolepsia");
  await page.locator('[data-atlas-system="acetilcolina"]').click();
  await page.locator("[data-atlas-drugs]").click();
  await expect(page.locator("#pharmaPanel h2")).toHaveText("Fármacos nas demências");
  expect(errors).toEqual([]);
});
test("atlas de vias: eixo HHA (cenários e teste de supressão com dexametasona)", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="hha"]').click();
  await page.locator('[data-atlas-hpa="depressao"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Hiperatividade do eixo");
  await page.locator("[data-atlas-dex]").click();
  await expect(page.locator("#pharmaPanel")).toContainText("não suprime");
  await page.locator('[data-atlas-hpa="corticoide"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("psicose por corticoide");
  expect(errors).toEqual([]);
});
test("atlas de vias: vias longas (Brown-Séquard) e via óptica", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="vias-longas"]').click();
  await page.locator('[data-atlas-tract-lesion="cervical:E"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Dor e temperatura: no lado direito do corpo");
  await expect(page.locator("#pharmaPanel")).toContainText("Síndrome de Brown-Séquard");
  await page.locator("[data-atlas-home]").click();
  await page.locator('[data-atlas-module="via-optica"]').click();
  await page.locator('.optic-buttons [data-atlas-optic="B"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Hemianopsia bitemporal");
  await expect(page.locator(".field-quad.blind")).toHaveCount(4);
  expect(errors).toEqual([]);
});
test("atlas de vias: nervos cranianos e territórios arteriais", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="nervos-cranianos"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Nervos do tronco, por nível");
  await page.locator('.cn-buttons [data-atlas-cn="wallenberg"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Síndrome de Horner");
  await expect(page.locator(".cn-part.hit")).toHaveCount(4);
  await page.locator('[data-atlas-face="central"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Só a metade inferior da face");
  await page.locator("[data-atlas-home]").click();
  await page.locator('[data-atlas-module="territorios-arteriais"]').click();
  await page.locator('[data-atlas-artery="acp-bi"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Cegueira cortical");
  await expect(page.locator(".field-quad.blind")).toHaveCount(8);
  await page.locator('[data-atlas-artery="aca"]').click();
  await page.locator('[data-atlas-module="frontoestriatais"]').click();
  await expect(page.locator("#pharmaPanel h2")).toHaveText("Circuitos frontoestriatais");
  expect(errors).toEqual([]);
});
test("atlas de vias: lobos cerebrais", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="lobos"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Três síndromes frontais");
  await page.locator('.lobe-tabs [data-lobe="parietal"]').click();
  await page.locator('[data-lobe-region="1"]').click();
  await page.locator('[data-lobe-side="D"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Negligência do lado esquerdo");
  await page.locator('.lobe-tabs [data-lobe="temporal"]').click();
  await page.locator('[data-lobe-side="B"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Amnésia anterógrada grave");
  expect(errors).toEqual([]);
});
test("atlas de vias: afasias em três perguntas", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await page.locator('[data-atlas-module="afasias"]').click();
  await page.locator('[data-aph-q="fluent:1"]').click();
  await page.locator('[data-aph-q="comp:1"]').click();
  await page.locator('[data-aph-q="rep:0"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Afasia de condução");
  await page.locator('[data-aph-syndrome="wernicke"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("psicose aguda");
  await expect(page.locator(".aph-compare")).toContainText("Esquizofrenia");
  await page.locator("[data-aph-artery]").click();
  await expect(page.locator("#pharmaPanel h2")).toHaveText("Territórios arteriais");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: troca de antidepressivo", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator("[data-pharma-switch-open]").click();
  await page.locator('[data-pharma-switch="from"]').selectOption("fluoxetina");
  await page.locator('[data-pharma-switch="to"]').selectOption("tranilcipromina");
  await expect(page.locator("#pharmaPanel")).toContainText("esperar 5–6 semanas");
  await page.locator('[data-pharma-switch="from"]').selectOption("sertralina");
  await page.locator('[data-pharma-switch="to"]').selectOption("duloxetina");
  await expect(page.locator("#pharmaPanel")).toContainText("Troca direta possível");
  await expect(page.locator("#pharmaPanel")).toContainText("60 mg/dia");
  await page.locator("[data-pharma-switch-swap]").click();
  await expect(page.locator('[data-pharma-switch="from"]')).toHaveValue("duloxetina");
  expect(errors).toEqual([]);
});
test("interações: tabagismo muda o nível da clozapina", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-cross-open="inter"]').click();
  await page.locator("[data-pharma-cross-add]").selectOption("clozapina");
  await page.locator("[data-pharma-smoking]").selectOption("parou");
  await expect(page.locator("#pharmaPanel")).toContainText("Clozapina e tabagismo");
  await expect(page.locator("#pharmaPanel")).toContainText("75% da original");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: ferramenta de segurança", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator("[data-pharma-safety-open]").first().click();
  await page.locator('[data-safety-event="snm"]').click();
  await expect(page.locator(".safety-detail")).toContainText("Dantroleno");
  await page.locator('[data-safety-drug="antipsicoticos:clozapina"]').click();
  await expect(page.locator(".pharma-safety-chips")).toContainText("Agranulocitose");
  await page.locator('.pharma-safety-chips [data-pharma-safety-open="agranulocitose"]').click();
  await expect(page.locator(".safety-detail h3")).toHaveText("Agranulocitose");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: populações especiais", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator("[data-pharma-safety-open]").first().click();
  await page.locator('[data-safety-event="snm"]').click();
  await page.locator('[data-safety-drug="antipsicoticos:clozapina"]').click();
  await expect(page.locator(".pop-block")).toContainText("Populações especiais");
  await page.locator('.pop-block [data-pop-field="i"]').click();
  await expect(page.locator(".pop-detail")).toContainText("12,5 mg");
  await page.locator('.pop-block [data-pop-field="g"]').click();
  await expect(page.locator(".pop-detail")).toContainText("CANMAT");
  await page.locator('.pop-block [data-pop-field="g"]').click();
  await expect(page.locator(".pop-detail")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("psicofarmacologia: níveis séricos de antipsicóticos", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator("[data-pharma-levels-open]").first().click();
  await expect(page.locator("#pharmaPanel h2")).toHaveText("Níveis séricos");
  await page.locator('[data-lv-drug="clozapina"]').click();
  await page.locator('[data-lv-smoke="nao"]').click();
  await page.locator('[data-lv-sex="f"]').click();
  await page.locator('[data-lv-input="dose"]').fill("300");
  await expect(page.locator(".lv-numbers")).toContainText("396 ng/mL");
  await expect(page.locator(".lv-cloz")).toContainText("Miocardite");
  await page.locator('[data-lv-input="measured"]').fill("150");
  await expect(page.locator(".lv-result")).toContainText("Bem abaixo do esperado");
  await page.locator('[data-lv-drug="haloperidol"]').click();
  await expect(page.locator(".lv-cloz")).toHaveCount(0);
  await expect(page.locator(".lv-numbers")).toContainText("Dose para o limiar");
  expect(errors).toEqual([]);
});
test("simulador de fármacos: cartão explicativo de cada alvo", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await page.locator('[data-pharma-target="D2"]').first().click();
  await expect(page.locator(".pharma-target-card")).toContainText("Receptor de dopamina D2");
  await expect(page.locator(".pharma-target-card")).toContainText("Efeitos indesejados");
  await page.locator('.pharma-target-card [data-pharma-target=""]').click();
  await expect(page.locator(".pharma-target-card")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("troca de medicamentos: doses em mg e retirada gradual", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator("[data-pharma-switch-open]").click();
  await page.locator('[data-pharma-switch="from"]').selectOption("citalopram");
  await page.locator('[data-pharma-switch="to"]').selectOption("mirtazapina");
  await page.locator('[data-dose-input="switch"]').fill("40");
  await page.locator('[data-dose-input="switch"]').press("Enter");
  await page.locator('[data-dose-input="switch"]').blur();
  await expect(page.locator(".dose-table")).toContainText("2,5 mg");
  await expect(page.locator(".dose-table tbody tr")).toHaveCount(6);
  await page.locator('[data-switch-tab="taper"]').click();
  await page.locator('[data-taper-field="use"]').selectOption("gt24");
  await expect(page.locator("#pharmaPanel")).toContainText("Risco alto de retirada");
  await expect(page.locator(".taper-compare > div")).toHaveCount(4);
  await expect(page.locator('[data-taper-speed="2"]')).toHaveClass(/active/);
  await page.locator('[data-taper-speed="0"]').click();
  await expect(page.locator(".dose-table thead")).toContainText("SERT");
  await page.locator('[data-dose-class="ap"]').click();
  await page.locator('[data-switch-tab="switch"]').click();
  await page.locator('[data-ap-switch="from"]').selectOption("olanzapina");
  await page.locator('[data-ap-switch="to"]').selectOption("aripiprazol");
  await expect(page.locator("#pharmaPanel")).toContainText("3–4 semanas");
  await page.locator('[data-dose-class="bz"]').click();
  await page.locator('[data-bz-switch="from"]').selectOption("alprazolam");
  await expect(page.locator("#pharmaPanel")).toContainText("≈ diazepam 10 mg");
  await page.locator("[data-bz-to-taper]").click();
  await expect(page.locator('[data-taper-field="drug"]')).toHaveValue("clonazepam");
  await expect(page.locator(".dose-table").first()).toContainText("5 gotas");
  await expect(page.locator("#pharmaPanel")).toContainText("No Brasil: Clonazepam");
  expect(errors).toEqual([]);
});
test("simular: seções Psicofarmacologia e Neuroanatomia e o atalho Ver no atlas", async ({ page }) => {
  const errors = await openSite(page);
  await goTab(page, "pharma");
  await page.locator('[data-sim-section="atlas"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Circuitos e sistemas");
  await expect(page.locator("#pharmaPanel")).toContainText("Vias e lesões");
  await page.locator('[data-sim-section="drugs"]').click();
  await expect(page.locator("#pharmaPanel")).toContainText("Ferramentas");
  await page.locator('[data-pharma-class="antipsicoticos"]').click();
  await expect(page.locator('.pharma-modes [data-pharma-mode="paths"]')).toHaveText("Mecanismo");
  await page.locator("[data-atlas-goto]").click();
  await expect(page.locator("#pharmaPanel h2")).toHaveText("Núcleos da base");
  await expect(page.locator("#pharmaPanel")).toContainText("Parkinsonismo induzido");
  expect(errors).toEqual([]);
});
test("navegação por áreas: Hoje, Estudar (com seletor), Simular e Você", async ({ page }) => {
  const errors = await openSite(page);
  const mobile = await page.evaluate(() => isMobileLayout());
  test.skip(!mobile, "barra de baixo só existe no celular");
  await page.locator('#bottomNav [data-nav="study"]').click();
  await expect(page.locator("#studySubnav")).toBeVisible();
  await page.locator('#studySubnav [data-subnav="exams"]').click();
  expect(await page.evaluate(() => state.activeTab)).toBe("exams");
  await page.locator('#bottomNav [data-nav="simulate"]').click();
  expect(await page.evaluate(() => state.activeTab)).toBe("pharma");
  await expect(page.locator("#studySubnav")).toBeHidden();
  await page.locator('#bottomNav [data-nav="study"]').click();
  expect(await page.evaluate(() => state.activeTab)).toBe("exams");
  await page.locator('#bottomNav [data-nav="you"]').click();
  await expect(page.locator("#authPanel")).toBeVisible();
  expect(errors).toEqual([]);
});
test("questão no celular: mapa recolhido, ferramentas e barra fixa", async ({ page }) => {
  const errors = await openSite(page);
  const mobile = await page.evaluate(() => isMobileLayout());
  test.skip(!mobile, "layout de questão compacto só no celular");
  await goTab(page, "activity");
  await page.locator("#startSessionBtn").click();
  await expect(page.locator("#questionMap")).toBeHidden();
  await page.locator("#positionLabel").click();
  await expect(page.locator("#questionMap")).toBeVisible();
  await page.locator("#questionMap button").nth(1).click();
  await expect(page.locator("#questionMap")).toBeHidden();
  expect(await page.evaluate(() => state.index)).toBe(1);
  await expect(page.locator("#commentsAccordion")).toBeHidden();
  await page.locator('[data-qtool="comments"]').click();
  await expect(page.locator("#commentsAccordion")).toBeVisible();
  await answerCurrent(page);
  await page.locator('[data-qtool="concept"]').click();
  await expect(page.locator("#conceptPanel")).toBeVisible();
  await expect(page.locator("#commentsAccordion")).toBeHidden();
  expect(errors).toEqual([]);
});
test("estudar por temas no celular: filtros recolhidos e barra Começar bloco", async ({ page }) => {
  const errors = await openSite(page);
  const mobile = await page.evaluate(() => isMobileLayout());
  test.skip(!mobile, "layout enxuto só no celular");
  await page.locator('#bottomNav [data-nav="study"]').click();
  await page.locator('#studySubnav [data-subnav="activity"]').click();
  await expect(page.locator("#studyFilters")).toBeHidden();
  await page.locator("#studyFiltersBtn").click();
  await expect(page.locator("#studyFilters")).toBeVisible();
  await page.locator('[data-topic-source="exams"]').click();
  await expect(page.locator(".study-filters-count")).toHaveText("1");
  await page.locator('[data-topic-source="mixed"]').click();
  await expect(page.locator("#blockQuickBar")).toContainText("temas marcados");
  await page.locator('[data-quickbar="start"]').click();
  expect(await page.evaluate(() => state.sessionActive && state.filtered.length > 0)).toBe(true);
  await expect(page.locator("#blockQuickBar")).toBeHidden();
  expect(errors).toEqual([]);
});