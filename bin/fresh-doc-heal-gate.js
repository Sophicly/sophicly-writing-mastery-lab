#!/usr/bin/env node
/* eslint-env node */
// v7.20.699 — FRESH-DOC HEAL GATE: a document the builder has just made must need NO healing.
//
// The load heals exist to bring OLD saved documents up to the current shape. "Current shape" is, by definition,
// what the builder makes today — so if a heal changes a freshly built document, the heal and the builder
// disagree, and the student sees the heal's version on every load. Measured 2026-10-05 on staging: a fresh
// Edexcel IGCSE P2 planning doc built Q1's outline correctly with no Context rows (the paper has no AO3);
// _healOutlineScaffold re-stamped its three Purpose rows AO1/AO3 on load, and on the next load added three Context
// rows the paper never asks for. No gate could see it: the builder gates look at the builder, and nothing ran a
// heal against the builder's own output.
//
// What it runs: the SHIPPED _healOutlineScaffold (sliced, via bin/lib/template-render-sandbox.js) on
//   • every topic of every language paper template, redraft mode (the page builder, real topic text), and
//   • every Literature essay paper in literature-paper-specs.json, built the way the single-part redraft builds
//     it: buildOutlineSection(aos, null, marks) (poetry/unseen use their own builders — not covered here).
// It fails on ANY change the heal would make.
//
//   node bin/fresh-doc-heal-gate.js                 (wired into bin/pre-ship-check.sh)
//   node bin/fresh-doc-heal-gate.js --src=<file>    (run against another build of wml-assessment.js)
'use strict';
const fs = require('fs');
const path = require('path');
const { makeTemplateRenderer, readTopics } = require('./lib/template-render-sandbox.js');

const ROOT = path.join(__dirname, '..');
const srcArg = (process.argv.find(a => a.startsWith('--src=')) || '').slice(6);
const { render, sandbox, healFresh } = makeTemplateRenderer(ROOT, srcArg ? { src: path.resolve(srcArg) } : null);

const failures = [];
let cases = 0;
const check = (label, st, seq) => {
    cases++;
    const ops = healFresh(st, seq);
    if (ops.length) failures.push({ label, ops });
};

// ── language papers: the page builder on every topic ──
const T = path.join(ROOT, 'protocols', 'shared', 'templates', 'topics');
const boardOf = f => (/^(edexcel-igcse|cambridge-igcse)-/.exec(f) || [, f.split('-')[0]])[1];
for (const f of fs.readdirSync(T).filter(x => /-language-(p|c|u)\d+\.md$/.test(x)).sort()) {
    const n = (/-(?:p|c|u)(\d+)\.md$/.exec(f) || [])[1];
    const subject = 'language_p' + (n === '1' ? '1' : '2');
    const st = { board: boardOf(f), subject };
    for (const t of readTopics(ROOT, path.join(T, f)).filter(x => x.questions.length)) {
        check(`${f} Topic ${t.topic}`, st, render(st, 'redraft', t).seq);
    }
}

// ── literature essays: the single-part redraft builder's call, per paper in the spec ──
const seqOf = html => String(html).split('\n').reduce((acc, line) => {
    const [tag, a, b] = line.split('\t');
    if (tag === '§S') acc.push({ sep: true, type: a, label: b });
    else if (tag === '§D') acc.push({ sep: true, type: 'divider', label: a });
    else if (tag === '§R') acc.push({ fid: a, crit: JSON.parse(b || '{}') });
    return acc;
}, []);
const lit = JSON.parse(fs.readFileSync(path.join(ROOT, 'protocols', 'shared', 'literature-paper-specs.json'), 'utf8'));
for (const [board, papers] of Object.entries(lit)) {
    if (board.startsWith('_') || !papers || typeof papers !== 'object') continue;
    for (const [subject, p] of Object.entries(papers)) {
        if (!p || !Array.isArray(p.aos) || !/^lit-/.test(p.shape || '')) continue;
        const st = { board, subject };
        sandbox.state = Object.assign({ text: '' }, st);
        check(`literature ${board}/${subject} (${p.aos.join('+')}, ${p.marks}m)`, st, seqOf(sandbox.buildOutlineSection(p.aos.join(','), null, p.marks)));
    }
}

for (const f of failures) {
    console.log(`❌ ${f.label}: the load heal changes a FRESH document (${f.ops.length} change(s))`);
    for (const o of f.ops.slice(0, 4)) {
        console.log(`     ${o.op} ${o.fid}` + (o.op === 'relabel' ? `  ao ${o.from.ao} → ${o.to.ao}${o.from.label !== o.to.label ? `, "${o.from.label}" → "${o.to.label}"` : ''}` : ''));
    }
}
if (failures.length) {
    console.log(`\n❌ fresh-doc-heal-gate FAILED — ${failures.length} of ${cases} fresh document(s) would be rewritten on load.`);
    console.log('   The heal and the builder disagree about the current shape. Make the heal read the builder\'s definition');
    console.log('   (the _purposeWithoutAO3 pattern), never a second copy of it.');
    process.exit(1);
}
console.log(`✅ fresh-doc-heal-gate passed (${cases} fresh documents: every language topic + every literature essay paper; the load heal changes none).`);
