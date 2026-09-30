<?php
/**
 * WML 320 A (#687) — THE THINKING-EFFORT REPLAY. Neil approved ~$5 (2026-09-30).
 *
 * Reads the exchanges the v7.20.675 recorder captured from Neil's own staging marking run, keeps the
 * paragraph-MARKING turns (their reply carries "Total Mark for"), and re-sends each request BYTE-FOR-BYTE
 * except output_config.effort (captured run = Sonnet 5's default, high). Records usage, cost and the
 * reply text per level. Runs ON the server: the API key is read from AI Engine's settings and is never
 * printed or written. Hard budget stop. Usage: wp eval 'require "/tmp/effort-replay.php";'
 *   env EFFORT_DRY=1 → list what would be replayed, spend nothing.
 */
if (!defined('ABSPATH')) exit;
@set_time_limit(0);
$DIR     = '/home/runcloud/wml-capture-20260930';
$LEVELS  = ['medium', 'low'];
$MAX_USD = (float) (getenv("EFFORT_MAX_USD") ?: 25.0); // Neil 2026-09-30: cost is no object, get it right; 25 = runaway guard only
$DRY     = getenv('EFFORT_DRY') === '1';
$P = ['in' => 2e-6, 'out' => 10e-6, 'cr' => 0.2e-6, 'cw' => 4e-6];   // claude-sonnet-5 list; 1h cache write

function er_text_of($body) {   // reply text from a JSON reply OR a buffered SSE stream
    $j = json_decode($body, true);
    if (is_array($j) && isset($j['content'])) {
        $t = ''; foreach ((array) $j['content'] as $b) if (($b['type'] ?? '') === 'text') $t .= $b['text'];
        return $t;
    }
    $t = '';
    foreach (preg_split('/\r?\n/', (string) $body) as $line) {
        if (strncmp($line, 'data:', 5) !== 0) continue;
        $ev = json_decode(trim(substr($line, 5)), true);
        if (is_array($ev) && ($ev['type'] ?? '') === 'content_block_delta' && ($ev['delta']['type'] ?? '') === 'text_delta') $t .= $ev['delta']['text'];
    }
    return $t;
}
function er_usage_of($body) {
    $u = ['in' => 0, 'out' => 0, 'cr' => 0, 'cw' => 0];
    $add = function ($x) use (&$u) {
        $u['in'] += (int) ($x['input_tokens'] ?? 0); $u['out'] += (int) ($x['output_tokens'] ?? 0);
        $u['cr'] += (int) ($x['cache_read_input_tokens'] ?? 0); $u['cw'] += (int) ($x['cache_creation_input_tokens'] ?? 0);
    };
    $j = json_decode($body, true);
    if (is_array($j) && isset($j['usage'])) { $add($j['usage']); return $u; }
    foreach (preg_split('/\r?\n/', (string) $body) as $line) {
        if (strncmp($line, 'data:', 5) !== 0) continue;
        $ev = json_decode(trim(substr($line, 5)), true);
        if (!is_array($ev)) continue;
        if (!empty($ev['message']['usage'])) $add($ev['message']['usage']);
        if (!empty($ev['usage'])) $add($ev['usage']);
    }
    return $u;
}
function er_cost($u, $P) { return $u['in'] * $P['in'] + $u['out'] * $P['out'] + $u['cr'] * $P['cr'] + $u['cw'] * $P['cw']; }

// The key: AI Engine's Anthropic environment. Never echoed.
$key = '';
$opts = get_option('mwai_options', []);
foreach ((array) ($opts['ai_envs'] ?? []) as $env) {
    if (is_array($env) && ($env['type'] ?? '') === 'anthropic' && !empty($env['apikey'])) { $key = (string) $env['apikey']; break; }
}
if ($key === '' && !$DRY) { echo "ABORT: no Anthropic key found in AI Engine settings\n"; return; }

$files = glob($DIR . '/2*.json') ?: [];
sort($files);
$jobs = [];
foreach ($files as $f) {
    $rec = json_decode((string) file_get_contents($f), true);
    if (!is_array($rec) || empty($rec['request'])) continue;
    $txt = er_text_of((string) ($rec['response'] ?? ''));
    if (!preg_match('/Total Mark for ([^:\n]+):\s*\**\s*([\d.]+)\s*\**\s*\/\s*(\d+)/i', $txt, $m)) continue;
    $jobs[] = ['file' => basename($f), 'rec' => $rec, 'section' => trim($m[1]), 'base_text' => $txt, 'base_mark' => $m[2] . '/' . $m[3]];
}
echo count($files) . " exchange(s) captured, " . count($jobs) . " marking turn(s): " . implode(' · ', array_map(function ($j) { return $j['section'] . ' ' . $j['base_mark']; }, $jobs)) . "\n";
if ($DRY || !$jobs) return;

$spent = 0.0; $maxCall = 0.0; $out = [];
foreach ($jobs as $j) {
    $bu = er_usage_of((string) ($j['rec']['response'] ?? ''));
    $row = ['section' => $j['section'], 'file' => $j['file'],
            'high' => ['mark' => $j['base_mark'], 'usage' => $bu, 'cost' => er_cost($bu, $P), 'text' => $j['base_text']]];
    foreach ($LEVELS as $lvl) {
        if ($spent + max($maxCall, 0.35) > $MAX_USD) { echo "BUDGET STOP before {$j['section']} @ {$lvl} (spent \$" . round($spent, 3) . ")\n"; break 2; }
        $payload = json_decode($j['rec']['request'], true);
        if (!is_array($payload)) continue;
        $payload['output_config'] = array_merge((array) ($payload['output_config'] ?? []), ['effort' => $lvl]);
        $payload['stream'] = false;
        $t0 = microtime(true);
        $resp = wp_remote_post('https://api.anthropic.com/v1/messages', [
            'timeout' => 600,
            'headers' => ['x-api-key' => $key, 'anthropic-version' => '2023-06-01', 'content-type' => 'application/json'],
            'body'    => wp_json_encode($payload),
        ]);
        $secs = round(microtime(true) - $t0, 1);
        if (is_wp_error($resp)) { echo "  {$j['section']} @ {$lvl}: HTTP error " . $resp->get_error_message() . "\n"; continue; }
        $code = wp_remote_retrieve_response_code($resp); $body = wp_remote_retrieve_body($resp);
        if ($code !== 200) { echo "  {$j['section']} @ {$lvl}: HTTP {$code} " . substr($body, 0, 300) . "\n"; continue; }
        $u = er_usage_of($body); $c = er_cost($u, $P); $spent += $c; $maxCall = max($maxCall, $c);
        $txt = er_text_of($body);
        $mk = preg_match('/Total Mark for [^:\n]+:\s*\**\s*([\d.]+)\s*\**\s*\/\s*(\d+)/i', $txt, $mm) ? $mm[1] . '/' . $mm[2] : '?';
        $row[$lvl] = ['mark' => $mk, 'usage' => $u, 'cost' => $c, 'secs' => $secs, 'text' => $txt];
        printf("  %-18s @ %-6s mark %-6s out %6d (high %6d)  \$%.3f  %5.1fs\n", $j['section'], $lvl, $mk, $u['out'], $bu['out'], $c, $secs);
    }
    $out[] = $row;
}
$dest = $DIR . '/effort-results.json';
file_put_contents($dest, wp_json_encode($out), LOCK_EX); @chmod($dest, 0600);
echo "SPENT \$" . round($spent, 3) . " on " . count($out) . " paragraph(s) → " . $dest . "\n";
