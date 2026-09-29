/* Carrega concursos públicos UNIFESP 2025 sem reescrever o banco principal. */
window.UNIFESP_EXTRA_EXAMS_READY = (async function loadUnifesp2025() {
  const paths = [1, 2, 3, 4].map((n) => `data/unifesp2025.part${n}`);
  const parts = await Promise.all(paths.map(async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
    return response.text();
  }));
  const binary = Uint8Array.from(atob(parts.join("")), (char) => char.charCodeAt(0));
  const stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream("gzip"));
  const json = await new Response(stream).text();
  const incoming = JSON.parse(json);
  const root = window.BANCO_RMAIS_EXAMS || (window.BANCO_RMAIS_EXAMS = { exams: [] });
  if (!Array.isArray(root.exams)) root.exams = [];
  const existing = new Set(root.exams.map((exam) => exam.id));
  for (const exam of incoming) {
    if (!existing.has(exam.id)) root.exams.push(exam);
  }
  return incoming;
})().catch((error) => {
  console.error("Erro ao carregar concursos UNIFESP 2025:", error);
  return [];
});
