'use strict';
const app=document.getElementById('app');
let learned=new Set();try{const saved=JSON.parse(localStorage.getItem('word-cottage-learned')||'[]');if(Array.isArray(saved))learned=new Set(saved.filter(id=>words.some(w=>w.id===id)));}catch{}
let session=null, selection=null, reversed=false,screen='home',learningGroup='basics',dailyView='stages';
const dailyStages=[
  {key:'one',sections:typeof stageOneSections==='undefined'?[]:stageOneSections,title:'Етап 1 — Початковий рівень A1',description:'Найважливіші слова для початку навчання'},
  {key:'two',sections:typeof stageTwoSections==='undefined'?[]:stageTwoSections,title:'Етап 2 — Базовий рівень A1–A2',description:'Слова для щоденного спілкування та побутових ситуацій'},
  {key:'three',sections:typeof stageThreeSections==='undefined'?[]:stageThreeSections,title:'Етап 3 — Середній рівень A2–B1',description:'Розширення словникового запасу для подорожей, розмов і повсякденного життя'},
  {key:'four',sections:[],title:'Етап 4 — Просунутий рівень B1–B2',description:'Тематична лексика, абстрактні поняття та складніші висловлювання'}
];
function save(){try{localStorage.setItem('word-cottage-learned',JSON.stringify([...learned]));}catch{toast('Не вдалося зберегти прогрес у браузері.');}updateTotal();}
function updateTotal(){document.getElementById('total').textContent=learned.size;document.getElementById('word-total').textContent=words.length;}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.className='toast-show';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.className='',4000);}
function count(cat){return words.filter(w=>w.category===cat&&learned.has(w.id)).length;}
function tile(c){return `<div class="tile" style="background-position:${c.tile}" aria-hidden="true"></div>`;}
function landing(){
  cancelWordSearch();screen='landing';session=null;selection=null;
  app.innerHTML=`<section class="group-menu" aria-label="Групи для навчання"><button type="button" class="group-card" id="everyday-group">${tile(categories.find(c=>c.id==='common'))}<h2>Слова на кожен день</h2><p>Найуживаніші слова для щоденного спілкування.</p><span class="group-open">Відкрити <span aria-hidden="true">→</span></span></button><button type="button" class="group-card" id="basics-group">${tile(categories.find(c=>c.id==='nouns'))}<h2>Основа для початківця</h2><p>Розділи, пошук слів і твій власний словник.</p><span class="group-open">Відкрити <span aria-hidden="true">→</span></span></button></section>`;
  document.getElementById('everyday-group').onclick=showDailyStages;
  document.getElementById('basics-group').onclick=showBasics;
  updateTotal();
}
function showDailyStages(){
  cancelWordSearch();learningGroup='daily';dailyView='stages';screen='daily-stages';session=null;selection=null;
  app.innerHTML=`<div class="study-top"><button type="button" class="back" id="daily-back">‹ Дві групи</button></div><section class="daily-stages-panel stage-overview" aria-labelledby="daily-title"><h1 id="daily-title">Слова на кожен день</h1><div class="daily-stages">${dailyStages.map((stage,index)=>stage.sections.length?`<button type="button" class="daily-stage stage-ready" id="open-stage-${stage.key}"><h2>${stage.title}</h2><p>${stage.description}</p><span class="stage-status">${stage.sections.length} розділів · Відкрити →</span></button>`:`<article class="daily-stage" aria-labelledby="daily-stage-${index+1}"><h2 id="daily-stage-${index+1}">${stage.title}</h2><p>${stage.description}</p><span class="stage-status">Поки без слів</span></article>`).join('')}</div></section>`;
  document.getElementById('daily-back').onclick=landing;
  dailyStages.forEach((stage,index)=>{if(stage.sections.length)document.getElementById('open-stage-'+stage.key).onclick=()=>showDailyStage(index+1);});
}
function showStageOne(){showDailyStage(1);}
function showStageTwo(){showDailyStage(2);}
function showStageThree(){showDailyStage(3);}
function showDailyStage(stageNumber){
  const {sections,key:stageKey}=dailyStages[stageNumber-1];
  cancelWordSearch();learningGroup='daily';dailyView='stage'+stageNumber;screen='stage-'+stageKey;session=null;selection=null;
  app.innerHTML=`<div class="study-top"><button type="button" class="back" id="stage-${stageKey}-back">‹ Усі етапи</button></div><section class="stage-sections-panel"><h1>${dailyStages[stageNumber-1].title}</h1><div class="stage-section-grid">${sections.map(section=>{const size=words.filter(word=>word.category===section.id).length;return `<button type="button" class="stage-section" id="section-${section.id}"><h2 lang="en">${section.name}</h2><small lang="uk" class="section-uk-title">${section.ukTitle}</small><span class="section-word-count">${size} ${wordLabel(size)}</span><span class="progress-row"><span class="track"><span class="fill" style="width:${size?count(section.id)/size*100:0}%"></span></span><span>${count(section.id)} / ${size}</span></span></button>`;}).join('')}</div></section>`;
  document.getElementById('stage-'+stageKey+'-back').onclick=showDailyStages;
  sections.forEach(section=>document.getElementById('section-'+section.id).onclick=()=>showSectionWords([section.id]));
}
function basicCategories(){return categories.filter(category=>!category.stage);}
function dailyStageNumber(){return Number(dailyView.slice(5))||1;}
function home(){learningGroup==='daily'?(dailyView==='stages'?showDailyStages():showDailyStage(dailyStageNumber())):showBasics();}
function groupBackLabel(){return learningGroup==='daily'?`‹ Розділи Етапу ${dailyStageNumber()}`:'‹ Усі розділи';}
function practiceTitle(category,mixed=false){return mixed?'Слова з різних розділів':category.name;}
function showBasics(){
  learningGroup='basics';
  cancelWordSearch();screen='home';session=null;selection=null;
  const listCategories=basicCategories(),basicWordCount=words.filter(word=>listCategories.some(category=>category.id===word.category)).length;
  app.innerHTML=`<div class="study-top"><button class="back" id="basics-back">‹ Дві групи</button></div><div class="intro"><div><div class="eyebrow">Твій маленький словник</div><h1>Час для <em>нових слів.</em></h1><p class="sub">Обери розділ і почни з однієї картки.</p></div><p class="note">Чашка чаю.<br>Кілька слів.<br>Ще один маленький крок.</p></div><div class="home-layout"><section>${searchForm()}<div class="section-label"><h2>На що сьогодні настрій?</h2><span>${listCategories.length} ${listCategories.length===4?'розділи':'розділів'} · ${basicWordCount} ${wordLabel(basicWordCount)}</span></div><div class="category-grid">${listCategories.map((c,i)=>{const size=words.filter(word=>word.category===c.id).length;return `<button class="category ${c.color}" data-category="${c.id}"><div class="cat-top">${tile(c)}<span class="cat-number">${String(i+1).padStart(2,'0')}</span></div><h3>${c.name}</h3><div class="en">${c.en} · ${size} ${wordLabel(size)}</div><p>${c.note}</p><div class="progress-row"><div class="track"><div class="fill" style="width:${size?count(c.id)/size*100:0}%"></div></div><span>${count(c.id)} / ${size}</span></div></button>`;}).join('')}</div><div class="mix"><span class="mix-symbol" aria-hidden="true">✳</span><div><h3>Змішано</h3><p>Збери слова з різних розділів.</p></div><button class="btn" id="mixed">Перемішати</button></div><button class="learned-entry" id="learned-words"><span><strong>Вивчені слова</strong><small>Твій словник знайомих слів</small></span><span class="learned-count">${learned.size}</span></button><p class="bottom-note">Торкнись картки, щоб побачити переклад. Повторюй, доки слово не стане знайомим.</p></section><aside class="side-art" aria-label="Затишна клаптикова ілюстрація з вашого фото"><div class="art-label">Little words,<br>little wonders.<small>ОДНЕ СЛОВО ЗА РАЗ</small></div></aside></div>`;
  document.getElementById('basics-back').onclick=landing;
  app.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>showSectionWords([button.dataset.category]));
  document.getElementById('mixed').onclick=()=>picker();document.getElementById('learned-words').onclick=showLearned;
  document.getElementById('word-search-form').onsubmit=event=>{event.preventDefault();showSearch(document.getElementById('word-search-input').value,true);};
  updateTotal();
}
function amountControls(){return `<fieldset class="word-count-picker"><legend>Скільки слів цього разу?</legend><div class="word-stepper"><button type="button" class="step-btn" id="count-minus" aria-label="Зменшити кількість слів">−</button><output id="word-count" aria-live="polite" aria-label="Кількість слів">10</output><button type="button" class="step-btn" id="count-plus" aria-label="Збільшити кількість слів">+</button></div><div class="count-presets" aria-label="Швидкий вибір кількості">${[5,10,20].map(n=>`<button type="button" class="btn secondary count-preset" data-count="${n}" aria-pressed="${n===10}">${n} слів</button>`).join('')}</div><p class="count-available" id="count-available"></p></fieldset>`;}
function bindAmount(maximum,startButton,initialAmount=10){
  let maximumWords=maximum,amount=Math.min(initialAmount,maximum);
  const minus=document.getElementById('count-minus'),plus=document.getElementById('count-plus');
  const presets=[...app.querySelectorAll('[data-count]')];
  function update(){
    document.getElementById('word-count').textContent=amount;
    document.getElementById('count-available').textContent=maximumWords?`Доступно слів: ${maximumWords}`:'Обери хоча б один розділ.';
    minus.disabled=amount<=1;plus.disabled=amount>=maximumWords;
    presets.forEach(button=>{button.disabled=Number(button.dataset.count)>maximumWords;button.setAttribute('aria-pressed',String(Number(button.dataset.count)===amount));});
    startButton.disabled=maximumWords===0;
    startButton.textContent=maximumWords?`Обрати слова · ${amount} ${wordLabel(amount)}`:'Обрати слова';
  }
  minus.onclick=()=>{amount=Math.max(1,amount-1);update();};
  plus.onclick=()=>{amount=Math.min(maximumWords,amount+1);update();};
  presets.forEach(button=>button.onclick=()=>{amount=Number(button.dataset.count);update();});
  update();
  return {value:()=>amount,setMaximum(value){maximumWords=value;amount=value?Math.min(Math.max(1,amount||10),value):0;update();}};
}
function wordLabel(number){return number%10===1&&number%100!==11?'слово':number%10>=2&&number%10<=4&&(number%100<12||number%100>14)?'слова':'слів';}
function sectionWordPool(ids,selectedIds=null){
  if(!Array.isArray(ids)||!ids.length||ids.some(id=>!categories.some(c=>c.id===id)))throw Error('Невідомий розділ');
  if(selectedIds!==null&&(!Array.isArray(selectedIds)||!selectedIds.length||new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>!words.some(word=>word.id===id&&ids.includes(word.category)))))throw Error('Некоректний список слів');
  return words.filter(word=>ids.includes(word.category)&&(selectedIds===null||selectedIds.includes(word.id)));
}
function showSectionWords(ids,mixed=false,chosenIds=[]){
  cancelWordSearch();screen='section-words';session=null;selection=null;
  const list=sectionWordPool(ids),chosen=new Set(chosenIds.filter(id=>list.some(word=>word.id===id))),category=categories.find(c=>c.id===ids[0]);
  app.innerHTML=`<div class="study-top"><button type="button" class="back" id="back">${mixed?'‹ Обрати розділи':groupBackLabel()}</button></div><section class="word-list-panel section-words-panel"><div class="eyebrow">Усі слова розділу</div><h1>${escapeHTML(practiceTitle(category,mixed))}</h1>${!mixed&&category.ukTitle?`<p class="section-uk-title" lang="uk">${escapeHTML(category.ukTitle)}</p>`:''}<p class="sub">${list.length} ${wordLabel(list.length)}. Познач слова, які хочеш вчити. Якщо нічого не позначено, доступний увесь список.</p><div class="word-list-tools"><button type="button" class="btn secondary" id="select-all-words">Обрати всі</button><button type="button" class="btn secondary" id="clear-word-choice">Зняти вибір</button></div><div class="section-word-list">${list.map((word,index)=>`<div class="section-word-option"><label class="section-word-choice"><input type="checkbox" id="section-word-${index}" ${chosen.has(word.id)?'checked':''}>${wordDetails(word)}</label><button type="button" class="word-audio section-word-audio" id="section-audio-${index}" title="Послухати англійською" aria-label="Послухати англійською: ${escapeHTML(word.en)}"><span aria-hidden="true">♫</span></button></div>`).join('')}</div><div class="section-list-bottom"><p id="list-choice-count" role="status" aria-live="polite"></p><button type="button" class="btn" id="learn-section">Почати вчити</button></div></section>`;
  document.getElementById('back').onclick=()=>mixed?picker(ids):home();
  const inputs=list.map((word,index)=>({word,input:document.getElementById('section-word-'+index)}));
  const update=()=>{document.getElementById('list-choice-count').textContent=chosen.size?`Обрано: ${chosen.size} ${wordLabel(chosen.size)}`:`Для навчання доступно: ${list.length} ${wordLabel(list.length)}`;document.getElementById('clear-word-choice').disabled=chosen.size===0;document.getElementById('learn-section').disabled=list.length===0;};
  inputs.forEach(({word,input})=>input.onchange=()=>{input.checked?chosen.add(word.id):chosen.delete(word.id);update();});
  list.forEach((word,index)=>document.getElementById('section-audio-'+index).onclick=()=>speak(word.en,'en',word.audio));
  document.getElementById('select-all-words').onclick=()=>{inputs.forEach(({word,input})=>{input.checked=true;chosen.add(word.id);});update();};
  document.getElementById('clear-word-choice').onclick=()=>{inputs.forEach(({input})=>input.checked=false);chosen.clear();update();};
  document.getElementById('learn-section').onclick=()=>{if(list.length)chooseAmount(ids,mixed,chosen.size||10,chosen.size?[...chosen]:null);};
  update();
}
function chooseAmount(ids,mixed=false,initialAmount=10,selectedIds=null){
  const available=sectionWordPool(ids,selectedIds);
  screen='amount';session=null;selection=null;
  const category=categories.find(c=>c.id===ids[0]);
  app.innerHTML=`<div class="study-top"><button class="back" id="back">${groupBackLabel()}</button></div><section class="mix-picker amount-picker"><div class="eyebrow">${mixed?'Змішано':category.en}</div><h1>${practiceTitle(category,mixed)}</h1>${category.ukTitle?`<p class="section-uk-title" lang="uk">${category.ukTitle}</p>`:''}${amountControls()}<button class="btn" id="start-session">Почати</button></section>`;
  document.getElementById('back').textContent='‹ До списку слів';
  document.getElementById('back').onclick=()=>showSectionWords(ids,mixed,selectedIds||[]);
  const button=document.getElementById('start-session');
  const amount=bindAmount(available.length,button,initialAmount);
  button.onclick=()=>suggestWords(ids,mixed,amount.value(),selectedIds);
}
function picker(initialIds=basicCategories().map(c=>c.id)){
  screen='picker';session=null;selection=null;
  app.innerHTML=`<div class="study-top"><button class="back" id="back">${groupBackLabel()}</button></div><section class="mix-picker"><div class="eyebrow">Трохи всього</div><h1>Змішай свій словник</h1><p class="sub">Обери розділи, щоб переглянути всі їхні слова.</p><div class="pick-options">${basicCategories().map(c=>`<label><input type="checkbox" value="${c.id}" ${initialIds.includes(c.id)?'checked':''}><span>${c.name}</span><small>${words.filter(word=>word.category===c.id).length} ${wordLabel(words.filter(word=>word.category===c.id).length)}</small></label>`).join('')}</div><button class="btn" id="start-mix">Переглянути слова</button></section>`;
  document.getElementById('back').onclick=home;
  const selected=()=>[...app.querySelectorAll('.pick-options input:checked')].map(x=>x.value);
  const button=document.getElementById('start-mix');
  const update=()=>button.disabled=!selected().length;
  app.querySelectorAll('.pick-options input').forEach(input=>input.onchange=update);
  button.onclick=()=>{if(selected().length)showSectionWords(selected(),true);};
  update();
}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function escapeHTML(text){return String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function wordDetails(word){const category=categories.find(c=>c.id===word.category);return `<span class="word-details"><strong lang="en">${escapeHTML(word.en)}</strong><span lang="uk">${escapeHTML(word.uk)}</span><small>${category.name}${learned.has(word.id)?' · Вивчено':''}</small></span>`;}
function suggestWords(ids,mixed,amount,selectedIds=null){
  if(!Array.isArray(ids)||!Number.isInteger(amount)||amount<1||!ids.length||ids.some(id=>!categories.some(c=>c.id===id)))throw Error('Некоректні параметри вибору слів');
  const available=sectionWordPool(ids,selectedIds);
  if(amount>available.length)throw Error('Недостатньо слів у вибраних розділах');
  const deck=[...shuffle(available.filter(word=>!learned.has(word.id))),...shuffle(available.filter(word=>learned.has(word.id)))];
  selection={ids:[...ids],mixed,target:amount,selectedIds:selectedIds===null?null:[...selectedIds],deck,index:0,chosen:[],skipped:[],busy:false};
  screen='selection';session=null;
  app.innerHTML=`<div class="study-top"><button class="back" id="back">‹ Змінити кількість</button></div><section class="word-list-panel swipe-panel"><div class="eyebrow">${mixed?'Змішано':categories.find(c=>c.id===ids[0]).name}</div><h1>Обери свої слова</h1><p class="sub">Вправо — вчити. Вліво — не вчити.</p><div class="swipe-progress"><p id="selected-total" class="selection-total" role="status" aria-live="polite"></p><div class="track"><div class="fill" id="selection-fill"></div></div></div><div id="swipe-content"></div></section>`;
  document.getElementById('back').onclick=()=>chooseAmount(ids,mixed,amount,selectedIds);
  renderSwipeCard();
}
function renderSwipeCard(){
  const s=selection;if(screen!=='selection'||!s)return;
  document.getElementById('selected-total').textContent=`Обрано: ${s.chosen.length} із ${s.target}`;
  document.getElementById('selection-fill').style.width=`${s.chosen.length/s.target*100}%`;
  const box=document.getElementById('swipe-content');
  if(s.index>=s.deck.length){
    box.innerHTML=`<div class="swipe-empty"><h2>Усі слова переглянуто</h2><p>До початку навчання залишилося обрати ${s.target-s.chosen.length} ${wordLabel(s.target-s.chosen.length)}. Переглянь пропущені слова або зміни кількість.</p><button class="btn" id="review-skipped">Переглянути пропущені</button></div>`;
    document.getElementById('review-skipped').onclick=()=>{if(screen!=='selection'||selection!==s||s.busy)return;s.deck=shuffle(s.skipped);s.skipped=[];s.index=0;renderSwipeCard();};
    return;
  }
  const word=s.deck[s.index],category=categories.find(c=>c.id===word.category);
  box.innerHTML=`<div class="swipe-stage"><article class="swipe-card" id="swipe-card" tabindex="0" aria-label="${escapeHTML(word.en)}. Проведи вправо, щоб вчити, або вліво, щоб пропустити"><span class="swipe-stamp stamp-skip" aria-hidden="true">Не вчити</span><span class="swipe-stamp stamp-learn" aria-hidden="true">Вчити</span><div class="card-tag">${category.name}${learned.has(word.id)?' · Вивчено':''}</div><div class="swipe-english" lang="en">${escapeHTML(word.en)}</div><div class="swipe-translation" lang="uk">${escapeHTML(word.uk)}</div><p class="swipe-instruction">Проведи карткою вліво або вправо</p></article></div><div class="swipe-actions"><button type="button" class="btn secondary" id="swipe-skip">Не вчити</button><button type="button" class="btn" id="swipe-learn">Вчити</button></div><p class="swipe-note">Навчання почнеться, коли обереш ${s.target} ${wordLabel(s.target)}.</p>`;
  document.getElementById('swipe-skip').onclick=()=>decideSwipe(false);
  document.getElementById('swipe-learn').onclick=()=>decideSwipe(true);
  bindSwipeGesture(document.getElementById('swipe-card'));
}
function decideSwipe(accepted){
  const s=selection;if(screen!=='selection'||!s||s.busy||s.index>=s.deck.length)return;
  s.busy=true;
  document.getElementById('swipe-skip').disabled=true;
  document.getElementById('swipe-learn').disabled=true;
  const card=document.getElementById('swipe-card');
  card.style.transform='';card.classList.add(accepted?'swipe-out-right':'swipe-out-left');
  setTimeout(()=>{
    if(screen!=='selection'||selection!==s)return;
    const word=s.deck[s.index++];
    if(accepted)s.chosen.push(word);else s.skipped.push(word);
    s.busy=false;
    if(s.chosen.length===s.target){selection=null;start(s.ids,s.mixed,false,s.target,s.chosen.map(word=>word.id));return;}
    renderSwipeCard();
  },160);
}
function bindSwipeGesture(card){
  let drag=null;
  const reset=()=>{drag=null;card.style.transform='';card.classList.remove('is-dragging','is-learning','is-skipping');};
  card.onpointerdown=event=>{
    if(screen!=='selection'||!selection||selection.busy||drag||event.isPrimary===false||(event.pointerType==='mouse'&&event.button!==0))return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY};
    try{card.setPointerCapture(event.pointerId);}catch{}
    card.classList.add('is-dragging');
  };
  card.onpointermove=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    if(event.cancelable)event.preventDefault();
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy)*1.2)return;
    card.style.transform=`translateX(${dx}px) rotate(${Math.max(-15,Math.min(15,dx/20))}deg)`;
    card.classList.toggle('is-learning',dx>0);card.classList.toggle('is-skipping',dx<0);
  };
  card.onpointerup=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    const threshold=Math.min(80,card.getBoundingClientRect().width*.22);
    reset();
    try{card.releasePointerCapture(event.pointerId);}catch{}
    if(Math.abs(dx)>=threshold&&Math.abs(dx)>Math.abs(dy)*1.2)decideSwipe(dx>0);
  };
  card.onpointercancel=reset;card.onlostpointercapture=reset;
}
function showLearned(){
  cancelWordSearch();screen='learned';session=null;selection=null;
  const list=words.filter(word=>learned.has(word.id));
  app.innerHTML=`<div class="study-top"><button class="back" id="back">${groupBackLabel()}</button></div><section class="word-list-panel"><div class="eyebrow">Твій словник</div><h1>Вивчені слова</h1><p class="sub">${list.length?`${list.length} ${wordLabel(list.length)} уже знайомі.`:'Тут з’являться слова, які ти позначиш кнопкою «Знаю» під час навчання.'}</p>${list.length?`<div class="learned-list">${list.map(word=>`<div class="learned-word">${wordDetails(word)}</div>`).join('')}</div>`:'<div class="learned-empty"><p>Почни з кількох карток — і твій словник поступово зростатиме.</p><button class="btn" id="learned-start">Обрати розділ</button></div>'}</section>`;
  document.getElementById('back').onclick=home;
  if(!list.length)document.getElementById('learned-start').onclick=home;
}
function start(ids,mixed=false,onlyNew=false,limit=null,selectedIds=null){
  if(!Array.isArray(ids)||!ids.length||ids.some(id=>!categories.some(c=>c.id===id)))throw Error('Невідомий розділ');
  if(limit!==null&&(!Number.isInteger(limit)||limit<1))throw Error('Некоректна кількість слів');
  if(selectedIds!==null&&(!Array.isArray(selectedIds)||!selectedIds.length||new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>!words.some(word=>word.id===id&&ids.includes(word.category)))))throw Error('Некоректний список слів');
  let list=selectedIds===null?words.filter(word=>ids.includes(word.category)):selectedIds.map(id=>words.find(word=>word.id===id));
  if(onlyNew)list=list.filter(word=>!learned.has(word.id));
  if(mixed&&selectedIds===null)list=shuffle(list);
  if(limit!==null)list=list.slice(0,limit);
  session={ids,mixed,onlyNew,limit,selectedIds,queue:list,index:0,flipped:false,correct:0,review:[],initial:list.length};
  screen='study';renderStudy();
}
function renderStudy(){const s=session;const c=categories.find(c=>c.id===s.ids[0]);app.innerHTML=`<div class="study-top"><button class="back" id="back">${groupBackLabel()}</button><span class="en">${s.queue.length} ${wordLabel(s.queue.length)} у цій сесії</span></div><div class="study-layout"><aside class="study-aside">${tile(c)}<div class="eyebrow">${s.mixed?'Mix & learn':c.en}</div><h1>${s.mixed?'Змішано':practiceTitle(c)}</h1><p class="sub">Не поспішай. Дай слову час.</p><div class="settings"><label for="direction">Напрямок</label><select id="direction"><option value="en">English → Українська</option><option value="uk">Українська → English</option></select><label class="check"><input id="only-new" type="checkbox" ${s.onlyNew?'checked':''}> Лише невивчені</label></div></aside><section class="study-main" id="study-content"></section></div>`;document.getElementById('back').onclick=home;const d=document.getElementById('direction');d.value=reversed?'uk':'en';d.onchange=()=>{reversed=d.value==='uk';s.flipped=false;renderCard();};document.getElementById('only-new').onchange=e=>start(s.ids,s.mixed,e.target.checked,s.limit,s.selectedIds);renderCard();}
function renderCard(){const s=session,box=document.getElementById('study-content');if(s.index>=s.queue.length){box.innerHTML=`<div class="done"><div class="eyebrow">${s.initial?'Гарна робота':'Усе вже знайоме'}</div><h2>${s.initial?'Ще один маленький крок!':'Ці слова вже вивчено'}</h2><p>${s.initial?`За цю сесію: ${s.correct} знайомих слів.<br>Ще повторити: ${s.review.length}.`:'Можеш повторити весь розділ або обрати інший.'}</p>${s.review.length?'<button class="btn" id="review">Повторити складні</button>':''}<button class="btn secondary" id="restart">Почати знову</button><button class="btn secondary" id="done-home">До розділів</button></div>`;if(s.review.length)document.getElementById('review').onclick=()=>{s.queue=shuffle(s.review);s.initial=s.queue.length;s.review=[];s.index=0;s.correct=0;s.flipped=false;renderCard();};document.getElementById('restart').onclick=()=>start(s.ids,s.mixed,false,s.limit,s.selectedIds);document.getElementById('done-home').onclick=home;document.getElementById('done-home').textContent=learningGroup==='daily'?`До розділів Етапу ${dailyStageNumber()}`:'До розділів';return;}
const w=s.queue[s.index],c=categories.find(c=>c.id===w.category),isUk=reversed!==s.flipped;
box.innerHTML=`<div class="session-status"><span>${c.name}</span><span>${s.index+1} / ${s.queue.length}</span></div><div class="flashcard" id="flashcard" tabindex="0" role="button" aria-label="${s.flipped?'Показати слово':'Показати переклад'}"><div class="card-tag">${isUk?'Українська':'English'}</div><div class="word ${isUk?'uk':''}" lang="${isUk?'uk':'en'}">${escapeHTML(isUk?w.uk:w.en)}</div><div class="card-hint">${s.flipped?'Як добре пам’ятаєш це слово?':'Торкнись, щоб побачити переклад'}</div></div><div style="text-align:center"><button class="speak" id="speak" aria-label="Послухати англійську вимову">♫ Послухати вимову</button></div><div class="actions">${s.flipped?'<button class="btn repeat" id="repeat">Ще повторю</button><button class="btn" id="known">Знаю ✓</button>':'<button class="btn" id="reveal">Показати переклад</button>'}</div><div class="study-progress"><div class="track"><div class="fill" style="width:${s.index/s.queue.length*100}%"></div></div></div><p class="key-hint">Пробіл — перевернути · 1 — ще повторю · 2 — знаю</p>`;
const flip=()=>{s.flipped=!s.flipped;renderCard();};document.getElementById('flashcard').onclick=flip;document.getElementById('flashcard').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();flip();}};const audioButton=document.getElementById('speak');audioButton.setAttribute('aria-label',isUk?'Послухати українську вимову':'Послухати англійську вимову');audioButton.onclick=()=>speak(isUk?w.uk:w.en,isUk?'uk':'en',isUk?w.ukAudio:w.audio);if(s.flipped){document.getElementById('repeat').onclick=()=>rate(false);document.getElementById('known').onclick=()=>rate(true);}else document.getElementById('reveal').onclick=flip;}
function rate(known){if(!session||!session.flipped||session.index>=session.queue.length)return;const w=session.queue[session.index];if(known){learned.add(w.id);session.correct++;}else{learned.delete(w.id);session.review.push(w);}save();session.index++;session.flipped=false;renderCard();}
let activeWordAudio=null,speechVersion=0,cancelVoiceWait=null;
function preferredWordVoice(voices,lang){
  const locale=lang==='uk'?'uk-ua':'en-us';
  const candidates=voices.filter(voice=>String(voice.lang||'').toLowerCase().replace(/_/g,'-').split('-')[0]===lang);
  const score=voice=>{
    const name=String(voice.name||'');
    return (/google/i.test(name)?1000:0)+(/natural|neural|wavenet|chirp/i.test(name)?200:0)+(/premium|enhanced/i.test(name)?100:0)+(String(voice.lang).toLowerCase().replace(/_/g,'-')===locale?30:0)+(voice.localService===false?10:0)+(voice.default?1:0);
  };
  return candidates.sort((a,b)=>score(b)-score(a))[0]||null;
}
function speak(word,lang='en',audioURL=''){
  const version=++speechVersion;
  cancelVoiceWait?.();cancelVoiceWait=null;
  if(activeWordAudio){activeWordAudio.pause();activeWordAudio=null;}
  window.speechSynthesis?.cancel();
  const url=safeWordAudio(audioURL);
  const unavailable=()=>{if(version===speechVersion)toast(lang==='uk'?'Українське озвучення недоступне. Додай український голос у налаштуваннях пристрою.':'Англійське озвучення недоступне. Перевір налаштування голосів пристрою.');};
  const recording=()=>{
    if(version!==speechVersion)return;
    if(!url||!window.Audio){unavailable();return;}
    const audio=new window.Audio(url);activeWordAudio=audio;
    audio.onerror=unavailable;audio.onended=()=>{if(activeWordAudio===audio)activeWordAudio=null;};
    try{audio.play()?.catch(unavailable);}catch{unavailable();}
  };
  const browserVoice=()=>{
    if(version!==speechVersion)return;
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){recording();return;}
    const speech=window.speechSynthesis,u=new window.SpeechSynthesisUtterance(word);
    const voices=speech.getVoices();u.voice=preferredWordVoice(voices,lang);
    if(voices.length&&!u.voice){recording();return;}
    u.lang=u.voice?.lang||(lang==='uk'?'uk-UA':'en-US');u.rate=.95;u.pitch=1;u.volume=1;
    u.onerror=event=>{if(version===speechVersion&&event.error!=='interrupted'&&event.error!=='canceled')recording();};
    try{speech.speak(u);}catch{recording();}
  };
  const speech=window.speechSynthesis;
  if(speech&&window.SpeechSynthesisUtterance&&!speech.getVoices().length&&speech.addEventListener){
    let timer;
    const cleanup=()=>{clearTimeout(timer);speech.removeEventListener('voiceschanged',ready);if(cancelVoiceWait===cleanup)cancelVoiceWait=null;};
    const ready=()=>{if(!speech.getVoices().length)return;cleanup();browserVoice();};
    cancelVoiceWait=cleanup;speech.addEventListener('voiceschanged',ready);
    timer=setTimeout(()=>{cleanup();browserVoice();},700);
    ready();
  }else browserVoice();
}
window.speechSynthesis?.getVoices();
document.querySelector('.brand').onclick=e=>{e.preventDefault();landing();};document.addEventListener('keydown',e=>{if(screen==='selection'&&selection){if(!['INPUT','SELECT','BUTTON','A'].includes(document.activeElement.tagName)&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();decideSwipe(e.key==='ArrowRight');}return;}if(screen!=='study'||!session||session.index>=session.queue.length||['INPUT','SELECT','BUTTON','A'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();session.flipped=!session.flipped;renderCard();}if(e.key==='1')rate(false);if(e.key==='2')rate(true);});
landing();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'start_word_practice',description:'Почати вивчення слів із вибраних розділів. Не змінює вивчені слова.',inputSchema:{type:'object',properties:{categories:{type:'array',items:{type:'string',enum:categories.map(c=>c.id)},minItems:1},mixed:{type:'boolean'}},required:['categories'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input!=='object'||(input.mixed!==undefined&&typeof input.mixed!=='boolean'))throw Error('Некоректні параметри');start(input.categories,Boolean(input.mixed));return{screen:'study',cards:session.queue.length,categories:session.ids};}})).catch(()=>{});}catch{}}
