<?php
/**
 * lit-19c-override-probe.php — v7.20.668. BEHAVIOUR twin of bin/lit-19c-override-gate.php.
 *
 * Calls the real (private) load_modular_protocol() for a 19th-century assessment on each
 * board and reports whether the AQA "/30" override was appended. No chat, no API call, no
 * writes. Must run inside WordPress. bin/ is NOT deployed (allow-list), so copy it up first:
 *   ssh … 'cat > /tmp/p.php' < bin/lit-19c-override-probe.php
 *   cd <site> && wp eval 'require "/tmp/p.php";'   (then rm /tmp/p.php)
 * Expected: override=YES for aqa only; "no" for edexcel, eduqas and ocr.
 */
if (!defined('ABSPATH')) { exit; }
$r  = SWML_Protocol_Router::instance();
$lm = new ReflectionMethod($r, 'load_modular_protocol');
$lm->setAccessible(true);
$bad = 0;
foreach ([['aqa', 'christmas_carol'], ['edexcel', 'christmas_carol'], ['eduqas', 'christmas_carol'], ['ocr', 'jekyll_and_hyde']] as [$board, $text]) {
    foreach (['assessment', 'redraft_assessment'] as $task) {
        $out = (string) $lm->invoke($r, ['board' => $board, 'subject' => '19th_century', 'task' => $task, 'text' => $text, 'step' => 1], 0);
        $has = strpos($out, '19TH-CENTURY NOVEL — MARK-SCHEME OVERRIDE') !== false;
        $ok  = ($board === 'aqa') === $has;
        if (!$ok) $bad++;
        printf("%s %-8s %-16s %-19s override=%s\n", $ok ? 'ok  ' : 'FAIL', $board, $text, $task, $has ? 'YES' : 'no');
    }
}
echo $bad ? "lit-19c-override-probe: {$bad} failure(s)\n" : "✅ lit-19c-override-probe passed\n";
