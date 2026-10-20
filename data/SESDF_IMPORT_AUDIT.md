# Auditoria SES-DF

Arquivo: `data/sesdf.js` (texto simples, sem compactação). Figuras em `data/img/`.

| Prova | Formato | Itens | Gabarito |
|---|---|---|---|
| RM/SES-DF/2022, Grupo 010 (PIA 624 e Psicogeriatria 627) | Certo/Errado | 120 itens em 20 casos/blocos | Gabarito oficial IADES, Prova Tipo "U" |
| RM-1/SES-DF/2024, Grupo 12 (Psicoterapia 620/629, PIA 624, Psicogeriatria 627) | A–D | 100 questões em 22 casos | Gabarito IADES (Tipo "U"), idêntico ao preliminar do edital (09/01/2024) |

## Como foi extraído

- Texto lido dos cadernos oficiais em PDF, coluna por coluna, com a marca d'água "PROVA APLICADA" removida.
- Na prova de 2022, a fonte grava alguns acentos como glifos soltos (por exemplo, "na o ̃"). As 57 ocorrências foram recompostas ("não", "síndrome", "cardíaca"...).
- Cada item recebe o caso clínico completo antes do enunciado, para ficar autocontido. Em 2024 o caso foi associado pelo intervalo impresso ("Caso clínico para responder às questões de 3 a 6"). A prova escreve "de 52 e 55", que foi tratado como 52–55.
- Questões 51 (vias monoaminérgicas) e 94 (bases biológicas da SAA) de 2024 usam figura: `data/img/sesdf-2024-q51.png` e `sesdf-2024-q94.png`.
- Mantidos como na prova: "Qaunto" (2022, bloco do item 49) e "quoeficiente" (2024, Q23).

## Verificações

- Contagem: 120 + 100, numeração contínua, 4 alternativas em todas as questões de 2024.
- Completude: toda palavra do PDF aparece no texto extraído (as únicas exceções são cabeçalhos, rodapés e instruções da capa).
- Duas cópias diferentes de cada caderno, enviadas separadamente, produziram texto idêntico após a extração.
- 2024: questões 24, 25 e 26 anuladas (`annulled: true`, sem gabarito). O caso clínico delas não foi impresso no caderno, por isso ficam fora do modo prova, como as demais anuladas do banco.
- IDs iguais aos do carregador anterior (`sesdf-rm-2022-grupo010-qN`, `sesdf-rm-2024-grupo12-qN`), para preservar progresso já salvo.

## Outros arquivos recebidos e ainda não importados

Provas de Psiquiatria (SES-DF) de 2019 (Grupo 012), 2020 (Grupo 006) e 2021 (Grupo 010). Faltam os gabaritos oficiais desses anos.
