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
 */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');
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
        ok(/\$cw_unit_polishing_lenses = \[\s*'weekend' => \[ 'cw_step_10' => 'prose_style' \],/.test(RT)
            && /if \(isset\(\$cw_unit_polishing_lenses\[\$cw_unit\]\[\$task\]\)\)/.test(RT),
            'lesson 6: the router serves weekend Step 10 the polishing stack with the prose lens');
        ok(/if \(\$cw_unit === 'weekend'\) \$parts\[\] = self::cw_weekend_unit_note\(\$context\);/.test(RT),
            'lesson 6: the unit note rides the polishing branch too (it returns before the protocol map)');
        const di6 = SRC.indexOf("if (_unitDraft && stepDef.draft === 1) info = {");
        const d6 = SRC.slice(di6, SRC.indexOf('};', di6));
        ok(di6 > 0 && /tap <strong>Sophia<\/strong>/.test(d6) && /WML\.cwWordTarget\('d1'\)/.test(d6) && /Choose Your Scene lesson/.test(d6)
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
        ok((SRC.match(/'Lesson Progress'/g) || []).length === 2, '⭐ BOTH pipelines title a weekend lesson\'s sidebar "Lesson Progress", never "Step N Progress"');
        const ui = CORE.indexOf('const CW_UNIT_SIDEBAR_STEPS = {');
        const ublock = ui > 0 ? CORE.slice(ui, CORE.indexOf('};', ui)) : '';
        ok(ui > 0 && /Your Dramatic Situation/.test(ublock) && !/Outline|\bStep \d|\bplot\b|\bstages?\b/i.test(ublock.replace(/step: \d/g, '')), 'lesson 5\'s sidebar rows are the unit\'s own words (no "Review Outline")', ublock.slice(0, 200));
        ok(/cwInUnit\(\) && CW_UNIT_SIDEBAR_STEPS\[stepKey\]/.test(CORE), 'the exercise config picks the unit rows only inside a unit lesson');
        ok(/serveCard\(s\); \} \}; \}\), 'swml-chips-grid'\)/.test(SRC) && /\.swml-quick-actions\.swml-chips-grid\s*\{[^}]*flex-wrap: wrap/.test(fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8')), 'the 33 names wrap as a grid, not one tall column');
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
    console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    if (fail) { console.error('❌ weekend-story-harness FAILED'); process.exit(1); }
    console.log('✅ weekend-story-harness passed (lesson 5 offers the six spine beats; the full course is untouched).');
})().catch((e) => { console.error('❌ weekend-story-harness crashed:', e && e.stack || e); process.exit(1); });
