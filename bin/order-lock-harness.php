<?php
/**
 * order-lock-harness.php — v7.20.921 (PEDAGOGY §67, FIXLIST redraft-lessons-in-order).
 *
 * WHAT HAPPENED. Neil, 16 Oct, reviewing Mishel 1237's AQA Language Paper 1 Redraft: "she didn't finish her planning and
 * then she went to the outline… They need to do all of them in order" — Creative Writing included. Both AQA Language
 * courses are LearnDash "free form", so nothing stopped her; LearnDash's own "linear" setting would lock every lesson in
 * the course, including work students are part-way through. WML now locks its own lessons, within a unit.
 *
 * WHAT THIS PROVES, from the shipped code:
 *   A. the rule (the @ORDER-LOCK-PURE block, executed): first lesson open · an earlier unfinished Writing Mastery lesson
 *      locks · a tutor lesson never holds anyone back · non-Writing-Mastery lessons are ignored · a finished lesson always
 *      opens · a lesson not in the chain opens (fail-open)
 *   B. the wiring: the page, the button and the form POST all ask the same helper; every one fails open; staff and
 *      reviewers are never stopped; a locked page is never cached; there is a no-deploy off switch
 *
 * Usage: php bin/order-lock-harness.php
 */
$ROOT = dirname(__DIR__);
$main = file_get_contents($ROOT . '/sophicly-writing-mastery-lab.php');
$pass = 0; $fail = 0;
function ok($c, $m) { global $pass, $fail; if ($c) { $pass++; echo "  ✓ $m\n"; } else { $fail++; echo "  ✗ $m\n"; } }

$b = strpos($main, '// @ORDER-LOCK-PURE-START'); $e = strpos($main, '// @ORDER-LOCK-PURE-END');
if ($b === false || $e === false || $e < $b) { echo "✗ the @ORDER-LOCK-PURE block is missing\n"; exit(1); }
$block = substr($main, $b + strlen('// @ORDER-LOCK-PURE-START'), $e - $b - strlen('// @ORDER-LOCK-PURE-START'));
if (strpos($block, 'function swml_order_lock_pick(') === false) { echo "✗ swml_order_lock_pick not in the block\n"; exit(1); }
eval(str_replace(['function swml_order_lock_pick(', 'function swml_order_lock_unit_is_free('], ['function swml_order_lock_pick_t(', 'function swml_order_lock_unit_is_free_t('], $block));
$f = 'swml_order_lock_pick_t';
$L = function ($id, $wml = true, $complete = false, $tutor = false) { return ['id' => $id, 'wml' => $wml, 'tutor' => $tutor, 'complete' => $complete]; };

echo "\nA · the rule\n";
$redraft = [$L(10, true, false), $L(11), $L(12), $L(13, true, false, true), $L(14)];   // plan · outline · polish · tutor · assess
ok($f($redraft, 10) === 0, 'the first lesson of a unit is open');
ok($f($redraft, 11) === 10, '⭐ Outline is locked while Plan is not complete (Mishel\'s case) — and it names Plan');
ok($f($redraft, 12) === 10, 'the FIRST unfinished earlier lesson is named, not the nearest');
$planDone = [$L(10, true, true), $L(11), $L(12)];
ok($f($planDone, 11) === 0 && $f($planDone, 12) === 11, 'a completed lesson unlocks the next one, and only the next one');
$tutorOpen = [$L(10, true, true), $L(11, true, true), $L(13, true, false, true), $L(14)];
ok($f($tutorOpen, 14) === 0, '⭐ an unfinished tutor lesson never holds anyone back ("You can move on now")');
$video = [$L(9, false, false), $L(10, true, true), $L(11)];
ok($f($video, 11) === 0, 'a lesson that is not Writing Mastery (video, reading) is ignored');
ok($f([$L(10), $L(11, false)], 11) === 0, 'a non-Writing-Mastery current lesson is never locked, even after an unfinished one (its own button stays)');
$finishedLate = [$L(10, true, false), $L(11, true, true)];
ok($f($finishedLate, 11) === 0, '⭐ a finished lesson always opens, even past an unfinished one (legacy ticks — a student never loses work)');
ok($f($redraft, 99) === 0, 'a lesson not in the unit\'s chain is open (fail-open)');
ok($f([], 10) === 0, 'an empty chain is open');
ok($f([5 => $L(10), 9 => $L(11)], 11) === 10, 'keys need not be 0..n (the chain is re-indexed)');
$weekend = [$L(1, true, true), $L(2, true, true), $L(3, true, false), $L(4)];
ok($f($weekend, 4) === 3, 'the Weekend Story: lesson 4 now checks lesson 3 (it did not, measured 16 Oct)');

