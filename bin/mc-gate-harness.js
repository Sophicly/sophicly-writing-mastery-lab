#!/usr/bin/env node
/* eslint-env node */
/**
 * mc-gate-harness.js — v7.20.634 (FIXLIST #585–#588): THE MARK COMPLETE GATE.
 *
 * WHY THIS EXISTS
 * Neil's rule (2026-08-07, 2026-08-18, preview approved 2026-09-23): a lesson with a document can
 * only be marked complete when the document is finished, and a student who is stopped gets a
 * pop-up that says what is left. His condition, verbatim: "if they follow the process properly,
 * they should be able to mark the lesson complete without fail, and if they don't then they get
 * the popup." So this harness proves BOTH directions — a gate that only proves it blocks would
 * pass on a gate that blocks everyone (feedback_negative_only_tests_pass_on_a_dead_screen).
 *
 * WHAT IT CHECKS
 *   1. THE RULE — mcGateDecide / mcGateFamily are EXTRACTED from the shipped file (between the
 *      @MC-GATE-PURE sentinels), never re-typed here, and driven through the named cases:
 *      Annaya's assessment (Q3–Q5 unmarked → stopped), the all-marked-but-Sophia-forgot case
 *      (→ through), a finished session (→ through), CW incomplete / complete, the first-ever
 *      diagnostic exemption, an unknown reading (→ through), a watch-only family, watch mode,
 *      off mode.
 *   2. THE TRAP IT MUST NOT FALL INTO — "session finished" is the strict [ASSESSMENT_COMPLETE]
 *      code word, never detectAssessmentStep(), which calls one question's "Total 5/8 … Grade 6"
 *      the end of the assessment and would have waved Annaya through.
 *   3. FAIL-OPEN WIRING — the footer proxy asks the gate BEFORE any completion is recorded, and
 *      every error path proceeds; the server filter's catch returns LearnDash's own answer.
 *   4. THE EXCEPTIONS and the pieces the server half and the pop-up depend on.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = read('frontend/wml-assessment.js');
const core = read('frontend/wml-core.js');
const css = read('frontend/wml-canvas.css');
const php = read('sophicly-writing-mastery-lab.php');
const rest = read('includes/class-rest-api.php');

let pass = 0, failN = 0;
function ok(cond, label, detail) {
    if (cond) { pass++; console.log('  ✓ ' + label); }
    else { failN++; console.log('  ✗ ' + label + (detail ? '\n      ' + detail : '')); }
}

console.log('mc-gate-harness — the Mark Complete gate (v7.20.634)');

// ── 1. THE RULE, extracted ────────────────────────────────────────────────────
const m = js.match(/@MC-GATE-PURE-START([\s\S]*?)@MC-GATE-PURE-END/);
if (!m) {
    console.log('  ✗ the @MC-GATE-PURE sentinels are missing from wml-assessment.js');
    console.log('      The harness extracts the live rule rather than re-typing it. Move the sentinels with the code.');
    process.exit(1);
}
const pureSrc = m[1].slice(m[1].indexOf('*/') + 2).replace(/\/\*\s*$/, '');
let G;
try {
    // eslint-disable-next-line no-new-func
    G = new Function(pureSrc + '\nreturn { mcGateDecide, mcGateFamily, MC_GATE_ENFORCE_FAMILIES };')();
} catch (e) {
    console.log('  ✗ the @MC-GATE-PURE block does not run on its own: ' + e.message);
    process.exit(1);
}
const { mcGateDecide: decide, mcGateFamily: family } = G;

console.log('\n1. families');
ok(family('') === 'diagnostic' && family('diagnostic') === 'diagnostic', "'' and 'diagnostic' are the diagnostic family");
ok(family('assessment') === 'assessment' && family('redraft_assessment') === 'assessment', 'assessment + redraft_assessment are the assessment family');
ok(family('cw_step_3') === 'cw', 'a CW step is the cw family');
ok(family('planning') === 'other:planning' && family('foundational_quiz') === 'other:foundational_quiz', 'everything else is its own watch-only family');
ok(JSON.stringify(G.MC_GATE_ENFORCE_FAMILIES.slice().sort()) === JSON.stringify(['assessment', 'cw', 'diagnostic']),
    'only cw · diagnostic · assessment are eligible to be enforced (the measured families)');

console.log('\n2. the student who did NOT finish is stopped (enforce)');
const annaya = { verdict: 'incomplete', family: 'assessment', exempt: '', sessionFinished: false, unmarked: ['Feedback: Q3', 'Feedback: Q4', 'Feedback: Q5'] };
let d = decide(annaya, 'enforce');
ok(d.block === true && d.record === 'blocked', "Annaya 1398 — assessment, Q3–Q5 unmarked, session not finished → STOPPED", JSON.stringify(d));
ok(/Q3/.test(d.why), 'the recorded reason names the unmarked questions', d.why);
d = decide({ verdict: 'incomplete', family: 'cw', exempt: '' }, 'enforce');
ok(d.block === true, 'Fatou / Maysa — a CW step under 100% → STOPPED', JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'diagnostic', exempt: '' }, 'enforce');
ok(d.block === true, 'a later diagnostic (not the first ever) under 100% → STOPPED', JSON.stringify(d));

