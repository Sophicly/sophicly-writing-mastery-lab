<?php
/**
 * READ-ONLY sweep (FIXLIST #556): find every student whose EARLIER Phase-2 stage doc holds far
 * less response prose than a LATER stage in the same phase — the "my redraft disappeared" shape.
 * Response chars are measured with the SHIPPED strip function (what it would remove), so this
 * cannot drift from the engine's own definition of "response prose".
 * Planning + outlining are EMPTY BY DESIGN and are reported but never flagged.
 *
 * RUN (prod needs lsphp83; `wp eval-file` silently runs nothing — require it):
 *   scp bin/forward-seed-sweep.php runcloud@HOST:/tmp/ && ssh … 'cd <webroot> &&
 *     /usr/local/lsws/lsphp83/bin/php $(command -v wp) --user=1 eval "require \"/tmp/forward-seed-sweep.php\";"'
 * The [ALL GROUPS] block is the instrument proof: chars AND stored wordCount per stage, so a
 * sweep that reads zero everywhere cannot pass silently. First run 2026-09-19: 66 docs, 36
 * groups, 0 flagged — Reeham 1352 (already repaired) was the only student with any Phase-2 prose.
 */
global $wpdb;
$strip  = new ReflectionMethod('SWML_REST_API', 'strip_responses_for_planning'); $strip->setAccessible(true);
$decode = new ReflectionMethod('SWML_REST_API', 'decode_canvas_json');           $decode->setAccessible(true);

$order   = ['_planning' => 0, '_outlining' => 1, '_polishing' => 2, '_reassessment' => 3, '_redraft' => 4];
$holders = ['_polishing', '_reassessment', '_redraft']; // stages that SHOULD carry redraft prose

$rows = $wpdb->get_results(
    "SELECT user_id, meta_key FROM {$wpdb->usermeta}
     WHERE meta_key LIKE 'swml\\_canvas\\_%'
       AND meta_key REGEXP '(_planning|_outlining|_polishing|_reassessment|_redraft)(__a[0-9]+)?$'"
);
echo "[SWEEP] phase-2 stage docs found: " . count($rows) . "\n";

$groups = [];
foreach ($rows as $r) {
    if (!preg_match('/^(swml_canvas_.+?)(_planning|_outlining|_polishing|_reassessment|_redraft)(__a\d+)?$/', $r->meta_key, $m)) continue;
    if (strpos($m[1], '_cw_') !== false || strpos($m[1], 'creative_writing') !== false) continue; // CW = separate pass by ruling
    $gid = $r->user_id . '|' . $m[1] . '|' . ($m[3] ?? '');
    $groups[$gid][$m[2]] = $r->meta_key;
}
echo "[SWEEP] user × paper × attempt groups: " . count($groups) . "\n";

$measure = function ($uid, $key) use ($strip, $decode) {
    $raw = get_user_meta($uid, $key, true);
    $doc = $decode->invoke(null, $raw);
    $html = is_array($doc) ? (string) ($doc['html'] ?? '') : '';
    if ($html === '') return ['chars' => 0, 'wc' => null, 'saved' => null, 'empty_doc' => true];
    $before = strlen(trim(wp_strip_all_tags($html)));
    $after  = strlen(trim(wp_strip_all_tags($strip->invoke(null, $html))));
    $saved  = $doc['savedAt'] ?? ($doc['updatedAt'] ?? ($doc['timestamp'] ?? ($doc['lastSaved'] ?? null)));
    return ['chars' => max(0, $before - $after), 'wc' => $doc['wordCount'] ?? null, 'saved' => $saved, 'empty_doc' => false];
};

