#!/usr/bin/env node
/* eslint-env node */
/**
 * lit-plan-step-harness.js — v7.20.917: A LITERATURE PLAN'S STEP COMES FROM THE PLAN, NOT FROM REPLY WORDS.
 *
 * WHY THIS EXISTS
 * Neil, 16 Oct, reviewing Mehrish 1287's Macbeth planning: "Is it correct or is it not meant to be a little bit more
 * granular?" MEASURED: Sophia never writes [PROGRESS: N] in Literature planning (the router asks only Language papers
 * to), the step moved only when reply words matched the next sidebar label, and it was never saved — so after a reload
 * the router sent step 1 (the Setup slice, "Execute ONLY the part belonging to the current step") while she planned
 * Body Paragraph 1. Her real chat jumped back to "📌 Part B.1: Initial Setup" after the anchor quotes.
 *
 * WHAT IT CHECKS
 *   1. THE RULE — litPlanStageIndex / litPlanStepFor are EXTRACTED from the shipped file (between the
 *      @LIT-PLAN-STEP-PURE sentinels), never re-typed, and driven through Mehrish's shape (anchors filed, Body 1's
 *      elements filed, plan box not yet approved → step 4), an approval (→ Body 2), pins ahead of the filing, a
 *      stale backwards pin (ignored), every stage done, AQA Unseen's labels and an empty manifest.
 *   2. THE SERVER says which papers file the doc — from the protocol files, never a list: AQA Literature, AQA Unseen and
 *      Eduqas Literature true; Edexcel / OCR / CCEA / SQA / Eduqas Shakespeare false.
 *   3. THE WIRING — the router step for such a lesson uses the rule; the sidebar builds element rows for it; a planning
 *      chat saves its router step on the server and both pipelines restore it; a reviewer sees the outline; the
 *      Library pad's highlight uses the guide's notes menu; the per-request cost ledger is recorded and capped.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = read('frontend/wml-assessment.js');
const css = read('frontend/wml-canvas.css');
const rest = read('includes/class-rest-api.php');
const router = read('includes/class-protocol-router.php');
const core = read('frontend/wml-core.js');
const sb = read('frontend/wml-section-block.js');

let pass = 0, failN = 0;
function ok(cond, label, detail) {
    if (cond) { pass++; console.log('  ✓ ' + label); }
    else { failN++; console.log('  ✗ ' + label + (detail ? '  — ' + detail : '')); }
}

console.log('\n1. the rule (extracted from the shipped file)');
const a = js.indexOf('// @LIT-PLAN-STEP-PURE-BEGIN'), b = js.indexOf('// @LIT-PLAN-STEP-PURE-END');
ok(a > -1 && b > a, 'the pure block is marked in wml-assessment.js');
// eslint-disable-next-line no-new-func
const R = new Function(js.slice(a, b) + '\nreturn { LIT_PLAN_STAGES, litPlanStageIndex, litPlanStepFor, msaStepFromHistory };')();
const AQA = ['Setup, Goals & Diagnostic', 'Keyword Identification', 'Anchor Quote Selection', 'Body Paragraph 1',
    'Body Paragraph 2', 'Body Paragraph 3', 'Thesis & Introduction', 'Conclusion & Review'].map((l, i) => ({ step: i + 1, label: l }));
const UNSEEN = ['Setup & Goals', 'Diagnostic & Anchor Quotes', 'Body Paragraph 1', 'Body Paragraph 2', 'Body Paragraph 3',
    'Thesis & Introduction', 'Conclusion & Review', 'Q27.2 Comparison Planning'].map((l, i) => ({ step: i + 1, label: l }));
const F = (...ks) => ks.reduce((o, k) => { o[k] = true; return o; }, {});
const step = (fields, pins, steps) => R.litPlanStepFor(R.litPlanStageIndex(fields, pins), steps || AQA);

const mehrish = F('goal', 'kw-focus', 'anchor_quote_start', 'anchor_quote_mid', 'anchor_quote_end', 'outline-body-1-topic',
    'outline-body-1-evidence', 'outline-body-1-analysis', 'outline-body-1-effects', 'outline-body-1-effects2', 'outline-body-1-purpose');
const mehrishPins = ['📌 Planning > Part B.4: Quote Selection > Step 1 of 4', '📌 Planning > Part B.1: Initial Setup > Step 2 of 2',
    '📌 Planning > Part B.5: Body Paragraphs > Paragraph 1, Step 7 of 8'];
ok(step(mehrish, mehrishPins) === 4, "Mehrish's shape (Body 1 elements filed, plan box not approved) → step 4 Body Paragraph 1", 'got ' + step(mehrish, mehrishPins));
ok(step(mehrish, ['📌 Planning > Part B.1: Initial Setup > Step 2 of 2']) === 4, 'a stale Setup pin after the anchors never moves the step back');
ok(step({}, []) === 1, 'a fresh chat → step 1');
ok(step(F('goal', 'kw-focus'), []) === 1, 'goal + key words filed, no anchors yet → still step 1 (its slice carries keywords + diagnostic)');
ok(step(F('goal', 'kw-focus'), ['📌 Planning > Part B.4: Quote Selection > Step 1 of 4']) === 3, 'Sophia announces quote selection → step 3 before any quote is filed');
ok(step(F('anchor_quote_start'), []) === 3, 'a first anchor quote filed → step 3');
ok(step(F('anchor_quote_end'), []) === 4, 'the last anchor quote filed → Body Paragraph 1 (step 4)');
ok(step(Object.assign({}, mehrish, F('plan-body-1')), []) === 5, 'Body 1 approved (plan box filed) → Body Paragraph 2 (step 5)');
ok(step(F('outline-body-2-topic'), ['📌 Planning > Part B.5: Body Paragraphs > Paragraph 2, Step 3 of 8']) === 5, 'pin "Paragraph 2" → step 5');
ok(step(F('plan-body-1', 'plan-body-2', 'plan-body-3'), []) === 7, 'all three bodies approved → Thesis & Introduction (step 7)');
ok(step(F('outline-intro-hook'), ['📌 Planning > Part B.7: Introduction > Step 1 of 3']) === 7, 'introduction in progress → step 7');
ok(step(F('plan-intro', 'outline-conclusion-thesis'), []) === 8, 'conclusion in progress → step 8');
ok(step(F('plan-conclusion'), []) === 8, 'every stage done on AQA Literature → stays on its last step (8)');
ok(step(F('outline-body-1-topic'), [], UNSEEN) === 3, 'AQA Unseen labels: Body 1 → its step 3');
ok(step(F('anchor_quote_start'), [], UNSEEN) === 2, 'AQA Unseen: anchors → "Diagnostic & Anchor Quotes" (step 2)');
ok(step(F('plan-conclusion'), [], UNSEEN) === 8, 'AQA Unseen: conclusion approved → Q27.2 Comparison Planning (step 8)');
ok(step(F('outline-body-3-topic'), ['📌 Planning > Body 3 (Ending) > Step 3 of 7: Evidence'], UNSEEN) === 5, 'the "Body 3 (Ending)" pin format → Body 3');
{ const si = R.litPlanStageIndex(mehrish, mehrishPins);
  ok(R.litPlanStepFor(si, []) === 1 && R.litPlanStepFor(si, null) === 1 && R.litPlanStageIndex(null, null) === 0, 'no manifest list / no transcript → step 1, never a throw'); }

console.log('\n1b. a Mark Scheme Final Assessment sidebar comes back from the controller\'s own lines (Huzaifa 1411, review)');
const A = (t) => ({ role: 'assistant', content: t }), U = (t) => ({ role: 'user', content: t });
const qs = (n) => Array.from({ length: n }, (_, i) => [A('**Question ' + (i + 1) + ' of 10** …'), U('B')]).flat();
const h1411 = qs(10).concat([A('**Before I show your marks — predict your score.**'), A('You predicted **14/20**.'), A('**Assessment review — 7/10 correct** …'), A('**📋 Feedback** …'), A('**🎯 Action Plan** …'), A('**Now capture it in the document on the left (once).**')]);
ok(R.msaStepFromHistory(h1411) === 14, "Huzaifa's finished chat → Action Plan (14): every earlier step ticks", R.msaStepFromHistory(h1411));
ok(R.msaStepFromHistory(qs(4)) === 5, 'mid-quiz on Question 4 → step 5');
ok(R.msaStepFromHistory(qs(10).concat([A('**Assessment review — 9/10 correct**')])) === 12, 'results shown, no feedback yet → Results & Grade (12)');
ok(R.msaStepFromHistory(h1411.concat(qs(3))) === 4, 'a RE-SIT reads from its own Question 1 — never the old attempt\'s Action Plan');
ok(R.msaStepFromHistory([]) === 1 && R.msaStepFromHistory(null) === 1, 'an empty chat → Setup (1), never a throw');
ok((js.match(/if \(state\.task === 'mark_scheme'\) markerStep = Math\.max\(markerStep, msaStepFromHistory\(/g) || []).length === 2, 'BOTH pipelines restore it (dual pipeline)');

console.log('\n1c. ONE list decides which sections a student completes (the Mark Scheme 0-of-9 root, measured)');
{ const ca = core.indexOf('const TRACKED_SECTION_TYPES'), cb = core.indexOf('function smoothScrollTo(el, top)');
  // eslint-disable-next-line no-new-func
  const C = new Function(core.slice(ca, cb) + '\nreturn { TRACKED_SECTION_TYPES, isTrackedSectionType, sectionTextSaysNA };')();
  ok(C.isTrackedSectionType('mark_scheme_response') && C.isTrackedSectionType('notes') && C.isTrackedSectionType('plan') && !C.isTrackedSectionType('feedback') && !C.isTrackedSectionType('question'), 'the list: plan · response · outline · improvement · mark_scheme_response · notes');
  ok(C.sectionTextSaysNA(['N/A']) && C.sectionTextSaysNA(['n/a — first attempt']) && C.sectionTextSaysNA(['NA']) && !C.sectionTextSaysNA(['Not sure yet']) && !C.sectionTextSaysNA([]) && !C.sectionTextSaysNA(['N/A', 'my real answer']), '"N/A" (any case, with or without the slash) waives the AO multi-pick; anything else does not');
}
ok(/_tracked = \(window\.WML && typeof window\.WML\.isTrackedSectionType === 'function'\)/.test(sb) && /if \(!_secRO && _tracked\) \{/.test(sb), 'reader 1 (render-time nodeView) asks the one list');
ok(/if \(!WML\.isTrackedSectionType\(type\)\) return;/.test(js), 'reader 2 (checkSectionComplete) asks the one list');
ok(/if \(!_isRO && WML\.isTrackedSectionType\(s\.type\)\) \{/.test(js), 'reader 3 (getSectionIndicator — updateOutline stamps its answer LAST) asks the one list');
ok(/plainSel -= _multi\.length/.test(sb) && /plainSel -= emptyMulti/.test(js), 'the N/A waiver lives in both twins (nodeView + DOM check)');

console.log('\n2. the server says which papers file the doc (from the protocol files)');
let php = '';
try {
    const tmp = path.join(require('os').tmpdir(), 'lit-plan-docfiled-' + process.pid + '.php');
    fs.writeFileSync(tmp, `<?php
$src = file_get_contents(${JSON.stringify(path.join(ROOT, 'includes/class-protocol-router.php'))});
preg_match('/public static function manifest_files_body_elements\\(.*?\\n    \\}\\n/s', $src, $m);
eval('class T { ' . $m[0] . ' }');
foreach (glob(${JSON.stringify(path.join(ROOT, 'protocols'))} . '/*/*/manifest.json') as $p) {
  $man = json_decode(file_get_contents($p), true);
  if (empty($man['planning']['steps'])) continue;
  echo basename(dirname(dirname($p))) . '/' . basename(dirname($p)) . '=' . (T::manifest_files_body_elements($man['planning'], dirname($p)) ? 1 : 0) . "\\n";
}`);
    php = execFileSync('php', [tmp], { encoding: 'utf8' });
    fs.unlinkSync(tmp);
} catch (e) { php = 'ERROR ' + e.message; }
const df = {}; php.split('\n').forEach(l => { const m = /^(.+)=(\d)$/.exec(l.trim()); if (m) df[m[1]] = m[2] === '1'; });
['aqa/literature', 'aqa/unseen', 'eduqas/literature'].forEach(k => ok(df[k] === true, k + ' files each body element → doc-derived', php.slice(0, 80)));
['edexcel/shakespeare', 'edexcel-igcse/literature', 'eduqas/shakespeare', 'ocr/literature', 'ccea/prose', 'sqa/critical-reading']
    .forEach(k => ok(df[k] === false, k + ' does not → keeps its manifest list (and now a saved step)'));
ok(/'doc_filed'\s*=>\s*!empty\(\$result\['doc_filed'\]\)/.test(rest), '/protocol-steps returns doc_filed');

console.log('\n3. the wiring');
ok(/function _planDerivedSidebar\(\) \{\s*return state\.task === 'planning' && \(_planPreChainActive\(\) \|\| _poetryPlanActive\(\) \|\| _litPlanDocFiled\(\)\);/.test(js), 'a doc-filing Literature plan is a derived-sidebar lesson (no reply-word step detection)');
ok(/if \(_litPlanDocFiled\(\)\) \{\s*max = Math\.max\(max, litPlanStepFor\(litPlanStageIndex\(_planFiledFields\(history\), _planPins\(history\)\), state\.planManifestSteps\)\);/.test(js), 'its router step is the rule, never below the [PROGRESS] max');
ok(/state\.planDocFiled = false;[\s\S]{0,200}fetch\(stepsUrl/.test(js), 'the flag resets per lesson before the manifest fetch (no carry-over across lessons)');
ok(/data\.doc_filed === true\) \{\s*state\.planDocFiled = true;\s*_refreshPlanningSidebar\(\);\s*return;/.test(js), 'doc_filed → the derived sidebar paints, the manifest list does not');
ok(/const _poetryOutSecs = \(_poetryPlanActive\(\) \|\| _litPlanDocFiled\(\)\)/.test(js), 'Literature gets one row per filed outline element');
ok(/if \(_litPlanDocFiled\(\)\) \{[\s\S]{0,900}add\('Anchor quotes', 'Setup', anchorsDone\);/.test(js), 'Literature Setup rows: grade goal, key words, anchor quotes');
ok(/const _saveStep = state\.task === 'planning' \? _planRouterStep\(history\)/.test(js) && /state\.task === 'planning' \? \{ step: _saveStep \} : \{\}/.test(js), 'a planning chat sends its ROUTER step with every save');
ok(/\$plan_step = absint\(\$params\['step'\] \?\? 0\);\s*if \(\$plan_step > 0\) \$data\['step'\] = \$plan_step;/.test(rest), 'the server stores it with the chat');
ok((js.match(/state\.task === 'planning' && !_planPreChainActive\(\) && !_poetryPlanActive\(\) && savedChat\) \{\s*const _ss = parseInt\(savedChat\.step, 10\) \|\| 0;/g) || []).length === 2, 'BOTH pipelines restore the saved step on load (dual pipeline)');
ok(/_stageTask === 'planning' && state\.reviewMode \? ' swml-review-outline' : ''/.test(js) && /\.swml-stage-planning\.swml-review-outline \[data-section-type="outline"\] \{\s*display: block !important;/.test(css), 'a reviewer of a planning lesson sees the outline boxes');
ok(/if \(e\.target\.closest\('\.swml-library-pad \.swml-extract-panel-body'\)\) return;\s*dg = true;/.test(js), 'a press in the Library pad\'s reading area selects text instead of dragging the pad (it cancelled every selection)');
ok(/if \(_padZ >= 99995\) menu\.style\.zIndex = String\(_padZ \+ 1\);/.test(js), 'the notes menu opens ABOVE every open pad (it opened under the Library pad: 99995 vs 100010)');
ok(/if \(!state\.reviewMode\) \{\s*const _up = _notesSelUpHandler\(body\);/.test(js) && /const onUp = _notesSelUpHandler\(article\);/.test(js), "the Library pad's highlight uses the guide's one notes menu (not in review)");
ok(/\$this->record_usage_ledger_row\(\$args, \$model, \$act, \$u, \$cc, \$seen\);/.test(router) && /const USAGE_LEDGER_CAP = 1000;/.test(router) && /update_option\('swml_api_usage_ledger', \$led, false\)/.test(router) && /catch \(\\Throwable \$e\) \{ \/\* logging must never cost a reply \*\/ \}/.test(router), 'every request adds one capped, non-autoloaded ledger row and can never break a reply');

console.log(`\n${failN ? '✗' : '✓'} lit-plan-step-harness: ${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
