const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
async function main(){
  // A formerly personal word must retain its ID and learned state when the new course includes it.
  const storage=new Map([['word-cottage-personal-words',JSON.stringify([{en:'courgette',uk:'мій переклад кабачка'}])],['word-cottage-learned',JSON.stringify(['custom-courgette','nouns-0'])]]);
  const f=fixture(storage,undefined,true),{run,element}=f;
  const sections=JSON.parse(run('JSON.stringify(stageOneSections)'));
  const expected=['Introductions and Greetings','Saying Goodbye and Thank You','Common Phrases','Pronouns','Question Words','Numbers','Colors','Days of the Week','Months and Seasons','Time','Family and Relatives','Countries and Nationalities','People and Appearance','Basic Verbs','Daily Activities','Morning and Evening Routines','House and Apartment','Rooms','Furniture','Food and Groceries','Drinks and Beverages','Fruits and Berries','Vegetables','Clothes and Accessories','Shoes and Footwear','Weather','Adjectives','Shapes and Sizes','Opposites (Antonyms)'];
  assert.deepEqual(sections.map(s=>s.name),expected);
  assert.equal(run('basicCategories().length'),5);assert.equal(run('learned.size'),2);
  assert.equal(run("words.find(w=>w.id==='custom-courgette').uk"),'мій переклад кабачка');
  let total=0;
  for(const section of sections){
    assert.equal(section.ukTitle,section.ukTitle.toLowerCase());assert.match(section.ukTitle,/[а-яіїєґ]/);
    const list=JSON.parse(run(`JSON.stringify(words.filter(w=>w.category===${JSON.stringify(section.id)}))`));
    assert.ok(list.length>=10);total+=list.length;
    assert.equal(new Set(list.map(w=>w.en.toLowerCase())).size,list.length,section.name+' duplicates');
    for(const word of list){assert.ok(word.en.trim());assert.match(word.uk,/[а-яіїєґ]/);assert.ok(word.id.startsWith(section.id+'-'));}
  }
  assert.equal(run('new Set(words.map(w=>w.id)).size'),run('words.length'));
  assert.equal(run('words.length'),401+total+run("words.filter(w=>categories.find(c=>c.id===w.category)?.stage>1).length"));
  assert.equal(run("words.filter(w=>w.category==='a1-days').length"),11);
  assert.equal(run("words.filter(w=>w.category==='a1-months').length"),18);
  assert.equal(run("words.find(w=>w.category==='a1-numbers'&&w.en==='forty').uk"),'сорок');
  assert.equal(run("words.find(w=>w.category==='a1-time'&&w.en==='half past two').uk"),'пів на третю');
  element('everyday-group').onclick();assert.equal(run('screen'),'daily-stages');assert.equal((element('app').innerHTML.match(/Поки без слів/g)||[]).length,1);
  element('open-stage-one').onclick();assert.equal(run('screen'),'stage-one');assert.equal((element('app').innerHTML.match(/class="stage-section"/g)||[]).length,29);
  for(const section of sections){assert.ok(element('app').innerHTML.includes(section.name));assert.ok(element('app').innerHTML.includes(section.ukTitle));}
  element('section-a1-greetings').onclick();assert.equal(run('screen'),'section-words');element('learn-section').onclick();assert.equal(run('screen'),'amount');assert.match(element('app').innerHTML,/знайомство та привітання/);
  element('count-minus').onclick();assert.equal(element('word-count').textContent,9);
  element('back').onclick();assert.equal(run('screen'),'section-words');element('back').onclick();assert.equal(run('screen'),'stage-one');
  // Every section reaches the existing count selector and an isolated swipe deck.
  for(const section of sections){element('section-'+section.id).onclick();assert.equal(run('screen'),'section-words');element('learn-section').onclick();assert.equal(run('screen'),'amount');element('start-session').onclick();assert.equal(run('screen'),'selection');assert.equal(run(`selection.deck.every(w=>w.category===${JSON.stringify(section.id)})`),true);run('home()');assert.equal(run('screen'),'stage-one');}
  element('section-a1-greetings').onclick();element('learn-section').onclick();for(let i=0;i<9;i++)element('count-minus').onclick();element('start-session').onclick();const selected=run('selection.deck[0].id');element('swipe-learn').onclick();await new Promise(resolve=>setTimeout(resolve,260));
  assert.equal(run('screen'),'study');assert.equal(run('session.queue.length'),1);assert.equal(run('session.queue[0].id'),selected);
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.speechSynthesis={cancel(){},getVoices(){return [{name:'Google US English',lang:'en-US'},{name:'Google українська',lang:'uk-UA'}]},speak(u){window.lastSpeech=u}}`);
  element('speak').onclick();assert.equal(run('window.lastSpeech.text'),run('session.queue[0].en'));assert.equal(run('window.lastSpeech.lang'),'en-US');
  element('reveal').onclick();element('speak').onclick();assert.equal(run('window.lastSpeech.text'),run('session.queue[0].uk'));assert.equal(run('window.lastSpeech.lang'),'uk-UA');
  run('session.flipped=true;rate(true)');assert.equal(run('learned.size'),3);element('done-home').onclick();assert.equal(run('screen'),'stage-one');
  run('showLearned()');assert.ok(element('app').innerHTML.includes(run(`escapeHTML(words.find(w=>w.id===${JSON.stringify(selected)}).en)`)));element('back').onclick();assert.equal(run('screen'),'stage-one');
  element('stage-one-back').onclick();assert.equal(run('screen'),'daily-stages');element('daily-back').onclick();element('basics-group').onclick();
  assert.equal((element('app').innerHTML.match(/data-category=/g)||[]).length,5);assert.doesNotMatch(element('app').innerHTML,/Introductions and Greetings/);
  run('picker()');assert.doesNotMatch(element('app').innerHTML,/Introductions and Greetings/);element('start-mix').onclick();assert.equal((element('app').innerHTML.match(/class="section-word-option"/g)||[]).length,401);
  assert.ok(run("matchingWords('куртка').some(w=>w.category==='a1-clothes')"));assert.ok(run("matchingWords('nice to meet you').some(w=>w.category==='a1-greetings')"));
  const reload=fixture(storage,undefined,true);assert.equal(reload.run('learned.size'),3);assert.equal(reload.run("learned.has('custom-courgette')"),true);
  console.log(`Passed: 29 exact bilingual sections, ${total} translated cards, unique stable IDs, complete days/months, all section decks, swipe/study/navigation/progress, search integration, original beginner sections and personal-word migration.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
