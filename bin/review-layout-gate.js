#!/usr/bin/env node
/* eslint-env node */
/**
 * review-layout-gate.js — v7.20.927 (Neil, 17 Oct: "Can you make a rule or something for this so it doesn't happen again?
 * Maybe a gate or something?").
 *
 * WHAT HAPPENED. Neil reviewed Qamar 857's AQA Language Paper 2 plan and saw ONE plan box per question. The lesson had
 * built one box per paragraph (Q2 2 · Q3 3 · Q4 5 · Q5 6 sections) for weeks — but only when the STUDENT opens it: the
 * layout upgrade (_healDiagnosticPlanScaffold) returned at once in the tutor view, and so did eight other layout
 * upgrades. A reviewer was shown a layout the student would never see.
 *
 * THE RULE THIS ENFORCES. Every step of the load-time upgrade chain (_migrateStep) runs in the tutor view too, because a
 * reviewer page can never save (saveCanvasContent returns in review). A step may skip review ONLY if it is listed below
 * with the reason — so the next step added cannot quietly copy the old `|| state.reviewMode` habit.
 *
 * Usage: node bin/review-layout-gate.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

// Steps allowed to skip the tutor view, each with the reason. Keep this list SHORT and the reasons true.
const MAY_SKIP_REVIEW = {
    // (none today — the chain mirror _healPhase1PrewriteCarry is called through an arrow wrapper and guards itself;
    //  it carries CONTENT between lessons, not layout, and is covered by chain-autofill-harness)
};

function fnBody(name) {
    const m = new RegExp('^([ \\t]*)(?:async )?function ' + name + '\\(', 'm').exec(js);
    if (!m) return null;
    const close = new RegExp('^' + m[1] + '\\}[ \\t]*$', 'm');
    const rest = js.slice(m.index);
    const e = close.exec(rest.slice(1));
    return rest.slice(0, e ? e.index + 2 : 4000);
}

console.log('\nA · the premise: a reviewer page can never save');
const save = fnBody('saveCanvasContent') || '';
ok(/if \(!canvasEditor\) return;\s*[\s\S]{0,200}if \(state\.reviewMode\) return;/.test(save.slice(0, 600)), 'saveCanvasContent returns in review mode before writing anything');

console.log('\nB · every upgrade step runs in the tutor view (or is listed with its reason)');
const steps = [...js.matchAll(/_migrateStep\('([^']+)',\s*([_a-zA-Z][_a-zA-Z0-9]*)\s*\)/g)].map(m => ({ label: m[1], fn: m[2] }));
ok(steps.length >= 20, 'the upgrade chain was found (' + steps.length + ' named steps)');
let checked = 0;
steps.forEach(({ label, fn }) => {
    const body = fnBody(fn);
    if (!body) return;   // inline / arrow steps guard themselves
    checked++;
    const head = body.slice(0, 700);
    const skips = /state\.reviewMode/.test(head);
    if (skips) ok(Object.prototype.hasOwnProperty.call(MAY_SKIP_REVIEW, label), label + ' skips the tutor view — allowed only with a listed reason');
});
ok(checked >= 20, 'checked ' + checked + ' step functions');
['healLangP1SelfAssessment', 'healSelfAssessmentAboveFeedback', 'healLadderSectionsUnderSelfAssessment', 'healLadderSaWording', 'healLadderPointRows',
 'healDuplicateInputFields', 'healCalibGoal', 'healCmpPlanPrompts', '_healDiagnosticPlanScaffold', '_healWordTargetHints'].forEach(fn => {
    const b = (fnBody(fn) || '').slice(0, 700);
    ok(b && !/state\.reviewMode/.test(b), fn + ' runs in the tutor view (v7.20.927)');
});
ok(/_migrateStep\('healDiagnosticPlanScaffold', _healDiagnosticPlanScaffold\)/.test(js), '⭐ the one-box-per-paragraph plan upgrade (Qamar\'s case) is in the chain');

console.log('\n' + (fail ? 'FAILED' : 'PASSED') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
