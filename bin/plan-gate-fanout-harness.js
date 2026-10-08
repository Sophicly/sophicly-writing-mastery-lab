#!/usr/bin/env node
/* eslint-env node */
/**
 * v7.20.762 (FIXLIST #805h) — the three defects the 8 Oct staging walk of AQA P2 Q4 planning found,
 * driven on the SHIPPED functions sliced from wml-assessment.js (WML_SRC=<plugin dir> points it at
 * another tree — that is how the mutation proof runs it against the unfixed prod build).
 *   A. GATE BUTTONS IN PLANNING — the Q3→Q4 gate reply, verbatim from the walk (options written as
 *      plain lines, no [ ] row). _normalizeAssessmentReply must append the canonical row for a
 *      PLANNING turn, keep the rejected-penalty strip assessment-only, and stay idempotent.
 *   B. NO DOUBLED INTRO/CONCLUSION BOX — a one-exchange beat carries @FIELD_SET + @FIELD_COMMIT in ONE
 *      reply; both pipelines apply the sets first. The outline box must end holding the refined line
 *      only. A commit in any OTHER reply, or for a box the fan-out did not write, still files.
 *   C. SIX QUOTES FIRST — the Q4 protocol keeps the "all six before any paragraph" instruction.
 */
const fs = require('fs'); const path = require('path');
const ROOT = process.env.WML_SRC || path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const PROTO = fs.readFileSync(path.join(ROOT, 'protocols', 'aqa', 'language2', 'planning', 'protocol-b-planning.md'), 'utf8');
// Cut a module-scope function at ITS OWN closing line (same indent as the `function` keyword). A brace
// counter cannot be used here: the filing regexes carry `\{[^}]*\}`, which unbalances any naive count.
function slice(name) {
    const m = new RegExp('^([ \\t]*)function ' + name + '\\(', 'm').exec(SRC);
    if (!m) throw new Error('function not found: ' + name);
    const startLine = SRC.lastIndexOf('\n', m.index) + 1;
    if (SRC.slice(startLine, m.index + m[1].length).trim()) throw new Error('not a declaration at line start: ' + name);
    const close = new RegExp('^' + m[1] + '\\}[ \\t]*$', 'm');
    const rest = SRC.slice(m.index + m[0].length);
    const e = close.exec(rest);
    if (!e) throw new Error('no closing line for ' + name);
    // a one-line function (`function _fsNorm(s) { return …; }`) closes on its own line
    const firstLine = SRC.slice(m.index, SRC.indexOf('\n', m.index));
    if (/\}\s*$/.test(firstLine) && firstLine.split('{').length === firstLine.split('}').length) return firstLine.trim();
    return SRC.slice(m.index + m[1].length, m.index + m[0].length + e.index + e[0].length);
}
let fails = 0; const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fails++; };
const quiet = { log() {}, warn() {} };

// ── A. gate buttons ────────────────────────────────────────────────────────────────────────────────
console.log('A · the Q3→Q4 gate, verbatim from the walk (plain-line options, no button row)');
const GATE = 'That completes all three of your Question 3 body paragraphs — each one builds a genuinely distinct concept (transformation/escape, class/indifference, mystery/fragility), all anchored in close, precise language analysis.\n\nDoes that clear it up? Shall we continue with **Question 4 planning**?\n\n✓ Got it — continue\n🤔 Still confused\n💬 Different question\n⏸ Pause here';
const ROW = '`[✓ Got it — continue]`';
const PEN = '- Rhetorical question noted — no R2 penalty applied';
const mkNorm = (task) => new Function('state', 'console', slice('_normalizeAssessmentReply') + '; return _normalizeAssessmentReply;')({ task }, quiet);
const plan = mkNorm('planning'), assess = mkNorm('assessment');
const outP = plan(GATE);
ok(outP.split(ROW).length === 2, 'planning: the canonical button row is appended exactly once');
ok(plan(outP) === outP, 'planning: idempotent — a reply that already has the row is unchanged');
ok(plan(GATE + '\n' + PEN).indexOf(PEN) !== -1, 'planning: a "no penalty applied" line is NOT stripped (marking cards are assessment-only)');
ok(assess('Q2 card\n' + PEN + '\nTotal 5/8').indexOf(PEN) === -1, 'assessment: the rejected-penalty strip still runs');
ok(assess(GATE).split(ROW).length === 2, 'assessment: the button row is still appended');
ok(plan('Done.\n\nDoes that clear it up? Shall we continue with Q5?\n[ASSESSMENT_COMPLETE]').indexOf(ROW) === -1, 'a completed assessment never gets the row');
// display half: the appended row must render as buttons only, never as visible code
const strip = new Function(slice('_stripResumeMarkers') + '; return _stripResumeMarkers;')();
ok(strip(outP).indexOf('[✓') === -1 && strip(outP).indexOf('Shall we continue') !== -1, 'display: the row is stripped from the bubble text, the question stays');

