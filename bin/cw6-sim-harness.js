#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-sim-harness.js — BEHAVIOURAL gate for the CW Step-6 outline walk (v7.20.296).
 *
 * The static harness (cw6-outline-harness.js) guards the CONTRACT — ids, symbols, coverage.
 * This drives the MACHINE. It slices the REAL `_cwOutlineCtl` IIFE out of wml-assessment.js and
 * runs it against the REAL archetype templates with stubbed I/O, so what is asserted here is the
 * shipped code, not a re-implementation of it (feedback_negative_test_must_fail_for_the_right_reason:
 * a test that exercises a copy proves nothing about the copy that ships).
 *
 * Same reasoning as bin/ladder-sim-harness.js, and the same reason it exists: WML CLAUDE.md
 * pre-ship 0b — "a syntax/scope-clean file can still be logically wrong. DRIVE that path once."
 * Neil cannot afford ~100 taps × 8 structures of manual testing, so the machine does it.
 *
 * What it drives, per archetype (all eight):
 *   • a FULL run — answer every ask in order until the walk finishes
 *   • the API BUDGET — exactly 5 inter-stage micro-checks + 1 finish check, and NOT ONE MORE
 * (Stage VI has no next stage to cause, so its check rolls into the finish check — 6 calls, not 7.)
 *   • the ANCHORS — Step-4 Beat 1/Beat 6 echoed, confirmed by chip, filed without a re-ask
 *   • every answer lands in the RIGHT row, and the row is auto-TICKED
 *   • ordering — the frame rows lead each stage; turning points/markers are never asked
 *   • RESUME from every position: rebuild from the doc and continue without repeating or skipping
 *   • the fail-open paths — a dropped @STAGE_GAP / @OUTLINE_GAP marker must not strand the student
 *
 * Usage: node bin/cw6-sim-harness.js [archetype-key]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSESS = path.join(ROOT, 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(ASSESS, 'utf8');
// v7.20.340: the shipped answer slot + no-ask guard + last-assistant probe, not stand-ins.
const { attachLiveChipsDeps, attachSlotDeps } = require('./walk-sim-lib');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── slice helpers ────────────────────────────────────────────────────────────────────────
function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    let d = 0;
    for (let k = start; k < s.length; k++) {
        const c = s[k];
        if (c === open) d++;
        else if (c === close) { d--; if (d === 0) return { text: s.slice(start, k + 1), end: k + 1 }; }
        else if (c === '/' && s[k + 1] === '/') {
            // A LINE COMMENT. Skipping these is not tidiness: an apostrophe in ordinary prose
            // ("the dropdown's saved selection") reads as an opening quote to the scanner below and
            // swallows the rest of the file, so the slice silently returns null.
            while (k < s.length && s[k] !== '\n') k++;
        }
        else if (c === '/' && s[k + 1] === '*') { k += 2; while (k < s.length && !(s[k] === '*' && s[k + 1] === '/')) k++; k++; }
        else if (c === '"' || c === "'" || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return null;
}
function evalObjectAfter(label) {
    const i = src.indexOf(label);
    if (i < 0) throw new Error('not found: ' + label);
    const sl = braceSliceFrom(src, i + label.length, '{', '}');
    // eslint-disable-next-line no-eval
    return eval('(' + sl.text + ')');
}

const ARCH = evalObjectAfter('cwPlotArchetypes:');
const CW6_FRAME_ROWS = evalObjectAfter('const CW6_FRAME_ROWS =');

// The real _cw6FrameRowsFor + _cw6RowFieldId, sliced (never re-typed — a divergent copy here
// would hide exactly the key-match bug the harness exists to prevent).
function sliceFn(name) {
    const i = src.indexOf('function ' + name + '(');
    if (i < 0) throw new Error('function not found: ' + name);
    const body = braceSliceFrom(src, i, '{', '}');
    return src.slice(i, body.end);
}
// eslint-disable-next-line no-new-func
const _cw6RowFieldId = new Function('return ' + sliceFn('_cw6RowFieldId').replace(/^function\s+\w+/, 'function') + ';')();
// eslint-disable-next-line no-new-func
const _cw6FrameRowsFor = new Function('return ' + sliceFn('_cw6FrameRowsFor').replace(/^function\s+\w+/, 'function') + ';')();

// The controller itself.
const ctlIdx = src.indexOf('const _cwOutlineCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwOutlineCtl not found in wml-assessment.js'); process.exit(1); }
const ctlBody = braceSliceFrom(src, ctlIdx, '(', ')');   // the (function(){…}) expression
const CTL_SRC = ctlBody.text + '()';

// The concept map, loaded the same way the browser does.
const conceptsSandbox = { window: {} };
// eslint-disable-next-line no-new-func
new Function('window', fs.readFileSync(path.join(ROOT, 'frontend', 'wml-cw6-concepts.js'), 'utf8'))(conceptsSandbox.window);

// ── the simulated world ──────────────────────────────────────────────────────────────────
function makeWorld(archKey, opts) {
    opts = opts || {};
    const rows = new Map();          // fieldId → text        (the "document")
    const ticks = new Set();         // fieldIds auto-ticked
    const bubbles = [];              // AI turns, in order
    const users = [];                // student turns, in order
    const sends = [];                // API round-trips: {id, hiddenCtx}
    const substeps = [];             // applyCwSubstepProgress calls
    const ls = new Map();
    let armed = null;                // the pending armWalkResume hook

    // The doc pre-seeded exactly as buildCWPlotOutlineSection would build it: every askable row
    // and every frame row exists and is EMPTY. (A row the builder never made is the heal's job,
    // covered by the static harness.)
    const order = [];
    ARCH[archKey].sections.forEach((sec) => {
        _cw6FrameRowsFor(sec.id).forEach((fr) => { const f = _cw6RowFieldId(archKey, sec.id, fr); rows.set(f, ''); order.push(f); });
        sec.criteria.forEach((c) => {
            if (c.beatType === 'turning-point' || c.beatType === 'marker') return;   // divider, no row
            const f = _cw6RowFieldId(archKey, sec.id, c.id);
            rows.set(f, ''); order.push(f);
        });
    });
    (opts.prefill || []).forEach((f) => rows.set(f, 'pre-existing answer'));

    const world = { rows, ticks, bubbles, users, sends, substeps, order, get armed() { return armed; } };

    const deps = {
        // ── chat surface ──
        chatMessages: { get lastElementChild() { return world._lastBubbleEl; } },
        chatTextarea: { value: '' },
        chatSendBtn: { style: {} },
        addChatMessage: function (html, who, plain) { if (who === 'user') users.push(html); },
        canvasChatHistory: [],
        saveCanvasChat: function () {},
        canvasChatId: 'sim',
        formatAI: function (t) { return t; },
        // A DOM stub good enough for the chip/help bars: every bubble gets one .swml-quick-actions.
        el: function (tag, attrs) {
            const node = {
                tag: tag, attrs: attrs || {}, children: [], className: (attrs && attrs.className) || '',
                textContent: (attrs && attrs.textContent) || '',
                appendChild: function (c) { this.children.push(c); return c; },
                remove: function () {},
                querySelector: function (sel) { return findIn(this, sel); },
                addEventListener: function () {},
                setAttribute: function () {}, getAttribute: function () { return null; },
                closest: function () { return null; },
            };
            return node;
        },
        state: { task: 'cw_step_6', cwProjectId: 'cwp_sim' },
        // ── document ──
        canvasEditor: { state: { doc: { descendants: function (fn) {
            for (const [f, t] of rows) { if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f }, textContent: t }, 0) === false) break; }
        } } } },
        _writeOutlineRowField: function (fid, text, o) {
            if (!rows.has(fid)) { world.lostWrite = fid; return false; }
            const prev = rows.get(fid);
            rows.set(fid, (!prev || (o && o.replace)) ? text : prev + '\n\n' + text);
            return true;
        },
        _tickOutlineRow: function (fid) { if (!rows.has(fid)) { world.lostTick = fid; return false; } ticks.add(fid); return true; },
        _tickRowLikeAStudent: function (fid) { if (!fid) return false; world.ticked = world.ticked || new Set();
            if (world.ticked.has(fid)) return true;
            var pre = fid.indexOf('cw-step-2-idea') === 0 ? 'cw-step-2-idea' : (fid.indexOf('cw-step-3-logline-') === 0 ? 'cw-step-3-logline-' : null);
            if (pre) Array.from(world.ticked).forEach(function (t) { if (t.indexOf(pre) === 0 && t !== fid) world.ticked.delete(t); });
            world.ticked.add(fid); return true; },
        _cwLoadStep3Values: function () { return Promise.resolve({}); },
        _cwStep3Value: function () { return ''; },
        armCwWalkHandoff: function () { return true; },
        consumeCwWalkHandoff: function () { return null; },
        cwEndpointLine: function () { return '\n\n---\n\n**That\u2019s this step done.** (sim endpoint)'; },
        saveCanvasContent: function () {},
        CANVAS_SAVE_KEY: function () { return 'sim'; },
        // ── prior-step artifacts ──
        _cwDocValue: function (artifact, fid) {
            if (opts.noSpine) return '';
            if (artifact === 'brief_outline' && fid === 'cw-step-4-beat1') return 'At first, a boy counts the days on his bedroom wall.';
            if (artifact === 'brief_outline' && fid === 'cw-step-4-beat6') return 'Until finally, he opens the door himself.';
            if (artifact === 'logline') return 'A boy who cannot ask for help must cross a city to reach his brother.';
            return '';
        },
        _cwLoadDocValues: function () { return Promise.resolve({}); },
        CW_STEP4_SPINE: [{ fid: 'cw-step-4-beat1', label: 'Beat 1' }, { fid: 'cw-step-4-beat6', label: 'Beat 6' }],
        // ── template + id layer (the REAL ones) ──
        OUTLINE_CRITERIA: { cwPlotArchetypes: ARCH },
        CW6_FRAME_ROWS: CW6_FRAME_ROWS,
        _cw6FrameRowsFor: _cw6FrameRowsFor,
        _cw6RowFieldId: _cw6RowFieldId,
        detectBuiltPlotSlug: function () { return archKey; },
        resolvePlotStructureSlug: function (v) { return v; },
        // ── paced chunks: the sim taps Continue instantly ──
        serveCwChunks: function (chunks, o) {
            chunks.forEach(function (c) { o.emit(c); });
            if (o.onDone) o.onDone();
            return { reattach: function () {}, index: chunks.length };
        },
        // ── the API boundary ──
        armWalkResume: function (id, fn) { armed = { id: id, fn: fn }; },
        sendCanvasMessage: function () {
            const h = deps.canvasChatHistory[deps.canvasChatHistory.length - 1];
            sends.push({ id: armed ? armed.id : '(none)', hidden: h && h.hidden ? h.content : null });
            deps.canvasSilentSend = false;
        },
        canvasSilentSend: false,
        applyCwSubstepProgress: function (d) { substeps.push(d); },
        showGuidePanel: function () {},
        // v7.20.331: the REAL bubble-control kinds, sliced from source. Bars declare a kind so
        // that different kinds coexist on one bubble instead of silently blocking each other.
        BUBBLE_CONTROL_KINDS: (function () {
            const i = src.indexOf('const BUBBLE_CONTROL_KINDS =');
            if (i < 0) throw new Error('BUBBLE_CONTROL_KINDS not found — the one-owner primitive is gone');
            // eslint-disable-next-line no-eval
            return eval('(' + braceSliceFrom(src, i, '{', '}').text + ')');
        })(),
        // ── environment ──
        localStorage: { getItem: function (k) { return ls.has(k) ? ls.get(k) : null; }, setItem: function (k, v) { ls.set(k, v); }, removeItem: function (k) { ls.delete(k); } },
        window: { WML_CW6_CONCEPTS: conceptsSandbox.window.WML_CW6_CONCEPTS, WML: {}, SophiclyTable: null, _wmlCwPlotStructure: {} },
        document: { querySelector: function () { return null; }, querySelectorAll: function () { return []; } },
        setTimeout: function (fn) { fn(); return 0; },
        console: { log: function () {}, warn: function (m) { world.warns = (world.warns || []).concat([String(m)]); } },
    };

    function findIn(node, sel) {
        if (!node || !node.children) return null;
        for (const c of node.children) {
            if (c.className && ('.' + String(c.className).split(' ').join('.')).indexOf(sel) !== -1) return c;
            const d = findIn(c, sel);
            if (d) return d;
        }
        return null;
    }
    // Every aiBubble() appends to chatMessages.lastElementChild, so hand it a fresh bubble whose
    // .swml-bubble-content collects the chip bar the controller attaches.
    const origAdd = deps.addChatMessage;
    attachLiveChipsDeps(deps);   // must precede the slot lift (both are module-scope primitives)
    attachSlotDeps(deps);
    deps.addChatMessage = function (html, who, plain) {
        if (who !== 'user') {
            bubbles.push(plain || html);
            const content = deps.el('div', { className: 'swml-bubble-content' });
            world._lastBubbleEl = { children: [content], querySelector: function (s) { return s.indexOf('bubble-content') !== -1 ? content : findIn(this, s); } };
        }
        origAdd(html, who, plain);
    };

    const names = Object.keys(deps);
    // eslint-disable-next-line no-new-func
    const factory = new Function(names.join(','), 'return ' + CTL_SRC + ';');
    world.ctl = factory.apply(null, names.map(function (n) { return deps[n]; }));
    world.deps = deps;
    // The chip bar most recently attached, so the sim can "tap" it.
    world.chips = function () {
        const bar = world._lastBubbleEl && world._lastBubbleEl.children[0]
            && world._lastBubbleEl.children[0].children.filter(function (c) { return String(c.className).indexOf('swml-quick-actions') !== -1; })[0];
        return bar ? bar.children.map(function (b) { return b; }) : [];
    };
    world.tap = function (labelPart) {
        const btn = world.chips().filter(function (b) { return String(b.textContent).indexOf(labelPart) !== -1; })[0];
        if (!btn) return false;
        const h = btn.attrs && btn.attrs.onClick;
        if (!h) return false;
        h();
        return true;
    };
    world.resolveApi = function (reply) {
        if (!armed) return false;
        const fn = armed.fn; armed = null;
        fn(reply, {});
        return true;
    };
    return world;
}

