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
