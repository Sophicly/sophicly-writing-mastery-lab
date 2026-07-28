#!/usr/bin/env node
/* eslint-env node */
/**
 * cw3-sim-harness.js — BEHAVIOURAL gate for the CW Step-3 logline walk (v7.20.327).
 *
 * cw3-batch-harness.js guards the CONTRACT statically (two API calls, verbatim filing, the
 * review stays actionable). This DRIVES the walk, because the two defects that reached a live
 * lesson on 2026-07-28 were both invisible to a static check:
 *   · the `▶ Let's go` launch chip was filed verbatim into uid 1334's Protagonist row, and every
 *     later answer sat one place behind where the student thought it was going;
 *   · asks followed "first empty row", so a student typing into the document made the walk skip
 *     an ask, and clearing a row made it jump backwards.
 *
 * Same invariants as cw4-sim-harness, from the same rig (bin/walk-sim-lib.js) so the two cannot
 * drift — a per-step COPY is how the v7.20.289 replace-vs-append fix was made in one controller
 * and lost in another.
 *
 * Usage: node bin/cw3-sim-harness.js
 */
'use strict';

const { sliceController, makeWorld, settle } = require('./walk-sim-lib');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

const CTL = sliceController('const _cwLoglineCtl = (function () {');

const COMPONENTS = ['protagonist', 'flaw', 'wound', 'incident', 'goal', 'obstacle', 'stakes']
    .map((t) => 'cw-step-3-' + t);
const FORMULAS = ['cw-step-3-logline-1', 'cw-step-3-logline-2', 'cw-step-3-logline-3'];
const STEP_FIDS = COMPONENTS.concat(FORMULAS);
const ALL_FIDS = STEP_FIDS.concat(['cw-step-3-chosen', 'cw-step-3-chosen-idea']);

function world(opts) {
    return makeWorld(CTL, Object.assign({ task: 'cw_step_3', fids: ALL_FIDS, ok: ok }, opts || {}));
}
const stepWrites = (w, from) => w.writes.slice(from).filter((x) => STEP_FIDS.indexOf(x.fid) !== -1);

async function main() {
console.log('CW STEP-3 LOGLINE WALK — behavioural sim (real _cwLoglineCtl)\n');

// ── I1 · ASK-BEFORE-FILE ───────────────────────────────────────────────────────────────────
console.log('I1 · ask-before-file');
{
    const w = world();
    // No walk started at all — exactly the state the greeting's launch chip is tapped in.
    const before = w.writes.length;
    w.say('Let’s go');
    ok(stepWrites(w, before).length === 0,
        'a message sent before the walk started wrote to '
        + stepWrites(w, before).map((x) => x.fid).join(', ')
        + ' — this is the defect that put "Let’s go" in uid 1334’s Protagonist row');
}

// ── I2/I3 · ASK OWNS THE ROW, ASKS IN ORDER ────────────────────────────────────────────────
console.log('I2/I3 · ask owns the row, asks strictly in order');
{
    const w = world();
    w.ctl.forceStart();
    await settle();

    const answered = [], filedTo = [];
    let guard = 0;
    while (guard++ < 40) {
        if (STEP_FIDS.every((f) => w.rows.get(f))) break;
        if (w.chips().length) { w.tapMenu(); continue; }
        const text = 'answer<' + (answered.length + 1) + '>';
        const before = w.writes.length;
        w.say(text, '@ALL_OK');
        const landed = stepWrites(w, before)[0];
        if (!landed) break;
        answered.push(text); filedTo.push(landed.fid);
    }
    ok(guard < 40, 'the walk never completed — the sim spun out');
    const filled = STEP_FIDS.filter((f) => w.rows.get(f)).length;
    ok(filled === STEP_FIDS.length,
        'a full run filled only ' + filled + '/' + STEP_FIDS.length + ' rows — the sim is not exercising the walk');

    // I3 — every ask came in declared order, and none was repeated.
    const idxs = filedTo.map((f) => STEP_FIDS.indexOf(f));
    const strictlyIncreasing = idxs.every((v, i) => i === 0 || v > idxs[i - 1]);
    ok(strictlyIncreasing, 'asks were served out of order: ' + filedTo.join(' → '));

    // I2 — each answer is in its own row and in NO other row.
    answered.forEach((text, i) => {
        const home = filedTo[i];
        ok(String(w.rows.get(home) || '').indexOf(text) !== -1, 'answer "' + text + '" is not in ' + home);
        const strays = STEP_FIDS.filter((f) => f !== home && String(w.rows.get(f) || '').indexOf(text) !== -1);
        ok(strays.length === 0, 'answer "' + text + '" also leaked into ' + strays.join(', '));
    });
}

// ── I2b · A DOC EDIT CANNOT MOVE THE ANSWER ───────────────────────────────────────────────
// The scenario Neil described: the document is editable and open beside the chat. Before .327
// the walk re-scanned for the first empty row on every turn, so clearing a row sent the next
// answer backwards into it.
console.log('I2b · a doc edit between ask and answer cannot move the answer');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    ok(w.toAsk(), 'the paced intro never reached a live ask — the student cannot answer anything');
    w.say('my protagonist');                       // fills component 1, serves component 2
    ok(!!w.rows.get(COMPONENTS[0]), 'setup: component 1 was not filled');

    // The student clears component 1 by hand while looking at the component-2 ask.
    const carried = {};
    w.rows.forEach((v, k) => { if (v) carried[k] = v; });
    delete carried[COMPONENTS[0]];
    const w2 = world({ prefill: carried, ls: w.ls });
    w2.ctl.tryResume();
    await settle();
    const before = w2.writes.length;
    w2.say('my flaw');
    const landed = stepWrites(w2, before)[0];
    ok(!!landed, 'the answer was refused after a reload — a resume must never lose a turn');
    if (landed) {
        ok(landed.fid === COMPONENTS[1],
            'the answer followed the CURSOR into ' + landed.fid + ' instead of the ask that requested it ('
            + COMPONENTS[1] + ')');
    }
}

