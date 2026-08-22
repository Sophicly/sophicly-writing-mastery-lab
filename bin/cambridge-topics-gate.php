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
        'file'   => 'cambridge-igcse-language-p1.md',
        'paper'  => 'Paper 1 — Reading',
        // ⭐ NO LONGER UNIFORM. Neil ruled the course shape on 2026-08-22: alternate a whole paper
        // with a long-question topic, because Q3's FORM changes between papers and four papers
        // cannot cover five untested forms. So each topic declares its OWN shape, and a gate that
        // asserted "every topic has 3 texts and 80 marks" would now pass on a template that had
        // silently lost a text from a focus topic.
        'topics' => [
            1 => ['texts'=>3,'qs'=>['Q1'=>30,'Q2'=>25,'Q3'=>25],'total'=>80],
            2 => ['texts'=>1,'qs'=>['Q3'=>25],                    'total'=>25],
            3 => ['texts'=>3,'qs'=>['Q1'=>30,'Q2'=>25,'Q3'=>25],'total'=>80],
            4 => ['texts'=>2,'qs'=>['Q1'=>30,'Q2'=>25],          'total'=>55],
            5 => ['texts'=>3,'qs'=>['Q1'=>30,'Q2'=>25,'Q3'=>25],'total'=>80],
            6 => ['texts'=>1,'qs'=>['Q3'=>25],                    'total'=>25],
            7 => ['texts'=>3,'qs'=>['Q1'=>30,'Q2'=>25,'Q3'=>25],'total'=>80],
            8 => ['texts'=>2,'qs'=>['Q1'=>30,'Q2'=>25],          'total'=>55],
        ],
    ],
    [
        'file'   => 'cambridge-igcse-language-p2.md',
        'paper'  => 'Paper 2 — Directed Writing and Composition',
        // Same alternating shape as Paper 1. Topic 4 is a Section B focus and carries NO insert —
        // Cambridge's composition section is written from the candidate's own invention, so zero
        // texts is correct here and a uniform "every topic has 2 texts" assertion would be wrong.
        'topics' => [
            1 => ['texts'=>2,'qs'=>['Q1'=>40,'Q2'=>40],'total'=>80],
            2 => ['texts'=>2,'qs'=>['Q1'=>40],          'total'=>40],
            3 => ['texts'=>2,'qs'=>['Q1'=>40,'Q2'=>40],'total'=>80],
            4 => ['texts'=>0,'qs'=>['Q2'=>40],          'total'=>40],
            5 => ['texts'=>2,'qs'=>['Q1'=>40,'Q2'=>40],'total'=>80],
            6 => ['texts'=>2,'qs'=>['Q1'=>40],          'total'=>40],
        ],
    ],
];

$fail = [];

foreach ($specs as $spec) {
    $path = $dir . $spec['file'];
    echo "\n=== {$spec['paper']} ({$spec['file']}) ===\n";
    if (!file_exists($path)) { $fail[] = "{$spec['file']}: missing"; echo "  MISSING\n"; continue; }

    $topics = SWML_Topic_Parser::parse(file_get_contents($path));
    $want_n = count($spec['topics']);
    printf("  topics parsed: %d (expect %d)\n", count($topics), $want_n);
    if (count($topics) !== $want_n) {
        $fail[] = "{$spec['file']}: " . count($topics) . " topics, expected $want_n";
    }

    foreach ($topics as $t) {
        $meta = $t['metadata'] ?? [];
        if (is_string($meta)) $meta = json_decode($meta, true) ?: [];
        $srcs = $meta['sources'] ?? [];
        $qs   = $meta['questions'] ?? [];
        $num  = (int) $t['topic_number'];
        $want = $spec['topics'][$num] ?? null;

        $marks = 0;
        foreach ($qs as $q) $marks += (int) $q['marks'];
        printf("  T%-2s %-34s texts=%d questions=%d marks=%d\n",
            $num, substr($t['label'], 0, 34), count($srcs), count($qs), $marks);

        if ($want === null) { $fail[] = "{$spec['file']} T$num: unexpected topic number"; continue; }
        if (count($srcs) !== $want['texts'])
            $fail[] = "{$spec['file']} T$num: " . count($srcs) . " texts, expected {$want['texts']}";
        if (count($qs) !== count($want['qs']))
            $fail[] = "{$spec['file']} T$num: " . count($qs) . " questions, expected " . count($want['qs']);
        if ($marks !== $want['total'])
            $fail[] = "{$spec['file']} T$num: marks total $marks, expected {$want['total']}";
        foreach ($qs as $q) {
            $id = $q['id'];
            if (!isset($want['qs'][$id])) { $fail[] = "{$spec['file']} T$num: unexpected question $id"; continue; }
            if ((int) $q['marks'] !== $want['qs'][$id])
                $fail[] = "{$spec['file']} T$num $id: {$q['marks']} marks, expected {$want['qs'][$id]}";
        }
        // A text block that parsed but is nearly empty means the body did not travel with its
        // header — the failure mode a header-only check misses.
        foreach ($srcs as $s2) {
            if (strlen($s2['text']) < 800)
                $fail[] = "{$spec['file']} T$num {$s2['label']}: only " . strlen($s2['text']) . " chars";
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
