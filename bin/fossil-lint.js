#!/usr/bin/env node
/* eslint-env node */
/**
 * fossil-lint.js — v7.20.351
 *
 * ⭐ THE FOSSIL GATE. Fails the build when a turn that gets PERSISTED into chat history
 * bakes a MUTABLE value into its text.
 *
 * WHY THIS EXISTS (Neil, 2026-07-30): "we've come across this issue of fossils in the
 * greetings so many times… can we just get rid of it at its root?" He is right that the
 * per-site fixes never caught up. The reason is that the rule lived in prose (WML
 * CLAUDE.md §4c.7) and had to be REMEMBERED at every new call site, by every model, for
 * ever. It was remembered for the TURN fossils (.284 gate, .345 resume, .324 greeting,
 * .350 anchor) and never once for the VALUE fossils — which is how the Step 6 greeting
 * sat in the database since 2026-07-25 announcing "Rags to Riches" to a student whose
 * artifact said `tragedy`. This file is that rule made mechanical.
 *
 * THE BUG CLASS. `canvasChatHistory` is both the TRANSCRIPT (immutable record, fed to the
 * API) and the SCREEN (replayed VERBATIM on re-entry). So a persisted turn asserting a
 * CURRENT FACT becomes a lie the moment that fact changes.
 *
 * THE DISCRIMINATOR IS TENSE, NOT INTERPOLATION — this is the part that makes a naive
 * "no interpolation in pushes" lint useless (it would fire on ~10 sites, 4 of them
 * correct, and get switched off):
 *   • PAST-EVENT report — "I've received your essay (873 words)" — correct to freeze.
 *     That is what happened. Not a fossil.
 *   • PRESENT-STATE assertion — "You chose **X**" — must stay live.
 *
 * So the gate does NOT flag interpolation. It flags a persisted push whose text is built
 * from a value that came out of a KNOWN LIVE RESOLVER — a function whose whole job is to
 * answer "what is the current value of X?". Those are enumerated below, because that list
 * is short, reviewable, and grows only when someone adds a resolver.
 *
 * THE FIX when it fires: store the token, not the value.
 *     ✗  content: `In Step 5, you chose **${name}**.`
 *     ✓  content: 'In Step 5, you chose **[SWML_LIVE:cw.plotStructure]**.'
 *   register the resolver once via WML.registerLiveValue(name, syncGetter, fallback)
 *   — see the LIVE VALUES block in frontend/wml-core.js.
 *
 * Run: node bin/fossil-lint.js        (whole-repo by nature, like key-lint)
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['frontend/wml-assessment.js', 'frontend/wml-app.js', 'frontend/wml-core.js'];

// Functions whose RETURN VALUE is current-state — baking one into a persisted turn is a
// fossil by construction. Add to this list when you add a resolver of the same kind.
const LIVE_RESOLVERS = [
    '_cwPlotStructureName',
    '_cwPlotStructureNameSync',
    'resolvePlotStructureSlug',
    '_cwDocValue',
    '_cwStep3Value',
    'pickValue',
];

// Calls that PERSIST a turn. Since v7.20.352 there is exactly ONE: recordTurn with
// durable:true. A DOM-only draw (addChatMessage with no record) is fine — that is the
// §4c.7 escape hatch and is not this gate's business.
//
// ⚠️ This regex USED to be `history.push(` . The .352 migration removed every raw push,
// which would have left the old regex matching NOTHING and this gate silently green for
// ever — a dead check that reads as a passing one. That failure mode is the same shape as
// the bug the file exists to stop, so: Check C below now FAILS if a raw push reappears,
// and Check E fails if this file ever matches zero persisting sites.
const PERSIST_RE = /recordTurn\s*\(/;
const RAW_PUSH_RE = /(?:[A-Za-z_$][\w$]*\.)*(?:canvasChatHistory|chatHistory|epChatHistory)\s*\.push\s*\(/;

// How far back a push may reach for the code that built its text, and how many
// assignment hops the value may travel. The real fossil ran FOUR hops —
//   _sn = await _cwPlotStructureName(…)  →  cwPrevContext[6] = `… ${_sn} …`
//   →  prevCtx = cwPrevContext[stepNum]  →  introLine = `… ${prevCtx} …`
//   →  greetingText = `${introLine} …`   →  push({content: greetingText})
// — which is exactly why the first cut of this gate (a single-hop back-search) passed
// the injected defect. Anything less than a transitive trace does not catch the bug it
// was written for.
const WINDOW = 140;
const MAX_HOPS = 8;

// `cwPrevContext[6]` and `obj.foo` both taint their BASE identifier.
function baseIdent(lhs) {
    const m = String(lhs).match(/([A-Za-z_$][\w$]*)/);
    return m ? m[1] : null;
}

let failures = 0;
let scanned = 0;
let persistSites = 0;

for (const rel of FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const lines = fs.readFileSync(abs, 'utf8').split('\n');
    scanned++;

    lines.forEach((line, i) => {
        // ── CHECK C — NO RAW PUSHES. The structural half of the cure (v7.20.352).
        // `history.push(...)` silently means "persist for ever", so persisting was the
        // default you got by NOT THINKING — and that default is the entire turn-fossil
        // class. There is now exactly one way to write a turn, and it will not let you
        // skip the question.
        if (RAW_PUSH_RE.test(line) && rel.indexOf('wml-core') === -1) {
            failures++;
            console.error(
                `❌ RAW PUSH: ${rel}:${i + 1} — write turns through WML.recordTurn(history, entry, ` +
                `{ durable, why }) (or WML.rehydrateTurn on replay).\n` +
                `   A bare .push() persists for ever by default, which is how every turn fossil we ` +
                `have shipped got in.\n` +
                `   Decide it explicitly: "if this fact changes tomorrow, should this sentence still ` +
                `be on the screen?" — no → durable:false (draw it, do not store it).\n` +
                `   > ${line.trim().slice(0, 110)}`
            );
            return;
        }

        if (!PERSIST_RE.test(line)) return;
        persistSites++;

        // ── CHECK D — the decision may never be implicit.
        // Only meaningful on a complete single-line call; a multi-line recordTurn is
        // checked by eye (and there are none today).
        if (/recordTurn\s*\(/.test(line) && /\)\s*;?\s*$/.test(line.trim())) {
            if (!/durable\s*:/.test(line)) {
                failures++;
                console.error(`❌ NO DURABLE FLAG: ${rel}:${i + 1} — recordTurn requires an explicit ` +
                    `\`durable\`. There is no default, deliberately.\n   > ${line.trim().slice(0, 110)}`);
                return;
            }
            if (!/why\s*:/.test(line)) {
                failures++;
                console.error(`❌ NO REASON: ${rel}:${i + 1} — recordTurn requires \`why\`: one short ` +
                    `phrase. It is the review artefact that makes the whole set greppable.\n   > ${line.trim().slice(0, 110)}`);
                return;
            }
            // A turn that is not stored cannot fossilise — no value check needed.
            if (/durable\s*:\s*false/.test(line)) return;
        }

        // ⚠️ STRIP THE `why:` PROSE BEFORE JUDGING THE LINE.
        // Caught by the negative control, and worth keeping as a warning: a `why` string
        // that mentions "[SWML_LIVE:" made the migrated-already test below fire on the
        // COMMENT rather than the code, and the value check silently stopped running. A
        // gate that reads its own documentation as evidence is not a gate.
        const code = line.replace(/why\s*:\s*(['"])(?:\\.|(?!\1).)*\1/g, "why:''");

        const m = code.match(/content:\s*([A-Za-z_$][\w$]*)/);
        const seed = m ? m[1] : null;

        // Build var -> concatenated RHS text, over the window above this push.
        const from = Math.max(0, i - WINDOW);
        const defs = Object.create(null);
        // Assignments are NOT line-anchored in this codebase — the real fossil was written
        // as `if (_sn) cwPrevContext[6] = \`…\`;`, i.e. an assignment mid-line behind a guard.
        // A start-of-line regex misses it, which is how the second cut of this gate ALSO
        // passed the injected defect. Scan every assignment anywhere on the line.
        const ASSIGN_G = /([A-Za-z_$][\w$]*(?:\[[^\]]*\]|\.[\w$]+)*)\s*\+?=(?![=>])/g;
        for (let j = from; j < i; j++) {
            let a;
            ASSIGN_G.lastIndex = 0;
            while ((a = ASSIGN_G.exec(lines[j])) !== null) {
                // Reject comparison/arrow leftovers (`!=`, `<=`, `>=`, `=>`).
                const prev = lines[j][a.index + a[0].length - 2];
                if (prev && '!<>'.indexOf(prev) !== -1) continue;
                const b = baseIdent(a[1]);
                if (!b) continue;
                // RHS = rest of the line, plus continuation lines while a template stays open.
                let rhs = lines[j].slice(a.index + a[0].length);
                let k = j;
                while (k + 1 < i && (rhs.split('`').length - 1) % 2 === 1) { k++; rhs += '\n' + lines[k]; }
                defs[b] = (defs[b] ? defs[b] + '\n' : '') + rhs;
            }
        }

        // Transitively expand the seed's text.
        let text = seed ? (defs[seed] || '') : line;
        if (!seed) text = line;
        const seen = new Set(seed ? [seed] : []);
        for (let hop = 0; hop < MAX_HOPS; hop++) {
            const idents = text.match(/[A-Za-z_$][\w$]*/g) || [];
            let grew = false;
            for (const id of idents) {
                if (seen.has(id) || !defs[id]) continue;
                seen.add(id);
                text += '\n' + defs[id];
                grew = true;
            }
            if (!grew) break;
        }
        // The push line itself may hold an inline template.
        text += '\n' + code;

        if (text.indexOf('${') === -1) return;          // nothing interpolated → nothing to bake
        if (text.indexOf('[SWML_LIVE:') !== -1) return; // already migrated → value is live

        const hits = LIVE_RESOLVERS.filter(fn => text.indexOf(fn) !== -1);
        if (!hits.length) return;

        failures++;
        console.error(
            `❌ FOSSIL: ${rel}:${i + 1} — a turn built (via ${seed || 'an inline template'}) from ` +
            `${hits.join(', ')} is PUSHED into chat history.\n` +
            `   That value can change after the turn is saved, and replay is verbatim, so the ` +
            `stored sentence keeps asserting the OLD value for ever.\n` +
            `   Fix: store a token and register a sync resolver —\n` +
            `        content: '… **[SWML_LIVE:<name>]** …'\n` +
            `        WML.registerLiveValue('<name>', syncGetter, 'a true-but-vaguer fallback')\n` +
            `   (or, if the turn is DERIVED state rather than a real turn, draw it DOM-only per ` +
            `WML CLAUDE.md §4c.7 and do not push it at all.)`
        );
    });
}

if (!scanned) {
    console.error('❌ fossil-lint: no source files found — wrong working directory?');
    process.exit(1);
}

// ── CHECK E — THE GATE MUST NOT BE ABLE TO DIE QUIETLY.
// A lint whose pattern stops matching reports success for ever, and a green check nobody
// questions is worse than no check. (This nearly happened: the .352 migration removed every
// raw `.push`, which the pre-.352 PERSIST_RE keyed on.) If there are no persisting sites at
// all, something moved — fail and make a human look.
if (persistSites === 0) {
    console.error('❌ fossil-lint: found ZERO persisting turn sites. Either the funnel was renamed or '
        + 'this gate has gone blind. A lint that matches nothing passes everything — fix the pattern.');
    process.exit(1);
}

if (failures) {
    console.error(`\nfossil-lint FAILED — ${failures} turn-persistence defect(s).`);
    process.exit(1);
}
console.log(`✅ fossil-lint passed (${scanned} file(s), ${persistSites} persisting turn site(s): no raw pushes, every turn declares durable+why, no mutable values baked in).`);
