const SUPABASE_URL = "https://ejseesgzjdabsndtdung.supabase.co";
const SUPABASE_KEY = "sb_publishable_pLC5bh3LWUTi1w_7BoSCZg_ahBnuZ36";
const storedSidebarState = localStorage.getItem("banco-rmais-sidebar-collapsed");

const state = {
  questions: [],
  exams: [],
  filtered: [],
  index: 0,
  selected: null,
  progress: JSON.parse(localStorage.getItem("banco-rmais-progress") || "{}"),
  attempts: JSON.parse(localStorage.getItem("banco-rmais-attempts") || "[]"),
  reviewSchedule: JSON.parse(localStorage.getItem("banco-rmais-review-schedule") || "{}"),
  corrections: JSON.parse(localStorage.getItem("banco-rmais-corrections") || "{}"),
  excluded: JSON.parse(localStorage.getItem("banco-rmais-excluded") || "[]"),
  discardedOptions: JSON.parse(localStorage.getItem("banco-rmais-discarded-options") || "{}"),
  positions: JSON.parse(localStorage.getItem("banco-rmais-positions") || "{}"),
  selectedTopics: JSON.parse(localStorage.getItem("banco-rmais-selected-topics") || "null"),
  selectedSubthemes: JSON.parse(localStorage.getItem("banco-rmais-selected-subthemes") || "[]"),
  refineSubthemes: localStorage.getItem("banco-rmais-refine-subthemes") === "true",
  sessionSize: Number(localStorage.getItem("banco-rmais-session-size") || "30"),
  includeReviewsInSession: localStorage.getItem("banco-rmais-include-reviews") === "true",
  sessionSource: localStorage.getItem("banco-rmais-session-source") || "content",
  topicActive: false,
  topicIds: [],
  sessionActive: false,
  sessionIds: [],
  examActive: false,
  examSimulationActive: false,
  examSimulationFinished: false,
  examSimulationStartedAt: null,
  examSimulationElapsedMs: 0,
  examSimulationErrorIds: [],
  examSimulationAnswers: {},
  activeExamId: "",
  examSetActive: false,
  examSetIds: [],
  spacedReviewActive: false,
  spacedReviewIds: [],
  smartTrainingActive: false,
  smartTrainingIds: [],
  activeTab: "overview",
  filterKey: "",
  editing: false,
  sessionCompletionMessage: "",
  examCompletionMessage: "",
  activeAnswers: {},
  supabase: null,
  authUser: null,
  cloudReady: false,
  syncTimer: null,
  settingsSyncTimer: null,
  sidebarCollapsed:
    storedSidebarState === null ? window.matchMedia("(max-width: 860px)").matches : storedSidebarState === "true",
};

const MIN_SUBTHEME_COUNT = 10;
const PSYCHOPHARM_SESSION_TOPIC = "Psicofarmacologia e terapêutica psiquiátrica";

const SESSION_TOPIC_GROUPS = [
  {
    label: "Demências e transtornos neurocognitivos",
    sources: ["Demências"],
  },
  {
    label: "Delirium, consciência e neuropsiquiatria clínica",
    sources: ["Coma e alterações"],
  },
  {
    label: "Ansiedade, TOC, trauma e somatoformes",
    sources: [
      "Transtornos de Ansiedade",
      "Transtorno Obsessivo-Compulsivo",
      "Transtornos Relacionados a Trauma",
      "Transtornos Somatiformes",
    ],
  },
];

const SUBTHEME_RULES = [
  {
    label: "Depressão e suicídio",
    keywords: ["depress", "distimia", "luto", "suicid", "autoles", "eletroconvulsoterapia", "ect"],
  },
  {
    label: "Transtorno bipolar e mania",
    keywords: ["bipolar", "mania", "maniaco", "maníaco", "hipomania", "ciclotim"],
  },
  {
    label: "Antidepressivos",
    keywords: ["antidepress", "ssri", "isrs", "fluoxetina", "sertralina", "paroxetina", "venlafaxina", "duloxetina", "bupropiona", "mirtazapina", "triciclico", "tricíclico"],
  },
  {
    label: "Antipsicóticos",
    keywords: ["antipsicot", "clozapina", "olanzapina", "quetiapina", "risperidona", "haloperidol", "aripiprazol", "síndrome neuroléptica", "sindrome neuroleptica"],
  },
  {
    label: "Estabilizadores do humor",
    keywords: ["litio", "lítio", "valproato", "carbamazepina", "lamotrigina", "estabilizador"],
  },
  {
    label: "Benzodiazepínicos e sedativos",
    keywords: ["benzodiazep", "diazepam", "clonazepam", "alprazolam", "zolpidem", "sedativo"],
  },
  {
    label: "Álcool e abstinência",
    keywords: ["alcool", "álcool", "abstinencia alcool", "abstinência alcool", "delirium tremens", "dependencia alcool", "dependência alcool"],
  },
  {
    label: "Drogas e intoxicações",
    keywords: ["cocaina", "cocaína", "crack", "cannabis", "maconha", "opioide", "anfetamina", "intoxic", "dependencia quimica", "dependência química", "redução de danos", "reducao de danos"],
  },
  {
    label: "TEA e neurodesenvolvimento",
    keywords: ["autis", "tea", "espectro autista", "neurodesenvolvimento", "desenvolvimento neuropsicomotor"],
  },
  {
    label: "TDAH e comportamento disruptivo",
    keywords: ["tdah", "hiperatividade", "déficit de atenção", "deficit de atencao", "oposição", "oposicao", "desafio", "conduta", "bullying"],
  },
  {
    label: "Demências e rastreio cognitivo",
    keywords: ["demencia", "demência", "alzheimer", "minimental", "mini mental", "comprometimento cognitivo", "neurocognitivo", "rastreio cognitivo"],
  },
  {
    label: "Delirium e alterações da consciência",
    keywords: ["delirium", "coma", "consciência", "consciencia", "rebaixamento", "estado confusional", "orientação", "orientacao"],
  },
  {
    label: "Psicopatologia e exame mental",
    keywords: ["exame do estado mental", "psicopatologia", "delirio", "delírio", "alucin", "juízo", "juizo", "insight", "sensopercep", "pensamento"],
  },
  {
    label: "Ansiedade, TOC e trauma",
    keywords: ["ansiedade", "panico", "pânico", "fobia", "toc", "obsess", "compuls", "trauma", "tept", "estresse pós", "estresse pos"],
  },
  {
    label: "Sono",
    keywords: ["sono", "insonia", "insônia", "apneia", "narcolepsia", "terror noturno", "pesadelo", "sonolência", "sonolencia"],
  },
  {
    label: "Alimentares",
    keywords: ["anorexia", "bulimia", "compulsão alimentar", "compulsao alimentar", "transtorno alimentar", "imagem corporal"],
  },
  {
    label: "Personalidade",
    keywords: ["personalidade", "borderline", "antissocial", "narcis", "histri", "esquiva", "dependente"],
  },
  {
    label: "Forense, ética e legislação",
    keywords: ["forense", "ética", "etica", "lei", "legislação", "legislacao", "inimput", "perícia", "pericia", "capacidade civil", "interdição", "interdicao", "sigilo", "internação involuntária", "internacao involuntaria"],
  },
  {
    label: "Psicoterapia",
    keywords: ["psicoterapia", "terapia cognitiva", "tcc", "psican", "transferência", "transferencia", "contratransfer", "terapia familiar", "terapia de grupo"],
  },
  {
    label: "Psicogeriatria e saúde do idoso",
    keywords: ["idoso", "geriatr", "fragilidade", "quedas", "polifarm", "envelhecimento", "cuidador", "funcionalidade"],
  },
];

let classificationCache = {
  text: new Map(),
  psychopharm: new Map(),
  topic: new Map(),
  subtheme: new Map(),
  catalog: new Map(),
  excluded: null,
};

function clearClassificationCache() {
  classificationCache = {
    text: new Map(),
    psychopharm: new Map(),
    topic: new Map(),
    subtheme: new Map(),
    catalog: new Map(),
    excluded: null,
  };
}

const el = {
  sidebarToggle: document.querySelector("#sidebarToggle"),
  startPanel: document.querySelector("#startPanel"),
  goSession: document.querySelector("#goSessionBtn"),
  goExams: document.querySelector("#goExamsBtn"),
  authPanel: document.querySelector("#authPanel"),
  authTitle: document.querySelector("#authTitle"),
  authStatus: document.querySelector("#authStatus"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  login: document.querySelector("#loginBtn"),
  signup: document.querySelector("#signupBtn"),
  logout: document.querySelector("#logoutBtn"),
  resetPassword: document.querySelector("#resetPasswordBtn"),
  syncStatus: document.querySelector("#syncStatus"),
  search: document.querySelector("#searchInput"),
  topic: document.querySelector("#topicSelect"),
  status: document.querySelector("#statusSelect"),
  confirmPending: document.querySelector("#confirmPendingBtn"),
  pendingSummary: document.querySelector("#pendingSummary"),
  exportCorrections: document.querySelector("#exportCorrectionsBtn"),
  correctionExportLine: document.querySelector("#correctionExportLine"),
  total: document.querySelector("#totalCount"),
  answered: document.querySelector("#answeredCount"),
  ready: document.querySelector("#readyCount"),
  accuracy: document.querySelector("#accuracyCount"),
  source: document.querySelector("#sourceLabel"),
  title: document.querySelector("#questionTitle"),
  tags: document.querySelector("#tagList"),
  text: document.querySelector("#questionText"),
  options: document.querySelector("#optionsList"),
  answer: document.querySelector("#answerBox"),
  pendingReviewPanel: document.querySelector("#pendingReviewPanel"),
  pendingReviewReason: document.querySelector("#pendingReviewReason"),
  editPending: document.querySelector("#editPendingBtn"),
  position: document.querySelector("#positionLabel"),
  questionMap: document.querySelector("#questionMap"),
  prev: document.querySelector("#prevBtn"),
  next: document.querySelector("#nextBtn"),
  shuffle: document.querySelector("#shuffleBtn"),
  favorite: document.querySelector("#favoriteBtn"),
  review: document.querySelector("#reviewBtn"),
  exclude: document.querySelector("#excludeBtn"),
  edit: document.querySelector("#editBtn"),
  manualGradePanel: document.querySelector("#manualGradePanel"),
  confirmAnswer: document.querySelector("#confirmAnswerBtn"),
  answerBtn: document.querySelector("#answerBtn"),
  correct: document.querySelector("#correctBtn"),
  wrong: document.querySelector("#wrongBtn"),
  clear: document.querySelector("#clearBtn"),
  errorTypeGroup: document.querySelector("#errorTypeGroup"),
  errorTypePanel: document.querySelector("#errorTypePanel"),
  successTypeGroup: document.querySelector("#successTypeGroup"),
  successTypePanel: document.querySelector("#successTypePanel"),
  note: document.querySelector("#noteInput"),
  editor: document.querySelector("#editorPanel"),
  cancelEdit: document.querySelector("#cancelEditBtn"),
  saveEdit: document.querySelector("#saveEditBtn"),
  resetEdit: document.querySelector("#resetEditBtn"),
  editText: document.querySelector("#editText"),
  editAnswer: document.querySelector("#editAnswer"),
  tabs: document.querySelectorAll("[data-tab]"),
  panels: {
    overview: document.querySelector("#overviewPanel"),
    today: document.querySelector("#todayPanel"),
    topics: document.querySelector("#topicsPanel"),
    activity: document.querySelector("#activityPanel"),
    history: document.querySelector("#historyPanel"),
    exams: document.querySelector("#examsPanel"),
  },
  overviewLine: document.querySelector("#overviewLine"),
  overviewSmartTraining: document.querySelector("#overviewSmartTrainingBtn"),
  overviewSmartLine: document.querySelector("#overviewSmartLine"),
  topicPanelSearch: document.querySelector("#topicPanelSearch"),
  topicChecklist: document.querySelector("#topicChecklist"),
  startTopic: document.querySelector("#startTopicBtn"),
  endTopic: document.querySelector("#endTopicBtn"),
  topicModeLine: document.querySelector("#topicModeLine"),
  refineSubthemes: document.querySelector("#refineSubthemesToggle"),
  subthemeChecklist: document.querySelector("#subthemeChecklist"),
  selectAllTopics: document.querySelector("#selectAllTopicsBtn"),
  clearTopics: document.querySelector("#clearTopicsBtn"),
  sessionSizeGroup: document.querySelector("#sessionSizeGroup"),
  sessionSourceGroup: document.querySelector("#sessionSourceGroup"),
  includeReviews: document.querySelector("#includeReviewsToggle"),
  startSession: document.querySelector("#startSessionBtn"),
  startSmartTraining: document.querySelector("#startSmartTrainingBtn"),
  finishSession: document.querySelector("#finishSessionBtn"),
  endSession: document.querySelector("#endSessionBtn"),
  resetProgress: document.querySelector("#resetProgressBtn"),
  restoreExcluded: document.querySelector("#restoreExcludedBtn"),
  sessionLine: document.querySelector("#sessionLine"),
  sessionSummary: document.querySelector("#sessionSummary"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  errorNotebook: document.querySelector("#errorNotebook"),
  examSelect: document.querySelector("#examSelect"),
  startExam: document.querySelector("#startExamBtn"),
  startExamSimulation: document.querySelector("#startExamSimulationBtn"),
  finishExamStudy: document.querySelector("#finishExamStudyBtn"),
  finishExamSimulation: document.querySelector("#finishExamSimulationBtn"),
  endExam: document.querySelector("#endExamBtn"),
  examTimer: document.querySelector("#examTimer"),
  examResult: document.querySelector("#examResult"),
  examLine: document.querySelector("#examLine"),
  examInstitution: document.querySelector("#examInstitutionSelect"),
  examArea: document.querySelector("#examAreaSelect"),
  startExamSet: document.querySelector("#startExamSetBtn"),
  endExamSet: document.querySelector("#endExamSetBtn"),
  examSetLine: document.querySelector("#examSetLine"),
  overviewCounts: {
    dominated: document.querySelector("#dominatedCount"),
    consolidated: document.querySelector("#consolidatedCount"),
    building: document.querySelector("#buildingCount"),
    fragile: document.querySelector("#fragileCount"),
    unseen: document.querySelector("#unseenCount"),
  },
  overviewBars: {
    dominated: document.querySelector("#progressDominated"),
    consolidated: document.querySelector("#progressConsolidated"),
    building: document.querySelector("#progressBuilding"),
    fragile: document.querySelector("#progressFragile"),
    unseen: document.querySelector("#progressUnseen"),
  },
  errorChart: document.querySelector("#errorChart"),
  dueReviewCount: document.querySelector("#dueReviewCount"),
  scheduledReviewCount: document.querySelector("#scheduledReviewCount"),
  startSpacedReview: document.querySelector("#startSpacedReviewBtn"),
  endSpacedReview: document.querySelector("#endSpacedReviewBtn"),
  spacedReviewLine: document.querySelector("#spacedReviewLine"),
  todayDueCount: document.querySelector("#todayDueCount"),
  todayPriorityCount: document.querySelector("#todayPriorityCount"),
  todayReviewLine: document.querySelector("#todayReviewLine"),
  todayPlan: document.querySelector("#todayPlan"),
  startTodayReview: document.querySelector("#startTodayReviewBtn"),
  endTodayReview: document.querySelector("#endTodayReviewBtn"),
  confidenceGroup: document.querySelector("#confidenceGroup"),
  confidencePanel: document.querySelector("#confidencePanel"),
  editOptions: {
    A: document.querySelector("#editOptionA"),
    B: document.querySelector("#editOptionB"),
    C: document.querySelector("#editOptionC"),
    D: document.querySelector("#editOptionD"),
    E: document.querySelector("#editOptionE"),
  },
};

function saveProgress() {
  localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));
  scheduleCloudProgressSync();
}

