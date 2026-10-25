const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
const KEY='word-cottage-search-history',flush=()=>new Promise(resolve=>setImmediate(resolve));
const response=text=>({ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:text}})});
async function main(){
  const storage=new Map([['word-cottage-learned','["nouns-0"]'],['word-cottage-personal-words','[{"en":"myword","uk":"моє слово"}]']]);
  const saved=[...storage];let hold=false,resolveTranslation;
  const f=fixture(storage,async raw=>{
    const url=new URL(raw);
    if(url.hostname==='api.mymemory.translated.net'){
      if(hold)return new Promise(resolve=>resolveTranslation=resolve);
      return response(url.searchParams.get('langpair')==='uk|en'?'moonlight':'місячне світло');
    }
    return {ok:true,status:200,json:async()=>({})};
  },true),{run,element}=f;
  const history=()=>JSON.parse(run('JSON.stringify(searchHistory)'));
  element('basics-group').onclick();element('basics-search').onclick();
  assert.equal(run('screen'),'search');assert.equal(element('search-history').innerHTML,'');
  // Typing without a completed lookup must not save partial text.
  element('word-search-input').value='mo';element('word-search-input').oninput({});
  element('word-search-input').value='moon';element('word-search-input').oninput({});
  run('cancelWordSearch()');assert.equal(storage.has(KEY),false);
  run('showSearch()');await run("lookupWord('apple')");assert.deepEqual(history(),['apple']);
  assert.match(element('search-history').innerHTML,/Історія пошуку/);
  await run("lookupWord('moonlight')");assert.deepEqual(history(),['moonlight','apple']);
  await run("lookupWord('  APPLE  ')");assert.deepEqual(history(),['APPLE','moonlight']);
  assert.deepEqual(JSON.parse(storage.get(KEY)),history());
  await run("lookupWord('місячне світло')");assert.equal(history()[0],'місячне світло');
  // Reopening search from the compact basics tile retains history and starts recall immediately.
  run('showBasics()');element('basics-search').onclick();
  element('search-history-query-0').onclick();await flush();
  assert.equal(run('screen'),'search');assert.equal(element('word-search-input').value,'місячне світло');
  assert.match(element('online-word-result').innerHTML,/moonlight/);
  element('back').onclick();assert.equal(run('screen'),'home');assert.equal(run('learningGroup'),'basics');
  element('basics-search').onclick();assert.match(element('search-history').innerHTML,/місячне світло/);
  element('search-history-query-1').onclick();await flush();assert.equal(element('word-search-input').value,'APPLE');
  element('search-history-remove-0').onclick();assert.equal(history().some(q=>q.toLowerCase()==='apple'),false);
  const reloaded=fixture(storage,undefined,true);assert.deepEqual(JSON.parse(reloaded.run('JSON.stringify(searchHistory)')),history());
  // Normalised duplicates move to the top; the list is bounded and can render long entries safely.
  for(let i=0;i<25;i++)run(`rememberSearchQuery('searchword${i}')`);
  assert.equal(history().length,20);assert.equal(history()[0],'searchword24');assert.equal(history().at(-1),'searchword5');
  run("rememberSearchQuery(' SEARCHWORD10 ')");assert.equal(history()[0],'SEARCHWORD10');assert.equal(history().length,20);
  assert.equal(history().filter(q=>q.toLowerCase()==='searchword10').length,1);
  element('clear-search-history').onclick();assert.deepEqual(history(),[]);assert.equal(storage.get(KEY),'[]');assert.equal(element('search-history').innerHTML,'');
  // Clearing after typing or during an in-flight response must not resurrect the query.
  run("showSearch('moonlight');clearSearchHistory()");await new Promise(resolve=>setTimeout(resolve,450));await flush();
  assert.deepEqual(history(),[]);assert.match(element('online-word-result').innerHTML,/місячне світло/);
  hold=true;const pending=run("lookupWord('starlight')");await flush();run('clearSearchHistory()');hold=false;
  resolveTranslation(response('зоряне світло'));await pending;
  assert.deepEqual(history(),[]);assert.match(element('online-word-result').innerHTML,/зоряне світло/);
  run("rememberSearchQuery('starlight')");hold=true;const deleting=run("lookupWord('starlight')");await flush();
  element('search-history-remove-0').onclick();hold=false;resolveTranslation(response('зоряне світло'));await deleting;assert.deepEqual(history(),[]);
  // Broken or untrusted saved data cannot break the page or introduce markup.
  for(const value of ['not json','{}','null',JSON.stringify([null,{},'','   ','a'.repeat(81),'<img src=x onerror=alert(1)>','Moonlight','moonlight','мама'])]){
    const bad=fixture(new Map([[KEY,value]]),undefined,true);bad.run('showBasics()');bad.element('basics-search').onclick();
    assert.doesNotMatch(bad.element('search-history').innerHTML,/<img|onerror/);
    if(value.startsWith('['))assert.deepEqual(JSON.parse(bad.run('JSON.stringify(searchHistory)')),['Moonlight','мама']);
    else assert.equal(bad.run('searchHistory.length'),0);
  }
  const quoted=fixture(new Map([[KEY,JSON.stringify(['say "hello"'])]]),undefined,true);quoted.run('showBasics()');quoted.element('basics-search').onclick();
  assert.match(quoted.element('search-history').innerHTML,/say &quot;hello&quot;/);
  // Storage errors keep the page usable; existing personal words and learned IDs stay untouched.
  run("localStorage.setItem=()=>{throw Error('storage unavailable')};rememberSearchQuery('moonlight')");assert.deepEqual(history(),['moonlight']);
  run('clearSearchHistory();cancelWordSearch()');assert.deepEqual([...storage].filter(([key])=>key!==KEY),saved);
  console.log('Passed: persistent recent English/Ukrainian queries, no partial typing, deduplication and 20-entry limit, recall from both screens, individual removal and clear, no resurrection after late responses, safe malformed/quoted data, storage failure fallback and preserved learning data.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
