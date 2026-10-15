#!/usr/bin/env node
/* eslint-env node */
/**
 * aim-grade-harness.js — v7.20.898 (WML 360 A; found verifying Maysa 1279's Edexcel IGCSE Paper 2 assessment for Neil).
 *
 * MEASURED: on staging the student chose "Grade 8" at the assessment kickoff and the Action Plan's grade goal read "Grade 7".
 * On prod (15 Oct) 6 of 8 language assessment documents whose kickoff aim could be read carried a grade goal the student
 * did not choose — every one LOWER (857 chose 8 → "Grade 6"; 1398 9 → "Grade 7"; Mishel 1237 9 → "Grade 4"; 1401 7 →
 * "Grade 5"). The "student's choice wins" rule (v7.19.872, _studentAimGrade) only read "I'm aiming for Grade N", but a
 * LANGUAGE paper's kickoff reply is the bare chip "Grade 8" (_gradeKickoffValue sends it bare on purpose), so for every
 * language paper the model's re-guess won.
 *
 * What it proves, from the SHIPPED code:
 *   A. READER — _studentAimGrade, executed: the bare language chip, the literature sentence, a typed number and a bolded
 *               question all count; a "Grade N" said anywhere except straight after the grade question does not; the
 *               last stated aim wins.
 *   B. WIRING — the Action Plan's grade-goal fill asks it before writing; the language kickoff still sends the bare grade.
 *   C. FALSIFY — three mutations each fail A.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

function fnSrc(src, name) {
    const a = src.indexOf('\n    function ' + name + '(');
    if (a < 0) throw new Error('missing function ' + name);
    const start = a + 1;
    const firstLineEnd = src.indexOf('\n', start);
    if (/\}\s*$/.test(src.slice(start, firstLineEnd))) return src.slice(start, firstLineEnd);
    return src.slice(start, src.indexOf('\n    }\n', start) + 6);
}
function load(src) {
    const ctx = { _chatShell: { history: [] } };
    vm.createContext(ctx);
    vm.runInContext(fnSrc(src, '_planChainNorm') + '\n' + fnSrc(src, '_studentAimGrade') + '\nthis.aim = _studentAimGrade;', ctx);
    return (history) => { ctx._chatShell.history = history; return ctx.aim(); };
}

const A = (c) => ({ role: 'assistant', content: c });
const U = (c) => ({ role: 'user', content: c, preChain: true });
// The kickoff question exactly as the staging IGCSE P2 run served it (15 Oct).
const Q = "Hi Neil! Welcome to the assessment phase.\n\nI've received your Language Paper 2 diagnostic response (944 words). Let's review your writing together.\n\nBefore I begin marking, I need to know: what grade are you aiming for? This helps me tailor my feedback to where you want to be.";
const CASES = [
    ['a language paper\'s bare chip ("Grade 8")', [A(Q), U('Grade 8')], 'Grade 8'],
    ['the literature sentence ("I\'m aiming for Grade 7.")', [A(Q), U("I'm aiming for Grade 7.")], 'Grade 7'],
    ['a typed number ("8")', [A(Q), U('8')], 'Grade 8'],
    ['the question in bold mid-phrase', [A('Before we begin — what **grade** are you aiming for?'), U('Grade 6')], 'Grade 6'],
    ['the measured IGCSE run: aim, then the headline-goal pick and the rest', [A(Q), U('Grade 8'), A('Setup · Goal — what was the one main goal you were working toward?'), U('B) Analysing how the writer uses language and structure for effect (AO2)'), A('What were the key aspects it asked you to explore?'), U('Grade 5 was my last mark')], 'Grade 8'],
    ['a "Grade N" said anywhere but straight after the grade question does not count', [A('What did you get last time?'), U('Grade 6')], ''],
    ['the last stated aim wins', [A(Q), U('Grade 7'), A('Noted.'), U("Actually I'm aiming for Grade 9")], 'Grade 9'],
    ['no aim stated', [A(Q), U('not sure')], ''],
];
function run(aim, quiet) {
    const bad = [];
    for (const [label, hist, want] of CASES) {
        const got = aim(hist);
        if (got !== want) bad.push(label);
        if (!quiet) ok(got === want, label + ' → ' + JSON.stringify(got) + (got === want ? '' : '  WANT ' + JSON.stringify(want)));
    }
    return bad;
}

console.log('A. _studentAimGrade, executed');
run(load(JS0), false);

console.log('B. wiring');
ok(/if \(s\.field === 'action-grade-goal'\) \{\s*const aim = _studentAimGrade\(\);\s*if \(aim && aim !== s\.value\) \{[\s\S]{0,200}s\.value = aim;/.test(JS0),
    'the Action Plan grade-goal fill asks the reader and the student\'s choice replaces the model\'s value');
ok(/if \(!_isLit\) return g;/.test(fnSrc(JS0, '_gradeKickoffValue')), 'a language kickoff still sends the bare grade (the shape the reader now reads)');

console.log('C. falsify — each mutation must break A');
const MUT = [
    ['any bare "Grade N" counts, wherever it was said', (s) => s.replace('if (!mm && asked) mm =', 'if (!mm) mm =')],
    ['the bare reply ignored (the pre-.898 reader)', (s) => s.replace("if (!mm && asked) mm = c.match(/^\\s*\\**\\s*Grade\\s*(\\d)\\b/i) || c.match(/^\\s*(\\d)\\s*\\.?\\s*$/);", '')],
    ['the question read without markdown normalising', (s) => s.replace("asked = /what grade are you aiming for/i.test(_planChainNorm(msg.content || ''));", "asked = /what grade are you aiming for/i.test(String(msg.content || ''));")],
];
for (const [label, mut] of MUT) {
    const src = mut(JS0);
    if (src === JS0) { ok(false, 'mutation did not apply: ' + label); continue; }
    let bad = [];
    try { bad = run(load(src), true); } catch (e) { bad = ['threw ' + e.message]; }
    ok(bad.length > 0, 'mutation caught: ' + label + (bad.length ? ' (' + bad.length + ' case' + (bad.length === 1 ? '' : 's') + ' fail)' : ' — NOT CAUGHT'));
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
