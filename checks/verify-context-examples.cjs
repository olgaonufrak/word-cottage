const assert=require('node:assert/strict');
const {fixture}=require('./fixture.cjs');

async function main(){
  const {run,element,storage}=fixture(new Map(),()=>Promise.reject(Error('offline')),true);
  const cards=JSON.parse(run('JSON.stringify(words)'));
  assert.equal(cards.length,3030);
  assert.equal(run('Object.keys(contextualLessons).length'),3030);
  run(`for(const word of words){
    const lesson=wordLesson(word);
    if(!contextualLessons[word.id])throw Error('Missing example '+word.id);
    if(lesson.before+lesson.target+lesson.after!==lesson.sentence)throw Error('Broken gap '+word.id);
    for(const example of [lesson,...lesson.extra]){
      if(/I say [“"]/.test(example.sentence))throw Error('Quoted fallback '+word.id);
      if(!/[а-яіїєґ]/i.test(example.translation))throw Error('Missing sentence translation '+word.id);
      for(const token of sentenceTokens(example.sentence))if(!/[а-яіїєґ]/i.test(localSentenceTranslation(token,lesson)))throw Error('Missing offline translation '+word.id+': '+token);
    }
    if(word.en.includes(' — ')&&lesson.extra.length!==1)throw Error('Both members need examples '+word.id);
  }`);
  const sentence=(en,category)=>run(`wordLesson(words.find(w=>w.en===${JSON.stringify(en)}${category?'&&w.category==='+JSON.stringify(category):''})).sentence`);
  assert.equal(sentence('moment'),'Wait a moment, please.');
  assert.equal(sentence('get','verbs'),'I get a letter.');
  assert.equal(sentence('work','nouns'),'I have some work.');
  assert.equal(sentence('work','verbs'),'I work at home.');
  assert.equal(sentence('orange','a1-colors'),'This cup is orange.');
  assert.equal(sentence('orange','a1-fruit'),'I eat an orange.');
  assert.equal(sentence('cook','a3-cooking'),'I cook dinner.');
  assert.equal(sentence('energy-saving','a3-appliances'),'This is an energy-saving lamp.');
  assert.equal(sentence('end — finish'),'We end the lesson at five.');
  assert.equal(run('wordLesson(words.find(w=>w.en==="end — finish")).extra[0].sentence'),'I finish my work at six.');
  assert.match(run('wordLesson(words.find(w=>w.en==="I wish I had more time")).translation'),/Шкода, що/);

  run('start(["nouns"],false,false,1,[words.find(w=>w.en==="moment").id],"steps")');
  const storageBefore=JSON.stringify([...storage]);
  assert.match(element('app').innerHTML,/aria-label="Перекласти слово Wait"/);
  const expected=['Wait — чекати','a — неозначений артикль','moment — момент','please — будь ласка'];
  for(let i=0;i<4;i++){
    await element('example-word-'+i).onclick();
    assert.equal(element('example-translation').textContent,expected[i]);
    assert.equal(element('example-translation').hidden,false);
    assert.equal(element('example-word-'+i).attributes['aria-pressed'],'true');
    assert.equal(run('session.exercise.step'),0);
    assert.equal(run('session.exercise.answered'),false);
  }
  assert.equal(JSON.stringify([...storage]),storageBefore,'Word translations never save progress or personal words');
  element('exercise-next').onclick();
  element('exercise-hint').onclick();
  await element('hint-word-3').onclick();
  assert.equal(element('hint-translation').textContent,'please — будь ласка');
  assert.equal(element('exercise-next').disabled,true,'Translation is not an exercise answer');
  run('session.exercise.step=3;renderExercise()');
  assert.doesNotMatch(element('app').innerHTML,/data-sentence-word="moment"/,'Gap does not disclose the missing word');
  await element('gap-after-word-0').onclick();
  assert.equal(element('gap-translation').textContent,'please — будь ласка');
  run('session.exercise.step=4;renderExercise()');
  const token=run('session.exercise.tokens[0]');
  await element('bank-token-0').onclick();
  assert.equal(run('session.exercise.picked.length'),1);
  assert.equal(element('builder-translation').textContent,token+' — '+run('localSentenceTranslation(session.exercise.tokens[0],session.exercise.lessons[0])'));
  await element('chosen-token-0').onclick();
  assert.equal(run('session.exercise.picked.length'),0);

  // A pair recalls the whole pair at step 3, but its sentence gap uses the
  // single word actually present; the second example remains a valid model.
  run('start(["a4-synonyms"],false,false,1,[words.find(w=>w.en==="end — finish").id],"steps");session.exercise.step=3;renderExercise()');
  element('exercise-answer').value='end — finish';run('checkExercise()');
  assert.equal(element('exercise-next').disabled,true);
  element('exercise-answer').value='end';run('checkExercise()');
  assert.equal(element('exercise-next').disabled,false);
  assert.equal(run('ownSentenceResult("I finish my work at six.",session.exercise.lessons[0],session).kind'),'correct');

  // Unknown components in a new personal phrase use the existing online
  // translator. Only the most recently clicked word may change the output.
  const pending=new Map();let requests=0;
  const online=fixture(new Map(),url=>new Promise(resolve=>{
    requests++;pending.set(new URL(url).searchParams.get('q'),resolve);
  }),true);
  online.run('addPersonalWord({en:"my moonlet blorb",uk:"мій супутник"});start(["custom"],false,false,1,null,"steps")');
  const one=online.element('example-word-3').onclick();
  const two=online.element('example-word-4').onclick();
  assert.equal(requests,2);
  const result=text=>({ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:text}})});
  pending.get('blorb')(result('другий переклад'));await two;
  pending.get('moonlet')(result('перший переклад'));await one;
  assert.equal(online.element('example-translation').textContent,'blorb — другий переклад');
  await online.element('example-word-3').onclick();assert.equal(requests,2,'Successful translations are cached in memory');
  assert.equal(online.element('example-translation').textContent,'moonlet — перший переклад');

  online.run('addPersonalWord({en:"my quux",uk:"мій зразок"});start(["custom"],false,false,1,[personalWordId("my quux")],"steps")');
  const late=online.element('example-word-3').onclick();
  online.run('start(["nouns"],false,false,1,["nouns-0"],"steps")');
  const newOutput=online.element('example-translation');
  pending.get('quux')(result('<img src=x onerror=alert(1)>зразок'));await late;
  assert.equal(newOutput.textContent,'','A delayed result must not reach another lesson');
  run('words.push({id:"unsafe-example",category:"nouns",en:"<img onerror=alert(1)>",uk:"<script>слово</script>"});start(["nouns"],false,false,1,["unsafe-example"],"steps")');
  assert.doesNotMatch(element('app').innerHTML,/<img onerror|<script>слово/);
  console.log('Passed: all 3030 contextual examples and offline word translations; homographs, both words of pairs, solvable gaps, accessible word buttons, hints, no answer leaks or progress changes, safe personal phrases, cached and delayed online translations.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
