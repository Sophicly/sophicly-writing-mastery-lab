#!/usr/bin/env node
/* eslint-env node */
/**
 * structure-lock-harness.js — a student can never delete a box (section / input field / outline row) in
 * any WML document, and Cmd+Z can never unpick the document itself. (v7.20.751, FIXLIST #790.)
 *
 * WHY THIS EXISTS. Neil, 8 Oct 2026: "It should not be possible for students to delete rows. for
 * planning or responses on any of the documents." Mahika's AQA P1 diagnostic had lost its Q1 Point 2.
 * Reproduced on staging .748 (test student 1938, real Chromium, 21 routes): 19 were already refused,
 * but Cmd+Z on a freshly opened document went 47 sections / 62 boxes → 0 / 0 in five presses — the
 * load, the heals and Sophia's fills were in the student's undo history, and the old Section Guard
 * "reverted" with undo(), which dug deeper still. The lock (wml-assessment.js, fenced
 * @STRUCTURE-LOCK-PURE) decides every transaction BEFORE it applies:
 *   A · its decision table, executed on real-shaped documents (Mahika's case, the wipe, the resurrected
 *       rows, a count-neutral swap, code fills, migrations)
 *   B · the walk never descends into inline content (cost: a few hundred nodes per keystroke)
 *   C · three planted defects — each must be caught, or this harness is testing nothing
 *   D · the wiring: installed on the ONE live editor before any load, the stamp collector unchanged,
 *       the Section Guard never undo()s while the lock is on, no migration flag left set by a throw
 * The behaviour in a real browser is proven by the staging probe ~/.sophicly/probe/wml-331/
 * w333-repro.mjs (21 routes) + w333-undo.mjs (Cmd+Z press by press) — re-run both after any change here.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const fb = SRC.indexOf('// @STRUCTURE-LOCK-PURE-BEGIN'), fe = SRC.indexOf('// @STRUCTURE-LOCK-PURE-END');
if (fb < 0 || fe < fb) { console.error('✗ the @STRUCTURE-LOCK-PURE fence is missing from wml-assessment.js'); process.exit(1); }
const FENCE = SRC.slice(fb, fe);
const load = (src) => new Function(src + '\nreturn { _swmlBoxShape, _swmlBoxesLost, _swmlStructureLockVerdict, SWML_LOCK_USER_EVENTS, SWML_LOCK_USER_WINDOW_MS };')();   // eslint-disable-line no-new-func

// ── real-shaped documents (ProseMirror's descendants contract: return false = skip the children) ──
const TYPES = ['sectionBlock', 'inputField', 'outlineRow'];
const node = (name, attrs, children, textblock) => ({ type: { name }, attrs: attrs || {}, children: children || [], isTextblock: !!textblock });
const text = (t) => ({ type: { name: 'text' }, attrs: {}, children: [], isTextblock: false, text: t });
const field = (id, t) => node('inputField', { fieldId: id, prompt: id }, [text(t || '')], true);
const row = (id, t) => node('outlineRow', { fieldId: id }, [text(t || '')], true);
const para = (t) => node('paragraph', {}, [text(t || '')], true);
const section = (label, kids) => node('sectionBlock', { label }, kids);
function doc(children) {
    const d = node('doc', {}, children);
    d.visited = 0;
    d.descendants = function (cb) { (function walk(n) { for (const c of n.children) { d.visited++; if (cb(c) !== false) walk(c); } })(d); };
    return d;
}
const q1 = (ids, txt) => section('Q1 Response', ids.map(i => field('Q1-point-' + i, (txt || 'The bird') + ' ' + i)));
const rest = () => [section('Q2 Plan', [field('plan-Q2-para-1', 'plan'), field('plan-Q2-para-2', '')]), section('Q2 Response', [field('Q2-response', 'answer')]),
    section('Outline', [row('outline-Q3-p1-e1', 'topic'), row('outline-Q3-p1-e2', '')]), section('Notes', [para('free writing')])];
const D = {
    base:   () => doc([section('About', [para('read me')]), q1([1, 2, 3, 4]), ...rest()]),
    edited: () => doc([section('About', [para('read me')]), q1([1, 2, 3, 4], 'Changed'), ...rest()]),
    noP2:   () => doc([section('About', [para('read me')]), q1([1, 3, 4]), ...rest()]),                 // Mahika's document
    swap:   () => doc([section('About', [para('read me')]), q1([1, 1, 3, 4]), ...rest()]),              // count kept, Point 2 gone
    empty:  () => doc([para('')]),                                                                       // press 5 of the wipe
    retired:() => doc([section('About', [para('read me')]), q1([1, 2, 3, 4]), ...rest(), section('Old', [field('retired-1', ''), field('retired-2', '')])]),
    noRows: () => doc([section('About', [para('read me')]), q1([1, 2, 3, 4]), section('Q2 Plan', [field('plan-Q2-para-1', 'plan'), field('plan-Q2-para-2', '')]),
                       section('Q2 Response', [field('Q2-response', 'answer')]), section('Outline', []), section('Notes', [para('free writing')])]),
};

function suite(L, label) {
    const shape = (d) => L._swmlBoxShape(d, TYPES);
    const verdict = (o) => L._swmlStructureLockVerdict(Object.assign({ docChanged: true, isHistory: false, fromStudent: true, migrating: false, histMeta: undefined }, o,
        { shapeBefore: () => shape(o.before()), shapeAfter: () => shape(o.after()) }));
    const R = [];
    const t = (cond, msg) => R.push([!!cond, msg]);
    let v;
    v = verdict({ before: D.base, after: D.edited });
    t(v.allow && !v.markNotUndoable, 'the student typing in a box: allowed, and it stays undoable');
    v = verdict({ before: D.base, after: D.noP2 });
    t(!v.allow && v.refused === 'student', 'the student removing Q1 Point 2 (Mahika\'s document): REFUSED');
    v = verdict({ before: D.base, after: D.swap });
    t(!v.allow, 'a count-neutral swap (Point 2 gone, a second Point 1 in its place): REFUSED by field id');
    v = verdict({ before: D.base, after: D.noRows });
    t(!v.allow, 'the student removing outline rows: REFUSED');
    v = verdict({ before: D.base, after: D.empty, isHistory: true });
    t(!v.allow && v.refused === 'undo/redo', 'Cmd+Z that would empty the document (press 5 on staging): REFUSED');
    v = verdict({ before: D.base, after: D.retired, isHistory: true });
    t(!v.allow, 'Cmd+Z that would bring retired rows back (presses 3–4 on staging): REFUSED');
    v = verdict({ before: D.edited, after: D.base, isHistory: true });
    t(v.allow && !v.markNotUndoable, 'Cmd+Z that only changes text: allowed, history meta untouched');
    v = verdict({ before: D.base, after: D.edited, fromStudent: false });
    t(v.allow && v.markNotUndoable, 'a code fill (Sophia, a heal) that only changes text: allowed but kept OUT of undo history');
    v = verdict({ before: D.base, after: D.noP2, fromStudent: false, migrating: true });
    t(v.allow && v.markNotUndoable, 'a migration removing a box: allowed (code owns the boxes) and not undoable');
    v = verdict({ before: D.base, after: D.retired, fromStudent: true, migrating: true });
    t(v.allow && v.markNotUndoable, 'a migration inside the student\'s input window: still kept out of undo history');
    v = verdict({ before: D.base, after: D.noP2, fromStudent: false });
    t(!v.allow && v.refused === 'code', 'code removing a box WITHOUT the migration flag: REFUSED (as the Section Guard did)');
    v = verdict({ before: D.base, after: D.edited, fromStudent: false, histMeta: false });
    t(v.allow && !v.markNotUndoable, 'code that already set addToHistory:false: left exactly as it was (not re-marked)');
    v = verdict({ before: D.base, after: D.retired, fromStudent: false });
    t(v.allow && v.markNotUndoable, 'code ADDING boxes (a heal): allowed, not undoable');
    v = verdict({ before: D.base, after: D.base, docChanged: false });
    t(v.allow && !v.markNotUndoable, 'a selection-only transaction: allowed, untouched');
    // B — the walk skips inline content: a box-named node INSIDE a textblock is never counted or visited
    const trap = doc([section('S', [node('paragraph', {}, [node('inputField', { fieldId: 'ghost' }, [], true)], true)])]);
    const ts = L._swmlBoxShape(trap, TYPES);
    t(ts.n === 1 && !ts.ids.ghost && trap.visited === 2, 'the walk never enters inline content (visited ' + trap.visited + ' nodes, ghost box unseen)');
    const big = D.base(); L._swmlBoxShape(big, TYPES);
    t(big.visited <= 30, 'a full document walks only its blocks (' + big.visited + ' nodes)');
    t(Array.isArray(L.SWML_LOCK_USER_EVENTS) && ['keydown', 'beforeinput', 'compositionend', 'paste', 'drop', 'touchstart'].every(e => L.SWML_LOCK_USER_EVENTS.indexOf(e) !== -1),
        'student input events include keyboard, typing, IME, paste, drop and touch (iPad)');
    t(L.SWML_LOCK_USER_WINDOW_MS > 0 && L.SWML_LOCK_USER_WINDOW_MS <= 500, 'the student-input window is short (' + L.SWML_LOCK_USER_WINDOW_MS + ' ms) — Sophia\'s fills arrive seconds later');
    return R;
}

console.log('\nA+B · the decision table, executed');
for (const [c, m] of suite(load(FENCE))) ok(c, m);

console.log('\nC · planted defects — each must be caught');
const PLANT = [
    ['an undo may ADD boxes (history checked like a student edit)', 'const changed = t.isHistory ? (lost || _swmlBoxesLost(after, before)) : lost;', 'const changed = lost;'],
    ['boxes counted but field ids ignored', 'if (id) ids[id] = (ids[id] || 0) + 1;', ''],
    ['code fills left in the student\'s undo history', '(t.migrating || !t.fromStudent)', '(t.migrating)'],
];
for (const [name, from, to] of PLANT) {
    if (FENCE.indexOf(from) < 0) { ok(false, 'plant "' + name + '": its anchor is gone from the fence — update the harness'); continue; }
    const caught = suite(load(FENCE.replace(from, to))).some(([c]) => !c);
    ok(caught, 'planted defect caught: ' + name);
}

console.log('\nD · the wiring');
const installRe = /_structureLockOn = _installStructureLock\(canvasEditor, _PROTECTED_NODE_TYPES\);/g;
const installs = SRC.match(installRe) || [];
ok(installs.length === 1, 'the lock is installed exactly once (found ' + installs.length + ')');
const mainEd = SRC.indexOf('canvasEditor = new Editor({'), inst = SRC.search(installRe), prePop = SRC.indexOf('const tryCwPrePopulate = async');
ok(mainEd > 0 && inst > mainEd && prePop > inst, 'installed straight after the main editor is built, before any server load or pre-population');
ok(/const _PROTECTED_NODE_TYPES = \['sectionBlock', 'inputField', 'outlineRow'\];/.test(SRC), 'the boxes: sectionBlock, inputField, outlineRow (the Section Guard\'s own list)');
ok(/if \(v\.markNotUndoable\) \{ tr\.setMeta\('addToHistory', false\); tr\.setMeta\('swmlLockHist', true\); \}/.test(SRC), 'a code transaction is marked addToHistory:false AND swmlLockHist');
ok(/isHistory: !!\(hist && tr\.getMeta\(hist\)\)/.test(SRC) && /pl\.key\.indexOf\('history\$'\) === 0/.test(SRC), 'an undo/redo is recognised by the history plugin\'s own meta');
ok(/transaction\.getMeta\('addToHistory'\) === false && !transaction\.getMeta\('swmlLockHist'\)/.test(SRC), 'the edit-time stamp collector ignores the lock\'s own mark (stamping unchanged)');
const otx = SRC.indexOf('onTransaction: ({ editor, transaction }) => {');
const gLock = SRC.indexOf('if (newCount < _sectionCount && _structureLockOn)', otx), gUndo = SRC.indexOf('editor.commands.undo();', otx);
ok(otx > 0 && gLock > otx && gUndo > gLock && gUndo - gLock < 900, 'the Section Guard never undo()s while the lock is on (its undo is the fallback only)');
const editors = (SRC.match(/= new Editor\(\{/g) || []).length;
const epCallers = (SRC.match(/renderExamPrepCanvas\(/g) || []).length - 1;   // minus its definition
ok(editors === 2 && epCallers === 0, 'one live editor: the only other new Editor() is renderExamPrepCanvas, which nothing calls (' + editors + ' editors, ' + epCallers + ' callers) — wire it up and it needs the lock too');
const bare = [];
SRC.split('\n').forEach((ln, i, all) => {
    if (!/^\s*_migrationActive = true;/.test(ln)) return;
    const tryNear = /\btry\b/.test(all[i - 1] + all[i + 1] + all[i + 2]);                       // opened just before, or just after
    let released = false;                                                                        // a finally resets it before the next set
    for (let j = i + 1; j < Math.min(all.length, i + 120); j++) {
        if (/^\s*_migrationActive = true;/.test(all[j])) break;
        if (/finally/.test(all[j]) && /_migrationActive = /.test(all[j] + all[j + 1])) { released = true; break; }
    }
    if (!(tryNear && released)) bare.push(i + 1);
});
ok(bare.length === 0, 'every _migrationActive = true is released in a finally (a throw cannot leave the lock bypassed)' + (bare.length ? ' — bare at ' + bare.join(', ') : ''));

console.log('\n' + (fail ? '✗ structure-lock-harness: ' + fail + ' failed, ' + pass + ' passed' : '✅ structure-lock-harness passed (' + pass + ' assertions)'));
process.exit(fail ? 1 : 0);
