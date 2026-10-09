#!/usr/bin/env node
/* eslint-env node */
/**
 * exam-prep-keep-harness.js — v7.20.779 (WML 338 A). PROVEN on staging (test student 1938, AQA Power & Conflict notes):
 * the exam-prep template upgrade replaced a Conceptual Notes document with the blank template in any browser without its
 * local version stamp (a new device, a new browser, cleared storage), and posted the blank as its save. Same server
 * document, two fresh browsers: with the stamp the notes stayed; without it they were gone. Its only test for student
 * work counted RESPONSE sections; a notes document keeps its work in input fields. The fix keeps any document holding
 * student work in ANY box.
 * Checks, against the SHIPPED file:
 *   (1) the pure counter (@EXAM-PREP-KEEP-PURE), run on the REAL blank v3 notes document (357 boxes, from staging) and on
 *       that document with one box filled, plus the edge shapes a stored document takes;
 *   (2) the upgrade keeps a document whenever that count is above zero;
 *   (3) pending saves also flush on pagehide and when the page is hidden (Safari on iPad does not reliably fire
 *       beforeunload).
 *   node bin/exam-prep-keep-harness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
let fail = 0, n = 0;
const ok = (c, m, got) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m + (c || got === undefined ? '' : '   got: ' + JSON.stringify(got))); };
console.log('exam-prep-keep-harness — a notes or plan document is never replaced by a blank template (v7.20.779)');

// (1) the pure counter, executed from the shipped file
const a = SRC.indexOf('/* @EXAM-PREP-KEEP-PURE-START'), b = SRC.indexOf('/* @EXAM-PREP-KEEP-PURE-END */');
ok(a > 0 && b > a, 'the counter sits between its sentinels in wml-assessment.js');
// eslint-disable-next-line no-new-func
const count = (a > 0 && b > a) ? new Function(SRC.slice(a, b) + '\nreturn _docStudentFieldCount;')() : () => -1;
const BLANK = fs.readFileSync(path.join(__dirname, 'fixtures/cn-power-conflict-blank-v3.html'), 'utf8');
const fill = (html, fid, text) => html.replace(new RegExp('(data-field-id="' + fid + '"[^>]*>)(</div>)'), '$1' + text + '$2');
ok((BLANK.match(/data-input-field="true"/g) || []).length === 357, 'fixture: the real AQA Power & Conflict notes document, 357 boxes');
ok(count(BLANK) === 0, '⭐ the real BLANK template counts 0 — a fresh document still gets the template (no false keep)', count(BLANK));
ok(count(fill(BLANK, 'poem_ozymandias_speaker', 'An unnamed speaker retells a traveller’s story.')) === 1, '⭐ ONE note in ONE poem box → kept (the staging wipe)');
ok(count(fill(BLANK, 'pf_sonnet_definition', '<p>A fourteen-line poem.</p>')) === 1, 'a note held in a paragraph counts');
ok(count(fill(fill(BLANK, 'pf_ballad_notes', 'mine'), 'poem_london_context', 'Blake, 1794')) === 2, 'two boxes → 2');
ok(count(fill(BLANK, 'poem_ozymandias_speaker', ' &nbsp; <br> ')) === 0, 'whitespace, a non-breaking space or a line break alone is not work');
ok(count('<div data-locked="true" data-field-id="x" data-input-field="true">From lesson 2</div>') === 0, 'a LOCKED box is the system\'s, not the student\'s');
ok(count('<div data-input-field="true" data-field-id="x" class="swml-input-field">mine</div>') === 1, 'attribute order does not matter');
ok(count('<div data-field-id="r" data-outline-row="true" class="swml-outline-row">my sentence</div>') === 1, 'an outline row counts');
ok(count('<div data-field-id="s" data-select-field="true" data-value="b"></div>') === 1 && count('<div data-field-id="s" data-select-field="true" data-value=""></div>') === 0, 'a chosen select counts; an unchosen one does not');
ok(count('<div data-section-type="response"><p>' + 'x'.repeat(400) + '</p></div>') === 0, 'response prose is the caller\'s own check (studentChars), not this one');

// (2) the caller keeps on that count — and the blank-template inject still follows it for an empty document
const t0 = SRC.indexOf('const tryExamPrepTemplate = () => {'), t1 = SRC.indexOf('\n        };', t0);
const TPL = t0 > 0 ? SRC.slice(t0, t1) : '';
ok(/\} else if \(studentChars > 50 \|\| _docStudentFieldCount\(currentHTML\) > 0\) \{[\s\S]{0,400}localStorage\.setItem\(docVerKey, String\(currentVer\)\);[\s\S]{0,300}return;/.test(TPL),
    '⭐ the upgrade KEEPS a document with work in any box (stamped, never replaced)');
ok(TPL.indexOf('_docStudentFieldCount(currentHTML) > 0') < TPL.indexOf('canvasEditor.commands.setContent(template);'), '…and that check runs BEFORE the template is injected');

// (3) the flush on pagehide / hidden
ok(/window\.addEventListener\('beforeunload', _flushPendingSaves\);\s*\n(?:\s*\/\/.*\n)*\s*window\.addEventListener\('pagehide', _flushPendingSaves\);\s*\n\s*document\.addEventListener\('visibilitychange', function \(\) \{ if \(document\.visibilityState === 'hidden'\) _flushPendingSaves\(\); \}\);/.test(SRC),
    'pending saves flush on pagehide and when the page is hidden, beside beforeunload');

console.log((fail ? '❌ exam-prep-keep-harness FAILED' : '✅ exam-prep-keep-harness') + ' (' + n + ' checks)');
process.exit(fail);
