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
 *   D. COMPLETION BEHAVIOUR, through the real `WML.outlineRow` rule, not a restatement of it.
 *      Neil's ruling (2026-08-03), after v7.20.413 ticked a section he had never touched:
 *      **all six values are required**, and one value is complete when it has at least one TRAIT,
 *      one of balance/excess/deficit, and an explanation. So:
 *        · an untouched value row is NOT satisfied — and neither is a whole untouched section
 *        · text with nothing ticked is NOT satisfied
 *        · text + a state but no trait is NOT satisfied
 *        · text + one trait + one state IS satisfied
 *      Without D this gate would prove the HTML exists and nothing about how it behaves — which
 *      is exactly how .413 shipped a section that ticked itself.
 *
 * PROVEN NON-VACUOUS — each check was made to fail before it was kept:
 *   · returned 5 rows                     → A red
 *   · swapped 'curiosity' for 'nosiness'  → B red
 *   · re-added `optional: true`           → D red (the .413 defect, caught at row AND section level)
 *   · dropped `choice: true`              → D red (one tick no longer satisfies a 4-item trait list)
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
    // ⚠️ v7.20.421 — REGEX LITERALS ARE SKIPPED, and this is a real fix rather than tidying.
    // Without it, a literal like `.replace(/"/g, '…')` fed the scanner a bare `"`, it opened a
    // phantom string, and every brace from there on stopped counting. The slice then ran past the
    // end of the function and closed on some unrelated brace far below — so this gate was slicing
    // the WRONG TEXT and passing anyway. It only surfaced when a body grew long enough to change
    // where the runaway happened to land. A slicer that is right by luck is not a slicer.
    // The regex/division ambiguity is resolved the standard way: a `/` is a regex only where a
    // VALUE may begin, i.e. after an operator, opener or terminator.
    let depth = 0, i = start, inS = null, inLine = false, inBlock = false, inRe = false, prev = '';
    const reAllowedAfter = '(,=:[!&|?{};+-*%~^<>\n';
    for (; i < s.length; i++) {
        const c = s[i], n = s[i + 1];
        if (inLine) { if (c === '\n') inLine = false; continue; }
        if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
        if (inRe) {
            if (c === '\\') { i++; continue; }
            if (c === '[') { // a character class may hold an unescaped '/'
                while (i < s.length && s[i] !== ']') { if (s[i] === '\\') i++; i++; }
                continue;
            }
            if (c === '/') inRe = false;
            continue;
        }
        if (inS) { if (c === '\\') { i++; continue; } if (c === inS) inS = null; continue; }
        if (c === '/' && n === '/') { inLine = true; i++; continue; }
        if (c === '/' && n === '*') { inBlock = true; i++; continue; }
        if (c === '/' && reAllowedAfter.indexOf(prev) !== -1) { inRe = true; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === open) depth++;
        else if (c === close) { depth--; if (depth === 0) return { text: s.slice(start, i + 1), end: i + 1 }; }
        if (c.trim()) prev = c;
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
const TRAIT_ID_SRC = sliceDecl(SRC, 'function _cw7TraitCtlId(', '{', '}');
const TRAIT_LABEL_SRC = sliceDecl(SRC, 'function _cw7TraitLabel(', '{', '}');
const ADD_FID_SRC = sliceDecl(SRC, 'function _cw7AddRowFieldId(', '{', '}');
const BUILD_SRC = sliceDecl(SRC, 'function buildCW7ValuesSection(', '{', '}');
const ADD_BUILD_SRC = sliceDecl(SRC, 'function buildCW7AddSection(', '{', '}');
const ROW_SRC = sliceDecl(SRC, 'function outlineRowHTML(', '{', '}');
// v7.20.421: the "Not explored" constant is a plain string literal in the source; lift it the
// same way as everything else so the gate can never drift from what the builder actually uses.
const NOT_EXPLORED = (SRC.match(/const CW7_NOT_EXPLORED = '([^']+)'/) || [])[1];
if (!NOT_EXPLORED) throw new Error('could not lift CW7_NOT_EXPLORED from the source — this gate would go blind');

const sandbox = new Function(
    'escapeHTML', 'sectionHTML', 'dividerHTML',
    'const CW7_VALUES = ' + CW7_VALUES_SRC + ';\n'
    + 'const CW7_STATES = ' + CW7_STATES_SRC + ';\n'
    + "const CW7_NOT_EXPLORED = '" + NOT_EXPLORED + "';\n"
    + 'const CW7_TRAIT_CHOICES = CW7_STATES.concat([CW7_NOT_EXPLORED]);\n'
    + 'function _cw7RowFieldId(when, valueId) ' + FID_SRC + '\n'
    + 'function _cw7TraitCtlId(trait) ' + TRAIT_ID_SRC + '\n'
    + 'function _cw7TraitLabel(trait) ' + TRAIT_LABEL_SRC + '\n'
    + 'function _cw7AddRowFieldId(valueId) ' + ADD_FID_SRC + '\n'
    + 'function outlineRowHTML(criterion, fieldId) ' + ROW_SRC + '\n'
    + 'function buildCW7ValuesSection(when) ' + BUILD_SRC + '\n'
    + 'function buildCW7AddSection() ' + ADD_BUILD_SRC + '\n'
    + 'return { CW7_VALUES, CW7_STATES, CW7_NOT_EXPLORED, CW7_TRAIT_CHOICES, _cw7RowFieldId, '
    + '_cw7TraitCtlId, _cw7TraitLabel, _cw7AddRowFieldId, buildCW7ValuesSection, buildCW7AddSection };'
)(
    (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    (type, label, collapsible, x, content) => '<section data-section-label="' + label + '">' + content + '</section>',
    (t) => '<hr data-divider="' + t + '">'
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
// ⚠️ v7.20.419 — THE AUTHORITY MOVED, AND THAT IS THE FIX, NOT A WORKAROUND.
// This block used to parse the value table out of the PROTOCOL. When Step 7 gained a chat
// (#236) the protocol became a file the manifest LOADS INTO THE MODEL'S CONTEXT, so its
// teaching content had to go — the retained-source law (WML CLAUDE.md §5): text left in a
// loaded module gets narrated over the code-served walk regardless of any fence. The gate then
// correctly reported itself BLIND rather than passing on an empty parse, which is exactly what
// its own blindness check exists for.
//
// So the authority is now Neil's OWN workbook export — one step closer to the source than the
// protocol ever was, and a file the manifest does not load. Its table lost its commas in export
// (`Wisdom and knowledge creativity curiosity …`), so each value's traits are matched by
// CONTAINMENT within that value's own row rather than by splitting — which is the honest test
// anyway: every trait we put on a tick box must appear on the page he teaches from.
const WB_ROWS = [];
WORKBOOK.split('\n').forEach((line) => {
    const m = line.match(/^\|\s*([A-Z][A-Za-z][^|]*?)\s*\|/);
    if (!m) return;
    const cell = m[1].trim();
    if (/^TICK THE UNIVERSAL/i.test(cell)) return;      // the header row
    if (WB_ROWS.indexOf(cell) === -1) WB_ROWS.push(cell);
});
const wbValues = sandbox.CW7_VALUES.map((v) => {
    const row = WB_ROWS.filter((r) => r.toLowerCase().indexOf(v.name.toLowerCase()) === 0)[0] || '';
    return { name: v.name, row: row, strengths: v.traits.map((s) => s.toLowerCase()) };
});
ok(wbValues.filter((v) => v.row).length === 6,
    'only ' + wbValues.filter((v) => v.row).length + '/6 values were found in Neil\'s workbook table '
    + '(resources/step7/universal-human-values-source.md) — this gate has gone blind, fix the parse '
    + 'before trusting a pass');
// Every trait on a tick box must be a trait HE lists for that value — not one we tidied, renamed
// or moved to a neighbouring value.
wbValues.forEach((v) => {
    if (!v.row) return;
    v.strengths.forEach((s) => {
        ok(v.row.toLowerCase().indexOf(s) !== -1,
            'the ' + v.name + ' row offers the trait "' + s + '", which is not on that value\'s row in '
            + 'Neil\'s workbook — we would be teaching a strength he does not');
    });
});
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
        // ⭐ v7.20.421 — ONE CONTROL PER TRAIT (#245). The controls ARE the strengths list now,
        // in the workbook's own order, so a renamed/dropped/re-ordered trait fails here.
        const got = (c.controls || []).map((x) => String(x.label || '').toLowerCase());
        ok(JSON.stringify(got) === JSON.stringify(wb.strengths),
            when + ' ' + c.label + ': trait controls ' + JSON.stringify(got) + ' ≠ workbook ' + JSON.stringify(wb.strengths));
        // The control id is the ONE producer's, never a literal (§5d).
        const wantIds = wb.strengths.map((s) => sandbox._cw7TraitCtlId(s));
        ok(JSON.stringify((c.controls || []).map((x) => x.id)) === JSON.stringify(wantIds),
            when + ' ' + c.label + ': a trait control id is not the one _cw7TraitCtlId builds — someone pasted a literal (§5d)');
        ok(new Set((c.controls || []).map((x) => x.id)).size === (c.controls || []).length,
            when + ' ' + c.label + ': two trait controls share an id — one would overwrite the other’s saved condition');
        // C — every trait offers the three states PLUS the "not explored" answer.
        (c.controls || []).forEach((x) => {
            ok(JSON.stringify(x.items) === JSON.stringify(['In balance', 'In excess', 'In deficit', sandbox.CW7_NOT_EXPLORED]),
                when + ' ' + c.label + ' / ' + x.label + ': the options are not Balance / Excess / Deficit / ' + sandbox.CW7_NOT_EXPLORED);
            ok(x.choice === true,
                when + ' ' + c.label + ' / ' + x.label + ': lost `choice: true` — it would demand ALL four ticks at once');
            ok(x.optional === true,
                when + ' ' + c.label + ' / ' + x.label + ': lost `optional` — every one of the 23 traits would be compulsory, '
                + 'which is the 24-cell audit Neil ruled against');
        });
        ok(c.requireAny === true,
            when + ' ' + c.label + ': lost `requireAny` — with every control optional the row would complete on text alone, '
            + 'and a student could explain a value without naming a single trait (Neil: "they need to choose at least one")');
        ok(Array.isArray(c.anyIgnore) && c.anyIgnore.indexOf(sandbox.CW7_NOT_EXPLORED) !== -1,
            when + ' ' + c.label + ': lost `anyIgnore` — a value where EVERY trait is "' + sandbox.CW7_NOT_EXPLORED
            + '" would count as answered');
        ok(!c.optional,
            when + ' ' + c.label + ': carries `optional` — that is the v7.20.413 defect, an empty row satisfies itself and the section ticks green untouched');
        ok(/quote|comment|explanation/i.test(r.prompt || ''),
            when + ' ' + c.label + ': the row has no explanation/quotes prompt — that box is the whole second half of the brief');
    });
});

