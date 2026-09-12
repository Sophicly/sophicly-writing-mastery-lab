#!/usr/bin/env node
/* eslint-env node */
/**
 * PLACEHOLDER-PREDICATE GATE (#478, v7.20.606)
 *
 * WHAT FROZE A STUDENT'S DOCUMENT, and why prose could not have stopped it. "Is this section
 * still the untouched template?" was answered in SIX places by six copies of a phrase list. They
 * drifted: five knew `appear here after`, one knew `appear here (?:after|once)`. The Overall
 * Feedback placeholder ends "…will appear here ONCE your assessment is complete", so the five
 * short copies called it real content — and one of the five is the guard deciding whether a stale
 * document may be rebuilt. A PRISTINE document therefore reported hasFeedback=true with
 * responseWords=0, `isStale && hasStudentWork` preserved it for ever, and the right template could
 * never be built. Measured on prod: the Rosabel live-modelling lesson served the generic ESSAY
 * document for a multi-question paper, to the author AND to every attendee (a live-modelling
 * viewer renders the author's document).
 *
 * ⭐ THE SHAPE OF THE BUG IS "A LIST THAT MUST BE UPDATED BY HAND". Adding a placeholder is one
 * line in a template; teaching six regexes about it is not, and nothing failed when you skipped
 * it. So the predicate is now ONE function and this gate holds it to the templates: every
 * placeholder string the source actually emits must be recognised. A new placeholder the
 * predicate cannot see fails the build, instead of silently freezing a document months later.
 *
 * CHECKS
 *   A. exactly one placeholder predicate exists; no inline phrase-regex copies survive
 *   B. every emitted placeholder string is recognised by the predicate
 *   C. no emitted placeholder exceeds the length ceiling (or the ceiling silently stops matching)
 *   D. injected-defect proof: the pre-fix regex must FAIL on the Overall Feedback placeholder
 *      while the shipped predicate passes it — so this gate cannot pass on the old code
 *
 *   node bin/placeholder-predicate-gate.js
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(FILE, 'utf8');
let failed = 0;
const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => { console.log('  ✗ ' + m); failed++; };

// ── A. one predicate, no copies ───────────────────────────────────────────────────────────────
const declRe = /const\s+SWML_PLACEHOLDER_RE\s*=\s*(\/[^\n]*\/i)\s*;/;
const declM = src.match(declRe);
if (!declM) { bad('SWML_PLACEHOLDER_RE is not declared — the one predicate is gone'); }
else ok('SWML_PLACEHOLDER_RE declared once');

const fnM = src.match(/function\s+_isTemplatePlaceholderText\s*\(t\)\s*\{[\s\S]*?\n    \}/);
if (!fnM) bad('_isTemplatePlaceholderText() not found'); else ok('_isTemplatePlaceholderText() found');

const inlineCopies = src.match(/\/[^\n\/]*will appear after assessment[^\n\/]*\/i/g) || [];
if (inlineCopies.length) bad(`${inlineCopies.length} inline placeholder regex copy(ies) survive — they WILL drift again`);
else ok('no inline placeholder-regex copies remain (was 6 before the fix)');

const ceilM = src.match(/const\s+SWML_PLACEHOLDER_MAX\s*=\s*(\d+)\s*;/);
if (!ceilM) bad('SWML_PLACEHOLDER_MAX not found'); else ok(`length ceiling declared (${ceilM[1]})`);

if (failed) { console.log('\nFAIL — the predicate itself is not intact.\n'); process.exit(1); }

// Build the real predicate from the shipped source — never a re-typed copy.
const MAX = parseInt(ceilM[1], 10);
const RE = eval(declM[1]);                                       // eslint-disable-line no-eval
const isPlaceholder = (t) => {
    const s = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    if (!s) return true;
    if (s.length > MAX) return false;
    return RE.test(s);
};

// ── B/C. every emitted placeholder must be recognised ─────────────────────────────────────────
// The population: <em>…</em> literals the templates emit whose wording announces future content.
const emitted = [...new Set((src.match(/<em>[^<{$'"`]{15,240}<\/em>/g) || [])
    .map(s => s.replace(/^<em>|<\/em>$/g, '').trim())
    .filter(s => /\bwill appear\b|\bwill be assessed\b|\bwill be filled\b|\bappear here\b|\bwill begin here\b/i.test(s)))];

console.log(`\n  placeholder strings emitted by the templates: ${emitted.length}`);
let unseen = 0, tooLong = 0;
for (const s of emitted) {
    if (s.length > MAX) { bad(`exceeds the ${MAX}-char ceiling, so the predicate refuses it: "${s.slice(0, 70)}…"`); tooLong++; continue; }
    if (!isPlaceholder(s)) { bad(`NOT recognised as a placeholder: "${s.slice(0, 70)}…"`); unseen++; }
}
if (!unseen && !tooLong) ok(`all ${emitted.length} recognised, none over the ceiling`);

// ── E. every reader of a section's text must strip the runtime control-row chrome ────────────
// v7.20.607: a feedback block renders a mark widget ("Predicted —·Actual —·Δ ——0123") and, on
// Analytics, an opt-out counter — at RUNTIME, so it is absent from the saved HTML and present in
// the live DOM. Reading the whole block therefore reports "student work" on a pristine template.
// _sectionContentOf() exists to strip it; the stale-regen guard was the one reader that did not
// call it, which is what actually froze the Rosabel document even after the predicate was fixed.
const guardM = src.match(/_fd\.querySelectorAll\('\[data-section-type="feedback"\]'\)[\s\S]{0,4000}?\}\);/);
if (!guardM) bad('the stale-regen feedback scan was not found — check this gate still points at it');
else if (!/_sectionContentOf\s*\(\s*fb\s*\)/.test(guardM[0]))
    bad('the stale-regen guard reads the whole feedback block — runtime chrome will read as student work and freeze the document');
else ok('the stale-regen guard strips control-row chrome via _sectionContentOf');

// and the chrome strings themselves must never be mistaken for student work once stripped
const CHROME = 'Opt-outs this attempt—012345678910Top Missed AreasOpt-outs This AttemptNumber of times you opted out';
if (isPlaceholder(CHROME)) ok('note: chrome text alone would not trip the predicate');
else ok('chrome text is NOT a placeholder — which is exactly why it must be stripped, not matched');

// ── F. derived panels must be excluded from the "has student work" test ──────────────────────
// Analytics / Score Summary / Action Plan / Document Progress are feedback-typed for layout, but
// the engine draws them from stored scores. Analytics renders 117 chars of its own sub-headings on
// an untouched document; counting that as student work froze Rosabel through two earlier fixes.
const derM = src.match(/const\s+SWML_DERIVED_PANEL_RE\s*=\s*(\/[^\n]*\/i)\s*;/);
if (!derM) bad('SWML_DERIVED_PANEL_RE not declared — derived panels would count as student work');
else {
    const DER = eval(derM[1]);                                   // eslint-disable-line no-eval
    const mustSkip = ['Analytics', 'Score Summary', 'Action Plan', 'Document Progress'];
    const missed = mustSkip.filter(l => !DER.test(l));
    if (missed.length) bad('derived panels not excluded: ' + missed.join(', '));
    else ok('all four derived panels excluded from the student-work test');
    const mustCount = ['Feedback: Introduction (— / 3)', 'Feedback: Body 1 (— / 7)', 'Overall Feedback'];
    const wrong = mustCount.filter(l => DER.test(l));
    if (wrong.length) bad('a REAL feedback box is being skipped: ' + wrong.join(', '));
    else ok('the real feedback boxes are still counted (Feedback: … and Overall Feedback)');
}
if (!/SWML_DERIVED_PANEL_RE\.test/.test(guardM ? guardM[0] : ''))
    bad('the stale-regen guard does not skip derived panels');
else ok('the stale-regen guard skips derived panels');

// ── D. injected-defect proof ──────────────────────────────────────────────────────────────────
const OVERALL = 'Your examiner’s overall summary — holistic evaluation, key strength, and priority targets — will appear here once your assessment is complete.';
const PRE_FIX = /will appear after assessment|will be assessed here|appear here after/i;
if (PRE_FIX.test(OVERALL)) bad('the pre-fix regex matches the Overall Feedback placeholder — this gate proves nothing');
else ok('injected defect: the pre-fix regex does NOT match the Overall Feedback placeholder (the real bug)');
if (!isPlaceholder(OVERALL)) bad('the shipped predicate does NOT match the Overall Feedback placeholder — the bug is still live');
else ok('the shipped predicate DOES match it — a pristine document can be rebuilt again');

// real feedback must never be mistaken for a placeholder (the dangerous direction)
const REAL = 'Your response will appear stronger if you develop the second paragraph: the quotation is well chosen but the analysis stops at identification. '
    + 'Push into the connotations of "shroud" and link them to Dickens’s argument about social responsibility, then do the same for the third paragraph, '
    + 'where the point about Scrooge’s isolation is made twice rather than developed once.';
if (isPlaceholder(REAL)) bad('real examiner feedback containing "will appear" was called a placeholder — a regen could wipe real work');
else ok('long real feedback containing the trigger phrase is NOT called a placeholder (the ceiling does its job)');

console.log('');
if (failed) { console.log(`FAIL — ${failed} problem(s). A placeholder the predicate cannot see will freeze a document for ever.\n`); process.exit(1); }
console.log('PASS — one predicate, every emitted placeholder recognised, and the original defect is proven caught.\n');
