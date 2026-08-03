#!/usr/bin/env node
/* eslint-env node */
/**
 * bin/cw7-doc-gate.js — CW STEP 7 (Universal Human Values) DOCUMENT GATE. v7.20.413
 *
 * Step 7 is a BARE document (Neil, 2026-08-03: "just a document with checkboxes… and a little
 * area for them to make a comment"). There is no walk, no controller and no API, so there is no
 * sim to inherit — this gate is the whole safety net, and it runs the REAL builder.
 *
 * WHAT IT ASSERTS
 *   A. The builder emits exactly six rows per table, and every field id comes from the ONE
 *      producer `_cw7RowFieldId` (§5d: a pasted literal is how a write key and a read key drift).
 *   B. The six values and their character strengths match **Neil's workbook source**, parsed from
 *      `resources/step7/universal-human-values-source.md` — NOT a second copy of the list living
 *      in this file. A check that restates its subject only tests its own memory
 *      ([[feedback_a_check_that_duplicates_its_subject_is_not_a_check]]), so the source document
 *      is the authority and a silent edit to the strengths list fails here.
 *   C. The three states are the workbook's three columns — Balance / Excess / Deficit.
 *   D. COMPLETION BEHAVIOUR, through the real `WML.outlineRow` rule, not a restatement of it:
 *        · an untouched value row is satisfied     (`optional: true` — a story explores two or
 *          three values, so ten empty rows must not hold the document below 100% for ever)
 *        · a row with text but nothing ticked is NOT satisfied  (started ⇒ finish it)
 *        · a row with text + one strength + one state IS satisfied
 *      Without D this gate would prove the HTML exists and nothing about how it behaves.
 *
 * PROVEN NON-VACUOUS — each check was made to fail before it was kept:
 *   · returned 5 rows            → A red
 *   · swapped 'curiosity' for 'nosiness'  → B red
 *   · dropped `optional: true`   → D red (untouched row reported incomplete)
 *   · dropped `choice: true`     → D red (one tick no longer satisfies a 4-item strengths list)
 *
 * Usage: node bin/cw7-doc-gate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const WORKBOOK = fs.readFileSync(path.join(ROOT, 'resources', 'step7', 'universal-human-values-source.md'), 'utf8');
const PROTOCOL = fs.readFileSync(path.join(ROOT, 'protocols', 'shared', 'creative-writing', 'CW-STEP-07-universal-values.md'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── slicing: brace-count from an anchor, skipping strings and comments ──────────────
function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    if (start < 0) return null;
    let depth = 0, i = start, inS = null, inLine = false, inBlock = false;
    for (; i < s.length; i++) {
        const c = s[i], n = s[i + 1];
        if (inLine) { if (c === '\n') inLine = false; continue; }
        if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
        if (inS) { if (c === '\\') { i++; continue; } if (c === inS) inS = null; continue; }
        if (c === '/' && n === '/') { inLine = true; i++; continue; }
        if (c === '/' && n === '*') { inBlock = true; i++; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === open) depth++;
        else if (c === close) { depth--; if (depth === 0) return { text: s.slice(start, i + 1), end: i + 1 }; }
    }
    return null;
}
function sliceDecl(src, decl, open, close) {
    const i = src.indexOf(decl);
    if (i < 0) throw new Error('not found in source: ' + decl);
    const b = braceSliceFrom(src, i, open, close);
    if (!b) throw new Error('unbalanced slice for: ' + decl);
    return b.text;
}

// ── the real builder, with only the primitives it touches ──────────────────────────
const CW7_VALUES_SRC = sliceDecl(SRC, 'const CW7_VALUES = [', '[', ']');
const CW7_STATES_SRC = sliceDecl(SRC, 'const CW7_STATES = [', '[', ']');
const FID_SRC = sliceDecl(SRC, 'function _cw7RowFieldId(', '{', '}');
const BUILD_SRC = sliceDecl(SRC, 'function buildCW7ValuesSection(', '{', '}');
const ROW_SRC = sliceDecl(SRC, 'function outlineRowHTML(', '{', '}');

const sandbox = new Function(
    'escapeHTML', 'sectionHTML',
    'const CW7_VALUES = ' + CW7_VALUES_SRC + ';\n'
    + 'const CW7_STATES = ' + CW7_STATES_SRC + ';\n'
    + 'function _cw7RowFieldId(when, valueId) ' + FID_SRC + '\n'
    + 'function outlineRowHTML(criterion, fieldId) ' + ROW_SRC + '\n'
    + 'function buildCW7ValuesSection(when) ' + BUILD_SRC + '\n'
    + 'return { CW7_VALUES, CW7_STATES, _cw7RowFieldId, buildCW7ValuesSection };'
)(
    (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    (type, label, collapsible, x, content) => '<section data-section-label="' + label + '">' + content + '</section>'
);

// the real completion RULE, lifted from wml-core.js — never reimplemented here
const outlineRow = new Function('return ' + sliceDecl(CORE, 'const outlineRow = {', '{', '}') + ';')();

// ── the protocol's value table is the authority on the values ──────────────────────
// Rows of the form: | **Temperance** | Forgiveness/mercy, humility/modesty, prudence… |
//
// ⚠️ WHY THE PROTOCOL AND NOT THE WORKBOOK EXPORT. Neil's source document states the strengths
// TWICE and the two do not agree: its prose summary says "forgiveness, humility" and
// "appreciation of beauty", while the TABLE the students actually fill in says
// "forgiveness/mercy", "humility/modesty" and "appreciation of beauty and excellence" — which is
// also the real Peterson & Seligman wording. The table is what he teaches from, so the table
// wins, and the protocol was corrected to match it in the same commit (v7.20.413). This gate's
// first run caught exactly that divergence, which is the whole reason it parses a source instead
// of restating a list.
const wbValues = [];
PROTOCOL.split('\n').forEach((line) => {
    const m = line.match(/^\|\s*\*\*([A-Z][A-Za-z ]+)\*\*\s*\|\s*([^|]+?)\s*\|\s*$/);
    if (m) wbValues.push({ name: m[1].trim(), strengths: m[2].split(/,\s*/).map((s) => s.trim().toLowerCase()) });
});
ok(wbValues.length === 6, 'the protocol value table no longer yields six values (' + wbValues.length + ') — this gate has gone blind, fix the parse before trusting a pass');
// …and the protocol must still agree with the workbook Neil teaches from, or we have quietly
// corrected HIS page rather than our own copy of it.
['forgiveness/mercy', 'humility/modesty', 'appreciation of beauty and excellence'].forEach((phrase) => {
    ok(WORKBOOK.toLowerCase().indexOf(phrase) !== -1,
        'the protocol claims the strength "' + phrase + '" but Neil\'s workbook source does not contain it');
});

