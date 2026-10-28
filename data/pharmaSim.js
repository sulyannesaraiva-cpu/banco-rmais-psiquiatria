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

window.PHARMA_SIM = {
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
  ],
};
