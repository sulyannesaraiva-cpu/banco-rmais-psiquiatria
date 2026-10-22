/*
 * Revisão inteligente: frequência empírica por banca e área.
 * Usa as provas já carregadas em state.exams para estimar quanto cada subtema
 * aparece no recorte selecionado. A heurística antiga permanece como apoio
 * proporcional quando a amostra empírica ainda é pequena.
 */
const empiricalExamFrequencyCache = new Map();
const MIN_EMPIRICAL_EXAM_QUESTIONS = 20;
const FULL_RELIABILITY_EXAMS = 5;
const FULL_RELIABILITY_QUESTIONS = 200;

if (typeof state.reviewTargetArea === "undefined") {
  state.reviewTargetArea = localStorage.getItem("banco-rmais-review-target-area") || "Todas";
}

function normalizedExamTarget(value) {
  return normalText(value).replace(/[^a-z0-9]+/g, "");
}

function examInstitutionLabel(exam) {
  return String(exam?.institution || exam?.provider || "").trim();
}

function examAreaLabel(exam) {
  return String(exam?.area || "").trim();
}

function availableReviewExamTargets() {
  const targets = new Set();
  for (const exam of state.exams || []) {
    const label = examInstitutionLabel(exam);
    if (label) targets.add(label);
  }
  return [...targets].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
}

function availableReviewExamAreas(targetExam = state.reviewTargetExam || "Todas") {
  const target = normalizedExamTarget(targetExam);
  const areas = new Set();
  for (const exam of state.exams || []) {
    const institution = normalizedExamTarget(examInstitutionLabel(exam));
    if (target && target !== "todas" && institution !== target) continue;
    const area = examAreaLabel(exam);
    if (area) areas.add(area);
  }
  return [...areas].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
}

function examMatchesReviewTarget(exam, targetExam = "Todas", targetArea = "Todas") {
  const target = normalizedExamTarget(targetExam);
  const area = normalizedExamTarget(targetArea);
  const institution = normalizedExamTarget(examInstitutionLabel(exam));
  const examArea = normalizedExamTarget(examAreaLabel(exam));

  const institutionMatches = !target || target === "todas" || institution === target;
  const areaMatches = !area || area === "todas" || examArea === area;
  return institutionMatches && areaMatches;
}

function empiricalExamFrequencyProfile(targetExam = "Todas", targetArea = state.reviewTargetArea || "Todas") {
  const cacheKey = `${normalizedExamTarget(targetExam) || "todas"}::${normalizedExamTarget(targetArea) || "todas"}`;
  if (empiricalExamFrequencyCache.has(cacheKey)) return empiricalExamFrequencyCache.get(cacheKey);

  const exams = (state.exams || []).filter((exam) => examMatchesReviewTarget(exam, targetExam, targetArea));
  const subthemeCounts = new Map();
  const subthemeExamCounts = new Map();
  let totalQuestions = 0;

  for (const exam of exams) {
    const seenInExam = new Set();
    for (const question of exam.questions || []) {
      totalQuestions += 1;
      const subtheme = questionSubtheme(question);
      if (!subtheme || subtheme === "Subtema a revisar") continue;
      subthemeCounts.set(subtheme, (subthemeCounts.get(subtheme) || 0) + 1);
      seenInExam.add(subtheme);
    }
    for (const subtheme of seenInExam) {
      subthemeExamCounts.set(subtheme, (subthemeExamCounts.get(subtheme) || 0) + 1);
    }
  }

  const examSignal = Math.min(1, exams.length / FULL_RELIABILITY_EXAMS);
  const questionSignal = Math.min(1, totalQuestions / FULL_RELIABILITY_QUESTIONS);
  const reliability = Math.max(0, Math.min(1, (examSignal * 0.6) + (questionSignal * 0.4)));

  const profile = {
    targetExam,
    targetArea,
    totalExams: exams.length,
    totalQuestions,
    reliability,
    subthemeCounts,
    subthemeExamCounts,
  };
  empiricalExamFrequencyCache.set(cacheKey, profile);
  return profile;
}

function itemSubthemeForExamFrequency(item) {
  if (item.kind === "question") return questionSubtheme(item.question);
  const card = item.card || {};
  const deck = item.deck || {};
  /* Cartões escritos para um subtema declaram o subtema (data/generalFlashcards.js). */
  if (card.subtheme) return card.subtheme;
  return questionSubtheme({
    id: `flashcard-frequency:${card.id || item.id || "unknown"}`,
    source: card.module || deck.module || deck.title || "Flashcards",
    topic: card.topic || deck.title || "",
    title: (card.tags || []).join(" "),
    text: card.front || "",
    options: [{ letter: "A", text: card.back || "" }],
  });
}

function empiricalExamFrequencyScore(item, targetExam = "Todas", targetArea = state.reviewTargetArea || "Todas") {
  const profile = empiricalExamFrequencyProfile(targetExam, targetArea);
  if (profile.totalQuestions < MIN_EMPIRICAL_EXAM_QUESTIONS || !profile.totalExams) return null;

  const subtheme = itemSubthemeForExamFrequency(item);
  if (!subtheme || subtheme === "Subtema a revisar") return null;

  const count = profile.subthemeCounts.get(subtheme) || 0;
  const examCount = profile.subthemeExamCounts.get(subtheme) || 0;
  if (!count) return 10;

  const share = count / profile.totalQuestions;
  const coverage = examCount / profile.totalExams;
  let frequencyScore = 30;
  if (share >= 0.10) frequencyScore = 100;
  else if (share >= 0.06) frequencyScore = 90;
  else if (share >= 0.035) frequencyScore = 80;
  else if (share >= 0.02) frequencyScore = 65;
  else if (share >= 0.01) frequencyScore = 50;

  return Math.max(0, Math.min(100, Math.round((frequencyScore * 0.7) + (coverage * 100 * 0.3))));
}

const legacyCalculateExamFrequencyScore = calculateExamFrequencyScore;
calculateExamFrequencyScore = function calculateExamFrequencyScoreFromRealExams(item, targetExam = "Todas") {
  const targetArea = state.reviewTargetArea || "Todas";
  const empiricalScore = empiricalExamFrequencyScore(item, targetExam, targetArea);
  if (!Number.isFinite(empiricalScore)) return legacyCalculateExamFrequencyScore(item, targetExam);

  const profile = empiricalExamFrequencyProfile(targetExam, targetArea);
  const legacyScore = legacyCalculateExamFrequencyScore(item, targetExam);
  const reliability = profile.reliability;
  return Math.max(0, Math.min(100, Math.round((empiricalScore * reliability) + (legacyScore * (1 - reliability)))));
};

const legacyClearClassificationCache = clearClassificationCache;
clearClassificationCache = function clearClassificationCacheWithExamFrequency() {
  empiricalExamFrequencyCache.clear();
  return legacyClearClassificationCache();
};
