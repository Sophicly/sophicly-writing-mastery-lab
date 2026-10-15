#!/usr/bin/env node
/* eslint-env node */
/**
 * poetry-opening-resume-harness.js — v7.20.896 (WML 360 A; Neil 15 Oct: "make sure that's actually working" — Shayaan 1397,
 * AQA Power and Conflict planning).
 *
 * MEASURED on staging in Shayaan's exact prod state: his saved planning chat is the hidden "Let's begin!" + the greeting
 * that ends "Choose the poem to compare it with:" (10 Oct, he never picked). A reload replayed that question with NO
 * buttons — the poem picker is screen-only, and the load-time resume (_poetryResumeCodeTurn) re-offered teaching
 * sequences and feedback acks only. The level pick that follows had the same gap. Root §4d: a question with nothing to
 * press is a dead screen to a fourteen-year-old.
 *
 * What it proves, from the SHIPPED code:
 *   A. DECISION — _poetryOpeningReofferFor + the real stage machine (_poetryPlanStageFor and its readers), executed:
 *                 Shayaan's exact history re-offers the poem pick; a fresh lesson re-offers nothing (the boot send
 *                 renders the greeting — a re-offer there would double it); the level pick is re-offered once asked
 *                 and not before; a tentative pick, a set goal and the keyword stage re-offer nothing.
 *   B. WIRING   — the resume calls the decision for both picks, guards against a second button bar, reuses the
 *                 picker's designed resume branch, re-attaches the level buttons to the replayed question, saves nothing.
 *   C. FALSIFY  — four mutations each fail A or B.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

// A module-scope function: from "    function NAME(" to its closing "\n    }\n" (a one-liner ends on its own line).
function fnSrc(src, name) {
    const a = src.indexOf('\n    function ' + name + '(');
    if (a < 0) throw new Error('missing function ' + name);
    const start = a + 1;
    const firstLineEnd = src.indexOf('\n', start);
    if (/\}\s*$/.test(src.slice(start, firstLineEnd))) return src.slice(start, firstLineEnd);
    return src.slice(start, src.indexOf('\n    }\n', start) + 6);
}
const NAMES = ['_planChainNorm', '_poetryPlanActive', '_poetryComparisonId', '_poetryGoalFromHistory', '_poetryKeywordAsked',
    '_lastPoemMarker', '_poetryTentativeComparison', '_poetryPlanStageFor', '_poetryOpeningReofferFor'];
function load(src) {
    const ctx = { state: { task: 'planning', board: 'aqa', subject: 'poetry_anthology' } };
    vm.createContext(ctx);
    vm.runInContext(NAMES.map((nm) => fnSrc(src, nm)).join('\n') + '\nthis.F = { _poetryOpeningReofferFor, _poetryPlanStageFor };', ctx);
    return ctx.F;
}

// Real shapes. GREET = Shayaan 1397's saved chat on prod, verbatim (read 15 Oct): code-generated text, no student words.
const BOOT = { role: 'user', content: "Let's begin!", preChain: true, hidden: true };
const GREET = { role: 'assistant', content: "We're planning your comparison of Ozymandias for: Compare how poets present ideas about power in 'Ozymandias' and one other poem from the Power and Conflict anthology.\n\n[30 marks]. Choose the poem to compare it with:" };
const TENT = { role: 'user', content: '@COMPARISON_TENTATIVE{"id":"london","title":"London"}', preChain: true, hidden: true };
const COMMIT = { role: 'user', content: '@COMPARISON_POEM{"id":"london","title":"London"}', preChain: true, hidden: true };
const GOALQ = { role: 'assistant', content: 'Great — planning Ozymandias against London. What AQA Level are you aiming for?' };
const GOAL = { role: 'user', content: '@GOAL{"level":"Level 5","skill":"Zoom into specific words for AO2","goal":"Level 5 — Zoom into specific words for AO2"}', preChain: true, hidden: true };
const KWQ = { role: 'assistant', content: 'Now, looking at the question — what are the key words you need to answer?' };

const CASES = [
    ["Shayaan's exact saved chat (greeting, never picked) → re-offer the poem pick", [BOOT, GREET], 'pgreet'],
    ['a fresh lesson (nothing saved) → nothing (the boot send renders the greeting)', [], null],
    ['boot sent, greeting not yet rendered → nothing (no doubled greeting)', [BOOT], null],
    ['poem picked, justification pending → nothing (a typed answer stands)', [BOOT, GREET, TENT], null],
    ['poem committed, level question not yet asked → nothing', [BOOT, GREET, TENT, COMMIT], null],
    ['level question asked, not answered → re-offer the level pick', [BOOT, GREET, TENT, COMMIT, GOALQ], 'pgoal'],
    ['goal set → nothing', [BOOT, GREET, TENT, COMMIT, GOALQ, GOAL], null],
    ['keyword question asked → nothing (a typed answer stands)', [BOOT, GREET, TENT, COMMIT, GOALQ, GOAL, KWQ], null],
];
function run(F, quiet) {
    const bad = [];
    for (const [label, hist, want] of CASES) {
        const got = F._poetryOpeningReofferFor(hist);
        if (got !== want) bad.push(label + ' → ' + got);
        if (!quiet) ok(got === want, label + (got === want ? '' : '  GOT ' + got));
    }
    return bad;
}

console.log('A. decision, executed on the real stage machine');
const F = load(JS0);
run(F, false);
ok(F._poetryPlanStageFor([BOOT, GREET]) === 'pgreet', "the stage machine itself puts Shayaan's chat at the poem pick");

console.log('B. wiring');
const resume = fnSrc(JS0, '_poetryResumeCodeTurn');
ok(/const pick = _poetryOpeningReofferFor\(ctx\.history\);/.test(resume), 'the load-time resume asks the decision');
ok(/if \(pick === 'pgreet'\) \{[\s\S]{0,260}if \(!ctx\.chatMessages\.querySelector\('\.swml-cmp-chip-bar'\)\) _renderPoetryPlanQuestion\('pgreet', ctx\);[\s\S]{0,40}return true;/.test(resume),
    'the poem pick: re-offered through the picker\'s own resume branch, never a second bar');
ok(/if \(pick === 'pgoal'\) \{\s*if \(!ctx\.chatMessages\.querySelector\('\.swml-pgoal-bar'\)\) _reofferPoetryGoalChips\(ctx\);\s*return true;/.test(resume),
    'the level pick: re-offered, never a second bar');
const render = fnSrc(JS0, '_renderPoetryPlanQuestion');
ok(/if \(!already\) \{\s*ctx\.history\.push/.test(render), 'the picker\'s resume branch (greeting already saved) saves nothing new');
const reoffer = fnSrc(JS0, '_reofferPoetryGoalChips');
ok(/what aqa level are you aiming for/i.test(reoffer) && /_appendPoetryGoalChips\(/.test(reoffer) && !/history\.push|recordTurn|saveCanvasChat/.test(reoffer),
    'the level buttons re-attach to the replayed question, screen only — nothing saved, so nothing can go stale');
ok(/className: 'swml-quick-actions swml-pgoal-bar'/.test(fnSrc(JS0, '_appendPoetryGoalChips')), 'the level button bar carries the class the guard checks');
ok((JS0.match(/window\.__swmlPoetrySeqResume = function \(\) \{\s*_poetryResumeCodeTurn\(\{/g) || []).length === 2, 'both chat pipelines route their resume through _poetryResumeCodeTurn');
ok(/if \(_poetryPlanActive\(\)\) \{\s*setTimeout\(\(\) => \{ try \{ if \(window\.__swmlPoetrySeqResume\) window\.__swmlPoetrySeqResume\(\); \} catch \(_\) \{\} \}, 400\);/.test(JS0),
    'the restore block calls the resume after the replay');

console.log('C. falsify — each mutation must break A or B');
const MUT = [
    ['no "already asked" guard (a fresh lesson would double the greeting)', (s) => s.replace('return asked ? st : null;', 'return st;')],
    ['the level pick dropped', (s) => s.replace("if (st !== 'pgreet' && st !== 'pgoal') return null;", "if (st !== 'pgreet') return null;")],
    ['the poem pick dropped', (s) => s.replace("if (st !== 'pgreet' && st !== 'pgoal') return null;", "if (st !== 'pgoal') return null;")],
    ['the resume never asks', (s) => s.replace('const pick = _poetryOpeningReofferFor(ctx.history);', 'const pick = null;')],
];
for (const [label, mut] of MUT) {
    const src = mut(JS0);
    if (src === JS0) { ok(false, 'mutation did not apply: ' + label); continue; }
    let bad = [];
    try { bad = run(load(src), true); } catch (e) { bad = ['threw ' + e.message]; }
    const wired = /const pick = _poetryOpeningReofferFor\(ctx\.history\);/.test(fnSrc(src, '_poetryResumeCodeTurn'));
    ok(bad.length > 0 || !wired, 'mutation caught: ' + label + (bad.length ? ' (' + bad.length + ' case' + (bad.length === 1 ? '' : 's') + ' fail)' : !wired ? ' (wiring check fails)' : ' — NOT CAUGHT'));
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
