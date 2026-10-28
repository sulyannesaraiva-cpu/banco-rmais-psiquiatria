/* "Entre classes": comparar um efeito em todas as classes e checar interações.
   - effects: para cada efeito, de onde vem o nível (0 a 3) em cada classe (chave do efeito na
     classe). "qt" usa as categorias do Maudsley 15ª ed.: tabela 1.35 (antipsicóticos),
     tabela 3.13 (antidepressivos) e seção de metadona (cap. 4).
   - groups: conjuntos de remédios usados pelas regras de interação.
   - cyp: inibidores, indutores e substratos conforme as tabelas 3.11 e 3.12 do Maudsley;
     quetiapina, lurasidona e aripiprazol como substratos da CYP3A4 conforme Stahl.
   Ids iguais aos das classes; "bupropiona-tabaco" conta como bupropiona. */

window.PHARMA_CROSS = {
  alias: { "bupropiona-tabaco": "bupropiona" },
  effects: [
    {
      id: "qt", label: "QT longo",
      categories: {
        brexpiprazol: 0, cariprazina: 0, lurasidona: 0,
        aripiprazol: 1, asenapina: 1, clozapina: 1, flufenazina: 1, olanzapina: 1, paliperidona: 1, risperidona: 1,
        amissulprida: 2, clorpromazina: 2, haloperidol: 2, quetiapina: 2, ziprasidona: 2,
        citalopram: 2, escitalopram: 2, amitriptilina: 2, nortriptilina: 2, clomipramina: 2, imipramina: 2,
        trazodona: 1, venlafaxina: 1, desvenlafaxina: 1, duloxetina: 1,
        sertralina: 0, fluoxetina: 0, paroxetina: 0, fluvoxamina: 0, mirtazapina: 0, bupropiona: 0, vortioxetina: 0, moclobemida: 0,
        metadona: 2,
      },
      levels: ["sem efeito", "efeito baixo", "efeito moderado", "efeito alto"],
      source: "Maudsley 15ª ed., tabelas 1.35 e 3.13 e seção da metadona (cap. 4)",
    },
    { id: "sedation", label: "Sedação", map: { antipsicoticos: "sedation", antidepressivos: "sedation", ansioliticos: "sedation", estabilizadores: "sedation", demencias: "drowsy" } },
    { id: "weight", label: "Ganho de peso", map: { antipsicoticos: "weight", estabilizadores: "weight" } },
    { id: "hypotension", label: "Hipotensão", map: { antipsicoticos: "hypotension", antidepressivos: "hypotension", estimulantes: "hypotension" } },
    { id: "anticholinergic", label: "Anticolinérgico", map: { antipsicoticos: "anticholinergic", antidepressivos: "anticholinergic" } },
    { id: "prolactin", label: "Prolactina", map: { antipsicoticos: "prolactin" } },
    { id: "nausea", label: "Náusea", map: { antidepressivos: "nausea", demencias: "gi", dependencia: "nausea" } },
    { id: "dependence", label: "Dependência e uso indevido", map: { ansioliticos: "dependence", estimulantes: "misuse" } },
    { id: "respiratory", label: "Depressão respiratória", map: { ansioliticos: "respiratory", dependencia: "respdep" } },
    { id: "insomnia", label: "Insônia", map: { estimulantes: "insomnia", dependencia: "sleep" } },
  ],
  /* Classes cujos níveis de efeito vêm de tabela do Maudsley; nas outras, a classificação é didática. */
  effectSources: { antipsicoticos: "Maudsley, tabela 1.7", antidepressivos: "Maudsley, tabela 3.23" },
  groups: {
    maoi: ["tranilcipromina", "moclobemida"],
    serotonergic: ["fluoxetina", "sertralina", "paroxetina", "citalopram", "escitalopram", "fluvoxamina", "venlafaxina", "desvenlafaxina", "duloxetina", "clomipramina", "amitriptilina", "vortioxetina", "trazodona"],
    maoiSerotonergicAntipsychotic: ["ziprasidona"],
    stimulant: ["metilfenidato-li", "metilfenidato-la", "metilfenidato-oros", "lisdexanfetamina"],
    opioid: ["metadona", "buprenorfina"],
    depressant: ["diazepam", "clordiazepoxido", "clonazepam", "alprazolam", "lorazepam", "bromazepam", "midazolam", "zolpidem", "eszopiclona", "pregabalina", "clozapina", "olanzapina", "quetiapina", "clorpromazina", "mirtazapina", "amitriptilina", "trazodona", "doxepina", "suvorexanto", "daridorexanto"],
    acheI: ["donepezila", "rivastigmina-oral", "rivastigmina-adesivo", "galantamina"],
    seizureThreshold: ["clozapina", "amitriptilina", "nortriptilina", "clomipramina", "imipramina"],
  },
  cyp: {
    inhibitors: {
      "2D6": { paroxetina: "potente", bupropiona: "potente", fluoxetina: "moderada a potente", duloxetina: "moderada" },
      "1A2": { fluvoxamina: "potente" },
      "2C19": { fluvoxamina: "potente", fluoxetina: "", moclobemida: "" },
      "3A4": { fluvoxamina: "fraca", fluoxetina: "fraca" },
    },
    inducers: {
      "1A2": ["carbamazepina"], "2B6": ["carbamazepina"], "2C19": ["carbamazepina"], "3A4": ["carbamazepina"],
    },
    substrates: {
      "2D6": ["aripiprazol", "atomoxetina", "brexpiprazol", "clozapina", "donepezila", "duloxetina", "haloperidol", "risperidona", "amitriptilina", "nortriptilina", "clomipramina", "imipramina", "trazodona", "venlafaxina", "vortioxetina"],
      "1A2": ["clozapina", "olanzapina", "duloxetina", "agomelatina", "mirtazapina", "haloperidol", "amitriptilina", "imipramina"],
      "2B6": ["bupropiona", "metadona", "escetamina"],
      "2C19": ["citalopram", "escitalopram", "diazepam", "moclobemida", "amitriptilina", "imipramina"],
      "3A4": ["carbamazepina", "clozapina", "donepezila", "galantamina", "metadona", "buprenorfina", "mirtazapina", "risperidona", "valproato", "venlafaxina", "vortioxetina", "zolpidem", "eszopiclona", "alprazolam", "midazolam", "quetiapina", "lurasidona", "aripiprazol", "suvorexanto", "daridorexanto", "escetamina"],
    },
  },
};
