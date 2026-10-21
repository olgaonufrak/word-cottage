const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {fixture}=require('./fixture.cjs');
const storage=new Map([['word-cottage-learned','["nouns-0"]'],['word-cottage-personal-words','[]']]);
const {run,element}=fixture(storage,undefined,true),saved=JSON.stringify([...storage]);
const pictures=(en,uk)=>JSON.parse(run(`JSON.stringify(lessonIllustrations(${JSON.stringify({en,uk})}))`));
assert.equal(pictures('apple','яблуко')[0].alt,'Яблуко');
assert.equal(pictures('bread','хліб')[0].type,'cottage');
assert.notEqual(pictures('orange','апельсин')[0].src,pictures('orange','помаранчевий')[0].src);
assert.notEqual(pictures('mouse','миша')[0].src,pictures('mouse','комп’ютерна миша')[0].src);
assert.notEqual(pictures('chicken','курятина')[0].src,pictures('chicken','курка')[0].src);
for(const [en,uk] of [['information','інформація'],['fly','літати'],['train','тренувати'],['book','бронювати'],['glass','скло'],['key','ключовий'],['unknownword','невідоме слово'],['apple juice','яблуко']])assert.deepEqual(pictures(en,uk),[],`${en}: do not guess an image for another meaning`);
assert.equal(pictures('red / green','червоний / зелений').length,2);
assert.deepEqual(pictures('apple / unknown','яблуко / невідоме'),[]);
assert.equal(pictures('apple','яблуко').length,1,'Personal vocabulary can use the same exact meaning');
const all=JSON.parse(run('JSON.stringify(words.map(word=>({word,pictures:lessonIllustrations(word)})))'));
assert.ok(all.filter(entry=>entry.pictures.length).length>=340);
const files=new Set();
for(const {pictures} of all)for(const picture of pictures){
  assert.ok(picture.alt.length>1);
  if(picture.type==='svg'){
    assert.match(picture.src,/^images\/vocabulary\/[a-f0-9-]+\.svg$/);
    const file=path.join(__dirname,'../dist',picture.src);
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
assert.ok(files.size>200);
const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
assert.ok(index.indexOf('illustrations.js')<index.indexOf('exercises.js'));
assert.ok(fs.existsSync(path.join(__dirname,'../dist/images/vocabulary/LICENSE-GRAPHICS.txt')));
assert.match(index,/href="illustrations-sources.txt"/);
run('showSectionWords(["a1-fruit"])');
const apple=run('sectionWordPool(["a1-fruit"]).findIndex(word=>word.en==="apple")');
element('section-word-'+apple).checked=true;element('section-word-'+apple).onchange();element('learn-section').onclick();
assert.match(element('app').innerHTML,/<img[^>]+src="images\/vocabulary\/1f34e.svg"[^>]+alt="Яблуко"/);
assert.equal(JSON.stringify([...storage]),saved,'Illustrations never change saved words or progress');
element('exercise-next').onclick();
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary\//,'Recognition has no image answer leak');
for(const step of [2,3,4,5]){
  run(`session.exercise.step=${step};session.exercise.answered=false;renderExercise()`);
  assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary\//);
}
run('start(["nouns"],false,false,null,[words.find(word=>word.en==="information").id],"steps")');
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|<img/,'Abstract words do not show an unrelated placeholder');
run('session={queue:[{en:"apple",uk:"<img src=x onerror=alert(1)> яблуко",category:"custom"}],ids:["custom"]};startExercises(session)');
assert.doesNotMatch(element('app').innerHTML,/<img src=x/);assert.match(element('app').innerHTML,/&lt;img/);
console.log('Passed: meaning-specific offline images, local assets and licences, safe artwork crops, personal words, escaped text, unchanged storage and no image leaks after introduction.');
