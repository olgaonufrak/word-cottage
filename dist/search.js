'use strict';
const PERSONAL_WORDS_KEY='word-cottage-personal-words';
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
  const shown=results.slice(0,20);
  box.innerHTML=`<h2 class="search-local-title">У твоєму словнику${wordSearch.query.trim()?` · ${results.length}`:''}</h2>${results.length?`<div class="search-results">${shown.map(word=>`<div class="search-word"><div id="pronunciation-${escapeHTML(word.id)}">${searchWordDetails(word)}</div><button type="button" class="btn secondary" data-study-word="${escapeHTML(word.id)}">Вчити</button></div>`).join('')}</div>${results.length>shown.length?'<p class="sub">Показано перші 20 слів. Уточни пошук, щоб побачити потрібне.</p>':''}`:`<p class="sub">${wordSearch.query.trim()?'У збережених словах збігів немає. Спробуй онлайн-пошук нижче.':'Введи слово, щоб знайти його серед усіх розділів і доданих слів.'}</p>`}`;
  box.querySelectorAll('[data-study-word]').forEach(button=>button.onclick=()=>learnSearchWord(button.dataset.studyWord));
  bindWordAudio(box);
}
function searchWordDetails(word){
  const enPron=pronunciationCache.get('en:'+normalizeWord(word.en))||word;
  const ukPron=pronunciationCache.get('uk:'+normalizeWord(word.uk))||{ipa:word.ukIpa,audio:word.ukAudio};
  return `<div class="search-word-pair">${[['en',word.en,enPron],['uk',word.uk,ukPron]].map(([lang,text,pron])=>`<div class="search-language"><div><strong lang="${lang}">${escapeHTML(text)}</strong><span class="word-ipa">${escapeHTML(pron.ipa||'Транскрипція недоступна')}</span>${pron.ipa||pron.audio?`<small class="pronunciation-source"><a href="https://en.wiktionary.org/wiki/${encodeURIComponent(normalizeWord(text))}#${lang==='en'?'English':'Ukrainian'}" target="_blank" rel="noopener noreferrer">Wiktionary</a>${pron.ipa?' · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>':''}</small>`:''}</div><button type="button" class="word-audio" data-audio-text="${escapeHTML(text)}" data-audio-lang="${lang}" data-audio-url="${escapeHTML(pron.audio||'')}" aria-label="${lang==='en'?'Послухати англійською':'Послухати українською'}">♫ Послухати</button></div>`).join('')}</div>`;
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
async function lookupWord(raw){
  const state=wordSearch;if(screen!=='search'||!state)return;
  state.controller?.abort();state.controller=new AbortController();state.query=raw.trim();const version=++state.version,signal=state.controller.signal;
  const current=()=>screen==='search'&&wordSearch===state&&state.version===version&&!signal.aborted;
  renderLocalSearch();const panel=document.getElementById('online-word-result');
  const query=normalizeWord(state.query);
  if(!query){panel.innerHTML='<p class="sub">Введи слово для пошуку.</p>';return;}
  const exact=words.find(word=>normalizeWord(word.en)===query||word.uk.split(/[;,]/).some(text=>normalizeWord(text)===query));
  if(exact){panel.innerHTML='';await hydrateLocalPronunciations(state,version);return;}
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
