#!/usr/bin/env node
/* eslint-env node */
/**
 * clear-chat-harness.js — v7.20.914 (Neil, 16 Oct: "do we actually need that button? It might be a bit too destructive…
 * it's probably just going to increase our costs"). Clear Chat is shown only to STAFF and on the BANKED quizzes.
 *
 * 1. The rule, executed from the shipped file (clearChatAllowed).
 * 2. Every Clear Chat button in wml-assessment.js is attached only through _clearChatAllowed() — a new or moved site
 *    that skips it fails here (count the buttons, count the guarded attachments).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const JS = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✓ ' : '  ✗ ') + m); };

console.log('clear-chat-harness — Clear Chat: staff + banked quizzes only');
const m = JS.match(/function clearChatAllowed\(task, cfg\) \{[\s\S]*?\n    \}/);
ok(!!m, 'clearChatAllowed() is in wml-assessment.js');
if (m) {
    const f = new Function(m[0] + '\nreturn clearChatAllowed;')();
    ['planning', 'assessment', 'redraft_assessment', 'polishing', 'outlining', 'cw_step_3', 'conceptual_notes', 'exam_crib', '']
        .forEach(t => ok(f(t, {}) === false, 'a STUDENT on "' + (t || 'diagnostic') + '" gets no Clear Chat'));
    ['foundational_quiz', 'mark_scheme_unit', 'mark_scheme'].forEach(t => ok(f(t, {}) === true, 'a student on the banked quiz "' + t + '" keeps it'));
    ok(f('planning', { canSignOff: true }) === true && f('planning', { isAdmin: true }) === true, 'staff (canSignOff / isAdmin) keep it everywhere');
    ok(f('planning', undefined) === false, 'no config → student rule (never shown by accident)');
}
const buttons = (JS.match(/className: 'swml-clear-chat-btn'/g) || []).length;
const guarded = (JS.match(/if \(_clearChatAllowed\(\)\) (?:try \{|header\.appendChild\(clearCoachBtn\)|chatHeader\.appendChild\(clearChatBtn\))/g) || []).length;
ok(buttons === 3 && guarded === 3, 'every Clear Chat button (' + buttons + ') is attached only through _clearChatAllowed() (' + guarded + ')');
console.log((fail ? '✗ FAIL' : '✓ PASS') + ' — ' + n + ' checks');
process.exit(fail);
