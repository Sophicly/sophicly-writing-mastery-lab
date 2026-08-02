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
        // v7.20.405: the stage-I/VI opening recap (three-turn opening, audit ruling A3 turn 1).
        if (w.tap('That’s it')) { continue; }
        // v7.20.368: so is the Step-4 CARRY confirm on the real first/last beat.
        if (w.tap('Use this')) { answered++; continue; }
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
    // v7.20.368 — the phantom story_open / story_close rows are GONE (Neil asked five times).
    // The Step-4 spine now carries into the REAL beats: Stage I's first, Stage VI's last. These
    // assertions moved with it, so the gate still proves the carry happens — and additionally
    // proves the old duplicate rows never come back.
    ok(!w.rows.has(_cw6RowFieldId(k, 'setup', 'story_open')), k + ': the story_open duplicate row is back');
    ok(!w.rows.has(_cw6RowFieldId(k, 'aftermath', 'story_close')), k + ': the story_close duplicate row is back');
    const firstBeat = w.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, 'setup', '')) === 0 && !/-stage_arc$/.test(f); })[0];
    const lastBeat = w.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, 'aftermath', '')) === 0 && !/-stage_arc$/.test(f); }).pop();
    ok(/counts the days/.test(w.rows.get(firstBeat) || ''), k + ': Step-4 Beat 1 did not carry into the REAL first beat (' + firstBeat + ')');
    ok(/opens the door/.test(w.rows.get(lastBeat) || ''), k + ': Step-4 Beat 6 did not carry into the REAL last beat (' + lastBeat + ')');
    ok(!w.bubbles.some(function (b) { return /paste|copy out|type out your Beat/i.test(b); }), k + ': an ask demanded content the session already holds');

    // ⭐ v7.20.368 — READ THE SCREEN, not the database. Every other assertion in this file passed
    // while the stage explanation never once reached a student, because they all inspect ROWS and
    // WRITES. Neil hard-refreshed, cleared the document AND the chat, and still opened on "Step 2
    // of 107" with no explanation at all. This is the only check that could see that.
    ok(w.bubbles.some(function (b) { return /What this stage is for/.test(b); }),
        k + ': the stage explanation never reached the student');
    ok(w.bubbles.filter(function (b) { return /What this stage is for/.test(b); }).length === ARCH[k].sections.length,
        k + ': the stage explanation must be served exactly ONCE per stage, got '
        + w.bubbles.filter(function (b) { return /What this stage is for/.test(b); }).length);

    // ⭐⭐ v7.20.371 — #109 AND #110, BOTH ASSERTED ON THE SCREEN, for the same reason as the
    // stage-explanation check above: Neil asked for the story's two ends four times and each
    // time the row-and-write assertions stayed green while nothing changed on his screen.
    //
    // #109 — the two ends are settled TOGETHER, up front, before any stage work.
    const frameAt = w.bubbles.findIndex(function (b) { return /your story’s two ends/i.test(b); });
    const firstStageAt = w.bubbles.findIndex(function (b) { return /What this stage is for/.test(b); });
    ok(frameAt !== -1, k + ': the story frame never reached the student (#109 — asked for four times)');
    ok(firstStageAt !== -1 && frameAt < firstStageAt,
        k + ': the story frame must come BEFORE the first stage explanation — that is the whole point of '
        + 'settling both ends together rather than an hour apart (frame at ' + frameAt + ', stage I at ' + firstStageAt + ')');
    ok(/counts the days/.test(w.bubbles[frameAt]) && /opens the door/.test(w.bubbles[frameAt]),
        k + ': the frame did not SHOW both Step-4 sentences — it asked the student to confirm something invisible');
    ok(w.bubbles.filter(function (b) { return /your story’s two ends/i.test(b); }).length === 1,
        k + ': the story frame was served more than once in one run');

    // ⭐⭐ v7.20.405 (#193; audit ruling A) — THE THREE-TURN STAGE OPENING. One ask = one row:
    // the compound "Tell me both" arc ask is GONE; each stage settles bookend-then-arc, and the
    // arc is a COMPRESSION of two things already on screen, served only after the close files.
    ok(!w.bubbles.some(function (b) { return /Tell me both/.test(b); }),
        k + ': the compound two-in-one arc ask is back — one ask must own exactly one row (#193)');
    const arcAsks = w.bubbles.filter(function (b) { return /The shape of /.test(b); });
    ok(arcAsks.length === ARCH[k].sections.length,
        k + ': every stage gets its arc turn, got ' + arcAsks.length + ' of ' + ARCH[k].sections.length);
    // The arc quotes BOTH settled ends — never a "not written yet" placeholder (#187).
    ok(!w.bubbles.some(function (b) { return /not written yet/.test(b); }),
        k + ': a served turn told the student something was "not written yet" — machine tell, and the ordering law says ends are settled first');
    ok(arcAsks.every(function (b) { return /runs from .+ to /.test(b.replace(/\n/g, ' ')); }),
        k + ': an arc turn did not quote the stage\'s two settled ends');
    // The FIRST stage's arc must quote their OWN carried opening; the last, their own ending.
    ok(/counts the days/.test(arcAsks[0] || ''),
        k + ': the Stage I arc ask did not show the student\'s own opening beat');
    ok(/opens the door/.test(arcAsks[arcAsks.length - 1] || ''),
        k + ': the final stage\'s arc ask did not show the student\'s own closing beat');
    // Per stage: the bookend ask ("Where X ends" — or "opens", Stage VI inverts) precedes the arc.
    ARCH[k].sections.forEach(function (sec, si) {
        const sName = (conceptsSandbox.window.WML_CW6_CONCEPTS.STAGES[sec.id] || {}).name || sec.label;
        const arcAt = w.bubbles.findIndex(function (b) { return b.indexOf('The shape of ' + sName) !== -1; });
        const bkAt = w.bubbles.findIndex(function (b) {
            return b.indexOf('**Where ' + sName + ' ends**') !== -1 || b.indexOf('**Where ' + sName + ' opens**') !== -1;
        });
        ok(arcAt !== -1, k + '/' + sec.id + ': no arc turn for ' + sName);
        ok(bkAt !== -1, k + '/' + sec.id + ': no bookend turn for ' + sName);
        ok(bkAt !== -1 && arcAt !== -1 && bkAt < arcAt,
            k + '/' + sec.id + ': the arc served BEFORE the bookend (bookend at ' + bkAt + ', arc at ' + arcAt + ') — the arc is a compression of settled ends');
    });
    // v7.20.405 (#191; audit ruling C1): the whole-walk total NEVER appears in the chat.
    const total = w.order.length;
    ok(!w.bubbles.some(function (b) { return b.indexOf('of ' + total) !== -1 && !/in this stage/.test(b); }),
        k + ': a served turn stated the whole-walk total (' + total + ') — stage-relative counts only');
    // ⭐ v7.20.405 (FIXLIST #194; audit ruling C5) — A SKIP IS ANNOUNCED WITH A ✓, NEVER SILENT.
    // The frame carry fills beat 1, so `firstEmptyAsk()` legitimately passes its ask and the
    // numbering used to jump 1 → 3 with no comment. The tick is real state: they did that work.
    const tickLine = w.bubbles.filter(function (b) { return /^✓ Beat 1 —/.test(b); });
    ok(tickLine.length === 1,
        k + ': the carried opening was skipped ' + (tickLine.length ? 'and announced ' + tickLine.length + ' times' : 'SILENTLY')
        + ' — a numbering jump the student cannot explain is a grounding failure (#194)');
    ok(/it’s your opening/.test(tickLine[0] || ''),
        k + ': the skip announcement did not say WHY beat 1 was already done');

    // Frame rows lead their stage, and no divider was ever asked.
    const secIds = ARCH[k].sections.map(function (s) { return s.id; });
    secIds.forEach(function (sid) {
        const first = w.order.filter(function (f) { return f.indexOf(_cw6RowFieldId(k, sid, '')) === 0; })[0];
        ok(/-stage_arc$/.test(first), k + '/' + sid + ': the stage does not lead with its arc row (' + first + ')');
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
            if (w.tap('That’s it')) continue;   // v7.20.405: the stage-I/VI opening recap
            if (w.tap('Use this')) continue;   // v7.20.368: the Step-4 carry confirm
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
            if (w.tap('That’s it')) continue;   // v7.20.405: the stage-I/VI opening recap
            if (w.tap('Use this')) continue;   // v7.20.368: the Step-4 carry confirm
            if (!w.ctl.active) break;
            w.ctl.handleTurn('resumed answer');
        }
        const filled = [...w.rows.values()].filter(function (t) { return t; }).length;
        if (!ok(filled === total, 'no-sidecar@' + n + ': finished with ' + filled + '/' + total + ' rows filled')) bad++;
        if (!ok(!w.lostWrite, 'no-sidecar@' + n + ': write to a non-existent row ' + w.lostWrite)) bad++;
    });
    if (!bad) console.log('   ✓ wiped sidecar: resumed from the document at 4 positions and completed the run');
})();

