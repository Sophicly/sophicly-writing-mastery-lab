#!/usr/bin/env node
/* eslint-env node */
/**
 * css-lint.js — a PARSE gate for WML's stylesheets. v7.20.372.
 *
 * ⭐ WHY THIS EXISTS. v7.20.371 shipped a stylesheet whose comment block closed early, leaving six
 * lines of English prose sitting in the stylesheet as raw tokens, followed by a stray `*​/`. CSS has
 * no fatal errors — the parser simply RESYNCS by discarding tokens until it finds something that
 * looks like a rule again, so the garbage silently ate the rules after it. Neil opened Step 6 to an
 * unstyled dynamic island and a giant black circle over his document.
 *
 * `pre-ship-check.sh` ran `node --check` on JS and `php -l` on PHP and was completely blind to CSS,
 * which is 6,000+ lines of this plugin's UI. Every gate in bin/ inspects behaviour or data; none of
 * them looked at the stylesheet at all. This closes that.
 *
 * ⚠️ THE CHECKS ARE STRUCTURAL, NOT STYLISTIC. This is not a linter for taste — it fails only on
 * things that CANNOT be intentional and that a browser will silently paper over:
 *   1. unterminated / doubly-terminated block comments (the .371 defect, exactly)
 *   2. unbalanced braces
 *   3. a declaration outside any rule block
 *   4. a stray `*​/` with no opening `/​*`
 *
 * Run: node bin/css-lint.js [file ...]   (defaults to every .css under frontend/)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let files = process.argv.slice(2);
if (!files.length) {
    const dir = path.join(ROOT, 'frontend');
    files = fs.readdirSync(dir).filter(f => f.endsWith('.css')).map(f => path.join(dir, f));
}

const problems = [];
function fail(file, line, msg) {
    problems.push(`${path.relative(ROOT, file)}:${line} — ${msg}`);
}
const lineAt = (src, idx) => src.slice(0, idx).split('\n').length;

for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');

    // ── 1 + 4. Comment terminators. Walk the source as the parser does: inside a comment nothing
    // else is a token, and a `*/` outside one is garbage the parser must discard.
    let i = 0, depthOpenAt = -1;
    const stripped = [];          // the source with comments blanked, for the brace/decl passes
    let last = 0;
    while (i < src.length) {
        if (depthOpenAt === -1) {
            const open = src.indexOf('/*', i);
            const stray = src.indexOf('*/', i);
            if (stray !== -1 && (open === -1 || stray < open)) {
                fail(file, lineAt(src, stray), 'a stray `*/` closes a comment that was never opened — '
                    + 'everything before it has been parsed as stylesheet tokens, not as prose');
                i = stray + 2;
                continue;
            }
            if (open === -1) break;
            stripped.push(src.slice(last, open));
            depthOpenAt = open;
            i = open + 2;
        } else {
            const close = src.indexOf('*/', i);
            if (close === -1) {
                fail(file, lineAt(src, depthOpenAt), 'this block comment is never closed — the rest of '
                    + 'the stylesheet is inside it and does nothing');
                depthOpenAt = -1;
                last = src.length;
                break;
            }
            // Blank the comment but keep its newlines so line numbers survive.
            stripped.push(src.slice(depthOpenAt, close + 2).replace(/[^\n]/g, ' '));
            last = close + 2;
            i = close + 2;
            depthOpenAt = -1;
        }
    }
    if (depthOpenAt === -1) stripped.push(src.slice(last));
    const code = stripped.join('');

    // ── 2. Braces balance.
    const noStr = code.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, '""');
    const opens = (noStr.match(/\{/g) || []).length;
    const closes = (noStr.match(/\}/g) || []).length;
    if (opens !== closes) fail(file, 1, `brace parity: ${opens} \`{\` vs ${closes} \`}\``);

    // ── 3. A declaration outside any rule. This is what raw prose looks like to the parser, and it
    // is the check that would have caught .371 even if the comment had been closed differently.
    // Only fires at nesting depth 0, where nothing but a selector, an at-rule or a comment is legal.
    let depth = 0;
    const lines = noStr.split('\n');
    let buf = '', bufLine = 0;
    for (let n = 0; n < lines.length; n++) {
        const L = lines[n];
        for (const ch of L) {
            if (ch === '{') { depth++; buf = ''; continue; }
            if (ch === '}') { depth = Math.max(0, depth - 1); buf = ''; continue; }
            if (ch === ';' && depth === 0) {
                const t = buf.trim();
                // An at-rule statement (@import, @charset, @namespace) legitimately ends in `;`.
                if (t && !t.startsWith('@')) {
                    fail(file, bufLine || n + 1, `a declaration sits outside any rule block: "${t.slice(0, 70)}"`
                        + ' — the parser discards this and can swallow the rules after it');
                }
                buf = '';
                continue;
            }
            if (!buf) bufLine = n + 1;
            buf += ch;
        }
        if (depth === 0) buf += '\n';
    }
}

if (problems.length) {
    console.error('❌ css-lint FAILED:');
    problems.forEach(p => console.error('   ' + p));
    process.exit(1);
}
console.log(`✅ css-lint passed (${files.length} stylesheet(s): comments closed, braces balanced, no declaration outside a rule).`);