echo "\nA2 · units done in any order (Neil, 17 Oct)\n";
$u = 'swml_order_lock_unit_is_free_t';
ok($u('BONUS: Exam Preparation') && $u('Bonus - Exam Prep') && $u('BONUS: Exam Preparation &#8211; Paper 2'), '⭐ "BONUS: Exam Preparation" (the emergency exam unit, prod name) opens in any order');
ok($u('BONUS: Emergency Grade 9 Exam Preparation'), '⭐ …and under its staging name, "BONUS: Emergency Grade 9 Exam Preparation" (measured 17 Oct — the first rule missed it)');
ok(!$u('BONUS LIVE LESSONS: AQA Language Paper 1 Exam Strategy') && !$u('BONUS - QUIZZES') && !$u('Exam Prep'), 'other BONUS units, and a plain "Exam Prep" unit, stay in order');
ok(!$u('BONUS: Weekend Story'), '⭐ the Weekend Story stays in order ("The weekend story needs to be done in order")');
ok(!$u('4. TOPIC 1: REDRAFT') && !$u('4. Exam Prep') && !$u('EXAM PREPARATION') && !$u('SESSION 4: EXAM PREPARATION FUNDAMENTALS'), 'every other unit stays in order (only the BONUS unit was ruled)');
$ob2 = strpos($main, 'public static function order_lock_blocker(');
$ob2b = $ob2 !== false ? substr($main, $ob2, 1800) : '';
$p1 = strpos($ob2b, "if (swml_order_lock_unit_is_free(get_the_title(\$unit))) return null;"); $p2 = strpos($ob2b, '$chain = [];');
ok($p1 !== false && $p2 !== false && $p1 < $p2, 'the blocker asks the unit rule before it builds the chain');

echo "\nB · the wiring\n";
ok(substr_count($main, 'swml_order_lock_pick($chain, $post_id)') === 1, 'one caller of the rule: order_lock_blocker()');
ok(preg_match_all('/self::order_lock_blocker\(/', $main) >= 3, 'the page, the button and the form POST all ask order_lock_blocker()');
ok(strpos($main, "get_option('swml_order_lock', 'on') === 'off'") !== false, 'wp option swml_order_lock = off switches it off, no deploy');
ok(strpos($main, "add_filter('learndash_process_mark_complete', [\$this, 'order_lock_filter'], 19, 3);") !== false, 'the form POST is refused BEFORE the document gate (priority 19 < 20)');
ok(strpos($main, "add_filter('learndash_mark_complete', [\$this, 'order_lock_hide_button'], 20, 2);") !== false, 'the Mark Complete button is not drawn on a locked lesson');
ok(strpos($main, "do_action('litespeed_control_set_nocache', 'WML order lock');") !== false, 'a locked page is never privately cached (the card would stick after the unlock)');
$r0 = strpos($main, '// v7.20.921 (PEDAGOGY §67): THE ORDER LOCK. Returns before any asset');
$r1 = strpos($main, '$this->enqueue_embed_assets();', $r0 ?: 0);
$rblk = $r0 !== false && $r1 !== false ? substr($main, $r0, $r1 - $r0) : '';
ok($rblk !== '' && strpos($rblk, 'return self::order_lock_card($lock);') !== false, 'the locked page returns the card BEFORE any asset or boot');
ok(strpos($rblk, '!$author_id') !== false && strpos($rblk, "['review_mode']") !== false && strpos($rblk, 'order_lock_applies_to_request()') !== false,
   'never locks a live-modelling lesson, a reviewer, or staff');
