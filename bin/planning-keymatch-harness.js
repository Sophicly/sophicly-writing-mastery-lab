#!/usr/bin/env node
/* eslint-env node */
// v7.20.195 (Neil) — PLANNING KEY-MATCH HARNESS. The #1 recurring Sophicly bug is a write-key ≠
// read-key mismatch: a planning protocol emits @FIELD_COMMIT{"field":"X"} but the render builder
// makes no box "X", so the plan "saves fine but nothing shows up" in the outline (Q5 Methodology
// shipped exactly this — protocol wrote outline-iumvcc-method, the render split Method into
// point-1/2/3). This gate RENDERS the real outline builders (sliced + eval'd from wml-assessment.js,
// NOT reimplemented) and diffs their fieldIds against the protocol's outline @FIELD_COMMIT tags.
//
// Two hard failures:
//   (1) ORPHAN WRITE   — a protocol outline tag with no render box → autofill lands nowhere.
//   (2) SPURIOUS BOX   — a render outline box that no protocol tag fills AND is not on the
//                        ALLOWLIST → a box that renders blank (the old Organisation box was one).
//
// Scope: AQA Lang P2 (protocol-b-planning.md) — the only codified planning protocol today. As P1 /
// Shakespeare / the fan-out are ported, add their {protocol, render-calls} to CASES below.
//
// Run: node bin/planning-keymatch-harness.js   (wired into bin/pre-ship-check.sh)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(SRC, 'utf8');

// Slice a top-level declaration out of the source by brace/bracket balance from its start marker.
function slice(marker, opener = '{') {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  let j = src.indexOf(opener, i), depth = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
  }
  let end = k + 1;
  if (src[end] === ';') end++;
  return src.slice(i, end);
}

const parts = [
  slice('const OUTLINE_BODY_ONLY_OVERRIDES = {'),
  slice('const OUTLINE_BODY_FOCUS = {'),
  slice('const OUTLINE_CRITERIA = {'),
  slice('const OUTLINE_SPECS = {'),
  slice('function needsFullEssayStructure(', '('),
  slice('function getOutlineSpecKey(', '('),
  // v7.20.223: REAL body-count + body-only resolver (were stubs) — the P1 case needs the
  // genuine paragraph arithmetic, and a stub that drifts from the shipped code proves nothing.
  slice('function getParagraphCount(', '('),
  slice('function _resolveBodyOnlyOutline(', '('),
  slice('function buildIntroCriteria(', '('),
  slice('function buildConclusionCriteria(', '('),
  slice('function buildOutlineSection(', '('),
  slice('function buildInferenceOutlineSection(', '('),
  slice('function buildIUMVCCOutlineSection(', '('),
  slice('function _iumvccFieldId(', '('),
  slice('function _iuPoint(', '('),
];

const captured = [];
const explicit = {
  console,
  outlineRowHTML: (crit, fid) => { captured.push(fid); return ''; },
  sectionHTML: (t, l, a, b, inner) => inner || '',
  // subject/state are set PER CASE at the top of each render() — order-safe.
  _specSubjectKey: () => 'language_p2',
  state: { board: 'aqa', subject: 'language_p2' },
};
// Any name the sliced code references but we did not stub resolves to a universal no-op — EXCEPT
// real globals (String/Object/Array/Math…), which must win so the builders run correctly.
const NOOP = new Proxy(function () { return NOOP; }, {
  get: (t, k) => (k === Symbol.toPrimitive || k === 'toString' ? () => '__STUB__' : NOOP),
});
const sandbox = new Proxy(explicit, {
  has: () => true,
  get: (t, k) => (k in t ? t[k] : (k in globalThis ? globalThis[k] : NOOP)),
  set: (t, k, v) => { t[k] = v; return true; },
});
vm.runInContext(parts.join('\n'), vm.createContext(sandbox));

function renderIds(fn) { captured.length = 0; fn(); return captured.slice(); }

