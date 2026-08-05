#!/usr/bin/env node
/* eslint-env node */
/**
 * walk-sim-lib.js — the shared rig for driving a code-owned walk turn by turn.
 *
 * Extracted from cw4-sim-harness.js (v7.20.327) the moment a SECOND walk needed it. The whole
 * reason Step 3 reached a live lesson broken is that gates were written per-step, reactively;
 * a per-step COPY of this rig would reproduce that failure one level down — the v7.20.289
 * replace-vs-append fix was made in one controller and lost in another for exactly that reason.
 *
 * Node builtins only: the CI workflow has no `npm install` step.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

// Comments and quoted strings are skipped, or an apostrophe in ordinary prose reads as an
// opening quote and the slice silently swallows the rest of the file.
function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    let d = 0;
    for (let k = start; k < s.length; k++) {
        const c = s[k];
        if (c === open) d++;
        else if (c === close) { d--; if (d === 0) return { text: s.slice(start, k + 1), end: k + 1 }; }
        else if (c === '/' && s[k + 1] === '/') { while (k < s.length && s[k] !== '\n') k++; }
        else if (c === '/' && s[k + 1] === '*') { k += 2; while (k < s.length && !(s[k] === '*' && s[k + 1] === '/')) k++; k++; }
        else if (c === '"' || c === "'" || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return null;
}

function sliceController(declaration) {
    const i = SRC.indexOf(declaration);
    if (i < 0) throw new Error('controller not found: ' + declaration);
    return { src: braceSliceFrom(SRC, i, '(', ')').text + '()', text: braceSliceFrom(SRC, i, '(', ')').text };
}

const settle = () => new Promise((r) => setImmediate(r));

/**
 * The REAL module-scope SELF-ASSESSMENT primitives (v7.20.333), sliced from source as ONE
 * contiguous region — the tick list, its follow-up, the shared multi-select bar and the duplicate
 * guard. Stubbing any of them would collapse the very mechanism the sims exist to prove, which is
 * exactly how a suppressed `Continue →` stayed invisible at .330 (a stub that skips the mechanism
 * under test proves nothing about it).
 *
 * EXPORTED because cw4/cw5/cw6-sim still carry their own inline `makeWorld` (the migration the
 * .327 handoff prescribes and this session did not have room for). They call this, so there is
 * still exactly ONE slice of these primitives — a second copy is how the v7.20.289 fix was made
 * in one controller and lost in another.
 *
 * `deps` must already carry el · chatMessages · BUBBLE_CONTROL_KINDS · console.
 */
// v7.20.339 — the REAL live-chips registry + no-ask guard, lifted as ONE block because the four
// functions share the module-scope `_liveChips`. Lifting them individually would give each its own
// copy, and the rig would then prove a mechanism the product does not have. Throws rather than
// stubs: a rig that quietly substitutes a fake for the thing under test is exactly how "a refusal
// re-serves the ask" would pass on code that still hands the student a dead screen.
// MUST run BEFORE attachSelfAssessDeps — the tick-list attachers call _armLiveChips.
function attachLiveChipsDeps(deps) {
    const chipsIdx = SRC.indexOf('let _liveChips = null;');
    const guardIdx = chipsIdx >= 0 ? SRC.indexOf('function _cwNoAskGuard', chipsIdx) : -1;
    const guardSlice = guardIdx >= 0 ? braceSliceFrom(SRC, guardIdx, '{', '}') : null;
    if (chipsIdx < 0 || !guardSlice) {
        throw new Error('live-chips registry / _cwNoAskGuard not found in wml-assessment.js — the rig '
            + 'would silently skip the no-ask guard and every dead-end test would pass vacuously');
    }
    // eslint-disable-next-line no-new-func
    const made = new Function('console', 'Date', SRC.slice(chipsIdx, guardSlice.end)
        + '\nreturn { _armLiveChips: _armLiveChips, _clearLiveChips: _clearLiveChips,'
        + ' _reserveLiveChips: _reserveLiveChips, _cwNoAskGuard: _cwNoAskGuard };')(deps.console, Date);
    Object.keys(made).forEach((n) => { deps[n] = made[n]; });
    return deps;
}

