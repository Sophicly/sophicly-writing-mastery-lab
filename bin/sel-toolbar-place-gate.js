#!/usr/bin/env node
/* eslint-env node */
/**
 * sel-toolbar-place-gate.js — the selection toolbar STAYS ATTACHED TO THE TEXT (FIXLIST #379).
 *
 * Neil, staging v7.20.519: *"I resized the screen and then took it back to its normal size, and you
 * can see that the toolbar has just become detached… what I want it to do is to stay attached to
 * the word or the text that's been highlighted."*
 *
 * THE CAUSE WAS MEASURED, from the DOM he pasted (root §19 — never guess): `top: 1044.6px;
 * left: 4px`. BOTH axes were sitting exactly on their clamp limits, which is not drift — it is the
 * signature of a DEGENERATE selection rect (empty / zero-area) driving both expressions past their
 * bounds at once. The old placer checked `rects.length > 0` but never that the rect had any AREA,
 * and a browser mid-reflow returns exactly that.
 *
 * WHY A GATE AND NOT A COMMENT. This is arithmetic on geometry: it has no UI, it cannot be seen in
 * a screenshot, and it has now been got wrong twice on this component (v7.20.465 fixed the sidebar
 * case and left this one). It also cannot be caught by any existing gate — reachability-lint has
 * opinions about scrollers, not about whether a popover is next to its anchor.
 *
 * It drives the SHIPPED `_swmlPlaceSelToolbar`, sliced out of wml-assessment.js, on synthetic
 * geometry — never a re-typed copy (§14c). ⚠️ It proves the MATHS. It cannot prove the toolbar
 * looks right; only a real browser at a real viewport does that.
 *
 * Usage: node bin/sel-toolbar-place-gate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib.js');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-app.js'), 'utf8');

let fail = 0;
let pass = 0;
function ok(cond, msg) {
    if (cond) { pass++; return true; }
    fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── slice the shipped placer ─────────────────────────────────────────────────────────────────
const i = SRC.indexOf('function _swmlPlaceSelToolbar(tb, host) {');
if (i < 0) { console.error('❌ _swmlPlaceSelToolbar not found — the gate would go blind'); process.exit(1); }
const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end).replace(/^function\s+\w+/, 'function');
let warned = 0;
let SEL = null;
// eslint-disable-next-line no-new-func
const place = new Function('window', 'console', 'return ' + body + ';')(
    { getSelection: () => SEL },
    { warn: () => { warned++; } }
);

// A scroller 600px tall, scrolled 1000px down, whose box starts 100px from the viewport top.
const host = { scrollTop: 1000, clientHeight: 600, getBoundingClientRect: () => ({ top: 100, left: 50, width: 700 }) };
const newTb = () => ({ isConnected: true, offsetWidth: 600, offsetHeight: 40, style: {} });
const sel = (rect) => ({
    rangeCount: 1, isCollapsed: false,
    getRangeAt: () => ({
        getClientRects: () => (rect ? [rect] : []),
        getBoundingClientRect: () => rect || { top: 0, bottom: 0, left: 0, width: 0, height: 0 },
    }),
});

console.log('SELECTION TOOLBAR PLACEMENT — the real placer, on synthetic geometry (#379)');

// ── 1. A DEGENERATE RECT IS REFUSED, and nothing is written ──────────────────────────────────
// This is THE bug. The old code wrote a position from a zero rect, and because both clamps fired
// the toolbar jumped to the top-left of the scroller — Neil's exact screenshot. Refusing is what
// keeps it where it was until a real measurement arrives.
{
    SEL = sel({ top: 0, bottom: 0, left: 0, width: 0, height: 0 });
    const tb = newTb();
    ok(place(tb, host) === false, 'a zero-area rect is REFUSED');
    ok(tb.style.top === undefined && tb.style.left === undefined,
        '…and NOTHING is written — the old code wrote a clamped position here, which IS the defect');
    ok(warned === 1, '…and it is reported to the console rather than failing silently (root §19)');
}
// An empty client-rect list with a zero bounding rect is the same condition.
{
    SEL = sel(null);
    const tb = newTb();
    ok(place(tb, host) === false, 'an EMPTY client-rect list is refused too');
}

// ── 2. ROOM ABOVE → it goes above, on the selection ──────────────────────────────────────────
{
    SEL = sel({ top: 500, bottom: 520, left: 300, width: 60, height: 20 });
    const tb = newTb();
    ok(place(tb, host) === true, 'a real rect places');
    // 500 - 100 + 1000 - 40 - 8
    ok(tb.style.top === '1352px', 'placed ABOVE the line when there is room (got ' + tb.style.top + ')');
    // 300 - 50 + 30 - 300 → clamped to 4 (this toolbar is wider than the space, which is NORMAL
    // for the document toolbar in a narrow column — the left clamp is not itself a bug)
    ok(tb.style.left === '4px', 'horizontal clamp still applies when the bar is wider than its host');
}

// ── 3. NO ROOM ABOVE → FLIP BELOW, never park at the top ─────────────────────────────────────
// The old behaviour clamped to `scrollTop + 8` = 1008, which leaves the bar at the top of the
// visible area while the text sits far below it. That is what "detached" looked like.
{
    SEL = sel({ top: 110, bottom: 130, left: 300, width: 60, height: 20 });
    const tb = newTb();
    place(tb, host);
    const top = Number(String(tb.style.top).replace('px', ''));
    ok(top === 1038, 'FLIPS BELOW the line when there is no room above (got ' + tb.style.top + ')');
    ok(top > 1008, '…and that is BELOW the old clamp value — attached to the text, not parked at the top');
}

// ── 4. NEITHER SIDE FITS → the clamp survives as the last resort, never off-screen ───────────
{
    const tight = { scrollTop: 1000, clientHeight: 60, getBoundingClientRect: () => ({ top: 100, left: 50, width: 700 }) };
    SEL = sel({ top: 110, bottom: 130, left: 300, width: 60, height: 20 });
    const tb = newTb();
    place(tb, tight);
    const top = Number(String(tb.style.top).replace('px', ''));
    ok(top >= 1008, 'in a scroller too short for either side, the toolbar stays inside it (got ' + top + ')');
}

// ── 5. ONE PLACER, and every live surface uses it ────────────────────────────────────────────
// The reason the sweep mattered: the same arithmetic existed in three places and only one of them
// had ever been taught to re-place itself, so two toolbars carried the identical defect. And two
// of the copies turned out to be behind a dead `return` — fixing those and stopping would have
// left the toolbar students actually use untouched (§14b).
{
    const defs = (SRC.match(/function _swmlPlaceSelToolbar\(/g) || []).length;
    ok(defs === 1, 'exactly ONE placer is defined (got ' + defs + ')');
    ok(/window\.WML\.trackSelToolbar = _swmlTrackSelToolbar/.test(SRC),
        'the placer is exposed for the chat toolbar, which lives in the other bundle');
    ok(/WML\?\.trackSelToolbar\?\.\(toolbar, msgs\)/.test(APP),
        'wml-app.js — the LIVE chat selection toolbar — routes through the shared placer');
    ok(/_swmlPlaceCancel/.test(APP),
        'and wml-app.js releases the placer handles on teardown (no observer outlives its node)');
    // The old inline arithmetic must not creep back in anywhere.
    ok(!/msgsRect\.width - tbW - 4/.test(SRC),
        'no copy of the old chat placement arithmetic survives in wml-assessment.js');
    // ⚠️ `function _swmlTrackSelToolbar(tb, host)` matches a naive call-site regex, so the
    // DEFINITION must be excluded or the count is always one too high.
    const trackCalls = (SRC.match(/(?<!function )_swmlTrackSelToolbar\(tb, /g) || []).length;
    ok(trackCalls === 3, 'all three builders in wml-assessment.js track (got ' + trackCalls + ')');
}

// ── 6. THE ANCHOR WATCHER (#379 round 2) ────────────────────────────────────────────────────
// Neil on the event-driven v7.20.520: *"you've almost got it… when the page increases again, the
// gap between the toolbar and the text increases."* The toolbar's `top` is a DOCUMENT coordinate,
// so any reflow after the last `resize` event moves the text out from under it. Watching the
// anchor every frame removes the timing question entirely — there is no "final" measurement to miss.
{
    const wi = SRC.indexOf('function _swmlWatchSelAnchor(tb, host) {');
    ok(wi >= 0, 'the anchor watcher exists');
    if (wi >= 0) {
        const wbody = SRC.slice(wi, braceSliceFrom(SRC, wi, '{', '}').end).replace(/^function\s+\w+/, 'function');
        let frames = 0;
        let placed = 0;
        const raf = (fn) => { frames++; if (frames < 6) setTimeoutImmediate(fn); return frames; };
        const pending = [];
        function setTimeoutImmediate(fn) { pending.push(fn); }
        // eslint-disable-next-line no-new-func
        const watch = new Function('window', 'requestAnimationFrame', 'cancelAnimationFrame', '_swmlPlaceSelToolbar',
            'return ' + wbody + ';')(
            { getSelection: () => SEL },
            raf,
            () => {},
            () => { placed++; return true; }
        );
        const drain = () => { while (pending.length) pending.shift()(); };

        // A STILL anchor must not write every frame — that would be a style recalculation per
        // frame for no visible change, which is how a "smooth" fix becomes a performance defect.
        SEL = sel({ top: 500, bottom: 520, left: 300, width: 60, height: 20 });
        const tb1 = newTb();
        watch(tb1, host);
        drain();
        ok(placed === 1, 'a STILL anchor places once and then stays quiet (got ' + placed + ' writes)');

        // A MOVED anchor re-places — this is the reported bug: the text reflowed under the bar.
        placed = 0; frames = 0;
        const tb2 = newTb();
        watch(tb2, host);
        pending.length && pending.shift()();          // frame 1: initial measurement
        SEL = sel({ top: 640, bottom: 660, left: 300, width: 60, height: 20 });   // the reflow
        drain();
        ok(placed >= 2, 'a MOVED anchor re-places — the gap closes itself (got ' + placed + ')');

        // And it STOPS when the toolbar goes, or every selection in a session leaves a live loop.
        placed = 0; frames = 0;
        const tb3 = newTb();
        watch(tb3, host);
        tb3.isConnected = false;
        drain();
        ok(tb3._swmlPlaceRaf === 0, 'the watcher stops itself once the toolbar is disconnected');
    }
    ok(/_swmlWatchSelAnchor\(tb, host\)/.test(SRC), 'the tracker starts the watcher');
    ok(!/_swmlPlaceSelToolbarSettled/.test(SRC),
        'the 120ms timing backstop is GONE — it was a guess at which reflow lands last');
}

console.log('   ' + pass + ' assertions passed');
if (fail) { console.error('❌ sel-toolbar-place-gate FAILED'); process.exit(1); }
console.log('✅ sel-toolbar-place-gate passed (degenerate rects refused · flips below · one placer, every surface).');
