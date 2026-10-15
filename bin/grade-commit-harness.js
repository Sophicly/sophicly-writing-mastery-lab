#!/usr/bin/env node
/* eslint-env node */
/**
 * grade-commit-harness.js — v7.20.895 (WML 360 A; Neil, 15 Oct: "make sure those are actually working").
 *
 * MEASURED before the fix (staging, test student 1938, Edexcel IGCSE Language A Paper 2, a full marking run): Q1 9/30,
 * Q2 24/30, Overall Feedback, Score Summary 33/60 — and NO grade recorded. recalculateScoreSummary only committed when the
 * document held `_fbCount >= 5` feedback sections (a Literature essay's Introduction + 3 Body + Conclusion), counting the
 * two that carry no mark. A two-question paper holds four. Prod sweep the same day: every assessment document there has
 * five or more marked boxes, so no real student had been hit yet — Maysa 1279 would have been the first.
 *
 * What it proves, from the SHIPPED code (sentinel slice + source checks):
 *   A. DECISION — gradeCommitReady, executed on the measured shapes: IGCSE P2 and Cambridge P2 (two questions) commit;
 *                 a Literature essay commits; a part-marked paper, a paper missing a box, a reviewer, an unsettled
 *                 attempt, a paper not marked in this chat and an already-committed paper do not.
 *   B. NO REGRESSION — the older documents the sweep found (box total ≠ the Score Summary's paper total, five sections)
 *                 still commit, and a document with no paper total falls back to the five-section rule.
 *   C. WIRING   — recalculateScoreSummary asks gradeCommitReady; the box total is taken BEFORE the audited override;
 *                 the paper total is read from the document's own "Grade Boundaries (/N)"; the old inline test is gone;
 *                 a held commit and a total mismatch both warn; the template still writes the heading.
 *   D. FALSIFY  — four mutations of the decision each fail A or B.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

const SB = '    // @GRADE-COMMIT-PURE-BEGIN', SE = '    // @GRADE-COMMIT-PURE-END';
function load(src) {
    const B = src.indexOf(SB), E = src.indexOf(SE);
    if (!(B > 0 && E > B)) throw new Error('GRADE-COMMIT sentinels missing');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src.slice(B, E) + '\nthis.gradeCommitReady = gradeCommitReady;', ctx);
    return ctx.gradeCommitReady;
}

// A finished, settled student session — each case overrides only what makes it different.
const base = { isEssay: true, reviewMode: false, attemptSettled: true, committed: false, committing: false, allSet: true, markedHere: true };
const CASES = [
    // [label, input, expect ready, expect why]
    ['IGCSE A P2 — two marked questions, 4 feedback sections, 60/60 (the measured document)', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60 }, true, 'covers-paper'],
    ['Cambridge IGCSE P2 — two marked questions (same shape)', { marked: 2, fbCount: 4, boxMax: 50, paperMax: 50 }, true, 'covers-paper'],
    ['AQA Shakespeare essay — 5 boxes, 7 sections, 34/34', { marked: 5, fbCount: 7, boxMax: 34, paperMax: 34 }, true, 'covers-paper'],
    ['AQA Language P1 — 5 questions, 80/80', { marked: 5, fbCount: 7, boxMax: 80, paperMax: 80 }, true, 'covers-paper'],
    ['IGCSE P2 part-marked (Q2 still "—")', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, allSet: false }, false, 'part-marked'],
    ['a paper MISSING a box — one 30-mark box of a 60-mark paper, 3 sections', { marked: 1, fbCount: 3, boxMax: 30, paperMax: 60 }, false, 'short-of-paper'],
    ['a reviewer opening the finished paper', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, reviewMode: true }, false, 'review'],
    ['attempt not yet settled (load window)', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, attemptSettled: false }, false, 'attempt-unsettled'],
    ['marks carried from an earlier phase, not marked in this chat', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, markedHere: false }, false, 'not-marked-in-this-chat'],
    ['already committed', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, committed: true }, false, 'done'],
    ['not an assessment task', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 60, isEssay: false }, false, 'not-assessment'],
    ['no mark-bearing box', { marked: 0, fbCount: 2, boxMax: 0, paperMax: 60 }, false, 'no-marks'],
    // B — the older documents the 15 Oct sweep found: they commit today and must keep committing.
    ['older doc, boxes 21 vs paper 40, five sections (staging edexcel_romeo_juliet shape)', { marked: 5, fbCount: 7, boxMax: 21, paperMax: 40 }, true, 'five-sections'],
    ['older doc, boxes 81 vs paper 80 (prod AQA Language shape)', { marked: 5, fbCount: 7, boxMax: 81, paperMax: 80 }, true, 'covers-paper'],
    ['legacy doc with no paper total, five sections', { marked: 5, fbCount: 7, boxMax: 30, paperMax: 0 }, true, 'five-sections'],
    ['legacy doc with no paper total, four sections — held, never a guessed grade', { marked: 2, fbCount: 4, boxMax: 60, paperMax: 0 }, false, 'short-of-paper'],
];

function run(fn, quiet) {
    const bad = [];
    for (const [label, over, wantReady, wantWhy] of CASES) {
        const r = fn(Object.assign({}, base, over)) || {};
        const good = r.ready === wantReady && r.why === wantWhy;
        if (!good) bad.push(label + ' → ' + JSON.stringify(r));
        if (!quiet) ok(good, (wantReady ? 'commits: ' : 'holds:   ') + label + (good ? '' : '  GOT ' + JSON.stringify(r)));
    }
    return bad;
}

console.log('A+B. gradeCommitReady, executed on the measured shapes');
const fn = load(JS0);
run(fn, false);
const held = fn(Object.assign({}, base, { marked: 1, fbCount: 3, boxMax: 30, paperMax: 60 }));
ok(held.held === true, 'a held commit says so (held:true) — the caller warns instead of staying silent');

console.log('C. wiring');
const rs = JS0.slice(JS0.indexOf('        function recalculateScoreSummary() {'), JS0.indexOf('        // v7.19.247: expose recalc + paint dates once now.'));
ok(rs.length > 2000, 'recalculateScoreSummary found');
ok(/markedBoxes\+\+/.test(rs) && /const boxMax = maxTotal;/.test(rs), 'it counts the mark-bearing boxes and keeps their total');
ok(rs.indexOf('const boxMax = maxTotal;') > -1 && rs.indexOf('const boxMax = maxTotal;') < rs.indexOf('_lastAuditedResult && _lastAuditedResult.docKey'),
    'the box total is taken BEFORE the audited override replaces maxTotal');
ok(/\/Grade Boundaries \\\(\\\/\(\\d\+\)\\\)\/\.exec\(scoreSection\.textContent/.test(rs), 'the paper total is read from the document\'s own "Grade Boundaries (/N)"');
ok(/const _gc = gradeCommitReady\(\{[\s\S]{0,400}marked: markedBoxes, boxMax: boxMax, paperMax: _paperMax, allSet: allSet,[\s\S]{0,120}fbCount: _fbCount/.test(rs),
    'recalculateScoreSummary asks gradeCommitReady with the document\'s numbers');
ok(/if \(_gc\.ready && maxTotal > 0\) \{[\s\S]{0,900}_autoCommitAssessment\(totalMarks, maxTotal,/.test(rs), 'a ready decision commits through _autoCommitAssessment');
ok(!/allSet && _fbCount >= 5/.test(rs) && !/_fbCount >= 5 && maxTotal > 0/.test(rs), 'the old inline "fbCount >= 5" whole-paper test is gone');
ok(/else if \(_gc\.held && !state\._gradeCommitHeldWarned\) \{[\s\S]{0,200}console\.warn\('WML grade commit HELD/.test(rs), 'a held commit warns (once), never silence');
ok(/boxMax !== _paperMax && !state\._gradeCommitDriftWarned\) \{[\s\S]{0,200}console\.warn\('WML grade commit: the marked boxes add up to/.test(rs), 'a box total that disagrees with the paper total warns (once)');
ok(/let gradeRef = `<h3>Grade Boundaries \(\/\$\{marks\}\)<\/h3>`;/.test(JS0), 'buildScoresSection still writes "Grade Boundaries (/N)" — the heading the decision reads');
ok((JS0.match(/function gradeCommitReady\(/g) || []).length === 1, 'ONE decision function');

console.log('D. falsify — each mutation must break A or B');
const MUT = [
    ['the old rule only (fbCount >= 5)', (s) => s.replace("if (coversPaper || d.fbCount >= 5) return", "if (d.fbCount >= 5) return")],
    ['the paper rule only (older docs stop committing)', (s) => s.replace("if (coversPaper || d.fbCount >= 5) return", "if (coversPaper) return")],
    ['no part-marked check', (s) => s.replace("if (!d.allSet) return { ready: false, why: 'part-marked' };", '')],
    ['any marked box counts as the whole paper', (s) => s.replace('const coversPaper = d.paperMax > 0 && d.boxMax >= d.paperMax;', 'const coversPaper = d.boxMax > 0;')],
];
for (const [label, mut] of MUT) {
    const src = mut(JS0);
    if (src === JS0) { ok(false, 'mutation did not apply: ' + label); continue; }
    let bad;
    try { bad = run(load(src), true); } catch (e) { bad = ['threw ' + e.message]; }
    ok(bad.length > 0, 'mutation caught: ' + label + (bad.length ? ' (' + bad.length + ' case' + (bad.length === 1 ? '' : 's') + ' fail)' : ' — NOT CAUGHT'));
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
