<?php
/**
 * cw-fix-step-slugs.php — make each CW lesson's URL agree with its own title (FIXLIST #453).
 *
 * Neil, 2026-08-26, testing Step 12: "I think the permalink still says step eleven, so that needs
 * to be fixed as well."
 *
 * WHY IT DRIFTED. Two renumbers (v7.20.451 and the +1 at v7.20.568) rewrote lesson TITLES and the
 * bridge mapping, and neither touched `post_name`. Nothing broke, because no code routes on the
 * slug — which is exactly why it went unnoticed for two renumbers. But the URL is student-facing
 * text, and "step-11" under a lesson titled STEP 12 is the same defect class as showing someone a
 * raw ID: the human-readable thing disagrees with the thing itself.
 *
 * WHAT IT CHANGES, and deliberately nothing more: only the `step-<N>` segment of the slug is
 * rewritten, to the number in the title. The rest of the slug is left alone, so URLs churn as
 * little as possible and a slug that was already right is skipped.
 *
 * OLD LINKS KEEP WORKING. wp_update_post() records the previous slug in `_wp_old_slug`, and
 * WordPress 301-redirects requests for it. Bookmarks, anything pasted into a chat, and the
 * LearnDash "resume" URL all survive. The script prints the redirect it is relying on for each
 * row so that claim is visible rather than assumed.
 *
 * Usage:  wp eval-file cw-fix-step-slugs.php          → DRY RUN, prints every change
 *         wp eval-file cw-fix-step-slugs.php apply    → writes
 */

$apply = in_array('apply', $args, true);

global $wpdb;

$rows = $wpdb->get_results(
    "SELECT ID, post_name, post_title, post_type
       FROM {$wpdb->posts}
      WHERE post_type IN ('sfwd-topic','sfwd-lessons')
        AND post_status = 'publish'
        AND post_title REGEXP 'STEP[ ]+[0-9]+'
      ORDER BY ID"
);

echo ($apply ? 'APPLY' : 'DRY RUN') . " — " . count($rows) . " CW step lesson(s) examined\n\n";

$changed = 0; $ok = 0; $odd = 0;

foreach ($rows as $r) {
    if (!preg_match('/STEP\s+(\d+)/i', $r->post_title, $m)) { $odd++; continue; }
    $want = (int) $m[1];

    if (!preg_match('/^(.*?)step-(\d+)(.*)$/', $r->post_name, $s)) {
        $odd++;
        echo sprintf("  ?  %-6d slug has no step-N segment: %-38s  %s\n", $r->ID, $r->post_name, substr($r->post_title, 0, 40));
        continue;
    }
    $have = (int) $s[2];
    if ($have === $want) { $ok++; continue; }

    $new = $s[1] . 'step-' . $want . $s[3];

    // A collision would silently become "step-12-2" — refuse instead, and say which post holds it.
    $clash = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND ID <> %d AND post_status <> 'trash' LIMIT 1",
        $new, $r->ID
    ));
    if ($clash) {
        echo sprintf("  ⛔ %-6d %-38s → %-38s COLLIDES with post %d — SKIPPED\n", $r->ID, $r->post_name, $new, $clash);
        $odd++;
        continue;
    }

    echo sprintf("  →  %-6d %-38s → %-38s  (%s)\n", $r->ID, $r->post_name, $new, substr($r->post_title, 0, 34));
    $changed++;

    if ($apply) {
        $res = wp_update_post(['ID' => $r->ID, 'post_name' => $new], true);
        if (is_wp_error($res)) { echo "     ⛔ " . $res->get_error_message() . "\n"; continue; }
        $fresh = get_post($r->ID);
        $olds  = get_post_meta($r->ID, '_wp_old_slug');
        echo sprintf("     saved as %s · old slug kept for redirect: %s\n",
            $fresh->post_name,
            $olds ? implode(', ', $olds) : 'NONE — old links to this lesson will 404');
    }
}

echo "\nalready correct: {$ok}   " . ($apply ? 'renamed' : 'would rename') . ": {$changed}   needing a human: {$odd}\n";
if (!$apply) echo "\nDRY RUN — re-run with `apply` to write.\n";
