#!/usr/bin/env node
/* eslint-env node */
/**
 * GATE — a marked question freezes ITSELF, never the whole paper. (v7.20.588, FIXLIST #461)
 *
 * WHY. Neil relayed a student (uid 1215, AQA Lang P1 T1): he wrote his answers into the PLAN
 * boxes, the assessment could not read them, he went back to the diagnostic and transferred
 * plan→response, returned — "and Sophia is not picking up that change."
 *
 * MEASURED on his real docs: the diagnostic held all four responses (887 words, saved 16:42:35);
 * the assessment still held none (saved 16:40:46) and carried `Feedback: Q1 (4 / 4)`. Q1 alone had
 * been marked — it is the retrieval question that needed no prose. That single mark set the
 * document-wide `_docMarked`, which gated the ENTIRE response family, so Q2-Q5 (all `(— / N)`,
 * all unmarked) were refused with no error and no log.
 *
 * The freeze itself is Neil's ruling and stays: *"if it's already marked, you shouldn't be able to
 * edit it from the previous lesson."* What was wrong is its GRANULARITY — "it" is the marked
 * question, not the paper. This gate pins both halves: the marked one stays frozen, the unmarked
 * siblings still flow.
 *
 *   node bin/per-question-freeze-gate.js
 *   node bin/per-question-freeze-gate.js --inject-defect
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const INJECT = process.argv.includes('--inject-defect');
let pass = 0, fail = 0;
const ok = (label, cond, got) => {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
};

const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');

// ── Extract the two REAL predicates from the shipping file and run them. Structure checks alone
//    would pass on a version that names the right things and still gates on the wrong scope.
const markedBlock = SRC.match(/const _markedQs = \(\(\) => \{[\s\S]*?\}\)\(\);/);
const frozenBlock = SRC.match(/const _sectionFrozen = \(label\) => \{[\s\S]*?\n {12}\};/);
ok('_markedQs is built from the doc', !!markedBlock);
ok('_sectionFrozen resolves a section to its own question', !!frozenBlock);
if (!markedBlock || !frozenBlock) { console.log('\n❌ cannot continue'); process.exit(1); }

// His real paper: Q1 marked 4/4, Q2-Q5 unmarked.
const DWIJ = [
    'data-section-label="Feedback: Q1 (4 / 4)"',
    'data-section-label="Feedback: Q2 (— / 8)"',
    'data-section-label="Feedback: Q3 (— / 8)"',
    'data-section-label="Feedback: Q4 (— / 20)"',
    'data-section-label="Feedback: Q5 (— / 40)"',
    'data-section-label="Q1 Response"', 'data-section-label="Q2 Response"',
    'data-section-label="Q3 Response"', 'data-section-label="Q4 Response"',
    'data-section-label="Q5 Response"',
].join('');

const build = (html) => {
    let mk = markedBlock[0], fz = frozenBlock[0];
    if (INJECT) {
        // The defect: fall back to the document-wide flag for every section.
        fz = 'const _sectionFrozen = (label) => _docMarked;';
    }
    const code = `
        const canvasEditor = { getHTML: () => ${JSON.stringify(html)} };
        const _docMarked = /data-section-label="[^"]*\\(\\s*\\d[^"]*\\/\\s*\\d+\\s*\\)/.test(canvasEditor.getHTML());
        ${mk}
        ${fz}
        return { docMarked: _docMarked, marked: [..._markedQs].sort(), frozen: _sectionFrozen };`;
    return new Function(code)();
};

console.log('\nHis real paper — Q1 marked 4/4, Q2-Q5 still (— / N):');
{
    const r = build(DWIJ);
    ok('the document-wide flag is TRUE (this is what used to freeze everything)', r.docMarked === true, r.docMarked);
    ok('exactly ONE question reads as marked', JSON.stringify(r.marked) === '["Q1"]', r.marked);
    ok('Q1 Response is FROZEN — its mark refers to those exact words', r.frozen('Q1 Response') === true);
    for (const q of ['Q2', 'Q3', 'Q4', 'Q5']) {
        ok(`${q} Response still FLOWS — it was never marked`, r.frozen(q + ' Response') === false,
            { q, frozen: r.frozen(q + ' Response') });
    }
}

console.log('\nA fully marked paper is still completely frozen:');
{
    const all = DWIJ.replace('(— / 8)"', '(6 / 8)"').replace('(— / 8)"', '(7 / 8)"')
                    .replace('(— / 20)"', '(14 / 20)"').replace('(— / 40)"', '(28 / 40)"');
    const r = build(all);
    ok('all five questions read as marked', r.marked.length === 5, r.marked);
    for (const q of ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']) ok(`${q} Response frozen`, r.frozen(q + ' Response') === true);
}

console.log('\nAn unmarked paper flows entirely, as it did before:');
{
    const r = build(DWIJ.replace('(4 / 4)"', '(— / 4)"'));
    ok('nothing reads as marked', r.marked.length === 0, r.marked);
    ok('the document flag is false', r.docMarked === false);
    for (const q of ['Q1', 'Q5']) ok(`${q} Response flows`, r.frozen(q + ' Response') === false);
}

console.log('\nUnresolvable sections stay CONSERVATIVE — we never write when we cannot tell:');
{
    const r = build(DWIJ);
    ok('a bare "Response" (single-part doc) falls back to the document flag → frozen',
        r.frozen('Response') === true);
    const clean = build(DWIJ.replace('(4 / 4)"', '(— / 4)"'));
    ok('…and on an unmarked paper that same bare "Response" flows', clean.frozen('Response') === false);
}

console.log('\nThe mirror actually consults it, and says so when it refuses:');
{
    ok('the response mirror is passed the per-section predicate',
        /_mirrorSections\(_upDocs, 'response', null, 'response', \{ frozen: _sectionFrozen \}\)/.test(SRC));
    ok('the outline mirror is too', /_mirrorSections\(_upDocs, 'outline', null, 'outline', \{ includeChecked: true, frozen: _sectionFrozen \}\)/.test(SRC));
    ok('the mirror checks it BEFORE deciding anything about the local copy',
        SRC.indexOf('mOpts.frozen(upLabel)') !== -1
        && SRC.indexOf('mOpts.frozen(upLabel)') < SRC.indexOf("const curText = (tNode.textContent"));
    ok('a refusal is logged, never silent', /section\(s\) FROZEN \(already marked/.test(SRC));
    ok('the calls are no longer wrapped in the document-wide if (!_docMarked)',
        !/if \(!_docMarked\) \{\s*\n\s*_mirrorSections\(_upDocs, 'response'/.test(SRC));
}

console.log(`\n${pass} passed · ${fail} failed.`);
if (INJECT) {
    if (!fail) { console.error('\n⛔ GATE IS BLIND: the injected document-wide freeze did not fail it.'); process.exit(1); }
    console.log(`Defect injection produced ${fail} failure(s) — the gate has teeth.`);
    process.exit(0);
}
process.exit(fail ? 1 : 0);
