/* Registro de fontes do simulador. Cada dado mostrado numa tela aponta para uma fonte daqui, com o
   local exato (tabela, capítulo, monografia) e o tipo:
   - "fonte": o valor vem da fonte citada (às vezes resumido em níveis, como "+", "++", "+++");
   - "didatico": simplificação ou modelo nosso, conferido com a fonte, mas não é um dado dela.
   PHARMA_REVIEW guarda a revisão humana de cada classe ({ by, date }); null = ainda não revisada. */

window.PHARMA_SOURCES = {
  maudsley15: {
    short: "Maudsley 15ª ed.",
    full: "Taylor DM, Barnes TRE, Young AH. The Maudsley Prescribing Guidelines in Psychiatry. 15ª ed. Wiley-Blackwell.",
  },
  stahl8: {
    short: "Stahl, Prescriber's Guide 8ª ed.",
    full: "Stahl SM. Stahl's Essential Psychopharmacology: Prescriber's Guide. 8ª ed. Cambridge University Press; 2024.",
  },
  kapur2000: {
    short: "Kapur et al., 2000",
    full: "Kapur S, Zipursky R, Jones C, Remington G, Houle S. Relationship between dopamine D2 occupancy, clinical response, and side effects: a double-blind PET study of first-episode schizophrenia. Am J Psychiatry. 2000;157(4):514-520.",
    pmid: "10739409",
  },
  meyer2004: {
    short: "Meyer et al., 2004",
    full: "Meyer JH, Wilson AA, Sagrati S, et al. Serotonin transporter occupancy of five selective serotonin reuptake inhibitors at different doses: an [11C]DASB positron emission tomography study. Am J Psychiatry. 2004;161(5):826-835.",
    pmid: "15121647",
  },
  learned2003: {
    short: "Learned-Coughlin et al., 2003",
    full: "Learned-Coughlin SM, Bergström M, Savitcheva I, et al. In vivo activity of bupropion at the human dopamine transporter as measured by positron emission tomography. Biol Psychiatry. 2003;54(8):800-805.",
    pmid: "14550679",
  },
  ashton: {
    short: "Ashton Manual",
    full: "Ashton CH. Benzodiazepines: How They Work and How to Withdraw (The Ashton Manual). 2002.",
  },
  rowland2007: {
    short: "Rowland et al., 2007",
    full: "Rowland JP et al. Advances in Psychiatric Treatment. Royal College of Psychiatrists; 2007. Protocolo reproduzido no Maudsley 15ª ed., figura 6.1.",
  },
  nice_ng97: {
    short: "NICE NG97 (demência)",
    full: "National Institute for Health and Care Excellence. Dementia: assessment, management and support for people living with dementia and their carers. NICE guideline NG97; 2018. Resumido no Maudsley 15ª ed., quadro 6.2.",
  },
  nice_ng71: {
    short: "NICE NG71 (Parkinson)",
    full: "National Institute for Health and Care Excellence. Parkinson's disease in adults. NICE guideline NG71; 2017. Citado no Maudsley 15ª ed., quadro 6.2.",
  },
  nice_cg115: {
    short: "NICE CG115 (álcool)",
    full: "National Institute for Health and Care Excellence. Alcohol-use disorders: diagnosis, assessment and management of harmful drinking and alcohol dependence. Clinical guideline CG115; 2011. Resumido no Maudsley 15ª ed., caixas 4.1 a 4.3.",
  },
  circadin: {
    short: "Bula do Circadin",
    full: "Circadin 2 mg prolonged-release tablets: Summary of Product Characteristics (citada no Maudsley 15ª ed.).",
  },
  kaufman: {
    short: "Clinical Neurology for Psychiatrists",
    full: "Kaufman DM et al. Kaufman's Clinical Neurology for Psychiatrists. Elsevier. Cap. 18 (Involuntary Movement Disorders).",
  },
  alexander1986: {
    short: "Alexander et al., 1986",
    full: "Alexander GE, DeLong MR, Strick PL. Parallel organization of functionally segregated circuits linking basal ganglia and cortex. Annu Rev Neurosci. 1986;9:357-381.",
    pmid: "3085570",
  },
  cummings1993: {
    short: "Cummings, 1993",
    full: "Cummings JL. Frontal-subcortical circuits and human behavior. Arch Neurol. 1993;50(8):873-880.",
    pmid: "8352676",
  },
  quevedo2020: {
    short: "Quevedo e Izquierdo, 2020",
    full: "Quevedo J, Izquierdo I (orgs.). Neurobiologia dos transtornos psiquiátricos. Artmed; 2020.",
  },
  machado: {
    short: "Machado, Neuroanatomia Funcional",
    full: "Machado ABM, Haertel LM. Neuroanatomia Funcional. 4ª ed. Atheneu; 2022.",
  },
  yudofsky: {
    short: "Yudofsky e Hales, 4ª ed.",
    full: "Yudofsky SC, Hales RE. Neuropsiquiatria e neurociências na prática clínica. 4ª ed. Porto Alegre: Artmed; 2006 (tradução de The American Psychiatric Publishing Textbook of Neuropsychiatry and Clinical Neurosciences, 4ª ed., 2002).",
  },
  mesulam: {
    short: "Mesulam, Principles of Behavioral and Cognitive Neurology",
    full: "Mesulam MM, ed. Principles of Behavioral and Cognitive Neurology. 2ª ed. Oxford University Press; 2000.",
  },
  lishman: {
    short: "Lishman's Organic Psychiatry",
    full: "David AS, Fleminger S, Kopelman MD, Lovestone S, Mellers JDC, eds. Lishman's Organic Psychiatry: A Textbook of Neuropsychiatry. 4ª ed. Wiley-Blackwell; 2009.",
  },
  oxfordNeuropsychiatry: {
    short: "Oxford Textbook of Neuropsychiatry",
    full: "Agrawal N, Faruqui R, Bodani M, eds. Oxford Textbook of Neuropsychiatry. Oxford University Press; 2020.",
  },
  balon2023: {
    short: "Balon e Morreale, Pocket Guide, 2023",
    full: "Balon R, Morreale MK, eds. Pocket Guide to Emergent and Serious Adverse Events in Psychopharmacology. Washington, DC: American Psychiatric Association Publishing; 2023.",
  },
  narita1996: {
    short: "Narita et al., 1996",
    full: "Narita N, Hashimoto K, Tomitaka S, Minabe Y. Interactions of selective serotonin reuptake inhibitors with subtypes of sigma receptors in rat brain. Eur J Pharmacol. 1996;307(1):117-119.",
    pmid: "8831113",
  },
  apa6: {
    short: "APA Textbook of Psychopharmacology, 6ª ed.",
    full: "Schatzberg AF, Nemeroff CB, eds. The American Psychiatric Association Publishing Textbook of Psychopharmacology. 6ª ed. Washington, DC: American Psychiatric Association Publishing; 2024.",
  },
  maudsleyDeprescribing: {
    short: "Maudsley Deprescribing Guidelines",
    full: "Horowitz M, Taylor D. The Maudsley Deprescribing Guidelines: Antidepressants, Benzodiazepines, Gabapentinoids and Z-drugs. John Wiley & Sons; 2024.",
  },
  stahlDeprescriber: {
    short: "Stahl's Deprescriber's Guide",
    full: "Strawn JR, Stahl SM. Stahl's Deprescriber's Guide. Cambridge University Press; 2026.",
  },
  dieckmann2025: {
    short: "Dieckmann e Haddad, 2025",
    full: "Dieckmann LHJ, Haddad M. Psicofarmacologia: da teoria à clínica. Porto Alegre: Artmed; 2025.",
  },
  apresentacoesBr: {
    short: "Apresentações no Brasil",
    full: "Quadro de apresentações de um manual brasileiro de psicofármacos e bulas brasileiras de fabricantes e farmácias (escitalopram em gotas, Aristab, Rexulti, Brintellix, Lorax, Tofranil), consultados em outubro de 2026. Conferir a bula vigente no Bulário Eletrônico da Anvisa.",
  },
  curadoria: {
    short: "Curadoria do site",
    full: "Esquemas, modelos e casos feitos para este site a partir das fontes citadas na mesma tela. Não são dados publicados.",
  },
};

