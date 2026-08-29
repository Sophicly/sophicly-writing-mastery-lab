#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial-judges-the-draft-gate.js — a trial marks the DRAFT it follows, and nothing else.
 * (v7.20.581)
 *
 * THE BUG THIS EXISTS FOR, found by a student rather than by us. Reeham (1352) reported that
 * "Trial 1 is marking my Step 9 rather than my Step 10", and she was reading the screen correctly:
 * every per-element question quoted her Step 9 scene-selection plan under the heading "What you
 * planned in Step 9", immediately before asking her to make a level call. The draft section on the
 * page was right; the QUESTION pointed somewhere else, and the question is what she answered.
 *
 * It was worse than confusing. A scene-selection field holds planning notes, not prose — hers began
 * "Values (Integrity): Peter didn't change till the very end" — so the only writing quoted in the
 * marking question was not a draft at all.
 *
 * Neil, 2026-08-29: *"she should be marking her step 10 work."*
 *
 * WHY A GATE AND NOT A FIXED LINE. Nothing in the code said which artifact a trial is ABOUT, so
 * both the visible ask and the stuck-help context reached for `scene_selection` — the plan — simply
 * because it was per-element and to hand, while the draft is continuous prose that cannot be sliced
 * per element. That pull does not go away by fixing two strings once; the next person adding a
 * trial ask meets the same convenient wrong source. So the rule is asserted:
 *
 *   1. The trial's SOURCE is derived, and derives to the draft step (Trial 1 → Step 10, draft_1).
 *   2. No trial ask presents `scene_selection` as the thing being judged.
 *   3. The draft section is refreshed from the artifact on entry, so a student still editing their
 *      draft is marking what they last wrote (Neil, same conversation: "she's also still editing
 *      step 10 so the trial needs to ensure it reads her new edits as well").
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(label, cond, got) {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
}

// ── 1. the derived source ────────────────────────────────────────────────────────────────────
global.window = { addEventListener() {}, removeEventListener() {}, location: { search: '', href: '' } };
function _stubEl() {
    return {
        style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
        addEventListener() {}, removeEventListener() {}, querySelector() { return null; },
        querySelectorAll() { return []; }, dataset: {},
    };
}
global.document = {
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return _stubEl(); }, getElementById() { return null; },
    createTextNode() { return _stubEl(); }, head: _stubEl(),
    documentElement: _stubEl(), body: _stubEl(),
};
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.MutationObserver = class { observe() {} disconnect() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;
global.window.localStorage = global.localStorage;

const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
try { new Function(CORE)(); } catch (e) {
    console.log('cw-trial-judges-the-draft-gate: wml-core.js did not evaluate — ' + e.message);
    process.exit(1);
}
const WML = global.window.WML;
if (!WML) { console.log('cw-trial-judges-the-draft-gate: WML namespace missing'); process.exit(1); }

console.log('\nEvery trial resolves to the DRAFT written immediately before it:');
const trials = WML.CW_STEPS.filter((s) => s.trial);
ok('there are trials to check', trials.length > 0, trials.length);
for (const t of trials) {
    const task = 'cw_trial_' + t.trial;
    const src = WML.cwTrialSource(task);
    ok(`${task} resolves to a draft`, !!src && !!src.draftStep, src);
    if (!src) continue;
    const def = WML.CW_STEPS.find((s) => s.step === src.draftStep);
    ok(`  …and that step really declares a draft (Step ${src.draftStep} = "${src.draftLabel}")`,
        !!def && !!def.draft, def && def.draft);
    ok(`  …and its artifact is that draft's own key, never a plan (${src.artifactKey})`,
        /^draft_\d+$/.test(src.artifactKey) || src.artifactKey === 'final_draft', src.artifactKey);
    ok(`  …and it is NOT the scene-selection plan`, src.artifactKey !== 'scene_selection'
        && src.artifactKey !== 'scene_selection_2', src.artifactKey);
}
// The specific pairing the student reported.
const t1 = WML.cwTrialSource('cw_trial_1');
ok('Trial 1 marks STEP 10, Draft 1 — the exact pairing Reeham reported wrong',
    t1 && t1.draftStep === 10 && t1.artifactKey === 'draft_1', t1);

// ── 2. no ask presents the PLAN as the thing being judged ────────────────────────────────────
console.log('\nNo trial question presents the Step-9 plan as the writing under assessment:');
const ASSESS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');

ok('the "What you planned in Step 9" heading is gone from the visible ask',
    !/\*\*What you planned in Step \d+:\*\*/.test(ASSESS));
ok('no ask heading quotes a plan as "what you planned" at all',
    !/\*\*What you planned/.test(ASSESS));
ok('the ask sends the student to their DRAFT instead',
    /Find this part in your draft/.test(ASSESS));
ok('the stuck-help context names the DRAFT as the thing being judged',
    /WHAT THEY ARE JUDGING: their Draft 1/.test(ASSESS));
ok('…and labels the plan as background, not as the draft',
    /BACKGROUND ONLY — what they PLANNED/.test(ASSESS));
ok('…and forbids quoting the plan back as if it were the draft',
    /do not quote it back as if it were their draft/.test(ASSESS));

// ── 3. the draft is re-read on entry, so live edits are marked ───────────────────────────────
console.log('\nThe draft under assessment is refreshed from the artifact on every entry:');
ok('the trial fill loads the artifact named by the derived source',
    /loadArtifact\(\s*state\.cwProjectId\s*,\s*src\.artifactKey\s*\)/.test(ASSESS));
ok('…and rewrites the draft section when it has changed',
    /if \(sec\.innerHTML === inner\) return;/.test(ASSESS));
ok('…and runs on the load chain, not only on first build',
    /tryFillCwTrialDraft\(\)/.test(ASSESS));

console.log('');
if (fail) { console.log(`❌ cw-trial-judges-the-draft-gate FAILED (${fail})`); process.exit(1); }
console.log(`✅ cw-trial-judges-the-draft-gate passed  (${pass} assertions, 0 failed)`);
