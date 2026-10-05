#!/usr/bin/env node
/* eslint-env node */
// dup-field-harness (v7.20.713, FIXLIST #730) — one field id is ONE answer box.
//
// Measured defect (prod, read-only scan 2026-10-05): 4 of 630 stored documents — all one student's AQA
// Language Paper 1 chain (write → assessment → planning → reassessment) — held "Q2-response" ×5: her answer
// in the first box and four EMPTY copies with identical attributes down to the same data-edit-ts, i.e. the
// editor split the box while she wrote and every later lesson copied the split forward. The pop-out chip
// never appeared for that question (it needs exactly one answer box) and Document Progress counted four
// empty boxes. healDuplicateInputFields merges a run of consecutive same-id boxes back into the first.
//
// This harness slices the REAL pure functions (_dupFieldRuns, _dupFieldMerged — between the @DUP-FIELD-PURE
// sentinels) and drives them on the REAL ProseMirror model when it can find one (WML_PM_DIR, else the notes
// workspace build on this machine), applying the merge with a real Transform so a wrong position throws.
// Elsewhere it runs on a minimal faithful model, so pre-ship never skips it.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const os = require('os');
const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const m = src.match(/\/\/ ── @DUP-FIELD-PURE[^\n]*\n([\s\S]*?)\n\s*\/\/ ── @DUP-FIELD-PURE-END ──/);
if (!m) { console.error('❌ dup-field-harness: cannot slice the @DUP-FIELD-PURE block'); process.exit(1); }
const sb = { String, Array, console };
vm.createContext(sb);
vm.runInContext(m[1] + '\nthis.runs = _dupFieldRuns; this.merged = _dupFieldMerged;', sb);

let passed = 0, failed = 0;
const ok = (c, label, d) => { if (c) passed++; else { failed++; console.log('  ❌ ' + label + (d ? ' — ' + d : '')); } };

// ── the model: real ProseMirror when available ──────────────────────────────────────────────
let PM = null;
for (const dir of [process.env.WML_PM_DIR, path.join(os.homedir(), '.sophicly', 'notes-workspace-build', 'node_modules')].filter(Boolean)) {
    try { PM = { model: require(path.join(dir, 'prosemirror-model')), transform: require(path.join(dir, 'prosemirror-transform')) }; break; } catch (e) { PM = null; }
}

function realKit() {
    const { Schema } = PM.model;
    const schema = new Schema({
        nodes: {
            doc: { content: 'block+' },
            sectionBlock: { group: 'block', content: 'block*', attrs: { label: { default: '' }, sectionType: { default: '' } } },
            inputField: { group: 'block', content: 'inline*', defining: true, isolating: true, attrs: { fieldId: { default: '' }, prompt: { default: '' }, editTs: { default: 0 } } },
            heading: { group: 'block', content: 'inline*', attrs: { level: { default: 3 } } },
            paragraph: { group: 'block', content: 'inline*' },
            text: { group: 'inline' },
            hardBreak: { group: 'inline', inline: true },
        },
    });
    const n = schema.nodes;
    const t = (s) => schema.text(s);
    return {
        name: 'ProseMirror',
        hb: n.hardBreak,
        field: (id, parts) => n.inputField.create({ fieldId: id, prompt: 'Write your response here.', editTs: 1790514167144 }, (parts || []).map(p => p === '<br>' ? n.hardBreak.create() : t(p))),
        heading: (s) => n.heading.create(null, t(s)),
        section: (label, kids) => n.sectionBlock.create({ label, sectionType: 'response' }, kids),
        doc: (kids) => n.doc.create(null, kids),
        apply: (doc, runs) => {
            const tr = new PM.transform.Transform(doc);
            runs.slice().sort((a, b) => b.from - a.from).forEach(r => tr.replaceWith(r.from, r.to, sb.merged(r, n.hardBreak)));
            return tr.doc;
        },
    };
}
// A minimal model with the same surface the two functions touch (forEach/offset, nodeSize, attrs,
// textContent, isTextblock, childCount, Fragment.from/append, type.create).
function fakeKit() {
    class Frag {
        constructor(a) { this.content = a || []; this.size = this.content.reduce((s, x) => s + x.nodeSize, 0); }
        static from(a) { return new Frag(a); }
        append(o) { return new Frag(this.content.concat(o.content)); }
        forEach(f) { let off = 0; this.content.forEach(c => { f(c, off); off += c.nodeSize; }); }
    }
    const type = (name, textblock) => ({ name, create(attrs, content) { return node(this, attrs || {}, content instanceof Frag ? content : Frag.from([].concat(content || []))); }, textblock });
    function node(tp, attrs, content, text) {
        const isText = tp.name === 'text';
        return {
            type: tp, attrs, content, text, isTextblock: !!tp.textblock,
            get nodeSize() { return isText ? text.length : (tp.name === 'hardBreak' ? 1 : content.size + 2); },
            get childCount() { return content ? content.content.length : 0; },
            get textContent() { return isText ? text : (content ? content.content.map(c => c.textContent).join('') : ''); },
            forEach(f) { if (content) content.forEach(f); },
        };
    }
    const T = { doc: type('doc'), section: type('sectionBlock'), field: type('inputField', true), heading: type('heading', true), hb: type('hardBreak'), text: { name: 'text' } };
    const t = (s) => node(T.text, {}, null, s);
    return {
        name: 'minimal model',
        hb: T.hb,
        field: (id, parts) => T.field.create({ fieldId: id }, (parts || []).map(p => p === '<br>' ? T.hb.create() : t(p))),
        heading: (s) => T.heading.create(null, [t(s)]),
        section: (label, kids) => T.section.create({ label }, kids),
        doc: (kids) => { const d = T.doc.create(null, kids); return d; },
        apply: null,   // no Transform in the minimal model — position checks run on the real one only
    };
}
const K = PM ? realKit() : fakeKit();
console.log('— model: ' + K.name);