/* Por classe e por tela (paths, compare, synapse, depot, eps, quiz). Telas sem lista usam "paths". */
window.PHARMA_REFS = {
  antipsicoticos: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Efeitos relativos (sedação, peso, acatisia, parkinsonismo, prolactina, QT…)", src: "maudsley15", where: "tabela 1.7", kind: "fonte" },
      { about: "Níveis de afinidade por receptor (0 a 4)", src: "stahl8", where: "monografias de cada antipsicótico", kind: "didatico", note: "Níveis resumidos de dados de afinidade publicados; a substituir por valores de Ki com fonte própria." },
      { about: "Valores de Ki de haloperidol, risperidona, paliperidona e clozapina (D2, 5-HT2A, 5-HT1A, H1, muscarínico, α1)", src: "apa6", where: "cap. 29, tabela 29-1 (Schotte et al., 1996)", kind: "fonte" },
      { about: "Valores de Ki de aripiprazol, brexpiprazol e cariprazina", src: "apa6", where: "cap. 34, tabela 34-1 (Citrome, 2015); cap. 30, tabelas 30-1 e 30-2", kind: "fonte" },
      { about: "Afinidade relativa dos antipsicóticos clássicos (clorpromazina, flufenazina, haloperidol): H1, M1 e α1 da flufenazina e H1 do haloperidol ajustados por ela", src: "apa6", where: "cap. 25, tabela 25-1", kind: "fonte" },
      { about: "Desenho das quatro vias dopaminérgicas e cores", src: "curadoria", where: "esquema não está em escala", kind: "didatico" },
    ],
    synapse: [
      { about: "Faixas de ocupação de D2 (efeito ~65%, prolactina ~72%, extrapiramidais ~78%)", src: "kapur2000", where: "estudo com PET em primeiro episódio", kind: "fonte" },
      { about: "Desenho da sinapse (cada receptor vale 10%)", src: "curadoria", where: "", kind: "didatico" },
    ],
    depot: [
      { about: "Doses, intervalos, dose-teste e local de aplicação", src: "maudsley15", where: "tabela 1.8", kind: "fonte" },
      { about: "Tempo até o pico, meia-vida e tempo até o equilíbrio", src: "maudsley15", where: "tabela 1.9", kind: "fonte" },
      { about: "Início do aripiprazol, paliperidona e olanzapina de longa ação", src: "maudsley15", where: "seções de cada antipsicótico de longa ação (cap. 1)", kind: "fonte" },
      { about: "Curva do nível ao longo das semanas", src: "curadoria", where: "modelo com o pico e a meia-vida da tabela 1.9, sem dose de ataque", kind: "didatico" },
    ],
    eps: [
      { about: "Sinais, escalas, prevalência, tempo de início e conduta", src: "maudsley15", where: "tabela 1.28", kind: "fonte" },
      { about: "Tratamento da acatisia (propranolol, clonazepam, antagonistas 5-HT2)", src: "maudsley15", where: "notas do algoritmo da acatisia (cap. 1)", kind: "fonte" },
      { about: "Risco do remédio escolhido", src: "maudsley15", where: "tabela 1.7", kind: "fonte" },
      { about: "Linha do tempo", src: "curadoria", where: "janelas aproximadas a partir da tabela 1.28", kind: "didatico" },
    ],
    quiz: [
      { about: "Casos de conduta em extrapiramidais", src: "curadoria", where: "redigidos a partir da tabela 1.28 do Maudsley", kind: "didatico" },
      { about: "Perguntas de perfil e de efeito", src: "maudsley15", where: "geradas a partir da tabela 1.7 e dos níveis de afinidade", kind: "fonte" },
    ],
  },
  antidepressivos: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Efeitos relativos (sedação, hipotensão, condução cardíaca, náusea, disfunção sexual)", src: "maudsley15", where: "tabela 3.23", kind: "fonte" },
      { about: "Alvos (transportadores, MAO, receptores) em níveis de 0 a 4", src: "stahl8", where: "monografias de cada antidepressivo", kind: "didatico", note: "Níveis resumidos de dados de afinidade publicados." },
      { about: "Valores de Ki de amitriptilina, clomipramina, imipramina e nortriptilina (transportadores, α1, α2, H1, M1)", src: "apa6", where: "cap. 11, tabela 11-1 (Tatsumi et al., 1997; Richelson e Nelson, 1984)", kind: "fonte" },
      { about: "Valores de Ki da duloxetina nos transportadores de serotonina, noradrenalina e dopamina", src: "apa6", where: "cap. 20, tabela 20-1 (Auclair et al., 2013)", kind: "fonte" },
      { about: "Receptor sigma-1: fluvoxamina como agonista (efeito rápido na ansiedade e na insônia, sedação) e ligação da sertralina (ação ansiolítica)", src: "stahl8", where: "monografias da fluvoxamina e da sertralina", kind: "fonte" },
      { about: "Ordem de afinidade pelo sigma-1: fluvoxamina > sertralina > fluoxetina > citalopram > imipramina > paroxetina (níveis 3 a 1 conforme essa ordem)", src: "narita1996", where: "ensaio de ligação em cérebro de rato", kind: "fonte" },
      { about: "Escetamina: mecanismo, início, pressão e efeitos", src: "stahl8", where: "monografia da escetamina", kind: "fonte" },
      { about: "Quanto cada um aumenta serotonina, noradrenalina e dopamina", src: "curadoria", where: "a partir do mecanismo descrito no Stahl", kind: "didatico" },
    ],
    synapse: [
      { about: "Ocupação do SERT ~80% nas doses mínimas eficazes dos ISRS", src: "meyer2004", where: "estudo com PET", kind: "fonte" },
      { about: "Bupropiona ocupa ~25% do DAT nas doses clínicas", src: "learned2003", where: "estudo com PET", kind: "fonte" },
      { about: "Desenho da sinapse por mecanismo", src: "curadoria", where: "", kind: "didatico" },
    ],
  },
  estabilizadores: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Alvos (canais de sódio e cálcio, glutamato, GABA, vias intracelulares)", src: "stahl8", where: "monografias", kind: "didatico", note: "Intensidade de cada mecanismo em níveis resumidos." },
      { about: "Fases em que cada um funciona e efeitos", src: "maudsley15", where: "cap. 2", kind: "fonte" },
    ],
    synapse: [
      { about: "Faixas de nível sérico", src: "maudsley15", where: "cap. 2", kind: "fonte" },
      { about: "Interações que sobem o lítio (IECA, tiazídico, AINE)", src: "maudsley15", where: "tabela 2.2", kind: "fonte" },
      { about: "Titulação da lamotrigina com valproato ou indutor", src: "maudsley15", where: "cap. 2", kind: "fonte" },
      { about: "Projeção do nível com interação", src: "curadoria", where: "multiplicadores aproximados a partir do Maudsley", kind: "didatico" },
    ],
  },
  ansioliticos: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Mecanismo (GABA-A por subunidade, α2δ, 5-HT1A, melatonina, orexina, H1)", src: "stahl8", where: "monografias", kind: "fonte" },
      { about: "Usos e efeitos em níveis de 0 a 3", src: "curadoria", where: "a partir do Maudsley (cap. 3) e do Stahl", kind: "didatico" },
    ],
    synapse: [
      { about: "Meias-vidas", src: "stahl8", where: "monografias (bromazepam: bula)", kind: "fonte" },
      { about: "Melatonina de liberação prolongada: meia-vida", src: "circadin", where: "bula", kind: "fonte" },
      { about: "Doses equivalentes a 10 mg de diazepam", src: "maudsley15", where: "tabela 3.24 (diazepam, clonazepam, lorazepam, clordiazepóxido)", kind: "fonte" },
      { about: "Demais doses equivalentes (alprazolam, bromazepam, zolpidem)", src: "ashton", where: "tabela de equivalência", kind: "fonte" },
      { about: "Curva de concentração com uso diário e parada", src: "curadoria", where: "modelo com a meia-vida média", kind: "didatico" },
    ],
  },
  estimulantes: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Mecanismos (DAT, NET, liberação, α2A)", src: "stahl8", where: "monografias", kind: "fonte" },
      { about: "Regiões, usos e efeitos em níveis", src: "curadoria", where: "a partir do Maudsley e do Stahl", kind: "didatico" },
    ],
    synapse: [
      { about: "Início e duração de cada formulação", src: "maudsley15", where: "tabela 5.10", kind: "fonte" },
      { about: "Forma da curva ao longo do dia", src: "curadoria", where: "ajustada ao início e à duração da tabela 5.10", kind: "didatico" },
    ],
  },
  demencias: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Mecanismos (AChE, BuChE, nicotínico, NMDA)", src: "maudsley15", where: "tabela 6.1", kind: "fonte" },
      { about: "Galantamina como modulador nicotínico", src: "stahl8", where: "monografia da galantamina", kind: "fonte" },
      { about: "Efeitos em níveis de 0 a 3", src: "curadoria", where: "a partir da tabela 6.1 e da metanálise citada no Maudsley", kind: "didatico" },
    ],
    synapse: [
      { about: "Indicação por tipo e estágio", src: "nice_ng97", where: "quadro 6.2 do Maudsley", kind: "fonte" },
      { about: "Demência da doença de Parkinson", src: "nice_ng71", where: "citado no quadro 6.2 do Maudsley", kind: "fonte" },
      { about: "Dose, titulação, meia-vida e metabolismo", src: "maudsley15", where: "tabela 6.1", kind: "fonte" },
      { about: "Fluxo do pulso", src: "rowland2007", where: "figura 6.1 do Maudsley", kind: "fonte" },
      { about: "Interações", src: "maudsley15", where: "tabela 6.2", kind: "fonte" },
    ],
    quiz: [
      { about: "Casos de conduta", src: "curadoria", where: "redigidos a partir do cap. 6 do Maudsley", kind: "didatico" },
    ],
  },
  "atlas-nucleos-base": {
    paths: [
      { about: "Estruturas dos núcleos da base e vias direta (D1) e indireta (D2, pelo pálido externo e subtalâmico) até o pálido interno, tálamo e córtex", src: "kaufman", where: "cap. 18, \"The basal ganglia\" e figura 18-1", kind: "fonte" },
      { about: "Parkinson: falta de dopamina e mais inibição das projeções tálamo-corticais", src: "kaufman", where: "cap. 18", kind: "fonte" },
      { about: "Huntington: degeneração dos neurônios GABA do estriado e atrofia do caudado", src: "kaufman", where: "cap. 18", kind: "fonte" },
      { about: "Hemibalismo por lesão do subtalâmico contralateral", src: "kaufman", where: "cap. 18", kind: "fonte" },
      { about: "Bloqueio de D2 e parkinsonismo; ocupação de ~78%", src: "kapur2000", where: "estudo com PET", kind: "fonte" },
      { about: "Atividade de cada estrutura nos cenários e espessura das setas", src: "curadoria", where: "modelo clássico de vias direta e indireta, simplificado", kind: "didatico" },
      { about: "Desenho do circuito", src: "curadoria", where: "esquema não está em escala nem em posição anatômica", kind: "didatico" },
    ],
  },
  "atlas-frontoestriatais": {
    paths: [
      { about: "Alças paralelas córtex → estriado → pálido/SN reticulada → tálamo → córtex", src: "alexander1986", where: "artigo de revisão", kind: "fonte" },
      { about: "Estruturas de cada alça (dorsolateral, orbitofrontal, cingulado anterior) e síndromes de lesão em qualquer ponto da alça", src: "cummings1993", where: "artigo de revisão", kind: "fonte" },
      { about: "Sinais das lesões frontais (apatia, abulia, mutismo acinético, desinibição, distraibilidade, perseveração, witzelsucht)", src: "kaufman", where: "seção Frontal Lobe Disorders", kind: "fonte" },
      { about: "Alça orbitofrontal até o tálamo mediodorsal e anterior", src: "quevedo2020", where: "capítulo sobre impulsividade", kind: "fonte" },
      { about: "TOC, dependência química, depressão (cingulado subgenual) e TDAH", src: "quevedo2020", where: "capítulos de estimulação cerebral profunda, dependência e TDAH", kind: "fonte" },
      { about: "Desenho das alças lado a lado e escolha do ponto da lesão", src: "curadoria", where: "esquema não está em escala nem em posição anatômica", kind: "didatico" },
    ],
  },
  "atlas-limbico": {
    paths: [
      { about: "Estruturas do circuito de Papez e as acrescentadas depois (amígdala, área frontobasal, orbitofrontal)", src: "quevedo2020", where: "seção Sistema límbico", kind: "fonte" },
      { about: "Funções da amígdala e transtornos com disfunção dela", src: "quevedo2020", where: "seção Sistema límbico", kind: "fonte" },
      { about: "Wernicke-Korsakoff: amnésia, sinais agudos, corpos mamilares e confabulação em geral discreta", src: "kaufman", where: "seção Wernicke-Korsakoff Syndrome e questões de revisão", kind: "fonte" },
      { about: "Klüver-Bucy: lesão temporal bilateral, causas e manifestações em humanos", src: "kaufman", where: "seção The Klüver-Bucy Syndrome", kind: "fonte" },
      { about: "Hipocampo no Alzheimer e na esquizofrenia", src: "kaufman", where: "seção Alzheimer's disease", kind: "fonte" },
      { about: "Ordem dos passos do circuito e desenho", src: "curadoria", where: "esquema não está em escala nem em posição anatômica", kind: "didatico" },
    ],
  },
  "atlas-neurotransmissores": {
    paths: [
      { about: "Origens e projeções de dopamina, noradrenalina, serotonina, acetilcolina e histamina", src: "quevedo2020", where: "seção Neurotransmissores e vias", kind: "fonte" },
      { about: "Locus coeruleus, rafe dorsal e caudal, núcleo basal de Meynert; Parkinson, depressão, 5-HIAA e Lewy", src: "kaufman", where: "capítulo de neurotransmissores", kind: "fonte" },
      { about: "Orexina (hipocretina): hipotálamo, vigília, REM e narcolepsia", src: "kaufman", where: "questões do capítulo de sono", kind: "fonte" },
      { about: "Histamina do núcleo tuberomamilar e orexina na tabela do sono", src: "quevedo2020", where: "capítulo de sono", kind: "fonte" },
      { about: "Fármacos que agem em cada sistema", src: "curadoria", where: "a partir das classes do simulador (Stahl e Maudsley)", kind: "didatico" },
      { about: "Posição dos núcleos e dos alvos no corte", src: "curadoria", where: "esquema não está em escala", kind: "didatico" },
    ],
  },
  "atlas-hha": {
    paths: [
      { about: "Regulação do eixo (CRH e AVP, ACTH, glicocorticoides) e feedback negativo pelos receptores RM e RG", src: "quevedo2020", where: "cap. 3, Psiconeuroendocrinologia", kind: "fonte" },
      { about: "Hiperatividade do eixo na depressão (cortisol, CRH no líquor, hipófise e adrenal aumentadas) e normalização com a melhora", src: "quevedo2020", where: "cap. 3", kind: "fonte" },
      { about: "Teste de supressão com dexametasona (sensibilidade de 40–50%) e teste DEX/CRH", src: "quevedo2020", where: "cap. 3", kind: "fonte" },
      { about: "Hipótese da cascata de glicocorticoides e dano ao hipocampo; sinalização insuficiente do cortisol", src: "quevedo2020", where: "cap. 3", kind: "fonte" },
      { about: "Psicose por corticoide em dose alta", src: "kaufman", where: "menções a steroid psychosis", kind: "fonte" },
      { about: "Níveis de cada estrutura nos cenários, supressão do eixo pelo corticoide externo e demora da adrenal para voltar", src: "curadoria", where: "fisiologia do feedback, simplificada", kind: "didatico" },
    ],
  },
  "atlas-vias-longas": {
    paths: [
      { about: "Trajeto do trato corticoespinal e decussação das pirâmides (75% a 90% das fibras)", src: "machado", where: "cap. 30, Grandes vias eferentes", kind: "fonte" },
      { about: "Via espinotalâmica: cruzamento na comissura branca da medula e lemnisco espinal", src: "machado", where: "cap. 29, Grandes vias aferentes", kind: "fonte" },
      { about: "Coluna dorsal: fascículos grácil e cuneiforme, fibras arqueadas internas e lemnisco medial", src: "machado", where: "cap. 29", kind: "fonte" },
      { about: "Síndrome de Brown-Séquard", src: "machado", where: "cap. 19, item 3.3", kind: "fonte" },
      { about: "Síndrome do neurônio motor superior e sinal de Babinski", src: "machado", where: "cap. 30", kind: "fonte" },
      { about: "Desenho das vias, níveis de lesão e bonecos de déficit", src: "curadoria", where: "esquema sem face, sem trato anterior e sem detalhe dos níveis medulares", kind: "didatico" },
    ],
  },
  "atlas-via-optica": {
    paths: [
      { about: "Lesões A a F da via óptica e defeitos de campo correspondentes", src: "machado", where: "cap. 29, item 3.6.3 e figura 29.10", kind: "fonte" },
      { about: "Causas típicas (tumor de hipófise, aneurisma de carótida, tumor do lobo temporal) e reflexo fotomotor no trato × radiação", src: "machado", where: "cap. 29, item 3.6.3", kind: "fonte" },
      { about: "Desenho da via vista de cima e dos campos visuais", src: "curadoria", where: "esquema sem sobreposição dos campos dos dois olhos", kind: "didatico" },
    ],
  },
  "atlas-nervos-cranianos": {
    paths: [
      { about: "Síndromes de Parinaud, Benedikt, Weber, Millard-Gubler, lesão da ponte no nível do trigêmeo, encarceramento (locked-in), base do bulbo e Wallenberg", src: "machado", where: "cap. 19, Considerações anatomoclínicas sobre a medula e o tronco encefálico", kind: "fonte" },
      { about: "Paralisia facial central × periférica (metade superior da face, reflexo corneano, movimentos emocionais, gustação)", src: "machado", where: "cap. 19", kind: "fonte" },
      { about: "Nervo craniano do mesmo lado e hemiparesia do lado oposto; Wallenberg como infarto de tronco mais comum; ausência de afasia nas lesões do tronco", src: "kaufman", where: "cap. 11, Infarctions in the basilar artery distribution e tabela 11-4", kind: "fonte" },
      { about: "Funções e nível de saída de cada nervo craniano", src: "machado", where: "caps. 5 e 15 (anatomia do tronco e nervos cranianos)", kind: "fonte" },
      { about: "Vista anterior, cortes do tronco, posição dos núcleos e desenho da face", src: "curadoria", where: "esquema que junta estruturas de alturas diferentes do mesmo nível", kind: "didatico" },
    ],
  },
  "atlas-lobos": {
    paths: [
      { about: "O que cada região perde com lesão esquerda, direita ou bilateral (frontal, parietal, temporal e occipital) e dominância hemisférica", src: "yudofsky", where: "cap. 3, tabelas 3-1 a 3-5", kind: "fonte" },
      { about: "Três síndromes pré-frontais (orbitofrontal, dorsolateral e medial) e sinais frontais de liberação", src: "oxfordNeuropsychiatry", where: "cap. 21, Neuropsychiatric aspects of CNS tumours in adults", kind: "fonte" },
      { about: "Síndrome frontal abúlica × desinibida; abulia confundida com depressão e desinibição com mania; caso de Phineas Gage", src: "mesulam", where: "cap. 1, The clinical picture of frontal lobe syndromes", kind: "fonte" },
      { about: "Sinais neurológicos de cada lobo (paresia, preensão, anosmia, incontinência, perda sensitiva cortical, extinção, quadrantanopsias), moria e Witzelsucht, negligência e asomatognosia, personalidade, agressividade e psicose nas lesões temporais, alucinações visuais nas occipitais", src: "lishman", where: "cap. 1, Clinical picture in focal cerebral disorder", kind: "fonte" },
      { about: "Mapa dos lobos, divisão das regiões, vias visuais dorsal e ventral e frases de correlação clínica", src: "curadoria", where: "esquema e resumo a partir das fontes acima", kind: "didatico" },
    ],
  },
  "atlas-afasias": {
    paths: [
      { about: "Perfil de fluência, compreensão, repetição e nomeação de cada síndrome (Broca, Wernicke, condução, global, transcorticais motora, sensorial e mista, anômica)", src: "yudofsky", where: "cap. 15, tabela 15-1 e texto das síndromes", kind: "fonte" },
      { about: "Fala, localização da lesão e sinais associados de cada síndrome; afasia global e êmbolos múltiplos; prognóstico da lesão profunda na afasia de Broca", src: "yudofsky", where: "cap. 15", kind: "fonte" },
      { about: "Síndromes comportamentais: depressão e reação catastrófica nas afasias anteriores; falta de consciência do déficit, paranoia e impulsividade nas posteriores", src: "yudofsky", where: "cap. 15, Aspectos neuropsiquiátricos da afasia", kind: "fonte" },
      { about: "Afasia de Wernicke × delirium × esquizofrenia × mania", src: "yudofsky", where: "cap. 15, tabela 15-2 (resumida)", kind: "fonte" },
      { about: "Aprosódia, indecoro verbal e síndrome de Gerstmann", src: "yudofsky", where: "cap. 15, Amelodia/aprosodia, Indecoro verbal e Transtornos diversos", kind: "fonte" },
      { about: "Afasia fluente sem hemiparesia como causa de interconsulta por psicose aguda; afasia de isolamento por infarto de zona de fronteira; condução por êmbolo no ramo temporal posterior; afasia × esquizofrenia (idade, início, repetição, consciência do déficit); alexia sem agrafia", src: "kaufman", where: "cap. 8, Aphasia and related disorders", kind: "fonte" },
      { about: "Diagnóstico em três perguntas (fluência, compreensão, repetição) e mapa das áreas no hemisfério esquerdo", src: "curadoria", where: "esquema clássico de classificação a partir da tabela 15-1", kind: "didatico" },
    ],
  },
  "atlas-territorios": {
    paths: [
      { about: "Territórios e quadros das artérias cerebrais anterior (incluindo o ramo recorrente e o corpo caloso), média (lado esquerdo e direito, ramos profundos) e coróidea anterior", src: "machado", where: "cap. 18, Vascularização do sistema nervoso central", kind: "fonte" },
      { about: "Cerebral posterior: hemianopsia homônima, alexia sem agrafia, cegueira cortical; amnésia global transitória; cerebral anterior bilateral (mutismo, apatia, incontinência)", src: "kaufman", where: "cap. 11, tabela 11-4 e seção Transient Global Amnesia", kind: "fonte" },
      { about: "Pupilas que reagem à luz na cegueira cortical", src: "machado", where: "cap. 29, item 3.6.3 (fibras do reflexo fotomotor saem antes do corpo geniculado lateral)", kind: "fonte" },
      { about: "Fibras da face, do braço e da perna juntas na cápsula interna; sensibilidade pelos ramos para o tálamo", src: "curadoria", where: "dedução anatômica a partir dos territórios do Machado, cap. 18", kind: "didatico" },
      { about: "Mapas da face lateral e do corte coronal, bonequinho e regra prática", src: "curadoria", where: "limites entre territórios simplificados", kind: "didatico" },
      { about: "Correlações com quadros psiquiátricos (afasia × fala desorganizada, anosognosia, aprosódia, cegueira funcional)", src: "curadoria", where: "comentário clínico", kind: "didatico" },
    ],
  },
  seguranca: {
    paths: [
      { about: "Síndrome neuroléptica maligna: quadro, critérios, exames, fatores de risco, conduta (lorazepam, dantroleno, bromocriptina, amantadina, ECT) e reintrodução", src: "balon2023", where: "cap. 10", kind: "fonte" },
      { about: "Síndrome serotoninérgica: critérios de Hunter (sensibilidade 84%, especificidade 97%), diferencial com SNM e conduta (ciproeptadina nos leves a moderados)", src: "balon2023", where: "cap. 16", kind: "fonte" },
      { about: "Agranulocitose: definição pelos neutrófilos, incidência com clozapina (0,65–0,80% ao ano; 0,91% em 1,5 ano), outros remédios e fatores de risco", src: "balon2023", where: "cap. 3", kind: "fonte" },
      { about: "QT longo e torsades (metas de potássio e magnésio), citalopram e escitalopram, miocardite por clozapina e monitorização nas 4 primeiras semanas", src: "balon2023", where: "cap. 5", kind: "fonte" },
      { about: "Crise hipertensiva com IMAO: alimentos com tiramina, simpaticomiméticos, definição e conduta (fentolamina, nicardipina)", src: "balon2023", where: "cap. 8", kind: "fonte" },
      { about: "Hiponatremia: remédios, fatores de risco (diurético 11–13 vezes), quando dosar o sódio e alternativas", src: "balon2023", where: "cap. 9", kind: "fonte" },
      { about: "Hepatotoxicidade: definição, padrões, valproato, carbamazepina, antidepressivos de maior e menor risco, quando suspender", src: "balon2023", where: "cap. 7", kind: "fonte" },
      { about: "Benzodiazepínico com opioide: depressão respiratória somada e risco crescente com a dose", src: "balon2023", where: "cap. 4", kind: "fonte" },
      { about: "Convulsões: bupropiona (0,4%), tricíclicos de maior risco, clozapina dose-dependente e titulação de 25 mg/dia", src: "balon2023", where: "cap. 15", kind: "fonte" },
      { about: "Intoxicações por antidepressivos, lítio e antipsicóticos: observação, ECG, bicarbonato, magnésio, fisostigmina, lítio (tubo, soro, hemodiálise)", src: "balon2023", where: "cap. 12", kind: "fonte" },
      { about: "Lista de remédios do simulador ligados a cada evento e resumo dos sinais", src: "curadoria", where: "a partir dos capítulos acima", kind: "didatico" },
    ],
  },
  troca: {
    paths: [
      { about: "Conduta para cada par de antidepressivos, intervalos e notas (fluoxetina, fluvoxamina, bupropiona, vortioxetina, duloxetina, imipramina)", src: "maudsley15", where: "cap. 3, Switching antidepressants, tabela 3.7", kind: "fonte" },
      { about: "Doses mínimas eficazes de cada antidepressivo (tricíclicos: pelo menos 75–100 mg/dia)", src: "maudsley15", where: "cap. 3, Recognised minimum effective doses of antidepressants, tabela 3.2", kind: "fonte" },
      { about: "Exemplo de redução cruzada citalopram 40 → 2,5 mg com mirtazapina 15 → 45 mg; reduzir à dose mínima eficaz antes da troca direta; fluoxetina demora 1–2 semanas para atingir o equilíbrio", src: "maudsley15", where: "cap. 3, Switching antidepressants", kind: "fonte" },
      { about: "Retirada: estratificação de risco, redução de 10–25% da última dose a cada 2–4 semanas, dose final muito pequena, conduta diante de sintomas, remédios de maior risco e duração de 3 meses a 3 anos", src: "maudsley15", where: "cap. 3, Stopping antidepressants e box 3.2", kind: "fonte" },
      { about: "Sintomas de retirada e como distinguir de recaída", src: "maudsley15", where: "cap. 3, Antidepressant withdrawal symptoms e Stopping antidepressants", kind: "fonte" },
      { about: "Ocupação do SERT ~80% na dose mínima eficaz (base da curva hiperbólica)", src: "meyer2004", where: "estudo com PET", kind: "fonte" },
      { about: "Faixa de doses aceitas no campo e dose usual da tranilcipromina (fora da tabela do Maudsley)", src: "stahl8", where: "monografias de cada antidepressivo", kind: "fonte" },
      { about: "Degraus semanais em mg (metades até 1/4 da dose mínima), arredondamentos, curva de ocupação e comparação linear × proporcional", src: "curadoria", where: "modelo a partir do exemplo e da figura 3.3 do Maudsley", kind: "didatico" },
      { about: "Retirada de cada antidepressivo: alvo de referência (SERT, NET, α2, MAO), ocupação por dose, ritmos rápido, moderado e lento (pontos de ocupação por degrau e duração), degraus da agomelatina, amitriptilina e bupropiona, intervalos e notas (fluoxetina e vortioxetina em dias alternados, desvenlafaxina → venlafaxina, grânulos da duloxetina e da venlafaxina, risco alto nos IRSN e na paroxetina)", src: "maudsleyDeprescribing", where: "cap. 2, Tapering guidance for specific antidepressants (monografias)", kind: "fonte" },
      { about: "Curva de ocupação de cada antidepressivo ajustada aos pares dose → ocupação das tabelas do livro, degraus recalculados a partir da dose atual (no máximo metade da dose por degrau) e degraus intermediários nos ritmos lentos dos remédios sem curva", src: "curadoria", where: "modelo que reproduz de perto as tabelas do livro (ex.: sertralina 200 → 1 mg)", kind: "didatico" },
      { about: "Antipsicóticos: doses mínimas eficazes no primeiro episódio e no multiepisódio", src: "maudsley15", where: "cap. 1, Antipsychotics – minimum effective doses, tabela 1.1", kind: "fonte" },
      { about: "Antipsicóticos: tempo de retirada do antigo na troca (nenhum, 1 semana, 3–4 semanas, 4 semanas ou mais), começo do novo em dose intermediária em 3–7 dias, quetiapina e clozapina mais lentas, benzodiazepínico ou anticolinérgico na troca, risperidona × paliperidona", src: "stahl8", where: "seções The art of switching de cada antipsicótico", kind: "fonte" },
      { about: "Antipsicóticos: retirada proporcional, olanzapina (tabela 1.27 e box 1.1), quando tentar, tamanho do degrau, dose final mínima, depósito, recaída nos primeiros meses, sintomas de retirada e rebote colinérgico da clozapina", src: "maudsley15", where: "cap. 1, Stopping antipsychotics e Restarting clozapine after a break in treatment", kind: "fonte" },
      { about: "Haloperidol e clorpromazina: tempo de retirada na troca por semelhança farmacológica (o Stahl não traz o esquema)", src: "curadoria", where: "analogia com os de mesmo perfil de bloqueio", kind: "didatico" },
      { about: "Benzodiazepínicos: equivalências com diazepam, troca gradual por diazepam, risco de retirada, redução proporcional, guia de degraus do diazepam, sintomas de retirada e ocupação do GABA-A", src: "maudsley15", where: "cap. 3, Benzodiazepines, z-drugs and gabapentinoids, tabela 3.24 e box 3.12", kind: "fonte" },
      { about: "Equivalências de alprazolam, bromazepam e zolpidem", src: "ashton", where: "tabela de equivalências", kind: "fonte" },
      { about: "Clonazepam: ocupação do GABA-A por dose (base da curva), formas líquidas, diluição de 10 gotas em 10 mL (0,1 mg/mL), degraus a cada 1–4 semanas, evitar dias alternados, retirada curta em uso curto", src: "maudsleyDeprescribing", where: "cap. 3, monografia do clonazepam e Tapering benzodiazepines and z-drugs in practice", kind: "fonte" },
      { about: "Troca direta entre benzodiazepínicos (ex.: lorazepam → clonazepam) e teto de 25% a cada 2 semanas da diretriz conjunta da ASAM (2025)", src: "stahlDeprescriber", where: "cap. 1, How to switch, e monografias de alprazolam e clonazepam", kind: "fonte" },
      { about: "Disponibilidade no Brasil, nomes comerciais e oferta no SUS (Rename) de cada remédio; clonazepam gotas 2,5 mg/mL na Rename; clordiazepóxido só em associação; moclobemida, cariprazina e asenapina sem venda no Brasil", src: "dieckmann2025", where: "monografias, itens Nomes no Brasil e SUS", kind: "fonte" },
      { about: "Apresentações orais no Brasil (comprimidos, gotas e soluções) e mg por gota do clonazepam (0,1 mg) e do escitalopram (1 mg)", src: "apresentacoesBr", where: "quadro de apresentações e bulas", kind: "fonte" },
      { about: "Clonazepam como referência da troca (pelas gotas disponíveis no Brasil), conversão de cada degrau em gotas ou mL e arredondamento para gotas inteiras", src: "curadoria", where: "adaptação à realidade brasileira", kind: "didatico" },
      { about: "Troca para clonazepam ou diazepam em 4 semanas (25% por semana) e curvas de ocupação D2 (olanzapina) e GABA-A ajustadas aos números do Maudsley", src: "curadoria", where: "modelo didático", kind: "didatico" },
    ],
  },
  dependencia: {
    paths: [
      { about: "Explicação de cada alvo (o que é, o que o remédio faz, efeito desejado, efeitos indesejados, na prática)", src: "curadoria", where: "resumo a partir de Stahl's Essential Psychopharmacology (5ª ed.), do Prescriber's Guide (8ª ed.) e do Maudsley (15ª ed.)", kind: "didatico" },
      { about: "Mecanismos de cada remédio", src: "maudsley15", where: "cap. 4", kind: "fonte" },
      { about: "Topiramato: mecanismo e efeitos adversos", src: "stahl8", where: "monografia do topiramato", kind: "fonte" },
      { about: "Efeitos em níveis de 0 a 3", src: "curadoria", where: "a partir do cap. 4 do Maudsley", kind: "didatico" },
    ],
    synapse: [
      { about: "Abstinência precipitada, efeito teto e bloqueio da buprenorfina", src: "maudsley15", where: "seção da buprenorfina (cap. 4)", kind: "fonte" },
      { about: "Início, doses e cuidados (álcool)", src: "nice_cg115", where: "caixas 4.1 a 4.3 do Maudsley", kind: "fonte" },
      { about: "Reação álcool-dissulfiram", src: "maudsley15", where: "tabela 4.8", kind: "fonte" },
      { about: "Metadona e buprenorfina: escolha, titulação e QT", src: "maudsley15", where: "tabelas 4.11 a 4.13", kind: "fonte" },
      { about: "Tabaco: reposição, vareniclina e bupropiona", src: "maudsley15", where: "tabelas 4.20 e 4.21", kind: "fonte" },
      { about: "Modelo do receptor (ocupação e ativação)", src: "curadoria", where: "atividade intrínseca dos agonistas parciais (~40–45%) é valor didático", kind: "didatico" },
    ],
    quiz: [
      { about: "Casos de conduta", src: "curadoria", where: "redigidos a partir do cap. 4 do Maudsley", kind: "didatico" },
    ],
  },
};

window.PHARMA_REVIEW = {
  antipsicoticos: null,
  antidepressivos: null,
  estabilizadores: null,
  ansioliticos: null,
  estimulantes: null,
  demencias: null,
  dependencia: null,
};
