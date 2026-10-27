/* Cartões para os temas que mais caem nas provas e tinham poucos cartões (análise de cobertura
   de outubro/2026): Humor, Psiquiatria Infantil, Drogas e dependência, Ansiedade/TOC/trauma,
   Psicoterapias e Forense. Escritos a partir do que as questões de prova do banco perguntam.
   Os cartões entram no fim dos decks de psiquiatria geral (herdando o subtema do deck); o deck
   novo de humor e ansiedade na infância fica no tema Psiquiatria Infantil. */
(function addExamGapFlashcards() {
  const root = window.BANCO_RMAIS_FLASHCARDS || (window.BANCO_RMAIS_FLASHCARDS = { decks: [] });
  if (!Array.isArray(root.decks)) root.decks = [];

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

  const extras = {
    "pg-depressao-suicidio": [
      ["Qual sintoma da depressão maior não precisa durar 2 semanas?", "Os sintomas devem estar presentes quase todos os dias por 2 semanas, exceto pensamentos de morte, ideação, plano ou tentativa de suicídio, que contam mesmo se ocorrerem uma única vez.", ["Depressão", "Critérios"]],
      ["O que é o especificador 'com sintomas ansiosos'?", "2 ou mais de: sentir-se tenso, inquieto, dificuldade de concentração por preocupação, medo de que algo terrível aconteça e sensação de perder o controle. Associa-se a mais risco de suicídio e pior resposta ao tratamento.", ["Depressão", "Especificadores"]],
      ["O que é o especificador 'com características mistas' na depressão?", "3 ou mais sintomas maníacos ou hipomaníacos durante o episódio depressivo, sem preencher critérios de mania. Aumenta o risco de evolução para bipolar e pede cautela com antidepressivo isolado.", ["Depressão", "Especificadores"]],
      ["Qual o tratamento específico da depressão com padrão sazonal?", "Fototerapia com luz brilhante (cerca de 10.000 lux, 30 minutos pela manhã), isolada ou associada a antidepressivo.", ["Depressão", "Sazonal"]],
      ["Quais medidas não farmacológicas têm evidência como adjuvantes na depressão?", "Exercício físico regular (também como tratamento de quadros leves a moderados) e ômega-3 com predomínio de EPA como adjuvante; higiene do sono e redução do álcool.", ["Depressão", "Adjuvantes"]],
      ["O que define o início no periparto e quais os cuidados no tratamento?", "Episódio que começa na gestação ou até 4 semanas após o parto. Principal fator de risco: depressão prévia. A sertralina é uma das opções mais usadas na amamentação; os neuroesteroides (brexanolona, zuranolona) são tratamentos específicos.", ["Depressão", "Periparto"]],
      ["O que é a 'depressão dupla'?", "Episódio depressivo maior sobreposto a um transtorno depressivo persistente (distimia). A distimia afeta cerca de 3 a 6% da população e tem curso crônico.", ["Depressão", "Distimia"]],
      ["Qual o risco de recorrência após episódios depressivos?", "Cerca de 50% após o 1º episódio, 70% após o 2º e 90% após o 3º. Por isso, 3 ou mais episódios indicam manutenção prolongada.", ["Depressão", "Recorrência"]],
      ["Que tipo de depressão respondia melhor aos IMAO?", "A depressão com características atípicas (humor reativo, hipersonia, hiperfagia, corpo pesado, sensibilidade à rejeição).", ["Depressão", "Atípica"]],
      ["Na tentativa de suicídio, a intenção de morrer precisa ser explícita?", "Não. A intenção pode ser inferida pelo contexto, método e planejamento. Baixa letalidade do método não significa baixa intenção, e a tentativa prévia é o principal preditor de suicídio.", ["Suicídio", "Avaliação"]],
      ["Quais dados epidemiológicos do suicídio no Brasil caem em prova?", "Taxa em torno de 6 a 7 por 100 mil habitantes, crescente; homens morrem cerca de 4 vezes mais; o enforcamento é o método mais comum; a maioria tinha transtorno mental, sobretudo depressão.", ["Suicídio", "Epidemiologia"]],
      ["Quais as funções da autolesão não suicida?", "Intrapessoal (aliviar emoções intensas, punir-se) e interpessoal (comunicar sofrimento, influenciar outros). No DSM-5 é condição para estudo: autolesão em 5 ou mais dias no último ano, sem intenção suicida.", ["Suicídio", "Autolesão"]],
      ["Qual a conduta no risco moderado de suicídio, sem plano iminente?", "Intensificar o seguimento ambulatorial (retorno em poucos dias), envolver a rede de apoio, restringir acesso a meios letais e fazer um plano de segurança com o paciente. Risco alto ou iminente indica internação.", ["Suicídio", "Conduta"]],
    ],
    "pg-bipolar-mania": [
      ["Quais as indicações e o cuidado de uso da lurasidona?", "Aprovada para depressão bipolar I em adultos e em jovens de 10 a 17 anos, isolada ou com lítio ou valproato. Deve ser tomada com alimento (pelo menos 350 kcal) para ser bem absorvida.", ["Bipolar", "Lurasidona"]],
      ["Como tratar episódios com características mistas?", "Preferir antipsicóticos atípicos ou valproato e suspender antidepressivos, que podem piorar a mistura de sintomas e aumentar o risco de suicídio.", ["Bipolar", "Episódio misto"]],
      ["Qual a abordagem da ciclagem rápida?", "Investigar hipotireoidismo, suspender antidepressivos e substâncias, e preferir valproato, quetiapina ou lamotrigina (polo depressivo); o lítio isolado costuma responder menos.", ["Bipolar", "Ciclagem rápida"]],
      ["Primeiro episódio maníaco após os 50 anos exige o quê?", "Investigar mania secundária: AVC, tumor, demência frontotemporal, doenças endócrinas e medicamentos (corticoides, levodopa, estimulantes, antidepressivos).", ["Bipolar", "Mania secundária"]],
      ["Quais intervenções psicossociais reduzem recaídas no bipolar?", "Psicoeducação (sobretudo em grupo), terapia focada na família, terapia interpessoal e de ritmo social e TCC, sempre associadas ao estabilizador.", ["Bipolar", "Psicoterapia"]],
      ["Qual o risco de suicídio no transtorno bipolar?", "Muito acima da população geral (cerca de 20 a 30 vezes), maior nas fases depressivas e mistas e no início da doença; o lítio reduz esse risco.", ["Bipolar", "Suicídio"]],
      ["Qual o principal fator de risco para recaída no pós-parto da mulher bipolar?", "Suspender o estabilizador na gestação. O pós-parto é o período de maior risco de recaída e de psicose puerperal, por isso se planeja a profilaxia antes do parto.", ["Bipolar", "Periparto"]],
    ],
    "pia-tea-neurodesenvolvimento": [
      ["O que é camuflagem no autismo?", "Estratégias, conscientes ou não, para esconder traços autistas e parecer adequado socialmente (imitar, ensaiar falas, forçar contato visual). Mais comum em meninas, contribui para o subdiagnóstico e causa exaustão, ansiedade e depressão.", ["TEA", "Camuflagem"]],
      ["Alterações sensoriais fazem parte dos critérios do TEA?", "Sim. Hiper ou hiporreatividade a estímulos sensoriais, ou interesse incomum por aspectos sensoriais, é um dos critérios do domínio B (comportamentos restritos e repetitivos).", ["TEA", "Critérios"]],
      ["TEA e TDAH podem ser diagnosticados juntos?", "Sim, desde o DSM-5. Os estimulantes funcionam na comorbidade, mas com efeito menor e mais efeitos adversos (irritabilidade, retraimento).", ["TEA", "Comorbidade"]],
      ["O que aconteceu com Asperger e transtorno desintegrativo no DSM-5?", "Foram incorporados ao transtorno do espectro autista. O desintegrativo era a regressão em 2 ou mais áreas após pelo menos 2 anos de desenvolvimento normal, antes dos 10 anos.", ["TEA", "Classificação"]],
    ],
    "pia-tdah-disruptivos": [
      ["Quais funções a avaliação neuropsicológica no TDAH costuma examinar?", "Atenção (sustentada, seletiva), memória operacional, funções executivas (planejamento, controle inibitório, flexibilidade) e velocidade de processamento. O diagnóstico continua clínico.", ["TDAH", "Neuropsicologia"]],
      ["O que é memória operacional?", "A capacidade de manter informações em mente enquanto se executa uma tarefa com elas (como fazer uma conta de cabeça). Costuma estar prejudicada no TDAH.", ["TDAH", "Funções executivas"]],
      ["Como se trata o transtorno da conduta?", "Intervenções familiares e comunitárias são a base: treinamento parental e terapia multissistêmica. Medicamentos tratam comorbidades (TDAH) ou agressividade grave (risperidona).", ["Disruptivos", "Conduta"]],
      ["Como tratar TDAH em adolescente com uso de substâncias?", "Tratar as duas condições. Preferir formulações com menor potencial de abuso (lisdexanfetamina, liberação prolongada) ou atomoxetina. Tratar o TDAH não aumenta o risco de uso de substâncias.", ["TDAH", "Substâncias"]],
    ],
    "pg-ansiedade-toc-trauma": [
      ["Que tipos de exposição contam no critério A do TEPT?", "Vivenciar diretamente, testemunhar, saber que ocorreu com familiar ou amigo próximo (de forma violenta ou acidental) e exposição repetida a detalhes aversivos no trabalho (socorristas, policiais).", ["TEPT", "Critério A"], "Exposição pela mídia só conta se for por trabalho."],
      ["Quais os fatores de risco para TEPT após um trauma?", "Sexo feminino, gravidade e tipo do trauma (violência sexual é dos de maior risco), traumas prévios, transtorno mental prévio, dissociação durante o evento e pouco suporte social depois.", ["TEPT", "Fatores de risco"], "Não ter tido traumas prévios não é fator de risco."],
      ["Quais efeitos o trauma na infância deixa na biologia?", "Alterações duradouras da responsividade do eixo HHA e menor volume do hipocampo. Diferentes tipos de maus-tratos costumam ocorrer juntos (polivitimização).", ["Trauma", "Neurobiologia"]],
      ["Qual estrutura faz o freio do eixo HHA?", "O hipocampo, por retroalimentação negativa do cortisol. Quando lesado ou reduzido (estresse crônico, trauma), o eixo fica hiperativo e há mais emoções negativas.", ["Trauma", "Eixo HHA"]],
      ["Como manejar a crise de pânico na emergência?", "Afastar causas clínicas (ECG, glicemia, sinais vitais), tranquilizar e orientar respiração. Benzodiazepínico de ação rápida pode ser usado pontualmente; o tratamento de prevenção é ISRS ou IRSN com TCC.", ["Pânico", "Emergência"]],
      ["Quando a pregabalina é opção no TAG?", "Quando há dor crônica, fibromialgia ou intolerância aos ISRS e IRSN. Tem efeito rápido, mas pode causar sedação, tontura, ganho de peso e uso indevido.", ["TAG", "Pregabalina"]],
      ["Quais são os sintomas não somáticos da ansiedade?", "Medo de perder o controle, de enlouquecer ou de morrer, preocupação, apreensão e desrealização. Os somáticos são palpitação, tremor, falta de ar e sudorese.", ["Ansiedade", "Sintomas"]],
      ["O que define o transtorno de sintomas somáticos?", "Um ou mais sintomas físicos angustiantes com pensamentos, sentimentos ou comportamentos excessivos sobre eles (preocupação, ansiedade, tempo e energia), por 6 meses ou mais. Não exige que o sintoma seja inexplicado.", ["Somatoformes", "Sintomas somáticos"]],
      ["O que é o transtorno de ansiedade de doença?", "Preocupação com ter ou contrair doença grave, com sintomas físicos ausentes ou leves, por 6 meses ou mais; tipos que buscam e que evitam cuidado. A CID-11 classifica a hipocondria no grupo do TOC.", ["Somatoformes", "Hipocondria"]],
      ["Quais sinais positivos sugerem transtorno neurológico funcional (conversivo)?", "Sinal de Hoover na paresia, tremor que muda de ritmo com distração, crises não epilépticas com olhos fechados, movimentos assíncronos e longa duração. Não exige estressor identificado nem 'bela indiferença'.", ["Somatoformes", "Conversivo"]],
      ["O que é a síndrome de referência olfatória?", "Crença persistente de exalar odor ruim ou ofensivo, que os outros não percebem, com comportamentos repetitivos (checar, lavar). A CID-11 a inclui no grupo do TOC.", ["TOC", "Referência olfatória"]],
      ["O que é o transtorno do comportamento sexual compulsivo?", "Padrão persistente de falha em controlar impulsos sexuais intensos, com prejuízo, na CID-11 entre os transtornos do controle de impulsos. O uso de pornografia é a forma mais comum.", ["Impulsos", "Sexual compulsivo"]],
      ["Quando um interesse parafílico vira transtorno?", "Quando causa sofrimento ou prejuízo à pessoa, ou dano ou risco a outros que não consentiram. Ex.: masoquismo sexual é a excitação com ser humilhado ou sofrer dor, com sofrimento ou prejuízo.", ["Sexualidade", "Parafilias"]],
      ["O que é o TEPT complexo (CID-11)?", "TEPT após traumas prolongados ou repetidos (abuso na infância, tortura) somado a desregulação afetiva, autoconceito negativo e dificuldades persistentes nos relacionamentos.", ["TEPT", "CID-11"]],
      ["Qual a epidemiologia do TOC?", "Prevalência de 2 a 3% ao longo da vida, com início bimodal: na infância (mais em meninos) e no início da vida adulta. Sem tratamento, o curso costuma ser crônico.", ["TOC", "Epidemiologia"]],
      ["O que são PANDAS e PANS?", "Início abrupto de TOC e/ou tiques em crianças, associado a infecção estreptocócica (PANDAS) ou a outros desencadeantes (PANS), com outros sintomas neuropsiquiátricos.", ["TOC", "Infância"]],
      ["Quais transtornos são os mais prevalentes na população geral?", "Fobias específicas, transtornos por uso de álcool e depressão maior estão entre os mais frequentes nos grandes estudos populacionais.", ["Epidemiologia", "Prevalência"]],
      ["O que é mais provável após estupro?", "TEPT, com revivência intrusiva, evitação e hipervigilância; violência sexual é um dos traumas com maior taxa de TEPT. O cuidado inclui profilaxias clínicas e psicoterapia focada no trauma.", ["TEPT", "Violência sexual"]],
    ],
    "psicoterapia-teorias-tecnicas": [
      ["Quais as técnicas e etapas do psicodrama (Moreno)?", "Técnicas: duplo, espelho, inversão de papéis e solilóquio. Etapas da sessão: aquecimento, dramatização e compartilhamento. Personagens: protagonista, diretor, ego-auxiliar e plateia.", ["Psicodrama", "Técnicas"]],
      ["O que é a matriz de identidade de Moreno?", "Etapas do desenvolvimento do papel: identidade total (bebê indiferenciado do outro), reconhecimento do eu, reconhecimento do tu e, por fim, capacidade de inverter papéis.", ["Psicodrama", "Matriz de identidade"]],
      ["Quais os conceitos centrais de Jung?", "Inconsciente pessoal e coletivo, arquétipos, persona, sombra (aspectos não reconhecidos de si, que aparecem em projeções), anima/animus e individuação. Os sonhos têm função compensatória.", ["Jung", "Psicologia analítica"]],
      ["Qual a ideia de Jung sobre a postura do terapeuta?", "Conhecer as teorias e técnicas, mas, no encontro com o paciente, ser antes de tudo outro ser humano; o terapeuta precisa conhecer a si mesmo, pois sua personalidade faz parte do tratamento.", ["Jung", "Terapeuta"]],
      ["O que é a terapia do esquema (Young)?", "Integração de TCC, apego e Gestalt para transtornos de personalidade: trabalha esquemas iniciais desadaptativos formados por necessidades emocionais não atendidas na infância, usando modos de esquema e reparentalização limitada.", ["TCC", "Terapia do esquema"]],
      ["O que caracteriza as terapias de terceira onda?", "Focam a relação da pessoa com seus pensamentos e emoções, não o conteúdo: aceitação, mindfulness, valores e flexibilidade psicológica. Ex.: ACT, DBT, terapia cognitiva baseada em mindfulness, FAP.", ["TCC", "Terceira onda"]],
      ["O que é a ativação comportamental na depressão?", "Aumentar o contato com fontes estáveis de reforço positivo (atividades prazerosas e com sentido) e reduzir a evitação. Tem eficácia comparável à TCC completa.", ["Comportamental", "Depressão"]],
      ["O que caracteriza a psicoterapia breve dinâmica?", "Foco delimitado, número limitado de sessões, terapeuta ativo e término trabalhado desde o início. É breve, mas não superficial.", ["Psicoterapia breve", "Características"]],
      ["Quais os critérios de exclusão de Malan para psicoterapia breve?", "Tentativas graves de suicídio, dependência de drogas ou álcool, psicose, internações longas, atuações destrutivas graves e sintomas incapacitantes crônicos.", ["Psicoterapia breve", "Malan"]],
      ["No término da psicoterapia breve, qual o risco?", "A contratransferência do terapeuta pode dificultar ou adiar o fim; é preciso estar atento para não prolongar o tratamento por necessidade própria.", ["Psicoterapia breve", "Término"]],
      ["Quais os componentes da aliança terapêutica (Bordin)?", "Vínculo afetivo, acordo sobre as metas e acordo sobre as tarefas. É o fator comum que melhor prediz o resultado, em qualquer abordagem.", ["Fatores comuns", "Aliança"]],
      ["Qual o objetivo prioritário das primeiras sessões?", "Estabelecer o vínculo e a aliança terapêutica, além do contrato (enquadre) e da avaliação inicial.", ["Fatores comuns", "Início"]],
      ["Quais as ideias da terapia familiar sistêmica?", "A família é um sistema: o sintoma do 'paciente identificado' mantém o equilíbrio (homeostase) familiar e a causalidade é circular. Escolas: estrutural (Minuchin), estratégica (Haley) e de Milão.", ["Sistêmica", "Família"]],
      ["Quais sinais indicam baixa adequação à psicoterapia de insight?", "Pouca disponibilidade psicológica (dificuldade de pensar sobre si), baixo interesse ou motivação e prejuízo cognitivo grave.", ["Indicação", "Psicoterapia"]],
      ["O que é atuação (acting out)?", "Expressar em ações, muitas vezes impulsivas e inadequadas, conflitos inconscientes que não estão sendo lembrados ou falados.", ["Psicanálise", "Defesas"]],
      ["Como o terapeuta deve lidar com a resistência?", "Compreendê-la e trabalhá-la como parte do processo, respeitando o ritmo do paciente, em vez de confrontá-la ou forçar mudanças.", ["Psicanálise", "Resistência"]],
      ["Qual o modelo ABC de Ellis?", "Na terapia racional-emotiva comportamental: A (evento ativador), B (crenças sobre o evento) e C (consequências emocionais). Mudar crenças irracionais muda as consequências.", ["TCC", "Ellis"]],
    ],
    "forense-etica-legislacao": [
      ["Quais as dimensões da capacidade para decidir sobre tratamento?", "Entender a informação, apreciar como ela se aplica a si, raciocinar comparando opções e expressar uma escolha (modelo de Appelbaum, MacCAT-T). A capacidade é avaliada para cada decisão.", ["Ética", "Capacidade decisória"]],
      ["Quais os 4 princípios da bioética?", "Autonomia, beneficência, não maleficência e justiça (Beauchamp e Childress). A justiça tem aspectos coletivos e sociais, como a distribuição de recursos.", ["Ética", "Bioética"]],
      ["Diferencie perito e assistente técnico.", "O perito é nomeado pelo juiz e deve ser imparcial; produz o laudo. O assistente técnico é indicado por uma das partes, é parcial e produz parecer.", ["Perícia", "Atores"]],
      ["Qual a estrutura do laudo pericial?", "Preâmbulo, quesitos, histórico, exame (psíquico e físico), discussão, conclusão e respostas aos quesitos. É a forma de comunicação por excelência entre Medicina e Direito.", ["Perícia", "Laudo"]],
      ["Como termina a internação involuntária?", "Por solicitação escrita do familiar ou responsável legal, ou quando o médico responsável determinar (Lei 10.216). A alta também deve ser comunicada ao Ministério Público.", ["Legislação", "Internação"]],
      ["Quem determina a internação compulsória?", "O juiz competente, considerando o laudo médico e as condições de segurança do estabelecimento para o paciente e os demais.", ["Legislação", "Internação"]],
      ["O que a Lei 13.840/2019 prevê para dependentes químicos?", "Internação involuntária a pedido de familiar ou de servidor da saúde ou assistência social, por no máximo 90 dias. O acolhimento em comunidade terapêutica é voluntário e é vedado o isolamento físico.", ["Legislação", "Drogas"]],
      ["A dependência de drogas exclui a imputabilidade?", "Não por si só. Só isenta de pena quem, por dependência, era inteiramente incapaz de entender o ilícito ou de se controlar no momento do fato (art. 45 da Lei de Drogas).", ["Penal", "Drogas"]],
      ["Como a CID-11 classifica o burnout?", "Como fenômeno ocupacional (não como doença), com 3 dimensões: exaustão, distanciamento ou cinismo em relação ao trabalho e redução da eficácia profissional. O manejo exige atuar sobre o estresse no trabalho.", ["Trabalho", "Burnout"]],
      ["O que define acidente de trabalho na lei previdenciária?", "Evento pelo exercício do trabalho que causa lesão ou perturbação funcional com morte ou perda/redução, permanente ou temporária, da capacidade de trabalho. Doenças ocupacionais são equiparadas.", ["Trabalho", "Acidente"]],
      ["Adolescentes têm direito ao sigilo médico?", "Sim, inclusive em relação aos pais. O sigilo pode ser quebrado quando há risco à vida ou à saúde (suicídio, abuso), e o adolescente deve ser informado disso.", ["Ética", "Sigilo"]],
      ["Como o ECA e o Código Civil tratam a representação de menores?", "Menores de 16 anos são representados pelos pais; entre 16 e 18, assistidos. Suspeita de maus-tratos deve ser comunicada ao Conselho Tutelar.", ["Legislação", "ECA"]],
      ["O que deve constar num atestado médico?", "O que foi constatado no atendimento, como dias de afastamento. O diagnóstico (CID) só com autorização do paciente. É vedado atestar sem examinar ou fornecer atestado falso.", ["Ética", "Atestado"]],
      ["O psiquiatra assistente pode dar atestado para um processo?", "Sim. A pedido do paciente, pode atestar diagnóstico e implicações da doença; isso não é perícia, que cabe a um perito não envolvido no tratamento.", ["Ética", "Atestado"]],
      ["O que é o BPC?", "Benefício de Prestação Continuada (LOAS): um salário mínimo para pessoa com deficiência ou idoso a partir de 65 anos, com renda familiar per capita de até 1/4 do salário mínimo, sem exigir contribuição.", ["Legislação", "Assistência"]],
      ["Na ação de curatela, o que o perito conclui?", "Se há incapacidade para os atos patrimoniais e negociais e em que extensão. Não cabe ao perito indicar qual familiar deve ser o curador.", ["Civil", "Curatela"]],
      ["O que diz a Declaração do Havaí sobre a relação do psiquiatra?", "Código de ética da Associação Mundial de Psiquiatria: a relação com o avaliado pode ser diferente da terapêutica (ex.: perícia), e isso deve ser explicado à pessoa.", ["Ética", "Declarações"]],
    ],
    "dq-alcool": [
      ["Qual a dose de tiamina na encefalopatia de Wernicke?", "Doses altas por via venosa (200 a 500 mg, 3 vezes ao dia, por alguns dias), sempre antes de glicose, e depois manter por via oral.", ["Álcool", "Wernicke"]],
      ["Existe consumo seguro de álcool?", "Não: para a OMS não há nível de consumo sem risco. No Brasil, uma dose padrão tem cerca de 14 g de álcool (uma lata de cerveja de 350 ml).", ["Álcool", "Consumo"]],
      ["O que é beber pesado episódico (binge)?", "Cerca de 4 ou mais doses para mulheres e 5 ou mais para homens em uma ocasião (aproximadamente 2 horas). Associa-se a acidentes, violência e sexo desprotegido.", ["Álcool", "Padrões de uso"]],
      ["Como o álcool é metabolizado?", "Pela álcool desidrogenase e depois aldeído desidrogenase, com eliminação de ordem zero (cerca de uma dose por hora). Beber rápido eleva mais o pico de alcoolemia.", ["Álcool", "Metabolismo"]],
      ["Por que as mulheres são mais vulneráveis ao álcool?", "Atingem alcoolemia maior com a mesma dose (menos água corporal e menos álcool desidrogenase gástrica), têm mais lesão hepática e progressão mais rápida para dependência (telescoping).", ["Álcool", "Mulheres"]],
      ["Qual a neurobiologia da abstinência alcoólica?", "O uso crônico reduz a função GABA e aumenta a glutamatérgica (NMDA); ao parar, sobra hiperexcitabilidade: tremor, ansiedade, hiperatividade autonômica e convulsões.", ["Álcool", "Abstinência"]],
    ],
    "dq-drogas-intoxicacoes": [
      ["Como a cocaína causa infarto?", "Vasoespasmo coronariano, aumento da agregação plaquetária (tromboxano), maior demanda de oxigênio e aterosclerose acelerada. Na dor torácica: benzodiazepínico, nitrato e AAS.", ["Cocaína", "Infarto"]],
      ["Qual droga mais prejudica a placenta e o crescimento fetal?", "A cocaína: descolamento prematuro de placenta, restrição de crescimento, prematuridade e baixo peso.", ["Cocaína", "Gestação"]],
      ["O que diferencia o crack da cocaína aspirada?", "O crack é fumado: chega ao cérebro em segundos, com efeito intenso e curto, maior fissura e maior potencial de dependência.", ["Cocaína", "Crack"]],
      ["O que são os canabinoides sintéticos (K2, spice)?", "Agonistas totais do CB1 (o THC é parcial): causam mais psicose, agitação, convulsões e toxicidade grave, e não aparecem nos exames de urina comuns.", ["Cannabis", "Sintéticos"]],
      ["O que o uso crônico de cannabis faz com o receptor CB1?", "Reduz a quantidade de receptores (downregulation), o que explica a tolerância e reverte com a abstinência. A abstinência dá irritabilidade, insônia, ansiedade, menos apetite e inquietação.", ["Cannabis", "Tolerância"]],
      ["Como se calculam o Fagerström e a carga tabágica?", "Fagerström: 6 itens, de 0 a 10 (8 a 10 = dependência muito alta). Carga tabágica (anos-maço) = cigarros por dia dividido por 20, vezes os anos de fumo.", ["Tabaco", "Avaliação"]],
      ["Como é a abstinência de nicotina?", "Irritabilidade, ansiedade, dificuldade de concentração, aumento do apetite, inquietação, humor deprimido e insônia; pico nos primeiros dias e duração de 2 a 4 semanas.", ["Tabaco", "Abstinência"]],
      ["Quais as opções de 2ª linha para o tabagismo?", "Nortriptilina e clonidina, quando terapia de reposição de nicotina, bupropiona e vareniclina não puderem ser usadas ou falharem.", ["Tabaco", "Tratamento"]],
      ["O que é EVALI?", "Lesão pulmonar aguda associada ao cigarro eletrônico (vaping), ligada sobretudo ao acetato de vitamina E em produtos com THC.", ["Tabaco", "Cigarro eletrônico"]],
      ["Que área assume o controle quando o uso vira hábito?", "No início, a recompensa depende do estriado ventral (núcleo accumbens). Com o uso repetido, o controle passa ao estriado dorsal (dorsolateral), o que torna o consumo automático e compulsivo, com menor controle pré-frontal.", ["Dependência", "Neurobiologia"]],
      ["Como fazer a tranquilização rápida na agitação grave?", "Primeiro abordagem verbal e oferta de medicação oral. Se necessário, IM: haloperidol com prometazina, midazolam ou olanzapina. É eficaz qualquer que seja a causa, mas a causa deve ser investigada.", ["Emergência", "Agitação"], "Não associe olanzapina IM a benzodiazepínico parenteral: risco de depressão respiratória."],
      ["Como as mulheres se relacionam com as substâncias?", "Começam o uso mais tarde, progridem mais rápido para dependência, o parceiro tem papel importante no início e na manutenção do uso, e enfrentam mais estigma e barreiras ao tratamento.", ["Substâncias", "Mulheres"]],
      ["Quantas pessoas com transtorno por uso de substâncias recebem tratamento?", "Menos de 1 em cada 5 no mundo (UNODC): a lacuna de tratamento é muito grande.", ["Substâncias", "Epidemiologia"]],
      ["Quais cuidados com metadona e buprenorfina?", "Metadona: prolonga o QT e acumula (meia-vida longa), exige titulação lenta. Buprenorfina: agonista parcial com efeito teto na depressão respiratória, mais segura na overdose.", ["Opioides", "Manutenção"]],
    ],
  };

  const newDecks = [
    {
      id: "pia-humor-ansiedade-infancia",
      title: "Humor, ansiedade e outros quadros na infância",
      area: "PIA",
      module: "Humor, ansiedade e outros quadros na infância",
      basis: "Temas mais cobrados nas provas do banco",
      importance: 5,
      studyTopic: "Psiquiatria Infantil",
      priorities: ["high-frequency"],
      cards: toCards("pia-humor-ansiedade-infancia", [
        ["Como a depressão se apresenta e se trata na infância?", "Irritabilidade pode substituir o humor deprimido, com queixas somáticas e queda escolar. Tratamento: psicoterapia (TCC ou TIP para adolescentes) e, se necessário, fluoxetina (a partir de 8 anos) ou escitalopram (a partir de 12).", ["Depressão", "Infância"]],
        ["O alerta de suicidalidade impede o antidepressivo em jovens?", "Não. Há aumento pequeno de ideação no início, então se monitora de perto nas primeiras semanas; o benefício supera o risco na depressão moderada a grave.", ["Depressão", "Antidepressivos"]],
        ["Qual o tratamento mais eficaz da ansiedade na infância?", "TCC associada à sertralina (estudo CAMS), superior a cada uma isolada. Crianças com ansiedade respondem melhor aos ISRS do que as com depressão.", ["Ansiedade", "Tratamento"]],
        ["Quando começa a ansiedade social?", "Idade média de início por volta de 13 anos; cerca de 75% começam entre 8 e 15 anos.", ["Ansiedade", "Fobia social"]],
        ["O que é mutismo seletivo?", "Falha consistente em falar em situações sociais específicas (como a escola), embora fale em outras (em casa), por 1 mês ou mais, sem contar o primeiro mês de aula. Fortemente associado à ansiedade social.", ["Ansiedade", "Mutismo seletivo"]],
        ["Qual o tratamento da mania na infância e adolescência?", "Antipsicóticos atípicos foram mais eficazes que lítio e valproato na mania pediátrica; exigem monitorização de peso, glicemia e lipídios.", ["Bipolar", "Infância"]],
        ["O que monitorar em criança usando risperidona?", "Peso e IMC, circunferência abdominal, glicemia, lipídios, prolactina e sintomas extrapiramidais.", ["Psicose", "Antipsicóticos"]],
        ["Quais as características da síndrome alcoólica fetal?", "Filtro labial liso, lábio superior fino, fendas palpebrais curtas, restrição de crescimento e alterações do sistema nervoso. Problemas de comportamento e de aprendizagem persistem na vida adulta.", ["Álcool", "Síndrome alcoólica fetal"]],
        ["Diferencie transtorno de apego reativo e de interação social desinibida.", "Ambos surgem após negligência grave e exigem idade de desenvolvimento de pelo menos 9 meses. Apego reativo: criança inibida, retraída, que raramente busca ou aceita conforto. Desinibido: aproxima-se de estranhos sem cautela e vai com eles sem hesitar.", ["Apego", "Negligência"]],
        ["Quando diagnosticar e como tratar a enurese?", "A partir dos 5 anos, com escapes 2 ou mais vezes por semana por 3 meses. 1ª linha: alarme de enurese e medidas comportamentais; desmopressina como alternativa.", ["Eliminação", "Enurese"]],
      ]),
    },
  ];

  const known = new Set(root.decks.map((item) => item.id));
  for (const item of newDecks) if (!known.has(item.id)) root.decks.push(item);
  for (const [deckId, list] of Object.entries(extras)) {
    const target = root.decks.find((item) => item.id === deckId);
    if (!target) continue;
    const subtheme = target.cards[0]?.subtheme;
    for (const card of toCards(`${deckId}-p`, list, subtheme)) {
      if (!target.cards.some((existing) => existing.id === card.id)) target.cards.push(card);
    }
  }
})();
