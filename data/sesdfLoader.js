/* Integra RM/SES-DF 2022 (Grupo 010) e RM-1/SES-DF 2024 (Grupo 12) sem reescrever exams.js.
   A Promise é publicada imediatamente para que app.js aguarde a carga completa antes de montar os filtros. */
window.SESDF_EXTRA_EXAMS_READY = (async function loadSesdfExams(){
  /* Os NOMES históricos dos arquivos pulam o Part5, mas cada arquivo grava sequencialmente
     em SESDF_DATA_PARTS[0..5]: Part1->0, Part2->1, Part3->2, Part4->3, Part6->4, Part7->5. */
  const partFiles=['sesdfDataPart1.js','sesdfDataPart2.js','sesdfDataPart3.js','sesdfDataPart4.js','sesdfDataPart6.js','sesdfDataPart7.js'];
  for(const p of partFiles) await import(`./${p}?v=20261007-sesdf3`);

  const loadedParts=window.SESDF_DATA_PARTS||[];
  const expectedIndexes=[0,1,2,3,4,5];
  const missing=expectedIndexes.filter(i=>typeof loadedParts[i]!=="string" || !loadedParts[i]);
  if(missing.length) {
    throw new Error(`Dados SES-DF incompletos; fragmentos internos ausentes: ${missing.map(i=>i+1).join(', ')}`);
  }

  const b64=expectedIndexes.map(i=>loadedParts[i]).join('');
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
  window.SESDF_LOAD_STATUS={ok:true,...result};
  console.info('SES-DF carregada:',result);
  return result;
})().catch((error)=>{
  window.SESDF_LOAD_STATUS={ok:false,error:String(error && error.message || error)};
  console.error('Erro ao carregar provas SES-DF:',error);
  throw error;
});
