#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-final-gate.js — STATIC + EXECUTED gate for the CW Final Assessment (v7.20.844, FIXLIST #884-⑦, PEDAGOGY §33.6;
 * plan CW-FINAL-ASSESSMENT-PLAN-2026-10-12.md). The behaviour is proven by bin/cw-final-sim-harness.js; this proves the
 * chain AROUND the walk exists and agrees with itself — the layers a sim cannot see.
 *
 *  1. ⭐ ONE lesson entry, unnumbered, between Step 30 and Step 31, NAMING what it marks (assesses: 30 → final_draft).
 *     The walk-back (cwTrialSource's rule) would find Draft 7 — the story BEFORE the SPAG polish (plan D14). Executed.
 *  2. ⭐ ONE task id. Every CW_STEPS entry round-trips through cwTaskFor → getCwStepDef (executed, all of them), and the
 *     server's constant equals the client's byte for byte (§5d key-match).
 *  3. ⭐ The SIX name sites read one predicate per language — no spelled-out task name survives at any of them.
 *  4. ⭐ The protocol and the parser agree: the protocol's own marker template, filled in, parses and resolves through
 *     the real parser; the protocol repeats no descriptor (WML §5) and names no board (§33.3).
 *  5. ⭐ The page builds exactly the rows the walk writes (executed page builders vs the walk's field ids, §5d).
 *  6. The seven wiring points name the controller (the .490 incident: a walk missing one ships DEAD, and silently).
 *  7. The shared ladder's host hooks exist and the Language host is left on its old path (no hostOwnsWrap there).
 *  8. The data it marks against exists, with the maxima the page and the walk read (never typed).
 *
 * Usage: node bin/cw-final-gate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const CORE = read('frontend/wml-core.js');
const SRC = read('frontend/wml-assessment.js');
const APP = read('frontend/wml-app.js');
const ROUTER = read('includes/class-protocol-router.php');
const PROTO_PATH = 'protocols/shared/creative-writing/CW-FINAL-ASSESSMENT.md';
const PROTO = fs.existsSync(path.join(ROOT, PROTO_PATH)) ? read(PROTO_PATH) : '';
const SCHEMES = require(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'));
const ENGINE = require(path.join(ROOT, 'frontend', 'wml-examiner-ladder.js'));

let pass = 0, fail = 0;
function ok(cond, msg, got) {
    if (cond) { pass++; return true; }
    fail++;
    console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got).slice(0, 300) : ''));
    return false;
}
const take = (src, sig, open, close) => {
    const i = src.indexOf(sig);
    if (i < 0) throw new Error('not found: ' + sig);
    return src.slice(i, braceSliceFrom(src, i, open, close).end);
};

console.log('\nCW FINAL ASSESSMENT — the chain around the walk (#884-⑦)\n');

// ── 1 + 2 · the entry, the task id, the named source — EXECUTED from the shipped wml-core.js ─────────────────────
let W = null;
try {
    const src = [
        take(CORE, 'const CW_STEPS = [', '[', ']') + ';',
        take(CORE, 'const CW_ARTIFACT_MAP = {', '{', '}') + ';',
        CORE.slice(CORE.indexOf("const CW_FINAL_TASK = '"), CORE.indexOf('\n', CORE.indexOf("const CW_FINAL_TASK = '"))),
        take(CORE, 'function isCwFinalTask(task)', '{', '}'),
        take(CORE, 'function cwTaskFor(def)', '{', '}'),
        take(CORE, 'function getCwStepDef(task)', '{', '}'),
        take(CORE, 'function cwTrialSource(task)', '{', '}'),
        take(CORE, 'function cwFinalSource()', '{', '}'),
        take(CORE, 'function cwFinalTargetStep()', '{', '}'),
        'return { CW_STEPS, CW_FINAL_TASK, getCwStepDef, cwTaskFor, cwTrialSource, cwFinalSource, cwFinalTargetStep, isCwFinalTask };',
    ].join('\n');
    // eslint-disable-next-line no-new-func
    W = new Function('cwInUnit', src)(() => false);
} catch (e) { ok(false, 'the core pieces could not be sliced from wml-core.js — ' + e.message); }