const fields = (doc) => { const out = []; const walk = (n) => n.forEach(c => { if (c.type.name === 'inputField') out.push(c); else if (c.childCount) walk(c); }); walk(doc); return out; };

// ── D1–D4: Mishel's real shape (1237, measured): answer + blank line, then four empty copies ──
const ANSWER = 'The writer presents the storm as a warning sign.';
const mishel = K.doc([
    K.section('Q1 Response', [K.field('Q1-point-1', ['a']), K.field('Q1-point-2', ['b'])]),
    K.section('Q2 Response', [K.field('Q2-response', [ANSWER, '<br>', '<br>']), K.field('Q2-response'), K.field('Q2-response'), K.field('Q2-response'), K.field('Q2-response')]),
    K.section('Q3 Response', [K.field('Q3-response', ['x'])]),
]);
let runs = sb.runs(mishel);
ok(runs.length === 1 && runs[0].id === 'Q2-response' && runs[0].nodes.length === 5, 'D1: finds the ONE run — Q2-response ×5', JSON.stringify(runs.map(r => [r.id, r.nodes.length])));
const NO = { textContent: '(no run found)', childCount: -1, attrs: {} };
const mg = runs[0] ? sb.merged(runs[0], K.hb) : NO;
ok(mg.textContent === ANSWER && mg.childCount === 3, 'D2: four empty copies are dropped, her answer and its blank line kept exactly', mg.textContent + ' / children ' + mg.childCount);
ok(mg.attrs.fieldId === 'Q2-response', 'D3: the merged box keeps the field id and attributes');
if (K.apply && runs[0]) {
    const after = K.apply(mishel, runs);
    const q2 = fields(after).filter(f => f.attrs.fieldId === 'Q2-response');
    ok(q2.length === 1 && q2[0].textContent === ANSWER, 'D4 (real Transform): one Q2 box after the merge, text intact', q2.length + ' boxes');
    ok(fields(after).length === 4 && sb.runs(after).length === 0, 'D5 (real Transform): every other box untouched, nothing left to merge (idempotent)');
}

// ── D6–D7: a split that carried text keeps every word, joined by a blank line ──
const split = K.doc([K.section('Q2 Response', [K.field('Q2-response', ['First paragraph.']), K.field('Q2-response', ['Second paragraph.'])])]);
runs = sb.runs(split);
const sm = runs[0] ? sb.merged(runs[0], K.hb) : NO;
ok(sm.textContent === 'First paragraph.Second paragraph.' && sm.childCount === 4, 'D6: a copy holding text is joined back — text, two line breaks, text', sm.childCount + ' children');
if (K.apply && runs[0]) {
    const after = K.apply(split, runs);
    ok(fields(after).length === 1, 'D7 (real Transform): the joined document holds one box');
}

// ── D8–D10: what is NOT a split is never touched ──
ok(sb.runs(K.doc([K.section('S', [K.field('a', ['1']), K.field('b', ['2'])])])).length === 0, 'D8: neighbouring boxes with DIFFERENT ids are left alone');
ok(sb.runs(K.doc([K.section('S', [K.field('a', ['1']), K.heading('Gap'), K.field('a', ['2'])])])).length === 0, 'D9: the same id separated by other content is not a split — left alone');
ok(sb.runs(K.doc([K.section('S', [K.field('', ['1']), K.field('', ['2'])])])).length === 0, 'D10: boxes with no id are never merged');
// Qamar's clean shape (857, measured): one box per question.
ok(sb.runs(K.doc([K.section('Q2 Response', [K.field('Q2-response', [ANSWER])]), K.section('Q3 Response', [K.field('Q3-response', ['x'])])])).length === 0, 'D11: a clean document (one box per answer) needs nothing');

// ── D12: the sentinel block stays pure — no editor, no state, no DOM ──
ok(!/canvasEditor|state\.|document\.|window\./.test(m[1].replace(/\/\/[^\n]*/g, '')), 'D12: the pure block reads no editor, state or DOM');

console.log(`— DUPLICATE FIELD: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ dup-field-harness FAILED'); process.exit(1); }
console.log('✅ dup-field-harness passed (a split answer box is merged back into one, text kept).');
