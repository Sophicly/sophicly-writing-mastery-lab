#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-livevalue-harness.js — v7.20.400  (FIXLIST #165)
 *
 * WHY THIS EXISTS.
 * The Step-6 greeting is a DURABLE stored turn carrying `[SWML_LIVE:cw.plotStructure]` — the
 * §4c.7 VALUE-fossil cure, so a saved sentence can name a value the student may later change.
 * A live value is only as good as its SYNC getter, and `_cwPlotStructureNameSync` read two
 * WARM-ONLY sources: in-session memory (written by the Step-5 pick, absent on a fresh load) and
 * a cache warmed only by an ASYNC artifact fetch. The greeting replays synchronously on entry,
 * i.e. BEFORE that fetch lands — so on every cold entry it could only ever miss, and a student
 * read "your chosen plot structure" instead of "Rebirth / Redemption" (Neil, prod 7.20.398).
 *
 * The data was never wrong: the walk resolved the structure correctly one line later. The two
 * simply did not agree about where to look. The fix makes the getter read what the WALK reads —
 * `resolveKey()`'s "The DOC is authoritative" — so the name shown is derived from the very rows
 * the student is working in.
 *
 * WHY A GATE AND NOT A COMMENT.
 * Nothing errors when a live value misses. It degrades to a true-but-vaguer phrase, which is
 * correct §4d behaviour and therefore INVISIBLE — the failure looks exactly like a design choice.
 * That is why it survived from .351 to .398 and needed a human to notice a missing sentence.
 *
 * ⚠️ IT SLICES THE REAL FUNCTIONS. It does not restate the read order, because a check that
 * reimplements its subject tests its own memory of the rule rather than the rule
 * (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`; live instance: FIXLIST #163,
 * where cw6-outline-harness passes with the bug injected). If a future edit changes the getter,
 * these assertions run against THAT edit.
 *
 * WHAT IT CHECKS (all four proven by injecting the real defect — see PROVEN below).
 *   1. COLD ENTRY  — both caches empty, a built Step-6 doc on screen → the real name resolves.
 *                    This is the shipped bug, and it fails on the pre-.400 getter.
 *   2. AGREEMENT   — when the doc and in-session memory disagree, the DOC wins, exactly as the
 *                    walk's resolveKey() does. Otherwise the greeting names one structure while
 *                    the walk writes another's rows.
 *   3. §4d DEGRADE — no CW doc on screen (any non-Step-6 surface) → returns '' so the registered
 *                    fallback renders. It must never invent a name, and never leak a raw token.
 *   4. NO DRIFT    — the field-id shape the detector keys on is the one _cw6RowFieldId produces.
 *                    A rename in one and not the other would silently return null for ever.
 *
 * PROVEN NON-VACUOUS: restore the pre-v7.20.400 body of _cwPlotStructureNameSync (drop the
 * detectBuiltPlotSlug read) → checks 1 and 2 go red. Delete the '-' from the fieldId prefix in
 * detectBuiltPlotSlug → check 4 goes red.
 *
 * Node builtins only — the CI workflow has no `npm install` step.
 *
 * Run: node bin/cw6-livevalue-harness.js      (wired into bin/pre-ship-check.sh)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

// Same brace-walker the sim rigs use: comments and quoted strings are skipped, or an apostrophe
// in ordinary prose reads as an opening quote and the slice swallows the rest of the file.
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

function sliceFn(decl) {
    const i = SRC.indexOf(decl);
    if (i < 0) { console.error('cw6-livevalue: cannot find `' + decl + '` — did it get renamed?'); process.exit(1); }
    const body = braceSliceFrom(SRC, i, '{', '}');
    if (!body) { console.error('cw6-livevalue: could not slice `' + decl + '`'); process.exit(1); }
    return SRC.slice(i, body.end);
}

// The eight canonical names, sliced rather than retyped so a renamed structure cannot pass here
// and fail on screen.
const namesIdx = SRC.indexOf('const CW_STRUCT_NAMES = {');
if (namesIdx < 0) { console.error('cw6-livevalue: CW_STRUCT_NAMES not found'); process.exit(1); }
const NAMES_SRC = 'const CW_STRUCT_NAMES = ' + braceSliceFrom(SRC, namesIdx, '{', '}').text + ';';

const FN_SYNC   = sliceFn('function _cwPlotStructureNameSync(projectId)');
const FN_DETECT = sliceFn('function detectBuiltPlotSlug(editor)');
const FN_SLUG   = sliceFn('function resolvePlotStructureSlug(artifactValue)');
const FN_FID    = sliceFn('function _cw6RowFieldId(archetypeKey, sectionId, criterionId)');

// A minimal stand-in for the ONE thing detectBuiltPlotSlug reads out of the archetype table: its
// KEYS. Taken from CW_STRUCT_NAMES so the two can never disagree about which eight exist.
const build = new Function('window', 'canvasEditorRef', 'OUTLINE_CRITERIA', [
    NAMES_SRC,
    FN_SLUG,
    FN_DETECT,
    FN_FID,
    'const _cwStructNameCache = Object.create(null);',
    'let canvasEditor = canvasEditorRef;',
    FN_SYNC,
    'return { sync: _cwPlotStructureNameSync, fid: _cw6RowFieldId, detect: detectBuiltPlotSlug, NAMES: CW_STRUCT_NAMES, cache: _cwStructNameCache };',
].join('\n'));

// A doc stub shaped like the only thing detectBuiltPlotSlug touches: state.doc.descendants(fn)
// over outlineRow nodes carrying attrs.fieldId.
function docWithRows(fieldIds) {
    return {
        state: {
            doc: {
                descendants(fn) {
                    for (const fid of fieldIds) {
                        if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: fid } }) === false) return;
                    }
                },
            },
        },
    };
}

let failed = 0, passed = 0;
function ok(cond, label, detail) {
    if (cond) { passed++; return; }
    failed++;
    console.error('  ✗ ' + label + (detail ? '\n      ' + detail : ''));
}

const PROJECT = 'cwp_test000000';

function makeWorld(editor, mem) {
    const win = {};
    if (mem) win._wmlCwPlotStructure = { [PROJECT]: mem };
    const archKeys = {};
    // keys only — detectBuiltPlotSlug reads Object.keys(OUTLINE_CRITERIA.cwPlotArchetypes)
    const probe = new Function(NAMES_SRC + '\nreturn Object.keys(CW_STRUCT_NAMES);')();
    probe.forEach((k) => { archKeys[k] = {}; });
    return build(win, editor, { cwPlotArchetypes: archKeys });
}

console.log('cw6-livevalue-harness — the Step-6 greeting must name the structure the walk is writing\n');

// ── 1. COLD ENTRY — the shipped bug (FIXLIST #165) ───────────────────────────────────────────
// Both warm sources empty (fresh page load: no Step-5 pick this session, artifact fetch still in
// flight) and a Rebirth doc on screen. The greeting must still say the name.
{
    const w = makeWorld(docWithRows([
        w0fid('rebirth-redemption', 'setup', 'opening-image'),
        w0fid('rebirth-redemption', 'setup', 'ordinary-world'),
    ]), null);
    const got = w.sync(PROJECT);
    ok(got === w.NAMES['rebirth-redemption'],
        'cold entry with a built doc resolves the real name',
        'expected "' + (new Function(NAMES_SRC + '\nreturn CW_STRUCT_NAMES["rebirth-redemption"];')()) + '", got "' + got + '" '
        + '— a fresh load has no in-session memory and no warmed cache, so a getter reading only those two ALWAYS misses and the student sees the fallback.');
}

// ── 2. AGREEMENT — the doc outranks in-session memory, exactly as resolveKey() does ───────────
// A student who re-picked in Step 5 but whose Step-6 doc has not been rebuilt yet is still
// WRITING INTO the old rows, so the greeting must name the old structure or it contradicts the
// walk standing directly beneath it.
{
    const w = makeWorld(docWithRows([w0fid('tragedy', 'setup', 'opening-image')]), 'Rags to Riches');
    const got = w.sync(PROJECT);
    ok(got === w.NAMES['tragedy'],
        'the DOC wins over in-session memory (agreement with the walk resolveKey())',
        'expected "' + w.NAMES['tragedy'] + '", got "' + got + '" — the walk writes the rows that EXIST; a greeting naming a different structure tells the student the outline is something it is not.');
}

// ── 3. §4d DEGRADE — no CW doc → '' so the REGISTERED FALLBACK renders ────────────────────────
// Every non-Step-6 surface. It must not invent a name, and must not leak a raw token.
{
    const w = makeWorld(null, null);
    ok(w.sync(PROJECT) === '', 'no doc on screen → empty, so the registered fallback renders (§4d)');
    ok(w.sync('') === '', 'no project id → empty');
}
{
    // A doc with rows that are not CW6 outline rows (e.g. a Step-5 canvas) must also degrade.
    const w = makeWorld(docWithRows(['cw-step-5-primary-archetype', 'cw-step-5-context']), null);
    ok(w.sync(PROJECT) === '', 'a non-Step-6 doc degrades rather than guessing');
}

// ── 4. NO DRIFT — the detector keys on the shape the builder emits ────────────────────────────
// The detector matches `outline-cw-<key>-`. If _cw6RowFieldId ever stops producing that prefix,
// detection returns null for every row and #165 comes back silently.
{
    const w = makeWorld(null, null);
    const built = w.fid('tragedy', 'setup', 'opening-image');
    ok(built.indexOf('outline-cw-tragedy-') === 0,
        'the builder still emits the prefix the detector matches',
        '_cw6RowFieldId produced "' + built + '" — detectBuiltPlotSlug matches on "outline-cw-<key>-", so this rename would make every row undetectable.');
    // and end-to-end: a row id straight from the builder must be detectable
    const w2 = makeWorld(docWithRows([w.fid('voyage-and-return', 'setup', 'opening-image')]), null);
    ok(w2.sync(PROJECT) === w2.NAMES['voyage-and-return'],
        'a field id from the real builder is detected by the real detector');
}

// ── every structure resolves (a name added to one table and not the other is a silent miss) ───
{
    const probe = makeWorld(null, null);
    Object.keys(probe.NAMES).forEach((k) => {
        const w = makeWorld(docWithRows([probe.fid(k, 'setup', 'opening-image')]), null);
        ok(w.sync(PROJECT) === probe.NAMES[k], 'structure "' + k + '" resolves to its name',
            'got "' + w.sync(PROJECT) + '"');
    });
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// THE ENTRY LINE (v7.20.403, FIXLIST #180) — the half the getter above cannot cover.
//
// .400 fixed WHAT the greeting resolves. It could not fix the fact that a project WITH history
// never gets a greeting at all: the "Welcome back" line is DOM-only (v7.20.324) and is drawn only
// on the no-saved-chat branch. Neil's own staging project holds 41 turns and no greeting turn, so
// nothing had named his structure since the day he started.
//
// This is asserted by SLICING `_cwStep6EntryLine` and driving it, not by re-describing it. What
// makes it worth a gate is the same property as above: every failure mode here is SILENT. A line
// that draws twice, a line that draws when nothing resolved, a line that draws on the wrong task —
// none of them error, and all of them are only visible to a human reading a screen.
//
// PROVEN NON-VACUOUS (each injected into the shipped body and confirmed red):
//   • delete the last-assistant token/name check  → "does not repeat itself" goes red;
//   • draw a line when `name` is falsy            → "withholds rather than saying nothing useful" goes red;
//   • drop the `state.task` guard                 → "never draws off Step 6" goes red;
//   • return before the async fallback            → "cold entry (doc not painted yet)" goes red.
// ─────────────────────────────────────────────────────────────────────────────────────────────
const FN_ENTRY = sliceFn('function _cwStep6EntryLine(tp)');

// Drive the real function with the smallest world it touches: state, the two resolvers, formatAI.
function entryWorld(opts) {
    const o = opts || {};
    const drawn = [];
    const warned = [];
    const w = makeWorld(o.editor || null, o.mem || null);
    const stateStub = { task: ('task' in o) ? o.task : 'cw_step_6', cwProjectId: ('pid' in o) ? o.pid : PROJECT };
    const tp = {
        canvasChatHistory: o.history || [],
        addChatMessage(html, role, raw) { drawn.push({ html, role, raw }); },
    };
    const run = new Function(
        'state', 'formatAI', '_cwPlotStructureNameSync', '_cwPlotStructureName', 'console',
        FN_ENTRY + '\nreturn _cwStep6EntryLine;'
    )(
        stateStub,
        (s) => s,
        () => (o.syncName || ''),
        () => Promise.resolve(o.asyncName || ''),
        { warn: (...a) => warned.push(a.join(' ')), log() {} }
    );
    return { run: () => run(tp), drawn, warned, NAMES: w.NAMES };
}

(async function entryLineChecks() {
    const NAMES = makeWorld(null, null).NAMES;
    const TRAGEDY = NAMES['tragedy'];

    // 1. The case that exists (Neil's project): long transcript, nothing naming the structure.
    {
        const e = entryWorld({ syncName: TRAGEDY, history: [{ role: 'user', content: 'she runs' }, { role: 'assistant', content: 'Good — file that.' }] });
        const did = await e.run();
        ok(did === true && e.drawn.length === 1, 'a resumed project with history gets an entry line',
            'drawn=' + e.drawn.length + ' — without it a student who has ever answered anything never sees the structure named again.');
        ok(e.drawn.length === 1 && e.drawn[0].raw.indexOf(TRAGEDY) !== -1,
            'the entry line names the structure the doc is built on');
        ok(e.drawn.length === 1 && e.drawn[0].raw.indexOf('[SWML_LIVE:') === -1,
            'the entry line carries no raw token (§14 — never a machine value on a 14-year-old’s screen)');
    }

    // 2. No double-up: the fresh-entry-then-reload case, where the stored greeting replays last.
    {
        const e = entryWorld({ syncName: TRAGEDY, history: [{ role: 'assistant', content: 'In Step 5, you chose **[SWML_LIVE:cw.plotStructure]**. Now we’ll build a detailed plot outline.' }] });
        const did = await e.run();
        ok(did === false && e.drawn.length === 0, 'does not repeat itself when the replayed greeting already names the structure (token form)',
            'drawn=' + e.drawn.length);
    }
    {
        const e = entryWorld({ syncName: TRAGEDY, history: [{ role: 'assistant', content: 'Welcome back — we’re picking up your **' + TRAGEDY + '** plot outline.' }] });
        ok((await e.run()) === false, 'does not repeat itself when the last turn already names the structure (resolved form)');
    }
    // ...but a hidden turn is not on the screen, so it must not suppress the line.
    {
        const e = entryWorld({ syncName: TRAGEDY, history: [
            { role: 'assistant', content: 'You chose **[SWML_LIVE:cw.plotStructure]**', hidden: true },
            { role: 'user', content: 'ok' },
        ] });
        ok((await e.run()) === true, 'a HIDDEN turn naming the structure does not suppress the line (it is not on screen)');
    }

    // 3. Nothing resolves → NOTHING is said. A vague orientation line teaches nothing (#14).
    {
        const e = entryWorld({ syncName: '', asyncName: '', history: [{ role: 'user', content: 'hi' }] });
        const did = await e.run();
        ok(did === false && e.drawn.length === 0, 'withholds rather than saying something vague when no structure resolves');
        ok(e.warned.length === 1, 'and it fails LOUD to the console instead of vanishing (§10)');
    }

    // 4. COLD ENTRY — doc not painted yet, so the sync read misses and the async ladder answers.
    //    This is the .400 race in a new costume; the line must survive it.
    {
        const e = entryWorld({ syncName: '', asyncName: TRAGEDY, history: [{ role: 'user', content: 'hi' }] });
        const did = await e.run();
        ok(did === true && e.drawn.length === 1, 'cold entry (doc not painted yet) still resolves through the async ladder',
            'drawn=' + e.drawn.length + ' — a sync-only read is exactly the bug .400 fixed one layer up.');
    }

    // 5. Scope — it is a Step-6 line and a project-scoped one.
    {
        ok((await entryWorld({ task: 'cw_step_5', syncName: TRAGEDY }).run()) === false, 'never draws off Step 6');
        ok((await entryWorld({ pid: '', syncName: TRAGEDY }).run()) === false, 'never draws without a project id');
        const noTp = new Function('state', 'formatAI', '_cwPlotStructureNameSync', '_cwPlotStructureName', 'console',
            FN_ENTRY + '\nreturn _cwStep6EntryLine;')({ task: 'cw_step_6', cwProjectId: PROJECT }, (s) => s, () => '', () => Promise.resolve(''), { warn() {} });
        ok((await noTp(null)) === false, 'a missing pipeline object is survived, not thrown on');
    }

    // 6. ORDERING, asserted on the CALL SITE rather than on the function: the line must be AWAITED
    //    and must run BEFORE tryResume, or the walk's ask ends up above it and the student is left
    //    on an orientation sentence with no question (§4d liveness).
    {
        const call = SRC.slice(SRC.indexOf("if (state.task === 'cw_step_6' && tp.cwOutlineCtl)"));
        const head = call.slice(0, 400);
        const iAwait = head.indexOf('await _cwStep6EntryLine(tp)');
        const iResume = head.indexOf('cwOutlineCtl.tryResume()');
        ok(iAwait > -1, 'the entry line is AWAITED at the call site (an un-awaited draw lands under the ask)');
        ok(iAwait > -1 && iResume > -1 && iAwait < iResume,
            'the entry line is drawn BEFORE the walk resumes, so the ask is always the last thing on screen (§4d)');
    }

    // 7. FOSSIL LAW — it asserts a PRESENT state ("we're picking up your X"), so it must be drawn
    //    and never recorded. A recordTurn inside this function would freeze the name (§4c.7).
    ok(FN_ENTRY.indexOf('recordTurn') === -1 && FN_ENTRY.indexOf('saveCanvasChat') === -1,
        'the entry line is DRAWN, never persisted (§4c.7 — a present-state sentence must re-derive)');

    if (failed) {
        console.error('\ncw6-livevalue-harness: ' + failed + ' FAILED, ' + passed + ' passed');
        process.exit(1);
    }
    console.log('✓ ' + passed + ' assertions passed — the greeting resolves from the doc the student is working in, '
        + 'and every entry names it exactly once');
})();

// Helper hoisted for readability above (declared after use on purpose — function declaration).
function w0fid(key, sec, crit) { return 'outline-cw-' + key + '-' + sec + '-' + crit; }

// (the pass/fail verdict is printed by the async block above — it must run LAST, and awaiting it
// is the only way the entry-line assertions are counted before we exit)
