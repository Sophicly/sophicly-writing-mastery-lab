<?php
/**
 * lit-19c-override-gate.php — v7.20.668
 *
 * ANSWERS: "is the AQA 19th-century '/30' override confined to AQA?"
 *
 * WHY IT EXISTS. Every board's 19th-century course resolves to subject '19th_century' (the
 * course map's category overrides the shortcode), and the override in load_modular_protocol()
 * had no board check. Calling the loader for each board on staging (WML 317 A,
 * bin/lit-19c-override-probe.php) showed Edexcel (20+20), Eduqas and OCR (40) 19th-century
 * essays all received "this essay is out of 30" with AQA's element worths, appended LAST so it
 * outranked their own mark schemes. Its own fail-loud anchor check never fired, because the
 * AQA grid wording is present in those boards' modules too.
 *
 * WHAT IT CHECKS (source, no WordPress):
 *   1. the `if (...)` that opens the override block contains `$board === 'aqa'`;
 *   2. the final-summary twin stays AQA-only: is_assessment_state_machine_enabled() keeps
 *      `if ($board !== 'aqa') return false;`.
 * BEHAVIOUR is proven by bin/lit-19c-override-probe.php on staging (it calls the real loader per
 * board; bin/ is not deployed, so copy it to /tmp on the server — see its header).
 *
 * Run: php bin/lit-19c-override-gate.php [path-to-router]   (exit 1 on failure)
 */

$src = $argv[1] ?? dirname(__DIR__) . '/includes/class-protocol-router.php';
if (!is_file($src)) { fwrite(STDERR, "FAIL: cannot find {$src}\n"); exit(1); }
$php = file_get_contents($src);
$fail = 0;

// ── 1. the override block's opening condition ──────────────────────────────────────────
$marker = '19TH-CENTURY NOVEL — MARK-SCHEME OVERRIDE';
$head  = 'v7.20.239: 19th-CENTURY NOVEL mark-scheme override';   // the block's header comment
$at = strpos($php, $marker);
$hd = strpos($php, $head);
if ($at === false || $hd === false || $hd > $at) {
    echo "  FAIL override block not found (text or header comment renamed?) — update this gate.\n";
    $fail++;
} else {
    // The FIRST `if (` after the header opens the block. (The nearest one before the text is the
    // block's own fail-loud anchor check — the first cut of this gate read that one by mistake.)
    $if = strpos($php, 'if (', $hd);
    $cond = substr($php, $if, strpos($php, '{', $if) - $if);
    $cond = preg_replace('/\s+/', ' ', $cond);
    $need = ["\$subject === '19th_century'", "\$board === 'aqa'"];
    foreach ($need as $n) {
        if (strpos($cond, $n) !== false) { echo "  ok   override condition has {$n}\n"; continue; }
        echo "  FAIL override condition lacks {$n}: {$cond}\n";
        $fail++;
    }
}

// ── 2. the final-summary twin (/30 headline) is reachable only through an AQA-only gate ─
$fn = strpos($php, 'function is_assessment_state_machine_enabled(');
$body = $fn === false ? '' : substr($php, $fn, 1200);
if ($body !== '' && preg_match("/if\s*\(\s*\\\$board\s*!==\s*'aqa'\s*\)\s*return false;/", $body)) {
    echo "  ok   state machine (final-summary /30 twin) is AQA-only\n";
} else {
    echo "  FAIL is_assessment_state_machine_enabled() no longer returns false for non-AQA boards —\n"
       . "       assessment_lit_final_summary_mandate() would give other boards a /30 or /34 headline.\n";
    $fail++;
}

if ($fail) { echo "lit-19c-override-gate: {$fail} failure(s)\n"; exit(1); }
echo "✅ lit-19c-override-gate passed (the /30 override and its twin are AQA-only)\n";
