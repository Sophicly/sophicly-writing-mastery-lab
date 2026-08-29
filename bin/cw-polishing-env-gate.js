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

// ── The cross-language check. The JS decides the ENVIRONMENT, the PHP decides the PROTOCOL, and a
// step that has one without the other is broken in a way neither side can see: flip the env with no
// router row and Sophia opens with no rubric behind her; add the router row with no env flip and
// the coaching protocol loads into a lesson that is still a walk. This is the §5d write-key /
// read-key mismatch across two languages, so it is asserted, not remembered.
console.log('\nThe JS environment and the PHP router agree about which steps polish:');
const ROUTER = fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8');

const lensBlock = ROUTER.match(/\$cw_polishing_lenses\s*=\s*\[([\s\S]*?)\];/);
ok('the router declares a $cw_polishing_lenses map', !!lensBlock);
const phpPolishing = lensBlock
    ? [...lensBlock[1].matchAll(/'(cw_step_\d+)'\s*=>\s*'([a-z_]+)'/g)].map(m => ({ task: m[1], lens: m[2] }))
    : [];
const jsPolishing = WML.CW_STEPS.filter(s => s.env === 'polishing').map(s => ({ task: 'cw_step_' + s.step, lens: s.lens }));

ok('both sides list the SAME steps',
    JSON.stringify(phpPolishing.map(p => p.task).sort()) === JSON.stringify(jsPolishing.map(j => j.task).sort()),
    { php: phpPolishing.map(p => p.task), js: jsPolishing.map(j => j.task) });

for (const j of jsPolishing) {
    const p = phpPolishing.find(x => x.task === j.task);
    ok(`${j.task}: the lens matches on both sides (${j.lens})`, !!p && p.lens === j.lens,
        { js: j.lens, php: p ? p.lens : 'MISSING' });
}

// A polishing step must NOT also be in the walk-protocol map, or its old teaching walk loads.
const mapBlock = ROUTER.match(/\$cw_protocol_map\s*=\s*\[([\s\S]*?)\];/);
ok('the router still declares $cw_protocol_map', !!mapBlock);
const mapped = mapBlock ? [...mapBlock[1].matchAll(/'(cw_step_\d+|cw_trial_\d+)'\s*=>/g)].map(m => m[1]) : [];
for (const j of jsPolishing) {
    ok(`${j.task} is NOT in the walk-protocol map — its old walk can never be narrated (§5)`,
        !mapped.includes(j.task), mapped.includes(j.task) ? 'still mapped' : undefined);
}
ok('every OTHER CW step still has a protocol file mapped',
    WML.CW_STEPS.filter(s => s.step && s.env !== 'polishing' && s.tier !== 'workbook')
        .every(s => mapped.includes('cw_step_' + s.step)),
    WML.CW_STEPS.filter(s => s.step && s.env !== 'polishing' && s.tier !== 'workbook')
        .filter(s => !mapped.includes('cw_step_' + s.step)).map(s => s.step));

console.log('\nThe files the polishing protocol is assembled from all exist:');
for (const rel of [
    'protocols/shared/modules/inline-coaching-core.md',
    'protocols/shared/modules/inline-coaching-engine-1.md',
    'protocols/shared/modules/rubrics/rubric-base.md',
    'protocols/shared/modules/rubrics/rubric-cw-narrative.md',
]) {
    ok(rel.split('/').pop() + ' is on disk', fs.existsSync(path.join(ROOT, rel)));
}

const RUBRIC = fs.existsSync(path.join(ROOT, 'protocols/shared/modules/rubrics/rubric-cw-narrative.md'))
    ? fs.readFileSync(path.join(ROOT, 'protocols/shared/modules/rubrics/rubric-cw-narrative.md'), 'utf8') : '';
ok('the CW rubric forbids marking — polishing coaches, it never grades',
    /YOU DO NOT MARK IN THIS LESSON/.test(RUBRIC));
ok('…and it carries a section for every lens the JS declares',
    jsPolishing.every(j => new RegExp('Lens `' + j.lens + '`').test(RUBRIC)),
    jsPolishing.filter(j => !new RegExp('Lens `' + j.lens + '`').test(RUBRIC)).map(j => j.lens));

// ── Every CW button must MEAN something. The action id is sent to the model as a bare string
// (`**Action:** cw-verbs`) and nothing in the JS says what it is for — the meaning lives only in
// the rubric. So a button with no rubric row is a button the model improvises an answer to, which
// is the §5c "never author pedagogy from general knowledge" failure with a tap to trigger it.
console.log('\nEvery Creative Writing button is defined in the rubric:');
const CHIP = fs.readFileSync(path.join(ROOT, 'frontend/wml-selection-chip.js'), 'utf8');
const cwGroups = ['cwScan', 'cwWordChoice', 'cwArc', 'cw'];
let cwActions = [];
for (const g of cwGroups) {
    const m = CHIP.match(new RegExp(g + ":\\s*\\[([^\\]]*)\\]"));
    if (m) cwActions.push(...[...m[1].matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]));
}
ok('the CW groups list actions at all', cwActions.length > 0, cwActions.length);
const undefinedActions = cwActions.filter(a => !RUBRIC.includes('`' + a + '`'));
ok(`all ${cwActions.length} CW actions have a rubric row`, undefinedActions.length === 0, undefinedActions);

const missingLabel = cwActions.filter(a => !new RegExp("'" + a + "':").test(CHIP));
ok('every CW action has a human label — no student sees a raw id (root §14)',
    missingLabel.length === 0, missingLabel);

console.log('\nThe prose layer is the researched one, and its landmines are guarded:');
ok('the verb comes FIRST — Hale\'s order, not alphabetical', /The verb is the engine — go here FIRST/.test(RUBRIC));
ok('Clark\'s modifier test is stated (repeats = cut, changes = keep)',
    /REPEATS its word\. Keep the one that CHANGES it/.test(RUBRIC));
// Anchored on the RULE, not on one sentence's exact wording — the first cut of this check quoted
// the sentence verbatim and broke the moment the sentence was edited (v7.20.580 lowercased one
// word). A check that only matches its author's phrasing tests the phrasing, not the rule.
ok('it forbids the absolute "never use adjectives or adverbs"',
    /not tell a student "never use adjectives or adverbs\."/i.test(RUBRIC));
ok('…and it says WHY we lean hard: school taught them the opposite (Neil, 2026-08-29)',
    /taught that creative writing means using lots of adjectives and adverbs/.test(RUBRIC));
ok('⚠️ the salt/sugar line is NOT attributed to Le Guin (research accuracy flag 1)',
    /Never attribute the "salt and sugar/.test(RUBRIC)
    && !/salt[^\n]{0,80}—\s*(Ursula|Le Guin)/.test(RUBRIC));
ok('the coach panel no longer hardcodes "Exam Prep Coach"',
    !/'<svg[^']*Sophia — Exam Prep Coach'/.test(fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8')));

console.log('');
if (fail) { console.log(`❌ cw-polishing-env-gate FAILED (${fail})`); process.exit(1); }
console.log(`✅ cw-polishing-env-gate passed  (${pass} assertions, 0 failed)`);
