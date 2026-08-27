/**
 * Scene Selection — partition maths. Ported 1:1 from the Neil-approved prototype
 * (research/scene-selection-prototype-APPROVED-2026-08-10.html); the prototype is the
 * interaction spec (root CLAUDE.md §13) — do not "improve" the semantics here.
 *
 * THE MODEL (FIXLIST #204 addendum 6): beats are story-ordered and the 7 scene elements
 * are fixed-ordered, so a valid shaping is exactly a PARTITION of the contiguous run into
 * consecutive chunks, one per element, in order. Disorder is impossible BY CONSTRUCTION.
 *   cuts[i] = how many consecutive run beats element i takes
 *             (0 = the element lives on an added-in moment, null = not yet decided)
 *
 * INVARIANT (addendum 13, harness-enforced): once elements 1–6 are settled the Denouement
 * takes the remainder automatically — a completed partition ALWAYS sums to the run; no tap
 * can strand a tail of beats outside the partition.
 *
 * ONE boundary-maths function (applyBeatMove) serves guided shaping, refine drag, AND the
 * edge-beat arrows — the arrows are the complete legal single-beat move set under
 * contiguity (addendum 14), so all three surfaces stay in exact agreement.
 */
'use strict';

const ELEMENT_COUNT = 7;

/** Fresh cuts array — nothing decided. */
function freshCuts() { return new Array(ELEMENT_COUNT).fill(null); }

/** chunkRanges: cuts -> [{start, end, pending}] in element order. `end` exclusive. */
function chunkRanges(cuts) {
    let pos = 0;
    return cuts.map((c) => {
        if (c == null) return { start: pos, end: null, pending: true };
        const r = { start: pos, end: pos + c, pending: false };
        pos += c;
        return r;
    });
}

/** Index of the first undecided element, or -1 when the partition is complete. */
function firstPending(cuts) { return cuts.findIndex((c) => c == null); }

/**
 * ⭐ The last element is AUTOMATIC (addendum 13): the moment elements 1–6 are settled,
 * the remainder flows into the Denouement — no ask. Mutates and returns cuts.
 */
function normalizeCuts(cuts, runLength) {
    const ask = cuts.findIndex((c) => c == null);
    if (ask === ELEMENT_COUNT - 1 || ask === -1) {
        let used = 0;
        for (let i = 0; i < ELEMENT_COUNT - 1; i++) used += cuts[i];
        cuts[ELEMENT_COUNT - 1] = Math.max(0, runLength - used);
    }
    return cuts;
}

/**
 * Run-selection tap semantics (phase 2): tap first beat, tap last — the stretch between
 * comes automatically; ends trim; outside widens. Returns {runStart, runEnd, hint}.
 */
function applyTap(runStart, runEnd, i) {
    if (runStart == null) return { runStart: i, runEnd: i, hint: null };
    if (i < runStart) return { runStart: i, runEnd, hint: null };            // widen backward
    if (i > runEnd) return { runStart, runEnd: i, hint: null };              // widen forward
    if (runStart === runEnd && i === runStart) return { runStart: null, runEnd: null, hint: null };
    if (i === runStart) return { runStart: runStart + 1, runEnd, hint: null };   // trim the top
    if (i === runEnd) return { runStart, runEnd: runEnd - 1, hint: null };       // trim the bottom
    /* ⭐⭐ v7.20.574 (FIXLIST #454, Neil 2026-08-26). A tap INSIDE the run now makes that item the
       new LAST one, instead of being refused with a hint.
       His words, and he is describing the instinct exactly: "let's say I click four lines, let's
       say I only want three. What I was doing is I went back to click the third one and nothing
       was happening. I think that'll be the natural instinct… instead I have to click the last one
       to unselect it. So it does work, but I don't think it's working naturally."
       He is right. Shrinking a run by repeatedly un-picking its tail is an implementation detail
       leaking into the gesture; "this one is where it ends" is what a person means when they tap
       inside a highlighted stretch. The old branch refused and explained itself, which was polite
       and still wrong.
       ⚠️ SHARED, DELIBERATELY: this is Step 9 / Step 13 scene selection's tap as well as the
       Step 12 draft map's, so both now behave the same way. One gesture, one mental model —
       the alternative was two rules for the same-looking interaction (root §7: pick one, say so).
       Trimming from either END still works exactly as before, so nothing a student already knew
       has been taken away; this only adds the shorter route. */
    return { runStart, runEnd: i, hint: null };
}