// ⭐ v7.20.352 — the WML shim every walk now needs, because recordTurn is the ONLY writer
// into chat history and every walk's aiBubble/userTurn goes through it.
//
// SLICED FROM wml-core.js, never stubbed. A stub would accept anything, so a walk that
// dropped `durable` or `why` would sail through the sims and only fail the lint — and the
// sims are what prove BEHAVIOUR (a stubbed contract is exactly how cw5/cw6 once ran with no
// answer slot at all and passed). Slicing means the rigs exercise the shipped contract,
// including the loud-error paths.
//
// Throws rather than stubs: if recordTurn is renamed or removed, the rigs must fail the
// build, not quietly persist everything and pass.
function attachWmlDeps(deps) {
    const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');

    const rtIdx = CORE.indexOf('function recordTurn(history, entry, opts)');
    if (rtIdx < 0) throw new Error('recordTurn not found in wml-core.js — the turn-durability contract would pass vacuously');
    const rtEnd = braceSliceFrom(CORE, rtIdx, '{', '}').end;

    const rhIdx = CORE.indexOf('function rehydrateTurn(history, entry)');
    if (rhIdx < 0) throw new Error('rehydrateTurn not found in wml-core.js — replay restore would pass vacuously');
    const rhEnd = braceSliceFrom(CORE, rhIdx, '{', '}').end;

    const psIdx = CORE.indexOf('const PRESENT_STATE_RE =');
    if (psIdx < 0) throw new Error('PRESENT_STATE_RE not found in wml-core.js');
    const psEnd = CORE.indexOf('\n', psIdx);

    // v7.20.363 — the ICON REGISTRY, sliced for the same reason as recordTurn: never stubbed.
    // A stub returning '' would make every walk pass while `WML.icon('spine')` resolved to
    // nothing, so a chip could ship with a missing or misspelled icon key and no rig would
    // notice — the registry's own "unknown key warns once" path would never be exercised.
    // Sliced, a bad key in a shipped chip surfaces here instead of on Neil's screen.
    const icoIdx = CORE.indexOf('const ICON_WRAP = {');
    if (icoIdx < 0) throw new Error('the icon registry (ICON_WRAP/ICONS) was not found in wml-core.js — chip and rail glyphs would resolve to nothing and every walk would still pass');
    const icoFnIdx = CORE.indexOf('function icon(name, size)', icoIdx);
    if (icoFnIdx < 0) throw new Error('WML.icon() not found in wml-core.js');
    const icoEnd = braceSliceFrom(CORE, icoFnIdx, '{', '}').end;

    // eslint-disable-next-line no-new-func
    const mk = new Function('console', [
        'const _turnWarned = Object.create(null);',
        CORE.slice(psIdx, psEnd),
        CORE.slice(rtIdx, rtEnd),
        CORE.slice(rhIdx, rhEnd),
        CORE.slice(icoIdx, icoEnd),
        // the phoenix is an <img> off swmlConfig, which does not exist in a rig — the glyph is
        // irrelevant to behaviour, but the CALL must not throw, so it resolves to empty here.
        'function phoenixIconHTML() { return \'\'; }',
        'return { recordTurn: recordTurn, rehydrateTurn: rehydrateTurn, icon: icon, ICONS: ICONS, phoenixIconHTML: phoenixIconHTML };',
    ].join('\n'));

    const real = mk(deps.console || console);

    // ⭐ IN A RIG, A CONTRACT VIOLATION IS FATAL — in production it is not.
    //
    // recordTurn deliberately PERSISTS-AND-SCREAMS when `durable` is missing, because losing a
    // student's real turn mid-lesson is worse than a fossil. That is right for a live lesson and
    // useless as a test: a console.error nobody reads is a silent pass, which is precisely the
    // "negative-only tests pass on a dead screen" failure this codebase has already paid for.
    //
    // So the rigs throw. Every sim of every walk is now automatically a durable-contract test,
    // with no per-rig assertion to remember and no way to opt out — the same design as the
    // liveness check inside say()/tap().
    const guarded = function (history, entry, opts) {
        const o = opts || {};
        if (typeof o.durable !== 'boolean') {
            throw new Error('recordTurn called without an explicit `durable` (role=' + ((entry && entry.role) || '?')
                + '). Every turn must declare whether it survives a reload — there is no default. '
                + 'Test: "if this fact changes tomorrow, should this sentence still be on the screen?"');
        }
        if (typeof o.why !== 'string' || !o.why) {
            throw new Error('recordTurn called without `why` (role=' + ((entry && entry.role) || '?')
                + '). The reason string is the review artefact for the whole set.');
        }
        return real.recordTurn(history, entry, opts);
    };

    deps.WML = Object.assign({}, deps.WML || {}, real, { recordTurn: guarded });
    return deps.WML;
}

