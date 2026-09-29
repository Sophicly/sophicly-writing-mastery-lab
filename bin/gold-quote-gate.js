#!/usr/bin/env node
/* eslint-env node */
/**
 * gold-quote-gate.js — every quotation in a gold-standard model must exist in the source it claims.
 *
 * WHY (FIXLIST #666, 2026-09-29): Sophia's AQA Language benchmark golds were partly built on
 * quotations that exist in NO text a student reads — P1 Q2 ¶2 "a furnace breathing over the land",
 * P1 Q4 "silent storm that raged inside him", P2 "Fogle… likening the hospital to 'an enormous ship
 * on fire'" (Fogle rows the Atlantic). The golds were manifest-loaded, so Sophia modelled invented
 * evidence as top-band practice for months. No gate could see it. This one can.
 *
 * HOW: each ROW names a gold file, the slice of it that holds reading golds (start/end markers), the
 * source text the golds must quote (a pdftotext -layout copy kept in research/sources/), and the
 * question paper (a quotation of the exam STATEMENT is legitimate). Every '…' and "…" span inside
 * the slice must appear verbatim in the source or the question paper, after normalising whitespace,
 * curly quotes and the source's printed line numbers. Anything else fails the build.
 *
 * Adding a paper = one ROW + its source text. Run: node bin/gold-quote-gate.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const ROWS = [
    {
        name: 'AQA Lang P1 — knowledge-hub golds Q2–Q4 (June 2024, Lessing)',
        file: 'protocols/aqa/language1/modules/knowledge-hub.md',
        start: '**Gold Standard Model – Question 2',
        end: '**Gold Standard Model – Question 5',
        source: 'research/sources/aqa-8700-1-jun24-insert.txt',
        question: 'research/sources/aqa-8700-1-jun24-qp.txt',
    },
];

// Printed line numbers ("   16        pouring it over her") sit mid-phrase in a layout extraction.
const stripLineNos = t => t.split('\n').map(l => l.replace(/^\s*\d{1,3}\s{2,}/, '')).join(' ');
const norm = t => String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\\/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
// A quotation: '…' not glued to letters (so Mary's / Dick's are apostrophes, not quotes), or "…".
function quotations(text) {
    const out = [];
    for (const m of text.matchAll(/(?<![A-Za-z])'([^'\n]{3,200}?)'(?![A-Za-z])/g)) out.push(m[1]);
    for (const m of text.matchAll(/"([^"\n]{3,240}?)"/g)) out.push(m[1].replace(/^'+|'+$/g, ''));
    return [...new Set(out.map(q => q.replace(/[,.;:!?]+$/, '').trim()).filter(q => q.length >= 3))];
}

let fail = 0, checked = 0;
for (const r of ROWS) {
    const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
    let gold, src, qp;
    try { gold = read(r.file); src = norm(stripLineNos(read(r.source))); qp = norm(stripLineNos(read(r.question))); }
    catch (e) { console.error(`❌ ${r.name}: cannot read — ${e.message}`); fail++; continue; }
    const a = gold.indexOf(r.start), b = gold.indexOf(r.end, a + 1);
    if (a < 0 || b < 0) { console.error(`❌ ${r.name}: slice markers not found (${a}, ${b}) — the gold moved; fix the ROW`); fail++; continue; }
    const qs = quotations(gold.slice(a, b));
    const missing = qs.filter(q => { const n = norm(q); return !src.includes(n) && !qp.includes(n); });
    checked += qs.length;
    if (qs.length === 0) { console.error(`❌ ${r.name}: no quotations found — a gold with no evidence is not a gold`); fail++; continue; }
    if (missing.length) {
        fail++;
        console.error(`❌ ${r.name}: ${missing.length} of ${qs.length} quotation(s) are not in the source or question paper:`);
        for (const q of missing) console.error(`     ✗ "${q}"`);
    } else console.log(`  ✓ ${r.name}: ${qs.length} quotation(s), every one found`);
}

// Self-test: a known fabrication must be caught (so a loosened matcher cannot pass silently).
{
    const src = norm(stripLineNos(fs.readFileSync(path.join(ROOT, ROWS[0].source), 'utf8')));
    if (src.includes(norm('a furnace breathing over the land'))) { console.error('❌ self-test: the known fabrication matched the source — the matcher is broken'); fail++; }
    if (!src.includes(norm('the porous brick, which hissed with dryness'))) { console.error('❌ self-test: a known real quotation (split by a printed line number) was not found — the normaliser is broken'); fail++; }
}

if (fail) { console.error(`❌ gold-quote-gate: ${fail} failure(s)`); process.exit(1); }
console.log(`✅ gold-quote-gate passed (${ROWS.length} gold set(s), ${checked} quotations verified against the real source)`);
