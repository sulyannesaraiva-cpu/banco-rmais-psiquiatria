/* Cartões complementares (base: Tratado de Psiquiatria da ABP, 2022, e Caderneta da Criança do
   Ministério da Saúde), escritos para o banco:
   - decks novos dos temas que não tinham cartões: Desenvolvimento neuropsicomotor e Neuroanatomia
     e neurofisiologia (inclui neurocircuitos e genética);
   - deck novo de classificações, avaliação e pesquisa;
   - cartões a mais nos decks de psiquiatria geral (data/generalFlashcards.js).
   Decks com "studyTopic" aparecem nesse tema na aba Flashcards > Por tema. */
(function addHighlightsFlashcards() {
  const root = window.BANCO_RMAIS_FLASHCARDS || (window.BANCO_RMAIS_FLASHCARDS = { decks: [] });
  if (!Array.isArray(root.decks)) root.decks = [];
  const basis = "Tratado de Psiquiatria da ABP (2022) e Caderneta da Criança (MS)";

  function cards(prefix, list, subtheme) {
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

  function deck(id, title, area, importance, studyTopic, list, subtheme) {
    return { id, title, area, module: title, basis, importance, studyTopic, priorities: ["high-frequency"], cards: cards(id, list, subtheme) };
  }

  const newDecks = [
    deck("dnpm-marcos", "Marcos do desenvolvimento (0 a 5 anos)", "PIA", 5, "Desenvolvimento Neuropsicomotor", [
      ["Como é o tônus normal de um recém-nascido a termo?", "Hipertonia flexora dos membros com hipotonia axial (cervical), além dos reflexos primitivos presentes, como sucção e preensão palmar.", ["Recém-nascido", "Tônus"]],
      ["O que se espera aos 2 meses?", "Sorriso social, fixar e acompanhar rostos, reagir ao som, emitir sons além do choro e, de bruços, levantar a cabeça por alguns instantes.", ["Marcos", "2 meses"], "Não sorrir aos 2 meses é sinal de atraso."],
      ["O que se espera aos 4 meses?", "Bom controle da cabeça, segurar objetos colocados na mão e levá-los à boca, rir alto e responder ativamente ao contato social; de bruços, apoia-se nos antebraços.", ["Marcos", "4 meses"]],
      ["O que se espera aos 6 meses?", "Buscar ativamente objetos, levá-los à boca, rolar, sentar com apoio, voltar-se para o som e chamar a atenção dos cuidadores com sorriso e vocalização.", ["Marcos", "6 meses"]],
      ["O que se espera aos 9 meses?", "Sentar sem apoio, transferir objetos de uma mão para a outra, duplicar sílabas (mamã, papá), brincar de esconde-achou e estranhar desconhecidos.", ["Marcos", "9 meses"]],
      ["Em que idade surge a pinça?", "A pinça inferior aparece por volta dos 8 a 9 meses; a pinça completa (polpa do polegar com a do indicador), entre 9 e 12 meses.", ["Marcos", "Motor fino"]],
      ["O que se espera aos 12 meses?", "Andar com apoio, imitar gestos (dar tchau, bater palmas), fazer pinça completa, falar as primeiras palavras com sentido e compreender ordens simples.", ["Marcos", "12 meses"]],
      ["Até quando é normal a criança ainda não andar sozinha?", "A marcha independente costuma surgir entre 12 e 15 meses; só se considera atraso após 18 meses. Aos 13 meses, sem outras alterações, mantém-se o acompanhamento de rotina.", ["Marcos", "Marcha"]],
      ["O que se espera entre 15 e 18 meses?", "Andar sozinho, rabiscar, usar algumas palavras, apontar o que quer e explorar o ambiente usando os pais como base segura.", ["Marcos", "15-18 meses"]],
      ["O que se espera aos 24 meses?", "Correr, montar torre de 4 a 6 cubos, juntar 2 palavras em frases, brincar de faz de conta simples ('comidinha') e começar a usar 'meu'.", ["Marcos", "24 meses"]],
      ["Como é o comportamento socioemocional típico perto dos 30 meses?", "Egocentrismo e brincadeira paralela (ao lado de outras crianças), ainda com interesse em compartilhar, e birras diante de limites.", ["Marcos", "Socioemocional"]],
      ["O que se espera aos 3 anos?", "Frases de 3 ou mais palavras, fala compreendida por estranhos na maior parte do tempo, subir escadas alternando os pés, copiar um círculo e aceitar melhor limites com menos birras.", ["Marcos", "3 anos"]],
      ["O que se espera aos 4 anos?", "Faz de conta elaborado e brincadeira cooperativa, contar histórias, muitas perguntas, vocabulário amplo, pular num pé só e copiar uma cruz.", ["Marcos", "4 anos"]],
      ["Qual a sequência de cópia de figuras geométricas?", "Círculo por volta de 3 anos, cruz por volta de 4, quadrado entre 4 e 5 e triângulo por volta de 5 anos.", ["Marcos", "Motor fino"]],
      ["Quais os marcos da linguagem expressiva?", "Balbucio por volta de 6 meses, sílabas duplicadas aos 9, primeiras palavras aos 12, frases de 2 palavras aos 24 e frases de 3 palavras aos 3 anos.", ["Marcos", "Linguagem"]],
      ["Chorar com estranhos e ao separar-se da mãe aos 10 meses é normal?", "Sim. A ansiedade de estranhos (por volta de 8 meses) e a de separação fazem parte do desenvolvimento normal do primeiro ano.", ["Marcos", "Socioemocional"]],
    ], "TEA e neurodesenvolvimento"),

    deck("dnpm-vigilancia", "Vigilância do desenvolvimento e sinais de alerta", "PIA", 5, "Desenvolvimento Neuropsicomotor", [
      ["Como a Caderneta da Criança classifica a vigilância do desenvolvimento?", "Desenvolvimento adequado; adequado com fatores de risco; alerta para o desenvolvimento (falta 1 ou mais marcos da própria faixa etária); provável atraso (faltam marcos da faixa anterior, ou perímetro cefálico alterado, ou 3 ou mais alterações fenotípicas).", ["Vigilância", "Caderneta"]],
      ["Qual a conduta no 'alerta para o desenvolvimento'?", "Orientar a família a estimular a criança e reavaliar em 30 dias. No provável atraso, encaminhar para avaliação neuropsicomotora.", ["Vigilância", "Conduta"]],
      ["Até quando se corrige a idade do prematuro?", "Até 2 anos de idade corrigida, ao avaliar os marcos do desenvolvimento.", ["Vigilância", "Prematuro"]],
      ["Quando desaparecem os principais reflexos primitivos?", "Moro e preensão palmar: até 4 a 6 meses. Tônico-cervical assimétrico: até 4 a 6 meses. Preensão plantar: até 9 a 15 meses. Marcha reflexa: nos primeiros 2 meses.", ["Vigilância", "Reflexos"], "A persistência de reflexos primitivos além do esperado é sinal de alerta neurológico."],
      ["Qual o primeiro passo diante de atraso de fala?", "Avaliar a audição (audiometria ou potencial evocado auditivo) e o contexto psicossocial, incluindo exposição a telas, antes de outros diagnósticos.", ["Vigilância", "Linguagem"]],
      ["Quais sinais aos 9 meses sugerem risco de autismo?", "Não balbuciar sílabas, não atender quando chamado pelo nome, não olhar para onde o adulto aponta e imitar pouco ou nada.", ["Vigilância", "TEA"]],
      ["Quando as fontanelas se fecham?", "A posterior entre 1 e 2 meses; a anterior (bregmática) entre 9 e 18 meses. Fechamento precoce com perímetro cefálico baixo sugere craniossinostose ou microcefalia.", ["Vigilância", "Crânio"]],
      ["O 'manhês' prejudica a linguagem do bebê?", "Não. Falar com o bebê em tom infantilizado é adequado e reflete bom vínculo; favorece a atenção e a aquisição da linguagem.", ["Vigilância", "Vínculo"]],
      ["Que orientações estimulam o desenvolvimento na atenção básica?", "Conversar, ler e cantar com a criança, brincar no chão, oferecer momentos de bruços acordado e evitar telas antes dos 2 anos.", ["Vigilância", "Estimulação"]],
    ], "TEA e neurodesenvolvimento"),

    deck("neuro-anatomia-clinica", "Neuroanatomia clínica", "Neurociências", 4, "Neuroanatomia e Neurofisiologia", [
      ["Quais raízes cervicais testar por força, reflexo e sensibilidade?", "C5: deltoide e bíceps, face lateral do braço. C6: extensores do punho, reflexo braquiorradial, face lateral do antebraço e polegar. C7: tríceps, reflexo tricipital, dedo médio. C8: flexores dos dedos, 4º e 5º dedos.", ["Raízes", "Cervical"]],
      ["Quais raízes lombossacras testar?", "L4: quadríceps, reflexo patelar, face medial da perna. L5: dorsiflexão do pé e do hálux (andar nos calcanhares), dorso do pé. S1: flexão plantar (andar na ponta dos pés), reflexo aquileu, borda lateral do pé.", ["Raízes", "Lombossacra"]],
      ["Qual lesão causa hemianopsia bitemporal?", "Lesão do quiasma óptico, classicamente por adenoma de hipófise. Lesões após o quiasma (trato, radiações, córtex occipital) dão hemianopsia homônima.", ["Visão", "Campos visuais"]],
      ["Onde está a lesão nas quadrantanopsias?", "Superior: alça de Meyer, no lobo temporal. Inferior: radiações ópticas do lobo parietal.", ["Visão", "Campos visuais"]],
      ["Diplopia que some ao fechar um olho indica o quê?", "Diplopia binocular, por desalinhamento ocular (paresia de nervo oculomotor). O abducente (VI) é o mais frequentemente acometido: diplopia horizontal ao olhar para o lado da lesão.", ["Nervos cranianos", "Diplopia"]],
      ["Como se apresentam as lesões do III e do IV nervos?", "III: ptose, olho desviado para baixo e para fora e, se compressivo, midríase. IV: diplopia vertical, pior ao descer escadas, com inclinação compensatória da cabeça.", ["Nervos cranianos", "Oculomotores"]],
      ["O que conduzem as colunas dorsais e o que o Romberg avalia?", "Propriocepção, vibração e tato fino. Romberg positivo (desequilíbrio só de olhos fechados) indica ataxia sensitiva por lesão das colunas dorsais ou neuropatia: marcha talonante, como na deficiência de B12, na tabes e no alcoolismo.", ["Medula", "Colunas dorsais"]],
      ["Por que a negligência espacial grave vem da lesão do hemisfério direito?", "O hemisfério direito atende aos dois hemicampos, e o esquerdo atende principalmente ao direito. Lesão parietal direita gera negligência do lado esquerdo; lesões esquerdas raramente causam negligência importante.", ["Córtex", "Negligência"]],
      ["Quais as funções das regiões do córtex pré-frontal?", "Dorsolateral: funções executivas, memória de trabalho e planejamento. Orbitofrontal: comportamento social (lesão dá desinibição). Ventromedial: decisão com base emocional e julgamento moral (caso Phineas Gage). Cingulado anterior: motivação (lesão dá apatia e mutismo acinético).", ["Córtex", "Pré-frontal"]],
      ["Diferencie as afasias de Broca, Wernicke e de condução.", "Broca (frontal inferior esquerdo): não fluente, compreensão relativamente preservada. Wernicke (temporal superior posterior): fluente, sem compreensão. Condução (fascículo arqueado): repetição muito prejudicada. Transcorticais: repetição preservada.", ["Córtex", "Linguagem"]],
      ["Quais os componentes da dor e como ela é modulada?", "Sensitivo-discriminativo (espinotalâmico, tálamo e córtex somatossensorial) e afetivo-motivacional (cingulado anterior e ínsula). A modulação descendente (substância cinzenta periaquedutal e bulbo) com opioides endógenos explica a analgesia no estresse agudo, útil para luta ou fuga.", ["Neurofisiologia", "Dor"]],
      ["O que é o circuito de Papez?", "Hipocampo → fórnix → corpos mamilares → tálamo anterior → giro do cíngulo → hipocampo. Base da memória e da emoção; corpos mamilares e tálamo dorsomedial são lesados na síndrome de Wernicke-Korsakoff.", ["Sistema límbico", "Memória"]],
      ["O que é a síndrome de Klüver-Bucy?", "Lesão bilateral das amígdalas e dos lobos temporais anteriores: hiperoralidade, hipersexualidade, docilidade (perda do medo) e agnosia visual.", ["Sistema límbico", "Amígdala"]],
      ["Quais as 4 vias dopaminérgicas e o que fazem os antipsicóticos nelas?", "Mesolímbica (bloqueio melhora sintomas positivos), mesocortical (hipofunção ligada a negativos e cognitivos), nigroestriatal (bloqueio dá efeitos extrapiramidais) e tuberoinfundibular (bloqueio eleva a prolactina).", ["Neurotransmissão", "Dopamina"]],
      ["O que é a síndrome de Gerstmann?", "Lesão do giro angular esquerdo: agrafia, acalculia, agnosia digital e desorientação direita-esquerda.", ["Córtex", "Parietal"]],
    ]),

    deck("neuro-circuitos-genetica", "Neurocircuitos, neurotransmissão e genética", "Neurociências", 4, "Neuroanatomia e Neurofisiologia", [
      ["Quais sistemas mantêm a vigília?", "Locus coeruleus (noradrenalina), rafe (serotonina), núcleos pedunculopontino e laterodorsal e prosencéfalo basal (acetilcolina), hipotálamo tuberomamilar (histamina), hipotálamo lateral (orexina/hipocretina) e substância cinzenta periaquedutal ventral (dopamina).", ["Sono", "Vigília"]],
      ["Quais estruturas promovem o sono?", "Núcleos pré-ópticos ventrolateral e mediano do hipotálamo, neurônios GABA que inibem os sistemas de vigília; neurônios GABA da zona parafacial do bulbo; e neurônios concentradores de melanina do hipotálamo lateral, ligados ao sono REM.", ["Sono", "Sistemas do sono"]],
      ["Que estruturas o circuito do medo usa para cada resposta?", "A amígdala comanda: hipotálamo (eixo HHA e cortisol), núcleo parabraquial (respiração), locus coeruleus (resposta autonômica: taquicardia, PA) e substância cinzenta periaquedutal (congelamento e evitação). A preocupação depende de circuitos córtico-estriado-tálamo-corticais com o córtex pré-frontal dorsolateral.", ["Ansiedade", "Circuitos"]],
      ["Qual a herdabilidade dos transtornos de ansiedade e o gene mais citado?", "Cerca de 30 a 40%. O polimorfismo 5-HTTLPR do transportador de serotonina interage com adversidades (como maus-tratos) aumentando o risco.", ["Ansiedade", "Genética"]],
      ["Quais circuitos estão alterados na depressão?", "Amígdala hiper-reativa a estímulos negativos, córtex pré-frontal medial e rede de modo padrão hiperativos (ruminação, atenção voltada para dentro) e menor controle do córtex pré-frontal dorsolateral esquerdo.", ["Depressão", "Circuitos"]],
      ["Como inflamação e eixo HHA se relacionam com os subtipos de depressão?", "Inflamação (PCR acima de 3) associa-se a depressão não melancólica, com lentificação, anedonia e ansiedade. Hiperativação do eixo HHA com hipercortisolemia (falha na supressão pela dexametasona) associa-se às formas melancólica e psicótica.", ["Depressão", "Neurobiologia"]],
      ["Qual a hipótese glutamatérgica da esquizofrenia?", "Hipofunção do receptor NMDA em interneurônios GABA desinibe neurônios glutamatérgicos, aumentando a dopamina mesolímbica (sintomas positivos) e reduzindo a mesocortical (negativos). O ácido quinurênico, antagonista endógeno do NMDA, participa.", ["Esquizofrenia", "Glutamato"]],
      ["O que é a saliência aberrante (Kapur)?", "A liberação de dopamina fora de contexto faz estímulos neutros parecerem significativos, base dos delírios. O bloqueio D2 reduz a saliência nova, mas não desfaz a já atribuída.", ["Esquizofrenia", "Dopamina"]],
      ["Como funciona a xanomelina-tróspio?", "Xanomelina: agonista muscarínico central M1 e M4, que reduz a dopamina estriatal sem bloqueio D2. Tróspio: antagonista muscarínico periférico que reduz os efeitos colinérgicos. É o primeiro antipsicótico sem bloqueio D2.", ["Esquizofrenia", "Acetilcolina"]],
      ["Como funciona o sistema endocanabinoide?", "CB1 (central, pré-sináptico, acoplado a Gi) inibe a liberação de GABA e glutamato por sinalização retrógrada; CB2 é periférico e imune. A anandamida é degradada pela FAAH e o 2-AG pela MAGL.", ["Canabinoides", "Neurotransmissão"]],
      ["Quais variações genéticas importam em psiquiatria?", "Aneuploidias (Down, Turner), variantes estruturais, CNVs (deleções e duplicações maiores que 1.000 bases; ex.: 22q11 no TEA, na DI e na esquizofrenia), repetições (CAG na doença de Huntington: 40 ou mais, penetrância completa), indels e SNPs.", ["Genética", "Variações"]],
      ["O que os GWAS mostraram sobre os transtornos psiquiátricos?", "São poligênicos (muitas variantes de efeito pequeno), permitem escores de risco poligênico e mostram sobreposição genética entre transtornos (pleiotropia). Limitações: pouca diversidade ancestral e associação não prova causalidade.", ["Genética", "GWAS"]],
      ["Associe gene e transtorno: APOE, PSEN1, C4A, NCAN.", "APOE ε4: principal risco comum para Alzheimer de início tardio (ε2 protege). PSEN1: Alzheimer autossômico dominante de início precoce. C4A (complemento): esquizofrenia, via poda sináptica. NCAN: transtorno bipolar.", ["Genética", "Genes"]],
      ["Quais os riscos genéticos na esquizofrenia?", "Concordância de cerca de 50% em gêmeos monozigóticos e 15% em dizigóticos, risco de cerca de 10% com parente de 1º grau e herdabilidade de cerca de 80%; ainda assim, a maioria dos pacientes não tem parente de 1º grau afetado.", ["Genética", "Esquizofrenia"]],
    ]),

    deck("pg-classificacoes-pesquisa", "Classificações, avaliação e pesquisa", "Psiquiatria Geral", 3, "Psicopatologia", [
      ["O que é o RDoC e quais seus domínios?", "Modelo de pesquisa do NIMH (2009), não de uso clínico. Domínios: valência negativa, valência positiva, sistemas cognitivos, processos sociais, sistemas de regulação e alerta e sistemas sensório-motores (o último, incluído em 2019).", ["Classificações", "RDoC"], "Hábito é constructo da valência positiva; frustração pertence à valência negativa."],
      ["Como o HiTOP organiza a psicopatologia?", "Em níveis: sintomas e traços, síndromes, subfatores, espectros e superespectro (fator geral). O subfator 'angústia' reúne depressão, TAG, TEPT e traços borderline. É descritivo e não incorpora etiologia.", ["Classificações", "HiTOP"]],
      ["Quais mudanças da CID-11 em relação à CID-10 mais caem?", "Capítulos próprios para sono-vigília e saúde sexual, inclusão do transtorno de acumulação e do transtorno por jogos eletrônicos, e luto prolongado. A reação aguda ao estresse deixou de ser transtorno mental.", ["Classificações", "CID-11"]],
      ["Quais as formas de medir a confiabilidade de um instrumento?", "Teste-reteste, formas paralelas, duas metades, consistência interna (alfa de Cronbach, ômega) e concordância entre avaliadores (kappa para 2, kappa de Fleiss para mais de 2, coeficiente de correlação intraclasse).", ["Avaliação", "Confiabilidade"]],
      ["Quais os tipos de validade de um instrumento?", "Modelo clássico: conteúdo, critério e construto. Para Messick, a validade é das interpretações do escore e se constrói de forma cumulativa. Padronização uniformiza a aplicação; normatização, a interpretação.", ["Avaliação", "Validade"]],
      ["Quais as fases dos ensaios clínicos?", "Fase I: segurança em voluntários sadios. II: dose e eficácia inicial em doentes. III: ensaio randomizado controlado. IV: pós-comercialização.", ["Pesquisa", "Ensaios clínicos"]],
      ["Qual a vantagem e o problema do estudo cruzado (crossover)?", "Cada participante recebe as duas intervenções, com período de washout: exige amostra menor e os grupos são mais comparáveis. O problema é o efeito residual (carryover) da primeira intervenção.", ["Pesquisa", "Desenhos"]],
      ["O que mostrou o São Paulo Megacity Study?", "Cerca de 30% dos adultos tiveram transtorno mental nos últimos 12 meses: ansiedade (cerca de 20%) mais que humor (cerca de 11%) e substâncias (cerca de 3,6%). A fobia específica foi o transtorno mais prevalente.", ["Pesquisa", "Epidemiologia"]],
    ]),
  ];

  /* Cartões a mais nos decks de psiquiatria geral (subtema herdado do deck). */
  const extras = {
    "pg-psicopatologia": [
      ["Diferencie alucinação verdadeira, pseudoalucinação e alucinose.", "Verdadeira: tem corporeidade e está no espaço externo. Pseudoalucinação: sem corporeidade, no espaço subjetivo interno ('vê na mente, de olhos fechados'). Alucinose: percebida fora, mas a pessoa sabe que não é real (crítica preservada), como nos escotomas da enxaqueca.", ["Sensopercepção", "Alucinação"]],
      ["Diferencie ilusão e pareidolia.", "Ilusão: objeto real percebido de forma errada (corda vista como cobra). Pareidolia: formar imagens intencionalmente (rostos nas nuvens), sabendo que não são reais; não é patológica.", ["Sensopercepção", "Ilusão"]],
      ["Diferencie obnubilação simples, obnubilação oniroide e estreitamento da consciência.", "Simples: rebaixamento do nível de consciência sem psicose. Oniroide: rebaixamento com sintomas psicóticos, 'como num sonho'. Estreitamento: alteração qualitativa, com campo de consciência reduzido.", ["Consciência", "Alterações"]],
      ["Diferencie ecmnésia, alomnésia e paramnésia.", "Ecmnésia: o passado é revivido como presente. Alomnésia (ilusão de memória): lembrança deformada de um fato real. Paramnésia (alucinação de memória): lembrar algo que não aconteceu.", ["Memória", "Alterações"]],
      ["Diferencie prolixidade e minuciosidade.", "Prolixidade: não distingue o essencial do acessório. Minuciosidade: detalha tudo para não omitir nada, típico da personalidade obsessiva.", ["Pensamento", "Forma"]],
      ["Diferencie apropriação e transitivismo.", "Apropriação: vive como próprio algo que acontece fora (sente dor ao ver um galho cortado). Transitivismo: atribui a outros a própria vivência.", ["Consciência do eu", "Alterações"]],
      ["Quais sinais ao exame sugerem alucinações?", "Auditivas: falar sozinho, respostas sem sentido e risos imotivados. Visuais: olhar fixo, desvios súbitos do olhar e movimentos de defesa.", ["Sensopercepção", "Exame"]],
    ],
    "pg-esquizofrenia-psicoses": [
      ["O que diferencia as visões de Kraepelin e Bleuler?", "Kraepelin: 'demência precoce' em formas hebefrênica, catatônica e paranoide, com curso deteriorante. Bleuler: o distúrbio fundamental é das associações; os sintomas primários são os 4 'As' (afeto, associação, ambivalência, autismo), e delírios e alucinações são secundários.", ["Esquizofrenia", "História"]],
      ["Quais as 5 dimensões de sintomas da esquizofrenia?", "Positivos, negativos, cognitivos, desorganização e humor/ansiedade. Entre os negativos (alogia, embotamento afetivo, associabilidade, avolição, anedonia), a avolição é o principal preditor de prognóstico.", ["Esquizofrenia", "Dimensões"], "Alteração psicomotora não entra na lista de sintomas negativos."],
      ["Quais as síndromes de ultra-alto risco para psicose?", "Sintomas positivos atenuados, sintomas psicóticos breves e intermitentes, e risco genético (parente de 1º grau ou personalidade esquizotípica) com piora do funcionamento no último ano. A conversão para psicose é de cerca de 18% em 6 meses e 36% em 3 anos.", ["Esquizofrenia", "Ultra-alto risco"]],
      ["Quais os fatores de risco para síndrome neuroléptica maligna?", "Antipsicótico parenteral, doses altas ou aumento rápido, desidratação, agitação, contenção física e episódio prévio de SNM.", ["Antipsicóticos", "SNM"]],
      ["Quanto tempo esperar para avaliar resposta ao antipsicótico?", "Cerca de 4 a 6 semanas em dose adequada. Típicos causam mais sintomas extrapiramidais; atípicos, mais efeitos metabólicos. Prefere-se o atípico pela tolerabilidade, não por maior eficácia.", ["Esquizofrenia", "Tratamento"]],
    ],
    "pg-ansiedade-toc-trauma": [
      ["Quais as comorbidades do TOC?", "Mais de 90% têm comorbidade: transtornos de ansiedade são os mais comuns, seguidos pelos de humor. Os fenômenos sensoriais (sensação de incompletude, 'não está certo') são frequentes, mas não necessários ao diagnóstico.", ["TOC", "Comorbidades"]],
      ["Diferencie resposta e remissão no TOC.", "Resposta: queda de 25 a 35% ou mais na Y-BOCS, com melhora na CGI. Remissão: Y-BOCS final de 12 ou menos (alguns usam 14).", ["TOC", "Resposta"]],
      ["Quais detalhes do tratamento do TOC mais caem?", "Começar pela psicoeducação; ISRS em dose alta (todos com eficácia semelhante), com latência de até 12 semanas; melhora de 20% em 4 semanas prediz boa resposta; manter por pelo menos 1 a 2 anos. Acomodação familiar mantém o TOC. Insight pobre não justifica antipsicótico isolado.", ["TOC", "Tratamento"]],
      ["Qual o tratamento de cada transtorno relacionado ao TOC?", "Dismórfico corporal: ISRS em dose alta (o único com 1ª linha farmacológica) e TCC. Acumulação: TCC. Tricotilomania e escoriação: TCC com reversão de hábito.", ["TOC", "Relacionados"], "Tourette não faz parte do grupo do TOC; a CID-11 inclui ainda a síndrome de referência olfatória."],
      ["Como o TOC infantil difere do adulto?", "Mais compulsões sem obsessões claras, compulsões parecidas com tiques, menos insight e sofrimento, maior herdabilidade, mais associação com tiques e TDAH, e pior resposta. Os medicamentos são os mesmos.", ["TOC", "Infância"]],
    ],
    "pia-tdah-disruptivos": [
      ["O que mostrou o estudo MTA no TDAH?", "Em 579 crianças por 14 meses, para os sintomas centrais: tratamento combinado ≈ medicação isolada, ambos melhores que o comportamental isolado e que o tratamento usual da comunidade. A terapia comportamental ajudou mais quando havia ansiedade ou comportamento disruptivo.", ["TDAH", "MTA"]],
      ["Como agem metilfenidato e lisdexanfetamina?", "Metilfenidato: inibe os transportadores de dopamina e noradrenalina; liberação imediata dura poucas horas (2 a 3 tomadas por dia). Lisdexanfetamina: pró-fármaco (dexanfetamina ligada à lisina), efeito estável por cerca de 13 a 14 horas, aprovada também para compulsão alimentar.", ["TDAH", "Estimulantes"]],
      ["Quando preferir guanfacina?", "Agonista alfa-2A mais seletivo que a clonidina, atua no córtex pré-frontal. Útil com intolerância a estimulantes, tiques, comportamento disruptivo ou rebote no fim da tarde. Pode causar hipotensão e bradicardia.", ["TDAH", "Não estimulantes"]],
      ["Quanto o TDAH persiste na vida adulta?", "Cerca de 15% mantêm o quadro completo, mas muitos seguem com sintomas e prejuízo parciais. Herdabilidade de 70 a 80%, uma das mais altas da psiquiatria.", ["TDAH", "Curso"]],
    ],
    "pg-transtornos-alimentares": [
      ["Qual a hierarquia diagnóstica entre anorexia, bulimia e compulsão alimentar?", "Baixo peso: anorexia (mesmo com compulsão e purgação). Peso não baixo com comportamento compensatório: bulimia. Compulsão sem compensação regular: transtorno de compulsão alimentar.", ["Alimentares", "Diagnóstico"]],
      ["O que caracteriza a ruminação?", "Regurgitação repetida, sem esforço e sem náusea, com remastigação ou reingestão; ocorre em crianças, em pessoas com deficiência intelectual e também no desenvolvimento normal. Tratamento comportamental.", ["Alimentares", "Ruminação"]],
      ["Como é a amnésia dissociativa?", "Perda de memória autobiográfica, geralmente retrógrada e súbita, sem lesão cerebral; a capacidade de aprender coisas novas costuma estar preservada. Cerca de 75% melhoram espontaneamente em ambiente seguro.", ["Dissociativos", "Amnésia"]],
      ["Quais testes avaliam a atenção no delirium?", "Repetir dígitos (digit span), dizer os meses ao contrário e soletrar uma palavra de trás para frente. O delirium hipoativo é o mais subdiagnosticado; haloperidol em dose baixa só com agitação ou psicose.", ["Delirium", "Avaliação"]],
    ],
    "pg-bipolar-mania": [
      ["Quais as opções de 1ª linha para mania aguda (CANMAT)?", "Monoterapia com lítio, quetiapina, valproato, asenapina, aripiprazol, paliperidona, risperidona ou cariprazina; ou associação de lítio ou valproato com quetiapina, aripiprazol, risperidona ou asenapina.", ["Bipolar", "Mania aguda"]],
      ["Quais as opções de 1ª linha para depressão bipolar (CANMAT)?", "Bipolar I: quetiapina, lurasidona (isolada ou com lítio ou valproato), lítio e lamotrigina. Bipolar II: quetiapina é a de 1ª linha.", ["Bipolar", "Depressão bipolar"]],
      ["Quanto tempo o paciente bipolar passa sintomático?", "Cerca de metade do tempo, com predomínio de sintomas depressivos: no bipolar I, cerca de 47% do tempo (depressão para mania 3:1); no bipolar II, cerca de 56% (depressão para hipomania 37:1).", ["Bipolar", "Curso"]],
      ["O que propõe o estadiamento do transtorno bipolar?", "Evolução de risco (história familiar e sintomas subsindrômicos) para primeiros episódios com bom funcionamento entre eles, e depois episódios recorrentes com declínio funcional e cognitivo (neuroprogressão). Tratar cedo pode mudar o curso.", ["Bipolar", "Estadiamento"]],
    ],
    "psicofarmaco-antipsicoticos": [
      ["Qual o perfil da cariprazina?", "Agonista parcial D3 (alta afinidade) e D2, e de 5-HT1A. Indicada em esquizofrenia, mania, depressão bipolar I e como adjuvante na depressão maior; pode ajudar sintomas negativos. Acatisia é comum e os metabólitos têm meia-vida muito longa.", ["Antipsicóticos", "Cariprazina"]],
      ["Qual o perfil da lumateperona?", "Antagonista 5-HT2A muito mais potente que D2, com modulação dopaminérgica e glutamatérgica e ação no transportador de serotonina. Indicada em esquizofrenia e depressão bipolar; boa tolerabilidade metabólica e motora.", ["Antipsicóticos", "Lumateperona"]],
      ["Qual o perfil da pimavanserina?", "Antagonista e agonista inverso 5-HT2A potente, sem ação D2. Indicada para psicose da doença de Parkinson, pois não piora o parkinsonismo.", ["Antipsicóticos", "Pimavanserina"]],
    ],
    "dq-drogas-intoxicacoes": [
      ["O que se sabe sobre o canabidiol (CBD)?", "Não é psicotomimético e tem efeito ansiolítico com melhor evidência na ansiedade social. Efeitos adversos: sonolência, fadiga, diarreia e aumento de transaminases; metabolizado pelas CYP2C19 e 3A4. O THC é o responsável pela dependência e pela psicose.", ["Cannabis", "Canabidiol"]],
      ["Quais medicamentos agem no sistema canabinoide?", "Dronabinol e nabilona (análogos do THC), nabiximols (THC e CBD 1:1) e canabidiol. O rimonabanto, antagonista CB1 usado para emagrecer, foi retirado por causar depressão e suicidalidade.", ["Cannabis", "Fármacos"]],
    ],
    "pg-personalidade": [
      ["Como a CID-11 descreve os transtornos da personalidade?", "Um único diagnóstico graduado por gravidade (leve, moderado, grave), com 5 domínios de traços: afetividade negativa, distanciamento, dissocialidade, desinibição e anancastia, além do especificador 'padrão borderline'.", ["Personalidade", "CID-11"]],
      ["Quais circuitos estão alterados na personalidade antissocial?", "Córtex pré-frontal ventromedial com menor controle inibitório e julgamento moral, amígdala pouco responsiva ao medo e a emoções negativas, estriado ventral mais sensível à recompensa e alterações do fascículo uncinado.", ["Personalidade", "Antissocial"]],
    ],
    "pg-sono": [
      ["Que perguntas ajudam a rastrear apneia do sono e quais os tratamentos?", "'Você ronca?' é a mais sensível; 'você para de respirar dormindo?', a mais específica. Tratamento: perda de peso e medidas comportamentais, aparelho intraoral de avanço mandibular, CPAP, cirurgia bariátrica nos obesos graves e adenotonsilectomia em crianças.", ["Apneia", "Rastreio"], "Evite sedativos: pioram o colapso da via aérea."],
      ["Quais medicamentos pioram a síndrome das pernas inquietas?", "Antidepressivos (exceto bupropiona), antipsicóticos, anti-histamínicos e antieméticos antidopaminérgicos. Antes de tratar, dosar ferritina e excluir acatisia, câimbras e isquemia.", ["Pernas inquietas", "Medicamentos"]],
    ],
    "pg-depressao-suicidio": [
      ["Como agem a cetamina e a escetamina na depressão?", "Bloqueiam o receptor NMDA em interneurônios GABA, liberando glutamato que ativa receptores AMPA, BDNF e mTORC1, com neuroplasticidade rápida. Indicadas na depressão resistente e com ideação suicida. Efeitos: dissociação, aumento da PA, náusea e sedação, com monitorização após a dose.", ["Depressão", "Escetamina"]],
      ["O que é a associação dextrometorfano-bupropiona?", "Antagonista NMDA e agonista sigma-1 (dextrometorfano) com bupropiona, que inibe a CYP2D6 e aumenta o nível do dextrometorfano. Via oral, aprovada para depressão maior.", ["Depressão", "Glutamatérgicos"]],
    ],
  };

  const known = new Set(root.decks.map((item) => item.id));
  for (const item of newDecks) if (!known.has(item.id)) root.decks.push(item);
  for (const [deckId, list] of Object.entries(extras)) {
    const target = root.decks.find((item) => item.id === deckId);
    if (!target) continue;
    const subtheme = target.cards[0]?.subtheme;
    for (const card of cards(`${deckId}-h`, list, subtheme)) {
      if (!target.cards.some((existing) => existing.id === card.id)) target.cards.push(card);
    }
  }
})();
