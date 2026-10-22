#!/usr/bin/env node
'use strict';

// Developer-only import of finished image-generation output. This script does
// not paint, recolour, redraw or rearrange artwork. It preserves the source,
// encodes the square atlas and prepares a labelled contact sheet for review.
// The published site needs only the finished WebP files, with no build step.
//
// node tools/import-painted-collages.cjs --batch painted-01 --input SOURCE.png
//   [--catalog art/vocabulary-collages/catalog.json] [--size 2000] [--quality 90]
//   [--grid auto|uniform] [--edges FILE.json] [--inset 2]
//   [--reject key-with-wrong-generated-subject,another-key]
//   [--override key=/path/to/replacement.png] (may be repeated)
//   [--output dist/images/vocabulary-painted] [--work work/painted-art]
//   [--sharp /absolute/path/to/sharp]
// WORD_COTTAGE_SHARP_MODULE or NODE_PATH can also provide the developer runtime.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const XML = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[character]);

function argumentsFrom(argv) {
  const allowed = new Set(['batch', 'input', 'catalog', 'size', 'quality', 'output', 'work', 'sharp', 'grid', 'edges', 'inset', 'reject', 'override']);
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--help' || argv[index] === '-h') return { help: true };
    const name = argv[index].replace(/^--/, '');
    if (!argv[index].startsWith('--') || !allowed.has(name)) throw new Error('Unknown option: ' + argv[index]);
    if (result[name] !== undefined && name !== 'override') throw new Error('Repeated option: --' + name);
    const value = argv[++index];
    if (!value || value.startsWith('--')) throw new Error('Missing value for --' + name);
    if (name === 'override') (result.override ||= []).push(value);
    else result[name] = value;
  }
  return result;
}

function positiveInteger(value, fallback, name, minimum, maximum) {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(name + ' must be an integer between ' + minimum + ' and ' + maximum);
  }
  return number;
}

function validateCatalog(catalog) {
  if (catalog.version !== 1 || catalog.columns !== 5 || catalog.rows !== 5 || !Array.isArray(catalog.batches)) {
    throw new Error('Expected catalog version 1 with columns:5, rows:5 and batches:[...]');
  }
  const ids = new Set(), keys = new Set();
  for (const batch of catalog.batches) {
    if (!ID.test(batch.id) || ids.has(batch.id)) throw new Error('Invalid or duplicate batch id: ' + batch.id);
    ids.add(batch.id);
    if (!Array.isArray(batch.tiles) || !batch.tiles.length || batch.tiles.length > 25) {
      throw new Error(batch.id + ': expected between 1 and 25 tiles');
    }
    const indexes = new Set();
    for (const tile of batch.tiles) {
      if (!Number.isInteger(tile.index) || tile.index < 0 || tile.index >= 25 || indexes.has(tile.index)) {
        throw new Error(batch.id + ': invalid or duplicate tile index: ' + tile.index);
      }
      indexes.add(tile.index);
      if (!ID.test(tile.key) || keys.has(tile.key)) throw new Error('Invalid or duplicate picture key: ' + tile.key);
      keys.add(tile.key);
      if (tile.filename && tile.filename !== tile.key + '.svg') throw new Error('Picture filename does not match its key: ' + tile.key);
      if (typeof tile.label !== 'string' || !tile.label.trim()) throw new Error('Missing English review label: ' + tile.key);
      if (typeof tile.alt !== 'string' || !tile.alt.trim()) throw new Error('Missing Ukrainian alternative text: ' + tile.key);
    }
  }
  return catalog;
}

