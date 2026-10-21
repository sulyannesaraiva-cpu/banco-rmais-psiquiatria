/* Classificação das questões de provas nos temas do Estudo por temas.
   As provas só trazem a área da prova ("Psiquiatria Geral", "Forense"...), não o tema clínico.
   1. Psicofarmacologia: mesma regra das didáticas (isPsychopharmacologyQuestion).
   2. Provas da área Forense ou Psicoterapia: tema da área.
   3. Palavras-chave claras de Forense/Ética, Psicoterapias ou Saúde Mental Coletiva.
   4. O resto: classificador (Naive Bayes) treinado com as questões didáticas, que já têm tema,
      reforçado por palavras-chave de cada tema. Em validação cruzada nas didáticas acerta ~82%.
   Classificações com confiança baixa ficam marcadas (examTopicConfidence < 0.9) para revisão. */
(function setupExamTopics() {
  const FORENSIC_TOPIC = "Forense e Ética";
  const PSYCHOTHERAPY_TOPIC = "Psicoterapias";
  const PUBLIC_HEALTH_TOPIC = "Saúde Mental Coletiva e Políticas";
  const KEYWORD_WEIGHT = 4;
  const LOW_CONFIDENCE = 0.9;

  const STOPWORDS = new Set(
    ("a o e de da do das dos em no na nos nas um uma uns umas para por com sem que se ao aos as os mais menos como qual quais " +
      "sobre entre ou seu sua seus suas pelo pela pelos pelas este esta esse essa isso isto ser sao foi tem ter nao sim mas ja " +
      "muito pode podem deve devem caso paciente pacientes anos ano alternativa correta incorreta assinale seguinte seguintes " +
      "afirmativa afirmativas respeito acordo quanto opcao item itens apenas todas todos exceto verdadeira falsa questao").split(" "),
  );


  const TOPIC_KEYWORDS = {
    "Transtornos da Personalidade": ["personalidade", "borderline", "antissocial", "narcisis", "histrioni", "esquizotip", "esquizoide", "paranoide", "evitativ", "cluster"],
    "Transtornos Psicóticos": ["esquizofren", "psicose", "psicotic", "esquizoafetiv", "delirante persistente", "sintomas positivos", "sintomas negativos", "alucinacoes auditivas", "catatoni"],
    "Transtornos do Humor": ["depress", "bipolar", "mania", "maniac", "hipomania", "distimi", "ciclotimi", "suicid", "luto", "melancol"],
    "Psicopatologia": ["psicopatolog", "exame do estado mental", "exame psiquico", "sensopercep", "pseudoalucina", "juizo de realidade", "despersonaliza", "desrealiza", "forma do pensamento", "curso do pensamento", "fuga de ideias", "neologism"],
    "Neuroanatomia e Neurofisiologia": ["neuroanatom", "neurotransmiss", "lobo frontal", "lobo temporal", "sistema limbico", "amigdala", "hipocampo", "ganglios da base", "cortex pre-frontal", "via mesolimbica", "neurofisiolog"],
    "Distúrbios do Sono": ["sono", "insonia", "apneia", "narcolepsia", "parassonia", "sonambul", "pesadelo", "ritmo circadiano", "polissonografia", "pernas inquietas"],
    "Transtornos Alimentares": ["anorexia", "bulimia", "compulsao alimentar", "alimentar", "imagem corporal", "pica", "ruminacao"],
    "Intoxicação por Drogas e Dependência Química": ["alcool", "cocain", "crack", "cannabis", "maconha", "opioide", "opiaceo", "abstinencia", "dependencia quimica", "tabag", "nicotin", "anfetamin", "intoxicac", "substancia", "wernicke", "korsakoff"],
    "Demências e transtornos neurocognitivos": ["demencia", "alzheimer", "corpos de lewy", "frontotemporal", "comprometimento cognitivo", "neurocognitiv", "minimental", "meem"],
    "Delirium, consciência e neuropsiquiatria clínica": ["delirium", "rebaixamento", "nivel de consciencia", "encefalopat", "coma", "estado confusional", "epilepsi", "convuls", "traumatismo craniano"],
    "Ansiedade, TOC, trauma e somatoformes": ["ansiedade", "panico", "fobia", "agorafobi", "obsessiv", "compulsiv", "estresse pos-traumatico", "tept", "trauma", "somatiza", "conversiv", "dissociativ", "hipocondr", "sintomas somaticos"],
    "Psiquiatria Infantil": ["crianca", "infancia", "adolescen", "escolar", "tdah", "autis", "espectro autista", "enurese", "encoprese", "tique", "tourette", "oposicao desafiante"],
    "Desenvolvimento Neuropsicomotor": ["desenvolvimento neuropsicomotor", "marcos do desenvolvimento", "meses de idade", "lactente", "apego", "piaget", "deficiencia intelectual"],
    "Saúde do Idoso": ["idoso", "envelhecimento", "geriatr", "fragilidade", "quedas", "polifarmacia", "senescen", "cuidador"],
  };

  /* Temas que não existem nas didáticas: entram só por palavra-chave (ou pela área da prova). */
  const RULE_TOPICS = [
    [FORENSIC_TOPIC, ["forense", "pericia", "perito", "imputab", "interdicao", "curatela", "capacidade civil", "codigo penal", "codigo civil", "medida de seguranca", "internacao involuntaria", "internacao compulsoria", "10.216", "sigilo", "etica medica", "codigo de etica", "conselho federal de medicina", "cfm", "resolucao", "responsabilidade penal", "laudo", "inss", "previdenciari"]],
    [PUBLIC_HEALTH_TOPIC, ["caps", "raps", "rede de atencao psicossocial", "consultorio na rua", "reforma psiquiatrica", "residencia terapeutica", "matriciamento", "atencao primaria", "atencao basica", "saude mental coletiva", "politica nacional", "epidemiolog", "prevalencia", "estrategia saude da familia", "sus"]],
    [PSYCHOTHERAPY_TOPIC, ["psicoterapia", "psicanal", "freud", "winnicott", "melanie klein", "lacan", "bion", "kohut", "contratransferencia", "neurose de transferencia", "mecanismo de defesa", "mecanismos de defesa", "terapia cognitiv", "terapia comportamental", "mentalizacao", "terapia interpessoal", "terapia familiar", "terapia de grupo", "alianca terapeutica", "entrevista motivacional", "psicodinamic", "metapsicolog"]],
  ];

  /* Siglas curtas (caps, sus, cfm) só contam como palavra inteira. */
  const compileKeywords = (list) =>
    list.map(normalize).map((word) => (word.length <= 4 ? new RegExp(`\\b${word}\\b`) : word));
  for (const key of Object.keys(TOPIC_KEYWORDS)) TOPIC_KEYWORDS[key] = compileKeywords(TOPIC_KEYWORDS[key]);
  for (const rule of RULE_TOPICS) rule[1] = compileKeywords(rule[1]);

  const baseTopicForQuestion = topicForQuestion;
  let model = null;
  let examIds = null;
  const cache = new Map();

  function cleanText(text) {
    /* Muitas questões da ABP começam citando o livro-texto; isso não diz nada sobre o tema. */
    return String(text || "").replace(REFERENCE_CITATION, "");
  }

  function questionText(question) {
    return normalize([cleanText(question.text), ...(question.options || []).map((option) => option.text)].join(" "));
  }

  function tokens(text) {
    return [...new Set(text.replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !STOPWORDS.has(word)))];
  }

  function keywordHits(text, list) {
    let hits = 0;
    for (const word of list) {
      if (typeof word === "string" ? text.includes(word) : word.test(text)) hits += 1;
    }
    return hits;
  }

  function trainModel() {
    const classes = new Map();
    const vocab = new Set();
    let total = 0;
    for (const question of state.questions) {
      if (isExcluded(question.id)) continue;
      const label = baseTopicForQuestion(question);
      if (label === PSYCHOPHARM_SESSION_TOPIC) continue;
      let entry = classes.get(label);
      if (!entry) {
        entry = { docs: 0, counts: new Map(), sum: 0 };
        classes.set(label, entry);
      }
      entry.docs += 1;
      total += 1;
      for (const word of tokens(questionText(question))) {
        entry.counts.set(word, (entry.counts.get(word) || 0) + 1);
        entry.sum += 1;
        vocab.add(word);
      }
    }
    return { classes, vocab, total };
  }

  function predict(text) {
    const words = tokens(text).filter((word) => model.vocab.has(word));
    const vocabSize = model.vocab.size;
    const scores = [];
    for (const [label, entry] of model.classes) {
      let score = 0.5 * Math.log(entry.docs / model.total);
      for (const word of words) score += Math.log(((entry.counts.get(word) || 0) + 0.5) / (entry.sum + 0.5 * vocabSize));
      score += KEYWORD_WEIGHT * Math.min(keywordHits(text, TOPIC_KEYWORDS[label] || []), 4);
      scores.push([label, score]);
    }
    scores.sort((a, b) => b[1] - a[1]);
    const best = scores[0][1];
    const sum = scores.reduce((acc, [, score]) => acc + Math.exp(score - best), 0);
    return { topic: scores[0][0], confidence: 1 / sum };
  }

  function examAreaOf(question) {
    return normalize(question.topic || question.area || question.__examArea || "");
  }

  function classify(question) {
    if (isPsychopharmacologyQuestion(question)) return { topic: PSYCHOPHARM_SESSION_TOPIC, confidence: 1 };
    const area = examAreaOf(question);
    if (area.includes("forense")) return { topic: FORENSIC_TOPIC, confidence: 1 };
    if (area.includes("psicoterap")) return { topic: PSYCHOTHERAPY_TOPIC, confidence: 1 };
    const text = questionText(question);
    const prediction = predict(text);
    const ownHits = keywordHits(text, TOPIC_KEYWORDS[prediction.topic] || []);
    for (const [topic, list] of RULE_TOPICS) {
      const hits = keywordHits(text, list);
      /* A regra só vence quando o tema clínico previsto não tem palavra-chave própria forte. */
      if ((hits >= 2 && ownHits < 2) || (hits === 1 && ownHits === 0 && prediction.confidence < LOW_CONFIDENCE)) {
        return { topic, confidence: hits >= 2 ? 0.95 : 0.8 };
      }
    }
    return prediction;
  }

  function ensureReady() {
    if (examIds && model) return true;
    if (!state.questions.length || !state.exams.length) return false;
    examIds = new Map();
    for (const exam of state.exams) {
      for (const question of exam.questions || []) examIds.set(question.id, exam.area || "");
    }
    model = trainModel();
    return true;
  }

  function examTopicInfo(question) {
    if (!question || !ensureReady() || !examIds.has(question.id)) return null;
    if (!cache.has(question.id)) {
      cache.set(question.id, classify({ ...question, __examArea: examIds.get(question.id) }));
    }
    return cache.get(question.id);
  }

  /* Usado pela administração para revisar as classificações duvidosas. */
  window.examTopicConfidence = (question) => examTopicInfo(question)?.confidence ?? null;

  topicForQuestion = function topicForQuestionWithExams(question) {
    const manual = manualStudyTopic(question);
    if (manual) return manual;
    const info = examTopicInfo(question);
    return info ? info.topic : baseTopicForQuestion(question);
  };
})();
