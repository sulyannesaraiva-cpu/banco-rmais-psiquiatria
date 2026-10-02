/* Integra RM/SES-DF 2022 (Grupo 010) e RM-1/SES-DF 2024 (Grupo 12) sem reescrever exams.js. */
(async function(){
  const parts=['sesdfDataPart1.js','sesdfDataPart2.js','sesdfDataPart3.js','sesdfDataPart4.js','sesdfDataPart6.js','sesdfDataPart7.js'];
  for(const p of parts) await import(`./${p}`);
  const b64=(window.SESDF_DATA_PARTS||[]).join('');
  if(!b64) throw new Error('Dados SES-DF não carregados');
  const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data=JSON.parse(await new Response(stream).text());
  const root=window.BANCO_RMAIS_EXAMS||(window.BANCO_RMAIS_EXAMS={exams:[]});
  if(!Array.isArray(root.exams)) root.exams=[];
  const addExam=(exam)=>{if(!root.exams.some(e=>e.id===exam.id))root.exams.push(exam);};
  const q22=data['2022'].map(q=>({
    id:`sesdf-rm-2022-grupo010-q${q.n}`,number:q.n,title:`Questão ${q.n}`,text:q.text,
    options:[{letter:'C',text:'CERTO'},{letter:'E',text:'ERRADO'}],correctAnswer:q.correct,
    source:'SES-DF — Residência Médica 2022 — Grupo 010 — PIA/Psicogeriatria',provider:'SES-DF',institution:'SES-DF',
    area:'Psiquiatria da Infância e Adolescência / Psicogeriatria',year:2022,category:'Residência',examTag:'Residência',
    tags:['SES-DF','2022','residência','PIA','psicogeriatria','certo/errado']
  }));
  addExam({id:'sesdf-rm-2022-grupo010',title:'SES-DF — Residência Médica 2022 — Grupo 010 — PIA/Psicogeriatria',institution:'SES-DF',provider:'SES-DF',area:'Psiquiatria da Infância e Adolescência / Psicogeriatria',year:2022,category:'Residência',examTag:'Residência',questionCount:q22.length,questions:q22});
  const letters=['A','B','C','D'];
  const q24=data['2024'].map(q=>({
    id:`sesdf-rm-2024-grupo12-q${q.n}`,number:q.n,title:`Questão ${q.n}`,text:q.text,
    options:q.options.map((t,i)=>({letter:letters[i],text:t})),correctAnswer:q.correct,
    annulled:!!q.annulled,excluded:!!q.annulled,
    source:'SES-DF — Residência Médica 2024 — Grupo 12 — Psicoterapia/PIA/Psicogeriatria',provider:'SES-DF',institution:'SES-DF',
    area:'Psiquiatria',year:2024,category:'Residência',examTag:'Residência',
    tags:['SES-DF','2024','residência','psicoterapia','PIA','psicogeriatria'].concat(q.annulled?['anulada']:[])
  }));
  addExam({id:'sesdf-rm-2024-grupo12',title:'SES-DF — Residência Médica 2024 — Grupo 12 — Psicoterapia/PIA/Psicogeriatria',institution:'SES-DF',provider:'SES-DF',area:'Psiquiatria',year:2024,category:'Residência',examTag:'Residência',questionCount:q24.length,questions:q24});
  window.SESDF_EXTRA_EXAMS_READY=Promise.resolve({exams:2,questions:q22.length+q24.length});
})();