// ── ⭐ v7.20.391 — THE FRAME MUST BE REACHABLE ON A RESUME, NOT ONLY ON A FRESH START. ─────
// Neil, 2026-08-01, after teaching: "it didn't explicitly say, getting me to think about beat
// one and the final beat. And then how they connect." The frame HAD been built (#109) and was
// unreachable to anyone who came back: `tryResume()` ended at `reattachChips` and never called
// `enterStages()`, which is the only thing that serves it. On a 105-beat walk spanning many
// sessions, that is nearly every student — measured on prod, the one student with Step-6 work
// (uid 1389, 3 beats in) had a filled opening, a blank ending, and had never once been asked.
//
// ⚠️ THIS TEST EXISTS BECAUSE THE REST OF THE SUITE PASSED THROUGHOUT THE ENTIRE BUG.
// Every resume assertion was a NEGATIVE — "repeats nothing", "loses nothing", "skips nothing" —
// and a suite made only of "X must not happen" passes perfectly on a screen that teaches nothing
// (`feedback_negative_only_tests_pass_on_a_dead_screen`). So this asserts a POSITIVE: the frame
// is ON THE SCREEN. Revert the `tryResume` routing and this fails; nothing else in the file does.
(function frameReachableOnResume() {
    const k = 'rags-to-riches';
    const probe = makeWorld(k);
    const total = probe.order.length;
    let bad = 0;
    // Mid-walk positions: the opening is written, the ending is not — the real student's state.
    [3, 20, 60].forEach(function (n) {
        const w = makeWorld(k, { prefill: probe.order.slice(0, n) });
        w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
        w.ctl.tryResume();
        const seen = w.bubbles.some(function (b) { return /your story’s two ends/i.test(b); });
        if (!ok(seen, 'resume@' + n + ': the two-ends frame was never served on resume (#159 — the walk taught nothing to anyone coming back)')) { bad++; return; }
        // ⭐ v7.20.405 (FIXLIST #186; audit ruling B1) — a RETURNING student with written rows gets
        // the SHORT frame: two first-clause quotes and the chips, never the ~200-word full serving
        // (Neil read it four times in one session) and never "Before we start" (#159).
        const frame = w.bubbles.filter(function (b) { return /your story’s two ends/i.test(b); }).pop() || '';
        if (!ok(!/Before we start/i.test(frame),
            'resume@' + n + ': the frame greeted a returning student with "Before we start"')) bad++;
        if (!ok(!/distance between them/i.test(frame),
            'resume@' + n + ': the FULL frame was re-served on resume — the full frame serves once, ever (#186)')) bad++;
        if (!ok(/Opening:/.test(frame) && /Ending:/.test(frame),
            'resume@' + n + ': the short frame did not show both ends as one-liners')) bad++;
        // Settling it must leave the student with something to do — never a dead screen (§4d).
        if (!ok(w.tap('still right'), 'resume@' + n + ': the frame offered no way forward')) bad++;
    });
    // A student who HAS settled both ends must not be asked again on every reload.
    const done = makeWorld(k, { prefill: probe.order.slice(0, 20).concat([probe.order[total - 1]]) });
    done.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
    done.ctl.tryResume();
    if (!ok(!done.bubbles.some(function (b) { return /your story’s two ends/i.test(b); }),
        'resume: the frame was re-served to a student whose two ends are already settled')) bad++;
    if (!bad) console.log('   ✓ the two-ends frame is reachable on resume, speaks to a returning student, and asks only once');
})();

