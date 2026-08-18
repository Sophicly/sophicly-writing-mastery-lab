#!/usr/bin/env node
/* eslint-env node */
/**
 * cw8-sim-harness.js — BEHAVIOURAL gate for the CW Step-8 values walk
 * (v7.20.519 — THE INTERFACE, FIXLIST #374/#374a/#374b; PEDAGOGY §29 + §30).
 *
 * Slices the REAL `_cwPlotValuesCtl` and the REAL module helpers out of wml-assessment.js and
 * drives them on the shared rig (walk-sim-lib) — never re-typed copies (§14c: a check that
 * duplicates its subject tests its own memory). The Step-7 audit arrives exactly the way the
 * product delivers it: as a saved-document HTML string whose rows carry baked `data-check-state`,
 * built here with the SAME producers the document builder uses. The ISLAND is MODELLED, not
 * stubbed: the sim captures the real bridge props and calls the real `onPort`, so what is tested
 * is the shipped port path.
 *
 * WHAT THIS GATE IS FOR — each line was proven RED by injecting the real defect:
 *  1. ⭐⭐ THE PORT APPENDS, NEVER REPLACES (#374b). The fixture's beats already hold the
 *     student's own words, because that is the NORMAL case; the ported line must land underneath
 *     them and NOT ONE write may carry {replace:true}. (Injected: replace → 4 assertions fail.)
 *  2. ⭐ A RE-PORT IS IDEMPOTENT, by PROVENANCE. Tapping the same beat twice files nothing new —
 *     and that still holds after the student edits around the ported line, which a plain
 *     string-equality guard would miss. (Injected: guard removed → 3 fail.)
 *  3. ⭐ EMPTY BEATS REACH THE INTERFACE. Most students have not finished Step 6, so gap-filling
 *     is half the step; one fixture beat is deliberately blank. (Injected: empties filtered → 2 fail.)
 *  4. ⭐ THE BAND SPLIT IS READ OFF STEP 7. A trait marked only at the beginning offers Stages
 *     I–III only — that halving IS the cure for the measured overwhelm (97–108 beats per
 *     template). Asserted for ALL EIGHT archetypes, not just the fixture's. (Injected: both
 *     bands always → 1 fail.)
 *  5. ⭐ THE LEDGER IS THE TRUTH, THE ROW IS NOT (the Step-9 ROOT-A lesson). Resume finds the
 *     unrefined ported line from `cw8_values_state`, never from "does this row have text" — in a
 *     world where every row legitimately has text.
 *  6. The ROSTER IS DERIVED — flagged traits only, carrying the student's OWN Step-7 words (#364).
 *  7. "Doesn't show anywhere yet" costs ONE TAP and leaves a footprint (.421) — and so does
 *     "leave as is", or the refine pass would re-ask it for ever.
 *  8. API budget: ZERO calls, with the protocol's one greeting as the FLOOR, asserted against the
 *     protocol file itself (feedback_negative_only_tests_pass_on_a_dead_screen).
 *  9. The .490 incident class: marker, controller and start-miss arm must exist together.
 * 10. The .491 Values Map table is DROPPED from documents that got it (the drop-heal).
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
const _cw8BandOf = fnFrom('_cw8BandOf');
const _cw8StageRoman = fnFrom('_cw8StageRoman');
// v7.20.535 (#396): the template walk moved into _cwPlotAssemble so the plot panel could read the
// SAME beats from saved HTML. Sliced separately here for the same reason everything else is —
// re-typing it would make this gate test its own memory (§14c).
const _cwPlotAssemble = fnFrom('_cwPlotAssemble', {
    OUTLINE_CRITERIA, _cw6RowFieldId, _cw8BandOf, _cw8StageRoman,
});
const _cw8EnumerateBeats = fnFrom('_cw8EnumerateBeats', {
    detectBuiltPlotSlug, _cwNodeText, _cwPlotAssemble,
});
const _cw8BeatSegment = fnFrom('_cw8BeatSegment');
const _cw8AppendLine = fnFrom('_cw8AppendLine');
const _cw8BeatHasTrait = fnFrom('_cw8BeatHasTrait');
const _cw8NoShowLine = fnFrom('_cw8NoShowLine');
const _cw8NoShowHas = fnFrom('_cw8NoShowHas');
// v7.20.519 (#374) — the interface layer's own producers, sliced like everything else.
// (_cw8BandOf / _cw8StageRoman are sliced above: _cw8EnumerateBeats calls them.)
const _cw8BandsFor = fnFrom('_cw8BandsFor', { CW7_STATES });
const _cw8PortText = fnFrom('_cw8PortText');
const _cw8PortKey = fnFrom('_cw8PortKey', { _cw7TraitCtlId });
const _cw8ReplaceTraitLines = fnFrom('_cw8ReplaceTraitLines', { _cw8AppendLine });
const CW8_BANDS = evalAfter('const CW8_BANDS =', '{', '}');
ok(CW8_BANDS.begin.sub === 'Stages I–III' && CW8_BANDS.end.sub === 'Stages IV–VI',
    'CW8_BANDS carries the labels Neil dictated');

// ⭐ THE 6-STAGE ASSUMPTION THE BAND SPLIT RESTS ON, asserted against EVERY shipped template —
// not against the one the fixture happens to use. "Stages I–III / IV–VI" is only the right split
// while a template has six sections, and the derivation (`si < ceil(total/2)`) is only equivalent
// to Neil's wording at six. A ninth archetype with five stages would silently re-band the plot.
Object.keys(ARCH).forEach((k) => {
    ok(ARCH[k].sections.length === 6, 'archetype "' + k + '" has 6 stages (got ' + ARCH[k].sections.length + ') — the band split depends on it');
    ok(_cw8BandOf(0, 6) === 'begin' && _cw8BandOf(2, 6) === 'begin' && _cw8BandOf(3, 6) === 'end' && _cw8BandOf(5, 6) === 'end',
        'the band split is I,II,III → beginning and IV,V,VI → end');
    ok(/^[IVX]+$/.test(_cw8StageRoman(ARCH[k].sections[3].label, 3)),
        'stage ' + k + ' IV presents a roman numeral read off the real template label');
});

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
console.log('CW STEP-8 VALUES INTERFACE — behavioural sim (real _cwPlotValuesCtl + real bridge)');
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
// ⭐ ONE BEAT IS DELIBERATELY EMPTY. Neil, #374: *"most of the students have not finished step
// six… many haven't even finished stage one"* — so a beat with no text is the COMMON case now,
// and the interface has to offer it. A fixture where every row is filled would let a build that
// silently hides empty beats pass every assertion.
const EMPTY_FID = BEAT_FIDS[3];

// The island, MODELLED not stubbed (§2b — a rig that skips the mechanism proves nothing about
// it). It captures the props the bridge hands over, and exposes the two callbacks the real
// component fires, so the sim drives the SHIPPED port path rather than a re-typed copy of it.
const island = { props: null, port: null, close: null, mounted: 0 };
let ledgerStore = null;
function world(opts) {
    opts = opts || {};
    island.props = null; island.port = null; island.close = null;
    ledgerStore = opts.ledger ? JSON.parse(JSON.stringify(opts.ledger)) : {};
    const prefill = Object.assign({}, opts.prefill || {});
    // Every beat row carries the student's own text (the seed copies their Step-6 outline)…
    BEAT_FIDS.forEach((f) => { if (!(f in prefill)) prefill[f] = 'their beat text for ' + f; });
    // …except the one they have not reached yet.
    if (!(EMPTY_FID in (opts.prefill || {}))) prefill[EMPTY_FID] = '';
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
        extraDeps: Object.assign(simDeps(), opts.extraDeps || {}),
        // While the plot interface is mounted, IT is the live screen — the chat legitimately has
        // no chip. The rig still checks liveness everywhere else, and §2 asserts that CLOSING the
        // interface lands the student on a live chat screen, which is where this can break.
        externalSurface: function () { return !!island.props; },
    }, opts.worldOpts || {}));
    // The artifact store and the island both need the rows map, which only exists once the world
    // is built — so they are wired here rather than inside simDeps().
    wireBridge(w);
    return w;
}
// The walk-specific stubs, in one place so the guard-path world (§5) cannot drift from the main
// one — a rig with two hand-maintained dependency lists is a rig that tests two products.
function simDeps() {
    return {
        TRAIT_TEACH, CW7_VALUES, CW7_STATES,
        _cw7TraitLabel, _cw7TraitCtlId,
        _cw8MapRowFieldId, CW8_LEDGER_FID, CW8_CONTINUITY_FID, CW8_NOTYET_FID, CW8_NO_SHOW,
        _cw8ParseValuesAudit, _cw8EnumerateBeats, _cw8BeatSegment,
        _cw8AppendLine, _cw8BeatHasTrait, _cw8NoShowLine, _cw8NoShowHas,
        _cw8BandOf, _cw8StageRoman, _cw8BandsFor, _cw8PortText, _cw8PortKey,
        _cw8ReplaceTraitLines, CW8_BANDS,
        _cwDepTag, outlineRowHTML, _migrationActive: false,
        _openCw7TraitPanel: function () { return true; },
        // ⚠️ LATE-BOUND VIA `CURRENT`, deliberately: the controller closes over the BINDING, so a
        // dep that needs the world's own rows cannot be assigned after makeWorld returns. It has
        // to be passed at construction and resolve the world at CALL time.
        _cwWriteOutlineRowLines: function (fid, lines) {
            const w = CURRENT;
            if (!w || !w.rows.has(fid)) { if (w) w.lostWrite = fid; return false; }
            w.rows.set(fid, lines.join('\n'));
            return true;
        },
    };
}
let CURRENT = null;
function wireBridge(w) {
    CURRENT = w;
    // ── the project artifact store, MODELLED: the ledger is real state that must round-trip ──
    w.deps.WML.cwProject = {
        loadArtifact: function (pid, key) {
            return Promise.resolve(key === 'cw8_values_state'
                ? { success: true, value: JSON.stringify(ledgerStore) }
                : { success: false });
        },
        saveArtifact: function (pid, key, val) {
            if (key === 'cw8_values_state') ledgerStore = JSON.parse(val);
            return Promise.resolve({ success: true });
        },
    };
    // ── the island: capture the props, expose the callbacks ──
    w.deps.window.WMLPlotIsland = {
        mount: function (o) {
            island.mounted++;
            island.props = o;
            island.port = function (payload) { return o.onPort(payload); };
            island.close = function () { island.props = null; o.onClose(); };
            return { unmount: function () {} };
        },
        unmount: function () {},
    };
}
// Every write the walk made that claimed the whole row. The port must NEVER appear here (#374b).
function writesWithReplace(w) { return (w.writes || []).filter((x) => x.replace); }
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

// ── 2. THE FULL WALK — interface → PORT (append!) → light refine, zero API calls ─────────────
{
    const w = world();
    w.ctl.onReply('Right — let’s check the story shows it.\n\n@CW8_START');
    await settle(); await settle(); await settle();
    ok(w.bubbles.length >= 1, 'the walk said something after @CW8_START (liveness at the hand-over)');
    ok(/does your story actually SHOW it/.test(w.bubbles[0] || ''), 'orientation chunk 1 carries the derived marker phrase');
    ok(!/Values Map|separate table/i.test(w.bubbles.join('\n')), 'nothing anywhere promises a map table (#364)');
    tapThroughPacing(w);

    // The orientation must state the two things #374b and #374a make load-bearing.
    const orient = w.bubbles.join('\n');
    ok(/Stages I–III/.test(orient) && /Stages IV–VI/.test(orient),
        'the orientation names the BEGINNING / END bands (Neil stated the labelling twice)');
    ok(/nothing you have written is replaced/i.test(orient),
        'the orientation states the append-not-replace contract BEFORE the student ports (#374b)');

    // ── the way in is a chip that opens the INTERFACE, not a stage maze ──
    const open = w.chips().filter((c) => /Choose my traits/.test(String(c.textContent)))[0];
    ok(!!open, 'the walk offers the interface (the stage→beat chip maze is gone)');
    ok(!chipNamed(w, STAGE1), 'no STAGE chip is offered in the chat any more (#374: 16–18 chips per stage was the defect)');
    w.tap(open);
    await settle();
    ok(!!island.props, 'the island mounted with its bridge props');

    // ── THE BRIDGE DATA — what the interface actually receives ──
    {
        const P = island.props;
        ok(P.traits.length === 3, 'traits = the 3 FLAGGED traits only, in roster order (got ' + P.traits.length + ')');
        ok(P.traits.map((t) => t.label).join('|') === 'Creativity|Bravery|Kindness',
            'trait order follows the roster — got ' + P.traits.map((t) => t.label).join('|'));
        const brav = P.traits.filter((t) => t.label === 'Bravery')[0];
        ok(/speaks in the hall/.test(brav.said), 'each trait carries the student’s OWN Step-7 words (#364)');
        ok(brav.portText === brav.said, 'THE PORT IS THEIR WORDS — no typing, nothing invented (#374a)');
        ok(brav.bands.join(',') === 'begin,end',
            'a trait marked at BOTH ends offers both halves of the plot — got ' + brav.bands.join(','));
        const crea = P.traits.filter((t) => t.label === 'Creativity')[0];
        ok(crea.bands.join(',') === 'begin',
            'a trait marked only at the BEGINNING offers Stages I–III only — the overwhelm fix (got ' + crea.bands.join(',') + ')');
        const kind = P.traits.filter((t) => t.label === 'Kindness')[0];
        ok(!!kind.portText && kind.portText.length > 0, 'a build-list trait still has something to port (never an empty line)');

        ok(P.stages.length === ARCH[K].sections.length, 'every stage reaches the interface (got ' + P.stages.length + ')');
        ok(P.stages.filter((s) => s.band === 'begin').length === 3
            && P.stages.filter((s) => s.band === 'end').length === 3,
            'the band split is 3 / 3 — Stages I–III vs IV–VI, derived from POSITION not wording');
        ok(P.bands.begin.sub === 'Stages I–III' && P.bands.end.sub === 'Stages IV–VI',
            'the band labels are the ones Neil dictated');
        const allBeats = P.stages.reduce((n, s) => n + s.beats.length, 0);
        ok(allBeats === BEAT_FIDS.length, 'every beat row reaches the interface (' + allBeats + ' of ' + BEAT_FIDS.length + ')');
        ok(P.stages[0].beats[0].text.length > 0, 'a beat carries its CURRENT text, so the student sees their own words');
        // ⭐ THE GAP-FILLING HALF (#374): an EMPTY beat must still be offered.
        ok(P.stages.some((s) => s.beats.some((b) => b.id === EMPTY_FID && b.text === '')),
            'an EMPTY beat is present and selectable — gap-filling needs no data change');
    }

    // ── THE PORT — and the assertion this whole build turns on (#374b) ──
    const beatFid = BEAT_FIDS[0];
    const beatBefore = w.rows.get(beatFid);
    ok(beatBefore.length > 0, 'the target beat ALREADY holds the student’s words (the NORMAL case, not the edge case)');
    await island.port({
        picks: [{ traitId: _cw7TraitCtlId('bravery'), trait: 'bravery', label: 'Bravery',
                  portText: 'she speaks in the hall', fids: [beatFid, EMPTY_FID] }],
        noShow: [_cw7TraitCtlId('creativity')],
    });
    {
        const after = w.rows.get(beatFid);
        ok(after.indexOf(beatBefore) === 0,
            '⭐ THE PORT APPENDS — the student’s existing words are still there, at the start, untouched (#374b)');
        /* ⭐⭐ THE BAND DECIDES THE WORDS (Neil, 2026-08-18, watching uid 1389). Bravery is a
           JOURNEY in this fixture — In deficit at the beginning ("she watches her brother take the
           blame and says nothing"), In balance at the end ("she speaks in the hall"). beatFid is an
           opening beat, so the BEGINNING words belong in it.
           ⚠️ This assertion used to demand the END words here, i.e. it CODIFIED the defect: Step 8
           collapsed the two Step-7 passes into one, end-preferred, and filed a sentence about who
           the protagonist BECOMES underneath a beat about who she IS. A check written from the
           behaviour rather than from the intent will happily lock the bug in. */
        ok(/Values \(Bravery\): she watches her brother take the blame and says nothing/.test(after),
            '⭐ a BEGINNING beat gets the student’s BEGINNING words, not the end-of-story ones');
        ok(!/she speaks in the hall/.test(after),
            '…and the end-of-story words are NOT in an opening beat');
        ok(!writesWithReplace(w).length,
            'NOT ONE write used {replace:true} — a port that replaces is the #374b defect (' + JSON.stringify(writesWithReplace(w)) + ')');
        ok(w.rows.get(EMPTY_FID) === _cw8AppendLine('Bravery', 'she watches her brother take the blame and says nothing.'),
            'an EMPTY beat is simply started by the port — gap-filling needs no special case');
        ok(_cw8NoShowHas(w.rows.get(CW8_NOTYET_FID), 'Creativity'),
            'the one-tap “doesn’t show anywhere yet” left its footprint on the build list (.421)');
    }

    // ── IDEMPOTENCE — porting the same trait into the same beat again cannot double-file ──
    {
        const before = w.rows.get(beatFid);
        await island.port({
            picks: [{ traitId: _cw7TraitCtlId('bravery'), trait: 'bravery', label: 'Bravery',
                      portText: 'she speaks in the hall', fids: [beatFid] }],
            noShow: [],
        });
        ok(w.rows.get(beatFid) === before,
            '⭐ a re-port is IDEMPOTENT — tapping the same beat twice files nothing new (#374b)');
        const occurrences = (w.rows.get(beatFid).match(/Values \(Bravery\)/g) || []).length;
        ok(occurrences === 1, 'exactly ONE ported line for that trait, not two (got ' + occurrences + ')');
    }
    // …and it holds even after the student EDITS around the ported line, which a plain
    // string-equality guard would miss.
    {
        w.rows.set(beatFid, w.rows.get(beatFid) + '\n\nand then she runs.');
        const before = w.rows.get(beatFid);
        await island.port({
            picks: [{ traitId: _cw7TraitCtlId('bravery'), trait: 'bravery', label: 'Bravery',
                      portText: 'she speaks in the hall', fids: [beatFid] }],
            noShow: [],
        });
        ok(w.rows.get(beatFid) === before,
            'idempotence is by PROVENANCE (the labelled line), so a student’s later edits cannot re-open the port');
    }

    // ── CLOSING THE PICKER HANDS OVER — in order, with a live screen (§4d) ──
    island.close();
    await settle(); await settle();
    const refine = w.bubbles.slice(-1)[0] || '';
    ok(/Values \(Bravery\)/.test(refine), 'the refine pass opens on a beat that was actually ported');
    ok(/their beat text|starts with/.test(refine), 'the refine ask shows the student their own beat');
    ok(/Steps 9 and 10/.test(refine),
        'the refine ask states that later steps carry the polish — DELIBERATELY LIGHT (#374a pedagogy note)');
    ok(w.chips().some((c) => /Leave as is/.test(String(c.textContent))),
        'leaving a line exactly as it is costs ONE TAP (§18: a no must be cheap)');

    // ── THE REFINE WRITE — replaces OUR machine line, never the student's prose ──
    {
        const before = w.rows.get(beatFid);
        w.say('She stands up in the hall and says the name out loud.');
        const after = w.rows.get(beatFid);
        ok(after.indexOf('their beat text') === 0,
            '⭐ the refine keeps the STUDENT’S prose at the top — only our own ported line is rewritten');
        ok(/and then she runs\./.test(after), '…and their later edits survive it too');
        ok(/Values \(Bravery\): She stands up in the hall/.test(after), 'their sentence replaced the ported line');
        ok(!/she speaks in the hall/.test(after),
            'the ported line is GONE, not stitched under the rewrite (the .289 bug, inverted)');
        ok(before !== after, 'the write actually landed');
    }

    // ── #380: THE WAY BACK IN, on every screen of the walk ────────────────────────────────
    // Neil's first end-to-end run: one trait, one beat, and then no door back to the
    // interface. The cause was the PHASE MACHINE — posOf() only returns `phase:'port'`
    // while `!anyWorked()`, so after the very first port the branch that offers the
    // interface is unreachable, and its own "Open my plot again →" label was written for
    // a state that could no longer occur. These assertions fail on that build.
    ok(chipNamed(w, 'Open my plot again →'),
        '⭐ #380: the refine screen offers the way back into the interface — a student who ported ONE '
        + 'beat must not be locked out of adding another until the whole refine queue is finished');
    if (chipNamed(w, 'Open my plot again →')) {
        // …and taking it must NOT settle the beat currently being refined: re-entry is not
        // an answer, and banking one would record "I refined it" for a line untouched.
        // (Guarded so the negative control REPORTS the missing door instead of crashing on
        // a tap with nothing to tap — a harness that dies mid-run hides the assertions after it.)
        // The beat the walk is asking about RIGHT NOW — captured from the ask itself, because
        // the check that matters is "is this same beat still owed a refine after I come back",
        // and that lives in the LEDGER, not in any row's text. An earlier draft of this block
        // compared row text instead and passed happily against an injected markDone() — a check
        // that duplicated its subject and therefore tested nothing.
        const askBefore = w.bubbles.slice(-1)[0] || '';
        const rowsBefore = BEAT_FIDS.map((f) => w.rows.get(f)).join(' ');
        const mountsBefore = island.mounted;
        w.tap(chipNamed(w, 'Open my plot again →'));
        await settle();
        ok(island.mounted === mountsBefore + 1 && !!island.props,
            '#380: tapping it actually re-mounts the interface (mounts ' + mountsBefore + ' → ' + island.mounted + ')');
        ok(BEAT_FIDS.map((f) => w.rows.get(f)).join(' ') === rowsBefore,
            '#380: re-entry files nothing and rewrites nothing');
        ok(w.sends.length === 0, '#380: and it costs no API call');
        island.close();
        await settle();
        ok(w.chips().length > 0, '§4d: closing it lands on a live screen, never a dead one');
        ok((w.bubbles.slice(-1)[0] || '') === askBefore,
            '⭐ #380: the SAME beat is still owed its refine — re-entry defers the question, it never '
            + 'banks it. Marking it done here would record "I refined this" for a line never touched.');
    }

    // ── the rest of the refine queue, then continuity, then the wrap ──
    for (let i = 0; i < 6 && w.chips().some((c) => /Leave as is/.test(String(c.textContent))); i++) {
        w.tap(w.chips().filter((c) => /Leave as is/.test(String(c.textContent)))[0]);
        await settle();
    }
    ok(/read-through|contradictions/.test(w.bubbles.slice(-2).join('\n')), 'the continuity pass is asked once, at the end');
    // #380: the continuity read-through is the screen most likely to surface "I should add
    // another trait" — reading the six stages in order is exactly what exposes the gap. The
    // typed ask stays armed alongside it, so this is an extra door, not a replacement.
    ok(chipNamed(w, 'Open my plot again →'),
        '#380: the continuity screen also offers the way back into the interface');
    w.say('Nothing — it holds together.');
    ok((w.rows.get(CW8_CONTINUITY_FID) || '').indexOf('holds together') !== -1, 'the continuity answer filed');
    const wrap = w.bubbles.slice(-2).join('\n');
    ok(/Lens 1 of 7/.test(wrap), 'the wrap closes on the PROCESS goal (§29: "Lens 1 of 7 built in")');
    ok(/Not in the story yet/.test(wrap), 'the wrap points at the build list');
    ok(/sim endpoint/.test(wrap), 'the walk ends on the shared endpoint (v7.20.337)');
    ok(w.chips().length > 0, 'the finished walk still offers a way back in (add more traits or beats)');

    // ── the budget: ZERO API calls in the whole walk ──
    ok(w.sends.length === 0, 'API ceiling: the walk spent ' + w.sends.length + ' calls — it must spend ZERO');
    ok(!w.lostWrite, 'no write targeted a row that does not exist (lost: ' + w.lostWrite + ')');
}

