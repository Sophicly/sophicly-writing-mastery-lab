/* eslint-env node */
/* Node build-time harness — NOT shipped to the browser. Run: node bin/outline-harness.js */
// v7.20.107 harness — extracts the REAL functions from wml-assessment.js and runs them.
// Not a reimplementation: the source text is sliced out and eval'd with stubbed DOM helpers.
const fs = require('fs');
const vm = require('vm');

const SRC = require('path').join(__dirname, '..', 'frontend', 'wml-assessment.js');
const SPECS = require('path').join(__dirname, '..', 'protocols', 'shared', 'language-paper-specs.json');

const src = fs.readFileSync(SRC, 'utf8');
const specs = JSON.parse(fs.readFileSync(SPECS, 'utf8'));

// Slice a declaration out of the source by brace balance from its start marker.
function slice(marker, opener) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  let j = src.indexOf(opener, i), depth = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; }
  }
  // include trailing ; for const decls
  let end = k + 1;
  if (src[end] === ';') end++;
  return src.slice(i, end);
}

const parts = [
  slice('const OUTLINE_BODY_ONLY_OVERRIDES = {', '{'),
  slice('const OUTLINE_BODY_FOCUS = {', '{'),
  slice('const OUTLINE_CRITERIA = {', '{'),
  slice('function _resolveBodyOnlyOutline(', '{'),
  slice('function buildIntroCriteria(', '{'),
  slice('function buildConclusionCriteria(', '{'),
  slice('function buildOutlineSection(', '{'),
];

const sandbox = {
  console,
  // stubs — capture structure, not markup
  outlineRowHTML: (crit, fid) => JSON.stringify({ fid, label: crit.label, ao: crit.ao, prompt: crit.prompt, items: crit.items }) + '\n',
  sectionHTML: (type, label, _a, _b, inner) => `SECTION[${type}|${label}]\n${inner}`,
  getOutlineSpecKey: () => 'default',
  OUTLINE_SPECS: {},
  needsFullEssayStructure: (m) => m >= 20,
  getParagraphCount: (m) => Math.ceil(m / 5),
  _specSubjectKey: () => 'language_p1',
  state: { board: 'aqa', subject: 'language_p1' },
};
vm.createContext(sandbox);
vm.runInContext(parts.join('\n'), sandbox);

const p1 = specs.aqa.language_p1.sections.flatMap(s => s.questions);
const fail = [];
const seenFids = new Map();

console.log('=== AQA Lang P1 — resolver verdict per question (REAL spec data) ===');
for (const q of p1) {
  const shape = sandbox._resolveBodyOnlyOutline(q.id, q.type, q.marks, q.aos, q);
  console.log(`${q.id.padEnd(3)} ${String(q.marks).padStart(2)}m ${String(q.aos).padEnd(9)} ${String(q.type).padEnd(18)} -> ${shape ? `body-only ${shape.bodies}¶ ao=${shape.ao} focus=${shape.focus}` : 'null (no body-only outline)'}`);
}

console.log('\n=== Rendered rows: Q2 (language focus) ===');
const q2 = p1.find(q => q.id === 'Q2');
const s2 = sandbox._resolveBodyOnlyOutline(q2.id, q2.type, q2.marks, q2.aos, q2);
const out2 = sandbox.buildOutlineSection(q2.aos, 'Q2', q2.marks, null, { bodyOnly: s2.bodies, stampAO: s2.ao, focus: s2.focus });
console.log(out2);

console.log('=== Rendered rows: Q3 (structure focus) ===');
const q3 = p1.find(q => q.id === 'Q3');
const s3 = sandbox._resolveBodyOnlyOutline(q3.id, q3.type, q3.marks, q3.aos, q3);
const out3 = sandbox.buildOutlineSection(q3.aos, 'Q3', q3.marks, null, { bodyOnly: s3.bodies, stampAO: s3.ao, focus: s3.focus });
console.log(out3);

console.log('=== Rendered rows: Q4 (evaluation — MUST be byte-identical to v7.20.102) ===');
const q4 = p1.find(q => q.id === 'Q4');
const out4 = sandbox.buildOutlineSection(q4.aos, 'Q4', q4.marks, null, undefined);
console.log(out4.split('\n').filter(l => l.startsWith('{')).slice(0, 8).join('\n'));

// ── ASSERTIONS ──
const fids = (out) => out.split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));

