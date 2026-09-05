<?php
/**
 * live-model-create-ld-course.php — build / refresh the "Live Modelling" LearnDash course FROM THE MANIFEST.
 *
 *   wp eval-file bin/live-model-create-ld-course.php                    → DRY RUN: prints the plan, writes nothing
 *   wp eval-file bin/live-model-create-ld-course.php apply              → creates/updates course · units · lessons · tree · sections · bridge, then PROBES
 *   wp eval-file bin/live-model-create-ld-course.php apply enrol        → …and grants course access to every user whose sophicly_tier is paid
 *   wp eval-file bin/live-model-create-ld-course.php apply env=prod     → force the author uid for that env (default: detected from home_url)
 *
 * Source of truth: bin/live-modelling-papers/live-modelling-manifest.json (one row per past-paper sitting).
 * Tree (Neil's ruling 2026-09-05, "skill-first"): Section = paper family · Unit = the board's paper · Lesson = sitting, newest first.
 *
 * Idempotent: every object this script creates carries a key in post meta and is found by that key on re-run —
 *   course  _swml_lm_course = 1
 *   unit    _swml_lm_unit_key = "<section> || <unit>"
 *   lesson  _swml_lm_key      = "<text>|<topic_number>"
 * so re-running updates titles / content / placement and never duplicates. It never touches any other course.
 *
 * Shapes measured on staging 2026-09-05 (not assumed):
 *   • G9 Core Skills 45624 is `course_price_type = closed` + `course_disable_lesson_progression = on` — copied.
 *   • Units carry meta course_id + `_sfwd-lessons[sfwd-lessons_course]`; lessons carry course_id, lesson_id +
 *     `_sfwd-topic[sfwd-topic_course, sfwd-topic_lesson]` (the cw-ld-insert-step13.php precedent).
 *   • `course_sections` (postmeta on the COURSE) holds `{order, ID, post_title, type:"section-heading"}` where `order` is an
 *     ABSOLUTE slot index across sections+units (memory reference_deleting_a_learndash_step_breaks_section_headings) — rebuilt
 *     whole here, every run, so it can never drift. Written with wp_slash (JSON meta gotcha).
 *   • Bridge entries in `sophicly_ld_bridge_<course_id>` MUST stay PHP arrays keyed by the post id as a string
 *     (memory reference_ld_bridge_option_entries_must_stay_arrays) — asserted before every save.
 *
 * Refuses (exit 1) if: LearnDash is not loaded · the manifest is missing · the env's author uid is not a user or is not in
 * `swml_live_modelling_authors` · a published course titled "Live Modelling" exists WITHOUT our key (someone hand-made one).
 * Ends with the done_when PROBE from the LD handoff: every manifest row → published topic, in the tree, under the right unit
 * and section, content carries the shortcode with the env's author, bridge entry is an array with wml_author.
 */
if (!defined('WP_CLI') || !WP_CLI) { echo "run via wp eval-file\n"; exit(1); }
if (!class_exists('LDLMS_Factory_Post')) { echo "⛔ LDLMS_Factory_Post missing — LearnDash must be loaded (no --skip-plugins).\n"; exit(1); }

$argv_ = isset($args) && is_array($args) ? $args : [];
$mode = 'dry'; $env = null; $enrol = false;
foreach ($argv_ as $a) {
    if ($a === 'apply') $mode = 'apply';
    elseif ($a === 'enrol') $enrol = true;
    elseif (strpos($a, 'env=') === 0) $env = substr($a, 4);
}
$APPLY = ($mode === 'apply');

$manifest_path = __DIR__ . '/live-modelling-papers/live-modelling-manifest.json';
if (!file_exists($manifest_path)) { echo "⛔ manifest missing: $manifest_path\n"; exit(1); }
$manifest = json_decode(file_get_contents($manifest_path), true);
if (!is_array($manifest) || empty($manifest['lessons'])) { echo "⛔ manifest did not decode / has no lessons\n"; exit(1); }

