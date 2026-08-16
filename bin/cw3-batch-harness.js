#!/usr/bin/env node
/* eslint-env node */
/**
 * cw3-batch-harness.js — structural gate for the v7.20.325 CW Step-3 rebuild.
 *
 * ⭐ WHY. Step 3 handed a turn to the API for EVERY one of its ten asks, purely to decide "is this
 * good enough yet". Neil: "I didn't realise step three used so many API calls… it was useful having
 * the API calls, it's just too expensive." The rebuild files every answer verbatim with no
 * round-trip and spends exactly TWO calls: one over all seven components together, one over all
 * three loglines. This gate is what stops the per-ask calls creeping back in, and what stops the
 * filing being quietly dropped along with them — losing the student's words would be far worse than
 * the cost it saved.
 *
 * Usage: node bin/cw3-batch-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

function sliceCtl(name) {
    const start = JS.indexOf('const ' + name + ' = (function () {');
    if (start < 0) return null;
    let depth = 0, i = JS.indexOf('{', start), inStr = null, started = false;
    for (; i < JS.length; i++) {
        const c = JS[i], n = JS[i + 1];
        if (!inStr && c === '/' && n === '/') { while (i < JS.length && JS[i] !== '\n') i++; continue; }
        if (!inStr && c === '/' && n === '*') { i = JS.indexOf('*/', i) + 1; continue; }
        if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
        if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
        if (c === '{') { depth++; started = true; continue; }
        if (c === '}') { depth--; if (started && depth === 0) return JS.slice(start, i + 1); }
    }
    return null;
}

console.log('CW STEP 3 — two API calls, not ten');

const CTL = sliceCtl('_cwLoglineCtl');
if (!CTL) { console.error('  ❌ could not slice _cwLoglineCtl'); process.exit(1); }

