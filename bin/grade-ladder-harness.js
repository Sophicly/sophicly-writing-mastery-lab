#!/usr/bin/env node
/* eslint-env node */
// grade-ladder-harness (v7.20.727, FIXLIST #762) — a card's % and grade follow its OWN audited total.
//
// Measured on a real AQA Literature run (prod .720, 6 Oct): Sophia stated "Total penalties −1.5" over two −0.5 lines
// and summed the paragraph to 3.25/8. The audit (#743e) corrected the card to 3.75/8, but the same card still said
// "40.6%, which is a Grade 4" and "My assessment gave you 3.25/8, which is 40.6%" — because _enforceGradeLadder only
// knew the Language total line ("Q3 Total: 5/8"), never the Literature one ("Total Mark for Body Paragraph 1: 3.75/8"),
// and its calibration rewrite knew "actual" / "you scored" but not the protocol's own "gave you". The fixture below
// keeps that card's numbers and line spacing; the words are generic. Slices the REAL functions.
// WML_SRC=<file> runs it against another copy of wml-assessment.js (mutation proof: HEAD before the fix must fail).
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const lg = SRC.match(/    function _ladderGrade\(pct\) \{[\s\S]*?\n    \}\n/);
const eg = SRC.match(/    function _enforceGradeLadder\(reply\) \{[\s\S]*?\n    \}\n/);
if (!lg || !eg) { console.error('❌ grade-ladder-harness: cannot slice _ladderGrade / _enforceGradeLadder'); process.exit(1); }
const _origWarn = console.warn; console.warn = () => {};
const f = new Function(lg[0] + eg[0] + '\nreturn _enforceGradeLadder;')();
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
const has = (s, frag) => String(s).indexOf(frag) !== -1;

// 1. The Literature card: total corrected by the audit, % / grade / calibration left from the model's own sum.
const LIT = [
    '**Penalties Applied (max 3 = −1.5):**',
    '',
    'S1 (−0.5) — repetitive sentence starter.',
    '',
    'G1 (−0.5) — a repeated word.',
    '',
    '**Total penalties:** −1.0 marks',
    '',
    'Total Mark for Body Paragraph 1: 3.75/8',
    '',
    '**Percentage &amp; Grade:** 40.6%, which is a **Grade 4**',
    '',
    '**AQA Level Alignment:** This paragraph sits at Level 3, bordering Level 4.',
    '',
    '**Calibration Check:**',
    '',
    '**Self-Rating Reflection:**',
    '',
    'You rated yourself 4/5 (80%) for developing this paragraph\'s argument. My assessment gave you 3.25/8, which is 40.6% — a significant gap.',
].join('\n');
let r = f(LIT);
ok(has(r, '46.9%, which is a **Grade 5**'), 'Literature card: % recomputed from "Total Mark for … 3.75/8" and re-banded (Grade 4 → 5)', r.split('\n')[10]);
ok(has(r, 'My assessment gave you 3.75/8, which is 46.9% — a significant gap.'), 'calibration "gave you" takes the audited value AND its % follows', r.split('\n')[18]);
ok(has(r, 'You rated yourself 4/5 (80%)'), 'the student\'s own self-rating is never touched');
ok(has(r, 'Total Mark for Body Paragraph 1: 3.75/8') && has(r, '**Total penalties:** −1.0 marks'), 'the total and penalty lines are left as the audit wrote them');
ok(f(r) === r, 'idempotent — a second pass changes nothing');

// 2. The protocol's own template phrasing ("… marks for this paragraph, which is …%").
r = f('Total Mark for Body Paragraph 2: 5/8\n\n**Percentage & Grade:** 50%, which is a **Grade 5**\n\nMy assessment gave you 4/8 marks for this paragraph, which is 50%');
ok(has(r, '62.5%, which is a **Grade 6**') && has(r, 'gave you 5/8 marks for this paragraph, which is 62.5%'), 'template calibration line: numerator and % both follow the audited 5/8', r);

// 3. Correct cards stay byte-identical.
const INTRO = 'Total Mark for Introduction: 0/3\n\n**Percentage & Grade:** 0%, which is a **Grade 1**';
ok(f(INTRO) === INTRO, 'a correct 0/3 introduction card is unchanged', f(INTRO));
const CONC = 'Total Mark for Conclusion: 5.5/7\n\n**Percentage & Grade:** 78.6%, which is a **Grade 8**';
ok(f(CONC) === CONC, 'a correct conclusion card is unchanged', f(CONC));

// 4. Scope guards.
r = f('Total Mark for Conclusion: 5/7\n\n**Percentage & Grade:** 71.4%, which is a **Grade 7**\n\nIn Body 1 I gave you 3.75/8.');
ok(has(r, 'I gave you 3.75/8.'), 'a "gave you" with a DIFFERENT denominator is another unit — untouched', r);
r = f('Total Mark for Body Paragraph 3: 3.75/8\n\n**Percentage & Grade:** 46.9%, which is a **Grade 5**\n\nYou predicted 6/8 and you gave yourself 6/8; my assessment gave you 3.75/8.');
ok(has(r, 'You predicted 6/8') && has(r, 'you gave yourself 6/8'), 'the student\'s prediction and self-mark ("gave yourself") are never rewritten', r);
const PEN = '**Total penalties:** −1.5\n\n40%, which is a Grade 4';
ok(f(PEN) === PEN, '"Total penalties" is not a total line', f(PEN));
const MARKS = 'Total Marks: 3/34\n\n50%, which is a Grade 5';
ok(f(MARKS) === MARKS, '"Total Marks:" (Score Summary wording) is not a card total', f(MARKS));

// 5. Dash form after a Literature total.
r = f('Total Mark for Body Paragraph 2: 5/8\n\n25% — Grade 2');
ok(has(r, '62.5% — Grade 6'), 'dash form after a "Total Mark for" line is recomputed', r);

// 6. The final readout carries total and grade on ONE line (protocol: "**Total: [X]/34** — [X]%, which is a **Grade [N]**").
r = f('**Total: 20/34** — 60%, which is a **Grade 6**');
ok(has(r, '58.8%, which is a **Grade 6**'), 'same-line final readout: % recomputed from its own total', r);
r = f('**Total: 22/34** — 60%, which is a **Grade 5**');
ok(has(r, '64.7%, which is a **Grade 6**'), 'same-line final readout: grade re-banded', r);
const FINAL_OK = '**Total: 29/34** — 85.3%, which is a **Grade 9**';
ok(f(FINAL_OK) === FINAL_OK, 'a correct final readout is unchanged', f(FINAL_OK));

// 7. Language behaviour that already worked — regression oracle.
r = f('Q3 Total: 5/8\n\n60%, which is a Grade 8');
ok(has(r, '62.5%, which is a Grade 6'), 'Language "Q3 Total" → % and grade recomputed (v7.19.832)', r);
r = f('Q2 Total: 1/8\n\nCalibration Check: you predicted 3/8; the actual mark is 2/8.');
ok(has(r, 'the actual mark is 1/8') && has(r, 'you predicted 3/8'), 'Language calibration "actual" still follows the total (v7.19.932)', r);
const WALK = 'Total Mark for Paragraph 3: 3.25/4\n\n@FB_END\n\nQ4 Total: 10/12\n\nThat is 83.3%, which is a Grade 8.';
ok(f(WALK) === WALK, 'a paragraph card then the question total: the % follows the NEAREST total (Q4 10/12) — unchanged', f(WALK));

console.warn = _origWarn;
console.log((fail ? '❌' : '✅') + ' grade-ladder-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
