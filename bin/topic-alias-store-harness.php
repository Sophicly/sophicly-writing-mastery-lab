<?php
/**
 * topic-alias-store-harness.php — v7.20.818 (FIXLIST #872, from the LearnDash lane, measured on prod 10 Oct).
 *
 * Topic questions live in wp_options as swml_topics_{board}_{text}. Lessons pass the CANONICAL text slug
 * ('pride_and_prejudice'); the topics admin's own list offered ALIAS forms ('pride_prejudice'), so imports landed
 * under alias keys — 32 of 163 prod stores — and for 25 texts the store the lessons read was EMPTY:
 * get_topics('aqa','pride_and_prejudice') = 0 while swml_topics_aqa_pride_prejudice held 10 topics.
 *
 * Drives THE real SWML_Topic_Questions + THE real alias registry (class-rest-api.php) against an in-memory option
 * store. Proves: an alias-filed store is served to the canonical lookup; an alias input reads the same; a canonical
 * store, once written, wins; every write lands on the canonical key; the first template import carries topics that
 * live only in the alias store; texts with no alias and the language sibling fallback are untouched.
 *   php bin/topic-alias-store-harness.php
 */
define('ABSPATH', __DIR__ . '/');
$GLOBALS['__opts'] = [];
function get_option($k, $d = false) { return array_key_exists($k, $GLOBALS['__opts']) ? $GLOBALS['__opts'][$k] : $d; }
function update_option($k, $v, $a = null) { $GLOBALS['__opts'][$k] = $v; return true; }
function add_option($k, $v, $x = '', $a = 'no') { $GLOBALS['__opts'][$k] = $v; return true; }
function delete_option($k) { unset($GLOBALS['__opts'][$k]); return true; }
function wp_cache_delete() { return true; }
function sanitize_key($k) { return strtolower(preg_replace('/[^a-z0-9_\-]/i', '', (string) $k)); }
function sanitize_file_name($f) { return preg_replace('/[^A-Za-z0-9._\-]/', '', (string) $f); }
function plugin_dir_path($f) { return rtrim(dirname($f), '/') . '/'; }
function current_time($t = 'mysql') { return gmdate('Y-m-d H:i:s'); }
ini_set('error_log', '/dev/null');
$TQ = getenv('TQ_FILE') ?: __DIR__ . '/../includes/class-topic-questions.php';   // falsify: TQ_FILE=<old copy>
require __DIR__ . '/../includes/class-rest-api.php';
require __DIR__ . '/../includes/class-topic-parser.php';
require $TQ;

$fail = 0; $n = 0;
function ok($c, $m) { global $fail, $n; $n++; if (!$c) $fail++; echo ($c ? '  ✓ ' : '  ✗ ') . $m . "\n"; }
$topic = function ($num, $label) { return ['topic_number' => $num, 'label' => $label, 'question_text' => 'Q' . $num]; };
$reset = function () { $GLOBALS['__opts'] = []; };
$label1 = function ($board, $text) { $t = SWML_Topic_Questions::get_topic($board, $text, 1); return $t['label'] ?? null; };

// A — prod's shape: only the alias store holds P&P
$reset();
$GLOBALS['__opts']['swml_topics_aqa_pride_prejudice'] = array_map(function ($i) use ($topic) { return $topic($i, $i === 1 ? 'Elizabeth Bennet (protagonist)' : 'Topic ' . $i); }, range(1, 10));
ok($label1('aqa', 'pride_and_prejudice') === 'Elizabeth Bennet (protagonist)', 'A1 the canonical lookup (what lessons pass) is served the alias store — get_topic(aqa, pride_and_prejudice, 1) = "Elizabeth Bennet (protagonist)"');
ok(count(SWML_Topic_Questions::get_topics('aqa', 'pride_and_prejudice')) === 10, 'A2 all 10 topics, not 0');
ok($label1('aqa', 'pride_prejudice') === 'Elizabeth Bennet (protagonist)', 'A3 an ALIAS input (the admin list, the picker) reads the same store');

// B — once the canonical store is written it wins; the alias store is a dead shadow
$GLOBALS['__opts']['swml_topics_aqa_pride_and_prejudice'] = [$topic(1, 'Rebuilt Topic 1'), $topic(3, 'Rebuilt Topic 3')];
ok($label1('aqa', 'pride_and_prejudice') === 'Rebuilt Topic 1', 'B1 a written canonical store wins over the alias store');
ok($label1('aqa', 'pride_prejudice') === 'Rebuilt Topic 1', 'B2 and an alias input now reads the canonical store too (one store per text)');

// C — every WRITE lands on the canonical key, whatever form the caller passes
$reset();
$save = new ReflectionMethod('SWML_Topic_Questions', 'save_topics');
if (PHP_VERSION_ID < 80100) $save->setAccessible(true);
$save->invoke(null, 'aqa', 'pride_prejudice', [$topic(1, 'Saved via alias form')]);
ok(isset($GLOBALS['__opts']['swml_topics_aqa_pride_and_prejudice']) && !isset($GLOBALS['__opts']['swml_topics_aqa_pride_prejudice']),
    'C1 a save through the alias form writes swml_topics_aqa_pride_and_prejudice, never the alias key');
$save->invoke(null, 'edexcel_igcse', 'aic', [$topic(1, 'x')]);
ok(isset($GLOBALS['__opts']['swml_topics_edexcel-igcse_inspector_calls']), 'C2 board form normalised as before (edexcel_igcse → edexcel-igcse) and aic → inspector_calls');

// D — the first template import into the canonical store carries a topic that lives ONLY in the alias store
$reset();
$GLOBALS['__opts']['swml_topics_aqa_pride_prejudice'] = [$topic(1, 'old T1'), $topic(202306, 'June 2023 past paper (installed)')];
$imp = new ReflectionMethod('SWML_Topic_Questions', 'auto_import_from_template');
if (PHP_VERSION_ID < 80100) $imp->setAccessible(true);
$parsed = $imp->invoke(null, 'aqa', 'pride_and_prejudice');
$canon = $GLOBALS['__opts']['swml_topics_aqa_pride_and_prejudice'] ?? [];
$nums = array_map(function ($t) { return (int) ($t['topic_number'] ?? 0); }, (array) $canon);
ok(count($parsed) > 1 && in_array(202306, $nums, true), 'D1 the template import keeps the alias-only past paper (202306) in the new canonical store');
$t1 = null; foreach ($canon as $t) if ((int) $t['topic_number'] === 1) $t1 = $t;
ok($t1 && $t1['label'] === 'Elizabeth Bennet (protagonist)', 'D2 the template still wins for the numbers it defines (T1 = the template\'s Elizabeth Bennet, not "old T1")');

// E — untouched paths
$reset();
$GLOBALS['__opts']['swml_topics_aqa_macbeth'] = [$topic(1, 'Macbeth T1')];
ok($label1('aqa', 'macbeth') === 'Macbeth T1', 'E1 a text with no alias reads its own key exactly as before');
$GLOBALS['__opts']['swml_topics_aqa_aqa_lang_paper_1'] = [$topic(1, 'P1 T1')];
ok($label1('aqa', 'language1') === 'P1 T1', 'E2 the language sibling fallback (v7.20.589) still serves language1 from aqa_lang_paper_1');
ok(SWML_Topic_Questions::get_topics('aqa', 'christmas_carol') === [], 'E3 a text with no store anywhere is still empty (no invented topics)');

echo ($fail ? '✗ FAIL' : '✓ PASS') . " — topic-alias-store-harness: " . ($n - $fail) . " passed, $fail failed\n";
exit($fail ? 1 : 0);
