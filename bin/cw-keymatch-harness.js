#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-keymatch-harness.js — KEY-SHAPE gate for the CW document field ids (v7.20.322).
 *
 * This is the first half of the ghost-call / key-shape harness Neil approved on 2026-07-27.
 *
 * ⭐ THE BUG CLASS. WML's most frequent recurring defect is a WRITE-KEY that does not match a
 * READ-KEY: a walk files an answer under `cw-step-4-throughlne`, the document has a row called
 * `cw-step-4-throughline`, and the result is "it saved fine but nothing appears" — no error, no
 * console warning, nothing to notice until a human happens to look at an empty box. Root
 * CLAUDE.md §5d calls it the number-one recurring Sophicly bug and prescribes a byte-diff of every
 * producer against every consumer. That diff is what this file does, mechanically, on every ship.
 *
 * WHAT IT ASSERTS
 *   1. Every `cw-step-N-*` field id a walk WRITES has a row that CREATES it — either in a document
 *      template (`outlineRowHTML(..., 'fid')`) or in an on-load heal. A write with no row is a
 *      silent no-op: the value goes nowhere and the student loses the answer.
 *   2. Every id that is READ back (rowText / _cwDocValue / ANCHOR_SRC) likewise resolves to a row.
 *   3. The v7.20.322 throughline specifically: template, heal, write, read and resume must all use
 *      the identical literal, and the id must be reachable from ONE constant rather than retyped.
 *
 * WHAT IT DOES NOT CLAIM. It cannot catch "a decision was never filed anywhere at all" — the
 * throughline's original defect, where the pick lived only in a localStorage sidecar and no field
 * id existed on either side. Nothing static can see an absence of intent. It catches DRIFT between
 * two sides that both exist, which is the failure that actually recurs.
 *
 * Usage: node bin/cw-keymatch-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

console.log('CW DOCUMENT KEYS — write-key ≡ read-key');

// ── every id a document ROW actually creates ──────────────────────────────────────────────────
// Both the baked templates and the on-load heals go through outlineRowHTML(props, 'fid').
const created = new Set();
const ROW_RE = /outlineRowHTML\([\s\S]{0,400}?,\s*'(cw-[a-z0-9-]+)'\s*\)/g;
let m;
while ((m = ROW_RE.exec(JS))) created.add(m[1]);
ok(created.size > 20, `the row scan found the templates (${created.size} cw-* rows created)`);

