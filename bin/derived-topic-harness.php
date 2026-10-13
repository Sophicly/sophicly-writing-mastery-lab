<?php
/**
 * derived-topic-harness.php — v7.20.859 (FIXLIST msa-sidebar-1287).
 *
 * WHAT HAPPENED. Neil, 12 Oct, on a student's Macbeth "Mark Scheme Final Assessment" (Unit 2): "she scored eighteen out of
 * twenty, but it hasn't recorded in the LearnDash sidebar." MEASURED on prod (headless, view-as 1287): the Unit 2 page
 * showed the 18/20 — but that document belongs to Unit 4 "Mark Scheme Assessment 2" (topic 1), where she sat it and where
 * the sidebar does show her grade 8. Macbeth has no bridge entry for the Final Assessment lesson, so the page took the
 * bridge's last-resort guess, topic 1 — and 53 preliminary mark-scheme lessons in ~27 courses did the same. Every Final
 * Assessment therefore shared its document with its course's Assessment 2.
 *
 * WHAT THIS PROVES, from the shipped code:
 *   A. the rule (the @DERIVED-TOPIC-PURE block, executed): explicit evidence always wins; the guess is refused for a
 *      preliminary Final Assessment and still taken where nothing else is known (quiz lessons, other tasks)
 *   B. the wiring: the page's render heal decides through that rule, with the lesson's own phase
 *   C. falsified: the old condition takes the guess for the Final Assessment
 *
 * Usage: php bin/derived-topic-harness.php
 */
$ROOT = dirname(__DIR__);
$main = file_get_contents($ROOT . '/sophicly-writing-mastery-lab.php');
$pass = 0; $fail = 0;
function ok($c, $m) { global $pass, $fail; if ($c) { $pass++; echo "  ✓ $m\n"; } else { $fail++; echo "  ✗ $m\n"; } }

$b = strpos($main, '// @DERIVED-TOPIC-PURE-BEGIN'); $e = strpos($main, '// @DERIVED-TOPIC-PURE-END');
if ($b === false || $e === false || $e < $b) { echo "✗ the @DERIVED-TOPIC-PURE block is missing\n"; exit(1); }
$block = substr($main, $b, $e - $b);
if (!preg_match('/public static function derived_topic_accepted\(([^)]*)\)\s*\{([\s\S]*)\}\s*$/', trim($block), $m)) { echo "✗ derived_topic_accepted not found in the block\n"; exit(1); }
eval('function derived_topic_accepted_t(' . $m[1] . ') {' . $m[2] . '}');
$f = 'derived_topic_accepted_t';

echo "\nA · the rule\n";
ok($f('suffix', 0, 'mark_scheme', 'preliminary') && $f('unit', 3, 'assessment', null), 'explicit evidence (slug suffix, "Topic N" unit) always wins');
ok(!$f('default', 2, 'planning', 'redraft'), 'the guess never overrides a topic the lesson bakes in (unchanged)');
ok(!$f('default', 0, 'mark_scheme', 'preliminary'), '⭐ a preliminary Mark Scheme Final Assessment refuses the guess — it stays on its own document (topic 0)');
ok($f('default', 0, 'mark_scheme', 'redraft'), 'a mark-scheme lesson that is NOT preliminary still takes it (unchanged)');
ok($f('default', 0, 'mark_scheme_unit', 'preliminary'), 'the quiz lessons still take it (no topic-1 lesson shares their document; their documents since July stay where they are)');
ok($f('default', 0, 'planning', null), 'every other task: unchanged');

echo "\nB · the wiring\n";
ok(strpos($main, 'if (self::derived_topic_accepted($t_src, $topic, $task, $phase)) {') !== false, 'the render heal decides through derived_topic_accepted, passing the lesson\'s phase');
ok(strpos($main, "if ('default' !== \$t_src || !\$topic) {") === false, 'the old two-signal condition is gone');
$heal = strpos($main, 'derive_wml_task_from_topic($post_id, $course_id)');
$use = strpos($main, 'self::derived_topic_accepted($t_src, $topic, $task, $phase)');
$phaseSet = strpos($main, "\$phase = sanitize_key(\$derived['phase']);", $heal);
ok($heal !== false && $phaseSet !== false && $use > $phaseSet, 'it runs after the derived phase is applied, so a redraft unit is still read as redraft');

echo "\nC · falsified\n";
$old = function ($t_src, $topic) { return 'default' !== $t_src || !$topic; };
ok($old('default', 0) === true, 'the OLD condition takes the guess for the Final Assessment (topic 1 — Assessment 2\'s document): the defect this harness exists to stop');

echo $fail ? "\n❌ derived-topic-harness FAILED ($fail of " . ($pass + $fail) . ")\n" : "\n✅ derived-topic-harness passed ($pass assertions, 0 failed)\n";
exit($fail ? 1 : 0);
