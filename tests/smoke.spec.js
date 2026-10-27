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
  await page.locator('[data-question-label="decorar"]').click();
  await page.locator("#reportQuestionBtn").click();
  await expect(page.locator("#reportStatus")).toContainText("Entre na conta");
  const letter = await page.evaluate(() => {
    const q = effectiveQuestion(currentQuestion());
    return q.options.find((o) => o.letter !== q.correctAnswer).letter;
  });
  await page.locator(`#optionsList [data-option="${letter}"]`).click();
  await page.locator("#confirmAnswerBtn").click();
  await page.evaluate(() => { finishSession(); setTab("overview"); render(); document.querySelector("#todayReviews").open = true; render(); });
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
