/* Loader robusto SES-DF: lê os fragmentos como texto, sem depender de import() dinâmico. */
window.SESDF_EXTRA_EXAMS_READY = (async function loadSesdfExamsV2(){
  const files=['sesdfDataPart1.js','sesdfDataPart2.js','sesdfDataPart3.js','sesdfDataPart4.js','sesdfDataPart6.js','sesdfDataPart7.js'];
  const pieces=[];
  for (const file of files) {
    const response=await fetch(`./data/${file}?v=20261005-sesdf2`,{cache:'no-store'});
    if(!response.ok) throw new Error(`Falha HTTP ${response.status} em ${file}`);
    const text=await response.text();
    const match=text.match(/SESDF_DATA_PARTS\[(\d+)\]\s*=\s*'([^']+)'/);
    if(!match) throw new Error(`Fragmento SES-DF inválido: ${file}`);
    pieces[Number(match[1])]=match[2];
  }
  const missing=[0,1,2,3,4,5].filter(i=>!pieces[i]);
  if(missing.length) throw new Error(`Fragmentos SES-DF ausentes: ${missing.join(',')}`);
  const b64=pieces.join('');
  const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  if(typeof DecompressionStream!=='function') throw new Error('Navegador sem suporte a DecompressionStream');
  const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data=JSON.parse(await new Response(stream).text());
  if(!Array.isArray(data?.['2022'])||!Array.isArray(data?.['2024'])) throw new Error('Estrutura SES-DF inválida');
  if(data['2022'].length!==120||data['2024'].length!==100) throw new Error(`Contagem SES-DF inválida: ${data['2022'].length}+${data['2024'].length}`);

  const root=window.BANCO_RMAIS_EXAMS||(window.BANCO_RMAIS_EXAMS={exams:[]});
  if(!Array.isArray(root.exams)) root.exams=[];
  const addExam=exam=>{const i=root.exams.findIndex(e=>e.id===exam.id);if(i>=0)root.exams[i]=exam;else root.exams.push(exam);};
  const q22=data['2022'].map(q=>({id:`sesdf-rm-2022-grupo010-q${q.n}`,number:q.n,title:`Questão ${q.n}`,text:q.text,options:[{letter:'C',text:'CERTO'},{letter:'E',text:'ERRADO'}],correctAnswer:q.correct,source:'SES-DF — Residência Médica 2022 — Grupo 010 — PIA/Psicogeriatria',provider:'SES-DF',institution:'SES-DF',area:'Psiquiatria da Infância e Adolescência / Psicogeriatria',year:2022,category:'Residência',examTag:'Residência',tags:['SES-DF','2022','residência','PIA','psicogeriatria','certo/errado']}));
  addExam({id:'sesdf-rm-2022-grupo010',title:'SES-DF — Residência Médica 2022 — Grupo 010 — PIA/Psicogeriatria',institution:'SES-DF',provider:'SES-DF',area:'Psiquiatria da Infância e Adolescência / Psicogeriatria',year:2022,category:'Residência',examTag:'Residência',questionCount:q22.length,questions:q22});
  const letters=['A','B','C','D'];
  const q24=data['2024'].map(q=>({id:`sesdf-rm-2024-grupo12-q${q.n}`,number:q.n,title:`Questão ${q.n}`,text:q.text,options:q.options.map((t,i)=>({letter:letters[i],text:t})),correctAnswer:q.correct,annulled:!!q.annulled,excluded:!!q.annulled,source:'SES-DF — Residência Médica 2024 — Grupo 12 — Psicoterapia/PIA/Psicogeriatria',provider:'SES-DF',institution:'SES-DF',area:'Psiquiatria',year:2024,category:'Residência',examTag:'Residência',tags:['SES-DF','2024','residência','psicoterapia','PIA','psicogeriatria'].concat(q.annulled?['anulada']:[])}));
  addExam({id:'sesdf-rm-2024-grupo12',title:'SES-DF — Residência Médica 2024 — Grupo 12 — Psicoterapia/PIA/Psicogeriatria',institution:'SES-DF',provider:'SES-DF',area:'Psiquiatria',year:2024,category:'Residência',examTag:'Residência',questionCount:q24.length,questions:q24});
  const result={ok:true,exams:2,questions:220};window.SESDF_LOAD_STATUS=result;console.info('SES-DF carregada (V2):',result);return result;
})().catch(error=>{window.SESDF_LOAD_STATUS={ok:false,error:String(error?.message||error)};console.error('Erro SES-DF V2:',error);throw error;});
