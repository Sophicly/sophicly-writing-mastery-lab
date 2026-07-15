/* eslint-env node */
/**
 * v7.20.115 — THE ONE SECTION MODEL harness.
 * Extracts the REAL _buildSectionModel from frontend/wml-assessment.js (never a
 * copy — a copy drifts) and asserts it against REAL document shapes.
 *
 * This model feeds the TOC page, the outline panel and the dynamic island. It is
 * the primary canvas navigation and Neil cannot cheaply retest it, so the model is
 * proven here before any renderer depends on it.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const a = src.indexOf('    function _buildSectionModel(');
const b = src.indexOf('    // v7.19.920 (Neil): collapsed-sidebar circle glyph');
if (a < 0 || b < 0 || b <= a) {
  console.error('EXTRACT FAILED — anchors moved. Fix the harness, never fake the test.');
  process.exit(1);
}
// eslint-disable-next-line no-eval
const build = eval('(' + src.slice(a, b).replace(/^\s*function _buildSectionModel/, 'function') + ')');

let pass = 0, fail = 0;
const ok = (n, c, d) => {
  if (c) { pass++; console.log('  PASS  ' + n); }
  else { fail++; console.log('  FAIL  ' + n + (d !== undefined ? '\n          got: ' + JSON.stringify(d) : '')); }
};
let P = 0;
const S = (type, label) => ({ type, label, pos: (P += 10), occurrence: 0 });
const shape = (es) => es.map(e => e.kind[0].toUpperCase() + ':' + e.displayLabel
  + (e.children.length ? '(' + e.children.map(c => c.kind[0] + ':' + c.displayLabel
      + (c.children.length ? '[' + c.children.map(g => g.displayLabel).join(',') + ']' : '')).join(' ') + ')' : ''));

// ── 1. REAL AQA Lang P1 diagnostic: SECTION A divider, then Q1..Q4 super-groups,
//       SECTION B divider, then Q5. This is the §4.1 regression case.
console.log('\n=== 1. AQA Lang P1 — SECTION A/B dividers + question super-groups ===');
P = 0;
let m = build([
  S('cover', 'Cover'),
  S('divider', 'SECTION A: READING'),
  S('question', 'Q1'),
  S('divider', 'PLAN — Q1'), S('plan', 'Plan: Q1'),
  S('divider', 'RESPONSE — Q1'), S('response', 'Response: Q1'),
  S('question', 'Q2'),
  S('divider', 'PLAN — Q2'), S('plan', 'Plan: Q2'),
  S('divider', 'OUTLINE — Q2'), S('outline', 'Outline: Q2'),
  S('divider', 'RESPONSE — Q2'), S('response', 'Response: Q2'),
  S('divider', 'SECTION B: WRITING'),
  S('question', 'Q5'),
  S('divider', 'PLAN — Q5'), S('plan', 'Plan: Q5'),
]);
const top = m.entries;
ok('cover excluded', !top.some(e => e.label === 'Cover'));
ok('SECTION A: READING is present (the .110 panel regression)', top.some(e => e.label === 'SECTION A: READING'), shape(top));
ok('SECTION B: WRITING is present', top.some(e => e.label === 'SECTION B: WRITING'), shape(top));
ok('SECTION A marked STRUCTURAL (questions became siblings)', top.find(e => e.label === 'SECTION A: READING').structural === true);
ok('SECTION B marked STRUCTURAL', top.find(e => e.label === 'SECTION B: WRITING').structural === true);
ok('Q2 is a question super-group', top.find(e => e.label === 'Q2').kind === 'question');
ok('Q2 displays as "Question 2"', top.find(e => e.label === 'Q2').displayLabel === 'Question 2');
ok('Q2 owns its 3 dividers', top.find(e => e.label === 'Q2').children.length === 3, shape(top));
ok('Q2 child dividers title-cased ("PLAN — Q2" → "Plan")',
  top.find(e => e.label === 'Q2').children.map(c => c.displayLabel).join(',') === 'Plan,Outline,Response',
  top.find(e => e.label === 'Q2').children.map(c => c.displayLabel));
ok('child divider keeps its RAW label for lookup',
  top.find(e => e.label === 'Q2').children[0].label === 'PLAN — Q2');
ok('leaf nests under its divider', top.find(e => e.label === 'Q2').children[0].children[0].label === 'Plan: Q2');
ok('Q5 nests under nothing (sibling of SECTION B)', top.find(e => e.label === 'Q5').kind === 'question');

// ── 2. A divider with genuinely nothing after it must be EMPTY, not structural.
console.log('\n=== 2. Genuinely-empty divider stays non-structural (the skip must survive) ===');
P = 0;
m = build([S('divider', 'PLAN — Q1'), S('plan', 'Plan: Q1'), S('divider', 'TRAILING EMPTY')]);
const trail = m.entries.find(e => e.label === 'TRAILING EMPTY');
ok('trailing empty divider is NOT structural', trail.structural === false);
ok('trailing empty divider has no children', trail.children.length === 0);

// ── 3. Literature single essay — no question sections → stays flat (already correct)
console.log('\n=== 3. Literature single essay — flat, no question grouping ===');
P = 0;
m = build([
  S('divider', 'PLAN'), S('plan', 'Plan: Introduction'), S('plan', 'Plan: Body Paragraph 1'),
  S('divider', 'RESPONSE'), S('response', 'Response'),
]);
ok('two top-level dividers, no question groups', m.entries.length === 2 && !m.entries.some(e => e.kind === 'question'), shape(m.entries));
ok('lit divider label NOT title-cased (no question parent)', m.entries[0].displayLabel === 'PLAN');
ok('PLAN owns 2 leaves', m.entries[0].children.length === 2);

// ── 4. section-header super-group (AQA Modern Text crib) still nests dividers
console.log('\n=== 4. section-header super-group (crib) ===');
P = 0;
m = build([
  S('section-header', 'Top 10 Character'),
  S('divider', 'C1 — The Inspector'), S('note', 'Note A'),
  S('divider', 'C2 — Sheila'), S('note', 'Note B'),
]);
ok('one super-group at top', m.entries.length === 1 && m.entries[0].kind === 'group', shape(m.entries));
ok('super-group owns both dividers', m.entries[0].children.length === 2);
ok('divider under section-header keeps RAW label (not a question)', m.entries[0].children[0].displayLabel === 'C1 — The Inspector');

// ── 5. A "— Qn" divider whose question is NOT open must not steal into qSuper
console.log('\n=== 5. mismatched "— Qn" divider does not attach to the wrong question ===');
P = 0;
m = build([S('question', 'Q2'), S('divider', 'PLAN — Q3'), S('plan', 'Plan: Q3')]);
ok('Q2 does NOT own the Q3 divider', m.entries.find(e => e.label === 'Q2').children.length === 0, shape(m.entries));
ok('PLAN — Q3 sits top-level', m.entries.some(e => e.label === 'PLAN — Q3'));

// ── 6. Hidden sections are filtered (panel + island never had this — links to
//       zero-geometry elements silently do nothing; the v7.19.420 TOC fix)
console.log('\n=== 6. isVisible filter (latent panel/island bug) ===');
P = 0;
const secs = [S('divider', 'PLAN'), S('plan', 'Plan: X'), S('divider', 'RESPONSE'), S('response', 'Response: Y')];
m = build(secs, { isVisible: (s) => !/RESPONSE|Response/.test(s.label) });
ok('hidden divider + leaf excluded', m.entries.length === 1 && m.entries[0].label === 'PLAN', shape(m.entries));

// ── 7. Completion rolls up; resolved by POS not label (labels repeat)
console.log('\n=== 7. completion rolls up, resolved by pos ===');
P = 0;
const s7 = [S('question', 'Q2'), S('divider', 'PLAN — Q2'), S('plan', 'Plan: Q2'), S('plan', 'Plan: Q2')];
const donePos = new Set([s7[2].pos]);           // first leaf done, second not — SAME label
m = build(s7, { isComplete: (e) => donePos.has(e.pos) });
let q2 = m.entries[0], plan = q2.children[0];
ok('two same-label leaves resolved independently BY POS',
  plan.children[0].complete === true && plan.children[1].complete === false,
  plan.children.map(c => c.complete));
ok('divider NOT complete while a child is outstanding', plan.complete === false);
ok('question NOT complete while a child is outstanding', q2.complete === false);

P = 0;
const s7b = [S('question', 'Q2'), S('divider', 'PLAN — Q2'), S('plan', 'Plan: Q2')];
m = build(s7b, { isComplete: () => true });
ok('all children done → divider + question complete',
  m.entries[0].complete === true && m.entries[0].children[0].complete === true);

P = 0;
m = build([S('question', 'Q2'), S('divider', 'PLAN — Q2'), S('plan', 'Plan: Q2')], { isComplete: () => null });
ok('nothing completable → complete stays null (no false tick)', m.entries[0].complete === null);

// ── 8. No isComplete supplied → complete stays null everywhere
console.log('\n=== 8. no isComplete → null, never false ===');
P = 0;
m = build([S('divider', 'PLAN'), S('plan', 'Plan: X')]);
ok('complete null without a resolver', m.entries[0].complete === null && m.entries[0].children[0].complete === null);

// ── 9. Prefix fallback (divider-less legacy doc).
//      These assertions mirror the IN-DOC TOC's real behaviour (wml-assessment.js
//      ~39785), which is the gold standard. An earlier revision of this harness
//      asserted invented behaviour and so green-lit three real defects — assert what
//      the shipping surface actually does, never what the new code happens to do.
console.log('\n=== 9. prefix fallback for divider-less docs (mirrors the real TOC) ===');
P = 0;
m = build([S('plan', 'Plan: Introduction'), S('plan', 'Plan: Body 1'), S('feedback', 'Feedback: Q2 (5 / 8)')]);
ok('Plan: sections collapse into one group', m.entries[0].kind === 'group' && m.entries[0].children.length === 2, shape(m.entries));
ok('"Plan" DISPLAYS as "Essay Plan" (TOC :39788 + rail PREFIX_MAP agree)',
  m.entries[0].displayLabel === 'Essay Plan', m.entries[0].displayLabel);
ok('group label is the FIRST CHILD\'S REAL DOC LABEL (a groupKey is not a label → scroll would no-op)',
  m.entries[0].label === 'Plan: Introduction', m.entries[0].label);
ok('prefix stripped from child displayLabel', m.entries[0].children[0].displayLabel === 'Introduction');
ok('child keeps RAW label for lookup', m.entries[0].children[0].label === 'Plan: Introduction');
ok('Feedback opens its own group', m.entries[1].displayLabel === 'Feedback');

// NON-ADJACENT sections must join ONE group (TOC uses a groupMap; the rail's old
// adjacency check opened a second "Essay Plan" group instead).
P = 0;
m = build([S('plan', 'Plan: Introduction'), S('feedback', 'Feedback: Q1 (2 / 4)'), S('plan', 'Plan: Body 1')]);
ok('non-adjacent "Plan:" sections join ONE group (groupMap, not adjacency)',
  m.entries.filter(e => e.displayLabel === 'Essay Plan').length === 1
  && m.entries.find(e => e.displayLabel === 'Essay Plan').children.length === 2, shape(m.entries));

// Part A/B Feedback duals are spelled out (TOC :39789-39790)
P = 0;
m = build([S('feedback', 'Part A Feedback: Q1'), S('feedback', 'Part B Feedback: Q2')]);
ok('Part A Feedback → "Feedback — Part A"', m.entries[0].displayLabel === 'Feedback — Part A', m.entries[0].displayLabel);
ok('Part B Feedback → "Feedback — Part B"', m.entries[1].displayLabel === 'Feedback — Part B', m.entries[1].displayLabel);

// ── 10. Empty input
console.log('\n=== 10. degenerate input ===');
ok('empty array → no entries', build([]).entries.length === 0);
ok('null → no entries', build(null).entries.length === 0);
ok('cover-only → no entries', build([S('cover', 'Cover')]).entries.length === 0);

console.log('\n' + (fail === 0 ? 'ALL ' + pass + ' ASSERTIONS PASSED' : pass + ' passed, ' + fail + ' FAILED'));
process.exit(fail === 0 ? 0 : 1);
