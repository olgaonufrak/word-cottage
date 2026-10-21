const assert=require('node:assert/strict');
const {fixture}=require('./fixture.cjs');

class RecordingStorage extends Map{
  set(key,value){if(this.record&&key==='word-cottage-learned')this.learnedWrites++;return super.set(key,value);}
}

const storage=new RecordingStorage([
  ['word-cottage-learned',JSON.stringify(['nouns-0'])],
  ['word-cottage-personal-words',JSON.stringify([{en:'my own word',uk:'моє слово'}])]
]);
storage.record=true;storage.learnedWrites=0;
const {run,element}=fixture(storage,undefined,true);
const personalBefore=storage.get('word-cottage-personal-words');
const position=()=>run('session.exercise.step+":"+session.exercise.index');
const state=expression=>JSON.parse(run('JSON.stringify('+expression+')'));
const next=()=>element('exercise-next').onclick();
const previous=()=>{
  assert.equal(typeof element('exercise-prev').onclick,'function','Previous task is an actual button');
  element('exercise-prev').onclick();
};
function submit(text){
  const input=element('exercise-answer');input.value=text;input.oninput?.();
  element('exercise-form').onsubmit({preventDefault(){}});
}
function correctOption(){
  return run('session.exercise.options.findIndex(w=>w.id===session.exercise.lessons[session.exercise.index].word.id)');
}
function solveBuilder(){
  element('sentence-clear').onclick();
  const tokens=state('session.exercise.tokens');
  const target=state('sentenceTokens(session.exercise.lessons[session.exercise.index].sentence)');
  const used=new Set();
  for(const token of target){
    const index=tokens.findIndex((value,i)=>value===token&&!used.has(i));
    assert.ok(index>=0);used.add(index);element('bank-token-'+index).onclick();
  }
  element('exercise-check').onclick();
  assert.equal(element('exercise-next').disabled,false);
}

run('start(["a1-fruit"],false,false,2,["a1-fruit-apple","a1-fruit-banana"],"steps")');
assert.equal(position(),'0:0');
assert.match(element('app').innerHTML,/id="exercise-prev"/);
assert.equal(element('exercise-prev').disabled,true,'There is no task before the first introduction');
previous();assert.equal(position(),'0:0','Even a direct callback cannot move before the first task');
next();assert.equal(position(),'0:1');
assert.equal(element('exercise-prev').disabled,false);
previous();assert.equal(position(),'0:0');
next();next();assert.equal(position(),'1:0','Introduction leads into recognition');

// Wrong selections and an open hint survive crossing a step boundary.
const options=state('session.exercise.options.map(w=>w.id)');
const correct=correctOption(),wrong=(correct+1)%options.length;
element('exercise-option-'+wrong).onclick();element('exercise-hint').onclick();
const hint=element('exercise-hint-content').innerHTML;
previous();assert.equal(position(),'0:1');
next();assert.equal(position(),'1:0');
assert.deepEqual(state('session.exercise.options.map(w=>w.id)'),options,'Recognition choices keep their order');
assert.equal(element('exercise-option-'+wrong).attributes['aria-invalid'],'true');
assert.equal(element('exercise-option-'+wrong).disabled,true);
assert.equal(element('exercise-hint-content').hidden,false);
assert.equal(element('exercise-hint-content').innerHTML,hint);
assert.equal(element('exercise-next').disabled,true,'Going back cannot bypass an unanswered task');
element('exercise-option-'+correct).onclick();
previous();next();
assert.equal(element('exercise-option-'+correct).attributes['data-correct'],'true');
assert.equal(element('exercise-next').disabled,false);
options.forEach((_,i)=>assert.equal(element('exercise-option-'+i).disabled,true,'Correct answers stay locked'));
next();assert.equal(position(),'1:1');
element('exercise-option-'+correctOption()).onclick();next();assert.equal(position(),'2:0');

// Capture the actual input value even if the learner has not checked it yet.
const draft='  My unfinished answer  ';
element('exercise-answer').value=draft;previous();assert.equal(position(),'1:1');
next();assert.equal(element('exercise-answer').value,draft);
submit('wrong answer');
const feedback=element('exercise-feedback').textContent;
previous();next();
assert.equal(element('exercise-answer').value,'wrong answer');
assert.equal(element('exercise-feedback').textContent,feedback);
assert.match(element('exercise-feedback').className,/retry/);
assert.equal(element('exercise-next').disabled,true);
const answer=run('session.exercise.lessons[0].word.en');
submit(answer);next();assert.equal(position(),'2:1');
previous();assert.equal(position(),'2:0');
assert.equal(element('exercise-answer').value,answer);
assert.equal(element('exercise-answer').disabled,true);
assert.equal(element('exercise-next').disabled,false);
element('exercise-form').onsubmit({preventDefault(){}});
assert.equal(run('session.exercise.answered'),true,'A completed answer cannot be graded again');
next();assert.equal(position(),'2:1');
submit(run('session.exercise.lessons[1].word.en'));next();
for(let index=0;index<2;index++){
  assert.equal(position(),'3:'+index);
  submit(run('session.exercise.lessons[session.exercise.index].target'));next();
}
assert.equal(position(),'4:0');

