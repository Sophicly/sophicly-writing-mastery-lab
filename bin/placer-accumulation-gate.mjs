#!/usr/bin/env node
/**
 * placer-accumulation-gate.mjs — A SERIAL PLACER MUST SHOW THE WHOLE RUN, NOT JUST THE CURRENT ITEM.
 *
 * ⭐⭐ WHY THIS FILE EXISTS, and it is not because the bug was hard.
 *
 * Neil reported the SAME defect twice, four months apart, against the SAME component body:
 *   · 2026-08-18 (#394, Step 8):  "if we've placed other traits, it should be highlighted in the beats."
 *   · 2026-08-26 (#446, Step 12): "I've just transferred it to beat three… then I go to the next
 *                                  goal, but now I can't see that previous one."
 * and then, correctly, refused a third fix on its own:
 *   "it needs some sort of gate or something, because it's not the first time this has happened."
 *
 * He is right, and the reason it recurred is worth stating plainly, because it is the same shape
 * as the reachability-lint story in the root CLAUDE.md. `worked` — what the beat already carries —
 * is computed ONCE at mount by scanning the document, and the append happens ONCE at the end of a
 * pass. So "draw what the document says" is the thing you get by NOT thinking, and it is correct
 * for exactly the first item of a run and wrong for every item after it. #394 fixed the display
 * for placements from a PREVIOUS run and stopped there; nothing anywhere asserted the run in
 * progress. A rule in prose loses to a default in code, so this is the default in code.
 *
 * THE INVARIANT, in one sentence:
 *   While a serial placer is on item N, every beat the student has already placed items 1…N-1 into
 *   must SAY SO on that beat's own card.
 *
 * WHY EVERY EXISTING GATE MISSED IT — worth reading before adding another smoke test:
 *   `cw8-island-smoke.mjs` says so in its own header: *"The beat-picking screen is not reachable
 *   from renderToString at all."* `phase` was `useState(1)` and never seeded, so the ONLY screen
 *   any island gate had ever rendered was the landing. An invariant on a screen nothing can render
 *   is an invariant nothing can check. v7.20.570 seeds `phase`/`cursor` from `props.initial` — a
 *   runtime no-op, since the engine persists only {picks, noShow} — purely so this file can look.
 *
 * HOW IT AVOIDS FALSE-PASSING, because a presence check would (root §14b.3, and
 * `feedback_negative_only_tests_pass_on_a_dead_screen`):
 *   1. It scopes to ONE BEAT CARD, not the page. The item's name is in the rail and the roster too,
 *      so `/External goal/.test(html)` passes on the broken build. The card is sliced out by hand.
 *   2. It is DIFFERENTIAL. The same render with NO earlier picks must NOT name the item on that
 *      card. A check that only ever asserts presence cannot tell a fix from a coincidence.
 *   3. It SELF-PROVES. It rebuilds the component with the pending-chip block cut out of the source
 *      and requires its own assertion to go RED on that variant. If the gate cannot fail, the run
 *      fails. This is the only part that survives someone refactoring the chip markup.
 *
 * It runs BOTH lenses — Step 8 (traits) and Step 12 (goals) — off the one shared body, because the
 * lens is a copy contract, not a fork, and Neil hit the bug once in each.
 *
 * Usage: node bin/placer-accumulation-gate.mjs   (needs island/node_modules, as the other island gates do)
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from '../island/node_modules/esbuild/lib/main.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(path.join(ROOT, 'island', 'package.json'));
const React = require('react');
const { renderToString } = require('react-dom/server');

let fail = 0;
const asserts = { pass: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

const SRC = path.join(ROOT, 'island', 'src', 'PlotValues.jsx');
const SOURCE = fs.readFileSync(SRC, 'utf8');

async function componentFrom(source) {
    const built = await esbuild.build({
        stdin: { contents: source, resolveDir: path.dirname(SRC), sourcefile: 'PlotValues.jsx', loader: 'jsx' },
        bundle: true, write: false, format: 'cjs', jsx: 'transform',
        external: ['react', 'react-dom'], logLevel: 'silent',
    });
    const mod = { exports: {} };
    // eslint-disable-next-line no-new-func
    new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, mod, mod.exports);
    return mod.exports.default || mod.exports;
}

/* ── the two lenses, with the prop SHAPE the engine really sends ──────────────────────────── */
const mkItem = (id, label, valueName, cond, said, band) => ({
    id, trait: id, label, valueName, cond, said, portText: said,
    byBand: { begin: { cond, said }, end: { cond, said } }, bands: [band], workedIn: 0,
});

const LENSES = [
    {
        name: 'Step 12 · goals lens',
        copy: {
            prefix: 'Goals', noun: 'goal', nounPlural: 'goals', source: 'Step 11',
            title: 'Write your goals and needs into your plot',
            sub: 'Step 11 worked out what your protagonist WANTS and what they NEED.',
            whyEnd: 'These are the facts about how the story ENDS.',
            noneCame: 'No goals came through from Step 11.', afterPort: 'Close this and carry on.',
        },
        items: [
            mkItem('ext-goal-begin', 'External goal', 'Part 1 · Beginning', 'What they consciously chase', 'MONEY', 'begin'),
            mkItem('int-goal-begin', 'Internal goal', 'Part 1 · Beginning', 'What they believe the goal will bring them', 'STATUS', 'begin'),
            mkItem('need-begin', 'Need', 'Part 1 · Beginning', 'What they truly need', 'To be known.', 'begin'),
        ],
    },
    {
        name: 'Step 8 · traits lens (default copy)',
        copy: null,
        items: [
            mkItem('creativity', 'Creativity', 'Wisdom', 'In excess', 'she invents her way out of everything', 'begin'),
            mkItem('curiosity', 'Curiosity', 'Wisdom', 'In deficit', 'she stopped asking questions years ago', 'begin'),
            mkItem('honesty', 'Honesty', 'Courage', 'In balance', 'she says the hard thing', 'begin'),
        ],
    },
];

