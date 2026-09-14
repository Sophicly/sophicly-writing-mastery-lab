#!/usr/bin/env node
/* eslint-env node */
/**
 * toolkit-link-gate.js — v7.20.613
 *
 * EVERY Mastery Toolkit deep link we emit must land on a REAL section, and this is the check that
 * proves it. `wml-core.js` has claimed "parity check at pre-ship" since v7.19.949; it was never
 * built, and v7.20.613 adds ~30 ids to the allowlist and 19 rows to PENALTY_LEARN_MAP, so the
 * unchecked surface just grew by an order of magnitude.
 *
 * WHY A TYPO HERE IS INVISIBLE. `tagResourceLinks` drops an unknown id with a `console.warn` and
 * renders NOTHING — so a mistyped section is not an error the student or Neil can see. It is a
 * chip that silently fails to appear, which reads exactly like "the feature isn't built yet".
 * That is the F1 silent-landing lesson (v7.19.949, Neil's live test: F1 chips opened the toolkit
 * LANDING because 'inference-verbs' was never a section id — the real id is 'wb-verbs').
 *
 * THE RESOLUTION RULE, and it is not "the id must be in SECTIONS". The notes toolkit's tkNavigate
 * tries `'fix-' + slug` FIRST, then the bare slug. So 'topic-sentence' resolves to
 * 'fix-topic-sentence' and is legal even though no section carries that bare id. This gate applies
 * the same two-step rule rather than a naive membership test, because a naive test would fail two
 * ids that work in production today.
 *
 * ⚠️ A MISSING BUNDLE IS NOT A PASS. The notes plugin lives outside this repo. If its built bundle
 * is absent the gate says so LOUDLY and exits non-zero, because "I could not check" must never be
 * rendered as "checked, fine" (§17c: an incomplete search is not a zero).
 *
 * Run: node bin/toolkit-link-gate.js       (wired into bin/pre-ship-check.sh)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CORE = path.join(ROOT, 'frontend', 'wml-core.js');
const CHIP = path.join(ROOT, 'frontend', 'wml-selection-chip.js');
// The notes plugin is a sibling of this plugin's parent tree.
const BUNDLE = path.resolve(ROOT, '..', '..', '..', 'sophicly-plugins',
    'sophicly-notes', 'assets', 'js', 'sophicly-toolkit.js');

let pass = 0, fail = 0;
function ok(label, cond, got) {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
}

console.log('TOOLKIT DEEP LINKS — every emitted section id resolves in the notes SECTIONS registry\n');

// ── 1. The real section registry, from the BUILT bundle (what ships, not the prototype) ──────
if (!fs.existsSync(BUNDLE)) {
    console.log('❌ toolkit-link-gate: the notes toolkit bundle was NOT FOUND at\n     ' + BUNDLE
        + '\n   Every toolkit id is therefore UNVERIFIED. This is a hard failure, not a skip —'
        + '\n   a link that cannot be checked is exactly the one that silently renders nothing.');
    process.exit(1);
}
const bundle = fs.readFileSync(BUNDLE, 'utf8');
const SECTIONS = [...bundle.matchAll(/id:"([a-z0-9-]+)"/g)].map(m => m[1]);
const SECTION_SET = new Set(SECTIONS);
ok('the notes bundle parses to a plausible SECTIONS registry (>= 30 sections)', SECTIONS.length >= 30, SECTIONS.length);
console.log('    ' + SECTION_SET.size + ' unique section ids found in the built bundle');

// tkNavigate's own rule: try 'fix-' + slug, then the bare slug.
const resolves = (arg) => SECTION_SET.has('fix-' + arg) || SECTION_SET.has(arg);

// ── 2. Every id in the allowlist must resolve ────────────────────────────────────────────────
const core = fs.readFileSync(CORE, 'utf8');
const allowSrc = core.match(/const RESOURCE_TOOLKIT_IDS = (\[[\s\S]*?\]);/);
ok('RESOURCE_TOOLKIT_IDS is present in wml-core.js', !!allowSrc);
const ALLOW = allowSrc ? new Function('return ' + allowSrc[1] + ';')() : [];
console.log('\n  The allowlist (' + ALLOW.length + ' ids):');
ALLOW.forEach(id => ok('allowlist id resolves: ' + id
    + (SECTION_SET.has(id) ? '' : ' (via the fix- prefix → fix-' + id + ')'), resolves(id)));

// ── 3. Every PENALTY_LEARN_MAP toolkit arg must resolve AND be in the allowlist ──────────────
// Both halves matter: resolving proves the section exists; being in the allowlist proves
// tagResourceLinks will not drop it. A row can satisfy one and fail the other.
const mapSrc = core.match(/const PENALTY_LEARN_MAP = \{([\s\S]*?)\n    \};/);
ok('PENALTY_LEARN_MAP is present in wml-core.js', !!mapSrc);
const rows = mapSrc ? [...mapSrc[1].matchAll(/^\s*([A-Z]{1,3}\d(?:-[A-Z]+)?):\s*\{\s*dest:\s*'(\w+)'(?:,\s*arg:\s*'([^']+)')?/gm)] : [];
const tkRows = rows.filter(r => r[2] === 'toolkit');
console.log('\n  PENALTY_LEARN_MAP (' + rows.length + ' codes, ' + tkRows.length + ' pointing at the toolkit):');
tkRows.forEach(r => {
    ok('penalty ' + r[1] + ' → "' + r[3] + '" resolves to a real section', resolves(r[3]));
    ok('penalty ' + r[1] + ' → "' + r[3] + '" is in RESOURCE_TOOLKIT_IDS (else it renders nothing)',
        ALLOW.indexOf(r[3]) !== -1);
});

// ── 4. Every @RESOURCE_LINK the chip emits must be in the allowlist ──────────────────────────
// The scans emit these markers as literal text; tagResourceLinks validates them at render time
// and drops an unknown one SILENTLY, so a typo in a scan is a link the student never sees.
const chip = fs.readFileSync(CHIP, 'utf8');
const emitted = [...chip.matchAll(/@RESOURCE_LINK\s*(\{[^}]*\})/g)].map(m => {
    try { return JSON.parse(m[1]); } catch (_) { return null; }
});
console.log('\n  @RESOURCE_LINK markers emitted by the selection chip (' + emitted.length + '):');
ok('every emitted marker is valid JSON (an unparseable one is dropped with a warn)',
    emitted.every(Boolean), emitted.filter(e => !e).length + ' unparseable');
emitted.filter(Boolean).forEach(p => {
    if (p.dest === 'table') { ok('table link carries an arg', !!p.arg); return; }
    ok('scan link → "' + p.arg + '" is in RESOURCE_TOOLKIT_IDS', ALLOW.indexOf(p.arg) !== -1);
    ok('scan link → "' + p.arg + '" resolves to a real section', resolves(p.arg));
    ok('scan link → "' + p.arg + '" carries a human label (never a bare id on screen — root §14)',
        !!p.label && p.label !== p.arg);
});

console.log('\n' + (fail
    ? '❌ toolkit-link-gate FAILED — ' + fail + ' of ' + (pass + fail) + ' checks. A dead deep link renders NOTHING, so this cannot be caught by looking at the screen.'
    : '✅ toolkit-link-gate passed  (' + pass + ' assertions, 0 failed)'));
process.exit(fail ? 1 : 0);
