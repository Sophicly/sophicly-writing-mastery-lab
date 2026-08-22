#!/usr/bin/env node
/* eslint-env node */
/**
 * build-markscheme-dataset.js — slice 1 of the CW trials plan (v7.20.544)
 *
 * ONE SOURCE, EXTRACTED, NEVER RETYPED (plan §Layer 4). The AQA Q5 AO5 (24) and
 * AO6 (16) level descriptors live verbatim in
 *   protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md  (Q5 sections)
 * — itself quoted from AQA's own document and manifest-loaded for marking. The
 * examiner-ladder walk needs the same text as a code-served dataset. Retyping it
 * into JS is the drift class this repo keeps getting bitten by, so this build
 * step EXTRACTS it to frontend/wml-markscheme-data.js, and bin/markscheme-gate.js
 * fails the ship on any divergence between the two (tariff-gate discipline).
 *
 * Rebuild after any edit to the Q5 sections of the source:
 *   node bin/build-markscheme-dataset.js
 *
 * DATASET SHAPE — AO-generic on purpose (Neil, 2026-08-21: language and
 * literature too, so a new paper is a DATA job): levels → bands → strands →
 * descriptors. AO5's Upper/Lower sublevels are the bands; AO6 has one band per
 * level and one unnamed strand. Levels are stored TOP-DOWN as the board prints
 * them; the ladder walk reverses for the bottom-up climb (#407).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'protocols', 'aqa', 'language1', 'modules',
    'knowledge-mark-scheme-lang1.md');
const OUT = path.join(ROOT, 'frontend', 'wml-markscheme-data.js');

function parseQ5Section(md, aoLabel) {
    // Section runs from its "## QUESTION 5 — AOx …" header to the next "## " or "---".
    const headRe = new RegExp('^## QUESTION 5 — ' + aoLabel + ' ([^(]+)\\((\\d+) marks\\)[^\\n]*$', 'm');
    const head = md.match(headRe);
    if (!head) throw new Error('cannot find the Q5 ' + aoLabel + ' section header');
    const from = head.index + head[0].length;
    const restAll = md.slice(from);
    const endAt = restAll.search(/^(## |---)/m);
    const body = endAt < 0 ? restAll : restAll.slice(0, endAt);

    const scheme = {
        board: 'aqa', paper: 'language1', question: 'Q5',
        ao: aoLabel,
        title: head[1].trim(),
        maxMarks: parseInt(head[2], 10),
        levels: [],
        level0: null,
        notes: null,
    };

    let level = null, band = null, strand = null;
    for (const rawLine of body.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        let m;
        if ((m = line.match(/^\*\*Level 0 — No marks:\*\*\s*(.+)$/))) {
            scheme.level0 = m[1].trim();
            level = band = strand = null;
            continue;
        }
        // AO5 level: **Level 4 — Compelling, Convincing Communication — 19–24 marks**
        // AO6 level: **Level 4 — 13–16 marks**
        if ((m = line.match(/^\*\*Level (\d+) — (?:(.+) — )?(\d+)–(\d+) marks\*\*$/))) {
            level = {
                level: parseInt(m[1], 10),
                name: m[2] ? m[2].trim() : null,
                min: parseInt(m[3], 10),
                max: parseInt(m[4], 10),
                bands: [],
            };
            scheme.levels.push(level);
            band = strand = null;
            continue;
        }
        // AO5 band: *Upper Level 4 — 22–24 marks*
        if ((m = line.match(/^\*(Upper|Lower) Level (\d+) — (\d+)–(\d+) marks\*$/))) {
            if (!level) throw new Error('band outside a level: ' + line);
            band = {
                name: m[1] + ' Level ' + m[2],
                min: parseInt(m[3], 10),
                max: parseInt(m[4], 10),
                strands: [],
            };
            level.bands.push(band);
            strand = null;
            continue;
        }
        // AO5 strand: "Content:" / "Organisation:"
        if ((m = line.match(/^([A-Za-z ]+):$/))) {
            if (!band) throw new Error('strand outside a band: ' + line);
            strand = { name: m[1].trim(), descriptors: [] };
            band.strands.push(strand);
            continue;
        }
        // Descriptor bullet
        if ((m = line.match(/^- (.+)$/))) {
            if (!level) throw new Error('bullet outside a level: ' + line);
            if (aoLabel === 'AO5') {
                // AO5 lead-in lines ("Content:") always precede bullets; a bullet
                // with no strand would mean the source shape changed — fail loud.
                if (!strand) throw new Error('AO5 bullet outside a strand: ' + line);
                strand.descriptors.push(m[1].trim());
            } else {
                // AO6: flat bullets — one implicit band + strand per level.
                if (!band) {
                    band = { name: 'Level ' + level.level, min: level.min, max: level.max, strands: [] };
                    level.bands.push(band);
                }
                if (!strand) {
                    strand = { name: null, descriptors: [] };
                    band.strands.push(strand);
                }
                strand.descriptors.push(m[1].trim());
            }
            continue;
        }
        // Any other prose inside the section (e.g. lead-ins) — AO5/AO6 Q5 sections
        // have none today; if one appears, refuse to guess what it is.
        throw new Error('unrecognised line in Q5 ' + aoLabel + ' section: "' + line + '"');
    }

    if (!scheme.levels.length) throw new Error('no levels parsed for ' + aoLabel);
    if (!scheme.level0) throw new Error('no Level 0 line parsed for ' + aoLabel);
    return scheme;
}

function main() {
    const md = fs.readFileSync(SOURCE, 'utf8');
    const data = {
        aqa_lang1_q5_ao5: parseQ5Section(md, 'AO5'),
        aqa_lang1_q5_ao6: parseQ5Section(md, 'AO6'),
    };
    const sourceSha1 = crypto.createHash('sha1').update(md).digest('hex');

    const out = `/**
 * wml-markscheme-data.js — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Built by bin/build-markscheme-dataset.js from the ONE mark-scheme source:
 *   protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md (Q5 sections)
 * Every descriptor is the board's own verbatim text. bin/markscheme-gate.js
 * diffs this file against the source on every ship and fails on divergence —
 * an edit made here instead of in the source WILL fail the build.
 *
 * Consumed by the examiner-ladder self-assessment walk (CW trials plan, #407):
 * levels → bands → strands → descriptors, stored top-down; the walk climbs
 * bottom-up and derives the mark from band + top/middle/bottom placement in
 * CODE — the model never produces a number.
 */
(function () {
    'use strict';
    var WML_MARK_SCHEMES = ${JSON.stringify(data, null, 4).replace(/\n/g, '\n    ')};
    WML_MARK_SCHEMES.__sourceSha1 = '${sourceSha1}';
    if (typeof window !== 'undefined') { window.WML_MARK_SCHEMES = WML_MARK_SCHEMES; }
    if (typeof module !== 'undefined' && module.exports) { module.exports = WML_MARK_SCHEMES; }
})();
`;
    fs.writeFileSync(OUT, out);
    const counts = Object.entries(data).map(([k, s]) => {
        let n = 0;
        s.levels.forEach(l => l.bands.forEach(b => b.strands.forEach(st => { n += st.descriptors.length; })));
        return k + ': ' + s.levels.length + ' levels, ' + n + ' descriptors, max ' + s.maxMarks;
    });
    console.log('markscheme dataset built → frontend/wml-markscheme-data.js');
    counts.forEach(c => console.log('  ' + c));
}

main();