// ── 1. the API budget ─────────────────────────────────────────────────────────────────────────
{
    // ONE call SITE, reached twice at runtime (fireReview serves both groups) — so the budget is
    // two calls per completed walk. A second site would mean a per-ask verdict crept back in.
    const sends = (CTL.match(/sendCanvasMessage\(\)/g) || []).length;
    ok(sends === 1, `exactly ONE sendCanvasMessage() site, shared by both reviews (found ${sends})`);
    ok(/fireReview\('components'\)/.test(CTL) && /fireReview\('loglines'\)/.test(CTL),
        'and it is reached for BOTH groups — components and loglines — i.e. two calls per walk');
    const arms = (CTL.match(/armWalkResume\(/g) || []).length;
    ok(arms === 1, `one armWalkResume call site, shared by both reviews (found ${arms})`);
    ok(/armWalkResume\('cw3-review-' \+ kind/.test(CTL), 'the resume hook is keyed per review group');
    ok(!/armWalkResume\('cw3-' \+ step\.fid/.test(CTL),
        'the OLD per-component verdict hook is gone — that was the ten-call design');
    ok(!/@COMPONENT_OK/.test(CTL), 'the per-ask @COMPONENT_OK verdict marker is gone with it');
}

// ── 2. nothing the student writes depends on a round-trip ─────────────────────────────────────
{
    // v7.20.327: the write target now comes from the ARMED SLOT, not from STEPS[idx] — the
    // filing is still verbatim and still inside handleTurn with no round-trip, but `step` is
    // resolved from the ask that requested the answer.
    // v7.20.333: asserted as the INVARIANT rather than as a character window. The old form was
    // `handleTurn[\s\S]{0,2200}?_writeOutlineRowField`, which failed the moment the duplicate guard
    // was added ABOVE the write — a true statement about the code, reported as a defect. A gate
    // that breaks on distance rather than on meaning trains you to widen it, which is how it stops
    // guarding anything.
    const htAt = CTL.indexOf('async function handleTurn(msg)');
    const wrAt = CTL.indexOf('_writeOutlineRowField(step.fid, clean', htAt);
    ok(htAt >= 0 && wrAt > htAt,
        'handleTurn no longer files the student\'s answer verbatim through the ask\'s own step.fid');
    ok(!/sendCanvasMessage\(\)|armWalkResume\(/.test(CTL.slice(htAt, wrAt < 0 ? htAt : wrAt)),
        'an API round-trip now sits between the student answering and their words being filed — the '
        + 'whole point of the .325 batching is that nothing they write waits on a call completing');
    ok(/const step = stepByFid\(slot\.fid\)/.test(CTL),
        'the write target is resolved from the armed slot, not from a cursor');
    ok(/_walkSlot\.consume\('cw3'\)/.test(CTL),
        'handleTurn consumes the slot — no ask served means nothing is written');
    ok(/userTurn\(clean\);/.test(CTL),
        'the student turn is echoed by code — sendCanvasMessage used to do this, and dropping it ' +
        'silently would erase their words from the transcript');
    ok(/function userTurn\(text\)[\s\S]{0,220}saveCanvasChat/.test(CTL), 'and that echo is persisted');
}

// ── 3. the student can act on the review WITHOUT another call ─────────────────────────────────
{
    ok(/@WEAK:/.test(CTL), 'the review returns machine-read weak-component markers');
    ok(/@ALL_OK/.test(CTL), 'and an all-clear marker');
    ok(/if \(!weakFids\.length\) \{[\s\S]{0,120}afterReview\(kind\)/.test(CTL),
        'FAIL-OPEN: a dropped marker or a failed call moves the walk on rather than stranding it');
    ok(/revisingFid/.test(CTL) && /_writeOutlineRowField\(fid, clean, \{ replace: true \}\)/.test(CTL),
        'a revision REPLACES that ONE row — and costs no further API call. Appending here stitched '
        + 'both drafts into the box (the v7.20.289 bug, reintroduced by .325 and fixed at .327)');
    ok(/weakFids = weakFids\.filter/.test(CTL),
        'a sharpened component leaves the weak list, so the chips cannot loop forever');
}

// ── 4. Neil's interaction laws ────────────────────────────────────────────────────────────────
{
    // One message at a time: the review chips must ride the reply, not add a second bubble.
    const chipsBlock = CTL.slice(CTL.indexOf('function serveReviewChips'), CTL.indexOf('function onReviewPick'));
    ok(!/aiBubble\(/.test(chipsBlock),
        'the review chips ride the review reply — no second bubble underneath it (one message at a time)');
    ok(/function serveLoglinePicker/.test(CTL), 'the chosen-logline picker exists');
    // v7.20.332: and it REPLACES. The box holds ONE sentence; appending glued the pick onto
    // whatever an earlier run left behind (Neil, staging .331: "Logline Test 2after dying in a
    // car accident…").
    ok(/_writeOutlineRowField\(CHOSEN_FID, full, \{ replace: true \}\)/.test(CTL),
        'picking a logline files it into the Chosen Logline row, REPLACING what was there');
    ok(/const CHOSEN_FID = 'cw-step-3-chosen'/.test(CTL),
        'and it writes the id the rest of the app reads (cw-step-3-chosen)');
    // v7.20.525 (#377): the old "no dead menu" guard is superseded. Hiding a blank logline from
    // the chip list WAS the defect — the student saw two chips and no sign a third was missing.
    // A blank row now re-serves its own ask instead.
    ok(/function firstBlankFormula/.test(CTL) && /serveBlankLoglineGate\(blank\); return;/.test(CTL),
        'no incomplete choice: a blank logline re-serves its ask instead of being hidden from the picker');
    ok(!/if \(!txt\) return;[\s\S]{0,400}chipBar\(opts, onLoglinePick/.test(CTL)
        || /const blank = firstBlankFormula\(\);/.test(CTL),
        'the picker still silently drops a blank logline');
}

// ── 4b. #377 — the review must SEND what it built, and the choice must be a DECISION ──────────
{
    // The whole of #377: `ctx` was assembled — marker contract, the student's ten sentences,
    // their self-assessment claims — and then dropped, with a friendly one-liner sent instead.
    // Behavioural twin: cw3-sim-harness I12, which reads the actual payload.
    const fire = CTL.slice(CTL.indexOf('function sendReview'), CTL.indexOf('function onReviewReply'));
    ok(/chatTextarea\.value = ctx;/.test(fire),
        'the review builds a payload and sends something ELSE — the marker contract never reaches '
        + 'the model, @WEAK: never parses, and the walk fails open every time (#377)');
    ok(/@ALL_OK/.test(CTL) && /if \(!reviewRetried\)/.test(CTL),
        'an unreadable review is not distinguished from a pass — retry once, then say so (root §10)');
    ok(/function serveChoiceDecision/.test(CTL) && /function verdictLine/.test(CTL),
        'the chosen logline is committed with no verdict shown — #377 part 4 is a forced DECISION '
        + '(see it, then sharpen / keep / re-pick), never a silent commit');
    ok(/_cwReplay\(function \(\) \{\s*\n?\s*aiBubble\('\*\*' \+ labelOf\(fid\)/.test(CTL),
        'the decision bubble is PERSISTED — it asserts current state (the row text and my verdict '
        + 'on it), so it must be drawn and re-derived on resume, never stored (§4c.7 fossil law)');
}

// ── 5. resume ─────────────────────────────────────────────────────────────────────────────────
{
    ok(/rc: reviewedComponents, rl: reviewedLoglines, weak: weakFids, rev: revisingFid/.test(CTL),
        'the review state is persisted, or a reload strands the student on dead chips');
    ok(/resumed mid-revision of/.test(CTL), 'resume re-serves an in-flight revision');
    ok(/resumed on the review chips/.test(CTL), 'resume re-attaches the review chips');
    ok(/re-serving the logline picker/.test(CTL), 'resume re-serves the picker if no logline was chosen yet');
}

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ cw3-batch-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ cw3-batch-harness passed (2 API calls, every answer filed verbatim, review actionable without a call).');
