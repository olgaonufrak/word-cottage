const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');

async function main(){
  const storage=new Map([
    ['word-cottage-personal-words',JSON.stringify([{en:'my special word',uk:'моє особливе слово'}])],
    ['word-cottage-learned',JSON.stringify(['nouns-0','custom-my%20special%20word'])]
  ]);
  const {run,element}=fixture(storage,undefined,true);
  const originalPersonal=storage.get('word-cottage-personal-words');
  run('showDailyStage(1);showSectionWords(["a1-fruit"])');
  const appleIndex=run('sectionWordPool(["a1-fruit"]).findIndex(w=>w.en==="apple")');
  const bananaIndex=run('sectionWordPool(["a1-fruit"]).findIndex(w=>w.en==="banana")');
  for(const index of [appleIndex,bananaIndex]){element('section-word-'+index).checked=true;element('section-word-'+index).onchange();}
  element('learn-section').onclick();assert.equal(element('practice-mode').value,'steps');
  assert.equal(element('word-count').textContent,2);
  element('start-session').onclick();assert.equal(run('selection.mode'),'steps');
  element('swipe-learn').onclick();await new Promise(resolve=>setTimeout(resolve,190));
  assert.equal(run('screen'),'selection');assert.equal(run('session'),null);
  element('swipe-learn').onclick();await new Promise(resolve=>setTimeout(resolve,190));
  assert.equal(run('screen'),'exercises');assert.equal(run('session.queue.length'),2);
  assert.equal(run('learned.size'),2,'Introduction must not mark anything learned');
  assert.equal(run('session.exercise.lessons[0].quoted'),false);
  assert.match(element('app').innerHTML,/Слова та підказки до конструкції/);
  assert.match(element('app').innerHTML,/aria-current="step"/);
  run('window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:"Google English",lang:"en-US"}]},speak(u){window.lastSpeech=u}}');
  element('example-audio').onclick();assert.equal(run('window.lastSpeech.text'),run('session.exercise.lessons[0].sentence'));
  element('exercise-audio').onclick();assert.equal(run('window.lastSpeech.text'),run('session.queue[0].en'));
  let challengedId='';
  for(let step=0;step<6;step++){
    for(let index=0;index<2;index++){
      assert.equal(run('session.exercise.step'),step);assert.equal(run('session.exercise.index'),index);
      const answer=run('session.exercise.lessons[session.exercise.index].word.en');
      if(step===0){assert.equal(element('exercise-next').disabled,false);}
      if(step===1){
        assert.equal(element('exercise-next').disabled,true);
        run('nextExercise()');assert.equal(run('session.exercise.index'),index,'Cannot skip unanswered tasks');
        const options=JSON.parse(run('JSON.stringify(session.exercise.options)'));
        assert.equal(new Set(options.map(word=>word.en.toLowerCase())).size,options.length);
        const correct=run('session.exercise.options.findIndex(w=>w.id===session.exercise.lessons[session.exercise.index].word.id)');
        if(index===0){
          element('exercise-option-'+((correct+1)%options.length)).onclick();
          assert.equal(element('exercise-next').disabled,true);assert.match(element('exercise-feedback').textContent,/Спробуй ще раз/);
          challengedId=run('session.exercise.lessons[0].word.id');
        }
        element('exercise-option-'+correct).onclick();assert.equal(element('exercise-next').disabled,false);
      }
      if(step===2||step===3){
        assert.doesNotMatch(element('app').innerHTML,new RegExp('lang="en">'+answer+'<'),'No answer leak before recall');
        element('exercise-answer').value='';run('checkExercise()');assert.equal(element('exercise-next').disabled,true);
        element('exercise-answer').value='wrong answer';run('checkExercise()');assert.equal(element('exercise-next').disabled,true);
        element('exercise-answer').value='  '+answer.toUpperCase()+'  ';run('checkExercise()');
        assert.equal(element('exercise-next').disabled,false);assert.equal(run('learned.size'),2);
      }
      if(step===4){
        // Repeated tokens are distinct buttons; removing one returns only that token.
        element('bank-token-0').onclick();assert.equal(run('session.exercise.picked.length'),1);
        element('chosen-token-0').onclick();assert.equal(run('session.exercise.picked.length'),0);
        run('checkExercise()');assert.equal(element('exercise-next').disabled,true);
        run('{const ex=session.exercise,used=new Set();ex.picked=sentenceTokens(ex.lessons[ex.index].sentence).map(token=>{const i=ex.tokens.findIndex((candidate,index)=>candidate===token&&!used.has(index));used.add(i);return i;});checkExercise();}');
        assert.equal(element('exercise-next').disabled,false);assert.equal(run('learned.size'),2);
      }
      if(step===5){
        element('exercise-answer').value='I eat strawberries';run('checkExercise()');
        assert.equal(element('exercise-next').disabled,true);assert.match(element('exercise-feedback').textContent,/Нові слова/);
        const model=run('session.exercise.lessons[session.exercise.index].preference || session.exercise.lessons[session.exercise.index].variants[1]');
        element('exercise-answer').value=model;run('checkExercise()');assert.equal(element('exercise-next').disabled,false);
        assert.equal(run('learned.size'),index+2,'Only completed sixth steps are persisted');
      }
      element('exercise-next').onclick();
    }
  }
  assert.equal(run('session.exercise.step'),6);assert.equal(run('learned.size'),4);
  assert.ok(element('app').innerHTML.includes('Шість кроків пройдено'));
  assert.equal(storage.get('word-cottage-personal-words'),originalPersonal);
  assert.ok(JSON.parse(storage.get('word-cottage-learned')).includes(challengedId));
  const reload=fixture(storage,undefined,true);assert.equal(reload.run('learned.size'),4);
  element('exercise-review').onclick();assert.equal(run('session.mode'),'steps');
  assert.equal(run('session.exercise.step'),0);assert.equal(run('session.queue.length'),2);
  element('back').onclick();assert.equal(run('screen'),'stage-one');

  // Every dictionary card, including pairs, punctuation and custom phrases, has
  // a solvable gap, builder and own-sentence model with no invented translation.
  run(`for(const word of words){
    const lesson=wordLesson(word),state={exercise:{lessons:[lesson]}};
    if(lesson.before+word.en+lesson.after!==lesson.sentence)throw Error('Broken gap '+word.id);
    if(!/[а-яіїєґ]/i.test(lesson.translation))throw Error('Missing Ukrainian '+word.id);
    for(const variant of lesson.variants){if(ownSentenceResult(variant,lesson,state).kind!=='correct')throw Error('Unsolvable own sentence '+word.id);}
    if(normalizeSentence(sentenceTokens(lesson.sentence).join(' '))!==normalizeSentence(lesson.sentence))throw Error('Unsolvable builder '+word.id);
  }`);
  assert.equal(run('normalizeAnswer("  I’M   FINE! ")'),"i'm fine");
  assert.equal(run('wordLesson(words.find(w=>w.en==="apple")).sentence'),'I eat an apple.');
  assert.equal(run('wordLesson(words.find(w=>w.id==="verbs-0")).sentence'),'I want to be happy.');
  assert.match(run('wordLesson(words.find(w=>w.category==="custom")).sentence'),/^I say/);
  assert.equal(run('wordLesson({en:"orange",uk:"помаранчевий",category:"a1-colors"}).sentence'),'This bag is orange.');

  // Unrecognized but familiar-word sentences get explicit self-assessment,
  // without pretending local checks can evaluate arbitrary English grammar.
  run('start(["a1-fruit"],false,false,1,["a1-fruit-apple"],"steps");session.exercise.step=5;renderExercise()');
  element('exercise-answer').value='Apple I eat an';run('checkExercise()');
  assert.equal(element('exercise-self-check').hidden,false);assert.equal(element('exercise-next').disabled,true);
  const sizeBefore=run('learned.size');element('confirm-self-check').onclick();element('exercise-next').onclick();
  assert.equal(run('learned.size'),sizeBefore);assert.equal(run('session.exercise.completed.size'),0);
  assert.equal(run('session.exercise.selfChecked.size'),1);
  assert.match(element('app').innerHTML,/не позначено автоматично/);

  run('showSectionWords(["a1-fruit"]);chooseAmount(["a1-fruit"])');
  element('practice-only-new').checked=true;element('practice-only-new').onchange();
  element('start-session').onclick();assert.equal(run('selection.deck.some(w=>learned.has(w.id))'),false);
  element('back').onclick();assert.equal(element('practice-mode').value,'steps');
  run('start(["a1-fruit"],false,true,1,["a1-fruit-apple"],"steps")');assert.match(element('app').innerHTML,/Немає слів/);
  assert.throws(()=>run('start(["a1-fruit"],false,false,1,null,"invalid")'),/Невідомий режим/);

  // Render user-controlled vocabulary safely in examples, hints and prompts.
  run('words.push({id:"unsafe",category:"nouns",en:"<img onerror=alert(1)>",uk:"<script>слово</script>"});start(["nouns"],false,false,1,["unsafe"],"steps")');
  assert.doesNotMatch(element('app').innerHTML,/<img onerror|<script>слово/);
  assert.match(element('app').innerHTML,/&lt;img/);
  console.log('Passed: default six-step route through exact manual selection and swipes; answer gates, retries, recall, gap, token builder, own sentences and self-check; all dictionary cards solvable, hints, audio, new-word filter, safe rendering, preserved personal words, delayed progress and reload, repetition and legacy cards.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
