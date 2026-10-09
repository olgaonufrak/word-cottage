const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
async function main(){
  // Previously saved personal words survive the same word being added to Stage 4.
  const storage=new Map([
    ['word-cottage-personal-words',JSON.stringify([{en:'workstation',uk:'моє робоче місце'}])],
    ['word-cottage-learned',JSON.stringify(['custom-workstation','nouns-0','a1-greetings-hello','a2-money-money','a3-health-health'])]
  ]);
  const {run,element}=fixture(storage,undefined,true);
  const sections=JSON.parse(run('JSON.stringify(stageFourSections)'));
  assert.deepEqual(sections.map(s=>s.name),['Office','Synonyms','Materials and Fabrics','Dreams and Wishes','Rules and Prohibitions','Geography','Environment','Rural Life','Farm and Garden','Sea and Beach','Mountains and Forests','Space','Feelings and Sensations','Thoughts and Beliefs','Successes and Failures']);
  assert.equal(run('learned.size'),5);assert.equal(run("words.find(w=>w.id==='custom-workstation').uk"),'моє робоче місце');
  assert.equal(run('words.length'),3031);assert.equal(run('new Set(words.map(w=>w.id)).size'),run('words.length'));
  assert.equal(run('basicCategories().length'),5);
  for(const [stage,total] of [[1,649],[2,781],[3,750],[4,450]])assert.equal(run(`words.filter(w=>categories.find(c=>c.id===w.category)?.stage===${stage}).length`),total);
  for(const section of sections){
    assert.equal(section.ukTitle,section.ukTitle.toLowerCase());assert.match(section.ukTitle,/[а-яіїєґ]/);
    assert.equal(run(`categories.find(c=>c.id===${JSON.stringify(section.id)}).stage`),4);
    const list=JSON.parse(run(`JSON.stringify(words.filter(w=>w.category===${JSON.stringify(section.id)}))`));
    assert.equal(list.length,30,section.name);assert.equal(new Set(list.map(w=>w.en.toLowerCase())).size,30,section.name);
    for(const word of list){
      assert.ok(word.en);assert.equal(word.en,word.en.trim());assert.equal(word.uk,word.uk.trim());
      assert.match(word.uk,/[а-яіїєґ]/);assert.doesNotMatch(word.en+word.uk,/[|<>`]/);
      assert.equal(word.id,section.id+'-'+encodeURIComponent(word.en.toLowerCase()));
      if(section.id==='a4-synonyms')assert.match(word.en,/\S+ — \S+/);
    }
  }
  const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  assert.match(index,/stage4-data\.js\?v=20261009-vocabulary/);assert.match(index,/id="word-total">3030/);
  assert.equal((element('app').innerHTML.match(/class="group-card"/g)||[]).length,2);
  element('everyday-group').onclick();assert.doesNotMatch(element('app').innerHTML,/Поки без слів/);
  element('open-stage-four').onclick();assert.equal(run('screen'),'stage-four');assert.equal(run('dailyView'),'stage4');
  assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,15);
  let position=-1;
  for(const section of sections){const next=element('app').innerHTML.indexOf(section.name);assert.ok(next>position);position=next;assert.ok(element('app').innerHTML.includes(section.ukTitle));}
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:'Google US English',lang:'en-US'},{name:'Google українська',lang:'uk-UA'}]},speak(u){window.lastSpeech=u}};reversed=true`);
  // Every card is translated and playable; audio leaves the manually selected pool intact.
  for(const section of sections){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,30);
    assert.match(element('app').innerHTML,/‹ Розділи Етапу 4/);assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
    const list=JSON.parse(run(`JSON.stringify(sectionWordPool([${JSON.stringify(section.id)}]))`));
    for(const [index,word] of list.entries()){
      assert.ok(element('app').innerHTML.includes(run(`escapeHTML(${JSON.stringify(word.uk)})`)));
      element('section-audio-'+index).onclick();assert.equal(run('window.lastSpeech.text'),word.en);assert.equal(run('window.lastSpeech.lang'),'en-US');
    }
    element('section-word-0').checked=true;element('section-word-0').onchange();
    const status=element('list-choice-count').textContent;element('section-audio-0').onclick();
    assert.equal(element('section-word-0').checked,true);assert.equal(element('list-choice-count').textContent,status);
    element('learn-section').onclick();assert.equal(element('word-count').textContent,1);assert.equal(element('count-plus').disabled,true);
    element('back').onclick();assert.equal(element('section-word-0').checked,true);
    element('learn-section').onclick();element('start-session').onclick();assert.equal(run('selection.deck.length'),1);
    assert.equal(run('selection.deck[0].id'),list[0].id);run('home()');assert.equal(run('screen'),'stage-four');
  }
  // Full pool: skipping cannot start study; five accepted cards trigger exactly a five-card session.
  element('section-a4-office').onclick();element('learn-section').onclick();
  for(const number of [5,10,20]){element('app').querySelectorAll('[data-count]').find(b=>Number(b.dataset.count)===number).onclick();assert.equal(element('word-count').textContent,number);}
  element('app').querySelectorAll('[data-count]').find(b=>b.dataset.count==='5').onclick();element('start-session').onclick();
  assert.equal(run('selection.deck.length'),30);const skipped=run('selection.deck[0].id');
  element('swipe-skip').onclick();await new Promise(r=>setTimeout(r,210));assert.equal(run('session'),null);
  for(let i=0;i<5;i++){element('swipe-learn').onclick();await new Promise(r=>setTimeout(r,210));assert.equal(run('screen'),i<4?'selection':'study');}
  assert.equal(run('session.queue.length'),5);assert.equal(run("session.queue.every(w=>w.category==='a4-office')"),true);
  assert.equal(run(`session.queue.some(w=>w.id===${JSON.stringify(skipped)})`),false);
  element('speak').onclick();assert.equal(run('window.lastSpeech.lang'),'uk-UA');assert.equal(run('window.lastSpeech.text'),run('session.queue[0].uk'));
  element('reveal').onclick();element('speak').onclick();assert.equal(run('window.lastSpeech.lang'),'en-US');
  element('direction').value='en';element('direction').onchange();element('speak').onclick();assert.equal(run('window.lastSpeech.text'),run('session.queue[0].en'));
  const learnedId=run('session.queue[0].id');run('session.flipped=true;rate(true)');
  for(let i=1;i<5;i++)run('session.flipped=true;rate(false)');
  assert.equal(element('done-home').textContent,'До розділів Етапу 4');element('review').onclick();assert.equal(run('session.queue.length'),4);
  element('back').onclick();assert.equal(run('screen'),'stage-four');
  run('showLearned()');assert.ok(element('app').innerHTML.includes(run(`escapeHTML(words.find(w=>w.id===${JSON.stringify(learnedId)}).en)`)));
  element('back').onclick();assert.equal(run('screen'),'stage-four');
  for(const [query,category] of [['carbon footprint','a4-environment'],['запаморочення','a4-sensations'],['commence','a4-synonyms'],['сузір’я','a4-space']])assert.ok(run(`matchingWords(${JSON.stringify(query)}).some(w=>w.category===${JSON.stringify(category)})`));
  const reload=fixture(storage,undefined,true);assert.equal(reload.run('learned.size'),6);assert.equal(reload.run("learned.has('custom-workstation')"),true);
  element('stage-four-back').onclick();element('open-stage-three').onclick();assert.equal(run('screen'),'stage-three');
  run('showBasics();picker()');assert.equal(element('app').querySelectorAll('.pick-options input').length,5);assert.doesNotMatch(element('app').innerHTML,/Materials and Fabrics/);
  console.log('Passed: 15 ordered bilingual Stage 4 sections, 450 translated cards and synonym pairs, stable IDs, English audio for every card, exact manual pools, skipped-card exclusion, five-card study, both directions, repetition, Stage 4 navigation, search, preserved personal words and progress.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