// ── CASES: one per codified planning protocol. render() returns EVERY outline fieldId the doc
// builds for that paper (call the real builders exactly as the question dispatch does). ──
const CASES = [{
  name: 'AQA Lang P2',
  protocol: path.join(ROOT, 'protocols', 'aqa', 'language2', 'planning', 'protocol-b-planning.md'),
  render: () => [
    ...(sandbox._specSubjectKey = () => 'language_p2', sandbox.state.subject = 'language_p2', []),
    ...renderIds(() => sandbox.buildInferenceOutlineSection('Q2', 2)),
    ...renderIds(() => sandbox.buildOutlineSection(['AO2'], 'Q3', 12, null, { bodyOnly: 3, stampAO: 'AO2' })),
    ...renderIds(() => sandbox.buildOutlineSection(['AO3'], 'Q4', 16, 'aqa_language_p2_comparison', { focus: 'comparative', stampAO: 'AO3' })),
    ...renderIds(() => sandbox.buildIUMVCCOutlineSection('Q5')),
  ],
  // Editable outline boxes that INTENTIONALLY receive no planning @FIELD_COMMIT (filled from another
  // source, not the planning chat). Keep this list minimal + justified — it is the "known blank" gate.
  allow: [
    // Q4 comparative renders a context row (AO3 gate) but AQA Lang P2 does NOT assess context —
    // it comes from the source, never the planning chat. (Tracked render-gate cleanup, QUEUE#1.)
    'outline-body-1-context', 'outline-body-2-context', 'outline-body-3-context',
  ],
}, {
  // v7.20.223 (Neil: "check the rest of the questions in AQA Language Paper 1"). The P1 case the
  // file's own TODO promised. Mirrors the REAL question dispatch (wml-assessment.js ~36583-36620):
  // Q2/Q3 route through the real _resolveBodyOnlyOutline (spec facts: analysis · 8m · AO2 ·
  // focus language/structure per protocols/shared/language-paper-specs.json); Q4 (evaluation,
  // 20m, AO4) takes the plain >=20 full-essay branch; Q5 is creative writing — the Scene
  // Structure plan IS its outline, no outline block renders (and its plan-scene rows are
  // single-emit @FIELD_COMMITs, excluded from fan-out by design).
  name: 'AQA Lang P1',
  protocol: path.join(ROOT, 'protocols', 'aqa', 'language1', 'planning', 'protocol-b-planning.md'),
  render: () => {
    sandbox._specSubjectKey = () => 'language_p1';
    sandbox.state.subject = 'language_p1';
    const q2 = sandbox._resolveBodyOnlyOutline('Q2', 'analysis', 8, ['AO2'], { focus: 'language' });
    const q3 = sandbox._resolveBodyOnlyOutline('Q3', 'analysis', 8, ['AO2'], { focus: 'structure' });
    if (!q2 || !q3) throw new Error('P1 Q2/Q3 no longer admitted by _resolveBodyOnlyOutline — dispatch changed, update this case');
    return [
      ...renderIds(() => sandbox.buildOutlineSection(['AO2'], 'Q2', 8, null, { bodyOnly: q2.bodies, stampAO: q2.ao, focus: q2.focus })),
      ...renderIds(() => sandbox.buildOutlineSection(['AO2'], 'Q3', 8, null, { bodyOnly: q3.bodies, stampAO: q3.ao, focus: q3.focus })),
      ...renderIds(() => sandbox.buildOutlineSection(['AO4'], 'Q4', 20)),
    ];
  },
  allow: [],
}];

let failed = 0;
for (const c of CASES) {
  const rendered = new Set(c.render());
  const proto = fs.readFileSync(c.protocol, 'utf8');
  const tags = new Set();
  let m; const re = /@FIELD_COMMIT\{"field":"(outline-[^"]+)"/g;
  while ((m = re.exec(proto))) tags.add(m[1]);

  const orphanWrites = [...tags].filter(t => !rendered.has(t)).sort();
  const spuriousBoxes = [...rendered].filter(r => !tags.has(r) && !c.allow.includes(r)).sort();
  const matched = [...tags].filter(t => rendered.has(t)).length;

  console.log(`— ${c.name}: ${matched}/${tags.size} protocol outline tags matched a render box `
    + `(${rendered.size} render boxes; ${c.allow.length} allow-listed blank).`);
  if (orphanWrites.length) {
    failed = 1;
    console.log(`  ❌ ORPHAN WRITES (protocol writes, no render box → autofill lands nowhere):`);
    orphanWrites.forEach(t => console.log('       ' + t));
  }
  if (spuriousBoxes.length) {
    failed = 1;
    console.log(`  ❌ SPURIOUS BOXES (render box, no protocol write, not allow-listed → renders blank):`);
    spuriousBoxes.forEach(t => console.log('       ' + t));
    console.log(`     Either wire a @FIELD_COMMIT for it, remove the box, or (if blank is intended) add it to \`allow\`.`);
  }
}

if (failed) {
  console.log('\n❌ planning-keymatch-harness FAILED — a plan will save but not appear (key mismatch).');
  process.exit(1);
}
console.log('✅ planning-keymatch-harness passed (every protocol outline tag matches a render box).');
