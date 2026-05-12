<?php
/**
 * One-time migration for AQA Modern Text crib canvases (v7.19.110).
 *
 * Problem: AIC crib shipped 2026-05-10 with everything bundled inside one
 * `data-section-type="question"` div. v7.19.108 added 4 new Modern Text
 * cribs (Blood Brothers / Animal Farm / Leave Taking / Lord of the Flies)
 * mirroring AIC's broken shape. 19c novel + Shakespeare cribs use a
 * `question` + `plan` + `response` triplet, rendering green/purple/green.
 *
 * v7.19.109 fixed the disk JSONs in tools/output/ + promoted to
 * protocols/shared/crib-templates/. But cribs snapshot into user_meta on
 * first edit + autosave (class-rest-api.php:1502-1526), so existing
 * student canvases retain the broken markup. This class transforms those
 * snapshots in place.
 *
 * Idempotent. Safe to run multiple times. Sets option
 * `swml_modern_text_crib_migration_done` when complete.
 */

if (!defined('ABSPATH')) exit;

class SWML_Crib_Markup_Migration {

    const VERSION_OPTION = 'swml_modern_text_crib_migration_done_v1';

    /** @var string[] Target text slugs (AQA Modern Text). */
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
     * Run the migration. Bounded by single-shot option.
     * Returns ['scanned' => N, 'migrated' => N, 'skipped' => N, 'errors' => N].
     */
    public static function run() {
        global $wpdb;

        $stats = ['scanned' => 0, 'migrated' => 0, 'skipped' => 0, 'errors' => 0];

        $like_patterns = [];
        foreach (self::$text_slugs as $slug) {
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
                // wp_unslash recovery
                $doc = json_decode(wp_unslash($raw), true);
            }
            if (!is_array($doc) || empty($doc['html']) || !is_string($doc['html'])) {
                $stats['errors']++;
                continue;
            }

            $html = $doc['html'];

            // Idempotency guard: if `plan` section already present, skip.
            if (strpos($html, 'data-section-type="plan"') !== false) {
                $stats['skipped']++;
                continue;
            }

            $new_html = self::transform_html($html);
            if ($new_html === null || $new_html === $html) {
                $stats['errors']++;
                continue;
            }

            $doc['html'] = $new_html;
            $doc['savedAt'] = current_time('c');
            $doc['_migrated_v1'] = '2026-05-12';

            $encoded = wp_json_encode($doc);
            if ($encoded === false) {
                $stats['errors']++;
                continue;
            }

            // wp_slash gotcha — JSON containing backslashes gets stripped on write.
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
     * Split each `question` div in HTML into question + plan sections.
     *
     * For each match:
     *   <div data-section-type="question" ... data-section-label="Q{N} — ...">
     *     [Q stem + Frame + Technique gloss]
     *     <h3>INTRODUCTION ...</h3>
     *     [skeleton plan content]
     *   </div>
     *
     * Becomes:
     *   <div data-section-type="question" ... data-section-label="Q{N} — Question + Frame">
     *     [Q stem + Frame + Technique gloss]
     *   </div>
     *   <div data-section-type="plan" class="swml-section-block swml-section-plan" data-section-label="Q{N} — Skeleton Plan" data-editable="true">
     *     <h3>INTRODUCTION ...</h3>
     *     [skeleton plan content]
     *   </div>
     */
    public static function transform_html($html) {
        // Capture each question div + its inner content via balanced-div regex.
        // PHP regex doesn't natively balance — but the crib shape is flat
        // (question divs contain text/headings/lists, no nested data-section-type
        // divs). So a non-greedy match up to the next </div> followed by either
        // another section div or end-of-document is sufficient.

        $pattern = '/<div\s+data-section-type="question"([^>]*)>(.*?)<\/div>(?=\s*<div\s+data-section-type=|\s*$)/s';

        $out = preg_replace_callback($pattern, function($m) {
            $attrs = $m[1];
            $inner = $m[2];

            // Extract Q number from data-section-label (e.g. "Q3 — Preamble + ...").
            $qnum = '';
            if (preg_match('/data-section-label="Q(\d+)/', $attrs, $lm)) {
                $qnum = $lm[1];
            }

            // Find split point: first INTRODUCTION heading.
            // Match either <h3>INTRODUCTION or <h4>INTRODUCTION (cribs vary).
            $split = preg_split('/(?=<h[34][^>]*>\s*INTRODUCTION)/i', $inner, 2);
            if (count($split) !== 2) {
                // No INTRODUCTION found — leave question div untouched.
                return $m[0];
            }

            $question_inner = rtrim($split[0]);
            $plan_inner = $split[1];

            // Rewrite question section label (drop "Preamble + Extract").
            $new_attrs = preg_replace(
                '/data-section-label="[^"]*"/',
                'data-section-label="Q' . esc_attr($qnum) . ' — Question + Frame"',
                $attrs
            );

            $plan_label = 'Q' . $qnum . ' — Skeleton Plan';

            return '<div data-section-type="question"' . $new_attrs . '>' . $question_inner . '</div>'
                . '<div data-section-type="plan" class="swml-section-block swml-section-plan" data-section-label="' . esc_attr($plan_label) . '" data-editable="true">'
                . $plan_inner
                . '</div>';
        }, $html);

        return $out;
    }

    /**
     * Allow manual reset via WP-CLI / admin tool: `?swml_force_crib_migration=1`
     * (admin-only). Clears the done-flag so next admin_init re-runs.
     */
    public static function maybe_force_reset() {
        if (!current_user_can('manage_options')) return;
        if (empty($_GET['swml_force_crib_migration'])) return;
        delete_option(self::VERSION_OPTION);
        delete_option(self::VERSION_OPTION . '_stats');
        wp_safe_redirect(remove_query_arg('swml_force_crib_migration'));
        exit;
    }
}

add_action('admin_init', ['SWML_Crib_Markup_Migration', 'maybe_force_reset'], 1);
SWML_Crib_Markup_Migration::init();
