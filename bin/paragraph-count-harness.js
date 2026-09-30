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
const RULE_SRC = sliceArrowFn('_mqParas');
ok(RULE_SRC.length > 400, 'sliced the real _mqParas whole (' + RULE_SRC.length + ' chars)');

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

console.log('');
if (fails) {
    console.log('❌ paragraph-count-harness FAILED (' + fails + ' of ' + checks + ').');
    console.log('   A miss under-marks; a false split marks a paragraph nobody wrote. Both are');
    console.log('   defects — fix the rule in getResponseText, never the expectation here.');
    process.exit(1);
}
console.log('✅ paragraph-count-harness passed (' + checks + ' checks: every real paragraph found,');
console.log('   and no invented ones).');
