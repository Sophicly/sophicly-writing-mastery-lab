#!/usr/bin/env node
/* eslint-env node */
/**
 * misfiled-answer-gate.js — v7.20.583, FIXLIST #459
 *
 * Dwij Patel (1215), through the dashboard message wall, 2026-08-29: "I wrote my response in
 * the response plan box and the AI is not detecting anything in the response box."
 * Neil: "we've been through this many, many, many times… find the root issue and the root
 * solution… and make a gate for it."
 *
 * THE ROOT, measured on his real AQA Lang P1 assessment doc: Q2–Q5 answers of 127 · 120 · 323
 * · 383 words sat in the PLAN boxes; every RESPONSE box was empty. Every component then did
 * its job faithfully — the payload said "NOT ATTEMPTED", the protocol marked 0, Sophia said
 * "I go by what's logged" twice — and the student was stuck with 850 words nobody would mark.
 * A refusal with no way forward, which §4d makes unreachable by construction. And because
 * the assessment doc freezes once Q1 is marked (reseed-until-marked), his own later fix in
 * the diagnostic never reached it.
 *
 * WHAT THIS GATE PROVES, on his exact document shape:
 *   1. the predicate finds every misfiled question and no real plan
 *   2. the move puts the text in the Response box and empties the Plan box
 *   3. BOTH canvas pipelines intercept before any turn reaches the API (dual-pipeline rule)
 *   4. a declined move still tells the marker the words exist (payload honesty)
 *   5. the diagnostic's completion button asks before the answer freezes
 *   6. a dismissed question is not re-asked
 *   7. every screen the guard leaves the student on has a way forward (liveness)
 * and --inject-defect removes the intercept and requires the gate to FAIL.
 *
 * Node builtins only — CI has no npm install.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_PATH = path.join(ROOT, 'frontend', 'wml-assessment.js');
let SRC = fs.readFileSync(SRC_PATH, 'utf8');
const INJECT = process.argv.includes('--inject-defect');

if (INJECT) {
    const before = SRC;
    SRC = SRC.replace(/if \(_interceptMisfiledAnswers\(\{[\s\S]*?\}\)\) return;\n/g, '/* injected: intercept removed */\n');
    if (SRC === before) { console.error('⛔ --inject-defect found nothing to remove — the gate would pass for the wrong reason.'); process.exit(2); }
}

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ❌ ' + m); } };

// ── slice real functions (whole, never truncated — §14c) ────────────────────
function extractFunction(name) {
    const at = SRC.indexOf('function ' + name + '(');
    if (at < 0) throw new Error('cannot find function ' + name);
    let i = SRC.indexOf('{', at), depth = 0, inS = null, esc = false, inLine = false, inBlock = false;
    for (; i < SRC.length; i++) {
        const c = SRC[i], n = SRC[i + 1];
        if (inLine) { if (c === '\n') inLine = false; continue; }
        if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
        if (inS) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inS) inS = null; continue; }
        if (c === '/' && n === '/') { inLine = true; i++; continue; }
        if (c === '/' && n === '*') { inBlock = true; i++; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return SRC.slice(at, i + 1); }
    }
    throw new Error('unbalanced braces reading ' + name);
}
const constLine = (name) => { const m = SRC.match(new RegExp('const ' + name + ' = [^;]+;')); if (!m) throw new Error('no ' + name); return m[0]; };

// ── a doc model with the REAL node interface the predicate walks ───────────
function field(fieldId, text) {
    return { type: { name: 'inputField' }, attrs: { fieldId }, textContent: text, nodeSize: text.length + 2 };
}
function docOf(fields) {
    return { descendants(fn) { fields.forEach(f => fn(f, 0)); } };
}
function editorOf(fields) { return { state: { doc: docOf(fields) } }; }

// Dwij's real shape (his own plan lengths; the prose is placeholder of the same size).
const prose = (n) => Array.from({ length: n }, (_, i) => (i % 15 === 14 ? 'end.' : 'word')).join(' ');
const notes = 'Two TTECEA Paragraphs “wind lashing the trees” “the roaring Pacific Ocean”';   // 12 words, no sentence
const DWIJ = [
    field('Q1-point-1', 'No planning stage for this one'),
    field('plan-Q2-para-1', notes + ' ' + prose(115)),  field('Q2-response', ''),
    field('plan-Q3-para-1', prose(120)),               field('Q3-response', ''),
    field('plan-Q4-para-1', prose(323)),               field('Q4-response', ''),
    field('plan-Q5-para-1', prose(383)),               field('Q5-response', ''),
];
// A student who did it right, with a DETAILED plan — must not be flagged.
const RIGHT = [
    field('plan-Q2-para-1', 'topic sentence · “wind lashing” · pathetic fallacy · effect: dread · purpose · ' + prose(30).replace(/end\./g, 'note')),
    field('Q2-response', prose(109)),
    field('plan-Q4-para-1', 'Intro 3BP - TTECEA Conclusion “Alex was angry with his father, his sister” a plan of twenty eight words here for the record ok'),
    field('Q4-response', prose(295)),
];

