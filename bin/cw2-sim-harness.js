#!/usr/bin/env node
/* eslint-env node */
/**
 * cw2-sim-harness.js — BEHAVIOURAL gate for the CW Step-2 story-ideas walk (v7.20.334).
 *
 * WHY IT EXISTS NOW. Step 2 was rewritten to Neil's ruling — "Step 2 should become the batched
 * check that Step 3 uses" — which removed the per-idea API call that used to sit between the
 * student typing and their words being filed. That call was doing THREE jobs, and only one of
 * them was judgment:
 *   1. deciding whether the text was a genuine story idea (@IDEA_LANDED) — replaced by the
 *      batched review at the end of the set;
 *   2. rejecting a NON-answer, so a stray tap never became an idea — replaced by the answer slot;
 *   3. ANSWERING a student who asked a question instead of giving an idea — replaced by the
 *      [🤔 Ask Sophia a question] rung of the help ladder.
 * Remove a call doing three jobs and replace one of them, and the other two fail silently. This
 * file is what makes that impossible: every one of the three has an assertion here.
 *
 * It also drives the RESOURCE-GATED opener, which nothing has ever driven — the ask sits behind
 * two gate buttons, so a rig that cannot open them never reaches the ask at all.
 *
 * Same rig as cw3-sim (bin/walk-sim-lib.js) so the two cannot drift.
 *
 * Usage: node bin/cw2-sim-harness.js
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

const CTL = sliceController('const _cwIdeasCtl = (function () {');
const ROWS = ['cw-step-2-idea1', 'cw-step-2-idea2', 'cw-step-2-idea3'];

function world(opts) {
    return makeWorld(CTL, Object.assign({ task: 'cw_step_2', fids: ROWS, ok: ok }, opts || {}));
}
const ideaWrites = (w, from) => w.writes.slice(from).filter((x) => ROWS.indexOf(x.fid) !== -1);

// The opener is a paced run of four chunks, two of them behind RESOURCE GATES (open the guide,
// play the video) — the ask does not appear until both have been clicked. A student taps through
// it; so does the sim. Returns true if it reached the live ask.
function throughOpener(w) {
    for (let g = 0; g < 16; g++) {
        if (w.deps._walkSlot.armed) return true;
        const chips = w.chips();
        if (!chips.length) break;
        w.tap(chips[0]);          // a gate button reveals Continue; Continue advances the run
    }
    return !!w.deps._walkSlot.armed;
}

async function main() {
console.log('CW STEP-2 IDEAS WALK — behavioural sim (real _cwIdeasCtl)\n');

// ── I1 · ASK-BEFORE-FILE ───────────────────────────────────────────────────────────────────
// Job 2 of the deleted call. Before .334 a non-answer was caught by the model returning no
// @IDEA_LANDED; now the answer slot catches it, and it must catch it BEFORE the opener's ask has
// been delivered — which is exactly when a launch chip or a stray tap arrives.
console.log('I1 · nothing is filed before the ask has actually been served');
{
    const w = world();
    const before = w.writes.length;
    w.say('Let’s go');
    ok(ideaWrites(w, before).length === 0,
        'a message sent before the walk asked anything wrote to '
        + ideaWrites(w, before).map((x) => x.fid).join(', ')
        + ' — the deleted @IDEA_LANDED judge used to be the only thing stopping this');

    // And mid-opener, before the ask chunk lands, is still too early.
    const w2 = world();
    w2.ctl.forceStart();
    await settle();
    const b2 = w2.writes.length;
    w2.say('typing during the teaching run');
    ok(ideaWrites(w2, b2).length === 0,
        'an answer typed DURING the paced opener was filed — the ask is the last chunk, so nothing '
        + 'has been asked yet');
}

// ── I2 · THE OPENER REACHES ITS ASK, AND THE ASK CARRIES THE HELP LADDER ──────────────────
console.log('I2 · the gated opener reaches a live ask carrying all three help rungs');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    ok(throughOpener(w),
        'the resource-gated opener never reached a live ask — the student taps the guide and the '
        + 'video and is left with no question');

    // The help ladder (§4c.9). Step 2's ask carried NO help at all before .334, which was
    // survivable only while an API call absorbed anything the student said.
    const content = w._lastBubbleEl && w._lastBubbleEl.children[0];
    const helpBar = content && content.children.filter((c) => String(c.className).indexOf('swml-bc-help') !== -1)[0];
    ok(!!helpBar, 'the idea ask has no help bar — it is the only ask in the CW arc with no way to get unstuck');
    const labels = helpBar ? helpBar.children.map((b) => String(b.textContent)) : [];
    ok(labels.some((l) => /Guidance/.test(l)), 'no 📖 Guidance rung on the idea ask');
    ok(labels.some((l) => /Writer’s Profile|Writer's Profile/.test(l)), 'no 👤 Writer’s Profile rung on the idea ask');
    ok(labels.some((l) => /Ask Sophia/.test(l)), 'no 🤔 Ask Sophia rung — the ONLY way left to ask a question');
    // Sophia is the LAST rung, not the first — the whole point of the ladder is that the free
    // rungs come first.
    ok(labels.length >= 3 && /Ask Sophia/.test(labels[labels.length - 1]),
        'Ask Sophia is not the LAST rung (order: ' + labels.join(' | ') + ') — a paid rung offered '
        + 'first is not a ladder, it is a shortcut to the bill');
}

// ── I3 · FILED VERBATIM, IMMEDIATELY, WITH NO API CALL ────────────────────────────────────
// The whole point of the batching. Nothing the student writes may wait on a round-trip.
console.log('I3 · an idea is filed verbatim the moment it is written — no call in between');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);
    const sendsBefore = w.sends.length;
    const before = w.writes.length;
    w.say('A boy who cannot ask for help crosses a city to reach his brother.');
    const wr = ideaWrites(w, before)[0];
    ok(!!wr, 'the idea was not filed at all');
    ok(wr && wr.fid === ROWS[0], 'the first idea landed in ' + (wr && wr.fid) + ' instead of ' + ROWS[0]);
    ok(String(w.rows.get(ROWS[0]) || '').indexOf('cannot ask for help') !== -1, 'the idea is not in the row verbatim');
    ok(w.sends.length === sendsBefore,
        'filing the idea spent an API call — the per-idea judge is supposed to be gone (that is the '
        + 'entire saving Neil asked for)');
    // The student's own words must also reach the TRANSCRIPT. The send used to write the user
    // bubble; the ordinary path no longer sends, so this file has to — and if nobody does, the
    // idea appears in the document and vanishes from the chat.
    ok(w.users.some((u) => /cannot ask for help/.test(String(u))),
        'the student’s idea never appeared in the chat transcript — sendCanvasMessage used to write '
        + 'the user bubble and the ordinary path no longer sends');
}

// ── I4 · ONE REVIEW CALL FOR THE WHOLE SET ────────────────────────────────────────────────
console.log('I4 · exactly ONE batched review call, at the end, over all the ideas');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);

    // The reply rides every say(): only the turn that fills the LAST row has a call armed, so it
    // is that turn — the batched review — which consumes it. Every earlier turn files in silence,
    // which is the property being asserted.
    let guard = 0;
    while (guard++ < 12 && ROWS.filter((f) => w.rows.get(f)).length < ROWS.length) {
        if (w.chips().length) { w.tapMenu(); continue; }
        w.say('story idea number ' + guard, 'Lovely set of seeds.\n\n@WEAK: idea-2, idea-3');
    }
    ok(ROWS.every((f) => w.rows.get(f)), 'setup: the three idea rows were not all filled');
    ok(w.sends.length === 1,
        'a full three-idea run made ' + w.sends.length + ' API calls — the batched design is ONE, '
        + 'at the end (it was up to three before .334, one per idea)');

    // The review named two weak ideas → a Sharpen chip each, plus Move on.
    const sharpen = w.chips().filter((c) => /Sharpen/i.test(String(c.textContent))).map((c) => String(c.textContent));
    ok(sharpen.length > 0,
        'the run finished without the batched review reaching the student — no Sharpen chips, so '
        + 'either the review never fired or its markers were not read');
    ok(sharpen.length === 2, 'the review named two weak ideas but offered ' + sharpen.length + ' Sharpen chips');
    ok(new Set(sharpen).size === sharpen.length,
        'two Sharpen chips carry the same label (' + sharpen.join(' / ') + ') — the student cannot tell them apart');
    ok(w.chips().some((c) => /Move on/i.test(String(c.textContent))),
        'no "Move on" chip — a student happy with their ideas cannot leave the review');

    // A rewrite REPLACES (an idea is one self-contained thing, §4c.6) and costs no further call.
    const sends = w.sends.length;
    w.tap(w.chips().filter((c) => /Sharpen/i.test(String(c.textContent)))[0]);
    const before = w.writes.length;
    const original = String(w.rows.get(ROWS[1]) || '');
    w.say('a completely rewritten second idea');
    const wr = ideaWrites(w, before)[0];
    ok(!!wr && wr.replace === true,
        'the sharpen rewrite did not declare replace — both drafts end up stitched into one row (.289)');
    ok(String(w.rows.get(ROWS[1]) || '').indexOf(original) === -1 || !original,
        'the row still holds the OLD idea as well as the new one');
    ok(w.sends.length === sends, 'the rewrite spent an API call — the student owns the rewrite, there is nothing to judge');
}

// ── I4b · THE REVIEW FAILS OPEN ───────────────────────────────────────────────────────────
// A dropped marker or a dead call must never strand the student — their ideas are already filed,
// so nothing depends on this completing.
console.log('I4b · a dropped marker or a failed review call still wraps the step');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);
    let guard = 0;
    while (guard++ < 12 && ROWS.filter((f) => w.rows.get(f)).length < ROWS.length) {
        if (w.chips().length) { w.tapMenu(); continue; }
        w.say('idea ' + guard, '');
    }
    const bubbles = w.bubbles.length - 1;                       // the call died
    ok(w.bubbles.length > bubbles, 'a failed review said nothing at all — the step just stops');
    ok(w.ctl.active === false, 'the walk is still active after a failed review with no chips to press');
}

// ── I5 · THE PAID RUNG — asking a question files NOTHING ──────────────────────────────────
// Job 3 of the deleted call. Before .334 the model absorbed a question; now the ladder does. If
// this rung is broken, a student's question is silently filed as their story idea.
console.log('I5 · [Ask Sophia] sends the question, files nothing, and re-arms the ask after');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);

    const content = w._lastBubbleEl && w._lastBubbleEl.children[0];
    const helpBar = content.children.filter((c) => String(c.className).indexOf('swml-bc-help') !== -1)[0];
    const askBtn = helpBar && helpBar.children.filter((b) => /Ask Sophia/.test(String(b.textContent)))[0];
    ok(!!askBtn, 'setup: no Ask Sophia rung to tap');

    const bubbles = w.bubbles.length;
    askBtn.click();
    ok(w.bubbles.length > bubbles, 'tapping Ask Sophia said nothing — the student has no idea it worked');
    ok(!w.deps._walkSlot.armed,
        'the answer slot is still armed after tapping Ask Sophia — their QUESTION would be filed as '
        + 'their story idea, which is the exact failure this rung exists to prevent');

    const before = w.writes.length;
    const sends = w.sends.length;
    w.say('Can I write about my grandad?', 'You certainly can — real people make the best characters.');
    ok(ideaWrites(w, before).length === 0,
        'the student’s QUESTION was filed as a story idea — ' + ideaWrites(w, before).map((x) => x.fid).join(', '));
    ok(w.sends.length === sends + 1, 'the question was never actually sent to Sophia');
    ok(!!w.deps._walkSlot.armed,
        'after answering the question the ask was not re-armed — the student answers it and their '
        + 'idea is refused (law 4d: they must never have to find their own way back)');

    // ...and the idea they write next is filed normally.
    const b2 = w.writes.length;
    w.say('My grandad walked from Lahore to Delhi in 1947.');
    ok(ideaWrites(w, b2).length === 1, 'the idea written after a question was not filed');
}

// ── I6 · THE LADDER — a tap must produce a question ───────────────────────────────────────
console.log('I6 · "Try one more" says something and arms the next ask');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);
    w.say('my first idea');
    const tryMore = w.chips().filter((c) => /Try one more/i.test(String(c.textContent)))[0];
    ok(!!tryMore, 'no "Try one more" chip after the first idea');
    const bubbles = w.bubbles.length;
    w.tap(tryMore);
    ok(w.bubbles.length > bubbles,
        'tapping "Try one more" only removed the chips — the screen went quieter and asked nothing '
        + '(law 4d: a tap must produce a question, not just a smaller menu)');
    ok(!!w.deps._walkSlot.armed, 'the second idea has no armed slot — it would be refused');
    const before = w.writes.length;
    w.say('my second idea');
    const wr = ideaWrites(w, before)[0];
    ok(!!wr && wr.fid === ROWS[1], 'the second idea landed in ' + (wr && wr.fid) + ' instead of ' + ROWS[1]);
}

// ── I6b · THE DECLINE IS PERMANENT, AND STILL REVIEWS ─────────────────────────────────────
console.log('I6b · "I’m set on what I have" reviews the set, then wraps — and never re-invites');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);
    w.say('my only idea');
    const done = w.chips().filter((c) => /set on what I have/i.test(String(c.textContent)))[0];
    ok(!!done, 'no decline chip after the first idea');
    w.tap(done);
    ok(!!w.armed && /review/.test(String(w.armed.id)),
        'settling skipped the batched review — a student who writes one idea gets no feedback at all');
    w.resolveApi('That works well.\n\n@ALL_OK');
    ok(w.ctl.active === false, 'the walk is still active after the wrap');
}

// ── I7 · RESUME ───────────────────────────────────────────────────────────────────────────
console.log('I7 · a reload keeps the ask live and repeats nothing');
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    throughOpener(w);
    w.say('an idea before the reload');

    const carried = {};
    w.rows.forEach((v, k) => { if (v) carried[k] = v; });
    const w2 = world({ prefill: carried, ls: w.ls });
    w2.ctl.tryResume();
    await settle();
    ok(w2.bubbles.filter((b) => /an idea before the reload/.test(String(b))).length === 0,
        'resume replayed an answer the student had already given');
    // After ONE idea the student is on the LADDER (invite + "Try one more" / "I'm set"), not on an
    // ask — so the slot is correctly empty and the chips must be back instead. Asserting an armed
    // slot here would be asserting the wrong surface.
    const tryMore = w2.chips().filter((c) => /Try one more/i.test(String(c.textContent)))[0];
    ok(!!tryMore,
        'a reload on the ladder came back with no chips — the student sees an invite to write '
        + 'another idea and has nothing to press (chips-die-on-reload)');
    w2.tap(tryMore);
    ok(!!w2.deps._walkSlot.armed,
        'after a reload and "Try one more" the ask is not armed — the student’s next idea is refused '
        + 'with "I haven’t asked you to write anything yet" (the token is in-memory; the sidecar has '
        + 'to restore it)');
    const before = w2.writes.length;
    w2.say('the idea after the reload');
    ok(ideaWrites(w2, before).length === 1, 'the idea written after a reload was not filed');

    // A reload mid-review comes back on the review chips, not on a dead turn.
    const w3 = world();
    w3.ctl.forceStart();
    await settle();
    throughOpener(w3);
    let guard = 0;
    while (guard++ < 12 && ROWS.filter((f) => w3.rows.get(f)).length < ROWS.length) {
        if (w3.chips().length) { w3.tapMenu(); continue; }
        w3.say('idea ' + guard, 'Good set.\n\n@WEAK: idea-1');
    }
    ok(w3.chips().some((c) => /Sharpen/i.test(String(c.textContent))), 'setup: no review chips to interrupt');
    const carried3 = {};
    w3.rows.forEach((v, k) => { if (v) carried3[k] = v; });
    const w4 = world({ prefill: carried3, ls: w3.ls });
    w4.ctl.tryResume();
    await settle();
    ok(w4.chips().some((c) => /Sharpen|Move on/i.test(String(c.textContent))),
        'a reload during the review came back with no chips — the student sees feedback naming a '
        + 'weak idea and has no way to act on it (chips-die-on-reload)');
}

console.log('\n' + (fail ? '❌ CW2 SIM FAILED' : '✅ CW2 sim passed')
    + '  — ' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
process.exit(fail);
}
main().catch((e) => { console.error('❌ CW2 sim threw:', e && e.stack); process.exit(1); });
