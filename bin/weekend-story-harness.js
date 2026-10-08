#!/usr/bin/env node
/* eslint-env node */
/**
 * weekend-story-harness.js — the weekend story's lesson 5 (CW Step 9 run as a unit lesson) picks the
 * scene from the STORY SPINE, because the unit never writes a plot outline. (v7.20.737, PEDAGOGY §55,
 * WEEKEND-STORY-PLAN.md §4 step 1–2, EMERGENCY-CW-UNIT-SPEC §5.)
 *
 * WHY THIS EXISTS. The spec names lesson 5 "the single highest-risk point in the unit": its first move
 * is choosing what to write FROM, and with no plot outline the full-course walk tells the student to go
 * back to Step 6 — a lesson the unit does not contain. Every piece of that failure is silent from the
 * code's side (the gate fires correctly, the island mounts correctly, the student is simply stuck), so
 * it is asserted here, on the REAL factory driven through walk-sim-lib, with Step 4's real row ids:
 *   A · the one board → word-target map (wml-core, executed)
 *   B · the spine world (the pure builder, executed) — six beats in, six one-beat cards out
 *   C · the walk in a unit lesson, keys ABSENT then present: liveness at every turn, beats offered,
 *       the scene filed, the position named in beats, zero API calls
 *   D · the full course is untouched (same greeting, same Step-6 gate, same stage words)
 *   E · no unit string names a course step, a plot or a stage (root §5c-ii; plan §5 grep gate)
 *   F · the wiring: shortcode → embed config → state → session → router note
 *   G · the island's DEFAULT words are the prototype's, byte for byte (root §13)
 *   I · the sidebar in a weekend lesson: "Lesson Progress", unit rows, the 33 as a grid (v7.20.746)
 *   H · the 33 dramatic situations (v7.20.743): our source's order + names, plain and safe words, the marker validator
 *   K · the word-count pill in a weekend draft lesson counts to the board's length (v7.20.751)
 *   L · lesson 9, Adapt It to the Question (v7.20.753): the REAL PHP board table run for every board, the pure
 *       helpers, the wiring, no unit-leak words, and the real walk driven like a student — liveness at every
 *       turn, each line filed to its own row, ONE judgement call, fail-open, recall without a second call,
 *       resume from the document alone, and a verdict recovered from the transcript instead of bought twice
 */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { SRC, braceSliceFrom, makeWorld, settle, sliceController } = require('./walk-sim-lib');
const ROOT = path.resolve(__dirname, '..');
let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg, got) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got).slice(0, 400) : ''));
    return false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LEAK_RE = /\bSteps? \d|\bplot\b|\bstages?\b/i;   // words a weekend-story student was never taught

// ── A · the word-target map, executed from wml-core ──────────────────────────────────────────
const mkStyle = () => ({ setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } });
const mkEl = () => ({ style: mkStyle(), classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} }, dataset: {}, children: [], appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, insertAdjacentHTML() {}, closest() { return null; }, focus() {}, click() {}, getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; } });
global.document = { addEventListener() {}, removeEventListener() {}, createElement: mkEl, createTextNode() { return {}; }, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; }, body: mkEl(), documentElement: mkEl(), head: mkEl(), readyState: 'complete' };
global.window = { addEventListener() {}, removeEventListener() {}, location: { href: '', search: '', hash: '' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, document: global.document, matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; }, getComputedStyle() { return mkStyle(); }, requestAnimationFrame() { return 0; }, setTimeout() { return 0; } };
global.getComputedStyle = global.window.getComputedStyle;
global.navigator = { userAgent: 'node' };
global.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
global.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;
const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
try { new Function(CORE)(); } catch (e) { console.error('wml-core.js did not evaluate — ' + e.message); process.exit(1); }   // eslint-disable-line no-new-func
const WMLC = global.window.WML;
console.log('WEEKEND STORY — lesson 5 picks its scene from the Story Spine');
console.log(' A · the board → word-target map');
const st = WMLC.state;
const target = (unit, board, kind) => { st.cwUnit = unit; st.cwExamBoard = board; return WMLC.cwWordTarget(kind); };
ok(target('', 'cambridge-igcse', 'd1') === '450–600' && target('', '', 'exam') === '650–700',
    'the full course (no unit) always reads the default — the figures its copy already used');
ok(target('weekend', 'cambridge-igcse', 'd1') === '350–450' && target('weekend', 'cambridge_igcse', 'exam') === '350–450',
    'Cambridge (either slug form) → 350–450, the figure printed on every P2 Section B');
ok(target('weekend', 'eduqas', 'd1') === '450–600' && target('weekend', 'eduqas', 'exam') === '450–600', 'Eduqas → 450–600, printed on C700U10 Section B');
ok(target('weekend', 'aqa', 'd1') === '450–600' && target('weekend', 'edexcel-igcse', 'exam') === '650–700' && target('weekend', '', 'd1') === '450–600',
    'every board that prints no figure keeps our ladder (no invented number)');
ok(target('Weekend', 'cambridge-igcse', 'd1') === '450–600' && !WMLC.cwInUnit(), 'an unknown unit value is NOT a unit (whitelist, exact match)');
st.cwUnit = ''; st.cwExamBoard = '';

// ── B · the pure spine world ─────────────────────────────────────────────────────────────────
console.log(' B · the spine world');
const pb = SRC.indexOf('    const CW_STEP4_SPINE = [');
const pe = SRC.indexOf('// @CW-SPINE-WORLD-PURE-END');
ok(pb > 0 && pe > pb && SRC.indexOf('// @CW-SPINE-WORLD-PURE-BEGIN') > pb, 'the spine world is fenced for this harness');
const SPINE = new Function(SRC.slice(pb, pe) + '\nreturn { _cwSpineWorld, CW_SPINE_POSITIONS, CW_STEP4_SPINE };')();   // eslint-disable-line no-new-func
// ── H-prep · the Polti bank + its marker validator (v7.20.743), executed from the source ─────────
const qb = SRC.indexOf('// @CW-POLTI-PURE-BEGIN');
const qe = SRC.indexOf('// @CW-POLTI-PURE-END');
ok(qb > 0 && qe > qb, 'the dramatic-situation bank is fenced for this harness');
const POLTI = new Function(SRC.slice(qb, qe) + '\nreturn { CW_POLTI_33, _poltiById, _poltiParsePicks };')();   // eslint-disable-line no-new-func
const BEAT_TEXT = {
    'cw-step-4-beat1': 'At first, a girl walks the long way to school so she never has to pass the asylum.',
    'cw-step-4-beat2': 'And then, every morning she keeps her hood up and her eyes on the pavement.',
    'cw-step-4-beat3': 'Until, one morning, a boy her age is arrested in front of her and looks straight at her for help.',
    'cw-step-4-beat4': 'And because of this, she follows the van to find out where they take him.',
    'cw-step-4-beat5': 'And because of this, she is caught at the gate and her mother is named as a patient.',
    'cw-step-4-beat6': 'Until finally, she stands up in assembly and tells the school what she saw.',
};
const FULL = Object.assign({ 'cw-step-4-unmet-needs': 'Love & Belonging', 'cw-step-4-throughline': 'The protagonist succeeds' }, BEAT_TEXT);
const w0 = SPINE._cwSpineWorld({});
ok(w0.arch === null && w0.stages.length === 0, 'ALL keys absent → an empty world (the walk must then gate, never mount)');
const w6 = SPINE._cwSpineWorld(FULL);
ok(w6.arch === 'story-spine' && w6.stages.length === 6, 'six written beats → six cards', w6.stages.length);
ok(w6.stages.map((s) => s.beats[0].id).join() === 'cw-step-4-beat1,cw-step-4-beat2,cw-step-4-beat3,cw-step-4-beat4,cw-step-4-beat5,cw-step-4-beat6',
    'each card carries Step 4\'s REAL row id (§5d — the key the spine walk writes)');
ok(w6.stages.every((s, i) => s.beats.length === 1 && s.si === i && s.roman === 'Beat ' + (i + 1)), 'one beat per card, in story order, named "Beat N"');
ok(w6.stages[0].name === 'At first…' && w6.stages[5].name === 'Until finally…', 'each card is named by the spine\'s own lead words', w6.stages.map((s) => s.name));
ok(w6.stages.every((s) => !/unmet|throughline/i.test(s.beats[0].id)), 'the unmet need and throughline are context, never pickable beats');
const w2 = SPINE._cwSpineWorld({ 'cw-step-4-beat2': BEAT_TEXT['cw-step-4-beat2'], 'cw-step-4-beat5': '  ', 'cw-step-4-beat6': BEAT_TEXT['cw-step-4-beat6'] });
ok(w2.stages.length === 2 && w2.stages[0].si === 1 && w2.stages[1].si === 5 && w2.stageTotal === 6,
    'partly written → only the written beats, each keeping its place in the six (blank = unwritten)');
ok(SPINE.CW_SPINE_POSITIONS.every((p) => /Beats? \d/.test(p) && !LEAK_RE.test(p.replace(/Beats? \d.*/, ''))), 'the positions name beats');