// ── A2. the build list (#249) ──────────────────────────────────────────────────────
(function checkAddSection() {
    const addRows = rowsOf(sandbox.buildCW7AddSection());
    if (!ok(addRows.length === 6, 'the build-list section has ' + addRows.length + ' rows, expected one per value')) return;
    const wantAdd = sandbox.CW7_VALUES.map((v) => sandbox._cw7AddRowFieldId(v.id));
    ok(JSON.stringify(addRows.map((r) => r.fid)) === JSON.stringify(wantAdd),
        'the build-list field ids are not the ones _cw7AddRowFieldId builds — the walk writes by that id, so a literal here files nowhere (§5d)');
    ok(addRows.every((r) => r.crit.optional === true),
        'a build-list row is not `optional` — a student whose protagonist already has everything would be left with a section that can never tick green');
    ok(addRows.every((r) => !r.crit.controls),
        'a build-list row grew controls — it is a written list, and controls there would become a second place to say the same thing');
})();

// the workbook's own header wording, so a silent re-label of the columns is caught
ok(/IS THIS VALUE\/VIRTUE IN BALANCE\?/i.test(WORKBOOK) && /IN EXCESS\?/i.test(WORKBOOK) && /IN DEFICIT\?/i.test(WORKBOOK),
    'the workbook source no longer names Balance / Excess / Deficit — check C is now vacuous');

