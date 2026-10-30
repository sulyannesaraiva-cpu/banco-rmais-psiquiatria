/* Paciente simulado: modo "Por sintoma-alvo", para alterações de comportamento sem diagnóstico
   psiquiátrico fechado (pós-TCE e demências). Parte do contexto e do sintoma, e mistura classes.
   Níveis: best = opção com mais apoio na fonte; option = outra opção possível; avoid = evitar ou
   pouco eficaz. sim = remédio do simulador ("classe:id"); sem sim = fora do simulador.
   Fontes (resumidas com nossas palavras):
   - yudo: Yudofsky e Hales, Neuropsiquiatria e Neurociências na Prática Clínica, cap. 18 (lesão cerebral traumática).
   - m15: Maudsley Prescribing Guidelines (15ª ed.), cap. 6 (demências; sintomas comportamentais e psicológicos). */

(function () {
  const YUDO = "Yudofsky e Hales, cap. 18 (lesão cerebral traumática)";
  const M15 = "Maudsley 15ª ed., cap. 6 (sintomas comportamentais da demência)";
  const M15DEM = "Maudsley 15ª ed., cap. 6 (tipos de demência)";

  /* Sintomas comportamentais da demência (vale para Alzheimer e vascular ou mista). */
  const BPSD = {
    agitacao: [
      { sim: "antipsicoticos:risperidona", name: "Risperidona", level: "best", text: "Única com licença (no Reino Unido) para agressividade persistente na doença de Alzheimer, por até 6 semanas, quando há risco de dano e o manejo não farmacológico falhou. Dose ideal em torno de 0,5 mg 2x/dia. Efeito modesto: reavaliar sempre.", src: M15 },
      { sim: "antidepressivos:citalopram", name: "Citalopram", level: "best", text: "O antidepressivo com mais evidência para agitação (estudo CitAD, com 30 mg), mas alarga o QT: no idoso, máximo de 20 mg/dia.", src: M15 },
      { sim: "antipsicoticos:brexpiprazol", name: "Brexpiprazol", level: "option", text: "Único aprovado pela FDA para agitação na demência de Alzheimer (2 a 3 mg/dia em ensaio de 12 semanas). Mesmo alerta de mortalidade da classe.", src: M15 },
      { sim: "antipsicoticos:olanzapina", name: "Olanzapina", level: "option", text: "Alternativa se a risperidona não for tolerada; algum dado de redução da agressividade. Menos parkinsonismo.", src: M15 },
      { sim: "antipsicoticos:aripiprazol", name: "Aripiprazol", level: "option", text: "Alternativa com eficácia modesta nos sintomas comportamentais; menos parkinsonismo.", src: M15 },
      { sim: "antidepressivos:escitalopram", name: "Escitalopram", level: "option", text: "Menos evidência que o citalopram, mas pode ajudar.", src: M15 },
      { sim: "demencias:memantina", name: "Memantina", level: "option", text: "Pode melhorar agitação, agressividade e delírios; vale considerar se ainda não usa.", src: M15 },
      { sim: "estabilizadores:carbamazepina", name: "Carbamazepina", level: "option", text: "Entre os estabilizadores, a evidência mais robusta, mas efeitos graves (Stevens-Johnson, ataxia, hiponatremia) e muitas interações limitam o uso.", src: M15 },
      { name: "Gabapentina", level: "option", text: "Evidência fraca (séries de casos), útil quando antipsicóticos são inadequados (ex.: doença cardíaca). Cuidado na demência com corpos de Lewy.", src: M15 },
      { name: "Prazosina", level: "option", text: "Um ensaio controlado de boa qualidade em agitação e agressividade: dados ainda limitados para uso de rotina.", src: M15 },
      { sim: "antipsicoticos:quetiapina", name: "Quetiapina", level: "avoid", text: "Muito usada, mas sem eficácia comprovada, exceto em doses (100 a 200 mg) que costumam ser mal toleradas.", src: M15 },
      { sim: "antipsicoticos:haloperidol", name: "Haloperidol", level: "avoid", text: "Associado a mais mortalidade que os outros antipsicóticos na demência; não recomendado (exceto no delirium).", src: M15 },
      { sim: "estabilizadores:valproato", name: "Valproato", level: "avoid", text: "Ineficaz para agitação na demência (Cochrane) e com mais efeitos adversos: melhor evitar.", src: M15 },
      { sim: "antidepressivos:mirtazapina", name: "Mirtazapina", level: "avoid", text: "Sem benefício para agitação em ensaio controlado (até 45 mg) e possível maior mortalidade.", src: M15 },
      { sim: "antidepressivos:trazodona", name: "Trazodona", level: "avoid", text: "Evidência insuficiente para agitação (útil para o sono; ver insônia).", src: M15 },
      { sim: "ansioliticos:lorazepam", name: "Benzodiazepínicos", level: "avoid", text: "Aceleram o declínio cognitivo, aumentam quedas, fraturas, pneumonia e mortalidade: só dose única em sedação de emergência.", src: M15 },
    ],
    psicose: [
      { sim: "antipsicoticos:risperidona", name: "Risperidona", level: "best", text: "Reduz sintomas psicóticos na doença de Alzheimer; usar só com sofrimento intenso ou risco, em dose baixa e por pouco tempo.", src: M15 },
      { name: "Pimavanserina", level: "option", text: "Ensaio em psicose da doença de Alzheimer mostrou melhora e menos recaída; aprovada nos EUA na psicose do Parkinson.", src: M15 },
      { sim: "antipsicoticos:haloperidol", name: "Haloperidol", level: "avoid", text: "Mais mortalidade na demência que os atípicos.", src: M15 },
    ],
    depressao: [
      { sim: "antidepressivos:sertralina", name: "Sertralina", level: "best", text: "Eficácia com evidência mista na demência, mas segurança cardíaca muito favorável. Antidepressivo se justifica na depressão moderada a grave, sobretudo se as medidas não farmacológicas falharam.", src: M15 },
      { sim: "antidepressivos:citalopram", name: "Citalopram", level: "option", text: "Útil, mas limite de 20 mg/dia no idoso pelo QT.", src: M15 },
      { sim: "demencias:donepezila", name: "Anticolinesterásicos", level: "option", text: "Ajudam mais em depressão, disforia, apatia e ansiedade do que em agitação; vale considerar se ainda não usa.", src: M15 },
      { sim: "antidepressivos:vortioxetina", name: "Vortioxetina", level: "option", text: "Dados mistos: estudo aberto favorável, ensaio controlado sem diferença do placebo.", src: M15 },
      { sim: "antidepressivos:amitriptilina", name: "Tricíclicos", level: "avoid", text: "Melhor evitar na demência: quedas por hipotensão e piora cognitiva pelo efeito anticolinérgico.", src: M15 },
    ],
    apatia: [
      { sim: "estimulantes:metilfenidato-li", name: "Metilfenidato", level: "best", text: "Em ensaio controlado, eficaz para apatia na doença de Alzheimer em quem não estava ansioso nem agitado.", src: M15 },
      { sim: "demencias:donepezila", name: "Anticolinesterásicos", level: "option", text: "Efeito em apatia, depressão e ansiedade melhor que em agitação.", src: M15 },
    ],
    insonia: [
      { sim: "antidepressivos:trazodona", name: "Trazodona", level: "best", text: "50 mg à noite melhorou o sono e foi bem tolerada (Cochrane). Antes, medidas de higiene do sono.", src: M15 },
      { sim: "ansioliticos:melatonina", name: "Melatonina", level: "option", text: "Evidência limitada, mas segura; pode ser mantida quando há benefício (2 mg de liberação prolongada, às vezes até 10 mg).", src: M15 },
      { sim: "ansioliticos:suvorexanto", name: "Antagonistas da orexina", level: "option", text: "Surgem como opção para o início do sono na doença de Alzheimer (suvorexanto, daridorexanto).", src: M15 },
      { sim: "ansioliticos:zolpidem", name: "Hipnóticos Z", level: "option", text: "Usados na doença de Alzheimer de início tardio, sem ensaios que pesem riscos e benefícios.", src: M15 },
      { sim: "antidepressivos:mirtazapina", name: "Mirtazapina", level: "avoid", text: "Sem efeito no sono na doença de Alzheimer em estudo piloto, e piorou o sono diurno.", src: M15 },
      { name: "Prometazina", level: "avoid", text: "Muito anticolinérgica: pode piorar bastante a cognição.", src: M15 },
    ],
  };

  window.PHARMA_SYMPTOMS = {
    targets: [
      { id: "agitacaoAguda", label: "Agitação ou agressividade aguda" },
      { id: "agitacao", label: "Agitação ou agressividade persistente" },
      { id: "labilidade", label: "Labilidade, choro ou riso patológico" },
      { id: "apatia", label: "Apatia, baixa iniciativa ou alerta" },
      { id: "depressao", label: "Depressão" },
      { id: "mania", label: "Mania" },
      { id: "psicose", label: "Psicose ou alucinações" },
      { id: "insonia", label: "Insônia" },
    ],
    contexts: [
      {
        id: "tce", label: "Pós-TCE (lesão cerebral traumática)", src: YUDO,
        first: [
          "Definir com clareza o sintoma e rever o que já foi tentado: muitas vezes a dose ou o tempo foram insuficientes, ou outra abordagem não foi bem aplicada.",
          "Afastar causas médicas e efeitos de remédios em uso; medir o comportamento ao longo do tempo (ex.: escala de agressividade).",
          "Um remédio de cada vez, para saber o que ajudou e o que fez mal; reavaliar com frequência, pois o quadro muda na recuperação.",
        ],
        cautions: [
          "Mais sensibilidade a efeitos colaterais: começar abaixo da dose habitual e subir devagar, mas dar tempo e dose suficientes (às vezes a dose plena do adulto).",
          "Evitar remédios anticolinérgicos (amitriptilina, doxepina e outros): pioram atenção, concentração e memória.",
          "Haloperidol retardou a recuperação em modelos animais; acatisia costuma ser confundida com piora da agitação.",
          "Benzodiazepínicos podem causar amnésia e piorar coordenação e equilíbrio.",
          "Mais risco de convulsão: cuidado com bupropiona e clozapina.",
        ],
        targets: {
          agitacaoAguda: [
            { sim: "antipsicoticos:risperidona", name: "Risperidona", level: "best", text: "0,5 mg por via oral, repetida a cada hora até controlar; depois de 48 h sem agressividade, reduzir cerca de 25% ao dia.", src: YUDO },
            { sim: "ansioliticos:lorazepam", name: "Lorazepam", level: "best", text: "1 a 2 mg por via oral ou IM a cada hora até sedação; pode ser combinado a haloperidol 2 a 5 mg se necessário. Reduzir após 48 h sob controle.", src: YUDO },
            { sim: "antipsicoticos:haloperidol", name: "Haloperidol", level: "option", text: "Só em associação, na crise; evitar uso continuado (acatisia, possível prejuízo à recuperação).", src: YUDO },
          ],
          agitacao: [
            { name: "Propranolol", level: "best", text: "Betabloqueador com a maior base de evidência para agressividade de origem orgânica. Excluir asma, DPOC, diabetes insulinodependente, insuficiência cardíaca, angina, doença vascular periférica e hipertireoidismo. Começar 20 mg 3x/dia (ou dose-teste de 20 mg/dia), subir 60 mg/dia a cada 3 dias até controle; não subir se pulso abaixo de 50 ou PA sistólica abaixo de 90. Esperar 8 semanas na dose máxima.", src: YUDO },
            { sim: "estabilizadores:carbamazepina", name: "Carbamazepina", level: "best", text: "Escolha quando há convulsões ou foco epiléptico junto; eficaz com ou sem alteração no EEG.", src: YUDO },
            { sim: "antidepressivos:sertralina", name: "Sertralina", level: "option", text: "Melhorou irritabilidade e agressividade pós-TCE (série de 13 pacientes).", src: YUDO },
            { sim: "antidepressivos:fluoxetina", name: "Fluoxetina", level: "option", text: "Serotoninérgico com relatos de controle da agressividade após lesão cerebral.", src: YUDO },
            { sim: "antidepressivos:trazodona", name: "Trazodona", level: "option", text: "Eficaz na agressividade dos transtornos mentais orgânicos.", src: YUDO },
            { sim: "ansioliticos:buspirona", name: "Buspirona", level: "option", text: "5 mg 2x/dia, subindo 5 mg a cada 3 a 5 dias; pode precisar de 45 a 60 mg/dia. Raramente piora a agressividade.", src: YUDO },
            { sim: "estabilizadores:valproato", name: "Valproato", level: "option", text: "Útil em alguns pacientes; se já há anticonvulsivante para epilepsia, trocar por carbamazepina ou valproato trata as duas coisas.", src: YUDO },
            { sim: "ansioliticos:clonazepam", name: "Clonazepam", level: "option", text: "Quando agressividade e ansiedade andam juntas, ou com tiques: 0,5 mg 2x/dia até 2 a 4 mg 2x/dia. Sedação e ataxia são comuns.", src: YUDO },
            { sim: "estabilizadores:litio", name: "Lítio", level: "avoid", text: "Mais neurotoxicidade na lesão cerebral: reservar para agressividade ligada a mania ou a transtorno cíclico do humor.", src: YUDO },
            { sim: "antipsicoticos:haloperidol", name: "Antipsicóticos para agressividade crônica", level: "avoid", text: "Costumam só sedar, com tolerância, extrapiramidais e acatisia; usar apenas se a agressividade vier de psicose.", src: YUDO },
          ],
          labilidade: [
            { sim: "antidepressivos:fluoxetina", name: "Fluoxetina", level: "best", text: "Ensaio controlado no choro patológico pós-AVC; todos os ISRS podem funcionar, às vezes em dias e em dose baixa.", src: YUDO },
            { sim: "antidepressivos:sertralina", name: "Outros ISRS", level: "option", text: "Mesma lógica da fluoxetina; dose semelhante à da depressão.", src: YUDO },
            { sim: "antidepressivos:nortriptilina", name: "Nortriptilina", level: "option", text: "Também eficaz na labilidade emocional.", src: YUDO },
            { sim: "antidepressivos:amitriptilina", name: "Amitriptilina", level: "avoid", text: "Funcionou no riso e choro patológicos da esclerose múltipla, mas é muito anticolinérgica para quem teve lesão cerebral.", src: YUDO },
          ],
          apatia: [
            { sim: "estimulantes:metilfenidato-li", name: "Metilfenidato", level: "best", text: "Melhora atenção, alerta e fadiga; começar 5 mg 2x/dia, máximo em torno de 60 mg/dia. Não aumentou convulsões em série com lesão grave. Suspender devagar.", src: YUDO },
            { name: "Amantadina", level: "best", text: "Para anergia, abulia e baixa motivação: 50 mg 2x/dia, subir 100 mg/dia por semana até 400 mg/dia. Pode causar confusão, alucinações e hipotensão, sobretudo em idosos.", src: YUDO },
            { sim: "demencias:donepezila", name: "Donepezila", level: "option", text: "Relatos de melhora de memória, atenção e funcionamento global (5 a 10 mg/dia).", src: YUDO },
            { name: "Bromocriptina", level: "option", text: "Para problemas de iniciativa pelo menos um ano após a lesão, mutismo acinético e afasia não fluente.", src: YUDO },
            { name: "Modafinila", level: "option", text: "Para fadiga diurna (100 mg pela manhã, até 400 mg + 200 mg).", src: YUDO },
          ],
          depressao: [
            { sim: "antidepressivos:sertralina", name: "Sertralina", level: "best", text: "ISRS são primeira linha (menos sedação, hipotensão e efeito anticolinérgico). Começar com 25 mg; em estudo, dois terços remitiram e houve ganho cognitivo.", src: YUDO },
            { sim: "antidepressivos:citalopram", name: "Citalopram", level: "best", text: "Começar com 10 mg.", src: YUDO },
            { sim: "antidepressivos:fluoxetina", name: "Fluoxetina", level: "option", text: "Começar com 10 mg. ISRS podem causar apatia ou dificuldade de achar palavras, revertida com dopaminérgico ou estimulante.", src: YUDO },
            { sim: "antidepressivos:venlafaxina", name: "Venlafaxina", level: "option", text: "Também parece eficaz.", src: YUDO },
            { sim: "antidepressivos:bupropiona", name: "Bupropiona", level: "avoid", text: "Associada a mais convulsões em quem teve lesão cerebral.", src: YUDO },
            { sim: "antidepressivos:amitriptilina", name: "Tricíclicos muito anticolinérgicos", level: "avoid", text: "Amitriptilina e doxepina pioram atenção e memória; usar só sem alternativa.", src: YUDO },
          ],
          mania: [
            { sim: "estabilizadores:valproato", name: "Valproato", level: "best", text: "250 mg 2x/dia, subir até nível de 50 a 100.", src: YUDO },
            { sim: "estabilizadores:carbamazepina", name: "Carbamazepina", level: "best", text: "200 mg 2x/dia, ajustando ao nível de 8 a 12; atenção à medula e ao fígado.", src: YUDO },
            { sim: "estabilizadores:lamotrigina", name: "Lamotrigina", level: "option", text: "Opção com pouca evidência nessa população.", src: YUDO },
            { sim: "estabilizadores:litio", name: "Lítio", level: "avoid", text: "Pode piorar a confusão e baixar o limiar convulsivo: reservar a quem já tinha transtorno do humor antes da lesão, com dose e nível baixos (0,2 a 0,5).", src: YUDO },
          ],
          psicose: [
            { sim: "antipsicoticos:risperidona", name: "Risperidona", level: "best", text: "Atípicos são preferíveis ao haloperidol (menos extrapiramidais); dose baixa e uso comedido na fase aguda. Efeito pode levar 3 semanas.", src: YUDO },
            { sim: "antipsicoticos:quetiapina", name: "Quetiapina", level: "option", text: "Atípico com menos extrapiramidais.", src: YUDO },
            { sim: "antipsicoticos:olanzapina", name: "Olanzapina", level: "option", text: "Atípico preferível ao haloperidol; mais sedação.", src: YUDO },
            { sim: "antipsicoticos:haloperidol", name: "Haloperidol", level: "avoid", text: "Lesão cerebral aumenta a sensibilidade a distonia, acatisia e parkinsonismo; possível prejuízo à recuperação.", src: YUDO },
            { sim: "antipsicoticos:clozapina", name: "Clozapina", level: "avoid", text: "Convulsões dependentes da dose: só com extrema cautela e indicação bem pensada.", src: YUDO },
          ],
          insonia: [
            { sim: "antidepressivos:trazodona", name: "Trazodona", level: "best", text: "Sedativa sem efeito anticolinérgico: 50 mg, até 150 mg. Junto, evitar cochilos, manter horários e fazer atividade física.", src: YUDO },
            { sim: "ansioliticos:diazepam", name: "Benzodiazepínicos de ação longa", level: "avoid", text: "Alteram o sono REM e o sono profundo e podem manter a insônia. Evitar também antigripais e indutores do sono vendidos sem receita (anticolinérgicos).", src: YUDO },
          ],
        },
      },
      {
        id: "alzheimer", label: "Doença de Alzheimer", src: M15,
        first: [
          "Primeira linha: medidas não farmacológicas personalizadas, com os cuidadores (entender o comportamento como expressão de necessidade não atendida).",
          "Procurar e tratar dor (um teste com paracetamol pode valer mesmo sem dor evidente), infecção, constipação e efeitos de remédios.",
          "Corrigir déficits sensoriais: óculos limpos, pilha do aparelho auditivo. Musicoterapia é a intervenção sensorial com melhor evidência.",
        ],
        cautions: [
          "Antipsicóticos aumentam mortalidade e risco de AVC na demência: só para psicose ou agressividade com sofrimento intenso ou risco, após conversar com o cuidador e registrar.",
          "Rever o antipsicótico em 4 a 6 semanas, depois a cada 3 a 6 meses, considerando suspender a cada revisão.",
          "Avaliar carga anticolinérgica, risco de quedas e de AVC antes de prescrever.",
        ],
        targets: BPSD,
      },
      {
        id: "vascular", label: "Demência vascular ou mista", src: M15,
        first: [
          "Mesmas medidas iniciais da doença de Alzheimer: abordagem não farmacológica, dor, infecção, constipação, remédios e déficits sensoriais.",
          "Controlar os fatores de risco cerebrovascular.",
        ],
        cautions: [
          "Mesmo alerta de mortalidade e AVC com antipsicóticos.",
          "Anticolinesterásicos e memantina só se houver suspeita de Alzheimer, Parkinson ou corpos de Lewy associados.",
        ],
        targets: BPSD,
      },
      {
        id: "lewy", label: "Corpos de Lewy ou demência do Parkinson", src: M15DEM,
        first: [
          "Mesmas medidas iniciais: abordagem não farmacológica, dor, infecção, constipação e efeitos de remédios.",
          "Sintomas flutuam, e um tratamento pode melhorar um sintoma e piorar outro.",
        ],
        cautions: [
          "Sensibilidade a neurolépticos é característica dos corpos de Lewy: evitar os de bloqueio D2 forte e preferir, se inevitável, os de menor parkinsonismo em dose muito baixa.",
          "Gabapentina: há relato de piora dramática dos sintomas neuropsiquiátricos.",
        ],
        targets: {
          psicose: [
            { sim: "demencias:rivastigmina-oral", name: "Rivastigmina", level: "best", text: "Anticolinesterásico recomendado (com donepezila) nos corpos de Lewy e na demência do Parkinson; ajuda também nos sintomas neuropsiquiátricos.", src: M15DEM },
            { sim: "demencias:donepezila", name: "Donepezila", level: "best", text: "Recomendada nos corpos de Lewy leve a grave.", src: M15DEM },
            { sim: "antipsicoticos:quetiapina", name: "Quetiapina", level: "option", text: "Usada em doses muito baixas pelo pouco parkinsonismo, apesar da eficácia limitada.", src: M15 },
            { sim: "antipsicoticos:clozapina", name: "Clozapina", level: "option", text: "Em dose baixa, alternativa quando a quetiapina não basta.", src: M15 },
            { name: "Pimavanserina", level: "option", text: "Aprovada nos EUA para alucinações e delírios da doença de Parkinson.", src: M15 },
            { sim: "antipsicoticos:haloperidol", name: "Haloperidol e outros de bloqueio D2 forte", level: "avoid", text: "Sensibilidade a neurolépticos é característica dos corpos de Lewy.", src: M15DEM },
            { sim: "antipsicoticos:risperidona", name: "Risperidona", level: "avoid", text: "Não está entre os considerados nesse contexto (sensibilidade a neurolépticos); a fonte cita quetiapina ou clozapina em dose baixa.", src: M15 },
          ],
          agitacao: [
            { sim: "demencias:rivastigmina-oral", name: "Anticolinesterásicos", level: "best", text: "Primeira opção farmacológica nos corpos de Lewy, também para sintomas neuropsiquiátricos.", src: M15DEM },
            { sim: "demencias:memantina", name: "Memantina", level: "option", text: "Se os anticolinesterásicos não forem tolerados.", src: M15DEM },
            { sim: "antipsicoticos:quetiapina", name: "Quetiapina", level: "option", text: "Em dose muito baixa, se inevitável.", src: M15 },
            { name: "Gabapentina", level: "avoid", text: "Relato de piora dramática dos sintomas neuropsiquiátricos nos corpos de Lewy.", src: M15 },
            { sim: "antipsicoticos:haloperidol", name: "Haloperidol", level: "avoid", text: "Sensibilidade grave a neurolépticos.", src: M15DEM },
          ],
          insonia: BPSD.insonia,
          depressao: BPSD.depressao,
        },
      },
      {
        id: "ftd", label: "Demência frontotemporal", src: M15DEM,
        first: [
          "Mesmas medidas iniciais: abordagem não farmacológica com cuidadores, dor, infecção, constipação e remédios.",
          "Desinibição e comportamento inadequado são frequentes: ambiente, rotina e orientação da família vêm antes do remédio.",
        ],
        cautions: [
          "Anticolinesterásicos e memantina não funcionam na frontotemporal e podem causar agitação: não usar.",
          "Os remédios ajudam no comportamento, mas nenhum melhora a cognição.",
        ],
        targets: {
          agitacao: [
            { sim: "antidepressivos:trazodona", name: "Trazodona", level: "best", text: "150 a 300 mg/dia reduziu os sintomas comportamentais na demência frontotemporal.", src: M15 },
            { sim: "antidepressivos:sertralina", name: "ISRS", level: "best", text: "Podem reduzir sintomas comportamentais (sem efeito na cognição).", src: M15DEM },
            { sim: "demencias:donepezila", name: "Anticolinesterásicos", level: "avoid", text: "Ineficazes e podem causar agitação.", src: M15DEM },
            { sim: "demencias:memantina", name: "Memantina", level: "avoid", text: "Não recomendada na demência frontotemporal.", src: M15DEM },
          ],
          insonia: BPSD.insonia,
          depressao: [
            { sim: "antidepressivos:sertralina", name: "ISRS", level: "best", text: "Ajudam no comportamento e no humor.", src: M15DEM },
            { sim: "antidepressivos:amitriptilina", name: "Tricíclicos", level: "avoid", text: "Quedas e piora cognitiva pelo efeito anticolinérgico.", src: M15 },
          ],
        },
      },
    ],
  };
})();

(function addSymptomRefs() {
  const refs = (window.PHARMA_REFS || {}).paciente;
  if (!refs) return;
  refs.paths.push(
    { about: "Por sintoma-alvo, pós-TCE: princípios, depressão, mania, labilidade, apatia e alerta, psicose, sono, agressividade aguda e crônica (propranolol, carbamazepina, buspirona, ISRS)", src: "yudofsky", where: "cap. 18, Tratamento psicofarmacológico e tabela 18-12", kind: "fonte" },
    { about: "Por sintoma-alvo, demências: medidas não farmacológicas, dor, antipsicóticos e mortalidade, citalopram, brexpiprazol, valproato, mirtazapina, sono, apatia", src: "maudsley15", where: "cap. 6, Management of BPSD", kind: "fonte" },
    { about: "Corpos de Lewy, Parkinson, frontotemporal e vascular: anticolinesterásicos, sensibilidade a neurolépticos, ISRS e trazodona", src: "maudsley15", where: "cap. 6, Dementia with Lewy bodies, Other dementias e quadro de recomendações", kind: "fonte" },
    { about: "Separação em mais apoio, outras opções e evitar", src: "curadoria", where: "classificação nossa a partir do texto das fontes", kind: "didatico" }
  );
})();
