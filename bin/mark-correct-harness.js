#!/usr/bin/env node
/* eslint-env node */
// mark-correct-harness (v7.20.729, FIXLIST #757 — Neil 7 Oct: "Let the mark change, and say why").
//
// Reproduced on staging 7 Oct (IGCSE P1 strong paper): in the Paragraph 3 reply Sophia corrected her filed
// Paragraph 1 (3.25 → 3.0) and Paragraph 2 (3.25 → 2.75) and wrote "Q4 Total: 9/12". The filed cards still said
// 3.25 ×3, so the question-total check re-added them and "corrected" her 9 back to 10; the chat, the cards and the
// total disagreed three ways, and she told the student to trust the chat over the tracker. Now a correction is a
// marker the CODE applies to the record. Slices the REAL pure functions; checks the wiring by source order.
// WML_SRC=<file> runs it against another copy of wml-assessment.js (mutation proof: the pre-fix code must fail).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(process.env.WML_CORE || path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const ROUTER = fs.readFileSync(process.env.WML_ROUTER || path.join(ROOT, 'includes', 'class-protocol-router.php'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
const done = () => { console.log((fail ? '❌' : '✅') + ' mark-correct-harness: ' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0); };

const a = SRC.indexOf('// @MARK-CORRECT-PURE-START'), b = SRC.indexOf('// @MARK-CORRECT-PURE-END');
ok(a !== -1 && b > a, 'the pure correction block exists (sentinels)');
if (!(a !== -1 && b > a)) done();
const _w = console.warn; console.warn = () => {};
const P = new Function(SRC.slice(a, b) + '\nreturn { _markCorrectionsIn, _applyCorrectionsToAudit, _rewriteActualPerformance };')();

// 1. Reading the marker
let cs = P._markCorrectionsIn('I gave Body 1 too much — it comes down to 3.\n@MARK_CORRECT{"q":"Body 1","to":3}\n');
ok(cs.length === 1 && cs[0].q === 'Body 1' && cs[0].para === '' && cs[0].to === 3, 'a Literature correction is read', cs);
cs = P._markCorrectionsIn('@MARK_CORRECT{"q":"Q4","para":"2","to":2.75}');
ok(cs.length === 1 && cs[0].q === 'Q4' && cs[0].para === '2' && cs[0].to === 2.75, 'a Language paragraph correction is read', cs);
ok(P._markCorrectionsIn('@MARK_CORRECT{"q":"Q4","to":"lots"}').length === 0 && P._markCorrectionsIn('@MARK_CORRECT{oops}').length === 0, 'an unreadable marker is ignored, never guessed');
ok(P._markCorrectionsIn('No markers here.').length === 0, 'no marker → nothing');

// 2. The #757 case: the corrections reach the question-total check BEFORE it runs
const audit = { totals: { Q4: [3.25, 3.25, 3.25] }, failed: {}, paraIdx: { Q4: { '1': 0, '2': 1, '3': 2 } } };
const reply = 'Paragraph 1 comes down to 3.0 — "polysyndeton" was misnamed.\n@MARK_CORRECT{"q":"Q4","para":"1","to":3}\nParagraph 2 comes down to 2.75.\n@MARK_CORRECT{"q":"Q4","para":"2","to":2.75}\n\nQ4 Total: 9/12';
const n = P._applyCorrectionsToAudit(audit, P._markCorrectionsIn(reply));
ok(n === 2 && audit.totals.Q4.join(',') === '3,2.75,3.25', 'both corrections land on the right paragraphs', audit.totals.Q4);
const expected = Math.floor(audit.totals.Q4.reduce((x, y) => x + y, 0) + 0.5);   // Pass 2's own rule (keep in step)
ok(expected === 9, 'the question-total check now agrees with her 9/12 (it said 10 before)', expected);
const audit2 = { totals: { Q2: [4] }, failed: {}, paraIdx: { Q2: { '1': 0 } } };
ok(P._applyCorrectionsToAudit(audit2, P._markCorrectionsIn('@MARK_CORRECT{"q":"Body 1","to":3}')) === 0 && audit2.totals.Q2[0] === 4, 'a Literature correction never touches a Language question total');
ok(P._applyCorrectionsToAudit({ totals: {}, failed: {}, paraIdx: {} }, P._markCorrectionsIn('@MARK_CORRECT{"q":"Q4","para":"1","to":3}')) === 0, 'a correction to a card filed in an earlier session (no in-flight total) is left to the document');

