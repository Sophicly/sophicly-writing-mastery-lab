<?php
/**
 * live-model-paper-gate.php — LOCAL gate for authored live-modelling papers. No WordPress needed.
 *
 *   php bin/live-model-paper-gate.php bin/live-modelling-papers            (every *.md under it)
 *   php bin/live-model-paper-gate.php path/to/202011.md                    (one)
 *
 * Runs the plugin's OWN parser (SWML_Topic_Parser) over the markdown and asserts, per paper, the
 * things a summary cannot: the parsed topic number/label/format, every source's printed line
 * markers landing on the board's own words, the line count, the tariff, the question count,
 * the Q1 statements (Paper 2), and that metadata is a JSON STRING (the #450 shape). The same
 * checks run again server-side in live-model-install-papers.php before anything is written.
 */
if (!defined('ABSPATH')) { define('ABSPATH', __DIR__ . '/../'); }   // local run: the parser file exits without it
if (!function_exists('current_time'))   { function current_time($t) { return date('Y-m-d H:i:s'); } }
if (!function_exists('wp_json_encode')) { function wp_json_encode($d, $f = 0) { return json_encode($d, $f); } }
require_once __DIR__ . '/../includes/class-topic-parser.php';

function swml_lm_paper_checks($md_path, &$report) {
    $fails = 0;
    $side_path = preg_replace('/\.md$/', '', $md_path) . '.checks.json';
    if (!is_file($side_path)) { $report[] = "  ✗ no sidecar {$side_path}"; return 1; }
    $side = json_decode(file_get_contents($side_path), true);
    if (!is_array($side)) { $report[] = "  ✗ sidecar is not JSON"; return 1; }
    $topics = SWML_Topic_Parser::parse(file_get_contents($md_path));
    $ok = function ($cond, $label) use (&$fails, &$report) { $report[] = ($cond ? '  ✓ ' : '  ✗ ') . $label; if (!$cond) $fails++; };
    $ok(count($topics) === 1, "parses to exactly ONE topic (got " . count($topics) . ")");
    if (count($topics) !== 1) return $fails;
    $t = $topics[0];
    $ok((int) $t['topic_number'] === (int) $side['topic_number'], "topic_number {$t['topic_number']} = sidecar {$side['topic_number']}");
    $ok($t['label'] === $side['label'], "label matches sidecar");
    if (($side['format'] ?? 'multi_question') === 'unseen') {
        $ok($t['question_format'] === 'unseen', "question_format unseen (got {$t['question_format']})");
        foreach (['A' => 'part_a', 'B' => 'part_b'] as $L => $pfx) {
            $pm = $side['poems'][$L];
            $q = trim((string) $t[$pfx . '_question']);
            $ok(strlen($q) > 20 && strpos($q, '### Poem') === false && strpos($q, '**Title') === false, "{$pfx}_question is text only (" . strlen($q) . " chars), no poem leaked into it");
            $ok((int) $t[$pfx . '_marks'] === (int) ($L === 'A' ? $side['questions']['Q27.1'] : $side['questions']['Q27.2']), "{$pfx}_marks = {$t[$pfx . '_marks']}");
            $ex = (string) $t[$pfx . '_extract'];
            $ok(strpos($ex, '**Title:** ' . $pm['title']) !== false && strpos($ex, '**Poet:** ' . $pm['poet']) !== false, "poem $L carries its title + poet ('{$pm['title']}' / '{$pm['poet']}')");
            $lines = [];
            foreach (explode("\n", $ex) as $ln) { if (preg_match('/^(\d+)\s+(.*)$/', $ln, $m)) $lines[(int) $m[1]] = $m[2]; }
            $ok(count($lines) === (int) $pm['line_count'] && max(array_keys($lines) ?: [0]) === (int) $pm['line_count'], "poem $L: " . count($lines) . " numbered lines (expect {$pm['line_count']})");
            $bad = [];
            foreach ($pm['line_checks'] as $n => $needle) { if (!isset($lines[(int) $n]) || strpos($lines[(int) $n], $needle) !== 0) $bad[] = $n; }
            $ok(!$bad, "poem $L: " . count($pm['line_checks']) . " printed markers land on the poet's own words" . ($bad ? " — WRONG at " . implode(',', $bad) : ''));
        }
        $ok((int) $t['part_a_marks'] + (int) $t['part_b_marks'] === 32, "tariff 24 + 8 = 32");
        $nh = $side['needs_human'] ?? [];
        $ok(empty($nh), empty($nh) ? "nothing left for a human" : "NEEDS HUMAN: " . implode(' | ', $nh));
        return $fails;
    }
    $ok($t['question_format'] === 'multi_question', "question_format multi_question (got {$t['question_format']})");
    $ok(is_string($t['metadata']), "metadata is a JSON STRING (" . gettype($t['metadata']) . ") — the #450 shape");
    $meta = json_decode((string) $t['metadata'], true);
    $ok(is_array($meta) && !empty($meta['questions']) && !empty($meta['sources']), "metadata decodes with questions + sources");
    if (!is_array($meta)) return $fails;
    $ok(count($meta['sources']) === count($side['sources']), "sources: " . count($meta['sources']) . " (sidecar " . count($side['sources']) . ")");
    foreach ($side['sources'] as $L => $sc) {
        $src = null;
        // the board's own word for a source: AQA 'Source A', Cambridge 'Text A', Edexcel IGCSE 'Text One'
        $alt = ['A' => 'One|1', 'B' => 'Two|2', 'C' => 'Three|3'][$L] ?? $L;
        foreach ($meta['sources'] as $s) { if (preg_match('/(?:Source|Text)\s*(?:' . $L . '|' . $alt . ')\b/i', $s['label'])) $src = $s; }
        if (!$src) { $ok(false, "Source $L present in metadata"); continue; }
        $lines = [];
        foreach (explode("\n", $src['text']) as $ln) { if (preg_match('/^(\d+)\s+(.*)$/', $ln, $m)) $lines[(int) $m[1]] = $m[2]; }
        $ok(count($lines) === (int) $sc['line_count'] && max(array_keys($lines)) === (int) $sc['line_count'], "Source $L: " . count($lines) . " numbered lines, last = " . (count($lines) ? max(array_keys($lines)) : 0) . " (expect {$sc['line_count']})");
        $bad = [];
        foreach ($sc['line_checks'] as $n => $needle) { if (!isset($lines[(int) $n]) || strpos($lines[(int) $n], $needle) !== 0) $bad[] = $n; }
        $ok(!$bad, "Source $L: " . count($sc['line_checks']) . " printed markers land on the board's own words" . ($bad ? " — WRONG at " . implode(',', $bad) : ''));
        if (empty($sc['untitled'])) $ok(!empty($src['title']) && !empty($src['author']), "Source $L: title + author present ('" . ($src['title'] ?? '') . "' / '" . ($src['author'] ?? '') . "')");
        else $ok(!empty($src['context']) || strpos($src['text'], '**Context:**') !== false, "Source $L: untitled on the paper (declared) — carries its context line");
        $ok(strpos($src['text'], '[NEEDS HUMAN') === false, "Source $L: no [NEEDS HUMAN] left in the text");
    }
    $qs = $meta['questions'];
    $want_ids = array_keys($side['questions']);
    $ok(count($qs) === count($want_ids), count($want_ids) . " questions (got " . count($qs) . ")");
    $sum = 0; $ids = [];
    foreach ($qs as $q) { $sum += (int) $q['marks']; $ids[] = $q['id']; $want = $side['questions'][$q['id']] ?? null; $ok((int) $q['marks'] === (int) $want, "{$q['id']} = {$q['marks']} marks (sidecar $want)"); $ok(strlen(trim($q['text'])) > 20, "{$q['id']} has text (" . strlen($q['text']) . " chars)"); }
    $ok($sum === (int) $side['total_marks'], "tariff sums to $sum (sidecar total {$side['total_marks']})");
    $ok($ids === $want_ids, "question ids in order (" . implode(',', $ids) . " vs sidecar " . implode(',', $want_ids) . ")");
    // Q1 true/false statements are an AQA Paper 2 shape, declared by the sidecar — never inferred from "has a Source B"
    // (Eduqas Component 2 also has two sources and a three-part retrieval Q1; the sub-lane's GATE-NOTES §1).
    if (($side['q1_format'] ?? (empty($side['sources']['B']) ? 'open' : 'statements')) === 'statements') {
        $q1 = $qs[0];
        $ok(!empty($q1['statements']) && count($q1['statements']) === 8, "Q1 carries 8 statements (got " . count($q1['statements'] ?? []) . ")");
        $true = array_sum(array_map('intval', $q1['statement_key'] ?? []));
        $ok($true === 4, "Q1 key has exactly 4 TRUE statements (got $true)");
        $ok(strpos($q1['text'], '[T]') === false && strpos($q1['text'], '[F]') === false, "Q1 text carries no [T]/[F] leak");
    }
    $nh = $side['needs_human'] ?? [];
    $ok(empty($nh), empty($nh) ? "nothing left for a human" : "NEEDS HUMAN: " . implode(' | ', $nh));
    return $fails;
}

if (PHP_SAPI === 'cli' && isset($argv[0]) && basename($argv[0]) === basename(__FILE__)) {
    $target = $argv[1] ?? __DIR__ . '/live-modelling-papers';
    $files = is_dir($target) ? array_values(array_filter(iterator_to_array(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($target))), function ($f) { return (bool) preg_match('/^\\d{6,7}\\.md$/', basename((string) $f)); })) : [$target];
    sort($files);
    $total = 0;
    foreach ($files as $f) {
        $report = [];
        $fails = swml_lm_paper_checks((string) $f, $report);
        $total += $fails;
        echo ($fails ? "❌ " : "✅ ") . basename(dirname($f)) . '/' . basename($f) . ($fails ? " — $fails failed" : '') . "\n";
        foreach ($report as $r) { if ($fails || strpos($r, '✗') !== false || strpos($r, 'NEEDS HUMAN') !== false) echo $r . "\n"; }
    }
    echo "\n" . ($total ? "❌ $total assertion(s) failed across " . count($files) . " paper(s)" : "✅ " . count($files) . " paper(s) pass every check") . "\n";
    exit($total ? 1 : 0);
}
