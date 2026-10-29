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

/* Antipsicóticos.
   - med: dose mínima eficaz em multiepisódio; medFirst: primeiro episódio (Maudsley 15ª ed.,
     tabela 1.1; "*" no livro = estimativa). Clozapina não está na tabela.
   - off: quanto tempo leva a retirada do antigo na troca (Stahl 8ª ed., "The art of switching"):
     none (pode parar quando o novo chega à dose-alvo), w1 (1 semana), w4 (3–4 semanas, pelo
     bloqueio colinérgico, histamínico e α1), w4plus (4 semanas ou mais). analogy: o Stahl não
     traz o esquema deste remédio; tempo escolhido por semelhança farmacológica (didático).
   - slowStart: começar devagar (pelo menos 2 semanas) quando vem de remédio pouco sedativo.
   Retirada: Maudsley, "Stopping antipsychotics" (redução proporcional, olanzapina, tabela 1.27). */
window.PHARMA_DOSE.ap = {
  drugs: {
    haloperidol: { med: 4, medFirst: 2, range: [0.5, 20], off: "w1", analogy: true },
    clorpromazina: { med: 300, medFirst: 200, range: [25, 1000], off: "w4", analogy: true },
    amissulprida: { med: 400, medFirst: 300, range: [50, 1200], off: "none" },
    risperidona: { med: 4, medFirst: 2, range: [0.5, 16], off: "w1" },
    paliperidona: { med: 3, medFirst: 3, range: [3, 12], off: "none" },
    olanzapina: { med: 7.5, medFirst: 5, range: [2.5, 20], off: "w4" },
    quetiapina: { med: 300, medFirst: 150, range: [25, 800], off: "w4", slowStart: true },
    clozapina: { med: null, dose: 300, range: [12.5, 900], off: "w4plus", noTarget: true },
    ziprasidona: { med: 80, medFirst: 40, range: [20, 160], off: "w1" },
    lurasidona: { med: 40, medFirst: 40, range: [20, 160], off: "w1" },
    aripiprazol: { med: 10, medFirst: 10, range: [2, 30], off: "none" },
    cariprazina: { med: 1.5, medFirst: 1.5, range: [1.5, 6], off: "none" },
    brexpiprazol: { med: 4, medFirst: 2, range: [1, 4], off: "none" },
    asenapina: { med: 10, medFirst: 5, range: [5, 20], off: "w4" },
  },
  offText: {
    none: "pode parar quando o novo chega à dose-alvo",
    w1: "retirar em cerca de 1 semana",
    w4: "retirar devagar, em 3–4 semanas (bloqueio colinérgico, histamínico e α1)",
    w4plus: "retirar devagar, em 4 semanas ou mais",
  },
  rules: [
    "Começar o novo em dose intermediária e chegar à dose-alvo em 3–7 dias; quetiapina e clozapina vindas de remédio pouco sedativo sobem mais devagar (pelo menos 2 semanas).",
    "Quetiapina, olanzapina e asenapina saem devagar (3–4 semanas); clozapina, em 4 semanas ou mais. Amissulprida, aripiprazol, brexpiprazol, cariprazina e paliperidona podem parar quando o novo chega à dose-alvo.",
    "Benzodiazepínico ou anticolinérgico podem ser usados por pouco tempo na troca para insônia, agitação ou piora dos sintomas.",
    "Clozapina parada de repente: vigiar rebote colinérgico (náusea, vômitos, diarreia, sudorese, cefaleia), distonias, discinesias e catatonia. Mais de 48 horas sem tomar: reintroduzir com nova titulação.",
    "Risperidona e paliperidona juntas não: a paliperidona é o metabólito ativo da risperidona.",
  ],
  risk: {
    low: { label: "Menor", pct: 25, range: "até 25% no primeiro degrau", text: "Uso por menos de 1 ano." },
    high: { label: "Maior", pct: 20, range: "teste de 5–10%; depois 10–25% a cada 2–3 meses", text: "Uso prolongado (mais de 1 ano). Alguns usuários de longo prazo só toleram menos de 5% ao mês." },
  },
  taperRules: [
    "Pensar em retirar só depois de remissão por 6 meses (primeiro episódio) ou 1 ano (multiepisódio); muitos com esquizofrenia recaem de qualquer forma.",
    "Primeiro degrau de teste e observação por várias semanas: sintomas passageiros podem ser retirada, não recaída inevitável.",
    "Se tolerado, seguir com 10–25% da última dose a cada 2–3 meses. Retiradas em 1 ano tiveram 3,5 vezes menos recaída que retiradas em dias.",
    "Piora importante: voltar um ou dois degraus (ou à dose original), estabilizar e tentar depois, mais devagar.",
    "A dose final pode precisar ser mínima (até 1/80 da dose terapêutica, como 0,25 mg de olanzapina): solução oral ou partir comprimidos. Evitar doses em dias alternados nos de meia-vida curta.",
    "Depósito: a meia-vida longa ajuda, mas não é uma retirada automática; da menor dose de depósito passa-se ao oral para continuar.",
  ],
  withdrawal: "Retirada de antipsicótico: insônia, agitação, ansiedade, náusea, sudorese (rebote colinérgico), discinesia de retirada, acatisia e até sintomas psicóticos. Recaída é mais frequente nos primeiros 3 meses após a parada.",
  olanzapineExample: "No Maudsley, tirar olanzapina de 5 para 0 mg reduz o bloqueio D2 em 52,6 pontos, mais do que de 40 para 5 mg (37,3 pontos). Reduzir pela metade a cada degrau (20, 10, 5, 2,5, 1,25, 0,6, 0,3 mg) tira cerca de 15 pontos por vez.",
  /* Ocupação D2 da olanzapina: ajuste à tabela 1.27 do Maudsley (20 mg ≈ 73%, 5 mg ≈ 40%): Emax ≈ 100%, ED50 ≈ 7,3 mg. */
  olanzapineEd50: 7.3,
};

