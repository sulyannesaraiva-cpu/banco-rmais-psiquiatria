/* Atlas de vias (área Simular → Vias). Primeiro módulo: circuito motor dos núcleos da base.
   - nodes: estruturas do esquema (posição em coordenadas do SVG, não anatômica).
   - edges: conexões; sign "+" excitatória (glutamato), "-" inibitória (GABA), "da" dopamina.
     A espessura no desenho acompanha a atividade da estrutura de origem.
   - scenarios: atividade relativa de cada estrutura (1 = normal; >1 mais ativa; <1 menos), no
     modelo clássico de vias direta e indireta. É um modelo didático: simplifica um circuito com
     muito mais conexões. Conteúdo conferido com Clinical Neurology for Psychiatrists, cap. 18.
   - steps: "seguir o sinal", cada passo acende algumas conexões. */

window.ATLAS = {
  modules: [
    { id: "nucleos-base", tag: "NB", color: "#0072b2", title: "Núcleos da base", text: "Vias direta e indireta · Parkinson · extrapiramidais", ready: true },
    { id: "frontoestriatais", tag: "CPF", color: "#d55e00", title: "Circuitos frontoestriatais", text: "Dorsolateral · orbitofrontal · cingulado anterior", ready: true },
    { id: "limbico", tag: "Lb", color: "#b0418a", title: "Sistema límbico e Papez", text: "Memória · emoção · Korsakoff", ready: true },
    { id: "neurotransmissores", tag: "DA", color: "#0b6b70", title: "Vias de neurotransmissores", text: "Dopamina, serotonina, noradrenalina, acetilcolina, histamina, orexina", ready: true },
    { id: "hha", tag: "HHA", color: "#009e73", title: "Eixo hipotálamo-hipófise-adrenal", text: "Estresse · cortisol · depressão" },
  ],
  classic: ["Corticoespinal", "Sensitivas", "Visual", "Nervos cranianos", "Territórios arteriais"],
  basal: {
    nodes: {
      cortex: { label: "Córtex motor", sub: "e pré-frontal", x: 40, y: 24, w: 680, h: 62 },
      striatumD1: { label: "Estriado · D1", sub: "via direta", x: 420, y: 168, w: 170, h: 66 },
      striatumD2: { label: "Estriado · D2", sub: "via indireta", x: 200, y: 168, w: 170, h: 66 },
      snc: { label: "SN compacta", sub: "dopamina", x: 30, y: 172, w: 140, h: 58 },
      gpe: { label: "Pálido externo", sub: "GPe", x: 110, y: 330, w: 200, h: 60 },
      stn: { label: "Subtalâmico", sub: "STN", x: 110, y: 480, w: 200, h: 60 },
      gpi: { label: "Pálido interno", sub: "GPi e SN reticulada", x: 450, y: 400, w: 230, h: 60 },
      thalamus: { label: "Tálamo", sub: "VA/VL", x: 450, y: 570, w: 230, h: 60 },
    },
    edges: [
      { id: "ctx-str1", from: "cortex", to: "striatumD1", sign: "+", path: "M505 88 V164" },
      { id: "ctx-str2", from: "cortex", to: "striatumD2", sign: "+", path: "M285 88 V164" },
      { id: "snc-str2", from: "snc", to: "striatumD2", sign: "da", path: "M172 201 H196", label: "D2: inibe" },
      { id: "snc-str1", from: "snc", to: "striatumD1", sign: "da", path: "M100 232 C100 262 380 262 470 236", label: "D1: excita" },
      { id: "str1-gpi", from: "striatumD1", to: "gpi", sign: "-", path: "M540 236 C560 300 570 350 568 396", label: "via direta" },
      { id: "str2-gpe", from: "striatumD2", to: "gpe", sign: "-", path: "M260 236 C250 280 230 300 220 326", label: "via indireta" },
      { id: "gpe-stn", from: "gpe", to: "stn", sign: "-", path: "M210 392 V476" },
      { id: "stn-gpi", from: "stn", to: "gpi", sign: "+", path: "M312 512 C380 500 420 470 446 448" },
      { id: "gpi-tha", from: "gpi", to: "thalamus", sign: "-", path: "M565 462 V566", label: "freia o tálamo" },
      { id: "tha-ctx", from: "thalamus", to: "cortex", sign: "+", path: "M682 600 H730 V56 H724", label: "movimento" },
    ],
    scenarios: [
      {
        id: "normal", label: "Normal",
        activity: {},
        change: "A dopamina da substância negra excita a via direta (D1) e inibe a indireta (D2). As duas ficam em equilíbrio.",
        result: "A via direta solta o tálamo para o movimento desejado; a indireta freia os movimentos que competem.",
        tone: "good",
      },
      {
        id: "parkinson", label: "Parkinson",
        activity: { snc: 0.2, striatumD1: 0.6, striatumD2: 1.5, gpe: 0.6, stn: 1.5, gpi: 1.6, thalamus: 0.5, cortex: 0.7 },
        change: "A substância negra degenera e falta dopamina no estriado: a via direta enfraquece e a indireta se solta. O pálido interno inibe mais o tálamo.",
        result: "Pouco movimento: bradicinesia, rigidez e tremor de repouso, do lado oposto à lesão quando assimétrica.",
        tone: "high",
      },
      {
        id: "antipsicotico", label: "Antipsicótico",
        activity: { striatumD2: 1.5, gpe: 0.6, stn: 1.4, gpi: 1.3, thalamus: 0.7, cortex: 0.8 },
        blocked: "snc-str2",
        change: "O D2 bloqueado tira o freio da dopamina sobre a via indireta, como se faltasse dopamina só nesse lado.",
        result: "Parkinsonismo induzido (o mesmo desequilíbrio do Parkinson, por outra causa). Em ~78% de ocupação de D2 começam os extrapiramidais.",
        tone: "high",
        link: { label: "Ver Extrapiramidais nos fármacos", cls: "antipsicoticos", mode: "eps" },
      },
      {
        id: "huntington", label: "Huntington",
        activity: { striatumD2: 0.4, striatumD1: 0.9, gpe: 1.5, stn: 0.5, gpi: 0.5, thalamus: 1.5, cortex: 1.3 },
        change: "Degeneram os neurônios GABA do estriado (o caudado atrofia). No modelo clássico, a via indireta é a primeira a falhar: o pálido externo se solta, o subtalâmico e o pálido interno ficam freados.",
        result: "O tálamo fica sem freio: movimentos involuntários (coreia), além de demência e sintomas psiquiátricos.",
        tone: "warn",
      },
      {
        id: "hemibalismo", label: "Lesão do subtalâmico",
        activity: { stn: 0.1, gpi: 0.5, thalamus: 1.6, cortex: 1.3 },
        lesion: "stn",
        change: "Uma lesão (em geral um AVC pequeno) tira o subtalâmico do circuito: o pálido interno perde a excitação que recebia dele.",
        result: "Hemibalismo: movimentos amplos e violentos de arremesso, do lado oposto à lesão.",
        tone: "warn",
      },
    ],
    steps: [
      { edges: ["ctx-str1", "ctx-str2"], text: "O córtex manda glutamato para o estriado: é o plano de movimento chegando aos núcleos da base." },
      { edges: ["snc-str1", "snc-str2"], text: "A substância negra (compacta) libera dopamina no estriado: pelo D1 excita a via direta; pelo D2 inibe a indireta." },
      { edges: ["str1-gpi"], text: "Via direta: o estriado (D1) inibe o pálido interno. Com o pálido freado, o tálamo fica livre." },
      { edges: ["str2-gpe", "gpe-stn"], text: "Via indireta: o estriado (D2) inibe o pálido externo, que deixa de frear o subtalâmico." },
      { edges: ["stn-gpi"], text: "O subtalâmico, solto, excita o pálido interno: o oposto da via direta." },
      { edges: ["gpi-tha", "tha-ctx"], text: "O pálido interno freia o tálamo (GABA). O tálamo, quando liberado, excita o córtex motor e o movimento sai." },
    ],
  },
  /* Circuitos frontoestriatais: modelo de alças paralelas córtex → estriado → pálido/SN
     reticulada → tálamo → córtex (Alexander et al., 1986; Cummings, 1993). Síndromes conforme
     Clinical Neurology for Psychiatrists (seção Frontal Lobe Disorders) e Cummings (1993);
     ligações com transtornos conforme Quevedo e Izquierdo (2020). */
  fronto: {
    levels: [
      { id: "cortex", label: "Córtex" },
      { id: "striatum", label: "Estriado" },
      { id: "pallidum", label: "Pálido / SN reticulada" },
      { id: "thalamus", label: "Tálamo" },
    ],
    circuits: [
      {
        id: "dorsolateral", label: "Dorsolateral", color: "#0072b2",
        nodes: { cortex: "Pré-frontal dorsolateral", striatum: "Caudado dorsolateral", pallidum: "GPi dorsomedial lateral e SNr rostrolateral", thalamus: "VA e mediodorsal" },
        function: "Funções executivas: planejar, manter informação em mente (memória de trabalho), mudar de estratégia, organizar e resolver problemas.",
        syndrome: "Síndrome disexecutiva",
        signs: ["Dificuldade para planejar e organizar", "Não consegue mudar de estratégia (rigidez, mudança de set prejudicada)", "Perseveração", "Pensamento lento, pouca fluência verbal", "Memória preservada, mas mal usada (busca desorganizada)"],
        disorders: [
          { name: "Dependência química", text: "Faz parte do circuito de controle executivo (com cingulado anterior e orbitofrontal lateral), que perde força frente aos circuitos de motivação e memória." },
          { name: "TDAH", text: "Circuitos frontoestriatais menos ativos; o metilfenidato muda a ativação dessas redes." },
        ],
      },
      {
        id: "orbitofrontal", label: "Orbitofrontal", color: "#d55e00",
        nodes: { cortex: "Orbitofrontal lateral", striatum: "Caudado ventromedial", pallidum: "GPi dorsomedial medial e SNr rostromedial", thalamus: "VA e mediodorsal" },
        function: "Comportamento social e inibição: frear impulsos, adequar a conduta ao contexto, avaliar recompensa e consequência.",
        syndrome: "Síndrome desinibida",
        signs: ["Desinibição e impulsividade", "Comentários e condutas socialmente inadequados", "Irritabilidade e labilidade afetiva", "Distraibilidade, preso ao estímulo do momento", "Jocosidade inadequada (witzelsucht)"],
        disorders: [
          { name: "TOC", text: "Disfunção nas conexões dos núcleos da base com os córtices orbitofrontal e cingulado anterior; as fibras passam pelo ramo anterior da cápsula interna, alvo de estimulação cerebral profunda." },
          { name: "Dependência química", text: "O orbitofrontal medial atribui saliência (motivação) e o lateral participa do controle; na dependência, motivação e memória superam o controle." },
        ],
      },
      {
        id: "cingulado", label: "Cingulado anterior", color: "#b0418a",
        nodes: { cortex: "Cingulado anterior", striatum: "Estriado ventral (accumbens)", pallidum: "Pálido ventral e GPi rostrolateral", thalamus: "Mediodorsal" },
        function: "Motivação e iniciativa: dar partida ao comportamento, atenção ao que importa, monitorar erros.",
        syndrome: "Síndrome apática",
        signs: ["Apatia: indiferença ao ambiente e à própria doença", "Abulia: pouca fala e pouca iniciativa", "Pouca resposta emocional", "Nas lesões bilaterais graves: mutismo acinético"],
        disorders: [
          { name: "TOC", text: "Junto com o orbitofrontal, o cingulado anterior aparece hiperconectado aos núcleos da base no TOC." },
          { name: "Depressão", text: "O cingulado anterior subgenual (área 25) regula o humor; é alvo experimental de estimulação cerebral profunda na depressão resistente." },
        ],
      },
    ],
    keyPoint: "Lesões em qualquer ponto da mesma alça (córtex, estriado, pálido ou tálamo) dão síndromes parecidas: é o circuito, e não só o córtex, que sustenta o comportamento.",
  },
  /* Sistema límbico e circuito de Papez: estruturas conforme Quevedo e Izquierdo (2020, cap. 1);
     Wernicke-Korsakoff, Klüver-Bucy e hipocampo no Alzheimer conforme Clinical Neurology for
     Psychiatrists. Posições do desenho são esquemáticas. */
  limbic: {
    nodes: {
      cingulo: { label: "Giro do cíngulo", x: 280, y: 30, w: 200, h: 58 },
      talamo: { label: "Núcleo anterior", sub: "do tálamo", x: 530, y: 170, w: 200, h: 58 },
      mamilares: { label: "Corpos mamilares", sub: "hipotálamo", x: 530, y: 350, w: 200, h: 58 },
      fornix: { label: "Fórnix", x: 280, y: 450, w: 200, h: 58 },
      hipocampo: { label: "Hipocampo", sub: "lobo temporal medial", x: 30, y: 350, w: 200, h: 58 },
      entorrinal: { label: "Para-hipocampal", sub: "e entorrinal", x: 30, y: 170, w: 200, h: 58 },
      amigdala: { label: "Amígdala", sub: "medo e emoção", x: 280, y: 290, w: 200, h: 58, extra: true },
    },
    edges: [
      { id: "hip-for", from: "hipocampo", to: "fornix", path: "M130 410 C140 470 200 482 276 480" },
      { id: "for-mam", from: "fornix", to: "mamilares", path: "M482 480 C560 482 620 450 628 412" },
      { id: "mam-tal", from: "mamilares", to: "talamo", path: "M630 348 V232", label: "trato mamilotalâmico" },
      { id: "tal-cin", from: "talamo", to: "cingulo", path: "M628 168 C620 100 560 60 484 60" },
      { id: "cin-ent", from: "cingulo", to: "entorrinal", path: "M276 60 C200 60 140 100 130 166" },
      { id: "ent-hip", from: "entorrinal", to: "hipocampo", path: "M130 230 V346" },
      { id: "ami-hip", from: "amigdala", to: "hipocampo", path: "M278 330 C250 345 240 360 234 370", extra: true },
    ],
    steps: [
      { edges: ["ent-hip"], text: "O córtex entorrinal leva ao hipocampo a informação que chega do córtex: é a porta de entrada da memória." },
      { edges: ["hip-for"], text: "Do hipocampo, as fibras saem pelo fórnix, um feixe em arco sob o corpo caloso." },
      { edges: ["for-mam"], text: "O fórnix termina nos corpos mamilares, no hipotálamo." },
      { edges: ["mam-tal"], text: "O trato mamilotalâmico leva o sinal ao núcleo anterior do tálamo." },
      { edges: ["tal-cin"], text: "O tálamo anterior projeta para o giro do cíngulo." },
      { edges: ["cin-ent"], text: "Do cíngulo, o sinal volta ao para-hipocampal e ao entorrinal, fechando o circuito." },
    ],
    lesions: [
      {
        id: "korsakoff", label: "Corpos mamilares", nodes: ["mamilares"],
        syndrome: "Wernicke-Korsakoff",
        cause: "Álcool crônico e deficiência de tiamina; os corpos mamilares estão entre as áreas mais vulneráveis.",
        signs: ["Amnésia anterógrada (não guarda o novo) e retrógrada (perde o que sabia)", "Na fase aguda (Wernicke): ataxia, nistagmo e paresia da movimentação ocular", "Neuropatia periférica e atrofia do verme cerebelar no alcoolismo crônico", "Confabulação: clássica nos livros, mas em geral discreta ou ausente"],
      },
      {
        id: "hipocampo", label: "Hipocampos", nodes: ["hipocampo"],
        syndrome: "Amnésia hipocampal",
        cause: "Doença de Alzheimer (a atrofia começa pelo hipocampo), encefalite herpética, hipóxia.",
        signs: ["Dificuldade de formar memórias novas (amnésia anterógrada)", "Memórias antigas relativamente preservadas no início", "No Alzheimer, a atrofia avança depois para os lobos temporal, parietal e frontal"],
      },
      {
        id: "kluver", label: "Amígdalas (temporal anterior)", nodes: ["amigdala", "hipocampo"],
        syndrome: "Klüver-Bucy",
        cause: "Lesão temporal bilateral: encefalite por herpes simples, demência frontotemporal, infarto bilateral da artéria cerebral posterior, encefalite límbica paraneoplásica.",
        signs: ["Hiperoralidade: come, fuma ou bebe de forma compulsiva", "Comportamento sexual aumentado em cerca de metade; em geral só falas ou gestos sugestivos", "Agressividade verbal ou gestual", "Agnosia visual (“cegueira psíquica”)", "Amnésia, afasia ou demência por lesão temporal associada"],
      },
    ],
    psychiatry: [
      { name: "Amígdala", text: "Medo, emoção, aprendizado e resposta de luta ou fuga. Disfunção descrita na depressão, no transtorno bipolar, no TEPT, nas demências, no autismo e no transtorno da personalidade borderline." },
      { name: "Hipocampo", text: "Atrofia do hipocampo anterior também aparece na esquizofrenia; no Alzheimer, é a primeira região a atrofiar." },
      { name: "Sistema límbico ampliado", text: "Depois de Papez, foram acrescentados a amígdala, a área frontobasal e o córtex orbitofrontal; é sítio importante de ação dos psicofármacos." },
    ],
  },
  /* Mapa dos sistemas de neurotransmissores num corte sagital esquemático. Origens e projeções
     conforme Quevedo e Izquierdo (2020, cap. 1) e Clinical Neurology for Psychiatrists (cap. de
     neurotransmissores); orexina conforme Clinical Neurology (sono) e Quevedo (tabela do sono). */
  neuro: {
    points: {
      pfc: { x: 126, y: 168, label: "Pré-frontal", lx: 126, ly: 152, anchor: "middle" },
      cortex: { x: 250, y: 70, label: "Córtex", lx: 250, ly: 94, anchor: "middle" },
      estriado: { x: 256, y: 190, label: "Estriado", lx: 268, ly: 186, anchor: "start" },
      accumbens: { x: 206, y: 232, label: "Accumbens", lx: 194, ly: 236, anchor: "end" },
      talamo: { x: 312, y: 206, label: "Tálamo", lx: 324, ly: 204, anchor: "start" },
      amigdala: { x: 288, y: 262, label: "Amígdala", lx: 300, ly: 252, anchor: "start" },
      hipocampo: { x: 350, y: 250, label: "Hipocampo", lx: 362, ly: 248, anchor: "start" },
      hipofise: { x: 236, y: 312, label: "Hipófise", lx: 226, ly: 330, anchor: "end" },
      cerebelo: { x: 420, y: 318, label: "Cerebelo", lx: 420, ly: 340, anchor: "middle" },
      medula: { x: 292, y: 396, label: "Medula", lx: 304, ly: 400, anchor: "start" },
      atv: { x: 296, y: 290, label: "ATV", origin: true, lx: 372, ly: 290, anchor: "start" },
      snc: { x: 318, y: 278, label: "SN compacta", origin: true, lx: 372, ly: 274, anchor: "start" },
      arqueado: { x: 252, y: 290, label: "Hipotálamo (arqueado)", origin: true, lx: 160, ly: 300, anchor: "end" },
      lc: { x: 328, y: 322, label: "Locus coeruleus", origin: true, lx: 372, ly: 346, anchor: "start" },
      rafe: { x: 304, y: 340, label: "Rafe", origin: true, lx: 372, ly: 366, anchor: "start" },
      meynert: { x: 222, y: 262, label: "N. basal de Meynert", origin: true, lx: 160, ly: 268, anchor: "end" },
      septo: { x: 200, y: 214, label: "Septo", origin: true, lx: 160, ly: 210, anchor: "end" },
      tuberomamilar: { x: 268, y: 300, label: "Tuberomamilar", origin: true, lx: 160, ly: 322, anchor: "end" },
      hipotlateral: { x: 262, y: 280, label: "Hipotálamo lateral", origin: true, lx: 160, ly: 284, anchor: "end" },
    },
    systems: [
      {
        id: "dopamina", label: "Dopamina", color: "#d55e00",
        paths: [["atv", "accumbens", "mesolímbica"], ["atv", "pfc", "mesocortical"], ["snc", "estriado", "nigroestriatal"], ["arqueado", "hipofise", "tuberoinfundibular"]],
        origin: "Área tegmental ventral e substância negra (e hipotálamo, para a hipófise).",
        targets: "Pré-frontal, accumbens, estriado, hipófise; também tálamo, amígdala e hipocampo.",
        role: "Recompensa, cognição, movimento e controle da prolactina; ligada aos sintomas psicóticos.",
        clinic: "Falta no estriado: Parkinson. Excesso (L-dopa, cocaína, anfetamina): alucinações, delírios e movimentos hipercinéticos.",
        drugs: "Antipsicóticos (bloqueio D2), estimulantes e bupropiona (aumentam a dopamina).",
        link: { cls: "antipsicoticos", label: "Abrir antipsicóticos" },
      },
      {
        id: "noradrenalina", label: "Noradrenalina", color: "#0072b2",
        paths: [["lc", "cortex"], ["lc", "pfc"], ["lc", "talamo"], ["lc", "cerebelo"], ["lc", "medula"]],
        origin: "Locus coeruleus, na ponte (e área tegmental lateral).",
        targets: "Os mesmos alvos da dopamina, mais cerebelo e medula espinal.",
        role: "Vigília, atenção, humor e cognição.",
        clinic: "No Parkinson o locus coeruleus também degenera: hipotensão ortostática, alterações do sono e depressão.",
        drugs: "IRSN, tricíclicos, mirtazapina (bloqueio α2), atomoxetina, clonidina e guanfacina.",
        link: { cls: "antidepressivos", label: "Abrir antidepressivos" },
      },
      {
        id: "serotonina", label: "Serotonina", color: "#b0418a",
        paths: [["rafe", "cortex"], ["rafe", "pfc"], ["rafe", "amigdala"], ["rafe", "estriado"], ["rafe", "cerebelo"], ["rafe", "medula", "analgesia"]],
        origin: "Núcleos da rafe no tronco: os dorsais sobem; os caudais descem para a medula.",
        targets: "Córtex, sistema límbico, estriado e cerebelo; medula (controle da dor).",
        role: "Humor, ansiedade, sono e dor; máxima na vigília, cai no sono de ondas lentas e some no REM.",
        clinic: "Depressão é o transtorno mais ligado a pouca serotonina; 5-HIAA baixo no líquor em suicídios violentos.",
        drugs: "ISRS, IRSN, tricíclicos, IMAO, vortioxetina, trazodona.",
        link: { cls: "antidepressivos", label: "Abrir antidepressivos" },
      },
      {
        id: "acetilcolina", label: "Acetilcolina", color: "#009e73",
        paths: [["meynert", "cortex"], ["meynert", "pfc"], ["meynert", "amigdala"], ["septo", "hipocampo"]],
        origin: "Núcleo basal de Meynert e septo medial, no prosencéfalo basal.",
        targets: "Todo o córtex, sobretudo hipocampo, amígdala e áreas de associação.",
        role: "Cognição e, principalmente, memória.",
        clinic: "Perda colinérgica no Alzheimer (e ainda maior na demência com corpos de Lewy).",
        drugs: "Anticolinesterásicos (aumentam); anticolinérgicos e remédios com bloqueio M1 (pioram a cognição).",
        link: { cls: "demencias", label: "Abrir fármacos nas demências" },
      },
      {
        id: "histamina", label: "Histamina", color: "#8a6a00",
        paths: [["tuberomamilar", "pfc"], ["tuberomamilar", "cortex"], ["tuberomamilar", "estriado"], ["tuberomamilar", "talamo"], ["tuberomamilar", "hipocampo"], ["tuberomamilar", "medula"]],
        origin: "Núcleo tuberomamilar, no hipotálamo.",
        targets: "Região frontal, núcleos da base, amígdala, hipocampo, tálamo e medula.",
        role: "Despertar e manutenção da vigília.",
        clinic: "Bloquear o H1 dá sono e apetite: é o mecanismo da sedação de muitos psicofármacos.",
        drugs: "Doxepina em dose baixa (só H1); sedação de quetiapina, mirtazapina, olanzapina e tricíclicos.",
        link: { cls: "ansioliticos", label: "Abrir ansiolíticos e hipnóticos" },
      },
      {
        id: "orexina", label: "Orexina", color: "#4f5bd5",
        paths: [["hipotlateral", "lc"], ["hipotlateral", "rafe"], ["hipotlateral", "tuberomamilar"], ["hipotlateral", "cortex"]],
        origin: "Hipotálamo lateral (orexina = hipocretina).",
        targets: "Locus coeruleus e outros centros do tronco ligados ao sono e à vigília, além do córtex.",
        role: "Mantém a vigília, inibe o sono REM e estimula o apetite.",
        clinic: "Na narcolepsia com cataplexia, a hipocretina no líquor está ausente ou quase.",
        drugs: "Antagonistas de orexina (suvorexanto, daridorexanto) como hipnóticos; contraindicados na narcolepsia.",
        link: { cls: "ansioliticos", label: "Abrir ansiolíticos e hipnóticos" },
      },
    ],
  },
};