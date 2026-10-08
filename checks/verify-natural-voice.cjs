const {fixture}=require('./fixture.cjs');
const assert=require('node:assert/strict');
async function main(){
  const f=fixture(),{run,element}=f;
  run(`window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
    window.voices=[{name:'Legacy British',lang:'en-GB'},{name:'Google UK English Female',lang:'en-GB'},{name:'Google US English',lang:'en-US'},{name:'Legacy Ukrainian',lang:'uk-UA'},{name:'Google українська',lang:'uk-UA'}];
    window.spoken=[];window.speechSynthesis={getVoices:()=>window.voices,cancel(){},speak(u){window.spoken.push(u)}};
    speak('time','en','https://upload.wikimedia.org/time.mp3')`);
  assert.equal(run('window.spoken.at(-1).voice.name'),'Google US English');
  assert.equal(run('window.spoken.at(-1).rate'),.95);
  assert.equal(run('window.spoken.at(-1).pitch'),1);
  run("speak('час','uk')");assert.equal(run('window.spoken.at(-1).voice.name'),'Google українська');assert.equal(run('window.spoken.at(-1).lang'),'uk-UA');
  run("window.voices=[{name:'Legacy',lang:'en-US'},{name:'Premium English',lang:'en-GB'},{name:'Microsoft English Natural',lang:'en-GB'}];speak('time','en')");assert.equal(run('window.spoken.at(-1).voice.name'),'Microsoft English Natural');
  // Async voice availability is handled on the first click, without a second utterance.
  run(`window.voices=[];window.listeners=new Set();window.speechSynthesis.addEventListener=(name,fn)=>window.listeners.add(fn);window.speechSynthesis.removeEventListener=(name,fn)=>window.listeners.delete(fn);window.spoken=[];speak('first','en')`);
  assert.equal(run('window.spoken.length'),0);
  run("window.voices=[{name:'Google US English',lang:'en-US'}];[...window.listeners].forEach(fn=>fn())");
  assert.equal(run('window.spoken.length'),1);assert.equal(run('window.spoken[0].text'),'first');assert.equal(run('window.listeners.size'),0);
  // A new click cancels the old pending voice request.
  run("window.voices=[];window.spoken=[];speak('old','en');speak('нове','uk');window.voices=[{name:'Google українська',lang:'uk-UA'}];[...window.listeners].forEach(fn=>fn())");
  assert.equal(run('window.spoken.length'),1);assert.equal(run('window.spoken[0].text'),'нове');
  // Recordings remain available when the correct synthesis voice is missing or fails.
  run(`window.Audio=class{constructor(url){this.url=url;window.lastAudio=this}pause(){this.paused=true}play(){this.played=true;return Promise.resolve()}};
    window.voices=[{name:'Google US English',lang:'en-US'}];speak('час','uk','https://upload.wikimedia.org/uk.mp3')`);
  assert.equal(run('window.lastAudio.played'),true);
  run("const oldAudio=window.lastAudio;speak('time','en')");assert.equal(run('oldAudio.paused'),true);
  run("speak('time','en','https://upload.wikimedia.org/time.mp3');window.spoken.at(-1).onerror({error:'synthesis-failed'})");assert.equal(run('window.lastAudio.url'),'https://upload.wikimedia.org/time.mp3');
  run("const oldUtterance=window.spoken.at(-1);speak('latest','en');const latestAudio=window.lastAudio;oldUtterance.onerror({error:'synthesis-failed'})");assert.equal(run('window.lastAudio===latestAudio'),true);
  run("speak('час','uk')");assert.match(element('toast').textContent,/український голос/);
  // An empty voice list has a bounded wait and still attempts the requested language.
  run("window.voices=[];window.spoken=[];speak('timeout','en')");await new Promise(resolve=>setTimeout(resolve,760));assert.equal(run('window.spoken.length'),1);assert.equal(run('window.spoken[0].lang'),'en-US');assert.equal(run('window.listeners.size'),0);
  console.log('Passed: Google voice priority for both languages, natural voice fallback, normal reading pace, delayed voice availability, rapid-click cancellation, recorded fallback, and missing voices.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
