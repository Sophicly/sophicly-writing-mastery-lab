#!/usr/bin/env node
/* eslint-env node */
/**
 * spa-config-harness.js — v7.20.874 (FIXLIST spa-stale-lesson-url). Measured on staging 14 Oct: after a Focus SPA
 * navigation (Polish → Get Your Assessment) window.swmlConfig is a NEW object with the new lesson's values, but
 * WML.config still pointed at the first page's object, so every grade commit forwarded the OLD lesson_url and the
 * listener filed the grade on the wrong lesson (Reeham 1352, row 1978).
 *  1. THE RULE — _syncSpaConfig is EXTRACTED from the shipped file and driven.
 *  2. THE WIRING — ORDER-PROOF, because it was measured both ways: WML's 1s poller can re-init BEFORE the theme
 *     re-runs swmlConfig, and then skips focusSpaNavigated as "already done". So (a) the lesson url rides the
 *     lesson's OWN embed config (in the HTML) and is applied at re-init; (b) a separate focusSpaNavigated listener,
 *     registered before the re-init one, syncs everything else (the theme fires it after its scripts).
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
ok(/if \(WML\.config && cfg\.lessonUrl\) WML\.config\.lessonUrl = cfg\.lessonUrl;/.test(re), 're-init applies the url from the lesson\'s own embed config (order-proof)');
const PHP = fs.readFileSync(path.join(__dirname, '..', 'sophicly-writing-mastery-lab.php'), 'utf8');
const emb = PHP.slice(PHP.indexOf("'postId'      => $post_id,"), PHP.indexOf("'postId'      => $post_id,") + 600);
ok(/'lessonUrl'\s*=> get_queried_object_id\(\) \? get_permalink\(get_queried_object_id\(\)\) : ''/.test(emb), 'the embed config carries lessonUrl, same expression as swmlConfig');
const L1 = SRC.indexOf("document.addEventListener('focusSpaNavigated', function () {\n        _syncSpaConfig(WML.config, window.swmlConfig);");
ok(L1 > 0 && L1 < R1, 'a focusSpaNavigated listener syncs the settings, registered BEFORE the re-init listener');
const commit = (fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8').match(/lesson_url: \(WML\.config && WML\.config\.lessonUrl\) \|\| ''/g) || []).length;
ok(commit >= 4, 'grade commits still forward WML.config.lessonUrl (the field this keeps current)', commit);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ spa-config-harness FAILED'); process.exit(1); }
console.log('✅ spa-config-harness passed (after an in-page lesson change, WML reads the new lesson\'s settings).');
