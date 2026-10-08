<?php
/**
 * plan-notes-strip-gate.php — FIXLIST #806 (Neil, 2026-10-08: first-attempt notes stop crossing into
 * redraft plan boxes, "Stop for everyone"; reverses #571).
 *
 * Runs THE SHIPPED strip_plan_notes_for_redraft() — sliced out of includes/class-rest-api.php, never
 * a copy — and checks its output with an INDEPENDENT DOM parser, so a regex that is wrong in the
 * same way twice cannot pass:
 *   (1) every box inside a plan section is empty;
 *   (2) every other box keeps its exact text, and the box / section counts are unchanged;
 *   (3) seed_from_sibling_stage() calls it when the walk-back crosses the phase boundary.
 * MUTATION PROOF built in: a no-op strip must FAIL (1) on the same docs, or the gate itself is dead.
 *
 *   php bin/plan-notes-strip-gate.php                  the fixture (pre-ship)
 *   wp eval 'require "/tmp/…/bin/plan-notes-strip-gate.php";'   every real Phase-1 doc in the DB
 *     (read-only; copy includes/class-rest-api.php to ../includes/ beside it — the strip is sliced
 *      from THAT file, so the server's own old class is never what is tested)
 */
$SRC = file_get_contents(__DIR__ . '/../includes/class-rest-api.php');
$fail = 0;
$say = function ($ok, $msg) use (&$fail) { if (!$ok) $fail = 1; echo ($ok ? '  ✅ ' : '  ❌ ') . $msg . "\n"; };

if (!preg_match('/\n    public static function strip_plan_notes_for_redraft\(\$html\) \{\n.*?\n    \}\n/s', $SRC, $fm)) {
    echo "❌ plan-notes-strip-gate: strip_plan_notes_for_redraft() not found in class-rest-api.php\n"; exit(1);
}
$fnSrc = preg_replace('/^\s*public static function strip_plan_notes_for_redraft/', 'function __wml806_strip', trim($fm[0]));
if (!function_exists('__wml806_strip')) eval($fnSrc);

// (3) wiring: the strip runs on the boundary-crossing seed.
$say((bool) preg_match('/if \(\$crosses_boundary\) \$seed = self::strip_plan_notes_for_redraft\(\$seed\);/', $SRC),
    'seed_from_sibling_stage strips plan notes when the seed crosses the Phase 1→2 boundary');

/** id => [inPlan(bool), text] for every [data-field-id], plus counts. */
function __wml806_read($html) {
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="UTF-8"><body>' . $html . '</body>');
    libxml_clear_errors();
    $xp = new DOMXPath($doc);
    $f = [];
    foreach ($xp->query('//*[@data-field-id]') as $n) {
        $inPlan = $xp->query('ancestor::*[@data-section-type="plan"]', $n)->length > 0;
        $f[] = [$n->getAttribute('data-field-id'), $inPlan, trim($n->textContent)];
    }
    return ['fields' => $f, 'sections' => $xp->query('//*[@data-section-type]')->length];
}

$check = function ($html, $strip) {
    $a = __wml806_read($html);
    $b = __wml806_read($strip($html));
    $out = ['planFilled' => 0, 'planLeft' => 0, 'otherChanged' => 0, 'shape' => true];
    if (count($a['fields']) !== count($b['fields']) || $a['sections'] !== $b['sections']) $out['shape'] = false;
    foreach ($a['fields'] as $i => $fa) {
        $fb = $b['fields'][$i] ?? null;
        if (!$fb || $fb[0] !== $fa[0]) { $out['shape'] = false; continue; }
        if ($fa[1]) { if ($fa[2] !== '') $out['planFilled']++; if ($fb[2] !== '') $out['planLeft']++; }
        elseif ($fa[2] !== $fb[2]) $out['otherChanged']++;
    }
    return $out;
};
$noop = function ($h) { return $h; };

// ── the docs ───────────────────────────────────────────────────────────────────────────────────────
$docs = [];
if (defined('ABSPATH') && function_exists('get_user_meta') && isset($GLOBALS['wpdb'])) {
    global $wpdb;
    $rows = $wpdb->get_results("SELECT user_id, meta_key, meta_value FROM {$wpdb->usermeta}
        WHERE meta_key LIKE 'swml\\_canvas\\_%' AND meta_key REGEXP '_t[0-9]+(_assessment|_fbdiscuss)?(__a[0-9]+)?$'");
    foreach ($rows as $r) {
        $d = json_decode($r->meta_value, true);
        if (!is_array($d)) $d = json_decode(wp_unslash($r->meta_value), true);
        if (is_array($d) && !empty($d['html']) && strpos($d['html'], 'data-section-type="plan"') !== false) {
            $docs["u{$r->user_id} {$r->meta_key}"] = (string) $d['html'];
        }
    }
    echo "plan-notes-strip-gate — " . count($docs) . " real Phase-1 docs carrying plan sections\n";
} else {
    $fx = __DIR__ . '/plan-notes-strip-fixture.txt';
    if (!is_file($fx)) { echo "❌ fixture missing: $fx\n"; exit(1); }
    $docs['fixture'] = file_get_contents($fx);
    echo "plan-notes-strip-gate — fixture\n";
}

$tot = ['docs' => 0, 'planFilled' => 0, 'planLeft' => 0, 'otherChanged' => 0, 'badShape' => 0, 'noopCaught' => 0, 'withNotes' => 0];
foreach ($docs as $label => $html) {
    $r = $check($html, '__wml806_strip');
    $tot['docs']++;
    $tot['planFilled'] += $r['planFilled']; $tot['planLeft'] += $r['planLeft']; $tot['otherChanged'] += $r['otherChanged'];
    if (!$r['shape']) { $tot['badShape']++; echo "    shape changed: $label\n"; }
    if ($r['planLeft'] || $r['otherChanged']) echo "    $label: planLeft={$r['planLeft']} otherChanged={$r['otherChanged']}\n";
    if ($r['planFilled']) {
        $tot['withNotes']++;
        $n = $check($html, $noop);
        if ($n['planLeft'] > 0) $tot['noopCaught']++;
    }
}
$say($tot['withNotes'] > 0, "{$tot['withNotes']} doc(s) hold first-attempt notes ({$tot['planFilled']} filled plan boxes) — the instrument has something to measure");
$say($tot['planLeft'] === 0, "every plan box empty after the strip ({$tot['planLeft']} left)");
$say($tot['otherChanged'] === 0, "every other box keeps its exact text ({$tot['otherChanged']} changed)");
$say($tot['badShape'] === 0, "box and section counts unchanged ({$tot['badShape']} docs changed shape)");
$say($tot['noopCaught'] === $tot['withNotes'], "mutation: a no-op strip fails on {$tot['noopCaught']}/{$tot['withNotes']} docs with notes");
echo $fail ? "❌ plan-notes-strip-gate FAILED\n" : "✅ plan-notes-strip-gate\n";
if (!defined('ABSPATH')) exit($fail);
