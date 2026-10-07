#!/usr/bin/env node
/* eslint-env node */
/**
 * paragraph-count-harness.js — #418, v7.20.548
 *
 * Neil, 2026-08-22, after watching Q2 correctly report two paragraphs for the first time:
 *   *"we need to make sure that it's also able to detect the paragraphs in other questions as
 *   well. But it mustn't falsely detect them."*
 *
 * BOTH DIRECTIONS ARE DEFECTS, and they cost different things:
 *   • A MISS merges two paragraphs into one. The marker then has one paragraph where the
 *     protocol expects two, and the universal per-paragraph rule (mark · feedback · gold ·
 *     alternative, for EVERY paragraph) silently under-delivers. This is what #416 fixed for
 *     the payload as a whole.
 *   • A FALSE SPLIT invents a paragraph that the student did not write. Worse than a miss,
 *     because the marker then marks something nobody wrote and tells a student their structure
 *     is wrong when it is not.
 *
 * This drives the REAL `_mqParas` — sliced out of getResponseText in wml-assessment.js, never
 * re-typed (§14c) — over realistic responses for the shapes that actually occur across the
 * paper: a two-paragraph Q2, a three-paragraph Q3, a five-part Q4 essay, a Q5 with a
 * deliberately short dramatic beat, and a single paragraph that the student soft-wrapped with
 * Shift+Enter.
 *
 * THE DOM IS SHIMMED, THE RULE IS NOT. The shim provides only cloneNode/querySelectorAll/
 * innerHTML/textContent; every decision about where a paragraph begins is made by the shipped
 * code under test.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC_PATH = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');

let fails = 0, checks = 0;
function ok(cond, msg) {
    checks++;
    if (cond) console.log('  ✓ ' + msg);
    else { fails++; console.log('  ❌ ' + msg); }
}

// ── slice the REAL rule ─────────────────────────────────────────────────────
function sliceArrowFn(name) {
    const at = SRC.indexOf('const ' + name + ' = (section');   // v7.20.672: (section, keepEm)
    if (at < 0) throw new Error('cannot find ' + name);
    let i = SRC.indexOf('{', SRC.indexOf('=>', at)), depth = 0;
    for (; i < SRC.length; i++) {
        if (SRC[i] === '{') depth++;
        else if (SRC[i] === '}') { depth--; if (depth === 0) return SRC.slice(at, i + 1) + ';'; }
    }
    throw new Error('unbalanced braces in ' + name);
}
// v7.20.735 (#769/#771): the rule moved to module scope as `function _answerParas` (the pop-out pad reads with it
// too); getResponseText keeps `const _mqParas = _answerParas;`. Slice whichever form the source holds.
function sliceRule() {
    const at = SRC.indexOf('function _answerParas(section, keepEm, asStatements) {');
    if (at < 0) return sliceArrowFn('_mqParas');
    let i = SRC.indexOf('{', at), depth = 0;
    for (; i < SRC.length; i++) {
        if (SRC[i] === '{') depth++;
        else if (SRC[i] === '}') { depth--; if (depth === 0) return SRC.slice(at, i + 1) + '\nconst _mqParas = _answerParas;'; }
    }
    throw new Error('unbalanced braces in _answerParas');
}
const RULE_SRC = sliceRule();
ok(RULE_SRC.length > 400, 'sliced the real paragraph rule whole (' + RULE_SRC.length + ' chars)');
ok(/const _mqParas = _answerParas;/.test(SRC) && !/const _mqParas = \(section/.test(SRC), 'getResponseText reads through the ONE module-scope reader (no second copy)');

// ── the smallest DOM that lets the real rule run ────────────────────────────
function stripTags(html) {
    return html.replace(/<[^>]*>/g, '');
}
function makeSection(html) {
    const node = {
        _html: html,
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = v; },
        get textContent() { return stripTags(this._html); },
        cloneNode() { return makeSection(this._html); },
        // v7.20.672: removal is REAL for the elements the rule strips — the Preview strip, buttons
        // and <em> — so a fixture carrying them tests the rule, not the shim.
        querySelectorAll(sel) {
            const self = this, found = [];
            const pats = [];
            if (/swml-ana-strip/.test(sel)) pats.push(/<div[^>]*class="[^"]*swml-ana-strip[^"]*"[^>]*>[\s\S]*?<\/div>/g);
            if (/\bbutton\b/.test(sel)) pats.push(/<button[^>]*>[\s\S]*?<\/button>/g);
            if (/^em$|,\s*em\b/.test(sel.trim())) pats.push(/<em[^>]*>[\s\S]*?<\/em>/g);
            pats.forEach(re => (self._html.match(re) || []).forEach(m => found.push({ remove() { self._html = self._html.replace(m, ''); } })));
            return found;
        },
    };
    return node;
}
const documentShim = {
    createElement: function () {
        return {
            _html: '',
            set innerHTML(v) { this._html = v; },
            get innerHTML() { return this._html; },
            get textContent() { return stripTags(this._html); },
        };
    },
};
const mqParas = new Function('document', RULE_SRC + '\nreturn _mqParas;')(documentShim);

// ── fixtures: real shapes, real lengths ─────────────────────────────────────
const words = n => Array.from({ length: n }, (_, i) => 'word' + (i + 1)).join(' ');
const P = t => '<p>' + t + '</p>';

const CASES = [
    {
        name: 'Q2 — two full paragraphs (Neil’s own answer)',
        html: P('The writer uses language to describe the storm as a symbolic reflection of Alex’s fears, '
            + 'using the triadic list when the wind begins lashing the trees, rain on the rooftop and thunder.')
            + P('In addition, the storm can also be seen as a violent monster making Alex fearful, described '
            + 'with personification as spilling in furious waves against the cliffs and as a monster.'),
        expect: 2,
        why: 'the case that was reported as "one continuous piece" before v7.20.545',
    },
    {
        name: 'Q3 — three body paragraphs',
        html: P(words(40)) + P(words(45)) + P(words(38)),
        expect: 3,
        why: 'Q3’s taught structure is three paragraphs — the marker needs all three',
    },
    {
        name: 'Q4 — essay shape: intro + 3 bodies + conclusion',
        html: P(words(30)) + P(words(60)) + P(words(55)) + P(words(58)) + P(words(28)),
        expect: 5,
        why: 'the essay map labels Introduction / Body 1-3 / Conclusion by POSITION, so a miscount '
            + 'renames every paragraph after it',
    },
    {
        name: 'a single paragraph the student soft-wrapped with Shift+Enter',
        html: '<p>' + words(30) + '<br>' + words(30) + '</p>',
        expect: 1,
        why: 'THE FALSE-SPLIT CASE Neil named. Shift+Enter is a line break INSIDE a paragraph — '
            + 'the student wrote one paragraph and must be marked for one',
    },
    {
        name: 'a deliberately short paragraph between two long ones (a dramatic beat)',
        html: P(words(45)) + P('Then the light went out.') + P(words(40)),
        expect: 3,
        why: 'THE MISS CASE. A short paragraph is a real paragraph — common in Q5 narrative, where '
            + 'a one-line beat is a craft choice, not a fragment',
    },
    // ── v7.20.672 (#682, Zayan) — the natural break is the authority ─────────────────────
    {
        name: 'ZAYAN’S REAL SHAPE — four paragraphs in one <p> separated by blank lines, + conclusion',
        html: '<p>' + words(88) + '.<br><br>Firstly, ' + words(210) + '.<br><br>Secondly, ' + words(205)
            + '.<br><br>Thirdly, ' + words(200) + '.</p>' + P('In conclusion, ' + words(85) + '.'),
        expect: 5,
        why: 'Sophia was sent "2 paragraphs — BODY 1 (712 words)" and marked his Introduction "not '
            + 'submitted". A blank line is the student’s own paragraph break',
    },
    {
        name: 'a blank line typed with a non-breaking space between the breaks',
        html: '<p>' + words(40) + '.<br>&nbsp;<br>' + words(40) + '.</p>',
        expect: 2,
        why: 'a "blank" line often carries an invisible space — it is still a blank line',
    },
    {
        name: 'a TITLE line (no full stop) above a five-paragraph essay',
        html: P('Macbeth and the corruption of ambition') + P(words(40) + '.') + P(words(60) + '.')
            + P(words(60) + '.') + P(words(60) + '.') + P(words(30) + '.'),
        expect: 5,
        why: 'a title is not the Introduction — standing alone it would shift every label after it',
    },
    {
        name: 'the QUESTION copied out as a heading (ends with a question mark)',
        html: P('How does Shakespeare present ambition in Macbeth?') + P(words(40) + '.') + P(words(60) + '.'),
        expect: 2,
        why: 'the question is not a paragraph of the answer',
    },
    {
        name: 'a ONE-SENTENCE introduction that ends with a full stop',
        html: P('Shakespeare presents Macbeth as a man destroyed by his ambition.') + P(words(60) + '.')
            + P(words(60) + '.') + P(words(60) + '.') + P(words(40) + '.'),
        expect: 5,
        why: 'a short real introduction is still the Introduction — the old Literature rule glued it '
            + 'onto Body 1',
    },
    {
        name: 'a SHORT conclusion (under 20 words) after three body paragraphs',
        html: P(words(40) + '.') + P(words(60) + '.') + P(words(60) + '.') + P(words(60) + '.')
            + P('Overall, Shakespeare shows that ambition without conscience destroys a man.'),
        expect: 5,
        why: 'THE LITERATURE MISS: the old rule merged any paragraph under 20 words into the one '
            + 'before, so a short conclusion vanished and the last body paragraph became "CONCLUSION"',
    },
    {
        name: 'the collapsed "Preview" strip inside the section is not a paragraph',
        html: '<div class="swml-ana-strip" contenteditable="false"><span>Preview</span><span>'
            + words(12) + '</span></div><div class="swml-section-content">' + P(words(40) + '.')
            + P(words(40) + '.') + '</div><button>Expand</button>',
        expect: 2,
        why: 'measured in the live DOM 2026-09-30: the strip repeats the essay’s opening words; read '
            + 'with it, the teaser became an extra first paragraph',
    },
    {
        name: 'an empty response',
        html: '',
        expect: 0,
        why: 'nothing written must read as nothing written, never as one empty paragraph',
    },
    // ── v7.20.731 (#766/#770, Neil 7 Oct: "fix… universally for every single protocol") — ONE rule ───
    {
        name: 'Language box: two paragraphs made with ONE Enter (the 42-of-110 case)',
        html: '<div data-input-field="true" class="swml-input-field">The writer opens with a storm that mirrors the fear inside the house.<br>In addition, the sea is personified as a monster that attacks the cliffs.</div>',
        expect: 2,
        why: '#770: a Language answer box is itself a <div>, so the old switch never treated its single <br> as a break — u1298 was told "one continuous piece rather than three separate paragraphs"',
    },
    {
        name: 'Language box: a line wrapped mid-sentence stays one paragraph',
        html: '<div data-input-field="true" class="swml-input-field">' + words(20) + '<br>' + words(20) + '.</div>',
        expect: 1,
        why: 'a hard-wrapped paste breaks lines mid-sentence — a paragraph never ends mid-sentence (#418 holds)',
    },
    {
        name: 'Language box: one unbroken paragraph stays one (Anaya’s Q2 shape)',
        html: '<div data-input-field="true" class="swml-input-field">The writer powerfully conveys the storm. ' + words(60) + '.</div>',
        expect: 1,
        why: 'the reader never invents a break — her Q2 was split by the marking frame, not by the reader (#767)',
    },
    {
        name: 'essay box: a single line break between two full sentences is a paragraph break',
        html: '<p>Shakespeare presents Macbeth as a brave soldier at first. ' + words(30) + '.<br>Firstly, the witches awaken an ambition that is already there. ' + words(30) + '.</p>',
        expect: 2,
        why: '#766: what the student sees is a new line starting a new sentence — a paragraph; u1180 wrote an 818-word essay this way',
    },
];

// v7.20.672 (#682): the Literature essay path must use THIS rule, never a textContent read again.
ok(/const blocks = _mqParas\(section, true\);/.test(SRC),
    'the Literature essay path reads paragraphs through _mqParas (a textContent read welds blank-line paragraphs)');
console.log('\nparagraph-count-harness — #418: detect every paragraph, invent none\n');
CASES.forEach(function (c) {
    const got = mqParas(makeSection(c.html)).length;
    ok(got === c.expect,
        c.name + ' → ' + c.expect + ' paragraph(s) (got ' + got + ')\n      ' + c.why);
});

// ── v7.20.716: the essay template's prompt line is never a paragraph ────────
// Measured on the WML 327 A Macbeth walk (staging, 1938): the Literature path keeps <em>, and the
// template ships <p data-locked="true"><em>Write your essay here.</em></p> above the student's text,
// so the prompt reached Sophia as PARAGRAPH 1 and was marked as the Introduction. keepEm=true is the
// Literature call (`_mqParas(section, true)`); without it the shim's <em> strip would hide the defect.
console.log('\nthe template prompt line (Literature path, keepEm):');
[
    { name: 'locked prompt + intro + 3 bodies + conclusion', html: '<p data-locked="true"><em>Write your essay here.</em></p>' + P(words(40)) + P(words(70)) + P(words(65)) + P(words(68)) + P(words(35)), expect: 5 },
    { name: 'older docs: the same prompt unlocked', html: P('<em>Write your essay here.</em>') + P(words(60)) + P(words(55)) + P(words(58)), expect: 3 },
    { name: 'a blank template (prompt only) is an empty answer', html: '<p data-locked="true"><em>Write your essay here.</em></p><p></p>', expect: 0 },
    { name: 'a student sentence that merely contains the words stays', html: P('I will write your essay here. ' + words(40)), expect: 1 },
].forEach(function (c) {
    const got = mqParas(makeSection(c.html), true);
    ok(got.length === c.expect && got.every(p => !/^write your essay here\.$/i.test(p.trim())),
        c.name + ' → ' + c.expect + ' paragraph(s), none of them the prompt (got ' + got.length + ': ' + JSON.stringify(got.map(p => p.slice(0, 24))) + ')');
});

// ── nothing the student wrote may be lost ───────────────────────────────────
console.log('\nand no word the student wrote is dropped on the way:');
[
    { name: 'a three-word answer', html: P('Because it rains.'), mustContain: 'Because it rains.' },
    { name: 'a stray fragment between paragraphs', html: P(words(30)) + P('And so.') + P(words(30)), mustContain: 'And so.' },
    { name: 'a soft-wrapped paragraph keeps both halves', html: '<p>' + words(25) + '<br>tail words here now</p>', mustContain: 'tail words here now' },
].forEach(function (c) {
    const joined = mqParas(makeSection(c.html)).join('\n\n');
    ok(joined.indexOf(c.mustContain) >= 0,
        c.name + ' survives into the payload — the old rule deleted lines of three words or fewer outright');
});

// v7.20.672 (#682): the NodeView chrome must not LEAK into the text either. A count alone cannot see
// this — the title rule glues a short teaser onto paragraph 1 and the count stays right while the
// marker is handed words the student did not write at that point.
console.log('\nand nothing that is not the answer is handed to the marker:');
(function () {
    const html = '<div class="swml-ana-strip" contenteditable="false"><span>Preview</span><span>TEASERWORD '
        + words(10) + '</span></div>' + P(words(40) + '.') + P(words(40) + '.') + '<button>EXPANDBUTTON</button>';
    const joined = mqParas(makeSection(html)).join('\n\n');
    ok(joined.indexOf('TEASERWORD') < 0 && joined.indexOf('Preview') < 0,
        'the collapsed Preview strip’s teaser is not part of the answer');
    ok(joined.indexOf('EXPANDBUTTON') < 0, 'a section button’s label is not part of the answer');
})();

// ── v7.20.723 (#751): a retrieval answer's Point boxes are separate statements ──────────────────
// Measured on the IGCSE P1 walk (staging 59209, 6 Oct): Q1's two Point boxes reached Sophia as ONE
// statement, "it's like they occupy different planets They were laughing as police chased them" —
// the essay title rule merged the short unpunctuated first box into the second — and Sophia told
// the student their quotations "ran together in one line". The DOM shape is the real inputField
// markup (one <div data-field-id> per box).
console.log('\nretrieval Point boxes stay separate statements:');
(function () {
    const box = (id, t) => '<div data-prompt="Point" data-field-id="' + id + '" data-input-field="true">' + t + '</div>';
    const q1 = box('Q1-point-1', "it's like they occupy different planets") + box('Q1-point-2', 'They were laughing as police chased them');
    const got = mqParas(makeSection(q1), false, true);
    ok(got.length === 2 && got[0] === "it's like they occupy different planets",
        'Q1: two unpunctuated phrases in two boxes → two statements (got ' + JSON.stringify(got) + ')');
    const short = box('Q1-point-1', 'different planets') + box('Q1-point-2', 'Mars') + box('Q1-point-3', 'utter hopelessness and disenfranchisement');
    ok(mqParas(makeSection(short), false, true).length === 3, 'Q1: one- and two-word answers are never folded into a neighbour');
    ok(mqParas(makeSection(q1)).length === 1, 'oracle: the ESSAY rule still treats a short unpunctuated first line as a title (unchanged for essays)');
    ok(/const paras = _mqParas\(section, false, isRetrievalQ\);/.test(SRC), 'the multi-question payload reads retrieval answers as statements');
})();

// ── v7.20.723 (#753): an over-long body-only answer is marked by CONTENT, never position ────────
// The protocol: "mark ONLY the taught count, chosen by CONTENT … a short overview never displaces a
// content paragraph". The IGCSE P1 walk's Q4 (4 paragraphs, taught 3) labelled the quote-less overview
// PARAGRAPH 1 and left the structure paragraph — the only one naming structure — as the unmarked EXTRA.
console.log('\nan over-long answer keeps its content paragraphs:');
(function () {
    const b = SRC.indexOf('// @TAUGHT-RANK-PURE-BEGIN'), e = SRC.indexOf('// @TAUGHT-RANK-PURE-END');
    ok(b > 0 && e > b, 'the taught-paragraph chooser sits between its sentinels');
    const rankFn = new Function(SRC.slice(b, e) + '\nreturn _taughtParagraphRank;')();
    const walkQ4 = [
        'Adichie uses language and structure to show that single stories are dangerous. She tells lots of stories about her life.',
        'At the start she says "all my characters were white and blue-eyed". This shows that she only read British and American books so she wrote about them.',
        'She also uses repetition when she says "as one thing, as only one thing, over and over again". This shows that a single story is told a lot of times.',
        'The structure is that she tells three stories, about her books, about Fide and about her roommate. At the end she says "we regain a kind of paradise" which is a happy ending.',
    ];
    const r = rankFn(walkQ4, 3);
    ok(r && r[0] === undefined && r[1] === 0 && r[2] === 1 && r[3] === 2,
        'the walk\'s Q4: the quote-less overview is the extra; paragraphs 2–4 are marked as 1–3 (got ' + JSON.stringify(r) + ')');
    ok(rankFn(walkQ4.slice(1), 3) === null, 'exactly the taught count → nothing to choose');
    const noQuotes = ['It is about stories. ' + words(20), words(30), words(30), words(30)];
    const rn = rankFn(noQuotes, 3);
    ok(rn && rn[0] === 0 && rn[1] === 1 && rn[2] === 2 && rn[3] === undefined, 'no quotation anywhere → positional, as before');
    ok(rankFn(["Adichie's talk isn't about one story, it's about many. " + words(10), 'She says "Stories matter" ' + words(10), 'And "Many stories matter" ' + words(10), 'Then "a kind of paradise" ' + words(10)], 3)[0] === undefined,
        'apostrophes (it\'s, isn\'t, Adichie\'s) are not mistaken for a quotation');
    ok(/const _bodyRank = isEssayShape \? null : _taughtParagraphRank\(paras, taught\);/.test(SRC), 'the payload labeller uses the chooser');
})();

// v7.20.736 (#771): the planning / polishing payload (getDocumentText + its DOM fallback) read every section with
// textContent, so plan rows and paragraphs ran together ("…sentence.Technique…"). _docSectionText keeps them apart.
console.log('\nthe planning and polishing payload keeps rows and paragraphs apart:');
(function () {
    const sliceFn = head => { const at = SRC.indexOf(head); if (at < 0) return ''; let i = SRC.indexOf('{', at + head.length - 1), d = 0; for (; i < SRC.length; i++) { if (SRC[i] === '{') d++; else if (SRC[i] === '}') { d--; if (!d) return SRC.slice(at, i + 1); } } return ''; };
    const docFn = sliceFn('function _docSectionText(section, type) {');
    ok(docFn.length > 100, '_docSectionText exists');
    const DOMParserShim = function () { this.parseFromString = h => ({ body: { textContent: stripTags(h) } }); };
    const read = new Function('document', 'DOMParser', RULE_SRC + '\nfunction _sectionContentOf(s) { return s; }\n' + docFn + '\nreturn _docSectionText;')(documentShim, DOMParserShim);
    const plan = read(makeSection('<div data-input-field="true">Topic sentence about power.</div><div data-input-field="true">Technique: the metaphor of the crown.</div>'), 'plan');
    ok(plan === 'Topic sentence about power.\nTechnique: the metaphor of the crown.', 'two plan rows arrive on two lines, never "…power.Technique…"', JSON.stringify(plan));
    const resp = read(makeSection('<p>First paragraph of the answer ends here.<br><br>Second paragraph of the answer starts here.</p>'), 'response');
    ok(resp === 'First paragraph of the answer ends here.\n\nSecond paragraph of the answer starts here.', 'the answer arrives as the paragraphs marking sees', JSON.stringify(resp));
    ok((SRC.match(/const text = _docSectionText\(section, type\);/g) || []).length === 2 && !/const text = _sectionContentOf\(section\)\.textContent/.test(SRC), 'both payload readers use it (no textContent read left)');
    ok(/new DOMParser\(\)\.parseFromString\(h, 'text\/html'\)/.test(docFn), 'the markup is read in an inert document');
    // the polishing selection chip counts paragraphs with the SAME reader (its own splitter is only the fallback)
    const CHIP = require('fs').readFileSync(require('path').join(__dirname, '..', 'frontend', 'wml-selection-chip.js'), 'utf8');
    ok(/try \{ window\.WML\.answerParas = _answerParas; \} catch/.test(SRC) && /const ONE = \(typeof window !== 'undefined' && window\.WML && typeof window\.WML\.answerParas === 'function'\) \? window\.WML\.answerParas : null;/.test(CHIP) && /\? ONE\(n, true, false\)/.test(CHIP),
        'the polishing chip reads paragraphs through THE reader (exported as WML.answerParas)');
})();

// v7.20.736 (#771): _healStrayResponseProse moves a paragraph the student typed OUTSIDE the answer box into it. That
// block was their own new paragraph, so it must arrive behind a BLANK line: behind one break that falls mid-sentence
// the reading rule (correctly) treats it as a wrapped line and merges it.
console.log('\na paragraph moved into the answer box stays a paragraph:');
(function () {
    const A = 'The writer opens with a storm that mirrors the grief the narrator cannot name ' + words(8);   // no full stop
    const B = 'Later the light returns and the mother finally speaks to her son ' + words(8) + '.';
    ok(mqParas(makeSection('<div data-input-field="true">' + A + '<br>' + B + '</div>')).length === 1,
        'behind ONE break after an unfinished sentence, the moved paragraph would merge (why one break is not enough)');
    ok(mqParas(makeSection('<div data-input-field="true">' + A + '<br><br>' + B + '</div>')).length === 2,
        'behind a BLANK line it stays its own paragraph');
    const healer = (SRC.match(/function _healStrayResponseProse\(\) \{[\s\S]*?\n    \}\n/) || [''])[0];
    ok(/var ins = \(fieldEmpty \|\| !hb\) \? inline : \[hb\.create\(\), hb\.create\(\)\]\.concat\(inline\);/.test(healer),
        'the healer inserts a blank line (two breaks) before the moved paragraph');
    ok(/job\.stray\.node\.forEach\(function\(n\) \{ if \(n\.isText \|\| \(hb && n\.type === hb\)\) inline\.push\(n\); \}\);/.test(healer),
        'and moves the paragraph\'s own nodes (its line breaks and formatting), never its welded text');
})();

console.log('');
if (fails) {
    console.log('❌ paragraph-count-harness FAILED (' + fails + ' of ' + checks + ').');
    console.log('   A miss under-marks; a false split marks a paragraph nobody wrote. Both are');
    console.log('   defects — fix the rule in getResponseText, never the expectation here.');
    process.exit(1);
}
console.log('✅ paragraph-count-harness passed (' + checks + ' checks: every real paragraph found,');
console.log('   and no invented ones).');
