#!/usr/bin/env node
/* eslint-env node */
/**
 * reachability-lint.js — v7.20.474 (FIXLIST #343)
 *
 * WHY THIS EXISTS
 * ───────────────
 * On 2026-08-08 students on iPads in landscape could not see the chat input AT ALL. They could
 * not type. It was on production, and nobody caught it, because:
 *
 *   • every mechanical gate passed — they check data, keys, markers and walks, none of which
 *     have any opinion about whether a control is on the screen;
 *   • the root CLAUDE.md §CONTENT-MUST-SCROLL section ALREADY named both causes in prose,
 *     including the exact words "set `min-height:0` on the scroller". It still shipped.
 *
 * That is the lesson this file encodes: A RULE IN PROSE LOSES TO A DEFAULT IN CODE. `min-height`
 * defaults to `auto`, and `auto` is what you get by not thinking about it. The only fix that
 * holds is one that fails the build.
 *
 * WHAT IT CHECKS — the two causes, both mechanical, both whole-repo:
 *
 *   CHECK A — A VERTICAL SCROLLER THAT CAN GROW MUST DECLARE `min-height: 0`.
 *     A flex child with `overflow-y: auto|scroll` and a growing `flex` defaults to
 *     `min-height: auto`, so it expands to its content instead of scrolling, and pushes whatever
 *     follows it (an input, a Send button, a Sign control) out of the parent. If the parent is
 *     `overflow: hidden` — as ours is — that content is CLIPPED, not merely below a fold, and no
 *     amount of scrolling reaches it. This is the exact defect that shipped.
 *
 *   CHECK B — A FULL-VIEWPORT HEIGHT MUST CARRY A `dvh` COMPANION.
 *     On iOS/iPadOS `100vh` is the viewport with the browser bars COLLAPSED, i.e. TALLER than
 *     what is visible. A fixed shell sized in `vh` therefore puts its own bottom edge underneath
 *     Safari's chrome. Anything living at the bottom of that shell — again, the input — is
 *     off-screen and unreachable. `dvh` tracks the visible viewport. The `vh` line stays as the
 *     fallback, so this asks for BOTH, never a replacement.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   It does not prove a control is reachable — only a real browser at a real viewport can do
 *   that. It rules out the two failures that HAVE bitten us, cheaply, on every commit. Treat a
 *   pass as "these two traps are absent", never as "the screen works".
 *
 * OPT-OUT: append `/* reachability-lint: ok - <reason> *\/` inside the rule. A reason is
 * required — an unexplained exemption is how a gate rots.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHEETS = fs.readdirSync(path.join(ROOT, 'frontend'))
    .filter(f => f.endsWith('.css'))
    .map(f => path.join('frontend', f));

let failures = [];
let checked = { scrollers: 0, vh: 0 };

/** Split a stylesheet into top-level-ish rule blocks: {selector, body, line}. */
function blocks(css) {
    const out = [];
    let i = 0, depth = 0, selStart = 0, bodyStart = -1, line = 1;
    const lineAt = idx => css.slice(0, idx).split('\n').length;
    while (i < css.length) {
        const ch = css[i];
        if (ch === '{') {
            if (depth === 0) { bodyStart = i; }
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0 && bodyStart !== -1) {
                const selector = css.slice(selStart, bodyStart).trim();
                const body = css.slice(bodyStart + 1, i);
                // @media / @supports wrappers: recurse so nested rules are checked too.
                if (/^@(media|supports|container)/i.test(selector)) {
                    for (const inner of blocks(body)) {
                        out.push({ ...inner, line: lineAt(bodyStart) + inner.line - 1 });
                    }
                } else if (selector && !selector.startsWith('@')) {
                    out.push({ selector, body, line: lineAt(bodyStart) });
                }
                selStart = i + 1;
                bodyStart = -1;
            }
        }
        i++;
    }
    return out;
}

/** Declarations, comments stripped, as [prop, value] pairs. */
function decls(body) {
    const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
    return clean.split(';')
        .map(d => d.trim())
        .filter(Boolean)
        .map(d => {
            const idx = d.indexOf(':');
            if (idx === -1) return null;
            return [d.slice(0, idx).trim().toLowerCase(), d.slice(idx + 1).trim().toLowerCase()];
        })
        .filter(Boolean);
}

const exempt = body => /reachability-lint:\s*ok\s*-\s*\S/i.test(body);

for (const rel of SHEETS) {
    const css = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    for (const { selector, body, line } of blocks(css)) {
        if (exempt(body)) continue;
        const d = decls(body);
        const get = p => { const hit = d.filter(x => x[0] === p); return hit.length ? hit[hit.length - 1][1] : null; };
        const all = p => d.filter(x => x[0] === p).map(x => x[1]);

        // ── CHECK A ──────────────────────────────────────────────────────────
        const oy = get('overflow-y') || get('overflow');
        const scrollsVertically = oy && /\b(auto|scroll)\b/.test(oy);
        if (scrollsVertically) {
            const flex = get('flex');
            const grow = get('flex-grow');
            // `flex: 1`, `flex: 1 1 auto`, `flex-grow: 1` — anything that can grow.
            const canGrow = (flex && !/^(none|0\s+0\s+auto|0\s+1\s+auto|initial)$/.test(flex)
                                  && /^\s*[1-9]/.test(flex))
                         || (grow && parseFloat(grow) > 0);
            if (canGrow) {
                checked.scrollers++;
                const mh = get('min-height');
                if (!mh || !/^0(px|%)?$/.test(mh)) {
                    failures.push(
                        `${rel}:${line}  ${selector}\n` +
                        `      a growing flex child scrolls vertically but does not set 'min-height: 0'.\n` +
                        `      It will expand to its content instead of scrolling, pushing whatever follows\n` +
                        `      it (an input, a Send button) out of the parent — clipped, not reachable.\n` +
                        `      FIX: add 'min-height: 0;'  (root CLAUDE.md §CONTENT MUST SCROLL, point 2)`
                    );
                }
            }
        }

        // ── CHECK B ──────────────────────────────────────────────────────────
        for (const prop of ['height', 'max-height', 'min-height']) {
            const values = all(prop);
            if (!values.length) continue;
            const usesVh = values.some(v => /\b\d*\.?\d+vh\b/.test(v));
            if (!usesVh) continue;
            checked.vh++;
            const usesDvh = values.some(v => /\b\d*\.?\d+dvh\b/.test(v));
            if (!usesDvh) {
                failures.push(
                    `${rel}:${line}  ${selector}\n` +
                    `      '${prop}' is sized in 'vh' with no 'dvh' companion.\n` +
                    `      On iOS/iPadOS 'vh' measures the viewport with the browser bars COLLAPSED, so the\n` +
                    `      bottom of this box sits under Safari's chrome and anything in it is off-screen.\n` +
                    `      FIX: keep the vh line as the fallback and add the same declaration in 'dvh'\n` +
                    `      immediately after it.`
                );
            }
        }
    }
}

console.log(`reachability-lint: ${SHEETS.length} stylesheet(s) · ${checked.scrollers} growing scroller(s) · ${checked.vh} viewport-height decl(s).`);
if (failures.length) {
    console.error(`\n❌ reachability-lint FAILED — ${failures.length} control(s) could become unreachable:\n`);
    failures.forEach(f => console.error('  ' + f + '\n'));
    console.error('  A student who cannot reach an input cannot do the lesson. This gate exists because');
    console.error('  that shipped to production on 2026-08-08 (FIXLIST #343) while every other gate passed.\n');
    process.exit(1);
}
console.log('✅ reachability-lint passed (no growing scroller misses min-height:0; every vh height has a dvh companion).');