function saveAttempts() {
  localStorage.setItem("banco-rmais-attempts", JSON.stringify(state.attempts.slice(-2000)));
}

function saveReviewSchedule() {
  localStorage.setItem("banco-rmais-review-schedule", JSON.stringify(state.reviewSchedule));
}

function saveCorrections() {
  localStorage.setItem("banco-rmais-corrections", JSON.stringify(state.corrections));
  clearClassificationCache();
}

function saveExcluded() {
  localStorage.setItem("banco-rmais-excluded", JSON.stringify(state.excluded));
  clearClassificationCache();
}

function saveDiscardedOptions() {
  localStorage.setItem("banco-rmais-discarded-options", JSON.stringify(state.discardedOptions));
  scheduleCloudSettingsSync();
}

function savePositions() {
  localStorage.setItem("banco-rmais-positions", JSON.stringify(state.positions));
}

function saveSelectedTopics() {
  localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics));
  scheduleCloudSettingsSync();
}

function saveSubthemeSettings() {
  localStorage.setItem("banco-rmais-selected-subthemes", JSON.stringify(state.selectedSubthemes));
  localStorage.setItem("banco-rmais-refine-subthemes", String(state.refineSubthemes));
  scheduleCloudSettingsSync();
}

function saveSessionSize() {
  localStorage.setItem("banco-rmais-session-size", String(state.sessionSize));
  scheduleCloudSettingsSync();
}

function saveIncludeReviews() {
  localStorage.setItem("banco-rmais-include-reviews", String(state.includeReviewsInSession));
  scheduleCloudSettingsSync();
}

function saveSessionSource() {
  localStorage.setItem("banco-rmais-session-source", state.sessionSource);
  scheduleCloudSettingsSync();
}

function currentSettingsPayload() {
  return {
    selectedTopics: state.selectedTopics,
    selectedSubthemes: state.selectedSubthemes,
    refineSubthemes: state.refineSubthemes,
    sessionSize: state.sessionSize,
    includeReviewsInSession: state.includeReviewsInSession,
    sessionSource: state.sessionSource,
    discardedOptions: state.discardedOptions,
  };
}

function applySettingsPayload(settings = {}) {
  if (Object.prototype.hasOwnProperty.call(settings, "selectedTopics")) {
    state.selectedTopics = settings.selectedTopics;
    localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics));
  }
  if (Object.prototype.hasOwnProperty.call(settings, "selectedSubthemes")) {
    state.selectedSubthemes = Array.isArray(settings.selectedSubthemes) ? settings.selectedSubthemes : [];
    localStorage.setItem("banco-rmais-selected-subthemes", JSON.stringify(state.selectedSubthemes));
  }
  if (Object.prototype.hasOwnProperty.call(settings, "refineSubthemes")) {
    state.refineSubthemes = Boolean(settings.refineSubthemes);
    localStorage.setItem("banco-rmais-refine-subthemes", String(state.refineSubthemes));
  }
  if (Object.prototype.hasOwnProperty.call(settings, "sessionSize")) {
    state.sessionSize = Number(settings.sessionSize) || 30;
    localStorage.setItem("banco-rmais-session-size", String(state.sessionSize));
  }
  if (Object.prototype.hasOwnProperty.call(settings, "includeReviewsInSession")) {
    state.includeReviewsInSession = Boolean(settings.includeReviewsInSession);
    localStorage.setItem("banco-rmais-include-reviews", String(state.includeReviewsInSession));
  }
  if (Object.prototype.hasOwnProperty.call(settings, "sessionSource")) {
    state.sessionSource = settings.sessionSource || "content";
    localStorage.setItem("banco-rmais-session-source", state.sessionSource);
  }
  if (Object.prototype.hasOwnProperty.call(settings, "discardedOptions")) {
    state.discardedOptions = settings.discardedOptions || {};
    localStorage.setItem("banco-rmais-discarded-options", JSON.stringify(state.discardedOptions));
  }
}

function setSyncStatus(message) {
  if (el.syncStatus) el.syncStatus.textContent = message;
}

function renderAuth() {
  if (!el.authPanel) return;
  const user = state.authUser;
  el.authTitle.textContent = user ? "Conta conectada" : "Entrar";
  el.authStatus.textContent = user ? user.email : "Salve seu progresso com login.";
  el.authForm.hidden = Boolean(user);
  el.logout.hidden = !user;
  if (!user) setSyncStatus(state.supabase ? "Modo local ativo." : "Supabase indisponivel neste navegador.");
}

function scheduleCloudProgressSync() {
  if (!state.cloudReady || !state.authUser || !state.supabase) return;
  clearTimeout(state.syncTimer);
  state.syncTimer = setTimeout(syncProgressToCloud, 900);
}

function scheduleCloudSettingsSync() {
  if (!state.cloudReady || !state.authUser || !state.supabase) return;
  clearTimeout(state.settingsSyncTimer);
  state.settingsSyncTimer = setTimeout(syncSettingsToCloud, 900);
}

async function syncProgressToCloud() {
  if (!state.authUser || !state.supabase) return;
  const entries = Object.entries(state.progress).filter(([, progress]) => progress && Object.keys(progress).length);
  if (!entries.length) return;
  const rows = entries.map(([questionId, progress]) => ({
    user_id: state.authUser.id,
    question_id: questionId,
    progress,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await state.supabase.from("user_progress").upsert(rows, { onConflict: "user_id,question_id" });
  setSyncStatus(error ? `Erro ao sincronizar: ${error.message}` : "Progresso sincronizado.");
}

async function syncSettingsToCloud() {
  if (!state.authUser || !state.supabase) return;
  const { error } = await state.supabase.from("user_settings").upsert(
    {
      user_id: state.authUser.id,
      settings: currentSettingsPayload(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  setSyncStatus(error ? `Erro ao salvar configuracoes: ${error.message}` : "Configuracoes sincronizadas.");
}

async function loadCloudState() {
  if (!state.authUser || !state.supabase) return;
  setSyncStatus("Carregando progresso da conta...");
  const [{ data: progressRows, error: progressError }, { data: settingsRow, error: settingsError }] = await Promise.all([
    state.supabase.from("user_progress").select("question_id, progress"),
    state.supabase.from("user_settings").select("settings").eq("user_id", state.authUser.id).maybeSingle(),
  ]);
  if (progressError || settingsError) {
    setSyncStatus(`Erro ao carregar conta: ${(progressError || settingsError).message}`);
    return;
  }
  const cloudProgress = {};
  for (const row of progressRows || []) cloudProgress[row.question_id] = row.progress || {};
  state.progress = { ...state.progress, ...cloudProgress };
  localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));
  if (settingsRow?.settings) applySettingsPayload(settingsRow.settings);
  state.cloudReady = true;
  await Promise.all([syncProgressToCloud(), syncSettingsToCloud()]);
  setSyncStatus("Conta sincronizada.");
  renderTopics();
  applyFilters({ preserveCurrent: true });
}

async function setupSupabaseAuth() {
  if (!window.supabase?.createClient) {
    renderAuth();
    return;
  }
  state.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data } = await state.supabase.auth.getSession();
  state.authUser = data.session?.user || null;
  state.cloudReady = Boolean(state.authUser);
  renderAuth();
  if (state.authUser) await loadCloudState();
  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    state.authUser = session?.user || null;
    state.cloudReady = Boolean(state.authUser);
    renderAuth();
    if (state.authUser) await loadCloudState();
    else setSyncStatus("Modo local ativo.");
  });
}

async function signIn() {
  if (!state.supabase) {
    setSyncStatus("Supabase ainda nao carregou. Recarregue a pagina.");
    return;
  }
  const email = el.authEmail.value.trim();
  const password = el.authPassword.value;
  if (!email || !password) {
    setSyncStatus("Informe email e senha.");
    return;
  }
  setSyncStatus("Entrando...");
  const { error } = await state.supabase.auth.signInWithPassword({ email, password });
  if (error) setSyncStatus(`Erro ao entrar: ${error.message}`);
}

async function signUp() {
  if (!state.supabase) {
    setSyncStatus("Supabase ainda nao carregou. Recarregue a pagina.");
    return;
  }
  const email = el.authEmail.value.trim();
  const password = el.authPassword.value;
  if (!email || !password) {
    setSyncStatus("Informe email e senha para criar a conta.");
    return;
  }
  setSyncStatus("Criando conta...");
  const { error } = await state.supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  setSyncStatus(error ? `Erro ao criar conta: ${error.message}` : "Conta criada. Verifique seu email se a confirmacao estiver ativa.");
}

async function signOut() {
  if (!state.supabase) return;
  await state.supabase.auth.signOut();
  state.authUser = null;
  state.cloudReady = false;
  renderAuth();
}

async function resetPassword() {
  if (!state.supabase) {
    setSyncStatus("Supabase ainda nao carregou. Recarregue a pagina.");
    return;
  }
  const email = el.authEmail.value.trim();
  if (!email) {
    setSyncStatus("Informe o email para recuperar a senha.");
    return;
  }
  const { error } = await state.supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  setSyncStatus(error ? `Erro ao enviar recuperacao: ${error.message}` : "Email de recuperacao enviado.");
}

function currentQuestion() {
  return state.filtered[state.index];
}

function currentExam() {
  return state.exams.find((exam) => exam.id === state.activeExamId) || null;
}

function currentExamSet() {
  const ids = new Set(state.examSetIds);
  return state.exams.filter((exam) => ids.has(exam.id));
}

function isActiveAttemptMode() {
  return Boolean(
    state.sessionActive ||
      state.smartTrainingActive ||
      state.spacedReviewActive ||
      state.examActive ||
      state.examSetActive,
  );
}

function hasActiveQuestionFlow() {
  return Boolean(
    state.topicActive ||
      state.sessionActive ||
      state.smartTrainingActive ||
      state.spacedReviewActive ||
      state.examActive ||
      state.examSetActive ||
      state.examSimulationActive,
  );
}

function currentAttemptFor(questionId) {
  return state.activeAnswers[questionId] || {};
}

function displayProgressFor(questionId) {
  const progress = getProgress(questionId);
  if (!isActiveAttemptMode()) return progress;
  const attempt = currentAttemptFor(questionId);
  return {
    ...progress,
    selected: attempt.selected || null,
    confirmed: Boolean(attempt.confirmed),
    revealed: Boolean(attempt.revealed),
    grade: attempt.grade || null,
  };
}

function setActiveAttempt(questionId, patch) {
  state.activeAnswers[questionId] = {
    ...currentAttemptFor(questionId),
    ...patch,
  };
}

function currentRunAnsweredQuestions() {
  return state.filtered.filter((question) => currentAttemptFor(question.id).grade);
}

function discardedFor(questionId) {
  return new Set(state.discardedOptions[questionId] || []);
}

function toggleDiscardedOption(questionId, letter) {
  const discarded = discardedFor(questionId);
  if (discarded.has(letter)) discarded.delete(letter);
  else discarded.add(letter);
  state.discardedOptions[questionId] = [...discarded];
  if (!state.discardedOptions[questionId].length) delete state.discardedOptions[questionId];
  saveDiscardedOptions();
  render();
}

function allStudyQuestions() {
  return [...state.questions, ...state.exams.flatMap((exam) => exam.questions || [])];
}

function effectiveQuestion(question) {
  if (!question) return null;
  const correction = state.corrections[question.id];
  if (!correction) return question;
  return {
    ...question,
    text: correction.text || question.text,
    options: correction.options || question.options,
    correctAnswer: correction.correctAnswer ?? question.correctAnswer,
    manuallyReviewed: true,
  };
}

function isReadyQuestion(question) {
  const optionLetters = (question?.options || []).map((option) => option.letter);
  return Boolean(
    question?.correctAnswer &&
      question.options?.length >= 2 &&
      new Set(optionLetters).size === optionLetters.length &&
      question.options.some((option) => option.letter === question.correctAnswer),
  );
}

function needsBankReview(question) {
  return !question?.annulled && !isReadyQuestion(question);
}

function readinessIssues(question) {
  const issues = [];
  if (question?.annulled) return issues;
  if (!question?.text?.trim()) issues.push("enunciado vazio");
  if (!question?.options?.length || question.options.length < 2) issues.push("alternativas nao separadas");
  if (question?.options?.length && new Set(question.options.map((option) => option.letter)).size !== question.options.length) {
    issues.push("alternativas com letras duplicadas");
  }
  if (!question?.correctAnswer) {
    issues.push("gabarito ausente");
  } else if (!question.options?.some((option) => option.letter === question.correctAnswer)) {
    issues.push("gabarito sem alternativa correspondente");
  }
  return issues;
}

function readinessIssueKeys(question) {
  const issues = [];
  if (question?.annulled) return issues;
  if (!question?.text?.trim()) issues.push("empty-text");
  if (!question?.options?.length || question.options.length < 2) issues.push("incomplete-options");
  if (question?.options?.length && new Set(question.options.map((option) => option.letter)).size !== question.options.length) {
    issues.push("duplicate-options");
  }
  if (!question?.correctAnswer) {
    issues.push("missing-answer");
  } else if (!question.options?.some((option) => option.letter === question.correctAnswer)) {
    issues.push("answer-mismatch");
  }
  return issues;
}

function pendingQuestions() {
  return allStudyQuestions()
    .filter((question) => !isExcluded(question.id))
    .map((question) => effectiveQuestion(question))
    .filter((question) => needsBankReview(question));
}

function pendingCounts() {
  const counts = {
    total: 0,
    "missing-answer": 0,
    "answer-mismatch": 0,
    "incomplete-options": 0,
    "duplicate-options": 0,
    "empty-text": 0,
  };
  for (const question of pendingQuestions()) {
    counts.total += 1;
    for (const issue of readinessIssueKeys(question)) counts[issue] += 1;
  }
  return counts;
}

function allTopics() {
  return [
    ...new Set(
      state.questions
        .filter((question) => !isExcluded(question.id))
        .map((question) => topicForQuestion(question)),
    ),
  ].sort();
}

function sourcesForTopic(topic) {
  const group = SESSION_TOPIC_GROUPS.find((item) => item.label === topic);
  return group ? group.sources : [topic];
}

function questionBelongsToTopic(question, topic) {
  return topicForQuestion(question) === topic;
}

function topicForQuestion(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.topic.has(cacheKey)) return classificationCache.topic.get(cacheKey);
  if (isPsychopharmacologyQuestion(question)) {
    classificationCache.topic.set(cacheKey, PSYCHOPHARM_SESSION_TOPIC);
    return PSYCHOPHARM_SESSION_TOPIC;
  }
  const group = SESSION_TOPIC_GROUPS.find((item) => item.sources.includes(question.source));
  const result = group?.label || question.source || question.topic || "Sem tema";
  classificationCache.topic.set(cacheKey, result);
  return result;
}

