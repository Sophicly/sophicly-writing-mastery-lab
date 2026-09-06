#!/usr/bin/env node
/* eslint-env node */
/**
 * markscheme-gate.js — slice 1 of the CW trials plan (v7.20.544)
 *
 * The examiner-ladder dataset (frontend/wml-markscheme-data.js) is GENERATED
 * from the mark-scheme sections registered in bin/markscheme-sources.js (every AQA
 * Lang P1 + P2 question × AO since v7.20.603).
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
const { SOURCES } = require('./markscheme-sources');
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
const data = require(DATASET);
const mdCache = {};
const readSource = (rel) => {
    if (!mdCache[rel]) mdCache[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    return mdCache[rel];
};

// ── 1 · freshness — PER SOURCE FILE, so the stale one is named ──────────────
const sourceFiles = [...new Set(SOURCES.map((e) => e.source))];
ok(!!data.__sources, 'dataset carries no __sources map — rebuild with the registry-driven builder');
sourceFiles.forEach((rel) => {
    const sha1 = crypto.createHash('sha1').update(readSource(rel)).digest('hex');
    ok(!!data.__sources && data.__sources[rel] === sha1,
        'STALE DATASET: ' + rel + ' changed since the last build — run node bin/build-markscheme-dataset.js');
});

// ── slice each registered section out of its source, independently of the builder ──
// The registry's header regex is the ONLY thing shared with the builder (which sections exist);
// how the section is read is deliberately re-derived here from the raw lines.
function section(entry) {
    const md = readSource(entry.source);
    const head = md.match(entry.header);
    if (!head) return null;
    const rest = md.slice(head.index + head[0].length);
    const end = rest.search(/^(## |---)/m);
    return end < 0 ? rest : rest.slice(0, end);
}

for (const entry of SOURCES) {
    const key = entry.key, aoLabel = entry.question + ' ' + entry.ao;
    const scheme = data[key];
    const sec = section(entry);
    ok(!!scheme, key + ' missing from the dataset');
    ok(!!sec, key + ': section missing from ' + entry.source);
    if (!scheme || !sec) continue;

    // ── 2 · verbatim: every descriptor is a real "- …" line in this section ──
    // Level 0 closes the levels. A bullet printed AFTER it is a board note (AQA P2 Q2: "If the
    // quality of the response is Level 1 but only deals with one text, the mark must be 1 not
    // 2.") — it must survive verbatim as a NOTE and must never be counted as a criterion.
    const _l0At = sec.search(/^\*\*Level 0 — No marks:\*\*/m);
    const _descRegion = _l0At < 0 ? sec : sec.slice(0, _l0At);
    const _noteRegion = _l0At < 0 ? '' : sec.slice(_l0At);
    const bulletLines = _descRegion.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('- '))
        .map(l => l.slice(2).trim());
    const noteBullets = _noteRegion.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('- '))
        .map(l => l.slice(2).trim());
    noteBullets.forEach(nb => {
        ok(Array.isArray(scheme.notes) && scheme.notes.indexOf(nb) !== -1,
            aoLabel + ' post-Level-0 bullet is NOT carried as a note: "' + nb + '"');
    });
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
