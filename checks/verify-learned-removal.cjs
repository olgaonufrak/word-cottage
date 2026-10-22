const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
async function main(){
  // The landing entry preserves its return route through removal, empty state and prior daily navigation.
  const mainStorage=new Map([['word-cottage-learned','["nouns-0","nouns-1"]']]);
  const main=fixture(mainStorage,undefined,true);
  assert.equal((main.element('app').innerHTML.match(/class="group-card"/g)||[]).length,2);
  assert.match(main.element('app').innerHTML,/id="landing-learned-words"/);
  assert.match(main.element('app').innerHTML,/<span class="learned-count">2<\/span>/);
  main.element('landing-learned-words').onclick();assert.equal(main.run('screen'),'learned');
  assert.equal(main.element('back').textContent,'‹ На головну');
  main.element('remove-learned-0').onclick();main.element('back').onclick();assert.equal(main.run('screen'),'landing');
  assert.match(main.element('app').innerHTML,/<span class="learned-count">1<\/span>/);
  const mainReload=fixture(mainStorage,undefined,true);assert.match(mainReload.element('app').innerHTML,/<span class="learned-count">1<\/span>/);
  main.element('everyday-group').onclick();main.element('open-stage-four').onclick();
  main.element('stage-four-back').onclick();main.element('daily-back').onclick();
  main.element('landing-learned-words').onclick();main.element('remove-learned-0').onclick();
  main.element('learned-start').onclick();assert.equal(main.run('screen'),'landing');
  assert.match(main.element('app').innerHTML,/<span class="learned-count">0<\/span>/);
  main.element('basics-group').onclick();main.element('learned-words').onclick({type:'click'});
  main.element('back').onclick();assert.equal(main.run('screen'),'home');
  // Daily overview and all four stages keep their origin after removal and from an empty learned list.
  for(const stage of [0,1,2,3,4]){
    const daily=fixture(new Map([['word-cottage-learned','["nouns-0"]']]),undefined,true);
    daily.run(stage?`showDailyStage(${stage})`:'showDailyStages()');const origin=daily.run('screen');
    daily.element('daily-learned-words').onclick();daily.element('remove-learned-0').onclick();
    daily.element('back').onclick();assert.equal(daily.run('screen'),origin);
    assert.match(daily.element('app').innerHTML,/<span class="learned-count">0<\/span>/);
    daily.element('daily-learned-words').onclick();daily.element('learned-start').onclick();assert.equal(daily.run('screen'),origin);
  }
  const ids=['nouns-0','nouns-1','a1-fruit-apple','a2-money-money','a3-health-health','a4-office-workplace','custom-myword'];
  const storage=new Map([
    ['word-cottage-learned',JSON.stringify(ids)],
    ['word-cottage-personal-words','[{"en":"myword","uk":"моє слово"}]'],
    ['word-cottage-search-history','["apple"]'],
    ['word-cottage-voices','{"en":"test-voice"}']
  ]);
  const otherData=[...storage].filter(([key])=>key!=='word-cottage-learned');
  const {run,element}=fixture(storage,undefined,true);
  const dictionary=run('JSON.stringify(words)'),remove=id=>{
    const index=run(`words.filter(w=>learned.has(w.id)).findIndex(w=>w.id===${JSON.stringify(id)})`);
    assert.ok(index>=0);const button=element('remove-learned-'+index);button.onclick();return button;
  };
  element('basics-group').onclick();element('learned-words').onclick();
  assert.equal((element('app').innerHTML.match(/class="btn secondary remove-learned"/g)||[]).length,ids.length);
  assert.match(element('app').innerHTML,/Видалити/);
  const oldButton=remove('nouns-0');assert.equal(run('learned.size'),6);assert.equal(element('total').textContent,6);
  assert.equal(run("learned.has('nouns-1')"),true);assert.equal(run("count('nouns')"),1);
  oldButton.onclick();assert.equal(run('learned.size'),6,'A stale handler cannot remove another word');
  assert.equal(JSON.parse(storage.get('word-cottage-learned')).includes('nouns-0'),false);
  assert.equal(fixture(storage,undefined,true).run("learned.has('nouns-0')"),false);
  // Removed words from the base, every stage and the personal dictionary qualify as new again.
  for(const id of ['nouns-0',...ids.slice(2)]){
    run('showLearned()');if(id!=='nouns-0')remove(id);
    const category=run(`words.find(w=>w.id===${JSON.stringify(id)}).category`);
    run(`start([${JSON.stringify(category)}],false,true,null,null,'cards')`);
    assert.equal(run(`session.queue.some(w=>w.id===${JSON.stringify(id)})`),true);
    assert.equal(run('session.queue.some(w=>learned.has(w.id))'),false);
    run(`start([${JSON.stringify(category)}],false,true,1,[${JSON.stringify(id)}],'steps')`);
    assert.equal(run('screen'),'exercises');assert.equal(run('session.queue[0].id'),id);
    assert.equal(run(`learned.has(${JSON.stringify(id)})`),false,'Reopening exercises does not mark it learned');
  }
  run('showLearned()');remove('nouns-1');assert.equal(run('learned.size'),0);assert.equal(element('total').textContent,0);
  assert.match(element('app').innerHTML,/id="learned-start"/);assert.doesNotMatch(element('app').innerHTML,/class="learned-word"/);
  assert.equal(storage.get('word-cottage-learned'),'[]');element('learned-start').onclick();assert.equal(run('screen'),'home');
  assert.equal(element('app').innerHTML.includes('<span class="learned-count">0</span>'),true);
  assert.equal(run('JSON.stringify(words)'),dictionary);assert.deepEqual([...storage].filter(([key])=>key!=='word-cottage-learned'),otherData);
  // The word can be learned once more and is safely displayed even with a custom translation.
  run("start(['nouns'],false,true,1,['nouns-0'],'cards');session.flipped=true;rate(true);showLearned()");
  assert.equal(run("learned.has('nouns-0')"),true);assert.equal(fixture(storage,undefined,true).run('learned.size'),1);
  run("words.push({id:'custom-unsafe',category:'custom',en:'word\"<img src=x>',uk:'<script>переклад</script>'});learned.add('custom-unsafe');showLearned()");
  assert.doesNotMatch(element('app').innerHTML,/<img|<script>/);assert.match(element('app').innerHTML,/&lt;img/);
  remove('custom-unsafe');assert.equal(run("words.some(w=>w.id==='custom-unsafe')"),true);
  run('showDailyStage(4);showLearned()');element('back').onclick();assert.equal(run('screen'),'stage-four');
  console.log('Passed: per-word unlearning, updated counts and category progress, persisted removal, unchanged dictionary/personal/history/voice data, all stages and personal words reenter cards and six-step study, empty list, relearning, safe labels and return navigation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
