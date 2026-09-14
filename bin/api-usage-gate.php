<?php
/**
 * API USAGE ACCOUNTING GATE (v7.20.622).
 *
 * Proves record_anthropic_usage() actually adds up, WITHOUT spending a penny on the API:
 * it drives the REAL method (loaded from the shipped class, never re-implemented) with
 * real-shaped Anthropic responses and asserts the arithmetic.
 *
 * Covers the four things that can silently go wrong:
 *   1. a non-streaming reply's cache fields are read (the whole point — AI Engine reads neither)
 *   2. a BUFFERED SSE stream is parsed (message_start carries input+cache, message_delta output)
 *   3. a request whose usage we never saw is counted as UNOBSERVED, not as zero
 *      — silently recording 0 is the exact failure this feature exists to correct
 *   4. non-Anthropic traffic is ignored entirely (this filter runs on EVERY http response)
 *
 * Run: php bin/api-usage-gate.php
 */

// ── minimal WP surface, so the shipped class can run outside WordPress ───────────────────────
$GLOBALS['__opts'] = [];
if (!function_exists('get_option'))    { function get_option($k, $d = false) { return $GLOBALS['__opts'][$k] ?? $d; } }
if (!function_exists('update_option')) { function update_option($k, $v, $a = null) { $GLOBALS['__opts'][$k] = $v; return true; } }
if (!function_exists('apply_filters')) { function apply_filters($t, $v) { return $v; } }
if (!function_exists('add_filter'))    { function add_filter() { return true; } }
if (!function_exists('add_action'))    { function add_action() { return true; } }
if (!function_exists('is_wp_error'))   { function is_wp_error($t) { return false; } }

$file = __DIR__ . '/../includes/class-protocol-router.php';
$src  = file_get_contents($file);
if ($src === false) { fwrite(STDERR, "cannot read $file\n"); exit(1); }

// Load ONLY the two methods under test plus the price table, by slicing them out of the shipped
// class — requiring the whole file would drag in the rest of WordPress.
function slice_method($src, $name) {
    $i = strpos($src, ' function ' . $name . '(');
    if ($i === false) { fwrite(STDERR, "❌ api-usage-gate: method $name not found — it moved or was renamed.\n"); exit(1); }
    $i = strrpos(substr($src, 0, $i), "\n    ") + 1;
    $b = strpos($src, '{', $i); $d = 0;
    for ($k = $b; $k < strlen($src); $k++) {
        if ($src[$k] === '{') $d++;
        elseif ($src[$k] === '}') { $d--; if (!$d) return substr($src, $i, $k - $i + 1); }
    }
    fwrite(STDERR, "❌ api-usage-gate: unbalanced braces slicing $name\n"); exit(1);
}
$code = "class SWML_Protocol_Router {\n"
      . slice_method($src, 'record_anthropic_usage') . "\n"
      . slice_method($src, '_accumulate_usage') . "\n"
      . slice_method($src, 'token_prices') . "\n}";
eval($code);

$r = new SWML_Protocol_Router();
$URL = 'https://api.anthropic.com/v1/messages';
$today = gmdate('Y-m-d');
$pass = 0; $fail = 0;
function ok($cond, $msg) { global $pass, $fail; if ($cond) { $pass++; echo "  ✓ $msg\n"; } else { $fail++; echo "  ✗ $msg\n"; } }
function row($model = 'claude-sonnet-5') { $s = $GLOBALS['__opts']['swml_api_usage_daily'] ?? []; return $s[gmdate('Y-m-d')][$model] ?? null; }

