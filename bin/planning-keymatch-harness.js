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
  // IUMVCC criteria content — OUTLINE_CRITERIA calls these while it is built, so they come first.
  slice('const _IU_ACTION_VERBS = [', '['), slice('const _IU_SENSORY_VERBS = [', '['), slice('const _IU_TONES_GENERAL = [', '['),
  slice('function _iuVerbCtl(', '('), slice('function _iuToneCtl(', '('), slice('function _iuEffectCtl(', '('),
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
  slice('function buildCreativeScenePlan(', '('),
  // v7.20.699: the body-row composer the builder now calls (it decides which rows exist at all).
  slice('function _purposeWithoutAO3(', '('),
  slice('function _outlineBodyCriterion(', '('),
  // the verified-papers registry _resolveBodyOnlyOutline consults (was a truthy no-op here before v7.20.699)
  slice('const OUTLINE_VERIFIED_PAPERS = {'), slice('function _outlinePaperKey(', '('), slice('function _outlinePaperVerified(', '('),
];

const captured = [];
const explicit = {
  console,
  // v7.20.236: the lit body-count constant is declared outside the sliced region — read its
  // REAL value from the source so a code-side change flows through (never a hardcoded twin).
  LIT_ESSAY_BODY_COUNT: parseInt((src.match(/var LIT_ESSAY_BODY_COUNT = (\d+)/) || [, '3'])[1], 10),
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
// ⛔ v7.20.699: a name the sliced builders reach for that wml-assessment.js DEFINES but this file did not slice must
// FAIL, not fall through to the no-op — a no-op composer rendered every row, Context included, and the TEMPLATE
// ORACLE below was the only thing that noticed. Names defined nowhere in the file (DOM helpers) still no-op.
const DECL = /^\s*(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)/gm;
const namesIn = text => new Set([...text.matchAll(DECL)].map(m => m[1] || m[2]));
const declared = namesIn(src), slicedNames = namesIn(parts.join('\n'));
const sandbox = new Proxy(explicit, {
  has: () => true,
  get: (t, k) => {
    if (k in t) return t[k];
    if (k in globalThis) return globalThis[k];
    if (typeof k === 'string' && declared.has(k) && !slicedNames.has(k)) {
      throw new Error('planning-keymatch-harness: a sliced builder reaches for ' + k + ', which wml-assessment.js defines but this harness did not slice — add it to `parts`.');
    }
    return NOOP;
  },
  set: (t, k, v) => { t[k] = v; return true; },
});
vm.runInContext(parts.join('\n'), vm.createContext(sandbox));

function renderIds(fn) { captured.length = 0; fn(); return captured.slice(); }

// v7.20.697 (#722 B2 step 0.3) — cases rendered by the page's OWN doc builder (buildMultiQuestionTemplate and
// the real outline dispatch, on every topic of the real template; bin/lib/template-render-sandbox.js). The hand
// cases below re-type each paper's dispatch, which is why a paper nobody re-typed (Edexcel IGCSE) went unchecked.
// New cases use this; the AQA hand cases stay as the oracle it is cross-checked against (TEMPLATE ORACLE below).
const { makeTemplateRenderer, readTopics, languageTemplate } = require('./lib/template-render-sandbox.js');
const TPL = makeTemplateRenderer(ROOT);
function renderPaperOutlineIds(board, subject) {
  const ids = new Set();
  for (const t of readTopics(ROOT, languageTemplate(ROOT, board, subject)).filter(x => x.questions.length)) {
    for (const q of TPL.render({ board, subject }, 'redraft', t)) q.outline.forEach(id => ids.add(id));
  }
  return [...ids];
}
const mdIn = dir => fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.md')).sort().map(f => path.join(ROOT, dir, f));

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
}, {
  // v7.20.228 (lit two-grade port). The protocol is the whole planning DIR (b1..b10 stage
  // files — filing markers live in b5/b7/b8). Render mirrors the REAL single-part redraft
  // dispatch (wml-assessment.js ~38089-38102): buildOutlineSection(topicData.aos, null, marks)
  // with the R&J lesson's real values — aos 'AO1,AO2,AO3,AO4' (AQA Shakespeare, AO4 = SPaG),
  // marks 34 → 3 bodies + standard intro/conclusion. REAL lesson state verified 2026-07-20:
  // board=aqa text=romeo_and_juliet subject=shakespeare (staging post 42392).
  name: 'AQA Literature (Shakespeare/R&J)',
  protocols: fs.readdirSync(path.join(ROOT, 'protocols', 'aqa', 'literature', 'planning'))
    .filter(f => f.endsWith('.md')).sort()
    .map(f => path.join(ROOT, 'protocols', 'aqa', 'literature', 'planning', f)),
  render: () => {
    sandbox._specSubjectKey = () => 'shakespeare';
    sandbox.state.subject = 'shakespeare';
    return renderIds(() => sandbox.buildOutlineSection('AO1,AO2,AO3,AO4', null, 34));
  },
  allow: [],
}, {
  // v7.20.697 (#722 B2 step 0.3). Edexcel IGCSE Spec A Lang P2 — the ladder lives in steps/ (the manifest's planning
  // dir). Rendered by the page builder over every topic of edexcel-igcse-language-p2.md: Q1 = the 30-mark essay
  // (plain full-essay outline), Q2 = imaginative writing (its scene plan IS the outline; checked under SCENE ROWS).
  name: 'Edexcel IGCSE Lang P2 (page builder, every topic)',
  protocols: mdIn('protocols/edexcel-igcse/language2/steps'),
  render: () => renderPaperOutlineIds('edexcel-igcse', 'language_p2'),
  allow: [],
}];

