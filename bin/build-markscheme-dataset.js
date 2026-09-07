#!/usr/bin/env node
/* eslint-env node */
/**
 * build-markscheme-dataset.js — slice 1 of the CW trials plan (v7.20.544)
 *
 * ONE SOURCE PER SECTION, EXTRACTED, NEVER RETYPED (plan §Layer 4). Every level
 * descriptor lives verbatim in the paper's knowledge-mark-scheme*.md — itself quoted
 * from the board's own document and manifest-loaded for marking. Which sections are
 * extracted is the registry in bin/markscheme-sources.js (v7.20.603: every AQA Lang
 * P1 + P2 question, not only Q5 — the examiner ladder is going into the assessments,
 * FIXLIST #469, PEDAGOGY §33.13 / §35). The
 * examiner-ladder walk needs the same text as a code-served dataset. Retyping it
 * into JS is the drift class this repo keeps getting bitten by, so this build
 * step EXTRACTS it to frontend/wml-markscheme-data.js, and bin/markscheme-gate.js
 * fails the ship on any divergence between the two (tariff-gate discipline).
 *
 * Rebuild after any edit to a registered section of any source:
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
const { SOURCES } = require('./markscheme-sources');
const OUT = path.join(ROOT, 'frontend', 'wml-markscheme-data.js');

/**
 * Parse ONE registered section (bin/markscheme-sources.js row) out of its source markdown.
 *
 * Shapes it accepts — all of them are how the AQA sources already print (2026-09-06 survey of
 * knowledge-mark-scheme-lang1.md / -lang2.md):
 *   **Level N — <name> — a–b marks**        a level (name optional: AO6 prints none)
 *   <one prose line straight after a level>  the board's lead-in ("Shows clear understanding of
 *                                            language:") — kept as `lead`, NEVER a descriptor
 *   *Upper|Lower Level N — a–b marks*        a band (AQA AO5 only — `banded: true` rows)
 *   Name:                                    a strand inside a band (Content: / Organisation:)
 *   - text                                   a descriptor — verbatim, the board's words
 *   **Level 0 — No marks:** text             the zero line
 *   > … / any other prose outside a level    notes (the AQA note on out-of-range lines etc.)
 * Anything else INSIDE a level that is not one of those refuses loudly — a shape the parser does
 * not recognise is a shape a student would read wrongly, and guessing is the one thing this file
 * must never do (root §19).
 */
