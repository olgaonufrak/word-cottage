'use strict';
// Read-only extraction of the shipped dictionaries, preserving order and card IDs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const files = ['data.js', 'stage1-data.js', 'stage2-data.js', 'stage3-data.js', 'stage4-data.js', 'context-data.js'];
const context = vm.createContext({});
const sources = files.map(file => {
  const bytes = fs.readFileSync(path.join(root, 'dist', file));
  vm.runInContext(bytes.toString('utf8'), context, { filename: file });
  return { path: 'dist/' + file, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
const original = JSON.parse(vm.runInContext('JSON.stringify({categories,words,contextualLessons})', context));
const stageNames = ['Основа для початківця', 'Етап 1', 'Етап 2', 'Етап 3', 'Етап 4'];
const categories = original.categories.map((category, index) => {
  const stage = category.stage || 0;
  const words = original.words.filter(word => word.category === category.id).map((word, wordIndex) => {
    const lesson = original.contextualLessons[word.id];
    if (!lesson) throw new Error('Missing context: ' + word.id);
    return {
      ...word,
      order: wordIndex + 1,
      context: { ...lesson, sentence: lesson.pattern.replaceAll('{word}', lesson.target) },
    };
  });
  return {
    ...category,
    title: category.en || category.name,
    ukTitle: category.ukTitle || category.name.toLowerCase(),
    stage,
    stageName: stageNames[stage],
    order: index + 1,
    count: words.length,
    packs5: Math.ceil(words.length / 5),
    sourceFile: stage ? 'dist/stage' + stage + '-data.js' : 'dist/data.js',
    words,
  };
});
const ids = categories.flatMap(category => category.words.map(word => word.id));
if (new Set(ids).size !== ids.length) throw new Error('Duplicate card IDs');
const stages = stageNames.map((name, stage) => {
  const selected = categories.filter(category => category.stage === stage);
  return { stage, name, sections: selected.length, cards: selected.reduce((n, c) => n + c.count, 0), packs5: selected.reduce((n, c) => n + c.packs5, 0) };
});
const catalog = {
  schemaVersion: 1,
  snapshotDate: '2026-10-28',
  sources,
  totals: { sections: categories.length, cards: ids.length, packs5: categories.reduce((n, c) => n + c.packs5, 0), stages },
  personalWords: { categoryId: 'custom', storageKey: 'word-cottage-personal-words', includedInFixedTotals: false, reason: 'Особисті слова є лише у браузері користувачки; локальний словник їх не містить.' },
  categories,
};
fs.writeFileSync(path.join(__dirname, 'source-catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
const md = ['# Фактичний каталог Word Cottage', '', 'Зріз локальних словників: 28 жовтня 2026. Усі ID, англійський текст, українські переклади та контексти збережені з джерел.', '', '| Група | Розділи | Картки | Набори по 5 |', '|---|---:|---:|---:|', ...stages.map(s => `| ${s.name} | ${s.sections} | ${s.cards} | ${s.packs5} |`), `| Разом | ${categories.length} | ${ids.length} | ${catalog.totals.packs5} |`, '', 'Повтори тексту між розділами залишаються окремими картками з власними ID. Особисті браузерні слова не включені до фіксованого підсумку.', '', '| № | Група | ID | Англійська назва | Українська назва | Картки | Набори по 5 |', '|---:|---|---|---|---|---:|---:|', ...categories.map(c => `| ${c.order} | ${c.stageName} | ${c.id} | ${c.title} | ${c.ukTitle} | ${c.count} | ${c.packs5} |`), ''].join('\n');
fs.writeFileSync(path.join(__dirname, 'catalog-summary.md'), md);
console.log(JSON.stringify(catalog.totals));
