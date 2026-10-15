#!/usr/bin/env node
/* eslint-env node */
/**
 * min-build-harness.js — v7.20.905 (FIXLIST wml-cold-load, from Web Design 123).
 *
 * MEASURED on prod (15 Oct): a student's first visit to a WML lesson took 14–16 s; wml-assessment.js was 1.1 MB after
 * compression. bin/build-min.sh builds minified copies at deploy (452 KB) and swml_js_src() serves them.
 *
 * What it proves:
 *   A. SERVING RULE — swml_js_src, EXECUTED in PHP on real files: a current .min is served; a stale one (older than its
 *      source — a deploy that skipped the build), a missing one, SCRIPT_DEBUG, ?swml_src=1 and the swml_minified_js=off
 *      option all serve the source.
 *   B. WIRING — both enqueue paths load core + assessment through swml_js_src; both deploy scripts build after the gate
 *      and before the rsync; the outputs are git-ignored (the source stays the one file anyone edits or gates).
 *   C. FALSIFY — a rule without the freshness test serves a stale build (caught by A).
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PHP = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

const fnM = PHP.match(/function swml_js_src\(\$name\) \{[\s\S]*?\n\}\n/);
ok(!!fnM, 'swml_js_src() found in the main plugin file');

function runCases(fnSrc, quiet) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swmlmin-'));
    fs.mkdirSync(path.join(dir, 'frontend'));
    const script = `<?php
define('SWML_PATH', ${JSON.stringify(dir + '/')}); define('SWML_URL', 'U/');
$GLOBALS['opt'] = 'on';
function get_option($k, $d = null) { return $k === 'swml_minified_js' ? $GLOBALS['opt'] : $d; }
${fnSrc}
$f = SWML_PATH . 'frontend/x.js'; $m = SWML_PATH . 'frontend/x.min.js';
$out = [];
file_put_contents($f, 'a'); touch($f, 1000); file_put_contents($m, 'b'); touch($m, 2000);
$out['current'] = swml_js_src('x');
touch($m, 500);
$out['stale'] = swml_js_src('x');
touch($m, 2000); $GLOBALS['opt'] = 'off';
$out['option-off'] = swml_js_src('x');
$GLOBALS['opt'] = 'on'; $_GET['swml_src'] = '1';
$out['query'] = swml_js_src('x');
unset($_GET['swml_src']); unlink($m);
$out['missing'] = swml_js_src('x');
file_put_contents($m, 'b'); touch($m, 2000); define('SCRIPT_DEBUG', true);
$out['script-debug'] = swml_js_src('x');
echo json_encode($out);
`;
    const sp = path.join(dir, 't.php');
    fs.writeFileSync(sp, script);
    let got;
    try { got = JSON.parse(execFileSync('php', [sp], { encoding: 'utf8' })); } catch (e) { got = { error: String(e.message).slice(0, 200) }; }
    fs.rmSync(dir, { recursive: true, force: true });
    const want = { current: 'U/frontend/x.min.js', stale: 'U/frontend/x.js', 'option-off': 'U/frontend/x.js', query: 'U/frontend/x.js', missing: 'U/frontend/x.js', 'script-debug': 'U/frontend/x.js' };
    const bad = [];
    for (const k of Object.keys(want)) {
        const good = got[k] === want[k];
        if (!good) bad.push(k);
        if (!quiet) ok(good, k + ' → ' + (got[k] || JSON.stringify(got)));
    }
    return bad;
}

console.log('A. the serving rule, executed');
if (fnM) runCases(fnM[0], false);

console.log('B. wiring');
const body = (name) => { const i = PHP.indexOf('function ' + name); return i < 0 ? '' : PHP.slice(i, PHP.indexOf('\n    }\n', i)); };
for (const fn of ['enqueue_assets', 'enqueue_embed_assets']) {
    const b = body(fn);
    ok(/'swml-core',\s*swml_js_src\('wml-core'\)/.test(b), fn + ': swml-core loads through swml_js_src');
    ok(/'swml-assessment',\s*swml_js_src\('wml-assessment'\)/.test(b), fn + ': swml-assessment loads through swml_js_src');
    ok(!/SWML_URL \. 'frontend\/wml-(?:core|assessment)\.js'/.test(b), fn + ': no direct source URL left for either');
}
for (const d of ['deploy-staging.sh', 'deploy-production.sh']) {
    const s = fs.readFileSync(path.join(ROOT, d), 'utf8');
    const g = s.indexOf('bin/pre-ship-check.sh'), m = s.indexOf('bin/build-min.sh'), r = s.indexOf('rsync -avz');
    ok(g > 0 && m > g && r > m, d + ': gate → build → rsync, in that order');
    ok(/build-min\.sh" \|\| \{ echo .*exit 1; \}/.test(s), d + ': a failed build aborts the deploy');
}
const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
['frontend/wml-assessment.min.js', 'frontend/wml-core.min.js'].forEach(f => ok(gi.split('\n').includes(f), '.gitignore holds ' + f));
const bm = fs.readFileSync(path.join(ROOT, 'bin', 'build-min.sh'), 'utf8');
ok(/for f in wml-assessment wml-core; do/.test(bm) && /--keep-fnames/.test(bm) && /node --check "\$f\.min\.js"/.test(bm), 'build-min.sh builds both, keeps function names (readable stack traces), and syntax-checks each');

console.log('C. falsify');
if (fnM) {
    const mut = fnM[0].replace(' && @filemtime(SWML_PATH . $min) >= @filemtime(SWML_PATH . $src)', '');
    ok(mut !== fnM[0] && runCases(mut, true).indexOf('stale') !== -1, 'a rule without the freshness test serves a stale build — caught');
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
