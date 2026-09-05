<?php
/**
 * live-model-install-papers.php — install authored live-modelling papers into the topic stores.
 * The generalised successor of live-model-install-paper.php (Rosabel): same dry/apply/remove
 * contract, same refusal on any failed check, driven by the authored markdown + sidecar.
 *
 *   wp eval-file bin/live-model-install-papers.php                         → DRY RUN over bin/live-modelling-papers
 *   wp eval-file bin/live-model-install-papers.php apply                   → write every paper that passes
 *   wp eval-file bin/live-model-install-papers.php apply only=202011       → one topic number
 *   wp eval-file bin/live-model-install-papers.php remove only=202011      → remove that topic again
 *   wp eval-file bin/live-model-install-papers.php dir=/path/to/papers …   → another papers dir
 *
 * Guards (root CLAUDE.md §5b / §5d): every check in live-model-paper-gate.php runs here first;
 * the store must be an auto-imported one (`_mtime` present) unless `force-store` is passed —
 * that is how a paper cannot land in a legacy store no lesson reads (#447a); the write is
 * round-tripped (metadata string, question count, byte-identical extract) before "AFTER" is printed.
 */
if (!defined('ABSPATH')) { fwrite(STDERR, "run with wp eval-file\n"); exit(1); }
require_once __DIR__ . '/live-model-paper-gate.php';

$mode = 'dry'; $only = null; $dir = __DIR__ . '/live-modelling-papers'; $force = false;
foreach ((array) $args as $a) {
    if ($a === 'apply') $mode = 'apply';
    elseif ($a === 'remove') $mode = 'remove';
    elseif ($a === 'force-store') $force = true;
    elseif (strpos($a, 'only=') === 0) $only = (int) substr($a, 5);
    elseif (strpos($a, 'dir=') === 0) $dir = substr($a, 4);
}
$files = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $f) { if (preg_match('/^\\d{6,7}\\.md$/', basename((string) $f))) $files[] = (string) $f; }   // only <sitting>.md are papers (GATE-NOTES.md etc. are not)
sort($files);
echo "MODE: $mode · " . count($files) . " paper file(s) under $dir" . ($only ? " · only=$only" : '') . "\n";

$written = 0; $refused = 0; $skipped = 0;
foreach ($files as $md) {
    $side = json_decode((string) @file_get_contents(preg_replace('/\.md$/', '', $md) . '.checks.json'), true);
    if (!is_array($side)) { echo "\n⛔ " . basename($md) . ": no sidecar — refused\n"; $refused++; continue; }
    if ($only && (int) $side['topic_number'] !== $only) { $skipped++; continue; }
    $report = [];
    $fails = swml_lm_paper_checks($md, $report);
    echo "\n" . ($fails ? "⛔ " : "• ") . basename(dirname($md)) . '/' . basename($md) . " — " . $side['label'] . "\n";
    if ($fails) { foreach ($report as $r) if (strpos($r, '✗') !== false) echo $r . "\n"; echo "   REFUSED — $fails check(s) failed\n"; $refused++; continue; }

    $key = $side['store'];
    $topics = get_option($key, []);
    if (!is_array($topics)) $topics = [];
    $mtime = get_option($key . '_mtime', null);
    // The canonical store is the one the template system owns: either it was auto-imported (has _mtime)
    // or its template file exists and simply has not been imported on this env yet (unseen poetry on prod).
    $tpl = plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/templates/topics/' . str_replace('_', '-', $side['board']) . '-' . SWML_Topic_Questions::text_to_template_slug($side['text'], $side['board']) . '.md';
    if ($mtime === null && !file_exists($tpl) && !$force) { echo "   ⛔ store $key has no _mtime and no template ($tpl) — not a canonical store; refused (force-store overrides)\n"; $refused++; continue; }
    $n = (int) $side['topic_number'];
    $existing = null;
    foreach ($topics as $i => $t) { if ((int) ($t['topic_number'] ?? 0) === $n) $existing = $i; }
    echo "   store $key: " . count($topics) . " topics; topic $n " . ($existing === null ? 'ABSENT' : 'PRESENT') . "\n";

    if ($mode === 'remove') {
        if ($existing === null) { echo "   nothing to remove\n"; continue; }
        array_splice($topics, $existing, 1);
        update_option($key, $topics, false); wp_cache_delete($key, 'options'); wp_cache_delete('alloptions', 'options');
        echo "   REMOVED topic $n → " . count(get_option($key, [])) . " topics\n"; $written++; continue;
    }
    $parsed = SWML_Topic_Parser::parse(file_get_contents($md))[0];
    $parsed['task'] = 'planning';
    if ($mode !== 'apply') { echo "   DRY RUN — would " . ($existing === null ? 'ADD' : 'REPLACE') . " topic $n (" . count(json_decode($parsed['metadata'], true)['questions']) . " questions, extract " . strlen($parsed['extract_text']) . " bytes)\n"; continue; }

    if ($existing === null) $topics[] = $parsed; else $topics[$existing] = $parsed;
    usort($topics, function ($a, $b) { return ($a['topic_number'] ?? 0) - ($b['topic_number'] ?? 0); });
    $okw = update_option($key, $topics, false);
    if (!$okw) { delete_option($key); $okw = add_option($key, $topics, '', 'no'); }
    wp_cache_delete($key, 'options'); wp_cache_delete('alloptions', 'options');
    $back = null;
    foreach (get_option($key, []) as $t) { if ((int) ($t['topic_number'] ?? 0) === $n) $back = $t; }
    // Round-trip against what THIS paper declares (the sidecar), never a fixed shape: Cambridge P1 has 3
    // questions, Eduqas C2 eight, and the unseen format keeps its poems in part_a/part_b, not extract_text.
    $bm = $back['metadata'] ?? null; $bq = is_string($bm) ? (json_decode($bm, true)['questions'] ?? []) : [];
    $want_q = ($side['format'] ?? 'multi_question') === 'unseen' ? 0 : count($side['questions']);
    $ex_field = ($side['format'] ?? 'multi_question') === 'unseen' ? 'part_a_extract' : 'extract_text';
    $rt = $back && is_string($bm) && count($bq) === $want_q && ($back[$ex_field] ?? null) === ($parsed[$ex_field] ?? null) && strlen((string) ($back[$ex_field] ?? '')) > 0;
    echo "   " . ($rt ? "✓ WRITTEN + round-trip verified" : "⛔ ROUND-TRIP FAILED") . " — metadata " . gettype($bm) . ", " . count($bq) . " questions (sidecar $want_q), $ex_field " . strlen((string) ($back[$ex_field] ?? '')) . " bytes\n";
    if ($rt) $written++; else $refused++;
    $via = SWML_Topic_Questions::get_topic($side['board'], $side['text'], $n);
    echo "   " . ($via ? "✓" : "⛔") . " resolves through get_topic('{$side['board']}', '{$side['text']}', $n)\n";
}
echo "\nDONE: $written written/removed · $refused refused · $skipped skipped\n";
