/* Contador global do Banco R+.
   Conta o conjunto efetivamente carregado pela plataforma e evita duplicar a mesma questão por id. */
(function () {
  function getExams() {
    const root = window.BANCO_RMAIS_EXAMS;
    return root && Array.isArray(root.exams) ? root.exams : [];
  }

  function getTopicQuestions() {
    const root = window.BANCO_RMAIS_QUESTIONS;
    if (Array.isArray(root)) return root;
    return root && Array.isArray(root.questions) ? root.questions : [];
  }

  function collectUniqueQuestions(exams, seen = new Set()) {
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
    const seen = new Set();
    const examQuestions = collectUniqueQuestions(exams, seen);
    const topicQuestions = collectUniqueQuestions([{ id: 'temas', questions: getTopicQuestions() }], seen);
    const totalQuestions = examQuestions + topicQuestions;
    const totalExams = exams.length;
    window.BANCO_RMAIS_GLOBAL_STATS = { totalQuestions, totalExams, examQuestions, topicQuestions };

    let box = document.getElementById('globalBankCounter');
    if (!box) {
      box = document.createElement('div');
      box.id = 'globalBankCounter';
      const host = document.querySelector('#examsPanel') || document.querySelector('.question-shell') || document.body;
      host.appendChild(box);
    }
    box.innerHTML = `<strong>Banco completo</strong><br>${totalQuestions.toLocaleString('pt-BR')} questões · ${totalExams.toLocaleString('pt-BR')} provas<br><small>${examQuestions.toLocaleString('pt-BR')} de provas · ${topicQuestions.toLocaleString('pt-BR')} por tema</small>`;
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
