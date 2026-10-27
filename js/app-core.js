const SUPABASE_URL = "https://ejseesgzjdabsndtdung.supabase.co";
const SUPABASE_KEY = "sb_publishable_pLC5bh3LWUTi1w_7BoSCZg_ahBnuZ36";
const storedSidebarState = localStorage.getItem("banco-rmais-sidebar-collapsed");
const storedTheme = localStorage.getItem("banco-rmais-theme") || "light";
const ACTIVE_STUDY_KEY = "banco-rmais-active-study";
const MOBILE_LAYOUT_QUERY = "(max-width: 860px)";
document.body.classList.toggle("theme-dark", storedTheme === "dark");

const state = {
  questions: [],
  exams: [],
  flashcards: [],
  filtered: [],
  index: 0,
  selected: null,
  progress: JSON.parse(localStorage.getItem("banco-rmais-progress") || "{}"),
  attempts: JSON.parse(localStorage.getItem("banco-rmais-attempts") || "[]"),
  reviewSchedule: JSON.parse(localStorage.getItem("banco-rmais-review-schedule") || "{}"),
  corrections: JSON.parse(localStorage.getItem("banco-rmais-corrections") || "{}"),
  globalCorrections: {},
  globalCorrectionsLoaded: false,
  excluded: JSON.parse(localStorage.getItem("banco-rmais-excluded") || "[]"),
  discardedOptions: {},
  commentsByQuestion: {},
  commentsLoaded: {},
  commentsLoading: {},
  privateNotes: {},
  privateNotesLoading: {},
  savedNotesList: [],
  savedNotesLoaded: false,
  savedNotesLoading: false,
  editingCommentId: null,
  positions: JSON.parse(localStorage.getItem("banco-rmais-positions") || "{}"),
  flashcardDeckId: localStorage.getItem("banco-rmais-flashcard-deck") || "usp-psicogeriatria",
  flashcardIndex: Number(localStorage.getItem("banco-rmais-flashcard-index") || "0"),
  flashcardRevealed: false,
  flashcardCategory: localStorage.getItem("banco-rmais-flashcard-category") || "all",
  flashcardPriority: localStorage.getItem("banco-rmais-flashcard-priority") || "all",
  flashcardPositions: JSON.parse(localStorage.getItem("banco-rmais-flashcard-positions") || "{}"),
  flashcardProgress: JSON.parse(localStorage.getItem("banco-rmais-flashcard-progress") || "{}"),
  selectedTopics: JSON.parse(localStorage.getItem("banco-rmais-selected-topics") || "null"),
  selectedSubthemes: JSON.parse(localStorage.getItem("banco-rmais-selected-subthemes") || "[]"),
  refineSubthemes: localStorage.getItem("banco-rmais-refine-subthemes") === "true",
  sessionSize: Number(localStorage.getItem("banco-rmais-session-size") || "30"),
  includeReviewsInSession: localStorage.getItem("banco-rmais-include-reviews") === "true",
  sessionSource: localStorage.getItem("banco-rmais-session-source") || "content",
  /* Estudo por temas: "new" (só não feitas), "all" ou "wrong" (só erradas). */
  sessionPoolMode: localStorage.getItem("banco-rmais-session-pool") || "new",
  /* Estudo por temas: "mixed" (didáticas e provas), "content" ou "exams". */
  topicSource: localStorage.getItem("banco-rmais-topic-source") || "mixed",
  reviewTargetExam: localStorage.getItem("banco-rmais-review-target-exam") || "Todas",
  reviewMode: localStorage.getItem("banco-rmais-review-mode") || "mixed",
  reviewAvailableMinutes: Number(localStorage.getItem("banco-rmais-review-minutes") || "20"),
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
  dangerousReviewActive: false,
  dangerousReviewIds: [],
  smartTrainingActive: false,
  smartTrainingIds: [],
  activeTab: "overview",
  tabViewOpen: false,
  tabViewReturnTab: null,
  filterKey: "",
  editing: false,
  sessionCompletionMessage: "",
  examCompletionMessage: "",
  activeAnswers: {},
  questionTimerId: null,
  questionStartedAt: null,
  choiceTrail: {},
  supabase: null,
  authUser: null,
  isAdmin: false,
  cloudReady: false,
  syncTimer: null,
  settingsSyncTimer: null,
  privateNoteSyncTimer: null,
  theme: storedTheme === "dark" ? "dark" : "light",
  /* No celular a gaveta sempre começa fechada; a preferência salva vale só para telas largas. */
  sidebarCollapsed:
    window.matchMedia(MOBILE_LAYOUT_QUERY).matches || storedSidebarState === "true",
};

localStorage.removeItem("banco-rmais-discarded-options");
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

/* Subtemas (Mapa de temas do Desempenho, plano de estudo e incidência por banca).
   Palavras-chave casam no início de palavra ("depress" pega "depressivo", mas "lei" não pega
   "cefaleia"); as de até 4 letras (ect, toc, tea, tcc...) só como palavra inteira.
   "topics" são os temas do Estudo por temas em que o subtema é esperado: servem de desempate. */
const SUBTHEME_RULES = [
  {
    label: "Depressão e suicídio",
    topics: ["Transtornos do Humor"],
    keywords: ["depress", "distimi", "luto", "suicid", "autoles", "autoexterm", "eletroconvulsoterapia", "ect", "anedonia", "melancol"],
  },
  {
    label: "Transtorno bipolar e mania",
    topics: ["Transtornos do Humor"],
    keywords: ["bipolar", "mania", "maniac", "hipomania", "ciclotim", "episodio misto"],
  },
  {
    label: "Esquizofrenia e psicoses",
    topics: ["Transtornos Psicóticos"],
    keywords: ["esquizofren", "psicose", "psicotic", "esquizoafetiv", "esquizofreniform", "transtorno delirante", "primeiro episodio psicotico", "catatoni", "sintomas negativos"],
  },
  {
    label: "Antidepressivos",
    topics: ["Psicofarmacologia e terapêutica psiquiátrica"],
    keywords: ["antidepress", "isrs", "irsn", "imao", "fluoxetina", "sertralina", "paroxetina", "citalopram", "escitalopram", "venlafaxina", "duloxetina", "bupropiona", "mirtazapina", "trazodona", "triciclic", "amitriptilina", "imipramina", "clomipramina", "nortriptilina", "sindrome serotoninergica"],
  },
  {
    label: "Antipsicóticos",
    topics: ["Psicofarmacologia e terapêutica psiquiátrica"],
    keywords: ["antipsicot", "neuroleptic", "clozapina", "olanzapina", "quetiapina", "risperidona", "haloperidol", "aripiprazol", "ziprasidona", "paliperidona", "clorpromazina", "sindrome neuroleptica", "discinesia tardia", "acatisia", "extrapiramid"],
  },
  {
    label: "Estabilizadores do humor",
    topics: ["Psicofarmacologia e terapêutica psiquiátrica"],
    keywords: ["litio", "litemia", "valproato", "divalproato", "carbamazepina", "oxcarbazepina", "lamotrigina", "estabilizador"],
  },
  {
    label: "Benzodiazepínicos e sedativos",
    topics: ["Psicofarmacologia e terapêutica psiquiátrica"],
    keywords: ["benzodiazep", "diazepam", "clonazepam", "alprazolam", "lorazepam", "midazolam", "zolpidem", "zopiclona", "sedativo", "hipnotico"],
  },
  {
    label: "Álcool e abstinência",
    topics: ["Intoxicação por Drogas e Dependência Química"],
    keywords: ["alcool", "etilis", "etilic", "alcoolis", "delirium tremens", "wernicke", "korsakoff", "naltrexona", "acamprosato", "dissulfiram"],
  },
  {
    label: "Drogas e intoxicações",
    topics: ["Intoxicação por Drogas e Dependência Química"],
    keywords: ["cocain", "crack", "cannabis", "maconha", "opioide", "opiaceo", "heroina", "anfetamina", "metanfetamina", "tabag", "nicotin", "dependencia quimica", "uso de substancia", "transtorno por uso", "reducao de danos", "metadona", "buprenorfina"],
  },
  {
    label: "TEA e neurodesenvolvimento",
    topics: ["Psiquiatria Infantil", "Desenvolvimento Neuropsicomotor"],
    keywords: ["autis", "tea", "espectro autista", "neurodesenvolvimento", "desenvolvimento neuropsicomotor", "deficiencia intelectual", "marcos do desenvolvimento", "asperger"],
  },
  {
    label: "TDAH e comportamento disruptivo",
    topics: ["Psiquiatria Infantil"],
    keywords: ["tdah", "hiperatividade", "deficit de atencao", "desatencao", "transtorno opositor", "opositor desafiador", "transtorno de conduta", "disruptiv", "bullying", "metilfenidato", "lisdexanfetamina"],
  },
  {
    label: "Demências e rastreio cognitivo",
    topics: ["Demências e transtornos neurocognitivos", "Saúde do Idoso"],
    keywords: ["demencia", "demencial", "alzheimer", "corpos de lewy", "frontotemporal", "minimental", "mini mental", "meem", "comprometimento cognitivo", "neurocognitiv", "rastreio cognitivo", "donepezila", "rivastigmina", "galantamina", "memantina"],
  },
  {
    label: "Delirium e alterações da consciência",
    topics: ["Delirium, consciência e neuropsiquiatria clínica"],
    keywords: ["delirium", "coma", "comatoso", "nivel de consciencia", "rebaixamento", "estado confusional", "encefalopatia", "morte encefalica", "glasgow"],
  },
  {
    label: "Psicopatologia e exame mental",
    topics: ["Psicopatologia"],
    keywords: ["exame do estado mental", "exame psiquico", "psicopatolog", "sensopercep", "pseudoalucin", "alucinacao", "alucinacoes", "ilusao", "juizo de realidade", "curso do pensamento", "forma do pensamento", "conteudo do pensamento", "fuga de ideias", "neologism", "despersonaliza", "desrealiza"],
  },
  {
    label: "Ansiedade, TOC e trauma",
    topics: ["Ansiedade, TOC, trauma e somatoformes"],
    keywords: ["ansiedade", "ansios", "panico", "fobia", "agorafob", "toc", "obsess", "compulsiv", "trauma", "tept", "estresse pos", "estresse agudo", "somatiza", "conversiv", "dissociativ", "hipocondr"],
  },
  {
    label: "Sono",
    topics: ["Distúrbios do Sono"],
    keywords: ["sono", "insonia", "apneia", "narcolepsia", "parassonia", "sonambul", "terror noturno", "pesadelo", "sonolencia", "circadian", "polissonograf"],
  },
  {
    label: "Alimentares",
    topics: ["Transtornos Alimentares"],
    keywords: ["anorexia", "bulimia", "compulsao alimentar", "transtorno alimentar", "transtornos alimentares", "imagem corporal", "pica", "ruminacao", "arfid"],
  },
  {
    label: "Personalidade",
    topics: ["Transtornos da Personalidade"],
    keywords: ["personalidade", "borderline", "antissocial", "narcisis", "histrioni", "esquizotip", "esquizoide", "personalidade dependente", "personalidade esquiva", "personalidade evitativa"],
  },
  {
    label: "Forense, ética e legislação",
    topics: ["Forense e Ética"],
    keywords: ["forense", "etica medica", "codigo de etica", "bioetica", "lei", "legislacao", "inimput", "imputab", "pericia", "perito", "capacidade civil", "interdicao", "curatela", "sigilo", "internacao involuntaria", "internacao compulsoria", "cfm"],
  },
  {
    label: "Psicoterapia",
    topics: ["Psicoterapias"],
    keywords: ["psicoterap", "terapia cognitiv", "tcc", "psicanal", "freud", "contratransfer", "terapia familiar", "terapia de grupo", "psicodinamic", "mecanismo de defesa", "mecanismos de defesa", "entrevista motivacional"],
  },
  {
    label: "Psicogeriatria e saúde do idoso",
    topics: ["Saúde do Idoso"],
    keywords: ["idoso", "idosa", "geriatr", "fragilidade", "quedas", "polifarm", "envelhecimento", "cuidador", "senescen"],
  },
  {
    label: "Saúde mental coletiva",
    topics: ["Saúde Mental Coletiva e Políticas"],
    keywords: ["caps", "raps", "rede de atencao psicossocial", "reforma psiquiatrica", "consultorio na rua", "matriciamento", "atencao primaria", "atencao basica", "epidemiolog", "prevalencia", "sus"],
  },
].map((rule) => ({
  ...rule,
  /* Até 4 letras: palavra inteira; demais: início de palavra; com espaço: expressão. */
  needles: rule.keywords.map(normalize).map((keyword) => ({
    keyword,
    phrase: keyword.includes(" "),
    firstWord: keyword.split(" ")[0],
    whole: keyword.length <= 4,
  })),
}));

const SUBTHEME_NEEDLES = SUBTHEME_RULES.flatMap((rule) => rule.needles);
const SUBTHEME_WHOLE_WORDS = new Set(SUBTHEME_NEEDLES.filter((n) => !n.phrase && n.whole).map((n) => n.keyword));
/* Palavras-chave de início de palavra (5+ letras) agrupadas pelas 5 primeiras letras. */
const SUBTHEME_PREFIX_BUCKETS = new Map();
for (const needle of SUBTHEME_NEEDLES) {
  if (needle.phrase || needle.whole) continue;
  const bucket = needle.keyword.slice(0, 5);
  if (!SUBTHEME_PREFIX_BUCKETS.has(bucket)) SUBTHEME_PREFIX_BUCKETS.set(bucket, []);
  SUBTHEME_PREFIX_BUCKETS.get(bucket).push(needle.keyword);
}
const SUBTHEME_PHRASES = SUBTHEME_NEEDLES.filter((n) => n.phrase);

/* Palavras-chave de subtema presentes no texto, calculadas numa passada só pelas palavras. */
function subthemeKeywordsIn(text) {
  const padded = ` ${normalize(text).replace(/[^a-z0-9]+/g, " ")} `;
  const found = new Set();
  const words = new Set();
  for (const word of padded.split(" ")) {
    if (!word || words.has(word)) continue;
    words.add(word);
    if (SUBTHEME_WHOLE_WORDS.has(word)) found.add(word);
    if (word.length < 5) continue;
    const candidates = SUBTHEME_PREFIX_BUCKETS.get(word.slice(0, 5));
    if (candidates) for (const keyword of candidates) if (word.startsWith(keyword)) found.add(keyword);
  }
  for (const needle of SUBTHEME_PHRASES) {
    if (!words.has(needle.firstWord)) continue;
    if (padded.includes(` ${needle.keyword}${needle.whole ? " " : ""}`)) found.add(needle.keyword);
  }
  return found;
}

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
  themeToggle: document.querySelector("#themeToggleBtn"),
  startPanel: document.querySelector("#startPanel"),
  flashcardStudyPanel: document.querySelector("#flashcardStudyPanel"),
  goSession: document.querySelector("#goSessionBtn"),
  goExams: document.querySelector("#goExamsBtn"),
  tabView: document.querySelector("#tabView"),
  tabViewBack: document.querySelector("#tabViewBack"),
  tabViewBackBtn: document.querySelector("#tabViewBackBtn"),
  authPanel: document.querySelector("#authPanel"),
  authTitle: document.querySelector("#authTitle"),
  authStatus: document.querySelector("#authStatus"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  adminTabs: document.querySelectorAll(".admin-tab"),
  adminOnly: document.querySelectorAll(".admin-only"),
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
  source: document.querySelector("#sourceLabel"),
  title: document.querySelector("#questionTitle"),
  tags: document.querySelector("#tagList"),
  text: document.querySelector("#questionText"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
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
  sendMaintenance: document.querySelector("#sendMaintenanceBtn"),
  manualGradePanel: document.querySelector("#manualGradePanel"),
  moreOptions: document.querySelector(".tool-details"),
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
  savePrivateNote: document.querySelector("#savePrivateNoteBtn"),
  commentsPanel: document.querySelector("#commentsPanel"),
  commentsStatus: document.querySelector("#commentsStatus"),
  commentForm: document.querySelector("#commentForm"),
  commentInput: document.querySelector("#commentInput"),
  sendComment: document.querySelector("#sendCommentBtn"),
  commentsList: document.querySelector("#commentsList"),
  privateNoteStatus: document.querySelector("#privateNoteStatus"),
  notesPanelStatus: document.querySelector("#notesPanelStatus"),
  savedNotesList: document.querySelector("#savedNotesList"),
  editor: document.querySelector("#editorPanel"),
  cancelEdit: document.querySelector("#cancelEditBtn"),
  saveEdit: document.querySelector("#saveEditBtn"),
  resetEdit: document.querySelector("#resetEditBtn"),
  editText: document.querySelector("#editText"),
  editAnswer: document.querySelector("#editAnswer"),
  editStudyTopic: document.querySelector("#editStudyTopic"),
  editExplanation: document.querySelector("#editExplanation"),
  editImageFile: document.querySelector("#editImageFile"),
  editImagePreview: document.querySelector("#editImagePreview"),
  editImageRemove: document.querySelector("#editImageRemove"),
  editImagePickLabel: document.querySelector("#editImagePickLabel"),
  editImageStatus: document.querySelector("#editImageStatus"),
  explanationPanel: document.querySelector("#explanationPanel"),
  explanationText: document.querySelector("#explanationText"),
  addExplanation: document.querySelector("#addExplanationBtn"),
  tabs: document.querySelectorAll("[data-tab]"),
  panels: {
    notes: document.querySelector("#notesPanel"),
    flashcards: document.querySelector("#flashcardsPanel"),
    topics: document.querySelector("#topicsPanel"),
    activity: document.querySelector("#activityPanel"),
    history: document.querySelector("#historyPanel"),
    exams: document.querySelector("#examsPanel"),
  },
  topicPanelSearch: document.querySelector("#topicPanelSearch"),
  topicChecklist: document.querySelector("#topicChecklist"),
  startTopic: document.querySelector("#startTopicBtn"),
  endTopic: document.querySelector("#endTopicBtn"),
  topicModeLine: document.querySelector("#topicModeLine"),
  selectAllTopics: document.querySelector("#selectAllTopicsBtn"),
  clearTopics: document.querySelector("#clearTopicsBtn"),
  sessionSizeGroup: document.querySelector("#sessionSizeGroup"),
  sessionPoolGroup: document.querySelector("#sessionPoolGroup"),
  topicSourceGroup: document.querySelector("#topicSourceGroup"),
  includeReviews: document.querySelector("#includeReviewsToggle"),
  startSession: document.querySelector("#startSessionBtn"),
  finishSession: document.querySelector("#finishSessionBtn"),
  endSession: document.querySelector("#endSessionBtn"),
  resetProgress: document.querySelector("#resetProgressBtn"),
  restoreExcluded: document.querySelector("#restoreExcludedBtn"),
  sessionLine: document.querySelector("#sessionLine"),
  sessionSummary: document.querySelector("#sessionSummary"),
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
  examFilteredCount: document.querySelector("#examFilteredCount"),
  examFilteredQuestionCount: document.querySelector("#examFilteredQuestionCount"),
  examLastTitle: document.querySelector("#examLastTitle"),
  examProgressAccuracy: document.querySelector("#examProgressAccuracy"),
  examProgressAnswered: document.querySelector("#examProgressAnswered"),
  examProgressSplit: document.querySelector("#examProgressSplit"),
  dangerousCount: document.querySelector("#dangerousCount"),
  dangerousLine: document.querySelector("#dangerousLine"),
  dangerousList: document.querySelector("#dangerousList"),
  startDangerousReview: document.querySelector("#startDangerousReviewBtn"),
  endDangerousReview: document.querySelector("#endDangerousReviewBtn"),
  quickReview: document.querySelector("#quickReviewBtn"),
  examThemesReview: document.querySelector("#examThemesReviewBtn"),
  repeatedErrorsReview: document.querySelector("#repeatedErrorsReviewBtn"),
  flashcardErrorsReview: document.querySelector("#flashcardErrorsReviewBtn"),
  flashcardDeckList: document.querySelector("#flashcardDeckList"),
  flashcardCategorySelect: document.querySelector("#flashcardCategorySelect"),
  flashcardPriorityGroup: document.querySelector("#flashcardPriorityGroup"),
  flashcardMeta: document.querySelector("#flashcardMeta"),
  flashcardFront: document.querySelector("#flashcardFront"),
  flashcardBack: document.querySelector("#flashcardBack"),
  showFlashcardAnswer: document.querySelector("#showFlashcardAnswerBtn"),
  prevFlashcard: document.querySelector("#prevFlashcardBtn"),
  nextFlashcard: document.querySelector("#nextFlashcardBtn"),
  resetFlashcardDeck: document.querySelector("#resetFlashcardDeckBtn"),
  flashcardGrade: document.querySelector("#flashcardGrade"),
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

const MAX_STORED_ATTEMPTS = 5000;

function saveAttempts() {
  try {
    localStorage.setItem("banco-rmais-attempts", JSON.stringify(state.attempts.slice(-MAX_STORED_ATTEMPTS)));
  } catch (error) {
    console.warn("attempts not saved locally:", error.message);
  }
}

function attemptKey(attempt) {
  return `${attempt?.question_id}|${Date.parse(attempt?.answered_at || "") || ""}`;
}

/* As tentativas (com data) eram só enviadas à conta; aqui elas voltam e se juntam às deste
   navegador, para o Desempenho mostrar o histórico de todos os aparelhos. */
async function loadCloudAttempts() {
  if (!state.supabase || !state.authUser) return;
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; from < MAX_STORED_ATTEMPTS; from += pageSize) {
    const { data, error } = await state.supabase
      .from("question_attempts")
      .select("question_id, tema, subtema, answered_at, selected_answer, correct_answer, is_correct, confidence, error_type, source, mode")
      .eq("user_id", state.authUser.id)
      .order("answered_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) {
      console.warn("question_attempts load skipped:", error.message);
      return;
    }
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  const cloudKeys = new Set(rows.map((row) => attemptKey(row)));
  /* Com o limite atingido, só as tentativas mais novas que a mais antiga baixada podem estar faltando. */
  const cutoff = rows.length >= MAX_STORED_ATTEMPTS ? Math.min(...rows.map((row) => Date.parse(row.answered_at) || 0)) : -Infinity;
  await uploadMissingAttempts(cloudKeys, cutoff);
  const merged = new Map(state.attempts.map((attempt) => [attemptKey(attempt), attempt]));
  for (const row of rows) {
    const key = attemptKey(row);
    if (!merged.has(key)) merged.set(key, { ...row, user_id: state.authUser.id, id: `${Date.parse(row.answered_at) || 0}-${row.question_id}` });
  }
  state.attempts = [...merged.values()]
    .sort((a, b) => (Date.parse(a.answered_at) || 0) - (Date.parse(b.answered_at) || 0))
    .slice(-MAX_STORED_ATTEMPTS);
  saveAttempts();
}

const ATTEMPT_COLUMNS = ["question_id", "tema", "subtema", "answered_at", "selected_answer", "correct_answer", "is_correct", "confidence", "error_type", "source", "mode"];

/* Envia à conta as tentativas deste aparelho que não chegaram lá: feitas sem internet (o envio na
   hora falhou) ou antes de entrar na conta. Só as sem dono ou da própria pessoa logada. */
async function uploadMissingAttempts(cloudKeys, cutoff) {
  const userId = state.authUser?.id;
  if (!userId) return;
  const missing = state.attempts.filter((attempt) =>
    (!attempt.user_id || attempt.user_id === userId) &&
    (Date.parse(attempt.answered_at) || 0) > cutoff &&
    !cloudKeys.has(attemptKey(attempt)));
  for (let start = 0; start < missing.length; start += 500) {
    const batch = missing.slice(start, start + 500).map((attempt) => {
      const row = { user_id: userId };
      for (const column of ATTEMPT_COLUMNS) row[column] = attempt[column] ?? null;
      return row;
    });
    const { error } = await state.supabase.from("question_attempts").insert(batch);
    if (error) {
      console.warn("envio de tentativas pendentes falhou:", error.message);
      return;
    }
  }
  for (const attempt of missing) attempt.user_id = userId;
  if (missing.length) setSyncStatus(`${missing.length} ${missing.length === 1 ? "tentativa enviada" : "tentativas enviadas"} à conta.`);
}

/* Voltou a internet: envia o que ficou pendente (e baixa o que veio de outros aparelhos). */
window.addEventListener("online", () => {
  if (state.authUser && state.cloudReady) loadCloudAttempts();
});

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
  localStorage.removeItem("banco-rmais-discarded-options");
}

function savePositions() {
  localStorage.setItem("banco-rmais-positions", JSON.stringify(state.positions));
}

function saveFlashcardState() {
  localStorage.setItem("banco-rmais-flashcard-deck", state.flashcardDeckId);
  localStorage.setItem("banco-rmais-flashcard-index", String(state.flashcardIndex));
  localStorage.setItem("banco-rmais-flashcard-category", state.flashcardCategory);
  localStorage.setItem("banco-rmais-flashcard-priority", state.flashcardPriority);
  localStorage.setItem("banco-rmais-flashcard-positions", JSON.stringify(state.flashcardPositions));
  localStorage.setItem("banco-rmais-flashcard-progress", JSON.stringify(state.flashcardProgress));
}

function saveSelectedTopics() {
  localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics));
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

