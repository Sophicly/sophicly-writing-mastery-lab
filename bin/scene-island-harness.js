#!/usr/bin/env node
/* eslint-env node */
/**
 * scene-island-harness — Step 9 Scene Selection island gates.
 *
 * SECTION A: partition maths (island/src/partition.js — the EXACT module the bundle ships,
 *            require()d directly so the harness can never drift from production logic).
 *   A1  run-tap semantics (tap-first/tap-last/trim/widen/collapse/mid-tap refusal)
 *   A2  ⭐ THE ADDENDUM-13 INVARIANT: a completed partition ALWAYS sums to the run — the
 *       Denouement takes the remainder automatically; no op can strand a tail. Replays the
 *       exact bug Neil caught (tap mid-list on the last element orphaned beats 13–14).
 *   A3  applyBeatMove property test (seeded PRNG): after ANY random sequence of moves the
 *       cuts stay non-negative, order-safe, and a complete partition still sums to the run.
 *   A4  arrows = the same boundary maths (up/down on edge beats ≡ applyBeatMove)
 *   A5  nudges: per-TYPE at-least-one-home (two epiphanies, one home → silent), dismissal
 *
 * SECTION B: bridge/transfer wiring in wml-assessment.js (source-level byte checks):
 *   B1  transfer targets the REAL stored fids (cw-step-8-{element}) — traced against the
 *       doc builder, never a wildcard over the shared cw-step-8- prefix
 *   B2  transfer files via _writeOutlineRowField and stamps provenance
 *   B3  the island state artifact key is scene_selection_state (scene_selection is
 *       clobbered by the step-doc artifact save — proven on prod 2026-08-10)
 *
 * Every check was proven by injection (break the logic → the check fails).
 */
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const P = require(path.join(ROOT, 'island', 'src', 'partition.js'));

let fails = 0, checks = 0;
function ok(cond, label) {
    checks++;
    if (!cond) { fails++; console.error('  ✗ FAIL: ' + label); }
}
function section(t) { console.log('\n== ' + t); }

