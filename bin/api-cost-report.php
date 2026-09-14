<?php
/**
 * API COST REPORT (v7.20.622) — read `swml_api_usage_daily` and show the cache hit ratio.
 *
 * Run on a server (prod or staging):
 *   cd <webapp> && /usr/local/lsws/lsphp83/bin/php $(which wp) eval 'require "<path>/bin/api-cost-report.php";'
 *   (staging has no `lsphp83` on PATH and plain `wp` runs PHP 7.4, which Etch fatals on —
 *    the binaries live under /usr/local/lsws/lsphp83/bin/php. `wp eval-file` silently runs
 *    nothing here, so use `wp eval` + require.)
 *
 * THE NUMBER THAT MATTERS is the cache hit ratio: cache_read / (cache_read + input + cache_write).
 * We send a ~68k-token protocol prefix on every turn. Read from cache it costs $0.30/M; sent
 * fresh it costs $3.00/M. That 10x is the whole argument.
 *
 * ⭐ READ `unobs` FIRST. It counts requests whose usage never reached us (AI Engine streaming
 * past `http_response`). If it is a large share, every other number here is a FLOOR, not a total.
 */
if (!class_exists('SWML_Protocol_Router')) { echo "SWML_Protocol_Router not loaded — run inside WP.\n"; return; }

$store = get_option('swml_api_usage_daily', []);
if (!is_array($store) || !$store) {
    echo "No usage recorded yet (option `swml_api_usage_daily` is empty).\n";
    echo "It fills from the first Anthropic call AFTER v7.20.622 is deployed — it cannot backfill.\n";
    return;
}
ksort($store);

$fmt = function ($n) { return number_format((float) $n); };
printf("%-12s %-22s %7s %10s %10s %11s %11s %6s  %9s  %s\n",
    'DAY', 'MODEL', 'REQS', 'INPUT', 'OUTPUT', 'CACHE_READ', 'CACHE_WR', 'UNOBS', 'EST $', 'CACHE HIT');
echo str_repeat('-', 122), "\n";

$grand = 0.0; $gr = ['input' => 0, 'output' => 0, 'cache_read' => 0, 'cache_write' => 0, 'reqs' => 0, 'unobserved' => 0];

foreach ($store as $day => $models) {
    if (!is_array($models)) continue;
    foreach ($models as $model => $r) {
        if (!is_array($r)) continue;
        $p = SWML_Protocol_Router::token_prices($model);
        $cost = ($r['input'] * $p['input'] + $r['output'] * $p['output']
               + $r['cache_read'] * $p['cache_read'] + $r['cache_write'] * $p['cache_write']) / 1000000;
        $grand += $cost;
        foreach ($gr as $k => $_) $gr[$k] += ($r[$k] ?? 0);

        $billedIn = $r['cache_read'] + $r['input'] + $r['cache_write'];
        $hit = $billedIn > 0 ? sprintf('%5.1f%%', 100 * $r['cache_read'] / $billedIn) : '    —';
        printf("%-12s %-22s %7s %10s %10s %11s %11s %6s  %9s  %s%s\n",
            $day, substr($model, 0, 22), $fmt($r['reqs']), $fmt($r['input']), $fmt($r['output']),
            $fmt($r['cache_read']), $fmt($r['cache_write']), $fmt($r['unobserved']),
            '$' . number_format($cost, 2), $hit,
            $r['unobserved'] > 0 ? '  ⚠ floor only' : '');
    }
}

echo str_repeat('-', 122), "\n";
$billedIn = $gr['cache_read'] + $gr['input'] + $gr['cache_write'];
printf("TOTAL  reqs=%s  input=%s  output=%s  cache_read=%s  cache_write=%s  est=$%s\n",
    $fmt($gr['reqs']), $fmt($gr['input']), $fmt($gr['output']), $fmt($gr['cache_read']), $fmt($gr['cache_write']),
    number_format($grand, 2));

if ($billedIn > 0) {
    $ratio = 100 * $gr['cache_read'] / $billedIn;
    printf("CACHE HIT RATIO: %.1f%% of billed input tokens were served from cache.\n", $ratio);
    if ($ratio < 50) {
        echo "⛔ LOW. The protocol prefix is mostly being re-sent at full price. Check:\n";
        echo "   1. is_wml_outbound true on these requests? (the history half of the optimisation is gated on it)\n";
        echo "   2. does anything BEFORE the cached block change per turn? a moving prefix voids the cache\n";
        echo "   3. gaps > 1h between turns expire the cache legitimately — compare against the session timeline\n";
    } else {
        echo "✅ The cached prefix is doing its job; remaining spend is genuine new tokens.\n";
    }
}
if ($gr['unobserved'] > 0) {
    printf("\n⚠️  %s of %s request(s) were UNOBSERVED (streamed past http_response).\n", $fmt($gr['unobserved']), $fmt($gr['reqs']));
    echo "   Every figure above is a FLOOR. If this share is large, parse the SSE stream instead.\n";
}
echo "\nEstimates use list prices (SWML_Protocol_Router::token_prices). The Anthropic console is the authority.\n";
