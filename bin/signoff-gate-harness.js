#!/usr/bin/env node
/* eslint-env node */
/**
 * signoff-gate-harness.js — v7.20.868 (FIXLIST signoff-enter-all-marks). Neil, 13 Oct, reviewing Reeham's Lang P1
 * "4. Polish Your Writing": "can you see it says enter all marks before signing off? What does that mean? Why is it
 * saying that?" — the polishing doc carries her diagnostic's feedback boxes (Q4 "— / 20", Q5 "— / 40", never marked),
 * so sign-off was locked on a lesson where no mark is ever entered, and the warning never said which boxes.
 * Runs the shipped @SIGNOFF-PURE block on the REAL labels of her documents, then checks the wiring.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-app.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };

const b = SRC.indexOf('// @SIGNOFF-PURE-BEGIN'), e = SRC.indexOf('// @SIGNOFF-PURE-END');
ok(b > -1 && e > b, 'the @SIGNOFF-PURE block exists');
let F = null;
// eslint-disable-next-line no-new-func
try { F = new Function(SRC.slice(b, e) + '\nreturn { signoffUnmarked, signoffMarksHint };')(); } catch (err) { ok(false, 'the block runs', String(err)); }

// Reeham 1352, prod 13 Oct — the labels in her Lang P1 documents.
const REEHAM = ['Feedback: Q1 (4 / 4)', 'Feedback: Q2 (6 / 8)', 'Feedback: Q3 (6 / 8)', 'Feedback: Q4 (— / 20)', 'Feedback: Q5 (— / 40)', 'Overall Feedback', 'Analytics'];
console.log('\n1. which boxes lock sign-off');
if (F) {
    ok(JSON.stringify(F.signoffUnmarked(REEHAM, 'polishing')) === '[]', '⭐ Polish Your Writing: carried-forward boxes never lock sign-off (no mark is entered in that lesson)');
    ok(JSON.stringify(F.signoffUnmarked(REEHAM, 'planning')) === '[]' && JSON.stringify(F.signoffUnmarked(REEHAM, 'outlining')) === '[]', 'nor Plan / Outline');
    ok(JSON.stringify(F.signoffUnmarked(REEHAM, 'assessment')) === '["Q4","Q5"]', '⭐ an assessment lesson still locks — and says WHICH: Q4, Q5', F.signoffUnmarked(REEHAM, 'assessment'));
    ok(JSON.stringify(F.signoffUnmarked(REEHAM, 'redraft_assessment')) === '["Q4","Q5"]' && JSON.stringify(F.signoffUnmarked(REEHAM, 'feedback_discussion')) === '["Q4","Q5"]', 'so does the redraft assessment and the discuss-feedback lesson');
    ok(JSON.stringify(F.signoffUnmarked(['Feedback: Q4 (20 / 20)', 'Feedback: Introduction (2.5 / 5)'], 'assessment')) === '[]', 'every box marked (half marks too) → nothing locks');
    ok(JSON.stringify(F.signoffUnmarked(['Part A Feedback: Introduction (— / 5)'], 'assessment')) === '["Part A Introduction"]', 'a prefixed label keeps its prefix', F.signoffUnmarked(['Part A Feedback: Introduction (— / 5)'], 'assessment'));
    ok(F.signoffUnmarked([], 'assessment').length === 0, 'a document with no feedback boxes → nothing locks (tutor judges)');
    console.log('\n2. the warning names them');
    ok(F.signoffMarksHint(['Q4', 'Q5']) === '⚠ No mark yet for Q4 and Q5. Set each one in its Feedback box before signing off.', '⭐ two boxes', F.signoffMarksHint(['Q4', 'Q5']));
    ok(F.signoffMarksHint(['Q4']) === '⚠ No mark yet for Q4. Set it in its Feedback box before signing off.', 'one box', F.signoffMarksHint(['Q4']));
    ok(F.signoffMarksHint(['Q2', 'Q3', 'Q4']).indexOf('Q2, Q3 and Q4') > -1, 'three boxes read as a list');
}
console.log('\n3. wiring');
ok(/function _marksReadyForSignoff\(editor\) \{\s*return _signoffUnmarked\(editor\)\.length === 0;\s*\}/.test(SRC), 'the gate and the click re-check read the one rule');
ok(/return signoffUnmarked\(labels, state\.task\);/.test(SRC), 'it passes the lesson\'s task');
ok(/const _unmarked = _signoffUnmarked\(editor\);[\s\S]{0,200}marksHint\.textContent = signoffMarksHint\(_unmarked\);/.test(SRC), 'the warning text is rebuilt from the boxes on every refresh');
ok(/if \(state\.topicNumber === 1\) state\.draftType = state\.isRedraft \? 'diagnostic_redraft' : 'diagnostic';/.test(APP), '⭐ review mode honours the lesson\'s phase — no "first diagnostic" wording on a redraft lesson');
console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ signoff-gate-harness FAILED'); process.exit(1); }
console.log('✅ signoff-gate-harness passed.');