// ── D. completion BEHAVIOUR, through the real rule ─────────────────────────────────
const sample = rowsOf(sandbox.buildCW7ValuesSection('begin'))[1].crit;   // Courage: 4 traits, 4 answers each
// Set ONE trait's condition. `traitIdx` picks the trait control, `answerIdx` indexes
// [balance, excess, deficit, not-explored].
const traitAt = (traitIdx, answerIdx, from) => outlineRow.withControlState(
    sample, from || {}, sample.controls[traitIdx], { checked: [answerIdx] });
const NOT_EXPLORED_IDX = 3;
// ⭐ THE REGRESSION Neil caught on v7.20.413, live: *"it's ticked off… but I haven't even touched
// it."* Every value row carried `optional: true`, which means an EMPTY row is satisfied — so six
// untouched rows satisfied the whole section and it drew its green tick on arrival. This is the
// assertion that makes that unshippable, stated as the SECTION-level fact he actually saw, not
// just the row-level one.
ok(outlineRow.complete(sample, {}, false) === false,
    'AN UNTOUCHED VALUE ROW MUST NOT BE SATISFIED — this is the v7.20.413 defect: `optional: true` ticked the section before the student did anything');
const untouchedSection = rowsOf(sandbox.buildCW7ValuesSection('end'))
    .map((r) => outlineRow.complete(r.crit, {}, false));