// 3. The summary's "Actual performance" follows the filed sections
const SUMMARY = [
    '**Self-Rating Pattern:**',
    '- **Introduction:** You rated yourself 4/5 for setting up the argument. Actual performance: 0%. A big gap.',
    '- **Body Paragraphs:** Your ratings were 4, 4, 5 out of 5. Actual performance: 40.6%, 50%, 55%. A steady climb.',
    '- **Conclusion:** You rated yourself 3/5 for tying everything together. Actual performance: 57%. Close.',
    'Overall you predicted 80%.',
].join('\n');
const PCT = { Introduction: 66.7, 'Body 1': 46.9, 'Body 2': 50, 'Body 3': 55, Conclusion: 57.1 };
const r = P._rewriteActualPerformance(SUMMARY, PCT);
ok(/Introduction:\*\* [^\n]*Actual performance: 66\.7%/.test(r), 'Introduction: the corrected section percentage replaces the model\'s 0%', r.split('\n')[1]);
ok(/Actual performance: 46\.9%, 50%, 55%\./.test(r), 'Body Paragraphs: all three follow their filed sections, in order', r.split('\n')[2]);
ok(/Conclusion:\*\* [^\n]*Actual performance: 57\.1%/.test(r), 'Conclusion follows its filed section', r.split('\n')[3]);
ok(/You rated yourself 4\/5/.test(r) && /Overall you predicted 80%\./.test(r), 'the student\'s own ratings and predictions are never touched');
ok(P._rewriteActualPerformance(SUMMARY, { Introduction: 66.7, 'Body 1': 46.9 }).split('\n')[2] === SUMMARY.split('\n')[2], 'a body list whose count does not match the filed sections is left alone (never half-rewritten)');
console.warn = _w;

// 4. Wiring — by source, so a refactor that drops a call fails here
const fnStart = SRC.indexOf('function _auditAssessmentArithmetic(');
const p1 = SRC.indexOf('// ---- Pass 1: each card', fnStart), p1b = SRC.indexOf('_applyCorrectionsToAudit(_fbAudit, _markCorrectionsIn(out))', fnStart), p2 = SRC.indexOf('// ---- Pass 2: verify each Qn Total', fnStart);
ok(p1 !== -1 && p1b > p1 && p2 > p1b, 'Pass 1b sits between Pass 1 and Pass 2 in the audit', [p1, p1b, p2]);
ok((SRC.match(/_fbAudit\.paraIdx\[qKey\] = _fbAudit\.paraIdx\[qKey\] \|\| \{\}\)\[String\(\(meta && meta\.para\) \|\| ''\)\] = _fbAudit\.totals\[qKey\]\.length - 1;/g) || []).length === 2, 'Pass 1 records each paragraph\'s position at BOTH places it records a total');
ok(/delete _fbAudit\.totals\[qKey\]; delete _fbAudit\.failed\[qKey\]; delete _fbAudit\.paraIdx\[qKey\];/.test(SRC), 'Pass 2 clears the paragraph index with the totals');
ok((SRC.match(/applyAssessmentFeedback\(res\.reply\);\s*\n\s*_applyMarkCorrections\(res\.reply\);/g) || []).length === 2, 'BOTH chat pipelines apply corrections straight after filing');
ok(/if \(m\.content\.indexOf\('@FB_BEGIN'\) === -1\) \{ if \(_hasCorr\) _applyMarkCorrections\(m\.content\); return; \}/.test(SRC) && /applyAssessmentFeedback\(m\.content\);\s*\n\s*if \(_hasCorr\) _applyMarkCorrections\(m\.content\);/.test(SRC), 'the heal replay re-applies corrections in history order, after the card it corrects');
ok(/if \(_probe && parseFloat\(_probe\[1\]\) !== _lg\.total\) \{/.test(SRC) && !/if \(_probe && parseFloat\(_probe\[1\]\) > _lg\.total\) \{/.test(SRC), 'the grand total follows the filed labels in BOTH directions (was downward-only)');
ok(/const _secPct = _labelSectionPcts\(\);\s*\n\s*if \(_secPct\) out = _rewriteActualPerformance\(out, _secPct\);/.test(SRC), 'the summary turn rewrites "Actual performance" from the filed sections');
const strip = (CORE.match(/text = text\.replace\((\/\[ \\t\]\*@MARK_CORRECT[^;]+)\);/) || [])[1];
ok(!!strip, 'the display cleaner strips @MARK_CORRECT');
if (strip) {
    const re = eval(strip.split(", ''")[0]);   // the literal regex from the source line
    const shown = 'Body 1 comes down to 3.0, because the device was misnamed.\n@MARK_CORRECT{"q":"Body 1","to":3}\nShall we continue?'.replace(re, '');
    ok(shown.indexOf('@MARK_CORRECT') === -1 && /because the device was misnamed/.test(shown), 'the student sees Sophia\'s reason and never the marker', shown);
}
ok(/parts\.length < cardsInQ/.test(SRC) && /label left as filed/.test(SRC), 'a Language label is re-summed ONLY when every paragraph card shows its total (a partial sum set Q4 to 6/12 — measured on a staging card)');
ok(/restates that question's total on its own line/.test(ROUTER), 'after a Language paragraph correction Sophia restates the question total, which sets the label through the tested path');
ok(/### A MARK YOU ALREADY FILED — CORRECT IT THROUGH THE RECORD/.test(ROUTER) && /never tell the student to trust the chat over their document/.test(ROUTER), 'the router tells Sophia how to correct a filed mark — and never to set the chat against the document');
done();
