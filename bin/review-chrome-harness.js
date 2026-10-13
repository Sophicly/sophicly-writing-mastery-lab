#!/usr/bin/env node
/* eslint-env node */
/**
 * review-chrome-harness.js — v7.20.866 (FIXLIST remove-old-review-chrome). Neil, 13 Oct, reviewing 1287 with Focus's
 * new teal review bar on screen: "we've still got the old reviewing as student bar… I don't think we need that old
 * one anymore. Neither in the sidebar, in the protocol progress sidebar. Nor above the document, nor below it… if we
 * just have the one across the top, I think that's visible enough."
 *
 * The canvas's own review chrome (the pill above the document + every "Tutor view · View as student" badge) shows
 * ONLY where Focus's .spl-review-bar is absent — and always for live modelling, which is not Focus review mode.
 * Runs the shipped _showOldReviewChrome on fake states; then checks every chrome site goes through it.
 *
 * Usage: node bin/review-chrome-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
function ok(cond, msg, got) {
    if (cond) { pass++; console.log('  ✓ ' + msg); }
    else { fail++; console.log('  ✗ ' + msg + (got !== undefined ? '  — got: ' + JSON.stringify(got) : '')); }
}

console.log('\n1. the rule — old chrome only where the Focus bar is absent, or for live modelling');
const i = SRC.indexOf('function _showOldReviewChrome() {');
ok(i > -1, '_showOldReviewChrome exists');
let fn = null;
if (i > -1) {
    const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end);
    // eslint-disable-next-line no-new-func
    fn = (state, hasBar) => new Function('state', 'document', body + '\nreturn _showOldReviewChrome();')(state, { querySelector: (sel) => (sel === '.spl-review-bar' && hasBar ? {} : null) });
}
if (fn) {
    ok(fn({ reviewMode: false }, false) === false, 'not reviewing → nothing');
    ok(fn({ reviewMode: true, reviewRole: 'tutor' }, true) === false, '⭐ a tutor with the teal bar on screen → no old chrome (Neil\'s ruling)');
    ok(fn({ reviewMode: true, reviewRole: 'parent', viewerMode: 'readonly' }, true) === false, 'a parent with the teal bar → no old chrome either (the bar renders in every review mode)');
    ok(fn({ reviewMode: true, reviewRole: 'tutor' }, false) === true, 'no teal bar on the page → the old chrome stays, so a reviewer is never left without a way out');
    ok(fn({ reviewMode: true, reviewRole: 'live_modelling' }, true) === true && fn({ reviewMode: true, reviewRole: 'live_modelling' }, false) === true,
        'live modelling always keeps its line ("X is writing this document") — it is not Focus review mode');
}

console.log('\n2. every piece of old chrome goes through the rule');
const pills = SRC.match(/(protoBadges|ctxBadges)\.appendChild\(buildTutorViewPill\(\)\)/g) || [];
const gated = SRC.match(/if \(_showOldReviewChrome\(\)\) (protoBadges|ctxBadges)\.appendChild\(buildTutorViewPill\(\)\);/g) || [];
ok(pills.length > 0 && pills.length === gated.length, '⭐ every "Tutor view · View as student" badge (sidebar + footer) is gated', { pills: pills.length, gated: gated.length });
ok(/if \(_showOldReviewChrome\(\)\) \{\s*const rbBar = el\('div', \{ className: 'swml-tutor-banner-bar' \}\);/.test(SRC), '⭐ the pill above the document is gated');
ok(!/if \(state\.reviewMode\) \{\s*const rbBar/.test(SRC), 'no ungated copy of the pill is left');
// v7.20.872: the entry box ("Tutor view · You can / You cannot") auto-opened once per lesson and covered the teal bar
// ~5 s after load (Web Design 122, measured) — with the pill gone there was no way to reopen it, so it follows the rule.
const entry = SRC.slice(SRC.indexOf('function maybeShowReviewEntryModal() {'), SRC.indexOf('function maybeShowReviewEntryModal() {') + 900);
ok(/if \(!state\.reviewMode\) return;\s*(?:\/\/[^\n]*\n\s*)*if \(!_showOldReviewChrome\(\)\) return;/.test(entry), '⭐ the once-per-lesson entry box is gated too (no pop-up where the teal bar is)');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ review-chrome-harness FAILED'); process.exit(1); }
console.log('✅ review-chrome-harness passed (one review bar: Focus\'s, wherever it exists).');
