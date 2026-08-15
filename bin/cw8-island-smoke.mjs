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
 * So this renders the SHIPPED component to a string, in all three phases, with the SHAPE of props
 * the bridge really sends — including the awkward ones: a trait with no Step-7 words, a trait
 * offered one band only, and an EMPTY beat.
 *
 * ⚠️ It proves the component RENDERS and that certain load-bearing strings are on the screen. It
 * does NOT prove it looks right, and it never can — that is Neil's eye at a real viewport (§14c
 * gate 2: only a browser proves a layout).
 *
 * Usage: node bin/cw8-island-smoke.mjs   (needs island/node_modules — the same tree `npm run build` uses)
 */
import { createRequire } from 'node:module';
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
    ok(html.length > 0, 'phase 2 renders with a selection restored');
}
// ── phase 3: a selection AND picks, which is what the review screen reads ──
{
    const html = render({ selected: ['bravery'], picks: { bravery: ['b1-1', 'b2-2'] }, noShow: ['kindness'] }, 'phase 3');
    ok(html.length > 0, 'phase 3 renders with picks restored');
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
console.log('✅ cw8-island-smoke passed (the component renders in every phase, including the awkward props).');
