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
// The canonical port source is the NON-loaded sidecar (v7.20.252). It is deliberately absent
// from manifest.json so the model never sees the teaching text (the retained-source defect).
const SIDECAR = path.join(PLAN, '_seq-source.md');
// sequence id → source file(s) the `plain` strings must appear in (verbatim substrings).
const SOURCE = {
    poetry_b2a_teach: [SIDECAR],
    poetry_b4_teach: [SIDECAR],
    poetry_b5_teach: [SIDECAR],
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
const allSegs = []; // every plain segment — reused by the not-in-loaded-context guard below

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
            allSegs.push(s);
            if (!srcs.some(src => src.includes(s))) {
                misses++;
                fail(id + ': segment NOT verbatim in ' + files.map(f => path.basename(f)).join('/') + ':\n      «' + s.slice(0, 90).replace(/\n/g, '⏎') + (s.length > 90 ? '…' : '') + '»');
            }
        });
    });
});

// ── RETAINED-SOURCE GUARD (v7.20.252 — the LAW made mechanical) ──
// Code-served teaching text must NEVER sit in a MANIFEST-LOADED module, or the model narrates it
// (regardless of "do NOT deliver"). Assert no SEQUENCES `plain` segment appears in any file the
// poetry manifest loads. The sidecar (_seq-source.md) is intentionally NOT in the manifest.
(function () {
    const manifestPath = path.join(ROOT, 'protocols', 'aqa', 'poetry', 'manifest.json');
    if (!fs.existsSync(manifestPath)) { console.log('seq-port-harness: (no poetry manifest — retained-source guard skipped)'); return; }
    let man;
    try { man = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
    catch (e) { misses++; fail('manifest.json unparseable: ' + e.message); return; }
    // Manifest is keyed by protocol GROUP (planning/assessment/polishing), each with `always` +
    // `steps.*.files`; paths resolve under `base_path`. Collect every file any group loads.
    const rel = new Set();
    ['planning', 'assessment', 'polishing'].forEach(g => {
        const grp = man[g];
        if (!grp) return;
        (grp.always || []).forEach(f => rel.add(f));
        Object.values(grp.steps || {}).forEach(s => (s.files || []).forEach(f => rel.add(f)));
    });
    const base = path.join(ROOT, man.base_path || 'protocols/aqa/poetry');
    let loadedFilesChecked = 0;
    rel.forEach(r => {
        const fp = path.join(base, r);
        if (!fs.existsSync(fp)) return;
        loadedFilesChecked++;
        const body = fs.readFileSync(fp, 'utf8');
        // Longest segments are the most diagnostic; a short shared phrase could false-positive,
        // so only flag segments ≥ 40 chars (real teaching lines, not incidental words).
        allSegs.filter(s => s.length >= 40).forEach(s => {
            if (body.includes(s)) {
                misses++;
                fail('LOADED module ' + r + ' contains code-served teaching text (model would narrate it) — move it to _seq-source.md:\n      «' + s.slice(0, 90).replace(/\n/g, '⏎') + (s.length > 90 ? '…' : '') + '»');
            }
        });
    });
    if (!misses) console.log('seq-port-harness: retained-source guard ok — ' + loadedFilesChecked + ' manifest-loaded modules, none carry code-served teaching text.');
})();

// ── POEM_PAIRINGS closed-set invariant (Piece 1 comparison-chip recommendations) ──
// Every recommendation id must be a known poem (a key of the map), each focus lists exactly 5,
// and no focus recommends itself. A typo'd id here silently drops that chip — catch it here.
(function () {
    const start = js.indexOf('const POEM_PAIRINGS = {');
    if (start === -1) return; // map absent → nothing to check
    let i = js.indexOf('{', start), depth = 0, end = -1;
    for (; i < js.length; i++) { const c = js[i]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = i; break; } } }
    const body = js.slice(start, end + 1);
    const rows = {};
    const re = /(\w+):\s*\[([^\]]*)\]/g;
    let m;
    while ((m = re.exec(body)) !== null) {
        rows[m[1]] = (m[2].match(/'([^']+)'/g) || []).map(s => s.replace(/'/g, ''));
    }
    const keys = Object.keys(rows);
    const keySet = new Set(keys);
    keys.forEach(focus => {
        const list = rows[focus];
        if (list.length !== 5) { misses++; fail('POEM_PAIRINGS[' + focus + ']: ' + list.length + ' recommendations (expected 5)'); }
        list.forEach(id => {
            if (!keySet.has(id)) { misses++; fail('POEM_PAIRINGS[' + focus + ']: unknown poem id "' + id + '" (not a focus key)'); }
            if (id === focus) { misses++; fail('POEM_PAIRINGS[' + focus + ']: recommends itself'); }
        });
    });
    if (!misses) console.log('seq-port-harness: POEM_PAIRINGS ok — ' + keys.length + ' focus poems, all recommendations valid + closed.');
})();

if (misses) {
    console.error('\nseq-port-harness: FAIL — ' + misses + ' issue(s). Fix the SEQUENCES `plain` to match the .md byte-for-byte (or mark a code-composed line as `text:`), and keep POEM_PAIRINGS a closed set of 5 valid ids.');
    process.exit(1);
}
console.log('seq-port-harness: PASS — ' + checked + ' ported segments verbatim against source modules.');
process.exit(0);
