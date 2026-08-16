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

// v7.20.333: a SELF-ASSESSMENT tick list now stands between every filed answer and the next ask,
// and a group boundary review is fired from the tick list's Continue rather than from the answer.
// So "get to the next ask" means: clear the menu neutrally, and resolve any API call that the
// clearing kicked off. Every loop below goes through this — a loop that only calls say() would
// stall at the first tick list and report a walk that "filled 7/10 rows".
function clearMenus(w, reply) {
    if (!w.chips().length) return false;
    w.tapMenu();
    if (w.armed) w.resolveApi(reply);
    return true;
}

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
    while (guard++ < 80) {
        if (STEP_FIDS.every((f) => w.rows.get(f))) break;
        if (clearMenus(w, '@ALL_OK')) continue;
        const text = 'answer<' + (answered.length + 1) + '>';
        const before = w.writes.length;
        w.say(text, '@ALL_OK');
        const landed = stepWrites(w, before)[0];
        if (!landed) break;
        answered.push(text); filedTo.push(landed.fid);
    }
    ok(guard < 80, 'the walk never completed — the sim spun out');
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
    w.say('my protagonist');                       // fills component 1
    clearMenus(w, '@ALL_OK');                      // v7.20.333: through its tick list, on to component 2
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
    for (let n = 0; n < 8 && seen.length < 3; n++) {
        if (clearMenus(w, '@ALL_OK')) continue;
        const before = w.writes.length;
        w.say('ans<' + n + '>', '@ALL_OK');
        const landed = stepWrites(w, before)[0];
        if (landed) seen.push(STEP_FIDS.indexOf(landed.fid));
    }
    ok(seen.length >= 2, 'setup: fewer than two answers were filed');
    clearMenus(w, '@ALL_OK');                      // off the last tick list, onto the next ask

    // The student deletes their protagonist answer in the document, mid-walk.
    w.rows.set(COMPONENTS[0], '');

    // TWO turns. The turn immediately after the edit still files against its own armed slot;
    // the rewind shows on the turn AFTER that, when the walk picks the next ask. A test that
    // stops at one turn passes against the broken code — it did, until this was fixed.
    const t1 = w.writes.length;
    w.say('the next answer', '@ALL_OK');
    const l1 = stepWrites(w, t1)[0];
    ok(!!l1, 'the next answer was not filed at all after a mid-session doc edit');
    clearMenus(w, '@ALL_OK');
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

    // Every ordinary turn of a full run — including every tick list and every follow-up.
    let guard = 0;
    while (guard++ < 80 && !STEP_FIDS.every((f) => w.rows.get(f))) {
        const bb = w.bubbles.length;
        if (w.chips().length) { clearMenus(w, '@ALL_OK'); w.assertLiveAfterInput(ok, 'a chip tap', bb); continue; }
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

// ── I9 · THE CHOSEN LOGLINE REPLACES, AND EVERY SHARPEN CHIP IS DISTINGUISHABLE ───────────
// Both from Neil's staging run of .331:
//   · the pick was APPENDED onto whatever the box already held, filing
//     "Logline Test 2after dying in a car accident…" as his chosen logline;
//   · the logline review offered two chips BOTH reading "Sharpen my this one →", because the
//     three formulas carry no label and labelOf() fell back to a colliding word.
console.log('I9 · the chosen logline replaces; every sharpen chip names its own field');
{
    const w = world({ prefill: { 'cw-step-3-chosen': 'LEFTOVER-FROM-AN-EARLIER-RUN' } });
    w.ctl.forceStart();
    await settle();
    w.toAsk();

    // Answer all ten asks. The COMPONENT review passes clean; the LOGLINE review names two weak.
    // The reply is chosen by WHICH review is about to fire: the components review runs while rows
    // are still empty, the logline review only once all ten are filled.
    let guard = 0;
    while (guard++ < 80) {
        if (w.chips().some((c) => /Sharpen|Move on/i.test(String(c.textContent)))) break;
        const reply = STEP_FIDS.every((f) => w.rows.get(f)) ? '@WEAK: logline-2, logline-3' : '@ALL_OK';
        if (clearMenus(w, reply)) continue;
        w.say('answer ' + guard, reply);
    }
    ok(STEP_FIDS.every((f) => w.rows.get(f)),
        'setup: the run did not reach the end of the walk — I9 would pass without testing anything');

    // STAGE 1 — the logline review's Sharpen chips must be distinguishable.
    const sharpen = w.chips().filter((c) => /Sharpen/i.test(String(c.textContent))).map((c) => String(c.textContent));
    ok(sharpen.length >= 2,
        'setup: the logline review offered ' + sharpen.length + ' Sharpen chips, expected 2 — '
        + 'this assertion block is not being exercised');
    ok(new Set(sharpen).size === sharpen.length,
        'two Sharpen chips carry the SAME label (' + sharpen.join(' / ') + ') — the student cannot '
        + 'tell which one they are about to rewrite (Neil, staging .331)');
    ok(!sharpen.some((t) => /this one/i.test(t)),
        'a Sharpen chip reads "this one" — labelOf() fell back to a colliding word: ' + sharpen.join(' / '));

    // STAGE 2 — Move on, then the picker files the chosen logline.
    const moveOn = w.chips().filter((c) => /Move on/i.test(String(c.textContent)))[0];
    ok(!!moveOn, 'setup: no "Move on" chip on the logline review');
    if (moveOn) w.tap(moveOn);
    const picks = w.chips();
    ok(picks.length > 0, 'setup: the logline picker offered no choices — the pick path is untested');
    if (picks.length) {
        w.tap(picks[0]);
        // v7.20.525 (#377 part 4): the pick no longer FILES. It opens the forced DECISION —
        // the verdict on that sentence, then sharpen / keep / re-pick — because the damage a
        // weak logline does is carrying it into Steps 4→10, and this is the last moment before
        // that happens.
        ok(String(w.rows.get('cw-step-3-chosen') || '') === 'LEFTOVER-FROM-AN-EARLIER-RUN',
            'tapping a logline FILED it straight away — the student never saw the verdict on the '
            + 'sentence every later step is built from (forced DECISION, not a silent commit)');
        const keep = w.chips().filter((c) => /Keep it/i.test(String(c.textContent)))[0];
        ok(!!keep, 'the decision offered no way to KEEP the logline — the student cannot get past it');
        if (keep) w.tap(keep);
        const chosen = String(w.rows.get('cw-step-3-chosen') || '');
        ok(chosen.length > 0, 'the pick filed nothing into the Chosen Logline box');
        ok(!/Keep it/i.test(chosen),
            'the CHIP LABEL was filed instead of the logline — the decision must file the SENTENCE');
        ok(chosen.indexOf('LEFTOVER-FROM-AN-EARLIER-RUN') === -1,
            'the chosen logline was APPENDED to what the box already held — it must REPLACE, or the '
            + 'student files two sentences glued together (Neil, staging .331: '
            + '"Logline Test 2after dying in a car accident…")');

        // STAGE 3 — v7.20.336: the pick must also TICK the row in the document.
        // Neil, 2026-07-29: "a lot of students are not actually ticking things off properly…
        // they don't even notice that their document doesn't say a hundred percent." Filing the
        // text without ticking the box is exactly that failure, and it is SILENT — the walk
        // completes, the text is there, and only Document Progress betrays it.
        const tickedLoglines = Array.from(w.ticked).filter((f) => f.indexOf('cw-step-3-logline-') === 0);
        ok(tickedLoglines.length === 1,
            'picking a logline left ' + tickedLoglines.length + ' logline rows ticked, expected exactly 1 '
            + '(' + (tickedLoglines.join(', ') || 'none') + '). Either the chip files without ticking — the '
            + 'defect Neil reported — or it ticked without radio-clearing the siblings, which shows the '
            + 'student two chosen loglines.');

        // (The second-pick radio-clear — the tick must MOVE, never accumulate — is exercised in
        // I15 via the decision's "Choose a different one" route, which is the only way back to
        // the picker since v7.20.525.)
    }
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
    while (guard++ < 60) {
        if (w.chips().some((c) => /Sharpen|Move on/i.test(String(c.textContent)))) break;
        if (clearMenus(w, '@WEAK: flaw')) continue;
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
    clearMenus(w, '@ALL_OK');                      // v7.20.333: finish its tick list before reloading
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

// ── I10 · SELF-ASSESSMENT (v7.20.333) ─────────────────────────────────────────────────────
// Neil, after typing the same text into his Goal and his Stakes to see whether anything would
// stop him: "maybe the students could self-assess… they tick off the criteria that they've
// answered to the best of their ability."
console.log('I10 · the tick list runs after every answer, and both its exits work');
{
    // ── 10a · TICK EVERYTHING → no follow-up, straight on to the next ask.
    const w = world();
    w.ctl.forceStart();
    await settle();
    ok(w.toAsk(), 'setup: the paced intro never reached a live ask');
    w.say('a real protagonist answer');
    ok(!!w.rows.get(COMPONENTS[0]), 'the answer was not filed before the tick list — filing must not wait on it');
    ok(w.onTickList(), 'no tick list was served after the answer was filed');
    const criteria = w.tickChips().length;
    ok(criteria >= 2, 'the tick list offered ' + criteria + ' criteria — a list of one is not a check');
    w.tickAll();
    ok(!w.onTickList(), 'ticking every criterion still produced a follow-up — there is nothing to add');
    ok(!!w.deps._walkSlot.armed, 'after a clean tick list the next ask is not armed — the walk stalled');

    // ── 10b · TICK NOTHING → the follow-up, and ADD accumulates onto the SAME row.
    const w2 = world();
    w2.ctl.forceStart();
    await settle();
    w2.toAsk();
    w2.say('my first go at a protagonist');
    const firstText = String(w2.rows.get(COMPONENTS[0]) || '');
    ok(w2.tickNoneThenAdd(), 'leaving criteria unticked offered no "Add to my answer" follow-up');
    ok(!!w2.deps._walkSlot.armed, 'the ADD branch did not re-arm the slot — the student cannot answer');
    ok(w2.deps._walkSlot.peek('cw3').fid === COMPONENTS[0],
        'the ADD branch armed ' + w2.deps._walkSlot.peek('cw3').fid + ' instead of the row being added to ('
        + COMPONENTS[0] + ')');
    const beforeAdd = w2.writes.length;
    w2.say('and the missing piece');
    const addWrite = stepWrites(w2, beforeAdd)[0];
    ok(!!addWrite && addWrite.fid === COMPONENTS[0], 'the addition did not land on the same row');
    ok(addWrite && addWrite.replace === false,
        'the addition declared replace — an "add a line" follow-up is an ACCUMULATE cycle (§4c.6); '
        + 'replacing throws away what the student already wrote');
    const now = String(w2.rows.get(COMPONENTS[0]) || '');
    ok(now.indexOf('and the missing piece') !== -1, 'the addition is not in the row');
    ok(now.indexOf(firstText.slice(0, 20)) !== -1, 'the addition WIPED the original answer');
    // ONE free follow-up: the addition must move the walk on, never re-open the tick list.
    ok(!w2.onTickList(), 'the tick list ran a SECOND time on the same row — the follow-up is offered once');
    ok(!!w2.deps._walkSlot.armed && w2.deps._walkSlot.peek('cw3').fid === COMPONENTS[1],
        'after the addition the walk did not move on to the next ask');

    // ── 10c · A REWRITE ask offers a REWRITE follow-up, not an ADD (§4c.6 both directions).
    const pre = {};
    COMPONENTS.forEach((f) => { pre[f] = 'filled earlier'; });
    const w3 = world({ prefill: pre });
    w3.ctl.tryResume();
    await settle();
    w3.toAsk();
    ok(!!w3.deps._walkSlot.armed && w3.deps._walkSlot.peek('cw3').fid === FORMULAS[0],
        'setup: the walk did not resume onto the first logline');
    w3.say('my first logline');
    ok(w3.onTickList(), 'a logline answer got no tick list');
    const cont = w3.chips().filter((c) => /Continue/i.test(String(c.textContent)))[0];
    if (cont) w3.tap(cont);
    const addChip = w3.chips().filter((c) => /Add to my answer|Write it again/i.test(String(c.textContent)))[0];
    ok(!!addChip, 'the logline follow-up offered no way to improve it');
    ok(addChip && /Write it again/i.test(String(addChip.textContent)),
        'a LOGLINE follow-up offered "Add to my answer" — a logline is ONE self-contained sentence, so '
        + 'the ask must demand the whole thing rewritten (the .289 bug in reverse)');
    if (addChip) {
        w3.tap(addChip);
        const b4 = w3.writes.length;
        w3.say('a completely rewritten logline');
        const wr = stepWrites(w3, b4)[0];
        ok(!!wr && wr.replace === true,
            'the logline rewrite did not declare replace — both drafts end up stitched in one row');
    }
}

// ── I10d · A RELOAD DURING A TICK LIST ────────────────────────────────────────────────────
// Chip bars are DOM-only: the bubble replays from saved history, the buttons do not. This is the
// chips-die-on-reload landmine, and a tick list is just as exposed to it as every menu before it.
console.log('I10d · a reload mid tick-list comes back with the tick list, not the wrong surface');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    w.toAsk();
    w.say('an answer that will be interrupted');
    ok(w.onTickList(), 'setup: no tick list to be interrupted');

    const carried = {};
    w.rows.forEach((v, k) => { if (v) carried[k] = v; });
    const w2 = world({ prefill: carried, ls: w.ls });
    const resumed = w2.ctl.tryResume();
    await settle();
    ok(resumed === true, 'a reload during a tick list did not resume the walk at all');
    ok(w2.chips().length > 0,
        'the tick list came back with NO buttons — the student sees a question and cannot answer it '
        + '(chips-die-on-reload). Either re-attach the bar or serve it fresh; never neither.');
    // And it is the TICK LIST that came back, not the next ask — resuming to the wrong surface is
    // how a walk eats a typed answer as the wrong field.
    ok(w2.tickChips().length >= 2, 'the resumed bar is not the tick list');
    const before = w2.writes.length;
    w2.tickAll();
    ok(!!w2.deps._walkSlot.armed, 'finishing the resumed tick list did not move the walk on');
    ok(stepWrites(w2, before).length === 0, 'the resumed tick list wrote to the document — it must only claim, never file');
}

// ── I11 · THE DUPLICATE GUARD (v7.20.333) ─────────────────────────────────────────────────
// Neil's own test, run against the machine: he entered the same text for Goal and Stakes to see
// whether anything would stop him. Nothing did. And per law 4d, refusing is only half a change.
console.log('I11 · a word-for-word repeat is refused — and the ask is re-served, not just refused');
{
    const pre = {};
    COMPONENTS.slice(0, 4).forEach((f) => { pre[f] = 'an earlier answer for ' + f; });
    pre[COMPONENTS[4]] = 'She wants to win the county final for her late father.';   // Goal
    const w = world({ prefill: pre });
    w.ctl.tryResume();
    await settle();
    w.toAsk();
    ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === COMPONENTS[5],
        'setup: the walk did not resume onto the Obstacle ask');

    const before = w.writes.length;
    const bubblesBefore = w.bubbles.length;
    w.say('She wants to win the county final for her late father.');
    ok(stepWrites(w, before).length === 0,
        'a word-for-word repeat of another block was FILED — the student can put any answer in');
    // LIVENESS (law 4d) — the half that a refusal on its own is missing.
    ok(w.bubbles.length > bubblesBefore, 'the refusal said nothing — the student sees no response at all');
    ok(/word-for-word/.test(String(w.bubbles[w.bubbles.length - 1] || '')),
        'the refusal does not tell the student WHY it was refused');
    ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === COMPONENTS[5],
        'after refusing, the ask was not re-armed — the student is stuck with nothing to answer');
    ok(/Now tell me|stands in your protagonist|Obstacle|obstacle/i.test(String(w.bubbles[w.bubbles.length - 1] || '')),
        'the refusal did not re-serve the QUESTION — a rejection with no question on screen is the '
        + '.329 dead end (Neil: help buttons and no question, mid-lesson)');

    // NEGATIVE CONTROL — a legitimately related answer must go straight through. A false refusal
    // tells a student who did the work that they didn't, which costs far more than a missed repeat.
    const b2 = w.writes.length;
    w.say('Her old coach, who benched her once and would rather she never played again.');
    ok(stepWrites(w, b2).length === 1,
        'the guard REFUSED a legitimate answer that merely shares subject matter with another row');
}

