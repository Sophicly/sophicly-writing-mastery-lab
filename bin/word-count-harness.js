#!/usr/bin/env node
/* eslint-env node */
// word-count-harness (v7.20.736, FIXLIST #771). The response word count — the number the essay word-count ceiling,
// the word labels and the saved wordCount all use — read each block with `textContent`, which drops a hard break, so
// "…the end.⏎Next…" counted as ONE word: every line break in an answer cost the student a word against the 650
// target (Zayan's essay: four paragraphs separated by blank lines inside one block). Drives the REAL
// _wcText + _responseWordCountFromDoc, sliced from the shipped file, over a minimal document-model shim.
// WML_SRC=<file> runs it against another copy (mutation proof: the pre-fix code must fail).
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };

function slice(head) {
    const at = SRC.indexOf(head);
    if (at < 0) return '';
    let i = SRC.indexOf('{', at + head.length - 1), d = 0;
    for (; i < SRC.length; i++) { if (SRC[i] === '{') d++; else if (SRC[i] === '}') { d--; if (!d) return SRC.slice(at, i + 1); } }
    return '';
}
const fnSrc = slice('function _responseWordCountFromDoc(editor) {');
const helperSrc = slice('function _wcText(n) {');
ok(fnSrc.length > 200, 'the real _responseWordCountFromDoc is sliced');

// ── a minimal ProseMirror-shaped document ─────────────────────────────────────────────────────────────
const text = t => ({ type: { name: 'text' }, isText: true, isTextblock: false, isLeaf: true, text: t, textContent: t, nodeSize: t.length });
const br = () => ({ type: { name: 'hardBreak' }, isText: false, isTextblock: false, isLeaf: true, textContent: '', nodeSize: 1 });
function block(name, kids, attrs) {
    const n = { type: { name }, attrs: attrs || {}, isTextblock: true, isText: false, children: kids };
    n.textContent = kids.map(k => k.textContent).join('');
    n.content = { size: kids.reduce((a, k) => a + k.nodeSize, 0) };
    n.textBetween = (from, to, bsep, leaf) => kids.map(k => (k.isText ? k.text : (typeof leaf === 'function' ? leaf(k) : (leaf || '')))).join('');
    n.descendants = () => {};
    n.forEach = f => kids.forEach(f);
    return n;
}
function section(type, label, blocks) {
    const n = { type: { name: 'sectionBlock' }, attrs: { sectionType: type, label }, isTextblock: false, children: blocks };
    n.descendants = f => { const walk = arr => arr.forEach(c => { if (f(c) !== false && c.children && !c.isTextblock) walk(c.children); }); walk(blocks); };
    return n;
}
const editorOf = sections => ({ state: { doc: { forEach: f => sections.forEach(f) } } });
const run = (src, sections, task) => new Function('state', '_WC_PLACEHOLDERS', src + '\nreturn _responseWordCountFromDoc;')(
    { task: task || 'assessment' }, ['write your essay here.', 'write your response here.'])(editorOf(sections));

const SRC_ALL = helperSrc + '\n' + fnSrc;
// 1. Zayan's shape: four paragraphs in ONE block, separated by blank lines (two hard breaks)
const zayan = [section('response', 'Response', [block('paragraph', [text('Intro ends here.'), br(), br(), text('Firstly the body.'), br(), br(), text('Secondly more.'), br(), br(), text('In conclusion done.')])])];
ok(run(SRC_ALL, zayan) === 11, 'paragraphs separated by blank lines inside one block: every word counts (11, not 8)', run(SRC_ALL, zayan));
// 2. a single Enter between sentences
const single = [section('response', 'Q2 Response', [block('inputField', [text('One two three.'), br(), text('Four five.')])])];
ok(run(SRC_ALL, single) === 5, 'a single line break between sentences: 5 words, not 4', run(SRC_ALL, single));
// 3. no breaks at all: unchanged
const plain = [section('response', 'Response', [block('paragraph', [text('A plain answer of six words.')])])];
ok(run(SRC_ALL, plain) === 6, 'an answer with no line breaks counts exactly as before', run(SRC_ALL, plain));
// 4. the placeholder line is still skipped
const ph = [section('response', 'Response', [block('paragraph', [text('Write your essay here.')], { locked: true }), block('paragraph', [text('Real words here.')])])];
ok(run(SRC_ALL, ph) === 3, 'the template prompt is still not counted', run(SRC_ALL, ph));
// 5. a CW row with a line break (the CW branch reads rows too)
const cw = [section('response', 'Response', [block('paragraph', [text('Para.')])]), Object.assign(section('plan', 'Step 1', [block('outlineRow', [text('My idea.'), br(), text('Another thought.')])]))];
ok(run(SRC_ALL, cw, 'cw_step_1') === 5, 'a CW input row with a line break: every word counts (1 response + 4 row)', run(SRC_ALL, cw, 'cw_step_1'));
// 6. the counter reads blocks through the break-aware helper, everywhere
ok(!/const t = n\.textContent \|\| '';/.test(fnSrc) && !/const t = \(n\.textContent \|\| ''\)\.trim\(\);/.test(fnSrc), 'no block in the counter is read with textContent any more');

console.log((fail ? '❌' : '✅') + ' word-count-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