// v7.20.340 — the REAL module-scope answer slot + last-assistant probe, lifted for ANY rig.
// cw4-sim grew its own private copy of the _walkSlot lift; cw5-sim and cw6-sim had none at all,
// which is why CW5/CW6 could ship with ZERO slot references while the .327 comment claimed all
// seven walks were covered. One lifter, shared, so a rig cannot exercise a stand-in.
// Throws rather than stubs — a missing primitive must fail the build, not pass vacuously.
function attachSlotDeps(deps) {
    // v7.20.352: every walk's aiBubble/userTurn now goes through WML.recordTurn, so the shim
    // must exist before a controller is built. Attached here rather than left to each rig,
    // because "remember to call it in all six rigs" is the same class of failure this whole
    // session is about.
    attachWmlDeps(deps);

    const slotIdx = SRC.indexOf('const _walkSlot = (function () {');
    if (slotIdx < 0) throw new Error('_walkSlot not found in wml-assessment.js — the answer-slot gate would pass vacuously');
    // eslint-disable-next-line no-new-func
    deps._walkSlot = new Function('console', 'return ' + braceSliceFrom(SRC, slotIdx, '(', ')').text + '();')(deps.console || console);

    const laIdx = SRC.indexOf('function _cwLastAssistantIs');
    if (laIdx < 0) throw new Error('_cwLastAssistantIs not found in wml-assessment.js — the resume re-serve gate would pass vacuously');
    const laEnd = braceSliceFrom(SRC, laIdx, '{', '}').end;
    // eslint-disable-next-line no-new-func
    deps._cwLastAssistantIs = new Function('return (' + SRC.slice(laIdx, laEnd) + ');')();

    // v7.20.340: the in-chat progress-bar token emitter. Lifted, not stubbed — a stub would let a
    // walk ship with no bar and the rig would still say the bar was there.
    const pbIdx = SRC.indexOf('function cwProgressBar');
    if (pbIdx < 0) throw new Error('cwProgressBar not found in wml-assessment.js — the in-chat progress bar gate would pass vacuously');
    const pbEnd = braceSliceFrom(SRC, pbIdx, '{', '}').end;
    // eslint-disable-next-line no-new-func
    deps.cwProgressBar = new Function('return (' + SRC.slice(pbIdx, pbEnd) + ');')();

    // v7.20.340: the non-welding row reader. Lifted so a rig proves the shipped read.
    const ntIdx = SRC.indexOf('function _cwNodeText');
    if (ntIdx < 0) throw new Error('_cwNodeText not found in wml-assessment.js — the weld gate would pass vacuously');
    const ntEnd = braceSliceFrom(SRC, ntIdx, '{', '}').end;
    // eslint-disable-next-line no-new-func
    deps._cwNodeText = new Function('return (' + SRC.slice(ntIdx, ntEnd) + ');')();

    // v7.20.345: the resume-replay depth. `_cwReplay` and `_cwIsReplay` SHARE `_cwReplayDepth`,
    // so they are lifted as one closure — lifting them separately would give each its own counter
    // and the fossil gate would pass while the shipped code still saved every re-serve.
    const rpIdx = SRC.indexOf('let _cwReplayDepth = 0;');
    const rpFnIdx = SRC.indexOf('function _cwIsReplay');
    if (rpIdx < 0 || rpFnIdx < 0) throw new Error('_cwReplay/_cwIsReplay not found in wml-assessment.js — the resume-fossil gate would pass vacuously');
    const rpEnd = braceSliceFrom(SRC, rpFnIdx, '{', '}').end;
    // eslint-disable-next-line no-new-func
    const _rp = new Function('console', SRC.slice(rpIdx, rpEnd)
        + '\nreturn { _cwReplay: _cwReplay, _cwIsReplay: _cwIsReplay };')(deps.console || console);
    deps._cwReplay = _rp._cwReplay;
    deps._cwIsReplay = _rp._cwIsReplay;

    // v7.20.343: the closed-question option parser.
    const aoIdx = SRC.indexOf('function cwAnswerOptions');
    if (aoIdx < 0) throw new Error('cwAnswerOptions not found in wml-assessment.js — the closed-question chip gate would pass vacuously');
    const aoEnd = braceSliceFrom(SRC, aoIdx, '{', '}').end;
    // eslint-disable-next-line no-new-func
    deps.cwAnswerOptions = new Function('console', 'return (' + SRC.slice(aoIdx, aoEnd) + ');')(deps.console || console);
    return deps;
}

