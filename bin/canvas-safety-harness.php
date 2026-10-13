<?php
/**
 * canvas-safety-harness.php — v7.20.854 (FIXLIST never-again-1298). Proves the server's safety net from the shipped class.
 *
 *   A. person_work counts what a person wrote: filled unlocked boxes, chosen selects, response + feedback text — and
 *      not a locked box, an empty box, or a box twice when it sits inside a response section
 *   B. loses_work fires on Anam's shape (21 filled boxes → a 0-box template) and on a wiped essay, and stays quiet on
 *      ordinary editing
 *   C. the ring keeps the newest two AND the richest ever copied — a run of bad saves cannot push the good version out
 *   D. through a faithful imitation of WordPress (update_user_meta UNSLASHES, then serializes): a copy and a restore
 *      give back the stored JSON byte for byte, backslashes and all; restore stamps a fresh savedAt and copies the
 *      current document aside first
 *   E. the wiring: save_canvas and tutor_save_comments call guard_write before they write; the class is loaded
 *   F. falsified: with the copy's wp_slash removed, D fails (the root CLAUDE.md trap is real, and this test sees it)
 *
 * Usage: php bin/canvas-safety-harness.php
 */
define('SWML_SAFETY_TEST', true);
$ROOT = dirname(__DIR__);
$pass = 0; $fail = 0;
function ok($c, $m) { global $pass, $fail; if ($c) { $pass++; echo "  ✓ $m\n"; } else { $fail++; echo "  ✗ $m\n"; } }

// ── a faithful in-memory imitation of the WordPress meta API ──────────────────────────────────────────────────────
$GLOBALS['__meta'] = [];
function wp_unslash($v) { return is_array($v) ? array_map('wp_unslash', $v) : (is_string($v) ? stripslashes($v) : $v); }
function wp_slash($v) { return is_array($v) ? array_map('wp_slash', $v) : (is_string($v) ? addslashes($v) : $v); }
function update_user_meta($u, $k, $v) { $GLOBALS['__meta'][$u][$k] = serialize(wp_unslash($v)); return true; }   // WP: unslash, then maybe_serialize
function get_user_meta($u, $k, $single) { return isset($GLOBALS['__meta'][$u][$k]) ? unserialize($GLOBALS['__meta'][$u][$k]) : ''; }
function current_time($t) { return '2026-10-13T12:00:00+00:00'; }
function wp_json_encode($v) { return json_encode($v); }

$src = file_get_contents($ROOT . '/includes/class-canvas-safety.php');
require $ROOT . '/includes/class-canvas-safety.php';
$S = 'SWML_Canvas_Safety';

// ── fixtures: Anam's planning shape (21 filled plan / outline boxes) and the template that replaced it ──────────
$box = function ($id, $t, $kind = 'input-field', $locked = false) {
    return '<div data-' . $kind . '="true" data-field-id="' . $id . '"' . ($locked ? ' data-locked="true"' : '') . ' class="swml-' . $kind . '">' . $t . '</div>';
};
$anam = '<div data-section-type="question" data-section-label="Q1"><p>Identify four true statements…</p></div>';
for ($i = 1; $i <= 12; $i++) $anam .= $box("plan-Q3-para-$i", "Topic: the storm as a predator \\\"quoted\\\" line $i — personification and threat");
for ($i = 1; $i <= 9; $i++) $anam .= $box("outline-$i", "Munby shows the storm hunting the ship, sentence $i", 'outline-row');
$anam .= '<div data-section-type="response" data-section-label="Q3 Response"><p></p></div>';
$template = '<div data-section-type="question" data-section-label="Q1"><p>Choose four statements below which are true.</p></div>';
for ($i = 1; $i <= 30; $i++) $template .= $box("plan-$i", '');
$template .= $box('locked-1', 'From lesson 2', 'input-field', true);
$template .= '<div data-section-type="response" data-section-label="Q3 Response"><p>Write your response here.</p></div>';

