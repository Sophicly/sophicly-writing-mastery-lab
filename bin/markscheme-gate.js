#!/usr/bin/env node
/* eslint-env node */
/**
 * markscheme-gate.js — slice 1 of the CW trials plan (v7.20.544)
 *
 * The examiner-ladder dataset (frontend/wml-markscheme-data.js) is GENERATED
 * from the one mark-scheme source (knowledge-mark-scheme-lang1.md, Q5 sections).
 * This gate fails the ship when the two diverge — the tariff-gate discipline:
 * every descriptor a student reads must be the board's own verbatim text.
 *
 * DELIBERATELY NOT THE BUILDER'S PARSER (root feedback: a check that duplicates
 * its subject tests its own memory). The builder parses structure; this gate
 * checks four independent axes against a raw re-read of the source:
 *   1. FRESHNESS   — the dataset's embedded source sha1 matches the md on disk,
 *                    so editing the source without rebuilding fails.
 *   2. VERBATIM    — every descriptor + Level 0 note is an exact "- …"/text line
 *                    inside its own AO's Q5 section.
 *   3. COMPLETENESS— the section's bullet COUNT equals the dataset's descriptor
 *                    count (a silently dropped bullet is the §14c truncation
 *                    defect, and verbatim checks alone cannot see it).
 *   4. ARITHMETIC  — every "X–Y marks" range printed in the section exists in
 *                    the dataset; bands partition their level; levels tile
 *                    1..maxMarks with no gap or overlap.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'protocols', 'aqa', 'language1', 'modules',
    'knowledge-mark-scheme-lang1.md');
const DATASET = path.join(ROOT, 'frontend', 'wml-markscheme-data.js');

let fails = 0, checks = 0;
function ok(cond, msg) {
    checks++;
    if (!cond) { fails++; console.log('   ❌ ' + msg); }
}

if (!fs.existsSync(DATASET)) {
    console.log('markscheme-gate: ❌ dataset missing — run node bin/build-markscheme-dataset.js');
    process.exit(1);
}
const md = fs.readFileSync(SOURCE, 'utf8');
const data = require(DATASET);

// ── 1 · freshness ───────────────────────────────────────────────────────────
const sha1 = crypto.createHash('sha1').update(md).digest('hex');
ok(data.__sourceSha1 === sha1,
    'STALE DATASET: the source md changed since the last build — run node bin/build-markscheme-dataset.js');

// ── slice each AO's section out of the source, independently of the builder ──
function section(aoLabel) {
    const at = md.search(new RegExp('^## QUESTION 5 — ' + aoLabel + ' ', 'm'));
    if (at < 0) return null;
    const rest = md.slice(at).split('\n').slice(1).join('\n');
    const end = rest.search(/^(## |---)/m);
    return end < 0 ? rest : rest.slice(0, end);
}

const AOS = [
    ['aqa_lang1_q5_ao5', 'AO5'],
    ['aqa_lang1_q5_ao6', 'AO6'],
];

for (const [key, aoLabel] of AOS) {
    const scheme = data[key];
    const sec = section(aoLabel);
    ok(!!scheme, key + ' missing from the dataset');
    ok(!!sec, 'Q5 ' + aoLabel + ' section missing from the source');
    if (!scheme || !sec) continue;

    // ── 2 · verbatim: every descriptor is a real "- …" line in this section ──
    const bulletLines = sec.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('- '))
        .map(l => l.slice(2).trim());
    const bulletSet = new Map();
    bulletLines.forEach(b => bulletSet.set(b, (bulletSet.get(b) || 0) + 1));

    let dsCount = 0;
    scheme.levels.forEach(level => level.bands.forEach(band => band.strands.forEach(strand => {
        strand.descriptors.forEach(d => {
            dsCount++;
            ok(bulletSet.has(d),
                aoLabel + ' descriptor is NOT verbatim in the source: "' + d + '"');
        });
    })));

    // ── 3 · completeness: nothing dropped, nothing invented ──
    ok(dsCount === bulletLines.length,
        aoLabel + ' descriptor count mismatch: dataset has ' + dsCount +
        ', the source section has ' + bulletLines.length + ' bullets');

    // Level 0 note, verbatim on its own line
    const l0 = sec.match(/^\*\*Level 0 — No marks:\*\*\s*(.+)$/m);
    ok(!!l0, aoLabel + ' Level 0 line missing from the source section');
    if (l0) ok(scheme.level0 === l0[1].trim(),
        aoLabel + ' Level 0 text diverges: dataset "' + scheme.level0 + '" vs source "' + l0[1].trim() + '"');

    // ── 4 · arithmetic ──
    // Every printed range appears in the dataset as a level or band [min,max].
    const dsRanges = new Set();
    scheme.levels.forEach(level => {
        dsRanges.add(level.min + '-' + level.max);
        level.bands.forEach(b => dsRanges.add(b.min + '-' + b.max));
    });
    const printed = [...sec.matchAll(/(\d+)–(\d+) marks/g)];
    ok(printed.length > 0, aoLabel + ': no "X–Y marks" ranges found in the source section');
    printed.forEach(m => {
        ok(dsRanges.has(m[1] + '-' + m[2]),
            aoLabel + ' printed range ' + m[1] + '–' + m[2] + ' marks is not in the dataset');
    });

    // Bands partition their level; levels tile 1..maxMarks (top-down storage).
    scheme.levels.forEach(level => {
        const bands = [...level.bands].sort((a, b) => b.max - a.max);
        ok(bands[0].max === level.max && bands[bands.length - 1].min === level.min,
            aoLabel + ' L' + level.level + ': bands do not span the level range');
        for (let i = 0; i < bands.length - 1; i++) {
            ok(bands[i].min === bands[i + 1].max + 1,
                aoLabel + ' L' + level.level + ': band gap/overlap at ' + bands[i].min + '/' + bands[i + 1].max);
        }
    });
    const levels = [...scheme.levels].sort((a, b) => b.max - a.max);
    ok(levels[0].max === scheme.maxMarks,
        aoLabel + ': top level max ' + levels[0].max + ' ≠ maxMarks ' + scheme.maxMarks);
    ok(levels[levels.length - 1].min === 1, aoLabel + ': bottom level does not start at 1');
    for (let i = 0; i < levels.length - 1; i++) {
        ok(levels[i].min === levels[i + 1].max + 1,
            aoLabel + ': level gap/overlap at L' + levels[i].level + '/' + levels[i + 1].level);
    }
}

if (fails) {
    console.log('❌ markscheme-gate FAILED (' + fails + ' of ' + checks + ' checks). The dataset and the');
    console.log('   mark-scheme source have diverged. Fix the SOURCE md (never the generated file),');
    console.log('   then: node bin/build-markscheme-dataset.js');
    process.exit(1);
}
console.log('✅ markscheme-gate passed (' + checks + ' checks: every descriptor verbatim from the');
console.log('   board\'s own text, nothing dropped, every band and level range accounted for).');
