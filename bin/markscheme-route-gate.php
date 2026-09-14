<?php
/**
 * markscheme-route-gate.php — v7.20.623
 *
 * ANSWERS: "will every live mark-scheme lesson actually receive a protocol?"
 *
 * WHY IT EXISTS. On 2026-09-14 nine of the eleven shipped mark-scheme lessons resolved to
 * NO protocol at all, for a month or more, in silence: the router keyed on `$subject`
 * against a map of BANK-FILE names while every shortcode emits a subject FAMILY
 * (`literature`, `poetry`, `language`). The model then ran a quiz with no marker contract
 * and printed a score nothing could capture, so a student's 10/10 was recorded as
 * `in_progress` for ever. Nothing failed loudly enough to notice — which is exactly the
 * class of defect a gate exists for.
 *
 * IT NEVER RE-IMPLEMENTS THE RESOLVER. It slices `resolve_mark_scheme_family()` straight
 * out of `includes/class-protocol-router.php` and runs the shipped code, so the gate
 * cannot drift from the thing it is testing (same method as bin/feedback-filing-gate.js).
 *
 * FIXTURES are the REAL (subject, text) pairs measured from the live shortcodes on prod.
 * Adding a mark-scheme lesson means adding its pair here — a lesson nobody listed is a
 * lesson nobody proved routes.
 *
 * Run: php bin/markscheme-route-gate.php     (exit 1 on any failure)
 */

$root = dirname(__DIR__);
$src  = $root . '/includes/class-protocol-router.php';
if (!is_file($src)) { fwrite(STDERR, "FAIL: cannot find {$src}\n"); exit(1); }

// ── slice the live resolver out of the shipped class ──────────────────────────────────
$php = file_get_contents($src);
$start = strpos($php, 'public static function resolve_mark_scheme_family(');
if ($start === false) { fwrite(STDERR, "FAIL: resolve_mark_scheme_family() not found — did it get renamed?\n"); exit(1); }
$depth = 0; $i = strpos($php, '{', $start); $open = $i;
for (; $i < strlen($php); $i++) {
    if ($php[$i] === '{') $depth++;
    elseif ($php[$i] === '}') { $depth--; if ($depth === 0) break; }
}
$body = substr($php, $start, $i - $start + 1);
eval('class MSGate { ' . $body . ' }');

// ── the real shipped lessons (prod, measured 2026-09-14) ──────────────────────────────
$FIXTURES = [
    // [subject, text, expected family]
    ['language',    'aqa_lang_paper_1',          'language1'],
    ['language',    'edexcel_igcse_lang_a',      'language1'],
    ['literature',  'christmas_carol',           '19th_century'],
    ['literature',  'inspector_calls',           'modern_text'],
    ['poetry',      'love_relationships_poetry', 'poetry_anthology'],
    ['shakespeare', 'romeo_and_juliet',          'shakespeare'],
    // legacy subject-only forms must keep working
    ['modern_text',      '', 'modern_text'],
    ['19th_century',     '', '19th_century'],
    ['poetry_anthology', '', 'poetry_anthology'],
    ['language_paper_2', '', 'language2'],
    ['lang_p1',          '', 'language1'],
];

$fail = 0;
foreach ($FIXTURES as [$subject, $text, $want]) {
    $got = MSGate::resolve_mark_scheme_family($subject, $text);
    $label = "subject='{$subject}' text='" . ($text ?: '—') . "'";
    if ($got === $want) { echo "  ok   {$label} → {$got}\n"; continue; }
    $fail++;
    echo "  FAIL {$label} → " . var_export($got, true) . " (expected '{$want}')\n";
}

// ── every family a fixture resolves to must have a real bank file in BOTH dirs ────────
foreach (['mark-scheme', 'mark-scheme-quiz', 'forging-your-weapon'] as $dir) {
    foreach (array_unique(array_column($FIXTURES, 2)) as $family) {
        $p = $root . "/protocols/shared/{$dir}/{$family}.md";
        if (is_file($p)) { echo "  ok   {$dir}/{$family}.md\n"; continue; }
        $fail++;
        echo "  FAIL {$dir}/{$family}.md MISSING — a lesson routes here and would load nothing\n";
    }
}

// ── the ambiguous families must NOT resolve without a text (that ambiguity is the bug) ─
foreach (['literature', 'poetry', 'language'] as $ambiguous) {
    $got = MSGate::resolve_mark_scheme_family($ambiguous, '');
    if ($got === null) { echo "  ok   subject='{$ambiguous}' alone → null (correctly refuses to guess)\n"; continue; }
    $fail++;
    echo "  FAIL subject='{$ambiguous}' alone → '{$got}' — that is a GUESS. 'literature' covers both\n";
    echo "       An Inspector Calls (modern_text) and A Christmas Carol (19th_century); picking one\n";
    echo "       silently serves the wrong text's mark scheme.\n";
}

echo $fail ? "\nmark-scheme routing: {$fail} FAILURE(S)\n" : "\nmark-scheme routing: all clear\n";
exit($fail ? 1 : 0);