function topicsForStats() {
  if (!Array.isArray(state.selectedTopics)) return allTopics();
  return state.selectedTopics.filter((topic) =>
    state.questions.some((question) => questionBelongsToTopic(question, topic) && !isExcluded(question.id)),
  );
}

function topicQuestions(topic) {
  return state.questions.filter((question) => questionBelongsToTopic(question, topic) && !isExcluded(question.id));
}

function topicPerformance(topic) {
  const questions = topicQuestions(topic);
  const answered = questions.filter((question) => getProgress(question.id).grade);
  const correct = answered.filter((question) => getProgress(question.id).grade === "correct");
  const accuracy = answered.length ? correct.length / answered.length : 0;
  return { total: questions.length, answered: answered.length, correct: correct.length, accuracy };
}

function topicStatus(topic) {
  const perf = topicPerformance(topic);
  if (!perf.answered) return "unseen";
  if (perf.answered >= 10 && perf.accuracy >= 0.85) return "dominated";
  if (perf.answered >= 5 && perf.accuracy >= 0.7) return "consolidated";
  if (perf.accuracy >= 0.5) return "building";
  return "fragile";
}

function subthemeKey(topic, label) {
  return `${topic}::${label}`;
}

function subthemeMinorKey(topic) {
  return subthemeKey(topic, "__minor__");
}

function questionSubthemeText(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.text.has(cacheKey)) return classificationCache.text.get(cacheKey);
  const text = normalize(
    [
      question.source,
      question.topic,
      question.title,
      question.text,
      ...(question.options || []).map((option) => option.text),
    ].join(" "),
  );
  classificationCache.text.set(cacheKey, text);
  return text;
}

function isPsychopharmacologyQuestion(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.psychopharm.has(cacheKey)) return classificationCache.psychopharm.get(cacheKey);
  const haystack = questionSubthemeText(question);
  const keywords = [
    "antidepress",
    "fluoxetina",
    "sertralina",
    "paroxetina",
    "citalopram",
    "escitalopram",
    "venlafaxina",
    "duloxetina",
    "bupropiona",
    "mirtazapina",
    "trazodona",
    "amitriptilina",
    "imipramina",
    "nortriptilina",
    "triciclico",
    "isrs",
    "irsn",
    "imao",
    "antipsicot",
    "neuroleptico",
    "haloperidol",
    "risperidona",
    "olanzapina",
    "quetiapina",
    "clozapina",
    "aripiprazol",
    "ziprasidona",
    "paliperidona",
    "lurasidona",
    "discinesia",
    "acatisia",
    "distonia",
    "extrapiramidal",
    "sindrome neuroleptica",
    "litio",
    "valproato",
    "divalproato",
    "carbamazepina",
    "oxcarbazepina",
    "lamotrigina",
    "estabilizador do humor",
    "benzodiazep",
    "diazepam",
    "clonazepam",
    "alprazolam",
    "lorazepam",
    "midazolam",
    "zolpidem",
    "zopiclona",
    "donepezila",
    "rivastigmina",
    "galantamina",
    "memantina",
    "colinesterase",
    "metilfenidato",
    "atomoxetina",
    "lisdexanfetamina",
    "psicoestimulante",
    "naltrexona",
    "acamprosato",
    "dissulfiram",
    "metadona",
    "buprenorfina",
    "naloxona",
    "tiamina",
    "serotoninergica",
    "hiperprolactinemia",
  ];
  const result = keywords.some((keyword) => haystack.includes(normalize(keyword))) || question.source === "Psicofarmacologia";
  classificationCache.psychopharm.set(cacheKey, result);
  return result;
}