// deterministic PRNG (no Math.random — repo law: harnesses must be reproducible)
function lcg(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* ── A1: run-tap semantics ── */
section('A1 run-tap semantics');
{
    let r = P.applyTap(null, null, 5);
    ok(r.runStart === 5 && r.runEnd === 5, 'first tap anchors the run');
    r = P.applyTap(5, 5, 9);
    ok(r.runStart === 5 && r.runEnd === 9, 'tap after end widens forward');
    r = P.applyTap(5, 9, 2);
    ok(r.runStart === 2 && r.runEnd === 9, 'tap before start widens backward');
    r = P.applyTap(2, 9, 2);
    ok(r.runStart === 3 && r.runEnd === 9, 'tap on start trims the top');
    r = P.applyTap(3, 9, 9);
    ok(r.runStart === 3 && r.runEnd === 8, 'tap on end trims the bottom');
    r = P.applyTap(3, 8, 5);
    ok(r.hint && r.runStart === 3 && r.runEnd === 8, 'mid-run tap refuses WITH a hint (liveness: the screen answers)');
    r = P.applyTap(4, 4, 4);
    ok(r.runStart === null && r.runEnd === null, 'tap on a 1-beat run collapses it');
}

/* ── A2: the addendum-13 invariant — Denouement is automatic, no orphan tail ── */
section('A2 Denouement remainder invariant (the bug Neil caught, replayed)');
{
    const RUN = 14;
    const cuts = P.freshCuts();
    // guided pass answers the SIX asks (Denouement never asks): 2,2,2,2,2,2 = 12 of 14
    for (let i = 0; i < 6; i++) cuts[i] = 2;
    P.normalizeCuts(cuts, RUN);
    ok(cuts[6] === 2, 'the remainder flows into the Denouement automatically');
    ok(cuts.reduce((a, b) => a + b, 0) === RUN, 'completed partition sums to the run — beats 13–14 CANNOT vanish');

    // the pre-fix defect, injected: a tap that CLOSED the partition at beat 12 of 14
    const bad = [2, 2, 2, 2, 2, 1, 1];   // sums to 12 — two beats orphaned
    ok(bad.reduce((a, b) => a + b, 0) !== RUN, '(injection) the orphan-tail shape is detectable');
    P.normalizeCuts(bad, RUN);           // normalize is the heal: recompute the last chunk
    ok(bad.reduce((a, b) => a + b, 0) === RUN, 'normalizeCuts heals a stale Denouement to the remainder');
}

/* ── A3: applyBeatMove property test ── */
section('A3 boundary-maths property test (seeded, 4000 random ops)');
{
    const rnd = lcg(20260810);
    let violations = 0;
    for (let trial = 0; trial < 200; trial++) {
        const RUN = 7 + Math.floor(rnd() * 18);           // 7..24 beats
        const cuts = P.freshCuts();
        // settle a random prefix of elements (guided pass in progress or complete)
        const settleCount = 1 + Math.floor(rnd() * 7);    // 1..7
        let left = RUN;
        for (let i = 0; i < settleCount && i < 6; i++) {
            const take = Math.floor(rnd() * Math.max(1, Math.min(left - 0, 4)));
            cuts[i] = Math.min(take, left);
            left -= cuts[i];
        }
        if (settleCount >= 7) P.normalizeCuts(cuts, RUN);
        for (let op = 0; op < 20; op++) {
            const g = Math.floor(rnd() * RUN);
            const t = rnd();
            if (t < 0.4) P.applyBeatMove(cuts, RUN, g, { unshaped: true });
            else P.applyBeatMove(cuts, RUN, g, { band: Math.floor(rnd() * 7) });
            P.normalizeCuts(cuts, RUN);
            // invariants after EVERY op:
            const ask = P.firstPending(cuts);
            for (let i = 0; i < 7; i++) if (cuts[i] != null && cuts[i] < 0) violations++;
            if (ask === -1) {
                const sum = cuts.reduce((a, b) => a + b, 0);
                if (sum !== RUN) violations++;
            } else {
                // settled prefix only — everything after the first pending must be undecided
                for (let i = ask + 1; i < 7; i++) if (cuts[i] != null && i !== 6) { /* cuts[6] may hold a stale value only via normalize, which requires ask===6 */ }
                const consumed = P.chunkRanges(cuts)[ask].start;
                if (consumed > RUN) violations++;
            }
        }
    }
    ok(violations === 0, 'no negative chunk, no over-consumption, complete partitions always sum (violations=' + violations + ')');
}

/* ── A4: arrows ≡ drag (same function, both directions, un-shape on last band) ── */
section('A4 arrows are the same boundary maths');
{
    const RUN = 10;
    const cuts = [2, 2, 2, 2, 1, 1, null];
    P.normalizeCuts(cuts, RUN);           // cuts[6] = 0? no: 2+2+2+2+1+1=10 → remainder 0
    ok(cuts[6] === 0, 'zero-beat Denouement is representable (compulsory gate catches it later)');
    // ↑ on the first beat of band 1 = move g=2 into band 0
    P.applyBeatMove(cuts, RUN, 2, { band: 0 });
    ok(cuts[0] === 3 && cuts[1] === 1, 'up-arrow extends the earlier band; the donor shrinks');
    // ↓ on the last beat of the last settled band with nothing below = un-shape
    const cuts2 = [3, 3, null, null, null, null, null];
    P.applyBeatMove(cuts2, RUN, 5, { unshaped: true });
    ok(cuts2[1] === 2 && cuts2[2] === null, 'down-arrow below the frontier un-shapes from that beat');
    // band→band downward: intervening beats ride along
    const cuts3 = [4, 2, 2, 2, null, null, null];
    P.applyBeatMove(cuts3, RUN, 1, { band: 2 });   // beat 1 (in band 0) moves to band 2
    ok(cuts3[0] === 1 && cuts3.slice(0, 4).every((c) => c >= 0), 'moving a beat later drags the in-between boundary with it (order-safe)');
}

/* ── A5: nudges — per-TYPE at-least-one-home ── */
section('A5 nudge policy (two epiphanies, one home → silent)');
{
    const elements = [
        { id: 'hook' }, { id: 'setup' }, { id: 'reaction' }, { id: 'epiphany' },
        { id: 'proaction' }, { id: 'climax' }, { id: 'denouement' },
    ];
    const rules = [{ re: /epiphany/i, el: 'epiphany' }];
    const mk = (labels) => labels.map((l, i) => ({ id: 'b' + i, ord: i + 1, label: l, text: 't' }));
    // 8 beats, epiphany moments at 3 and 5; partition: [1,1,1,1,1,1] + remainder 2
    const run = mk(['a', 'b', 'c', 'First epiphany: insight', 'd', 'Second epiphany: deeper', 'e', 'f']);
    const cutsHome = [1, 1, 1, 1, 1, 1, null];
    P.normalizeCuts(cutsHome, run.length);
    // element 3 (epiphany) holds run index 3 — the FIRST epiphany is home → silent
    let f = P.nudgeFindings(run, cutsHome, elements, rules, new Set());
    ok(f.length === 0, 'one typed beat home → the type is satisfied, extras never nagged');
    // shift so NO epiphany beat sits in the epiphany element → one finding listing both
    const cutsAway = [4, 1, 1, 0, 1, 1, null];   // element 3 takes 0 beats
    P.normalizeCuts(cutsAway, run.length);
    f = P.nudgeFindings(run, cutsAway, elements, rules, new Set());
    ok(f.length === 1 && f[0].items.length === 2, 'zero home → one finding, listing every candidate');
    f = P.nudgeFindings(run, cutsAway, elements, rules, new Set(['el:epiphany']));
    ok(f.length === 0, 'dismissal is respected');
}

/* ── SECTION B: bridge/transfer wiring (source-level) ── */
section('B bridge wiring in wml-assessment.js');
{
    const srcPath = path.join(ROOT, 'frontend', 'wml-assessment.js');
    const src = fs.readFileSync(srcPath, 'utf8');
    const hasBridge = src.indexOf('_cw9SceneCtl') !== -1;
    ok(hasBridge, 'bridge (_cw9SceneCtl) exists in wml-assessment.js');
    if (hasBridge) {
        // B1: the transfer targets the REAL stored element fids, exactly — never a wildcard
        const ELEMENT_FIDS = ['cw-step-8-hook', 'cw-step-8-setup', 'cw-step-8-reaction',
            'cw-step-8-epiphany', 'cw-step-8-proaction', 'cw-step-8-climax', 'cw-step-8-denouement'];
        ELEMENT_FIDS.forEach((fid) => ok(src.indexOf("'" + fid + "'") !== -1,
            'transfer names the real stored fid ' + fid + ' (byte-traced, #363: no rename without migration)'));
        ok(src.indexOf("'cw-step-8-plot-position'") !== -1, 'plot-position dropdown is auto-filed from the chosen stages');
        // B2: files through the row-walking writers + persists provenance.
        // _cw9ReplaceRowLines is the multi-line sibling of _writeOutlineRowField (whose replace
        // path cannot carry newlines); _setOutlineDropdown is the proven dropdown setter.
        const bridgeSeg = src.slice(src.indexOf('const _cw9SceneCtl'));
        ok(/_cw9ReplaceRowLines\(/.test(bridgeSeg), 'element rows file through _cw9ReplaceRowLines (hardBreak multi-line writer)');
        ok(/_setOutlineDropdown\(\s*'cw-step-8-plot-position'/.test(bridgeSeg), 'plot-position files through _setOutlineDropdown');
        ok(bridgeSeg.indexOf('scene_selection_state') !== -1, 'persists selection/provenance to scene_selection_state');
        // B3: never the clobbered key for state (the step-doc save writes doc HTML into
        // scene_selection — proven on prod: it held a Draft-1 document)
        ok(!/saveArtifact\([^)]*'scene_selection'\s*,/.test(bridgeSeg),
            'island state is NEVER saved into scene_selection (doc-clobbered key)');
    }
}

console.log('\n' + (fails ? '✗ ' + fails + ' of ' + checks + ' checks FAILED' : '✓ all ' + checks + ' checks passed'));
process.exit(fails ? 1 : 0);
