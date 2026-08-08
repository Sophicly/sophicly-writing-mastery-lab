#!/usr/bin/env node
/* eslint-env node */
/**
 * reach-runtime-harness.js — v7.20.482 (FIXLIST #356)
 *
 * WHY THIS EXISTS — AND WHY `reachability-lint.js` WAS NOT ENOUGH
 * ──────────────────────────────────────────────────────────────
 * Its sibling `reachability-lint.js` (.474) rules out the two CSS traps that strand a control: a
 * growing scroller with no `min-height: 0`, and `100vh` with no `dvh` companion. It is static. It
 * has, in its own words, no opinion about whether a control is on the screen.
 *
 * On 2026-08-08 that gap had a name. Fatou Soumah (uid 1330), on an iPad, could not see the answer
 * box; Neil, sitting beside her: "to her, it looked like just a bunch of buttons, and she didn't
 * know why she was clicking them." Her Step 3 document stops at ask 4 of 7. Measured on prod that
 * day: the walk served the ask, filed nothing, and every earlier answer had landed in exactly the
 * right row. NOTHING WAS WRONG WITH THE WALK. The question was below the bottom of her screen.
 *
 * So v7.20.482 added a RUNTIME check (`_askReach` in wml-assessment.js) and this file guards it.
 *
 * ⭐ THE DEFECT IT IS BUILT TO CATCH, and the reason CHECK 1 is written the way it is:
 * `window.innerHeight` is the LAYOUT viewport. An on-screen keyboard shrinks the VISUAL viewport
 * and leaves the layout one untouched — so a reachability check written against `innerHeight`
 * PASSES with the field sitting behind the keyboard, which is exactly the failing shape. The unit
 * cases below therefore assert both directions: the visual band must REJECT the stranded field,
 * and the layout band must ACCEPT it. If someone "simplifies" the band back to `innerHeight`, the
 * second assertion fails and names why. A check that only proves the good case would pass on the
 * broken implementation (feedback_negative_only_tests_pass_on_a_dead_screen, in reverse).
 *
 * WHAT IT CHECKS
 *   1. GEOMETRY — the pure functions between the `@REACH-GEOM` sentinels are extracted from the
 *      real source (never re-typed here: a check that duplicates its subject tests its own memory)
 *      and driven through the iPad-with-keyboard case, the scrolled-visual-viewport case, a
 *      healthy case, and the partial-overlap case.
 *   2. WIRING — every `function addChatMessage(` in wml-assessment.js calls `_askReach.afterBubble`.
 *      That is the choke point every ask of every kind passes through, so a walk added tomorrow
 *      inherits the check without knowing it exists — but only while a third pipeline cannot be
 *      added without it.
 *   3. THE KEYBOARD LISTENER — the failing shape emits NO bubble, so `visualViewport` resize must
 *      be listened for. Without it the check only ever runs when something was said.
 *   4. THE PILL IS REACHABLE ITSELF — `position: fixed` and a JS-stamped `.is-light`. A pill
 *      positioned in normal flow would be stranded by the same geometry it exists to rescue, and a
 *      descendant theme selector cannot match an element parented to <body>: it would compile
 *      cleanly and never fire.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   It cannot prove a real control is on a real screen — jsdom has no layout and node has no
 *   glass. Only an iPad does. Treat a pass as "the arithmetic is right and the check is wired",
 *   never as "the student can see it".
 *
 * Run: node bin/reach-runtime-harness.js        (wired into bin/pre-ship-check.sh)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'frontend/wml-assessment.js');
const CSS = path.join(ROOT, 'frontend/wml-canvas.css');

let failures = 0;
function ok(cond, label, detail) {
    if (cond) { console.log('  ✓ ' + label); return true; }
    failures++;
    console.log('  ✗ ' + label);
    if (detail) console.log('      ' + detail);
    return false;
}

const src = fs.readFileSync(JS, 'utf8');
const css = fs.readFileSync(CSS, 'utf8');

// ── 1. GEOMETRY ────────────────────────────────────────────────────────────────────────────
console.log('reach-runtime: geometry');
const m = src.match(/@REACH-GEOM-START([\s\S]*?)@REACH-GEOM-END/);
if (!m) {
    console.log('  ✗ the @REACH-GEOM sentinels are missing from wml-assessment.js');
    console.log('      The harness extracts the live functions rather than re-typing them. If the');
    console.log('      block moved, move the sentinels with it — do not copy the maths in here.');
    process.exit(1);
}
// The START sentinel lives inside a comment that may run several lines; drop to its `*/`, and
// drop the `/*` that opens the END sentinel's comment at the tail.
const geomSrc = m[1].slice(m[1].indexOf('*/') + 2).replace(/\/\*\s*$/, '');
let geom;
try {
    // eslint-disable-next-line no-new-func
    geom = new Function(geomSrc + '\nreturn { reachBand, reachFully, reachUsable };')();
} catch (e) {
    console.log('  ✗ the geometry block did not evaluate: ' + e.message);
    process.exit(1);
}
const { reachBand, reachFully, reachUsable } = geom;

