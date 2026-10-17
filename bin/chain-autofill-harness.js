#!/usr/bin/env node
/* eslint-env node */
/**
 * chain-autofill-harness.js — v7.20.926 (FIXLIST autofill-never-replaces-outline-writing).
 *
 * WHAT HAPPENED. Neil, 17 Oct, about Mishel 1237: "she's got information in the outline already. So how's that going to
 * work when she transfers from her planning to her outlining?" MEASURED on prod: her Outline lesson holds her own
 * sentences (Q2 ¶2, 7/7, edited 16:36) while her planning document holds older notes (16:05). Sophia's plan-approval fill
 * was stamped like a student edit, so newest-edit-wins would have REPLACED her sentences with the new plan. Neil chose
 * "Keep what she wrote": an automatic fill never replaces a student's writing; it fills empty boxes only. A student's
 * own later edit in an earlier lesson still flows forward (the July STAGE-RECORD law, "sky is green").
 *
 * WHAT THIS PROVES, from the shipped file:
 *   A. the rule (@CHAIN-ARBITRATE-PURE, executed): Mishel's case, the July case, the untouched-mirror case, legacy data
 *   B. the wiring: fills stamp fillTs (never editTs); both mirror paths decide through the rule and carry fillTs;
 *      a protected section fills only its empty boxes
 *
 * Usage: node bin/chain-autofill-harness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = js.indexOf('/* @CHAIN-ARBITRATE-PURE-START'); const e = js.indexOf('/* @CHAIN-ARBITRATE-PURE-END */');
if (b < 0 || e < b) { console.log('✗ the @CHAIN-ARBITRATE-PURE block is missing'); process.exit(1); }
const _pure = new Function(js.slice(b, e) + '\nreturn { arb: _chainArbitrate, box: _protectedBoxWrite };')();
const arb = _pure.arb, box = _pure.box;

console.log('\nA · the rule');
const T = (h, m) => Date.UTC(2026, 9, 8, h, m);   // 8 Oct 2026, Mishel's edits
const NOW = Date.UTC(2026, 9, 17, 10, 0);
ok(arb(T(16, 5), NOW, T(16, 36), 0) === 'protect', '⭐ Mishel Q2 ¶2: her Outline-lesson sentences (16:36) are KEPT when the plan is approved later — only empty boxes fill');
ok(arb(T(16, 5), 0, T(16, 36), 0) === 'keep', 'with no new fill, her newer writing stays (unchanged)');
ok(arb(T(17, 0), 0, T(16, 36), 0) === 'replace', '⭐ July law: the student edits the EARLIER lesson after the later one ("sky is green") → it flows forward');
ok(arb(T(17, 0), NOW, T(16, 36), 0) === 'replace', '…even when Sophia also filled upstream after (the student\'s own edit is newer than hers here)');
ok(arb(T(15, 46), NOW, T(15, 46), 0) === 'replace', '⭐ an untouched mirror (same edit time carried) takes the refined plan — raw dictation is replaced, as designed');
ok(arb(0, NOW, 0, T(12, 0)) === 'replace', 'a copy that only ever held Sophia\'s fills takes her newer fill');
ok(arb(0, T(12, 0), 0, T(12, 0)) === 'keep', 'the same fill seen again does nothing (idempotent)');
ok(arb(0, T(12, 0), T(13, 0), 0) === 'keep', 'an older fill never touches newer student writing');
ok(arb(T(10, 0), 0, T(10, 0), 0) === 'keep' && arb(0, 0, 0, 0) === 'keep', 'equal / unstamped legacy content keeps the local copy (never delete what might be student work)');
ok(arb(undefined, undefined, T(9, 0), undefined) === 'keep', 'missing stamps read as 0');

console.log('\nA2 · what a protected box gets (v7.20.929 — Neil: "Sophia\'s automatic fill needs to go underneath it")');
ok(box('', 'Refined plan 2') === 'fill', 'an empty box takes the fill');
ok(box('Her own sentence about Fleming.', 'REFINED PLAN 2') === 'append', '⭐ a box holding her writing keeps it, and the fill goes UNDERNEATH');
ok(box('Her own sentence. REFINED PLAN 2', 'refined  plan 2') === null, '⭐ already underneath (case/space-insensitive) → nothing added, so a reload never stacks a second copy');
ok(box('Her sentence', '') === null && box('Her sentence', null) === null, 'no fill text → nothing to add');
ok(box('  ', 'x') === 'fill', 'whitespace-only counts as empty');

