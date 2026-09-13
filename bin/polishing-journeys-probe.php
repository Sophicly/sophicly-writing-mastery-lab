<?php
/**
 * polishing-journeys-probe.php — drive representative student journeys through the REAL polishing
 * chat endpoint on staging and record what Sophia replied. (v7.20.610, Neil's brief 2026-09-13:
 * "Exercise the actual choices and resulting feedback, not just the protocol text.")
 *
 * Run on staging (never prod):
 *   wp eval 'require "/tmp/polishing-journeys-probe.php";' --user=1355
 * with the journeys file at /tmp/journeys.json — an array of:
 *   { "id": "p1-q2-weak", "board": "aqa", "subject": "language1", "text": "aqa_lang_paper_1",
 *     "topic": 1, "action": "scan-elements" | "freetext", "message": "…", "section_label": "Q2 Response",
 *     "section_type": "response", "selection": "…", "document": "…full document text…",
 *     "location": "Q2 Response · paragraph 1 of 2 · 96 words in this section",
 *     "history": [ {role, content}, … ], "expect": { "must": [regex…], "must_not": [regex…] } }
 *
 * For each journey it builds the exact invocation the selection chip builds (buildPrompt, with the
 * v7.20.610 Location line), posts it through /sophicly-wml/v1/chat, and records: instructions chars,
 * wire bytes, cache blocks, elapsed, the reply, and which expectations held. Nothing is written to any
 * student document or chat history — /chat is stateless. Output: /tmp/journeys-results.json + a
 * one-line-per-journey summary on stdout.
 */
if (!defined('ABSPATH')) { echo "run inside wp eval\n"; return; }
if (strpos(home_url(), 'staging') === false && strpos(home_url(), 'temp-site') === false) { echo "REFUSED: not staging (" . home_url() . ")\n"; return; }

$in = @file_get_contents('/tmp/journeys.json');
$journeys = json_decode($in, true);
if (!is_array($journeys)) { echo "no /tmp/journeys.json\n"; return; }

$results = [];
foreach ($journeys as $j) {
    $probe = ['id' => $j['id'] ?? '?'];
    $lines = [
        '## Inline Coaching Invocation',
        '',
        '- **Action:** ' . ($j['action'] ?? 'freetext'),
        '- **Selection (frozen at open):** ' . json_encode($j['selection'] ?? '', JSON_UNESCAPED_UNICODE),
        '- **Section type:** ' . json_encode($j['section_type'] ?? 'response'),
        '- **Location:** ' . ($j['location'] ?? 'unknown'),
        '- **Section context (live, re-read this turn):** ' . json_encode($j['section_context'] ?? ($j['selection'] ?? ''), JSON_UNESCAPED_UNICODE),
        '- **Task context:** ' . json_encode(['board' => $j['board'], 'subject' => $j['subject'], 'text' => $j['text'], 'task' => 'polishing', 'topicNumber' => (int) ($j['topic'] ?? 1)]),
    ];
    if (!empty($j['document'])) { $lines[] = ''; $lines[] = '**Current full document (live this turn):**'; $lines[] = '```'; $lines[] = $j['document']; $lines[] = '```'; }
    if (!empty($j['message'])) { $lines[] = ''; $lines[] = '**Student message:** ' . $j['message']; }
    $prompt = implode("\n", $lines);

    $captured = [];
    $f1 = function ($q, $params = null) use (&$captured) {
        $captured['instructions_chars'] = strlen((string) ($q->instructions ?? ''));
        $captured['has_protocol_c'] = (strpos((string) ($q->instructions ?? ''), 'Execute steps 1-11') !== false) || (strpos((string) ($q->instructions ?? ''), 'protocol-c-polishing') !== false);
        $captured['has_universal_rules'] = strpos((string) ($q->instructions ?? ''), 'UNIVERSAL RULES') !== false;
        $captured['has_student_chooses'] = strpos((string) ($q->instructions ?? ''), 'THE STUDENT CHOOSES') !== false;
        $captured['engine'] = strpos((string) ($q->instructions ?? ''), 'Engine LANGUAGE') !== false ? 'language' : (strpos((string) ($q->instructions ?? ''), 'Engine 1 (Selection') !== false ? 'engine-1' : 'none');
        $captured['model'] = $q->model ?? null;
        return $q;
    };
    $f2 = function ($args, $url) use (&$captured) {
        if (strpos((string) $url, 'anthropic.com') === false) return $args;
        $body = (string) ($args['body'] ?? '');
        $captured['wire_body_bytes'] = strlen($body);
        $captured['wire_cache_control_blocks'] = substr_count($body, '"cache_control"');
        return $args;
    };
    add_filter('mwai_ai_query', $f1, 999, 2);
    add_filter('http_request_args', $f2, 999, 2);

    $body = [
        'prompt' => $prompt, 'botId' => 'wml-claude', 'chatId' => 'journey_' . ($j['id'] ?? 'x') . '_' . time(),
        'history' => $j['history'] ?? [], 'board' => $j['board'], 'subject' => $j['subject'], 'text' => $j['text'],
        'task' => 'polishing', 'topicNumber' => (int) ($j['topic'] ?? 1), 'phase' => 'redraft', 'draftType' => 'diagnostic_redraft',
    ];
    $req = new WP_REST_Request('POST', '/sophicly-wml/v1/chat');
    $req->set_header('Content-Type', 'application/json');
    $req->set_body(wp_json_encode($body));
    $t0 = microtime(true);
    $res = rest_do_request($req);
    remove_filter('mwai_ai_query', $f1, 999);
    remove_filter('http_request_args', $f2, 999);
    $data = $res instanceof WP_REST_Response ? $res->get_data() : (array) $res;
    $reply = (string) ($data['reply'] ?? ($data['message'] ?? ''));
    $probe += $captured;
    $probe['elapsed_s'] = round(microtime(true) - $t0, 1);
    $probe['success'] = $data['success'] ?? null;
    $probe['reply'] = $reply;
    $must = $j['expect']['must'] ?? []; $mustNot = $j['expect']['must_not'] ?? [];
    $probe['must_failed'] = array_values(array_filter($must, function ($re) use ($reply) { return !preg_match('/' . $re . '/i', $reply); }));
    $probe['must_not_hit'] = array_values(array_filter($mustNot, function ($re) use ($reply) { return (bool) preg_match('/' . $re . '/i', $reply); }));
    $probe['verdict'] = (empty($probe['must_failed']) && empty($probe['must_not_hit'])) ? 'PASS' : 'FAIL';
    $results[] = $probe;
    echo str_pad($probe['verdict'], 5) . ' ' . str_pad($probe['id'], 28) . ' eng=' . str_pad((string) ($probe['engine'] ?? '?'), 9) . ' instr=' . str_pad((string) ($probe['instructions_chars'] ?? '?'), 7) . ' wire=' . str_pad((string) ($probe['wire_body_bytes'] ?? '?'), 7) . ' ' . $probe['elapsed_s'] . "s  protocolC=" . (($probe['has_protocol_c'] ?? false) ? 'YES' : 'no') . " universal=" . (($probe['has_universal_rules'] ?? false) ? 'YES' : 'no') . "\n";
    if ($probe['verdict'] === 'FAIL') echo '      must_failed=' . json_encode($probe['must_failed']) . ' must_not_hit=' . json_encode($probe['must_not_hit']) . "\n";
}
file_put_contents('/tmp/journeys-results.json', wp_json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "wrote /tmp/journeys-results.json (" . count($results) . " journeys)\n";