// ── the runs ─────────────────────────────────────────────────────────────────────────────
const KEYS = process.argv[2] ? [process.argv[2]] : Object.keys(ARCH);
console.log('CW STEP-6 OUTLINE WALK — behavioural sim (real _cwOutlineCtl, real templates)');

// startWalk() waits on the prior-step artifact loads before its first serve, so the sim has to let
// the microtask queue drain — exactly as the browser does.
const tick = () => new Promise(function (r) { setImmediate(r); });

async function main() {
for (const k of KEYS) {
    const w = makeWorld(k);
    const expectAsks = w.order.length;

    w.ctl.forceStart();
    await tick();
    ok(w.ctl.active, k + ': walk did not become active on forceStart');
    ok(w.bubbles.length >= 4, k + ': orientation was not served as paced chunks (got ' + w.bubbles.length + ' bubbles)');

    // Drive the whole run. Guard generously above the real ask count so a stall is a failure, not a hang.
    let answered = 0, guard = 0, stageChecks = 0, finishChecks = 0;
    while (guard++ < expectAsks * 4) {
        if (w.armed) {
            // A judgment call is in flight — clear it the way a healthy reply would.
            if (/^cw6-stage-/.test(w.armed.id)) { stageChecks++; w.resolveApi('That stage travels.\n\n@STAGE_OK'); continue; }
            if (w.armed.id === 'cw6-finish') { finishChecks++; w.resolveApi('The mirror lands.\n\n@OUTLINE_OK'); continue; }
            w.resolveApi('ok'); continue;
        }
        // An anchor confirm is a chip, not a typed turn.
        if (w.tap('still right')) { answered++; continue; }
        if (!w.ctl.active) break;
        w.ctl.handleTurn('answer ' + answered);
        answered++;
    }

    const filled = [...w.rows.values()].filter(function (t) { return t; }).length;
    ok(filled === expectAsks, k + ': ' + filled + '/' + expectAsks + ' rows filled at the end of a full run');
    ok(w.ticks.size === expectAsks, k + ': ' + w.ticks.size + '/' + expectAsks + ' rows auto-ticked');
    ok(!w.lostWrite, k + ': a write targeted a row that does not exist — ' + w.lostWrite);
    ok(!w.lostTick, k + ': a tick targeted a row that does not exist — ' + w.lostTick);

    // ⭐ THE API BUDGET. This is the whole point of the design (Neil: "I really need to avoid
    // unnecessary API calls"). Exactly 6 stage micro-checks + 1 finish check for ~100 asks.
    ok(stageChecks === 5, k + ': expected 5 inter-stage micro-checks (one after each of stages I-V; stage VI rolls into the finish check), got ' + stageChecks);
    ok(finishChecks === 1, k + ': expected exactly 1 finish check, got ' + finishChecks);
    ok(w.sends.length === stageChecks + finishChecks, k + ': ' + w.sends.length + ' API round-trips for ' + expectAsks
        + ' asks — expected ' + (stageChecks + finishChecks) + '. Every beat must be answered with NO round-trip.');

    // The anchors carry the Step-4 spine, verbatim, without a re-ask (the paste-wall law).
    const openFid = _cw6RowFieldId(k, 'setup', 'story_open');
    const closeFid = _cw6RowFieldId(k, 'aftermath', 'story_close');
    ok(/counts the days/.test(w.rows.get(openFid) || ''), k + ': Step-4 Beat 1 was not echoed into story_open');
    ok(/opens the door/.test(w.rows.get(closeFid) || ''), k + ': Step-4 Beat 6 was not echoed into story_close');
    ok(!w.bubbles.some(function (b) { return /paste|copy out|type out your Beat/i.test(b); }), k + ': an ask demanded content the session already holds');

    // Frame rows lead their stage, and no divider was ever asked.
    const secIds = ARCH[k].sections.map(function (s) { return s.id; });
    secIds.forEach(function (sid) {
        const first = w.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, sid, '')) === 0; })[0];
        ok(/-stage_arc$|-story_open$|-story_close$/.test(first), k + '/' + sid + ': the stage does not lead with a frame row (' + first + ')');
    });
    const dividerAsked = ARCH[k].sections.some(function (sec) {
        return sec.criteria.some(function (c) {
            return (c.beatType === 'turning-point' || c.beatType === 'marker') && w.rows.has(_cw6RowFieldId(k, sec.id, c.id));
        });
    });
    ok(!dividerAsked, k + ': a turning-point/marker was treated as an askable row');

    // The sidebar was stamped once per stage, in order, plus the wrap.
    const nums = w.substeps.map(function (s) { return s.substepNum; });
    ok(nums.length === 7 && nums.join(',') === '1,2,3,4,5,6,7', k + ': sidebar substeps were ' + nums.join(',') + ' — expected 1..7');
    ok(/complete plot outline/i.test(w.bubbles[w.bubbles.length - 1] || ''), k + ': the run did not end on the wrap');
    ok(!w.ctl.active, k + ': the walk is still active after the wrap');
}