function saveSessionPoolMode() {
  localStorage.setItem("banco-rmais-session-pool", state.sessionPoolMode);
}

/* Progresso dos flashcards enviado à conta: só os campos de agendamento dos cartões já vistos. */
function flashcardProgressForSync() {
  const compact = {};
  for (const [cardId, progress] of Object.entries(state.flashcardProgress || {})) {
    if (!progress || (!progress.reviewedAt && !progress.nextReviewAt && !progress.lastGrade)) continue;
    compact[cardId] = {
      streak: progress.streak || 0,
      lastGrade: progress.lastGrade || null,
      reviewedAt: progress.reviewedAt || null,
      nextReviewAt: progress.nextReviewAt || null,
    };
  }
  return compact;
}

/* Junta o progresso vindo da conta com o do aparelho, cartão a cartão: vale a revisão mais recente. */
function mergeFlashcardProgressFromCloud(remote) {
  if (!remote || typeof remote !== "object") return;
  const reviewedTime = (progress) => Date.parse(progress?.reviewedAt || "") || 0;
  let changed = false;
  for (const [cardId, incoming] of Object.entries(remote)) {
    if (!incoming || typeof incoming !== "object") continue;
    const local = state.flashcardProgress[cardId];
    if (!local || reviewedTime(incoming) > reviewedTime(local)) {
      state.flashcardProgress[cardId] = { ...(local || {}), ...incoming };
      changed = true;
    }
  }
  if (changed) {
    localStorage.setItem("banco-rmais-flashcard-progress", JSON.stringify(state.flashcardProgress));
    if (typeof todayDataCache !== "undefined") todayDataCache.key = "";
  }
}

function currentSettingsPayload() {
  return {
    selectedTopics: state.selectedTopics,
    selectedSubthemes: state.selectedSubthemes,
    refineSubthemes: state.refineSubthemes,
    sessionSize: state.sessionSize,
    includeReviewsInSession: state.includeReviewsInSession,
    sessionSource: state.sessionSource,
    studyPlan: state.studyPlan || null,
    customFlashcards: typeof customFlashcardsForSync === "function" ? customFlashcardsForSync() : [],
    studyLog: typeof studyLogForSync === "function" ? studyLogForSync() : {},
    flashcardProgress: flashcardProgressForSync(),
    simulationHistory: typeof simulationHistoryForSync === "function" ? simulationHistoryForSync() : [],
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
  if (settings.studyPlan && typeof applyStudyPlanFromCloud === "function") applyStudyPlanFromCloud(settings.studyPlan);
  if (Array.isArray(settings.customFlashcards) && typeof applyCustomFlashcardsFromCloud === "function") applyCustomFlashcardsFromCloud(settings.customFlashcards);
  if (settings.studyLog && typeof applyStudyLogFromCloud === "function") applyStudyLogFromCloud(settings.studyLog);
  if (settings.flashcardProgress) mergeFlashcardProgressFromCloud(settings.flashcardProgress);
  if (Array.isArray(settings.simulationHistory) && typeof applySimulationHistoryFromCloud === "function") applySimulationHistoryFromCloud(settings.simulationHistory);
  if (Object.prototype.hasOwnProperty.call(settings, "sessionSource")) {
    state.sessionSource = settings.sessionSource || "content";
    localStorage.setItem("banco-rmais-session-source", state.sessionSource);
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
  if (!user) setSyncStatus(state.supabase ? "Modo local ativo." : "Supabase indisponível neste navegador.");
  renderAdminAccess();
}

function renderAdminAccess() {
  el.adminTabs?.forEach((button) => {
    button.hidden = !state.isAdmin;
  });
  el.adminOnly?.forEach((item) => {
    item.hidden = !state.isAdmin;
  });
  if (!state.isAdmin && state.activeTab === "topics") {
    state.activeTab = "overview";
  }
  if (el.edit) el.edit.hidden = !state.isAdmin;
  if (el.sendMaintenance) el.sendMaintenance.hidden = !state.isAdmin;
  if (el.moreOptions) el.moreOptions.hidden = !state.isAdmin;
  if (el.exclude) el.exclude.hidden = !state.isAdmin;
  if (el.editPending) el.editPending.hidden = !state.isAdmin;
  if (el.exportCorrections) el.exportCorrections.hidden = !state.isAdmin;
  if (el.confirmPending) el.confirmPending.disabled = !state.isAdmin;
  if (el.status) el.status.disabled = !state.isAdmin;
  if (el.editor && !state.isAdmin) {
    state.editing = false;
    el.editor.hidden = true;
  }
}

async function loadUserProfile() {
  state.isAdmin = false;
  if (!state.authUser || !state.supabase) {
    renderAdminAccess();
    return;
  }
  const { data, error } = await state.supabase.rpc("is_admin");
  if (error) {
    console.warn("Nao foi possivel carregar o perfil administrativo.", error);
    renderAdminAccess();
    return;
  }
  state.isAdmin = Boolean(data);
  renderAdminAccess();
  if (state.isAdmin) loadQuestionErrorStats();
}

/* Erros somados de todos os usuários, por questão (função question_error_stats no Supabase,
   ver supabase/question_error_stats.sql). Só para a administração ordenar a fila de comentários.
   Sem a função no banco, a fila usa os erros da própria pessoa. */
async function loadQuestionErrorStats() {
  if (!state.supabase || !state.isAdmin) return;
  state.errorStatsStatus = "loading";
  const stats = new Map();
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await state.supabase.rpc("question_error_stats").range(from, from + pageSize - 1);
    if (error) {
      console.warn("question_error_stats indisponível:", error.message);
      state.errorStatsStatus = "unavailable";
      renderPendingSummary();
      return;
    }
    for (const row of data || []) {
      stats.set(String(row.question_id), { users: Number(row.users) || 0, usersWrong: Number(row.users_wrong) || 0 });
    }
    if (!data || data.length < pageSize) break;
  }
  state.errorStats = stats;
  state.errorStatsAverage = undefined;
  state.errorStatsStatus = "ready";
  renderPendingSummary();
  if (el.status?.value === "no-explanation") applyFilters({ preserveCurrent: true });
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

function normalizeCorrectionForCloud(correction = {}) {
  const normalized = {};
  if (typeof correction.text === "string" && correction.text.trim()) normalized.text = correction.text.trim();
  if (Array.isArray(correction.options) && correction.options.length) {
    normalized.options = correction.options
      .map((option) => ({
        letter: String(option.letter || "").trim(),
        text: String(option.text || "").trim(),
      }))
      .filter((option) => option.letter && option.text);
  }
  if (Object.prototype.hasOwnProperty.call(correction, "correctAnswer")) {
    normalized.correctAnswer = String(correction.correctAnswer || "").trim().toUpperCase();
  }
  if (Object.prototype.hasOwnProperty.call(correction, "maintenanceFlagged")) {
    normalized.maintenanceFlagged = Boolean(correction.maintenanceFlagged);
  }
  if (typeof correction.studyTopic === "string" && correction.studyTopic.trim()) normalized.studyTopic = correction.studyTopic.trim();
  if (typeof correction.explanation === "string" && correction.explanation.trim()) normalized.explanation = correction.explanation.trim();
  if (typeof correction.image === "string" && correction.image.startsWith("data:image/")) normalized.image = correction.image;
  normalized.reviewedAt = new Date().toISOString();
  return normalized;
}

async function loadGlobalCorrections() {
  if (!state.supabase) return;
  const { data, error } = await state.supabase.from("question_corrections").select("question_id, correction, reviewed_at");
  if (error) {
    console.warn("Correcoes globais nao carregadas:", error.message);
    return;
  }
  state.globalCorrections = {};
  for (const row of data || []) {
    state.globalCorrections[row.question_id] = {
      ...(row.correction || {}),
      reviewedAt: row.reviewed_at,
    };
  }
  state.globalCorrectionsLoaded = true;
  clearClassificationCache();
}

async function saveGlobalCorrection(questionId, correction) {
  if (!state.supabase || !state.authUser || !state.isAdmin || !questionId) return false;
  const normalized = normalizeCorrectionForCloud(correction);
  const { error } = await state.supabase.from("question_corrections").upsert(
    {
      question_id: questionId,
      correction: normalized,
      reviewed_by: state.authUser.id,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "question_id" },
  );
  if (error) {
    setSyncStatus(`Erro ao publicar correção: ${error.message}`);
    return false;
  }
  state.globalCorrections[questionId] = normalized;
  delete state.corrections[questionId];
  saveCorrections();
  clearClassificationCache();
  setSyncStatus("Correção publicada para todos os usuários.");
  return true;
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
  setSyncStatus(error ? `Erro ao salvar configurações: ${error.message}` : "Configurações sincronizadas.");
}

/* Sincroniza progresso/configurações da conta sem desmontar um bloco de questões ativo. */
async function loadCloudState() {
  if (!state.authUser || !state.supabase) return;

  /* Seleção de temas do bloco em andamento, para a da conta não trocá-la no meio do estudo. */
  const activeContext = hasActiveQuestionFlow() && Array.isArray(state.filtered) && state.filtered.length
    ? {
        selectedTopics: Array.isArray(state.selectedTopics) ? [...state.selectedTopics] : [],
        selectedSubthemes: Array.isArray(state.selectedSubthemes) ? [...state.selectedSubthemes] : [],
        refineSubthemes: Boolean(state.refineSubthemes),
      }
    : null;

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
  await loadCloudAttempts();
  state.cloudReady = true;
  await Promise.all([syncProgressToCloud(), syncSettingsToCloud()]);
  setSyncStatus(state.isAdmin ? "Conta sincronizada. Perfil administrador." : "Conta sincronizada.");

  /* A carga acima leva alguns segundos (rede) e roda de novo a cada renovação do login. Nada nela
     encerra blocos, então vale o estado ATUAL: se a pessoa saiu da prova, trocou de bloco ou avançou
     questões nesse meio-tempo, isso é respeitado (antes o bloco anotado no início era restaurado,
     desfazendo o "Sair"). Com um bloco em andamento, só não reaplicamos o filtro geral, que o
     esvaziaria, e a seleção de temas do bloco não é trocada pela que veio da conta. */
  if (hasActiveQuestionFlow() && state.filtered.length) {
    if (activeContext) {
      state.selectedTopics = activeContext.selectedTopics;
      state.selectedSubthemes = activeContext.selectedSubthemes;
      state.refineSubthemes = activeContext.refineSubthemes;
      localStorage.setItem("banco-rmais-selected-topics", JSON.stringify(state.selectedTopics || []));
      localStorage.setItem("banco-rmais-selected-subthemes", JSON.stringify(state.selectedSubthemes || []));
      localStorage.setItem("banco-rmais-refine-subthemes", String(state.refineSubthemes));
    }
    renderTopics();
    render();
    if (typeof saveActiveStudyState === "function") saveActiveStudyState();
    return;
  }

  renderTopics();
  applyFilters({ preserveCurrent: true });
}

async function setupSupabaseAuth() {
  if (!window.supabase?.createClient) {
    renderAuth();
    return;
  }
  state.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  await loadGlobalCorrections();
  const { data } = await state.supabase.auth.getSession();
  state.authUser = data.session?.user || null;
  state.cloudReady = Boolean(state.authUser);
  if (state.authUser) await loadUserProfile();
  renderAuth();
  if (state.authUser) await loadCloudState();
  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    state.authUser = session?.user || null;
    state.cloudReady = Boolean(state.authUser);
    state.commentsByQuestion = {};
    state.commentsLoaded = {};
    state.commentsLoading = {};
    state.privateNotes = {};
    state.privateNotesLoading = {};
    state.savedNotesList = [];
    state.savedNotesLoaded = false;
    state.savedNotesLoading = false;
    if (state.authUser) await loadUserProfile();
    else state.isAdmin = false;
    renderAuth();
    if (state.authUser) await loadCloudState();
    else setSyncStatus("Modo local ativo.");
  });
}

