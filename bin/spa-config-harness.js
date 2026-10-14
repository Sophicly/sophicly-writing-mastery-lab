#!/usr/bin/env node
/* eslint-env node */
/**
 * spa-config-harness.js — v7.20.874 (FIXLIST spa-stale-lesson-url). Measured on staging 14 Oct: after a Focus SPA
 * navigation (Polish → Get Your Assessment) window.swmlConfig is a NEW object with the new lesson's values, but
 * WML.config still pointed at the first page's object, so every grade commit forwarded the OLD lesson_url and the
 * listener filed the grade on the wrong lesson (Reeham 1352, row 1978).
 *  1. THE RULE — _syncSpaConfig is EXTRACTED from the shipped file and driven.
 *  2. THE WIRING — the SPA re-init syncs BEFORE it reads cfg into state (so nothing in the new lesson reads the old
 *     values) and re-points window.swmlConfig at the synced object.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-app.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };
const B = SRC.indexOf('// @SPA-CONFIG-PURE-BEGIN'), E = SRC.indexOf('// @SPA-CONFIG-PURE-END');
ok(B > 0 && E > B, 'the @SPA-CONFIG-PURE sentinels exist');
if (!(B > 0 && E > B)) { console.log('\n❌ spa-config-harness FAILED'); process.exit(1); }
const sync = new Function(SRC.slice(B, E) + '\nreturn _syncSpaConfig;')();

console.log('\n1. the rule');
const POLISH = 'https://x/lessons/4-polish-your-writing/', ASSESS = 'https://x/lessons/5-get-your-assessment-feedback/';
const held = { lessonUrl: POLISH, restUrl: '/r/', targetUserId: 1938, _runtimeFlag: true };
const alias = held;                                     // what wml-pull-overlay / core's `config` hold
const fresh = { lessonUrl: ASSESS, restUrl: '/r/', targetUserId: 1938, courseDeadline: '2026-11-01' };
ok(sync(held, fresh) === true, 'a fresh settings object is copied in');
ok(alias.lessonUrl === ASSESS, 'every holder of the old object now sees the NEW lesson url', alias.lessonUrl);
ok(alias.courseDeadline === '2026-11-01', 'new keys arrive too');
ok(alias._runtimeFlag === true, 'a key the code added at runtime survives');
ok(sync(held, held) === false && sync(held, null) === false && sync(null, fresh) === false, 'same object / nothing fresh → no-op');

console.log('\n2. the wiring');
const R0 = SRC.indexOf('function _doSpaReinit()'), R1 = SRC.indexOf("document.addEventListener('focusSpaNavigated', _doSpaReinit)");
const re = SRC.slice(R0, R1);
const iSync = re.indexOf('_syncSpaConfig(WML.config, window.swmlConfig)');
ok(iSync > 0, '_doSpaReinit syncs WML.config from window.swmlConfig');
ok(iSync > 0 && iSync < re.indexOf('window.swmlEmbedConfig = cfg') && iSync < re.indexOf("state.task        = cfg.task"), '…before it reads the new lesson into state');
ok(/if \(WML\.config\) window\.swmlConfig = WML\.config;/.test(re), 'window.swmlConfig is re-pointed at the synced object');
const commit = (fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8').match(/lesson_url: \(WML\.config && WML\.config\.lessonUrl\) \|\| ''/g) || []).length;
ok(commit >= 4, 'grade commits still forward WML.config.lessonUrl (the field this keeps current)', commit);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ spa-config-harness FAILED'); process.exit(1); }
console.log('✅ spa-config-harness passed (after an in-page lesson change, WML reads the new lesson\'s settings).');