// ── B. fan-out + commit in ONE reply ──────────────────────────────────────────────────────────────
console.log('B · intro + conclusion filed in one reply (set first, then commit — the pipelines\' order)');
function makeDoc(spec) {
    const nodes = spec.map(([name, fid], i) => ({ type: { name }, attrs: { fieldId: fid }, text: '', pos: i * 1000, nodeSize: 1000,
        get textContent() { return this.text; } }));
    const at = (p) => nodes.find(n => p > n.pos && p < n.pos + n.nodeSize);
    const flat = (c) => (Array.isArray(c) ? c : [c]).map(x => x.type === 'hardBreak' ? '\n' : (x.text || '')).join('');
    const editor = {
        schema: { nodes: { hardBreak: {} } },
        state: { doc: { descendants(f) { for (const n of nodes) { if (f(n, n.pos) === false) break; } } } },
        commands: { insertContentAt(where, content) {
            if (typeof where === 'number') { const n = at(where); n.text += flat(content); }
            else { const n = at(where.from); n.text = flat(content); }
            return true; } },
    };
    return { editor, get: (fid) => nodes.find(n => n.attrs.fieldId === fid).text };
}
const live = /if \(isPlan\) _planFanoutToOutline\(s\.field, s\.value, _live\);/.test(slice('_applyFieldValueSets'));
ok(live, 'drift guard: the shipped _applyFieldValueSets still runs the plan fan-out on every plan @FIELD_SET');
function engine(doc) {
    const hasRecord = SRC.indexOf('let _planFanoutRefined') !== -1;
    const body = (hasRecord ? 'let _planFanoutRefined = { reply: null, ids: new Set() };' : '')
        + ['_fsNorm', '_planFieldSegments', '_planLinesContent', '_planRowExists', '_planOutlineTargets', '_planLabelElement',
           '_planFanoutToOutline', 'applyFieldSets', '_writeOutlineRowField', 'applyFieldCommits'].map(slice).join('\n')
        + 'function _applyFieldValueSets(sets, opts) { const _live = !(opts && opts.replay); sets.forEach(s => { const isPlan = /^plan-/.test(s.field); if (isPlan) _planFanoutToOutline(s.field, s.value, _live); }); }'
        + 'return { applyFieldSets, applyFieldCommits };';
    const mem = new Map();
    return new Function('canvasEditor', 'state', 'console', 'saveCanvasContent', '_refreshPlanningSidebar', '_scrollToFilledField',
        '_autoFillHash', '_autoFillRecall', '_autoFillRemember', body)(
        doc.editor, { task: 'planning' }, quiet, () => {}, () => {}, () => {},
        (s) => String(s), (k) => mem.get(k), (k, v) => mem.set(k, v));
}
const runTurn = (eng, reply, msg) => { eng.applyFieldSets(reply); eng.applyFieldCommits(reply, msg); };
{
    const d = makeDoc([['inputField', 'plan-Q4-intro'], ['outlineRow', 'outline-intro-thesis-q4'], ['inputField', 'plan-Q4-conclusion'], ['outlineRow', 'outline-conclusion-thesis']]);
    const eng = engine(d);
    const RAW_I = 'Common ground: both writers show extreme weather as a force more powerful than people. Key difference: Dickinson sees a deadly enemy, Munby a beautiful but revealing change.';
    runTurn(eng, 'That\'s an excellent comparative thesis.\n\nFiled to your plan.\n\n@FIELD_COMMIT{"field":"outline-intro-thesis-q4"}\n@FIELD_SET{"field":"plan-Q4-intro","value":"Common ground: weather overpowers people | Key difference: enemy vs revealing change | Comparative thesis: Both present weather as overwhelming, yet A shows an enemy whereas B shows beauty that exposes suffering"}', RAW_I);
    const intro = d.get('outline-intro-thesis-q4');
    ok(/Comparative thesis/.test(intro) && intro.indexOf(RAW_I) === -1, 'intro outline box holds the refined line ONLY (raw answer not appended under it)');
    const RAW_C = 'Ultimately, Munby\'s approach proves more compelling because his quiet detail makes the reader rethink their own society.';
    runTurn(eng, 'Excellent conclusion.\n\n@FIELD_COMMIT{"field":"outline-conclusion-thesis"}\n@FIELD_SET{"field":"plan-Q4-conclusion","value":"Judgement: Munby more compelling | Reason: the quiet detail outlasts fear"}', RAW_C);
    const conc = d.get('outline-conclusion-thesis');
    ok(/Judgement/.test(conc) && conc.indexOf(RAW_C) === -1, 'conclusion outline box holds the refined line ONLY');
    ok(/Comparative thesis/.test(d.get('plan-Q4-intro') + d.get('outline-intro-thesis-q4')), 'the intro approval still reached the document');
    // a commit in a DIFFERENT reply to the same box files normally (the skip is per reply, never sticky)
    runTurn(eng, 'Small addition noted.\n@FIELD_COMMIT{"field":"outline-intro-thesis-q4"}', 'and it previews all three comparisons');
    ok(d.get('outline-intro-thesis-q4').indexOf('and it previews all three comparisons') !== -1, 'a later reply\'s commit to that box still files (skip is scoped to the approving reply)');
}
{
    const d = makeDoc([['outlineRow', 'outline-body-1-topic'], ['outlineRow', 'outline-body-1-evidence']]);
    const eng = engine(d);
    runTurn(eng, 'Good topic sentence.\nFiled to your plan.\n@FIELD_COMMIT{"field":"outline-body-1-topic"}', 'Both writers open with extreme weather transforming their world, yet…');
    ok(d.get('outline-body-1-topic').indexOf('Both writers open') === 0, 'a body element turn (commit only) files the student\'s words verbatim, as before');
    // set for a plan box whose outline row is ABSENT: the commit for another box in the same reply still files
    runTurn(eng, '@FIELD_SET{"field":"plan-Q4-intro","value":"Comparative thesis: x"}\n@FIELD_COMMIT{"field":"outline-body-1-evidence"}', 'simile tyre dump fire');
    ok(d.get('outline-body-1-evidence') === 'simile tyre dump fire', 'a commit to a box the fan-out did NOT write files normally in the same reply');
}

// ── C. protocol keeps the six-quotes-first instruction ─────────────────────────────────────────────
console.log('C · AQA P2 Q4 planning protocol: all six quotes before any paragraph');
const beat = PROTO.slice(PROTO.indexOf('### Beats 2–4 — Six anchor quotes'), PROTO.indexOf('### Beats 5–9'));
ok(/ALL SIX BEFORE ANY PARAGRAPH/.test(beat) && /never collect a pair at the start of Body 2 or Body 3/.test(beat), 'Beats 2–4 forbid building Body 1 before the six are chosen');
ok(/open that body's topic sentence on its pair from the\s+Beats 2–4 list/.test(PROTO), 'the next-aspect hand-off reuses the chosen pair');

console.log(fails ? '\n❌ plan-gate-fanout-harness: ' + fails + ' check(s) failed' : '\n✅ plan-gate-fanout-harness passed');
process.exit(fails ? 1 : 0);