// ── RESUME: from every position, rebuild from the doc and continue exactly once. ──────────
(function resumeSweep() {
    const k = 'rags-to-riches';           // Neil's own prod project structure
    const probe = makeWorld(k);
    const total = probe.order.length;
    let bad = 0;
    // Sample rather than all 104 (each resume drives the rest of the run): first, last, and a
    // stride across every stage boundary, which is where the state machine can slip.
    const points = [0, 1, 2, 15, 16, 40, 60, 80, total - 2, total - 1];
    points.forEach(function (n) {
        const w = makeWorld(k, { prefill: probe.order.slice(0, n) });
        w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
        const resumed = w.ctl.tryResume();
        if (n >= total) return;
        if (!ok(resumed, 'resume@' + n + ': tryResume() returned false with ' + (total - n) + ' rows still empty')) { bad++; return; }
        // It must continue at row n — never repeat a filled row, never skip an empty one.
        let guard = 0;
        while (guard++ < total * 4) {
            if (w.armed) { w.resolveApi(/^cw6-stage-/.test(w.armed.id) ? '@STAGE_OK' : '@OUTLINE_OK'); continue; }
            if (w.tap('still right')) continue;
            if (!w.ctl.active) break;
            w.ctl.handleTurn('resumed answer');
        }
        const filled = [...w.rows.values()].filter(function (t) { return t; }).length;
        if (!ok(filled === total, 'resume@' + n + ': finished with ' + filled + '/' + total + ' rows filled')) bad++;
        if (!ok(!w.lostWrite, 'resume@' + n + ': write to a non-existent row ' + w.lostWrite)) bad++;
    });
    if (!bad) console.log('   ✓ resume from ' + points.length + ' positions: each rebuilt from the doc and completed the run');
})();

