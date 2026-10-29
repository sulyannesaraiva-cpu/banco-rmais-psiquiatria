/* Neuroanatomia, "Vias e lesões": nervos cranianos e territórios arteriais.

   Nervos cranianos e tronco encefálico: Machado, Neuroanatomia Funcional (4ª ed.), cap. 19
   ("Considerações anatomoclínicas sobre a medula e o tronco encefálico"); localização geral e
   frequência conforme Clinical Neurology for Psychiatrists, cap. 11 (tabela 11-4).
   - nerves: nervos do tronco por nível (I e II não saem do tronco).
   - lesions: cada síndrome tem o nível, a região sombreada no corte (shade, em coordenadas do
     corte), as estruturas atingidas (hit) e os déficits do lado da lesão (same), do lado oposto
     (opposite) e dos dois lados (bilateral). marker: posição do número na vista anterior. */
window.ATLAS.cranial = {
  levels: [
    { id: "mesencefalo", label: "Mesencéfalo", nerves: "III e IV" },
    { id: "ponte", label: "Ponte", nerves: "V, VI, VII e VIII" },
    { id: "bulbo", label: "Bulbo", nerves: "IX, X, XI e XII" },
  ],
  nerves: [
    { n: "III", name: "Oculomotor", level: "mesencefalo", role: "Move o olho para cima, para baixo e para dentro; eleva a pálpebra; contrai a pupila (parassimpático)." },
    { n: "IV", name: "Troclear", level: "mesencefalo", role: "Músculo oblíquo superior. É o único que sai pela face dorsal do tronco." },
    { n: "V", name: "Trigêmeo", level: "ponte", role: "Sensibilidade da face (via aferente do reflexo corneano) e músculos da mastigação." },
    { n: "VI", name: "Abducente", level: "ponte", role: "Músculo reto lateral: leva o olho para fora." },
    { n: "VII", name: "Facial", level: "ponte", role: "Músculos da mímica (via eferente do reflexo corneano) e gustação dos 2/3 anteriores da língua." },
    { n: "VIII", name: "Vestibulococlear", level: "ponte", role: "Audição e equilíbrio. Sai no ângulo pontocerebelar." },
    { n: "IX", name: "Glossofaríngeo", level: "bulbo", role: "Sensibilidade da faringe e gustação do terço posterior da língua." },
    { n: "X", name: "Vago", level: "bulbo", role: "Deglutição e fonação (núcleo ambíguo) e inervação parassimpática das vísceras." },
    { n: "XI", name: "Acessório", level: "bulbo", role: "Raiz craniana junto do vago; raiz espinal para o trapézio e o esternocleidomastóideo." },
    { n: "XII", name: "Hipoglosso", level: "bulbo", role: "Músculos da língua." },
  ],
  rule: "Lesão no tronco encefálico: nervo craniano do mesmo lado e vias longas (força, sensibilidade) do lado oposto. É a síndrome alterna. O nervo craniano atingido diz o nível; as vias longas dizem só que a lesão está no tronco.",
  cognition: "Lesões do tronco, em geral, não dão afasia nem prejuízo cognitivo: um paciente com hemiparesia direita e paralisia do VI esquerdo dificilmente terá afasia.",
  lesions: [
    {
      id: "parinaud", n: 1, level: "mesencefalo", name: "Síndrome de Parinaud", where: "Teto do mesencéfalo (região da pineal)", marker: [150, 40],
      shade: { cx: 160, cy: 40, rx: 82, ry: 24 }, both: true, hit: ["coliculo", "aqueduto"],
      cause: "Típica dos tumores da glândula pineal, que comprimem o teto.",
      same: [], opposite: [],
      bilateral: ["Paralisia do olhar conjugado para cima", "Pupilas que não reagem à luz, mas contraem na convergência", "Hidrocefalia, por compressão do aqueduto cerebral"],
    },
    {
      id: "benedikt", n: 2, level: "mesencefalo", name: "Síndrome de Benedikt", where: "Tegmento do mesencéfalo", marker: [176, 68],
      shade: { cx: 200, cy: 102, rx: 50, ry: 32 }, hit: ["nIII", "rubro", "lemniscos", "fibrasIII"],
      cause: "Lesão do tegmento que pega fibras do III, os lemniscos e o núcleo rubro.",
      same: ["Paralisia do III: olho desviado para fora, ptose, pupila dilatada, visão dupla"],
      opposite: ["Perda de sensibilidade, incluindo a cabeça (lemniscos medial, espinal e trigeminal)", "Tremor e movimentos anormais (núcleo rubro)"],
    },
    {
      id: "weber", n: 3, level: "mesencefalo", name: "Síndrome de Weber", where: "Base do pedúnculo cerebral", marker: [184, 100],
      shade: { cx: 204, cy: 170, rx: 42, ry: 26 }, hit: ["pedunculo", "fibrasIII"],
      cause: "Lesão da base do pedúnculo, por onde passam as fibras motoras e as fibras de saída do III.",
      same: ["Paralisia do III: sem movimento para cima, para baixo e para dentro; estrabismo divergente, ptose, midríase e visão dupla"],
      opposite: ["Hemiparesia (trato corticoespinal, que ainda não cruzou)"],
    },
    {
      id: "millard", n: 4, level: "ponte", name: "Síndrome de Millard-Gubler", where: "Base da ponte, parte caudal", marker: [178, 214],
      shade: { cx: 190, cy: 160, rx: 40, ry: 42 }, hit: ["fibrasVI", "corticoespinal"],
      cause: "Lesão da base da ponte que pega as fibras do VI (às vezes também as do VII) e os feixes corticoespinais.",
      same: ["Paralisia do VI: o olho não vai para fora, estrabismo convergente e visão dupla", "Às vezes, paralisia facial periférica (fibras do VII)"],
      opposite: ["Hemiparesia"],
    },
    {
      id: "trigemeo", n: 5, level: "ponte", name: "Lesão da ponte no nível do trigêmeo", where: "Base e tegmento lateral da ponte", marker: [226, 168],
      shade: { cx: 224, cy: 120, rx: 42, ry: 72 }, hit: ["nV", "corticoespinal", "lemnisco"],
      cause: "Lesão lateral da ponte, na altura em que entram as fibras do trigêmeo.",
      same: ["Paralisia dos músculos da mastigação: a mandíbula desvia para o lado da lesão", "Anestesia da face, com perda do reflexo corneano"],
      opposite: ["Hemiplegia", "Pode haver perda de propriocepção e tato (lemnisco medial)"],
    },
    {
      id: "lockedin", n: 6, level: "ponte", name: "Síndrome do encarceramento (locked-in)", where: "Base da ponte, dos dois lados", marker: [150, 176],
      shade: { cx: 160, cy: 156, rx: 98, ry: 46 }, both: true, hit: ["corticoespinal", "fibrasVI"],
      cause: "Lesão extensa da base da ponte, em geral por oclusão da artéria basilar.",
      same: [], opposite: [],
      bilateral: ["Tetraplegia", "Não fala nem engole (anartria e disfagia)", "Consciência preservada: o paciente se comunica pelo olhar para cima e pelo piscar"],
      psych: "Pode ser confundida com coma, estado vegetativo ou catatonia, mas o paciente está acordado e entende tudo.",
    },
    {
      id: "bulbomedial", n: 7, level: "bulbo", name: "Lesão da base do bulbo", where: "Pirâmide e fibras do hipoglosso", marker: [164, 336],
      shade: { cx: 184, cy: 164, rx: 26, ry: 32 }, hit: ["piramide", "fibrasXII"],
      cause: "Lesão ventral do bulbo, perto da linha média.",
      same: ["Paralisia do XII: a língua desvia para o lado da lesão ao ser protraída, com atrofia dessa metade"],
      opposite: ["Hemiparesia (pirâmide, acima da decussação)"],
    },
    {
      id: "wallenberg", n: 8, level: "bulbo", name: "Síndrome de Wallenberg", where: "Parte dorsolateral do bulbo", marker: [184, 292],
      shade: { cx: 232, cy: 100, rx: 34, ry: 50 }, hit: ["ambiguo", "trigeminal", "pci", "espinotalamico"],
      cause: "Oclusão da artéria cerebelar inferior posterior (ou da vertebral). É o infarto de tronco mais comum.",
      same: ["Incoordenação dos membros (pedúnculo cerebelar inferior)", "Perda de dor e temperatura na face (trato espinal do trigêmeo)", "Dificuldade para engolir e rouquidão (núcleo ambíguo)", "Síndrome de Horner"],
      opposite: ["Perda de dor e temperatura no corpo (trato espinotalâmico)"],
      note: "A força fica preservada: a pirâmide é ventral e medial, fora da área lesada.",
    },
  ],
  /* Cortes do tronco com o lado dorsal para cima; a lesão fica sempre na metade direita do
     desenho (x > 160), marcada como "lado da lesão". */
  sections: {
    mesencefalo: {
      outline: "M160 20 C222 20 252 42 256 82 C259 122 250 152 226 190 L202 200 C188 176 176 166 160 166 C144 166 132 176 118 200 L94 190 C70 152 61 122 64 82 C68 42 98 20 160 20 Z",
      dividers: ["M72 62 H248", "M76 140 C120 128 200 128 244 140"],
      zones: [["teto", 4, 46], ["tegmento", 4, 104], ["base", 4, 176]],
      parts: [
        { id: "aqueduto", x: 160, y: 58, r: 6, label: "aqueduto", hole: true },
        { id: "coliculo", x: 198, y: 38, r: 8, label: "colículo superior" },
        { id: "nIII", x: 170, y: 76, r: 6, label: "núcleo do III" },
        { id: "rubro", x: 194, y: 106, r: 10, label: "núcleo rubro" },
        { id: "lemniscos", x: 238, y: 90, r: 6, label: "lemniscos" },
        { id: "pedunculo", x: 214, y: 170, r: 11, label: "pedúnculo" },
      ],
      fibers: [{ id: "fibrasIII", d: "M170 82 C178 112 174 140 168 168", label: "fibras do III" }],
    },
    ponte: {
      outline: "M70 40 H250 C262 40 268 56 268 76 C274 132 248 202 160 206 C72 202 46 132 52 76 C52 56 58 40 70 40 Z",
      dividers: ["M54 102 C120 96 200 96 266 102"],
      zones: [["tegmento", 4, 74], ["base", 4, 160]],
      hole: "M126 40 L160 60 L194 40 Z",
      parts: [
        { id: "nVI", x: 178, y: 72, r: 6, label: "núcleo do VI" },
        { id: "nVII", x: 206, y: 90, r: 6, label: "núcleo do VII" },
        { id: "nV", x: 244, y: 60, r: 7, label: "núcleos do V" },
        { id: "lemnisco", x: 200, y: 112, r: 6, label: "lemnisco medial" },
        { id: "corticoespinal", x: 210, y: 156, r: 12, label: "corticoespinal" },
      ],
      fibers: [{ id: "fibrasVI", d: "M178 78 C184 120 182 170 176 204", label: "fibras do VI" }],
    },
    bulbo: {
      outline: "M80 50 H240 C258 50 268 70 266 100 C264 150 230 192 160 194 C90 192 56 150 54 100 C52 70 62 50 80 50 Z",
      dividers: [],
      zones: [],
      hole: "M118 50 L160 64 L202 50 Z",
      parts: [
        { id: "nXII", x: 170, y: 72, r: 6, label: "núcleo do XII" },
        { id: "pci", x: 240, y: 62, r: 7, label: "pedúnculo cerebelar inf." },
        { id: "trigeminal", x: 252, y: 90, r: 6, label: "trato espinal do V" },
        { id: "ambiguo", x: 220, y: 110, r: 6, label: "núcleo ambíguo" },
        { id: "espinotalamico", x: 236, y: 134, r: 6, label: "espinotalâmico" },
        { id: "oliva", x: 214, y: 162, r: 11, label: "oliva" },
        { id: "piramide", x: 180, y: 174, r: 11, label: "pirâmide", lx: 150, ly: 208 },
      ],
      fibers: [{ id: "fibrasXII", d: "M170 78 C176 112 186 150 198 190", label: "fibras do XII" }],
    },
  },
  face: {
    periferica: {
      label: "Periférica", where: "Núcleo ou nervo facial, do mesmo lado",
      upper: true,
      text: "Toda a metade da face do mesmo lado: não franze a testa, não fecha o olho, a boca desvia para o lado são. O reflexo corneano some desse lado. Lesões no trajeto do nervo podem somar perda da gustação nos 2/3 anteriores da língua; no meato acústico interno, junto com o VIII, perda auditiva e de equilíbrio.",
    },
    central: {
      label: "Central", where: "Córtex ou cápsula interna, do lado oposto",
      upper: false,
      text: "Só a metade inferior da face do lado oposto à lesão: a testa se mexe e o olho fecha, porque a parte do núcleo que comanda a metade superior recebe fibras dos dois hemisférios. Os movimentos emocionais (sorrir de uma piada) podem ficar preservados. Comum no AVC, junto com a hemiparesia do mesmo lado.",
    },
  },
};

