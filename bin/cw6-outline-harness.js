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
// ⚠️ v7.20.374 — CALL THE PRODUCTION RESOLVER, never a copy of it. This used to be a local
// re-implementation of first-match-wins, which meant the gate and the runtime could disagree
// silently — a registry asserting things about a source it does not actually read
// (feedback_a_registry_is_a_claim_about_a_source_not_the_source). It now uses the exported
// `conceptFor`, so a change to matching semantics is tested rather than mirrored.
if (typeof MAP.conceptFor !== 'function') {
    bad('wml-cw6-concepts.js no longer exports conceptFor() — this gate would silently fall back to '
        + 'testing its own copy of the matcher instead of the one the walk actually uses.');
}
// ⚠️ v7.20.408 — MUST PASS THE ARCHETYPE KEY. Until now this called conceptFor(label, prompt) with
// no third argument, so the gate tested archetype-BLIND resolution while the shipped walk and the
// document's [Examples] button both pass the key. A concept scoped with `arch:` would have resolved
// differently here than in the product, and the harness would have reported green either way —
// the same "testing a path that no longer ships" trap as the copied resolver above.
function matchConcept(c, archetypeKey) {
    return (typeof MAP.conceptFor === 'function') ? MAP.conceptFor(c.label, c.prompt, archetypeKey) : null;
}
let matched = 0, nudged = 0;
const conceptWins = new Map();
const unmatchedLabels = new Map();
const conceptStageIdx = new Map();
const stageIds = new Set();
Object.entries(ARCH).forEach(([key, a]) => {
    let m = 0, t = 0;
    a.sections.forEach((sec, secIdx) => {
        stageIds.add(sec.id);
        sec.criteria.filter(isAskable).forEach((c) => {
            t++;
            const k = matchConcept(c, key);
            if (k) { m++; matched++; if (k.nudge) nudged++; conceptWins.set(k.id, (conceptWins.get(k.id) || 0) + 1);
                // v7.20.376 (#124): remember WHERE in the arc each concept is actually asked,
                // derived from the real templates rather than the source layout of the map.
                const seen = conceptStageIdx.get(k.id) || new Set();
                seen.add(secIdx); conceptStageIdx.set(k.id, seen); }
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


// ── 5c. ARCHETYPE SCOPING + ROWMAP INTEGRITY (v7.20.408) ─────────────────────────────────────
// The 2026-08-03 audit found 82 of 232 askable (label → concept) pairs wrong or weak, because the
// resolver was archetype-BLIND: a shared concept could claim a beat that exists in one structure
// only. `arch:` scopes a concept; ROWMAP records the 75 human-audited exceptions. Both are only
// worth having if they are enforced, so:
//   A. a scoped concept must never win a row outside its scope (would be silent wrong teaching);
//   B. every ROWMAP label must exist in a real template (a typo'd label is a correction that
//      never applies, and NOTHING would say so — the row keeps its wrong concept);
//   C. every ROWMAP entry must actually be REACHED (an entry shadowed by an earlier duplicate,
//      or scoped to an archetype the label never appears in, is dead weight pretending to be a fix).
{
    const scopeViolations = [];
    const templateLabels = new Set();
    const reachedRowmap = new Set();
    const ROWMAP = MAP.ROWMAP || [];
    const rowmapIndex = new Map();
    ROWMAP.forEach((e, i) => { if (e && e.l) rowmapIndex.set(e.l + '|' + i, e); });

    Object.entries(ARCH).forEach(([key, a]) => {
        a.sections.forEach((sec) => {
            sec.criteria.forEach((c) => {
                if (c.label) templateLabels.add(c.label);
                if (!isAskable(c)) return;
                const k = matchConcept(c, key);
                if (k && k.arch && k.arch.indexOf(key) === -1) {
                    scopeViolations.push('[' + key + '] "' + c.label + '" → `' + k.id
                        + '` (scoped to ' + k.arch.join('/') + ')');
                }
                // which ROWMAP entry, if any, produced this answer
                for (let i = 0; i < ROWMAP.length; i++) {
                    const e = ROWMAP[i];
                    if (!e || e.l !== c.label) continue;
                    if (e.arch && e.arch.indexOf(key) === -1) continue;
                    reachedRowmap.add(i);
                    break;
                }
            });
        });
    });

    if (scopeViolations.length) {
        bad('ARCH SCOPE VIOLATION — ' + scopeViolations.length + ' row(s) resolve to a concept scoped to a '
            + 'DIFFERENT plot structure, so the student is taught a beat their story does not have:\n     '
            + scopeViolations.slice(0, 10).join('\n     '));
    } else {
        ok('no archetype-scoped concept wins a row outside its scope');
    }

    const deadLabels = ROWMAP.filter(e => e && e.l && !templateLabels.has(e.l));
    if (deadLabels.length) {
        bad('ROWMAP has ' + deadLabels.length + ' entr(y/ies) whose beat label is in NO template — the audited '
            + 'correction never applies and the row silently keeps its wrong concept:\n     '
            + deadLabels.map(e => '"' + e.l + '" → `' + e.id + '`').join('\n     '));
    } else {
        ok('every ROWMAP label exists in a real template');
    }

    const unreachedRowmap = ROWMAP.map((e, i) => i).filter(i => !reachedRowmap.has(i));
    if (unreachedRowmap.length) {
        bad('ROWMAP has ' + unreachedRowmap.length + ' entr(y/ies) that no askable row ever reaches '
            + '(shadowed by an earlier duplicate, or scoped to an archetype the label never appears in):\n     '
            + unreachedRowmap.slice(0, 10).map(i => '[' + i + '] "' + ROWMAP[i].l + '" → `' + ROWMAP[i].id + '`').join('\n     '));
    } else {
        ok('all ' + ROWMAP.length + ' ROWMAP corrections are reached by a real beat row');
    }
}

// ── 5b. NO CONCEPT MAY BE UNREACHABLE (v7.20.374) ────────────────────────────────────────────
// `conceptFor` picks a winner among matching concepts, so a concept whose pattern is a SUBSET of
// an earlier, broader one never wins a single row — and its criteria, worked example and technique
// chips have never reached a student. Six were in exactly that state and nothing said so: coverage
// read 100%, because every ROW matched something. Coverage measures rows; this measures CONCEPTS.
// Proof it matters: 24 rows of "Hero surpasses the Mentor" served the `mentor` card ("someone who
// has BEEN where your protagonist is going") because `/mentor/i` sits earlier than
// `/surpasses the mentor/i`. Fix is `pri: 1` on the specific concept, not a reworded regex.
const unreachable = MAP.CONCEPTS.filter(c => !conceptWins.get(c.id));
if (unreachable.length) {
    bad(unreachable.length + ' concept(s) are UNREACHABLE — authored, but no beat row resolves to '
        + 'them, so their criteria/examples/technique chips never reach a student.');
    unreachable.forEach((c) => {
        // Name the thief, so the fix is one line rather than an investigation.
        let thief = null;
        outer:
        for (const a of Object.values(ARCH)) {
            for (const sec of a.sections) {
                for (const cr of sec.criteria.filter(isAskable)) {
                    const hay = (cr.label || '') + ' — ' + (cr.prompt || '');
                    if (!c.m.test(hay)) continue;
                    const w = matchConcept(cr);
                    if (w && w.id !== c.id) { thief = { id: w.id, label: cr.label }; break outer; }
                }
            }
        }
        console.error("     '" + c.id + "' loses to '" + (thief ? thief.id : '?') + "'"
            + (thief ? '  e.g. "' + thief.label + '"' : '') + "  — give it `pri: 1`.");
    });
} else {
    ok('every one of the ' + MAP.CONCEPTS.length + ' concepts wins at least one beat row');
}

// ── 5c. EVERY CONCEPT CARRIES A VALENCE (v7.20.374) ──────────────────────────────────────────
// The dot is derived at render from `val`, so a concept without one renders no dot at all — an
// invisible hole in the very rhythm the feature exists to show (Neil: "that's part of how you
// create tension"). A new concept must declare its direction, and cannot inherit a default.
const VALID_VAL = ['pos', 'neg', 'neu'];
const noVal = MAP.CONCEPTS.filter(c => !VALID_VAL.includes(c.val));
if (noVal.length) {
    bad(noVal.length + " concept(s) have no valid `val` (one of " + VALID_VAL.join('/') + "): "
        + noVal.map(c => c.id).join(', ') + ' — each would render no dot, leaving a gap in the rhythm.');
} else {
    const tally = VALID_VAL.map(v => MAP.CONCEPTS.filter(c => c.val === v).length);
    ok('all ' + MAP.CONCEPTS.length + ' concepts carry a valence (' + tally[1] + ' negative · '
        + tally[0] + ' positive · ' + tally[2] + ' neutral)');
}
// A `valBy` override keyed on an archetype that does not exist is a silent no-op.
MAP.CONCEPTS.forEach((c) => {
    Object.keys(c.valBy || {}).forEach((k) => {
        if (!ARCH[k]) bad("concept '" + c.id + "' has a valBy override for '" + k + "', which is not "
            + 'one of the eight plot structures — it would never apply.');
        if (!VALID_VAL.includes(c.valBy[k])) bad("concept '" + c.id + "' valBy." + k + " is '"
            + c.valBy[k] + "', not one of " + VALID_VAL.join('/') + '.');
    });
});

// ── 5e. RUNG 1 MUST HAVE THREE EXAMPLES TO GIVE (v7.20.376, #118) ────────────────────────────
// Help-ladder rung 1 (WML CLAUDE.md §4c.9) promises "2–3 further worked examples". Since
// v7.20.373 the [More examples] chip retires once its pool is spent, so a concept carrying ONE
// spare fires once and disappears — the rung technically works and pedagogically does not.
// Neil authored to three across all 70 concepts; this stops the pool being quietly thinned again.
// Duplicates count as a defect, not as depth: the #117 bug was three byte-identical bubbles.
const thinPool = MAP.CONCEPTS.filter(c => (c.more || []).length < 3);
const dupPool = MAP.CONCEPTS.filter(c => new Set(c.more || []).size !== (c.more || []).length);
if (thinPool.length || dupPool.length) {
    if (thinPool.length) {
        bad(thinPool.length + ' concept(s) carry fewer than 3 extra examples, so [More examples] '
            + 'retires early on their beats (#118):\n     '
            + thinPool.map(c => c.id + ' has ' + (c.more || []).length).join('\n     '));
    }
    if (dupPool.length) {
        bad(dupPool.length + ' concept(s) repeat an example — a repeat is the #117 defect, not a third example: '
            + dupPool.map(c => c.id).join(', '));
    }
} else {
    ok('all ' + MAP.CONCEPTS.length + ' concepts carry 3 distinct extra examples for rung 1');
}

// ── 5d. AN ENDING DEVICE MAY NOT BE OFFERED BEFORE THE FINAL STAGES (v7.20.376, #124) ────────
// Neil, live on staging: "I'm literally on the fifth beat and it's recommending Cyclical
// Structure… when I click on it, it gives examples from the END of a text." The mapping was
// DEFENSIBLE ON CONCEPT (the opening image really is mirrored by the final one) and WRONG ON
// MOMENT: the card teaches the END of a device to a student writing its BEGINNING.
//
// This is a POSITION rule, not a remap. Some techniques only exist as a PAYOFF — they cannot be
// demonstrated until the story has somewhere to close back to — so offering them in Stage I is
// help the student cannot act on. Note what this deliberately does NOT flag: a technique that
// merely spans early and late (Symbolism I→VI, Theme I→VI, Hamartia I→V) is correct — those are
// established early and paid off later, which is the point of them.
//
// ⚠️ Stage index is derived from the REAL templates (which section the beat sits in), not from
// where the concept happens to appear in the source file — a check that read the map's own layout
// would be asserting about itself rather than about what a student is offered.
// v7.20.378 (#131) — GENERALISED TO BOTH ENDS. Neil found the mirror case on beat 7 of Stage I:
// `Ir` In Medias Res was offered on "limited awareness", but In Medias Res describes how a story
// STARTS, so seven beats in there is nothing left to decide. An ending device offered at the
// start and an opening device offered past the start are ONE defect with two signs, so the rule
// is now positional in both directions rather than a list of ending devices.
const ENDING_DEVICES = { Cy: 'Cyclical Structure', Zi: 'Zoom-In / Zoom-Out Ending', Rn: 'Resolved Ending', De: 'Denouement' };
const OPENING_DEVICES = { Ir: 'In Medias Res' };
// DERIVED, not hardcoded: whichever concept wins the FIRST askable row of Stage I, in each of the
// eight templates. If a template ever opens on a different beat, this follows it automatically.
const openingConceptIds = new Set();
Object.values(ARCH).forEach((a) => {
    const first = (a.sections[0].criteria || []).filter(isAskable)[0];
    const k = first && matchConcept(first);
    if (k) openingConceptIds.add(k.id);
});
const EARLIEST_ENDING_STAGE = 4;   // 0-based: Stage V. Anything earlier has no ending to pay off.
const misplaced = [];
MAP.CONCEPTS.forEach((c) => {
    const stages = conceptStageIdx.get(c.id);
    if (!stages || !stages.size) return;            // unreachable concepts are 5b's job, not this one
    const earliest = Math.min(...stages);
    (c.tech || []).forEach((t) => {
        if (ENDING_DEVICES[t.s] && earliest < EARLIEST_ENDING_STAGE) {
            misplaced.push("'" + c.id + "' (asked in stage " + (earliest + 1) + ') offers '
                + t.s + ' ' + ENDING_DEVICES[t.s] + ' — an ENDING device, with no ending to pay off yet');
        }
        // An opening device is only actionable on the story's OPENING beat. `openIdx` is the
        // first askable row of Stage I across the templates, so this is derived, not hardcoded.
        if (OPENING_DEVICES[t.s] && !openingConceptIds.has(c.id)) {
            misplaced.push("'" + c.id + "' offers " + t.s + ' ' + OPENING_DEVICES[t.s]
                + " — an OPENING device, but this is not the story's opening beat ("
                + [...openingConceptIds].join('/') + ' is)');
        }
    });
});
if (misplaced.length) {
    bad(misplaced.length + ' technique(s) offered at a point in the arc where the student cannot act '
        + 'on them — the card would teach the wrong end of the device (#124/#131):\n     '
        + misplaced.join('\n     ')
        + '\n     Fix: move the chip to the beat where the device is a LIVE decision, and offer this '
        + 'beat a technique it can act on now. Do not widen these lists to make it pass.');
} else {
    ok('no ending device (' + Object.keys(ENDING_DEVICES).join(', ') + ') before stage '
        + (EARLIEST_ENDING_STAGE + 1) + ', and no opening device (' + Object.keys(OPENING_DEVICES).join(', ')
        + ') off the opening beat');
}

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

// ── ⭐⭐ v7.20.406 (FIXLIST #201) — BEAT EXAMPLES ARE REACHABLE FROM THE DOCUMENT ────────────
// Neil, revising his outline: *"it's quite a long journey to find the examples again… what if we
// were to have a button there for the examples?"* — with the sharp follow-up *"if it pops up in
// the chat, will that mess up the order of the messages?"*, which is the v7.20.344/.345 fossil
// defect he correctly predicted. So the contract has THREE parts and each is asserted:
//   1. the row button EXISTS and resolves its beat through the ONE canonical matcher;
//   2. it opens the RAIL PANEL, never the chat — nothing may push a bubble into history;
//   3. PM LAW (the v7.19.866 freeze class): it is built into the NodeView's own read-only
//      `criteriaEl`, never appended to the `.swml-outline-row` wrapper from outside.
{
    const NV = assessSrc.slice(assessSrc.indexOf('const OutlineRow = Node.create({'));
    const nvBody = NV.slice(0, NV.indexOf('\n        });'));

    if (!/swml-outline-eg-btn/.test(nvBody)) {
        bad('the per-beat Examples button is gone from the OutlineRow NodeView — revising a beat means '
            + 'scrolling the whole chat back for its examples again (#201).');
    } else {
        ok('the per-beat Examples button is rendered by the OutlineRow NodeView');
    }
    if (!/const _beatConcept = _cw6ConceptFor\(/.test(nvBody)) {
        bad('the Examples button no longer resolves its concept through _cw6ConceptFor — a second '
            + 'matcher means a beat can show one concept in the chat and another in the panel (CLAUDE.md #7).');
    } else {
        ok('the row button and the walk share ONE concept matcher');
    }
    // PM LAW. The button must be appended to criteriaEl (contentEditable=false, inside the
    // NodeView's own render); appending it to `dom` is a foreign mutation on the NodeView wrapper
    // and that is the compounding-remount freeze.
    if (/dom\.appendChild\(egBtn\)/.test(nvBody) || !/criteriaEl\.appendChild\(egBtn\)/.test(nvBody)) {
        bad('the Examples button is not appended to criteriaEl — a write onto the NodeView wrapper is the '
            + 'v7.19.866 DOMObserver-flush freeze class.');
    } else {
        ok('the Examples button is built into the row’s read-only column (PM-safe by construction)');
    }
    // It must open the PANEL. If this ever routes through a walk bubble, the transcript can
    // reorder — the exact thing Neil asked about.
    if (!/_openBeatExamplesPanel\(_beatConcept\)/.test(nvBody)) {
        bad('the Examples button does not open the rail panel — if it serves into the chat instead, a '
            + 'stored re-serve replays out of order for ever (the .344/.345 defect).');
    } else {
        ok('the Examples button opens the rail panel, so it cannot touch the transcript');
    }
    if (/aiBubble|canvasChatHistory|recordTurn/.test(nvBody.slice(nvBody.indexOf('swml-outline-eg-btn')))) {
        bad('the Examples button path touches the chat transcript — it must never write a turn.');
    }
    // And the panel mode it opens has to exist, with a loader.
    if (!/examples:\s*\{\s*title: 'Beat examples'/.test(assessSrc) || !/_cw6BeatHelpHTML\(_wpBeatConcept\)/.test(assessSrc)) {
        bad('the "examples" rail-panel mode or its loader is missing — the button would open an empty shell.');
    } else {
        ok('the Beat examples panel mode is registered and loads the beat’s own content');
    }
    // Every concept the button can surface must actually HAVE something to show (it renders
    // criteria + examples + technique cards; a concept with none would open a blank panel).
    const thin = MAP.CONCEPTS.filter(c => !(c.crit || []).length && !c.ex && !(c.more || []).length);
    if (thin.length) {
        bad(thin.length + ' concept(s) would open an EMPTY examples panel: ' + thin.map(c => c.id).join(', '));
    } else {
        ok('all ' + MAP.CONCEPTS.length + ' concepts have criteria/examples for the panel to show');
    }
}

if (fail) { console.error('\ncw6-outline-harness FAILED'); process.exit(1); }
console.log('✅ cw6-outline-harness passed.');