async function signIn() {
  if (!state.supabase) {
    setSyncStatus("Supabase ainda não carregou. Recarregue a página.");
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
    setSyncStatus("Supabase ainda não carregou. Recarregue a página.");
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
  setSyncStatus(error ? `Erro ao criar conta: ${error.message}` : "Conta criada. Verifique seu email se a confirmação estiver ativa.");
}

async function signOut() {
  if (!state.supabase) return;
  await state.supabase.auth.signOut();
  state.authUser = null;
  state.isAdmin = false;
  state.cloudReady = false;
  state.commentsByQuestion = {};
  state.commentsLoaded = {};
  state.commentsLoading = {};
  state.privateNotes = {};
  state.privateNotesLoading = {};
  state.savedNotesList = [];
  state.savedNotesLoaded = false;
  state.savedNotesLoading = false;
  renderAuth();
}

async function resetPassword() {
  if (!state.supabase) {
    setSyncStatus("Supabase ainda não carregou. Recarregue a página.");
    return;
  }
  const email = el.authEmail.value.trim();
  if (!email) {
    setSyncStatus("Informe o email para recuperar a senha.");
    return;
  }
  const { error } = await state.supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  setSyncStatus(error ? `Erro ao enviar recuperação: ${error.message}` : "Email de recuperação enviado.");
}

function setDiscussionStaticText() {
  const title = el.commentsPanel?.querySelector("h3");
  if (title) title.textContent = "Comentários da questão";
  if (el.commentInput) el.commentInput.placeholder = "Compartilhe uma explicação, dúvida ou observação sobre esta questão...";
  if (el.sendComment) el.sendComment.textContent = "Enviar comentário";
  const privateLabel = el.note?.closest("label")?.querySelector("span");
  if (privateLabel) privateLabel.textContent = "Anotação privada";
  if (el.note) el.note.placeholder = "Resumo, pegadinha, mnemônico ou conduta... Apenas você visualiza.";
}

function authorNameForUser() {
  const email = state.authUser?.email || "";
  return email ? email.split("@")[0] : "Usuário";
}

function formatCommentDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderQuestionDiscussion(question, progress = {}) {
  setDiscussionStaticText();
  const questionId = question?.id;
  if (!questionId) {
    if (el.commentsPanel) el.commentsPanel.hidden = true;
    if (el.note) el.note.value = "";
    if (el.privateNoteStatus) el.privateNoteStatus.textContent = "";
    return;
  }
  if (el.commentsPanel) el.commentsPanel.hidden = false;
  if (el.commentForm) el.commentForm.hidden = !state.authUser;
  if (!state.authUser) {
    if (el.commentsStatus) el.commentsStatus.textContent = "Entre na conta para ver e enviar comentários.";
    if (el.commentsList) el.commentsList.innerHTML = `<p class="comment-empty">Comentários colaborativos ficam disponíveis para usuários logados.</p>`;
    if (el.note) el.note.value = progress.note || "";
    if (el.privateNoteStatus) el.privateNoteStatus.textContent = "Anotação privada salva apenas neste navegador até entrar na conta.";
    return;
  }

  const comments = state.commentsByQuestion[questionId] || [];
  if (el.commentsStatus) {
    el.commentsStatus.textContent = state.commentsLoaded[questionId]
      ? `${pluralize(comments.length, "comentário público", "comentários públicos")}.`
      : "Carregando comentários...";
  }
  if (el.commentsList) {
    el.commentsList.innerHTML = comments.length
      ? comments
          .map((comment) => {
            const canDelete = state.isAdmin || comment.user_id === state.authUser?.id;
            const canEdit = canDelete;
            const adminLabel = state.isAdmin && comment.user_id !== state.authUser?.id ? "Moderação admin" : "Apagar";
            const isEditing = state.editingCommentId === comment.id;
            const wasEdited =
              comment.updated_at &&
              comment.created_at &&
              Math.abs(new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime()) > 2000;
            return `
              <article class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
                <div class="comment-meta">
                  <strong>${escapeHtml(comment.author_name || "Usuário")}</strong>
                  <span>${escapeHtml(formatCommentDate(comment.created_at))}${wasEdited ? " · editado" : ""}</span>
                </div>
                ${
                  isEditing
                    ? `<div class="comment-edit-box">
                        <textarea rows="5" data-edit-comment-input="${escapeHtml(comment.id)}">${escapeHtml(comment.content)}</textarea>
                      </div>`
                    : `<div class="comment-body markdown-content">${renderSafeMarkdown(comment.content)}</div>`
                }
                ${
                  canDelete || canEdit
                    ? `<div class="comment-actions">
                        ${
                          isEditing
                            ? `<button class="primary-btn" data-save-comment="${escapeHtml(comment.id)}">Salvar</button>
                               <button data-cancel-comment-edit="${escapeHtml(comment.id)}">Cancelar</button>`
                            : canEdit
                              ? `<button data-edit-comment="${escapeHtml(comment.id)}">Editar</button>`
                              : ""
                        }
                        <button class="comment-delete" data-delete-comment="${escapeHtml(comment.id)}">${escapeHtml(adminLabel)}</button>
                      </div>`
                    : ""
                }
              </article>
            `;
          })
          .join("")
      : `<p class="comment-empty">Nenhum comentário ainda. Seja a primeira pessoa a comentar esta questão.</p>`;
  }

  if (Object.prototype.hasOwnProperty.call(state.privateNotes, questionId)) {
    if (el.note && document.activeElement !== el.note) el.note.value = state.privateNotes[questionId] || "";
    if (el.privateNoteStatus) el.privateNoteStatus.textContent = "Anotação privada sincronizada na sua conta.";
  } else {
    if (el.note && document.activeElement !== el.note) el.note.value = progress.note || "";
    if (el.privateNoteStatus) el.privateNoteStatus.textContent = "Carregando anotação privada...";
  }

  if (!state.commentsLoaded[questionId]) loadCommentsForQuestion(questionId);
  if (!Object.prototype.hasOwnProperty.call(state.privateNotes, questionId)) loadPrivateNoteForQuestion(questionId, progress.note || "");
}

async function loadCommentsForQuestion(questionId) {
  if (!state.supabase || !state.authUser || !questionId) return;
  if (state.commentsLoading[questionId]) return;
  state.commentsLoading[questionId] = true;
  state.commentsLoaded[questionId] = false;
  const { data, error } = await state.supabase
    .from("question_comments")
    .select("id, question_id, user_id, author_name, content, created_at, updated_at")
    .eq("question_id", questionId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    state.commentsLoading[questionId] = false;
    if (currentQuestion()?.id === questionId && el.commentsStatus) {
      el.commentsStatus.textContent = `Não foi possível carregar comentários: ${error.message}`;
    }
    return;
  }
  state.commentsByQuestion[questionId] = data || [];
  state.commentsLoaded[questionId] = true;
  state.commentsLoading[questionId] = false;
  if (currentQuestion()?.id === questionId) renderQuestionDiscussion(effectiveQuestion(currentQuestion()), displayProgressFor(questionId));
}

async function sendCurrentComment() {
  const question = currentQuestion();
  const questionId = question?.id;
  const content = el.commentInput?.value.trim();
  if (!state.supabase || !state.authUser || !questionId || !content) return;
  el.sendComment.disabled = true;
  const { error } = await state.supabase.from("question_comments").insert({
    question_id: questionId,
    user_id: state.authUser.id,
    author_name: authorNameForUser(),
    content,
  });
  el.sendComment.disabled = false;
  if (error) {
    if (el.commentsStatus) el.commentsStatus.textContent = `Erro ao enviar comentário: ${error.message}`;
    return;
  }
  el.commentInput.value = "";
  state.commentsLoaded[questionId] = false;
  await loadCommentsForQuestion(questionId);
}

async function deleteComment(commentId) {
  const question = currentQuestion();
  const questionId = question?.id;
  if (!state.supabase || !state.authUser || !questionId || !commentId) return;
  const shouldDelete = window.confirm(state.isAdmin ? "Apagar este comentário?" : "Apagar seu comentário?");
  if (!shouldDelete) return;
  const { error } = await state.supabase.from("question_comments").delete().eq("id", commentId);
  if (error) {
    if (el.commentsStatus) el.commentsStatus.textContent = `Erro ao apagar comentário: ${error.message}`;
    return;
  }
  state.commentsByQuestion[questionId] = (state.commentsByQuestion[questionId] || []).filter((comment) => comment.id !== commentId);
  state.commentsLoaded[questionId] = true;
  renderQuestionDiscussion(effectiveQuestion(question), displayProgressFor(questionId));
}

function startCommentEdit(commentId) {
  state.editingCommentId = commentId;
  const question = currentQuestion();
  if (question) renderQuestionDiscussion(effectiveQuestion(question), displayProgressFor(question.id));
}

function cancelCommentEdit() {
  state.editingCommentId = null;
  const question = currentQuestion();
  if (question) renderQuestionDiscussion(effectiveQuestion(question), displayProgressFor(question.id));
}

async function saveCommentEdit(commentId) {
  const question = currentQuestion();
  const questionId = question?.id;
  if (!state.supabase || !state.authUser || !questionId || !commentId) return;
  const input = el.commentsList?.querySelector(`[data-edit-comment-input="${CSS.escape(commentId)}"]`);
  const content = input?.value.trim();
  if (!content) {
    if (el.commentsStatus) el.commentsStatus.textContent = "O comentário não pode ficar vazio.";
    return;
  }
  const { error } = await state.supabase
    .from("question_comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId);
  if (error) {
    if (el.commentsStatus) el.commentsStatus.textContent = `Erro ao editar comentário: ${error.message}`;
    return;
  }
  state.editingCommentId = null;
  state.commentsLoaded[questionId] = false;
  await loadCommentsForQuestion(questionId);
}

async function loadPrivateNoteForQuestion(questionId, fallback = "") {
  if (!state.supabase || !state.authUser || !questionId) return;
  if (state.privateNotesLoading[questionId]) return;
  state.privateNotesLoading[questionId] = true;
  const { data, error } = await state.supabase
    .from("private_question_notes")
    .select("content")
    .eq("user_id", state.authUser.id)
    .eq("question_id", questionId)
    .maybeSingle();
  if (error) {
    state.privateNotesLoading[questionId] = false;
    state.privateNotes[questionId] = fallback || "";
    if (currentQuestion()?.id === questionId && el.privateNoteStatus) {
      el.privateNoteStatus.textContent = `Não foi possível carregar anotação privada: ${error.message}`;
    }
    return;
  }
  state.privateNotes[questionId] = data?.content || fallback || "";
  state.privateNotesLoading[questionId] = false;
  if (currentQuestion()?.id === questionId) renderQuestionDiscussion(effectiveQuestion(currentQuestion()), displayProgressFor(questionId));
}

function markPrivateNoteDirty() {
  const question = currentQuestion();
  if (!question || !el.note) return;
  const content = el.note.value;
  const previous = getProgress(question.id);
  state.progress[question.id] = { ...previous, note: content, updatedAt: Date.now() };
  localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));
  state.privateNotes[question.id] = content;
  state.savedNotesLoaded = false;
  if (el.privateNoteStatus) {
    el.privateNoteStatus.textContent = state.authUser
      ? "Alterações ainda não salvas na conta."
      : "Anotação salva apenas neste navegador. Entre na conta para sincronizar.";
  }
}

function saveCurrentPrivateNote() {
  const question = currentQuestion();
  if (!question || !el.note) return;
  const content = el.note.value;
  const previous = getProgress(question.id);
  state.progress[question.id] = { ...previous, note: content, updatedAt: Date.now() };
  localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));
  state.privateNotes[question.id] = content;
  state.savedNotesLoaded = false;
  if (!state.supabase || !state.authUser) {
    if (el.privateNoteStatus) el.privateNoteStatus.textContent = "Anotação privada salva neste navegador.";
    return;
  }
  if (el.privateNoteStatus) el.privateNoteStatus.textContent = "Salvando anotação privada...";
  clearTimeout(state.privateNoteSyncTimer);
  syncPrivateNoteToCloud(question.id, content);
}

async function syncPrivateNoteToCloud(questionId, content) {
  if (!state.supabase || !state.authUser || !questionId) return;
  const { error } = await state.supabase.from("private_question_notes").upsert(
    {
      user_id: state.authUser.id,
      question_id: questionId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" },
  );
  if (currentQuestion()?.id === questionId && el.privateNoteStatus) {
    el.privateNoteStatus.textContent = error
      ? `Erro ao salvar anotação privada: ${error.message}`
      : "Anotação privada sincronizada na sua conta.";
  }
  if (!error) state.savedNotesLoaded = false;
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
      state.dangerousReviewActive ||
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
      state.dangerousReviewActive ||
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
  saveActiveStudyState();
}

function progressAsAttempt(question) {
  const progress = getProgress(question.id);
  if (!progress.grade) return null;
  return {
    selected: progress.selected || null,
    confirmed: Boolean(progress.confirmed || progress.grade),
    revealed: Boolean(progress.revealed || progress.grade),
    grade: progress.grade,
  };
}

function seedActiveAnswersFromProgress(questions) {
  const seeded = {};
  for (const question of questions) {
    const attempt = progressAsAttempt(question);
    if (attempt) seeded[question.id] = attempt;
  }
  return seeded;
}

function currentActiveStudyState() {
  if (state.examSetActive) {
    return {
      mode: "exam-set",
      examSetIds: [...state.examSetIds],
      index: state.index,
      activeAnswers: state.activeAnswers,
      updatedAt: Date.now(),
    };
  }
  if (state.examActive) {
    return {
      mode: "exam",
      activeExamId: state.activeExamId,
      index: state.index,
      activeAnswers: state.activeAnswers,
      updatedAt: Date.now(),
    };
  }
  return null;
}

function saveActiveStudyState() {
  const snapshot = currentActiveStudyState();
  if (!snapshot) return;
  localStorage.setItem(ACTIVE_STUDY_KEY, JSON.stringify(snapshot));
}

function clearActiveStudyState() {
  localStorage.removeItem(ACTIVE_STUDY_KEY);
}

function loadActiveStudyState() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_STUDY_KEY) || "null");
  } catch {
    return null;
  }
}

function restoreActiveAnswersForRun(mode, runIds, questions) {
  const saved = loadActiveStudyState();
  const seeded = seedActiveAnswersFromProgress(questions);
  const idsMatch =
    mode === "exam-set"
      ? saved?.mode === "exam-set" && JSON.stringify(saved.examSetIds || []) === JSON.stringify(runIds || [])
      : saved?.mode === "exam" && saved.activeExamId === runIds;
  if (!idsMatch) return { activeAnswers: seeded, index: 0 };
  return {
    activeAnswers: { ...(saved.activeAnswers || {}), ...seeded },
    index: Math.min(Number(saved.index || 0), Math.max(questions.length - 1, 0)),
  };
}

function ensureQuestionTimer(questionId) {
  if (!questionId) return;
  if (state.questionTimerId === questionId && state.questionStartedAt) return;
  state.questionTimerId = questionId;
  state.questionStartedAt = Date.now();
  state.choiceTrail[questionId] = [];
}

function elapsedOnCurrentQuestion() {
  if (!state.questionStartedAt) return 0;
  return Date.now() - state.questionStartedAt;
}

function recordChoice(questionId, letter) {
  if (!questionId || !letter) return;
  const trail = state.choiceTrail[questionId] || [];
  if (trail[trail.length - 1] !== letter) trail.push(letter);
  state.choiceTrail[questionId] = trail.slice(-8);
}

function dangerousPatchFor(question, selected, grade) {
  const elapsedMs = elapsedOnCurrentQuestion();
  const trail = state.choiceTrail[question.id] || [];
  const changedCorrectToWrong = Boolean(
    question.correctAnswer &&
      selected &&
      selected !== question.correctAnswer &&
      trail.includes(question.correctAnswer),
  );
  const excessiveTime = elapsedMs >= 120000;
  return {
    lastElapsedMs: elapsedMs,
    longTimeCount: excessiveTime ? (getProgress(question.id).longTimeCount || 0) + 1 : getProgress(question.id).longTimeCount || 0,
    changedCorrectToWrong: changedCorrectToWrong || Boolean(getProgress(question.id).changedCorrectToWrong),
    dangerousUpdatedAt: excessiveTime || changedCorrectToWrong || grade === "wrong" ? Date.now() : getProgress(question.id).dangerousUpdatedAt || null,
  };
}

function dangerousReasonsFor(question) {
  const progress = getProgress(question.id);
  const attemptWrongCount = state.attempts.filter((attempt) => attempt.question_id === question.id && attempt.is_correct === false).length;
  const wrongCount = Math.max(progress.wrongCount || 0, attemptWrongCount);
  const reasons = [];
  if (wrongCount >= 2) reasons.push("errou 2 vezes");
  if ((progress.longTimeCount || 0) >= 1) reasons.push("tempo excessivo");
  if (progress.changedCorrectToWrong) reasons.push("mudou de certa para errada");
  return reasons;
}

function isDangerousQuestion(question) {
  return dangerousReasonsFor(question).length > 0;
}

function dangerousQuestions() {
  return allStudyQuestions()
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)) && isDangerousQuestion(question))
    .sort((a, b) => {
      const pa = getProgress(a.id);
      const pb = getProgress(b.id);
      return (pb.dangerousUpdatedAt || pb.updatedAt || 0) - (pa.dangerousUpdatedAt || pa.updatedAt || 0);
    });
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
  return [...state.questions, ...examStudyQuestions()];
}

function applyQuestionCorrection(question, correction) {
  if (!correction) return question;
  return {
    ...question,
    text: correction.text || question.text,
    options: correction.options || question.options,
    correctAnswer: correction.correctAnswer ?? question.correctAnswer,
    explanation: correction.explanation ?? question.explanation,
    image: correction.image || question.image,
    maintenanceFlagged: Boolean(correction.maintenanceFlagged || question.maintenanceFlagged),
    manuallyReviewed: Boolean(question.manuallyReviewed || correction.text || correction.options || correction.correctAnswer || correction.maintenanceFlagged),
    reviewedAt: correction.reviewedAt || correction.reviewed_at || question.reviewedAt,
  };
}

function effectiveQuestion(question) {
  if (!question) return null;
  const globalCorrection = state.globalCorrections[question.id];
  const localCorrection = state.corrections[question.id];
  return applyQuestionCorrection(applyQuestionCorrection(question, globalCorrection), localCorrection);
}

/* Questões que dependem de uma figura que ainda não foi enviada (data/figureRequired.js). */
const FIGURE_REQUIRED = new Set(window.BANCO_RMAIS_FIGURE_REQUIRED || []);

function missingFigure(question) {
  return Boolean(question && FIGURE_REQUIRED.has(question.id) && !question.image);
}

function isReadyQuestion(question) {
  const optionLetters = (question?.options || []).map((option) => option.letter);
  return Boolean(
    question?.correctAnswer &&
      question.options?.length >= 2 &&
      new Set(optionLetters).size === optionLetters.length &&
      question.options.some((option) => option.letter === question.correctAnswer) &&
      !missingFigure(question),
  );
}

function needsBankReview(question) {
  if (question?.maintenanceFlagged) return true;
  return !question?.annulled && !isReadyQuestion(question);
}

function readinessIssues(question) {
  const issues = [];
  if (question?.maintenanceFlagged) issues.push("sinalizada para manutenção");
  if (question?.annulled) return issues;
  if (!question?.text?.trim()) issues.push("enunciado vazio");
  if (!question?.options?.length || question.options.length < 2) issues.push("alternativas não separadas");
  if (question?.options?.length && new Set(question.options.map((option) => option.letter)).size !== question.options.length) {
    issues.push("alternativas com letras duplicadas");
  }
  if (!question?.correctAnswer) {
    issues.push("gabarito ausente");
  } else if (!question.options?.some((option) => option.letter === question.correctAnswer)) {
    issues.push("gabarito sem alternativa correspondente");
  }
  if (missingFigure(question)) issues.push("figura ausente (envie a imagem em Editar questão)");
  return issues;
}

function readinessIssueKeys(question) {
  const issues = [];
  if (question?.maintenanceFlagged) issues.push("manual-review");
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
  if (missingFigure(question)) issues.push("missing-figure");
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
    "manual-review": 0,
    "missing-figure": 0,
  };
  for (const question of pendingQuestions()) {
    counts.total += 1;
    for (const issue of readinessIssueKeys(question)) counts[issue] += 1;
  }
  return counts;
}

/* Todas as questões de provas (inclui a SES-DF, que antes ficava fora do estudo e da revisão). */
function examStudyQuestions() {
  return state.exams.flatMap((exam) => exam.questions || []);
}

/* Estudo por temas: de onde vêm as questões ("mixed", "content" = didáticas, "exams" = provas).
   As provas recebem tema em js/examTopics.js. */
function topicStudyPool() {
  if (state.topicSource === "content") return state.questions;
  if (state.topicSource === "exams") return examStudyQuestions();
  return [...state.questions, ...examStudyQuestions()];
}