if ($env === null) $env = (stripos(home_url(), 'staging') !== false || stripos(home_url(), 'temp-site') !== false) ? 'staging' : 'prod';
$AUTHOR = (int) ($manifest['author_uid_by_env'][$env] ?? 0);
if (!$AUTHOR || !get_user_by('id', $AUTHOR)) { echo "⛔ author uid for env '$env' is '$AUTHOR' — not a user here. Pass env=staging|prod.\n"; exit(1); }
$authors = get_option('swml_live_modelling_authors', []);
if (!is_array($authors) || !in_array($AUTHOR, array_map('intval', $authors), true)) {
    echo "⛔ user $AUTHOR is not in swml_live_modelling_authors (" . json_encode($authors) . ") — seed the option first, or every lesson renders as an ordinary diagnostic.\n"; exit(1);
}
$COURSE_TITLE = $manifest['course'] ?? 'Live Modelling';
$PLACEHOLDER  = $manifest['author_uid_placeholder'] ?? '{{AUTHOR_UID}}';
printf("env=%s author=%d (%s) mode=%s enrol=%s manifest rows=%d\n", $env, $AUTHOR, get_user_by('id', $AUTHOR)->display_name, $mode, $enrol ? 'yes' : 'no', count($manifest['lessons']));

// ── plan: sections → units → lessons (newest first) ─────────────────────────────────────────────────────────────
$sections = [];   // title => ['units' => [unitTitle => [rows]]]
foreach ($manifest['lessons'] as $row) {
    $sections[$row['section']]['units'][$row['unit']][] = $row;
}
$sortKey = function ($row) {           // YYYYMM desc, then variant digit(s) asc — a 7-digit Cambridge variant must not outrank a later 6-digit sitting
    $n = (string) $row['topic_number'];
    return [ -((int) substr($n, 0, 6)), (int) substr($n, 6) ];
};
foreach ($sections as &$sec) {
    foreach ($sec['units'] as &$rows) { usort($rows, fn($a, $b) => $sortKey($a) <=> $sortKey($b)); }
    unset($rows);
}
unset($sec);
echo "\nPLAN:\n";
foreach ($sections as $st => $sec) {
    echo "  § $st\n";
    foreach ($sec['units'] as $ut => $rows) { printf("    ▸ %s  (%d lessons; newest %s)\n", $ut, count($rows), $rows[0]['lesson_title']); }
}

// ── course ───────────────────────────────────────────────────────────────────────────────────────────────────────
$found = get_posts(['post_type' => 'sfwd-courses', 'post_status' => 'any', 'numberposts' => 2, 'meta_key' => '_swml_lm_course', 'meta_value' => '1', 'fields' => 'ids']);
$cid = $found ? (int) $found[0] : 0;
if (!$cid) {
    $stray = get_posts(['post_type' => 'sfwd-courses', 'post_status' => 'publish', 'numberposts' => 5, 'title' => $COURSE_TITLE, 'fields' => 'ids']);
    if ($stray) { echo "⛔ a published course titled '$COURSE_TITLE' already exists (#" . implode(',#', $stray) . ") without our key — decide whether to adopt it (add meta _swml_lm_course=1) or rename it. Refusing to create a second one.\n"; exit(1); }
}
printf("\ncourse: %s\n", $cid ? "#$cid exists (" . get_post_status($cid) . ")" : "will CREATE '$COURSE_TITLE' (closed, progression off)");
if ($APPLY && !$cid) {
    $cid = wp_insert_post([
        'post_type' => 'sfwd-courses', 'post_status' => 'publish', 'post_title' => $COURSE_TITLE, 'post_author' => 1,
        'post_content' => '<p>Watch a Grade 9 answer being written live, one past paper at a time. Each lesson is a real exam sitting: the source text, the questions, and the answer taking shape in front of you. Select any words to file them to your own notes.</p>',
    ], true);
    if (is_wp_error($cid)) { echo "⛔ course insert failed: " . $cid->get_error_message() . "\n"; exit(1); }
    update_post_meta($cid, '_swml_lm_course', '1');
    $cs = get_post_meta($cid, '_sfwd-courses', true); if (!is_array($cs)) $cs = [];
    $cs['sfwd-courses_course_price_type'] = 'closed';
    $cs['sfwd-courses_course_disable_lesson_progression'] = 'on';
    $cs['sfwd-courses_course_materials_enabled'] = '';
    update_post_meta($cid, '_sfwd-courses', $cs);
    if (function_exists('learndash_update_setting')) {
        learndash_update_setting($cid, 'course_price_type', 'closed');
        learndash_update_setting($cid, 'course_disable_lesson_progression', 'on');
    }
    printf("course CREATED #%d\n", $cid);
}

