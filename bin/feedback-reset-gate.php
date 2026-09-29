<?php
/**
 * FEEDBACK RESET GATE (v7.20.653, #644 — Neil: "all of this stuff should be universal").
 *
 * Drives the SHIPPED reset_marking_output() (sliced out of class-rest-api.php, never re-typed)
 * over one document per feedback-label family and asserts that a reassessment seed clears every
 * carried mark — and nothing else. Before v7.20.653 the reset matched only labels BEGINNING
 * "Feedback: " and cut the name at the first "(", so:
 *   · "Part A Feedback: Introduction (2 / 5)" (dual / either-or literature) reset NOTHING, and the
 *     redraft committed the Phase-1 marks it inherited (the #630 bug, for every Part-labelled paper);
 *   · "Feedback: Q1(a) (1 / 1)" became "Feedback: Q1 (— / 1)" — the letter deleted, boxes colliding.
 *
 * Run: php bin/feedback-reset-gate.php
 */
$src = file_get_contents(__DIR__ . '/../includes/class-rest-api.php');
if ($src === false) { fwrite(STDERR, "cannot read class-rest-api.php\n"); exit(1); }

function slice_block($src, $needle) {
    $i = strpos($src, $needle);
    if ($i === false) { fwrite(STDERR, "❌ feedback-reset-gate: '$needle' not found — moved or renamed.\n"); exit(1); }
    $b = strpos($src, '{', $i); $d = 0;
    for ($k = $b; $k < strlen($src); $k++) {
        if ($src[$k] === '{') $d++;
        elseif ($src[$k] === '}') { $d--; if (!$d) return substr($src, $i, $k - $i + 1); }
    }
    fwrite(STDERR, "❌ feedback-reset-gate: unbalanced braces slicing $needle\n"); exit(1);
}
if (!preg_match("/const FB_LABEL_MARK_RE = '[^\n]+';/", $src, $c)) { fwrite(STDERR, "❌ feedback-reset-gate: FB_LABEL_MARK_RE not found\n"); exit(1); }
eval("class SWML_REST_API_Gate {\n" . $c[0] . "\n" . slice_block($src, 'public static function reset_marking_output(') . "\n}");

$pass = 0; $fail = 0;
function ok($cond, $msg) { global $pass, $fail; if ($cond) { $pass++; echo "  ✓ $msg\n"; } else { $fail++; echo "  ✗ $msg\n"; } }
function box($label, $body = '<p>Your paragraph: "x". Mark 3.</p>') {
    return '<div data-section-type="feedback" data-section-label="' . $label . '" data-editable="false">' . $body . '</div>';
}
$PLACEHOLDER = 'Feedback and revised answer will appear after assessment.';

$families = [
    'AQA Lang (Qn)'              => ['Feedback: Q2 (4 / 8)', 'Feedback: Q2 (— / 8)'],
    'essay (Body N)'             => ['Feedback: Body 2 (5.5 / 8)', 'Feedback: Body 2 (— / 8)'],
    'dual lit (Part A prefix)'   => ['Part A Feedback: Introduction (2 / 5)', 'Part A Feedback: Introduction (— / 5)'],
    'dual lit (Part B prefix)'   => ['Part B Feedback: Conclusion (3 / 4)', 'Part B Feedback: Conclusion (— / 4)'],
    'lettered sub-part (Q1(a))'  => ['Feedback: Q1(a) (1 / 1)', 'Feedback: Q1(a) (— / 1)'],
    'decimal question (Q27.1)'   => ['Feedback: Q27.1 (15 / 24)', 'Feedback: Q27.1 (— / 24)'],
];
foreach ($families as $name => [$in, $want]) {
    echo "\n$name\n";
    $html = box($in) . box('Overall Feedback', '<p>Key strength: …</p>') . '<div data-section-type="response" data-section-label="Response"><p>My essay.</p></div>';
    $out = SWML_REST_API_Gate::reset_marking_output($html);
    ok(strpos($out, 'data-section-label="' . $want . '"') !== false, "label reset to \"$want\"");
    ok(strpos($out, $PLACEHOLDER) !== false && strpos($out, 'Mark 3.') === false, 'the carried feedback body is replaced by the placeholder');
    ok(strpos($out, '<p>My essay.</p>') !== false, "the student's response is untouched");
}

echo "\nnever touches what is not a marked feedback box\n";
$plain = '<div data-section-type="response" data-section-label="Feedback: notes (my own words)"><p>keep</p></div>';
ok(SWML_REST_API_Gate::reset_marking_output($plain) === $plain, 'a non-feedback section whose label happens to say "Feedback:" is left alone');
$ana = box('Analytics', '<p>AO4 (−16)</p>');
ok(strpos(SWML_REST_API_Gate::reset_marking_output($ana), 'data-section-label="Analytics"') !== false, 'Analytics keeps its label (no "Feedback:" in it)');
ok(SWML_REST_API_Gate::reset_marking_output('') === '', 'empty document → empty');

echo "\n";
if ($fail) { fwrite(STDERR, "❌ feedback-reset-gate: $fail failed, $pass passed\n"); exit(1); }
echo "✅ feedback-reset-gate passed ($pass assertions) — every label family resets its carried marks; nothing else moves.\n";
