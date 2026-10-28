/* Roteiros guiados do simulador: 2 por classe, de 3 a 4 passos e uma pergunta de checagem.
   - setup: estado aplicado ao entrar no passo (tela, remédio, controles). Ao trocar de remédio,
     nível, interações e ocupação voltam ao padrão antes de aplicar o resto.
   - do: o que a pessoa deve olhar ou mexer; see: o que observar e por quê.
   - check: pergunta final; a resposta certa é a de índice "correct".
   Textos escritos a partir dos mesmos dados e fontes das telas (ver data/sources.js). */

window.PHARMA_TOURS = {
  antipsicoticos: [
    {
      id: "ap-parkinsonismo", title: "Por que o haloperidol dá parkinsonismo e a clozapina não",
      steps: [
        { setup: { mode: "paths", drug: "haloperidol" }, do: "Olhe a via nigroestriatal (azul) e o perfil de receptores do haloperidol.", see: "D2 muito forte e quase nenhum 5-HT2A: a via nigroestriatal fica com risco alto de parkinsonismo." },
        { setup: { mode: "paths", drug: "clozapina" }, do: "Agora a clozapina, na mesma tela.", see: "D2 fraco e 5-HT2A forte: a via nigroestriatal aparece tracejada (pouco afetada)." },
        { setup: { mode: "synapse", drug: "haloperidol", occupancy: 85 }, do: "Na sinapse, veja o haloperidol com 85% dos D2 ocupados.", see: "Acima de ~78% de ocupação entram os extrapiramidais; a faixa de efeito começa em ~65%." },
      ],
      check: {
        prompt: "O que mais protege a via nigroestriatal na clozapina?",
        options: ["D2 fraco e bloqueio forte de 5-HT2A", "Bloqueio de H1", "Meia-vida curta", "Agonismo parcial de D2"],
        correct: 0,
        explain: "Com pouco D2 ocupado e o 5-HT2A bloqueado (o que libera dopamina no estriado), sobra estímulo dopaminérgico na via nigroestriatal.",
      },
    },
    {
      id: "ap-parcial", title: "Agonista parcial: aripiprazol, prolactina e acatisia",
      steps: [
        { setup: { mode: "paths", drug: "haloperidol" }, do: "Olhe a via tuberoinfundibular (rosa) com o haloperidol.", see: "Bloqueio total de D2 na hipófise: a prolactina sobe muito." },
        { setup: { mode: "paths", drug: "aripiprazol" }, do: "Troque para o aripiprazol e repare na barra listrada do D2.", see: "Listrada = agonista parcial: mantém algum estímulo no receptor. A prolactina quase não sobe e pode até cair." },
        { setup: { mode: "eps", drug: "aripiprazol", eps: "acatisia" }, do: "Abra Extrapiramidais, na acatisia.", see: "O agonista parcial poupa o parkinsonismo, mas a acatisia ainda pode aparecer." },
      ],
      check: {
        prompt: "Por que o aripiprazol quase não aumenta a prolactina?",
        options: ["É agonista parcial: mantém algum estímulo no D2", "Não se liga ao D2", "Bloqueia o 5-HT2A", "Tem meia-vida curta"],
        correct: 0,
        explain: "Na hipófise, a dopamina inibe a prolactina pelo D2. O aripiprazol ocupa o D2 mas ainda o estimula em parte, então o freio sobre a prolactina continua.",
      },
    },
  ],
  antidepressivos: [
    {
      id: "ad-isrs", title: "ISRS: por que ~80% de ocupação e semanas de espera",
      steps: [
        { setup: { mode: "synapse", drug: "sertralina", occupancy: 50 }, do: "Veja a sinapse da sertralina com metade do SERT ocupado.", see: "Abaixo de ~60%, sobra pouca serotonina na fenda." },
        { setup: { mode: "synapse", drug: "sertralina", occupancy: 85 }, do: "Agora com 85% do SERT ocupado.", see: "Nas doses usuais o SERT já fica perto de 80%; subir a dose aumenta pouco a ocupação e mais os efeitos colaterais." },
        { setup: { mode: "paths", drug: "sertralina" }, do: "Volte à primeira tela e olhe os efeitos.", see: "Náusea e disfunção sexual vêm do excesso de serotonina em outros receptores (5-HT3, 5-HT2)." },
      ],
      check: {
        prompt: "Se o SERT é bloqueado em horas, por que a melhora do humor demora semanas?",
        options: ["Depende da dessensibilização dos autorreceptores 5-HT1A", "O remédio demora semanas para ser absorvido", "O SERT só fica bloqueado depois de semanas", "Precisa acumular no tecido adiposo"],
        correct: 0,
        explain: "No começo, a serotonina extra ativa os autorreceptores 5-HT1A, que freiam o neurônio. Eles se dessensibilizam ao longo de semanas, e só então a transmissão aumenta de fato.",
      },
    },
    {
      id: "ad-mirtazapina", title: "Mirtazapina × ISRS: soltar o freio α2",
      steps: [
        { setup: { mode: "synapse", drug: "mirtazapina", occupancy: 70 }, do: "Veja a sinapse da mirtazapina.", see: "Ela não bloqueia recaptação: bloqueia o autorreceptor α2 (o freio) e sai mais noradrenalina e serotonina." },
        { setup: { mode: "compare", a: "sertralina", b: "mirtazapina" }, do: "Compare sertralina e mirtazapina.", see: "Mirtazapina: menos náusea e disfunção sexual (bloqueia 5-HT2 e 5-HT3), mais sedação e apetite (H1)." },
      ],
      check: {
        prompt: "Por que a mirtazapina causa pouca disfunção sexual?",
        options: ["Bloqueia 5-HT2 e não bloqueia o SERT", "Aumenta muito a dopamina", "Inibe a MAO", "Bloqueia M1"],
        correct: 0,
        explain: "A disfunção sexual dos ISRS vem do excesso de serotonina estimulando 5-HT2. A mirtazapina não bloqueia o SERT e ainda bloqueia o 5-HT2.",
      },
    },
  ],
  estabilizadores: [
    {
      id: "es-litio", title: "Lítio: faixa estreita e interações",
      steps: [
        { setup: { mode: "synapse", drug: "litio", level: 0.7 }, do: "Veja o nível de lítio em 0,7 mmol/L.", see: "Faixa de manutenção (0,6–0,8)." },
        { setup: { mode: "synapse", drug: "litio", level: 1.2 }, do: "Agora em 1,2 mmol/L.", see: "Acima do alvo: mais efeitos colaterais. A faixa útil é estreita." },
        { setup: { mode: "synapse", drug: "litio", level: 0.7, inter: ["tiazidico"] }, do: "Volte a 0,7 e ligue o diurético tiazídico.", see: "O tiazídico pode subir o lítio em até 4 vezes, em geral nos primeiros 10 dias: chega à faixa tóxica." },
      ],
      check: {
        prompt: "Paciente estável com lítio 0,7 mmol/L começa hidroclorotiazida. O que fazer?",
        options: ["Esperar subida do lítio: dosar o nível e preferir diurético de alça", "Nada: o tiazídico baixa o lítio", "Dobrar o lítio", "Trocar o lítio por valproato na hora"],
        correct: 0,
        explain: "Tiazídicos, IECA/BRA e AINE sobem o lítio (até 4 vezes). Diurético de alça é mais seguro; dosar o nível depois de mudanças.",
      },
    },
    {
      id: "es-lamotrigina", title: "Lamotrigina: titulação devagar",
      steps: [
        { setup: { mode: "synapse", drug: "lamotrigina" }, do: "Veja a titulação padrão da lamotrigina.", see: "25 mg nas semanas 1–2, 50 mg nas 3–4, 100 mg na 5ª e 200 mg depois. Subir rápido aumenta o risco de rash grave." },
        { setup: { mode: "synapse", drug: "lamotrigina", inter: ["valproato"] }, do: "Ligue “Com valproato”.", see: "O valproato pode dobrar o nível da lamotrigina: titulação e dose pela metade." },
        { setup: { mode: "synapse", drug: "lamotrigina", inter: ["indutor"] }, do: "Troque para “Com carbamazepina”.", see: "Indutores baixam o nível: titulação e dose maiores." },
      ],
      check: {
        prompt: "Paciente em uso de valproato vai começar lamotrigina. Como titular?",
        options: ["Com metade das doses da titulação padrão", "Com o dobro das doses", "Começar direto com 200 mg", "Igual à titulação padrão"],
        correct: 0,
        explain: "O valproato inibe a eliminação da lamotrigina e pode dobrar o nível; titular pela metade reduz o risco de rash grave (Stevens-Johnson).",
      },
    },
  ],
  ansioliticos: [
    {
      id: "an-retirada", title: "Meia-vida e retirada: alprazolam × diazepam",
      steps: [
        { setup: { mode: "synapse", drug: "alprazolam", days: 14, stopped: false }, do: "Veja o alprazolam com 14 dias de uso diário.", see: "Meia-vida intermediária (12–15 h): com uma dose por dia, acumula pouco (cerca de 1,4 vez o pico de uma dose)." },
        { setup: { mode: "synapse", drug: "alprazolam", days: 14, stopped: true }, do: "Ligue “Parar de repente”.", see: "O nível cai rápido: a retirada aparece cedo e é intensa." },
        { setup: { mode: "synapse", drug: "diazepam", days: 14, stopped: true }, do: "Faça o mesmo com o diazepam.", see: "Meia-vida longa: o nível cai devagar, como uma redução automática. A retirada é mais tardia e mais suave." },
      ],
      check: {
        prompt: "Por que trocar alprazolam por diazepam antes de retirar?",
        options: ["A meia-vida longa faz o nível cair devagar e a retirada ser mais suave", "O diazepam não causa dependência", "O diazepam age fora do GABA-A", "O alprazolam não pode ser reduzido aos poucos"],
        correct: 0,
        explain: "Com meia-vida longa, cada redução de dose se traduz numa queda lenta do nível. Use o conversor de doses equivalentes na mesma tela.",
      },
    },
    {
      id: "an-hipnoticos", title: "Hipnóticos fora do GABA-A",
      steps: [
        { setup: { mode: "paths", drug: "zolpidem" }, do: "Veja onde age o zolpidem.", see: "Preferência por GABA-A com α1: hipnótico, com pouco efeito ansiolítico." },
        { setup: { mode: "paths", drug: "suvorexanto" }, do: "Agora o suvorexanto.", see: "Nada no GABA-A: bloqueia os receptores de orexina, o sinal que mantém a vigília." },
        { setup: { mode: "synapse", drug: "suvorexanto", days: 14, stopped: true }, do: "Pare o suvorexanto depois de 14 dias.", see: "Sem evidência de dependência física ou retirada nos estudos. Meia-vida de 12 h: pode sobrar sonolência de manhã." },
      ],
      check: {
        prompt: "Em quem o antagonista de orexina é contraindicado?",
        options: ["Narcolepsia", "Idosos", "Insônia de manutenção", "Ansiedade generalizada"],
        correct: 0,
        explain: "Na narcolepsia já falta orexina; bloquear o que resta pode piorar sonolência e cataplexia.",
      },
    },
  ],
  estimulantes: [
    {
      id: "st-dia", title: "Formulações ao longo do dia",
      steps: [
        { setup: { mode: "synapse", drug: "metilfenidato-li", doseTime: 7, repeat: false }, do: "Veja o metilfenidato de liberação imediata às 7h.", see: "O efeito útil dura só 2 a 4 h: não cobre nem a manhã toda, e a queda rápida pode trazer rebote." },
        { setup: { mode: "synapse", drug: "metilfenidato-li", doseTime: 7, repeat: true }, do: "Ligue a segunda dose 4 h depois.", see: "A segunda dose cobre parte da tarde, ao custo de mais uma tomada." },
        { setup: { mode: "synapse", drug: "metilfenidato-oros", doseTime: 7 }, do: "Troque para o OROS às 7h.", see: "Uma dose cobre cerca de 12 h." },
        { setup: { mode: "synapse", drug: "metilfenidato-oros", doseTime: 12 }, do: "Agora o OROS dado ao meio-dia.", see: "Às 22h ainda há efeito: risco de insônia." },
      ],
      check: {
        prompt: "Criança usando OROS tomado ao meio-dia está com insônia. Qual o primeiro ajuste?",
        options: ["Dar a dose mais cedo", "Somar uma dose à noite", "Trocar por liberação imediata à noite", "Dobrar a dose"],
        correct: 0,
        explain: "O OROS dura cerca de 12 h; tomado cedo, o efeito acaba antes de dormir.",
      },
    },
    {
      id: "st-abuso", title: "Por que a atomoxetina não tem potencial de abuso",
      steps: [
        { setup: { mode: "paths", drug: "metilfenidato-li" }, do: "Veja onde age o metilfenidato de liberação imediata.", see: "Sobe a dopamina no pré-frontal e também no estriado e accumbens, de forma rápida: potencial de abuso." },
        { setup: { mode: "paths", drug: "atomoxetina" }, do: "Agora a atomoxetina.", see: "Só bloqueia o NET. No pré-frontal o NET também recapta dopamina, então lá ela sobe; no accumbens, não." },
      ],
      check: {
        prompt: "Por que a atomoxetina aumenta a dopamina no pré-frontal mas não no accumbens?",
        options: ["No pré-frontal quase não há DAT: o NET recapta a dopamina", "Ela bloqueia o DAT só no pré-frontal", "Ela libera dopamina das vesículas", "O accumbens não tem dopamina"],
        correct: 0,
        explain: "No pré-frontal, quem recapta a dopamina é o NET. No accumbens, é o DAT, que a atomoxetina não bloqueia.",
      },
    },
  ],
  demencias: [
    {
      id: "de-pulso", title: "Pulso antes do anticolinesterásico",
      steps: [
        { setup: { mode: "synapse", drug: "donepezila", pulse: 72, inter: [] }, do: "Veja a conduta com pulso de 72 bpm.", see: "Pode iniciar; pulso no início, todo mês na titulação e a cada 6 meses." },
        { setup: { mode: "synapse", drug: "donepezila", pulse: 56, inter: [] }, do: "Agora com 56 bpm, sem sintomas.", see: "Pode iniciar com cuidado: rever pulso e sintomas em 1 semana." },
        { setup: { mode: "synapse", drug: "donepezila", pulse: 48, inter: [] }, do: "E com 48 bpm.", see: "Abaixo de 50 bpm (ou com síncope): não iniciar e investigar a causa." },
        { setup: { mode: "synapse", drug: "donepezila", pulse: 56, inter: ["bradi"] }, do: "Volte a 56 bpm e ligue betabloqueador ou digoxina.", see: "Os efeitos na condução se somam: é a interação mais notificada." },
      ],
      check: {
        prompt: "Pulso de 48 bpm, sem sintomas, antes de iniciar donepezila. Conduta?",
        options: ["Não iniciar e investigar a causa", "Iniciar e rever em 1 semana", "Iniciar com metade da dose", "Iniciar normalmente"],
        correct: 0,
        explain: "Abaixo de 50 bpm: não iniciar e investigar. Se a causa não for o remédio, ou após marcapasso, pode-se tentar de novo.",
      },
    },
    {
      id: "de-indicacao", title: "Indicação por tipo e estágio",
      steps: [
        { setup: { mode: "synapse", drug: "donepezila", dtype: "alzheimer", dstage: "leve" }, do: "Veja o Alzheimer leve.", see: "Anticolinesterásicos indicados; memantina sem benefício na forma leve." },
        { setup: { mode: "synapse", drug: "memantina", dtype: "alzheimer", dstage: "grave" }, do: "Passe para o Alzheimer grave.", see: "Memantina indicada, sozinha ou somada; não suspender o anticolinesterásico só pela gravidade." },
        { setup: { mode: "synapse", drug: "galantamina", dtype: "lewy", dstage: "leve" }, do: "Agora a demência com corpos de Lewy.", see: "Donepezila ou rivastigmina primeiro; galantamina só se essas não forem toleradas." },
        { setup: { mode: "synapse", drug: "donepezila", dtype: "ftd", dstage: "leve" }, do: "E a demência frontotemporal.", see: "Nenhum deles é indicado." },
      ],
      check: {
        prompt: "Doença de Alzheimer leve, sem tratamento. Qual opção NÃO é recomendada?",
        options: ["Memantina", "Donepezila", "Rivastigmina", "Galantamina"],
        correct: 0,
        explain: "Na forma leve, os anticolinesterásicos são primeira linha; a memantina não mostrou benefício.",
      },
    },
  ],
  dependencia: [
    {
      id: "dq-precipitada", title: "Abstinência precipitada",
      steps: [
        { setup: { mode: "synapse", drug: "buprenorfina", addBg: false, addDose: 70 }, do: "Veja a buprenorfina sozinha, ocupando 70% dos receptores.", see: "Efeito teto: a ativação para em ~40%, com menos euforia e menos depressão respiratória." },
        { setup: { mode: "synapse", drug: "buprenorfina", addBg: true, addDose: 0 }, do: "Ligue “Já há opioide no receptor” com a dose em zero.", see: "A heroína ocupa 90% dos receptores: é a situação de quem está em uso." },
        { setup: { mode: "synapse", drug: "buprenorfina", addBg: true, addDose: 70 }, do: "Agora dê a buprenorfina (70%).", see: "Ela tira a heroína do receptor e ativa só em parte: a ativação cai e vem a abstinência." },
      ],
      check: {
        prompt: "Quando iniciar a buprenorfina em quem usa heroína?",
        options: ["Quando já houver sinais de abstinência (COWS)", "Durante a intoxicação", "Junto com a última dose de heroína", "Não importa o momento"],
        correct: 0,
        explain: "Já em abstinência, a buprenorfina aumenta a ativação e alivia; com o agonista total no receptor, ela a diminui e precipita abstinência. Outra opção é a indução em doses baixas.",
      },
    },
    {
      id: "dq-overdose", title: "Overdose: agonistas que se somam e naloxona",
      steps: [
        { setup: { mode: "synapse", drug: "metadona", addBg: true, addDose: 70 }, do: "Veja metadona por cima de heroína.", see: "Dois agonistas totais se somam, sem teto: ativação a 100% e depressão respiratória." },
        { setup: { mode: "synapse", drug: "naloxona", addBg: true, addDose: 70 }, do: "Troque para a naloxona.", see: "Ela tira o opioide do receptor em minutos: reverte a overdose e precipita abstinência." },
      ],
      check: {
        prompt: "Por que pode ser preciso repetir a naloxona?",
        options: ["Ela dura menos que muitos opioides", "Ela é agonista parcial", "Ela só age por via oral", "Ela não atravessa a barreira hematoencefálica"],
        correct: 0,
        explain: "O efeito da naloxona pode passar antes do opioide. Buprenorfina, fentanil e nitazenos, de alta afinidade, também podem exigir doses repetidas.",
      },
    },
  ],
};
