<?php
/**
 * cw-renumber-migrate-step-keyed-meta.php — the data half of the v7.20.451/.452 CW renumber.
 *
 * Run:  wp eval-file bin/cw-renumber-migrate-step-keyed-meta.php            (DRY RUN — default)
 *       wp eval-file bin/cw-renumber-migrate-step-keyed-meta.php apply      (writes)
 *   on the box:  /usr/local/lsws/lsphp82/bin/php $(which wp) --skip-plugins=etch --skip-themes \
 *                  eval-file bin/cw-renumber-migrate-step-keyed-meta.php [apply]
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS (Neil, 2026-08-09, FIXLIST #363: *"it's actually pulling in the step nine
 * document… and the step nine document, I think it's pulling in the step ten document"*).
 *
 * v7.20.451 inserted a NEW Step 8 (Update Your Plot — Values), so every CW step from the old 8
 * upward moved +1. The CODE renumber was complete and is not at fault — the LearnDash bridge,
 * CW_STEPS, CW_ARTIFACT_MAP, the document templates and the protocol files were all measured
 * correct on prod before this script was written.
 *
 * What moved was the MEANING of a key that never changed shape. Canvas documents, chat threads
 * and attempt records are keyed by STEP NUMBER:
 *     swml_canvas_universal_creative_writing_cw_{N}__pcwp_{project}
 *     swml_chat_universal_creative_writing_cw_{N}__pcwp_{project}
 *     swml_attempts_universal_creative_writing_cw_{N}
 * so a document authored when 8 meant "Scene Selection" is still sitting at 8 now that 8 means
 * "Update Your Plot — Values". The lesson reads the right key and gets the previous step's work.
 * This is root CLAUDE.md §5d (write-key ≡ read-key) in its migration form: nobody mistyped a key,
 * the key's SEMANTICS were redefined underneath the stored data.
 *
 * ⭐ THE RULE THIS LEAVES BEHIND: a step renumber is a DATA migration, not only a code change.
 * Any store keyed on an ordinal must be migrated in the same ship, or every saved record is
 * silently one step out — with no error, because every read succeeds.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * SAFETY, and why each choice was made:
 *  · DRY RUN BY DEFAULT. `apply` is explicit.
 *  · It renames the META KEY with a direct SQL UPDATE and NEVER rewrites meta_value — so the
 *    wp_unslash corruption class (root CLAUDE.md §WORDPRESS META STORAGE) cannot fire at all.
 *  · DATE-GATED, not blanket. Only records STARTED BEFORE the renumber are shifted, so a doc
 *    created after it (already correctly numbered) can never be pushed out of place. Measured
 *    on prod before writing this: Neil's six records are all pre-renumber; students 1330/1332
 *    have post-renumber cw_8 attempt rows, and this script must leave those alone.
 *  · DESCENDING ORDER (13→14 first, 8→9 last), so a target is always free before it is written.
 *  · It REFUSES to overwrite an occupied target and says so, rather than clobbering.
 *  · It prints a full backup line per row before touching anything; capture the output.
 */

if (!defined('ABSPATH')) { exit(1); }

global $wpdb;

$APPLY       = in_array('apply', (array) ($args ?? []), true);
// v7.20.568 (#440): the SECOND renumber — a new Step 13 (Scene Selection for Draft 2), old 13–30
// → 14–31. The defaults below are that one; the v7.20.451 run (from=8, at=2026-08-05, last=30) is
// reproducible by passing `from=8 at=2026-08-05 last=30`. `at` is compared as a FULL timestamp
// (ISO, e.g. 2026-08-25T14:30), so a record started earlier the same day still moves.
$argv_kv = [];
foreach ((array) ($args ?? []) as $a) { if (strpos($a, '=') !== false) { [$k, $v] = explode('=', $a, 2); $argv_kv[$k] = $v; } }
$RENUMBER_AT = $argv_kv['at']   ?? '2026-08-25T00:00';   // the moment the renumbered course + plugin land on THIS env
$FIRST_MOVED = (int) ($argv_kv['from'] ?? 13);           // the old step 13 (Draft 2) and everything above it
$LAST_MOVED  = (int) ($argv_kv['last'] ?? 30);

$prefixes = [
    'swml_canvas_universal_creative_writing_cw_',
    'swml_chat_universal_creative_writing_cw_',
    'swml_attempts_universal_creative_writing_cw_',
];

printf("CW RENUMBER MIGRATION — %s\n", $APPLY ? '*** APPLY ***' : 'dry run (pass "apply" to write)');
printf("shifting step-keyed meta +1 for old steps %d-%d, started before %s\n\n", $FIRST_MOVED, $LAST_MOVED, $RENUMBER_AT);

// ── 1. COLLECT ────────────────────────────────────────────────────────────────────────────────
$rows = $wpdb->get_results(
    "SELECT umeta_id, user_id, meta_key FROM {$wpdb->usermeta}
      WHERE meta_key LIKE 'swml_canvas_universal_creative_writing_cw_%'
         OR meta_key LIKE 'swml_chat_universal_creative_writing_cw_%'
         OR meta_key LIKE 'swml_attempts_universal_creative_writing_cw_%'
      ORDER BY user_id"
);

