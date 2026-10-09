const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
const pause=()=>new Promise(resolve=>setTimeout(resolve,200));
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
  // Empty Stage 4 topics open safely, keep progress, and return to their stage.
  const savedWords=run('words.length'),savedProgress=JSON.stringify([...storage]);
  run('showDailyStages()');element('open-stage-four').onclick();
  assert.equal(run('screen'),'stage-four');assert.equal(run('dailyView'),'stage4');
  const emptySections=JSON.parse(run('JSON.stringify(stageFourSections)'));
  assert.equal(emptySections.length,15);
  assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,15);
  for(const section of emptySections){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    assert.match(element('app').innerHTML,/поки немає слів/);
    assert.match(element('app').innerHTML,/‹ Розділи Етапу 4/);
    assert.doesNotMatch(element('app').innerHTML,/id="(?:learn-section|word-count|select-all-words)"|section-word-option/);
    assert.equal(run('session'),null);assert.equal(run('selection'),null);
    element('back').onclick();assert.equal(run('screen'),'stage-four');
  }
  assert.equal(run('words.length'),savedWords);assert.equal(JSON.stringify([...storage]),savedProgress);
  element('stage-four-back').onclick();assert.equal(run('screen'),'daily-stages');
  element('open-stage-three').onclick();assert.equal(run('screen'),'stage-three');
  run('showBasics();picker()');assert.doesNotMatch(element('app').innerHTML,/Materials and Fabrics/);
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
  // Manual choices are bounded, survive Back, and restrict every swipe and study card.
  run("showSectionWords(['a1-days'])");
  const ids=JSON.parse(run("JSON.stringify(words.filter(w=>w.category==='a1-days').slice(0,3).map(w=>w.id))"));
  for(let i=0;i<3;i++){element('section-word-'+i).checked=true;element('section-word-'+i).onchange();}
  assert.match(element('list-choice-count').textContent,/Обрано: 3/);assert.equal(run('learned.size'),0);
  element('learn-section').onclick();assert.equal(element('word-count').textContent,3);assert.equal(element('count-plus').disabled,true);
  assert.equal(element('app').querySelectorAll('[data-count]').every(button=>button.disabled),true);
  element('back').onclick();assert.equal(element('section-word-0').checked,true);assert.equal(element('section-word-3').checked,false);
  element('learn-section').onclick();element('count-minus').onclick();element('start-session').onclick();
  assert.equal(run('selection.target'),2);assert.deepEqual(JSON.parse(run('JSON.stringify(selection.deck.map(w=>w.id).sort())')),ids.slice().sort());
  element('back').onclick();assert.equal(element('word-count').textContent,2);
  element('start-session').onclick();element('swipe-skip').onclick();await pause();
  element('swipe-learn').onclick();await pause();assert.equal(run('screen'),'selection');
  element('swipe-learn').onclick();await pause();assert.equal(run('screen'),'study');
  assert.equal(run('session.queue.length'),2);assert.equal(run('session.queue.every(w=>'+JSON.stringify(ids)+'.includes(w.id))'),true);
  run('session.flipped=true;rate(true);session.flipped=true;rate(false)');
  element('restart').onclick();assert.equal(run('session.queue.length'),2);assert.equal(run('session.queue.every(w=>'+JSON.stringify(ids)+'.includes(w.id))'),true);
  // Selecting / clearing all restores the whole-section mode.
  run("showSectionWords(['nouns'])");element('select-all-words').onclick();assert.equal(element('section-word-99').checked,true);
  element('clear-word-choice').onclick();assert.equal(element('section-word-99').checked,false);
  element('learn-section').onclick();assert.match(element('count-available').textContent,/100/);
  for(const n of [5,10,20]){const preset=element('app').querySelectorAll('[data-count]').find(button=>Number(button.dataset.count)===n);preset.onclick();assert.equal(element('word-count').textContent,n);}
  element('start-session').onclick();assert.equal(run('selection.deck.length'),100);
  // Mixed: category selection -> full list -> size -> exact manually selected pool.
  run('showBasics();picker()');assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
  const inputs=element('app').querySelectorAll('.pick-options input');inputs.forEach(input=>input.checked=false);inputs[0].onchange();assert.equal(element('start-mix').disabled,true);
  inputs.filter(input=>['nouns','verbs'].includes(input.value)).forEach(input=>input.checked=true);inputs[0].onchange();element('start-mix').onclick();
  assert.equal(run('screen'),'section-words');assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,200);
  for(const index of [0,100]){element('section-word-'+index).checked=true;element('section-word-'+index).onchange();}
  element('learn-section').onclick();element('start-session').onclick();assert.equal(run('selection.mixed'),true);assert.equal(run('selection.deck.length'),2);
  assert.equal(run("new Set(selection.deck.map(w=>w.category)).size"),2);
  // Exact-card search still starts directly; unsafe custom translations are escaped in the list.
  run("addPersonalWord({en:'safeexample',uk:'<img src=x onerror=alert(1)>'});showSectionWords(['custom'])");
  assert.doesNotMatch(element('app').innerHTML,/<img/);assert.match(element('app').innerHTML,/&lt;img/);
  run("learnSearchWord('custom-myword')");assert.equal(run('session.queue.length'),1);
  assert.throws(()=>run("suggestWords(['nouns'],false,1,['verbs-0'])"));
  console.log('Passed: complete bilingual section lists, A1/basic/personal/mixed navigation, manual choice persistence, bounded quantities and presets, exact swipe/study/restart pools, unchanged progress, safe rendering, direct search study.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
