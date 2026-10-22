#!/usr/bin/env node
'use strict';

// Developer-only packaging: raster artwork remains in finished local atlases;
// exact numbers, colours and time diagrams are transparent SVG foregrounds.
// node tools/build-painted-illustrations.cjs --sharp /absolute/path/to/sharp
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {styleSvg,loadDetails}=require('./generate-folk-illustrations.cjs');
const ROOT=path.resolve(__dirname,'..');
const START='// BEGIN PAINTED VOCABULARY';
const END='// END PAINTED VOCABULARY';

async function main(){
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){
    if(!['--sharp','--catalog','--mapping'].includes(args[i])||!args[i+1])throw Error('Expected --sharp, --catalog or --mapping PATH');
    options[args[i].slice(2)]=args[i+1];
  }
  const sharp=require(options.sharp||process.env.WORD_COTTAGE_SHARP_MODULE||'sharp');
  const catalog=JSON.parse(fs.readFileSync(path.resolve(ROOT,options.catalog||'art/vocabulary-collages/catalog.json'),'utf8').replace(/^\uFEFF/,''));
  const imported=JSON.parse(fs.readFileSync(path.resolve(ROOT,options.mapping||'art/vocabulary-collages/atlas-manifest.json'),'utf8').replace(/^\uFEFF/,''));
  const expected=catalog.batches.flatMap(batch=>batch.tiles).map(tile=>tile.key);
  const missing=expected.filter(key=>!imported.pictures[key]);
  assert.equal(missing.length,0,'Unfinished or rejected paintings: '+missing.join(', '));
  const painted={};
  for(const key of expected){
    const p=imported.pictures[key];
    assert.match(p.src,/^images\/vocabulary-painted\/painted-\d{2}\.webp$/);
    assert.ok(fs.existsSync(path.join(ROOT,'dist',p.src)),p.src);
    assert.ok(Number.isInteger(p.cell)&&p.cell>=0&&p.cell<25,key);
    painted[key]={type:'painted',src:p.src+'?v=20261022-gouache',cell:p.cell,columns:5,rows:5};
  }
  assert.equal(Object.keys(painted).length,535);
  const details=loadDetails(),precise={},folder=path.join(ROOT,'dist/images/vocabulary-diagrams');
  fs.mkdirSync(folder,{recursive:true});
  let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(cursor<catalog.precise.length){
      const item=catalog.precise[cursor++];
      const source=fs.readFileSync(path.join(ROOT,'dist/images/vocabulary',item.filename),'utf8');
      const svg=await styleSvg(source,item.filename,sharp,details[item.filename]||'',{foregroundOnly:true});
      fs.writeFileSync(path.join(folder,item.filename),svg);
      let seed=0;for(const character of item.key)seed=(Math.imul(seed,31)+character.charCodeAt(0))>>>0;
      precise[item.key]={type:'svg',src:'images/vocabulary-diagrams/'+item.filename+'?v=20261022-detail',paper:{src:'images/vocabulary-painted/painted-22.webp?v=20261022-gouache',cell:19+seed%6}};
    }
  }));
  assert.equal(Object.keys(precise).length,140);
  const constant=(name,data)=>'const '+name+'={\n'+Object.keys(data).sort().map(key=>'  '+JSON.stringify(key)+':'+JSON.stringify(data[key])).join(',\n')+'\n};';
  const block=START+'\n'+constant('paintedVocabularyPictures',painted)+'\n'+constant('preciseVocabularyPictures',precise)+'\n'+END+'\n\n';
  const file=path.join(ROOT,'dist/illustrations.js');
  let js=fs.readFileSync(file,'utf8');
  const start=js.indexOf(START),end=js.indexOf(END);
  if(start>=0){assert.ok(end>start);js=js.slice(0,start)+js.slice(end+END.length).replace(/^\s*\n/,'');}
  const anchor='const vocabularyPictures=new Map();';
  assert.ok(js.includes(anchor));js=js.replace(anchor,block+anchor);
  const old="const picture=type==='c'?{type:'cottage',picture:Number(first),cell:Number(second),alt}:{type:'svg',src:`images/vocabulary-folk/${first}.svg?v=20261022-detail`,alt};";
  const replacement="const picture=type==='c'?{type:'cottage',picture:Number(first),cell:Number(second),alt}:{...(paintedVocabularyPictures[first]||preciseVocabularyPictures[first]),alt};";
  assert.ok(js.includes(old)||js.includes(replacement),'Unrecognized illustration registry');
  js=js.replace(old,replacement);
  fs.writeFileSync(file,js);
  console.log(JSON.stringify({painted:Object.keys(painted).length,precise:Object.keys(precise).length,atlases:Object.keys(imported.atlases).length}));
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
