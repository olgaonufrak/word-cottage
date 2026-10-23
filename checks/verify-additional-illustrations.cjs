'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {fixture}=require('./fixture.cjs');
const {build,entryKey}=require('../tools/build-additional-illustrations.cjs');
const {validateEdges}=require('../tools/import-painted-collages.cjs');
const ROOT=path.resolve(__dirname,'..'),readJSON=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8').replace(/^\uFEFF/,''));
const baseline=readJSON('checks/data/illustrations-baseline.json');
const catalog=readJSON('art/vocabulary-additions/catalog.json');
const manifest=readJSON('art/vocabulary-additions/atlas-manifest.json');
const originalManifest=readJSON('art/vocabulary-collages/atlas-manifest.json');
assert.equal(crypto.createHash('sha256').update(JSON.stringify(baseline)).digest('hex'),'1626f8faa04524c6b13c8c458b9977068bd90f987d9b73efe5b77fce104eac62','The frozen baseline is the original set of 1119 illustrations, not a moving coverage target');
assert.equal(baseline.totalCards,3030);assert.equal(baseline.illustratedCards,1119);assert.equal(baseline.entries.length,1119);

// Regeneration uses only committed catalogs and finished assets, with no image
// library, network or model dependency in GitHub Actions.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'word-cottage-additions-'));
try{
  const output=path.join(temp,'additional-illustrations.js'),result=build({output});
  assert.ok(result.entries>0,'The finished supplement contains real word meanings');
  assert.equal(fs.readFileSync(output,'utf8'),fs.readFileSync(path.join(ROOT,'dist/additional-illustrations.js'),'utf8'),'The published supplement matches its reproducible catalog');
}finally{
  assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+'word-cottage-additions-'));
  fs.rmSync(temp,{recursive:true,force:true});
}

const initialStorage=new Map([['word-cottage-learned','["nouns-0"]'],['word-cottage-personal-words','[]'],['word-cottage-search-history','["table"]']]);
const saved=JSON.stringify([...initialStorage]),f=fixture(initialStorage,undefined,true),original=fixture(new Map(),undefined,true,false);
const getAll=instance=>JSON.parse(instance.run('JSON.stringify(words.map(word=>({word,pictures:lessonIllustrations(word)})))'));
const all=getAll(f),old=getAll(original),byId=new Map(all.map(entry=>[entry.word.id,entry]));
const sourceByCell=new Map(Object.entries({...originalManifest.pictures,...manifest.pictures}).map(([key,picture])=>[picture.src+':'+picture.cell,key]));
const source=picture=>picture.type==='painted'?sourceByCell.get(picture.src.split('?')[0]+':'+picture.cell):picture.type==='svg'?picture.src.split('/').pop().split('.svg')[0]:'c:'+picture.picture+':'+picture.cell;
const identities=pictures=>pictures.map(picture=>({source:source(picture),alt:picture.alt}));
assert.equal(all.length,baseline.totalCards,'Artwork leaves the word records and IDs intact');
assert.equal(new Set(all.map(entry=>entry.word.id)).size,all.length);
for(const entry of baseline.entries){
  const current=byId.get(entry.id);assert.ok(current,'Preserved illustrated ID '+entry.id);
  assert.equal(current.word.en,entry.en);assert.equal(current.word.uk,entry.uk);
  assert.deepEqual(identities(current.pictures),entry.pictures,entry.id+': preserve every original image identity, meaning and accessible description');
}
assert.deepEqual(all.map(entry=>entry.word),old.map(entry=>entry.word),'Supplementary art never changes dictionary data');
for(let index=0;index<old.length;index++)if(old[index].pictures.length)assert.deepEqual(all[index].pictures,old[index].pictures,old[index].word.id+': the complete original runtime image remains identical');

const entries=JSON.parse(f.run('JSON.stringify(additionalVocabularyEntries)')),expectedByMeaning=new Map(),builtinByMeaning=new Map();
for(const entry of all){const key=entryKey(entry.word);if(!builtinByMeaning.has(key))builtinByMeaning.set(key,[]);builtinByMeaning.get(key).push(entry);}
for(const entry of entries){
  const key=entryKey(entry);assert.ok(!expectedByMeaning.has(key),'Only one mapping per exact English/Ukrainian meaning');expectedByMeaning.set(key,entry);
  assert.ok(builtinByMeaning.has(key),entry.en+' — '+entry.uk+': an exact dictionary meaning exists');
  for(const builtin of builtinByMeaning.get(key))assert.deepEqual(builtin.pictures,entry.pictures,builtin.word.id+': a new image is visible for every matching record');
  const wrong={en:entry.en,uk:'невідповідне значення для перевірки'};
  if(JSON.parse(original.run(`JSON.stringify(lessonIllustrations(${JSON.stringify(wrong)}))`)).length===0)assert.deepEqual(JSON.parse(f.run(`JSON.stringify(lessonIllustrations(${JSON.stringify(wrong)}))`)),[],entry.en+': a different meaning cannot inherit the new illustration');
  for(const picture of entry.pictures){
    assert.ok(source(picture),'Every supplementary image retains its catalogued source identity');
    assert.ok(picture.alt.trim().length>1);
    if(picture.type==='painted'){
      const html=f.run(`paintedVocabularyMarkup(${JSON.stringify(picture)})`);
      assert.ok(html.includes(`background-image:url('${picture.src}')`));
      assert.ok(html.includes(`background-position:${picture.cell%5*25}% ${Math.floor(picture.cell/5)*25}%`),'The new painting uses its exact atlas square');
    }
  }
}
assert.equal(entries.length,new Set(catalog.entries.map(entryKey)).size);
const newlyIllustrated=all.filter((entry,index)=>entry.pictures.length&&!old[index].pictures.length);
assert.ok(newlyIllustrated.length>0,'The supplement adds illustrations to previously unillustrated words');
assert.equal(newlyIllustrated.length,all.filter(entry=>entry.pictures.length).length-baseline.illustratedCards);
for(const entry of newlyIllustrated)assert.ok(expectedByMeaning.has(entryKey(entry.word)),entry.word.id+': coverage is deliberate and exact, without a generic fallback');
assert.deepEqual(JSON.parse(f.run('JSON.stringify(lessonIllustrations({en:"unregistered vocabulary sample",uk:"невідоме слово"}))')),[],'Unknown vocabulary receives no unrelated placeholder');
const sample=entries[0],normal={en:'  '+sample.en.toUpperCase()+'  ',uk:'  '+sample.uk.toUpperCase()+'  '};
assert.deepEqual(JSON.parse(f.run(`JSON.stringify(lessonIllustrations(${JSON.stringify(normal)}))`)),sample.pictures,'Normal case and outer spacing do not change the exact meaning');

