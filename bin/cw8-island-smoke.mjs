#!/usr/bin/env node
/**
 * cw8-island-smoke.mjs — does the Step-8 interface actually RENDER?
 *
 * WHY THIS EXISTS. `bin/cw8-sim-harness.js` drives the BRIDGE — the props in, the port out, the
 * refine walk — with the island modelled. That is the right place for behaviour, and it proved
 * four real defects red. But it mounts a fake island, so a JSX runtime error inside the real
 * component (an undefined field, a bad map, a null band) would sail past every gate and reach a
 * student as a BLANK FULL-SCREEN OVERLAY with no way back. Neil would find it; that is the cycle
 * this file exists to spend instead (root §12).
 *
 * So this renders the SHIPPED component to a string with the SHAPE of props the bridge really
 * sends — including the awkward ones: a trait with no Step-7 words, a trait offered one band
 * only, and an EMPTY beat.
 *
 * ⚠️ CORRECTED v7.20.523: this header used to claim "in all three phases", and two blocks below
 * were labelled phase 2 and phase 3. They were not. `phase` is `useState(1)` and is never read
 * from `initial`, so every render here is the LANDING phase with state restored — and both of
 * those blocks asserted only `html.length > 0`, which cannot fail. They now assert the landing
 * they actually get. The beat-picking screen is not reachable from renderToString at all, so
 * anything specific to it (the #383 pinned bar) is gated structurally against the BUILT bundle
 * and named as such, rather than dressed up as a behavioural check.
 *
 * ⚠️ It proves the component RENDERS and that certain load-bearing strings are on the screen. It
 * does NOT prove it looks right, and it never can — that is Neil's eye at a real viewport (§14c
 * gate 2: only a browser proves a layout).
 *
 * Usage: node bin/cw8-island-smoke.mjs   (needs island/node_modules — the same tree `npm run build` uses)
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from '../island/node_modules/esbuild/lib/main.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(path.join(ROOT, 'island', 'package.json'));

let fail = 0;
const asserts = { pass: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// Build the component to CommonJS with react/react-dom external, so the render uses the SAME
// source the browser bundle is built from — never a re-typed copy (§14c).
const built = await esbuild.build({
    entryPoints: [path.join(ROOT, 'island', 'src', 'PlotValues.jsx')],
    bundle: true, write: false, format: 'cjs', jsx: 'transform',
    external: ['react', 'react-dom'], logLevel: 'silent',
});
const React = require('react');
const { renderToString } = require('react-dom/server');
const mod = { exports: {} };
// eslint-disable-next-line no-new-func
new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, mod, mod.exports);
const PlotValues = mod.exports.default;
ok(typeof PlotValues === 'function', 'the component is exported');

// ── PROPS IN THE SHAPE THE BRIDGE REALLY SENDS (traitCards() / stageModel() / CW8_BANDS) ──
const BANDS = {
    begin: { id: 'begin', label: 'Beginning', sub: 'Stages I–III' },
    end: { id: 'end', label: 'End', sub: 'Stages IV–VI' },
};
const TRAITS = [
    { id: 'creativity', trait: 'creativity', label: 'Creativity', valueName: 'Wisdom and Knowledge',
      cond: 'In excess', said: 'she invents to the point of destruction',
      portText: 'she invents to the point of destruction', bands: ['begin'], workedIn: 0 },
    { id: 'bravery', trait: 'bravery', label: 'Bravery', valueName: 'Courage',
      cond: 'In balance', said: 'she speaks in the hall', portText: 'she speaks in the hall',
      bands: ['begin', 'end'], workedIn: 2 },
    // ⚠️ THE AWKWARD ONE: flagged by condition with NOTHING written about it. The component must
    // render the "you didn't write about this one" line rather than an empty quote.
    { id: 'kindness', trait: 'kindness', label: 'Kindness', valueName: 'Humanity',
      cond: 'On your build list', said: '', portText: 'in deficit — this is where it should show.',
      bands: ['begin', 'end'], workedIn: 0 },
];
const STAGES = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    id: 'stage' + n, si: i, roman: ['I', 'II', 'III', 'IV', 'V', 'VI'][i],
    name: 'Stage ' + n + ' name', band: i < 3 ? 'begin' : 'end',
    beats: [
        { id: 'b' + n + '-1', ord: n * 2 - 1, label: 'Beat ' + n + '.1', text: 'their words for beat ' + n + '.1', worked: n === 1 ? { bravery: true } : {} },
        // an EMPTY beat in every stage — the gap-filling case, which is the COMMON one now
        { id: 'b' + n + '-2', ord: n * 2, label: 'Beat ' + n + '.2', text: '', worked: {} },
    ],
}));
const P = {
    traits: TRAITS, stages: STAGES, bands: BANDS,
    onStateChange: () => {}, onPort: async () => true, onClose: () => {},
};

// renderToString separates adjacent text nodes with `<!-- -->`, so "Already in {n} beats" arrives
// as `Already in <!-- -->2<!-- --> beats`. That is an SSR artefact of the renderer, not anything a
// browser shows — strip it, or every interpolated string assertion below fails for the wrong reason.
const flat = (html) => String(html).replace(/<!-- -->/g, '');
function render(initial, label) {
    try {
        return flat(renderToString(React.createElement(PlotValues, Object.assign({}, P, { initial }))));
    } catch (e) {
        ok(false, label + ' threw: ' + (e && e.message));
        return '';
    }
}

console.log('CW STEP-8 ISLAND — render smoke (the real component, the real prop shape)');

// ── phase 1 ──
{
    const html = render(null, 'phase 1');
    ok(/Which of your traits/.test(html), 'phase 1 asks which traits to work on');
    TRAITS.forEach((t) => ok(html.indexOf(t.label) !== -1, 'phase 1 lists "' + t.label + '"'));
    ok(/she speaks in the hall/.test(html), 'a trait shows the student their OWN Step-7 words');
    ok(/didn’t write about this one/.test(html), 'a trait with NO Step-7 words says so, instead of an empty quote');
    ok(/Already in 2 beats/.test(html), 'a trait already worked into beats says how many');
}
// ── phase 2, mid-walk: one trait selected, so the component opens on placing it ──
{
    const html = render({ selected: ['creativity'], picks: {}, noShow: [] }, 'phase 2');
    ok(html.length > 0, 'the component renders with a selection restored');
    // ⚠️ TRUTH IN LABELLING (v7.20.523). This block was called "phase 2" and asserted only
    // `html.length > 0` — but `phase` is useState(1) and is NOT read from `initial`, so what
    // renders here is PHASE 1 with the selection restored. The old assertion could not fail:
    // it was a test that passed by doing less. Assert what is actually true instead, so that
    // an accidental change to the landing phase is caught rather than hidden.
    ok(/Which of your traits/.test(html),
        're-opening with a saved selection lands on PICK YOUR TRAITS — the deliberate landing for '
        + '#380 re-entry ("add more traits"), not a resume into the middle of the beat list');
    ok(!/Where does their/.test(html),
        '…and it is NOT the beat-picking screen (the fact the old "phase 2" assertion hid)');
}
// ── phase 3: a selection AND picks, which is what the review screen reads ──
{
    const html = render({ selected: ['bravery'], picks: { bravery: ['b1-1', 'b2-2'] }, noShow: ['kindness'] }, 'phase 3');
    ok(html.length > 0, 'the component renders with picks AND a no-show restored');
    ok(/Which of your traits/.test(html), 'same landing with picks restored — nothing throws on the richer state');
}

// ── #383: THE TRAIT RAIL ───────────────────────────────────────────────────────────────
// ⚠️ STRUCTURAL, NOT BEHAVIOURAL, AND LABELLED AS SUCH (root CLAUDE.md §14b: a presence check
// proves PLUMBING, never BEHAVIOUR). renderToString cannot reach phase 2 — `phase` is local
// state with no prop seam, and adding one purely for a test would change the shipped resume
// landing that #380 depends on. So what is gated here is that the bar EXISTS in the shipped
// bundle and that its CSS actually pins; whether it looks right when stuck is Neil's eye.
{
    const bundle = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-scene-island.min.js'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-scene-island.css'), 'utf8');
    ok(/pv-rail-trait/.test(bundle) && /pv-rail-count/.test(bundle),
        '#383: the trait rail is in the BUILT bundle — the island has a build step and the server '
        + 'never builds, so source-only would ship nothing');
    ok(/pv-rail-said/.test(bundle), '#383: the rail carries the student’s own Step-7 words');
    // ⭐ THE LOAD-BEARING ONE. The rail must be a SIBLING of the scroller, not a child of it.
    // A child cannot be kept on screen without sticky, and sticky is the mechanism that failed
    // unexplained at .523 — so this asserts the structure that makes the question moot.
    const src = fs.readFileSync(path.join(ROOT, 'island', 'src', 'PlotValues.jsx'), 'utf8');
    const cols = src.indexOf('className="pv-cols"');
    const scrollOpen = src.indexOf('className="ssi-scroll"');
    const rail = src.indexOf('renderRail()', scrollOpen);
    // ⚠️ AN ORDER CHECK IS NOT A NESTING CHECK. The first cut of this assertion compared source
    // INDEXES (rail after scroller) and passed happily when the rail was moved INSIDE the
    // scroller — the exact defect it exists to catch, since a child cannot stay on screen
    // without the sticky that failed at .523. Walk the div depth instead: find where the
    // scroller actually CLOSES, and require the rail to come after it.
    // Start at the `<div` that OPENS the scroller, not at its className — starting mid-tag makes
    // the scan one level too shallow, so it finds .wrap's close and every nesting bug passes.
    // (That was this check's own first bug, caught by the injection it exists for.)
    const scrollTag = src.lastIndexOf('<div', scrollOpen);
    let depth = 0, scrollClose = -1;
    for (let i = scrollTag; i < src.length; i++) {
        if (src.startsWith('<div', i)) depth++;
        else if (src.startsWith('</div>', i)) {
            depth--;
            if (depth === 0) { scrollClose = i; break; }
        }
    }
    ok(cols !== -1 && cols < scrollOpen && scrollClose !== -1 && rail > scrollClose,
        '#383: the rail is a SIBLING of .ssi-scroll inside .pv-cols — it sits AFTER the scroller '
        + 'closes, so it is outside the scrolling box, cannot scroll away, and needs no sticky');
    ok(!/\.pv-rail[^{]*\{[^}]*position:\s*sticky/.test(css) && !/\.pv-pin\b/.test(css),
        '#383: NO sticky anywhere in the rail, and the retired .523 sticky bar is gone from the '
        + 'CSS — a dead second mechanism is how a layout regains a path nobody tests');
    ok(!/pv-pin/.test(bundle), '#383: …and the retired bar is gone from the bundle too');
    const colsBlock = (css.match(/\.pv-cols \{[^}]*\}/) || [''])[0];
    ok(/display:flex/.test(colsBlock) && /min-height:0/.test(colsBlock),
        '#383: the column row is a flex row with min-height:0 — without it the scroller grows '
        + 'past the viewport instead of scrolling (the reachability trap)');
    const railBlock = (css.match(/\.pv-rail \{[^}]*\}/) || [''])[0];
    ok(/min-height:0/.test(railBlock) && /overflow-y:auto/.test(railBlock),
        '#383: a long Step-7 quote scrolls INSIDE the rail rather than stretching it');
    ok(/max-width:1024px/.test(css),
        '#383: there is a narrow fallback — the rail becomes a bar above the scroller where there '
        + 'is no room for a column (iPad landscape), still outside the scroll box');
}
// ── the empty-state: no flagged traits at all (the guard path) ──
{
    try {
        const html = flat(renderToString(React.createElement(PlotValues, Object.assign({}, P, { traits: [], initial: null }))));
        ok(/No flagged traits/.test(html), 'with no traits the screen SAYS so — never a blank overlay (§4d)');
    } catch (e) { ok(false, 'the empty state threw: ' + (e && e.message)); }
}
// ── and the shape the bridge sends when a project has no beats yet ──
{
    try {
        renderToString(React.createElement(PlotValues, Object.assign({}, P, { stages: [], initial: null })));
        ok(true, 'a plot with no stages renders without throwing');
    } catch (e) { ok(false, 'the no-stages case threw: ' + (e && e.message)); }
}

console.log('   ' + asserts.pass + ' assertions passed');
if (fail) { console.error('❌ cw8-island-smoke FAILED'); process.exit(1); }
console.log('✅ cw8-island-smoke passed (renders on the landing phase across restored states + awkward props; the trait RAIL is checked structurally in the BUILT bundle (sibling of the scroller, no sticky) — phase 2 is unreachable from renderToString, so its look is verified by eye).');
