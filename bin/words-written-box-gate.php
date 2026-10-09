<?php
/**
 * words-written-box-gate.php — FIXLIST #811 (dashboard #533d, 9 Oct 2026): a Conceptual Notes / Mark Scheme /
 * FQ doc's words are the words in its BOXES, never its template.
 *
 * Runs THE SHIPPED box_words_without_response() — sliced out of includes/class-rest-api.php, never a copy —
 * on real-shaped doc HTML, checks /words-written uses it for every non-CW, non-exam-question doc, and proves
 * itself alive with two mutants (no feedback skip; no line-break separation) that must FAIL.
 *
 *   php bin/words-written-box-gate.php
 */
$SRC = file_get_contents(__DIR__ . '/../includes/class-rest-api.php');
$fail = 0;
$say = function ($ok, $msg) use (&$fail) { if (!$ok) $fail = 1; echo ($ok ? '  ✅ ' : '  ❌ ') . $msg . "\n"; };

if (!preg_match('/\n    public static function box_words_without_response\(\$html\) \{\n.*?\n    \}\n/s', $SRC, $fm)) {
    echo "❌ words-written-box-gate: box_words_without_response() not found in class-rest-api.php\n"; exit(1);
}
$fnSrc = trim($fm[0]);
$mk = function ($name, $src) { $s = preg_replace('/^\s*public static function box_words_without_response/', 'function ' . $name, $src); eval($s); };
$mk('__wml811_box', $fnSrc);

$sec  = function ($type, $inner) { return '<div class="swml-section-block" data-section-type="' . $type . '">' . $inner . '</div>'; };
$in   = function ($t, $extra = '') { return '<div data-input-field="true" class="swml-input-field" data-field-id="f" data-prompt="Who is the speaker?"' . $extra . '>' . $t . '</div>'; };
$row  = function ($t) { return '<div class="swml-outline-row" data-outline-row="true" data-field-id="r" data-prompt="Element">' . $t . '</div>'; };
$tpl  = '<p>Who is the speaker? What is their perspective, tone and emotional state? Use quotations to support.</p>';

$cases = [
    ['a BLANK Conceptual Notes doc counts 0, not its template', $sec('plan', $tpl . $in('') . $in('')) . $sec('plan', $tpl . $in('')), 0],
    ['a CN doc counts only the words inside its boxes', $sec('plan', $tpl . $in('The speaker is a persona.') . $in('Line one.') . $in('')), 7],
    ['words either side of a line break inside a box both count', $sec('plan', $in('<p>First idea.<br>Second idea here.</p>')), 5],
    ['words in two paragraphs inside one box both count', $sec('plan', $in('<p>One two.</p><p>Three four.</p>')), 4],
    ['a Mark Scheme answer box counts; Sophia\'s feedback box never does',
        $sec('mark_scheme_response', '<p>Which objective rewards analysis?</p>' . $in('AO2 rewards it.')) . $sec('feedback', $in('Good answer, well done on naming the objective.')), 3],
    ['an outline row counts like a box', $sec('plan', $row('A row of five words.')), 5],
    ['a placeholder line inside a box is skipped', $sec('plan', $in('Write your response here.')), 0],
    ['a locked box is skipped', $sec('plan', $in('Locked instruction text here.', ' data-locked="true"')), 0],
    ['a box nested inside a box is counted once', $sec('plan', $in('Outer words ' . $row('inner three words'))), 5],
    ['a doc WITH a response section returns null (its stored figure is already right)', $sec('plan', $in('Plan words here.')) . $sec('response', '<p>Essay.</p>'), null],
    ['a doc with no boxes returns null (legacy free-prose doc keeps its stored figure)', $sec('notes', '<p>Some editable prose.</p>'), null],
    ['empty html returns null', '', null],
];
foreach ($cases as [$label, $html, $want]) {
    $got = __wml811_box($html);
    $say($got === $want, $label . ($got === $want ? '' : ' — got ' . var_export($got, true)));
}

// Wiring: /words-written counts box words for every doc except CW (own count) and exam-question / crib (not writing).
$say((bool) preg_match('/\$bw = self::box_words_without_response\(\(string\) \(\$doc\[\'html\'\] \?\? \'\'\)\);\s*\n\s*if \(\$bw !== null\) \$w = \$bw;/', $SRC),
    '/words-written replaces the stored figure with the box count when there is one');
$say((bool) preg_match("/!in_array\(\\\$kind_w, \['creative_writing', 'exam_question', 'exam_crib'\], true\)/", $SRC),
    '/words-written leaves CW, exam-question and crib docs on their own figures');

// Mutation proof: each mutant must be caught by at least one case, or the gate is dead.
$mutants = [
    'no feedback-section skip' => str_replace("[not(ancestor::*[@data-section-type='feedback'])]", '', $fnSrc),
    'no line-break separation' => str_replace("\$html = preg_replace('/(<br\\s*\\/?>|<\\/p>|<\\/div>|<\\/li>|<\\/h[1-6]>)/i', ' \$1', \$html);", '', $fnSrc),
];
$i = 0;
foreach ($mutants as $name => $msrc) {
    $i++;
    if ($msrc === $fnSrc) { $say(false, "mutant '$name' could not be built (the shipped code changed shape — update the gate)"); continue; }
    $fn = '__wml811_mut' . $i; $mk($fn, $msrc);
    $caught = false;
    foreach ($cases as [, $html, $want]) { if ($fn($html) !== $want) { $caught = true; break; } }
    $say($caught, "mutant '$name' is caught");
}

echo ($fail ? '❌' : '✅') . " words-written-box-gate: box words, never template — " . ($fail ? 'FAILED' : 'passed') . "\n";
exit($fail);
