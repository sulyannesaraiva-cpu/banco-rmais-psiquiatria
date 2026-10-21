/* Guarda no navegador o tema e o subtema de cada questão, para não reclassificar o banco
   inteiro (~3 mil questões, ~1 s no computador e vários segundos no celular) a cada visita.
   - Cada questão guarda uma assinatura (tamanho do enunciado e das alternativas já corrigidos +
     tema escolhido à mão): se a questão muda, só ela é recalculada.
   - A versão do armazenamento junta o código das regras e o banco didático (que treina o
     classificador das provas): se qualquer um muda, tudo é recalculado uma vez. */
(function setupClassificationStore() {
  const STORE_KEY = "banco-rmais-classification";

  function hash(text) {
    let value = 5381;
    for (let i = 0; i < text.length; i += 1) value = ((value << 5) + value + text.charCodeAt(i)) | 0;
    return (value >>> 0).toString(36);
  }

  let store = null;
  let saveTimer = null;

  function rulesVersion() {
    const didactic = state.questions.reduce((sum, question) => sum + String(question.text || "").length, state.questions.length);
    return hash([
      isPsychopharmacologyQuestion.toString(),
      PSYCHOPHARM_DRUGS.join(","),
      PSYCHOPHARM_FOCUS.join(","),
      JSON.stringify(SUBTHEME_RULES.map((rule) => [rule.label, rule.topics, rule.keywords])),
      JSON.stringify(DEFAULT_SUBTHEME_BY_TOPIC),
      typeof window.examTopicsFingerprint === "string" ? window.examTopicsFingerprint : "",
      didactic,
    ].join("|"));
  }

  function ensureStore() {
    if (store) return store;
    if (!state.questions.length) return null;
    const version = rulesVersion();
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (saved && saved.version === version && saved.topics && saved.subthemes && Array.isArray(saved.labels)) store = saved;
    } catch {}
    if (!store) store = { version, labels: [], topics: {}, subthemes: {} };
    return store;
  }

  /* Os nomes de tema/subtema ficam numa tabela; cada questão guarda só a posição (economiza espaço). */
  function labelIndex(label) {
    let index = store.labels.indexOf(label);
    if (index < 0) index = store.labels.push(label) - 1;
    return index;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
      } catch (error) {
        console.warn("classificação não guardada no navegador:", error.message);
      }
    }, 1500);
  }

  function signature(question) {
    const view = effectiveQuestion(question);
    const optionsLength = (view.options || []).reduce((sum, option) => sum + String(option.text || "").length, 0);
    return hash(`${String(view.text || "").length}.${optionsLength}.${manualStudyTopic(question)}`);
  }

  function remembered(bucket, question, key, compute) {
    const current = ensureStore();
    if (!current || !question?.id) return compute();
    const entry = current[bucket][question.id];
    if (entry && entry[0] === key && current.labels[entry[1]] !== undefined) return current.labels[entry[1]];
    const value = compute();
    current[bucket][question.id] = [key, labelIndex(value)];
    scheduleSave();
    return value;
  }

  /* Memória da sessão na frente do armazenamento: topicForQuestion roda dezenas de milhares de
     vezes por tela. Limpa junto com o cache de classificação (correções carregadas/salvas). */
  const sessionTopics = new Map();
  const sessionSubthemes = new Map();
  const baseClearClassificationCache = clearClassificationCache;
  clearClassificationCache = function clearClassificationCacheWithStore() {
    sessionTopics.clear();
    sessionSubthemes.clear();
    return baseClearClassificationCache();
  };

  const computeTopic = topicForQuestion;
  topicForQuestion = function storedTopicForQuestion(question) {
    if (question?.id && sessionTopics.has(question.id)) return sessionTopics.get(question.id);
    const topic = remembered("topics", question, signature(question), () => computeTopic(question));
    if (question?.id && store) sessionTopics.set(question.id, topic);
    return topic;
  };

  const computeSubtheme = questionSubtheme;
  questionSubtheme = function storedQuestionSubtheme(question) {
    if (question?.id && sessionSubthemes.has(question.id)) return sessionSubthemes.get(question.id);
    const topic = topicForQuestion(question);
    const subtheme = remembered("subthemes", question, hash(`${signature(question)}.${topic}`), () => computeSubtheme(question));
    if (question?.id && store) sessionSubthemes.set(question.id, subtheme);
    return subtheme;
  };
})();