// ── v7.20.298: NO SIDECAR AT ALL — the prod defect that cost uid 1330 twelve answers. ──────
// The walk used to `return false` the moment localStorage held nothing, even though the
// document already knew the position. The student's typed answers then fell through to the
// AI, which files nothing. A wiped sidecar must resume from the DOCUMENT and finish the run.
(function resumeWithNoSidecar() {
    const k = 'rags-to-riches';
    const probe = makeWorld(k);
    const total = probe.order.length;
    let bad = 0;
    [0, 16, 60, total - 1].forEach(function (n) {
        const w = makeWorld(k, { prefill: probe.order.slice(0, n) });
        // Deliberately write NOTHING to localStorage — a new device / cleared storage.
        if (!ok(w.deps.localStorage.getItem('sim_cw6') === null, 'no-sidecar@' + n + ': sidecar should be absent')) bad++;
        if (!ok(w.ctl.tryResume(), 'no-sidecar@' + n + ': tryResume() must rebuild from the doc, not bail')) { bad++; return; }
        let guard = 0;
        while (guard++ < total * 4) {
            if (w.armed) { w.resolveApi(/^cw6-stage-/.test(w.armed.id) ? '@STAGE_OK' : '@OUTLINE_OK'); continue; }
            if (w.tap('still right')) continue;
            if (!w.ctl.active) break;
            w.ctl.handleTurn('resumed answer');
        }
        const filled = [...w.rows.values()].filter(function (t) { return t; }).length;
        if (!ok(filled === total, 'no-sidecar@' + n + ': finished with ' + filled + '/' + total + ' rows filled')) bad++;
        if (!ok(!w.lostWrite, 'no-sidecar@' + n + ': write to a non-existent row ' + w.lostWrite)) bad++;
    });
    if (!bad) console.log('   ✓ wiped sidecar: resumed from the document at 4 positions and completed the run');
})();

