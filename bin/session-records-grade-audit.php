<?php
/**
 * session-records-grade-audit.php — ladder-aware population audit of every STORED grade.
 *
 * The population twin of bin/marking-gate.js. marking-gate checks a chat REPLY's prose;
 * this checks the authoritative grade RECORD (wp_sophicly_session_records) across the whole
 * table: recompute ladder(total%) per row on the CORRECT grader's ladder, compare to the
 * stored grade, report residual mismatches. Exit 1 if any (so it can gate / run in CI).
 *
 * Run on the box (staging/prod), wp under php >= 8.1 (etch needs it; default `wp` is 7.4):
 *   ssh -i ~/.ssh/sophicly_staging runcloud@18.133.5.229 \
 *     "cd <webroot> && /usr/local/lsws/lsphp81/bin/php8.1 \$(command -v wp) eval-file \
 *      wp-content/plugins/sophicly-writing-mastery-lab/bin/session-records-grade-audit.php"
 *
 * ⭐ LADDER-AWARENESS IS LOAD-BEARING (the lesson that built this tool). A scale-blind audit
 * reproduces the exact "two grading systems" bug: ESSAY rows band on the 85-ladder, but
 * QUIZ / MARK-SCHEME / component rows band on the SEPARATE 95-ladder
 * (Sophicly_Grade_Mapper::pct_to_gcse_grade — "a separate canonical, do not merge"). Applying
 * one ladder to both fabricates mismatches. Do NOT collapse them.
 * Literature essays band at 90 once that ships — gated behind $LIT_BAND_ACTIVE below.
 */

if (!defined('ABSPATH')) { fwrite(STDERR, "run via: wp eval-file bin/session-records-grade-audit.php\n"); exit(2); }
global $wpdb;

// ── Ladders (READ, don't invent). Essay-85 = SWML_Protocol_Router canonical / getGradeFromPercentage.
//    Quiz-95 = SWML_Quiz_Engine::percentage_to_grade / Sophicly_Grade_Mapper.
$ESSAY = [9 => 85, 8 => 75, 7 => 65, 6 => 55, 5 => 45, 4 => 35, 3 => 25, 2 => 15];
$QUIZ  = [9 => 95, 8 => 85, 7 => 75, 6 => 65, 5 => 55, 4 => 45, 3 => 35, 2 => 25];

// Literature essay band (Neil ruling 2026-07-15: Lit G9 = 90). ⚠️ Only G9 is evidence-backed;
// the rest of the Lit ladder must come from the finalized literature-paper-specs.json — do NOT
// invent 8–2 here. Keep OFF until getGradeFromPercentage() is subject-aware, or the audit will
// false-flag every Lit essay while the shipped code still bands them at 85.
$LIT_BAND_ACTIVE = false;
$ESSAY_LIT = null; // load from spec when $LIT_BAND_ACTIVE; fail loud rather than guess.

$band = function ($pct, array $ladder) {
    foreach ($ladder as $g => $b) { if ($pct >= $b) return $g; }
    return 1;
};

// Which grader produced this grade? Key off task/mode/draft_type — NOT the mark denominator alone
// (mark-scheme rows are /20 but grade on the quiz ladder; that mis-bucket is exactly the bug).
// RULED (Neil 2026-07-17): mark_scheme (MSA) bands on the QUIZ-95 ladder — canonical, not essay-85.
// This matches the regex below (mark_scheme → quiz family). Do not re-litigate.
$is_quiz_family = function ($task, $mode, $dt, $max) {
    if (preg_match('#quiz|msq|foundational|mark_scheme|component|mcq#i', "$task $mode $dt")) return true;
    return $max <= 10; // safety net: /10 marks are quiz territory, essays are /20+
};
// Literature detection — placeholder until wired to the canonical slug->subject resolver
// (normalize_text_slug / subject derivation). Only consulted when $LIT_BAND_ACTIVE.
$is_lit = function ($subject, $slug) {
    return (bool) preg_match('#literature|shakespeare|poetry|macbeth|romeo|jekyll|gatsby|inspector|birling|never_let_me_go#i', "$subject $slug");
};

$rows = $wpdb->get_results(
    "SELECT id, user_id, subject, text_slug, task, mode, draft_type, total_score, grade, completed_at
       FROM {$wpdb->prefix}sophicly_session_records
      WHERE grade <> '' AND grade IS NOT NULL AND total_score <> ''",
    ARRAY_A
);

$ess = 0; $essOk = 0; $qz = 0; $qzOk = 0; $unp = 0; $mism = [];
foreach ($rows as $r) {
    if (!preg_match('#^([0-9]+(?:\.[0-9]+)?)\s*/\s*([0-9]+)#', trim((string) $r['total_score']), $m)) { $unp++; continue; }
    $max = (float) $m[2];
    if ($max <= 0) { $unp++; continue; }
    $pct = 100.0 * (float) $m[1] / $max;
    $gr  = preg_replace('#[^0-9]#', '', (string) $r['grade']);
    if ($gr === '') { $unp++; continue; }
    $gr = (int) $gr;

    if ($is_quiz_family($r['task'], $r['mode'], $r['draft_type'], $max)) {
        $qz++; $ladder = $QUIZ; $klass = 'QUIZ';
    } else {
        $ess++; $klass = 'ESSAY';
        if ($LIT_BAND_ACTIVE && $is_lit($r['subject'], $r['text_slug'])) {
            if (!is_array($ESSAY_LIT)) { fwrite(STDERR, "LIT band active but ESSAY_LIT not loaded — refusing to guess. Load it from the finalized spec.\n"); exit(3); }
            $ladder = $ESSAY_LIT; $klass = 'ESSAY-LIT';
        } else {
            $ladder = $ESSAY;
        }
    }
    $should = $band($pct, $ladder);
    if ($gr === $should) { if ($klass === 'QUIZ') $qzOk++; else $essOk++; }
    else {
        $mism[] = sprintf(
            "%-9s id=%s uid=%s %s  %s/%s = %.1f%%  => ladder G%d  but stored G%d  task=%s/%s  (%s)",
            $klass, $r['id'], $r['user_id'], $r['text_slug'], $m[1], $m[2], $pct, $should, $gr,
            $r['task'], $r['mode'], $r['completed_at'] ?: '—'
        );
    }
}

printf("ESSAY rows=%d match=%d | QUIZ rows=%d match=%d | unparseable=%d | total=%d\n",
    $ess, $essOk, $qz, $qzOk, $unp, count($rows));

if ($mism) {
    echo "\n--- RESIDUAL MISMATCHES (record grade != its grader's ladder) ---\n" . implode("\n", $mism) . "\n";
    echo "\nEach is: a genuine record defect, a legacy seed fixture (non-canonical slug / round-timestamp),\n";
    echo "or a boundary rounding edge. Classify before acting — do NOT bulk-reband.\n";
    exit(1);
}
echo "\nCLEAN — every grade record matches its own grader's ladder. No record-level grade defect.\n";
exit(0);
