#!/usr/bin/env node
/* eslint-env node */
/**
 * review-parity-harness.js — v7.20.886: a tutor reviewing a student sees what the student's own load would give them,
 * and the review never runs the student's live walk from the tutor's browser.
 *
 * Found on prod, 14 Oct (Neil reviewing Zayan 1109 and a discuss lesson):
 *   1. SEED — tutor_load_canvas called seed_from_sibling_stage() with five arguments. Since v7.19.855 the seeder walks
 *             the stage chain from $suffix, so the call always seeded nothing: a discuss lesson the student had not
 *             opened yet showed the tutor a BLANK page instead of the read-only preview v7.19.714 built.
 *   2. RESUME — in review mode the boot replay still ran every walk/quiz tryResume(). Their sidecars live in THIS
 *             browser's localStorage with no user id, so the tutor's own Mark Scheme Assessment round resumed under
 *             Zayan's finished one ("Before we begin — what grade are you aiming for?").
 *   3. QUIZ STATE — the review loader never returned quizResult / quizRecorded / quizResults, and the review URL never
 *             sent the foundational-quiz identity, so a recorded quiz showed the tutor no result card and no grade.
 *
 * What it proves, from the SHIPPED source:
 *   A. every call of seed_from_sibling_stage() passes the stage ($suffix) — a five-argument call cannot come back;
 *   B. ONE quiz-state helper, read by both loaders on every return that carries a document;
 *   C. every tp.<walk>.tryResume() in the file sits inside the review-mode guard, and every automatic "Let's begin!"
 *      fresh-entry send is closed in review (v7.20.887: planning sent it to Sophia as the TUTOR — staging, POST /chat ×2);
 *   D. both load URLs carry the quiz identity from ONE builder;
 *   E. six mutations of the real source each make A–D fail.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const REST0 = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');

// The argument list of a call starting at `open` (index of its "("), split on top-level commas.
function args(src, open) {
    let depth = 0, cur = '', out = [];
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '(' || c === '[') { depth++; if (depth === 1) continue; }
        if (c === ')' || c === ']') { depth--; if (depth === 0) { out.push(cur.trim()); return out; } }
        if (c === ',' && depth === 1) { out.push(cur.trim()); cur = ''; continue; }
        cur += c;
    }
    return null;
}
const method = (src, name) => {
    const a = src.indexOf('public function ' + name + '($request) {');
    if (a < 0) return '';
    const rest = src.slice(a + 10);
    const b = rest.search(/\n    (?:public|private|protected)(?: static)? function /);
    return src.slice(a, b < 0 ? undefined : a + 10 + b);
};

function check(JS, REST, verbose) {
    let pass = 0, fail = 0;
    const ok = (cond, msg) => { if (cond) pass++; else fail++; if (verbose) console.log((cond ? '  ✓ ' : '  ✗ ') + msg); };

    if (verbose) console.log('A · the seeder always knows the stage');
    const calls = [];
    const re = /\$this->seed_from_sibling_stage\(/g;
    let m;
    while ((m = re.exec(REST))) calls.push(args(REST, m.index + m[0].length - 1));
    ok(calls.length >= 3, calls.length + ' call(s) of seed_from_sibling_stage() found (student load ×2, reseed, tutor review)');
    calls.forEach((a, i) => ok(a && a.length >= 6 && a[5] === '$suffix', 'call ' + (i + 1) + ' passes the stage as argument 6 (' + (a ? a.length : 0) + ' args)'));
    const tutor = method(REST, 'tutor_load_canvas');
    ok(/seed_from_sibling_stage\(\$student_id, \$board, \$text, \$topic_number, \$meta_key, \$suffix, \$attempt, \$cw_project_id\)/.test(tutor),
        'the tutor preview seeds with the same arguments as load_canvas (student id, project)');

    if (verbose) console.log('\nB · one quiz-state helper, both loaders');
    ok(REST.split('private function quiz_state_for(').length === 2, 'quiz_state_for() is defined exactly once');
    const student = method(REST, 'load_canvas');
    ok(student && !/get_persisted_result\(/.test(student) && !/get_persisted_result\(/.test(tutor), 'neither loader keeps its own copy of the quiz read');
    ok(/\$quiz_state = \$this->quiz_state_for\(\$user_id, \$board, \$text, \$topic_number, \$attempt, \$suffix, \$request\);/.test(student)
        && /'quizRecorded'\s*=> \$quiz_state\['quizRecorded'\]/.test(student), 'load_canvas returns the helper\'s result');
    const tutorReturns = tutor.split('return rest_ensure_response(').slice(1).map((s) => s.slice(0, s.indexOf(';\n')));
    const docReturns = tutorReturns.filter((s) => /'doc' =>/.test(s) && !/'unchanged' => true/.test(s));
    ok(docReturns.length === 3, docReturns.length + ' tutor return(s) carry a document (stored · seed · none)');
    docReturns.forEach((s, i) => ok(/\$this->quiz_state_for\(\$student_id, \$board, \$text, \$topic_number, \$attempt, \$suffix, \$request\)/.test(s),
        'tutor return ' + (i + 1) + ' carries the student\'s quiz state'));
    ok(/'doc' => \$doc, 'attempt' => \$attempt, 'rev' => \$rev\]\)\);/.test(tutor), 'the stored-document return still ends with doc · attempt · rev (live modelling reads rev)');

    if (verbose) console.log('\nC · review mode resumes nothing');
    const G = JS.indexOf('                    // v7.20.886: REVIEW MODE RESUMES NOTHING.');
    const open = JS.indexOf('                    if (!state.reviewMode) {', G);
    const close = JS.indexOf('                    }   // end !state.reviewMode (v7.20.886)', open);
    ok(G > 0 && open > G && open - G < 900 && close > open, 'the guard opens right after its explanation and closes at its end marker');
    const resumes = [];
    const rr = /tp\.[A-Za-z0-9_]+\.tryResume\(/g;
    while ((m = rr.exec(JS))) resumes.push(m.index);
    ok(resumes.length >= 20, resumes.length + ' walk/quiz resume call(s) found');
    const outside = resumes.filter((i) => !(i > open && i < close));
    ok(outside.length === 0, outside.length === 0 ? 'every one sits inside the review guard'
        : outside.length + ' resume call(s) outside the review guard, first at line ' + JS.slice(0, outside[0]).split('\n').length);
    ok(/tp\.quizCtl\.tryResume\(\{ quizType: 'mark_scheme_assessment' \}\)/.test(JS.slice(open, close)), 'the Mark Scheme Assessment resume (the one Neil saw) is among them');
    // The fresh-entry auto-starts: every branch that sends a silent "Let's begin!" on a timer (no tap) is closed in review.
    // (The fresh-entry form is `if (tp.chatTextarea) { … }` inside a timer; the clear-chat re-greet is a TAP and uses `if (tp)`.)
    const autoSends = [];
    const SEND = 'if (tp.chatTextarea) { canvasSilentSend = true; tp.chatTextarea.value = "Let\'s begin!"; tp.sendCanvasMessage(); }';
    for (let at = JS.indexOf(SEND); at !== -1; at = JS.indexOf(SEND, at + 1)) {
        const before = JS.slice(0, at);
        const heads = [...before.matchAll(/\n {16}\} else if \(([^\n]*)\) \{\n/g)];
        autoSends.push(heads.length ? heads[heads.length - 1][1] : '(no branch found)');
    }
    ok(autoSends.length >= 1, autoSends.length + ' automatic "Let\'s begin!" branch(es) found');
    autoSends.forEach((cond) => ok(/!state\.reviewMode/.test(cond), 'auto-start closed in review: else if (' + cond.slice(0, 60) + ')'));

    if (verbose) console.log('\nD · the quiz identity reaches both loads');
    ok(JS.split('function _quizIdentQS() {').length === 2, '_quizIdentQS() is defined exactly once');
    const ru = JS.slice(JS.indexOf('function _reviewCanvasUrl() {'), JS.indexOf('function _quizIdentQS() {'));
    ok(/\$\{_cwReviewProjectQS\(\)\}\$\{_quizIdentQS\(\)\}(?:\$\{_focusQS\(\)\})?`;/.test(ru), 'the review URL sends it');   // v7.20.893: the focus course rides after it
    ok(/const _quizIdent = _quizIdentQS\(\);/.test(JS) && /\$\{_stageSeed\}\$\{_quizIdent\}(?:\$\{_focusQS\(\)\})?`;/.test(JS), 'the student URL sends it from the same builder');

    return { pass, fail };
}

let total = check(JS0, REST0, true);

console.log('\nE · each mutation of the real source is caught');
const MUT = [
    ['tutor seed loses the stage (the v7.19.855 regression)', 'rest',
        'seed_from_sibling_stage($student_id, $board, $text, $topic_number, $meta_key, $suffix, $attempt, $cw_project_id)',
        'seed_from_sibling_stage($student_id, $board, $text, $topic_number, $meta_key)'],
    ['tutor stored-document return drops the quiz state', 'rest',
        "return rest_ensure_response(array_merge($this->quiz_state_for($student_id, $board, $text, $topic_number, $attempt, $suffix, $request), ['success' => true,",
        "return rest_ensure_response(array_merge([], ['success' => true,"],
    ['review guard removed', 'js', "// student's review would read. The fresh-entry starts are already guarded by !state.reviewMode.\n                    if (!state.reviewMode) {\n",
        "// student's review would read. The fresh-entry starts are already guarded by !state.reviewMode.\n                    {\n"],
    ['a resume added after the guard closes', 'js', '                    }   // end !state.reviewMode (v7.20.886)\n',
        '                    }   // end !state.reviewMode (v7.20.886)\n                    if (tp.quizCtl) tp.quizCtl.tryResume();\n'],
    ['planning greets Sophia as the tutor again', 'js', "} else if (state.task === 'planning' && !state.reviewMode) {", "} else if (state.task === 'planning') {"],
    ['review URL forgets the quiz identity', 'js', '${_cwReviewProjectQS()}${_quizIdentQS()}${_focusQS()}`;', '${_cwReviewProjectQS()}${_focusQS()}`;'],
];
const results = [];
MUT.forEach(([name, which, from, to]) => {
    const src = which === 'js' ? JS0 : REST0;
    if (src.split(from).length !== 2) { results.push([false, name + ' — mutation anchor not found exactly once (the harness is stale)']); return; }
    const r = which === 'js' ? check(JS0.replace(from, to), REST0, false) : check(JS0, REST0.replace(from, to), false);
    results.push([r.fail > 0, name + ' → ' + r.fail + ' check(s) fail']);
});
results.forEach(([c, msg]) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (c) total.pass++; else total.fail++; });

console.log('\n' + (total.fail ? '❌' : '✅') + ' review-parity-harness: ' + total.pass + ' passed, ' + total.fail + ' failed');
process.exit(total.fail ? 1 : 0);
