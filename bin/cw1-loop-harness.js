#!/usr/bin/env node
/* eslint-env node */
/**
 * cw1-loop-harness.js — BEHAVIOURAL gate for the CW Step-1 walk (v7.20.312).
 *
 * Slices the REAL `_cwProfileCtl` out of wml-assessment.js and drives it, so what is asserted is
 * the shipped code (same method as cw5-sim-harness.js / cw6-sim-harness.js / ladder-sim-harness.js).
 *
 * ⭐ THIS EXISTS BECAUSE OF WHAT SHIPPED BEFORE IT. Rifat (uid 1386) answered all twelve questions
 * on prod and the chat then cycled ~866 times with NO student input — 1,765 turns / 1.4 MB of saved
 * chat in a single session — and he never got his Writer's Profile. The loop:
 *
 *   finish() → fireSynthesis() sets active=false and sends its OWN kick → the v7.20.298 revive
 *   block sees an inactive walk and "rescues" it → tryResume RESURRECTS the finished walk at Q12
 *   → the walk eats its own kick as the student's answer → hits TOTAL → finish() → repeat.
 *
 * Nothing errored. Every pre-ship gate was green, because none of them drove Step 1 at all. The
 * assertions below are the ones that would have caught it on day one, so they are a gate now.
 *
 * Each fix is asserted against a NEGATIVE CONTROL — the guard is stripped from a copy of the real
 * source and the harness proves the failure REAPPEARS. A regression test that cannot fail is not a
 * test (memory: feedback_negative_test_must_fail_for_the_right_reason).
 *
 * Usage: node bin/cw1-loop-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { attachSlotDeps } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// Brace-matched slice. Line comments are skipped because an apostrophe in ordinary prose reads as
// an opening quote to this scanner and would swallow the rest of the file (cw5-sim's lesson).
function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    let d = 0;
    for (let k = start; k < s.length; k++) {
        const c = s[k];
        if (c === open) d++;
        else if (c === close) { d--; if (d === 0) return { text: s.slice(start, k + 1), end: k + 1 }; }
        else if (c === '/' && s[k + 1] === '/') { while (k < s.length && s[k] !== '\n') k++; }
        else if (c === '/' && s[k + 1] === '*') { k = s.indexOf('*/', k) + 1; }
        else if (c === '\'' || c === '"' || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return null;
}

