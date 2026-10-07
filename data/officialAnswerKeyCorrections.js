/* Correções de gabaritos oficiais — AMRIGS Psiquiatria.
 * Fontes auditadas:
 * - AMRIGS/ACM/AMMS 2017, Gabarito Preliminar, pré-requisito Psiquiatria (50 questões).
 * - AMRIGS/ACM/AMMS 2018, Gabarito Definitivo, pré-requisito Psiquiatria (30 questões).
 *
 * Este arquivo é carregado depois de data/exams.js e antes de app.js.
 * Ele corrige somente provas cuja identificação contenha AMRIGS e Psiquiatria
 * e cujo ano corresponda exatamente ao gabarito.
 */
(function applyOfficialAmrigsAnswerKeys() {
  const exams = window.BANCO_RMAIS_EXAMS?.exams;
  if (!Array.isArray(exams)) return;

  const KEYS = {
    2017: "DACDEBACBEABC DCE DDCCDABBB DDEADCADDDBAB DABEEABA".replace(/\s/g, ""),
    2018: "BCACCB CDBCADA DAA CDDDDDDCDBCD A".replace(/\s/g, ""),
  };

  // Declarações explícitas evitam que espaços de formatação alterem a sequência.
  KEYS[2017] = [
    "D","A","C","D","E","B","A","C","B","E",
    "A","B","C","D","C","E","D","D","C","C",
    "C","D","D","A","B","B","B","D","D","E",
    "A","D","C","A","D","D","D","C","D","B",
    "A","B","D","A","B","E","E","A","B","A",
  ];
  KEYS[2018] = [
    "B","C","A","C","C","B","C","D","B","C",
    "A","D","A","D","A","A","C","D","D","D",
    "D","D","D","D","C","D","B","C","D","A",
  ];

  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const audit = [];

  exams.forEach((exam) => {
    const year = Number(exam.year);
    const officialKey = KEYS[year];
    if (!officialKey) return;

    const identity = normalize([exam.institution, exam.area, exam.title, exam.id].filter(Boolean).join(" "));
    if (!identity.includes("amrigs") || !identity.includes("psiquiatr")) return;

    (exam.questions || []).forEach((question, index) => {
      const number = Number(question.number) || index + 1;
      const expected = officialKey[number - 1];
      if (!expected) return;

      const previous = question.correctAnswer || "";
      if (previous !== expected || question.annulled) {
        audit.push({
          examId: exam.id,
          year,
          number,
          previous: question.annulled ? "ANULADA" : previous || "SEM GABARITO",
          official: expected,
        });
        question.correctAnswer = expected;
        question.annulled = false;
      }
    });
  });

  window.BANCO_RMAIS_OFFICIAL_KEY_AUDIT = {
    source: "AMRIGS Psiquiatria 2017/2018",
    corrections: audit,
    correctedCount: audit.length,
  };

  if (audit.length) {
    console.info("[Banco R+] Gabaritos AMRIGS corrigidos conforme fonte oficial:", audit);
  } else {
    console.info("[Banco R+] Auditoria AMRIGS: gabaritos do banco já coincidem com as fontes oficiais.");
  }
})();
