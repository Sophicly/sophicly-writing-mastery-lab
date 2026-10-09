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
            // v7.20.775: lesson 5 also reads lesson 3's document ('logline') for the exam-scene beat
            _cwLoadDocValues: (pid, key) => Promise.resolve(key === 'brief_outline' && store.brief_outline ? store.brief_outline
                : (key === 'logline' && store.logline ? store.logline : {})),
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
    // v7.20.775: lesson 5 reads the exam-scene beat through core's one parser, as the real page does
    w.deps.WML.CW_SCENE_FOCUS_FID = WMLC.CW_SCENE_FOCUS_FID; w.deps.WML.cwSceneFocusBeat = WMLC.cwSceneFocusBeat;
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
        ok(PO._cwPolishAboutState(pend) === 'pending' && /Finish lesson 8, Mark Your Draft/.test(pend), 'no trial yet → lesson 9\'s About (renumbered .761), saying where the priority comes from');
        const done = PO._cwComposePolishAbout(pend, 'Climax — the girl and the guard never meet; make them collide <now>');
        ok(PO._cwPolishAboutState(done) === 'ok' && /<strong>Your priority:<\/strong> Climax — the girl and the guard never meet; make them collide &lt;now&gt;/.test(done), '⭐ a later trial lands: the priority is written in, escaped');
        ok(/The shortcut ran past the asylum\./.test(done) && (done.match(/data-section-label="About This Draft"/g) || []).length === 1, 'the student\'s draft and every other section are untouched (one About, replaced in place)');
        ok(PO._cwComposePolishAbout(done, 'Hook — x') === PO._cwComposePolishAbout(done, 'Hook — x') && PO._cwPolishAboutState(done) === 'ok', 'once it has a priority the page is left alone (compose runs only for foreign/pending)');
        const inner = PO._cwPolishAboutInner('Hook — x');
        ok(!LEAK_RE.test(inner.replace(/lesson \d/g, '')) && /lesson 7, Write Draft 1/.test(inner), 'the page names lessons by the unit\'s own numbers, never a course step; true when the box is empty');
        ok(/state\.task === 'cw_step_14'\s*\n?\s*&& WML\.cwInUnit && WML\.cwInUnit\(\) && !state\.reviewMode/.test(SRC), 'the compose runs only in a weekend lesson 8, never in tutor review');
        // v7.20.776: the read moved into ONE sibling-page reader (_cwStepDocHTML), which lesson 11 also uses.
        const SDH = SRC.slice(SRC.indexOf('async function _cwStepDocHTML(task) {'), SRC.indexOf('async function _cwTrial1Priority'));
        ok(/WML\.resolveCanvasSuffix\(task, state\.phase\)/.test(SDH) && !/seedFromSiblings/.test(SDH)
            && /const html = await _cwStepDocHTML\('cw_trial_1'\);/.test(SRC.slice(SRC.indexOf('async function _cwTrial1Priority'), SRC.indexOf('async function _cwTrial1Priority') + 600)),
            '§5d: the trial is read under the ONE suffix builder it saved with, and the read never seeds');
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
            /registerCwWalkCtls\(\[[^\]]*_cwAdaptCtl[,\]]/,                                                                          // reset on clear
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
        const HOLD = { w: null, rewrite: '', crit: null };
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
                        for (const [f, t] of (HOLD.w ? HOLD.w.rows : new Map())) if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f, criteria: (HOLD.crit && HOLD.crit[f]) || '{}' }, textContent: t }, 0) === false) return;
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
        ok(/\*AQA, (sample paper for exams from 2026|(June|November) \d{4})\*/.test(last(w)), 'the source is named in plain words, under the chip', last(w).slice(0, 220));
        const beatOf = (t) => { const m = /\[SWML_BEAT:(\{[^}]*\})\]/.exec(String(t || '')); try { return m ? JSON.parse(m[1]) : null; } catch (e) { return null; } };
        const b1 = beatOf(last(w)), nm1 = SH[DR[0].shape].name;
        ok(!!b1 && b1.unit === 'Question' && b1.step === 1 && b1.total === DR.length && b1.heading === nm1.charAt(0).toUpperCase() + nm1.slice(1),
            '⭐ the chip counts QUESTIONS and names the kind ("Question 1 of 3 · A title") — staging .753 first showed "Step 1 of 3"', b1);
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

        ok(w.bubbles.map(beatOf).filter(Boolean).every((x) => x.unit === 'Question'), 'every lesson-9 chip says Question, never Step');
        // the root of that leak: the progress chip's DEFAULT counter word, run for real with a WML stub
        const pbi = SRC.indexOf('function cwProgressBar(');
        const PB = (wml) => new Function('WML', 'return (' + SRC.slice(pbi, braceSliceFrom(SRC, pbi, '{', '}').end) + ');')(wml);   // eslint-disable-line no-new-func
        ok(beatOf(PB({ cwInUnit: () => true })(1, 7, 'Your Logline')).unit === 'Part' && beatOf(PB({ cwInUnit: () => false })(1, 7, 'Your Logline')).unit === 'Step'
            && beatOf(PB(undefined)(1, 7, 'Your Logline')).unit === 'Step' && beatOf(PB({ cwInUnit: () => true })(1, 7, 'X', '', 'Beat')).unit === 'Beat',
            '⭐ in a weekend lesson an unnamed counter says "Part" (lesson 3\'s Logline said "Step N of 7"); the full course keeps "Step"; a named one is untouched');

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
        // L8 · the DOCUMENT keeps its questions (each row saved its question's identity) — a bank change never splits
        // the chat from the page. Here the page was made with Cambridge's questions; the bank now says AQA.
        ok(/adapt: \{ shape: d\.shape, text: d\.text, board: d\.board, sitting: d\.sitting, hasImages: d\.hasImages, fallback: d\.fallback \}/.test(SRC), 'each question row saves its question with the page');
        const CAM = AD._cwAdaptDrills(MAP['cambridge-igcse'] || []);
        HOLD.crit = {}; CAM.forEach((d) => { HOLD.crit[d.fid] = JSON.stringify({ id: 'drill-' + d.n, adapt: { shape: d.shape, text: d.text, board: d.board, sitting: d.sitting, hasImages: d.hasImages, fallback: d.fallback } }); });
        const dk = adaptWorld('aqa', AQA, { ls: new Map(), history: [] });
        dk.ctl.start(); dk.toAsk();
        ok(CAM.length > 0 && last(dk).indexOf('> ' + CAM[0].text) !== -1 && last(dk).indexOf('> ' + DR[0].text) === -1, '⭐ a page made with one board\'s questions keeps asking THOSE after the bank changes', last(dk).slice(0, 200));
        const CF = (MAP.ccea || []).slice(); const cfd = AD._cwAdaptDrills(CF);
        HOLD.crit = {}; cfd.forEach((d) => { HOLD.crit[d.fid] = JSON.stringify({ adapt: { shape: d.shape, text: d.text, board: d.board, sitting: d.sitting, hasImages: d.hasImages, fallback: true } }); });
        const dk2 = adaptWorld('ccea', AQA.map((p) => Object.assign({}, p, { board: 'CCEA' })), { ls: new Map(), history: [] });
        dk2.ctl.start(); dk2.toAsk();
        ok(/real story questions from past papers/.test(dk2.bubbles.join('\n')), '...and "other boards\' questions" is read from the page too, not from today\'s bank');
        HOLD.crit = null;
        // L9 · the shared walk ending says "lesson" in a weekend lesson (v7.20.754), "step" in the full course
        const epi = SRC.indexOf('function cwEndpointLine()');
        const EP = (inUnit, btn) => new Function('WML', 'document', 'return (' + SRC.slice(epi, braceSliceFrom(SRC, epi, '{', '}').end) + ');')(   // eslint-disable-line no-new-func
            { cwInUnit: () => inUnit }, { querySelector: () => (btn ? {} : null) })();
        ok(/That’s this lesson done\./.test(EP(true, false)) && /That’s this lesson done\./.test(EP(true, true)) && /That’s this step done\./.test(EP(false, true)) && /Mark Complete/.test(EP(true, true)),
            'the walk ending says "lesson" in a weekend lesson and "step" in the full course (staging .753 said "step" after "the whole weekend story")');
    }
    // ── M · v7.20.755: the DOCUMENTS of weekend lessons 1–4 and 7 never name a course step. Staging .754, LD's real
    // pages, both boards: "Step 2: Explore Story Ideas", "Sparks From Step 1", "go back to Step 3", "your writing from
    // Step 10". No gate looked at these documents — section E covers lesson 5 and the chat turns only. This is a
    // POPULATION check: it renders the real templates and reads every character, labels included.
    console.log('\nM · the documents of weekend lessons 1–4 and 7 never name a course step');
    {
        const ui = SRC.indexOf('const CW_UNIT_TEXT_EDITS = [');   // the chat table, the step map, the rule, the doc table
        const uf = SRC.indexOf('function _cwStepPlace(stepNo) {', ui);
        ok(ui > 0 && uf > ui && SRC.indexOf('const CW_UNIT_DOC_EDITS = [', ui) < uf, 'the unit edits, the step map and the step-place helper exist, in one block');
        const UD = SRC.slice(ui, braceSliceFrom(SRC, uf, '{', '}').end);
        const mk = (unit) => new Function('WML', UD + '\nreturn { E: CW_UNIT_DOC_EDITS, f: _cwUnitDocText, place: _cwStepPlace, t: _cwUnitText, w: _cwUnitStepWords };')({ cwInUnit: () => unit });   // eslint-disable-line no-new-func
        const D1 = mk(true), D0 = mk(false);
        const ti = SRC.indexOf('function _cwDocTemplateInner(stepDef) {');
        const TPL = SRC.slice(ti, braceSliceFrom(SRC, ti, '{', '}').end);
        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const H = {   // plain stand-ins with the real helpers' output shape (labels and criteria stay in the HTML)
            sectionHTML: (type, label, ed, x, inner) => '<div data-section-type="' + type + '" data-section-label="' + label + '">' + inner + '</div>',
            dividerHTML: (t) => '<div data-section-type="divider"><p>' + t + '</p></div>',
            outlineRowHTML: (c, fid) => '<div data-outline-row="true" data-prompt="' + esc(c.prompt || c.label) + '" data-field-id="' + fid + '" data-criteria="' + JSON.stringify(c).replace(/"/g, '&quot;') + '"></div>',
        };
        // v7.20.775: rendered with a WML in scope, in BOTH contexts — the real page always has one, and lesson 3's weekend
        // document now carries a unit-only row (the exam scene), so "weekend" and "full course" are different documents.
        const render = (step, unit) => new Function('sectionHTML', 'dividerHTML', 'outlineRowHTML', 'escapeHTML', 'WML', 'return (' + TPL + ')({ step: ' + step + ' });')(H.sectionHTML, H.dividerHTML, H.outlineRowHTML, esc, Object.assign({}, WMLC, { cwInUnit: () => !!unit }));   // eslint-disable-line no-new-func
        const TRUBY = /“Step 1: write something that may change your life[^”]*”/;   // John Truby's words, quoted verbatim (root §5c-i)
        const leftovers = (html) => (html.replace(/&quot;/g, '"').replace(TRUBY, '').match(/.{0,30}\bSteps? \d+.{0,30}/g) || []);
        const raws = [1, 2, 3, 4].map((st) => render(st, true));
        const rawsFull = [1, 2, 3, 4].map((st) => render(st, false));
        raws.forEach((raw, i) => {
            ok(leftovers(D1.f(raw)).length === 0, '⭐ lesson ' + (i + 1) + '\'s document names no course step in a weekend lesson (labels and rows included)', leftovers(D1.f(raw)));
            ok(D0.f(rawsFull[i]) === rawsFull[i] && leftovers(rawsFull[i]).length > 0, 'lesson ' + (i + 1) + ': the full course keeps its own words');
        });
        // v7.20.775 (#815f): the exam-scene row — weekend lesson 3 only, LOCKED (code writes it), from the ONE fid constant.
        const FOC = WMLC.CW_SCENE_FOCUS_FID;
        const focRow = (html) => (html.match(new RegExp('<div data-outline-row="true"[^>]*data-field-id="' + FOC + '"[^>]*>')) || [])[0] || '';
        ok(FOC === 'cw-step-3-scene-focus' && !!focRow(raws[2]) && /&quot;locked&quot;:true/.test(focRow(raws[2])) && /data-section-label="Your Exam Scene"/.test(raws[2]),
            '⭐ weekend lesson 3\'s document has the LOCKED "Your Exam Scene" row (code fills it from the chat choice)', focRow(raws[2]).slice(0, 160));
        ok(rawsFull.every((r) => r.indexOf(FOC) === -1) && [0, 1, 3].every((i) => raws[i].indexOf(FOC) === -1), 'no other document, and not the full course\'s Step 3, has the row');
        // v7.20.776 (#815c, plan §2e.2): weekend lesson 11, Mark It Again — its own page, Trial 1's rows, lesson 11's words.
        {
            const AG = new Function('sectionHTML', 'dividerHTML', 'outlineRowHTML', 'escapeHTML', 'WML', 'CW_TRIAL_DRAFT_LABEL', '_cwMarkAgainAboutHTML', '_cwMarkAgainDraftInner',   // eslint-disable-line no-new-func
                '_cwTrial1JudgementBlock', '_cwTrial1SophiaBlock', '_cwMarkAgainThenNowBlock', '_cwMarkAgainTargetBlock', 'CW_ADAPT_STEP', 'return (' + TPL + ')({ step: 91 });');
            const fnOf = (name) => { const i = SRC.indexOf('function ' + name + '('); return new Function('sectionHTML', 'dividerHTML', 'outlineRowHTML', 'escapeHTML', 'window', 'WML', 'return ' + SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end) + ';'); };   // eslint-disable-line no-new-func
            const W = { WML: Object.assign({}, WMLC, { cwInUnit: () => true }) };
            const mk = (name) => fnOf(name)(H.sectionHTML, H.dividerHTML, H.outlineRowHTML, esc, W, W.WML);
            const page = AG(H.sectionHTML, H.dividerHTML, H.outlineRowHTML, esc, W.WML, 'Your Draft', mk('_cwMarkAgainAboutHTML'), mk('_cwMarkAgainDraftInner'),
                mk('_cwTrial1JudgementBlock'), mk('_cwTrial1SophiaBlock'), mk('_cwMarkAgainThenNowBlock'), mk('_cwMarkAgainTargetBlock'), 90);
            const els = WMLC.cwTrial1Elements();
            ok(/data-section-label="Your Draft"/.test(page) && /Your rewritten story has not arrived here yet/.test(page),
                '⭐ lesson 11: the rewritten story sits where Trial 1 shows the draft (same label, so the draft pad and the walk find it)');
            ok(els.every((e) => page.indexOf('data-field-id="cw-trial-1-' + e.id + '"') !== -1 && page.indexOf('data-field-id="cw-trial-1-fb-' + e.id + '"') !== -1),
                'lesson 11: Trial 1\'s own judgement and verdict rows, one per element (the walk writes them)');
            ok(els.every((e) => page.indexOf('data-field-id="cw-again-' + e.id + '"') !== -1) && page.indexOf('data-field-id="cw-again-total"') !== -1 && /data-section-label="Then and Now"/.test(page),
                '⭐ lesson 11: THEN AND NOW — one row per element and one for the whole story');
            const seen = page.replace(/<[^>]+>/g, ' ');   // what a student reads (row ids and criteria live in the tags)
            ok(/Priority for the Exam/.test(page) && /data-section-label="Your Target for the Exam"/.test(page) && !/Draft 2|Draft 1|Step \d|\btrial\b/i.test(seen),
                '⭐ lesson 11: its own words — no Draft 1/2, no course step, no "trial"', (seen.match(/.{0,40}(Draft [12]|Step \d|\btrial\b).{0,40}/i) || [])[0]);
            const t1 = mk('_cwTrial1SophiaBlock')();
            ok(/Priority for Draft 2/.test(t1) && !/Priority for the Exam/.test(t1), 'lesson 8\'s page keeps "Priority for Draft 2"');
            // every lesson-11 edit still matches its source — a drifted literal is a silent no-op
            const ae = SRC.indexOf('const CW_AGAIN_TEXT_EDITS = [');
            const AE = eval(braceSliceFrom(SRC, ae, '[', ']').text);   // eslint-disable-line no-eval
            const T1C = SRC.slice(SRC.indexOf('const _cwTrial1Ctl = (function () {'), SRC.indexOf('const _cwTrial1Ctl = (function () {') + 100000);
            ok(AE.length >= 20 && AE.every((ed) => T1C.indexOf(JSON.stringify(ed[0]).slice(1, -1).replace(/\\"/g, '"')) !== -1 || T1C.indexOf(ed[0]) !== -1),
                '⭐ every lesson-11 edit still matches a phrase in the Trial 1 walk (a drifted one would leave "Draft 2" on screen)',
                AE.filter((ed) => T1C.indexOf(JSON.stringify(ed[0]).slice(1, -1).replace(/\\"/g, '"')) === -1 && T1C.indexOf(ed[0]) === -1).map((ed) => ed[0].slice(0, 50)));
        }
        ok(TRUBY.test(D1.f(raws[0])), 'Truby\'s quotation survives untouched');
        // every edit still matches something real — a drifted literal is a silent no-op
        D1.E.forEach((ed) => ok(raws.some((r) => r.indexOf(ed[0]) !== -1) || SRC.indexOf(ed[0]) !== -1, 'unit document edit still matches its source: "' + ed[0].slice(0, 46) + '"'));
        // the heals insert the same sections into older documents: their HTML gets the same words
        [['const sparksHTML = ', 'Sparks section'], ['const carryHTML = ', 'chosen-logline carry'], ["const newSection = sectionHTML('response', 'Seed Loglines'", 'seed loglines']].forEach(([start, name]) => {
            const a = SRC.indexOf(start), b = SRC.indexOf('_migrationActive = true;', a);
            ok(a > 0 && b > a && leftovers(D1.f(SRC.slice(a, b))).length === 0, 'the ' + name + ' heal inserts no course step in a weekend lesson', a > 0 ? leftovers(D1.f(SRC.slice(a, b))) : 'not found');
            ok(/_cwUnitDocText\((sparksHTML|carryHTML|newSection)\)/.test(SRC.slice(b, b + 400)), 'the ' + name + ' heal runs its HTML through the unit edits');
        });
        ok(/\[_cwUnitDocText\('You didn’t tick any sparks in Step 1/.test(SRC) && leftovers(D1.f('You didn’t tick any sparks in Step 1 — that’s fine.')).length === 0, 'the no-sparks note says "lesson 1" in a weekend lesson');
        ok(/const inner = _cwUnitDocText\(_cwDocTemplateInner\(stepDef\)\);/.test(SRC), 'every template the page builds goes through the unit edits (getCwDocTemplate)');
        ok(D1.place(10) === 'lesson 7' && D1.place(27) === 'lesson 6' && D1.place(9) === 'lesson 5' && D0.place(10) === 'Step 10' && /const where = stepNo \? _cwStepPlace\(stepNo\)/.test(SRC),
            'the trial points back to "lesson 7" (Draft 1, renumbered .761) and Structural Elements is lesson 6, never "Step 10"/"Step 27" (the full course keeps "Step 10")');
        // the CHAT side (v7.20.755): every served sentence of lessons 1–4 and 7 goes through _cwUnitText, which now names
        // every course step the unit HAS by its lesson — the population, not a list of noticed phrases
        const W = D1.w;
        ok(W('It carries straight into Step 3.') === 'It carries straight into lesson 3.' && W('Step 4 turns it') === 'Lesson 4 turns it'
            && W('Done.\n\nStep 3 is next') === 'Done.\n\nLesson 3 is next' && W('In Step 3 you said') === 'In lesson 3 you said'
            && W('your writing from Step 10') === 'your writing from lesson 7' && W('“Step 1: write something') === '“Step 1: write something'
            && W('build that in Step 6') === 'build that in Step 6' && D0.t('carries into Step 3') === 'carries into Step 3',
            'a step the unit has is named by its lesson (capital at a sentence start); a quotation and a step the unit lacks are left alone; the full course is untouched');
        const WALKS = ['const _cwProfileCtl', 'const _cwIdeasCtl', 'const _cwLoglineCtl', 'const _cwSpineCtl', 'const _cwTrial1Ctl'];
        WALKS.forEach((decl) => {
            const a0 = SRC.indexOf(decl), body = a0 > 0 ? braceSliceFrom(SRC, a0, '(', ')').text : '';
            ok(/function aiBubble\(plain(, opts)?\) \{\s*plain = _cwUnitText\(plain\);/.test(body), decl.slice(6) + ': every bubble it serves goes through the unit words');
            const lits = [];
            body.split('\n').forEach((line) => { if (/^\s*\/\//.test(line) || /console\.(log|warn|error)/.test(line)) return; (line.match(/(["'`])(?:\\.|(?!\1).)*\1/g) || []).forEach((q) => lits.push(q)); });
            const left = lits.map((q) => D1.t(q)).filter((q) => /\bSteps? \d/.test(q) && !/Step 4 — Your Brief Outline/.test(q));   // that one is a guide ANCHOR (a key), never shown
            ok(lits.length > 20 && left.length === 0, decl.slice(6) + ': after the unit words, no sentence names a course step the weekend story lacks', left.map((q) => q.slice(0, 90)));
        });
        // v7.20.756 (#801): lessons 2–4 open on the GENERIC CW greeting (both pipelines + both "Welcome back" re-greets).
        // Staging .755, LD's real pages: "Welcome to Step 2: Explore Story Ideas" / "In Step 1, you built…". Every
        // greeting site must route through the unit words, and its sentences (steps 1–4 — the unit never runs 5–8) must
        // come out with no course step; the prereq gate must offer a re-check, never the full course's step dashboard.
        const GSITES = [];
        let gp = 0;
        while ((gp = SRC.indexOf('const cwPrevContext = {', gp + 1)) > 0) GSITES.push(SRC.slice(gp, SRC.indexOf('_cwGreetOnce(stepNum,', gp)));
        ok(GSITES.length === 2, 'both greeting builders found (the dual pipeline)', GSITES.length);
        GSITES.forEach((g, i) => {
            ok(/\n\s*greetingText = _cwUnitText\(greetingText\);\s*\n/.test(g) && /_cwPrereqRecheckLabel\(prereqStep\)/.test(g), 'greeting builder ' + (i + 1) + ' serves its greeting through the unit words and knows the unit re-check');
            const lits = [];
            g.split('\n').forEach((line) => {
                if (/^\s*\/\//.test(line) || /^\s*[5-8]: /.test(line) || /cwPrevContext\[6\] =/.test(line)) return;   // steps 5–8: full course only
                (line.match(/(["'`])(?:\\.|(?!\1).)*\1/g) || []).forEach((q) => lits.push(q.replace(/\$\{stepNum\}/g, '2').replace(/\$\{prereqStep\}/g, '1').replace(/\$\{[^}]*\}/g, 'X')));
            });
            const left = lits.map((q) => D1.t(q)).filter((q) => /\bSteps? \d/.test(q));
            ok(lits.length > 8 && left.length === 0, '⭐ greeting builder ' + (i + 1) + ': after the unit words no sentence names a course step', left.map((q) => q.slice(0, 90)));
        });
        const backs = SRC.match(/const gt = [^\n]*Welcome back to Step[^\n]*/g) || [];
        ok(backs.length === 2 && backs.every((b) => /^const gt = _cwUnitText\(`Welcome back to Step/.test(b) && /'lesson' : 'step'/.test(b)), 'both "Welcome back" re-greets go through the unit words and say "this lesson" in a unit', backs.length);
        ok((SRC.match(/textContent: _recheckB? \|\| 'Back to Steps',/g) || []).length === 2 && (SRC.match(/if \(_recheckB?\) \{ window\.location\.reload\(\); return; \}/g) || []).length === 2,
            'both prereq buttons re-check in a unit instead of opening the full course\'s step dashboard');
        // the helper and the once-guard, executed: a stored "Welcome to lesson 2:" greeting must count as drawn (#240)
        const gi2 = SRC.indexOf('function _cwPrereqRecheckLabel(prereqStep) {'), oi = SRC.indexOf('function _cwGreetOnce(stepKey, history, emit) {');
        const GH = new Function('WML', UD   // eslint-disable-line no-new-func
            + '\nfunction _cwPrereqRecheckLabel(prereqStep) ' + braceSliceFrom(SRC, gi2, '{', '}').text
            + '\nlet _cwGreetedFor = "";\nfunction _cwGreetOnce(stepKey, history, emit) ' + braceSliceFrom(SRC, oi, '{', '}').text
            + '\nreturn { lab: _cwPrereqRecheckLabel, once: _cwGreetOnce };');
        const GU = GH({ cwInUnit: () => true }), GF = GH({ cwInUnit: () => false });
        ok(GU.lab(1) === 'I’ve finished lesson 1 — check again' && GF.lab(1) === '' && GU.lab(6) === '', 'the unit prereq button names the lesson to finish; the full course keeps "Back to Steps"', [GU.lab(1), GF.lab(1)]);
        let drew = 0;
        const quiet = console.warn; console.warn = () => {};
        const r1 = GU.once(2, [{ role: 'assistant', content: 'Welcome to lesson 2: **Explore Story Ideas**\n\nIn lesson 1, you built…' }], () => drew++);
        const r2 = GF.once(3, [{ role: 'assistant', content: 'Welcome to Step 3: **Create Your Logline**' }], () => drew++);
        console.warn = quiet;
        ok(r1 === false && r2 === false && drew === 0, '⭐ a stored "Welcome to lesson 2:" greeting counts as drawn — the replay and the emitter never both draw it (#240)', { r1, r2, drew });
        // ONE name per lesson: the greeting's lesson name is the unit document's own heading (staging .756 said "Welcome
        // to lesson 4: Brief Outline" over a document headed "Your Story Spine"), read through WMLC.cwStepLabel.
        ok((SRC.match(/const stepLabel = WML\.cwStepLabel\(cwStepDef\) \|\| 'this step';/g) || []).length === 4 && !/const stepLabel = cwStepDef\??\.label \|\| 'this step'/.test(SRC),
            'all four greeting sites name the lesson through cwStepLabel');
        const headOf = (step) => { const d = (WMLC.CW_STEPS || []).find((x) => x.step === step); st.cwUnit = 'weekend'; const u = WMLC.cwStepLabel(d); st.cwUnit = ''; return { u, f: WMLC.cwStepLabel(d), label: d && d.label }; };
        [2, 3, 4].forEach((n) => {
            const { u, f, label } = headOf(n);
            ok(D1.f(render(n)).indexOf('<h2>' + u + '</h2>') !== -1, '⭐ lesson ' + n + '\'s greeting name "' + u + '" is its document\'s heading', u);
            ok(f && f === label, 'lesson ' + n + ': the full course keeps its own label ("' + f + '")');
        });
    }
    // ── N · v7.20.758: the weekend story is its OWN project (Neil, FIXLIST #802: "it should have its own wml document…
    // students should also be able to create a new weekend course project just like they can for the full creative
    // writing project"). Before this, a weekend lesson opened the student's most recent project of ANY kind — on prod,
    // 16 real students' summer stories. Driven through the REAL WML.cwProject (fetch stubbed) and the REAL PHP gate.
    console.log('\nN · the weekend story is its own project: its own list, its own create, its own pin, its own gate');
    {
        const PROJ = [{ id: 'cwp_full', course_context: 'standalone' }, { id: 'cwp_legacy' }, { id: 'cwp_wk', course_context: 'weekend' }];
        const posts = [];
        const realFetch = global.fetch;
        global.fetch = async (url, opts) => {
            const isPost = !!(opts && opts.method === 'POST');
            if (isPost) posts.push(JSON.parse(opts.body || '{}'));
            const body = isPost ? { success: true, project: { id: 'cwp_new' } } : { success: true, projects: PROJ };
            return { ok: true, status: 200, text: async () => JSON.stringify(body), json: async () => body };
        };
        const P = WMLC.cwProject;
        const ids = (r) => ((r && r.projects) || []).map((p) => p.id).join(',');
        let wk, fc, wkPin, fcPin;
        WMLC.config.courseId = '42205';   // the AQA Language P1 course the weekend lesson sits in
        try {
            st.cwUnit = 'weekend'; wk = await P.list(); wkPin = P.pinKey(); await P.create('A');
            st.cwUnit = ''; fc = await P.list(); fcPin = P.pinKey(); await P.create('B');
        } finally { global.fetch = realFetch; st.cwUnit = ''; }
        ok(ids(wk) === 'cwp_wk', '⭐ a weekend lesson lists ONLY weekend stories (never the student\'s summer story)', ids(wk));
        ok(ids(fc) === 'cwp_full,cwp_legacy', 'the full course lists every non-weekend story, untagged legacy ones included', ids(fc));
        ok(posts.length === 2 && posts[0].course_context === 'weekend' && posts[1].course_context === 'standalone', '⭐ create() makes THIS lesson\'s kind, whatever the call site passed', posts.map((b) => b.course_context));
        ok(posts[0].course_id === 42205 && posts[1].course_id === 0, 'a weekend story records the course its lesson sits in; a full-course story records none', posts.map((x) => x.course_id));
        ok(fcPin === 'swml_cw_active_project' && wkPin === 'swml_cw_active_project__weekend', 'the "which story am I in" pin is kept per kind; the full course\'s key is unchanged', [fcPin, wkPin]);
        ok(!/cwProject\.create\([^)]*,\s*'standalone'\)/.test(SRC), 'no call site still passes a kind literal (create() decides)');
        ok(/bits\.push\(_cwUnitText\(p\.progress_label\)\)/.test(SRC) && /'\+ Start a new weekend story'/.test(SRC) && /'Your weekend stories'/.test(SRC) && /'Name your weekend story'/.test(SRC),
            'the story picker speaks of weekend stories, and its "Step 4 — …" progress line names the lesson');
        // the REAL server gate, per kind
        const RA = fs.readFileSync(path.join(ROOT, 'includes/class-rest-api.php'), 'utf8');
        const gi3 = RA.indexOf('private static function cw_new_story_block($user_id, $course_context = \'standalone\') {');
        ok(gi3 > 0 && /self::cw_new_story_block\(\$user_id, sanitize_key\(\$params\['course_context'\] \?\? 'standalone'\)\)/.test(RA), 'the create endpoint gates on the kind being created');
        if (gi3 > 0) {
            const FN = RA.slice(gi3, braceSliceFrom(RA, gi3, '{', '}').end).replace('private static function', 'public static function');
            const tmp = path.join(require('os').tmpdir(), 'wml-gate-' + process.pid + '.php');
            fs.writeFileSync(tmp, "<?php\nfunction absint($v){return abs((int)$v);}\nclass SWML_Session_Manager { public static $I = []; public static $P = [];\n"
                + " public static function list_projects($u){return self::$I;} public static function get_project($u,$id){return self::$P[$id] ?? null;} }\n"
                + "class X {\n" + FN + "\n}\n$o = [];\n"
                // a student with an UNFINISHED summer story and nothing else
                + "SWML_Session_Manager::$I = ['cwp_s' => ['id'=>'cwp_s','name'=>'Summer','updated'=>'2026-08-01 10:00:00','course_context'=>'standalone']];\n"
                + "SWML_Session_Manager::$P = ['cwp_s' => ['step_completion'=>[], 'trials'=>[]]];\n"
                + "$o['weekendFirst'] = X::cw_new_story_block(1, 'weekend'); $o['fullSecond'] = X::cw_new_story_block(1, 'standalone');\n"
                // + an unfinished weekend story
                + "SWML_Session_Manager::$I['cwp_w'] = ['id'=>'cwp_w','name'=>'Weekend','updated'=>'2026-10-08 10:00:00','course_context'=>'weekend'];\n"
                + "SWML_Session_Manager::$P['cwp_w'] = ['step_completion'=>[], 'trials'=>[]];\n"
                + "$o['weekendSecond'] = X::cw_new_story_block(1, 'weekend');\n"
                // the weekend story carried through lessons 5 and 7
                + "SWML_Session_Manager::$P['cwp_w'] = ['step_completion'=>[9=>true], 'trials'=>[['trial'=>1]]];\n"
                + "$o['weekendAfterFinish'] = X::cw_new_story_block(1, 'weekend'); $o['fullStillGated'] = X::cw_new_story_block(1, 'standalone');\n"
                + "echo json_encode($o);\n");
            let G = {};
            try { G = JSON.parse(cp.execFileSync('php', [tmp], { encoding: 'utf8' })); }
            catch (e) { ok(false, 'the PHP gate ran', String(e && e.message).slice(0, 300)); }
            finally { try { fs.unlinkSync(tmp); } catch (e) { /* gone */ } }
            ok(G.weekendFirst === null, '⭐ an unfinished summer story never blocks a first weekend story', G.weekendFirst);
            ok(G.fullSecond && G.fullSecond.story_name === 'Summer', 'the full course\'s own rule still holds (finish the summer story first)', G.fullSecond);
            ok(G.weekendSecond && G.weekendSecond.story_name === 'Weekend' && (G.weekendSecond.needs || []).join('|') === 'lesson 5 (Your Dramatic Situation)|lesson 8 (Mark Your Draft)',
                'a second weekend story waits for the current one, named in lessons — never "Step 9"', G.weekendSecond);
            ok(G.weekendAfterFinish === null && G.fullStillGated && G.fullStillGated.story_name === 'Summer', 'finishing the weekend story frees the weekend kind only', [G.weekendAfterFinish, G.fullStillGated]);
        }
        // v7.20.759 — WORDS COUNT IN THE STORY'S OWN COURSE (dashboard reply): the REAL cw_words_for_user + the
        // get_words_written call site, run against a summer story, an AQA weekend story and an Eduqas weekend story.
        const SM = fs.readFileSync(path.join(ROOT, 'includes/class-session-manager.php'), 'utf8');
        ok(/'course_context' => sanitize_key\(\$course_context\),\n        \];\n[^]*?if \(absint\(\$course_id\) > 0\) \{ \$index_entry\['course_id'\] = absint\(\$course_id\); \}/.test(SM)
            && /create_project\(\$user_id, \$name, \$course_context, absint\(\$params\['course_id'\] \?\? 0\)\)/.test(RA), 'the course reaches the project index (REST → session manager)');
        const wi = RA.indexOf('private function cw_words_for_user($user_id, $course_id = self::CW_COURSE_ID) {');
        const ci = RA.indexOf('$cw = $this->cw_words_for_user($target, $course_id);');
        ok(wi > 0 && ci > 0, 'words-written asks for every course, not just the CW course');
        if (wi > 0 && ci > 0) {
            const WF = RA.slice(wi, braceSliceFrom(RA, wi, '{', '}').end).replace('private function', 'public function');
            const CALL = RA.slice(ci, RA.indexOf('\n        }\n', ci) + 10);
            const tmp = path.join(require('os').tmpdir(), 'wml-words-' + process.pid + '.php');
            fs.writeFileSync(tmp, "<?php\nfunction absint($v){return abs((int)$v);}\n"
                + "function get_user_meta($u,$k,$s){return json_encode(['cwp_s'=>['id'=>'cwp_s','name'=>'Summer'],'cwp_a'=>['id'=>'cwp_a','name'=>'AQA wk','course_context'=>'weekend','course_id'=>42205],'cwp_e'=>['id'=>'cwp_e','name'=>'Eduqas wk','course_context'=>'weekend','course_id'=>42764]]);}\n"
                + "class Sophicly_WML_Listener { public static function cw_project_word_count($u,$id){ return ['cwp_s'=>100,'cwp_a'=>20,'cwp_e'=>3][$id]; } }\n"
                + "class X { const CW_COURSE_ID = 41165;\n" + WF + "\n public function at($course_id){ $target = 1;\n" + CALL + "\n return $cw; } }\n"
                + "$x = new X(); echo json_encode(['cw'=>$x->at(41165),'aqa'=>$x->at(42205),'eduqas'=>$x->at(42764),'other'=>$x->at(99)]);\n");
            let Wd = {};
            try { Wd = JSON.parse(cp.execFileSync('php', [tmp], { encoding: 'utf8' })); }
            catch (e) { ok(false, 'the PHP words attribution ran', String(e && e.message).slice(0, 300)); }
            finally { try { fs.unlinkSync(tmp); } catch (e) { /* gone */ } }
            ok(Wd.cw && Wd.cw.words === 100 && Wd.aqa && Wd.aqa.words === 20 && Wd.eduqas && Wd.eduqas.words === 3,
                '⭐ a weekend story\'s words count in its own Language P1 course, never in the CW course', [Wd.cw && Wd.cw.words, Wd.aqa && Wd.aqa.words, Wd.eduqas && Wd.eduqas.words]);
            ok(Wd.other && Wd.other.words === 0 && Wd.other.reason === '' && Wd.other.projects.length === 0, 'a course with no weekend story gets the exact old zero shape', Wd.other);
        }
    }
    // ── O · v7.20.761: weekend lesson 6, STRUCTURAL ELEMENTS (Neil, 8 Oct, FIXLIST #804, PEDAGOGY §55.2): full-course
    // Step 27's eleven techniques planned into the scene one at a time, before Draft 1; Trial 1 marks them.
    console.log('\nO · lesson 6: Structural Elements, planned one technique at a time; the trial marks them');
    {
        const INSIDER = /\b(protocol|module|component|payload|marker|bank|the system|the platform)\b/i;   // root §5c-ii (same list as §L)
        const TE = WMLC.CW_STRUCT_TECHNIQUES || [];
        // O1 · the data is Step 27's: same eleven, same order, same row ids as the full course's page (§5d)
        const fs27 = SRC.indexOf("if (step === 27) {\n            html += sectionHTML('question', 'About This Step'");
        const FULL27 = fs27 > 0 ? SRC.slice(fs27, SRC.indexOf('return html;', fs27)) : '';
        const fullIds = (FULL27.match(/outlineRowHTML\(\{ id: '([a-z]+)'/g) || []).map((x) => x.replace(/.*'([a-z]+)'/, '$1'));
        ok(TE.length === 11 && JSON.stringify(TE.map((t) => t.id)) === JSON.stringify(fullIds), 'the eleven techniques are Step 27\'s, in its order', [TE.map((t) => t.id), fullIds]);
        ok(TE.every((t) => WMLC.cwStructFid(t.id) === 'cw-step-25-' + t.id) && fullIds.every((id) => FULL27.indexOf("'cw-step-25-" + id + "'") !== -1),
            '⭐ §5d: lesson 6 files into the SAME row ids the full course\'s page creates (cw-step-25-*), so no saved Step 27 document is orphaned');
        ok(JSON.stringify(TE.filter((t) => t.must).map((t) => t.id)) === JSON.stringify(['irony', 'denouement', 'senses']) && WMLC.CW_STRUCT_MIN === 4,
            'Step 27\'s rules: irony, a denouement technique and the five senses are compulsory; at least 4 in total');
        // v7.20.773 (FIXLIST #815b): his workbook marks Duality RECOMMENDED (CW-STEP-25-structural-elements.md:32), and so
        // does the full course's page ("4. Duality (Recommended)"). Exactly one technique carries the flag.
        ok(JSON.stringify(TE.filter((t) => t.recommended).map((t) => t.id)) === JSON.stringify(['duality']) && TE.every((t) => !(t.must && t.recommended)),
            'Duality is the one RECOMMENDED technique, as in his workbook and the full course');
        const ALLOW = new Set(fs.readFileSync(path.join(__dirname, 'cw6-prod-technique-symbols.txt'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && l[0] !== '#'));
        const syms = [].concat(...TE.map((t) => (t.syms || []).map((x) => x.s)));
        ok(syms.length >= 11 && syms.every((x) => ALLOW.has(x)), 'every Table of Techniques chip opens a card the LIVE table carries', syms.filter((x) => !ALLOW.has(x)));
        const words = (s) => String(s || '').trim().split(/\s+/).length;
        ok(TE.every((t) => t.what && t.example && t.more && words(t.what) <= 45 && words(t.example) <= 60 && words(t.more) <= 60), 'each card is short: one rule, one example, one more (§5c-ii note-sized)',
            TE.filter((t) => !(words(t.what) <= 45 && words(t.example) <= 60 && words(t.more) <= 60)).map((t) => t.id));
        const CARDS = TE.map((t) => [t.label, t.what, t.example, t.more].join(' ')).join(' ');
        ok(!LEAK_RE.test(CARDS) && !INSIDER.test(CARDS), 'no course step, plot, stage or insider word in anything a lesson-6 student reads', (CARDS.match(new RegExp('.{0,40}(' + LEAK_RE.source + '|' + INSIDER.source + ').{0,40}', 'i')) || [])[0]);
        ok(!/["“”]/.test(TE.map((t) => t.example + ' ' + t.more).join(' ')), '§5c-i: the examples DESCRIBE, they never quote (nothing to check against an edition)');
        ok(/unitTier: 'si'/.test(CORE) && /function cwStepTier\(def\)/.test(CORE) && /cwStepTier\(stepDef\) === 'si' \? EXERCISE_MANIFEST\.cw_si/.test(CORE)
            && /const isCwSi = isCwTask && WML\.cwStepTier\(cwStepDef\) === 'si'/.test(SRC), 'a weekend lesson 6 runs Step 27 with the chat (one tier switch, read through one resolver); the full course keeps its workbook page');
        // O2 · the page, in a weekend lesson and in the full course
        const ti2 = SRC.indexOf('function _cwDocTemplateInner(stepDef) {');
        const TPL2 = SRC.slice(ti2, braceSliceFrom(SRC, ti2, '{', '}').end);
        const esc2 = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const H2 = {
            sectionHTML: (type, label, ed, x, inner) => '<div data-section-type="' + type + '" data-section-label="' + label + '">' + inner + '</div>',
            dividerHTML: (t) => '<div data-section-type="divider"><p>' + t + '</p></div>',
            outlineRowHTML: (c, fid) => '<div data-outline-row="true" data-prompt="' + esc2(c.prompt || c.label) + '" data-field-id="' + fid + '" data-label="' + esc2(c.label) + '"></div>',
        };
        const render27 = (unit) => new Function('sectionHTML', 'dividerHTML', 'outlineRowHTML', 'escapeHTML', 'WML', 'return (' + TPL2 + ')({ step: 27 });')(   // eslint-disable-line no-new-func
            H2.sectionHTML, H2.dividerHTML, H2.outlineRowHTML, esc2, Object.assign({}, WMLC, { cwInUnit: () => unit }));
        const U27 = render27(true), F27 = render27(false);
        ok((U27.match(/data-field-id="cw-step-25-/g) || []).length === 11 && !/\bStep \d|Hero|Stage|plot/i.test(U27) && /Three you must use/.test(U27),
            '⭐ the weekend page: eleven rows (same ids), no step number, no Hero\'s Journey stage, the three compulsory techniques named', (U27.match(/.{0,40}(\bStep \d|Hero|Stage|plot).{0,40}/i) || [])[0]);
        ok((U27.match(/\(recommended\)/g) || []).length === 1 && /data-label="4\. Duality \(recommended\)"/.test(U27), 'the weekend page labels Duality "(recommended)", and only Duality');
        ok(/Step 27: Other Key Structural Elements/.test(F27) && (F27.match(/data-field-id="cw-step-25-/g) || []).length === 11, 'the full course\'s page is unchanged');
        // O3 · the trial marks the plan (weekend only)
        st.cwUnit = 'weekend';
        const tu = WMLC.cwTrial1Elements();
        st.cwUnit = '';
        const tf = WMLC.cwTrial1Elements();
        const sum = (L) => L.reduce((a, e) => a + (e.outOf || 4), 0);
        ok(tu.length === 9 && tu[7].id === 'structure' && tu[8].id === 'accuracy' && sum(tu) === 34 && tf.length === 8 && sum(tf) === 30,
            '⭐ the weekend trial has nine rows (structure before accuracy), out of 34; the full course keeps eight, out of 30', [tu.map((e) => e.id), sum(tu), sum(tf)]);
        const T1o = SRC.slice(SRC.indexOf('const _cwTrial1Ctl = (function'), SRC.indexOf('const _cwTrial1Ctl = (function') + 140000);
        ok(/function els\(\) \{ return \(WML && \(WML\.cwTrial1Elements \? WML\.cwTrial1Elements\(\)/.test(T1o) && /THEIR STRUCTURAL PLAN \(weekend lesson 6\)/.test(T1o) && /function loadPlans\(\)/.test(T1o)
            && (T1o.match(/loadPlans\(\)\.then/g) || []).length === 2, 'the trial reads THIS lesson\'s rows, loads the lesson-6 plan on start AND resume, and gives Sophia that plan to judge against');
        ok((SRC.match(/WML\.cwTrial1Elements \? WML\.cwTrial1Elements\(\)/g) || []).length >= 3, 'the trial\'s page blocks build the same rows the walk marks');
        ok(/THE TRIAL \(Mark Your Draft\) has one extra element|The trial \(Mark Your Draft\) has one extra element/.test(fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8')) || /NINE verdict lines here/.test(fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8')),
            'the weekend note tells Sophia the trial has a ninth verdict line (the protocol file says eight)');
        ok(/const tryFillCwStructPlan = async/.test(SRC) && /\.then\(\(\) => tryFillCwStructPlan\(\)\)/.test(SRC), 'Draft 1 (lesson 7) pins the lesson-6 plan above the writing box');
        // O4 · the wiring, both pipelines
        const wires = [
            /\} else if \(state\.task === 'cw_step_27' && WML\.cwInUnit && WML\.cwInUnit\(\)\) \{[\s\S]{0,300}_cwStructCtl\.reset\(\); _cwStructCtl\.start\(\);/,
            /if \(state\.task === 'cw_step_27' && _cwStructCtl\.active && _inboundIsAnswer\)/,
            /registerCwWalkCtls\(\[[^\]]*_cwStructCtl[,\]]/, /window\.__swmlCwStructCtl = _cwStructCtl;/, /_cwStructCtl\.onReply\(reply\);/,
            /\(t === 'cw_step_27' && WML\.cwInUnit && WML\.cwInUnit\(\)\) \? _cwStructCtl/, /cwStructCtl: _cwStructCtl,/,
            /state\.task === 'cw_step_27' && tp\.cwStructCtl && WML\.cwInUnit && WML\.cwInUnit\(\)\) tp\.cwStructCtl\.tryResume\(\)/,
            /state\.task === 'cw_step_27' && !state\.reviewMode && tp\.cwStructCtl/, /window\.__swmlCwStructCtl\.reset\(\); window\.__swmlCwStructCtl\.start\(\);/,
            /state\.task === 'cw_step_27' && !state\.reviewMode && window\.__swmlCwStructCtl/,
        ];
        const missW = wires.filter((re) => !re.test(SRC)).map(String);
        ok(missW.length === 0 && (SRC.match(/cw_step_27: _cwStructCtl,/g) || []).length === 3, 'the walk is wired at every entry: fresh, resume, clear, reply, start-miss — on BOTH chat pipelines; the three maps know it', missW);
        // O5 · the walk, driven like a student
        const CTL6 = sliceController('const _cwStructCtl = (function');
        const OWN6 = {};
        const H6 = { w: null };
        const fids6 = TE.map((t) => WMLC.cwStructFid(t.id));
        const w6 = makeWorld(CTL6, {
            task: 'cw_step_27', fids: fids6, ok, ls: new Map(), history: [],
            extraDeps: {
                _CW_TURN_OWNERS: OWN6,
                _cwDocValue: (art, fid) => (art === 'scene_selection' && fid === 'cw-step-8-climax') ? 'He finds the grave.' : '',
                _cwLoadDocValues: () => Promise.resolve({}),
                canvasEditor: { state: { doc: { descendants(fn) {
                    for (const [f, t] of (H6.w ? H6.w.rows : new Map())) if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f }, textContent: t }, 0) === false) return;
                } } } },
            },
        });
        H6.w = w6;
        Object.assign(w6.deps.WML, { CW_STRUCT_TECHNIQUES: TE, CW_STRUCT_MIN: 4, CW_STRUCT_NOT_USING: WMLC.CW_STRUCT_NOT_USING, cwStructFid: WMLC.cwStructFid, CW_SCENE_ELEMENTS: WMLC.CW_SCENE_ELEMENTS, cwInUnit: () => true });
        if (!w6.deps.WML.techIcon) w6.deps.WML.techIcon = () => '';
        w6.deps.window.SophiclyTable = { open() {} };   // the Table of Techniques is on the page
        const last6 = () => w6.bubbles[w6.bubbles.length - 1] || '';
        const chip6 = (re) => w6.chips().filter((c) => re.test(c.textContent))[0];
        ok(w6.ctl.atStart(), 'before it starts, the start-miss net may start it');
        w6.ctl.start();
        await settle(); await wait(60);
        ok(w6.bubbles.length === 1 && /structural techniques/.test(w6.bubbles[0]) && !!chip6(/Continue/), 'the orientation is paced: one chunk, then Continue (§4b)', w6.bubbles.slice(-1));
        for (let g = 0; g < 6 && chip6(/Continue/); g++) w6.tap(chip6(/Continue/));
        ok(/eleven techniques, one at a time/.test(w6.bubbles.join('\n')) && !!chip6(/Yes, I’ll use it/) && w6.live(), '⭐ Continue reaches the first technique, with its Yes/No on screen (liveness)');
        const beat6 = (t) => { const m = /\[SWML_BEAT:(\{[^}]*\})\]/.exec(String(t || '')); try { return m ? JSON.parse(m[1]) : null; } catch (e) { return null; } };
        ok(last6().indexOf('[SWML_BEAT:') === 0 && (beat6(last6()) || {}).unit === 'Technique' && (beat6(last6()) || {}).heading === 'Hooks' && last6().indexOf(TE[0].example) !== -1 && /Will you use it in your scene\?/.test(last6()),
            'technique 1: its chip ("Technique 1 of 11 · Hooks"), the rule, the example, the question', last6().slice(0, 200));
        ok(!!chip6(/Yes, I’ll use it/) && !!chip6(/Not this time/) && w6.helpChipNamed(/See another example/) && w6.helpChipNamed(/Action Hook/) && w6.helpChipNamed(/Still stuck/),
            'one tap each way (§18), with the help ladder: another example, the technique cards, Sophia last (§4c.9)');
        w6.tap(w6.helpChipNamed(/See another example/));
        ok(last6().indexOf('**Another example:**') === 0 && last6().indexOf(TE[0].more) !== -1 && w6.live() && w6.sends.length === 0, 'rung 1 serves another example and keeps the question live (no API)');
        w6.tap(chip6(/Yes, I’ll use it/));
        ok(/Where in your scene will it go/.test(last6()) && w6.live(), 'a Yes asks where, and what it does there');
        w6.say('The first line: a knock nobody answers.');
        ok(w6.rows.get(fids6[0]) === 'The first line: a knock nobody answers.', 'the answer is filed, verbatim, into the technique\'s row', w6.rows.get(fids6[0]));
        ok(last6().indexOf('**In your plan.**') === 0 && (beat6(last6().split('\n\n').slice(1).join('\n\n')) || {}).heading === 'Irony' && /You must use this one/.test(last6()) && !chip6(/Not this time/),
            '⭐ irony is COMPULSORY: it is asked where, never whether (no "Not this time")', last6().slice(0, 160));
        w6.say('At the climax the reader knows the grave is his first.');
        ok(w6.rows.get(fids6[1]) === 'At the climax the reader knows the grave is his first.', 'irony filed');
        // dialogue … suspense: say No to every optional one, answer the compulsory two
        for (let k = 2; k < TE.length; k++) {
            const t = TE[k];
            if (t.must) { w6.say('My ' + t.id + ' plan.'); ok(w6.rows.get(fids6[k]) === 'My ' + t.id + ' plan.', t.label + ' (compulsory) filed'); continue; }
            ok(/\*\*This one is recommended\.\*\* \*\*Will you use it in your scene\?\*\*/.test(last6()) === !!t.recommended,
                t.label + (t.recommended ? ': the ask says it is recommended (still a free choice)' : ': no "recommended" line'), last6().slice(-120));
            const no = chip6(/Not this time/);
            ok(!!no, t.label + ': the No is one tap', w6.chips().map((c) => c.textContent));
            if (no) w6.tap(no);
            ok(w6.rows.get(fids6[k]) === WMLC.CW_STRUCT_NOT_USING, t.label + ' declined → "' + WMLC.CW_STRUCT_NOT_USING + '" in its row', w6.rows.get(fids6[k]));
        }
        ok(last6().indexOf('**Your plan needs at least') === -1, '⭐ hooks + the three compulsory make 4: the count check passes straight to the wrap', last6().slice(0, 160));
        ok(/Your structural plan is complete\./.test(last6()) && /You are using 4 techniques/.test(last6()) && !!chip6(/Change a technique/), 'four chosen: the wrap lists the plan and keeps a way back in (§4d)', last6().slice(0, 200));
        // change one at the end: drop hooks → below the minimum → the check asks for one more
        w6.tap(chip6(/Change a technique/));
        ok(/\*\*Which technique do you want to change\?\*\*/.test(last6()) && w6.chips().length === 11, 'Change a technique: one screen of the eleven (a single choice, §4c.8)');
        w6.tap(chip6(/^Hooks$/));
        const notAfter = chip6(/Not using it after all/);
        ok(!!notAfter && /Where in your scene will it go/.test(w6.bubbles.join('\n').split('**Which technique')[1] || ''), 'changing one re-asks where, with "Not using it after all"');
        if (notAfter) w6.tap(notAfter);
        ok(w6.rows.get(fids6[0]) === WMLC.CW_STRUCT_NOT_USING && /\*\*Your plan needs at least 4 techniques\.\*\* You have 3\./.test(last6()) && w6.chips().length === 8,
            '⭐ dropping below four: the check asks for one more, from the eight not in the plan', [w6.rows.get(fids6[0]), last6().slice(0, 120), w6.chips().length]);
        w6.tap(chip6(/^Pacing$/));
        w6.say('Short sentences at the grave.');
        ok(w6.rows.get(fids6[10]) === 'Short sentences at the grave.' && /Your structural plan is complete\./.test(last6()) && /You are using 4 techniques/.test(last6()), 'added: back to four, the wrap again', last6().slice(0, 120));
        ok(w6.sends.length === 0, '⭐ the whole lesson cost NO API call (Step 27 is a no-AI workbook)');
        const asst6 = (w6.deps.canvasChatHistory || []).filter((m) => m.role === 'assistant' && !m.hidden).map((m) => m.content);
        ok(asst6.length > 10 && asst6.every((t) => OWN6.cw_step_27 && OWN6.cw_step_27(t)), '⭐ every turn the walk stores is one owns() claims (#511)', asst6.filter((t) => !(OWN6.cw_step_27 && OWN6.cw_step_27(t))).map((t) => t.slice(0, 60)));
        const seen6 = w6.bubbles.join('\n');
        ok(!LEAK_RE.test(seen6.replace(/\(sim endpoint\)/g, '')) && !INSIDER.test(seen6), 'nothing on screen names a course step, a plot, a stage or our machinery', (seen6.match(new RegExp('.{0,40}(' + LEAK_RE.source + '|' + INSIDER.source + ').{0,40}', 'i')) || [])[0]);
        // O6 · resume from the DOCUMENT alone (another device: no walk state in this browser)
        const w7 = makeWorld(CTL6, { task: 'cw_step_27', fids: fids6, ok, ls: new Map(), history: [],
            extraDeps: { _CW_TURN_OWNERS: {}, _cwDocValue: () => '', _cwLoadDocValues: () => Promise.resolve({}),
                canvasEditor: { state: { doc: { descendants(fn) { for (const [f, t] of (H6.w2 ? H6.w2.rows : new Map())) if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f }, textContent: t }, 0) === false) return; } } } } } });
        H6.w2 = w7;
        Object.assign(w7.deps.WML, { CW_STRUCT_TECHNIQUES: TE, CW_STRUCT_MIN: 4, CW_STRUCT_NOT_USING: WMLC.CW_STRUCT_NOT_USING, cwStructFid: WMLC.cwStructFid, CW_SCENE_ELEMENTS: WMLC.CW_SCENE_ELEMENTS, cwInUnit: () => true });
        if (!w7.deps.WML.techIcon) w7.deps.WML.techIcon = () => '';
        w7.rows.set(fids6[0], 'A knock.'); w7.rows.set(fids6[1], 'The grave.'); w7.rows.set(fids6[2], WMLC.CW_STRUCT_NOT_USING);
        ok(w7.ctl.tryResume() === true, 'resume with no walk state in this browser');
        await wait(600);
        const l7 = w7.bubbles[w7.bubbles.length - 1] || '';
        ok((beat6(l7) || {}).heading === 'Duality' && !!w7.chips().filter((c) => /Not this time/.test(c.textContent))[0], '⭐ the document says where they are: technique 4, Duality, with its controls', l7.slice(0, 120));
    }

    // ── P · v7.20.775 (FIXLIST #813d/#815/#815f, plan §2e.1): WHERE IS THE EXAM SCENE. Chosen at the end of lesson 3 (Neil:
    // "Before the Story Spine"), marked in lesson 4, the starting beat of lesson 5. ONE store (the locked lesson-3 row), ONE
    // parser — every reader below goes through it, so a drift between writer and readers fails here (root §5d).
    console.log('\nP · the exam scene: chosen at the end of lesson 3, marked in lesson 4, the starting beat of lesson 5');
    {
        const FOC = WMLC.CW_SCENE_FOCUS_FID, PARTS = WMLC.CW_SCENE_FOCUS_PARTS;
        // P0 · the store's write and read agree
        ok(FOC === 'cw-step-3-scene-focus' && PARTS.length === 4 && PARTS.map((p) => p.beat).join() === '3,4,5,6'
            && PARTS.map((p) => p.fid).join() === 'cw-step-3-incident,cw-step-3-goal,cw-step-3-obstacle,cw-step-3-stakes',
            'the four parts are the four dramatic components, each the seed of its Story Spine beat (3–6)');
        ok(PARTS.every((p) => WMLC.cwSceneFocusBeat(WMLC.cwSceneFocusText(p, 'their words (Beat 5 of your Story Spine, in the next lesson) “quoted”')) === p.beat)
            && WMLC.cwSceneFocusBeat('') === 0 && WMLC.cwSceneFocusBeat('Going after what they want') === 0,
            '⭐ every composed row parses back to its OWN beat (the student\'s words cannot fool it); an empty or hand-made row is "no choice"');
        ok(!LEAK_RE.test(PARTS.map((p) => WMLC.cwSceneFocusText(p, 'x')).join(' ')), 'the row a lesson-3 student reads names no course step');
        const SRC_FOC = (SRC.match(/'cw-step-3-scene-focus'/g) || []).length + (CORE.match(/'cw-step-3-scene-focus'/g) || []).length;
        ok(SRC_FOC === 1 && /const CW_SCENE_FOCUS_FID = 'cw-step-3-scene-focus';/.test(CORE), '⭐ the row id is spelled ONCE (wml-core); every writer and reader uses the constant', SRC_FOC);

        // P1 · lesson 3, driven like a student
        const CTL3 = sliceController('const _cwLoglineCtl = (function () {');
        const COMP = { 'cw-step-3-protagonist': 'Mia, 14', 'cw-step-3-flaw': 'Trusts nobody', 'cw-step-3-wound': 'Her brother was taken',
            'cw-step-3-incident': 'A boy her age is arrested in front of her', 'cw-step-3-goal': 'Get him out of the detention centre',
            'cw-step-3-obstacle': 'The sentinels who guard it', 'cw-step-3-stakes': 'If she fails, she is next' };
        const LOG = { 'cw-step-3-logline-1': 'When a boy is arrested, a girl who trusts nobody must break him out.',
            'cw-step-3-logline-2': 'Mia must free a boy before the sentinels take her too.',
            'cw-step-3-logline-3': 'A girl who trusts nobody learns to trust to save a stranger.' };
        const DECIDE = { ch: { stage: 'decide', fid: 'cw-step-3-logline-2' }, rc: true, rl: true, lrk: true };
        const L3 = (o) => {
            const fids = Object.keys(COMP).concat(Object.keys(LOG), ['cw-step-3-chosen', 'cw-step-3-chosen-idea']).concat(o.noRow ? [] : [FOC]);
            const ls = new Map();
            if (o.side) ls.set('sim_cw3', JSON.stringify(o.side));
            const w = makeWorld(CTL3, { task: 'cw_step_3', fids, ok, ls, history: [], prefill: Object.assign({}, COMP, LOG, o.prefill || {}),
                extraDeps: { _cwEnsureSceneFocusRow: () => !o.noRow } });
            Object.assign(w.deps.WML, { cwInUnit: () => !!o.unit, CW_SCENE_FOCUS_FID: FOC, CW_SCENE_FOCUS_PARTS: PARTS,
                cwSceneFocusText: WMLC.cwSceneFocusText, cwSceneFocusBeat: WMLC.cwSceneFocusBeat, cwWordTarget: () => '650–700' });
            if (!w.deps.WML.icon) w.deps.WML.icon = () => '';
            if (!w.deps.WML.phoenixIconHTML) w.deps.WML.phoenixIconHTML = () => '';
            return w;
        };
        const last = (w) => w.bubbles[w.bubbles.length - 1] || '';
        {   // the full course: Keep → the lesson ends on the logline, exactly as before
            const w = L3({ unit: false, side: DECIDE });
            w.ctl.tryResume(); await settle();
            const keep = chip(w, /Keep it — this is my logline/);
            ok(!!keep, 'fixture: resumed on the chosen-logline decision', w.chips().map(chipText));
            if (keep) w.tap(keep);
            ok(w.rows.get('cw-step-3-chosen') === LOG['cw-step-3-logline-2'] && /\(sim endpoint\)/.test(last(w)), 'full course: the logline is filed and the lesson ends there');
            ok(!w.writes.some((x) => x.fid === FOC) && !/exam scene/i.test(w.bubbles.join('\n')), '⭐ the full course never asks about an exam scene');
        }
        const w3 = L3({ unit: true, side: DECIDE });
        w3.ctl.tryResume(); await settle();
        w3.tap(chip(w3, /Keep it — this is my logline/));
        ok(w3.rows.get('cw-step-3-chosen') === LOG['cw-step-3-logline-2'], 'weekend: the logline is filed first, as before');
        ok(/Chosen Logline/.test(last(w3)) && /which part of your story your exam scene will tell/.test(last(w3)) && !/\(sim endpoint\)/.test(last(w3)) && !!chip(w3, /Continue/),
            '⭐ the lesson does not end there: one bubble (filed, and what comes next), then Continue (§4b)', last(w3).slice(-160));
        w3.tap(chip(w3, /Continue/));
        const RPT = fs.readFileSync(path.join(ROOT, 'research/sources/aqa-8700-1-jun23-examiner-report.txt'), 'utf8').replace(/\s+/g, ' ');
        const quotes = (last(w3).match(/“([^”]+)”/g) || []).map((q) => q.slice(1, -1));
        ok(quotes.length === 2 && quotes.every((q) => RPT.indexOf(q) !== -1) && /focusing upon a moment in time/.test(quotes[0]) && /a chapter or a dramatic moment in a story/.test(quotes[1]),
            '⭐ §5c-i: the examiners\' two sentences, each found word for word in the saved AQA June 2023 report', quotes.filter((q) => RPT.indexOf(q) === -1));
        w3.tap(chip(w3, /Continue/));
        ok(/\*\*A strong choice:\*\*/.test(last(w3)) && /A Christmas Carol/.test(last(w3)) && /\*\*Which part of your story will your exam scene tell\?\*\* Tap one\. You can change it later\.$/.test(last(w3)),
            'the ask: criteria first, a worked example, the question LAST (§4c)', last(w3).slice(-120));
        const opts3 = w3.chips().map(chipText);
        ok(opts3.length === 4 && PARTS.every((p, i) => opts3[i].indexOf(p.label + ': “') === 0) && opts3[1].indexOf(COMP['cw-step-3-goal']) !== -1,
            '⭐ ONE screen of four parts (a single choice, §4c.8), each showing the student\'s OWN words', opts3);
        ok(!!w3.helpChipNamed(/More examples/) && !!w3.helpChipNamed(/Story Components/) && !!w3.helpChipNamed(/Still stuck — ask Sophia/), 'the help ladder: more examples, their components, Sophia last (§4c.9)');
        ok(w3.sends.length === 0, 'making the choice costs no API call');
        const wb = w3.writes.length;
        w3.say('the second one');
        ok(w3.writes.length === wb && w3.sends.length === 0 && w3.chips().length === 4 && /Tap the part of your story/.test(last(w3)),
            '⭐ §4d: typed text is not filed and not sent — the walk points at the buttons and puts them back');
        w3.tap(w3.helpChipNamed(/More examples/));
        ok(/Macbeth/.test(last(w3)) && w3.chips().length === 4 && !w3.helpChipNamed(/More examples/), 'rung 1: more examples, once, with the four parts still on screen');
        w3.tap(w3.helpChipNamed(/Still stuck — ask Sophia/));
        const hid3 = (w3.deps.canvasChatHistory || []).filter((m) => m.hidden && /THEIR FOUR PARTS/.test(m.content)).pop();
        ok(w3.sends.length === 1 && w3.sends[0].id === 'cw3-focus-help' && !!hid3 && hid3.content.indexOf(COMP['cw-step-3-obstacle']) !== -1 && /Never choose for them/.test(hid3.content),
            'rung 3, only on its tap: ONE call, carrying their four parts, and Sophia never chooses for them', w3.sends);
        w3.resolveApi('Your goal looks strongest: one place, one night.');
        ok(w3.chips().length === 4, 'after Sophia answers, the four parts are back on screen (liveness)');
        w3.tap(chip(w3, /^Going after what they want/));
        const row3 = w3.rows.get(FOC);
        ok(row3 === WMLC.cwSceneFocusText(PARTS[1], COMP['cw-step-3-goal']) && WMLC.cwSceneFocusBeat(row3) === 4, '⭐ the pick is filed into the locked row, in the one form lessons 4 and 5 read (Beat 4)', row3);
        ok(/Your Exam Scene/.test(last(w3)) && /\(sim endpoint\)/.test(last(w3)) && !!chip(w3, /Change my exam scene/) && !w3.ctl.active, 'the lesson ends here: filed, the endpoint, and a way to change it');
        ok(!(w3.deps.canvasChatHistory || []).some((m) => m.role === 'assistant' && PARTS.some((p) => m.content.indexOf(p.label) !== -1)),
            '⭐ §4c.7: no stored turn names the chosen part (the choice can change; the document carries it)');
        w3.tap(chip(w3, /Change my exam scene/));
        ok(w3.chips().length === 4 && w3.ctl.active, 'changing it re-asks with the four parts');
        w3.tap(chip(w3, /^The ending, when everything is decided/));
        ok(WMLC.cwSceneFocusBeat(w3.rows.get(FOC)) === 6, 'a changed choice replaces the row (Beat 6)', w3.rows.get(FOC));
        {   // P2 · resume from the DOCUMENT alone (another device, or chosen before this shipped)
            const w = L3({ unit: true, prefill: { 'cw-step-3-chosen': LOG['cw-step-3-logline-1'] } });
            ok(w.ctl.tryResume() === true && w.chips().length === 4 && /Which part of your story/.test(last(w)), '⭐ logline chosen, exam scene not → the ask and its four parts come back', w.chips().map(chipText));
            ok(!(w.deps.canvasChatHistory || []).some((m) => m.role === 'assistant'), '…drawn, never stored a second time');
            w.tap(chip(w, /^The obstacle at its worst/));
            ok(WMLC.cwSceneFocusBeat(w.rows.get(FOC)) === 5, 'and the choice files from there (Beat 5)');
        }
        {
            const w = L3({ unit: true, prefill: { 'cw-step-3-chosen': LOG['cw-step-3-logline-1'], [FOC]: WMLC.cwSceneFocusText(PARTS[0], 'x') } });
            w.deps.addChatMessage('An earlier turn.', 'ai', 'An earlier turn.');
            w.ctl.tryResume();
            ok(!!chip(w, /Change my exam scene/) && !w.ctl.active, 'already chosen → after a reload the way to change it is on screen again');
        }
        {   // P3 · the row could not be found or added: refused WITH a way forward (§4d)
            const w = L3({ unit: true, noRow: true, prefill: { 'cw-step-3-chosen': LOG['cw-step-3-logline-1'] } });
            w.ctl.tryResume();
            w.tap(chip(w, /^The moment everything changes/));
            ok(!w.rows.has(FOC) && /couldn’t save that choice/.test(last(w)) && w.chips().length === 4, '⭐ not saved → it says so and keeps the four parts on screen, never a dead end');
        }

        // P4 · lesson 4 marks it: a drawn note on that beat's ask, and the beat's label in the document
        const CTL4 = sliceController('const _cwSpineCtl = (function () {');
        const B4 = { 'cw-step-4-beat1': 'At first, Mia keeps her head down at the checkpoint.', 'cw-step-4-beat2': 'And then, every day she counts the guards.', 'cw-step-4-beat3': 'Until, one morning, a boy is arrested.' };
        // the real page's bubble is a DOM node: the rig's nodes get the two DOM members the note uses (insertBefore,
        // firstChild) — everything else is the rig's own node, unchanged.
        const BASE_EL = makeWorld({ src: '({})' }, { fids: [] }).deps.el;
        const DOM_EL = function (tag, attrs) {
            const n = BASE_EL(tag, attrs);
            n.insertBefore = function (c, ref) { const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.unshift(c); else this.children.splice(i, 0, c); return c; };
            Object.defineProperty(n, 'firstChild', { get() { return this.children[0] || null; } });
            return n;
        };
        const L4 = (focusPart, prefill) => {
            const H = { w: null };
            const LBL = {}, DISP = [];
            for (let k = 1; k <= 6; k++) LBL['cw-step-4-beat' + k] = 'Beat ' + k + ': label';
            const S3 = Object.assign({}, COMP, focusPart ? { [FOC]: WMLC.cwSceneFocusText(focusPart, 'their words') } : {});
            const fids = [1, 2, 3, 4, 5, 6].map((k) => 'cw-step-4-beat' + k).concat(['cw-step-4-throughline', 'cw-step-4-unmet-needs']);
            const editor = {   // ProseMirror semantics: returning false skips a node's children, never its siblings
                state: {
                    get doc() { return { descendants(fn) { let pos = 0; for (const [f, t] of (H.w ? H.w.rows : new Map())) fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f, criteria: JSON.stringify({ label: LBL[f] || f }) }, textContent: t }, pos++); } }; },
                    get tr() { const ops = []; const tr = { ops, setNodeMarkup(pos, t, attrs) { ops.push(attrs); return tr; } }; return tr; },
                },
                view: { dispatch(tr) { DISP.push(tr.ops.length); tr.ops.forEach((a) => { LBL[a.fieldId] = JSON.parse(a.criteria).label; }); } },
            };
            const w = makeWorld(CTL4, { task: 'cw_step_4', fids, ok, ls: new Map(), history: [], prefill: Object.assign({}, B4, prefill || {}),
                extraDeps: { canvasEditor: editor, _cwStep3Value: (fid) => S3[fid] || '', _cwLoadStep3Values: () => Promise.resolve(S3), el: DOM_EL } });
            H.w = w;
            Object.assign(w.deps.WML, { cwInUnit: () => true, CW_SCENE_FOCUS_FID: FOC, cwSceneFocusBeat: WMLC.cwSceneFocusBeat });
            if (!w.deps.WML.icon) w.deps.WML.icon = () => '';
            return { w, LBL, DISP };
        };
        const note = (w) => { const c = w._lastBubbleEl && w._lastBubbleEl.children[0]; return c ? c.children.filter((x) => /swml-cw-exam-scene/.test(x.className)) : []; };
        {
            const T = L4(PARTS[1]);   // exam scene = Beat 4; the walk is AT beat 4 (beats 1–3 written)
            T.w.ctl.forceStart(); await settle(); await settle();
            ok(T.LBL['cw-step-4-beat4'] === 'Beat 4: label · ⭐ your exam scene' && ['1', '2', '3', '5', '6'].every((k) => T.LBL['cw-step-4-beat' + k] === 'Beat ' + k + ': label') && T.DISP.length === 1,
                '⭐ the document: ONLY Beat 4\'s label carries the mark, set in ONE transaction', T.LBL);
            const g = T.w.chips()[0];
            if (g) T.w.tap(g);   // the goal chip → the write-ask
            await settle(); await settle();
            const n4 = note(T.w);
            ok(/And because of this/.test(last(T.w)) && n4.length === 1 && /Your exam scene/.test(n4[0].innerHTML) && /most specific/.test(n4[0].innerHTML),
                '⭐ the chat: the exam-scene note sits on Beat 4\'s write-ask', n4.map((x) => x.innerHTML));
            ok(!(T.w.deps.canvasChatHistory || []).some((m) => /Your exam scene/.test(m.content)), '§4c.7: the note is drawn, never stored');
            ok(/\*\*Write your Beat 4\.\*\*$/.test(last(T.w)), 'the ask still ENDS on its question (§4c.4)');
        }
        {
            const T = L4(PARTS[2], {});   // exam scene = Beat 5; the walk is at Beat 4
            T.w.ctl.forceStart(); await settle(); await settle();
            const g = T.w.chips()[0]; if (g) T.w.tap(g); await settle(); await settle();
            ok(note(T.w).length === 0 && T.LBL['cw-step-4-beat5'] === 'Beat 5: label · ⭐ your exam scene', 'another beat\'s ask carries no note; the mark is on Beat 5');
        }
        {
            const T = L4(null);       // no choice (the full course, or chosen before this shipped): nothing marked
            T.w.ctl.forceStart(); await settle(); await settle();
            const g = T.w.chips()[0]; if (g) T.w.tap(g); await settle(); await settle();
            ok(note(T.w).length === 0 && T.DISP.length === 0, 'no exam-scene choice → no note and no document change at all');
        }
        {
            const T = L4(PARTS[3]);   // a CHANGED choice (now Beat 6) moves the mark off Beat 4
            T.LBL['cw-step-4-beat4'] = 'Beat 4: label · ⭐ your exam scene';
            T.w.ctl.forceStart(); await settle(); await settle();
            ok(T.LBL['cw-step-4-beat4'] === 'Beat 4: label' && T.LBL['cw-step-4-beat6'] === 'Beat 6: label · ⭐ your exam scene', '⭐ a changed choice moves the mark (the old one is removed)', T.LBL);
        }

        // P5 · lesson 5 starts from it
        {
            island.props = null;
            const W = CUR = world({ unit: true, board: 'aqa', store: { brief_outline: FULL, logline: { [FOC]: WMLC.cwSceneFocusText(PARTS[2], COMP['cw-step-3-obstacle']) } } });
            W.ctl.start(); await until(W, () => W.bubbles.length > 0);
            W.tap(chip(W, /Let’s go/)); await settle();
            for (let i = 0; i < 5 && chip(W, /Continue/); i++) { W.tap(chip(W, /Continue/)); await settle(); }
            await until(W, () => !!chip(W, /Find my dramatic situation/));
            W.tap(chip(W, /Find my dramatic situation/)); await until(W, () => W.sends.length > 0);
            const hid5 = ((W.deps.canvasChatHistory || []).filter((m) => m.hidden && /DRAMATIC SITUATION FINDER/.test(m.content)).pop() || {}).content || '';
            ok(/THE MOMENT THEY CHOSE FOR THEIR EXAM SCENE most strongly: Beat 5/.test(hid5) && hid5.indexOf(BEAT_TEXT['cw-step-4-beat5'].slice(0, 30)) !== -1 && /all three must be conflicts that happen in it/.test(hid5),
                '⭐ Sophia is asked for three situations IN the chosen moment (Beat 5), with its sentence', hid5.slice(0, 400));
            W.resolveApi('Three that fit.\n\n@POLTI_PICKS{"picks":[{"id":5,"beat":4,"roles":["On the run: Mia"]},{"id":8,"beat":2,"roles":[]}]}');
            await until(W, () => !!chip(W, /The Chase/));
            W.tap(chip(W, /The Chase →/));
            await until(W, () => /Your dramatic situation: The Chase/.test(W.bubbles.join('\n')));
            ok(/\*\*Beat 5\*\*/.test(last(W)) && /the part you chose for your exam scene in lesson 3/.test(last(W)) && /One beat is the normal choice/.test(last(W)),
                '⭐ a suggestion lands on the CHOSEN beat whatever beat the reply named; one beat is the normal choice', last(W));
            await until(W, () => { try { return JSON.parse(W.store.scene_selection_state || '{}').situation; } catch (e) { return false; } });
            ok(JSON.stringify(JSON.parse(W.store.scene_selection_state || '{}').stageIds) === '["spine-beat-5"]', '⭐ the picker will open on Beat 5', W.store.scene_selection_state);
        }
        {   // browse: no beat question at all
            island.props = null;
            const W = CUR = world({ unit: true, board: 'aqa', store: { brief_outline: FULL, logline: { [FOC]: WMLC.cwSceneFocusText(PARTS[0], 'x') } } });
            W.ctl.start(); await until(W, () => W.bubbles.length > 0);
            W.tap(chip(W, /Let’s go/)); await settle();
            for (let i = 0; i < 5 && chip(W, /Continue/); i++) { W.tap(chip(W, /Continue/)); await settle(); }
            await until(W, () => !!chip(W, /Show me all 33/));
            W.tap(chip(W, /Show me all 33/)); await settle();
            W.tap(chip(W, /^The Chase$/)); await settle();
            W.tap(chip(W, /Use this one/)); await settle();
            ok(/Your dramatic situation: The Chase/.test(last(W)) && /\*\*Beat 3\*\*/.test(last(W)) && !W.chips().some((c) => /^Beat \d:/.test(chipText(c))),
                '⭐ browsing never asks for the beat again — it is the one chosen in lesson 3 (Beat 3)', W.chips().map(chipText));
            ok(W.sends.length === 0, 'and still costs no API call');
        }
        {   // a choice whose beat is not written yet → today's flow, never a pre-select on nothing (§4d)
            island.props = null;
            const PART = Object.assign({}, BEAT_TEXT); delete PART['cw-step-4-beat6'];
            const W = CUR = world({ unit: true, board: 'aqa', store: { brief_outline: Object.assign({ 'cw-step-4-unmet-needs': 'Love & Belonging' }, PART), logline: { [FOC]: WMLC.cwSceneFocusText(PARTS[3], 'x') } } });
            W.ctl.start(); await until(W, () => W.bubbles.length > 0);
            W.tap(chip(W, /Let’s go/)); await settle();
            for (let i = 0; i < 5 && chip(W, /Continue/); i++) { W.tap(chip(W, /Continue/)); await settle(); }
            await until(W, () => !!chip(W, /Show me all 33/));
            W.tap(chip(W, /Show me all 33/)); await settle();
            W.tap(chip(W, /^The Chase$/)); await settle();
            W.tap(chip(W, /Use this one/)); await settle();
            ok(W.chips().some((c) => /^Beat \d:/.test(chipText(c))), 'chosen Beat 6 is not written → the student places the situation on a beat, as before');
        }
        island.props = null;
    }
    console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    if (fail) { console.error('❌ weekend-story-harness FAILED'); process.exit(1); }
    console.log('✅ weekend-story-harness passed (lesson 5 offers the six spine beats; the full course is untouched).');
})().catch((e) => { console.error('❌ weekend-story-harness crashed:', e && e.stack || e); process.exit(1); });
