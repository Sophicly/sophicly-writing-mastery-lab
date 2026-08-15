#!/usr/bin/env node
/* eslint-env node */
/**
 * cw9-transfer-gate — Step 9 transfers a scene, Step 10 opens with it. (v7.20.505, #366/#204)
 *
 * WHY THIS EXISTS. The chain "write the elements → tap Transfer → Step 10 opens with the prose"
 * spans two lessons, three artifacts and a manifest, and EVERY failure in it is silent:
 *   · seed into the wrong artifact key → Step 10 opens blank and nothing errors;
 *   · Step 10 keeps a chat panel → the "test" quietly becomes a walk again;
 *   · the join keeps element labels → the student's story reads as a worksheet;
 *   · the draft box loses its composition flag → the word counter reads the story as zero.
 * A student would find each of these before we did. So they are assertions, not a memory.
 *
 * It runs the REAL functions where it can (the manifest resolver is executed; the join is sliced
 * out of the shipped source and executed against a fake document), and asserts on the source only
 * where behaviour cannot be reached without a browser.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { braceSliceFrom } = require('./walk-sim-lib');

let fails = 0;
const ok = (label, cond, got) => {
    console.log((cond ? '  ✓ ' : '  ✗ ') + label + (cond || got === undefined ? '' : '   got: ' + JSON.stringify(got)));
    if (!cond) fails++;
};

// ── A REAL WORLD, thin enough that wml-core evaluates in node ─────────────────────────────────
const mkStyle = () => ({ setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } });
const mkEl = () => ({
    style: mkStyle(), classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    dataset: {}, children: [], appendChild() {}, removeChild() {}, remove() {}, setAttribute() {},
    getAttribute() { return null; }, addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, insertAdjacentHTML() {},
    closest() { return null; }, focus() {}, click() {},
    getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
});
global.document = {
    addEventListener() {}, removeEventListener() {}, createElement: mkEl, createTextNode() { return {}; },
    querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; },
    body: mkEl(), documentElement: mkEl(), head: mkEl(), readyState: 'complete',
};
global.window = {
    addEventListener() {}, removeEventListener() {}, location: { href: '', search: '', hash: '' },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    document: global.document, matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; },
    getComputedStyle() { return mkStyle(); }, requestAnimationFrame() { return 0; }, setTimeout() { return 0; },
};
global.getComputedStyle = global.window.getComputedStyle;
global.navigator = { userAgent: 'node' };
global.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
global.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;

const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
try { new Function(CORE)(); } catch (e) {
    console.log('cw9-transfer-gate: wml-core.js did not evaluate — ' + e.message);
    process.exit(1);
}
const WML = global.window.WML;
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');

// ── 1. STEP 10 IS A DIAGNOSTIC (the real resolver, not the table) ─────────────────────────────
console.log('\nStep 10 resolves to a walk-free diagnostic:');
const c10 = WML.getExerciseConfig('cw_step_10');
ok('chat panel OFF — "no chatbot, because it\'s meant to be like a test"', c10.panels.chat === false, c10.panels);
ok('walk sidebar OFF', c10.panels.sidebar === false, c10.panels);
ok('document ON', c10.panels.document === true, c10.panels);
ok('environment "free", so the training panels are never built at all', c10.environment === 'free', c10.environment);
ok('no protocol loads (the retired Socratic workshop cannot return)', c10.protocolSource === null, c10.protocolSource);
ok('no sub-steps that nothing can ever tick', c10.sidebarSteps === null, c10.sidebarSteps);
ok('document key unmoved (_cw_10)', c10.storageSuffix === '_cw_10', c10.storageSuffix);
ok('artifact key still draft_1 — Step 13 seeds from it', WML.CW_ARTIFACT_MAP[10] === 'draft_1', WML.CW_ARTIFACT_MAP[10]);
ok('seeded from scene_draft', (WML.CW_SEED_FROM || {})[10] === 'scene_draft', WML.CW_SEED_FROM);
ok('exactly ONE step declares the diagnostic env', JSON.stringify(WML.CW_STEPS.filter(s => s.env === 'diagnostic').map(s => s.step)) === '[10]');

console.log('\nNo sibling step was dragged along by the capability:');
ok('Step 9 keeps its chat + 3 walk sub-steps', WML.getExerciseConfig('cw_step_9').panels.chat === true
    && (WML.getExerciseConfig('cw_step_9').sidebarSteps || []).length === 3);
ok('Step 13 (Draft 2) unchanged — still a training walk', WML.getExerciseConfig('cw_step_13').environment === 'training');
ok('Trial 1 (the assessment after Step 10) keeps its chat', WML.getExerciseConfig('cw_trial_1').panels.chat === true);
ok('Step 11 (workbook) unchanged', WML.getExerciseConfig('cw_step_11').environment === 'free');

// ── 2. THE JOIN — run the real composeDraft against a fake document ───────────────────────────
console.log('\nThe join is prose, in story order, with no labels:');
const ELEMENTS = [
    { id: 'hook', label: 'Hook' }, { id: 'setup', label: 'Setup' }, { id: 'reaction', label: 'Reaction' },
    { id: 'epiphany', label: 'Epiphany' }, { id: 'proaction', label: 'Proaction' },
    { id: 'climax', label: 'Climax' }, { id: 'denouement', label: 'Denouement' },
];
const rows = {
    'cw-step-8-hook': 'The bell rang twice.\nNobody moved.',
    'cw-step-8-setup': 'She took the long way, hood up.',
    'cw-step-8-reaction': '   ',                       // whitespace only — must contribute nothing
    'cw-step-8-epiphany': 'He looked straight at her.',
    'cw-step-8-proaction': 'She stepped off the kerb.',
    'cw-step-8-climax': 'The sentinel turned.',
    'cw-step-8-denouement': 'The street went back to being a street.',
};
const slice = (name) => {
    const i = SRC.indexOf('function ' + name + '(');
    if (i === -1) return null;
    return braceSliceFrom(SRC, i, '{', '}').text;
};
const composeSrc = slice('composeDraft');
const elFidSrc = slice('elFid');
ok('composeDraft exists in the shipped source', !!composeSrc);
ok('elFid exists (one canonical key builder, never a bare prefix)', !!elFidSrc);
if (composeSrc && elFidSrc) {
    const run = new Function('ELEMENTS', 'rowText', `
        function elFid(id) ${elFidSrc}
        function composeDraft() ${composeSrc}
        return composeDraft();
    `);
    const paras = run(ELEMENTS, (fid) => (rows[fid] || '').trim());
    // 6 filled elements, one of which holds TWO lines → 7 paragraphs. Per LINE, not per element:
    // each transferred beat arrived on its own line, so the student's paragraphing survives the join.
    ok('every non-empty line becomes its own paragraph (7 from 6 filled elements, one of them two-line)', paras.length === 7, paras);
    ok('story order is element order — the hook is first', paras[0] === 'The bell rang twice.', paras[0]);
    ok('and the denouement is last', paras[paras.length - 1] === 'The street went back to being a street.', paras[paras.length - 1]);
    ok('a multi-line element keeps BOTH its lines', paras[1] === 'Nobody moved.', paras[1]);
    ok('a whitespace-only element contributes nothing (no blank paragraph)', paras.every(p => p.trim().length > 0), paras);
    const labelLeak = paras.some(p => ELEMENTS.some(e => p.indexOf(e.label) === 0));
    ok('NO element labels in the output — "just prose with no labels"', !labelLeak, paras);
}

// ── 3. THE CONTRACTS THAT ONLY SHOW UP IN THE SOURCE ──────────────────────────────────────────
console.log('\nThe contracts a browser would be needed to see:');
ok('the artifact is scene_draft, NOT scene_selection (which receives the step DOCUMENT)',
    /const DRAFT_KEY = 'scene_draft'/.test(SRC) && !/saveArtifact\([^)]*'scene_selection'/.test(SRC));
ok('the joined section is LOCKED (editable:false → readonly, and invisible to the word counter)',
    /sectionHTML\('response', DRAFT_LABEL, false,/.test(SRC));
ok('the seed only ever fills an EMPTY draft box — polishing is never overwritten',
    /textContent \|\| ''\)\.trim\(\)\.length > 0\) return;\s*\/\/ already started/.test(SRC));
ok('the seed has a fallback source, so one failed artifact write cannot empty Step 10',
    /recovered the scene from the Step-9 document instead/.test(SRC));
ok('a failed artifact save tells the STUDENT, it does not just log',
    /so Step 10 will not open with it yet/.test(SRC));
ok('empty elements are NAMED before a transfer is refused (§4d: a refusal states the way forward)',
    /still empty: \*\*/.test(SRC));
