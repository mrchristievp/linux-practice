import assert from 'node:assert/strict';
import {TOPICS,LESSONS,prepareShell,prepareExampleShell} from './content.mjs';
let checked=0;
for(const topic of TOPICS)for(const task of topic.tasks){
 const lesson=LESSONS[task.id];
 assert.ok(lesson,`Missing lesson: ${task.id}`);
 assert.ok(lesson.points.length>=2&&lesson.steps.length>0,`Incomplete lesson: ${task.id}`);
 const example=prepareExampleShell();
 for(const step of lesson.steps){
  const result=example.run(step.command);
  assert.equal(result.ok,true,`${task.id}: ${step.command}: ${result.out}`);
 }
 assert.equal(!!task.check(example),false,`${task.id}: example must not solve the practice task`);
 const restored=prepareExampleShell(example.snapshot());
 assert.equal(JSON.stringify(restored.fs),JSON.stringify(example.fs),`${task.id}: example changes survive restoration`);
 const practice=prepareShell();
 assert.equal(practice.fs['/home/student/examples'],undefined,`${task.id}: example files must stay separate`);
 assert.equal(!!task.check(practice),false);
 assert.equal(practice.run(task.solution).ok,true);
 assert.equal(!!task.check(practice),true,`${task.id}: independent solution must still work`);
 checked++;
}
console.log(`${checked} lessons verified: runnable examples, different practice goals, workspace isolation and saved example files.`);