// 1. no duplicate fieldIds across Q2+Q3+Q4 on the same doc
for (const [qid, out] of [['Q2', out2], ['Q3', out3], ['Q4', out4]]) {
  for (const r of fids(out)) {
    if (seenFids.has(r.fid)) fail.push(`DUPLICATE fieldId "${r.fid}" — ${seenFids.get(r.fid)} and ${qid}`);
    seenFids.set(r.fid, qid);
  }
}
// 2. every Q2/Q3 row stamped AO2
for (const [qid, out] of [['Q2', out2], ['Q3', out3]]) {
  for (const r of fids(out)) if (r.ao !== 'AO2') fail.push(`${qid} row ${r.fid} ao=${r.ao}, expected AO2`);
}
// 3. Q4 rows all AO4 (evaluation preserved)
for (const r of fids(out4)) if (r.ao !== 'AO4') fail.push(`Q4 row ${r.fid} ao=${r.ao}, expected AO4`);
// 4. no Context row on an AO2-only question
for (const [qid, out] of [['Q2', out2], ['Q3', out3]]) {
  if (fids(out).some(r => /-context/.test(r.fid))) fail.push(`${qid} has a Context row (AO3) — must not`);
}
// 5. 2 paragraphs x 6 rows = 12 rows each
for (const [qid, out] of [['Q2', out2], ['Q3', out3]]) {
  const n = fids(out).length;
  if (n !== 12) fail.push(`${qid} rendered ${n} rows, expected 12 (2¶ × 6)`);
}
// 6. Q3 carries structure wording; Q2 does not
const q3ev = fids(out3).find(r => /-evidence-q3$/.test(r.fid));
const q2ev = fids(out2).find(r => /-evidence-q2$/.test(r.fid));
if (!/Structural Feature/.test(q3ev?.label || '')) fail.push(`Q3 evidence label lacks structure wording: "${q3ev?.label}"`);
if (/Structural/.test(q2ev?.label || '')) fail.push(`Q2 evidence label leaked structure wording: "${q2ev?.label}"`);
// 7. Q4 body fieldIds remain LEGACY unsuffixed (no drift on baked docs)
if (!fids(out4).some(r => r.fid === 'outline-body-1-topic')) fail.push('Q4 body fieldIds drifted from legacy unsuffixed shape');
// 8. the heal predicate must classify Q2/Q3 rows as body-only, Q4 rows as NOT
const healRe = /^outline-body-\d+-[a-z0-9]+-(q\d+)$/i;
if (!healRe.test('outline-body-1-topic-q2')) fail.push('heal predicate misses Q2 row');
if (!healRe.test('outline-body-1-effects2-q3')) fail.push('heal predicate misses effects2 row');
if (healRe.test('outline-body-1-topic')) fail.push('heal predicate wrongly matches Q4 legacy row');
if (healRe.test('outline-intro-hook-q4')) fail.push('heal predicate wrongly matches Q4 intro row');

// 9. v7.20.108 — Q4 evaluation intro = THESIS only, no Hook; conclusion = Restated Thesis only.
const q4rows = fids(out4);
const q4intro = q4rows.filter(r => /^outline-intro-/.test(r.fid));
const q4conc = q4rows.filter(r => /^outline-conclusion-/.test(r.fid));
console.log('\n=== Q4 intro rows (v7.20.108: Thesis only, NO Hook) ===');
q4intro.forEach(r => console.log(`  ${r.fid}  [${r.ao}] ${r.label}`));
console.log('=== Q4 conclusion rows (Restated Thesis only) ===');
q4conc.forEach(r => console.log(`  ${r.fid}  [${r.ao}] ${r.label}`));
if (q4intro.some(r => /-hook/.test(r.fid))) fail.push('Q4 intro still has a Hook row — must be Thesis only (v7.20.108)');
if (!q4intro.some(r => /-thesis/.test(r.fid))) fail.push('Q4 intro has no Thesis row');
if (q4intro.length !== 1) fail.push(`Q4 intro has ${q4intro.length} rows, expected exactly 1 (Thesis)`);
if (q4conc.length !== 1 || !/-thesis/.test(q4conc[0]?.fid || '')) fail.push(`Q4 conclusion should be Restated Thesis only, got ${q4conc.length} rows`);
// 10. the heal's eval "extra" regex must now treat HOOK as extra and NOT thesis
const extraRe = /^outline-intro-(hook|building)/;
if (!extraRe.test('outline-intro-hook-q4')) fail.push('heal: hook not classified as extra (v7.20.108 inversion missing)');
if (extraRe.test('outline-intro-thesis-q4')) fail.push('heal: thesis wrongly classified as extra — would delete the kept element');

console.log('\n=== ASSERTIONS ===');
if (fail.length) { fail.forEach(f => console.log('❌ ' + f)); process.exit(1); }
console.log('✅ all 10 assertion groups passed');