function attachSelfAssessDeps(deps) {
    const start = SRC.indexOf('const SA_ASK = ');
    const dupAt = SRC.indexOf('function cwDuplicateOf(');
    if (start < 0 || dupAt < 0) {
        throw new Error('self-assessment primitives not found in wml-assessment.js — the rig would '
            + 'silently skip the tick list and every walk would look like it still works');
    }
    const region = SRC.slice(start, braceSliceFrom(SRC, dupAt, '{', '}').end);
    const NAMES = ['chipBarMulti', 'cwServeSelfAssessment', 'cwAttachSelfAssessment',
        'cwAttachSaFollowUp', 'onSelfAssessTicks', 'onSelfAssessFollowUp',
        'cwSaFollowText', 'cwNormaliseAnswer', 'cwDuplicateOf'];
    // eslint-disable-next-line no-new-func
    const made = new Function('el', 'chatMessages', 'BUBBLE_CONTROL_KINDS', 'console', '_armLiveChips',
        region + '\nreturn {' + NAMES.join(',') + '};')(
        deps.el, deps.chatMessages, deps.BUBBLE_CONTROL_KINDS, deps.console, deps._armLiveChips);
    NAMES.forEach((n) => { deps[n] = made[n]; });
    return deps;
}

// What a tick-list bubble reads like, and the neutral "move me on" controls. Shared so the two
// rigs cannot disagree about which surface they are looking at.
const TICK_LIST_RE = /Before we move on/;
const NEUTRAL_RE = /Continue|Done|Next|Move on|fine as it is/i;
const SA_ADD_RE = /Add to my answer|Write it again/i;

