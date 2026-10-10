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
// v7.20.807 (#861): the word-target gates key on _noWordTarget(). v7.20.814 (#867b): live modelling ONLY — Edexcel
// IGCSE Language shows per-question ADVICE again (Neil, 10 Oct: "Show an advice number"; doc-template-mode-harness §3).
const NWT = fnBody('function _noWordTarget()');
ok(/^function _noWordTarget\(\) \{\s*(\/\/[^\n]*\n\s*)*return !!\(WML\.isLiveModelling && WML\.isLiveModelling\(\)\);\s*\}$/.test(NWT),
    '#839/#867b: _noWordTarget() = live modelling, and nothing else');
const NW = String.raw`(?:WML\.isLiveModelling && WML\.isLiveModelling\(\)|_noWordTarget\(\))`;
ok(new RegExp(String.raw`const wcWidgetLabel = el\('span', \{ id: 'swml-wc-widget-label', textContent: \(state\.task === 'planning' \|\| \(?` + NW + String.raw`\)?\) \? '0 words'`).test(JS),
    '#839: the floating pill STARTS as "0 words" on a live-modelling lesson (no "0 / target")');
const paint = fnBody('function _paintWcWidgetLabel(editor)');
const lmAt = paint.search(/if \((?:WML\.isLiveModelling && WML\.isLiveModelling\(\)|_noWordTarget\(\))\) \{/), tgtAt = paint.indexOf('widget.textContent = `${wc} / ${canvasWordTarget}`');
ok(lmAt > 0 && tgtAt > lmAt, '#839: the canonical pill painter counts words with no target BEFORE any "/ target" branch');
ok(new RegExp(String.raw`if \(state\.task === 'planning' \|\| \(?` + NW + String.raw`\)?\) \{ w\.style\.background = ''; w\.style\.color = ''; return; \}`).test(fnBody('function applyWcWidgetColour(wc)')),
    '#839: the pill stays neutral — no red "well short" colour in front of a class');
ok(new RegExp(String.raw`wcWidgetLabel\.textContent = \(?` + NW + String.raw`\)? \? \x60\$\{wc\} word\$\{wc !== 1 \? 's' : ''\}\x60 : \x60\$\{wc\} \/ \$\{canvasWordTarget\}\x60;`).test(JS),
    '#839: the diagnostic live updater keeps the pill target-free too (it would otherwise repaint "N / target" on every keystroke)');
// #447m's own gates (v7.20.594) — kept here so the whole set is in one place
ok(/countdownStart = \(isCwTask \|\| isExamPrep \|\| noDeadlinePhase \|\| \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \? null/.test(JS), '#447m: no deadline countdown');
ok(/if \(!_isLiveModel\) rightPanel\.appendChild\(timeWrap\);/.test(JS), '#447m: no Session timer in the rail');
ok(/if \(state\.task !== 'mastery_codex' && !_noWordTarget\(\)\) \{/.test(JS), '#447m: no word target in the rail on a live-modelling lesson');
ok(/_noWordTarget\(\) \? `<em>Word Count:<\/em> \$\{wc\}`/.test(JS) && /<em>Word Count:<\/em> \$\{_noWordTarget\(\) \? '—'/.test(JS), '#447m: the Score Summary shows a count with no "/ target" on a live-modelling lesson (live + template)');
ok((JS.match(/Section B \(writing\): \$\{_sectionBAdvice\(\)\}/g) || []).length === 2 && /^function _sectionBAdvice\(\) \{\s*if \(_noWordTarget\(\)\) return 'the board sets no word limit\.';/.test(fnBody('function _sectionBAdvice()')),
    '#861/#867b: both guide tips ask _sectionBAdvice(), which gives a live-modelling lesson no number');
ok(LM.test(JS.slice(JS.indexOf('_wnEssayDoc && !(WML.isLiveModelling'), JS.indexOf('_wnEssayDoc && !(WML.isLiveModelling') + 120)), '#447m: no "Your baseline" card for the author');

// ── #842 (v7.20.792): the read-only view FOLLOWS the author (Neil: "update by themselves") ──
const PHP = fs.readFileSync(path.join(ROOT, 'includes/class-rest-api.php'), 'utf8');
const tlc = PHP.slice(PHP.indexOf('public function tutor_load_canvas($request)'), PHP.indexOf('public function tutor_load_canvas_chat($request)'));
ok(/\$rev = md5\(/.test(tlc) && /hash_equals\(\$rev, \$since\)/.test(tlc) && /'unchanged' => true, 'rev' => \$rev/.test(tlc) && /'doc' => \$doc, 'attempt' => \$attempt, 'rev' => \$rev\]/.test(tlc),
    '#842: the review read carries a revision, and an unchanged document answers in a few bytes');
const tsl = fnBody('async function tryServerLoad()');
ok(/url = _reviewCanvasUrl\(\);/.test(tsl) && /_lmFollowStart\(res\);/.test(tsl), '#842: the first load and the follow use ONE review-URL builder, and the review load starts the follow');
const tick = fnBody('async function _lmFollowTick(f)');
ok(/document\.visibilityState === 'hidden' \|\| _lmSelectingIn\(root\)\) return;/.test(tick), '#842: never while the tab is hidden or the student is selecting words for their notes');
ok(/ed !== canvasEditor \|\| !root \|\| !document\.contains\(root\)/.test(tick) && /clearInterval\(f\.timer\)/.test(tick), '#842: stops by itself once its editor is gone (SPA move, re-render)');
ok(/'&since=' \+ encodeURIComponent\(f\.rev\)/.test(tick) && /res\.unchanged \|\| !res\.doc\)\) \{ f\.rev = res\.rev; f\.idle\+\+; return; \}/.test(tick), '#842: asks "anything new since rev?" and applies nothing when unchanged');
ok(/if \(f\.idle >= 15 && f\.n % 4\) return;/.test(tick) && /f\.idle = 0;/.test(tick), '#842: a page left open backs off to every 16 s after a minute with no change, and speeds up again on the next change');
ok(/_migrationActive = true;\s*try \{ ed\.commands\.setContent\(res\.doc\.html, false\); \}\s*finally \{ _migrationActive = false; \}/.test(tick), '#842: applies like the first load (structure lock passes under try/finally, no update event)');
ok(/const top = scroller \? scroller\.scrollTop : window\.scrollY;/.test(tick) && /scroller\.scrollTop = top; else window\.scrollTo\(window\.scrollX, top\);/.test(tick), '#842: the student keeps their place on the page');
ok(/function _localSaveDelay\(\) \{\s*if \(state\.reviewMode \|\| !\(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) return 2000;/.test(JS)
    && /return Math\.max\(0, Math\.min\(1000, 3000 - \(now - _lmLocalFirstPendingAt\)\)\);/.test(JS)
    && /_lmLocalFirstPendingAt = 0;\s*saveCanvasContent\(\);\s*saveStatus\.textContent = '✓ Saved';/.test(JS) && /\}, _localSaveDelay\(\)\);/.test(JS),
    '#842: the author\'s keystrokes are saved while they keep typing (1 s after a pause, never more than 3 s after the first unsaved one) — measured 0 saves in 11 s before');
ok(/return \(state\.reviewMode \|\| !\(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \? 5000 : 0;/.test(JS) && /\}, _serverSaveDelay\(\)\);/.test(JS),
    '#842: …and reach the server straight after; every other task keeps the 2 s / 5 s debounce');

// ── #846 (v7.20.796): the Notes tab shows on live-modelling lessons (Neil: "make the notes tab available as well") ──
ok(/function notesHiddenFor\(task\) \{\s*if \(isLiveModelling\(\)\) return false;\s*return \['diagnostic', 'mark_scheme'\]\.includes\(task\) \|\| cwToolsMinimal\(task\);\s*\}/.test(CORE)
    && /cwToolsMinimal, notesHiddenFor,/.test(CORE), '#846: ONE notes predicate in wml-core — live modelling first, then the test lessons + unaided CW steps');
const snHides = JS.split('\n').filter((l) => /\.sn-tab, \.sn-tab-trigger, #snTabTrigger/.test(l) && /display = 'none'/.test(l)).length;
const viaPred = (JS.match(/if \(WML\.notesHiddenFor\(state\.task\)\) \{/g) || []).length;
ok(snHides === 3 && viaPred === 3, '#846: every WML site that hides the notes tab (' + snHides + ') decides through WML.notesHiddenFor (' + viaPred + ')');
ok(!/\['diagnostic', 'mark_scheme'\]\.includes\(state\.task\)/.test(JS), '#846: no private copy of the notes deny-list left in wml-assessment.js');
const MAIN = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');
const emb = MAIN.slice(MAIN.indexOf('$embed_config = ['), MAIN.indexOf('];', MAIN.indexOf('$embed_config = [')));
ok(/'liveModelling' => !empty\(\$author_id\),/.test(emb), '#846: the per-lesson DOM config (data-swml-embed) carries liveModelling — the notes plugin reads that, not swmlConfig');

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
