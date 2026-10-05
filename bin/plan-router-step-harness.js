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

console.log(`— PLAN ROUTER STEP: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ plan-router-step-harness FAILED'); process.exit(1); }
console.log('✅ plan-router-step-harness passed (the router is sent the step the model reported, never a sidebar row number).');
