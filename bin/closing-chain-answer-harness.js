#!/usr/bin/env node
/* eslint-env node */
/**
 * closing-chain-answer-harness.js — v7.20.658 (FIXLIST #653): AN ACTION-PLAN ANSWER IS ONLY FILED
 * WHEN IT IS ONE.
 *
 * WHY THIS EXISTS
 * Measured on prod (Anam 1298, AQA Lang P2 diagnostic): her four action-plan "answers" were
 * "can u squeeze in one more mark please" · "I have a question" · "wait" · "waittt". The closing chain
 * took every message as the answer, her question got no reply, and the filing turn wrote her
 * Short-term Aims in HER voice ("Right now I can… Next time I'll…") — words she never said.
 *
 * WHAT IT CHECKS
 *   1. THE RULE — _ccClassify / _ccPendingIn / _ccAnswersIn are EXTRACTED from the shipped file
 *      (between the @CC-ANSWER-PURE sentinels), never re-typed, and driven with her exact messages,
 *      with real answers (option chips, sentences, an answer that happens to end in "?"), and with
 *      the "I have a question" → next message IS the question hand-over.
 *   2. THE WIRING — the intercept classifies BEFORE it files; the drive re-asks the waiting
 *      question BEFORE it would ask the next one or file; the filing directive carries the accepted
 *      answers and forbids first-person words the student did not say.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');

let pass = 0, failN = 0;
function ok(cond, label, detail) {
    if (cond) { pass++; console.log('  ✓ ' + label); }
    else { failN++; console.log('  ✗ ' + label + (detail ? ' — ' + detail : '')); }
}
// body of a top-level function, by name
const fnBody = (name) => {
    const i = js.indexOf('function ' + name + '(');
    if (i === -1) return '';
    let d = 0;
    for (let k = js.indexOf('{', i); k < js.length; k++) {
        if (js[k] === '{') d++;
        else if (js[k] === '}') { d--; if (!d) return js.slice(i, k + 1); }
    }
    return '';
};

console.log('\n1 · the rule (extracted from the shipped file)');
const a = js.indexOf('// ── @CC-ANSWER-PURE');
const b = js.indexOf('// ── @CC-ANSWER-PURE-END ──');
ok(a !== -1 && b > a, '@CC-ANSWER-PURE sentinels present');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(js.slice(a, b).replace(/^\s*const /gm, 'var '), ctx);
const C = (m, after) => ctx._ccClassify(m, after);

// Anam's four, verbatim (prod chat swml_chat_aqa_aqa_lang_paper_2_t1_assessment #72–#78)
ok(C('can u squeeze in one more mark please') === 'question', 'Anam: "can u squeeze in one more mark please" → a question for Sophia, never an answer');
ok(C('I have a question') === 'ask', 'Anam: "I have a question" → invited to ask, never an answer');
ok(C('wait') === 'hold', 'Anam: "wait" → a hold, never an answer');
ok(C('waittt') === 'hold', 'Anam: "waittt" → a hold, never an answer');
// her other messages that same session
ok(C('question 3 remarked pls') === 'question', '"question 3 remarked pls" → a question (a re-mark request)');
ok(C('the real mark is actually 51') === 'question', '"the real mark is actually 51" → a question (a mark dispute)');
// holds
['Wait!', 'hold on', 'one sec', 'hmm', 'ummm', 'just a minute', ''].forEach(m => ok(C(m) === 'hold', 'hold: ' + JSON.stringify(m)));
// real answers stay answers
['My focus: Analysing how writers use language for effect (AO2)', 'A', 'F',
 'I lost marks on Q4 because my last paragraphs were notes, not sentences',
 'Write every paragraph in full sentences and add a reader-effect sentence',
 'In history I can use evidence to back up each point',
 'maybe in history when I write essays?',
 "I don't know"].forEach(m => ok(C(m) === 'answer', 'answer: ' + JSON.stringify(m)));
// questions
ok(C('what was I missing in my question 4?') === 'question', 'a real question ("what … ?") → Sophia answers it');
ok(C('Can you explain AO3 again?') === 'question', '"Can you explain AO3 again?" → question');
// the hand-over after "I have a question"
ok(C('why did I get 0 for body paragraph 2', true) === 'question', 'after "I have a question", the next message IS the question (even with no "?")');

console.log('\n2 · the waiting question and the accepted answers');
const Q = (k) => ({ role: 'assistant', content: { ap1: '**1. Where am I going?** Which ONE criterion…', ap2: '**2. How am I going?** In one sentence…', ap3: '**3. Where to next?** One specific sentence…', transfer: 'Last question — **transfer**. How could you apply that skill to another subject you study?' }[k] });
const U = (c, extra) => Object.assign({ role: 'user', content: c }, extra || {});
ok(ctx._ccPendingIn([Q('ap1')]) === 'ap1', 'an ask with no answer is waiting');
ok(ctx._ccPendingIn([Q('ap1'), U('A', { closingChain: true })]) === null, 'an accepted answer closes it');
ok(ctx._ccPendingIn([Q('ap2'), U('wait', { closingHold: 'hold' })]) === 'ap2', 'a hold leaves the question waiting');
ok(ctx._ccPendingIn([Q('ap2'), U('can u squeeze in one more mark please', { closingHold: 'question' }), U('SYSTEM (not from the student): …', { hidden: true }), { role: 'assistant', content: 'Your marks follow the evidence…' }]) === 'ap2',
    'after Sophia answers a mid-plan question, the SAME question is still waiting (not the next one)');
ok(ctx._ccPendingIn([Q('ap3'), { role: 'assistant', content: 'Back to your action plan. **3. Where to next?** One specific sentence…' }]) === 'ap3', 'a re-ask is recognised as the same question');
const anamReplay = [Q('ap1'), U('can u squeeze in one more mark please', { closingHold: 'question' }), { role: 'assistant', content: 'Your marks follow the evidence.' },
    { role: 'assistant', content: 'Back to your action plan.\n\n**1. Where am I going?**' }, U('My focus: comparing writers’ perspectives (AO3)', { closingChain: true }),
    Q('ap2'), U('I have a question', { closingHold: 'ask' }), U('why was Q4 so low', { closingHold: 'question' }), { role: 'assistant', content: 'Because three sections were notes.' },
    { role: 'assistant', content: 'Back to your action plan. **2. How am I going?**' }, U('My Q4 was 5/16 because I wrote notes', { closingChain: true }),
    Q('ap3'), U('wait', { closingHold: 'hold' }), U('Write every paragraph in full sentences', { closingChain: true }),
    Q('transfer'), U('waittt', { closingHold: 'hold' }), U('In history essays I can back every point with evidence', { closingChain: true })];
const ans = ctx._ccAnswersIn(anamReplay);
ok(ans.ap1 === 'My focus: comparing writers’ perspectives (AO3)' && ans.ap2 === 'My Q4 was 5/16 because I wrote notes'
    && ans.ap3 === 'Write every paragraph in full sentences' && ans.transfer === 'In history essays I can back every point with evidence',
    'Anam’s session replayed with the fix: the four filed answers are her four REAL answers', JSON.stringify(ans));
ok(!Object.values(ans).some(v => /wait|squeeze|I have a question/i.test(v)), '…and none of "wait" / "squeeze" / "I have a question" is filed');

console.log('\n3 · the wiring');
const icc = fnBody('_interceptClosingChain');
ok(/_ccClassify\(/.test(icc) && icc.indexOf('_ccClassify(') < icc.indexOf('closingChain: true'), 'the intercept classifies BEFORE it files an answer');
ok(/kind === 'question'[\s\S]*_silentSystemSend\(/.test(icc) && /do NOT emit @FIELD_SET/.test(icc), 'a real question goes to Sophia with "answer it, file nothing"');
ok(/durable: true[^)]*not an answer/.test(icc) || /closingHold: kind \}, \{ durable: true/.test(icc), 'the student’s non-answer is kept in the transcript (it happened) but never marked as an answer');
const dcc = fnBody('_driveClosingChain');
ok(/_ccPendingIn\(/.test(dcc) && dcc.indexOf('_ccPendingIn(') < dcc.indexOf("stage === 'file'"), 'after Sophia’s reply the WAITING question is re-asked before anything is filed or the next is asked');
ok(/_renderClosingQuestion\(_pend, true\)/.test(dcc), '…and it is re-asked as "Back to your action plan."');
const fcf = fnBody('_fireClosingFiling');
ok(/_ccAnswersIn\(/.test(fcf), 'the filing directive is handed the accepted answers');
ok(/never write first-person sentences/.test(fcf) && /never invent one/.test(fcf), 'the filing directive forbids first-person words the student did not say');
ok(!/sharpening their action-plan answers and transfer example — never re-ask them; \(2\)/.test(fcf), 'the old "sharpening their answers" licence is gone from the filed fields');

console.log('\n' + (failN ? '✗ closing-chain-answer-harness FAILED' : '✅ closing-chain-answer-harness passed') + ' (' + pass + ' passed, ' + failN + ' failed).');
process.exit(failN ? 1 : 0);
