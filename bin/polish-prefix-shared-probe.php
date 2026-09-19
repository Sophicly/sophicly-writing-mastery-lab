<?php
/**
 * v7.20.628 — DRIVES the real polishing preamble for two students and asserts the cached prefix is
 * byte-identical for both (the .627 law, which the lean polishing preamble bypassed by returning
 * early). A static read cannot prove this: .623 shipped inert because nobody drove the method.
 *
 * RUN (needs WordPress; `wp eval-file` silently runs nothing — require it):
 *   wp --user=1 eval 'require "<plugin>/bin/polish-prefix-shared-probe.php";'
 *   Optional: define('WML_PROBE_UIDS', '1352,1349') first to choose the two students.
 * PROVEN TO BITE: run against v7.20.627 it reports DIFFERENT md5s and the name inside the prefix.
 */
$uids = array_map('intval', explode(',', defined('WML_PROBE_UIDS') ? WML_PROBE_UIDS : '1352,1349'));
$router = SWML_Protocol_Router::instance();
$prop = null;
try { $prop = new ReflectionProperty('SWML_Protocol_Router', 'dynamic_polish_student'); $prop->setAccessible(true); }
catch (ReflectionException $e) { echo "[PROBE] no dynamic_polish_student property — this build predates v7.20.628\n"; }

$cells = [
    ['board' => 'aqa', 'subject' => 'language1',   'text' => 'aqa_lang_paper_1', 'task' => 'polishing', 'topic_number' => 1, 'step' => 1],
    ['board' => 'aqa', 'subject' => 'shakespeare', 'text' => 'macbeth',          'task' => 'polishing', 'topic_number' => 1, 'step' => 1],
];
$fail = 0;
foreach ($cells as $ctx) {
    echo "\n== {$ctx['board']}/{$ctx['subject']} · {$ctx['text']} · topic {$ctx['topic_number']}\n";
    $md5s = [];
    foreach ($uids as $uid) {
        $u = get_userdata($uid);
        if (!$u) { echo "  uid {$uid}: no such user\n"; $fail++; continue; }
        $fn = trim((string) $u->first_name) !== '' ? trim($u->first_name) : trim((string) $u->display_name);
        if ($prop) $prop->setValue($router, '');
        $pre = (string) $router->build_preamble($ctx, $uid);
        $rec = $prop ? (string) $prop->getValue($router) : '';
        $has_name = ($fn !== '' && stripos($pre, $fn) !== false);
        $has_rec  = (strpos($pre, 'THEIR FIRST ATTEMPT ON THIS TOPIC') !== false || strpos($pre, 'their calibration') !== false || strpos($pre, '### Student History') !== false);
        $md5s[$uid] = md5($pre);
        echo "  uid {$uid} ({$fn}): prefix=" . strlen($pre) . "ch md5=" . substr($md5s[$uid], 0, 8)
           . " · name in prefix: " . ($has_name ? 'YES ✗' : 'no ✓')
           . " · student record in prefix: " . ($has_rec ? 'YES ✗' : 'no ✓')
           . " · record routed to live block: " . strlen($rec) . "ch\n";
        if ($has_name || $has_rec) $fail++;
    }
    $same = count(array_unique($md5s)) === 1 && count($md5s) === count($uids);
    echo "  ⇒ prefix identical for every student: " . ($same ? 'YES ✓' : 'NO ✗') . "\n";
    if (!$same) $fail++;
}
echo "\n[PROBE] " . ($fail === 0 ? 'PASS' : "FAIL ({$fail})") . "\n";
