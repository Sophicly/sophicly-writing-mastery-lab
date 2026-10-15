<?php
/**
 * planning-model-harness.php — v7.20.904 (Neil, Actions round ah: "Yes: fix the wording, check on Shakespeare, then move
 * planning to Haiku"). Runs the REAL SWML_Protocol_Router::planning_model_route (sliced between its sentinels) and checks
 * the wiring + the "never 'your'" rule in the universal voice block. Run: php bin/planning-model-harness.php
 */
$root = dirname(__DIR__); $src = file_get_contents($root . '/includes/class-protocol-router.php');
$n = 0; $fail = 0;
$ok = function ($c, $m) use (&$n, &$fail) { $n++; if (!$c) $fail = 1; echo ($c ? "  ✅ " : "  ❌ ") . $m . "\n"; };
$a = strpos($src, '// @PLANNING-MODEL-PURE-BEGIN'); $b = strpos($src, '// @PLANNING-MODEL-PURE-END');
$ok($a !== false && $b > $a, 'the route function sits between its sentinels');
function load_route($src, $a, $b, $cls) { eval('class ' . $cls . ' { ' . substr($src, $a, $b - $a) . ' }'); return [$cls, 'planning_model_route']; }
function cases($f) {
    $out = [];
    $out['off: no option → nothing moves'] = call_user_func($f, 'planning', '', 5) === null;
    $out['on (string): planning → Haiku, effort high'] = call_user_func($f, 'planning', 'claude-haiku-5-5', 5) === ['model' => 'claude-haiku-5-5', 'effort' => 'high'];
    $out['MARKING never moves (assessment)'] = call_user_func($f, 'assessment', 'claude-haiku-5-5', 5) === null;
    $out['diagnostic never moves'] = call_user_func($f, 'diagnostic', 'claude-haiku-5-5', 5) === null;
    $out['redraft_assessment never moves'] = call_user_func($f, 'redraft_assessment', 'claude-haiku-5-5', 5) === null;
    $out['staged: listed user moves'] = call_user_func($f, 'planning', ['model' => 'claude-haiku-5-5', 'users' => [1938]], 1938) !== null;
    $out['staged: everyone else stays'] = call_user_func($f, 'planning', ['model' => 'claude-haiku-5-5', 'users' => [1938]], 1298) === null;
    $out['a non-Claude model id is refused'] = call_user_func($f, 'planning', 'gpt-5', 5) === null;
    $out['a bad effort falls back to high'] = (call_user_func($f, 'planning', ['model' => 'claude-haiku-5-5', 'effort' => 'turbo'], 5)['effort'] ?? '') === 'high';
    return $out;
}
echo "A · the real route function\n";
foreach (cases(load_route($src, $a, $b, 'PMH_Real')) as $label => $pass) $ok($pass, $label);
echo "B · wiring + wording\n";
$ok(preg_match("/add_filter\\('http_request_args', \\[\\\$this, 'route_planning_model'\\], 20, 2\\);/", $src) === 1, 'route_planning_model runs on every outbound request, after the cache filter (priority 20)');
$ok(preg_match("/self::planning_model_route\\(\\\$swml_request_context\\['task'\\] \\?\\? '', get_option\\('swml_planning_model', ''\\), get_current_user_id\\(\\)\\)/", $src) === 1, 'the filter asks the one route function with the request task, the option and the user');
$ok(strpos($src, "unset(\$payload['temperature'], \$payload['top_p'], \$payload['top_k']);") !== false, 'sampling parameters are stripped on a routed request (Haiku 5.5 rejects them)');
$ok(strpos($src, 'NAME THE PEOPLE IN THE TEXT — NEVER \\"YOUR\\"') !== false && strpos($src, 'NEVER write \\"your mum\\"') !== false, 'the universal voice rules forbid "your mum" about people in the text');
echo "C · falsify — each mutation must fail A\n";
$MUT = [
    'marking allowed to move' => ["if ((string) \$task !== 'planning') return null;", "if (!in_array((string) \$task, ['planning', 'assessment'], true)) return null;"],
    'user list ignored' => ["&& !in_array((int) \$uid, array_map('intval', \$opt['users']), true)) return null;", ") {}"],
    'option ignored (always on)' => ["if (\$model === '' || strpos(\$model, 'claude-') !== 0) return null;", "if (\$model === '') \$model = 'claude-haiku-5-5';"],
];
$i = 0;
foreach ($MUT as $label => [$from, $to]) {
    $m = str_replace($from, $to, $src);
    if ($m === $src) { $ok(false, 'mutation did not apply: ' . $label); continue; }
    $ma = strpos($m, '// @PLANNING-MODEL-PURE-BEGIN'); $mb = strpos($m, '// @PLANNING-MODEL-PURE-END');
    $res = cases(load_route($m, $ma, $mb, 'PMH_Mut' . (++$i)));
    $ok(in_array(false, $res, true), 'mutation caught: ' . $label);
}
echo "\n" . ($fail ? '❌ FAIL' : '✅ PASS') . " — $n checks\n"; exit($fail);