echo "\nA · what counts as a person's work\n";
$wA = $S::person_work($anam);
ok($wA['boxes'] === 21, "Anam's planning document: 21 filled boxes (got {$wA['boxes']})");
$wT = $S::person_work($template);
ok($wT['boxes'] === 0, 'the template: 0 — empty boxes and a LOCKED box with text are not a person\'s work (got ' . $wT['boxes'] . ')');
ok($S::person_work('<div data-select-field="true" data-value="b"></div><div data-select-field="true" data-value=""></div>')['boxes'] === 1, 'a chosen select counts; an unchosen one does not');
$essay = '<div data-section-type="response" data-section-label="Essay"><p>' . str_repeat('Macbeth is driven by ambition. ', 30) . '</p></div>';
ok($S::person_work($essay)['chars'] > 800, 'a response section\'s text counts as characters');
$nested = '<div data-section-type="response"><div data-input-field="true">abcdefghij</div></div>';
$wn = $S::person_work($nested);
ok($wn['boxes'] === 1 && $wn['chars'] === 10, 'a box inside a response section is counted once, not twice (got ' . $wn['chars'] . ')');
ok($S::person_work('<p>' . str_repeat('plain old essay ', 20) . '</p>')['chars'] > 200, 'a document with no sections (an old plain essay) counts all its text');
ok($S::person_work('') === ['boxes' => 0, 'chars' => 0], 'empty html → nothing');

echo "\nB · when a save loses work\n";
ok($S::loses_work($wA, $wT), "⭐ Anam's shape: 21 boxes → a template with 0 → LOSES work (copy aside)");
ok($S::loses_work($S::person_work($essay), $S::person_work('<div data-section-type="response"><p>Write your essay here.</p></div>')), '⭐ a written essay → the blank template → loses work');
$typed = $S::person_work($essay . $box('p1', 'one'));
ok(!$S::loses_work($typed, $S::person_work($essay . $box('p1', 'one') . $box('p2', 'two'))), 'adding a box is not a loss');
ok(!$S::loses_work($S::person_work($essay), $S::person_work(str_replace('ambition. ', 'ambition, ', $essay))), 'editing words is not a loss');
ok($S::loses_work($typed, $S::person_work($essay . $box('p1', ''))), 'clearing a filled box is a loss (cheap insurance — the copy costs one write)');
$long = '<div data-section-type="response"><p>' . str_repeat('x', 1000) . '</p></div>';
ok(!$S::loses_work($S::person_work($long), $S::person_work('<div data-section-type="response"><p>' . str_repeat('x', 850) . '</p></div>')), 'deleting 150 of 1000 characters is editing, not a loss');
ok($S::loses_work($S::person_work($long), $S::person_work('<div data-section-type="response"><p>' . str_repeat('x', 600) . '</p></div>')), 'deleting 400 of 1000 characters (40%) is a loss');

echo "\nC · the ring keeps the newest two and the richest\n";
$e = function ($chars, $tag) { return ['before' => ['boxes' => 0, 'chars' => $chars], 'raw' => $tag]; };
$ring = [];
foreach ([[5000, 'GOOD'], [300, 'bad1'], [200, 'bad2'], [100, 'bad3'], [50, 'bad4']] as $x) $ring = $S::ring_add($ring, $e($x[0], $x[1]));
$tags = array_map(function ($x) { return $x['raw']; }, $ring);
ok(count($ring) === 3, 'never more than three copies per document');
ok(in_array('GOOD', $tags, true), '⭐ four bad saves in a row cannot push the good version out (' . implode(',', $tags) . ')');
ok($tags[2] === 'bad4' && $tags[1] === 'bad3', 'the newest two are kept');

