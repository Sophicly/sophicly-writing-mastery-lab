#!/usr/bin/env node
/* eslint-env node */
/**
 * examiner-ladder-harness.js — CW trials slice 2a (v7.20.546)
 *
 * Drives the REAL engine (frontend/wml-examiner-ladder.js) against the REAL generated mark
 * scheme (frontend/wml-markscheme-data.js — itself gated against the board's document by
 * bin/markscheme-gate.js). Nothing here re-implements the climb or the arithmetic: every
 * expected mark below is written out from AQA's own printed ranges, so the test disagrees with
 * the code by construction if the code invents a number.
 *
 * WHAT IT PROTECTS, in the order it would break:
 *   1. THE DIRECTION. The board prints levels top-down; the examiner climbs bottom-up. One
 *      stray sort and the walk runs the procedure backwards while looking perfectly healthy.
 *   2. THE STOP. A student who meets every criterion climbs; the first level they do NOT fully
 *      meet is where they are placed — and the climb must never re-ask a rung it has passed.
 *   3. THE ARITHMETIC. bottom/middle/top resolve to the board's own marks. A 3-mark band maps
 *      exactly; a 4-mark level rounds DOWN (Sophicly marks stricter than the examiner).
 *   4. THE BANDS. Upper/Lower is asked ONLY where the board prints it (AO5 yes, AO6 no) — a
 *      band step on AO6 would be an invented sub-band presented to a student as the board's.
 *   5. THE RESUME. Resuming lands on the exact rung/step the student was on, never the top.
 *   6. LIVENESS. Every reachable state names a next step — no state resolves to nothing.
 */
'use strict';
const path = require('path');

const SCHEMES = require(path.join(__dirname, '..', 'frontend', 'wml-markscheme-data.js'));
const L = require(path.join(__dirname, '..', 'frontend', 'wml-examiner-ladder.js'));

const AO5 = SCHEMES.aqa_lang1_q5_ao5;
const AO6 = SCHEMES.aqa_lang1_q5_ao6;

let fails = 0, checks = 0;
function ok(cond, msg) {
    checks++;
    if (cond) console.log('  ✓ ' + msg);
    else { fails++; console.log('  ❌ ' + msg); }
}
function eq(actual, expected, msg) {
    ok(actual === expected, msg + ' (got ' + JSON.stringify(actual) + ', expected ' + JSON.stringify(expected) + ')');
}

console.log('\nexaminer-ladder-harness — the climb, the stop, and the arithmetic\n');

// ── 1 · THE DIRECTION ───────────────────────────────────────────────────────
console.log('the climb runs bottom-up, as an examiner does:');
const r5 = L.rungs(AO5);
eq(r5.map(l => l.level).join(','), '1,2,3,4', 'AO5 rungs are ordered Level 1 first');
eq(L.rungs(AO6).map(l => l.level).join(','), '1,2,3,4', 'AO6 rungs are ordered Level 1 first');
eq(AO5.levels.map(l => l.level).join(','), '4,3,2,1',
    'the stored data is still the board’s top-down order — only the climb reverses it');

// ── 2 · THE STOP ────────────────────────────────────────────────────────────
console.log('\nthe stop — a student who meets L1 and L2 but not L3:');
let st = { levelIndex: 0, metAll: {} };
let step = L.next(AO5, st);
eq(step.step, 'climb', 'first question is a climb question');
eq(step.level.level, 1, '…and it is about Level 1');
ok(step.descriptors.length > 0, 'Level 1 arrives with its own descriptors (' + step.descriptors.length + ')');

st.metAll[1] = true;
step = L.next(AO5, Object.assign({}, st, { levelIndex: 0 }));
eq(step.level.level, 2, 'meeting Level 1 climbs to Level 2 without re-asking Level 1');

st.metAll[2] = true;
step = L.next(AO5, Object.assign({}, st, { levelIndex: 0 }));
eq(step.level.level, 3, 'meeting Level 2 climbs to Level 3');

st.metAll[3] = false;
step = L.next(AO5, Object.assign({}, st, { levelIndex: 0 }));
eq(step.step, 'which', 'NOT meeting Level 3 stops the climb and asks which criteria were met');
eq(step.level.level, 3, '…on Level 3, the level they stopped at');
ok(!step.descriptors.some(d => /assuredly matched/.test(d.text)),
    'the criteria offered are Level 3’s, not a higher level’s');

// ── 3 · THE BANDS ───────────────────────────────────────────────────────────
console.log('\nupper/lower is asked only where the board prints it:');
st.partial = [0, 1];
step = L.next(AO5, Object.assign({}, st, { levelIndex: 0 }));
eq(step.step, 'band', 'AO5 Level 3 asks Upper or Lower — AQA prints both');
eq(step.bands.map(b => b.name).join(' | '), 'Upper Level 3 | Lower Level 3', 'both bands offered, upper first');

let st6 = { levelIndex: 0, metAll: { 1: true, 2: true, 3: false }, partial: [0] };
let step6 = L.next(AO6, st6);
eq(step6.step, 'placement', 'AO6 skips straight to placement — the board prints no sub-bands there');
ok(!L.hasBands(L.rungs(AO6)[2]), 'AO6 Level 3 genuinely has no Upper/Lower to offer');

