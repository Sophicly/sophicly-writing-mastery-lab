<?php
/**
 * 10-Q → 20-Q expansion migration for AQA Modern Text cribs (v7.19.123).
 *
 * Problem: v7.19.110 shipped 5 AQA Modern Text cribs (Inspector Calls + Blood
 * Brothers + Animal Farm + Leave Taking + Lord of the Flies) with a single
 * 10-question pool. The model-answers team has now split each text into
 * 10 character + 10 theme questions (20 total), wrapped under chevron-
 * collapsible super-groups ("How to use this guide" / "Top 10 Character" /
 * "Top 10 Theme"). The runtime template at
 * `protocols/shared/crib-templates/{slug}.json` now reflects the 20-Q shape.
 *
 * Existing student canvases snapshot into user_meta on first edit + autosave
 * (class-rest-api.php:1502-1526). Those snapshots are pinned to the 10-Q
 * markup and need re-seeding to the new 20-Q template. This class detects
 * 10-Q canvases (absence of the new `data-section-type="section-header"`
 * super-group marker) and overwrites their html field with the fresh
 * template, preserving the non-html canvas metadata (savedAt, notes, etc.).
 *
 * TRADE-OFF: re-seeding wipes any student-authored plan + response edits
 * inside the old 10-Q snapshot. Acceptable here because v7.19.110 shipped
 * 2026-05-10 (2 days before this migration). Edited-canvas archive is NOT
 * implemented — flag here if student-impact analytics show meaningful edits
 * on these 5 slugs in that 2-day window.
 *
 * Idempotent: skips canvases already carrying the section-header marker.
 * Single-shot via `SWML_Crib_20q_Migration_done_v1` option. Force-reset via
 * admin-only `?swml_force_crib_20q_migration=1`.
 */

if (!defined('ABSPATH')) exit;

class SWML_Crib_20q_Migration {

    const VERSION_OPTION = 'swml_crib_20q_migration_done_v1';

    /** @var string[] Target text slugs (AQA Modern Text 20-Q split). */
    private static $text_slugs = [
        'inspector_calls',
        'blood_brothers',
        'animal_farm',
        'leave_taking',
        'lord_of_the_flies',
    ];

    public static function init() {
        add_action('admin_init', [__CLASS__, 'maybe_run']);
    }

    public static function maybe_run() {
        if (get_option(self::VERSION_OPTION) === 'done') return;
        if (!current_user_can('manage_options')) return; // admin-only trigger
        self::run();
    }

    /**
     * Run the migration. Returns
     * ['scanned' => N, 'migrated' => N, 'skipped' => N, 'errors' => N].
     */
    public static function run() {
        global $wpdb;

        $stats = ['scanned' => 0, 'migrated' => 0, 'skipped' => 0, 'errors' => 0];

        // Load fresh disk templates once per slug.
        $templates = [];
        foreach (self::$text_slugs as $slug) {
            $tpl_path = SWML_PATH . 'protocols/shared/crib-templates/' . $slug . '.json';
            if (!file_exists($tpl_path)) continue;
            $raw = file_get_contents($tpl_path);
            $data = json_decode($raw, true);
            if (is_array($data) && !empty($data['html'])) {
                $templates[$slug] = $data['html'];
            }
        }
        if (empty($templates)) {
            update_option(self::VERSION_OPTION, 'done');
            return $stats;
        }

        $like_patterns = [];
        foreach (array_keys($templates) as $slug) {
            $like_patterns[] = $wpdb->prepare(
                'meta_key LIKE %s',
                'swml_canvas_aqa_' . $slug . '_crib%'
            );
        }
        $where = implode(' OR ', $like_patterns);
        $rows = $wpdb->get_results(
            "SELECT umeta_id, user_id, meta_key, meta_value FROM {$wpdb->usermeta} WHERE {$where}"
        );

        foreach ($rows as $row) {
            $stats['scanned']++;

            $raw = $row->meta_value;
            $doc = json_decode($raw, true);
            if (!is_array($doc)) {
                $doc = json_decode(wp_unslash($raw), true);
            }
            if (!is_array($doc) || empty($doc['html']) || !is_string($doc['html'])) {
                $stats['errors']++;
                continue;
            }

            // Idempotency guard: section-header marker = already 20-Q.
            if (strpos($doc['html'], 'data-section-type="section-header"') !== false) {
                $stats['skipped']++;
                continue;
            }

            // Pick the right template by slug substring inside the meta_key.
            $picked = null;
            foreach ($templates as $slug => $tpl) {
                if (strpos($row->meta_key, '_aqa_' . $slug . '_crib') !== false) {
                    $picked = $tpl;
                    break;
                }
            }
            if ($picked === null) {
                $stats['errors']++;
                continue;
            }

            $doc['html'] = $picked;
            $doc['savedAt'] = current_time('c');
            $doc['_migrated_20q'] = '2026-05-12';

            $encoded = wp_json_encode($doc);
            if ($encoded === false) {
                $stats['errors']++;
                continue;
            }

            $result = update_user_meta($row->user_id, $row->meta_key, wp_slash($encoded));
            if ($result === false) {
                $stats['errors']++;
            } else {
                $stats['migrated']++;
            }
        }

        update_option(self::VERSION_OPTION, 'done');
        update_option(self::VERSION_OPTION . '_stats', $stats);

        return $stats;
    }

    /**
     * Admin-only force reset — clears the done-flag so next admin_init re-runs.
     * Trigger: `?swml_force_crib_20q_migration=1` on any admin page.
     */
    public static function maybe_force_reset() {
        if (!current_user_can('manage_options')) return;
        if (empty($_GET['swml_force_crib_20q_migration'])) return;
        delete_option(self::VERSION_OPTION);
        delete_option(self::VERSION_OPTION . '_stats');
        wp_safe_redirect(remove_query_arg('swml_force_crib_20q_migration'));
        exit;
    }
}

add_action('admin_init', ['SWML_Crib_20q_Migration', 'maybe_force_reset'], 1);
SWML_Crib_20q_Migration::init();
