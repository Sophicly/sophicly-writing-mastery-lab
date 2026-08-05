#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-board-pin-harness.js — v7.20.445
 *
 * BEHAVIOURAL gate for the CW board pin (dashboard FIXLIST #82 / the dashboard→wml handoff of
 * 2026-08-05, "REVIEW MODE SKIPS THE CW BOARD PIN so a reviewer sees a seeded doc").
 *
 * ⭐ WHY IT DRIVES THE REAL `renderSetup` INSTEAD OF GREPPING FOR THE PIN.
 * The reporting handoff is explicit, and it is right: *"'The pin exists in the file' proves
 * nothing — it existed throughout this bug."* It did. The pin has been in wml-app.js since
 * v7.17.45; the defect was that the REVIEW BRANCH RETURNS BEFORE IT. Any check that asks "is the
 * pin present?" passes on the broken build. So this slices the real `renderSetup` out of
 * wml-app.js, runs it against a fake world, and asserts the STATE THE CANVAS IS ENTERED WITH —
 * which is the thing that decides the meta key, and therefore the bug.
 *
 * THE FAILURE IT EXISTS TO CATCH: `state.board` is part of the canvas meta key
 * (`swml_canvas_{board}_{text}_{suffix}…`). All 29 CW lessons ship `board="all"`; `universal`
 * exists only because the pin puts it there. Enter the canvas without pinning and the server is
 * asked for a key the student has nothing under → `hasDoc:false` → a fresh doc seeded from the
 * artifact. The reviewer sees the carried-over material and none of the student's own work, and
 * nothing errors. (Root CLAUDE.md §5d: write-key ≠ read-key.)
 *
 * Run: node bin/cw-board-pin-harness.js
 */
const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib.js');

const SRC = fs.readFileSync(path.resolve(__dirname, '../frontend/wml-app.js'), 'utf8');

const fail = [];
const ok = [];
const T = (cond, msg) => (cond ? ok : fail).push(msg);

function sliceFn(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i === -1) return null;
    const open = SRC.indexOf('{', i);
    const r = braceSliceFrom(SRC, open, '{', '}');
    return r ? SRC.slice(i, r.end + 1) : null;
}

const pinSrc = sliceFn('_pinCwIdentity');
const setupSrc = sliceFn('renderSetup');
T(!!pinSrc, '_pinCwIdentity() exists and is sliceable');
T(!!setupSrc, 'renderSetup() exists and is sliceable');
if (!pinSrc || !setupSrc) { report(); }

// ── The fake world. Only the review path needs to run, so the stubs are the few things that path
//    touches; anything else throwing would itself be a finding. ────────────────────────────────
function runSetup(initialState, opts) {
    opts = opts || {};
    const calls = [];
    const state = Object.assign({}, initialState);
    const sandbox = {
        state,
        hasWMLAccess: opts.hasWMLAccess !== false,
        isEmbedded: !!opts.isEmbedded,
        renderUpgradePrompt: () => calls.push({ fn: 'renderUpgradePrompt' }),
        getTextLabel: (t) => 'Label:' + t,
        WML: {
            // The canvas is entered HERE — snapshot the state at that instant, because that is
            // what builds the meta key.
            renderCanvasWorkspace: () => calls.push({
                fn: 'renderCanvasWorkspace',
                board: state.board, text: state.text, subject: state.subject, task: state.task,
            }),
            renderFeedbackDiscussionCanvas: () => calls.push({ fn: 'renderFeedbackDiscussionCanvas' }),
            getExerciseConfig: () => ({ environment: 'training' }),
            getCwStepDef: () => ({ step: 5, trial: null }),
            cwProject: { list: () => Promise.resolve({ projects: [] }), pinKey: () => 'k', isReviewing: () => true },
        },
        $: () => ({ innerHTML: '' }),
        console: { log: () => {}, warn: () => {}, error: () => {} },
        sessionStorage: { getItem: () => '', setItem: () => {} },
        window: { location: { search: '' }, WML: null },
        URLSearchParams: URLSearchParams,
        setTimeout: () => {},
    };
    sandbox.window.WML = sandbox.WML;
    const names = Object.keys(sandbox);
    const body = pinSrc + '\n' + setupSrc + '\nrenderSetup();';
    try {
        // eslint-disable-next-line no-new-func
        new Function(...names, body)(...names.map(n => sandbox[n]));
    } catch (e) {
        calls.push({ fn: 'THREW', message: e.message });
    }
    return { state, calls };
}

// ── 1. THE REGRESSION ITSELF: reviewer, SPA nav, board arrives as 'all' ──────────────────────
// This is Neil's exact case — reviewing Billo (1332), stepping Step 6 → Step 5 via the Focus
// sidebar. `_doSpaReinit` assigns state.board = cfg.board || '' verbatim from the embed dataset,
// and every CW lesson's shortcode says board="all".
{
    const { state, calls } = runSetup({
        reviewMode: true, board: 'all', text: 'creative_writing',
        subject: 'skills', task: 'cw_step_5', topicNumber: 0,
    });
    const entered = calls.find(c => c.fn === 'renderCanvasWorkspace');
    T(!!entered, 'reviewer + SPA nav: the canvas is still entered (the fix must not swallow the path)');
    T(state.board === 'universal',
        `reviewer + SPA nav: board is pinned to universal before entry (got "${state.board}")`);
    T(entered && entered.board === 'universal',
        `reviewer + SPA nav: the canvas is ENTERED with universal — this is the meta key (got "${entered && entered.board}")`);
    T(entered && entered.text === 'creative_writing' && entered.subject === 'creative_writing',
        'reviewer + SPA nav: text and subject are the CW sentinels at entry');
}

