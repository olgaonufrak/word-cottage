'use strict';
// Export the existing six-step lesson specification. Never reads browser storage.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const input = ['data.js', 'stage1-data.js', 'stage2-data.js', 'stage3-data.js', 'stage4-data.js', 'context-data.js', 'lesson-data.js', 'exercises.js'];
const context = vm.createContext({});
const sources = input.map(file => {
  const bytes = fs.readFileSync(path.join(root, 'dist', file));
  vm.runInContext(bytes.toString('utf8'), context, { filename: file });
  return { path: 'dist/' + file, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
const searchBytes = fs.readFileSync(path.join(root, 'dist/search.js'));
const normalizeWordSource = searchBytes.toString('utf8').match(/^function normalizeWord\(text\)\{[^\r\n]+/m)?.[0];
if (!normalizeWordSource) throw new Error('Missing normalizeWord helper');
vm.runInContext(normalizeWordSource, context, { filename: 'search.js:normalizeWord-only' });
sources.push({ path: 'dist/search.js', sha256: crypto.createHash('sha256').update(searchBytes).digest('hex'), used: 'normalizeWord function only; search restoration is not executed' });
const words = JSON.parse(vm.runInContext('JSON.stringify(words)', context));
const rawContexts = JSON.parse(vm.runInContext('JSON.stringify(contextualLessons)', context));
const glosses = JSON.parse(vm.runInContext('JSON.stringify(sentenceGlosses)', context));
const wordLesson = vm.runInContext('wordLesson', context);
const normalizeAnswer = vm.runInContext('normalizeAnswer', context);
const normalizeWord = vm.runInContext('normalizeWord', context);
const sentenceTokens = vm.runInContext('sentenceTokens', context);
const normalizeSentence = vm.runInContext('normalizeSentence', context);
const world = JSON.parse(fs.readFileSync(path.join(__dirname, 'section-world-map.json'), 'utf8'));
const sectionById = new Map(world.sections.map(section => [section.categoryId, section]));
const pairCategories = new Set(['a1-opposites', 'a4-synonyms']);

function hash(value) {
  let state = 2166136261;
  for (const char of value) state = Math.imul(state ^ char.codePointAt(0), 16777619) >>> 0;
  return state;
}
function shuffle(values, seed) {
  const result = [...values];
  let state = hash(seed) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function components(word) { return word.en.split(/\s+—\s+/).map(normalizeAnswer); }
const byCategory = new Map();
for (const word of words) {
  if (!byCategory.has(word.category)) byCategory.set(word.category, []);
  byCategory.get(word.category).push(word);
}
const lessons = new Map(words.map(word => [word.id, JSON.parse(JSON.stringify(wordLesson(word)))]));
const scopes = [];
const scopeByCard = new Map();
for (const [categoryId, selected] of byCategory) {
  for (let start = 0; start < selected.length; start += 5) {
    const batch = selected.slice(start, start + 5);
    const examples = [...new Set(batch.flatMap(word => lessons.get(word.id).variants))];
    const knownVocabulary = [...new Set(examples.flatMap(sentenceTokens))];
    const scope = {
      id: categoryId + ':default-five:' + (Math.floor(start / 5) + 1),
      categoryId,
      partNumber: Math.floor(start / 5) + 1,
      wordIds: batch.map(word => word.id),
      knownVocabulary,
      knownNormalizedVocabulary: [...new Set(knownVocabulary.map(normalizeAnswer))],
      examples,
    };
    scopes.push(scope);
    for (const word of batch) scopeByCard.set(word.id, scope);
  }
}
function recognition(target, scope) {
  const options = [target];
  const seen = new Set([normalizeAnswer(target.en)]);
  const meanings = new Set([normalizeAnswer(target.uk.split(';')[0])]);
  const targetComponents = new Set(components(target));
  const pack = scope.wordIds.map(id => words.find(word => word.id === id));
  const sameCategory = byCategory.get(target.category);
  const candidates = [...shuffle(pack, target.id + ':queue'), ...shuffle(sameCategory, target.id + ':category'), ...shuffle(words, target.id + ':all')];
  for (const candidate of candidates) {
    const english = normalizeAnswer(candidate.en);
    const meaning = normalizeAnswer(candidate.uk.split(';')[0]);
    if (seen.has(english) || meanings.has(meaning)) continue;
    if (pairCategories.has(target.category)) {
      if (candidate.category !== target.category) continue;
      if (components(candidate).some(component => targetComponents.has(component))) continue;
    } else if (pairCategories.has(candidate.category)) continue;
    seen.add(english); meanings.add(meaning); options.push(candidate);
    if (options.length === 3) break;
  }
  if (options.length !== 3) throw new Error('Not enough distinct recognition options: ' + target.id);
  return shuffle(options, target.id + ':options').map(word => ({ id: word.id, en: word.en, uk: word.uk }));
}
function builder(sentence, seed) {
  const tokensExpected = [...sentenceTokens(sentence)];
  const instances = tokensExpected.map((text, index) => ({ id: seed + ':token:' + index, text, expectedIndex: index }));
  let bank = shuffle(instances, seed + ':bank');
  const hasDifferentWords = new Set(tokensExpected.map(normalizeAnswer)).size > 1;
  if (hasDifferentWords && normalizeSentence(bank.map(token => token.text).join(' ')) === normalizeSentence(sentence)) bank = [...instances.slice(1), instances[0]];
  return {
    expectedSentence: sentence,
    expectedNormalized: normalizeSentence(sentence),
    tokensExpected,
    tokensShuffled: bank.map(token => token.text),
    tokenInstancesShuffled: bank,
    expectedTokenOrder: instances.map(token => token.id),
    distractors: [],
    shuffleChangePossible: hasDifferentWords,
    allTokensRequired: true,
    punctuationPolicy: 'Displayed sentence keeps punctuation; validation uses the site sentenceTokens/normalizeSentence helpers.',
  };
}
const cards = words.map((word, order) => {
  const lesson = lessons.get(word.id);
  const raw = rawContexts[word.id];
  if (!raw) throw new Error('A shipped card must use an existing ID-keyed context: ' + word.id);
  const section = sectionById.get(word.category);
  const scope = scopeByCard.get(word.id);
  const isPair = pairCategories.has(word.category);
  const alternatives = recognition(word, scope);
  const gapCue = lesson.target.toLowerCase() === word.en.toLowerCase() ? word.uk : glosses[normalizeWord(lesson.target)] || word.uk;
  const extraGaps = (raw.extra || []).map((extra, index) => ({ pattern: extra.pattern, target: extra.target, translation: extra.uk, expectedSentence: lesson.extra[index].sentence }));
  const profile = {
    learningKind: section.learningKind,
    physicalVsAbstract: section.physicalVsAbstract,
    pairSpecial: section.pairSpecial,
    isPair,
    pairMembers: isPair ? word.en.split(/\s+—\s+/) : [],
    isPhrase: !isPair && sentenceTokens(word.en).length > 1,
    originalCapitalizationPreserved: true,
    capitalizationRequiredForValidation: false,
    scenePolicy: 'Use the section scene and exact context; abstract meanings, phrases and function words use context/dialogue rather than forced object matching.',
  };
  return {
    id: word.id,
    category: word.category,
    order: order + 1,
    en: word.en,
    uk: word.uk,
    projectId: section.projectId,
    profile,
    lesson: { sentence: lesson.sentence, target: lesson.target, before: lesson.before, after: lesson.after, translation: lesson.translation, extra: lesson.extra, forms: lesson.forms, variants: lesson.variants, foodForm: lesson.foodForm, preference: lesson.preference },
    steps: [
      { step: 1, type: 'introduction', prompt: 'Знайомство', en: word.en, uk: word.uk, example: { sentence: lesson.sentence, translation: lesson.translation, target: lesson.target }, extraExamples: lesson.extra, audio: { wordEn: word.en, exampleEn: lesson.sentence, slowRate: 0.35 }, completion: 'Перегляд і Далі; це ще не автоматична позначка вивчення.' },
      { step: 2, type: 'recognition', prompt: 'Обери англійською', promptUk: word.uk, options: alternatives, correctId: word.id, correctEn: word.en, selectionPolicy: 'Exactly one correct stable card ID; same normalized EN and same normalized first Ukrainian meaning are excluded. Pair distractors stay in the same relation category and share no English member.' },
      { step: 3, type: 'spelling', prompt: 'Напиши англійською', promptUk: word.uk, expectedEn: word.en, expectedNormalized: normalizeAnswer(word.en), validation: 'normalizeAnswer(answer) === normalizeAnswer(expectedEn)', pairPolicy: isPair ? 'Напиши повний початковий запис пари; ID не розділяється.' : null },
      { step: 4, type: 'context-gap', prompt: 'Встав пропущене', pattern: lesson.before + '{word}' + lesson.after, before: lesson.before, after: lesson.after, target: lesson.target, cueUk: gapCue, translation: lesson.translation, expectedSentence: lesson.sentence, validation: 'normalizeAnswer(answer) === normalizeAnswer(target)', extraGapExercises: extraGaps },
      { step: 5, type: 'sentence-builder', prompt: 'Склади речення', promptUk: lesson.translation, ...builder(lesson.sentence, word.id), extraBuilders: lesson.extra.map((extra, index) => ({ translation: extra.translation, ...builder(extra.sentence, word.id + ':extra:' + index) })) },
      { step: 6, type: 'own-sentence', prompt: 'Напиши речення', promptUk: 'Використай: ' + word.uk, target: lesson.target, forms: lesson.forms, reference: { sentence: lesson.sentence, translation: lesson.translation, extra: lesson.extra }, knownContextRef: scope.id, referenceVariants: lesson.variants, autocheckLimits: { ruleRef: 'rules.ownSentence', knownTokensScope: 'Automatically assigned current section pack: scope.wordIds -> wordLesson.variants; all assigned cards are mandatory', exactKnownContextOnly: true, grammarOrMeaningOfNovelSentencesIsNotAutomaticallyJudged: true, selfCheckMarksLearned: false, selfCheckedCardRemainsForReview: true } },
    ],
  };
});
const result = {
  schemaVersion: 1,
  snapshotDate: '2026-10-28',
  revisionDate: '2026-10-29',
  purpose: 'Повна публічна специфікація вправ для реалізації гри; правильні відповіді збережено навмисно. Це не файл початкового видимого стану плеєра.',
  sources,
  rules: {
    sourcePolicy: 'Existing shipped words, contextualLessons and exact wordLesson helpers only; no new authored or guessed English sentences.',
    order: 'Dictionary source order; every stable ID occurs exactly once.',
    campaignRoute: { kind: 'automatic-full-section', fixedSectionOrder: true, requiredAllSectionCards: true, packSize: 5, packSizeIsInternal: true, playerWordSelection: false, playerQuantitySelection: false, skipUnlearned: false, nextPackRequiresAllCurrentCards: true, failedCardsReturnAutomatically: true, sectionCompletion: 'N/N confirmed campaign card IDs', legacyLearnedPolicy: 'reference-only; no automatic campaign completion or construction credit', unknownWordSearch: false, personalWordAddition: false },
    normalization: { answerHelper: 'dist/exercises.js:normalizeAnswer', sentenceHelper: 'dist/exercises.js:sentenceTokens/normalizeSentence', apostropheAndCasePolicy: 'Existing helpers ignore case, normalize common apostrophes and whitespace; original stored spelling and sentence case are preserved.' },
    ownSentence: { algorithm: 'Exact current ownSentenceResult semantics', orderedChecks: ['Require non-empty input.', 'Every normalized input token must be in knownNormalizedVocabulary of the automatic current section pack.', 'At least one lesson.forms sequence must occur as contiguous normalized tokens.', 'Automatic success only if normalizeSentence(input) equals a normalized known example from the automatic section pack.', 'Otherwise a sentence made of known words requires self-check; this does not mark the word learned and the card returns automatically.'], defaultScope: 'Five consecutive existing cards automatically assigned within a section; exact mandatory wordIds and known examples are listed in scopes. Advance only after all current pack cards are confirmed; complete the project only at N/N.', noBrowserStorageAccess: true },
    pairPolicy: 'An antonym/synonym pair stays one original card ID. Both source members and all extra examples are preserved; relation categories are never mixed as recognition distractors.',
    initialPlayerState: 'Before answer: neutral equal option styling, shuffled choices/tokens, no selected correct answer or success mark. Correct IDs in this specification must not be exposed as visual hints.',
  },
  totals: { cards: cards.length, sections: byCategory.size, steps: cards.length * 6, defaultScopes: scopes.length, pairCards: cards.filter(card => card.profile.isPair).length, oneTokenBuilders: cards.filter(card => !card.steps[4].shuffleChangePossible).length },
  scopes,
  cards,
};
const out = path.join(__dirname, 'card-exercises.json');
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result.totals, bytes: fs.statSync(out).size }));
