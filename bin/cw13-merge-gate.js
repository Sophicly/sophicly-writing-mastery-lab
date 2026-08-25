#!/usr/bin/env node
/* eslint-env node */
/**
 * cw13-merge-gate.js — Step 13 (Scene Selection for Draft 2) transfers a drafted beat as its
 * Draft-1 PROSE and a new beat as its plan line. (v7.20.568, FIXLIST #440 — THE MERGE.)
 *
 * WHY THIS EXISTS. Neil's ruling: *"draft two needs to be an updated draft one."* The engine's
 * stated assumption (not contradicted): the transfer is a MERGE — beats already drafted keep their
 * Draft 1 prose, only new beats arrive empty. A transfer that filed the plan line for a drafted beat
 * would silently DELETE Draft 1 from Draft 2's seed, and every structural check would pass: the row
 * has text, the join has paragraphs, the artifact saves. So the merge is asserted here, on the REAL
 * factory (`makeCwSceneCtl`) driven through walk-sim-lib, with Step 12's draft map as the fixture.
 *
 * It also asserts the factory is bound correctly for BOTH steps (fids, keys, next-step wording) —
 * the refactor that made Step 13 possible must not have moved Step 9.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');
const ROOT = path.resolve(__dirname, '..');
let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg, got) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got) : ''));
    return false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the factory, sliced whole; instantiated with each step's real cfg literal ─────────────────
const fi = SRC.indexOf('function makeCwSceneCtl(cfg) {');
ok(fi > 0, 'makeCwSceneCtl exists');
const FACTORY = SRC.slice(fi, braceSliceFrom(SRC, fi, '{', '}').end);
function cfgLiteral(task) {
    const i = SRC.indexOf("task: '" + task + "', walk:");
    const start = SRC.lastIndexOf('makeCwSceneCtl({', i);
    const end = braceSliceFrom(SRC, start + 'makeCwSceneCtl('.length, '{', '}').end;
    return SRC.slice(start + 'makeCwSceneCtl('.length, end);
}
const CFG9 = cfgLiteral('cw_step_9');
const CFG13 = cfgLiteral('cw_step_13');
ok(/fidPrefix: 'cw-step-8-'/.test(CFG9) && /stateKey: 'scene_selection_state'/.test(CFG9) && /draftKey: 'scene_draft'/.test(CFG9) && /mergeFrom: null/.test(CFG9),
    'Step 9 is bound to its byte-traced keys and does NOT merge (unchanged by the refactor)');
ok(/fidPrefix: 'cw-step-13-'/.test(CFG13) && /stateKey: 'scene_selection_2_state'/.test(CFG13) && /draftKey: 'scene_draft_2'/.test(CFG13) && /mergeFrom: 'cw12_goals_state'/.test(CFG13) && /nextStep: 'Step 14'/.test(CFG13),
    'Step 13 is bound to its OWN keys, merges from Step 12\'s ledger, and names Step 14 as next');
// the greeting/intro consts the cfg literals reference
const consts = (name) => { const i = SRC.indexOf('const ' + name + ' = '); const e = SRC.indexOf('\n            const ', i + 5); return SRC.slice(i, e < 0 ? SRC.indexOf(';\n', i) + 2 : e); };
const CONSTS = ['CW9_GREETING', 'CW9_INTRO', 'CW13_GREETING', 'CW13_INTRO'].map(consts).join('\n');

// A minimal DOMParser: the walk reads the saved plot from HTML via querySelectorAll on
// [data-outline-row][data-field-id]. The fixture is built to that exact shape.
// (a CONSTRUCTOR — the walk does `new DOMParser()`; an object here throws inside its try and the
// walk reports "no written beats", which is the wrong failure to be debugging)
function FakeDOMParser() {}
FakeDOMParser.prototype.parseFromString = function (html) {
    const nodes = [];
    const re = /<div data-outline-row="true" data-field-id="([^"]+)">([\s\S]*?)<\/div>/g;
    let m;
    while ((m = re.exec(html))) nodes.push({ _fid: m[1], textContent: m[2], getAttribute(a) { return a === 'data-field-id' ? this._fid : null; } });
    return { querySelectorAll() { return nodes; } };
};
const ARCH = (() => { const i = SRC.indexOf('cwPlotArchetypes:'); return eval('(' + braceSliceFrom(SRC, i + 'cwPlotArchetypes:'.length, '{', '}').text + ')'); })();   // eslint-disable-line no-eval
const fnFrom = (name, deps) => { const i = SRC.indexOf('function ' + name + '('); const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end).replace(/^function\s+\w+/, 'function'); const names = Object.keys(deps || {}); return new Function(...names, 'return ' + body + ';')(...names.map((n) => deps[n])); };   // eslint-disable-line no-new-func
const _cw6RowFieldId = fnFrom('_cw6RowFieldId');
const K = 'rags-to-riches';
const BEATS = [];
ARCH[K].sections.forEach((sec) => (sec.criteria || []).forEach((c) => { if (c.beatType === 'turning-point' || c.beatType === 'marker') return; BEATS.push({ fid: _cw6RowFieldId(K, sec.id, c.id), label: c.label || c.id }); }));
ok(BEATS.length > 20, 'fixture archetype has beats (' + BEATS.length + ')');
const PLOT_HTML = BEATS.map((b, i) => '<div data-outline-row="true" data-field-id="' + b.fid + '">plan line ' + i + (i === 2 ? '\nDraft 1: the draft line Step 12 filed under beat 2' : '') + '</div>').join('');
const DRAFTED = { [BEATS[1].fid]: 'Mara ran to the docks. The rain had not stopped for three days.', [BEATS[2].fid]: '"Wait," her brother shouted.' };
const LEDGER12 = { goalsDone: true, draftDone: true, draftMap: { sig: 'x', chunks: Object.keys(DRAFTED).map((fid, k) => ({ from: k, to: k, fid, text: DRAFTED[fid] })) } };

function world(task) {
    const cfg = task === 'cw_step_13' ? CFG13 : CFG9;
    const src = '(function () {\n' + CONSTS + '\n' + FACTORY + '\nreturn makeCwSceneCtl(' + cfg + ');\n})()';
    const prefix = task === 'cw_step_13' ? 'cw-step-13-' : 'cw-step-8-';
    const fids = ['plot-position', 'extract-description', 'hook', 'setup', 'reaction', 'epiphany', 'proaction', 'climax', 'denouement'].map((x) => prefix + x);
    const store = { plot_outline: PLOT_HTML, cw12_goals_state: JSON.stringify(LEDGER12) };
    const w = makeWorld({ src }, {
        task, fids, ok,
        extraDeps: {
            CW12_DRAFT_TAG: 'Draft 1: ', DOMParser: FakeDOMParser,
            // svg chips append a TEXT NODE after their glyph — the rig's document lacks it
            document: { querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; }, createTextNode(t) { return { textContent: t }; } },
            OUTLINE_CRITERIA: { cwPlotArchetypes: ARCH }, _cw6RowFieldId,
            _cwWriteOutlineRowLines: function (fid, lines) { const W = CUR; if (!W.rows.has(fid)) { W.lostWrite = fid; return false; } W.rows.set(fid, lines.join('\n')); return true; },
            _setOutlineDropdown: function () { return true; }, closeCanvasOverlay: function () {}, escapeHTML: (s) => s,
            sectionHTML: () => '<section></section>', _migrationActive: false,
        },
        externalSurface: function () { return !!island.props; },
    });
    w.deps.WML.cwProject = {
        loadArtifact: (pid, key) => Promise.resolve(store[key] !== undefined ? { success: true, value: store[key] } : { success: false }),
        saveArtifact: (pid, key, val) => { store[key] = val; return Promise.resolve({ success: true }); },
    };
    w.deps.WML.icon = () => '';
    w.deps.window.WMLSceneIsland = { mount(o) { island.props = o; island.transfer = (p) => o.onTransfer(p); island.close = () => { island.props = null; o.onClose(); }; return { unmount() {} }; }, unmount() {} };
    w.store = store;
    return w;
}
const island = { props: null };
let CUR = null;
// a chip's label may live in an appended text node (svg chips), so read the children too
const chipText = (c) => String(c.textContent || '') + (c.children || []).map((x) => String(x.textContent || '')).join('');
const chip = (w, re) => w.chips().filter((c) => re.test(chipText(c)))[0];

(async function main() {
    console.log('CW STEP-13 MERGE GATE — the real factory, both bindings');
    // ── Step 13: the merge ──
    {
        const w = CUR = world('cw_step_13');
        w.ctl.start(); for (let i = 0; i < 8; i++) { await settle(); await wait(15); if (w.bubbles.length) break; }
        ok(/Step 13/.test(w.bubbles[0] || '') && /Draft 2/.test(w.bubbles[0] || ''), 'the greeting is Step 13\'s');
        w.tap(chip(w, /Let’s go/)); await settle();
        for (let i = 0; i < 4 && chip(w, /Continue/); i++) { w.tap(chip(w, /Continue/)); await settle(); }
        ok(/Draft 1 written/.test(w.bubbles.join('\n')), 'the intro names the "Draft 1 written" tag');
        w.tap(chip(w, /Choose my scene/)); for (let i = 0; i < 8; i++) { await settle(); await wait(15); if (island.props) break; }
        ok(!!island.props, 'the picker mounted');
        const beats = []; island.props.stages.forEach((s) => s.beats.forEach((b) => beats.push(b)));
        const b1 = beats.filter((b) => b.id === BEATS[1].fid)[0], b2 = beats.filter((b) => b.id === BEATS[2].fid)[0], b0 = beats.filter((b) => b.id === BEATS[0].fid)[0];
        ok(b1 && b1.prose === DRAFTED[BEATS[1].fid], '⭐ a drafted beat reaches the picker carrying its Draft-1 prose');
        ok(b0 && !b0.prose, 'an undrafted beat carries none');
        ok(b2 && !/Draft 1:/.test(b2.text) && /plan line 2/.test(b2.text), 'the picker shows the beat as PLANNED — the Draft 1: line Step 12 filed is stripped from the card');
        await island.transfer({ stageIds: [], elements: [
            { id: 'hook', beats: [{ id: BEATS[0].fid, ord: 1, label: 'x', text: b0.text }], added: [] },
            { id: 'setup', beats: [{ id: BEATS[1].fid, ord: 2, label: 'y', text: b1.text }, { id: BEATS[2].fid, ord: 3, label: 'z', text: b2.text }], added: ['a new moment'] },
            { id: 'reaction', beats: [], added: [] }, { id: 'epiphany', beats: [], added: [] }, { id: 'proaction', beats: [], added: [] }, { id: 'climax', beats: [], added: [] }, { id: 'denouement', beats: [], added: [] },
        ] });
        ok(w.rows.get('cw-step-13-hook') === 'plan line 0', 'a NEW beat transfers as its plan line');
        ok(w.rows.get('cw-step-13-setup') === DRAFTED[BEATS[1].fid] + '\n' + DRAFTED[BEATS[2].fid] + '\na new moment',
            '⭐⭐ THE MERGE: drafted beats transfer as their Draft-1 PROSE, never the plan line, added moments after', w.rows.get('cw-step-13-setup'));
        ok(/2 of them arrived with your Draft 1 prose already in/.test(w.bubbles.join('\n')), 'the transfer report counts the merged beats (the Scene Overview ask follows it)');
        ok(!w.lostWrite, 'every write hit a cw-step-13-* row (no cw-step-8- leak)', w.lostWrite);
        ok(!!w.store.scene_selection_2_state, 'state persisted under scene_selection_2_state, not Step 9\'s key');
        ok(w.sends.length === 0, 'zero API calls');
    }
    // ── Step 9: unchanged — no merge even with a draft map present ──
    {
        const w = CUR = world('cw_step_9');
        w.ctl.start(); for (let i = 0; i < 8; i++) { await settle(); await wait(15); if (w.bubbles.length) break; }
        ok(/Step 9/.test(w.bubbles[0] || ''), 'Step 9 greets as Step 9');
        w.tap(chip(w, /Let’s go/)); await settle();
        for (let i = 0; i < 4 && chip(w, /Continue/); i++) { w.tap(chip(w, /Continue/)); await settle(); }
        w.tap(chip(w, /Choose my scene/)); for (let i = 0; i < 8; i++) { await settle(); await wait(15); if (island.props) break; }
        const beats = []; island.props.stages.forEach((s) => s.beats.forEach((b) => beats.push(b)));
        ok(beats.every((b) => !b.prose), 'Step 9 stamps no prose (mergeFrom is null)');
        await island.transfer({ stageIds: [], elements: [{ id: 'hook', beats: [{ id: BEATS[1].fid, ord: 1, label: 'y', text: 'plan line 1' }], added: [] }, { id: 'setup', beats: [], added: [] }, { id: 'reaction', beats: [], added: [] }, { id: 'epiphany', beats: [], added: [] }, { id: 'proaction', beats: [], added: [] }, { id: 'climax', beats: [], added: [] }, { id: 'denouement', beats: [], added: [] }] });
        ok(w.rows.get('cw-step-8-hook') === 'plan line 1', 'Step 9 transfers the plan line (no merge), into cw-step-8-* rows');
        ok(!!w.store.scene_selection_state && !w.store.scene_selection_2_state, 'Step 9 persists under its own key only');
    }
    // ── the Draft-2 seed reads the right keys ──
    {
        const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
        ok(/CW_SEED_FROM = \{ 10: 'scene_draft', 14: 'scene_draft_2' \}/.test(CORE), 'Step 14 is seeded from scene_draft_2');
        ok(!/CW_DRAFT_PREDECESSOR = \{[^}]*\b14:/.test(CORE), '…and is NOT in CW_DRAFT_PREDECESSOR (whole-doc replace would clobber the seed)');
        ok(/seedKey === 'scene_draft_2' \? 'scene_selection_2' : 'scene_selection'/.test(SRC), 'the seed fallback reads the Step-13 document for scene_draft_2');
    }
    console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    if (fail) { console.error('❌ cw13-merge-gate FAILED'); process.exit(1); }
    console.log('✅ cw13-merge-gate passed (a drafted beat transfers as its Draft-1 prose; Step 9 is untouched).');
})().catch((e) => { console.error('❌ cw13-merge-gate crashed:', e && e.stack || e); process.exit(1); });
