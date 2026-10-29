/* Comorbidades clínicas e prioridades para a aba Paciente.
   Cada regra diz, para uma classe, quais remédios preferir (prefer), usar com cautela (caution)
   ou evitar (avoid), com o motivo resumido e a fonte.
   Fontes:
   - gee: Gee e Taylor, The Maudsley Prescribing Guidelines for Mental Health Conditions in Physical Illness (2025).
   - ph: Taylor, Gaughran e Pillinger, The Maudsley Practice Guidelines for Physical Health Conditions in Psychiatry.
   - mi: Ferrando, Levenson e Owen, Clinical Manual of Psychopharmacology in the Medically Ill.
   - maudsley15: The Maudsley Prescribing Guidelines in Psychiatry (15ª ed.). */

(function () {
  const TCA = ["amitriptilina", "nortriptilina", "clomipramina", "imipramina"];
  const SSRI = ["fluoxetina", "sertralina", "paroxetina", "citalopram", "escitalopram", "fluvoxamina"];
  const SNRI = ["venlafaxina", "desvenlafaxina", "duloxetina"];
  const BZD = ["diazepam", "clordiazepoxido", "clonazepam", "alprazolam", "lorazepam", "bromazepam", "midazolam"];
  const MYELO = { antipsicoticos: ["clozapina"], estabilizadores: ["carbamazepina", "valproato"], antidepressivos: ["mirtazapina"] };

  window.PHARMA_COMORB = {
    sources: {
      gee: "Gee e Taylor, Maudsley Guidelines in Physical Illness (2025)",
      ph: "Taylor, Gaughran e Pillinger, Maudsley Practice Guidelines for Physical Health Conditions",
      mi: "Ferrando, Levenson e Owen, Psychopharmacology in the Medically Ill",
      maudsley15: "Maudsley Prescribing Guidelines (15ª ed.)",
    },
    groups: [
      { id: "cardio", label: "Coração e vasos" },
      { id: "sangue", label: "Sangue e coagulação" },
      { id: "metab", label: "Metabolismo" },
      { id: "neuro", label: "Neurologia" },
      { id: "resp", label: "Pulmão" },
      { id: "renal", label: "Rim e vias urinárias" },
      { id: "onco", label: "Câncer e imunologia" },
      { id: "olho", label: "Olhos" },
    ],
    conditions: [
      {
        id: "ic", label: "Insuficiência cardíaca", group: "cardio", src: "gee", where: "cap. 1, Heart failure",
        rules: {
          antidepressivos: { prefer: [[["sertralina"], "Escolha do livro na insuficiência cardíaca (bem tolerada, poucas interações)."]], avoid: [[TCA, "Tricíclicos: evitar na doença cardíaca."]], caution: [[["mirtazapina"], "Aumenta apetite e peso, indesejável na insuficiência cardíaca."]] },
          antipsicoticos: { prefer: [[["cariprazina", "lurasidona", "brexpiprazol"], "Escolha do livro: sem efeito aparente no QT e perfil metabólico mais benigno."]], avoid: [[["olanzapina"], "O livro manda evitar na insuficiência cardíaca."]], caution: [[["clozapina"], "Mais ligada a miocardite e cardiomiopatia; pode ser iniciada ou mantida quando indicada, com monitorização cardíaca."]] },
          estabilizadores: { prefer: [[["lamotrigina"], "Nenhum é isento de risco; o livro considera a lamotrigina possivelmente preferível."]], caution: [[["litio"], "Relatos de miocardite, cardiomiopatia e arritmias; manter a eficácia em vista."], [["carbamazepina"], "Pode causar hipotensão, bradicardia e bloqueio atrioventricular."], [["valproato"], "Há relatos de insuficiência cardíaca."]] },
          ansioliticos: { caution: [[["pregabalina"], "Causa edema periférico; há relatos de piora da insuficiência cardíaca."], [BZD, "Associados a mais reinternação e morte cardiovascular na insuficiência cardíaca: só por pouco tempo."]] },
        },
      },
      {
        id: "dac", label: "Doença coronariana (pós-infarto)", group: "cardio", src: "gee", where: "cap. 1, Coronary heart disease",
        rules: {
          antidepressivos: { prefer: [[["sertralina"], "Escolha do livro na doença coronariana."], [["mirtazapina"], "Escolha do livro se houver risco importante de sangramento."]], avoid: [[TCA, "Tricíclicos pioram desfechos cardíacos (frequência cardíaca, variabilidade)."]] },
          antipsicoticos: { prefer: [[["cariprazina", "lurasidona", "brexpiprazol"], "Sem efeito aparente no QT e perfil metabólico mais benigno: preferidos."]] },
          estabilizadores: { prefer: [[["litio", "lamotrigina", "valproato"], "Escolhas do livro (com o valproato, monitorar síndrome metabólica)."]] },
          demencias: { caution: [[["donepezila", "rivastigmina-oral", "rivastigmina-adesivo", "galantamina"], "Podem alargar o QT: cautela logo após um infarto."]] },
        },
      },
      {
        id: "has", label: "Hipertensão", group: "cardio", src: "gee", where: "cap. 1, Hypertension",
        rules: {
          antidepressivos: { prefer: [[["sertralina"], "ISRS não alteram a pressão; o livro escolhe a sertralina."]], caution: [[["venlafaxina", "desvenlafaxina"], "Podem subir a pressão (venlafaxina relevante acima de 200 mg/dia, em cerca de 5%)."], [TCA, "O efeito anticolinérgico pode contribuir para subir a pressão sistólica."]] },
          antipsicoticos: { avoid: [[["olanzapina", "risperidona"], "O livro manda evitar: bloqueio alfa-2 e ganho de peso sobem a pressão."]], caution: [[["clozapina"], "Afinidade alta por alfa-2: pode subir a pressão."]] },
          estimulantes: { caution: [[["metilfenidato-li", "metilfenidato-la", "metilfenidato-oros", "lisdexanfetamina", "atomoxetina"], "Sobem pressão e frequência: a bula contraindica na hipertensão grave. Controlar a pressão antes e medir a cada consulta."]] },
        },
        note: "Estabilizadores de humor: o livro considera todos provavelmente seguros na hipertensão.",
      },
      {
        id: "avc", label: "AVC prévio", group: "cardio", src: "gee", where: "cap. 1, Stroke",
        rules: {
          antidepressivos: { prefer: [[SSRI, "ISRS são escolha habitual após AVC."], [["nortriptilina", "mirtazapina"], "Escolhas do livro se o sangramento preocupa (com mirtazapina, vigiar o peso)."]] },
          antipsicoticos: { caution: [[["olanzapina", "clozapina", "quetiapina"], "Sem escolha ideal após AVC; o livro pede evitar ganho de peso."]] },
          estabilizadores: { prefer: [[["litio", "valproato", "lamotrigina"], "Escolhas do livro após AVC."]], avoid: [[["carbamazepina"], "Associada a mais risco de AVC que os outros estabilizadores: evitar."]] },
          ansioliticos: { caution: [[BZD, "Podem aumentar a mortalidade após AVC."]] },
        },
      },
      {
        id: "fa", label: "Fibrilação atrial", group: "cardio", src: "gee", where: "cap. 1, Atrial fibrillation",
        rules: {
          antidepressivos: { prefer: [[["mirtazapina", "agomelatina"], "Escolhas do livro: seguras na condução e com pouco sangramento somado ao anticoagulante."]], caution: [[SSRI, "Podem ser usados, mas somam sangramento e interagem com varfarina e outros anticoagulantes."]], avoid: [[TCA, "Lentificam a condução: contraindicados nos distúrbios do ritmo."]] },
          antipsicoticos: { prefer: [[["cariprazina", "brexpiprazol", "lurasidona"], "Escolhas do livro na fibrilação atrial."]], caution: [[["aripiprazol"], "Pode ser usado, mas não é totalmente sem efeito no QT."]] },
          demencias: { caution: [[["donepezila", "rivastigmina-oral", "rivastigmina-adesivo", "galantamina"], "Bradicardia: atenção na fibrilação atrial paroxística e outros distúrbios supraventriculares."]] },
        },
        note: "Estabilizadores de humor: o livro considera todas as opções seguras na fibrilação atrial.",
      },
      {
        id: "qt", label: "QT longo ou arritmia", group: "cardio", src: "ph", where: "cap. 3, tabela 3.1",
        rules: {
          antipsicoticos: { prefer: [[["brexpiprazol", "cariprazina", "lurasidona"], "Sem efeito conhecido no QTc."]], avoid: [[["amissulprida", "clorpromazina", "haloperidol", "quetiapina", "ziprasidona"], "Efeito moderado no QTc (10 a 20 ms em dose terapêutica)."]] },
          antidepressivos: { prefer: [[["sertralina", "paroxetina", "fluvoxamina"], "Sem efeito conhecido no QTc (paroxetina e fluvoxamina inibem CYP e podem subir outro remédio que alarga o QT)."]], avoid: [[["citalopram", "escitalopram", "clomipramina", "nortriptilina", "imipramina"], "Efeito moderado no QTc."]] },
          estabilizadores: { prefer: [[["carbamazepina", "valproato", "lamotrigina"], "Sem efeito conhecido no QTc."]] },
          ansioliticos: { prefer: [[[...BZD, "pregabalina"], "Sem efeito conhecido no QTc."]] },
          dependencia: { caution: [[["metadona"], "Efeito moderado no QTc, sobretudo acima de 100 mg/dia."]] },
        },
      },
      {
        id: "anticoag", label: "Anticoagulante, plaquetopenia ou coagulopatia", group: "sangue", src: "gee", where: "cap. 1, Anticoagulation",
        rules: {
          antidepressivos: { prefer: [[["mirtazapina", "agomelatina"], "Escolhas do livro: pouco efeito nas plaquetas."], [["trazodona", "nortriptilina", "moclobemida"], "Opções citadas pelo livro com menos efeito no sangramento."]], caution: [[[...SSRI, ...SNRI, "clomipramina", "vortioxetina"], "Bloqueio do transportador de serotonina nas plaquetas: mais sangramento, maior e mais longo."]] },
          antipsicoticos: { caution: [[["haloperidol", "quetiapina"], "Com anticoagulante oral direto (apixabana, rivaroxabana etc.): evitar, podem subir o nível dele (CYP3A4 e glicoproteína P)."]] },
          estabilizadores: { prefer: [[["litio", "lamotrigina"], "Escolhas do livro: sem interação com anticoagulante."]], caution: [[["valproato"], "Inibe a agregação plaquetária e pode causar plaquetopenia."]], avoid: [[["carbamazepina"], "Induz CYP3A4 e glicoproteína P: reduz varfarina e anticoagulantes diretos, com mais trombose. Ao suspender, risco de anticoagulação excessiva."]] },
        },
        note: "Todos os antipsicóticos têm pequeno risco de tromboembolismo venoso, maior no início do tratamento.",
      },
      {
        id: "diabetes", label: "Diabetes ou obesidade", group: "metab", src: "ph", where: "caps. 11 e 14",
        rules: {
          antipsicoticos: { prefer: [[["lurasidona", "aripiprazol"], "Recomendados quando há risco metabólico (lurasidona e agonistas parciais)."], [["ziprasidona", "haloperidol", "cariprazina"], "Entre os de menor ganho de peso na comparação de 18 antipsicóticos."]], avoid: [[["olanzapina", "clozapina"], "No topo do ganho de peso e da piora da glicose."]], caution: [[["quetiapina", "risperidona", "paliperidona"], "Ganho de peso intermediário."]] },
          antidepressivos: { prefer: [[["bupropiona"], "Pode até levar a perda de peso."]], caution: [[["mirtazapina"], "Aumenta apetite e peso (Gee e Taylor, cap. 1)."]] },
        },
        effects: [{ classes: ["estabilizadores"], key: "weight", min: 3, tone: "caution", text: "Ganho de peso alto no simulador." }],
      },
      {
        id: "epilepsia", label: "Epilepsia ou convulsões", group: "neuro", src: "ph", where: "cap. 53, quadro 53.2",
        rules: {
          antidepressivos: { prefer: [[[...SSRI, "mirtazapina"], "Baixo risco de baixar o limiar convulsivo."]], caution: [[["trazodona", "venlafaxina"], "Risco moderado de baixar o limiar convulsivo."]], avoid: [[[...TCA, "bupropiona"], "Risco alto de baixar o limiar convulsivo."]] },
          antipsicoticos: { prefer: [[["amissulprida", "aripiprazol", "ziprasidona", "flufenazina", "haloperidol", "risperidona"], "Baixo risco de convulsão."]], caution: [[["olanzapina", "quetiapina"], "Risco moderado de convulsão."], [["clozapina"], "Risco alto e dependente da dose: titular devagar e dosar nível; pode ser usada com anticonvulsivante estável."]], avoid: [[["clorpromazina"], "Risco alto de convulsão."]] },
          estabilizadores: { caution: [[["litio"], "Risco moderado de baixar o limiar convulsivo."]], prefer: [[["valproato", "lamotrigina", "carbamazepina", "oxcarbazepina"], "São anticonvulsivantes; atenção às interações com os antiepilépticos em uso."]] },
        },
      },
      {
        id: "dpoc", label: "DPOC", group: "resp", src: "gee", where: "cap. 2",
        rules: {
          antidepressivos: { prefer: [[["sertralina", "fluoxetina", "paroxetina", "fluvoxamina"], "O livro sugere um ISRS (exceto citalopram e escitalopram)."], [["mirtazapina"], "Boa opção se insônia ou pouco apetite."]], caution: [[["citalopram", "escitalopram"], "O livro pede evitar esses dois ISRS na DPOC."], [["bupropiona"], "Não é primeira linha; útil se outras estratégias para parar de fumar falharam."]] },
          antipsicoticos: { caution: [[["haloperidol", "flufenazina", "clorpromazina", "amissulprida", "risperidona", "paliperidona", "olanzapina", "clozapina", "ziprasidona", "lurasidona", "aripiprazol", "cariprazina", "brexpiprazol", "asenapina"], "Usar só quando essencial: risco de insuficiência respiratória e pneumonia somado."]], avoid: [[["quetiapina"], "Mais relatos de insuficiência respiratória aguda: evitar se possível."]] },
          ansioliticos: { avoid: [[[...BZD, "pregabalina"], "Evitar se possível: depressão respiratória, confusão, quedas e pneumonia."]] },
          dependencia: { caution: [[["metadona", "buprenorfina"], "Opioide com benzodiazepínico aumenta muito o risco respiratório na DPOC."]] },
        },
      },
      {
        id: "dialise", label: "Diálise", group: "renal", src: "gee", where: "cap. 6",
        rules: {
          antidepressivos: { avoid: [[["citalopram", "escitalopram"], "Associados a mais morte cardíaca súbita em hemodiálise (QT)."], [TCA, "Efeito pró-arrítmico: evitar."]], prefer: [[["sertralina"], "ISRS sem efeito no QT: preferíveis em diálise."]] },
          antipsicoticos: { prefer: [[["aripiprazol", "paliperidona"], "Efeito mínimo no QT durante a diálise."]], caution: [[["amissulprida"], "Eliminação renal: exposição até 10 vezes maior; doses muito cautelosas."]] },
          estabilizadores: { caution: [[["litio"], "Não é proibido: dose única logo após cada sessão de diálise, com nível diário no início."]] },
          ansioliticos: { caution: [[BZD, "Mais sensibilidade cerebral e fração livre maior: sedação excessiva e encefalopatia."]] },
        },
        note: "Nenhum psicofármaco é absolutamente contraindicado em diálise; prioridade é manter o quadro mental estável.",
      },
      {
        id: "hpb", label: "Retenção urinária ou hiperplasia prostática", group: "renal", src: "ph", where: "cap. 29",
        rules: {
          antidepressivos: { avoid: [[["amitriptilina", "imipramina"], "Os tricíclicos mais ligados a retenção urinária aguda."]], caution: [[["nortriptilina", "clomipramina"], "Tricíclicos: efeito anticolinérgico."]] },
        },
        effects: [{ classes: ["antipsicoticos", "antidepressivos"], key: "anticholinergic", min: 2, tone: "caution", text: "Efeito anticolinérgico moderado ou forte: risco de retenção urinária." }],
      },
      {
        id: "tamoxifeno", label: "Câncer de mama com tamoxifeno", group: "onco", src: "mi", where: "cap. 8, Oncology",
        rules: {
          antidepressivos: { avoid: [[["paroxetina", "fluoxetina", "bupropiona", "duloxetina", "moclobemida"], "Inibem a CYP2D6 e reduzem o endoxifeno (forma ativa do tamoxifeno): mais recidiva e morte por câncer de mama."]], caution: [[["sertralina"], "Inibe a CYP2D6 em doses acima de 200 mg/dia."]], prefer: [[["citalopram", "escitalopram", "venlafaxina", "mirtazapina"], "Preferidos: não alteram o metabolismo do tamoxifeno."]] },
          estimulantes: { avoid: [[["atomoxetina"], "Inibe a CYP2D6."]] },
        },
      },
      {
        id: "quimio", label: "Quimioterapia ou imunossupressor que deprime a medula", group: "onco", src: "mi", where: "cap. 14, tabela 14-2",
        rules: {
          antipsicoticos: { caution: [[MYELO.antipsicoticos, "Pode somar supressão da medula (discrasias sanguíneas)."]] },
          estabilizadores: { caution: [[MYELO.estabilizadores, "Pode somar supressão da medula (discrasias sanguíneas)."]] },
          antidepressivos: { caution: [[MYELO.antidepressivos, "Pode somar supressão da medula (rara)."]], prefer: [[["mirtazapina"], "No câncer, eficaz na depressão e também ajuda náusea, insônia e apetite (cap. 8)."]] },
        },
      },
      {
        id: "reumato", label: "Doença reumatológica (AINE, metotrexato, hidroxicloroquina)", group: "onco", src: "mi", where: "cap. 14",
        rules: {
          antidepressivos: { caution: [[[...SSRI, ...SNRI, "amitriptilina", "imipramina", "clomipramina"], "Com AINE: mais sangramento digestivo (serotoninérgicos e tricíclicos terciários)."]], prefer: [[["duloxetina"], "Tem efeito analgésico comprovado na dor reumatológica."]] },
          antipsicoticos: { caution: [[["clozapina"], "Com metotrexato e outros imunossupressores: pode somar supressão da medula."], [["clorpromazina"], "Raramente induz síndrome semelhante a lúpus (positiva anticorpos)."], [["risperidona", "paliperidona", "quetiapina", "ziprasidona"], "Com hidroxicloroquina: mais risco de arritmia (QT somado)."]] },
          estabilizadores: { caution: [[["litio"], "AINE sobem o nível do lítio: dosar ao iniciar ou mudar a dose (Maudsley 15). Com hidroxicloroquina, QT somado."], [["carbamazepina", "valproato"], "Supressão da medula somada com imunossupressores; a carbamazepina raramente induz lúpus."]] },
        },
      },
      {
        id: "glaucomaFechado", label: "Glaucoma de ângulo fechado", group: "olho", src: "gee", where: "cap. 11",
        rules: {
          antidepressivos: { prefer: [[["agomelatina"], "Escolha do livro no ângulo fechado."], [["citalopram"], "Se precisar de ISRS, o preferido."]], avoid: [[[...TCA, "bupropiona", "paroxetina"], "Evitar no ângulo fechado (anticolinérgico ou midríase)."]], caution: [[["sertralina", "fluoxetina"], "O livro pede evitá-los, se possível, no ângulo fechado."]] },
          antipsicoticos: { prefer: [[["risperidona", "amissulprida", "haloperidol", "lurasidona"], "Sem contraindicação; o livro prefere os de efeito anticolinérgico mais fraco."]] },
          estabilizadores: { prefer: [[["valproato", "litio"], "Podem até ser benéficos no glaucoma."]] },
          dependencia: { avoid: [[["topiramato"], "Não usar: pode desencadear glaucoma agudo."]] },
        },
        effects: [{ classes: ["antipsicoticos"], key: "anticholinergic", min: 2, tone: "caution", text: "Efeito anticolinérgico moderado ou forte: preferir outro no ângulo fechado." }],
      },
      {
        id: "glaucomaAberto", label: "Glaucoma de ângulo aberto", group: "olho", src: "gee", where: "cap. 11",
        rules: {
          antidepressivos: { prefer: [[["bupropiona", "agomelatina", "mirtazapina", "citalopram"], "Escolhas do livro no ângulo aberto (entre os ISRS, citalopram)."]] },
          antipsicoticos: { avoid: [[["ziprasidona"], "O livro pede evitar no ângulo aberto."]] },
          estabilizadores: { prefer: [[["valproato", "litio"], "Podem até ser benéficos no glaucoma."]] },
          dependencia: { avoid: [[["topiramato"], "Não usar no glaucoma."]] },
        },
      },
    ],

    /* Prioridades: usam os níveis de efeito (0 a 3) que o simulador já tem para cada classe. */
    priorities: [
      { id: "weight", label: "Evitar ganho de peso", key: { antipsicoticos: "weight", estabilizadores: "weight" }, want: false },
      { id: "sedationAvoid", label: "Evitar sedação", key: { antipsicoticos: "sedation", antidepressivos: "sedation", ansioliticos: "sedation", estabilizadores: "sedation" }, want: false, conflicts: "sedationWant" },
      { id: "sedationWant", label: "Quer sedação (insônia)", key: { antipsicoticos: "sedation", antidepressivos: "sedation", ansioliticos: "sedation", estabilizadores: "sedation" }, want: true, conflicts: "sedationAvoid" },
      { id: "sexual", label: "Evitar disfunção sexual", key: { antidepressivos: "sexual" }, want: false },
      { id: "prolactin", label: "Evitar prolactina alta", key: { antipsicoticos: "prolactin" }, want: false },
      { id: "anticholinergic", label: "Evitar efeito anticolinérgico", key: { antipsicoticos: "anticholinergic", antidepressivos: "anticholinergic" }, want: false },
      { id: "hypotension", label: "Evitar hipotensão e quedas", key: { antipsicoticos: "hypotension", antidepressivos: "hypotension" }, want: false },
      { id: "nausea", label: "Evitar náusea", key: { antidepressivos: "nausea" }, want: false },
    ],

    /* Classes que a aba Paciente compara. */
    classes: ["antidepressivos", "antipsicoticos", "estabilizadores", "ansioliticos", "estimulantes", "demencias", "dependencia"],
  };
})();

