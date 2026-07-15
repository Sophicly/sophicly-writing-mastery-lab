/* eslint-env node */
/* Node build-time harness — NOT shipped to the browser. Run: node bin/outline-rule-harness.js */
//
// v7.20.129 — proves the ONE outline-row rule (WML.outlineRow, wml-core.js).
//
// WHY THIS EXISTS. The rule used to be hand-copied into three consumers and had already
// drifted. Consolidating it is only safe if the new rule is PROVABLY identical to the old
// one for every single-control row in the codebase — i.e. every literature / CW / para-AO
// outline a student already has saved. So the core of this harness is an EQUIVALENCE test:
//   ORACLE (the pre-v7.20.129 rule, transcribed verbatim from wml-section-block.js)
//   vs NEW  (the real outlineRow sliced out of wml-core.js and executed)
// across every real criterion × every interesting state. Any divergence is a regression.
//
// Not a reimplementation: the source text is sliced out and eval'd (same method as
// bin/outline-harness.js). If wml-core.js changes, this runs the CHANGED code.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const CORE = path.join(__dirname, '..', 'frontend', 'wml-core.js');
const ASSESS = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');

const coreSrc = fs.readFileSync(CORE, 'utf8');
const assessSrc = fs.readFileSync(ASSESS, 'utf8');

// Slice a declaration out by brace balance from its start marker.
function slice(src, marker, opener) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  let j = src.indexOf(opener, i), depth = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; }
  }
  let end = k + 1;
  if (src[end] === ';') end++;
  return src.slice(i, end);
}

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(
  slice(coreSrc, 'const outlineRow = {', '{') + '\nthis.outlineRow = outlineRow;',
  sandbox
);
vm.runInContext(
  slice(assessSrc, 'const OUTLINE_CRITERIA = {', '{') + '\nthis.OUTLINE_CRITERIA = OUTLINE_CRITERIA;',
  sandbox
);

const RULE = sandbox.outlineRow;
const CRITERIA = sandbox.OUTLINE_CRITERIA;

// ── THE ORACLE — the rule EXACTLY as it stood before v7.20.129 ──
// Transcribed verbatim from wml-section-block.js @ v7.20.128 (the PM-attr consumer, which
// was the most complete of the three copies). The pick-group branch is deliberately absent:
// it is a SECTION-level rule and stayed in the adapters, so it is out of scope here.
function oracle(crit, cs, hasText) {
  let rowOk = hasText;
  if (crit.locked === true || crit.locked === 'true') {
    rowOk = true;
  } else if (crit.type === 'checkbox' || crit.type === 'checklist') {
    const chk = Array.isArray(cs.checked) ? cs.checked.length : 0;
    const need = crit.choice ? 1
      : ((crit.type === 'checklist' && Array.isArray(crit.items)) ? crit.items.length : 1);
    rowOk = hasText && chk >= need;
  } else if (crit.type === 'dropdown') {
    rowOk = hasText && !!cs.selected;
  }
  return rowOk;
}

// ── Collect every REAL single-control criterion shipped in the codebase ──
const realCriteria = [];
function collect(list, where) {
  (list || []).forEach(c => realCriteria.push({ crit: c, where: `${where}.${c.id}` }));
}
collect(CRITERIA.literature.intro, 'literature.intro');
collect(CRITERIA.literature.body, 'literature.body');
collect(CRITERIA.literature.conclusion, 'literature.conclusion');
CRITERIA.iumvcc.sections.forEach(sec => collect(sec.criteria, `iumvcc.${sec.id}`));
Object.keys(CRITERIA.cwPlotArchetypes || {}).forEach(k => {
  const a = CRITERIA.cwPlotArchetypes[k];
  (a.beats || a.criteria || []).forEach(c => {
    if (c && typeof c === 'object' && c.id) realCriteria.push({ crit: c, where: `cw.${k}.${c.id}` });
  });
});

// States worth probing per criterion: nothing, one tick, all ticks, a selection.
function statesFor(crit) {
  const n = Array.isArray(crit.items) ? crit.items.length : 1;
  const all = []; for (let i = 0; i < n; i++) all.push(i);
  return [
    { label: 'empty', st: {} },
    { label: 'checked:[]', st: { checked: [] } },
    { label: 'checked:[0]', st: { checked: [0] } },
    { label: 'checked:ALL', st: { checked: all } },
    { label: 'selected:""', st: { selected: '' } },
    { label: 'selected:X', st: { selected: (crit.items && crit.items[0]) || 'X' } },
    { label: 'both', st: { checked: [0], selected: (crit.items && crit.items[0]) || 'X' } },
  ];
}

let pass = 0, fail = 0;
const failures = [];

// ══ TEST 1 — EQUIVALENCE: every real criterion behaves exactly as before ══
realCriteria.forEach(({ crit, where }) => {
  statesFor(crit).forEach(({ label, st }) => {
    [true, false].forEach(hasText => {
      const want = oracle(crit, st, hasText);
      const got = RULE.complete(crit, st, hasText);
      if (want === got) pass++;
      else {
        fail++;
        failures.push(`EQUIV ${where} [${label}] hasText=${hasText}: oracle=${want} new=${got}`);
      }
    });
  });
});

