#!/usr/bin/env node
/* eslint-env node */
// live-modelling-apparatus-harness.js — v7.20.790 (#839). A live-modelling lesson is a `diagnostic` document the
// TEACHER writes in front of a class, so none of the diagnostic apparatus may reach it (#447m, v7.20.594): no session
// timer, no deadline, no word target, no baseline card, no "Set your timer" pop-up, no red "0 / 650" pill.
// #447m gated the right panel and the countdown but missed the timer picker and the floating word pill — found on
// staging 9 Oct when the author got "Set your timer… this diagnostic" over the page. Every such gate keys on the ONE
// predicate (wml-core.js isLiveModelling), never on the task name; this fails the build if one stops doing so.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };
const LM = /WML\.isLiveModelling && WML\.isLiveModelling\(\)/;
const fnBody = (sig) => { const a = JS.indexOf(sig); return a < 0 ? '' : JS.slice(a, JS.indexOf('\n    }\n', a) + 6); };

ok(/function isLiveModelling\(\)/.test(CORE) && /lm === true \|\| lm === 1 \|\| lm === '1' \|\| c\.reviewRole === 'live_modelling'/.test(CORE),
    'the ONE predicate: author (liveModelling, string-cast by wp_localize_script) OR any viewer (reviewRole live_modelling)');
const picker = fnBody('function maybeShowDiagnosticTimerPicker()');
ok(picker.indexOf('if (state.reviewMode) return;') > 0 && /if \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\) return;/.test(picker.slice(0, 600)),
    '#839: no "Set your timer" pop-up for the live-modelling author (viewers are out by review mode)');
ok(/const wcWidgetLabel = el\('span', \{ id: 'swml-wc-widget-label', textContent: \(state\.task === 'planning' \|\| \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \? '0 words'/.test(JS),
    '#839: the floating pill STARTS as "0 words" on a live-modelling lesson (no "0 / target")');
const paint = fnBody('function _paintWcWidgetLabel(editor)');
const lmAt = paint.search(/if \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\) \{/), tgtAt = paint.indexOf('widget.textContent = `${wc} / ${canvasWordTarget}`');
ok(lmAt > 0 && tgtAt > lmAt, '#839: the canonical pill painter counts words with no target BEFORE any "/ target" branch');
ok(/if \(state\.task === 'planning' \|\| \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \{ w\.style\.background = ''; w\.style\.color = ''; return; \}/.test(fnBody('function applyWcWidgetColour(wc)')),
    '#839: the pill stays neutral — no red "well short" colour in front of a class');
ok(/wcWidgetLabel\.textContent = \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\) \? `\$\{wc\} word\$\{wc !== 1 \? 's' : ''\}` : `\$\{wc\} \/ \$\{canvasWordTarget\}`;/.test(JS),
    '#839: the diagnostic live updater keeps the pill target-free too (it would otherwise repaint "N / target" on every keystroke)');
// #447m's own gates (v7.20.594) — kept here so the whole set is in one place
ok(/countdownStart = \(isCwTask \|\| isExamPrep \|\| noDeadlinePhase \|\| \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \? null/.test(JS), '#447m: no deadline countdown');
ok(/if \(!_isLiveModel\) rightPanel\.appendChild\(timeWrap\);/.test(JS), '#447m: no Session timer in the rail');
ok(/if \(state\.task !== 'mastery_codex' && !_isLiveModel\) \{/.test(JS), '#447m: no word target in the rail');
ok(LM.test(JS.slice(JS.indexOf('_wnEssayDoc && !(WML.isLiveModelling'), JS.indexOf('_wnEssayDoc && !(WML.isLiveModelling') + 120)), '#447m: no "Your baseline" card for the author');

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
