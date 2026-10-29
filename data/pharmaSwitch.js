/* Troca de antidepressivos: Maudsley Prescribing Guidelines 15ª ed., cap. 3, "Switching
   antidepressants" e tabela 3.7 ("Antidepressants – swapping and stopping"), com as notas a–k.
   A tabela é em parte teórica (o próprio Maudsley avisa); cautela e monitorização em toda troca.
   Grupos da tabela: ago, bup, clo, flx, fvx, mao, moc, mir, tra, ssri (citalopram, escitalopram,
   paroxetina, sertralina e vortioxetina), snri (duloxetina, venlafaxina, desvenlafaxina), tca
   (tricíclicos exceto clomipramina).
   Tipos: cross (redução cruzada), direct (troca direta), taper (reduzir, parar, esperar "wait"
   dias e começar), stop (parar sem reduzir — só fluoxetina —, esperar e começar), halve
   (reduzir à metade, somar o novo e retirar devagar). low: começar o novo em dose baixa. */

window.PHARMA_SWITCH = {
  groupOf: {
    agomelatina: "ago", bupropiona: "bup", clomipramina: "clo", fluoxetina: "flx", fluvoxamina: "fvx",
    tranilcipromina: "mao", moclobemida: "moc", mirtazapina: "mir", trazodona: "tra",
    sertralina: "ssri", paroxetina: "ssri", citalopram: "ssri", escitalopram: "ssri", vortioxetina: "ssri",
    venlafaxina: "snri", desvenlafaxina: "snri", duloxetina: "snri",
    amitriptilina: "tca", nortriptilina: "tca", imipramina: "tca",
  },
  groupNames: {
    ago: "agomelatina", bup: "bupropiona", clo: "clomipramina", flx: "fluoxetina", fvx: "fluvoxamina",
    mao: "IMAO", moc: "moclobemida", mir: "mirtazapina", tra: "trazodona", ssri: "ISRS", snri: "IRSN", tca: "tricíclico",
  },
  /* matrix[de][para] */
  matrix: {
    ago: { bup: "cross", clo: "cross", flx: "cross", fvx: { type: "taper", wait: 0, noTaper: true, text: "Parar a agomelatina e iniciar a fluvoxamina." }, mao: "cross", moc: "cross", mir: "cross", tra: "cross", ssri: "cross", snri: "cross", tca: "cross" },
    bup: { ago: "cross", clo: { type: "cross", low: true }, flx: "cross", fvx: "cross", mao: { type: "taper", wait: 14 }, moc: { type: "taper", wait: 0 }, mir: "cross", tra: "cross", ssri: "cross", snri: "cross", tca: { type: "cross", low: true } },
    clo: { ago: "cross", bup: "cross", flx: { type: "taper", wait: 0, low: true, text: "Reduzir e parar a clomipramina e iniciar fluoxetina 10 mg/dia." }, fvx: { type: "taper", wait: 0, low: true }, mao: { type: "taper", wait: 21 }, moc: { type: "taper", wait: 7 }, mir: "cross", tra: "cross", ssri: { type: "taper", wait: 0, low: true }, snri: { type: "taper", wait: 0, low: true }, tca: "cross" },
    flx: { ago: "cross", bup: { type: "stop", wait: [4, 7] }, clo: { type: "stop", wait: 14, low: true }, fvx: { type: "stop", wait: [4, 7] }, mao: { type: "stop", wait: [35, 42] }, moc: { type: "stop", wait: [35, 42] }, mir: "cross", tra: "cross", ssri: { type: "stop", wait: [4, 7], low: true }, snri: { type: "stop", wait: [4, 7] }, tca: { type: "stop", wait: [4, 7], low: true } },
    fvx: { ago: { type: "taper", wait: 4 }, bup: "cross", clo: { type: "taper", wait: 0, low: true }, flx: { type: "direct", toFluoxetine: true }, mao: { type: "taper", wait: 7 }, moc: { type: "taper", wait: 7 }, mir: { type: "cross", text: "Redução cruzada cuidadosa, começando a mirtazapina com 15 mg." }, tra: "cross", ssri: "direct", snri: "direct", tca: { type: "cross", low: true } },
    mao: { ago: "cross", bup: { type: "taper", wait: 14 }, clo: { type: "taper", wait: 21 }, flx: { type: "taper", wait: 14 }, fvx: { type: "taper", wait: 14 }, mao: { type: "taper", wait: 14 }, moc: { type: "taper", wait: 14 }, mir: { type: "taper", wait: 14 }, tra: { type: "taper", wait: 14 }, ssri: { type: "taper", wait: 14 }, snri: { type: "taper", wait: 14 }, tca: { type: "taper", wait: 14, imipramine: 21 } },
    moc: { ago: { type: "taper", wait: 1 }, bup: { type: "taper", wait: 1 }, clo: { type: "taper", wait: 1 }, flx: { type: "taper", wait: 1 }, fvx: { type: "taper", wait: 1 }, mao: { type: "taper", wait: 1 }, mir: { type: "taper", wait: 1 }, tra: { type: "taper", wait: 1 }, ssri: { type: "taper", wait: 1 }, snri: { type: "taper", wait: 1 }, tca: { type: "taper", wait: 1 } },
    mir: { ago: "cross", bup: "cross", clo: "cross", flx: "cross", fvx: "cross", mao: { type: "taper", wait: 14 }, moc: { type: "taper", wait: 7 }, tra: "cross", ssri: "cross", snri: "cross", tca: "cross" },
    tra: { ago: "cross", bup: "cross", clo: { type: "cross", low: true }, flx: "cross", fvx: "cross", mao: { type: "taper", wait: 7 }, moc: { type: "taper", wait: 7 }, mir: "cross", ssri: "cross", snri: "cross", tca: { type: "cross", low: true } },
    ssri: { ago: "cross", bup: "cross", clo: { type: "taper", wait: 0, low: true }, flx: { type: "direct", toFluoxetine: true }, fvx: "direct", mao: { type: "taper", wait: 7, vortioxetine: 21 }, moc: { type: "taper", wait: 7 }, mir: "cross", tra: "cross", ssri: "direct", snri: "direct", tca: { type: "cross", low: true } },
    snri: { ago: "cross", bup: "cross", clo: { type: "taper", wait: 0, low: true }, flx: { type: "direct", toFluoxetine: true }, fvx: "direct", mao: { type: "taper", wait: 7 }, moc: { type: "taper", wait: 7 }, mir: "cross", tra: "cross", ssri: "direct", snri: "direct", tca: { type: "cross", low: true } },
    tca: { ago: "cross", bup: { type: "halve" }, clo: "direct", flx: { type: "halve" }, fvx: "cross", mao: { type: "taper", wait: 14, imipramine: 21 }, moc: { type: "taper", wait: 7 }, mir: "cross", tra: { type: "halve" }, ssri: { type: "halve" }, snri: { type: "cross", low: true }, tca: "direct" },
  },
  notes: {
    flx: "Interações com a fluoxetina podem ocorrer até 5 semanas depois de parar, pela meia-vida longa do metabólito.",
    fvx: "A fluvoxamina inibe com potência a CYP1A2 (e menos a CYP2C e a CYP3A4): grande potencial de interações.",
    bup: "A bupropiona inibe a CYP2D6: cuidado na redução cruzada com remédios metabolizados por ela.",
    vortioxetina: "Pouca experiência com vortioxetina: cuidado extra, sobretudo com bupropiona, fluoxetina e paroxetina (inibidores da CYP2D6).",
    ago: "A agomelatina não mexe na recaptação de monoaminas: pouco potencial de interação, mas também não alivia a retirada do outro antidepressivo.",
    duloxetina: "Da troca de ISRS ou venlafaxina para duloxetina, a troca direta é possível, já começando com 60 mg/dia.",
    toFluoxetine: "Cuidado na troca direta para fluoxetina: alguns dias de sobreposição ajudam o nível dela a subir antes de parar o primeiro (o nível de equilíbrio leva 1 a 2 semanas).",
  },
  general: [
    "Evitar parar de repente, a não ser por evento adverso grave. Em geral, faz-se a redução cruzada: o primeiro desce aos poucos enquanto o novo sobe.",
    "Redução cruzada costuma levar 2 a 4 semanas; o ritmo é guiado pela tolerância.",
    "Quem usou o antidepressivo por menos de 3 a 4 semanas provavelmente pode parar de uma vez e começar o novo no dia seguinte.",
    "Sem interação farmacocinética, manter a soma abaixo de 100% das doses máximas (por exemplo, 50% de um + 50% do outro).",
    "Combinar serotoninérgicos traz risco de síndrome serotoninérgica; muitos casos graves envolvem IMAO (inclusive moclobemida) com ISRS.",
  ],
  serotoninSyndrome: [
    { level: "Leve", text: "Insônia, ansiedade, náusea, diarreia, hipertensão, taquicardia, hiper-reflexia" },
    { level: "Moderada", text: "Agitação, mioclonia, tremor, midríase, rubor, sudorese, febre baixa (abaixo de 38,5 °C)" },
    { level: "Grave", text: "Hipertermia grave, confusão, rigidez, insuficiência respiratória, coma, morte" },
  ],
};
