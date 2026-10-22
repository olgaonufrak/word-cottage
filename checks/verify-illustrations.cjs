const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {fixture}=require('./fixture.cjs');
const storage=new Map([['word-cottage-learned','["nouns-0"]'],['word-cottage-personal-words','[]']]);
const {run,element}=fixture(storage,undefined,true),saved=JSON.stringify([...storage]);
const pictures=(en,uk)=>JSON.parse(run(`JSON.stringify(lessonIllustrations(${JSON.stringify({en,uk})}))`));
assert.equal(pictures('apple','яблуко')[0].alt,'Яблуко');
assert.equal(pictures('bread','хліб')[0].type,'cottage');
assert.match(pictures('table','стіл')[0].src,/home-table\.svg\?v=20261022-detail$/);
assert.match(pictures('desk','письмовий стіл')[0].src,/home-desk\.svg\?v=20261022-detail$/);
assert.match(pictures('time','час')[0].src,/learn-clock\.svg\?v=20261022-detail$/);
assert.notEqual(pictures('table','стіл')[0].src,pictures('desk','письмовий стіл')[0].src);
assert.notEqual(pictures('second','другий')[0].src,pictures('second','секунда')[0].src,'Order and time units keep their own meaning');
assert.notEqual(pictures('study','кабінет (кімната)')[0].src,pictures('research','дослідження')[0].src);
assert.deepEqual(pictures('table','таблиця'),[],'A table of data is not a dining table');
assert.notEqual(pictures('orange','апельсин')[0].src,pictures('orange','помаранчевий')[0].src);
assert.notEqual(pictures('mouse','миша')[0].src,pictures('mouse','комп’ютерна миша')[0].src);
assert.notEqual(pictures('chicken','курятина')[0].src,pictures('chicken','курка')[0].src);
for(const [en,uk] of [['information','інформація'],['fly','літати'],['train','тренувати'],['book','бронювати'],['glass','скло'],['key','ключовий'],['unknownword','невідоме слово'],['apple juice','яблуко']])assert.deepEqual(pictures(en,uk),[],`${en}: do not guess an image for another meaning`);
assert.equal(pictures('red / green','червоний / зелений').length,2);
assert.equal(pictures('happy — sad','щасливий — сумний').length,2);
assert.equal(pictures('tall — short','високий — невисокий (про зріст)').length,2);
assert.notEqual(pictures('short','короткий')[0].src,pictures('short','невисокий (про людину)')[0].src);
assert.deepEqual(pictures('apple / unknown','яблуко / невідоме'),[]);
assert.equal(pictures('apple','яблуко').length,1,'Personal vocabulary can use the same exact meaning');
const all=JSON.parse(run('JSON.stringify(words.map(word=>({word,pictures:lessonIllustrations(word)})))'));
assert.equal(all.filter(entry=>entry.pictures.length).length,1119,'Changing the artwork preserves every previously illustrated card');
for(const category of ['a1-furniture','a2-body'])assert.ok(all.filter(entry=>entry.word.category===category).every(entry=>entry.pictures.length),`${category}: every concrete item has an illustration`);
for(const category of ['a1-numbers','a1-days','a1-months','a1-colors'])assert.ok(all.filter(entry=>entry.word.category===category).every(entry=>entry.pictures.length),`${category}: complete visual set`);
const files=new Set();
for(const {pictures} of all)for(const picture of pictures){
  assert.ok(picture.alt.length>1);
  if(picture.type==='svg'){
    assert.match(picture.src,/^images\/vocabulary-folk\/[a-z0-9-]+\.svg\?v=20261022-detail$/,'The detailed artwork has its own browser cache version');
    const file=path.join(__dirname,'../dist',picture.src.split('?')[0]);
    assert.ok(fs.existsSync(file),picture.src);files.add(file);
    const svg=fs.readFileSync(file,'utf8');assert.match(svg,/<svg\b/);
    assert.doesNotMatch(svg,/<script|foreignObject|\bon\w+=|javascript:|<image|<use|<iframe/i);
  }else{
    assert.equal(picture.type,'cottage');
    const crop=run(`cottageCrop(${picture.picture},${picture.cell})`);
    assert.ok(crop.x>=0&&crop.y>=0&&crop.size>0&&crop.x+crop.size<=crop.picture.width&&crop.y+crop.size<=crop.picture.height);
    assert.ok(fs.existsSync(path.join(__dirname,'../dist',crop.picture.src.split('?')[0])));
  }
}
assert.equal(files.size,597,'All previously used SVG illustrations remain available');
const sourceDirectory=path.join(__dirname,'../dist/images/vocabulary'),folkDirectory=path.join(__dirname,'../dist/images/vocabulary-folk');
const sourceNames=fs.readdirSync(sourceDirectory).filter(name=>name.endsWith('.svg')).sort();
assert.equal(sourceNames.length,675);
assert.deepEqual(fs.readdirSync(folkDirectory).filter(name=>name.endsWith('.svg')).sort(),sourceNames,'Personal words can use the full illustrated set, including assets outside the built-in corpus');
const folkSVG=new Map();
for(const name of sourceNames){
  const svg=fs.readFileSync(path.join(folkDirectory,name),'utf8');folkSVG.set(name,svg);
  assert.match(svg,/<svg\b[^>]*\bdata-style="cottage-folk"/,`${name}: artwork edition marker`);
  assert.match(svg,/<svg\b[^>]*\bdata-edition="detailed"/,`${name}: detailed artwork edition`);
  assert.doesNotMatch(svg,/<script|foreignObject|\bon\w+=|javascript:|<image|<use|<iframe|<!DOCTYPE|<!ENTITY|\b(?:xlink:)?href\s*=/i,`${name}: standalone safe SVG`);
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,`${name}: no duplicate local filter or clipping IDs`);
  for(const match of svg.matchAll(/url\(([^)]+)\)/g)){
    const reference=match[1].trim().replace(/^['"]|['"]$/g,'');
    assert.ok(reference.startsWith('#')&&ids.includes(reference.slice(1)),`${name}: references only its own texture or clipping definitions`);
  }
}
assert.equal([...folkSVG.values()].filter(svg=>svg.includes('data-object-details="true"')).length,200,'All individually detailed objects are included in the published artwork');
// Numbers and calendar labels remain legible, exact teaching content.
for(const name of sourceNames.filter(name=>/^learn-(?:number-|ordinal-|month-|weekday-|week|weekend|year|day)/.test(name))){
  const source=fs.readFileSync(path.join(sourceDirectory,name),'utf8'),svg=folkSVG.get(name);
  const textTokens=value=>[...value.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(match=>match[1]);
  assert.deepEqual(textTokens(svg),textTokens(source),`${name}: preserve the original number or calendar label`);
}
// The transformed group may scale a drawing, but must keep its clock hands,
// calendar highlights and anatomical markers in the original relative positions.
const geometryNames=sourceNames.filter(name=>/^(?:body-|learn-(?:clock|minute|noon|midnight|oclock|half-past|quarter-|weekday-|week|weekend))/.test(name));
const geometricAttributes=['d','points','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','transform'];
function geometry(value){return [...value.matchAll(/<(path|circle|ellipse|line|polygon|polyline|rect)\b([^>]*)>/g)].map(match=>{
  const attributes=Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(attribute=>[attribute[1],attribute[2]]));
  return {tag:match[1],attributes};
});}
for(const name of geometryNames){
  const source=geometry(fs.readFileSync(path.join(sourceDirectory,name),'utf8')),styled=geometry(folkSVG.get(name));
  for(const shape of source){
    if(shape.tag==='rect'&&shape.attributes.x===undefined&&shape.attributes.y===undefined&&shape.attributes.width==='160'&&shape.attributes.height==='160')continue;
    assert.ok(styled.some(candidate=>candidate.tag===shape.tag&&geometricAttributes.every(attribute=>candidate.attributes[attribute]===shape.attributes[attribute])),`${name}: retain the geometry of its teaching diagram`);
  }
}
// Paint texture must not turn a colour swatch, flag or safety signal into a
// different colour. Background paper is free to use the cottage palette.
const semanticColourNames=sourceNames.filter(name=>/^learn-color-/.test(name)||/^(?:2b1b|2b1c|1f7e5|1f7e6|1f7e7|1f7e8|1f7e9|1f7ea|1f7eb|1f6d1|1f6ab|26d4|26a0|267b|1f6a6)\.svg$/.test(name)||/^(?:1f1[a-f0-9]{2}-|1f3f4-)/.test(name));
assert.equal(semanticColourNames.length,36);
for(const name of semanticColourNames){
  const source=fs.readFileSync(path.join(sourceDirectory,name),'utf8');
  const colours=value=>new Set([...value.matchAll(/\bfill="(#[a-f\d]+)"/gi)].map(match=>match[1].toLowerCase()));
  const actual=colours(folkSVG.get(name));
  for(const colour of colours(source))if(colour!=='#fffaf0')assert.ok(actual.has(colour),`${name}: preserve meaningful colour ${colour}`);
}
const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
assert.ok(index.indexOf('illustrations.js')<index.indexOf('exercises.js'));
assert.ok(fs.existsSync(path.join(__dirname,'../dist/images/vocabulary/LICENSE-GRAPHICS.txt')));
assert.match(index,/href="illustrations-sources.txt"/);
run('showSectionWords(["a1-fruit"])');
const apple=run('sectionWordPool(["a1-fruit"]).findIndex(word=>word.en==="apple")');
element('section-word-'+apple).checked=true;element('section-word-'+apple).onchange();element('learn-section').onclick();
assert.match(element('app').innerHTML,/<div class="lesson-lead">[\s\S]*<div class="lesson-pictures">[\s\S]*<img[^>]+class="lesson-picture lesson-picture-icon"[^>]+src="images\/vocabulary-folk\/1f34e.svg\?v=20261022-detail"[^>]+alt="Яблуко"[^>]+width="156"[^>]+height="156"/,'The introduction retains its large accessible image before the word');
assert.equal(JSON.stringify([...storage]),saved,'Illustrations never change saved words or progress');
element('exercise-next').onclick();
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary(?:-folk)?\//,'Recognition has no image answer leak');
for(const step of [2,3,4,5]){
  run(`session.exercise.step=${step};session.exercise.answered=false;renderExercise()`);
  assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary(?:-folk)?\//);
}
run('start(["nouns"],false,false,null,[words.find(word=>word.en==="information").id],"steps")');
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|<img/,'Abstract words do not show an unrelated placeholder');
run('session={queue:[{en:"apple",uk:"<img src=x onerror=alert(1)> яблуко",category:"custom"}],ids:["custom"]};startExercises(session)');
assert.doesNotMatch(element('app').innerHTML,/<img src=x/);assert.match(element('app').innerHTML,/&lt;img/);
console.log('Passed: all 1119 illustrated cards, 675 safe cottage-style SVGs, exact teaching colours, numbers and diagram geometry, large introduction images, unchanged meanings and storage, and no image leaks after introduction.');
