import {HOME} from './engine.mjs';
import {TOPICS,prepareShell,prepareExampleShell} from './content.mjs';
export function summarizeQuizSession(session){
 return {at:new Date().toISOString(),mode:session.mode,correct:session.answers.filter(a=>a?.correct).length,total:session.questions.length,topics:[...new Set(session.questions.map(q=>q.topic))],responses:session.questions.flatMap((q,i)=>{const a=session.answers[i];return a?[{topic:q.topic,type:q.type,prompt:q.prompt,answer:q.type==='interpret'?(a.answer===''?'':q.options[Number(a.answer)]||''):a.answer,correct:!!a.correct,revealed:!!a.revealed}]:[]})};
}
export function buildProgressReport(data,{studentName='',siteVersion='',generatedAt=new Date().toISOString(),activeQuiz=null}={}){
 const lines=[],add=(...text)=>lines.push(...text),topics=TOPICS,all=topics.flatMap(t=>t.tasks),completed=all.filter(t=>data.completed?.[t.id]);
 const date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleString(undefined,{timeZoneName:'short'});};
 const hasWork=key=>!!data.snapshots?.[key]||!!data.transcripts?.[key]?.length;
 add('LINUX PRACTICE - PROGRESS REPORT','='.repeat(48),`Student: ${studentName.trim()||'Not provided'}`,`Site version: ${siteVersion||'Not recorded'}`,`Report created: ${date(generatedAt)}`,'',`Lab tasks completed: ${completed.length} of ${all.length}`,`Completed question sets: ${(data.quizHistory||[]).length}`,'','LEARNING TASK OVERVIEW','-'.repeat(48));
 for(const t of topics){add('',`${t.label} (${t.tasks.filter(x=>data.completed?.[x.id]).length}/${t.tasks.length} complete)`);for(const task of t.tasks)add(`  [${data.completed?.[task.id]?'COMPLETE':hasWork(task.id)?'IN PROGRESS':'NOT STARTED'}] ${task.title}`);}
 function workspace(key,label,isExample=false){
  const snap=data.snapshots?.[key],transcript=data.transcripts?.[key]||[],done=data.completed?.[key];
  add('',label,'-'.repeat(48));
  if(done)add(`Completed: ${date(done.at)}`,`Help used at completion: ${done.hints>=2?'Worked solution revealed':done.hints===1?'Hint used':done.hints===0?'No hints':'Not recorded'}`);
  add('Commands and terminal output:');
  if(transcript.length){for(const e of transcript)for(const line of String(e.text??'').split('\n'))add('  '+line);}
  else if(snap?.history?.length){for(const command of snap.history)add('  $ '+command);}
  else add('  No commands recorded.');
  if(snap?.fs){const baseline=(isExample?prepareExampleShell():prepareShell()).fs;const changes=[...new Set([...Object.keys(baseline),...Object.keys(snap.fs)])].filter(path=>JSON.stringify(baseline[path])!==JSON.stringify(snap.fs[path]));
   add('Saved file changes:');if(!changes.length)add('  No changes from the starting files.');
   for(const path of changes){const node=snap.fs[path];if(!node){add(`  REMOVED ${path}`);continue;}add(`  ${baseline[path]?'CHANGED':'CREATED'} ${path} (${node.type==='d'?'directory':'file'}, mode ${Number(node.mode).toString(8).padStart(3,'0')})`);if(node.type==='f')for(const line of String(node.text??'').split('\n'))add('    '+line);}
  }
 }
 const practice=all.filter(task=>hasWork(task.id)||data.completed?.[task.id]);add('','LAB WORK DETAILS','='.repeat(48));if(!practice.length)add('No lab work recorded yet.');for(const task of practice){const t=topics.find(t=>t.tasks.includes(task));workspace(task.id,`${t.label} / ${task.title}`);}
 const examples=all.filter(task=>hasWork('example:'+task.id));add('','EXAMPLE WORK (separate from lab completion)','='.repeat(48));if(!examples.length)add('No example work recorded.');for(const task of examples)workspace('example:'+task.id,task.title+' - example',true);
 if(hasWork('sandbox')){add('','FREE TERMINAL','='.repeat(48));workspace('sandbox','Independent exploration');}
 add('','PRACTICE QUESTION RESULTS','='.repeat(48));
 const history=data.quizHistory||[];if(!history.length)add('No completed question sets recorded.');
 function responses(items,hideResults=false){for(const [i,r]of items.entries()){add('',`  ${i+1}. ${r.prompt}`,`     Topic: ${topics.find(t=>t.id===r.topic)?.label||r.topic}`,`     Type: ${{interpret:'Multiple choice',command:'Command entry',recall:'Command name recall'}[r.type]||r.type}`,`     Submitted answer: ${r.answer||'(no answer)'}`,`     Result: ${hideResults?'Feedback available when the set is finished':r.revealed?'Solution viewed (not independently correct)':r.correct?'Correct':'Incorrect / skipped'}`);}}
 for(const [i,set]of history.entries()){add('',`Set ${i+1} - ${date(set.at)}`,`Score: ${set.correct} of ${set.total}`,`Mode: ${set.mode==='quiz'?'Quiz yourself':set.mode==='practice'?'Practice':'Not recorded'}`,`Topics: ${(set.topics||[]).map(id=>topics.find(t=>t.id===id)?.label||id).join(', ')}`);if(Array.isArray(set.responses))responses(set.responses);else add('Detailed answers were not saved for this earlier set.');}
 if(activeQuiz&&!activeQuiz.finished){const set=summarizeQuizSession(activeQuiz);add('','CURRENT QUESTION SET (unfinished)',`Responses submitted: ${set.responses.length} of ${set.total}`);responses(set.responses,activeQuiz.mode==='quiz');}
 add('','END OF REPORT','Upload this report to your teacher.');return lines.join('\n')+'\n';
}

export function validateProgressBackup(data){
 if(data?.version!==1||!data.completed||!data.snapshots||!Array.isArray(data.quizHistory))throw Error('Choose a Linux Practice saved progress file.');
 const allowed=['sandbox',...TOPICS.flatMap(t=>t.tasks.flatMap(x=>[x.id,'example:'+x.id]))];
 for(const [key,snap]of Object.entries(data.snapshots)){
  if(!allowed.includes(key)||!snap.fs||typeof snap.cwd!=='string'||!Array.isArray(snap.history)||!Array.isArray(snap.events))throw Error('Invalid practice filesystem.');
  for(const [path,node]of Object.entries(snap.fs))if(!path.startsWith('/')||!['d','f'].includes(node.type)||!Number.isInteger(node.mode)||node.mode<0||node.mode>511||typeof node.owner!=='string'||node.type==='f'&&typeof node.text!=='string')throw Error('Invalid practice file.');
  if(snap.fs[snap.cwd]?.type!=='d'||snap.fs[HOME]?.type!=='d')throw Error('Invalid starting directory.');
 }
 return data;
}
