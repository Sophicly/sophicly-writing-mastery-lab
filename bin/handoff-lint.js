#!/usr/bin/env node
/* eslint-env node */
/**
 * handoff-lint — check what a handoff CLAIMS against what the code actually says.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS (Neil, 2026-07-29):
 *   "We're constantly doing handoffs… the other chats are not necessarily gonna say exactly
 *    the right thing. Do we have a method of checking and assessing handoffs to see whether
 *    the information they're giving is actually correct or optimal? We don't wanna just
 *    follow what they say."
 *
 * A handoff is prose written by a chat that can no longer be asked what it meant. Two real
 * examples from the 2026-07-29 batch, both of which cost time:
 *   • FALSE CLAIM  — "_writeOutlineRowField never scrolls, fix it there". It had scrolled
 *     since v7.20.52. Following the instruction would have double-scrolled every fill.
 *     ← THIS LINTER CATCHES THAT CLASS.
 *   • TRUE-BUT-WRONG — "tick the box the way tickSoleIdea() does (setNodeMarkup)". The
 *     function exists, so nothing mechanical can fault the reference; it is simply the wrong
 *     tool, because the radio-clear lives in the checkbox's click handler.
 *     ← NO LINTER CAN CATCH THAT. See THE LIMIT below.
 *
 * ⭐ THE LIMIT, STATED SO NOBODY MISTAKES A PASS FOR SAFETY.
 * This checks REFERENCES, not JUDGEMENT. A green run means the handoff's citations are real
 * and current — NOT that its advice is correct. The durable fix for advice is not a linter:
 *
 *     If a handoff has to TELL the next chat something in order to avoid a bug,
 *     that thing belongs in a GATE, not in the handoff.
 *
 * Handoffs should carry STATE and INTENT ("here is where we are, here is what Neil ruled").
 * TECHNIQUE ("call this function, not that one") belongs in bin/*-harness.js, where it fails
 * the build instead of relying on somebody reading a document and complying.
 *
 * USAGE
 *   node bin/handoff-lint.js --current           # ⭐ the one you are about to FOLLOW (start here)
 *   node bin/handoff-lint.js                     # lints ~/.claude/handoffs/open for this plugin
 *   node bin/handoff-lint.js <dir-or-file> ...   # lint specific paths
 *   node bin/handoff-lint.js --all               # every area, not just this plugin
 *
 * Exit 1 on ERRORS (a citation that is provably wrong). Warnings never fail the build —
 * they are for a human to judge.
 *
 * ⚠ NOT IN pre-ship-check.sh YET, deliberately. The first full run found 207 provably-wrong
 * claims across 358 open handoffs — nearly all in old, superseded documents nobody will read
 * again. Wiring that into the build would just teach everyone to ignore a red gate. The
 * sequence is: use `--current` per session → prune the queue → THEN make the full run a gate.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOME = process.env.HOME || process.env.USERPROFILE;
const DEFAULT_DIR = path.join(HOME, '.claude', 'handoffs', 'open');

const argv = process.argv.slice(2);
const ALL_AREAS = argv.includes('--all');
const CURRENT_ONLY = argv.includes('--current');
const targets = argv.filter((a) => !a.startsWith('--'));

let errors = 0, warnings = 0, checked = 0, filesLinted = 0;
const err = (f, m) => { errors++; console.log(`  ❌ ${m}`); };
const warn = (f, m) => { warnings++; console.log(`  ⚠️  ${m}`); };

// ── the code we lint claims against ─────────────────────────────────────────────────────
const sourceCache = new Map();
function readSource(rel) {
    if (sourceCache.has(rel)) return sourceCache.get(rel);
    const p = path.join(ROOT, rel);
    const v = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    sourceCache.set(rel, v);
    return v;
}
// Every file we might resolve a bare basename against.
const INDEXED = [];
(function indexTree(dir, depth) {
    if (depth > 3) return;
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of ents) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name.startsWith('.')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) indexTree(full, depth + 1);
        else if (/\.(js|php|css|md|json|sh)$/.test(e.name)) INDEXED.push(path.relative(ROOT, full));
    }
})(ROOT, 0);

function resolveFile(name) {
    const direct = INDEXED.find((f) => f === name);
    if (direct) return direct;
    const base = INDEXED.filter((f) => path.basename(f) === path.basename(name));
    return base.length === 1 ? base[0] : (base.length ? base : null);
}

// One concatenated blob of the plugin's JS/PHP, for identifier existence checks.
let CODE_BLOB = null;
function codeBlob() {
    if (CODE_BLOB !== null) return CODE_BLOB;
    CODE_BLOB = INDEXED.filter((f) => /\.(js|php)$/.test(f) && !f.startsWith('bin/'))
        .map((f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } })
        .join('\n');
    return CODE_BLOB;
}

// ── the checks ──────────────────────────────────────────────────────────────────────────

// 1. VERSION CLAIMS. "STAGING = v7.20.334" is the single most re-read line in a handoff and
//    the first thing to go stale. Compare against the version actually in the tree.
function checkVersions(text, file) {
    const pluginPhp = INDEXED.find((f) => /^sophicly-[a-z-]+\.php$/.test(f));
    if (!pluginPhp) return;
    const src = readSource(pluginPhp) || '';
    const m = /^\s*\*\s*Version:\s*([0-9.]+)/m.exec(src);
    if (!m) return;
    const actual = m[1];
    const re = /\b(PROD|STAGING|COMMITTED[^|\n]{0,30})\b[^\n]{0,80}?\bv?(\d+\.\d+\.\d+)/gi;
    let hit;
    while ((hit = re.exec(text))) {
        checked++;
        const [, envRaw, claimed] = hit;
        const env = envRaw.toUpperCase();
        // Only the local tree is knowable offline. A COMMITTED/local claim must match it;
        // PROD/STAGING are remote truth and can legitimately differ.
        if (/COMMITTED/.test(env) && claimed !== actual) {
            warn(file, `claims ${envRaw.trim()} = v${claimed}, but the tree is v${actual} — one of them is stale`);
        }
    }
}

// 2. file:line CITATIONS. The strongest claim a handoff makes, and fully checkable.
function checkCitations(text, file) {
    const re = /([A-Za-z0-9_.\-/]+\.(?:js|php|css|md|sh))(?::(\d+)(?:-(\d+))?)?/g;
    const seen = new Set();
    let hit;
    while ((hit = re.exec(text))) {
        const [, name, lineStr] = hit;
        const key = name + ':' + (lineStr || '');
        if (seen.has(key)) continue;
        seen.add(key);
        if (/^https?:/.test(name) || name.includes('..')) continue;
        checked++;
        const resolved = resolveFile(name);
        if (!resolved) {
            // Handoffs legitimately name files in OTHER plugins; only fault paths that look
            // like they belong to this one.
            if (/^(frontend|includes|bin|protocols|templates)\//.test(name)) {
                err(file, `cites ${name}, which does not exist in this plugin`);
            }
            continue;
        }
        if (Array.isArray(resolved)) continue;   // ambiguous basename — can't fault it
        if (!lineStr) continue;
        const src = readSource(resolved) || '';
        const lines = src.split('\n').length;
        if (parseInt(lineStr, 10) > lines) {
            err(file, `cites ${name}:${lineStr}, but that file has only ${lines} lines — the citation has drifted`);
        }
    }
}

// 3. NAMED IDENTIFIERS. "use `_tickRowLikeAStudent`" / "copy `serveLoglinePicker()`".
//    A handoff that names a function which no longer exists is actively misleading.
function checkIdentifiers(text, file) {
    const blob = codeBlob();
    const re = /`(_?[A-Za-z][A-Za-z0-9_]{3,60})\(?\)?`/g;
    const seen = new Set();
    let hit;
    while ((hit = re.exec(text))) {
        const id = hit[1];
        if (seen.has(id)) continue;
        seen.add(id);
        // Only judge things that LOOK like our code: a leading underscore, or the handoff
        // wrote it with parentheses. Prose in backticks is not a claim about code.
        const looksLikeCode = id.startsWith('_') || /\(\)`$/.test(hit[0]);
        if (!looksLikeCode) continue;
        checked++;
        if (!blob.includes(id)) {
            err(file, `names \`${id}\`, which does not exist anywhere in the plugin source — ` +
                'following this instruction would send the next chat looking for something that is gone');
        }
    }
}

// 4. STALENESS. A handoff written before the code it describes was last changed is a
//    suspect, not a fault — git is the arbiter.
function checkStaleness(text, file) {
    const dm = /^from:\s*.*?(\d{4}-\d{2}-\d{2})/m.exec(text);
    if (!dm) return;
    const written = dm[1];
    const named = new Set();
    const re = /\b((?:frontend|includes|bin)\/[A-Za-z0-9_.\-/]+\.(?:js|php|css))\b/g;
    let hit;
    while ((hit = re.exec(text))) named.add(hit[1]);
    named.forEach((rel) => {
        if (!resolveFile(rel)) return;
        let last = '';
        try {
            last = execSync(`git log -1 --format=%cs -- "${rel}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
        } catch (_) { return; }
        if (last && last > written) {
            checked++;
            warn(file, `describes ${rel}, which was changed on ${last} — after this handoff was written (${written}). Re-read before trusting its claims about that file.`);
        }
    });
}

// 5. PRESCRIPTION WITHOUT PROOF. The class that bit us. We cannot judge whether advice is
//    right — but we CAN insist that advice which names a technique cites the code that
//    proves it, so the next chat has somewhere to check instead of complying blind.
function checkPrescriptions(text, file) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        if (!/\b(use|copy|call|mirror|reuse|follow)\b/i.test(line)) return;
        if (!/`_?[A-Za-z][A-Za-z0-9_]{3,}\(?\)?`/.test(line)) return;
        if (/UNVERIFIED|ASSUMED|not verified|do not trust/i.test(line)) return;   // honestly flagged
        // Proof = a file:line, or a version stamp, somewhere in this line or the two after it.
        const near = lines.slice(i, i + 3).join(' ');
        if (/\.(?:js|php|css):\d+|\bv\d+\.\d+\.\d+\b/.test(near)) return;
        checked++;
        warn(file, `line ${i + 1}: prescribes a technique with no file:line proof and no UNVERIFIED marker —\n        "${line.trim().slice(0, 110)}"`);
    });
}

// ── run ─────────────────────────────────────────────────────────────────────────────────
function lintFile(p) {
    const text = fs.readFileSync(p, 'utf8');
    if (!ALL_AREAS) {
        const areaOk = /plugin:\s*sophicly-writing-mastery-lab/.test(text) || /^area:\s*wml/m.test(text);
        if (!areaOk) return;
    }
    filesLinted++;
    const before = errors + warnings;
    console.log(`\n── ${path.basename(p)}`);
    checkVersions(text, p);
    checkCitations(text, p);
    checkIdentifiers(text, p);
    checkStaleness(text, p);
    checkPrescriptions(text, p);
    if (errors + warnings === before) console.log('  ✓ every checkable claim holds');
}

const paths = [];
// --current: the newest START-HERE for this area. That is the document a session actually
// FOLLOWS, so it is the one whose claims have to hold. Everything else in open/ is history.
if (CURRENT_ONLY && !targets.length) {
    const cands = fs.readdirSync(DEFAULT_DIR)
        .filter((f) => f.endsWith('.md') && /START-HERE/i.test(f) && /^wml-/i.test(f))
        .map((f) => ({ f, t: fs.statSync(path.join(DEFAULT_DIR, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t);
    if (!cands.length) { console.error('handoff-lint: no wml START-HERE handoff found in ' + DEFAULT_DIR); process.exit(1); }
    targets.push(path.join(DEFAULT_DIR, cands[0].f));
}
(targets.length ? targets : [DEFAULT_DIR]).forEach((t) => {
    const abs = path.resolve(t);
    if (!fs.existsSync(abs)) { console.error(`handoff-lint: no such path — ${abs}`); process.exit(1); }
    if (fs.statSync(abs).isDirectory()) {
        fs.readdirSync(abs).filter((f) => f.endsWith('.md')).forEach((f) => paths.push(path.join(abs, f)));
    } else paths.push(abs);
});

console.log('HANDOFF LINT — do the handoff\'s claims still match the code?');
paths.forEach(lintFile);

console.log(`\n${filesLinted} handoff(s) linted · ${checked} claim(s) checked · ${errors} error(s) · ${warnings} warning(s)`);
console.log('⚠️  This checks REFERENCES, not JUDGEMENT. A pass means the citations are real and');
console.log('   current — not that the advice is right. Technique that must not be got wrong');
console.log('   belongs in a gate (bin/*-harness.js), not in a handoff.');
if (errors) { console.error('\n❌ handoff-lint FAILED — a handoff makes a provably wrong claim about the code.'); process.exit(1); }
console.log('\n✅ handoff-lint passed.');
