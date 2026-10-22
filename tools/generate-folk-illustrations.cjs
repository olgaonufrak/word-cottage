#!/usr/bin/env node
'use strict';

// Developer-only asset preparation. The published site uses the finished SVGs
// directly, with no Node.js, image libraries, network requests or build step.
// Usage: node tools/generate-folk-illustrations.cjs [--sharp /path/to/sharp]
// Optional: --source DIR --output DIR --contact FILE.png
// A bundled runtime can also supply WORD_COTTAGE_SHARP_MODULE or NODE_PATH.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const PAPER = ['#d5d6b7', '#ebd9ba', '#b2c2c2', '#e2c3aa', '#c6cfb1', '#e0c497'];
const DETAIL_MODULES = ['home', 'appliances-rooms', 'nature-food', 'body-clock'];

function loadDetails() {
  const details = {};
  for (const name of DETAIL_MODULES) {
    const file = path.join(__dirname, 'illustration-details', name+'.cjs');
    for (const [asset, markup] of Object.entries(require(file))) {
      if (details[asset]) throw new Error('Duplicate detail illustration: '+asset);
      if (/<(?:script|foreignObject|image|use|iframe|text)\b|\bon\w+\s*=|javascript:|\b(?:xlink:)?href\s*=/i.test(markup)) throw new Error('Unsafe illustration details: '+asset);
      details[asset] = markup;
    }
  }
  return details;
}

// These pictures teach a specific colour or carry conventional safety meaning.
// Their source fill colours must remain unchanged. Swatches receive no paint
// filter or foreground overlay at all; flags and signs receive only faint grain.
const COLOUR_SWATCHES = new Set([
  '1f7e5.svg','1f7e6.svg','1f7e7.svg','1f7e8.svg','1f7e9.svg','1f7ea.svg','1f7eb.svg','2b1b.svg','2b1c.svg',
  'learn-color-dark-blue.svg','learn-color-gold.svg','learn-color-grey.svg','learn-color-light-blue.svg','learn-color-pink.svg','learn-color-silver.svg'
]);
const PRESERVE_COLOURS = new Set([...COLOUR_SWATCHES,
  '1f1e6-1f1fa.svg','1f1e7-1f1f7.svg','1f1e8-1f1e6.svg','1f1e8-1f1f3.svg','1f1e9-1f1ea.svg','1f1ea-1f1f8.svg',
  '1f1eb-1f1f7.svg','1f1ec-1f1e7.svg','1f1ee-1f1f9.svg','1f1ef-1f1f5.svg','1f1f5-1f1f1.svg','1f1f9-1f1f7.svg',
  '1f1fa-1f1e6.svg','1f1fa-1f1f8.svg','1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.svg',
  '1f6d1.svg','1f6ab.svg','26d4.svg','26a0.svg','267b.svg','1f6a6.svg'
]);
const CONTACT_NAMES = [
  '1f305','1f34e','home-table','home-armchair','home-wardrobe','body-knee',
  'body-head','1f415','1f407','1f355','1f468','1f469',
  '1f1fa-1f1e6','1f7e5','learn-color-dark-blue','learn-number-0','learn-number-1000','learn-month-1',
  'learn-week','learn-clock','learn-half-past-two','learn-apartment','appliance-fridge','1f4f1'
];

function hsl(r,g,b) {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
  if(!d)return [0,0,l];
  const h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;
  return [h*60,d/(1-Math.abs(2*l-1)),l];
}
function rgb(h,s,l) {
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h/60%2-1)),m=l-c/2;
  const a=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return '#'+a.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
