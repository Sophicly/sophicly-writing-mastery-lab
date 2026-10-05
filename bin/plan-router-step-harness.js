#!/usr/bin/env node
/* eslint-env node */
// plan-router-step-harness (v7.20.706) — the step the router is sent comes from the router's own signal.
//
// Measured defect (staging 59207, Edexcel IGCSE P2 planning, test student 1938, 2026-10-05): the lesson draws a
// DOC-DERIVED sidebar ("1 Introduction · 2 Body Paragraph 1 · …") while the router numbers the MANIFEST's steps
// ("1 Setup & Goals · 2 Q1: Pre-Planning & Text Type · …"). detectPlanningStep's keyword fallback matched the word
// "paragraph" in the key-words presentation against derived row 2, state.step went 1 → 2, and the next request loaded
// step 2's file under "earlier steps are already complete": the key-words save went unfiled, B.3 Planning Targets and
// B.4 Anchors were skipped. This harness slices the REAL predicate + _planRouterStep and drives them with that
// transcript, then checks the wiring statically (both canvas /chat bodies send it; the derived sidebar is never
// repainted with router numbers).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const slice = (re, name) => { const m = src.match(re); if (!m) { console.error('❌ plan-router-step-harness: cannot slice ' + name); process.exit(1); } return m[0]; };
const sb = { state: { task: 'planning', board: 'edexcel-igcse', subject: 'language_p2', step: 1 }, String, parseInt, Math };
vm.createContext(sb);
for (const [re, n] of [
  [/function _isLangPaper2\(\) \{[\s\S]*?\n    \}/, '_isLangPaper2'],
  [/function _isLangPaper1\(\) \{[\s\S]*?\n    \}/, '_isLangPaper1'],
  [/function _planPreChainActive\(\) \{[\s\S]*?\n    \}/, '_planPreChainActive'],
  [/function _poetryPlanActive\(\) \{[\s\S]*?\n    \}/, '_poetryPlanActive'],
  [/function _planDerivedSidebar\(\) \{[\s\S]*?\n    \}/, '_planDerivedSidebar'],
  [/function _planRouterStep\(history\) \{[\s\S]*?\n    \}/, '_planRouterStep'],
]) vm.runInContext(slice(re, n), sb);
const step = (h) => sb._planRouterStep(h);

let passed = 0, failed = 0;
const ok = (c, label, d) => { if (c) passed++; else { failed++; console.log('  ❌ ' + label + (d !== undefined ? ' — ' + d : '')); } };

// The REAL 59207 transcript shape (turn 7 carried [PROGRESS: 1]; turn 9 — the key-words presentation — carried none and
// said "paragraph"; turn 11 was the reply produced from the wrongly loaded step-2 file).
const T = [
  { role: 'user', content: "Let's begin!", hidden: true },
  { role: 'assistant', content: 'Hi Neil! Welcome to your planning session for Edexcel International GCSE English Language A, Paper 2.' },
  { role: 'user', content: 'Grade 8' }, { role: 'assistant', content: 'Good — noted. Now your **headline goal**' },
  { role: 'user', content: 'My headline goal: …' }, { role: 'assistant', content: 'Noted — your headline goal will thread through every question' },
  { role: 'user', content: 'My plan mode: Standard — key phrases' },
  { role: 'assistant', content: "Hi Neil! Your plans will be condensed… Which key words or concepts is it asking you to focus on?\n\n[PROGRESS: 1]" },
  { role: 'user', content: "present, Mrs Mallard's response, …" },
  { role: 'assistant', content: "That's a thorough list, Neil. You've picked out the question's own words and all three bullet points, so every quotation and paragraph can be tested against them.\n\n- present\n\nA) Save these key words\nB) Tweak them" },
];
sb.state.step = 2;   // what the derived sidebar / keyword fallback had written by then
ok(step(T) === 1, 'S1: REAL transcript — the key-words confirmation is routed to step 1 (b-goal), whatever the sidebar wrote into state.step', step(T));
ok(step(T.concat([{ role: 'user', content: 'A) Save these key words' }, { role: 'assistant', content: 'Saved!\n\n### B.3 Planning Targets…\n\n' }])) === 1,
   'S2: no marker yet → still step 1 (B.3 and B.4 live in b-goal)');
ok(step(T.concat([{ role: 'assistant', content: 'Before we plan your body paragraphs, let me confirm your text type.\n[PROGRESS: 2]' }])) === 2,
   'S3: the model reports step 2 → step 2');
ok(step(T.concat([{ role: 'assistant', content: '[PROGRESS: 3] body 1' }, { role: 'assistant', content: 'recap [PROGRESS: 2]' }])) === 3,
   'S4: the highest reported step wins (a recap that names an earlier step never rewinds)');
