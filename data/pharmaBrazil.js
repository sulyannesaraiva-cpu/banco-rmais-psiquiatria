/* Disponibilidade no Brasil, para a troca e a retirada (Troca de medicamentos).
   - names e sus: Psicofarmacologia: da Teoria à Clínica (1ª ed., 2025), "Nomes no Brasil" e "SUS"
     (Rename) de cada monografia.
   - forms: apresentações orais, conferidas no quadro "Apresentação" de um manual brasileiro de
     psicofármacos e, quando faltavam, em bulas brasileiras de fabricantes e farmácias (out/2026).
     Lista resumida: marcas e embalagens mudam; conferir sempre a bula vigente na Anvisa.
   - liquid: forma líquida que permite degraus finos no desmame. drops: mg por gota, quando
     confirmado na bula. noSplit: só há liberação prolongada ou cápsula (não partir).
   - available: false = sem registro de venda no Brasil, segundo o livro de 2025. */
window.PHARMA_BRAZIL = {
  sertralina: { names: "Zoloft, Assert, Serenata, Tolrest e genéricos", forms: "comprimidos de 25, 50, 75 e 100 mg", sus: "Não está na Rename; alguns municípios oferecem (Remume)." },
  paroxetina: { names: "Aropax, Cebrilin, Pondera, Paxtrat, Roxetin e outros", forms: "comprimidos de 10, 15, 20, 25, 30 e 40 mg; liberação controlada de 12,5 e 25 mg", sus: "Não está na Rename." },
  citalopram: { names: "Cipramil, Procimax, Alcytam, Città, Denyl, Maxapram, Nypram", forms: "comprimidos de 20 e 40 mg (sem forma líquida no Brasil)", sus: "Não está na Rename." },
  escitalopram: { names: "Lexapro, Esc, Reconter, Exodus, Escilex e outros", forms: "comprimidos de 10, 15 e 20 mg; solução oral (gotas) de 20 mg/mL", liquid: "gotas de 20 mg/mL", ml: 20, drops: 1, sus: "Não está na Rename." },
  fluoxetina: { names: "Prozac, Daforin, Fluxene, Verotina", forms: "cápsulas de 10 e 20 mg; comprimidos de 20 mg; solução oral de 20 mg/mL", liquid: "solução oral de 20 mg/mL", ml: 20, sus: "Rename, componente básico: cápsulas e comprimidos de 20 mg." },
  fluvoxamina: { names: "Luvox, Revoc", forms: "comprimidos de 50 e 100 mg", sus: "Não está na Rename." },
  vortioxetina: { names: "Brintellix, Voextor, Vurtuoso", forms: "comprimidos de 5, 10, 15 e 20 mg (as gotas existem em outros países, não no Brasil)", sus: "Não está na Rename." },
  venlafaxina: { names: "Efexor XR, Alenthus XR, Venlift OD, Vensate LP, Venlaxin", forms: "cápsulas de liberação prolongada de 37,5, 75 e 150 mg", noSplit: true, sus: "Não está na Rename." },
  desvenlafaxina: { names: "Pristiq, Desve, Imense, Vellana, Zodel e outros", forms: "comprimidos de liberação prolongada de 50 e 100 mg", noSplit: true, sus: "Não está na Rename." },
  duloxetina: { names: "Cymbalta, Velija, Cymbi, Dual, Abretia", forms: "cápsulas de liberação retardada de 30 e 60 mg", noSplit: true, sus: "Não está na Rename." },
  clomipramina: { names: "Anafranil, Clo", forms: "comprimidos de 10 e 25 mg; liberação lenta de 75 mg", sus: "Rename, componente básico: comprimidos de 10 e 25 mg." },
  amitriptilina: { names: "Amytril e genéricos", forms: "comprimidos de 10, 25 e 75 mg", sus: "Rename, componente básico: comprimidos de 25 e 75 mg." },
  nortriptilina: { names: "Pamelor", forms: "cápsulas de 10, 25, 50 e 75 mg", sus: "Rename, componente básico: cápsulas de 10, 25, 50 e 75 mg." },
  imipramina: { names: "Tofranil, Tofranil Pamoato", forms: "drágeas de 10 e 25 mg; cápsulas (pamoato) de 75 e 150 mg", sus: "Não está na Rename." },
  mirtazapina: { names: "Remeron, Menelat, Razapina", forms: "comprimidos de 30 e 45 mg; orodispersíveis de 15, 30 e 45 mg", sus: "Não está na Rename." },
  trazodona: { names: "Donaren, Loredon, Sonic, Inseris XR", forms: "comprimidos de 50 e 100 mg; liberação prolongada de 150 e 300 mg", sus: "Não está na Rename." },
  bupropiona: { names: "Wellbutrin XL, Zyban, Bup, Noradop, Zetron XL e outros", forms: "comprimidos de liberação prolongada de 150 e 300 mg", noSplit: true, sus: "Rename, componente estratégico (tabagismo): 150 mg de liberação prolongada." },
  agomelatina: { names: "Valdoxan, Agoxon, Elencos", forms: "comprimidos de 25 mg", sus: "Não está na Rename." },
  moclobemida: { available: false, names: "Sem registro de venda no Brasil (no exterior: Aurorix, Manerix)", forms: "—", sus: "Não está na Rename." },
  tranilcipromina: { names: "Parnate", forms: "comprimidos de 10 mg", sus: "Não está na Rename." },

  haloperidol: { names: "Haldol, Haldol Decanoato", forms: "comprimidos de 1 e 5 mg; solução oral de 2 mg/mL; decanoato injetável de 50 mg/mL", liquid: "solução oral de 2 mg/mL", ml: 2, sus: "Rename, componente básico: comprimidos de 1 e 5 mg, solução oral de 2 mg/mL e injetável." },
  clorpromazina: { names: "Amplictil, Longactil", forms: "comprimidos de 25 e 100 mg; solução oral de 40 mg/mL", liquid: "solução oral de 40 mg/mL", ml: 40, sus: "Rename, componente básico: comprimidos de 25 e 100 mg, solução oral de 40 mg/mL e injetável." },
  amissulprida: { names: "Socian", forms: "comprimidos de 50 e 200 mg", sus: "Não está na Rename." },
  risperidona: { names: "Risperdal, Risperidon, Zargus, Viverdal e outros", forms: "comprimidos de 0,25, 0,5, 1, 2 e 3 mg; solução oral de 1 mg/mL", liquid: "solução oral de 1 mg/mL", ml: 1, sus: "Rename, componente especializado: comprimidos de 1, 2 e 3 mg e solução oral de 1 mg/mL." },
  paliperidona: { names: "Invega (oral); Invega Sustenna e Trinza (injetáveis)", forms: "comprimidos de liberação prolongada de 3, 6 e 9 mg", noSplit: true, sus: "Não está na Rename." },
  olanzapina: { names: "Zyprexa, Zap, Axonium, Crisapina, Onaz, Zopix e outros", forms: "comprimidos de 2,5, 5 e 10 mg; orodispersíveis de 5 e 10 mg", sus: "Rename, componente especializado: comprimidos de 5 e 10 mg." },
  quetiapina: { names: "Seroquel, Atip, Quet, Quetipin, Quetros e outros", forms: "comprimidos de 25, 100, 200 e 300 mg; liberação prolongada de 50, 200 e 300 mg", sus: "Rename, componente especializado: comprimidos de 25, 100, 200 e 300 mg." },
  clozapina: { names: "Leponex, Pinazan, Okótico", forms: "comprimidos de 25 e 100 mg", sus: "Rename, componente especializado: comprimidos de 25 e 100 mg." },
  ziprasidona: { names: "Geodon", forms: "cápsulas de 40 e 80 mg", noSplit: true, sus: "Rename, componente especializado: cápsulas de 40 e 80 mg." },
  lurasidona: { names: "Latuda, Lutab", forms: "comprimidos de 20, 40 e 80 mg", sus: "Não está na Rename." },
  aripiprazol: { names: "Aristab, Aipri, Biquiz, Harip, Sensaz, Toarip e outros", forms: "comprimidos de 10, 15, 20 e 30 mg; suspensão oral de 1 mg/mL (Aristab)", liquid: "suspensão oral de 1 mg/mL", ml: 1, sus: "Não está na Rename." },
  cariprazina: { available: false, names: "Sem registro de venda no Brasil (EUA: Vraylar)", forms: "—", sus: "Não está na Rename." },
  brexpiprazol: { names: "Rexulti", forms: "comprimidos de 0,5, 1, 2 e 3 mg", sus: "Não está na Rename." },
  asenapina: { available: false, names: "Sem registro de venda no Brasil (EUA: Saphris)", forms: "—", sus: "Não está na Rename." },

  diazepam: { names: "Valium, Compaz e genéricos", forms: "comprimidos de 5 e 10 mg; injetável de 5 mg/mL (sem forma líquida oral)", sus: "Rename, componente básico: comprimidos de 5 e 10 mg e injetável." },
  clordiazepoxido: { available: false, names: "No Brasil, só em associação com amitriptilina (Limbitrol)", forms: "—", sus: "Não está na Rename." },
  clonazepam: { names: "Rivotril, Clopam e genéricos", forms: "comprimidos de 0,5 e 2 mg; sublingual de 0,25 mg; solução oral (gotas) de 2,5 mg/mL", liquid: "gotas de 2,5 mg/mL", ml: 2.5, drops: 0.1, sus: "Rename, componente básico: solução oral de 2,5 mg/mL." },
  alprazolam: { names: "Frontal, Apraz, Tranquinal e genéricos", forms: "comprimidos de 0,25, 0,5, 1 e 2 mg", sus: "Não está na Rename." },
  lorazepam: { names: "Lorax", forms: "comprimidos de 1 e 2 mg", sus: "Não está na Rename." },
  bromazepam: { names: "Lexotan, Somalium, Fluxtar", forms: "comprimidos de 3 e 6 mg; cápsulas de liberação prolongada de 3 e 6 mg; solução oral de 2,5 mg/mL (Somalium)", liquid: "solução oral de 2,5 mg/mL", ml: 2.5, sus: "Não está na Rename." },
  zolpidem: { names: "Stilnox, Patz SL, Turno, Lune SL e outros", forms: "comprimidos de 10 mg; sublinguais de 5 e 10 mg; liberação prolongada de 6,25 e 12,5 mg", sus: "Não está na Rename." },
};
