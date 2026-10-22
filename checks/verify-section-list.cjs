const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
async function main(){
  const storage=new Map([['word-cottage-personal-words',JSON.stringify([{en:'myword',uk:'моє слово'},{en:'otherword',uk:'інше слово'}])]]);
  const f=fixture(storage,undefined,true),{run,element}=f;
  element('basics-group').onclick();
  for(const tile of element('app').querySelectorAll('[data-category]')){
    tile.onclick();assert.equal(run('screen'),'section-words');assert.equal(run('session'),null);
    const expected=run(`words.filter(w=>w.category===${JSON.stringify(tile.dataset.category)}).length`);
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,expected);
    assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
    element('learn-section').onclick();assert.equal(run('screen'),'amount');
    assert.match(element('count-available').textContent,new RegExp(String(expected)));
    element('back').onclick();assert.equal(run('screen'),'section-words');
  }
  // A1 sections all show their entire list before any quantity prompt.
  run('showStageOne()');
  const sections=JSON.parse(run('JSON.stringify(stageOneSections)'));
  for(const section of sections){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    const expected=run(`words.filter(w=>w.category===${JSON.stringify(section.id)}).length`);
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,expected);
    element('back').onclick();assert.equal(run('screen'),'stage-one');
  }
  // Stage 4 lists open before quantity choice and keep their return route.
  const savedWords=run('words.length'),savedProgress=JSON.stringify([...storage]);
  run('showDailyStages()');element('open-stage-four').onclick();
  assert.equal(run('screen'),'stage-four');assert.equal(run('dailyView'),'stage4');
  const stageFour=JSON.parse(run('JSON.stringify(stageFourSections)'));
  assert.equal(stageFour.length,15);
  assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,15);
  for(const section of stageFour){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,30);
    assert.match(element('app').innerHTML,/‹ Розділи Етапу 4/);
    assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);assert.match(element('app').innerHTML,/id="learn-section"/);
    assert.equal(run('session'),null);assert.equal(run('selection'),null);
    element('back').onclick();assert.equal(run('screen'),'stage-four');
  }
  assert.equal(run('words.length'),savedWords);assert.equal(JSON.stringify([...storage]),savedProgress);
  element('stage-four-back').onclick();assert.equal(run('screen'),'daily-stages');
  element('open-stage-three').onclick();assert.equal(run('screen'),'stage-three');
  run('showBasics();picker()');assert.doesNotMatch(element('app').innerHTML,/Materials and Fabrics/);
  // The existing empty-list guard still works for a personal dictionary without words.
  const empty=fixture(new Map(),undefined,true);
  empty.run("ensurePersonalCategory();showSectionWords(['custom'])");
  assert.match(empty.element('app').innerHTML,/поки немає слів/);
  assert.doesNotMatch(empty.element('app').innerHTML,/id="(?:learn-section|word-count)"/);
  assert.equal(empty.run('session'),null);empty.element('back').onclick();assert.equal(empty.run('screen'),'home');
  // English audio is independent of checkbox selection and study direction, in every list.
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:'Google українська',lang:'uk-UA'},{name:'Google US English',lang:'en-US'}]},speak(u){window.lastSpeech=u}};reversed=true`);
  for(const ids of [['nouns'],['a1-greetings'],['custom'],['nouns','verbs']]){
    run('showSectionWords('+JSON.stringify(ids)+','+(ids.length>1)+')');
    const list=JSON.parse(run('JSON.stringify(sectionWordPool('+JSON.stringify(ids)+'))'));
    assert.equal((element('app').innerHTML.match(/class="word-audio section-word-audio"/g)||[]).length,list.length);
    assert.doesNotMatch(element('app').innerHTML,/<label class="section-word-choice">(?:(?!<\/label>)[\s\S])*<button/);
    element('section-word-0').checked=true;element('section-word-0').onchange();
    const status=element('list-choice-count').textContent;
    for(let index=0;index<list.length;index++){
      element('section-audio-'+index).onclick();
      assert.equal(run('window.lastSpeech.text'),list[index].en);
      assert.equal(run('window.lastSpeech.lang'),'en-US');
    }
    assert.equal(element('section-word-0').checked,true);assert.equal(element('section-word-1').checked,false);
    assert.equal(element('list-choice-count').textContent,status);assert.equal(run('learned.size'),0);
  }
  // Checked words start directly, include the full selection, and preserve list order.
  run("showSectionWords(['a1-days'])");
  const ids=JSON.parse(run("JSON.stringify(words.filter(w=>w.category==='a1-days').slice(0,3).map(w=>w.id))"));
  for(let i=0;i<3;i++){element('section-word-'+i).checked=true;element('section-word-'+i).onchange();}
  assert.match(element('list-choice-count').textContent,/Обрано: 3/);assert.equal(run('learned.size'),0);
  assert.doesNotMatch(element('app').innerHTML,/id="(?:list-study-mode|list-practice-mode)"/);
  element('learn-section').onclick();
  assert.equal(run('screen'),'exercises');assert.equal(run('session.mode'),'steps');assert.equal(run('selection'),null);
  assert.doesNotMatch(element('app').innerHTML,/id="(?:word-count|swipe-card|start-session)"/);
  assert.deepEqual(JSON.parse(run('JSON.stringify(session.queue.map(w=>w.id))')),ids);
  assert.equal(run('learned.size'),0,'Opening selected words must not mark them learned');
  run('session.exercise.step=6;renderExerciseDone()');
  element('exercise-restart').onclick();assert.deepEqual(JSON.parse(run('JSON.stringify(session.queue.map(w=>w.id))')),ids);
  // Select all means all 100 cards; clearing all restores quantity and swipe selection.
  run("showSectionWords(['nouns'])");assert.doesNotMatch(element('app').innerHTML,/id="(?:list-study-mode|list-practice-mode)"/);
  assert.match(element('app').innerHTML,/<div class="section-list-actions">[\s\S]*id="select-all-words-bottom"[\s\S]*id="learn-section"/);
  element('select-all-words-bottom').onclick();assert.equal(element('section-word-99').checked,true);
  assert.match(element('list-choice-count').textContent,/Обрано: 100/);
  element('learn-section').onclick();
  assert.equal(run('screen'),'exercises');assert.equal(run('session.queue.length'),100);assert.equal(run('selection'),null);
  // Selecting / clearing all restores the whole-section mode.
  run("showSectionWords(['nouns'])");element('select-all-words').onclick();assert.equal(element('section-word-99').checked,true);
  element('clear-word-choice').onclick();assert.equal(element('section-word-99').checked,false);
  assert.doesNotMatch(element('app').innerHTML,/id="(?:list-study-mode|list-practice-mode)"/);
  element('learn-section').onclick();assert.match(element('count-available').textContent,/100/);
  for(const n of [5,10,20]){const preset=element('app').querySelectorAll('[data-count]').find(button=>Number(button.dataset.count)===n);preset.onclick();assert.equal(element('word-count').textContent,n);}
  element('practice-mode').value='cards';element('start-session').onclick();assert.equal(run('selection.deck.length'),100);
  // Mixed: category selection -> full list -> immediate study of the checked words.
  run('showBasics();picker()');assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
  const inputs=element('app').querySelectorAll('.pick-options input');inputs.forEach(input=>input.checked=false);inputs[0].onchange();assert.equal(element('start-mix').disabled,true);
  inputs.filter(input=>['nouns','verbs'].includes(input.value)).forEach(input=>input.checked=true);inputs[0].onchange();element('start-mix').onclick();
  assert.equal(run('screen'),'section-words');assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,200);
  for(const index of [0,100]){element('section-word-'+index).checked=true;element('section-word-'+index).onchange();}
  element('learn-section').onclick();assert.equal(run('screen'),'exercises');assert.equal(run('session.mixed'),true);assert.equal(run('session.queue.length'),2);
  assert.equal(run("new Set(session.queue.map(w=>w.category)).size"),2);assert.equal(run('selection'),null);
  // Personal words use the same direct route with no quantity prompt.
  run("showSectionWords(['custom'])");element('section-word-1').checked=true;element('section-word-1').onchange();
  const personalId=run("sectionWordPool(['custom'])[1].id");element('learn-section').onclick();
  assert.equal(run('screen'),'exercises');assert.equal(run('session.queue.length'),1);assert.equal(run('session.queue[0].id'),personalId);
  // Exact-card search still starts directly; unsafe custom translations are escaped in the list.
  run("addPersonalWord({en:'safeexample',uk:'<img src=x onerror=alert(1)>'});showSectionWords(['custom'])");
  assert.doesNotMatch(element('app').innerHTML,/<img/);assert.match(element('app').innerHTML,/&lt;img/);
  run("learnSearchWord('custom-myword')");assert.equal(run('session.queue.length'),1);
  assert.throws(()=>run("suggestWords(['nouns'],false,1,['verbs-0'])"));
  console.log('Passed: bilingual lists, direct six-step study of every checked word without a mode dropdown, select-all and cleared choices, personal and mixed sets, quantity and swipes for unselected lists, exact restart pools, safe rendering and progress.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
