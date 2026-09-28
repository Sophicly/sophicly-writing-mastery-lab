#!/usr/bin/env node
/* eslint-env node */
/**
 * para-pop-harness.js — v7.20.650 (FIXLIST #637/#637b): A DETACHABLE PARAGRAPH WHEREVER THERE IS
 * A PARAGRAPH.
 *
 * WHY THIS EXISTS
 * Neil, 2026-09-28: "there need to be a detachable button in the feedback section for each
 * paragraph… a detachable paragraph wherever there is a paragraph… if a student decided to write
 * six paragraphs… each one would need to be detachable." The card's "Your paragraph:" line is
 * Sophia's QUOTE, shortened with "…" (measured on 1938's staging doc — Q4 BP3 reads "…losing a
 * loved one... This sta…"), so the pad must show the student's OWN paragraph from the response,
 * found by matching the quote's opening words — never by number, because numbers disagree the
 * moment a student writes six paragraphs or an introduction Sophia does not number.
 *
 * WHAT IT CHECKS
 *   1. THE MATCHER — _paraPopNorm / _paraPopQuote / _paraPopMatch are EXTRACTED from the shipped
 *      file (between the @PARA-POP-PURE sentinels), never re-typed, and driven through the shapes
 *      measured on the real document: a quote cut by "…", an ellipsis in the MIDDLE, curly vs
 *      straight quotes/apostrophes, a quote that starts mid-paragraph, two paragraphs sharing an
 *      opening, and a paraphrase that must NOT be claimed as a match.
 *   2. THE LINE RULE — PARA_POP_LINE_RE claims "Your paragraph/introduction/conclusion: "…"" and
 *      never "Your Paragraph Rewritten to Gold Standard" (the gold-model label sits in the same card).
 *   3. THE MOLD — a LearnChip-shaped inline atom (zero textContent, contenteditable=false), healed
 *      in by PM transactions at the same three cadences, ONE delegated click, the learn healer
 *      stepping over it, and the pad on the shared floating shell (drag + resize, fail-loud body).
 *   4. REACHABILITY — the pad's vh has its dvh twin and the scroller has min-height:0.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = read('frontend/wml-assessment.js');
const css = read('frontend/wml-canvas.css');

let pass = 0, failN = 0;
function ok(cond, label, detail) {
    if (cond) { pass++; console.log('  ✓ ' + label); }
    else { failN++; console.log('  ✗ ' + label + (detail ? ' — ' + detail : '')); }
}

console.log('\n1 · the matcher (extracted from the shipped file)');
const a = js.indexOf('// ── @PARA-POP-PURE');
const b = js.indexOf('// ── @PARA-POP-PURE-END ──');
ok(a !== -1 && b > a, '@PARA-POP-PURE sentinels present');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(js.slice(a, b), ctx);
const run = (fn, ...args) => ctx[fn](...args);

const paras = [
    'Allende begins the extract by focusing on the emotional instability in Alex’s mind. The simile compares him to a boat adrift at sea. It makes us feel as though we do not belong anywhere.',
    'Allende employs an image of a storm as a way to describe how Alex is being swallowed and consumed by grief.',
    'Allende uses a whole text shift to move the focus of the extract from Alex’s dream to his mother.',
    'Hallucinations are a common theme experienced by those who are losing a loved one, and they appear here. This startles the reader.',
];
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "Allende begins the extract by focusing on the emotional instability in Alex\'s mind. The simile…"'), paras) === 0,
    'quote cut by "…" → paragraph 1 (straight apostrophe in the quote, curly in the answer)');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: “Allende employs an image of a storm as a way to describe how Alex…”'), paras) === 1,
    'curly quotes around the quote → paragraph 2');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "Hallucinations are a common theme experienced by those who are losing a loved one... This sta"'), paras) === 3,
    'an ellipsis in the MIDDLE: only the words before it are matched → paragraph 4');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "The simile compares him to a boat adrift at sea…"'), paras) === 0,
    'a quote that starts mid-paragraph still finds its paragraph');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "Allende uses a whole text shift to move the focus"'), paras) === 2,
    'two paragraphs open with "Allende …" — the longer run of matching words wins');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "The writer describes a storm to show grief"'), paras) === null,
    'a PARAPHRASE is not claimed as a match (null → the caller falls back to the line’s position)');
ok(run('_paraPopMatch', run('_paraPopQuote', 'Your paragraph: "Alex"'), paras) === null,
    'too short to be evidence (under three words) → null, never a guess');
ok(run('_paraPopQuote', 'Your introduction: "As a reader, I mostly agree…"') === 'As a reader, I mostly agree',
    '_paraPopQuote strips the label, the opening quote and everything after the ellipsis');

console.log('\n2 · which lines get a chip');
const reM = js.match(/const PARA_POP_LINE_RE = (\/.+\/i);/);
ok(!!reM, 'PARA_POP_LINE_RE present');
const RE = reM ? vm.runInNewContext(reM[1]) : /$^/;
ok(RE.test('Your paragraph: "Allende begins the extract…"'), 'claims "Your paragraph: "…""');
ok(RE.test('Your introduction: “As a reader, I mostly agree…”'), 'claims "Your introduction: “…”"');
ok(RE.test('Your conclusion: "Ultimately, Allende showcases…"'), 'claims "Your conclusion: "…""');
ok(!RE.test('Your Paragraph Rewritten to Gold Standard'), 'never the gold-model label "Your Paragraph Rewritten to Gold Standard"');
ok(!RE.test('Your paragraph needs a sharper topic sentence.'), 'never a sentence of feedback that merely starts "Your paragraph"');

console.log('\n3 · the mold (source checks)');
ok(/const ParaPop = Node\.create\(\{\s*name: 'paraPop',\s*inline: true,\s*group: 'inline',\s*atom: true,\s*selectable: false/.test(js), 'ParaPop is an inline, non-selectable atom (the LearnChip shape)');
ok(/contenteditable: 'false',\s*\}\)\];\s*\},\s*\}\);\s*\n\s*\/\/ Custom Comment Mark/.test(js), 'renderHTML makes it a contenteditable=false island');
ok(/\.swml-para-pop-node::before \{ content: 'Pop out \\2197'; \}/.test(css), 'the label comes from CSS ::before — the node adds ZERO textContent');
ok(/LearnChip, \/\/ v7\.19\.949[^\n]*\n\s*ParaPop,/.test(js), 'ParaPop is registered in the editor extensions, beside LearnChip');
const heals = (js.match(/_healParaPopChips\(\)/g) || []).length;
ok(heals >= 4, 'healed at the learn-chip cadences (mount, 1.5s, 3.5s, overlay rebuild) — ' + heals + ' calls');
ok(/if \(inl\.type\.name === 'paraPop'\) continue;[^\n]*\n\s*if \(inl\.type\.name !== 'learnChip'\) break;/.test(js), 'the learn healer steps over a pop-out chip (else it would re-insert learn chips on every heal)');
ok(/canvasEditor\.commands\.insertContentAt\(i\.at, \{ type: 'paraPop'/.test(js), 'chips go in through PM transactions, never a DOM write');
ok(/window\.__swmlParaPopBound/.test(js) && /closest\('\.swml-para-pop-node'\)/.test(js), 'ONE delegated click, bound once');
ok(/textBetween\(0, c\.content\.size, '\\n', leaf => \(leaf\.type\.name === 'hardBreak' \? '\\n' : ''\)\)/.test(js), 'paragraphs are read from the DOCUMENT MODEL (hard breaks), never from Sophia’s quote');
ok(/_openParaPadHook = \(o\) => \{[\s\S]{0,2600}_makePanelInteractive\(panel\);/.test(js), 'the pad is the shared floating shell (drag + 8-way resize)');
ok(/This answer is not in the document yet/.test(js), 'an empty pad FAILS LOUD, never blank (§4d)');
ok(/if \(idx == null && ord >= 0 && ord < paras\.length\) idx = ord;/.test(js), 'no confident quote match → the line’s position, stated as "Paragraph N of M"');

console.log('\n4 · reachability (the pad scrolls to its end)');
ok(/\.swml-para-pad \{[^}]*max-height: 60vh; max-height: 60dvh;/.test(css), 'vh carries its dvh twin (iOS bars)');
ok(/\.swml-para-pad \.swml-extract-panel-body \{[^}]*min-height: 0;/.test(css), 'the flex-column scroller has min-height:0');

console.log('\n' + (failN ? '✗ ' + failN + ' failed, ' + pass + ' passed' : '✓ para-pop-harness: all ' + pass + ' checks passed'));
process.exit(failN ? 1 : 0);
