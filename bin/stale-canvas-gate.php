<?php
/**
 * STALE-DOCUMENT GATE (Neil, 2026-09-12: "we've had this issue of the stale documents so many
 * times… can we create a gate for it. It's happened over and over and over again.")
 *
 * THE RECURRING DEFECT, in one sentence: a saved canvas document keeps the SHAPE it was built
 * with, so when the topic behind it changes — a topic number repurposed, a paper installed, a
 * question set rewritten — the student (or the whole class) keeps seeing the old document, and
 * NOTHING says so. It is silent by construction: the page renders, the sections look plausible,
 * and only a human reading the screen can tell.
 *
 * PROOF IT IS WORTH A GATE (prod, 2026-09-12). The Rosabel live-modelling lesson served the
 * generic ESSAY document — ESSAY PLAN · Body Paragraph 1-3 — for a paper whose stored data is
 * `question_format=multi_question` with Q1-Q5 at 4/8/8/20/40. ⚠️ **Every attendee sees the
 * AUTHOR's document in a live-modelling lesson** (`reviewRole=live_modelling`, targetUserId=the
 * author), so one stale document is a broken class, not one broken screen.
 *
 * ⭐ WHY THE ENGINE'S OWN DRIFT CHECK DID NOT SAVE US — this is the part worth keeping.
 * wml-assessment.js DOES detect it and logs `Multi-question drift — Q2: "…" not in doc`. It then
 * refuses to act, logging: `stale-signal on a doc WITH student work — preserving (no regen).
 * responseWords: 0  hasFeedback: true`. The preserve-guard reads TEMPLATE FURNITURE as student
 * work — an untouched document ships empty "Feedback: Introduction (— / 3)" boxes, so
 * `hasFeedback` is true on a document with **zero** student words, and regeneration is blocked
 * for ever. A detector that finds the fault and then declines to fix it is exactly as silent as
 * no detector at all — which is why the check has to live OUTSIDE the renderer, here.
 *
 * WHAT IT ASSERTS, per saved document, and it only judges what it can judge:
 *   FAIL  — the topic says `multi_question` and the document is missing a question the topic
 *           poses (matched on a 40-char snippet of the question's own text, the same probe the
 *           renderer uses). That document cannot be the right one.
 *   FAIL  — the topic says `multi_question` and the document carries the essay shell
 *           ("ESSAY PLAN" / "Body Paragraph") with no "SECTION A"/"Q1" scaffolding at all.
 *   SKIP  — no topic data, a non-paper topic, or a format this gate has no opinion about.
 * Each FAIL prints `wordCount`, because that decides the remedy: 0 words = delete it and let the
 * template rebuild; >0 words = a human must look, never delete.
 *
 * Read-only. Server gate (needs live WP), so it is not in the local pre-ship-check.
 *   wp eval-file bin/stale-canvas-gate.php [--] [fix]     ("fix" only ever touches 0-word docs)
 *   exit 0 = clean, 1 = at least one stale document.
 */
global $wpdb;
$APPLY = in_array('fix', (array) ($args ?? []), true);
$rows = $wpdb->get_results(
    "SELECT user_id, meta_key FROM {$wpdb->usermeta}
      WHERE meta_key LIKE 'swml_canvas_%'
        AND meta_key NOT LIKE '%\_bak%' AND meta_key NOT LIKE '%\_signoff'
        AND meta_key NOT LIKE '%tutorcomment%'
      ORDER BY meta_key, user_id");
$checked = 0; $skipped = 0; $fails = []; $fixed = 0;

foreach ($rows as $r) {
    // swml_canvas_{board}_{text}_t{topic}   — topic may be a plain int or a YYYYMM(v) sitting id
    if (!preg_match('/^swml_canvas_([a-z0-9\-]+)_(.+)_t(\d+)$/', $r->meta_key, $m)) { $skipped++; continue; }
    [, $board, $text, $topicNum] = $m;
    if (!class_exists('SWML_Topic_Questions')) { echo "SWML_Topic_Questions absent — gate cannot run.\n"; exit(0); }
    $topic = SWML_Topic_Questions::get_topic($board, $text, (int) $topicNum);
    if (!is_array($topic) || empty($topic)) { $skipped++; continue; }
    if (($topic['question_format'] ?? '') !== 'multi_question') { $skipped++; continue; }

    $raw = get_user_meta((int) $r->user_id, $r->meta_key, true);
    if (!is_string($raw) || $raw === '') { $skipped++; continue; }
    $doc = json_decode($raw, true);
    if ($doc === null) $doc = json_decode(wp_unslash($raw), true);
    if (!is_array($doc) || !isset($doc['html'])) { $skipped++; continue; }
    $html = (string) $doc['html'];
    $words = (int) ($doc['wordCount'] ?? 0);
    $checked++;

    $meta = $topic['metadata'] ?? [];
    if (is_string($meta)) { $meta = json_decode($meta, true) ?: []; }
    $questions = $meta['questions'] ?? [];

    $why = '';
    foreach ((array) $questions as $q) {
        $qt = trim((string) ($q['text'] ?? ''));
        if (mb_strlen($qt) < 10) continue;
        $snippet = trim(mb_substr($qt, 0, 40));
        if ($snippet !== '' && strpos($html, $snippet) === false) {
            $why = 'the topic poses ' . ($q['id'] ?? 'a question') . ' and the document does not contain it';
            break;
        }
    }
    if ($why === '' && strpos($html, 'ESSAY PLAN') !== false && strpos($html, 'Body Paragraph') !== false
        && strpos($html, 'SECTION A') === false) {
        $why = 'the document is the generic ESSAY shell, but this topic is a multi-question paper';
    }
    if ($why === '') continue;

    $fails[] = sprintf('user %-6d %-52s words=%-5d · %s', $r->user_id, $r->meta_key, $words, $why);
    if ($APPLY && $words === 0) {
        update_user_meta((int) $r->user_id, $r->meta_key . '_stale_bak_' . date('Ymd'), wp_slash($raw));
        delete_user_meta((int) $r->user_id, $r->meta_key);
        $fixed++;
    }
}

printf("STALE-DOCUMENT GATE — %d multi-question document(s) judged, %d skipped\n\n", $checked, $skipped);
if ($fails) {
    echo 'FAIL — ' . count($fails) . " stale document(s). The saved document no longer matches its topic:\n";
    foreach ($fails as $f) echo "  ✗ {$f}\n";
    echo "\nwords=0 → safe to delete (backed up first); the template then rebuilds. words>0 → a human"
       . " must look; NEVER delete a document with writing in it.\n";
    if ($APPLY) echo "\nfix: cleared {$fixed} zero-word document(s), each backed up to <key>_stale_bak_" . date('Ymd') . ".\n";
    else echo "Re-run with `fix` to clear ONLY the zero-word ones.\n";
    exit(1);
}
echo "PASS — every multi-question document matches the topic it belongs to.\n";
exit(0);
