#!/usr/bin/env node
/* eslint-env node */
// display-marker-harness (v7.20.721, FIXLIST #745) — a marker formatAI RENDERS survives the sweep before it.
//
// Measured defect (WML 329 A, IGCSE P1 planning walk, staging 1938, 2026-10-06): the Section B lead-in emitted
// `@DEVICE_MENU` on its own line (raw history turn 191), but no "Device templates" chip appeared. In the page,
// formatAI('…\n@DEVICE_MENU\n…') rendered the chip, while stripAIInternals of the same text returned it with the
// line gone. stripAIInternals runs first in both pipelines, and its generic whole-line sweep (v7.20.335) deleted
// the token formatAI needed. Same loss on AQA P2 Q5 planning since .335.
// This harness slices the REAL sweep, drives it with the REAL lead-in line, and checks that every @NAME
// formatAI turns into a control is in DISPLAY_MARKERS — so a new display marker cannot be eaten silently.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-core.js'), 'utf8');
const B = SRC.indexOf('// @DISPLAY-MARKERS-PURE-BEGIN'), E = SRC.indexOf('// @DISPLAY-MARKERS-PURE-END');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
ok(B > 0 && E > B, 'the display-marker block sits between its sentinels');

function load(src) {
    const ctx = { Set, String };
    vm.createContext(ctx);
    vm.runInContext(src + '\nthis.sweep = sweepMachineLines; this.names = Array.from(DISPLAY_MARKERS);', ctx);
    return ctx;
}
const block = SRC.slice(B, E);
const { sweep, names } = load(block);

// D1 — the real Section B lead-in tail (raw turn 191 of the walk).
const LEADIN = 'If you want construction templates for metaphors and advanced techniques, the device menu below stays open all session.\n\n@DEVICE_MENU\n\nBefore we choose your task, take a moment to reflect in the panel below.\n\n@REFLECT_GATE';
const out = sweep(LEADIN);
ok(/^@DEVICE_MENU$/m.test(out), 'D1: @DEVICE_MENU on its own line survives the sweep', out);
ok(!/@REFLECT_GATE/.test(out), 'D2: a machine marker on its own line is still removed', out);
ok(sweep('@WEAK: goal, stakes') === '', 'D3: the .335 case (@WEAK: …) is still removed');
ok(sweep('Use the menu: @DEVICE_MENU now') === 'Use the menu: @DEVICE_MENU now', 'D4: inline text is untouched');
ok(sweep('@RESOURCE_LINK {"id":"x"}') === '@RESOURCE_LINK {"id":"x"}', 'D5: a resource-link line (rendered by tagResourceLinks) is outside the sweep shape');

// D6 — every @NAME formatAI rewrites into a control token is in DISPLAY_MARKERS.
const fStart = SRC.indexOf('function formatAI(');
const fEnd = SRC.indexOf('\n    function ', fStart + 20);
ok(fStart > 0 && fEnd > fStart, 'formatAI located');
const body = SRC.slice(fStart, fEnd);
const rendered = [...body.matchAll(/\.replace\(\/@([A-Z][A-Z0-9_]+)\/g\s*,\s*'⟦/g)].map(m => m[1]);
ok(rendered.length >= 1, 'D6a: formatAI renders at least one @NAME token (found ' + rendered.join(',') + ')');
rendered.forEach(n => ok(names.includes(n), 'D6b: formatAI renders @' + n + ' and DISPLAY_MARKERS holds it', names));

// D7 — stripAIInternals uses the guarded sweep, not a bare whole-line regex.
const sStart = SRC.indexOf('function stripAIInternals(');
const sBody = SRC.slice(sStart, SRC.indexOf('\n    function ', sStart + 20));
ok(/sweepMachineLines\(text\)/.test(sBody), 'D7a: stripAIInternals calls sweepMachineLines');
ok(!/text\.replace\(\/\^\[ \\t\]\*@\[A-Z\]\[A-Z0-9_\]\{2,\}/.test(sBody), 'D7b: no unguarded whole-line @NAME sweep remains in stripAIInternals');

// Mutation — the gate must catch the defect it was built for.
const mutated = load(block.replace("new Set(['DEVICE_MENU'])", 'new Set([])'));
ok(!/@DEVICE_MENU/.test(mutated.sweep(LEADIN)), 'M1: with DEVICE_MENU removed from the set, D1 would fail (mutation detected)');

console.log((fail ? '❌' : '✅') + ' display-marker-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
