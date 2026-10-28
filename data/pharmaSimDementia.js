/* Dados do simulador de psicofarmacologia: fármacos nas demências (anticolinesterásicos e memantina).
   Material didático e simplificado: não serve para prescrição.
   - receptors: alvos com nível qualitativo (0 = sem ação, 4 = ação principal), conforme Maudsley
     Prescribing Guidelines 15ª ed. (tabela 6.1) e Stahl, Prescriber's Guide 8ª ed. (2024).
   - regions: quanto o remédio age na acetilcolina do córtex e do hipocampo, no glutamato (NMDA) e
     no corpo (efeitos colinérgicos periféricos: coração, intestino, bexiga).
   - dose: início, dose usual, intervalo de subida, meia-vida, metabolismo e efeito do alimento
     (Maudsley, tabela 6.1); halfLife em horas para o treino.
   - guidance: o que recomenda o NICE (resumido no quadro 6.2 do Maudsley) por tipo e estágio de
     demência; na doença de Parkinson, conforme a diretriz do NICE para Parkinson, citada no mesmo quadro.
   - interactions: interações da tabela 6.2 e do texto do capítulo 6 do Maudsley, por remédio.
   - effects: classificação didática (0 a 3) a partir da tabela 6.1 e da metanálise em rede citada
     no Maudsley (rivastigmina oral com mais náusea e vômito; adesivo mais bem tolerado). */

