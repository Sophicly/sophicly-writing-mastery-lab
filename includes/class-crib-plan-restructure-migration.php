<?php
/**
 * v7.19.150 — Crib plan-section restructure migration.
 *
 * Converts saved crib canvases to the new universal plan shape:
 *   5 plan sections per question (Plan: Introduction / BP1 / BP2 / BP3 / Conclusion)
 *   Plain-text element labels inside bullets (no <strong> bold wrappers)
 *   No redundant <h3> headings inside plan sections (section label already shows the name)
 *
 * Old shapes handled:
 *   A) 19C + Shakespeare: ONE plan section per Q with <h3>INTRODUCTION ...</h3> / <h3>BODY PARAGRAPH N</h3> /
 *      <h3>CONCLUSION</h3> sub-headings + <p>• <strong>Label:</strong> text</p> bullets.
 *      Split into 5 plan sections per Q.
 *   B) Modern Texts: 5 plan sections per Q already, but with <h3>Introduction</h3> heading + <strong>
 *      element labels inside bullets. Drop the <h3> + strip <strong>.
 *
 * Idempotent. Skips docs whose root JSON has `template_version >= 3`. Always stamps `template_version: 3`
 * on the rewritten doc.
 *
 * Mirrors SWML_Crib_Markup_Migration (v7.19.110) pattern: admin_init bounded by single-shot option.
 */

if (!defined('ABSPATH')) exit;

class SWML_Crib_Plan_Restructure_Migration {

    const VERSION_OPTION = 'swml_crib_plan_restructure_done_v2';

    /** @var string[] Target text slugs across all AQA Lit cribs (Modern + 19C + Shakespeare). */
    private static $text_slugs = [
        // Modern Texts
        'inspector_calls',
        'blood_brothers',
        'animal_farm',
        'leave_taking',
        'lord_of_the_flies',
        'anita_and_me',
        // 19th Century
        'christmas_carol',
        'jekyll_and_hyde',
        'frankenstein',
        'jane_eyre',
        'pride_and_prejudice',
        'sign_of_the_four',
        // Shakespeare
        'macbeth',
        'romeo_and_juliet',
        'much_ado',
    ];

    public static function init() {
        add_action('admin_init', [__CLASS__, 'maybe_run']);
        add_action('admin_init', [__CLASS__, 'maybe_force_reset'], 1);
    }

    public static function maybe_run() {
        if (get_option(self::VERSION_OPTION) === 'done') return;
        if (!current_user_can('manage_options')) return;
        self::run();
    }

    public static function maybe_force_reset() {
        if (!current_user_can('manage_options')) return;
        if (empty($_GET['swml_force_plan_restructure'])) return;
        delete_option(self::VERSION_OPTION);
        delete_option(self::VERSION_OPTION . '_stats');
        wp_safe_redirect(remove_query_arg('swml_force_plan_restructure'));
        exit;
    }

    /**
     * Sweep all crib user_meta, transform where needed. Returns stats array.
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
                $doc = json_decode(wp_unslash($raw), true);
            }
            if (!is_array($doc) || empty($doc['html']) || !is_string($doc['html'])) {
                $stats['errors']++;
                continue;
            }

            // Idempotency: shape-based. If any plan section label already contains "Plan:",
            // the doc is already in the new universal shape. (template_version is reserved
            // for other generator-version concerns — values 2/3/5/7 already in use for
            // unrelated reasons, so don't conflate.)
            if (!empty($doc['_plan_restructured_v3']) || preg_match('/data-section-label="[^"]*Plan:/', $doc['html'])) {
                $stats['skipped']++;
                continue;
            }

            $new_html = self::transform_html($doc['html']);
            if ($new_html === null || $new_html === $doc['html']) {
                // Transform was a no-op (no plan sections found, or already clean).
                // Stamp the flag so future sweeps skip this doc cleanly.
                $doc['_plan_restructured_v3'] = true;
                $encoded = wp_json_encode($doc);
                if ($encoded !== false) {
                    update_user_meta($row->user_id, $row->meta_key, wp_slash($encoded));
                }
                $stats['skipped']++;
                continue;
            }

            $doc['html'] = $new_html;
            $doc['_plan_restructured_v3'] = true;
            $doc['savedAt'] = current_time('c');
            $doc['_migrated_v3'] = '2026-05-13';

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
     * Transform the doc's HTML — handles both old shapes.
     */
    public static function transform_html($html) {
        // Walk every <div data-section-type="plan" ...> block in order.
        // For each block: rewrite content + emit one or many new plan section divs.
        $out = preg_replace_callback(
            '/<div\s+data-section-type="plan"([^>]*)>(.*?)<\/div>(?=\s*<div\s+data-section-type=|\s*<h2|\s*$)/s',
            function($m) {
                $attrs = $m[1];
                $inner = $m[2];

                // Extract section label to get question identifier (Q1 / C1 / T2 / etc).
                $qprefix = '';
                if (preg_match('/data-section-label="([^"]*)"/', $attrs, $lm)) {
                    $full_label = $lm[1];
                    // Match "Q1", "C1", "T2" etc at the start
                    if (preg_match('/^([A-Z]\d+)\s*—/u', $full_label, $pm)) {
                        $qprefix = $pm[1];
                    } elseif (preg_match('/^([A-Z]\d+)\s*[-–—]/', $full_label, $pm2)) {
                        $qprefix = $pm2[1];
                    } elseif (preg_match('/^([A-Z]\d+)/', $full_label, $pm3)) {
                        $qprefix = $pm3[1];
                    }
                }
                if (!$qprefix) {
                    // Couldn't parse Q prefix — leave block unchanged (defensive).
                    return $m[0];
                }

                // Detect shape: does inner have multiple <h3> headings that look like paragraph names?
                $h3_matches = [];
                preg_match_all('/<h3[^>]*>\s*([^<]+?)\s*<\/h3>/i', $inner, $h3_matches);
                $h3_texts = $h3_matches[1] ?? [];

                $is_old_19c_shape = (count($h3_texts) >= 4) && self::looks_like_paragraph_headers($h3_texts);

                if ($is_old_19c_shape) {
                    // Shape A: split single plan section into 5 by <h3> boundary.
                    return self::split_combined_plan($inner, $qprefix);
                }

                // Shape B (Modern, already 5 plan sections per Q): clean single section.
                return self::clean_single_plan_section($attrs, $inner);
            },
            $html
        );

        return $out;
    }

