#!/usr/bin/env node
/* eslint-env node */
/**
 * seq-port-harness.js — Piece 2 (v7.20.250) byte-verbatim port gate.
 *
 * The scripted-sequence teaching PLAYER (frontend/wml-assessment.js `SEQUENCES`) serves the
 * b4/b5 teaching chunks as CODE, replacing the API narration that DRIFTED (padded chunks,
 * dropped b4 CHUNK 3). CLAUDE.md #13 requires a byte-for-byte PORT — so this gate proves every
 * `plain:` string in SEQUENCES is a verbatim substring of its source protocol module. A wrong
 * or drifted label cannot ship.
 *
 *   `plain:` = byte-verbatim port  → MUST appear in the source .md (checked here).
 *   `text:`  = code-composed (recap lines, the reworded mode ask / Ozymandias line) → NOT checked.
 *
 * Each `plain` is split on blank lines into segments; every segment must be a contiguous
 * substring of the source module. (Splitting tolerates the SAY/ASK boundary — b4 CHUNK 3 shows
 * its SAY then its ASK question in one bubble, but the .md separates them with `" … ASK: "`.)
 *
 * Exit 0 = all ports verbatim; exit 1 = drift (prints each miss). No deps; wired into
 * bin/pre-ship-check.sh --all.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSESS = path.join(ROOT, 'frontend', 'wml-assessment.js');
const PLAN = path.join(ROOT, 'protocols', 'aqa', 'poetry', 'planning');
// sequence id → the protocol module(s) it ports from (a plain may come from ANY listed source).
const SOURCE = {
    poetry_b2a_teach: [path.join(PLAN, 'b2-goals-keywords.md')],
    poetry_b4_teach: [path.join(PLAN, 'b3-diagnostic.md'), path.join(PLAN, 'b4-anchors.md')],
    poetry_b5_teach: [path.join(PLAN, 'b5-bodies.md')],
};

function fail(msg) { console.error('  ✗ ' + msg); }

// Pull the SEQUENCES object literal body (between `const SEQUENCES = {` and the matching close),
// then slice it per sequence id so each plain is checked against the RIGHT source module.
function sequenceBlocks(js) {
    const start = js.indexOf('const SEQUENCES = {');
    if (start === -1) { console.error('seq-port-harness: SEQUENCES literal not found'); process.exit(1); }
    // brace-match from the first '{' after the marker.
    let i = js.indexOf('{', start), depth = 0, end = -1;
    for (; i < js.length; i++) {
        const c = js[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    const body = js.slice(start, end + 1);
    const ids = Object.keys(SOURCE);
    const blocks = {};
    ids.forEach((id, n) => {
        const from = body.indexOf(id + ':');
        if (from === -1) return;
        const nextId = ids.slice(n + 1).map(x => body.indexOf(x + ':', from + 1)).filter(x => x > -1).sort((a, b) => a - b)[0];
        blocks[id] = body.slice(from, nextId === undefined ? body.length : nextId);
    });
    return blocks;
}

// Every double-quoted `plain: "..."` (escapes allowed; no raw newlines in the literal).
function plains(block) {
    const out = [];
    const re = /\bplain:\s*"((?:[^"\\]|\\.)*)"/g;
    let m;
    while ((m = re.exec(block)) !== null) {
        try { out.push(JSON.parse('"' + m[1] + '"')); }
        catch (e) { out.push(null); } // malformed → surfaces as a miss below
    }
    return out;
}

const js = fs.readFileSync(ASSESS, 'utf8');
const blocks = sequenceBlocks(js);
let checked = 0, misses = 0;

Object.keys(SOURCE).forEach(id => {
    const block = blocks[id];
    if (!block) { fail(id + ': not found in SEQUENCES'); misses++; return; }
    const files = SOURCE[id];
    const srcs = files.map(f => fs.readFileSync(f, 'utf8'));
    plains(block).forEach((p, idx) => {
        if (p == null) { fail(id + ' plain#' + idx + ': unparseable literal'); misses++; return; }
        p.split(/\n\n+/).forEach(seg => {
            const s = seg.trim();
            if (!s) return;
            checked++;
            if (!srcs.some(src => src.includes(s))) {
                misses++;
                fail(id + ': segment NOT verbatim in ' + files.map(f => path.basename(f)).join('/') + ':\n      «' + s.slice(0, 90).replace(/\n/g, '⏎') + (s.length > 90 ? '…' : '') + '»');
            }
        });
    });
});

if (misses) {
    console.error('\nseq-port-harness: FAIL — ' + misses + ' ported segment(s) drifted from source. Fix the SEQUENCES `plain` to match the .md byte-for-byte (or mark a deliberately code-composed line as `text:`).');
    process.exit(1);
}
console.log('seq-port-harness: PASS — ' + checked + ' ported segments verbatim against source modules.');
process.exit(0);