// A partial sentence is not shuffled or cleared by leaving and returning.
const bank=state('session.exercise.tokens');
element('bank-token-0').onclick();element('bank-token-'+(bank.length-1)).onclick();
const partial=state('session.exercise.picked');
previous();assert.equal(position(),'3:1');
next();assert.equal(position(),'4:0');
assert.deepEqual(state('session.exercise.tokens'),bank);
assert.deepEqual(state('session.exercise.picked'),partial);
partial.forEach(index=>assert.equal(element('bank-token-'+index).disabled,true));
solveBuilder();
const complete=state('session.exercise.picked');
next();assert.equal(position(),'4:1');
previous();assert.equal(position(),'4:0');
assert.deepEqual(state('session.exercise.picked'),complete);
bank.forEach((_,index)=>assert.equal(element('bank-token-'+index).disabled,true));
element('chosen-token-0').onclick();
assert.deepEqual(state('session.exercise.picked'),complete,'A completed sentence stays locked');
next();solveBuilder();next();assert.equal(position(),'5:0');

// Self-assessment prompts are restored along with a draft own sentence.
const ownDraft=run('{const t=sentenceTokens(session.exercise.lessons[0].sentence);[t.pop(),...t].join(" ")}');
submit(ownDraft);
assert.equal(element('exercise-self-check').hidden,false);
previous();assert.equal(position(),'4:1');next();
assert.equal(element('exercise-answer').value,ownDraft);
assert.equal(element('exercise-self-check').hidden,false);
assert.equal(element('exercise-next').disabled,true);
submit(run('session.exercise.lessons[0].sentence'));next();
assert.equal(position(),'5:1');
submit(run('session.exercise.lessons[1].sentence'));next();
assert.equal(position(),'6:0');
assert.match(element('app').innerHTML,/Готово!/);
assert.equal(run('session.exercise.completed.size'),2);
assert.equal(run('learned.size'),3);
assert.equal(storage.learnedWrites,2,'Each newly completed word is saved once');

// The last task remains reachable from the finished screen, with its answer.
previous();assert.equal(position(),'5:1');
assert.equal(element('exercise-answer').value,run('session.exercise.lessons[1].sentence'));
assert.equal(element('exercise-answer').disabled,true);
previous();assert.equal(position(),'5:0');next();next();
assert.equal(position(),'6:0');
assert.equal(run('session.exercise.completed.size'),2);
assert.equal(run('learned.size'),3);
assert.equal(storage.learnedWrites,2,'Revisiting correct final tasks does not save progress again');
assert.equal(storage.get('word-cottage-personal-words'),personalBefore);
const reload=fixture(storage,undefined,true);
assert.equal(reload.run('learned.size'),3,'Learned progress still restores after reloading');

// A fresh repetition starts at its own first task, without old answers.
element('exercise-restart').onclick();
assert.equal(position(),'0:0');
assert.equal(element('exercise-prev').disabled,true);
next();next();
assert.equal(element('exercise-next').disabled,true);
assert.equal(run('session.exercise.answered'),false);

// The boundary arithmetic also works for one word. A confirmed self-check
// stays in repetition when the learner returns from the completion screen.
const one=fixture(new Map(),undefined,true);
one.run('start(["a1-fruit"],false,false,1,["a1-fruit-apple"],"steps")');
one.element('exercise-next').onclick();
one.element('exercise-prev').onclick();
assert.equal(one.run('session.exercise.step'),0);
assert.equal(one.element('exercise-prev').disabled,true);
one.element('exercise-next').onclick();
one.element('exercise-option-'+one.run('session.exercise.options.findIndex(w=>w.id==="a1-fruit-apple")')).onclick();
one.element('exercise-next').onclick();
for(let step=2;step<=3;step++){
  one.element('exercise-answer').value='apple';
  one.element('exercise-form').onsubmit({preventDefault(){}});
  one.element('exercise-next').onclick();
}
const oneTokens=JSON.parse(one.run('JSON.stringify(session.exercise.tokens)'));
for(const token of ['I','eat','an','apple'])one.element('bank-token-'+oneTokens.indexOf(token)).onclick();
one.element('exercise-check').onclick();one.element('exercise-next').onclick();
one.element('exercise-answer').value='Apple I eat an';
one.element('exercise-form').onsubmit({preventDefault(){}});
one.element('confirm-self-check').onclick();one.element('exercise-next').onclick();
assert.equal(one.run('session.exercise.step'),6);
one.element('exercise-prev').onclick();
assert.equal(one.run('session.exercise.step+":"+session.exercise.index'),'5:0');
assert.equal(one.element('exercise-answer').value,'Apple I eat an');
assert.equal(one.element('exercise-answer').disabled,true);
assert.equal(one.element('confirm-self-check').disabled,true);
one.element('exercise-next').onclick();
assert.equal(one.run('session.exercise.selfChecked.size'),1);
assert.equal(one.run('session.exercise.completed.size'),0);
assert.equal(one.run('learned.size'),0);
assert.match(one.element('app').innerHTML,/залишилися для повторення/);
console.log('Passed: previous-task boundaries, words and step transitions; restored recognition order, hints, errors, typed drafts, correct locked answers, sentence token order and self-assessment; return from completion without duplicate progress, one-word self-check, preserved personal words and a clean restart.');