/**
 * ⭐ THE one boundary-maths function. Moves run-beat g (index into the run) so it belongs
 * to `target` ({band: e} or {unshaped: true}); the beats between ride along so story order
 * cannot break. Mutates cuts. Ported verbatim from the approved prototype.
 *   band→band:      the beats between ride along (refine semantics);
 *   unshaped→band:  the band extends to swallow everything up to g (the miss-tap case);
 *   band→unshaped:  un-shape from g — that element keeps its earlier beats, later re-ask.
 */
function applyBeatMove(cuts, runLength, g, target) {
    const ranges = chunkRanges(cuts);
    const ask = firstPending(cuts);
    const settled = ask === -1 ? ELEMENT_COUNT : ask;
    const frontier = ask === -1 ? runLength : ranges[ask].start;
    let c = -1;
    for (let i = 0; i < settled; i++) if (g >= ranges[i].start && g < ranges[i].end) { c = i; break; }
    if (target.unshaped) {
        if (c === -1) return cuts;
        cuts[c] = g - ranges[c].start;
        for (let i = c + 1; i < ELEMENT_COUNT; i++) cuts[i] = null;
        return cuts;
    }
    const e = target.band;
    if (e == null || e >= settled) return cuts;
    const starts = [];
    for (let i = 0; i < settled; i++) starts[i] = ranges[i].start;
    let newFrontier = frontier;
    if (c === -1) {                                   // unshaped beat pulled up into band e
        for (let i = e + 1; i < settled; i++) starts[i] = g + 1;
        newFrontier = g + 1;
    } else if (e > c) { for (let i = c + 1; i <= e; i++) starts[i] = g; }
    else if (e < c) { for (let i = e + 1; i <= c; i++) starts[i] = g + 1; }
    else return cuts;
    for (let i = 0; i < settled; i++) cuts[i] = (i < settled - 1 ? starts[i + 1] : newFrontier) - starts[i];
    return cuts;
}

/** Which settled band run-index g sits in, or -1 (unshaped / partition incomplete there). */
function bandOf(cuts, g) {
    const ranges = chunkRanges(cuts);
    const ask = firstPending(cuts);
    const settled = ask === -1 ? ELEMENT_COUNT : ask;
    for (let i = 0; i < settled; i++) if (g >= ranges[i].start && g < ranges[i].end) return i;
    return -1;
}

/**
 * ⭐ Mismatch nudges (addenda 7+8): deterministic, zero API, per TYPE at-least-one-home —
 * one typed beat in its home element satisfies the type; extras elsewhere never nag.
 * `rules` = [{re, el}] derived from the archetype canon labels (bridge supplies them);
 * returns [{elId, items: [{beat, g}], satisfied}] for UNSATISFIED types only.
 */
function nudgeFindings(run, cuts, elements, rules, dismissed) {
    const ranges = chunkRanges(cuts);
    const groups = {};
    run.forEach((b, g) => {
        const rule = rules.find((r) => r.re.test(b.label));
        if (rule) (groups[rule.el] = groups[rule.el] || []).push({ beat: b, g });
    });
    const out = [];
    Object.keys(groups).forEach((elId) => {
        if (dismissed && dismissed.has('el:' + elId)) return;
        const wantIdx = elements.findIndex((e) => e.id === elId);
        if (wantIdx === -1) return;
        const home = ranges[wantIdx];
        const items = groups[elId];
        if (items.some((x) => !home.pending && x.g >= home.start && x.g < home.end)) return;
        out.push({ elId, wantIdx, items });
    });
    return out;
}

// CJS on purpose: bin/scene-island-harness.js require()s THIS file — the exact module the
// bundle ships — so the harness can never drift from production logic. esbuild interops CJS.
module.exports = { ELEMENT_COUNT, freshCuts, chunkRanges, firstPending, normalizeCuts, applyTap, applyBeatMove, bandOf, nudgeFindings };
