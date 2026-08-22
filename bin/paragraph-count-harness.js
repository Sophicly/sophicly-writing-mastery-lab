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
    const at = SRC.indexOf('const ' + name + ' = (section) => {');
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
        querySelectorAll() { return []; },   // fixtures carry no checklist items or <em>
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
    {
        name: 'an empty response',
        html: '',
        expect: 0,
        why: 'nothing written must read as nothing written, never as one empty paragraph',
    },
];

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

console.log('');
if (fails) {
    console.log('❌ paragraph-count-harness FAILED (' + fails + ' of ' + checks + ').');
    console.log('   A miss under-marks; a false split marks a paragraph nobody wrote. Both are');
    console.log('   defects — fix the rule in getResponseText, never the expectation here.');
    process.exit(1);
}
console.log('✅ paragraph-count-harness passed (' + checks + ' checks: every real paragraph found,');
console.log('   and no invented ones).');
