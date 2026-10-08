<?php
/**
 * free-assessment-reflection-gate.php — FIXLIST #807 / PEDAGOGY §58.
 * Runs THE SHIPPED free_assessment_reflection_block() (sliced from includes/class-protocol-router.php) against a stub
 * $wpdb, and checks the wiring:
 *   (1) a linked student → the block carries their own words, the goal as a label, and the response-shift guard;
 *   (2) no assessment row / placeholder answers ("test") → '' (the feedback is exactly as before);
 *   (3) the assessment's predicted grade / self-ratings never reach the block (keys other than 7/39/40 ignored);
 *   (4) BOTH summary mandates append it, and both call sites pass the user id.
 *   php bin/free-assessment-reflection-gate.php
 */
$SRC = file_get_contents(__DIR__ . '/../includes/class-protocol-router.php');
$fail = 0;
$say = function ($ok, $msg) use (&$fail) { if (!$ok) $fail = 1; echo ($ok ? '  ✅ ' : '  ❌ ') . $msg . "\n"; };
if (!preg_match('/\n    private static function free_assessment_reflection_block\(\$user_id\) \{\n.*?\n    \}\n/s', $SRC, $m)) {
    echo "❌ free-assessment-reflection-gate: method not found\n"; exit(1);
}
function wp_strip_all_tags($s) { return strip_tags((string) $s); }
function soph_assess_question_map() { return [7 => ['opts' => ['b' => '(b) To score a Grade 9', 'a' => '(a) To score 100%']]]; }
class WML807_DB {
    public $prefix = 'wp_'; public $row = null; public $sql = '';
    function suppress_errors($x = true) { return false; }
    function prepare($q, ...$a) { return vsprintf(str_replace('%d', '%d', $q), $a); }
    function get_row($q) { $this->sql = $q; return $this->row; }
}
$wpdb = new WML807_DB();
eval(preg_replace('/^\s*private static function free_assessment_reflection_block/', 'function __wml807', trim($m[0])));

echo "free-assessment-reflection-gate\n";
$wpdb->row = (object) ['answers' => json_encode(['7' => 'b', '13' => '4', '41' => 'grade 5', '39' => 'I never know how much to write about one quote.', '40' => 'Explaining the effect of a technique properly.'])];
$out = __wml807(1411);
$say(strpos($out, '"I never know how much to write about one quote."') !== false && strpos($out, 'Explaining the effect') !== false, 'linked student: their own words for hardest + skill');
$say(strpos($out, 'grade goal — Grade 9;') !== false, 'goal resolved through the assessment plugin\'s own label map ("Grade 9", prefix stripped)');
$say(strpos($out, 'NEVER compare this mark with any grade, prediction or self-rating') !== false, 'response-shift guard present (dashboard #523b)');
$say(strpos($out, 'leave it out entirely') !== false, 'no-evidence case: leave it out, never forced');
$say(strpos($out, 'grade 5') === false && strpos($out, '"4"') === false, 'predicted grade / self-ratings (other keys) never reach the block');
$say(strpos($wpdb->sql, "user_id = 1411") !== false && strpos($wpdb->sql, "status = 'complete'") !== false && strpos($wpdb->sql, 'ORDER BY id DESC LIMIT 1') !== false, 'reads the newest COMPLETE row for THIS user');
$wpdb->row = null;
$say(__wml807(1411) === '', 'no assessment → empty (feedback unchanged)');
$wpdb->row = (object) ['answers' => json_encode(['7' => 'b', '39' => 'test', '40' => 'test'])];
$say(__wml807(1411) === '', 'placeholder answers ("test") → empty');
$say(__wml807(0) === '', 'no user → empty');
$say(substr_count($SRC, '$block .= self::free_assessment_reflection_block($user_id);') === 2, 'both summary mandates (language + literature) append it');
$say(strpos($SRC, 'return $this->assessment_final_summary_mandate($order, $scored, $user_id);') !== false
  && strpos($SRC, "return \$this->assessment_lit_final_summary_mandate(\$context['subject'] ?? '', \$user_id);") !== false, 'both call sites pass the user id');
echo $fail ? "❌ free-assessment-reflection-gate FAILED\n" : "✅ free-assessment-reflection-gate\n";
exit($fail);