function questionSubtheme(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.subtheme.has(cacheKey)) return classificationCache.subtheme.get(cacheKey);
  const haystack = questionSubthemeText(effectiveQuestion(question));
  const scored = SUBTHEME_RULES.map((rule, index) => {
    const score = rule.keywords.reduce((total, keyword) => total + (haystack.includes(normalize(keyword)) ? 1 : 0), 0);
    return { label: rule.label, score, index };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const result = scored[0]?.label || "Subtema a revisar";
  classificationCache.subtheme.set(cacheKey, result);
  return result;
}

function subthemeCatalogForTopics(topics = topicsForStats()) {
  const catalogKey = [...topics].sort().join("||");
  if (classificationCache.catalog.has(catalogKey)) return classificationCache.catalog.get(catalogKey);
  const catalog = new Map();
  for (const topic of topics) {
    const questions = topicQuestions(topic).filter((question) => isReadyQuestion(effectiveQuestion(question)));
    const counts = new Map();
    for (const question of questions) {
      const label = questionSubtheme(question);
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    const visible = [...counts.entries()]
      .filter(([, count]) => count >= MIN_SUBTHEME_COUNT)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const minorLabels = [...counts.entries()]
      .filter(([, count]) => count < MIN_SUBTHEME_COUNT)
      .map(([label]) => label);
    const minorCount = questions.filter((question) => minorLabels.includes(questionSubtheme(question))).length;
    catalog.set(topic, { visible, minorLabels, minorCount });
  }
  classificationCache.catalog.set(catalogKey, catalog);
  return catalog;
}

function activeSubthemeKeys() {
  return new Set(state.refineSubthemes ? state.selectedSubthemes || [] : []);
}

function questionMatchesSelectedSubthemes(question) {
  const keys = activeSubthemeKeys();
  if (!keys.size) return true;
  const topic = topicForQuestion(question);
  const catalog = subthemeCatalogForTopics([topic]).get(topic);
  const label = questionSubtheme(question);
  const selectedLabels = [...keys]
    .filter((key) => !key.endsWith("::__minor__"))
    .map((key) => key.split("::").slice(1).join("::"));
  return selectedLabels.includes(label) || keys.has(subthemeKey(topic, label)) || Boolean(
    catalog?.minorLabels.includes(label) && keys.has(subthemeMinorKey(topic)),
  );
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isExcluded(id) {
  if (!classificationCache.excluded) {
    const ids = new Set(state.excluded);
    for (const question of state.questions) {
      if (question.excluded) ids.add(question.id);
    }
    for (const exam of state.exams) {
      for (const question of exam.questions || []) {
        if (question.excluded) ids.add(question.id);
      }
    }
    classificationCache.excluded = ids;
  }
  return classificationCache.excluded.has(id);
}

function getProgress(id) {
  state.progress[id] ||= {};
  return state.progress[id];
}

function nextReviewTime(days) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function activeExamElapsedMs() {
  if (!state.examSimulationStartedAt) return state.examSimulationElapsedMs || 0;
  return Date.now() - state.examSimulationStartedAt;
}

function renderExamTimer() {
  if (!el.examTimer) return;
  el.examTimer.textContent = formatElapsed(activeExamElapsedMs());
}

function clearExamSimulationState() {
  state.examSimulationActive = false;
  state.examSimulationFinished = false;
  state.examSimulationStartedAt = null;
  state.examSimulationElapsedMs = 0;
  state.examSimulationAnswers = {};
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatReviewInterval(days) {
  if (days === 0) return "hoje";
  if (days === 1) return "em 1 dia";
  return `em ${days} dias`;
}

function nextReviewGuidance(question) {
  const progress = getProgress(question.id);
  const grade = progress.grade || "wrong";
  const days = calculateReviewPlan({ grade, confidence: progress.confidence || defaultConfidenceForGrade(grade), previous: progress }).intervalDays;
  return formatReviewInterval(days ?? 2);
}

function defaultConfidenceForGrade(grade) {
  if (grade === "wrong") return 2;
  if (grade === "correct") return 4;
  return null;
}

function calculateReviewPlan({ grade, confidence, previous = {} }) {
  if (!grade) return { intervalDays: null, review: false, nextReviewAt: null };
  const conf = Number(confidence || defaultConfidenceForGrade(grade) || 3);
  const wrongCount = previous.wrongCount || 0;
  const correctStreak = previous.correctStreak || 0;
  let intervalDays = 7;
  if (grade === "wrong") {
    intervalDays = conf <= 2 ? 1 : 3;
    if (wrongCount >= 2) intervalDays = 1;
  } else if (conf <= 2) {
    intervalDays = 5;
  } else if (conf === 3) {
    intervalDays = 7;
  } else if (conf === 4) {
    intervalDays = correctStreak >= 2 ? 30 : 14;
  } else {
    intervalDays = correctStreak >= 3 ? 60 : correctStreak >= 1 ? 30 : 14;
  }
  return {
    intervalDays,
    review: grade === "wrong" || conf <= 3,
    nextReviewAt: nextReviewTime(intervalDays),
  };
}

function reviewPatchForGrade(previous, grade, confidence, countAttempt = true) {
  if (grade === null) {
    return {
      review: false,
      nextReviewAt: null,
      intervalDays: null,
      correctStreak: null,
    };
  }
  const plan = calculateReviewPlan({ grade, confidence, previous });
  if (grade === "wrong") {
    return {
      review: plan.review,
      wrongCount: countAttempt && previous.grade !== "wrong" ? (previous.wrongCount || 0) + 1 : previous.wrongCount || 1,
      correctStreak: 0,
      confidence,
      intervalDays: plan.intervalDays,
      nextReviewAt: plan.nextReviewAt,
      lastWrongAt: Date.now(),
    };
  }
  if (grade === "correct") {
    return {
      correctStreak: countAttempt && previous.grade !== "correct" ? (previous.correctStreak || 0) + 1 : previous.correctStreak || 1,
      confidence,
      intervalDays: plan.intervalDays,
      nextReviewAt: plan.nextReviewAt,
      review: plan.review,
    };
  }
  return {};
}

function seedLegacySpacedReviews() {
  let changed = false;
  for (const progress of Object.values(state.progress)) {
    if (progress.grade === "wrong" && !progress.nextReviewAt) {
      progress.review = true;
      progress.wrongCount = progress.wrongCount || 1;
      progress.correctStreak = 0;
      progress.intervalDays = 1;
      progress.nextReviewAt = Date.now();
      changed = true;
    }
  }
  if (changed) saveProgress();
}

function currentQuestionMode() {
  if (state.examSimulationActive) return "exam-simulation";
  if (state.examActive) return "exam-study";
  if (state.examSetActive) return "exam-set";
  if (state.smartTrainingActive) return "smart-training";
  if (state.spacedReviewActive) return "daily-review";
  if (state.sessionActive) return "session";
  return "free";
}

function attemptPayload(question, progress) {
  const grade = progress.grade;
  if (!question || !grade) return null;
  return {
    id: `${Date.now()}-${question.id}`,
    user_id: state.authUser?.id || null,
    question_id: question.id,
    tema: topicForQuestion(question),
    subtema: questionSubtheme(question),
    answered_at: new Date().toISOString(),
    selected_answer: progress.selected || null,
    correct_answer: question.correctAnswer || null,
    is_correct: grade === "correct",
    confidence: Number(progress.confidence || defaultConfidenceForGrade(grade) || 3),
    error_type: grade === "wrong" ? progress.errorType || null : progress.successType || null,
    source: question.source || null,
    mode: currentQuestionMode(),
  };
}

function saveAttempt(question, progress) {
  const attempt = attemptPayload(question, progress);
  if (!attempt) return;
  state.attempts.push(attempt);
  state.attempts = state.attempts.slice(-2000);
  saveAttempts();
  syncAttemptToCloud(attempt);
}

function daysSince(timestamp) {
  if (!timestamp) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
}

function themeWeaknessScore(topic) {
  const perf = topicPerformance(topic);
  if (!perf.answered) return 1;
  if (perf.accuracy < 0.5) return 3;
  if (perf.accuracy < 0.7) return 2;
  if (perf.accuracy < 0.85) return 1;
  return 0;
}

function priorityScoreFor(question, progress = getProgress(question.id)) {
  const isWrong = progress.grade === "wrong" ? 1 : 0;
  const confidence = Number(progress.confidence || defaultConfidenceForGrade(progress.grade) || 3);
  const lowConfidenceWeight = Math.max(0, 4 - confidence);
  const since = daysSince(progress.updatedAt);
  const themeWeaknessWeight = themeWeaknessScore(topicForQuestion(question));
  const questionDifficultyWeight = progress.wrongCount || 0;
  return Math.round(((isWrong * 3) + (lowConfidenceWeight * 2) + (since * 0.5) + (themeWeaknessWeight * 2) + questionDifficultyWeight) * 10) / 10;
}

function updateReviewSchedule(question, progress) {
  if (!question || !progress?.nextReviewAt) return;
  const row = {
    user_id: state.authUser?.id || null,
    question_id: question.id,
    tema: topicForQuestion(question),
    subtema: questionSubtheme(question),
    next_review_at: new Date(progress.nextReviewAt).toISOString(),
    interval_days: progress.intervalDays || 1,
    priority_score: priorityScoreFor(question, progress),
    wrong_count: progress.wrongCount || 0,
    correct_streak: progress.correctStreak || 0,
    last_confidence: progress.confidence || null,
    last_result: progress.grade || null,
    status: progress.grade === "correct" && (progress.confidence || 0) >= 5 && (progress.correctStreak || 0) >= 3 ? "mastered" : "active",
    updated_at: new Date().toISOString(),
  };
  state.reviewSchedule[question.id] = row;
  saveReviewSchedule();
  syncReviewScheduleToCloud(row);
}

async function syncAttemptToCloud(attempt) {
  if (!state.supabase || !state.authUser || !attempt) return;
  const row = { ...attempt, user_id: state.authUser.id };
  delete row.id;
  const { error } = await state.supabase.from("question_attempts").insert(row);
  if (error) console.warn("question_attempts sync skipped:", error.message);
}

async function syncReviewScheduleToCloud(row) {
  if (!state.supabase || !state.authUser || !row) return;
  const payload = { ...row, user_id: state.authUser.id };
  const { error } = await state.supabase.from("review_schedule").upsert(payload, { onConflict: "user_id,question_id" });
  if (error) console.warn("review_schedule sync skipped:", error.message);
}

function setProgress(patch) {
  const question = currentQuestion();
  if (!question) return;
  const previous = getProgress(question.id);
  const nextGrade = Object.prototype.hasOwnProperty.call(patch, "grade") ? patch.grade : previous.grade;
  const nextErrorType = Object.prototype.hasOwnProperty.call(patch, "errorType") ? patch.errorType : previous.errorType;
  const nextSuccessType = Object.prototype.hasOwnProperty.call(patch, "successType") ? patch.successType : previous.successType;
  const nextConfidence = Object.prototype.hasOwnProperty.call(patch, "confidence")
    ? Number(patch.confidence)
    : previous.confidence || defaultConfidenceForGrade(nextGrade);
  const shouldRecalculate =
    Object.prototype.hasOwnProperty.call(patch, "grade") ||
    Object.prototype.hasOwnProperty.call(patch, "errorType") ||
    Object.prototype.hasOwnProperty.call(patch, "successType") ||
    Object.prototype.hasOwnProperty.call(patch, "confidence");
  const gradeChanged = Object.prototype.hasOwnProperty.call(patch, "grade") && patch.grade !== previous.grade;
  const reviewPatch = shouldRecalculate ? reviewPatchForGrade(previous, nextGrade, nextConfidence, gradeChanged) : {};
  state.progress[question.id] = { ...previous, ...patch, ...reviewPatch, updatedAt: Date.now() };
  if (gradeChanged && nextGrade) saveAttempt(question, state.progress[question.id]);
  if (shouldRecalculate && nextGrade) updateReviewSchedule(question, state.progress[question.id]);
  if (state.filterKey) {
    state.positions[state.filterKey] = question.id;
    savePositions();
  }
  saveProgress();
  render();
}

function confirmSelectedAnswer() {
  const question = currentQuestion();
  if (!question) return;
  const progress = getProgress(question.id);
  const selected = isActiveAttemptMode() ? currentAttemptFor(question.id).selected : progress.selected;
  if (!question.correctAnswer || !selected) return;
  const grade = selected === question.correctAnswer ? "correct" : "wrong";
  if (isActiveAttemptMode()) {
    setActiveAttempt(question.id, {
      selected,
      confirmed: true,
      revealed: true,
      grade,
    });
  }
  setProgress({
    selected,
    confirmed: true,
    revealed: true,
    grade,
    errorType: grade === "wrong" ? progress.errorType || null : null,
    successType: grade === "correct" ? progress.successType || null : null,
  });
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function currentFilterKey() {
  return JSON.stringify({
    topic: el.topic.value,
    status: el.status.value,
    search: normalize(el.search.value),
  });
}

function rememberCurrentPosition() {
  if (!state.filterKey || !state.filtered.length) return;
  const question = currentQuestion();
  if (!question) return;
  state.positions[state.filterKey] = question.id;
  savePositions();
}

function restorePosition(filterKey) {
  const savedId = state.positions[filterKey];
  if (!savedId) {
    state.index = 0;
    return;
  }
  const savedIndex = state.filtered.findIndex((question) => question.id === savedId);
  state.index = savedIndex >= 0 ? savedIndex : 0;
}

function applyFilters({ preserveCurrent = false } = {}) {
  if (state.spacedReviewActive) {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    state.filtered = state.spacedReviewIds.map((id) => byId.get(id)).filter((question) => question && !isExcluded(question.id));
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
    render();
    return;
  }

  if (state.smartTrainingActive) {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    state.filtered = state.smartTrainingIds.map((id) => byId.get(id)).filter((question) => question && !isExcluded(question.id));
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
    render();
    return;
  }

  if (state.examActive || state.examSimulationActive) {
    const exam = currentExam();
    state.filtered = exam
      ? exam.questions.filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)))
      : [];
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
    render();
    return;
  }

  if (state.examSetActive) {
    state.filtered = currentExamSet()
      .flatMap((exam) => exam.questions)
      .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
    render();
    return;
  }

  if (state.sessionActive) {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    state.filtered = state.sessionIds.map((id) => byId.get(id)).filter((question) => question && !isExcluded(question.id));
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
    render();
    return;
  }

  if (el.status.value === "all") {
    state.filtered = [];
    state.index = 0;
    state.filterKey = currentFilterKey();
    render();
    return;
  }

  const nextFilterKey = currentFilterKey();
  const filterChanged = nextFilterKey !== state.filterKey;
  if (filterChanged) rememberCurrentPosition();

  const query = normalize(el.search.value);
  const topic = el.topic.value;
  const status = el.status.value;
  const pendingStatuses = new Set(["needs-review", "missing-answer", "answer-mismatch", "incomplete-options", "duplicate-options"]);
  const pendingAdminMode = pendingStatuses.has(status);
  const activeTopicIds = state.topicActive ? new Set(state.topicIds) : null;
  const selectedTopicIds = !state.topicActive && Array.isArray(state.selectedTopics) ? new Set(state.selectedTopics) : null;

  const filterBase = pendingAdminMode ? allStudyQuestions() : state.questions;
  state.filtered = filterBase.filter((question) => {
    if (isExcluded(question.id)) return false;
    const view = effectiveQuestion(question);
    const progress = getProgress(question.id);
    const haystack = normalize(`${view.topic} ${view.source} ${view.title} ${view.text}`);
    const matchesQuery = !query || haystack.includes(query);
    const matchesTopic = pendingAdminMode
      ? true
      : activeTopicIds
        ? [...activeTopicIds].some((topicName) => questionBelongsToTopic(view, topicName))
        : selectedTopicIds
          ? [...selectedTopicIds].some((topicName) => questionBelongsToTopic(view, topicName))
          : topic === "all" || view.source === topic;
    const matchesStatus =
      status === "all" ||
      (status === "ready" && isReadyQuestion(view)) ||
      (status === "needs-review" && needsBankReview(view)) ||
      (status === "missing-answer" && readinessIssueKeys(view).includes("missing-answer")) ||
      (status === "answer-mismatch" && readinessIssueKeys(view).includes("answer-mismatch")) ||
      (status === "incomplete-options" && readinessIssueKeys(view).includes("incomplete-options")) ||
      (status === "duplicate-options" && readinessIssueKeys(view).includes("duplicate-options")) ||
      (status === "unseen" && !progress.grade) ||
      (status === "correct" && progress.grade === "correct") ||
      (status === "wrong" && progress.grade === "wrong") ||
      (status === "review" && progress.review) ||
      (status === "favorite" && progress.favorite);
    return matchesQuery && matchesTopic && matchesStatus;
  });

  if (filterChanged && !preserveCurrent) {
    restorePosition(nextFilterKey);
  } else {
    state.index = Math.min(state.index, Math.max(state.filtered.length - 1, 0));
  }
  state.filterKey = nextFilterKey;
  render();
}

function renderTopics() {
  const sources = allTopics();
  if (!Array.isArray(state.selectedTopics)) {
    state.selectedTopics = sources;
    saveSelectedTopics();
  } else {
    state.selectedTopics = state.selectedTopics.filter((topic) => sources.includes(topic));
  }
  el.topic.innerHTML = [
    `<option value="all">Todos os temas</option>`,
    ...sources.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`),
  ].join("");
  renderTopicChecklist();
}

function renderStats() {
  const visibleQuestions = state.questions.filter((question) => !isExcluded(question.id));
  const answered = visibleQuestions.filter((question) => getProgress(question.id).grade).length;
  const correct = visibleQuestions.filter((question) => getProgress(question.id).grade === "correct").length;
  const ready = visibleQuestions.filter((question) => {
    const view = effectiveQuestion(question);
    return isReadyQuestion(view);
  }).length;
  el.total.textContent = visibleQuestions.length;
  el.answered.textContent = answered;
  el.ready.textContent = ready;
  el.accuracy.textContent = answered ? `${Math.round((correct / answered) * 100)}%` : "0%";
}

function renderPendingSummary() {
  if (!el.pendingSummary) return;
  const counts = pendingCounts();
  el.pendingSummary.innerHTML = `
    <button data-pending-filter="needs-review"><strong>${counts.total}</strong><span>pendentes</span></button>
    <button data-pending-filter="missing-answer"><strong>${counts["missing-answer"]}</strong><span>sem gabarito</span></button>
    <button data-pending-filter="answer-mismatch"><strong>${counts["answer-mismatch"]}</strong><span>gabarito inconsistente</span></button>
    <button data-pending-filter="incomplete-options"><strong>${counts["incomplete-options"]}</strong><span>alternativas incompletas</span></button>
    <button data-pending-filter="duplicate-options"><strong>${counts["duplicate-options"]}</strong><span>alternativas duplicadas</span></button>
  `;
}

function renderDashboard() {
  renderOverview();
  renderPendingSummary();
  renderErrorChart();
  renderTopicChecklist();
  renderExamStudyFilters();
  renderActivity();
  renderHistory();
  renderTodayReview();
  renderExams();
}

function errorStatsByTopic() {
  const grouped = new Map();
  for (const question of allStudyQuestions()) {
    if (isExcluded(question.id)) continue;
    const progress = getProgress(question.id);
    if (progress.grade !== "wrong") continue;
    const topic = question.topic || question.source || "Sem tema";
    const current = grouped.get(topic) || { topic, wrong: 0, answered: 0 };
    current.wrong += 1;
    grouped.set(topic, current);
  }
  for (const question of allStudyQuestions()) {
    if (isExcluded(question.id)) continue;
    const progress = getProgress(question.id);
    if (!progress.grade) continue;
    const topic = question.topic || question.source || "Sem tema";
    const current = grouped.get(topic) || { topic, wrong: 0, answered: 0 };
    current.answered += 1;
    grouped.set(topic, current);
  }
  return [...grouped.values()].filter((item) => item.wrong > 0).sort((a, b) => b.wrong - a.wrong || b.answered - a.answered);
}

function renderErrorChart() {
  if (!el.errorChart) return;
  const items = errorStatsByTopic().slice(0, 8);
  const maxWrong = Math.max(...items.map((item) => item.wrong), 1);
  el.errorChart.innerHTML = items.length
    ? items
        .map((item) => {
          const percent = Math.round((item.wrong / maxWrong) * 100);
          const rate = item.answered ? Math.round((item.wrong / item.answered) * 100) : 0;
          return `
            <div class="error-row">
              <div>
                <strong>${escapeHtml(item.topic)}</strong>
                <small>${item.wrong} erros · ${rate}% das respondidas</small>
              </div>
              <span><i style="width: ${percent}%"></i></span>
            </div>
          `;
        })
        .join("")
    : `<p class="panel-line">Nenhum erro registrado ainda.</p>`;
}

function renderOverview() {
  const topics = topicsForStats();
  const selectedQuestions = state.questions.filter(
    (question) => topics.some((topicName) => questionBelongsToTopic(question, topicName)) && !isExcluded(question.id),
  );
  const counts = { dominated: 0, consolidated: 0, building: 0, fragile: 0, unseen: 0 };
  for (const topic of topics) counts[topicStatus(topic)] += 1;
  const totalTopics = Math.max(topics.length, 1);
  const dueCount = spacedReviewQuestions(true).length;
  const unseenCount = selectedQuestions.filter((question) => !getProgress(question.id).grade).length;
  if (el.overviewSmartLine) {
    el.overviewSmartLine.textContent = `${pluralize(dueCount, "revisão", "revisões")} vencida${dueCount === 1 ? "" : "s"}, ${pluralize(counts.fragile, "tema frágil", "temas frágeis")} e ${pluralize(unseenCount, "questão não praticada", "questões não praticadas")} nos temas selecionados.`;
  }
  el.overviewLine.textContent = `Estatísticas dos ${topics.length} temas selecionados (${pluralize(selectedQuestions.length, "questão", "questões")})`;
  for (const key of Object.keys(counts)) {
    el.overviewCounts[key].textContent = counts[key];
    el.overviewBars[key].style.width = `${(counts[key] / totalTopics) * 100}%`;
  }
}

function renderTopicChecklist() {
  if (!el.topicChecklist || !state.questions.length) return;
  const selectedTopics = Array.isArray(state.selectedTopics) ? state.selectedTopics : [];
  const selectedQuestionCount = selectedContentQuestions({ ignoreSubthemes: true }).length;
  const refinedQuestionCount = selectedContentQuestions().length;
  const subthemeNote = state.refineSubthemes
    ? ` Refinamento ativo: ${pluralize(refinedQuestionCount, "questão", "questões")} no recorte.`
    : "";
  el.topicModeLine.textContent = `${selectedTopics.length}/${allTopics().length} temas selecionados - ${pluralize(selectedQuestionCount, "questão", "questões")} no banco.${subthemeNote}`;
  const topicQuery = normalize(el.topicPanelSearch.value);
  const topics = allTopics().filter((topic) => !topicQuery || normalize(topic).includes(topicQuery));
  el.topicChecklist.innerHTML = topics
    .map((topic) => {
      const perf = topicPerformance(topic);
      const checked = state.selectedTopics.includes(topic) ? "checked" : "";
      return `
        <label class="topic-item ${checked ? "selected" : ""}">
          <input type="checkbox" value="${escapeHtml(topic)}" ${checked} />
          <span>${escapeHtml(topic)}</span>
          <small>${perf.answered}/${perf.total} feitas · ${Math.round(perf.accuracy * 100)}%</small>
        </label>
      `;
    })
    .join("");
  if (!topics.length) {
    el.topicChecklist.innerHTML = `<p class="panel-line">Nenhum tema encontrado.</p>`;
  }
  renderSubthemeChecklist();
}

function renderSubthemeChecklist() {
  if (!el.subthemeChecklist || !el.refineSubthemes) return;
  el.refineSubthemes.checked = state.refineSubthemes;
  el.subthemeChecklist.hidden = !state.refineSubthemes;
  if (!state.refineSubthemes) {
    el.subthemeChecklist.innerHTML = "";
    return;
  }
  const topics = topicsForStats();
  const catalog = subthemeCatalogForTopics(topics);
  const validKeys = new Set();
  const groups = [];
  for (const topic of topics) {
    const item = catalog.get(topic);
    if (!item) continue;
    const rows = [];
    for (const [label, count] of item.visible) {
      const key = subthemeKey(topic, label);
      validKeys.add(key);
      rows.push({ key, label, count });
    }
    if (item.minorCount >= 5) {
      const key = subthemeMinorKey(topic);
      validKeys.add(key);
      rows.push({ key, label: "Subtemas menores", count: item.minorCount });
    }
    if (rows.length) groups.push({ topic, rows });
  }
  const cleaned = (state.selectedSubthemes || []).filter((key) => validKeys.has(key));
  if (cleaned.length !== (state.selectedSubthemes || []).length) {
    state.selectedSubthemes = cleaned;
    saveSubthemeSettings();
  }
  el.subthemeChecklist.innerHTML = groups.length
    ? groups
        .map(
          (group) => `
            <details class="subtheme-group" open>
              <summary>${escapeHtml(group.topic)}</summary>
              <div class="subtheme-list">
                ${group.rows
                  .map((row) => {
                    const checked = state.selectedSubthemes.includes(row.key) ? "checked" : "";
                    return `
                      <label class="subtheme-item ${checked ? "selected" : ""}">
                        <input type="checkbox" value="${escapeHtml(row.key)}" ${checked} />
                        <span>${escapeHtml(row.label)}</span>
                        <small>${row.count}</small>
                      </label>
                    `;
                  })
                  .join("")}
              </div>
            </details>
          `,
        )
        .join("")
    : `<p class="panel-line">Nenhum subtema com volume suficiente nos temas selecionados.</p>`;
}

function selectedExamFilters() {
  const institution = el.examInstitution?.value || "all";
  const area = el.examArea?.value || "all";
  return { institution, area };
}

function examsForStudyFilters() {
  const { institution, area } = selectedExamFilters();
  return state.exams.filter((exam) => {
    const matchesInstitution = institution === "all" || exam.institution === institution;
    const matchesArea = area === "all" || exam.area === area;
    return matchesInstitution && matchesArea;
  });
}

function renderExamStudyFilters() {
  if (!el.examInstitution || !el.examArea || !el.examSelect || !el.examSetLine) return;
  const currentInstitution = el.examInstitution.value || "all";
  const currentArea = el.examArea.value || "all";
  const currentExamId = el.examSelect.value || state.activeExamId;
  const institutions = [...new Set(state.exams.map((exam) => exam.institution))].sort();
  const institutionForAreas = institutions.includes(currentInstitution) ? currentInstitution : "all";
  const examsForAreas =
    institutionForAreas === "all" ? state.exams : state.exams.filter((exam) => exam.institution === institutionForAreas);
  const areas = [...new Set(examsForAreas.map((exam) => exam.area))].sort();

  el.examInstitution.innerHTML = [
    `<option value="all">Todas as instituições</option>`,
    ...institutions.map((institution) => `<option value="${escapeHtml(institution)}">${escapeHtml(institution)}</option>`),
  ].join("");
  el.examArea.innerHTML = [
    `<option value="all">Todas as áreas</option>`,
    ...areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`),
  ].join("");
  el.examInstitution.value = institutionForAreas;
  el.examArea.value = areas.includes(currentArea) ? currentArea : "all";

  const exams = state.examSetActive ? currentExamSet() : examsForStudyFilters();
  el.examSelect.innerHTML = [
    `<option value="">Selecionar</option>`,
    ...exams.map((exam) => `<option value="${escapeHtml(exam.id)}">${escapeHtml(exam.title)} (${pluralize(exam.questionCount, "questão", "questões")})</option>`),
  ].join("");
  if (exams.some((exam) => exam.id === currentExamId)) {
    state.activeExamId = currentExamId;
    el.examSelect.value = currentExamId;
  } else {
    state.activeExamId = "";
    el.examSelect.value = "";
  }
  const questions = exams.reduce((total, exam) => total + exam.questionCount, 0);
  el.examSetLine.textContent = state.examSetActive
    ? `Provas ativas: ${pluralize(exams.length, "prova", "provas")}, ${pluralize(state.filtered.length, "questão", "questões")} na lista atual.`
    : `${pluralize(exams.length, "prova encontrada", "provas encontradas")}, ${pluralize(questions, "questão", "questões")} no total.`;
}

function renderActivity() {
  el.sessionSourceGroup.querySelectorAll("[data-source]").forEach((button) => {
    button.classList.toggle("active", button.dataset.source === state.sessionSource);
  });
  el.sessionSizeGroup.querySelectorAll("[data-size]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.size) === state.sessionSize);
  });
  el.includeReviews.checked = state.includeReviewsInSession;
  const topics = topicsForStats();
  const contentAvailable = state.questions.filter(
    (question) =>
      topics.some((topicName) => questionBelongsToTopic(question, topicName)) &&
      !isExcluded(question.id) &&
      isReadyQuestion(effectiveQuestion(question)),
  );
  const examAvailable = state.exams
    .flatMap((exam) => exam.questions || [])
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  const available = sessionPoolQuestions();
  const dueReviewCount = sessionReviewPool().length;
  const availableNew = available.filter((question) => !getProgress(question.id).grade).length;
  const originLabel =
    state.sessionSource === "content"
      ? pluralize(contentAvailable.length, "questão didática", "questões didáticas")
      : state.sessionSource === "exams"
        ? pluralize(examAvailable.length, "questão de prova", "questões de provas")
        : `${contentAvailable.length} didáticas + ${examAvailable.length} de provas`;
  const studyActive = state.sessionActive || state.smartTrainingActive;
  const answeredInSession = studyActive ? currentRunAnsweredQuestions().length : 0;
  el.finishSession.hidden = !studyActive;
  el.sessionLine.textContent = state.sessionCompletionMessage && !studyActive
    ? state.sessionCompletionMessage
    : state.smartTrainingActive
    ? `Treino inteligente ativo: ${answeredInSession}/${state.filtered.length} questões respondidas.`
    : state.sessionActive
      ? `Sessão ativa: ${answeredInSession}/${state.filtered.length} questões respondidas.`
      : `${originLabel}. ${state.includeReviewsInSession ? `${pluralize(dueReviewCount, "revisão", "revisões")} + ` : ""}${pluralize(availableNew, "nova disponível", "novas disponíveis")}.`;
  renderSessionSummary();
  el.restoreExcluded.hidden = !state.excluded.length;
}

