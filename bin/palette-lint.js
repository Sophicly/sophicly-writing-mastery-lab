#!/usr/bin/env node
/* eslint-env node */
/**
 * palette-lint.js — v7.20.394
 *
 * WHY THIS EXISTS. A retired surface colour is invisible to the sweep that retires it whenever it
 * is written as `rgba(r, g, b, a)` instead of `#rrggbb`. Same colour, different spelling, missed by
 * grep. This has now bitten THREE times on the same palette:
 *
 *   1. `.swml-extract-panel`      rgba(28, 29, 31, 0.97)  — the literature extract panel
 *   2. the rail panel shell       rgba(28, 29, 31, 0.97)  — resources / profile / spine / logline
 *   3. `--swml-tb-fade-0`         rgba(45,48,52,0)        — survived the .393 move by one generation
 *
 * (3) is the one that matters: it was missed by the person who had, in the same change, written the
 * comment warning about exactly this. A rule in prose loses to a default in code (CLAUDE.md §5d), so
 * the rule is now code.
 *
 * WHAT IT CHECKS. Every value the palette has moved OFF is listed below. If one appears in a LIVE
 * declaration — in hex, rgb() or rgba(), any spacing, any case — the build fails and names the file,
 * the line and which spelling it used.
 *
 * ⚠️ IT ONLY FLAGS SURFACES. `background`, `border-*` and the `--swml-tb-fade*` pair. It deliberately
 * ignores `color:`, because several retired SURFACE values are still perfectly valid as light-theme
 * TEXT — #1c1d1f is used on ~9 light-theme type rules and must never be swept. Flagging those would
 * make the gate noisy, and a noisy gate gets switched off.
 *
 * WHEN THE PALETTE MOVES AGAIN: add the outgoing values to RETIRED, and remove the incoming one if
 * it is listed. That list IS the record of every colour this product has stopped using.
 *
 * Run: node bin/palette-lint.js        (wired into bin/pre-ship-check.sh)
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Every value the dark surface ladder has moved off, and when.
const RETIRED = [
    ['#212225', 'v7.20.181 chrome tier — retired .386'],
    ['#28292b', 'v7.20.181 sheet tier — retired .386'],
    ['#2e2f32', 'the fifth grey that compensated for a bad fourth — retired .386, must not return'],
    ['#22282a', 'the .384 pick — retired .386'],
    ['#2e3436', 'LearnDash "warm charcoal" — never a WML value'],
    ['#26272a', 'rail buttons, 2 points off the tier — retired .389'],
    ['#242628', 'raised tier — retired .393 (hue-drifted derivation)'],
    ['#1c1d1f', 'Dark Base — retired .392 as a SURFACE (still valid as light-theme text)'],
    ['#25272b', 'Dark Base — retired .393 (wrong chroma; not a true tint)'],
    ['#2d3034', 'raised tier — retired .393'],
    ['#151617', 'recessed tier — retired .393'],
    ['#2b2c2f', 'raised tier — retired .428 when Neil lifted the rung to #333437 (OKLCH N=+3). ' +
                'Chrome left this rung at .425 (header → #232427); the floating family left at .428.'],
    ['#313235', 'NEVER SHIPPED. The .428 first attempt: +14 on the RAW RGB channels to match ' +
                'Apple\'s dark step. Off-lattice (N=+2.71) and hue-drifted — the exact mistake the ' +
                'ladder comment warns about. Neil caught it: "they\'re all derived from #1c1d1f."'],
];

// Declarations that paint a SURFACE. `color:` is deliberately absent — see the header note.
const SURFACE_DECL = /(^|[;{\s])(background(-color|-image)?|border(-[a-z]+)?-color|border(-[a-z]+)?|--swml-tb-fade(-0)?)\s*:/i;

function hexToRgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Strip /* … */ so a historical reference in a comment is never a failure.
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, function (m) {
        return m.replace(/[^\n]/g, ' ');   // keep line numbers intact
    });
}

const files = ['frontend/wml-canvas.css', 'frontend/wml-styles.css']
    .map(function (f) { return path.join(__dirname, '..', f); })
    .filter(fs.existsSync);

const hits = [];

// A retired DARK value is legitimate inside a LIGHT-theme rule — light uses the dark ink as a
// translucent tint (`rgba(28,29,31,0.06)`) and as type colour. Flagging those produced 15 false
// positives on the first run, and a noisy gate is a gate someone turns off.
const LIGHT_CTX = /theme="light"|swml-canvas-light|\.swml-setup/i;

files.forEach(function (file) {
    const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
    let selector = '';
    lines.forEach(function (line, i) {
        // Track the rule we are inside, so light-theme blocks can be skipped wholesale.
        if (/\{\s*$/.test(line)) selector = line.replace(/\{\s*$/, '').trim();
        else if (/^[^{}]*\{/.test(line)) selector = line.slice(0, line.indexOf('{')).trim();
        if (/^\s*\}/.test(line)) selector = '';
        const scope = selector + ' ' + line;
        if (LIGHT_CTX.test(scope)) return;

        // Check DECLARATION BY DECLARATION. Matching whole lines conflated
        // `background: <live>; color: <retired>` into a false hit.
        line.split(';').forEach(function (decl) {
            const c = decl.indexOf(':');
            if (c < 0) return;
            const prop = decl.slice(0, c);
            const value = decl.slice(c + 1);
            if (!SURFACE_DECL.test(prop + ':')) return;
            RETIRED.forEach(function (entry) {
                const hex = entry[0], why = entry[1], rgb = hexToRgb(hex);
                const reRgb = new RegExp('rgba?\\(\\s*' + rgb[0] + '\\s*,\\s*' + rgb[1] + '\\s*,\\s*' + rgb[2] + '\\s*[,)]');
                let form = null;
                if (new RegExp(hex, 'i').test(value)) form = 'hex ' + hex;
                else if (reRgb.test(value)) form = 'rgba(' + rgb.join(', ') + ', …)  ⚠️ same colour, different spelling';
                if (form) {
                    hits.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: i + 1, form: form, why: why, src: line.trim().slice(0, 96),
                    });
                }
            });
        });
    });
});

console.log('palette-lint: ' + files.length + ' stylesheet(s), ' + RETIRED.length + ' retired value(s) checked.');

if (hits.length) {
    console.error('\n❌ RETIRED SURFACE COLOUR STILL PAINTING (' + hits.length + '):\n');
    hits.forEach(function (h) {
        console.error('   ' + h.file + ':' + h.line);
        console.error('      ' + h.form);
        console.error('      retired: ' + h.why);
        console.error('      ' + h.src + '\n');
    });
    console.error('If the palette moved, sweep BOTH spellings. If a value is coming back, remove it from RETIRED.\n');
    process.exit(1);
}

console.log('✅ no retired surface colour is still painting (hex or rgba).');
