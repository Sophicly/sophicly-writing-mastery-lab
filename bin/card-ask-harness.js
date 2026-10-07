#!/usr/bin/env node
/* eslint-env node */
// card-ask-harness (v7.20.731, FIXLIST #768 — Neil 7 Oct: "it's put that in the actual feedback but that's actually
// part of the message… it shouldn't really be in the feedback").
// Measured on a real AQA Language Paper 1 record (prod, 28 Sep): the Q2 "Question Total" card ended "…My mark is 5/8,
// Level 3. The gap is worth naming honestly. Which ONE criterion do you think you rated more highly than it actually
// deserved…?" — the Calibration Check's ask, filed into the Feedback. The comparison stays (Neil's #709); the ask and
// its lettered options stay in the chat only. Slices the REAL function; checks it runs on every card.
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
const done = () => { console.log((fail ? '❌' : '✅') + ' card-ask-harness: ' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0); };
const a = SRC.indexOf('// @TRAILING-ASK-PURE-START'), b = SRC.indexOf('// @TRAILING-ASK-PURE-END');
ok(a !== -1 && b > a, 'the pure block exists (sentinels)');
if (!(a !== -1 && b > a)) done();
const drop = new Function(SRC.slice(a, b) + '\nreturn _dropTrailingAsk;')();

// 1. The measured shape: statements and the ask on ONE line
const ANAYA = '**Q2 Total: 5/8**\n\n**Calibration Check:** You placed yourself at 7/8 at Level 4, middle. My mark is 5/8, Level 3. The gap is worth naming honestly. Which ONE criterion do you think you rated more highly than it actually deserved — and now that you\'ve seen the breakdown, what does that tell you?';
let r = drop(ANAYA);
ok(/The gap is worth naming honestly\.$/.test(r), 'the comparison is kept, up to the last statement', r.slice(-80));
ok(r.indexOf('Which ONE criterion') === -1, 'the ask is dropped from the card');
ok(/\*\*Q2 Total: 5\/8\*\*/.test(r) && /My mark is 5\/8, Level 3\./.test(r), 'the total and the marks are untouched');

// 2. The ask on its own line, then lettered options (the protocol's button form)
const OPTS = 'Q3 Total: 6/8\n\n**Calibration Check:** You predicted 7/8; I marked 6/8.\n\nWhich ONE paragraph do you think you marked higher than it earned?\nA) Paragraph 1\nB) Paragraph 2';
r = drop(OPTS);
ok(/I marked 6\/8\.$/.test(r) && r.indexOf('A) Paragraph 1') === -1 && r.indexOf('Which ONE paragraph') === -1, 'the ask AND its lettered options are dropped', r);

// 3. Never touch content that is not an ask to the student
const GOLD = '**2. An Alternative Level 6 Gold Standard Model:**\nShakespeare leaves the audience with a question that outlasts the play: what, in the end, is left of a man who has murdered sleep?';
ok(drop(GOLD) === GOLD, 'a gold model ending on a rhetorical (third-person) question is untouched');
const PLAIN = 'Total Mark for Paragraph 1: 3/4\n\nWhat You Did Well: precise terminology.';
ok(drop(PLAIN) === PLAIN, 'a card with no trailing ask is byte-identical');
ok(drop('') === '', 'empty stays empty');

// 4. Wiring: every card, marker-filed or detected, passes through it before filing
ok(/if \(!cards\.length\) return;\s*\n\s*cards\.forEach\(c => \{ c\.body = _dropTrailingAsk\(c\.body\); \}\);/.test(SRC), 'applyAssessmentFeedback drops the ask from EVERY card before filing');
ok(!/\(\?<[=!]/.test(SRC.slice(a, b)), 'no lookbehind in the block (older iPad Safari cannot parse it)');
done();
