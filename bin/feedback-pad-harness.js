#!/usr/bin/env node
/* eslint-env node */
/**
 * feedback-pad-harness.js — v7.20.858 (FIXLIST popout-feedback-only + popout-zorder). Neil, 13 Oct, on a Macbeth
 * "Get Your Assessment & Feedback" lesson: the Response's "Pop out feedback ↗" "has given me basically everything…
 * really all I want is the feedback section… And I should be able to open them as well… I can open the feedback for
 * the paragraphs… but I can't open the others." And, with several pads open: "if I click on one, surely that should
 * become the one that's at the highest level, no?"
 *
 * Three defects, three checks:
 *   1. The Feedback pad chooses its sections by TYPE (action · feedback · scores), never by .swml-collapsible —
 *      that class has been on every section family since v7.20.97, which is how the plans and the response leaked in.
 *      Driven on a fake document holding the real section order of a Literature assessment document.
 *   2. The pad's open/close listener finds ANY section block, not only type 'feedback'.
 *   3. The pad a person presses comes to the front: _raisePad is extracted from the shipped file and run on fake
 *      pads; both pad shells (spawnExtractPanel's own drag code and _makePanelInteractive) wire it.
 *
 * Usage: node bin/feedback-pad-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { braceSliceFrom } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, got) {
    if (cond) { pass++; console.log('  ✓ ' + msg); }
    else { fail++; console.log('  ✗ ' + msg + (got !== undefined ? '  — got: ' + JSON.stringify(got) : '')); }
}
function fnBody(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i === -1) return null;
    const b = braceSliceFrom(SRC, i, '{', '}');
    return b ? SRC.slice(i, b.end) : null;
}
function arrowBody(decl) {
    const i = SRC.indexOf(decl);
    if (i === -1) return null;
    const b = braceSliceFrom(SRC, i, '{', '}');
    return b ? SRC.slice(i, b.end) : null;
}

// ── 1. the pad takes the feedback family, by type ──────────────────────────────────────────────────────────────
console.log('\n1. the Feedback pad holds the feedback section — and only it');
const renderFb = arrowBody('const _renderFeedbackPad = () =>');
ok(!!renderFb, '_renderFeedbackPad found');
const code = (renderFb || '').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
ok(!/querySelectorAll\(\s*'[^']*swml-collapsible/.test(code), 'it no longer selects by .swml-collapsible (every section has the chevron now)');
const typesM = code.match(/FB_PAD_TYPES\s*=\s*\{([^}]*)\}/);
const types = typesM ? typesM[1].split(',').map(s => s.split(':')[0].trim()).filter(Boolean).sort() : [];
ok(JSON.stringify(types) === JSON.stringify(['action', 'feedback', 'scores']), 'the family is exactly action · feedback · scores', types);

// The real section order of 1287's Macbeth topic-1 assessment document (prod, read 13 Oct 2026).
const DOC = [
    ['question', 'Question & Extract'], ['divider', 'QUESTION FOCUS'], ['notes', 'Question Focus: Keywords'],
    ['divider', 'ESSAY PLAN'], ['plan', 'Plan: Introduction'], ['plan', 'Plan: Body Paragraph 1'],
    ['plan', 'Plan: Body Paragraph 2'], ['plan', 'Plan: Body Paragraph 3'], ['plan', 'Plan: Conclusion'],
    ['divider', 'RESPONSE'], ['response', 'Response'], ['notice', 'What happens next?'], ['divider', 'FEEDBACK'],
    ['action', 'Self-Assessment'], ['action', 'Mark-Scheme Self-Assessment'], ['action', 'Calibration'],
    ['feedback', 'Feedback: Introduction (0 / 3)'], ['feedback', 'Feedback: Body 1 (1.5 / 8)'],
    ['feedback', 'Feedback: Body 2 (2.5 / 8)'], ['feedback', 'Feedback: Body 3 (3 / 8)'],
    ['feedback', 'Feedback: Conclusion (1.75 / 7)'], ['feedback', 'Overall Feedback'], ['divider', 'RESULTS'],
    ['scores', 'Score Summary'], ['feedback', 'Analytics'], ['action', 'Action Plan'], ['progress', 'Document Progress'],
    ['signoff', 'Tutor Sign-off'],
];
const WANT = ['Self-Assessment', 'Mark-Scheme Self-Assessment', 'Calibration', 'Feedback: Introduction (0 / 3)',
    'Feedback: Body 1 (1.5 / 8)', 'Feedback: Body 2 (2.5 / 8)', 'Feedback: Body 3 (3 / 8)',
    'Feedback: Conclusion (1.75 / 7)', 'Overall Feedback', 'Score Summary', 'Analytics', 'Action Plan'];
// Run the shipped selection lines on a fake editor: every section is a .swml-collapsible block (as on the live page).
const selM = code.match(/const FB_PAD_TYPES[\s\S]*?const fbEls\s*=[\s\S]*?;\s*\n/);
let chosen = null;
try {
    const fakeSecs = DOC.map(([t, l]) => ({ getAttribute: (a) => (a === 'data-section-type' ? t : (a === 'data-section-label' ? l : null)) }));
    const editorEl = { querySelectorAll: (sel) => (/swml-section-block/.test(sel) ? fakeSecs : []) };
    // eslint-disable-next-line no-new-func
    chosen = new Function('editorEl', selM[0] + '\nreturn Array.from(fbEls).map(s => s.getAttribute("data-section-label"));')(editorEl);
} catch (e) { chosen = 'ERROR ' + e.message; }
ok(JSON.stringify(chosen) === JSON.stringify(WANT), 'on a real Literature document it picks the 12 feedback sections, in order — no focus, plan or response', chosen);

// ── 2. every chevron in the pad opens ───────────────────────────────────────────────────────────────────────────
console.log('\n2. every section in the pad opens and closes');
const spawn = fnBody('spawnExtractPanel');
ok(!!spawn, 'spawnExtractPanel found');
const lst = (spawn || '').match(/closest\('\.swml-fb-toggle'\)[\s\S]{0,900}?_padFbCollapsed\[lbl\]\s*=\s*nowCollapsed/);
ok(!!lst, 'the pad’s delegated chevron listener found');
const lstCode = lst ? lst[0].split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n') : '';
ok(/t\.closest\('\.swml-section-block'\)/.test(lstCode), 'it toggles the nearest section block (action / scores / feedback alike)');
ok(!/closest\('\.swml-section-feedback'\)/.test(lstCode), 'it no longer insists on type feedback (Self-Assessment, Calibration, Score Summary, Action Plan stayed shut)');

// ── 3. the pad you press comes to the front ─────────────────────────────────────────────────────────────────────
console.log('\n3. the pad you press comes to the front');
const raiseSrc = fnBody('_raisePad');
ok(!!raiseSrc, '_raisePad found');
function mkPad(name) { return { name, style: { zIndex: '' } }; }
let pads = [];
const fakeDoc = { querySelectorAll: (sel) => (sel === '.swml-extract-panel' ? pads.slice() : []) };
let raise = null;
try {
    // eslint-disable-next-line no-new-func
    raise = new Function('document', raiseSrc + '\nreturn _raisePad;')(fakeDoc);
} catch (e) { ok(false, '_raisePad runs on its own: ' + e.message); }
if (raise) {
    const A = mkPad('A'), B = mkPad('B'), C = mkPad('C');
    pads = [A, B, C];                      // DOM order: A opened first, C last (C is on top by DOM order)
    const z = (p) => parseInt(p.style.zIndex, 10);
    const top = () => pads.slice().sort((x, y) => z(y) - z(x))[0].name;
    raise(A);
    ok(top() === 'A', 'pressing the OLDEST pad brings it above the newer two', pads.map(p => p.name + ':' + p.style.zIndex));
    ok(z(B) < z(C), '…and the other two keep their order (C still above B)', pads.map(p => p.name + ':' + p.style.zIndex));
    raise(B);
    ok(top() === 'B' && z(A) > z(C), 'pressing B next: B on top, A second, C last', pads.map(p => p.name + ':' + p.style.zIndex));
    for (let i = 0; i < 50; i++) raise(pads[i % 3]);
    const zs = pads.map(z);
    ok(Math.min.apply(null, zs) === 100010 && Math.max.apply(null, zs) === 100012, 'fifty presses later the band is still 100010–100012 (never creeps toward the overlays)', zs);
    const D = mkPad('D');
    raise(D);                               // a new pad, raised before it is in the DOM list (as at open)
    ok(z(D) === 100013, 'a newly opened pad starts on top of the open ones', D.style.zIndex);
}
const mpi = fnBody('_makePanelInteractive');
ok(!!mpi && /_wirePadRaise\(panel\)/.test(mpi), 'the shared pad shell (_makePanelInteractive) wires the raise — trial draft, paragraph, levels, earlier-attempt and comparison pads');
ok(!!spawn && /document\.body\.appendChild\(panel\);\s*\n\s*_wirePadRaise\(panel\)/.test(spawn), 'spawnExtractPanel (extract · essay · feedback · notes pads, its own drag code) wires it too');
const wire = fnBody('_wirePadRaise');
ok(!!wire && /addEventListener\('pointerdown',[^\n]*_raisePad\(panel\)[^\n]*,\s*true\)/.test(wire), 'the raise listens on pointerdown in the capture phase (touch too; a control that stops propagation still raises its pad)');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ feedback-pad-harness FAILED'); process.exit(1); }
console.log('✅ feedback-pad-harness passed (the Feedback pad holds the feedback section, every part opens, the pressed pad is on top).');
