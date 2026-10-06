#!/usr/bin/env node
/* eslint-env node */
// sa-sidebar-harness (v7.20.723, FIXLIST #755) — the sidebar never parks on a Self-Assessment step nobody runs.
//
// Measured on the IGCSE P1 assessment walk (staging 59209, test student 1938, 6 Oct): every assessment doc
// carries the skills "Self-Assessment" section, but the walk that fills it runs only where _saWalkRunsHere()
// says (AQA, first assessment). On IGCSE the rows stayed "—", the group never completed, and the Language
// sidebar's single "current" pointer parked on it — Q1–Q5 were marked and filed, no question ever ticked,
// and every marking bubble was headed "Self-Assessment · Step 1 of 7". This slices the REAL functions.
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, label, got) => { if (c) pass++; else { fail++; console.log('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
const slice = (name) => {
    const m = SRC.match(new RegExp('    function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n    \\}\\n'));
    if (!m) { console.error('❌ sa-sidebar-harness: cannot slice ' + name); process.exit(1); }
    return m[0];
};

// The doc's Self-Assessment section as the template seeds it ("Skill: — / 5" rows under <h3> groups).
function docWith(rated) {
    const groups = [['Introduction', ['Thesis']], ['Body Paragraphs', ['Topic Sentence', 'Evidence']], ['Spelling, Punctuation & Grammar', ['Spelling']]];
    const nodes = [];
    groups.forEach(([g, rows]) => {
        nodes.push({ tagName: 'H3', textContent: g });
        rows.forEach(r => nodes.push({ tagName: 'P', textContent: r + ': ' + (rated ? '4' : '—') + ' / 5' }));
    });
    const sec = { querySelectorAll: () => nodes };
    return { getElementById: () => ({ querySelector: (sel) => (/Self-Assessment/.test(sel) ? sec : null) }) };
}
function run(board, task, rated, reviewMode) {
    const ctx = { state: { board, task, reviewMode: !!reviewMode }, document: docWith(rated), String };
    return new Function('state', 'document', slice('_saWalkRunsHere') + slice('_saWalkEligible') + slice('_saSidebarSteps') +
        '\nreturn { steps: _saSidebarSteps(1), eligible: _saWalkEligible() };')(ctx.state, ctx.document);
}

let r = run('edexcel-igcse', 'assessment', false);
ok(r.steps.present === false && r.steps.firstIncomplete === 0, 'IGCSE (the walk never runs): no Self-Assessment step, so nothing can park the pointer', r.steps);
r = run('aqa', 'assessment', false);
ok(r.steps.present === true && r.steps.firstIncomplete === 2 && r.steps.steps.length === 3, 'AQA first assessment (the walk runs): the step is there and pending', r.steps);
r = run('aqa', 'assessment', true);
ok(r.steps.present === true && r.steps.firstIncomplete === 0, 'AQA, every skill rated → the step is complete');
r = run('aqa', 'assessment', false, true);
ok(r.steps.present === true && r.eligible === false, 'a tutor reviewing an AQA doc still SEES the step (review mode stops the walk, not the sidebar)', r);
r = run('aqa', 'redraft_assessment', false);
ok(r.steps.present === false, 'AQA redraft (the walk does not run there): no step');
ok(run('edexcel-igcse', 'assessment', false).eligible === false && run('aqa', 'assessment', false).eligible === true, 'the walk itself is unchanged: AQA first assessment only');

// v7.20.724 (#755c): Document Progress and the "Date Completed" check follow the SAME rule — the IGCSE walk's closing
// check told the student to fill the Self-Assessment before Mark Complete, with nothing that would ever ask them to.
const comp = slice('_isAssessmentComplete'), prog = slice('_computeAssessmentProgress');
ok(/_saWalkRunsHere\(\) && !done\('\.swml-section-block\[data-section-label="Self-Assessment"\]'\)/.test(comp), '"Date Completed" requires the Self-Assessment only where its walk runs');
ok(/label === 'Self-Assessment' && !_saWalkRunsHere\(\)\) return;/.test(prog), 'Document Progress counts the Self-Assessment only where its walk runs');

console.log((fail ? '❌' : '✅') + ' sa-sidebar-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