echo "\nD · through WordPress's unslash + serialize, byte for byte\n";
$uid = 1298; $key = 'swml_canvas_aqa_aqa_lang_paper_2_t1_planning';
$stored = wp_json_encode(['html' => $anam, 'savedAt' => '2026-10-11T18:00:00+00:00', 'wordCount' => 0]);
update_user_meta($uid, $key, wp_slash($stored));                                 // how save_canvas stores a document
$existing = get_user_meta($uid, $key, true);
ok($existing === $stored && strpos($existing, '\\"') !== false, 'the fixture stores like save_canvas (JSON with escaped quotes survives)');
ok($S::guard_write($uid, $key, $existing, $template, 'save') === true, '⭐ guard_write copies Anam\'s document aside when a template save arrives');
ok($S::guard_write($uid, $key, $existing, $anam . $box('extra', 'more'), 'save') === false, 'and stays quiet when the save adds work');
$bk = $S::backup_key($key);
ok(strpos($bk, 'swml_canvas') === false && strpos($bk, 'wml_docbak_') === 0, 'the copy\'s key never starts "swml_canvas" (unescaped LIKE scans would read it as a document)');
$ringStored = get_user_meta($uid, $bk, true);
ok(is_array($ringStored) && $ringStored['entries'][0]['raw'] === $stored, '⭐ the copy is the stored JSON byte for byte (backslashes intact)');
ok($ringStored['doc_key'] === $key && $ringStored['entries'][0]['before']['boxes'] === 21 && $ringStored['entries'][0]['after']['boxes'] === 0, 'it records which document, and the work before → after');
$list = $S::list_backups($uid, $key);
ok(count($list) === 1 && !isset($list[0]['raw']) && $list[0]['bytes'] === strlen($stored), 'list_backups shows the copies without their contents');
update_user_meta($uid, $key, wp_slash(wp_json_encode(['html' => $template, 'savedAt' => '2026-10-13T11:00:00+00:00'])));   // the wiped save landed
$r = $S::restore($uid, $key, 0);
$back = json_decode(get_user_meta($uid, $key, true), true);
ok($r['ok'] && $back['html'] === $anam, '⭐ restore puts her plan back, html identical');
ok($back['savedAt'] === '2026-10-13T12:00:00+00:00' && $back['restoredFrom'] === '2026-10-11T18:00:00+00:00', 'restore stamps a fresh savedAt (her browser then loads it) and records where it came from');
$after = get_user_meta($uid, $bk, true);
ok(count($after['entries']) === 2 && $after['entries'][1]['source'] === 'pre-restore', 'the document a restore replaced is itself copied aside (a restore can be undone)');

echo "\nE · the wiring\n";
$api = file_get_contents($ROOT . '/includes/class-rest-api.php');
$main = file_get_contents($ROOT . '/sophicly-writing-mastery-lab.php');
$g1 = strpos($api, "SWML_Canvas_Safety::guard_write(\$user_id, \$meta_key, \$existing_doc_raw, \$html, 'save')");
$w1 = $g1 === false ? false : strpos($api, 'update_user_meta($user_id, $meta_key, wp_slash(wp_json_encode($doc)));', $g1);
ok($g1 !== false && $w1 !== false && $w1 - $g1 < 400, 'save_canvas copies aside BEFORE it writes the document');
$g2 = strpos($api, "SWML_Canvas_Safety::guard_write(\$student_id, \$meta_key, \$raw, \$doc['html'], 'tutor-comment')");
$w2 = $g2 === false ? false : strpos($api, 'update_user_meta($student_id, $meta_key, wp_slash(wp_json_encode($doc)));', $g2);
ok($g2 !== false && $w2 !== false && $w2 - $g2 < 400, 'tutor_save_comments (a tutor\'s page also writes the whole html) copies aside before it writes');
ok(strpos($main, "require_once SWML_PATH . 'includes/class-canvas-safety.php';") !== false
    && strpos($main, "includes/class-canvas-safety.php") < strpos($main, "includes/class-rest-api.php"), 'the class is loaded, before the REST API that calls it');

echo "\nF · falsified: without wp_slash on the copy, the round-trip breaks — and D would see it\n";
$broken = str_replace('update_user_meta($user_id, $key, wp_slash($ring));', 'update_user_meta($user_id, $key, $ring);', $src);
ok($broken !== $src, 'the mutation applies');
$broken = str_replace('class SWML_Canvas_Safety', 'class SWML_Canvas_Safety_Broken', $broken);
$tmp = tempnam(sys_get_temp_dir(), 'swml'); file_put_contents($tmp, $broken); require $tmp; unlink($tmp);
$GLOBALS['__meta'] = [];
update_user_meta($uid, $key, wp_slash($stored));
SWML_Canvas_Safety_Broken::guard_write($uid, $key, get_user_meta($uid, $key, true), $template, 'save');
$bro = get_user_meta($uid, SWML_Canvas_Safety_Broken::backup_key($key), true);
ok(is_array($bro) && $bro['entries'][0]['raw'] !== $stored, '⭐ the unslashed copy is corrupted (the trap is real) — so D\'s byte-for-byte check is what stands between it and a broken restore');

echo $fail ? "\n❌ canvas-safety-harness FAILED ($fail of " . ($pass + $fail) . ")\n" : "\n✅ canvas-safety-harness passed ($pass assertions, 0 failed)\n";
exit($fail ? 1 : 0);