// ── C/D · the real factory, driven like a student ────────────────────────────────────────────
const fi = SRC.indexOf('function makeCwSceneCtl(cfg) {');
const FACTORY = SRC.slice(fi, braceSliceFrom(SRC, fi, '{', '}').end);
const ci = SRC.indexOf("task: 'cw_step_9', walk:");
const cs = SRC.lastIndexOf('makeCwSceneCtl({', ci);
const CFG9 = SRC.slice(cs + 'makeCwSceneCtl('.length, braceSliceFrom(SRC, cs + 'makeCwSceneCtl('.length, '{', '}').end);
ok(/unit: CW9_UNIT/.test(CFG9), 'Step 9 carries its unit variant');
const consts = (name) => { const i = SRC.indexOf('const ' + name + ' = '); const e = SRC.indexOf('\n            const ', i + 5); return SRC.slice(i, e); };
const CONSTS = ['CW9_GREETING', 'CW9_INTRO', 'CW9_UNIT'].map(consts).join('\n');
const ARCH = (() => { const i = SRC.indexOf('cwPlotArchetypes:'); return eval('(' + braceSliceFrom(SRC, i + 'cwPlotArchetypes:'.length, '{', '}').text + ')'); })();   // eslint-disable-line no-eval
const island = { props: null };
const OWNERS = {};
const SAVED = [];
let CUR = null;
const dropdowns = [];
function world(opts) {
    const src = '(function () {\n' + CONSTS + '\n' + FACTORY + '\nreturn makeCwSceneCtl(' + CFG9 + ');\n})()';
    const fids = ['plot-position', 'extract-description', 'hook', 'setup', 'reaction', 'epiphany', 'proaction', 'climax', 'denouement'].map((x) => 'cw-step-8-' + x);
    const store = Object.assign({}, opts.store || {});
    const w = makeWorld({ src }, {
        task: 'cw_step_9', fids, ok,
        extraDeps: {
            DOMParser: function () {}, OUTLINE_CRITERIA: { cwPlotArchetypes: ARCH }, _cw6RowFieldId: () => '',
            document: { querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; }, createTextNode(t) { return { textContent: t }; } },
            _cwSpineWorld: SPINE._cwSpineWorld,
            CW_POLTI_33: POLTI.CW_POLTI_33, _poltiById: POLTI._poltiById, _poltiParsePicks: POLTI._poltiParsePicks,
            // the REAL loader's contract: artifact → { fid: text } (the fixture IS that map)
            _cwLoadDocValues: (pid, key) => Promise.resolve(key === 'brief_outline' && store.brief_outline ? store.brief_outline : {}),
            _cwWriteOutlineRowLines: function (fid, lines) { if (!CUR.rows.has(fid)) { CUR.lostWrite = fid; return false; } CUR.rows.set(fid, lines.join('\n')); return true; },
            _setOutlineDropdown: function (fid, label) { dropdowns.push({ fid, label }); return true; },
            closeCanvasOverlay: function () {}, escapeHTML: (s) => s, sectionHTML: () => '<section></section>', _migrationActive: false,
            _CW_TURN_OWNERS: OWNERS,   // v7.20.740: the factory registers its owns(text) here
            saveCanvasChat: function (h) { SAVED.push((h || []).length); },   // v7.20.745: a pick must be SAVED, not only recorded
        },
        externalSurface: function () { return !!island.props; },
    });
    w.deps.WML.cwProject = {
        loadArtifact: (pid, key) => Promise.resolve(store[key] !== undefined ? { success: true, value: store[key] } : { success: false }),
        saveArtifact: (pid, key, val) => { store[key] = val; return Promise.resolve({ success: true }); },
    };
    w.deps.WML.icon = () => '';
    w.deps.WML.cwInUnit = () => !!opts.unit;
    w.deps.WML.cwWordTarget = (k) => (opts.unit && opts.board === 'cambridge-igcse') ? '350–450' : ({ d1: '450–600', exam: '650–700' }[k]);
    w.deps.window.WMLSceneIsland = { mount(o) { island.props = o; island.transfer = (p) => o.onTransfer(p); island.close = () => { island.props = null; o.onClose(); }; return { unmount() {} }; }, unmount() {} };
    w.store = store;
    return w;
}
const chipText = (c) => String(c.textContent || '') + (c.children || []).map((x) => String(x.textContent || '')).join('');
const chip = (w, re) => w.chips().filter((c) => re.test(chipText(c)))[0];
async function until(w, pred) { for (let i = 0; i < 12; i++) { await settle(); await wait(10); if (pred()) return true; } return pred(); }
const SEVEN = (hook, setup) => [
    { id: 'hook', beats: hook, added: [] }, { id: 'setup', beats: setup, added: ['she counts the cars'] },
    { id: 'reaction', beats: [], added: ['she nearly runs'] }, { id: 'epiphany', beats: [], added: ['his face is her brother\'s age'] },
    { id: 'proaction', beats: [], added: ['she steps forward'] }, { id: 'climax', beats: [], added: ['the sentinel turns'] },
    { id: 'denouement', beats: [], added: ['she is late, and changed'] },
];