// ── FAIL-OPEN: a dropped marker must never strand the student. ────────────────────────────
(function failOpen() {
    const k = 'tragedy';
    const probe = makeWorld(k);
    // Park one row short of the end, then let the finish check come back with NOTHING.
    const w = makeWorld(k, { prefill: probe.order.slice(0, probe.order.length - 1) });
    w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
    w.ctl.tryResume();
    w.ctl.handleTurn('the last beat');
    ok(!!w.armed && w.armed.id === 'cw6-finish', 'fail-open: the finish check did not fire on the last row');
    w.resolveApi(null);                                     // the call failed / timed out
    ok(/complete plot outline/i.test(w.bubbles[w.bubbles.length - 1] || ''), 'fail-open: a failed finish check did not fall through to the wrap');
    ok(!w.ctl.active, 'fail-open: the walk is still active after a failed finish check');

    // And a stage check that comes back empty must move on, not sit on a revision prompt.
    const p2 = makeWorld(k);
    const stage0 = p2.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, 'setup', '')) === 0; });
    const w2 = makeWorld(k, { prefill: stage0.slice(0, stage0.length - 1) });
    w2.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
    w2.ctl.tryResume();
    w2.ctl.handleTurn('last beat of stage I');
    ok(!!w2.armed && /^cw6-stage-0$/.test(w2.armed.id), 'fail-open: the stage-I micro-check did not fire when the stage completed');
    w2.resolveApi(null);
    ok(w2.ctl.active, 'fail-open: a failed stage check left the walk inert instead of continuing');
    ok(w2.bubbles.some(function (b) { return /Dream Stage/i.test(b); }), 'fail-open: the walk did not move on to Stage II');
})();