echo "\n1. NON-STREAMING reply — the cache fields AI Engine never reads\n";
$r->record_anthropic_usage([
    'body' => json_encode(['model' => 'claude-sonnet-5', 'usage' => [
        'input_tokens' => 1200, 'output_tokens' => 800,
        'cache_read_input_tokens' => 68000, 'cache_creation_input_tokens' => 0,
    ]]),
], [], $URL);
$x = row();
ok($x && $x['reqs'] === 1,            'request counted');
ok($x && $x['input'] === 1200,        'input_tokens recorded (1200)');
ok($x && $x['output'] === 800,        'output_tokens recorded (800)');
ok($x && $x['cache_read'] === 68000,  'cache_read_input_tokens recorded (68000) ← the invisible number');
ok($x && $x['unobserved'] === 0,      'not marked unobserved');

echo "\n2. BUFFERED SSE stream — message_start (input+cache) + message_delta (output)\n";
$sse = "event: message_start\n"
     . 'data: ' . json_encode(['type' => 'message_start', 'message' => ['model' => 'claude-sonnet-5',
        'usage' => ['input_tokens' => 300, 'cache_read_input_tokens' => 68000, 'cache_creation_input_tokens' => 1500]]]) . "\n\n"
     . "event: message_delta\n"
     . 'data: ' . json_encode(['type' => 'message_delta', 'usage' => ['output_tokens' => 450]]) . "\n\n";
$r->record_anthropic_usage(['body' => $sse], [], $URL);
$x = row();
ok($x['reqs'] === 2,               'second request counted');
ok($x['input'] === 1500,           'SSE input added (1200+300)');
ok($x['output'] === 1250,          'SSE output added from message_delta (800+450)');
ok($x['cache_read'] === 136000,    'SSE cache_read added (68000+68000)');
ok($x['cache_write'] === 1500,     'SSE cache_creation recorded (1500)');
ok($x['unobserved'] === 0,         'SSE not marked unobserved');

echo "\n3. UNOBSERVED — a streamed request whose body never reached us\n";
echo "   (recording 0 here would silently under-report, which is the bug this feature exists to fix)\n";
$r->record_anthropic_usage(['body' => ''], ['body' => json_encode(['model' => 'claude-sonnet-5'])], $URL);
$x = row();
ok($x['reqs'] === 3,            'request still counted');
ok($x['unobserved'] === 1,      'counted as UNOBSERVED, not as zero tokens');
ok($x['input'] === 1500,        'token totals untouched by the unobserved request');

echo "\n4. NON-ANTHROPIC traffic is ignored (this filter sees EVERY http response)\n";
$before = json_encode($GLOBALS['__opts']['swml_api_usage_daily']);
$r->record_anthropic_usage(['body' => json_encode(['usage' => ['input_tokens' => 999999]])], [], 'https://api.openai.com/v1/chat/completions');
$r->record_anthropic_usage(['body' => 'x'], [], 'https://sophicly.com/wp-json/');
ok(json_encode($GLOBALS['__opts']['swml_api_usage_daily']) === $before, 'OpenAI + site traffic recorded nothing');

echo "\n5. PRICES — the 10x that makes the cache worth having\n";
$p = SWML_Protocol_Router::token_prices('claude-sonnet-5');
ok($p['input'] == 3.00 && $p['cache_read'] == 0.30, 'sonnet: fresh input $3.00/M vs cache read $0.30/M (10x)');
ok(SWML_Protocol_Router::token_prices('claude-haiku-4-5')['input'] == 1.00, 'haiku priced separately');
ok(SWML_Protocol_Router::token_prices('claude-opus-5')['input'] == 15.00,   'opus priced separately');

// the worked example that motivated the whole thing
$cached   = (136000 * 0.30) / 1000000;
$uncached = (136000 * 3.00) / 1000000;
printf("\n   worked example — 2 turns x 68k protocol prefix: cached $%.2f vs uncached $%.2f (%.0fx)\n",
    $cached, $uncached, $uncached / $cached);

echo "\n";
if ($fail) { fwrite(STDERR, "❌ api-usage-gate: $fail failed, $pass passed\n"); exit(1); }
echo "✅ api-usage-gate passed ($pass assertions) — usage accounting is correct, and an unseen request is reported as unobserved rather than as zero.\n";
