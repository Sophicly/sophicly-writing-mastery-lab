#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-step-coherence-lint — the CW course numbering must agree with itself.
 *
 * WHY THIS EXISTS (v7.20.452, and it is a scar not a precaution):
 * Neil inserted a new Step 8 and the course renumbered 8..29 -> 9..30. The incoming handoff said
 * the change touched ONE file. It touched six, and my own pre-ship sweep still missed the document
 * builder — because I grepped `cwStepDef.step <op> N` and the builder is written `step === N`.
 * The result shipped to staging and rendered the SCENE SELECTION document under the heading
 * "Update Plot: Values". Nothing caught it. A human comparing two lists is exactly the check that
 * fails silently, so it is a script now.
 *
 * WHAT IT ASSERTS — agreement between the independent number-keyed surfaces:
 *   1. CW_STEPS is contiguous 1..N with no gaps or duplicates.
 *   2. Every step in CW_STEPS has a protocol file in the router map, and that file EXISTS.
 *   3. The router's filename map and its label map cover exactly the same tasks.
 *   4. Each CW-STEP-NN-*.md file's own H1 says "Step NN" — the filename cannot drift from content.
 *   5. Every plot-update step is in CW_ARTIFACT_MAP as 'plot_outline', and the published
 *      "N of M" ladder in the protocols matches the actual number of plot-update steps.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: guess which numeric literals are step numbers. `step >= 8`
 * (assessment protocol), `_GRADE_BG` (grades 1-9) and `LIT_WORD_TARGETS` (marks) all look
 * identical to a regex and are NOT steps. Three of them were nearly "fixed" by hand during the
 * renumber. This lint checks CROSS-SURFACE AGREEMENT, which is falsifiable, instead.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const ROUTER = fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8');
const ASSESS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const PROTO_DIR = path.join(ROOT, 'protocols/shared/creative-writing');

let failed = 0;
const fail = (m) => { console.log('  ✗ ' + m); failed++; };
const ok = (m) => console.log('  ✓ ' + m);

function slice(src, startRe, endRe) {
    const s = src.search(startRe);
    if (s < 0) return '';
    const rest = src.slice(s);
    const e = rest.search(endRe);
    return e < 0 ? rest : rest.slice(0, e);
}

