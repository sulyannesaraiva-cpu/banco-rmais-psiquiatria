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
      grassi: "Grassi e Riba, Psychopharmacology in Oncology and Palliative Care",
      cordas: "Cordás, Soares e Fraguas, Prática Psiquiátrica em Oncologia (2020)",
    },
    groups: [
      { id: "cardio", label: "Coração e vasos" },
      { id: "sangue", label: "Sangue e coagulação" },
      { id: "metab", label: "Metabolismo" },
      { id: "neuro", label: "Neurologia" },
      { id: "resp", label: "Pulmão" },
      { id: "renal", label: "Rim e vias urinárias" },
      { id: "onco", label: "Câncer" },
      { id: "imuno", label: "Reumatologia e imunologia" },
      { id: "hiv", label: "HIV" },
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
        id: "tamoxifeno", label: "Câncer de mama com tamoxifeno", group: "onco", src: "cordas", where: "cap. 2, Depressão e oncologia",
        rules: {
          antidepressivos: {
            avoid: [[["paroxetina", "fluoxetina"], "Inibidores fortes da CYP2D6: reduzem a formação do endoxifeno, a forma ativa do tamoxifeno."]],
            caution: [
              [["duloxetina", "sertralina", "bupropiona"], "Inibidores moderados da CYP2D6 (a sertralina pesa mais acima de 200 mg/dia, segundo Medically Ill)."],
              [["moclobemida"], "Inibe a CYP2D6: evitar durante o tamoxifeno.", "mi", "cap. 8, Oncology"],
            ],
            prefer: [
              [["venlafaxina", "desvenlafaxina"], "Primeira escolha com tamoxifeno: quase não inibem a CYP2D6 e ainda ajudam nos fogachos."],
              [["citalopram", "escitalopram"], "Não inibem a CYP2D6 de forma relevante (citalopram: atenção ao QT a partir de 40 mg/dia)."],
              [["mirtazapina"], "Sem efeito no metabolismo do tamoxifeno.", "mi", "cap. 8, Oncology"],
            ],
          },
          estimulantes: { avoid: [[["atomoxetina"], "Inibe a CYP2D6.", "mi", "cap. 8, Oncology"]] },
        },
        noteAll: true,
        note: "Há debate: metanálises mostram queda do endoxifeno com inibidores da CYP2D6, mas sem efeito claro em recidiva ou sobrevida; enquanto não se resolve, é prudente evitar os inibidores fortes quando há alternativa (Grassi e Riba, cap. 9). Medically Ill (cap. 8) recomenda evitar todos os inibidores.",
      },
      {
        id: "caquexia", label: "Câncer com náusea, insônia ou perda de peso", group: "onco", src: "cordas", where: "caps. 2 e 9",
        rules: {
          antidepressivos: {
            prefer: [[["mirtazapina"], "Ajuda no sono, no apetite e na náusea; tem comprimido orodispersível. Pode também prender o intestino em quem tem diarreia."]],
            caution: [
              [["fluoxetina", "sertralina"], "Podem reduzir o apetite: muito critério em quem está caquético ou perdeu muito peso."],
              [["bupropiona"], "Neutra para o peso ou leva a perda: não é primeira linha na caquexia.", "grassi", "cap. 9"],
            ],
          },
        },
      },
      {
        id: "snc", label: "Tumor ou metástase no cérebro", group: "onco", src: "grassi", where: "cap. 9, tabela 9.3",
        rules: {
          antidepressivos: { avoid: [[["bupropiona"], "Risco maior de convulsão: evitar em câncer do sistema nervoso central ou com risco de metástase cerebral (também Cordás, cap. 2)."]] },
        },
        noteAll: true,
        note: "Para o risco de convulsão dos outros psicofármacos, marque também \"Epilepsia ou convulsões\".",
      },
      {
        id: "fogachos", label: "Fogachos (câncer de mama ou próstata)", group: "onco", src: "grassi", where: "cap. 10, Hot flashes",
        rules: {
          antidepressivos: {
            prefer: [
              [["venlafaxina", "desvenlafaxina"], "Reduzem os fogachos da privação hormonal (Cordás, caps. 2 e 9)."],
              [["paroxetina"], "Reduziu fogachos na análise conjunta dos ensaios (com venlafaxina); não usar com tamoxifeno."],
            ],
          },
          estimulantes: { prefer: [[["clonidina"], "Recomendada para fogachos em mulheres jovens com câncer de mama."]] },
        },
      },
      {
        id: "dorOnco", label: "Dor neuropática ou dor oncológica", group: "onco", src: "grassi", where: "cap. 10, tratamento da dor",
        rules: {
          antidepressivos: {
            prefer: [
              [["duloxetina", "venlafaxina"], "Antidepressivos duais: recomendados nas diretrizes de dor neuropática, com melhor equilíbrio entre eficácia e segurança."],
              [["amitriptilina", "nortriptilina"], "Analgésicos já em dose baixa; pouco tolerados nas doses de antidepressivo."],
            ],
          },
        },
      },
      {
        id: "fadiga", label: "Fadiga oncológica ou doença avançada", group: "onco", src: "grassi", where: "caps. 9 e 10",
        rules: {
          antidepressivos: { prefer: [[["bupropiona"], "Ativadora: melhora fadiga e concentração (cuidado em quem tem agitação ou ansiedade)."]] },
          estimulantes: { prefer: [[["metilfenidato-li", "metilfenidato-la", "metilfenidato-oros", "lisdexanfetamina"], "Efeito em horas a dias: útil na doença avançada, quando a rapidez importa; cautela na doença cardíaca."]] },
        },
      },
      {
        id: "quimio", label: "Em quimioterapia", group: "onco", src: "mi", where: "cap. 14, tabela 14-2",
        rules: {
          antipsicoticos: { caution: [[MYELO.antipsicoticos, "Pode somar supressão da medula: hemograma de perto junto com os antineoplásicos (Grassi e Riba, cap. 13)."]] },
          estabilizadores: { caution: [[MYELO.estabilizadores, "Pode somar supressão da medula (discrasias sanguíneas)."]] },
          antidepressivos: {
            caution: [
              [MYELO.antidepressivos, "Pode somar supressão da medula (neutropenia rara)."],
              [["fluvoxamina", "fluoxetina", "paroxetina"], "Muitas interações por CYP com antineoplásicos (por exemplo, ciclofosfamida, taxanos): escolher outro se possível.", "grassi", "cap. 9"],
            ],
            prefer: [[["citalopram", "escitalopram", "desvenlafaxina"], "Pouco efeito nas enzimas do fígado: menos interação com a quimioterapia.", "grassi", "cap. 9, tabela 9.4"]],
          },
        },
      },
      {
        id: "lupus", label: "Lúpus eritematoso sistêmico", group: "imuno", src: "mi", where: "cap. 14, lúpus induzido por psicofármacos",
        rules: {
          antipsicoticos: { caution: [[["clorpromazina"], "Pode positivar anticorpos antinucleares e antifosfolípides; risco baixo (0,1 a 1%) de lúpus induzido."]] },
          estabilizadores: { caution: [[["carbamazepina"], "Risco baixo (0,1 a 1%) de lúpus induzido."]] },
        },
        noteAll: true,
        note: "Sintomas psiquiátricos aparecem em pelo menos metade das pessoas com lúpus. A psicose lúpica costuma surgir cedo (até 3 anos do diagnóstico) e raramente volta com o tratamento: imunossupressão mais antipsicótico. Antes de atribuir ao lúpus, pensar em corticoide, antimalárico e encefalite autoimune (Harrison, Textbook of Immunopsychiatry, cap. 5). Oxcarbazepina, valproato, lamotrigina e lítio têm risco muito baixo (até 0,1%) de lúpus induzido; o lúpus induzido vem mais de remédios reumatológicos (infliximabe, adalimumabe) que de psicofármacos.",
      },
      {
        id: "artrite", label: "Artrite reumatoide, artrose ou dor articular crônica", group: "imuno", src: "mi", where: "cap. 14, Key Points",
        rules: {
          antidepressivos: {
            prefer: [
              [["duloxetina"], "Eficaz na dor da artrose de joelho em ensaios controlados; mais analgésica que os ISRS."],
              [["amitriptilina"], "Reduziu dor articular na artrite reumatoide em ensaio controlado (dose baixa); pior tolerância em doses de antidepressivo."],
              [["venlafaxina", "desvenlafaxina", "nortriptilina", "imipramina"], "Tricíclicos e duais têm mais efeito analgésico que os ISRS."],
            ],
          },
        },
        noteAll: true,
        note: "Antidepressivos funcionam na depressão da artrite reumatoide (ensaios controlados). Os biológicos anticitocina (anti-TNF e outros), usados para a doença, também parecem melhorar sintomas depressivos, em parte independente da melhora física (Harrison, Textbook of Immunopsychiatry, cap. 8).",
      },
      {
        id: "aine", label: "Uso contínuo de anti-inflamatório (AINE)", group: "imuno", src: "mi", where: "cap. 14, tabela 14-2",
        rules: {
          antidepressivos: { caution: [[[...SSRI, ...SNRI, "amitriptilina", "imipramina", "clomipramina", "vortioxetina"], "Com AINE, mais sangramento digestivo (serotoninérgicos e tricíclicos terciários); considerar protetor gástrico."]], prefer: [[["mirtazapina", "agomelatina"], "Pouco efeito nas plaquetas (Gee e Taylor, cap. 1)."]] },
          estabilizadores: { caution: [[["litio"], "AINE sobem o nível do lítio: dosar ao iniciar ou mudar a dose.", "maudsley15", "cap. 2, interações do lítio"]] },
        },
      },
      {
        id: "imunossupressor", label: "Imunossupressor (metotrexato, azatioprina, sulfassalazina, inibidor de JAK)", group: "imuno", src: "mi", where: "cap. 14, tabela 14-2",
        rules: {
          antipsicoticos: { caution: [[["clozapina"], "Pode somar supressão da medula: hemograma de perto."]] },
          estabilizadores: { caution: [[["valproato"], "Pode somar supressão da medula."]], avoid: [[["carbamazepina"], "Soma supressão da medula e, como indutor da CYP3A4, deve ser evitada com inibidores de JAK metabolizados por ela (upadacitinibe)."]] },
          antidepressivos: { caution: [[["mirtazapina"], "Pode somar supressão da medula (neutropenia rara)."]] },
        },
      },
      {
        id: "qtImuno", label: "Hidroxicloroquina ou tacrolimo", group: "imuno", src: "mi", where: "cap. 14 e tabela 14-2",
        rules: {
          antipsicoticos: { caution: [[["haloperidol", "flufenazina", "clorpromazina", "risperidona", "paliperidona", "quetiapina", "ziprasidona"], "Tacrolimo: mais risco de arritmia com outros que alargam o QT. Hidroxicloroquina também pode alargar o QT, mas estudos não mostraram piora ao associar antipsicóticos."]] },
          antidepressivos: { caution: [[TCA, "Tacrolimo: mais risco de arritmia com tricíclicos (QT)."]] },
          estabilizadores: { caution: [[["litio"], "Tacrolimo: mais risco de arritmia com lítio (QT)."]] },
        },
      },
      {
        id: "corticoide", label: "Corticoide em uso ou retirada recente", group: "imuno", src: "gee", where: "cap. 10",
        rules: {
          antidepressivos: { avoid: [[TCA, "Evitar: mais risco de suicídio nessa população, e podem piorar a psicose por corticoide."]], prefer: [[[...SSRI, ...SNRI], "Relatos de sucesso na depressão por corticoide (sem ensaio que compare remédios)."]] },
          estabilizadores: { prefer: [[["litio"], "Relatos de sucesso na depressão e na prevenção da psicose por corticoide."], [["valproato"], "Relatos de prevenção da psicose por corticoide."]], avoid: [[["carbamazepina"], "Induz a CYP3A4 e baixa o nível do corticoide: evitar."]] },
          antipsicoticos: { prefer: [[["olanzapina"], "Eficaz e bem tolerada num ensaio aberto na mania ou estado misto por corticoide."]] },
        },
        noteAll: true,
        note: "Primeiro passo: reduzir ou suspender o corticoide, se possível (cursos de menos de 3 semanas podem parar de uma vez; longos, só com retirada lenta). Risco cresce com a dose de prednisona: 1,3% abaixo de 40 mg/dia, 4,6% entre 40 e 80 mg e 18% acima de 80 mg. Mania e confusão são mais precoces (mediana de 11,5 dias); depressão predomina no uso crônico e na retirada. Os sintomas revertem, em média, em até um mês.",
      },
      {
        id: "hiv", label: "HIV ou aids (qualquer esquema)", group: "hiv", src: "mi", where: "cap. 12, Infectious Diseases, Key Points",
        rules: {
          antidepressivos: { prefer: [[SSRI, "Há boa evidência de eficácia dos ISRS na depressão com HIV. Conferir as interações com o esquema antirretroviral (marque o esquema abaixo)."]], caution: [[["fluvoxamina", "fluoxetina", "paroxetina"], "Inibidores potentes de enzimas do fígado: podem aumentar os efeitos adversos dos antirretrovirais.", "ph", "cap. 45"]] },
          estabilizadores: { avoid: [[["carbamazepina"], "Indutor potente: acelera a eliminação dos antirretrovirais e pode levar à falha do tratamento do HIV.", "ph", "cap. 45"]] },
          antipsicoticos: { caution: [[["haloperidol", "flufenazina", "clorpromazina"], "Pessoas com HIV ou aids, sobretudo com acometimento do sistema nervoso, são mais sensíveis a efeitos extrapiramidais."]] },
        },
        noteAll: true,
        note: "Marque também o esquema antirretroviral: as interações mudam muito entre esquemas com reforço (ritonavir ou cobicistate), com efavirenz ou nevirapina e com inibidores de integrase sem reforço. Para conferir combinações específicas, o site de interações de HIV da Universidade de Liverpool é a referência (Maudsley Practice Guidelines, cap. 45).",
      },
      {
        id: "hivReforco", label: "Antirretroviral com ritonavir ou cobicistate", group: "hiv", src: "ph", where: "cap. 45, tabela 45.2",
        rules: {
          antipsicoticos: {
            avoid: [[["quetiapina", "lurasidona"], "Contraindicadas no Reino Unido com inibidor de protease reforçado; nos Estados Unidos, usar um sexto da dose original."]],
            caution: [
              [["aripiprazol", "cariprazina", "brexpiprazol"], "O nível sobe (inibição da CYP3A4): reduzir a dose."],
              [["risperidona", "paliperidona"], "O nível pode subir (CYP3A4 e 2D6): começar baixo e subir pela resposta."],
              [["clozapina"], "O nível pode subir ou cair com ritonavir; com cobicistate, tende a subir: dosar o nível."],
              [["olanzapina"], "Ritonavir reduz o nível: pode ser preciso aumentar a dose."],
              [["haloperidol", "amissulprida", "clorpromazina", "ziprasidona"], "QT somado com inibidores de protease (saquinavir, atazanavir, darunavir, ritonavir, lopinavir)."],
            ],
          },
          antidepressivos: {
            caution: [
              [["citalopram", "escitalopram"], "QT somado com inibidores de protease (contraindicados com saquinavir)."],
              [TCA, "Ritonavir sobe o nível dos tricíclicos e soma QT: começar baixo, menor dose eficaz."],
              [["trazodona"], "QT somado; começar baixo e subir pela resposta."],
              [["fluvoxamina"], "Nível pode subir: começar baixo; com elvitegravir reforçado, evitar."],
              [["sertralina", "paroxetina"], "Darunavir pode reduzir o nível: ajustar pela resposta."],
              [["mirtazapina"], "Começar baixo e subir pela resposta."],
              [["venlafaxina"], "Titular pela resposta; preferir liberação prolongada (menos interação pela glicoproteína P)."],
            ],
          },
          ansioliticos: {
            avoid: [[["alprazolam", "clonazepam", "diazepam", "midazolam"], "O nível sobe muito (CYP3A4): preferir lorazepam."]],
            prefer: [[["lorazepam"], "Não é afetado: alternativa preferida entre os benzodiazepínicos."]],
            caution: [[["zolpidem", "eszopiclona"], "Pode ser preciso reduzir a dose."]],
          },
          estabilizadores: {
            avoid: [[["carbamazepina"], "Interações complexas com inibidores de protease (induz CYP3A4): buscar alternativa."]],
            caution: [
              [["lamotrigina"], "Atazanavir, darunavir e lopinavir reforçados reduzem o nível: pode ser preciso subir a dose e dosar."],
              [["valproato"], "Ritonavir pode reduzir o nível; o valproato pode subir o lopinavir: dosar e vigiar efeitos."],
            ],
          },
        },
      },
      {
        id: "hivNnrti", label: "Antirretroviral com efavirenz ou nevirapina", group: "hiv", src: "ph", where: "cap. 45, tabela 45.2",
        rules: {
          antipsicoticos: {
            caution: [
              [["aripiprazol", "cariprazina", "lurasidona", "olanzapina", "quetiapina"], "Efavirenz e nevirapina induzem a CYP3A4: o nível pode cair."],
              [["clozapina"], "O nível pode cair (CYP3A4): dosar e acompanhar a resposta."],
              [["haloperidol", "amissulprida", "clorpromazina", "ziprasidona"], "QT somado com efavirenz (e rilpivirina)."],
            ],
          },
          antidepressivos: {
            caution: [
              [["sertralina", "trazodona", "bupropiona"], "Indução de CYP3A4 e 2B6: o nível pode cair; ajustar pela resposta."],
              [["citalopram", "escitalopram"], "O nível pode cair, e há QT somado com efavirenz."],
              [TCA, "QT somado com efavirenz e rilpivirina."],
            ],
          },
          ansioliticos: {
            caution: [[["alprazolam", "diazepam", "midazolam", "clonazepam"], "Nevirapina e efavirenz reduzem o nível (com efavirenz, também pode subir)."]],
            prefer: [[["lorazepam"], "Não é afetado."]],
          },
          estabilizadores: { avoid: [[["carbamazepina"], "Reduz o nível da maioria dos não nucleosídeos: não recomendada."]] },
        },
        noteAll: true,
        note: "O efavirenz causa eventos psiquiátricos em 25 a 60% (tontura, sonhos vívidos, insônia, depressão, ansiedade) e não é recomendado para quem já tem transtorno psiquiátrico (Maudsley Practice Guidelines, cap. 45).",
      },
      {
        id: "hivSemReforco", label: "Antirretroviral sem reforço (tenofovir, zidovudina, dolutegravir)", group: "hiv", src: "ph", where: "cap. 45, tabela 45.2",
        rules: {
          estabilizadores: {
            caution: [
              [["litio"], "Lítio e tenofovir saem pelo rim e são nefrotóxicos: acompanhar a função renal."],
              [["valproato"], "Aumenta o nível da zidovudina; há relato de toxicidade hepática com a combinação."],
            ],
            avoid: [[["carbamazepina"], "Reduz o tenofovir (contraindicada) e exige ajuste do dolutegravir."]],
          },
          antipsicoticos: { caution: [[["clozapina"], "Zidovudina soma risco de neutropenia e leucopenia."]] },
        },
        noteAll: true,
        note: "Com nucleosídeos (tenofovir, zidovudina) e inibidores de integrase sem reforço (dolutegravir, raltegravir), não se esperam interações relevantes com antidepressivos, antipsicóticos e hipnóticos.",
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
  sources.harrisonImmuno = sources.harrisonImmuno || {
    short: "Harrison, Textbook of Immunopsychiatry",
    full: "Harrison N, ed. Textbook of Immunopsychiatry. Cambridge University Press; 2021.",
  };
  sources.grassiRiba = sources.grassiRiba || {
    short: "Grassi e Riba, Psychopharmacology in Oncology and Palliative Care",
    full: "Grassi L, Riba M, eds. Psychopharmacology in Oncology and Palliative Care: A Practical Manual. Springer; 2014.",
  };
  sources.cordas2020 = sources.cordas2020 || {
    short: "Cordás e colaboradores, Prática Psiquiátrica em Oncologia",
    full: "Cordás TA, Soares SMSR, Fraguas Jr R, orgs. Prática psiquiátrica em oncologia. Porto Alegre: Artmed; 2020.",
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
      { about: "Tamoxifeno: inibidores fortes e moderados da CYP2D6; venlafaxina e desvenlafaxina como primeira escolha; mirtazapina na náusea, insônia e caquexia; fluoxetina e sertralina reduzindo o apetite", src: "cordas2020", where: "cap. 2 (Depressão e oncologia) e cap. 9, quadro 9.1", kind: "fonte" },
      { about: "Debate sobre o peso clínico da interação com tamoxifeno; bupropiona em tumor cerebral, na fadiga e na caquexia; antidepressivos duais na dor neuropática; fogachos; interações com quimioterápicos", src: "grassiRiba", where: "caps. 9 e 10, tabelas 9.3 e 9.4", kind: "fonte" },
      { about: "Tamoxifeno (evitar todos os inibidores da CYP2D6); mirtazapina no câncer; quimioterapia que deprime a medula", src: "medicallyIll", where: "caps. 8 e 14", kind: "fonte" },
      { about: "Doenças reumatológicas: lúpus induzido por psicofármacos, AINE, imunossupressores, hidroxicloroquina e tacrolimo, antidepressivos na artrite", src: "medicallyIll", where: "cap. 14, tabela 14-2 e Key Points", kind: "fonte" },
      { about: "HIV: interações dos antirretrovirais (com reforço, efavirenz ou nevirapina, sem reforço) com antipsicóticos, clozapina, antidepressivos, hipnóticos e estabilizadores; efavirenz e eventos psiquiátricos", src: "maudsleyPhysical", where: "cap. 45, tabela 45.2", kind: "fonte" },
      { about: "HIV: ISRS eficazes na depressão; mais sensibilidade a efeitos extrapiramidais", src: "medicallyIll", where: "cap. 12, Key Points", kind: "fonte" },
      { about: "Psicose lúpica e diferencial com encefalite autoimune; biológicos anticitocina e sintomas depressivos", src: "harrisonImmuno", where: "caps. 5 e 8", kind: "fonte" },
      { about: "Efeitos psiquiátricos do corticoide: risco por dose, início, manejo por classe e prevenção", src: "geeTaylor2025", where: "cap. 10", kind: "fonte" },
      { about: "Lítio com AINE", src: "maudsley15", where: "cap. 2, interações do lítio", kind: "fonte" },
      { about: "Prioridades (peso, sedação, disfunção sexual, prolactina, anticolinérgico, hipotensão, náusea)", src: "curadoria", where: "níveis de efeito das telas de cada classe, com as fontes delas", kind: "didatico" },
      { about: "Separação em preferir, cautela e evitar, e ordem dentro de cada grupo", src: "curadoria", where: "regra nossa que soma os motivos acima; não é uma recomendação publicada", kind: "didatico" },
    ],
  };
})();
