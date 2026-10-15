#!/usr/bin/env node
/* eslint-env node */
/**
 * planning-progress-harness.js — v7.20.902 (Neil, Actions round ae card 6: "they have to finish all the planning first").
 *
 * MEASURED on prod 15 Oct (read-only, 9 real planning docs): the planning lesson's Document Progress counted "Q1 Response" /
 * "Q1 Statements" — answers authored in the diagnostic and in Outlining/Polishing (PEDAGOGY §6) — so a fully planned
 * document could never read 100%, and the Mark Complete gate could not be switched on for planning.
 *
 *   A. The REAL _computeAssessmentProgress (sliced from wml-assessment.js), on the section lists measured on prod:
 *      planning counts plan + notes only; every plan box filled = 100% even with Q1 unanswered; a missing plan box or a
 *      missing prediction still holds it below 100%; other lessons are unchanged (a diagnostic still counts its answers).
 *   B. Falsify — each mutation must fail A.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const JS0 = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

function grab(src, start, endMarker) {
    const a = src.indexOf(start); if (a < 0) throw new Error('missing ' + start);
    const b = src.indexOf(endMarker, a); if (b < 0) throw new Error('missing end for ' + start);
    return src.slice(a, b);
}
function load(src) {
    const code = grab(src, '    const LESSON_AUTHORS = ', '    // v7.19.501: house percentage ramp');
    const ctx = { WML: { state: { task: '' } }, _isFirstDiagnostic: () => false, _saWalkRunsHere: () => true };
    vm.createContext(ctx);
    vm.runInContext(code + '\nthis.compute = _computeAssessmentProgress;', ctx);
    return (task, secs) => {
        ctx.WML.state.task = task;
        const nodes = secs.map(([label, type, done, locked]) => ({
            offsetParent: {}, classList: { contains: c => c === 'swml-task-locked' && !!locked },
            getAttribute: a => (a === 'data-section-type' ? type : a === 'data-section-label' ? label : a === 'data-section-complete' ? String(!!done) : null),
        }));
        return ctx.compute({ querySelectorAll: () => nodes });
    };
}
// AQA Lang P1 planning, the shape measured on 1352's doc (prod 15 Oct) — every plan box done, Q1 unanswered.
const P1_ALL_PLANNED = [['Predictions: This Paper', 'notes', 1], ['Predictions: Source A', 'notes', 1], ['Q1 Response', 'response', 0],
    ['Plan: Paragraph 1 — Q2', 'plan', 1], ['Plan: Paragraph 2 — Q2', 'plan', 1], ['Plan: Paragraph 1 — Q3', 'plan', 1], ['Plan: Paragraph 2 — Q3', 'plan', 1],
    ['Plan: Introduction — Q4', 'plan', 1], ['Plan: Body Paragraph 1 — Q4', 'plan', 1], ['Plan: Body Paragraph 2 — Q4', 'plan', 1], ['Plan: Body Paragraph 3 — Q4', 'plan', 1],
    ['Plan: Conclusion — Q4', 'plan', 1], ['Plan: Scene Structure — Q5', 'plan', 1]];
const set = (rows, label, done) => rows.map(r => (r[0] === label ? [r[0], r[1], done, r[3]] : r));
function run(compute, quiet) {
    const bad = [];
    const t = (c, m) => { if (!c) bad.push(m); if (!quiet) ok(c, m); };
    let r = compute('planning', P1_ALL_PLANNED);
    t(r.pct === 100 && r.total === 12, 'planning, every plan box + prediction filled, Q1 unanswered → 100% (' + r.done + '/' + r.total + ')');
    r = compute('planning', set(P1_ALL_PLANNED, 'Plan: Scene Structure — Q5', 0));
    t(r.pct < 100 && r.incomplete.indexOf('Plan: Scene Structure — Q5') !== -1, 'planning, one plan box empty → below 100%, named (' + r.done + '/' + r.total + ')');
    r = compute('planning', set(P1_ALL_PLANNED, 'Predictions: Source A', 0));
    t(r.pct < 100 && r.incomplete.indexOf('Predictions: Source A') !== -1, 'planning, a prediction empty → below 100% (keywords/predictions are planning\'s own)');
    r = compute('planning', P1_ALL_PLANNED);
    t(r.incomplete.indexOf('Q1 Response') === -1, 'planning never lists "Q1 Response" as still to do');
    r = compute('diagnostic', P1_ALL_PLANNED);
    t(r.total === 13 && r.incomplete.indexOf('Q1 Response') !== -1, 'a DIAGNOSTIC still counts its unanswered Q1 (unchanged)');
    r = compute('assessment', [['Q1 Response', 'response', 0, true], ['Feedback: Q1', 'feedback', 1]]);
    t(r.total === 1, 'an ASSESSMENT still skips its locked carried-over answers (unchanged)');
    return bad;
}
console.log('A. the real progress count, on the section lists measured on prod');
run(load(JS0), false);
console.log('B. falsify — each mutation must fail A');
const MUT = [
    ['the planning filter removed', s => s.replace("            if (!_lessonAuthorsSection(type)) return;\n", '')],
    ['planning authors responses too', s => s.replace("const LESSON_AUTHORS = { planning: ['plan', 'notes'] };", "const LESSON_AUTHORS = { planning: ['plan', 'notes', 'response'] };")],
    ['planning stops counting predictions', s => s.replace("const LESSON_AUTHORS = { planning: ['plan', 'notes'] };", "const LESSON_AUTHORS = { planning: ['plan'] };")],
    ['the filter applied to every lesson', s => s.replace('return !own || own.indexOf(type) !== -1;', "return (own || ['plan', 'notes']).indexOf(type) !== -1;")],
];
for (const [label, mut] of MUT) {
    const src = mut(JS0);
    if (src === JS0) { ok(false, 'mutation did not apply: ' + label); continue; }
    let bad; try { bad = run(load(src), true); } catch (e) { bad = ['threw ' + e.message]; }
    ok(bad.length > 0, 'mutation caught: ' + label + ' (' + bad.length + ' fail)');
}
console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
