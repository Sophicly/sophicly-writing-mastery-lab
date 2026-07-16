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

// Slice a declaration out by bracket balance from its start marker.
// v7.20.131: balances the OPENER's own pair — it used to hard-code `{`/`}`, so an array
// declaration ('[') never closed and silently returned the rest of the file.
function slice(src, marker, opener) {
  const closer = { '{': '}', '[': ']', '(': ')' }[opener];
  if (!closer) throw new Error('unsupported opener: ' + opener);
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  let j = src.indexOf(opener, i), depth = 0, k = j;
  for (; k < src.length; k++) {
    const ch = src[k];
    if (ch === opener) depth++;
    else if (ch === closer) { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error('unbalanced ' + opener + ' after marker: ' + marker);
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
// v7.20.131: OUTLINE_CRITERIA now leans on two module-scope helpers (the Methodology point
// builder and its shared action-verb list — defined once so three point rows can't drift), so
// they must ride into the sandbox ahead of it. Sliced from the real source like everything else
// here: if they change, this runs the CHANGED code.
vm.runInContext(slice(assessSrc, 'const _IU_ACTION_VERBS = [', '['), sandbox);
vm.runInContext(slice(assessSrc, 'function _iuPoint(', '{'), sandbox);
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

// ══ TEST 1 — EQUIVALENCE: every SINGLE-CONTROL criterion behaves exactly as before ══
// The oracle IS the pre-v7.20.129 rule, so it can only speak about the shape that existed then.
// Multi-control and optional rows are new capability with no "before" to be equivalent to — they
// are covered by TESTS 2/4/6 instead. Scoping is therefore correct, but it must never be SILENT:
// the counts below are printed so a shrinking sweep can't read as a passing one.
const singleCriteria = realCriteria.filter(({ crit }) => !RULE.isMulti(crit) && !crit.optional);
const excluded = realCriteria.filter(({ crit }) => RULE.isMulti(crit) || crit.optional);
singleCriteria.forEach(({ crit, where }) => {
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

// ══ TEST 4b — OPTIONAL rows (v7.20.130) ══
// The protocol plans a RANGE ("their 2–3 distinct points"), so an untouched third row must not
// block its section — but a STARTED one is a normal row. These two facts are the whole feature.
const opt = {
  id: 'point-3', optional: true,
  controls: [{ id: 'verb', label: 'Action verb family', type: 'dropdown', items: ['Growth', 'Decay'] }],
};
t('optional row, EMPTY ⇒ complete (a two-point argument is valid)',
  RULE.complete(opt, {}, false), true);
t('optional row, STARTED but control unset ⇒ INCOMPLETE (started means finish it)',
  RULE.complete(opt, {}, true), false);
t('optional row, STARTED + control set ⇒ complete',
  RULE.complete(opt, { c: { verb: { selected: 'Growth' } } }, true), true);
t('optional:"true" (string form) also completes when empty',
  RULE.complete({ id: 'x', optional: 'true' }, {}, false), true);
t('NON-optional row, empty ⇒ incomplete (the flag is what changes it, nothing else)',
  RULE.complete({ id: 'x', controls: opt.controls }, {}, false), false);
t('locked BEATS optional-with-text (a carryover is satisfied either way)',
  RULE.complete({ id: 'x', locked: true, optional: true, type: 'checkbox' }, {}, true), true);

// ══ TEST 5b — THE SHIPPED IUMVCC ROWS ARE WELL-FORMED (v7.20.130) ══
// Structural gate on the AUTHORED rows, not the engine: a typo'd control (missing id, unknown
// type, checklist with no items) renders a row that can never complete, and the student — not
// the harness — would be the one to find it.
const IU = CRITERIA.iumvcc.sections;
t('iumvcc ships SIX sections (Neil: "it\'s actually just six sections")', IU.length, 6);
t('iumvcc section ids are the six IUMVCC letters, in order',
  IU.map(s => s.id).join(','), 'intro,urgency,method,vision,counter,conclusion');
t('Methodology is the only multi-row section (one row PER POINT + organisation)',
  IU.filter(s => s.criteria.length > 1).map(s => s.id).join(','), 'method');
t('Methodology = point-1, point-2, point-3, organisation',
  IU.find(s => s.id === 'method').criteria.map(c => c.id).join(','), 'point-1,point-2,point-3,organisation');
t('exactly ONE optional row ships (methodology point 3)',
  IU.flatMap(s => s.criteria).filter(c => c.optional).map(c => c.id).join(','), 'point-3');
t('the Introduction hook offers SEVEN openers (eight in the protocol, F ruled out by Neil)',
  IU[0].criteria[0].controls.find(c => c.id === 'hook').items.length, 7);
t('the hook LAYERS ⇒ choice:true (protocol :607)',
  IU[0].criteria[0].controls.find(c => c.id === 'hook').choice, true);
// ⭐ THE PICKER LANDS ON I·U·M·V ONLY — a PEDAGOGY rule (PEDAGOGY.md §3b), so it is gated here
// rather than trusted to a comment. The protocol offers DEVICES at those four sections
// (:619-627 / :643-646 / :655-656 / :668-671). Counter-argument offers *rebuttal techniques*
// and Conclusion offers *closing approaches* — different taxonomies, so the device picker there
// would teach a vocabulary the protocol never offers at that section.
const withPicker = IU.filter(s => s.criteria.some(c => RULE.controlsOf(c).some(ctl => ctl.type === 'techniques')));
t('the technique picker is on Introduction, Urgency, Methodology and Vision — and NOWHERE else',
  withPicker.map(s => s.id).join(','), 'intro,urgency,method,vision');
t('Counter-argument has NO device picker (it teaches rebuttal techniques instead)',
  RULE.controlsOf(IU.find(s => s.id === 'counter').criteria[0]).some(c => c.type === 'techniques'), false);
t('Conclusion has NO device picker (it teaches closing approaches instead)',
  RULE.controlsOf(IU.find(s => s.id === 'conclusion').criteria[0]).some(c => c.type === 'techniques'), false);
t('every Methodology POINT gets a picker; the Organisation row does not',
  IU.find(s => s.id === 'method').criteria
    .filter(c => RULE.controlsOf(c).some(ctl => ctl.type === 'techniques')).map(c => c.id).join(','),
  'point-1,point-2,point-3');

// The picker's roster is GENERATED, never authored — so a `techniques` control must carry no
// hand-typed items. If one ever does, the vocabulary has forked from the table.
IU.flatMap(s => s.criteria).flatMap(c => RULE.controlsOf(c)).filter(c => c.type === 'techniques')
  .forEach(c => t(`picker "${c.id}" hand-types no roster (it reads window.WML_TECHNIQUES)`, !c.items, true));

// ══ TEST 5c — the picker's completion rule ══
const pick = { id: 'x', controls: [{ id: 'devices', label: 'Devices', type: 'techniques' }] };
t('picker with no devices ⇒ incomplete',
  RULE.complete(pick, { c: { devices: {} } }, true), false);
t('ONE taught device satisfies it (the layer is invited, never forced — :607)',
  RULE.complete(pick, { c: { devices: { picked: ['Me'] } } }, true), true);
t('the student’s OWN words satisfy it (tier 3)',
  RULE.complete(pick, { c: { devices: { free: ['my own name for it'] } } }, true), true);
t('whitespace-only free text does NOT satisfy it',
  RULE.complete(pick, { c: { devices: { free: ['   '] } } }, true), false);
t('empty picked/free arrays ⇒ incomplete',
  RULE.complete(pick, { c: { devices: { picked: [], free: [] } } }, true), false);
t('devices picked but the row is empty ⇒ still incomplete (text is always required)',
  RULE.complete(pick, { c: { devices: { picked: ['Me', 'Tr'] } } }, false), false);

// Every tier-1 code the picker can persist must exist in the generated index — a saved pick
// that resolves to nothing would render as a bare code to the student.
const idxPath = path.join(__dirname, '..', 'frontend', 'wml-techniques-index.js');
if (fs.existsSync(idxPath)) {
  const idxSandbox = { window: {} };
  vm.createContext(idxSandbox);
  vm.runInContext(fs.readFileSync(idxPath, 'utf8'), idxSandbox);
  const TECH = idxSandbox.window.WML_TECHNIQUES;
  t('the generated technique index loads and exposes tier1 + all', !!(TECH && TECH.tier1 && TECH.all), true);
  const allCodes = new Set(TECH.all.map(e => e.c));
  TECH.tier1.flatMap(g => g.items).forEach(i => {
    t(`tier-1 "${i.name}" resolves to a real table code`, allCodes.has(i.code), true);
  });
  t('tier 1 is the protocol\'s 14 devices', TECH.tier1.flatMap(g => g.items).length, 14);
  t('tier 1 carries the protocol\'s four groups',
    TECH.tier1.map(g => g.group).join(','), 'Sound,Comparison,Structural,Intensity');
  t('the taught word wins over the table\'s canonical (Triadic structure → Tricolon `Tr`)',
    TECH.tier1.flatMap(g => g.items).find(i => i.code === 'Tr').name, 'Triadic structure');
} else {
  fail++; failures.push('MULTI the generated technique index is MISSING — run node bin/build-techniques-index.js');
}

const KNOWN_TYPES = ['checklist', 'checkbox', 'dropdown', 'techniques'];
IU.forEach(sec => sec.criteria.forEach(crit => {
  RULE.controlsOf(crit).forEach((ctl, i) => {
    t(`iumvcc.${sec.id}.${crit.id} control[${i}] has an id`, !!ctl.id, true);
    t(`iumvcc.${sec.id}.${crit.id}.${ctl.id} type is known`, KNOWN_TYPES.includes(ctl.type), true);
    if (ctl.type === 'checklist' || ctl.type === 'dropdown') {
      t(`iumvcc.${sec.id}.${crit.id}.${ctl.id} offers items`, Array.isArray(ctl.items) && ctl.items.length > 0, true);
    }
    t(`iumvcc.${sec.id}.${crit.id}.${ctl.id} is labelled (the row label is the SECTION)`, !!ctl.label, true);
  });
  // Control ids must be unique WITHIN a row — the saved state namespaces by them, so a
  // duplicate would make two controls share one slot and silently overwrite each other.
  const ids = RULE.controlsOf(crit).map(c => c.id);
  t(`iumvcc.${sec.id}.${crit.id} control ids are unique`, new Set(ids).size, ids.length);
}));

// ══ TEST 5 — controlsOf / isMulti ══
t('controlsOf on a legacy crit ⇒ [crit]', RULE.controlsOf(legacy).length, 1);
t('controlsOf on a multi crit ⇒ N', RULE.controlsOf(multi).length, 3);
t('isMulti false for legacy', RULE.isMulti(legacy), false);
t('isMulti true for multi', RULE.isMulti(multi), true);
t('isMulti false for controls:[] (empty ⇒ not multi)', RULE.isMulti({ controls: [] }), false);

// ── Report ──
console.log(`outline-rule-harness: equivalence sweep = ${singleCriteria.length} single-control criteria`
  + ` × ${statesFor({ items: [1] }).length} states × 2 text-states`
  + ` · ${excluded.length} criteria excluded as multi-control/optional (no pre-.129 oracle exists`
  + ` for them — covered by the multi/optional/well-formed tests instead)`);
if (fail) {
  console.error(`\n❌ outline-rule-harness FAILED — ${fail} of ${pass + fail}`);
  failures.forEach(f => console.error('   ' + f));
  process.exit(1);
}
console.log(`✅ outline-rule-harness passed (${pass} assertions; single-control rows byte-identical to v7.20.128).`);