// ── I3b · THE WALK NEVER GOES BACKWARDS ───────────────────────────────────────────────────
// Neil's "questions appearing in the wrong order". The document is open beside the chat, and
// before .327 the next ask was chosen by re-scanning for the FIRST EMPTY row — so a student who
// cleared an earlier box mid-session sent the walk back to re-ask it, out of sequence. Resuming
// from the document on ENTRY is right; re-deriving position on every turn is not.
console.log('I3b · clearing an earlier row mid-session cannot rewind the walk');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    w.toAsk();
    const seen = [];
    for (let n = 0; n < 3; n++) {
        if (w.chips().length) { w.tapMenu(); continue; }
        const before = w.writes.length;
        w.say('ans<' + n + '>', '@ALL_OK');
        const landed = stepWrites(w, before)[0];
        if (landed) seen.push(STEP_FIDS.indexOf(landed.fid));
    }
    ok(seen.length >= 2, 'setup: fewer than two answers were filed');

    // The student deletes their protagonist answer in the document, mid-walk.
    w.rows.set(COMPONENTS[0], '');

    // TWO turns. The turn immediately after the edit still files against its own armed slot;
    // the rewind shows on the turn AFTER that, when the walk picks the next ask. A test that
    // stops at one turn passes against the broken code — it did, until this was fixed.
    const t1 = w.writes.length;
    w.say('the next answer', '@ALL_OK');
    const l1 = stepWrites(w, t1)[0];
    ok(!!l1, 'the next answer was not filed at all after a mid-session doc edit');
    const t2 = w.writes.length;
    w.say('and the one after that', '@ALL_OK');
    const l2 = stepWrites(w, t2)[0];
    ok(!!l2, 'the following answer was not filed at all');
    if (l1 && l2) {
        const a1 = STEP_FIDS.indexOf(l1.fid), a2 = STEP_FIDS.indexOf(l2.fid);
        ok(a1 > seen[seen.length - 1], 'the walk rewound immediately, to ' + l1.fid);
        ok(a2 > a1,
            'the walk REWOUND to ' + l2.fid + ' after the student cleared an earlier row — '
            + 'asks must only ever move forward');
    }
}