/* Benzodiazepínicos e zolpidem.
   - eq: dose equivalente a 10 mg de diazepam (Maudsley tabela 3.24; alprazolam, bromazepam e
     zolpidem pelo Ashton Manual). long: meia-vida longa.
   - Ocupação do GABA-A: ajuste à tabela do clonazepam do Maudsley Deprescribing Guidelines
     (4 mg ≈ 76%, 1 mg ≈ 45%, 0,5 mg ≈ 29%): Emax ≈ 100%, ED50 ≈ 1,24 mg de clonazepam. Os
     outros são convertidos para clonazepam pela tabela de equivalência. Bate com os números do
     diazepam no Maudsley 15ª ed. (de 5 para 0 mg de diazepam, ~18 pontos).
   - Referência da troca: clonazepam (gotas de 2,5 mg/mL no Brasil, 1 gota = 0,1 mg, permitem
     degraus finos) ou diazepam (só comprimidos de 5 e 10 mg no Brasil). */
window.PHARMA_DOSE.bz = {
  drugs: {
    diazepam: { eq: 10, range: [1, 60], long: true },
    clordiazepoxido: { eq: 25, range: [5, 100], long: true },
    clonazepam: { eq: 0.5, range: [0.25, 8], long: true },
    alprazolam: { eq: 0.5, range: [0.25, 6] },
    lorazepam: { eq: 1, range: [0.5, 10] },
    bromazepam: { eq: 6, range: [1.5, 36] },
    zolpidem: { eq: 20, range: [5, 20], zdrug: true },
  },
  ed50Clonazepam: 1.24,
  switchText: "Remédios de meia-vida curta ou intermediária podem ser retirados direto (às vezes em mais de uma tomada por dia) ou trocados por dose equivalente de um benzodiazepínico de ação mais longa. Como algumas pessoas têm sintomas na troca súbita, a troca é feita aos poucos, uma parte da dose por semana. A equivalência é aproximada: ajustar pelos sintomas.",
  targets: {
    clonazepam: { label: "Clonazepam (gotas)", why: "No Brasil, o clonazepam tem solução oral de 2,5 mg/mL (1 gota = 0,1 mg), inclusive no SUS (Rename, componente básico): dá para descer de gota em gota, sem partir comprimidos. Meia-vida de 20–60 horas. O Stahl's Deprescriber's Guide cita a troca direta de lorazepam para clonazepam como exemplo." },
    diazepam: { label: "Diazepam", why: "Meia-vida mais longa (com metabólito ativo), referência clássica do Maudsley e do Ashton. No Brasil só há comprimidos de 5 e 10 mg (e injetável): as doses finais exigem partir comprimidos ou manipulação. Acumula na insuficiência hepática." },
  },
  dilution: "Abaixo de 1 gota (0,1 mg): diluir 10 gotas da solução de 2,5 mg/mL em água até 10 mL, o que dá 0,1 mg/mL; preparar no dia, agitar bem antes de medir com seringa (Maudsley Deprescribing Guidelines).",
  risk: {
    low: { label: "Menor", pct: 15, range: "10–20% no primeiro degrau", text: "Menos de 6 meses de uso, benzodiazepínico de meia-vida longa e sem retirada importante no passado." },
    high: { label: "Maior", pct: 10, range: "5–10% no primeiro degrau", text: "Mais de 6 meses de uso, meia-vida curta ou retirada difícil no passado. A maioria dos usuários de longo prazo segue a 5–10% da última dose por mês." },
  },
  taperRules: [
    "Nunca parar de repente: a retirada abrupta pode causar convulsões e delirium e pode ser fatal.",
    "Retirar só com a concordância do paciente; apoio e preparo ajudam (TCC e relaxamento têm evidência mais fraca que a redução gradual).",
    "Reduzir uma proporção da última dose (em geral 5–10% ao mês, ou um pouco mais rápido); acompanhar os sintomas por 2–4 semanas a cada degrau.",
    "Teto de velocidade: a diretriz conjunta norte-americana de 2025 (ASAM) recomenda não passar de 25% a cada 2 semanas; com sintomas importantes, degraus ainda menores (citada no Stahl's Deprescriber's Guide).",
    "Não usar doses em dias alternados para espaçar a retirada: a oscilação do nível no sangue provoca sintomas entre as doses (Maudsley Deprescribing Guidelines).",
    "Uso por poucas semanas: a retirada pode ser mais rápida, em geral não mais longa que o tempo de uso.",
    "Guia do Maudsley para diazepam: 5–10 mg a cada 2–4 semanas até 50 mg; 2–5 mg até 20 mg; 1–2 mg até 10 mg; 0,5–1 mg até 5 mg; 0,25–0,5 mg até 2,5 mg; depois 0,1–0,25 mg até parar.",
    "Sintomas intoleráveis: manter a dose ou voltar à última bem tolerada e seguir mais devagar. A dose final pode ser de apenas 0,1 mg de diazepam.",
    "Cuidado na insuficiência hepática: diazepam e outros de ação longa podem acumular.",
  ],
  withdrawal: "Retirada de benzodiazepínico: ansiedade, insônia, pânico, pesadelos, despersonalização, humor deprimido ou instável; rigidez, fadiga, parestesias, hipersensibilidade sensorial, tremor, tontura, taquicardia, acatisia. Convulsões, delirium e psicose sobretudo na retirada muito rápida. Acatisia e ideação suicida nova estão entre as piores consequências e costumam passar despercebidas.",
};
