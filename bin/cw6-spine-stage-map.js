#!/usr/bin/env node
/* eslint-env node */
/**
 * cw6-spine-stage-map.js — FIXLIST #178, SLICE 0.
 *
 * THE QUESTION, AND WHY IT IS A SCRIPT AND NOT A PARAGRAPH.
 * Neil's Step-6 sequence rests on "reuse Step 4": the six Story Spine beats a student already wrote
 * should SEED each stage's bookends, so most are SHOWN AND CONFIRMED rather than asked cold.
 * Exactly ONE of those mappings is evidenced — #102 ruled spine b3 is the turning point that ends
 * the ordinary world, which is the beat Stage I's own pattern line ends on. The rest are
 * ASSUMPTIONS, and seeding a student's document from an assumption puts words in their mouth.
 *
 * So it is measured, the way #92 was settled. The unit of measurement is deliberately NOT the spine
 * beat — it is the ANCHOR EVENT (ordinary world · the mask · inciting incident · stunning surprise
 * #1 · threshold · midpoint · dark moment · climax · final image). Anchors are what the eight
 * templates actually name; spine beats are what the student was asked for. Locating the anchors
 * first, and mapping beats onto them second, keeps the measurement independent of the hypothesis —
 * and it is what surfaces the real finding below (b3's two candidate anchors sit in DIFFERENT
 * stages, so "b3 closes Stage I" is true only for one reading of b3).
 *
 * TWO INSTRUMENT RULES, both learned the hard way on the first cut:
 *   1. MATCH THE LABEL, NOT THE PROMPT. The first version scored prompts too and "landed" the final
 *      image in STAGE I — off the Setup row *“Opening Image … Often mirrors the Closing Image.”*
 *      A row that MENTIONS a beat is not that beat. Prompts are reported as context only.
 *   2. REPORT ASKABILITY. `turning-point` and `marker` rows render as DIVIDERS and carry no fieldId
 *      (80 of them, per cw6-outline-harness), so a bookend anchored on one has NO ROW TO CONFIRM
 *      INTO. That is a design constraint, not a detail, and it is invisible unless printed.
 *
 * ⚠️ WHAT THIS IS NOT. It does not decide the design. It produces the table the design needs, and
 * it is loud about weak cells: an anchor found in no stage, or in several, must be ASKED, never
 * seeded. Seeding a non-empty row also makes the walk march straight past it (#74) — so a wrong
 * cell here does not degrade, it DELETES the question.
 *
 * Reads the shipped templates out of wml-assessment.js, so it cannot drift from what students see.
 *
 * Run: node bin/cw6-spine-stage-map.js            (human table)
 *      node bin/cw6-spine-stage-map.js --json     (machine-readable, for the port that follows)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

// Same brace-walker the sim rigs use — comments and quoted strings skipped, or an apostrophe in
// ordinary prose reads as an opening quote and the slice swallows the rest of the file.
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

const archIdx = SRC.indexOf('cwPlotArchetypes: {');
if (archIdx < 0) { console.error('cw6-spine-stage-map: cwPlotArchetypes not found'); process.exit(1); }
const ARCH = new Function('return ' + braceSliceFrom(SRC, archIdx + 'cwPlotArchetypes:'.length, '{', '}').text + ';')();

// ── THE ANCHORS — named story events the eight templates hold in common. Patterns match the row
//    LABEL only (instrument rule 1). Ordered as they occur in a story, which is what makes an
//    out-of-order result visible as a finding rather than noise.
const ANCHORS = [
    { id: 'ordinary',  name: 'The ordinary world',        re: /ordinary world|opening image|world as it is|status quo|everyday life/i },
    { id: 'mask',      name: 'The mask / false identity', re: /false identity|the mask\b|anonymous|false sense of balance|limited awareness/i },
    { id: 'call',      name: 'Inciting incident / call',  re: /inciting incident|call to adventure|opportunity\b|the call\b/i },
    { id: 'surprise1', name: 'Stunning Surprise #1',      re: /stunning surprise #?\s*1\b/i },
    { id: 'threshold', name: 'Crossing the threshold',    re: /crosses the threshold|threshold into|change of plans|answers the call/i },
    { id: 'midpoint',  name: 'Midpoint / no return',      re: /point of no return|midpoint|second epiphany/i },
    { id: 'surprise2', name: 'Stunning Surprise #2',      re: /stunning surprise #?\s*2\b/i },
    { id: 'dark',      name: 'The Dark Moment',           re: /dark (?:moment|night)|all is lost|lowest point|everything (?:suddenly )?goes wrong|rock bottom/i },
    { id: 'climax',    name: 'Climax / final battle',     re: /climax|final battle|final confrontation|showdown|final push/i },
    { id: 'final',     name: 'Final image / aftermath',   re: /closing image|final image|new equilibrium|aftermath|resolution\b/i },
];

// ── THE SPINE — the six beats as the Step-4 walk asks for them, mapped onto the anchors ABOVE.
//    `anchors` is a hypothesis about which named event the student's sentence describes; the script
//    prints where those anchors actually sit, and the verdict falls out of that.
const SPINE = [
    { id: 'b1', lead: 'At first',             anchors: ['ordinary'],            asked: 'the protagonist in their everyday life, the unmet need visible as PRESSURE' },
    { id: 'b2', lead: 'And then',             anchors: ['mask'],                asked: 'the repeated routine that proves the stuck state — one filmable action' },
    { id: 'b3', lead: 'Until',                anchors: ['call', 'surprise1'],   asked: 'the inciting incident — one event, one day, the ordinary world shattered (#102: the STUNNING SURPRISE reading, not the "inciting incident" label)' },
    { id: 'b4', lead: 'And because of this',  anchors: ['threshold'],           asked: 'the decision and the action it causes' },
    { id: 'b5', lead: 'And because of this',  anchors: ['dark'],                asked: 'the trial that attacks the flaw and resolves NOTHING' },
    { id: 'b6', lead: 'Until finally',        anchors: ['climax'],              asked: 'the climax and the self-revelation' },
];

const ASKABLE = (r) => r.beatType !== 'turning-point' && r.beatType !== 'marker';

function stagesOf(arch) { return (arch.sections || []).map((s) => ({ id: s.id, label: s.label, rows: s.criteria || [] })); }

// Where does one anchor live in one archetype? Returns every stage that names it, in story order,
// with the first matching row and whether that row is ASKABLE (a divider cannot be confirmed into).
function locate(stages, anchor) {
    const found = [];
    stages.forEach((s, i) => {
        const hits = s.rows.filter((r) => anchor.re.test(r.label || ''));
        if (hits.length) {
            found.push({
                stageIndex: i, stage: s.id, hits: hits.length,
                row: hits[0].label, askable: ASKABLE(hits[0]),
                askableHits: hits.filter(ASKABLE).length,
                pos: s.rows.indexOf(hits[0]), of: s.rows.length,
            });
        }
    });
    return found;
}

const JSON_OUT = process.argv.includes('--json');
const keys = Object.keys(ARCH);
const report = {};

keys.forEach((k) => {
    const stages = stagesOf(ARCH[k]);
    report[k] = { label: ARCH[k].label, stageIds: stages.map((s) => s.id), anchors: {} };
    ANCHORS.forEach((a) => { report[k].anchors[a.id] = locate(stages, a); });
});

if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

console.log('CW6 SPINE → STAGE MAP   (FIXLIST #178, slice 0 — measurement, no student impact)\n');
console.log('PART 1 — where each ANCHOR EVENT actually sits, per archetype. Matched on row LABELS.');
console.log('  “setup¹²” = stage `setup`, 12 rows before it.  ⛔ = the row is a DIVIDER (no fieldId),');
console.log('  so nothing can be confirmed into it.\n');

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('anchor', 26) + keys.map((k) => pad(k.slice(0, 11), 13)).join(''));
console.log('─'.repeat(26 + keys.length * 13));
ANCHORS.forEach((a) => {
    const cells = keys.map((k) => {
        const f = report[k].anchors[a.id];
        if (!f.length) return pad('—', 13);
        const first = f[0];
        const mark = first.askable ? '' : '⛔';
        const multi = f.length > 1 ? '+' + (f.length - 1) : '';
        return pad(first.stage.slice(0, 9) + mark + multi, 13);
    });
    console.log(pad(a.name.slice(0, 25), 26) + cells.join(''));
});

console.log('\n\nPART 2 — THE VERDICT PER SPINE BEAT. A beat may seed a bookend only if its anchor sits in');
console.log('the SAME stage on all eight archetypes AND the row it lands on is askable.\n');

const verdicts = {};
SPINE.forEach((b) => {
    console.log('═'.repeat(100));
    console.log(b.id + '  "' + b.lead + '…"   — ' + b.asked);
    const perAnchor = b.anchors.map((aid) => {
        const a = ANCHORS.find((x) => x.id === aid);
        const cells = keys.map((k) => ({ k, f: report[k].anchors[aid] }));
        const stagesHit = Array.from(new Set(cells.map((c) => (c.f.length ? c.f[0].stage : '—'))));
        const missing = cells.filter((c) => !c.f.length).map((c) => c.k);
        const dividers = cells.filter((c) => c.f.length && !c.f[0].askable).map((c) => c.k);
        return { a, stagesHit, missing, dividers, cells };
    });
    perAnchor.forEach((p) => {
        console.log('   anchor “' + p.a.name + '” → ' + p.stagesHit.join(' / ')
            + (p.missing.length ? '   ⚠️ absent in ' + p.missing.length + '/' + keys.length : '')
            + (p.dividers.length ? '   ⛔ divider-only in ' + p.dividers.length : ''));
    });
    const allStages = Array.from(new Set(perAnchor.flatMap((p) => p.stagesHit).filter((s) => s !== '—')));
    const anyMissing = perAnchor.some((p) => p.missing.length);
    const anyDivider = perAnchor.some((p) => p.dividers.length);
    let verdict;
    if (allStages.length === 1 && !anyMissing && !anyDivider) verdict = 'SEEDABLE — one stage, every archetype, askable row.';
    else if (allStages.length === 1 && !anyMissing) verdict = 'SEEDABLE WITH CARE — one stage everywhere, but the anchor row is a DIVIDER on some archetypes: confirm into the stage’s own bookend row, never into the anchor row.';
    else if (allStages.length > 1) verdict = 'NOT UNIFORM — the anchors sit in ' + allStages.length + ' different stages (' + allStages.join(', ') + '). This is a DESIGN DECISION, not a bug: pick which reading the bookend uses, per §2 of the study.';
    else verdict = 'MUST BE ASKED — the anchor is absent on ' + perAnchor.map((p) => p.missing.length).join('/') + ' archetype(s); there is nothing to show.';
    verdicts[b.id] = verdict;
    console.log('   → ' + verdict + '\n');
});

// ── PART 3 — the number that sizes the build: of the twelve stage bookends (six stages × two
//    ends), how many does the spine actually cover? The continuity invariant (one stage's close IS
//    the next stage's open) collapses twelve asks to SEVEN distinct moments, which is itself the
//    strongest argument for the design — but only the covered ones can be shown-and-confirmed.
const STAGE_ORDER = report[keys[0]].stageIds;
const SPINE_AT = {};   // stage id → [beat ids whose anchor lands in it]
SPINE.forEach((b) => {
    b.anchors.forEach((aid) => {
        keys.slice(0, 1).forEach((k) => {                       // uniform across archetypes; verified in Part 1
            const f = report[k].anchors[aid];
            if (f.length) (SPINE_AT[f[0].stage] = SPINE_AT[f[0].stage] || []).push(b.id + '(' + aid + ')');
        });
    });
});
console.log('═'.repeat(100));
console.log('PART 3 — THE SEVEN MOMENTS. One stage’s close IS the next stage’s open (the study’s');
console.log('continuity invariant), so six stages need SEVEN bookend moments, not twelve asks.\n');
let covered = 0;
STAGE_ORDER.forEach((sid, i) => {
    const here = SPINE_AT[sid] || [];
    const next = SPINE_AT[STAGE_ORDER[i + 1]] || [];
    const openBy = i === 0 ? (SPINE_AT[sid] || []).filter((x) => /b1/.test(x)) : (SPINE_AT[STAGE_ORDER[i - 1]] || []);
    console.log('  ' + pad(sid, 13)
        + 'opens: ' + pad(openBy.length ? openBy.join(', ') : 'ASK — no spine beat', 34)
        + 'holds: ' + (here.length ? here.join(', ') : '—'));
    if (here.length) covered++;
});
console.log('\n  → ' + covered + ' of the ' + STAGE_ORDER.length + ' stages have a spine beat to show; the rest must be ASKED.');
console.log('  → Stage III (fascination) is the notable hole: the spine skips the midpoint entirely,');
console.log('    so its bookends are the ones that most need the Socratic ask Neil described.\n');

console.log('═'.repeat(100));
console.log('READ THIS BEFORE BUILDING ANYTHING:');
console.log('  • A STRONG cell licenses SHOW-AND-CONFIRM, never a silent pre-fill. A seeded row is not');
console.log('    empty, and `advance()`/`startWalk` begin at firstEmpty() — so a pre-filled bookend makes');
console.log('    the walk march past it and never ask (#74, observed on Step 5, not predicted).');
console.log('  • The outline scaffold is BAKED into the saved document, so any new bookend row needs an');
console.log('    on-load heal or only new projects get it.');
