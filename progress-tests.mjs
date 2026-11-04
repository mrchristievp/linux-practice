import assert from 'node:assert/strict';
import {buildProgressReport,summarizeQuizSession,validateProgressBackup} from './progress.mjs';
import {prepareShell,prepareExampleShell} from './content.mjs';
const practice=prepareShell();practice.run('echo Review > practice/report-note.txt');
const example=prepareExampleShell();example.run('find examples -name "*.log"');
const questions=[{type:'interpret',topic:'navigation',prompt:'Choose a root path.',options:['relative','/absolute']},{type:'recall',topic:'basics',prompt:'Name the current-directory command.'}];
const session={mode:'practice',finished:true,questions,answers:[{answer:'1',correct:true},{answer:'',correct:false,revealed:true}]};
const summary=summarizeQuizSession(session);assert.equal(summary.responses[0].answer,'/absolute');assert.equal(summary.responses[1].revealed,true);assert.equal(summary.correct,1);
const data={completed:{identity:{at:'2026-11-04T20:00:00Z',hints:1}},snapshots:{write:practice.snapshot(),'example:findtxt':example.snapshot()},transcripts:{write:[{kind:'command',text:'student:~$ echo Review > practice/report-note.txt'}]},quizHistory:[{at:'2026-11-04T19:00:00Z',correct:2,total:5,topics:['basics']},summary]};
const report=buildProgressReport(data,{studentName:'Sample Student',siteVersion:'V5',generatedAt:'2026-11-04T20:30:00Z'});
for(const text of ['Student: Sample Student','Lab tasks completed: 1 of 28','[COMPLETE] Identify your workstation','[IN PROGRESS] Write a reminder','Hint used','echo Review','CREATED /home/student/practice/report-note.txt','    Review','EXAMPLE WORK (separate from lab completion)','find examples','Submitted answer: /absolute','Solution viewed (not independently correct)','Detailed answers were not saved for this earlier set.'])assert.ok(report.includes(text),text);
const unfinished=buildProgressReport({completed:{},snapshots:{},transcripts:{},quizHistory:[]},{activeQuiz:{...session,mode:'quiz',finished:false}});assert.ok(unfinished.includes('Feedback available when the set is finished'));assert.ok(!unfinished.includes('Result: Correct'));assert.ok(!unfinished.includes('Solution viewed'));
const empty=buildProgressReport({});assert.ok(empty.includes('No lab work recorded yet.'));assert.ok(empty.includes('No completed question sets recorded.'));
console.log('Progress report checks passed: lab evidence, example separation, files, legacy scores, answer details and unfinished-quiz feedback.');

const backup={...data,version:1};assert.equal(validateProgressBackup(JSON.parse(JSON.stringify(backup))).snapshots['example:findtxt'].cwd,'/home/student');assert.throws(()=>validateProgressBackup({...backup,snapshots:{unknown:example.snapshot()}}),/Invalid practice filesystem/);console.log('Backup restore validation passed for completed work and example workspaces.');
