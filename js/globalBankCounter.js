/* Contador global do Banco R+.
   Conta o conjunto efetivamente carregado pela plataforma e evita duplicar a mesma questão por id. */
(function () {
  function getExams() {
    const root = window.BANCO_RMAIS_EXAMS;
    return root && Array.isArray(root.exams) ? root.exams : [];
  }

  function collectUniqueQuestions(exams) {
    const seen = new Set();
    let total = 0;
    exams.forEach((exam, examIndex) => {
      const qs = Array.isArray(exam.questions) ? exam.questions : [];
      qs.forEach((q, qIndex) => {
        const key = q && q.id != null
          ? `id:${String(q.id)}`
          : `fallback:${exam.id || exam.title || examIndex}:${q.number || qIndex}:${q.text || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          total += 1;
        }
      });
    });
    return total;
  }

  function renderCounter() {
    const exams = getExams();
    if (!exams.length) return false;
    const totalQuestions = collectUniqueQuestions(exams);
    const totalExams = exams.length;
    window.BANCO_RMAIS_GLOBAL_STATS = { totalQuestions, totalExams };

    let box = document.getElementById('globalBankCounter');
    if (!box) {
      box = document.createElement('div');
      box.id = 'globalBankCounter';
      box.style.cssText = 'margin:10px 0 4px;padding:10px 12px;border:1px solid #dbe3ef;border-radius:10px;background:#f8fafc;color:#475569;font-size:13px;line-height:1.35;';
      const sidebar = document.querySelector('.sidebar') || document.querySelector('aside') || document.querySelector('nav');
      if (sidebar) sidebar.appendChild(box);
      else document.body.appendChild(box);
    }
    box.innerHTML = `<strong style="color:#0f172a">Banco completo</strong><br>${totalQuestions.toLocaleString('pt-BR')} questões · ${totalExams.toLocaleString('pt-BR')} provas`;
    return true;
  }

  function start() {
    if (renderCounter()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (renderCounter() || tries >= 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