// ── ⭐⭐ v7.20.405 (FIXLIST #187) — THE ORDERING LAW: NOTHING DOWNSTREAM SERVES WHILE THE ────
// FRAME IS OWED. On Neil's prod run the stage opener and the arc ask were served while the
// system still said his opening was "not written yet", and only THEN did the frame come back
// asking him to confirm the two ends — so he answered the same question twice, the second time
// about a span whose start the machine had just told him did not exist.
// `tryResume` has its own frame check, so the resume path alone does NOT prove this: the gap is
// `advance()` → `serveCurrent()`, reachable whenever an end goes empty MID-SESSION (the student
// deletes their ending row in the document — the same edit cw4-sim's I3b drives). Without the
// guard in serveCurrent the walk sails past the unsettled frame into the next beat.
(function orderingLaw() {
    const k = 'rags-to-riches';
    const probe = makeWorld(k);
    const total = probe.order.length;
    const w = makeWorld(k, { prefill: probe.order.slice(0, 8) });
    w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k, frameShown: 1 }));
    w.ctl.tryResume();
    w.tap('still right');            // settle the frame
    w.tap('That’s it');              // clear the opening recap if it is up
    // The student now deletes their ENDING in the document — the frame is owed again.
    const closeFid = probe.order[total - 1];
    w.rows.set(closeFid, '');
    const before = w.bubbles.length;
    w.ctl.handleTurn('an answer to the beat in hand');
    const after = w.bubbles.slice(before);
    const frameAt = after.findIndex(function (b) { return /two ends/i.test(b); });
    const askAt = after.findIndex(function (b) { return /A strong version of this beat|The shape of /.test(b); });
    ok(frameAt !== -1,
        'ordering law: an end went empty mid-session and the walk carried on downstream instead of '
        + 'settling the frame — this is #187, where the arc ask was served before the ends existed');
    ok(askAt === -1 || (frameAt !== -1 && frameAt < askAt),
        'ordering law: a downstream ask was served BEFORE the owed frame (frame at ' + frameAt + ', ask at ' + askAt + ')');
    // And it must never tell the student a bookend is "not written yet" (audit ruling E1/E2).
    ok(!after.some(function (b) { return /not written yet/.test(b); }),
        'ordering law: a served turn said "not written yet" — the ends are settled before anything references them');
    console.log('   ✓ ordering law: an end emptied mid-session re-settles the frame before any downstream ask');
})();

