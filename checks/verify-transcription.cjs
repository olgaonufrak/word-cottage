const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');

async function main(){
  const storage=new Map([
    ['word-cottage-learned',JSON.stringify(['nouns-0'])],
    ['word-cottage-personal-words',JSON.stringify([{en:'unique phrase',uk:'особлива фраза',ipa:'/juˈnik freɪz/'}])]
  ]);
  const saved=[...storage];let requests=0;
  const {run,element}=fixture(storage,async()=>{
    requests++;await new Promise(resolve=>setTimeout(resolve,5));
    return {ok:true,status:200,json:async()=>({parse:{text:'<h2 id="English">English</h2><span class="IPA">/ˈnɒvəl/</span>'}})};
  },true);
  assert.equal(run('words.filter(w=>w.category!=="custom").length'),3030);
  assert.equal(run('words.filter(w=>!wordIpa(w)).length'),0,'Every built-in card has offline IPA');
  run(`for(const word of words){const ipa=wordIpa(word);if(!ipa.startsWith('/')||!ipa.endsWith('/')||/[<>0-9]|undefined|null/.test(ipa))throw Error('Invalid IPA '+word.id);}`);
  for(const [en,ipa] of Object.entries({time:'/taɪm/',people:'/ˈpipəl/',information:'/ˌɪnfɝˈmeɪʃən/',young:'/jʌŋ/',money:'/ˈmʌni/',read:'/rid/',wind:'/wɪnd/',wound:'/wund/',Polish:'/ˈpoʊlɪʃ/',use:'/juz/'})){
    assert.equal(run('wordIpa(words.find(w=>w.en==='+JSON.stringify(en)+'))'),ipa,en);
  }
  assert.equal(run('wordIpa(words.find(w=>w.id==="a1-verbs-close"))'),'/kloʊz/');
  assert.equal(run('wordIpa(words.find(w=>w.id==="adjectives-88"))'),'/kloʊs/');
  assert.match(run('wordIpa(words.find(w=>w.en==="live music"))'),/^\/laɪv /);
  assert.equal(run('wordIpa({en:"constructor"})'),'');
  assert.match(run('wordIpaMarkup({en:"<img src=x>",ipa:"<script>"})'),/&lt;script&gt;/);
  assert.doesNotMatch(run('wordIpaMarkup({en:"<img src=x>",ipa:"<script>"})'),/<img|<script/);

  run('showSectionWords(["nouns"])');assert.match(element('app').innerHTML,/\/taɪm\//);
  assert.equal((element('app').innerHTML.match(/class="word-ipa"/g)||[]).length,100);
  run('showLearned()');assert.match(element('app').innerHTML,/\/taɪm\//);
  run('suggestWords(["nouns"],false,1,["nouns-0"])');assert.match(element('swipe-content').innerHTML,/\/taɪm\//);
  run('start(["nouns"],false,false,1,["nouns-0"],"cards")');assert.match(element('study-content').innerHTML,/\/taɪm\//);
  run('reversed=true;session.flipped=false;renderCard()');assert.doesNotMatch(element('study-content').innerHTML,/\/taɪm\//,'IPA must not reveal the English answer on the Ukrainian side');
  element('reveal').onclick();assert.match(element('study-content').innerHTML,/\/taɪm\//);
  run('start(["nouns"],false,false,1,["nouns-0"],"steps")');assert.match(element('app').innerHTML,/\/taɪm\//);
  for(const step of [2,3,5]){run('session.exercise.step='+step+';renderExercise()');assert.doesNotMatch(element('app').innerHTML,/\/taɪm\//,'No IPA answer leak during recall');}
  element('exercise-hint').onclick();assert.match(element('exercise-hint-content').innerHTML,/\/taɪm\//);
  assert.match(run('searchWordDetails(words.find(w=>w.en==="time"))'),/pronunciation-sources.txt/);
  assert.equal(requests,0,'Existing dictionaries require no online requests for IPA');
  assert.deepEqual([...storage],saved,'Rendering IPA must not rewrite progress or personal words');

  // Concurrent visible copies of an unknown personal word share one request;
  // a removed node is not overwritten after navigation.
  await run(`{
    const first={isConnected:true,dataset:{ipaWord:'novelcustom'},textContent:'…'},second={isConnected:true,dataset:{ipaWord:'novelcustom'},textContent:'…'};
    window.ipaNodes=[first,second];
    const pending=hydrateWordIpa({querySelectorAll:()=>[first,second]});second.isConnected=false;pending;
  }`);
  assert.equal(requests,1);assert.equal(run('window.ipaNodes[0].textContent'),'/ˈnɒvəl/');assert.equal(run('window.ipaNodes[1].textContent'),'…');
  assert.deepEqual([...storage],saved);
  console.log('Passed: offline IPA for all 3030 cards, meanings and homographs, lists and both learning modes, no recall leaks, preserved storage, escaped personal data, deduplicated lookup and safe navigation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
