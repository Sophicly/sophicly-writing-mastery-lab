#!/usr/bin/env node
/* eslint-env node */
'use strict';
/**
 * cw11-sim-harness — CW STEP 11 (Character Profile) behavioural sim, v7.20.563 (#428).
 *
 * Drives the REAL _cwCharProfileCtl through walk-sim-lib's rig (liveness asserted on every
 * say()/tap(), the real answer slot, the real serveCwChunks) and asserts:
 *  1. the seven wiring points + the doc changes are present (the .490 dead-walk class);
 *  2. every one of the twelve asks lands its answer in ITS row, verbatim — text asks, the two
 *     dropdown+explain asks, the yes/no+explain ask and the control-only arc pick;
 *  3. ZERO API sends across the whole walk (the only call is rung 3, on an explicit tap);
 *  4. a reload mid-walk resumes on the exact ask; a finished walk offers a way back in.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const { makeWorld, braceSliceFrom } = require('./walk-sim-lib');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg, detail) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg + (detail !== undefined ? '  — ' + JSON.stringify(detail) : ''));
    return false;
}
const settle = () => new Promise((r) => setImmediate(() => setImmediate(r)));

const ctlIdx = SRC.indexOf('const _cwCharProfileCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwCharProfileCtl not found'); process.exit(1); }
const CTL_TEXT = braceSliceFrom(SRC, ctlIdx, '(', ')').text;
const CTL_SRC = { src: CTL_TEXT + '()' };
const P = 'cw-step-10-';
const FIDS = ['ext-goal-begin', 'int-goal-begin', 'need-begin', 'stakes-begin', 'ext-goal-end', 'int-goal-end',
    'need-recognised', 'dilemma', 'realisation', 'ending-tone', 'meaning', 'arc-type'].map((x) => P + x);

console.log('\nCW STEP 11 — behavioural sim (real _cwCharProfileCtl, real rig)\n');

// ── 1 · WIRING + DOC ─────────────────────────────────────────────────────────────────────
console.log('Wiring and document:');
ok(/state\.task === 'cw_step_11' && _cwCharProfileCtl\.active && _inboundIsAnswer/.test(SRC), '1 · the dispatcher arm');
ok((SRC.match(/cw_step_11: _cwCharProfileCtl,/g) || []).length === 3, '2 · the revive + nudge + probe maps (three)', (SRC.match(/cw_step_11: _cwCharProfileCtl,/g) || []).length);
ok(/registerCwWalkCtls\(\[[^\]]*_cwCharProfileCtl/.test(SRC), '3 · the walk registry');
ok(/_cwCharProfileCtl\.onReply\(reply\);/.test(SRC), '4 · the onReply fan-out');
ok(/t === 'cw_step_11' \? _cwCharProfileCtl/.test(SRC), '5 · the start-miss fallback map');
ok(/cwCharProfileCtl: _cwCharProfileCtl,/.test(SRC), '6 · the tp export');
ok(/state\.task === 'cw_step_11' && !state\.reviewMode && tp\.cwCharProfileCtl/.test(SRC) && /tp\.cwCharProfileCtl\.tryResume\(\)/.test(SRC)
    && /state\.task === 'cw_step_11'\) \{[\s\S]{0,200}_cwCharProfileCtl\.reset\(\); _cwCharProfileCtl\.start\(\)/.test(SRC),
    '7 · fresh entry, boot resume AND chat-clear all start/resume the walk');
ok(/\{ step: 11, label: 'Character Profile',\s+tier: 'si'/.test(CORE), 'Step 11 is on the SI manifest (chat + sidebar) — the bare workbook environment is gone');
ok(/11: \[\s*\{ step: 1, label: 'Goals at Beginning' \}/.test(CORE), '…with a sidebar naming its three parts');
ok(/'Ambiguous Negative'\], controlOnly: true \}, 'cw-step-10-arc-type'\)/.test(SRC), 'the Character Arc row is CONTROL-ONLY in the template (Neil: "they just need to choose")');
ok(/migrateStep11ArcControlOnly/.test(SRC) && /'cw-step-10-arc-type'\) return;/.test(SRC), '…and the heal flips it in baked documents');
ok((CTL_TEXT.match(/sendCanvasMessage\(\);/g) || []).length === 2, 'the walk spends an API call ONLY on rung 3 (ask Sophia) and the ONE end-of-walk quality check (#440)');
ok(/if \(!st\.pushed\) \{ firePush\(\); return; \}/.test(CTL_TEXT), '…and the quality check carries a footprint (st.pushed), so an Improve rewrite cannot spend a second call');
ok(/_swmlScrollToTop\(target\)/.test(CTL_TEXT) && /scrollToRow\(s\)/.test(CTL_TEXT), 'every ask scrolls the document to its row (§4c.10)');
ok(/'More examples'/.test(CTL_TEXT) && /'Guidance'/.test(CTL_TEXT) && /Still stuck — ask Sophia/.test(CTL_TEXT), 'the help ladder is present, Sophia last (§4c.9)');

// ── the world ────────────────────────────────────────────────────────────────────────────
function world(opts) {
    opts = opts || {};
    const picks = opts.picks || new Map();
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_step_11', fids: FIDS, ok: ok,
        extraDeps: {
            _swmlScrollToTop: function () {},
            _outlineCheckState: picks,
            _setOutlineDropdown: function (fid, label) { picks.set(fid, { selected: label }); return true; },
        },
    }, opts));
    w.picks = picks;
    return w;
}
const lastBubble = (w) => w.bubbles[w.bubbles.length - 1] || '';
const chipNamed = (w, re) => w.chips().filter((c) => re.test(String(c.textContent)))[0] || null;
async function toAsk(w) {
    for (let i = 0; i < 10; i++) {
        await settle();
        const c = chipNamed(w, /Continue/);
        if (!c) break;
        w.tap(c);
    }
    await settle();
}
const reload = (w) => world({ ls: w.ls, prefill: Object.fromEntries(w.rows), picks: w.picks });

async function main() {
    // ── 2 · THE WHOLE WALK ──────────────────────────────────────────────────────────────
    console.log('\nThe walk, ask by ask:');
    {
        const w = world();
        w.ctl.start();
        await settle();
        ok(!!chipNamed(w, /Continue/), 'the orientation PAGES (§4b)');
        ok(/goals\*\* and \*\*needs/.test(w.bubbles.join('\n')), '…and teaches goals vs needs before asking');
        await toAsk(w);
        let t = lastBubble(w);
        ok(/External Goal/.test(t) && /Macbeth wants to WIN the crown/.test(t), '1/12 External goal — criteria + a worked example in the ask (§4c.1/2)');
        ok(/1 of 12|1\/12/.test(t) || /Character Profile/.test(t), '…with the progress bar');
        await w.say('To escape the estate and get to London before her brother finds her.');
        ok(/escape the estate/.test(w.rows.get(P + 'ext-goal-begin') || ''), '1/12 …banked verbatim into ITS row');
        ok(/Internal Goal/.test(lastBubble(w)), '2/12 Internal goal is asked next');
        await w.say('She thinks getting away will finally make her feel free.');
        await w.say('She needs to stop running from people who love her.');
        await w.say('Losing her freedom — being dragged back and married off.');
        t = lastBubble(w);
        ok(/End-State of External Goal|what happened to the goal/i.test(t), '5/12 the end-state ask arrives');
        ok(!!chipNamed(w, /The character abandons the goal/), '5/12 …as CHIPS (mutually exclusive → one screen, root §18)');
        w.tap(chipNamed(w, /The character abandons the goal/)); await settle();
        ok((w.picks.get(P + 'ext-goal-end') || {}).selected === 'The character abandons the goal', '5/12 the tap sets the DROPDOWN in the document');
        ok(/what actually happens/i.test(lastBubble(w)), '5/12 …then asks for the explanation');
        await w.say('At the docks she turns back to face her brother instead of boarding.');
        ok(/turns back to face/.test(w.rows.get(P + 'ext-goal-end') || ''), '5/12 …which lands in the same row');
        await w.say('She gains belonging — she is no longer alone.');
        ok(!!chipNamed(w, /^Yes$/) && !!chipNamed(w, /^No$/), '7/12 Need recognised? — Yes / No chips');
        w.tap(chipNamed(w, /^Yes$/)); await settle();
        ok(/how do we know/i.test(lastBubble(w)), '7/12 …then the evidence ask');
        await w.say('She says his name for the first time in the whole story.');
        ok(/^Yes — She says his name/.test(w.rows.get(P + 'need-recognised') || ''), '7/12 the row reads "Yes — <their evidence>"');
        await w.say('Board the ship and be free, or stay and face what she did. She stays.');
        await w.say('Running was never freedom; facing it is.');
        ok(!!chipNamed(w, /Bittersweet/), '10/12 Ending tone chips');
        w.tap(chipNamed(w, /Bittersweet/)); await settle();
        await w.say('The ship leaves without her and she watches it go.');
        ok(/ship leaves/.test(w.rows.get(P + 'ending-tone') || '') && (w.picks.get(P + 'ending-tone') || {}).selected === 'Bittersweet', '10/12 dropdown + explanation both filed');
        await w.say('Freedom that costs everyone else is not freedom.');
        t = lastBubble(w);
        ok(/Part 3/.test(t) && !!chipNamed(w, /^Positive \(/), '12/12 the Arc Type is a single pick — four chips, no explanation asked (Neil #428)');
        w.tap(chipNamed(w, /^Positive \(/)); await settle();
        ok((w.picks.get(P + 'arc-type') || {}).selected.indexOf('Positive') === 0, '12/12 the tap sets the arc dropdown');
        ok(!w.writes.some((x) => x.fid === P + 'arc-type'), '12/12 …and writes NO text into the control-only row');
        // ── the ONE quality call (#440) ──
        ok(w.sends.length === 1 && w.armed && w.armed.id === 'cw11-quality', '⭐ exactly ONE API call, fired when the twelfth row is filled (#440)');
        ok(!/all of it is in your document/.test(w.bubbles.join('\n')), '…and the wrap WAITS for it');
        const hidden = w.deps.canvasChatHistory.filter((m) => m && m.hidden).pop();
        ok(!!hidden && /CHARACTER-PROFILE QUALITY CHECK/.test(hidden.content) && /escape the estate/.test(hidden.content) && /Stay and be caught|Board the ship/.test(hidden.content),
            '…with ALL twelve answers in the hidden context (the model reads the profile, not a summary of it)');
        ok(/@PROFILE_OK/.test(hidden.content) && /@PROFILE_IMPROVE:<key>/.test(hidden.content) && /never give a mark/.test(hidden.content), '…asking for OK / IMPROVE:<key>, never a mark');
        // the model names the dilemma as the weak link
        w.armed.fn('Your need and your goal pull against each other well. The dilemma does not yet force a choice between them. @PROFILE_IMPROVE:dilemma');
        await settle();
        ok(!!chipNamed(w, /Improve my Dilemma/) && !!chipNamed(w, /Keep it as it is/), 'IMPROVE → a Keep / Improve choice (never a mark, never forced)');
        w.tap(chipNamed(w, /Improve my Dilemma/)); await settle();
        ok(/Dilemma/.test(lastBubble(w)) && /climax/.test(lastBubble(w)), 'Improve re-serves THAT ask');
        await w.say('Sail and be free, or stay and face her brother. She stays — and loses the ship.');
        ok(/^Sail and be free/.test(w.rows.get(P + 'dilemma') || ''), '…and the rewrite REPLACES the row (§4c.6)');
        ok(w.sends.length === 1, '⭐ …and the walk does NOT spend a second call after the rewrite (footprint)');
        ok(/all of it is in your document/.test(w.bubbles.join('\n')) && /sim endpoint/.test(w.bubbles.join('\n')), 'the wrap states the profile and ends on the shared endpoint');
        ok(!!chipNamed(w, /Change an answer/), '…and offers a way back in (v7.20.340 law)');
        ok(!w.lostWrite, 'no write was lost to a missing row', w.lostWrite);
        FIDS.filter((f) => f !== P + 'arc-type').forEach((f) => ok((w.rows.get(f) || '').length > 0, 'row filled: ' + f));
        // recall
        w.tap(chipNamed(w, /Change an answer/)); await settle();
        ok(!!chipNamed(w, /^Dilemma$/), 'recall offers every ask by label');
        w.tap(chipNamed(w, /^Dilemma$/)); await settle();
        ok(/Dilemma/.test(lastBubble(w)) && /climax/.test(lastBubble(w)), '…and re-serves that ask');
        await w.say('Stay and be caught, or sail and abandon him. She stays.');
        ok(/^Stay and be caught/.test(w.rows.get(P + 'dilemma') || ''), '…and the rewrite REPLACES the old answer (§4c.6 rewrite)');
    }

    // ── 3 · RESUME LANDS ON THE EXACT ASK ────────────────────────────────────────────────
    console.log('\nResume:');
    {
        const w = world();
        w.ctl.start();
        await toAsk(w);
        await w.say('a'); await w.say('b'); await w.say('c'); await w.say('d');
        w.tap(chipNamed(w, /The character succeeds/)); await settle();
        const w2 = reload(w);
        const resumed = w2.ctl.tryResume();
        await settle(); await settle();
        for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 120)); if (w2.bubbles.length) break; }
        ok(resumed === true, 'tryResume() takes the walk');
        await toAsk(w2);
        ok(/what actually happens/i.test(lastBubble(w2)) || /End-State/.test(lastBubble(w2)), 'a reload mid-explain re-serves the explanation ask for the SAME row (§4c.8b)', lastBubble(w2).slice(0, 80));
        await w2.say('He wins the race.');
        ok(/wins the race/.test(w2.rows.get(P + 'ext-goal-end') || ''), '…and the answer still files');
    }

    // ── 4 · THE QUALITY CALL'S OTHER TWO OUTCOMES: OK, and a failed/timed-out call ─────────
    console.log('\nQuality check — OK and fail-open:');
    async function fillAll(w) {
        w.ctl.start(); await toAsk(w);
        await w.say('a'); await w.say('b'); await w.say('c'); await w.say('d');
        w.tap(chipNamed(w, /The character succeeds/)); await settle(); await w.say('e');
        await w.say('f');
        w.tap(chipNamed(w, /^No$/)); await settle(); await w.say('g');
        await w.say('h'); await w.say('i');
        w.tap(chipNamed(w, /Negative/)); await settle(); await w.say('j');
        await w.say('k');
        w.tap(chipNamed(w, /^Negative \(/)); await settle();
    }
    {
        const w = world();
        await fillAll(w);
        ok(w.sends.length === 1, 'OK path: one call fired');
        w.armed.fn('The goal and the need pull against each other, and the arc type matches the defeat. @PROFILE_OK');
        await settle();
        ok(/all of it is in your document/.test(w.bubbles.join('\n')), 'OK → straight to the wrap');
        ok(!chipNamed(w, /Improve my/), '…with no Improve chip');
        // a Keep on a later IMPROVE would look the same; assert Keep explicitly on a fresh world
        const w2 = world();
        await fillAll(w2);
        w2.armed.fn('Fine, except the realisation. @PROFILE_IMPROVE:realisation'); await settle();
        w2.tap(chipNamed(w2, /Keep it as it is/)); await settle();
        ok(/all of it is in your document/.test(w2.bubbles.join('\n')) && w2.sends.length === 1, 'Keep → the wrap, no second call');
    }
    {
        const w = world();
        await fillAll(w);
        w.armed.fn(null, { timedOut: true });
        await settle();
        ok(/all of it is in your document/.test(w.bubbles.join('\n')) && !!chipNamed(w, /Change an answer/), 'a timed-out call FAILS OPEN to the wrap — the student is never parked');
        // and an unknown key is treated as OK
        const w2 = world();
        await fillAll(w2);
        w2.armed.fn('Weak somewhere. @PROFILE_IMPROVE:not-a-row'); await settle();
        ok(/all of it is in your document/.test(w2.bubbles.join('\n')), 'an unknown key fails open too');
    }
    {
        // reload while the call is in flight: the reply is lost, the call is NOT re-spent
        const w = world();
        await fillAll(w);
        const w2 = reload(w);
        w2.ctl.tryResume(); await settle(); await settle();
        for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 120)); if (w2.bubbles.length) break; }
        ok(w2.sends.length === 0 && /all of it is in your document/.test(w2.bubbles.join('\n')), 'a reload mid-call wraps without spending a second call');
        // reload on the choice: the chips come back
        const w3 = world();
        await fillAll(w3);
        w3.armed.fn('Fix the stakes. @PROFILE_IMPROVE:stakes-begin'); await settle();
        const w4 = reload(w3);
        w4.ctl.tryResume(); await settle(); await settle();
        for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 120)); if (w4.chips().length) break; }
        ok(!!chipNamed(w4, /Improve my Stakes/), 'a reload on the Keep / Improve choice re-offers the chips (§4d)');
    }

    console.log('\n' + (fail ? '❌ cw11-sim FAILED' : '✅ cw11-sim passed') + '  (' + asserts.pass + ' assertions, ' + asserts.fail + ' failed)');
    process.exit(fail);
}
main().catch((e) => { console.error('❌ cw11-sim threw:', e && e.stack); process.exit(1); });
