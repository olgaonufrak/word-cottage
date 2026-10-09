const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs');
async function main(){
  const storage=new Map([['word-cottage-personal-words',JSON.stringify([{en:'highlighter',uk:'мій маркер'}])],['word-cottage-learned',JSON.stringify(['custom-highlighter','nouns-0','a1-greetings-hello'])]]);
  const f=fixture(storage,undefined,true),{run,element}=f;
  const expected=['Prepositions','Conjunctions','Parts of the Body','Emotions and Feelings','Communication with People','Requests and Apologies','City','Buildings and Places','Directions and Locations','Transportation','Shopping','Shops and Stores','Money and Payments','Restaurants and Cafés','Ordering Food','School and Education','Stationery and School Supplies','Jobs and Professions','Hobbies and Interests','Sports','Sleep and Rest','Animals','Nature','Relationships and Friendship','Phones and Communication','Actions and Movements','Irregular Verbs','Adverbs','Everyday Expressions'];
  const sections=JSON.parse(run('JSON.stringify(stageTwoSections)'));
  assert.deepEqual(sections.map(section=>section.name),expected);
  assert.equal(run('learned.size'),3);assert.equal(run("words.find(w=>w.id==='custom-highlighter').uk"),'мій маркер');
  assert.equal(run('new Set(words.map(w=>w.id)).size'),run('words.length'));
  assert.equal(run('basicCategories().length'),5);assert.equal(run("words.filter(w=>categories.find(c=>c.id===w.category)?.stage===1).length"),649);
  let added=0;
  for(const section of sections){
    assert.equal(section.ukTitle,section.ukTitle.toLowerCase());assert.match(section.ukTitle,/[а-яіїєґ]/);
    const list=JSON.parse(run(`JSON.stringify(words.filter(w=>w.category===${JSON.stringify(section.id)}))`));
    assert.ok(list.length>=20,section.name);added+=list.length;
    assert.equal(new Set(list.map(w=>w.en.toLowerCase())).size,list.length,section.name);
    for(const word of list){assert.ok(word.en.trim());assert.match(word.uk,/[а-яіїєґ]/);assert.equal(word.id,section.id+'-'+encodeURIComponent(word.en.toLowerCase()));}
  }
  assert.equal(added,781);assert.equal(run('words.length'),1831+run("words.filter(w=>categories.find(c=>c.id===w.category)?.stage>=3).length"));
  const index=fs.readFileSync(require('node:path').join(__dirname,'../dist',"index.html"),'utf8');
  assert.ok(index.indexOf('stage2-data.js')<index.indexOf('stage3-data.js'));assert.ok(index.indexOf('stage3-data.js')<index.indexOf('search.js'));assert.match(index,/id="word-total">3030/);
  element('everyday-group').onclick();assert.equal((element('app').innerHTML.match(/class="daily-stage stage-ready"/g)||[]).length,4);assert.equal((element('app').innerHTML.match(/Поки без слів/g)||[]).length,0);
  element('open-stage-two').onclick();assert.equal(run('screen'),'stage-two');assert.equal(run('dailyView'),'stage2');
  assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,29);
  for(const section of sections){assert.ok(element('app').innerHTML.includes(section.name));assert.ok(element('app').innerHTML.includes(section.ukTitle));}
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:'Google US English',lang:'en-US'}]},speak(u){window.lastSpeech=u}}`);
  // Every new section uses the complete list, English audio, count picker and isolated swipe deck.
  for(const section of sections){
    element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');
    const size=run(`words.filter(w=>w.category===${JSON.stringify(section.id)}).length`);
    assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,size);
    assert.doesNotMatch(element('app').innerHTML,/id="word-count"/);
    element('section-audio-0').onclick();assert.equal(run('window.lastSpeech.lang'),'en-US');
    assert.equal(run('window.lastSpeech.text'),run(`words.find(w=>w.category===${JSON.stringify(section.id)}).en`));
    element('section-word-0').checked=true;element('section-word-0').onchange();
    element('learn-section').onclick();assert.equal(element('word-count').textContent,1);
    element('start-session').onclick();assert.equal(run('selection.deck.length'),1);
    assert.equal(run('selection.deck[0].category'),section.id);
    run('home()');assert.equal(run('screen'),'stage-two');
  }
  element('section-a2-animals').onclick();element('learn-section').onclick();
  const preset=element('app').querySelectorAll('[data-count]').find(button=>button.dataset.count==='5');preset.onclick();element('start-session').onclick();
  for(let i=0;i<5;i++){element('swipe-learn').onclick();await new Promise(resolve=>setTimeout(resolve,210));assert.equal(run('screen'),i<4?'selection':'study');}
  assert.equal(run('session.queue.length'),5);assert.equal(run("session.queue.every(w=>w.category==='a2-animals')"),true);
  assert.match(element('app').innerHTML,/id="back">‹ Розділи Етапу 2/);
  const selected=run('session.queue[0].id');run('session.flipped=true;rate(true)');
  for(let i=1;i<5;i++)run('session.flipped=true;rate(false)');
  assert.equal(element('done-home').textContent,'До розділів Етапу 2');element('done-home').onclick();assert.equal(run('screen'),'stage-two');
  run('showLearned()');assert.ok(element('app').innerHTML.includes(run(`escapeHTML(words.find(w=>w.id===${JSON.stringify(selected)}).en)`)));element('back').onclick();assert.equal(run('screen'),'stage-two');
  assert.ok(run("matchingWords('безконтактна').some(w=>w.category==='a2-money')"));assert.ok(run("matchingWords('highlighter').some(w=>w.category==='a2-stationery')"));
  assert.equal(fixture(storage,undefined,true).run('learned.size'),4);
  element('stage-two-back').onclick();element('open-stage-one').onclick();assert.equal(run('screen'),'stage-one');
  run('showBasics();picker()');assert.equal(element('app').querySelectorAll('.pick-options input').length,5);assert.doesNotMatch(element('app').innerHTML,/Prepositions/);
  assert.equal(run('words.filter(w=>categories.find(c=>c.id===w.category)?.stage===4).length'),450);
  console.log('Passed: 29 ordered bilingual Stage 2 sections, 781 translated cards, stable unique IDs, all list/audio/manual-choice/count/swipe routes, five-word target and progress, correct Stage 2 return navigation, search, personal-word migration, unchanged Stage 1 and 450 Stage 4 cards.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