const files=new Set();
for(const picture of Object.values(manifest.pictures)){
  const file=path.join(ROOT,'dist',picture.src);if(files.has(file))continue;files.add(file);
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'Complete WebP container');
  assert.equal(bytes.toString('ascii',12,16),'VP8 ','Detailed, opaque painted WebP still');
  assert.equal(bytes.toString('hex',23,26),'9d012a','Valid VP8 key frame');
  const width=bytes.readUInt16LE(26)&0x3fff,height=bytes.readUInt16LE(28)&0x3fff;
  assert.ok(width>=1000&&width===height&&width%5===0,'A detailed square atlas divides into 25 equal teaching images');
  assert.ok(bytes.length>1000,'A real painting resource');
}
assert.equal(files.size,catalog.batches.length,'Every finished supplementary atlas is published');
for(const atlas of Object.values(manifest.atlases)){
  assert.match(atlas.sourceSha256,/^[a-f0-9]{64}$/,'The complete generation source retains its provenance hash');
  assert.equal(atlas.width,atlas.height);assert.ok(atlas.width>=1000&&atlas.width%5===0);
  const sourceSize=atlas.sourceEdges.x.at(-1);assert.ok(sourceSize>=500);
  validateEdges(atlas.sourceEdges,sourceSize);
  assert.ok(Number.isInteger(atlas.sourceInset)&&atlas.sourceInset>=0&&atlas.sourceInset<sourceSize/20);
  for(const [key,replacement] of Object.entries(atlas.overrides||{})){
    assert.ok(manifest.pictures[key],'A corrected drawing retains its mapped subject identity');
    assert.match(replacement.sourceSha256,/^[a-f0-9]{64}$/,'A correction retains its separate source provenance hash');
    assert.equal(replacement.width,replacement.height);assert.ok(replacement.width>=500,'A detailed square correction is preserved');
  }
}
const sampleEdges={x:[0,200,400,600,800,1000],y:[0,200,400,600,800,1000]};
assert.deepEqual(validateEdges({...sampleEdges,xByRow:Array.from({length:5},()=>[0,210,405,603,805,1000])},1000).xByRow[0],[0,210,405,603,805,1000],'Measured per-row gutters retain their actual source coordinates');
assert.throws(()=>validateEdges({...sampleEdges,xByRow:[[0,200,400,600,800,1000]]},1000),/five measured/,'An incomplete row grid cannot silently crop another subject');
assert.throws(()=>validateEdges({...sampleEdges,yByColumn:Array.from({length:5},()=>[0,200,400,399,800,1000])},1000),/increasing/,'Reversed or overlapping measured boundaries are rejected');
const index=fs.readFileSync(path.join(ROOT,'dist/index.html'),'utf8');
const scriptNames=[...index.matchAll(/<script\b[^>]*\bsrc="([^"?]+)(?:\?[^"]*)?"/g)].map(match=>match[1]);
assert.ok(scriptNames.indexOf('additional-illustrations.js')>scriptNames.indexOf('illustrations.js'),'Load the supplement after the established registry');
assert.ok(scriptNames.indexOf('additional-illustrations.js')<scriptNames.indexOf('exercises.js'),'Load the supplement before lessons render');
assert.equal(scriptNames.filter(name=>name==='additional-illustrations.js').length,1);

const word=newlyIllustrated[0].word;
f.run(`start([${JSON.stringify(word.category)}],false,false,null,[${JSON.stringify(word.id)}],"steps")`);
assert.match(f.element('app').innerHTML,/class="lesson-pictures/,'A new illustration appears on the actual introduction screen');
for(const picture of newlyIllustrated[0].pictures)assert.ok(f.element('app').innerHTML.includes(picture.type==='cottage'?'vocabulary-art':picture.src),'Introduction uses the mapped painting');
assert.equal(JSON.stringify([...initialStorage]),saved,'Viewing the new paintings leaves learned words, personal words and history untouched');
for(const step of [1,2,3,4,5]){
  f.run(`session.exercise.step=${step};session.exercise.answered=false;renderExercise()`);
  assert.doesNotMatch(f.element('app').innerHTML,/lesson-pictures|images\/vocabulary(?:-[a-z]+)?\//,'Later exercises have no image answer leak');
}
assert.equal(JSON.stringify([...initialStorage]),saved,'Art cannot write progress while navigating exercises');
console.log(`Passed: ${newlyIllustrated.length} newly illustrated cards, ${entries.length} exact meanings and ${Object.keys(manifest.pictures).length} new detailed paintings in ${files.size} local atlases; all 1119 original mappings, phrases, pairs, wrong-meaning guards, atlas crops, introduction-only display and browser storage preserved.`);
