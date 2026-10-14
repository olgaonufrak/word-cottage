'use strict';
function normalizeAnswer(value){return String(value).normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").replace(/[“”«»"]/g,'').replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();}
function sentenceTokens(value){return value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[];}
function normalizeSentence(value){return sentenceTokens(value).map(normalizeAnswer).join(' ');}
const sentenceTranslationCache=new Map();
let sentenceTranslationRequest=0;
function sentenceWordMarkup(sentence,scope,output=scope+'-translation'){
  let index=0,last=0,html='';
  for(const match of sentence.matchAll(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)){
    html+=escapeHTML(sentence.slice(last,match.index))+`<button type="button" class="example-word" id="${scope}-word-${index++}" data-sentence-word="${escapeHTML(match[0])}" data-translation-output="${output}" aria-label="Перекласти слово ${escapeHTML(match[0])}" aria-controls="${output}" aria-pressed="false" lang="en">${escapeHTML(match[0])}</button>`;
    last=match.index+match[0].length;
  }
  return html+escapeHTML(sentence.slice(last));
}
function sentenceTranslationOutput(id){return `<p id="${id}" class="sentence-word-translation" role="status" aria-live="polite" hidden></p>`;}
function exampleMarkup(sentence,translation,scope){return `<div class="lesson-example"><p lang="en">${sentenceWordMarkup(sentence,scope)}</p><p lang="uk">${escapeHTML(translation)}</p>${sentenceTranslationOutput(scope+'-translation')}</div>`;}
function exerciseAudioMarkup(){return `<div class="lesson-audio-controls"><div class="lesson-audio-row"><button type="button" class="speak" id="exercise-audio">♫ Послухати слово</button><button type="button" class="speak audio-slow" id="exercise-audio-slow" aria-label="Послухати слово зі швидкістю 0,35">×0,35</button></div><div class="lesson-audio-row"><button type="button" class="speak" id="example-audio">♫ Послухати приклад</button><button type="button" class="speak audio-slow" id="example-audio-slow" aria-label="Послухати приклад зі швидкістю 0,35">×0,35</button></div></div>`;}
function localSentenceTranslation(token,lesson){
  const key=normalizeWord(token);
  if(key===normalizeWord(lesson.word.en))return lesson.word.uk;
  return sentenceGlosses[key]||words.find(word=>normalizeWord(word.en)===key)?.uk||'';
}
async function showSentenceTranslation(token,outputId,lesson){
    const output=document.getElementById(outputId);
    if(!output)return;
    const state=session?.exercise,step=state?.step,index=state?.index,request=++sentenceTranslationRequest;
    output.dataset.request=String(request);output.hidden=false;
    const local=localSentenceTranslation(token,lesson)||sentenceTranslationCache.get(normalizeWord(token));
    if(local){output.textContent=token+' — '+local;return;}
    output.textContent=token+' — …';
    const current=()=>screen==='exercises'&&session?.exercise===state&&state.step===step&&state.index===index&&document.getElementById(output.id)===output&&output.dataset.request===String(request);
    try{
      const translation=await translateWord(token,'en|uk');
      sentenceTranslationCache.set(normalizeWord(token),translation);
      if(current())output.textContent=token+' — '+translation;
    }catch{if(current())output.textContent=token+' — переклад зараз недоступний';}
}
function bindSentenceWords(root,lesson){
  root.querySelectorAll('[data-sentence-word]').forEach(button=>button.onclick=()=>{
    root.querySelectorAll('[data-sentence-word]').forEach(word=>word.setAttribute('aria-pressed',String(word===button)));
    return showSentenceTranslation(button.dataset.sentenceWord,button.dataset.translationOutput,lesson);
  });
}
function startExercises(s){
  screen='exercises';
  s.exercise={step:0,index:0,lessons:s.queue.map(wordLesson),difficult:new Set(),selfChecked:new Set(),completed:new Set(),hint:false,answered:false};
  renderExercise();
}
function recognitionOptions(lesson,s){
  const target=lesson.word,options=[target],seen=new Set([normalizeAnswer(target.en)]),meanings=new Set([normalizeAnswer(target.uk.split(';')[0])]);
  // Prefer words just introduced; a one-word lesson still gets distinct options.
  for(const candidate of [...shuffle(s.queue),...shuffle(words.filter(word=>word.category===target.category)),...shuffle(words)]){
    const english=normalizeAnswer(candidate.en),meaning=normalizeAnswer(candidate.uk.split(';')[0]);
    if(seen.has(english)||meanings.has(meaning))continue;
    seen.add(english);meanings.add(meaning);options.push(candidate);
    if(options.length===3)break;
  }
  return shuffle(options);
}
function ownSentenceResult(answer,lesson,s){
  const text=normalizeAnswer(answer);
  if(!text)return {kind:'empty',message:'Спочатку напиши речення.'};
  const known=new Set(s.exercise.lessons.flatMap(item=>item.variants.flatMap(sentence=>sentenceTokens(sentence).map(normalizeAnswer))));
  const unknown=sentenceTokens(answer).map(normalizeAnswer).filter(token=>!known.has(token));
  if(unknown.length)return {kind:'unknown',message:`Поки використай знайомі слова. Нові слова: ${[...new Set(unknown)].join(', ')}.`};
  const answerTokens=sentenceTokens(answer).map(normalizeAnswer);
  const containsTarget=lesson.forms.some(form=>{const targetTokens=sentenceTokens(form).map(normalizeAnswer);return answerTokens.some((_,index)=>targetTokens.every((token,offset)=>answerTokens[index+offset]===token));});
  if(!containsTarget)return {kind:'missing',message:'Додай до речення слово або вираз із завдання.'};
  const examples=s.exercise.lessons.flatMap(item=>item.variants);
  if(examples.some(example=>normalizeSentence(example)===normalizeSentence(answer)))return {kind:'correct',message:'Правильно!'};
  return {kind:'manual',message:'Потрібна самоперевірка.'};
}
function exerciseFeedback(message,kind='neutral'){
  const box=document.getElementById('exercise-feedback');box.textContent=message;box.className='exercise-feedback '+kind;
}
function finishExerciseAnswer(){
  const e=session.exercise;if(e.answered)return;e.answered=true;
  document.getElementById('exercise-next').disabled=false;
  document.getElementById('exercise-check')?.setAttribute('disabled','');
  const input=document.getElementById('exercise-answer');if(input)input.disabled=true;
  document.getElementById('exercise-next').focus?.();
}
function nextExercise(){
  const s=session,e=s?.exercise;if(screen!=='exercises'||!e||!e.answered)return;
  if(e.step===5){
    const word=e.lessons[e.index].word;
    if(!e.selfChecked.has(word.id)){learned.add(word.id);e.completed.add(word.id);save();}
  }
  e.index++;
  if(e.index===e.lessons.length){e.index=0;e.step++;}
  e.hint=false;e.answered=false;e.options=null;e.tokens=null;e.picked=[];
  renderExercise();
}
function exerciseHint(){
  const s=session,e=s.exercise,lesson=e.lessons[e.index];
  if(e.answered)return;
  e.hint=true;e.difficult.add(lesson.word.id);
  document.getElementById('exercise-hint-content').innerHTML=`<strong lang="en">${escapeHTML(lesson.word.en)}</strong>${wordIpaMarkup(lesson.word)} — ${escapeHTML(lesson.word.uk)}<p lang="en">${sentenceWordMarkup(lesson.sentence,'hint')}</p><p>${escapeHTML(lesson.translation)}</p>${sentenceTranslationOutput('hint-translation')}`;
  document.getElementById('exercise-hint-content').hidden=false;
  hydrateWordIpa(document.getElementById('exercise-hint-content'));
  bindSentenceWords(document.getElementById('exercise-hint-content'),lesson);
  exerciseFeedback('');
}
function checkExercise(){
  const s=session,e=s?.exercise;if(screen!=='exercises'||!e||e.answered)return;
  const lesson=e.lessons[e.index],input=document.getElementById('exercise-answer');
  let correct=false;
  if(e.step===2||e.step===3){
    if(!input.value.trim()){exerciseFeedback('Спочатку напиши відповідь.');return;}
    correct=normalizeAnswer(input.value)===normalizeAnswer(e.step===3?lesson.target:lesson.word.en);
  }else if(e.step===4){
    if(e.picked.length!==e.tokens.length){exerciseFeedback('Використай усі слова, а потім перевір речення.');return;}
    correct=normalizeSentence(e.picked.map(index=>e.tokens[index]).join(' '))===normalizeSentence(lesson.sentence);
  }else if(e.step===5){
    const result=ownSentenceResult(input.value,lesson,s);
    if(result.kind==='manual'){
      exerciseFeedback(result.message);
      document.getElementById('exercise-self-check').hidden=false;
      return;
    }
    correct=result.kind==='correct';
    if(!correct){if(result.kind!=='empty')e.difficult.add(lesson.word.id);exerciseFeedback(result.message,result.kind==='empty'?'neutral':'retry');return;}
  }
  if(correct){exerciseFeedback('Правильно!','correct');finishExerciseAnswer();}
  else{e.difficult.add(lesson.word.id);exerciseFeedback('Спробуй ще раз.','retry');}
}
function renderSentenceBuilder(){
  const e=session.exercise;
  document.getElementById('sentence-answer').innerHTML=e.picked.length?e.picked.map((index,position)=>`<button type="button" class="sentence-token" id="chosen-token-${position}" lang="en" aria-label="Прибрати слово ${escapeHTML(e.tokens[index])}">${escapeHTML(e.tokens[index])} <span aria-hidden="true">×</span></button>`).join(''):'<span class="sentence-placeholder">Твоє речення</span>';
  document.getElementById('sentence-bank').innerHTML=e.tokens.map((token,index)=>`<button type="button" class="sentence-token" id="bank-token-${index}" lang="en" ${e.picked.includes(index)?'disabled':''}>${escapeHTML(token)}</button>`).join('');
  e.tokens.forEach((_,index)=>{const button=document.getElementById('bank-token-'+index);button.disabled=e.answered||e.picked.includes(index);button.onclick=()=>{if(e.answered||e.picked.includes(index))return;e.picked.push(index);renderSentenceBuilder();exerciseFeedback('');return showSentenceTranslation(e.tokens[index],'builder-translation',e.lessons[e.index]);};});
  e.picked.forEach((index,position)=>document.getElementById('chosen-token-'+position).onclick=()=>{if(e.answered)return;e.picked.splice(position,1);renderSentenceBuilder();exerciseFeedback('');return showSentenceTranslation(e.tokens[index],'builder-translation',e.lessons[e.index]);});
}
function renderExercise(){
  const s=session,e=s.exercise;
  if(!e.lessons.length||e.step===6){renderExerciseDone();return;}
  const lesson=e.lessons[e.index],word=lesson.word,step=e.step;
  const progress=(step*e.lessons.length+e.index)/(6*e.lessons.length)*100;
  let content='';
  if(step===0)content=`<div class="lesson-intro">${lesson.emoji?`<div class="lesson-emoji" aria-hidden="true">${lesson.emoji}</div>`:''}<h2 id="exercise-title" tabindex="-1" lang="en">${escapeHTML(word.en)}</h2>${wordIpaMarkup(word)}<p class="lesson-translation" lang="uk">${escapeHTML(word.uk)}</p>${exampleMarkup(lesson.sentence,lesson.translation,'example')}${lesson.extra.map((item,index)=>exampleMarkup(item.sentence,item.translation,'extra-'+index)).join('')}${exerciseAudioMarkup()}</div>`;
  if(step===1){
    e.options=e.options||recognitionOptions(lesson,s);
    content=`<h2 id="exercise-title" tabindex="-1">Обери англійською</h2><p class="exercise-prompt recognition-prompt" lang="uk">${escapeHTML(word.uk)}</p><div class="recognition-options">${e.options.map((option,index)=>`<button type="button" class="recognition-option" id="exercise-option-${index}" lang="en">${escapeHTML(option.en)}${wordIpaMarkup(option)}</button>`).join('')}</div>`;
  }
  if(step===2)content=`<h2 id="exercise-title" tabindex="-1">Напиши англійською</h2><p class="exercise-prompt" lang="uk">${escapeHTML(word.uk)}</p>${exerciseInput('Напиши англійське слово або вираз')}`;
  if(step===3)content=`<h2 id="exercise-title" tabindex="-1">Встав пропущене</h2><p class="exercise-prompt" lang="en">${sentenceWordMarkup(lesson.before,'gap-before','gap-translation')}<span class="sentence-gap">____</span>${sentenceWordMarkup(lesson.after,'gap-after','gap-translation')}</p>${sentenceTranslationOutput('gap-translation')}<p lang="uk">${escapeHTML(lesson.target.toLowerCase()===word.en.toLowerCase()?word.uk:sentenceGlosses[normalizeWord(lesson.target)]||word.uk)}</p>${exerciseInput('Напиши пропущене англійською')}`;
  if(step===4){
    if(!e.tokens){e.tokens=shuffle(sentenceTokens(lesson.sentence));e.picked=[];if(normalizeAnswer(e.tokens.join(' '))===normalizeAnswer(lesson.sentence))e.tokens.reverse();}
    content=`<h2 id="exercise-title" tabindex="-1">Склади речення</h2><p class="exercise-prompt" lang="uk">${escapeHTML(lesson.translation)}</p><div id="sentence-answer" class="sentence-answer" aria-label="Твоє речення"></div><div id="sentence-bank" class="sentence-bank" aria-label="Слова для складання речення"></div>${sentenceTranslationOutput('builder-translation')}<button type="button" class="btn secondary" id="sentence-clear">Очистити</button><button type="button" class="btn" id="exercise-check">Перевірити</button>`;
  }
  if(step===5)content=`<h2 id="exercise-title" tabindex="-1">Напиши речення</h2><p class="exercise-prompt">Використай: <span lang="uk">${escapeHTML(word.uk)}</span></p><details class="known-vocabulary"><summary>Слова</summary><p lang="en">${escapeHTML([...new Set(e.lessons.flatMap(item=>item.variants.flatMap(sentenceTokens)))].join(' · '))}</p></details>${exerciseInput('Напиши завершене речення англійською',true)}<div id="exercise-self-check" hidden><button type="button" class="btn secondary" id="confirm-self-check">Перевірено самостійно</button></div>`;
  app.innerHTML=`<div class="study-top"><button type="button" class="back" id="back">${groupBackLabel()}</button><span>${step*e.lessons.length+e.index+1} / ${6*e.lessons.length}</span></div><section class="exercise-panel" aria-label="Вправа"><div class="exercise-content">${content}<div id="exercise-hint-content" class="lesson-example" hidden></div><p id="exercise-feedback" class="exercise-feedback" role="status" aria-live="polite"></p><div class="exercise-actions">${step?'<button type="button" class="btn secondary" id="exercise-hint">Підказка</button>':''}<button type="button" class="btn" id="exercise-next">${step===5&&e.index===e.lessons.length-1?'Завершити':'Далі →'}</button></div></div><div class="exercise-progress" role="progressbar" aria-label="Прогрес заняття" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div></section>`;
  document.getElementById('back').onclick=home;
  document.getElementById('exercise-next').disabled=step!==0;
  document.getElementById('exercise-next').onclick=()=>{if(step===0)e.answered=true;nextExercise();};
  if(step===0){
    document.getElementById('exercise-audio').onclick=()=>speak(word.en,'en',word.audio);
    document.getElementById('exercise-audio-slow').onclick=()=>speak(word.en,'en',word.audio,.35);
    document.getElementById('example-audio').onclick=()=>speak(lesson.sentence,'en');
    document.getElementById('example-audio-slow').onclick=()=>speak(lesson.sentence,'en','',.35);
  }
  else document.getElementById('exercise-hint').onclick=exerciseHint;
  if(step===1)e.options.forEach((option,index)=>document.getElementById('exercise-option-'+index).onclick=()=>{
    if(e.answered)return;
    if(option.id===word.id){
      const button=document.getElementById('exercise-option-'+index);
      button.setAttribute('data-correct','true');
      button.setAttribute('aria-label',option.en+' — правильна відповідь');
      exerciseFeedback('Правильно!','visually-hidden');
      finishExerciseAnswer();
      e.options.forEach((_,i)=>document.getElementById('exercise-option-'+i).disabled=true);
    }
    else{
      e.difficult.add(word.id);
      const button=document.getElementById('exercise-option-'+index);
      button.setAttribute('aria-invalid','true');
      button.setAttribute('aria-label',option.en+' — неправильна відповідь');
      button.disabled=true;
      exerciseFeedback('Неправильна відповідь.','visually-hidden');
    }
  });
  if(step===2||step===3||step===5){
    document.getElementById('exercise-form').onsubmit=event=>{event.preventDefault();checkExercise();};
    if(step===5){
      document.getElementById('exercise-answer').oninput=()=>{document.getElementById('exercise-self-check').hidden=true;exerciseFeedback('');};
      document.getElementById('confirm-self-check').onclick=()=>{
        if(e.answered||ownSentenceResult(document.getElementById('exercise-answer').value,lesson,s).kind!=='manual')return;
        e.selfChecked.add(word.id);e.difficult.add(word.id);exerciseFeedback('Додано до повторення.');finishExerciseAnswer();
      };
    }
  }
  if(step===4){renderSentenceBuilder();document.getElementById('exercise-check').onclick=checkExercise;document.getElementById('sentence-clear').onclick=()=>{if(e.answered)return;e.picked=[];renderSentenceBuilder();exerciseFeedback('');};}
  document.getElementById('exercise-title').focus?.({preventScroll:true});
  hydrateWordIpa(app);
  bindSentenceWords(app,lesson);
  app.scrollIntoView?.({block:'start'});
}
function exerciseInput(label,sentence=false){return `<form id="exercise-form" class="exercise-form"><${sentence?'textarea':'input'} id="exercise-answer" ${sentence?'rows="3"':'type="text"'} lang="en" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-describedby="exercise-feedback" aria-label="${escapeHTML(label)}" placeholder="${sentence?'Твоє речення':'Відповідь'}">${sentence?'</textarea>':''}<button type="submit" class="btn" id="exercise-check">Перевірити</button></form>`;}
function renderExerciseDone(){
  const s=session,e=s.exercise;
  if(!e.lessons.length){app.innerHTML=`<section class="exercise-panel exercise-done"><h1>Немає слів для цього заняття</h1><p>Можна обрати інші слова або повторити вже вивчені.</p><button type="button" class="btn" id="exercise-home">До розділів</button></section>`;document.getElementById('exercise-home').onclick=home;return;}
  const review=s.queue.filter(word=>e.difficult.has(word.id));
  app.innerHTML=`<div class="study-top"><button type="button" class="back" id="back">${groupBackLabel()}</button></div><section class="exercise-panel exercise-done"><h1>Готово!</h1><p>У занятті: ${e.lessons.length} ${wordLabel(e.lessons.length)}.</p><p>Вивчено: ${e.completed.size}. Повторити: ${review.length}.</p>${e.selfChecked.size?`<p>Самоперевірка: ${e.selfChecked.size}. Ці слова залишилися для повторення.</p>`:''}<div class="exercise-actions">${review.length?'<button type="button" class="btn" id="exercise-review">Повторити складні</button>':''}<button type="button" class="btn secondary" id="exercise-restart">Пройти ще раз</button><button type="button" class="btn secondary" id="exercise-home">До розділів</button></div></section>`;
  document.getElementById('back').onclick=home;document.getElementById('exercise-home').onclick=home;
  document.getElementById('exercise-restart').onclick=()=>start(s.ids,s.mixed,false,s.limit,s.selectedIds,'steps');
  if(review.length)document.getElementById('exercise-review').onclick=()=>start(s.ids,s.mixed,false,review.length,review.map(word=>word.id),'steps');
}
