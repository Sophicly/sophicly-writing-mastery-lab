#!/usr/bin/env node
/* eslint-env node */
// marker-key-harness (v7.20.717) — a filing marker that names its field "fieldId" still files.
//
// Measured defect (WML 327 A, AQA Literature planning walk, staging 1938, 2026-10-06): the protocol asks for
// @FIELD_COMMIT{"field":"outline-body-1-topic"}, its own line says "Use exactly these literal fieldIds", and
// Sophia emitted @FIELD_COMMIT{"fieldId":"outline-body-1-topic","value":"…"}. applyFieldCommits reads
// `field`, found none, and returned SILENTLY — the student's accepted topic sentence never reached the
// outline box. _normalizeMarkerKeys rewrites the key once at ingest (both pipelines). This harness slices the
// REAL function, drives it with the REAL marker, and checks both ingest points call it.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const B = SRC.indexOf('// @MARKER-KEY-PURE-BEGIN'), E = SRC.indexOf('// @MARKER-KEY-PURE-END');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
ok(B > 0 && E > B, 'the pure normaliser sits between its sentinels');
const warns = [];
const ctx = { console: { warn: (...a) => warns.push(a.join(' ')) }, String };
vm.createContext(ctx);
vm.runInContext(SRC.slice(B, E) + '\nthis.f = _normalizeMarkerKeys;', ctx);
const f = ctx.f;

// The real marker from the walk (value shortened).
const REAL = 'That\'s a strong topic sentence, Neil.\n@ELEMENT_JUDGE{"el":"outline-body-1-topic","verdict":"resolved"}\n@FIELD_COMMIT{"fieldId":"outline-body-1-topic","value":"At the start, Macbeth\'s conscience already imagines the eternal punishment"}\nNext comes the technique.';
const out = f(REAL);
ok(/@FIELD_COMMIT\{"field":"outline-body-1-topic","value":/.test(out), 'M1: the walk\'s marker now names "field"', out);
ok(out.indexOf('@ELEMENT_JUDGE{"el":"outline-body-1-topic"') !== -1 && out.indexOf('That\'s a strong topic sentence') === 0, 'M2: nothing else in the reply changes');
ok(warns.some(w => /normalised 1/.test(w)), 'M3: it says so in the console (never silent)');
ok(f('@FIELD_SET{"value":"how; present","fieldId":"kw-focus"}') === '@FIELD_SET{"value":"how; present","field":"kw-focus"}', 'M4: @FIELD_SET too, key in any position');
ok(f('@FIELD\\_COMMIT{"fieldId":"outline-body-2-topic"}') === '@FIELD\\_COMMIT{"field":"outline-body-2-topic"}', 'M5: the escaped-underscore marker form');
const prose = 'The fieldId of a box is "fieldId": not something a student sees.';
ok(f(prose) === prose, 'M6: "fieldId" OUTSIDE a filing marker is untouched');
const canon = '@FIELD_COMMIT{"field":"outline-body-1-topic"}';
ok(f(canon) === canon && f(f(REAL)) === f(REAL), 'M7: the canonical form is unchanged and the rewrite is idempotent');
ok(f('') === '' && f(null) === null, 'M8: empty input is returned as is');

// Wiring: both pipelines normalise BEFORE the keyword heal and every filer.
const calls = (SRC.match(/res\.reply = _healKeywordSave\(_normalizeMarkerKeys\(res\.reply\), canvasChatHistory\)/g) || []).length;
ok(calls === 2, 'W1: both chat pipelines normalise the reply at ingest', calls);
ok(/if \(seen\) console\.warn\('\[WML FieldFill\] @FIELD_COMMIT present but no field could be read'/.test(SRC), 'W2: applyFieldCommits is loud when a marker names no field');

console.log(`— MARKER KEY: ${pass}/${pass + fail} assertions passed.`);
if (fail) { console.log('❌ marker-key-harness FAILED'); process.exit(1); }
console.log('✅ marker-key-harness passed (a filing marker that says "fieldId" still files).');