$ap = strpos($main, 'private function order_lock_applies_to_request()');
$apb = $ap !== false ? substr($main, $ap, 400) : '';
ok(strpos($apb, 'self::is_staff_user($uid)') !== false && strpos($apb, 'sophicly_review_target_id()') !== false, 'staff and a reviewer on someone else\'s lesson are never stopped');
$st = strpos($main, 'public static function is_staff_user($uid)');
$stb = $st !== false ? substr($main, $st, 500) : '';
ok(strpos($stb, "'manage_options'") !== false && strpos($stb, "'tutor'") !== false && strpos($stb, "'specialist'") !== false && strpos($stb, "'sss'") !== false,
   'staff = admin · tutor · specialist (both forms)');
foreach (['public static function order_lock_blocker(', 'public function order_lock_hide_button(', 'public function order_lock_filter('] as $sig) {
    $p = strpos($main, $sig);
    $body = $p !== false ? substr($main, $p, 2600) : '';
    $catch = strpos($body, 'catch (\Throwable $e)');
    ok($catch !== false, "fails open on any error: $sig");
}
$fp = strpos($main, 'public function order_lock_filter(');
$fb = $fp !== false ? substr($main, $fp, 800) : '';
ok(strpos($fb, "empty(\$_POST['sfwd_mark_complete'])") !== false, 'only the student\'s own press is refused — the bridge\'s programmatic completion of finished work passes');
$pt = strpos($main, 'private static function order_lock_passes_through(');
$ptb = $pt !== false ? substr($main, $pt, 1400) : '';
ok(strpos($ptb, 'Sophicly_Deadline_Engine::is_tutor_lesson') !== false && strpos($ptb, 'feedback_discussion') !== false && strpos($ptb, 'is_live_modelling_author') !== false,
   'tutor lessons: the Deadline Engine\'s one title rule, or task feedback_discussion; live modelling passes through');
ok(strpos($ptb, "class_exists('Sophicly_Deadline_Engine')") !== false, 'the student-data dependency is guarded');
$ob = strpos($main, 'public static function order_lock_blocker(');
$obb = $ob !== false ? substr($main, $ob, 2600) : '';
ok(strpos($obb, "'sfwd-topic'") !== false && strpos($obb, "'sfwd-lessons'") !== false, 'lessons only, within their unit');
ok(strpos($obb, "has_shortcode(\$p->post_content, 'writing_mastery_lab')") !== false && strpos($obb, "post_status === 'publish'") !== false, 'a Writing Mastery lesson = a published lesson with the shortcode');
ok(strpos($main, 'html[data-theme="dark"] .swml-order-lock') !== false, 'the card follows the SITE\'s theme marker (WML\'s own is set by a script that does not run here)');
ok(strpos($main, 'class="swml-btn-main swml-order-lock-go"') !== false, 'the card uses the house button, not a copy');
$cs = strpos($main, '.swml-order-lock{--ol-bg'); $ce = $cs !== false ? strpos($main, '</style>', $cs) : false;
$css = ($cs !== false && $ce !== false) ? substr($main, $cs, $ce - $cs) : '';
ok($css !== '' && !preg_match('/(^|[;{])\s*(border|outline)\s*:/', $css), 'v7.20.923: the card carries no outline stroke (Neil: "I really hate strokes")');
ok(strpos($css, '--ol-bg:#2b2c2f') !== false && strpos($css, '--ol-ink:#e0e0ee') !== false, 'v7.20.923: dark card = the Canvas Surface ladder (raised #2b2c2f, text #e0e0ee), never an invented shade');

echo "\n" . ($fail ? "FAILED" : "PASSED") . " — $pass passed, $fail failed\n";
exit($fail ? 1 : 0);