// THE REAL CASE. iPad landscape, layout viewport 1024 tall, keyboard open so the visible glass is
// the top 500px. The answer box sits at 700→744 — comfortably inside the layout viewport and
// completely behind the keyboard.
const IPAD_INPUT = { top: 700, bottom: 744, height: 44 };
const visualBand = reachBand({ height: 500, offsetTop: 0 }, 1024);
const layoutBand = reachBand(undefined, 1024);
ok(visualBand.src === 'visual' && visualBand.bottom === 500,
    'visualViewport gives the glass, not the layout viewport', JSON.stringify(visualBand));
ok(reachFully(IPAD_INPUT, visualBand) === false,
    'the stranded iPad input is REJECTED against the visual band (the whole point)');
ok(reachUsable(IPAD_INPUT, visualBand) === false,
    'and it is not even partially usable — none of it is on the glass');
ok(reachFully(IPAD_INPUT, layoutBand) === true,
    'THE INJECTED DEFECT: the same input PASSES against an innerHeight band — which is why the '
    + 'band must never be built from innerHeight while visualViewport exists');

// The visual viewport can also be OFFSET (pinch-zoom, or iOS scrolling the page under a keyboard).
// getBoundingClientRect is in layout coordinates, so the band must move with offsetTop or every
// measurement is wrong by exactly that amount.
const offsetBand = reachBand({ height: 400, offsetTop: 300 }, 1024);
ok(offsetBand.top === 300 && offsetBand.bottom === 700,
    'an offset visual viewport shifts BOTH edges of the band', JSON.stringify(offsetBand));
ok(reachFully({ top: 120, bottom: 164, height: 44 }, offsetBand) === false,
    'a control above an offset band is off screen, not "at the top"');
ok(reachFully({ top: 400, bottom: 444, height: 44 }, offsetBand) === true,
    'a control inside the offset band is reachable');

// Healthy case, and the partial-overlap rung that we accept only after a scroll.
const healthy = reachBand({ height: 800, offsetTop: 0 }, 800);
ok(reachFully({ top: 700, bottom: 744, height: 44 }, healthy) === true,
    'a normal desktop input is fully visible');
ok(reachFully({ top: 780, bottom: 824, height: 44 }, healthy) === false
    && reachUsable({ top: 780, bottom: 824, height: 44 }, healthy) === false,
    'a control clipped to 20 of its 44 pixels is neither fully visible nor usable');
ok(reachUsable({ top: 700, bottom: 810, height: 110 }, healthy) === true,
    'a tall chip bar with 100px on screen IS usable — the bar is min(height, 32px), not "whole"');
ok(reachFully({ top: 0, bottom: 0, height: 0 }, healthy) === false
    && reachUsable({ top: 0, bottom: 0, height: 0 }, healthy) === false,
    'a zero-rect (display:none, unmounted) is never reachable');