function allTopics() {
  return [
    ...new Set(
      topicStudyPool()
        .filter((question) => !isExcluded(question.id))
        .map((question) => topicForQuestion(question)),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
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
  const pool = topicStudyPool();
  return state.selectedTopics.filter((topic) =>
    pool.some((question) => questionBelongsToTopic(question, topic) && !isExcluded(question.id)),
  );
}

function topicQuestions(topic) {
  return topicStudyPool().filter((question) => questionBelongsToTopic(question, topic) && !isExcluded(question.id));
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


const PSYCHOPHARM_DRUGS = [
  "antidepress", "fluoxetina", "sertralina", "paroxetina", "citalopram", "escitalopram", "venlafaxina", "desvenlafaxina",
  "duloxetina", "bupropiona", "mirtazapina", "trazodona", "vortioxetina", "agomelatina", "amitriptilina", "imipramina",
  "clomipramina", "nortriptilina", "triciclico", "isrs", "irsn", "imao", "antipsicot", "neuroleptico", "haloperidol",
  "clorpromazina", "risperidona", "olanzapina", "quetiapina", "clozapina", "aripiprazol", "ziprasidona", "paliperidona",
  "lurasidona", "litio", "valproato", "divalproato", "carbamazepina", "oxcarbazepina", "lamotrigina", "topiramato",
  "estabilizador", "benzodiazep", "diazepam", "clonazepam", "alprazolam", "lorazepam", "midazolam", "zolpidem", "zopiclona",
  "donepezila", "rivastigmina", "galantamina", "memantina", "anticolinesteras", "metilfenidato", "atomoxetina",
  "lisdexanfetamina", "psicoestimulante", "cetamina", "escetamina", "psicofarmac",
].map(normalize);

/* Termos que mostram que a pergunta é sobre o medicamento em si. */
const PSYCHOPHARM_FOCUS = [
  "efeito colateral", "efeitos colaterais", "efeito adverso", "efeitos adversos", "evento adverso", "reacao adversa",
  "reacoes adversas", "mecanismo de acao", "farmacocinet", "farmacodinam", "meia-vida", "meia vida", "interacao medicamentosa",
  "interacoes medicamentosas", "inibidor do citocromo", "cyp", "receptores", "toxicidade", "nivel serico", "niveis sericos",
  "litemia", "dosagem serica", "sindrome neuroleptica", "sindrome serotoninergica", "discinesia", "acatisia", "distonia",
  "extrapiramidal", "parkinsonismo induzido", "hiperprolactinemia", "agranulocitose", "neutropenia", "intervalo qt",
  "prolongamento do qt", "ganho de peso", "sindrome metabolica", "dose maxima", "dose inicial", "dose terapeutica",
  "doses terapeuticas", "posologia", "titulacao", "desmame", "descontinuacao", "teratogen", "lactacao", "psicofarmacolog",
].map(normalize);

const REFERENCE_CITATION = /^\s*(de acordo com|segundo|com base n[ao])\s+(a\s+)?refer[eê]ncia[\s\S]{0,260}?\b(19|20)\d{2}\b[.,;:]?\s*/i;

/* Psicofarmacologia = o assunto principal é o medicamento. Olha só o enunciado: um remédio citado
   numa alternativa, ou de passagem num caso clínico, não tira a questão do tema do transtorno.
   Entra quando o enunciado cita 2+ psicofármacos, ou 1 com termo de farmacologia (efeito adverso,
   mecanismo, nível sérico...), ou 1 num enunciado curto centrado nele ("Sobre o lítio, ..."). */
function isPsychopharmacologyQuestion(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.psychopharm.has(cacheKey)) return classificationCache.psychopharm.get(cacheKey);
  let result = question.source === "Psicofarmacologia";
  if (!result) {
    const stem = normalize(String(question.text || "").replace(REFERENCE_CITATION, ""));
    const drugsInStem = PSYCHOPHARM_DRUGS.filter((drug) => stem.includes(drug)).length;
    result = drugsInStem >= 2 || (drugsInStem === 1 && (stem.length <= 260 || PSYCHOPHARM_FOCUS.some((term) => stem.includes(term))));
  }
  classificationCache.psychopharm.set(cacheKey, result);
  return result;
}

/* Sem palavra-chave: usa o subtema do próprio tema quando ele é óbvio. */
const DEFAULT_SUBTHEME_BY_TOPIC = {
  "Intoxicação por Drogas e Dependência Química": "Drogas e intoxicações",
  "Saúde do Idoso": "Psicogeriatria e saúde do idoso",
};

function defaultSubthemeForTopic(topic) {
  if (DEFAULT_SUBTHEME_BY_TOPIC[topic]) return DEFAULT_SUBTHEME_BY_TOPIC[topic];
  const rules = SUBTHEME_RULES.filter((rule) => rule.topics.includes(topic));
  return rules.length === 1 ? rules[0].label : "";
}

function questionSubtheme(question) {
  const cacheKey = question.id || `${question.source}-${question.number}`;
  if (classificationCache.subtheme.has(cacheKey)) return classificationCache.subtheme.get(cacheKey);
  /* Enunciado vale o dobro das alternativas (que trazem distratores); o tema da questão desempata. */
  const view = effectiveQuestion(question);
  const stem = subthemeKeywordsIn(String(view.text || "").replace(REFERENCE_CITATION, ""));
  const options = subthemeKeywordsIn((view.options || []).map((option) => option.text).join(" "));
  const topic = topicForQuestion(question);
  const scored = SUBTHEME_RULES.map((rule, index) => {
    let stemHits = 0;
    let optionHits = 0;
    for (const needle of rule.needles) {
      if (stem.has(needle.keyword)) stemHits += 1;
      else if (options.has(needle.keyword)) optionHits += 1;
    }
    let score = 2 * stemHits + Math.min(optionHits, 2);
    if (score > 0 && rule.topics.includes(topic)) score += 1.5;
    return { label: rule.label, score, index };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const result = scored[0]?.label || defaultSubthemeForTopic(topic) || "Subtema a revisar";
  classificationCache.subtheme.set(cacheKey, result);
  return result;
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
    intervalDays = conf <= 2 || conf === 6 ? 1 : 3;
    if (wrongCount >= 2) intervalDays = 1;
  } else if (conf === 6) {
    intervalDays = 3;
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
    review: grade === "wrong" || conf <= 3 || conf === 6,
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
      wrongCount: countAttempt ? (previous.wrongCount || 0) + 1 : previous.wrongCount || 1,
      correctStreak: 0,
      confidence,
      intervalDays: plan.intervalDays,
      nextReviewAt: plan.nextReviewAt,
      lastWrongAt: Date.now(),
    };
  }
  if (grade === "correct") {
    return {
      correctStreak: countAttempt ? (previous.correctStreak || 0) + 1 : previous.correctStreak || 1,
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
  if (state.dangerousReviewActive) return "dangerous-review";
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
  state.attempts = state.attempts.slice(-MAX_STORED_ATTEMPTS);
  saveAttempts();
  if (typeof recordStudyLogAttempt === "function") recordStudyLogAttempt(attempt, progress);
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
  const confidenceForPriority = confidence === 6 ? 1 : confidence;
  const lowConfidenceWeight = Math.max(0, 4 - confidenceForPriority);
  const since = daysSince(progress.updatedAt);
  const themeWeaknessWeight = themeWeaknessScore(topicForQuestion(question));
  const questionDifficultyWeight = progress.wrongCount || 0;
  return Math.round(((isWrong * 3) + (lowConfidenceWeight * 2) + (since * 0.5) + (themeWeaknessWeight * 2) + questionDifficultyWeight) * 10) / 10;
}

function saveReviewPreferences() {
  localStorage.setItem("banco-rmais-review-target-exam", state.reviewTargetExam);
  localStorage.setItem("banco-rmais-review-mode", state.reviewMode);
  localStorage.setItem("banco-rmais-review-minutes", String(state.reviewAvailableMinutes));
}

function normalText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function questionSearchText(question) {
  return normalText([
    question?.topic,
    question?.subtheme,
    question?.source,
    question?.examTag,
    question?.text,
    questionSubtheme(question || {}),
  ].join(" "));
}

function questionImportance(question) {
  const text = questionSearchText(question);
  if (/delirium|demencia|alzheimer|moca|beers|psicofarmacologia|litio|clozapina|anticolinerg|psicogeriatria/.test(text)) return 5;
  if (/suicidio|catatonia|serotoninergica|neuroleptica|intoxic|emergencia|organico|bipolar|psicotico/.test(text)) return 4;
  if (/ansiedade|humor|personalidade|forense|psicoterapia|infancia|tdah|tea/.test(text)) return 3;
  return 2;
}

function targetExamFrequencyFromText(text, targetExam) {
  const normalizedTarget = normalText(targetExam);
  if (normalizedTarget && normalizedTarget !== "todas" && text.includes(normalizedTarget)) return 5;
  if (text.includes("usp")) return 5;
  if (text.includes("unifesp") || text.includes("sus-sp") || text.includes("unicamp") || text.includes("abp")) return 4;
  return 0;
}

function getQuestionExamFrequency(question, targetExam = "Todas") {
  const text = questionSearchText(question);
  const direct = targetExamFrequencyFromText(text, targetExam);
  if (direct) return direct;
  return questionImportance(question);
}

function allFlashcardItems() {
  return (state.flashcards || []).flatMap((deck) =>
    flashcardCardsForDeck(deck, { applyImportance: false }).map((card) => ({
      kind: "flashcard",
      id: card.id,
      card,
      deck,
      module: card.module || deck.module || deck.title || "",
      topic: card.topic || deck.title || "",
      title: card.front || deck.title || card.id,
    })),
  );
}

function conceptTitleForQuestion(question) {
  return questionSubtheme(question) || topicForQuestion(question) || question.source || "Conceito";
}

function conceptIdForQuestion(question) {
  const text = normalText(`${topicForQuestion(question)} ${questionSubtheme(question)}`);
  return `q:${text || question.id}`;
}

function conceptIdForFlashcard(card, deck) {
  const text = normalText(`${card.module || deck?.module || ""} ${card.topic || ""} ${(card.tags || [])[0] || ""}`);
  return `f:${text || card.id}`;
}

function questionUserStats(question) {
  const progress = getProgress(question.id);
  const attempts = state.attempts.filter((attempt) => attempt.question_id === question.id);
  const wrongAttempts = attempts.filter((attempt) => attempt.is_correct === false).length;
  const correctAttempts = attempts.filter((attempt) => attempt.is_correct === true).length;
  const wrong = Math.max(progress.wrongCount || 0, wrongAttempts);
  const correct = Math.max(progress.correctStreak || 0, correctAttempts);
  return {
    attempts: Math.max(wrong + correct, attempts.length, progress.grade ? 1 : 0),
    correct,
    wrong,
    lastAnsweredAt: progress.updatedAt || null,
    lastReviewedAt: progress.updatedAt || null,
    nextReviewAt: progress.nextReviewAt || null,
    confidenceHistory: [progress.confidence, ...attempts.map((attempt) => attempt.confidence)].filter(Boolean),
    averageResponseTime: progress.lastElapsedMs || null,
    lapses: wrong,
    conceptId: conceptIdForQuestion(question),
  };
}

function flashcardUserStats(card) {
  const progress = state.flashcardProgress[card.id] || {};
  const grade = progress.lastGrade || progress.grade || null;
  const lapses = progress.lapses || (grade === "again" ? 1 : 0);
  return {
    attempts: progress.repetitions || 0,
    correct: progress.correct || (grade === "easy" || grade === "good" ? 1 : 0),
    wrong: lapses,
    lastAnsweredAt: progress.lastReviewedAt || null,
    lastReviewedAt: progress.lastReviewedAt || null,
    nextReviewAt: progress.nextReviewAt || null,
    confidenceHistory: grade === "again" ? [1] : grade === "hard" ? [2] : grade === "good" ? [4] : grade === "easy" ? [5] : [],
    averageResponseTime: null,
    lapses,
    conceptId: null,
  };
}

function buildConceptMap(questions = allStudyQuestions(), flashcards = allFlashcardItems()) {
  const map = new Map();
  const ensure = (conceptId, patch) => {
    const current = map.get(conceptId) || {
      conceptId,
      title: patch.title || "Conceito",
      tags: new Set(),
      module: patch.module || "",
      attempts: 0,
      correct: 0,
      wrong: 0,
      mastery: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
      relatedQuestionIds: [],
      relatedFlashcardIds: [],
      reviewPriorityScore: 0,
    };
    if (patch.tags) patch.tags.forEach((tag) => current.tags.add(tag));
    if (patch.module && !current.module) current.module = patch.module;
    map.set(conceptId, current);
    return current;
  };
  questions.forEach((question) => {
    const conceptId = conceptIdForQuestion(question);
    const stats = questionUserStats(question);
    const item = ensure(conceptId, {
      title: conceptTitleForQuestion(question),
      module: topicForQuestion(question),
      tags: [topicForQuestion(question), questionSubtheme(question)].filter(Boolean),
    });
    item.attempts += stats.attempts;
    item.correct += stats.correct;
    item.wrong += stats.wrong;
    item.lastReviewedAt = Math.max(item.lastReviewedAt || 0, stats.lastReviewedAt || 0) || null;
    item.nextReviewAt = Math.min(item.nextReviewAt || Infinity, stats.nextReviewAt || Infinity);
    item.relatedQuestionIds.push(question.id);
  });
  flashcards.forEach(({ card, deck }) => {
    const conceptId = conceptIdForFlashcard(card, deck);
    const progress = flashcardUserStats(card);
    const item = ensure(conceptId, {
      title: card.topic || card.front || deck?.title,
      module: card.module || deck?.module || deck?.title,
      tags: card.tags || [],
    });
    item.attempts += progress.attempts;
    item.correct += progress.correct;
    item.wrong += progress.wrong;
    item.relatedFlashcardIds.push(card.id);
  });
  for (const item of map.values()) {
    item.mastery = item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0;
    if (item.nextReviewAt === Infinity) item.nextReviewAt = null;
    item.tags = [...item.tags];
  }
  return map;
}

function frequencyValueToScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0) * 20));
}

function calculateExamFrequencyScore(item, targetExam = "Todas") {
  if (item.kind === "flashcard") {
    const frequency = item.card?.examFrequency || {};
    if (targetExam !== "Todas" && Number.isFinite(frequency[targetExam])) return frequencyValueToScore(frequency[targetExam]);
    const banks = ["USP", "UNIFESP", "UNICAMP", "SUS-SP", "ABP"];
    const values = banks.map((bank) => Number(frequency[bank])).filter(Number.isFinite);
    if (values.length) return frequencyValueToScore(values.reduce((sum, value) => sum + value, 0) / values.length);
    return frequencyValueToScore(normalizeFlashcardImportance(item.card, getDeckImportance(item.deck)));
  }
  return frequencyValueToScore(getQuestionExamFrequency(item.question, targetExam));
}

function calculatePersonalErrorScore(userStats = {}) {
  const wrong = userStats.wrong || 0;
  if (wrong >= 3) return 100;
  if (wrong === 2) return 60;
  if (wrong === 1) return 30;
  return 0;
}

function calculateRepeatedErrorScore(conceptStats = {}) {
  const wrong = conceptStats.wrong || 0;
  if (wrong >= 4) return 100;
  if (wrong === 3) return 85;
  if (wrong === 2) return 65;
  if (wrong === 1) return 25;
  return 0;
}

function calculateDaysOverdueScore(nextReviewAt) {
  if (!nextReviewAt) return 0;
  const days = Math.floor((Date.now() - Number(nextReviewAt)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 0;
  if (days <= 3) return 25;
  if (days <= 14) return 55;
  if (days <= 30) return 75;
  return 85;
}

function calculateLowConfidenceScore(confidenceHistory = []) {
  const values = confidenceHistory.map(Number).filter(Number.isFinite);
  if (!values.length) return 0;
  const last = values[0];
  if (last === 1) return 100;
  if (last === 2 || last === 6) return 80;
  if (last === 3) return 45;
  if (last === 4) return 10;
  return 0;
}

function calculateImportanceScore(item) {
  if (item.kind === "flashcard") return frequencyValueToScore(normalizeFlashcardImportance(item.card, getDeckImportance(item.deck)));
  return frequencyValueToScore(questionImportance(item.question));
}

function calculateDangerousTopicScore(item) {
  const text = item.kind === "flashcard"
    ? normalText([item.card?.front, item.card?.back, item.card?.topic, item.card?.module, ...(item.card?.tags || [])].join(" "))
    : questionSearchText(item.question);
  const keywords = [
    "delirium",
    "demencia",
    "psicofarmacologia",
    "litio",
    "clozapina",
    "anticolinerg",
    "suicidio",
    "catatonia",
    "serotoninergica",
    "neuroleptica",
    "intoxic",
    "emergencia",
    "organico",
    "lewy",
  ];
  const matched = keywords.filter((keyword) => text.includes(keyword)).length;
  return Math.min(100, matched * 35);
}

function calculateWeakTopicScore(conceptStats = {}) {
  if (!conceptStats.attempts) return 15;
  const accuracy = conceptStats.correct / conceptStats.attempts;
  if (accuracy < 0.6) return 100;
  if (accuracy < 0.8) return 55;
  return 10;
}

function calculateReviewPriorityScore(item, userStats, targetExam, conceptStats) {
  const components = {
    examFrequencyScore: calculateExamFrequencyScore(item, targetExam),
    personalErrorScore: calculatePersonalErrorScore(userStats),
    repeatedErrorScore: calculateRepeatedErrorScore(conceptStats),
    daysOverdueScore: calculateDaysOverdueScore(userStats.nextReviewAt || conceptStats?.nextReviewAt),
    lowConfidenceScore: calculateLowConfidenceScore(userStats.confidenceHistory),
    importanceScore: calculateImportanceScore(item),
    dangerousTopicScore: calculateDangerousTopicScore(item),
    weakTopicScore: calculateWeakTopicScore(conceptStats),
  };
  const weights = {
    examFrequencyScore: 2.0,
    personalErrorScore: 2.2,
    repeatedErrorScore: 2.0,
    daysOverdueScore: 1.2,
    lowConfidenceScore: 1.5,
    importanceScore: 2.0,
    dangerousTopicScore: 1.7,
    weakTopicScore: 1.8,
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const raw = Object.entries(weights).reduce((sum, [key, weight]) => sum + components[key] * weight, 0);
  return {
    score: Math.max(0, Math.min(100, Math.round(raw / totalWeight))),
    components,
  };
}

function reviewCategoryForScore(score) {
  if (score >= 80) return "critical";
  if (score >= 50) return "important";
  if (score >= 20) return "maintenance";
  return "low";
}

function reviewCategoryLabel(category) {
  const labels = {
    critical: "Crítica",
    important: "Importante",
    maintenance: "Manutenção",
    low: "Baixa prioridade",
  };
  return labels[category] || category;
}

function reviewItemTitle(item) {
  if (item.kind === "flashcard") return item.card.front || item.deck.title || "Flashcard";
  return conceptTitleForQuestion(item.question);
}

function explainReviewItem(item) {
  const parts = [];
  const components = item.components || {};
  if (components.examFrequencyScore >= 80) parts.push("tema de alta frequência na banca selecionada");
  if (components.importanceScore >= 80) parts.push("importância alta para prova");
  if (components.personalErrorScore >= 60) parts.push("erro pessoal repetido");
  else if (components.personalErrorScore >= 30) parts.push("erro anterior");
  if (components.repeatedErrorScore >= 60) parts.push("conceito frágil no seu histórico");
  if (components.lowConfidenceScore >= 70) parts.push("baixa confiança marcada");
  if (components.daysOverdueScore >= 55) parts.push("revisão atrasada");
  if (components.dangerousTopicScore >= 35) parts.push("assunto com pegadinha/risco de prova");
  if (components.weakTopicScore >= 55) parts.push("desempenho baixo no tema");
  if (!parts.length) parts.push("manutenção de tema relevante");
  return parts.join(", ") + ".";
}

function reviewModeMatches(item, mode) {
  if (mode === "flashcards") return item.kind === "flashcard";
  if (mode === "questions") return item.kind === "question";
  if (mode === "high-priority") return item.score >= 50;
  if (mode === "repeated-errors") return item.components.personalErrorScore >= 60 || item.components.repeatedErrorScore >= 60;
  if (mode === "exam-themes") return item.components.examFrequencyScore >= 80 || item.components.importanceScore >= 80;
  if (mode === "light") return item.score >= 20 && item.score < 80;
  return true;
}

function maxItemsForMinutes(minutes) {
  if (minutes <= 10) return 10;
  if (minutes >= 40) return 35;
  return 20;
}

function getTodayReviewSession({ targetExam = state.reviewTargetExam, maxItems, mode = state.reviewMode, availableMinutes = state.reviewAvailableMinutes } = {}) {
  const limit = maxItems || maxItemsForMinutes(Number(availableMinutes || 20));
  const questions = allStudyQuestions().filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  const flashcards = allFlashcardItems();
  const conceptMap = buildConceptMap(questions, flashcards);
  const questionItems = questions.map((question) => {
    const userStats = questionUserStats(question);
    const conceptStats = conceptMap.get(userStats.conceptId) || {};
    const result = calculateReviewPriorityScore({ kind: "question", question }, userStats, targetExam, conceptStats);
    return {
      kind: "question",
      id: question.id,
      question,
      conceptId: userStats.conceptId,
      conceptTitle: conceptTitleForQuestion(question),
      userStats,
      conceptStats,
      score: result.score,
      components: result.components,
    };
  });
  const flashcardItems = flashcards.map((item) => {
    const userStats = flashcardUserStats(item.card);
    const conceptId = conceptIdForFlashcard(item.card, item.deck);
    const conceptStats = conceptMap.get(conceptId) || {};
    const result = calculateReviewPriorityScore(item, { ...userStats, conceptId }, targetExam, conceptStats);
    return {
      ...item,
      conceptId,
      conceptTitle: item.card.topic || item.card.module || item.deck.title,
      userStats,
      conceptStats,
      score: result.score,
      components: result.components,
    };
  });
  let pool = [...questionItems, ...flashcardItems]
    .map((item) => ({
      ...item,
      category: reviewCategoryForScore(item.score),
    }))
    .filter((item) => item.score >= 20 && reviewModeMatches(item, mode))
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id), "pt-BR"));

  let fallbackFrom = "";
  if (!pool.length && mode !== "mixed") {
    fallbackFrom = mode;
    pool = [...questionItems, ...flashcardItems]
      .map((item) => ({ ...item, category: reviewCategoryForScore(item.score) }))
      .filter((item) => item.score >= 20)
      .sort((a, b) => b.score - a.score);
  }

  const selected = [];
  const conceptUse = new Map();
  const flashcardLimit = mode === "flashcards" ? limit : Math.max(2, Math.round(limit * 0.25));
  let flashcardCount = 0;
  for (const item of pool) {
    const used = conceptUse.get(item.conceptId) || 0;
    if (used >= 2) continue;
    if (item.kind === "flashcard" && mode !== "flashcards" && flashcardCount >= flashcardLimit) continue;
    selected.push({ ...item, explanation: explainReviewItem(item) });
    conceptUse.set(item.conceptId, used + 1);
    if (item.kind === "flashcard") flashcardCount += 1;
    if (selected.length >= limit) break;
  }
  /* Quando o tipo escolhido não tem itens, a revisão vira geral; quem inicia a
     revisão usa isto para avisar o aluno em vez de trocar o conteúdo em silêncio. */
  selected.fallbackFrom = fallbackFrom;
  return selected;
}

const REVIEW_FALLBACK_NOTICES = {
  "repeated-errors": "Revisão geral: você ainda não tem erros repetidos (questão ou assunto errado 2 ou mais vezes)",
  "high-priority": "Revisão geral: nenhum item de alta prioridade no momento",
  "exam-themes": "Revisão geral: nenhum tema de prova pendente no momento",
  light: "Revisão geral: nenhum item de revisão leve no momento",
  questions: "Revisão geral: nenhuma questão pendente para revisar no momento",
  flashcards: "Revisão geral: nenhum flashcard pendente no momento",
};

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
    status: progress.grade === "correct" && progress.confidence === 5 && (progress.correctStreak || 0) >= 3 ? "mastered" : "active",
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
  const confirmedAttempt = Boolean(patch.confirmed && Object.prototype.hasOwnProperty.call(patch, "grade") && nextGrade);
  const countAttempt = confirmedAttempt || gradeChanged;
  const reviewPatch = shouldRecalculate ? reviewPatchForGrade(previous, nextGrade, nextConfidence, countAttempt) : {};
  const shouldCheckDanger = patch.confirmed || Object.prototype.hasOwnProperty.call(patch, "grade");
  const dangerPatch = shouldCheckDanger && nextGrade ? dangerousPatchFor(question, patch.selected ?? previous.selected, nextGrade) : {};
  state.progress[question.id] = { ...previous, ...patch, ...reviewPatch, ...dangerPatch, updatedAt: Date.now() };
  if (patch.confirmed || nextGrade) {
    delete state.discardedOptions[question.id];
    delete state.choiceTrail[question.id];
    state.questionTimerId = null;
    state.questionStartedAt = null;
    saveDiscardedOptions();
  }
  if (countAttempt && nextGrade) saveAttempt(question, state.progress[question.id]);
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

/* Minúsculas e sem acentos. A faixa de acentos combinados é bem mais rápida que \p{Diacritic}
   (normalize roda milhões de vezes ao classificar o banco) e dá o mesmo resultado em português. */
function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Enunciado na tela:
   - a citação do livro no início ("De acordo com a referência ... 2022,") vira uma linha pequena
     ("Referência: Tratado de Psiquiatria da ABP · 2022", citação completa ao passar o mouse);
   - na SES-DF, cada item repete o caso clínico antes da afirmação (separados por linha em branco):
     o caso vai para um quadro recolhível, fechado quando é o mesmo da questão anterior da lista. */
