#!/usr/bin/env node
/* eslint-env node */
/**
 * frame-structure-lint.js — v7.20.483 (FIXLIST #359)
 *
 * WHY THIS EXISTS
 * ───────────────
 * #359 moved the status footer out of the editor pane and made it the canvas's own bottom row,
 * so it spans sidebar + document + chat — Apple's window chrome, and the thing that dissolves the
 * seam class structurally. That meant `.swml-canvas` became a flex COLUMN of
 * [ .swml-canvas-row ][ .swml-canvas-status ], and every LAYOUT child moved into the row.
 *
 * ⭐ THE CRASH THIS GUARDS, which the design handoff did NOT name. Three sites do
 * `canvas.insertBefore(<panel>, editorPane)`. Once `editorPane`'s parent is the row, that call
 * throws **NotFoundError** — a hard crash, not a layout wobble. One of them (wml-assessment.js
 * ~34437) is a nested re-mount block whose `canvas` and `editorPane` resolve to the PRIMARY
 * declarations, which is easy to misread as a separate builder's own variables and leave behind.
 *
 * ⭐ THE SILENT BREAK THIS ALSO GUARDS. Two other builders (:57422 feedback view, :58044
 * standalone) append their panes DIRECTLY to a bare `.swml-canvas`. If the column ever moves
 * from `.swml-canvas-framed` onto the bare class, those two stack their panes VERTICALLY — a
 * total layout break in two places nobody routinely drives.
 *
 * WHAT IT CHECKS
 *   1. the primary builder creates the row, stamps `swml-canvas-framed`, and appends the row
 *   2. no `canvas.insertBefore(..., editorPane)` survives in the primary region (the crash)
 *   3. the footer is a CANVAS child there, not an editorPane child
 *   4. the column is scoped to `.swml-canvas-framed`, never the bare `.swml-canvas`
 *   5. the row declares `min-height: 0` (FIXLIST #343 — without it the footer is pushed off screen)
 *
 * WHAT IT DOES NOT DO: prove the frame LOOKS right. Only a browser does that.
 *
 * Run: node bin/frame-structure-lint.js        (wired into bin/pre-ship-check.sh)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const js = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8');

// The primary builder is everything above the other two canvas builders.
const OTHER = Math.min(
    js.indexOf("el('div', { className: 'swml-canvas swml-feedback-canvas' })"),
    js.lastIndexOf("el('div', { className: 'swml-canvas' })")
);
const primary = js.slice(0, OTHER > 0 ? OTHER : js.length);

let fail = 0;
const ok = (cond, label, detail) => {
    if (cond) { console.log('  ✓ ' + label); return; }
    fail++; console.log('  ✗ ' + label); if (detail) console.log('      ' + detail);
};

console.log('frame-structure: the primary builder');
ok(/const paneRow = el\('div', \{ className: 'swml-canvas-row' \}\)/.test(primary),
    'the row wrapper is created');
ok(/canvas\.classList\.add\('swml-canvas-framed'\)/.test(primary),
    'the canvas is stamped swml-canvas-framed');
ok(/canvas\.appendChild\(paneRow\)/.test(primary),
    'the row is appended to the canvas');

console.log('frame-structure: the NotFoundError crash');
const bad = primary.match(/canvas\.insertBefore\([^)]*editorPane\)/g) || [];
ok(bad.length === 0,
    'no canvas.insertBefore(..., editorPane) survives — it would throw NotFoundError',
    bad.length ? 'FOUND: ' + bad.join(' · ') + ' — editorPane is a child of paneRow now, so these '
        + 'must be paneRow.insertBefore(...). Note the nested re-mount block shares the PRIMARY '
        + 'canvas/editorPane; it is not a separate builder.' : '');
ok(/paneRow\.insertBefore\([^)]*editorPane\)/.test(primary),
    'the panel inserts go through paneRow');

console.log('frame-structure: the footer');
ok(!/editorPane\.appendChild\(statusBar\)/.test(primary),
    'the footer is NOT an editorPane child any more');
ok(/canvas\.appendChild\(statusBar\)/.test(primary),
    'the footer is a canvas child, so it spans the whole frame by construction');

console.log('frame-structure: the CSS scope');
ok(/\.swml-canvas-framed\s*\{[^}]*flex-direction:\s*column/.test(css),
    'the column is scoped to .swml-canvas-framed');
const bare = css.match(/^\.swml-canvas\s*\{[^}]*\}/m) || [''];
ok(!/flex-direction:\s*column/.test(bare[0]),
    'the BARE .swml-canvas is still a row — the other two builders depend on it',
    'wml-assessment.js :57422 and :58044 append panes straight to a bare .swml-canvas. Making '
    + 'that a column stacks their panes vertically, silently, in two places nobody drives.');
const row = (css.match(/\.swml-canvas-framed\s*>\s*\.swml-canvas-row\s*\{[^}]*\}/) || [''])[0];
ok(/min-height:\s*0/.test(row),
    'the row declares min-height: 0 (FIXLIST #343)',
    'Without it the row grows to its tallest pane instead of letting panes scroll, and pushes the '
    + 'footer off the screen — the defect that stopped students typing on iPads, on production.');

console.log('');
if (fail) { console.log('frame-structure-lint FAILED (' + fail + ').'); process.exit(1); }
console.log('frame-structure-lint passed.');