ok('the draft box carries the composition flag for the word counter',
    /\{ 'student-composition': 'true' \}/.test(SRC));
ok('…and that flag is a real schema attr on BOTH canvases (or it dies on the first round-trip)',
    (SRC.match(/studentComposition: \{/g) || []).length === 2, (SRC.match(/studentComposition: \{/g) || []).length);
ok('liveness: after the overview there is always a way forward to the write-out',
    /What do I do now\? →/.test(SRC));
ok('the write-out advice is paced one bubble at a time (§4b), not a wall',
    /serveCwChunks\(WRITEOUT, \{ emit: aiBubble, startAt: at, onDone: writeOutChips \}\)/.test(SRC));
ok('Step 10 tells the truth when the box is empty, on a page with no chat to ask in',
    /If the box below is empty, go back to Step 9/.test(SRC));

// ── 4. TOOLS-MINIMAL — the unaided steps stay unaided (v7.20.507) ─────────────────────────────
console.log('\nSteps 9 and 10 run with the tools stripped:');
ok('Step 9 declares tools: minimal', WML.cwToolsMinimal('cw_step_9'));
ok('Step 10 declares it too', WML.cwToolsMinimal('cw_step_10'));
ok('and NOTHING else does — no sibling inherits an unaided rail by accident',
    JSON.stringify(WML.CW_STEPS.filter(s => s.tools === 'minimal').map(s => s.step)) === '[9,10]',
    WML.CW_STEPS.filter(s => s.tools === 'minimal').map(s => s.step));
ok('Step 8 (the walk before) keeps its tools', !WML.cwToolsMinimal('cw_step_8'));
ok('Trial 1 (the assessment after) keeps its tools', !WML.cwToolsMinimal('cw_trial_1'));
ok('the notes scratchpad reads the SAME predicate as the rail (one source, cannot drift)',
    /cwToolsMinimal\(state\.task\)\)\) \{\s*\n\s*if \(snFab\)/.test(SRC));
ok('all five reference panels route through the rail gate, not a bare appendChild',
    (SRC.match(/_railAdd\((?:wp|sc|ss|mv|rv)Trigger\);/g) || []).length === 5,
    (SRC.match(/_railAdd\((?:wp|sc|ss|mv|rv)Trigger\);/g) || []).length);
ok('…and none of the five is still appended directly',
    !/btnColumn\.appendChild\((?:wp|sc|ss|mv|rv)Trigger\)/.test(SRC));
ok('Resources is gated too (Neil named that button)',
    /cwPanelRes\.length > 0 && !\(WML\.cwToolsMinimal/.test(SRC));
ok('the buttons are still BUILT — only the rail insert is skipped, so no querySelector path goes null',
    /_railAdd = \(btn\) => \{ if \(!_toolsMin\) btnColumn\.appendChild\(btn\); \}/.test(SRC));

console.log(fails
    ? '\n❌ cw9-transfer-gate FAILED (' + fails + ')'
    : '\n✅ cw9-transfer-gate passed (Step 9 joins and sends; Step 10 receives it walk-free).');
process.exit(fails ? 1 : 0);
