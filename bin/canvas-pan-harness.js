#!/usr/bin/env node
/* eslint-env node */
/**
 * canvas-pan-harness.js — v7.20.873 (FIXLIST canvas-doc-drag). Neil watched a student slide the document sideways
 * by mistake and not get it back. Ruling (14 Oct): the document moves sideways "Only when zoomed in".
 *  1. THE RULE — canvasPanLimit is EXTRACTED from the shipped file (between the @CANVAS-PAN-PURE sentinels) and
 *     driven: 0 whenever the scaled document fits the pane (normal size, auto-fit); zoomed in, exactly far enough
 *     to show each edge + 16px.
 *  2. THE WIRING — the swipe and the drag both refuse while the limit is 0, and EVERY write to the pan offset goes
 *     through the clamp (or is a reset to 0 / the drag's start value), so a zoomed-in document cannot leave the screen.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };

const B = SRC.indexOf('// @CANVAS-PAN-PURE-BEGIN'), E = SRC.indexOf('// @CANVAS-PAN-PURE-END');
ok(B > 0 && E > B, 'the @CANVAS-PAN-PURE sentinels exist');
if (!(B > 0 && E > B)) { console.log('\n❌ canvas-pan-harness FAILED'); process.exit(1); }
const limit = new Function(SRC.slice(B, E) + '\nreturn canvasPanLimit;')();

console.log('\n1. the rule');
ok(limit(720, 1, 1000) === 0, 'normal size, wide pane → the document stays put', limit(720, 1, 1000));
ok(limit(720, (600 - 32) / 720, 600) === 0, 'auto-fitted to a narrow pane → stays put', limit(720, (600 - 32) / 720, 600));
ok(limit(720, 1.3, 1000) === 0, 'zoomed but still narrower than the pane (936 < 1000) → stays put', limit(720, 1.3, 1000));
ok(limit(720, 1.5, 1000) === 56, 'zoomed 150% in a 1000px pane → slides 40px each way + 16 = 56', limit(720, 1.5, 1000));
ok(limit(720, 2, 1000) === 236, 'zoomed 200% → 220 + 16 = 236', limit(720, 2, 1000));
ok(limit(720, 1.5, 0) === 0 && limit(0, 1.5, 1000) === 0 && limit(720, NaN, 1000) === 0, 'unmeasured pane / bad input → 0, never NaN');

console.log('\n2. the wiring');
const P0 = SRC.indexOf('// ── Canvas Panning'), P1 = SRC.indexOf('function updateToolbarState', P0);
const pan = SRC.slice(P0, P1);
const zoomFn = SRC.slice(SRC.indexOf('function applyZoom(newZoom'), SRC.indexOf('function updateDocTransform'));
const wheel = pan.slice(pan.indexOf("contentWrap.addEventListener('wheel'"), pan.indexOf("contentWrap.addEventListener('mousedown'"));
const down = pan.slice(pan.indexOf("contentWrap.addEventListener('mousedown'"), pan.indexOf("document.addEventListener('mousemove'"));
const gateW = /if \(canvasPanLimit\(DOC_NATURAL_WIDTH, canvasZoom, contentWrap\.clientWidth\) <= 0\) \{ panGestureActive = false; return; \}/;
const gate = /if \(canvasPanLimit\(DOC_NATURAL_WIDTH, canvasZoom, contentWrap\.clientWidth\) <= 0\) return;/;
ok(gateW.test(wheel) && wheel.search(gateW) < wheel.indexOf('e.deltaX'), 'the sideways swipe refuses before it reads deltaX while the document fits');
ok(gate.test(down) && down.search(gate) < down.indexOf('isPanning = true'), 'the background drag refuses before it grabs while the document fits');
ok(/panOffsetX = clampPanX\(panOffsetX\)/.test(zoomFn) && !/canvasZoom <= 1\) panOffsetX = 0/.test(zoomFn), 'a zoom change clamps the offset to the new range (0 at fit)');
const writes = [...(zoomFn + pan).matchAll(/panOffsetX\s*(\+=|-=|=(?!=))\s*([^;]+);/g)].map(m => m[1] + ' ' + m[2].trim());
const bad = writes.filter(w => !/^= (clampPanX\(|0$|_next$)/.test(w) && w !== '= 0' );
ok(bad.length === 0, 'every write to the pan offset is clamped or a reset', bad);
ok(/_next = clampPanX\(panOffsetX \+ panVelocity\)/.test(pan) && /if \(_atEdge\)/.test(pan), 'momentum is clamped and stops at the edge');
ok(/addEventListener\('dblclick'/.test(pan), 'double-click still re-centres');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ canvas-pan-harness FAILED'); process.exit(1); }
console.log('✅ canvas-pan-harness passed (the document moves sideways only while zoomed in, and never off screen).');
