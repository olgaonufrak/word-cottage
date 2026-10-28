'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {marked}=require(require.resolve('marked',{paths:[__dirname,path.resolve(path.dirname(process.execPath),'../node_modules')]}));
const root=path.resolve(__dirname,'../..');
const out=path.join(root,'dist/town-plan');
fs.mkdirSync(out,{recursive:true});
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8').replace(/^\uFEFF/,'');
const catalog=JSON.parse(read('source-catalog.json'));
const world=JSON.parse(read('section-world-map.json'));
const exercises=JSON.parse(read('card-exercises.json'));
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural=(n,forms)=>`${n} ${forms[new Intl.PluralRules('uk').select(n)]||forms.other}`;
const kindNames={mixed:'змішана лексика',abstract:'поняття та ситуації',dialogue:'фрази й діалоги',physical:'предмети та дії у сцені',antonyms:'пари антонімів','irregular-verbs':'неправильні дієслова','phrasal-verbs':'фразові дієслова',synonyms:'пари синонімів'};
const csv=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const sectionsMap=new Map(world.sections.map(section=>[section.categoryId,section]));
const exerciseMap=new Map(exercises.cards.map(card=>[card.id,card]));
const categories=catalog.categories;
const words=categories.flatMap(section=>section.words);
assert.equal(categories.length,102);
assert.equal(words.length,3030);
assert.equal(new Set(words.map(word=>word.id)).size,3030);
assert.equal(exerciseMap.size,3030);
assert.equal(world.districts.length,19);
let totalPacks=0;
const allPacks=[];
const planCategories=categories.map(category=>{
  const project=sectionsMap.get(category.id);
  assert(project,category.id);
  assert.equal(category.count,category.words.length);
  const thresholds=[1,Math.ceil(category.count/3),Math.ceil(2*category.count/3),category.count];
  const packs=[];
  for(let i=0;i<category.words.length;i+=5){
    const number=packs.length+1;
    const wordIds=category.words.slice(i,i+5).map(word=>word.id);
    const pack={id:`${category.id}-pack-${String(number).padStart(2,'0')}`,number,categoryId:category.id,projectId:project.projectId,wordIds};
    packs.push(pack);allPacks.push(pack);
  }
  totalPacks+=packs.length;
  const byWord=new Map(packs.flatMap(pack=>pack.wordIds.map(id=>[id,pack])));
  const result={...category,project:{...project,zeroState:project.zeroState||{state:'S0',threshold:0,description:'Запланована ділянка; навчальний доступ уже відкритий.'},construction:[
    {state:'S1',threshold:thresholds[0],name:'Перша основа',description:project.firstChange},
    {state:'S2',threshold:thresholds[1],name:'Каркас',description:`Побудовано основну структуру проєкту «${project.projectName}».`},
    {state:'S3',threshold:thresholds[2],name:'Облаштування',description:`Заповнюються робочі місця, предмети й оздоблення: ${project.location}.`},
    {state:'S4',threshold:thresholds[3],name:'Проєкт завершено',description:`Повністю готовий проєкт «${project.projectName}».`}
  ],repeatLife:[
    {round:'R1',requiredCards:Math.ceil(category.count/2),description:'Перший мешканець або відвідувач.'},
    {round:'R2',requiredCards:Math.ceil(category.count/2),description:'Нова коротка анімація роботи чи побуту.'},
    {round:'R3',requiredCards:category.count,description:project.finalChange}
  ]},packs,words:category.words.map(word=>{
    const exercise=exerciseMap.get(word.id);assert(exercise,word.id);assert.equal(exercise.steps.length,6);
    assert.equal(exercise.en,word.en);assert.equal(exercise.uk,word.uk);
    return {...word,packId:byWord.get(word.id).id,packNumber:byWord.get(word.id).number,projectId:project.projectId,exerciseProfile:exercise.profile.learningKind,exerciseReference:word.id};
  })};
  return result;
});
assert.equal(totalPacks,629);
assert.equal(new Set(allPacks.flatMap(pack=>pack.wordIds)).size,3030);
for(const source of catalog.sources)assert.equal(sha(source.path),source.sha256,source.path+' source changed');
for(const source of exercises.sources)assert.equal(sha(source.path),source.sha256,source.path+' exercise source changed');
const meta={snapshotDate:'2026-10-28',baseCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),note:'План майбутньої повної піксельної гри; не реалізація.',totals:{zones:5,districts:19,projects:102,cards:3030,packs5:629,constructionTransitions:408,uniqueEnglish:new Set(words.map(word=>word.en.toLocaleLowerCase('en'))).size},sources:catalog.sources};
const plan={schemaVersion:1,...meta,constructionRule:{credit:'one lifetime point per existing card ID',thresholds:'1,ceil(N/3),ceil(2N/3),N',initial:'S0=0; all learning sections available'},reviewRule:{rounds:[{id:'R1',delayDays:1},{id:'R2',delayDays:3},{id:'R3',delayDays:7}],relativeTo:'previous qualified round; R1 from initial qualification',lossOnPause:false},districts:world.districts,categories:planCategories};
fs.writeFileSync(path.join(out,'game-plan.json'),JSON.stringify(plan));
fs.writeFileSync(path.join(out,'card-exercises.json'),JSON.stringify(exercises));
fs.mkdirSync(path.join(out,'exercises'),{recursive:true});
for(const category of categories){
  const chunk={cards:exercises.cards.filter(card=>card.category===category.id)};
  assert.equal(chunk.cards.length,category.count);
  const script='window.TOWN_EXERCISES_BY_SECTION=window.TOWN_EXERCISES_BY_SECTION||{};window.TOWN_EXERCISES_BY_SECTION['+JSON.stringify(category.id)+']='+JSON.stringify(chunk).replace(/</g,'\\u003c')+';\n';
  fs.writeFileSync(path.join(out,'exercises',category.id+'.js'),script);
}
const headers=['zone','district','section_id','section_en','section_uk','project_id','project','pack_id','card_id','en','uk','exercise_profile','sentence_en','sentence_uk','gap_target','extra_contexts'];
const records=planCategories.flatMap(category=>category.words.map(word=>[category.stageName,category.project.district,category.id,category.title,category.ukTitle,category.project.projectId,category.project.projectName,word.packId,word.id,word.en,word.uk,word.exerciseProfile,word.context.sentence,word.context.uk,word.context.target,JSON.stringify(word.context.extra||[])]));
fs.writeFileSync(path.join(out,'all-words.csv'),'\uFEFF'+[headers,...records].map(row=>row.map(csv).join(',')).join('\r\n'));
const baseDesign=read('design.md');
const progression=read('progression-design.md');
const compatibility=read('compatibility-notes.md');
const summary=read('catalog-summary.md');
let appendix='\n\n# Повна карта районів, розділів і всіх карток\n\n';
let catalogHtml='';
for(const district of world.districts){
  const group=planCategories.filter(category=>category.project.districtId===district.id);
  const count=group.reduce((sum,category)=>sum+category.count,0);
  appendix+=`\n## ${district.order}. ${district.name}\n\n${district.setting}. ${count} карток; ${group.length} розділів.\n\n`;
  let projectsHtml='';
  for(const category of group){
    const project=category.project;
    const th=project.construction.map(state=>state.threshold).join(' / ');
    appendix+=`\n### ${category.title} — ${category.ukTitle}\n\nID: ${category.id}. Проєкт: ${project.projectName}. Місце: ${project.location}. Картки: ${category.count}; набори: ${category.packs.length}.\n\nСюжет: ${project.microQuest}\n\nПерша зміна: ${project.firstChange}\n\nПороги чотирьох будівельних етапів: ${th}.\n\nОживлення після повторень: ${project.finalChange}\n\n`;
    for(const pack of category.packs){
      const list=pack.wordIds.map(id=>category.words.find(word=>word.id===id));
      appendix+=`Набір ${pack.number} (${pack.id}): ${list.map(word=>word.en).join('; ')}.\n\n`;
    }
    appendix+='| Набір | ID | Англійська картка | Український переклад | Приклад | Переклад прикладу |\n|---|---|---|---|---|---|\n';
    let rows='';
    for(const word of category.words){
      const safe=value=>String(value).replace(/\|/g,'\\|').replace(/\n/g,' ');
      const extraEn=(word.context.extra||[]).map(item=>item.pattern.replaceAll('{word}',item.target));
      const extraUk=(word.context.extra||[]).map(item=>item.uk);
      appendix+=`| ${word.packNumber} | ${word.id} | ${safe(word.en)} | ${safe(word.uk)} | ${safe([word.context.sentence,...extraEn].join(' / '))} | ${safe([word.context.uk,...extraUk].join(' / '))} |\n`;
      const extra=(word.context.extra||[]).map(item=>`<span class="context-uk">${escape(item.pattern.replaceAll('{word}',item.target))} — ${escape(item.uk)}</span>`).join('');
      rows+=`<tr data-word-id="${escape(word.id)}"><td data-label="Картка"><span class="word-en" lang="en">${escape(word.en)}</span><span class="word-id">${escape(word.id)}</span></td><td data-label="Переклад">${escape(word.uk)}</td><td data-label="Контекст"><span lang="en">${escape(word.context.sentence)}</span><span class="context-uk">${escape(word.context.uk)}</span>${extra}</td><td data-label="Набір">${word.packNumber} / ${category.packs.length}<br><button class="word-open" type="button" data-open-word="${escape(word.id)}">6 вправ</button></td></tr>`;
    }
    const stages=project.construction.map(state=>`<li><strong>${escape(state.state)} · ${state.threshold}/${category.count} · ${escape(state.name)}.</strong> ${escape(state.description)}</li>`).join('');
    const life=project.repeatLife.map(round=>`<li><strong>${round.round} · ${round.requiredCards}/${category.count} карток.</strong> ${escape(round.description)}</li>`).join('');
    projectsHtml+=`<details class="project" id="${escape(category.id)}" data-stage="${category.stage}" data-search="${escape([category.title,category.ukTitle,project.projectName,project.district,project.microQuest].join(' '))}"><summary>${escape(category.title)}<span>${escape(category.ukTitle)} · ${category.count} карток · ${escape(project.projectName)}</span></summary><div class="project-body"><div class="project-meta"><span class="chip">${escape(category.stageName)}</span><span class="chip">${escape(category.id)}</span><span class="chip">${category.packs.length} наборів</span></div><p><strong>Локація:</strong> ${escape(project.location)}.</p><p><strong>Доручення:</strong> ${escape(project.microQuest)}</p><p><strong>Формат змісту:</strong> ${escape(kindNames[project.learningKind]||project.learningKind)}. ${escape(project.pairSpecial||'Словникові ID зберігаються окремо.')}</p><h4>Чотири будівельні етапи</h4><p class="muted">S0: запланована ділянка, навчання доступне відразу. Кожний новий ID додає мікродеталь між великими порогами.</p><ol class="milestones">${stages}</ol><h4>Як місце оживає після повторень</h4><ol>${life}</ol><div class="pack-list">${category.packs.map(pack=>`<span title="${escape(pack.wordIds.join(', '))}">Набір ${pack.number}: ${pack.wordIds.length} карток</span>`).join('')}</div><div class="table-wrap"><table class="word-table"><thead><tr><th>Картка й ID</th><th>Український переклад</th><th>Точний контекст із сайту</th><th>Набір / вправи</th></tr></thead><tbody>${rows}</tbody></table></div></div></details>`;
  }
  catalogHtml+=`<details class="district" id="${escape(district.id)}"><summary>${district.order}. ${escape(district.name)} · ${plural(count,{one:'картка',few:'картки',other:'карток'})} / ${plural(group.length,{one:'розділ',few:'розділи',other:'розділів'})}</summary><div class="district-body"><p>${escape(district.setting)}</p>${projectsHtml}</div></details>`;
}
const full=baseDesign+'\n\n'+progression+'\n\n'+compatibility+'\n\n'+summary+appendix;
fs.writeFileSync(path.join(out,'full-plan.md'),full);
let heading=0;
function render(md,prefix){
  return marked.parse(md,{gfm:true}).replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g,(_,level,text)=>`<h${level} id="${prefix}-${++heading}">${text}</h${level}>`).replace(/<table>/g,'<div class="table-wrap"><table>').replace(/<\/table>/g,'</table></div>');
}
const designHtml=render(baseDesign,'design');
const progressionHtml=render(progression,'rules');
const compatibilityHtml=render(compatibility,'compat');
const headings=[...designHtml.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(match=>({id:match[1],title:match[2].replace(/<[^>]+>/g,'')}));
const toc=headings.map(item=>`<li><a href="#${item.id}">${escape(item.title)}</a></li>`).join('');
const stagesHtml=catalog.totals.stages.map(stage=>`<tr><td>${escape(stage.name||stage.stageName||String(stage.stage))}</td><td>${stage.sections||stage.sectionCount||stage.categories||''}</td><td>${stage.cards||stage.cardCount||''}</td><td>${stage.packs5||''}</td></tr>`).join('');
const html=`<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f8f7f1"><meta name="description" content="Повний план піксельної гри Word Cottage: 3030 карток, 102 розділи, 19 районів, будівництво й повторення."><title>Повний план містечка — Word Cottage</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head><body><header id="top"><a class="brand" href="../">Word Cottage</a><p class="eyebrow">Піксельна гра · повний план · 28 жовтня 2026</p><h1>Твої слова будують містечко</h1><p class="intro">Повна кампанія: кожний розділ має власний міський проєкт, кожна картка — навчальний маршрут, а повторення додає місту життя.</p><div class="stats"><div class="stat"><b>3030</b><span>карток із власними ID</span></div><div class="stat"><b>102</b><span>розділи й проєкти</span></div><div class="stat"><b>19</b><span>районів у 5 зонах</span></div><div class="stat"><b>629</b><span>наборів до 5 карток</span></div></div><p class="notice">Це план майбутньої повної гри, а не запущена піксельна кампанія. Тут можна прочитати механіки й знайти всі наявні слова сайту.</p><div class="download-links"><a href="full-plan.md">Повний текст плану</a><a href="all-words.csv" download>Усі слова й маршрути · CSV</a><a href="game-plan.json" download>Карта кампанії · JSON</a><a href="card-exercises.json" download>6 вправ для кожної картки · JSON</a></div></header><nav class="topnav" aria-label="Розділи плану"><div><a href="#contents">Зміст</a><a href="#game-design">Як працює гра</a><a href="#progression">Правила розвитку</a><a href="#catalog">Усі розділи й слова</a><a href="#compatibility">Сумісність</a></div></nav><main><section class="toc" id="contents"><h2>Зміст основного плану</h2><ol>${toc}</ol><p><a href="#progression">Детальні правила, повторення й перші сім сесій</a></p><p><a href="#catalog">Повний каталог: 19 районів → 102 проєкти → 3030 карток</a></p></section><article id="game-design">${designHtml}</article><details class="reading-part" id="progression"><summary>Детальні правила розвитку, повторення та перші сім сесій</summary><div class="part-content">${progressionHtml}</div></details><section id="catalog"><h2>Усі райони, розділи, слова та завдання</h2><p>Відкрий район, потім розділ. Під кожним словом є точний ID, переклад, контекст, номер набору та послівний план шести вправ. Пошук також знаходить назви проєктів і районів.</p><div class="filter"><label>Знайти слово, переклад, розділ або проєкт<input type="search" id="catalog-search" placeholder="Наприклад: coffee, кава, Synonyms" autocomplete="off"></label><label>Навчальна зона<select id="stage-filter"><option value="all">Усі зони</option><option value="0">Основа для початківця</option><option value="1">Етап 1</option><option value="2">Етап 2</option><option value="3">Етап 3</option><option value="4">Етап 4</option></select></label><button type="button" id="reset-filter">Очистити фільтр</button></div><p class="result-status" id="catalog-status" role="status" aria-live="polite">102 розділи · 3030 карток</p><p class="no-results" id="no-results" hidden>Нічого не знайдено. Спробуйте інший запит або всі зони.</p><section class="preview" id="exercise-preview" hidden aria-labelledby="preview-heading"><div class="preview-head"><h3 id="preview-heading" tabindex="-1">Послівний план шести вправ</h3><button type="button" id="close-preview">Закрити</button></div><div id="preview-content"></div></section>${catalogHtml}<noscript><p>Пошук і кнопки «6 вправ» потребують JavaScript. Усі райони, списки слів і контексти можна розкрити без нього; повний послівний план вправ є у файлі JSON вище.</p></noscript></section><details class="reading-part" id="compatibility"><summary>Сумісність із чинним сайтом і критерії безпечного впровадження</summary><div class="part-content">${compatibilityHtml}</div></details><section><h2>Перевірка повноти</h2><p>3030 із 3030 наявних ID включені рівно один раз; кожен належить одному з 102 проєктів і одному з 629 стандартних наборів. Для кожної картки є шість послівних вправ і реальний контекст. 24 картки антонімів і 30 карток синонімів збережені як цілі записи з додатковими прикладами.</p><p>Джерела: фактичні словники та контексти сайту на дату плану. Особисті браузерні слова не опубліковано; для них передбачена окрема гілка.</p><ul class="source-list">${catalog.sources.map(source=>`<li>${escape(source.path)} · <code>${source.sha256}</code></li>`).join('')}</ul><a class="back-top" href="#top">↑ На початок</a></section></main><footer>План збережено в наявному проєкті Word Cottage. Прогрес навчання й особисті слова ця сторінка не читає та не змінює.</footer></body></html>`;
fs.writeFileSync(path.join(out,'index.html'),html);
const validation={date:'2026-10-28',...meta.totals,sourcesMatched:true,sourceWordIds:words.length,plannedWordIds:new Set(planCategories.flatMap(category=>category.words.map(word=>word.id))).size,packAssignments:allPacks.flatMap(pack=>pack.wordIds).length,exerciseCards:exercises.cards.length,exerciseSteps:exercises.cards.reduce((sum,card)=>sum+card.steps.length,0),htmlWords:(html.match(/data-word-id=/g)||[]).length,exactEnglishAndUkrainian:true,sourceHashes:catalog.sources};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(validation,null,2)+'\n');
console.log(JSON.stringify(validation,null,2));