function renderQuestionText(question) {
  let text = String(question.text || "");
  let citationHtml = "";
  const citation = text.match(REFERENCE_CITATION);
  if (citation && text.length - citation[0].length > 20) {
    const full = citation[0].trim().replace(/[,;:]$/, "");
    text = text.slice(citation[0].length);
    text = text.charAt(0).toUpperCase() + text.slice(1);
    citationHtml = `<span class="question-citation" title="${escapeHtml(full)}">Referência: ${escapeHtml(citationLabel(full))}</span>`;
  }
  const parts = sharedCaseParts(question, text);
  let html;
  if (!parts) {
    html = `${citationHtml}<span class="question-body">${escapeHtml(text)}</span>`;
  } else {
    const previous = state.filtered[state.index - 1];
    const sameAsPrevious = previous && sharedCaseParts(previous, String(previous.text || ""))?.caseText === parts.caseText;
    /* Sem espaços entre as tags: o enunciado usa white-space: pre-wrap. */
    html = [
      citationHtml,
      `<details class="question-case"${sameAsPrevious ? "" : " open"}>`,
      `<summary>Caso clínico${sameAsPrevious ? " (o mesmo da questão anterior)" : ""}</summary>`,
      `<div class="question-case-text">${escapeHtml(parts.caseText)}</div>`,
      "</details>",
      `<span class="question-body question-statement">${escapeHtml(parts.statement)}</span>`,
    ].join("");
  }
  /* Mesmo enunciado (ex.: só marcou uma alternativa): não redesenha, para não fechar o caso aberto. */
  if (el.text.dataset.rendered === html && el.text.innerHTML) return;
  el.text.innerHTML = html;
  el.text.dataset.rendered = html;
}

function citationLabel(full) {
  const year = full.match(/\b(?:19|20)\d{2}\b/)?.[0];
  let label = /tratado de psiquiatria da associa/i.test(full)
    ? "Tratado de Psiquiatria da ABP"
    : full.replace(/^\s*(de acordo com|segundo|com base n[ao])\s+(a\s+)?refer[eê]ncia\s*/i, "");
  if (label.length > 70) label = `${label.slice(0, 67).trim()}…`;
  return year && !label.includes(year) ? `${label} · ${year}` : label;
}

/* Caso clínico + afirmação dos itens da SES-DF (o caso vem antes da última linha em branco). */
function sharedCaseParts(question, text) {
  if (!String(question?.id || "").startsWith("sesdf")) return null;
  const split = text.lastIndexOf("\n\n");
  if (split < 200) return null;
  return { caseText: text.slice(0, split).trim(), statement: text.slice(split + 2).trim() };
}

/* Comentário da questão (escrito pela administração em Editar questão): aparece depois de
   responder, nunca durante simulado. Sem comentário, só a administração vê o convite para escrever. */
function renderExplanation(question, answered) {
  if (!el.explanationPanel) return;
  const text = answered ? String(question?.explanation || "").trim() : "";
  const showInvite = answered && !text && state.isAdmin;
  el.explanationPanel.hidden = !text && !showInvite;
  el.explanationPanel.classList.toggle("empty", !text);
  el.explanationText.innerHTML = text ? renderSafeMarkdown(text) : showInvite ? '<p class="panel-line">Esta questão ainda não tem comentário.</p>' : "";
  if (el.addExplanation) {
    el.addExplanation.hidden = !state.isAdmin || !answered;
    el.addExplanation.textContent = text ? "Editar comentário" : "Adicionar comentário";
  }
}