console.log('\n3. the student who DID follow the process always gets through (enforce)');
d = decide({ verdict: 'complete', family: 'cw', exempt: '' }, 'enforce');
ok(d.block === false && d.record === null, 'CW step at 100% → through, nothing recorded', JSON.stringify(d));
d = decide({ verdict: 'complete', family: 'assessment', exempt: '', sessionFinished: true, unmarked: [] }, 'enforce');
ok(d.block === false, 'finished assessment at 100% → through', JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'assessment', exempt: '', sessionFinished: true, unmarked: [] }, 'enforce');
ok(d.block === false && d.record === 'sophia_gap', "session finished but a Sophia-filled part is empty → THROUGH, recorded as Sophia's gap", JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'assessment', exempt: '', sessionFinished: false, unmarked: [] }, 'enforce');
ok(d.block === false && d.record === 'sophia_gap', 'every question marked, Analytics/Action Plan not filed, no code word → THROUGH (Sophia’s job, never the student’s)', JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'diagnostic', exempt: 'first-diagnostic' }, 'enforce');
ok(d.block === false, "the student's very first diagnostic ever → exempt (Neil's ruling)", JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'cw', exempt: 'one-document-course' }, 'enforce');
ok(d.block === false, 'Grade 9 Core Skills (one document for the course) → exempt', JSON.stringify(d));
d = decide({ verdict: 'unknown', family: 'cw', exempt: '' }, 'enforce');
ok(d.block === false && d.record === 'unknown', 'an UNKNOWN reading (still mounting, error) → THROUGH and recorded — only certainty stops anyone', JSON.stringify(d));
d = decide({ verdict: 'incomplete', family: 'other:planning', exempt: '' }, 'enforce');
ok(d.block === false && d.record === 'would_block', 'an unmeasured family (planning) under 100% → through, recorded as would-block', JSON.stringify(d));
d = decide(null, 'enforce');
ok(d.block === false, 'no reading at all → through');

console.log('\n4. modes');
d = decide(annaya, 'watch');
ok(d.block === false && d.record === 'would_block', 'WATCH: Annaya is let through and recorded as would-block', JSON.stringify(d));
d = decide({ verdict: 'complete', family: 'cw', exempt: '' }, 'watch');
ok(d.block === false && d.record === 'pass', 'WATCH records every pass too — the base rate the review needs', JSON.stringify(d));
d = decide(annaya, 'off');
ok(d.block === false && d.record === null, 'OFF: nothing stopped, nothing recorded', JSON.stringify(d));
d = decide(annaya, 'nonsense');
ok(d.block === false, 'an unrecognised mode is OFF (fail-open)');

// ── 2. the detectAssessmentStep trap ──────────────────────────────────────────
console.log('\n5. "session finished" is the strict code word, never the loose detector');
const sf = js.match(/function _mcGateSessionFinished\(\)\s*\{([\s\S]*?)\n    \}/);
ok(!!sf, '_mcGateSessionFinished exists');
ok(sf && /\\\[ASSESSMENT_COMPLETE\\\]/.test(sf[1]), 'it keys on [ASSESSMENT_COMPLETE] only');
ok(sf && !/detectAssessmentStep/.test(sf[1]), 'it does NOT call detectAssessmentStep (which reads "Q2 Total: 5/8 … Grade 6" as the end)');
// Prove the trap is real, so the check above is not decorative: Annaya's Q2 closing line.
const das = core.match(/function detectAssessmentStep\(replyText\)\s*\{([\s\S]*?)\n    \}/);
if (das) {
    let detect;
    try { detect = new Function('replyText', das[1]); } catch (_) { detect = null; }   // eslint-disable-line no-new-func
    if (detect) {
        const q2 = 'Q2 Total: 5/8\n\n**Percentage & Grade:** 62.5%, which is a **Grade 6**.';
        const r = detect(q2);
        ok(r && r.step === 8, 'CONTROL: detectAssessmentStep DOES call Annaya\'s Q2 message the end (step 8) — the reason it is banned here', JSON.stringify(r));
    }
}

// ── 3. fail-open wiring ───────────────────────────────────────────────────────
console.log('\n6. wiring — the gate runs first, and every failure proceeds');
const proxy = js.match(/function buildLdCompleteProxy\(ldMarkBtn\)\s*\{([\s\S]*?)\n            \}/);
ok(!!proxy, 'the footer proxy (buildLdCompleteProxy) is found');
if (proxy) {
    const b = proxy[1];
    const iGate = b.indexOf('_mcGateCheckBeforeComplete(ldMarkBtn)');
    const iCw = b.indexOf('_cwWriteStepCompletion(');
    const iLd = b.indexOf('ldMarkBtn.click()');
    ok(iGate > -1, 'the proxy asks the gate');
    ok(iGate > -1 && iCw > -1 && iGate < iCw, 'the gate runs BEFORE the CW step completion is recorded');
    ok(iGate > -1 && iLd > -1 && iGate < iLd, 'the gate runs BEFORE LearnDash is asked');
    ok(/=== 'blocked'\)\s*\{[\s\S]{0,160}markBtn\.disabled = false;[\s\S]{0,40}return;/.test(b), 'a stopped click hands the button back');
}
const chk = js.match(/async function _mcGateCheckBeforeComplete\(ldMarkBtn\)\s*\{([\s\S]*?)\n    \}/);
ok(!!chk, '_mcGateCheckBeforeComplete exists');
ok(chk && /catch \(e\)\s*\{[\s\S]*return 'proceed';\s*\}\s*$/.test(chk[1]), 'its catch PROCEEDS (a broken gate can never trap a student)');
ok(chk && /if \(state\.reviewMode\) return 'proceed';/.test(chk[1]), 'review mode never gates');
ok(/function _mcGateMode\(\)[\s\S]{0,200}: 'off';/.test(js), 'no config → mode off (older server / standalone page = today’s behaviour)');

