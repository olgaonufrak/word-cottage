'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'../../../..');
const dir = path.resolve(__dirname,'..');
const out = path.join(root,'dist/town-plan/scenes');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8').replace(/^\uFEFF/,''));
const revision = 'open-pixel-v3';
const baseline = read('baseline.json');
const baselineMap = new Map(baseline.manifest.images.map(record=>[record.id,record]));
const replacements = ['chapters-01-04.json','chapters-05-08.json','chapters-09-12.json','chapters-13-15.json'].flatMap(read);
assert.equal(replacements.length,45,'All 45 new images must be ready before integration');
const replacementMap = new Map(replacements.map(record=>[record.id,record]));
assert.equal(replacementMap.size,45,'Every image must have a unique replacement');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const audit = [];
for (const record of replacements) {
  const previous = baselineMap.get(record.id);
  assert(previous,record.id+' is not a baseline scene');
  assert.equal(record.visualRevision,revision,record.id);
  assert.equal(record.file,`images/${record.id}-open-v3.jpg`,record.id);
  assert(record.prompt && record.prompt.length>100,record.id+' missing exact prompt');
  assert(record.sourcePath && fs.existsSync(record.sourcePath),record.id+' missing selected PNG');
  assert(record.width>0 && record.height>record.width,record.id);
  const file = path.join(out,record.file);
  assert.equal(fs.statSync(file).size,record.bytes,record.id+' byte count');
  const nextSha = sha(file);
  const previousSha = sha(path.join(out,previous.file));
  assert.notEqual(nextSha,previousSha,record.id+' still uses the old image');
  audit.push({id:record.id,previousFile:previous.file,file:record.file,sha256:nextSha,previousSha256:previousSha,bytes:record.bytes,redrawn:true});
}
const names = ['chapters-01-05.json','chapters-06-10.json','chapters-11-14.json','chapter-15.json'];
const outputs = names.map(name=>{
  const records = JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
  return {name,records:records.map(old=>{
    const fresh = replacementMap.get(old.id);
    assert(fresh,old.id);
    assert.equal(fresh.chapter,old.chapter);assert.equal(fresh.number,old.number);
    assert.equal(fresh.title,old.title);assert.equal(fresh.caption,old.caption);
    const snapshot = {...old};delete snapshot.previousVersions;
    const previousVersions = old.visualRevision===revision ? (old.previousVersions||[]) : [...(old.previousVersions||[]),snapshot];
    const record = {id:old.id,chapter:old.chapter,number:old.number,title:old.title,caption:old.caption,file:fresh.file,sourcePath:fresh.sourcePath,generatedSource:fresh.generatedSource,width:fresh.width,height:fresh.height,bytes:fresh.bytes,prompt:fresh.prompt,visualRevision:revision,previousVersions};
    const edits = [...(fresh.editPrompts||[]),...(fresh.editPrompt?[fresh.editPrompt]:[])];
    if(edits.length)record.editPrompts=edits;
    if(fresh.references)record.references=fresh.references;
    return record;
  })};
});
assert.equal(outputs.flatMap(output=>output.records).length,45);
// No canonical file is changed until every replacement has passed the checks above.
for(const output of outputs)fs.writeFileSync(path.join(dir,output.name),JSON.stringify(output.records,null,2)+'\n');
audit.sort((a,b)=>a.id.localeCompare(b.id));
const report={date:'2026-10-30',revision,baseCommit:baseline.baseCommit,images:45,redrawn:45,previousImagesPreserved:true,allFilesVersioned:true,allExactPromptsSaved:true,styleSha256:sha(path.join(__dirname,'STYLE.md')),bytes:audit.reduce((sum,record)=>sum+record.bytes,0),records:audit};
fs.writeFileSync(path.join(__dirname,'redraw-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({revision,images:45,redrawn:45,bytes:report.bytes}));
