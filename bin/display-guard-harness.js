#!/usr/bin/env node
/* eslint-env node */
/**
 * display-guard-harness.js — v7.20.882 (FIXLIST p&c-1397-lock-device): the display-lock guard.
 *
 * Shayaan 1397's Power & Conflict assessment copy gained a third body paragraph (prod, 13 Oct) although the assessment
 * lesson shows the writing read-only (PEDAGOGY §6, v7.19.947) and every input route reproduced in WML 356 A was refused
 * by the input handlers. The guard closes the transaction choke point without needing the route, and records it.
 *
 * What it proves, from the SHIPPED code (the pure core is sliced between its sentinels):
 *   A. VERDICT — refuses ONLY a student change to the TEXT of a locked section in a display lesson; lets through code,
 *                migrations, whole-document loads and every other lesson.
 *   B. TEXT    — on ProseMirror-shaped documents: typing in the response / plan / outline changes the locked writing;
 *                typing in Self-Assessment does not; an edit-time stamp (setNodeMarkup — _flushEditTsStamps, measured on
 *                staging firing a few ms after the keystroke) and a comment mark change no word; in a discuss-feedback
 *                lesson the feedback family is protected too.
 *   C. WIRING  — one filter (inside the structure lock), the SAME locked-type constants the input handlers use, the
 *                student test shared with the structure lock, the record (toast + rate-limited durable log), the route.
 *   D. FALSIFY — four mutations of the real source each make A or B fail.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');

function load(src) {
    const B = src.indexOf('    // @DISPLAY-GUARD-PURE-BEGIN'), E = src.indexOf('    // @DISPLAY-GUARD-PURE-END');
    if (!(B > 0 && E > B)) throw new Error('sentinels missing');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src.slice(B, E) + '\nthis.G = { _swmlDisplayGuardVerdict, _swmlLockedTexts, _swmlLockedTextChanged };', ctx);
    return ctx.G;
}

// ── ProseMirror-shaped nodes: descendants() honours "return false = skip the children"; textContent concatenates ──
function node(name, attrs, children, text) {
    const n = { type: { name }, attrs: attrs || {}, children: children || [], text: text == null ? null : text, marks: [] };
    n.isTextblock = name === 'paragraph';
    Object.defineProperty(n, 'textContent', { get() { return n.text != null ? n.text : n.children.map((c) => c.textContent).join(''); } });
    return n;
}
const sec = (type, kids, extra) => node('sectionBlock', Object.assign({ sectionType: type }, extra || {}), kids);
const para = (t) => node('paragraph', {}, [node('text', {}, [], t)]);
function doc(children) {
    const d = node('doc', {}, children);
    d.descendants = (cb) => { (function walk(n) { for (const c of n.children) { if (cb(c) !== false) walk(c); } })(d); };
    return d;
}
const build = (o) => doc([sec('plan', [para(o.plan || 'my plan')]), sec('response', [para(o.resp || 'my essay paragraph')], o.respAttrs),
    sec('action', [para(o.sa || 'Hook: 3 / 5')]), sec('feedback', [para(o.fb || 'feedback text')]),
    node('sectionBlock', { sectionType: 'group' }, [sec('outline', [para(o.out || 'outline row')])])]);
const LOCKED = ['response', 'plan', 'outline'];
const DISCUSS = LOCKED.concat(['feedback', 'scores', 'analytics', 'action', 'improvement']);

function run(G, verbose) {
    let pass = 0, fail = 0;
    const ok = (c, m) => { if (c) { pass++; if (verbose) console.log('  ✓ ' + m); } else { fail++; if (verbose) console.log('  ✗ ' + m); } };
    const say = (s) => { if (verbose) console.log(s); };
    const V = (o) => G._swmlDisplayGuardVerdict(Object.assign({ docChanged: true, locked: true, migrating: false, fromStudent: true, wholeDoc: false, lockedTextChanged: true }, o)).refuse;
    const C = (a, b, types) => G._swmlLockedTextChanged(build(a), build(b), types || LOCKED);

    say('\nA · the verdict');
    ok(V({}) === true, 'a student change to the locked writing of a display lesson → refused');
    ok(V({ fromStudent: false }) === false, 'the same change from CODE (Sophia\'s fills, heals, stamps) → allowed');
    ok(V({ migrating: true }) === false, 'a migration → allowed (it owns the document)');
    ok(V({ locked: false }) === false, 'any other lesson (diagnostic, planning, polishing) → allowed');
    ok(V({ docChanged: false }) === false, 'a selection-only transaction → allowed');
    ok(V({ wholeDoc: true }) === false, 'a whole-document load (setContent) → allowed — code, never a keystroke');
    ok(V({ lockedTextChanged: false }) === false, 'a student change that leaves every locked word as it was → allowed');

    say('\nB · what counts as changing the writing');
    ok(C({}, { resp: 'my essay paragraph QQ' }) === true, 'a word typed into the response → changed');
    ok(C({}, { plan: 'my plan!' }) === true && C({}, { out: 'outline row x' }) === true, 'the plan, and an outline row inside a group → changed');
    ok(C({}, { resp: 'my essay' }) === true, 'words deleted from the response → changed');
    ok(C({}, { sa: 'Hook: 4 / 5' }) === false, 'a rating in Self-Assessment → not the locked writing');
    ok(C({}, { fb: 'feedback text edited' }) === false, 'Feedback in an assessment lesson → not locked');
    ok(C({}, { fb: 'feedback text edited' }, DISCUSS) === true, 'Feedback in a discuss-feedback lesson → locked');
    ok(C({}, { respAttrs: { editTs: '1791999084900' } }) === false, 'an edit-time stamp on the response (setNodeMarkup, measured: _flushEditTsStamps) → no word changed → allowed');
    const marked = build({}); marked.children[1].children[0].children[0].marks = [{ type: { name: 'highlight' } }];
    ok(G._swmlLockedTextChanged(build({}), marked, LOCKED) === false, 'a comment mark on the essay → no word changed → allowed');
    ok(G._swmlLockedTexts(build({}), LOCKED).length === 3, 'three locked sections found (plan, response, the outline inside a group)');
    return { pass, fail };
}

let total = { pass: 0, fail: 0 };
const ok = (c, m) => { if (c) { total.pass++; console.log('  ✓ ' + m); } else { total.fail++; console.log('  ✗ ' + m); } };
let G0;
try { G0 = load(JS); } catch (e) { console.log('  ✗ ' + e.message); process.exit(1); }
const r0 = run(G0, true); total.pass += r0.pass; total.fail += r0.fail;

console.log('\nC · wiring');
const lockSrc = JS.slice(JS.indexOf('    function _installStructureLock(editor, types) {'), JS.indexOf('    // v7.20.139 (Neil: clicking a non-editable spot'));
ok(/const fromStudent = !!tr\.getMeta\('uiEvent'\) \|\| \(Date\.now\(\) - userAt\) < SWML_LOCK_USER_WINDOW_MS;/.test(lockSrc) && /fromStudent: fromStudent,/.test(lockSrc),
    'ONE student test, shared with the structure lock');
ok(/if \(v\.allow && tr\.docChanged && fromStudent && !_migrationActive && _docDisplayLocked\(\)\) \{/.test(lockSrc), 'the guard runs inside the same filter, only in a display lesson, only for the student');
ok(/lockedTextChanged: !wholeDoc && _swmlLockedTextChanged\(state\.doc, tr\.doc, _displayLockTypesNow\(\)\)/.test(lockSrc)
    && /const wholeDoc = _swmlTrWholeDoc\(tr\);/.test(lockSrc)
    && /function _swmlTrWholeDoc\(tr\) \{[\s\S]{0,120}\(st === 'replace' \|\| st === 'replaceAround'\) && s\.from <= 0 && s\.to >= tr\.docs\[i\]\.content\.size/.test(JS),
    'the writing is compared before → after the transaction; a whole-document load is recognised per step (v7.20.888: the ONE helper both guards use)');
ok(/if \(g\.refuse\) \{\s*_swmlDisplayGuardRecord\(\{/.test(lockSrc) && /return false;\s*\}\s*\}\s*if \(v\.allow\) return true;/.test(lockSrc), 'a refusal records, then returns false — before the structure verdict can allow it');
ok(/const touched = \(view, ev\) => \{ userAt = Date\.now\(\); lastEv = \{ type: \(ev && ev\.type\) \|\| '', inputType: \(ev && ev\.inputType\) \|\| '' \}; return false; \};/.test(lockSrc),
    'the record carries what the browser said the student did (event + inputType)');
ok(/function _displayLockTypesNow\(\) \{\s*return state\.task === 'feedback_discussion' \? DISPLAY_LOCK_SECTION_TYPES\.concat\(DISCUSS_ONLY_LOCK_SECTION_TYPES\) : DISPLAY_LOCK_SECTION_TYPES;/.test(JS),
    'the locked types are the SAME constants the input handlers use (no second list)');
const rec = JS.slice(JS.indexOf('    function _swmlDisplayGuardRecord(info) {'), JS.indexOf('    let _swmlLockToldAt = 0;'));
ok(/showToast\('You can’t change your writing in this lesson\. This is the copy that is marked\.', 5000, true\)/.test(rec) && /Date\.now\(\) - _swmlGuardToldAt > 2500/.test(rec),
    '§4d: the student is told why, once per burst, in plain words');
ok(/_swmlGuardLogN < 10 && Date\.now\(\) - _swmlGuardLogAt > 5000/.test(rec) && /fetch\(API\.displayLockLog, \{ method: 'POST', headers/.test(rec), 'the durable record is rate-limited (one per 5 s, ten per page)');
ok(/displayLockLog: config\.restUrl \+ 'display-lock\/log'/.test(CORE), 'the API map names the route');
const h = REST.slice(REST.indexOf('public function display_lock_log($request)'), REST.indexOf('GET /mc-gate/first-diagnostic'));
ok(/register_rest_route\(\$namespace, '\/display-lock\/log', \[\s*'methods' => 'POST', 'callback' => \[\$this, 'display_lock_log'\],\s*'permission_callback' => \[\$this, 'check_auth'\],/.test(REST)
    && /if \(count\(\$log\) > 50\) \$log = array_slice\(\$log, -50\);/.test(h) && /wp_slash\(wp_json_encode\(\$log\)\)/.test(h), 'server: signed-in route, newest 50 kept, stored with wp_slash');

console.log('\nD · each mutation of the real source is caught');
const MUT = [
    ['refuse code too', "if (!t || !t.docChanged || !t.locked || t.migrating || !t.fromStudent) return { refuse: false };", "if (!t || !t.docChanged || !t.locked || t.migrating) return { refuse: false };"],
    ['refuse whole-document loads', "if (t.wholeDoc) return { refuse: false };", ''],
    ['protect every section, not just the locked ones', "if (n.type.name === 'sectionBlock' && types.indexOf(String((n.attrs && n.attrs.sectionType) || '')) !== -1) { out.push(n.textContent); return false; }", "if (n.type.name === 'sectionBlock') { out.push(n.textContent); return false; }"],
    ['judge attributes as writing (the edit-stamp regression)', 'out.push(n.textContent); return false; }', 'out.push(n.textContent + JSON.stringify(n.attrs)); return false; }'],
];
MUT.forEach(([name, from, to]) => {
    if (JS.split(from).length !== 2) { ok(false, name + ' — mutation anchor not found exactly once (the harness is stale)'); return; }
    let r;
    try { r = run(load(JS.replace(from, to)), false); } catch (e) { r = { fail: 1 }; }
    ok(r.fail > 0, name + ' → ' + r.fail + ' check(s) fail');
});

console.log('\n' + (total.fail ? '❌' : '✅') + ' display-guard-harness: ' + total.pass + ' passed, ' + total.fail + ' failed');
process.exit(total.fail ? 1 : 0);