// ══════════════════════════════════════════════════════════════════════════════════════════
// #377 (v7.20.525) — THE QUALITY CHECK THAT HAD NEVER RUN.
// fireReview built the whole review payload into a local `ctx` — the marker contract, the
// student's own ten sentences, their self-assessment claims — and then sent a friendly
// one-liner instead. Every existing assertion here stayed green: a send DID happen, a reply
// DID come back, rows WERE filed. Nothing looked at what was actually sent.
// ══════════════════════════════════════════════════════════════════════════════════════════

// ── I12 · THE REVIEW PAYLOAD REACHES THE MODEL ────────────────────────────────────────────
console.log('I12 · the review sends the payload it built, not a friendly one-liner');
{
    const pre = {};
    COMPONENTS.slice(0, 6).forEach((f, n) => { pre[f] = 'component answer ' + (n + 1); });
    const w = world({ prefill: pre });
    w.ctl.tryResume();
    await settle();
    w.toAsk();
    ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === COMPONENTS[6],
        'setup: the walk did not resume onto the last component');

    const nSends = w.sends.length;
    w.say('THE-STAKES-SENTENCE-THE-REVIEW-MUST-READ');
    w.tickAll();                       // finishing the last tick list fires the components review
    ok(w.sends.length > nSends, 'the components review never sent anything at all');
    const payload = String((w.sends[w.sends.length - 1] || {}).text || '');

    ok(/@WEAK:/.test(payload) && /@ALL_OK/.test(payload),
        'the review payload carries NO marker contract, so the model has no way to name a weak '
        + 'component, the @WEAK: parse returns null, and the walk fails open every single time — '
        + 'which is why "Sharpen my …" has never been served to a student (#377).');
    ok(/protagonist, flaw, wound, incident, goal, obstacle, stakes/.test(payload),
        'the payload does not carry the EXACT name set the parser matches on — a model naming '
        + '"the flaw" instead of "flaw" parses to nothing, silently');
    ok(payload.indexOf('THE-STAKES-SENTENCE-THE-REVIEW-MUST-READ') !== -1,
        'the payload does not contain the student’s own sentences — the model is being asked to '
        + 'review work it cannot see');
    ok(/ticked/.test(payload),
        'the payload drops the student’s own self-assessment claims (v7.20.333), so the policing '
        + 'that stops the tick list becoming mindless clicking never reaches the model');
}