ok(untouchedSection.every((c) => c === false),
    'a whole UNTOUCHED "Values at End" section reports ' + untouchedSection.filter(Boolean).length
    + '/6 rows complete — the green tick would appear before the student has touched it');
ok(outlineRow.complete(sample, {}, true) === false,
    'a row with TEXT but no trait conditioned must NOT be satisfied — Neil: "they need to choose at least one"');
ok(outlineRow.complete(sample, traitAt(0, 1), true) === true,
    'text + ONE trait in excess must be satisfied — the other three traits are optional by design');
ok(outlineRow.complete(sample, traitAt(0, 1), false) === false,
    'a conditioned trait with NO explanation must not be satisfied — the explanation box is half the brief');

// ⭐⭐ v7.20.421 — THE PER-TRAIT POINT ITSELF, which is the entire reason this row changed.
// Neil, on his own protagonist: creativity IN EXCESS, open-mindedness IN DEFICIT, love of
// learning IN DEFICIT — three different conditions inside ONE value. The shipped row could hold
// exactly one, so his own character could not be described in it.
const complexChar = traitAt(2, 2, traitAt(1, 2, traitAt(0, 1)));
ok(outlineRow.complete(sample, complexChar, true) === true,
    'a row holding THREE different per-trait conditions is not satisfied — this is the whole #245 change');
[[0, 1], [1, 2], [2, 2]].forEach(([t, a]) => {
    const st = outlineRow.stateOf(sample, complexChar, sample.controls[t]);
    ok(JSON.stringify(st.checked) === JSON.stringify([a]),
        'trait ' + sample.controls[t].label + ' did not keep its own condition — the conditions are sharing one slot again');
});

// ⭐ THE "NOT EXPLORED" DISCRIMINATOR. It must satisfy its own control (so the walk can move on)
// and must NOT satisfy the row (so a value nobody explores is still unanswered). Those two pull
// in opposite directions, which is exactly why `anyIgnore` exists and why it is asserted here.
const allNotExplored = sample.controls.reduce(
    (st, _c, idx) => traitAt(idx, NOT_EXPLORED_IDX, st), {});
sample.controls.forEach((c, idx) => {
    ok(outlineRow.controlOk(c, outlineRow.stateOf(sample, allNotExplored, c)) === true,
        'the "' + sandbox.CW7_NOT_EXPLORED + '" answer does not satisfy the ' + c.label + ' control — the walk would re-ask that trait for ever');
    void idx;
});
ok(outlineRow.complete(sample, allNotExplored, true) === false,
    'a value where EVERY trait is "' + sandbox.CW7_NOT_EXPLORED + '" reports complete — the row would tick green while saying the value is not in the story at all');
ok(outlineRow.complete(sample, traitAt(1, 2, allNotExplored), true) === true,
    'one real condition alongside three "' + sandbox.CW7_NOT_EXPLORED + '" answers is not accepted — that is the normal case, not an edge case');

ok(outlineRow.isMulti(sample) === true, 'the value row is not registering as a multi-control row — its state would not namespace by control id (§5d)');

// ── E. the virtue-scale figure (v7.20.414) ─────────────────────────────────────────
// The canvas has NO image node, so a figure that is not taught to the schema renders as
// nothing at all — silently. These assertions are what stand between that and a student.
const CSS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');

