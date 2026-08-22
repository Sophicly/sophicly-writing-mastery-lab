#!/usr/bin/env node
/* eslint-env node */
/**
 * examiner-ladder-sim-harness.js — BEHAVIOURAL gate for the examiner-ladder walk
 * (v7.20.547, CW trials slice 2b; #407/#221, PEDAGOGY §33).
 *
 * Slices the REAL `_examinerLadderCtl` out of wml-assessment.js and drives it on the shared rig
 * (walk-sim-lib), with the REAL engine and the REAL generated mark scheme underneath it — never
 * re-typed copies (§14c: a check that duplicates its subject tests its own memory). Because `ok`
 * is passed to makeWorld, every say()/tap() is automatically liveness-checked and the opt-out
 * does not exist (§4d).
 *
 * WHAT THIS GATE IS FOR:
 *  1. ⭐⭐ THE CLIMB IS BOTTOM-UP. The first thing a student sees is Level 1, not Level 4. This is
 *     the whole of #407 — a top-down pick lets them flatter themselves in one tap.
 *  2. ⭐ IT STOPS WHERE THEY STOP, and never re-asks a rung it has passed.
 *  3. ⭐ THE SHORT-CIRCUIT. A student who stops at Level 2 never reads Levels 3 and 4 in that
 *     pass — Neil's own worry was "it might take them a long time".
 *  4. ⭐ THE PER-CRITERION PASS IS SERIAL (root §18): one criterion on screen, one verdict, and a
 *     "no" costs exactly one tap.
 *  5. ⭐ THE MARK IS THE BOARD'S OWN NUMBER, arrived at through the real taps — not asserted
 *     against the engine (that is examiner-ladder-harness's job) but read off the screen and the
 *     document, which is where a student and a tutor actually meet it.
 *  6. ⭐ THE REASON IS BANKED VERBATIM, on a `rewrite` cycle (§4c.6: a self-contained artefact —
 *     a re-answer replaces, it must never stitch two drafts together).
 *  7. ⭐ RESUME LANDS ON THE EXACT ITEM — the criterion they were on, not the top of the AO
 *     (§4c.8b) — including mid-way through the serial per-criterion pass.
 *  8. ⭐ ZERO API. The entire walk spends no calls; the closing reflection belongs to the host.
 *  9. ⭐ EVERY DESCRIPTOR ON SCREEN IS VERBATIM FROM THE GENERATED DATASET — a walk that reworded
 *     the board would pass every structural check while lying to the student.
 * 10. ⭐ A MISSING MARK SCHEME FAILS LOUD TO THE STUDENT, never to a blank screen (§4d).
 *
 * Usage: node bin/examiner-ladder-sim-harness.js
 */
'use strict';

const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const SCHEMES = require(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'));
const ENGINE = require(path.join(ROOT, 'frontend', 'wml-examiner-ladder.js'));

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── slice the shipped controller ─────────────────────────────────────────────────────────────
const ctlIdx = SRC.indexOf('const _examinerLadderCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _examinerLadderCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

const FIDS = {
    level: 'ladder-ao5-level',
    band: 'ladder-ao5-band',
    met: 'ladder-ao5-met',
    reason: 'ladder-ao5-reason',
    mark: 'ladder-ao5-mark',
};
const ALL_FIDS = Object.keys(FIDS).map(function (k) { return FIDS[k]; });

function world(opts) {
    opts = opts || {};
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_1',
        fids: ALL_FIDS,
        ok: ok,
        extraDeps: {
            window: {
                WML_MARK_SCHEMES: SCHEMES,
                WML_EXAMINER_LADDER: ENGINE,
            },
        },
    }, opts));
    return w;
}

function openLadder(w, over) {
    return w.ctl.open(Object.assign({
        schemeKey: 'aqa_lang1_q5_ao5',
        aoName: 'AO5 Content and Organisation',
        walkId: 'trial1_ao5',
        fids: FIDS,
        onDone: function (res) { w.__done = res; },
    }, over || {}));
}