function renderSessionSummary() {
  if (!el.sessionSummary) return;
  if (!state.sessionActive && !state.smartTrainingActive) {
    el.sessionSummary.innerHTML = "";
    return;
  }
  const answered = currentRunAnsweredQuestions();
  const correct = answered.filter((question) => currentAttemptFor(question.id).grade === "correct");
  const wrong = answered.filter((question) => currentAttemptFor(question.id).grade === "wrong");
  const errorTypes = new Map();
  const topics = new Map();
  for (const question of wrong) {
    const progress = getProgress(question.id);
    const errorType = progress.errorType || "unclassified";
    const topic = question.topic || question.source || "Sem tema";
    errorTypes.set(errorType, (errorTypes.get(errorType) || 0) + 1);
    topics.set(topic, (topics.get(topic) || 0) + 1);
  }
  const topError = [...errorTypes.entries()].sort((a, b) => b[1] - a[1])[0];
  const topTopic = [...topics.entries()].sort((a, b) => b[1] - a[1])[0];
  const accuracy = answered.length ? Math.round((correct.length / answered.length) * 100) : 0;
  el.sessionSummary.innerHTML = `
    <div class="summary-grid">
      <div><strong>${answered.length}</strong><span>feitas</span></div>
      <div><strong>${accuracy}%</strong><span>acerto</span></div>
      <div><strong>${wrong.length}</strong><span>erros</span></div>
      <div><strong>${state.filtered.length - answered.length}</strong><span>restantes</span></div>
    </div>
    ${
      wrong.length
        ? `<div class="summary-focus">
            <span>Maior ponto de atenção</span>
            <strong>${escapeHtml(topTopic ? topTopic[0] : "Sem tema")}${topError ? ` · ${escapeHtml(topError[0] === "unclassified" ? "Sem tipo marcado" : errorTypeLabel(topError[0]))}` : ""}</strong>
            <button class="primary-btn" data-review-block-errors>Revisar erros deste bloco</button>
          </div>`
        : answered.length === state.filtered.length
          ? `<p class="panel-line">Bloco concluído sem erros registrados.</p>`
          : `<p class="panel-line">Responda algumas questões para gerar o resumo do bloco.</p>`
    }
  `;
}

function renderHistory() {
  const visibleQuestions = allStudyQuestions().filter((question) => !isExcluded(question.id));
  const answeredTotal = visibleQuestions.filter((question) => getProgress(question.id).grade).length;
  const correctTotal = visibleQuestions.filter((question) => getProgress(question.id).grade === "correct").length;
  const wrongTotal = visibleQuestions.filter((question) => getProgress(question.id).grade === "wrong").length;
  const reviewTotal = visibleQuestions.filter((question) => getProgress(question.id).review).length;
  const dueQuestions = spacedReviewQuestions(true);
  const scheduledQuestions = spacedReviewQuestions(false);
  const dailyTarget = Math.min(dueQuestions.length, state.sessionSize || 30);
  const estimatedMinutes = Math.max(5, Math.ceil(dailyTarget * 1.5));
  const nextScheduled = scheduledQuestions
    .map((question) => getProgress(question.id).nextReviewAt)
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
  const nextScheduledText = nextScheduled
    ? new Date(nextScheduled).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : "";
  el.dueReviewCount.textContent = dueQuestions.length;
  el.scheduledReviewCount.textContent = scheduledQuestions.length;
  if (state.spacedReviewActive) {
    el.spacedReviewLine.innerHTML = `<strong>Revisão ativa:</strong> ${pluralize(state.filtered.length, "questão vencida", "questões vencidas")}.<br>Ao responder, a próxima revisão será definida pelo tipo marcado: erro importante volta hoje ou em 1 dia; leitura/desatenção em 2 dias; acerto com dúvida em 3 dias; domínio sólido em 14 a 21 dias.`;
  } else if (dueQuestions.length) {
    el.spacedReviewLine.innerHTML = `<strong>Meta de hoje:</strong> resolver ${pluralize(dailyTarget, "questão vencida", "questões vencidas")} (${estimatedMinutes} min estimados).<br><strong>Próximo passo:</strong> depois das revisões, faça uma sessão de ${state.sessionSize} questões novas ou treine seus temas frágeis. Erros recorrentes voltam com prioridade; acertos seguros ficam mais espaçados.`;
  } else if (scheduledQuestions.length) {
    el.spacedReviewLine.innerHTML = `<strong>Hoje:</strong> não há revisões vencidas.<br>${pluralize(scheduledQuestions.length, "questão programada", "questões programadas")} para revisão futura${nextScheduledText ? `; próxima previsão: ${nextScheduledText}` : ""}. Sugestão: faça uma sessão inteligente ou avance em questões novas.`;
  } else {
    el.spacedReviewLine.innerHTML = `<strong>Nenhuma revisão programada ainda.</strong><br>Próximo passo: faça um bloco de ${state.sessionSize} questões; ao errar ou marcar acerto com dúvida, a plataforma criará automaticamente o calendário de revisão.`;
  }
  const accuracy = answeredTotal ? Math.round((correctTotal / answeredTotal) * 100) : 0;
  el.historySummary.innerHTML = `
    <div><strong>${answeredTotal}</strong><span>respondidas</span></div>
    <div><strong>${accuracy}%</strong><span>acerto</span></div>
    <div><strong>${wrongTotal}</strong><span>erros</span></div>
    <div><strong>${reviewTotal}</strong><span>revisar</span></div>
  `;
  renderErrorNotebook();
  const answered = allStudyQuestions()
    .filter((question) => !isExcluded(question.id) && getProgress(question.id).grade)
    .map((question) => ({ question, progress: getProgress(question.id) }))
    .sort((a, b) => (b.progress.updatedAt || 0) - (a.progress.updatedAt || 0))
    .slice(0, 12);
  el.historyList.innerHTML = answered.length
    ? answered
        .map(
          ({ question, progress }) => `
            <div class="history-item">
              <span>${escapeHtml(question.source)} · Questão ${question.number}</span>
              <strong class="${progress.grade === "correct" ? "good-text" : "bad-text"}">${progress.grade === "correct" ? "Acerto" : "Erro"}</strong>
              ${progress.grade === "correct" && progress.successType ? `<small>${escapeHtml(successTypeLabel(progress.successType))}</small>` : ""}
              ${progress.grade === "wrong" && progress.errorType ? `<small>${escapeHtml(errorTypeLabel(progress.errorType))}</small>` : ""}
            </div>
          `,
        )
        .join("")
    : `<p class="panel-line">Nenhuma questão respondida ainda.</p>`;
}

