'use strict';

// Material and construction details in each original 160 × 160 drawing.
// These are deliberately tied to the illustrated surfaces: wood follows the
// furniture, stitches follow fabric hems, and reflections stay inside glass.
const ink = '#74664c', light = '#f6e7c8', wood = '#97734c';
const path = (d, stroke = ink, width = 1.2, extra = '') =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect = (x,y,w,h,stroke=ink,r=0,extra='') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="1.15" ${extra}/>`;
const dot = (x,y,r=1.5,fill=ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`;
const stitch = d => path(d,'#eee6ce',1.1,'stroke-dasharray="2 3"');
const screw = (x,y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#c9ba99" stroke="${ink}" stroke-width=".75"/>${path(`M${x-1} ${y}h2`,ink,.7)}`;
const panels = (x,y,w,h) => rect(x,y,w,h,'#a38054',2)+path(`M${x+2} ${y+h-2}V${y+2}H${x+w-2}`,light,1.25);
const verticalGrain = (x,y,w,h) => path(`M${x+3} ${y+3}q-2 ${h*.28} 0 ${h*.49}t0 ${h*.42}M${x+w-3} ${y+4}q2 ${h*.2} 0 ${h*.36}t0 ${h*.5}`,wood,.9,'stroke-opacity=".62"');
const g = content => `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${content}</g>`;

module.exports = {
  'home-armchair.svg': g(
    path('M46 75V53q0-15 16-15h36q16 0 16 15v23','#bcc6a2',1.6)+
    path('M48 81q32 5 64 0M49 105q30 4 61 0','#6e7e53',1.1)+
    stitch('M49 95q1-3 5-3h51q6 0 6 5M22 91v20M137 91v20')+
    path('M21 80q8-5 15 1M124 81q8-5 14 0','#d4d8b9',1.6)+
    [61,98].map(x=>[53,69].map(y=>dot(x,y,2,'#526441')+path(`M${x-4} ${y-3}l2 2m4 2 2 2m-8 0 2-2m4-2 2-2`,'#8b9a6c',.8)).join('')).join('')+
    path('M33 125v8M121 125v8','#d2ae7a',1.2)
  ),
  'home-balcony.svg': g(
    path('M38 27h84M39 122h81','#f6edd6',1.7)+
    path('M61 44h15L61 65M84 43h13L84 61','#f1f2da',2,'stroke-opacity=".8"')+
    path('M63 72l11-11M85 71l10-10','#e9eedb',1.2)+
    path('M23 111h114M39 24v53m82-53v53','#b28361',1.2)+
    [25,45,67,89,112,135].map(x=>dot(x,85,1,'#d7d5b6')).join('')+
    path('M28 116h104M40 120l8 8M120 120l-8 8','#805e45',1.1)+
    path('M36 45h14m-14 18h14m60-18h14m-14 18h14','#cfc3a6',.9)
  ),
  'home-bed-sheet.svg': g(
    stitch('M28 74h84v53M124 71l11-15v47l-13 18')+
    path('M35 79q4 20 0 43M55 76q-3 25 1 48M80 78q3 23-1 46M107 77q-3 23 0 47','#d0cfb8',1.2)+
    path('M34 61l16-17h70M43 64l13-14h61','#fff8df',1.3)+
    path('M123 77q3 15 1 26M129 69q5 15 3 31','#b8c1a1',1.3)+
    path('M32 124q11-3 18 1m15 1q8 3 17-1m13-1 13 1','#e1dec6',1.7)
  ),
  'home-bedside-table.svg': g(
    panels(50,67,60,18)+verticalGrain(39,57,6,72)+verticalGrain(116,57,5,72)+
    path('M43 57h75M49 101h62M48 120h63','#edcca1',1.2)+
    path('M55 105q20-3 48 0M54 114q27-3 48 1','#b38b5e',.9)+
    path('M66 21l-8 16m18-16-2 16m11-16 2 16m9-16 8 16','#c4a36b',1)+
    path('M58 39h44','#f8e6b5',1.7)+dot(75,76,1,'#654f37')+dot(85,76,1,'#654f37')+
    path('M46 134h4m60 0h7','#cfac79',1.5)
  ),
  'home-blanket.svg': g(
    path('M35 44h86M35 56h86M35 68h86','#c3cba9',1.2)+
    path('M36 85h88M31 115h98M31 122h98','#a1ae83',1)+
    path('M34 84v12m13-12v12m13-12v12m13-12v12m13-12v12m13-12v12m13-12v12m13-12v12','#e7e5c9',1)+
    stitch('M34 35v43M124 35v43M29 87v36h102V87')+
    path('M31 134l3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5m7-5 3 5','#839365',1)
  ),
  'home-blinds.svg': g(
    [43,59,75,91,107,123].map(y=>path(`M33 ${y+2}h94`,'#f2e6c5',1.3)+path(`M33 ${y+7}h94`,'#b1a27a',.85)).join('')+
    path('M29 28h101M29 34h101','#e8e9d1',1.2)+
    path('M45 42v86M115 42v86','#eee4c3',1)+
    screw(30,31)+screw(130,31)+
    path('M142 46v72','#e3ddc5',1.1)+path('M140 125h4m-4 3h4','#826f4d',.9)
  ),
  'home-bookcase.svg': g(
    path('M31 23h98M30 139h100M38 69h84M38 106h84','#e7c79a',1.3)+
    verticalGrain(28,24,7,111)+verticalGrain(124,24,7,111)+
    path('M46 39h6m-6 13h6m10-17h6m-6 16h6m-21 29h6m-6 9h6m25-14h7m-7 15h7m11-9h6m-6 9h6m-54 23h6m-6 14h6m12-15h6m-6 13h6m24-10h6m-6 11h6','#f5e7c8',1.2)+
    path('M83 36l7-2m-4 18 7-2','#fff1d1',1.1)+
    path('M56 31v24m15 20v18m33-14v14m-32 19v18','#826645',.8)+
    path('M38 135h84','#816044',1.2)
  ),
  'home-carpet.svg': g(
    stitch('M25 49h110v62H25Z')+
    path('M35 59h21m48 0h21M35 101h21m48 0h21M35 64v31m90-31v31','#b99563',1)+
    path('M41 66l5 5-5 5-5-5zm0 18 5 5-5 5-5-5m78-28 5 5-5 5-5-5zm0 18 5 5-5 5-5-5','#b47960',1.1)+
    path('M80 63l23 17-23 17-23-17Z','#cbd2a8',1.1)+
    path('M80 75v10m-5-5h10','#efd6a0',1.1)+
    path('M25 37l2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6m9-6 2 6','#d4bb8c',.9)
  ),
  'home-ceiling.svg': g(
    path('M20 37l18-12h88l14 12-14 7H38Z','#f4c29a',1.4)+
    path('M47 26l-13 15M65 26l-7 16M99 26l7 16M116 26l13 14','#be7d58',1.1)+
    path('M20 43v91M141 43v91','#ddd5b8',1)+
    path('M39 114h86','#eee5ca',1.5)+
    path('M75 64l-3 6m6-6-1 6m7-6 1 6m3-6 2 6','#b89f78',.8)+
    path('M68 76h10l-10 7m17-7h10l-10 7','#edf0d8',1.3)+
    path('M30 138l11-16M130 122l12 16','#c6baa0',.9)
  ),
  'home-chopping-board.svg': g(
    path('M36 58v77q0 3 4 3h79q5 0 5-5V59M68 48V27q0-12 11-12','#f0cfa0',1.6)+
    path('M49 57q12 4 27 1t29 0M40 75q16-4 36 0t42-1M42 94q20 4 38 0t39 0M44 111q15-4 34 0t38 1M49 137q19-3 45 0','#b48a57',.8)+
    path('M57 69l37 34M59 108l42-27M74 118l26-27','#a88153',.9,'stroke-opacity=".65"')+
    path('M75 42q-4-6-2-9m14-14q8 2 7 13','#b28c59',1)+
    path('M57 86q4-6 11-2t-1 4q-8 2-10-2','#b38a55',.9)
  ),
  'home-coat-hanger.svg': g(
    path('M75 26q0-7 7-8t11 4M83 46v8','#e4c79a',1.9)+
    path('M30 101l48-38m7 0 44 36M29 109h103','#d9b17c',1.3)+
    path('M42 104q10-2 22 0t29 0t24 0','#a17e50',.9)+
    dot(80,60,1.8,'#685c43')+path('M32 112h96','#7e6143',1)
  ),
  'home-colander.svg': g(
    path('M30 73q50-22 100 0M36 78q45 16 89 0','#f0f1db',1.5)+
    path('M32 85q5 28 25 35M126 85q-5 27-25 35','#dbe3ca',1.4)+
    path('M28 100q-13-3-13-11M134 100q11-3 11-11','#d6ddc6',1.4)+
    [[39,83],[60,87],[80,88],[101,87],[121,83],[50,104],[70,105],[90,105],[110,104],[69,119],[90,119]].map(([x,y])=>dot(x,y,1.5,'#77876c')+path(`M${x-1} ${y+2}h2`,'#e6ead3',.9)).join('')+
    path('M64 130h32M66 134h29','#c1cfb2',1.1)
  ),
  'home-cupboard.svg': g(
    panels(37,50,33,64)+panels(90,50,33,64)+
    verticalGrain(25,41,6,79)+verticalGrain(130,41,5,79)+
    path('M27 39h106M24 129h112','#f0c99c',1.4)+
    path('M41 57q2 20 0 44m24-46q-2 17 0 41m30-37q-2 20 0 43m23-45q2 18 0 43',wood,.8,'stroke-opacity=".55"')+
    rect(32,57,3,10,'#8a7758',.5)+rect(32,97,3,10,'#8a7758',.5)+rect(125,57,3,10,'#8a7758',.5)+rect(125,97,3,10,'#8a7758',.5)+
    dot(67,76,1.4,'#d7ba80')+dot(67,89,1.4,'#d7ba80')+dot(93,76,1.4,'#d7ba80')+dot(93,89,1.4,'#d7ba80')
  ),
  'home-curtain.svg': g(
    path('M30 35v48M66 36q-4 31-20 48M129 35v48M94 36q4 31 20 48','#cbd1a8',1.4)+
    path('M35 99l-1 31m10-31 9 31m63-31-9 31m20-31 1 31','#829565',1.3)+
    stitch('M31 39v41M129 39v41M31 133h24M105 133h24')+
    path('M33 90q8-4 14-1m66 0q6-3 14 1','#d0b578',2)+
    path('M46 90q8-4 8 1t-8 1m67-2q-8-4-8 1t8 1','#b69862',1)+
    path('M64 45h10L59 60M86 57h11L85 69','#faf4dd',1.3)+
    [34,48,61,99,112,126].map(x=>path(`M${x} 29v5`,'#a78f64',1.1)).join('')
  ),
  'home-desk.svg': g(
    path('M19 47h121M19 54h121','#f3cfa0',1.4)+
    path('M26 51q24-3 41-1t29 0t30 1',wood,.8)+
    panels(106,69,22,20)+panels(106,104,22,20)+
    verticalGrain(22,61,9,74)+verticalGrain(97,61,5,74)+
    path('M102 134h31M26 61v72','#dbaf7b',1.1)+
    path('M44 30h30m-29 3h28m-26 2h24','#b8ab8b',.9)+
    path('M49 40h30','#c3cb9e',1.1)+
    [113,122].map(x=>dot(x,78,1,'#6c583c')+dot(x,113,1,'#6c583c')).join('')
  ),
  'home-doormat.svg': g(
    panels(58,31,43,45)+path('M49 20h62M48 27v55','#f4ebd3',1.2)+
    path('M32 99l93-1 14 34H21Z','#d9bf8d',1.1)+
    path('M32 108l9 17m1-20 11 20m0-21 12 21m0-21 12 21m0-21 12 21m0-22 12 22m0-22 12 22m0-22 12 22','#ddc292',.85)+
    path('M43 105l-8 19m20-19-8 19m21-19-8 19m21-19-8 19m21-20-8 20m21-20-8 20m21-20-8 20','#927448',.8)+
    path('M91 59h3','#f7e8c8',.9)+
    stitch('M29 129h106')
  ),
  'home-drawer.svg': g(
    panels(46,91,72,24)+path('M37 32h89M38 120v7h88','#e8bd88',1.3)+
    path('M28 79h86v12M44 48h74l-2 23','#f3d7af',1.4)+
    path('M30 83q22-3 45-1t35 0M48 96q20-2 36 0t27 0',wood,.85)+
    path('M39 55h12M36 60h10M34 66h10M113 54h7m-8 6h7m-8 6h7','#a28058',1.1)+
    path('M43 49l-11 22M115 48l-1 22','#c3a071',1.1)+
    path('M68 84v4h10v-4M77 101v3h10v-3','#9b784e',1)+
    verticalGrain(124,34,5,91)
  ),
  'home-dustpan.svg': g(
    path('M73 28v46M77 29v25','#cad2ad',1.5)+
    rect(75,29,10,6,'#65764e',2)+
    path('M47 80h65l13 35M47 82l-14 32M43 117h75','#e0e7c9',1.6)+
    path('M41 91q30 7 77 0M36 116q40 5 90 0','#9dab84',1)+
    path('M24 126h112M24 131h112','#a8b691',1.2)+
    path('M94 102l9-2m2 8 13-2M32 119h94','#788b62',.9)
  ),
  'home-extension-lead.svg': g(
    rect(23,74,101,32,'#fff4d8',2)+
    [39,73,107].map(x=>`<circle cx="${x}" cy="90" r="10.5" fill="none" stroke="#b2b69b" stroke-width="1"/>`+path(`M${x-6} 80q6-3 12 0`,'#f8f0d7',1.3)).join('')+
    screw(24,90)+screw(122,90)+
    path('M32 115q-11 14 10 17h68q22-1 21-22V56q0-15-15-17','#c1c6aa',1.1)+
    path('M91 25h18M91 29h18M91 33h18','#b8b99e',1.1)+
    rect(94,39,13,3,'#cfccb4',1)+
    path('M90 16v4M108 16v4','#c8c5a7',1)
  ),
  'home-floor.svg': g(
    path('M38 109h84M31 120h101M22 135h117','#f2c09a',1.1)+
    path('M46 109l-2 4m26-4v4m19-4v4m27-4 2 4M38 120l-4 5m28-5-1 5m28-5 1 5m31-5 4 5M31 132l-4 5m28-5-1 5m18-5v5m25-5 1 5m31-5 3 5','#ad704d',.85)+
    path('M44 115h18m7-1h11m9 0h18m-72 16 17-1m12 0h12m14 0 20 1','#ca8962',.8)+
    path('M65 45h11L65 54M85 62h10l-10 8','#f0f0d7',1.4)+
    path('M19 100h13M132 100h9M39 80v21m86-21v21','#dbd2b5',1.1)
  ),
  'home-furniture.svg': g(
    panels(24,38,9,66)+panels(41,38,9,66)+
    path('M19 31h37M19 115h37M55 115h43','#ebcc9f',1.1)+
    path('M61 118q19-2 35 0M24 43v57m24-57v57','#ad8558',.8)+
    path('M99 83v-7q0-5 5-5h15q5 0 5 5v6M101 109h22','#d4ddbc',1.2)+
    path('M100 97q12 2 24 0','#7c8c64',1.1)+
    dot(107,79,1.3,'#788a60')+dot(117,79,1.3,'#788a60')+
    stitch('M89 90v19M135 90v19')+
    path('M55 126l-2 14M100 126l2 14','#dfbd8c',1)
  ),
  'home-garage.svg': g(
    path('M31 59l49-31 48 31M44 54h71M58 45h44','#c9d1b1',1.4)+
    path('M30 68h101M29 74v62m102-62v62','#f9f0d3',1.4)+
    path('M30 85h4m-4 15h4m-4 15h4m-4 15h4m92-45h4m-4 15h4m-4 15h4m-4 15h4','#c9bd9f',1.1)+
    path('M58 105h14l-12 7M85 105h12l-11 7','#edf0d8',1.4)+
    path('M53 116h53M53 128h53M57 124h8m31 0h8','#e9b28e',1.2)+
    path('M75 123v3m4-3v3m4-3v3m4-3v3','#69756a',.85)+
    path('M57 137h6m35 0h6','#b1b6a0',1)
  ),
  'home-grater.svg': g(
    path('M56 40h42l17 88M44 130h73M108 44l9 7 16 77','#f2f1dc',1.5)+
    path('M66 31v-9q1-7 14-7t13 8v9','#bcc7ac',1.4)+
    [[58,53],[84,53],[54,76],[84,76],[50,99],[84,99]].map(([x,y])=>path(`M${x-4} ${y+11}h10`,'#f6f2dc',1.4)+path(`M${x} ${y+2}l-2 5`,'#5f7059',.9)).join('')+
    path('M109 57l3 11m4 20 3 10m4 20 2 8','#7a8b72',1.2)+
    path('M39 137h96M42 141h90','#a8b596',1.1)+
    screw(57,40)+screw(99,41)
  ),
  'home-kitchen-scales.svg': g(
    path('M36 49q44-11 88 0M37 54h86M41 78h77l10 53','#f0efd9',1.4)+
    path('M31 131h96M50 102h59v14H50Z','#a1af8e',1.1)+
    path('M52 105h13m-13 4h13m-13 4h13','#d9e2c5',.9)+
    path('M71 105h9v8h-9Z','#71825e',1.7)+
    dot(39,122,2.6,'#879a73')+dot(120,122,2.6,'#879a73')+
    path('M38 121h2m79 0h2','#e5e9d1',.8)+
    path('M74 68h12M48 137v2m65-2v2','#728366',1.1)
  ),
  'home-ladle.svg': g(
    path('M108 23q-6 1-8 9l-17 69','#d0dbc3',2)+
    path('M50 105q27-16 57 2M49 111q27 14 57 1','#e8edd7',1.5)+
    path('M52 116q0 15 18 19M77 136q18-1 25-15','#d0dac1',1.4)+
    path('M60 109q15-5 30-1','#7d8e72',1)+
    path('M98 39l3 1m-6 9 3 1m-6 10 3 1','#a7b49a',1.1)
  ),
  'home-lamp.svg': g(
    path('M59 30l-17 40m28-40-7 40m17-40v40m10-40 7 40m4-40 17 40','#c4a36a',1.2)+
    path('M55 30h49M41 73q39-7 78 0M43 77q37 9 74 0','#f8e8bd',1.4)+
    path('M79 91v36M54 135q26 7 52 0','#d4c49a',1.4)+
    path('M64 130q16-3 32 0','#89784f',1)+
    path('M82 85v9','#6b6548',1)+dot(83,96,1.5,'#b8945b')
  ),
  'home-mattress.svg': g(
    path('M24 72h80v29H24ZM112 72l25-25v23l-25 26Z','#eff0d9',1.25)+
    stitch('M25 76h77M25 98h77M115 75l18-18m-18 33 18-18')+
    [[54,48],[82,53],[105,46],[75,40]].map(([x,y])=>dot(x,y,1.5,'#9ba988')+path(`M${x-3} ${y-2}l6 4m-5 1 4-5`,'#c6ceb0',.8)).join('')+
    path('M32 82q7-3 13 0m12 0q7-3 13 0m12 0q7-3 13 0M115 85l6-6m5-5 6-6','#c0c6a6',1)+
    path('M41 85h10v4H41M78 85h10v4H78','#8f9b7c',.9)
  ),
  'home-mop.svg': g(
    path('M48 26l37 72','#d8b281',1.8)+
    path('M82 101l16-8 5 10-16 8Z','#bac8a5',1)+
    screw(92,102)+
    path('M88 114q-13 13-17 18m20-19-9 20m13-21-5 21m8-22 1 22m3-22 5 22m-2-22 11 22m-6-19 13 19','#f3ebd1',1.5)+
    path('M80 132v3m7-3v3m6-3v3m7-3v3m7-3v3m7-3v3m8-3v3','#a6ad8b',.8)+
    path('M48 24l4 7','#8a6e4a',1.1)
  ),
  'home-picture-frame.svg': g(
    path('M29 28h102v107H29ZM37 36h86v91H37Z','#f0d5aa',1.2)+
    path('M26 25l14 14m80 0 14-14m-108 113 14-14m80 0 14 14','#8e6948',1.1)+
    path('M29 42v75m101-75v75M46 32h65M46 130h65','#986e46',.85)+
    path('M78 52v9m-8 1 7 3m8 6 7 4m-12-7-6 9m9-12 7-5','#d8a58b',1.1)+
    dot(77,64,1,'#ebce8d')+dot(82,62,1,'#b78d43')+dot(82,69,1,'#ebce8d')+
    path('M60 87l12 4m27 5-12 4','#b7c69a',1)+
    path('M48 47h12l-12 12','#fff9e5',1.2,'stroke-opacity=".75"')
  ),
  'home-pillow.svg': g(
    stitch('M31 53q23 5 49 1 26-4 48-1-5 25 0 54-24-4-48 0-25 4-48 0 4-26-1-54Z')+
    path('M42 63q13 2 25 0M43 66q13 2 20 0M91 95q12-3 25 1M97 98q8-2 16 0','#fff7df',1.3)+
    path('M39 62l7 5m68 0 6-5M39 99l8-5m65 0 8 6','#c5cdac',1)+
    path('M51 78q6-3 8 1t-3 7m43-8q-6-3-8 1t3 7','#e1e4ca',1.2)
  ),
  'home-rolling-pin.svg': g(
    `<g transform="rotate(-35 80 80)">${path('M46 61h65M45 97h68','#f1d7ad',1.5)}${path('M42 72q20-4 40 0t35 0M43 88q20 4 40 0t34 0','#bf9862',.9)}${path('M56 78q6-4 11 0t-1 4q-7 3-10-4','#bd945c',.85)}${path('M38 65v29m84-29v29','#ae8452',1.1)}${path('M16 75h14m-14 10h14m99-10h14m-14 10h14','#dbb581',1.3)}${path('M15 79h13m103 1h13','#9e7446',.85)}</g>`
  ),
  'home-roof.svg': g(
    path('M31 61l49-39 49 39','#efb18b',1.4)+
    path('M69 37h23M54 50h52M42 60h76','#c98259',.8)+
    path('M73 32v6m13-7v7m-23 7v7m16-7v7m16-7v7M50 55v7m15-7v7m15-7v7m15-7v7m15-7v7','#8e6045',1.1)+
    path('M38 69h83M39 134h28m32 0h22','#e2d6b9',1)+
    path('M74 99h18v36H74M80 105v24','#a17d52',.9)+
    dot(89,116,1.4,'#6b6048')+
    path('M47 84h4l-4 5m58-5h3l-3 5','#f0f0d8',1.1)
  ),
  'home-shelf.svg': g(
    path('M23 61h114M23 124h114','#edc496',1.3)+
    path('M25 66q23-3 43-1t32 0t33 0M25 128q32-3 59-1t47 0',wood,.8)+
    path('M38 35h7m-7 17h7m11-23h7m-7 23h7m11-12h6m-6 12h6','#f2dfb8',1)+
    path('M51 29v26m17-18v17','#6b7c50',.8)+
    path('M105 107h12l-1 9h-10Z','#bec9a1',1)+
    path('M111 99V84m0 8-4-5m4 3 4-4','#9daa7b',1.1)+
    screw(35,75)+screw(101,138)+
    path('M35 89l21-17M101 150l20-16','#c49b69',1.1)
  ),
  'home-socket.svg': g(
    rect(35,29,90,103,'#ece6ca',10)+rect(44,38,72,85,'#fff6dc',5)+
    `<circle cx="80" cy="80" r="25" fill="none" stroke="#b5c0a1" stroke-width="1.1"/>`+
    path('M61 65q19-19 38 0M61 96q18 16 38 0','#eff0d8',1.3)+
    screw(80,42)+screw(80,119)+
    path('M57 77v6M103 77v6','#929e80',1.6)+
    path('M69 74v8m22-8v8','#404d3e',2)
  ),
  'home-stairs.svg': g(
    path('M24 118h17m4-22h18m4-22h18m4-22h18m4-22h25','#b28c5d',1.2)+
    path('M25 121v4m23-26v4m22-26v4m22-26v4m23-26v4','#f6ecd4',1.3)+
    path('M27 136q30-3 54 0t49 0M51 114q27-3 50 0t29 0M75 92q26-3 54 0M97 70q16-2 32 0M118 48h12','#d0bd9c',.85)+
    path('M26 87l96-75','#d5b485',1.2)+
    path('M28 88v22m31-45v21m33-43v21','#aaa987',1)+
    dot(31,88,1.2,'#715e42')+dot(63,63,1.2,'#715e42')+dot(96,37,1.2,'#715e42')
  ),
  'home-table.svg': g(
    path('M23 48l13-9h87l11 9M20 53h120M20 70h120','#f0cca0',1.4)+
    path('M28 46q20-4 37-2t26 0t30 1M35 41h73M24 56q31-3 56 0t52 0M25 66q24 2 47 0t58 1',wood,.85)+
    path('M92 55q5-3 10-1t-1 4q-5 2-9-3','#a17c51',.85)+
    verticalGrain(29,77,12,57)+verticalGrain(119,77,12,57)+
    path('M33 79v52m90-52v52','#d7ac78',1.2)+
    dot(35,78,1.2,'#735d42')+dot(125,78,1.2,'#735d42')+
    path('M43 77h4m63 0h4','#b89060',1)
  ),
  'home-towel.svg': g(
    stitch('M44 41v69M98 41v69M44 135h54')+
    path('M45 46h51M45 58h51M45 70h51M45 82h51M45 94h51M45 106h51','#e0e6ca',.85)+
    path('M46 118v6m7-6v6m7-6v6m7-6v6m7-6v6m7-6v6m7-6v6m7-6v6','#b9c7a5',1)+
    path('M51 130v5m6-5v5m6-5v5m6-5v5m6-5v5m6-5v5m6-5v5m6-5v5','#8c9e7d',.9)+
    path('M105 44v76M24 38h13m67 0h28','#e7cfaa',1.1)
  ),
  'home-vase.svg': g(
    path('M65 28q15 5 30 0M67 34q13 3 25 0M46 119q34 20 68 0M57 132q23 7 46 0','#cad7bd',1.3)+
    path('M69 43q2 14-10 29M103 81q12 18 9 29','#bacab0',1.6)+
    path('M62 88q18-11 36 0M60 102q20-11 40 0','#e4e7cc',1.2)+
    path('M80 87v29m0-18q-11-11-16-7 3 9 16 11m0 7q10-12 15-7-2 8-15 11','#d3ddbd',1.2)+
    dot(80,84,3,'#c6af74')+
    path('M61 56q-5 9-9 14','#dbe3c8',1.1)
  ),
  'home-wall.svg': g(
    path('M40 68h79M40 73h79M40 111h26m33 0h20M40 126h26m33 0h20M40 135h26m33 0h20','#e8af88',1)+
    path('M51 63v11m-11 36v14m16-14v14m49-14v14m14-14v14m-72 2v10m60-10v10M67 78v31m30-30v13','#bd7a53',.9)+
    path('M74 98h18v37H74M79 104v24','#a78052',.9)+
    dot(90,116,1.4,'#6a6045')+
    path('M48 84h4l-4 5m58-5h3l-3 5','#eff0d8',1.1)+
    path('M41 135h24M100 135h19','#9d6849',1.4)
  ),
  'home-wardrobe.svg': g(
    panels(41,35,30,90)+panels(89,35,30,90)+
    path('M28 17h104M32 25h96M31 136h98','#f0cca0',1.4)+
    verticalGrain(28,29,6,105)+verticalGrain(125,29,6,105)+
    path('M45 41q-3 27 0 58t0 20m21-78q3 24 0 42t0 36m27-75q-2 24 0 46t0 30m21-76q2 29 0 51t0 24',wood,.8,'stroke-opacity=".65"')+
    rect(35,47,3,10,'#927e5a',.4)+rect(35,107,3,10,'#927e5a',.4)+rect(122,47,3,10,'#927e5a',.4)+rect(122,107,3,10,'#927e5a',.4)+
    dot(68,72,1.4,'#d7b780')+dot(68,85,1.4,'#d7b780')+dot(92,72,1.4,'#d7b780')+dot(92,85,1.4,'#d7b780')+
    path('M38 143h5m75 0h5','#cda575',1)
  ),
  'home-whisk.svg': g(
    path('M99 74l33-43M101 77l34-43','#dfbb87',1.1)+
    path('M106 64l5 4m2-13 5 4m2-13 5 4','#9e784a',.9)+
    path('M98 78l7 7M94 82l7 7','#d1d5bb',1.5)+
    path('M90 86q-43-10-57 14M88 89q-40 10-48 31M88 90q-16 14-17 33','#e4ead1',1.1)+
    path('M30 120q4 11 15 11m4-6q-8 10-11 4m24 1q6-1 7-6','#7d8c73',1)+
    path('M129 28l4-2','#f0d5a7',1.2)
  )
};
