<?php
/**
 * cambridge-topics-gate.php — prove the Cambridge topic templates actually PARSE.
 *
 *   php bin/cambridge-topics-gate.php
 *
 * Runs the REAL SWML_Topic_Parser over the two Cambridge language templates and
 * asserts the measured paper shape (CAMBRIDGE-PAPER-SPEC.md, 40/40 real papers):
 *
 *   Paper 1 — 5 topics, each 3 texts + 3 questions, 30 + 25 + 25 = 80
 *   Paper 2 — 6 topics, each 2 texts + 2 questions, 40 + 40      = 80
 *
 * WHY THIS EXISTS, and why a content review could never replace it: the previous
 * Paper 1 template used `## Passage A` headers. The parser's source patterns
 * accept `## Source A` and `## Text A` but NOT `## Passage A`, so all 10 passage
 * blocks matched ZERO patterns and the topics would have rendered questions with
 * no text to read. Nothing warned; the file looked complete to a human. The only
 * check that catches it is running the parser and counting what comes back.
 *
 * Exit status is non-zero on any failure, so this can gate a ship.
 */

define('ABSPATH', dirname(__DIR__) . '/');

// Minimal WordPress surface so the parser can be loaded outside WP.
if (!function_exists('sanitize_key')) {
    function sanitize_key($k) { return strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $k)); }
}
if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($s) { return trim(strip_tags((string) $s)); }
}
if (!function_exists('wp_json_encode')) {
    function wp_json_encode($d) { return json_encode($d); }
}
if (!function_exists('current_time')) {
    function current_time($type = 'mysql') { return date('Y-m-d H:i:s'); }
}
if (!function_exists('wp_strip_all_tags')) {
    function wp_strip_all_tags($s) { return strip_tags((string) $s); }
}
if (!function_exists('absint')) {
    function absint($n) { return abs((int) $n); }
}

require_once dirname(__DIR__) . '/includes/class-topic-parser.php';

$dir = dirname(__DIR__) . '/protocols/shared/templates/topics/';

$specs = [
    [
        'file'      => 'cambridge-igcse-language-p1.md',
        'paper'     => 'Paper 1 — Reading',
        'topics'    => 5,
        'sources'   => 3,
        'questions' => 3,
        'marks'     => [30, 25, 25],
    ],
    [
        'file'      => 'cambridge-igcse-language-p2.md',
        'paper'     => 'Paper 2 — Directed Writing and Composition',
        'topics'    => 6,
        'sources'   => 2,
        'questions' => 2,
        'marks'     => [40, 40],
    ],
];

$fail = [];

foreach ($specs as $spec) {
    $path = $dir . $spec['file'];
    echo "\n=== {$spec['paper']} ({$spec['file']}) ===\n";
    if (!file_exists($path)) {
        $fail[] = "{$spec['file']}: missing";
        echo "  MISSING\n";
        continue;
    }

    $topics = SWML_Topic_Parser::parse(file_get_contents($path));
    printf("  topics parsed: %d (expect %d)\n", count($topics), $spec['topics']);
    if (count($topics) !== $spec['topics']) {
        $fail[] = "{$spec['file']}: " . count($topics) . " topics, expected {$spec['topics']}";
    }

    foreach ($topics as $t) {
        $meta = $t['metadata'] ?? [];
        if (is_string($meta)) $meta = json_decode($meta, true) ?: [];
        $srcs = $meta['sources']   ?? [];
        $qs   = $meta['questions'] ?? [];
        $num  = $t['topic_number'];

        $marks = 0;
        foreach ($qs as $q) $marks += (int) $q['marks'];

        printf("  T%-2s %-28s texts=%d questions=%d marks=%d\n",
            $num, substr($t['label'], 0, 28), count($srcs), count($qs), $marks);

        if (count($srcs) !== $spec['sources']) {
            $fail[] = "{$spec['file']} T$num: " . count($srcs) . " texts, expected {$spec['sources']}";
        }
        if (count($qs) !== $spec['questions']) {
            $fail[] = "{$spec['file']} T$num: " . count($qs) . " questions, expected {$spec['questions']}";
        }
        if ($marks !== 80) {
            $fail[] = "{$spec['file']} T$num: marks total $marks, expected 80";
        }
        foreach (array_values($qs) as $i => $q) {
            $want = $spec['marks'][$i] ?? null;
            if ($want !== null && (int) $q['marks'] !== $want) {
                $fail[] = "{$spec['file']} T$num {$q['id']}: {$q['marks']} marks, expected $want";
            }
        }
        // A text block that parsed but is nearly empty means the body did not
        // travel with its header — the failure mode a header-only check misses.
        foreach ($srcs as $s) {
            if (strlen($s['text']) < 800) {
                $fail[] = "{$spec['file']} T$num {$s['label']}: only " . strlen($s['text']) . " chars";
            }
        }
    }
}

echo "\n";
if ($fail) {
    echo "FAILURES:\n";
    foreach ($fail as $f) echo "  - $f\n";
    exit(1);
}
echo "ALL CAMBRIDGE TOPIC GATES PASS\n";
