/* Integra RM/SES-DF 2022 (Grupo 010) e RM-1/SES-DF 2024 (Grupo 12) sem reescrever exams.js.
   IMPORTANTE: a Promise é publicada imediatamente para que app.js aguarde a carga completa
   antes de o núcleo montar os filtros de provas. */
window.SESDF_EXTRA_EXAMS_READY = (async function loadSesdfExams(){
  const parts=['sesdfDataPart1.js','sesdfDataPart2.js','sesdfDataPart3.js','sesdfDataPart4.js','sesdfDataPart6.js','sesdfDataPart7.js'];
  for(const p of parts) await import(`./${p}`);

  const loadedParts=window.SESDF_DATA_PARTS||[];
  if(loadedParts.length!==6 || loadedParts.some(part=>!part)) {
    throw new Error(`Dados SES-DF incompletos: ${loadedParts.filter(Boolean).length}/6 partes carregadas`);
  }

  const b64=loadedParts.join('');
  const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data=JSON.parse(await new Response(stream).text());

  if(!data || !Array.isArray(data['2022']) || !Array.isArray(data['2024'])) {
    throw new Error('Estrutura dos dados SES-DF inválida');
  }
  if(data['2022'].length!==120 || data['2024'].length!==100) {
    throw new Error(`Contagem SES-DF inesperada: 2022=${data['2022'].length}, 2024=${data['2024'].length}`);
  }

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

  const result={exams:2,questions:q22.length+q24.length};
  console.info('SES-DF carregada:',result);
  return result;
})().catch((error)=>{
  console.error('Erro ao carregar provas SES-DF:',error);
  throw error;
});
