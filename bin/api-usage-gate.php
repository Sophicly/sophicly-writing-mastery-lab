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
if (!function_exists('wp_json_encode')) { function wp_json_encode($v) { return json_encode($v); } }

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
$code = "class SWML_Protocol_Router {\n    public \$is_wml_outbound = true;\n"
      . slice_method($src, 'record_anthropic_usage') . "\n"
      . slice_method($src, 'extend_anthropic_cache_ttl') . "\n"
      . slice_method($src, 'register_claude_sonnet_5_5') . "\n"
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
// v7.20.651: Sonnet 5 / 5.5 list at $2 in, $0.20 cache read, $4 1h cache write (was asserted at the
// Sonnet 4 rate of $3 / $0.30, which overstated every recorded estimate by 1.5x).
ok($p['input'] == 2.00 && $p['cache_read'] == 0.20 && $p['cache_write'] == 4.00, 'sonnet 5: fresh input $2.00/M vs cache read $0.20/M (10x), 1h write $4.00/M');
ok(SWML_Protocol_Router::token_prices('claude-sonnet-5-5')['output'] == 10.00, 'sonnet 5.5 priced as sonnet 5 ($10/M output)');
ok(SWML_Protocol_Router::token_prices('claude-haiku-4-5')['input'] == 1.00, 'haiku priced separately');
ok(SWML_Protocol_Router::token_prices('claude-opus-5')['input'] == 15.00,   'opus priced separately');

// the worked example that motivated the whole thing
$cached   = (136000 * 0.20) / 1000000;
$uncached = (136000 * 2.00) / 1000000;
printf("\n   worked example — 2 turns x 68k protocol prefix: cached $%.2f vs uncached $%.2f (%.0fx)\n",
    $cached, $uncached, $uncached / $cached);

echo "\n6. REQUEST SHAPE (v7.20.659) — a STABLE history prefix: instructions + the message BEFORE this turn\n";
// v7.20.651 removed the rolling breakpoint on the LAST message: it could never be read back (the per-turn
// context is prepended to that message and absent from it next turn; non-marking chats also slid their
// window) — a 2x cache WRITE of the history every turn, 74% of prod spend 22-28 Sep. v7.20.659 (#645b)
// puts the breakpoint on the message BEFORE this turn, which the next turn re-sends byte-identical.
$req = ['model' => 'claude-sonnet-5', 'system' => [
    ['type' => 'text', 'text' => 'PROTOCOL', 'cache_control' => ['type' => 'ephemeral']],
    ['type' => 'text', 'text' => 'WML LIVE SESSION DIRECTIVES: this turn']],
    'messages' => [['role' => 'user', 'content' => 'hi'], ['role' => 'assistant', 'content' => 'hello'], ['role' => 'user', 'content' => 'mark it']]];
