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
 * What this walk needed its own gate for:
 *  1. The ROSTER IS DERIVED — flagged traits only (real condition at begin OR end, or on the
 *     build list). Asking an unflagged trait, or skipping a CW7_WANT trait, is a walk that
 *     contradicts the student's own Step 7 (§30; FIXLIST #249).
 *  2. "Doesn't show anywhere yet" must cost EXACTLY ONE TAP and leave a document footprint —
 *     an answer with no footprint makes a document-derived walk re-ask it for ever (.421).
 *  3. Only TAGGED beats reach amalgamation (§30: the beats nobody tagged were never claimed
 *     to express this lens).
 *  4. API budget: this walk spends ZERO calls (`sends.length === 0`), and the FLOOR is the
 *     protocol's one greeting — asserted against the protocol file itself, so a later
 *     "programmatic-first" pass cannot drive the step to zero turns while every negative
 *     assertion still passes (feedback_negative_only_tests_pass_on_a_dead_screen).
 *  5. The .490 incident class: the marker, the controller and the start-miss fallback arm must
 *     all exist together — a marker with no controller put a dead Step 8 on production.
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
const _cw8ComposeMapEntry = fnFrom('_cw8ComposeMapEntry', { _cw8BeatSegment });
const _cw8ParseMapEntry = fnFrom('_cw8ParseMapEntry', { _cw8BeatSegment });
const _cw8LedgerLine = fnFrom('_cw8LedgerLine', { _cw8BeatSegment });
const _cw8LedgerHas = fnFrom('_cw8LedgerHas', { _cw8BeatSegment });

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
        '<p>Bravery — she watches and says nothing.</p>'),
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
    const kind = roster.filter((r) => r.trait === 'kindness')[0];
    ok(kind && kind.wanted && kind.cond === 'In deficit', 'parser: a CW7_WANT trait IS flagged, as In deficit (FIXLIST #249)');
    ok(!roster.some((r) => r.trait === 'humour'), 'parser: an untouched trait is NOT flagged');
    // Byte-pair: compose → parse round-trips against the real beat population.
    const world0 = { beats: [{ fid: BEAT_FIDS[0], stage: 0, stageLabel: ARCH[K].sections[0].label, label: 'X' }] };
    const line = _cw8ComposeMapEntry('Bravery', 'In deficit', world0.beats);
    const back = _cw8ParseMapEntry(line, world0.beats);
    ok(back.answered && !back.noShow && back.beats.length === 1, 'map entry round-trips compose → parse');
    const noline = _cw8ComposeMapEntry('Bravery', 'In deficit', []);
    ok(_cw8ParseMapEntry(noline, world0.beats).noShow, 'no-show entry round-trips');
}