// ── I13 · AN UNREADABLE REVIEW IS NOT A PASS ──────────────────────────────────────────────
// @ALL_OK and "nothing came back" used to take the identical silent path, so a check that never
// ran was indistinguishable from one that passed — and the walk advanced as though the student's
// work had been checked (root §10 fail-loud).
console.log('I13 · a review with no marker retries once, then says so — it never advances silently');
{
    const pre = {};
    COMPONENTS.slice(0, 6).forEach((f, n) => { pre[f] = 'component answer ' + (n + 1); });
    const w = world({ prefill: pre });
    w.ctl.tryResume();
    await settle();
    w.toAsk();
    w.say('a stakes answer');
    const nSends = w.sends.length;
    w.tickAll();                       // fires the components review
    ok(w.sends.length === nSends + 1, 'setup: the components review did not fire');

    // Reply 1 — warm prose, no marker at all. The single commonest real failure.
    w.resolveApi('Lovely work, these hang together nicely and I can see the story taking shape.');
    ok(w.sends.length === nSends + 2,
        'an unreadable review did NOT retry — a dropped marker is indistinguishable from a pass, '
        + 'so the student’s work is waved through unchecked');

    // Reply 2 — unreadable again. Now it must be honest, and leave a way forward (§4d).
    const bubblesBefore = w.bubbles.length;
    w.resolveApi('Still lovely, no notes.');
    ok(w.sends.length === nSends + 2, 'the review retried MORE than once — one retry, then honesty');
    ok(w.bubbles.length > bubblesBefore,
        'after two unreadable replies the walk said NOTHING and moved on as though the check had '
        + 'passed — the exact silent fail-open #377 is about');
    const said = String(w.bubbles[w.bubbles.length - 1] || '');
    ok(/couldn’t read|could not read/i.test(said),
        'the walk did not tell the student the check failed: "' + said.slice(0, 90) + '"');
    ok(w.chips().length > 0,
        'the honest message left no chips — a refusal with nothing on screen is the .329 dead end (§4d)');
}