let failed = 0;
for (const c of CASES) {
  const rendered = new Set(c.render());
  const proto = (c.protocols || [c.protocol]).map(p => fs.readFileSync(p, 'utf8')).join('\n\n');
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

// ── TEMPLATE ORACLE (v7.20.697) ─────────────────────────────────────────────────────────────────
// The page-builder renderer must reproduce the AQA hand cases EXACTLY. If it does not, either a hand case has
// drifted from the real dispatch, or the renderer is wrong — and every case built on it is unproven.
for (const [name, board, subject] of [['AQA Lang P1', 'aqa', 'language_p1'], ['AQA Lang P2', 'aqa', 'language_p2']]) {
  const hand = new Set(CASES.find(c => c.name === name).render());
  const tpl = new Set(renderPaperOutlineIds(board, subject));
  const onlyHand = [...hand].filter(x => !tpl.has(x)), onlyTpl = [...tpl].filter(x => !hand.has(x));
  if (onlyHand.length || onlyTpl.length) {
    failed = 1;
    console.log(`  ❌ TEMPLATE ORACLE ${name}: page builder and hand case disagree — hand only [${onlyHand.join(', ')}] · page only [${onlyTpl.join(', ')}]`);
  } else {
    console.log(`— TEMPLATE ORACLE ${name}: page builder reproduces the hand case (${tpl.size} outline ids, every topic).`);
  }
}

// ── COVERAGE RATCHET (v7.20.616) ───────────────────────────────────────────────────────────────
// This harness can only check a protocol that has a hand-written CASE (the render() call must
// mirror that paper's real question dispatch — it cannot be derived). So the silent failure here
// is not a wrong key, it is a protocol NOBODY CHECKS: it emits outline @FIELD_COMMITs, no case
// names it, and the suite prints ✅ having never looked at it. That is exactly how Edexcel IGCSE
// Lang P2 went a month unverified in the sibling fan-out harness.
//
// The ratchet makes existing debt VISIBLE and makes it unable to GROW: every manifest-loaded
// planning dir that emits outline commits must either have a case above or be listed here with a
// reason. A new uncovered protocol fails the build. ⛔ Adding a line here is a deliberate act —
// never do it to silence a port you are actively building (that is the whole point of the gate).
const KNOWN_UNCOVERED = {
  'protocols/aqa/poetry/planning':
    'poetry renders through the poem-specific builder, not buildOutlineSection — needs its own case (QUEUE).',
  'protocols/aqa/unseen/planning':
    'unseen poetry: two-poem comparison dispatch, own builder — needs its own case (QUEUE).',
  'protocols/eduqas/literature/planning':
    'eduqas lit mirrors the AQA lit registry (ladder-check byte-traces it); a render case still owed (QUEUE).',
};

{
  const { resolvePlanningDirs, readProtocolDir } = require('./lib/protocol-planning-dirs.js');
  const covered = new Set();
  for (const c of CASES) {
    for (const p of (c.protocols || [c.protocol])) covered.add(path.relative(ROOT, path.dirname(p)));
  }
  const uncovered = [];
  for (const d of resolvePlanningDirs(ROOT).dirs) {
    if (covered.has(d.rel)) continue;
    const n = [...readProtocolDir(d.dir).matchAll(/@FIELD_COMMIT\{"field":"(outline-[^"]+)"/g)].length;
    if (n) uncovered.push({ rel: d.rel, n });
  }
  const unexplained = uncovered.filter(u => !KNOWN_UNCOVERED[u.rel]);
  console.log(`— COVERAGE: ${covered.size} protocol(s) have a render case; `
    + `${uncovered.length} emit outline commits with no case (${unexplained.length} unexplained).`);
  for (const u of uncovered) {
    console.log(`     ${KNOWN_UNCOVERED[u.rel] ? '·' : '❌'} ${u.rel} (${u.n} outline commits)`
      + (KNOWN_UNCOVERED[u.rel] ? ` — known debt: ${KNOWN_UNCOVERED[u.rel]}` : ''));
  }
  if (unexplained.length) {
    failed = 1;
    console.log('  ❌ UNCOVERED PROTOCOL(S): these emit outline @FIELD_COMMITs that NO case checks — a key');
    console.log('     mismatch in them would ship silently. Add a CASE mirroring that paper\'s real question');
    console.log('     dispatch (preferred), or a justified line in KNOWN_UNCOVERED.');
  }
  const stale = Object.keys(KNOWN_UNCOVERED).filter(k => !uncovered.some(u => u.rel === k));
  if (stale.length) {
    failed = 1;
    console.log('  ❌ STALE KNOWN_UNCOVERED entr(ies) — now covered or gone, delete them: ' + stale.join(', '));
  }
}

// ── SCENE ROWS (v7.20.642, audit 2026-09-27 D8). Section B creative plans are single-emit
// @FIELD_COMMITs into plan-scene-{qId}-* rows. They are excluded from the outline cases above, so
// until now NOTHING compared them to the builder — IGCSE Lang P2 Section B filed nothing at all.
// Whole-repo: every planning dir that emits a scene marker is checked against the REAL
// buildCreativeScenePlan(qId) render, both ways (orphan write + unfilled row).
{
  const { resolvePlanningDirs, readProtocolDir } = require('./lib/protocol-planning-dirs.js');
  let checked = 0;
  for (const d of resolvePlanningDirs(ROOT).dirs) {
    const text = readProtocolDir(d.dir);
    const byQ = {};
    for (const m of text.matchAll(/@FIELD_COMMIT\{"field":"(plan-scene-(Q\d)-[a-z]+)"\}/g)) {
      (byQ[m[2]] = byQ[m[2]] || new Set()).add(m[1]);
    }
    for (const [q, tags] of Object.entries(byQ)) {
      checked++;
      const boxes = new Set(renderIds(() => sandbox.buildCreativeScenePlan(q)));
      const orphans = [...tags].filter(t => !boxes.has(t));
      const blank = [...boxes].filter(b => !tags.has(b));
      if (orphans.length || blank.length) {
        failed = 1;
        console.log(`  ❌ SCENE ROWS ${d.rel} ${q}: orphan writes [${orphans.join(', ')}] · unfilled rows [${blank.join(', ')}]`);
      }
    }
  }
  console.log(`— SCENE ROWS: ${checked} protocol question(s) checked against buildCreativeScenePlan.`);
}

if (failed) {
  console.log('\n❌ planning-keymatch-harness FAILED — a plan will save but not appear (key mismatch).');
  process.exit(1);
}
console.log('✅ planning-keymatch-harness passed (every protocol outline tag matches a render box).');