// ── I7 · A PRISTINE DOCUMENT IS A FRESH START, NOT A RESUME ───────────────────────────────
// Neil, staging .329: an empty doc with no sidecar and no chat history reported
// "resumed at step 1/10" and went ACTIVE, so the greeting's start button had nothing to hand
// the turn to — help chips, no question, no way forward. The corruption was gone and the step
// was unusable, which is not a trade worth making.
console.log('I7 · a pristine document starts fresh (and a stale tap re-serves the ask)');
{
    const w = world();                       // empty rows, empty localStorage
    const resumed = w.ctl.tryResume();
    ok(resumed === false,
        'a pristine document with no sidecar claimed a RESUME — the walk goes active with nothing '
        + 'served and the student is stranded on the greeting');
    ok(w.ctl.active === false, 'the walk went active on a pristine document');

    // A PART-finished document must still revive from the document (the v7.20.298 Fatou fix).
    const w2 = world({ prefill: { 'cw-step-3-protagonist': 'a real earlier answer' } });
    ok(w2.ctl.tryResume() === true,
        'a part-finished document no longer revives from the document — that is the v7.20.298 fix lost');

    // And nudge() re-serves the ask rather than leaving them looking at nothing.
    const bubblesBefore = w2.bubbles.length;
    ok(w2.ctl.nudge() === true, 'nudge() did not re-serve the ask on an active walk');
    ok(w2.bubbles.length > bubblesBefore, 'nudge() served no bubble — the student still sees no question');
    const wroteAnything = w2.writes.filter((x) => STEP_FIDS.indexOf(x.fid) !== -1).length;
    ok(wroteAnything === 0, 'nudge() wrote to the document — it must only re-serve, never file');
}

// ── I0 · LIVENESS — the student can ALWAYS act ────────────────────────────────────────────
// Deliberately numbered before the rest: this is the invariant every other one is a negative of.
// A suite of "X must not happen" passes perfectly on a screen that does nothing.
console.log('I0 · liveness — after every event the student can still act');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    w.assertLive(ok, 'the walk starting');

    // Every ordinary turn of a full run.
    let guard = 0;
    while (guard++ < 40 && !STEP_FIDS.every((f) => w.rows.get(f))) {
        const bb = w.bubbles.length;
        if (w.chips().length) { w.tapMenu(); w.assertLiveAfterInput(ok, 'a chip tap', bb); continue; }
        w.say('answer ' + guard, '@ALL_OK');
        w.assertLiveAfterInput(ok, 'answering ask ' + guard, bb);
    }

    // A reload mid-walk.
    const carried = {};
    w.rows.forEach((v, k) => { if (v) carried[k] = v; });
    const w2 = world({ prefill: { 'cw-step-3-protagonist': carried['cw-step-3-protagonist'] || 'x' }, ls: w.ls });
    w2.ctl.tryResume();
    await settle();
    w2.assertLive(ok, 'a reload mid-walk');

    // And a stale chip tap — the case that produced the dead end on staging. nudge() is what the
    // dispatcher calls when it swallows one; it must leave the student able to act.
    const bb2 = w2.bubbles.length;
    w2.ctl.nudge();
    w2.assertLiveAfterInput(ok, 'a stale quick-action tap being swallowed', bb2);
}

