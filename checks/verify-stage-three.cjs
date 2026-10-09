const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
async function main(){
  // Keep personal words and learned IDs even when Stage 3 includes the same English word.
  const storage=new Map([['word-cottage-personal-words',JSON.stringify([{en:'dishwasher',uk:'моя посудомийка'}])],['word-cottage-learned',JSON.stringify(['custom-dishwasher','nouns-0','a1-greetings-hello','a2-money-money'])]]);
  const {run,element}=fixture(storage,undefined,true);
  const expected=['Personality Traits','Health and Medicine','Household Items','Household Appliances','Cleaning','Cooking','Kitchen Utensils','Travel','Airport and Air Travel','Hotel','Holidays and Tourism','Plans and the Future','Music','Movies and Television','Books and Reading','Holidays and Traditions','Computers and Technology','Internet and Social Media','Safety and Emergencies','Roads and Navigation','Birds','Plants and Flowers','Insects','Phrasal Verbs','Problems and Solutions'];
  const sections=JSON.parse(run('JSON.stringify(stageThreeSections)'));
  assert.deepEqual(sections.map(section=>section.name),expected);
  assert.equal(run('learned.size'),4);
  assert.equal(run("words.find(w=>w.id==='custom-dishwasher').uk"),'моя посудомийка');
  assert.equal(run('new Set(words.map(w=>w.id)).size'),run('words.length'));
  assert.equal(run('basicCategories().length'),5);
  for(const [stage,total] of [[1,649],[2,781],[3,750]])assert.equal(run(`words.filter(w=>categories.find(c=>c.id===w.category)?.stage===${stage}).length`),total);
  assert.equal(run('words.length'),2581);
  assert.equal(run('categories.some(c=>c.stage===4)'),false);
  for(const section of sections){
    assert.equal(section.ukTitle,section.ukTitle.toLowerCase());assert.match(section.ukTitle,/[а-яіїєґ]/);
    assert.equal(run(`categories.find(c=>c.id===${JSON.stringify(section.id)}).stage`),3);
    const list=JSON.parse(run(`JSON.stringify(words.filter(w=>w.category===${JSON.stringify(section.id)}))`));
    assert.equal(list.length,30,section.name);
    assert.equal(new Set(list.map(w=>w.en.toLowerCase())).size,list.length,section.name);
    for(const word of list){assert.equal(word.en,word.en.trim());assert.ok(word.en);assert.match(word.uk,/[а-яіїєґ]/);assert.equal(word.id,section.id+'-'+encodeURIComponent(word.en.toLowerCase()));}
  }
  // Dictionary scripts must finish before personal-word restoration and learned progress.
  const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  assert.deepEqual([...index.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(match=>match[1].split('?')[0]),['data.js','stage1-data.js','stage2-data.js','stage3-data.js','search.js','app.js']);
  assert.match(index,/id="word-total">2580/);
  assert.equal((element('app').innerHTML.match(/class="group-card"/g)||[]).length,2);
  element('everyday-group').onclick();
  assert.equal((element('app').innerHTML.match(/class="daily-stage stage-ready"/g)||[]).length,3);
  assert.equal((element('app').innerHTML.match(/Поки без слів/g)||[]).length,1);
  element('open-stage-three').onclick();assert.equal(run('screen'),'stage-three');assert.equal(run('dailyView'),'stage3');
  assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,25);
  let lastPosition=-1;
  for(const section of sections){const position=element('app').innerHTML.indexOf(section.name);assert.ok(position>lastPosition);lastPosition=position;assert.ok(element('app').innerHTML.includes(section.ukTitle));}
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:'Google US English',lang:'en-US'},{name:'Google українська',lang:'uk-UA'}]},speak(u){window.lastSpeech=u}};reversed=true`);
  // Every section exposes all translations, audio independent of choices, and an exact manual pool.
  for(const section of sections){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,30);
    assert.match(element('app').innerHTML,/‹ Розділи Етапу 3/);
    assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
    element('section-word-0').checked=true;element('section-word-0').onchange();
    const status=element('list-choice-count').textContent;
    element('section-audio-0').onclick();assert.equal(run('window.lastSpeech.lang'),'en-US');
    assert.equal(run('window.lastSpeech.text'),run(`words.find(w=>w.category===${JSON.stringify(section.id)}).en`));
    assert.equal(element('section-word-0').checked,true);assert.equal(element('list-choice-count').textContent,status);
    element('learn-section').onclick();assert.equal(element('word-count').textContent,1);assert.equal(element('count-plus').disabled,true);
    element('back').onclick();assert.equal(element('section-word-0').checked,true);
    element('learn-section').onclick();element('start-session').onclick();assert.equal(run('selection.deck.length'),1);
    assert.equal(run('selection.deck[0].category'),section.id);
    run('home()');assert.equal(run('screen'),'stage-three');
  }
  // Unselected section: full pool, five accepted cards, both directions, repetition and return navigation.
  element('section-a3-phrasal-verbs').onclick();element('learn-section').onclick();
  assert.match(element('count-available').textContent,/30/);
  element('app').querySelectorAll('[data-count]').find(button=>button.dataset.count==='5').onclick();
  element('start-session').onclick();assert.equal(run('selection.deck.length'),30);
  for(let i=0;i<5;i++){element('swipe-learn').onclick();await new Promise(resolve=>setTimeout(resolve,210));assert.equal(run('screen'),i<4?'selection':'study');}
  assert.equal(run('session.queue.length'),5);assert.equal(run("session.queue.every(w=>w.category==='a3-phrasal-verbs')"),true);
  assert.match(element('app').innerHTML,/id="back">‹ Розділи Етапу 3/);
  element('speak').onclick();assert.equal(run('window.lastSpeech.lang'),'uk-UA');assert.equal(run('window.lastSpeech.text'),run('session.queue[0].uk'));
  element('reveal').onclick();element('speak').onclick();assert.equal(run('window.lastSpeech.lang'),'en-US');
  element('direction').value='en';element('direction').onchange();element('speak').onclick();assert.equal(run('window.lastSpeech.text'),run('session.queue[0].en'));
  const selected=run('session.queue[0].id');run('session.flipped=true;rate(true)');
  for(let i=1;i<5;i++)run('session.flipped=true;rate(false)');
  assert.equal(element('done-home').textContent,'До розділів Етапу 3');
  element('review').onclick();assert.equal(run('session.queue.length'),4);
  element('back').onclick();assert.equal(run('screen'),'stage-three');
  run('showLearned()');assert.ok(element('app').innerHTML.includes(run(`escapeHTML(words.find(w=>w.id===${JSON.stringify(selected)}).en)`)));
  element('back').onclick();assert.equal(run('screen'),'stage-three');
  for(const [query,category] of [['консервний','a3-kitchen-utensils'],['run out of','a3-phrasal-verbs'],['sting','a3-insects']])assert.ok(run(`matchingWords(${JSON.stringify(query)}).some(w=>w.category===${JSON.stringify(category)})`));
  assert.equal(fixture(storage,undefined,true).run('learned.size'),5);
  element('stage-three-back').onclick();element('open-stage-one').onclick();assert.equal(run('screen'),'stage-one');
  element('stage-one-back').onclick();element('open-stage-two').onclick();assert.equal(run('screen'),'stage-two');
  run('showBasics();picker()');assert.equal(element('app').querySelectorAll('.pick-options input').length,5);assert.doesNotMatch(element('app').innerHTML,/Personality Traits/);
  console.log('Passed: 25 ordered bilingual Stage 3 sections, 750 translated cards, stable unique IDs, all complete lists/audio/manual-choice/count/swipe routes, five-card study in both directions, repetition, Stage 3 return navigation, search, preserved personal words and learned progress, unchanged Stages 1–2 and empty Stage 4.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