// ── units + lessons ──────────────────────────────────────────────────────────────────────────────────────────────
$findByKey = function ($ptype, $metaKey, $metaVal, $courseId) {
    $q = get_posts(['post_type' => $ptype, 'post_status' => 'any', 'numberposts' => 5, 'meta_query' => [
        ['key' => $metaKey, 'value' => $metaVal], ['key' => 'course_id', 'value' => (string) $courseId],
    ], 'fields' => 'ids']);
    return $q ? (int) $q[0] : 0;
};
$tree = [];          // unitId => [topicId, ...] in order
$unitOrder = [];     // [ ['section' => title, 'unit_id' => id, 'unit_title' => t], ... ]
$lessonRows = [];    // topicId => row
$counts = ['unit_new' => 0, 'unit_kept' => 0, 'lesson_new' => 0, 'lesson_upd' => 0, 'lesson_kept' => 0];
foreach ($sections as $st => $sec) {
    foreach ($sec['units'] as $ut => $rows) {
        $ukey = $st . ' || ' . $ut;
        $uid = $cid ? $findByKey('sfwd-lessons', '_swml_lm_unit_key', $ukey, $cid) : 0;
        if (!$uid) {
            $counts['unit_new']++;
            if ($APPLY) {
                $uid = wp_insert_post(['post_type' => 'sfwd-lessons', 'post_status' => 'publish', 'post_title' => $ut, 'post_author' => 1, 'post_content' => ''], true);
                if (is_wp_error($uid)) { echo "⛔ unit insert failed ($ut): " . $uid->get_error_message() . "\n"; exit(1); }
                update_post_meta($uid, '_swml_lm_unit_key', $ukey);
                update_post_meta($uid, 'course_id', $cid);
                $ls = get_post_meta($uid, '_sfwd-lessons', true); if (!is_array($ls)) $ls = [];
                $ls['sfwd-lessons_course'] = $cid;
                update_post_meta($uid, '_sfwd-lessons', $ls);
                if (function_exists('learndash_update_setting')) learndash_update_setting($uid, 'course', $cid);
            }
        } else { $counts['unit_kept']++; if ($APPLY && get_the_title($uid) !== $ut) wp_update_post(['ID' => $uid, 'post_title' => $ut]); }
        $unitOrder[] = ['section' => $st, 'unit_id' => $uid, 'unit_title' => $ut];
        $tree[$uid ?: ('new:' . $ukey)] = [];
        foreach ($rows as $row) {
            $lkey = $row['text'] . '|' . $row['topic_number'];
            $content = str_replace($PLACEHOLDER, (string) $AUTHOR, $row['shortcode']);
            $tid = $cid ? $findByKey('sfwd-topic', '_swml_lm_key', $lkey, $cid) : 0;
            if (!$tid) {
                $counts['lesson_new']++;
                if ($APPLY) {
                    $tid = wp_insert_post(['post_type' => 'sfwd-topic', 'post_status' => 'publish', 'post_title' => $row['lesson_title'], 'post_author' => 1, 'post_content' => $content], true);
                    if (is_wp_error($tid)) { echo "⛔ lesson insert failed ({$row['lesson_title']}): " . $tid->get_error_message() . "\n"; exit(1); }
                    update_post_meta($tid, '_swml_lm_key', $lkey);
                }
            } else {
                $cur = get_post($tid);
                $dirty = ($cur->post_title !== $row['lesson_title']) || (trim($cur->post_content) !== $content) || ((int) get_post_meta($tid, 'lesson_id', true) !== (int) $uid) || $cur->post_status !== 'publish';
                if ($dirty) { $counts['lesson_upd']++; if ($APPLY) wp_update_post(['ID' => $tid, 'post_title' => $row['lesson_title'], 'post_content' => $content, 'post_status' => 'publish']); }
                else $counts['lesson_kept']++;
            }
            if ($APPLY && $tid) {
                update_post_meta($tid, 'course_id', $cid);
                update_post_meta($tid, 'lesson_id', $uid);
                $ts = get_post_meta($tid, '_sfwd-topic', true); if (!is_array($ts)) $ts = [];
                $ts['sfwd-topic_course'] = $cid; $ts['sfwd-topic_lesson'] = $uid;
                update_post_meta($tid, '_sfwd-topic', $ts);
                if (function_exists('learndash_update_setting')) { learndash_update_setting($tid, 'course', $cid); learndash_update_setting($tid, 'lesson', $uid); }
                $tree[$uid][] = $tid;
                $lessonRows[$tid] = $row;
            }
        }
    }
}
printf("\nunits: %d new · %d kept   lessons: %d new · %d update · %d unchanged\n", $counts['unit_new'], $counts['unit_kept'], $counts['lesson_new'], $counts['lesson_upd'], $counts['lesson_kept']);
if (!$APPLY) { echo "\n(dry run — nothing written. Add `apply`.)\n"; exit(0); }

