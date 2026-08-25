<?php
/**
 * cw-ld-insert-step13.php — the LEARNDASH half of the v7.20.568 CW renumber (FIXLIST #440).
 *
 * Run ON THE BOX (never --skip-plugins: that skips LearnDash too — the .451 lesson):
 *   /usr/local/lsws/lsphp82/bin/php $(which wp) --skip-themes eval-file bin/cw-ld-insert-step13.php          (DRY RUN)
 *   /usr/local/lsws/lsphp82/bin/php $(which wp) --skip-themes eval-file bin/cw-ld-insert-step13.php apply    (writes)
 *
 * WHAT IT DOES, in order (all anchored on TITLES and the course tree, never on post IDs — prod and
 * staging carry different IDs for the same lessons):
 *   1. finds course 41165's topic titled "STEP 12: Update Your Plot - Goals" and the unit it sits in;
 *   2. creates the new topic "N. STEP 13: Scene Selection - Draft 2" (N = its slot in that unit) as a
 *      published sfwd-topic with course_id / lesson_id meta, and inserts it into the course steps
 *      tree right after Step 12 via LDLMS_Factory_Post::course_steps()->set_steps_keeping_sections()
 *      (the _keeping_sections variant — course_sections anchors on an ABSOLUTE slot index);
 *   3. renumbers the TITLES of "STEP 13" … "STEP 30" → +1, DESCENDING, and bumps the in-unit prefix
 *      of the two lessons that shift within the Draft-2 unit (old "3. STEP 13" → "4. STEP 14",
 *      "4. TRIAL 2" → "5. TRIAL 2"). ⛔ Slugs are NEVER touched (student links depend on them);
 *   4. migrates the bridge option `sophicly_ld_bridge_41165`: every `cw_step_N` (N ≥ 13) → N+1,
 *      descending, then adds the new topic → cw_step_13. Entries stay PHP ARRAYS (the .451 outage:
 *      a stdClass cast fatals every CW lesson). Backed up to a `_prerenumber2_backup` option + /tmp;
 *   5. prints the course sections before/after and REFUSES to apply if their count would change.
 *
 * Idempotent: a course that already carries "STEP 13: Scene Selection" is reported and left alone.
 */

if (!defined('ABSPATH')) { exit(1); }

global $wpdb;
$APPLY     = in_array('apply', (array) ($args ?? []), true);
$COURSE_ID = 41165;
$NEW_TITLE_CORE = 'STEP 13: Scene Selection - Draft 2';

printf("CW LD INSERT STEP 13 — %s (course %d)\n\n", $APPLY ? '*** APPLY ***' : 'dry run (pass "apply" to write)', $COURSE_ID);

if (!class_exists('LDLMS_Factory_Post')) { echo "⛔ LDLMS_Factory_Post missing — did you run with --skip-plugins? LearnDash must be loaded.\n"; exit(1); }

$topics = $wpdb->get_results($wpdb->prepare(
    "SELECT p.ID, p.post_title, p.post_name FROM {$wpdb->posts} p
       JOIN {$wpdb->postmeta} m ON m.post_id = p.ID AND m.meta_key = 'course_id' AND m.meta_value = %s
      WHERE p.post_type = 'sfwd-topic' AND p.post_status = 'publish'",
    (string) $COURSE_ID
));
$byTitle = [];
foreach ($topics as $t) { $byTitle[$t->ID] = $t->post_title; }

// ── 0. idempotence ────────────────────────────────────────────────────────────────────────────
foreach ($topics as $t) {
    if (strpos($t->post_title, 'STEP 13: Scene Selection') !== false) {
        printf("✅ already inserted: #%d \"%s\" — nothing to do.\n", $t->ID, $t->post_title);
        exit(0);
    }
}

// ── 1. anchors ────────────────────────────────────────────────────────────────────────────────
$step12 = null;
foreach ($topics as $t) { if (strpos($t->post_title, 'STEP 12: Update Your Plot') !== false) { $step12 = $t; break; } }
if (!$step12) { echo "⛔ no 'STEP 12: Update Your Plot' topic in course $COURSE_ID — wrong env, or the .451 renumber never landed here.\n"; exit(1); }
$unitId = (int) get_post_meta($step12->ID, 'lesson_id', true);
if (!$unitId) { echo "⛔ Step 12 topic #{$step12->ID} has no lesson_id meta.\n"; exit(1); }
printf("anchor: #%d \"%s\" in unit #%d \"%s\"\n", $step12->ID, $step12->post_title, $unitId, get_the_title($unitId));

