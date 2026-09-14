#!/usr/bin/env node
/* eslint-env node */
// REAL-STATE VERIFY probe for Edexcel IGCSE Spec A Lang P1 (PLANNING-LADDER-PORT-RECIPE §2).
// Runs the SHIPPED outline builders (sliced from wml-assessment.js, never reimplemented) with
// this paper's REAL spec values, and prints the fieldIds each question would actually render.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.argv[2] || path.join(__dirname, '..');
// v7.20.625: board/subject are ARGUMENTS. The probe was hardcoded to Edexcel IGCSE, so the
// AQA papers it shares every builder with could regress without it noticing.
//   node bin/paper-render-probe.js . aqa language_p1
const BOARD = process.argv[3] || 'edexcel-igcse';
const SUBJ  = process.argv[4] || 'language_p1';
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

function slice(marker, opener = '{') {
    const i = src.indexOf(marker);
    if (i < 0) throw new Error('marker not found: ' + marker);
    let j = src.indexOf(opener, i), depth = 0, k = j;
    for (; k < src.length; k++) {
        const ch = src[k];
        if (ch === '{' || ch === '[') depth++;
        else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
    }
    let end = k + 1;
    if (src[end] === ';') end++;
    return src.slice(i, end);
}

const parts = [
    slice('const OUTLINE_BODY_ONLY_OVERRIDES = {'),
    slice('const OUTLINE_BODY_FOCUS = {'),
    slice('const OUTLINE_CRITERIA = {'),
    slice('const OUTLINE_SPECS = {'),
    slice('function needsFullEssayStructure(', '('),
    slice('function getOutlineSpecKey(', '('),
    slice('function getParagraphCount(', '('),
    slice('const OUTLINE_VERIFIED_PAPERS = {'),
    slice('const SWML_PERSUASIVE_RE = ', ';'),
    slice('function _outlinePaperKey(', '('),
    slice('function _outlinePaperVerified(', '('),
    slice('function _resolveBodyOnlyOutline(', '('),
    slice('function buildIntroCriteria(', '('),
    slice('function buildConclusionCriteria(', '('),
    slice('function buildOutlineSection(', '('),
    slice('function buildInferenceOutlineSection(', '('),
    slice('function buildIUMVCCOutlineSection(', '('),
    slice('function _iumvccFieldId(', '('),
    slice('function _iuPoint(', '('),
];

const captured = [];
const explicit = {
    console,
    LIT_ESSAY_BODY_COUNT: parseInt((src.match(/var LIT_ESSAY_BODY_COUNT = (\d+)/) || [, '3'])[1], 10),
    outlineRowHTML: (crit, fid) => { captured.push(fid); return ''; },
    sectionHTML: (t, l, a, b, inner) => inner || '',
    _specSubjectKey: () => SUBJ,
    state: { board: BOARD, subject: SUBJ },
};
const NOOP = new Proxy(function () { return NOOP; }, {
    get: (t, k) => (k === Symbol.toPrimitive || k === 'toString' ? () => '__STUB__' : NOOP),
});
const sandbox = new Proxy(explicit, {
    has: () => true,
    get: (t, k) => (k in t ? t[k] : (k in globalThis ? globalThis[k] : NOOP)),
    set: (t, k, v) => { t[k] = v; return true; },
});
// v7.20.625: slices can overlap (a brace-matched block may swallow a later declaration),
// which then re-declares a const and throws. Drop any part wholly contained in another.
const uniq = parts.filter((a, i) => !parts.some((b, j) => j !== i && b.length > a.length && b.includes(a)));
vm.runInContext(uniq.join('\n'), vm.createContext(sandbox));

const spec = require(path.join(ROOT, 'protocols/shared/language-paper-specs.json'))[BOARD][SUBJ];
const qs = [];
for (const sec of spec.sections) for (const q of sec.questions) qs.push(q);

function render(fn) { captured.length = 0; try { fn(); } catch (e) { return ['THREW: ' + e.message]; } return captured.slice(); }

console.log(`=== REAL DISPATCH SIMULATION — board=${BOARD} subject=${SUBJ}, mode=redraft ===\n`);
for (const q of qs) {
    const qId = q.id, qMarks = q.marks, qType = q.type, aos = q.aos;
    const bodyOnly = sandbox._resolveBodyOnlyOutline(qId, qType, qMarks, aos, q);
    // v7.20.625: call the SHIPPED registry helper. These two lines used to COPY the gate
    // conditions, so the probe reported on its own copy and could not see a dispatch change
    // at all — the exact defect class it was built to catch.
    const isP2Comparison = sandbox._outlinePaperVerified('comparison') && qType === 'comparison';
    const isP2Inference  = sandbox._outlinePaperVerified('inference')  && qType === 'short_analysis';
    const admitted = qType !== 'multiple_choice' && (qMarks >= 20 || bodyOnly || isP2Comparison || isP2Inference);

    console.log(`--- ${qId}  (${qMarks} marks, type=${qType}, ${aos.join('+')}) ---`);
    console.log(`    _resolveBodyOnlyOutline -> ${bodyOnly ? JSON.stringify(bodyOnly) : 'null'}`);
    console.log(`    outline gate admits?    -> ${admitted}`);
    if (!admitted) { console.log('    => NO OUTLINE RENDERED\n'); continue; }

    let branch, ids;
    if (bodyOnly) {
        branch = 'body-only';
        ids = render(() => sandbox.buildOutlineSection(aos, qId, qMarks, null,
            { bodyOnly: bodyOnly.bodies, stampAO: bodyOnly.ao, focus: bodyOnly.focus }));
    } else if (isP2Comparison) {
        branch = 'P2 comparative overlay';
        ids = render(() => sandbox.buildOutlineSection(aos, qId, qMarks, 'aqa_language_p2_comparison', { focus: 'comparative', stampAO: 'AO3' }));
    } else if (isP2Inference) {
        branch = 'P2 inference';
        ids = render(() => sandbox.buildInferenceOutlineSection(qId, 2));
    } else {
        branch = 'PLAIN full-essay (final else)';
        ids = render(() => sandbox.buildOutlineSection(aos, qId, qMarks));
    }
    console.log(`    BRANCH TAKEN            -> ${branch}`);
    console.log(`    ${ids.length} row(s):`);
    ids.forEach(i => console.log('        ' + i));
    console.log();
}

console.log('=== WHAT Q5 *WOULD* RENDER IF THE COMPARATIVE OVERLAY WERE ALLOWED FOR THIS BOARD ===');
const want = render(() => sandbox.buildOutlineSection(['AO3'], 'Q5', 22, 'aqa_language_p2_comparison', { focus: 'comparative', stampAO: 'AO3' }));
console.log(`${want.length} row(s):`); want.forEach(i => console.log('    ' + i));

console.log('\n=== WHAT SECTION B *WOULD* RENDER AS IUMVCC ===');
const iu = render(() => sandbox.buildIUMVCCOutlineSection('Q6'));
console.log(`${iu.length} row(s):`); iu.forEach(i => console.log('    ' + i));