function renderTodayReview() {
  if (!el.todayPlan) return;
  const due = spacedReviewQuestions(true);
  const recentErrors = due.filter((question) => getProgress(question.id).grade === "wrong").length;
  const lowConfidence = due.filter((question) => (getProgress(question.id).confidence || 5) <= 2).length;
  const maintenance = due.filter((question) => getProgress(question.id).grade === "correct").length;
  el.todayDueCount.textContent = due.length;
  el.todayPriorityCount.textContent = due.filter((question) => priorityScoreFor(question) >= 6).length;
  if (!due.length) {
    el.todayReviewLine.textContent = "Nenhuma revisão vencida hoje. Faça uma sessão nova ou uma sessão inteligente para alimentar o cronograma.";
    el.todayPlan.innerHTML = "";
    return;
  }
  el.todayReviewLine.textContent = `Hoje sugerimos ${pluralize(Math.min(due.length, state.sessionSize), "questão", "questões")} para revisar, priorizando erros recentes, baixa confiança e temas frágeis.`;
  el.todayPlan.innerHTML = `
    <div class="summary-grid">
      <div><strong>${recentErrors}</strong><span>erros recentes</span></div>
      <div><strong>${lowConfidence}</strong><span>baixa confiança</span></div>
      <div><strong>${maintenance}</strong><span>manutenção</span></div>
      <div><strong>${state.sessionSize}</strong><span>meta diária</span></div>
    </div>
    <div class="today-list">
      ${due
        .slice(0, 12)
        .map((question) => {
          const progress = getProgress(question.id);
          return `
            <div class="today-item">
              <strong>${escapeHtml(topicForQuestion(question))}</strong>
              <span>${escapeHtml(questionSubtheme(question))}</span>
              <small>prioridade ${priorityScoreFor(question, progress)} · confiança ${progress.confidence || defaultConfidenceForGrade(progress.grade) || "-"}</small>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderErrorNotebook() {
  if (!el.errorNotebook) return;
  const wrongItems = allStudyQuestions()
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)) && getProgress(question.id).grade === "wrong")
    .map((question) => ({ question, progress: getProgress(question.id) }));
  if (!wrongItems.length) {
    el.errorNotebook.innerHTML = `<p class="panel-line">Nenhum erro registrado ainda.</p>`;
    return;
  }
  const grouped = new Map();
  for (const { question, progress } of wrongItems) {
    const key = progress.errorType || "unclassified";
    const item = grouped.get(key) || { key, count: 0, topics: new Map() };
    item.count += 1;
    const topic = question.topic || question.source || "Sem tema";
    item.topics.set(topic, (item.topics.get(topic) || 0) + 1);
    grouped.set(key, item);
  }
  const rows = [...grouped.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  el.errorNotebook.innerHTML = rows
    .map((item) => {
      const topTopics = [...item.topics.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([topic, count]) => `${escapeHtml(topic)} (${count})`)
        .join(", ");
      return `
        <button class="notebook-row" data-error-review="${item.key}">
          <strong>${escapeHtml(item.key === "unclassified" ? "Sem tipo marcado" : errorTypeLabel(item.key))}</strong>
          <span>${item.count} erro${item.count > 1 ? "s" : ""}</span>
          <small>${topTopics || "Sem tema"}</small>
        </button>
      `;
    })
    .join("");
}

function errorTypeLabel(value) {
  const labels = {
    knowledge: "Falta de conhecimento",
    concept: "Confundi conceito",
    reading: "Li rápido",
    "two-options": "Duvida entre alternativas",
    attention: "Desatenção",
    guess: "Chute",
  };
  return labels[value] || value;
}

function successTypeLabel(value) {
  const labels = {
    mastered: "Dominei",
    reasoning: "Raciocínio correto",
    partial: "Lembrei parcialmente",
    doubt: "Acerto com dúvida",
    "guess-correct": "Chutei e acertei",
  };
  return labels[value] || value;
}

function questionTrainingReasons(question) {
  const progress = getProgress(question.id);
  const reasons = [];
  const now = Date.now();
  if (progress.nextReviewAt && progress.nextReviewAt <= now) reasons.push("Revisao vencida");
  if (progress.grade === "wrong") reasons.push((progress.wrongCount || 0) >= 2 ? "Erro recorrente" : "Erro anterior");
  if (!progress.grade) reasons.push("Nunca respondida");
  if (progress.grade === "wrong" && progress.errorType) reasons.push(errorTypeLabel(progress.errorType));
  if (progress.grade === "correct" && progress.successType) reasons.push(successTypeLabel(progress.successType));
  if (question.source && state.questions.some((item) => item.id === question.id)) {
    const status = topicStatus(topicForQuestion(question));
    if (status === "fragile") reasons.push("Tema frágil");
    if (status === "building") reasons.push("Em consolidação");
  }
  return reasons.slice(0, 2);
}

function spacedReviewQuestions(onlyDue) {
  const now = Date.now();
  return allStudyQuestions()
    .filter((question) => {
      if (isExcluded(question.id)) return false;
      if (!isReadyQuestion(effectiveQuestion(question))) return false;
      const progress = getProgress(question.id);
      if (!progress.nextReviewAt) return false;
      return onlyDue ? progress.nextReviewAt <= now : progress.nextReviewAt > now;
    })
    .sort((a, b) => priorityScoreFor(b) - priorityScoreFor(a) || (getProgress(a.id).nextReviewAt || 0) - (getProgress(b.id).nextReviewAt || 0));
}

function smartTrainingQuestions() {
  const now = Date.now();
  const selectedTopics = new Set(topicsForStats());
  const bankQuestions = selectedContentQuestions();
  const examQuestions = state.exams.flatMap((exam) => exam.questions || []);
  const pool = [...bankQuestions, ...examQuestions].filter(
    (question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)) && questionMatchesSelectedSubthemes(question),
  );
  const seen = new Set();
  const scored = pool
    .filter((question) => {
      if (seen.has(question.id)) return false;
      seen.add(question.id);
      return true;
    })
    .map((question) => {
      const progress = getProgress(question.id);
      let score = Math.random();
      if (progress.nextReviewAt && progress.nextReviewAt <= now) score += 120;
      else if (progress.nextReviewAt) score += Math.max(0, 35 - Math.ceil((progress.nextReviewAt - now) / (24 * 60 * 60 * 1000)));
      if (progress.grade === "wrong") score += 85 + (progress.wrongCount || 0) * 10;
      if (!progress.grade) score += 42;
      if (["knowledge", "concept", "two-options", "guess"].includes(progress.errorType)) score += 65;
      if (["reading", "attention"].includes(progress.errorType)) score += 25;
      if (progress.successType === "guess-correct") score += 65;
      if (progress.successType === "doubt") score += 45;
      if (progress.successType === "partial") score += 25;
      if (progress.favorite) score += 8;
      const matchedTopic = [...selectedTopics].find((topicName) => questionBelongsToTopic(question, topicName));
      if (matchedTopic) {
        const status = topicStatus(matchedTopic);
        if (status === "fragile") score += 42;
        if (status === "building") score += 26;
        if (status === "unseen") score += 18;
      }
      return { question, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, state.sessionSize).map((item) => item.question);
}

function selectedContentQuestions({ ignoreSubthemes = false } = {}) {
  const topics = new Set(topicsForStats());
  return state.questions.filter(
    (question) =>
      [...topics].some((topicName) => questionBelongsToTopic(question, topicName)) &&
      !isExcluded(question.id) &&
      isReadyQuestion(effectiveQuestion(question)) &&
      (ignoreSubthemes || questionMatchesSelectedSubthemes(question)),
  );
}

function examSessionQuestions() {
  return examsForStudyFilters()
    .flatMap((exam) => exam.questions || [])
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)) && questionMatchesSelectedSubthemes(question));
}

function sessionPoolQuestions() {
  if (state.sessionSource === "content") return selectedContentQuestions();
  if (state.sessionSource === "exams") return examSessionQuestions();
  return [...selectedContentQuestions(), ...examSessionQuestions()];
}

function sessionReviewPool() {
  const now = Date.now();
  return sessionPoolQuestions().filter((question) => {
    const progress = getProgress(question.id);
    return progress.nextReviewAt && progress.nextReviewAt <= now;
  });
}

function examSimulationStats() {
  const questions = state.filtered.length ? state.filtered : currentExam()?.questions || [];
  const selectedFor = (question) => state.examSimulationAnswers[question.id] || getProgress(question.id).selected;
  const answered = questions.filter((question) => selectedFor(question));
  const correct = answered.filter((question) => selectedFor(question) === question.correctAnswer);
  const wrong = answered.filter((question) => selectedFor(question) && selectedFor(question) !== question.correctAnswer);
  const blank = questions.length - answered.length;
  const accuracy = answered.length ? Math.round((correct.length / questions.length) * 100) : 0;
  return { questions, answered, correct, wrong, blank, accuracy };
}

function renderExamResult() {
  if (!el.examResult) return;
  if (!state.examSimulationActive || !state.examSimulationFinished) {
    el.examResult.innerHTML = "";
    return;
  }
  const stats = examSimulationStats();
  el.examResult.innerHTML = `
    <div class="summary-grid">
      <div><strong>${stats.correct.length}</strong><span>acertos</span></div>
      <div><strong>${stats.wrong.length}</strong><span>erros</span></div>
      <div><strong>${stats.blank}</strong><span>brancas</span></div>
      <div><strong>${stats.accuracy}%</strong><span>nota</span></div>
    </div>
    <div class="summary-focus">
      <span>Tempo de prova</span>
      <strong>${formatElapsed(state.examSimulationElapsedMs)}</strong>
      <button class="primary-btn" data-review-exam-errors ${stats.wrong.length ? "" : "disabled"}>Revisar erros da prova</button>
    </div>
  `;
}

function renderExams() {
  if (!el.examSelect) return;
  const exam = currentExam();
  const answeredInExam = exam ? exam.questions.filter((question) => getProgress(question.id).grade).length : 0;
  const simulationSelected = state.examSimulationActive ? state.filtered.filter((question) => state.examSimulationAnswers[question.id] || getProgress(question.id).selected).length : 0;
  el.examTimer.hidden = !state.examSimulationActive;
  renderExamTimer();
  el.finishExamStudy.hidden = !state.examActive && !state.examSetActive;
  el.finishExamSimulation.hidden = !state.examSimulationActive || state.examSimulationFinished;
  renderExamResult();
  el.examLine.textContent = state.examCompletionMessage && !state.examActive && !state.examSetActive && !state.examSimulationActive
    ? state.examCompletionMessage
    : state.examSimulationActive
    ? state.examSimulationFinished
      ? `Simulado finalizado: ${simulationSelected}/${state.filtered.length} questões marcadas.`
      : `Simulado ativo: ${simulationSelected}/${state.filtered.length} questões marcadas.`
    : state.examActive
    ? `Estudo ativo: ${answeredInExam}/${state.filtered.length} questões respondidas.`
    : exam
      ? `${exam.institution} ${exam.year} · ${exam.area} · ${pluralize(exam.questionCount, "questão", "questões")}.`
      : "Selecione uma prova para estudar ou simular.";

  const unusedExamListHtml = state.exams.length
    ? state.exams
        .map((item) => {
          const answered = item.questions.filter((question) => getProgress(question.id).grade).length;
          return `
            <button class="exam-item ${item.id === state.activeExamId ? "active" : ""}" data-exam-id="${item.id}">
              <span>${item.title}</span>
              <small>${answered}/${item.questionCount} respondidas · ${item.answerCount} gabaritos</small>
            </button>
          `;
        })
        .join("")
    : `<p class="panel-line">Nenhuma prova importada ainda.</p>`;
}

function mapStatusFor(question) {
  if (state.examSimulationActive && !state.examSimulationFinished) {
    return state.examSimulationAnswers[question.id] ? "selected" : "unseen";
  }
  const progress = displayProgressFor(question.id);
  if (progress.grade === "correct") return "correct";
  if (progress.grade === "wrong") return "wrong";
  if (progress.selected) return "selected";
  if (progress.revealed || progress.confirmed) return "visited";
  return "unseen";
}

function renderQuestionMap() {
  if (!el.questionMap) return;
  if (state.filtered.length <= 1) {
    el.questionMap.innerHTML = "";
    el.questionMap.hidden = true;
    return;
  }
  el.questionMap.hidden = false;
  el.questionMap.innerHTML = state.filtered
    .map((question, index) => {
      const status = mapStatusFor(question);
      const label = index + 1;
      const title = status === "correct"
        ? `Questão ${label}: acerto`
        : status === "wrong"
          ? `Questão ${label}: erro`
          : status === "selected"
            ? `Questão ${label}: alternativa marcada`
            : `Questão ${label}`;
      return `<button class="map-item ${index === state.index ? "active" : ""} ${status}" data-jump-index="${index}" title="${escapeHtml(title)}">${label}</button>`;
    })
    .join("");
}

