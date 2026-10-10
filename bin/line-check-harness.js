#!/usr/bin/env node
/* eslint-env node */
/**
 * line-check-harness.js — ☑ on lines inside a box gives each line a tick box (v7.20.811, FIXLIST #864).
 *
 * Neil, 10 Oct 2026, live-modelling the IGCSE Q4 plan: he selected ten lines in the plan box and pressed ☑ —
 * nothing happened. A box (inputField / outlineRow) holds INLINE content: its lines are hardBreaks, never
 * paragraphs, and the ☑ action only converted a paragraph. Measured on his saved prod document
 * (`plan-Q4-para-1`, lines separated by <br>). The fix puts an inline CheckMark at the start of each line.
 *   A · lineCheckOps (fenced @LINE-CHECK-PURE) on his real box: ten lines in, the blank line and the line
 *       above the selection out; the toggle back off; mixed lines; the caret; edges; two boxes at once
 *   B · three planted defects — each must be caught, or this harness tests nothing
 *   C · the wiring: node registered + round-trips through the saved HTML, ☑ tries the box path first, every
 *       refusal (display lock, viewers, read-only sections), the explicit save, the shared CSS
 * Real-browser proof: ~/.sophicly/probe/wml-344/checks864.mjs (staging, writes mocked).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes/class-rest-api.php'), 'utf8');
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const a = SRC.indexOf('// @LINE-CHECK-PURE-BEGIN'), b = SRC.indexOf('// @LINE-CHECK-PURE-END');
ok(a > 0 && b > a, 'the pure block is fenced');
const PURE = SRC.slice(a, b);
const load = (src) => new Function(src + '\nreturn lineCheckOps;')();
const lineCheckOps = load(PURE);

// Neil's real plan box (prod doc, 10 Oct): …Anxiety<br>Hopelessness<br><br>Topic sentence<br>peceptive<br>…<br>Author’s Purpose
const LINES = ['Anxiety', 'Hopelessness', '', 'Topic sentence', 'peceptive', 'Technical terms + evidence + inference', 'Technical terms',
    'Evidence', 'inference', 'Close analysis', 'Effect 1', 'Effect 2', 'Author’s Purpose'];
// Build a box: start position 100; a text node per non-empty line, a hardBreak (size 1) between lines.
function box(lines, start, marks) {
    const kids = []; const starts = []; let pos = start;
    lines.forEach((t, i) => {
        starts.push(pos);
        if (marks && marks[i]) { kids.push({ name: 'checkMark', size: 1 }); pos += 1; }
        if (t) { kids.push({ name: 'text', size: t.length }); pos += t.length; }
        if (i < lines.length - 1) { kids.push({ name: 'hardBreak', size: 1 }); pos += 1; }
    });
    return { block: { start, kids }, starts, end: pos };
}
const B = box(LINES, 100);
const from = B.starts[3], to = B.end;              // select "Topic sentence" … "Author’s Purpose" (his selection)
let ops = lineCheckOps([B.block], from, to);
ok(ops.length === 10 && ops.every((o) => o.op === 'insert'), `A1 his ten lines each get a tick box (${ops.length} inserts)`);
ok(JSON.stringify(ops.map((o) => o.pos)) === JSON.stringify(B.starts.slice(3).reverse()), 'A2 each tick goes at the START of its line, applied back to front');
ok(!ops.some((o) => o.pos === B.starts[2]), 'A3 the blank line between the two lists gets nothing');
ok(!ops.some((o) => o.pos === B.starts[1]), 'A4 "Hopelessness" (the line above the selection) gets nothing');
ops = lineCheckOps([B.block], B.starts[1], B.end);
ok(ops.length === 11 && !ops.some((o) => o.pos === B.starts[2]), 'A3b a selection ACROSS the blank line still skips it (11 lines ticked, the blank one not)');

const marks = LINES.map((t, i) => i >= 3);
const M = box(LINES, 100, marks);
ops = lineCheckOps([M.block], M.starts[3], M.end);
ok(ops.length === 10 && ops.every((o) => o.op === 'delete'), 'A5 pressing ☑ again on ticked lines takes the ticks off (the button toggles)');
ok(ops.every((o, i) => o.pos === M.starts[12 - i]), 'A6 each removal targets the tick at its line start');

const half = LINES.map((t, i) => i >= 3 && i % 2 === 0);
const H = box(LINES, 100, half);
ops = lineCheckOps([H.block], H.starts[3], H.end);
ok(ops.length > 0 && ops.every((o) => o.op === 'insert') && ops.length === LINES.slice(3).filter((t, i) => !half[i + 3]).length,
    'A7 a mixed selection ticks the lines that have none and leaves the others (never removes some and adds others)');

ops = lineCheckOps([B.block], B.starts[7] + 2, B.starts[7] + 2);
ok(ops.length === 1 && ops[0].pos === B.starts[7], 'A8 a caret inside a line ticks that one line');
ops = lineCheckOps([B.block], B.starts[2], B.starts[2]);
ok(ops.length === 0, 'A9 a caret on the blank line does nothing (the caller falls through)');
ops = lineCheckOps([B.block], B.starts[3], B.starts[5]);
ok(ops.length === 2 && !ops.some((o) => o.pos === B.starts[5]), 'A10 a selection ending exactly at the next line\'s start does not tick that line');
ops = lineCheckOps([B.block], B.starts[4] - 1, B.starts[5] - 1);
ok(ops.length === 1 && ops[0].pos === B.starts[4], 'A11 a selection starting at the end of the line above does not tick it');

const two = box(['Point 1', 'Point 2'], 300);
ops = lineCheckOps([B.block, two.block], B.starts[11], two.end);
ok(ops.length === 4 && ops[0].pos === two.starts[1] && ops.every((o, i) => i === 0 || o.pos < ops[i - 1].pos), 'A12 two boxes at once: every line in both, one back-to-front list');

const mid = { start: 500, kids: [{ name: 'text', size: 5 }, { name: 'checkMark', size: 1 }, { name: 'text', size: 4 }] };
ops = lineCheckOps([mid], 500, 510);
ok(ops.length === 1 && ops[0].op === 'insert' && ops[0].pos === 500, 'A13 a tick in the MIDDLE of a line is not that line\'s tick');

// ── B · planted defects ──
const mutate = (from_, to_) => { const s = PURE.replace(from_, to_); return s === PURE ? null : load(s); };
let m = mutate('(l.start < to && l.end > from)', '(l.start <= to && l.end >= from)');
ok(m && m([B.block], B.starts[3], B.starts[5]).length === 3, 'B1 planted: inclusive overlap would tick the next line — the edge test above catches it');
m = mutate('l.content && ', '');
ok(m && m([B.block], B.starts[1], B.end).some((o) => o.pos === B.starts[2]), 'B2 planted: not skipping blank lines would tick the empty line — caught by A3b');
m = mutate('.sort((a, b) => b.pos - a.pos)', '.sort((a, b) => a.pos - b.pos)');
ok(m && m([B.block], from, to)[0].pos === B.starts[3], 'B3 planted: front-to-back order would shift every later position — caught by A2');

// ── C · wiring ──
ok(/const CheckMark = Node\.create\(\{\s*name: 'checkMark',\s*inline: true,\s*group: 'inline',\s*atom: true,/.test(SRC), 'C1 CheckMark is an inline atom (allowed inside a box\'s inline content)');
ok(/\n\s*CheckMark, \/\/ v7\.20\.811/.test(SRC), 'C2 CheckMark is registered in the editor\'s extensions');
ok(/parseHTML\(\) \{ return \[\{ tag: 'span\[data-type="check-mark"\]' \}\]; \}/.test(SRC) && /'data-type': 'check-mark', class: 'swml-check-mark'/.test(SRC),
    'C3 it round-trips through the saved HTML as <span data-type="check-mark" data-checked>');
ok(/'span'/.test(REST) && /'data-type'/.test(REST) && /'data-checked'/.test(REST) && /\$tiptap_tags = \[[^\]]*'span'/.test(REST),
    'C4 the server keeps span + data-type + data-checked on save (wp_kses allow-list)');
const act = SRC.slice(SRC.indexOf('            checklist: () => {'), SRC.indexOf('            undo: () =>'));
ok(act.indexOf('_toggleLineChecks(canvasEditor)') > 0 && act.indexOf('_toggleLineChecks(canvasEditor)') < act.indexOf("type.name === 'paragraph'"),
    'C5 ☑ tries the box path FIRST, then the unchanged paragraph path');
const tog = SRC.slice(SRC.indexOf('function _toggleLineChecks(editor)'), SRC.indexOf('function _toggleLineChecks(editor)') + 2600);
ok(/!editor\.isEditable \|\| _docDisplayLocked\(\)/.test(tog), 'C6 ☑ never edits for a viewer or in a display-locked lesson');
ok(/node\.type\.name === 'sectionBlock' && node\.attrs\.editable === false/.test(tog), 'C7 ☑ never edits a read-only section');
ok(/'paragraph' \|\| node\.type\.name === 'heading' \|\| node\.type\.name === 'checklistItem'/.test(tog), 'C8 paragraphs, headings and block checklist items stay with the block path');
ok(/const tr = state\.tr;[\s\S]{0,800}view\.dispatch\(tr\)/.test(tog), 'C9 every line changes in ONE transaction (one Cmd+Z undoes it)');
ok(/tr\.setMeta\('uiEvent', 'checklist'\);\s*view\.dispatch\(tr\);/.test(tog), 'C9c the ☑ change is marked as the student\'s own (uiEvent) — else the structure lock keeps it out of undo (measured)');
const nv = SRC.slice(SRC.indexOf('const CheckMark = Node.create'), SRC.indexOf('// ── OutlineRow Node'));
ok(nv.length > 500 && nv.length < 6000, 'C9b the CheckMark NodeView source is found (beside ChecklistItem)');
ok(/dom\.closest\('\[data-swml-display-lock\]'\) \|\| !editor\.isEditable/.test(nv), 'C10 a tick is refused where ChecklistItem\'s is (display lock) and for anyone who cannot edit');
ok(/tr\.setNodeMarkup\(pos, undefined, \{ \.\.\.cur\.attrs, checked: !cur\.attrs\.checked \}\)/.test(nv), 'C11 a tick is a PM transaction (NodeView law)');
ok(/saveCanvasContent\(\)/.test(nv), 'C12 a tick saves explicitly (setNodeMarkup does not reliably fire onUpdate)');
ok(/ignoreMutation: \(\) => true/.test(nv) && /update\(n\)/.test(nv), 'C13 the NodeView updates in place (the tick animates; no foreign-edit redraw)');
ok(/\.swml-check-mark\[data-checked="true"\] \.swml-checklist-box/.test(CSS) && /\.swml-prior-pad \[data-type="check-mark"\]/.test(CSS),
    'C14 the shared tick look applies to the inline box, live and in the stored-document pad');

console.log(`${fail ? '✗ FAIL' : '✓ PASS'} — line-check-harness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
