<?php
/**
 * FIXLIST #474 — BRIDGE ROLE AGREEMENT GATE (2026-09-08)
 *
 * WHY THIS EXISTS. A shared `sfwd-topic` renders in many courses, but its WML task is decided
 * per course by `sophicly_ld_bridge_<course_id>`. An explicit `wml_task` there is AUTHORITATIVE
 * (sophicly-writing-mastery-lab.php:855) — it beats BOTH the v7.20.234 shared-lesson heal and
 * the baked shortcode att. So one stale row silently re-roles a lesson in one course, with no
 * error anywhere and nothing on screen to say so.
 *
 * MEASURED, NOT HYPOTHETICAL. On 2026-09-08 six courses were crossed on prod:
 *   post 54953 "5. Get Your Assessment & Feedback"        -> feedback_discussion (43073, 55070)
 *   post 42455 "6. Discuss Your Feedback with Your Tutor" -> redraft_assessment  (42143, 42517, 42623, 54836)
 * The first meant the student could not submit their redraft for marking; the second gave a
 * double assessment. The 42455 case is the SAME defect the code comment at :892 already records
 * as "Neil's Macbeth double-assessment, 2026-07-20" — it survived fourteen months because
 * nothing ever asserted the agreement.
 *
 * ⚠️ WHY IT ASSERTS AGAINST THE TITLE AND NOT `derive_wml_task_from_topic()`. The first cut of
 * this gate compared the bridge row to that derivation and produced SEVEN failures that were all
 * false: on a title carrying both words — "Diagnostic Assessment: Discuss Your Mark & Feedback"
 * — the derivation matches "assessment" and misses "discuss", and it is blind to phase, so
 * "…PHASE 2…" derives `assessment` where the bridge correctly says `redraft_assessment`. In all
 * seven the BRIDGE was right. A gate whose failures are mostly false gets switched off, so it
 * asserts the thing that actually caught the bug: the lesson's own title, disambiguated by phase.
 *
 * THE CONTRACT — only role lessons are judged; everything else is skipped, not guessed at:
 *   "mark scheme" in title            -> SKIP (a mark-scheme lesson that merely says "assessment")
 *   task starts `cw_`                 -> SKIP (CW steps carry their own numbering)
 *   "discuss" in title                -> feedback_discussion
 *   "write your" in title             -> diagnostic ("Write Your Diagnostic Assessment"; the
 *                                        looser "write" also matched "STEP 1: Writer Profile")
 *   "assessment"/"assess" in title    -> assessment (phase initial) | redraft_assessment (phase redraft)
 *                                        phase unknown -> either is accepted
 * Read-only. Server gate (needs live WP + LD), so it is not in the local pre-ship-check.
 *
 *   wp eval-file bin/bridge-task-agreement-gate.php
 *   exit 0 = pass, 1 = at least one crossed role.
 *   ⚠️ Piping to `tail` makes `$?` the exit of `tail` — read the PASS/FAIL line, not `$?`.
 */
global $wpdb;
$rows = $wpdb->get_col("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE 'sophicly_ld_bridge_%'");
$fails = [];
$judged = 0;
$skipped = 0;

/** Expected role(s) for a lesson, from its own title + the bridge's phase. [] = not a role lesson. */
$expected_roles = static function (string $title, string $phase): array {
    $t = mb_strtolower(html_entity_decode($title));
    if (strpos($t, 'mark scheme') !== false) return [];
    if (strpos($t, 'discuss') !== false)     return ['feedback_discussion'];
    if (strpos($t, 'write your') !== false)  return ['diagnostic'];   // "Write Your Diagnostic Assessment"
                                                                        // — NOT "STEP 1: Writer Profile"

    if (strpos($t, 'assess') === false)      return [];
    if ($phase === 'redraft') return ['redraft_assessment'];
    if ($phase === 'initial') return ['assessment'];
    return ['assessment', 'redraft_assessment'];   // phase unknown — accept either
};

foreach ($rows as $opt) {
    $cid = (int) str_replace('sophicly_ld_bridge_', '', $opt);
    if (!$cid) continue;
    $bridge = get_option($opt, []);
    if (!is_array($bridge)) continue;
    foreach ($bridge as $pid => $entry) {
        if (!is_array($entry)) continue;             // entries stay ARRAYS — never cast
        if (!ctype_digit((string) $pid)) continue;   // the option carries non-post keys too
        $task = (string) ($entry['wml_task'] ?? '');
        if ($task === '') continue;                  // no explicit row = derivation governs, fine
        if (strpos($task, 'cw_') === 0) { $skipped++; continue; }  // CW steps carry their own
                                                     // numbering; their titles ("STEP 1: Writer
                                                     // Profile") are not role names.
        $title = (string) get_the_title((int) $pid);
        $want  = $expected_roles($title, (string) ($entry['wml_phase'] ?? ''));
        if (!$want) { $skipped++; continue; }
        $judged++;
        if (in_array($task, $want, true)) continue;
        $fails[] = sprintf('course %d (%s) · post %d "%s" · phase=%s · bridge=%s · title says %s',
            $cid, mb_substr(html_entity_decode(get_the_title($cid)), 0, 38),
            (int) $pid, mb_substr(html_entity_decode($title), 0, 46),
            (string) ($entry['wml_phase'] ?? '?'), $task, implode('|', $want));
    }
}
printf("BRIDGE ROLE AGREEMENT GATE — %d role lessons judged, %d non-role entries skipped, across %d courses\n\n",
    $judged, $skipped, count($rows));
if ($fails) {
    echo 'FAIL — CROSSED ROLE (' . count($fails) . "). The lesson does a different job than its own title promises:\n";
    foreach ($fails as $f) echo "  ✗ {$f}\n";
    echo "\nFix the bridge row, or clear its wml_task so the shared-lesson heal governs. See FIXLIST #474.\n";
    exit(1);
}
echo "PASS — every role lesson's bridge task matches its own title.\n";
exit(0);
