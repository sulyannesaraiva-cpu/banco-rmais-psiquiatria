/* Dados do simulador de psicofarmacologia (antipsicóticos). Material didático e simplificado:
   não serve para prescrição.
   - receptors: nível qualitativo de afinidade, 0 = desprezível, 1 = fraca, 2 = moderada,
     3 = forte, 4 = muito forte. "pa" marca agonismo parcial; o resto é antagonismo. Níveis
     resumidos de dados de afinidade (Ki) publicados e conferidos com o mecanismo descrito em
     Stahl, Prescriber's Guide 8ª ed. (2024).
   - effects: incidência/gravidade relativa, 0 = muito baixa, 1 = baixa, 2 = moderada, 3 = alta,
     conforme Maudsley Prescribing Guidelines 15ª ed., tabela 1.7 ("rough guide").
   - extra: outras ações relevantes, em texto curto.
   - search: termos para achar as questões do banco que citam o remédio. */

window.PHARMA_SIM = window.PHARMA_SIM || {};
window.PHARMA_SIM.antipsicoticos = {
  id: "antipsicoticos",
  label: "Antipsicóticos",
  tagline: "Como o perfil de receptores explica o efeito e os efeitos colaterais dos antipsicóticos.",
  source: "Afinidades em níveis qualitativos, conferidas com Stahl (Prescriber's Guide, 8ª ed.); efeitos relativos conforme Maudsley Prescribing Guidelines (15ª ed., tabela 1.7).",
  defaults: { drug: "haloperidol", a: "olanzapina", b: "aripiprazol" },
  receptors: [
    { id: "D2", label: "D2", role: "Antipsicótico; em excesso, extrapiramidais e prolactina" },
    { id: "5HT2A", label: "5-HT2A", role: "Libera dopamina no córtex e no estriado: menos extrapiramidais" },
    { id: "5HT1A", label: "5-HT1A", role: "Agonismo parcial: humor, ansiedade, menos extrapiramidais" },
    { id: "H1", label: "H1", role: "Sedação e ganho de peso" },
    { id: "M1", label: "M1", role: "Boca seca, constipação, visão turva, confusão" },
    { id: "A1", label: "α1", role: "Hipotensão postural, tontura" },
  ],
  effects: [
    { id: "sedation", label: "Sedação", why: "bloqueio H1 (e α1)" },
    { id: "weight", label: "Ganho de peso", why: "bloqueio H1 e 5-HT2C" },
    { id: "akathisia", label: "Acatisia", why: "ação em D2, inclusive nos agonistas parciais" },
    { id: "parkinsonism", label: "Parkinsonismo", why: "bloqueio D2 na via nigroestriatal" },
    { id: "anticholinergic", label: "Anticolinérgico", why: "bloqueio M1" },
    { id: "hypotension", label: "Hipotensão", why: "bloqueio α1" },
    { id: "prolactin", label: "Prolactina", why: "bloqueio D2 na via tuberoinfundibular" },
    { id: "qt", label: "Aumento do QT", why: "canais de potássio cardíacos, não um receptor do cérebro" },
  ],
  drugs: [
    {
      id: "haloperidol", name: "Haloperidol", generation: 1, search: ["haloperidol"],
      receptors: { D2: 4, "5HT2A": 1, "5HT1A": 0, H1: 0, M1: 0, A1: 2 },
      effects: { sedation: 1, weight: 1, akathisia: 3, parkinsonism: 3, anticholinergic: 0, hypotension: 1, prolactin: 3, qt: 2 },
      extra: "Bloqueador D2 de alta potência, quase sem outras ações.",
    },
    {
      id: "flufenazina", name: "Flufenazina", generation: 1, search: ["flufenazina"],
      receptors: { D2: 4, "5HT2A": 2, "5HT1A": 0, H1: 2, M1: 0, A1: 2 },
      effects: { sedation: 1, weight: 1, akathisia: 2, parkinsonism: 3, anticholinergic: 1, hypotension: 1, prolactin: 3, qt: 1 },
      extra: "Fenotiazina de alta potência; tem forma de depósito.",
    },
    {
      id: "clorpromazina", name: "Clorpromazina", generation: 1, search: ["clorpromazina"],
      receptors: { D2: 3, "5HT2A": 3, "5HT1A": 0, H1: 4, M1: 3, A1: 4 },
      effects: { sedation: 3, weight: 2, akathisia: 1, parkinsonism: 2, anticholinergic: 2, hypotension: 3, prolactin: 2, qt: 2 },
      extra: "Baixa potência: muitas ações além de D2, por isso seda e baixa a pressão.",
    },
    {
      id: "amissulprida", name: "Amissulprida", generation: 2, search: ["amissulprida", "amisulprida"],
      receptors: { D2: 4, "5HT2A": 0, "5HT1A": 0, H1: 0, M1: 0, A1: 0 },
      effects: { sedation: 0, weight: 1, akathisia: 1, parkinsonism: 1, anticholinergic: 0, hypotension: 0, prolactin: 3, qt: 2 },
      extra: "Seletiva para D2 e D3. Em dose baixa age mais nos receptores pré-sinápticos; também bloqueia 5-HT7.",
    },
    {
      id: "risperidona", name: "Risperidona", generation: 2, search: ["risperidona"],
      receptors: { D2: 4, "5HT2A": 4, "5HT1A": 1, H1: 2, M1: 0, A1: 4 },
      effects: { sedation: 1, weight: 2, akathisia: 2, parkinsonism: 1, anticholinergic: 0, hypotension: 2, prolactin: 3, qt: 1 },
      extra: "Atípico que mais eleva prolactina, com dose-dependência de extrapiramidais.",
    },
    {
      id: "paliperidona", name: "Paliperidona", generation: 2, search: ["paliperidona"],
      receptors: { D2: 4, "5HT2A": 4, "5HT1A": 1, H1: 2, M1: 0, A1: 3 },
      effects: { sedation: 1, weight: 2, akathisia: 2, parkinsonism: 1, anticholinergic: 0, hypotension: 2, prolactin: 3, qt: 1 },
      extra: "Metabólito ativo da risperidona (9-hidroxirrisperidona); tem forma de depósito.",
    },
    {
      id: "olanzapina", name: "Olanzapina", generation: 2, search: ["olanzapina"],
      receptors: { D2: 3, "5HT2A": 4, "5HT1A": 0, H1: 4, M1: 3, A1: 2 },
      effects: { sedation: 3, weight: 3, akathisia: 1, parkinsonism: 0, anticholinergic: 1, hypotension: 1, prolactin: 1, qt: 1 },
      extra: "Também bloqueia 5-HT2C, o que soma ao ganho de peso e às alterações metabólicas.",
    },
    {
      id: "quetiapina", name: "Quetiapina", generation: 2, search: ["quetiapina"],
      receptors: { D2: 1, "5HT2A": 2, "5HT1A": 1, H1: 4, M1: 1, A1: 3 },
      effects: { sedation: 3, weight: 2, akathisia: 1, parkinsonism: 0, anticholinergic: 1, hypotension: 2, prolactin: 0, qt: 2 },
      extra: "D2 fraco e de saída rápida. O metabólito norquetiapina inibe a recaptação de noradrenalina.",
    },
    {
      id: "clozapina", name: "Clozapina", generation: 2, search: ["clozapina"],
      receptors: { D2: 1, "5HT2A": 4, "5HT1A": 1, H1: 4, M1: 4, A1: 4 },
      effects: { sedation: 3, weight: 3, akathisia: 0, parkinsonism: 0, anticholinergic: 3, hypotension: 3, prolactin: 0, qt: 3 },
      extra: "D2 fraco e muitas outras ações. Sialorreia, convulsões e agranulocitose não se explicam por este perfil.",
    },
    {
      id: "ziprasidona", name: "Ziprasidona", generation: 2, search: ["ziprasidona"],
      receptors: { D2: 3, "5HT2A": 4, "5HT1A": 3, H1: 2, M1: 0, A1: 2 },
      effects: { sedation: 1, weight: 0, akathisia: 1, parkinsonism: 0, anticholinergic: 0, hypotension: 1, prolactin: 0, qt: 2 },
      extra: "Agonista parcial 5-HT1A e inibe fracamente a recaptação de serotonina e noradrenalina.",
      pa: ["5HT1A"],
    },
    {
      id: "lurasidona", name: "Lurasidona", generation: 2, search: ["lurasidona"],
      receptors: { D2: 4, "5HT2A": 4, "5HT1A": 3, H1: 0, M1: 0, A1: 1 },
      effects: { sedation: 1, weight: 1, akathisia: 1, parkinsonism: 1, anticholinergic: 0, hypotension: 0, prolactin: 0, qt: 0 },
      extra: "Bloqueio potente de 5-HT7; quase sem H1 e M1, por isso pouco peso e pouca sedação.",
      pa: ["5HT1A"],
    },
    {
      id: "aripiprazol", name: "Aripiprazol", generation: 2, search: ["aripiprazol"],
      receptors: { D2: 4, "5HT2A": 3, "5HT1A": 3, H1: 2, M1: 0, A1: 2 },
      effects: { sedation: 0, weight: 1, akathisia: 1, parkinsonism: 0, anticholinergic: 0, hypotension: 0, prolactin: 0, qt: 0 },
      extra: "Agonista parcial D2: baixa a dopamina onde ela sobra e sobe onde falta. Pode até reduzir a prolactina.",
      pa: ["D2", "5HT1A"],
    },
    {
      id: "cariprazina", name: "Cariprazina", generation: 2, search: ["cariprazina"],
      receptors: { D2: 4, "5HT2A": 2, "5HT1A": 3, H1: 2, M1: 0, A1: 1 },
      effects: { sedation: 0, weight: 1, akathisia: 1, parkinsonism: 0, anticholinergic: 0, hypotension: 0, prolactin: 0, qt: 0 },
      extra: "Agonista parcial D2 e, com preferência, D3 (efeito discutido sobre sintomas negativos).",
      pa: ["D2", "5HT1A"],
    },
    {
      id: "brexpiprazol", name: "Brexpiprazol", generation: 2, search: ["brexpiprazol", "brexpiprazole"],
      receptors: { D2: 4, "5HT2A": 4, "5HT1A": 4, H1: 2, M1: 0, A1: 3 },
      effects: { sedation: 0, weight: 1, akathisia: 1, parkinsonism: 0, anticholinergic: 0, hypotension: 0, prolactin: 0, qt: 0 },
      extra: "Agonista parcial D2 com atividade intrínseca menor que a do aripiprazol, agonista parcial 5-HT1A e bloqueador potente de 5-HT2A.",
      pa: ["D2", "5HT1A"],
    },
    {
      id: "asenapina", name: "Asenapina", generation: 2, search: ["asenapina", "asenapine"],
      receptors: { D2: 3, "5HT2A": 4, "5HT1A": 2, H1: 3, M1: 0, A1: 3 },
      effects: { sedation: 1, weight: 1, akathisia: 1, parkinsonism: 1, anticholinergic: 0, hypotension: 0, prolactin: 1, qt: 0 },
      extra: "Comprimido sublingual (engolido, quase não é absorvido): não comer nem beber logo depois. Dormência na boca e alteração do paladar. Também bloqueia 5-HT2C, 5-HT7 e α2.",
      pa: ["5HT1A"],
    },
  ],
  /* Efeitos extrapiramidais: Maudsley 15ª ed., tabela 1.28 (sinais, escalas, prevalência, tempo e
     tratamento) e notas do algoritmo da acatisia. from/to: janela em horas para a linha do tempo. */
  eps: [
    {
      id: "distonia", name: "Distonia aguda", color: "#d55e00", from: 0.2, to: 120, when: "Horas depois de iniciar (minutos se IM ou IV)",
      signs: "Espasmo muscular: olhos virados para cima (crise oculógira), pescoço torcido (torcicolo), dificuldade para engolir ou falar; em casos extremos, arqueamento das costas ou luxação da mandíbula. Dói e assusta.",
      risk: "Cerca de 10%; mais em homens jovens, em quem nunca usou antipsicótico e com alta potência (haloperidol). Rara em idosos.",
      scale: "Sem escala específica (parte das escalas gerais de extrapiramidais).",
      steps: ["Anticolinérgico (ex.: biperideno) oral, IM ou IV conforme a gravidade.", "Lembrar que o paciente pode não conseguir engolir.", "Resposta em ~5 minutos (IV) ou ~20 minutos (IM)."],
      caution: "Pior com antipsicótico de alta potência no início do tratamento.",
      effect: "parkinsonism",
    },
    {
      id: "acatisia", name: "Acatisia", color: "#e69f00", from: 1, to: 1008, when: "Horas a semanas depois de iniciar ou aumentar a dose",
      signs: "Inquietação interna desagradável, com vontade de se mexer: bate o pé sentado, cruza e descruza as pernas, troca o peso de um pé para o outro, anda de um lado para o outro.",
      risk: "Cerca de 25% com primeira geração, menos com segunda; menor com olanzapina, quetiapina e clozapina.",
      scale: "Escala de Acatisia de Barnes (BARS).",
      steps: ["Reduzir a dose do antipsicótico.", "Trocar por um com menos acatisia.", "Propranolol em dose baixa (30–80 mg/dia), clonazepam em dose baixa ou um antagonista 5-HT2 (mirtazapina, trazodona, ciproeptadina, mianserina) — fora de bula.", "Avaliar cada opção por cerca de 1 mês."],
      caution: "Confundida com agitação psicótica; associada a ideação suicida e agressividade. Anticolinérgicos em geral não ajudam.",
      effect: "akathisia",
    },
    {
      id: "parkinsonismo", name: "Parkinsonismo", color: "#0072b2", from: 48, to: 1344, when: "Dias a semanas depois de iniciar ou aumentar a dose",
      signs: "Tremor, rigidez, bradicinesia (pouca expressão facial, voz monótona, lentidão), bradifrenia (pensamento lento) e sialorreia.",
      risk: "Cerca de 20%; mais em mulheres idosas e com lesão neurológica prévia (TCE, AVC).",
      scale: "Escala de Simpson-Angus.",
      steps: ["Reduzir a dose do antipsicótico.", "Trocar por um com menos parkinsonismo.", "Anticolinérgico, de dia (os sintomas somem no sono), revisando a cada 3 meses: a maioria não precisa dele por muito tempo."],
      caution: "Confundido com depressão ou com sintomas negativos.",
      effect: "parkinsonism",
    },
    {
      id: "discinesia", name: "Discinesia tardia", color: "#b0418a", from: 2160, to: 43800, when: "Meses a anos de tratamento",
      signs: "Movimentos involuntários: estalar ou mastigar com os lábios, protrusão da língua, movimentos de dedos 'tocando piano', movimentos coreoatetoides; pioram com estresse.",
      risk: "Cerca de 5% por ano de exposição; mais com idade, transtorno afetivo, doses altas e extrapiramidais agudos no início. Menos com segunda geração.",
      scale: "AIMS (Abnormal Involuntary Movement Scale).",
      steps: ["Suspender o anticolinérgico, se houver.", "Reduzir a dose do antipsicótico.", "Trocar por um com menos risco: a clozapina é a mais associada à melhora (quetiapina também pode ajudar).", "Valbenazina ou deutetrabenazina como adjuvantes; ECT e toxina botulínica em casos graves."],
      caution: "Anticolinérgicos pioram. Nem sempre reverte ao parar o antipsicótico.",
      effect: null,
    },
  ],
  cases: [
    {
      prompt: "Homem jovem, horas depois de haloperidol IM: olhos virados para cima e pescoço torcido. Qual a conduta?",
      options: ["Anticolinérgico IM ou IV (ex.: biperideno)", "Propranolol oral", "Aumentar o haloperidol", "Valbenazina"],
      correct: 0,
      explain: "Distonia aguda: anticolinérgico por via parenteral, já que pode não conseguir engolir. Melhora em ~5 minutos (IV) ou ~20 minutos (IM).",
    },
    {
      prompt: "Uma semana depois de aumentar a dose: inquietação interna, não consegue ficar sentado, cruza e descruza as pernas. Qual o quadro?",
      options: ["Acatisia", "Piora da psicose", "Distonia aguda", "Discinesia tardia"],
      correct: 0,
      explain: "Acatisia é confundida com agitação psicótica e se associa a ideação suicida e agressividade. Aumentar o antipsicótico pioraria.",
    },
    {
      prompt: "A acatisia persiste depois de reduzir a dose. Qual remédio pode ajudar?",
      options: ["Propranolol em dose baixa", "Biperideno", "Haloperidol", "Metoclopramida"],
      correct: 0,
      explain: "Propranolol 30–80 mg/dia, clonazepam em dose baixa ou antagonistas 5-HT2 (mirtazapina, trazodona). Anticolinérgicos em geral não ajudam na acatisia.",
    },
    {
      prompt: "Discinesia tardia em quem usa biperideno todos os dias. Qual o primeiro passo?",
      options: ["Suspender o anticolinérgico", "Dobrar o anticolinérgico", "Somar haloperidol", "Somar metoclopramida"],
      correct: 0,
      explain: "Anticolinérgicos pioram a discinesia tardia. Depois, reduzir o antipsicótico ou trocar (clozapina é a mais associada à melhora); valbenazina ou deutetrabenazina como adjuvantes.",
    },
    {
      prompt: "Qual antipsicótico mais se associa à melhora da discinesia tardia?",
      options: ["Clozapina", "Haloperidol", "Flufenazina", "Risperidona"],
      correct: 0,
      explain: "A clozapina é a mais associada à resolução dos sintomas; a quetiapina também pode ajudar.",
    },
    {
      prompt: "Idosa, 3 semanas após iniciar risperidona: rigidez, tremor, rosto inexpressivo e voz monótona. Parece deprimida. Hipótese?",
      options: ["Parkinsonismo induzido", "Depressão", "Discinesia tardia", "Distonia aguda"],
      correct: 0,
      explain: "O parkinsonismo aparece em dias a semanas, é mais comum em mulheres idosas e é confundido com depressão ou sintomas negativos.",
    },
    {
      prompt: "No parkinsonismo induzido, como usar o anticolinérgico?",
      options: ["De dia, revisando a necessidade a cada 3 meses", "À noite, por tempo indeterminado", "Só por via IV", "Sempre junto com o antipsicótico, desde o início"],
      correct: 0,
      explain: "Os sintomas somem durante o sono, então não precisa à noite. A maioria não precisa de anticolinérgico por muito tempo.",
    },
    {
      prompt: "Qual escala avalia a acatisia?",
      options: ["Barnes (BARS)", "AIMS", "Simpson-Angus", "PANSS"],
      correct: 0,
      explain: "Barnes para acatisia, Simpson-Angus para parkinsonismo e AIMS para discinesia tardia.",
    },
  ],
  /* Antipsicóticos de depósito: Maudsley 15ª ed., tabelas 1.8 (doses, intervalos, dose-teste) e
     1.9 (tempo até o pico, meia-vida plasmática, tempo até o equilíbrio), e seções de aripiprazol,
     olanzapina e paliperidona de longa ação. peak e half em dias (valor médio das faixas);
     every em semanas; lag em dias para a risperidona em microesferas (liberação atrasada). */
  depots: [
    {
      id: "haloperidol-dec", name: "Decanoato de haloperidol", drug: "haloperidol", every: 4, peak: 6, half: 21,
      peakText: "3–9 dias", halfText: "21 dias", steady: "~14 semanas",
      dose: "50 a 300 mg a cada 4 semanas", test: "25 mg", oral: "Dose-teste e depois titular; esperar 4 a 10 dias após o teste.",
      note: "Alto risco de extrapiramidais.",
    },
    {
      id: "flufenazina-dec", name: "Decanoato de flufenazina", drug: "flufenazina", every: 2, peak: 1, half: 8.5,
      peakText: "provavelmente dois picos: no dia e ~1 semana depois", halfText: "7–10 dias", steady: "~8 semanas",
      dose: "12,5 mg a cada 2 semanas até 100 mg a cada 2 semanas", test: "12,5 mg", oral: "Dose-teste e depois titular.",
      note: "Alto risco de extrapiramidais.",
    },
    {
      id: "zuclopentixol-dec", name: "Decanoato de zuclopentixol", drug: null, every: 2, peak: 5.5, half: 19,
      peakText: "4–7 dias", halfText: "19 dias", steady: "~12 semanas",
      dose: "200 mg a cada 3 semanas até 600 mg por semana", test: "100 mg", oral: "Dose-teste e depois titular.",
      note: "Alto risco de extrapiramidais.",
    },
    {
      id: "risperidona-microesferas", name: "Risperidona em microesferas", drug: "risperidona", every: 2, peak: 7, half: 4.5, lag: 18,
      peakText: "~28 dias", halfText: "3–6 dias", steady: "~8 semanas",
      dose: "25 a 50 mg a cada 2 semanas", test: "Não precisa (tolerância ao oral antes)", oral: "Manter o oral nas primeiras semanas: a liberação só começa depois de 2 a 3 semanas.",
      note: "Liberação atrasada: sem cobertura oral, há semanas sem remédio.",
    },
    {
      id: "paliperidona-1m", name: "Palmitato de paliperidona mensal", drug: "paliperidona", every: 4, peak: 13, half: 37,
      peakText: "13 dias", halfText: "25–49 dias", steady: "~20 semanas",
      dose: "Ataque: 150 mg no dia 1 e 100 mg no dia 8, no deltoide; depois 50 a 150 mg por mês", test: "Não precisa (resposta prévia a risperidona ou paliperidona oral)", oral: "O oral pode ser suspenso ao iniciar.",
      note: "A dose de ataque leva rápido ao nível terapêutico; a curva abaixo não mostra o ataque.",
    },
    {
      id: "paliperidona-3m", name: "Palmitato de paliperidona trimestral", drug: "paliperidona", every: 13, peak: 25, half: 90,
      peakText: "25 dias", halfText: "84–95 dias (deltoide)", steady: "~52 semanas",
      dose: "175 a 525 mg a cada 3 meses", test: "Não precisa", oral: "Só depois de 4 meses de paliperidona mensal.",
      note: "Não serve para paciente agudamente agitado.",
    },
    {
      id: "aripiprazol-1m", name: "Aripiprazol mensal", drug: "aripiprazol", every: 4, peak: 6, half: 27,
      peakText: "4 dias (deltoide); 5–7 dias (glúteo)", halfText: "27 dias", steady: "~20 semanas",
      dose: "300 a 400 mg por mês", test: "Não precisa (tolerância ao oral antes)", oral: "Aripiprazol oral 10 a 20 mg/dia por 14 dias depois da primeira injeção (sem isso, o nível pode não bastar).",
      note: "Não aumenta a prolactina.",
    },
    {
      id: "olanzapina-pamoato", name: "Pamoato de olanzapina", drug: "olanzapina", every: 4, peak: 4, half: 30,
      peakText: "2–6 dias", halfText: "30 dias", steady: "~12 semanas",
      dose: "150 mg a cada 4 semanas até 300 mg a cada 2 semanas (só no glúteo)", test: "Não precisa (tolerância ao oral antes)", oral: "Efeito já em cerca de 3 dias.",
      note: "Síndrome pós-injeção (delirium e sedação) em menos de 0,1% das injeções, quase sempre na primeira hora: aplicar e observar em serviço de saúde.",
    },
  ],
};
