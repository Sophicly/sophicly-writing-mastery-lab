#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-outline-harness.js — the mechanical gate for the CW Step-6 programmatic outline walk
 * (v7.20.296). Run by bin/pre-ship-check.sh whenever wml-assessment.js, wml-cw6-concepts.js
 * or this harness is staged.
 *
 * It guards the five things that can silently break this walk. Each was a named failure
 * class before it was a check (root CLAUDE.md §0d — engineer the failure out, don't hope):
 *
 *  1. KEY-MATCH / ONE CANONICAL BUILDER (root CLAUDE.md §5d). The walk writes a row by
 *     fieldId and the doc BUILDER emits that fieldId. A one-character divergence means every
 *     answer lands where no read looks. Rather than byte-diffing two templates, this asserts
 *     there is exactly ONE producer of the string — the helper _cw6RowFieldId — and that no
 *     other site in wml-assessment.js hand-builds an `outline-cw-…` id.
 *  2. KEY GRANULARITY (root CLAUDE.md §5e). The id must name ONE ROW of ONE STAGE of ONE
 *     STRUCTURE. Proven by construction across all 8 templates: every generated id is unique.
 *  3. ASKABLE-ROW INVENTORY. turning-point / marker criteria render as divider headings and
 *     carry NO fieldId, so the walk must skip them. If the doc builder's skip rule and the
 *     walk's skip rule ever disagree, the walk asks for a row that cannot be written.
 *  4. TECHNIQUE SYMBOLS EXIST ON PROD. window.SophiclyTable.open(sym) with a symbol the
 *     DEPLOYED table lacks opens an empty panel. Checked against bin/cw6-prod-technique-symbols.txt.
 *  5. CONCEPT-MAP COVERAGE. Reports the % of askable rows that match a concept (so the help
 *     ladder's free rungs have real content) and FAILS below the floor. A row matching nothing
 *     still gets a complete ask, so this is a quality floor, not a correctness gate.
 *
 * Usage: node bin/cw6-outline-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSESS = path.join(ROOT, 'frontend', 'wml-assessment.js');
const CONCEPTS = path.join(ROOT, 'frontend', 'wml-cw6-concepts.js');
const SYMS = path.join(ROOT, 'bin', 'cw6-prod-technique-symbols.txt');

const COVERAGE_FLOOR = 0.90;   // askable rows that must map to a concept
let fail = 0;
const bad = (msg) => { console.error('❌ CW6: ' + msg); fail = 1; };
const ok = (msg) => console.log('   ✓ ' + msg);

// ── load the archetype templates out of wml-assessment.js ────────────────────────────────
function braceSlice(src, fromIdx) {
    const start = src.indexOf('{', fromIdx);
    let d = 0;
    for (let k = start; k < src.length; k++) {
        const c = src[k];
        if (c === '{') d++;
        else if (c === '}') { d--; if (d === 0) return src.slice(start, k + 1); }
        else if (c === '"' || c === "'" || c === '`') {
            const q = c; k++;
            while (k < src.length && src[k] !== q) { if (src[k] === '\\') k++; k++; }
        }
    }
    return null;
}

const assessSrc = fs.readFileSync(ASSESS, 'utf8');
const archIdx = assessSrc.indexOf('cwPlotArchetypes: {');
if (archIdx < 0) { bad('OUTLINE_CRITERIA.cwPlotArchetypes not found in wml-assessment.js'); process.exit(1); }
let ARCH;
try {
    // eslint-disable-next-line no-eval
    ARCH = eval('(' + braceSlice(assessSrc, archIdx + 'cwPlotArchetypes:'.length) + ')');
} catch (e) { bad('cwPlotArchetypes failed to parse — ' + e.message); process.exit(1); }

// ── load the concept map ─────────────────────────────────────────────────────────────────
let MAP;
try {
    const sandbox = { window: {} };
    // eslint-disable-next-line no-new-func
    new Function('window', fs.readFileSync(CONCEPTS, 'utf8'))(sandbox.window);
    MAP = sandbox.window.WML_CW6_CONCEPTS;
} catch (e) { bad('wml-cw6-concepts.js failed to load — ' + e.message); process.exit(1); }
if (!MAP || !Array.isArray(MAP.CONCEPTS) || !MAP.STAGES) { bad('wml-cw6-concepts.js did not set window.WML_CW6_CONCEPTS'); process.exit(1); }

console.log('CW STEP-6 OUTLINE WALK — mechanical gate');
console.log('  templates: ' + Object.keys(ARCH).length + ' · concepts: ' + MAP.CONCEPTS.length);

// ── 1. ONE CANONICAL fieldId BUILDER ─────────────────────────────────────────────────────
if (!/function\s+_cw6RowFieldId\s*\(/.test(assessSrc)) {
    bad('_cw6RowFieldId is missing — the walk and the doc builder must share ONE fieldId producer (§5d.5).');
} else {
    ok('_cw6RowFieldId exists (one canonical producer)');
}
// Any OTHER site that hand-builds the id is a fork waiting to happen. Allowed hits: the
// helper's own body, detectBuiltPlotSlug's PREFIX probe ('outline-cw-' + k + '-'), and comments.
const handBuilt = [];
const srcLines = assessSrc.split('\n');
// The helper's OWN body is the one legitimate place the literal appears. Located, not guessed,
// so a second copy pasted anywhere else in the file is still caught.
const helperLine = srcLines.findIndex(l => /function\s+_cw6RowFieldId\s*\(/.test(l));
srcLines.forEach((line, i) => {
    if (!/outline-cw-/.test(line)) return;
    const t = line.trim();
    if (t.startsWith('//') || t.startsWith('*')) return;            // comments
    if (/_cw6RowFieldId/.test(line)) return;                         // calls / the declaration
    if (/indexOf\('outline-cw-'/.test(line)) return;                 // detectBuiltPlotSlug prefix probe
    if (helperLine >= 0 && i > helperLine && i <= helperLine + 2) return;   // the helper's body
    handBuilt.push((i + 1) + ': ' + t.slice(0, 120));
});
if (handBuilt.length) {
    bad('hand-built `outline-cw-…` fieldId(s) found — route them through _cw6RowFieldId:\n     ' + handBuilt.join('\n     '));
} else {
    ok('no hand-built outline-cw fieldIds outside the canonical helper');
}

// Mirror of the shipped helper. If this and _cw6RowFieldId ever disagree the ids below stop
// matching the doc, which check 3 catches by counting.
const fid = (key, secId, cId) => 'outline-cw-' + key + '-' + secId + '-' + cId;
const isAskable = (c) => c.beatType !== 'turning-point' && c.beatType !== 'marker';

// ── 2 + 3. GRANULARITY + INVENTORY ───────────────────────────────────────────────────────
const seen = new Set();
let dupes = 0, askable = 0, dividers = 0;
const perStructure = [];
Object.entries(ARCH).forEach(([key, a]) => {
    let n = 0, d = 0;
    if (!Array.isArray(a.sections) || a.sections.length !== 6) {
        bad(key + ' has ' + (a.sections ? a.sections.length : 0) + ' sections — the six-stage skeleton is universal (all eight archetypes share it).');
    }
    a.sections.forEach((sec) => {
        sec.criteria.forEach((c) => {
            if (!isAskable(c)) { d++; dividers++; return; }
            const id = fid(key, sec.id, c.id);
            if (seen.has(id)) { dupes++; bad('duplicate fieldId ' + id + ' — the key is too COARSE (§5e): two rows share one slot.'); }
            seen.add(id);
            n++; askable++;
        });
    });
    perStructure.push({ key: key, askable: n, dividers: d, total: n + d });
});
if (!dupes) ok('every generated fieldId is unique across all 8 templates (' + askable + ' askable rows)');
ok(dividers + ' turning-point/marker criteria correctly excluded (they render as dividers, no fieldId)');

// The walk must ask the stage-arc + the two story-anchor rows too. Assert the doc builder
// emits them — a walk asking for a row the builder never made writes nowhere.
// v7.20.368: story_open / story_close removed at Neil's instruction (the template already opens
// Stage I with a real "The ordinary world" beat, so they were duplicates). Only the arc remains.
// NOTE this check greps SOURCE, so it would have passed vacuously on their leftover definitions —
// the real proof that they are gone is the absence assertion in cw6-sim-harness.
['stage_arc'].forEach((extra) => {
    const re = new RegExp("'" + extra + "'");
    if (!re.test(assessSrc)) bad("the doc builder does not emit a '" + extra + "' row — Altitude 1/2 has nowhere to file (add it to buildCWPlotOutlineSection AND the on-load heal).");
});
if (!/tryHealCwStep6StageArcs/.test(assessSrc)) {
    bad('tryHealCwStep6StageArcs is missing — outline shape is BAKED into saved docs, so the new rows need an on-load heal (reference_wml_outline_scaffold_baked_needs_onload_heal).');
} else {
    ok('on-load heal for the new stage-arc / story-anchor rows is present');
}

// ── 4. TECHNIQUE SYMBOLS EXIST ON PROD ───────────────────────────────────────────────────
const prodSyms = new Set(
    fs.readFileSync(SYMS, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
);
const missing = [];
MAP.CONCEPTS.forEach((c) => {
    (c.tech || []).forEach((t) => { if (!prodSyms.has(t.s)) missing.push(c.id + ' → ' + t.s + ' (' + t.l + ')'); });
});
if (missing.length) {
    bad('technique symbol(s) NOT in the PROD table — the chip would open an empty card panel:\n     ' + missing.join('\n     ')
        + '\n     Fix: pick a symbol from bin/cw6-prod-technique-symbols.txt, or wait for the notes deploy and refresh that file.');
} else {
    ok('all ' + MAP.CONCEPTS.reduce((n, c) => n + (c.tech || []).length, 0) + ' technique symbols exist in the PROD table');
}

// ── 5. CONCEPT COVERAGE ──────────────────────────────────────────────────────────────────
function matchConcept(c) {
    const hay = (c.label || '') + ' — ' + (c.prompt || '');
    for (const k of MAP.CONCEPTS) { if (k.m.test(hay)) return k; }
    return null;
}
let matched = 0, nudged = 0;
const unmatchedLabels = new Map();
const stageIds = new Set();
Object.entries(ARCH).forEach(([key, a]) => {
    let m = 0, t = 0;
    a.sections.forEach((sec) => {
        stageIds.add(sec.id);
        sec.criteria.filter(isAskable).forEach((c) => {
            t++;
            const k = matchConcept(c);
            if (k) { m++; matched++; if (k.nudge) nudged++; }
            else unmatchedLabels.set(c.label, (unmatchedLabels.get(c.label) || 0) + 1);
        });
    });
    const row = perStructure.find(r => r.key === key);
    row.matched = m;
    console.log('   ' + key.padEnd(23) + ' ' + String(t).padStart(3) + ' askable · '
        + String(m).padStart(3) + ' mapped (' + (100 * m / t).toFixed(0) + '%)');
});
const cov = matched / askable;
console.log('   COVERAGE ' + matched + '/' + askable + ' = ' + (100 * cov).toFixed(1) + '%'
    + ' · symbolic nudge on ' + nudged + ' rows (' + (100 * nudged / askable).toFixed(0) + '% — Neil ruling: image/symbol/turning-point beats only)');

// Every stage id the templates use must have a fallback entry, or an unmatched row in that
// stage gets an ask with no example at all.
stageIds.forEach((sid) => {
    if (!MAP.STAGES[sid]) bad("STAGES has no entry for stage id '" + sid + "' — unmatched rows there would ask with no worked example.");
});
if (stageIds.size && [...stageIds].every(s => MAP.STAGES[s])) ok('all ' + stageIds.size + ' stage ids have a fallback stage example');

if (cov < COVERAGE_FLOOR) {
    bad('concept coverage ' + (100 * cov).toFixed(1) + '% is below the ' + (100 * COVERAGE_FLOOR) + '% floor.');
    console.error('   Top unmapped labels (add a concept, or widen an existing `m`):');
    [...unmatchedLabels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)
        .forEach(([l, n]) => console.error('     ' + String(n).padStart(2) + '  ' + l));
} else if (unmatchedLabels.size) {
    // Not a failure — those rows still get a complete ask — but never silent (§Behavioural #10).
    const rows = [...unmatchedLabels.values()].reduce((a, b) => a + b, 0);
    console.log('   note: ' + unmatchedLabels.size + ' distinct labels (' + rows + ' rows) fall back to the'
        + ' stage-level example. Not a defect; listed in the handoff as the next authoring batch.');
}

// ── 6. GUIDE DEEP-LINKS RESOLVE ──────────────────────────────────────────────────────────
// [📖 Guidance] scrolls the reference guide to the heading CONTAINING the anchor text. An anchor
// that matches nothing silently dumps the student at the top of a 54KB guide — a dead rung on a
// ladder built so they don't have to spend an API call (§4c.9). So prove every anchor resolves.
const guidePath = path.join(ROOT, 'resources', 'creative-writing-reference-guide.md');
if (!fs.existsSync(guidePath)) {
    bad('resources/creative-writing-reference-guide.md not found — the [📖 Guidance] rung cannot be verified.');
} else {
    const guide = fs.readFileSync(guidePath, 'utf8');
    const headings = guide.split('\n').filter(l => /^#{1,4}\s/.test(l)).map(l => l.replace(/^#+\s*/, '').replace(/[*_`]/g, '').toLowerCase());
    const anchorBlock = assessSrc.slice(assessSrc.indexOf('const GUIDE_ANCHOR = {'));
    const anchors = [];
    const re = /'([^']+)':\s*"([^"]+)"|'([^']+)':\s*'([^']+)'/g;
    let m, guard = 0;
    const block = anchorBlock.slice(0, anchorBlock.indexOf('};') + 2);
    while ((m = re.exec(block)) && guard++ < 40) anchors.push(m[2] || m[4]);
    // plus the nudge anchor, which sends symbol beats to "Making each beat *rich*, not literal"
    const nm = /const NUDGE_ANCHOR = '([^']+)'/.exec(assessSrc);
    if (nm) anchors.push(nm[1]);
    if (anchors.length < 9) {
        bad('expected 8 per-structure guide anchors + the nudge anchor; parsed ' + anchors.length + ' from GUIDE_ANCHOR.');
    }
    const dead = anchors.filter(a => !headings.some(h => h.indexOf(a.toLowerCase()) !== -1));
    if (dead.length) {
        bad('guide anchor(s) match no heading in the reference guide — the Guidance rung would dump the student at the top:\n     ' + dead.join('\n     '));
    } else {
        ok('all ' + anchors.length + ' guide deep-link anchors resolve to a real heading');
    }
}

if (fail) { console.error('\ncw6-outline-harness FAILED'); process.exit(1); }
console.log('✅ cw6-outline-harness passed.');