// Chips the student can actually choose between. `appendStepButtons` / `appendSpineButtons`
// attach a HELP bar to the SAME bubble; a rig that cannot tell them apart taps Guidance forever.
//
// ⚠️ v7.20.363 — THIS USED TO CLASSIFY BY EMOJI: /^(📖|👤|🧩|🗒|🗂|💡|🤔)/. That made a decoration
// load-bearing: the moment Neil asked for the emojis to become SVG icons, every help chip would
// have been reclassified as an ANSWER chip in four walks, and the failure would have read as a
// walk bug rather than an icon change. A glyph is decoration; it must never be the thing a
// machine reads. Classification is now by the bar's DECLARED kind (the same `swml-bc-help` /
// `swml-cw-help` marker the product itself uses to stop two kinds colliding on one bubble) —
// which is what this file's own comment below already suspected was the proper job.
// The label net is the safety belt for a help rung appended OUTSIDE a help bar; it names rungs,
// never glyphs, so an icon change can never move it again.
const HELP_BAR_RE = /swml-bc-help|swml-cw-help/;
const HELP_LABEL_RE = /^(Guidance|Story Spine|Story Components|Table of Techniques|Mastery Toolkit|More examples|Ask Sophia|Still stuck|Your Writer|Writer’s Profile|Writer's Profile)/;

/**
 * Build a simulated world around a sliced controller.
 *   opts.task       state.task for the walk
 *   opts.fids       every fieldId the document should already contain (empty)
 *   opts.prefill    { fid: text } rows that already hold text
 *   opts.ls         a shared localStorage map (to simulate a reload)
 *   opts.extraDeps  walk-specific stubs
 */
function makeWorld(ctl, opts) {
    opts = opts || {};
    const rows = new Map();
    const bubbles = [];
    const users = [];
    const writes = [];
    const sends = [];
    const ls = opts.ls || new Map();
    let armed = null;

    (opts.fids || []).forEach((f) => rows.set(f, ''));
    Object.keys(opts.prefill || {}).forEach((f) => rows.set(f, opts.prefill[f]));

    // `ctls` holds multi-control row state, keyed `fid|ctlId` → [ticked labels] (v7.20.419).
    const world = { rows, bubbles, users, writes, sends, ls, ticked: new Set(), ctls: new Map(),
        get armed() { return armed; } };

    function findIn(node, sel) {
        if (!node || !node.children) return null;
        for (const c of node.children) {
            if (c.className && ('.' + String(c.className).split(' ').join('.')).indexOf(sel) !== -1) return c;
            const d = findIn(c, sel);
            if (d) return d;
        }
        return null;
    }

    const deps = {
        chatMessages: { get lastElementChild() { return world._lastBubbleEl; } },
        chatTextarea: { value: '', style: {} },
        chatSendBtn: { style: {} },
        canvasChatHistory: [],
        canvasChatId: 'sim',
        saveCanvasChat: function () {},
        formatAI: function (t) { return t; },
        el: function (tag, attrs) {
            return {
                tag: tag, attrs: attrs || {}, children: [], _handlers: [],
                className: (attrs && attrs.className) || '',
                textContent: (attrs && attrs.textContent) || '',
                appendChild: function (c) { this.children.push(c); return c; },
                remove: function () { this._removed = true; },
                querySelector: function (sel) { return findIn(this, sel); },
                addEventListener: function (ev, fn) { if (ev === 'click') this._handlers.push(fn); },
                click: function () {
                    if (this.attrs && typeof this.attrs.onClick === 'function') { this.attrs.onClick(); return true; }
                    if (this._handlers.length) { this._handlers.forEach(function (f) { f({ preventDefault: function () {} }); }); return true; }
                    return false;
                },
                setAttribute: function () {}, getAttribute: function () { return null; },
                closest: function () { return null; },
                classList: { contains: function () { return false; }, add: function () {}, remove: function () {} },
            };
        },
        state: { task: opts.task, cwProjectId: 'cwp_sim' },
        canvasEditor: { state: { doc: { descendants: function (fn) {
            for (const [f, t] of rows) {
                if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f }, textContent: t }, 0) === false) break;
            }
        } } } },
        _writeOutlineRowField: function (fid, text, o) {
            writes.push({ fid: fid, text: text, replace: !!(o && o.replace) });
            if (!rows.has(fid)) { world.lostWrite = fid; return false; }
            const prev = rows.get(fid);
            rows.set(fid, (!prev || (o && o.replace)) ? text : prev + '\n\n' + text);
            return true;
        },
        _tickOutlineRow: function () { return true; },
        // v7.20.337: the shared walk endpoint. Returned verbatim so a sim can assert that a
        // walk actually ENDS on one — a walk that just stops is the thing Neil asked to fix.
        cwEndpointLine: function () { return '\n\n---\n\n**That’s this step done.** (sim endpoint)'; },
        // v7.20.336 — the tick-in-chat primitive, MODELLED not stubbed. A bare `return true`
        // would let a chip that ticks the new choice while leaving the previous one ticked pass
        // every test (§2b: a rig that skips the mechanism proves nothing). So this reproduces the
        // two behaviours that actually matter from the real checkbox click handler:
        //   • radio groups — ticking one row in a `cw-step-2-idea*` / `cw-step-3-logline-*` group
        //     clears its siblings, so `ticked` can never hold two members of one group
        //   • already-ticked is a NO-OP, never a toggle (a real .click() would untick it)
        // Assert against `world.ticked`.
        _tickRowLikeAStudent: function (fid) {
            if (!fid) return false;
            if (!rows.has(fid)) { world.lostTick = fid; return false; }
            if (world.ticked.has(fid)) return true;                     // no-op, never a toggle
            const prefix = fid.indexOf('cw-step-2-idea') === 0 ? 'cw-step-2-idea'
                : fid.indexOf('cw-step-3-logline-') === 0 ? 'cw-step-3-logline-' : null;
            if (prefix) {
                Array.from(world.ticked).forEach(function (t) {
                    if (t.indexOf(prefix) === 0 && t !== fid) world.ticked.delete(t);
                });
            }
            world.ticked.add(fid);
            return true;
        },
        // ⭐ v7.20.419 — MULTI-CONTROL TICKS, MODELLED not stubbed (the Step-7 rows, and every
        // workbook step after it: 10, 11, 13, 14, 16, 17, 19, 20…).
        //
        // A bare `return true` would let the whole class of defects this primitive exists to
        // prevent pass every test, so this reproduces the three behaviours that actually matter
        // from the real _setRowControlChoice:
        //   • per-control NAMESPACING — ticking `state` can never disturb `traits` on the same
        //     row. (In production the failure mode is the reverse: using _tickOutlineRow here
        //     would REPLACE the row's whole state object and delete both.)
        //   • `exclusive` — In balance / In excess / In deficit is one answer, so a second pick
        //     REPLACES the first. A row holding two of them is not an answer.
        //   • an UNKNOWN label is REFUSED and recorded — a walk offering a choice the document
        //     does not carry is a write-key ≠ read-key drift (§5d), and in the browser it ticks
        //     nothing at all. Assert on `world.lostCtlLabel`.
        // Pass `opts.ctlItemsFor(fid, ctlId) -> [labels]` so the rig knows each control's real
        // roster; without it every label is accepted and this stops modelling the refusal.
        _setRowControlChoice: function (fid, ctlId, label, o) {
            if (!fid || !ctlId || !label) return false;
            if (!rows.has(fid)) { world.lostCtl = fid; return false; }
            if (opts.ctlItemsFor) {
                const items = opts.ctlItemsFor(fid, ctlId) || [];
                if (items.indexOf(label) === -1) { world.lostCtlLabel = fid + '|' + ctlId + '|' + label; return false; }
            }
            const k = fid + '|' + ctlId;
            const cur = world.ctls.get(k) || [];
            if (o && o.exclusive) { world.ctls.set(k, [label]); return true; }
            if (cur.indexOf(label) === -1) cur.push(label);
            world.ctls.set(k, cur);
            return true;
        },
        _rowControlPicks: function (fid, ctlId) { return (world.ctls.get(fid + '|' + ctlId) || []).slice(); },
        saveCanvasContent: function () {},
        CANVAS_SAVE_KEY: function () { return 'sim'; },
        _cwLoadDocValues: function () { return Promise.resolve({}); },
        _cwLoadStep3Values: function () { return Promise.resolve({}); },
        _cwDocValue: function () { return ''; },
        _cwStep3Value: function (fid) { return 'step-3 value for ' + fid; },
        // v7.20.331: the REAL serveCwChunks, sliced from source — not a stub.
        // The old stub emitted every chunk at once and fired onDone immediately, which
        // COLLAPSED THE PACING. That is why the sim could not see a missing `Continue →`:
        // the paced path it was meant to test was never executed. A stub that skips the
        // mechanism under test proves nothing about it (Neil, staging .330 — the intro chunk
        // landed with help buttons and no way forward, and every gate was green).
        serveCwChunks: null,   // replaced below, once `el` and the kinds exist
        armWalkResume: function (id, fn) { armed = { id: id, fn: fn }; },
        sendCanvasMessage: function () { sends.push({ id: armed ? armed.id : '(none)' }); deps.canvasSilentSend = false; },
        canvasSilentSend: false,
        applyCwSubstepProgress: function () {},
        showGuidePanel: function () {},
        armCwWalkHandoff: function () { return true; },
        consumeCwWalkHandoff: function () { return false; },
        localStorage: {
            getItem: function (k) { return ls.has(k) ? ls.get(k) : null; },
            setItem: function (k, v) { ls.set(k, v); },
            removeItem: function (k) { ls.delete(k); },
        },
        window: { WML: {}, SophiclyTable: null },
        document: { querySelector: function () { return null; }, querySelectorAll: function () { return []; } },
        setTimeout: function (fn) { fn(); return 0; },
        clearTimeout: function () {},
        console: {
            log: function () {},
            warn: function (m) { world.warns = (world.warns || []).concat([String(m)]); },
            error: function (m) { world.warns = (world.warns || []).concat([String(m)]); },
        },
    };

    // The REAL serveCwChunks + the bubble-control kinds, sliced from source.
    {
        const kindsIdx = SRC.indexOf('const BUBBLE_CONTROL_KINDS =');
        const kinds = kindsIdx >= 0
            // eslint-disable-next-line no-eval
            ? eval('(' + braceSliceFrom(SRC, kindsIdx, '{', '}').text + ')')
            : { help: 'swml-bc-help', nav: 'swml-bc-nav', choice: 'swml-bc-choice' };
        deps.BUBBLE_CONTROL_KINDS = kinds;
        const i = SRC.indexOf('function serveCwChunks(chunks, opts) {');
        if (i >= 0) {
            const body = braceSliceFrom(SRC, i, '{', '}');
            const fnSrc = SRC.slice(i, body.end);
            // eslint-disable-next-line no-new-func
            deps.serveCwChunks = new Function('el', 'chatMessages', 'BUBBLE_CONTROL_KINDS', 'console',
                'return ' + fnSrc.replace(/^function\s+\w+/, 'function') + ';')(
                deps.el, deps.chatMessages, kinds, deps.console);
        } else {
            throw new Error('serveCwChunks not found — the rig would silently skip pacing');
        }
    }

    attachLiveChipsDeps(deps);   // v7.20.339 — must precede the SA lift (it calls _armLiveChips)
    attachSlotDeps(deps);        // v7.20.340 — _walkSlot · _cwLastAssistantIs · cwProgressBar · _cwNodeText
    attachSelfAssessDeps(deps);

    // The REAL module-scope _walkSlot, so the rig exercises the shipped primitive.
    const slotIdx = SRC.indexOf('const _walkSlot = (function () {');
    if (slotIdx >= 0) {
        const SLOT_SRC = braceSliceFrom(SRC, slotIdx, '(', ')').text + '()';
        // eslint-disable-next-line no-new-func
        deps._walkSlot = new Function('console', 'return ' + SLOT_SRC + ';')(deps.console);
    }

    Object.keys(opts.extraDeps || {}).forEach((k) => { deps[k] = opts.extraDeps[k]; });

    deps.addChatMessage = function (html, who, plain) {
        if (who === 'user') { users.push(html); return; }
        bubbles.push(plain || html);
        const content = deps.el('div', { className: 'swml-bubble-content' });
        world._lastBubbleEl = {
            children: [content],
            querySelector: function (s) { return s.indexOf('bubble-content') !== -1 ? content : findIn(this, s); },
        };
    };

    const names = Object.keys(deps);
    // eslint-disable-next-line no-new-func
    world.ctl = new Function(names.join(','), 'return ' + ctl.src + ';').apply(null, names.map((n) => deps[n]));
    world.deps = deps;

    world.chips = function () {
        const content = world._lastBubbleEl && world._lastBubbleEl.children[0];
        if (!content) return [];
        const out = [];
        content.children
            .filter((c) => String(c.className).indexOf('swml-quick-actions') !== -1
                && String(c.className).indexOf('-help') === -1 && !c._removed)
            .forEach((bar) => {
                // A RESOURCE GATE lives in the nav bar and is labelled with an emoji
                // ("📖 See how writers turn moments into ideas" — CW2's opener). The emoji filter
                // exists to keep the HELP bar's buttons out, and the bar's own kind already does
                // that job properly — so inside a nav bar every button is tappable. Without this
                // the sim cannot open a gated resource, and therefore never reaches the ask behind
                // it: the walk would look dead to the rig while working fine for a student.
                const isNav = String(bar.className).indexOf('swml-bc-nav') !== -1;
                const isHelpBar = HELP_BAR_RE.test(String(bar.className));
                bar.children.forEach((b) => {
                    // A BUTTON can be removed while its bar lives on: the resource gate replaces
                    // itself with `Continue →` in place. Without this the rig keeps tapping the
                    // dead gate button and the paced run never advances.
                    if (b._removed) return;
                    if (isNav || (!isHelpBar && !HELP_LABEL_RE.test(String(b.textContent)))) out.push(b);
                });
            });
        return out;
    };
    /* ⭐⭐ v7.20.434 (#274) — THE HELP RUNGS, WHICH NO SIM COULD TAP UNTIL NOW.
       `world.chips()` above deliberately EXCLUDES help-bar buttons, because for driving a walk
       they are noise. The consequence went unnoticed for the whole life of the rig: **a help chip
       was UNTAPPABLE BY CONSTRUCTION, so no assertion about one could ever be written**, and the
       branch simply did not exist to be walked. That is how a rung-1 tap that destroys the ask
       shipped to Neil with the CW7 suite fully green — the sim was not failing to catch it, it was
       structurally incapable of reaching it.
       This is the same shape as `feedback_negative_only_tests_pass_on_a_dead_screen`: the suite
       proves things about the paths it can drive and says nothing about the ones it cannot.
       Any surface a STUDENT can press, the rig must be able to press. */
    world.helpChips = function () {
        const content = world._lastBubbleEl && world._lastBubbleEl.children[0];
        if (!content) return [];
        const out = [];
        content.children
            .filter((c) => String(c.className).indexOf('swml-quick-actions') !== -1
                && HELP_BAR_RE.test(String(c.className)) && !c._removed)
            .forEach((bar) => bar.children.forEach((b) => { if (!b._removed) out.push(b); }));
        return out;
    };
    world.helpChipNamed = function (re) {
        return world.helpChips().filter((c) => re.test(String(c.textContent)))[0];
    };
    world.resolveApi = function (reply) {
        if (!armed) return false;
        // The real pipeline RENDERS the model's reply as a fresh bubble before the walk's resume
        // hook runs, and a walk attaches its chips to that new bubble. Without this the chips hit
        // the previous bubble, whose help bar makes chipBar's "already has actions" guard bail —
        // and the sim would report "no chips" for a walk that works.
        if (reply) deps.addChatMessage(reply, 'ai', reply);
        const fn = armed.fn; armed = null;
        fn(reply, {});
        return true;
    };
    // v7.20.330: liveness is checked AUTOMATICALLY on every simulated input. It is not a test a
    // harness author has to remember to write — forgetting it is exactly how a guard that silently
    // swallowed a tap reached a live lesson. Pass `ok` via opts.ok to enable (every sim does).
    function autoLive(label, bubblesBefore) {
        if (!opts.ok || !world.ctl.active) return;
        opts.ok(world.bubbles.length > bubblesBefore || world.chips().length > 0,
            'DEAD END after ' + label + ': the walk is active but said NOTHING and left no chip — '
            + 'the student has no question to answer and nothing to press. Refusing an input is only '
            + 'half a change; the other half is what they see instead.');
    }
    world.say = function (text, reply) {
        const bb = world.bubbles.length;
        world.ctl.handleTurn(text);
        if (armed) world.resolveApi(reply);
        autoLive('typing "' + String(text).slice(0, 30) + '"', bb);
    };
    world.tap = function (btn) {
        const bb = world.bubbles.length;
        btn.click();
        autoLive('tapping "' + String(btn.textContent).slice(0, 30) + '"', bb);
    };
    // ── LIVENESS (v7.20.330) ────────────────────────────────────────────────────────────────
    // THE invariant every other one in this rig is a negative of. Neil, 2026-07-28, after a guard
    // I added left a student on a greeting with help chips and no question:
    //   "how is it that we make a fundamental mistake that fundamentally destroys the user
    //    experience?"
    // Because every assertion here was of the form "X must not happen", and a screen that does
    // NOTHING satisfies all of them. A refusal is only half a design; the other half is what the
    // student can do instead, and nothing was checking that half.
    //
    // The student can act iff EITHER the slot is armed (typing will be accepted and filed) OR a
    // chip is on screen (tapping does something). Anything else is a dead end, whatever the
    // document looks like. `finished` is the one legitimate way to have neither.
    world.live = function () {
        const armed = !!(deps._walkSlot && deps._walkSlot.armed);
        return armed || world.chips().length > 0;
    };
    world.assertLive = function (okFn, whenLabel) {
        okFn(world.live() || !world.ctl.active,
            'DEAD END after ' + whenLabel + ': the walk is active but the student has no question '
            + 'to answer and no chip to press.');
    };
    // THE STRONGER FORM, and the one that matters. "The slot is armed" is NOT liveness: on staging
    // .329 the slot WAS armed, so typing would have been accepted — but no question was on screen,
    // so the student had no idea what to type. What a person recognises as working is that the
    // SCREEN RESPONDED: after any input the walk either says something new or leaves a chip.
    // Pass the bubble count from immediately BEFORE the input.
    world.assertLiveAfterInput = function (okFn, whenLabel, bubblesBefore) {
        if (!world.ctl.active) return;   // a finished walk legitimately has neither
        okFn(world.bubbles.length > bubblesBefore || world.chips().length > 0,
            'DEAD END after ' + whenLabel + ': the walk swallowed the input and said NOTHING — no new '
            + 'message, no chip. Refusing an input is only half a change; the other half is what the '
            + 'student sees instead. (Neil, staging .329: help chips and no question.)');
    };

    // Tap `Continue →` until the ASK is live (the slot is armed). The paced run delivers the
    // teaching chunks first (law 4b), so a student reaches the question by tapping — and so must
    // the sim. Returns false if it never got there, which is itself a dead end.
    world.toAsk = function (limit) {
        for (let g = 0; g < (limit || 10); g++) {
            if (deps._walkSlot && deps._walkSlot.armed) return true;
            const nav = world.chips().filter((c) => /Continue|Next/i.test(String(c.textContent)))[0];
            if (!nav) break;
            world.tap(nav);
        }
        return !!(deps._walkSlot && deps._walkSlot.armed);
    };

    // Tap through a chip menu WITHOUT making a content choice: prefer the explicit "move me on"
    // control, else the first option. v7.20.333 added the self-assessment's skip chip — a tick
    // list's neutral exit is "It's fine as it is", and without it tapMenu took the ADD branch and
    // every caller's one-answer-per-ask assumption broke.
    world.tapMenu = function (limit) {
        for (let g = 0; g < (limit || 12) && world.chips().length; g++) {
            const bar = world.chips();
            const cont = bar.filter((b) => NEUTRAL_RE.test(String(b.textContent)))[0];
            world.tap(cont || bar[0]);
        }
    };
    // ── SELF-ASSESSMENT HELPERS (v7.20.333) ────────────────────────────────────────────────
    // A tick list now stands between every filed answer and the next ask, so the sims need to
    // drive it the way a student does. These name the three surfaces explicitly rather than
    // letting tapMenu guess, so a test can assert WHICH one it is on.
    world.onTickList = function () {
        return world.bubbles.length > 0 && TICK_LIST_RE.test(String(world.bubbles[world.bubbles.length - 1]));
    };
    world.tickChips = function () {
        return world.chips().filter((c) => !NEUTRAL_RE.test(String(c.textContent))
            && !SA_ADD_RE.test(String(c.textContent)));
    };
    // Tick every criterion, then Continue → no follow-up should be offered.
    world.tickAll = function () {
        world.tickChips().forEach((c) => c.click());
        const cont = world.chips().filter((c) => /Continue/i.test(String(c.textContent)))[0];
        if (cont) world.tap(cont);
    };
    // Tick nothing, Continue, then take the ADD branch of the follow-up.
    world.tickNoneThenAdd = function () {
        const cont = world.chips().filter((c) => /Continue/i.test(String(c.textContent)))[0];
        if (cont) world.tap(cont);
        const add = world.chips().filter((c) => SA_ADD_RE.test(String(c.textContent)))[0];
        if (add) world.tap(add);
        return !!add;
    };
    return world;
}

module.exports = {
    attachLiveChipsDeps, attachSlotDeps, attachWmlDeps,
    SRC, ROOT, braceSliceFrom, sliceController, makeWorld, settle, HELP_LABEL_RE, HELP_BAR_RE,
    attachSelfAssessDeps, TICK_LIST_RE, NEUTRAL_RE, SA_ADD_RE,
};
