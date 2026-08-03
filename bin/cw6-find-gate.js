#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-find-gate.js — v7.20.411 (FIXLIST #227)
 *
 * WHY THIS EXISTS. Neil asked for a chip that deep-links into the Table of Techniques with a SEARCH
 * TERM rather than a single card — *"if we type in hook, it actually gives you eleven different
 * types of hooks."* A term that matches nothing lands the student on a grid where everything is
 * dimmed, with no idea why, which is strictly worse than no chip at all (§4d: refused, with
 * nothing). So every `find.q` in the concept map is checked against the REAL technique dataset and
 * must clear a minimum match count or the build fails.
 *
 * ⭐ IT REPLICATES THE TABLE'S OWN PREDICATE, taken from `apply()` in the notes bundle:
 *     nameTxt = (d.n + ' ' + d.s).toLowerCase()
 *     tagTxt  = ((d.k||[]).join(' ') + ' ' + (STAGS[d.s]||[]).join(' ')).toLowerCase()
 *     has(t)  = t.includes(q) || (words(len>3).length > 1 && every word in t)
 * and it loads the dataset by EVALUATING the shipped bundle's data region — so it sees the real
 * cards, not a copy that can drift (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`).
 *
 * ⚠️ DELIBERATELY UNDER-COUNTS. The table also scores weaker COLLSEARCH/SEARCHMETA hits (score
 * 40/20) which are built inside the bundle's IIFE and are not extractable here. Ignoring them means
 * this gate's count is a LOWER BOUND — a term that passes here definitely works; a term that fails
 * here might still return a few weak hits. Under-counting is the safe direction for a gate.
 *
 * ⚠️ THE DATASET LIVES IN ANOTHER LANE'S REPO (sophicly-notes, a sibling folder). If it is not
 * there, this gate says so LOUDLY and fails rather than passing silently — "could not check" is not
 * "verified" (§17c: an incomplete search is not a zero).
 *
 * ⚠️ THE COUNT TRAP THAT ALMOST SHIPPED: a first cut read only the initial `const D=[…]` literal and
 * got 132 cards, and "hook" scored ZERO — which contradicted what Neil had seen with his own eyes.
 * The dataset is EXTENDED by a series of `D.push(...DRAMA,...STORY,...HOOKS,…)` calls; the whole
 * HOOKS family lives in one of them. Reading the first literal only would have deleted every chip
 * as "unverifiable". Always evaluate through the pushes, never just the declaration.
 *
 * Run: node bin/cw6-find-gate.js       (wired into bin/pre-ship-check.sh)
 */

const fs = require('fs');
const path = require('path');

const CONCEPTS = path.join(__dirname, '..', 'frontend', 'wml-cw6-concepts.js');
const TABLE = path.join(__dirname, '..', '..', '..', '..', 'sophicly-plugins', 'sophicly-notes',
    'assets', 'js', 'sophicly-techniques.js');

const MIN_HITS = 3;   // below this, the named card chips already serve the student better

if (!fs.existsSync(TABLE)) {
    console.log('CW6 FAMILY-SEARCH CHIPS (#227)');
    console.log('   ❌ Technique dataset NOT FOUND at ' + TABLE);
    console.log('      The chips deep-link into it, so their terms CANNOT be verified without it.');
    console.log('      This is "could not check", not "fine" — fix the path or check out sophicly-notes.');
    process.exit(1);
}

// ── Load the REAL dataset, through the D.push(...) extensions ────────────────────────────────
function balancedFrom(str, searchRe, open, close) {
    const at = str.search(searchRe);
    if (at < 0) throw new Error('could not locate ' + searchRe);
    let i = str.indexOf(open, at), depth = 0, inS = null, esc = false;
    const from = i;
    for (; i < str.length; i++) {
        const c = str[i];
        if (esc) { esc = false; continue; }
        if (inS) { if (c === '\\') esc = true; else if (c === inS) inS = null; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === open) depth++;
        else if (c === close) { depth--; if (!depth) return { code: str.slice(from, i + 1), end: i + 1 }; }
    }
    throw new Error('unbalanced');
}

const tsrc = fs.readFileSync(TABLE, 'utf8');
const dStart = tsrc.search(/const\s+D\s*=\s*\[/);
const stagsEnd = balancedFrom(tsrc, /const\s+STAGS\s*=\s*\{/, '{', '}').end;
let D, STAGS;
try {
    ({ D, STAGS } = new Function(tsrc.slice(dStart, stagsEnd) + '; return {D, STAGS};')());
} catch (e) {
    console.log('   ❌ could not evaluate the technique dataset — ' + e.message.slice(0, 160));
    process.exit(1);
}

function hitsFor(q) {
    q = String(q).toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 3);
    const has = t => t.includes(q) || (words.length > 1 && words.every(w => t.includes(w)));
    const out = [];
    for (const d of D) {
        const nameTxt = ((d.n || '') + ' ' + (d.s || '')).toLowerCase();
        const tagTxt = (((d.k || []).join(' ')) + ' ' + ((STAGS[d.s] || []).join(' '))).toLowerCase();
        if (has(nameTxt) || has(tagTxt)) out.push(d.n);
    }
    return out;
}

// ── Every find: term in the concept map ──────────────────────────────────────────────────────
const csrc = fs.readFileSync(CONCEPTS, 'utf8');
const terms = [...csrc.matchAll(/find:\s*\{\s*q:\s*'((?:[^'\\]|\\.)*)'\s*,\s*l:\s*'((?:[^'\\]|\\.)*)'/g)]
    .map(m => ({ q: m[1], l: m[2] }));

console.log('CW6 FAMILY-SEARCH CHIPS (#227)');
console.log('   dataset: ' + D.length + ' technique cards (through the D.push extensions)');
console.log('   chips:   ' + terms.length + ' concept(s) carry a find: term');

let failed = 0;
const seen = new Map();
for (const t of terms) {
    if (!seen.has(t.q)) seen.set(t.q, hitsFor(t.q));
    const h = seen.get(t.q);
    if (h.length < MIN_HITS) {
        console.log('   ❌ "' + t.q + '" (' + t.l + ') matches ' + h.length + ' card(s) — below the '
            + MIN_HITS + ' needed for a FAMILY chip. A student tapping this lands on a grid with '
            + (h.length ? 'almost nothing' : 'NOTHING') + ' lit up. Use the named technique card '
            + 'chip instead, or pick a term the table actually groups.');
        failed++;
    }
}
if (!failed) {
    [...seen.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([q, h]) => {
        console.log('   ✓ "' + q + '" → ' + h.length + ' cards: ' + h.slice(0, 6).join(', ')
            + (h.length > 6 ? ' …' : ''));
    });
}

// The label must not bake in a COUNT — the table grows, and a chip promising "11 hooks" becomes a
// lie the day a twelfth is added (the value-fossil class, §4c.7).
for (const t of terms) {
    if (/\b\d+\b/.test(t.l)) {
        console.log('   ❌ label "' + t.l + '" contains a number. The card count changes as the '
            + 'table grows; a chip that promises a count becomes wrong without anyone touching it.');
        failed++;
    }
}

console.log(failed ? '\n❌ cw6-find-gate FAILED (' + failed + ').'
    : '\n✅ cw6-find-gate passed (every family chip lands on a populated grid).');
process.exit(failed ? 1 : 0);