ok(step([]) === 1, 'S5: empty transcript (cleared chat) → step 1');
ok(step(T.concat([{ role: 'user', content: '[PROGRESS: 7] typed by a student' }])) === 1, 'S6: only the model\'s turns count');
sb.state.board = 'edexcel_igcse';
ok(step(T) === 1, 'S7: underscore board form → same routing (the predicate normalises it)');
sb.state.board = 'aqa'; sb.state.subject = 'poetry_anthology';
ok(step(T) === 1, 'S8: AQA poetry (8 sliced steps under the same predicate) → routed from the transcript too');
sb.state.subject = 'shakespeare'; sb.state.step = 4;
ok(step(T) === 4, 'S9: AQA Literature (manifest sidebar, not derived) → state.step unchanged (its fallback reads the manifest labels)');
sb.state.board = 'edexcel-igcse'; sb.state.subject = 'language_p2'; sb.state.task = 'assessment'; sb.state.step = 6;
ok(step(T) === 6, 'S10: assessment → state.step unchanged');
sb.state.task = 'planning';

// Wiring, statically: both canvas /chat bodies send the router step; the derived sidebar is never repainted by router numbers.
const sends = (src.match(/step: _planRouterStep\(canvasChatHistory\),/g) || []).length;
ok(sends === 2, 'W1: both canvas /chat request bodies send _planRouterStep(canvasChatHistory)', sends);
ok(/if \(_planDerivedSidebar\(\)\) \{\s*_refreshPlanningSidebar\(\);\s*\} else if \(state\.task === 'planning' \|\| state\.task === 'polishing'\) \{\s*const planStep = detectPlanningStep\(/.test(src),
   'W2: on a derived sidebar the reply never moves the step by keyword, and updateProgress never paints router numbers onto its rows');

// D. The predicate's PRECONDITION, mechanical: _buildPlanningSidebarModel says "De-stitched planning ONLY — sliced papers
// still advance their manifest steps via [PROGRESS: N] tags, and this model's numbering would fight them." It was widened
// past that twice without de-stitching (AQA poetry v7.20.256, Edexcel IGCSE P2 v7.20.704). Every manifest a planning lesson
// can route to is evaluated against the REAL predicate: if the derived sidebar serves it, its planning.steps must be empty
// (the router's own de-stitch signal), unless named below with the reason it is tracked.
const KNOWN_SLICED = {
  'aqa/poetry': 'sliced under the derived predicate since v7.20.256; router step comes from the model\'s [PROGRESS] (v7.20.706); de-stitch tracked in wml-FIXLIST #722 (no poetry planning session exists on prod or staging)',
};
const protoRoot = path.join(__dirname, '..', 'protocols');
let derivedSeen = 0;
for (const board of fs.readdirSync(protoRoot)) {
  const bd = path.join(protoRoot, board);
  if (board === 'shared' || !fs.statSync(bd).isDirectory()) continue;
  for (const subj of fs.readdirSync(bd)) {
    const mf = path.join(bd, subj, 'manifest.json');
    if (!fs.existsSync(mf)) continue;
    let plan; try { plan = JSON.parse(fs.readFileSync(mf, 'utf8')).planning; } catch (e) { continue; }
    if (!plan) continue;
    const cands = [subj, subj.replace(/^language(\d)$/, 'language_p$1'), subj === 'poetry' ? 'poetry_anthology' : null].filter(Boolean);
    const derived = [board, board.replace(/-/g, '_')].some(b => cands.some(c => {
      sb.state = { task: 'planning', board: b, subject: c, step: 1 }; return sb._planDerivedSidebar();
    }));
    if (!derived) continue;
    derivedSeen++;
    const key = board + '/' + subj;
    const sliced = plan.steps && Object.keys(plan.steps).length > 0;
    ok(!sliced || KNOWN_SLICED[key], `D1: ${key} is served by the derived sidebar, so its planning must be de-stitched (empty planning.steps)`,
       sliced ? Object.keys(plan.steps).length + ' sliced steps' : '');
    if (sliced && KNOWN_SLICED[key]) console.log(`  ⚠ known debt — ${key}: ${KNOWN_SLICED[key]}`);
  }
}
ok(derivedSeen >= 4, 'D2: the predicate admits the expected papers (AQA P1, AQA P2, AQA poetry, Edexcel IGCSE P2)', derivedSeen);

// P. The chain's prediction stages come from ONE per-paper list (v7.20.710). Sliced with _planChainSourceCount (its
// document reads stubbed per fixture) so the real list logic runs. IGCSE P1 carries two source sections (Text One and
// Text Two) but asks ONE prediction — on the unseen Text One — which is exactly what a source-count rule got wrong.
for (const [re, n] of [
  [/function _planChainPredictsSources\(\) \{[\s\S]*?\n    \}/, '_planChainPredictsSources'],
  [/function _planChainSourceCount\(\) \{[\s\S]*?\n    \}/, '_planChainSourceCount'],
  [/function _planIsIgcseP1\(\) \{[\s\S]*?\n    \}/, '_planIsIgcseP1'],
  [/function _planChainPreds\(\) \{[\s\S]*?\n    \}/, '_planChainPreds'],
]) vm.runInContext(slice(re, n), sb);
const withDoc = (sources, loaded) => { sb.document = { querySelectorAll: () => ({ length: sources }), querySelector: () => (loaded ? {} : null) }; };
const preds = (board, subject, sources, loaded) => { sb.state = { task: 'planning', board, subject, step: 1 }; withDoc(sources, loaded !== false); return sb._planChainPreds().join(','); };
ok(preds('aqa', 'language_p2', 2) === 'predQ,predA,predB', 'P1: AQA P2 → the paper, Source A, Source B', preds('aqa', 'language_p2', 2));
ok(preds('aqa', 'language_p1', 1) === 'predQ,predA', 'P2: AQA P1 → the paper, Source A', preds('aqa', 'language_p1', 1));
ok(preds('edexcel-igcse', 'language_p1', 2) === 'predA', 'P3: Edexcel IGCSE P1 → ONE prediction, on the unseen Text One (ruling v7.20.67), despite two source sections', preds('edexcel-igcse', 'language_p1', 2));
ok(preds('edexcel_igcse', 'language_p1', 2) === 'predA', 'P4: underscore board form → the same single prediction');
ok(preds('edexcel-igcse', 'language_p2', 1) === '', 'P5: Edexcel IGCSE P2 (a studied text) → no predictions');
ok(preds('aqa', 'language_p2', 0, true) === '', 'P6: a loaded writing-only document (no source) → no predictions');
const chainSrc = src;
ok(/fid = _planIsIgcseP1\(\) \? 'pred-unseen' : 'pred-source-a'/.test(chainSrc), 'P7: the Text One prediction files into IGCSE P1\'s own box (pred-unseen)');
ok((chainSrc.match(/give \(\?:them\|it\) a quick once-over\/i\.test\(t\)\) pending = 'tidy'/g) || []).length === 2, 'P8: both pipelines detect the singular tidy card ("give it a quick once-over") — byte-pair with the card text');

// H. A WIDENED predicate wakes every consumer — paper-specific ones must check the paper. Measured on staging 59205
// (v7.20.710): _healP2Q4ComparativePlan (AQA P2's Q4 is the comparison) ran on Edexcel IGCSE P1 once P1 joined
// _planPreChainActive, and rewrote its three Q4 paragraph boxes into a comparative intro/bodies/conclusion. Sliced and
// run with a fake editor: IGCSE P1 must be left alone; AQA P2's legacy shape must still be reshaped.
vm.runInContext(slice(/function _healP2Q4ComparativePlan\(\) \{[\s\S]*?\n    \}/, '_healP2Q4ComparativePlan'), sb);
let healCalls = 0;
sb.document = { createElement: () => ({ innerHTML: '' }) };
sb._swapLegacyQ4Plan = () => { healCalls++; return 0; };
sb.saveCanvasContent = () => {};
sb.console = { log() {}, warn() {} };
sb.canvasEditor = { getHTML: () => '<div data-field-id="plan-Q4-para-1"></div><div data-field-id="plan-Q4-para-2"></div>', commands: { setContent() {} } };
sb.state = { task: 'planning', board: 'edexcel-igcse', subject: 'language_p1', step: 1 }; healCalls = 0; sb._healP2Q4ComparativePlan();
ok(healCalls === 0, 'H1: Edexcel IGCSE P1 (Q4 = single-text analysis) — the AQA P2 comparative Q4 heal never touches its paragraph plan');
sb.state = { task: 'planning', board: 'aqa', subject: 'language_p2', step: 1 }; healCalls = 0; sb._healP2Q4ComparativePlan();
ok(healCalls === 1, 'H2: AQA P2 legacy Q4 paragraph plan → still reshaped to the comparative plan');
sb.state = { task: 'planning', board: 'aqa', subject: 'language_p1', step: 1 }; healCalls = 0; sb._healP2Q4ComparativePlan();
ok(healCalls === 0, 'H3: AQA P1 (Q4 = evaluation) → untouched');

// G. The Q-GATE continue chip in a PLANNING session (v7.20.712): the shared confirm bar sent the assessment directive
// "emit the @REFLECT_GATE panel" at every planning gate; at Section B on staging 59205 the model obeyed and left nothing to
// answer. The planning branch must exist, come first, and forbid the panel; the loop-breaker must never fire in planning.
const cb = (src.match(/function _buildAssessConfirmBar\(nextLabel\) \{[\s\S]*?\n        \}\n/) || [""])[0];
const planBranch = (cb.match(/state\.task === 'planning'\s*\?\s*`([^`]*)`/) || [])[1] || "";
ok(planBranch && /lead-in/.test(planBranch) && /never emit @REFLECT_GATE/.test(planBranch) && !/emit the @REFLECT_GATE panel/.test(planBranch),
   'G1: the planning gate-continue directive starts the next question\x27s lead-in and forbids the reflection panel');
ok(/const _loopParams = \(_isLit && state\.task !== 'planning'\)/.test(src), 'G2: the gate loop-breaker never renders an assessment reflection panel in planning');

console.log(`— PLAN ROUTER STEP: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ plan-router-step-harness FAILED'); process.exit(1); }
console.log('✅ plan-router-step-harness passed (the router is sent the step the model reported, never a sidebar row number).');