    /**
     * Heuristic: do the h3 texts look like INTRODUCTION / BODY PARAGRAPH / CONCLUSION headings?
     */
    private static function looks_like_paragraph_headers($h3_texts) {
        $intro = false; $body = false; $conc = false;
        foreach ($h3_texts as $h) {
            if (preg_match('/INTRO/i', $h)) $intro = true;
            if (preg_match('/BODY\s*PARA/i', $h)) $body = true;
            if (preg_match('/CONCLU/i', $h)) $conc = true;
        }
        return $intro && $body && $conc;
    }

    /**
     * Shape A: split the combined 19C/Shakespeare plan section into 5 plan section divs.
     *
     * Input HTML body of one plan section:
     *   <h3>INTRODUCTION (…)</h3>
     *   <p>• <strong>Hook:</strong> text</p>
     *   <p>• <strong>Building:</strong> text</p>
     *   ...
     *   <h3>BODY PARAGRAPH 1 (…)</h3>
     *   <p>...</p>
     *   ...
     *   <h3>CONCLUSION (…)</h3>
     *   <p>...</p>
     *
     * Output: 5 new <div data-section-type="plan" ...> blocks back-to-back.
     */
    private static function split_combined_plan($inner, $qprefix) {
        // Split on <h3>...</h3> headings. Keep delimiter.
        $parts = preg_split('/(<h3[^>]*>.*?<\/h3>)/i', $inner, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        $sections = [];  // list of [label_suffix, inner_html]
        $current_label = null;
        $current_html  = '';
        foreach ($parts as $part) {
            if (preg_match('/<h3[^>]*>\s*(.+?)\s*<\/h3>/is', $part, $hm)) {
                // Heading delimiter — flush previous
                if ($current_label !== null) {
                    $sections[] = [$current_label, $current_html];
                }
                $current_label = self::paragraph_label_from_h3($hm[1]);
                $current_html  = '';
            } else {
                $current_html .= $part;
            }
        }
        if ($current_label !== null) {
            $sections[] = [$current_label, $current_html];
        }

        if (empty($sections)) return null;

        $out = '';
        foreach ($sections as [$label_suffix, $body_html]) {
            $clean = self::clean_plan_body($body_html);
            $label = $qprefix . ' — Plan: ' . $label_suffix;
            $out .= '<div data-section-type="plan"'
                  . ' class="swml-section-block swml-section-plan"'
                  . ' data-section-label="' . esc_attr($label) . '"'
                  . ' data-editable="true">'
                  . $clean
                  . '</div>';
        }
        return $out;
    }

    /**
     * Shape B: keep section structure, just rename label + strip <h3> + strip <strong>.
     */
    private static function clean_single_plan_section($attrs, $inner) {
        // Rename label: "C1 — Introduction" → "C1 — Plan: Introduction".
        $attrs = preg_replace_callback(
            '/data-section-label="([^"]+)"/',
            function($lm) {
                $label = $lm[1];
                if (strpos($label, 'Plan:') !== false) return $lm[0]; // already labelled
                // Insert " — Plan:" before the paragraph name (after "C1 — " or "Q1 — " etc.)
                $new = preg_replace(
                    '/^([A-Z]\d+)\s*[-\x{2013}\x{2014}]\s*(.+)$/u',
                    '$1 — Plan: $2',
                    $label
                );
                return 'data-section-label="' . esc_attr($new) . '"';
            },
            $attrs
        );

        $cleaned_inner = self::clean_plan_body($inner);

        return '<div data-section-type="plan"' . $attrs . '>' . $cleaned_inner . '</div>';
    }

    /**
     * Strip <h3>...</h3> wrappers (redundant with section label) + strip <strong> from bullets.
     */
    private static function clean_plan_body($html) {
        // Remove <h3>...</h3> blocks entirely
        $html = preg_replace('/<h3[^>]*>.*?<\/h3>\s*/is', '', $html);
        // Strip <strong> tags (keep text)
        $html = preg_replace('/<strong>(.*?)<\/strong>/is', '$1', $html);
        return $html;
    }

    private static function paragraph_label_from_h3($h3_text) {
        $h = trim($h3_text);
        if (preg_match('/INTRO/i', $h)) return 'Introduction';
        if (preg_match('/BODY\s*PARAGRAPH\s*(\d+)/i', $h, $bm)) return 'Body Paragraph ' . $bm[1];
        if (preg_match('/CONCLU/i', $h)) return 'Conclusion';
        // Fallback: clean up the heading text
        return trim(preg_replace('/\s*\(.*?\)\s*/', '', $h));
    }
}

SWML_Crib_Plan_Restructure_Migration::init();