function renderSafeMarkdown(value) {
  const normalized = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^\s*>\s?/, ""))
    .join("\n")
    .trim();
  if (!normalized) return "";
  const escaped = escapeHtml(normalized);
  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
  /* Parágrafos (linha em branco separa), títulos (#, ##, ###) e listas (- ou * e 1.) em qualquer
     linha do bloco: os comentários costumam vir escritos em Markdown. */
  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const out = [];
      let paragraph = [];
      let list = null;
      const flushParagraph = () => {
        if (paragraph.length) out.push(`<p>${inline(paragraph.join("<br>"))}</p>`);
        paragraph = [];
      };
      const flushList = () => {
        if (list) out.push(`<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.tag}>`);
        list = null;
      };
      for (const line of block.split("\n")) {
        const heading = line.match(/^\s*#{1,3}\s*#?\s*(.+)$/);
        const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
        const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
        if (heading) {
          flushParagraph();
          flushList();
          out.push(`<p class="markdown-heading">${inline(heading[1])}</p>`);
        } else if (bullet || numbered) {
          flushParagraph();
          const tag = bullet ? "ul" : "ol";
          if (list?.tag !== tag) {
            flushList();
            list = { tag, items: [] };
          }
          list.items.push((bullet || numbered)[1]);
        } else if (list && /^\s{2,}\S/.test(line)) {
          list.items[list.items.length - 1] += `<br>${line.trim()}`;
        } else {
          flushList();
          paragraph.push(line);
        }
      }
      flushParagraph();
      flushList();
      return out.join("");
    })
    .join("");
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

  if (state.dangerousReviewActive) {
    const byId = new Map(allStudyQuestions().map((question) => [question.id, question]));
    state.filtered = state.dangerousReviewIds
      .map((id) => byId.get(id))
      .filter((question) => question && !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
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

  /* Estudo por tema/subtema: a lista foi montada ao abrir (pendentes ou todas); só tira excluídas.
     Antes caía no filtro geral, que esvaziava a lista quando nenhum filtro administrativo estava ativo. */
  if (state.topicActive && state.filtered.length) {
    state.filtered = state.filtered.filter((question) => !isExcluded(question.id));
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
  const pendingStatuses = new Set(["needs-review", "missing-answer", "answer-mismatch", "incomplete-options", "duplicate-options", "uncertain-topic", "no-explanation", "missing-figure", "reported", "suspicious-key"]);
  const reportedIds = status === "reported" && typeof reportedQuestionIds === "function" ? reportedQuestionIds() : new Set();
  const suspiciousIds = status === "suspicious-key" && typeof suspiciousAnswerIds === "function" ? suspiciousAnswerIds() : new Set();
  const pendingAdminMode = pendingStatuses.has(status);
  const activeTopicIds = state.topicActive ? new Set(state.topicIds) : null;
  const selectedTopicIds = !state.topicActive && Array.isArray(state.selectedTopics) ? new Set(state.selectedTopics) : null;

  const filterBase = pendingAdminMode ? allStudyQuestions() : activeTopicIds ? topicStudyPool() : state.questions;
  state.filtered = filterBase.filter((question) => {
    if (isExcluded(question.id)) return false;
    const view = effectiveQuestion(question);
    const progress = getProgress(question.id);
    const haystack = normalize(`${view.topic} ${view.source} ${view.title} ${view.text}`);
    const matchesQuery = !query || haystack.includes(query);
    const matchesTopic = pendingAdminMode
      ? true
      : activeTopicIds
        ? [...activeTopicIds].some((topicName) => questionBelongsToTopic(view, topicName) && questionInTopicSubtheme(question, topicName, state.topicSubtheme))
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
      (status === "missing-figure" && missingFigure(view)) ||
      (status === "uncertain-topic" && hasUncertainStudyTopic(question)) ||
      (status === "no-explanation" && lacksExplanation(view)) ||
      (status === "reported" && reportedIds.has(question.id)) ||
      (status === "suspicious-key" && suspiciousIds.has(question.id)) ||
      (status === "unseen" && !progress.grade) ||
      (status === "correct" && progress.grade === "correct") ||
      (status === "wrong" && progress.grade === "wrong") ||
      (status === "review" && progress.review) ||
      (status === "favorite" && progress.favorite);
    return matchesQuery && matchesTopic && matchesStatus;
  });
  if (status === "no-explanation") state.filtered = sortByExplanationPriority(state.filtered);
  /* Fila de tema incerto: as classificações mais duvidosas primeiro. */
  if (status === "uncertain-topic" && typeof examTopicConfidence === "function") {
    state.filtered.sort((a, b) => (examTopicConfidence(a) ?? 1) - (examTopicConfidence(b) ?? 1));
  }

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

function renderPendingSummary() {
  /* Só a administração vê; poupa varrer o banco inteiro (e classificar provas) a cada abertura. */
  if (!el.pendingSummary || !state.isAdmin) return;
  const counts = pendingCounts();
  const reportedCount = typeof reportedQuestionIds === "function" ? reportedQuestionIds().size : 0;
  const suspiciousCount = typeof suspiciousAnswerIds === "function" ? suspiciousAnswerIds().size : 0;
  const suspiciousButton = `<button data-pending-filter="suspicious-key" title="${state.answerStatsStatus === "unavailable" ? "Para ativar, rode supabase/question_answer_stats.sql no Supabase." : "Questões em que quase todos erram ou a maioria marca a mesma alternativa errada"}"><strong>${suspiciousCount}</strong><span>gabarito suspeito</span>${state.answerStatsStatus === "unavailable" ? "<small>falta ativar no banco</small>" : ""}</button>`;
  el.pendingSummary.innerHTML = `
    ${suspiciousButton}
    <button data-pending-filter="reported" title="${state.openReportsStatus === "unavailable" ? "Para receber reportes, rode supabase/question_reports.sql no Supabase." : "Erros reportados pelos usuários"}"><strong>${reportedCount}</strong><span>reportadas pelos usuários</span>${state.openReportsStatus === "unavailable" ? "<small>falta ativar no banco</small>" : ""}</button>
    <button data-pending-filter="needs-review"><strong>${counts.total}</strong><span>pendentes</span></button>
    <button data-pending-filter="missing-answer"><strong>${counts["missing-answer"]}</strong><span>sem gabarito</span></button>
    <button data-pending-filter="answer-mismatch"><strong>${counts["answer-mismatch"]}</strong><span>gabarito inconsistente</span></button>
    <button data-pending-filter="incomplete-options"><strong>${counts["incomplete-options"]}</strong><span>alternativas incompletas</span></button>
    <button data-pending-filter="duplicate-options"><strong>${counts["duplicate-options"]}</strong><span>alternativas duplicadas</span></button>
    <button data-pending-filter="missing-figure"><strong>${counts["missing-figure"]}</strong><span>figura ausente</span></button>
    <button data-pending-filter="uncertain-topic"><strong>${allStudyQuestions().filter((question) => !isExcluded(question.id) && hasUncertainStudyTopic(question)).length}</strong><span>tema incerto (provas)</span></button>
    <button data-pending-filter="no-explanation" title="${state.errorStatsStatus === "ready" ? "Ordenada pelos erros de todos os usuários" : "Ordenada pelos seus erros. Para usar os erros de todos, rode supabase/question_error_stats.sql no Supabase."}"><strong>${allStudyQuestions().filter((question) => !isExcluded(question.id) && lacksExplanation(effectiveQuestion(question))).length}</strong><span>sem comentário</span><small>${state.errorStatsStatus === "ready" ? "por erros de todos" : state.errorStatsStatus === "loading" ? "carregando erros…" : "por seus erros"}</small></button>
  `;
}

/* Fila "Sem comentário": primeiro o que mais rende comentar.
   - prova real antes de didática, e da banca do plano antes das outras;
   - subtema que mais cai na banca do plano (sem plano: frequência em todas as provas);
   - quanto os usuários erram a questão (proporção de pessoas, com 3+ respondendo);
     sem esses totais, se a própria pessoa errou;
   - prova mais recente. */
function sortByExplanationPriority(questions) {
  const examById = new Map();
  for (const exam of state.exams) for (const question of exam.questions || []) examById.set(question.id, exam);
  let share = typeof examFrequencyShare === "function" ? examFrequencyShare(state.studyPlan) : null;
  if (!share) {
    const counts = new Map();
    for (const exam of state.exams) {
      for (const question of exam.questions || []) {
        const subtheme = questionSubtheme(question);
        counts.set(subtheme, (counts.get(subtheme) || 0) + 1);
      }
    }
    share = (subtheme) => (counts.get(subtheme) || 0) / Math.max(examById.size, 1);
  }
  const targets = typeof examTargetList === "function" ? examTargetList(state.studyPlan?.targetExam) : [];
  const score = (question) => {
    const exam = examById.get(question.id);
    const year = Number(question.year || exam?.year) || 0;
    const fromTarget = exam && targets.includes(normalizedExamTarget(String(exam.institution || exam.provider || "")));
    return (exam ? 3 : 0)
      + (fromTarget ? 3 : 0)
      + Math.min(share(questionSubtheme(question)) * 25, 3)
      + errorPriority(question)
      + (year ? Math.max(0, Math.min(year - 2015, 10)) / 10 : 0);
  };
  return questions
    .map((question, order) => ({ question, order, score: score(question) }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((item) => item.question);
}

const MIN_USERS_FOR_ERROR_RATE = 3;
const ERROR_RATE_WEIGHT = 8;

/* Com os totais de todos: proporção de pessoas que erraram (até +8). Questão com poucos dados
   recebe a média do banco, para ficar acima das que quase todo mundo acerta. */
function errorPriority(question) {
  if (state.errorStatsStatus === "ready") {
    const entry = state.errorStats.get(String(question.id));
    const rate = entry && entry.users >= MIN_USERS_FOR_ERROR_RATE ? entry.usersWrong / entry.users : averageErrorRate();
    return ERROR_RATE_WEIGHT * rate;
  }
  return getProgress(question.id).grade === "wrong" ? 2 : 0;
}

function averageErrorRate() {
  if (state.errorStatsAverage !== undefined) return state.errorStatsAverage;
  let users = 0;
  let wrong = 0;
  for (const entry of state.errorStats.values()) {
    if (entry.users < MIN_USERS_FOR_ERROR_RATE) continue;
    users += entry.users;
    wrong += entry.usersWrong;
  }
  state.errorStatsAverage = users ? wrong / users : 0.3;
  return state.errorStatsAverage;
}

/* Questão respondível que ainda não tem comentário (fila de trabalho da administração). */
function lacksExplanation(question) {
  return !question?.annulled && !String(question?.explanation || "").trim() && isReadyQuestion(question);
}

/* Tema escolhido à mão pela administração (Editar questão), que vale sobre a classificação automática. */
function manualStudyTopic(question) {
  return state.corrections[question?.id]?.studyTopic || state.globalCorrections[question?.id]?.studyTopic || "";
}

/* Questão de prova classificada automaticamente com pouca confiança e ainda sem tema escolhido à mão. */
function hasUncertainStudyTopic(question) {
  if (manualStudyTopic(question) || typeof examTopicConfidence !== "function") return false;
  const confidence = examTopicConfidence(question);
  return confidence !== null && confidence < 0.9;
}

function currentFlashcardDeck() {
  const decks = filteredFlashcardDecks();
  return decks.find((deck) => deck.id === state.flashcardDeckId) || decks[0] || null;
}

function filteredFlashcardDecks() {
  return (state.flashcards || [])
    .filter((deck) => {
      const categoryMatch = state.flashcardCategory === "all" || deck.area === state.flashcardCategory;
      const requestedImportance = selectedFlashcardImportance();
      const priorityMatch =
        requestedImportance === null ||
        getDeckImportance(deck) === requestedImportance ||
        (deck.cards || []).some((card) => normalizeFlashcardImportance(card, getDeckImportance(deck)) === requestedImportance);
      return categoryMatch && priorityMatch;
    })
    .sort((a, b) => {
      const importanceDiff = getDeckImportance(b) - getDeckImportance(a);
      if (importanceDiff) return importanceDiff;
      const orderDiff = flashcardModuleOrder(a) - flashcardModuleOrder(b);
      if (orderDiff) return orderDiff;
      return String(a.title || "").localeCompare(String(b.title || ""), "pt-BR");
    });
}

function selectedFlashcardImportance() {
  if (state.flashcardPriority === "all") return null;
  const value = Number(String(state.flashcardPriority).replace("importance-", ""));
  return Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : null;
}

function clampImportance(value, fallback = 3) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(5, numeric));
}

function normalizeFlashcardText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getDeckImportance(deck) {
  if (Number.isFinite(deck?.importance)) return clampImportance(deck.importance);
  const moduleName = normalizeFlashcardText(`${deck?.module || ""} ${deck?.title || ""}`);
  if (moduleName.includes("delirium")) return 5;
  if (moduleName.includes("bpsd") || moduleName.includes("sintomas neuropsiquiatricos")) return 4;
  if (moduleName.includes("demencia") || moduleName.includes("demencias")) return 5;
  if (moduleName.includes("avaliacao cognitiva") || moduleName.includes("funcional")) return 5;
  if (moduleName.includes("psicofarmacologia")) return 5;
  if (moduleName.includes("humor") || moduleName.includes("ansiedade")) return 4;
  if (moduleName.includes("grandes sindromes") || moduleName.includes("sindromes geriatricas")) return 3;
  return 3;
}

function normalizeFlashcardImportance(card, deckImportance = 3) {
  if (Number.isFinite(card?.importance)) return clampImportance(card.importance, deckImportance);
  if (Number.isFinite(card?.priority)) return clampImportance(card.priority, deckImportance);
  if (Number.isFinite(card?.examFrequency?.USP)) return clampImportance(card.examFrequency.USP, deckImportance);
  return clampImportance(deckImportance, 3);
}

function flashcardImportanceForCard(card, deck = currentFlashcardDeck()) {
  return normalizeFlashcardImportance(card, getDeckImportance(deck));
}

function flashcardModuleOrder(deck) {
  const moduleName = normalizeFlashcardText(`${deck?.module || ""} ${deck?.title || ""}`);
  const ordered = [
    "delirium",
    "demencias",
    "avaliacao cognitiva",
    "psicofarmacologia",
    "bpsd",
    "sintomas neuropsiquiatricos",
    "humor",
    "ansiedade",
    "grandes sindromes",
    "sindromes geriatricas",
  ];
  const index = ordered.findIndex((item) => moduleName.includes(item));
  return index >= 0 ? index : 999;
}

function flashcardCardsForDeck(deck, { applyImportance = true } = {}) {
  const requestedImportance = selectedFlashcardImportance();
  const deckImportance = getDeckImportance(deck);
  return [...(deck?.cards || [])]
    .map((card) => ({ ...card, importance: normalizeFlashcardImportance(card, deckImportance) }))
    .filter((card) => !applyImportance || requestedImportance === null || card.importance === requestedImportance)
    .sort((a, b) => {
      const importanceDiff = b.importance - a.importance;
      if (importanceDiff) return importanceDiff;
      return String(a.id || "").localeCompare(String(b.id || ""), "pt-BR");
    });
}

function rememberFlashcardPosition(deck = currentFlashcardDeck()) {
  if (!deck?.id) return;
  const cards = flashcardCardsForDeck(deck);
  const card = cards[state.flashcardIndex];
  state.flashcardPositions[deck.id] = {
    index: Math.max(0, Math.min(state.flashcardIndex, Math.max(cards.length - 1, 0))),
    cardId: card?.id || null,
    updatedAt: Date.now(),
  };
}

function restoreFlashcardPosition(deck) {
  const cards = flashcardCardsForDeck(deck);
  const saved = state.flashcardPositions[deck?.id];
  if (!cards.length) {
    state.flashcardIndex = 0;
    return;
  }
  if (saved?.cardId) {
    const savedCardIndex = cards.findIndex((card) => card.id === saved.cardId);
    if (savedCardIndex >= 0) {
      state.flashcardIndex = savedCardIndex;
      return;
    }
  }
  state.flashcardIndex = Math.max(0, Math.min(Number(saved?.index || 0), cards.length - 1));
}

function resetCurrentFlashcardDeck() {
  const deck = currentFlashcardDeck();
  if (!deck?.id) return;
  state.flashcardIndex = 0;
  state.flashcardRevealed = false;
  delete state.flashcardPositions[deck.id];
  saveFlashcardState();
  renderFlashcards();
}

function currentFlashcard() {
  const deck = currentFlashcardDeck();
  const cards = flashcardCardsForDeck(deck);
  if (!cards.length) return null;
  const safeIndex = Math.max(0, Math.min(state.flashcardIndex, cards.length - 1));
  state.flashcardIndex = safeIndex;
  rememberFlashcardPosition(deck);
  return cards[safeIndex];
}

/* Cartões já estudados que venceram (os nunca estudados contam à parte, como novos). */
function flashcardDueCount(deck) {
  const today = Date.now();
  return flashcardCardsForDeck(deck).filter((card) => {
    const progress = state.flashcardProgress[card.id];
    if (!progress?.nextReviewAt) return false;
    return new Date(progress.nextReviewAt).getTime() <= today;
  }).length;
}

function flashcardNewCount(deck) {
  return flashcardCardsForDeck(deck).filter((card) => !state.flashcardProgress[card.id]?.nextReviewAt).length;
}

function flashcardNextReviewLabel(card) {
  const progress = state.flashcardProgress[card.id];
  if (!progress?.nextReviewAt) return "novo";
  const due = new Date(progress.nextReviewAt).getTime() <= Date.now();
  if (due) return "vencido";
  return `revisão em ${new Date(progress.nextReviewAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
}

function flashcardReviewItems({ dueOnly = false, scheduledOnly = false } = {}) {
  const now = Date.now();
  return (state.flashcards || [])
    .flatMap((deck) =>
      flashcardCardsForDeck(deck, { applyImportance: false }).map((card) => {
        const progress = state.flashcardProgress[card.id] || {};
        const nextReviewAt = progress.nextReviewAt ? new Date(progress.nextReviewAt).getTime() : null;
        return { deck, card, progress, nextReviewAt };
      }),
    )
    .filter((item) => {
      if (!item.progress.reviewedAt && !item.progress.nextReviewAt && !item.progress.lastGrade) return false;
      if (!item.nextReviewAt) return !scheduledOnly;
      if (dueOnly) return item.nextReviewAt <= now;
      if (scheduledOnly) return item.nextReviewAt > now;
      return true;
    })
    .sort((a, b) => {
      const dateDiff = (a.nextReviewAt || 0) - (b.nextReviewAt || 0);
      if (dateDiff) return dateDiff;
      return String(a.card.id || "").localeCompare(String(b.card.id || ""), "pt-BR");
    });
}

function flashcardGradeLabel(grade) {
  const labels = {
    again: "Errei",
    hard: "Difícil",
    good: "Bom",
    easy: "Fácil",
  };
  return labels[grade] || grade || "Sem marcação";
}

function openFlashcardReviewItem(item) {
  if (!item?.deck || !item?.card) return;
  state.flashcardCategory = item.deck.area || "all";
  state.flashcardPriority = "all";
  state.flashcardDeckId = item.deck.id;
  const cards = flashcardCardsForDeck(item.deck, { applyImportance: false });
  state.flashcardIndex = Math.max(0, cards.findIndex((card) => card.id === item.card.id));
  state.flashcardRevealed = false;
  rememberFlashcardPosition(item.deck);
  saveFlashcardState();
  setTab("flashcards");
  render();
}

function startDueFlashcardsReview() {
  const due = flashcardReviewItems({ dueOnly: true });
  if (!due.length) {
    state.todayNotice = "Nenhum flashcard vencido no momento. Você pode abrir o banco de flashcards para estudar cartões novos.";
    setTab("today");
    render();
    return;
  }
  openFlashcardReviewItem(due[0]);
}

function renderFlashcards() {
  if (!el.flashcardDeckList || !el.flashcardFront) return;
  if (state.flashcardPriority !== "all" && !/^importance-[1-5]$/.test(state.flashcardPriority)) {
    state.flashcardPriority = "all";
    saveFlashcardState();
  }
  if (el.flashcardCategorySelect) el.flashcardCategorySelect.value = state.flashcardCategory;
  el.flashcardPriorityGroup?.querySelectorAll("[data-flashcard-priority]").forEach((button) => {
    button.classList.toggle("active", button.dataset.flashcardPriority === state.flashcardPriority);
  });
  const decks = filteredFlashcardDecks();
  if (!decks.length) {
    el.flashcardDeckList.innerHTML = `<p class="panel-line">Nenhum deck cadastrado.</p>`;
    el.flashcardFront.textContent = "Nenhum flashcard encontrado para esse filtro.";
    el.flashcardMeta.textContent = "Ajuste categoria ou prioridade.";
    el.flashcardBack.hidden = true;
    el.flashcardGrade.hidden = true;
    if (el.flashcardStudyPanel) el.flashcardStudyPanel.hidden = state.activeTab !== "flashcards";
    return;
  }

  const deck = currentFlashcardDeck();
  if (deck && state.flashcardDeckId !== deck.id) {
    rememberFlashcardPosition();
    state.flashcardDeckId = deck.id;
    restoreFlashcardPosition(deck);
    state.flashcardRevealed = false;
    saveFlashcardState();
  }
  const card = currentFlashcard();
  if (el.flashcardStudyPanel) el.flashcardStudyPanel.hidden = state.activeTab !== "flashcards";
  el.flashcardDeckList.innerHTML = decks
    .map((item) => {
      const active = item.id === deck.id ? " active" : "";
      const dueCount = flashcardDueCount(item);
      const newCount = flashcardNewCount(item);
      const visibleCards = flashcardCardsForDeck(item);
      return `
        <button class="flashcard-deck-row${active}" data-flashcard-deck="${escapeHtml(item.id)}">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.area)} \u00b7 ${visibleCards.length} cart\u00f5es \u00b7 ${newCount} novos \u00b7 ${dueCount} para revisar</span>
          <em class="importance-badge">${escapeHtml(getImportanceLabel(getDeckImportance(item)))}</em>
        </button>
      `;
    })
    .join("");

  if (!card) return;
  const progress = state.flashcardProgress[card.id] || {};
	  el.flashcardMeta.innerHTML = `
	    <span>${escapeHtml(deck.title)}</span>
	    <span>${state.flashcardIndex + 1}/${flashcardCardsForDeck(deck).length}</span>
	    <span>${escapeHtml(flashcardNextReviewLabel(card))}</span>
	    <span title="${escapeHtml(getImportanceDescription(flashcardImportanceForCard(card, deck)))}">${escapeHtml(getImportanceLabel(flashcardImportanceForCard(card, deck)))}</span>
	  `;
  el.flashcardFront.textContent = card.front;
  el.flashcardBack.innerHTML = `
    <p>${escapeHtml(card.back)}</p>
    ${
      card.whyExamAsks || card.trap || card.memoryHook
        ? `<div class="flashcard-extras">
            ${card.whyExamAsks ? `<section><strong>Por que cai:</strong><span>${escapeHtml(card.whyExamAsks)}</span></section>` : ""}
            ${card.trap ? `<section><strong>Pegadinha:</strong><span>${escapeHtml(card.trap)}</span></section>` : ""}
            ${card.memoryHook ? `<section><strong>Gancho:</strong><span>${escapeHtml(card.memoryHook)}</span></section>` : ""}
          </div>`
        : ""
    }
    <div>${(card.tags || []).map((tag) => `<span class="mini-badge">${escapeHtml(tag)}</span>`).join("")}</div>
    ${progress.lastGrade ? `<small>Última marcação: ${escapeHtml(progress.lastGrade)}</small>` : ""}
  `;
  el.flashcardBack.hidden = !state.flashcardRevealed;
  el.flashcardGrade.hidden = !state.flashcardRevealed;
  el.showFlashcardAnswer.textContent = state.flashcardRevealed ? "Resposta exibida" : "Mostrar resposta";
  el.showFlashcardAnswer.disabled = state.flashcardRevealed;
  if (state.activeTab === "flashcards") {
    el.source.textContent = "Flashcards";
    el.title.textContent = deck.title;
  }
}

function getImportanceLabel(importance) {
  const labels = {
    1: "1 · Raro",
    2: "2 · Ocasional",
    3: "3 · Frequente",
    4: "4 · Muito frequente",
    5: "5 · Cai quase toda prova",
  };
  return labels[clampImportance(importance)] || labels[3];
}

function getImportanceDescription(importance) {
  const descriptions = {
    1: "Tema raro, útil para diferenciação em questões difíceis.",
    2: "Tema ocasional, revisar após dominar os essenciais.",
    3: "Tema frequente, importante para consolidar o raciocínio clínico.",
    4: "Tema muito frequente, alto rendimento para prova.",
    5: "Tema de altíssima incidência, revisar repetidamente.",
  };
  return descriptions[clampImportance(importance)] || descriptions[3];
}

function priorityLabel(priority) {
  if (String(priority).startsWith("importance-")) {
    return getImportanceLabel(Number(String(priority).replace("importance-", "")));
  }
  return priority;
}

function moveFlashcard(delta) {
  const deck = currentFlashcardDeck();
  const cards = flashcardCardsForDeck(deck);
  if (!cards.length) return;
  state.flashcardIndex = (state.flashcardIndex + delta + cards.length) % cards.length;
  state.flashcardRevealed = false;
  rememberFlashcardPosition(deck);
  saveFlashcardState();
  renderFlashcards();
}

/* Agenda a próxima revisão de um flashcard (usado na aba Flashcards e no "Revisar o conceito"). */
function scheduleFlashcardGrade(cardId, grade) {
  const previous = state.flashcardProgress[cardId] || {};
  const streak = grade === "again" ? 0 : Number(previous.streak || 0) + 1;
  const daysByGrade = { again: 1, hard: 3, good: streak >= 3 ? 14 : 7, easy: streak >= 3 ? 30 : 14 };
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + daysByGrade[grade]);
  state.flashcardProgress[cardId] = {
    ...previous,
    streak,
    lastGrade: grade,
    reviewedAt: new Date().toISOString(),
    nextReviewAt: nextReview.toISOString(),
  };
  saveFlashcardState();
  if (typeof recordStudyLogFlashcard === "function") recordStudyLogFlashcard();
  scheduleCloudSettingsSync();
}

function gradeFlashcard(grade) {
  const card = currentFlashcard();
  if (!card) return;
  scheduleFlashcardGrade(card.id, grade);
  state.flashcardRevealed = false;
  saveFlashcardState();
  moveFlashcard(1);
}

function heavyAnalyticsVisible() {
  return ["overview", "history", "activity", "exams", "notes", "flashcards", "topics"].includes(state.activeTab);
}

function renderDashboard() {
  /* Evita recomputações analíticas pesadas durante fluxos ativos de questões. */
  if (hasActiveQuestionFlow() && !state.tabViewOpen) return;
  if (!heavyAnalyticsVisible()) return;
  renderPendingSummary();
  /* Lista de temas e montagem do bloco são as partes mais pesadas: só com a aba aberta (ao
     trocar de aba, o render redesenha a nova). */
  if (state.activeTab === "activity") {
    renderTopicChecklist();
    renderActivity();
  }
  renderExamStudyFilters();
  if (state.activeTab === "history") renderHistory();
  renderDangerousQuestions();
  renderSavedNotesPanel();
  renderExams();
  renderFlashcards();
}

function noteQuestionById(questionId) {
  return allStudyQuestions().find((question) => question.id === questionId) || null;
}

function localSavedNotes() {
  return Object.entries(state.progress)
    .filter(([, progress]) => progress?.note?.trim())
    .map(([questionId, progress]) => ({
      question_id: questionId,
      content: progress.note.trim(),
      updated_at: progress.updatedAt ? new Date(progress.updatedAt).toISOString() : null,
    }));
}

async function loadSavedNotesPanel() {
  if (state.savedNotesLoading) return;
  state.savedNotesLoading = true;
  if (!state.supabase || !state.authUser) {
    state.savedNotesList = localSavedNotes();
    state.savedNotesLoaded = true;
    state.savedNotesLoading = false;
    renderSavedNotesPanel();
    return;
  }
  if (el.notesPanelStatus) el.notesPanelStatus.textContent = "Carregando suas anotações privadas...";
  const { data, error } = await state.supabase
    .from("private_question_notes")
    .select("question_id, content, updated_at")
    .eq("user_id", state.authUser.id)
    .neq("content", "")
    .order("updated_at", { ascending: false });
  if (error) {
    state.savedNotesLoading = false;
    if (el.notesPanelStatus) el.notesPanelStatus.textContent = `Não foi possível carregar anotações: ${error.message}`;
    return;
  }
  state.savedNotesList = data || [];
  state.savedNotesLoaded = true;
  state.savedNotesLoading = false;
  renderSavedNotesPanel();
}

function renderSavedNotesPanel() {
  if (!el.savedNotesList || !el.notesPanelStatus) return;
  if (state.activeTab === "notes" && !state.savedNotesLoaded) {
    loadSavedNotesPanel();
  }
  const notes = state.authUser ? state.savedNotesList : localSavedNotes();
  if (!state.authUser) {
    el.notesPanelStatus.textContent = notes.length
      ? "Mostrando anotações salvas neste navegador. Entre na conta para sincronizar."
      : "Entre na conta para ver suas anotações privadas sincronizadas.";
  } else if (state.savedNotesLoaded) {
    el.notesPanelStatus.textContent = notes.length
      ? `${pluralize(notes.length, "anotação privada salva", "anotações privadas salvas")}.`
      : "Você ainda não salvou anotações privadas.";
  }
  el.savedNotesList.innerHTML = notes.length
    ? notes
        .map((note) => {
          const question = noteQuestionById(note.question_id);
          const title = question
            ? `${question.examTag || question.source || topicForQuestion(question)} · Questão ${question.number || ""}`
            : note.question_id;
          const preview = note.content.length > 220 ? `${note.content.slice(0, 220)}...` : note.content;
          return `
            <article class="saved-note-item">
              <strong>${escapeHtml(title)}</strong>
              <div class="saved-note-preview markdown-content">${renderSafeMarkdown(preview)}</div>
              <div class="saved-note-actions">
                <span>${escapeHtml(note.updated_at ? formatCommentDate(note.updated_at) : "")}</span>
                <button data-open-note-question="${escapeHtml(note.question_id)}">Abrir questão</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="comment-empty">Nenhuma anotação salva ainda.</p>`;
}

function openQuestionFromNote(questionId) {
  const question = noteQuestionById(questionId);
  if (!question) return;
  state.topicActive = false;
  state.sessionActive = false;
  state.smartTrainingActive = false;
  state.spacedReviewActive = false;
  state.examActive = false;
  state.examSetActive = false;
  clearExamSimulationState();
  state.filtered = [question];
  state.index = 0;
  setTab("notes");
  render();
}


/* Subtemas de um tema para a lista: os pequenos (menos de MIN_TOPIC_SUBTHEME questões no tema)
   e os sem subtema viram um grupo só, "Outros" (chave OTHER_SUBTHEMES). */
const MIN_TOPIC_SUBTHEME = 10;
const OTHER_SUBTHEMES = "__outros__";

function topicSubthemeGroups(topic, questions = topicQuestions(topic)) {
  const byLabel = new Map();
  for (const question of questions) {
    const label = questionSubtheme(question);
    if (!byLabel.has(label)) byLabel.set(label, []);
    byLabel.get(label).push(question);
  }
  const groups = [];
  const others = [];
  for (const [label, items] of byLabel) {
    if (items.length >= MIN_TOPIC_SUBTHEME && label !== "Subtema a revisar") groups.push({ key: label, label, questions: items });
    else others.push(...items);
  }
  groups.sort((a, b) => b.questions.length - a.questions.length);
  if (others.length) groups.push({ key: OTHER_SUBTHEMES, label: "Outros", questions: others });
  return groups;
}

/* A questão pertence ao subtema escolhido (ou ao grupo "Outros") dentro do tema? */
function questionInTopicSubtheme(question, topic, key) {
  if (!key) return true;
  if (key !== OTHER_SUBTHEMES) return questionSubtheme(question) === key;
  const cache = questionInTopicSubtheme.others;
  if (!cache || cache.topic !== topic || cache.source !== state.topicSource) {
    const group = topicSubthemeGroups(topic).find((item) => item.key === OTHER_SUBTHEMES);
    questionInTopicSubtheme.others = { topic, source: state.topicSource, ids: new Set((group?.questions || []).map((item) => item.id)) };
  }
  return questionInTopicSubtheme.others.ids.has(question.id);
}

function progressStats(questions) {
  let answered = 0;
  let correct = 0;
  for (const question of questions) {
    const grade = getProgress(question.id).grade;
    if (grade) answered += 1;
    if (grade === "correct") correct += 1;
  }
  return {
    total: questions.length,
    answered,
    accuracy: answered ? correct / answered : 0,
    percent: questions.length ? Math.round((answered / questions.length) * 100) : 0,
  };
}

/* "Continuar" (só pendentes) e "Ver todas" de um tema ou de um subtema (tratados em topicProgress.js). */
function topicRunButtons({ topic, subtheme = "", remaining }) {
  const attrs = `data-run-topic="${escapeHtml(topic)}" data-run-subtheme="${escapeHtml(subtheme)}"`;
  return `
    <div class="topic-row-actions">
      <button type="button" class="outline-btn topic-row-continue" ${attrs} data-run-mode="pending" ${remaining > 0 ? "" : "disabled"} title="${remaining > 0 ? `${remaining} pendentes` : "Tudo feito"}">${remaining > 0 ? "Continuar" : "Concluído"}</button>
      <button type="button" class="link-btn topic-row-all" ${attrs} data-run-mode="all">Ver todas</button>
    </div>`;
}

/* Lista única de temas: marcar para o bloco, ver progresso e acerto, ou "Continuar" as pendentes. */
function renderTopicChecklist() {
  if (!el.topicChecklist || !state.questions.length) return;
  const selectedTopics = Array.isArray(state.selectedTopics) ? state.selectedTopics : [];
  const topicQuery = normalize(el.topicPanelSearch.value);
  const topics = allTopics().filter((topic) => !topicQuery || normalize(topic).includes(topicQuery));
  state.openTopicSubthemes ||= new Set();
  el.topicChecklist.innerHTML = topics
    .map((topic) => {
      const questions = topicQuestions(topic);
      const perf = progressStats(questions);
      const checked = selectedTopics.includes(topic) ? "checked" : "";
      const subthemes = topicSubthemeGroups(topic, questions);
      const subthemeRows = subthemes
        .map((group) => {
          const stats = progressStats(group.questions);
          return `
            <div class="subtheme-row">
              <div class="subtheme-row-text">
                <span>${escapeHtml(group.label)}</span>
                <small>${stats.answered}/${stats.total} feitas${stats.answered ? ` · ${Math.round(stats.accuracy * 100)}%` : ""}</small>
              </div>
              ${topicRunButtons({ topic, subtheme: group.key, remaining: stats.total - stats.answered })}
            </div>`;
        })
        .join("");
      const open = state.openTopicSubthemes.has(topic) ? "open" : "";
      return `
        <div class="topic-row ${checked ? "selected" : ""}">
          <label class="topic-row-main">
            <input type="checkbox" value="${escapeHtml(topic)}" ${checked} />
            <span class="topic-row-name">${escapeHtml(topic)}</span>
            <span class="topic-row-meta">${perf.answered}/${perf.total} feitas · ${perf.answered ? `${Math.round(perf.accuracy * 100)}% de acerto` : "sem respostas"}</span>
            <span class="topic-row-track" aria-hidden="true"><i style="width:${perf.percent}%"></i></span>
          </label>
          ${topicRunButtons({ topic, remaining: perf.total - perf.answered })}
          ${subthemes.length > 1 ? `
          <details class="topic-subthemes" data-topic-subthemes="${escapeHtml(topic)}" ${open}>
            <summary>Subtemas (${subthemes.length})</summary>
            <div class="subtheme-rows">${subthemeRows}</div>
          </details>` : ""}
        </div>
      `;
    })
    .join("");
  if (!topics.length) {
    el.topicChecklist.innerHTML = `<p class="panel-line">Nenhum tema encontrado.</p>`;
  }
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
  if (el.examFilteredCount) el.examFilteredCount.textContent = exams.length;
  if (el.examFilteredQuestionCount) el.examFilteredQuestionCount.textContent = questions;
  el.examSetLine.textContent = state.examSetActive
    ? `Provas ativas: ${pluralize(exams.length, "prova", "provas")}, ${pluralize(state.filtered.length, "questão", "questões")} na lista atual.`
    : `${pluralize(exams.length, "prova encontrada", "provas encontradas")}, ${pluralize(questions, "questão", "questões")} no total.`;
  renderExamProgressCard();
}

/* Soma questões de provas e questões por tema (didáticas), sem contar o mesmo id duas vezes. */
function renderExamProgressCard() {
  if (!el.examLastTitle || !el.examProgressAccuracy || !el.examProgressAnswered) return;
  const seen = new Set();
  const answered = [];
  const collect = (question, label, kind) => {
    if (!question || seen.has(question.id)) return;
    seen.add(question.id);
    const progress = getProgress(question.id);
    if (progress.grade) answered.push({ label, kind, progress });
  };
  for (const exam of state.exams) for (const question of exam.questions || []) collect(question, exam.title, "exam");
  for (const question of state.questions) collect(question, `Tema: ${topicForQuestion(question)}`, "topic");
  answered.sort((a, b) => (b.progress.updatedAt || 0) - (a.progress.updatedAt || 0));
  const correct = answered.filter((item) => item.progress.grade === "correct").length;
  const fromExams = answered.filter((item) => item.kind === "exam").length;
  const last = answered[0];
  el.examLastTitle.textContent = last ? last.label : "Ainda não iniciada";
  el.examProgressAccuracy.textContent = answered.length ? `${Math.round((correct / answered.length) * 100)}%` : "0%";
  el.examProgressAnswered.textContent = answered.length;
  if (el.examProgressSplit) {
    el.examProgressSplit.textContent = `${fromExams} de provas · ${answered.length - fromExams} por tema`;
  }
}

function sessionPoolByMode(pool) {
  if (state.sessionPoolMode === "all") return pool;
  if (state.sessionPoolMode === "wrong") return pool.filter((question) => getProgress(question.id).grade === "wrong");
  return pool.filter((question) => !getProgress(question.id).grade);
}

function renderActivity() {
  el.sessionSizeGroup.querySelectorAll("[data-size]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.size) === state.sessionSize);
  });
  el.sessionPoolGroup?.querySelectorAll("[data-pool]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pool === state.sessionPoolMode);
  });
  el.topicSourceGroup?.querySelectorAll("[data-topic-source]").forEach((button) => {
    button.classList.toggle("active", button.dataset.topicSource === state.topicSource);
  });
  el.includeReviews.checked = state.includeReviewsInSession;
  const topics = topicsForStats();
  const pool = sessionPoolQuestions();
  const available = sessionPoolByMode(pool).length;
  const dueReviewCount = sessionReviewPool().length;
  const poolLabel = { new: "não feitas", all: "no total", wrong: "erradas" }[state.sessionPoolMode] || "";
  if (el.topicModeLine) {
    el.topicModeLine.textContent = topics.length
      ? `${pluralize(topics.length, "tema marcado", "temas marcados")} · ${pluralize(available, "questão", "questões")} ${poolLabel}${state.includeReviewsInSession && dueReviewCount ? ` · ${pluralize(dueReviewCount, "revisão vencida", "revisões vencidas")}` : ""}.`
      : "Marque pelo menos um tema na lista acima.";
  }
  const studyActive = state.sessionActive || state.smartTrainingActive;
  const answeredInSession = studyActive ? currentRunAnsweredQuestions().length : 0;
  el.finishSession.hidden = !studyActive;
  el.endSession.hidden = !studyActive && !state.topicActive;
  el.startSession.disabled = !topics.length;
  el.sessionLine.textContent = state.sessionCompletionMessage && !studyActive
    ? state.sessionCompletionMessage
    : state.smartTrainingActive
    ? `Treino inteligente ativo: ${answeredInSession}/${state.filtered.length} questões respondidas.`
    : state.sessionActive
      ? `Bloco ativo: ${answeredInSession}/${state.filtered.length} questões respondidas.`
      : "";
  renderSessionSummary();
  el.restoreExcluded.hidden = !state.excluded.length;
}

/* Botões de finalizar/sair, cronômetro e resumos dos blocos ativos. Ficam fora do
   renderDashboard porque ele pula tudo durante um bloco (otimização), o que deixava
   "Finalizar prova", "Finalizar bloco", "Sair do tema" e "Sair das perigosas" escondidos. */
function renderFlowControls() {
  const studyActive = state.sessionActive || state.smartTrainingActive;
  el.finishSession.hidden = !studyActive;
  el.endSession.hidden = !studyActive && !state.topicActive;
  if (el.endTopic) el.endTopic.hidden = !state.topicActive;
  if (el.endDangerousReview) el.endDangerousReview.hidden = !state.dangerousReviewActive;
  if (studyActive) {
    const answeredInSession = currentRunAnsweredQuestions().length;
    el.sessionLine.textContent = state.smartTrainingActive
      ? `Treino inteligente ativo: ${answeredInSession}/${state.filtered.length} questões respondidas.`
      : `Bloco ativo: ${answeredInSession}/${state.filtered.length} questões respondidas.`;
    renderSessionSummary();
  }
  renderExams();
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

function renderDangerousQuestions() {
  if (!el.dangerousCount) return;
  const dangerous = dangerousQuestions();
  el.dangerousCount.textContent = dangerous.length;
  el.startDangerousReview.disabled = !dangerous.length;
  if (el.endDangerousReview) el.endDangerousReview.hidden = !state.dangerousReviewActive;
  if (state.dangerousReviewActive) {
    el.dangerousLine.innerHTML = `<strong>Fila ativa:</strong> ${pluralize(state.filtered.length, "questão perigosa", "questões perigosas")} para revisar.`;
  } else if (dangerous.length) {
    el.dangerousLine.innerHTML = `<strong>Prioridade especial:</strong> revise primeiro questões com erro repetido, tempo excessivo ou troca da resposta certa para errada.`;
  } else {
    el.dangerousLine.textContent = "Nenhuma questão perigosa no momento. Quando houver erro repetido ou padrão de risco, ela aparecerá aqui.";
  }
  el.dangerousList.innerHTML = dangerous.length
    ? dangerous
        .slice(0, 6)
        .map((question) => {
          const reasons = dangerousReasonsFor(question).join(", ");
          return `
            <button class="notebook-row" data-dangerous-question="${escapeHtml(question.id)}">
              <strong>${escapeHtml(topicForQuestion(question))}</strong>
              <span>${escapeHtml(question.source || "Psiquiatria em Questão")} · Questão ${escapeHtml(String(question.number || ""))}</span>
              <small>${escapeHtml(reasons)}</small>
            </button>
          `;
        })
        .join("")
    : `<p class="panel-line">A fila especial está vazia.</p>`;
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
    knowledge: "Não lembrava",
    concept: "Confundi conceito",
    reading: "Li rápido",
    "two-options": "Fiquei entre duas",
    attention: "Desatenção",
    guess: "Chutei",
  };
  return labels[value] || value;
}

function successTypeLabel(value) {
  const labels = {
    mastered: "Fácil",
    reasoning: "Sabia",
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

function selectedContentQuestions() {
  const topics = new Set(topicsForStats());
  return topicStudyPool().filter(
    (question) =>
      topics.has(topicForQuestion(question)) &&
      !isExcluded(question.id) &&
      isReadyQuestion(effectiveQuestion(question)),
  );
}

/* Questões dos temas marcados, na origem escolhida (didáticas, provas ou ambas). */
function sessionPoolQuestions() {
  return selectedContentQuestions();
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
  const answeredInExamSet = state.examSetActive ? currentRunAnsweredQuestions().length : 0;
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
    : state.examSetActive
    ? `Conjunto ativo: ${answeredInExamSet}/${state.filtered.length} questões respondidas.`
    : state.examActive
    ? `Estudo ativo: ${answeredInExam}/${state.filtered.length} questões respondidas.`
    : exam
      ? `${exam.institution} ${exam.year} · ${exam.area} · ${pluralize(exam.questionCount, "questão", "questões")}.`
      : "Selecione uma prova para estudar ou simular.";
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

/* Figura da questão (ex.: diagramas da prova), exibida logo abaixo do enunciado. */
function renderQuestionImage(question) {
  let figure = document.querySelector("#questionImage");
  if (!question?.image) {
    if (figure) figure.hidden = true;
    return;
  }
  if (!figure) {
    figure = document.createElement("img");
    figure.id = "questionImage";
    figure.className = "question-image";
    figure.alt = "Figura da questão";
    el.text.insertAdjacentElement("afterend", figure);
  }
  if (figure.getAttribute("src") !== question.image) figure.src = question.image;
  figure.hidden = false;
}

function render() {
  syncTabViewWithFlow();
  closeSidebarWhenMobileFlowStarts();
  renderAdminAccess();
  renderDashboard();
  renderFlowControls();
  const flashcardMode = state.activeTab === "flashcards";
  /* A barra lateral só navega; o conteúdo de cada aba aparece aqui na área principal.
     Com um bloco em andamento a questão fica na tela, a menos que a pessoa abra outra aba
     pela navegação (tabViewOpen); aí a faixa "Voltar à questão" leva de volta. */
  const questionMode = hasActiveQuestionFlow() || state.filtered.length > 0;
  const mainIdle = !flashcardMode && (!questionMode || state.tabViewOpen);
  const showStartPanel = mainIdle && state.activeTab === "overview";
  const showPerformancePanel = mainIdle && state.activeTab === "history" && typeof renderPerformancePanel === "function";
  const showTabView = flashcardMode || (mainIdle && state.activeTab !== "overview");
  if (el.startPanel) el.startPanel.hidden = !showStartPanel;
  /* "Outras revisões" é uma subtela de Hoje: ao sair de Hoje, a volta é sempre para a tela principal. */
  if (!showStartPanel) state.todayView = null;
  const performancePanel = document.querySelector("#performancePanel");
  if (performancePanel) performancePanel.hidden = !showPerformancePanel;
  if (el.tabView) el.tabView.hidden = !showTabView;
  if (el.tabViewBack) el.tabViewBack.hidden = !(questionMode && state.tabViewOpen && (mainIdle || flashcardMode));
  if (el.flashcardStudyPanel) el.flashcardStudyPanel.hidden = !flashcardMode;
  document.body.classList.toggle("no-question-active", mainIdle);
  document.body.classList.toggle("tab-view-active", showTabView && !flashcardMode);
  document.body.classList.toggle("flashcard-active", flashcardMode);
  if (typeof renderRunProgress === "function") renderRunProgress();
  if (showPerformancePanel) renderPerformancePanel();
  else if (showStartPanel && typeof renderTodayPanel === "function") renderTodayPanel();
  if (flashcardMode) {
    renderFlashcards();
    renderQuestionDiscussion(null);
    return;
  }
  renderQuestionMap();
  const baseQuestion = currentQuestion();
  const question = effectiveQuestion(baseQuestion);

  if (!question) {
    if (flashcardMode) {
      el.tags.innerHTML = "";
      el.tags.classList.remove("visible");
      el.text.textContent = "";
      renderQuestionImage(null);
      el.options.innerHTML = "";
      el.answer.textContent = "";
      el.answer.classList.remove("visible");
      renderExplanation(null, false);
      el.pendingReviewPanel.hidden = true;
      el.position.textContent = "0 / 0";
      el.manualGradePanel.hidden = true;
      el.successTypePanel.hidden = true;
      el.errorTypePanel.hidden = true;
      if (typeof renderConceptPanel === "function") renderConceptPanel(null);
      el.note.value = "";
      renderQuestionDiscussion(null);
      return;
    }
    if (!mainIdle) {
      el.source.textContent = "Nenhuma questão encontrada";
      el.title.textContent = "Ajuste os filtros";
    } else if (!showStartPanel && !showPerformancePanel) {
      el.source.textContent = "Psiquiatria em Questão";
      el.title.textContent = document.querySelector(`.tab[data-tab="${state.activeTab}"]`)?.textContent.trim() || "Banco de questões";
    }
    el.tags.innerHTML = "";
    el.tags.classList.remove("visible");
    el.text.textContent = "";
    renderQuestionImage(null);
    el.options.innerHTML = "";
    el.answer.textContent = "";
    el.answer.classList.remove("visible");
    renderExplanation(null, false);
    el.pendingReviewPanel.hidden = true;
    el.position.textContent = "0 / 0";
    el.manualGradePanel.hidden = false;
    el.successTypePanel.hidden = true;
    el.errorTypePanel.hidden = true;
    if (typeof renderConceptPanel === "function") renderConceptPanel(null);
    el.note.value = "";
    renderQuestionDiscussion(null);
    return;
  }

  const storedProgress = getProgress(question.id);
  const progress = displayProgressFor(question.id);
  ensureQuestionTimer(question.id);
  const examLocked = state.examSimulationActive && !state.examSimulationFinished;
  const selectedLetter = state.examSimulationActive ? state.examSimulationAnswers[question.id] || storedProgress.selected : progress.selected;
  state.selected = selectedLetter || null;
  /* Com um bloco em andamento e outra aba aberta por cima (Hoje, Desempenho...), a questão
     continua sendo montada por baixo, mas o cabeçalho é da aba que está na tela. */
  const headerTarget = mainIdle ? { textContent: "" } : el.source;
  const titleTarget = mainIdle ? { textContent: "" } : el.title;
  if (mainIdle && !showStartPanel && !showPerformancePanel) {
    el.source.textContent = "Psiquiatria em Questão";
    el.title.textContent = document.querySelector(`.tab[data-tab="${state.activeTab}"]`)?.textContent.trim() || "Banco de questões";
  }
  headerTarget.textContent = state.examSimulationActive
    ? state.examSimulationFinished
      ? "Resultado da prova"
      : "Simulado em andamento"
    : state.examActive
    ? currentExam()?.title || "Prova"
    : state.examSetActive
      ? "Provas filtradas"
    : state.smartTrainingActive
      ? "Treino inteligente"
      : state.dangerousReviewActive
        ? "Questões perigosas"
    : state.sessionActive
      ? (typeof studyRunLabel === "function" && studyRunLabel()) || "Bloco de questões"
      : state.topicActive
        ? state.topicIds.length === 1
          ? `Tema: ${state.topicIds[0]}`
          : "Temas selecionados"
        : state.spacedReviewActive && state.reviewFallbackNotice
          ? state.reviewFallbackNotice
          : "Psiquiatria em Questão";
  titleTarget.textContent = state.sessionActive || state.smartTrainingActive || state.examActive || state.examSimulationActive || state.examSetActive || state.topicActive || state.dangerousReviewActive ? `Questão ${state.index + 1}` : `Questão ${question.number}`;
  el.position.textContent = `${state.index + 1} / ${state.filtered.length}`;
  const examTag = question.examTag || (question.examId ? question.source : "");
  const trainingReasons = state.smartTrainingActive ? questionTrainingReasons(question) : [];
  const dangerousTag = isDangerousQuestion(question) ? `Atenção Questão perigosa: ${dangerousReasonsFor(question).join(", ")}` : "";
  const runTag = typeof studyRunTagFor === "function" ? studyRunTagFor(question) : "";
  const tags = [runTag, examTag, dangerousTag, ...trainingReasons].filter(Boolean);
  el.tags.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  el.tags.classList.toggle("visible", Boolean(tags.length));
  renderQuestionText(question);
  renderQuestionImage(question);
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
  renderExplanation(question, Boolean(showAnswer));
  const needsReview = needsBankReview(question);
  el.pendingReviewPanel.hidden = !state.isAdmin || !needsReview || examLocked;
  if (state.isAdmin && needsReview) {
    const issues = readinessIssues(question);
    el.pendingReviewReason.textContent = issues.length
      ? `Pendências: ${issues.join(", ")}.`
      : "Confira gabarito, alternativas ou enunciado.";
  }
  el.manualGradePanel.hidden = examLocked;
  el.successTypePanel.hidden = examLocked || progress.grade !== "correct";
  el.errorTypePanel.hidden = examLocked || progress.grade !== "wrong";
  if (typeof renderConceptPanel === "function") renderConceptPanel(question, progress, examLocked);
  el.confirmAnswer.disabled = !question.correctAnswer || !selectedLetter || Boolean(progress.grade) || examLocked;
  el.confirmAnswer.textContent = progress.grade ? "Resposta confirmada" : "Confirmar resposta";
  el.answerBtn.disabled = !question.correctAnswer;
  el.answerBtn.textContent = progress.revealed ? "Gabarito exibido" : "Mostrar gabarito";
  el.favorite.classList.toggle("active", Boolean(storedProgress.favorite));
  el.favorite.setAttribute("aria-pressed", String(Boolean(storedProgress.favorite)));
  el.review.classList.toggle("active", Boolean(storedProgress.review));
  el.review.setAttribute("aria-pressed", String(Boolean(storedProgress.review)));
  el.correct.classList.toggle("active", progress.grade === "correct");
  el.wrong.classList.toggle("active", progress.grade === "wrong");
  el.successTypeGroup.querySelectorAll("[data-success-type]").forEach((button) => {
    button.classList.toggle("active", progress.successType === button.dataset.successType);
  });
  el.errorTypeGroup.querySelectorAll("[data-error-type]").forEach((button) => {
    button.classList.toggle("active", progress.errorType === button.dataset.errorType);
  });
  renderQuestionDiscussion(question, progress);
  el.editor.hidden = !state.isAdmin || !state.editing;
  if (state.editing) fillEditor(question);
}

function move(delta) {
  if (!state.filtered.length) return;
  state.index = (state.index + delta + state.filtered.length) % state.filtered.length;
  rememberCurrentPosition();
  saveActiveStudyState();
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

function setTab(tabName, options = {}) {
  if (tabName === "topics" && !state.isAdmin) tabName = "overview";
  /* A antiga aba Revisão foi incorporada à tela Hoje. */
  if (tabName === "today") tabName = "overview";
  const previousTab = state.activeTab;
  state.activeTab = tabName;
  const browsing = options.fromNav && (hasActiveQuestionFlow() || state.filtered.length > 0);
  if (browsing && !state.tabViewOpen) {
    state.tabViewReturnTab = previousTab;
    state.tabViewOpen = true;
  }
  if (typeof renderBottomNav === "function") renderBottomNav();
  el.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  Object.entries(el.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
  if (tabName === "notes") renderSavedNotesPanel();
  if (tabName === "flashcards" || document.body.classList.contains("flashcard-active")) render();
  else if (browsing || (previousTab !== tabName && (!hasActiveQuestionFlow() || state.tabViewOpen))) render();
  if (options.fromNav) document.querySelector(".app")?.scrollTo?.(0, 0);
  if (options.fromNav) window.scrollTo(0, 0);
}

/* Fecha a tela de abas e volta para a questão do bloco em andamento. */
function returnToQuestion() {
  state.tabViewOpen = false;
  const back = state.tabViewReturnTab;
  state.tabViewReturnTab = null;
  const target = back && back !== "flashcards" ? back : state.activeTab === "flashcards" ? "activity" : state.activeTab;
  if (target !== state.activeTab) setTab(target);
  render();
  window.scrollTo(0, 0);
}

/* Chave que identifica o bloco de questões em andamento ("" sem bloco). */
function currentFlowKey() {
  return state.filtered.length
    ? [
        state.topicActive, state.sessionActive, state.smartTrainingActive, state.spacedReviewActive,
        state.dangerousReviewActive, state.examActive, state.examSetActive, state.examSimulationActive,
        state.activeExamId || "", state.filterKey || "", state.filtered[0]?.id || "",
      ].join("|")
    : "";
}

/* Quando um bloco começa (ou troca), a questão volta a ocupar a área principal. */
let lastTabViewFlowKey = "";
function syncTabViewWithFlow() {
  const key = currentFlowKey();
  if (key !== lastTabViewFlowKey) {
    state.tabViewOpen = false;
    state.tabViewReturnTab = null;
  }
  lastTabViewFlowKey = key;
}

function isMobileLayout() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
}

function setSidebarCollapsed(collapsed) {
  state.sidebarCollapsed = collapsed;
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  /* No celular a gaveta é temporária: não sobrescreve a preferência das telas largas. */
  if (!isMobileLayout()) localStorage.setItem("banco-rmais-sidebar-collapsed", String(collapsed));
  if (el.sidebarToggle) el.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  if (typeof renderBottomNav === "function") renderBottomNav();
}

/* No celular, filtros e provas ficam na gaveta lateral; quando um bloco de questões
   começa, a gaveta fecha para não cobrir a questão. */
let lastMobileFlowKey = "";
function closeSidebarWhenMobileFlowStarts() {
  const key = hasActiveQuestionFlow() ? currentFlowKey() : "";
  if (key && key !== lastMobileFlowKey && isMobileLayout() && !state.sidebarCollapsed) setSidebarCollapsed(true);
  lastMobileFlowKey = key;
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("theme-dark", state.theme === "dark");
  localStorage.setItem("banco-rmais-theme", state.theme);
  if (el.themeToggle) {
    el.themeToggle.textContent = state.theme === "dark" ? "Modo claro" : "Modo escuro";
    el.themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
  }
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.topicActive = true;
  state.topicIds = topics;
  state.index = 0;
  setTab("topics");
  applyFilters({ preserveCurrent: true });
}

/* Ao encerrar um bloco, apaga a cópia de recuperação (sessionPersistence.js); sem isso, nos primeiros
   segundos após abrir o site o bloco encerrado podia ser reaberto sozinho. */
function clearRecoverySnapshot() {
  if (typeof clearStudySnapshot === "function") clearStudySnapshot();
}

function endTopic() {
  clearRecoverySnapshot();
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.examSetActive = true;
  state.examSetIds = exams.map((exam) => exam.id);
  state.filtered = exams
    .flatMap((exam) => exam.questions)
    .filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  const restored = restoreActiveAnswersForRun("exam-set", state.examSetIds, state.filtered);
  state.activeAnswers = restored.activeAnswers;
  state.index = restored.index;
  setTab("exams");
  saveActiveStudyState();
  render();
}

function endExamSet() {
  state.examCompletionMessage = "";
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  clearActiveStudyState();
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("exams");
}

function startSpacedReview() {
  const session = getTodayReviewSession();
  const questions = session.filter((item) => item.kind === "question").map((item) => item.question);
  const flashcards = session.filter((item) => item.kind === "flashcard");
  if (state.reviewMode === "flashcards" && flashcards.length) {
    const first = flashcards[0];
    state.flashcardCategory = first.deck.area || "Psicogeriatria";
    state.flashcardDeckId = first.deck.id;
    restoreFlashcardPosition(first.deck);
    state.flashcardRevealed = false;
    saveFlashcardState();
    setTab("flashcards");
    render();
    return;
  }
  if (!questions.length) {
    state.todayNotice = "Não há questões para essa revisão agora. Tente outra opção em \"Outras revisões\".";
    setTab("today");
    render();
    return;
  }
  state.todayNotice = "";
  state.sessionActive = false;
  state.activeAnswers = {};
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.smartTrainingActive = false;
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.spacedReviewActive = true;
  state.spacedReviewIds = questions.map((question) => question.id);
  state.reviewFallbackNotice = REVIEW_FALLBACK_NOTICES[session.fallbackFrom] || "";
  state.index = 0;
  setTab("today");
  applyFilters({ preserveCurrent: true });
}

function startPresetReview({ mode, minutes }) {
  if (mode) state.reviewMode = mode;
  if (minutes) state.reviewAvailableMinutes = minutes;
  saveReviewPreferences();
  startSpacedReview();
}

function startDangerousReview() {
  const dangerous = dangerousQuestions();
  if (!dangerous.length) {
    if (el.dangerousLine) el.dangerousLine.textContent = "Nenhuma questão perigosa no momento.";
    setTab("overview");
    return;
  }
  state.sessionCompletionMessage = "";
  state.activeAnswers = {};
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.sessionActive = false;
  state.smartTrainingActive = false;
  state.spacedReviewActive = false;
  state.spacedReviewIds = [];
  state.dangerousReviewActive = true;
  state.dangerousReviewIds = dangerous.map((question) => question.id);
  state.index = 0;
  setTab("overview");
  applyFilters({ preserveCurrent: true });
}

function endDangerousReview() {
  clearRecoverySnapshot();
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("overview");
}

function openDangerousQuestion(questionId) {
  const question = allStudyQuestions().find((item) => item.id === questionId);
  if (!question) return;
  state.topicActive = false;
  state.examActive = false;
  clearExamSimulationState();
  state.examSetActive = false;
  state.sessionActive = false;
  state.smartTrainingActive = false;
  state.spacedReviewActive = false;
  state.spacedReviewIds = [];
  state.dangerousReviewActive = true;
  state.dangerousReviewIds = [question.id];
  state.activeAnswers = {};
  state.index = 0;
  setTab("overview");
  applyFilters({ preserveCurrent: true });
}

function endSpacedReview() {
  clearRecoverySnapshot();
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  const reviews = state.includeReviewsInSession ? shuffle(sessionReviewPool()) : [];
  const reviewIds = new Set(reviews.map((question) => question.id));
  const basePool = sessionPoolByMode(sessionPoolQuestions()).filter((question) => !reviewIds.has(question.id));
  const session = [...reviews.slice(0, state.sessionSize), ...shuffle(basePool).slice(0, Math.max(state.sessionSize - reviews.length, 0))];
  if (!session.length) {
    el.sessionLine.textContent = !topicsForStats().length
      ? "Marque pelo menos um tema para começar."
      : state.sessionPoolMode === "new"
        ? "Você já fez todas as questões destes temas. Escolha \"Todas\" ou \"Só erradas\"."
        : state.sessionPoolMode === "wrong"
          ? "Nenhuma questão errada nestes temas."
          : "Nenhuma questão corrigível nestes temas.";
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.smartTrainingActive = true;
  state.smartTrainingIds = ids;
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function endSession() {
  clearRecoverySnapshot();
  if (typeof handleStudyRunExit === "function") handleStudyRunExit();
  state.sessionCompletionMessage = "";
  /* "Sair do bloco" é a saída visível também no estudo por tema ("Continuar" no progresso por tema). */
  state.topicActive = false;
  state.topicIds = [];
  state.sessionActive = false;
  state.sessionIds = [];
  state.smartTrainingActive = false;
  state.smartTrainingIds = [];
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

function finishSession() {
  if (!state.sessionActive && !state.smartTrainingActive) return;
  clearRecoverySnapshot();
  if (typeof handleStudyRunFinish === "function") handleStudyRunFinish();
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  clearExamSimulationState();
  state.examActive = true;
  state.filtered = exam.questions.filter((question) => !isExcluded(question.id) && isReadyQuestion(effectiveQuestion(question)));
  const restored = restoreActiveAnswersForRun("exam", exam.id, state.filtered);
  state.activeAnswers = restored.activeAnswers;
  state.index = restored.index;
  setTab("exams");
  saveActiveStudyState();
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
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
    /* Conta no Desempenho como as demais respostas (antes o simulado não gerava tentativas). */
    saveAttempt(question, state.progress[question.id]);
    if (grade === "wrong") errorIds.push(question.id);
  }
  state.examSimulationErrorIds = errorIds;
  state.examSimulationFinished = true;
  saveProgress();
  if (typeof recordSimulationResult === "function") recordSimulationResult();
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
  clearActiveStudyState();
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("exams");
}

function reviewExamSimulationErrors() {
  if (!state.examSimulationErrorIds.length) return;
  state.smartTrainingActive = true;
  state.smartTrainingIds = [...state.examSimulationErrorIds];
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
  state.activeAnswers = {};
  clearExamSimulationState();
  state.examActive = false;
  state.index = 0;
  applyFilters({ preserveCurrent: true });
}

/* "Sair da prova" (treino, não simulado): sai sem fechar a prova. A posição e as respostas ficam
   guardadas e voltam ao abrir de novo a mesma prova ou o mesmo conjunto de provas filtradas. */
function pauseExamStudy() {
  if (!state.examActive && !state.examSetActive) return;
  const snapshot = currentActiveStudyState();
  const answered = currentRunAnsweredQuestions().length;
  const total = state.filtered.length;
  clearActiveStudyState(); // também apaga a cópia que reabriria a prova sozinha ao voltar à aba
  if (snapshot) localStorage.setItem(ACTIVE_STUDY_KEY, JSON.stringify(snapshot));
  state.examCompletionMessage = `Prova pausada em ${answered}/${total}. Abra a mesma prova para continuar de onde parou.`;
  state.examActive = false;
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  state.index = 0;
  applyFilters({ preserveCurrent: true });
  setTab("exams");
}

function endExam() {
  state.examCompletionMessage = "";
  state.examActive = false;
  state.examSetActive = false;
  state.examSetIds = [];
  state.activeAnswers = {};
  clearExamSimulationState();
  clearActiveStudyState();
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
  state.dangerousReviewActive = false;
  state.dangerousReviewIds = [];
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
  clearActiveStudyState();
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
  if (el.editExplanation) el.editExplanation.value = question.explanation || "";
  /* fillEditor roda a cada redesenho durante a edição: só reinicia a imagem ao trocar de questão. */
  if (state.editImageFor !== question.id) {
    state.editImageFor = question.id;
    state.editImage = question.image || "";
    if (el.editImageStatus) el.editImageStatus.textContent = "";
  }
  renderEditImage();
  if (el.editStudyTopic) {
    const topics = [...new Set([...state.questions, ...examStudyQuestions()].map((item) => topicForQuestion(item)))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    const manual = manualStudyTopic(question);
    el.editStudyTopic.innerHTML = [
      `<option value="">Automático (${escapeHtml(manual ? "" : topicForQuestion(question))})</option>`,
      ...topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`),
    ].join("");
    el.editStudyTopic.value = manual;
  }
}

