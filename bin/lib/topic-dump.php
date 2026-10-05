<?php
/**
 * v7.20.697 (#722 B2 step 0) — dump a topic template's REAL parsed questions as JSON, through the
 * shipped SWML_Topic_Parser (the same parse the topic REST import runs). The render probe and the
 * planning key-match harness need the question TEXT the page sees (q.text drives the creative /
 * persuasive routing), not the spec JSON's summary of it.
 *
 *   php bin/lib/topic-dump.php protocols/shared/templates/topics/edexcel-igcse-language-p2.md
 *
 * Prints [{ "topic": N, "label": "...", "aos": "...", "questions": [...metadata.questions] }].
 */
if (PHP_SAPI !== 'cli') exit(1);
define('ABSPATH', __DIR__ . '/');
if (!function_exists('current_time')) { function current_time($t) { return ''; } }
if (!function_exists('wp_json_encode')) { function wp_json_encode($v, $f = 0) { return json_encode($v, $f); } }
require dirname(__DIR__, 2) . '/includes/class-topic-parser.php';
$file = $argv[1] ?? '';
if (!$file || !is_readable($file)) { fwrite(STDERR, "topic-dump: unreadable template: $file\n"); exit(2); }
$out = [];
foreach (SWML_Topic_Parser::parse(file_get_contents($file)) as $t) {
    $meta = json_decode($t['metadata'] ?: '{}', true) ?: [];
    $out[] = [
        'topic'     => (int) $t['topic_number'],
        'label'     => $t['label'],
        'aos'       => $t['aos'],
        'format'    => $t['question_format'],
        'questions' => $meta['questions'] ?? [],
        'sources'   => count($meta['sources'] ?? []),
    ];
}
echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), "\n";
