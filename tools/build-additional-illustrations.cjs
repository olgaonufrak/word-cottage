#!/usr/bin/env node
'use strict';

// Package supplementary, exact-meaning illustrations without changing the
// original word registry, IDs, source drawings or browser progress.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const VERSION='20261023-additional-gouache';
const normalize=value=>String(value).normalize('NFKC').toLowerCase().trim().replace(/\s+/gu,' ');
const entryKey=entry=>normalize(entry.en)+'\u0000'+normalize(entry.uk);
const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));

function build(options={}){
  const catalogPath=path.resolve(ROOT,options.catalog||'art/vocabulary-additions/catalog.json');
  const manifestPath=path.resolve(ROOT,options.mapping||'art/vocabulary-additions/atlas-manifest.json');
  const catalog=readJSON(catalogPath),manifest=readJSON(manifestPath);
  const original=readJSON(path.join(ROOT,'art/vocabulary-collages/atlas-manifest.json'));
  const originalCatalog=readJSON(path.join(ROOT,'art/vocabulary-collages/catalog.json'));
  assert.equal(catalog.version,1);assert.equal(manifest.version,1);
  assert.ok(Array.isArray(catalog.entries),'The catalog needs exact English/Ukrainian entries');
  assert.ok(Array.isArray(catalog.batches),'The catalog needs its finished painting batches');
  assert.ok(manifest.pictures&&typeof manifest.pictures==='object');
  assert.ok(manifest.atlases&&typeof manifest.atlases==='object');
  const catalogSlots=new Map(),batchNames=new Set();
  for(const batch of catalog.batches){
    assert.match(batch.id,/^additional-[a-z0-9-]+$/,'Controlled supplementary atlas identity');
    assert.ok(!batchNames.has(batch.id),'Each finished atlas appears once');batchNames.add(batch.id);
    assert.ok(Array.isArray(batch.tiles)&&batch.tiles.length>0&&batch.tiles.length<=25,'A 5 by 5 atlas has at most 25 mapped subjects');
    const indices=new Set();
    for(const tile of batch.tiles){
      assert.ok(Number.isInteger(tile.index)&&tile.index>=0&&tile.index<25,'Each catalogued subject has an exact row-major index');
      assert.ok(!indices.has(tile.index),'Two subjects cannot occupy the same catalogued square');indices.add(tile.index);
      assert.ok(!catalogSlots.has(tile.key),'Each new drawing has a unique identity');
      catalogSlots.set(tile.key,{src:'images/vocabulary-painted/'+batch.id+'.webp',cell:tile.index});
    }
    assert.ok(manifest.atlases[batch.id],'Every catalogued atlas retains import provenance');
    assert.equal(manifest.atlases[batch.id].src,'images/vocabulary-painted/'+batch.id+'.webp','Atlas provenance points to its own local file');
  }
  assert.deepEqual(Object.keys(manifest.atlases).sort(),[...batchNames].sort(),'Atlas provenance and the finished catalog describe the same set');
  const expected=[...catalogSlots.keys()];
  assert.equal(new Set(expected).size,expected.length,'Each new drawing has a unique identity');
  assert.deepEqual(Object.keys(manifest.pictures).sort(),[...expected].sort(),'Every catalogued drawing is finished, without orphan cells');
  const supplemental=Object.create(null),slots=new Set();
  for(const key of expected){
    assert.match(key,/^[a-z0-9-]+$/,'Controlled drawing identity');
    assert.ok(!Object.hasOwn(original.pictures,key)&&!originalCatalog.precise.some(item=>item.key===key),'A new identity cannot replace an original drawing: '+key);
    const picture=manifest.pictures[key];
    assert.equal(picture.type,'painted');
    assert.match(picture.src,/^images\/vocabulary-painted\/additional-[a-z0-9-]+\.webp$/,'Controlled local atlas path');
    assert.equal(picture.columns,5);assert.equal(picture.rows,5);
    assert.ok(Number.isInteger(picture.cell)&&picture.cell>=0&&picture.cell<25,key+': valid cell');
    assert.equal(picture.src,catalogSlots.get(key).src,key+': the source atlas matches the subject catalog');
    assert.equal(picture.cell,catalogSlots.get(key).cell,key+': the source square matches its reviewed row-major subject');
    assert.ok(fs.existsSync(path.join(ROOT,'dist',picture.src)),key+': finished local atlas exists');
    const slot=picture.src+':'+picture.cell;
    assert.ok(!slots.has(slot),key+': separate drawings have separate cells');slots.add(slot);
    supplemental[key]={type:'painted',src:picture.src+'?v='+VERSION,cell:picture.cell,columns:5,rows:5};
  }
  const preciseByKey=new Map(originalCatalog.precise.map(item=>[item.key,item]));
  function resolve(item){
    assert.ok(item&&typeof item==='object');
    assert.ok(typeof item.picture==='string'&&item.picture.length,'Each image has a source identity');
    assert.ok(typeof item.alt==='string'&&item.alt.trim().length>1,'Each image has its Ukrainian accessible description');
    let picture=supplemental[item.picture];
    if(!picture&&Object.hasOwn(original.pictures,item.picture)){
      const p=original.pictures[item.picture];
      assert.equal(p.type,'painted');
      assert.match(p.src,/^images\/vocabulary-painted\/painted-\d{2}\.webp$/,'A reused painting retains its controlled local resource');
      assert.ok(Number.isInteger(p.cell)&&p.cell>=0&&p.cell<25,'A reused painting retains its exact source square');
      picture={type:'painted',src:p.src+'?v=20261022-gouache',cell:p.cell,columns:5,rows:5};
    }
    if(!picture&&preciseByKey.has(item.picture)){
      let seed=0;for(const character of item.picture)seed=(Math.imul(seed,31)+character.charCodeAt(0))>>>0;
      picture={type:'svg',src:'images/vocabulary-diagrams/'+item.picture+'.svg?v=20261022-detail',paper:{src:'images/vocabulary-painted/painted-22.webp?v=20261022-gouache',cell:19+seed%6}};
    }
    if(!picture){
      const match=item.picture.match(/^c:([0-3]):([0-9]|1[0-9]|2[0-4])$/);
      if(match)picture={type:'cottage',picture:Number(match[1]),cell:Number(match[2])};
    }
    assert.ok(picture,'Unknown illustration identity: '+item.picture);
    return {...picture,alt:item.alt.trim()};
  }
  const seen=new Map(),entries=[];
  for(const entry of catalog.entries){
    assert.ok(typeof entry.en==='string'&&entry.en.trim(),'Exact English text');
    assert.ok(typeof entry.uk==='string'&&entry.uk.trim(),'Exact Ukrainian meaning');
    const items=entry.pictures||[{picture:entry.picture,alt:entry.alt}];
    assert.ok(Array.isArray(items)&&items.length>0&&items.length<=2,'A lesson has one scene or two meaning-specific pictures');
    const pictures=items.map(resolve),key=entryKey(entry),signature=JSON.stringify(pictures);
    if(seen.has(key)){assert.equal(signature,seen.get(key),'Conflicting exact-meaning mappings: '+entry.en+' — '+entry.uk);continue;}
    seen.set(key,signature);entries.push({en:entry.en.trim(),uk:entry.uk.trim(),pictures});
  }
  const data=JSON.stringify(entries,null,2).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const js="'use strict';\n// Generated by tools/build-additional-illustrations.cjs.\n// Exact full-record meanings cover phrases and pairs without changing the\n// established illustrations or guessing a picture for an unrelated homograph.\nconst additionalVocabularyEntries="+data+";\nconst additionalVocabularyKey=word=>[word.en,word.uk].map(value=>String(value).normalize('NFKC').toLowerCase().trim().replace(/\\s+/gu,' ')).join('\\u0000');\nconst additionalVocabularyPictures=new Map(additionalVocabularyEntries.map(entry=>[additionalVocabularyKey(entry),entry.pictures]));\nconst originalLessonIllustrations=lessonIllustrations;\nlessonIllustrations=function(word){\n  const existing=originalLessonIllustrations(word);\n  return existing.length?existing:(additionalVocabularyPictures.get(additionalVocabularyKey(word))||[]);\n};\n";
  const output=path.resolve(ROOT,options.output||'dist/additional-illustrations.js');
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,js);
  return {entries:entries.length,drawings:expected.length,atlases:new Set(Object.values(supplemental).map(picture=>picture.src)).size,output:path.relative(ROOT,output)};
}

if(require.main===module){
  try{
    const args=process.argv.slice(2),options={};
    for(let i=0;i<args.length;i+=2){
      assert.ok(['--catalog','--mapping','--output'].includes(args[i])&&args[i+1],'Expected --catalog, --mapping or --output PATH');
      options[args[i].slice(2)]=args[i+1];
    }
    console.log(JSON.stringify(build(options)));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={build,normalize,entryKey};
