const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {fixture}=require('./fixture.cjs');
const storage=new Map([['word-cottage-learned','["nouns-0"]'],['word-cottage-personal-words','[]']]);
const {run,element}=fixture(storage,undefined,true),saved=JSON.stringify([...storage]);
const pictures=(en,uk)=>JSON.parse(run(`JSON.stringify(lessonIllustrations(${JSON.stringify({en,uk})}))`));
const imageIdentity=picture=>picture.type==='cottage'?`c:${picture.picture}:${picture.cell}`:`${picture.src.split('?')[0]}:${picture.cell??''}`;
const painted=JSON.parse(run('JSON.stringify(paintedVocabularyPictures)'));
const precise=JSON.parse(run('JSON.stringify(preciseVocabularyPictures)'));
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../art/vocabulary-collages/catalog.json'),'utf8').replace(/^\uFEFF/,''));
const paintedByCell=new Map(),paintedFiles=new Set();
assert.equal(Object.keys(painted).length,535,'Every object receives its completed gouache painting');
assert.equal(Object.keys(precise).length,140,'Every exact symbol keeps its teaching diagram');
assert.deepEqual(Object.keys(painted).sort(),catalog.batches.flatMap(batch=>batch.tiles.map(tile=>tile.key)).sort(),'All catalogued paintings are published');
assert.deepEqual(Object.keys(precise).sort(),catalog.precise.map(item=>item.key).sort(),'All catalogued precise diagrams are published');
for(const [name,picture] of Object.entries(painted)){
  assert.match(name,/^[a-z0-9-]+$/);
  assert.equal(picture.type,'painted');
  assert.match(picture.src,/^images\/vocabulary-painted\/[a-z0-9-]+\.webp(?:\?v=20261022-gouache)?$/,'Painted images use controlled local resources');
  assert.equal(picture.columns,5);assert.equal(picture.rows,5);
  assert.ok(Number.isInteger(picture.cell)&&picture.cell>=0&&picture.cell<25,`${name}: a valid atlas cell`);
  const key=imageIdentity(picture);
  assert.ok(!paintedByCell.has(key),`${name}: distinct source drawings keep separate atlas cells`);
  paintedByCell.set(key,name);
  const file=path.join(__dirname,'../dist',picture.src.split('?')[0]);
  assert.ok(fs.existsSync(file),picture.src);
  if(!paintedFiles.has(file)){
    const bytes=fs.readFileSync(file);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.equal(bytes.readUInt32LE(4)+8,bytes.length,`${name}: complete WebP container`);
    // Finished atlases are opaque VP8 WebP stills. Read their actual canvas,
    // without introducing an image-library dependency into the CI checks.
    assert.equal(bytes.toString('ascii',12,16),'VP8 ',`${name}: a supported painted still`);
    assert.equal(bytes.toString('hex',23,26),'9d012a',`${name}: valid VP8 key-frame header`);
    const width=bytes.readUInt16LE(26)&0x3fff,height=bytes.readUInt16LE(28)&0x3fff;
    assert.ok(width>=1000&&width===height&&width%5===0,`${name}: a detailed square canvas divides into 25 equal tiles`);
    assert.ok(bytes.length>1000,`${name}: a real painted image, not an empty resource`);paintedFiles.add(file);
  }
}
assert.equal(paintedFiles.size,22,'All 22 finished local atlases are present');
for(const [name,picture] of Object.entries(precise)){
  assert.match(name,/^[a-z0-9-]+$/);assert.equal(picture.type,'svg');
  assert.ok(!Object.hasOwn(painted,name),`${name}: paintings and exact diagrams are separate source identities`);
  assert.equal(picture.src,`images/vocabulary-diagrams/${name}.svg?v=20261022-detail`);
  assert.equal(picture.paper.src,'images/vocabulary-painted/painted-22.webp?v=20261022-gouache');
  assert.ok(Number.isInteger(picture.paper.cell)&&picture.paper.cell>=19&&picture.paper.cell<=24,`${name}: only the six object-free paper squares back the diagram`);
}
const sourceName=picture=>picture.type==='painted'?paintedByCell.get(imageIdentity(picture)):picture.type==='svg'?picture.src.match(/([^/]+)\.svg/)[1]:`c:${picture.picture}:${picture.cell}`;
assert.equal(pictures('apple','яблуко')[0].alt,'Яблуко');
assert.equal(pictures('bread','хліб')[0].type,'cottage');
assert.equal(sourceName(pictures('table','стіл')[0]),'home-table');
assert.equal(sourceName(pictures('desk','письмовий стіл')[0]),'home-desk');
assert.equal(sourceName(pictures('time','час')[0]),'learn-clock');
assert.notEqual(imageIdentity(pictures('table','стіл')[0]),imageIdentity(pictures('desk','письмовий стіл')[0]));
assert.notEqual(imageIdentity(pictures('second','другий')[0]),imageIdentity(pictures('second','секунда')[0]),'Order and time units keep their own meaning');
assert.notEqual(imageIdentity(pictures('study','кабінет (кімната)')[0]),imageIdentity(pictures('research','дослідження')[0]));
assert.deepEqual(pictures('table','таблиця'),[],'A table of data is not a dining table');
assert.notEqual(imageIdentity(pictures('orange','апельсин')[0]),imageIdentity(pictures('orange','помаранчевий')[0]));
assert.notEqual(imageIdentity(pictures('mouse','миша')[0]),imageIdentity(pictures('mouse','комп’ютерна миша')[0]));
assert.notEqual(imageIdentity(pictures('chicken','курятина')[0]),imageIdentity(pictures('chicken','курка')[0]));
for(const [en,uk] of [['information','інформація'],['fly','літати'],['train','тренувати'],['book','бронювати'],['glass','скло'],['key','ключовий'],['unknownword','невідоме слово'],['apple juice','яблуко']])assert.deepEqual(pictures(en,uk),[],`${en}: do not guess an image for another meaning`);
assert.equal(pictures('red / green','червоний / зелений').length,2);
assert.equal(pictures('happy — sad','щасливий — сумний').length,2);
assert.equal(pictures('tall — short','високий — невисокий (про зріст)').length,2);
assert.notEqual(imageIdentity(pictures('short','короткий')[0]),imageIdentity(pictures('short','невисокий (про людину)')[0]));
assert.deepEqual(pictures('apple / unknown','яблуко / невідоме'),[]);
assert.equal(pictures('apple','яблуко').length,1,'Personal vocabulary can use the same exact meaning');
const all=JSON.parse(run('JSON.stringify(words.map(word=>({word,pictures:lessonIllustrations(word)})))'));
assert.equal(all.filter(entry=>entry.pictures.length).length,1119,'Changing the artwork preserves every previously illustrated card');
const coverage=all.map(({word,pictures})=>({id:word.id,pictures:pictures.map(picture=>({source:sourceName(picture),alt:picture.alt}))}));
assert.equal(crypto.createHash('sha256').update(JSON.stringify(coverage)).digest('hex'),'0bd89e1a4f836b6686bc1362b51ffd86a73a50a3b6e615ac373ba6728495d8a4','Every card keeps its exact original illustration meaning, accessible description and source identity');
for(const category of ['a1-furniture','a2-body'])assert.ok(all.filter(entry=>entry.word.category===category).every(entry=>entry.pictures.length),`${category}: every concrete item has an illustration`);
for(const category of ['a1-numbers','a1-days','a1-months','a1-colors'])assert.ok(all.filter(entry=>entry.word.category===category).every(entry=>entry.pictures.length),`${category}: complete visual set`);
const files=new Set(),usedPaintedSources=new Set();
for(const {pictures} of all)for(const picture of pictures){
  assert.ok(picture.alt.length>1);
  if(picture.type==='svg'){
    assert.match(picture.src,/^images\/vocabulary-diagrams\/[a-z0-9-]+\.svg\?v=20261022-detail$/,'The transparent diagram has its own browser cache version');
    assert.deepEqual(picture.paper,precise[sourceName(picture)].paper,'An exact diagram uses its registered painted paper');
    const file=path.join(__dirname,'../dist',picture.src.split('?')[0]);
    assert.ok(fs.existsSync(file),picture.src);files.add(file);
    const svg=fs.readFileSync(file,'utf8');assert.match(svg,/<svg\b/);
    assert.doesNotMatch(svg,/<script|foreignObject|\bon\w+=|javascript:|<image|<use|<iframe/i);
  }else if(picture.type==='painted'){
    assert.match(picture.src,/^images\/vocabulary-painted\/[a-z0-9-]+\.webp\?v=20261022-gouache$/,'The painted artwork has its own browser cache version');
    assert.equal(picture.columns,5);assert.equal(picture.rows,5);
    assert.ok(Number.isInteger(picture.cell)&&picture.cell>=0&&picture.cell<25);
    assert.ok(sourceName(picture),'Each painted cell retains its original source identity');usedPaintedSources.add(sourceName(picture));
  }else{
    assert.equal(picture.type,'cottage');
    const crop=run(`cottageCrop(${picture.picture},${picture.cell})`);
    assert.ok(crop.x>=0&&crop.y>=0&&crop.size>0&&crop.x+crop.size<=crop.picture.width&&crop.y+crop.size<=crop.picture.height);
    assert.ok(fs.existsSync(path.join(__dirname,'../dist',crop.picture.src.split('?')[0])));
  }
}
assert.equal(files.size+usedPaintedSources.size,597,'All 597 previously used SVG sources remain represented by their precise diagram or painted replacement');
assert.equal(files.size,139);assert.equal(usedPaintedSources.size,458);
const sourceDirectory=path.join(__dirname,'../dist/images/vocabulary'),folkDirectory=path.join(__dirname,'../dist/images/vocabulary-folk');
const sourceNames=fs.readdirSync(sourceDirectory).filter(name=>name.endsWith('.svg')).sort();
assert.equal(sourceNames.length,675);
assert.deepEqual([...Object.keys(painted),...Object.keys(precise)].map(name=>name+'.svg').sort(),sourceNames,'The full original library has exactly one new painting or precise foreground per source');
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
const diagramDirectory=path.join(__dirname,'../dist/images/vocabulary-diagrams');
const diagramNames=Object.keys(precise).map(name=>name+'.svg').sort(),diagramSVG=new Map();
assert.deepEqual(fs.readdirSync(diagramDirectory).filter(name=>name.endsWith('.svg')).sort(),diagramNames,'Only the complete set of 140 transparent diagram foregrounds is published');
for(const name of diagramNames){
  const svg=fs.readFileSync(path.join(diagramDirectory,name),'utf8');diagramSVG.set(name,svg);
  assert.match(svg,/<svg\b[^>]*\bviewBox="0 0 200 200"/);
  assert.doesNotMatch(svg,/<script|foreignObject|\bon\w+=|javascript:|<image|<use|<iframe|<!DOCTYPE|<!ENTITY|\b(?:xlink:)?href\s*=/i,`${name}: safe standalone foreground`);
  assert.doesNotMatch(svg,/filter="url\(#paper\)"|d="M2 3Q42 1 101 3|d="M5 6Q82 4 147 6/,`${name}: no opaque generated paper or border covers the painted backing`);
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,`${name}: unique diagram definition IDs`);
  for(const match of svg.matchAll(/url\(([^)]+)\)/g)){
    const reference=match[1].trim().replace(/^['"]|['"]$/g,'');
    assert.ok(reference.startsWith('#')&&ids.includes(reference.slice(1)),`${name}: references only its own definitions`);
  }
}
// Numbers and calendar labels remain legible, exact teaching content.
for(const name of diagramNames){
  const source=fs.readFileSync(path.join(sourceDirectory,name),'utf8'),svg=diagramSVG.get(name);
  const textTokens=value=>[...value.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(match=>match[1]);
  assert.deepEqual(textTokens(svg),textTokens(source),`${name}: preserve the original number or calendar label`);
}
// The transformed group may scale a drawing, but must keep its clock hands,
// calendar highlights, shapes and symbols in the original relative positions.
// Anatomical objects deliberately receive paintings instead of diagram overlays.
const geometryNames=diagramNames;
const geometricAttributes=['d','points','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','transform','font-size','font-family','text-anchor'];
function geometry(value){return [...value.matchAll(/<(path|circle|ellipse|line|polygon|polyline|rect|text)\b([^>]*)>/g)].map(match=>{
  const attributes=Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(attribute=>[attribute[1],attribute[2]]));
  return {tag:match[1],attributes};
});}
for(const name of geometryNames){
  const source=geometry(fs.readFileSync(path.join(sourceDirectory,name),'utf8')),styled=geometry(diagramSVG.get(name));
  for(const shape of source){
    if(shape.tag==='rect'&&shape.attributes.x===undefined&&shape.attributes.y===undefined&&shape.attributes.width==='160'&&shape.attributes.height==='160')continue;
    assert.ok(styled.some(candidate=>candidate.tag===shape.tag&&geometricAttributes.every(attribute=>candidate.attributes[attribute]===shape.attributes[attribute])),`${name}: retain the geometry of its teaching diagram`);
  }
}
// Paint texture must not turn a colour swatch, flag or safety signal into a
// different colour. Background paper is free to use the cottage palette.
const semanticColourNames=sourceNames.filter(name=>/^learn-color-/.test(name)||/^(?:2b1b|2b1c|1f7e5|1f7e6|1f7e7|1f7e8|1f7e9|1f7ea|1f7eb|1f6d1|1f6ab|26d4|26a0|267b|1f6a6)\.svg$/.test(name)||/^(?:1f1[a-f0-9]{2}-|1f3f4-)/.test(name));
assert.equal(semanticColourNames.length,36);
const exactDiagramNames=new Set([...geometryNames,...semanticColourNames]);
for(const name of exactDiagramNames)assert.ok(!Object.hasOwn(painted,name.slice(0,-4)),`${name}: exact teaching labels, geometry and colour symbols retain their original diagram`);
for(const name of sourceNames.filter(name=>/^body-/.test(name)))assert.ok(Object.hasOwn(painted,name.slice(0,-4)),`${name}: anatomical objects receive finished detailed paintings`);
for(const name of semanticColourNames){
  const source=fs.readFileSync(path.join(sourceDirectory,name),'utf8');
  const colours=value=>new Set([...value.matchAll(/\bfill="(#[a-f\d]+)"/gi)].map(match=>match[1].toLowerCase()));
  const actual=colours(diagramSVG.get(name));
  for(const colour of colours(source))if(colour!=='#fffaf0')assert.ok(actual.has(colour),`${name}: preserve meaningful colour ${colour}`);
}
const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
const style=fs.readFileSync(path.join(__dirname,'../dist/style.css'),'utf8');
assert.match(style,/\.vocabulary-art-painted\{background-size:500% 500%\}/,'Each painted square fills the existing large image frame');
assert.match(style,/\.lesson-picture-diagram\{position:relative\}/,'The exact foreground and painted paper share the same large frame');
assert.match(style,/\.lesson-diagram-foreground\{[^}]*position:absolute[^}]*inset:0[^}]*width:100%[^}]*height:100%/,'Diagram overlays fill their paper without changing layout size');
const samplePainted=Object.values(painted)[0];
for(let cell=0;cell<25;cell++){
  const html=run(`paintedVocabularyMarkup(${JSON.stringify({...samplePainted,cell,alt:'<Малюнок> & деталі'})})`);
  assert.ok(html.includes(`background-position:${cell%5*25}% ${Math.floor(cell/5)*25}%`),`Cell ${cell}: exact atlas position`);
  assert.match(html,/role="img" aria-label="&lt;Малюнок&gt; &amp; деталі"/,'Painted images retain escaped accessible descriptions');
}
const sampleDiagram=Object.values(precise)[0];
for(let cell=19;cell<25;cell++){
  const html=run(`preciseVocabularyMarkup(${JSON.stringify({...sampleDiagram,paper:{...sampleDiagram.paper,cell},alt:'<Символ> & деталі'})})`);
  assert.match(html,/<span class="lesson-picture lesson-picture-diagram" role="img" aria-label="&lt;Символ&gt; &amp; деталі">/,'Exact diagrams retain one escaped accessible description');
  assert.ok(html.includes(`background-image:url('${sampleDiagram.paper.src}')`));
  assert.ok(html.includes(`background-position:${cell%5*25}% ${Math.floor(cell/5)*25}%`),`Paper cell ${cell}: exact atlas position`);
  assert.ok(html.includes(`class="lesson-diagram-foreground" src="${sampleDiagram.src}" alt="" aria-hidden="true"`),'The transparent foreground decorates the named image, without a duplicate accessible label');
}
assert.ok(index.indexOf('illustrations.js')<index.indexOf('exercises.js'));
assert.ok(fs.existsSync(path.join(__dirname,'../dist/images/vocabulary/LICENSE-GRAPHICS.txt')));
assert.match(index,/href="illustrations-sources.txt"/);
run('showSectionWords(["a1-fruit"])');
const apple=run('sectionWordPool(["a1-fruit"]).findIndex(word=>word.en==="apple")');
element('section-word-'+apple).checked=true;element('section-word-'+apple).onchange();element('learn-section').onclick();
const applePicture=pictures('apple','яблуко')[0];assert.equal(applePicture.type,'painted');
assert.match(element('app').innerHTML,/<div class="lesson-lead">[\s\S]*<div class="lesson-pictures">[\s\S]*<span class="lesson-picture lesson-picture-art lesson-picture-painted" role="img" aria-label="Яблуко"/,'The introduction retains its large accessible painted image before the word');
assert.ok(element('app').innerHTML.includes(`background-image:url('${applePicture.src}')`));
assert.ok(element('app').innerHTML.includes(`background-position:${applePicture.cell%5*25}% ${Math.floor(applePicture.cell/5)*25}%`),'The introduction shows the apple cell, not another object on its atlas');
assert.equal(JSON.stringify([...storage]),saved,'Illustrations never change saved words or progress');
element('exercise-next').onclick();
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary(?:-[a-z]+)?\//,'Recognition has no image answer leak');
for(const step of [2,3,4,5]){
  run(`session.exercise.step=${step};session.exercise.answered=false;renderExercise()`);
  assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|images\/vocabulary(?:-[a-z]+)?\//);
}
run('start(["nouns"],false,false,null,[words.find(word=>word.en==="information").id],"steps")');
assert.doesNotMatch(element('app').innerHTML,/lesson-pictures|<img/,'Abstract words do not show an unrelated placeholder');
run('session={queue:[{en:"apple",uk:"<img src=x onerror=alert(1)> яблуко",category:"custom"}],ids:["custom"]};startExercises(session)');
assert.doesNotMatch(element('app').innerHTML,/<img src=x/);assert.match(element('app').innerHTML,/&lt;img/);
console.log(`Passed: all 1119 illustrated cards retain their exact meanings and descriptions; 535 finished paintings (${usedPaintedSources.size} in the corpus) in ${paintedFiles.size} local WebP atlases; 140 transparent exact diagrams (${files.size} in the corpus) on six painted paper squares; all 675 original and detailed SVG sources, exact teaching colours, labels and geometry; all 25 crop positions, large introduction images, unchanged storage, and no image leaks after introduction.`);