console.log('\n7. the server half holds the same line — and fails open');
ok(/add_filter\('learndash_process_mark_complete', \[\$this, 'mc_gate_filter'\], 20, 3\)/.test(php), 'the filter is registered on learndash_process_mark_complete');
const filt = php.match(/public function mc_gate_filter\([^)]*\)\s*\{([\s\S]*?)\n    \}/);
ok(!!filt, 'mc_gate_filter exists');
if (filt) {
    const f = filt[1];
    ok(/catch \(\\Throwable \$e\)\s*\{[\s\S]*return \$process;/.test(f), 'its catch returns LearnDash’s own answer');
    ok(/empty\(\$rec\['block'\]\)\) return \$process;/.test(f), 'no stored verdict, or a non-blocking one → through');
    ok(/wp_verify_nonce\(substr\(\$vouch, 5\)/.test(f), 'a click the page vouched for is never second-guessed');
    ok(/current_user_can\('manage_options'\)\) return \$process;/.test(f), 'staff are never gated');
    ok(/if \(\$mode !== 'enforce'\) return \$process;/.test(f), 'watch mode records only');
    ok(!/mcGateDecide|unmarked.*block\s*=|sessionFinished/.test(f), 'the server does NOT re-derive the rule — it reads the page’s verdict');
}
ok(/'block'\s*=>\s*!empty\(\$dp\['block'\]\)/.test(rest), 'the save stores the page’s verdict with the document');
ok(/register_rest_route\(\$namespace, '\/mc-gate\/log'/.test(rest) && /register_rest_route\(\$namespace, '\/mc-gate\/first-diagnostic'/.test(rest), 'the record + first-diagnostic routes exist');
ok(/\$this->canvas_meta_key\(\$board, \$text, \$topic, '', 1, ''\)/.test(rest), 'first-diagnostic builds the key with the ONE builder (canvas_meta_key)');
ok(/const verdict = mcGateDecide\(facts, 'enforce'\);\s*return \{ docProgress: \{[\s\S]{0,500}block: !!verdict\.block/.test(js), 'the saved verdict comes from the same mcGateDecide the click uses');

console.log('\n8. the exceptions and the pop-up’s dependencies');
ok(/mastery_codex:\s*\{[\s\S]{0,400}markCompleteGate: false/.test(core), 'Grade 9 Core Skills (mastery_codex) opts out by capability flag');
ok(/family === 'diagnostic' && _isFirstDiagnostic\(\) && \(_canvasAttempt\(\) \|\| 1\) <= 1/.test(js), 'the first-diagnostic exemption is attempt 1 of the first diagnostic');
ok(/if \(state\.mcFirstEverDiagnostic === false\) return false;/.test(js), '_isFirstDiagnostic honours the server’s first-EVER answer (PEDAGOGY §1)');
ok(/\.swml-review-modal-overlay \{[\s\S]{0,400}z-index: 999999;/.test(css), 'the shared modal overlay sits on WML’s documented 999999 tier');
ok(/\[data-swml-theme="light"\] \.swml-mc-gate \.swml-btn-main/.test(css), 'the body-mounted pop-up carries its own light-theme button skin');
const chipFn = js.match(/function _progressChipLabel\(label\)\s*\{([\s\S]*?)\n    \}/);
if (chipFn) {
    // eslint-disable-next-line no-new-func
    const clean = new Function('label', chipFn[1]);
    ok(clean('Feedback: Q3 (— / 8)') === 'Feedback: Q3', 'chip label drops an unmarked slot: "Feedback: Q3 (— / 8)" → "Feedback: Q3"');
    ok(clean('Feedback: Q2 (5 / 8)') === 'Feedback: Q2', 'and a marked one');
    ok(clean('Story Components') === 'Story Components', 'and leaves a plain name alone');
} else ok(false, '_progressChipLabel exists');
ok(/chip\.textContent = _progressChipLabel\(name\);/.test(js) && /_jumpToProgressSection\(editor, name\);/.test(js), 'chips SHOW the clean label but JUMP by the full one');

console.log('\n' + (failN ? '✗ ' + failN + ' failed, ' + pass + ' passed' : '✓ all ' + pass + ' checks passed'));
process.exit(failN ? 1 : 0);
