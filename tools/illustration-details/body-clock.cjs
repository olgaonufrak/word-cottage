'use strict';

// Small anatomical contours leave the original terracotta teaching markers
// visible. Every overlay uses the source drawing's 160 × 160 coordinates.
const line=(d,colour='#9e8268',width=1,opacity='.7')=>`<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
const face=line('M53 72q8-7 16-1m22 0q9-6 16 1M57 79q4 3 9 0m28 0q4 3 9 0M82 85q4 6 3 10M72 99q3 2 5 0m8 0q3 2 5 0M71 118q9 3 18 0M37 75q-5-3-3 6l5 4m85-10q5-3 3 6l-5 4M68 132q12 6 24 0','#896f59',.9);
const shirt=line('M42 146q7-14 18-16m58 16q-7-14-18-16M61 133q19 16 38 0M48 145l5-7m54 0 5 7','#8c9679',1.1);
const hair=line('M46 43q8-22 27-24M52 45q13-22 32-25M63 43q17-19 31-20M76 38q16-13 26-10M90 37q13-9 17-3M107 39l6 12','#f0ddba',.9,'.7');
const faceNames=['cheek','chin','face','forehead','hair','lip'];
const details=Object.fromEntries(faceNames.map(name=>['body-'+name+'.svg',face+shirt+hair]));
details['body-head.svg']=line('M53 61q7-5 16 0m22 0q8-5 16 0M58 68q4 3 9 0m26 0q4 3 9 0M84 78l1 9M72 96q3 2 6 0m8 0 4 1M69 110q11 4 22 0M38 68q-6-2-4 7l5 3m83-10q6-2 4 7l-5 3M50 91q3 14 13 20m46-20q-3 14-13 20','#8c644f',.9)+shirt;
details['body-arm.svg']=line('M32 23h19q18 1 25 16M31 59h45M36 56v-6m8 6v-6m8 6v-6M65 37q10 2 14 12l12 31M96 90q13 8 31 20M128 111l8 6m-9-3 7 5','#f3e3bf',1.3,'.8')+line('M66 52q8 13 14 29m4 9 10 4','#935c49',1);
details['body-back.svg']=line('M66 20q7-9 21-7m-24 9q8-7 24-7M69 43q11 5 22 0M59 84q10-4 15-1m12 0q10-4 15 1M62 99q7 0 11 9m25-9q-7 0-11 9M62 121q9 7 15 4m6 0q8 3 15-4M31 102l-5 25m102-25 6 25','#ab8b72',1.1);
const torso=line('M68 51q12 5 24 0M54 76q11-7 20-3m12 0q10-4 20 3M60 94q7 3 14 0m12 0q7 3 14 0M60 135q3 4 8 4m24 0q5 0 8-4M28 121l5 9m94 0 5-9','#ac8d72',1.1);
for(const name of ['chest','neck','shoulder','stomach'])details['body-'+name+'.svg']=torso;
details['body-body.svg']=line('M69 22q4-2 7 0m10 0 5 0M78 28l-1 5 5 0M73 37q7 3 14 0M65 56q15 6 30 0M70 65v23m20-23v23M70 99q10 5 20 0M62 119l-3 22m38-22 5 22M43 84l-5 11m82-11 5 11','#b77d64',1);
details['body-elbow.svg']=line('M35 29q11-2 15 9l18 36M35 39l16 32M62 96q5 7 14 10M94 104l25 13M119 115q9 3 9 7M65 81q5-3 9 1M68 96q6 7 13 8','#b0967c',1.2)+line('M39 31l18 36M87 110l28 14','#fff0cf',1.3,'.7');
details['body-knee.svg']=line('M49 27l26 3-5 28M48 58l18 1M75 76q8 1 12 7M74 80q-3 7 0 11m15 2-2 8M75 110l-2 19M76 133h40q7 0 8 5M75 138h45','#ae8b71',1.1)+line('M47 33l-1 19M75 116l-1 14M79 132h31','#f5e6c6',1.5,'.8');
details['body-finger.svg']=line('M75 31v-9q5-5 10 0v9q-5 3-10 0M73 44q7 4 14 0m-14 9q7 4 14 0M76 66q4 2 9 0M92 58q8 2 14 0m8 12q5 3 11 0M55 113q19 9 42 1M72 122q12 5 23 0M37 73q5-3 9 2','#a07c62',1.1);
details['body-thumb.svg']=line('M29 75q5-3 12 0l1 9q-7 1-12-3zM48 77q-1 7-4 12M55 83q-2 6-5 10M70 108q11 9 28 7M69 124q13 7 26 3M80 49h26q7 0 9 6M83 59h22M86 77h22m-18 17h17','#a38369',1.05);
details['body-toe.svg']=line('M47 29q9-6 18 0l1 11q-9 5-20-1zM76 34q6-4 13 0v8q-6 4-13 0zM95 47q5-4 11 0v7q-6 3-11 0zM112 63q5-3 10 0v7q-4 3-9-1M126 82q4-2 7 1v5M51 56q6 3 13 0M61 93q15 12 34 4M66 121q17 8 29 0','#ab8b72',1.05);

// Bevelled rims and individual minute marks add clock detail. Hand coordinates
// and the meaning of each time remain exactly as in the original source.
const clocks=['clock','minute','noon','midnight','oclock','half-past-two','quarter-past-two','quarter-to-three'];
for(const name of clocks){
  const ink=name==='midnight'?'#e1d8b8':'#807856';
  const ticks=Array.from({length:60},(_,i)=>{
    if(i%5===0)return '';
    const a=i*Math.PI/30,p=r=>[80+Math.sin(a)*r,80-Math.cos(a)*r].map(v=>v.toFixed(2));
    return `M${p(53).join(' ')}L${p(55).join(' ')}`;
  }).join('');
  details['learn-'+name+'.svg']=`<g fill="none"><circle cx="80" cy="80" r="58" stroke="#f8eccc" stroke-width="1" opacity=".7"/><circle cx="80" cy="80" r="63" stroke="#7f7856" stroke-width=".8" opacity=".6"/><path d="M35 43A58 58 0 0 1 114 34" stroke="#fff5d5" stroke-width="1.4" opacity=".65"/><path d="${ticks}" stroke="${ink}" stroke-width=".7" opacity=".75"/><circle cx="79" cy="79" r="2" stroke="#fff0ba" stroke-width=".9"/></g>`;
}
module.exports=details;
