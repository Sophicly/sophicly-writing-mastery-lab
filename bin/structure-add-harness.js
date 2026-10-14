#!/usr/bin/env node
/* eslint-env node */
/**
 * structure-add-harness.js — v7.20.888 (FIXLIST 1412-codex-text-outside-boxes): nothing is added to a box but writing.
 *
 * Ibrahim 1412's Mastery Codex (prod, 13 Oct): his Unit 3 box gained ~60 paragraphs reproducing the page OUTSIDE its
 * fields; his Unit 5 box gained eighteen empty copies of the boxes after it plus both cards. Pupil 1361's Lang P2 Q2
 * Response holds copies of the Q2 Response, Q3 question and Q3 plan. 684 stored documents swept: exactly those two.
 * The route is not known (today's paste cannot make either shape — measured on staging), so the structure lock refuses
 * the TRANSACTION, by any route, and records it.
 *
 * What it proves, from the SHIPPED source (the pure core is sliced between its sentinels):
 *   A · the shape: boxes inside a student's box (plan · response · outline) and field-only sections, on real-shaped
 *       documents — 1412's two shapes, 1361's shape, a group's outline sections (legitimate nesting, NOT counted)
 *   B · the decision table — nest refused from anyone; body refused from the student only; a migration and a
 *       whole-document load (an existing document must still open) always pass; typing in a field always passes
 *   C · the wiring — ONE field-only rule (the input handlers call it too), ONE whole-document test (both guards), the
 *       filter consults it before the display guard, the record (toast + the durable log, guard named), the server keeps
 *       the guard's name
 *   D · five mutations of the real source — each must fail A or B
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
const FIELDS = ['inputField', 'outlineRow'];

function load(src) {
    const B = src.indexOf('    // @STRUCTURE-ADD-PURE-BEGIN'), E = src.indexOf('    // @STRUCTURE-ADD-PURE-END');
    if (!(B > 0 && E > B)) throw new Error('@STRUCTURE-ADD-PURE sentinels missing');
    return new Function(src.slice(B, E) + '\nreturn { _swmlIsFieldOnly, _swmlAddShape, _swmlStructureAddVerdict, SWML_STUDENT_BOX_TYPES };')();   // eslint-disable-line no-new-func
}

// ── ProseMirror-shaped nodes: forEach over children; descendants honours "return false = skip the children" ──
function node(name, attrs, children, opts) {
    const n = Object.assign({ type: { name }, attrs: attrs || {}, children: children || [], isTextblock: false, isText: false }, opts || {});
    n.forEach = (cb) => n.children.forEach((c, i) => cb(c, 0, i));
    n.descendants = (cb) => { (function walk(x) { for (const c of x.children) { if (cb(c) !== false) walk(c); } })(n); };
    Object.defineProperty(n, 'textContent', { get() { return n.text != null ? n.text : n.children.map((c) => c.textContent).join(''); } });
    return n;
}
const txt = (t) => node('text', {}, [], { isText: true, text: t });
const field = (id, t) => node('inputField', { fieldId: id }, t ? [txt(t)] : [], { isTextblock: true });
const row = (id, t) => node('outlineRow', { fieldId: id }, t ? [txt(t)] : [], { isTextblock: true });
const para = (t, locked) => node('paragraph', locked ? { locked: true } : {}, t ? [txt(t)] : [], { isTextblock: true });
const sec = (type, label, kids) => node('sectionBlock', { sectionType: type, label }, kids);
const doc = (kids) => node('doc', {}, kids);

// The Codex, healthy: field-only plan boxes, a divider, the two cards at the end.
const codexBase = (u3extra, u5extra) => doc([
    sec('divider', 'UNIT 3 — CODE OF THE QUEST', [para('UNIT 3 — CODE OF THE QUEST', true)]),
    sec('plan', 'Launch Retrieval & Hypothesis', [field('unit-3.lrh.s1', 'my answer'), field('unit-3.lrh.s2', '')].concat(u3extra || [])),
    sec('plan', 'Exit Ticket (3-2-1) + When-Intention', [field('unit-3.exit.s1', '')]),
    sec('divider', 'UNIT 5 — SCIENCE OF MASTERY', [para('UNIT 5 — SCIENCE OF MASTERY', true)]),
    sec('plan', 'Hypothesis', [field('unit-5.hyp.s1', 'my hypothesis')].concat(u5extra || [])),
    sec('plan', 'Definitions', [field('unit-5.def.s1', '')]),
    sec('progress', 'Document Progress', [para('Document Progress'), para('4 of 8 units complete')]),
    sec('signoff', 'Tutor Sign-off', [para('Status: Awaiting sign-off')]),
]);
const CARD_TEXT = [para('Document Progress'), para('2 of 8 units complete'), para('25%'), para('Status: Awaiting sign-off'), para('⏳ Awaiting tutor'), para('UNIT 1 — WHY THIS COURSE EXISTS')];
const U5_NEST = [sec('plan', 'Definitions', [field('x', '')]), sec('plan', 'Essay Structure', []), sec('progress', 'Document Progress', [para('Document Progress')]), sec('signoff', 'Tutor Sign-off', [para('Status: Awaiting sign-off')])];
const D = {
    codex: () => codexBase(),
    typed: () => doc(codexBase().children.map((s) => s.attrs.label === 'Hypothesis' ? sec('plan', 'Hypothesis', [field('unit-5.hyp.s1', 'my hypothesis, longer now')]) : s)),
    u3: () => codexBase(CARD_TEXT),                 // 1412 Unit 3: the page as paragraphs outside the fields
    u5: () => codexBase(null, U5_NEST),             // 1412 Unit 5: boxes inside the box
    oneChar: () => codexBase([para('x')]),          // the smallest body write
    emptyPara: () => codexBase([para('')]),         // an empty paragraph changes nothing a student can see
    lockedPara: () => codexBase([para('Instructions', true)]),
    // Lang P2, 1361's shape: the Q2 Response box holds a Q2 Response, the Q3 question, a divider and the Q3 plan.
    lang: (nest) => doc([sec('response', 'Q2 Response', [para('My Q2 answer.')].concat(nest ? [sec('response', 'Q2 Response', [para('My Q2 answer.')]),
        sec('question', 'Q3', [para('How does the writer…', true)]), sec('divider', 'PLAN — Q3', [para('PLAN — Q3', true)]), sec('plan', 'Plan: Paragraph 1 — Q3', [field('plan-Q3-para-1', 'p')])] : [])),
        sec('plan', 'Plan: Paragraph 1 — Q3', [field('plan-Q3-para-1', 'p')])]),
    // Legitimate nesting: a group holds outline sections. Not a student box → never counted.
    group: (extra) => doc([sec('group', 'Outline — Q3', [sec('outline', 'Paragraph 1', [row('o-1', 'topic'), row('o-2', '')]),
        sec('outline', 'Paragraph 2', [row('o-3', '')])].concat(extra || []))]),
};

function run(P, verbose) {
    let pass = 0, fail = 0;
    const ok = (c, m) => { if (c) pass++; else fail++; if (verbose) console.log((c ? '  ✓ ' : '  ✗ ') + m); };
    const shape = (d) => P._swmlAddShape(d, FIELDS);
    const verdict = (from, to, o) => P._swmlStructureAddVerdict(Object.assign({ docChanged: true, migrating: false, wholeDoc: false, fromStudent: true,
        before: () => shape(from), after: () => shape(to) }, o || {}));

    if (verbose) console.log('A · the shape');
    ok(shape(D.codex()).nested === 0 && shape(D.codex()).fieldOnly === 4, 'healthy Codex: 0 boxes inside a box, 4 field-only boxes (cards and dividers have no field)');
    ok(shape(D.u3()).nested === 0 && shape(D.u3()).fieldOnly === 3, '1412 Unit 3 shape: the box is no longer field-only (4 → 3) — writing outside its fields');
    ok(shape(D.u5()).nested === 4, '1412 Unit 5 shape: 4 boxes inside the Hypothesis box (cards included)');
    ok(shape(D.lang(true)).nested === 4 && shape(D.lang(false)).nested === 0, '1361 shape: 4 boxes inside the Q2 Response; the healthy page has none');
    ok(shape(D.group()).nested === 0 && shape(D.group([sec('outline', 'Paragraph 3', [row('o-4', '')])])).nested === 0,
        'a group holding outline sections is legitimate nesting — never counted, and adding one is not "a box inside a box"');
    ok(shape(D.emptyPara()).fieldOnly === 4 && shape(D.lockedPara()).fieldOnly === 4 && shape(D.oneChar()).fieldOnly === 3,
        'field-only follows the input handlers\' rule: an empty or locked paragraph changes nothing, one written character does');
    ok(P._swmlIsFieldOnly(sec('plan', 'p', [field('a', '')]), FIELDS) && !P._swmlIsFieldOnly(sec('response', 'r', [para('prose')]), FIELDS),
        'a box that is only a field is field-only; a prose response is not');

    if (verbose) console.log('\nB · the decision table');
    ok(verdict(D.codex(), D.u5()).refuse && verdict(D.codex(), D.u5()).kind === 'nest', '1412 Unit 5 from the student → refused (nest)');
    ok(verdict(D.codex(), D.u5(), { fromStudent: false }).refuse, '… and from code → refused too (no code path ever puts a box in a box: 0 of 682 healthy prod documents)');
    ok(verdict(D.lang(false), D.lang(true)).refuse, '1361\'s shape → refused');
    ok(verdict(D.codex(), D.u3()).refuse && verdict(D.codex(), D.u3()).kind === 'body', '1412 Unit 3 from the student → refused (body)');
    ok(!verdict(D.codex(), D.u3(), { fromStudent: false }).refuse, '… from code → allowed (Sophia\'s fills and heals stay untouched)');
    ok(!verdict(D.codex(), D.typed()).refuse, 'typing inside a field → allowed');
    ok(!verdict(D.codex(), D.emptyPara()).refuse, 'an empty paragraph appearing (Enter) → allowed (nothing a student can see)');
    ok(!verdict(D.codex(), D.u5(), { wholeDoc: true }).refuse && !verdict(D.codex(), D.u3(), { wholeDoc: true }).refuse,
        'a whole-document load → allowed, so 1412\'s and 1361\'s stored documents still OPEN');
    ok(!verdict(D.codex(), D.u5(), { migrating: true }).refuse, 'a migration → allowed (it owns the boxes)');
    ok(!verdict(D.u5(), D.codex()).refuse && !verdict(D.u3(), D.codex()).refuse, 'removing the stray content (a repair) → allowed');
    ok(!verdict(D.group(), D.group([sec('outline', 'Paragraph 3', [row('o-4', '')])]), { fromStudent: false }).refuse, 'code adding an outline section to a group → allowed');
    ok(!P._swmlStructureAddVerdict({ docChanged: false }).refuse, 'a selection-only transaction → allowed');
    let reads = 0;
    P._swmlStructureAddVerdict({ docChanged: true, migrating: false, wholeDoc: true, fromStudent: true, before: () => { reads++; return shape(D.codex()); }, after: () => { reads++; return shape(D.u5()); } });
    ok(reads === 0, 'a whole-document load is decided without walking the document');

    return { pass, fail };
}

const P0 = load(JS);
const total = run(P0, true);
const ok = (c, m) => { if (c) total.pass++; else total.fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };

console.log('\nC · wiring');
const lock = JS.slice(JS.indexOf('    function _installStructureLock(editor, types) {'), JS.indexOf('    // v7.20.139 (Neil: clicking a non-editable spot'));
ok(/if \(v\.allow && tr\.docChanged && !_migrationActive\) \{\s*const a = _swmlStructureAddVerdict\(\{\s*docChanged: true, migrating: false, wholeDoc: _swmlTrWholeDoc\(tr\), fromStudent: fromStudent,\s*before: \(\) => _swmlAddShape\(state\.doc, FIELD_SELECT_ALL_TYPES\),\s*after: \(\) => _swmlAddShape\(tr\.doc, FIELD_SELECT_ALL_TYPES\),/.test(lock),
    'the ONE filter asks the verdict, with the student test shared with the structure lock and the input handlers\' field types');
ok(/if \(a\.refuse\) \{\s*_swmlStructureAddRecord\(a, \{[\s\S]*?\}\);\s*return false;\s*\}/.test(lock), 'a refusal records, then returns false');
ok(lock.indexOf('_swmlStructureAddVerdict(') > 0 && lock.indexOf('_swmlStructureAddVerdict(') < lock.indexOf('_swmlDisplayGuardVerdict('), 'it is decided before the display guard (both can only refuse)');
ok(/const wholeDoc = _swmlTrWholeDoc\(tr\);/.test(lock) && lock.indexOf("st === 'replaceAround'") === -1, 'ONE whole-document test, used by both guards (no inline copy left in the filter)');
ok(/function _swmlTrWholeDoc\(tr\) \{\s*return tr\.steps\.some\(\(s, i\) => \{\s*const st = \(s\.toJSON\(\) \|\| \{\}\)\.stepType;\s*return \(st === 'replace' \|\| st === 'replaceAround'\) && s\.from <= 0 && s\.to >= tr\.docs\[i\]\.content\.size;/.test(JS),
    'a whole-document step = a replace from 0 to the document\'s end (per step, against that step\'s own document)');
const fo = JS.slice(JS.indexOf('    function _swmlSectionFieldOnly(state, pos) {'), JS.indexOf('    // ⭐ v7.20.400 (FIXLIST #169'));
ok(/return _swmlIsFieldOnly\(\$p\.node\(secDepth\), FIELD_SELECT_ALL_TYPES\);/.test(fo) && !/hasFreeProse/.test(fo), 'ONE field-only rule: the input handlers call the same function the guard counts with');
const rec = JS.slice(JS.indexOf('    function _swmlStructureAddRecord(v, info) {'), JS.indexOf('    function _swmlTrWholeDoc(tr) {'));
ok(/showToast\('You can only write inside the boxes\. That change wasn’t kept\.', 5000, true\)/.test(rec) && /Date\.now\(\) - _swmlAddToldAt > 2500/.test(rec), '§4d: the student is told why, once per burst, in plain words');
ok(/guard: 'structure_' \+ v\.kind/.test(rec) && /_swmlAddLogN < 10 && Date\.now\(\) - _swmlAddLogAt > 5000/.test(rec) && /fetch\(API\.displayLockLog, \{ method: 'POST', headers/.test(rec),
    'the durable record names the guard, rate-limited like the display guard\'s (one per 5 s, ten per page)');
ok(/'guard'\s*=> sanitize_key\(\$p\['guard'\] \?\? 'display'\),/.test(REST) && /\[WML display-lock\] guard=%s/.test(REST), 'server: the log keeps which guard refused (old records read as "display")');

console.log('\nD · each mutation of the real source is caught');
const MUT = [
    ['code may nest boxes (student-only nest test)', "if (b.nested > a.nested) return { refuse: true, kind: 'nest'", "if (t.fromStudent && b.nested > a.nested) return { refuse: true, kind: 'nest'"],
    ['a whole-document load refused (existing documents stop opening)', 'if (!t || !t.docChanged || t.migrating || t.wholeDoc) return { refuse: false };', 'if (!t || !t.docChanged || t.migrating) return { refuse: false };'],
    ['groups counted as student boxes', "const SWML_STUDENT_BOX_TYPES = ['plan', 'response', 'outline'];", "const SWML_STUDENT_BOX_TYPES = ['plan', 'response', 'outline', 'group'];"],
    ['locked instruction paragraphs read as writing', "&& !(n.attrs && (n.attrs.locked === true || n.attrs.locked === 'true'))\n                && (n.textContent || '').trim()) hasFreeProse = true;", "&& (n.textContent || '').trim()) hasFreeProse = true;"],
    ['the body rule dropped', "if (t.fromStudent && b.fieldOnly < a.fieldOnly) return { refuse: true, kind: 'body', from: a.fieldOnly, to: b.fieldOnly };", ''],
];
MUT.forEach(([name, from, to]) => {
    if (JS.split(from).length !== 2) { ok(false, name + ' — mutation anchor not found exactly once (the harness is stale)'); return; }
    let r;
    try { r = run(load(JS.replace(from, to)), false); } catch (e) { r = { fail: 1 }; }
    ok(r.fail > 0, name + ' → ' + r.fail + ' check(s) fail');
});

console.log('\n' + (total.fail ? '❌' : '✅') + ' structure-add-harness: ' + total.pass + ' passed, ' + total.fail + ' failed');
process.exit(total.fail ? 1 : 0);