ok(/const SwmlFigure = Node\.create\(\{/.test(SRC), 'the SwmlFigure node is gone — a data-swml-figure div would be stripped on parse and draw nothing');
ok(/^\s*SwmlFigure,/m.test(SRC), 'SwmlFigure is not in the editor extensions list — an unregistered node is dropped from the document');
ok(/parseHTML\(\) \{ return \[\{ tag: 'div\[data-swml-figure\]' \}\]; \}/.test(SRC),
    'SwmlFigure lost its parseHTML — the figure would vanish on the first save→reload round trip');

// Run the node's OWN spec — the real Node.create argument, with Node stubbed to hand it back.
// Slicing the renderHTML body alone is fragile (its first `{` is the destructured parameter);
// evaluating the whole declaration is both simpler and closer to what Tiptap actually does.
let figured = null;
try {
    const spec = new Function('Node', 'return ' + sliceDecl(SRC, 'const SwmlFigure = Node.create({', '(', ')') + ';')
        ({ create: (s) => s });
    figured = spec.renderHTML({ HTMLAttributes: { 'data-swml-figure': 'virtue-scale' } });
    ok(spec.atom === true && spec.selectable === false,
        'the figure is no longer an unselectable atom — a student could type inside it or half-delete it');
    ok(spec.group === 'block', 'the figure is not a block node — it would not sit as its own element in the document');
} catch (e) { /* reported below */ }
if (ok(!!figured, 'could not run SwmlFigure.renderHTML — the figure block of this gate is vacuous, fix the slice')) {
    const flat = JSON.stringify(figured);
    ok(/Virtue in Excess/.test(flat) && /Virtue in Balance/.test(flat) && /Virtue in Deficit/.test(flat),
        'the three band labels are not real text in the rendered node — if the stylesheet fails the student sees an empty box');
    ok(/swml-figure-virtue-scale/.test(flat), 'the rendered figure carries no swml-figure-virtue-scale class — the CSS could never reach it');
    ok(/"role":"img"/.test(flat) && /aria-label/.test(flat), 'the figure has no accessible name');
}

ok(/\.swml-figure-virtue-scale\s*\{/.test(CSS), 'wml-canvas.css has no .swml-figure-virtue-scale rule — the figure would render as three lines of bare text');

// ⭐ v7.20.416 — the checklist label must declare its own typography. It had NO rule at all, so it
// inherited the host page's form-label styling: Neil saw purple, oversized, dark-on-dark in dark
// mode, and long traits spilling out of the 180px column. A component rendering inside someone
// else's page cannot inherit what it cares about.
(function checkLabelTypography() {
    const rule = (CSS.match(/\.swml-outline-check-label\s*\{([\s\S]*?)\}/) || [])[1];
    if (!ok(!!rule, 'there is NO .swml-outline-check-label rule — every trait label inherits the host theme (the v7.20.415 defect: purple, oversized, unreadable on dark)')) return;
    ok(/text-transform:\s*none/.test(rule), 'the trait label does not reset text-transform — the host theme can uppercase it again');
    ok(/font-size:\s*\d/.test(rule) && /font-family:\s*inherit/.test(rule), 'the trait label does not pin its own size and family');
    ok(/color:\s*inherit/.test(rule),
        'the trait label does not take its colour from the criteria column — hard-coding it means one theme reads correctly and the other does not');
    ok(/overflow-wrap:\s*anywhere/.test(rule),
        'the trait label can still overflow its column — "FORGIVENESS/MERCY" is wider than 180px');

    // ⭐ v7.20.417 — `color: inherit` on the span is only as good as what the span inherits FROM.
    // These items are <label> elements and BuddyBoss ships `label { color: var(--bb-headings-color) }`
    // (theme.css:1481), so the wrapping label owned the colour and the span dutifully inherited it:
    // brand ink, fine on white, invisible on the dark panel. The chain has to be broken at the
    // label, not at the span.
    // Parse DECLARATIONS, not raw text: a `}` inside a comment (this file quotes the host rule
    // verbatim, braces and all) would truncate the slice and fail a rule that is in fact correct.
    const CSS_NC = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    const checkRules = CSS_NC.split('.swml-outline-check {').slice(1).map((s) => s.split('}')[0]);
    ok(checkRules.some((r) => /color:\s*inherit/.test(r)),
        'the .swml-outline-check LABEL does not reset colour — the host theme’s `label { color: … }` wins and the span inherits it (the v7.20.416 miss: dark theme only)');
    ok(checkRules.some((r) => /font-size:\s*\d/.test(r)),
        'the .swml-outline-check LABEL does not pin its font-size — the host theme sets 17px on every label');

})();
ok(/\.swml-vs-band\s*\{/.test(CSS), 'wml-canvas.css has no .swml-vs-band rule — the band labels would be unstyled');
// The gradient carries the MEANING of the diagram: red at the extremes, green through the middle.
// Assert that by reading the stops, not by matching one hex — a single-hex check passes happily
// while another stop is recoloured (it survived exactly that mutation on its first run).
(function checkGradient() {
    const g = (CSS.match(/\.swml-figure-virtue-scale\s*\{[\s\S]*?background:\s*linear-gradient\(([\s\S]*?)\);/) || [])[1];
    if (!ok(!!g, 'no linear-gradient on .swml-figure-virtue-scale — the scale would be a flat box')) return;
    const stops = [];
    const re = /#([0-9a-f]{6})\s+(\d+)%/gi;
    let m;
    while ((m = re.exec(g))) {
        const h = m[1];
        stops.push({
            at: +m[2],
            r: parseInt(h.slice(0, 2), 16), gr: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
        });
    }
    if (!ok(stops.length >= 5, 'the gradient has ' + stops.length + ' colour stops — too few to read as a scale; this check has gone blind')) return;
    const isGreen = (s) => s.gr > s.r && s.gr > s.b;
    const isHot = (s) => s.r > s.gr && s.r > s.b;
    const middle = stops.filter((s) => s.at >= 40 && s.at <= 60);
    ok(middle.length > 0 && middle.every(isGreen),
        'the middle of the virtue scale is not green — "Virtue in Balance" sits there, and the colour is what says it is the good place to be');
    ok(isHot(stops[0]) && isHot(stops[stops.length - 1]),
        'the top and bottom of the scale are not hot — Excess and Deficit read as warnings only because the extremes are red');
})();
ok(/figureHTML\('virtue-scale'\)/.test(SRC), 'the Step-7 template no longer emits the figure');

// The two heals do DIFFERENT things on purpose, and getting that backwards destroys work.
const figureHeal = sliceDecl(SRC, 'const tryHealCwStep7Figure = async () => {', '{', '}');
ok(/insertContentAt\(/.test(figureHeal),
    'the figure heal no longer inserts — it must add the figure to an existing document by transaction');
ok(!/setContent\(/.test(figureHeal),
    'THE FIGURE HEAL REBUILDS THE DOCUMENT. A v7.20.413 document already holds a student\'s ticks, states and explanations; rebuilding it to add a picture destroys all of them. It must INSERT.');
// Order matters: rebuild a doc with no rows → re-stamp stale row definitions → refresh the prose →
// add the figure. Scaffold must precede teaching, or the teaching splice preserves rows the
// scaffold heal was about to replace and the two fight over the same document on every load.
ok(/tryHealCwStep7Values\(\)\)\.then\(\(\) => tryHealCwStep7Scaffold\(\)\)\.then\(\(\) => tryHealCwStep7Teaching\(\)\)\.then\(\(\) => tryHealCwStep7Figure\(\)\)/.test(SRC),
    'the four Step-7 heals are not all wired into the init chain, in order (rebuild → scaffold → teaching → figure)');

// The teaching heal REPLACES read-only prose but must never touch a row. Its whole safety rests on
// splicing at the values divider and keeping the student's half of the document byte-for-byte.
const teachHeal = sliceDecl(SRC, 'const tryHealCwStep7Teaching = async () => {', '{', '}');
ok(/current\.slice\(cutCur\)/.test(teachHeal),
    'the teaching heal no longer keeps the student’s half of the document verbatim — it would rebuild over their ticks and explanations');
ok(/cutCur <= 0 \|\| cutNew <= 0/.test(teachHeal),
    'the teaching heal lost its both-anchors-or-nothing guard — a heal that cannot find its boundary must not guess where to cut');
ok(/indexOf\('Stories as Transformation'\) === -1 \|\| after\.indexOf\('cw-step-7-'\) === -1/.test(teachHeal),
    'the teaching heal no longer verifies its own work — it must confirm the new text arrived AND the rows survived');

// ── F. the teaching text is NEIL'S, verbatim (v7.20.415) ───────────────────────────
// He read the built page and found the hole: *"we haven't said anything in the document about
// virtues being in excess, deficit or imbalance."* The page was carrying a COMPRESSED PARAPHRASE
// of his original — his two worked paragraphs flattened into bold-lead bullets, two whole
// sections missing — so the words the task asks a student to choose between were never defined.
// A paraphrase is easy to reintroduce and invisible in review, so it is now mechanical: every
// paragraph of his source must appear in the template, verbatim.
const TEACHING = fs.readFileSync(path.join(ROOT, 'resources', 'step7', 'step7-teaching-text.md'), 'utf8');
// The template stores its punctuation as \uXXXX escapes; the source file stores real characters.
// Normalising both sides is about typography only — every word still has to match.
const norm = (s) => String(s)
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))   // source-file escapes
    .replace(/<[^>]+>/g, '')                                                            // template markup
    .replace(/[’']/g, "'").replace(/[“”]/g, '"')
    .replace(/\s*—\s*/g, ' — ')                                                         // spaced vs unspaced em dash
    .replace(/\s+/g, ' ')
    .trim();
const SRC_NORM = norm(SRC);
// HIS prose only: between the first horizontal rule and the deviations note. Everything above the
// rule is this repo's own explanation of the file and must never be treated as teaching text.
const teachingBody = TEACHING.split('\n---\n')[1] || '';
const paras = teachingBody.split('## TWO DISCLOSED DEVIATIONS')[0]
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !/^[#>-]/.test(l) && l.length > 60)
    // the six value lines carry the disclosed fuller trait wording — checked separately, above,
    // against the protocol table
    .filter((l) => !/^(Wisdom|Courage|Humanity|Justice|Temperance|Transcendence) —/.test(l));
ok(paras.length >= 8, 'the teaching source yielded only ' + paras.length + ' paragraphs — this check has gone blind');
let missing = 0;
paras.forEach((p) => {
    if (!SRC_NORM.includes(norm(p))) {
        missing++;
        ok(false, 'the document does not carry this paragraph of Neil\'s text verbatim:\n       "' + p.slice(0, 110) + '…"');
    }
});
ok(missing === 0, missing + ' of ' + paras.length + ' paragraphs of the teaching text are missing or paraphrased');

// The three words the task makes a student choose between must each be DEFINED on the page.
['In excess', 'In deficit', 'In balance'].forEach((w) => {
    ok(new RegExp(w + ' — \\w').test(SRC_NORM),
        '"' + w + '" is never defined in the document — the task asks students to choose it blind (the v7.20.414 gap Neil found)');
});
ok(/too much of it/.test(SRC_NORM) && /too little of it/.test(SRC_NORM),
    'the excess/deficit definitions no longer use Neil\'s own "too much or too little" framing');

// ── G. THE SCAFFOLD HEAL, run against a REAL v7.20.413 document (v7.20.418) ────────
// Neil, after .414 removed `optional: true`: "why has section 4.1 got a green tick? I haven't
// touched it yet." Because the row definitions are BAKED into the saved document at build time —
// changing the builder fixes documents that do not exist yet and nothing else. The fixture below
// is his actual staging document, pulled off the server: 12 rows carrying `optional:true`, the
// retired `strengths` control id, and two of his own ticks.
//
// This runs the REAL `_cw7MergeScaffold` — the same function the heal calls — not a copy of it.
const FIXTURE = fs.readFileSync(path.join(ROOT, 'bin', 'fixtures', 'cw7-v413-document.html'), 'utf8');
(function scaffoldHeal() {
    // Slice an arrow function's BODY (the `{…}` after `=>`) and rebuild it with known params.
    const arrowBody = (decl) => {
        const i = SRC.indexOf(decl);
        if (i < 0) throw new Error('not found: ' + decl);
        const arrow = SRC.indexOf('=>', i);
        const b = braceSliceFrom(SRC, arrow, '{', '}');
        if (!b) throw new Error('unbalanced arrow body: ' + decl);
        return b.text;
    };
    const rowsOfFn = new Function('return function (html) ' + arrowBody('const _cw7RowsOf = (html) => {') + ';')();
    // v7.20.421: the migration now resolves trait INDICES, so it needs the value table and the
    // two id producers. Handed the REAL ones out of the sandbox — never a copy.
    const migrateFn = new Function('CW7_VALUES', '_cw7RowFieldId', '_cw7TraitCtlId', 'console',
        'return function (raw, fid) ' + arrowBody('const _cw7MigrateCheck = (raw, fid) => {') + ';'
    )(sandbox.CW7_VALUES, sandbox._cw7RowFieldId, sandbox._cw7TraitCtlId, console);
    const merge = new Function('_cw7RowsOf', '_cw7MigrateCheck',
        'return function (current, rebuilt) ' + arrowBody('const _cw7MergeScaffold = (current, rebuilt) => {') + ';'
    )(rowsOfFn, migrateFn);

    // The current builder's own output for the two value tables — the rows the heal stamps in.
    const rebuilt = sandbox.buildCW7ValuesSection('begin') + sandbox.buildCW7ValuesSection('end');

    ok(/optional&quot;:true/.test(FIXTURE) && /id&quot;:&quot;strengths/.test(FIXTURE),
        'the v7.20.413 fixture no longer contains the defect it exists to reproduce — this check is now vacuous');

    const out = merge(FIXTURE, rebuilt);
    ok(out.ok && out.stale === true,
        'the heal does not consider a v7.20.413 document stale — every existing Step-7 document would keep its self-ticking rows');
    if (!out.ok || !out.stale) return;

    // ⚠️ v7.20.421 — this must be asked of the ROW, not of the html. A substring test for
    // `optional":true` now matches the CORRECT per-trait control flag as well as the row-level
    // defect, so it would fail on a healthy document — and, worse, the obvious way to make it
    // pass again is to delete the assertion. Parse the criteria and ask the precise question.
    (function noRowLevelOptional() {
        const healed = Object.entries(rowsOfFn(out.html))
            .filter(([id]) => /^cw-step-7-(begin|end)-/.test(id));
        if (!ok(healed.length === 12, 'expected 12 healed value rows, found ' + healed.length)) return;
        healed.forEach(([id, r]) => {
            let crit = null;
            try { crit = JSON.parse((r.criteria || '{}').replace(/&quot;/g, '"')); } catch (e) { /* below */ }
            if (!ok(!!crit, id + ': the healed row has unparseable criteria')) return;
            ok(crit.optional !== true,
                id + ': the healed ROW still carries optional:true — the section would tick itself untouched (the exact bug Neil saw twice)');
            ok(crit.requireAny === true,
                id + ': the healed row lost requireAny — it would complete on text alone, with no trait named');
            ok((crit.controls || []).every((c) => c.optional === true),
                id + ': a healed trait control is not optional — all 23 traits would be compulsory');
        });
    })();
    ok(!/id&quot;:&quot;strengths/.test(out.html),
        'after the heal the rows still declare the retired `strengths` control id');
    // v7.20.421: `traits` and `state` are BOTH retired — the controls are one per trait now.
    ok(!/id&quot;:&quot;traits&quot;/.test(out.html),
        'the healed rows still declare the retired row-wide `traits` control — the condition is per TRAIT since #245');
    ok(!/id&quot;:&quot;state&quot;/.test(out.html),
        'the healed rows still declare the retired row-wide `state` control — one condition for a whole value is the #245 defect');
    ok(/id&quot;:&quot;t-bravery&quot;/.test(out.html),
        'the healed rows do not declare a per-trait control (expected t-bravery on Courage)');

    // His answers must survive — this is the half that matters more than the fix.
    ok(/>TEST</.test(out.html), 'the student\'s typed answer was LOST by the heal — revert rather than ship this');
    ok(!/strengths&quot;:\{&quot;checked&quot;/.test(out.html), 'a tick is still namespaced under the retired control id');
    ok(out.carried.length >= 2, 'the heal reports carrying ' + out.carried.length + ' answers; the fixture has at least two');

    // ⭐⭐ THE MIGRATION ITSELF, run on a REAL old-shape state rather than described in prose.
    // A student who ticked two traits and chose "In excess" for the value must come out with
    // BOTH traits in excess — the faithful reading of what they actually asserted.
    (function migrateShape() {
        const fid = sandbox._cw7RowFieldId('begin', 'courage');
        const legacy = JSON.stringify({ c: { traits: { checked: [0, 2] }, state: { checked: [1] } } })
            .replace(/"/g, '&quot;');
        const got = migrateFn(legacy, fid);
        let parsed = null;
        try { parsed = JSON.parse(got.replace(/&quot;/g, '"')); } catch (e) { /* reported below */ }
        if (!ok(!!(parsed && parsed.c), 'the per-trait migration produced unparseable state — a student would lose every tick')) return;
        ok(!parsed.c.traits && !parsed.c.state,
            'the migration left the retired `traits`/`state` keys in place — the row would carry two contradictory answers');
        const courage = sandbox.CW7_VALUES.filter((v) => v.id === 'courage')[0];
        [0, 2].forEach((k) => {
            const id = sandbox._cw7TraitCtlId(courage.traits[k]);
            ok(!!(parsed.c[id] && JSON.stringify(parsed.c[id].checked) === JSON.stringify([1])),
                'the trait "' + courage.traits[k] + '" did not carry the value\'s condition across the migration');
        });
        ok(!parsed.c[sandbox._cw7TraitCtlId(courage.traits[1])],
            'a trait the student never ticked was given a condition — the migration is inventing answers');
        // Half-answered rows have nothing honest to carry, and must be left alone rather than guessed.
        const half = JSON.stringify({ c: { traits: { checked: [0] } } }).replace(/"/g, '&quot;');
        ok(migrateFn(half, fid) === half,
            'a half-answered legacy row was rewritten — traits with no chosen condition must be left for the walk to ask again');
    })();

    // Idempotent: healing an already-healed document must be a no-op, or every load rewrites the doc.
    const again = merge(out.html, rebuilt);
    ok(again.ok && again.stale === false,
        'the heal is not idempotent — it would re-stamp and re-save the document on every single load');
})();

console.log('\n' + (fail ? '❌ CW7 DOC GATE FAILED' : '✅ cw7-doc-gate passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
