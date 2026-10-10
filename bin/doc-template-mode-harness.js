#!/usr/bin/env node
/* eslint-env node */
// doc-template-mode-harness.js — v7.20.807 (FIXLIST #861/#862).
//
// (1) #862 — Neil, 10 Oct: "diagnostics should always have planning and response area for both language
//     and literature". Every builder emits ESSAY PLAN + RESPONSE for a diagnostic (PEDAGOGY §6/§6b); the plan
//     was lost when the TEMPLATE MODE resolved to `exam_practice` (question + response, no plan by design).
//     Two hand-kept mirrors chose that whenever state.mode === 'exam_prep' — which tutor review mode and the
//     standalone deep link set for a NUMBERED-TOPIC diagnostic. Measured on prod: the only two plan-less
//     diagnostic docs of ~95 were saved through the deep link; Neil's view_as screen built one live.
//     Gate: ONE resolver, driven here with the real states those entry paths produce.
// (2) #861 — card 12: Edexcel IGCSE Language sets no word limit. Every file a student session loads for
//     those papers must carry no minimum, no target number, no word-count penalty and no length halt.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const JS = read('frontend/wml-assessment.js');
const APP = read('frontend/wml-app.js');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

// Brace-matched source of a module-scope function (4-space indent in wml-assessment.js).
function fnSrc(sig) {
    const a = JS.indexOf(sig);
    if (a < 0) return '';
    let d = 0;
    for (let i = JS.indexOf('{', a); i < JS.length; i++) {
        if (JS[i] === '{') d++;
        else if (JS[i] === '}' && --d === 0) return JS.slice(a, i + 1);
    }
    return '';
}

