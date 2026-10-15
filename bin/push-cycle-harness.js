#!/usr/bin/env node
/* eslint-env node */
/**
 * push-cycle-harness.js — v7.20.905 (FIXLIST push-cycle-loses-first-answer, WML 361 A).
 *
 * MEASURED before the fix (staging, test student 1938, AQA Language P1 Topic 1 planning, 106 captured turns, 15 Oct):
 * 13 push cycles. When Sophia pushed on an element and then accepted the follow-up, @FIELD_COMMIT filed ONLY the
 * follow-up. In 9 cycles the follow-up added the missing detail, so the first answer — the half the push asked them to
 * build on — was lost (Q4 BP1 Effect 1 kept the "why" and lost "I feel a mix of amusement and sadness"). In 3 the
 * student rewrote the same sentence, where the latest answer is right.
 *
 * What it proves, from the SHIPPED code (sentinel slice + source checks):
 *   A. DECISION — pushCycleEarlierAnswers, executed on the captured cycles (real student words): an added detail keeps
 *                 the first answer; a restated answer, a rewrite element (topic sentence), a wrong answer, an
 *                 "I don't know", an option pick, a hidden send and the previous element's answer are never filed.
 *   B. DECLARED — every FILING element type in every ladder registry has a push-cycle kind (§4c.6: a new ask cannot
 *                 inherit the wrong one silently).
 *   C. WIRING   — both chat pipelines pass the history; the filer anchors on the reply it is applying; an answer already
 *                 in the box is not filed twice.
 *   D. FALSIFY  — five mutations of the decision each fail A.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

const SB = '    // @PUSH-CYCLE-PURE-BEGIN', SE = '    // @PUSH-CYCLE-PURE-END';
function load(src) {
    const B = src.indexOf(SB), E = src.indexOf(SE);
    if (!(B > 0 && E > B)) throw new Error('PUSH-CYCLE sentinels missing');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src.slice(B, E) + '\nthis.f = pushCycleEarlierAnswers; this.K = PUSH_CYCLE_BY_TYPE;', ctx);
    return { f: ctx.f, K: ctx.K };
}

// History builders — U = a student turn, A = Sophia's reply with the ladder stamp code puts on it.
const U = (t, hidden) => ({ role: 'user', content: t, hidden: !!hidden });
const A = (el, verdict, source) => ({ role: 'assistant', content: 'reply', ladder: { el: el, verdict: verdict, source: source || 'llm' } });
const ASK = (prevEl) => A(prevEl, 'resolved');   // the reply that accepted the previous element and asked for this one

const E1 = 'outline-body-1-effects', P3 = 'outline-body-1-purpose-q3', P2 = 'outline-body-1-purpose-q2', T = 'outline-body-1-topic';
const CASES = [
    // [label, history, el, kind, expected earlier answers]
    ['Effect 1 (capture #68→#69): the feeling, then the words that make it — BOTH filed',
        [ASK('outline-body-1-analysis'),
         U('I feel a mix of amusement and sadness - it\'s funny, but I pity the dad trying so hard and failing.'), A(E1, 'weak'),
         U('\'not exactly\' creates the amusement because it\'s a gentle joke, and \'good cook\' creates the pity because we know he is trying to be both parents now.'), A(E1, 'resolved')],
        E1, 'accumulate', ['I feel a mix of amusement and sadness - it\'s funny, but I pity the dad trying so hard and failing.']],
    ['Purpose (capture #42→#43): the writer\'s aim, then where the anger shows — BOTH filed',
        [ASK('outline-body-1-effects2-q3'),
         U('Allende puts the dream first to reveal that the fear of losing his mother has already taken over Alex\'s mind, so the reader understands his anger later.'), A(P3, 'weak'),
         U('His anger first shows at breakfast when he snaps \'Shut up, Nicole\', so the dream prepares us to see that the anger is really fear for his mum.'), A(P3, 'resolved')],
        P3, 'accumulate', ['Allende puts the dream first to reveal that the fear of losing his mother has already taken over Alex\'s mind, so the reader understands his anger later.']],
    ['Purpose (capture #12→#13→#14): pushed, picked "A) reveal", RESTATED the sentence — only the latest',
        [ASK('outline-body-1-effects2-q2'),
         U('Allende uses the storm to show that Alex\'s fear about his mother\'s illness is too big for him to put into words, so nature expresses it for him.'), A(P2, 'weak'),
         U('A) reveal'), A(P2, 'weak', 'heal-none'),
         U('Allende uses the storm to reveal that Alex\'s fear about his mother\'s illness is too big for him to put into words, so nature voices it for him.'), A(P2, 'resolved')],
        P2, 'accumulate', []],
    ['Topic sentence (capture #62→#63) is a REWRITE element — only the latest',
        [ASK('q4-concepts'),
         U('It tests \'struggling to cope\' - I partly agree: Alex is struggling, but the understatement about his dad reveals the whole family is struggling.'), A(T, 'weak'),
         U('Alex is struggling to cope, but so is the whole family, because his mother\'s illness has taken away the person who held them together.'), A(T, 'resolved')],
        T, 'rewrite', []],
    ['a WRONG first answer is never filed',
        [ASK('outline-body-1-analysis'), U('The reader feels happy because the dad is a brilliant cook here.'), A(E1, 'wrong'),
         U('I pity the dad because the understatement shows he is failing at cooking.'), A(E1, 'resolved')],
        E1, 'accumulate', []],
    ['"I don\'t know" (code-judged failed) is never filed',
        [ASK('outline-body-1-analysis'), U('I don\'t know'), A(E1, 'failed', 'code'),
         U('I pity the dad because the understatement shows he is failing at cooking.'), A(E1, 'resolved')],
        E1, 'accumulate', []],
    ['an unjudged (healed) turn is never filed',
        [ASK('outline-body-1-analysis'), U('Can you give me a hint about the feeling first please'), A(E1, 'weak', 'heal-none'),
         U('I pity the dad because the understatement shows he is failing at cooking.'), A(E1, 'resolved')],
        E1, 'accumulate', []],
    ['an option pick (capture #10 "B) Thought: …") is never filed, even when Sophia judges it',
        [ASK('outline-body-1-effects-q2'), U('B) Thought: what the reader comes to believe or realise'), A('outline-body-1-effects2-q2', 'weak'),
         U('The reader realises the storm isn\'t just weather - it\'s showing us the chaos inside Alex\'s head that he can\'t switch off.'), A('outline-body-1-effects2-q2', 'resolved')],
        'outline-body-1-effects2-q2', 'accumulate', []],
    ['a hidden (code-sent) message is never filed',
        [ASK('outline-body-1-analysis'), U('Continue with the next part of the paragraph', true), A(E1, 'weak'),
         U('I pity the dad because the understatement shows he is failing at cooking.'), A(E1, 'resolved')],
        E1, 'accumulate', []],
    ['the PREVIOUS element\'s answer is never pulled in (the cycle starts after the reply that asked)',
        [U('The word lashing sounds like a whip cracking against the trees outside.'), A('outline-body-1-analysis', 'weak'),
         U('The sh sound is harsh and the present participle makes it feel endless.'), ASK('outline-body-1-analysis'),
         U('I pity the dad because the understatement shows he is failing at cooking.'), A(E1, 'resolved')],
        E1, 'accumulate', []],
    ['two pushes on one element — both earlier answers, in order',
        [ASK('outline-body-1-analysis'), U('I feel sorry for the father in this moment.'), A(E1, 'weak'),
         U('It is also a little funny because the children pretend to like the food.'), A(E1, 'weak'),
         U('\'not exactly\' makes it gentle, so we laugh and pity him at once.'), A(E1, 'resolved')],
        E1, 'accumulate', ['I feel sorry for the father in this moment.', 'It is also a little funny because the children pretend to like the food.']],
    ['the accepting reply is stamped for ANOTHER element — nothing extra filed',
        [ASK('outline-body-1-analysis'), U('I feel sorry for the father in this moment.'), A(E1, 'weak'),
         U('\'not exactly\' makes it gentle, so we laugh and pity him at once.'), A('outline-body-1-effects2', 'resolved')],
        E1, 'accumulate', []],
];

function run(f, quiet) {
    const bad = [];
    for (const [label, hist, el, kind, want] of CASES) {
        let got;
        try { got = f(hist, el, kind); } catch (e) { got = 'threw ' + e.message; }
        const good = JSON.stringify(got) === JSON.stringify(want);
        if (!good) bad.push(label);
        if (!quiet) ok(good, label + (good ? '' : '\n        GOT ' + JSON.stringify(got)));
    }
    return bad;
}

console.log('A. pushCycleEarlierAnswers, executed on the captured cycles');
const L = load(JS0);
run(L.f, false);

console.log('B. every filing element type declares how its push cycle banks');
const types = new Set();
const re = /r\.push\(\{ el: [^}]*?type: '([^']+)', resolveBy: (?!'stamp')/g;
let m;
while ((m = re.exec(JS0)) !== null) types.add(m[1]);
ok(types.size >= 15, 'found ' + types.size + ' filing element types across the ladder registries');
const missing = [...types].filter(t => !L.K[t]);
ok(!missing.length, 'every one has a kind' + (missing.length ? ' — MISSING: ' + missing.join(', ') : ''));
ok(Object.values(L.K).every(v => v === 'accumulate' || v === 'rewrite'), 'each kind is accumulate or rewrite');
['topic', 'thesis', 'hook'].forEach(t => ok(L.K[t] === 'rewrite', t + ' is rewrite (one self-contained sentence)'));
['effect', 'purpose', 'analysis'].forEach(t => ok(L.K[t] === 'accumulate', t + ' is accumulate (the push asks for a missing detail)'));

console.log('C. wiring');
const calls = JS0.match(/applyFieldCommits\(res\.reply, msg, canvasChatHistory\);/g) || [];
ok(calls.length === 2, 'both chat pipelines pass the history (' + calls.length + ' of 2)');
ok(!/applyFieldCommits\(res\.reply, msg\);/.test(JS0), 'no call site still drops it');
const fc = JS0.slice(JS0.indexOf('    function applyFieldCommits('), JS0.indexOf('    function cwMarkdownToDocHtml('));
ok(/const earlier = _pushCycleEarlierFor\(history, fid, aiReply\);/.test(fc), 'applyFieldCommits asks for the push cycle of each committed field');
ok(/inBox\.indexOf\(flat\(t\)\) === -1/.test(fc), 'an answer already in the box is not filed again');
const pf = JS0.slice(JS0.indexOf('    function _pushCycleEarlierFor('), JS0.indexOf('    function _outlineBoxText('));
ok(/history\[at\]\.content\.slice\(-aiReply\.length\) === aiReply/.test(pf), 'the walk anchors on the reply being applied (a later code turn cannot shift it)');
ok(/entry\.resolveBy !== fid\) return \[\]/.test(pf), 'only the element that files into THIS box contributes');
ok(/if \(!kind\) \{ console\.warn/.test(pf), 'an undeclared type warns and files the latest answer only');
ok((JS0.match(/function pushCycleEarlierAnswers\(/g) || []).length === 1, 'ONE decision function');

console.log('D. falsify — each mutation must break A');
const MUT = [
    ['no restatement check', (s) => s.replace("if (w.filter(x => lw.has(x)).length / w.length >= 0.6) return false;", '')],
    ['any verdict counts (wrong answers filed)', (s) => s.replace("a.ladder.verdict !== 'weak' || ", '')],
    ['rewrite treated as accumulate', (s) => s.replace("if (kind !== 'accumulate' || ", 'if (')],
    ['no cycle boundary', (s) => s.replace("if (!a || a.role !== 'assistant' || !a.ladder || a.ladder.el !== el) break;", "if (!a || a.role !== 'assistant' || !a.ladder) break;")],
    ['option picks filed', (s) => s.replace("|| /^[A-H]\\)\\s/.test(t) ", '')],
];
for (const [label, mut] of MUT) {
    const src = mut(JS0);
    if (src === JS0) { ok(false, 'mutation did not apply: ' + label); continue; }
    let bad;
    try { bad = run(load(src).f, true); } catch (e) { bad = ['threw ' + e.message]; }
    ok(bad.length > 0, 'mutation caught: ' + label + (bad.length ? ' (' + bad.length + ' case' + (bad.length === 1 ? '' : 's') + ' fail)' : ' — NOT CAUGHT'));
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