function collectEditor() {
  const options = [];
  for (const letter of "ABCDE") {
    const text = el.editOptions[letter].value.trim();
    if (text) options.push({ letter, text });
  }
  const correction = {
    text: el.editText.value.trim(),
    options,
    correctAnswer: el.editAnswer.value,
  };
  if (el.editStudyTopic?.value) correction.studyTopic = el.editStudyTopic.value;
  if (el.editExplanation?.value.trim()) correction.explanation = el.editExplanation.value.trim();
  /* Só imagens enviadas pela edição vão na correção; as que vieram com o banco ficam no próprio dado. */
  if (String(state.editImage || "").startsWith("data:image/")) correction.image = state.editImage;
  const readyAfterEdit = Boolean(
    correction.correctAnswer &&
      correction.options.length >= 2 &&
      new Set(correction.options.map((option) => option.letter)).size === correction.options.length &&
      correction.options.some((option) => option.letter === correction.correctAnswer),
  );
  correction.maintenanceFlagged = !readyAfterEdit;
  return correction;
}

function renderEditImage() {
  if (!el.editImagePreview) return;
  const image = state.editImage || "";
  el.editImagePreview.hidden = !image;
  if (image && el.editImagePreview.getAttribute("src") !== image) el.editImagePreview.src = image;
  if (el.editImageRemove) el.editImageRemove.hidden = !image.startsWith("data:image/");
  if (el.editImagePickLabel) el.editImagePickLabel.textContent = image ? "Trocar imagem" : "Enviar imagem";
}