// ── I14 · A BLANK LOGLINE BLOCKS THE CHOICE ───────────────────────────────────────────────
// uid 1334 on prod: Logline 3 blank, the section stuck at 50%, and the picker showed her two
// chips with no signal a third was missing. serveLoglinePicker's `if (!txt) return` HID it.
console.log('I14 · a blank logline re-serves its ask instead of being hidden from the picker');
{
    const pre = {};
    COMPONENTS.forEach((f, n) => { pre[f] = 'component answer ' + (n + 1); });
    pre[FORMULAS[0]] = 'logline one'; pre[FORMULAS[1]] = 'logline two';
    // The components review already ran in the session being resumed — seed the sidecar under
    // the controller's own key rather than guessing at it.
    const probe = world();
    probe.ctl.forceStart();
    await settle();
    const lsKey = Array.from(probe.ls.keys())[0];
    ok(!!lsKey, 'setup: the walk persisted no sidecar, so this reload cannot be staged');
    const w = world({ prefill: pre, ls: new Map([[lsKey, JSON.stringify({ idx: 9, active: true, rc: true, rl: false })]]) });
    w.ctl.tryResume();
    await settle();
    w.toAsk();
    ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === FORMULAS[2],
        'setup: the walk did not resume onto the third logline');

    w.say('a third logline that is about to be lost');
    w.tickAll();                       // fires the loglines review
    // The document is open beside the chat and editable: the student clears the box while the
    // review is in flight. (The same end state a failed write produces, which is how a row can
    // be blank when the walk has already moved past its ask.)
    w.rows.set(FORMULAS[2], '');
    w.resolveApi('@ALL_OK');

    const chips = w.chips().map((c) => String(c.textContent));
    ok(!chips.some((t) => /^1\. |^2\. /.test(t)),
        'the picker rendered with a blank logline hidden from it — the student chooses from two '
        + 'and is never told the third is missing (chips: ' + chips.join(' | ') + ')');
    ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === FORMULAS[2],
        'the blank logline’s ask was not re-served — the walk let an empty box through to the choice');
    ok(/still empty/i.test(String(w.bubbles[w.bubbles.length - 1] || '')),
        'the student is not told WHY they are back on this question');
}

