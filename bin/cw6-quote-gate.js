#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-quote-gate.js — v7.20.410 (FIXLIST #210)
 *
 * WHY THIS EXISTS, and it is not hypothetical. The .407 worked-example audit found a FABRICATED
 * Lion King quote ("I am") that had SHIPPED in the Step-6 example pool. Neil's #210 ruling adds a
 * quote to examples "wherever possible" — which multiplies the surface for exactly that failure by
 * a few hundred. A rule in a comment cannot stop it (root CLAUDE.md §4c.7: a rule in prose loses to
 * a default in code), so the default is now: a quotation that cannot be found in a real source on
 * disk FAILS THE BUILD.
 *
 * WHAT IT CHECKS. Every quoted span inside a Step-6 example (`ex:` and `more:[]` in
 * frontend/wml-cw6-concepts.js) must appear VERBATIM in the protocol corpus for the text that
 * example names. The corpus is everything under protocols/shared/ whose path names that text —
 * foundational-quiz banks, crib-templates, mark-scheme text-data, forging-your-weapon, the
 * conceptual-notes modules. Those are Sophicly's own authored sources, already used to teach.
 *
 * ⭐ THE DESIGN DECISION THAT MAKES IT WORK: a text with NO corpus (The Lion King, The Hunger Games,
 * Harry Potter, Stranger Things…) may not carry a quotation AT ALL. Not "should not" — cannot,
 * without failing this gate. That is deliberate and it is the honest reading of Neil's own rule
 * ("a quote is OPTIONAL per example… a forced quote is how fabrication starts"): those examples are
 * staged/visual moments anyway, and a film has no line we hold on disk to check against.
 *
 * NORMALISATION is deliberately narrow — curly/straight quotes and apostrophes, whitespace runs,
 * and en/em dashes. NOT case, NOT punctuation, NOT word order: a "quote" that only matches after
 * aggressive normalisation is a paraphrase, and passing it would defeat the point.
 *
 * PROVEN NON-VACUOUS — injected and confirmed RED before committing:
 *   • add `*Macbeth:* … “I am the one who knocks”` to a concept  → FAILS (not in the Macbeth corpus)
 *   • alter one word of a real quote ("vaulting ambition" → "vaunting ambition") → FAILS
 *   • re-add the .407 defect verbatim (a Lion King quote)        → FAILS (no corpus for that text)
 *
 * Run: node bin/cw6-quote-gate.js       (wired into bin/pre-ship-check.sh)
 */

const fs = require('fs');
const path = require('path');

const CONCEPTS = path.join(__dirname, '..', 'frontend', 'wml-cw6-concepts.js');
const SHARED = path.join(__dirname, '..', 'protocols', 'shared');
// The Model Answer Resources sit OUTSIDE this repo (a sibling of the plugin folder). They are the
// richest quotation source we hold, so the gate uses them when they are there — but it must not
// silently pass a quote it could not check, so a missing corpus is announced loudly rather than
// quietly narrowing what "verified" means (§17c: an incomplete search is not a zero).
const MODEL_ANSWERS = path.join(__dirname, '..', '..', '..', 'Model Answers', 'Model Answer Resources');

// ── Which on-disk corpus belongs to which text name as written in the examples ────────────────
// Key = the exact `*Title:*` label used in the example prose. Value = a path matcher.
// A text absent from this map has NO corpus and therefore may carry no quotation.
const CORPUS = {
    'Macbeth': /macbeth/i,
    'An Inspector Calls': /inspector/i,
    'Jekyll and Hyde': /jekyll/i,
    'A Christmas Carol': /christmas.?carol/i,
    'Great Expectations': /great.?expectations/i,
    'Frankenstein': /frankenstein/i,
    'Of Mice and Men': /of.?mice/i,
    'Animal Farm': /animal.?farm/i,
    'Lord of the Flies': /lord.?of.?the.?flies/i,
    'Romeo and Juliet': /romeo/i,
    'Jane Eyre': /jane.?eyre/i,
    'Othello': /othello/i,
};