/** Walk the paced orientation to the first real ask. */
async function toFirstAsk(w) {
    for (let i = 0; i < 8; i++) {
        await settle();
        const chips = w.chips();
        const cont = chips.filter(function (c) { return /Continue/.test(c.textContent || ''); })[0];
        if (!cont) break;
        w.tap(cont);
    }
    await settle();
}
function chipNamed(w, re) {
    return w.chips().filter(function (c) { return re.test(c.textContent || ''); })[0] || null;
}
function lastBubble(w) { return w.bubbles[w.bubbles.length - 1] || ''; }
function allText(w) { return w.bubbles.join('\n'); }

async function main() {
    console.log('\nEXAMINER LADDER — behavioural sim (real _examinerLadderCtl, real mark scheme)\n');

    // ── 1 · THE CLIMB STARTS AT THE BOTTOM ───────────────────────────────────────────────
    {
        const w = world();
        openLadder(w);
        await toFirstAsk(w);
        const text = lastBubble(w);
        ok(/Level 1/.test(text), '1 · the first level a student meets is Level 1');
        ok(!/Level 4/.test(text), '1 · Level 4 is not on that screen — no top-down flattering pick');
        ok(/1–6 marks/.test(text) || /1–5 marks/.test(text),
            '1 · Level 1 arrives with its own mark range from the board');
        ok(!!chipNamed(w, /all of them/i), '1 · and the question is answerable — a chip is on screen');
        // every descriptor shown is verbatim from the dataset
        const l1 = ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao5)[0];
        const shown = ENGINE.climbDescriptors(l1);
        let verbatim = 0;
        shown.forEach(function (d) { if (text.indexOf(d.text) >= 0) verbatim++; });
        ok(verbatim === shown.length,
            '9 · all ' + shown.length + ' of Level 1’s criteria appear word for word (' + verbatim + ' matched)');
    }

    // ── 2/3 · IT CLIMBS, IT STOPS, AND IT SHORT-CIRCUITS ─────────────────────────────────
    {
        const w = world();
        openLadder(w);
        await toFirstAsk(w);
        w.tap(chipNamed(w, /all of them/i));          // met Level 1
        await settle();
        ok(/Level 2/.test(lastBubble(w)), '2 · meeting Level 1 climbs to Level 2');
        ok(!/Level 1 —/.test(lastBubble(w)), '2 · …and Level 1 is not re-asked');
        w.tap(chipNamed(w, /^Not all of them$/));      // stopped at Level 2
        await settle();
        const t = lastBubble(w);
        ok(/stopped at \*\*Level 2\*\*/.test(t) || /Level 2/.test(t), '2 · not meeting Level 2 stops the climb there');
        ok(allText(w).indexOf('Level 3 —') === -1 && allText(w).indexOf('Level 4 —') === -1,
            '3 · Levels 3 and 4 were never served — the ladder short-circuits');
        ok(/\(1 of \d+\)/.test(t), '4 · the per-criterion pass is SERIAL — one criterion, numbered');
        const metChip = chipNamed(w, /I met this one/);
        const notChip = chipNamed(w, /Not this one/);
        ok(!!metChip && !!notChip, '4 · …and a "no" costs exactly one tap');
    }

    // ── 4/5/6 · A WHOLE HONEST RUN, ENDING IN THE BOARD'S OWN NUMBER ─────────────────────
    {
        const w = world();
        openLadder(w);
        await toFirstAsk(w);
        w.tap(chipNamed(w, /all of them/i));                 // L1 met
        await settle();
        w.tap(chipNamed(w, /all of them/i));                 // L2 met
        await settle();
        ok(/Level 3/.test(lastBubble(w)), '2 · two climbs land on Level 3');
        w.tap(chipNamed(w, /^Not all of them$/));            // stop at L3
        await settle();

        // serial pass: say yes to the first, no to the rest
        let guard = 0, answered = 0;
        while (chipNamed(w, /I met this one|Not this one/) && guard++ < 40) {
            const c = answered === 0 ? chipNamed(w, /I met this one/) : chipNamed(w, /Not this one/);
            w.tap(c); answered++;
            await settle();
        }
        ok(answered >= 3, '4 · every criterion of the stopped level was asked one at a time (' + answered + ')');
        ok(w.rows.get(FIDS.met) && /✓/.test(w.rows.get(FIDS.met)),
            '4 · what they DID meet is banked into the document, so a reload cannot re-ask it');

        // the band step — AQA prints Upper/Lower for AO5
        const upper = chipNamed(w, /Upper Level 3/);
        const lower = chipNamed(w, /Lower Level 3/);
        ok(!!upper && !!lower, '5 · AQA’s own Upper/Lower split is offered for AO5 Level 3');
        ok(/16–18 marks/.test(lastBubble(w)) && /13–15 marks/.test(lastBubble(w)),
            '5 · …with the board’s own ranges beside each half');
        w.tap(lower);
        await settle();
        ok(w.rows.get(FIDS.band) === 'Lower Level 3', '5 · the band is banked into the document');

        // placement
        ok(/13–15 marks/.test(lastBubble(w)), '5 · the placement question shows the band’s range, not the level’s');
        w.tap(chipNamed(w, /^Top of this level$/));
        await settle();
        ok(w.rows.get(FIDS.mark) === '15 / 24',
            '5 · top of Lower Level 3 = 15/24 — the board’s own number, on screen and in the document (got '
            + JSON.stringify(w.rows.get(FIDS.mark)) + ')');
        ok(/Level 3/.test(w.rows.get(FIDS.level) || '') && /Lower Level 3/.test(w.rows.get(FIDS.level) || ''),
            '5 · the verdict row records level, band and placement together');

        // the reason — typed, banked verbatim, rewrite cycle
        ok(/say why/i.test(lastBubble(w)), '6 · the walk then asks for the reason in their own words');
        w.say('My paragraphs link but my vocabulary stays plain.');
        await settle();
        ok(w.rows.get(FIDS.reason) === 'My paragraphs link but my vocabulary stays plain.',
            '6 · the reason is banked VERBATIM (got ' + JSON.stringify(w.rows.get(FIDS.reason)) + ')');

        // rewrite, not accumulate
        const changeChip = chipNamed(w, /Change my answer/);
        ok(!!changeChip, '6 · the walk ends on a live screen with a way back in (§4d)');
        ok(!!w.__done && w.__done.mark === 15,
            '5 · the host is handed the resolved mark (' + (w.__done && w.__done.mark) + ')');

        ok(w.sends.length === 0, '8 · ZERO API calls for the whole walk (' + w.sends.length + ' sends)');
    }

    // ── 6b · A RE-ANSWERED REASON REPLACES, IT NEVER STITCHES ────────────────────────────
    {
        const w = world();
        openLadder(w);
        await toFirstAsk(w);
        w.tap(chipNamed(w, /^Not all of them$/));      // stop at Level 1 immediately
        await settle();
        let guard = 0;
        while (chipNamed(w, /I met this one|Not this one/) && guard++ < 40) {
            w.tap(chipNamed(w, /Not this one/)); await settle();
        }
        const band = chipNamed(w, /Lower Level 1/);
        if (band) { w.tap(band); await settle(); }
        w.tap(chipNamed(w, /^Bottom of this level$/));
        await settle();
        w.say('First go.');
        await settle();
        w.tap(chipNamed(w, /Change my answer/));
        await settle();
        ok(/Level 1/.test(lastBubble(w)), '6b · changing the answer restarts the climb at the bottom, as an examiner would');

        // ⭐ THE .289 STITCH. A reason is a self-contained artefact, so a SECOND pass must
        // REPLACE it — an `accumulate` cycle here files both drafts into one box, which is
        // exactly the defect Neil caught live on the Chosen Logline row (§4c.6). Run the whole
        // walk a second time and read the row.
        w.tap(chipNamed(w, /^Not all of them$/));
        await settle();
        guard = 0;
        while (chipNamed(w, /I met this one|Not this one/) && guard++ < 40) {
            w.tap(chipNamed(w, /Not this one/)); await settle();
        }
        const band2 = chipNamed(w, /Lower Level 1/);
        if (band2) { w.tap(band2); await settle(); }
        w.tap(chipNamed(w, /^Bottom of this level$/));
        await settle();
        w.say('Second go, and it replaces the first.');
        await settle();
        const reason = w.rows.get(FIDS.reason) || '';
        ok(reason === 'Second go, and it replaces the first.',
            '6b · the re-answered reason REPLACES the first — the box holds one answer, not two '
            + '(got ' + JSON.stringify(reason) + ')');
        ok(reason.indexOf('First go.') === -1,
            '6b · …and the first draft is genuinely gone, not stitched underneath it (§4c.6)');
    }

    // ── 7 · RESUME LANDS ON THE EXACT CRITERION ──────────────────────────────────────────
    {
        const ls = new Map();   // the rig models localStorage as a Map
        const w = world({ ls: ls });
        openLadder(w);
        await toFirstAsk(w);
        w.tap(chipNamed(w, /all of them/i));                 // L1 met
        await settle();
        w.tap(chipNamed(w, /^Not all of them$/));            // stop at L2
        await settle();
        w.tap(chipNamed(w, /Not this one/));                 // answered criterion 1
        await settle();
        const before = lastBubble(w);
        const m = before.match(/\((\d+) of (\d+)\)/);
        ok(!!m && m[1] === '2', '7 · mid-pass, the student is on criterion 2 (' + (m && m[1]) + ')');

        // reload: a fresh world sharing the same localStorage and document rows
        const prefill = {};
        w.rows.forEach(function (v, k) { if (v) prefill[k] = v; });
        const w2 = world({ ls: ls, prefill: prefill });
        const resumed = w2.ctl.tryResume();
        ok(resumed === true, '7 · tryResume claims the turn when a walk is genuinely in progress');
        await settle(); await settle();
        const after = allText(w2);
        const m2 = after.match(/\((\d+) of (\d+)\)/);
        ok(!!m2 && m2[1] === '2',
            '7 · …and lands on criterion 2, not the top of the AO (got ' + (m2 && m2[1]) + ')');
        ok(after.indexOf('Level 1') === -1 || after.indexOf('Level 2') >= 0,
            '7 · the resumed screen is about Level 2, the level they stopped at');
    }

    // ── 7b · A PRISTINE SESSION IS NOT A RESUME ──────────────────────────────────────────
    {
        const w = world();
        ok(w.ctl.tryResume() === false,
            '7b · with no sidecar, tryResume declines — it never goes active with nothing to serve (.330)');
        ok(w.ctl.active === false, '7b · …and stays inactive, so it cannot swallow the host’s turns');
    }

    // ── 10 · A MISSING MARK SCHEME FAILS LOUD TO THE STUDENT ─────────────────────────────
    {
        const w = world();
        const opened = openLadder(w, { schemeKey: 'no_such_paper_ao9' });
        ok(opened === false, '10 · opening against a scheme we do not hold is refused');
        ok(/could not load the mark scheme/i.test(allText(w)),
            '10 · …and the STUDENT is told, in words — not left on a blank screen (§4d)');
        ok(w.ctl.active === false, '10 · the walk does not go active on a scheme it cannot serve');
    }

    console.log('\n' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
    if (fail) { console.error('examiner-ladder-sim-harness FAILED'); process.exit(1); }
    console.log('✅ examiner-ladder-sim-harness passed — bottom-up, stops where the student stops,');
    console.log('   every criterion verbatim, the mark is AQA’s own number, ZERO API calls.');
}

main().catch((e) => { console.error('examiner-ladder-sim-harness THREW —', e && e.stack); process.exit(1); });
