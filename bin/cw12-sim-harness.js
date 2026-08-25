#!/usr/bin/env node
/* eslint-env node */
/**
 * cw12-sim-harness.js — BEHAVIOURAL gate for the CW Step-12 goals walk (v7.20.567, FIXLIST #440).
 *
 * Slices the REAL `_cwGoalsPlotCtl` and the REAL module helpers out of wml-assessment.js and
 * drives them on the shared rig (walk-sim-lib) — never re-typed copies (§14c). Both ISLANDS are
 * MODELLED, not stubbed: the sim captures the props the bridge hands over and calls the real
 * `onPort` / `onMap`, so what is tested is the shipped write path.
 *
 * WHAT THIS GATE IS FOR — each line was proven RED by injecting the real defect:
 *  1. ⭐⭐ BOTH PASSES APPEND, NEVER REPLACE (#374b applies to this step unchanged). Every beat in
 *     the fixture already holds the student's words; the ported line and the draft chunk land
 *     underneath, and NOT ONE write carries {replace:true}.
 *  2. ⭐ THE PROFILE IS THE ROSTER — the answered Step-11 rows, in profile order, each carrying the
 *     student's OWN words, beginning items banded to Stages I–III and end items to IV–VI.
 *  3. ⭐ THE DRAFT IS SENTENCES, and the map is what Step 13 reads: a chunk lands under its beat as
 *     `Draft 1: …`, "not in my plot yet" lands on the list row, and the ledger's draftMap carries
 *     the fid → text pairs (the MERGE contract).
 *  4. IDEMPOTENT by provenance, both passes — a re-port and a re-map file nothing new.
 *  5. RESUME: the ledger is the truth (goalsDone / draftDone), never "does the row have text" —
 *     in a world where every row legitimately has text.
 *  6. No Draft 1 → the draft pass is SKIPPED with a way forward, never a dead end.
 *  7. API budget: ZERO calls, whole walk.
 *  8. The seven wiring points name the controller (the .490 dead-walk class).
 *
 * Usage: node bin/cw12-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── SLICED SHIPPED CODE — one producer, both sides (§5d) ─────────────────────────────────────
function evalAfter(label, open, close) {
    const i = SRC.indexOf(label);
    if (i < 0) { console.error('❌ not found in wml-assessment.js: ' + label); process.exit(1); }
    // eslint-disable-next-line no-eval
    return eval('(' + braceSliceFrom(SRC, i + label.length, open || '[', close || ']').text + ')');
}
function fnFrom(name, deps) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) { console.error('❌ ' + name + ' not found — the harness would go blind'); process.exit(1); }
    const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end).replace(/^function\s+\w+/, 'function');
    const names = Object.keys(deps || {});
    // eslint-disable-next-line no-new-func
    return new Function(...names, 'return ' + body + ';')(...names.map((n) => (deps || {})[n]));
}
const ARCH = evalAfter('cwPlotArchetypes:', '{', '}');
const CW12_ITEMS = evalAfter('const CW12_ITEMS =');
const CW12_PREFIX = (SRC.match(/const CW12_PREFIX = '([^']+)'/) || [])[1];
const CW12_NOTYET_FID = (SRC.match(/const CW12_NOTYET_FID = '([^']+)'/) || [])[1];
const CW12_CONTINUITY_FID = (SRC.match(/const CW12_CONTINUITY_FID = '([^']+)'/) || [])[1];
const CW12_DRAFT_TAG = (SRC.match(/const CW12_DRAFT_TAG = '([^']+)'/) || [])[1];
ok(!!CW12_PREFIX && !!CW12_NOTYET_FID && !!CW12_CONTINUITY_FID && !!CW12_DRAFT_TAG, 'the Step-12 constants are on disk');
ok(CW12_ITEMS.length === 11 && CW12_ITEMS.filter((i) => i.band === 'begin').length === 4 && CW12_ITEMS.filter((i) => i.band === 'end').length === 7,
    'CW12_ITEMS = the 11 text rows of Step 11: 4 beginning, 7 end (the arc type is control-only and not a beat fact)');
ok(CW12_ITEMS.every((i) => /^cw-step-10-/.test(i.fid)), 'every item reads the DOCUMENT’s legacy cw-step-10- fid (#363: never renamed)');

const _cw6RowFieldId = fnFrom('_cw6RowFieldId');
const _cwNodeText = fnFrom('_cwNodeText');
const OUTLINE_CRITERIA = { cwPlotArchetypes: ARCH };
const detectBuiltPlotSlug = fnFrom('detectBuiltPlotSlug', { OUTLINE_CRITERIA });
const _cw8BandOf = fnFrom('_cw8BandOf');
const _cw8StageRoman = fnFrom('_cw8StageRoman');
const _cwPlotAssemble = fnFrom('_cwPlotAssemble', { OUTLINE_CRITERIA, _cw6RowFieldId, _cw8BandOf, _cw8StageRoman });
const _cw8EnumerateBeats = fnFrom('_cw8EnumerateBeats', { detectBuiltPlotSlug, _cwNodeText, _cwPlotAssemble });
const CW8_BANDS = evalAfter('const CW8_BANDS =', '{', '}');
const _cw12AppendLine = fnFrom('_cw12AppendLine', { CW12_PREFIX });
const _cwBeatHasTagged = fnFrom('_cwBeatHasTagged');
const _cw12BeatHasItem = fnFrom('_cw12BeatHasItem', { _cwBeatHasTagged, CW12_PREFIX });
const _cw12NoShowLine = fnFrom('_cw12NoShowLine');
const _cw12NoShowHas = fnFrom('_cw12NoShowHas');
const _cw12DraftLine = fnFrom('_cw12DraftLine', { CW12_DRAFT_TAG });
const _cw12RowHasDraftLine = fnFrom('_cw12RowHasDraftLine', { _cw12DraftLine });
const _cw12StripMachineLines = fnFrom('_cw12StripMachineLines', { CW12_DRAFT_TAG });
const CW_SENTENCE_SPLIT_RE = (function () {
    const m = SRC.match(/const CW_SENTENCE_SPLIT_RE = new RegExp\('((?:[^'\\]|\\.)*)'\);/);
    if (!m) { console.error('❌ CW_SENTENCE_SPLIT_RE not found'); process.exit(1); }
    // eslint-disable-next-line no-eval
    return new RegExp(eval("'" + m[1] + "'"));
})();
const _cwSplitSentences = fnFrom('_cwSplitSentences', { CW_SENTENCE_SPLIT_RE });
// _cwDraftProseFromDoc needs a real DOM (innerHTML parsing); the sim hands the draft box's inner
// HTML straight through, which is exactly what it returns in a browser for a draft that has text.
const DRAFT_HTML = '<p>Mara ran to the docks. The rain had not stopped for three days.</p><p>"Wait," her brother shouted. She did not turn round. The ship was already moving.</p>';
const _cwDraftProseFromDoc = function (html) { return html; };
const _cwDraftParagraphsText = fnFrom('_cwDraftParagraphsText', { _cwDraftProseFromDoc });
const outlineRowHTML = function () { throw new Error('sim: outlineRowHTML reached — the rig pre-registers every walk row'); };

// ── 0. THE PURE FUNCTIONS — byte-pairs and the sentence split ────────────────────────────────
console.log('CW STEP-12 GOALS WALK — behavioural sim (real _cwGoalsPlotCtl + real bridge)');
{
    ok(_cw12BeatHasItem('old beat\n' + _cw12AppendLine('Need', 'to be seen'), 'Need'), 'goals line round-trips compose → probe');
    ok(!_cw12BeatHasItem('a beat that mentions the Need casually', 'Need'), 'the probe needs the labelled line, not a substring');
    ok(!_cw12BeatHasItem('old beat\nValues (Need): x', 'Need'), 'a VALUES line is not a GOALS line — the two lenses cannot collide');
    ok(_cw12NoShowHas(_cw12NoShowLine('Dilemma'), 'Dilemma'), 'not-yet line round-trips');
    ok(_cw12RowHasDraftLine('their beat\n' + _cw12DraftLine('Mara ran to the docks.'), 'Mara ran to the docks.'), 'draft line round-trips');
    ok(_cw12StripMachineLines('their beat\nValues (X): a\nGoals (Need): b\nDraft 1: c') === 'their beat', 'the draft picker shows the beat WITHOUT any machine line');
    const paras = _cwDraftParagraphsText(DRAFT_HTML);
    ok(paras.length === 2 && paras[0] === 'Mara ran to the docks. The rain had not stopped for three days.', 'paragraphs come out as plain text (got ' + JSON.stringify(paras) + ')');
    const sents = _cwSplitSentences(paras);
    ok(sents.length === 5, 'the fixture splits into 5 sentences (got ' + sents.length + ': ' + JSON.stringify(sents.map((s) => s.text)) + ')');
    ok(sents[2].text === '"Wait," her brother shouted.' && sents[2].para === 1, 'a quoted opener starts a sentence, and the paragraph index travels');
    ok(_cwSplitSentences(['Mr. Birling stood up. He spoke.']).length === 2, 'an abbreviation ("Mr.") does not split');
}

const ctlIdx = SRC.indexOf('const _cwGoalsPlotCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwGoalsPlotCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

// ── THE FIXTURE — a real archetype's beat rows, a Step-11 profile, a Draft 1, a Step-9 run ───
const K = 'rags-to-riches';
const BEAT_FIDS = [];
ARCH[K].sections.forEach((sec) => {
    (sec.criteria || []).forEach((c) => {
        if (c.beatType === 'turning-point' || c.beatType === 'marker') return;
        BEAT_FIDS.push(_cw6RowFieldId(K, sec.id, c.id));
    });
});
ok(BEAT_FIDS.length > 20, K + ' has a real beat population (' + BEAT_FIDS.length + ' rows)');
const EMPTY_FID = BEAT_FIDS[3];
// The Step-11 profile — SEVEN answered rows, the rest blank (a real student stops early).
const PROFILE = {
    'cw-step-10-ext-goal-begin': 'To escape the estate and get to London before her brother finds her.',
    'cw-step-10-int-goal-begin': 'She thinks getting away will finally make her feel free.',
    'cw-step-10-need-begin': 'She needs to stop running from people who love her.',
    'cw-step-10-stakes-begin': 'Losing her freedom — being dragged back and married off.',
    'cw-step-10-dilemma': 'Board the ship and be free, or stay and face what she did. She stays.',
    'cw-step-10-realisation': 'Running was never freedom; facing it is.',
    'cw-step-10-meaning': 'Freedom that costs everyone else is not freedom.',
};
const RUN = { runStartFid: BEAT_FIDS[4], runEndFid: BEAT_FIDS[7], stageIds: [] };

const islands = { plot: null, draft: null, mounted: 0 };
let ledgerStore = null;
let artifacts = null;
function world(opts) {
    opts = opts || {};
    islands.plot = null; islands.draft = null;
    ledgerStore = opts.ledger ? JSON.parse(JSON.stringify(opts.ledger)) : {};
    artifacts = Object.assign({ draft_1: DRAFT_HTML, scene_selection_state: JSON.stringify(RUN) }, opts.artifacts || {});
    const prefill = Object.assign({}, opts.prefill || {});
    BEAT_FIDS.forEach((f) => { if (!(f in prefill)) prefill[f] = 'their beat text for ' + f; });
    if (!(EMPTY_FID in (opts.prefill || {}))) prefill[EMPTY_FID] = '';
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_step_12',
        fids: [CW12_NOTYET_FID, CW12_CONTINUITY_FID],
        prefill,
        history: opts.history || [],
        ok,
        extraDeps: Object.assign(simDeps(opts.profile === undefined ? PROFILE : opts.profile), opts.extraDeps || {}),
        externalSurface: function () { return !!(islands.plot || islands.draft); },
    }, opts.worldOpts || {}));
    wireBridge(w);
    return w;
}
function simDeps(profileMap) {
    return {
        CW12_ITEMS, CW12_PREFIX, CW12_NOTYET_FID, CW12_CONTINUITY_FID, CW12_DRAFT_TAG, CW8_BANDS,
        _cw8EnumerateBeats, _cw8StageRoman,
        _cw12AppendLine, _cwBeatHasTagged, _cw12BeatHasItem, _cw12NoShowLine, _cw12NoShowHas,
        _cw12DraftLine, _cw12RowHasDraftLine, _cw12StripMachineLines, _cwSplitSentences, _cwDraftParagraphsText,
        outlineRowHTML, _migrationActive: false,
        _cwLoadDocValues: function () { return Promise.resolve(profileMap || {}); },
    };
}
function wireBridge(w) {
    w.deps.WML.cwProject = {
        loadArtifact: function (pid, key) {
            if (key === 'cw12_goals_state') return Promise.resolve({ success: true, value: JSON.stringify(ledgerStore) });
            if (artifacts[key]) return Promise.resolve({ success: true, value: artifacts[key] });
            return Promise.resolve({ success: false });
        },
        saveArtifact: function (pid, key, val) {
            if (key === 'cw12_goals_state') ledgerStore = JSON.parse(val);
            return Promise.resolve({ success: true });
        },
    };
    w.deps.WML.icon = function () { return ''; };
    w.deps.window.WMLPlotIsland = {
        mount: function (o) {
            islands.mounted++;
            islands.plot = { props: o, port: function (p) { return o.onPort(p); }, close: function () { islands.plot = null; o.onClose(); } };
            return { unmount: function () {} };
        },
        unmount: function () {},
    };
    w.deps.window.WMLDraftMapIsland = {
        mount: function (o) {
            islands.mounted++;
            islands.draft = { props: o, map: function (p) { return o.onMap(p); }, close: function () { islands.draft = null; o.onClose(); } };
            return { unmount: function () {} };
        },
        unmount: function () {},
    };
}
const writesWithReplace = (w) => (w.writes || []).filter((x) => x.replace && x.fid !== CW12_CONTINUITY_FID);
const chipText = (c) => String(c.textContent).replace(/^✓ /, '');
const chipNamed = (w, re) => w.chips().filter((c) => re.test(chipText(c)))[0];
function tapThroughPacing(w, limit) {
    for (let g = 0; g < (limit || 12); g++) {
        const chips = w.chips();
        if (chips.length !== 1 || !/Continue/.test(String(chips[0].textContent))) return true;
        const before = w.bubbles.length;
        w.tap(chips[0]);
        ok(w.bubbles.length - before === 1, 'PACING: one bubble per Continue tap (law 4b)');
    }
    return false;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function started(w) { for (let i = 0; i < 10; i++) { await settle(); await wait(20); if (w.bubbles.length) break; } }

async function main() {

// ── 1. THE WIRING (the .490 incident class) ──────────────────────────────────────────────────
{
    ok(/state\.task === 'cw_step_12' && _cwGoalsPlotCtl\.active && _inboundIsAnswer/.test(SRC), '1 · the dispatcher arm');
    ok((SRC.match(/cw_step_12: _cwGoalsPlotCtl,/g) || []).length === 3, '2 · the revive + nudge + probe maps (three)');
    ok(/registerCwWalkCtls\(\[[^\]]*_cwGoalsPlotCtl/.test(SRC), '3 · the walk registry');
    ok(/_cwGoalsPlotCtl\.onReply\(reply\);/.test(SRC), '4 · the onReply fan-out');
    ok(/t === 'cw_step_12' \? _cwGoalsPlotCtl/.test(SRC), '5 · the start-miss fallback map');
    ok(/cwGoalsPlotCtl: _cwGoalsPlotCtl,/.test(SRC), '6 · the tp export');
    ok(/state\.task === 'cw_step_12' && !state\.reviewMode && tp\.cwGoalsPlotCtl/.test(SRC) && /tp\.cwGoalsPlotCtl\.tryResume\(\)/.test(SRC)
        && /state\.task === 'cw_step_12'\) \{[\s\S]{0,200}_cwGoalsPlotCtl\.reset\(\); _cwGoalsPlotCtl\.start\(\)/.test(SRC),
        '7 · fresh entry, boot resume AND chat-clear all start/resume the walk');
    const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
    ok(/\{ step: 12, label: 'Update Plot: Goals',\s+tier: 'si'/.test(CORE), 'Step 12 is on the SI manifest (chat + sidebar)');
    ok(/12: \[\s*\{ step: 1, label: 'Goals into Beats' \}/.test(CORE), '…with a sidebar naming its three passes');
    const proto = fs.readFileSync(path.join(ROOT, 'protocols/shared/creative-writing/CW-STEP-12-update-plot-goals.md'), 'utf8');
    ok(/ZERO API calls/.test(proto) && !/Which goals \(external and internal\) are visible in this stage/.test(proto),
        'the protocol file is the hand-over, not the old stage-by-stage workbook (retained-source law)');
    ok((CTL_SRC.src.match(/sendCanvasMessage\(\);/g) || []).length === 0, 'the controller never sends to the API');
}

// ── 2. THE FULL WALK — goals → PORT · draft → MAP · continuity · wrap ────────────────────────
{
    const w = world();
    w.ctl.start();
    await started(w);
    ok(w.bubbles.length >= 1, 'the walk said something on entry (liveness)');
    ok(/where Draft 1 fits/.test(w.bubbles[0] || ''), 'orientation chunk 1 carries the derived marker phrase');
    tapThroughPacing(w);
    const orient = w.bubbles.join('\n');
    ok(/Stages I–III/.test(orient) && /IV–VI/.test(orient), 'the orientation names the beginning / end bands');
    ok(/nothing you wrote is replaced/i.test(orient), 'the orientation states append-not-replace BEFORE the student ports');
    ok(/Not in the plot yet/.test(orient), '…and names the build list');

    // ── PASS A: the goals placer ──
    const open = chipNamed(w, /Put my goals and needs into my plot/);
    ok(!!open, 'the way in is a chip that opens the goals placer');
    w.tap(open); await settle(); await settle();
    ok(!!islands.plot, 'the plot island mounted');
    {
        const P = islands.plot.props;
        ok(P.traits.length === 7, 'the roster = the 7 ANSWERED profile rows (got ' + P.traits.length + ')');
        ok(P.traits.map((t) => t.label).join('|') === 'External goal|Internal goal|Need|Stakes|Dilemma|Realisation|Universal meaning',
            'in profile order — got ' + P.traits.map((t) => t.label).join('|'));
        const need = P.traits.filter((t) => t.label === 'Need')[0];
        ok(need.said === PROFILE['cw-step-10-need-begin'] && need.portText === need.said, 'each item carries the student’s OWN Step-11 words, and THAT is what ports');
        ok(need.bands.join(',') === 'begin', 'a beginning item offers Stages I–III only');
        ok(P.traits.filter((t) => t.label === 'Dilemma')[0].bands.join(',') === 'end', 'an end item offers Stages IV–VI only');
        ok(P.copy && P.copy.prefix === 'Goals' && P.copy.source === 'Step 11', 'the placer runs in the GOALS lens (prefix + source), not the values one');
        ok(P.stages.length === 6 && P.stages.filter((s) => s.band === 'begin').length === 3, 'every stage reaches the interface, banded 3/3');
        ok(P.stages.some((s) => s.beats.some((b) => b.id === EMPTY_FID && b.text === '')), 'an EMPTY beat is present and selectable');
    }
    const beatFid = BEAT_FIDS[0];
    const before = w.rows.get(beatFid);
    await islands.plot.port({
        picks: [{ traitId: 'need-begin', trait: 'need-begin', label: 'Need', portText: 'x', fids: [beatFid, EMPTY_FID] }],
        noShow: ['stakes-begin'],
    });
    {
        const after = w.rows.get(beatFid);
        ok(after.indexOf(before) === 0, '⭐ THE PORT APPENDS — the student’s words are still there, first, untouched');
        ok(after.indexOf(_cw12AppendLine('Need', PROFILE['cw-step-10-need-begin'])) !== -1, 'the ported line is `Goals (Need): <their Step-11 words>`');
        ok(w.rows.get(EMPTY_FID) === _cw12AppendLine('Need', PROFILE['cw-step-10-need-begin']), 'an EMPTY beat is simply started by the port');
        ok(_cw12NoShowHas(w.rows.get(CW12_NOTYET_FID), 'Stakes'), '“not in the plot yet” left its footprint on the list row');
        ok(!writesWithReplace(w).length, 'NOT ONE write used {replace:true}');
        ok(ledgerStore.goalsDone === true && Object.keys(ledgerStore.ports || {}).length === 2, 'the ledger records the pass as DONE plus both ports');
        const b2 = w.rows.get(beatFid);
        await islands.plot.port({ picks: [{ traitId: 'need-begin', trait: 'need-begin', label: 'Need', portText: 'x', fids: [beatFid] }], noShow: [] });
        ok(w.rows.get(beatFid) === b2, '⭐ a re-port is IDEMPOTENT');
    }
    islands.plot.close(); await settle(); await settle();

    // ── PASS B: the draft map ──
    const openDraft = chipNamed(w, /Place my Draft 1 into my plot/);
    ok(!!openDraft, 'closing the placer lands on the draft pass (in order, §4d)');
    ok(!!chipNamed(w, /Open the goals picker again/), '…and keeps the way back into the goals placer (#380)');
    w.tap(openDraft); await settle(); await settle(); await settle();
    ok(!!islands.draft, 'the draft island mounted');
    {
        const P = islands.draft.props;
        ok(P.sentences.length === 5 && P.sentences[0].text === 'Mara ran to the docks.', 'the draft arrives as sentences, in order');
        ok(P.beats.length === BEAT_FIDS.length, 'every beat reaches the draft picker (' + P.beats.length + ')');
        ok(P.beats.filter((b) => b.inRun).length === 4 && P.beats[4].inRun && !P.beats[3].inRun, 'the Step-9 run (4 beats) is flagged, read from scene_selection_state');
        ok(P.beats[0].text === 'their beat text for ' + BEAT_FIDS[0] && !/Goals \(/.test(P.beats[0].text), 'a beat shows the student’s OWN words only — the Goals line is stripped for the picker');
        ok(/^[IVX]+$/.test(P.beats[0].stageRoman) && P.beats[0].stageName.length > 0, 'each beat names its stage');
    }
    const target = BEAT_FIDS[5];
    const tBefore = w.rows.get(target);
    await islands.draft.map({
        chunks: [
            { from: 0, to: 1, fid: target, text: 'Mara ran to the docks. The rain had not stopped for three days.' },
            { from: 2, to: 2, fid: null, text: '"Wait," her brother shouted.' },
        ],
        unplaced: ['She did not turn round.', 'The ship was already moving.'],
    });
    {
        const tAfter = w.rows.get(target);
        ok(tAfter.indexOf(tBefore) === 0, '⭐ THE MAP APPENDS — the beat keeps the student’s planning words first');
        ok(tAfter.indexOf(_cw12DraftLine('Mara ran to the docks. The rain had not stopped for three days.')) !== -1, 'the chunk lands as a `Draft 1:` line');
        ok(_cw12RowHasDraftLine(w.rows.get(CW12_NOTYET_FID), '"Wait," her brother shouted.'), 'a chunk that fits no beat goes on the list row');
        ok(!writesWithReplace(w).length, 'still NOT ONE {replace:true} write');
        ok(ledgerStore.draftDone === true && ledgerStore.draftMap && ledgerStore.draftMap.chunks.length === 2
            && ledgerStore.draftMap.chunks[0].fid === target && /Mara ran/.test(ledgerStore.draftMap.chunks[0].text),
            '⭐ the ledger carries the MAP (fid → prose) — the contract the Draft-2 scene selection reads');
        const again = w.rows.get(target);
        await islands.draft.map({ chunks: [{ from: 0, to: 1, fid: target, text: 'Mara ran to the docks. The rain had not stopped for three days.' }], unplaced: [] });
        ok(w.rows.get(target) === again, '⭐ a re-map is IDEMPOTENT');
    }
    islands.draft.close(); await settle(); await settle();

    // ── CONTINUITY, then the WRAP ──
    ok(/read-through|contradictions/.test(w.bubbles.slice(-1)[0] || ''), 'the continuity pass is asked once, after both passes');
    ok(!!chipNamed(w, /Open the draft picker again/) && !!chipNamed(w, /Open the goals picker again/), 'both pickers stay one tap away on the continuity screen');
    w.say('Nothing — it holds together.');
    ok((w.rows.get(CW12_CONTINUITY_FID) || '').indexOf('holds together') !== -1, 'the continuity answer filed');
    const wrap = w.bubbles.slice(-1)[0] || '';
    ok(/Lens 2 of 7/.test(wrap), 'the wrap closes on the PROCESS goal ("Lens 2 of 7")');
    ok(/\*\*2\*\* beats/.test(wrap) && /Draft 1 is filed under \*\*1\*\* beat/.test(wrap), 'the wrap counts the goals beats and the draft beats from the DOCUMENT');
    ok(/Draft 2/.test(wrap) && /keep their prose/.test(wrap), 'the wrap says what Step 13 will do with the map (the MERGE)');
    ok(/sim endpoint/.test(wrap), 'the walk ends on the shared endpoint');
    ok(w.chips().length > 0, 'the finished walk still offers a way back in');
    ok(w.sends.length === 0, '⭐ API ceiling: ZERO calls across the whole walk (spent ' + w.sends.length + ')');
    ok(!w.lostWrite, 'no write targeted a row that does not exist (lost: ' + w.lostWrite + ')');
}

// ── 3. RESUME — the ledger is the truth (the ROOT-A lesson) ──────────────────────────────────
{
    const history = [{ role: 'assistant', content: 'it works out **where Draft 1 fits**', durable: true, why: 'fixture orientation' }];
    // goals done, draft NOT done, in a world where every beat row has text
    const w = world({ history, ledger: { goalsDone: true, ports: {} } });
    ok(w.ctl.tryResume() === true, 'tryResume resumes a doc that carries the walk rows');
    await started(w); await settle(); await settle();
    ok(!!chipNamed(w, /Place my Draft 1 into my plot/), 'resume lands on the DRAFT pass — read from the ledger, not from "does the row have text"');
    ok(!/where Draft 1 fits/.test(w.bubbles.slice(-1)[0] || '') || w.bubbles.length === 0, 'resume does not re-narrate the orientation');
    ok(w.sends.length === 0, 'resume spends no API calls');
    // both done → continuity is re-served with its slot armed
    const w2 = world({ history, ledger: { goalsDone: true, draftDone: true, ports: {}, draftMap: { sig: 'x', chunks: [] } } });
    w2.ctl.tryResume(); await started(w2); await settle(); await settle();
    ok(/read-through|contradictions/.test(w2.bubbles.slice(-1)[0] || ''), 'both passes done → resume lands on the continuity ask');
    w2.say('Fine.');
    ok((w2.rows.get(CW12_CONTINUITY_FID) || '') === 'Fine.', '…and the typed answer files (the slot was re-armed)');
}

// ── 4. NO DRAFT 1 → the draft pass is SKIPPED, never a dead end ──────────────────────────────
{
    const w = world({ artifacts: { draft_1: '' , scene_selection_state: '' } });
    w.ctl.start(); await started(w);
    tapThroughPacing(w);
    w.tap(chipNamed(w, /Put my goals and needs into my plot/)); await settle(); await settle();
    await islands.plot.port({ picks: [{ traitId: 'need-begin', trait: 'need-begin', label: 'Need', portText: 'x', fids: [BEAT_FIDS[0]] }], noShow: [] });
    islands.plot.close(); await settle(); await settle();
    ok(/couldn’t find a Draft 1/.test(w.bubbles.slice(-1)[0] || '') && /read-through/.test(w.bubbles.slice(-1)[0] || ''),
        'no Draft 1 → straight to continuity, and it SAYS so');
    ok(!chipNamed(w, /Open the draft picker again/), '…with no draft chip offered for a draft that does not exist');
}

// ── 5. THE GUARDS — refused, with a way forward (§4d) ────────────────────────────────────────
{
    const w = world({ profile: {} });
    w.ctl.start(); await started(w);
    ok(/can’t find your character profile/.test(w.bubbles.join('\n')), 'no-profile guard names the problem and the way back (Step 11)');
    ok(w.chips().length > 0, 'the guard leaves a chip — never a dead screen');
    ok(w.ctl.atStart() === false, 'after the guard, atStart() is false — the start-miss fallback cannot loop it');
    const w2 = makeWorld(CTL_SRC, { task: 'cw_step_12', fids: [CW12_NOTYET_FID, CW12_CONTINUITY_FID], ok, extraDeps: simDeps(PROFILE) });
    wireBridge(w2);
    w2.ctl.start(); await started(w2);
    ok(/hasn’t been built yet/.test(w2.bubbles.join('\n')), 'no-outline guard names the problem and the way back (Step 6)');
}

console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
if (fail) { console.error('❌ cw12-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw12-sim-harness passed (#440: goals placer → PORT that appends · draft map → MAP that appends and is saved · continuity · zero API).');
}

main().catch((e) => { console.error('❌ cw12-sim-harness crashed:', e && e.stack || e); process.exit(1); });
