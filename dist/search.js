'use strict';
const PERSONAL_WORDS_KEY='word-cottage-personal-words';
const SEARCH_HISTORY_KEY='word-cottage-search-history',SEARCH_HISTORY_LIMIT=20;
let searchHistory=[],searchHistoryVersion=0;
let wordSearch=null;
const pronunciationCache=new Map();
function safeWordAudio(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='upload.wikimedia.org'?url.href:'';}catch{return '';}}
function normalizeWord(text){return String(text).normalize('NFKC').trim().replace(/[’‘]/g,"'").replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ').toLowerCase();}
function validEnglishWord(text){return /^(?=.*\p{Script=Latin})[\p{Script=Latin}\p{M}0-9 .'-]{1,80}$/u.test(normalizeWord(text));}
function personalWordId(en){return 'custom-'+encodeURIComponent(normalizeWord(en));}
function ensurePersonalCategory(){if(!categories.some(category=>category.id==='custom'))categories.push({id:'custom',name:'Мої слова',en:'My words',note:'Знайдені та додані тобою',color:'olive',tile:'33.33% 0%'});}
function cleanPersonalWord(value){
  if(!value||typeof value!=='object'||typeof value.en!=='string'||typeof value.uk!=='string')return null;
  const en=normalizeWord(value.en),uk=value.uk.trim();
  if(!validEnglishWord(en)||!uk||uk.length>300)return null;
  const definition=typeof value.definition==='string'?value.definition.slice(0,1200):'';
  return {id:personalWordId(en),en,uk,category:'custom',definition,dictionaryTerm:definition&&typeof value.dictionaryTerm==='string'&&validEnglishWord(value.dictionaryTerm)?value.dictionaryTerm:'',ipa:typeof value.ipa==='string'?value.ipa.slice(0,200):'',audio:safeWordAudio(value.audio),ukIpa:typeof value.ukIpa==='string'?value.ukIpa.slice(0,200):'',ukAudio:safeWordAudio(value.ukAudio)};
}
try{
  const stored=JSON.parse(localStorage.getItem(PERSONAL_WORDS_KEY)||'[]');
  if(Array.isArray(stored))for(const value of stored){const word=cleanPersonalWord(value);if(word&&!words.some(existing=>normalizeWord(existing.en)===word.en&&!categories.find(category=>category.id===existing.category)?.stage)){ensurePersonalCategory();words.push(word);}}
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
function cleanSearchHistory(values){
  if(!Array.isArray(values))return [];
  const seen=new Set(),result=[];
  for(const value of values){
    if(typeof value!=='string')continue;
    const query=value.trim().replace(/\s+/g,' '),key=normalizeWord(query);
    if(!query||query.length>80||!/[\p{Script=Latin}\p{Script=Cyrillic}]/u.test(query)||/[<>\u0000-\u001f\u007f]/.test(query)||seen.has(key))continue;
    seen.add(key);result.push(query);if(result.length===SEARCH_HISTORY_LIMIT)break;
  }
  return result;
}
try{searchHistory=cleanSearchHistory(JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)||'[]'));}catch{}
function saveSearchHistory(){try{localStorage.setItem(SEARCH_HISTORY_KEY,JSON.stringify(searchHistory));}catch{}}
function rememberSearchQuery(query,version=searchHistoryVersion){
  if(version!==searchHistoryVersion)return;
  const next=cleanSearchHistory([query,...searchHistory]);
  if(JSON.stringify(next)===JSON.stringify(searchHistory))return;
  searchHistory=next;saveSearchHistory();renderSearchHistory();
}
function removeSearchHistory(query){
  searchHistoryVersion++;searchHistory=searchHistory.filter(value=>normalizeWord(value)!==normalizeWord(query));
  saveSearchHistory();renderSearchHistory();
}
function clearSearchHistory(){
  searchHistoryVersion++;searchHistory=[];saveSearchHistory();renderSearchHistory();toast('Історію пошуку очищено.');
  document.getElementById('word-search-input')?.focus?.({preventScroll:true});
}
function recallSearchQuery(query){
  if(screen==='search'){document.getElementById('word-search-input').value=query;lookupWord(query);}else showSearch(query,true);
  const input=document.getElementById('word-search-input');input.focus?.({preventScroll:true});input.setSelectionRange?.(query.length,query.length);
}
function renderSearchHistory(){
  const box=document.getElementById('search-history');if(!box)return;
  const previous=document.getElementById('search-history-details'),open=typeof previous?.open==='boolean'?previous.open:!wordSearch?.query.trim();
  if(!searchHistory.length){box.innerHTML='';return;}
  const entries=[...searchHistory];
  box.innerHTML=`<details id="search-history-details" ${open?'open':''}><summary>Історія пошуку <span>· ${entries.length}</span></summary><div class="search-history-toolbar"><small>Останні пошуки в цьому браузері</small><button type="button" id="clear-search-history">Очистити історію</button></div><ul class="search-history-list" aria-label="Останні пошуки">${entries.map((query,index)=>`<li><button type="button" class="search-history-query" id="search-history-query-${index}">${escapeHTML(query)}</button><button type="button" class="search-history-remove" id="search-history-remove-${index}" aria-label="Видалити з історії: ${escapeHTML(query)}">×</button></li>`).join('')}</ul></details>`;
  document.getElementById('clear-search-history').onclick=clearSearchHistory;
  entries.forEach((query,index)=>{
    document.getElementById('search-history-query-'+index).onclick=()=>recallSearchQuery(query);
    document.getElementById('search-history-remove-'+index).onclick=()=>{
      removeSearchHistory(query);
      (document.getElementById('search-history-remove-'+Math.min(index,searchHistory.length-1))||document.getElementById('word-search-input'))?.focus?.({preventScroll:true});
    };
  });
}
function cancelWordSearch(){if(wordSearch){clearTimeout(wordSearch.timer);wordSearch.version++;wordSearch.controller?.abort();wordSearch=null;}}
function searchForm(query=''){return `<form id="word-search-form" class="word-search-form" role="search"><label for="word-search-input">Пошук слів</label><div class="word-search-controls"><input id="word-search-input" type="search" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" aria-describedby="word-search-help" placeholder="Наприклад, time або час" value="${escapeHTML(query)}"></div><p id="word-search-help">Введи слово англійською або українською — переклад з’явиться автоматично.</p></form><div class="search-history" id="search-history"></div>`;}
function bindWordSearchForm(){
  const input=document.getElementById('word-search-input');
  let composing=false;
  const update=(immediate=false)=>{
    if(screen==='search'){scheduleWordLookup(input.value,immediate,composing);return;}
    if(composing||!input.value.trim())return;
    const start=input.selectionStart,end=input.selectionEnd;
    showSearch(input.value,immediate);
    const next=document.getElementById('word-search-input');
    next.focus?.({preventScroll:true});next.setSelectionRange?.(start,end);
  };
  document.getElementById('word-search-form').onsubmit=event=>{event.preventDefault();if(!composing)update(true);};
  input.oninput=event=>{if(event?.isComposing){if(screen==='search')scheduleWordLookup(input.value,false,true);return;}update();};
  input.oncompositionstart=()=>{composing=true;if(screen==='search')scheduleWordLookup(input.value,false,true);};
  input.oncompositionend=()=>{composing=false;update();};
  renderSearchHistory();
}
function scheduleWordLookup(raw,immediate=false,composing=false){
  const state=wordSearch;if(screen!=='search'||!state)return;
  clearTimeout(state.timer);state.timer=null;state.version++;state.controller?.abort();state.query=raw;
  renderLocalSearch();
  const panel=document.getElementById('online-word-result');
  if(!raw.trim()||composing){panel.innerHTML='<p class="sub">Введи слово — переклад з’явиться автоматично.</p>';return;}
  panel.innerHTML='<p class="sub" role="status">Шукаємо слово й переклад…</p>';
  if(immediate){lookupWord(raw);return;}
  const historyVersion=searchHistoryVersion;
  state.timer=setTimeout(()=>{state.timer=null;if(screen==='search'&&wordSearch===state)lookupWord(raw,historyVersion);},400);
}
function showSearch(query='',lookup=false){
  cancelWordSearch();screen='search';session=null;selection=null;
  wordSearch={query,version:0,controller:null,timer:null};
  app.innerHTML=`<div class="study-top"><button class="back" id="back">‹ Усі розділи</button></div><section class="word-list-panel search-panel"><h1>Знайди нове слово</h1>${searchForm(query)}<div id="local-search-results"></div><section class="online-word-section" aria-labelledby="online-word-title"><h2 id="online-word-title">Онлайн-словник</h2><div id="online-word-result" aria-live="polite"></div></section></section>`;
  document.getElementById('back').onclick=home;
  bindWordSearchForm();scheduleWordLookup(query,lookup);
}
function renderLocalSearch(){
  if(screen!=='search'||!wordSearch)return;
  const results=matchingWords(wordSearch.query),box=document.getElementById('local-search-results');
  const shown=results.slice(0,20);
  box.innerHTML=`<h2 class="search-local-title">У твоєму словнику${wordSearch.query.trim()?` · ${results.length}`:''}</h2>${results.length?`<div class="search-results">${shown.map(word=>`<div class="search-word"><div id="pronunciation-${escapeHTML(word.id)}">${searchWordDetails(word)}</div><button type="button" class="btn secondary" data-study-word="${escapeHTML(word.id)}">Вчити</button></div>`).join('')}</div>${results.length>shown.length?'<p class="sub">Показано перші 20 слів. Уточни пошук, щоб побачити потрібне.</p>':''}`:`<p class="sub">${wordSearch.query.trim()?'У збережених словах збігів немає. Спробуй онлайн-пошук нижче.':'Введи слово, щоб знайти його серед усіх розділів і доданих слів.'}</p>`}`;
  box.querySelectorAll('[data-study-word]').forEach(button=>button.onclick=()=>learnSearchWord(button.dataset.studyWord));
  bindWordAudio(box);
}
function searchWordDetails(word){
  const enPron={...word,...pronunciationCache.get('en:'+normalizeWord(word.en)),ipa:wordIpa(word),localIpa:!word.ipa&&(Object.hasOwn(cardIpa,word.id)||Object.hasOwn(builtInIpa,normalizeWord(word.en)))};
  const ukPron=pronunciationCache.get('uk:'+normalizeWord(word.uk))||{ipa:word.ukIpa,audio:word.ukAudio};
  return `<div class="search-word-pair">${[['en',word.en,enPron],['uk',word.uk,ukPron]].map(([lang,text,pron])=>`<div class="search-language"><div><strong lang="${lang}">${escapeHTML(text)}</strong><span class="word-ipa">${escapeHTML(pron.ipa||'Транскрипція недоступна')}</span>${pron.localIpa?'<small class="pronunciation-source"><a href="pronunciation-sources.txt" target="_blank" rel="noopener noreferrer">Джерела IPA</a></small>':''}${(!pron.localIpa&&pron.ipa)||pron.audio?`<small class="pronunciation-source"><a href="https://en.wiktionary.org/wiki/${encodeURIComponent(normalizeWord(text))}#${lang==='en'?'English':'Ukrainian'}" target="_blank" rel="noopener noreferrer">Wiktionary</a>${pron.ipa?' · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>':''}</small>`:''}</div><button type="button" class="word-audio" data-audio-text="${escapeHTML(text)}" data-audio-lang="${lang}" data-audio-url="${escapeHTML(pron.audio||'')}" aria-label="${lang==='en'?'Послухати англійською':'Послухати українською'}">♫ Послухати</button></div>`).join('')}</div>`;
}
function bindWordAudio(root){root.querySelectorAll('[data-audio-text]').forEach(button=>button.onclick=()=>speak(button.dataset.audioText,button.dataset.audioLang,button.dataset.audioUrl));}
async function hydrateLocalPronunciations(state,version){
  const current=()=>screen==='search'&&wordSearch===state&&state.version===version&&!state.controller.signal.aborted;
  const queue=matchingWords(state.query).slice(0,20);
  async function worker(){while(queue.length&&current()){
    const word=queue.shift();
    await Promise.allSettled([pronunciationWord(word.en,'en',state.controller.signal),pronunciationWord(word.uk,'uk',state.controller.signal)]);
    if(!current())return;
    const box=document.getElementById('pronunciation-'+word.id);if(box){box.innerHTML=searchWordDetails(word);bindWordAudio(box);}
  }}
  await Promise.all([worker(),worker(),worker()]);
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
function parseWordPronunciation(html,lang){
  const language=lang==='uk'?'Ukrainian':'English';
  const heading=new RegExp('<h2\\b[^>]*\\bid="'+language+'"[^>]*>','i').exec(html);
  if(!heading)return null;
  const rest=html.slice(heading.index+heading[0].length),end=rest.search(/<h2\b/i),section=end<0?rest:rest.slice(0,end);
  const ipaMatch=section.match(/<span\b[^>]*class="[^"]*\bIPA\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const ipa=ipaMatch?plainDictionaryText(ipaMatch[1]).slice(0,200):'';
  const audioBlock=section.match(/<audio\b[^>]*>[\s\S]*?<\/audio>/i)?.[0]||'';
  const sources=[...audioBlock.matchAll(/<source\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)];
  const audioMatch=sources.find(match=>/audio\/mpeg/i.test(match[0]))||sources[0];
  const audio=audioMatch?safeWordAudio(plainDictionaryText(audioMatch[1]).replace(/^\/\//,'https://')):'';
  return {ipa,audio};
}
async function pronunciationWord(term,lang,signal){
  const key=lang+':'+normalizeWord(term);if(pronunciationCache.has(key))return pronunciationCache.get(key);
  const data=await wordJSON('https://en.wiktionary.org/w/api.php?action=parse&prop=text&format=json&formatversion=2&origin=*&page='+encodeURIComponent(normalizeWord(term)),signal);
  const result=typeof data?.parse?.text==='string'?parseWordPronunciation(data.parse.text,lang):null;
  if(!signal?.aborted&&result)pronunciationCache.set(key,result);
  return result;
}
async function lookupWord(raw,historyVersion=searchHistoryVersion){
  const state=wordSearch;if(screen!=='search'||!state)return;
  clearTimeout(state.timer);state.timer=null;
  state.controller?.abort();state.controller=new AbortController();state.query=raw.trim();const version=++state.version,signal=state.controller.signal;
  const current=()=>screen==='search'&&wordSearch===state&&state.version===version&&!signal.aborted;
  renderLocalSearch();const panel=document.getElementById('online-word-result');
  const query=normalizeWord(state.query);
  if(!query){panel.innerHTML='<p class="sub">Введи слово для пошуку.</p>';return;}
  const exact=words.find(word=>normalizeWord(word.en)===query||word.uk.split(/[;,]/).some(text=>normalizeWord(text)===query));
  if(exact){panel.innerHTML='';rememberSearchQuery(state.query,historyVersion);await hydrateLocalPronunciations(state,version);return;}
  hydrateLocalPronunciations(state,version);
  const ukrainian=/[а-яіїєґ]/i.test(query);
  if(!validEnglishWord(query)&&!ukrainian){renderOnlineWord({en:'',uk:'',notice:'Введи слово англійською або українською.'});return;}
  panel.innerHTML='<p class="sub" role="status">Шукаємо слово й переклад…</p>';
  let en=query;
  if(ukrainian){
    try{en=normalizeWord(await translateWord(query,'uk|en',signal));if(!validEnglishWord(en))throw Error('Не знайдено англійський відповідник.');}
    catch{if(current())renderOnlineWord({en:'',uk:state.query,notice:'Не вдалося знайти англійський відповідник. Можеш додати слово вручну.'});return;}
  }
  const requests=await Promise.allSettled([pronunciationWord(en,'en',signal),ukrainian?Promise.resolve(state.query):translateWord(en,'en|uk',signal)]);
  if(!current())return;
  const dictionary=requests[0].status==='fulfilled'?requests[0].value:null;
  const uk=requests[1].status==='fulfilled'?requests[1].value:'';
  const ukPron=uk?await pronunciationWord(uk,'uk',signal).catch(()=>null):null;
  if(!current())return;
  let notice=dictionary?'':requests[0].status==='rejected'?'Словник зараз недоступний. Можеш додати слово з власним перекладом.':'Словник не знайшов цього слова. Перевір написання або додай слово вручну.';
  if(!uk)notice+=(notice?' ':'')+'Автоматичний переклад недоступний — введи його нижче.';
  if(uk)rememberSearchQuery(state.query,historyVersion);
  renderOnlineWord({en,uk,dictionary,ukPron,notice});
}
function renderOnlineWord({en,uk,dictionary=null,ukPron=null,notice=''}){
  if(screen!=='search'||!wordSearch)return;
  const panel=document.getElementById('online-word-result');
  const source=dictionary?'https://en.wiktionary.org/wiki/'+encodeURIComponent(en):'';
  panel.innerHTML=`${notice?`<p class="search-notice" role="status">${escapeHTML(notice)}</p>`:''}${en&&uk?searchWordDetails({en,uk,ipa:dictionary?.ipa,audio:dictionary?.audio,ukIpa:ukPron?.ipa,ukAudio:ukPron?.audio}):''}<form id="add-word-form" class="add-word-form"><details ${!en||!uk?'open':''}><summary>${en&&uk?'Виправити слово або переклад':'Додати своє слово'}</summary><label for="new-word-en">Англійське слово</label><input id="new-word-en" required maxlength="80" value="${escapeHTML(en)}" lang="en" autocomplete="off"><label for="new-word-uk">Переклад українською</label><input id="new-word-uk" required maxlength="300" value="${escapeHTML(uk)}" lang="uk" autocomplete="off"></details><p class="error" id="add-word-error" role="alert"></p><div class="add-word-actions"><button class="btn" type="submit" value="save">Додати до моїх слів</button><button class="btn secondary" type="submit" value="study">Додати й вчити</button></div></form><p class="dictionary-source">${dictionary?`Вимова: <a href="${source}" target="_blank" rel="noopener noreferrer">Wiktionary</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. `:''}Переклад: <a href="https://mymemory.translated.net/" target="_blank" rel="noopener noreferrer">MyMemory</a>.</p>`;
  bindWordAudio(panel);
  const form=document.getElementById('add-word-form');
  form.onsubmit=event=>{
    event.preventDefault();
    try{
      const inputEn=document.getElementById('new-word-en').value,inputUk=document.getElementById('new-word-uk').value;
      const sameTerm=normalizeWord(inputEn)===normalizeWord(en);
      const sameUk=normalizeWord(inputUk)===normalizeWord(uk);
      const word=addPersonalWord({en:inputEn,uk:inputUk,ipa:sameTerm?dictionary?.ipa:'',audio:sameTerm?dictionary?.audio:'',ukIpa:sameUk?ukPron?.ipa:'',ukAudio:sameUk?ukPron?.audio:''});
      if(event.submitter?.value==='study'){learnSearchWord(word.id);return;}
      wordSearch.query=word.en;document.getElementById('word-search-input').value=word.en;renderLocalSearch();
      panel.innerHTML='<p class="search-notice" role="status">Слово збережено. Натисни «Вчити» вище або знайди наступне слово. Усі додані слова є в розділі «Мої слова».</p>';
      toast('Слово додано до твого словника.');
    }catch(error){document.getElementById('add-word-error').textContent=error.message;}
  };
}