(async function main() {
    console.log(' C · lesson 5 in a weekend-story lesson (Cambridge student)');
    {
        island.props = null;
        const w = CUR = world({ unit: true, board: 'cambridge-igcse', store: {} });
        w.ctl.start();
        await until(w, () => w.bubbles.length > 0);
        const gate = w.bubbles.join('\n');
        ok(/Story Spine/.test(gate) && !LEAK_RE.test(gate), '⭐ keys ABSENT → it names the Story Spine, never Step 6 or a plot', gate);
        ok(w.chips().length > 0, '⭐ §4d liveness: the gate leaves a chip on screen (never a dead end)');
        ok(!island.props, 'the picker is NOT mounted over nothing');
        // the student finishes the spine in its own lesson, comes back, taps the re-check
        w.store.brief_outline = FULL;
        const re = chip(w, /check again/);
        ok(!!re, 'the way forward is a re-check, not a link to the full course\'s Steps page');
        if (re) w.tap(re);
        await until(w, () => /Your Dramatic Situation/.test(w.bubbles[w.bubbles.length - 1] || ''));
        const greet = w.bubbles[w.bubbles.length - 1] || '';
        ok(/Your Dramatic Situation/.test(greet) && !LEAK_RE.test(greet), 'the re-check re-derives: the lesson greets as "Your Dramatic Situation"', greet);
        w.tap(chip(w, /Let’s go/)); await settle();
        for (let i = 0; i < 5 && chip(w, /Continue/); i++) { w.tap(chip(w, /Continue/)); await settle(); }
        const intro = w.bubbles.join('\n');
        ok(/about 350–450 words/.test(intro), 'the intro states the student\'s OWN board\'s length (Cambridge 350–450)', intro.match(/write about [^.]*/));
        ok(!LEAK_RE.test(intro), 'no step number, plot or stage anywhere in the unit intro', (intro.match(new RegExp('.{0,40}(' + LEAK_RE.source + ').{0,40}', 'i')) || [])[0]);
        ok(/Georges Polti/.test(intro) && /33/.test(intro) && /dramatic situations/.test(intro), 'the intro teaches what a dramatic situation is, and that the list is 33');
        // ⭐ v7.20.743 (§55.1): the SITUATION comes first — the picker is not offered until one is chosen.
        await until(w, () => !!chip(w, /Find my dramatic situation/));
        ok(!!chip(w, /Find my dramatic situation/) && !!chip(w, /Show me all 33/), '⭐ the intro ends on the situation chips (liveness)');
        ok(!chip(w, /Choose my scene/), '⭐ the scene picker is NOT offered before a situation is chosen');
        ok(w.sends.length === 0, 'no API call until the student asks for suggestions');
        w.tap(chip(w, /Find my dramatic situation/));
        await until(w, () => w.sends.length > 0);
        ok(w.sends.length === 1 && w.sends[0].id === 'cw9-polti-picks', '⭐ ONE judgement turn, armed as the Polti hand-off', w.sends);
        const hid = (w.deps.canvasChatHistory || []).filter((m) => m.hidden && /DRAMATIC SITUATION FINDER/.test(m.content)).pop();
        ok(!!hid, 'the hidden context is recorded (durable) for the model');
        const hctx = hid ? hid.content : '';
        ok(POLTI.CW_POLTI_33.every((p) => hctx.indexOf(p.id + '. ' + p.name + ':') !== -1), 'it hands Sophia ALL 33 of OUR situations, by our plain names');
        ok(/Beat 3: Until, one morning, a boy her age is arrested/.test(hctx) && /Beat 6: Until finally/.test(hctx), 'it hands Sophia the student\'s own beats, numbered');
        ok(/@POLTI_PICKS/.test(hctx) && !/kinsman|brigandage|alienist/i.test(hctx), 'it states the marker contract, in plain words');
        // the reply: two good picks, one id that is not ours, one beat the student never wrote
        w.resolveApi('Here are three that fit.\n\n**The Chase** ... **Rebellion** ...\n\n@POLTI_PICKS{"picks":[{"id":5,"beat":4,"roles":["On the run: the boy","Hunting him: the sentinels"]},{"id":34,"beat":2,"roles":[]},{"id":8,"beat":7,"roles":[]},{"id":8,"beat":6,"roles":["In charge: the asylum","Rebels: the girl"]}]}');
        await until(w, () => !!chip(w, /The Chase/));
        ok(!!chip(w, /The Chase →/) && !!chip(w, /Rebellion →/) && !!chip(w, /Show me all 33/), '⭐ the valid picks become chips, plus the full list', w.chips().map(chipText));
        ok(w.chips().filter((c) => / →$/.test(chipText(c))).length === 2, 'an id that is not ours and a beat the student never wrote are DROPPED', w.chips().map(chipText));
        w.tap(chip(w, /The Chase →/));
        await until(w, () => /Your dramatic situation: The Chase/.test(w.bubbles.join('\n')));
        const conf = w.bubbles[w.bubbles.length - 1] || '';
        ok(/Your dramatic situation: The Chase/.test(conf) && /On the run: the boy/.test(conf) && /Beat 4/.test(conf), 'the confirmation names the situation, THEIR roles and the beat', conf);
        ok(!(w.deps.canvasChatHistory || []).some((m) => m.role === 'assistant' && /Your dramatic situation:/.test(m.content)), '§4c.7: the confirmation is drawn, never stored (the student can change it)');
        ok((w.deps.canvasChatHistory || []).some((m) => m.role === 'user' && m.content === 'The Chase'), 'the pick is a transcript-visible user turn');
        ok(SAVED.length && SAVED[SAVED.length - 1] === (w.deps.canvasChatHistory || []).length, '⭐ ...and the chat is SAVED with it (staging .744: the pick never replayed after a reload)', SAVED.slice(-3));
        await until(w, () => { try { return JSON.parse(w.store.scene_selection_state || '{}').situation; } catch (e) { return false; } });
        const sst = JSON.parse(w.store.scene_selection_state || '{}');
        ok(sst.situation && sst.situation.id === 5 && sst.situation.beat === 4, 'the situation is saved with the scene state', sst.situation);
        ok(sst.arch === 'story-spine' && JSON.stringify(sst.stageIds) === '["spine-beat-4"]', '⭐ ...and so is its beat, in the selection the picker restores from', sst);
        const pick = chip(w, /Choose my scene/);
        ok(!!pick && !!chip(w, /Change my dramatic situation/), 'now the scene chip is offered, with a way to change the situation');
        if (pick) w.tap(pick);
        await until(w, () => !!island.props);
        ok(!!island.props, '⭐ the picker mounts');
        const P = island.props || { stages: [] };
        ok(P.stages.length === 6 && P.stages.every((s) => s.beats.length === 1), '⭐ it offers the six spine beats — one card each', P.stages.length);
        ok(P.labels && /Story Spine/.test(P.labels.stagesH2) && !LEAK_RE.test(JSON.stringify(P.labels)), 'the island speaks about beats, not stages');
        ok(P.labels && P.labels.stageMeta(P.stages[2]) === BEAT_TEXT['cw-step-4-beat3'], 'each card shows the student\'s own sentence');
        const b3 = P.stages[2].beats[0], b4 = P.stages[3].beats[0];
        await island.transfer({ stageIds: ['spine-beat-3', 'spine-beat-4'], elements: SEVEN([b3], [b4]) });
        ok(CUR.rows.get('cw-step-8-hook') === b3.text, 'the chosen beat files VERBATIM into the real Step-9 row', CUR.rows.get('cw-step-8-hook'));
        ok(CUR.rows.get('cw-step-8-setup') === b4.text + '\nshe counts the cars', 'beat then added moment, in story order');
        ok(!CUR.lostWrite, 'every write hit a real cw-step-8-* row', CUR.lostWrite);
        const pos = dropdowns.filter((d) => d.fid === 'cw-step-8-plot-position').pop();
        ok(pos && pos.label === 'Middle (Beats 3–4)', 'the position is named in beats (beat 3 → the middle third of six)', pos);
        const rep = w.bubbles.join('\n');
        ok(/Story Spine is untouched/.test(rep) && !/plot outline/i.test(rep), 'the transfer report speaks about the spine');
        ok(!!w.store.scene_selection_state && JSON.parse(w.store.scene_selection_state).arch === 'story-spine', 'selection persisted under the usual key, marked as a spine selection');
        ok(w.sends.length === 1, 'exactly ONE API call in the whole lesson — the situation suggestions', w.sends.length);
        // v7.20.740: the RESUME replay redrew our numbered intro through chip detection (three fake
        // buttons, measured on staging). The walk must claim every turn it authored, and only those.
        const owns = OWNERS.cw_step_9;
        ok(typeof owns === 'function', 'the walk registers which stored turns it wrote');
        const mine = w.bubbles.filter((b) => /Your Dramatic Situation|Here’s how it works|Every gripping scene|Why choose the situation first|a \*\*scene is a mini story\*\*/.test(b) && !/I can’t find/.test(b));   // the gate is ephemeral — never stored, never replayed
        ok(mine.length >= 3 && mine.every((b) => owns(b)), '⭐ the greeting and every intro chunk are claimed (so a resume draws no fake "1. 2. 3." buttons)', mine.length);
        ok(!owns('Great question! A hook is the first line that grabs your reader.') && !owns(''), '…and a genuine Sophia reply is NOT claimed (its chips still work)');
        island.props = null;
        // beat 1 and beat 6 land in the outer thirds
        dropdowns.length = 0;
        const W2 = CUR = world({ unit: true, board: 'aqa', store: { brief_outline: FULL } });
        W2.ctl.start(); await until(W2, () => W2.bubbles.length > 0);
        W2.tap(chip(W2, /Let’s go/)); await settle();
        for (let i = 0; i < 4 && chip(W2, /Continue/); i++) { W2.tap(chip(W2, /Continue/)); await settle(); }
        ok(/about 650–700 words/.test(W2.bubbles.join('\n')), 'an AQA student is told the default exam length (no printed figure)');
        // v7.20.743: the code-only route — browse all 33, read a card, place it on a beat. Zero API calls.
        await until(W2, () => !!chip(W2, /Show me all 33/));
        W2.tap(chip(W2, /Show me all 33/)); await settle();
        const names = W2.chips().map(chipText);
        ok(names.length === 33 && names[0] === 'Begging for Help' && names[32] === 'Mistaken Identity', '"Show me all 33" lays out our 33 by plain name, in our order', names.length);
        W2.tap(chip(W2, /^The Chase$/)); await settle();
        const card = W2.bubbles[W2.bubbles.length - 1] || '';
        ok(/\*\*The Chase\*\*/.test(card) && /The roles:/.test(card) && /For example:/.test(card) && /Les Misérables/.test(card), 'a name opens ITS card: what it is, the roles, a famous example', card);
        W2.tap(chip(W2, /Use this one/)); await settle();
        const beats = W2.chips().map(chipText);
        ok(beats.length === 6 && /^Beat 1: At first/.test(beats[0]), 'the student places it on one of THEIR beats', beats);
        W2.tap(chip(W2, /^Beat 6:/)); await settle();
        ok(/Your dramatic situation: The Chase/.test(W2.bubbles.join('\n')) && /The one on the run · The hunter/.test(W2.bubbles.join('\n')), 'a browsed pick confirms with the list\'s own roles, each starting with a capital');
        ok(W2.sends.length === 0, '⭐ the browse route costs ZERO API calls', W2.sends.length);
        await until(W2, () => { try { return JSON.parse(W2.store.scene_selection_state || '{}').situation; } catch (e) { return false; } });
        W2.tap(chip(W2, /Choose my scene/)); await until(W2, () => !!island.props);
        ok(island.props && island.props.initial && JSON.stringify(island.props.initial.stageIds) === '["spine-beat-6"]', '⭐ the picker opens ON the situation\'s beat', island.props && island.props.initial);
        ok(island.props && /The Chase\.\*\* Someone is on the run/.test(island.props.labels.sub) && !LEAK_RE.test(island.props.labels.sub), 'the picker is headed by the chosen situation and its meaning', island.props && island.props.labels.sub);
        ok(island.props && !/one on the run ·|hunter/i.test(island.props.labels.sub), 'the heading does NOT carry the roles (they ran on into the island\'s sentence, staging .743)', island.props && island.props.labels.sub);
        await island.transfer({ stageIds: ['spine-beat-6'], elements: SEVEN([island.props.stages[5].beats[0]], []) });
        ok((dropdowns.pop() || {}).label === 'End (Beats 5–6)', 'beat 6 → End (Beats 5–6)');
        island.props = null;
        // FAIL-OPEN (§4d): the suggestions call times out or drops its marker → the full list, never a dead end.
        for (const bad of [null, 'Here are some ideas, but I forgot the marker.', '@POLTI_PICKS{"picks":[{"id":"x","beat":1}]}']) {
            const W3 = CUR = world({ unit: true, board: 'aqa', store: { brief_outline: FULL } });
            W3.ctl.start(); await until(W3, () => W3.bubbles.length > 0);
            W3.tap(chip(W3, /Let’s go/)); await settle();
            for (let i = 0; i < 5 && chip(W3, /Continue/); i++) { W3.tap(chip(W3, /Continue/)); await settle(); }
            await until(W3, () => !!chip(W3, /Find my dramatic situation/));
            W3.tap(chip(W3, /Find my dramatic situation/)); await until(W3, () => W3.sends.length > 0);
            W3.resolveApi(bad); await settle();
            ok(W3.chips().length === 33 && /all 33 instead/.test(W3.bubbles.join('\n')), '⭐ an unusable reply (' + JSON.stringify(bad).slice(0, 30) + ') falls open to the full list', W3.chips().length);
        }
    }
    console.log(' D · the full course is untouched');
    {
        const w = CUR = world({ unit: false, store: { brief_outline: FULL } });
        w.ctl.start(); await until(w, () => w.bubbles.length > 0);
        const b = w.bubbles.join('\n');
        ok(/Step 6/.test(b) && /plot outline/.test(b), 'no plot outline in the FULL course → its own Step-6 gate (the spine is NOT a fallback there)', b);
        ok(!!chip(w, /Back to Steps/), 'and its own Back to Steps chip');
        ok(!island.props, 'nothing mounted');
    }

    // ── E · copy gate ──
    console.log(' E · no unit string names a step, a plot or a stage');
    {
        const fake = { cwWordTarget: () => '350–450' };
        const U = new Function('WML', CONSTS + '\nreturn CW9_UNIT;')(fake);   // eslint-disable-line no-new-func
        const strings = [];
        (function walk(v) {
            if (typeof v === 'string') strings.push(v);
            else if (typeof v === 'function') { const r = v.length ? v({ beats: [{ text: 'x' }] }) : v(); walk(r); if (v.length) walk(v(2)); }
            else if (v && typeof v === 'object') Object.keys(v).forEach((k) => { if (k !== 'stageMeta') walk(v[k]); });
        })(U);
        const bad = strings.filter((t) => LEAK_RE.test(t));
        ok(strings.length > 15 && bad.length === 0, 'every CW9_UNIT string is clean (' + strings.length + ' checked)', bad);
        const di = SRC.indexOf("if (_unit) html += sectionHTML('question', 'About This Lesson'");
        const de = SRC.indexOf('else html += sectionHTML(', di);
        const about = SRC.slice(di, de).replace(/<[^>]+>/g, ' ');
        ok(di > 0 && de > di && !LEAK_RE.test(about.replace(/sectionHTML\('question', 'About This Lesson'/, '')), 'the lesson 5 page\'s "About This Lesson" is clean');
        ok(/_unit\s*\n?\s*\?\s*outlineRowHTML\(\{ id: 'plot-position', label: 'Part of the Story', type: 'dropdown', items: CW_SPINE_POSITIONS\.slice\(\)/.test(SRC),
            'the page\'s position dropdown lists the SAME labels the walk sets (write-key = read-key, §5d)');
        // Shared CW turns edited where SERVED in a unit (one table, CW_UNIT_TEXT_EDITS). A drifted literal
        // makes an edit a silent no-op, so EVERY edit's "from" must still occur in the shipped source.
        const ti = SRC.indexOf('const CW_UNIT_TEXT_EDITS = [');
        const fi2 = SRC.indexOf('function _cwUnitText(t) {', ti);
        const UT = SRC.slice(ti, braceSliceFrom(SRC, fi2, '{', '}').end);
        const mkUT = (unit) => new Function('WML', UT + '\nreturn { E: CW_UNIT_TEXT_EDITS, f: _cwUnitText };')({ cwInUnit: () => unit });   // eslint-disable-line no-new-func
        const U1 = mkUT(true), U0 = mkUT(false);
        const SRC_NO_TABLE = SRC.slice(0, ti) + SRC.slice(braceSliceFrom(SRC, fi2, '{', '}').end);
        U1.E.forEach((ed) => ok(SRC_NO_TABLE.indexOf(ed[0]) !== -1 && !LEAK_RE.test(ed[1]),
            'unit edit still matches its source and the replacement is clean: "' + ed[0].slice(0, 50) + '"'));
        const gi = SRC.indexOf("{ fid: 'cw-step-3-goal', label: 'Goal', criteria:");
        const goal = new Function('HELP_LINE', 'return (' + braceSliceFrom(SRC, gi, '{', '}').text + ');')('');   // eslint-disable-line no-new-func
        ok(U0.f(goal.ask) === goal.ask && /build that in Step 6/.test(goal.ask), 'lesson 3: the full course is served the goal ask unchanged');
        ok(!/Step 6/.test(U1.f(goal.ask)) && /often arrives a little later in the story/.test(U1.f(goal.ask)), '⭐ lesson 3: a unit lesson is served it without the Step-6 pointer');
        const LOG = SRC.slice(SRC.indexOf('const _cwLoglineCtl = (function'), SRC.indexOf('const _cwSpineCtl = (function'));
        ok(/function askOf\(st\) \{ return _cwUnitText\(st\.ask\); \}/.test(LOG) && !/[^\w](STEPS\[i\]|st|step)\.ask\b/.test(LOG.replace(/return _cwUnitText\(st\.ask\)/, '')),
            'every place the logline walk SERVES an ask goes through askOf → _cwUnitText');
        const T1 = SRC.slice(SRC.indexOf('const _cwTrial1Ctl = (function'), SRC.indexOf('const _cwTrial1Ctl = (function') + 60000);
        ok(/\]\)\.map\(_cwUnitText\);/.test(T1) && (T1.match(/aiBubble\(_cwUnitText\(/g) || []).length === 2, 'lesson 7: Trial 1\'s intro and both failure bubbles are served through _cwUnitText');
        ok((SRC.match(/textContent: 'My Plot'[\s\S]{0,260}?\.swml-mv-trigger/g) || []).length === 0, 'no "My Plot" button opens My VALUES any more (full-course bug)');
        ok(/textContent: _unitPlan \? 'My Story Spine' : 'My Plot'/.test(T1) && /_unitPlan \? '\.swml-ss-trigger' : '\.swml-mp-trigger'/.test(T1), 'lesson 7: in a unit the plan chip opens the Story Spine');
        ok(/_railAddFull\(mvTrigger\);/.test(SRC) && /_railAddFull\(mpTrigger\);/.test(SRC) && /_railAddFull\(rvTrigger\);/.test(SRC)
            && /const _railAddFull = \(btn\) => \{ if \(!_inUnit\) _railAdd\(btn\); \};/.test(SRC),
            'a unit lesson\'s rail never offers My Values, My Plot or Coming back to (they could only open empty)');
    }

    // ── F · wiring ──
    console.log(' F · the wiring, end to end');
    {
        const PHP = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');
        const APP = fs.readFileSync(path.join(ROOT, 'frontend/wml-app.js'), 'utf8');
        const SM = fs.readFileSync(path.join(ROOT, 'includes/class-session-manager.php'), 'utf8');
        const RT = fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8');
        ok(/'unit'\s*=>\s*'',/.test(PHP), 'the shortcode accepts unit=');
        ok(/'cwUnit'\s*=>\s*in_array\(\$atts\['unit'\], \['weekend'\], true\)/.test(PHP) && /'cwExamBoard'\s*=>\s*in_array\(\$atts\['unit'\], \['weekend'\], true\) \? \$board/.test(PHP),
            'embed config carries the whitelisted unit and the course\'s board (captured before the CW pin)');
        ok((APP.match(/state\.cwUnit\s*=\s*(embedConfig|cfg)\.cwUnit \|\| ''/g) || []).length === 2 && (APP.match(/state\.cwExamBoard\s*=\s*(embedConfig|cfg)\.cwExamBoard \|\| ''/g) || []).length === 2,
            'boot AND SPA reinit set both — and reset them, so a unit never leaks into a full-course lesson');
        ok((APP.match(/cw_unit: state\.cwUnit \|\| ''/g) || []).length === 2 && (APP.match(/cw_words_d1: WML\.cwWordTarget\('d1'\), cw_words_exam: WML\.cwWordTarget\('exam'\)/g) || []).length === 2,
            'both session-create calls send the unit and its RESOLVED word targets');
        ok(/'cw_unit'\s*=>\s*in_array\(\$params\['cw_unit'\] \?\? '', \['weekend'\], true\)/.test(SM), 'the session whitelists cw_unit');
        ok(/\(\$context\['cw_unit'\] \?\? ''\) === 'weekend'\) \$content \.= "\\n\\n" \. self::cw_weekend_unit_note\(\$context\)/.test(RT), 'the router appends the unit note AFTER the CW protocol (the last word)');
        const ni = RT.indexOf('public static function cw_weekend_unit_note');
        const note = RT.slice(ni, RT.indexOf('\n    }\n', ni));
        ok(/Story Spine/.test(note) && /Never name a lesson by a course step number/.test(note) && /cw_words_exam/.test(note), 'the note: spine instead of plot, no step numbers, the board\'s word targets');
        ok((SRC.match(/_cwTurnOwned\(state\.task, clean\) \? \{ suppressActions: true \} : undefined/g) || []).length === 2,
            'BOTH replay pipelines draw a walk-owned turn without chip detection (dual pipeline)');
        // v7.20.740 — lesson 6, the GUIDED Draft 1 (plan §4 step 3): Step 10 as a polishing lesson in a unit.
        ok(/'weekend' => \[ 'cw_step_10' => 'prose_style', 'cw_step_14' => 'trial_priority' \],/.test(RT)
            && /if \(isset\(\$cw_unit_polishing_lenses\[\$cw_unit\]\[\$task\]\)\)/.test(RT),
            'lesson 6: the router serves weekend Step 10 the polishing stack with the prose lens');
        ok(/if \(\$cw_unit === 'weekend'\) \$parts\[\] = self::cw_weekend_unit_note\(\$context\);/.test(RT),
            'lesson 6: the unit note rides the polishing branch too (it returns before the protocol map)');
        const di6 = SRC.indexOf("if (_unitDraft && stepDef.draft === 1) info = {");
        const d6 = SRC.slice(di6, SRC.indexOf('};', di6));
        ok(di6 > 0 && /tap <strong>Sophia<\/strong>/.test(d6) && /WML\.cwWordTarget\('d1'\)/.test(d6) && /lesson 5, Your Dramatic Situation/.test(d6)
            && !LEAK_RE.test(d6.replace(/<[^>]+>/g, ' ')),
            'lesson 6: the page names Sophia, states the board\'s Draft-1 target, and names no step, plot or stage');
        ok(/const CW_UNIT_DEP_SOURCE = \{ plot_outline: 'brief_outline' \}/.test(SRC) && /const key = _cwDepSource\(depKey\);/.test(SRC),
            'free-typed chat in a unit lesson is primed with the spine where the plot outline would have been');
    }

    // ── G · the island's default words are the prototype's ──
    console.log(' G · the island\'s default words are unchanged (root §13)');
    {
        const JSX = fs.readFileSync(path.join(ROOT, 'island/src/SceneSelection.jsx'), 'utf8');
        let OLD = '';
        try { OLD = cp.execSync('git show 21064bd4:island/src/SceneSelection.jsx', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) {}
        ok(OLD.length > 1000, 'the pre-change island source is readable from git (21064bd4)');
        const di = JSX.indexOf('const DEFAULT_LABELS = {');
        const D = new Function('return ' + braceSliceFrom(JSX, di, '{', '}').text + ';')();   // eslint-disable-line no-new-func
        const toJsx = (s) => s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        ['sub', 'stagesH2', 'stagesLead', 'hintTooMany', 'hintApart', 'status1None', 'beatsLead', 'summaryLead'].forEach((k) => {
            ok(OLD.indexOf(toJsx(D[k])) !== -1, 'default "' + k + '" is the prototype\'s string, verbatim', D[k].slice(0, 60));
        });
        ok(D.steps.every((s) => OLD.indexOf("'" + s + "'") !== -1), 'default stepper labels verbatim');
        ok(D.stageMeta({ beats: [1, 2, 3] }) === '3 beats written' && /\{st\.beats\.length\} beats written/.test(OLD), 'default card meta = "N beats written", as before');
        ok(toJsx(D.status1Some(2)) === '<strong>2 stages</strong> selected.' && toJsx(D.status2Some(1)).indexOf('<strong>1 beat</strong> in your run — one continuous stretch') === 0,
            'default footer statuses render as before');
        // v7.20.738 — the measured miss: the bridge passed `labels`, but mount() forwards props ONE BY ONE
        // and dropped it, so the real island showed "Pick your stage(s)" while every sim (stubbed island)
        // passed. Every key the bridge hands mount() must be forwarded to <SceneSelection>.
        const INDEX = fs.readFileSync(path.join(ROOT, 'island/src/index.jsx'), 'utf8');
        const mi = SRC.indexOf('window.WMLSceneIsland.mount({');
        const bridgeKeys = (braceSliceFrom(SRC, mi, '{', '}').text.match(/^\s{20}([a-zA-Z]+):/gm) || []).map((k) => k.trim().replace(':', ''));
        const si = INDEX.indexOf('<SceneSelection');
        const elem = INDEX.slice(si, INDEX.indexOf('/>', si));
        const dropped = bridgeKeys.filter((k) => k !== 'onClose' && elem.indexOf(k + '={opts.' + k) === -1);
        ok(bridgeKeys.indexOf('labels') !== -1 && dropped.length === 0, '⭐ mount() forwards every prop the bridge passes (labels included)', { bridgeKeys, dropped });
        const BUNDLE = fs.readFileSync(path.join(ROOT, 'frontend/wml-scene-island.min.js'), 'utf8');
        ok(BUNDLE.indexOf('hintApart') !== -1 && BUNDLE.indexOf('Which part of your story is the scene from?') !== -1,
            'the committed bundle is BUILT from this source (npm run build in island/)');
    }

    // ── I · the unit's chrome never names a course step (v7.20.746, measured on staging .745) ──
    console.log(' I · the sidebar speaks the unit\'s words');
    {
        const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
        // v7.20.747 (#781, PEDAGOGY §35): no student-facing string may claim examiners mark in hurdles.
        const hurdle = (SRC.match(/^[^\n]*'[^'\n]*(only when ALL|hurdle|unlock the next|pass this level|before you can move up)[^'\n]*'/gim) || []).filter((l) => !/^\s*\/\//.test(l));
        ok(!hurdle.length, '⭐ no student-facing copy says examiners mark in hurdles (§35)', hurdle.map((l) => l.trim().slice(0, 120)));
        ok((SRC.match(/'Lesson Progress'/g) || []).length === 2, '⭐ BOTH pipelines title a weekend lesson\'s sidebar "Lesson Progress", never "Step N Progress"');
        const ui = CORE.indexOf('const CW_UNIT_SIDEBAR_STEPS = {');
        const ublock = ui > 0 ? CORE.slice(ui, CORE.indexOf('};', ui)) : '';
        ok(ui > 0 && /Your Dramatic Situation/.test(ublock) && !/Outline|\bStep \d|\bplot\b|\bstages?\b/i.test(ublock.replace(/step: \d/g, '')), 'lesson 5\'s sidebar rows are the unit\'s own words (no "Review Outline")', ublock.slice(0, 200));
        ok(/cwInUnit\(\) && CW_UNIT_SIDEBAR_STEPS\[stepKey\]/.test(CORE), 'the exercise config picks the unit rows only inside a unit lesson');
        ok(/serveCard\(s\); \} \}; \}\), 'swml-chips-grid'\)/.test(SRC) && /\.swml-quick-actions\.swml-chips-grid\s*\{[^}]*flex-wrap: wrap/.test(fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8')), 'the 33 names wrap as a grid, not one tall column');
    }
    // ── J · lesson 8 "Polish Your Draft" (v7.20.748): the About is recomposed with the priority ──
    console.log(' J · lesson 8 shows the student\'s Mark Your Draft priority');
    {
        const jb = SRC.indexOf('// @CW-POLISH-PURE-BEGIN'), je = SRC.indexOf('// @CW-POLISH-PURE-END');
        ok(jb > 0 && je > jb, 'the polish composer is fenced for this harness');
        const PO = new Function(SRC.slice(jb, je) + '\nreturn { _cwPolishAboutState, _cwComposePolishAbout, _cwPolishAboutInner };')();   // eslint-disable-line no-new-func
        // the lineage copy, as measured on staging .747 (lesson 6's page)
        const COPY = '<div data-section-type="question" data-section-label="About This Draft" class="swml-section-block"><h2>Draft 1: Basic prose style</h2><p>Your scene from the last lesson is waiting…</p></div><div data-section-type="divider" data-section-label="YOUR WRITING"><p>YOUR WRITING</p></div><div data-section-type="response" data-section-label="Draft"><p>The shortcut ran past the asylum.</p></div>';
        ok(PO._cwPolishAboutState(COPY) === 'foreign', 'the lineage copy is recognised as another lesson\'s About');
        const pend = PO._cwComposePolishAbout(COPY, '');
        ok(PO._cwPolishAboutState(pend) === 'pending' && /Finish lesson 7, Mark Your Draft/.test(pend), 'no trial yet → lesson 8\'s About, saying where the priority comes from');
        const done = PO._cwComposePolishAbout(pend, 'Climax — the girl and the guard never meet; make them collide <now>');
        ok(PO._cwPolishAboutState(done) === 'ok' && /<strong>Your priority:<\/strong> Climax — the girl and the guard never meet; make them collide &lt;now&gt;/.test(done), '⭐ a later trial lands: the priority is written in, escaped');
        ok(/The shortcut ran past the asylum\./.test(done) && (done.match(/data-section-label="About This Draft"/g) || []).length === 1, 'the student\'s draft and every other section are untouched (one About, replaced in place)');
        ok(PO._cwComposePolishAbout(done, 'Hook — x') === PO._cwComposePolishAbout(done, 'Hook — x') && PO._cwPolishAboutState(done) === 'ok', 'once it has a priority the page is left alone (compose runs only for foreign/pending)');
        const inner = PO._cwPolishAboutInner('Hook — x');
        ok(!LEAK_RE.test(inner.replace(/lesson \d/g, '')) && /lesson 6, Write Draft 1/.test(inner), 'the page names lessons by the unit\'s own numbers, never a course step; true when the box is empty');
        ok(/state\.task === 'cw_step_14'\s*\n?\s*&& WML\.cwInUnit && WML\.cwInUnit\(\) && !state\.reviewMode/.test(SRC), 'the compose runs only in a weekend lesson 8, never in tutor review');
        ok(/WML\.resolveCanvasSuffix\('cw_trial_1', state\.phase\)/.test(SRC) && !/_cwTrial1Priority[\s\S]{0,900}seedFromSiblings/.test(SRC.slice(SRC.indexOf('async function _cwTrial1Priority'), SRC.indexOf('async function _cwTrial1Priority') + 1200)), '§5d: the trial is read under the ONE suffix builder it saved with, and the read never seeds');
    }
    // ── H · the dramatic-situation bank against Neil's source (v7.20.743, PEDAGOGY §55.1) ──
    console.log(' H · the 33 dramatic situations match our source, in plain, safe words');
    {
        const SRCMD = fs.readFileSync(path.join(ROOT, 'protocols/shared/creative-writing/_polti-33-source.md'), 'utf8');
        // the DETAIL headings ("| 3\\. CRIME PURSUED BY VENGEANCE. Elements: …") — the index table repeats #22 in #23's cell
        const heads = [];
        SRCMD.split('\n').forEach((l) => { const m = /^\|\s*(\d+)\\?\.\s+([A-Z][A-Z' ,\-]+?)[.:]?\s*(?:\(|Elements|\|)/.exec(l); if (m && !heads.some((h) => h.n === +m[1])) heads.push({ n: +m[1], name: m[2].trim() }); });   // UPPER-CASE = the detail headings
        const B = POLTI.CW_POLTI_33;
        const norm = (t) => String(t).toLowerCase().replace(/[^a-z]+/g, ' ').trim();
        ok(heads.length === 33, 'the source file yields 33 detail headings', heads.length);
        ok(B.length === 33 && B.every((p, i) => p.id === i + 1), 'the bank has 33 entries, ids 1–33 in order', B.length);
        const mism = B.filter((p) => { const h = heads.find((x) => x.n === p.id); return !h || norm(h.name) !== norm(p.src); });
        ok(!mism.length, '⭐ every entry\'s `src` is the source\'s own heading for that number (our order, our list)', mism.map((p) => p.id + ':' + p.src));
        const text = (p) => [p.name, p.what, p.roles.join(' '), p.eg].join(' ');
        const ARCHAIC = /\b(kinsm[ae]n|kindred|brigandage|alienist|suitors?|imprudence|imprudent|supplication|enigma|abductor|spoliation|despoiled|expiation)\b/i;
        const UNSAFE = /\b(adulter\w*|seduc\w*|sex\w*|rape\w*|lovers?|affair|unfaithful|mistress|incest\w*|pregnan\w*|naked|dishono(u)?r(ed)? (a|of) (wife|woman|daughter))\b/i;
        ok(!B.filter((p) => ARCHAIC.test(text(p))).length, 'no 1916 wording reaches a student (root §5c-ii)', B.filter((p) => ARCHAIC.test(text(p))).map((p) => p.id + ':' + (text(p).match(ARCHAIC) || [])[0]));
        ok(!B.filter((p) => UNSAFE.test(text(p))).length, '⭐ nothing sexual (N566)', B.filter((p) => UNSAFE.test(text(p))).map((p) => p.id));
        ok(B.every((p) => p.what.length <= 160 && p.eg.length <= 160), 'every line is short enough to read in one go (≤160 chars)', B.filter((p) => p.what.length > 160 || p.eg.length > 160).map((p) => p.id));
        ok(B.every((p) => p.roles.length >= 2 && p.roles.length <= 4), 'every situation names 2–4 roles');
        ok(new Set(B.map((p) => p.name)).size === 33, 'every plain name is unique (a chip label must point at one situation)');
        ok(B.every((p) => !/["“”]/.test(p.eg)), 'no quotation in an example (root §5c-i: quote only what is verified)');
        const SET = /Macbeth|An Inspector Calls|A Christmas Carol|Romeo and Juliet|Jekyll and Hyde|Animal Farm|Blood Brothers/;
        const nSet = B.filter((p) => SET.test(p.eg)).length;
        ok(nSet >= 12, 'the examples lean on the texts our students sit (root §5c-i weighting)', nSet);
        // the marker validator, as a unit
        const P = POLTI._poltiParsePicks;
        ok(P('@POLTI_PICKS{"picks":[{"id":9,"beat":3,"roles":["Leader: Mia"]}]}', [1, 2, 3]).length === 1, 'a well-formed marker parses');
        ok(P('@POLTI\\_PICKS{"picks":[{"id":9,"beat":3}]}', [3]).length === 1, 'the model\'s escaped underscore still parses');
        ok(P('@POLTI_PICKS{"picks":[{"id":9,"beat":3},{"id":9,"beat":3},{"id":1,"beat":3},{"id":2,"beat":3},{"id":3,"beat":3}]}', [3]).length === 3, 'duplicates drop; at most three');
        ok(P('@POLTI_PICKS{"picks":[{"id":40,"beat":1},{"id":4,"beat":5}]}', [1, 2]).length === 0, 'an id outside our 33, or a beat the student never wrote, is refused');
        ok(P('@POLTI_PICKS{"picks":[', [1]).length === 0 && P('', [1]).length === 0 && P(null, [1]).length === 0, 'broken or missing markers give nothing (and never throw)');
    }
    // ── K · v7.20.751: the word-count pill in a weekend DRAFT lesson counts to the length the page prints.
    // Measured on staging .748 (lesson 8, Cambridge): "94 / 650" while the unit's target is 350–450.
    console.log('\nK · the word-count pill in lessons 6 + 8 counts to the board\'s length, not the essay model\'s 650');
    {
        const ki = SRC.indexOf('function _cwUnitDraftWordTargets()');
        ok(ki > 0, 'the unit-draft word-target helper exists');
        const body = braceSliceFrom(SRC, ki, '{', '}').text;
        const run = (inUnit, def, d1) => new Function('WML', 'state', 'return (function () ' + body + ')();')(   // eslint-disable-line no-new-func
            { cwInUnit: () => inUnit, getCwStepDef: () => def, cwStepEnv: (d) => (inUnit && d.unitEnv) || d.env || '', cwWordTarget: () => d1 }, { task: 'cw_step_x' });
        const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        ok(eq(run(true, { draft: 1, unitEnv: 'polishing' }, '350–450'), { min: 350, target: 450, ideal: 450 }), 'lesson 6, Cambridge: 350 minimum, counts to 450', run(true, { draft: 1, unitEnv: 'polishing' }, '350–450'));
        ok(eq(run(true, { draft: 2, env: 'polishing' }, '450–600'), { min: 450, target: 600, ideal: 600 }), 'lesson 8, Eduqas (or AQA\'s Draft-1 ladder): counts to 600');
        ok(run(false, { draft: 1, env: 'polishing' }, '450–600') === null, 'the full course is untouched (its essay-model target stands)');
        ok(run(true, { step: 9 }, '350–450') === null, 'a unit lesson that is not a draft (lesson 5) is untouched');
        ok(run(true, { draft: 1, unitEnv: 'polishing' }, '') === null, 'no printed length → no override (never a made-up number)');
        const pi = SRC.indexOf('function _paintWcWidgetLabel(editor)');
        const paint = pi > 0 ? braceSliceFrom(SRC, pi, '{', '}').text : '';
        ok(/const _cwT = _cwUnitDraftWordTargets\(\);/.test(paint) && /canvasWordTarget = _cwT\.target/.test(paint) && paint.indexOf('_cwUnitDraftWordTargets') < paint.indexOf('widget.textContent = `${wc} / ${canvasWordTarget}`'),
            'the pill\'s ONE painter applies it before it writes "N / target" (and before the colour ladder reads it)');
        ok(run(true, { words: 'exam' }, '650–700') !== null && eq(run(true, { words: 'exam' }, '650–700'), { min: 650, target: 700, ideal: 700 }), 'lesson 9 names its own length (`words: \'exam\'`) and the pill counts to it');
    }
    // ── L · weekend lesson 9, "Adapt It to the Question" (v7.20.753, WEEKEND-STORY-PLAN §2 + §2c) ──
    console.log('\nL · lesson 9: the board\'s real questions one at a time, one rewrite, ONE judgement turn');
    {
        const lb = SRC.indexOf('// @CW-ADAPT-PURE-BEGIN'), le = SRC.indexOf('// @CW-ADAPT-PURE-END');
        ok(lb > 0 && le > lb, 'the lesson-9 helpers are fenced for this harness');
        const AD = new Function(SRC.slice(lb, le) + '\nreturn { CW_ADAPT_STEP, CW_ADAPT_SHAPES, CW_ADAPT_ORDER, CW_ADAPT_MIN_DRILLS, CW_ADAPT_MAX_DRILLS, CW_ADAPT_TIME, _cwAdaptPromptText, _cwAdaptSittingLabel, _cwAdaptDrills, _cwAdaptParseCheck };')();   // eslint-disable-line no-new-func
        const PHP = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');
        const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
        const APP = fs.readFileSync(path.join(ROOT, 'frontend/wml-app.js'), 'utf8');
        const ROUTER = fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8');
        const PROTO = fs.readFileSync(path.join(ROOT, 'protocols/shared/creative-writing/CW-STEP-90-adapt-to-the-question.md'), 'utf8');
        const BANK = JSON.parse(fs.readFileSync(path.join(ROOT, 'protocols/shared/creative-writing/_adapt-prompts.json'), 'utf8'));
        const SH = AD.CW_ADAPT_SHAPES;
        const INSIDER = /\b(protocol|module|component|payload|marker|bank|the system|the platform)\b/i;   // root §5c-ii

        // L1 · the shapes — every shape a board sets is taught, and the PHP ships exactly those
        const shapes = Object.keys(SH);
        ok(AD.CW_ADAPT_STEP === 90 && /\{ step: 90, label: 'Adapt It to the Question', tier: 'si', phase: 'unit', unitOnly: 'weekend', words: 'exam' \}/.test(CORE), 'step 90 is a unit-only step (90+ reserved), written to the exam length');
        ok(JSON.stringify(shapes.slice().sort()) === JSON.stringify(AD.CW_ADAPT_ORDER.slice().sort()), 'the drill order covers exactly the taught shapes', { shapes, order: AD.CW_ADAPT_ORDER });
        ok(shapes.every((k) => SH[k].name && SH[k].rule && SH[k].ask && SH[k].example && Array.isArray(SH[k].more) && SH[k].more.length >= 1), 'every shape carries its rule, its ask, a worked example and one more (§4c.2, §4c.9)');
        const phpShapes = ((/\$text_shapes = \[([^\]]*)\]/.exec(PHP) || [])[1] || '').match(/'[^']+'/g) || [];
        ok(JSON.stringify(phpShapes.map((s) => s.slice(1, -1)).sort()) === JSON.stringify(AD.CW_ADAPT_ORDER.slice().sort()), '§5d: the PHP ships exactly the shapes the page can teach (one list, two languages)', phpShapes);
        ok(BANK.every((p) => SH[p.shape] || /picture/.test(p.shape)), 'every bank question is a taught shape or a picture question (v1 is text only)', BANK.filter((p) => !SH[p.shape] && !/picture/.test(p.shape)).map((p) => p.shape));
        const STUDENT_TEXT = shapes.map((k) => [SH[k].name, SH[k].rule, SH[k].ask, SH[k].example].concat(SH[k].more).join(' ')).join(' ');
        ok(!LEAK_RE.test(STUDENT_TEXT), 'no course step, plot or stage in anything a lesson-9 student reads', (STUDENT_TEXT.match(new RegExp('.{0,40}(' + LEAK_RE.source + ').{0,40}', 'i')) || [])[0]);
        ok(!INSIDER.test(STUDENT_TEXT), 'no insider words (root §5c-ii)', (STUDENT_TEXT.match(new RegExp('.{0,30}' + INSIDER.source + '.{0,30}', 'i')) || [])[0]);
        ok(shapes.every((k) => /Scrooge/.test(SH[k].example)), 'every reveal makes the move on Scrooge\'s story (the spine the unit taught in lesson 4)');
        ok(!shapes.some((k) => PROTO.indexOf(SH[k].example.slice(0, 40)) !== -1 || PROTO.indexOf(SH[k].rule.slice(0, 40)) !== -1),
            '§5 retained-source law: none of the code-served teaching sits in the protocol the model reads');

        // L2 · the board table — the REAL PHP mapper, run for every board the course emits (root §5d)
        const pi = PHP.indexOf('public static function cw_adapt_prompts_for_board($board) {');
        ok(pi > 0, 'the PHP mapper exists');
        const PHPFN = PHP.slice(pi, braceSliceFrom(PHP, pi, '{', '}').end);
        const tmp = path.join(require('os').tmpdir(), 'wml-adapt-' + process.pid + '.php');
        fs.writeFileSync(tmp, "<?php\ndefine('SWML_PROTOCOLS_PATH', " + JSON.stringify(path.join(ROOT, 'protocols') + '/') + ");\nclass X {\n" + PHPFN
            + "\n}\n$o = [];\nforeach (json_decode($argv[1], true) as $b) $o[$b] = X::cw_adapt_prompts_for_board($b);\necho json_encode($o);\n");
        const BOARDS = ['aqa', 'edexcel', 'eduqas', 'edexcel-igcse', 'edexcel_igcse', 'cambridge-igcse', 'ccea', 'ocr', 'sqa', ''];
        let MAP = {};
        try { MAP = JSON.parse(cp.execFileSync('php', [tmp, JSON.stringify(BOARDS)], { encoding: 'utf8' })); }
        catch (e) { ok(false, 'the PHP mapper ran', String(e && e.message).slice(0, 300)); }
        finally { try { fs.unlinkSync(tmp); } catch (e) { /* gone */ } }
        const want = { aqa: 'AQA', edexcel: 'Edexcel GCSE', eduqas: 'Eduqas', 'edexcel-igcse': 'Edexcel IGCSE', edexcel_igcse: 'Edexcel IGCSE', 'cambridge-igcse': 'Cambridge' };
        Object.keys(want).forEach((b) => {
            const out = MAP[b] || [];
            ok(out.length >= AD.CW_ADAPT_MIN_DRILLS && out.every((p) => p.board === want[b] && !p.fallback), b + ' → only ' + want[b] + '\'s own questions', out.map((p) => p.board + (p.fallback ? '*' : '')));
            const dr = AD._cwAdaptDrills(out);
            ok(dr.length >= AD.CW_ADAPT_MIN_DRILLS && dr.length <= AD.CW_ADAPT_MAX_DRILLS && dr.every((d, i) => d.fid === 'cw-adapt-drill-' + (i + 1) && d.text && SH[d.shape]), b + ': 3–4 drills, each a real question with its own row', dr.map((d) => d.shape));
        });
        ['ccea', 'ocr', 'sqa', ''].forEach((b) => {
            const out = MAP[b] || [];
            ok(out.length > 0 && out.every((p) => p.fallback && (p.board === 'Eduqas' || p.board === 'Edexcel GCSE')), (b || '(none)') + ' → other boards\' real questions, each flagged so the page says so', out.map((p) => p.board + (p.fallback ? '*' : '')).slice(0, 4));
        });
        ok(Object.values(MAP).every((list) => list.every((p) => JSON.stringify(Object.keys(p).filter((k) => k !== 'fallback').sort()) === '["board","prompt","shape","sitting"]')), 'only what the page needs ships: no source paths, no context, no marks');
        ok(!JSON.stringify(BANK).includes('/Users/') && BANK.every((p) => fs.existsSync(path.join(ROOT, '../../..', String(p.source).split(' | ')[0]))), 'the bank names its sources relative to the walkthrough folder (no local path ships), and every one is on the drive');
        const eg = AD._cwAdaptDrills(MAP['edexcel'] || []);
        ok(eg.length === 3 && eg.every((d) => d.shape === 'time-when') && eg.filter((d) => d.hasImages).length <= 1, 'Edexcel GCSE (always "a time when") still gets three real questions, picture-free first');

        // L3 · the pure helpers
        const pt = AD._cwAdaptPromptText({ prompt: 'Look at the images provided. Write about a time when you were lost. You may wish to base your response on one of the images.' });
        ok(pt.hasImages && pt.text === 'Write about a time when you were lost.', 'a pictured question keeps its exact words; only the sentences ABOUT the pictures come off', pt);
        ok(AD._cwAdaptSittingLabel('2026 sample assessment materials (new specification, first exam June 2026)') === 'sample paper for exams from 2026' && AD._cwAdaptSittingLabel('June 2024') === 'June 2024', 'the AQA sample paper is named in plain words; a real sitting is left as printed');
        const P = AD._cwAdaptParseCheck;
        ok(JSON.stringify(P('It does.\n@ADAPT_CHECK{"focus":"yes","where":"the gate","fix":""}')) === '{"focus":"yes","where":"the gate","fix":""}', 'a well-formed verdict parses');
        ok(P('@ADAPT\\_CHECK{"focus":"Partly","where":"x","fix":"y"}').focus === 'partly', 'an escaped underscore and a capital still parse');
        ok(P('@ADAPT_CHECK{"focus":"no","where":"the {odd} brace","fix":"move it"}').where === 'the {odd} brace', 'a brace inside a quoted value does not end the object');
        ok(P('@ADAPT_CHECK{"focus":"maybe","where":"","fix":""}') === null && P('@ADAPT_CHECK{"focus":"yes"') === null && P('no marker') === null && P(null) === null, 'an unknown verdict, a cut-off marker or none at all → null (and never throws)');
        ok(P('@ADAPT_CHECK{"focus":"yes","where":"' + 'x'.repeat(500) + '","fix":""}').where.length === 300, 'model text is clipped before it reaches the document');

        // L4 · the wiring — every link of the chain, named (root §15)
        ok(/'cw_step_90' => 'CW-STEP-90-adapt-to-the-question\.md'/.test(ROUTER) && /'cw_step_90' => 'Adapt It to the Question'/.test(ROUTER), 'the router loads the lesson\'s protocol and names it');
        ok(/if \(\$task === 'cw_step_90' && \$embed_config\['cwUnit'\] !== ''\) \{\s*\$embed_config\['cwAdaptPrompts'\] = self::cw_adapt_prompts_for_board\(\$board\);/.test(PHP), 'the page config carries the board\'s questions, for lesson 9 in a unit only');
        ok((APP.match(/state\.cwAdaptPrompts = Array\.isArray\((embedConfig|cfg)\.cwAdaptPrompts\)/g) || []).length === 2, 'both boot paths put them on state');
        const MARK = '@ADAPT_CHECK{"focus":"yes|partly|no","where":"<the place in their story, a few words>","fix":"<one sentence, empty if yes>"}';
        ok(PROTO.indexOf(MARK) !== -1 && SRC.indexOf(MARK) !== -1, '§5d: the marker the page asks for is the marker the protocol teaches, byte for byte');
        ok(/text = text\.replace\(\/@ADAPT\\\\\?_CHECK\[\\s\\S\]\*\$\/, ''\)/.test(CORE), 'the marker never reaches the screen (stripAIInternals)');
        ok(['cw-adapt-chosen', 'cw-adapt-check', 'cw-adapt-fix'].every((f) => SRC.indexOf("'" + f + "')") !== -1 || SRC.indexOf("'" + f + "'") !== -1)
            && /outlineRowHTML\(\{ id: 'chosen'[^}]*locked: true \}, 'cw-adapt-chosen'\)/.test(SRC) && /outlineRowHTML\(\{ id: 'check'[^}]*locked: true \}, 'cw-adapt-check'\)/.test(SRC) && /outlineRowHTML\(\{ id: 'fix'[^}]*locked: true \}, 'cw-adapt-fix'\)/.test(SRC)
            && /const CHOSEN = 'cw-adapt-chosen', CHECK = 'cw-adapt-check', FIX = 'cw-adapt-fix';/.test(SRC), '§5d: the rows the walk files are the rows the page draws (and the student cannot type over them)');
        ok(/sectionHTML\('response', 'Your Rewrite', true, null, '<p><\/p>', \{ 'student-composition': 'true' \}\)/.test(SRC) && /n\.attrs\.label === 'Your Rewrite'/.test(SRC) && /\[data-section-label="Your Rewrite"\]/.test(SRC), 'the rewrite box the walk reads is the one the page draws (by its label)');
        ok(/for \(const key of \['draft_2', 'draft_1'\]\)/.test(SRC) && /10: 'draft_1', 14: 'draft_2'/.test(CORE), '§5d: the rewrite starts from the draft lesson 8 (step 14 → draft_2) or lesson 6 (step 10 → draft_1) saved');
        const SITES = [
            /\} else if \(state\.task === 'cw_step_90'\) \{[\s\S]{0,400}_cwAdaptCtl\.reset\(\); _cwAdaptCtl\.start\(\);/,          // chat-clear
            /if \(state\.task === 'cw_step_90' && _cwAdaptCtl\.active && _inboundIsAnswer\)/,                                       // owns the turn
            /registerCwWalkCtls\(\[[^\]]*_cwAdaptCtl\]\)/,                                                                          // reset on clear
            /window\.__swmlCwAdaptCtl = _cwAdaptCtl;/, /_cwAdaptCtl\.onReply\(reply\);/, /: t === 'cw_step_90' \? _cwAdaptCtl/,   // twin handle · reply · start-miss net
            /cwAdaptCtl: _cwAdaptCtl,/, /state\.task === 'cw_step_90' && tp\.cwAdaptCtl\) tp\.cwAdaptCtl\.tryResume\(\)/,          // export · boot resume
            /state\.task === 'cw_step_90' && !state\.reviewMode && tp\.cwAdaptCtl\) \{[\s\S]{0,400}tp\.cwAdaptCtl\.start\(\);/,     // fresh entry
            /state\.task === 'cw_step_90' && window\.__swmlCwAdaptCtl\) \{[\s\S]{0,400}__swmlCwAdaptCtl\.start\(\)/,                // twin chat-clear
            /state\.task === 'cw_step_90' && !state\.reviewMode && window\.__swmlCwAdaptCtl\) \{[\s\S]{0,400}__swmlCwAdaptCtl\.start\(\);/,   // twin greeting
        ];
        ok(SITES.every((re) => re.test(SRC)), 'the walk is wired at every entry: fresh, resume, clear, reply, start-miss — on BOTH chat pipelines', SITES.filter((re) => !re.test(SRC)).map(String));
        ok((SRC.match(/cw_step_90: _cwAdaptCtl,/g) || []).length === 3, 'the nudge, probe and revive maps all know the walk');
        ok(/90: \['plot_outline'\]/.test(SRC), '"ask Sophia" sees the student\'s plan (the Story Spine, in a unit)');

        // L5 · the walk, driven like a student (AQA)
        const CTL = sliceController('const _cwAdaptCtl = (function');
        const HOLD = { w: null, rewrite: '' };
        const OWN = {};
        function adaptWorld(board, prompts, o) {
            o = o || {};
            const fids = [1, 2, 3, 4].map((n) => 'cw-adapt-drill-' + n).concat(['cw-adapt-chosen', 'cw-adapt-check', 'cw-adapt-fix']);
            const w = makeWorld(CTL, {
                task: 'cw_step_90', fids, ok, ls: o.ls, history: o.history, prefill: o.prefill,
                extraDeps: {
                    CW_ADAPT_STEP: AD.CW_ADAPT_STEP, CW_ADAPT_SHAPES: SH, CW_ADAPT_TIME: AD.CW_ADAPT_TIME,
                    _cwAdaptDrills: AD._cwAdaptDrills, _cwAdaptParseCheck: AD._cwAdaptParseCheck,
                    _CW_TURN_OWNERS: OWN,
                    // the page's editor: the rows, and the rewrite box as a section of paragraphs
                    canvasEditor: { state: { doc: { descendants(fn) {
                        for (const [f, t] of (HOLD.w ? HOLD.w.rows : new Map())) if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f }, textContent: t }, 0) === false) return;
                        fn({ type: { name: 'sectionBlock' }, attrs: { label: 'Your Rewrite' }, forEach(cb) { HOLD.rewrite.split('\n\n').forEach((p) => cb({ textContent: p })); } }, 0);
                    } } } },
                },
            });
            HOLD.w = w;
            w.deps.WML.cwInUnit = () => o.unit !== false;
            w.deps.state.cwExamBoard = board;
            w.deps.state.cwAdaptPrompts = prompts;
            return w;
        }
        const stored = (w) => (w.deps.canvasChatHistory || []);
        const tapIf = (w, c) => { if (c) w.tap(c); return !!c; };   // a missing chip FAILS an assertion; it never crashes the rest
        const last = (w) => w.bubbles[w.bubbles.length - 1] || '';
        const AQA = MAP.aqa || [];
        const DR = AD._cwAdaptDrills(AQA);
        HOLD.rewrite = '';
        const w = adaptWorld('aqa', AQA, { ls: new Map(), history: [] });
        ok(w.ctl.atStart(), 'before it starts, the start-miss net may start it (atStart is true)');
        w.ctl.start();
        const orient = w.bubbles.join('\n');
        ok(/last lesson of the weekend story/.test(orient) && w.chips().some((c) => /Continue/.test(c.textContent)), 'the orientation is paced: one chunk, then Continue (§4b)', w.bubbles);
        ok(w.toAsk(), '⭐ tapping Continue reaches the first question (liveness)');
        const allOrient = w.bubbles.join('\n');
        ok(/For AQA, from 2026, a story that does not answer the question is held to a lower mark/.test(allOrient), 'an AQA student is told the 2026 focus rule (verified: 8700/1 SMS 2026, lines 860–861)');
        ok(last(w).indexOf('[SWML_BEAT:') === 0 && last(w).indexOf('> ' + DR[0].text) !== -1 && last(w).indexOf(SH[DR[0].shape].rule) !== -1, 'question 1: its progress chip, the exact words, then the rule for that kind of question', last(w).slice(0, 300));
        ok(/AQA, sample paper for exams from 2026|AQA, (June|November) \d{4}/.test(last(w)), 'the source is named in plain words', (last(w).match(/\*\(([^)]*)\)\*/) || [])[1]);
        ok(w.helpChipNamed(/See an example/) && w.helpChipNamed(/Still stuck/), 'the help ladder is there, Sophia last (§4c.9)');
        const nb = w.bubbles.length;
        tapIf(w, w.helpChipNamed(/See an example/));
        ok(w.bubbles.length === nb + 1 && last(w).indexOf('**Here is the move on another story:**') === 0 && last(w).indexOf(SH[DR[0].shape].more[0]) !== -1 && w.live(), 'rung 1 serves another worked example and keeps the question live (no API)');
        ok(w.sends.length === 0, 'no API call yet');
        for (let i = 0; i < DR.length; i++) {
            const line = 'My line for question ' + (i + 1) + ': the fox at the gate.';
            w.say(line);
            ok(w.rows.get(DR[i].fid) === line, 'question ' + (i + 1) + '\'s line is filed, verbatim, into ITS row', w.rows.get(DR[i].fid));
            ok(last(w).indexOf('**Your line is in your document.**') === 0 && last(w).indexOf(SH[DR[i].shape].example) !== -1, 'the reveal: the same move on Scrooge\'s story', last(w).slice(0, 120));
            const nx = w.chips().filter((c) => /Next question|Choose my question/.test(c.textContent))[0];
            ok(!!nx && (i < DR.length - 1 ? /Next question/ : /Choose my question/).test(nx.textContent), 'one chip moves on: ' + (i < DR.length - 1 ? 'Next question' : 'Choose my question'), w.chips().map((c) => c.textContent));
            tapIf(w, nx);
        }
        ok(last(w).indexOf('**Now choose ONE question to rewrite your scene for.**') === 0 && w.chips().length === DR.length && w.chips().every((c, i) => c.textContent.indexOf('Question ' + (i + 1) + ': ') === 0), 'the choice is ONE screen of alternatives (§4c.8)', w.chips().map((c) => c.textContent));
        tapIf(w, w.chips()[1]);
        ok(w.rows.get('cw-adapt-chosen') === DR[1].text, 'the chosen question\'s exact words go into its locked row', w.rows.get('cw-adapt-chosen'));
        const writeAsk = w.bubbles[w.bubbles.length - 2] || '';
        ok(writeAsk.indexOf('**Your question:**') === 0 && writeAsk.indexOf('> ' + DR[1].text) !== -1 && /about 45 minutes/.test(writeAsk), 'the rewrite ask: the question, its rule and AQA\'s 45 minutes', writeAsk.slice(0, 200));
        ok(/box is empty, because no draft reached this page/.test(last(w)) && !stored(w).some((m) => /box is empty/.test(m.content || '')), '⭐ §4c.7: "the box is empty" is drawn, never stored (it stops being true the moment they write)');
        ok(!!w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0] && w.helpChipNamed(/Still stuck/), 'Check my rewrite, with the help ladder (§4c.9 — every ask)');
        tapIf(w, w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0]);
        ok(w.sends.length === 0 && /nothing to check yet/.test(last(w)) && !!w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0], 'an empty box is never sent to Sophia, and the button comes back');
        const typed = 'The fox came out of the hedge and I froze. That was the day I met it.';
        w.say(typed);
        ok(stored(w).some((m) => m.role === 'user' && m.content === typed) && /goes in the \*\*Your Rewrite\*\* box/.test(last(w)) && w.sends.length === 0 && w.rows.get('cw-adapt-check') === '',
            '⭐ a scene typed into the chat is KEPT on screen and they are told where it goes (never "I haven\'t asked")');
        HOLD.rewrite = 'The fox came out of the hedge.\n\nI froze, and so did it.';
        tapIf(w, w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0]);
        ok(w.sends.length === 1 && w.sends[0].id === 'cw90-check', '⭐ ONE judgement call, armed as the check', w.sends);
        const hid = stored(w).filter((m) => m.hidden && /^\[ADAPT CHECK/.test(m.content)).pop();
        ok(!!hid && hid.content.indexOf('THE QUESTION: ' + DR[1].text) !== -1 && hid.content.indexOf('THEIR REWRITE:\nThe fox came out of the hedge.\n\nI froze, and so did it.') !== -1, 'Sophia gets the exact question and the rewrite, paragraphs intact', hid && hid.content.slice(-200));
        ok(hid && /This student sits AQA/.test(hid.content) && hid.content.indexOf(MARK) !== -1, 'the AQA rule and the marker contract ride with it');
        w.resolveApi('Lovely writing!');
        ok(/could not finish checking/.test(last(w)) && !!w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0] && w.rows.get('cw-adapt-check') === '' && !stored(w).some((m) => /could not finish checking/.test(m.content || '')),
            '⭐ fail-open (§4d): no usable verdict → nothing filed, Try again on screen, the apology not stored');
        tapIf(w, w.chips().filter((c) => /Check my rewrite/.test(c.textContent))[0]);
        ok(w.sends.length === 2, 'the student may ask again after a failed check');
        w.resolveApi('You have the fox, but the meeting is not yet the centre.\n@ADAPT_CHECK{"focus":"partly","where":"the hedge","fix":"Make the moment the fox looks at you the turning point."}');
        ok(/^Partly\. .*\(the hedge\)$/.test(w.rows.get('cw-adapt-check')) && w.rows.get('cw-adapt-fix') === 'Make the moment the fox looks at you the turning point.', 'the verdict and the one change are filed into the document', [w.rows.get('cw-adapt-check'), w.rows.get('cw-adapt-fix')]);
        ok(/That is the whole weekend story/.test(last(w)) && /make the change in your rewrite: \*Make the moment the fox looks at you/.test(last(w)) && /sim endpoint/.test(last(w)), 'the wrap names the change still to make and ends on the shared endpoint', last(w).slice(0, 200));
        ok(!stored(w).some((m) => /That is the whole weekend story/.test(m.content || '')) && !!w.chips().filter((c) => /Look at a question again/.test(c.textContent))[0], 'the wrap is drawn, not stored, and keeps a way back in (v7.20.340)');
        tapIf(w, w.chips().filter((c) => /Look at a question again/.test(c.textContent))[0]);
        tapIf(w, w.chips()[0]);
        ok(last(w).indexOf('> ' + DR[0].text) !== -1 && w.live(), 'recall re-asks question 1');
        w.say('A sharper line.');
        ok(w.rows.get(DR[0].fid) === 'A sharper line.', 'a recalled line REPLACES the old one (§4c.6 rewrite)', w.rows.get(DR[0].fid));
        const back = w.chips().filter((c) => /Back to the end/.test(c.textContent))[0];
        ok(!!back, 'after the check, a recalled question leads back to the end', w.chips().map((c) => c.textContent));
        tapIf(w, back);
        ok(w.sends.length === 2 && /That is the whole weekend story/.test(last(w)), '⭐ ...and never to a second check (ONE per lesson)', w.sends.length);
        const assistant = stored(w).filter((m) => m.role === 'assistant' && !m.hidden).map((m) => m.content);
        ok(assistant.length > 5 && assistant.every((t) => OWN.cw_step_90 && OWN.cw_step_90(t)), '⭐ every turn the walk stores is one owns() claims — the replay draws them as the walk did (#511)', assistant.filter((t) => !(OWN.cw_step_90 && OWN.cw_step_90(t))).map((t) => t.slice(0, 60)));
        ok(!OWN.cw_step_90('Here is what I think about your story.'), '...and a reply from Sophia is not claimed');
        const seen = w.bubbles.join('\n');
        ok(!LEAK_RE.test(seen.replace(/\(sim endpoint\)|That’s this step done\./g, '')) && !INSIDER.test(seen), 'nothing on screen names a course step, a plot, a stage or our machinery', (seen.match(new RegExp('.{0,40}(' + LEAK_RE.source + '|' + INSIDER.source + ').{0,40}', 'i')) || [])[0]);

        // L6 · resume: the document is the position — even with no walk state in this browser
        HOLD.rewrite = 'x';
        const r1 = adaptWorld('aqa', AQA, { ls: new Map(), history: stored(w).slice(), prefill: Object.fromEntries(Array.from(w.rows.entries())) });
        const before = stored(r1).length;
        ok(r1.ctl.tryResume() === false && /That is the whole weekend story/.test(last(r1)) && stored(r1).length === before && r1.sends.length === 0, 'a finished lesson re-opened elsewhere: the wrap, drawn, nothing stored, nothing sent');
        const r2 = adaptWorld('aqa', AQA, { ls: new Map(), history: [], prefill: { [DR[0].fid]: 'Line one.' } });
        ok(r2.ctl.tryResume() === true && last(r2).indexOf('> ' + DR[1].text) !== -1 && r2.live() && stored(r2).length === 0, 'mid-walk with no saved state: it lands on question 2, live, and stores nothing new', last(r2).slice(0, 160));
        const pre3 = { 'cw-adapt-chosen': DR[2].text };
        DR.forEach((d) => { pre3[d.fid] = 'line'; });
        const h3 = [{ role: 'user', hidden: true, content: '[ADAPT CHECK — …]' }, { role: 'assistant', content: 'Yes, it does.\n@ADAPT_CHECK{"focus":"yes","where":"the ending","fix":""}' }];
        const r3 = adaptWorld('aqa', AQA, { ls: new Map(), history: h3, prefill: pre3 });
        ok(r3.ctl.tryResume() === false && /^Yes\. /.test(r3.rows.get('cw-adapt-check')) && r3.sends.length === 0, '⭐ a verdict that reached the transcript but not the document is recovered, never bought twice', r3.rows.get('cw-adapt-check'));

        // L7 · the stops and the fallback
        const s1 = adaptWorld('aqa', AQA, { ls: new Map(), history: [], unit: false });
        s1.ctl.start();
        ok(/belongs to the Weekend Story/.test(last(s1)) && stored(s1).length === 0 && !s1.ctl.atStart(), 'opened outside the weekend unit: it says so, stores nothing, and the start-miss net leaves it alone');
        const s2 = adaptWorld('aqa', [], { ls: new Map(), history: [] });
        s2.ctl.start();
        ok(/No exam questions have reached this page/.test(last(s2)) && stored(s2).length === 0, 'no questions reached the page: it says so plainly, and stores nothing');
        const fb = adaptWorld('ccea', MAP.ccea || [], { ls: new Map(), history: [] });
        fb.ctl.start();
        fb.toAsk();
        ok(/real story questions from past papers/.test(fb.bubbles.join('\n')) && !/your exam board’s past papers/.test(fb.bubbles.join('\n')) && !/For AQA/.test(fb.bubbles.join('\n')), 'a CCEA student is told the questions come from past papers (not "your board\'s"), and no AQA rule');
    }
    console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    if (fail) { console.error('❌ weekend-story-harness FAILED'); process.exit(1); }
    console.log('✅ weekend-story-harness passed (lesson 5 offers the six spine beats; the full course is untouched).');
})().catch((e) => { console.error('❌ weekend-story-harness crashed:', e && e.stack || e); process.exit(1); });
