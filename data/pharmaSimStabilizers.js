/* Dados do simulador de psicofarmacologia: estabilizadores de humor. Material didático e
   simplificado: não serve para prescrição.
   - receptors: mecanismos com nível qualitativo (0 = sem ação, 4 = ação principal), conforme o
     mecanismo descrito em Stahl, Prescriber's Guide 8ª ed. (2024).
   - indications: evidência relativa por fase (0 = sem evidência, 3 = forte), resumida de Maudsley
     Prescribing Guidelines 15ª ed., cap. 2.
   - effects: classificação didática (0 a 3) dos efeitos que mais pesam na prática e em prova, a
     partir de Maudsley (cap. 2) e Stahl.
   - level: faixas de nível sérico e interações citadas em Maudsley 15ª ed. (lítio: faixas, toxicidade
     e tabela 2.2; valproato e carbamazepina: faixas e autoindução). Lamotrigina: titulação e
     interações conforme Stahl. */

window.PHARMA_SIM = window.PHARMA_SIM || {};
window.PHARMA_SIM.estabilizadores = {
  id: "estabilizadores",
  kind: "stabilizer",
  label: "Estabilizadores de humor",
  tagline: "Onde cada estabilizador age, para que fase serve, o nível no sangue e as interações que mudam esse nível.",
  source: "Mecanismos conforme Stahl (Prescriber's Guide, 8ª ed.); faixas de nível, toxicidade e interações conforme Maudsley Prescribing Guidelines (15ª ed., cap. 2). Classificação de efeitos e de evidência é didática.",
  defaults: { drug: "litio", a: "litio", b: "valproato" },
  receptors: [
    { id: "NA", label: "Canais de Na⁺", role: "Bloqueio dos canais de sódio voltagem-dependentes: menos disparo neuronal" },
    { id: "CA", label: "Canais de Ca²⁺", role: "Bloqueio de canais de cálcio: menos liberação de neurotransmissor" },
    { id: "GLU", label: "↓ Glutamato", role: "Menos liberação de glutamato (excitação)" },
    { id: "GABA", label: "↑ GABA", role: "Mais GABA no cérebro (inibição)" },
    { id: "INTRA", label: "Sinalização", role: "Vias dentro da célula: inositol, GSK-3, proteína quinase C" },
  ],
  indications: [
    { id: "mania", label: "Mania aguda" },
    { id: "depression", label: "Depressão bipolar" },
    { id: "prevMania", label: "Prevenção de mania" },
    { id: "prevDepression", label: "Prevenção de depressão" },
  ],
  effects: [
    { id: "tremor", label: "Tremor", why: "lítio e valproato: tremor fino dose-dependente" },
    { id: "weight", label: "Ganho de peso", why: "maior com valproato e lítio" },
    { id: "sedation", label: "Sedação", why: "maior com os anticonvulsivantes" },
    { id: "thyroid", label: "Hipotireoidismo", why: "lítio inibe a liberação de hormônio tireoidiano" },
    { id: "renal", label: "Rim", why: "lítio: diabetes insípido nefrogênico e, a longo prazo, doença renal" },
    { id: "teratogen", label: "Teratogenicidade", why: "valproato é o pior (tubo neural e neurodesenvolvimento)" },
    { id: "rash", label: "Rash grave", why: "Stevens-Johnson: lamotrigina (titulação rápida) e carbamazepina (HLA-B*15:02)" },
    { id: "hyponatremia", label: "Hiponatremia", why: "oxcarbazepina e carbamazepina (efeito tipo SIADH)" },
    { id: "blood", label: "Sangue", why: "carbamazepina: agranulocitose e anemia aplástica (raras); valproato: plaquetas" },
    { id: "liver", label: "Fígado e pâncreas", why: "valproato: hepatotoxicidade, pancreatite, hiperamonemia" },
    { id: "interactions", label: "Interações", why: "lítio: IECA, tiazídico, AINE; carbamazepina: indutor; valproato: inibidor" },
  ],
  drugs: [
    {
      id: "litio", name: "Lítio", group: "Lítio", search: ["litio", "lítio"],
      receptors: { NA: 1, CA: 0, GLU: 1, GABA: 0, INTRA: 4 },
      indications: { mania: 3, depression: 1, prevMania: 3, prevDepression: 2 },
      effects: { tremor: 3, weight: 2, sedation: 1, thyroid: 3, renal: 3, teratogen: 1, rash: 0, hyponatremia: 0, blood: 0, liver: 0, interactions: 3 },
      extra: "Mecanismo complexo: inibe a inositol monofosfatase e a GSK-3 e reduz a proteína quinase C. Melhor estabilizador para prevenção e o único com efeito antissuicida consistente.",
      level: {
        unit: "mmol/L", min: 0, max: 3, step: 0.05, start: 0.7, decimals: 2,
        zones: [
          { to: 0.4, tone: "low", label: "Subterapêutico", text: "Abaixo da faixa usada para prevenção." },
          { to: 0.6, tone: "ok", label: "Manutenção baixa (0,4–0,6)", text: "Opção quando a resposta é boa mas a tolerância é ruim." },
          { to: 0.8, tone: "good", label: "Manutenção (0,6–0,8)", text: "Faixa recomendada para a manutenção: o nível mais alto tolerado dentro dela." },
          { to: 1.0, tone: "good", label: "Mania aguda (0,8–1,0)", text: "Faixa para a mania aguda, ou na manutenção quando a resposta é insuficiente. Acima de 0,8 o risco renal é maior." },
          { to: 1.5, tone: "warn", label: "Acima do alvo (1,0–1,5)", text: "Mais efeitos colaterais; rever dose, função renal e interações." },
          { to: 2.0, tone: "high", label: "Toxicidade (acima de 1,5)", text: "Náusea, diarreia, fraqueza, sonolência, confusão, ataxia, tremor grosseiro e abalos musculares." },
          { to: 3.0, tone: "high", label: "Toxicidade grave (acima de 2)", text: "Desorientação e convulsões, que podem evoluir para coma e morte. Acima de 3, diálise é frequente." },
        ],
        interactions: [
          { id: "ieca", label: "IECA ou BRA", effect: "Pode aumentar o lítio em até 4 vezes, de forma imprevisível; aparece ao longo de semanas.", factor: 4 },
          { id: "tiazidico", label: "Diurético tiazídico", effect: "Pode aumentar o lítio em até 4 vezes; costuma aparecer nos primeiros 10 dias. Diurético de alça é mais seguro.", factor: 4 },
          { id: "aine", label: "AINE", effect: "Aumento de 10% a mais de 4 vezes, em dias a meses. Atenção: muitos são vendidos sem receita.", factor: 4 },
          { id: "desidratacao", label: "Desidratação ou pouco sal", effect: "Tudo que muda o manejo do sódio pelo rim sobe o lítio (sem número fixo).", factor: 0 },
        ],
      },
    },
    {
      id: "valproato", name: "Valproato", group: "Anticonvulsivante", search: ["valproato", "acido valproico", "divalproato"],
      receptors: { NA: 2, CA: 1, GLU: 1, GABA: 3, INTRA: 2 },
      indications: { mania: 3, depression: 1, prevMania: 2, prevDepression: 1 },
      effects: { tremor: 2, weight: 3, sedation: 2, thyroid: 0, renal: 0, teratogen: 3, rash: 1, hyponatremia: 0, blood: 2, liver: 3, interactions: 2 },
      extra: "Bloqueia canais de sódio e aumenta o GABA. Inibe a glucuronidação: dobra o nível da lamotrigina. Evitar em mulheres em idade fértil (malformações e prejuízo do neurodesenvolvimento).",
      level: {
        unit: "mg/L", min: 0, max: 150, step: 1, start: 75, decimals: 0,
        zones: [
          { to: 50, tone: "low", label: "Abaixo de 50", text: "Na mania, níveis abaixo de ~55 não foram melhores que placebo; na manutenção o alvo provável é de pelo menos 50." },
          { to: 94, tone: "good", label: "Faixa terapêutica (50–94)", text: "Faixa usual de tratamento." },
          { to: 100, tone: "good", label: "Resposta mais robusta na mania (acima de ~94)", text: "Níveis acima de ~94 se associaram à melhor resposta na mania aguda." },
          { to: 150, tone: "high", label: "Acima de 100", text: "Os efeitos adversos, muitos ligados ao pico do nível, aumentam bastante acima de 100." },
        ],
        interactions: [],
      },
    },
    {
      id: "carbamazepina", name: "Carbamazepina", group: "Anticonvulsivante", search: ["carbamazepina"],
      receptors: { NA: 4, CA: 1, GLU: 2, GABA: 0, INTRA: 0 },
      indications: { mania: 2, depression: 1, prevMania: 2, prevDepression: 1 },
      effects: { tremor: 1, weight: 1, sedation: 2, thyroid: 1, renal: 0, teratogen: 2, rash: 3, hyponatremia: 2, blood: 3, liver: 1, interactions: 3 },
      extra: "Bloqueador de canais de sódio. Indutor enzimático potente, inclusive do próprio metabolismo. HLA-B*15:02 prediz reações cutâneas graves (testar em pessoas do Sudeste Asiático).",
      level: {
        unit: "mg/L", min: 0, max: 20, step: 0.5, start: 8, decimals: 1,
        zones: [
          { to: 4, tone: "low", label: "Abaixo de 4", text: "Abaixo da faixa antiepiléptica." },
          { to: 7, tone: "ok", label: "4–7", text: "Dentro da faixa antiepiléptica (4–12), mas no transtorno de humor pode ser preciso chegar a pelo menos 7." },
          { to: 12, tone: "good", label: "7–12", text: "Faixa geralmente usada no transtorno de humor." },
          { to: 20, tone: "high", label: "Acima de 12", text: "Mais efeitos adversos." },
        ],
        interactions: [
          { id: "autoinducao", label: "Autoindução (2 a 4 semanas)", effect: "Com a mesma dose, a meia-vida cai de cerca de 30 h para 12 h e o nível tende a cair (estimativa didática: ~40% do inicial). Por isso o nível é refeito 2 a 4 semanas depois de começar ou aumentar a dose.", factor: 0.4 },
        ],
      },
    },
    {
      id: "oxcarbazepina", name: "Oxcarbazepina", group: "Anticonvulsivante", search: ["oxcarbazepina"],
      receptors: { NA: 4, CA: 2, GLU: 2, GABA: 0, INTRA: 0 },
      indications: { mania: 1, depression: 0, prevMania: 1, prevDepression: 0 },
      effects: { tremor: 1, weight: 1, sedation: 2, thyroid: 0, renal: 0, teratogen: 1, rash: 2, hyponatremia: 3, blood: 1, liver: 0, interactions: 1 },
      extra: "Parente da carbamazepina, com indução enzimática menor, mas hiponatremia mais frequente. Evidência no transtorno bipolar menor que a da carbamazepina.",
      level: null,
    },
    {
      id: "lamotrigina", name: "Lamotrigina", group: "Anticonvulsivante", search: ["lamotrigina"],
      receptors: { NA: 4, CA: 1, GLU: 3, GABA: 0, INTRA: 0 },
      indications: { mania: 0, depression: 2, prevMania: 0, prevDepression: 3 },
      effects: { tremor: 1, weight: 0, sedation: 1, thyroid: 0, renal: 0, teratogen: 1, rash: 3, hyponatremia: 0, blood: 0, liver: 0, interactions: 2 },
      extra: "Bloqueia canais de sódio e a liberação de glutamato. Previne sobretudo a depressão, não a mania. Titulação lenta para reduzir o risco de Stevens-Johnson.",
      level: null,
      titration: {
        weeks: [
          { label: "Semanas 1–2", dose: 25 },
          { label: "Semanas 3–4", dose: 50 },
          { label: "Semana 5", dose: 100 },
          { label: "Semana 6 em diante", dose: 200 },
        ],
        modifiers: [
          { id: "valproato", label: "Com valproato", factor: 0.5, effect: "O valproato pode dobrar o nível da lamotrigina: titulação e dose pela metade." },
          { id: "indutor", label: "Com carbamazepina (indutor)", factor: 2, effect: "Indutores reduzem o nível: titulação e dose maiores (manutenção usual de 300–500 mg/dia)." },
        ],
      },
    },
  ],
};