/* Territórios arteriais: Machado (4ª ed.), cap. 18 (vascularização do encéfalo), e Clinical
   Neurology for Psychiatrists, cap. 11 (tabela 11-4). hemi: hemisfério lesado (E, D ou both);
   body: partes do corpo do lado oposto com déficit (1 = intenso, 0.35 = leve); field: perde a
   metade oposta do campo visual; deep: território profundo, aparece só no corte coronal. */
window.ATLAS.arteries = {
  list: [
    {
      id: "aca", label: "Cerebral anterior", short: "ACA", hemi: "D", color: "#0072b2", body: { leg: 1, arm: 0.35 },
      where: "Face medial dos lobos frontal e parietal (incluindo o lóbulo paracentral) e uma faixa no alto da face lateral; ramo recorrente (de Heubner) para a parte anterior da cápsula interna; corpo caloso.",
      deficits: ["Paralisia e perda de sensibilidade do membro inferior do lado oposto (lóbulo paracentral)", "O ramo recorrente pode somar fraqueza da face e do membro superior (cápsula interna)", "Lesão do corpo caloso: síndrome de desconexão"],
      bilateral: "Dos dois lados, a lesão frontal medial extensa dá mutismo, apatia, incontinência urinária, paralisia pseudobulbar e fraqueza das duas pernas.",
      psych: "Apatia e mutismo podem parecer depressão ou catatonia.",
      goto: { module: "frontoestriatais", label: "Circuitos frontoestriatais" },
    },
    {
      id: "acm-esq", label: "Cerebral média esquerda", short: "ACM E", hemi: "E", color: "#d55e00", body: { face: 1, arm: 1, leg: 0.35 }, field: true,
      where: "Quase toda a face lateral do hemisfério: áreas motora e sensitiva da face e do membro superior, áreas da linguagem, radiação óptica.",
      deficits: ["Hemiplegia do lado oposto, maior na face e no membro superior: o membro inferior fica no território da cerebral anterior", "Perda de sensibilidade do lado oposto", "Hemianopsia homônima do lado oposto", "Olhar desviado para o lado da lesão", "No hemisfério esquerdo (dominante na maioria): afasia (global, se o tronco da artéria for ocluído) e apraxia ideomotora"],
      psych: "A afasia, sobretudo a fluente, pode ser confundida com a fala desorganizada da psicose.",
    },
    {
      id: "acm-dir", label: "Cerebral média direita", short: "ACM D", hemi: "D", color: "#d55e00", body: { face: 1, arm: 1, leg: 0.35 }, field: true,
      where: "Mesmo território, no hemisfério direito (em geral o não dominante para a linguagem).",
      deficits: ["Hemiplegia do lado oposto, maior na face e no membro superior", "Perda de sensibilidade do lado oposto", "Hemianopsia homônima do lado oposto", "Olhar desviado para o lado da lesão", "No hemisfério direito: heminegligência do lado esquerdo, anosognosia, aprosódia, apraxias, prosopagnosia e alterações visuoespaciais"],
      psych: "A anosognosia (o paciente não reconhece o déficit) é neurológica, não negação psicológica; a aprosódia deixa a fala sem emoção e pode parecer afeto embotado.",
    },
    {
      id: "acm-prof", label: "Ramos profundos da cerebral média", short: "Lenticuloestriadas", hemi: "D", color: "#e69f00", body: { face: 1, arm: 1, leg: 1 }, deep: true,
      where: "Artérias lenticuloestriadas: núcleo lentiforme, parte do caudado e cápsula interna.",
      deficits: ["Hemiplegia do lado oposto: na cápsula interna as fibras da face, do braço e da perna passam juntas, e uma lesão pequena pode pegar o hemicorpo inteiro", "São as artérias mais atingidas na hemorragia da hipertensão; o edema pode rebaixar a consciência"],
    },
    {
      id: "coroidea", label: "Coróidea anterior", short: "Coróidea ant.", hemi: "D", color: "#cc79a7", body: { face: 1, arm: 1, leg: 1 }, field: true, deep: true,
      where: "Dois terços posteriores da perna posterior da cápsula interna, globo pálido interno, parte ventrolateral do tálamo, trato óptico e início da radiação óptica.",
      deficits: ["Pela cápsula interna: hemiplegia e perda de sensibilidade do lado oposto", "Pelo trato e pela radiação óptica: hemianopsia homônima do lado oposto"],
    },
    {
      id: "acp-esq", label: "Cerebral posterior esquerda", short: "ACP E", hemi: "E", color: "#009e73", body: {}, field: true,
      where: "Lobo occipital (córtex visual), face inferior do lobo temporal e, pelos ramos talamoperfurantes, o tálamo.",
      deficits: ["Hemianopsia homônima do lado oposto (córtex visual)", "No lado esquerdo, junto com o esplênio do corpo caloso: alexia sem agrafia (não consegue ler, mas escreve)", "Ramos para o tálamo: alterações de sensibilidade do lado oposto"],
      psych: "Isquemia transitória dos ramos para o lobo temporal é a causa mais provável da amnésia global transitória.",
      goto: { module: "via-optica", label: "Via óptica" },
    },
    {
      id: "acp-bi", label: "Cerebral posterior, dos dois lados", short: "ACP bilateral", hemi: "both", color: "#009e73", body: {}, field: true,
      where: "Os dois lobos occipitais: as duas artérias saem da bifurcação da basilar.",
      deficits: ["Cegueira cortical: perda da visão com pupilas que ainda reagem à luz"],
      psych: "Olho normal e pupilas que reagem: pode ser confundida com cegueira funcional (conversiva).",
    },
  ],
  basilar: "Artérias vertebrais e basilar irrigam o tronco encefálico e o cerebelo: as síndromes estão em Nervos cranianos e tronco encefálico.",
};
