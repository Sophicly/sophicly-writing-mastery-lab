#!/usr/bin/env node
/* eslint-env node */
/**
 * response-feedback-link-harness.js — FIXLIST #899 (v7.20.839). Neil, 12 Oct, on the "Get Your Assessment & Feedback"
 * lessons: "it does feel like you have to scroll down quite a lot to see the feedback". From each ANSWER: pop out that
 * question's feedback, go to it, and see its mark while the answer is collapsed.
 *
 * Drives the REAL pure block (@RESP-FB-PURE in wml-assessment.js) with the REAL _paraKey, on the label forms the
 * document builder really writes ("Q3 Response", "Q1 Statements", "Feedback: Q3 (6 / 12)", "— " = not marked), then
 * checks the wiring that turns it into the row, the one-question pad and the jump. §5d: the answer and its box must
 * reach the SAME question key, or the row points at the wrong feedback — so the pairing is tested, never assumed.
 *
 * Usage: node bin/response-feedback-link-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
const SB = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-section-block.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, got) {
    if (cond) { pass++; console.log('  ✓ ' + msg); }
    else { fail++; console.log('  ✗ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); }
}

const b = SRC.indexOf('// @RESP-FB-PURE-BEGIN');
const e = SRC.indexOf('// @RESP-FB-PURE-END');
const pk = SRC.indexOf('function _paraKey(s) {');
if (b < 0 || e < 0 || pk < 0) { console.error('❌ the @RESP-FB-PURE block or _paraKey is missing from wml-assessment.js'); process.exit(1); }
const PARA_KEY = SRC.slice(pk, braceSliceFrom(SRC, pk, '{', '}').end);
// eslint-disable-next-line no-new-func
const M = new Function(SRC.slice(b, e) + '\n' + PARA_KEY + '\nreturn { feedbackLabelParts, docMarkFromLabels, responseFeedbackLink, _paraKey };')();
const { feedbackLabelParts: parts, docMarkFromLabels: docMark, responseFeedbackLink: link, _paraKey: keyOf } = M;
const boxesOf = (labels) => labels.map(parts).filter(Boolean);

console.log('\nRESPONSE ↔ FEEDBACK — the answer row (FIXLIST #899)\n');

console.log('1 · One parser for a marked question\'s feedback label:');
ok(JSON.stringify(parts('Feedback: Q3 (6 / 12)')) === JSON.stringify({ base: 'Feedback: Q3', score: 6, max: 12 }), '"Feedback: Q3 (6 / 12)" → base, 6, 12', parts('Feedback: Q3 (6 / 12)'));
ok(JSON.stringify(parts('Feedback: Q4 (— / 16)')) === JSON.stringify({ base: 'Feedback: Q4', score: null, max: 16 }), '"— / 16" is NOT marked yet (score null)', parts('Feedback: Q4 (— / 16)'));
ok(parts('Part A Feedback: Introduction (2.5 / 5)').base === 'Part A Feedback: Introduction' && parts('Part A Feedback: Introduction (2.5 / 5)').score === 2.5, 'prefixed labels and Literature half-marks parse (#644)');
ok(parts('Overall Feedback') === null && parts('Analytics') === null && parts('Feedback: Q3') === null, 'boxes with no mark (Overall Feedback, Analytics, an unmarked label) are not questions');

console.log('\n2 · The document\'s mark — ONE arithmetic, the Score Summary\'s ceiling:');
const L = ['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (5 / 7)', 'Overall Feedback', 'Feedback: Conclusion (3 / 3)'];
ok(JSON.stringify(docMark(L, 0)) === JSON.stringify({ total: 10, max: 13, allSet: true }), 'sums the marked boxes, ignores the unmarked kinds', docMark(L, 0));
ok(docMark(L, 5).total === 8, '⭐ the word-count CEILING bites only above max − penalty: MIN(10, 13 − 5) = 8', docMark(L, 5));
ok(docMark(L, 2).total === 10, '…and never deducts below it: MIN(10, 13 − 2) = 10', docMark(L, 2));
ok(docMark(['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (— / 7)'], 0).allSet === false, 'an unmarked box makes allSet false');
ok(docMark(['Feedback: Q1 (— / 4)'], 0) === null && docMark([], 0) === null, 'nothing marked → null (no number on the page)');

console.log('\n3 · A Language paper — every answer to ITS OWN question (the real template labels):');
const RESP = ['Q1 Statements', 'Q2 Response', 'Q3 Response', 'Q4 Response', 'Q5 Response'];
const FB = ['Feedback: Q1 (4 / 4)', 'Feedback: Q2 (5 / 8)', 'Feedback: Q3 (6 / 12)', 'Feedback: Q4 (4 / 16)', 'Overall Feedback', 'Feedback: Q5 (24 / 40)'];
const want = { 'Q1 Statements': [4, 4], 'Q2 Response': [5, 8], 'Q3 Response': [6, 12], 'Q4 Response': [4, 16], 'Q5 Response': [24, 40] };
RESP.forEach((r) => {
    const l = link(r, boxesOf(FB), RESP.length, keyOf, null);
    ok(!!l && !l.whole && l.base === 'Feedback: ' + r.split(' ')[0] && l.score === want[r][0] && l.max === want[r][1], '⭐ ' + r + ' → its own box, ' + want[r][0] + ' / ' + want[r][1], l);
});
ok(link('Q3 Response', boxesOf(['Feedback: Q3 (— / 12)', 'Feedback: Q4 (4 / 16)']), 2, keyOf, null) === null, 'an answer whose box is not marked yet has NO row ("once the feedback is done")');
ok(link('Q6 Response', boxesOf(FB), 6, keyOf, null) === null, 'an answer with no box of its own has no row — never a neighbour\'s');
ok(link('Response', boxesOf(FB), 5, keyOf, null) === null, 'an answer label with no question key has no row');
ok(link('Q10 Response', boxesOf(['Feedback: Q1 (4 / 4)', 'Feedback: Q10 (7 / 8)']), 2, keyOf, null).base === 'Feedback: Q10', '⭐ "Q10" pairs with Q10, never with Q1 (whole keys, not prefixes)');

console.log('\n4 · Literature answers written section by section — Introduction and paragraphs pair by name:');
const lr = link('Your Introduction', boxesOf(['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (5 / 7)']), 2, keyOf, null);
ok(!!lr && lr.base === 'Feedback: Introduction' && lr.score === 2, '"Your Introduction" → "Feedback: Introduction"', lr);
const lb = link('Your Body Paragraph 1', boxesOf(['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (5 / 7)']), 2, keyOf, null);
ok(!!lb && lb.base === 'Feedback: Body Paragraph 1' && lb.score === 5, '"Your Body Paragraph 1" → "Feedback: Body Paragraph 1"', lb);

console.log('\n5 · One essay — every box is its feedback, and the mark is the whole essay\'s:');
const EB = ['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (— / 7)'];
const w1 = link('Your Essay', boxesOf(EB), 1, keyOf, docMark(EB, 0));
ok(!!w1 && w1.whole && w1.base === 'Feedback: Introduction' && w1.score === null, 'part-marked: the row is there (pop out / go to the first box), but NO total yet', w1);
const EA = ['Feedback: Introduction (2 / 3)', 'Feedback: Body Paragraph 1 (5 / 7)'];
const w2 = link('Your Essay', boxesOf(EA), 1, keyOf, docMark(EA, 3));
ok(!!w2 && w2.whole && w2.score === 7 && w2.max === 10, '⭐ fully marked: the whole essay\'s mark, the same ceiling as the Score Summary (MIN(7, 10 − 3) = 7)', w2);
ok(link('Your Essay', boxesOf(['Feedback: Introduction (— / 3)']), 1, keyOf, docMark(['Feedback: Introduction (— / 3)'], 0)) === null, 'nothing marked → no row at all');
ok(link('Your Essay', boxesOf(EA), 1, keyOf, { total: 6, max: 10, allSet: true }).score === 6, 'the audited result, when present, is the mark shown (passed in as the total)');

console.log('\n6 · The wiring that turns the link into a row, a pad and a jump:');
const rcIdx = SRC.indexOf('function _renderControlRows() {');
const RC = rcIdx < 0 ? '' : braceSliceFrom(SRC, rcIdx, '{', '}').text;
const passAt = RC.indexOf('if (_docDisplayLocked()) {\n                const _fbBoxes');
ok(passAt !== -1, 'renderControlRows fills each answer\'s own row — only in the display-locked lessons (feedback is live there)');
const PASS = passAt < 0 ? '' : RC.slice(passAt, RC.indexOf('// ── Self-Assessment Dropdowns', passAt));
ok(/_ctlRowOf\(resp\)/.test(PASS) && /responseFeedbackLink\(resp\.getAttribute\('data-section-label'\) \|\| '', _fbBoxes, _resps\.length, _paraKey, _docTotal\)/.test(PASS),
    'it writes into the ANSWER\'s firewalled control row (never the student\'s text), pairing through the pure function + _paraKey');
ok(/feedbackLabelParts\(/.test(PASS) && /docMarkFromLabels\(/.test(PASS) && /_lastAuditedResult\.docKey === _assessDocKey\(\)/.test(PASS),
    'its boxes come from the ONE label parser; an essay\'s total from the ONE arithmetic, the audited result first');
ok(/if \(row\.dataset\.sig === sig\) return;/.test(PASS) && /_rowFillStart\(row\)/.test(PASS) && /_rowFillEnd\(row, sig\)/.test(PASS), 'sig-idempotent like every row (PM law rule 4: an unchanged row is never rewritten)');
ok(/mousedown', \(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); \}\)/.test(PASS), 'its buttons never steal the caret');
ok(/_openFeedbackPadHook\(link\.whole \? '' : link\.base\)/.test(PASS) && /_goToFeedbackBox\(link\.base\)/.test(PASS), '"Pop out feedback ↗" opens the pad for that question; "Go to feedback ↓" jumps to its box');
ok(/let _openFeedbackPadHook = null;/.test(SRC) && /_openFeedbackPadHook = \(base\) => \{[\s\S]{0,300}spawnExtractPanel\(\[\], base \? 'feedback\|' \+ base : 'feedback'/.test(SRC),
    'the hook is declared at module scope and set where the pads live');
ok(/const _fbOnly = \(typeof sourceIdx === 'string' && sourceIdx\.indexOf\('feedback\|'\) === 0\) \? sourceIdx\.slice\(9\) : null;/.test(SRC)
    && /if \(_fbOnly !== null\) \{ const _p = feedbackLabelParts\(fLbl\); if \(!_p \|\| _p\.base !== _fbOnly\) return; \}/.test(SRC),
    '⭐ the one-question pad is the Feedback pad itself, filtered to that box by its base — one renderer, so it cannot drift');
const gIdx = SRC.indexOf('function _goToFeedbackBox(base) {');
const GO = gIdx < 0 ? '' : braceSliceFrom(SRC, gIdx, '{', '}').text;
ok(/feedbackLabelParts\(/.test(GO) && /_expandIfCollapsed\(target\)/.test(GO) && /_swmlScrollToTop\(target, 24\)/.test(GO) && !/CSS\.escape/.test(GO),
    '"Go to feedback ↓" opens a collapsed box the chevron\'s way and uses the ONE scroll (§4c.10); no CSS.escape');
const dIdx = SRC.indexOf('function _deterministicDocGrade() {');
const DG = dIdx < 0 ? '' : braceSliceFrom(SRC, dIdx, '{', '}').text;
ok(/docMarkFromLabels\(/.test(DG) && !/let total = 0, max = 0, any = false;/.test(DG), 'the grade chip now reads the SAME arithmetic (no second copy of the sum)');
ok(/let finalMarks = Math\.min\(totalMarks, Math\.max\(0, maxTotal - _wcPen\)\);/.test(SRC),
    '⭐ drift tripwire: the Score Summary still applies the same ceiling docMarkFromLabels encodes — change one, change both');
ok(/const DISPLAY_LOCK_TASKS = \['assessment', 'redraft_assessment', 'feedback_discussion'\];/.test(SRC), 'the display-locked lessons are still the assessment, redraft assessment and discuss-feedback lessons');
ok(/\.swml-para-pop-node,\n\.swml-resp-fb-btn \{/.test(CSS) && /\.swml-resp-fb-btn \{ border: 0; margin-left: 0; font-family: inherit; \}/.test(CSS),
    'the buttons wear the pop-out chip\'s own mould (one family, no new look)');
ok(/ctlRow\.className = 'swml-ctl-row';/.test(SB) && /if \(ctlRow === mutation\.target \|\| ctlRow\.contains\(mutation\.target\)\) return true;/.test(SB),
    'every collapsible section (answers included) has the control row, and its fills are firewalled from ProseMirror');

console.log(fail
    ? '\n❌ response-feedback-link-harness FAILED (' + fail + ' of ' + (pass + fail) + ')'
    : '\n✅ response-feedback-link-harness passed (' + pass + ' assertions, 0 failed)');
process.exit(fail ? 1 : 0);
