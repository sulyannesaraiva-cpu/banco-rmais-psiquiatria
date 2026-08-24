/*
 * Revisão inteligente: frequência empírica por banca.
 * Usa as provas já carregadas em state.exams para estimar quanto cada subtema
 * aparece na banca selecionada. A heurística antiga do app.js permanece como
 * fallback quando não há amostra suficiente.
 */
const empiricalExamFrequencyCache = new Map();
const MIN_EMPIRICAL_EXAM_QUESTIONS = 30;

function normalizedExamTarget(value) {
  return normalText(value).replace(/[^a-z0-9]+/g, "");
}

function examMatchesReviewTarget(exam, targetExam = "Todas") {
  const target = normalizedExamTarget(targetExam);
  if (!target || target === "todas") return true;
  const haystack = normalizedExamTarget([exam?.institution, exam?.provider, exam?.title, exam?.area, exam?.id].join(" "));
  return haystack.includes(target);
}

function empiricalExamFrequencyProfile(targetExam = "Todas") {
  const cacheKey = normalizedExamTarget(targetExam) || "todas";
  if (empiricalExamFrequencyCache.has(cacheKey)) return empiricalExamFrequencyCache.get(cacheKey);
  const exams = (state.exams || []).filter((exam) => examMatchesReviewTarget(exam, targetExam));
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
  const profile = { targetExam, totalExams: exams.length, totalQuestions, subthemeCounts, subthemeExamCounts };
  empiricalExamFrequencyCache.set(cacheKey, profile);
  return profile;
}

function itemSubthemeForExamFrequency(item) {
  if (item.kind === "question") return questionSubtheme(item.question);
  const card = item.card || {};
  const deck = item.deck || {};
  return questionSubtheme({
    id: `flashcard-frequency:${card.id || item.id || "unknown"}`,
    source: card.module || deck.module || deck.title || "Flashcards",
    topic: card.topic || deck.title || "",
    title: (card.tags || []).join(" "),
    text: card.front || "",
    options: [{ letter: "A", text: card.back || "" }],
  });
}

function empiricalExamFrequencyScore(item, targetExam = "Todas") {
  const profile = empiricalExamFrequencyProfile(targetExam);
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
  const empiricalScore = empiricalExamFrequencyScore(item, targetExam);
  if (Number.isFinite(empiricalScore)) return empiricalScore;
  return legacyCalculateExamFrequencyScore(item, targetExam);
};

const legacyClearClassificationCache = clearClassificationCache;
clearClassificationCache = function clearClassificationCacheWithExamFrequency() {
  empiricalExamFrequencyCache.clear();
  return legacyClearClassificationCache();
};
