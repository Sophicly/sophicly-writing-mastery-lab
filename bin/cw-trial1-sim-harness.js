#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial1-sim-harness.js — BEHAVIOURAL gate for Trial 1 (v7.20.551, CW trials slice 4).
 *
 * Slices the REAL `_cwTrial1Ctl` out of wml-assessment.js and drives it on the shared rig
 * (walk-sim-lib) with the REAL seven elements out of wml-core and the REAL `_ladderGrade` out of
 * wml-assessment — never re-typed copies (§14c: a check that duplicates its subject tests its own
 * memory). Because `ok` is passed to makeWorld, every say()/tap() is liveness-checked
 * automatically and there is no opt-out (§4d).
 *
 * WHAT THIS GATE IS FOR:
 *  1. ⭐⭐ THE STUDENT JUDGES FIRST. All seven of their verdicts are banked before Sophia is asked
 *     anything at all (PEDAGOGY §19 — a judgment formed after hearing hers is not their judgment).
 *  2. ⭐⭐ ONE API CALL for the whole trial. The seven asks cost nothing; only the marking turn
 *     spends (§4 programmatic-first).
 *  3. ⭐ SERIAL (root §18): one element on screen, one verdict, next. A "Yes" costs exactly one tap.
 *  4. ⭐ THE ASK TEACHES BEFORE IT ASKS (§4c.1/2/4): the taught definition, what a strong one does,
 *     a worked example, and it ENDS on the question.
 *  5. ⭐ THEIR OWN PLAN IS SHOWN, NEVER REQUESTED (WML §3 paste-wall).
 *  6. ⭐ THE HELP LADDER WORKS AND DOES NOT DESTROY THE ASK (#274): a rung-1 tap serves ONE more
 *     example and leaves the verdict chips on screen.
 *  7. ⭐⭐ THE MARK IS CODE'S, FROM SOPHIA'S VERDICTS. met=2 · partly=1 · not=0 out of 14, through
 *     the canonical `_ladderGrade` — and a grade the model states in prose changes nothing.
 *  8. ⭐⭐ A MISSING MARKER FILES NOTHING AND SAYS SO. The named failure mode is engineered out
 *     (§11), not disclaimed: no partial mark, and never a dead screen.
 *  9. ⭐ RESUME LANDS ON THE EXACT ELEMENT (§4c.8b), re-derived from the document.
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

const FIDS = ELEMENTS.map((e) => 'cw-trial-1-' + e.id).concat(['cw-trial-1-mark', 'cw-trial-1-gap']);
const PLAN = { hook: 'A dog barks at nothing and the lights go out.' };

function world(opts) {
    opts = opts || {};
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_1',
        fids: FIDS,
        ok: ok,
        extraDeps: {
            _ladderGrade: LADDER_GRADE,
            _cwDocValue: function (key, fid) {
                if (key !== 'scene_selection') return '';
                const el = ELEMENTS.filter((e) => e.planFid === fid)[0];
                return (el && PLAN[el.id]) || '';
            },
            _cwLoadDocValues: function () { return Promise.resolve({}); },
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
    for (let i = 0; i < 10; i++) {
        await settle();
        const cont = chipNamed(w, /Continue/);
        if (!cont) break;
        w.tap(cont);
    }
    await settle();
}
/** Answer element `i` with a verdict; supply `note` for Partly / Not yet. */
async function answer(w, re, note) {
    const chip = chipNamed(w, re);
    if (!chip) return false;
    w.tap(chip);
    await settle();
    if (note) { await w.say(note); await settle(); }
    return true;
}
/** Drive all seven with the same verdict. */
async function answerAll(w, re, note) {
    for (let i = 0; i < ELEMENTS.length; i++) {
        const done = await answer(w, re, note);
        if (!done) return i;
    }
    await settle();
    return ELEMENTS.length;
}
function markerBlock(map) {
    return ELEMENTS.map((e) => '@TRIAL_VERDICT[' + e.id + '=' + (map[e.id] || 'met') + ']').join('\n');
}

async function main() {
    console.log('\nCW TRIAL 1 — behavioural sim (real _cwTrial1Ctl, real elements, real ladder)\n');

    // ── 1 · THE OPENING IS PACED, AND THE FIRST ASK TEACHES ──────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await settle();
        ok(!!chipNamed(w, /Continue/), '1 · the orientation PAGES — one bubble at a time, not a wall (§4b)');
        await toFirstAsk(w);
        const t = lastBubble(w);
        ok(/Hook/.test(t), '1 · the first ask is the FIRST element, Hook');
        ok(t.indexOf(ELEMENTS[0].prompt) !== -1, '1 · it carries the definition the student was taught in Step 9, verbatim');
        ok(t.indexOf(ELEMENTS[0].strong) !== -1, '1 · …and what a STRONG one does, before the question (§4c.1)');
        ok(t.indexOf(ELEMENTS[0].example) !== -1, '1 · …and a worked example inside the ask itself (§4c.2, ladder rung 0)');
        ok(/does your hook do that\?\*\*\s*$/i.test(t.trim()), '1 · the ask ENDS on the question (§4c.4)');
        ok(/1 of 7/.test(t), '1 · the student can see how long this is');
        ok(t.indexOf(PLAN.hook) !== -1, '1 · their OWN Step-9 plan is shown to them…');
        ok(!/paste|type it out|share your draft|copy your/i.test(allText(w)),
            '1 · …and never asked for — the paste-wall law (WML §3)');
        ok(w.sends.length === 0, '1 · nothing has cost an API call yet');
    }

    // ── 2 · SERIAL: ONE ELEMENT AT A TIME, A "YES" IS ONE TAP ────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const first = lastBubble(w);
        const named = ELEMENTS.filter((e) => first.indexOf('**' + e.label + '**') !== -1);
        ok(named.length === 1, '2 · exactly ONE element is on screen at a time (root §18 — a menu collects six skips)');
        const before = w.writes.length;
        w.tap(chipNamed(w, /Yes, it does/));
        await settle();
        ok(w.writes.length === before + 1, '2 · a "Yes" costs exactly one tap and banks one row');
        ok(w.rows.get('cw-trial-1-hook') === 'Yes', '2 · …the verdict is filed against that element');
        ok(/Setup/.test(lastBubble(w)), '2 · and the walk moves straight to element 2');
        ok(w.sends.length === 0, '2 · still zero API calls');
    }

    // ── 3 · "PARTLY" ASKS FOR ONE SENTENCE, AND BANKS IT WITH THE VERDICT ────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /Partly/));
        await settle();
        ok(/one sentence/i.test(lastBubble(w)), '3 · a "Partly" asks what is missing, in one sentence');
        ok(/Draft 2/.test(lastBubble(w)), '3 · …and frames it as the target for the next draft');
        await w.say('It starts with the weather instead of the moment.');
        await settle();
        const row = w.rows.get('cw-trial-1-hook') || '';
        ok(/^Partly/.test(row), '3 · the row carries the verdict…');
        ok(/weather instead of the moment/.test(row), '3 · …and their own sentence, verbatim');
        ok(/Setup/.test(lastBubble(w)), '3 · then it moves on');
    }

    // ── 4 · A RE-ANSWER REPLACES, IT NEVER STITCHES (§4c.6 `rewrite`) ────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /Not yet/));
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
        ok(!!chipNamed(w, /Yes, it does/), '5 · ⭐ and the verdict chips are still there afterwards — the ask survives the help');
        ok(w.sends.length === 0, '5 · a free rung spends nothing');
        // second tap serves the SECOND example, then the rung retires
        w.tap(w.helpChipNamed(/More examples/));
        await settle();
        ok(lastBubble(w).indexOf(ELEMENTS[0].more[1]) !== -1, '5 · a second tap serves the SECOND example');
        ok(!w.helpChipNamed(/More examples/), '5 · …and the rung then retires rather than repeating itself');
    }

    // ── 6 · THE SEVEN ASKS COST NOTHING; THE MARKING TURN IS THE ONE CALL ────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const answered = await answerAll(w, /Yes, it does/);
        ok(answered === 7, '6 · all seven elements are asked');
        ok(w.sends.length === 1, '6 · ⭐⭐ exactly ONE API call for the whole trial');
        const send = w.sends[0];
        ok(send.id === 'trial1-marking', '6 · …and it is the marking turn');
        const ctx = hiddenCtx(w);
        ok(/@TRIAL_VERDICT\[hook=/.test(ctx), '6 · the marking prompt carries the marker contract');
        ok(/Do NOT give a mark|not by you/.test(ctx), '6 · …and forbids the model inventing the number (§33 ruling 4)');
        ok(/WHAT THE STUDENT DECIDED/.test(ctx), '6 · ⭐⭐ their own seven verdicts are sent WITH the draft — she marks alongside their judgment, never instead of it');
        ELEMENTS.forEach((e) => {
            ok((w.rows.get('cw-trial-1-' + e.id) || '').length > 0, '6 · ' + e.label + ' was banked BEFORE Sophia was asked (PEDAGOGY §19)');
        });
        ok(!w.rows.get('cw-trial-1-mark'), '6 · no mark exists yet — the student judged first');
    }

    // ── 7 · THE MARK IS CODE'S ARITHMETIC ON SOPHIA'S VERDICTS ───────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await answerAll(w, /Yes, it does/);
        // 4 met (8) + 2 partly (2) + 1 not (0) = 10/14 = 71% → the canonical ladder says 7.
        const verdicts = { hook: 'met', setup: 'met', reaction: 'met', epiphany: 'met', proaction: 'partly', climax: 'partly', denouement: 'not' };
        reply(w, 'Here is my read of it. **You are a Grade 9 writer** and this is 40/40.\n\n' + markerBlock(verdicts));
        await settle();
        const expected = LADDER_GRADE(Math.round((10 / 14) * 100));
        const markRow = w.rows.get('cw-trial-1-mark') || '';
        ok(/10\/14/.test(markRow), '7 · the marks are counted by code: met=2 · partly=1 · not=0');
        ok(markRow.indexOf('Grade ' + expected) === 0, '7 · …and banded through the ONE canonical ladder (grade ' + expected + ')');
        ok(!/Grade 9/.test(markRow), '7 · ⭐⭐ the grade the model announced in prose ("Grade 9", "40/40") changes nothing');
        ok(/story coherence/i.test(markRow), '7 · the mark says which dimension it is for');
        ok(w.saved.length === 1 && w.saved[0].grade === expected && w.saved[0].marks === 10,
            '7 · the result is saved to the project with its verdicts, marks and grade', w.saved[0]);
        ok(w.saved[0].self && w.saved[0].sophia, '7 · …carrying BOTH judgments, so the dashboard can show the gap');
    }

    // ── 8 · THE GAP BETWEEN THE TWO JUDGMENTS IS THE TEACHING ────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await answerAll(w, /Yes, it does/);            // the student says everything is met
        const verdicts = {};
        ELEMENTS.forEach((e) => { verdicts[e.id] = 'met'; });
        verdicts.climax = 'not';                        // …Sophia does not agree about the climax
        reply(w, 'My verdicts.\n\n' + markerBlock(verdicts));
        await settle();
        ok(/Climax/.test(lastBubble(w)), '8 · the disagreement is named on screen');
        ok(/you said/i.test(lastBubble(w)) && /I said/i.test(lastBubble(w)), '8 · …as both verdicts, side by side');
        ok(/Climax/.test(w.rows.get('cw-trial-1-gap') || ''), '8 · …and filed in the document for the tutor');
        const agree = world();
        agree.ctl.forceStart();
        await toFirstAsk(agree);
        await answerAll(agree, /Yes, it does/);
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
        await answerAll(w, /Yes, it does/);
        reply(w, 'Lovely work! I have read it all and I think it hangs together.\n\n@TRIAL_VERDICT[hook=met]');
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
        ok(/^Grade 9/.test(w.rows.get('cw-trial-1-mark') || ''), '9 · …and the mark then files (all seven met = 14/14)');
    }

    // ── 10 · A FAILED CALL IS HONEST, AND THEIR WORK IS SAFE ─────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await answerAll(w, /Yes, it does/);
        timeout(w);
        await settle();
        ok(/could not read your draft/i.test(lastBubble(w)), '10 · a failed marking call says so plainly (degraded-mode contract)');
        ok(/saved/i.test(lastBubble(w)), '10 · …and tells them their seven judgements are not lost');
        ok(!!chipNamed(w, /Try again/), '10 · …and offers the retry');
        ok(!w.rows.get('cw-trial-1-mark'), '10 · no mark is invented from a failed call');
    }

    // ── 11 · RESUME LANDS ON THE EXACT ELEMENT (§4c.8b) ──────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await answer(w, /Yes, it does/);               // hook
        await answer(w, /Yes, it does/);               // setup
        await answer(w, /Yes, it does/);               // reaction
        await settle();
        ok(/Epiphany/.test(lastBubble(w)), '11 · the student is on element 4');
        const w2 = reload(w);   // same browser, page reloaded
        const resumed = w2.ctl.tryResume();
        await settle();
        ok(resumed, '11 · the walk resumes');
        ok(/Epiphany/.test(lastBubble(w2)), '11 · ⭐ …on the EXACT element they were on, not the top of the seven');
        ok(!!chipNamed(w2, /Yes, it does/), '11 · …with its chips back, so the page is not dead after a reload');
    }

    // ── 12 · RESUME MID-SENTENCE RE-ASKS FOR THE SENTENCE, NOT THE VERDICT ───────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        w.tap(chipNamed(w, /Not yet/));
        await settle();
        const w2 = reload(w);
        w2.ctl.tryResume();
        await settle();
        ok(/one sentence/i.test(lastBubble(w2)), '12 · a reload while a sentence is owed re-asks for the sentence');
        await w2.say('The opening explains the weather for a paragraph.');
        await settle();
        ok(/weather for a paragraph/.test(w2.rows.get('cw-trial-1-hook') || ''), '12 · …and that sentence still files');
    }

    // ── 13 · IT CAN BE RE-OPENED (Neil's standing requirement, #221) ─────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await answerAll(w, /Yes, it does/);
        reply(w, 'Done.\n\n' + markerBlock({}));
        await settle();
        const again = chipNamed(w, /Change my answers/);
        ok(!!again, '13 · the finished trial offers "Change my answers"');
        w.tap(again);
        await settle();
        ok(/Hook/.test(lastBubble(w)), '13 · …and it starts again at the first element');
        ok(!!chipNamed(w, /Yes, it does/), '13 · …live, with chips');
    }

    console.log('\n' + (fail ? '❌ cw-trial1-sim FAILED' : '✅ cw-trial1-sim passed')
        + '  (' + asserts.pass + ' assertions, ' + asserts.fail + ' failed)');
    process.exit(fail);
}

main().catch((e) => { console.error('❌ cw-trial1-sim threw:', e && e.stack); process.exit(1); });
