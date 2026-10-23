/* Assunto de cada cartão dos decks de psicogeriatria, para a revisão por tema.
   Esses decks foram montados por módulo (ex.: "Humor e Ansiedade no Idoso") e misturam assuntos:
   ansiedade, escolha de antidepressivo, pseudodemência, BPSD, critérios de Beers... Aqui cada
   cartão recebe o subtema (o mesmo nome usado nas questões) pelo conteúdo da pergunta e da
   resposta, na ordem abaixo; o primeiro que bater vale. O que não cai em nenhum fica em
   "Psicogeriatria e saúde do idoso" (envelhecimento, Beers, prescrição no idoso). */
(function assignPsychogeriatricSubthemes() {
  const decks = window.BANCO_RMAIS_FLASHCARDS?.decks || [];
  const rules = [
    ["Delirium e alterações da consciência", /delirium|confus[aã]o mental aguda|\bCAM\b/i],
    ["Esquizofrenia e psicoses", /catatoni|flexibilidade c[eé]rea/i],
    ["Demências e rastreio cognitivo", /dem[eê]ncia|alzheimer|lewy|frontotemporal|\bBPSD\b|sintomas (comportamentais|neuropsiqui)|cuidador|colinester[aá]s|memantina|donepezila|rivastigmina|galantamina|cognit|\bMEEM\b|\bMoCA\b|mem[oó]ria|esquecimento|pseudodem[eê]ncia|funcionalidade|fun[çc][õo]es executivas|atividades (instrumentais|b[aá]sicas)|rel[oó]gio|flu[eê]ncia verbal/i],
    ["Psicogeriatria e saúde do idoso", /metilfenidato|modafinil/i],
    ["Antidepressivos", /antidepressiv|\bISRS\b|\bIRSN\b|\bSNRI\b|tric[ií]clic|bupropiona|mirtazapina|citalopram|escitalopram|sertralina|fluoxetina|paroxetina|venlafaxina|duloxetina|vortioxetina|trazodona|agomelatina/i],
    ["Antipsicóticos", /antipsic[oó]tic|haloperidol|quetiapina|risperidona|olanzapina|aripiprazol|clozapina/i],
    ["Benzodiazepínicos e sedativos", /benzodiazep|\bBZD\b|zolpidem|hipn[oó]tic/i],
    ["Estabilizadores do humor", /l[ií]tio|valproato|carbamazepina|lamotrigina|estabilizador/i],
    ["Transtorno bipolar e mania", /mania|man[ií]ac|bipolar/i],
    ["Ansiedade, TOC e trauma", /ansiedade|ansios|p[aâ]nico|preocupa[çc][aã]o (constante|excessiva)|fobia|\bTAG\b|somatiza|sintomas f[ií]sicos sem/i],
    ["Depressão e suicídio", /depress|suic[ií]d|luto|eletroconvuls|\bECT\b/i],
    ["Sono", /\bsono\b|ins[oô]nia/i],
  ];
  for (const deck of decks) {
    if (deck.area !== "Psicogeriatria") continue;
    for (const card of deck.cards || []) {
      if (card.subtheme) continue;
      const text = `${card.front || ""} ${card.back || ""}`;
      card.subtheme = (rules.find(([, pattern]) => pattern.test(text)) || ["Psicogeriatria e saúde do idoso"])[0];
    }
  }
})();