// Six beats over three beginning stages; the target is #3, and it starts EMPTY of any placement.
const TARGET = 'b3';
const BANDS = { begin: { id: 'begin', label: 'Beginning', sub: 'Stages I\u2013III' }, end: { id: 'end', label: 'End', sub: 'Stages IV\u2013VI' } };
function stages() {
    return [1, 2, 3].map((n, i) => ({
        id: 'stage' + n, si: i, roman: ['I', 'II', 'III'][i], name: 'Stage ' + n, band: 'begin',
        beats: [
            { id: 'b' + (n * 2 - 1), ord: n * 2 - 1, label: 'Beat ' + (n * 2 - 1), text: 'their words ' + (n * 2 - 1), worked: {} },
            { id: 'b' + (n * 2), ord: n * 2, label: 'Beat ' + (n * 2), text: 'their words ' + (n * 2), worked: {} },
        ],
    }));
}

/** Slice ONE beat card out of the rendered HTML. Presence anywhere on the page is not the claim. */
function cardFor(html, beatOrd) {
    const parts = html.split('class="beat-card');
    for (let i = 1; i < parts.length; i++) {
        const card = parts[i].slice(0, parts[i].indexOf('</button>') === -1 ? parts[i].length : parts[i].indexOf('</button>'));
        // renderToString splits adjacent text nodes with an HTML comment: `#<!-- -->3`.
        if (new RegExp('class="ord">#(?:<!-- -->)?' + beatOrd + '</span>').test(card)) return card;
    }
    return null;
}

async function checkLens(Component, lens, { expectPending }) {
    const P = {
        traits: lens.items, stages: stages(), bands: BANDS, copy: lens.copy,
        onStateChange: () => {}, onPort: async () => true, onClose: () => {},
    };
    const earlier = lens.items[0];      // placed on the PREVIOUS item of this run
    const current = lens.items[1];      // the item the walk is on NOW

    // The student is on item 2, having put item 1 into beat #3.
    const withPick = renderToString(React.createElement(Component, Object.assign({}, P, {
        initial: { phase: 2, cursor: 1, band: 'begin', picks: { [earlier.id]: [TARGET] }, noShow: [] },
    })));
    // The differential control: same screen, nothing placed yet.
    const noPick = renderToString(React.createElement(Component, Object.assign({}, P, {
        initial: { phase: 2, cursor: 1, band: 'begin', picks: {}, noShow: [] },
    })));

    const cardA = cardFor(withPick, 3);
    const cardB = cardFor(noPick, 3);
    if (!cardA || !cardB) {
        // Not a soft skip: if the beat screen stopped rendering, this gate is blind and must say so.
        ok(false, lens.name + ': the beat-picking screen did not render — the gate is BLIND, fix the render before trusting any result');
        return;
    }
    ok(!new RegExp(current.label).test(cardB) && !new RegExp(earlier.label).test(cardB),
        lens.name + ': control — an untouched beat card names no item (proves the assertion below can fail)');

    const named = new RegExp(earlier.label).test(cardA);
    if (expectPending) {
        ok(named, lens.name + ': beat #3 says it already carries "' + earlier.label + '" while the walk is on "' + current.label + '"');
        ok(/pv-placed-chip is-pending/.test(cardA), lens.name + ': …and it says it as a PENDING chip, not as the current item');
        ok(/＋/.test(cardA), lens.name + ': …with the ＋ marker, so the state survives greyscale and colour-blindness');
    }
    return named;
}

console.log('placer accumulation — a serial placer must show the whole run\n');

const Real = await componentFrom(SOURCE);
for (const lens of LENSES) await checkLens(Real, lens, { expectPending: true });

/* ── SELF-PROOF: cut the fix out and require the assertion to go RED ───────────────────────── */
const DEFECT = SOURCE.replace(/\{pendingHere\.map\(\(m\) => \{[\s\S]*?\}\)\}\n/, '');
if (DEFECT === SOURCE) {
    ok(false, 'SELF-PROOF could not find the pending-chip block to remove — this gate can no longer prove it fails, so it proves nothing');
} else {
    const Broken = await componentFrom(DEFECT);
    let stillNamed = false;
    for (const lens of LENSES) {
        const r = await checkLens(Broken, lens, { expectPending: false });
        if (r) stillNamed = true;
    }
    ok(!stillNamed, 'SELF-PROOF: with the pending chips removed the beat card stops naming the earlier item — the gate can actually fail');
}

console.log('   ' + asserts.pass + ' assertions passed');
if (fail) { console.error('\n❌ placer-accumulation-gate FAILED'); process.exit(1); }
console.log('✅ placer-accumulation-gate passed (both lenses show the run so far, and the gate proved it can fail).');
