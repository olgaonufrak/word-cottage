const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const json=data=>({ok:true,status:200,json:async()=>data});
async function main(){
  const requests=[],pending=[];
  const translations={moonlight:'місячне світло',starlight:'зоряне світло','зорепад':'meteor shower'};
  let hold=false;
  const storage=new Map([['word-cottage-learned','["nouns-0"]']]);
  const saved=[...storage];
  const {run,element}=fixture(storage,async(raw,options)=>{
    const url=new URL(raw);requests.push({url,signal:options.signal});
    if(url.hostname==='api.mymemory.translated.net'){
      const term=url.searchParams.get('q');
      if(hold)return new Promise(resolve=>pending.push({term,resolve}));
      return json({responseStatus:200,responseData:{translatedText:translations[term]||'переклад'}});
    }
    return json({parse:{text:'<h2 id="English">English</h2><span class="IPA">/ˈtest/</span><h2 id="Ukrainian">Ukrainian</h2><span class="IPA">[тест]</span>'}});
  },true);
  // A small virtual clock makes typing, debounce and cancellation deterministic.
  run(`window.searchClock={now:0,next:0,timers:new Map()};
    setTimeout=(fn,delay=0)=>{const id=++window.searchClock.next;window.searchClock.timers.set(id,{fn,at:window.searchClock.now+delay});return id};
    clearTimeout=id=>window.searchClock.timers.delete(id);
    window.advanceSearchClock=ms=>{const clock=window.searchClock,target=clock.now+ms;for(;;){const next=[...clock.timers].filter(([,timer])=>timer.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;clock.timers.delete(next[0]);clock.now=next[1].at;next[1].fn()}clock.now=target};`);
  const advance=async ms=>{run(`window.advanceSearchClock(${ms})`);await flush();};
  const input=value=>{element('word-search-input').value=value;element('word-search-input').oninput({});};
  const translatedRequests=()=>requests.filter(r=>r.url.hostname==='api.mymemory.translated.net');
  element('basics-group').onclick();
  assert.doesNotMatch(element('app').innerHTML,/>Знайти<|type="submit"/);
  const first=element('word-search-input');first.value='m';first.selectionStart=1;first.selectionEnd=1;
  first.oninput({});assert.equal(run('screen'),'search');assert.equal(element('word-search-input').value,'m');
  assert.doesNotMatch(element('app').innerHTML,/>Знайти<|натисни «Знайти»/);
  input('moon');await advance(200);input('moonlight');await advance(399);
  assert.equal(requests.length,0);await advance(1);
  assert.deepEqual(translatedRequests().map(r=>r.url.searchParams.get('q')),['moonlight']);
  assert.match(element('online-word-result').innerHTML,/місячне світло/);
  assert.match(element('online-word-result').innerHTML,/data-audio-lang="en"/);
  assert.match(element('online-word-result').innerHTML,/data-audio-lang="uk"/);
  assert.match(element('online-word-result').innerHTML,/IPA|ˈtest/);
  // Local matches appear immediately and exact built-in words do not need a translation service.
  const beforeLocal=translatedRequests().length;input('apple');
  assert.match(element('local-search-results').innerHTML,/apple/);
  await advance(400);assert.equal(translatedRequests().length,beforeLocal);
  // Ukrainian typing automatically translates in the opposite direction too.
  input('зорепад');await advance(400);
  assert.equal(translatedRequests().at(-1).url.searchParams.get('langpair'),'uk|en');
  assert.match(element('online-word-result').innerHTML,/meteor shower/);
  // A late response, even from a service ignoring AbortSignal, cannot overwrite a newer result.
  hold=true;input('moonlight');await advance(400);hold=false;
  const oldRequest=translatedRequests().at(-1);assert.equal(pending.length,1);
  input('starlight');assert.equal(oldRequest.signal.aborted,true);await advance(400);
  assert.match(element('online-word-result').innerHTML,/зоряне світло/);
  pending.shift().resolve(json({responseStatus:200,responseData:{translatedText:'застарілий переклад'}}));await flush();
  assert.doesNotMatch(element('online-word-result').innerHTML,/застарілий переклад/);
  // Enter still works and consumes the pending timer rather than making two requests.
  input('moonlight');const beforeEnter=translatedRequests().length;let prevented=false;
  element('word-search-form').onsubmit({preventDefault(){prevented=true;}});await flush();await advance(800);
  assert.equal(prevented,true);assert.equal(translatedRequests().length,beforeEnter+1);
  // Clearing and leaving cancel scheduled work; clearing also aborts an active request.
  input('starlight');const beforeClear=requests.length;input('');await advance(800);
  assert.equal(requests.length,beforeClear);assert.doesNotMatch(element('online-word-result').innerHTML,/місячне світло/);
  hold=true;input('moonlight');await advance(400);hold=false;const active=translatedRequests().at(-1);
  input('');assert.equal(active.signal.aborted,true);
  pending.shift().resolve(json({responseStatus:200,responseData:{translatedText:'старий результат'}}));await flush();
  assert.doesNotMatch(element('online-word-result').innerHTML,/старий результат/);
  input('starlight');const beforeBack=requests.length;element('back').onclick();await advance(800);
  assert.equal(run('screen'),'home');assert.equal(run('wordSearch'),null);assert.equal(requests.length,beforeBack);
  // Composition is not interrupted on the home page and sends only committed text.
  const composing=element('word-search-input');composing.oncompositionstart();composing.value='зор';composing.oninput({isComposing:true});
  await advance(800);assert.equal(run('screen'),'home');assert.equal(requests.length,beforeBack);
  composing.value='зорепад';composing.oncompositionend();assert.equal(run('screen'),'search');await advance(400);
  assert.match(element('online-word-result').innerHTML,/meteor shower/);
  const composingSearch=element('word-search-input'),beforeComposition=requests.length;
  composingSearch.oncompositionstart();composingSearch.value='moon';composingSearch.oninput({isComposing:true});await advance(800);
  assert.equal(requests.length,beforeComposition);composingSearch.value='moonlight';composingSearch.oncompositionend();await advance(400);
  assert.match(element('online-word-result').innerHTML,/місячне світло/);
  run('cancelWordSearch()');assert.deepEqual([...storage],saved);
  console.log('Passed: automatic search from both screens without Find, immediate local matches, debounced English/Ukrainian translation, both audio buttons and IPA, Enter without duplicate requests, stale-response rejection, clear/back cancellation, committed composition and preserved progress.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
