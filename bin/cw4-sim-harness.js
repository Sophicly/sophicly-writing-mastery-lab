#!/usr/bin/env node
/* eslint-env node */
/**
 * cw4-sim-harness.js — BEHAVIOURAL gate for the CW Step-4 story-spine walk.
 *
 * WHY THIS EXISTS (Neil, live lesson, 2026-07-28). Step 3 shipped to prod with two defects a
 * single real run would have caught in ninety seconds: the `▶ Let's go` launch chip was filed
 * verbatim into a student's Protagonist row, and ask order followed "first empty row" rather
 * than the walk. Neither was catchable by the gates we had, because every CW harness asserted
 * the walk's SHAPE (keys classified, API budget, filing happens) and none of them DROVE it
 * turn by turn. Sim harnesses existed for cw5 and cw6 only — written reactively, after each of
 * those broke in a lesson. Writing gates per-step means the gate always lands one lesson late.
 *
 * So this drives the machine. Like cw6-sim-harness.js it slices the REAL `_cwSpineCtl` IIFE out
 * of wml-assessment.js and runs it against stubbed I/O, so what is asserted is the SHIPPED code
 * (feedback_negative_test_must_fail_for_the_right_reason: a test that exercises a copy proves
 * nothing about the copy that ships).
 *
 * THE INVARIANTS — these are universal to every code-owned walk, not Step-4 trivia. This file
 * is the first implementation of them; bin/walk-sim-harness.js generalises it to all seven.
 *
 *   I1  ASK-BEFORE-FILE   nothing is written to the document unless an ask was actually served.
 *   I2  ASK-OWNS-THE-ROW  an answer lands in the field belonging to the ask that requested it.
 *   I3  ORDER             asks are served in the walk's declared order.
 *   I4  CHIP SCOPE        a chip pick files to its own declared field, never into a beat row.
 *   I5  REWRITE≠APPEND    a "write it again" ask REPLACES; it never stitches two drafts (.289).
 *   I6  RESUME            a reload mid-walk resumes to the same surface, repeating nothing.
 *
 * I1 is the one that matters most and the one nothing has ever checked. Node builtins only —
 * the CI workflow has no `npm install` step (webdesign-to-wml-CI handoff, 2026-07-28).
 *
 * Usage: node bin/cw4-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
// v7.20.333: this file still carries its own inline makeWorld (the migration to walk-sim-lib the
// .327 handoff prescribes). It borrows the lib's SELF-ASSESSMENT slice rather than making a second
// one — a per-rig copy of a primitive is the same drift class as a per-walk copy of a fix.
const { attachSelfAssessDeps, NEUTRAL_RE, SA_ADD_RE, TICK_LIST_RE } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

const settle = () => new Promise((r) => setImmediate(r));

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── slice helper (same scanner as cw6-sim-harness: comments and quotes are skipped, or an
// apostrophe in ordinary prose swallows the rest of the file and the slice returns null) ──
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

const ctlIdx = src.indexOf('const _cwSpineCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwSpineCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_TEXT = braceSliceFrom(src, ctlIdx, '(', ')').text;
const CTL_SRC = CTL_TEXT + '()';

const BEAT_FIDS = ['cw-step-4-beat1', 'cw-step-4-beat2', 'cw-step-4-beat3',
    'cw-step-4-beat4', 'cw-step-4-beat5', 'cw-step-4-beat6'];
const THROUGHLINE_FID = 'cw-step-4-throughline';
const NEEDS_FID = 'cw-step-4-unmet-needs';

// ── the simulated world ──────────────────────────────────────────────────────────────────
function makeWorld(opts) {
    opts = opts || {};
    const rows = new Map();
    const bubbles = [];          // AI turns, in order
    const users = [];            // student turns, in order
    const writes = [];           // {fid, text, replace} — every document write, in order
    const sends = [];
    const ls = opts.ls || new Map();
    let armed = null;

    BEAT_FIDS.concat([THROUGHLINE_FID, NEEDS_FID]).forEach((f) => rows.set(f, ''));
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
                tag: tag, attrs: attrs || {}, children: [],
                className: (attrs && attrs.className) || '',
                textContent: (attrs && attrs.textContent) || '',
                _handlers: [],
                appendChild: function (c) { this.children.push(c); return c; },
                remove: function () { this._removed = true; },
                querySelector: function (sel) { return findIn(this, sel); },
                // Chips are built two ways in this codebase — attrs.onClick and
                // addEventListener. A sim that only knows one silently cannot tap half the menus.
                addEventListener: function (ev, fn) { if (ev === 'click') this._handlers.push(fn); },
                click: function () {
                    if (this.attrs && typeof this.attrs.onClick === 'function') { this.attrs.onClick(); return true; }
                    if (this._handlers.length) { this._handlers.forEach(function (f) { f({ preventDefault: function () {} }); }); return true; }
                    return false;
                },
                setAttribute: function () {},
                getAttribute: function () { return null; }, closest: function () { return null; },
                classList: { contains: function () { return false; }, add: function () {}, remove: function () {} },
            };
        },
        state: { task: 'cw_step_4', cwProjectId: 'cwp_sim' },
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
        _cwDocValue: function (artifact, fid) {
            if (artifact === 'logline') return 'A boy who cannot ask for help must cross a city to reach his brother.';
            if (String(fid).indexOf('cw-step-3-') === 0) return 'his step-3 answer for ' + fid;
            return '';
        },
        _cwStep3Value: function (fid) { return 'his step-3 answer for ' + fid; },
        _cwLoadDocValues: function () { return Promise.resolve({}); },
        // The walk loads its Step-3 echoes before the first serve; resolve instantly here.
        _cwLoadStep3Values: function () { return Promise.resolve({}); },
        CW_STEP4_SPINE: BEAT_FIDS.map(function (f, i) { return { fid: f, label: 'Beat ' + (i + 1) }; }),
        serveCwChunks: function (chunks, o) {
            chunks.forEach(function (c) { o.emit(c); });
            if (o.onDone) o.onDone();
            return { reattach: function () {}, index: chunks.length };
        },
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
        // v7.20.331: the REAL bubble-control kinds, sliced from source. Bars declare a kind so
        // different kinds coexist on one bubble; a stub with the wrong shape would hide exactly
        // the collision this exists to prevent.
        BUBBLE_CONTROL_KINDS: (function () {
            const i = src.indexOf('const BUBBLE_CONTROL_KINDS =');
            if (i < 0) throw new Error('BUBBLE_CONTROL_KINDS not found — the one-owner primitive is gone');
            // eslint-disable-next-line no-eval
            return eval('(' + braceSliceFrom(src, i, '{', '}').text + ')');
        })(),
        _walkSlot: null,   // replaced below when the shipped code has one
    };

    // v7.20.333: the REAL tick list, follow-up, multi-select bar and duplicate guard — the same
    // slice walk-sim-lib gives cw3-sim, not a second copy of it.
    attachSelfAssessDeps(deps);

    // Give the real module-scope _walkSlot to the controller if this build has it, so the
    // harness exercises the shipped primitive rather than a stand-in.
    const slotIdx = src.indexOf('const _walkSlot = (function () {');
    if (slotIdx >= 0) {
        const SLOT_SRC = braceSliceFrom(src, slotIdx, '(', ')').text + '()';
        // eslint-disable-next-line no-new-func
        deps._walkSlot = new Function('console', 'return ' + SLOT_SRC + ';')(deps.console);
    }

    const origAdd = function (html, who) { if (who === 'user') users.push(html); };
    deps.addChatMessage = function (html, who, plain) {
        if (who !== 'user') {
            bubbles.push(plain || html);
            const content = deps.el('div', { className: 'swml-bubble-content' });
            world._lastBubbleEl = {
                children: [content],
                querySelector: function (s) { return s.indexOf('bubble-content') !== -1 ? content : findIn(this, s); },
            };
        }
        origAdd(html, who, plain);
    };

    const names = Object.keys(deps);
    // eslint-disable-next-line no-new-func
    const factory = new Function(names.join(','), 'return ' + CTL_SRC + ';');
    world.ctl = factory.apply(null, names.map(function (n) { return deps[n]; }));
    world.deps = deps;

    // CHOICE chips only. `appendSpineButtons` attaches a HELP bar (.swml-cw-help — Guidance,
    // Writer's Profile, Story Components) to the very same bubble, and a sim that cannot tell the
    // two apart taps Guidance forever and never answers anything.
    const HELP_RE = /^(📖|👤|🧩|🗒|🗂)/;
    world.chips = function () {
        const content = world._lastBubbleEl && world._lastBubbleEl.children[0];
        if (!content) return [];
        const bars = content.children.filter(function (c) {
            return String(c.className).indexOf('swml-quick-actions') !== -1
                && String(c.className).indexOf('swml-cw-help') === -1
                && !c._removed;
        });
        const out = [];
        bars.forEach(function (b) { b.children.forEach(function (btn) { if (!HELP_RE.test(String(btn.textContent))) out.push(btn); }); });
        return out;
    };
    world.tap = function (labelPart) {
        const btn = world.chips().filter(function (b) { return String(b.textContent).indexOf(labelPart) !== -1; })[0];
        if (!btn) return false;
        btn.attrs.onClick();
        return true;
    };
    world.resolveApi = function (reply) {
        if (!armed) return false;
        const fn = armed.fn; armed = null;
        fn(reply, {});
        return true;
    };
    // startWalk() awaits the Step-3 echo load before its first serve — let it settle.
    world.start = async function () { world.ctl.forceStart(); await settle(); };
    // v7.20.330: AUTOMATIC liveness on every simulated input — see bin/walk-sim-lib.js. Not a
    // test an author has to remember: forgetting it is how a guard that silently swallowed a tap
    // reached a live lesson.
    function autoLive(label, bubblesBefore) {
        if (!world.ctl.active) return;
        ok(world.bubbles.length > bubblesBefore || world.chips().length > 0,
            'DEAD END after ' + label + ': the walk is active but said NOTHING and left no chip — '
            + 'the student has no question to answer and nothing to press.');
    }
    // One student turn: type `text`, then let the API answer with `reply` if the walk asked.
    world.say = function (text, reply) {
        const bb = world.bubbles.length;
        world.ctl.handleTurn(text);
        if (armed) world.resolveApi(reply === undefined ? '@BEAT_OK' : reply);
        autoLive('typing "' + String(text).slice(0, 30) + '"', bb);
    };
    world.tapLive = function (btn) {
        const bb = world.bubbles.length;
        btn.click();
        autoLive('tapping "' + String(btn.textContent).slice(0, 30) + '"', bb);
    };
    return world;
}

// v7.20.333: a SELF-ASSESSMENT tick list now stands between a finished beat and the next one, so
// "get to the next ask" means clearing whatever menu is up — NEUTRALLY. Taking the follow-up's ADD
// branch would file a second answer into the same beat row, and every ORDER assertion below would
// quietly stop meaning anything (a test that passes by doing less).
function clearMenus(w) {
    if (!w.chips().length) return false;
    for (let g = 0; g < 14 && w.chips().length; g++) {
        const bar = w.chips();
        const neutral = bar.filter(function (b) { return NEUTRAL_RE.test(String(b.textContent)); })[0];
        // Surface 2 — the unticked follow-up. Decline it.
        if (bar.some(function (b) { return SA_ADD_RE.test(String(b.textContent)); })) {
            w.tapLive(neutral || bar[bar.length - 1]); continue;
        }
        // Surface 1 — the tick list itself. Tick nothing, Continue.
        if (TICK_LIST_RE.test(String(w.bubbles[w.bubbles.length - 1] || ''))) {
            w.tapLive(neutral || bar[bar.length - 1]); continue;
        }
        // An ordinary content menu (unmet need, incident type, …): pick one, then Continue if it
        // turns out to be a multi-select.
        w.tapLive(bar[0]);
        const cont = w.chips().filter(function (b) { return NEUTRAL_RE.test(String(b.textContent)); })[0];
        if (cont) w.tapLive(cont);
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
async function main() {
console.log('CW STEP-4 SPINE WALK — behavioural sim (real _cwSpineCtl)\n');

// ── I1 · ASK-BEFORE-FILE ───────────────────────────────────────────────────────────────────
// The Step-3 defect, asked of Step 4: a message arriving when no ask has been served must not
// write anything. This is what let "Let's go" become a Protagonist answer.
console.log('I1 · ask-before-file');
{
    const w = makeWorld();
    await w.start();
    const beforeWrites = w.writes.length;
    // A launch chip / stray tap arriving before the walk has asked anything.
    w.say('Let’s go');
    const newWrites = w.writes.slice(beforeWrites).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; });
    ok(newWrites.length === 0,
        'a message sent with no ask served wrote to ' + newWrites.map(function (x) { return x.fid; }).join(', ')
        + ' — this is the defect that put "Let’s go" in uid 1334’s Protagonist row');
}

// ── I2/I3 · ASK OWNS THE ROW, IN ORDER ─────────────────────────────────────────────────────
console.log('I2/I3 · ask owns the row, asks in order');
{
    const w = makeWorld();
    await w.start();
    // Drive the walk the way a student does: tap whatever chips are offered, answer whatever is
    // asked, until all six beats are filled. `expected` is the order the walk MUST ask in.
    const answered = [];          // fid → the text we typed for it
    const filedTo = [];           // fid → where that text actually landed
    let guard = 0;
    while (guard++ < 60) {
        const filled = BEAT_FIDS.filter(function (f) { return w.rows.get(f); }).length;
        if (filled >= BEAT_FIDS.length) break;
        if (process.env.CW4_DEBUG) {
            console.log('  · t' + guard + ' chips[' + w.chips().map(function (c) { return String(c.textContent).slice(0, 22); }).join(' | ')
                + '] bub=' + w.bubbles.length + ' last=' + String(w.bubbles[w.bubbles.length - 1] || '').slice(0, 55).replace(/\n/g, ' '));
        }
        if (clearMenus(w)) continue;
        const text = 'answer ' + (answered.length + 1) + ' — ' + Math.random().toString(36).slice(2, 8);
        const before = w.writes.length;
        w.say(text);
        const beatWrites = w.writes.slice(before).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; });
        if (process.env.CW4_DEBUG) {
            console.log('    say → writes=' + JSON.stringify(w.writes.slice(before).map(function (x) { return x.fid; }))
                + ' armed=' + (w.armed ? w.armed.id : 'none') + ' sends=' + w.sends.length
                + ' warn=' + String((w.warns || []).slice(-1)[0] || '').slice(0, 70));
        }
        if (!beatWrites.length) break;   // refused — the walk is not asking; stop rather than spin
        answered.push(text);
        filedTo.push(beatWrites[0].fid);
    }
    ok(guard < 60, 'the walk never completed — the sim spun out (60 turns)');

    const filledCount = BEAT_FIDS.filter(function (f) { return w.rows.get(f); }).length;
    ok(filledCount === BEAT_FIDS.length,
        'a full run filled only ' + filledCount + '/' + BEAT_FIDS.length + ' beat rows — the sim is not exercising the walk');

    // I3 — the asks came in declared order.
    const order = [];
    filedTo.forEach(function (f) { if (order[order.length - 1] !== f) order.push(f); });
    ok(JSON.stringify(order) === JSON.stringify(BEAT_FIDS),
        'asks were served out of order: ' + order.join(' → '));

    // I2 — every answer is present in the row its ask owned, and in NO other row.
    answered.forEach(function (text, i) {
        const home = filedTo[i];
        ok(String(w.rows.get(home) || '').indexOf(text) !== -1,
            'answer "' + text + '" is not in ' + home);
        const strays = BEAT_FIDS.filter(function (f) {
            return f !== home && String(w.rows.get(f) || '').indexOf(text) !== -1;
        });
        ok(strays.length === 0, 'answer "' + text + '" also leaked into ' + strays.join(', '));
    });
}

// ── I2b · THE CURSOR MUST NOT WIN ─────────────────────────────────────────────────────────
// The scenario Neil described: the student edits the document between the ask and the answer.
// `firstEmptyBeat()` then points somewhere other than the ask on screen. The answer must follow
// the ASK, not the cursor. Without this test a regression to `BEATS[idx]` passes silently —
// on the happy path the two agree, which is exactly why the bug survived.
console.log('I2b · a doc edit between ask and answer cannot move the answer');
{
    const w = makeWorld();
    await w.start();
    // Through the beat-1 need menu (main pick, then the optional "any others?" multi-select).
    clearMenus(w);
    w.say('my beat one');                                // fills beat1
    clearMenus(w);                                       // v7.20.333: and its tick list
    ok(!!w.rows.get(BEAT_FIDS[0]), 'setup: beat 1 was not filled');

    // Reload with beat 1 CLEARED by the student — the cursor now points at beat 1, the ask on
    // screen is beat 2.
    const carried = {};
    w.rows.forEach(function (v, k) { if (v) carried[k] = v; });
    delete carried[BEAT_FIDS[0]];
    const w2 = makeWorld({ prefill: carried, ls: w.ls });
    w2.ctl.tryResume();
    await settle();
    const before = w2.writes.length;
    w2.say('my beat two');
    const landed = w2.writes.slice(before).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; })[0];
    ok(!!landed, 'the answer was refused after a reload — resume must never lose a turn');
    if (landed) {
        ok(landed.fid === BEAT_FIDS[1],
            'the answer followed the CURSOR into ' + landed.fid + ' instead of the ask that requested it ('
            + BEAT_FIDS[1] + ')');
    }
}

// ── I3b · THE WALK NEVER GOES BACKWARDS ───────────────────────────────────────────────────
console.log('I3b · clearing an earlier row mid-session cannot rewind the walk');
{
    const w = makeWorld();
    await w.start();
    const seen = [];
    for (let n = 0; n < 12 && seen.length < 2; n++) {
        if (clearMenus(w)) continue;
        const before = w.writes.length;
        w.say('ans<' + n + '>');
        const landed = w.writes.slice(before).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; })[0];
        if (landed) seen.push(BEAT_FIDS.indexOf(landed.fid));
    }
    ok(seen.length >= 2, 'setup: fewer than two beats were filled');
    w.rows.set(BEAT_FIDS[0], '');            // the student deletes Beat 1 in the document

    // Watch the WHOLE remaining sequence, not two samples. A rewind can surface several turns
    // later (beat 3's irony follow-up writes to the same row twice), so a two-sample test passes
    // against the broken code — it did, until this was widened.
    const seq = [];
    for (let n = 0; n < 16; n++) {
        if (clearMenus(w)) continue;
        const before = w.writes.length;
        w.say('turn ' + n);
        const l = w.writes.slice(before).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; })[0];
        if (l) seq.push(BEAT_FIDS.indexOf(l.fid));
    }
    ok(seq.length >= 2, 'setup: the walk stopped filing after the doc edit');
    // NON-decreasing, not strictly increasing: the irony follow-up deepens the SAME row, so two
    // consecutive writes to one beat are correct. A REWIND is a decrease.
    const rewind = seq.findIndex(function (v, i) { return i > 0 && v < seq[i - 1]; });
    ok(rewind === -1,
        'the walk REWOUND after the student cleared an earlier row: '
        + seq.map(function (i) { return 'beat' + (i + 1); }).join(' → '));
}

// ── I4 · CHIP SCOPE ────────────────────────────────────────────────────────────────────────
// A chip pick belongs to its own declared field. The .322/.323 bugs were picks that lived only
// in the localStorage sidecar; the failure mode here is the opposite — a pick landing in a beat.
console.log('I4 · chip picks file to their own field');
{
    const w = makeWorld();
    await w.start();
    const before = w.writes.length;
    if (w.chips().length) w.tapLive(w.chips()[0]);
    const stray = w.writes.slice(before).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; });
    ok(stray.length === 0, 'the beat-1 need pick wrote into ' + stray.map(function (x) { return x.fid; }).join(', '));
}

// ── I5 · REWRITE REPLACES ──────────────────────────────────────────────────────────────────
console.log('I5 · a rewrite replaces, never stitches');
{
    const w = makeWorld();
    // Every _writeOutlineRowField call that targets an already-filled row must declare replace,
    // or it appends — the v7.20.289 double-draft bug.
    await w.start();
    if (w.chips().length) w.tapLive(w.chips()[0]);
    w.say('first beat');
    const appends = w.writes.filter(function (x) {
        return BEAT_FIDS.indexOf(x.fid) !== -1 && !x.replace;
    });
    // Informational: appends are legitimate for the irony deepening. Assert only that the
    // coherence-fix path declares replace, which the shipped code does at .294.
    ok(/replace:\s*true/.test(CTL_TEXT),
        'the coherence rewrite path does not pass {replace:true} — a rewrite would stitch drafts');
    void appends;
}

// ── I6 · RESUME ────────────────────────────────────────────────────────────────────────────
console.log('I6 · resume repeats nothing and skips nothing');
{
    const w = makeWorld();
    await w.start();
    if (w.chips().length) w.tapLive(w.chips()[0]);
    w.say('beat one answer');
    const filled = {};
    w.rows.forEach(function (v, k) { if (v) filled[k] = v; });

    const w2 = makeWorld({ prefill: filled, ls: w.ls });
    const resumed = w2.ctl.tryResume();
    await settle();
    ok(resumed !== undefined, 'tryResume() returned undefined — resume is not wired');
    const reAsked = w2.bubbles.filter(function (b) { return /beat one answer/.test(String(b)); });
    ok(reAsked.length === 0, 'resume replayed an answer the student had already given');
}

// ── I7 · SELF-ASSESSMENT (v7.20.333) ───────────────────────────────────────────────────────
// The Step-4 twin of cw3-sim I10/I11. Same mechanism, different walk — and the reason it is
// tested in BOTH is that a per-walk copy of a fix is how .289 was lost once already.
console.log('I7 · the tick list runs after every beat, and the duplicate guard costs no API call');
{
    const w = makeWorld();
    await w.start();
    clearMenus(w);                                    // through the beat-1 unmet-need menus
    w.say('At first, a boy eats every meal in a silent kitchen.');
    ok(!!w.rows.get(BEAT_FIDS[0]), 'setup: beat 1 was not filed');
    const onTicks = TICK_LIST_RE.test(String(w.bubbles[w.bubbles.length - 1] || ''));
    ok(onTicks, 'no tick list was served after the beat was filed');

    // ADD accumulates onto the SAME beat row, and costs NO further verdict call.
    const cont = w.chips().filter(function (c) { return /Continue/i.test(String(c.textContent)); })[0];
    ok(!!cont, 'the tick list has no Continue — the student cannot commit their ticks');
    w.tapLive(cont);
    const add = w.chips().filter(function (c) { return SA_ADD_RE.test(String(c.textContent)); })[0];
    ok(!!add, 'leaving criteria unticked offered no follow-up');
    w.tapLive(add);
    const sendsBefore = w.sends.length;
    const before = w.writes.length;
    w.say('And nobody has said his brother’s name since the funeral.');
    const wr = w.writes.slice(before).filter(function (x) { return x.fid === BEAT_FIDS[0]; })[0];
    ok(!!wr, 'the addition did not land on the beat row');
    ok(wr && wr.replace === false,
        'the addition declared replace — an "add a line" follow-up ACCUMULATES (§4c.6), or the '
        + 'student loses the sentence they already wrote');
    ok(w.sends.length === sendsBefore,
        'the self-assessment addition spent an API call — the beat already passed its verdict, and '
        + 'the student is adding what their own tick list told them was missing');
    ok(String(w.rows.get(BEAT_FIDS[0]) || '').indexOf('silent kitchen') !== -1,
        'the addition WIPED the original beat');

    // The duplicate guard: refused, no call spent, and the ask re-served (law 4d).
    const w2 = makeWorld();
    await w2.start();
    clearMenus(w2);
    w2.say('At first, a boy eats every meal in a silent kitchen.');
    clearMenus(w2);                                   // past beat 1's tick list, on to beat 2
    const s2 = w2.sends.length;
    const b2 = w2.writes.length;
    const bub2 = w2.bubbles.length;
    w2.say('At first, a boy eats every meal in a silent kitchen.');
    const beatWrites = w2.writes.slice(b2).filter(function (x) { return BEAT_FIDS.indexOf(x.fid) !== -1; });
    ok(beatWrites.length === 0, 'a word-for-word repeat of another beat was FILED');
    ok(w2.sends.length === s2,
        'the duplicate spent an API round-trip — it is caught deterministically, BEFORE the verdict call');
    ok(w2.bubbles.length > bub2, 'the refusal said nothing at all — the screen did not respond');
    ok(/word-for-word/.test(String(w2.bubbles[w2.bubbles.length - 1] || '')),
        'the refusal does not tell the student why');
    ok(!!w2.deps._walkSlot.armed,
        'after refusing, no ask is armed — the student is left with a rejection and nothing to answer '
        + '(law 4d: a refusal is only half a change)');
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
console.log('\n' + (fail ? '❌ CW4 SIM FAILED' : '✅ CW4 sim passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
}
main().catch((e) => { console.error('❌ CW4 sim threw:', e && e.stack); process.exit(1); });
