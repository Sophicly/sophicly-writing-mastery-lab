#!/usr/bin/env node
/* eslint-env node */
/**
 * stale-regen-guard-harness.js — v7.20.853 (FIXLIST blank-plan-1298).
 *
 * WHAT HAPPENED. Neil, 12 Oct: "she definitely had work up to I think around question three, but it looks like her
 * document is blank." The 12 Oct go re-worded AQA Paper 2 Topic 1's Question 1 (the 2026 wording), so every saved Topic 1
 * document failed the "is the topic's question in this document?" test and read as STALE. The stale branch WIPES the
 * document and rebuilds the template — guarded only by "does it hold student work?", which counted response words and
 * feedback and nothing else. A planning document's work is all in plan boxes and outline rows, so Anam's plan (21 filled
 * boxes) counted as empty: a tutor saw a blank page, and a student's page re-filled partly from the chat and SAVED over
 * the server copy. Reproduced on staging with her real document before the fix.
 *
 * WHAT THIS PROVES, from the shipped code:
 *   A. the verdict (the @STALE-REGEN-PURE block, executed): typed boxes, response words, feedback and tutor view all
 *      preserve; only an untouched stale document is rebuilt; a document that is not stale is kept
 *   B. the wiring: the site reads EVERY typed box kind (input fields, outline rows) from the document, fails safe, passes
 *      reviewMode, and the destructive wipe sits only behind the verdict
 *   C. Anam's shape: a planning document with plan/outline text and no response words is preserved
 *
 * Usage: node bin/stale-regen-guard-harness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, got) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); } };

const b = SRC.indexOf('// @STALE-REGEN-PURE-BEGIN'), e = SRC.indexOf('// @STALE-REGEN-PURE-END');
if (b < 0 || e < b) { console.error('✗ the @STALE-REGEN-PURE block is missing from wml-assessment.js'); process.exit(1); }
// eslint-disable-next-line no-new-func
const verdict = new Function(SRC.slice(b, e) + '\nreturn staleRegenVerdict;')();

console.log('\nA · the verdict');
ok(verdict({ isStale: false, responseWords: 0 }) === 'keep', 'not stale → keep (nothing to decide)');
ok(verdict({ isStale: true, responseWords: 0, hasFeedback: false, typedBox: false, reviewMode: false }) === 'regen', 'stale and untouched → rebuild (the only case that may)');
ok(verdict({ isStale: true, responseWords: 0, hasFeedback: false, typedBox: true, reviewMode: false }) === 'preserve', '⭐ stale, no response words, but a typed plan / outline box → PRESERVE (Anam\'s planning document)');
ok(verdict({ isStale: true, responseWords: 0, hasFeedback: false, typedBox: false, reviewMode: true }) === 'preserve', '⭐ a tutor viewing → PRESERVE, whatever the document holds (a review never changes what is stored)');
ok(verdict({ isStale: true, responseWords: 21, typedBox: false }) === 'preserve', 'more than 20 response words → preserve (as before)');
ok(verdict({ isStale: true, responseWords: 20, typedBox: false }) === 'regen', '20 words is still the untouched threshold (unchanged)');
ok(verdict({ isStale: true, hasFeedback: true }) === 'preserve', 'feedback content → preserve (as before)');
ok(verdict(null) === 'keep' && verdict({}) === 'keep', 'no input → keep, never a wipe');

console.log('\nB · the wiring');
const siteAt = SRC.indexOf("const hasStudentWork = staleRegenVerdict({");
const site = siteAt < 0 ? '' : SRC.slice(SRC.lastIndexOf('const _responseWords', siteAt), siteAt + 2400);
ok(siteAt > -1, 'the stale branch decides through staleRegenVerdict (one rule)');
ok(/querySelectorAll\('\[data-input-field\], \.swml-input-field, \[data-outline-row\]'\)/.test(site), 'it reads every typed-box kind: input fields (plan, predictions) and outline rows');
ok(/\} catch \(_\) \{ _typedBox = true; \}/.test(site), 'a failed read counts as work — preserve, never wipe');
ok(/reviewMode: !!state\.reviewMode/.test(site), 'tutor view is passed in');
ok(!/const hasStudentWork = _responseWords > 20 \|\| _hasFeedbackContent;/.test(SRC), 'the old two-signal rule is gone');
const wipeAt = SRC.indexOf("canvasEditor.commands.setContent('<p></p>', false); }", siteAt);
const guardAt = SRC.indexOf('if (isStale && hasStudentWork) {', siteAt);
const regenLogAt = SRC.indexOf("console.log('WML: Stale document detected — regenerating.'", siteAt);
ok(guardAt > siteAt && regenLogAt > guardAt && wipeAt > regenLogAt, 'the destructive wipe is reachable only after the verdict says rebuild', [siteAt, guardAt, regenLogAt, wipeAt]);

console.log('\nC · Anam\'s shape (a planning document: plan + outline text, empty responses, no feedback)');
const planDoc = '<div data-section-type="plan" data-section-label="Plan: Paragraph 1 — Q3"><div data-input-field="true" data-field-id="plan-Q3-para-1">Topic: the storm as threat | TEI: personification</div></div>'
    + '<div data-outline-row="true" data-field-id="outline-body-1-topic-q3">Munby presents the storm as a predator</div>'
    + '<div data-section-type="response" data-section-label="Q3 Response"><p></p></div>';
const typed = /<div data-(?:input-field|outline-row)="true"[^>]*>[^<\s][^<]*<\/div>/.test(planDoc);
ok(typed && verdict({ isStale: true, responseWords: 0, hasFeedback: false, typedBox: typed, reviewMode: false }) === 'preserve',
    '⭐ her shape is preserved — the plan she wrote is never replaced by a blank template');

console.log(fail ? '\n❌ stale-regen-guard-harness FAILED (' + fail + ' of ' + (pass + fail) + ')' : '\n✅ stale-regen-guard-harness passed (' + pass + ' assertions, 0 failed)');
process.exit(fail ? 1 : 0);