// ── 2. WIRING ──────────────────────────────────────────────────────────────────────────────
console.log('reach-runtime: wiring');
const defs = [];
const defRe = /function addChatMessage\s*\(/g;
let d;
while ((d = defRe.exec(src))) defs.push(d.index);
ok(defs.length >= 2, 'found the chat pipelines (' + defs.length + ' addChatMessage definitions)');
defs.forEach((start, i) => {
    const end = (i + 1 < defs.length) ? defs[i + 1] : src.length;
    const body = src.slice(start, end);
    const line = src.slice(0, start).split('\n').length;
    ok(body.indexOf('_askReach.afterBubble') !== -1,
        'addChatMessage at line ' + line + ' calls _askReach.afterBubble',
        'Every ask of every kind emits a bubble — that is why the hook lives here rather than at '
        + '_walkSlot.arm() (typed asks only) or _armLiveChips (three walks of seven). A pipeline '
        + 'without it is a pipeline whose students can be stranded silently.');
});

// ── 3. THE KEYBOARD LISTENER ───────────────────────────────────────────────────────────────
console.log('reach-runtime: the keyboard');
const reachBlock = src.slice(src.indexOf('const _askReach = (function ()'),
    src.indexOf('window.WML._askReach'));
ok(/vv\.addEventListener\(\s*['"]resize['"]/.test(reachBlock),
    'visualViewport resize is listened for — the keyboard opening emits no bubble',
    'Without this the check only ever runs when something was said, and the single most common '
    + 'way a field goes off screen is a student tapping into it.');
ok(/window\.visualViewport/.test(reachBlock),
    'the band is read from window.visualViewport');
ok(/scrollIntoView/.test(reachBlock),
    'rung 2 exists: an unreachable control is scrolled to before anything is drawn');
ok(/showPill/.test(reachBlock) && /console\.warn\('WML reach/.test(reachBlock),
    'rung 3 exists: if it still cannot be shown, the student is TOLD and we log it',
    'CLAUDE.md §4d — a refusal is half a change. "Could not show the field" is a complete '
    + 'sentence in a log and a broken page to a 14-year-old.');
ok(/__wmlReach/.test(reachBlock),
    'every pass is recorded to window.__wmlReach for the next real-device report (root §19)');
// The one named failure mode this feature has, and the reason it is worth a gate of its own:
// `afterBubble` runs INSIDE `addChatMessage`. An uncaught throw there takes the chat down for
// every student on every turn — a check whose job is to stop students being stranded must not be
// able to strand them.
ok(/afterBubble:\s*guard\(/.test(reachBlock),
    'afterBubble is wrapped — it runs inside addChatMessage and may never throw into it',
    'Without this, one bad rect reading breaks the chat for every student. It must go inert and '
    + 'say so once, never take the pipeline with it.');
ok(/const safeCheck = guard\(check\)/.test(reachBlock)
    && !/setTimeout\(check\.bind/.test(reachBlock),
    'every scheduled pass goes through safeCheck, not the raw check');

// ── 4. THE PILL MUST BE REACHABLE ITSELF ───────────────────────────────────────────────────
console.log('reach-runtime: the pill');
const pillRule = (css.match(/\.swml-reach-pill\s*\{[\s\S]*?\}/) || [''])[0];
ok(/position:\s*fixed/.test(pillRule),
    '.swml-reach-pill is position: fixed',
    'It is positioned against the visual viewport by JS. In normal flow it would be stranded by '
    + 'the same geometry as the control it exists to rescue.');
ok(!/top:\s*[\d]/.test(pillRule),
    'the stylesheet does not set its own `top` — JS owns that from visualViewport');
ok(/\.swml-reach-pill\.is-light/.test(css),
    'the light theme is a class ON the element, not a descendant selector',
    'The pill is parented to <body>, so `.swml-canvas-light .swml-reach-pill` would compile '
    + 'cleanly and never match — the worst kind of wrong.');
ok(/classList\.toggle\('is-light'/.test(reachBlock),
    'and the JS stamps it from the live canvas theme');

console.log('');
if (failures) {
    console.log('reach-runtime-harness FAILED (' + failures + ') — a student can be stranded again.');
    process.exit(1);
}
console.log('reach-runtime-harness passed.');
