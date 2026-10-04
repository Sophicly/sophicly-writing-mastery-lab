#!/usr/bin/env node
/* eslint-env node */
// paper-anthology-twin-gate.js — v7.20.687 (FIXLIST #714). The mixed-paper anthology map lives in
// TWO places: PAPER_ANTHOLOGY (frontend/wml-core.js — builds the doc) and SWML_REST_API::$PAPER_ANTHOLOGY
// (includes/class-rest-api.php — resolves the roster, the merge family and the attempt pin). If they
// disagree, the client builds a poetry doc the server treats as a single-novel doc (or the reverse):
// the write-key ≠ read-key class (root CLAUDE.md §5d). This fails the build on any difference.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const php = fs.readFileSync(path.join(ROOT, 'includes/class-rest-api.php'), 'utf8');

const jsBlock = (js.match(/const PAPER_ANTHOLOGY = \{([\s\S]*?)\n    \};/) || [])[1];
const phpBlock = (php.match(/private static \$PAPER_ANTHOLOGY = \[([\s\S]*?)\n    \];/) || [])[1];
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
ok(!!jsBlock, 'wml-core.js declares PAPER_ANTHOLOGY');
ok(!!phpBlock, 'class-rest-api.php declares $PAPER_ANTHOLOGY');
if (jsBlock && phpBlock) {
    const norm = (rows) => rows.map((r) => r.join('|')).sort();
    const jsRows = [...jsBlock.matchAll(/'([^']+)':\s*\{\s*poetry:\s*'([^']+)',\s*prose:\s*'([^']+)'\s*\}/g)].map((m) => [m[1], m[2], m[3]]);
    const phpRows = [...phpBlock.matchAll(/'([^']+)'\s*=>\s*\[\s*'poetry'\s*=>\s*'([^']+)',\s*'prose'\s*=>\s*'([^']+)'\s*\]/g)].map((m) => [m[1], m[2], m[3]]);
    ok(jsRows.length > 0, `client lists ${jsRows.length} paper(s)`);
    ok(JSON.stringify(norm(jsRows)) === JSON.stringify(norm(phpRows)),
        'client and server list the same papers → rosters: ' + norm(jsRows).join(' · ') + (JSON.stringify(norm(jsRows)) === JSON.stringify(norm(phpRows)) ? '' : '  ≠ server ' + norm(phpRows).join(' · ')));
}
console.log(fail ? `✗ paper-anthology-twin-gate FAILED (${fail})` : '✓ paper-anthology-twin-gate passed');
process.exit(fail ? 1 : 0);
