#!/usr/bin/env node
/* eslint-env node */
/**
 * quiz-bank-reach-harness — v7.20.636. A graded quiz is scored ONLY when its bank is reachable
 * from the slug the live lesson sends. Proves it for every bank, and proves the controller can
 * never hand a graded quiz to the (unscored) AI.
 *
 * THE DEFECT IT GUARDS (prod, 2026-09-26): the AIC lessons send `inspector_calls` (the
 * student-data course-map slug, which every meta key uses) while the MSQ + MSA banks were filed
 * as `an_inspector_calls.md`. Resolution returned 0 questions, the controller showed a transient
 * "please refresh", went inactive, and the student's next message reached the AI, which narrated
 * the whole quiz and recorded nothing. Every AIC final ever sat has no grade.
 *
 * FAILS on:
 *   1. a bank file that is a NEAR-MISS of a live course-map slug (one name contains the other)
 *      but is not reachable from it through the slug family — the AIC shape exactly;
 *   2. a bank resolver (MSQ text / MSA / FQ) that does not walk SWML_Quiz_Bank::slug_family;
 *   3. the controller wiring that keeps a graded quiz off the AI being removed.
 * REPORTS (never fails): course-map texts with no bank of a kind (an authoring gap), and bank
 * files no course-map slug reaches (authored ahead of a course, or dead).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let failures = 0;
const fail = (m) => { failures++; console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

// ── The live slug list: student-data's course map (the form every meta key uses).
const CM_CANDIDATES = [
    path.resolve(ROOT, '../../../sophicly-plugins/sophicly-student-data/includes/class-course-map.php'),
];
const cmPath = CM_CANDIDATES.find(p => fs.existsSync(p));
if (!cmPath) {
    console.log('✗ quiz-bank-reach: student-data course map not found (looked in ' + CM_CANDIDATES.join(', ') + ') — cannot prove reachability.');
    process.exit(1);
}
const cm = fs.readFileSync(cmPath, 'utf8');
const LIVE = [...new Set([...cm.matchAll(/^\s{8}'([a-z0-9_]+)' => array\(/gm)].map(m => m[1]))];

// ── The ONE alias registry (class-rest-api.php $SLUG_ALIASES).
const rest = read('includes/class-rest-api.php');
const aliasBlock = (rest.match(/\$SLUG_ALIASES = \[([\s\S]*?)\];/) || [])[1] || '';
const ALIASES = {};
for (const m of aliasBlock.matchAll(/'([a-z0-9_]+)'\s*=>\s*'([a-z0-9_]+)'/g)) ALIASES[m[1]] = m[2];

// Mirror of SWML_Quiz_Bank::slug_family.
function family(t) {
    const canon = ALIASES[t] || t;
    const f = new Set([t, canon]);
    for (const [a, target] of Object.entries(ALIASES)) if (target === canon) f.add(a);
    return [...f];
}

const DIRS = {
    MSQ: 'protocols/shared/mark-scheme-quiz',
    MSA: 'protocols/shared/mark-scheme-assessment/banks',
    FQ:  'protocols/shared/foundational-quiz/banks',
};
// Generic subject banks are reached by subject/family, not by text — not in scope here.
const GENERIC = new Set(['language1', 'language2', 'modern_text', '19th_century', 'shakespeare', 'poetry_anthology']);

console.log('quiz-bank-reach: ' + LIVE.length + ' live slugs, ' + Object.keys(ALIASES).length + ' aliases');

// Known, named, handed-off gaps — reported loudly every run, never silently passed.
const KNOWN = {
    conflict_poetry_ocr: 'OCR Conflict: the bank is conflict.md (reached by the WML picker id "conflict"), but the course bridge sends conflict_poetry_ocr. "conflict" is shared by the OCR, Edexcel and CCEA pickers, so it cannot be aliased to one board. No OCR students on prod (2026-09-26). Handoff: wml content lane.',
};
const hasOwn = (dir, s) => family(s).some(f => fs.existsSync(path.join(ROOT, dir, f + '.md')) || fs.existsSync(path.join(ROOT, dir, f + '_poetry.md')));

// 1. Reachability.
const reachedBy = (bank) => LIVE.filter(s => family(s).some(f => f === bank || f + '_poetry' === bank));
const unreached = [];
for (const [kind, dir] of Object.entries(DIRS)) {
    const files = fs.readdirSync(path.join(ROOT, dir))
        .filter(f => f.endsWith('.md') && !f.includes('.concept-notes') && !f.startsWith('_') && f !== 'README.md')
        .map(f => f.replace(/\.md$/, ''));
    for (const b of files) {
        if (GENERIC.has(b) || reachedBy(b).length) continue;
        // A near-miss only matters when that live text has NO bank of its own here — then this
        // file is almost certainly its bank, filed under a form the lesson never sends.
        const near = LIVE.filter(s => s.length > 3 && (b.includes(s) || s.includes(b)) && !hasOwn(dir, s));
        const known = near.filter(s => KNOWN[s]);
        known.forEach(s => console.log(`  ! KNOWN GAP ${kind} "${b}.md" ↔ ${s}: ${KNOWN[s]}`));
        const real = near.filter(s => !KNOWN[s]);
        if (real.length) fail(`${kind} bank "${b}.md" is a near-miss of live slug(s) ${real.join(', ')} but NO live slug reaches it — the lesson gets 0 questions. Add ONE line to $SLUG_ALIASES ('${b}' => '${real[0]}'), after checking no meta key uses '${b}'.`);
        else if (!known.length) unreached.push(`${kind}:${b}`);
    }
}
if (!failures) ok('every bank named after a live text is reachable from that text\'s live slug');

// 2. Every resolver walks the family.
const bank = read('includes/class-quiz-bank.php');
const fnBody = (name) => {
    const i = bank.indexOf('public static function ' + name + '(');
    if (i < 0) return '';
    const j = bank.indexOf('\n    public static function ', i + 10);
    return bank.slice(i, j < 0 ? undefined : j);
};
for (const fn of ['parse_sections_text', 'parse_sections_msa', 'parse_sections_fq']) {
    if (/slug_family\(/.test(fnBody(fn))) ok(fn + ' walks slug_family');
    else fail(fn + ' does not walk SWML_Quiz_Bank::slug_family — a bank filed under an alias form becomes unreachable again');
}
if (/resolve_mark_scheme_family\(/.test(fnBody('pick_session'))) ok('pick_session falls back through the one family resolver, not the raw subject');
else fail('pick_session falls back on the RAW subject — "20th_century" (a course category) finds no bank');

// 3. The controller never hands a graded quiz to the AI.
const js = read('frontend/wml-assessment.js');
const checks = [
    [/_quizCtl\.claim\(\{ quizType: _qt \}\)/, 'sendCanvasMessage claims an unrecorded graded quiz for the controller'],
    [/\(_quizCtl\.active \|\| _quizCtl\.loadFailed\)\) \{\s*\n\s*await _quizCtl\.handleTurn/, 'the MSQ arm routes to the controller while a load has failed'],
    [/_fqDeterministic\(\) && \(_quizCtl\.active \|\| _quizCtl\.loadFailed\)/, 'the FQ arm routes to the controller while a load has failed'],
    [/state\.task === 'mark_scheme' && \(_quizCtl\.active \|\| _quizCtl\.loadFailed\)/, 'the MSA arm routes to the controller while a load has failed'],
    [/function _loadFailed\(code\)[\s\S]{0,900}appendQuickBar\('Try again'/, 'a failed load leaves a Try again control (liveness)'],
    [/if \(loadFailed && !active\) \{[\s\S]{0,500}await start(Round)?\(/, 'a typed reply after a failed load retries, never reaches the AI'],
];
for (const [re, label] of checks) (re.test(js) ? ok : fail)(label);
if (/Please refresh/.test((js.match(/async function startRound\(\)[\s\S]*?\n            async function start\(/) || [''])[0]))
    fail('startRound still tells the student to "refresh" — a student typed "refresh" and it went to the AI');
else ok('startRound no longer tells the student to refresh');

// Reports.
const COVER = LIVE.filter(s => !/^(creative_writing|g9_core_skills|ai_essay_perfection|edexcel_igcse_coursework|university_personal_statement|study_groups|teacher_marking|live_modelling_archive)$/.test(s));
// Language papers are served by the PAPER bank (languageN) / the generic subject bank, not a per-text one.
// Mirrors parse_sections_msa's paper regex exactly — IGCSE 'lang_a_paper_2' does NOT match it.
const has = (dir, s) => /(?:lang|language)_?paper[_-]?[12]/.test(s) ? true : hasOwn(dir, s);
const gaps = [];
for (const s of COVER) {
    const miss = Object.entries(DIRS).filter(([k, d]) => !has(d, s)).map(([k]) => k);
    if (miss.length) gaps.push(`${s} (no ${miss.join('/')})`);
}
console.log('  · REPORT — live texts with no per-text bank of a kind (MSQ falls back to a generic bank; MSA/FQ have no fallback): ' + (gaps.length ? '\n      ' + gaps.join('\n      ') : 'none'));
console.log('  · REPORT — banks no live slug reaches (authored ahead of a course, or dead): ' + (unreached.length ? unreached.join(', ') : 'none'));

console.log(failures ? `✗ quiz-bank-reach: ${failures} failure(s)` : '✓ quiz-bank-reach: all checks pass');
process.exit(failures ? 1 : 0);
