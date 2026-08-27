#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-polishing-env-gate.js — Draft steps that polish get the polishing environment, and the
 * lessons around them are untouched. (v7.20.577)
 *
 * WHY THIS EXISTS. Neil, 2026-08-27: *"step fourteen… it's meant to be a polishing environment…
 * the students select the writing that they want to edit, and then they get a contextual chat."*
 * Step 14 therefore stops being a teaching walk and becomes the selection-coach environment.
 *
 * The failure this guards is the one the CW config keeps producing: a step opts into a shape by
 * being CLONED from a neighbour, and quietly takes a flag it should not have. That is exactly how
 * Step 13 acquired `tools: 'minimal'` at .568 and lost its notes tab until Neil found it. So this
 * asserts the WHOLE SET each time, never just the step being changed — a new draft step that
 * inherits the wrong environment fails the build instead of shipping silently.
 *
 * ⚠️ It checks WIRING, not behaviour. It cannot prove the rail or the notes tab actually render in
 * the inline-coaching env — no CW lesson had ever run that combination before this build, and only
 * a browser proves it. That check is a staging step, not a gate (root §14b: presence proves
 * plumbing, never behaviour).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(label, cond, got) {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
}

// ── shim enough of a browser for wml-core.js to evaluate ──
global.window = { addEventListener() {}, removeEventListener() {}, location: { search: '', href: '' } };
global.document = {
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return _stubEl(); },
    getElementById() { return null; },
    createTextNode() { return _stubEl(); },
    head: _stubEl(),
    documentElement: _stubEl(),
    body: _stubEl(),
};
function _stubEl() {
    return {
        style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
        addEventListener() {}, removeEventListener() {}, querySelector() { return null; },
        querySelectorAll() { return []; }, dataset: {},
    };
}
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.MutationObserver = class { observe() {} disconnect() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;
global.window.localStorage = global.localStorage;

const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
try { new Function(CORE)(); } catch (e) {
    console.log('cw-polishing-env-gate: wml-core.js did not evaluate — ' + e.message);
    process.exit(1);
}
const WML = global.window.WML;
if (!WML) { console.log('cw-polishing-env-gate: WML namespace missing'); process.exit(1); }

const cfg = (t) => WML.getExerciseConfig(t);

console.log('\nStep 14 runs the polishing environment:');
const c14 = cfg('cw_step_14');
ok('environment is inline-coaching', c14.environment === 'inline-coaching', c14.environment);
ok('the chat PANEL is off — Sophia is reached from a selection, not a walk', c14.panels.chat === false, c14.panels);
ok('the document is still shown', c14.panels.document === true);
ok('no walk sidebar steps (nothing could ever tick them — §4d)', !c14.sidebarSteps, c14.sidebarSteps);
ok('no chat header label', !c14.chatHeaderLabel, c14.chatHeaderLabel);
ok('protocolSource is null — the old Step-14 walk markdown must NEVER be loaded at the student',
    c14.protocolSource === null, c14.protocolSource);
ok('it declares WHICH polish it is for, as data', WML.getCwStepDef('cw_step_14').lens === 'character_arc',
    WML.getCwStepDef('cw_step_14').lens);
ok('its artifact key is untouched — Trial 2 still marks the same draft',
    WML.CW_ARTIFACT_MAP[14] === 'draft_2', WML.CW_ARTIFACT_MAP[14]);

console.log('\nIt keeps the tools, because it is not a test lesson:');
ok('Step 14 is not tools-minimal', !WML.cwToolsMinimal('cw_step_14'));
ok('…so the notes tab, rail and Resources all stay (one predicate feeds all three)',
    !WML.cwToolsMinimal('cw_step_14'));

console.log('\nNothing else moved:');
ok('exactly ONE step declares env=polishing so far',
    JSON.stringify(WML.CW_STEPS.filter(s => s.env === 'polishing').map(s => s.step)) === '[14]',
    WML.CW_STEPS.filter(s => s.env === 'polishing').map(s => s.step));
ok('exactly ONE step declares env=diagnostic',
    JSON.stringify(WML.CW_STEPS.filter(s => s.env === 'diagnostic').map(s => s.step)) === '[10]',
    WML.CW_STEPS.filter(s => s.env === 'diagnostic').map(s => s.step));
ok('tools-minimal is still 9 and 10 only',
    JSON.stringify(WML.CW_STEPS.filter(s => s.tools === 'minimal').map(s => s.step)) === '[9,10]',
    WML.CW_STEPS.filter(s => s.tools === 'minimal').map(s => s.step));
ok('Step 13 keeps its training walk', cfg('cw_step_13').environment === 'training', cfg('cw_step_13').environment);
ok('Step 13 keeps its chat panel', cfg('cw_step_13').panels.chat === true);
ok('Step 12 keeps its training walk', cfg('cw_step_12').environment === 'training', cfg('cw_step_12').environment);
ok('Step 10 keeps its diagnostic env', cfg('cw_step_10').environment === 'free', cfg('cw_step_10').environment);
ok('Step 17 (Draft 3) has NOT been flipped yet — it follows once Step 14 is proven',
    cfg('cw_step_17').environment === 'training', cfg('cw_step_17').environment);

console.log('\nThe env ladder still resolves by capability, not by step number:');
ok('a step with no env falls back to its tier', cfg('cw_step_11').environment === 'training');
ok('`env` beats `tier` — Step 14 is tier si yet is NOT the si config',
    WML.getCwStepDef('cw_step_14').tier === 'si' && cfg('cw_step_14').environment !== 'training');

console.log('');
if (fail) { console.log(`❌ cw-polishing-env-gate FAILED (${fail})`); process.exit(1); }
console.log(`✅ cw-polishing-env-gate passed  (${pass} assertions, 0 failed)`);