// ── the course tree + section headings ───────────────────────────────────────────────────────────────────────────
$h = ['sfwd-lessons' => []];
foreach ($unitOrder as $u) {
    $topics = [];
    foreach ($tree[$u['unit_id']] as $tid) $topics[$tid] = [];
    $h['sfwd-lessons'][$u['unit_id']] = ['sfwd-topic' => $topics];
}
$stepsObj = LDLMS_Factory_Post::course_steps($cid);
$stepsObj->set_steps($h);
delete_transient('learndash_course_steps_' . $cid);
$check = LDLMS_Factory_Post::course_steps($cid)->get_steps('h');
$treeOk = 0; $treeBad = [];
foreach ($tree as $uid => $tids) foreach ($tids as $tid) { if (isset($check['sfwd-lessons'][$uid]['sfwd-topic'][$tid])) $treeOk++; else $treeBad[] = $tid; }
printf("course tree: %d lesson(s) placed%s\n", $treeOk, $treeBad ? ' ⛔ MISSING: #' . implode(',#', $treeBad) : '');

// sections: rebuilt whole, absolute slot index across sections + units; stable IDs reused by title
$existing = json_decode((string) get_post_meta($cid, 'course_sections', true), true);
$idByTitle = [];
if (is_array($existing)) foreach ($existing as $s) if (!empty($s['post_title'])) $idByTitle[$s['post_title']] = $s['ID'] ?? null;
$secMeta = []; $slot = 0; $lastSection = null; $i = 0;
foreach ($unitOrder as $u) {
    if ($u['section'] !== $lastSection) {
        $secMeta[] = ['order' => $slot, 'ID' => $idByTitle[$u['section']] ?? (int) (round(microtime(true) * 1000) + $i), 'post_title' => $u['section'], 'url' => '', 'edit_link' => '', 'tree' => [], 'expanded' => false, 'type' => 'section-heading'];
        $slot++; $i++; $lastSection = $u['section'];
    }
    $slot++;
}
update_post_meta($cid, 'course_sections', wp_slash(wp_json_encode($secMeta)));
$resolved = function_exists('learndash_30_get_course_sections') ? learndash_30_get_course_sections($cid) : null;
printf("sections: wrote %d; LearnDash resolves %s\n", count($secMeta), $resolved === null ? '(fn missing)' : count($resolved) . ' → ' . json_encode(array_values(array_map(fn($x) => is_object($x) ? $x->post_title : ($x['post_title'] ?? '?'), $resolved))));