// ── The GAP path ends in a real revision (the .294 lesson: never ask a question we ignore). ──
(function gapPath() {
    const k = 'heros-journey';
    const probe = makeWorld(k);
    const stage0 = probe.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, 'setup', '')) === 0; });
    const w = makeWorld(k, { prefill: stage0.slice(0, stage0.length - 1) });
    w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
    w.ctl.tryResume();
    w.ctl.handleTurn('last beat of stage I');
    w.resolveApi('Does he actually change here?\n\n@STAGE_GAP');
    ok(w.tap('Sharpen'), 'gap path: no "Sharpen this stage’s arc" chip was offered');
    const arcFid = _cw6RowFieldId(k, 'setup', 'stage_arc');
    const before = w.rows.get(arcFid);
    w.ctl.handleTurn('He starts counting days and ends up holding the door handle.');
    const after = w.rows.get(arcFid);
    ok(after !== before, 'gap path: the rewritten arc never reached the document');
    ok(after.indexOf(before) === -1 || before === '', 'gap path: the rewrite APPENDED instead of REPLACING — that is the .289 logline bug (a rewrite cycle must replace)');
    ok(/holding the door handle/.test(after), 'gap path: the document does not hold the student’s new arc');
})();

// ── No Step-4 spine: ask for the anchor, never a dead confirm chip. ───────────────────────
await (async function noSpine() {
    const w = makeWorld('the-quest', { noSpine: true });
    w.ctl.forceStart();
    await tick();
    ok(!w.tap('still right'), 'no-spine: a confirm chip was offered with nothing to confirm');
    ok(/where does your story open/i.test(w.bubbles[w.bubbles.length - 1] || ''), 'no-spine: the walk did not fall back to asking for the opening directly');
    w.ctl.handleTurn('A boy counts the days on his wall.');
    ok(/counts the days/.test(w.rows.get(_cw6RowFieldId('the-quest', 'setup', 'story_open')) || ''), 'no-spine: the typed anchor was not filed');
})();

console.log('   ' + asserts.pass + ' behavioural assertions passed'
    + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : '') + ' across ' + KEYS.length + ' archetype(s)');
if (fail) { console.error('\ncw6-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw6-sim-harness passed (real controller, real templates, 6-call API budget held).');
}

main().catch(function (e) { console.error('cw6-sim-harness threw —', e && e.stack || e); process.exit(1); });