function parseSection(md, entry) {
    const head = md.match(entry.header);
    if (!head) throw new Error(entry.key + ': cannot find its section header in ' + entry.source);
    const from = head.index + head[0].length;
    const restAll = md.slice(from);
    const endAt = restAll.search(/^(## |---)/m);
    const body = endAt < 0 ? restAll : restAll.slice(0, endAt);

    const scheme = {
        board: entry.board, paper: entry.paper, question: entry.question,
        ao: entry.ao,
        title: head[1].trim(),
        maxMarks: parseInt(head[2], 10),
        levels: [],
        level0: null,
        notes: [],
    };

    let level = null, band = null, strand = null, expectLead = false, inTypical = false;
    for (const rawLine of body.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        let m;
        if ((m = line.match(/^\*\*Level 0 — No marks:\*\*\s*(.+)$/))) {
            inTypical = false;
            scheme.level0 = m[1].trim();
            level = band = strand = null; expectLead = false;
            continue;
        }
        if ((m = line.match(/^\*\*Level (\d+) — (?:(.+) — )?(\d+)–(\d+) marks\*\*$/))) {
            inTypical = false;
            level = {
                level: parseInt(m[1], 10),
                name: m[2] ? m[2].trim() : null,
                min: parseInt(m[3], 10),
                max: parseInt(m[4], 10),
                lead: null,
                bands: [],
            };
            scheme.levels.push(level);
            band = strand = null; expectLead = !entry.banded;
            continue;
        }
        if ((m = line.match(/^\*(Upper|Lower) Level (\d+) — (\d+)–(\d+) marks\*$/))) {
            if (!level) throw new Error(entry.key + ': band outside a level: ' + line);
            inTypical = false;
            band = { name: m[1] + ' Level ' + m[2], min: parseInt(m[3], 10), max: parseInt(m[4], 10), strands: [] };
            level.bands.push(band);
            strand = null; expectLead = false;
            continue;
        }
        // A strand line: "Content:" / "Organisation:" (AQA AO5, inside a printed band) — P2's
        // copy prints "Content" with no colon, so the colon is optional. In a FLAT level an
        // "AO1:" / "AO2:" line names the strand the following bullets belong to (AQA Literature
        // prints both AOs' descriptors inside ONE level); the band is then the level itself.
        if ((m = line.match(/^([A-Z][A-Za-z0-9 ]{0,24}):?$/)) && (band || (level && !entry.banded && !expectLead))) {
            inTypical = false;
            if (!band) { band = { name: 'Level ' + level.level, min: level.min, max: level.max, strands: [] }; level.bands.push(band); }
            strand = { name: m[1].trim(), descriptors: [] };
            band.strands.push(strand);
            continue;
        }
        if ((m = line.match(/^- (.+)$/))) {
            if (!level && scheme.level0) {
                // A bullet AFTER the Level 0 line is a board note printed as a bullet (AQA P2 Q2:
                // "If the quality of the response is Level 1 but only deals with one text, the
                // mark must be 1 not 2."). Level 0 closes the levels; nothing after it is a
                // criterion a student is asked to meet. Kept as a note, never a descriptor.
                scheme.notes.push(m[1].trim());
                continue;
            }
            inTypical = false;
            if (!level) throw new Error(entry.key + ': bullet outside a level: ' + line);
            expectLead = false;
            if (entry.banded) {
                // AO5: every bullet sits under a printed strand — a bare one means the source
                // shape changed. Fail loud.
                if (!strand) throw new Error(entry.key + ': banded bullet outside a strand: ' + line);
                strand.descriptors.push(m[1].trim());
            } else {
                // Flat levels: one implicit band + one unnamed strand per level.
                if (!band) { band = { name: 'Level ' + level.level, min: level.min, max: level.max, strands: [] }; level.bands.push(band); }
                if (!strand) { strand = { name: null, descriptors: [] }; band.strands.push(strand); }
                strand.descriptors.push(m[1].trim());
            }
            continue;
        }
        if (level && expectLead) {
            // The board's own lead-in sentence for this level ("Shows perceptive and detailed
            // understanding of language:"). It frames the bullets and is shown with them; it is
            // NOT a criterion, so the gate's bullet count never includes it.
            level.lead = line.replace(/:$/, '').trim();
            expectLead = false;
            continue;
        }
        if (!level || line.startsWith('>') || /^AQA note:/i.test(line) || /^Assesses /i.test(line)) {
            // Prose that belongs to the section, not to a level.
            scheme.notes.push(line.replace(/^>\s*/, '').trim());
            level = band = strand = null; expectLead = false;
            continue;
        }
        if (level && /^Typical features/i.test(line)) {
            // The board's "Typical features … at Level N" guidance (AQA P2 Q5 prints it inside
            // each band). Verbatim, attached to the level, never a criterion — the gate counts
            // only "- " bullets, so this can neither be dropped nor mistaken for one.
            level.typical = (level.typical || []).concat([line]);
            inTypical = true; expectLead = false;
            continue;
        }
        if (level && inTypical) {
            // The source wraps that guidance over several lines; join the continuation onto the
            // entry it belongs to. Any bullet / band / strand / level line above resets the flag.
            level.typical[level.typical.length - 1] += ' ' + line;
            continue;
        }
        throw new Error(entry.key + ': unrecognised line inside a level: "' + line + '"');
    }

    if (!scheme.levels.length) throw new Error(entry.key + ': no levels parsed');
    if (!scheme.level0) throw new Error(entry.key + ': no Level 0 line parsed');
    return scheme;
}

function main() {
    const mdCache = {};
    const readSource = (rel) => {
        if (!mdCache[rel]) mdCache[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        return mdCache[rel];
    };
    const data = {};
    SOURCES.forEach((entry) => {
        if (data[entry.key]) throw new Error('duplicate key in markscheme-sources.js: ' + entry.key);
        data[entry.key] = parseSection(readSource(entry.source), entry);
    });
    // One sha per SOURCE FILE so the gate can tell which one went stale.
    const sources = {};
    Object.keys(mdCache).forEach((rel) => { sources[rel] = crypto.createHash('sha1').update(mdCache[rel]).digest('hex'); });
    const sourceSha1 = sources[SOURCES[0].source];   // kept for any consumer that read the old field

    const out = `/**
 * wml-markscheme-data.js — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Built by bin/build-markscheme-dataset.js from the sources registered in
 * bin/markscheme-sources.js (one section per question × AO, each in the board's
 * own knowledge-mark-scheme file). Every descriptor is the board's own verbatim text. bin/markscheme-gate.js
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
    WML_MARK_SCHEMES.__sources = ${JSON.stringify(sources, null, 4).replace(/\n/g, '\n    ')};
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