// ── every id something WRITES or READS by literal ─────────────────────────────────────────────
function literalsFrom(re) {
    const out = new Set();
    let x;
    while ((x = re.exec(JS))) out.add(x[1]);
    return out;
}
const written = literalsFrom(/_writeOutlineRowField\(\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g);
const readBack = new Set([
    ...literalsFrom(/rowText\(\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g),
    ...literalsFrom(/_cwDocValue\(\s*'[a-z_]+'\s*,\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g),
    ...literalsFrom(/(?:story_open|story_close):\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g)
]);

// The field-id tables the walks map over (COMPONENTS / BEATS / CW_STEP4_SPINE …) declare their ids
// as `fid: 'cw-…'`, and every one of those is both written and read through the same table.
const tableFids = literalsFrom(/\bfid:\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g);

[['written by a walk', written], ['read back by a walk', readBack], ['declared in a walk table', tableFids]]
    .forEach(([what, set]) => {
        set.forEach(fid => {
            ok(created.has(fid),
                `${fid} is ${what} but NO document row creates it — the write lands nowhere and the ` +
                `student's answer is silently lost (add it to the step template AND an on-load heal)`);
        });
    });
console.log(`   ${created.size} rows created · ${written.size} written · ${readBack.size} read · ${tableFids.size} in walk tables`);

// ── v7.20.322: the throughline, end to end ────────────────────────────────────────────────────
console.log('CW STEP 4 — the dramatic throughline is durable');
{
    const FID = 'cw-step-4-throughline';
    ok(created.has(FID), 'a document row creates the throughline');
    // TWO producers are required and they are not interchangeable: the baked TEMPLATE serves every
    // NEW project, the HEAL serves every project that already exists. Checking only that "some row
    // creates it" passes when one of the two has drifted — which is precisely the half-fix that
    // ships a feature working for new students and silently missing for the current cohort.
    const producers = (JS.match(new RegExp(`,\\s*'${FID}'\\s*\\)`, 'g')) || []).length;
    ok(producers >= 2, `both the template AND the heal create the throughline row (found ${producers} producer(s))`);
    ok(/tryHealCwStep4Throughline/.test(JS), 'an on-load heal exists for projects created before this row');
    ok(/\.then\(\(\) => tryHealCwStep4Throughline\(\)\)/.test(JS), 'and that heal is actually wired into the load chain');
    ok(new RegExp(`THROUGHLINE_FID = '${FID}'`).test(JS), 'the id has ONE canonical constant');
    ok(/_writeOutlineRowField\(THROUGHLINE_FID, pick\)/.test(JS),
        'the pick is written to the document, not just the localStorage sidecar that finish() clears');
    ok(/if \(rowText\(THROUGHLINE_FID\)\)/.test(JS),
        'the resume asks the DOCUMENT whether the throughline was already chosen');
    // The resume test must come BEFORE the branch that forces phase='throughline', or a finished
    // walk still gets the chips stapled to its wrap-up (Neil's live catch).
    const resumeAt = JS.indexOf('if (rowText(THROUGHLINE_FID))');
    const forceAt = JS.indexOf("phase = 'throughline'; active = true; pending = false;");
    ok(resumeAt > 0 && forceAt > 0 && resumeAt < forceAt,
        'and it is checked BEFORE the branch that would force the throughline phase (order is the fix)');
    ok(/fid: 'cw-step-4-throughline'/.test(JS),
        'the throughline rides CW_STEP4_SPINE, so later steps and the Story Spine panel see it');
}

// ── v7.20.323: EVERY CHIP MENU IS CLASSIFIED — content (filed) or flow-control (ephemeral) ────
//
// Neil, 2026-07-28, on the throughline fix: "how are we going to make sure that the issue we found
// in step four is fixed universally?" This is the answer. The defect was never really "the
// throughline is missing a row" — it was that a student's CHOICE could be neither filed nor
// deliberately discarded, and nothing anywhere noticed. Auditing carefully once does not survive
// the next session; a gate does.
//
// So every chipBar/chipBarMulti call site must be declared below:
//   'content' — the pick IS an answer. It MUST reach a document row, or it dies when finish()
//               clears the sidecar (the throughline, v7.20.322; the unmet need, v7.20.323).
//   'flow'    — the pick steers the walk ("Rewrite Beat 3 →", "Leave it as it is →"). It must
//               NOT be persisted: a stored gate replays forever once its condition clears
//               (the v7.20.284 fossil-gate bug). Ephemeral is the correct answer here.
// A NEW menu belongs to neither until someone says so, and this gate refuses to pass until they
// do — which is exactly the decision that was skipped twice.
console.log('CW CHIP MENUS — every pick is filed or deliberately ephemeral');
{
    const MENUS = {
        // content — must be filed
        onSecondaryNeedsDone:  { kind: 'content', fid: 'NEEDS_FID', note: 'the "any others?" multi-select' },
        onThroughlinePick:     { kind: 'content', fid: 'THROUGHLINE_FID', note: 'the dramatic throughline' },
        onPick:                { kind: 'content', note: 'Step 5 plot archetype → _setOutlineDropdown' },
        onLoglinePick:         { kind: 'content', note: 'Step 3 chosen logline → cw-step-3-chosen (v7.20.325)' },
        // v7.20.337 — Step 1 seed picker. CONTENT: each pick ticks a real cw-step-1-logline-N
        // row via _tickRowLikeAStudent, and _syncCwStep1LikedSeeds derives the `liked_seeds`
        // artifact from those ticks. No fid here because it ticks EXISTING rows rather than
        // writing a new one — the rows are created by the synthesis turn's @FIELD_SETs.
        onSeedsDone:           { kind: 'content', note: 'Step 1 liked seeds → ticks cw-step-1-logline-1/2/3' },
        // flow-control — must NOT be filed
        onCohChoice:    { kind: 'flow', note: 'rewrite / keep the beat the coherence check flagged' },
        onPushOption:   { kind: 'flow', note: 'a CLOSED push question answered by tap — routed through handleTurn, so the slot files it exactly as typed text (v7.20.343)' },
        onWrapRecall:   { kind: 'flow', note: 'Step 4 wrap: open the rewrite picker — the way back into an answered row (v7.20.340)' },
        onRecallPick:   { kind: 'flow', note: 'Step 4 wrap: which beat to rewrite — the REWRITE that follows is what is filed' },
        onPickConfirm:  { kind: 'flow', note: 'Step 5 (#74, v7.20.354): keep the existing plot structure or re-pick. FLOW, not content — the archetype already lives in its document row; this tap only decides whether the walk re-opens the pick. Exists because advance() started at firstEmpty(), so an already-chosen structure meant the ONE decision every later step is built on was walked straight past (Neil, live: "it should just ask again even if it\'s chosen. It should just confirm it.")' },
        onAnchorChoice: { kind: 'flow', note: 'Step 6 story bookend: still right / sharpen' },
        onFrameChoice:  { kind: 'flow', note: 'Step 6 story FRAME (#109, v7.20.371): both still right / change my opening / change my ending. FLOW on the same reasoning as onAnchorChoice — the tap only decides whether the walk carries the Step-4 sentence or re-opens it for a rewrite. What is filed is the SENTENCE (the spine value on keep, the student\'s rewrite otherwise), never the pick.' },
        onStageChoice:  { kind: 'flow', note: 'Step 6 stage arc: sharpen / leave' },
        onFinishChoice: { kind: 'flow', note: 'Step 6 final image: rewrite / leave' },
        onPushChoice:   { kind: 'flow', note: 'Step 5 archetype push: switch / keep' },
        onMultiDone:    { kind: 'flow', note: 'Step 5 alternates considered (multi-select)' },
        onReviewChipPick: { kind: 'flow', note: 'Step 3 review: sharpen component X / move on — steers the walk' },
        // v7.20.334 — the Step-2 batched review's chips. Flow, on the same reasoning as the Step-3
        // twin: the pick chooses WHICH idea to rewrite; the rewritten idea itself is what gets
        // filed (verbatim, to its own row), so nothing is lost when the sidecar is cleared.
        onIdeaReviewPick: { kind: 'flow', note: 'Step 2 review: sharpen idea N / move on — the rewrite that follows is what is filed' },
        // scaffold — the pick SHAPES the next ask, and the written answer that follows is what
        // gets filed. Not lost, because the beat sentence carries it. Beat 1 is the exception and
        // is handled separately (onSecondaryNeedsDone → NEEDS_FID), because there the category IS
        // the answer rather than a lead-in to one.
        onBeatChipPick: { kind: 'scaffold', note: 'Step-4 beat category chips (incident/goal/obstacle/stakes) — the beat text the student then writes is filed' },
        // v7.20.333 — SELF-ASSESSMENT. Deliberately scaffold, and the reasoning is the whole
        // decision: a student's CLAIM about their answer is not the answer. Writing "ticked:
        // emotional shield" into their document row would pollute the artefact they are marked on.
        // The ticks are consumed by the batched review (CW3) / the coherence check (CW4), both of
        // which run BEFORE finish() clears the sidecar — so unlike the throughline there is no
        // moment at which a needed value is destroyed. They survive a reload because the sidecar
        // does. Asserted below: the claim must actually REACH the review, or banking it is theatre.
        onSelfAssessTicks:    { kind: 'scaffold', note: 'the criteria tick list — the claim is fed to the end-of-set review, never to a document row' },
        onSelfAssessFollowUp: { kind: 'flow', note: 'add-a-line / it is fine — steers the walk, must stay ephemeral' },
    };
    // Match CALL sites only. `function chipBar(options, onPick)` is a DEFINITION and its parameter
    // name would otherwise be scanned as though it were a handler — and Step 5's real handler
    // happens to be called onPick too, so the two are indistinguishable without this guard.
    // The handler may be passed bare (`onThroughlinePick`) or as a factory call
    // (`onBeatChipPick(b)`), so the trailing argument list is optional.
    const CALL_RE = /(?<!function\s)\bchipBar(?:Multi)?\(\s*[\s\S]{0,240}?,\s*([A-Za-z_$][\w$]*)\s*(?:\([^()]*\))?\s*\)/g;
    const found = new Set();
    let c;
    while ((c = CALL_RE.exec(JS))) found.add(c[1]);
    found.forEach(fn => {
        ok(Object.prototype.hasOwnProperty.call(MENUS, fn),
            `chip menu "${fn}" is not classified — declare it 'content' (and file the pick to a ` +
            `document row) or 'flow' (steers the walk, must stay ephemeral). An unclassified menu ` +
            `is how the throughline and the unmet need both got lost.`);
    });
    Object.keys(MENUS).forEach(fn => {
        ok(found.has(fn), `declared chip menu "${fn}" no longer exists — remove it from this list`);
    });
    // Content menus that name a fid constant must actually write through it.
    Object.entries(MENUS).forEach(([fn, cfg]) => {
        if (cfg.kind !== 'content' || !cfg.fid) return;
        ok(new RegExp(`_writeOutlineRowField\\(${cfg.fid}`).test(JS),
            `${fn} is content (${cfg.note}) but never writes through ${cfg.fid} — the pick would ` +
            `live only in the sidecar that finish() clears`);
    });
    // Flow-control picks must not be smuggled into the document.
    // QUOTE-ANCHORED and case-SENSITIVE (v7.20.328). Chip LABELS are capitalised and quoted
    // ("Rewrite it", "Leave it as it is", "Sharpen my Flaw"); the v7.20.327 push-cycle KIND is the
    // lowercase literal 'rewrite', and `{ replace: step.cycle === 'rewrite' }` is a legitimate
    // argument, not a pick being filed. The old case-insensitive bare-word match could not tell
    // them apart and failed the gate on a correct change.
    ok(!/_writeOutlineRowField\([^)]*['"`](?:Rewrite|Leave it|Sharpen|Still right)/.test(JS),
        'no flow-control pick is written to the document (a persisted gate replays forever — v7.20.284)');
    console.log(`   ${found.size} chip menus, all classified`);
}

// ── THE DISPATCHER LAYER (v7.20.329) ────────────────────────────────────────────────────────
// The sim harnesses slice a CONTROLLER and drive it, so by construction they cannot see a defect
// that lives in sendCanvasMessage's routing. One did: at .328 the transcript replayed BEFORE
// tryResume ran, the detector attached its `▶ Let's go` chip to the replayed greeting, and the tap
// arrived as an ordinary message that the freshly resumed walk filed into the Protagonist row.
// Gating on walk state was a guess about ORDER; provenance set at the click is not. These assert
// the routing contract at the layer the sims cannot reach.
{
    console.log('CW DISPATCHER — a chip tap is not a student answer');
    // Every generic (detector-built) quick-action sender declares itself. There are TWO — the dual
    // chat pipeline — and marking only one is exactly how these two have drifted before.
    const marks = (JS.match(/markGenericChipSend\(\);/g) || []).length;
    ok(marks === 2,
        `expected 2 generic quick-action senders to call markGenericChipSend(), found ${marks} ` +
        `— an unmarked sender routes a chip tap in as a student answer (dual chat pipeline)`);
    ok(/const _genericChip = consumeGenericChipSend\(\);/.test(JS),
        'the dispatcher never consumes the generic-chip flag');
    ok(/const _inboundIsAnswer = !canvasSilentSend && !_genericChip;/.test(JS),
        'a chip tap or a silent send can still be treated as a student answer');
    ok(/if \(_genericChip && _cwWalkActive\(\)\)[\s\S]{0,900}?return;/.test(JS),
        'a stale chip tap during a code-owned walk is not swallowed — it would be forwarded to the '
        + 'model, spending a call to answer a question nobody asked');
    // v7.20.330 — LIVENESS (WML CLAUDE.md 4d). Swallowing alone is only half the change: on .329
    // it left the student on a greeting with help chips and no question, mid-lesson. The swallow
    // MUST re-serve the ask, and both walks must expose the nudge that does it.
    ok(/if \(_genericChip && _cwWalkActive\(\)\)[\s\S]{0,400}?_cwNudgeActiveWalk\(\)/.test(JS),
        'the swallow does not re-serve the current ask — a refused input with nothing in its place '
        + 'is a DEAD END (Neil, staging .329)');
    ok((JS.match(/handleTurn, onReply, reset, tryResume, nudge,/g) || []).length >= 2,
        'fewer than two walks expose nudge() — a walk that cannot re-serve its ask can strand a student');
    // All six CW arms gate on it. The quiz arms deliberately do NOT: an MSQ/FQ answer chip IS the
    // student's answer, so the flag must not reach them.
    const armed = (JS.match(/state\.task === 'cw_step_\d' && _cw\w+Ctl\.active && _inboundIsAnswer/g) || []).length;
    ok(armed === 6, `expected all 6 CW walk arms to require _inboundIsAnswer, found ${armed}`);
    ok(/if \(_inboundIsAnswer && _cwWalkActive\(\)\) \{[\s\S]{0,160}?chatTextarea\.value = '';/.test(JS),
        'a walk turn does not clear the chat input — the six arms return before the shared clear, so '
        + 'the text stays in the box and the next dictation appends to it (v7.20.329)');
    ok(!/_quizCtl\.active && _inboundIsAnswer/.test(JS),
        'a quiz arm requires _inboundIsAnswer — that would swallow MSQ/FQ answer chips, which ARE answers');
}

// ── BUBBLE CONTROLS (v7.20.331) ─────────────────────────────────────────────────────────────
// ROOT gate, at Neil's instruction: "find the root of this issue and solve it at the root so it
// never occurs anywhere ever again."
//
// Sixteen places hand-rolled "attach controls to a chat bubble", each re-deciding its own guard
// and class — so three semantically different bars (help · Continue-nav · choice chips) all
// guarded on the shared `.swml-quick-actions` and whichever attached first silently blocked the
// rest. A bar now declares its KIND; different kinds coexist, the same kind is idempotent.
//
// This gate BASELINES the legacy sites that have not been migrated: it fails on any NEW raw
// guard, so the count can only go down. (Same shape as the sophicly-plugins baseline the CI
// handoff describes — never suppress, subtract a known baseline.)
{
    console.log('CW BUBBLE CONTROLS — one owner, kinds cannot collide');
    ok(/const BUBBLE_CONTROL_KINDS = \{ help: '[^']+', nav: '[^']+', choice: '[^']+' \};/.test(JS),
        'BUBBLE_CONTROL_KINDS is gone — there is no single owner of bubble controls again');
    ok(/function attachBubbleControls\(bc, kind, buttons, opts\)/.test(JS),
        'the attachBubbleControls primitive is gone');

    // Every CW bar declares a kind.
    ['nav', 'help', 'choice'].forEach((k) => {
        const n = (JS.match(new RegExp("BUBBLE_CONTROL_KINDS\\." + k, 'g')) || []).length;
        ok(n >= 2, `no bar declares kind '${k}' any more (found ${n} references) — a bar without a ` +
            `kind falls back to the shared guard and can suppress another bar silently`);
    });

    // The legacy, not-yet-migrated sites. BASELINE — this number may only DECREASE.
    const RAW_GUARD_BASELINE = 3;   // v7.20.334: CW2's ladder bar migrated to a kind
    const raw = (JS.match(/if \(!bc \|\| bc\.querySelector\('\.swml-quick-actions'\)\) return;/g) || []).length;
    ok(raw <= RAW_GUARD_BASELINE,
        `${raw} control bars still guard on the shared '.swml-quick-actions' (baseline ` +
        `${RAW_GUARD_BASELINE}). A NEW one has been added: give it a kind via BUBBLE_CONTROL_KINDS, ` +
        `or it will silently suppress whichever bar reaches the bubble second`);
    if (raw < RAW_GUARD_BASELINE) {
        console.log(`   note: raw guards down to ${raw} (baseline ${RAW_GUARD_BASELINE}) — lower the baseline`);
    }
}

// ── MARKERS NEVER REACH THE STUDENT (v7.20.332) ─────────────────────────────────────────────
// Neil, staging .331: "@WEAK: goal, stakes" rendered in the chat in front of students. The
// stripper in wml-core.js was a hand-maintained ENUMERATION, and @WEAK/@ALL_OK (v7.20.325) were
// never added to it. Two more lines would have left the NEXT marker free to leak, so the sweep
// now strips by SHAPE — any @UPPER_SNAKE alone on its own line, which is exactly the form the
// protocol law mandates ("put the marker on its own line as the FINAL line").
{
    console.log('CW MARKERS — a machine signal can never render to a student');
    const core = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
    const SWEEP = /text = text\.replace\(\/\^\[ \\t\]\*@\[A-Z\]\[A-Z0-9_\]\{2,\}/;
    ok(SWEEP.test(core),
        'the generic marker sweep is gone from formatAI — every new marker would have to be '
        + 'remembered by hand again, which is how @WEAK reached a live lesson');

    // Functional: the shape must strip what the walks emit, and leave prose alone.
    const sweep = (t) => t.replace(/^[ \t]*@[A-Z][A-Z0-9_]{2,}(?:[ \t]*:[^\n]*)?[ \t]*$/gm, '')
        .replace(/\n{3,}/g, '\n\n').trim();
    [['@WEAK: goal, stakes', 'the Step-3 component review'],
     ['@ALL_OK', 'the Step-3 all-clear'],
     ['@WEAK: logline-2, logline-3', 'the Step-3 logline review'],
     ['@ANSWER_OPTIONS: She succeeds | She commits to trying', 'the v7.20.343 closed-question options'],
     ['@A_MARKER_ADDED_TOMORROW: x', 'a marker nobody has written yet']].forEach(([m, what]) => {
        ok(sweep('Some real feedback for the student.\n\n' + m).indexOf('@') === -1,
            `${what} (${m}) still renders to the student`);
    });
    // ...and ordinary prose containing an @ is untouched.
    const prose = 'Email me @ the address, or ask @JOHN_SMITH about it.';
    ok(sweep(prose) === prose, 'the sweep ate ordinary prose containing an @ — it must only strip a whole line');
}

// ── SELF-ASSESSMENT (v7.20.333) ─────────────────────────────────────────────────────────────
// Neil, after deliberately entering the same text for his Goal and his Stakes: "maybe the students
// could self-assess… they tick off the criteria that they've answered to the best of their
// ability." Two things can rot silently here and both are mechanical to catch:
//   1. an ask gains no `criteria`, so its tick list never appears and nobody notices;
//   2. a criterion drifts away from the ask's own wording, so the student is asked to tick
//      something the teaching never said. That is the whole reason criteria are LIFTED verbatim
//      rather than re-authored beside the prose.
{
    console.log('CW SELF-ASSESSMENT — every ask has criteria, and every criterion is in its ask');
    // Each `{ fid: 'cw-step-N-…', … }` walk-table entry, sliced by BRACE MATCHING so a step's
    // criteria are checked against ITS OWN ask and not a neighbour's. A line-shape regex was tried
    // first and matched 2 of 16 — the entries close at the end of the ask string, not on their own
    // line, and a gate that silently scans almost nothing is worse than no gate at all.
    function objectAt(s, i) {
        let d = 0;
        for (let k = i; k < s.length; k++) {
            const c = s[k];
            if (c === '{') d++;
            else if (c === '}') { d--; if (d === 0) return s.slice(i, k + 1); }
            else if (c === "'" || c === '"' || c === '`') {
                const q = c; k++;
                while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
            }
        }
        return '';
    }
    const HEAD_RE = /\{ fid: '(cw-step-[34]-[a-z0-9-]+)'/g;
    const stripped = (s) => String(s).replace(/\*\*/g, '');
    let entries = 0, withCriteria = 0;
    let e;
    while ((e = HEAD_RE.exec(JS))) {
        const fid = e[1], block = objectAt(JS, e.index);
        // Only asks — the Chosen Logline row and friends are not asks and carry no criteria.
        if (!/\bask:/.test(block)) continue;
        entries++;
        const cm = /criteria:\s*\[([\s\S]*?)\]/.exec(block);
        if (!ok(!!cm, `${fid} is an ask with NO criteria[] — its student never gets a tick list, and ` +
            `nothing else would ever tell you (add the array, lifted from its own bullets)`)) continue;
        withCriteria++;
        const list = cm[1].split('\n').map((l) => {
            const q = /'((?:[^'\\]|\\.)*)'/.exec(l);
            return q ? q[1].replace(/\\'/g, "'") : '';
        }).filter(Boolean);
        ok(list.length >= 2, `${fid} has only ${list.length} criterion — a tick list of one is not a check`);
        const askBody = stripped(block.slice(block.indexOf('ask:')));
        list.forEach((c) => {
            ok(askBody.indexOf(stripped(c)) !== -1,
                `${fid}: the tick list offers "${c}" but its ask never says that — the student is being ` +
                `asked to tick a criterion the teaching did not give them (lift it verbatim, or fix the ask)`);
        });
    }
    ok(entries >= 16, `expected the 10 Step-3 asks + 6 Step-4 beats to be scanned, found ${entries}`);
    ok(withCriteria === entries, `${entries - withCriteria} ask(s) carry no criteria`);

    // The claim must actually reach the review, or banking it is theatre (the scaffold
    // classification above is only honest if this holds).
    ok(/saTicks\[st\.fid\]/.test(JS),
        'the Step-3 review no longer reads the student\'s self-assessment — the tick list stops being '
        + 'something they are accountable for and becomes clicking');
    ok(/saTicks\[b\.fid\]/.test(JS),
        'the Step-4 coherence check no longer reads the student\'s self-assessment');
    // Both walks bank the ticks in the sidecar, which is what makes a reload keep them.
    ok((JS.match(/sat: saTicks/g) || []).length === 2,
        'a walk does not persist its self-assessment — a reload would silently drop the claim');

    // LIVENESS (WML CLAUDE.md 4d): the duplicate guard REFUSES an answer, so it must say what the
    // student sees instead. Both walks re-arm the slot and re-serve the ask in the same function.
    console.log('CW DUPLICATE GUARD — a refusal re-serves the ask');
    const dupCalls = (JS.match(/cwDuplicateOf\(clean,/g) || []).length;
    ok(dupCalls === 2, `expected both walks to run the duplicate guard, found ${dupCalls}`);
    ['cw3', 'cw4'].forEach((walk) => {
        const at = JS.indexOf('function refuseDuplicate(', JS.indexOf(walk === 'cw3'
            ? 'const _cwLoglineCtl = (function () {' : 'const _cwSpineCtl = (function () {'));
        const body = JS.slice(at, at + 1400);
        ok(/_walkSlot\.arm\('/.test(body) && /aiBubble\(/.test(body),
            `${walk}: a refused duplicate does not re-arm the slot AND say something — a refusal with `
            + `nothing in its place is a DEAD END (law 4d)`);
        ok(/\.ask\)/.test(body),
            `${walk}: the refusal does not re-serve the ASK, so the student is told "no" with no `
            + `question on screen (staging .329: help chips and no question)`);
    });
    // Behavioural: tight enough not to refuse honest work, sharp enough to catch Neil's own test.
    const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const dupOf = (text, others) => {
        const a = norm(text); const aw = a ? a.split(' ') : [];
        if (aw.length < 3) return null;
        const A = new Set(aw);
        for (const o of others) {
            const b = norm(o.text); if (!b || !o.label) continue;
            if (b === a) return o.label;
            const bw = b.split(' '); if (aw.length < 5 || bw.length < 5) continue;
            const B = new Set(bw); let inter = 0;
            B.forEach((w) => { if (A.has(w)) inter++; });
            const uni = A.size + B.size - inter;
            if (uni > 0 && inter / uni >= 0.9) return o.label;
        }
        return null;
    };
    const GOAL = { label: 'Goal', text: 'She wants to win the county final for her late father.' };
    ok(dupOf('She wants to win the county final for her late father.', [GOAL]) === 'Goal',
        'the duplicate guard does not catch a word-for-word repeat — Neil\'s own Goal/Stakes test');
    ok(dupOf('she wants to win the county final for her late father', [GOAL]) === 'Goal',
        'the guard is defeated by punctuation and case');
    // NEGATIVE CONTROLS — a false refusal tells a student who did the work that they didn\'t, which
    // costs far more than a missed duplicate. These must all pass through.
    [['If she fails, her little sister goes into the arena alone.', 'related but different content'],
     ['She loses the final and never plays again.', 'same subject, different sentence'],
     ['Win.', 'too short to judge']].forEach(([t, what]) => {
        ok(dupOf(t, [GOAL]) === null, `the guard falsely refused a legitimate answer (${what}): "${t}"`);
    });
}

// ── THE DONE-SURFACE RULE (v7.20.335) ───────────────────────────────────────────────────────
// Neil: "that's happened multiple times on different surfaces in the WML… we gotta just find a
// fix for that, just like a universal fix, because it's quite ugly."
//
// The defect: a LOW-ALPHA GREEN WASH as the FILL of a large surface, over the dark purple canvas,
// composites to a muddy BROWN. Eight rules made it independently. Fixing eight rules fixes today;
// this is what stops the ninth — because the ninth is written by someone who has never seen this
// conversation, reaching for the obvious "tint it green to say it's done".
//
// LIGHT THEME IS EXEMPT ON PURPOSE: the same tint over white reads as pale mint and is correct.
{
    console.log('WML SURFACES — "done" is elevation + a green edge, never a green wash');
    const css = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
    ok(/--swml-surface-done:/.test(css) && /--swml-edge-done:/.test(css),
        'the done-surface tokens are gone — every completed surface will drift back to hand-rolled '
        + 'green tints, which is exactly how this became eight separate bugs');

    // ── WHY THIS SCANNER IS SHAPED THIS WAY (v7.20.336) ────────────────────────────────────
    // The first version of this gate matched ONE literal: `background: rgba(28, 217, 145, 0.NN)`
    // in wml-canvas.css, alpha <= 0.15. It covered 2 of the 83 green fills in the codebase and
    // reported success — and it MISSED THE RULE NEIL PHOTOGRAPHED, because that rule is a
    // GRADIENT: `.swml-cw-step-card.complete` fills with
    // `linear-gradient(135deg, rgba(28,217,145,0.15), rgba(44,0,62,0.3))` — low-alpha green at
    // one end, purple at the other. That is literally his report: "step one is green, step two
    // is purple, and both have that terrible brown wash." A single-notation regex could never
    // see it. So: scan BOTH stylesheets, ALL notations (rgb/rgba/#hex/#hex-alpha), and read
    // INSIDE gradients.
    //
    // THE TEST IS OPACITY, NOT SIZE. The old allow-list exempted anything whose selector said
    // chip/pill/badge — but a 0.16-alpha chip browns over dark purple exactly like a 0.15-alpha
    // card does, and the thing Neil pointed at is the tickable CHECKBOX FACE, a 14px control.
    // Green only reads as green on the dark canvas when it is opaque enough that the purple
    // does not composite through it. That is one mechanical rule with no judgment call in it.
    const OPAQUE_ENOUGH = 0.6;   // below this, dark purple composites through and it reads brown
    const FILES = ['wml-canvas.css', 'wml-styles.css'];

    const isGreen = (r, g, b) => g > 110 && g > r + 40 && g > b + 25;
    const hexRGBA = (h) => {
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16),
            h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
    };

    const OFFENDERS = [];
    let scanned = 0;
    FILES.forEach((file) => {
        const lines = fs.readFileSync(path.join(ROOT, 'frontend', file), 'utf8').split('\n');
        lines.forEach((line, i) => {
            if (!/background/.test(line)) return;
            // Read ONLY the background declaration's value. A line can carry a green box-shadow
            // next to an opaque background (.swml-pill.is-active.swml-tier-6 does exactly that),
            // and scanning the whole line reports the glow as if it were the fill.
            const decls = [];
            const declRe = /background(?:-color|-image)?\s*:\s*([^;}]*)/g;
            let d;
            while ((d = declRe.exec(line))) decls.push(d[1]);
            if (!decls.length) return;
            const value = decls.join(' ');
            // A SHIMMER overlay (the `background-size: 300%` brand sheen) sits at opacity:0 until
            // hover, animates, and is multi-hue — it never composites as a flat green wash.
            // Matched on its own mechanical signature so the exemption can't quietly widen.
            if (/background-size:\s*300%/.test(lines.slice(i, i + 3).join(' '))) return;
            // Collect every colour in the value — including the stops inside a gradient.
            const found = [];
            let m;
            const rgbRe = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g;
            while ((m = rgbRe.exec(value))) {
                if (isGreen(+m[1], +m[2], +m[3])) found.push({ form: m[0], alpha: m[4] === undefined ? 1 : parseFloat(m[4]) });
            }
            const hexRe = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
            while ((m = hexRe.exec(value))) {
                const [r, g, b, a] = hexRGBA(m[1]);
                if (isGreen(r, g, b)) found.push({ form: m[0], alpha: a });
            }
            if (!found.length) return;
            scanned++;
            // alpha 0 is a fade-to-nothing stop (a connector line tapering out). Nothing
            // composites at zero alpha, so it cannot read brown.
            const washes = found.filter((c) => c.alpha < OPAQUE_ENOUGH && c.alpha > 0);
            if (!washes.length) return;                    // saturated green — green IS the object
            let sel = '';
            for (let k = i; k >= 0 && k > i - 15; k--) {
                if (/^\s*[.\[#:@]/.test(lines[k]) && lines[k].indexOf('{') !== -1) {
                    sel = lines[k].trim().replace(/\{.*$/, '').trim();
                    break;
                }
            }
            if (/data-swml-theme="light"|swml-canvas-light/.test(sel)) return;   // correct on white
            // A shimmer overlay sits at opacity:0 until hover and is a multi-hue BRAND gradient,
            // not a "done" signal — it never composites as a flat green wash. Named explicitly so
            // the exemption is a decision on the record, not a silent hole.
            if (/swml-shimmer/.test(lines.slice(i, i + 4).join(' '))) return;
            if (/\bmark\[data-color/.test(sel)) return;     // a text highlight, deliberately translucent
            OFFENDERS.push(`${file}:${i + 1}  a=${washes[0].alpha}  ${sel}\n           ${washes[0].form}`);
        });
    });

    // A scanner that silently matches almost nothing is worse than no scanner (the lesson that
    // cost this gate its credibility the first time). Assert it actually saw the corpus.
    ok(scanned >= 60,
        `the SURFACES scanner only looked at ${scanned} green background declarations — it used to `
        + 'see 83. Something changed the notation or the file list and the gate has gone blind; '
        + 'fix the scanner before trusting a pass.');

    ok(OFFENDERS.length === 0,
        'a green wash is being used as a SURFACE fill on the dark canvas — under 0.6 alpha the '
        + 'purple composites through and it reads BROWN, which is the defect Neil reported. Either '
        + 'use var(--swml-surface-done) + var(--swml-edge-done) (elevation and a green edge), or, '
        + 'if green IS the object here, make it opaque so nothing shows through:\n      '
        + OFFENDERS.join('\n      '));

    // ...and the green SIGNAL must not have been thrown out with the wash. Green still says "done".
    ok(/border-left-color: #1CD991/.test(css),
        'the green completion border is gone — "done" now has no colour signal at all, which is the '
        + 'opposite overcorrection');
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// FILL SCROLL — every way the chat changes the document must SHOW it happening (v7.20.336)
// ───────────────────────────────────────────────────────────────────────────────────────────
// Neil, 2026-07-29: "check that the mechanism works correctly for all those sections… I don't
// wanna have to test it, then find out it's not working, then come back to you."
//
// The failure this locks is silent by construction: a new primitive that changes the document
// (a tick, a dropdown, a fill) but never scrolls. Nothing errors, the data is correct, and the
// only symptom is a student who cannot see that anything happened. It had already happened
// THREE times — `_tickOutlineRow`, `_setOutlineDropdown` and the new tick-in-chat primitive all
// wrote to the document without moving it.
//
// `_tickOutlineRow` is the deliberate exception: it is always paired with the text write that
// created the row, and that write already scrolls — adding a second would double-scroll.
{
    console.log('CW FILL SCROLL — a change the student cannot see is a change that did not happen');
    const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
    const MUST_SCROLL = ['_writeOutlineRowField', '_setOutlineDropdown', '_tickRowLikeAStudent'];
    MUST_SCROLL.forEach((fn) => {
        const at = src.indexOf('function ' + fn + '(');
        ok(at !== -1, `${fn} is gone — the fill-scroll gate is checking a function that no longer exists`);
        if (at === -1) return;
        // Body = from the signature to the start of the next top-level function declaration.
        const next = src.indexOf('\n    function ', at + 10);
        const body = src.slice(at, next === -1 ? at + 6000 : next);
        ok(body.indexOf('_scrollToFilledField') !== -1,
            `${fn} changes the document but never calls _scrollToFilledField — the write lands and the `
            + 'document does not move, so the student has no evidence it happened. This is the exact '
            + 'complaint Neil raised, and it is invisible in every test that only inspects rows.');
    });
    // ...and the helper must not fail silently when it cannot find the field.
    const sIdx = src.indexOf('function _scrollToFilledField(');
    ok(sIdx !== -1, '_scrollToFilledField is gone');
    if (sIdx !== -1) {
        const sBody = src.slice(sIdx, sIdx + 3000);
        ok(/console\.warn\([^)]*FillScroll/.test(sBody),
            '_scrollToFilledField can return without scrolling and without warning. A stale editor '
            + 'host makes the lookup miss, and a silent return means nobody can tell the difference '
            + 'between "scrolled" and "did nothing" (§10 fail loud).');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// GUIDE DEEP-LINKS — every 📖 Guidance link lands on the exact section (v7.20.340)
// ───────────────────────────────────────────────────────────────────────────────────────────
// Neil, live on Step 4: "when it opens up the creative writing reference guide, I think it
// should go to that exact beat because I'm having to scroll to it every single time… and in
// general, when we're providing those links, especially to the reference guide, it should go to
// that exact thing in the document."
//
// showGuidePanel() matches a heading by case-insensitive SUBSTRING, so a typo, a renamed heading,
// or an em-dash swapped for a hyphen does not error — it silently dumps the student at the TOP of
// the guide, which is exactly the scrolling Neil is complaining about. Only a gate catches that.
{
    console.log('CW GUIDE DEEP-LINKS — every anchor lands on a real heading');
    const guidePath = path.join(ROOT, 'resources', 'creative-writing-reference-guide.md');
    if (!fs.existsSync(guidePath)) {
        ok(false, 'resources/creative-writing-reference-guide.md is missing — no 📖 Guidance link can be verified');
    } else {
        const headings = fs.readFileSync(guidePath, 'utf8').split('\n')
            .filter((l) => /^#{1,4}\s/.test(l))
            .map((l) => l.replace(/^#+\s*/, '').replace(/[*_`]/g, '').toLowerCase());
        // Literal anchors passed straight to showGuidePanel(...), plus every `guide:` /
        // `anchor:` string a walk's step table carries.
        const anchors = new Set();
        let m;
        const callRe = /showGuidePanel\(\s*'([^']+)'/g;
        while ((m = callRe.exec(JS))) anchors.add(m[1]);
        const tableRe = /(?:guide|anchor):\s*'([^']+)'/g;
        while ((m = tableRe.exec(JS))) anchors.add(m[1]);
        // CW4 builds its anchors at CLICK time, so they never appear as a showGuidePanel literal.
        // Parse them out of guideAnchor()'s OWN body — hardcoding the expected list here would
        // make this gate check itself rather than the code, and a renamed heading would sail past.
        const gaIdx = JS.indexOf('function guideAnchor()');
        ok(gaIdx >= 0, 'guideAnchor() is gone — CW4’s per-beat deep-links cannot be verified');
        if (gaIdx >= 0) {
            const gaBody = JS.slice(gaIdx, JS.indexOf('\n            }', gaIdx));
            let r;
            const retRe = /return\s+((?:'[^']*'|\s*\+\s*|\([^)]*\))+)\s*;/g;
            let found = 0;
            while ((r = retRe.exec(gaBody))) {
                found++;
                const parts = (r[1].match(/'([^']*)'/g) || []).map((s) => s.slice(1, -1));
                const joined = parts.join('').trim();
                if (!joined) continue;
                // `'Beat ' + (n + 1) + ' —'` → the six real beat headings.
                if (/^Beat\s*—?$|^Beat\s/.test(joined) && r[1].indexOf('+') !== -1) {
                    for (let n = 1; n <= 6; n++) anchors.add('Beat ' + n + ' ' + parts[parts.length - 1].trim());
                } else {
                    anchors.add(joined);
                }
            }
            ok(found >= 4, 'guideAnchor() returned only ' + found + ' anchor(s) — the parse is not seeing its branches');
        }
        ok(anchors.size >= 10, 'only ' + anchors.size + ' guide anchors found — the scan is not seeing the walks');
        const dead = [...anchors].filter((a) => !headings.some((h) => h.indexOf(a.toLowerCase()) !== -1));
        ok(dead.length === 0,
            'guide anchor(s) match NO heading — the Guidance rung silently dumps the student at the top of the '
            + 'guide, which is the scrolling this rule exists to stop:\n     ' + dead.join('\n     '));
        // Beats 4 and 5 share a lead ("And because of this"), so an anchor on the LEAD is ambiguous
        // by construction — it would always land the student on Beat 4.
        ok(!/showGuidePanel\(\s*'(At first|And then|Until|And because of this|Until finally)'/.test(JS),
            'a guide anchor uses a beat LEAD — Beats 4 and 5 share one, so it can only ever land on Beat 4. Anchor on the beat NUMBER.');
        if (!dead.length) console.log('   ' + anchors.size + ' guide anchors, all resolve to a real heading');
    }
}

// ───────────────────────────────────────────────────────────────────────────────────────────
// CW PROGRESS BAR — the first ask is never 0% (v7.20.346)
// ───────────────────────────────────────────────────────────────────────────────────────────
// Neil, on .344: "I don't see any progress." The token WAS emitted and nothing stripped it —
// the arithmetic was the bug. Every call site passed a 0-based index, so the first of nine asks
// rendered 0%: an empty grey track with a "0%" label, which to a student is no bar at all.
//
// Two things are gated, because either alone is weak. The helper must clamp (a 0 can never
// render 0%), AND no call site may pass a bare 0-based index — a new walk written from the
// nearest example is exactly how this comes back.
{
    console.log('CW PROGRESS BAR — the ask in hand is 1-based, and 0% is unreachable');

    const defAt = JS.indexOf('function cwProgressBar(');
    ok(defAt !== -1, 'cwProgressBar is gone — the code-served walks have no bar and nothing would say so');
    if (defAt !== -1) {
        const def = JS.slice(defAt, JS.indexOf('\n    }', defAt));
        ok(/Math\.max\(1,/.test(def),
            'cwProgressBar no longer clamps to 1 — a caller passing 0 renders a 0% bar, which is '
            + 'indistinguishable from no bar (the .344 symptom Neil reported)');
    }

    // Every call site's FIRST argument must be 1-based: `x + 1`, a literal >= 1, or the TOTAL
    // itself — `cwProgressBar(STEPS.length, STEPS.length)` is the last ask, which reads 100%.
    const callRe = /cwProgressBar\(([^,]+),\s*([^)]+)\)/g;
    let m, sites = 0;
    while ((m = callRe.exec(JS))) {
        const arg = m[1].trim(), total = m[2].trim();
        if (arg === 'nth') continue;                          // the definition itself
        sites++;
        const oneBased = /\+\s*1\s*$/.test(arg)
            || (/^\d+$/.test(arg) && Number(arg) >= 1)
            || arg === total                                  // the final ask = 100%
            // v7.20.356: CW1 passes `q.seq`, which is stamped `seq: QS.length + 1` as the array is
            // built — 1-based by construction and always equal to `idx + 1`. Exempted BY NAME with
            // the reason, not by loosening the pattern, and the stamp itself is asserted below.
            || arg === 'q.seq';
        ok(oneBased,
            'cwProgressBar is called with `' + arg + '` — that is a 0-based index, so the first ask '
            + 'of that walk renders 0%. Pass the ask IN HAND (index + 1).');
    }
    ok(sites >= 7, 'only ' + sites + ' progress-bar call site(s) found — a walk has lost its bar');

    // ⭐ THE BAR MUST SURVIVE THE CANVAS CHAT PIPELINE (v7.20.348).
    // .346 fixed the arithmetic and Neil STILL saw no bar, because `WML.withProgressChip()`
    // deletes `<div class="swml-chat-progress-bar">` wholesale — it was written to replace the
    // MODEL's improvised bars with one beat-chip (v7.19.906/.987), and every CW walk runs
    // through the canvas chat, which calls it. FQ/MSQ kept their bars only because the MAIN
    // chat never does. Run the real function over both bars and prove which one survives.
    const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');

    // ⭐ v7.20.356 — ONE PROGRESS COMPONENT, AND THE CRUDE BAR IS UNREACHABLE.
    // Neil: "I want it like that UNIVERSALLY. It's not just creative writing." The chip existed
    // from .349 but `section` was optional, so 12 of 14 call sites fell through to the crude
    // 10px bar. The fallback is now DELETED, so this asserts the SHAPE of the emitter rather
    // than the presence of a class: there must be no argument list that yields the old widget.
    const cwpAt = JS.indexOf('function cwProgressBar(');
    ok(cwpAt !== -1, 'cwProgressBar is gone — the code-served walks have no progress at all');
    const cwpBody = JS.slice(cwpAt, JS.indexOf('\n    }', cwpAt));
    ok(cwpBody.indexOf('[SWML_BEAT:') !== -1,
        'cwProgressBar no longer emits the BEAT token — the walks lose the component the quizzes use');
    ok(!/return\s*'\[SWML_PROGRESS_CODE_/.test(cwpBody),
        'cwProgressBar has a fallback branch emitting the CRUDE bar again. That branch is exactly '
        + 'how 12 of 14 call sites silently rendered a 10px "50%" widget: passing a section was '
        + 'OPTIONAL, so the ugly bar was the default you got by NOT thinking. There must be no '
        + 'argument list that can produce it.');

    // The stamp behind the `q.seq` exemption above — asserted, not assumed.
    ok(/seq:\s*QS\.length\s*\+\s*1/.test(JS),
        'CW1 no longer stamps `seq: QS.length + 1`, so `q.seq` may not be 1-based any more and the '
        + 'exemption in the loop above has gone stale — the first ask could render 0% again.');
    const wpcAt = CORE.indexOf('function withProgressChip');
    ok(wpcAt !== -1, 'withProgressChip is gone — the bar-stripping contract cannot be verified');
    if (wpcAt !== -1) {
        const end = CORE.indexOf('\n    }', wpcAt);
        // eslint-disable-next-line no-new-func
        const wpc = new Function('return (' + CORE.slice(wpcAt, end + 6) + ');')();
        const bar = (cls) => '<div class="' + cls + '"><div class="swml-chat-progress-fill" style="width:44%"></div><span class="swml-chat-progress-label">44%</span></div>';
        ok(wpc(bar('swml-chat-progress-bar'), '').indexOf('swml-chat-progress') === -1,
            'withProgressChip no longer strips the MODEL\'s improvised bar — the beat-chip and a raw bar will both render');
        // v7.20.349: the BEAT CHIP is the FQ/MSQ gold standard Neil asked to match exactly —
        // top-liner + gradient track + bold heading underneath. It must survive the same pipeline.
        const chipAt = CORE.indexOf('function progressChipHTML');
        ok(chipAt !== -1, 'progressChipHTML is gone — the CW walks have no chip to reuse');
        if (chipAt !== -1) {
            const cEnd = CORE.indexOf('\n    }', chipAt);
            // eslint-disable-next-line no-new-func
            const chip = new Function('return (' + CORE.slice(chipAt, cEnd + 6) + ');')();
            const html = chip({ section: 'Choose Your Plot Structure', unit: 'Step', step: 4, total: 9 });
            ok(/swml-beat-section/.test(html) && /swml-beat-step/.test(html) && /swml-beat-fill/.test(html),
                'the beat chip lost its top-liner or its track — that IS the style Neil asked to match');
            ok(wpc(html, '').indexOf('swml-beat') !== -1,
                'withProgressChip strips the BEAT CHIP — the CW walks would lose the very component '
                + 'the quizzes use, which is the whole point of reusing it');
        }
        // ⭐ v7.20.356 — THE MODEL'S BAR IS NOW THE SAME CHIP, SO THE STRIP MUST FOLLOW IT.
        // 72 protocol modules emit "[Progress bar: ███ 50%]". In the MAIN chat that used to render
        // the crude widget (the inconsistency Neil could not see from the assessment screens he was
        // comparing against). It is now the chip — but in the CANVAS chat parseProgressBeat adds
        // the AUTHORITATIVE chip, so if the model's copy also survived the student would get TWO
        // chips on one bubble. `swml-beat--model` is what keeps them separable.
        if (chipAt !== -1) {
            const cEnd2 = CORE.indexOf('\n    }', chipAt);
            // eslint-disable-next-line no-new-func
            const chip2 = new Function('return (' + CORE.slice(chipAt, cEnd2 + 6) + ');')();

            // ⚠ THIS ASSERTION EXISTS BECAUSE THE FIRST CUT OF THIS GATE WAS VACUOUS, and it was
            // caught by injecting the real defect. The strip test below builds the model chip by
            // applying the marker class ITSELF — so deleting the marker from formatAI left the
            // test passing perfectly while the product shipped two stacked chips. A gate that
            // constructs its own input is testing the test. Read the marker out of formatAI's
            // ACTUAL rule first; only then is the behavioural test below about the product.
            const modelRuleAt = CORE.indexOf('SWML_PROGRESS_(\\d+)');
            ok(modelRuleAt !== -1, 'formatAI has no rule for the model progress token — 72 protocol modules render a literal placeholder');
            const modelRule = CORE.slice(modelRuleAt, CORE.indexOf('\n        );', modelRuleAt));
            ok(modelRule.indexOf('progressChipHTML') !== -1,
                'formatAI renders the MODEL bar as something other than the shared chip — that is the '
                + 'crude 10px widget returning, and it is what Neil asked to remove UNIVERSALLY.');
            ok(modelRule.indexOf('swml-beat--model') !== -1,
                'formatAI renders the MODEL chip WITHOUT the `swml-beat--model` marker, so '
                + 'withProgressChip cannot tell it from a code-served one. In the canvas chat the '
                + 'student then gets TWO progress chips stacked on the same bubble.');

            const modelChip = chip2({ pct: 44 }).replace('class="swml-beat"', 'class="swml-beat swml-beat--model"');
            const stripped = wpc(modelChip, '');
            ok(stripped.indexOf('swml-beat') === -1,
                'withProgressChip does not strip the MODEL chip (`swml-beat--model`). In the canvas '
                + 'chat parseProgressBeat adds its own chip, so the student sees TWO progress chips '
                + 'stacked on one bubble.');
            // …and it must not leave the inner divs behind. A lazy `[\\s\\S]*?</div>` stops at the
            // FIRST closing tag, deleting the header and orphaning two closers — which renders as a
            // broken box rather than a missing one, so it would not read as "the strip failed".
            ok(!/<\/div>/.test(stripped) && stripped.indexOf('swml-beat-track') === -1,
                'withProgressChip strips only PART of the model chip, orphaning its closing tags');
            // The code-served chip carries NO marker class and must survive untouched.
            ok(wpc(chip2({ section: 'Story Spine', unit: 'Beat', step: 2, total: 6 }), '').indexOf('swml-beat') !== -1,
                'withProgressChip EATS the code-served chip — this is the exact defect Neil reported '
                + 'twice: the token is emitted, formatAI renders it, and the canvas pipeline deletes '
                + 'it before he sees it');
        }
    }
}

// ───────────────────────────────────────────────────────────────────────────────────────────
// CW WALK ENDPOINT — every walk stops on a stopping point (v7.20.337)
// ───────────────────────────────────────────────────────────────────────────────────────────
// Neil, 2026-07-29: "make sure that all the chats have a clear stopping point and a clear
// endpoint, a final message… maybe to mark the lesson complete." A walk that simply stops
// talking leaves the student unsure whether it broke or finished.
//
// ⚠ The endpoint must NEVER hard-code a Mark Complete button. WML does not own completion —
// the footer control is a LearnDash proxy, and a lesson that is ALREADY complete has no button
// at all (`learndash_mark_complete()` returns empty), as do unit pages and review mode.
// `cwEndpointLine()` looks for the real control and words itself accordingly; a walk that
// writes its own "press Mark Complete" text would promise a button that isn't there.
{
    console.log('CW WALK ENDPOINT — six walks, one ending, and it never invents a button');
    const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

    ok(/function cwEndpointLine\(\)/.test(src),
        'cwEndpointLine() is gone — each walk will drift to its own ending again');

    const calls = (src.match(/cwEndpointLine\(\)/g) || []).length - 1;   // minus the definition
    ok(calls >= 6,
        `only ${calls} walk ending(s) call cwEndpointLine() — there are six CW walks and each must `
        + 'end on one. A walk that just stops reads as a crash to a 14-year-old.');

    // The button promise may live ONLY inside the helper, where it is conditional on the
    // control actually being present.
    const helperAt = src.indexOf('function cwEndpointLine()');
    const helperEnd = src.indexOf('\n    function ', helperAt + 10);
    const helper = src.slice(helperAt, helperEnd === -1 ? helperAt + 2500 : helperEnd);
    ok(/querySelector\([^)]*learndash_mark_complete_button/.test(helper),
        'cwEndpointLine() no longer CHECKS for the real Mark Complete button before naming it — '
        + 'it will tell students to press a control that is not on screen whenever the lesson is '
        + 'already complete, is a unit page, or is being reviewed.');

    const strayPromise = src.split('\n').some((line, i) => {
        if (!/press \*\*Mark Complete\*\*|press Mark Complete/i.test(line)) return false;
        return i < src.slice(0, helperAt).split('\n').length || i > src.slice(0, helperEnd).split('\n').length;
    });
    ok(!strayPromise,
        'a walk names "Mark Complete" outside cwEndpointLine() — that text must stay inside the '
        + 'helper, which only says it when the button actually exists.');
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SIM RIG PARITY — four fake worlds must not drift apart (v7.20.338)
// ───────────────────────────────────────────────────────────────────────────────────────────
// There should be ONE fake world for the walk sims. There are FOUR: the shared
// bin/walk-sim-lib.js (used by cw2 + cw3) plus private `makeWorld` copies inside the cw4, cw5
// and cw6 harnesses that were never migrated.
//
// THE COST IS NOT THE EDITS — IT IS DRIFT. On 2026-07-29 two new module-scope helpers
// (`_tickRowLikeAStudent`, `cwEndpointLine`) each had to be added to four places. Both times
// the three inline rigs blew up with ReferenceError, which is the LOUD outcome. The quiet
// outcome is worse: a rig that silently lacks a dependency the others have will test a
// slightly different product, so a bug cw2 would catch walks straight past cw5.
//
// Until the three are migrated (a fresh-context job — see the handoff), this gate makes the
// divergence impossible to introduce silently: every dependency the SHARED lib provides must
// also exist in each inline rig. Adding a helper to the lib and forgetting cw6 now fails the
// build, naming the file and the missing key.
{
    console.log('SIM RIG PARITY — one product, four fake worlds, no silent divergence');
    const depKeys = (file) => {
        const src = fs.readFileSync(path.join(ROOT, 'bin', file), 'utf8');
        const keys = new Set();
        // Dependency entries are `name: value,` at the indentation the rigs use for their maps.
        (src.match(/^\s{4,8}([A-Za-z_][A-Za-z0-9_]*)\s*:/gm) || [])
            .forEach((m) => keys.add(m.trim().replace(/:$/, '')));
        return keys;
    };
    const shared = depKeys('walk-sim-lib.js');
    ok(shared.size > 20, `walk-sim-lib.js exposed only ${shared.size} dependencies — the parity scan has gone blind`);

    // Keys that are genuinely lib-internal plumbing, not part of the product surface a rig
    // must reproduce. Named, so the exemption is a decision rather than a silent hole.
    const NOT_PRODUCT = new Set(['console', 'document', 'window', 'localStorage', 'setTimeout', 'clearTimeout']);

    ['cw4-sim-harness.js', 'cw5-sim-harness.js', 'cw6-sim-harness.js'].forEach((rig) => {
        const mine = depKeys(rig);
        const missing = [...shared].filter((k) => !NOT_PRODUCT.has(k) && !mine.has(k));
        ok(missing.length === 0,
            `${rig} carries its own makeWorld and is missing ${missing.length} dependency(ies) that `
            + `walk-sim-lib.js provides: ${missing.join(', ')}. Either add them, or migrate this rig `
            + 'onto the shared world. A rig missing a dependency tests a different product from its '
            + 'siblings, and the difference is invisible until a bug slips through it.');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// THE NUMBERING NEVER LIES — a counted heading rides the WRITE-ask only (v7.20.355, #73)
// ───────────────────────────────────────────────────────────────────────────────────────────
// Neil watched students write straight into the document because of this: a beat's STATION is
// 1–3 bubbles (recall/teach → pick → write) and the heading "Beat 1 of 6" was stamped on the
// FIRST of them, so it sat above "Which is your protagonist's MAIN unmet need?" — a question
// that is not the beat. "Now write Beat 1" only arrived two bubbles later. The bar, meanwhile,
// rode the write-ask alone, so the bar and the heading contradicted each other.
//
// THE RULE, and it is the whole fix: `N of M` is a COUNT, so it may appear only on the bubble
// that actually asks for the counted thing. Preparation bubbles say "Beat N — <what this one
// asks>" with no count. And every bubble in the station carries the bar, so position is stated
// once, consistently, wherever the student happens to be looking.
//
// This is a naming-layer gate, not a text-review: it fails on the SHAPE, so a beat added or
// reworded later cannot quietly reintroduce the lie.
{
    console.log('CW4 NUMBERING — a counted heading rides the write-ask only, and the bar rides the station');
    const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

    const beatsAt = src.indexOf('const BEATS = [');
    ok(beatsAt !== -1, 'the CW4 BEATS array is gone — this gate has gone blind');
    const beatsEnd = src.indexOf('const WRAP =', beatsAt);
    ok(beatsEnd > beatsAt, 'could not find the end of the CW4 BEATS array — this gate has gone blind');
    const beats = src.slice(beatsAt, beatsEnd);

    // A counted heading: bolded, line-leading, "<Label> N of M —". Same shape the duplicate-ask
    // guard watches for in the MODEL's replies, so the two stay in step by construction.
    const COUNTED = /\*\*[A-Z][A-Za-z'’ ]{1,24}\s+\d+\s+of\s+\d+\s*[—–-]/;

    // Pull each `key: '...'` string field out of the array. The bodies are single-quoted
    // one-liners with escaped newlines, which is what makes this parseable at all.
    const fields = [];
    const FIELD_RE = /(chipQ|ask|irony)\s*:\s*\n?\s*'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = FIELD_RE.exec(beats)) !== null) fields.push({ kind: m[1], body: m[2] });
    ok(fields.length >= 12,
        `only ${fields.length} CW4 beat strings were parsed — expected at least 12 (6 asks + 5 chipQs + 2 ironies). `
        + 'The gate cannot see the headings it is meant to police, which means it passes everything.');

    const asks = fields.filter((f) => f.kind === 'ask');
    const preps = fields.filter((f) => f.kind !== 'ask');
    ok(asks.length === 6, `expected 6 CW4 write-asks, parsed ${asks.length}`);
    ok(preps.length >= 6, `expected at least 6 CW4 preparation bubbles, parsed ${preps.length}`);

    // ⭐ v7.20.356 SUPERSEDES the .355 form of this rule. At .355 the count lived in the PROSE and
    // was required on the write-ask; now the CHIP carries "Story Spine · Beat N of 6" on every
    // bubble of the station, so a count in the prose is a SECOND copy of the same number — the
    // "two counts side by side" Neil objected to in .991. The rule is therefore now absolute:
    // NO CW4 beat string may carry a count. The position is stated once, by the component, and
    // is derived from the walk rather than typed by hand.
    [...asks, ...preps].forEach((f) => {
        ok(!COUNTED.test(f.body),
            `a CW4 ${f.kind} bubble hard-codes a count ("${(f.body.match(COUNTED) || [''])[0].trim()}"). `
            + 'The beat chip already states "Beat N of 6" above every bubble in the station, so this '
            + 'is a duplicate the walk must keep in sync by hand — the drift that made #73 possible. '
            + 'Say what THIS bubble asks ("First — your protagonist\'s unmet need", "Write it — '
            + '“At first…”") and let the chip carry the number.');
    });

    // ── the bar rides every bubble in the station ──────────────────────────────────────────
    // Scanned by the CW4 beat FIELD NAMES rather than by slicing the controller: the first cut
    // of this gate sliced to `function serveThroughline`, whose DEFINITION sits above the irony
    // serve site, so the one bubble most likely to lose its bar fell outside the window and the
    // scan reported four sites instead of six. A name-driven scan cannot be truncated that way.
    const stationEmits = src.split('\n')
        .map((l) => l.trim())
        .filter((l) => /^aiBubble\(/.test(l))
        // Matched on ARGUMENT NAMES that are unique to this walk, never on the `+ cwProgressBar(…)`
        // shape around them — otherwise deleting a bar turns `aiBubble(cwProgressBar(…) + b.ask)`
        // into `aiBubble(b.ask)`, the site drops OUT of the scan, and the gate passes the very edit
        // it exists to catch. (`body` is deliberately NOT in this list: it is a generic local name
        // used by other walks, so matching it produced three false positives. serveChip, which uses
        // it, is asserted explicitly below instead.)
        .filter((l) => /\b(b\.ask|b\.chipQ|b\.irony|SEC_ASK)\b|BEATS\[0\]\.ask/.test(l));
    ok(stationEmits.length >= 5,
        `only ${stationEmits.length} CW4 station bubbles were found — expected at least 5 `
        + '(secondary-needs, two ask paths, serveCurrent, irony). The bar scan has gone blind.');

    // serveChip serves the beat's FIRST bubble — the one that carried the lying heading — and it
    // emits a local `body`, so it is asserted by name rather than by argument.
    const chipAt = src.indexOf('function serveChip()');
    ok(chipAt !== -1, 'CW4 serveChip() is gone — the first bubble of every beat station is unpoliced');
    const chipBody = src.slice(chipAt, src.indexOf('\n            }', chipAt));
    ok(/aiBubble\(cwProgressBar\([^)]*\)\s*\+/.test(chipBody),
        'CW4 serveChip() serves the first bubble of a beat station with no progress bar. That is the '
        + 'bubble students read as "Beat N" — without a bar it is the only thing on screen telling '
        + 'them where they are, and the heading has to carry a position it must not carry (#73).');
    stationEmits.forEach((call) => {
        ok(/cwProgressBar\(/.test(call),
            `a CW4 station bubble is served with no progress bar: ${call.trim().slice(0, 90)}… `
            + 'Every bubble in a beat\'s station must state the same position, or the bar and the '
            + 'heading disagree again (#73).');
    });
}

// ── HOUSE BUTTON — the label has ONE producer, and a raw write kills the roll silently ────────
//
// v7.20.360. The house button (BRAND.md §8) rolls TWO stacked copies of its label past each
// other on hover, so the label must be present twice. That makes `btn.textContent = 'x'` and
// `btn.innerHTML = 'x'` DESTRUCTIVE on one of these buttons: the roll's two spans are replaced by
// a single text node and the hover effect dies — with no error, and only AFTER a state change, so
// the button looks perfect in every screenshot taken before the first click.
//
// The Sign Off button is the proof this needs a gate rather than a comment: it rewrites its own
// label in SIX places (lock/✍ refresh · "Click again to confirm →" · the CW count variant ·
// "⏳ Signing…" · two error resets). Five of them are in error and timeout paths nobody drives by
// hand. A rule in prose loses to a default in code — and `textContent =` IS the default you get
// by not thinking (the same shape as `history.push()` in the fossil class).
//
// So: WML.setHaloLabel is the only producer, and this fails the build on either escape route.
{
    console.log('HOUSE BUTTON — one label producer, and a raw write cannot kill the roll');
    const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
    const core = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-styles.css'), 'utf8');

    ok(/function setHaloLabel\(/.test(core) && /\bsetHaloLabel,/.test(core),
        'WML.setHaloLabel is gone or unexported — every house button label falls back to hand-written '
        + 'spans, which is the state this gate exists to prevent');
    ok(/\.swml-halo-btn\b/.test(css) && /\.swml-roll\b/.test(css),
        'the house-button factory (.swml-halo-btn / .swml-roll) is gone from wml-styles.css');

    // (a) NOBODY hand-writes the roll markup. One producer means one place to change it.
    const handRolled = src.split('\n')
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => /class="swml-roll"|className:\s*'swml-roll'|className = 'swml-roll'/.test(line));
    ok(handRolled.length === 0,
        `hand-written .swml-roll markup at wml-assessment.js:${handRolled.map(h => h.n).join(', ')} — `
        + 'build it with WML.setHaloLabel so the two copies can never drift apart or be written once');

    // (b) No raw label write to anything carrying .swml-halo-btn. Collect the variable names that
    //     get the class (both `x.className = '… swml-halo-btn'` and `className: '… swml-halo-btn'`
    //     on an el() whose const is on a nearby line), then look for a destructive write to them.
    const haloVars = new Set();
    src.split('\n').forEach((line, i) => {
        const direct = line.match(/(\w+)\.className\s*=\s*['"][^'"]*swml-halo-btn/);
        if (direct) haloVars.add(direct[1]);
        if (/className:\s*['"][^'"]*swml-halo-btn/.test(line)) {
            // the el() form — the const is declared at or just above this line
            for (let back = 0; back < 4; back++) {
                const decl = (src.split('\n')[i - back] || '').match(/(?:const|let|var)\s+(\w+)\s*=\s*el\(/);
                if (decl) { haloVars.add(decl[1]); break; }
            }
        }
    });
    ok(haloVars.size >= 3,
        `only ${haloVars.size} house button(s) found — expected at least 3 (Add comment, Full version, `
        + 'Sign Off). Either a button lost the class or this scanner has gone blind, and a blind '
        + 'scanner passes on every defect it exists to catch');

    haloVars.forEach((v) => {
        const bad = src.split('\n')
            .map((line, i) => ({ line, n: i + 1 }))
            .filter(({ line }) => new RegExp('\\b' + v + '\\.(textContent|innerHTML)\\s*=').test(line));
        ok(bad.length === 0,
            `${v} carries .swml-halo-btn but its label is written raw at wml-assessment.js:`
            + `${bad.map(b => b.n).join(', ')}. That replaces the roll's two copies with one text node `
            + 'and the hover roll dies silently, after the first state change. Use WML.setHaloLabel.');
    });

    // (c) THE LIFT IS RETIRED (BRAND.md §8, Neil 2026-07-26 — and his 2026-07-31 complaint about
    //     this very button). A translateY on a house button's hover/active is a regression.
    //     ⚠️ The roll ITSELF is a translateY — on `.swml-roll span`, which is the effect, not a
    //     lift. The first cut of this check flagged all four of those and would have been switched
    //     off as noise. The lift is a translateY on the BUTTON's own selector, so any selector
    //     reaching into `.swml-roll` is excluded by construction.
    const canvasCss = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
    const HOUSE_SEL = /\.swml-halo-btn|\.swml-signoff-btn|\.swml-guide-library-btn|\.swml-tutorcomment-add/;
    [['wml-styles.css', css], ['wml-canvas.css', canvasCss]].forEach(([name, sheet]) => {
        const lifts = sheet.split('}')
            .map(block => {
                const at = block.lastIndexOf('{');
                return at === -1 ? null : { sel: block.slice(0, at), body: block.slice(at + 1) };
            })
            .filter(r => r && HOUSE_SEL.test(r.sel) && !/\.swml-roll/.test(r.sel)
                && /:(hover|active)/.test(r.sel) && /translateY/.test(r.body))
            .map(r => r.sel.trim().split('\n').pop().trim());
        ok(lifts.length === 0,
            `${name} reintroduces a hover/active translateY on a house button (${lifts.join(' · ')}). `
            + 'BRAND.md §8 retired the lift site-wide on 2026-07-26 — the hover state is halo + roll '
            + '+ shadow, nothing more. It is also the exact thing Neil asked to be removed on '
            + '2026-07-31: "the main thing I don\'t like is that lifting up that it does".');
    });
}

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ cw-keymatch-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ cw-keymatch-harness passed (every CW write-key has a row that creates it).');