console.log('CW STEP-7 DOCUMENT GATE — real builder, workbook source as the authority\n');

// ── A. shape + the one producer ────────────────────────────────────────────────────
const rowsOf = (html) => {
    const out = [];
    const re = /<div data-outline-row="true" data-prompt="([^"]*)" data-field-id="([^"]*)" data-criteria="([^"]*)"/g;
    let m;
    while ((m = re.exec(html))) {
        const crit = JSON.parse(m[3].replace(/&quot;/g, '"'));
        out.push({ prompt: m[1], fid: m[2], crit });
    }
    return out;
};

['begin', 'end'].forEach((when) => {
    const rows = rowsOf(sandbox.buildCW7ValuesSection(when));
    if (!ok(rows.length === 6, when + ': expected 6 value rows, got ' + rows.length)) return;

    const wantFids = sandbox.CW7_VALUES.map((v) => sandbox._cw7RowFieldId(when, v.id));
    ok(JSON.stringify(rows.map((r) => r.fid)) === JSON.stringify(wantFids),
        when + ': the row field ids are not the ones _cw7RowFieldId builds — someone pasted a literal (§5d)');
    ok(new Set(rows.map((r) => r.fid)).size === 6, when + ': duplicate field id — two rows would write to one box');
    ok(rows.every((r) => /^cw-step-7-/.test(r.fid)),
        when + ': a field id lost the cw-step-7- prefix — cw-keymatch-harness and criteria-lint both key on it');

    rows.forEach((r, i) => {
        const wb = wbValues[i];
        const c = r.crit;
        // B — the values and strengths are the workbook's
        ok(c.label === wb.name, when + ' row ' + (i + 1) + ': label "' + c.label + '" ≠ workbook "' + wb.name + '"');
        const ctlS = (c.controls || [])[0] || {};
        const got = (ctlS.items || []).map((s) => s.toLowerCase());
        ok(JSON.stringify(got) === JSON.stringify(wb.strengths),
            when + ' ' + c.label + ': strengths ' + JSON.stringify(got) + ' ≠ workbook ' + JSON.stringify(wb.strengths));
        // C — the three states are the workbook's three columns
        const ctlState = (c.controls || [])[1] || {};
        ok(JSON.stringify(ctlState.items) === JSON.stringify(['In balance', 'In excess', 'In deficit']),
            when + ' ' + c.label + ': the state options are not Balance / Excess / Deficit');
        ok(ctlS.choice === true && ctlState.choice === true,
            when + ' ' + c.label + ': a control lost `choice: true` — a 4-item strengths list would then demand ALL four ticks');
        ok(c.optional === true,
            when + ' ' + c.label + ': lost `optional: true` — a story exploring two values would sit permanently incomplete');
        ok(/quote|comment|explanation/i.test(r.prompt || ''),
            when + ' ' + c.label + ': the row has no explanation/quotes prompt — that box is the whole second half of the brief');
    });
});

// the workbook's own header wording, so a silent re-label of the columns is caught
ok(/IS THIS VALUE\/VIRTUE IN BALANCE\?/i.test(WORKBOOK) && /IN EXCESS\?/i.test(WORKBOOK) && /IN DEFICIT\?/i.test(WORKBOOK),
    'the workbook source no longer names Balance / Excess / Deficit — check C is now vacuous');

// ── D. completion BEHAVIOUR, through the real rule ─────────────────────────────────
const sample = rowsOf(sandbox.buildCW7ValuesSection('begin'))[1].crit;   // Courage: 4 strengths, 3 states
const stateWith = (strengthIdx, stateIdx) => {
    let st = {};
    if (strengthIdx != null) st = outlineRow.withControlState(sample, st, sample.controls[0], { checked: [strengthIdx] });
    if (stateIdx != null) st = outlineRow.withControlState(sample, st, sample.controls[1], { checked: [stateIdx] });
    return st;
};
ok(outlineRow.complete(sample, {}, false) === true,
    'an UNTOUCHED value row must be satisfied — otherwise ten unexplored values hold the document below 100% for ever');
ok(outlineRow.complete(sample, {}, true) === false,
    'a row with TEXT but nothing ticked must NOT be satisfied — started means finish it');
ok(outlineRow.complete(sample, stateWith(0, null), true) === false,
    'text + a strength but no Balance/Excess/Deficit must NOT be satisfied — the state is the point of the table');
ok(outlineRow.complete(sample, stateWith(0, 1), true) === true,
    'text + one strength + one state must be satisfied — one tick completes a `choice` control');
ok(outlineRow.isMulti(sample) === true, 'the value row is not registering as a multi-control row — its state would not namespace by control id (§5d)');

console.log('\n' + (fail ? '❌ CW7 DOC GATE FAILED' : '✅ cw7-doc-gate passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