console.log('1 · ONE lesson entry, unnumbered, naming what it marks:');
if (W) {
    const finals = W.CW_STEPS.filter((s) => s.final);
    ok(finals.length === 1, 'exactly one CW_STEPS entry carries `final: true`', finals.length);
    const f = finals[0] || {};
    const i = W.CW_STEPS.indexOf(f);
    ok(W.CW_STEPS[i - 1] && W.CW_STEPS[i - 1].step === 30 && W.CW_STEPS[i + 1] && W.CW_STEPS[i + 1].step === 31,
        '⭐ it sits straight after Step 30 and straight before Step 31 (PEDAGOGY §33.6)', [W.CW_STEPS[i - 1], W.CW_STEPS[i + 1]]);
    ok(f.step === undefined && f.trial === undefined, '⭐ it carries NO step number and NO trial number — Step 31 keeps its number, no trial-keyed path sees it', f);
    ok(f.assesses === 30, 'it NAMES the step it marks (assesses: 30)', f.assesses);
    const src = W.cwFinalSource();
    ok(src && src.artifactKey === 'final_draft' && src.draftStep === 30, '⭐ the story it marks resolves to final_draft (Step 30)', src);
    // Falsify the walk-back: what the TRIAL rule would have given the same position.
    const probe = { trial: 99 };
    W.CW_STEPS.splice(i, 0, probe);
    const walked = W.cwTrialSource('cw_trial_99');
    W.CW_STEPS.splice(i, 1);
    ok(walked && walked.artifactKey === 'draft_7', '⭐ …and the walk-back it must NOT use really would have found draft_7 (the story before the SPAG polish) — D14 is load-bearing', walked);
    ok(W.cwFinalTargetStep() === 31, 'its target goes to Step 31 (the first numbered step after it)', W.cwFinalTargetStep());
}

console.log('\n2 · ONE task id, on both sides:');
if (W) {
    ok(W.CW_FINAL_TASK === 'cw_final_assessment', 'the client constant is cw_final_assessment', W.CW_FINAL_TASK);
    const bad = W.CW_STEPS.filter((s) => W.getCwStepDef(W.cwTaskFor(s)) !== s);
    ok(bad.length === 0, '⭐ EVERY CW_STEPS entry round-trips: getCwStepDef(cwTaskFor(entry)) === entry (' + W.CW_STEPS.length + ' entries)', bad.map((s) => s.step || s.id));
    ok(W.isCwFinalTask('cw_final_assessment') && !W.isCwFinalTask('cw_trial_6') && !W.isCwFinalTask('cw_step_30'), 'isCwFinalTask names the final assessment and nothing else');
}
const phpConst = (/const CW_FINAL_TASK = '([^']+)';/.exec(ROUTER) || [])[1];
ok(phpConst === (W && W.CW_FINAL_TASK), '⭐ the server constant equals the client constant byte for byte (§5d)', phpConst);