// ── 1. CW_STEPS contiguous ────────────────────────────────────────────────────
const stepsBlock = slice(CORE, /const CW_STEPS = \[/, /^\s{4}\];/m);
const steps = [...stepsBlock.matchAll(/\{\s*step:\s*(\d+),\s*label:\s*'([^']+)'/g)]
    .map(m => ({ n: +m[1], label: m[2] }));
const nums = steps.map(s => s.n).sort((a, b) => a - b);
const dupes = nums.filter((n, i) => nums.indexOf(n) !== i);
if (!steps.length) fail('CW_STEPS not parsed — the lint cannot see the registry');
else if (dupes.length) fail(`CW_STEPS has duplicate step numbers: ${[...new Set(dupes)].join(', ')}`);
else {
    const gaps = [];
    for (let i = 1; i <= nums[nums.length - 1]; i++) if (!nums.includes(i)) gaps.push(i);
    if (gaps.length) fail(`CW_STEPS has gaps at: ${gaps.join(', ')}`);
    else ok(`CW_STEPS is contiguous 1..${nums[nums.length - 1]} (${steps.length} steps, no duplicates)`);
}

// ── 2 + 3. Router maps agree with each other, and every file exists ───────────
const fileMap = {};
for (const m of ROUTER.matchAll(/'(cw_step_\d+)'\s*=>\s*'(CW-STEP-[^']+\.md)'/g)) fileMap[m[1]] = m[2];
const labelBlock = slice(ROUTER, /'cw_step_1' => '/, /\];/);
const labelMap = {};
for (const m of labelBlock.matchAll(/'(cw_step_\d+)'\s*=>\s*'([^']+)'/g)) labelMap[m[1]] = m[2];

let missingFile = 0, missingMap = 0;
for (const s of steps) {
    const task = 'cw_step_' + s.n;
    if (!fileMap[task]) { fail(`${task} (${s.label}) is in CW_STEPS but has NO protocol file mapped`); missingMap++; continue; }
    if (!fs.existsSync(path.join(PROTO_DIR, fileMap[task]))) { fail(`${task} maps to ${fileMap[task]} — FILE DOES NOT EXIST`); missingFile++; }
}
if (!missingMap && !missingFile) ok(`every one of the ${steps.length} steps maps to a protocol file that exists`);

const fileTasks = Object.keys(fileMap).sort();
const labelTasks = Object.keys(labelMap).sort();
const onlyFile = fileTasks.filter(t => !labelTasks.includes(t));
const onlyLabel = labelTasks.filter(t => !fileTasks.includes(t));
if (onlyFile.length || onlyLabel.length) {
    fail(`the router's two maps disagree — only in filename map: [${onlyFile}] · only in label map: [${onlyLabel}]`);
} else ok(`the router's filename map and label map cover the same ${fileTasks.length} tasks`);

// ── 4. Each protocol file's own heading matches its filename number ───────────
let hdrBad = 0;
for (const f of fs.readdirSync(PROTO_DIR).filter(f => /^CW-STEP-\d+-.*\.md$/.test(f))) {
    const n = parseInt(f.match(/^CW-STEP-(\d+)/)[1], 10);
    const first = fs.readFileSync(path.join(PROTO_DIR, f), 'utf8').split('\n')[0];
    const said = first.match(/Step (\d+)/);
    if (!said) { fail(`${f}: first heading names no step number`); hdrBad++; }
    else if (+said[1] !== n) { fail(`${f}: filename says ${n}, heading says Step ${said[1]}`); hdrBad++; }
}
if (!hdrBad) ok('every CW-STEP-NN protocol file\'s heading matches its own filename');

// ── 5. Plot-update family agrees across code and published ladder ────────────
const gate = ASSESS.match(/if \(\[([\d,\s]+)\]\.includes\(step\)\) \{/);
if (!gate) fail('could not find the plot-update step gate in wml-assessment.js');
else {
    const updateSteps = gate[1].split(',').map(s => +s.trim()).sort((a, b) => a - b);
    const artBlock = slice(CORE, /const CW_ARTIFACT_MAP = \{/, /\};/);
    const plotOutlineSteps = [...artBlock.matchAll(/(\d+):\s*'plot_outline'/g)].map(m => +m[1]).sort((a, b) => a - b);
    const missing = updateSteps.filter(s => !plotOutlineSteps.includes(s));
    if (missing.length) fail(`plot-update step(s) ${missing.join(', ')} do not write 'plot_outline' in CW_ARTIFACT_MAP`);
    else ok(`all ${updateSteps.length} plot-update steps write plot_outline (${updateSteps.join(', ')})`);

    // The student-facing ladder must say the true count.
    const N = updateSteps.length;
    let ladderBad = 0;
    const badCode = [...ASSESS.matchAll(/update: '(\d+) of (\d+)/g)].filter(m => +m[2] !== N);
    if (badCode.length) { fail(`wml-assessment.js publishes "of ${badCode[0][2]}" but there are ${N} plot updates`); ladderBad++; }
    for (const f of fs.readdirSync(PROTO_DIR).filter(f => /update-plot/.test(f))) {
        const txt = fs.readFileSync(path.join(PROTO_DIR, f), 'utf8');
        const m = txt.match(/updated \*\*(\w+) times\*\*/);
        const WORDS = { five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
        if (m && WORDS[m[1]] !== N) { fail(`${f} tells the student the outline is updated "${m[1]} times" — it is ${N}`); ladderBad++; }
        const u = txt.match(/\(Update \d+ of (\d+)\)/);
        if (u && +u[1] !== N) { fail(`${f} says "of ${u[1]}" in its task heading — it is ${N}`); ladderBad++; }
    }
    if (!ladderBad) ok(`the published ladder says ${N} plot updates everywhere it is stated`);
}

// ── 6. No SECOND source for the plot-update step set ─────────────────────────
// v7.20.455. Check 5 above proves the ladder the TEMPLATE gate uses is coherent. It cannot
// see a literal list held somewhere else — and five sites held `[11, 14, 17, 20, 23, 26]`,
// invisible to the .451 renumber sweep (which grepped `cwStepDef.step <op> N`). Stale, they
// were wrong in both directions: step 8 was not a plot update, and steps 11/14/17/20/23/26
// were, so entering Character Profile / Archetypes / Empathy / Theme & Tone / Genre /
// Structural Elements loaded the plot outline over that step's own document. The predicate
// is now derived (`isCwPlotUpdateStep`), so ANY re-introduced literal is a second source.
{
    const CANON = [...ASSESS.matchAll(/^\s{8}(\d+):\s*\{\s*layer:/gm)].map(m => +m[1]).sort((a, b) => a - b);
    if (!CANON.length) fail('could not read CW_PLOT_UPDATE_INFO — the plot-update ladder source is missing');
    else {
        const canonSet = CANON.join(',');
        // ⚠️ DO NOT "improve" this into an overlap test. The first cut of this check asked
        // whether a literal OVERLAPPED the ladder — and it passed the real defect cleanly,
        // because a renumber SHIFTS EVERY ELEMENT: the stale [11,14,17,20,23,26] shares not
        // one member with [8,12,15,18,21,24,27]. A stale copy looks maximally UNLIKE the
        // truth, so the only sound test is "names steps, and is not EXACTLY the ladder".
        const suspects = [
            // const plotUpdateSteps = [ ... ];   — a step list held in a variable
            ...ASSESS.matchAll(/(?:const|let|var)\s+(\w*[Ss]tep\w*)\s*=\s*\[\s*(\d+(?:\s*,\s*\d+){3,})\s*\]/g),
            // [ ... ].includes(step) / .indexOf(stepNum)  — a step list tested inline
            ...ASSESS.matchAll(/\[\s*(\d+(?:\s*,\s*\d+){3,})\s*\]\s*\.\s*(?:includes|indexOf)\s*\(\s*[\w?.]*[Ss]tep\w*/g),
        ];
        let bad = 0;
        for (const m of suspects) {
            const digits = (m[2] !== undefined ? m[2] : m[1]);
            const list = digits.split(',').map(s => +s.trim()).sort((a, b) => a - b);
            // EXACTLY the ladder = the template gate itself (check 5 reads it). Allowed.
            if (list.join(',') === canonSet) continue;
            fail(`literal step list [${list.join(', ')}] is a second source for a CW step set — `
                + `the ladder is [${canonSet}] (CW_PLOT_UPDATE_INFO). Derive it (isCwPlotUpdateStep / `
                + `CW_ARTIFACT_MAP); a renumber cannot find a literal.`);
            bad++;
        }
        if (!bad) ok(`the plot-update step set has ONE source (CW_PLOT_UPDATE_INFO: ${canonSet})`);
    }
}

console.log(failed ? `\n❌ cw-step-coherence-lint FAILED (${failed})` : '\n✅ cw-step-coherence-lint passed (CW numbering agrees across every surface).');
process.exit(failed ? 1 : 0);
