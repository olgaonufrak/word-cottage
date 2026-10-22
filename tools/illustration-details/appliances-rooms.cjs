'use strict';

// Subject details use the original 160 × 160 drawing coordinates.  Keep these
// separate from the shared paper and paint treatment so that each object keeps
// its own construction, material and familiar silhouette.
const line = (d, color = '#697052', width = 1.5, opacity = 0.8) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
const box = (x, y, w, h, fill, rx = 1, opacity = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${opacity}"/>`;
const dot = (x, y, r, fill = '#697052', opacity = 0.8) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
const ring = (x, y, r, color = '#d7cfb6', width = 1.5, opacity = 0.8) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
const cream = '#fff6dd';
const olive = '#697052';
const warm = '#aa8460';
const casing = (x, y, w, h) =>
  line(`M${x + 4} ${y + h - 4}H${x + w - 5}V${y + 5}`, '#9d9d80', 2, 0.5) +
  line(`M${x + 5} ${y + h - 10}V${y + 8}Q${x + 5} ${y + 5} ${x + 9} ${y + 5}H${x + w - 12}`, cream, 2.2, 0.8);
const vents = (x, y, count, spacing, length, vertical = false, color = olive) =>
  Array.from({ length: count }, (_, i) => line(vertical
    ? `M${x + i * spacing} ${y}v${length}`
    : `M${x} ${y + i * spacing}h${length}`, color, 1.4, 0.65)).join('');
const rivets = (points) => points.map(([x, y]) => dot(x, y, 1.15, '#f6edcf') + dot(x + 0.35, y + 0.35, 0.5, olive)).join('');
const knobTicks = (x, y, r = 10) =>
  line(`M${x - r} ${y - 2}h-2M${x - r + 3} ${y - 8}l-1.5 -1.5M${x} ${y - r}v-2M${x + r - 3} ${y - 8}l1.5 -1.5M${x + r} ${y - 2}h2`, olive, 1.1, 0.8);
const pane = (x, y, w, h) =>
  line(`M${x + 3} ${y + h - 3}L${x + w - 4} ${y + 3}M${x + 3} ${y + h - 10}L${x + w - 11} ${y + 3}`, cream, 2.4, 0.5);
const floor = () =>
  line('M22 136H141M31 127H136M43 141L53 119M73 141L77 120M106 141L102 121M137 140L123 121', '#b3a184', 1.15, 0.65) +
  line('M29 140H42M81 133H103M115 139H128', cream, 1.2, 0.6);
const curtain = (left, right, top, bottom) =>
  line(`M${left - 4} ${top - 3}H${right + 4}`, warm, 2.3) +
  `<path d="M${left - 3} ${top}h7l-2 ${bottom - top}h-8Z" fill="#c3c5a1" opacity="0.8"/>` +
  `<path d="M${right - 4} ${top}h7l3 ${bottom - top}h-8Z" fill="#c3c5a1" opacity="0.8"/>` +
  line(`M${left + 1} ${top + 3}l-2 ${bottom - top - 6}M${right} ${top + 3}l2 ${bottom - top - 6}`, cream, 1.1, 0.7);

module.exports = Object.freeze({
  'appliance-air-conditioner.svg':
    casing(16, 36, 128, 54) +
    line('M25 61H135M32 79H127', '#aaa98d', 1.4, 0.8) +
    vents(36, 71, 18, 5, 7, true, '#8d9e83') +
    line('M121 49v4M126 49v4', cream, 1.3) +
    rivets([[24, 47], [136, 47]]) +
    line('M46 103Q40 114 47 122M84 104Q78 115 84 122M120 104Q115 114 121 122', '#b5d3c5', 1.8),

  'appliance-air-fryer.svg':
    line('M40 79Q80 83 122 79M43 91Q39 125 51 131H63M100 132H108Q122 129 121 101', '#9a9479', 1.5, 0.65) +
    line('M46 29Q78 20 113 29M40 38L37 70', cream, 2.1, 0.75) +
    vents(48, 68, 5, 3, 15, true) + vents(100, 68, 5, 3, 15, true) +
    line('M65 47h7v5h-7M78 47h7v5h-7M91 47h5', '#d5e7d6', 1.1) +
    dot(52, 51, 1.8, '#d1a078') + dot(107, 51, 1.8, '#d1a078') +
    line('M76 102V121M89 96V125', cream, 1.8, 0.65) +
    line('M43 140v3M117 140v3', olive, 2),

  'appliance-blender.svg':
    pane(49, 39, 58, 61) +
    line('M61 40L66 99M97 41L94 99', '#83a9a2', 1.3, 0.7) +
    line('M66 54h6M66 66h9M66 78h6M66 90h6', '#566a57', 1.4) +
    line('M58 75Q74 71 84 76T104 75', '#f0bf8d', 1.8) +
    line('M52 31H105M48 142H107M49 131H66M95 131H111', cream, 1.7, 0.8) +
    knobTicks(80, 124, 11) + dot(80, 124, 2.2, '#cbb583') +
    line('M115 47Q132 46 130 60Q128 70 116 73', cream, 1.6),

  'appliance-coffee-maker.svg':
    casing(31, 22, 99, 118) +
    line('M46 37H77M46 43H65', '#d9e3bd', 1.6) +
    dot(86, 41, 2.2, '#c38865') +
    vents(61, 126, 8, 5, 5, true, '#59675a') +
    line('M68 65H90M70 67v4M84 67v4', cream, 1.4) +
    line('M64 98V108Q64 114 74 115M99 98Q106 102 98 106', '#dfd7b9', 1.8) +
    `<ellipse cx="75" cy="94" rx="14" ry="3" fill="#8f6c4b" opacity="0.65"/>` +
    line('M116 61V117M45 117H54', '#8b9a8b', 1.2) +
    line('M68 85Q64 81 68 77M89 85Q85 81 89 78', '#c7ccc0', 1.2, 0.7),

  'appliance-cooker.svg':
    casing(28, 36, 104, 106) +
    line('M32 63H128M35 136H125', '#a6a58b', 1.4) +
    `<ellipse cx="56" cy="25" rx="7" ry="2.6" fill="none" stroke="#b6bca7" stroke-width="1.3"/>` +
    `<ellipse cx="105" cy="25" rx="7" ry="2.6" fill="none" stroke="#b6bca7" stroke-width="1.3"/>` +
    line('M48 87L65 85M47 109H113M49 115H111', '#b3c4b4', 1.5) +
    pane(47, 82, 66, 40) +
    line('M49 73H110', cream, 1.6) +
    rivets([[35, 72], [126, 72], [35, 128], [126, 128]]) +
    vents(56, 137, 10, 5, 3, true),

  'appliance-dishwasher.svg':
    casing(30, 20, 100, 122) +
    line('M43 31H90M37 49H123', cream, 1.5, 0.75) +
    dot(101, 32, 1.7, '#c78c66') +
    line('M46 60H114M46 125H114M49 110V122M59 110V122M69 110V122M79 110V122M89 110V122M99 110V122M109 110V122', '#c8d1bd', 1.2) +
    line('M56 75V99M78 72V99M100 77V100', '#c0bfa6', 1.2) +
    dot(48, 129, 2, '#3d4f43') + dot(112, 129, 2, '#3d4f43') +
    vents(61, 136, 8, 5, 3, true, '#9c9f81'),

  'appliance-electric-kettle.svg':
    line('M56 58Q50 75 46 119Q45 129 54 131M55 47H102', cream, 2.4, 0.8) +
    line('M72 81H84M72 94H84M72 108H84M72 114H78', '#7a9d96', 1.1) +
    line('M85 81V113M49 134H106M46 141H112', cream, 1.6) +
    line('M31 76L40 91M117 69Q136 69 133 88Q131 105 119 109', '#bfbea0', 1.7) +
    ring(104, 124, 5, '#b27757', 1.1, 0.7) +
    dot(105, 123, 1.3, '#ffe0a1') +
    line('M118 143Q132 149 144 143', olive, 1.9, 0.8),

  'appliance-extractor-fan.svg':
    line('M66 19V61M95 20V62M33 94H126M38 90L63 70M126 94L102 70', cream, 1.8, 0.7) +
    line('M68 31H95M68 35H95', '#929e8f', 1.1, 0.6) +
    vents(47, 102, 13, 5, 8, true, '#bac2b0') +
    dot(116, 106, 1.5, '#e5d5a0') +
    `<ellipse cx="36" cy="107" rx="5" ry="2.4" fill="#fff2bc" opacity="0.9"/>` +
    rivets([[27, 102], [133, 102]]) +
    line('M45 137Q42 129 48 123M77 137Q73 128 79 122M107 137Q103 128 109 122', '#c5cbb5', 1.4),

  'appliance-fan.svg':
    ring(80, 63, 45, cream, 1.2, 0.6) + ring(80, 63, 20, '#87967d', 1, 0.6) +
    line('M80 21V53M80 73V105M38 63H70M90 63H122M50 33L73 56M87 70L110 93M49 93L73 70M87 56L111 33', '#8a9c87', 1.2, 0.65) +
    ring(80, 63, 6, '#c9d1b4', 1.1) +
    line('M80 108V132M57 143H103', cream, 1.6, 0.7) +
    box(75, 118, 10, 4, '#708574', 1.5) +
    rivets([[56, 144], [105, 144]]),

  'appliance-food-processor.svg':
    line('M38 59L43 97M90 61L87 95M34 48H92', cream, 1.9, 0.7) +
    line('M45 64h9M45 74h6M45 84h9', '#73978a', 1.3) +
    line('M63 97L70 91L77 97M104 50V93M126 51V91', '#a4a488', 1.3) +
    line('M66 24H80M66 29H80M66 34H80', cream, 1.4, 0.7) +
    line('M27 108H91M28 129H98M30 140H128', cream, 1.8, 0.65) +
    vents(76, 112, 5, 4, 17, true) +
    knobTicks(115, 118, 11) + dot(42, 119, 1.7, '#ffdfac'),

  'appliance-freezer.svg':
    casing(30, 20, 100, 122) +
    line('M44 38H115M44 74H115M44 110H115M45 57H115M45 93H115M45 128H115', cream, 1.7, 0.7) +
    line('M66 47Q80 51 94 47M66 83Q80 87 94 83M66 119Q80 123 94 119', '#a6aa91', 1.3) +
    line('M47 43V53M47 79V89M47 115V124', '#c7d7cf', 2.3, 0.7) +
    rivets([[124, 41], [124, 78], [124, 117]]) +
    vents(57, 136, 11, 4, 3, true, '#919b80'),

  'appliance-fridge.svg':
    casing(30, 20, 100, 122) +
    line('M51 29H116M52 70H117M52 135H115', cream, 1.7, 0.7) +
    box(37, 34, 14, 22, '#a6a58a', 5, 0.3) +
    box(37, 75, 14, 34, '#a6a58a', 5, 0.3) +
    line('M44 39V49M44 80V102', '#d5d4b9', 1.5, 0.85) +
    line('M124 30V44M124 72V88', '#9a9b81', 3, 0.65) +
    rivets([[124, 32], [124, 42], [124, 74], [124, 86]]) +
    vents(57, 136, 11, 4, 3, true, '#919b80'),

  'appliance-hair-dryer.svg':
    line('M52 52L107 49Q118 49 126 54M52 77L106 88M26 54V77', cream, 2.1, 0.65) +
    vents(25, 56, 4, 5, 20, true, '#65776a') +
    ring(118, 69, 11, '#a8b69a', 1.1, 0.7) +
    line('M105 59L128 80M106 77L127 57', '#859a80', 1.1, 0.7) +
    line('M75 98L69 129M71 134L81 137M80 107H85M79 111H84', '#c5c7ab', 1.6) +
    line('M95 98L88 127', '#9e9d82', 1.2, 0.6),

  'appliance-heater.svg':
    casing(26, 43, 108, 91) +
    line('M44 68H106M44 82H106M44 96H106M44 110H106', '#8f9981', 1.2, 0.8) +
    line('M52 61V113M67 61V113M82 61V113M97 61V113', '#f3bf8b', 1.2, 0.7) +
    vents(114, 103, 5, 4, 10, false, '#a9a58b') +
    ring(122, 64, 8, '#969e81', 1.1) + dot(122, 84, 1.3, '#fce1a4') +
    rivets([[31, 49], [129, 49], [31, 128], [129, 128]]),

  'appliance-hob.svg':
    line('M29 51L122 44M23 118L140 109', '#97a595', 1.8, 0.8) +
    `<g fill="none" stroke="#cad1b6" stroke-width="1.1" opacity="0.8"><ellipse cx="54" cy="69" rx="14" ry="9"/><ellipse cx="103" cy="65" rx="12" ry="8"/><ellipse cx="52" cy="101" rx="16" ry="10"/><ellipse cx="108" cy="97" rx="17" ry="11"/></g>` +
    line('M32 59L43 57M70 79L87 76M69 105L80 103M115 46L121 60', '#e2e3c5', 1.5, 0.5) +
    dot(132, 113, 2.1, '#a7b38f') +
    line('M130 111v3M122 113v2', cream, 1.1),

  'appliance-humidifier.svg':
    line('M56 73Q48 89 44 107M48 117Q45 132 59 137M65 65H94', cream, 2.2, 0.75) +
    line('M49 107Q78 111 113 106M61 137H98', '#94b8af', 1.5, 0.65) +
    ring(80, 121, 10, '#afc7b8', 1.3) +
    line('M80 117V122M77 119Q75 125 80 126Q85 125 83 119', '#eef2d9', 1.3) +
    line('M68 62H91M69 68H91', '#8f9f80', 1.2) +
    dot(98, 128, 1.6, '#d5e5c6') +
    line('M70 40Q65 35 70 29M88 37Q83 31 88 24', '#d5ddd2', 1.5, 0.8),

  'appliance-iron.svg':
    line('M34 113Q49 89 71 84H113M29 122H130M28 127H131', cream, 1.8, 0.7) +
    line('M41 119H125', '#7a9086', 1.3) +
    vents(42, 123, 11, 7, 3, true, '#738577') +
    line('M73 72L77 51Q78 47 83 46H105M109 59L111 74', '#c4c2a5', 1.4) +
    knobTicks(93, 91, 9) + dot(119, 106, 2.2, '#ce9264') +
    line('M115 84L119 92M123 85L127 93', '#d7ddbe', 1.3),

  'appliance-microwave.svg':
    casing(14, 42, 132, 87) +
    line('M114 50V121M27 123H108M27 57V113', '#a3a48a', 1.2) +
    pane(32, 60, 71, 50) +
    vents(36, 64, 4, 4, 8, true, '#95b1a3') +
    line('M45 104H90', '#d9e0c8', 1.2) +
    box(113, 70, 3, 33, '#b1b19a', 1.5) +
    line('M123 57h8M123 61h8', '#dce8cc', 1.1) +
    knobTicks(127, 83, 10) + dot(127, 105, 1.4, '#f9d9a3'),

  'appliance-mixer.svg':
    line('M36 49H69M32 56V70Q32 79 43 80H102M47 32H96', cream, 2.1, 0.8) +
    line('M46 39H101M41 83H104', '#879a7c', 1.3) +
    vents(106, 53, 4, 4, 10, false, '#66775f') +
    line('M82 51v3M88 51v3M94 51v3M126 52V73', '#d7d8bc', 1.2) +
    line('M45 90V110M85 90V110M41 116Q34 128 44 136M81 116Q74 128 84 136M53 116Q62 129 52 137M93 116Q102 129 92 137', '#bdc8b6', 1.2) +
    rivets([[38, 73], [113, 73]]),

  'appliance-oven.svg':
    casing(28, 20, 104, 123) +
    line('M36 51H124M48 62H112M49 118H111M50 113H55M107 113H111', '#d1d7be', 1.5) +
    pane(46, 71, 68, 51) +
    line('M61 105H101M64 102H99', '#efbd8d', 1.2) +
    line('M44 135H117', '#a5a68b', 1.3) +
    vents(54, 137, 11, 5, 3, true) +
    rivets([[34, 59], [126, 59], [34, 130], [126, 130]]) +
    line('M45 32h2M59 32h2M74 32h2M88 32h2M102 32h2M116 32h2', '#dde2c5', 1.1),

  'appliance-remote-control.svg':
    line('M58 29V132Q58 141 66 142H94M102 25V132', cream, 1.6, 0.8) +
    line('M68 26V30M65 27Q61 34 68 35Q75 34 72 28', '#f7d4b0', 1.2) +
    ring(80, 65, 14, '#d0d6af', 1.2) +
    line('M77 55l3 -3l3 3M77 75l3 3l3 -3M70 62l-3 3l3 3M90 62l3 3l-3 3', '#f4edcd', 1.2) +
    line('M65 95h6M90 95h6M65 113h6M90 113h6M65 131h6M90 131h6', '#d3dcc9', 1.3) +
    box(74, 16, 12, 3, '#8d9a7d', 1.4, 0.8) +
    rivets([[57, 136], [103, 136]]),

  'appliance-robot-vacuum.svg':
    `<ellipse cx="80" cy="83" rx="49" ry="30" fill="none" stroke="#c2c6a9" stroke-width="1.5"/>` +
    line('M34 81Q36 65 58 58M100 59Q123 65 126 82M35 102Q80 128 126 101', cream, 1.7, 0.75) +
    line('M44 119H56M105 119H116M35 111L35 115M123 111V115', '#8c9a88', 1.5) +
    box(70, 60, 20, 5, '#c5d1ac', 2.4) + ring(80, 85, 4, '#e5e9ca', 1.1) +
    line('M80 82V85M33 116L27 119M127 115L134 119', '#b9c5b1', 1.2) +
    vents(67, 115, 7, 4, 5, true, '#647b6f'),

  'appliance-toaster.svg':
    line('M31 81Q33 75 41 75H122M30 83V117Q30 126 41 127H108', cream, 2.2, 0.7) +
    line('M34 124H127M35 131H126', '#7e9175', 1.3) +
    line('M47 41Q43 35 49 34Q54 34 57 37Q63 32 69 37M91 40Q87 34 93 32Q98 31 102 35Q109 31 113 37', '#f2ce91', 1.5, 0.8) +
    dot(51, 49, 1.4, '#a96f49') + dot(63, 55, 1.5, '#a96f49') + dot(96, 48, 1.4, '#bc9566') + dot(108, 55, 1.6, '#bc9566') +
    line('M111 88H126M116 98V107', '#9ca58c', 1.2) +
    knobTicks(45, 105, 11) + dot(81, 108, 2.4, '#b57856') +
    vents(64, 115, 7, 5, 7, true, '#819577'),

  'appliance-tumble-dryer.svg':
    casing(30, 20, 100, 122) +
    ring(80, 94, 32, '#dce0c5', 1.3) +
    line('M49 86Q53 70 67 65M109 103Q103 118 91 123', cream, 1.7, 0.8) +
    line('M69 88L74 94L71 109M83 88L85 99L82 113', '#f0b18a', 1.4) +
    box(111, 88, 4, 12, '#727f6c', 2) +
    line('M42 33H60M46 37H59M73 30v6M80 30v6M87 30v6', '#8b997c', 1.3) +
    dot(96, 33, 1.8, '#ce9c6d') +
    vents(52, 136, 13, 4, 3, true, '#929c81'),

  'appliance-vacuum-cleaner.svg':
    line('M37 100Q62 95 89 103M31 110Q30 122 43 125H81', cream, 2, 0.75) +
    line('M76 100Q94 88 96 67Q98 45 116 44', '#9cae96', 1.5) +
    line('M101 53l-4 1M99 61l-4 1M98 69l-4 1M95 78l-4 -1M92 86l-4 -2M87 94l-3 -3', '#b6c1a4', 1.4) +
    line('M46 91H69M49 95H67M131 61V108M129 116V132M118 137H146', '#d4dfca', 1.6) +
    ring(43, 132, 6, '#8fa48c', 1.3) + ring(85, 132, 6, '#8fa48c', 1.3) +
    vents(66, 110, 6, 4, 10, true),

  'appliance-washing-machine.svg':
    casing(30, 20, 100, 122) +
    ring(80, 94, 32, '#dce0c5', 1.3) +
    line('M49 85Q54 70 68 65M109 104Q103 119 89 124', cream, 1.7, 0.8) +
    line('M58 109Q70 104 82 111T101 109M63 116Q78 112 92 118', '#a8d0c8', 1.3, 0.8) +
    line('M68 89L73 97L85 92M70 100L88 103', '#cccbb1', 1.2) +
    box(111, 88, 4, 12, '#727f6c', 2) +
    line('M44 32H65M46 36H63M78 31v4M86 31v4', '#acb493', 1.2) + dot(96, 33, 1.7, '#c98b64') +
    box(110, 129, 11, 6, '#c2c3a4', 1.5) + rivets([[36, 133], [123, 133]]),

  'room-attic.svg':
    line('M29 76L80 25L131 76M42 70L80 34L117 70', '#f1b68a', 1.5, 0.8) +
    line('M46 63L55 63M59 49L68 49M73 35L82 35M100 51L109 51M114 66L123 66', '#ae7658', 1.2, 0.65) +
    line('M39 81H121M39 128H84M115 128H122M39 136H84M114 136H122', '#b7a385', 1.4) +
    line('M47 90L52 95M62 90L67 95M47 115L53 109M68 109L64 115', cream, 1.3) +
    line('M90 94V137M108 96V136M94 105H104M96 126H103', '#b18e68', 1.2) +
    line('M62 61H73M62 70H73M88 58V70M95 57V70', '#e3d6b2', 1.2) +
    rivets([[38, 84], [121, 84]]),

  'room-basement.svg':
    line('M17 97H31M15 116H29M16 133H31M130 101H144M131 137H144M23 97V106M21 117V126M139 101V110M136 128V137', '#988e76', 1.6, 0.65) +
    line('M42 97H119M43 138H117', '#f6c098', 1.4) +
    line('M52 107H77M73 116H85M73 132H81M49 137H114', '#c6bda0', 1.2) +
    line('M106 105h6M98 115h6M89 125h6', warm, 1.4) +
    line('M49 118H57M63 118H67M54 129H58M63 129H67', '#e5c28d', 1.2) +
    line('M48 73L53 78M59 80L64 84M98 73L103 78M109 80L114 84', cream, 1.2) +
    line('M34 62L80 24L127 62', '#d8e1bd', 1.5, 0.7),

  'room-bathroom.svg':
    floor() +
    line('M39 27H124M18 135L34 119M131 121L142 135', '#cbd6bf', 1.5) +
    line('M41 84H83M39 98Q42 112 48 113H76', '#d0d1b5', 1.4) +
    line('M31 93H84', cream, 2) +
    line('M43 47V82M50 40H63', cream, 1.2) +
    dot(48, 94, 1.2, '#8c9e8e') +
    line('M109 72H128M112 76H121M108 99Q112 105 119 105M116 117H122', '#cecfb3', 1.3) +
    line('M110 94H128', cream, 1.4) +
    box(73, 34, 19, 27, '#93b6b1', 2, 0.7) +
    line('M76 38L85 48M77 47L88 57', cream, 1.6, 0.7),

  'room-bedroom.svg':
    floor() + curtain(75, 107, 34, 61) +
    pane(75, 34, 32, 26) +
    line('M48 95H109M48 107H109M60 94V116M78 94V116M96 94V116', '#d5d9b6', 1.2, 0.75) +
    line('M50 118H110M49 72H111M47 129H51M109 129H114', '#a68c66', 1.4) +
    line('M55 79Q64 75 76 79M53 84H76', '#c8bfa1', 1.2) +
    line('M25 100H34M25 110H34M29 96V116', '#a78764', 1.2) + dot(31, 104, 1.1) +
    line('M25 67L23 73M31 66L34 73M23 90H35', '#f0c190', 1.2),

  'room-dining-room.svg':
    floor() +
    line('M18 46V114M142 46V115M39 30H123', '#e8dfc7', 1.5) +
    line('M39 88H47M39 95H47M115 88H123M115 95H123M37 108H49M113 108H125', '#c6d0a8', 1.3) +
    line('M57 99H104M63 92L66 94M100 92L103 94', '#e2c594', 1.4) +
    `<ellipse cx="80" cy="95" rx="10" ry="2.2" fill="none" stroke="#c7b99b" stroke-width="1.1"/>` +
    line('M93 84V89M92 90H96M61 92L58 95M100 97l3 1', cream, 1.2) +
    line('M67 46H95M72 43V49M89 43V49', '#eeb88c', 1.3) +
    box(55, 39, 13, 14, '#b6bf9a', 0.6, 0.7) +
    line('M57 50L60 44L63 47L66 42', '#e9d4a3', 1.2),

  'room-guest-room.svg':
    floor() + curtain(78, 109, 32, 59) + pane(78, 32, 31, 26) +
    line('M46 93H98M46 105H98M56 92V114M72 92V114M88 92V114', '#d3d9b3', 1.2) +
    line('M45 118H99M46 69H99M44 126H48M98 126H102', '#a78c67', 1.3) +
    line('M53 77Q62 74 73 78M52 83H73', '#c8bfa2', 1.2) +
    line('M116 95V120M133 95V120M123 93V122M121 87H127', '#efb487', 1.3) +
    box(119, 102, 10, 6, '#c5b08a', 1.2) +
    line('M122 103H126M24 101H33M24 111H33', '#f0d2a4', 1.2) +
    dot(28, 105, 1.1),

  'room-hall.svg':
    floor() +
    line('M86 46H111M86 48V106H111M87 74H110M98 46V106', '#cec4a5', 1.3) +
    line('M80 39V114M116 39V114', '#e1c598', 1.5) +
    line('M41 65L44 80M49 63L50 82M58 68V86M64 63V91M43 84H54M59 92H68', '#d7d7af', 1.2) +
    dot(50, 71, 1.1) + dot(50, 78, 1.1) +
    line('M43 47v4M60 47v4', '#b2b591', 1.4) +
    line('M62 129H111M58 133H115M65 127L59 136M75 127L71 136M85 127L83 136M95 127L96 136M105 127L109 136', '#dfc69b', 1.1) +
    line('M37 117H51M40 128H53M43 112L46 117M44 124L48 128', '#b9a181', 1.1),

  'room-kitchen.svg':
    floor() +
    line('M43 35H71M43 58H71M84 35H118M84 58H118', '#cbd3af', 1.3) +
    line('M46 36V57M69 36V57M85 36V57M117 36V57', '#8d9b7a', 1.1) +
    box(52, 45, 2.4, 9, '#e2d6b4', 1) + box(60, 45, 2.4, 9, '#e2d6b4', 1) +
    box(95, 45, 2.4, 9, '#e2d6b4', 1) + box(104, 45, 2.4, 9, '#e2d6b4', 1) +
    line('M41 70H78M41 66H52M70 66H79M42 77H121M48 90H74M48 115H74M61 91V113', '#d6c09c', 1.3) +
    box(66, 96, 2.5, 9, '#7a8668', 1) +
    pane(88, 94, 23, 17) +
    line('M87 90H112M94 80h-6M112 80h-6M43 124H121', '#d8dfc2', 1.2),

  'room-living-room.svg':
    floor() + curtain(61, 104, 34, 65) + pane(61, 34, 43, 30) +
    line('M46 84Q59 79 75 83M87 83Q103 79 115 84M54 110H76M87 110H108M42 97V113M117 97V113', '#d1d7b2', 1.5) +
    line('M57 86L64 91L60 101M100 86L95 92L99 102', '#7c8f70', 1.2) +
    line('M56 133H105M61 129L58 136M71 129L70 136M83 129V136M95 129L99 136', '#e5cc9f', 1.1) +
    line('M126 106H134M127 109H133M131 82L125 78M131 86L138 79', '#e8bf8e', 1.2) +
    line('M39 39H54M109 39H124', '#e7dfc6', 1.4),

  'room-room.svg':
    floor() + curtain(61, 104, 41, 85) + pane(61, 41, 43, 43) +
    line('M40 117H124M39 114H124M18 44V117M142 44V117', '#dbd5bd', 1.4, 0.7) +
    line('M46 130Q79 122 112 130Q79 139 46 130Z', '#d4dab5', 1.3) +
    line('M57 130Q80 125 103 130Q80 134 57 130Z', '#899e7d', 1.1) +
    line('M22 57V99M25 57V99M20 102H26M21 53H26', '#bcb89a', 1.1) +
    line('M39 29H124', cream, 1.6),

  'room-study.svg':
    line('M22 136H47M74 136H141M31 127H48M72 127H136M43 141L46 134M74 141L77 120M106 141L102 121M137 140L123 121', '#b3a184', 1.15, 0.65) +
    line('M29 140H42M81 133H103M115 139H128', cream, 1.2, 0.6) +
    line('M101 35V105M122 73V104M105 74H120M105 100H120', '#e1c397', 1.3) +
    line('M108 45V63M117 43V63M126 47V63M108 80H116M108 89H116', '#efe3bd', 1.2) +
    pane(47, 56, 32, 20) +
    line('M50 60H63M50 64H69M50 68H58', '#d9e1c6', 1.1, 0.7) +
    line('M39 97H92M44 92L47 95M73 93H86M43 102L41 128M88 102L90 128', '#e3c398', 1.3) +
    box(52, 90, 21, 4, '#c5cbb0', 1) +
    line('M55 91V93M59 91V93M63 91V93M67 91V93', '#7b8f77', 0.9) +
    line('M54 113H66M54 119H66M53 134H68M39 84V87M42 84V87', '#c9d4ad', 1.2),
});