// ── 3 · the six name sites ───────────────────────────────────────────────────────────────────────────────────
console.log('\n3 · The six name sites read one predicate per language:');
const isCwLesson = (() => { try { return take(ROUTER, 'public static function is_cw_lesson_task($task)', '{', '}'); } catch (e) { return ''; } })();
ok(/strpos\(\$task, 'cw_step_'\) === 0 \|\| strpos\(\$task, 'cw_trial_'\) === 0 \|\| \$task === self::CW_FINAL_TASK/.test(isCwLesson), 'the router has ONE predicate: a step, a trial, or the final assessment');
ok((ROUTER.match(/if \(self::is_cw_lesson_task\(\$task\)\) \{/g) || []).length === 2, '⭐ sites 1–2: the protocol load and the creative-writing preamble both gate on it');
ok(!/if \(strpos\(\$task, 'cw_step_'\) === 0 \|\| strpos\(\$task, 'cw_trial_'\) === 0\) \{/.test(ROUTER), '…and no spelled-out two-prefix gate survives in the router');
ok(/self::CW_FINAL_TASK => 'CW-FINAL-ASSESSMENT\.md'/.test(ROUTER), 'the protocol map names the final assessment’s file');
ok(/self::CW_FINAL_TASK => 'Final Assessment'/.test(ROUTER), 'site 3: the preamble label names it (never the ucwords fallback)');
ok(fs.existsSync(path.join(ROOT, PROTO_PATH)), 'the protocol file exists on disk');
ok(/if \(isCwFinalTask\(task\)\) return CW_STEPS\.find\(s => s\.final\) \|\| null;/.test(CORE), 'site 4: getCwStepDef resolves the final assessment through the predicate');
ok(/state\.task = WML\.cwTaskFor\(stepDef\);/.test(APP) && !/state\.task = 'cw_step_' \+ stepDef\.step;/.test(APP),
    'site 5: the Step Dashboard takes its task from the ONE builder (no "cw_step_" + stepDef.step left — an unnumbered entry would be cw_step_undefined)');
ok(/\} else if \(stepDef\.final\) \{\s*\/\/[^\n]*\n\s*numBadge\.textContent = 'F';/.test(APP), '…and its badge says F, never "undefined"');
ok(/\.\.\.\(\(_cwScoredTask\(snap\.task\) && state\.cwTrialScore/.test(SRC) && !/snap\.task\.startsWith\('cw_trial_'\) \|\| snap\.task === 'cw_step_91'/.test(SRC),
    'site 6: the score piggyback reads ONE predicate (_cwScoredTask), and the old two-literal gate is gone');
const scored = (() => { try { return take(SRC, 'function _cwScoredTask(task) {', '{', '}'); } catch (e) { return ''; } })();
ok(/isCwFinalTask\(t\)/.test(scored) && /t\.indexOf\('cw_trial_'\) === 0/.test(scored) && /t === 'cw_step_91'/.test(scored), '…and the predicate still covers the trials and weekend lesson 11');
ok(/chatHeaderLabel: noChat \? null : \(stepDef\.step \? \('Step ' \+ stepDef\.step \+ ': ' \+ stepDef\.label\) : stepDef\.label\)/.test(CORE),
    'the chat header never prints an unnumbered entry’s key ("Step trial_6:" / "Step final_assessment:" — root §14)');

// ── 4 · the protocol and the parser agree ───────────────────────────────────────────────────────────────────
console.log('\n4 · The protocol and the parser agree:');
ok(/YOU DO NOT RUN THIS LESSON/.test(PROTO), 'the protocol is in the code-served shape ("YOU DO NOT RUN THIS LESSON")');
['@FINAL_LEVEL[ao5=', '@FINAL_LEVEL[ao6=', '@FINAL_EXAMPLE[ao5]', '@FINAL_EXAMPLE[ao6]', '@FINAL_STRENGTH', '@FINAL_PRIORITY'].forEach((m) =>
    ok(PROTO.indexOf(m) !== -1, 'the protocol asks for ' + m));
ok(!/AQA/.test(PROTO), '⭐ the protocol names no board as the source of the criteria (§33.3)');
const allDescriptors = [];
['aqa_lang1_q5_ao5', 'aqa_lang1_q5_ao6'].forEach((k) => ENGINE.rungs(SCHEMES[k]).forEach((l) => ENGINE.descriptorsOf(l).forEach((d) => allDescriptors.push(d.text))));
const leaked = allDescriptors.filter((t) => t.length > 30 && PROTO.indexOf(t) !== -1);
ok(leaked.length === 0, '⭐ the protocol repeats no descriptor — they are served in the marking turn, never where the model narrates (WML §5)', leaked.slice(0, 2));
// The real parser + resolver, sliced from the controller, run on the protocol's own template filled in.
let parsed = null, calls = null;
try {
    const ctl = take(SRC, 'const _cwFinalCtl = (function () {', '(', ')');
    const fn = (name) => { const i = ctl.indexOf('function ' + name + '('); return ctl.slice(i, braceSliceFrom(ctl, i, '{', '}').end); };
    const AOS = take(SRC, 'const CW_FINAL_AOS = [', '[', ']');
    // eslint-disable-next-line no-new-func
    const mk = new Function('window', AOS + ';\n'
        + 'function aos() { return CW_FINAL_AOS; }\n'
        + fn('engine') + '\n' + fn('scheme') + '\n' + fn('parseReply') + '\n' + fn('resolveCall') + '\n'
        + 'return { parseReply, resolveCall, aos };');
    const P = mk({ WML_MARK_SCHEMES: SCHEMES, WML_EXAMINER_LADDER: ENGINE });
    const block = (/```\n([\s\S]*?)```/.exec(PROTO) || [])[1] || '';
    const filled = block
        .replace('ao5=<level>|<upper|lower>|<top|middle|bottom>', 'ao5=3|upper|top')
        .replace('ao6=<level>|<top|middle|bottom>', 'ao6=2|middle');
    parsed = P.parseReply(filled);
    calls = P.aos().map((ao) => P.resolveCall(ao, parsed.levels[ao.id]));
    ok(!!parsed.levels.ao5 && !!parsed.levels.ao6, '⭐ the protocol’s own template, filled in, parses for BOTH objectives', parsed.levels);
    ok(calls[0] && calls[0].mark === 18 && calls[1] && calls[1].mark === 6,
        '⭐ …and resolves through the SAME resolver as the student’s climb (Upper Level 3, top = 18/24; Level 2, middle = 6/16)', calls);
    ok(!!parsed.strength && !!parsed.priority && !!parsed.examples.ao5 && !!parsed.examples.ao6, 'the template’s strength, priority and example lines parse too');
    const zero = P.resolveCall(P.aos()[1], P.parseReply('@FINAL_LEVEL[ao6=0] nothing to reward').levels.ao6);
    ok(zero && zero.mark === 0, 'a 0 call (nothing creditable) resolves to 0 with no half and no placement', zero);
    ok(P.resolveCall(P.aos()[0], P.parseReply('@FINAL_LEVEL[ao5=3|top] x').levels.ao5) === null,
        '⭐ a Content and Organisation call with no half is REFUSED (the board prints each level in two halves) — never a guessed half');
    ok(P.resolveCall(P.aos()[1], P.parseReply('@FINAL_LEVEL[ao6=2|lower|top] x').levels.ao6).mark === 8,
        'a stray half on Technical Accuracy (no halves) is ignored, not fatal');
} catch (e) { ok(false, 'the parser/resolver could not be sliced and run — ' + e.message); }

// ── 5 · the page builds the rows the walk writes ───────────────────────────────────────────────────────────
console.log('\n5 · The page builds exactly the rows the walk writes (§5d):');
try {
    const ids = [];
    const stubs = {
        escapeHTML: (s) => String(s || ''),
        inputHTML: (prompt, f) => { ids.push(f); return ''; },
        outlineRowHTML: (o, f) => { ids.push(f); return ''; },
        sectionHTML: () => '', dividerHTML: () => '',
    };
    const PAGE = [take(SRC, 'const CW_FINAL_AOS = [', '[', ']') + ';',
        take(SRC, 'function _cwFinalFid(part)', '{', '}'), take(SRC, 'function _cwFinalMax(ao)', '{', '}'),
        take(SRC, 'function _cwFinalTotalMax()', '{', '}'), take(SRC, 'function _cwFinalMarkingBlock()', '{', '}'),
        take(SRC, 'function _cwFinalSophiaBlock()', '{', '}'), take(SRC, 'function _cwFinalTargetBlock()', '{', '}'),
        take(SRC, 'function _cwFinalAboutHTML()', '{', '}'),
        'return { _cwFinalMarkingBlock, _cwFinalSophiaBlock, _cwFinalTargetBlock, _cwFinalAboutHTML, _cwFinalTotalMax, CW_FINAL_AOS };'].join('\n');
    // eslint-disable-next-line no-new-func
    const G = new Function('window', 'escapeHTML', 'inputHTML', 'outlineRowHTML', 'sectionHTML', 'dividerHTML', PAGE)(
        { WML_MARK_SCHEMES: SCHEMES }, stubs.escapeHTML, stubs.inputHTML, stubs.outlineRowHTML, stubs.sectionHTML, stubs.dividerHTML);
    G._cwFinalMarkingBlock(); G._cwFinalSophiaBlock(); G._cwFinalTargetBlock();
    const pageIds = new Set(ids);
    const walkIds = new Set(['cw-final-goal', 'cw-final-strength', 'cw-final-priority', 'cw-final-mark', 'cw-final-gap', 'cw-final-target']);
    G.CW_FINAL_AOS.forEach((ao) => {
        ['-level', '-met', '-mark', '-reason'].forEach((p) => walkIds.add('cw-final-' + ao.id + p));   // the ladder's four rows
        walkIds.add('cw-final-fb-' + ao.id);                                                          // Sophia's row
    });
    const missing = [...walkIds].filter((x) => !pageIds.has(x));
    const extra = [...pageIds].filter((x) => !walkIds.has(x));
    ok(missing.length === 0, '⭐ every row the walk writes is on the page (a missing one is a write that lands nowhere)', missing);
    ok(extra.length === 0, 'the page builds no row the walk never fills', extra);
    ok(ids.length === pageIds.size, 'no row id is built twice', ids.length - pageIds.size);
    ok(G._cwFinalTotalMax() === 40, 'the page’s total comes from the dataset: 24 + 16 = 40', G._cwFinalTotalMax());
    ok(!/AQA/.test(G._cwFinalAboutHTML()), '⭐ the page’s About names no board as the source of the criteria (§33.3)');
} catch (e) { ok(false, 'the page builders could not be sliced and run — ' + e.message); }
// The walk's own row writes are spelled through fid()/ladderFids, never a literal 'cw-final-…' string.
try {
    const ctl = take(SRC, 'const _cwFinalCtl = (function () {', '(', ')');
    ok(!/'cw-final-/.test(ctl), 'the walk spells no row id literally — every one goes through _cwFinalFid (ONE builder)');
    ok(/regime: 'bestfit', orientation: 'short', hostOwnsWrap: true,/.test(ctl), '⭐ the walk opens the ladder BEST FIT (§35), with the short opener and the host-owned wrap');
    ok(/walkId: CW_FINAL_LADDER_WALK/.test(ctl) && /_examinerLadderCtl\.registerHost\(CW_FINAL_LADDER_WALK,/.test(ctl), 'it registers its hand-back for a climb resumed after a reload');
    ok(/grade: _ladderGrade\(pct\)/.test(ctl), 'the grade comes from the ONE canonical ladder (_ladderGrade)');
    ok(!/\bpct >= 85\b|85 \? 9/.test(ctl), '…and the walk carries no grade table of its own');
    ok(/WML\.cwProject\.saveTrial\(state\.cwProjectId, payload, null\)/.test(ctl) && /trial: 'final', finale: true/.test(ctl),
        'the result saves as trial: \'final\', finale: true, with no trial number (never stamped 1–6, plan D11)');
    ok(/task: WML\.CW_FINAL_TASK/.test(ctl), 'the score it publishes carries the final assessment’s own task (the piggyback is gated to THIS task)');
} catch (e) { ok(false, 'the controller could not be sliced — ' + e.message); }

// ── 6 · the seven wiring points ────────────────────────────────────────────────────────────────────────────
console.log('\n6 · The seven wiring points name the controller:');
ok(/if \(WML\.isCwFinalTask\(state\.task\) && _cwFinalCtl\.active && _inboundIsAnswer\) \{\s*await _cwFinalCtl\.handleTurn\(msg\);/.test(SRC), '1 · the dispatcher arm');
ok((SRC.match(/\[WML\.CW_FINAL_TASK\]: _cwFinalCtl,/g) || []).length === 3, '2 · all three controller maps (nudge · probe · revive)', (SRC.match(/\[WML\.CW_FINAL_TASK\]: _cwFinalCtl,/g) || []).length);
ok(/registerCwWalkCtls\(\[[^\]]*\b_cwFinalCtl\b[^\]]*\]\)/.test(SRC), '3 · the walk registry');
ok(/_cwFinalCtl\.onReply\(reply\);/.test(SRC), '4 · the reply fan-out');
ok(/: WML\.isCwFinalTask\(t\) \? _cwFinalCtl/.test(SRC), '5 · the start-miss map');
ok(/cwFinalCtl: _cwFinalCtl,/.test(SRC) && /if \(WML\.isCwFinalTask\(state\.task\) && tp\.cwFinalCtl\) tp\.cwFinalCtl\.tryResume\(\);/.test(SRC)
    && /if \(WML\.isCwFinalTask\(state\.task\) && !state\.reviewMode && tp\.cwFinalCtl\) \{[\s\S]{0,200}tp\.cwFinalCtl\.forceStart\(\);/.test(SRC),
    '6 · the entry export, boot resume and fresh entry');
const boot = SRC.indexOf('if (tp.examinerLadderCtl) tp.examinerLadderCtl.tryResume();');
const finalBoot = SRC.indexOf('if (WML.isCwFinalTask(state.task) && tp.cwFinalCtl) tp.cwFinalCtl.tryResume();');
ok(boot !== -1 && finalBoot > boot, '…and at boot the ladder resumes BEFORE the final assessment does (a half-climbed ladder is the ladder’s)');
ok(/\} else if \(WML\.isCwFinalTask\(state\.task\)\) \{[\s\S]{0,300}_examinerLadderCtl\.reset\(\); _cwFinalCtl\.reset\(\); _cwFinalCtl\.forceStart\(\);/.test(SRC), '7 · chat-clear restarts its own walk, and drops a half-climbed ladder with it');
ok(/!\(cwStepDef\?\.trial \|\| cwStepDef\?\.final\)/.test(SRC) && /cwStepDef\.final\s*\?\s*\(\(WML\.cwFinalSource && WML\.cwFinalSource\(\)\) \|\| null\)/.test(SRC),
    '+ the page’s story is filled at mount from the NAMED source (cwFinalSource), not the walk-back');
ok(/\.then\(\(\) => tryFillCwPolishDraftPage\(\)\)\.then\(\(\) => tryFillCwFinalTarget\(\)\)/.test(SRC), '+ Step 31 pins the final assessment’s target (in the mount chain)');
ok(/\|\| box\.querySelector\('\[data-section-label="Final Draft"\]'\);/.test(SRC), '+ a story written straight into Step 30’s own section (no Draft 7 page under it) is still found');

// ── 7 · the shared ladder ──────────────────────────────────────────────────────────────────────────────────
console.log('\n7 · The shared ladder’s host hooks:');
const LAD = (() => { try { return take(SRC, 'const _examinerLadderCtl = (function () {', '(', ')'); } catch (e) { return ''; } })();
ok(/if \(cfg && cfg\.hostOwnsWrap\) \{[\s\S]{0,200}done = true; active = false; clearPersist\(\);/.test(LAD), '⭐ a host-owned wrap clears the finished climb’s sidecar FIRST (a reload never resurrects it)');
ok(/typeof hostCfg\.onDone === 'function' \? hostCfg\.onDone : _ladderHostResumers\[hostCfg\.walkId\]/.test(LAD), '⭐ …and hands back to a host whose onDone was lost in the reload');
ok(/function inProgressFor\(walkId\)/.test(LAD) && /function registerHost\(walkId, fn\)/.test(LAD) && /inProgressFor, registerHost,/.test(LAD), 'inProgressFor and registerHost are on the ladder’s API');
ok(/cfg\.orientation === 'short'/.test(LAD), 'a host that taught the method once can open each ladder on its first line');
const langHost = (() => { try { return take(SRC, 'function _ladderHostRenderCurrent() {', '{', '}'); } catch (e) { return ''; } })();
ok(langHost && !/hostOwnsWrap|orientation:/.test(langHost), 'the Language host opens the ladder exactly as before (no hostOwnsWrap, the full orientation)');

// ── 8 · the data ───────────────────────────────────────────────────────────────────────────────────────────
console.log('\n8 · The data it marks against:');
ok(SCHEMES.aqa_lang1_q5_ao5 && SCHEMES.aqa_lang1_q5_ao5.maxMarks === 24 && SCHEMES.aqa_lang1_q5_ao6 && SCHEMES.aqa_lang1_q5_ao6.maxMarks === 16,
    'both schemes exist in the generated dataset (24 and 16) — gated against the board by markscheme-gate');
ok(ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao5).every((l) => ENGINE.hasBands(l)) && ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao6).every((l) => !ENGINE.hasBands(l)),
    'Content and Organisation prints halves at every level; Technical Accuracy at none (the parser’s rule)');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.error('❌ cw-final-gate FAILED'); process.exit(1); }
console.log('✅ cw-final-gate passed — one unnumbered entry naming final_draft, one task id on both sides, one predicate per');
console.log('   language, protocol ↔ parser ↔ resolver agree, page rows = walk rows, seven wiring points, the ladder hooks.');
