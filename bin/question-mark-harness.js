#!/usr/bin/env node
/* eslint-env node */
// question-mark-harness (v7.20.724, FIXLIST #756) — the question's mark comes from its "Qn Total" LINE, never prose.
//
// Measured on the IGCSE P1 strong-paper walk (staging 59209, 7 Oct): the closing Q4 reply opened with a correction
// in prose — "…Paragraph 2 is 2.75/4, not 3.25, and I'll use 2.75 in your Q4 total. Paragraph 1 stays at 3.0/4." —
// above the canonical "Q4 Total: 10/12". _extractQuestionMark took the FIRST "Q4 total" it met and the last X/Y after
// it, so the feedback label (the grade source) became "Feedback: Q4 (3 / 4)". Slices the REAL function.
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const m = SRC.match(/    function _extractQuestionMark\(reply, qNum\) \{[\s\S]*?\n    \}\n/);
if (!m) { console.error('❌ question-mark-harness: cannot slice _extractQuestionMark'); process.exit(1); }
const f = new Function(m[0] + '\nreturn _extractQuestionMark;')();
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + ' — got ' + JSON.stringify(got)); } };
const is = (r, s, mx) => r && r.score === s && r.max === mx;

const WALK = '**A correction on Paragraph 2 first.** My explanation listed a second penalty, T1, for "**uses** incremental repetition", but I only deducted the first. The phrase is in your paragraph and "uses" names no action, so the deduction stands. Paragraph 2 is **2.75/4**, not 3.25, and I\'ll use 2.75 in your Q4 total. Paragraph 1 stays at 3.0/4.\n\n@FB_BEGIN{"q":"Q4","para":"3","title":"Paragraph 3"}\n\nTotal Mark for Paragraph 3: 3.25/4\n\n@FB_END\n\nQ4 Total: 10/12\n\nThat is 83.3%, which is a Grade 8.';
let r = f(WALK, 4);
ok(is(r, 10, 12), 'the walk reply: the canonical "Q4 Total: 10/12" line wins over prose mentioning "your Q4 total"', r);
// the forms the reader already handled — unchanged (regression oracle)
ok(is(f('Q2 Total: 4.5/8', 2), 5, 8), 'simple form, half mark rounds to whole', f('Q2 Total: 4.5/8', 2));
ok(is(f('**Q2 Total: 4/8**', 2), 4, 8), 'bold canonical line', f('**Q2 Total: 4/8**', 2));
ok(is(f('Q3 Total: 2.25 + 1.5 = 3.75/8', 3), 4, 8), 'summed form takes the LAST pair', f('Q3 Total: 2.25 + 1.5 = 3.75/8', 3));
ok(is(f('Q5 Total: AO5 17/24 + AO6 11/16 = 28/40', 5), 28, 40), 'AQA AO split', f('Q5 Total: AO5 17/24 + AO6 11/16 = 28/40', 5));
ok(is(f('Q6 Total: AO4 10/27 + AO5 7/18 = 17/45', 6), 17, 45), 'IGCSE AO split on Q6', f('Q6 Total: AO4 10/27 + AO5 7/18 = 17/45', 6));
ok(is(f('Q5 Total: AO5 15/24 + AO6 10/16 = 25/40 (ceilinged at 27/40 — does not reduce your mark)', 5), 25, 40), 'a parenthesised ceiling is never the mark (v7.19.829)', null);
ok(is(f('Your marks so far: Q2 Total 3/8 would rise next time.\nQ2 Total: 5/8', 2), 5, 8), 'a mid-sentence mention never shadows a line that starts with the total');
ok(f('No total here.', 2) === null, 'no total line → null');

console.log((fail ? '❌' : '✅') + ' question-mark-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
