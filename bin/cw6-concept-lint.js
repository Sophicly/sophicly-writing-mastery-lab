#!/usr/bin/env node
/**
 * cw6-concept-lint.js — v7.20.391
 *
 * WHY THIS EXISTS.
 * `conceptFor(label, prompt)` in wml-assessment.js resolves a Step-6 beat to one of the ~70
 * entries in wml-cw6-concepts.js. Until v7.20.391 it returned the FIRST regex that tested true,
 * so a concept became UNREACHABLE the moment an earlier, broader regex contained its phrase:
 *
 *     [ 0] Opening Image             /opening image/i
 *     [ 1] The Opening Image, Expanded  /expand on the opening image/i    <-- never reachable
 *
 * A student on the EXPANDED beat was served the plain Opening Image criteria, worked examples,
 * technique chips and guidance anchor. Nothing errors. A wrong concept looks exactly like a right
 * one, which is why it survived from the first port until Neil happened to tap "More examples" on
 * two different beats in one session (2026-08-01) and got the byte-identical bubble twice.
 *
 * This is the CLAUDE.md §5d class — "a value compared against that NOTHING anywhere emits, a
 * branch that can never be taken" — and §5d's own ruling is that such a rule must be MECHANICAL,
 * because a rule in prose loses to a default in code. Hence this file.
 *
 * WHAT IT CHECKS.
 *   A. FULLY SHADOWED  — every literal phrase a concept claims resolves to a DIFFERENT concept.
 *                        The concept can never be selected for any beat. FAILS the build.
 *   B. PARTIAL SHADOW  — some of its phrases resolve elsewhere. WARNS (a concept may legitimately
 *                        share vocabulary), but every warning is a beat getting another beat's
 *                        teaching, so read the list.
 *
 * Resolution here mirrors the SHIPPED rule exactly (longest matched substring wins, ties keep
 * array order). If the two ever diverge, this lint is testing its own memory rather than the
 * code — the `feedback_a_check_that_duplicates_its_subject_is_not_a_check` trap — so it imports
 * the real concept table rather than restating it, and the resolver is the only duplicated logic.
 *
 * Run: node bin/cw6-concept-lint.js        (wired into bin/pre-ship-check.sh)
 */
/* eslint-env node */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'frontend', 'wml-cw6-concepts.js');
if (!fs.existsSync(SRC)) {
    console.error('cw6-concept-lint: cannot find ' + SRC);
    process.exit(1);
}

global.window = {};
// eslint-disable-next-line no-eval
eval(fs.readFileSync(SRC, 'utf8'));
const CM = global.window.WML_CW6_CONCEPTS || {};
const CONCEPTS = CM.CONCEPTS || [];

if (!CONCEPTS.length) {
    console.error('cw6-concept-lint: no CONCEPTS found — did the export shape change?');
    process.exit(1);
}

// The SHIPPED resolver: most specific match wins, ties keep array order.
// Must stay byte-equivalent to conceptFor() in wml-assessment.js.
function resolveIndex(hay) {
    let best = -1, bestLen = -1;
    for (let k = 0; k < CONCEPTS.length; k++) {
        const m = hay.match(CONCEPTS[k].m);
        if (!m) continue;
        const len = (m[0] || '').length;
        if (len > bestLen) { best = k; bestLen = len; }
    }
    return best;
}

// The plain-text alternatives a concept claims. Anything with regex metacharacters is skipped —
// we can only test a phrase we can actually spell.
function literals(re) {
    return String(re)
        .replace(/^\/|\/[gimsuy]*$/g, '')
        .split('|')
        .map(function (s) { return s.replace(/\\/g, ''); })
        .filter(function (s) { return /^[a-z0-9 ,'-]+$/i.test(s) && s.trim().length > 2; });
}

const fatal = [];
const warn = [];

CONCEPTS.forEach(function (c, j) {
    const ls = literals(c.m);
    if (!ls.length) return;                       // nothing spellable to test — not a pass, just unknown
    const stolen = ls.filter(function (l) { return resolveIndex(l) !== j; });
    if (stolen.length === ls.length) {
        fatal.push('  [' + j + '] ' + (c.name || '(unnamed)') + '\n'
            + '        claims : ' + ls.join(' | ') + '\n'
            + '        taken by: ' + ls.map(function (l) {
                const w = resolveIndex(l);
                return '"' + l + '" -> [' + w + '] ' + ((CONCEPTS[w] || {}).name || '?');
            }).join('\n                  '));
    } else if (stolen.length) {
        warn.push('  [' + j + '] ' + (c.name || '(unnamed)') + ' — loses: ' + stolen.map(function (l) {
            const w = resolveIndex(l);
            return '"' + l + '" -> [' + w + '] ' + ((CONCEPTS[w] || {}).name || '?');
        }).join('; '));
    }
});

console.log('cw6-concept-lint: ' + CONCEPTS.length + ' concepts checked.');

if (warn.length) {
    console.log('\n⚠️  PARTIALLY SHADOWED (' + warn.length + ') — each one is a beat served another beat’s teaching:');
    warn.forEach(function (w) { console.log(w); });
}

if (fatal.length) {
    console.error('\n❌ FULLY UNREACHABLE (' + fatal.length + ') — no beat can ever resolve to these:');
    fatal.forEach(function (f) { console.error(f); });
    console.error('\nFix by making the phrase unambiguous, or by tightening the broader regex that swallows it.');
    process.exit(1);
}

console.log('✅ every concept is reachable.');