// ── FAIL-OPEN: a dropped marker must never strand the student. ────────────────────────────
(function failOpen() {
    const k = 'tragedy';
    const probe = makeWorld(k);
    // Park one row short of the end, then let the finish check come back with NOTHING.
    const w = makeWorld(k, { prefill: probe.order.slice(0, probe.order.length - 1) });
    w.deps.localStorage.setItem('sim_cw6', JSON.stringify({ phase: 'ask', checkStage: -1, active: true, key: k }));
    w.ctl.tryResume();
    // v7.20.391: a RESUME now enters through `enterStages()` like a fresh start, so the two-ends
    // story frame is served first whenever it is still owed (either end blank). Settle it, then
    // carry on with what this scenario is actually about. The resume sweeps above already did
    // this incidentally — their drive loops tap 'still right' — these three did not.
    w.tap('still right');
    w.tap('That’s it');                                     // v7.20.405: the opening recap turn
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
    w2.tap('still right');                                  // v7.20.391 — settle the two-ends frame first
    w2.tap('That’s it');                                    // v7.20.405: the opening recap turn
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
    w.tap('still right');                                   // v7.20.391 — settle the two-ends frame first
    w.tap('That’s it');                                     // v7.20.405: the opening recap turn
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

// ── No Step-4 spine. v7.20.368: this used to drive the story_open ANCHOR fallback ("I cannot
// find your opening — tell me here"). Those rows are gone and the carry now lands on the REAL
// first beat, so with no spine there is simply nothing to offer and the normal ask must run.
// The scenario is KEPT and repointed, because what it really covers is "a project with no Step-4
// spine still reaches a LIVE ask and files what the student types" — deleting it would remove the
// only cover for a spineless project opening onto a dead screen.
await (async function noSpine() {
    const w = makeWorld('the-quest', { noSpine: true });
    w.ctl.forceStart();
    await tick();
    ok(!w.tap('still right'), 'no-spine: a confirm chip was offered with nothing to confirm');
    ok(!w.tap('Use this'), 'no-spine: a Step-4 carry was offered with no Step-4 spine to carry');
    ok((w.bubbles[w.bubbles.length - 1] || '').length > 0, 'no-spine: the walk said nothing at all');
    const firstBeat = w.order.filter(function (f) {
        return f.indexOf(_cw6RowFieldId('the-quest', 'setup', '')) === 0 && !/-stage_arc$/.test(f);
    })[0];
    // v7.20.405: the three-turn order serves the OPENING bookend first on Stage I — with no spine
    // to carry, it is a plain ask, and the first typed answer files into the real first beat.
    w.ctl.handleTurn('A boy counts the days on his wall.');
    ok(/counts the days/.test(w.rows.get(firstBeat) || ''),
        'no-spine: the typed first beat was not filed into ' + firstBeat);
    ok(!w.rows.has(_cw6RowFieldId('the-quest', 'setup', 'story_open')),
        'no-spine: a story_open row was built');
})();

// ── v7.20.373 — THE HELP LADDER IS NOT A REPEAT BUTTON. Neil, live on Step 6, tapped
// [More examples] three times and got three BYTE-IDENTICAL bubbles, each carrying the single
// example "False Balance" happens to hold — permanently, because aiBubble() is durable, so his
// transcript now contains the same turn three times. The chip was drawn unconditionally, so it
// re-offered a pool that was already empty. Neil: "once the three are done, that quick action
// button just disappears or becomes nonactive."
//
// ⚠️ THIS IS A SCREEN TEST, deliberately. Every row/write assertion in this file stayed green
// through the whole defect — nothing was mis-filed, the walk never moved, no key drifted. The
// only thing wrong was what a student SAW. (Same lesson as .368 and .372.)
await (async function moreExamples() {
    const w = makeWorld('heros-journey');
    w.ctl.forceStart();
    await tick();
    // Walk forward until an ask offers the rung at all.
    let guard = 0;
    while (guard++ < 40 && !w.chips().some(function (b) { return /More examples/.test(String(b.textContent)); })) {
        if (w.tap('still right') || w.tap('Use this')) continue;
        if (!w.ctl.active) break;
        w.ctl.handleTurn('answer ' + guard);
    }
    ok(w.chips().some(function (b) { return /More examples/.test(String(b.textContent)); }),
        'more-examples: no ask in the first 40 offered the rung at all — the ladder is not reachable');

    const before = w.bubbles.length;
    ok(w.tap('More examples'), 'more-examples: the chip did not fire');
    const served = w.bubbles[w.bubbles.length - 1];
    ok(w.bubbles.length === before + 1, 'more-examples: the tap did not put exactly one bubble on screen');
    ok(/More examples —/.test(served), 'more-examples: the tap served something other than the examples');

    // THE DEFECT: the rung must be gone once its pool is spent.
    ok(!w.chips().some(function (b) { return /More examples/.test(String(b.textContent)); }),
        'more-examples: the chip is STILL offered after its pool was spent — this is exactly the '
        + 'three-identical-bubbles defect Neil hit');

    // And the other rungs must survive — killing the whole ladder would be a worse bug than the one fixed.
    ['Guidance', 'Story Spine', 'Still stuck'].forEach(function (label) {
        ok(w.chips().some(function (b) { return String(b.textContent).indexOf(label) !== -1; }),
            'more-examples: the "' + label + '" rung was lost when the examples rung retired');
    });

    // No two bubbles in the whole run may be byte-identical — the shape of what he saw.
    const seen = {}, dupes = [];
    w.bubbles.forEach(function (b) { if (seen[b]) dupes.push(b.slice(0, 40)); seen[b] = 1; });
    ok(!dupes.length, 'more-examples: ' + dupes.length + ' byte-identical bubble(s) were served — "' + dupes[0] + '…"');

    // The cap holds even if the concept data grows past three.
    ok((served.match(/\n- /g) || []).length <= 3,
        'more-examples: more than 3 examples were served in one bubble (Neil capped it at three)');
})();

// ── v7.20.378 — NEIL'S QUESTION, MADE MECHANICAL (#133). ──────────────────────────────────
// Part-way through his own 105-beat run he asked the right question: "how can we be guaranteed
// that the students are gonna get the right question in the right sequence, and that their
// answers are going to auto fill into the right slots… and let's say the student uses the
// buttons, still stuck, ask Sophia — how do we know that once they've answered it, it's gonna go
// to the right slot?"
//
// Sequence and slots were already proven (unique fieldIds, one canonical producer, ask-before-
// file, resume from 10 positions). **The HELP-BUTTON detour was not.** Every existing assertion
// walked the happy path: answer, answer, answer. Nobody had ever asserted that a student who taps
// a rung and THEN types still lands in the beat they were on — which is exactly the case Neil
// asked about, and the one a student actually hits.
//
// Each rung is driven on a FRESH world, per archetype, because tapping a rung emits a new bubble
// and the chip bar moves with it — testing them in sequence on one world silently degrades into
// testing whichever rung still had a bar.
for (const k of KEYS) {
    for (const rung of ['More examples', 'Guidance', 'Story Spine', 'Still stuck']) {
        const w = makeWorld(k);
        w.ctl.forceStart();
        await tick();

        // Walk forward to the first ask carrying THE RUNG UNDER TEST. Waiting on the ladder in
        // general is not enough: a stage-ARC ask carries Guidance/Spine/Still-stuck but has no
        // concept, so no [More examples] — and stopping there tested nothing while looking green.
        const has = function () { return w.chips().some(function (b) { return String(b.textContent).indexOf(rung) !== -1; }); };
        let guard = 0;
        while (guard++ < 60 && !has()) {
            if (w.tap('still right') || w.tap('That’s it') || w.tap('Use this')) continue;
            if (w.armed) { w.resolveApi('@STAGE_OK'); continue; }
            if (!w.ctl.active) break;
            w.ctl.handleTurn('answer ' + guard);
        }
        const reached = has();
        ok(reached, k + '/' + rung + ': never reached an ask carrying this rung');
        if (!reached) continue;

        // THE SLOT THE ASK IN HAND OWNS — read from the REAL armed answer slot, the controller's
        // own filing authority. (v7.20.405: serve order is no longer document order — the
        // three-turn opening asks the closing bookend before the middle beats — so "first empty
        // row in doc order" would assert the OLD sequence, not the contract.)
        const slotTok = w.deps._walkSlot.peek('cw6');
        ok(!!slotTok, k + '/' + rung + ': the ask in hand armed no answer slot');
        const slot = slotTok && slotTok.fid;
        const filledBefore = [...w.rows.values()].filter(Boolean).length;

        const tapped = w.tap(rung);
        ok(tapped, k + '/' + rung + ': the rung was on the bar but did not fire');
        if (!tapped) continue;

        // A HELP TAP IS NOT AN ANSWER — it may never write to the document.
        ok([...w.rows.values()].filter(Boolean).length === filledBefore,
            k + '/' + rung + ': tapping a help rung FILED something into the document');

        if (rung === 'Still stuck') {
            ok(!!w.armed && /^cw6-help-/.test(w.armed.id),
                k + '/' + rung + ': rung 3 did not open a help call (armed as "' + (w.armed && w.armed.id) + '")');
            w.resolveApi('One way this could go — she could leave the door open.');
            await tick();
            ok([...w.rows.values()].filter(Boolean).length === filledBefore,
                k + '/' + rung + ": Sophia's suggestion was filed as if it were the student's answer");
        }

        // NOW the student writes their own. It must land in the beat they were on — not the next
        // one, not the previous one, and not nowhere.
        w.ctl.handleTurn('MY OWN SENTENCE FOR THIS BEAT');
        const newlyFilled = [...w.rows.keys()].filter(function (f) { return /MY OWN SENTENCE FOR THIS BEAT/.test(w.rows.get(f) || ''); });
        ok(newlyFilled.length === 1,
            k + '/' + rung + ': the answer after a help tap landed in ' + newlyFilled.length + ' rows, not exactly 1');
        ok(newlyFilled[0] === slot,
            k + '/' + rung + ': the answer went to "' + newlyFilled[0] + '" but the ask in hand owned "' + slot + '"');
        ok([...w.rows.values()].filter(Boolean).length === filledBefore + 1,
            k + '/' + rung + ': the walk did not advance by exactly one row after the help detour');
    }
}

console.log('   ✓ help rungs (all 4) never file, and the answer after one still lands in the beat in hand — every archetype');

// ── ⭐⭐ v7.20.405 — THE ZERO-API PASS (the degraded-mode contract, research doc 2026-08-02,
// Neil's commission #197: "what if in a worst case scenario we've got no AI?"). EVERY armed API
// call fails; the walk must still start, teach, file, tick, announce honestly, and FINISH.
// Contract §1 completion · §2 liveness (the drive loop itself stalls on a dead screen) ·
// §5 rung 3 fails honestly · §8 honest to the student · §10 no re-demand after completion.
await (async function zeroApiPass() {
    const k = 'rebirth-redemption';
    const w = makeWorld(k);
    const expect = w.order.length;
    w.ctl.forceStart();
    await tick();
    let guard = 0, apiFailures = 0;
    while (guard++ < expect * 4) {
        if (w.armed) { apiFailures++; w.resolveApi(null); continue; }   // every call fails
        if (w.tap('still right') || w.tap('That’s it') || w.tap('Use this')) continue;
        if (!w.ctl.active) break;
        w.ctl.handleTurn('degraded answer ' + guard);
    }
    const filled = [...w.rows.values()].filter(Boolean).length;
    ok(filled === expect, 'zero-api: only ' + filled + '/' + expect + ' rows filled — an API failure gated completion (contract §1)');
    ok(w.ticks.size === expect, 'zero-api: only ' + w.ticks.size + '/' + expect + ' rows ticked at zero API');
    ok(apiFailures >= 6, 'zero-api: expected the walk to attempt its ~6 judgment calls, saw ' + apiFailures);
    ok(!w.ctl.active, 'zero-api: the walk never finished with every call failing');
    ok(/complete plot outline/i.test(w.bubbles[w.bubbles.length - 1] || ''), 'zero-api: the run did not end on the wrap');
    // §8 honest to the student: a failed check SAYS so, in student language, zero machine tells.
    ok(w.bubbles.some(function (b) { return /couldn’t give this stage a proper look/.test(b); }),
        'zero-api: a failed stage check passed in silence — the student asked for a check and was ignored');
    // ("failure"/"fails" appear legitimately in teaching copy — Tragedy's beats are about
    // failing. The machine tells are the mechanical forms.)
    ok(!w.bubbles.some(function (b) { return /timed out|\bAPI\b|status code|request failed/i.test(b); }),
        'zero-api: a served bubble leaked machine vocabulary about the failure');
    // §10 no double-charging: a degraded-complete walk is complete — never re-demanded.
    ok(w.ctl.tryResume() === false, 'zero-api: a walk completed at zero API was re-demanded on resume (contract §10)');

    // §5 — rung 3 fails HONESTLY: plain sentence, free rungs re-offered, answer still files.
    const w2 = makeWorld(k);
    w2.ctl.forceStart();
    await tick();
    let g2 = 0;
    const hasStuck = function () { return w2.chips().some(function (b) { return /Still stuck/.test(String(b.textContent)); }); };
    while (g2++ < 60 && !hasStuck()) {
        if (w2.tap('still right') || w2.tap('That’s it') || w2.tap('Use this')) continue;
        if (w2.armed) { w2.resolveApi(null); continue; }
        if (!w2.ctl.active) break;
        w2.ctl.handleTurn('answer ' + g2);
    }
    ok(hasStuck(), 'zero-api/rung3: never reached an ask offering Ask Sophia');
    const slotBefore = w2.deps._walkSlot.peek('cw6');
    w2.tap('Still stuck');
    ok(!!w2.armed, 'zero-api/rung3: the tap did not open a help call');
    w2.resolveApi(null);                                    // Sophia is unreachable
    await tick();
    const honest = w2.bubbles[w2.bubbles.length - 1] || '';
    ok(/can’t think this through with you right now/.test(honest),
        'zero-api/rung3: no honest message — a dead rung is a silent no-op (contract §5)');
    ok(/More examples|Guidance/.test(honest), 'zero-api/rung3: the free rungs were not re-offered');
    ok(/tutor/.test(honest), 'zero-api/rung3: the stuck-point capture for the tutor was not named');
    ok(w2.chips().length > 0, 'zero-api/rung3: no chips on screen after the honest message — dead end (§4d)');
    // And the student's own answer still lands in the beat they were on.
    w2.ctl.handleTurn('MY OWN DEGRADED SENTENCE');
    const landed = [...w2.rows.keys()].filter(function (f) { return /MY OWN DEGRADED SENTENCE/.test(w2.rows.get(f) || ''); });
    ok(landed.length === 1 && (!slotBefore || landed[0] === slotBefore.fid),
        'zero-api/rung3: the answer after a failed help call did not land in the beat in hand');
    console.log('   ✓ zero-API pass: full run completes, checks fail honestly, rung 3 degrades to the honest triple, nothing re-demanded');
})();

console.log('   ' + asserts.pass + ' behavioural assertions passed'
    + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : '') + ' across ' + KEYS.length + ' archetype(s)');
if (fail) { console.error('\ncw6-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw6-sim-harness passed (real controller, real templates, 6-call API budget held).');
}

main().catch(function (e) { console.error('cw6-sim-harness threw —', e && e.stack || e); process.exit(1); });