console.log('\nB · the wiring');
ok((js.match(/fillTs: \{\s*default: 0,\s*parseHTML: el => parseInt\(el\.getAttribute\('data-fill-ts'\) \|\| '0', 10\) \|\| 0,\s*renderHTML: attrs => attrs\.fillTs \? \{ 'data-fill-ts': String\(attrs\.fillTs\) \} : \{\},/g) || []).length === 2,
    'sections AND fields carry fillTs, and it saves (renderHTML) and reloads (parseHTML)');
ok(/function applyFieldCommits\(aiReply, studentMsg, history\) \{\s*_autoFillDepth\+\+;\s*try \{ return _applyFieldCommitsInner\(aiReply, studentMsg, history\); \} finally \{ _autoFillDepth--; \}/.test(js),
    'field commits run as an automatic fill (try/finally — a throw can never leave the flag on)');
ok(/function _applyFieldValueSets\(sets, opts\) \{\s*_autoFillDepth\+\+;\s*try \{ return _applyFieldValueSetsInner\(sets, opts\); \} finally \{ _autoFillDepth--; \}/.test(js),
    'field sets — and the plan→outline fan-out they call — run as an automatic fill');
ok(/if \(isPlan\) _planFanoutToOutline\(s\.field, s\.value, _live\);/.test(js) && js.indexOf('function _applyFieldValueSetsInner(') < js.indexOf('if (isPlan) _planFanoutToOutline(s.field'),
    'the fan-out is reached only from inside _applyFieldValueSets');
ok(/const ids = _autoFillDepth > 0\s*\? \(_fillTsPendingIds \|\| \(_fillTsPendingIds = new Set\(\)\)\)\s*: \(_editTsPendingIds \|\| \(_editTsPendingIds = new Set\(\)\)\);/.test(js),
    '⭐ the stamp collector sends Sophia\'s fills to fillTs, never editTs');
ok(/updates\.push\(\{ pos, attrs: node\.attrs, k: 'fillTs' \}\)/.test(js) && /tr\.setNodeMarkup\(u\.pos, null, \{ \.\.\.u\.attrs, \[u\.k\]: now \}\)/.test(js), 'the flush stamps each kind into its own attribute');
ok(/const _fv = _chainArbitrate\(upFields\[fid\]\.ts, upFields\[fid\]\.fts, _ta\.editTs, _ta\.fillTs\);\s*if \(_fv === 'keep'\) return;/.test(js), 'the FIELD mirror (plan boxes, scene rows) decides through the rule');
ok(/if \(_fv === 'protect'\) \{\s*if \(_protectedBoxWrite\(cur, upFields\[fid\]\.text\) !== 'append'\) return;\s*_appendUnder = true;/.test(js)
    && /tr\.insert\(targetPos \+ targetNode\.nodeSize - 1, add\);\s*\/\/ her edit time stays hers[^\n]*\n\s*tr\.setNodeMarkup\(targetPos, null, \{ \.\.\.targetNode\.attrs, fillTs: upFields\[fid\]\.fts \|\| 0 \}\);/.test(js),
    '⭐ a protected FIELD keeps her writing, gets the fill appended at its END, keeps her editTs and records the fill time');
ok(/const _v = _chainArbitrate\(cand\.ts, cand\.fts, tNode\.attrs && tNode\.attrs\.editTs, tNode\.attrs && tNode\.attrs\.fillTs\);/.test(js)
    && /if \(_v === 'protect'\) \{ if \(_fillEmptyBoxes\(tPos, tNode, cand\)\) n\+\+; guarded\+\+; return; \}/.test(js),
    'the SECTION mirror (outline) decides through the rule; protect fills empty boxes only');
ok(/editTs: upFields\[fid\]\.ts, fillTs: upFields\[fid\]\.fts \|\| 0/.test(js) && /editTs: cand\.ts, fillTs: cand\.fts \|\| 0/.test(js), 'a mirrored copy carries BOTH times of its origin (never "now")');
const fe = js.indexOf('const _fillEmptyBoxes = (tPos, tNode, cand) => {');
const feb = fe >= 0 ? js.slice(fe, js.indexOf('const _mirrorSections =', fe)) : '';
ok(/const how = _protectedBoxWrite\(c\.textContent \|\| '', upText\[id\]\);/.test(feb), '⭐ each box of a protected section is decided by _protectedBoxWrite (fill empty · append under hers · nothing)');
ok(/if \(w\.how === 'append'\) \{[\s\S]*?tr\.insert\(w\.at \+ w\.size - 1, add\);[\s\S]*?\} else \{\s*tr\.replaceWith\(w\.at \+ 1, w\.at \+ w\.size - 1/.test(feb),
    '⭐ an append INSERTS at the box\'s end (her text untouched); only an empty box is replaced');
ok(/_migrationActive = true;[\s\S]*finally \{ _migrationActive = false; \}/.test(feb) && /tr\.setMeta\('swmlEditTs', 1\); tr\.setMeta\('addToHistory', false\);/.test(feb),
    'the fill runs as a migration (structure lock passes it), is never stamped as an edit, and is not undoable');
ok(/fillTs: cand\.fts \|\| 0 \}\);/.test(feb), 'it records the fill time so the next load does nothing');
ok(!/CSS\.escape/.test(feb), 'no CSS.escape in attribute lookups (WML rule)');
ok(/const _freezeStage = \['assessment', 'redraft_assessment', 'feedback_discussion'\]\.indexOf\(state\.task\) !== -1;\s*const _docMarked = _freezeStage && /.test(js)
    && /const out = new Set\(\);\s*if \(!_freezeStage\) return out;/.test(js),
    '⭐ only a MARKED lesson freezes — carried Phase-1 marks in a plan/outline/polish document never block the plan reaching the outline (Mishel\'s outline was frozen)');

console.log('\n' + (fail ? 'FAILED' : 'PASSED') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
