/* Dados do simulador de psicofarmacologia: psicoestimulantes e outros remédios para TDAH.
   Material didático e simplificado: não serve para prescrição.
   - receptors: alvos com nível qualitativo (0 = sem ação, 4 = ação principal), conforme o
     mecanismo descrito em Stahl, Prescriber's Guide 8ª ed. (2024).
   - regions: quanto o remédio age no pré-frontal (efeito no TDAH), no estriado/accumbens (picos
     rápidos de dopamina = potencial de abuso) e no corpo (pressão e frequência cardíaca); -1 = reduz.
   - day: perfil ao longo do dia montado com início e duração da tabela 5.10 de Maudsley
     Prescribing Guidelines 15ª ed. Cada componente: peso no efeito (w; um perfil de efeito, não a fração exata
     da dose), início (start, horas após a dose), subida (rise) e duração total (dur). Remédios sem curva diária têm "weeks" (tempo até o
     efeito, também da tabela 5.10; clonidina conforme Stahl).
   - effects e indications: classificação didática (0 a 3) a partir de Maudsley e Stahl. */

window.PHARMA_SIM = window.PHARMA_SIM || {};
window.PHARMA_SIM.estimulantes = {
  id: "estimulantes",
  kind: "stimulant",
  label: "Psicoestimulantes e TDAH",
  tagline: "Onde cada remédio do TDAH age, por que alguns têm mais potencial de abuso e quanto tempo cada formulação cobre do dia.",
  source: "Mecanismos conforme Stahl (Prescriber's Guide, 8ª ed.); início e duração das formulações conforme Maudsley Prescribing Guidelines (15ª ed., tabela 5.10). Classificação de efeitos e usos é didática.",
  defaults: { drug: "metilfenidato-oros", a: "metilfenidato-li", b: "lisdexanfetamina" },
  receptors: [
    { id: "DAT", label: "DAT", role: "Bloqueio do transportador de dopamina" },
    { id: "NET", label: "NET", role: "Bloqueio do transportador de noradrenalina (no pré-frontal, também recapta dopamina)" },
    { id: "REL", label: "Liberação", role: "Faz o neurônio liberar dopamina e noradrenalina (anfetaminas, via VMAT2 e transportadores)" },
    { id: "A2A", label: "α2A", role: "Agonista α2A no pré-frontal: melhora o sinal; no tronco, baixa a pressão" },
  ],
  indications: [
    { id: "efficacy", label: "Eficácia no TDAH" },
    { id: "diversion", label: "Boa opção se há risco de desvio ou abuso" },
    { id: "tics", label: "Boa opção se há tiques" },
  ],
  effects: [
    { id: "appetite", label: "Menos apetite", why: "dopamina e noradrenalina no hipotálamo" },
    { id: "insomnia", label: "Insônia", why: "efeito que ainda dura à noite" },
    { id: "cardio", label: "Pressão e frequência ↑", why: "noradrenalina no corpo" },
    { id: "misuse", label: "Potencial de abuso", why: "subida rápida de dopamina no accumbens; menor nas formulações de liberação lenta e no pró-fármaco" },
    { id: "mood", label: "Irritabilidade e ansiedade", why: "excesso de catecolaminas; rebote no fim do efeito" },
    { id: "sedation", label: "Sedação", why: "agonistas α2 (guanfacina, clonidina)" },
    { id: "hypotension", label: "Pressão e frequência ↓", why: "agonistas α2 no tronco cerebral; não parar de repente (rebote hipertensivo)" },
    { id: "growth", label: "Crescimento", why: "estimulantes: acompanhar altura e peso" },
  ],
  drugs: [
    {
      id: "metilfenidato-li", name: "Metilfenidato LI", group: "Estimulante · liberação imediata", search: ["metilfenidato"],
      receptors: { DAT: 4, NET: 3, REL: 0, A2A: 0 },
      regions: { pfc: 3, striatum: 3, body: 2 },
      day: { components: [{ w: 1, start: 0.4, rise: 0.8, dur: 4 }], onset: "20–60 min", duration: "2–4 h", repeat: true },
      indications: { efficacy: 3, diversion: 0, tics: 1 },
      effects: { appetite: 3, insomnia: 2, cardio: 2, misuse: 3, mood: 2, sedation: 0, hypotension: 0, growth: 1 },
      extra: "Bloqueia DAT e NET. Pico rápido e curto: precisa de 2 a 3 doses ao dia e tem mais rebote no fim do efeito e mais potencial de desvio.",
    },
    {
      id: "metilfenidato-la", name: "Metilfenidato LA (50/50)", group: "Estimulante · liberação bifásica", search: ["metilfenidato"],
      receptors: { DAT: 4, NET: 3, REL: 0, A2A: 0 },
      regions: { pfc: 3, striatum: 2, body: 2 },
      day: { components: [{ w: 0.5, start: 0.6, rise: 1, dur: 4.5 }, { w: 0.5, start: 3.5, rise: 1, dur: 9.5 }], onset: "~60 min", duration: "8–12 h" },
      indications: { efficacy: 3, diversion: 1, tics: 1 },
      effects: { appetite: 3, insomnia: 2, cardio: 2, misuse: 2, mood: 2, sedation: 0, hypotension: 0, growth: 1 },
      extra: "Cápsula com metade de liberação imediata e metade de liberação prolongada (como a Ritalina LA): dois picos numa só dose; pode ser aberta e espalhada no alimento.",
    },
    {
      id: "metilfenidato-oros", name: "Metilfenidato OROS", group: "Estimulante · liberação osmótica", search: ["metilfenidato"],
      receptors: { DAT: 4, NET: 3, REL: 0, A2A: 0 },
      regions: { pfc: 3, striatum: 1, body: 2 },
      day: { components: [{ w: 0.55, start: 0.5, rise: 1, dur: 12 }, { w: 0.45, start: 1.5, rise: 6, dur: 12 }], onset: "0,5–2 h", duration: "12 h" },
      indications: { efficacy: 3, diversion: 2, tics: 1 },
      effects: { appetite: 3, insomnia: 2, cardio: 2, misuse: 1, mood: 2, sedation: 0, hypotension: 0, growth: 1 },
      extra: "Comprimido osmótico (como o Concerta): 22% de liberação imediata e 78% liberados aos poucos, com nível que sobe ao longo do dia. Não pode ser partido. 18 mg equivalem a cerca de 15 mg de liberação imediata.",
    },
    {
      id: "lisdexanfetamina", name: "Lisdexanfetamina", group: "Estimulante · pró-fármaco", search: ["lisdexanfetamina", "lisdexamfetamina", "venvanse"],
      receptors: { DAT: 3, NET: 3, REL: 4, A2A: 0 },
      regions: { pfc: 3, striatum: 1, body: 2 },
      day: { components: [{ w: 1, start: 0.5, rise: 1.5, dur: 13 }], onset: "20–60 min", duration: "13 h ou mais" },
      indications: { efficacy: 3, diversion: 2, tics: 1 },
      effects: { appetite: 3, insomnia: 2, cardio: 2, misuse: 1, mood: 2, sedation: 0, hypotension: 0, growth: 1 },
      extra: "Pró-fármaco: só vira dexanfetamina depois de absorvida, aos poucos. Além de bloquear a recaptação, a anfetamina faz o neurônio liberar dopamina e noradrenalina. A conversão lenta reduz o potencial de abuso.",
    },
    {
      id: "atomoxetina", name: "Atomoxetina", group: "Não estimulante · inibidor do NET", search: ["atomoxetina"],
      receptors: { DAT: 0, NET: 4, REL: 0, A2A: 0 },
      regions: { pfc: 2, striatum: 0, body: 2 },
      day: { weeks: "cerca de 4 a 6 semanas" },
      indications: { efficacy: 2, diversion: 3, tics: 2 },
      effects: { appetite: 2, insomnia: 1, cardio: 2, misuse: 0, mood: 1, sedation: 1, hypotension: 0, growth: 1 },
      extra: "Bloqueia só o NET: no pré-frontal sobe também a dopamina (lá o NET recapta dopamina), mas não no accumbens, por isso não tem potencial de abuso e não é substância controlada. Menos eficaz que os estimulantes; vigiar disfunção sexual.",
    },
    {
      id: "guanfacina", name: "Guanfacina", group: "Não estimulante · agonista α2A", search: ["guanfacina"],
      receptors: { DAT: 0, NET: 0, REL: 0, A2A: 4 },
      regions: { pfc: 2, striatum: 0, body: -1 },
      day: { weeks: "cerca de 1 a 5 semanas" },
      indications: { efficacy: 2, diversion: 3, tics: 3 },
      effects: { appetite: 1, insomnia: 0, cardio: 0, misuse: 0, mood: 0, sedation: 3, hypotension: 3, growth: 0 },
      extra: "Agonista α2A seletivo (15 a 20 vezes mais seletivo que para α2B e α2C): melhora o sinal no pré-frontal. Baixa a pressão e a frequência; retirar aos poucos.",
    },
    {
      id: "clonidina", name: "Clonidina", group: "Não estimulante · agonista α2", search: ["clonidina"],
      receptors: { DAT: 0, NET: 0, REL: 0, A2A: 3 },
      regions: { pfc: 1, striatum: 0, body: -1 },
      day: { weeks: "algumas semanas" },
      indications: { efficacy: 1, diversion: 3, tics: 3 },
      effects: { appetite: 1, insomnia: 0, cardio: 0, misuse: 0, mood: 0, sedation: 3, hypotension: 3, growth: 0 },
      extra: "Agonista α2 menos seletivo que a guanfacina e também imidazolínico: mais sedação e hipotensão. Parar de repente pode causar hipertensão de rebote.",
    },
  ],
};