/* Reduz a imagem enviada (até 1400 px de largura) e guarda como data URL na correção da questão. */
const EDIT_IMAGE_MAX_WIDTH = 1400;

function readEditImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("O arquivo não é uma imagem válida."));
      img.onload = () => {
        const scale = Math.min(1, EDIT_IMAGE_MAX_WIDTH / img.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

el.editImageFile?.addEventListener("change", async () => {
  const file = el.editImageFile.files?.[0];
  el.editImageFile.value = "";
  if (!file) return;
  try {
    state.editImage = await readEditImage(file);
    if (el.editImageStatus) el.editImageStatus.textContent = `Imagem pronta (${Math.round((state.editImage.length * 0.75) / 1024)} KB). Toque em "Salvar revisão" para publicar.`;
  } catch (error) {
    if (el.editImageStatus) el.editImageStatus.textContent = error.message;
  }
  renderEditImage();
});

el.editImageRemove?.addEventListener("click", () => {
  const base = allStudyQuestions().find((question) => question.id === state.editImageFor);
  state.editImage = base?.image || "";
  if (el.editImageStatus) el.editImageStatus.textContent = 'Imagem removida. Toque em "Salvar revisão" para publicar.';
  renderEditImage();
});

function openEditor() {
  if (!state.isAdmin) return;
  const question = effectiveQuestion(currentQuestion());
  if (!question) return;
  state.editing = true;
  render();
}

function closeEditor() {
  state.editing = false;
  render();
}

async function saveEdit() {
  if (!state.isAdmin) return;
  const question = currentQuestion();
  if (!question) return;
  if (hasActiveQuestionFlow()) return saveEditPreservingFlow(question);
  const correction = collectEditor();
  const savedGlobally = await saveGlobalCorrection(question.id, correction);
  if (!savedGlobally) {
    state.corrections[question.id] = correction;
    saveCorrections();
  }
  state.editing = false;
  const corrected = effectiveQuestion(question);
  if (el.status.value === "needs-review" && isReadyQuestion(corrected)) {
    applyFilters();
    return;
  }
  applyFilters({ preserveCurrent: true });
}

/* Preserva a sessão ativa ao editar e salvar uma questão dentro de um bloco. */
async function saveEditPreservingFlow(question) {
  const originalIndex = state.index;
  const originalTab = state.activeTab;
  const originalFiltered = state.filtered;
  const originalFlags = {
    sessionActive: state.sessionActive,
    topicActive: state.topicActive,
    examActive: state.examActive,
    examSetActive: state.examSetActive,
    spacedReviewActive: state.spacedReviewActive,
    smartTrainingActive: state.smartTrainingActive,
    dangerousReviewActive: state.dangerousReviewActive,
  };

  const correction = collectEditor();
  const savedGlobally = await saveGlobalCorrection(question.id, correction);
  if (!savedGlobally) {
    state.corrections[question.id] = correction;
    saveCorrections();
  }

  // Restaura explicitamente o contexto do bloco e evita applyFilters(), que pode desmontar a fila.
  state.filtered = originalFiltered;
  state.index = Math.min(originalIndex, Math.max(state.filtered.length - 1, 0));
  Object.assign(state, originalFlags);
  state.activeTab = originalTab;
  state.editing = false;

  if (el.pendingReviewReason) {
    el.pendingReviewReason.textContent = correction.maintenanceFlagged
      ? "Pendências: sinalizada para manutenção."
      : "Edição salva.";
  }

  if (typeof saveActiveStudyState === "function") saveActiveStudyState();
  render();
}

async function resetEdit() {
  if (!state.isAdmin) return;
  const question = currentQuestion();
  if (!question) return;
  if (state.supabase && state.authUser) {
    const { error } = await state.supabase.from("question_corrections").delete().eq("question_id", question.id);
    if (!error) {
      delete state.globalCorrections[question.id];
      setSyncStatus("Correção global removida.");
    } else {
      setSyncStatus(`Erro ao remover correção global: ${error.message}`);
    }
  }
  delete state.corrections[question.id];
  saveCorrections();
  state.editing = false;
  applyFilters({ preserveCurrent: true });
}

/* Sinaliza a questão para manutenção sem alterar aba, filtro, fila, índice ou sessão de estudo. */
async function sendCurrentQuestionToMaintenance() {
  if (!state.isAdmin) return;
  const question = currentQuestion();
  if (!question) return;
  const current = state.corrections[question.id] || state.globalCorrections[question.id] || {};
  const correction = {
    ...current,
    maintenanceFlagged: true,
  };
  const savedGlobally = await saveGlobalCorrection(question.id, correction);
  if (!savedGlobally) {
    state.corrections[question.id] = correction;
    saveCorrections();
  }
  if (el.pendingReviewReason) {
    el.pendingReviewReason.textContent = "Pendências: sinalizada para manutenção.";
  }
  if (typeof setSyncStatus === "function") {
    setSyncStatus("Questão enviada para manutenção. Sua sessão foi mantida.");
  }
  const effective = effectiveQuestion(question);
  if (el.pendingReviewPanel && state.isAdmin) {
    el.pendingReviewPanel.hidden = !needsBankReview(effective);
  }
  saveActiveStudyState();
}

function exportCorrections() {
  if (!state.isAdmin) return;
  const corrections = Object.fromEntries(
    Object.entries({ ...state.globalCorrections, ...state.corrections }).filter(([, correction]) =>
      Boolean(
        correction?.text ||
          correction?.correctAnswer ||
          correction?.maintenanceFlagged ||
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
  if (!state.isAdmin) return;
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
  if (!state.isAdmin) return;
  if (!state.excluded.length) return;
  const shouldRestore = window.confirm("Restaurar todas as questões excluídas?");
  if (!shouldRestore) return;
  state.excluded = [];
  saveExcluded();
  renderTopics();
  applyFilters({ preserveCurrent: true });
}

el.tabs.forEach((button) => button.addEventListener("click", () => {
  setTab(button.dataset.tab, { fromNav: true });
  /* No celular a gaveta é só o menu: escolhida a aba, ela fecha e mostra o conteúdo. */
  if (isMobileLayout()) setSidebarCollapsed(true);
}));
el.tabViewBackBtn?.addEventListener("click", returnToQuestion);
el.sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!state.sidebarCollapsed));
el.sidebarBackdrop?.addEventListener("click", () => setSidebarCollapsed(true));
el.themeToggle?.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
el.goSession.addEventListener("click", () => setTab("activity", { fromNav: true }));
el.goExams.addEventListener("click", () => setTab("exams", { fromNav: true }));
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
/* Chamadas pelo nome (e não passando a função) para valer a versão estendida pelos módulos. */
el.startExamSet.addEventListener("click", () => startExamSet());
el.endExamSet.addEventListener("click", endExamSet);
el.startDangerousReview?.addEventListener("click", startDangerousReview);
el.endDangerousReview?.addEventListener("click", endDangerousReview);
el.quickReview?.addEventListener("click", () => startPresetReview({ mode: "mixed", minutes: 10 }));
el.examThemesReview?.addEventListener("click", () => startPresetReview({ mode: "exam-themes", minutes: state.reviewAvailableMinutes }));
el.repeatedErrorsReview?.addEventListener("click", () => startPresetReview({ mode: "repeated-errors", minutes: state.reviewAvailableMinutes }));
el.flashcardErrorsReview?.addEventListener("click", () => startPresetReview({ mode: "flashcards", minutes: state.reviewAvailableMinutes }));
el.topicSourceGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-topic-source]");
  if (!button) return;
  state.topicSource = button.dataset.topicSource;
  localStorage.setItem("banco-rmais-topic-source", state.topicSource);
  renderTopicChecklist();
  renderActivity();
});
el.sessionPoolGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pool]");
  if (!button) return;
  state.sessionPoolMode = button.dataset.pool;
  saveSessionPoolMode();
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
el.startSession.addEventListener("click", () => startSession());
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
el.dangerousList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dangerous-question]");
  if (!button) return;
  openDangerousQuestion(button.dataset.dangerousQuestion);
});
el.savedNotesList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-note-question]");
  if (!button) return;
  openQuestionFromNote(button.dataset.openNoteQuestion);
});
el.flashcardDeckList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-flashcard-deck]");
  if (!button) return;
  rememberFlashcardPosition();
  state.flashcardDeckId = button.dataset.flashcardDeck;
  restoreFlashcardPosition(currentFlashcardDeck());
  state.flashcardRevealed = false;
  saveFlashcardState();
  renderFlashcards();
});
el.flashcardCategorySelect?.addEventListener("change", () => {
  rememberFlashcardPosition();
  state.flashcardCategory = el.flashcardCategorySelect.value;
  restoreFlashcardPosition(currentFlashcardDeck());
  state.flashcardRevealed = false;
  saveFlashcardState();
  renderFlashcards();
});
el.flashcardPriorityGroup?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-flashcard-priority]");
  if (!button) return;
  rememberFlashcardPosition();
  state.flashcardPriority = button.dataset.flashcardPriority;
  restoreFlashcardPosition(currentFlashcardDeck());
  state.flashcardRevealed = false;
  saveFlashcardState();
  renderFlashcards();
});
el.showFlashcardAnswer?.addEventListener("click", () => {
  state.flashcardRevealed = true;
  renderFlashcards();
});
el.prevFlashcard?.addEventListener("click", () => moveFlashcard(-1));
el.nextFlashcard?.addEventListener("click", () => moveFlashcard(1));
el.resetFlashcardDeck?.addEventListener("click", resetCurrentFlashcardDeck);
el.flashcardGrade?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-flashcard-grade]");
  if (!button) return;
  gradeFlashcard(button.dataset.flashcardGrade);
});
el.examSelect.addEventListener("change", () => {
  state.examCompletionMessage = "";
  state.activeExamId = el.examSelect.value;
  renderExams();
});
el.startExam.addEventListener("click", startExam);
el.startExamSimulation.addEventListener("click", () => startExamSimulation());
el.finishExamStudy.addEventListener("click", finishExamStudy);
el.finishExamSimulation.addEventListener("click", () => finishExamSimulation());
el.endExam.addEventListener("click", () => endExam());
el.examResult.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-exam-errors]");
  if (!button) return;
  reviewExamSimulationErrors();
});
el.confirmPending.addEventListener("click", () => {
  if (!state.isAdmin) return;
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
el.addExplanation?.addEventListener("click", () => {
  openEditor();
  el.editExplanation?.scrollIntoView({ block: "center" });
  el.editExplanation?.focus();
});
el.sendMaintenance?.addEventListener("click", sendCurrentQuestionToMaintenance);
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
el.sendComment?.addEventListener("click", sendCurrentComment);
el.commentInput?.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") sendCurrentComment();
});
el.commentsList?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-comment]");
  if (editButton) {
    startCommentEdit(editButton.dataset.editComment);
    return;
  }
  const saveButton = event.target.closest("[data-save-comment]");
  if (saveButton) {
    saveCommentEdit(saveButton.dataset.saveComment);
    return;
  }
  const cancelButton = event.target.closest("[data-cancel-comment-edit]");
  if (cancelButton) {
    cancelCommentEdit();
    return;
  }
  const button = event.target.closest("[data-delete-comment]");
  if (!button) return;
  deleteComment(button.dataset.deleteComment);
});
el.note.addEventListener("input", markPrivateNoteDirty);
el.savePrivateNote?.addEventListener("click", saveCurrentPrivateNote);
/* Atalhos no computador, com uma questão na tela: A–E marca, Enter confirma, setas navegam. */
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
  const target = event.target instanceof Element ? event.target : document.body;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return;
  if (!currentQuestion() || !el.options.offsetParent) return;
  const key = event.key;
  if (/^[a-e]$/i.test(key)) {
    const option = el.options.querySelector(`[data-option="${key.toUpperCase()}"]`);
    if (!option || option.disabled) return;
    event.preventDefault();
    option.click();
  } else if (key === "Enter") {
    if (target.closest("button, a, summary")) return;
    if (el.confirmAnswer.disabled || el.confirmAnswer.offsetParent === null) return;
    event.preventDefault();
    el.confirmAnswer.click();
  } else if (key === "ArrowRight" && !el.next.disabled) {
    event.preventDefault();
    el.next.click();
  } else if (key === "ArrowLeft" && !el.prev.disabled) {
    event.preventDefault();
    el.prev.click();
  }
});
/* Um toque só: o tipo de acerto/erro já define a confiança usada na revisão espaçada. */
el.successTypeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-success-type]");
  if (!button) return;
  setProgress({ successType: button.dataset.successType, confidence: Number(button.dataset.confidence) });
});
el.errorTypeGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-error-type]");
  if (!button) return;
  setProgress({ errorType: button.dataset.errorType, confidence: Number(button.dataset.confidence || defaultConfidenceForGrade("wrong")) });
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
  recordChoice(question.id, button.dataset.option);
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
  if (window.BANCO_RMAIS_QUESTIONS) return Promise.resolve(window.BANCO_RMAIS_QUESTIONS);
  return Promise.reject(new Error("Banco de questões não encontrado (data/questions.js)."));
}

/* A inicialização espera o fim do carregamento da página para que os módulos
   carregados depois deste arquivo (revisão, progresso por tema, sessão etc.) já
   estejam aplicados quando o app desenha a primeira tela. */
/* Tira do banco as cópias de questões didáticas repetidas (data/duplicateQuestions.js). Se a
   pessoa respondeu só a cópia, o progresso dela passa para a versão que fica. */
function removeDuplicateQuestions(questions) {
  const duplicates = window.BANCO_RMAIS_DUPLICATES || {};
  let moved = false;
  for (const [copyId, keptId] of Object.entries(duplicates)) {
    const copy = state.progress[copyId];
    if (copy?.grade && !state.progress[keptId]?.grade) {
      state.progress[keptId] = { ...copy };
      moved = true;
    }
  }
  if (moved) localStorage.setItem("banco-rmais-progress", JSON.stringify(state.progress));
  return questions.filter((question) => !duplicates[question.id]);
}

function startApp() {
  return loadPayload()
  .then(async (payload) => {
    state.questions = removeDuplicateQuestions(payload.questions || []);
    state.exams = window.BANCO_RMAIS_EXAMS?.exams || [];
    state.flashcards = window.BANCO_RMAIS_FLASHCARDS?.decks || [];
    applyTheme(state.theme);
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
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startApp, { once: true });
else startApp();
