#!/usr/bin/env node
/* eslint-env node */
/**
 * trust-line-harness.js — v7.20.891 (Neil, Actions round ac, 14 Oct: "Yes, the first message of each redraft planning
 * lesson"; words approved on the card, FIXLIST actions-round-ac-answers).
 *
 * A planning lesson's first message has THREE producers, and each must carry the line:
 *   1. the Language pre-chain greeting (AQA + Edexcel IGCSE Language, code) — _planChainQuestionText('greeting')
 *   2. the poetry greeting (AQA poetry anthology, code) — _renderPoetryPlanQuestion('pgreet')
 *   3. Sophia's first reply on every other planning lesson (Literature, other boards) — both canvas pipelines
 *
 * What it proves, from the SHIPPED code (sliced, never copied):
 *   A. WORDS    — the line is Neil's approved words exactly.
 *   B. LEAD     — _planTrustLeadFor gives the line on a planning lesson's first reply only: not on a later reply, not in
 *                 review, not on another task.
 *   C. GREETING — the executed greeting carries the line once, after the welcome and before the plan, and its stage
 *                 detection phrase ("what grade are you aiming for") and the hijack guard still read it correctly.
 *   D. POETRY   — the poetry greeting carries it and keeps its detection phrase.
 *   E. WIRING   — both pipelines compute the lead BEFORE recording (the "no assistant turn yet" read), show and store it,
 *                 and still hand detectPlanningStep the untouched res.reply.
 *   F. WHY E    — the executed detectPlanningStep, given the line, jumps a "Plan Body Paragraph 1" step (the v7.20.706
 *                 class). That is the reason the line never enters res.reply.
 *   G. FALSIFY  — four mutations of the real source each fail A–E.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

const APPROVED = 'Trust the process: we plan each paragraph together now, then outline it, then polish it. That order is what lifts your grade.';
const norm = (s) => String(s || '').replace(/\*/g, '');
const strip = (s) => String(s || '').replace(/<[^>]+>/g, '');

function slice(JS, startMarker, endMarker) {
    const a = JS.indexOf(startMarker);
    if (a < 0) return null;
    const b = JS.indexOf(endMarker, a);
    return b < 0 ? null : JS.slice(a, b + endMarker.length);
}
function fnSlice(JS, header) {
    // Top-level module functions are 4-space indented and close on their own '    }' line.
    const a = JS.indexOf(header);
    if (a < 0) return null;
    const b = JS.indexOf('\n    }\n', a);
    return b < 0 ? null : JS.slice(a, b + 6);
}

function run(JS) {
    const fails = [];
    const ok = (c, m) => { if (!c) fails.push(m); };

    // ── A + B: constants and the lead helper, executed ──
    const helper = slice(JS, '    const PLAN_TRUST_MD = ', '\n    }\n');
    ok(!!helper, 'A: PLAN_TRUST_MD / _planTrustLeadFor found');
    if (!helper) return fails;
    const ctx = { state: { task: 'planning', reviewMode: false } };
    vm.createContext(ctx);
    vm.runInContext(helper + '\nthis.MD = PLAN_TRUST_MD; this.HTML = PLAN_TRUST_HTML; this.lead = _planTrustLeadFor;', ctx);
    ok(norm(ctx.MD) === APPROVED, 'A: the markdown line is the approved words exactly');
    ok(strip(ctx.HTML) === APPROVED, 'A: the html line is the approved words exactly');
    const fresh = [{ role: 'user', content: "Let's begin!", hidden: true }];
    ok(ctx.lead(fresh) === ctx.MD + '\n\n', 'B: a planning lesson\'s first reply gets the line');
    ok(ctx.lead(fresh.concat([{ role: 'assistant', content: 'Hello' }])) === '', 'B: a later reply does not');
    ctx.state.reviewMode = true;
    ok(ctx.lead(fresh) === '', 'B: review mode does not');
    ctx.state.reviewMode = false; ctx.state.task = 'assessment';
    ok(ctx.lead(fresh) === '', 'B: another task does not');
    ctx.state.task = 'planning';

    // ── C: the Language pre-chain greeting, executed with doc stubs ──
    const greetFn = fnSlice(JS, '    function _planChainQuestionText(stage, firstName) {');
    ok(!!greetFn, 'C: _planChainQuestionText found');
    if (greetFn) {
        const g = { state: ctx.state, canvasEditor: null };
        vm.createContext(g);
        const stubs = `
            function _planDocQuestionFacts() { return { total: 5, planned: ['Q2', 'Q3', 'Q4'], untrained: ['Q1'] }; }
            function _planCountWord(n) { return ['zero','one','two','three','four','five'][n] || String(n); }
            function _planListJoin(a) { return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
            function _planUntrainedNote() { return '(Q1 is a quick comprehension question.)'; }
            function _planPaperName() { return 'AQA English Language Paper 1'; }
            function _planChainPreds() { return ['predQ', 'predA']; }
            function _planSourceLabel() { return 'Source A'; }
            function _planSourceName() { return 'Source A'; }`;
        vm.runInContext(helper + stubs + '\n' + greetFn + '\nthis.t = _planChainQuestionText("greeting", "Ali");', g);
        const p = g.t.plain, h = g.t.html;
        ok((p.split(g.MD || ctx.MD).length - 1) === 1, 'C: the greeting carries the line exactly once');
        const iW = p.indexOf('Welcome to your planning session'), iT = p.indexOf(ctx.MD), iH = p.indexOf("Here's what's coming");
        ok(iW >= 0 && iT > iW && iH > iT, 'C: the line sits after the welcome and before the plan');
        ok((h.split(ctx.HTML).length - 1) === 1, 'C: the greeting html carries the line exactly once');
        ok(/what grade are you aiming for/i.test(norm(p)), 'C: the stage-detection phrase still reads');
        ok(!/@FIELD_COMMIT|Inference 1 \(Source A\)|anchor quote/i.test(norm(p)), 'C: the hijack guard does not fire on the greeting');
    }

    // ── D: the poetry greeting ──
    ok(/plain = 'We\\'re planning your comparison of ' [^\n]*'\.\\n\\n' \+ PLAN_TRUST_MD \+ '\\n\\nChoose the poem to compare it with:';/.test(JS),
        'D: the poetry greeting\'s stored text carries the line and keeps "planning your comparison of"');
    ok(/\+ '\.<\/p><div style="margin-top:8px">' \+ PLAN_TRUST_HTML \+ '<\/div><p style="margin-top:8px">Choose the anthology poem/.test(JS),
        'D: the poetry greeting\'s bubble carries the line');

    // ── E: wiring, both pipelines ──
    const leadLine = "const _trustLead = (cleanReply && cleanReply.trim()) ? _planTrustLeadFor(canvasChatHistory) : '';";
    const show = "addChatMessage(_trustLead ? (_walkBeat ? _beatChipBlock(_walkBeat) : '') + formatAI(_trustLead + cleanReply) : formatted, 'ai', _trustLead + cleanReply);";
    const store = "{ role: 'assistant', content: _trustLead + res.reply, beat: _walkBeat } : { role: 'assistant', content: _trustLead + res.reply }";
    const at = (s) => { const out = []; let i = -1; while ((i = JS.indexOf(s, i + 1)) >= 0) out.push(i); return out; };
    const L = at(leadLine), S = at(show), R = at(store);
    ok(L.length === 2 && S.length === 2 && R.length === 2, 'E: both pipelines compute, show and store the lead (' + L.length + '/' + S.length + '/' + R.length + ')');
    ok(L.length === 2 && R.length === 2 && L[0] < S[0] && S[0] < R[0] && L[1] < S[1] && S[1] < R[1],
        'E: the lead is read before the reply is recorded (else "no assistant turn yet" is always false)');
    ok(/detectPlanningStep\(res\.reply, state\.step\)/.test(JS) && !/detectPlanningStep\([^)]*_trustLead/.test(JS),
        'E: detectPlanningStep still reads the untouched res.reply');
    ok(!/res\.reply = [^\n]*_trustLead|cleanReply = [^\n]*_trustLead/.test(JS), 'E: res.reply and cleanReply are never rewritten with the line');
    return fails;
}

