/* Segunda rodada de cartões para Transtornos do Humor e Psiquiatria Infantil, os dois temas com
   mais questões de prova por cartão (outubro/2026). Escritos a partir de uma nova amostra das
   questões de prova do banco. Entram no fim dos decks existentes, herdando o subtema do deck. */
(function addExamGapFlashcardsRound2() {
  const root = window.BANCO_RMAIS_FLASHCARDS || (window.BANCO_RMAIS_FLASHCARDS = { decks: [] });
  if (!Array.isArray(root.decks)) return;

  const extras = {
    "pg-depressao-suicidio": [
      ["Quais fatores aumentam o risco de recorrência da depressão?", "Sexo feminino, sintomas residuais após o tratamento, número de episódios prévios, início precoce, comorbidades e suspensão precoce do antidepressivo.", ["Depressão", "Recorrência"]],
      ["Qual a diferença entre sexos na depressão?", "Mulheres têm cerca de 2 vezes mais chance de depressão ao longo da vida e no último ano, diferença que começa na adolescência.", ["Depressão", "Epidemiologia"]],
      ["O que exige o especificador 'com padrão sazonal'?", "Relação temporal regular entre o início dos episódios e uma época do ano, com remissão completa também em época característica, por pelo menos 2 anos, e episódios sazonais superando os não sazonais.", ["Depressão", "Sazonal"]],
      ["Quando pedir exames complementares na depressão?", "Não há exame que faça o diagnóstico. Exames (TSH, hemograma, B12, neuroimagem) servem quando há suspeita de outra doença causando o quadro: início tardio, curso atípico, sinais neurológicos ou má resposta.", ["Depressão", "Investigação"]],
      ["Como a escala Columbia (C-SSRS) gradua a ideação suicida?", "Desejo de estar morto; pensamentos suicidas sem método; com método, sem intenção; com alguma intenção; com plano e intenção. À parte, investiga comportamentos: tentativas e atos preparatórios (conseguir meios, despedir-se, organizar assuntos).", ["Suicídio", "Escalas"]],
      ["Como perguntar sobre suicídio sem prejudicar o vínculo?", "Com perguntas abertas, mas diretas, sem julgamento, de forma gradual (da desesperança à ideação, ao plano e à intenção). Perguntar não induz o comportamento.", ["Suicídio", "Entrevista"]],
      ["O que dificulta o diagnóstico de depressão no idoso?", "Mais queixas físicas e menos tristeza relatada, comorbidade clínica e cognitiva, estigma e a ideia de que a tristeza é normal na velhice.", ["Depressão", "Idoso"]],
      ["A depressão maior é mais prevalente em idosos que em jovens?", "Não: a prevalência de depressão maior e distimia é menor em idosos, mas sintomas depressivos subsindrômicos são comuns e trazem prejuízo.", ["Depressão", "Idoso"]],
      ["Quais antidepressivos causam mais e menos disfunção sexual?", "Mais: ISRS (como escitalopram, paroxetina, sertralina) e IRSN. Menos: bupropiona, mirtazapina, vortioxetina e agomelatina.", ["Antidepressivos", "Disfunção sexual"]],
      ["Qual antidepressivo é mais seguro no paciente cardiopata?", "A sertralina, com segurança estudada após infarto agudo do miocárdio. Tricíclicos devem ser evitados.", ["Antidepressivos", "Cardiopatia"]],
      ["Quando a mirtazapina é boa escolha?", "Com insônia, perda de apetite ou de peso e náusea. Evitar em obesos, pelo ganho de peso.", ["Antidepressivos", "Mirtazapina"]],
      ["Qual a conduta na depressão resistente com ideação suicida?", "Eletroconvulsoterapia ou cetamina/escetamina, pela resposta rápida.", ["Depressão", "Resistente"]],
      ["Quais os subtipos do transtorno de adaptação no DSM-5?", "Com humor deprimido, com ansiedade, misto de ansiedade e depressão, com perturbação da conduta, misto de emoções e conduta, e não especificado.", ["Adaptação", "Subtipos"]],
      ["Como é o blues puerperal?", "Afeta até metade ou mais das puérperas: labilidade, choro e irritabilidade que começam 2 a 3 dias após o parto, com pico perto do 5º dia, e desaparecem em até 2 semanas sem tratamento.", ["Depressão", "Pós-parto"]],
      ["O que é o afeto pseudobulbar?", "Episódios súbitos de choro ou riso desproporcionais, que não correspondem ao humor, após lesões cerebrais (AVC, esclerose múltipla, ELA, trauma frontal). Trata-se com ISRS ou dextrometorfano-quinidina.", ["Afetividade", "Neuropsiquiatria"]],
      ["Como o estresse precoce marca a biologia de forma duradoura?", "Por mecanismos epigenéticos, principalmente a metilação do DNA (por exemplo, no gene do receptor de glicocorticoide), que alteram a resposta ao estresse e aumentam o risco de transtornos.", ["Depressão", "Epigenética"]],
      ["Na internação involuntária, pode-se medicar sem consentimento?", "Sim, quando necessário para tratar e proteger o paciente: a internação involuntária dispensa o consentimento, inclusive para medicação parenteral, com registro e a menor restrição possível.", ["Ética", "Internação"]],
    ],
    "pg-bipolar-mania": [
      ["Como é o transtorno bipolar no idoso?", "O início tardio associa-se mais a causas neurológicas e comorbidades; os sintomas maníacos tendem a ser menos intensos, com mais irritabilidade e confusão. Usa-se lítio em doses e níveis mais baixos.", ["Bipolar", "Idoso"]],
      ["Quais fatores ambientais influenciam o transtorno bipolar?", "Adversidades na infância e uso de cannabis e outras substâncias associam-se a início mais precoce e pior curso. A herdabilidade é alta (cerca de 60 a 85%).", ["Bipolar", "Etiologia"]],
      ["Por que evitar valproato em mulheres em idade fértil?", "Teratogenicidade (defeitos do tubo neural, menor QI e mais autismo nos filhos) e síndrome dos ovários policísticos. Se usado, exige contracepção eficaz.", ["Bipolar", "Valproato"]],
      ["Qual estabilizador pode fazer o anticoncepcional falhar?", "A carbamazepina, indutora da CYP3A4, reduz o nível dos contraceptivos hormonais e pode levar à gravidez.", ["Bipolar", "Interações"]],
      ["Como monitorar o lítio?", "Antes: função renal, TSH, cálcio, beta-hCG e ECG (a partir de 40 anos ou cardiopatia). Depois: lítio sérico após cada ajuste e, na manutenção, lítio, creatinina e TSH a cada 6 a 12 meses.", ["Bipolar", "Lítio"]],
      ["Como manejar a mania grave na emergência?", "Benzodiazepínico com antipsicótico para a agitação, suspender antidepressivos e iniciar estabilizador; ECT nos casos graves ou refratários.", ["Bipolar", "Emergência"]],
      ["Quais as comorbidades frequentes do transtorno bipolar?", "Ansiedade, uso de substâncias (principalmente álcool), TDAH e transtornos da personalidade. No borderline a instabilidade afetiva dura horas e reage ao ambiente; no bipolar, os episódios duram dias ou semanas.", ["Bipolar", "Comorbidades"]],
      ["O que acontece com a ciclotimia ao longo do tempo?", "É crônica (2 anos ou mais) e uma parte importante evolui para transtorno bipolar I ou II, o que exige acompanhamento.", ["Bipolar", "Ciclotimia"]],
    ],
    "pia-tdah-disruptivos": [
      ["Qual o desfecho mais comum do TDAH na vida adulta?", "Remissão parcial com prejuízo persistente; poucos remitem totalmente. Há maior risco de acidentes, uso de substâncias, gravidez precoce e problemas escolares e profissionais.", ["TDAH", "Desfechos"]],
      ["Como é o transtorno explosivo intermitente?", "Explosões agressivas impulsivas e desproporcionais, que duram em geral menos de 30 minutos, a partir dos 6 anos: agressões verbais ou físicas 2 vezes por semana por 3 meses, ou 3 episódios com dano em 12 meses.", ["Disruptivos", "Explosivo intermitente"]],
      ["A coprolalia é comum na síndrome de Tourette?", "Não: ocorre em uma minoria (cerca de 10 a 15%). Os tiques pioram com estresse e cansaço, melhoram com concentração, têm pico por volta de 10 a 12 anos e costumam melhorar na adolescência.", ["Tiques", "Tourette"]],
      ["Qual o tratamento de 1ª linha do TDAH a partir dos 6 anos?", "Estimulantes (metilfenidato ou anfetaminas, como a lisdexanfetamina), com orientação escolar e familiar.", ["TDAH", "Tratamento"]],
      ["Que intervenções servem para pré-adolescentes com problemas de comportamento?", "Treinamento parental e treino de autocontrole e habilidades sociais na criança, com metas claras e reforço positivo.", ["Disruptivos", "Intervenções"]],
    ],
    "pia-tea-neurodesenvolvimento": [
      ["Quais os fatores de risco para TEA?", "Sexo masculino, irmão com TEA (recorrência de cerca de 10 a 20%), idade parental avançada, prematuridade extrema e exposição ao valproato na gestação.", ["TEA", "Fatores de risco"]],
      ["Quando surgem os sinais de TEA e quando o diagnóstico é confiável?", "Sinais de risco podem aparecer a partir dos 6 meses (menos contato visual e sorriso social); o diagnóstico costuma ser confiável a partir de 18 a 24 meses.", ["TEA", "Diagnóstico precoce"]],
      ["Quando aparece a brincadeira de imitação e faz de conta?", "O faz de conta surge entre 18 e 24 meses; brincar imitando crianças da mesma idade aparece por volta dos 24 meses. Sua ausência é sinal de alerta.", ["TEA", "Brincar"]],
      ["Trocas de sons na fala aos 3 anos são transtorno?", "Não necessariamente: trocas fonêmicas são esperadas até cerca de 4 anos, quando a fala deve ser quase toda compreensível. Se persistem, pensar em transtorno dos sons da fala.", ["Linguagem", "Fala"]],
      ["Quais intervenções se usam no TEA?", "Análise do comportamento aplicada (ABA), modelo Denver, TEACCH, comunicação alternativa (como PECS), intervenções mediadas pelos pais e recursos de tecnologia.", ["TEA", "Intervenções"]],
    ],
    "pia-humor-ansiedade-infancia": [
      ["Qual o risco futuro de quem teve depressão na adolescência?", "Maior risco de recorrência na vida adulta. O risco de suicídio associado à depressão aumenta com a idade, sendo maior na adolescência que na infância.", ["Depressão", "Adolescência"]],
      ["Como a depressão muda conforme a idade?", "Pré-escolares: irritabilidade, queixas físicas, retraimento e brincadeiras com temas negativos. Adolescentes: anedonia, alterações de sono e apetite e ideação suicida, mais parecido com o adulto.", ["Depressão", "Infância"]],
      ["Qual a relação entre ansiedade de separação e recusa escolar?", "A ansiedade de separação é causa frequente de recusa escolar em crianças. A conduta é retorno gradual e rápido à escola, com TCC e participação da família.", ["Ansiedade", "Recusa escolar"]],
      ["Pode-se diagnosticar borderline na adolescência?", "Sim: o diagnóstico tem validade e confiabilidade semelhantes às do adulto e permite intervenção precoce (como a DBT para adolescentes).", ["Personalidade", "Adolescência"]],
      ["Por que adolescentes são mais impulsivos?", "O sistema límbico amadurece cedo e o córtex pré-frontal, mais tarde: há busca de recompensa e de sensações com controle inibitório ainda imaturo.", ["Desenvolvimento", "Adolescência"]],
      ["Como o TEPT aparece em crianças pequenas?", "Revivência por brincadeiras repetitivas com temas do trauma e pesadelos sem conteúdo claro; há critérios específicos para até 6 anos. O estresse dos pais é fator de risco, e a TCC focada no trauma inclui os cuidadores.", ["Trauma", "Infância"]],
      ["Qual o risco do início precoce de uso de substâncias?", "Quanto mais cedo começa o uso, maior o risco de dependência. Transtorno da conduta e personalidade antissocial são os quadros mais associados ao uso de substâncias, inclusive de várias drogas.", ["Substâncias", "Adolescência"]],
      ["Qual a diferença entre diagnóstico nosográfico e compreensivo na infância?", "O nosográfico descreve e classifica a síndrome (DSM, CID). O compreensivo integra desenvolvimento, família, escola e contexto para entender o caso e planejar o cuidado.", ["Avaliação", "Infância"]],
      ["Quais grupos de jovens têm maior risco por discriminação e pobreza?", "Jovens LGBTQIA+ sofrem mais bullying, discriminação e abuso, com mais risco de depressão e suicídio. A pobreza associa-se a pior saúde mental e física.", ["Fatores de risco", "Contexto social"]],
      ["Como deve ser o PTS de crianças e adolescentes no CAPSi?", "Integrar família, escola e rede de apoio, com metas específicas, prazos e um técnico de referência responsável pelo acompanhamento.", ["Saúde mental coletiva", "CAPSi"]],
      ["Por que muitos jovens com problemas de saúde mental não buscam ajuda?", "O motivo mais citado é querer resolver o problema sozinho; estigma e falta de conhecimento sobre os serviços também pesam.", ["Acesso", "Adolescência"]],
      ["Como é a encoprese?", "Evacuação em locais inadequados a partir dos 4 anos, pelo menos uma vez por mês por 3 meses. Na maioria há constipação com transbordamento, tratada com desimpactação, laxativos e rotina de toalete.", ["Eliminação", "Encoprese"]],
    ],
    "pg-ansiedade-toc-trauma": [
      ["O que é o transtorno frotteurista?", "Excitação sexual intensa ao tocar ou esfregar-se em pessoa sem o consentimento dela, por 6 meses ou mais, agindo sobre isso ou com sofrimento ou prejuízo.", ["Sexualidade", "Parafilias"]],
    ],
  };

  function toCards(prefix, list, subtheme) {
    return list.map(([front, back, tags, trap], index) => ({
      id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
      topic: tags[0],
      ...(subtheme ? { subtheme } : {}),
      tags,
      front,
      back,
      ...(trap ? { trap } : {}),
    }));
  }

  for (const [deckId, list] of Object.entries(extras)) {
    const target = root.decks.find((item) => item.id === deckId);
    if (!target) continue;
    const subtheme = target.cards[0]?.subtheme;
    for (const card of toCards(`${deckId}-q`, list, subtheme)) {
      if (!target.cards.some((existing) => existing.id === card.id)) target.cards.push(card);
    }
  }
})();
