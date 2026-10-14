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
 *   A. VERDICT — refuses ONLY a student text change inside a locked section of a display lesson; lets through code,
 *                migrations, comment marks / attribute steps, whole-document loads, unlocked sections, other lessons.
 *   B. RANGE   — a ProseMirror-shaped document (real node sizes): a position inside the response / plan / outline is
 *                locked; Self-Assessment, Calibration and the gaps between sections are not; a range crossing into a
 *                locked section is locked; in a discuss-feedback lesson the feedback family is locked too.
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
    vm.runInContext(src.slice(B, E) + '\nthis.G = { _swmlDisplayGuardVerdict, _swmlRangeInSectionTypes };', ctx);
    return ctx.G;
}

// ── a ProseMirror-shaped document: nodeSize = text length | 2 + content; resolve() + nodesBetween() by position ──
function node(name, attrs, children, text) {
    const n = { type: { name }, attrs: attrs || {}, children: children || [], text: text || null };
    n.nodeSize = text != null ? text.length : 2 + n.children.reduce((s, c) => s + c.nodeSize, 0);
    return n;
}
const sec = (type, kids) => node('sectionBlock', { sectionType: type }, kids);
const para = (t) => node('paragraph', {}, [node('text', {}, [], t)]);
function makeDoc(children) {
    const d = node('doc', {}, children);
    d.content = { size: d.nodeSize - 2 };
    d.resolve = (pos) => {
        const path = [d];
        let n = d, start = 0;   // `start` = the position where n's content begins
        for (;;) {
            let off = start, next = null, nextStart = 0;
            for (const c of n.children) {
                const end = off + c.nodeSize;
                if (c.text == null && pos > off && pos < end) { next = c; nextStart = off + 1; break; }
                off = end;
            }
            if (!next) break;
            path.push(next); n = next; start = nextStart;
        }
        return { depth: path.length - 1, node: (k) => path[k] };
    };
    d.nodesBetween = (from, to, cb) => {
        (function walk(n, start) {
            let off = start;
            for (const c of n.children) {
                const end = off + c.nodeSize;
                if (end > from && off < to && c.text == null) { if (cb(c, off) !== false) walk(c, off + 1); }
                off = end;
            }
        })(d, 0);
    };
    return d;
}
// [plan "Plan — Q2"] [response] [action Self-Assessment] [feedback] — positions computed, never typed by hand.
const DOC = makeDoc([sec('plan', [para('plan text')]), sec('response', [para('my essay paragraph')]), sec('action', [para('rating 4')]), sec('feedback', [para('feedback')])]);
const at = (i) => { let p = 0; for (let k = 0; k < i; k++) p += DOC.children[k].nodeSize; return { start: p, end: p + DOC.children[i].nodeSize }; };
const inside = (i) => at(i).start + 3;   // section open + paragraph open + 1 char into the text
const LOCKED = ['response', 'plan', 'outline'];
const DISCUSS = LOCKED.concat(['feedback', 'scores', 'analytics', 'action', 'improvement']);

function run(G, verbose) {
    let pass = 0, fail = 0;
    const ok = (c, m) => { if (c) { pass++; if (verbose) console.log('  ✓ ' + m); } else { fail++; if (verbose) console.log('  ✗ ' + m); } };
    const say = (s) => { if (verbose) console.log(s); };
    const V = (o) => G._swmlDisplayGuardVerdict(Object.assign({ docChanged: true, locked: true, migrating: false, fromStudent: true,
        steps: [{ kind: 'replace', wholeDoc: false, touchesLocked: true }] }, o)).refuse;

    say('\nA · the verdict');
    ok(V({}) === true, 'a student text change inside the locked writing of a display lesson → refused');
    ok(V({ fromStudent: false }) === false, 'the same change from CODE (Sophia\'s fills, heals) → allowed');
    ok(V({ migrating: true }) === false, 'a migration → allowed (it owns the document)');
    ok(V({ locked: false }) === false, 'any other lesson (diagnostic, planning, polishing) → allowed');
    ok(V({ docChanged: false }) === false, 'a selection-only transaction → allowed');
    ok(V({ steps: [{ kind: 'other', touchesLocked: true }] }) === false, 'a comment mark ON the locked essay (mark / attribute steps only) → allowed — tutor and student comments stay live');
    ok(V({ steps: [{ kind: 'replace', wholeDoc: true, touchesLocked: true }] }) === false, 'a whole-document load (setContent) → allowed — code, never a keystroke');
    ok(V({ steps: [{ kind: 'replace', wholeDoc: false, touchesLocked: false }] }) === false, 'typing in an unlocked section (Self-Assessment, Calibration) → allowed');
    ok(V({ steps: [{ kind: 'other' }, { kind: 'replace', touchesLocked: false }, { kind: 'replace', touchesLocked: true }] }) === true, 'one locked step among several → refused');

    say('\nB · the range, on real ProseMirror positions');
    const R = (a, b, types) => G._swmlRangeInSectionTypes(DOC, a, b, types || LOCKED);
    ok(R(inside(1), inside(1)) === true, 'a caret inside the response → locked');
    ok(R(inside(0), inside(0)) === true, 'a caret inside the plan → locked');
    ok(R(inside(2), inside(2)) === false && R(inside(3), inside(3)) === false, 'Self-Assessment and Feedback → not locked in an assessment lesson');
    ok(R(at(2).start, at(2).start) === false, 'the gap between two sections → not locked');
    ok(R(inside(2), inside(3)) === false, 'a range across Self-Assessment and Feedback → not locked');
    ok(R(inside(2) - 6, inside(2)) === true, 'a range that starts inside the response and ends in Self-Assessment → locked');
    ok(R(at(0).start, at(2).end) === true, 'a range that swallows a whole locked section → locked (nodesBetween)');
    ok(R(inside(3), inside(3), DISCUSS) === true && R(inside(2), inside(2), DISCUSS) === true, 'discuss-feedback lesson: the feedback family is locked too');
    ok(DOC.content.size === DOC.children.reduce((s, c) => s + c.nodeSize, 0) && DOC.resolve(inside(1)).depth === 2, 'the document model has real sizes and depths');
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
ok(/if \(st !== 'replace' && st !== 'replaceAround'\) return \{ kind: 'other' \};/.test(lockSrc) && /wholeDoc: s\.from <= 0 && s\.to >= d\.content\.size/.test(lockSrc)
    && /touchesLocked: _swmlRangeInSectionTypes\(d, s\.from, s\.to, lockedTypes\)/.test(lockSrc), 'each step is judged against the document it applies to (tr.docs[i])');
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
    ['refuse whole-document loads', "if (reps.some((s) => s.wholeDoc)) return { refuse: false };", ''],
    ['treat marks as text', "const reps = (t.steps || []).filter((s) => s && s.kind === 'replace');", "const reps = (t.steps || []).filter((s) => s);"],
    ['miss a range that crosses into a locked section', 'if (inType(from) || inType(to)) return true;', 'if (inType(from)) return true; return false;'],
];
MUT.forEach(([name, from, to]) => {
    if (JS.split(from).length !== 2) { ok(false, name + ' — mutation anchor not found exactly once (the harness is stale)'); return; }
    let r;
    try { r = run(load(JS.replace(from, to)), false); } catch (e) { r = { fail: 1 }; }
    ok(r.fail > 0, name + ' → ' + r.fail + ' check(s) fail');
});

console.log('\n' + (total.fail ? '❌' : '✅') + ' display-guard-harness: ' + total.pass + ' passed, ' + total.fail + ' failed');
process.exit(total.fail ? 1 : 0);
