#!/usr/bin/env node
/* eslint-env node */
/**
 * cw8-sim-harness.js — BEHAVIOURAL gate for the CW Step-8 trait-first plot-update walk
 * (v7.20.491; PEDAGOGY §29 + §30).
 *
 * Slices the REAL `_cwPlotValuesCtl` and the REAL module helpers out of wml-assessment.js and
 * drives them on the shared rig (walk-sim-lib) — never re-typed copies (§14c: a check that
 * duplicates its subject tests its own memory). The Step-7 audit arrives exactly the way the
 * product delivers it: as a saved-document HTML string whose rows carry baked `data-check-state`,
 * built here with the SAME producers the document builder uses.
 *
 * What this walk needed its own gate for (v7.20.492 — Neil's #364 shape: the writing lands
 * IN THE BEATS, "not a separate table in the document"):
 *  1. The ROSTER IS DERIVED — flagged traits only (real condition at begin OR end, or on the
 *     build list). Asking an unflagged trait, or skipping a CW7_WANT trait, is a walk that
 *     contradicts the student's own Step 7 (§30; FIXLIST #249). And the ask must carry THE
 *     STUDENT'S OWN STEP-7 WORDS ("it should actually show me what I wrote").
 *  2. The typed line APPENDS under the picked beat, labelled `Values (Trait):` — never
 *     overwrites (§29) — and that append IS the walk's footprint for the trait.
 *  3. "Doesn't show anywhere yet" must cost EXACTLY ONE TAP and leave a footprint in the one
 *     surviving row (cw-step-8-notyet) — an answer with no footprint is re-asked for ever (.421).
 *  4. API budget: this walk spends ZERO calls (`sends.length === 0`), and the FLOOR is the
 *     protocol's one greeting — asserted against the protocol file itself, so a later
 *     "programmatic-first" pass cannot drive the step to zero turns while every negative
 *     assertion still passes (feedback_negative_only_tests_pass_on_a_dead_screen).
 *  5. The .490 incident class: the marker, the controller and the start-miss fallback arm must
 *     all exist together — a marker with no controller put a dead Step 8 on production.
 *  6. The .491 Values Map table is DROPPED from documents that got it (the drop-heal).
 *
 * Usage: node bin/cw8-sim-harness.js
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

// ── SLICED SHIPPED CODE — one producer, both sides (§5d) ─────────────────────────────────────
function evalAfter(label, open, close) {
    const i = SRC.indexOf(label);
    if (i < 0) { console.error('❌ not found in wml-assessment.js: ' + label); process.exit(1); }
    // eslint-disable-next-line no-eval
    return eval('(' + braceSliceFrom(SRC, i + label.length, open || '[', close || ']').text + ')');
}
function fnFrom(name, deps) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) { console.error('❌ ' + name + ' not found — the harness would go blind'); process.exit(1); }
    const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end).replace(/^function\s+\w+/, 'function');
    const names = Object.keys(deps || {});
    // eslint-disable-next-line no-new-func
    return new Function(...names, 'return ' + body + ';')(...names.map((n) => (deps || {})[n]));
}
const CW7_VALUES = evalAfter('const CW7_VALUES =');
const CW7_STATES = evalAfter('const CW7_STATES =');
const CW7_NOT_EXPLORED = (SRC.match(/const CW7_NOT_EXPLORED = '([^']+)'/) || [])[1];
const CW7_TRAIT_CHOICES = CW7_STATES.concat([CW7_NOT_EXPLORED]);
const TRAIT_TEACH = evalAfter('const TRAIT_TEACH =', '{', '}');
const ARCH = evalAfter('cwPlotArchetypes:', '{', '}');
const CW8_NO_SHOW = (SRC.match(/const CW8_NO_SHOW = '([^']+)'/) || [])[1];
ok(!!CW8_NO_SHOW, 'CW8_NO_SHOW literal found');
const CW8_LEDGER_FID = (SRC.match(/const CW8_LEDGER_FID = '([^']+)'/) || [])[1];
const CW8_CONTINUITY_FID = (SRC.match(/const CW8_CONTINUITY_FID = '([^']+)'/) || [])[1];
const CW8_NOTYET_FID = (SRC.match(/const CW8_NOTYET_FID = '([^']+)'/) || [])[1];
ok(!!CW8_NOTYET_FID, 'CW8_NOTYET_FID literal found');

const _cw7RowFieldId = fnFrom('_cw7RowFieldId');
const _cw7TraitCtlId = fnFrom('_cw7TraitCtlId');
const _cw7TraitLabel = fnFrom('_cw7TraitLabel');
const _cw7AddRowFieldId = fnFrom('_cw7AddRowFieldId');
const _cw6RowFieldId = fnFrom('_cw6RowFieldId');
const _cwNodeText = fnFrom('_cwNodeText');
const _cwDepLabel = fnFrom('_cwDepLabel');
const _cwDepTag = fnFrom('_cwDepTag', { _cwDepLabel });
// outlineRowHTML/escapeHTML contain `/"/g` regex literals, which braceSliceFrom's string
// scanner cannot cross. The sim never needs them anyway — every walk row pre-exists in the rig,
// so ensureRows' insert path is unreachable. A THROWING stub keeps that honest: if a code change
// makes the walk try to build a row here, the sim fails loud instead of quietly diverging.
const outlineRowHTML = function () { throw new Error('sim: outlineRowHTML reached — the rig pre-registers every walk row, so ensureRows should have found them all'); };
const OUTLINE_CRITERIA = { cwPlotArchetypes: ARCH };
const detectBuiltPlotSlug = fnFrom('detectBuiltPlotSlug', { OUTLINE_CRITERIA });
const _cw8MapRowFieldId = fnFrom('_cw8MapRowFieldId', { _cw7TraitCtlId });
const _cw8ParseValuesAudit = fnFrom('_cw8ParseValuesAudit', {
    CW7_VALUES, CW7_STATES, CW7_TRAIT_CHOICES, _cw7TraitCtlId, _cw7RowFieldId, _cw7AddRowFieldId, _cw7TraitLabel,
});
const _cw8EnumerateBeats = fnFrom('_cw8EnumerateBeats', {
    detectBuiltPlotSlug, OUTLINE_CRITERIA, _cwNodeText, _cw6RowFieldId,
});
const _cw8BeatSegment = fnFrom('_cw8BeatSegment');
const _cw8AppendLine = fnFrom('_cw8AppendLine');
const _cw8BeatHasTrait = fnFrom('_cw8BeatHasTrait');
const _cw8NoShowLine = fnFrom('_cw8NoShowLine');
const _cw8NoShowHas = fnFrom('_cw8NoShowHas');

const ctlIdx = SRC.indexOf('const _cwPlotValuesCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwPlotValuesCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

// ── THE FIXTURE — a real archetype's beat rows + a Step-7 audit built with the shipped shape ──
const K = 'rags-to-riches';
ok(!!ARCH[K], 'fixture archetype "' + K + '" exists in cwPlotArchetypes');
const BEAT_FIDS = [];
ARCH[K].sections.forEach((sec) => {
    (sec.criteria || []).forEach((c) => {
        if (c.beatType === 'turning-point' || c.beatType === 'marker') return;
        BEAT_FIDS.push(_cw6RowFieldId(K, sec.id, c.id));
    });
});
ok(BEAT_FIDS.length > 20, K + ' has a real beat population (' + BEAT_FIDS.length + ' rows)');

// The audit: creativity IN EXCESS at the beginning; bravery moves deficit → balance; kindness is
// on the build list (CW7_WANT). Everything else untouched → NOT flagged.
function checkAttr(obj) { return JSON.stringify(obj).replace(/"/g, '&quot;'); }
function auditRow(fid, check, inner) {
    return '<div data-outline-row="true" data-field-id="' + fid + '"'
        + (check ? ' data-check-state="' + checkAttr(check) + '"' : '')
        + ' class="swml-outline-row">' + (inner || '') + '</div>';
}
const idx = (label) => CW7_TRAIT_CHOICES.indexOf(label);
const AUDIT_HTML = [
    auditRow(_cw7RowFieldId('begin', 'wisdom'), { c: { [_cw7TraitCtlId('creativity')]: { checked: [idx('In excess')] } } },
        '<p>Creativity — she invents to the point of destruction.</p>'),
    auditRow(_cw7RowFieldId('begin', 'courage'), { c: { [_cw7TraitCtlId('bravery')]: { checked: [idx('In deficit')] } } },
        '<p>Bravery — In deficit: she watches her brother take the blame and says nothing.</p>'),
    auditRow(_cw7RowFieldId('end', 'courage'), { c: { [_cw7TraitCtlId('bravery')]: { checked: [idx('In balance')] } } },
        '<p>Bravery — she speaks in the hall.</p>'),
    auditRow(_cw7AddRowFieldId('humanity'), null,
        'Kindness — they do not have it yet, and you want them to gain it.'),
].join('\n');

// Expected roster, in CW7_VALUES order: creativity (wisdom) · bravery (courage) · kindness (humanity).
const EXPECTED = ['creativity', 'bravery', 'kindness'];
const UNFLAGGED = [];
CW7_VALUES.forEach((v) => v.traits.forEach((t) => { if (EXPECTED.indexOf(t) === -1) UNFLAGGED.push(t); }));

// ── 0. THE PARSER, on its own — pure function, pure assertions ───────────────────────────────
console.log('CW STEP-8 TRAIT-FIRST WALK — behavioural sim (real _cwPlotValuesCtl)');
{
    const roster = _cw8ParseValuesAudit(AUDIT_HTML);
    ok(roster.length === 3, 'parser: 3 flagged traits, got ' + roster.length + ' (' + roster.map((r) => r.trait).join(', ') + ')');
    ok(roster.map((r) => r.trait).join('|') === EXPECTED.join('|'),
        'parser: flagged traits in CW7_VALUES order — got ' + roster.map((r) => r.trait).join('|'));
    const brav = roster.filter((r) => r.trait === 'bravery')[0];
    ok(brav && brav.cond === 'In balance', 'parser: a moved trait teaches against where it FINISHES (end beats begin)');
    ok(brav && /speaks in the hall/.test(brav.said), 'parser: the student\'s OWN Step-7 words come through, END pass preferred (#364: "show me what I wrote")');
    const kind = roster.filter((r) => r.trait === 'kindness')[0];
    ok(kind && kind.wanted && kind.cond === 'In deficit', 'parser: a CW7_WANT trait IS flagged, as In deficit (FIXLIST #249)');
    ok(!roster.some((r) => r.trait === 'humour'), 'parser: an untouched trait is NOT flagged');
    // Byte-pairs: the append line and the no-show line each round-trip through their reader.
    ok(_cw8BeatHasTrait('old beat text\n' + _cw8AppendLine('Bravery', 'she speaks'), 'Bravery'),
        'append line round-trips compose → probe');
    ok(!_cw8BeatHasTrait('old beat text mentioning Bravery casually', 'Bravery'),
        'the probe needs the labelled line, not a substring');
    ok(_cw8NoShowHas(_cw8NoShowLine('Humour'), 'Humour'), 'no-show line round-trips');
}

// ── THE WORLD ────────────────────────────────────────────────────────────────────────────────
const WALK_FIDS = [CW8_NOTYET_FID, CW8_CONTINUITY_FID];
function world(opts) {
    opts = opts || {};
    const prefill = Object.assign({}, opts.prefill || {});
    // Every beat row carries the student's own text (the seed copies their Step-6 outline).
    BEAT_FIDS.forEach((f) => { if (!(f in prefill)) prefill[f] = 'their beat text for ' + f; });
    const history = opts.history || [];
    if (!opts.noPrime) {
        // The audit arrives the way the product delivers it: the ensureCwStepContext prime.
        if (!history.some((m) => m && String(m.content || '').indexOf(_cwDepTag('universal_values')) === 0)) {
            history.unshift({ role: 'user', content: _cwDepTag('universal_values') + '\n\n' + AUDIT_HTML, durable: true, why: 'fixture prime' });
        }
    }
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_step_8',
        fids: WALK_FIDS.concat(opts.extraFids || []),
        prefill,
        history,
        ok,
        extraDeps: {
            TRAIT_TEACH, CW7_VALUES, CW7_STATES,
            _cw7TraitLabel, _cw7TraitCtlId,
            _cw8MapRowFieldId, CW8_LEDGER_FID, CW8_CONTINUITY_FID, CW8_NOTYET_FID, CW8_NO_SHOW,
            _cw8ParseValuesAudit, _cw8EnumerateBeats, _cw8BeatSegment,
            _cw8AppendLine, _cw8BeatHasTrait, _cw8NoShowLine, _cw8NoShowHas,
            _cwDepTag, outlineRowHTML, _migrationActive: false,
            _openCw7TraitPanel: function () { return true; },
        },
    }, opts.worldOpts || {}));
    return w;
}
const chipText = (c) => String(c.textContent).replace(/^✓ /, '');
const chipNamed = (w, label) => w.chips().filter((c) => chipText(c) === label)[0];
const isContinue = (c) => /Continue/.test(String(c.textContent));

function tapThroughPacing(w, limit) {
    for (let g = 0; g < (limit || 12); g++) {
        const chips = w.chips();
        if (chips.length !== 1 || !isContinue(chips[0])) return true;
        const before = w.bubbles.length;
        w.tap(chips[0]);
        const landed = w.bubbles.length - before;
        ok(landed === 1, 'PACING: ' + landed + ' bubbles landed on one Continue tap — one bubble per tap (law 4b)');
    }
    return false;
}
// The stage and beat labels of the fixture archetype's first askable beat.
const STAGE1 = ARCH[K].sections[0].label;
const BEAT1 = ARCH[K].sections[0].criteria.filter((c) => c.beatType !== 'turning-point' && c.beatType !== 'marker')[0].label;

async function main() {

// ── 1. THE FLOOR AND THE .490 INCIDENT CLASS — marker · controller · fallback arm ────────────
{
    const proto = fs.readFileSync(path.join(ROOT, 'protocols', 'shared', 'creative-writing', 'CW-STEP-08-update-plot-values.md'), 'utf8');
    ok(proto.indexOf('@CW8_START') !== -1, 'the protocol hands over on @CW8_START');
    ok(/ONE API call/i.test(proto), 'the protocol states the one-greeting budget (the API-call FLOOR)');
    ok(proto.indexOf('which of your values are visible in this stage') === -1,
        'the per-stage MENU ask is gone from the protocol (§30 — the shape §18 rules against)');
    ok(/t === 'cw_step_8' \? _cwPlotValuesCtl/.test(SRC),
        'the start-miss fallback ladder has a cw_step_8 arm — the guard that was inert at .490');
    ok(/cw_step_8: _cwPlotValuesCtl/.test(SRC), 'the task→ctl maps carry cw_step_8');
    ok(/state\.task === 'cw_step_8' && _cwPlotValuesCtl\.active && _inboundIsAnswer/.test(SRC),
        'the dispatcher has the cw_step_8 inbound-answer arm');
    ok(/cwPlotValuesCtl: _cwPlotValuesCtl/.test(SRC), 'the controller is exported for boot resume');
    ok(/cw_step_8' && tp\.cwPlotValuesCtl\) tp\.cwPlotValuesCtl\.tryResume/.test(SRC),
        'boot resume calls tryResume() on it');
}

// ── 2. THE FULL WALK — their words, stage → beat → write-appends, zero API calls ─────────────
{
    const w = world();
    w.ctl.onReply('Right — let’s check the story shows it.\n\n@CW8_START');
    await settle(); await settle(); await settle();
    ok(w.bubbles.length >= 1, 'the walk said something after @CW8_START (liveness at the hand-over)');
    ok(/does your story actually SHOW it/.test(w.bubbles[0] || ''), 'orientation chunk 1 carries the derived marker phrase');
    ok(!/Values Map|separate table/i.test(w.bubbles.join('\n')), 'nothing anywhere promises a map table (#364)');
    tapThroughPacing(w);

    // trait 1 (creativity) — the one-tap no-show
    ok(/trait 1 of 3/.test(w.bubbles.join('\n')), 'the first ask is trait 1 of 3 (roster-derived, serial §18)');
    {
        const before = w.bubbles.length;
        const chip = chipNamed(w, CW8_NO_SHOW);
        ok(!!chip, 'the no-show chip is offered on the trait ask');
        w.tap(chip);
        ok(w.bubbles.length > before || w.chips().length > 0, 'no-show advanced the walk in ONE tap (§30.3)');
        ok(_cw8NoShowHas(w.rows.get(CW8_NOTYET_FID), 'Creativity'),
            'the no-show left a footprint in the build-list row (resume cannot re-ask it)');
    }

    // trait 2 (bravery) — their words shown, then stage → beat → write → APPEND
    tapThroughPacing(w);
    const askText = w.bubbles.slice(-1)[0] || '';
    ok(/Bravery/.test(askText), 'trait 2 (Bravery) is asked next, in roster order');
    ok(/Your own words from Step 7/.test(askText) && /speaks in the hall/.test(askText),
        '#364: the ask SHOWS the student what they wrote in Step 7');
    {
        const st = chipNamed(w, STAGE1);
        ok(!!st, 'stage chip "' + STAGE1 + '" offered (single tap — one choice among alternatives, §4c.8b)');
        w.tap(st);
        const bc = chipNamed(w, BEAT1);
        ok(!!bc, 'beat chip "' + BEAT1 + '" offered for the picked stage');
        w.tap(bc);
        const writeAsk = w.bubbles.slice(-1)[0] || '';
        ok(/Your beat says:/.test(writeAsk) && /their beat text for/.test(writeAsk),
            'the write ask QUOTES the student’s own beat');
        ok(/added\s+\*\*underneath the beat\*\*|added \*\*underneath/i.test(writeAsk),
            'the write ask states the append-not-overwrite contract (§29)');
        const beatFid = _cw6RowFieldId(K, ARCH[K].sections[0].id, ARCH[K].sections[0].criteria.filter((c) => c.beatType !== 'turning-point' && c.beatType !== 'marker')[0].id);
        const beatBefore = w.rows.get(beatFid);
        w.say('She hides the letter instead of reading it aloud.');
        const beatAfter = w.rows.get(beatFid);
        ok(beatAfter.indexOf(beatBefore) === 0 && /Values \(Bravery\): She hides the letter/.test(beatAfter),
            '#364 core: the line APPENDED under the beat, labelled — never a separate table, never an overwrite');
        ok(_cw8BeatHasTrait(beatAfter, 'Bravery'), 'the append doubles as the trait’s footprint');
        // the "another beat?" offer, then decline
        const more = w.chips().filter((c) => /Another beat/.test(String(c.textContent)))[0];
        ok(!!more, 'after the append the walk offers another beat (a trait usually shows in more than one)');
        const next = w.chips().filter((c) => /Next/.test(String(c.textContent)))[0];
        ok(!!next, '…and the way on');
        w.tap(next);
    }

    // trait 3 (kindness — the WANT trait) — must be asked (FIXLIST #249)
    tapThroughPacing(w);
    ok(/Kindness/.test(w.bubbles.slice(-2).join('\n')), 'the CW7_WANT trait IS asked (#249)');
    ok(/build list/.test(w.bubbles.slice(-2).join('\n')), 'the WANT trait’s ask names the build-list framing');
    w.tap(chipNamed(w, CW8_NO_SHOW));

    // no unflagged trait was ever asked
    const askHeads = w.bubbles.filter((b) => /trait \d+ of \d+ you flagged/.test(b)).join('\n');
    UNFLAGGED.forEach((t) => {
        ok(askHeads.indexOf('**' + _cw7TraitLabel(t) + '**') === -1,
            'unflagged trait "' + t + '" was never asked (a Not-explored trait must not be)');
    });

    // ── continuity, then the wrap ──
    ok(/read-through|contradictions/.test(w.bubbles.slice(-2).join('\n')), 'the continuity pass is asked once, at the end');
    w.say('Nothing — it holds together.');
    ok((w.rows.get(CW8_CONTINUITY_FID) || '').indexOf('holds together') !== -1, 'the continuity answer filed');
    const wrap = w.bubbles.slice(-2).join('\n');
    ok(/Lens 1 of 7/.test(wrap), 'the wrap closes on the PROCESS goal (§29: "Lens 1 of 7 built in")');
    ok(/Not in the story yet/.test(wrap), 'the wrap points at the build list');
    ok(/sim endpoint/.test(wrap), 'the walk ends on the shared endpoint (v7.20.337)');
    ok(w.chips().length > 0, 'the finished walk still offers a way back in (add more to a trait)');

    // ── the budget: ZERO API calls in the whole walk ──
    ok(w.sends.length === 0, 'API ceiling: the walk spent ' + w.sends.length + ' calls — it must spend ZERO');
    ok(!w.lostWrite, 'no write targeted a row that does not exist (lost: ' + w.lostWrite + ')');
}

// ── 3. RESUME — from the beats themselves, repeats nothing ───────────────────────────────────
{
    // A student who no-showed trait 1 and appended for trait 2, then reloaded.
    const beatFid = BEAT_FIDS[0];
    const pre = {};
    pre[CW8_NOTYET_FID] = _cw8NoShowLine('Creativity');
    pre[beatFid] = 'their beat text\n' + _cw8AppendLine('Bravery', 'she speaks at last');
    const history = [{ role: 'assistant', content: 'This step asks a harder question: **does your story actually SHOW it?**', durable: true, why: 'fixture orientation' }];
    const w = world({ prefill: pre, history });
    const resumed = w.ctl.tryResume();
    ok(resumed === true, 'tryResume resumes a doc that carries the walk rows');
    await settle(); await settle(); await settle();
    const said = w.bubbles.join('\n');
    ok(/Kindness/.test(said), 'resume lands on the FIRST uncovered trait (trait 3), derived from the appends + build list');
    ok(!/trait 1 of 3/.test(said), 'resume does not re-ask a covered trait');
    ok(w.sends.length === 0, 'resume spends no API calls');
}

// ── 4. THE .491 VALUES MAP IS DROPPED ON ARRIVAL (the drop-heal) ─────────────────────────────
{
    ok(/function dropLegacyMap/.test(SRC), 'the drop-heal exists');
    ok(/cw-step-8-map-/.test(SRC.slice(SRC.indexOf('function dropLegacyMap'), SRC.indexOf('function dropLegacyMap') + 2000)),
        'it targets the .491 map rows');
    ok(new RegExp('CW8_LEDGER_FID').test(SRC.slice(SRC.indexOf('function dropLegacyMap'), SRC.indexOf('function dropLegacyMap') + 2000)),
        'it targets the .491 ledger row');
    ok(/SURVIVED the drop/.test(SRC), 'and it VERIFIES its own work (the .370 lesson) rather than trusting the delete count');
}

// ── 5. THE GUARDS — refused, with a way forward (§4d) ────────────────────────────────────────
{
    // No Step-6 outline at all: every beat row absent.
    const w = makeWorld(CTL_SRC, {
        task: 'cw_step_8',
        fids: WALK_FIDS,
        history: [{ role: 'user', content: _cwDepTag('universal_values') + '\n\n' + AUDIT_HTML, durable: true, why: 'fixture prime' }],
        ok,
        extraDeps: {
            TRAIT_TEACH, CW7_VALUES, CW7_STATES, _cw7TraitLabel, _cw7TraitCtlId,
            _cw8MapRowFieldId, CW8_LEDGER_FID, CW8_CONTINUITY_FID, CW8_NOTYET_FID, CW8_NO_SHOW,
            _cw8ParseValuesAudit, _cw8EnumerateBeats, _cw8BeatSegment,
            _cw8AppendLine, _cw8BeatHasTrait, _cw8NoShowLine, _cw8NoShowHas,
            _cwDepTag, outlineRowHTML, _migrationActive: false,
            _openCw7TraitPanel: function () { return true; },
        },
    });
    w.ctl.onReply('@CW8_START');
    await settle(); await settle(); await settle();
    ok(/hasn’t been built yet/.test(w.bubbles.join('\n')), 'no-outline guard names the problem and the way back (Step 6)');
    ok(w.chips().length > 0, 'the guard leaves a chip — never a dead screen (§4d)');
    ok(w.ctl.atStart() === false, 'after the guard, atStart() is false — the start-miss fallback cannot re-fire the guard on every idle reply');
}

// ── 6. MARKER TOLERANCE — the model escapes the underscore sometimes ─────────────────────────
{
    const w = world();
    w.ctl.onReply('Here we go.\n\n@CW8\\_START');
    await settle(); await settle(); await settle();
    ok(w.bubbles.length >= 1, 'an escaped @CW8\\_START still starts the walk (the norm line)');
}

console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
if (fail) { console.error('❌ cw8-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw8-sim-harness passed (#364 shape: their words shown, stage → beat → write, appends ARE the state, zero API calls).');
}

main().catch((e) => { console.error('❌ cw8-sim-harness crashed:', e && e.stack || e); process.exit(1); });
