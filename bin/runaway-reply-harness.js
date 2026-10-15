#!/usr/bin/env node
/* eslint-env node */
/**
 * runaway-reply-harness.js — v7.20.897 (WML 360 A; Neil 15 Oct: "make sure that's actually working" — Shayaan 1397).
 *
 * MEASURED on staging (test student 1938, AQA Power and Conflict planning, Sonnet 5.5): at the framing step
 * (b2-goals-keywords.md Step 2, "…then STOP") Sophia finished the framing and filled the rest of her output budget with a
 * literal "<br>" ×10,580 — 74,684 characters, one chat bubble 440,489px tall, saved into the chat. Never seen on prod
 * (126 chats, longest reply 10,953 characters), but no P&C plan had reached that step there.
 *
 * What it proves, from the SHIPPED code:
 *   A. SERVER   — SWML_REST_API::collapse_runaway_breaks, executed in PHP: the measured runaway collapses to the framing
 *                 alone and is logged; a blank-line runaway collapses and is logged; one or two <br>, paragraphs, a mark
 *                 table, a stanza break and a non-string pass untouched.
 *   B. WIRING   — handle_chat scrubs every reply with it before the payload; the protocol now gives the framing step a last
 *                 sentence to end on.
 *   C. FALSIFY  — four mutations each fail A or B.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const REST0 = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
const B2 = fs.readFileSync(path.join(ROOT, 'protocols', 'aqa', 'poetry', 'planning', 'b2-goals-keywords.md'), 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

function methodSrc(src) {
    const a = src.indexOf('    public static function collapse_runaway_breaks(');
    if (a < 0) throw new Error('collapse_runaway_breaks missing');
    return src.slice(a, src.indexOf('\n    }\n', a) + 6);
}

// The measured head (verbatim from the staging turn, 15 Oct), then the loop.
const HEAD = "Saved! ✅\n\n@FIELD_SET{\"field\":\"kw-focus\",\"value\":\"power; ideas about power; how the poets present it; compare; both poems\"}\n\nNow let's frame how to approach the question. It asks you to **compare** how both poets present **power**. To do this well, you'll trace **connections** in BOTH poems:\n\n- Each poet's **context** inspired certain ideas (concepts) about power.\n- Those ideas drove specific choices of **form, structure and language**.\n- The **comparison** of those choices reveals a deeper insight than either poem gives alone.\n\nThese aren't separate boxes to tick. They work together across both Ozymandias and London.\n\n\n";
const RUNAWAY = HEAD + '<br>\n\n\n'.repeat(10580);
const CASES = [
    // [label, input, expected output, expect a log line]
    ['the measured runaway (×10,580 "<br>") → the framing alone, logged', RUNAWAY, HEAD.trimEnd(), true],
    ['a blank-line runaway (4,000 newlines) → one paragraph break, logged', 'First.' + '\n'.repeat(4000) + 'Second.', 'First.\n\nSecond.', true],
    ['one <br> inside a line — untouched', 'Line one<br>Line two\n\nNext paragraph.', 'Line one<br>Line two\n\nNext paragraph.', false],
    ['two <br> (a deliberate gap) — untouched', 'Stanza one ends<br><br>Stanza two begins', 'Stanza one ends<br><br>Stanza two begins', false],
    ['ordinary paragraphs — untouched', 'A.\n\nB.\n\nC.', 'A.\n\nB.\n\nC.', false],
    ['a mark table — untouched', '| Criterion | Worth | Score |\n|---|---|---|\n| Hook | 1.0 | 0.5 |', '| Criterion | Worth | Score |\n|---|---|---|\n| Hook | 1.0 | 0.5 |', false],
    ['trailing blank lines — trimmed', 'Done.\n\n\n\n', 'Done.', false],
    ['one line of nothing but eight <br> → one paragraph break', 'Top.\n<br><br><br><br><br><br><br><br>\nBottom.', 'Top.\n\nBottom.', false],
];

function runPhp(src) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'runaway-'));
    const f = path.join(dir, 't.php'), log = path.join(dir, 'err.log'), inp = path.join(dir, 'in.json');
    fs.writeFileSync(inp, JSON.stringify(CASES.map((c) => c[1]).concat([null])));
    fs.writeFileSync(f, '<?php\nini_set("error_log", ' + JSON.stringify(log) + ');\nclass T {\n' + methodSrc(src)
        + '\n}\n$out = [];\nforeach (json_decode(file_get_contents(' + JSON.stringify(inp) + '), true) as $s) {\n'
        + '  $before = file_exists(' + JSON.stringify(log) + ') ? filesize(' + JSON.stringify(log) + ') : 0;\n'
        + '  $r = T::collapse_runaway_breaks($s, "planning");\n  clearstatcache();\n'
        + '  $after = file_exists(' + JSON.stringify(log) + ') ? filesize(' + JSON.stringify(log) + ') : 0;\n'
        + '  $out[] = ["r" => $r, "logged" => $after > $before];\n}\necho json_encode($out);\n');
    try { return JSON.parse(execFileSync('php', [f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })); }
    finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
function check(src, quiet) {
    const bad = [];
    let res;
    try { res = runPhp(src); } catch (e) { if (!quiet) ok(false, 'php run failed: ' + String(e.stderr || e.message).slice(0, 300)); return null; }   // null = could not run — never counts as a catch
    CASES.forEach(([label, , want, wantLog], i) => {
        const got = res[i] || {};
        const good = got.r === want && !!got.logged === wantLog;
        if (!good) bad.push(label);
        if (!quiet) ok(good, label + (good ? '' : '  GOT ' + JSON.stringify(String(got.r).slice(0, 120)) + ' logged=' + got.logged));
    });
    const nul = res[CASES.length] || {};
    if (nul.r !== null) bad.push('a non-string');
    if (!quiet) ok(nul.r === null, 'a non-string passes through untouched');
    return bad;
}

console.log('A. collapse_runaway_breaks, executed in PHP');
if (check(REST0, false) === null) ok(false, 'the shipped function could not be executed');

console.log('B. wiring');
const hc = REST0.slice(REST0.indexOf('    public function handle_chat($request) {'), REST0.indexOf('            $response_payload = [\n                \'success\' => true,'));
ok(/\$reply = self::collapse_runaway_breaks\(\$reply, \$swml_request_context\['task'\] \?\? ''\);/.test(hc), 'handle_chat scrubs every reply with it, before the payload');
ok(hc.indexOf('collapse_runaway_breaks') > hc.indexOf("preg_replace('/\\[QUIZ_COMPLETE"), 'after the machine-marker scrubs (the same "never reaches the student" step)');
ok(/your message ENDS: the last sentence\s+of the framing paragraph is the last thing you write\./.test(B2), 'the framing step now names the sentence to end on (the bare "STOP" gave the model no last line)');

console.log('C. falsify — each mutation must break A or B');
const MUT = [
    ['no collapse at all', (s) => s.replace('if (count($run) >= 3 || $run_brs >= 3) {', 'if (false) {')],
    ['the <br> count ignored (a line of only <br> tags survives)', (s) => s.replace('if (count($run) >= 3 || $run_brs >= 3) {', 'if (count($run) >= 3) {')],
    ['a line with words counted as empty', (s) => s.replace("if ($bare !== null && trim($bare) === '') {", 'if (true) {')],
    ['silent (no log)', (s) => s.replace("error_log(sprintf('WML runaway reply collapsed:", "(sprintf('WML runaway reply collapsed:")],
    ['one big regex instead (the measured JIT-stack trap blanks the runaway)', (s) => s.replace("$lines = preg_split('/\\r?\\n/', $reply);",
        "$r0 = preg_replace('/(?:[ \\t]*<br\\s*\\/?>[ \\t]*(?:\\r?\\n[ \\t]*)*){3,}/i', \"\\n\\n\", $reply); return is_string($r0) ? rtrim($r0) : '';\n        $lines = preg_split('/\\r?\\n/', $reply);")],
];
for (const [label, mut] of MUT) {
    const src = mut(REST0);
    if (src === REST0) { ok(false, 'mutation did not apply: ' + label); continue; }
    const bad = check(src, true);
    if (bad === null) { ok(false, 'mutation could not run (php failed): ' + label); continue; }
    ok(bad.length > 0, 'mutation caught: ' + label + (bad.length ? ' (' + bad.length + ' case' + (bad.length === 1 ? '' : 's') + ' fail)' : ' — NOT CAUGHT'));
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
