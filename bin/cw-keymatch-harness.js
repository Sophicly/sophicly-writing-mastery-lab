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
        // flow-control — must NOT be filed
        onCohChoice:    { kind: 'flow', note: 'rewrite / keep the beat the coherence check flagged' },
        onAnchorChoice: { kind: 'flow', note: 'Step 6 story bookend: still right / sharpen' },
        onStageChoice:  { kind: 'flow', note: 'Step 6 stage arc: sharpen / leave' },
        onFinishChoice: { kind: 'flow', note: 'Step 6 final image: rewrite / leave' },
        onPushChoice:   { kind: 'flow', note: 'Step 5 archetype push: switch / keep' },
        onMultiDone:    { kind: 'flow', note: 'Step 5 alternates considered (multi-select)' },
        onReviewChipPick: { kind: 'flow', note: 'Step 3 review: sharpen component X / move on — steers the walk' },
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
    const RAW_GUARD_BASELINE = 4;
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

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ cw-keymatch-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ cw-keymatch-harness passed (every CW write-key has a row that creates it).');