const sandbox = () => {
    const box = {
        _WC_PLACEHOLDERS: ['write your essay here.', 'write your response here.'],
        canvasEditor: null, state: { task: 'assessment', attempt: 1 }, sessionStorage: (() => { const m = {}; return { getItem: k => m[k] || null, setItem: (k, v) => { m[k] = v; } }; })(),
        WML: { canvasDocScope: () => ({ board: 'aqa', text: 'aqa_lang_paper_1', topic: 1, suffix: '_assessment' }) },
        saveCanvasContent: () => { box.saved = (box.saved || 0) + 1; },
        saved: 0,
    };
    // the real _setInputFieldText writes through the editor; here the editor IS the field list
    box._setInputFieldText = (fieldId, text) => {
        const f = box.canvasEditor.state.doc._fields.find(x => x.attrs.fieldId === fieldId);
        if (!f) return false; f.textContent = text || ''; return true;
    };
    return box;
};
function build(box) {
    const src = [constLine('MISFILED_MIN_WORDS'), constLine('MISFILED_MIN_SENTENCE'),
        extractFunction('_fieldTextFromNode'), extractFunction('_wordsIn'), extractFunction('_looksLikeProse'),
        extractFunction('_misfiledAnswersInDoc'), extractFunction('_moveMisfiledAnswer'),
        extractFunction('_misfiledDismissKey'), extractFunction('_misfiledDismissed'), extractFunction('_misfiledDismiss'), extractFunction('_misfiledPending'),
        'return { _misfiledAnswersInDoc, _moveMisfiledAnswer, _misfiledPending, _misfiledDismiss };'].join('\n');
    return new Function(...Object.keys(box), src)(...Object.values(box));
}
const withFields = (fields) => { const d = docOf(fields); d._fields = fields; return { state: { doc: d } }; };

console.log('\nmisfiled-answer-gate — an answer in the Plan box is caught, moved, and never marked as nothing\n');

console.log('1 · the predicate, on Dwij\'s real document shape:');
{
    const box = sandbox(); const api = build(box);
    const hits = api._misfiledAnswersInDoc(editorOf(DWIJ));
    ok(hits.map(h => h.qId).join(',') === 'Q2,Q3,Q4,Q5', 'finds Q2, Q3, Q4 and Q5 (got ' + hits.map(h => h.qId).join(',') + ')');
    ok(hits.every(h => h.responseFieldId === h.qId + '-response'), 'each hit names its Response box');
    ok(hits[0].planWords >= 120, 'and reports the plan\'s word count (Q2: ' + hits[0].planWords + ')');
    const none = api._misfiledAnswersInDoc(editorOf(RIGHT));
    ok(none.length === 0, 'a student who wrote in the right box — even with a detailed plan — is NOT flagged (got ' + none.length + ')');
    ok(api._misfiledAnswersInDoc(editorOf([field('plan-Q2-para-1', prose(120)), field('Q2-response', 'write your response here.')])).length === 1,
        'a Response box holding only its placeholder counts as empty');
    ok(api._misfiledAnswersInDoc(null).length === 0, 'a missing editor answers "none", never throws');
}

console.log('\n2 · the move:');
{
    // new Function binds by VALUE — the editor must exist before the slice is built.
    const box = sandbox();
    const fields = DWIJ.map(f => field(f.attrs.fieldId, f.textContent));
    box.canvasEditor = withFields(fields);
    const api = build(box);
    const hit = api._misfiledAnswersInDoc(box.canvasEditor)[0];
    const planBefore = fields.find(f => f.attrs.fieldId === 'plan-Q2-para-1').textContent;
    ok(api._moveMisfiledAnswer(hit) === true, 'reports success');
    ok(fields.find(f => f.attrs.fieldId === 'Q2-response').textContent === planBefore, 'the Response box now holds every word that was in the Plan box');
    ok(fields.find(f => f.attrs.fieldId === 'plan-Q2-para-1').textContent === '', 'and the Plan box is empty — no duplicate to double-count');
    ok(box.saved >= 1, 'the document is saved (' + box.saved + ')');
    ok(api._misfiledAnswersInDoc(box.canvasEditor).map(h => h.qId).join(',') === 'Q3,Q4,Q5', 'Q2 is no longer misfiled; the others still are');
}

