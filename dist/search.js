'use strict';
const PERSONAL_WORDS_KEY='word-cottage-personal-words';
let wordSearch=null;
function normalizeWord(text){return String(text).normalize('NFKC').trim().replace(/[’‘]/g,"'").replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ').toLowerCase();}
function validEnglishWord(text){return /^(?=.*\p{Script=Latin})[\p{Script=Latin}\p{M}0-9 .'-]{1,80}$/u.test(normalizeWord(text));}
function personalWordId(en){return 'custom-'+encodeURIComponent(normalizeWord(en));}
function ensurePersonalCategory(){if(!categories.some(category=>category.id==='custom'))categories.push({id:'custom',name:'Мої слова',en:'My words',note:'Знайдені та додані тобою',color:'olive',tile:'33.33% 0%'});}
function cleanPersonalWord(value){
  if(!value||typeof value!=='object'||typeof value.en!=='string'||typeof value.uk!=='string')return null;
  const en=normalizeWord(value.en),uk=value.uk.trim();
  if(!validEnglishWord(en)||!uk||uk.length>300)return null;
  const definition=typeof value.definition==='string'?value.definition.slice(0,1200):'';
  return {id:personalWordId(en),en,uk,category:'custom',definition,dictionaryTerm:definition&&typeof value.dictionaryTerm==='string'&&validEnglishWord(value.dictionaryTerm)?value.dictionaryTerm:''};
}
try{
  const stored=JSON.parse(localStorage.getItem(PERSONAL_WORDS_KEY)||'[]');
  if(Array.isArray(stored))for(const value of stored){const word=cleanPersonalWord(value);if(word&&!words.some(existing=>normalizeWord(existing.en)===word.en)){ensurePersonalCategory();words.push(word);}}
}catch{}
function addPersonalWord(value){
  const word=cleanPersonalWord(value);
  if(!word)throw Error('Введи англійське слово та його переклад українською.');
  const existing=words.find(entry=>normalizeWord(entry.en)===word.en);
  if(existing)return existing;
  const saved=[...words.filter(entry=>entry.category==='custom'),word];
  try{localStorage.setItem(PERSONAL_WORDS_KEY,JSON.stringify(saved));}catch{throw Error('Не вдалося зберегти слово. Перевір, чи браузер дозволяє збереження даних, і спробуй ще раз.');}
  ensurePersonalCategory();words.push(word);updateTotal();return word;
}
function matchingWords(query){
  const term=normalizeWord(query);
  if(!term)return [];
  return words.filter(word=>normalizeWord(word.en).includes(term)||normalizeWord(word.uk).includes(term)).sort((a,b)=>Number(normalizeWord(b.en)===term)-Number(normalizeWord(a.en)===term));
}
function cancelWordSearch(){if(wordSearch){wordSearch.version++;wordSearch.controller?.abort();wordSearch=null;}}
function searchForm(query=''){return `<form id="word-search-form" class="word-search-form"><label for="word-search-input">Пошук слів</label><div class="word-search-controls"><input id="word-search-input" type="search" maxlength="80" required autocomplete="off" placeholder="Наприклад, time або час" value="${escapeHTML(query)}"><button class="btn" type="submit">Знайти</button></div><p>Англійською або українською — у твоєму словнику та онлайн.</p></form>`;}
function showSearch(query='',lookup=false){
  cancelWordSearch();screen='search';session=null;selection=null;
  wordSearch={query,version:0,controller:null};
  app.innerHTML=`<div class="study-top"><button class="back" id="back">‹ Усі розділи</button></div><section class="word-list-panel search-panel"><h1>Знайди нове слово</h1>${searchForm(query)}<div id="local-search-results"></div><section class="online-word-section" aria-labelledby="online-word-title"><h2 id="online-word-title">Онлайн-словник</h2><div id="online-word-result" aria-live="polite"><p class="sub">Введи слово та натисни «Знайти». Пошук охоплює слова поза початковими розділами.</p></div></section></section>`;
  document.getElementById('back').onclick=home;
  document.getElementById('word-search-form').onsubmit=event=>{event.preventDefault();lookupWord(document.getElementById('word-search-input').value);};
  document.getElementById('word-search-input').oninput=()=>{
    const state=wordSearch;if(!state||screen!=='search')return;
    state.version++;state.controller?.abort();state.query=document.getElementById('word-search-input').value;
    renderLocalSearch();document.getElementById('online-word-result').innerHTML='<p class="sub">Натисни «Знайти», щоб перевірити слово в онлайн-словнику.</p>';
  };
  renderLocalSearch();if(lookup&&query.trim())lookupWord(query);
}
function renderLocalSearch(){
  if(screen!=='search'||!wordSearch)return;
  const results=matchingWords(wordSearch.query),box=document.getElementById('local-search-results');
  box.innerHTML=`<h2 class="search-local-title">У твоєму словнику${wordSearch.query.trim()?` · ${results.length}`:''}</h2>${results.length?`<div class="search-results">${results.map(word=>`<div class="search-word">${wordDetails(word)}<button type="button" class="btn secondary" data-study-word="${escapeHTML(word.id)}">Вчити</button></div>`).join('')}</div>`:`<p class="sub">${wordSearch.query.trim()?'У збережених словах збігів немає. Спробуй онлайн-пошук нижче.':'Введи слово, щоб знайти його серед усіх розділів і доданих слів.'}</p>`}`;
  box.querySelectorAll('[data-study-word]').forEach(button=>button.onclick=()=>learnSearchWord(button.dataset.studyWord));
}
function learnSearchWord(id){const word=words.find(entry=>entry.id===id);if(!word)return;cancelWordSearch();start([word.category],false,false,1,[word.id]);}
function plainDictionaryText(text){
  const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return String(text||'').replace(/<[^>]*>/g,'').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(whole,key)=>{
    if(key[0]!=='#')return entities[key.toLowerCase()]||whole;
    const number=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));
    return number>0&&number<=0x10ffff&&!(number>=0xd800&&number<=0xdfff)?String.fromCodePoint(number):'';
  }).replace(/\s+/g,' ').trim();
}
async function wordJSON(url,signal){
  const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,12000);
  try{
    const response=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',headers:{Accept:'application/json'}});
    if(response.status===404)return null;
    if(!response.ok)throw Error('Сервіс пошуку зараз недоступний.');
    return await response.json();
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
async function translateWord(text,pair,signal){
  const data=await wordJSON('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent(pair),signal);
  if(!data||Number(data.responseStatus)!==200||data.quotaFinished)throw Error('Переклад зараз недоступний.');
  const translated=plainDictionaryText(data.responseData?.translatedText);
  if(!translated||translated.length>300||normalizeWord(translated)===normalizeWord(text))throw Error('Переклад не знайдено.');
  return translated;
}
async function dictionaryWord(en,signal){
  const data=await wordJSON('https://en.wiktionary.org/api/rest_v1/page/definition/'+encodeURIComponent(en),signal);
  if(!Array.isArray(data?.en))return null;
  const definitions=data.en.flatMap(entry=>Array.isArray(entry.definitions)?entry.definitions.map(item=>plainDictionaryText(item.definition)):[]).filter(Boolean);
  if(!definitions.length)return null;
  return {en,definitions:[...new Set(definitions)].slice(0,3).map(text=>text.slice(0,600))};
}
async function lookupWord(raw){
  const state=wordSearch;if(screen!=='search'||!state)return;
  state.controller?.abort();state.controller=new AbortController();state.query=raw.trim();const version=++state.version,signal=state.controller.signal;
  const current=()=>screen==='search'&&wordSearch===state&&state.version===version&&!signal.aborted;
  renderLocalSearch();const panel=document.getElementById('online-word-result');
  const query=normalizeWord(state.query);
  if(!query){panel.innerHTML='<p class="sub">Введи слово для пошуку.</p>';return;}
  const exact=words.find(word=>normalizeWord(word.en)===query||word.uk.split(/[;,]/).some(text=>normalizeWord(text)===query));
  if(exact){panel.innerHTML='<p class="sub">Це слово вже є у твоєму словнику. Натисни «Вчити» біля нього вище.</p>';return;}
  const ukrainian=/[а-яіїєґ]/i.test(query);
  if(!validEnglishWord(query)&&!ukrainian){renderOnlineWord({en:'',uk:'',notice:'Введи слово англійською або українською.'});return;}
  panel.innerHTML='<p class="sub" role="status">Шукаємо слово й переклад…</p>';
  let en=query;
  if(ukrainian){
    try{en=normalizeWord(await translateWord(query,'uk|en',signal));if(!validEnglishWord(en))throw Error('Не знайдено англійський відповідник.');}
    catch{if(current())renderOnlineWord({en:'',uk:state.query,notice:'Не вдалося знайти англійський відповідник. Можеш додати слово вручну.'});return;}
  }
  const requests=await Promise.allSettled([dictionaryWord(en,signal),ukrainian?Promise.resolve(state.query):translateWord(en,'en|uk',signal)]);
  if(!current())return;
  const dictionary=requests[0].status==='fulfilled'?requests[0].value:null;
  const uk=requests[1].status==='fulfilled'?requests[1].value:'';
  let notice=dictionary?'':requests[0].status==='rejected'?'Словник зараз недоступний. Можеш додати слово з власним перекладом.':'Словник не знайшов цього слова. Перевір написання або додай слово вручну.';
  if(!uk)notice+=(notice?' ':'')+'Автоматичний переклад недоступний — введи його нижче.';
  renderOnlineWord({en,uk,dictionary,notice});
}
function renderOnlineWord({en,uk,dictionary=null,notice=''}){
  if(screen!=='search'||!wordSearch)return;
  const panel=document.getElementById('online-word-result');
  const source=dictionary?'https://en.wiktionary.org/wiki/'+encodeURIComponent(en):'';
  panel.innerHTML=`${notice?`<p class="search-notice" role="status">${escapeHTML(notice)}</p>`:''}${dictionary?`<div class="dictionary-definition"><h3 lang="en">${escapeHTML(en)}</h3><ol>${dictionary.definitions.map(text=>`<li lang="en">${escapeHTML(text)}</li>`).join('')}</ol><p class="dictionary-source">Значення: <a href="${source}" target="_blank" rel="noopener noreferrer">Wiktionary</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></p></div>`:''}<form id="add-word-form" class="add-word-form"><h3>${dictionary?'Додати до навчання':'Додати своє слово'}</h3><label for="new-word-en">Англійське слово</label><input id="new-word-en" required maxlength="80" value="${escapeHTML(en)}" lang="en" autocomplete="off"><label for="new-word-uk">Переклад українською</label><input id="new-word-uk" required maxlength="300" value="${escapeHTML(uk)}" lang="uk" autocomplete="off"><p class="sub translation-note">Перевір переклад і за потреби виправ його. Автоматичний переклад: <a href="https://mymemory.translated.net/" target="_blank" rel="noopener noreferrer">MyMemory</a>.</p><p class="error" id="add-word-error" role="alert"></p><div class="add-word-actions"><button class="btn" type="submit" value="save">Додати до моїх слів</button><button class="btn secondary" type="submit" value="study">Додати й вчити</button></div></form>`;
  const form=document.getElementById('add-word-form');
  form.onsubmit=event=>{
    event.preventDefault();
    try{
      const inputEn=document.getElementById('new-word-en').value,inputUk=document.getElementById('new-word-uk').value;
      const sameTerm=normalizeWord(inputEn)===normalizeWord(en);
      const word=addPersonalWord({en:inputEn,uk:inputUk,definition:sameTerm&&dictionary?dictionary.definitions.join('\n'):'',dictionaryTerm:sameTerm&&dictionary?en:''});
      if(event.submitter?.value==='study'){learnSearchWord(word.id);return;}
      wordSearch.query=word.en;document.getElementById('word-search-input').value=word.en;renderLocalSearch();
      panel.innerHTML='<p class="search-notice" role="status">Слово збережено. Натисни «Вчити» вище або знайди наступне слово. Усі додані слова є в розділі «Мої слова».</p>';
      toast('Слово додано до твого словника.');
    }catch(error){document.getElementById('add-word-error').textContent=error.message;}
  };
}
