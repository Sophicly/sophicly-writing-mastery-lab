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

// ⭐ v7.20.408 — CALLS THE REAL RESOLVER. It used to reimplement it, with a comment saying the copy
// "must stay byte-equivalent to conceptFor()". It did not stay equivalent, and could not have caught
// it if it had drifted: a check that duplicates its subject is testing its own memory
// (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`). The proof is the bug this file
// exists to catch — for months there were TWO live resolvers, this lint mirrored one of them, and
// the disagreement between them (41 of 232 beats) was invisible here.
// `CM.conceptFor` is now the one implementation; this maps its answer back to an index.
if (typeof CM.conceptFor !== 'function') {
    console.error('cw6-concept-lint: WML_CW6_CONCEPTS.conceptFor is not exported — the lint cannot test the real resolver.');
    process.exit(1);
}
function resolveIndex(hay, archetypeKey) {
    const c = CM.conceptFor(hay, '', archetypeKey);
    return c ? CONCEPTS.indexOf(c) : -1;
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

// ─────────────────────────────────────────────────────────────────────────────────────────
// ⭐ v7.20.408 — ROWMAP CHECKS. The 55+20 audited exceptions are only trustworthy if the table
// itself stays honest: a dead id serves NO concept (the row silently loses its examples and
// chips), a duplicate entry means one of the two is unreachable and nobody can tell which, and
// a REDUNDANT entry (the regex already resolves there) is drift waiting to happen — it hides the
// fact that the regex fix was made, so a later regex edit breaks a row the table appears to own.
// Row-level checks — coverage, dead LABELS, arch-scope violations — live in
// bin/cw6-outline-harness.js, which already parses the eight templates. Do not duplicate that
// extraction here; two copies of the template loader is the same trap as two resolvers.
// ─────────────────────────────────────────────────────────────────────────────────────────
const ROWMAP = CM.ROWMAP || [];
const idSet = {};
CONCEPTS.forEach(function (c) { idSet[c.id] = true; });

const seenEntry = {};
ROWMAP.forEach(function (e, i) {
    if (!e || !e.l || !e.id) { fatal.push('  ROWMAP[' + i + '] is missing `l` or `id`'); return; }
    if (!idSet[e.id]) {
        fatal.push('  ROWMAP[' + i + '] "' + e.l + '" → `' + e.id + '` — NO SUCH CONCEPT.\n'
            + '        That row would resolve to nothing: no criteria, no examples, no technique chips.');
    }
    if (e.arch && (!Array.isArray(e.arch) || !e.arch.length || e.arch.some(function (a) { return typeof a !== 'string' || !a; }))) {
        fatal.push('  ROWMAP[' + i + '] "' + e.l + '" — `arch` must be a non-empty array of archetype keys');
    }
    const key = e.l + '|' + (e.arch ? e.arch.slice().sort().join(',') : '*');
    if (seenEntry[key] !== undefined) {
        fatal.push('  ROWMAP[' + i + '] "' + e.l + '" duplicates ROWMAP[' + seenEntry[key] + '] — '
            + 'first match wins, so the second can never apply and nobody can tell which is live.');
    }
    seenEntry[key] = i;
});

// Redundant entries: the regex sweep would already land this label on the same concept.
// Not fatal — a belt-and-braces entry on a fragile phrase is a legitimate choice — but every one
// is a place where the table and the regex both claim ownership, so list them.
const redundant = [];
ROWMAP.forEach(function (e) {
    if (!e || !e.l || !idSet[e.id]) return;
    let best = null, bestLen = -1;
    for (let k = 0; k < CONCEPTS.length; k++) {
        const c = CONCEPTS[k];
        if (c.arch && e.arch && !e.arch.some(function (a) { return c.arch.indexOf(a) !== -1; })) continue;
        const m = (e.l + ' — ').match(c.m);
        if (!m) continue;
        const len = (m[0] || '').length;
        if (len > bestLen) { best = c; bestLen = len; }
    }
    if (best && best.id === e.id) redundant.push('  "' + e.l + '" → `' + e.id + '` (the regex already resolves here)');
});

console.log('cw6-concept-lint: ' + CONCEPTS.length + ' concepts, ' + ROWMAP.length + ' ROWMAP entries checked.');

if (redundant.length) {
    console.log('\nℹ️  ROWMAP entries the regex would resolve anyway (' + redundant.length + ') — safe, but the'
        + '\n    concept and the table both own these rows, so a later regex edit will not show up here:');
    redundant.slice(0, 12).forEach(function (r) { console.log(r); });
    if (redundant.length > 12) console.log('    … and ' + (redundant.length - 12) + ' more');
}

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
