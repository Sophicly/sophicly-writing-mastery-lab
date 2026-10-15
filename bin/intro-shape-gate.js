#!/usr/bin/env node
/* eslint-env node */
/**
 * intro-shape-gate.js — v7.20.901 (WML 360 A; FIXLIST intro-one-building-sentence; PEDAGOGY §54.1 + Neil's 15 Oct tag).
 *
 * Neil, 15 Oct (tag 074424, relayed by LearnDash 41): "hook based on historical context one sentence … one building
 * sentence based on historical context and then thesis statement one sentence ideally". §54 (7 Oct) already set the
 * introduction at 3 sentences for the ported Literature MARKING tables, but every planning step still asked for "2-3
 * building sentences" (19 lines, 17 files) and AQA poetry marked and modelled 4–5-sentence introductions. A student was
 * planned at 2–3, marked on 2 rows, and modelled on 1.
 *
 *   A. No literature protocol asks for 2–3 building sentences (whole protocols/ tree; language papers excluded).
 *   B. AQA poetry: the building row says ONE sentence carries both rows; both gold introductions are 3 sentences;
 *      no 4–5-sentence introduction is left; the planning step asks for ONE building sentence rooted in context.
 *   C. Falsify — each mutation must fail A or B.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

const TWO_THREE = /\b(?:2|two)\s*(?:-|–|to)\s*(?:3|three)\s*\**\s*(?:comparative\s+)?\**building sentences/i;
const LANG = /\/(?:language\d?|language-?\w*|creative-writing|cw)\//;
function walk(d, out) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.md$/.test(f)) out.push(p); }); return out; }
const FILES = walk(P('protocols'), []).filter(f => !LANG.test(f.replace(ROOT, '')) && !/mark-scheme\/SQA_/.test(f));
const POEM_MARK = 'protocols/aqa/poetry/modules/protocol-a-assessment-poetry.md';
const POEM_PLAN = 'protocols/aqa/poetry/planning/b7-introduction.md';

function check(get, quiet) {
    const bad = [];
    const t = (c, m) => { if (!c) bad.push(m); if (!quiet) ok(c, m); };
    const hits = FILES.filter(f => TWO_THREE.test(get(f)));
    t(hits.length === 0, 'A · no literature protocol asks for 2–3 building sentences (' + FILES.length + ' files scanned)' + (hits.length ? ' — ' + hits.map(h => h.replace(ROOT + '/', '')).slice(0, 4).join(', ') : ''));
    const m = get(P(POEM_MARK)), pl = get(P(POEM_PLAN));
    t(/Worth: 0\.5 marks — the introduction has ONE building sentence \(Neil, 15 Oct 2026\); it carries this row AND row 3/.test(m), 'B · poetry marking: ONE building sentence carries both building rows');
    t((m.match(/COMPLETE[^\n]{0,80}\(3 sentences — hook, building sentence, thesis: ONE sentence each\)/g) || []).length === 2, 'B · poetry marking: both gold introductions are 3 sentences');
    t(!/4-5 sentences|4–5 sentence/.test(m), 'B · poetry marking: no 4–5-sentence introduction left');
    t(/two complete 3-sentence COMPARATIVE introductions/.test(m), 'B · poetry marking: the progression precondition counts 3-sentence introductions');
    t(/Now ONE \*\*comparative building sentence\*\*/.test(pl) && /all in ONE sentence/.test(pl), 'B · poetry planning: ONE comparative building sentence');
    t(/rooted in the poets' historical context/.test(pl) && /rooted in historical context/.test(pl), 'B · poetry planning: the hook is rooted in historical context (step + quality gate)');
    return bad;
}

console.log('A/B · the introduction shape, read from the protocols');
const real = f => fs.readFileSync(f, 'utf8');
check(real, false);

console.log('C · falsify — each mutation must fail');
const MUT = [
    ['the old "2-3 building sentences" back in AQA Literature planning', P('protocols/aqa/literature/planning/b7-introduction.md'), s => s.replace('ONE **building sentence** that bridges', '2-3 **building sentences** that bridge')],
    ['"two to three building sentences" spelled out in a sibling', P('protocols/ocr/literature/planning/b7-introduction.md'), s => s.replace('ONE **building sentence** that bridges', 'two to three **building sentences** that bridge')],
    ['poetry gold rewrite back to 4-5 sentences', P(POEM_MARK), s => s.replace('COMPLETE rewritten version (3 sentences — hook, building sentence, thesis: ONE sentence each)', 'COMPLETE rewritten version (4-5 sentences)')],
    ['poetry building row loses its one-sentence note', P(POEM_MARK), s => s.replace(/ — the introduction has ONE building sentence \(Neil, 15 Oct 2026\)[^\n]*/, '')],
    ['poetry planning back to 2–3', P(POEM_PLAN), s => s.replace('Now ONE **comparative building sentence**', 'Now 2–3 **comparative building sentences**')],
];
for (const [label, file, mut] of MUT) {
    const orig = real(file), changed = mut(orig);
    if (changed === orig) { ok(false, 'mutation did not apply: ' + label); continue; }
    const bad = check(f => (f === file ? changed : real(f)), true);
    ok(bad.length > 0, 'mutation caught: ' + label);
}
console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