function render() {
  renderStats();
  renderDashboard();
  const showStartPanel = !hasActiveQuestionFlow() && !state.filtered.length;
  if (el.startPanel) el.startPanel.hidden = !showStartPanel;
  document.body.classList.toggle("no-question-active", showStartPanel);
  renderQuestionMap();
  const baseQuestion = currentQuestion();
  const question = effectiveQuestion(baseQuestion);

  if (!question) {
    el.source.textContent = showStartPanel ? "Pronto para estudar" : "Nenhuma questão encontrada";
    el.title.textContent = showStartPanel ? "Banco de questões" : "Ajuste os filtros";
    el.tags.innerHTML = "";
    el.tags.classList.remove("visible");
    el.text.textContent = "";
    el.options.innerHTML = "";
    el.answer.textContent = "";
    el.answer.classList.remove("visible");
    el.pendingReviewPanel.hidden = true;
    el.position.textContent = "0 / 0";
    el.manualGradePanel.hidden = false;
    el.successTypePanel.hidden = true;
    el.confidencePanel.hidden = true;
    el.errorTypePanel.hidden = true;
    el.note.value = "";
    return;
  }

  const storedProgress = getProgress(question.id);
  const progress = displayProgressFor(question.id);
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  const selectedLetter = state.examSimulationActive ? state.examSimulationAnswers[question.id] || storedProgress.selected : progress.selected;
  state.selected = selectedLetter || null;
  el.source.textContent = state.examSimulationActive
    ? state.examSimulationFinished
      ? "Resultado da prova"
      : "Simulado em andamento"
    : state.examActive
    ? currentExam()?.title || "Prova"
    : state.examSetActive
      ? "Provas filtradas"
    : state.smartTrainingActive
      ? "Treino inteligente"
    : state.sessionActive
      ? "Bloco de questões"
      : state.topicActive
        ? state.topicIds.length === 1
          ? `Tema: ${state.topicIds[0]}`
          : "Temas selecionados"
        : "Banco R+ Psiquiatria";
  el.title.textContent = state.sessionActive || state.smartTrainingActive || state.examActive || state.examSimulationActive || state.examSetActive || state.topicActive ? `Questão ${state.index + 1}` : `Questão ${question.number}`;
  el.position.textContent = `${state.index + 1} / ${state.filtered.length}`;
  const examTag = question.examTag || (question.examId ? question.source : "");
  const trainingReasons = state.smartTrainingActive ? questionTrainingReasons(question) : [];
  const tags = [examTag, ...trainingReasons].filter(Boolean);
  el.tags.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  el.tags.classList.toggle("visible", Boolean(tags.length));
  el.text.textContent = question.text;
  const discarded = discardedFor(question.id);
  el.options.innerHTML = question.options.length
    ? question.options
        .map(
          (option) => {
            const isSelected = selectedLetter === option.letter;
            const isDiscarded = discarded.has(option.letter) && !isSelected;
            const shouldReveal = !examLocked && (progress.revealed || progress.grade || progress.confirmed);
            const isCorrect = shouldReveal && question.correctAnswer === option.letter;
            const isWrong = shouldReveal && isSelected && question.correctAnswer && question.correctAnswer !== option.letter;
            return `
            <button class="option ${isSelected ? "selected" : ""} ${isDiscarded ? "discarded" : ""} ${isSelected && !shouldReveal ? "pending" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}" data-option="${option.letter}">
              <span class="option-letter">${option.letter}</span>
              <span class="option-text">${escapeHtml(option.text)}</span>
              <span class="discard-toggle ${isDiscarded ? "active" : ""}" data-discard-option="${option.letter}" title="${isDiscarded ? "Remover descarte" : "Riscar alternativa"}" aria-label="${isDiscarded ? "Remover descarte" : "Riscar alternativa"}">Riscar</span>
            </button>
          `;
          },
        )
        .join("")
    : `<p>As alternativas não foram separadas automaticamente. Use o texto acima e marque seu desempenho manualmente.</p>`;
  const showAnswer = question.correctAnswer && !examLocked && (progress.revealed || progress.grade || progress.confirmed);
  el.answer.textContent = showAnswer ? `Gabarito: alternativa ${question.correctAnswer}` : "";
  el.answer.classList.toggle("visible", Boolean(showAnswer));
  const needsReview = needsBankReview(question);
  el.pendingReviewPanel.hidden = !needsReview || examLocked;
  if (needsReview) {
    const issues = readinessIssues(question);
    el.pendingReviewReason.textContent = issues.length
      ? `Pendências: ${issues.join(", ")}.`
      : "Confira gabarito, alternativas ou enunciado.";
  }
  el.manualGradePanel.hidden = examLocked;
  el.successTypePanel.hidden = examLocked || progress.grade !== "correct";
  el.confidencePanel.hidden = examLocked || !progress.grade;
  el.errorTypePanel.hidden = examLocked || progress.grade !== "wrong";
  el.confirmAnswer.disabled = !question.correctAnswer || !selectedLetter || Boolean(progress.grade) || examLocked;
  el.confirmAnswer.textContent = progress.grade ? "Alternativa confirmada" : "Confirmar alternativa";
  el.answerBtn.disabled = !question.correctAnswer;
  el.answerBtn.textContent = progress.revealed ? "Gabarito exibido" : "Mostrar gabarito";
  el.favorite.classList.toggle("active", Boolean(storedProgress.favorite));
  el.favorite.textContent = progress.favorite ? "★" : "☆";
  el.review.classList.toggle("active", Boolean(storedProgress.review));
  el.correct.classList.toggle("active", progress.grade === "correct");
  el.wrong.classList.toggle("active", progress.grade === "wrong");
  el.successTypeGroup.querySelectorAll("[data-success-type]").forEach((button) => {
    button.classList.toggle("active", progress.successType === button.dataset.successType);
  });
  el.confidenceGroup.querySelectorAll("[data-confidence]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.confidence) === Number(progress.confidence || defaultConfidenceForGrade(progress.grade)));
  });
  el.errorTypeGroup.querySelectorAll("[data-error-type]").forEach((button) => {
    button.classList.toggle("active", progress.errorType === button.dataset.errorType);
  });
  el.note.value = progress.note || "";
  el.editor.hidden = !state.editing;
  if (state.editing) fillEditor(question);
}

function move(delta) {
  if (!state.filtered.length) return;
  state.index = (state.index + delta + state.filtered.length) % state.filtered.length;
  rememberCurrentPosition();
  render();
}

function shuffleFiltered() {
  for (let i = state.filtered.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.filtered[i], state.filtered[j]] = [state.filtered[j], state.filtered[i]];
  }
  state.index = 0;
  const question = currentQuestion();
  if (state.filterKey && question) {
    state.positions[state.filterKey] = question.id;
    savePositions();
  }
  render();
}