$o = $r->extend_anthropic_cache_ttl(['body' => json_encode($req)], $URL);
$j = json_decode($o['body'], true);
ok(substr_count($o['body'], '"cache_control"') === 2, 'exactly two cache points: the instructions and the message before this turn');
ok(($j['system'][0]['cache_control']['ttl'] ?? '') === '1h' && count($j['system']) === 1, 'instructions block keeps its 1h breakpoint; live context left the system array');
$lastm = end($j['messages']);
ok(is_array($lastm['content']) && strpos($lastm['content'][0]['text'] ?? '', 'LIVE SESSION DIRECTIVES') !== false, 'live context rides the current user turn');
ok(strpos(json_encode($lastm), 'cache_control') === false, 'the CURRENT turn carries no cache point (it changes next turn)');
$prevm = $j['messages'][count($j['messages']) - 2];
ok(($prevm['content'][count($prevm['content']) - 1]['cache_control']['ttl'] ?? '') === '1h', 'the message before this turn is the 1h cache point');
ok(strpos(json_encode($prevm), 'LIVE SESSION DIRECTIVES') === false, '…and it never holds the per-turn context (so it repeats byte-identical)');
// NEXT TURN: the browser re-sends the history as stored (no per-turn context) + the reply + a new message.
$req2 = $req; $req2['messages'] = [['role' => 'user', 'content' => 'hi'], ['role' => 'assistant', 'content' => 'hello'], ['role' => 'user', 'content' => 'mark it'], ['role' => 'assistant', 'content' => 'Q1: 4/4'], ['role' => 'user', 'content' => 'next']];
$j2 = json_decode($r->extend_anthropic_cache_ttl(['body' => json_encode($req2)], $URL)['body'], true);
$strip = function ($m) { $c = $m['content']; if (is_string($c)) return $c; return implode('', array_map(function ($b) { return (string) ($b['text'] ?? ''); }, $c)); };
$same = true; for ($i = 0; $i < 2; $i++) { if ($strip($j['messages'][$i]) !== $strip($j2['messages'][$i]) || $j['messages'][$i]['role'] !== $j2['messages'][$i]['role']) $same = false; }
ok($same, 'next turn: every message up to the old cache point is byte-identical in text (the prefix can be read back)');
$j1 = json_decode($r->extend_anthropic_cache_ttl(['body' => json_encode(['model' => 'claude-sonnet-5', 'system' => [['type' => 'text', 'text' => 'PROTOCOL', 'cache_control' => ['type' => 'ephemeral']]], 'messages' => [['role' => 'user', 'content' => 'first']]])], $URL)['body'], true);
ok(substr_count(json_encode($j1), 'cache_control') === 1, 'a first turn (no earlier message) keeps only the instructions cache point');

echo "\n7. SONNET 5.5 REGISTRATION (v7.20.651) — AI Engine 3.8.2 throws on an unlisted model\n";
$cat = [['model' => 'claude-sonnet-5', 'name' => 'Claude Sonnet 5', 'tags' => ['core', 'no-temperature']]];
$cat2 = $r->register_claude_sonnet_5_5($cat);
ok(count($cat2) === 2 && $cat2[1]['model'] === 'claude-sonnet-5-5' && in_array('no-temperature', $cat2[1]['tags'], true), 'claude-sonnet-5-5 added, cloned from claude-sonnet-5, no-temperature kept');
ok(count($r->register_claude_sonnet_5_5($cat2)) === 2, 'never added twice (a later AI Engine entry wins)');
ok($r->register_claude_sonnet_5_5([['model' => 'claude-haiku-4-5']]) === [['model' => 'claude-haiku-4-5']], 'no sonnet-5 base → catalogue untouched');

echo "\n8. STUDENT PROFILE STAYS OUT OF THE CACHED PREAMBLE (v7.20.660) — it changes mid-marking\n";
// Measured staging 2026-09-29: "Assessments completed: 1 → 2" inside the cached instructions = a full
// ~107k-token re-write each time a phase record landed during marking.
$bp = substr($src, strpos($src, 'public function build_preamble('));
$bp = substr($bp, 0, strpos($bp, "\n    public function ", 10) ?: strlen($bp));
$leak = [];
foreach (preg_split('/\n/', $bp) as $ln) {
    if (strpos($ln, '$preamble') !== false && preg_match('/Assessments completed|has completed \{?\$profile|Recent scores|STUDENT LEARNING PROFILE|STUDENT HISTORY|Recurring targets|Recurring strengths/', $ln)) $leak[] = trim($ln);
}
ok(!$leak, 'no profile line is written to $preamble' . ($leak ? ' — LEAK: ' . substr($leak[0], 0, 90) : ''));
ok(preg_match('/\$dynamic_parts\[\]\s*=\s*\$this->dynamic_profile;/', $src) === 1, 'dynamic_profile is pushed into the per-turn LIVE SESSION DIRECTIVES');
ok(strpos($bp, "\$this->dynamic_profile = '';") !== false, 'build_preamble resets dynamic_profile (one request = one profile block)');
ok(substr_count($bp, '$this->dynamic_profile .=') === 2, 'both profile blocks (assessment history + universal profile) feed dynamic_profile');

echo "\n";
if ($fail) { fwrite(STDERR, "❌ api-usage-gate: $fail failed, $pass passed\n"); exit(1); }
echo "✅ api-usage-gate passed ($pass assertions) — usage accounting is correct, and an unseen request is reported as unobserved rather than as zero.\n";