// ── (1) the ONE template-mode resolver ──
const RES = fnSrc('function _docTemplateMode()');
ok(!!RES, '#862: _docTemplateMode() exists');
let resolve = null;
try { resolve = new Function('state', RES + '\nreturn _docTemplateMode();'); } catch (e) { ok(false, '#862: resolver compiles — ' + e.message); }
const CASES = [
    [{ mode: 'exam_prep', topicNumber: 1 }, 'diagnostic', 'tutor review mode on a Topic 1 diagnostic (wml-app.js sets exam_prep, keeps the topic)'],
    [{ mode: 'exam_prep', topicNumber: '4' }, 'diagnostic', 'standalone deep link …&topic=4&task=diagnostic (topic arrives as a string)'],
    [{ mode: 'exam_prep', topicNumber: 2023061 }, 'diagnostic', 'a Live Modelling past paper opened by its deep link'],
    [{ mode: 'guided', topicNumber: 1, phase: 'initial' }, 'diagnostic', 'the embedded lesson (bridge phase=initial + topic)'],
    [{ mode: 'exam_prep', topicNumber: 0 }, 'exam_practice', 'FREE practice — no topic — keeps question + response only'],
    [{ mode: 'exam_prep' }, 'exam_practice', 'free practice with no topic set at all'],
    [{ mode: 'exam_prep', topicNumber: 3, phase: 'redraft' }, 'redraft', 'a redraft phase wins'],
    [{ mode: 'guided', topicNumber: 1, draftType: 'plan_redraft' }, 'redraft', 'a redraft draftType wins'],
];
for (const [st, want, why] of CASES) {
    let got = '';
    try { got = resolve ? resolve(st) : ''; } catch (e) { got = 'THREW ' + e.message; }
    ok(got === want, `#862: ${why} → ${want}${got === want ? '' : ` (got ${got})`}`);
}
const mirrors = (JS.match(/\bmode = 'exam_practice'/g) || []).length;
ok(mirrors === 0, `#862: no hand-kept mirror assigns 'exam_practice' outside the resolver (found ${mirrors})`);
const calls = (JS.match(/const mode = _docTemplateMode\(\);/g) || []).length;
ok(calls >= 2, `#862: tryTopicTemplate AND the plan backfill both resolve through it (${calls} call sites)`);
// The entry paths that produced the bug still set exam_prep with a topic — the resolver must be what
// saves them, so prove the premise is still real (if it ever stops being true, this check says so).
ok(/if \(state\.reviewMode && state\.board && state\.text\) \{\s*state\.mode = 'exam_prep';/.test(APP),
    '#862: premise still holds — review mode sets exam_prep (the resolver, not the entry path, keeps the plan)');
const diagBranch = /if \(mode === 'diagnostic'\) \{\s*\/\/ v7\.14\.78[^\n]*\n\s*html \+= dividerHTML\('ESSAY PLAN'\);\s*html \+= buildPlanSection\(null, marks\);\s*html \+= dividerHTML\('RESPONSE'\);/;
ok(diagBranch.test(JS), '#862: the single-essay diagnostic template is ESSAY PLAN then RESPONSE (PEDAGOGY §6b: write cold = plan + response)');

// ── (2) Edexcel IGCSE Language: no word limit anywhere a session loads ──
const IGCSE_FILES = [
    'protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md',
    'protocols/edexcel-igcse/language1/modules/knowledge-mark-scheme.md',
    'protocols/edexcel-igcse/language1/modules/knowledge-hub.md',              // loaded by the P1 polishing environment
    'protocols/edexcel-igcse/language1/planning/protocol-b-planning.md',
    'protocols/edexcel-igcse/language1/planning/b-ladder.md',
    'protocols/edexcel-igcse/language2/modules/assessment-section-a.md',
    'protocols/edexcel-igcse/language2/modules/assessment-section-b.md',
    'protocols/edexcel-igcse/language2/modules/foundation.md',
    'protocols/shared/modules/rubrics/rubric-edexcel-igcse-lang-p1-nonfiction.md',
    'protocols/shared/modules/rubrics/rubric-edexcel-igcse-lang-p2-anthology.md',
];
const BAD = [
    [/minimum (?:of )?\d{3} words/i, 'a word minimum'],
    [/\d{3}-word (?:target|minimum|cap|ceiling)/i, 'a word target'],
    [/\btarget is \d{3} words/i, 'a word target'],
    [/\b\d{3}\+ words/i, 'an "N+ words" demand'],
    [/halt and request (?:expansion|completion)/i, 'a length halt'],
    [/ROUND\(\(\d{3}\s*-\s*word/i, 'a word-count penalty formula'],
    [/\/\s*\d{3} target/i, 'an "X / N target" line'],
];
for (const f of IGCSE_FILES) {
    let src = '';
    try { src = read(f); } catch (e) { ok(false, `#861: ${f} exists`); continue; }
    const hits = [];
    for (const [re, what] of BAD) { const m = src.match(re); if (m) hits.push(`${what}: "${m[0]}"`); }
    ok(hits.length === 0, `#861: ${f.replace('protocols/', '')} — no word limit${hits.length ? ' — FOUND ' + hits.join('; ') : ''}`);
}
const ROUTER = read('includes/class-protocol-router.php');
ok(/\(\$context\['board'\] \?\? ''\) === 'edexcel-igcse' && preg_match\('\/\^lang\/i'[^\n]*\n\s*\$wc_target = 0;/.test(ROUTER),
    '#861: the router never hands Sophia a "Minimum Word Count" on Edexcel IGCSE Language');

// ── (3) #867b — Neil, 10 Oct: "Show an advice number". ADVICE on screen, per question (the AQA shape), while the
//     protocols above stay number-free and the router keeps $wc_target = 0 (no ceiling, halt or penalty). ──
const TABLE_SRC = (JS.match(/const MULTIQ_RESPONSE_TARGETS = (\{[\s\S]*?\n {4}\});/) || [])[1] || '';
let TABLE = null;
try { TABLE = new Function('return ' + TABLE_SRC)(); } catch (e) { ok(false, '#867b: MULTIQ_RESPONSE_TARGETS evaluates — ' + e.message); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
ok(!!TABLE && same(TABLE['edexcel-igcse|lang_a_paper_1'], { Q1: 20, Q2: 80, Q3: 100, Q4: 510, Q5: 610, Q6: 650 }),
    '#867b/#871: IGCSE Paper 1 advice per question at 170 words a TTECEA paragraph — Q1 20 · Q2 80 · Q3 100 · Q4 510 · Q5 610 · Q6 650');
ok(!!TABLE && same(TABLE['edexcel-igcse|lang_a_paper_2'], { Q1: 650, Q2: 450 }),
    '#867b: IGCSE Paper 2 advice — Q1 essay 650 · Section B (box Q2) 450');
ok(!!TABLE && same(TABLE['aqa|lang_paper_2'], { Q1: 0, Q2: 200, Q3: 360, Q4: 460, Q5: 650 }) && same(TABLE['aqa|lang_paper_1'], { Q1: 20, Q2: 240, Q3: 240, Q4: 460, Q5: 650 }),
    '#890: the AQA rows at ~120 words a TTECEA paragraph (Neil, Actions round k) — P1 Q2/Q3 240 · Q4 460; P2 Q3 360 · Q4 460');
const KEYFN = [fnSrc('function _isLangPaper1()'), fnSrc('function _isLangPaper2()'), fnSrc('function _multiqTargetKey()')].join('\n');
let keyOf = null;
try { keyOf = new Function('state', KEYFN + '\nreturn _multiqTargetKey();'); } catch (e) { ok(false, '#867b: _multiqTargetKey compiles — ' + e.message); }
const KEYCASES = [
    [{ board: 'edexcel-igcse', subject: 'language_p1', text: 'edexcel_igcse_lang_a' }, 'edexcel-igcse|lang_a_paper_1', 'the real staging P1 diagnostic (53101: subject language_p1)'],
    [{ board: 'edexcel-igcse', subject: 'language2', text: 'edexcel_igcse_lang_a_paper_2' }, 'edexcel-igcse|lang_a_paper_2', 'the P2 deep link (subject language2)'],
    [{ board: 'edexcel-igcse', subject: 'language1', text: 'edexcel_igcse_lang_b' }, null, 'a Spec B text never borrows Spec A\'s questions'],
    [{ board: 'edexcel-igcse', subject: 'heritage', text: 'macbeth' }, null, 'an IGCSE Literature essay keeps its marks-table target'],
    [{ board: 'aqa', subject: 'language2', text: 'aqa_lang_paper_2' }, 'aqa|lang_paper_2', 'AQA Paper 2 unchanged'],
    [{ board: 'edexcel', subject: 'language1', text: 'edexcel_lang_paper_1' }, null, 'Edexcel GCSE unchanged (no row)'],
];
for (const [st, want, why] of KEYCASES) {
    let got;
    try { got = keyOf ? keyOf(st) : 'NO FN'; } catch (e) { got = 'THREW ' + e.message; }
    ok(got === want, `#867b: ${why} → ${want}${got === want ? '' : ` (got ${got})`}`);
}
let advice = null;
try { advice = new Function('state', 'WML', 'MULTIQ_RESPONSE_TARGETS', KEYFN + '\n' + fnSrc('function _noWordTarget()') + '\n' + fnSrc('function _sectionBAdvice()') + '\nreturn _sectionBAdvice();'); }
catch (e) { ok(false, '#867b: _sectionBAdvice compiles — ' + e.message); }
const ADVCASES = [
    [{ board: 'edexcel-igcse', subject: 'language_p1', text: 'edexcel_igcse_lang_a' }, false, 'the board sets no word limit; we suggest about 650 words.', 'IGCSE P1 tip: no board limit, then our 650 for Q6'],
    [{ board: 'edexcel-igcse', subject: 'language2', text: 'edexcel_igcse_lang_a_paper_2' }, false, 'the board sets no word limit; we suggest about 450 words.', 'IGCSE P2 tip: no board limit, then our 450 for Section B'],
    [{ board: 'aqa', subject: 'language1', text: 'aqa_lang_paper_1' }, false, 'aim for ~650 words.', 'AQA tip unchanged'],
    [{ board: 'edexcel-igcse', subject: 'language_p1', text: 'edexcel_igcse_lang_a' }, true, 'the board sets no word limit.', 'a live-modelling lesson still shows no number (#447m)'],
];
for (const [st, live, want, why] of ADVCASES) {
    let got;
    try { got = advice ? advice(st, { isLiveModelling: () => live }, TABLE) : 'NO FN'; } catch (e) { got = 'THREW ' + e.message; }
    ok(got === want, `#867b: ${why}${got === want ? '' : ` (got "${got}")`}`);
}
ok(!/edexcel-igcse/.test(fnSrc('function _noWordTarget()')), '#867b: _noWordTarget() is live modelling only — IGCSE Language shows its advice');

console.log((fail ? '❌ FAIL' : '✅ PASS') + ` — doc-template-mode-harness: ${n} checks`);
process.exit(fail);