// ── 3. RESUME — the LEDGER is the truth, and the row is not (the Step-9 ROOT-A lesson) ───────
{
    // A student who ported two lines, refined neither, then reloaded. ⚠️ Every beat row in this
    // rig holds the student's OWN text — so a walk that decided "have they done this?" by asking
    // whether the row has content would skip the refine pass entirely. That is exactly the defect
    // that shipped in Step 9 (`transferDone()` probed for any text), and this fixture reproduces
    // its shape on purpose.
    const beatFid = BEAT_FIDS[0];
    const pre = {};
    pre[CW8_NOTYET_FID] = _cw8NoShowLine('Creativity');
    pre[beatFid] = 'their beat text\n' + _cw8AppendLine('Bravery', 'she speaks at last');
    const history = [{ role: 'assistant', content: 'This step asks a harder question: **does your story actually SHOW it?**', durable: true, why: 'fixture orientation' }];
    const saved = { ports: {} };
    saved.ports[beatFid + '::' + _cw7TraitCtlId('bravery')] = {
        fid: beatFid, traitId: _cw7TraitCtlId('bravery'), trait: 'bravery', traitLabel: 'Bravery',
        text: 'she speaks at last', at: '2026-08-15T00:00:00.000Z', machine: true, done: false,
    };
    const w = world({ prefill: pre, history, ledger: saved });
    const resumed = w.ctl.tryResume();
    ok(resumed === true, 'tryResume resumes a doc that carries the walk rows');
    await settle(); await settle(); await settle();
    const said = w.bubbles.join('\n');
    ok(/Values \(Bravery\): she speaks at last/.test(said),
        'resume lands on the UNREFINED ported line — read from the ledger, not from "does the row have text"');
    ok(!/Choose my traits/.test(said), 'resume does not send them back to the top of the interface');
    ok(w.sends.length === 0, 'resume spends no API calls');

    // A KEPT line is durable: "leave as is" must not be re-asked after a reload (.421).
    w.tap(w.chips().filter((c) => /Leave as is/.test(String(c.textContent)))[0]);
    await settle();
    ok(ledgerStore.ports[beatFid + '::' + _cw7TraitCtlId('bravery')].done === true,
        'a KEEP is recorded in the ledger — an answer with no footprint is re-asked for ever (.421)');
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
    ledgerStore = {};
    const w = makeWorld(CTL_SRC, {
        task: 'cw_step_8',
        fids: WALK_FIDS,
        history: [{ role: 'user', content: _cwDepTag('universal_values') + '\n\n' + AUDIT_HTML, durable: true, why: 'fixture prime' }],
        ok,
        extraDeps: simDeps(),   // ONE dependency list, shared — two hand-kept lists test two products
    });
    wireBridge(w);
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
console.log('✅ cw8-sim-harness passed (#374: interface → PORT that appends and is idempotent → light refine, zero API calls).');
}

main().catch((e) => { console.error('❌ cw8-sim-harness crashed:', e && e.stack || e); process.exit(1); });