// ── I8 · BUBBLE CONTROLS COEXIST, IN EITHER ORDER ─────────────────────────────────────────
// The defect Neil photographed at .330: three DIFFERENT bars — help buttons, the `Continue →`
// nav, and choice chips — all guarded on the shared `.swml-quick-actions`, so whichever attached
// FIRST silently blocked the others. The help bar won and the Continue vanished, leaving an
// intro chunk with no question and nothing to press.
//
// Tested DIRECTLY rather than inferred from a run: whichever order they arrive in, both must end
// up on the bubble. That makes the outcome order-independent, so the underlying timing race stops
// being something we have to win.
console.log('I8 · a help bar and a Continue nav coexist on one bubble, in either order');
{
    const w = world();
    const K = w.deps.BUBBLE_CONTROL_KINDS;
    ok(!!K && K.help && K.nav && K.choice, 'BUBBLE_CONTROL_KINDS is missing — there is no single owner of bubble controls');

    const barsOn = (content) => ({
        help: !!content.children.filter((c) => String(c.className).indexOf(K.help) !== -1).length,
        nav: !!content.children.filter((c) => String(c.className).indexOf(K.nav) !== -1).length,
    });

    // HELP FIRST, then the paced run attaches its nav — the order that broke on staging.
    w.deps.addChatMessage('a teaching chunk', 'ai', 'a teaching chunk');
    const content = w._lastBubbleEl.children[0];
    content.appendChild(w.deps.el('div', { className: 'swml-quick-actions ' + K.help }));
    w.deps.serveCwChunks(['chunk one', 'chunk two'], { emit: () => {}, onDone: () => {} });
    const after = barsOn(content);
    ok(after.help, 'the help bar was lost');
    ok(after.nav,
        'the `Continue →` was SUPPRESSED because a help bar was already on the bubble — this is the '
        + 'exact screen Neil photographed: teaching text, help buttons, no question, nothing to press');

    // NAV FIRST, then help — the mirror. Same requirement.
    w.deps.addChatMessage('another chunk', 'ai', 'another chunk');
    const c2 = w._lastBubbleEl.children[0];
    c2.appendChild(w.deps.el('div', { className: 'swml-quick-actions ' + K.nav }));
    c2.appendChild(w.deps.el('div', { className: 'swml-quick-actions ' + K.help }));
    const m2 = barsOn(c2);
    ok(m2.nav && m2.help, 'the two kinds cannot coexist in the reverse order either');
}

// ── I5 · THE SHARPEN REWRITE REPLACES ─────────────────────────────────────────────────────
// The .289 bug, reintroduced by .325: the review's "Sharpen my X" chip tells the student their
// new version REPLACES the old one, then appended, leaving both drafts stitched in one row.
console.log('I5 · a sharpen rewrite replaces, never stitches');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    let guard = 0;
    while (guard++ < 20 && !COMPONENTS.every((f) => w.rows.get(f))) {
        if (w.chips().length) { w.tapMenu(); continue; }
        w.say('component answer ' + guard, '@WEAK: flaw');
    }
    ok(COMPONENTS.every((f) => w.rows.get(f)), 'setup: the seven components were not all filled');

    // The component review returns one weak component → its "Sharpen" chip is offered.
    const sharpen = w.chips().filter((c) => /Sharpen/i.test(String(c.textContent)))[0];
    ok(!!sharpen, 'the review offered no Sharpen chip for the weak component');
    if (sharpen) {
        const originally = w.rows.get(COMPONENTS[1]);
        sharpen.click();
        const before = w.writes.length;
        w.say('a completely rewritten flaw');
        const wr = stepWrites(w, before)[0];
        ok(!!wr && wr.replace === true, 'the rewrite did not declare replace — it will stitch both drafts');
        const now = String(w.rows.get(COMPONENTS[1]) || '');
        ok(now.indexOf('a completely rewritten flaw') !== -1, 'the rewrite is not in the row');
        ok(now.indexOf(originally) === -1 || originally === '',
            'the row still holds the OLD draft as well as the new one — both are stitched together '
            + '(the v7.20.289 bug)');
    }
}

// ── I6 · RESUME REPEATS NOTHING ────────────────────────────────────────────────────────────
console.log('I6 · resume repeats nothing and loses nothing');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    w.toAsk();
    w.say('protagonist answer');
    const carried = {};
    w.rows.forEach((v, k) => { if (v) carried[k] = v; });

    const w2 = world({ prefill: carried, ls: w.ls });
    w2.ctl.tryResume();
    await settle();
    ok(w2.bubbles.filter((b) => /protagonist answer/.test(String(b))).length === 0,
        'resume replayed an answer the student had already given');
    const before = w2.writes.length;
    w2.say('flaw answer');
    ok(stepWrites(w2, before).length > 0, 'after a resume the next answer was not filed at all');
}

console.log('\n' + (fail ? '❌ CW3 SIM FAILED' : '✅ CW3 sim passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
}
main().catch((e) => { console.error('❌ CW3 sim threw:', e && e.stack); process.exit(1); });