// ── I15 · THE FORCED DECISION (#377 part 4) ───────────────────────────────────────────────
// Neil's ruling: forced DECISION, never forced revision. A forced rewrite is gameable (type
// anything) and fights PEDAGOGY §19 — "a tick list that gates progress becomes a lying game".
// Seeing the verdict and choosing is not gameable, and is still unskippable.
console.log('I15 · choosing a logline shows its verdict first, and sharpen returns to the choice');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    w.toAsk();
    let guard = 0;
    while (guard++ < 80) {
        if (w.chips().some((c) => /Sharpen my|Move on/i.test(String(c.textContent)))) break;
        const reply = STEP_FIDS.every((f) => w.rows.get(f)) ? '@WEAK: logline-1' : '@ALL_OK';
        if (clearMenus(w, reply)) continue;
        w.say('answer ' + guard, reply);
    }
    const moveOn = w.chips().filter((c) => /Move on/i.test(String(c.textContent)))[0];
    ok(!!moveOn, 'setup: the logline review offered no "Move on" chip');
    if (moveOn) w.tap(moveOn);

    // THE FLAGGED ONE — the verdict must say so, in words, before they can commit to it.
    const picks = w.chips().filter((c) => /^1\. /.test(String(c.textContent)));
    ok(picks.length === 1, 'setup: the picker did not offer logline 1');
    if (picks.length) {
        w.tap(picks[0]);
        const said = String(w.bubbles[w.bubbles.length - 1] || '');
        ok(/flagged/i.test(said),
            'the decision did not report that THIS is the logline the review flagged — a verdict the '
            + 'student never sees cannot change what they carry into Step 4: "' + said.slice(0, 90) + '"');
        ok(/Step 4/.test(said),
            'the decision does not say what choosing this sentence COSTS downstream');
        const opts = w.chips().map((c) => String(c.textContent));
        ok(opts.length === 3, 'the decision offered ' + opts.length + ' options, expected sharpen / keep / re-pick');

        // SHARPEN — a rewrite, replacing, and it comes back to the CHOICE (not to Step 4).
        const sharpen = w.chips().filter((c) => /Sharpen it first/i.test(String(c.textContent)))[0];
        ok(!!sharpen, 'the decision offered no way to sharpen: ' + opts.join(' | '));
        if (sharpen) {
            w.tap(sharpen);
            ok(!!w.deps._walkSlot.armed && w.deps._walkSlot.peek('cw3').fid === FORMULAS[0],
                'the sharpen did not arm the logline being sharpened — the student’s rewrite would '
                + 'land on the wrong row, or nowhere');
            const b4 = w.writes.length;
            w.say('a sharpened first logline, rewritten whole');
            const wr = stepWrites(w, b4)[0];
            ok(!!wr && wr.fid === FORMULAS[0] && wr.replace === true,
                'the sharpened logline did not REPLACE its row — a logline is one self-contained '
                + 'sentence, so both drafts end up stitched together (§4c.6)');
            ok(w.chips().some((c) => /^1\. /.test(String(c.textContent))),
                'after sharpening, the student was not returned to the choice — the whole point of '
                + 'sharpening here is that they then pick with it fixed');
        }

        // RE-PICK — and the tick must MOVE, never accumulate.
        const p2 = w.chips().filter((c) => /^2\. /.test(String(c.textContent)))[0];
        if (p2) {
            w.tap(p2);
            const said2 = String(w.bubbles[w.bubbles.length - 1] || '');
            ok(/held up|flagged|not read|your call alone/i.test(said2),
                'the second decision carried no verdict at all: "' + said2.slice(0, 90) + '"');
            const keep = w.chips().filter((c) => /Keep it/i.test(String(c.textContent)))[0];
            if (keep) {
                w.tap(keep);
                const chosen = String(w.rows.get('cw-step-3-chosen') || '');
                ok(chosen.indexOf('answer') !== -1 || chosen.length > 0, 'keeping filed nothing');
                const ticked = Array.from(w.ticked).filter((f) => f.indexOf('cw-step-3-logline-') === 0);
                ok(ticked.length === 1,
                    'after re-picking, ' + ticked.length + ' logline rows are ticked — the tick must '
                    + 'MOVE, never accumulate (' + (ticked.join(', ') || 'none') + ')');
            }
        }
    }
}

console.log('\n' + (fail ? '❌ CW3 SIM FAILED' : '✅ CW3 sim passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
}
main().catch((e) => { console.error('❌ CW3 sim threw:', e && e.stack); process.exit(1); });