(function addComorbRefs() {
  const sources = window.PHARMA_SOURCES || {};
  sources.geeTaylor2025 = sources.geeTaylor2025 || {
    short: "Gee e Taylor, Maudsley Guidelines in Physical Illness",
    full: "Gee S, Taylor DM. The Maudsley Prescribing Guidelines for Mental Health Conditions in Physical Illness. Wiley Blackwell; 2025.",
  };
  sources.maudsleyPhysical = sources.maudsleyPhysical || {
    short: "Maudsley Practice Guidelines for Physical Health Conditions",
    full: "Taylor DM, Gaughran F, Pillinger T. The Maudsley Practice Guidelines for Physical Health Conditions in Psychiatry. Wiley Blackwell.",
  };
  sources.medicallyIll = sources.medicallyIll || {
    short: "Psychopharmacology in the Medically Ill",
    full: "Ferrando SJ, Levenson JL, Owen JA, eds. Clinical Manual of Psychopharmacology in the Medically Ill. American Psychiatric Publishing.",
  };
  const refs = window.PHARMA_REFS || {};
  refs.paciente = {
    paths: [
      { about: "Insuficiência cardíaca, doença coronariana, hipertensão, AVC, fibrilação atrial e anticoagulação: remédio recomendado por classe", src: "geeTaylor2025", where: "cap. 1 e quadro-resumo", kind: "fonte" },
      { about: "DPOC", src: "geeTaylor2025", where: "cap. 2", kind: "fonte" },
      { about: "Diálise", src: "geeTaylor2025", where: "cap. 6", kind: "fonte" },
      { about: "Glaucoma de ângulo aberto e fechado", src: "geeTaylor2025", where: "cap. 11", kind: "fonte" },
      { about: "Efeito de cada psicofármaco no QTc", src: "maudsleyPhysical", where: "cap. 3, tabela 3.1", kind: "fonte" },
      { about: "Diabetes e obesidade: antipsicóticos de menor risco metabólico e ranking de ganho de peso", src: "maudsleyPhysical", where: "caps. 11 e 14", kind: "fonte" },
      { about: "Remédios que baixam o limiar convulsivo (alto, moderado, baixo)", src: "maudsleyPhysical", where: "cap. 53, quadro 53.2", kind: "fonte" },
      { about: "Retenção urinária e anticolinérgicos", src: "maudsleyPhysical", where: "cap. 29", kind: "fonte" },
      { about: "Tamoxifeno e inibidores da CYP2D6; mirtazapina no câncer", src: "medicallyIll", where: "cap. 8, Oncology", kind: "fonte" },
      { about: "Doenças reumatológicas: AINE, metotrexato, hidroxicloroquina e lúpus induzido", src: "medicallyIll", where: "cap. 14 e tabela 14-2", kind: "fonte" },
      { about: "Lítio com AINE", src: "maudsley15", where: "cap. 2, interações do lítio", kind: "fonte" },
      { about: "Prioridades (peso, sedação, disfunção sexual, prolactina, anticolinérgico, hipotensão, náusea)", src: "curadoria", where: "níveis de efeito das telas de cada classe, com as fontes delas", kind: "didatico" },
      { about: "Separação em preferir, cautela e evitar, e ordem dentro de cada grupo", src: "curadoria", where: "regra nossa que soma os motivos acima; não é uma recomendação publicada", kind: "didatico" },
    ],
  };
})();