// ── 2. THE CASE THAT ALWAYS WORKED must keep working (full page load, board already universal) ─
// ⛔ On its own this proves nothing — it passed throughout the bug. It is here only to catch a
//    fix that repairs the SPA path by breaking the path Neil uses when he refreshes.
{
    const { state, calls } = runSetup({
        reviewMode: true, board: 'universal', text: 'creative_writing',
        subject: 'creative_writing', task: 'cw_step_6', topicNumber: 0,
    });
    const entered = calls.find(c => c.fn === 'renderCanvasWorkspace');
    T(entered && entered.board === 'universal' && state.board === 'universal',
        'reviewer + full page load: unchanged, still universal');
}

// ── 3. THE PIN MUST NOT LEAK ONTO NON-CW WORK ────────────────────────────────────────────────
// The 2026-04-23 board-fallback handoff's standing concern, and `_assertBoardValid()` exists to
// catch this class at save time. A pin that fires on an exam-prep task would corrupt a REAL
// student's key, which is far worse than the bug being fixed.
{
    const { state, calls } = runSetup({
        reviewMode: true, board: 'aqa', text: 'romeo_and_juliet',
        subject: 'literature', task: 'assessment', topicNumber: 1,
    });
    const entered = calls.find(c => c.fn === 'renderCanvasWorkspace');
    T(state.board === 'aqa', `non-CW reviewer: board untouched (got "${state.board}")`);
    T(state.text === 'romeo_and_juliet', `non-CW reviewer: text untouched (got "${state.text}")`);
    T(state.subject === 'literature', `non-CW reviewer: subject untouched (got "${state.subject}")`);
    T(entered && entered.board === 'aqa', 'non-CW reviewer: canvas entered with its own board');
}
{
    // The nastiest neighbour: a non-CW task whose board is legitimately absent. The pin keying on
    // `task` (not on a falsy board) is what keeps these apart.
    const { state } = runSetup({
        reviewMode: true, board: '', text: 'macbeth', subject: 'literature', task: 'diagnostic',
    });
    T(state.board === '', 'non-CW task with an empty board is NOT given the CW board');
}

// ── 4. THE ORDERING INVARIANT — the pin must precede EVERY return in renderSetup ──────────────
// The behavioural tests above cover the review branch, which is the one that bit. This covers the
// branches that have not been written yet: a future early return added above the pin re-opens the
// exact defect, silently, for whatever path it serves.
{
    const pinAt = setupSrc.indexOf('_pinCwIdentity()');
    T(pinAt !== -1, 'renderSetup calls _pinCwIdentity()');
    const before = setupSrc.slice(0, pinAt);
    const returnsBefore = (before.match(/\breturn\b/g) || []).length;
    // Exactly one legitimate early return precedes it: the tier gate (!hasWMLAccess), which never
    // reaches a canvas at all.
    T(returnsBefore <= 1,
        `only the tier gate may return before the pin (returns found before it: ${returnsBefore})`);
    T(/hasWMLAccess/.test(before),
        'the one return before the pin is the tier gate');
}

// ── 5. ONE IMPLEMENTATION, not N copies ──────────────────────────────────────────────────────
// The reason this bug existed is that "CW means universal" was asserted in several places and one
// entry path missed all of them. Count the raw assignments that are still hand-rolled against a
// CW-task guard.
{
    const rawPins = (SRC.match(/state\.board\s*=\s*'universal'/g) || []).length;
    const helperCalls = (SRC.match(/_pinCwIdentity\(\)/g) || []).length;
    T(helperCalls >= 4, `the canonical pin is used, not re-typed (calls: ${helperCalls})`);
    // The remaining raw assignments are the USER-CHOICE entries (clicking a Creative Writing card
    // or pill), which set state.mode = 'creative' too and are not keyed on task — a different
    // thing, deliberately left alone.
    T(rawPins <= 4,
        `hand-rolled 'universal' assignments are down to the user-choice entries (found ${rawPins})`);
    rawPins > 0 && console.log(`  … ${rawPins} raw pin(s) remain, all user-choice CW entries (mode='creative'), not task-derived.`);
}

report();

function report() {
    ok.forEach(m => console.log('  ✓ ' + m));
    fail.forEach(m => console.log('  ✗ ' + m));
    console.log(`\n${ok.length} passed, ${fail.length} failed`);
    if (fail.length) { console.log('❌ cw-board-pin-harness FAILED'); process.exit(1); }
    console.log('✅ cw-board-pin-harness passed (a reviewer arriving by SPA nav enters the canvas on the student\'s own key).');
    process.exit(0);
}
