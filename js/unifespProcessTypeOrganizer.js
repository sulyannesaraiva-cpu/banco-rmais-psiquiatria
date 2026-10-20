/* Organização visual pontual da UNIFESP.
   Mantém a arquitetura do banco: apenas agrupa o primeiro filtro de Área em
   Processo seletivo — Residência / Processo seletivo — Não Residência.
   A escolha de provas individuais continua sendo feita no seletor seguinte. */
(function organizeUnifespProcessTypes() {
  const root = window.BANCO_RMAIS_EXAMS;
  if (!root || !Array.isArray(root.exams)) return;

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  root.exams.forEach((exam) => {
    const institution = normalize(exam.institution || exam.provider || exam.source);
    if (!institution.includes("unifesp")) return;

    const descriptor = normalize([
      exam.title,
      exam.source,
      exam.category,
      exam.examTag,
      exam.type,
      ...(Array.isArray(exam.tags) ? exam.tags : []),
    ].filter(Boolean).join(" "));

    const nonResidence =
      exam.residencia === false ||
      descriptor.includes("nao residencia") ||
      descriptor.includes("concurso publico") ||
      descriptor.includes("outros processos seletivos");

    exam.originalArea = exam.originalArea || exam.area || "Psiquiatria";
    exam.processType = nonResidence ? "nao-residencia" : "residencia";
    exam.area = nonResidence
      ? "Processo seletivo — Não Residência"
      : "Processo seletivo — Residência";

    if (Array.isArray(exam.questions)) {
      exam.questions.forEach((question) => {
        question.originalArea = question.originalArea || question.area || exam.originalArea;
        question.processType = exam.processType;
        question.area = exam.area;
      });
    }
  });
})();
