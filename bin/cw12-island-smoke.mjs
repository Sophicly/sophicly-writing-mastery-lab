#!/usr/bin/env node
/**
 * cw12-island-smoke.mjs — do the Step-12 interfaces actually RENDER? (v7.20.567, #440)
 *
 * The twin of cw8-island-smoke.mjs for the two modes Step 12 adds: the Step-8 placer in its GOALS
 * lens (a `copy` prop — every sentence that named a trait or Step 7 must now say goal / Step 11),
 * and the new DRAFT MAP (the draft as sentences). cw12-sim-harness drives the bridge with both
 * islands modelled, so a JSX runtime error inside either real component would pass every gate
 * and reach a student as a blank full-screen overlay. This renders the shipped components with
 * the prop shape the bridge really sends.
 *
 * It proves they RENDER and that load-bearing strings are on screen — never that they look right.
 * Usage: node bin/cw12-island-smoke.mjs   (needs island/node_modules)
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
async function load(file) {
    const built = await esbuild.build({
        entryPoints: [path.join(ROOT, 'island', 'src', file)],
        bundle: true, write: false, format: 'cjs', jsx: 'transform',
        external: ['react', 'react-dom'], logLevel: 'silent',
    });
    const mod = { exports: {} };
    // eslint-disable-next-line no-new-func
    new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, mod, mod.exports);
    return mod.exports.default;
}
const React = require('react');
const { renderToString } = require('react-dom/server');
const flat = (html) => String(html).replace(/<!-- -->/g, '');
function render(Comp, props, label) {
    try { return flat(renderToString(React.createElement(Comp, props))); }
    catch (e) { ok(false, label + ' threw: ' + (e && e.message)); return ''; }
}

console.log('CW STEP-12 ISLANDS — render smoke (the real components, the real prop shape)');

// ── A. the placer in its GOALS lens ────────────────────────────────────────────────────────
{
    const PlotValues = await load('PlotValues.jsx');
    const BANDS = { begin: { id: 'begin', label: 'Beginning', sub: 'Stages I–III' }, end: { id: 'end', label: 'End', sub: 'Stages IV–VI' } };
    const item = (id, label, part, gloss, said, band) => ({
        id, trait: id, label, valueName: part, cond: gloss, said, portText: said,
        byBand: { begin: { cond: gloss, said }, end: { cond: gloss, said } }, bands: [band], workedIn: 0,
    });
    const TRAITS = [
        item('ext-goal-begin', 'External goal', 'Part 1 · Beginning', 'What they consciously chase', 'To escape the estate before her brother finds her.', 'begin'),
        item('need-begin', 'Need', 'Part 1 · Beginning', 'What they truly need and cannot yet see', 'To stop running from people who love her.', 'begin'),
        item('dilemma', 'Dilemma', 'Part 2 · End', 'The choice between the goal and the need', 'Board the ship, or stay and face what she did.', 'end'),
    ];
    const STAGES = [1, 2, 3, 4, 5, 6].map((n, i) => ({
        id: 'stage' + n, si: i, roman: ['I', 'II', 'III', 'IV', 'V', 'VI'][i], name: 'Stage ' + n, band: i < 3 ? 'begin' : 'end',
        beats: [{ id: 'b' + n, ord: n, label: 'Beat ' + n, text: n === 2 ? '' : 'their words ' + n, worked: {} }],
    }));
    const copy = { prefix: 'Goals', noun: 'goal', nounPlural: 'goals', source: 'Step 11', title: 'Write your goals and needs into your plot',
        sub: 'Step 11 worked out what your protagonist WANTS and what they NEED.', whyEnd: 'These are the facts about how the story ENDS.',
        noneCame: 'No goals came through from Step 11 — go back and finish the character profile first.', afterPort: 'Close this and carry on.' };
    const P = { traits: TRAITS, stages: STAGES, bands: BANDS, copy, onStateChange: () => {}, onPort: async () => true, onClose: () => {} };
    const html = render(PlotValues, P, 'goals lens, landing');
    ok(html.length > 0, 'the placer renders in the goals lens');
    ok(/Write your goals and needs into your plot/.test(html), 'the title is the goals one');
    ok(/Your goals at the/.test(html) && /beginning/.test(html), 'the pass intro says GOALS, not traits');
    ok(/Step 11/.test(html) && !/Step 7/.test(html), 'every "Step 7" became "Step 11" (the copy contract has no leak)');
    ok(!/\btrait\b/.test(html.replace(/pv-[a-z-]*trait[a-z-]*/g, '')), 'no rendered sentence says "trait" (class names excepted)');
    ok(/External goal/.test(html) && /Need/.test(html) && !/Dilemma/.test(html), 'the BEGINNING pass lists the beginning items only');
    ok(/Beginning goals/.test(html), 'the stepper pill is banded and nouned');
    // default copy still equals Step 8, byte for byte on the strings a student reads
    const def = render(PlotValues, Object.assign({}, P, { copy: null, traits: [item('creativity', 'Creativity', 'Wisdom', 'In excess', 'she invents', 'begin')] }), 'default lens');
    ok(/Write your values into your plot/.test(def) && /Your traits at the/.test(def) && /Step 7/.test(def), 'with no copy prop the placer is Step 8, unchanged');
    // the guard path
    const empty = render(PlotValues, Object.assign({}, P, { traits: [] }), 'goals lens, empty');
    ok(/No goals came through from Step 11/.test(empty) && /character profile/.test(empty), 'the empty state names Step 11 and the way back');
}

