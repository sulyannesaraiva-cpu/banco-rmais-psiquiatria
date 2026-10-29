/* Doses para a troca e a retirada de antidepressivos.
   - med: dose mínima eficaz (mg/dia), Maudsley 15ª ed., tabela 3.2 ("Recommended minimum effective
     doses of antidepressants"). Tricíclicos: o Maudsley diz "incerto; pelo menos 75–100 mg/dia"
     (medNote). Tranilcipromina não está na tabela: dose usual do Stahl (8ª ed.).
   - range: faixa usada só para limitar o campo de dose (doses usuais de adulto, Stahl 8ª ed.).
   - sert: age no transportador de serotonina (usado no modelo de ocupação do SERT).
   - highRisk: mais associado a retirada intensa (Maudsley, "Stopping antidepressants").
   Retirada: Maudsley, "Stopping antidepressants" (estratificação de risco, ritmo de 2–4 semanas,
   reduções de 10–25% da última dose, dose final muito pequena) e box 3.2 (sertralina). */
window.PHARMA_DOSE = {
  drugs: {
    sertralina: { med: 50, range: [25, 200], sert: true },
    paroxetina: { med: 20, range: [10, 50], sert: true, highRisk: true },
    citalopram: { med: 20, range: [10, 40], sert: true },
    escitalopram: { med: 10, range: [5, 20], sert: true },
    fluoxetina: { med: 20, range: [10, 60], sert: true, longHalfLife: true },
    fluvoxamina: { med: 50, range: [50, 300], sert: true },
    vortioxetina: { med: 10, range: [5, 20], sert: true },
    venlafaxina: { med: 75, range: [37.5, 375], sert: true, highRisk: true },
    desvenlafaxina: { med: 50, range: [50, 200], sert: true, highRisk: true },
    duloxetina: { med: 60, range: [30, 120], sert: true, highRisk: true },
    clomipramina: { med: 75, medNote: "≥ 75–100", range: [25, 250], sert: true },
    amitriptilina: { med: 75, medNote: "≥ 75–100", range: [25, 300] },
    nortriptilina: { med: 75, medNote: "≥ 75–100", range: [25, 150] },
    imipramina: { med: 75, medNote: "≥ 75–100", range: [25, 300] },
    mirtazapina: { med: 30, medNote: "30 (talvez 15)", range: [15, 45] },
    trazodona: { med: 150, range: [50, 600] },
    bupropiona: { med: 150, range: [150, 450] },
    agomelatina: { med: 25, range: [25, 50] },
    moclobemida: { med: 300, range: [150, 600] },
    tranilcipromina: { med: 30, medNote: "30 (dose usual; fora da tabela)", range: [10, 60] },
  },
  example: "Exemplo do Maudsley: citalopram 40 → 20 → 10 → 5 → 2,5 mg enquanto a mirtazapina entra: nada → 15 → 30 → 30 → 45 mg (se precisar). O ritmo é guiado pela tolerância; se surgirem sintomas de retirada, pode ser preciso alongar a redução de forma hiperbólica.",
  risk: {
    low: { label: "Baixo", pct: 25, range: "25–50% no primeiro degrau", text: "Menos de 6 meses de uso, remédio de menor risco e sem retirada importante no passado." },
    mid: { label: "Intermediário", pct: 15, range: "10–20% da dose", text: "Situações entre os dois extremos." },
    high: { label: "Alto", pct: 10, range: "5–10% no primeiro degrau", text: "Mais de 24 meses de uso, remédio de alto risco (paroxetina, venlafaxina, desvenlafaxina, duloxetina) ou retirada grave no passado." },
  },
  taperRules: [
    "Reduzir uma porcentagem da última dose (em geral 10–25%) a cada 2–4 semanas: os degraus em mg ficam cada vez menores.",
    "O primeiro degrau é o mais importante: se ele trouxer sintomas fortes, o resto precisará ser mais lento.",
    "Acompanhar os sintomas de retirada por 2–4 semanas a cada degrau (por exemplo, uma nota de 0 a 10 por dia).",
    "Sintomas intoleráveis: manter a dose atual por mais tempo ou voltar à última dose bem tolerada, estabilizar e seguir com degraus menores. Algumas pessoas não toleram mais de 5% ao mês.",
    "A última dose antes de parar costuma ser muito pequena (às vezes menos de 1 mg), o que exige solução oral ou formulação manipulada.",
    "Fluoxetina: pela meia-vida longa, os sintomas podem aparecer semanas depois; mesmo assim, não deve ser parada de uma vez em uso prolongado.",
  ],
  withdrawal: "Sintomas de retirada: tontura, náusea, cefaleia, \"choques\" (brain zaps), despersonalização, acatisia, ansiedade, humor baixo, choro fácil, insônia. Os psicológicos podem ser confundidos com recaída: ajudam a distinguir o momento do início, sintomas diferentes do quadro original e a melhora rápida ao voltar a dose.",
  patient: "O ritmo real depende do paciente: tempo de uso, dose, experiências anteriores de retirada, idade, gestação, função hepática e renal, outros remédios (interações) e as apresentações disponíveis. Se aparecerem sintomas de retirada, desacelerar.",
  /* Ocupação do SERT: modelo hiperbólico com ~80% na dose mínima eficaz (Meyer 2004). */
  sertAtMed: 80,
};
