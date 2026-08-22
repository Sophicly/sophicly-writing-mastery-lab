#!/usr/bin/env node
/* eslint-env node */
/**
 * response-text-harness.js — #416, v7.20.545
 *
 * WHAT WENT WRONG, so the next model does not re-break it. `getResponseText()` had a
 * ProseMirror-state reader at the top, labelled "PRIMARY — best fidelity", that returned
 * early on any result over 50 characters. It is in fact the lowest-fidelity reader in the
 * file: it joins block nodes with a single space and then runs `.replace(/\s+/g,' ')`, so
 * every paragraph break the student typed is deleted. Because it returned first, it
 * SHADOWED both DOM branches below — and with them the per-question paragraph pre-labels
 * ("--- Q2 PARAGRAPH 1 of 2 ---"), the literature paragraph map, the code-counted word
 * totals and `_lastQWordCounts`. Every one of those shipped (v7.19.808/.826/.841/.944)
 * into a branch that could not be reached while the editor was alive.
 *
 * Neil measured the symptom on a real AQA Lang P1 Q2, 2026-08-22: Sophia called a plainly
 * two-paragraph answer "one continuous piece" and inferred the split from content. It was
 * telling the truth about what it had been sent.
 *
 * WHAT THIS GATE ASSERTS — the ROUTE and the HARM, behaviourally, on the real function:
 *   1. With a live DOM holding the response, the DOM reader is consulted (post-fix) —
 *      proven by a document stub that throws a sentinel the moment the DOM path is
 *      entered. Pre-fix the function returns PM text and the sentinel never fires.
 *   2. The PM reader, when it IS used (no DOM — the null-closure rescue path it was
 *      written for), still returns something usable, so the fix cannot have deleted the
 *      rescue.
 *   3. The PM reader demonstrably flattens paragraphs — the harm is stated as a fact of
 *      this build, not an opinion, so nobody re-promotes it to primary.
 *   4. A DOM that exists but is EMPTY (mid-remount) must NOT win over PM state, or a
 *      student's real work gets reported as "NOT ATTEMPTED".
 *
 * It drives the REAL function, extracted by balanced braces (never truncated — §14c).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(SRC, 'utf8');

let fails = 0, checks = 0;
function ok(cond, msg) {
    checks++;
    if (cond) { console.log('  ✓ ' + msg); } else { fails++; console.log('  ❌ ' + msg); }
}

// ── extract the REAL getResponseText, whole ─────────────────────────────────
function extractFunction(name) {
    const at = src.indexOf('function ' + name + '(');
    if (at < 0) throw new Error('cannot find function ' + name);
    let i = src.indexOf('{', at), depth = 0, inS = null, esc = false, inLine = false, inBlock = false;
    for (; i < src.length; i++) {
        const c = src[i], n = src[i + 1];
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
        else if (c === '}') { depth--; if (depth === 0) return src.slice(at, i + 1); }
    }
    throw new Error('unbalanced braces reading ' + name);
}
const fnSrc = extractFunction('getResponseText');
ok(fnSrc.length > 2000, 'extracted the real getResponseText whole (' + fnSrc.length + ' chars, braces balanced)');

// ── the student's answer: TWO paragraphs, as Neil's screenshot shows ────────
const P1 = 'The writer uses language to describe the storm as a symbolic reflection of Alex’s '
    + 'fears. Allende uses the triadic list when the wind begins lashing the trees, rain on the '
    + 'rooftop and thunder, perhaps to emphasise the gruelling process that the wind forces on '
    + 'nature, mistaking ordinary weather for hostile intent.';
const P2 = 'In addition, the storm can also be seen as a violent monster making Alex fearful. '
    + 'Allende describes the storm by using personification when the storm rages spilling in '
    + 'furious waves against the cliffs, and by personifying the sea as a monster the writer '
    + 'externalises Alex’s anxiety — no one can help them.';

const para = t => ({ type: 'paragraph', content: [{ type: 'text', text: t }] });
const responseSection = (label, paras) => ({
    type: 'sectionBlock',
    attrs: { sectionType: 'response', sectionLabel: label },
    content: paras.map(para),
});
const docJSON = {
    type: 'doc',
    content: [
        responseSection('Q1', ['The bird flew into the house. The bird crashed through the window.']),
        responseSection('Q2', [P1, P2]),
    ],
};

function makeEditor() {
    return { getJSON: () => docJSON, getText: () => P1 + '\n\n' + P2, options: { element: null } };
}

// ── a document stub that reports whether the DOM reader was entered ─────────
const SENTINEL = '__DOM_READER_ENTERED__';
function makeDocument(opts) {
    const o = opts || {};
    const sectionText = o.emptyDom ? '' : (P1 + ' ' + P2);
    const fakeSection = { textContent: sectionText, getAttribute: () => 'Q2' };
    const root = {
        querySelectorAll: (sel) => {
            // The routing probe asks for response sections and must be answered honestly.
            if (o.probeAnswered && o.probeAnswered.n++ > 0 && !o.emptyDom) {
                // any SECOND query means the function has moved past routing into the
                // real DOM reader — that is the route we want to prove.
                throw new Error(SENTINEL);
            }
            if (/data-section-type="response"/.test(sel)) return o.noSections ? [] : [fakeSection];
            return [];
        },
    };
    return {
        getElementById: () => (o.noRoot ? null : root),
        createElement: () => ({ set innerHTML(_v) {}, get textContent() { return ''; } }),
    };
}

function run(opts) {
    const probeAnswered = { n: 0 };
    const documentStub = makeDocument(Object.assign({ probeAnswered }, opts));
    const sandbox = {
        document: documentStub,
        console: { log() {}, warn() {}, error() {} },
        state: { subject: 'language1', topicNumber: 1, phase: 'initial' },
        lookupQuestionSpec: () => ({ marks: 8, type: 'analysis' }),
        _lastQWordCounts: {},
        _sectionBWcCeiling: () => null,
        getResponseWordCount: () => 0,
        _multiqTargetKey: () => null,
        MULTIQ_RESPONSE_TARGETS: {},
    };
    const factory = new Function(
        Object.keys(sandbox).join(','),
        fnSrc + '\nreturn getResponseText;'
    );
    const fn = factory.apply(null, Object.keys(sandbox).map(k => sandbox[k]));
    try {
        return { text: fn(opts && opts.nullEditor ? null : makeEditor()), domEntered: false };
    } catch (e) {
        if (e && String(e.message).indexOf(SENTINEL) >= 0) return { text: null, domEntered: true };
        throw e;
    }
}

console.log('\nresponse-text-harness — #416: the payload must carry the student’s paragraphs\n');

// 1 · THE ROUTE. A live DOM holding the response must be the reader.
console.log('the route, with a live DOM that holds the essay:');
const live = run({});
ok(live.domEntered,
    'the DOM reader is entered — the PM-state reader no longer answers over a live DOM '
    + '(pre-fix this returned flattened PM text and the DOM was never consulted)');

// 2 · THE RESCUE the PM reader was written for (v7.17.52/.53) still works.
console.log('\nthe null-closure rescue the PM reader exists for:');
const noDom = run({ noRoot: true });
ok(typeof noDom.text === 'string' && noDom.text.length > 50,
    'with no editor DOM at all, PM state still returns the essay (' +
    (noDom.text ? noDom.text.length : 0) + ' chars) — the rescue path is intact');

// 3 · THE HARM, stated as a fact of this build.
console.log('\nwhat the PM reader does to the text (why it must never be primary):');
// NB the '\n\n' that IS present separates the two QUESTION sections (Q1 / Q2). The
// flattening is INSIDE a section, so the check must look inside Q2 only — a whole-string
// test passes for the wrong reason.
const q2Chunk = noDom.text.slice(noDom.text.indexOf('=== Q2 ==='));
ok(q2Chunk.length > 100 && q2Chunk.indexOf('\n\n') === -1,
    'inside Q2, PM state returns the two paragraphs with NO paragraph break — this is the '
    + 'flattening that made Sophia call a two-paragraph answer "one continuous piece"');
ok(noDom.text.indexOf('hostile intent. In addition') >= 0 || noDom.text.indexOf('hostile intent.In addition') >= 0,
    'the two paragraphs are run together into one block of prose');
ok(noDom.text.indexOf('--- Q2 PARAGRAPH') === -1,
    'PM state carries none of the per-question paragraph pre-labels the marking protocol '
    + 'expects — the model would have to GUESS the boundaries it is told to mark separately');

// 4 · AN EMPTY DOM MUST NOT WIN (the .421 fabrication class, in reverse).
console.log('\na half-mounted editor with empty response sections:');
const emptyDom = run({ emptyDom: true });
ok(!emptyDom.domEntered && typeof emptyDom.text === 'string' && emptyDom.text.length > 50,
    'an EMPTY DOM does not win over PM state — real work is never reported as NOT ATTEMPTED');

console.log('');
if (fails) {
    console.log('❌ response-text-harness FAILED (' + fails + ' of ' + checks + ').');
    console.log('   If check 1 failed: something re-promoted the PM-state reader above the DOM');
    console.log('   readers. It flattens paragraphs — read the header of this file before changing it.');
    process.exit(1);
}
console.log('✅ response-text-harness passed (' + checks + ' checks: the DOM reader owns a live');
console.log('   document, the null-closure rescue survives, and the flattening cannot come back).');
