const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),storage=new Map(),timers=[];
let keyHandler;
function makeElement(id){
  let html='';const classes=new Set();
  return {id,setAttribute(){},style:{},textContent:'',disabled:false,classList:{add(...values){values.forEach(value=>classes.add(value));},remove(...values){values.forEach(value=>classes.delete(value));},toggle(value,active){active?classes.add(value):classes.delete(value);},contains:value=>classes.has(value)},
    get innerHTML(){return html;},set innerHTML(value){html=value;for(const match of value.matchAll(/\bid="([^"]+)"/g))elements.set(match[1],makeElement(match[1]));},
    querySelectorAll(){return [];},setPointerCapture(){},releasePointerCapture(){},getBoundingClientRect:()=>({width:400})};
}
function element(id){if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);}
const context=vm.createContext({console,window:{},setTimeout:callback=>{timers.push(callback);return timers.length;},clearTimeout(){},document:{getElementById:element,querySelector:element,addEventListener(type,handler){if(type==='keydown')keyHandler=handler;},activeElement:{tagName:'BODY'}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(require('node:path').join(__dirname,'../dist',"data.js"),'utf8'));
storage.set('word-cottage-learned',JSON.stringify(run("words.filter(w=>w.category==='nouns').slice(0,10).map(w=>w.id)")));
run(fs.readFileSync(require('node:path').join(__dirname,'../dist',"search.js"),'utf8'));
run(fs.readFileSync(require('node:path').join(__dirname,'../dist',"app.js"),'utf8'));
function flush(){while(timers.length)timers.shift()();}
function click(id){assert.equal(Boolean(element(id).disabled),false,id);element(id).onclick();flush();}
function event(x,y,type='touch'){return {pointerId:1,clientX:x,clientY:y,isPrimary:true,pointerType:type,button:0,cancelable:true,preventDefault(){}};}
function swipe(dx,dy=0){const card=element('swipe-card');card.onpointerdown(event(100,100));card.onpointermove(event(100+dx,100+dy));card.onpointerup(event(100+dx,100+dy));}
const selectedQueue=()=>JSON.parse(run('JSON.stringify(session.queue.map(word=>word.id))'));

// Swipes change only the chosen-word count, and learning starts on the fifth right swipe.
const savedBefore=storage.get('word-cottage-learned');
run("suggestWords(['nouns'],false,5)");assert.equal(run('selection.deck.length'),100);assert.equal(run('session'),null);
assert.equal(run('selection.deck.slice(0,90).every(word=>!learned.has(word.id))'),true);
swipe(10);flush();assert.equal(run('selection.index'),0);
swipe(20,130);flush();assert.equal(run('selection.index'),0);
const cancelled=element('swipe-card');cancelled.onpointerdown(event(0,0));cancelled.onpointermove(event(120,0));cancelled.onpointercancel();cancelled.onpointerup(event(120,0));flush();assert.equal(run('selection.index'),0);
const rejected=run('selection.deck[0].id');swipe(-120);flush();assert.equal(run('selection.chosen.length'),0);assert.equal(run('selection.skipped.length'),1);assert.equal(run('session'),null);
swipe(120);assert.equal(run('selection.busy'),true);assert.equal(element('swipe-learn').disabled,true);
run('decideSwipe(true)');assert.equal(timers.length,1);flush();assert.equal(run('selection.chosen.length'),1);
for(let i=0;i<3;i++){swipe(120);flush();assert.equal(run('screen'),'selection');assert.equal(run('session'),null);}
assert.match(element('selected-total').textContent,/4 із 5/);
swipe(120);assert.equal(run('session'),null);flush();assert.equal(run('screen'),'study');assert.equal(run('session.queue.length'),5);assert.equal(run('selection'),null);
assert.equal(selectedQueue().includes(rejected),false);assert.equal(new Set(selectedQueue()).size,5);assert.equal(storage.get('word-cottage-learned'),savedBefore);

// Repeated study and filters keep the chosen set and never include skipped words.
const chosen=selectedQueue();run('for(let i=0;i<5;i++){session.flipped=true;rate(true);}');flush();click('restart');assert.deepEqual(selectedQueue(),chosen);
run('showLearned()');assert.match(element('app').innerHTML,/Вивчені слова/);assert.equal(run('learned.size'),15);

// Mouse dragging, buttons, and keyboard use the same target logic in mixed mode.
run("suggestWords(['verbs','adjectives'],true,3)");
const mouseCard=element('swipe-card');mouseCard.onpointerdown(event(0,0,'mouse'));mouseCard.onpointermove(event(120,0,'mouse'));assert.equal(mouseCard.classList.contains('is-learning'),true);mouseCard.onpointerup(event(120,0,'mouse'));flush();assert.equal(run('selection.chosen.length'),1);
keyHandler({key:'ArrowLeft',preventDefault(){}});flush();assert.equal(run('selection.chosen.length'),1);
keyHandler({key:'ArrowRight',preventDefault(){}});flush();assert.equal(run('selection.chosen.length'),2);
click('swipe-learn');assert.equal(run('session.queue.length'),3);assert.equal(run("session.queue.every(word=>['verbs','adjectives'].includes(word.category))"),true);

// Exhausting the candidates cannot begin a smaller session; skipped words are opt-in on review.
run("suggestWords(['common'],false,100)");click('swipe-skip');click('swipe-skip');
for(let i=0;i<98;i++)click('swipe-learn');
assert.equal(run('screen'),'selection');assert.equal(run('session'),null);assert.equal(run('selection.chosen.length'),98);assert.match(element('swipe-content').innerHTML,/Усі слова переглянуто/);
click('review-skipped');assert.equal(run('selection.deck.length'),2);assert.equal(run('selection.skipped.length'),0);
click('swipe-learn');assert.equal(run('screen'),'selection');click('swipe-learn');assert.equal(run('session.queue.length'),100);assert.equal(new Set(selectedQueue()).size,100);

// Skipping the whole deck also stays in selection, and navigation cancels delayed decisions.
run("suggestWords(['verbs'],false,1)");for(let i=0;i<100;i++)click('swipe-skip');assert.equal(run('session'),null);assert.equal(run('selection.chosen.length'),0);
click('review-skipped');assert.equal(run('selection.deck.length'),100);click('swipe-learn');assert.equal(run('session.queue.length'),1);
run("suggestWords(['nouns'],false,5);decideSwipe(true);home()");flush();assert.equal(run('screen'),'home');assert.equal(run('session'),null);
run("suggestWords(['nouns'],false,5);decideSwipe(true);suggestWords(['common'],false,10)");flush();assert.equal(run('selection.chosen.length'),0);assert.equal(run('selection.ids[0]'),'common');
assert.throws(()=>run("suggestWords(['nouns'],false,101)"));
console.log('Passed: touch and mouse gestures, vertical/cancelled drag rejection, exact right-swipe target, skipped-word exclusion, double-action lock, exhaustion and skipped review, mixed mode, buttons, keyboard, navigation cancellation, and existing progress.');
