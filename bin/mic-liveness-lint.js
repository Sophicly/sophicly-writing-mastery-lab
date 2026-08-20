#!/usr/bin/env node
/* eslint-env node */
/**
 * mic-liveness-lint — a dictation failure must put WORDS ON THE SCREEN.
 * =====================================================================
 * v7.20.541 (FIXLIST #341).
 *
 * WHY THIS IS A GATE AND NOT A PARAGRAPH
 * --------------------------------------
 * WML had SIX independent microphone surfaces. Every one of them handled failure by
 * restoring the button and calling `console.warn`, so the student watched the mic go
 * live, stop, and say nothing. Neil, 2026-08-08: *"I don't see any students actually
 * using it, which is weird."* Confirmed 2026-08-20: on an iPad, tapping the mic does
 * NOTHING AT ALL.
 *
 * Two of the six had ALREADY been given a user-facing message (v7.15.22, v7.19.834) and
 * the fix was never carried to their twins — the dual-pipeline drift this repo's
 * CLAUDE.md warns about, in its purest form. That is the proof that "remember to tell
 * the student" cannot live in prose: `console.warn` is what you get by NOT thinking,
 * and a default beats a rule (the same argument as bin/reachability-lint.js).
 *
 * WHAT IT CHECKS — three things, all mechanical:
 *   1. Every `new SpeechRecognition()` / `new SR()` surface has an `onerror` handler
 *      that reaches the shared helper (`WML.micNotify` or `WML.micRecordFailure`).
 *   2. No mic surface refuses with a BARE `alert('… not supported …')` — the copy must
 *      come from `WML.micFailureMessage`, so device-specific advice (Settings → Safari →
 *      Microphone, rather than "check Chrome settings") cannot drift per surface.
 *   3. Every `.start()` on a recognition object is inside a `try` — an unguarded throw
 *      is the *other* silent path, and it is invisible to `node --check`.
 *
 * ⛔ WHAT A PASS DOES NOT MEAN. It proves the failure has a ROUTE to the screen. It does
 * not prove the words are good, that the surface's own renderer works, or that the mic
 * itself functions on any given device. Only a real device answers that — which is why
 * every message carries the raw engine code in brackets, so the next student to hit it
 * reports the cause without us needing the device (root §19: measure, never guess).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['frontend/wml-app.js', 'frontend/wml-assessment.js', 'frontend/wml-selection-chip.js'];

const HELPER = /WML\.micNotify|WML\.micRecordFailure/;
const failures = [];
let surfaces = 0, guardedStarts = 0;

/** Return the balanced-brace body that starts at the first `{` at or after `from`. */
function blockAt(src, from) {
    const open = src.indexOf('{', from);
    if (open === -1) return '';
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return src.slice(open, i + 1); }
    }
    return src.slice(open);
}

const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

for (const rel of FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) { failures.push(`${rel}: file not found`); continue; }
    const src = fs.readFileSync(abs, 'utf8');

    // ── 1. every onerror handler on a recognition object must reach the helper ──
    const errRe = /(\w+)\.onerror\s*=\s*(?:\(|function)/g;
    let m;
    while ((m = errRe.exec(src)) !== null) {
        const owner = m[1];
        // Only recognition objects — not <img>/<audio>/<script> onerror, which are unrelated.
        if (!/rec|recognition/i.test(owner)) continue;
        surfaces++;
        const body = blockAt(src, m.index);
        if (!HELPER.test(body)) {
            failures.push(
                `${rel}:${lineOf(src, m.index)} — \`${owner}.onerror\` never calls WML.micNotify/micRecordFailure. ` +
                `A dictation failure that only reaches the console is invisible to a student on a tablet.`
            );
        }
    }

    // ── 2. no bare alert() for the unsupported/failed branches ──
    const alertRe = /alert\(\s*['"][^'"]*(?:Voice input|Voice dictation|Microphone access)[^'"]*['"]/g;
    while ((m = alertRe.exec(src)) !== null) {
        failures.push(
            `${rel}:${lineOf(src, m.index)} — hand-written mic copy in an alert(). ` +
            `Use WML.micNotify/WML.micFailureMessage so every surface says the same thing and the ` +
            `Apple wording ("Settings → Safari → Microphone") cannot drift back to "check Chrome settings".`
        );
    }

    // ── 3. every recognition .start() must be inside a try ──
    const startRe = /(\w*(?:rec|recognition)\w*)\.start\(\)/gi;
    while ((m = startRe.exec(src)) !== null) {
        guardedStarts++;
        // Look back a short window for the `try {` that encloses it.
        const before = src.slice(Math.max(0, m.index - 400), m.index);
        if (!/\btry\s*\{[^}]*$/.test(before) && !/\btry\s*\{/.test(before.slice(-200))) {
            failures.push(
                `${rel}:${lineOf(src, m.index)} — \`${m[1]}.start()\` is not inside a try. ` +
                `A throw here is silent: the button does nothing and the exception dies in the console.`
            );
        }
    }
}

if (failures.length) {
    console.error('\x1b[31m✖ mic-liveness-lint FAILED\x1b[0m\n');
    failures.forEach(f => console.error('  · ' + f));
    console.error(`\n  A microphone that fails silently reads to a student as a broken button, and they ` +
                  `never come back to it (FIXLIST #341/#350).`);
    process.exit(1);
}

console.log(`\x1b[32m✔ mic-liveness-lint: ${surfaces} dictation surface(s), ${guardedStarts} guarded start(s) — ` +
            `every failure has a route to the screen.\x1b[0m`);
