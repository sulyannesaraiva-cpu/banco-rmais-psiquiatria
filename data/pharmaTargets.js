/* O que é cada alvo do simulador (tocar no nome do alvo no Perfil de alvos).
   Separado por classe, porque o mesmo id pode ser outro alvo (A1 = α1-adrenérgico nos
   antipsicóticos e antidepressivos; GABA-A α1 nos ansiolíticos).
   Campos: name (nome por extenso), what (o que é e onde fica), action (o que o remédio faz nele),
   good (efeito desejado), bad (efeitos indesejados), clinic (na prática).
   Resumo didático a partir de Stahl's Essential Psychopharmacology (5ª ed.), Stahl Prescriber's
   Guide (8ª ed.) e Maudsley (15ª ed.). */

(function () {
  const H1 = (good, clinic) => ({
    name: "Receptor de histamina H1",
    what: "Receptor da histamina, que mantém a vigília (neurônios do núcleo tuberomamilar, no hipotálamo) e participa do controle do apetite.",
    action: "O remédio bloqueia o receptor (efeito anti-histamínico).",
    good,
    bad: "Sonolência, aumento do apetite e ganho de peso.",
    clinic,
  });
  const M1 = (clinic) => ({
    name: "Receptor muscarínico M1 (acetilcolina)",
    what: "Receptor da acetilcolina no cérebro (memória, atenção). Os outros receptores muscarínicos, no corpo, controlam glândulas, intestino, bexiga, pupila e coração.",
    action: "O remédio bloqueia o receptor (efeito anticolinérgico).",
    good: "Quase nenhum no tratamento psiquiátrico.",
    bad: "Boca seca, constipação (até obstrução intestinal), visão turva, retenção urinária e taquicardia. Em idosos: confusão, piora da memória e delirium.",
    clinic,
  });
  const A1 = (clinic) => ({
    name: "Receptor adrenérgico α1",
    what: "Receptor da noradrenalina nos vasos sanguíneos (mantém a pressão quando a pessoa fica de pé) e no cérebro.",
    action: "O remédio bloqueia o receptor.",
    good: "Pouco útil no tratamento; contribui para a sedação.",
    bad: "Queda da pressão ao levantar (hipotensão postural), tontura, quedas e taquicardia reflexa; raramente priapismo.",
    clinic,
  });
  const HT2A = (action, good, clinic) => ({
    name: "Receptor de serotonina 5-HT2A",
    what: "Receptor de serotonina no córtex. Quando ativado, freia a liberação de dopamina e interfere no sono profundo e na função sexual.",
    action,
    good,
    bad: "Bloqueá-lo raramente causa efeito adverso próprio.",
    clinic,
  });
  const HT1A = (action, good, clinic) => ({
    name: "Receptor de serotonina 5-HT1A",
    what: "Receptor de serotonina nos neurônios da rafe (onde funciona como freio) e no córtex e no hipocampo. Estimulado, tem efeito ansiolítico e libera dopamina no córtex.",
    action,
    good,
    bad: "Tontura e náusea leves.",
    clinic,
  });
  const NMDA = (action, good, bad, clinic) => ({
    name: "Receptor de glutamato NMDA",
    what: "Canal ativado pelo glutamato, o principal neurotransmissor excitatório; essencial para a plasticidade sináptica e a memória. Ativado em excesso, lesa o neurônio.",
    action,
    good,
    bad,
    clinic,
  });

  window.PHARMA_TARGETS = {
    intro: "Alvo é a proteína onde o remédio se liga: um receptor, um transportador, uma enzima ou um canal. A barra mostra a força dessa ligação; o efeito depende de onde o alvo fica no corpo e de o remédio bloquear ou ativar.",
    antipsicoticos: {
      D2: {
        name: "Receptor de dopamina D2",
        what: "Receptor da dopamina nas quatro vias dopaminérgicas: mesolímbica, mesocortical, nigroestriatal e tuberoinfundibular.",
        action: "Os antipsicóticos bloqueiam o D2; aripiprazol, brexpiprazol e cariprazina o estimulam só um pouco (agonistas parciais).",
        good: "Na via mesolímbica, reduz delírios e alucinações: é o efeito antipsicótico comum a todos.",
        bad: "Na nigroestriatal: parkinsonismo, distonia, acatisia e discinesia tardia. Na tuberoinfundibular: prolactina alta (galactorreia, amenorreia, disfunção sexual). Na mesocortical: pode piorar apatia e cognição.",
        clinic: "A faixa útil de ocupação do D2 fica em torno de 65% a 78%; acima disso aumentam os extrapiramidais e a prolactina (ver a tela Mecanismo).",
      },
      "5HT2A": HT2A(
        "Os antipsicóticos de segunda geração bloqueiam o 5-HT2A com força, muitas vezes mais que o D2.",
        "Bloqueá-lo solta dopamina no estriado e no córtex: menos parkinsonismo e menos prolactina do que o bloqueio do D2 sozinho causaria; pode melhorar o sono.",
        "Ajuda a explicar por que os de segunda geração dão menos parkinsonismo que o haloperidol."
      ),
      "5HT1A": HT1A(
        "Aripiprazol, brexpiprazol e cariprazina são agonistas parciais; clozapina e quetiapina agem um pouco.",
        "Efeito ansiolítico e antidepressivo e um pouco menos de extrapiramidais.",
        "É o mesmo alvo da buspirona."
      ),
      H1: H1("Sedação útil na agitação aguda e na insônia.", "Olanzapina, quetiapina e clozapina bloqueiam muito: sedam e aumentam o apetite e o peso."),
      M1: M1("Clozapina e clorpromazina são muito anticolinérgicas; somar com outros anticolinérgicos aumenta o risco, sobretudo em idosos."),
      A1: A1("Por isso clozapina, quetiapina e risperidona são tituladas devagar; cuidado redobrado em idosos."),
    },
    antidepressivos: {
      SERT: {
        name: "Transportador de serotonina (SERT)",
        what: "Bomba na membrana do neurônio que recolhe a serotonina de volta depois que ela é liberada. Também existe nas plaquetas.",
        action: "O remédio bloqueia o transportador (inibição da recaptação).",
        good: "Sobra serotonina na sinapse; depois de semanas de adaptação dos receptores, efeito antidepressivo e ansiolítico.",
        bad: "Náusea e diarreia, disfunção sexual, inquietação no início, mais sangramento (as plaquetas dependem do SERT), hiponatremia em idosos; síndrome serotoninérgica se somado a outros serotoninérgicos.",
        clinic: "Nas doses mínimas eficazes dos ISRS, cerca de 80% do SERT fica ocupado.",
      },
      NET: {
        name: "Transportador de noradrenalina (NET)",
        what: "Recolhe a noradrenalina. No córtex pré-frontal, onde quase não há transportador de dopamina, recolhe também a dopamina.",
        action: "O remédio bloqueia o transportador.",
        good: "Mais noradrenalina (e dopamina no pré-frontal): energia, atenção e efeito na dor crônica.",
        bad: "Sudorese, taquicardia, aumento da pressão, boca seca, retenção urinária e insônia.",
        clinic: "É o segundo alvo dos IRSN (duloxetina; venlafaxina em doses mais altas) e o principal da nortriptilina.",
      },
      DAT: {
        name: "Transportador de dopamina (DAT)",
        what: "Recolhe a dopamina, sobretudo no estriado e no núcleo accumbens (circuito de recompensa).",
        action: "O remédio bloqueia o transportador.",
        good: "Mais dopamina: energia e motivação.",
        bad: "Bloqueio forte e rápido traz potencial de abuso (é o mecanismo da cocaína); insônia e ansiedade.",
        clinic: "A bupropiona ocupa só cerca de 25% do DAT nas doses clínicas; a sertralina também se liga um pouco.",
      },
      MAO: {
        name: "Monoamino-oxidase (MAO)",
        what: "Enzima que degrada serotonina, noradrenalina e dopamina dentro do neurônio, e a tiramina dos alimentos no intestino e no fígado.",
        action: "O remédio inibe a enzima: de forma irreversível e nos dois tipos (A e B) na tranilcipromina; de forma reversível e seletiva para a MAO-A na moclobemida.",
        good: "Sobram as três monoaminas: antidepressivo potente, útil na depressão resistente e na atípica.",
        bad: "Crise hipertensiva com alimentos ricos em tiramina e com simpaticomiméticos; síndrome serotoninérgica com outros serotoninérgicos; hipotensão postural.",
        clinic: "Exige dieta e intervalo nas trocas (ver Troca de medicamentos).",
      },
      A2: {
        name: "Receptor adrenérgico α2",
        what: "Freio do próprio neurônio: quando a noradrenalina o ativa, diminui a liberação de noradrenalina e de serotonina.",
        action: "O remédio bloqueia o receptor (antagonismo).",
        good: "Solta o freio: mais noradrenalina e serotonina. É o mecanismo principal da mirtazapina.",
        bad: "Pouco relevante isoladamente.",
        clinic: "A mirtazapina soma o bloqueio de α2, H1 e 5-HT2C: melhora sono e apetite, com pouca disfunção sexual.",
      },
      "5HT2A": HT2A(
        "Trazodona, mirtazapina e alguns tricíclicos bloqueiam o 5-HT2A.",
        "Sono mais profundo, menos ansiedade e menos disfunção sexual do que o excesso de serotonina causaria nesse receptor.",
        "Parte do motivo de a trazodona ser usada em dose baixa para insônia."
      ),
      "5HT2C": {
        name: "Receptor de serotonina 5-HT2C",
        what: "Receptor que freia a liberação de dopamina e noradrenalina no pré-frontal e participa do controle do apetite.",
        action: "Fluoxetina, mirtazapina, agomelatina e alguns tricíclicos o bloqueiam.",
        good: "Solta dopamina e noradrenalina no córtex: efeito ativador e antidepressivo.",
        bad: "Mais apetite e peso (mirtazapina) ou ativação e insônia (fluoxetina), conforme o restante do perfil.",
        clinic: "Ajuda a explicar por que a fluoxetina costuma ser tomada pela manhã.",
      },
      H1: H1("Sono, quando a insônia faz parte do quadro.", "Tricíclicos (sobretudo amitriptilina), mirtazapina e trazodona sedam e podem aumentar o peso."),
      M1: M1("Tricíclicos são os mais anticolinérgicos; evitar em idosos, no glaucoma de ângulo fechado e na hipertrofia de próstata."),
      A1: A1("Tricíclicos e trazodona causam hipotensão postural: risco de quedas em idosos."),
      NMDA: NMDA(
        "A escetamina bloqueia o canal NMDA.",
        "Leva a um surto de glutamato que ativa receptores AMPA e forma novas sinapses: efeito antidepressivo em horas, não semanas.",
        "Dissociação, aumento da pressão arterial, sedação e potencial de abuso.",
        "A escetamina intranasal é aplicada no serviço de saúde, com observação após cada dose."
      ),
      SIGMA: {
        name: "Receptor sigma-1",
        what: "Proteína do retículo endoplasmático que ajusta canais iônicos e a resposta da célula ao estresse. Não é um receptor de neurotransmissor clássico.",
        action: "A fluvoxamina é agonista; a sertralina também se liga.",
        good: "Pode contribuir para o efeito ansiolítico e na insônia.",
        bad: "Na fluvoxamina, pode contribuir para a sedação.",
        clinic: "Também é alvo do dextrometorfano (associado à bupropiona no tratamento da depressão).",
      },
    },
    estabilizadores: {
      NA: {
        name: "Canais de sódio voltagem-dependentes",
        what: "Canais que se abrem quando o neurônio dispara e permitem o potencial de ação.",
        action: "Carbamazepina, oxcarbazepina e lamotrigina os bloqueiam; o valproato, em parte.",
        good: "Menos disparos repetitivos: efeito anticonvulsivante e estabilizador do humor.",
        bad: "Tontura, desequilíbrio e visão dupla, sobretudo com a carbamazepina.",
        clinic: "Os sintomas de excesso (ataxia, visão dupla) ajudam a reconhecer nível alto de carbamazepina.",
      },
      CA: {
        name: "Canais de cálcio",
        what: "Canais que deixam o cálcio entrar no terminal do neurônio e disparam a liberação do neurotransmissor.",
        action: "O remédio reduz a entrada de cálcio.",
        good: "Menos liberação de neurotransmissor excitatório.",
        bad: "Tontura e sedação.",
        clinic: "Mecanismo secundário de alguns anticonvulsivantes.",
      },
      GLU: {
        name: "Liberação de glutamato",
        what: "O glutamato é o principal neurotransmissor excitatório do cérebro.",
        action: "A lamotrigina reduz a liberação de glutamato (pelo bloqueio dos canais de sódio).",
        good: "Menos excitação; a lamotrigina é útil sobretudo para prevenir a depressão bipolar.",
        bad: "Os efeitos adversos vêm de outros mecanismos (o rash da lamotrigina é imunológico).",
        clinic: "Titulação lenta da lamotrigina para reduzir o risco de rash grave.",
      },
      GABA: {
        name: "GABA",
        what: "Principal neurotransmissor inibitório do cérebro.",
        action: "O valproato aumenta o GABA (mais síntese e menos degradação).",
        good: "Mais inibição: efeito antimaníaco e anticonvulsivante.",
        bad: "Sedação e tremor.",
        clinic: "O valproato tem outros mecanismos (canais de sódio, sinalização intracelular).",
      },
      INTRA: {
        name: "Sinalização dentro da célula",
        what: "Vias de segundos mensageiros (inositol, enzima GSK-3, proteína quinase C) que regulam genes e a sobrevivência do neurônio.",
        action: "O lítio inibe a GSK-3 e a reciclagem do inositol.",
        good: "Estabilização do humor, redução do risco de suicídio e possível efeito neuroprotetor. O efeito contra o suicídio foi questionado por uma metanálise de 2022 (Nabi e colaboradores), mas a reanálise de Ghaemi (2024), juntando os ensaios, sustenta o benefício.",
        bad: "Os efeitos do lítio dependem do nível no sangue: tremor, poliúria e sede, hipotireoidismo, alterações renais; toxicidade com nível alto.",
        clinic: "Por isso o lítio exige dosagem de nível sérico, função renal e da tireoide (ver Nível sérico).",
      },
    },
    ansioliticos: {
      A1: {
        name: "Receptor GABA-A com subunidade α1",
        what: "O GABA-A é um canal de cloreto aberto pelo GABA, que inibe o neurônio. A subunidade α do receptor define o efeito; a α1 predomina no córtex e no tálamo.",
        action: "Benzodiazepínicos e drogas Z aumentam o efeito do GABA (modulação alostérica positiva).",
        good: "Sono e efeito anticonvulsivante.",
        bad: "Sedação, amnésia e quedas; tolerância, dependência e retirada.",
        clinic: "As drogas Z (zolpidem, eszopiclona) preferem a α1: são hipnóticas, com pouco efeito ansiolítico.",
      },
      A23: {
        name: "Receptor GABA-A com subunidades α2 e α3",
        what: "Subtipos do GABA-A mais presentes no sistema límbico e na medula.",
        action: "Benzodiazepínicos aumentam o efeito do GABA neles.",
        good: "Efeito ansiolítico e relaxamento muscular.",
        bad: "Contribuem para a dependência.",
        clinic: "Explica o uso de benzodiazepínicos em crises de ansiedade e espasmo muscular.",
      },
      A5: {
        name: "Receptor GABA-A com subunidade α5",
        what: "Subtipo do GABA-A concentrado no hipocampo.",
        action: "Benzodiazepínicos aumentam o efeito do GABA nele.",
        good: "Nenhum efeito terapêutico importante.",
        bad: "Prejuízo de memória e de aprendizado.",
        clinic: "Uma das razões para evitar benzodiazepínicos de uso prolongado em idosos.",
      },
      A2D: {
        name: "Subunidade α2δ dos canais de cálcio",
        what: "Parte dos canais de cálcio do terminal do neurônio que controla a entrada de cálcio.",
        action: "Pregabalina e gabapentina se ligam a ela e diminuem a entrada de cálcio.",
        good: "Menos liberação de glutamato: efeito ansiolítico, analgesia na dor neuropática e melhora do sono.",
        bad: "Tontura, sedação, ganho de peso; potencial de uso indevido e sintomas de retirada.",
        clinic: "Associada a opioides, soma depressão respiratória.",
      },
      HT1A: HT1A(
        "A buspirona é agonista parcial.",
        "Efeito ansiolítico sem sedação e sem dependência.",
        "Leva semanas para agir: não serve para a crise aguda."
      ),
      MT: {
        name: "Receptores de melatonina MT1 e MT2",
        what: "Receptores do núcleo supraquiasmático, o relógio biológico do hipotálamo; a melatonina sinaliza que é noite.",
        action: "A melatonina de liberação prolongada os estimula.",
        good: "Ajuda a iniciar o sono e a ajustar o ritmo circadiano.",
        bad: "Poucos: cefaleia e sonolência leves.",
        clinic: "Opção para idosos com insônia, sem risco de dependência.",
      },
      OX: {
        name: "Receptores de orexina OX1 e OX2",
        what: "A orexina (hipocretina), produzida no hipotálamo lateral, mantém a vigília; falta dela causa narcolepsia.",
        action: "Suvorexanto e daridorexanto bloqueiam os dois receptores.",
        good: "Desliga o sinal de vigília sem agir no GABA: sono com pouco risco de dependência.",
        bad: "Sonolência no dia seguinte, sonhos vívidos; raramente paralisia do sono.",
        clinic: "Contraindicados na narcolepsia.",
      },
      H1: H1("Em dose baixa, a doxepina bloqueia quase só o H1: ajuda a manter o sono.", "Em dose antidepressiva, a doxepina age em muitos outros receptores."),
    },
    estimulantes: {
      DAT: {
        name: "Transportador de dopamina (DAT)",
        what: "Recolhe a dopamina, sobretudo no estriado e no núcleo accumbens.",
        action: "O metilfenidato bloqueia o transportador.",
        good: "Mais dopamina: atenção, motivação e controle dos impulsos.",
        bad: "Insônia, perda de apetite, ansiedade; potencial de abuso, maior nas formas de ação imediata.",
        clinic: "As formulações de liberação prolongada sobem devagar e reduzem o potencial de abuso.",
      },
      NET: {
        name: "Transportador de noradrenalina (NET)",
        what: "Recolhe a noradrenalina; no pré-frontal, recolhe também a dopamina.",
        action: "Atomoxetina e metilfenidato bloqueiam o transportador.",
        good: "Mais noradrenalina e dopamina no pré-frontal: atenção e funções executivas.",
        bad: "Aumento da frequência cardíaca e da pressão, perda de apetite.",
        clinic: "A atomoxetina age quase só aqui: não é estimulante e tem baixo potencial de abuso.",
      },
      REL: {
        name: "Liberação de dopamina e noradrenalina",
        what: "Mecanismo das anfetaminas: entram no neurônio pelos transportadores e esvaziam as vesículas (VMAT2), fazendo os transportadores funcionarem ao contrário.",
        action: "O remédio força a liberação de dopamina e noradrenalina, independentemente do disparo do neurônio.",
        good: "Efeito forte na atenção.",
        bad: "Maior potencial de abuso, insônia, perda de apetite, aumento da pressão.",
        clinic: "A lisdexanfetamina é um pró-fármaco ativado no sangue: início mais suave e menos abuso.",
      },
      A2A: {
        name: "Receptor adrenérgico α2A",
        what: "Receptor da noradrenalina nos neurônios do pré-frontal, que fortalece o sinal das redes da atenção; no tronco cerebral, baixa a pressão.",
        action: "Guanfacina e clonidina o estimulam (agonistas).",
        good: "Atenção, controle de impulsos e agressividade, sem potencial de abuso.",
        bad: "Sedação, hipotensão e bradicardia.",
        clinic: "Não suspender de repente: risco de hipertensão de rebote.",
      },
    },
    demencias: {
      ACHE: {
        name: "Acetilcolinesterase (AChE)",
        what: "Enzima que degrada a acetilcolina na sinapse. No Alzheimer, faltam neurônios colinérgicos (núcleo basal de Meynert).",
        action: "Donepezila, rivastigmina e galantamina inibem a enzima.",
        good: "Sobra acetilcolina: pequena melhora da cognição e do funcionamento.",
        bad: "Náusea, vômito, diarreia, perda de peso, pesadelos; bradicardia e síncope (vigiar o pulso).",
        clinic: "Cuidado com betabloqueadores e bradicardia (ver a tela da classe).",
      },
      BUCHE: {
        name: "Butirilcolinesterase (BuChE)",
        what: "Outra enzima que degrada a acetilcolina; ganha importância com a progressão do Alzheimer.",
        action: "A rivastigmina inibe também esta enzima.",
        good: "Soma ao efeito sobre a acetilcolina.",
        bad: "Pode contribuir para os efeitos gastrointestinais.",
        clinic: "O adesivo de rivastigmina dá menos náusea que a forma oral.",
      },
      NIC: {
        name: "Receptor nicotínico",
        what: "Receptor da acetilcolina que é um canal iônico; importante para atenção e memória.",
        action: "A galantamina reforça o efeito da acetilcolina nele (modulação alostérica positiva).",
        good: "Soma ao efeito anticolinesterásico.",
        bad: "Os mesmos efeitos colinérgicos da classe.",
        clinic: "É o que diferencia a galantamina dos outros anticolinesterásicos.",
      },
      NMDA: NMDA(
        "A memantina bloqueia o canal NMDA só quando ele fica aberto em excesso, com baixa a moderada afinidade.",
        "Reduz o \"ruído\" do glutamato em excesso e preserva o sinal normal: pequeno benefício na demência moderada a grave.",
        "Tontura, cefaleia, constipação e, às vezes, confusão.",
        "Ajustar a dose na insuficiência renal."
      ),
    },
    dependencia: {
      MU: {
        name: "Receptor opioide μ",
        what: "Receptor das endorfinas e dos opioides: alivia a dor, dá euforia e deprime a respiração. Na área tegmentar ventral, libera dopamina no accumbens.",
        action: "A metadona é agonista total, a buprenorfina é agonista parcial e a naltrexona é antagonista.",
        good: "Agonistas: evitam abstinência e fissura. Antagonista: bloqueia o efeito do opioide e reduz o reforço do álcool.",
        bad: "Agonistas: sedação e depressão respiratória (maior com a metadona e com benzodiazepínicos). Naltrexona: precipita abstinência em quem usa opioide.",
        clinic: "A buprenorfina tem efeito teto na respiração, por ser agonista parcial (ver a tela da classe).",
      },
      NIC: {
        name: "Receptor nicotínico α4β2",
        what: "Receptor da nicotina nos neurônios de dopamina da área tegmentar ventral: é por ele que o cigarro dá prazer e cria dependência.",
        action: "A vareniclina é agonista parcial.",
        good: "Estimula um pouco (menos fissura e abstinência) e ocupa o receptor (menos prazer ao fumar).",
        bad: "Náusea, sonhos vívidos e insônia.",
        clinic: "Começar 1 a 2 semanas antes da data marcada para parar.",
      },
      GLU: {
        name: "Equilíbrio glutamato e GABA",
        what: "Anos de álcool deixam o sistema glutamatérgico hiperativo e o GABA enfraquecido, o que sustenta a abstinência prolongada.",
        action: "O acamprosato modula a transmissão glutamatérgica (NMDA).",
        good: "Reduz o desconforto da abstinência prolongada e ajuda a manter a abstinência.",
        bad: "Diarreia.",
        clinic: "Excreção renal: ajustar ou evitar na insuficiência renal; pode ser usado em hepatopatas.",
      },
      ALDH: {
        name: "Aldeído desidrogenase (ALDH)",
        what: "Enzima do fígado que transforma o acetaldeído (tóxico) em acetato no metabolismo do álcool.",
        action: "O dissulfiram inibe a enzima.",
        good: "Com álcool, o acetaldeído se acumula e causa uma reação desagradável: funciona como dissuasão.",
        bad: "Reação com álcool: rubor, náusea, taquicardia, hipotensão; pode ser grave. Hepatotoxicidade.",
        clinic: "Só com consentimento e motivação; o paciente deve evitar álcool também em alimentos e produtos.",
      },
      DANE: {
        name: "Recaptação de dopamina e noradrenalina",
        what: "Transportadores que recolhem dopamina e noradrenalina.",
        action: "A bupropiona bloqueia os dois.",
        good: "No tabagismo, reduz a fissura e os sintomas de abstinência da nicotina.",
        bad: "Insônia, boca seca; baixa o limiar convulsivo.",
        clinic: "Começar cerca de 1 a 2 semanas antes de parar de fumar.",
      },
    },
  };
})();