window.PHARMA_SIM = window.PHARMA_SIM || {};
window.PHARMA_SIM.demencias = {
  id: "demencias",
  kind: "dementia",
  label: "Fármacos nas demências",
  tagline: "Anticolinesterásicos e memantina: onde agem, quando há indicação e como vigiar o coração.",
  source: "Mecanismos, doses, meias-vidas, interações e cuidado com o pulso conforme Maudsley Prescribing Guidelines (15ª ed., cap. 6, tabelas 6.1 e 6.2 e figura 6.1) e Stahl (Prescriber's Guide, 8ª ed.); indicações conforme o NICE, resumidas no Maudsley. Classificação de efeitos é didática.",
  defaults: { drug: "donepezila", a: "donepezila", b: "memantina" },
  receptors: [
    { id: "ACHE", label: "AChE", role: "Inibe a acetilcolinesterase: sobra mais acetilcolina na sinapse" },
    { id: "BUCHE", label: "BuChE", role: "Inibe também a butirilcolinesterase, a outra enzima que degrada a acetilcolina" },
    { id: "NIC", label: "Nicotínico", role: "Modulação alostérica positiva do receptor nicotínico: reforça o efeito da acetilcolina" },
    { id: "NMDA", label: "NMDA", role: "Antagonista não competitivo de baixa a moderada afinidade: entra no canal NMDA aberto em excesso" },
  ],
  indications: [
    { id: "lewy", label: "Lewy e Parkinson" },
    { id: "polypharmacy", label: "Poucas interações (polifarmácia)" },
    { id: "once", label: "Uma vez ao dia" },
  ],
  effects: [
    { id: "gi", label: "Náusea, vômito e diarreia", why: "acetilcolina em excesso no intestino; maior no início e a cada aumento de dose" },
    { id: "brady", label: "Bradicardia e síncope", why: "efeito vagal no coração; mais risco com betabloqueador, digoxina e na demência com corpos de Lewy" },
    { id: "appetite", label: "Perda de apetite e peso", why: "efeito colinérgico no trato digestivo" },
    { id: "dizzy", label: "Tontura", why: "colinérgico (anticolinesterásicos) ou ação no SNC (memantina)" },
    { id: "sleep", label: "Insônia e pesadelos", why: "mais acetilcolina à noite altera o sono" },
    { id: "drowsy", label: "Sonolência", why: "efeito no SNC, mais citado com memantina e galantamina" },
    { id: "skin", label: "Irritação da pele", why: "adesivo: trocar o local a cada dia e não repetir o mesmo ponto em 14 dias" },
  ],
  guidance: {
    types: [
      { id: "alzheimer", label: "Alzheimer" },
      { id: "lewy", label: "Corpos de Lewy" },
      { id: "parkinson", label: "Parkinson" },
      { id: "vascular", label: "Vascular" },
      { id: "ftd", label: "Frontotemporal" },
    ],
    stages: [
      { id: "leve", label: "Leve" },
      { id: "moderada", label: "Moderada" },
      { id: "grave", label: "Grave" },
    ],
    agents: [
      { id: "donepezila", label: "Donepezila" },
      { id: "rivastigmina", label: "Rivastigmina" },
      { id: "galantamina", label: "Galantamina" },
      { id: "memantina", label: "Memantina" },
    ],
    statuses: {
      offer: { label: "indicado", tone: "good" },
      consider: { label: "considerar", tone: "ok" },
      second: { label: "só como alternativa", tone: "warn" },
      no: { label: "não indicado", tone: "low" },
    },
    rules: {
      alzheimer: {
        leve: {
          donepezila: ["offer", "Primeira linha na doença de Alzheimer leve a moderada."],
          rivastigmina: ["offer", "Primeira linha na doença de Alzheimer leve a moderada."],
          galantamina: ["offer", "Primeira linha na doença de Alzheimer leve a moderada."],
          memantina: ["no", "Sem benefício demonstrado na doença de Alzheimer leve."],
        },
        moderada: {
          donepezila: ["offer", "Primeira linha; os três anticolinesterásicos têm eficácia parecida."],
          rivastigmina: ["offer", "Primeira linha; os três anticolinesterásicos têm eficácia parecida."],
          galantamina: ["offer", "Primeira linha; os três anticolinesterásicos têm eficácia parecida."],
          memantina: ["consider", "Sozinha se o anticolinesterásico não for tolerado ou for contraindicado; ou somada a ele."],
        },
        grave: {
          donepezila: ["offer", "Também recomendada na forma grave: não suspender só pela gravidade."],
          rivastigmina: ["offer", "Também recomendada na forma grave: não suspender só pela gravidade."],
          galantamina: ["offer", "Também recomendada na forma grave: não suspender só pela gravidade."],
          memantina: ["offer", "Indicada na forma grave, sozinha ou somada ao anticolinesterásico."],
        },
      },
      lewy: {
        leve: {
          donepezila: ["offer", "Primeira escolha na demência com corpos de Lewy leve a moderada."],
          rivastigmina: ["offer", "Primeira escolha na demência com corpos de Lewy leve a moderada."],
          galantamina: ["second", "Só se donepezila e rivastigmina não forem toleradas."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
        moderada: {
          donepezila: ["offer", "Primeira escolha na demência com corpos de Lewy leve a moderada."],
          rivastigmina: ["offer", "Primeira escolha na demência com corpos de Lewy leve a moderada."],
          galantamina: ["second", "Só se donepezila e rivastigmina não forem toleradas."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
        grave: {
          donepezila: ["consider", "Considerar na forma grave."],
          rivastigmina: ["consider", "Considerar na forma grave."],
          galantamina: ["second", "Só se donepezila e rivastigmina não forem toleradas."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
      },
      parkinson: {
        leve: {
          donepezila: ["offer", "Anticolinesterásico indicado na demência da doença de Parkinson leve a moderada."],
          rivastigmina: ["offer", "Tem licença para a demência da doença de Parkinson leve a moderada em alguns países."],
          galantamina: ["offer", "Anticolinesterásico indicado na demência da doença de Parkinson leve a moderada."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
        moderada: {
          donepezila: ["offer", "Anticolinesterásico indicado na demência da doença de Parkinson leve a moderada."],
          rivastigmina: ["offer", "Tem licença para a demência da doença de Parkinson leve a moderada em alguns países."],
          galantamina: ["offer", "Anticolinesterásico indicado na demência da doença de Parkinson leve a moderada."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
        grave: {
          donepezila: ["consider", "Considerar na forma grave."],
          rivastigmina: ["consider", "Considerar na forma grave."],
          galantamina: ["consider", "Considerar na forma grave."],
          memantina: ["second", "Se os anticolinesterásicos não forem tolerados ou forem contraindicados."],
        },
      },
      vascular: "Na demência vascular, só considerar se houver suspeita de Alzheimer, Parkinson ou corpos de Lewy associados.",
      ftd: "Na demência frontotemporal, anticolinesterásicos e memantina não são indicados.",
    },
  },
  interactions: [
    {
      id: "bradi", label: "Betabloqueador ou digoxina", full: "Betabloqueador, digoxina, amiodarona ou verapamil/diltiazem",
      by: {
        achei: { tone: "high", text: "Soma efeito na condução cardíaca: mais bradicardia, bloqueio atrioventricular e hipotensão. É a interação mais notificada com anticolinesterásicos." },
        memantina: { tone: "ok", text: "Interação pequena; há relatos isolados de bradicardia com memantina, então vale observar o pulso." },
      },
    },
    {
      id: "anticol", label: "Anticolinérgico", full: "Anticolinérgico (oxibutinina, prometazina, tricíclico)",
      by: {
        achei: { tone: "warn", text: "Antagonismo: o anticolinérgico anula parte do efeito e piora a cognição. Rever a carga anticolinérgica." },
        memantina: { tone: "warn", text: "O efeito dos anticolinérgicos pode aumentar com memantina." },
      },
    },
    {
      id: "cyp", label: "Inibidor de CYP2D6/3A4", full: "Inibidor de CYP2D6/3A4 (paroxetina, fluoxetina, cetoconazol)",
      by: {
        donepezila: { tone: "warn", text: "Donepezila é metabolizada por CYP3A4 e 2D6: o nível pode subir, com mais efeitos colinérgicos." },
        galantamina: { tone: "warn", text: "Galantamina é metabolizada por CYP3A4 e 2D6: o nível pode subir, com mais efeitos colinérgicos." },
        rivastigmina: { tone: "good", text: "Sem interação relevante: a rivastigmina é metabolizada pelas próprias colinesterases, não pelo fígado." },
        memantina: { tone: "good", text: "Sem interação relevante: a memantina é eliminada sobretudo pelos rins." },
      },
    },
    {
      id: "nmda", label: "Amantadina ou cetamina", full: "Amantadina, cetamina ou dextrometorfano",
      by: {
        achei: null,
        memantina: { tone: "high", text: "Evitar: também agem no NMDA, com risco de toxicidade no SNC." },
      },
    },
    {
      id: "renal", label: "Insuficiência renal",
      by: {
        donepezila: { tone: "good", text: "Sem ajuste específico pela função renal." },
        rivastigmina: { tone: "good", text: "Sem ajuste específico pela função renal; titular conforme a tolerância." },
        galantamina: { tone: "warn", text: "Usar com cautela; não é recomendada na insuficiência renal grave." },
        memantina: { tone: "high", text: "Eliminação renal: ajustar a dose conforme a função renal." },
      },
    },
    {
      id: "antipsic", label: "Antipsicótico",
      by: {
        achei: { tone: "warn", text: "Há relatos de sintomas extrapiramidais e síndrome neuroléptica maligna com a combinação. Na demência com corpos de Lewy, a sensibilidade aos antipsicóticos é ainda maior." },
        memantina: { tone: "ok", text: "O efeito dos antipsicóticos pode diminuir." },
      },
    },
  ],
  cases: [
    {
      prompt: "Doença de Alzheimer leve, sem tratamento. Qual a conduta farmacológica inicial?",
      options: ["Anticolinesterásico (donepezila, rivastigmina ou galantamina)", "Memantina", "Anticolinesterásico e memantina juntos", "Nenhum remédio tem indicação"],
      correct: 0,
      explain: "NICE: anticolinesterásicos na doença de Alzheimer leve a moderada. A memantina não mostrou benefício na forma leve.",
    },
    {
      prompt: "Doença de Alzheimer grave, em uso de donepezila bem tolerada. O que fazer?",
      options: ["Somar memantina", "Suspender a donepezila por causa da gravidade", "Trocar a donepezila por galantamina", "Trocar a donepezila por memantina"],
      correct: 0,
      explain: "Na forma grave, oferecer memantina somada ao anticolinesterásico. Não suspender o anticolinesterásico só pela gravidade.",
    },
    {
      prompt: "Demência com corpos de Lewy leve a moderada. Qual a primeira escolha?",
      options: ["Donepezila ou rivastigmina", "Galantamina", "Memantina", "Haloperidol"],
      correct: 0,
      explain: "NICE: donepezila ou rivastigmina. Galantamina só se essas não forem toleradas; memantina se os anticolinesterásicos não forem tolerados.",
    },
    {
      prompt: "Demência frontotemporal: qual a recomendação sobre anticolinesterásicos e memantina?",
      options: ["Não são indicados", "Donepezila na forma leve", "Memantina na forma grave", "Rivastigmina em adesivo"],
      correct: 0,
      explain: "NICE: não oferecer anticolinesterásicos nem memantina na demência frontotemporal.",
    },
    {
      prompt: "Antes de iniciar donepezila, pulso de 48 bpm, sem sintomas. Qual a conduta?",
      options: ["Não iniciar e investigar a causa", "Iniciar e checar o pulso em 1 semana", "Iniciar com metade da dose", "Iniciar normalmente"],
      correct: 0,
      explain: "Abaixo de 50 bpm (ou com sintomas como síncope): não iniciar ou suspender e investigar. Se a causa não for o remédio, ou após marcapasso, pode-se tentar de novo.",
    },
    {
      prompt: "Antes de iniciar um anticolinesterásico, pulso de 56 bpm, sem sintomas. Qual a conduta?",
      options: ["Iniciar e rever pulso e sintomas em 1 semana", "Não iniciar", "Pedir marcapasso antes", "Iniciar só memantina"],
      correct: 0,
      explain: "Entre 50 e 60 bpm sem sintomas: pode iniciar, rever em 1 semana e checar o pulso 1 semana depois de cada aumento de dose.",
    },
    {
      prompt: "Idoso com muita polifarmácia: qual anticolinesterásico tem menos interações?",
      options: ["Rivastigmina", "Donepezila", "Galantamina", "São todos iguais"],
      correct: 0,
      explain: "A rivastigmina é metabolizada no próprio local de ação, pelas colinesterases, sem passar pelos citocromos do fígado.",
    },
    {
      prompt: "Náusea com rivastigmina oral 6 mg duas vezes ao dia. Qual troca costuma ser mais bem tolerada?",
      options: ["Adesivo de rivastigmina 9,5 mg/24 h", "Adesivo de rivastigmina 4,6 mg/24 h", "Dobrar a dose oral", "Somar metoclopramida"],
      correct: 0,
      explain: "O adesivo tem menos efeitos gastrointestinais. Quem toma mais de 6 mg/dia por via oral pode passar direto para 9,5 mg/24 h. Metoclopramida com rivastigmina aumenta o risco extrapiramidal.",
    },
    {
      prompt: "Em uso de memantina, o que mais pede ajuste de dose?",
      options: ["Função renal", "Uso de ISRS", "Tabagismo", "Horário das refeições"],
      correct: 0,
      explain: "A memantina é eliminada sobretudo pelos rins: ajustar a dose na insuficiência renal.",
    },
  ],
  drugs: [
    {
      id: "donepezila", name: "Donepezila", group: "Anticolinesterásico seletivo", agent: "donepezila", search: ["donepezila", "donepezil"],
      receptors: { ACHE: 4, BUCHE: 0, NIC: 0, NMDA: 0 },
      regions: { cortex: 3, hippo: 3, glu: 0, body: 2 },
      halfLife: [70, 70],
      dose: { start: "5 mg 1x/dia", usual: "10 mg 1x/dia", step: "Subir 5 mg após 4 semanas", half: "~70 h", metab: "CYP3A4 e 2D6 (menor)", food: "Sem efeito" },
      indications: { lewy: 3, polypharmacy: 1, once: 3 },
      effects: { gi: 2, brady: 2, appetite: 1, dizzy: 1, sleep: 2, drowsy: 0, skin: 0 },
      extra: "Inibe de forma seletiva e reversível a acetilcolinesterase. Meia-vida longa permite uma dose ao dia. Nos estudos, foi o anticolinesterásico com menos abandonos por efeitos adversos.",
    },
    {
      id: "rivastigmina-oral", name: "Rivastigmina oral", group: "Anticolinesterásico · AChE e BuChE", agent: "rivastigmina", search: ["rivastigmina", "rivastigmine"],
      receptors: { ACHE: 4, BUCHE: 3, NIC: 0, NMDA: 0 },
      regions: { cortex: 3, hippo: 3, glu: 0, body: 3 },
      halfLife: [1, 1],
      dose: { start: "1,5 mg 2x/dia", usual: "3 a 6 mg 2x/dia", step: "Subir 1,5 mg 2x/dia a cada 2 semanas", half: "~1 h", metab: "Pelas colinesterases, quase sem CYP", food: "Atrasa e reduz a absorção" },
      indications: { lewy: 3, polypharmacy: 3, once: 0 },
      effects: { gi: 3, brady: 2, appetite: 3, dizzy: 3, sleep: 1, drowsy: 1, skin: 0 },
      extra: "Inibe a acetilcolinesterase e a butirilcolinesterase. Meia-vida curta: duas tomadas ao dia, com as refeições. É a forma com mais náusea, vômito e perda de apetite.",
    },
    {
      id: "rivastigmina-adesivo", name: "Rivastigmina adesivo", group: "Anticolinesterásico · AChE e BuChE", agent: "rivastigmina", search: ["rivastigmina", "rivastigmine"],
      receptors: { ACHE: 4, BUCHE: 3, NIC: 0, NMDA: 0 },
      regions: { cortex: 3, hippo: 3, glu: 0, body: 1 },
      halfLife: [3.4, 3.4],
      dose: { start: "4,6 mg/24 h", usual: "9,5 mg/24 h", step: "Subir para 9,5 após 4 semanas; 13,3 mg/24 h após 6 meses, se houver piora", half: "~3,4 h", metab: "Pelas colinesterases, quase sem CYP", food: "Não se aplica" },
      indications: { lewy: 3, polypharmacy: 3, once: 3 },
      effects: { gi: 1, brady: 2, appetite: 1, dizzy: 2, sleep: 1, drowsy: 1, skin: 2 },
      extra: "Libera o remédio aos poucos: tão eficaz quanto as doses altas de cápsula, com menos efeitos gastrointestinais. Tirar o adesivo do dia anterior, usar um só por vez, não cortar e não repetir o mesmo local em 14 dias (erros de aplicação já causaram superdose fatal).",
    },
    {
      id: "galantamina", name: "Galantamina", group: "Anticolinesterásico · modulador nicotínico", agent: "galantamina", search: ["galantamina", "galantamine"],
      receptors: { ACHE: 3, BUCHE: 0, NIC: 2, NMDA: 0 },
      regions: { cortex: 3, hippo: 3, glu: 0, body: 2 },
      halfLife: [7, 10],
      dose: { start: "8 mg LP 1x/dia", usual: "16 a 24 mg LP 1x/dia", step: "Subir 8 mg após 4 semanas", half: "7–10 h", metab: "CYP3A4 e 2D6", food: "Atrasa, mas não reduz a absorção" },
      indications: { lewy: 1, polypharmacy: 1, once: 2 },
      effects: { gi: 2, brady: 2, appetite: 2, dizzy: 2, sleep: 1, drowsy: 1, skin: 0 },
      extra: "Inibe a acetilcolinesterase de forma competitiva e reversível e modula o receptor nicotínico, reforçando o efeito da acetilcolina. Não inibe a butirilcolinesterase. Alerta da FDA por mais mortes em estudos no comprometimento cognitivo leve.",
    },
    {
      id: "memantina", name: "Memantina", group: "Antagonista NMDA", agent: "memantina", search: ["memantina", "memantine"],
      receptors: { ACHE: 0, BUCHE: 0, NIC: 0, NMDA: 3 },
      regions: { cortex: 0, hippo: 0, glu: 3, body: 0 },
      halfLife: [60, 100],
      dose: { start: "5 mg 1x/dia", usual: "20 mg/dia (ou 10 mg 2x/dia)", step: "Subir 5 mg por semana", half: "60–100 h", metab: "Pouco pelo fígado; eliminação renal", food: "Sem efeito" },
      indications: { lewy: 1, polypharmacy: 2, once: 3 },
      effects: { gi: 0, brady: 1, appetite: 0, dizzy: 2, sleep: 0, drowsy: 2, skin: 0 },
      extra: "Entra no canal NMDA quando ele fica aberto demais (glutamato em excesso) e sai quando o sinal é normal. Também antagoniza o 5-HT3. Bem tolerada: tontura, cefaleia, constipação e sonolência são os efeitos mais citados. Cuidado na epilepsia e na doença renal.",
    },
  ],
};
