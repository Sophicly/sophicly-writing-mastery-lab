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

// Chips the student can actually choose between. `appendStepButtons` / `appendSpineButtons`
// attach a HELP bar to the SAME bubble; a rig that cannot tell them apart taps Guidance forever.
const HELP_RE = /^(📖|👤|🧩|🗒|🗂|💡|🤔)/;

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

    const world = { rows, bubbles, users, writes, sends, ls, get armed() { return armed; } };

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
            .forEach((bar) => bar.children.forEach((b) => { if (!HELP_RE.test(String(b.textContent))) out.push(b); }));
        return out;
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

    // Tap through a chip menu: prefer an explicit Continue, else the first option.
    world.tapMenu = function (limit) {
        for (let g = 0; g < (limit || 12) && world.chips().length; g++) {
            const bar = world.chips();
            const cont = bar.filter((b) => /Continue|Done|Next|Move on/i.test(String(b.textContent)))[0];
            world.tap(cont || bar[0]);
        }
    };
    return world;
}

module.exports = { SRC, ROOT, braceSliceFrom, sliceController, makeWorld, settle, HELP_RE };
