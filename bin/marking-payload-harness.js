#!/usr/bin/env node
/* eslint-env node */
/**
 * marking-payload-harness.js — v7.20.549
 *
 * Neil, 2026-08-22, after the second paragraph defect in one day:
 *   *"you know the paragraph issue? We've had this problem before, so I think you need to make a
 *   gate for that."*
 *
 * ⭐ WHY THIS ONE EXISTS WHEN TWO PARAGRAPH GATES ALREADY DO. The other two guard PARTS:
 *   • bin/response-text-harness.js — which READER answers (#416: the wrong one shadowed the right
 *     ones and deleted every paragraph break).
 *   • bin/paragraph-count-harness.js — where a paragraph BEGINS (#418: hard vs soft breaks).
 * Neither looks at the finished payload, and that is precisely where the last defect hid: the
 * per-question paragraph labels shipped in v7.19.826 sat in a branch nothing could reach for
 * weeks, and every part-level check passed the whole time. A part can be perfect while the thing
 * assembled from the parts is wrong — so this gate asserts the ARTEFACT: the exact text the model
 * is handed for a real multi-question paper.
 *
 * WHAT IT ASSERTS, all against ONE realistic AQA Lang P1 submission:
 *   1. Every question the student answered appears, labelled, and none is silently dropped.
 *   2. The paragraph COUNT the payload announces equals the paragraphs the student actually
 *      wrote — per question, not just overall.
 *   3. Each paragraph is individually LABELLED and separated, so the universal per-paragraph rule
 *      (mark · feedback · gold · alternative for EVERY paragraph) has something to attach to.
 *   4. An essay-shaped question labels by POSITION (Introduction / Body / Conclusion), so a
 *      miscount cannot silently rename every paragraph after it.
 *   5. Section B is marked HOLISTICALLY — it must NOT carry per-paragraph rules.
 *   6. An unanswered question says so explicitly rather than vanishing (the .421 fabrication
 *      class: an absent section let the model invent "your previous response").
 *   7. Not one word the student wrote is missing from the payload.
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

// ── extract the REAL getResponseText, whole (never truncated — §14c) ────────
function extractFunction(name) {
    const at = SRC.indexOf('function ' + name + '(');
    if (at < 0) throw new Error('cannot find function ' + name);
    let i = SRC.indexOf('{', at), depth = 0, inS = null, esc = false, inLine = false, inBlock = false;
    for (; i < SRC.length; i++) {
        const c = SRC[i], n = SRC[i + 1];
        if (inLine) { if (c === '\n') inLine = false; continue; }
        if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
        if (inS) {
            if (esc) { esc = false; continue; }
            if (c === '\\') { esc = true; continue; }
            if (c === inS) inS = null;
            continue;
        }
        if (c === '/' && n === '/') { inLine = true; i++; continue; }
        if (c === '/' && n === '*') { inBlock = true; i++; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return SRC.slice(at, i + 1); }
    }
    throw new Error('unbalanced braces reading ' + name);
}
const FN_SRC = extractFunction('getResponseText');

// ── the smallest DOM the real builder needs ─────────────────────────────────
const stripTags = h => h.replace(/<[^>]*>/g, '');
function makeSection(label, html) {
    return {
        _html: html,
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = v; },
        get textContent() { return stripTags(this._html); },
        getAttribute(a) { return a === 'data-section-label' ? label : (a === 'data-section-type' ? 'response' : null); },
        cloneNode() { return makeSection(label, this._html); },
        querySelectorAll() { return []; },
    };
}
function makeDocument(sections) {
    const root = {
        querySelectorAll(sel) {
            return /data-section-type="response"/.test(sel) ? sections : [];
        },
    };
    return {
        getElementById: () => root,
        createElement: () => ({
            _html: '',
            set innerHTML(v) { this._html = v; },
            get innerHTML() { return this._html; },
            get textContent() { return stripTags(this._html); },
        }),
    };
}

// ── the paper. Real AQA Lang P1 shape, real tariffs ─────────────────────────
const SPECS = {
    Q1: { id: 'Q1', marks: 4, type: 'retrieval' },
    Q2: { id: 'Q2', marks: 8, type: 'analysis' },
    Q3: { id: 'Q3', marks: 8, type: 'analysis' },
    Q4: { id: 'Q4', marks: 20, type: 'evaluation' },
    Q5: { id: 'Q5', marks: 40, type: 'extended_writing' },
};
const words = n => Array.from({ length: n }, (_, i) => 'w' + (i + 1)).join(' ');
const P = t => '<p>' + t + '</p>';

const Q2_P1 = 'The writer uses the storm as a reflection of Alex fears, building a triadic list of '
    + 'wind and rain and thunder so the reader feels the pressure mounting around him steadily.';
const Q2_P2 = 'In addition the storm becomes a violent monster, and the adjective furious makes the '
    + 'sea an attacker rather than a setting, which externalises the fear he cannot say aloud.';

function run(sections) {
    const sandbox = {
        document: makeDocument(sections),
        console: { log() {}, warn() {}, error() {} },
        state: { subject: 'language1', topicNumber: 2, phase: 'initial', board: 'aqa' },
        lookupQuestionSpec: id => SPECS[id] || null,
        _lastQWordCounts: {},
        _sectionBWcCeiling: () => null,
        getResponseWordCount: () => 0,
        _multiqTargetKey: () => null,
        MULTIQ_RESPONSE_TARGETS: {},
    };
    const fn = new Function(
        Object.keys(sandbox).join(','),
        FN_SRC + '\nreturn getResponseText;'
    ).apply(null, Object.keys(sandbox).map(k => sandbox[k]));
    return fn(null);   // no editor closure → the DOM builder, which is the shipped path
}

console.log('\nmarking-payload-harness — the finished payload, not its parts\n');

const SECTIONS = [
    makeSection('Q1 Response', P('The bird flew into the house.') + P('The bird crashed through the window.')),
    makeSection('Q2 Response', P(Q2_P1) + P(Q2_P2)),
    makeSection('Q3 Response', '<p>' + words(24) + '<br>' + words(22) + '</p>'
        + P('Then the light went out.') + P(words(42))),
    makeSection('Q4 Response', P(words(30)) + P(words(55)) + P(words(52)) + P(words(50)) + P(words(28))),
    makeSection('Q5 Response', P(words(120)) + P(words(140))),
];
const payload = run(SECTIONS);

console.log('every question the student answered reaches the marker:');
['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].forEach(q => {
    ok(payload.indexOf('=== ' + q + ' RESPONSE') >= 0, q + ' is present and labelled');
});

// ⭐ Q3's fixture is deliberately awkward: its first paragraph is SOFT-WRAPPED (Shift+Enter) and
// its second is a SHORT deliberate beat. A payload built by the old 20-word proxy reports 2 here
// instead of 3, so this gate fails end-to-end if the splitter ever regresses (#418).
console.log('\nthe announced paragraph count matches what the student wrote:');
[['Q2', 2], ['Q3', 3], ['Q4', 5]].forEach(([q, n]) => {
    const m = payload.match(new RegExp('=== ' + q + ' RESPONSE — (\\d+) paragraph'));
    ok(!!m && Number(m[1]) === n,
        q + ' announces ' + n + ' paragraph(s) (got ' + (m ? m[1] : 'no count') + ')');
});

console.log('\nevery paragraph is individually labelled, so per-paragraph marking has a target:');
ok(/--- Q2 PARAGRAPH 1 of 2 ---/.test(payload), 'Q2 paragraph 1 is labelled');
ok(/--- Q2 PARAGRAPH 2 of 2 ---/.test(payload), 'Q2 paragraph 2 is labelled');
ok(payload.indexOf(Q2_P1) >= 0 && payload.indexOf(Q2_P2) >= 0, 'and both carry the student’s own words');
const q2Block = payload.slice(payload.indexOf('=== Q2 RESPONSE'), payload.indexOf('=== Q3 RESPONSE'));
ok(q2Block.indexOf(Q2_P1) < q2Block.indexOf(Q2_P2), 'in the order the student wrote them');

console.log('\nan essay-shaped question is labelled by POSITION:');
ok(/--- Q4 INTRODUCTION ---/.test(payload), 'Q4 opens with an Introduction label');
ok(/--- Q4 BODY PARAGRAPH 1 ---/.test(payload), 'Q4 body paragraphs are numbered');
ok(/--- Q4 CONCLUSION ---/.test(payload), 'Q4 closes with a Conclusion label');

console.log('\nSection B is holistic, never per-paragraph:');
ok(/=== Q5 RESPONSE[^\n]*HOLISTIC: no paragraph rules/.test(payload),
    'Q5 declares itself holistic — AO5/AO6 are whole-piece, not paragraph-weighted');
ok(!/--- Q5 PARAGRAPH/.test(payload), 'and Q5 carries no per-paragraph labels');

console.log('\nan unanswered question says so rather than vanishing:');
const partial = run([
    makeSection('Q1 Response', P('The bird flew into the house.')),
    makeSection('Q2 Response', ''),
    makeSection('Q3 Response', P(words(40))),
]);
ok(/=== Q2 RESPONSE — NOT ATTEMPTED \(empty\) ===/.test(partial),
    'an empty Q2 is declared NOT ATTEMPTED — never silently absent (.421 fabrication class)');
ok(/=== Q3 RESPONSE/.test(partial), 'and the questions after it still arrive');

console.log('\nnothing the student wrote is missing from the payload:');
let lost = 0;
[Q2_P1, Q2_P2, 'The bird flew into the house.', 'The bird crashed through the window.']
    .forEach(t => { if (payload.indexOf(t) < 0) lost++; });
ok(lost === 0, 'every sampled sentence survives into the payload (' + lost + ' lost)');

console.log('');
if (fails) {
    console.log('❌ marking-payload-harness FAILED (' + fails + ' of ' + checks + ').');
    console.log('   The marker is being handed something other than the student’s real structure.');
    process.exit(1);
}
console.log('✅ marking-payload-harness passed (' + checks + ' checks: every question labelled,');
console.log('   every paragraph counted and named, Section B holistic, nothing lost).');
