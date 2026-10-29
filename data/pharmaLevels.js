/* Níveis séricos de antipsicóticos.
   Valores: apêndice de Meyer e Stahl, The Clinical Use of Antipsychotic Plasma Levels (2021):
   limiar terapêutico, ponto de futilidade, nível de alerta laboratorial AGNP/ASCP e relação
   nível–dose oral (ng/mL por mg/dia, nível de vale de 12 h com a dose toda à noite).
   Clozapina: The Clozapine Handbook (Meyer e Stahl, 2019). */

window.PHARMA_AP_LEVELS = {
  drugs: [
    { id: "haloperidol", name: "Haloperidol", threshold: 2.0, futility: 18, alert: 15, ratio: 0.78, maxDose: 20 },
    { id: "flufenazina", name: "Flufenazina", threshold: 1.0, futility: 4.0, alert: 15, ratio: { by: "smoke", fuma: 0.06, nao: 0.09 }, ratioNote: "Não fumante: 0,08 a 0,10 (usado 0,09).", maxDose: 20 },
    { id: "clorpromazina", name: "Clorpromazina", threshold: 6, thresholdText: "3 a 30 (incerto)", futility: 100, alert: 600, ratio: 0.06, maxDose: 1000, note: "O limiar não é bem definido: os estudos antigos sugerem de 3 a 30 ng/mL, e o livro estima cerca de 6 ng/mL por equivalência com o haloperidol (usado na régua). Sem papel como manutenção pela baixa tolerância." },
    { id: "zuclopentixol", name: "Zuclopentixol", threshold: 2.0, futility: 9.0, alert: null, ratio: 0.65, maxDose: 75, note: "No simulador aparece como decanoato; a relação nível–dose é da forma oral." },
    { id: "amissulprida", name: "Amissulprida", threshold: 100, futility: 625, futilityText: "550 a 700", alert: null, ratio: { by: "sex", f: 0.60, m: 0.46 }, maxDose: 1200, note: "Eliminação renal: o nível sobe muito na insuficiência renal." },
    { id: "risperidona", name: "Risperidona", threshold: 15, futility: 112, alert: 120, ratio: 7.0, maxDose: 16, note: "Valores da fração ativa: risperidona + 9-OH-risperidona (paliperidona), que os laboratórios informam juntas. Em metabolizadores normais da CYP2D6, risperidona ÷ 9-OH fica perto de 0,2." },
    { id: "paliperidona", name: "Paliperidona", threshold: 20, futility: 90, alert: 120, ratio: 4.09, maxDose: 12 },
    { id: "olanzapina", name: "Olanzapina", threshold: 23, futility: 150, alert: 100, ratio: { by: "smoke", fuma: 1.43, nao: 2.0 }, maxDose: 20, note: "O fumo induz a CYP1A2: quem fuma precisa de dose maior para o mesmo nível." },
    { id: "clozapina", name: "Clozapina", threshold: 350, futility: 1000, alert: 1000, ratio: { by: "sexSmoke", ff: 0.80, fn: 1.32, mf: 0.67, mn: 1.08 }, maxDose: 900, note: "Acima de 1000 ng/mL a resposta é rara; o maior risco em níveis altos é constipação e íleo, mais que convulsão." },
    { id: "aripiprazol", name: "Aripiprazol", threshold: 110, futility: 500, alert: 1000, ratio: 11.0, maxDose: 30, note: "Não depende de bloqueio D2 acima de 60% (agonista parcial): o raciocínio de ocupação do D2 não se aplica." },
    { id: "brexpiprazol", name: "Brexpiprazol", threshold: 36, futility: null, futilityAtMax: true, alert: 280, ratio: { by: "cyp", em: 18, im: 46 }, maxDose: 4, note: "Ponto de futilidade = nível na dose máxima licenciada (4 mg à noite)." },
    { id: "cariprazina", name: "Cariprazina", threshold: 5.6, futility: null, futilityAtMax: true, alert: 40, ratio: 1.91, maxDose: 6, note: "Valores só da cariprazina, sem os metabólitos (que são a maior parte da fração ativa e quase nenhum laboratório dosa). Ponto de futilidade = nível na dose máxima (6 mg)." },
    { id: "lurasidona", name: "Lurasidona", threshold: 7.2, futility: null, futilityAtMax: true, alert: 120, ratio: 0.18, maxDose: 160, note: "Relação válida com a dose tomada junto de uma refeição de pelo menos 350 kcal à noite. Ponto de futilidade = nível na dose máxima (160 mg)." },
    { id: "asenapina", name: "Asenapina (sublingual)", threshold: 1.0, futility: null, futilityAtMax: true, alert: 10, ratio: { by: "dose", low: 0.15, high: 0.20, cut: 10 }, ratioNote: "0,15 com 5 mg 2x/dia e 0,20 com 10 mg 2x/dia.", maxDose: 20, note: "Ponto de futilidade = nível na dose máxima (10 mg 2x/dia)." },
  ],
  noData: [
    { id: "quetiapina", name: "Quetiapina", text: "Sem valores no livro: a resposta não depende de bloqueio D2 alto e não há estudos de dose fixa que liguem nível e resposta." },
    { id: "ziprasidona", name: "Ziprasidona", text: "Sem valores no livro: faltam estudos de dose fixa que liguem nível e resposta." },
  ],

  rules: [
    { title: "Quando colher", text: "No vale: 12 h depois da última dose oral (dose à noite, colher de manhã), já em equilíbrio, isto é, depois de 5 meias-vidas, contando os metabólitos ativos. Injetável de depósito: de 1 h a 72 h antes da próxima aplicação." },
    { title: "Limiar terapêutico", text: "Nível inicial a buscar. Abaixo dele, a chance de resposta é menor; não confirma falha do remédio." },
    { title: "Ponto de futilidade", text: "Acima dele, menos de 5% dos pacientes respondem a novos aumentos. Alguns toleram níveis mais altos, mas subir mais raramente ajuda." },
    { title: "Alerta do laboratório", text: "Nível de alerta do consenso AGNP/ASCP (em geral, o dobro do topo da faixa de referência): pede reavaliar efeitos adversos. Nem sempre exige reduzir a dose; registrar a decisão." },
    { title: "Adesão", text: "Em quem toma certo, o nível varia até cerca de 30% entre coletas. Queda maior que 50% na mesma dose sugere falha de adesão, desde que horário e dose estejam certos. Um nível baixo isolado pode ser metabolizador rápido: um segundo nível na mesma dose ajuda a separar adesão de cinética." },
  ],

  clozapine: {
    titration: {
      note: "Doses à noite. Esquemas sugeridos pelo Clozapine Handbook; ajustar à tolerância (sedação, hipotensão, taquicardia) e evitar estender por meses. Depois, titular pelo nível de equilíbrio colhido 5 a 7 dias após o último aumento e pela resposta.",
      fast: { label: "Mais rápida (internação)", days: [1, 2, 3, 5, 7, 10, 12, 14, 16], smoker: [25, 50, 100, 150, 200, 250, 300, 350, 400], nonsmoker: [12.5, 25, 50, 75, 100, 125, 150, 175, 200] },
      slow: { label: "Mais lenta (ambulatório)", days: [1, 3, 6, 9, 12, 15, 18, 21, 24], smoker: [25, 50, 100, 150, 200, 250, 300, 350, 400], nonsmoker: [12.5, 25, 50, 75, 100, 125, 150, 175, 200] },
    },
    cards: [
      { title: "Razão clozapina ÷ norclozapina", tone: "low", items: ["Cerca de 1,3 em não fumante sem inibidor nem indutor.", "1,0 ou menos: indutor (fumo, carbamazepina, omeprazol) ou metabolizador ultrarrápido da CYP1A2.", "Acima de 2,0: coleta fora do vale, inibidor (CYP1A2, 2C19, 2D6, 3A4) ou metabolizador lento.", "3,0 ou mais: inibidor forte da CYP1A2 (fluvoxamina, ciprofloxacino, que podem multiplicar o nível por até 10) ou infecção grave.", "O nível da clozapina sozinha se relaciona melhor com a resposta que a soma com a norclozapina."] },
      { title: "Fumo e infecção", tone: "warn", items: ["Quem induz a CYP1A2 é a fumaça, não a nicotina: ao parar de fumar ou trocar por cigarro eletrônico, a indução some em cerca de 1 semana e o nível pode subir 50% ou mais.", "Infecção bacteriana ou viral grave inibe a CYP1A2 pelas citocinas: o nível pode triplicar. Dosar e vigiar sinais de intoxicação em toda internação por infecção."] },
      { title: "Miocardite", tone: "high", items: ["Até 3% dos pacientes, quase sempre nas primeiras 6 semanas; fatal se não for reconhecida e a clozapina não for suspensa.", "Pensar nela diante de febre sem causa, mal-estar ou quadro gripal (sobretudo com dor no peito); 20% não têm febre.", "Pedir troponina e PCR juntas: troponina acima de 2 vezes o limite superior em mais de 90% dos casos; PCR acima de 100 mg/L ajuda nos casos com troponina normal.", "Febre isolada nas primeiras 8 semanas (20%) costuma ser benigna e não obriga a parar de vez."] },
      { title: "Constipação", tone: "high", items: ["O trânsito colônico fica cerca de 4 vezes mais lento; íleo pode ser fatal.", "O tratamento começa junto com a clozapina: laxativo desde o início e retirar outros anticolinérgicos e constipantes.", "Mesmo com laxativos de primeira linha combinados, 20 a 50% seguem constipados: considerar secretagogos (lubiprostona, linaclotida) ou prucaloprida.", "É o principal limite de segurança para subir o nível."] },
      { title: "Antes de começar", tone: "ok", items: ["Retirar ou trocar remédios com interação perigosa (fluvoxamina, ciprofloxacino) e reduzir os que somam efeitos (anticolinérgicos, benzodiazepínicos, bloqueadores alfa-1).", "Se não der para retirar um inibidor forte de outra enzima (2C19, 2D6, 3A4), usar metade das doses da titulação.", "Carbamazepina e omeprazol reduzem a exposição em até 50%: trocar antes. Se precisar de anticonvulsivante, o livro prefere o valproato.", "Hemograma conforme o protocolo do país: conferir a bula vigente e o programa de monitorização local."] },
    ],
  },
};

