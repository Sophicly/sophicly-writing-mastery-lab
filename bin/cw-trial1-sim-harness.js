#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial1-sim-harness.js — BEHAVIOURAL gate for Trial 1 (v7.20.551, CW trials slice 4;
 * rewritten v7.20.554 for the EXAMINER WALK, #424 / PEDAGOGY §33.10).
 *
 * Slices the REAL `_cwTrial1Ctl` out of wml-assessment.js and drives it on the shared rig
 * (walk-sim-lib) with the REAL seven elements out of wml-core and the REAL `_ladderGrade` out of
 * wml-assessment — never re-typed copies (§14c: a check that duplicates its subject tests its own
 * memory). Because `ok` is passed to makeWorld, every say()/tap() is liveness-checked
 * automatically and there is no opt-out (§4d).
 *
 * WHAT THIS GATE IS FOR:
 *  1. ⭐⭐ THE STUDENT MARKS FIRST, LIKE AN EXAMINER. All seven of their 0–4 marks are banked
 *     before Sophia is asked anything at all (PEDAGOGY §19/§33.10): Level 1 (1–2 marks) then
 *     Level 2 (3–4), climbed bottom-up, placed top/bottom, evidence sentence on every mark.
 *  2. ⭐⭐ ONE API CALL for the whole trial. The seven asks cost nothing; only the marking turn
 *     spends (§4 programmatic-first).
 *  3. ⭐ SERIAL (root §18): one element on screen, one level on screen at a time.
 *  4. ⭐ THE ASK TEACHES BEFORE IT ASKS (§4c.1/2/4): the taught definition, a worked example,
 *     Level 1's descriptor — and it ENDS on the question.
 *  5. ⭐ THEIR OWN PLAN IS SHOWN, NEVER REQUESTED (WML §3 paste-wall).
 *  6. ⭐ THE HELP LADDER WORKS AND DOES NOT DESTROY THE ASK (#274).
 *  7. ⭐⭐ THE MARK IS CODE'S, FROM SOPHIA'S LEVEL CALLS. none=0 · l1_low=1 · l1_top=2 ·
 *     l2_low=3 · l2_top=4, out of 28, through the canonical `_ladderGrade` — and a grade the
 *     model states in prose changes nothing.
 *  8. ⭐⭐ THE REVEAL ORDER IS WORDS-FIRST, GRADE-LAST (§33.9, Butler/EEF) and the trial ENDS on
 *     the student's own target, banked and saved for Draft 2's opener.
 *  9. ⭐⭐ A MISSING MARKER FILES NOTHING AND SAYS SO (§11) — no partial mark, no dead screen.
 * 10. ⭐ RESUME LANDS ON THE EXACT ELEMENT — and the exact LEVEL of it (§4c.8b).
 *
 * Usage: node bin/cw-trial1-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── the REAL data, lifted from the shipped files ─────────────────────────────────────────────
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const elIdx = CORE.indexOf('const CW_SCENE_ELEMENTS = [');
if (elIdx < 0) { console.error('❌ CW_SCENE_ELEMENTS not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const ELEMENTS = eval(braceSliceFrom(CORE, elIdx, '[', ']').text);

const lgIdx = SRC.indexOf('function _ladderGrade(pct)');
if (lgIdx < 0) { console.error('❌ _ladderGrade not found — the trial must not grow its own ladder'); process.exit(1); }
// eslint-disable-next-line no-new-func
const LADDER_GRADE = new Function('return ' + SRC.slice(lgIdx, braceSliceFrom(SRC, lgIdx, '{', '}').end) + ';')();

const ctlIdx = SRC.indexOf('const _cwTrial1Ctl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwTrial1Ctl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

const FIDS = ELEMENTS.map((e) => 'cw-trial-1-' + e.id)
    .concat(ELEMENTS.map((e) => 'cw-trial-1-fb-' + e.id))
    .concat(['cw-trial-1-mark', 'cw-trial-1-gap', 'cw-trial-1-strength', 'cw-trial-1-priority', 'cw-trial-1-target']);
const PLAN = { hook: 'A dog barks at nothing and the lights go out.', epiphany: 'She sees her own reflection in the sentinel’s visor.' };

let planLoaded = false;   // set by the stateful loader stub below; reset per world
function world(opts) {
    opts = opts || {};
    planLoaded = false;
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_1',
        fids: FIDS,
        ok: ok,
        extraDeps: {
            _ladderGrade: LADDER_GRADE,
            // STATEFUL, like the real cache: _cwDocValue answers from what a completed load put
            // there, and the load lands on a LATER tick. A serve that does not wait for the load
            // reads an empty cache — which is the .552 race (#422) — so the plan-echo assertions
            // below can actually fail on code that forgets to wait.
            _cwDocValue: function (key, fid) {
                if (!planLoaded || key !== 'scene_selection') return '';
                const el = ELEMENTS.filter((e) => e.planFid === fid)[0];
                return (el && PLAN[el.id]) || '';
            },
            _cwLoadDocValues: function () {
                return new Promise((res) => setImmediate(() => { planLoaded = true; res({}); }));
            },
        },
    }, opts));
    // The rig's WML shim is the REAL recordTurn (it throws on a durability breach), so it is
    // extended in place rather than replaced — replacing it would switch that contract off.
    w.saved = [];
    Object.assign(w.deps.WML, {
        CW_SCENE_ELEMENTS: ELEMENTS,
        cwProject: { saveTrial: function (pid, payload) { w.saved.push(payload); return Promise.resolve({ success: true }); } },
    });
    return w;
}

const lastBubble = (w) => w.bubbles[w.bubbles.length - 1] || '';
/** The model answers the armed hand-off. */
const reply = (w, text) => w.resolveApi(text);
/** The call never comes back — the rig's resolveApi has no timeout path, so fire the hook itself. */
function timeout(w) { const a = w.armed; if (!a) return false; a.fn(null, { timedOut: true }); return true; }
/** Everything the walk sent the model as hidden context. */
const hiddenCtx = (w) => (w.deps.canvasChatHistory || []).filter((t) => t.hidden).map((t) => t.content).join('\n');
/** The same browser, one page reload later: the sidecar and the document both survive. */
const reload = (w) => world({ ls: w.ls, prefill: Object.fromEntries(w.rows) });
const allText = (w) => w.bubbles.join('\n');
const chipNamed = (w, re) => w.chips().filter((c) => re.test(String(c.textContent)))[0] || null;

/** Tap through the paced orientation to the first real ask. */
async function toFirstAsk(w) {
    for (let i = 0; i < 12; i++) {
        await settle();
        const cont = chipNamed(w, /Continue/);
        if (!cont) break;
        w.tap(cont);
    }
    await settle();
}
/** Drive the CURRENT element to the given 0–4 mark, then supply the sentence.
 *  opts.last: the sentence that completes the set arms the MARKING call, and the rig's say()
 *  auto-resolves any armed call with `undefined` — so the last sentence goes through handleTurn
 *  directly, leaving the armed call for the test to answer (reply / timeout) deliberately. */
async function score(w, mark, note, opts) {
    const tapNamed = async (re) => {
        const c = chipNamed(w, re);
        if (!c) return false;
        w.tap(c);
        await settle();
        return true;
    };
    let okTaps = true;
    if (mark === 0) okTaps = await tapNamed(/^Not yet$/);
    else if (mark === 1) okTaps = (await tapNamed(/^Some of it$/)) && (await tapNamed(/Bottom of Level 1/));
    else if (mark === 2) okTaps = (await tapNamed(/Yes — all of it/)) && (await tapNamed(/Level 1 is my level/));
    else if (mark === 3) okTaps = (await tapNamed(/Yes — all of it/)) && (await tapNamed(/^Some of it$/));
    else okTaps = (await tapNamed(/Yes — all of it/)) && (await tapNamed(/Yes — all of it/));
    if (!okTaps) return false;
    const sentence = note || 'The moment the lights go out proves it.';
    if (opts && opts.last) { w.ctl.handleTurn(sentence); } else { await w.say(sentence); }
    await settle();
    return true;
}
/** Drive all seven to the same mark; the marking call is left ARMED for the test to answer. */
async function scoreAll(w, mark, note) {
    for (let i = 0; i < ELEMENTS.length; i++) {
        const done = await score(w, mark, note, { last: i === ELEMENTS.length - 1 });
        if (!done) return i;
    }
    await settle();
    return ELEMENTS.length;
}
function markerBlock(map, opts) {
    opts = opts || {};
    const lines = ELEMENTS.map((e) => '@TRIAL_VERDICT[' + e.id + '=' + (map[e.id] || 'l2_top') + ']'
        + (opts.comments === false ? '' : ' Her sentence on the ' + e.id + ', quoting "their words".'));
    if (opts.tail !== false) {
        lines.push('@TRIAL_STRENGTH[hook] The opening image carries the whole premise.');
        lines.push('@TRIAL_PRIORITY[denouement] Give the last line an image instead of an explanation.');
    }
    return lines.join('\n');
}

async function main() {
    console.log('\nCW TRIAL 1 — behavioural sim (real _cwTrial1Ctl, real elements, real ladder, examiner walk)\n');

    // ── 1 · THE OPENING IS PACED, TEACHES THE METHOD, AND THE FIRST ASK TEACHES ──────────
    {
        const w = world();
        w.ctl.forceStart();
        await settle();
        ok(!!chipNamed(w, /Continue/), '1 · the orientation PAGES — one bubble at a time, not a wall (§4b)');
        await toFirstAsk(w);
        ok(/AO5: Content and Organisation/.test(allText(w)),
            '1 · the AO badge is served, plain name first (§33.11)');
        ok(/the way a real examiner marks/i.test(allText(w)),
            '1 · the examiner method is TAUGHT before it is used (§33.10)');
        const t = lastBubble(w);
        ok(/Hook/.test(t), '1 · the first ask is the FIRST element, Hook');
        ok(t.indexOf(ELEMENTS[0].prompt) !== -1, '1 · it carries the definition the student was taught in Step 9, verbatim');
        ok(t.indexOf(ELEMENTS[0].example) !== -1, '1 · …and a worked example inside the ask itself (§4c.2, ladder rung 0)');
        ok(/Level 1 — 1 to 2 marks/.test(t), '1 · …and Level 1’s descriptor — the criterion of THIS question (§4c.1)');
        ok(t.indexOf(ELEMENTS[0].strong) === -1, '1 · Level 2 is NOT shown yet — levels are revealed serially, like a real climb');
        ok(/does it do all of level 1\?\*\*\s*$/i.test(t.trim()), '1 · the ask ENDS on the question (§4c.4)');
        ok(/1 of 7/.test(t), '1 · the student can see how long this is');
        ok(t.indexOf(PLAN.hook) !== -1, '1 · their OWN Step-9 plan is shown to them…');
        ok(!/paste|type it out|share your draft|copy your/i.test(allText(w)),
            '1 · …and never asked for — the paste-wall law (WML §3)');
        ok(w.sends.length === 0, '1 · nothing has cost an API call yet');
    }

    // ── 2 · THE CLIMB: LEVEL 1 CLEARED SHOWS LEVEL 2; TOP OF THE LADDER IS 4/4 ───────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const first = lastBubble(w);
        const named = ELEMENTS.filter((e) => first.indexOf('**' + e.label + '**') !== -1);
        ok(named.length === 1, '2 · exactly ONE element is on screen at a time (root §18 — a menu collects six skips)');
        w.tap(chipNamed(w, /Yes — all of it/));
        await settle();
        const l2 = lastBubble(w);
        ok(l2.indexOf(ELEMENTS[0].strong) !== -1, '2 · clearing Level 1 reveals Level 2 — which IS the taught "strong" criterion');
        ok(/stays on the record/i.test(l2), '2 · …and says Level 1 stays on the record (a presented level is never removed, #424)');
        ok(!!chipNamed(w, /Level 1 isn/), '2 · …with a way back down if the climb was hopeful');
        w.tap(chipNamed(w, /Yes — all of it/));
        await settle();
        ok(/4 out of 4/.test(lastBubble(w)), '2 · all of Level 2 = 4/4');
        ok(/prove it/i.test(lastBubble(w)), '2 · ⭐ a Level-2 claim demands EVIDENCE — "show me the line that proves it" (§33.10)');
        await w.say('The dog barking at nothing is the moment.');
        await settle();
        const row = w.rows.get('cw-trial-1-hook') || '';
        ok(/^4\/4 — The dog barking/.test(row), '2 · the row carries the mark AND their evidence, verbatim');
        ok(/Setup/.test(lastBubble(w)), '2 · and the walk moves straight to element 2');
        ok(w.sends.length === 0, '2 · still zero API calls');
    }

    // ── 3 · THE PLACEMENT CALL: INSIDE LEVEL 1, TOP OR BOTTOM ────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /^Some of it$/));
        await settle();
        ok(/where in the level/i.test(lastBubble(w)), '3 · "some of it" asks the examiner’s placement question');
        w.tap(chipNamed(w, /Bottom of Level 1/));
        await settle();
        ok(/1 out of 4/.test(lastBubble(w)), '3 · bottom of Level 1 = 1/4');
        ok(/what is missing/i.test(lastBubble(w)), '3 · …and a stopped climb asks what is missing (the Draft-2 target)');
        await w.say('It starts with the weather instead of the moment.');
        await settle();
        const row = w.rows.get('cw-trial-1-hook') || '';
        ok(/^1\/4 — /.test(row), '3 · the row carries the mark…');
        ok(/weather instead of the moment/.test(row), '3 · …and their own sentence, verbatim');
        ok(/Setup/.test(lastBubble(w)), '3 · then it moves on');
    }

    // ── 3b · THE WAY BACK DOWN — a hopeful climb can be corrected (#424) ─────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /Yes — all of it/));
        await settle();
        w.tap(chipNamed(w, /Level 1 isn/));
        await settle();
        ok(/back down/i.test(lastBubble(w)), '3b · climbing back down is named as the examiner’s own move');
        ok(!!chipNamed(w, /Top of Level 1/), '3b · …and lands on the placement question, not a dead screen');
        w.tap(chipNamed(w, /Top of Level 1/));
        await settle();
        await w.say('Nearly all there, the barking needs a reason.');
        await settle();
        ok(/^2\/4 — /.test(w.rows.get('cw-trial-1-hook') || ''), '3b · top of Level 1 = 2/4, banked');
    }

    // ── 3c · A PASTED-BACK MARK PREFIX IS NOT DOUBLED (#421’s class, new format) ────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /^Not yet$/));
        await settle();
        await w.say('0/4 — it’s not very descriptive and attention grabbing');
        await settle();
        const row = w.rows.get('cw-trial-1-hook') || '';
        ok(!/0\/4\s*[—–-]\s*0\/4/.test(row), '3c · "0/4 — 0/4 —" never appears in the banked row');
        ok(/^0\/4 — it/.test(row), '3c · …the mark appears exactly once, then their sentence');
        ok(/descriptive and attention grabbing/.test(row), '3c · …and the sentence itself is intact');
    }

    // ── 4 · A RE-ANSWER REPLACES, IT NEVER STITCHES (§4c.6 `rewrite`) ────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /^Not yet$/));
        await settle();
        await w.say('First try.');
        await settle();
        const row = w.rows.get('cw-trial-1-hook') || '';
        ok(!/First try\.\s*\n\n.*First try/.test(row), '4 · one answer, one row');
        const writes = w.writes.filter((x) => x.fid === 'cw-trial-1-hook');
        ok(writes.every((x) => x.replace === true),
            '4 · the note is banked on a REPLACE cycle — a self-contained sentence must never stack two drafts');
    }

    // ── 5 · THE HELP LADDER: FREE RUNGS FIRST, AND A TAP NEVER KILLS THE ASK (#274) ──────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const more = w.helpChipNamed(/More examples/);
        ok(!!more, '5 · rung 1 "More examples" is offered');
        const stuck = w.helpChipNamed(/Still stuck/);
        ok(!!stuck, '5 · rung 3 "Still stuck — ask Sophia" is offered…');
        const labels = w.helpChips().map((c) => String(c.textContent));
        ok(labels[labels.length - 1] === 'Still stuck — ask Sophia',
            '5 · …LAST, so the only rung that costs anything is the last resort (§4c.9)');
        w.tap(more);
        await settle();
        ok(lastBubble(w).indexOf(ELEMENTS[0].more[0]) !== -1, '5 · it serves ONE further example (not the whole pool — the #200 lesson)');
        ok(!!chipNamed(w, /Yes — all of it/), '5 · ⭐ and the level chips are still there afterwards — the ask survives the help');
        ok(w.sends.length === 0, '5 · a free rung spends nothing');
        // second tap serves the SECOND example, then the rung retires
        w.tap(w.helpChipNamed(/More examples/));
        await settle();
        ok(lastBubble(w).indexOf(ELEMENTS[0].more[1]) !== -1, '5 · a second tap serves the SECOND example');
        ok(!w.helpChipNamed(/More examples/), '5 · …and the rung then retires rather than repeating itself');
        // help mid-climb re-offers the RIGHT question — Level 2's, not Level 1's (fresh world,
        // so the More-examples pool is unspent when the climb reaches Level 2)
        const wc = world();
        wc.ctl.forceStart();
        await toFirstAsk(wc);
        wc.tap(chipNamed(wc, /Yes — all of it/));
        await settle();
        wc.tap(wc.helpChipNamed(/More examples/));
        await settle();
        ok(!!chipNamed(wc, /Level 1 is my level/), '5 · ⭐ help mid-climb re-offers LEVEL 2’s chips — the stage survives the detour');
    }

    // ── 6 · THE SEVEN ASKS COST NOTHING; THE MARKING TURN IS THE ONE CALL ────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const scored = await scoreAll(w, 4);
        ok(scored === 7, '6 · all seven elements are asked');
        ok(w.sends.length === 1, '6 · ⭐⭐ exactly ONE API call for the whole trial');
        const send = w.sends[0];
        ok(send.id === 'trial1-marking', '6 · …and it is the marking turn');
        const ctx = hiddenCtx(w);
        ok(/@TRIAL_VERDICT\[hook=none\|l1_low\|l1_top\|l2_low\|l2_top\]/.test(ctx), '6 · the marking prompt carries the LADDER marker contract (#424)');
        ok(/Do NOT give a mark|not by you/.test(ctx), '6 · …and forbids the model inventing the number (§33 ruling 4/8)');
        ok(/WHAT THE STUDENT DECIDED/.test(ctx), '6 · ⭐⭐ their own seven marks are sent WITH the draft — she marks alongside their judgment, never instead of it');
        ELEMENTS.forEach((e) => {
            ok((w.rows.get('cw-trial-1-' + e.id) || '').length > 0, '6 · ' + e.label + ' was banked BEFORE Sophia was asked (PEDAGOGY §19)');
        });
        ok(!w.rows.get('cw-trial-1-mark'), '6 · no mark exists yet — the student marked first');
    }

    // ── 7 · THE MARK IS CODE'S ARITHMETIC ON SOPHIA'S LEVEL CALLS ────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);           // the student claims 28/28
        // 4× l2_top (16) + 2× l1_top (4) + 1× none (0) = 20/28 = 71% → the canonical ladder.
        const verdicts = { proaction: 'l1_top', climax: 'l1_top', denouement: 'none' };
        reply(w, 'Here is my read of it. **You are a Grade 9 writer** and this is 40/40.\n\n' + markerBlock(verdicts));
        await settle();
        const expected = LADDER_GRADE(Math.round((20 / 28) * 100));
        const markRow = w.rows.get('cw-trial-1-mark') || '';
        ok(/20\/28/.test(markRow), '7 · the marks are counted by code from her level calls: none=0 · l1=1–2 · l2=3–4');
        ok(markRow.indexOf('Grade ' + expected) === 0, '7 · …and banded through the ONE canonical ladder (grade ' + expected + ')');
        ok(!/Grade 9/.test(markRow), '7 · ⭐⭐ the grade the model announced in prose ("Grade 9", "40/40") changes nothing');
        ok(/story coherence/i.test(markRow), '7 · the mark says which dimension it is for');
        ok(w.saved.length === 1 && w.saved[0].grade === expected && w.saved[0].marks === 20,
            '7 · the result is saved to the project with its marks and grade');
        ok(w.saved[0].self && w.saved[0].sophia, '7 · …carrying BOTH sets of marks, so the dashboard can show the gap');
        ok(w.saved[0].self_total === 28 && w.saved[0].calibration_delta === 8,
            '7 · ⭐ …and the CALIBRATION DELTA (self 28 − Sophia 20 = +8), the metacognitive metric (§33.12)');
        ok(w.saved[0].ao_family === 'AO5', '7 · …tagged with its AO family for the report surface (§33.11)');
        // #419 — the document carries the essay-doc architecture, scaled to the trial:
        ELEMENTS.forEach((e) => {
            const row = w.rows.get('cw-trial-1-fb-' + e.id) || '';
            ok(/^[0-4]\/4/.test(row), '7 · her level call on the ' + e.id + ' is IN THE DOCUMENT as a mark phrase (#419, root §14 — never a raw token)');
            ok(/quoting/.test(row) || /—/.test(row), '7 · …with her sentence attached');
        });
        ok(!/l1_top|l2_low|l2_top|none/.test(ELEMENTS.map((e) => w.rows.get('cw-trial-1-fb-' + e.id) || '').join(' ')),
            '7 · ⛔ no raw machine token reaches the document (root §14)');
        ok(/Hook — The opening image/.test(w.rows.get('cw-trial-1-strength') || ''),
            '7 · Key Strength is filed from her marker, named by ELEMENT LABEL not id (root §14)');
        ok(/Denouement — Give the last line/.test(w.rows.get('cw-trial-1-priority') || ''),
            '7 · Priority for Draft 2 is filed from her marker');
    }

    // ── 7b · COMMENTS AND TAIL MARKERS ARE BEST-EFFORT — the MARK never depends on them ──
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);
        const verdicts = { climax: 'l1_low' };
        reply(w, 'Bare verdicts only.\n\n' + markerBlock(verdicts, { comments: false, tail: false }));
        await settle();
        ok(/^Grade /.test(w.rows.get('cw-trial-1-mark') || ''), '7b · bare verdict lines still file the mark — comments are never load-bearing');
        ok(/^4\/4/.test(w.rows.get('cw-trial-1-fb-hook') || ''), '7b · a comment-less element row holds the mark phrase alone');
        ok((w.rows.get('cw-trial-1-strength') || '').length > 0, '7b · a missing @TRIAL_STRENGTH derives from her HIGHEST level call rather than leaving a blank locked row');
        ok(/Climax/.test(w.rows.get('cw-trial-1-priority') || ''), '7b · a missing @TRIAL_PRIORITY derives from her LOWEST level call (l1_low climax)');
        ok((w.warns || []).some((m) => /TRIAL_STRENGTH/.test(m)) && (w.warns || []).some((m) => /TRIAL_PRIORITY/.test(m)),
            '7b · …and both misses are loud in the console');
    }

    // ── 8 · REVEAL ORDER: WORDS FIRST, GRADE LAST — THEN THE STUDENT'S OWN TARGET ────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);            // the student says everything is top of Level 2
        const verdicts = {};
        ELEMENTS.forEach((e) => { verdicts[e.id] = 'l2_top'; });
        verdicts.climax = 'none';        // …Sophia does not agree about the climax
        reply(w, 'My verdicts.\n\n' + markerBlock(verdicts));
        await settle();
        const reveal = w.bubbles.filter((b) => /Where we saw it differently/.test(b))[0] || '';
        ok(/Climax/.test(reveal), '8 · the disagreement is named on screen');
        ok(/you said \*4\/4\*/.test(reveal) && /I said \*0\/4\*/.test(reveal), '8 · …as both marks, side by side');
        ok(reveal.indexOf('Where we saw it differently') === 0,
            '8 · ⭐⭐ the reveal LEADS with the words — the grade is not the headline (§33.9, Butler/EEF)');
        ok(reveal.indexOf('Grade') > reveal.indexOf('worth looking at again'),
            '8 · …and the grade is a quiet closing line AFTER the substance');
        ok(/Climax/.test(w.rows.get('cw-trial-1-gap') || ''), '8 · …and filed in the document for the tutor');
        ok(/your one target for Draft 2/i.test(lastBubble(w)),
            '8 · ⭐⭐ the trial does not end on the grade — it ends on the student’s own ACTION (§33.9, Wiliam)');
        await w.say('Give the climax a real collision instead of a summary.');
        await settle();
        ok(/real collision/.test(w.rows.get('cw-trial-1-target') || ''), '8 · the target is banked into the document, verbatim');
        ok(w.saved.length === 2 && /real collision/.test(w.saved[1].target || ''),
            '8 · …and saved to the project, so Draft 2’s page can pin it (tryFillCwDraftTarget)');
        ok(w.saved[1].calibration_delta === undefined,
            '8 · the delta rides only the FIRST save — the trend is never double-counted');
        ok(!!chipNamed(w, /Change my answers/), '8 · the finished trial can be re-opened');
        const agree = world();
        agree.ctl.forceStart();
        await toFirstAsk(agree);
        await scoreAll(agree, 4);
        reply(agree, 'All good.\n\n' + markerBlock({}));
        await settle();
        ok(/agreed on all seven/i.test(agree.rows.get('cw-trial-1-gap') || ''),
            '8 · total agreement is stated too — never a blank box the student has to interpret');
    }

    // ── 9 · ⭐⭐ A MISSING MARKER FILES NOTHING, AND SAYS SO ──────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);
        reply(w, 'Lovely work! I have read it all and I think it hangs together.\n\n@TRIAL_VERDICT[hook=l2_top]');
        await settle();
        ok(!w.rows.get('cw-trial-1-mark'), '9 · one marker out of seven files NO mark — never a partial one');
        ok(!!chipNamed(w, /Give me my marks/), '9 · …and the student is left with a way forward, not a dead screen (§4d)');
        ok((w.warns || []).some((m) => /verdict markers parsed/.test(m)), '9 · …and it is loud in the console for us');
        const retry = chipNamed(w, /Give me my marks/);
        w.tap(retry);
        await settle();
        ok(w.sends.length === 2, '9 · the retry actually re-asks');
        reply(w, 'Second time.\n\n' + markerBlock({}));
        await settle();
        ok(/^Grade 9/.test(w.rows.get('cw-trial-1-mark') || ''), '9 · …and the mark then files (all seven l2_top = 28/28)');
    }

    // ── 10 · A FAILED CALL IS HONEST, AND THEIR WORK IS SAFE ─────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);
        timeout(w);
        await settle();
        ok(/could not read your draft/i.test(lastBubble(w)), '10 · a failed marking call says so plainly (degraded-mode contract)');
        ok(/saved/i.test(lastBubble(w)), '10 · …and tells them their marking is not lost');
        ok(!!chipNamed(w, /Try again/), '10 · …and offers the retry');
        ok(!w.rows.get('cw-trial-1-mark'), '10 · no mark is invented from a failed call');
    }

    // ── 11 · RESUME LANDS ON THE EXACT ELEMENT (§4c.8b) ──────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 4);               // hook
        await score(w, 4);               // setup
        await score(w, 4);               // reaction
        await settle();
        ok(/Epiphany/.test(lastBubble(w)), '11 · the student is on element 4');
        const w2 = reload(w);   // same browser, page reloaded
        const resumed = w2.ctl.tryResume();
        await settle();
        ok(resumed, '11 · the walk resumes');
        ok(/Epiphany/.test(lastBubble(w2)), '11 · ⭐ …on the EXACT element they were on, not the top of the seven');
        // #422 — the .552 re-serve raced _cwLoadDocValues and served the ask WITHOUT the
        // student's own Step-9 plan. The loader stub resolves on a LATER tick, so a re-serve
        // that does not wait reads an empty cache and this fails.
        ok(w2.bubbles.some((b) => /Epiphany/.test(b) && b.indexOf('What you planned in Step 9') !== -1),
            '11 · ⭐ the resumed ask still carries their own Step-9 plan (#422 — the re-serve waits for the load)');
        ok(!!chipNamed(w2, /Yes — all of it/), '11 · …with its chips back, so the page is not dead after a reload');
    }

    // ── 11b · RESUME MID-CLIMB LANDS ON THE EXACT LEVEL, NOT THE ELEMENT'S TOP ───────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /Yes — all of it/));   // hook: Level 1 cleared, Level 2 on screen
        await settle();
        const w2 = reload(w);
        w2.ctl.tryResume();
        await settle();
        ok(lastBubble(w2).indexOf(ELEMENTS[0].strong) !== -1,
            '11b · ⭐ a reload mid-climb re-serves LEVEL 2 — the level they were on, not Level 1 again');
        ok(!!chipNamed(w2, /Level 1 is my level/), '11b · …with Level 2’s chips live');
    }

    // ── 12 · RESUME MID-SENTENCE RE-ASKS FOR THE SENTENCE, NOT THE LEVEL ─────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /^Not yet$/));
        await settle();
        const w2 = reload(w);
        w2.ctl.tryResume();
        await settle();
        ok(/one sentence/i.test(lastBubble(w2)), '12 · a reload while a sentence is owed re-asks for the sentence');
        await w2.say('The opening explains the weather for a paragraph.');
        await settle();
        ok(/weather for a paragraph/.test(w2.rows.get('cw-trial-1-hook') || ''), '12 · …and that sentence still files');
    }

    // ── 12b · RESUME WHILE THE TARGET IS OWED RE-ASKS FOR THE TARGET ─────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);
        reply(w, 'Done.\n\n' + markerBlock({}));
        await settle();
        const w2 = reload(w);
        w2.ctl.tryResume();
        await settle();
        ok(/your one target for Draft 2/i.test(lastBubble(w2)), '12b · a reload before the target is written re-asks for it — the closing ask cannot be lost');
        await w2.say('Start inside the moment, not the weather.');
        await settle();
        ok(/inside the moment/.test(w2.rows.get('cw-trial-1-target') || ''), '12b · …and it still files');
    }

    // ── 13 · IT CAN BE RE-OPENED (Neil's standing requirement, #221) ─────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 4);
        reply(w, 'Done.\n\n' + markerBlock({}));
        await settle();
        await w.say('Make the ending an image.');
        await settle();
        const again = chipNamed(w, /Change my answers/);
        ok(!!again, '13 · the finished trial offers "Change my answers"');
        w.tap(again);
        await settle();
        ok(/Hook/.test(lastBubble(w)), '13 · …and it starts again at the first element');
        ok(!!chipNamed(w, /Yes — all of it/), '13 · …live, with chips');
    }

    console.log('\n' + (fail ? '❌ cw-trial1-sim FAILED' : '✅ cw-trial1-sim passed')
        + '  (' + asserts.pass + ' assertions, ' + asserts.fail + ' failed)');
    process.exit(fail);
}

main().catch((e) => { console.error('❌ cw-trial1-sim threw:', e && e.stack); process.exit(1); });