console.log('\n3 · both pipelines intercept BEFORE the API (dual chat pipeline rule):');
{
    const calls = (SRC.match(/if \(_interceptMisfiledAnswers\(\{/g) || []).length;
    ok(calls === 2, 'the intercept is called in exactly two pipelines (got ' + calls + ')');
    const closing = SRC.split('if (!canvasSilentSend && _interceptClosingChain(msg)) return;');
    ok(closing.length === 3 && closing[1].indexOf('_interceptMisfiledAnswers') >= 0 && closing[1].indexOf('_interceptMisfiledAnswers') < closing[1].indexOf('canvasChatLoading = true')
        && closing[2].indexOf('_interceptMisfiledAnswers') >= 0 && closing[2].indexOf('_interceptMisfiledAnswers') < closing[2].indexOf('canvasChatLoading = true'),
        'in each, it runs after the closing-chain gate and before the turn is marked loading — i.e. before any fetch');
    const fn = extractFunction('_interceptMisfiledAnswers');
    ok(!/fetch\(|API\./.test(fn), 'the intercept itself makes no API call');
    ok(/durable: false/.test(fn), 'its turn is durable:false — a present-state assertion is never replayed (fossil law)');
    ok(/history: canvasChatHistory/.test(SRC.split('_interceptMisfiledAnswers({')[1] || '') && /history: canvasChatHistory/.test(SRC.split('_interceptMisfiledAnswers({')[2] || ''),
        'both pipelines hand it their closure-local history (the .898 out-of-scope class)');
}

console.log('\n4 · a declined move still reaches the marker honestly:');
{
    const fn = extractFunction('getResponseText');
    ok(/NOT ATTEMPTED \(empty\)\$\{_planNote\}/.test(fn), 'the NOT ATTEMPTED line carries a plan-box note');
    ok(/data-section-type="plan"/.test(fn) && /MISFILED_MIN_WORDS/.test(fn), 'the note is derived from the plan sections by the same threshold as the intercept');
    ok(/do NOT tell them nothing was written/.test(fn), 'and it forbids the "nothing was written" line Dwij was given twice');
}

console.log('\n5 · the diagnostic asks before the answer freezes:');
{
    const proxy = SRC.slice(SRC.indexOf('function buildLdCompleteProxy'), SRC.indexOf('function mountLdCompleteProxy'));
    ok(/_confirmMisfiledBeforeComplete\(\)/.test(proxy), 'the completion proxy calls the confirm');
    ok(proxy.indexOf('_confirmMisfiledBeforeComplete') < proxy.indexOf('ldMarkBtn.click()'), 'before it forwards the click to LearnDash');
    ok(/state\.task === 'diagnostic' \|\| state\.task === ''/.test(proxy) && /!canvasInAssessment/.test(proxy), 'only on the diagnostic write, never on an assessment already under way');
    ok(/_restLabel/.test(proxy) && !/Mark Complete';\s*\n\s*markBtn\.disabled = false/.test(proxy), 'handing the button back restores its captured label (no second literal)');
    const conf = extractFunction('_confirmMisfiledBeforeComplete');
    ok(/resolve\('proceed'\)/.test(conf) && /close\('moved'\)/.test(conf), 'both outcomes resolve — the promise can never hang the button');
    ok(/overscroll-behavior:contain/.test(conf) && /'touchmove'/.test(conf), 'the modal isolates scroll (house rule)');
}

console.log('\n6 · a dismissed question is not re-asked:');
{
    const box = sandbox(); const api = build(box);
    const ed = editorOf(DWIJ);
    ok(api._misfiledPending(ed).length === 4, 'four pending before any decision');
    api._misfiledDismiss(['Q2', 'Q3']);
    ok(api._misfiledPending(ed).map(h => h.qId).join(',') === 'Q4,Q5', 'after dismissing Q2 and Q3, only Q4 and Q5 are pending');
    box.state.attempt = 2;
    ok(api._misfiledPending(ed).length === 4, 'a new attempt starts clean — dismissals are per document, per attempt');
}

console.log('\n7 · liveness — every screen the guard leaves has a way forward:');
{
    const fn = extractFunction('_interceptMisfiledAnswers');
    const mkChips = (fn.match(/bar\.appendChild\(mk\(/g) || []).length;
    ok(mkChips === 2 && /Looks right — carry on/.test(fn), 'the intercept renders three chips: move · it is a plan · carry on (mk×' + mkChips + ' + carry on)');
    ok(/resend\(\)/.test(fn.split('mark as unanswered').pop()), '"it really is a plan" resends the turn itself — the student is not left to re-type');
    ok(/resend\(\)/.test(fn.split('Looks right — carry on').pop().split('}')[0] + '}'), 'after a move, "carry on" resends the turn');
    ok(/_swmlScrollToTop/.test(fn), 'the document scrolls to the box the student must look at (§4c.10)');
    ok(/couldn't move that automatically/.test(fn), 'a failed move says so and says what to do — never a silent no-op');
}

console.log('\n' + (checks - fails) + '/' + checks + ' passed.');
if (INJECT) {
    if (!fails) { console.error('\n⛔ GATE IS BLIND: removing the intercept did not fail it.'); process.exit(1); }
    console.log('Defect injection produced ' + fails + ' failure(s) — the gate has teeth.');
    process.exit(0);
}
process.exit(fails ? 1 : 0);