function loadSharp(modulePath) {
  try { return require(modulePath || process.env.WORD_COTTAGE_SHARP_MODULE || 'sharp'); }
  catch (error) {
    throw new Error('Sharp is required only for asset preparation. Supply --sharp /path/to/sharp, WORD_COTTAGE_SHARP_MODULE or NODE_PATH. ' + error.message);
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + '.' + process.pid + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
}

async function updateMapping(file, batch, atlas, tiles) {
  const lock = file + '.lock', deadline = Date.now() + 30000;
  let descriptor;
  while (descriptor === undefined) {
    try { descriptor = fs.openSync(lock, 'wx'); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (Date.now() >= deadline) throw new Error('Another importer holds ' + relative(lock) + '; finish it before retrying');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  try {
    const mapping = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { version: 1, columns: 5, rows: 5, atlases: {}, pictures: {} };
    if (mapping.version !== 1 || mapping.columns !== 5 || mapping.rows !== 5 || !mapping.atlases || !mapping.pictures) {
      throw new Error('Existing mapping.json has an unsupported format');
    }
    mapping.atlases[batch] = atlas;
    // Parallel imports may encode independent atlases together; the short lock
    // keeps their mapping updates from overwriting one another.
    for (const [key, picture] of Object.entries(mapping.pictures)) if (picture.atlas === batch) delete mapping.pictures[key];
    for (const tile of tiles) {
      mapping.pictures[tile.key] = { type: 'painted', atlas: batch, src: atlas.src, cell: tile.index, columns: 5, rows: 5, alt: tile.alt };
    }
    mapping.atlases = Object.fromEntries(Object.entries(mapping.atlases).sort(([a], [b]) => a.localeCompare(b)));
    mapping.pictures = Object.fromEntries(Object.entries(mapping.pictures).sort(([a], [b]) => a.localeCompare(b)));
    writeJson(file, mapping);
  } finally {
    fs.closeSync(descriptor);
    fs.unlinkSync(lock);
  }
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function labelLines(label, length = 31) {
  const words = label.split(/\s+/), lines = [];
  for (const word of words) {
    if (!lines.length || lines[lines.length - 1].length + word.length + 1 > length) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  return lines;
}

function validateEdges(edges, width) {
  for (const direction of ['x', 'y']) {
    const values = edges[direction];
    if (!Array.isArray(values) || values.length !== 6 || values[0] !== 0 || values[5] !== width ||
      values.some((value, index) => !Number.isInteger(value) || (index && (value - values[index - 1] < width / 10)))) {
      throw new Error('Expected six increasing ' + direction + ' boundaries from 0 to ' + width);
    }
  }
  return edges;
}

async function detectEdges(sharp, source, width) {
  const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const score = (value, axis) => {
    let cream = 0;
    for (let cross = 0; cross < width; cross++) {
      const pixel = (axis === 'y' ? value * width + cross : cross * width + value) * info.channels;
      const r = data[pixel], g = data[pixel + 1], b = data[pixel + 2];
      if (r >= 225 && g >= 208 && b >= 165 && r >= g && g >= b) cream++;
    }
    return cream / width;
  };
  const result = { x: [0], y: [0] };
  for (const axis of ['x', 'y']) for (let number = 1; number < 5; number++) {
    const expected = number * width / 5, radius = Math.floor(width / 20), candidates = [];
    for (let pixel = Math.round(expected) - radius; pixel <= Math.round(expected) + radius; pixel++) {
      const coverage = score(pixel, axis);
      if (coverage >= .985) candidates.push(pixel);
    }
    // Require a continuous, almost entirely cream gutter. Failing explicitly is
    // safer than silently cutting through a subject if generation missed a grid.
    const runs = [];
    for (const pixel of candidates) {
      const previous = runs[runs.length - 1];
      if (previous && previous[previous.length - 1] === pixel - 1) previous.push(pixel);
      else runs.push([pixel]);
    }
    runs.sort((a, b) => b.length - a.length || Math.abs((a[0] + a[a.length - 1]) / 2 - expected) - Math.abs((b[0] + b[b.length - 1]) / 2 - expected));
    if (!runs.length || runs[0].length < 2) throw new Error('Cannot confidently find gutter ' + axis + number + '; review the source and supply --edges FILE.json or explicit --grid uniform');
    const run = runs[0];
    result[axis].push(Math.round((run[0] + run[run.length - 1]) / 2));
  }
  result.x.push(width); result.y.push(width);
  return validateEdges(result, width);
}

async function uniformAtlas(sharp, source, edges, size, inset, quality, target, overrides) {
  const cell = size / 5, tiles = [];
  for (let index = 0; index < 25; index++) {
    const x = index % 5, y = Math.floor(index / 5);
    const left = edges.x[x] + inset, top = edges.y[y] + inset;
    const width = edges.x[x + 1] - left - inset, height = edges.y[y + 1] - top - inset;
    if (width <= 0 || height <= 0) throw new Error('Inset is too large for cell ' + index);
    const replacement = overrides.get(index);
    const image = replacement ? sharp(replacement.source) : sharp(source).extract({ left, top, width, height });
    tiles.push({
      input: await image.resize(cell, cell, { fit: 'contain', background: '#f5ecd6' }).png().toBuffer(),
      left: x * cell, top: y * cell
    });
  }
  // Some generated sheets have slightly uneven gutters. Cropping those actual
  // cells and fitting each into its own square prevents neighbouring subjects
  // from leaking into the site's exact 5×5 crop. Contain preserves proportions.
  await sharp({ create: { width: size, height: size, channels: 3, background: '#f5ecd6' } })
    .composite(tiles).webp({ quality, effort: 6 }).toFile(target);
}

async function contactSheet(sharp, input, sourceSize, batch, target) {
  const preview = 240, gutter = 16, heading = 72, caption = 96;
  const width = gutter + 5 * (preview + gutter);
  const height = heading + 5 * (preview + caption + gutter);
  const tiles = new Map(batch.tiles.map(tile => [tile.index, tile]));
  const composite = [];
  const text = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">',
    '<rect width="100%" height="100%" fill="#f7f2e8"/>',
    '<g font-family="Arial, sans-serif" fill="#343b29">',
    '<text x="16" y="30" font-size="23" font-weight="bold">' + XML(batch.id) + ' — exact row-major crop review</text>',
    '<text x="16" y="53" font-size="15">Labels are outside the artwork. Review each subject before publishing its mapping.</text>'
  ];
  for (let index = 0; index < 25; index++) {
    const column = index % 5, row = Math.floor(index / 5);
    const left = Math.round(column * sourceSize / 5), top = Math.round(row * sourceSize / 5);
    const right = Math.round((column + 1) * sourceSize / 5), bottom = Math.round((row + 1) * sourceSize / 5);
    const x = gutter + column * (preview + gutter), y = heading + row * (preview + caption + gutter);
    composite.push({
      input: await sharp(input).extract({ left, top, width: right - left, height: bottom - top }).resize(preview, preview).png().toBuffer(),
      left: x, top: y
    });
    const tile = tiles.get(index);
    const title = tile ? String(index).padStart(2, '0') + '  ' + tile.key + '.svg' : String(index).padStart(2, '0') + '  UNASSIGNED';
    text.push('<text x="' + x + '" y="' + (y + preview + 21) + '" font-size="13" font-weight="bold"' + (tile && tile.rejected ? ' fill="#a43f33"' : '') + '>' + XML(title) + '</text>');
    if (tile) {
      labelLines((tile.rejected ? 'REJECTED SUBJECT: ' : '') + tile.label).forEach((line, lineIndex) => {
        text.push('<text x="' + x + '" y="' + (y + preview + 43 + lineIndex * 18) + '" font-size="14">' + XML(line) + '</text>');
      });
    }
  }
  text.push('</g></svg>');
  // The paper and text are review annotations, never part of the published art.
  await sharp(Buffer.from(text.join(''))).composite(composite).png().toFile(target);
}

async function main(argv = process.argv.slice(2)) {
  const options = argumentsFrom(argv);
  if (options.help) {
    console.log('Import a finished 5×5 square collage without repainting it.\n' +
      'node tools/import-painted-collages.cjs --batch painted-01 --input SOURCE.png\n' +
      'Optional: --catalog FILE.json --size 2000 --quality 90 --grid auto|uniform --edges FILE.json --inset 2 --reject KEY,KEY --override KEY=SOURCE.png --output DIR --work DIR --sharp MODULE');
    return;
  }
  if (!options.batch || !options.input) throw new Error('Both --batch and --input are required; use --help for usage');
  const size = positiveInteger(options.size, 2000, 'Atlas size', 500, 6000);
  const quality = positiveInteger(options.quality, 90, 'WebP quality', 1, 100);
  const inset = positiveInteger(options.inset, 2, 'Cell inset', 0, 40);
  if (options.grid && !['auto', 'uniform'].includes(options.grid)) throw new Error('--grid must be auto or uniform');
  if (size % 5) throw new Error('Atlas size must be divisible by 5 so all cells have exactly the same dimensions');
  const work = path.resolve(ROOT, options.work || 'work/painted-art');
  const catalogFile = path.resolve(ROOT, options.catalog || 'art/vocabulary-collages/catalog.json');
  const catalog = validateCatalog(JSON.parse(fs.readFileSync(catalogFile, 'utf8')));
  const batch = catalog.batches.find(item => item.id === options.batch);
  if (!batch) throw new Error('Batch does not exist in the catalog: ' + options.batch);
  const rejected = new Set(options.reject ? options.reject.split(',') : []);
  for (const key of rejected) if (!batch.tiles.some(tile => tile.key === key)) throw new Error('Rejected key is not in the selected batch: ' + key);
  const overrideFiles = new Map();
  for (const option of options.override || []) {
    const separator = option.indexOf('='), key = option.slice(0, separator), file = option.slice(separator + 1);
    if (separator < 1 || !file || !batch.tiles.some(tile => tile.key === key)) throw new Error('Expected --override KEY=SOURCE with a key in the selected batch: ' + option);
    if (overrideFiles.has(key)) throw new Error('Duplicate replacement for ' + key);
    if (rejected.has(key)) throw new Error('A picture cannot be both rejected and replaced: ' + key);
    overrideFiles.set(key, path.resolve(file));
  }
  const input = path.resolve(options.input), source = fs.readFileSync(input);
  const sha256 = crypto.createHash('sha256').update(source).digest('hex');
  const sharp = loadSharp(options.sharp), metadata = await sharp(source).metadata();
  if (!metadata.width || metadata.width !== metadata.height || metadata.width < 500) {
    throw new Error('A square source at least 500×500 is required; received ' + metadata.width + '×' + metadata.height);
  }
  if (metadata.pages && metadata.pages > 1) throw new Error('Animated or multipage sources cannot be used as a single atlas');
  if (!['png', 'jpeg', 'webp', 'tiff', 'avif'].includes(metadata.format)) throw new Error('Unsupported source image format: ' + metadata.format);
  const edges = options.edges ? validateEdges(JSON.parse(fs.readFileSync(path.resolve(options.edges), 'utf8')), metadata.width) :
    options.grid === 'uniform' ? { x: Array.from({ length: 6 }, (_, index) => Math.round(index * metadata.width / 5)), y: Array.from({ length: 6 }, (_, index) => Math.round(index * metadata.width / 5)) } :
      await detectEdges(sharp, source, metadata.width);
  const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
  const originals = path.join(work, 'originals'), reviews = path.join(work, 'reviews');
  const output = path.resolve(ROOT, options.output || 'dist/images/vocabulary-painted');
  for (const directory of [originals, reviews, output]) fs.mkdirSync(directory, { recursive: true });
  const original = path.join(originals, batch.id + '-' + sha256.slice(0, 16) + '.' + extension);
  if (!fs.existsSync(original)) fs.writeFileSync(original, source, { flag: 'wx' });
  else if (!fs.readFileSync(original).equals(source)) throw new Error('An existing preserved original has unexpected contents: ' + relative(original));
  const overrides = new Map(), overrideMetadata = {};
  for (const [key, file] of overrideFiles) {
    const replacementSource = fs.readFileSync(file), replacementInfo = await sharp(replacementSource).metadata();
    if (!replacementInfo.width || replacementInfo.width !== replacementInfo.height || replacementInfo.width < 500 ||
      (replacementInfo.pages && replacementInfo.pages > 1) || !['png', 'jpeg', 'webp', 'tiff', 'avif'].includes(replacementInfo.format)) {
      throw new Error('Replacement for ' + key + ' must be a single square image at least 500×500');
    }
    const replacementHash = crypto.createHash('sha256').update(replacementSource).digest('hex');
    const replacementExtension = replacementInfo.format === 'jpeg' ? 'jpg' : replacementInfo.format;
    const preserved = path.join(originals, batch.id + '-' + key + '-' + replacementHash.slice(0, 16) + '.' + replacementExtension);
    if (!fs.existsSync(preserved)) fs.writeFileSync(preserved, replacementSource, { flag: 'wx' });
    else if (!fs.readFileSync(preserved).equals(replacementSource)) throw new Error('An existing preserved replacement has unexpected contents: ' + relative(preserved));
    overrides.set(batch.tiles.find(tile => tile.key === key).index, { source: replacementSource });
    overrideMetadata[key] = { original: relative(preserved), sourceSha256: replacementHash, width: replacementInfo.width, height: replacementInfo.height };
  }
  const atlas = path.join(output, batch.id + '.webp');
  const temporaryAtlas = atlas + '.' + process.pid + '.tmp';
  await uniformAtlas(sharp, source, edges, size, inset, quality, temporaryAtlas, overrides);
  fs.renameSync(temporaryAtlas, atlas);
  const review = path.join(reviews, batch.id + '-contact.png');
  await contactSheet(sharp, fs.readFileSync(atlas), size, { ...batch, tiles: batch.tiles.map(tile => ({ ...tile, rejected: rejected.has(tile.key) })) }, review);
  const mappingFile = path.join(work, 'mapping.json');
  const src = relative(atlas).replace(/^dist\//, '');
  await updateMapping(mappingFile, batch.id, { src, width: size, height: size, sourceSha256: sha256, original: relative(original), review: relative(review), sourceEdges: edges, sourceInset: inset, overrides: overrideMetadata }, batch.tiles.filter(tile => !rejected.has(tile.key)));
  console.log(JSON.stringify({ batch: batch.id, tiles: batch.tiles.length, mappedTiles: batch.tiles.length - rejected.size, rejected: [...rejected], overrides: overrideMetadata, atlas: relative(atlas), bytes: fs.statSync(atlas).size, original: relative(original), review: relative(review), mapping: relative(mappingFile), sourceSize: metadata.width, outputSize: size, sourceEdges: edges, sourceInset: inset }, null, 2));
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { argumentsFrom, validateCatalog, validateEdges, detectEdges, labelLines, contactSheet, main };