$stepsObj = LDLMS_Factory_Post::course_steps($COURSE_ID);
$h = $stepsObj->get_steps('h');
$unitTopics = $h['sfwd-lessons'][$unitId]['sfwd-topic'] ?? null;
if (!is_array($unitTopics) || !array_key_exists((int) $step12->ID, $unitTopics)) { echo "⛔ the course tree does not list Step 12 under unit $unitId.\n"; exit(1); }
$order = array_keys($unitTopics);
$slot = array_search((int) $step12->ID, array_map('intval', $order), true) + 1;   // Step 12's 1-based position in the unit (wpdb IDs are strings; the tree's keys are ints)
printf("unit order now: %s\n", implode(' · ', array_map(fn($id) => "#$id \"{$byTitle[$id]}\"", $order)));

$sectionsBefore = function_exists('learndash_30_get_course_sections') ? learndash_30_get_course_sections($COURSE_ID) : [];
printf("course sections before: %d\n", count($sectionsBefore));

// ── 2. the title plan (descending) ───────────────────────────────────────────────────────────
$plan = [];
foreach ($topics as $t) {
    if (!preg_match('/^(\d+)\. STEP (\d+): (.+)$/', $t->post_title, $m)) { continue; }
    $n = (int) $m[2];
    if ($n < 13 || $n > 30) { continue; }
    $prefix = (int) $m[1];
    // only the lessons AFTER Step 12 in the Draft-2 unit shift their in-unit prefix
    $samUnit = (int) get_post_meta($t->ID, 'lesson_id', true) === $unitId;
    $newPrefix = $samUnit ? $prefix + 1 : $prefix;
    $plan[] = ['id' => $t->ID, 'from' => $t->post_title, 'to' => sprintf('%d. STEP %d: %s', $newPrefix, $n + 1, $m[3]), 'n' => $n];
}
foreach ($topics as $t) {
    if (preg_match('/^(\d+)\. TRIAL 2: (.+)$/', $t->post_title, $m) && (int) get_post_meta($t->ID, 'lesson_id', true) === $unitId) {
        $plan[] = ['id' => $t->ID, 'from' => $t->post_title, 'to' => sprintf('%d. TRIAL 2: %s', (int) $m[1] + 1, $m[2]), 'n' => 999];
    }
}
usort($plan, fn($a, $b) => $b['n'] <=> $a['n']);
echo "\nTITLE PLAN (" . count($plan) . " lesson(s), descending):\n";
foreach ($plan as $p) { printf("  #%-6d %-48s → %s\n", $p['id'], $p['from'], $p['to']); }
$newTitle = sprintf('%d. %s', $slot + 1, $NEW_TITLE_CORE);
printf("\nNEW TOPIC: \"%s\" in unit #%d after #%d\n", $newTitle, $unitId, $step12->ID);

// ── 3. the bridge plan ───────────────────────────────────────────────────────────────────────
$bridgeKey = 'sophicly_ld_bridge_' . $COURSE_ID;
$bridge = get_option($bridgeKey, []);
if (!is_array($bridge)) { echo "⛔ $bridgeKey is not an array.\n"; exit(1); }
$bridgePlan = [];
foreach ($bridge as $pid => $entry) {
    if (!is_array($entry)) { echo "⛔ bridge entry $pid is not an array (the .451 outage shape) — fix before running.\n"; exit(1); }
    if (preg_match('/^cw_step_(\d+)$/', (string) ($entry['wml_task'] ?? ''), $m) && (int) $m[1] >= 13) {
        $bridgePlan[] = ['pid' => $pid, 'from' => $entry['wml_task'], 'to' => 'cw_step_' . ((int) $m[1] + 1), 'n' => (int) $m[1]];
    }
}
usort($bridgePlan, fn($a, $b) => $b['n'] <=> $a['n']);
echo "\nBRIDGE PLAN (" . count($bridgePlan) . " entries → +1, then the new topic → cw_step_13):\n";
foreach ($bridgePlan as $b) { printf("  #%-6d %s → %s\n", $b['pid'], $b['from'], $b['to']); }

if (!$APPLY) { echo "\n(dry run — nothing written)\n"; exit(0); }