// ── F: why the line never enters res.reply — the executed keyword fallback jumps a step on it ──
function whyCheck() {
    const fn = fnSlice(SRC, '    function detectPlanningStep(aiText, currentStep) {');
    if (!fn) return ['F: detectPlanningStep not found'];
    const label = { textContent: 'Plan Body Paragraph 1' };
    const stepEl = { dataset: { step: '2' }, querySelector: () => label };
    const c = { console: { log() {} }, document: { querySelectorAll: () => [stepEl] } };
    vm.createContext(c);
    vm.runInContext(fn + '\nthis.d = detectPlanningStep;', c);
    const withLine = c.d(APPROVED + '\n\nWhat is your thesis?', 1);
    const without = c.d('What is your thesis?', 1);
    return (withLine === 2 && without === 1) ? [] : ['F: expected the line to jump the step (got ' + withLine + ') and the reply alone not to (got ' + without + ')'];
}

let failed = 0;
const base = run(SRC).concat(whyCheck());
base.forEach(f => { console.log('  ❌ ' + f); failed++; });
if (!base.length) console.log('  ✅ A–F: approved words · first reply only · greeting (executed) · poetry · both pipelines · why res.reply stays clean');

// ── G: falsify ──
const MUTATIONS = [
    ['greeting loses the line', s => s.replace('${paperName}.\\n\\n${PLAN_TRUST_MD}\\n\\nHere', '${paperName}. Here')],
    ['lead ignores history', s => s.replace("if ((history || []).some(m => m && m.role === 'assistant')) return '';", '')],
    ['pipeline 2 stores the bare reply', s => { const i = s.lastIndexOf("content: _trustLead + res.reply }"); return s.slice(0, i) + 'content: res.reply }' + s.slice(i + 'content: _trustLead + res.reply }'.length); }],
    ['words drift', s => s.replace("const PLAN_TRUST_MD = '**Trust the process:** we plan", "const PLAN_TRUST_MD = '**Trust the process:** we will plan")],
];
MUTATIONS.forEach(([name, mut]) => {
    const m = mut(SRC);
    if (m === SRC) { console.log('  ❌ G: mutation "' + name + '" did not apply — the harness is aimed at old code'); failed++; return; }
    const r = run(m);
    if (r.length) console.log('  ✅ G: "' + name + '" is caught (' + r[0] + ')');
    else { console.log('  ❌ G: "' + name + '" passed — the gate is blind to it'); failed++; }
});

if (failed) { console.log('\n❌ FAIL — trust-line-harness'); process.exit(1); }
console.log('\n✅ PASS — trust-line-harness');
