'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const out = path.join(root, 'dist/town-plan/scenes');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8').replace(/^\uFEFF/, ''));
const chapters = read('chapters.json');
const records = ['chapters-01-05.json','chapters-06-10.json','chapters-11-14.json','chapter-15.json'].flatMap(read).sort((a,b) => a.chapter-b.chapter || a.number-b.number);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
assert.equal(chapters.length, 15);
assert.equal(records.length, 45);
assert.equal(new Set(records.map(record => record.id)).size, 45);
for (const chapter of chapters) {
  assert.deepEqual(records.filter(record => record.chapter === chapter.chapter).map(record => record.number), [1,2,3]);
}
const images = records.map(record => {
  const expected = `ch${String(record.chapter).padStart(2,'0')}-${String(record.number).padStart(2,'0')}`;
  assert.equal(record.id, expected);
  assert.equal(record.visualRevision,'open-pixel-v3',record.id+' has not been restyled');
  assert.match(record.file, new RegExp(`^images/${expected}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\\.jpg$`));
  const bytes = fs.statSync(path.join(out, record.file)).size;
  assert(bytes > 10000, record.file);
  assert(record.width > 0 && record.height > record.width, record.file);
  assert(record.title && record.caption && record.prompt, record.id);
  return {id:record.id, chapter:record.chapter, number:record.number, title:record.title, caption:record.caption, file:record.file, width:record.width, height:record.height, bytes, visualRevision:record.visualRevision};
});
const manifest = {date:'2026-10-30', revision:'open-pixel-v3', kind:'generated-game-concepts', chapters, images};
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out, 'manifest.js'), 'window.TOWN_PLAN_SCENES='+JSON.stringify(manifest).replace(/</g,'\\u003c')+';\n');
const first=images[0];
const index=chapters.map(chapter => `<details><summary>${chapter.chapter}. ${escape(chapter.title)}</summary><ol>${images.filter(image=>image.chapter===chapter.chapter).map(image=>`<li><a href="#${image.id}" data-scene-link="${image.id}">${escape(image.title)}</a> · <a href="${image.file}">JPEG</a></li>`).join('')}</ol><a class="text-link" href="../#design-${chapter.chapter+1}">Текст цього розділу ↗</a></details>`).join('\n');
const html=`<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f7f4e9"><meta name="description" content="45 зображень піксельної гри Word Cottage: по три сцени до кожного з 15 розділів плану."><title>45 сцен містечка — Word Cottage</title><link rel="stylesheet" href="style.css?v=20261029-fit1"><script src="manifest.js?v=open-pixel-v3" defer></script><script src="gallery.js?v=20261029-fit1" defer></script></head>
<body><header><a class="brand" href="../../">Word Cottage</a><a href="../">← До плану гри</a><h1>Містечко крок за кроком</h1><p>15 розділів плану · 3 сцени до кожного · 45 оновлених зображень</p><p class="note">Візуальна концепція майбутньої гри. Усі слова розділу обов’язкові, а завершення його міського проєкту потребує N/N.</p></header>
<main><section aria-label="Перегляд ігрових сцен"><div class="pickers" id="pickers" hidden><label>Розділ плану<select id="chapter-select"></select></label><label>Сцена<select id="scene-select"></select></label></div><div class="scene-heading"><h2 id="scene-title">${escape(first.title)}</h2><span id="counter" role="status" aria-live="polite" aria-atomic="true">1 / 45</span></div><p class="chapter-label" id="chapter-label">1. ${escape(chapters[0].title)} · сцена 1 / 3</p><div class="image-area" id="image-area"><figure id="image-stage" tabindex="0" aria-label="Ігрова сцена"><img id="scene-image" src="${first.file}" width="${first.width}" height="${first.height}" alt="${escape(first.caption)}" fetchpriority="high"></figure><p id="loading" role="status" hidden>Завантаження зображення…</p><div class="load-error" id="load-error" role="alert" hidden><p>Не вдалося завантажити зображення.</p><button type="button" id="retry">Спробувати ще раз</button></div></div><p class="caption" id="caption">${escape(first.caption)}</p><div class="tools"><button type="button" id="view-full" aria-controls="photo-viewer" hidden>На весь екран</button><button type="button" id="zoom" aria-pressed="false" aria-controls="image-stage" hidden>Збільшити</button><a id="open-image" href="${first.file}" target="_blank" rel="noopener">Відкрити JPEG ↗</a><a id="text-link" href="../#design-2">Прочитати розділ плану</a></div><nav class="navigation" id="navigation" aria-label="Перегляд зображень" hidden><button type="button" id="previous" disabled>← Назад</button><span id="short-counter" aria-hidden="true">1 / 45</span><button type="button" id="next">Далі →</button></nav></section><section class="contents" id="contents"><h2>Усі розділи та сцени</h2><p>Обери розділ або відкрий окреме зображення. Галерея завантажує лише поточну сцену.</p>${index}</section></main><dialog class="photo-viewer" id="photo-viewer" aria-labelledby="viewer-title"><div class="viewer-toolbar"><h2 id="viewer-title">${escape(first.title)}</h2><div id="viewer-zoom-slot"></div><button type="button" id="close-viewer" aria-label="До розділів: закрити перегляд">Розділи</button></div><div class="viewer-image-slot" id="viewer-image-slot"></div><div id="viewer-navigation-slot"></div></dialog><footer><a href="../">Повернутися до повного плану</a><p>Навчальні приклади взяті зі словника Word Cottage. Зображення показують задум інтерфейсу й розвитку містечка.</p></footer></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), html);
const report={date:manifest.date, chapters:chapters.length, images:images.length, imagesPerChapter:3, bytes:images.reduce((sum,image)=>sum+image.bytes,0), individualPortraitImages:true};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