$flagged = []; $checked = 0; $sample_keys_printed = false;
foreach ($groups as $gid => $stages) {
    $have = array_values(array_intersect($holders, array_keys($stages)));
    if (count($have) < 2) continue; // need two prose-holding stages to compare
    list($uid, $base, $att) = explode('|', $gid);
    $checked++;
    $m = [];
    foreach ($stages as $sfx => $key) $m[$sfx] = $measure((int) $uid, $key);
    if (!$sample_keys_printed) {
        $doc = $decode->invoke(null, get_user_meta((int) $uid, reset($stages), true));
        echo "[SWEEP] sample doc fields: " . (is_array($doc) ? implode(',', array_keys($doc)) : 'UNDECODABLE') . "\n";
        $sample_keys_printed = true;
    }
    foreach ($have as $early) foreach ($have as $late) {
        if ($order[$early] >= $order[$late]) continue;
        $e = $m[$early]['chars']; $l = $m[$late]['chars'];
        if ($l >= 300 && $e < 0.5 * $l) { $flagged[$gid] = ['uid' => (int) $uid, 'base' => $base, 'att' => $att, 'm' => $m, 'pair' => "$early < $late"]; break 2; }
    }
}
echo "[SWEEP] groups with >=2 prose-holding stages checked: $checked\n";
echo "[SWEEP] FLAGGED (earlier stage < 50% of a later stage's response prose): " . count($flagged) . "\n\n";

foreach ($flagged as $f) {
    $u = get_userdata($f['uid']);
    $role = get_user_meta($f['uid'], 'sophicly_role', true);
    $email = $u ? $u->user_email : '';
    $is_test = (bool) preg_match('/^neilson248\+/i', $email);
    $name = $u ? $u->display_name : '(deleted user)';
    echo "uid {$f['uid']} · {$name} · role=" . ($role ?: 'none') . ($is_test ? ' · TEST ACCOUNT' : '') . "\n";
    echo "   paper: " . substr($f['base'], strlen('swml_canvas_')) . ($f['att'] ? " attempt {$f['att']}" : '') . "   trigger: {$f['pair']}\n";
    foreach (['_planning', '_outlining', '_polishing', '_reassessment', '_redraft'] as $s) {
        if (!isset($f['m'][$s])) { echo "   " . str_pad($s, 15) . "—\n"; continue; }
        $x = $f['m'][$s];
        echo "   " . str_pad($s, 15) . "response_chars=" . str_pad((string) $x['chars'], 6) . " wc=" . str_pad((string) ($x['wc'] ?? '?'), 6) . " saved=" . ($x['saved'] ?? '?') . ($x['empty_doc'] ? '  (EMPTY/UNDECODABLE)' : '') . "\n";
    }
    echo "\n";
}
// ── INSTRUMENT PROOF + AT-RISK: every group, one line. A sweep that reads 0 everywhere passes trivially.
echo "[ALL GROUPS] uid · name · role · paper · stage=response_chars …   (AT-RISK = a later stage holds prose, _polishing never opened)\n";
foreach ($groups as $gid => $stages) {
    list($uid, $base, $att) = explode('|', $gid);
    $u = get_userdata((int) $uid); $role = get_user_meta((int) $uid, 'sophicly_role', true);
    $test = ($u && preg_match('/^neilson248\+/i', $u->user_email)) ? ' TEST' : '';
    $parts = []; $c = [];
    foreach (['_planning', '_outlining', '_polishing', '_reassessment', '_redraft'] as $s) {
        if (!isset($stages[$s])) continue;
        $x = $measure((int) $uid, $stages[$s]); $c[$s] = $x['chars'];
        $parts[] = ltrim($s, '_') . '=' . $x['chars'] . 'ch/' . ($x['wc'] ?? '?') . 'w@' . substr((string) ($x['saved'] ?? '?'), 5, 5);
    }
    $later = max($c['_reassessment'] ?? 0, $c['_redraft'] ?? 0);
    $risk = ($later >= 300 && !isset($stages['_polishing'])) ? '  ⚠ AT-RISK' : '';
    echo $uid . ' · ' . ($u ? $u->display_name : '?') . ' · ' . ($role ?: 'none') . $test . ' · ' . substr($base, strlen('swml_canvas_')) . $att . ' · ' . implode(' ', $parts) . $risk . "\n";
}
echo "[SWEEP] DONE\n";