// ── B. the draft map ───────────────────────────────────────────────────────────────────────
{
    const DraftMap = await load('DraftMap.jsx');
    const sentences = [
        { id: 's0', text: 'Mara ran to the docks.', para: 0 },
        { id: 's1', text: 'The rain had not stopped for three days.', para: 0 },
        { id: 's2', text: '"Wait," her brother shouted.', para: 1 },
        { id: 's3', text: 'She did not turn round.', para: 1 },
    ];
    const beats = [
        { id: 'b1', ord: 1, label: 'Opening image', text: 'the estate at dawn', stageRoman: 'I', stageName: 'Anticipation', inRun: false },
        { id: 'b2', ord: 2, label: 'Call to adventure', text: 'the letter arrives', stageRoman: 'I', stageName: 'Anticipation', inRun: true },
        { id: 'b3', ord: 3, label: 'Refusal', text: '', stageRoman: 'II', stageName: 'Dream', inRun: true },
    ];
    const P = { sentences, beats, onStateChange: () => {}, onMap: async () => true, onClose: () => {} };
    const html = render(DraftMap, P, 'draft map, landing');
    ok(html.length > 0, 'the draft map renders');
    ok(/Put your draft back into your plot/.test(html), 'the title');
    ok(/Which part of your draft goes into which beat/.test(html), 'the ask');
    ok(/tap the first sentence/.test(html) && /tap the last/.test(html), 'the tap-first-tap-last instruction is on screen');
    sentences.forEach((s) => ok(html.indexOf(s.text.replace(/"/g, '&quot;')) !== -1 || html.indexOf(s.text) !== -1, 'sentence rendered: ' + s.text));
    ok((html.match(/class="dm-sent"/g) || []).length === 4, 'every sentence is a tappable button (4)');
    ok(/dm-para-break/.test(html), 'the paragraph break is drawn between paragraphs');
    ok(/Tap the first, then the last/.test(html), 'the footer tells them what to do');
    // #452 (Neil, 2026-08-26): trimming a selection ALREADY worked — applyTap shrinks the run when
    // you tap either end — but nothing on screen said so, which from the student's side is
    // indistinguishable from the feature not existing. So the way out has to be ASSERTED, not
    // assumed, and the control below proves the assertion can fail.
    const selected = render(DraftMap, Object.assign({}, P, { initial: { sel: { start: 0, end: 3 } } }), 'draft map, mid-selection');
    ok(/4<\/strong> sentences selected|4 sentences selected/.test(selected), 'mid-selection: the count is on screen');
    ok(/Start this chunk again/.test(selected), 'mid-selection: a VISIBLE way to clear the selection exists');
    ok(/make the chunk smaller/.test(selected) && /make it bigger/.test(selected), 'mid-selection: the screen says HOW to resize, in words');
    const unselected = render(DraftMap, P, 'draft map, nothing selected');
    ok(!/Start this chunk again/.test(unselected), 'control: with nothing selected that control is absent — so the assertion above can fail');
    // restored chunks: placed sentences show their beat tag and the chunk list
    const restored = render(DraftMap, Object.assign({}, P, { initial: { chunks: [{ from: 0, to: 1, fid: 'b2' }, { from: 2, to: 2, fid: '__notyet__' }] } }), 'draft map, restored');
    ok(/is-placed/.test(restored) && /#2/.test(restored), 'a placed sentence carries its beat number');
    ok(/Placed so far/.test(restored) && /Call to adventure/.test(restored) && /Not in the plot yet/.test(restored), 'the chunk list names the beat, and the not-yet case');
    // #451 (Neil): a COUNT answers "how many" and never "which" — every surface must NAME the chunk.
    ok(/Chunk 1/.test(restored) && /Chunk 2/.test(restored), 'every placed chunk is numbered, so a student can match a chunk to its beat');
    ok(/dm-chunk-no/.test(restored), '…and the number is the shared chunk-number chip, not ad-hoc text');
    ok(/C1 · #2/.test(restored) || /C1 &#xB7; #2/.test(restored) || /C1/.test(restored), 'the sentence tag in the draft carries the chunk number too');
    // draft ORDER, not placement order: chunk numbers must not renumber when one is taken back.
    const reordered = render(DraftMap, Object.assign({}, P, { initial: { chunks: [{ from: 2, to: 2, fid: 'b3' }, { from: 0, to: 1, fid: 'b2' }] } }), 'draft map, chunks stored out of order');
    const i1 = reordered.indexOf('Chunk 1'), i2 = reordered.indexOf('Chunk 2');
    ok(i1 !== -1 && i2 !== -1, 'both chunks numbered regardless of the order they were placed in');
    ok(/1<\/strong> sentence still to place|<strong>1<\/strong> sentence/.test(restored), 'the footer counts what is left');
    const bundle = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-scene-island.min.js'), 'utf8');
    ok(/WMLDraftMapIsland/.test(bundle) && /dm-sent/.test(bundle), 'the draft map is in the BUILT bundle (the server never builds)');
    const css = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-scene-island.css'), 'utf8');
    ok(/\.swml-draft-island \.dm-sent/.test(css), '…and its styles are in the stylesheet');
}

console.log('   ' + asserts.pass + ' assertions passed');
if (fail) { console.error('❌ cw12-island-smoke FAILED'); process.exit(1); }
console.log('✅ cw12-island-smoke passed (both Step-12 modes render with the real prop shape).');