function pigment(hex) {
  if(hex.length===4)hex='#'+hex.slice(1).split('').map(v=>v+v).join('');
  const [h,s,l]=hsl(...[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
  if(s<.13)return rgb(45,.15,l>.87?.88:Math.max(.22,l*.85));
  const [hue,sat]=h<22||h>=340?[9,.48]:h<48?[29,.49]:h<78?[43,.65]:h<172?[81,.25]:h<255?[205,.29]:[281,.19];
  return rgb(hue,Math.min(s,sat),l>.85?.83:Math.max(.23,Math.min(.69,l*.88)));
}
function seedFor(name) {
  let seed=2166136261;
  for(const c of name)seed=Math.imul(seed^c.charCodeAt(0),16777619);
  return seed>>>0;
}
function random(seed) {
  return ()=>{seed=Math.imul(seed^seed>>>15,1|seed);seed^=seed+Math.imul(seed^seed>>>7,61|seed);return ((seed^seed>>>14)>>>0)/4294967296;};
}
function sprig(x,y,rotation,flower) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation})" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0Q9-15 7-29" fill="none" stroke="#4e6040" stroke-width="1.1"/><path d="M5-8Q-5-9-4-17Q5-17 5-8M8-15Q17-17 15-25Q6-23 8-15M8-23Q0-26 3-33Q11-29 8-23" fill="#66754d" stroke="#4e6040" stroke-width=".5"/>${flower?'<path d="M7-31Q2-35 5-38Q9-40 11-35Q15-37 17-33Q17-29 12-29Q11-24 7-26Q4-27 7-31" fill="#f4e6be"/><circle cx="10" cy="-32" r="1.7" fill="#ba8f3f"/>':''}</g>`;
}
function paperFlecks(seed) {
  const rnd=random(seed),pale=[],dark=[];
  for(let i=0;i<48;i++) {
    const x=2+rnd()*196,y=2+rnd()*196,dx=.3+rnd()*2.1,dy=(rnd()-.5)*1.5;
    (i%3?pale:dark).push(`M${x.toFixed(1)} ${y.toFixed(1)}l${dx.toFixed(1)} ${dy.toFixed(1)}`);
  }
  return `<path d="${pale.join('')}" stroke="#f6ebcd" stroke-opacity=".2" stroke-width=".45"/><path d="${dark.join('')}" stroke="#67593e" stroke-opacity=".06" stroke-width=".3"/>`;
}
function brush(seed) {
  const rnd=random(seed),pale=[],dark=[];
  for(let i=0;i<40;i++) {
    const x=20+rnd()*160,y=20+rnd()*160,dx=.5+rnd()*5.7,dy=-.5-rnd()*1.5;
    (i%4?pale:dark).push(`M${x.toFixed(1)} ${y.toFixed(1)}q${(dx*.2).toFixed(1)} ${dy.toFixed(1)} ${dx.toFixed(1)} ${(dy*.6).toFixed(1)}`);
  }
  return `<g fill="none" stroke-linecap="round"><path d="${pale.join('')}" stroke="#ffedc8" stroke-opacity=".22" stroke-width=".35"/><path d="${dark.join('')}" stroke="#403c27" stroke-opacity=".07" stroke-width=".3"/></g>`;
}
function parseSource(svg,name) {
  if(/<(?:script|foreignObject|image|use|iframe)\b|\bon\w+\s*=|javascript:|(?:href|url)\s*[=(]/i.test(svg))throw new Error(`Unsafe source: ${name}`);
  const view=svg.match(/\bviewBox="([^"]+)"/);
  if(!view)throw new Error(`Missing viewBox: ${name}`);
  const vb=view[1].trim().split(/\s+/).map(Number);
  if(vb.length!==4||vb.some(v=>!Number.isFinite(v))||vb[2]<=0||vb[3]<=0)throw new Error(`Invalid viewBox: ${name}`);
  const root=svg.match(/<svg\b([^>]*)>/)[1].replace(/\bxmlns="[^"]*"|\bviewBox="[^"]*"/g,'');
  let body=svg.replace(/^.*?<svg[^>]*>/s,'').replace(/<\/svg>\s*$/,'').replace(/<title>[\s\S]*?<\/title>/g,'');
  // Remove only the old full-canvas empty cream backing, never a clock face,
  // calendar, coloured swatch or other meaningful object rectangle.
  if(name.startsWith('learn-'))body=body.replace(/^\s*<rect\b[^>]*\/>/,rect=>{
    const attr=key=>rect.match(new RegExp(`\\b${key}="([^"]+)"`))?.[1];
    return Number(attr('width'))===vb[2]&&Number(attr('height'))===vb[3]&&
      Number(attr('x')||0)===vb[0]&&Number(attr('y')||0)===vb[1]&&
      /^#(?:fffaf0|fff|ffffff)$/i.test(attr('fill')||'')?'':rect;
  });
  if(!PRESERVE_COLOURS.has(name))body=body.replace(/#[a-fA-F0-9]{3,6}\b/g,pigment);
  return {vb,body,root:PRESERVE_COLOURS.has(name)?root:root.replace(/#[a-fA-F0-9]{3,6}\b/g,pigment)};
}
async function boundsOf(source,sharp) {
  const {vb,root,body}=source;
  const bare=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}"><g ${root}>${body}</g></svg>`;
  const raw=await sharp(Buffer.from(bare),{density:144}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=raw.info.width,y0=raw.info.height,x1=0,y1=0;
  for(let y=0;y<raw.info.height;y++)for(let x=0;x<raw.info.width;x++)if(raw.data[(y*raw.info.width+x)*4+3]>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x1<x0||y1<y0)throw new Error('Empty illustration');
  const sx=vb[2]/raw.info.width,sy=vb[3]/raw.info.height;
  return [vb[0]+x0*sx,vb[1]+y0*sy,(x1-x0+1)*sx,(y1-y0+1)*sy];
}
function mixColour(hex, target, amount) {
  if(hex.length===4)hex='#'+hex.slice(1).split('').map(v=>v+v).join('');
  return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-amount)+parseInt(target.slice(i,i+2),16)*amount).toString(16).padStart(2,'0')).join('');
}
// Each painted shape receives its own light and shadow, so an apple, face,
// wooden panel or cushion has volume instead of one flat overall tint.
function shadeShapes(body,root,name,protectedPaint) {
  if(protectedPaint)return {body,root,defs:''};
  const colours=new Map(),softRound=!/^(?:home-|appliance-|room-|learn-)/.test(name);
  const shade=(match,colour)=>{
    const key=colour.toLowerCase();
    if(!colours.has(key))colours.set(key,'pigment-'+colours.size);
    return `fill="url(#${colours.get(key)})"`;
  };
  body=body.replace(/\bfill="(#[a-fA-F0-9]{3,6})"/g,shade);
  root=root.replace(/\bfill="(#[a-fA-F0-9]{3,6})"/g,shade);
  const defs=[...colours].map(([colour,id])=>{
    const stops=`<stop offset="0" stop-color="${mixColour(colour,'#fff1cf',.27)}"/><stop offset=".38" stop-color="${mixColour(colour,'#fff1cf',.04)}"/><stop offset=".8" stop-color="${mixColour(colour,'#3d382a',.12)}"/><stop offset="1" stop-color="${mixColour(colour,'#3d382a',.24)}"/>`;
    return softRound?`<radialGradient id="${id}" cx=".32" cy=".22" r=".88">${stops}</radialGradient>`:`<linearGradient id="${id}" x1="0" y1="0" x2=".65" y2="1">${stops}</linearGradient>`;
  }).join('');
  return {body,root,defs};
}
async function styleSvg(svg,name,sharp,details='',options={}) {
  const source=parseSource(svg,name),{body,root}=source,b=await boundsOf(source,sharp);
  const seed=seedFor(name),colour=COLOUR_SWATCHES.has(name)?'#ebd9ba':PAPER[seed%PAPER.length];
  const text=/<text\b/.test(body),precise=text||PRESERVE_COLOURS.has(name)||/^learn-(?:clock|minute|midnight|noon|oclock|half-past|quarter-)/.test(name);
  const scale=152/Math.max(b[2],b[3]);
  const transform=`translate(${(100-(b[0]+b[2]/2)*scale).toFixed(3)} ${(100-(b[1]+b[3]/2)*scale).toFixed(3)}) scale(${scale.toFixed(5)})`;
  const shaded=shadeShapes(body,root,name,text||PRESERVE_COLOURS.has(name));
  const detailMarkup=details?`<g data-object-details="true">${details}</g>`:'';
  const paintGroup=`<g transform="${transform}" ${shaded.root}>${shaded.body}${detailMarkup}</g>`;
  // Text is never duplicated into decorative masks: calendar and number tokens
  // appear exactly once, and retain the original coordinates and font sizes.
  const extraPaint=!precise;
  const silhouette=extraPaint?body.replace(/\b(fill|stroke)="(?!none)[^"]+"/g,'$1="#fff"'):'';
  const mask=extraPaint?`<mask id="paint-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><g transform="${transform}" ${root.replace(/\b(fill|stroke)="(?!none)[^"]+"/g,'$1="#fff"')}>${silhouette}</g></mask>`:'';
  const soft=precise?'.015':'.11',edge=precise?'.08':'1.45';
  const painted=COLOUR_SWATCHES.has(name)?paintGroup:`<g filter="url(#gouache)">${paintGroup}</g>`;
  const art=precise?painted:`<g filter="url(#object-shadow)">${painted}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" data-style="cottage-folk" data-edition="detailed"><defs>${shaded.defs}
<filter id="object-shadow" x="-10%" y="-10%" width="125%" height="130%"><feDropShadow dx="1.2" dy="2.2" stdDeviation="1.2" flood-color="#64533a" flood-opacity=".18"/></filter>
<linearGradient id="light" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff7dc" stop-opacity=".15"/><stop offset=".55" stop-color="#fff7dc" stop-opacity="0"/><stop offset="1" stop-color="#4e4930" stop-opacity=".06"/></linearGradient>${mask}
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="${seed%97+4}" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".15"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
<filter id="gouache" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".045 .31" numOctaves="3" seed="${seed%97+8}" result="fibres"/><feDiffuseLighting in="fibres" surfaceScale=".65" diffuseConstant=".9" lighting-color="#fff5da" result="raised"><feDistantLight azimuth="225" elevation="55"/></feDiffuseLighting><feComposite in="raised" in2="SourceGraphic" operator="in" result="lit"/><feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="0" k2="${1-Number(soft)}" k3="${soft}" k4="0" result="painted"/><feTurbulence type="fractalNoise" baseFrequency=".15" numOctaves="3" seed="${seed%97+5}" result="edge"/><feDisplacementMap in="painted" in2="edge" scale="${edge}" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
${options.foregroundOnly?'':`<path d="M2 3Q42 1 101 3L197 2L198 197Q128 199 74 197L3 198Z" fill="${colour}"/><path d="M5 6Q82 4 147 6L194 5L194 194L6 195Z" fill="none" stroke="#f8e9c8" stroke-opacity=".58" stroke-width="1.2"/><g filter="url(#paper)"><rect x="5" y="5" width="190" height="190" fill="${colour}"/></g>${paperFlecks(seed+91)}`}${art}
${extraPaint?`<g mask="url(#paint-mask)"><rect width="200" height="200" fill="url(#light)"/>${brush(seed+37)}</g>`:''}${options.foregroundOnly?'':`<g filter="url(#gouache)">${sprig(14,41,-25,seed%2)}${sprig(182,162,155,(seed+1)%2)}</g>`}</svg>\n`;
}
function loadSharp(modulePath) {
  try{return require(modulePath?path.resolve(modulePath):'sharp');}catch(error){throw new Error('Install the developer-only sharp package or pass --sharp /absolute/path/to/sharp (or WORD_COTTAGE_SHARP_MODULE). '+error.message);}
}
async function contactSheet(output,file,sharp) {
  const composites=[];
  for(let i=0;i<CONTACT_NAMES.length;i++) {
    const fileName=CONTACT_NAMES[i]+'.svg';
    const input=await sharp(path.join(output,fileName)).resize(136,136).png().toBuffer();
    composites.push({input,left:i%6*156+10,top:Math.floor(i/6)*164+8});
  }
  const labels=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="936" height="656">${CONTACT_NAMES.map((name,i)=>`<text x="${i%6*156+78}" y="${Math.floor(i/6)*164+158}" text-anchor="middle" fill="#4e5941" font-family="Georgia" font-size="10">${name}</text>`).join('')}</svg>`);
  composites.push({input:labels,left:0,top:0});
  fs.mkdirSync(path.dirname(file),{recursive:true});
  await sharp({create:{width:936,height:656,channels:3,background:'#fff9ed'}}).composite(composites).png().toFile(file);
}
async function main() {
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){if(!['--sharp','--source','--output','--contact'].includes(args[i])||!args[i+1])throw new Error('Expected --sharp PATH, --source DIR, --output DIR or --contact FILE.png');options[args[i].slice(2)]=args[i+1];}
  const sharp=loadSharp(options.sharp||process.env.WORD_COTTAGE_SHARP_MODULE),details=loadDetails();
  const source=path.resolve(options.source||path.join(ROOT,'dist/images/vocabulary')),output=path.resolve(options.output||path.join(ROOT,'dist/images/vocabulary-folk'));
  if(source===output)throw new Error('Source and output directories must differ; originals are preserved.');
  fs.mkdirSync(output,{recursive:true});
  const names=fs.readdirSync(source).filter(name=>name.endsWith('.svg')).sort();
  let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{while(cursor<names.length){const name=names[cursor++],styled=await styleSvg(fs.readFileSync(path.join(source,name),'utf8'),name,sharp,details[name]||'');fs.writeFileSync(path.join(output,name),styled);}}));
  if(options.contact)await contactSheet(output,path.resolve(options.contact),sharp);
  const sizes=names.map(name=>fs.statSync(path.join(output,name)).size);
  console.log(JSON.stringify({illustrations:names.length,objectDetails:Object.keys(details).length,bytes:sizes.reduce((a,b)=>a+b,0),min:Math.min(...sizes),max:Math.max(...sizes),output,contact:options.contact||null}));
}
module.exports={styleSvg,parseSource,loadDetails,PRESERVE_COLOURS,COLOUR_SWATCHES,CONTACT_NAMES};
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
