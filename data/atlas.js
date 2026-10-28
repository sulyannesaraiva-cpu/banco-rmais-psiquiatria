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
    { id: "frontoestriatais", tag: "CPF", color: "#d55e00", title: "Circuitos frontoestriatais", text: "Dorsolateral · orbitofrontal · cingulado anterior" },
    { id: "limbico", tag: "Lb", color: "#b0418a", title: "Sistema límbico e Papez", text: "Memória · emoção · Korsakoff" },
    { id: "neurotransmissores", tag: "DA", color: "#0b6b70", title: "Vias de neurotransmissores", text: "Dopamina, serotonina, noradrenalina, acetilcolina" },
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
};