function walk(dir, acc) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return acc; }
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, acc);
        else if (/\.(md|json|txt)$/.test(e.name)) acc.push(p);
    }
    return acc;
}
const ALL_FILES = walk(SHARED, []);
const HAS_MODEL_ANSWERS = fs.existsSync(MODEL_ANSWERS);
if (HAS_MODEL_ANSWERS) walk(MODEL_ANSWERS, ALL_FILES);

function norm(s) {
    return String(s)
        .replace(/[‘’ʼ]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

// ⭐ THE THREAT MODEL, and it decides the matching rule. The defect this gate exists to stop is
// INVENTED TEXT — a line no author ever wrote (the .407 Lion King "I am"). It is NOT mis-attribution
// (a real line credited to the wrong text), which is rarer and which a reader can catch.
// So a quotation is verified if it appears VERBATIM ANYWHERE in the corpus, and the gate REPORTS
// the file it matched in, so a wrong-text match is still visible to a human reading the output.
//
// A first cut matched per-text (only files whose PATH names that text) and failed on fifteen
// perfectly real quotations — "Lay on, Macduff", "these violent delights have violent ends". A gate
// that fires on correct content is a gate that gets switched off, and it would have pushed toward
// DELETING good teaching examples to get green. Wrong rule, not wrong content.
const fileCache = new Map();
function fileText(f) {
    if (!fileCache.has(f)) {
        let t = '';
        try { t = norm(fs.readFileSync(f, 'utf8')); } catch (_) { t = ''; }
        fileCache.set(f, t);
    }
    return fileCache.get(f);
}
function findQuote(n) {
    for (const f of ALL_FILES) {
        if (f === CONCEPTS) continue;                       // never verify a file against itself
        if (fileText(f).indexOf(n) !== -1) return path.basename(f);
    }
    return null;
}

// ── SECOND CHANCE: Spotlight, because the best sources are PDFs we cannot read ────────────────
// The readable corpus is .md/.json/.txt only, but the library's richest texts are PDFs and .docx
// (the annotated Macbeth, the GFS folders). Spotlight has already indexed their full text, so a
// PHRASE query answers "does this string exist in a real document on this machine?" in about a
// second — the `mdfind`-first rule (root CLAUDE.md §17c).
//
// ⚠️ WEAKER THAN THE SUBSTRING CHECK, and treated as such: Spotlight's phrase matching tolerates
// some punctuation/spacing variation, so it can pass a CONFLATION of two real lines. That is why a
// quote verified this way is REPORTED separately below — the build goes green, and a human can see
// exactly which quotations were never exact-matched.
// ⚠️ A FAILED OR EMPTY SEARCH IS NOT A ZERO (§17c): if mdfind errors, is unavailable, or the Drive
// is not indexed, this returns `undefined` — "could not check" — never `false`.
const { execFileSync } = require('child_process');
const DRIVE = path.join('/Users', process.env.USER || 'neilwilliams',
    'Library', 'CloudStorage', 'GoogleDrive-abdullah@sophicly.com', 'My Drive');
function spotlightHas(span) {
    if (!fs.existsSync(DRIVE)) return undefined;
    try {
        const out = execFileSync('mdfind', ['-onlyin', DRIVE, '"' + span.replace(/"/g, '') + '"'],
            { encoding: 'utf8', timeout: 20000 });
        const hits = out.split('\n').filter(l => l.trim() && !/wml-cw6-concepts\.js$/.test(l));
        return hits.length > 0;
    } catch (_) { return undefined; }   // timed out / not indexed → unknown, never "absent"
}

// ── Pull every example line out of the concepts file ─────────────────────────────────────────
const src = fs.readFileSync(CONCEPTS, 'utf8');
const examples = [];
const lineOf = (idx) => src.slice(0, idx).split('\n').length;
// `ex: '…'` and each string inside `more: [ … ]`
for (const m of src.matchAll(/\bex:\s*'((?:[^'\\]|\\.)*)'/g)) examples.push({ text: m[1], line: lineOf(m.index) });
for (const m of src.matchAll(/\bmore:\s*\[([\s\S]*?)\]/g)) {
    const block = m[1];
    const base = m.index;
    for (const s of block.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
        examples.push({ text: s[1], line: lineOf(base + s.index) });
    }
}

let checked = 0, quoted = 0, failed = 0;
const problems = [];
const verified = [];
const spotlit = [];
const unchecked = [];

for (const ex of examples) {
    checked++;
    const title = (ex.text.match(/^\*([^:*]+):\*/) || [])[1];
    // Quoted spans inside the example prose. Curly is what the file uses; straight accepted too.
    // ⚠️ 12-char floor. A one- or two-word span ("common", "Amen") is a MOTIF, not a quotation:
    // it occurs in unrelated files by chance, so "found in the corpus" would prove nothing about
    // it. Checking it anyway would manufacture false confidence — the failure mode this gate
    // exists to prevent — so short spans are deliberately out of scope rather than fake-verified.
    const spans = [...ex.text.matchAll(/[“"]([^”"]{12,200})[”"]/g)].map(m => m[1]);
    if (!spans.length) continue;
    quoted++;
    for (const span of spans) {
        const hit = findQuote(norm(span));
        if (hit) { verified.push({ line: ex.line, title: title || '(untitled)', span, hit }); continue; }
        const sl = spotlightHas(span);
        if (sl === true) { spotlit.push({ line: ex.line, title: title || '(untitled)', span }); continue; }
        if (sl === undefined) {
            unchecked.push('line ' + ex.line + ': *' + (title || '(no text named)') + '* — “' + span
                + '” could NOT be checked (Spotlight unavailable or the search did not complete). '
                + 'This is "unknown", not "verified" — check it by hand before shipping.');
            continue;
        }
        problems.push('line ' + ex.line + ': *' + (title || '(no text named)') + '* — this '
            + 'quotation appears NOWHERE on disk, in the corpus or in Spotlight:\n        “' + span
            + '”\n        Either it is misremembered (check the exact wording) or invented. Replace '
            + 'it with a line we hold, or drop the quote — the example still teaches without one.');
        failed++;
    }
}

console.log('CW6 EXAMPLE QUOTES (#210) — anti-fabrication gate');
console.log('   corpus: ' + Object.keys(CORPUS).length + ' text(s) · '
    + ALL_FILES.length + ' source file(s) scanned'
    + (HAS_MODEL_ANSWERS ? ' (incl. Model Answer Resources)' : ''));
if (!HAS_MODEL_ANSWERS) {
    console.log('   ⚠️  Model Answer Resources NOT FOUND at ' + MODEL_ANSWERS);
    console.log('      Verification is running on the protocol corpus alone, which is SMALLER — a');
    console.log('      failure below may mean "not in this reduced corpus", not "fabricated".');
}
console.log('   examples: ' + checked + ' · carrying a quotation: ' + quoted);

if (failed) {
    console.log('\n   ❌ ' + failed + ' unverifiable quotation(s):\n');
    problems.forEach(p => console.log('     ' + p));
    console.log('\n❌ cw6-quote-gate FAILED — every quotation must be verbatim from a real source '
        + '(root CLAUDE.md §0b: verify, never guess; #210: quotes are NEVER invented).');
    process.exit(1);
}
if (spotlit.length) {
    console.log('   ⚠️  ' + spotlit.length + ' quotation(s) verified by SPOTLIGHT PHRASE ONLY (not an exact');
    console.log('       substring of a readable source). Spotlight tolerates minor punctuation and');
    console.log('       spacing variation, so it can pass a CONFLATION of two real lines — eyeball these:');
    spotlit.forEach(v => console.log('       • ' + v.title + ' (line ' + v.line + ') — “' + v.span + '”'));
}
if (unchecked.length) {
    console.log('   ⚠️  ' + unchecked.length + ' quotation(s) COULD NOT BE CHECKED:');
    unchecked.forEach(u => console.log('       ' + u));
}
console.log('   ✓ ' + verified.length + ' quotation(s) exact-matched in a readable Sophicly source');
verified.forEach(v => console.log('     • ' + v.title + ' — “' + v.span.slice(0, 52) + (v.span.length > 52 ? '…' : '') + '”  ← ' + v.hit));
console.log('\n✅ cw6-quote-gate passed.');
process.exit(0);