// ── APPLY ────────────────────────────────────────────────────────────────────────────────────
$backup = ['bridge' => $bridge, 'steps_h' => $h, 'titles' => $byTitle, 'at' => gmdate('c')];
update_option($bridgeKey . '_prerenumber2_backup', $backup, false);
@file_put_contents('/tmp/cw-ld-prerenumber2-' . $COURSE_ID . '.json', wp_json_encode($backup));
echo "\nbackup: option {$bridgeKey}_prerenumber2_backup + /tmp/cw-ld-prerenumber2-$COURSE_ID.json\n";

// titles, descending
foreach ($plan as $p) {
    $r = wp_update_post(['ID' => $p['id'], 'post_title' => $p['to']], true);
    if (is_wp_error($r)) { echo "⛔ title update failed for #{$p['id']}: " . $r->get_error_message() . "\n"; exit(1); }
}
echo "titles renumbered: " . count($plan) . "\n";

// the new topic
$newId = wp_insert_post([
    'post_type' => 'sfwd-topic', 'post_status' => 'publish', 'post_title' => $newTitle,
    'post_content' => '', 'post_author' => 1,
], true);
if (is_wp_error($newId)) { echo "⛔ insert failed: " . $newId->get_error_message() . "\n"; exit(1); }
update_post_meta($newId, 'course_id', $COURSE_ID);
update_post_meta($newId, 'lesson_id', $unitId);
// copy the Step-12 topic's sfwd-topic settings block so the new lesson renders the same way
$tpl = get_post_meta($step12->ID, '_sfwd-topic', true);
if (is_array($tpl)) { $tpl['sfwd-topic_course'] = $COURSE_ID; $tpl['sfwd-topic_lesson'] = $unitId; update_post_meta($newId, '_sfwd-topic', $tpl); }
printf("new topic: #%d \"%s\"\n", $newId, $newTitle);

// the course tree: insert after Step 12, keeping sections
$newUnit = [];
foreach ($unitTopics as $id => $sub) {
    $newUnit[$id] = $sub;
    if ((int) $id === (int) $step12->ID) { $newUnit[$newId] = []; }
}
$h['sfwd-lessons'][$unitId]['sfwd-topic'] = $newUnit;
$stepsObj->set_steps_keeping_sections($h);
$check = LDLMS_Factory_Post::course_steps($COURSE_ID)->get_steps('h');
$ok = isset($check['sfwd-lessons'][$unitId]['sfwd-topic'][$newId]);
echo $ok ? "course tree: new topic is in unit $unitId\n" : "⛔ course tree: new topic NOT found after set_steps_keeping_sections\n";
$sectionsAfter = function_exists('learndash_30_get_course_sections') ? learndash_30_get_course_sections($COURSE_ID) : [];
printf("course sections after: %d (before %d)%s\n", count($sectionsAfter), count($sectionsBefore), count($sectionsAfter) === count($sectionsBefore) ? '' : '  ⛔ CHANGED — fix course_sections order values before students see this');

// the bridge, descending, arrays kept
foreach ($bridgePlan as $b) { $bridge[$b['pid']]['wml_task'] = $b['to']; }
$bridge[$newId] = ['wml_task' => 'cw_step_13', 'wml_topic' => 0, 'wml_phase' => '', 'wml_step' => 0, 'bridged_at' => current_time('mysql')];
foreach ($bridge as $pid => $entry) { if (!is_array($entry)) { echo "⛔ refusing to save: entry $pid is not an array\n"; exit(1); } }
update_option($bridgeKey, $bridge, false);
echo "bridge: " . count($bridgePlan) . " entries shifted, #$newId → cw_step_13\n";

// verify: every STEP title agrees with its bridge task
$bad = 0;
foreach ($wpdb->get_results($wpdb->prepare("SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type='sfwd-topic' AND post_status='publish' AND ID IN (SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='course_id' AND meta_value=%s)", (string) $COURSE_ID)) as $t) {
    if (!preg_match('/STEP (\d+):/', $t->post_title, $m)) { continue; }
    $task = $bridge[$t->ID]['wml_task'] ?? '(none)';
    if ($task !== 'cw_step_' . $m[1]) { $bad++; printf("  ✗ #%d \"%s\" ↔ %s\n", $t->ID, $t->post_title, $task); }
}
echo $bad ? "⛔ $bad title/bridge mismatch(es)\n" : "✅ every STEP title agrees with its bridge task\n";
echo "\nDONE. Now load one CW lesson in a browser (expect 200), then deploy the plugin.\n";