// ── 4 · THE ARITHMETIC, against AQA's own printed ranges ────────────────────
console.log('\nthe mark is the board’s own, derived — never typed by anyone:');
// AQA AO5: Upper L4 22–24 · Lower L4 19–21 · Upper L3 16–18 · Lower L3 13–15
eq(L.resolve(AO5, { levelNumber: 4, bandName: 'Upper Level 4', placement: 'top' }).mark, 24, 'top of Upper L4 = 24');
eq(L.resolve(AO5, { levelNumber: 4, bandName: 'Upper Level 4', placement: 'middle' }).mark, 23, 'middle of Upper L4 = 23');
eq(L.resolve(AO5, { levelNumber: 4, bandName: 'Upper Level 4', placement: 'bottom' }).mark, 22, 'bottom of Upper L4 = 22');
eq(L.resolve(AO5, { levelNumber: 4, bandName: 'Lower Level 4', placement: 'bottom' }).mark, 19, 'bottom of Lower L4 = 19');
eq(L.resolve(AO5, { levelNumber: 3, bandName: 'Upper Level 3', placement: 'middle' }).mark, 17, 'middle of Upper L3 = 17');
eq(L.resolve(AO5, { levelNumber: 3, bandName: 'Lower Level 3', placement: 'top' }).mark, 15, 'top of Lower L3 = 15');
eq(L.resolve(AO5, { levelNumber: 1, bandName: 'Lower Level 1', placement: 'bottom' }).mark, 1, 'bottom of Lower L1 = 1');
eq(L.resolve(AO5, { levelNumber: 4, bandName: 'Upper Level 4', placement: 'top' }).outOf, 24, 'AO5 is out of 24');

// AO6 levels: L4 13–16 · L3 9–12 · L2 5–8 · L1 1–4 — four marks, so the middle rounds DOWN.
eq(L.resolve(AO6, { levelNumber: 4, placement: 'top' }).mark, 16, 'top of AO6 L4 = 16');
eq(L.resolve(AO6, { levelNumber: 4, placement: 'middle' }).mark, 14, 'middle of AO6 L4 = 14 — rounds DOWN, stricter');
eq(L.resolve(AO6, { levelNumber: 4, placement: 'bottom' }).mark, 13, 'bottom of AO6 L4 = 13');
eq(L.resolve(AO6, { levelNumber: 1, placement: 'bottom' }).mark, 1, 'bottom of AO6 L1 = 1');
eq(L.resolve(AO6, { levelNumber: 4, placement: 'top' }).outOf, 16, 'AO6 is out of 16');

console.log('\nno mark can land outside the board’s range:');
let outOfRange = 0, marksChecked = 0;
[AO5, AO6].forEach(function (scheme) {
    L.rungs(scheme).forEach(function (level) {
        const bands = L.hasBands(level) ? L.bandsOf(level) : [null];
        bands.forEach(function (band) {
            L.PLACEMENTS.forEach(function (p) {
                const res = L.resolve(scheme, {
                    levelNumber: level.level, bandName: band ? band.name : null, placement: p,
                });
                marksChecked++;
                if (!res || res.mark < res.range.min || res.mark > res.range.max
                    || res.mark < 1 || res.mark > scheme.maxMarks) outOfRange++;
            });
        });
    });
});
eq(outOfRange, 0, 'every one of the ' + marksChecked + ' reachable verdicts lands inside its own range');

console.log('\nan invented band is refused:');
ok(L.resolve(AO5, { levelNumber: 4, bandName: 'Middle Level 4', placement: 'top' }) === null,
    'a band the board does not print resolves to nothing, rather than to a plausible number');
ok(L.markFor({ min: 13, max: 18 }, 'sideways') === null, 'an unknown placement yields no mark');

// ── 5 · THE RESUME ──────────────────────────────────────────────────────────
console.log('\nresume lands on the exact rung, never the top of the AO:');
const midClimb = { levelIndex: 0, metAll: { 1: true, 2: true } };
eq(L.resumeAt(AO5, midClimb).level.level, 3, 'a student two rungs up resumes on Level 3');
const midStop = { levelIndex: 0, metAll: { 1: true, 2: true, 3: false }, partial: [0, 2], bandName: 'Lower Level 3' };
eq(L.resumeAt(AO5, midStop).step, 'placement', 'a student mid-verdict resumes on the placement question');
eq(L.resumeAt(AO5, midStop).range.min, 13, '…with Lower Level 3’s range, not the whole level’s');

// ── 6 · LIVENESS — every reachable state names a next step ──────────────────
console.log('\nliveness — no reachable state leaves the student with nothing:');
let dead = 0, states = 0;
[AO5, AO6].forEach(function (scheme) {
    const rr = L.rungs(scheme);
    // every stop point, every band, every placement, plus the climbed-out case
    for (let stop = 0; stop <= rr.length; stop++) {
        const metAll = {};
        for (let k = 0; k < rr.length; k++) metAll[rr[k].level] = k < stop ? true : (k === stop ? false : undefined);
        const base = { levelIndex: 0, metAll: metAll };
        [undefined, [0]].forEach(function (partial) {
            [undefined, 'Upper Level 4', 'Lower Level 3'].forEach(function (bandName) {
                [undefined, 'top', 'middle', 'bottom'].forEach(function (placement) {
                    [undefined, 'because my paragraphs link'].forEach(function (reason) {
                        const s = Object.assign({}, base, {
                            partial: partial, bandName: bandName, placement: placement, reason: reason,
                        });
                        states++;
                        const nxt = L.next(scheme, s);
                        if (!nxt || !nxt.step || nxt.step === 'error') dead++;
                    });
                });
            });
        });
    }
});
eq(dead, 0, 'all ' + states + ' reachable states resolve to a step (§4d: never a blank screen)');

console.log('');
if (fails) {
    console.log('❌ examiner-ladder-harness FAILED (' + fails + ' of ' + checks + ').');
    process.exit(1);
}
console.log('✅ examiner-ladder-harness passed (' + checks + ' checks: bottom-up, stops where the');
console.log('   student stops, and every mark is AQA’s own number).');