// ══ TEST 2 — MULTI-CONTROL: the new capability ══
const multi = {
  id: 'intro', label: 'Introduction',
  controls: [
    { id: 'hook', label: 'Hook', type: 'checklist', choice: true, items: ['A', 'B', 'C'] },
    { id: 'tone', label: 'Tone', type: 'dropdown', items: ['urgent', 'reflective'] },
    { id: 'tech', label: 'Techniques', type: 'checklist', choice: true, items: ['Me', 'Sm'] },
  ],
};
function t(name, got, want) {
  if (got === want) pass++;
  else { fail++; failures.push(`MULTI ${name}: want=${want} got=${got}`); }
}
t('no text ⇒ incomplete',
  RULE.complete(multi, { c: { hook: { checked: [0] }, tone: { selected: 'urgent' }, tech: { checked: [0] } } }, false), false);
t('all controls satisfied ⇒ complete',
  RULE.complete(multi, { c: { hook: { checked: [0] }, tone: { selected: 'urgent' }, tech: { checked: [0] } } }, true), true);
t('one control missing (tone) ⇒ incomplete',
  RULE.complete(multi, { c: { hook: { checked: [0] }, tech: { checked: [0] } } }, true), false);
t('choice control needs only 1 ⇒ complete',
  RULE.complete(multi, { c: { hook: { checked: [2] }, tone: { selected: 'urgent' }, tech: { checked: [1] } } }, true), true);
t('empty state ⇒ incomplete',
  RULE.complete(multi, {}, true), false);
t('FLAT state on a multi row does NOT satisfy it (namespacing is load-bearing)',
  RULE.complete(multi, { checked: [0, 1, 2], selected: 'urgent' }, true), false);

// A required (non-choice) control inside a multi row needs EVERY item.
const multiReq = {
  id: 'body', controls: [
    { id: 'ev', label: 'Evidence', type: 'checklist', items: ['Technique', 'Quote', 'Inference'] },
    { id: 'eff', label: 'Effect', type: 'checklist', choice: true, items: ['focus', 'emotion'] },
  ],
};
t('required checklist partially ticked ⇒ incomplete',
  RULE.complete(multiReq, { c: { ev: { checked: [0, 1] }, eff: { checked: [0] } } }, true), false);
t('required checklist fully ticked + choice ≥1 ⇒ complete',
  RULE.complete(multiReq, { c: { ev: { checked: [0, 1, 2] }, eff: { checked: [1] } } }, true), true);
t('mixed row: choice empty ⇒ incomplete',
  RULE.complete(multiReq, { c: { ev: { checked: [0, 1, 2] }, eff: { checked: [] } } }, true), false);

// ══ TEST 3 — STATE HELPERS round-trip ══
const s1 = RULE.withControlState(multi, {}, { id: 'hook' }, { checked: [1] });
t('withControlState namespaces under .c',
  JSON.stringify(s1), JSON.stringify({ c: { hook: { checked: [1] } } }));
const s2 = RULE.withControlState(multi, s1, { id: 'tone' }, { selected: 'urgent' });
t('withControlState preserves siblings',
  JSON.stringify(s2.c.hook), JSON.stringify({ checked: [1] }));
t('stateOf reads back the namespaced control',
  JSON.stringify(RULE.stateOf(multi, s2, { id: 'tone' })), JSON.stringify({ selected: 'urgent' }));
t('stateOf on an unset control ⇒ {}',
  JSON.stringify(RULE.stateOf(multi, s2, { id: 'nope' })), '{}');

// LEGACY rows must keep the FLAT shape — a saved literature outline must not be re-keyed.
const legacy = { id: 'thesis', type: 'checklist', items: ['a', 'b'] };
t('withControlState on a legacy row stays FLAT (no .c wrapper)',
  JSON.stringify(RULE.withControlState(legacy, { checked: [0] }, legacy, { checked: [0, 1] })),
  JSON.stringify({ checked: [0, 1] }));
t('stateOf on a legacy row returns the row state itself',
  JSON.stringify(RULE.stateOf(legacy, { checked: [0] }, legacy)), JSON.stringify({ checked: [0] }));

// ══ TEST 4 — LOCKED rows ══
t('locked row completes with no text',
  RULE.complete({ id: 'x', locked: true, type: 'checkbox' }, {}, false), true);
t('locked:"true" (string form) also completes',
  RULE.complete({ id: 'x', locked: 'true' }, {}, false), true);

// ══ TEST 5 — controlsOf / isMulti ══
t('controlsOf on a legacy crit ⇒ [crit]', RULE.controlsOf(legacy).length, 1);
t('controlsOf on a multi crit ⇒ N', RULE.controlsOf(multi).length, 3);
t('isMulti false for legacy', RULE.isMulti(legacy), false);
t('isMulti true for multi', RULE.isMulti(multi), true);
t('isMulti false for controls:[] (empty ⇒ not multi)', RULE.isMulti({ controls: [] }), false);

// ── Report ──
console.log(`outline-rule-harness: ${realCriteria.length} real criteria × ${statesFor({ items: [1] }).length} states × 2 text-states = equivalence sweep`);
if (fail) {
  console.error(`\n❌ outline-rule-harness FAILED — ${fail} of ${pass + fail}`);
  failures.forEach(f => console.error('   ' + f));
  process.exit(1);
}
console.log(`✅ outline-rule-harness passed (${pass} assertions; single-control rows byte-identical to v7.20.128).`);
