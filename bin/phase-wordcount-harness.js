#!/usr/bin/env node
/* eslint-env node */
// v7.20.878 (FIXLIST progress-report-word-count — Neil, 14 Oct: the progress report should show "the number of words
// written for this particular piece"). The graded row student-data writes on swml_phase_complete carried word_count 0
// on every prod grade (10/10), because the commit never sent one. This gate keeps the three links of that chain:
//   1. the grade commit (_autoCommitAssessment) sends word_count from the SAME counter the status bar uses;
//   2. complete_phase() stores it in $data, sanitised to a whole number;
//   3. that same $data is what swml_phase_complete hands the listener.
// Plumbing only (root §14b) — the behaviour is proven on staging by a /phase/complete round trip.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'frontend/wml-assessment.js'), 'utf8');
const php = fs.readFileSync(path.join(root, 'includes/class-rest-api.php'), 'utf8');
let failed = 0;
const check = (name, ok) => { console.log((ok ? '  ✓ ' : '  ✗ ') + name); if (!ok) failed++; };

const fnStart = js.indexOf('async function _autoCommitAssessment(');
const fnEnd = fnStart >= 0 ? js.indexOf('const res = await apiPost(API.phaseComplete, payload);', fnStart) : -1;
const commit = fnStart >= 0 && fnEnd > fnStart ? js.slice(fnStart, fnEnd) : '';
check('grade commit found', commit.length > 0);
check('grade commit payload sends word_count from getResponseWordCount(canvasEditor)',
    /word_count:\s*getResponseWordCount\(canvasEditor\)/.test(commit));

const cpStart = php.indexOf('public function complete_phase(');
const cpEnd = cpStart >= 0 ? php.indexOf("do_action('swml_phase_complete'", cpStart) : -1;
const cp = cpStart >= 0 && cpEnd > cpStart ? php.slice(cpStart, cpEnd + 120) : '';
check('complete_phase found, and it fires swml_phase_complete', cp.length > 0);
const dataBlock = (cp.match(/\$data\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '';
check("complete_phase stores 'word_count' => absint(\$params['word_count'] ...) in \$data",
    /'word_count'\s*=>\s*absint\(\$params\['word_count'\]/.test(dataBlock));
check('swml_phase_complete receives that same $data',
    /do_action\('swml_phase_complete',\s*\$user_id,\s*\$board,\s*\$text,\s*\$topic,\s*\$phase,\s*\$data\)/.test(cp));

if (failed) { console.error(`phase-wordcount-harness: ${failed} FAILED`); process.exit(1); }
console.log('phase-wordcount-harness: all passed');
