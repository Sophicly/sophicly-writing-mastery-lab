#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-plot-panel-gate.js — BEHAVIOURAL gate for the My Plot rail panel (v7.20.535, FIXLIST #396).
 *
 * WHY IT EXISTS, and it is not "coverage": Neil asked for a panel that shows what the student HAS
 * written *"and even what they haven't written"* — the blank beats are the pedagogically
 * interesting rows. That property is exactly the one a future model deletes as a tidy-up, and it
 * has a live sibling that does the opposite: CW9's `enumerateFromArtifact` DROPS empty beats
 * (correctly — you cannot write out a scene that isn't planned). Two near-identical enumerators
 * with opposite rules about emptiness is a drift class, so the rule is asserted rather than
 * remembered.
 *
 * Everything under test is SLICED from wml-assessment.js, never re-typed (§14c: a check that
 * duplicates its subject tests its own memory). The DOM is shimmed because node has none — that
 * is the ENVIRONMENT, not the subject.
 *
 * Usage: node bin/cw-plot-panel-gate.js
 */
'use strict';
const path = require('path');
const { SRC, braceSliceFrom } = require(path.join(__dirname, 'walk-sim-lib.js'));

function evalAfter(label, open, close) {
    const i = SRC.indexOf(label);
    if (i < 0) throw new Error('not found: ' + label);
    return eval('(' + braceSliceFrom(SRC, i + label.length, open || '[', close || ']').text + ')');
}
function fnFrom(name, deps) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) throw new Error(name + ' not found');
    const body = SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end).replace(/^function\s+\w+/, 'function');
    const names = Object.keys(deps || {});
    return new Function(...names, 'return ' + body + ';')(...names.map(n => deps[n]));
}
function constFnFrom(decl, deps) {
    const i = SRC.indexOf(decl);
    if (i < 0) throw new Error(decl + ' not found');
    const j = SRC.indexOf('function', i);
    const body = SRC.slice(j, braceSliceFrom(SRC, j, '{', '}').end);
    const names = Object.keys(deps || {});
    return new Function(...names, 'return ' + body + ';')(...names.map(n => deps[n]));
}

const ARCH = evalAfter('cwPlotArchetypes:', '{', '}');
const OUTLINE_CRITERIA = { cwPlotArchetypes: ARCH };
const _cw6RowFieldId = fnFrom('_cw6RowFieldId');
const _cw8BandOf = fnFrom('_cw8BandOf');
const _cw8StageRoman = fnFrom('_cw8StageRoman');
const CW8_BANDS = evalAfter('const CW8_BANDS =', '{', '}');
const _cwPlotAssemble = fnFrom('_cwPlotAssemble', { OUTLINE_CRITERIA, _cw6RowFieldId, _cw8BandOf, _cw8StageRoman });
const _scEsc = (function () {
    const i = SRC.indexOf('const _scEsc = (s) =>');
    if (i < 0) throw new Error('_scEsc not found');
    const endMark = "'&gt;');";
    const j = SRC.indexOf(endMark, i) + endMark.length - 1;
    return eval('(' + SRC.slice(i + 'const _scEsc = '.length, j) + ')');
})();

// ── DOM shim: only what _cwPlotFromHTML uses. Environment, not subject.
global.DOMParser = class {
    parseFromString(html) {
        return { querySelectorAll(sel) {
            const out = [];
            const re = /<div([^>]*data-outline-row[^>]*)>([\s\S]*?)<\/div>/g;
            let m;
            while ((m = re.exec(html))) {
                const attrs = m[1]; const inner = m[2];
                const fid = (attrs.match(/data-field-id="([^"]*)"/) || [])[1] || null;
                out.push({ getAttribute: (k) => (k === 'data-field-id' ? fid : null),
                           textContent: inner.replace(/<[^>]*>/g, '') });
            }
            return { forEach: (f) => out.forEach(f) };
        } };
    }
};
const _cwPlotFromHTML = fnFrom('_cwPlotFromHTML', { OUTLINE_CRITERIA, _cwPlotAssemble });
const _myPlotHTML = constFnFrom('const _myPlotHTML = function', { OUTLINE_CRITERIA, _scEsc, CW8_BANDS });

// ── FIXTURE: the real rags_to_riches template, three rows filled, the rest blank ──
const k = Object.keys(ARCH)[0];
const tmpl = ARCH[k];
const rows = [];
let filled = 0;
tmpl.sections.forEach((sec) => (sec.criteria || []).forEach((c) => {
    if (c.beatType === 'turning-point' || c.beatType === 'marker') return;
    const fid = _cw6RowFieldId(k, sec.id, c.id);
    const text = filled < 3 ? ('She refuses to hand over the letter. #' + (++filled)) : '';
    rows.push('<div data-outline-row="true" data-field-id="' + fid + '">' + text + '</div>');
}));
const html = '<div>' + rows.join('') + '</div>';

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail = 1; console.error('  ❌ ' + m); } };

const world = _cwPlotFromHTML(html);
ok(world.arch === k, 'archetype read off the fieldIds from saved HTML → ' + world.arch);
ok(world.beats.length === rows.length, 'EVERY row enumerated, empty included: ' + world.beats.length + ' of ' + rows.length);
ok(world.beats.filter(b => !b.text).length === rows.length - 3, 'the blank beats survived (not filtered)');
ok(world.stages.length === tmpl.sections.length, 'all ' + world.stages.length + ' stages present');
ok(world.stages.some(s => s.band === 'begin') && world.stages.some(s => s.band === 'end'), 'both bands present');

const out = _myPlotHTML(world);
ok(out.indexOf('Not written yet.') !== -1, 'a BLANK beat renders as blank — the half Neil named');
ok(out.indexOf('She refuses to hand over the letter. #1') !== -1, 'a WRITTEN beat renders the student’s own words');
ok(out.indexOf('3 of ' + rows.length + ' beats written') !== -1, 'the count line is derived, not asserted');
ok(out.indexOf(CW8_BANDS.begin.label) !== -1 && out.indexOf(CW8_BANDS.end.label) !== -1, 'band badges render');
ok(out.indexOf('<script') === -1, 'no unescaped markup leaks');

// arch miss → empty state, never a crash
const none = _cwPlotFromHTML('<div data-outline-row="true" data-field-id="outline-essay-q1">x</div>');
ok(none.arch === null && none.beats.length === 0, 'a doc with no plot rows returns the empty world (panel shows its empty state)');
ok(_cwPlotFromHTML('').beats.length === 0, 'empty html is safe');

console.log(fail ? '\nFAILED' : '\nplot panel behaviour OK');
process.exit(fail);