const CTL_ANCHOR = 'const _cwProfileCtl = (function () {';
const ctlIdx = src.indexOf(CTL_ANCHOR);
if (ctlIdx < 0) { console.error('❌ _cwProfileCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC_REAL = braceSliceFrom(src, ctlIdx, '(', ')').text + '()';

const TOTAL = 12;

// ── The world the controller runs in ────────────────────────────────────────────────────────────
// `filledBoxes` = how many of q1..q12 already hold text (what docIdx() reads out of the document).
// `shownUpTo`   = the highest "**Question N of 12**" header present in the replayed transcript
//                 (what chatIdx() reads). 0 = no header at all.
function makeWorld(opts, CTL_SRC) {
    opts = opts || {};
    const rows = new Map();
    const bubbles = [];
    const users = [];
    const sends = [];
    const ls = new Map();
    const world = { finishes: 0, warns: [], errors: [] };

    for (let n = 1; n <= TOTAL; n++) {
        rows.set('cw-step-1-q' + n, n <= (opts.filledBoxes || 0) ? 'an answer for q' + n : '');
    }

    const canvasChatHistory = [];
    for (let n = 1; n <= (opts.shownUpTo || 0); n++) {
        canvasChatHistory.push({ role: 'assistant', content: '**Question ' + n + ' of ' + TOTAL + ' · Section**' });
        if (n <= (opts.filledBoxes || 0)) canvasChatHistory.push({ role: 'user', content: 'an answer for q' + n });
    }

    // A minimal ProseMirror-shaped doc: descendants() over one outlineRow per question.
    const canvasEditor = {
        state: {
            doc: {
                descendants: function (fn) {
                    for (let n = 1; n <= TOTAL; n++) {
                        const fid = 'cw-step-1-q' + n;
                        fn({ type: { name: 'outlineRow' }, attrs: { fieldId: fid }, textContent: rows.get(fid) });
                    }
                },
            },
        },
        getText: () => '',
        getHTML: () => '',
    };

    // The REAL hand-off flag + circuit breaker, sliced out of the module scope.
    const handoffSrc = braceSliceFrom(src, src.indexOf('function armCwWalkHandoff('), '{', '}').text;
    const consumeSrc = braceSliceFrom(src, src.indexOf('function consumeCwWalkHandoff('), '{', '}').text;
    const ttlM = /const CW_HANDOFF_TTL_MS = (\d+)/.exec(src);
    const burstM = /const CW_HANDOFF_MAX_BURST = (\d+)/.exec(src);
    if (!ttlM || !burstM) { console.error('❌ hand-off constants not found'); process.exit(1); }
    const handoff = (function () {
        let _cwWalkHandoff = null;
        let _cwHandoffFires = [];
        const CW_HANDOFF_TTL_MS = parseInt(ttlM[1], 10);
        const CW_HANDOFF_MAX_BURST = parseInt(burstM[1], 10);
        const state = { task: 'cw_step_1' };
        const console_ = { log: () => {}, warn: () => {}, error: (m) => world.errors.push(String(m)) };
        // eslint-disable-next-line no-new-func
        const mk = new Function('state', 'console', 'holder', `
            let _cwWalkHandoff = null, _cwHandoffFires = [];
            const CW_HANDOFF_TTL_MS = ${CW_HANDOFF_TTL_MS}, CW_HANDOFF_MAX_BURST = ${CW_HANDOFF_MAX_BURST};
            function armCwWalkHandoff(id) ${handoffSrc}
            function consumeCwWalkHandoff() ${consumeSrc}
            return { armCwWalkHandoff, consumeCwWalkHandoff };
        `);
        void _cwWalkHandoff; void _cwHandoffFires;
        return mk(state, console_, null);
    })();

    const deps = {
        state: { task: 'cw_step_1', cwProjectId: 'cwp_test', text: 'creative_writing', board: 'universal' },
        canvasChatHistory,
        canvasChatId: 'chat_test',
        canvasEditor,
        chatTextarea: { value: '', style: {} },
        chatSendBtn: {
            disabled: false, innerHTML: '', textContent: '', style: {},
            classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
            setAttribute() {}, removeAttribute() {},
        },
        canvasSilentSend: false,
        aiBubble: function (t) { bubbles.push(String(t)); if (/all twelve/.test(String(t))) world.finishes++; },
        addChatMessage: function (t, who) { if (who === 'user') users.push(String(t)); else bubbles.push(String(t)); },
        formatAI: (t) => String(t),
        stripAIInternals: (t) => String(t),
        el: function (tag, attrs) {
            const n = { tag, attrs: attrs || {}, children: [], className: (attrs && attrs.className) || '',
                textContent: (attrs && attrs.textContent) || '', style: {},
                appendChild(c) { this.children.push(c); }, querySelector: () => null,
                querySelectorAll: () => [], addEventListener() {},
                classList: { add() {}, remove() {}, toggle() {}, contains: () => false } };
            return n;
        },
        saveCanvasChat: function () {},
        saveCanvasContent: function () {},
        _writeOutlineRowField: function (fid, val) { rows.set(fid, String(val)); return true; },
        applyCwSubstepProgress: function () {},
        armCwWalkHandoff: handoff.armCwWalkHandoff,
        localStorage: { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: (k) => ls.delete(k) },
        setTimeout: function (fn) { if (opts.runTimers !== false) fn(); return 0; },
        clearTimeout: function () {},
        console: {
            log: () => {}, error: (m) => world.errors.push(String(m)),
            warn: (m) => world.warns.push(String(m)),
        },
        window: { WML: { cwProject: { saveArtifact: () => Promise.resolve(), loadArtifact: () => Promise.resolve(null) } } },
        document: { querySelector: () => null, querySelectorAll: () => [] },
        // THE SEND. This is the seam the loop ran through, so the harness models the real gate:
        // sendCanvasMessage consults the hand-off flag, and only then may revive an inactive walk.
        sendCanvasMessage: function () {
            sends.push(deps.chatTextarea.value);
            // Each hand-off cycle produces exactly one of these. `aiBubble` is defined INSIDE the
            // controller, so the send — not the bubble — is the observable that counts cycles.
            if (/answered all twelve/.test(String(deps.chatTextarea.value))) world.finishes++;
            if (world.sendGuard === false) {                     // negative control: pre-.312 gate
                if (!world.ctl.active) world.ctl.tryResume();
            } else {
                const handingOff = handoff.consumeCwWalkHandoff();
                if (!handingOff && !world.ctl.active) world.ctl.tryResume();
            }
            // Whatever now owns the turn processes this message, exactly as the pipeline would.
            if (world.ctl.active) world.ctl.handleTurn(deps.chatTextarea.value);
        },
    };

    // v7.20.345: the shared lifter for the module-scope primitives the walks call (_walkSlot,
    // _cwLastAssistantIs, cwProgressBar, _cwNodeText, cwAnswerOptions, _cwReplay/_cwIsReplay).
    // Lifted from the real source, never stubbed — a stub here would let a walk ship with a dead
    // primitive and this rig would still go green.
    attachSlotDeps(deps);

    const names = Object.keys(deps);
    // eslint-disable-next-line no-new-func
    world.ctl = new Function(names.join(','), 'return ' + CTL_SRC + ';').apply(null, names.map((n) => deps[n]));
    world.rows = rows; world.bubbles = bubbles; world.users = users; world.sends = sends;
    world.ls = ls; world.deps = deps; world.handoff = handoff;
    return world;
}

// A copy of the real controller with ONE guard removed — the negative control.
function stripCompletionGuard(s) {
    const marker = 'if (fromDoc >= TOTAL) {';
    const i = s.indexOf(marker);
    if (i < 0) return null;
    const block = braceSliceFrom(s, i, '{', '}');
    return s.slice(0, i) + s.slice(block.end);
}

console.log('CW STEP-1 WRITER-PROFILE WALK — loop gate (real _cwProfileCtl)');

// ── 1. A FINISHED WALK IS NEVER RESURRECTED (the arithmetic root) ───────────────────────────────
{
    const w = makeWorld({ filledBoxes: 12, shownUpTo: 12 }, CTL_SRC_REAL);
    const revived = w.ctl.tryResume();
    ok(revived === false, 'all 12 filed + Q12 shown → tryResume must refuse (got ' + revived + ')');
    ok(w.ctl.active === false, 'a completed walk must not be left active');

    // NEGATIVE CONTROL — strip the guard and the resurrection returns.
    const stripped = stripCompletionGuard(CTL_SRC_REAL);
    if (ok(stripped !== null, 'negative control: completion guard located in source')) {
        const n = makeWorld({ filledBoxes: 12, shownUpTo: 12 }, stripped);
        ok(n.ctl.tryResume() === true,
            'NEGATIVE CONTROL FAILED: without the guard a finished walk should resurrect — the '
            + 'assertion above is not testing what it claims');
    }
    console.log('   ✓ a completed walk is not resumed (and the guard is what stops it)');
}

// ── 2. THE .298 RESCUE STILL WORKS (do not over-correct) ────────────────────────────────────────
{
    const w = makeWorld({ filledBoxes: 7, shownUpTo: 8 }, CTL_SRC_REAL);
    ok(w.ctl.tryResume() === true, 'a PARTLY-done walk (7 filed, Q8 shown) must still be revived');
    ok(w.ctl.active === true, 'revived walk must be active so the next answer is filed');
    console.log('   ✓ a part-finished walk is still rescued — Fatou\'s fix is intact');
}

// handleTurn is async — every driving test must await it, or the assertions run before the walk has
// moved and a thrown ReferenceError disappears into an unobserved rejection.
async function drive(w, msg) {
    try { await w.ctl.handleTurn(msg); }
    catch (e) { world_err(e); }
}
function world_err(e) {
    asserts.fail++; fail = 1;
    console.error('  ❌ handleTurn threw: ' + (e && (e.stack || e.message) || e));
}

(async () => {

// ── 3. THE WALK NEVER EATS ITS OWN HAND-OFF (the loop itself) ───────────────────────────────────
{
    const w = makeWorld({ filledBoxes: 11, shownUpTo: 12 }, CTL_SRC_REAL);
    ok(w.ctl.tryResume() === true, 'setup: 11 filed + Q12 shown resumes at Q12');
    await drive(w, 'comedy and mystery');            // answers Q12 → finish() → fireSynthesis()
    ok(w.finishes === 1, 'the hand-off cycle must run EXACTLY once (got ' + w.finishes + ')');
    ok(w.sends.length === 1, 'the synthesis must be sent EXACTLY once (got ' + w.sends.length + ')');
    ok(/answered all twelve/.test(w.sends[0] || ''), 'the one send is the synthesis kick');
    ok(w.ctl.active === false, 'the walk stays closed after handing off');
    ok(!/answered all twelve/.test(w.rows.get('cw-step-1-q12') || ''),
        'the kick text must NEVER be filed into a document box (it was, 866 times, for Rifat)');
    ok((w.rows.get('cw-step-1-q12') || '') === 'comedy and mystery',
        'q12 holds the STUDENT\'S answer, verbatim');

    // NEGATIVE CONTROL — restore the pre-.312 gate (revive without consulting the hand-off) and
    // the loop must reappear. Bounded by the circuit breaker, which is itself the proof it works.
    const n = makeWorld({ filledBoxes: 11, shownUpTo: 12 }, stripCompletionGuard(CTL_SRC_REAL));
    n.sendGuard = false;
    n.ctl.tryResume();
    await drive(n, 'comedy and mystery');
    ok(n.finishes > 1,
        'NEGATIVE CONTROL FAILED: with the pre-.312 gate this scenario must loop (finishes='
        + n.finishes + ') — otherwise test 3 proves nothing');
    ok(n.errors.some((e) => /refusing to send again/.test(e)),
        'the circuit breaker must STOP a real loop and say so loudly');
    console.log('   ✓ the hand-off cannot be re-consumed (and the loop returns without the guard, '
        + 'stopped by the breaker after ' + n.finishes + ' cycles)');
}

// ── 4. THE CIRCUIT BREAKER, DIRECTLY ───────────────────────────────────────────────────────────
{
    const w = makeWorld({ filledBoxes: 0, shownUpTo: 0 }, CTL_SRC_REAL);
    const burst = parseInt(/const CW_HANDOFF_MAX_BURST = (\d+)/.exec(src)[1], 10);
    let lastOk = true;
    for (let i = 0; i < burst; i++) lastOk = w.handoff.armCwWalkHandoff('t' + i);
    ok(lastOk === true, 'the breaker must allow up to ' + burst + ' hand-offs');
    ok(w.handoff.armCwWalkHandoff('over') === false,
        'hand-off ' + (burst + 1) + ' in the window must be REFUSED');
    console.log('   ✓ circuit breaker trips after ' + burst + ' hand-offs in the window');
}

// ── 5. THE ONE-SHOT CONTRACT ───────────────────────────────────────────────────────────────────
{
    const w = makeWorld({}, CTL_SRC_REAL);
    w.handoff.armCwWalkHandoff('once');
    ok(w.handoff.consumeCwWalkHandoff() === true, 'an armed hand-off is consumed once');
    ok(w.handoff.consumeCwWalkHandoff() === false,
        'a consumed hand-off must NOT disarm a later genuine student turn');
    console.log('   ✓ the flag is one-shot — a real turn after it is still revivable');
}

// ── 6. STATIC: the wiring cannot be silently unplugged ─────────────────────────────────────────
{
    const fire = braceSliceFrom(src, src.indexOf('function fireSynthesis()'), '{', '}').text;
    ok(fire.indexOf('armCwWalkHandoff') !== -1, 'fireSynthesis must arm the hand-off');
    ok(fire.indexOf('armCwWalkHandoff') < fire.indexOf('sendCanvasMessage'),
        'the hand-off must be armed BEFORE the send, or the revive block wins the race');
    ok(/const _cwHandingOff = consumeCwWalkHandoff\(\);/.test(src)
        && /if \(!_walkResume && !_cwHandingOff\)/.test(src),
        'the v7.20.298 revive block must consult the hand-off flag');
    console.log('   ✓ arm-before-send and the revive gate are wired in the shipped source');
}

console.log('   ' + asserts.pass + ' assertions passed'
    + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
if (fail) { console.error('❌ cw1-loop-harness FAILED'); process.exit(1); }
console.log('✅ cw1-loop-harness passed (finished walks stay finished; a walk never eats its own hand-off).');

})().catch((e) => { console.error('❌ cw1-loop-harness CRASHED: ' + (e && (e.stack || e.message))); process.exit(1); });