$plan = [];
$skipped = [];
foreach ($rows as $r) {
    $matched = null;
    foreach ($prefixes as $p) {
        if (strpos($r->meta_key, $p) === 0) { $matched = $p; break; }
    }
    if (!$matched) { continue; }
    $tail = substr($r->meta_key, strlen($matched));
    if (!preg_match('/^(\d+)(.*)$/', $tail, $m)) { continue; }
    $n = (int) $m[1];
    $rest = $m[2];
    if ($n < $FIRST_MOVED || $n > $LAST_MOVED) { continue; }

    // THE DATE GATE. An attempts record carries its own start date; a canvas/chat record does
    // not, so it inherits the verdict of its own step's attempts row (the record that proves
    // when the student first opened that step). No attempts row and no date = leave it alone
    // and SAY SO — a silent skip here is how half a migration ships.
    $attKey = 'swml_attempts_universal_creative_writing_cw_' . $n;
    $att = get_user_meta((int) $r->user_id, $attKey, true);
    $att = is_string($att) ? json_decode(stripslashes($att), true) : (is_array($att) ? $att : null);
    $started = $att['attempts'][0]['started'] ?? '';
    if (!$started) {
        $skipped[] = sprintf('u%d %s — no start date to judge by (needs a human)', $r->user_id, $r->meta_key);
        continue;
    }
    // Compare on the common prefix length of the two timestamps (a date-only `at` compares dates;
    // a datetime `at` compares to the minute) — never a date-only compare of a datetime cutoff.
    $cmpLen = min(strlen($started), strlen($RENUMBER_AT));
    if (strcmp(substr(str_replace(' ', 'T', $started), 0, $cmpLen), substr($RENUMBER_AT, 0, $cmpLen)) >= 0) {
        $skipped[] = sprintf('u%d %s — started %s, AFTER the renumber: already correct', $r->user_id, $r->meta_key, substr($started, 0, 16));
        continue;
    }
    $plan[] = [
        'umeta_id' => (int) $r->umeta_id,
        'user_id'  => (int) $r->user_id,
        'from'     => $r->meta_key,
        'to'       => $matched . ($n + 1) . $rest,
        'n'        => $n,
        'started'  => substr($started, 0, 10),
    ];
}

// ── 2. ORDER + COLLISION CHECK ────────────────────────────────────────────────────────────────
usort($plan, static function ($a, $b) { return $b['n'] <=> $a['n']; });   // descending

$existing = [];
foreach ($rows as $r) { $existing[$r->user_id . '|' . $r->meta_key] = (int) $r->umeta_id; }
$moving = [];
foreach ($plan as $p) { $moving[$p['user_id'] . '|' . $p['from']] = true; }

$blocked = [];
foreach ($plan as $p) {
    $t = $p['user_id'] . '|' . $p['to'];
    if (isset($existing[$t]) && !isset($moving[$t])) {
        $blocked[] = sprintf('u%d %s → %s — TARGET OCCUPIED by a record that is NOT moving', $p['user_id'], $p['from'], $p['to']);
    }
}

// ── 3. REPORT ─────────────────────────────────────────────────────────────────────────────────
echo "PLAN (" . count($plan) . " key(s), descending so a target is always free first):\n";
foreach ($plan as $p) {
    printf("  u%-5d %-70s → %s   [started %s]\n", $p['user_id'], $p['from'], substr($p['to'], strrpos($p['to'], 'cw_')), $p['started']);
}
if ($skipped) {
    echo "\nLEFT ALONE (" . count($skipped) . "):\n";
    foreach ($skipped as $s) { echo '  ' . $s . "\n"; }
}
if ($blocked) {
    echo "\n⛔ REFUSING TO RUN — " . count($blocked) . " collision(s):\n";
    foreach ($blocked as $b) { echo '  ' . $b . "\n"; }
    echo "\nNothing was written.\n";
    return;
}
if (!$plan) { echo "\nNothing to migrate.\n"; return; }
if (!$APPLY) { echo "\nDRY RUN — nothing written. Re-run with `apply`.\n"; return; }

// ── 4. APPLY — key rename only; meta_value is never read or rewritten ─────────────────────────
$done = 0;
foreach ($plan as $p) {
    $updated = $wpdb->update(
        $wpdb->usermeta,
        ['meta_key' => $p['to']],
        ['umeta_id' => $p['umeta_id']],
        ['%s'],
        ['%d']
    );
    if ($updated === false) {
        printf("  ✗ FAILED u%d %s — %s\n", $p['user_id'], $p['from'], $wpdb->last_error);
        continue;
    }
    $done++;
}
foreach (array_unique(array_column($plan, 'user_id')) as $uid) { clean_user_cache((int) $uid); }
wp_cache_flush();

printf("\n✅ renamed %d of %d key(s). Caches flushed.\n", $done, count($plan));

// ── 5. VERIFY — re-read, never trust the counter (the v7.20.370 lesson) ───────────────────────
$still = $wpdb->get_col(
    $wpdb->prepare(
        "SELECT meta_key FROM {$wpdb->usermeta} WHERE meta_key IN ("
        . implode(',', array_fill(0, count($plan), '%s')) . ')',
        array_column($plan, 'from')
    )
);
if ($still) {
    echo "⚠️  these source keys still exist — the rename did not take:\n";
    foreach ($still as $s) { echo '  ' . $s . "\n"; }
} else {
    echo "verified: no source key survives.\n";
}
