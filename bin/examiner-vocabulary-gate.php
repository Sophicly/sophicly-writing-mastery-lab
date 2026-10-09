<?php
/**
 * examiner-vocabulary-gate.php — FIXLIST #813c / PEDAGOGY §59 (v7.20.774).
 * Runs THE SHIPPED examiner_vocabulary_block() (sliced from includes/class-protocol-router.php) and checks:
 *   (1) the rule's three parts are in it: the AWARDED level's words from THIS paper's own mark scheme; a distinctive
 *       level word only where the work earned it; plain words everywhere else;
 *   (2) the §37 carve-out survives (one criterion's final perceptive 0.25 may be named, with criterion + paragraph),
 *       and the things that are NOT level claims stay allowed (criterion names, next-level targets, the student's words);
 *   (3) BOTH summary mandates (language + literature) append it once, on the SUMMARY turn — i.e. after the
 *       @SUMMARY_COMPLETE early return, so the closing-questions turns never carry it.
 * What a pass does NOT prove: that the model obeys. That is measured on saved summaries
 * (~/.sophicly/probe/wml-338/bandwords.php, read-only).
 *   php bin/examiner-vocabulary-gate.php
 */
$SRC = file_get_contents(__DIR__ . '/../includes/class-protocol-router.php');
$fail = 0;
$say = function ($ok, $msg) use (&$fail) { if (!$ok) $fail = 1; echo ($ok ? '  ✅ ' : '  ❌ ') . $msg . "\n"; };
echo "examiner-vocabulary-gate\n";
if (!preg_match('/\n    private static function examiner_vocabulary_block\(\) \{\n.*?\n    \}\n/s', $SRC, $m)) {
    echo "  ❌ examiner_vocabulary_block() not found\n❌ examiner-vocabulary-gate FAILED\n"; exit(1);
}
eval(preg_replace('/^\s*private static function examiner_vocabulary_block/', 'function __wml813c', trim($m[0])));
$b = __wml813c();
$say(strpos($b, 'level you actually AWARDED') !== false && strpos($b, "THIS paper's own mark scheme") !== false
    && strpos($b, "never another board's or another paper's") !== false, "(1) the awarded level's words, from this paper's own mark scheme, never another board's");
$say((bool) preg_match('/perceptive, convincing, judicious, critical, exploratory, conceptualised, sophisticated, assured, compelling, thoughtful/', $b)
    && strpos($b, 'ONLY where the work earned it') !== false, '(1) the distinctive level words are named, and allowed only where earned');
$say(strpos($b, 'plain words that make no level claim') !== false, '(1) everywhere else: plain words, no level claim');
$say(strpos($b, 'final perceptive 0.25') !== false && strpos($b, 'name the criterion and the paragraph') !== false, '(2) §37 carve-out: one criterion\'s perceptive quarter may be named, with criterion + paragraph');
$say(strpos($b, "a criterion's own name from the marking table") !== false && strpos($b, 'what the NEXT level needs') !== false
    && strpos($b, "quoting the student's own words") !== false, '(2) not level claims, still allowed: criterion names, next-level targets, the student\'s words');
$say(mb_strlen($b) < 1400, '(budget) the block stays short: ' . mb_strlen($b) . ' chars');
$fn = function ($name) use ($SRC) {
    $s = strpos($SRC, 'private function ' . $name . '(');
    if ($s === false) return '';
    $e = strpos($SRC, "\n    }\n", $s);
    return substr($SRC, $s, $e - $s);
};
foreach (['assessment_final_summary_mandate', 'assessment_lit_final_summary_mandate'] as $fname) {
    $body = $fn($fname);
    $ret = strpos($body, "return self::assessment_closing_questions_block();");
    $call = strpos($body, '$block .= self::examiner_vocabulary_block();');
    $say($body !== '' && substr_count($body, 'self::examiner_vocabulary_block()') === 1 && $ret !== false && $call !== false && $call > $ret,
        "(3) $fname appends it once, on the summary turn (after the closing-questions early return)");
}
echo $fail ? "❌ examiner-vocabulary-gate FAILED\n" : "✅ examiner-vocabulary-gate\n";
exit($fail);