(function addLevelRefs() {
  const sources = window.PHARMA_SOURCES || {};
  sources.meyerStahlLevels = sources.meyerStahlLevels || {
    short: "Meyer e Stahl, Antipsychotic Plasma Levels",
    full: "Meyer JM, Stahl SM. The Clinical Use of Antipsychotic Plasma Levels: Stahl's Handbooks. Cambridge University Press; 2021.",
  };
  sources.meyerStahlClozapine = sources.meyerStahlClozapine || {
    short: "Meyer e Stahl, The Clozapine Handbook",
    full: "Meyer JM, Stahl SM. The Clozapine Handbook: Stahl's Handbooks. Cambridge University Press; 2019.",
  };
  const refs = window.PHARMA_REFS || {};
  refs.niveis = {
    paths: [
      { about: "Limiar terapêutico, ponto de futilidade, nível de alerta AGNP/ASCP e relação nível–dose de cada antipsicótico", src: "meyerStahlLevels", where: "Apêndice", kind: "fonte" },
      { about: "Quando colher (vale de 12 h, equilíbrio, injetáveis de 1 h a 72 h antes da aplicação)", src: "meyerStahlLevels", where: "cap. 1, Summary Points", kind: "fonte" },
      { about: "Conceitos de limiar, ponto de futilidade (menos de 5% respondem) e nível de alerta", src: "meyerStahlLevels", where: "cap. 2, Summary Points", kind: "fonte" },
      { about: "Variação de 30% entre coletas e queda acima de 50% sugerindo falha de adesão; segundo nível na mesma dose", src: "meyerStahlLevels", where: "cap. 4, Summary Points", kind: "fonte" },
      { about: "Clorpromazina: limiar incerto (3 a 30 ng/mL; estimativa de 6 ng/mL)", src: "meyerStahlLevels", where: "cap. 11", kind: "fonte" },
      { about: "Clozapina: limiar de 350 ng/mL, ponto de futilidade de 1000 ng/mL, constipação como limite em níveis altos", src: "meyerStahlLevels", where: "cap. 13, Summary Points", kind: "fonte" },
      { about: "Titulação da clozapina (internação e ambulatório, fumante e não fumante) e cuidados antes de começar", src: "meyerStahlClozapine", where: "cap. 3, Box 3.3 e tabelas 3.6 e 3.7", kind: "fonte" },
      { about: "Razão clozapina ÷ norclozapina, fumo e infecção", src: "meyerStahlClozapine", where: "cap. 5, Box 5.4 e Summary Points", kind: "fonte" },
      { about: "Constipação e íleo", src: "meyerStahlClozapine", where: "cap. 7, Summary Points", kind: "fonte" },
      { about: "Febre e miocardite (troponina, PCR, primeiras 6 semanas)", src: "meyerStahlClozapine", where: "cap. 12, Principles", kind: "fonte" },
      { about: "Nível esperado pela dose, régua e leitura de um nível medido", src: "curadoria", where: "cálculo com a relação nível–dose do apêndice; média populacional, sem inibidores ou indutores", kind: "didatico" },
    ],
  };
})();