// ── THE WORLD ────────────────────────────────────────────────────────────────────────────────
const MAP_FIDS = EXPECTED.map(_cw8MapRowFieldId);
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
        fids: MAP_FIDS.concat([CW8_LEDGER_FID, CW8_CONTINUITY_FID]),
        prefill,
        history,
        ok,
        extraDeps: {
            TRAIT_TEACH, CW7_VALUES, CW7_STATES,
            _cw7TraitLabel, _cw7TraitCtlId,
            _cw8MapRowFieldId, CW8_LEDGER_FID, CW8_CONTINUITY_FID, CW8_NO_SHOW,
            _cw8ParseValuesAudit, _cw8EnumerateBeats, _cw8ComposeMapEntry, _cw8ParseMapEntry,
            _cw8BeatSegment, _cw8LedgerLine, _cw8LedgerHas,
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
// Tag one trait: either the one-tap no-show, or stage → beats.
function tagTrait(w, mode) {
    tapThroughPacing(w);
    if (mode === 'noshow') {
        const before = w.bubbles.length;
        const chip = chipNamed(w, CW8_NO_SHOW);
        if (!ok(!!chip, 'the no-show chip is offered on the tag ask')) return false;
        w.tap(chip);
        ok(w.bubbles.length > before || w.chips().length > 0, 'no-show advanced the walk in ONE tap (§30.3)');
        return true;
    }
    // pick the first stage that has beats
    const stageLabel = ARCH[K].sections[0].label;
    const st = chipNamed(w, stageLabel);
    if (!ok(!!st, 'stage chip "' + stageLabel + '" offered')) return false;
    w.tap(st);                                    // toggle
    const cont = w.chips().filter(isContinue)[0];
    if (!ok(!!cont, 'multi-select carries a Continue')) return false;
    w.tap(cont);
    // now this stage's beat chips
    const beatLabel = ARCH[K].sections[0].criteria.filter((c) => c.beatType !== 'turning-point' && c.beatType !== 'marker')[0].label;
    const bc = chipNamed(w, beatLabel);
    if (!ok(!!bc, 'beat chip "' + beatLabel + '" offered for the picked stage')) return false;
    w.tap(bc);
    const cont2 = w.chips().filter(isContinue)[0];
    if (!ok(!!cont2, 'beat multi-select carries a Continue')) return false;
    w.tap(cont2);
    return true;
}

async function main() {

// ── 1. THE FLOOR AND THE .490 INCIDENT CLASS — marker · controller · fallback arm ────────────
{
    const proto = fs.readFileSync(path.join(ROOT, 'protocols', 'shared', 'creative-writing', 'CW-STEP-08-update-plot-values.md'), 'utf8');
    ok(proto.indexOf('@CW8_START') !== -1, 'the protocol hands over on @CW8_START');
    ok(/ONE API call/i.test(proto), 'the protocol states the one-greeting budget (the API-call FLOOR)');
    ok(proto.indexOf('which of your values are visible in this stage') === -1,
        'the per-stage MENU ask is gone from the protocol (§30 — the shape §18 rules against)');
    ok(/cw_step_8'\s*\?\s*_cwPlotValuesCtl/.test(SRC.replace(/\n/g, ' ')) || /t === 'cw_step_8' \? _cwPlotValuesCtl/.test(SRC),
        'the start-miss fallback ladder has a cw_step_8 arm — the guard that was inert at .490');
    ok(/cw_step_8: _cwPlotValuesCtl/.test(SRC), 'the task→ctl maps carry cw_step_8');
    ok(/state\.task === 'cw_step_8' && _cwPlotValuesCtl\.active && _inboundIsAnswer/.test(SRC),
        'the dispatcher has the cw_step_8 inbound-answer arm');
    ok(/cwPlotValuesCtl: _cwPlotValuesCtl/.test(SRC), 'the controller is exported for boot resume');
    ok(/cw_step_8' && tp\.cwPlotValuesCtl\) tp\.cwPlotValuesCtl\.tryResume/.test(SRC),
        'boot resume calls tryResume() on it');
}

// ── 2. THE FULL WALK — roster-driven, serial, zero API calls ─────────────────────────────────
{
    const w = world();
    w.ctl.onReply('Right — let’s check the story shows it.\n\n@CW8_START');
    await settle(); await settle(); await settle();
    // orientation: paced chunks, marker in chunk 1
    ok(w.bubbles.length >= 1, 'the walk said something after @CW8_START (liveness at the hand-over)');
    ok(/does your story actually SHOW it/.test(w.bubbles[0] || ''), 'orientation chunk 1 carries the derived marker phrase');
    tapThroughPacing(w);

    // trait 1 (creativity) — the one-tap no-show
    ok(/trait 1 of 3/.test(w.bubbles.join('\n')), 'the first tag ask is trait 1 of 3 (roster-derived, serial §18)');
    ok(tagTrait(w, 'noshow'), 'trait 1 tagged as no-show');
    const mapRow1 = w.rows.get(_cw8MapRowFieldId('creativity')) || '';
    ok(/doesn’t show anywhere yet/.test(mapRow1), 'the no-show left a DOCUMENT footprint (resume cannot re-ask it)');

    // trait 2 (bravery) — stage → beats
    tapThroughPacing(w);
    ok(/Bravery/.test(w.bubbles.join('\n')), 'trait 2 (Bravery) is asked next, in roster order');
    ok(tagTrait(w, 'beats'), 'trait 2 tagged into a real beat');
    const mapRow2 = w.rows.get(_cw8MapRowFieldId('bravery')) || '';
    ok(/shows in: /.test(mapRow2), 'the beat tag landed in the trait’s map row');

    // trait 3 (kindness — the WANT trait) — must be asked (FIXLIST #249)
    tapThroughPacing(w);
    ok(/Kindness/.test(w.bubbles.slice(-3).join('\n')), 'the CW7_WANT trait IS asked (#249)');
    ok(/build list/.test(w.bubbles.slice(-3).join('\n')), 'the WANT trait’s ask names the build-list framing');
    ok(tagTrait(w, 'noshow'), 'trait 3 tagged');

    // no unflagged trait was ever asked
    const askHeads = w.bubbles.filter((b) => /trait \d+ of \d+ you flagged/.test(b)).join('\n');
    UNFLAGGED.forEach((t) => {
        ok(askHeads.indexOf('**' + _cw7TraitLabel(t) + '**') === -1,
            'unflagged trait "' + t + '" was never asked (a Not-explored trait must not be)');
    });

    // ── CDO phase: exactly the tagged beats, each with a keep-as-is escape ──
    tapThroughPacing(w);
    const tagged = _cw8ParseMapEntry(mapRow2, _cw8EnumerateBeats(w.deps.canvasEditor).beats).beats;
    ok(tagged.length === 1, 'exactly ONE beat was tagged in this run');
    ok(/Your beat says:/.test(w.bubbles.slice(-2).join('\n')), 'the CDO ask quotes the student’s own beat');
    const beatRowBefore = w.rows.get(tagged[0].fid);
    w.say('She hides the letter instead of reading it aloud.');
    const beatRowAfter = w.rows.get(tagged[0].fid);
    ok(beatRowAfter.indexOf(beatRowBefore) === 0 && /Values \(/.test(beatRowAfter),
        'the rewrite APPENDED under the beat, labelled — never overwrote (§29, Neil 2026-08-05)');
    const ledger = w.rows.get(CW8_LEDGER_FID) || '';
    ok(_cw8LedgerHas(ledger, tagged[0]), 'the worked beat left a ledger footprint');

    // ── continuity, then the wrap ──
    ok(/read-through|contradictions/.test(w.bubbles.slice(-2).join('\n')), 'the continuity pass is asked once, at the end');
    w.say('Nothing — it holds together.');
    ok((w.rows.get(CW8_CONTINUITY_FID) || '').indexOf('holds together') !== -1, 'the continuity answer filed');
    const wrap = w.bubbles.slice(-2).join('\n');
    ok(/Lens 1 of 7/.test(wrap), 'the wrap closes on the PROCESS goal (§29: "Lens 1 of 7 built in")');
    ok(/Creativity/.test(wrap), 'the wrap names the no-show traits as what the next drafts must add');
    ok(/sim endpoint/.test(wrap), 'the walk ends on the shared endpoint (v7.20.337)');
    ok(w.chips().length > 0, 'the finished walk still offers a way back in (re-tag)');

    // ── the budget: ZERO API calls in the whole walk ──
    ok(w.sends.length === 0, 'API ceiling: the walk spent ' + w.sends.length + ' calls — it must spend ZERO');
    ok(!w.lostWrite, 'no write targeted a row that does not exist (lost: ' + w.lostWrite + ')');
}

// ── 3. RESUME — from the document, repeats nothing ───────────────────────────────────────────
{
    // A student who tagged trait 1 (no-show) and reloaded mid-walk.
    const pre = {};
    pre[_cw8MapRowFieldId('creativity')] = _cw8ComposeMapEntry('Creativity', 'In excess', []);
    const history = [{ role: 'assistant', content: 'This step asks a harder question: **does your story actually SHOW it?**', durable: true, why: 'fixture orientation' }];
    const w = world({ prefill: pre, history });
    const resumed = w.ctl.tryResume();
    ok(resumed === true, 'tryResume resumes a doc that carries walk rows');
    await settle(); await settle(); await settle();
    const said = w.bubbles.join('\n');
    ok(/Bravery/.test(said), 'resume lands on the FIRST untagged trait (trait 2), derived from the document');
    ok(!/Creativity.*trait 1 of 3/.test(said), 'resume does not re-ask the trait whose map row is filled');
    ok(!/does your story actually SHOW it\?\*\*$/m.test(w.bubbles[0] || ''), 'resume does not re-narrate the orientation (it is in the transcript)');
    ok(w.sends.length === 0, 'resume spends no API calls');
}

// ── 4. THE GUARDS — refused, with a way forward (§4d) ────────────────────────────────────────
{
    // No Step-6 outline at all: every beat row absent.
    const w = makeWorld(CTL_SRC, {
        task: 'cw_step_8',
        fids: MAP_FIDS.concat([CW8_LEDGER_FID, CW8_CONTINUITY_FID]),
        history: [{ role: 'user', content: _cwDepTag('universal_values') + '\n\n' + AUDIT_HTML, durable: true, why: 'fixture prime' }],
        ok,
        extraDeps: {
            TRAIT_TEACH, CW7_VALUES, CW7_STATES, _cw7TraitLabel, _cw7TraitCtlId,
            _cw8MapRowFieldId, CW8_LEDGER_FID, CW8_CONTINUITY_FID, CW8_NO_SHOW,
            _cw8ParseValuesAudit, _cw8EnumerateBeats, _cw8ComposeMapEntry, _cw8ParseMapEntry,
            _cw8BeatSegment, _cw8LedgerLine, _cw8LedgerHas,
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

// ── 5. MARKER TOLERANCE — the model escapes the underscore sometimes ─────────────────────────
{
    const w = world();
    w.ctl.onReply('Here we go.\n\n@CW8\\_START');
    await settle(); await settle(); await settle();
    ok(w.bubbles.length >= 1, 'an escaped @CW8\\_START still starts the walk (the norm line)');
}

console.log('   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
if (fail) { console.error('❌ cw8-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw8-sim-harness passed (trait-first walk: roster-derived, one-tap no-show, tagged-beats-only CDO, zero API calls).');
}

main().catch((e) => { console.error('❌ cw8-sim-harness crashed:', e && e.stack || e); process.exit(1); });