// ── bridge ───────────────────────────────────────────────────────────────────────────────────────────────────────
$bridgeKey = 'sophicly_ld_bridge_' . $cid;
$bridge = get_option($bridgeKey, []); if (!is_array($bridge)) $bridge = [];
foreach ($lessonRows as $tid => $row) {
    $prev = $bridge[(string) $tid] ?? [];
    $bridge[(string) $tid] = [
        'wml_task'   => (string) ($row['bridge']['wml_task'] ?? 'diagnostic'),
        'wml_topic'  => (int) ($row['bridge']['wml_topic'] ?? $row['topic_number']),
        'wml_phase'  => (string) ($row['bridge']['wml_phase'] ?? 'initial'),
        'wml_step'   => 0,
        'wml_author' => $AUTHOR,
        'bridged_at' => is_array($prev) && !empty($prev['bridged_at']) ? $prev['bridged_at'] : current_time('mysql'),
    ];
}
foreach ($bridge as $pid => $entry) { if (!is_array($entry)) { echo "⛔ refusing to save bridge: entry $pid is not an array\n"; exit(1); } }
update_option($bridgeKey, $bridge, false);
wp_cache_delete($bridgeKey, 'options');
printf("bridge %s: %d entries, all arrays, wml_author=%d\n", $bridgeKey, count($bridge), $AUTHOR);

// ── enrolment (opt-in flag) ──────────────────────────────────────────────────────────────────────────────────────
if ($enrol) {
    global $wpdb;
    $uids = $wpdb->get_col("SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key='sophicly_tier' AND meta_value IN ('bronze','silver','gold','platinum')");
    $granted = 0;
    foreach ($uids as $u) { if (function_exists('ld_update_course_access')) { ld_update_course_access((int) $u, $cid, false); $granted++; } }
    printf("enrol: %d paid-tier user(s) granted access (sophicly_tier ∈ bronze/silver/gold/platinum)\n", $granted);
}

// ── PROBE (the LD handoff's done_when) ───────────────────────────────────────────────────────────────────────────
echo "\nPROBE:\n";
$ok = 0; $bad = [];
$unitSection = [];          // unit id → section title, from what LearnDash actually resolves
if (is_array($resolved)) {
    $ids = array_keys($h['sfwd-lessons']); $cur = null;
    foreach ($ids as $uid) { if (isset($resolved[$uid])) $cur = is_object($resolved[$uid]) ? $resolved[$uid]->post_title : ($resolved[$uid]['post_title'] ?? null); $unitSection[$uid] = $cur; }
}
foreach ($manifest['lessons'] as $row) {
    $lkey = $row['text'] . '|' . $row['topic_number'];
    $tid = $findByKey('sfwd-topic', '_swml_lm_key', $lkey, $cid);
    $why = [];
    if (!$tid) $why[] = 'no topic';
    else {
        if (get_post_status($tid) !== 'publish') $why[] = 'not published';
        $uid = (int) get_post_meta($tid, 'lesson_id', true);
        if (!isset($check['sfwd-lessons'][$uid]['sfwd-topic'][$tid])) $why[] = 'not in tree under its unit';
        if (get_the_title($uid) !== $row['unit']) $why[] = 'unit title ≠ ' . $row['unit'];
        if (($unitSection[$uid] ?? null) !== $row['section']) $why[] = 'section resolves to ' . json_encode($unitSection[$uid] ?? null);
        $want = str_replace($PLACEHOLDER, (string) $AUTHOR, $row['shortcode']);
        if (strpos(get_post_field('post_content', $tid), $want) === false) $why[] = 'shortcode/author mismatch';
        $be = $bridge[(string) $tid] ?? null;
        if (!is_array($be) || (int) ($be['wml_author'] ?? 0) !== $AUTHOR || (int) ($be['wml_topic'] ?? 0) !== (int) $row['topic_number']) $why[] = 'bridge entry wrong';
    }
    if ($why) $bad[] = $row['lesson_title'] . ' — ' . implode('; ', $why); else $ok++;
}
printf("  %d/%d manifest rows resolve to a published lesson in the right unit + section, with the author's shortcode + bridge entry\n", $ok, count($manifest['lessons']));
foreach ($bad as $b) echo "  ✗ $b\n";
$firstTid = array_key_first($lessonRows);
if ($firstTid) printf("  first lesson URL: %s\n", function_exists('learndash_get_step_permalink') ? learndash_get_step_permalink($firstTid, $cid) : get_permalink($firstTid));
printf("  course URL: %s\n", get_permalink($cid));
echo $bad ? "⛔ PROBE FAILED (" . count($bad) . ")\n" : "✅ PROBE PASSED — course #$cid\n";
exit($bad ? 1 : 0);