function setTab(tabName) {
  state.activeTab = tabName;
  el.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  Object.entries(el.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function setSidebarCollapsed(collapsed) {
  state.sidebarCollapsed = collapsed;
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  localStorage.setItem("banco-rmais-sidebar-collapsed", String(collapsed));
  if (el.sidebarToggle) el.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
}

function topicsForTopicMode() {
  return topicsForStats();
}

function startTopic() {
  const topics = topicsForTopicMode();
  if (!topics.length) {
    el.topicModeLine.textContent = "Selecione pelo menos um tema.";
    setTab("topics");
    return;
  }
  state.sessionActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  state.topicActive = true;
  state.topicIds = topics;
  state.index = 0;
  setTab("topics");
  applyFilters({ preserveCurrent: true });
}

function endTopic() {
  state.topicActive = false;
  state.topicIds = [];
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("topics");
}

function startExamSet() {
  const exams = examsForStudyFilters();
  if (!exams.length) {
    el.examSetLine.textContent = "Nenhuma prova encontrada com esses filtros.";
    setTab("exams");
    return;
  }
  state.examCompletionMessage = "";
  state.activeAnswers = {};
  state.sessionActive = false;
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  state.examSetActive = true;
  state.examSetIds = exams.map((exam) => exam.id);
  state.filtered = exams
    .flatMap((exam) => exam.questions)
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  state.index = 0;
  setTab("exams");
  render();
}

function endExamSet() {
  state.examCompletionMessage = "";
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("exams");
}

function startSpacedReview() {
  const due = spacedReviewQuestions(true);
  if (!due.length) {
    if (el.todayReviewLine) el.todayReviewLine.textContent = "Nenhuma revisão vencida no momento.";
    if (el.spacedReviewLine) el.spacedReviewLine.textContent = "Nenhuma revisão vencida no momento.";
    setTab("today");
    return;
  }
  state.sessionActive = false;
  state.activeAnswers = {};
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.smartTrainingActive = false;
  state.spacedReviewActive = true;
  state.spacedReviewIds = due.map((question) => question.id);
  state.index = 0;
  setTab("today");
  render();
}

function endSpacedReview() {
  state.spacedReviewActive = false;
  state.spacedReviewIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("today");
}

function startSession() {
  state.sessionCompletionMessage = "";
  state.activeAnswers = {};
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  const pool = sessionPoolQuestions();
  const reviews = state.includeReviewsInSession ? shuffle(sessionReviewPool()) : [];
  const reviewIds = new Set(reviews.map((question) => question.id));
  const unseen = pool.filter((question) => !getProgress(question.id).grade && !reviewIds.has(question.id));
  const fallback = pool.filter((question) => !reviewIds.has(question.id));
  const basePool = unseen.length >= Math.min(state.sessionSize - Math.min(reviews.length, state.sessionSize), fallback.length) ? unseen : fallback;
  const session = [...reviews.slice(0, state.sessionSize), ...shuffle(basePool).slice(0, Math.max(state.sessionSize - reviews.length, 0))];
  if (!session.length) {
    el.sessionLine.textContent = "Selecione pelo menos um tema com questões corrigíveis para iniciar a sessão.";
    setTab("activity");
    return;
  }
  state.sessionActive = true;
  state.sessionIds = session.map((question) => question.id);
  state.index = 0;
  state.filtered = session;
  setTab("activity");
  render();
}

function startSmartTraining() {
  state.sessionCompletionMessage = "";
  state.activeAnswers = {};
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.sessionActive = false;
  const session = smartTrainingQuestions();
  if (!session.length) {
    el.sessionLine.textContent = "Não encontrei questões corrigíveis para montar o treino.";
    setTab("activity");
    return;
  }
  state.smartTrainingActive = true;
  state.smartTrainingIds = session.map((question) => question.id);
  state.index = 0;
  state.filtered = session;
  setTab("activity");
  render();
}

function startErrorNotebookReview(errorType) {
  const ids = allStudyQuestions()
    .filter((question) => {
      if (isExcluded(question.id)) return false;
      if (!isReadyQuestion(effectiveQuestion(question))) return false;
      const progress = getProgress(question.id);
      const matchesType = errorType === "unclassified" ? !progress.errorType : progress.errorType === errorType;
      return progress.grade === "wrong" && matchesType;
    })
    .map((question) => question.id);
  if (!ids.length) return;
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.sessionActive = false;
  state.smartTrainingActive = true;
  state.smartTrainingIds = ids;
  state.activeAnswers = {};
  state.index = 0;
  setTab("overview");
  applyFilters({ preserveCurrent: true });
}

function startCurrentBlockErrors() {
  const ids = state.filtered.filter((question) => getProgress(question.id).grade === "wrong").map((question) => question.id);
  if (!ids.length) return;
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.sessionActive = false;
  state.smartTrainingActive = true;
  state.smartTrainingIds = ids;
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function endSession() {
  state.sessionCompletionMessage = "";
  state.sessionActive = false;
  state.sessionIds = [];
  state.smartTrainingActive = false;
  state.smartTrainingIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function finishSession() {
  if (!state.sessionActive && !state.smartTrainingActive) return;
  const total = state.filtered.length;
  const answered = currentRunAnsweredQuestions();
  const correct = answered.filter((question) => currentAttemptFor(question.id).grade === "correct");
  const wrong = answered.filter((question) => currentAttemptFor(question.id).grade === "wrong");
  const accuracy = answered.length ? Math.round((correct.length / answered.length) * 100) : 0;
  state.sessionCompletionMessage = `Bloco finalizado: ${answered.length}/${total} questões respondidas, ${correct.length} acertos, ${wrong.length} erros, ${accuracy}% de acerto.`;
  state.sessionActive = false;
  state.sessionIds = [];
  state.smartTrainingActive = false;
  state.smartTrainingIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("activity");
}

function startExam() {
  const exam = currentExam();
  if (!exam?.questions.length) {
    el.examLine.textContent = "Selecione uma prova importada.";
    setTab("exams");
    return;
  }
  state.examCompletionMessage = "";
  state.activeAnswers = {};
  state.sessionActive = false;
  state.topicActive = false;
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  clearExamSimulationState();
  state.examActive = true;
  state.filtered = exam.questions.filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  state.index = 0;
  setTab("exams");
  render();
}

function startExamSimulation() {
  const exam = currentExam();
  if (!exam?.questions.length) {
    el.examLine.textContent = "Selecione uma prova importada.";
    setTab("exams");
    return;
  }
  state.examCompletionMessage = "";
  state.activeAnswers = {};
  state.sessionActive = false;
  state.topicActive = false;
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  state.examActive = false;
  state.examSimulationActive = true;
  state.examSimulationFinished = false;
  state.examSimulationStartedAt = Date.now();
  state.examSimulationElapsedMs = 0;
  state.examSimulationErrorIds = [];
  state.examSimulationAnswers = {};
  state.filtered = exam.questions.filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  state.index = 0;
  setTab("exams");
  render();
}

function finishExamSimulation() {
  if (!state.examSimulationActive || state.examSimulationFinished) return;
  state.examSimulationElapsedMs = activeExamElapsedMs();
  state.examSimulationStartedAt = null;
  const errorIds = [];
  for (const question of state.filtered) {
    const progress = getProgress(question.id);
    const selected = state.examSimulationAnswers[question.id];
    if (!selected) continue;
    const grade = selected === question.correctAnswer ? "correct" : "wrong";
    const answerType = grade === "correct" ? progress.successType : progress.errorType;
    const reviewPatch = reviewPatchForGrade(progress, grade, answerType, progress.grade !== grade);
    state.progress[question.id] = {
      ...progress,
      selected,
      grade,
      confirmed: true,
      revealed: true,
      ...reviewPatch,
      updatedAt: Date.now(),
    };
    if (grade === "wrong") errorIds.push(question.id);
  }
  state.examSimulationErrorIds = errorIds;
  state.examSimulationFinished = true;
  saveProgress();
  render();
}

function finishExamStudy() {
  if (!state.examActive && !state.examSetActive) return;
  const total = state.filtered.length;
  const answered = currentRunAnsweredQuestions();
  const correct = answered.filter((question) => currentAttemptFor(question.id).grade === "correct");
  const wrong = answered.filter((question) => currentAttemptFor(question.id).grade === "wrong");
  const accuracy = answered.length ? Math.round((correct.length / answered.length) * 100) : 0;
  state.examCompletionMessage = `Prova finalizada: ${answered.length}/${total} questões respondidas, ${correct.length} acertos, ${wrong.length} erros, ${accuracy}% de acerto.`;
  state.examActive = false;
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("exams");
}

function reviewExamSimulationErrors() {
  if (!state.examSimulationErrorIds.length) return;
  state.smartTrainingActive = true;
  state.smartTrainingIds = [...state.examSimulationErrorIds];
  state.activeAnswers = {};
  clearExamSimulationState();
  state.examActive = false;
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function endExam() {
  state.examCompletionMessage = "";
  state.examActive = false;
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  clearExamSimulationState();
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function resetUserProgress() {
  const shouldReset = window.confirm(
    "Tem certeza que deseja zerar seu histórico de desempenho? Isso apaga acertos, erros, respostas marcadas, revisões programadas, anotações e alternativas riscadas neste navegador. O banco de questões e as correções administrativas serão preservados.",
  );
  if (!shouldReset) return;
  state.progress = {};
  state.attempts = [];
  state.reviewSchedule = {};
  state.discardedOptions = {};
  state.activeAnswers = {};
  state.sessionActive = false;
  state.sessionIds = [];
  state.smartTrainingActive = false;
  state.smartTrainingIds = [];
  state.spacedReviewActive = false;
  state.spacedReviewIds = [];
  state.examActive = false;
  state.examSetActive = false;
  state.examSetIds = [];
  state.sessionCompletionMessage = "Histórico de desempenho zerado. Você pode recomeçar seus blocos do início.";
  state.examCompletionMessage = "";
  clearExamSimulationState();
  localStorage.removeItem("banco-rmais-progress");
  localStorage.removeItem("banco-rmais-attempts");
  localStorage.removeItem("banco-rmais-review-schedule");
  localStorage.removeItem("banco-rmais-discarded-options");
  saveProgress();
  saveAttempts();
  saveReviewSchedule();
  saveDiscardedOptions();
  if (state.authUser && state.supabase) {
    state.supabase.from("user_progress").delete().eq("user_id", state.authUser.id);
    state.supabase.from("question_attempts").delete().eq("user_id", state.authUser.id);
    state.supabase.from("review_schedule").delete().eq("user_id", state.authUser.id);
    syncSettingsToCloud();
  }
  state.index = 0;
  setTab("activity");
  applyFilters({ preserveCurrent: true });
}

function fillEditor(question) {
  el.editText.value = question.text || "";
  el.editAnswer.value = question.correctAnswer || "";
  for (const letter of "ABCDE") {
    const option = question.options.find((item) => item.letter === letter);
    el.editOptions[letter].value = option?.text || "";
  }
}

function collectEditor() {
  const options = [];
  for (const letter of "ABCDE") {
    const text = el.editOptions[letter].value.trim();
    if (text) options.push({ letter, text });
  }
  return {
    text: el.editText.value.trim(),
    options,
    correctAnswer: el.editAnswer.value,
  };
}

function openEditor() {
  const question = effectiveQuestion(currentQuestion());
  if (!question) return;
  state.editing = true;
  render();
}

function closeEditor() {
  state.editing = false;
  render();
}

function saveEdit() {
  const question = currentQuestion();
  if (!question) return;
  const correction = collectEditor();
  state.corrections[question.id] = correction;
  saveCorrections();
  state.editing = false;
  const corrected = effectiveQuestion(question);
  if (el.status.value === "needs-review" && isReadyQuestion(corrected)) {
    applyFilters();
    return;
  }
  applyFilters({ preserveCurrent: true });
}

function resetEdit() {
  const question = currentQuestion();
  if (!question) return;
  delete state.corrections[question.id];
  saveCorrections();
  state.editing = false;
  applyFilters({ preserveCurrent: true });
}

function exportCorrections() {
  const corrections = Object.fromEntries(
    Object.entries(state.corrections).filter(([, correction]) =>
      Boolean(
        correction?.text ||
          correction?.correctAnswer ||
          (Array.isArray(correction?.options) && correction.options.length),
      ),
    ),
  );
  const correctionCount = Object.keys(corrections).length;
  const payload = {
    type: "banco-rmais-corrections",
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      corrections: correctionCount,
      excluded: state.excluded.length,
    },
    corrections,
    excluded: state.excluded,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  link.href = url;
  link.download = `banco-rmais-revisoes-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  if (el.correctionExportLine) {
    el.correctionExportLine.textContent = correctionCount
      ? `${pluralize(correctionCount, "revisão exportada", "revisões exportadas")}. Use o script scripts/apply_corrections.py para aplicar ao banco definitivo.`
      : "Nenhuma revisão local encontrada para exportar.";
  }
}

function excludeCurrentQuestion() {
  const question = currentQuestion();
  if (!question) return;
  const shouldExclude = window.confirm("Excluir esta questão do banco neste navegador?");
  if (!shouldExclude) return;
  if (!state.excluded.includes(question.id)) state.excluded.push(question.id);
  saveExcluded();
  state.sessionIds = state.sessionIds.filter((id) => id !== question.id);
  state.editing = false;
  applyFilters({ preserveCurrent: true });
}

function restoreExcludedQuestions() {
  if (!state.excluded.length) return;
  const shouldRestore = window.confirm("Restaurar todas as questões excluídas?");
  if (!shouldRestore) return;
  state.excluded = [];
  saveExcluded();
  renderTopics();
  applyFilters({ preserveCurrent: true });
}

el.tabs.forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
el.sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!state.sidebarCollapsed));
el.goSession.addEventListener("click", () => {
  setTab("activity");
  setSidebarCollapsed(false);
});
el.goExams.addEventListener("click", () => {
  setTab("exams");
  setSidebarCollapsed(false);
});
el.login.addEventListener("click", signIn);
el.signup.addEventListener("click", signUp);
el.logout.addEventListener("click", signOut);
el.resetPassword.addEventListener("click", resetPassword);
el.authPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") signIn();
});
el.topicChecklist.addEventListener("change", (event) => {
  const input = event.target.closest("input[type='checkbox']");
  if (!input) return;
  const selected = new Set(state.selectedTopics);
  if (input.checked) selected.add(input.value);
  else selected.delete(input.value);
  state.selectedTopics = [...selected];
  saveSelectedTopics();
  state.topicActive = false;
  state.smartTrainingActive = false;
  applyFilters({ preserveCurrent: true });
});
el.refineSubthemes.addEventListener("change", () => {
  state.refineSubthemes = el.refineSubthemes.checked;
  saveSubthemeSettings();
  state.smartTrainingActive = false;
  state.sessionActive = false;
  renderActivity();
  applyFilters({ preserveCurrent: true });
});
el.subthemeChecklist.addEventListener("change", (event) => {
  const input = event.target.closest("input[type='checkbox']");
  if (!input) return;
  const selected = new Set(state.selectedSubthemes || []);
  if (input.checked) selected.add(input.value);
  else selected.delete(input.value);
  state.selectedSubthemes = [...selected];
  saveSubthemeSettings();
  state.smartTrainingActive = false;
  state.sessionActive = false;
  renderActivity();
  applyFilters({ preserveCurrent: true });
});
el.selectAllTopics.addEventListener("click", () => {
  state.selectedTopics = allTopics();
  saveSelectedTopics();
  state.topicActive = false;
  state.smartTrainingActive = false;
  applyFilters({ preserveCurrent: true });
});
el.clearTopics.addEventListener("click", () => {
  state.selectedTopics = [];
  saveSelectedTopics();
  state.topicActive = false;
  state.smartTrainingActive = false;
  applyFilters({ preserveCurrent: true });
});
el.startTopic.addEventListener("click", startTopic);
el.endTopic.addEventListener("click", endTopic);
el.topicPanelSearch.addEventListener("input", renderTopicChecklist);
el.examInstitution.addEventListener("change", () => {
  renderExamStudyFilters();
  renderExams();
});
el.examArea.addEventListener("change", () => {
  renderExamStudyFilters();
  renderExams();
});
el.startExamSet.addEventListener("click", startExamSet);
el.endExamSet.addEventListener("click", endExamSet);
el.startSpacedReview?.addEventListener("click", startSpacedReview);
el.endSpacedReview?.addEventListener("click", endSpacedReview);
el.startTodayReview?.addEventListener("click", startSpacedReview);
el.endTodayReview?.addEventListener("click", endSpacedReview);
el.sessionSourceGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-source]");
  if (!button) return;
  state.sessionSource = button.dataset.source;
  saveSessionSource();
  renderActivity();
});
el.sessionSizeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (!button) return;
  state.sessionSize = Number(button.dataset.size);
  saveSessionSize();
  renderActivity();
});
el.includeReviews.addEventListener("change", () => {
  state.includeReviewsInSession = el.includeReviews.checked;
  saveIncludeReviews();
  renderActivity();
});
el.startSession.addEventListener("click", startSession);
el.startSmartTraining.addEventListener("click", startSmartTraining);
el.overviewSmartTraining?.addEventListener("click", startSmartTraining);
el.finishSession.addEventListener("click", finishSession);
el.endSession.addEventListener("click", endSession);
el.resetProgress.addEventListener("click", resetUserProgress);
el.sessionSummary.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-block-errors]");
  if (!button) return;
  startCurrentBlockErrors();
});
el.errorNotebook.addEventListener("click", (event) => {
  const button = event.target.closest("[data-error-review]");
  if (!button) return;
  startErrorNotebookReview(button.dataset.errorReview);
});
el.examSelect.addEventListener("change", () => {
  state.examCompletionMessage = "";
  state.activeExamId = el.examSelect.value;
  renderExams();
});
el.startExam.addEventListener("click", startExam);
el.startExamSimulation.addEventListener("click", startExamSimulation);
el.finishExamStudy.addEventListener("click", finishExamStudy);
el.finishExamSimulation.addEventListener("click", finishExamSimulation);
el.endExam.addEventListener("click", endExam);
el.examResult.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-exam-errors]");
  if (!button) return;
  reviewExamSimulationErrors();
});
el.confirmPending.addEventListener("click", () => {
  state.sessionActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  state.topicActive = false;
  if (el.status.value === "all") el.status.value = "needs-review";
  applyFilters();
  setTab("topics");
});
el.pendingSummary.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pending-filter]");
  if (!button) return;
  el.status.value = button.dataset.pendingFilter;
  el.confirmPending.click();
});
el.search.addEventListener("input", () => {
  state.sessionActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  applyFilters();
});
el.topic.addEventListener("change", () => {
  state.sessionActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.spacedReviewActive = false;
  state.smartTrainingActive = false;
  state.topicActive = false;
  applyFilters();
});
el.status.addEventListener("change", () => {
  if (el.status.value === "all") {
    state.sessionActive = false;
    state.examActive = false;
    clearExamSimulationState();
    state.examSetActive = false;
    state.spacedReviewActive = false;
    state.smartTrainingActive = false;
    state.topicActive = false;
    applyFilters();
  }
});
el.prev.addEventListener("click", () => move(-1));
el.next.addEventListener("click", () => move(1));
el.questionMap.addEventListener("click", (event) => {
  const button = event.target.closest("[data-jump-index]");
  if (!button) return;
  state.index = Number(button.dataset.jumpIndex);
  rememberCurrentPosition();
  render();
});
el.shuffle.addEventListener("click", shuffleFiltered);
el.favorite.addEventListener("click", () => {
  const progress = getProgress(currentQuestion()?.id);
  setProgress({ favorite: !progress.favorite });
});
el.review.addEventListener("click", () => {
  const progress = getProgress(currentQuestion()?.id);
  setProgress({ review: !progress.review });
});
el.exclude.addEventListener("click", excludeCurrentQuestion);
el.edit.addEventListener("click", openEditor);
el.editPending.addEventListener("click", openEditor);
el.cancelEdit.addEventListener("click", closeEditor);
el.saveEdit.addEventListener("click", saveEdit);
el.resetEdit.addEventListener("click", resetEdit);
el.restoreExcluded.addEventListener("click", restoreExcludedQuestions);
el.exportCorrections.addEventListener("click", exportCorrections);
el.confirmAnswer.addEventListener("click", confirmSelectedAnswer);
el.answerBtn.addEventListener("click", () => {
  const question = currentQuestion();
  if (question && isActiveAttemptMode()) {
    setActiveAttempt(question.id, { revealed: true });
    render();
    return;
  }
  setProgress({ revealed: true });
});
el.correct.addEventListener("click", () => {
  const question = currentQuestion();
  if (question && isActiveAttemptMode()) setActiveAttempt(question.id, { grade: "correct", confirmed: true, revealed: true });
  setProgress({ grade: "correct", errorType: null });
});
el.wrong.addEventListener("click", () => {
  const question = currentQuestion();
  if (question && isActiveAttemptMode()) setActiveAttempt(question.id, { grade: "wrong", confirmed: true, revealed: true });
  setProgress({ grade: "wrong", successType: null });
});
el.clear.addEventListener("click", () => {
  const question = currentQuestion();
  if (question && isActiveAttemptMode()) {
    delete state.activeAnswers[question.id];
    render();
    return;
  }
  setProgress({ grade: null, selected: null, confirmed: false, revealed: false, errorType: null, successType: null });
});
el.note.addEventListener("input", () => setProgress({ note: el.note.value }));
el.successTypeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-success-type]");
  if (!button) return;
  setProgress({ successType: button.dataset.successType });
});
el.confidenceGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-confidence]");
  if (!button) return;
  setProgress({ confidence: Number(button.dataset.confidence) });
});
el.errorTypeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-error-type]");
  if (!button) return;
  setProgress({ errorType: button.dataset.errorType });
});
el.options.addEventListener("click", (event) => {
  const discardButton = event.target.closest("[data-discard-option]");
  if (discardButton) {
    event.preventDefault();
    event.stopPropagation();
    const question = currentQuestion();
    if (!question) return;
    toggleDiscardedOption(question.id, discardButton.dataset.discardOption);
    return;
  }
  const button = event.target.closest("[data-option]");
  if (!button) return;
  if (state.examSimulationActive && state.examSimulationFinished) return;
  const question = currentQuestion();
  if (!question) return;
  const discarded = discardedFor(question.id);
  if (discarded.has(button.dataset.option)) {
    discarded.delete(button.dataset.option);
    state.discardedOptions[question.id] = [...discarded];
    if (!state.discardedOptions[question.id].length) delete state.discardedOptions[question.id];
    saveDiscardedOptions();
  }
  if (state.examSimulationActive) {
    state.examSimulationAnswers[question.id] = button.dataset.option;
    render();
    return;
  }
  if (isActiveAttemptMode()) {
    setActiveAttempt(question.id, {
      selected: button.dataset.option,
      confirmed: false,
      revealed: false,
      grade: null,
    });
    render();
    return;
  }
  setProgress({ selected: button.dataset.option, confirmed: false });
});

setInterval(renderExamTimer, 1000);

function loadPayload() {
  if (window.BANCO_RMAIS_QUESTIONS) {
    return Promise.resolve(window.BANCO_RMAIS_QUESTIONS);
  }
  return fetch("data/questions.json").then((response) => {
    if (!response.ok) throw new Error("Banco de questões não encontrado.");
    return response.json();
  });
}

loadPayload()
  .then(async (payload) => {
    state.questions = payload.questions || [];
    state.exams = window.BANCO_RMAIS_EXAMS?.exams || [];
    setSidebarCollapsed(state.sidebarCollapsed);
    seedLegacySpacedReviews();
    renderTopics();
    applyFilters();
    await setupSupabaseAuth();
  })
  .catch((error) => {
    el.source.textContent = "Importação pendente";
    el.title.textContent = error.message;
  });
