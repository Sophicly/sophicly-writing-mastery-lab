<?php
/**
 * lit-planning-injection-probe.php — v7.20.669. BEHAVIOUR probe for the AQA Literature planning
 * paste-wall fix (build_lit_planning_injection). Calls the real (private) builder for real
 * topics and checks what the model is handed. No chat, no API call, no writes. WordPress only;
 * bin/ is NOT deployed (allow-list), so copy it up first:
 *   ssh … 'cat > /tmp/p.php' < bin/lit-planning-injection-probe.php
 *   cd <site> && wp eval 'require "/tmp/p.php";'   (then rm /tmp/p.php)
 */
if (!defined('ABSPATH')) { exit; }
$r = SWML_Protocol_Router::instance();
$m = new ReflectionMethod($r, 'build_lit_planning_injection');
$m->setAccessible(true);
// [subject, text, topic, expect: 'q+x' question + extract · 'q' question, no extract · 'none' picker]
$cases = [
    ['19th_century', 'christmas_carol', 1, 'q+x'],
    ['shakespeare',  'macbeth',         1, 'q+x'],
    ['modern_text',  'inspector_calls', 1, 'q'],
    ['19th_century', 'jekyll_and_hyde', 1, 'q+x'],   // topics filed as jekyll_hyde — the slug-family walk
    ['19th_century', 'christmas_carol', 2, 'none'],  // Conceptual Notes topic ("N/A")
    ['19th_century', 'christmas_carol', 0, 'none'],  // free "plan a new essay" session
];
$bad = 0;
foreach ($cases as [$subject, $text, $n, $want]) {
    $out = (string) $m->invoke($r, ['board' => 'aqa', 'subject' => $subject, 'task' => 'planning', 'text' => $text, 'topic_number' => $n]);
    $hasQ = strpos($out, 'the essay question (authoritative') !== false;
    $hasX = strpos($out, 'The printed extract') !== false;
    $none = strpos($out, 'NO TOPIC QUESTION IS BOUND') !== false;
    $got  = $none ? 'none' : ($hasQ ? ($hasX ? 'q+x' : 'q') : '?');
    $ok   = ($got === $want);
    if (!$ok) $bad++;
    printf("%s %-16s t%d  want=%-4s got=%-4s len=%d\n", $ok ? 'ok  ' : 'FAIL', $text, $n, $want, $got, strlen($out));
}
echo $bad ? "lit-planning-injection-probe: {$bad} failure(s)\n" : "✅ lit-planning-injection-probe passed\n";
