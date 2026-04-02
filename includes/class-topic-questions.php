<?php
/**
 * WML Topic Question Bank
 * Admin interface for managing fixed Mastery Programme topic questions.
 * 
 * Storage: wp_options keyed as swml_topics_{board}_{text} → array of topics.
 * Each topic: { topic_number, label, question_text, extract_text, extract_location,
 *               marks, aos, task, teaching_point, topic_type }
 * 
 * REST endpoint: GET /sophicly-wml/v1/topic-question?board=X&text=Y&topic=N
 * 
 * @package Sophicly_Writing_Mastery_Lab
 * @version 1.0.0
 */

if (!defined('ABSPATH')) exit;

class SWML_Topic_Questions {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Board → subject → text hierarchy (mirrors frontend TEXT_CATALOGUE)
     */
    private static $text_catalogue = [
        'aqa' => [
            'language' => [
                'language_p1' => 'Language Paper 1',
                'language_p2' => 'Language Paper 2',
            ],
            'shakespeare' => [
                'macbeth' => 'Macbeth',
                'romeo_juliet' => 'Romeo & Juliet',
                'the_tempest' => 'The Tempest',
                'merchant_of_venice' => 'The Merchant of Venice',
                'much_ado' => 'Much Ado About Nothing',
                'julius_caesar' => 'Julius Caesar',
                'twelfth_night' => 'Twelfth Night',
            ],
            'modern_text' => [
                'aic' => 'An Inspector Calls',
                'blood_brothers' => 'Blood Brothers',
                'lord_of_the_flies' => 'Lord of the Flies',
                'animal_farm' => 'Animal Farm',
                'never_let_me_go' => 'Never Let Me Go',
                'leave_taking' => 'Leave Taking',
                'dna' => 'DNA',
                'my_name_is_leon' => 'My Name Is Leon',
                'taste_of_honey' => 'A Taste of Honey',
                'journeys_end' => "Journey's End",
                'pigeon_english' => 'Pigeon English',
                'curious_incident' => 'The Curious Incident',
            ],
            '19th_century' => [
                'acc' => 'A Christmas Carol',
                'jekyll_hyde' => 'Jekyll & Hyde',
                'frankenstein' => 'Frankenstein',
                'sign_of_four' => 'The Sign of the Four',
                'great_expectations' => 'Great Expectations',
                'jane_eyre' => 'Jane Eyre',
                'pride_prejudice' => 'Pride & Prejudice',
            ],
            'poetry_anthology' => [
                'power_conflict' => 'Power & Conflict',
                'love_relationships' => 'Love & Relationships',
                'worlds_lives' => 'Worlds & Lives',
            ],
        ],
        'ocr' => [
            'language' => [
                'language_c1' => 'Language Component 1',
                'language_c2' => 'Language Component 2',
            ],
            'shakespeare' => [
                'macbeth' => 'Macbeth',
                'romeo_juliet' => 'Romeo & Juliet',
                'merchant_of_venice' => 'The Merchant of Venice',
                'much_ado' => 'Much Ado About Nothing',
            ],
            'modern_text' => [
                'aic' => 'An Inspector Calls',
            ],
            'modern_prose' => [
                'animal_farm' => 'Animal Farm',
                'lord_of_the_flies' => 'Lord of the Flies',
                'never_let_me_go' => 'Never Let Me Go',
                'anita_and_me' => 'Anita and Me',
                'curious_incident' => 'The Curious Incident',
            ],
            '19th_century' => [
                'acc' => 'A Christmas Carol',
                'jekyll_hyde' => 'Jekyll & Hyde',
                'frankenstein' => 'Frankenstein',
                'great_expectations' => 'Great Expectations',
                'jane_eyre' => 'Jane Eyre',
                'pride_prejudice' => 'Pride & Prejudice',
            ],
            'poetry_anthology' => [
                'conflict' => 'Conflict',
                'love' => 'Love',
                'youth_age' => 'Youth & Age',
            ],
        ],
        'eduqas' => [
            'language' => [
                'language_c1' => 'Language Component 1',
                'language_c2' => 'Language Component 2',
            ],
            'shakespeare' => [
                'macbeth' => 'Macbeth',
                'romeo_juliet' => 'Romeo & Juliet',
                'much_ado' => 'Much Ado About Nothing',
                'the_tempest' => 'The Tempest',
                'merchant_of_venice' => 'The Merchant of Venice',
                'henry_v' => 'Henry V',
                'othello' => 'Othello',
                'twelfth_night' => 'Twelfth Night',
            ],
            'modern_text' => [
                'aic' => 'An Inspector Calls',
                'leave_taking' => 'Leave Taking',
            ],
            '19th_century' => [
                'acc' => 'A Christmas Carol',
                'jekyll_hyde' => 'Jekyll & Hyde',
                'silas_marner' => 'Silas Marner',
                'war_of_worlds' => 'War of the Worlds',
                'jane_eyre' => 'Jane Eyre',
                'pride_prejudice' => 'Pride & Prejudice',
            ],
            'poetry_anthology' => [
                'eduqas_poetry' => 'EDUQAS Poetry (to 2026)',
                'eduqas_poetry_2027' => 'EDUQAS Poetry (from 2027)',
                'eduqas_leave_taking' => 'Leave Taking (Poetry)',
            ],
        ],
        'edexcel' => [
            'language' => [
                'language_p1' => 'Language Paper 1',
                'language_p2' => 'Language Paper 2',
            ],
            'shakespeare' => [
                'macbeth' => 'Macbeth',
                'romeo_juliet' => 'Romeo & Juliet',
                'the_tempest' => 'The Tempest',
                'merchant_of_venice' => 'The Merchant of Venice',
                'much_ado' => 'Much Ado About Nothing',
                'twelfth_night' => 'Twelfth Night',
                'othello' => 'Othello',
            ],
            'modern_text' => [
                'aic' => 'An Inspector Calls',
                'lord_of_the_flies' => 'Lord of the Flies',
            ],
            '19th_century' => [
                'acc' => 'A Christmas Carol',
                'jekyll_hyde' => 'Jekyll & Hyde',
                'frankenstein' => 'Frankenstein',
                'great_expectations' => 'Great Expectations',
                'jane_eyre' => 'Jane Eyre',
                'pride_prejudice' => 'Pride & Prejudice',
                'silas_marner' => 'Silas Marner',
            ],
            'poetry_anthology' => [
                'relationships' => 'Relationships',
                'conflict' => 'Conflict',
                'time_place' => 'Time & Place',
                'belonging' => 'Belonging',
            ],
        ],
        'edexcel-igcse' => [
            'language' => [
                'language_p1' => 'Language Paper 1',
                'language_p2' => 'Language Paper 2',
            ],
            'shakespeare' => [
                'macbeth' => 'Macbeth',
                'merchant_of_venice' => 'The Merchant of Venice',
                'romeo_juliet' => 'Romeo & Juliet',
                'much_ado' => 'Much Ado About Nothing',
            ],
            'modern_text' => [
                'aic' => 'An Inspector Calls',
            ],
            'modern_prose' => [
                'lord_of_the_flies' => 'Lord of the Flies',
                'animal_farm' => 'Animal Farm',
                'tkam' => 'To Kill a Mockingbird',
                'omam' => 'Of Mice and Men',
                'old_man_sea' => 'The Old Man and the Sea',
                'anita_and_me' => 'Anita and Me',
                'curious_incident' => 'The Curious Incident',
            ],
            '19th_century' => [
                'acc' => 'A Christmas Carol',
                'jekyll_hyde' => 'Jekyll & Hyde',
                'great_expectations' => 'Great Expectations',
                'jane_eyre' => 'Jane Eyre',
            ],
            'poetry_anthology' => [
                'igcse_lit_poetry' => 'Part 3 — Literature Poetry',
                'igcse_lang_poetry' => 'Part 2 — Language Poetry',
            ],
            'prose_anthology' => [
                'igcse_lang_prose' => 'Part 2 — Language Prose',
            ],
            'nonfiction_anthology' => [
                'igcse_lang_nonfiction' => 'Part 1 — Language Non-Fiction',
            ],
        ],
        'sqa' => [
            'poetry_anthology' => [
                'sqa_duffy' => 'Carol Ann Duffy',
                'sqa_maccaig' => 'Norman MacCaig',
                'sqa_kay' => 'Jackie Kay',
                'sqa_morgan' => 'Edwin Morgan',
                'sqa_n5_collection' => 'National 5 Scottish Poetry Collection',
            ],
        ],
        'ccea' => [
            'language' => [
                'language_u1' => 'Language Unit 1',
                'language_u4' => 'Language Unit 4',
            ],
            'prose' => [
                'about_a_boy' => 'About a Boy',
                'how_many_miles' => 'How Many Miles to Babylon?',
                'tkam' => 'To Kill a Mockingbird',
                'omam' => 'Of Mice and Men',
                'animal_farm' => 'Animal Farm',
                'lord_of_the_flies' => 'Lord of the Flies',
            ],
            'unseen_prose' => [
                'unseen_prose' => 'Unseen Prose',
            ],
            'drama' => [
                'aic' => 'An Inspector Calls',
                'blood_brothers' => 'Blood Brothers',
                'leave_taking' => 'Leave Taking',
                'dna' => 'DNA',
                'taste_of_honey' => 'A Taste of Honey',
                'journeys_end' => "Journey's End",
                'curious_incident_play' => 'The Curious Incident (Play)',
            ],
            'poetry_anthology' => [
                'ccea_identity' => 'Identity',
                'ccea_relationships' => 'Relationships',
                'ccea_conflict' => 'Conflict',
            ],
        ],
        'cambridge-igcse' => [
            'language' => [
                'language_p1' => 'Language Paper 1',
                'language_p2' => 'Language Paper 2',
            ],
            'poetry_anthology' => [
                'songs_ourselves_v1' => 'Songs of Ourselves Vol. 1',
            ],
        ],
    ];

    /**
     * Topic type explanations for Topic 1 teaching points
     */
    private static $topic_types = [
        // Literature types (studied texts with mastery pipeline)
        'protagonist'          => 'Protagonist — The protagonist IS the story. Understanding them means understanding everything else.',
        'central_theme'        => 'Central Theme — This theme is so explicit and powerful that it illuminates all other aspects of the text.',
        'supporting_theme'     => 'Supporting Theme — A secondary theme that deepens understanding when explored alongside central concerns.',
        'supporting_character' => 'Supporting Character — A character whose role illuminates the protagonist or central themes.',
        'theme_and_character'  => 'Theme & Character — An intersection where a theme is best explored through a specific character.',
        // Language types (unseen practice — skill-based)
        'analytical_fiction'      => 'Analytical Fiction — Writing analytically about fiction (e.g. AQA P1 Reading, Edexcel P1 Reading, OCR C2 Reading).',
        'analytical_nonfiction'   => 'Analytical Non-Fiction — Writing analytically about non-fiction (e.g. AQA P2 Reading, Edexcel P2 Reading, OCR C1 Reading).',
        'analytical_poetry'       => 'Analytical Poetry — Writing analytically about poetry (e.g. Edexcel IGCSE Spec A P2 Reading).',
        'creative_fiction'        => 'Creative Fiction — Producing stories, narratives, descriptions (e.g. AQA P1 Writing, EDUQAS C1 Writing).',
        'creative_nonfiction'     => 'Creative Non-Fiction — Producing speeches, letters, articles, reviews (e.g. AQA P2 Writing, CCEA U1 Writing).',
    ];

    private function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('wp_ajax_swml_save_topics', [$this, 'ajax_save_topics']);
        add_action('wp_ajax_swml_load_topics', [$this, 'ajax_load_topics']);
        add_action('wp_ajax_swml_import_topics', [$this, 'ajax_import_topics']);
        add_action('wp_ajax_swml_delete_topic', [$this, 'ajax_delete_topic']);
        add_action('wp_ajax_swml_save_poem', [$this, 'ajax_save_poem']);
        add_action('wp_ajax_swml_delete_poem', [$this, 'ajax_delete_poem']);
        add_action('wp_ajax_swml_import_poems', [$this, 'ajax_import_poems']);
        add_action('wp_ajax_swml_export_all', [$this, 'ajax_export_all']);
        add_action('wp_ajax_swml_import_all', [$this, 'ajax_import_all']);
        add_action('wp_ajax_swml_overview', [$this, 'ajax_overview']);
        add_action('wp_ajax_swml_bulk_import_files', [$this, 'ajax_bulk_import_files']);
    }

    // ═══════════════════════════════════════════
    //  ADMIN MENU
    // ═══════════════════════════════════════════

    public function add_menu() {
        // Use Sophicly hub if available, fall back to Settings
        $parent = class_exists('Sophicly_Admin_Hub') ? 'sophicly' : 'options-general.php';
        add_submenu_page(
            $parent,
            'WML Topic Questions & Poem Bank',
            'WML Topics & Poems',
            'manage_options',
            'sophicly-wml-topics',
            [$this, 'render_page']
        );
    }

    // ═══════════════════════════════════════════
    //  STORAGE HELPERS
    // ═══════════════════════════════════════════

    /**
     * Option key for a board/text combination
     */
    private static function option_key($board, $text) {
        return 'swml_topics_' . sanitize_key($board) . '_' . sanitize_key($text);
    }

    /**
     * Get all topics for a board/text
     */
    public static function get_topics($board, $text) {
        $topics = get_option(self::option_key($board, $text), []);
        if (!is_array($topics)) return [];
        // Sort by topic number
        usort($topics, function($a, $b) { return ($a['topic_number'] ?? 0) - ($b['topic_number'] ?? 0); });
        return $topics;
    }

    /**
     * Get a single topic by number
     */
    public static function get_topic($board, $text, $topic_number) {
        $topics = self::get_topics($board, $text);
        foreach ($topics as $t) {
            if (($t['topic_number'] ?? 0) === (int) $topic_number) return $t;
        }
        return null;
    }

    /**
     * Save all topics for a board/text
     */
    private static function save_topics($board, $text, $topics) {
        update_option(self::option_key($board, $text), $topics, false);
    }

    /**
     * Map text IDs to template filename slugs for cases that don't follow
     * the simple str_replace('_', '-', $text) pattern.
     *
     * v7.14.14: $board param added for Language papers where each board uses
     * different naming (AQA: -p1, EDUQAS: -c1, CCEA: -u1, etc.)
     */
    private static function text_to_template_slug($text, $board = '') {
        // Board-specific language paper mappings (v7.14.14)
        $lang_map = [
            'aqa'             => ['language1' => 'language-p1', 'language2' => 'language-p2'],
            'edexcel'         => ['language1' => 'language-p1', 'language2' => 'language-p2'],
            'eduqas'          => ['language1' => 'language-c1', 'language2' => 'language-c2'],
            'ocr'             => ['language1' => 'language-c1', 'language2' => 'language-c2'],
            'ccea'            => ['language1' => 'language-u1', 'language2' => 'language-u4'],
            'edexcel-igcse'   => ['language1' => 'language-p1', 'language2' => 'language-p2'],
            'cambridge-igcse' => ['language1' => 'language-p1', 'language2' => 'language-p2'],
        ];
        if ($board && isset($lang_map[$board][$text])) {
            return $lang_map[$board][$text];
        }

        $map = [
            'aic'                    => 'inspector-calls',
            'acc'                    => 'christmas-carol',
            'the_tempest'            => 'tempest',
            'merchant_venice'        => 'merchant-of-venice',
            'ccea_identity'          => 'identity',
            'ccea_relationships'     => 'relationships',
            'ccea_conflict'          => 'conflict',
            'sqa_duffy'              => 'duffy',
            'sqa_maccaig'            => 'maccaig',
            'sqa_kay'                => 'kay',
            'sqa_morgan'             => 'morgan',
            'sqa_n5_collection'      => 'n5-collection',
            'curious_incident_play'  => 'curious-incident',
        ];
        if (isset($map[$text])) return $map[$text];
        return str_replace('_', '-', $text);
    }

    /**
     * Auto-import topics from a template markdown file if DB is empty.
     * Returns the imported topics array, or empty array if no template found.
     */
    private static function auto_import_from_template($board, $text) {
        $slug = self::text_to_template_slug($text, $board);
        $board_slug = str_replace('_', '-', $board);
        $template_dir = plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/templates/topics/';
        $file = $template_dir . $board_slug . '-' . $slug . '.md';

        if (!file_exists($file)) return [];

        $markdown = file_get_contents($file);
        if (empty($markdown)) return [];

        $parsed = SWML_Topic_Parser::parse($markdown);
        if (empty($parsed)) return [];

        // Save to DB so subsequent requests are fast
        self::save_topics($board, $text, $parsed);
        return $parsed;
    }

    // ═══════════════════════════════════════════
    //  REST API
    // ═══════════════════════════════════════════

    public function register_rest_routes() {
        register_rest_route('sophicly-wml/v1', '/topic-question', [
            'methods'  => 'GET',
            'callback' => [$this, 'rest_get_topic'],
            'permission_callback' => function() { return is_user_logged_in(); },
        ]);
        register_rest_route('sophicly-wml/v1', '/topic-questions', [
            'methods'  => 'GET',
            'callback' => [$this, 'rest_list_topics'],
            'permission_callback' => function() { return is_user_logged_in(); },
        ]);
        // Poem bank
        register_rest_route('sophicly-wml/v1', '/poems', [
            'methods'  => 'GET',
            'callback' => [$this, 'rest_list_poems'],
            'permission_callback' => function() { return is_user_logged_in(); },
        ]);
    }

    /**
     * GET /topic-question?board=aqa&text=macbeth&topic=1
     */
    public function rest_get_topic($request) {
        $board = sanitize_text_field($request->get_param('board'));
        $text  = sanitize_text_field($request->get_param('text'));
        $topic = absint($request->get_param('topic'));

        if (!$board || !$text || !$topic) {
            return new \WP_Error('missing_params', 'board, text, and topic are required', ['status' => 400]);
        }

        $data = self::get_topic($board, $text, $topic);

        // Auto-import from template file if DB is empty
        if (!$data) {
            $imported = self::auto_import_from_template($board, $text);
            if (!empty($imported)) {
                foreach ($imported as $t) {
                    if (($t['topic_number'] ?? 0) === $topic) { $data = $t; break; }
                }
            }
        }

        if (!$data) {
            return new \WP_Error('not_found', "No question for topic {$topic}", ['status' => 404]);
        }

        return rest_ensure_response($data);
    }

    /**
     * GET /topic-questions?board=aqa&text=macbeth
     */
    public function rest_list_topics($request) {
        $board = sanitize_text_field($request->get_param('board'));
        $text  = sanitize_text_field($request->get_param('text'));

        if (!$board || !$text) {
            return new \WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $topics = self::get_topics($board, $text);

        // Auto-import from template file if DB is empty
        if (empty($topics)) {
            $topics = self::auto_import_from_template($board, $text);
        }

        return rest_ensure_response([
            'board'  => $board,
            'text'   => $text,
            'topics' => $topics,
        ]);
    }

    // ═══════════════════════════════════════════
    //  AJAX HANDLERS
    // ═══════════════════════════════════════════

    /**
     * Load topics via AJAX (admin-ajax.php fallback for REST)
     */
    public function ajax_load_topics() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board = sanitize_text_field($_POST['board'] ?? '');
        $text  = sanitize_text_field($_POST['text'] ?? '');
        if (!$board || !$text) wp_send_json_error('Missing board or text');

        wp_send_json_success([
            'board'  => $board,
            'text'   => $text,
            'topics' => self::get_topics($board, $text),
        ]);
    }

    /**
     * Save a single topic (add or update)
     */
    public function ajax_save_topics() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board = sanitize_text_field($_POST['board'] ?? '');
        $text  = sanitize_text_field($_POST['text'] ?? '');
        if (!$board || !$text) wp_send_json_error('Missing board or text');

        $topic_data = [
            'topic_number'    => absint($_POST['topic_number'] ?? 1),
            'label'           => sanitize_text_field($_POST['label'] ?? ''),
            'topic_type'      => sanitize_text_field($_POST['topic_type'] ?? ''),
            'teaching_point'  => wp_kses_post($_POST['teaching_point'] ?? ''),
            'question_format' => sanitize_text_field($_POST['question_format'] ?? 'single'),
            // Poetry fields (used when format = 'poetry' or 'unseen')
            'focus_poem'      => sanitize_text_field($_POST['focus_poem'] ?? ''),
            'focus_poet'      => sanitize_text_field($_POST['focus_poet'] ?? ''),
            'comparison_poem' => sanitize_text_field($_POST['comparison_poem'] ?? ''),
            'comparison_poet' => sanitize_text_field($_POST['comparison_poet'] ?? ''),
            // Single-question fields (used when format = 'single')
            'question_text'   => wp_kses_post($_POST['question_text'] ?? ''),
            'extract_text'    => wp_kses_post($_POST['extract_text'] ?? ''),
            'extract_location'=> sanitize_text_field($_POST['extract_location'] ?? ''),
            'marks'           => absint($_POST['marks'] ?? 30),
            'aos'             => sanitize_text_field($_POST['aos'] ?? 'AO1,AO2,AO3'),
            // Part A fields (extract question, used when format = 'dual')
            'part_a_question' => wp_kses_post($_POST['part_a_question'] ?? ''),
            'part_a_extract'  => wp_kses_post($_POST['part_a_extract'] ?? ''),
            'part_a_extract_location' => sanitize_text_field($_POST['part_a_extract_location'] ?? ''),
            'part_a_marks'    => absint($_POST['part_a_marks'] ?? 15),
            'part_a_aos'      => sanitize_text_field($_POST['part_a_aos'] ?? 'AO1,AO2'),
            // Part B fields (whole text question, used when format = 'dual')
            'part_b_question' => wp_kses_post($_POST['part_b_question'] ?? ''),
            'part_b_extract'  => wp_kses_post($_POST['part_b_extract'] ?? ''),
            'part_b_marks'    => absint($_POST['part_b_marks'] ?? 25),
            'part_b_aos'      => sanitize_text_field($_POST['part_b_aos'] ?? 'AO1,AO2,AO4'),
            // v3.0 fields
            'context'         => wp_kses_post($_POST['context'] ?? ''),
            'instruction'     => wp_kses_post($_POST['instruction'] ?? ''),
            'intro'           => wp_kses_post($_POST['intro'] ?? ''),
            'metadata'        => wp_kses_post($_POST['metadata'] ?? '{}'),
            'task'            => sanitize_text_field($_POST['task'] ?? 'planning'),
            'updated_at'      => current_time('mysql'),
        ];

        $topics = self::get_topics($board, $text);
        $found = false;
        foreach ($topics as &$t) {
            if (($t['topic_number'] ?? 0) === $topic_data['topic_number']) {
                $t = $topic_data;
                $found = true;
                break;
            }
        }
        if (!$found) $topics[] = $topic_data;

        self::save_topics($board, $text, $topics);
        wp_send_json_success(['message' => 'Topic ' . $topic_data['topic_number'] . ' saved', 'count' => count($topics)]);
    }

    /**
     * Delete a topic
     */
    public function ajax_delete_topic() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board = sanitize_text_field($_POST['board'] ?? '');
        $text  = sanitize_text_field($_POST['text'] ?? '');
        $topic_number = absint($_POST['topic_number'] ?? 0);

        $topics = self::get_topics($board, $text);
        $topics = array_filter($topics, function($t) use ($topic_number) {
            return ($t['topic_number'] ?? 0) !== $topic_number;
        });
        // Re-index
        $topics = array_values($topics);

        self::save_topics($board, $text, $topics);
        wp_send_json_success(['message' => "Topic {$topic_number} deleted", 'count' => count($topics)]);
    }

    /**
     * Import topics from markdown
     * 
     * Expected format:
     * # Topic 1: Macbeth's Ambition
     * **Type:** protagonist
     * **Task:** planning
     * **Marks:** 30
     * **AOs:** AO1, AO2, AO3, AO4
     * **Extract Location:** Act 1 Scene 7
     * **Teaching Point:** We start with the protagonist because...
     * 
     * ## Extract
     * "Is this a dagger which I see before me..."
     * 
     * ## Question
     * Starting with this extract, how does Shakespeare present Macbeth's ambition?
     * 
     * ---
     * 
     * # Topic 2: Lady Macbeth & Power
     * ...
     */
    public function ajax_import_topics() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board    = sanitize_text_field($_POST['board'] ?? '');
        $text     = sanitize_text_field($_POST['text'] ?? '');
        $markdown = wp_unslash($_POST['markdown'] ?? '');
        $mode     = sanitize_text_field($_POST['import_mode'] ?? 'merge'); // merge or replace

        if (!$board || !$text || !$markdown) {
            wp_send_json_error('Missing board, text, or markdown content');
        }

        $parsed = self::parse_markdown_topics($markdown);
        if (empty($parsed)) {
            wp_send_json_error('No topics found in markdown. Use "# Topic N: Label" headings.');
        }

        if ($mode === 'replace') {
            $topics = $parsed;
        } else {
            // Merge: new topics overwrite existing by topic_number
            $existing = self::get_topics($board, $text);
            $by_number = [];
            foreach ($existing as $t) $by_number[$t['topic_number']] = $t;
            foreach ($parsed as $t) $by_number[$t['topic_number']] = $t;
            $topics = array_values($by_number);
        }

        self::save_topics($board, $text, $topics);
        wp_send_json_success([
            'message' => count($parsed) . ' topics imported (' . $mode . ')',
            'count'   => count($topics),
            'imported' => count($parsed),
        ]);
    }

    /**
     * Parse markdown into topic array
     * 
     * Delegates to SWML_Topic_Parser v3.0 which handles 56+ format patterns.
     * See class-topic-parser.php for full format documentation.
     */
    private static function parse_markdown_topics($markdown) {
        return SWML_Topic_Parser::parse($markdown);
    }

    // ═══════════════════════════════════════════
    //  POEM BANK
    // ═══════════════════════════════════════════

    /**
     * Poem bank option key
     */
    private static function poems_key($board, $anthology) {
        return 'swml_poems_' . sanitize_key($board) . '_' . sanitize_key($anthology);
    }

    /**
     * Get all poems for a board/anthology
     */
    public static function get_poems($board, $anthology) {
        $poems = get_option(self::poems_key($board, $anthology), []);
        if (!is_array($poems)) return [];
        return $poems;
    }

    /**
     * Save all poems for a board/anthology
     */
    private static function save_poems($board, $anthology, $poems) {
        update_option(self::poems_key($board, $anthology), $poems, false);
    }

    /**
     * REST: GET /poems?board=aqa&anthology=power_conflict
     */
    public function rest_list_poems($request) {
        $board     = sanitize_text_field($request->get_param('board'));
        $anthology = sanitize_text_field($request->get_param('anthology'));

        if (!$board || !$anthology) {
            return new \WP_Error('missing_params', 'board and anthology are required', ['status' => 400]);
        }

        return rest_ensure_response([
            'board'     => $board,
            'anthology' => $anthology,
            'poems'     => self::get_poems($board, $anthology),
        ]);
    }

    /**
     * AJAX: Save a single poem
     */
    public function ajax_save_poem() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board     = sanitize_text_field($_POST['board'] ?? '');
        $anthology = sanitize_text_field($_POST['anthology'] ?? '');
        if (!$board || !$anthology) wp_send_json_error('Missing board or anthology');

        $poem_data = [
            'id'        => sanitize_key($_POST['poem_id'] ?? ''),
            'title'     => sanitize_text_field($_POST['title'] ?? ''),
            'poet'      => sanitize_text_field($_POST['poet'] ?? ''),
            'poem_text' => wp_kses_post($_POST['poem_text'] ?? ''),
        ];
        if (!$poem_data['id']) $poem_data['id'] = sanitize_key(strtolower(str_replace(' ', '_', $poem_data['title'])));

        $poems = self::get_poems($board, $anthology);
        $found = false;
        foreach ($poems as &$p) {
            if ($p['id'] === $poem_data['id']) { $p = $poem_data; $found = true; break; }
        }
        if (!$found) $poems[] = $poem_data;

        self::save_poems($board, $anthology, $poems);
        wp_send_json_success(['message' => 'Poem saved', 'count' => count($poems)]);
    }

    /**
     * AJAX: Delete a poem
     */
    public function ajax_delete_poem() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board     = sanitize_text_field($_POST['board'] ?? '');
        $anthology = sanitize_text_field($_POST['anthology'] ?? '');
        $poem_id   = sanitize_key($_POST['poem_id'] ?? '');

        $poems = self::get_poems($board, $anthology);
        $poems = array_values(array_filter($poems, function($p) use ($poem_id) { return ($p['id'] ?? '') !== $poem_id; }));

        self::save_poems($board, $anthology, $poems);
        wp_send_json_success(['message' => 'Poem deleted', 'count' => count($poems)]);
    }

    /**
     * AJAX: Bulk import poems
     * 
     * Simple format (no poem text): Title | Poet (one per line)
     * Full format (with poem text):
     *   # Title | Poet
     *   Poem text line 1
     *   Poem text line 2
     *   ...
     *   # Next Title | Next Poet
     *   ...
     */
    public function ajax_import_poems() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorised');

        $board     = sanitize_text_field($_POST['board'] ?? '');
        $anthology = sanitize_text_field($_POST['anthology'] ?? '');
        $raw       = wp_unslash($_POST['poems_text'] ?? '');
        $mode      = sanitize_text_field($_POST['import_mode'] ?? 'merge');

        if (!$board || !$anthology || !$raw) wp_send_json_error('Missing data');

        $parsed = [];

        // Detect format: if any line starts with #, use full format
        if (preg_match('/^#\s/m', $raw)) {
            // Full format: split on # headings
            $blocks = preg_split('/^#\s+/m', $raw, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($blocks as $block) {
                $lines = explode("\n", trim($block));
                $header = trim(array_shift($lines));
                // Prioritise | as delimiter (titles like "If—" contain em dashes)
                if (strpos($header, '|') !== false) {
                    $parts = explode('|', $header, 2);
                } else {
                    $parts = preg_split('/\s*[—–]\s*/', $header, 2);
                }
                $title = trim($parts[0] ?? '');
                $poet  = trim($parts[1] ?? '');
                if (!$title) continue;
                $poem_text = trim(implode("\n", $lines));
                $id = sanitize_key(strtolower(preg_replace('/\s+/', '_', preg_replace('/[^a-zA-Z0-9\s]/', '', $title))));
                $parsed[] = ['id' => $id, 'title' => $title, 'poet' => $poet, 'poem_text' => $poem_text];
            }
        } else {
            // Simple format: one per line
            foreach (explode("\n", $raw) as $line) {
                $line = trim($line);
                if (!$line) continue;
                // Prioritise | as delimiter (titles like "If—" contain em dashes)
                if (strpos($line, '|') !== false) {
                    $parts = explode('|', $line, 2);
                } else {
                    $parts = preg_split('/\s*[—–-]\s*/', $line, 2);
                }
                $title = trim($parts[0] ?? '');
                $poet  = trim($parts[1] ?? '');
                if (!$title) continue;
                $id = sanitize_key(strtolower(preg_replace('/\s+/', '_', preg_replace('/[^a-zA-Z0-9\s]/', '', $title))));
                $parsed[] = ['id' => $id, 'title' => $title, 'poet' => $poet, 'poem_text' => ''];
            }
        }

        if (empty($parsed)) wp_send_json_error('No poems found. Use "Title | Poet" or "# Title | Poet" format.');

        if ($mode === 'replace') {
            $poems = $parsed;
        } else {
            $existing = self::get_poems($board, $anthology);
            $by_id = [];
            foreach ($existing as $p) $by_id[$p['id']] = $p;
            foreach ($parsed as $p) {
                // Merge: keep existing poem_text if new one is empty
                if (empty($p['poem_text']) && isset($by_id[$p['id']]['poem_text'])) {
                    $p['poem_text'] = $by_id[$p['id']]['poem_text'];
                }
                $by_id[$p['id']] = $p;
            }
            $poems = array_values($by_id);
        }

        self::save_poems($board, $anthology, $poems);
        wp_send_json_success(['message' => count($parsed) . ' poems imported', 'count' => count($poems)]);
    }

    // ═══════════════════════════════════════════
    //  EXPORT / IMPORT ALL DATA
    // ═══════════════════════════════════════════

    /**
     * Export all topics + poems as JSON download.
     * Gathers every swml_topics_* and swml_poems_* option from the database.
     */
    /**
     * Return topic counts for ALL board/text combinations (v7.13.18 overview panel).
     */
    public function ajax_overview() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorized');

        global $wpdb;

        // Fetch all topic option keys and their sizes in one query.
        $rows = $wpdb->get_results(
            "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'swml_topics_%'",
            ARRAY_A
        );

        $counts = [];
        foreach ($rows as $row) {
            $val = maybe_unserialize($row['option_value']);
            if (is_array($val)) {
                // Key format: swml_topics_{board}_{text}
                $key = str_replace('swml_topics_', '', $row['option_name']);
                $counts[$key] = count($val);
            }
        }

        // Build overview grouped by board → subject → text with counts.
        $overview = [];
        $total_texts = 0;
        $total_topics = 0;
        $populated = 0;

        foreach (self::$text_catalogue as $board => $subjects) {
            foreach ($subjects as $subject => $texts) {
                foreach ($texts as $slug => $label) {
                    $total_texts++;
                    $option_key = sanitize_key($board) . '_' . sanitize_key($slug);
                    $count = $counts[$option_key] ?? 0;
                    $total_topics += $count;
                    if ($count > 0) $populated++;

                    $overview[] = [
                        'board'   => $board,
                        'subject' => $subject,
                        'slug'    => $slug,
                        'label'   => $label,
                        'count'   => $count,
                    ];
                }
            }
        }

        wp_send_json_success([
            'items'        => $overview,
            'total_texts'  => $total_texts,
            'total_topics' => $total_topics,
            'populated'    => $populated,
        ]);
    }

    /**
     * Bulk import all topic files from protocols/shared/templates/topics/.
     * Reads each .md file, maps filename to board/text slug, parses and saves.
     */
    public function ajax_bulk_import_files() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorized');

        $dir = plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/templates/topics/';
        if (!is_dir($dir)) {
            wp_send_json_error('Topics directory not found: ' . $dir);
        }

        // Known aliases: filename slug → catalogue slug
        $aliases = [
            'christmas_carol' => 'acc',
            'inspector_calls' => 'aic',
            'tempest'         => 'the_tempest',
        ];
        // Board-specific prefix aliases
        $board_prefix_aliases = [
            'sqa'    => ['duffy' => 'sqa_duffy', 'maccaig' => 'sqa_maccaig', 'kay' => 'sqa_kay', 'morgan' => 'sqa_morgan'],
            'ccea'   => ['identity' => 'ccea_identity', 'relationships' => 'ccea_relationships', 'conflict' => 'ccea_conflict'],
            'eduqas' => ['poetry' => 'eduqas_poetry'],
        ];
        // Board prefixes in order (longest first to match edexcel-igcse before edexcel)
        $board_prefixes = ['cambridge-igcse', 'edexcel-igcse', 'edexcel', 'eduqas', 'aqa', 'ocr', 'sqa', 'ccea'];

        // Build slug lookup from catalogue
        $slug_lookup = [];
        foreach (self::$text_catalogue as $board => $subjects) {
            foreach ($subjects as $subject => $texts) {
                foreach ($texts as $slug => $label) {
                    $slug_lookup[$board . '/' . $slug] = true;
                }
            }
        }

        $files = glob($dir . '*.md');
        $results = ['imported' => [], 'skipped' => [], 'failed' => []];

        foreach ($files as $filepath) {
            $filename = basename($filepath, '.md');

            // Determine board and text part
            $board = null;
            $text_part = null;
            foreach ($board_prefixes as $prefix) {
                if (strpos($filename, $prefix . '-') === 0) {
                    $board = $prefix;
                    $text_part = substr($filename, strlen($prefix) + 1);
                    break;
                }
            }
            if (!$board || !$text_part) {
                $results['skipped'][] = $filename . '.md — unknown board';
                continue;
            }

            // Convert kebab to snake
            $slug = str_replace('-', '_', $text_part);

            // Apply board-specific prefix aliases
            if (isset($board_prefix_aliases[$board][$slug])) {
                $slug = $board_prefix_aliases[$board][$slug];
            }
            // Apply generic aliases
            if (isset($aliases[$slug])) {
                $slug = $aliases[$slug];
            }

            // Verify slug exists in catalogue
            if (!isset($slug_lookup[$board . '/' . $slug])) {
                $results['skipped'][] = $filename . '.md — slug "' . $slug . '" not in catalogue for ' . $board;
                continue;
            }

            // Read and parse file
            $markdown = file_get_contents($filepath);
            if (empty($markdown)) {
                $results['failed'][] = $filename . '.md — empty file';
                continue;
            }

            $parsed = self::parse_markdown_topics($markdown);
            if (empty($parsed)) {
                $results['failed'][] = $filename . '.md — parser returned 0 topics';
                continue;
            }

            // Save (replace mode — fresh import)
            self::save_topics($board, $slug, $parsed);
            $results['imported'][] = [
                'file'  => $filename . '.md',
                'board' => $board,
                'text'  => $slug,
                'count' => count($parsed),
            ];
        }

        wp_send_json_success([
            'imported_count' => count($results['imported']),
            'skipped_count'  => count($results['skipped']),
            'failed_count'   => count($results['failed']),
            'total_topics'   => array_sum(array_column($results['imported'], 'count')),
            'details'        => $results,
        ]);
    }

    public function ajax_export_all() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorized');

        global $wpdb;

        // Gather all topic options
        $topic_rows = $wpdb->get_results(
            "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'swml_topics_%'",
            ARRAY_A
        );
        $topics = [];
        foreach ($topic_rows as $row) {
            $val = maybe_unserialize($row['option_value']);
            if (is_array($val) && !empty($val)) {
                $topics[$row['option_name']] = $val;
            }
        }

        // Gather all poem options
        $poem_rows = $wpdb->get_results(
            "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'swml_poems_%'",
            ARRAY_A
        );
        $poems = [];
        foreach ($poem_rows as $row) {
            $val = maybe_unserialize($row['option_value']);
            if (is_array($val) && !empty($val)) {
                $poems[$row['option_name']] = $val;
            }
        }

        $export = [
            'plugin'      => 'sophicly-writing-mastery-lab',
            'version'     => SWML_VERSION,
            'exported_at' => current_time('mysql'),
            'site_url'    => get_site_url(),
            'topics'      => $topics,
            'poems'       => $poems,
        ];

        wp_send_json_success($export);
    }

    /**
     * Import topics + poems from JSON.
     * Supports merge (add new, skip existing) and replace (overwrite all) modes.
     */
    public function ajax_import_all() {
        check_ajax_referer('swml_topics_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorized');

        $json = stripslashes($_POST['data'] ?? '');
        $data = json_decode($json, true);

        if (!$data || !is_array($data)) {
            wp_send_json_error('Invalid JSON data');
        }

        if (empty($data['topics']) && empty($data['poems'])) {
            wp_send_json_error('No topics or poems found in import file');
        }

        $mode = sanitize_text_field($_POST['mode'] ?? 'merge'); // 'merge' or 'replace'
        $stats = ['topics_keys' => 0, 'topics_items' => 0, 'poems_keys' => 0, 'poems_items' => 0, 'skipped' => 0];

        // Import topics
        if (!empty($data['topics']) && is_array($data['topics'])) {
            foreach ($data['topics'] as $key => $items) {
                // Validate key format: swml_topics_{board}_{text}
                if (strpos($key, 'swml_topics_') !== 0) continue;
                if (!is_array($items)) continue;

                if ($mode === 'replace') {
                    update_option($key, $items, false);
                    $stats['topics_keys']++;
                    $stats['topics_items'] += count($items);
                } else {
                    // Merge: add items that don't already exist (by topic_number)
                    $existing = get_option($key, []);
                    if (!is_array($existing)) $existing = [];
                    $existing_nums = array_column($existing, 'topic_number');

                    $added = 0;
                    foreach ($items as $item) {
                        $num = $item['topic_number'] ?? null;
                        if ($num && in_array($num, $existing_nums)) {
                            $stats['skipped']++;
                            continue;
                        }
                        $existing[] = $item;
                        $added++;
                    }
                    if ($added > 0) {
                        update_option($key, $existing, false);
                        $stats['topics_keys']++;
                        $stats['topics_items'] += $added;
                    }
                }
            }
        }

        // Import poems
        if (!empty($data['poems']) && is_array($data['poems'])) {
            foreach ($data['poems'] as $key => $items) {
                // Validate key format: swml_poems_{board}_{anthology}
                if (strpos($key, 'swml_poems_') !== 0) continue;
                if (!is_array($items)) continue;

                if ($mode === 'replace') {
                    update_option($key, $items, false);
                    $stats['poems_keys']++;
                    $stats['poems_items'] += count($items);
                } else {
                    // Merge: add poems that don't already exist (by title)
                    $existing = get_option($key, []);
                    if (!is_array($existing)) $existing = [];
                    $existing_titles = array_map('strtolower', array_column($existing, 'title'));

                    $added = 0;
                    foreach ($items as $item) {
                        $title = strtolower($item['title'] ?? '');
                        if ($title && in_array($title, $existing_titles)) {
                            $stats['skipped']++;
                            continue;
                        }
                        $existing[] = $item;
                        $added++;
                    }
                    if ($added > 0) {
                        update_option($key, $existing, false);
                        $stats['poems_keys']++;
                        $stats['poems_items'] += $added;
                    }
                }
            }
        }

        $msg = sprintf(
            'Imported %d topic sets (%d questions) and %d poem sets (%d poems). %d items skipped (already exist).',
            $stats['topics_keys'], $stats['topics_items'],
            $stats['poems_keys'], $stats['poems_items'],
            $stats['skipped']
        );

        wp_send_json_success(['message' => $msg, 'stats' => $stats]);
    }

    // ═══════════════════════════════════════════
    //  ADMIN PAGE RENDER
    // ═══════════════════════════════════════════

    public function render_page() {
        $catalogue = self::$text_catalogue;
        $nonce = wp_create_nonce('swml_topics_nonce');
        ?>
        <div class="wrap" id="swml-topics-app">
            <h1>📚 WML Topic Question Bank</h1>
            <p class="description">Manage fixed questions for Mastery Programme topics. These questions are served to students when they enter a specific topic in the programme.</p>

            <!-- Overview Panel (v7.13.18) -->
            <div id="tq-overview" style="margin:20px 0 30px;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f7f7ff;border-bottom:1px solid #eee;">
                    <h3 style="margin:0;font-size:14px;">Topic Coverage Overview</h3>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div id="tq-overview-stats" style="font-size:12px;color:#666;">Loading...</div>
                        <button class="button button-primary" id="tq-bulk-import-btn" style="font-size:12px;padding:4px 12px;">Import All from Files</button>
                    </div>
                </div>
                <div id="tq-overview-body" style="max-height:400px;overflow-y:auto;padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <thead><tr style="background:#f9f9f9;position:sticky;top:0;z-index:1;">
                            <th style="text-align:left;padding:6px 12px;border-bottom:1px solid #eee;">Board</th>
                            <th style="text-align:left;padding:6px 12px;border-bottom:1px solid #eee;">Subject</th>
                            <th style="text-align:left;padding:6px 12px;border-bottom:1px solid #eee;">Text</th>
                            <th style="text-align:center;padding:6px 12px;border-bottom:1px solid #eee;width:80px;">Topics</th>
                            <th style="text-align:center;padding:6px 12px;border-bottom:1px solid #eee;width:60px;">Status</th>
                        </tr></thead>
                        <tbody id="tq-overview-rows"></tbody>
                    </table>
                </div>
            </div>

            <style>
                #swml-topics-app { max-width: 960px; }
                .swml-tq-selector { display: flex; gap: 12px; align-items: end; margin: 20px 0; flex-wrap: wrap; }
                .swml-tq-selector label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; font-size: 13px; }
                .swml-tq-selector select { min-width: 180px; padding: 6px 10px; }
                .swml-tq-topic-list { margin-top: 20px; }
                .swml-tq-topic-card { background: #fff; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 4px; overflow: hidden; }
                .swml-tq-topic-card.editing { border-color: #5333ed; box-shadow: 0 0 0 1px #5333ed; }
                .swml-tq-topic-header { display: flex; align-items: center; gap: 8px; padding: 8px 14px; cursor: pointer; user-select: none; transition: background 0.15s; }
                .swml-tq-topic-header:hover { background: #f7f7ff; }
                .swml-tq-topic-chevron { font-size: 10px; color: #999; transition: transform 0.2s; flex-shrink: 0; }
                .swml-tq-topic-card.open .swml-tq-topic-chevron { transform: rotate(90deg); }
                .swml-tq-topic-num { display: inline-flex; align-items: center; justify-content: center; background: #5333ed; color: #fff; border-radius: 50%; width: 22px; height: 22px; font-weight: 700; font-size: 10px; flex-shrink: 0; }
                .swml-tq-topic-label { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
                .swml-tq-topic-badges { display: flex; gap: 4px; flex-shrink: 0; margin-left: auto; align-items: center; }
                .swml-tq-badge { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 500; white-space: nowrap; }
                .swml-tq-badge-type { background: #f0e6ff; color: #5333ed; }
                .swml-tq-badge-marks { background: #e8f5e9; color: #2e7d32; }
                .swml-tq-badge-format { background: #e3f2fd; color: #1565c0; }
                .swml-tq-badge-loc { background: #fff3e0; color: #e65100; }
                .swml-tq-topic-body { display: none; padding: 0 14px 14px 48px; border-top: 1px solid #eee; }
                .swml-tq-topic-card.open .swml-tq-topic-body { display: block; }
                .swml-tq-topic-meta { color: #666; font-size: 12px; margin-top: 8px; }
                .swml-tq-topic-question { margin-top: 8px; padding: 10px; background: #f7f7f7; border-radius: 4px; font-size: 12px; white-space: pre-wrap; max-height: 150px; overflow-y: auto; line-height: 1.5; }
                .swml-tq-topic-actions { display: flex; gap: 6px; margin-top: 10px; }
                .swml-tq-topic-actions button { font-size: 12px; }
                .swml-tq-empty { padding: 40px; text-align: center; color: #888; background: #f9f9f9; border-radius: 8px; }
                .swml-tq-form { background: #f9f9f9; border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin: 12px 0; }
                .swml-tq-form label { display: block; margin-bottom: 12px; font-weight: 600; font-size: 13px; }
                .swml-tq-form label span { display: block; margin-bottom: 4px; }
                .swml-tq-form input[type="text"], .swml-tq-form input[type="number"], .swml-tq-form select { width: 100%; padding: 6px 10px; }
                .swml-tq-form textarea { width: 100%; min-height: 80px; padding: 8px 10px; font-family: monospace; font-size: 13px; }
                .swml-tq-form .row { display: flex; gap: 12px; }
                .swml-tq-form .row > label { flex: 1; }
                .swml-tq-import { margin-top: 30px; padding: 20px; background: #f0f0f5; border: 1px dashed #999; border-radius: 8px; }
                .swml-tq-import textarea { width: 100%; min-height: 200px; font-family: monospace; font-size: 12px; }
                .swml-tq-teaching-point { display: none; }
                .swml-tq-teaching-point.visible { display: block; }
                .swml-tq-stats { display: flex; gap: 20px; margin: 10px 0 20px; }
                .swml-tq-stat { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; text-align: center; }
                .swml-tq-stat strong { display: block; font-size: 24px; color: #5333ed; }
                .swml-tq-stat span { font-size: 11px; color: #888; }
                .swml-tq-shortcode { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 6px 10px; background: #f0f0f5; border-radius: 4px; font-size: 11px; }
                .swml-tq-shortcode code { flex: 1; word-break: break-all; background: none; padding: 0; font-size: 11px; color: #333; }
                .swml-tq-bulk-sc { margin-top: 24px; padding: 20px; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
                .swml-tq-bulk-sc h3 { margin-top: 0; }
            </style>

            <!-- Selector -->
            <div class="swml-tq-selector">
                <label>
                    <span>Exam Board</span>
                    <select id="tq-board">
                        <option value="">— Select board —</option>
                        <?php foreach ($catalogue as $board => $subjects): ?>
                            <option value="<?php echo esc_attr($board); ?>"><?php echo esc_html(strtoupper(str_replace('-', ' ', $board))); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>
                    <span>Subject</span>
                    <select id="tq-subject" disabled><option value="">— Select board first —</option></select>
                </label>
                <label>
                    <span>Text</span>
                    <select id="tq-text" disabled><option value="">— Select subject first —</option></select>
                </label>
                <button class="button button-primary" id="tq-load" disabled>Load Topics</button>
            </div>

            <!-- Topic List -->
            <div id="tq-content"></div>

            <!-- Import Section -->
            <div class="swml-tq-import" id="tq-import" style="display:none;">
                <h3>📥 Import from Markdown</h3>
                <p class="description">Paste a markdown document with topic headings. Format: <code># Topic 1: Label</code> followed by metadata and content blocks.</p>
                <textarea id="tq-import-md" placeholder="# Topic 1: Macbeth's Ambition&#10;**Type:** protagonist&#10;**Marks:** 30&#10;**AOs:** AO1, AO2, AO3, AO4&#10;**Extract Location:** Act 1 Scene 7&#10;**Teaching Point:** We start with the protagonist because...&#10;&#10;## Extract&#10;&quot;Is this a dagger which I see before me...&quot;&#10;&#10;## Question&#10;Starting with this extract, how does Shakespeare present Macbeth's ambition?&#10;&#10;---&#10;&#10;# Topic 2: Lady Macbeth &amp; Power&#10;..."></textarea>
                <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                    <select id="tq-import-mode">
                        <option value="merge">Merge (add/update, keep others)</option>
                        <option value="replace">Replace all topics</option>
                    </select>
                    <button class="button button-primary" id="tq-import-btn">Import</button>
                    <span id="tq-import-status"></span>
                </div>
            </div>

            <!-- ═══════════════════════════════════════════ -->
            <!--  SHORTCODE GENERATOR                        -->
            <!-- ═══════════════════════════════════════════ -->
            <div style="margin-top:40px; border-top: 2px solid #ddd; padding-top: 30px;">
                <h2>🔗 Shortcode Generator</h2>
                <p class="description">Copy-paste shortcodes for every WML entry point. Use these in LearnDash units, lessons, or any WordPress page. Each generates a branded button.</p>

                <div id="sc-gen" class="swml-sc-gen"></div>
            </div>
        </div>

        <style>
            /* Shortcode generator styles */
            .swml-sc-gen details { margin-bottom: 8px; }
            .swml-sc-gen summary { cursor: pointer; font-weight: 600; font-size: 14px; padding: 10px 14px; background: #f7f7f7; border: 1px solid #ddd; border-radius: 6px; user-select: none; }
            .swml-sc-gen summary:hover { background: #f0f0f5; }
            .swml-sc-gen details[open] > summary { border-radius: 6px 6px 0 0; border-bottom: 1px dashed #ccc; }
            .swml-sc-gen .sc-group { padding: 12px 14px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 6px 6px; background: #fff; }
            .swml-sc-gen .sc-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f0f0f0; }
            .swml-sc-gen .sc-row:last-child { border-bottom: none; }
            .swml-sc-gen .sc-label { min-width: 200px; font-size: 12px; color: #555; }
            .swml-sc-gen .sc-code { flex: 1; font-family: monospace; font-size: 11px; color: #333; word-break: break-all; background: #f9f9f9; padding: 4px 8px; border-radius: 3px; }
            .swml-sc-gen .sc-copy { font-size: 11px; white-space: nowrap; }
            .swml-sc-gen .sc-copy.copied { color: #46b450; }
            .swml-sc-gen .sc-section-title { font-weight: 700; font-size: 13px; margin: 14px 0 6px; color: #5333ed; }
            .swml-sc-gen .sc-section-title:first-child { margin-top: 0; }
        </style>

            <!-- ═══════════════════════════════════════════ -->
            <!--  TEXT BANK (Poems, Prose, Non-Fiction)      -->
            <!-- ═══════════════════════════════════════════ -->
            <div style="margin-top:40px; border-top: 2px solid #ddd; padding-top: 30px;">
                <h2>📝 Anthology — Text Bank</h2>
                <p class="description">Manage which texts (poems, prose, non-fiction) are available in each anthology. Students will pick from this list when starting conceptual notes.</p>

                <!-- Overview: what's been imported (expandable with inline editing) -->
                <div id="pb-overview" style="margin:16px 0 24px; padding:16px; background:#f9f9fb; border:1px solid #e0e0e5; border-radius:8px;">
                    <h3 style="margin:0 0 12px; font-size:14px; color:#333; display:flex; align-items:center; gap:10px;">📊 Text Bank Overview <span style="font-weight:normal;font-size:12px;color:#888;">— click a row to view/edit texts</span> <button class="button button-small" onclick="window.location.hash='pb-overview';window.location.reload();" style="font-size:11px;">🔄 Refresh</button></h3>
                    <table class="widefat" style="max-width:900px;" id="pb-overview-table">
                        <thead><tr><th style="width:20px;"></th><th>Board</th><th>Anthology</th><th>Type</th><th style="text-align:center;">Texts</th></tr></thead>
                        <tbody>
                        <?php
                        $anthology_types = [
                            'poetry_anthology'     => '✒️ Poetry',
                            'prose_anthology'      => '📕 Prose',
                            'nonfiction_anthology' => '📰 Non-Fiction',
                        ];
                        $total_texts = 0;
                        $overview_data = []; // collect for JS
                        foreach ($catalogue as $board => $subjects) {
                            foreach ($anthology_types as $type_key => $type_label) {
                                if (!isset($subjects[$type_key])) continue;
                                foreach ($subjects[$type_key] as $anth_key => $anth_label) {
                                    $poems = self::get_poems($board, $anth_key);
                                    $count = count($poems);
                                    $total_texts += $count;
                                    $overview_data[] = [
                                        'board' => $board,
                                        'anthology' => $anth_key,
                                        'label' => $anth_label,
                                        'type' => $type_label,
                                        'poems' => $poems,
                                    ];
                                    $badge = $count > 0
                                        ? '<span style="background:#46b450;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;">' . $count . '</span>'
                                        : '<span style="background:#d63638;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">0</span>';
                                    $row_id = esc_attr($board . '__' . $anth_key);
                                    echo '<tr class="pb-ov-row" data-row="' . $row_id . '" style="cursor:pointer;">';
                                    echo '<td class="pb-ov-arrow" style="font-size:11px;color:#999;">▶</td>';
                                    echo '<td>' . esc_html(strtoupper(str_replace('-', ' ', $board))) . '</td>';
                                    echo '<td>' . esc_html($anth_label) . '</td>';
                                    echo '<td>' . $type_label . '</td>';
                                    echo '<td style="text-align:center;">' . $badge . '</td>';
                                    echo '</tr>';
                                    echo '<tr class="pb-ov-detail" data-row="' . $row_id . '" style="display:none;">';
                                    echo '<td colspan="5" style="padding:0;"><div class="pb-ov-detail-inner" data-board="' . esc_attr($board) . '" data-anthology="' . esc_attr($anth_key) . '" style="padding:10px 16px 14px; background:#fff; border-top:1px solid #e8e8ec;"></div></td>';
                                    echo '</tr>';
                                }
                            }
                        }
                        ?>
                        </tbody>
                    </table>
                    <p style="margin:10px 0 0; font-size:12px; color:#666;">Total: <strong><?php echo $total_texts; ?> texts</strong> across all boards and anthologies.</p>
                </div>
                <script>
                // Pre-loaded overview data for expandable rows
                var pbOverviewData = <?php echo wp_json_encode($overview_data); ?>;
                </script>
                <style>
                    .pb-ov-row:hover { background: #f0f0f5; }
                    .pb-ov-row.open .pb-ov-arrow { color: #5333ed; }
                    .pb-ov-detail-inner table.pb-ov-texts { width: 100%; border-collapse: collapse; font-size: 13px; }
                    .pb-ov-detail-inner table.pb-ov-texts th { text-align: left; font-size: 11px; color: #666; padding: 4px 8px; border-bottom: 1px solid #e0e0e5; }
                    .pb-ov-detail-inner table.pb-ov-texts td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; }
                    .pb-ov-detail-inner table.pb-ov-texts td input { width: 100%; padding: 3px 6px; font-size: 13px; border: 1px solid #ccc; border-radius: 3px; }
                    .pb-ov-detail-inner .pb-ov-empty { color: #999; font-style: italic; font-size: 13px; }
                    .pb-ov-detail-inner .pb-ov-save { font-size: 11px; color: #46b450; cursor: pointer; font-weight: 600; }
                    .pb-ov-detail-inner .pb-ov-save:hover { text-decoration: underline; }
                    .pb-ov-detail-inner .pb-ov-del { font-size: 11px; color: #d63638; cursor: pointer; }
                    .pb-ov-detail-inner .pb-ov-del:hover { text-decoration: underline; }
                </style>

                <div class="swml-tq-selector">
                    <label><span>Board</span>
                        <select id="pb-board">
                            <option value="">— Select —</option>
                            <?php foreach ($catalogue as $board => $subjects):
                                $has_anthology = isset($subjects['poetry_anthology']) || isset($subjects['prose_anthology']) || isset($subjects['nonfiction_anthology']);
                                if ($has_anthology): ?>
                                <option value="<?php echo esc_attr($board); ?>"><?php echo esc_html(strtoupper(str_replace('-', ' ', $board))); ?></option>
                            <?php endif; endforeach; ?>
                        </select>
                    </label>
                    <label><span>Anthology</span>
                        <select id="pb-anthology" disabled><option value="">— Select board first —</option></select>
                    </label>
                    <button class="button button-primary" id="pb-load" disabled>Load Texts</button>
                </div>

                <div id="pb-content"></div>

                <div id="pb-import" style="display:none; margin-top:16px; padding:16px; background:#f0f0f5; border:1px dashed #999; border-radius:8px;">
                    <h4 style="margin-top:0;">📥 Bulk Import Texts</h4>
                    <p class="description">Simple format: <code>Title | Author</code> (one per line). Full format with text content: <code># Title | Author</code> followed by the text content until the next <code>#</code> heading.</p>
                    <textarea id="pb-import-text" style="width:100%;min-height:160px;font-family:monospace;font-size:12px;" placeholder="# Ozymandias | Percy Bysshe Shelley&#10;I met a traveller from an antique land,&#10;Who said—&quot;Two vast and trunkless legs of stone&#10;Stand in the desert. . . .&#10;&#10;# London | William Blake&#10;I wander thro' each charter'd street,&#10;Near where the charter'd Thames does flow.&#10;&#10;— OR simple format (no poem text): —&#10;The Prelude | William Wordsworth&#10;My Last Duchess | Robert Browning"></textarea>
                    <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
                        <select id="pb-import-mode"><option value="merge">Merge</option><option value="replace">Replace all</option></select>
                        <button class="button button-primary" id="pb-import-btn">Import</button>
                        <span id="pb-import-status"></span>
                    </div>
                </div>
            </div>

            <!-- ═══════════════════════════════════════════ -->
            <!--  EXPORT / IMPORT ALL DATA                  -->
            <!-- ═══════════════════════════════════════════ -->
            <div style="margin-top:40px; border-top: 2px solid #ddd; padding-top: 30px;">
                <h2>📦 Export / Import All Data</h2>
                <p class="description">Transfer all topic questions and poem bank data between sites. Export downloads a JSON file; import uploads one.</p>

                <div style="display:flex; gap:20px; margin-top:16px; flex-wrap:wrap;">
                    <!-- Export -->
                    <div style="flex:1; min-width:300px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:20px;">
                        <h3 style="margin-top:0;">⬇️ Export</h3>
                        <p style="font-size:13px; color:#666;">Download all topic questions and poem bank data as a single JSON file.</p>
                        <button class="button button-primary" id="swml-export-btn">Export All Data</button>
                        <span id="swml-export-status" style="margin-left:10px; font-size:13px;"></span>
                    </div>

                    <!-- Import -->
                    <div style="flex:1; min-width:300px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:20px;">
                        <h3 style="margin-top:0;">⬆️ Import</h3>
                        <p style="font-size:13px; color:#666;">Upload a previously exported JSON file to restore topic questions and poems.</p>
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <input type="file" id="swml-import-file" accept=".json" style="font-size:13px;" />
                            <select id="swml-import-mode" style="padding:4px 8px;">
                                <option value="merge">Merge (keep existing, add new)</option>
                                <option value="replace">Replace (overwrite everything)</option>
                            </select>
                        </div>
                        <div style="margin-top:10px;">
                            <button class="button button-primary" id="swml-import-btn" disabled>Import Data</button>
                            <span id="swml-import-status" style="margin-left:10px; font-size:13px;"></span>
                        </div>
                    </div>
                </div>
            </div>

        <script>
        jQuery(function($) {
            const catalogue = <?php echo json_encode($catalogue); ?>;
            const nonce = '<?php echo $nonce; ?>';
            const ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
            let currentBoard = '', currentSubject = '', currentText = '';

            // ── Overview panel (v7.13.18) ──
            $.post(ajaxurl, { action: 'swml_overview', nonce }, function(res) {
                if (!res.success) return;
                const d = res.data;
                $('#tq-overview-stats').html(
                    '<strong>' + d.populated + '</strong> / ' + d.total_texts + ' texts have topics (' + d.total_topics + ' total topics)'
                );
                let html = '';
                let lastBoard = '';
                d.items.forEach(function(item) {
                    const boardLabel = item.board.toUpperCase().replace(/-/g, ' ');
                    const subjectLabel = item.subject.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
                    const boardCell = item.board !== lastBoard ? boardLabel : '';
                    lastBoard = item.board;
                    const statusColor = item.count >= 8 ? '#1CD991' : (item.count > 0 ? '#f59e0b' : '#e5e7eb');
                    const statusIcon = item.count >= 8 ? 'Ready' : (item.count > 0 ? 'Partial' : 'Empty');
                    const statusTextColor = item.count >= 8 ? '#166534' : (item.count > 0 ? '#92400e' : '#9ca3af');
                    const rowBg = item.count === 0 ? '' : (item.count >= 8 ? 'background:#f0fdf4;' : 'background:#fffbeb;');
                    html += '<tr style="' + rowBg + 'cursor:pointer;" data-board="' + item.board + '" data-subject="' + item.subject + '" data-text="' + item.slug + '">';
                    html += '<td style="padding:4px 12px;border-bottom:1px solid #f0f0f1;font-weight:' + (boardCell ? '600' : '400') + ';">' + boardCell + '</td>';
                    html += '<td style="padding:4px 12px;border-bottom:1px solid #f0f0f1;">' + subjectLabel + '</td>';
                    html += '<td style="padding:4px 12px;border-bottom:1px solid #f0f0f1;">' + item.label + '</td>';
                    html += '<td style="padding:4px 12px;border-bottom:1px solid #f0f0f1;text-align:center;font-weight:600;">' + item.count + '</td>';
                    html += '<td style="padding:4px 12px;border-bottom:1px solid #f0f0f1;text-align:center;">';
                    html += '<span style="display:inline-block;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:600;background:' + statusColor + ';color:' + statusTextColor + ';">' + statusIcon + '</span>';
                    html += '</td></tr>';
                });
                $('#tq-overview-rows').html(html);

                // Click a row to auto-select that board/subject/text and load
                $('#tq-overview-rows').on('click', 'tr', function() {
                    var b = $(this).data('board'), s = $(this).data('subject'), t = $(this).data('text');
                    $('#tq-board').val(b).trigger('change');
                    setTimeout(function() {
                        $('#tq-subject').val(s).trigger('change');
                        setTimeout(function() {
                            $('#tq-text').val(t).trigger('change');
                            setTimeout(function() { $('#tq-load').trigger('click'); }, 50);
                        }, 50);
                    }, 50);
                });
            });

            // ── Bulk import from files button ──
            $('#tq-bulk-import-btn').on('click', function() {
                if (!confirm('This will import ALL topic files from the server into the database (replace mode).\n\nContinue?')) return;
                var btn = $(this);
                btn.prop('disabled', true).text('Importing...');
                $.post(ajaxurl, { action: 'swml_bulk_import_files', nonce }, function(res) {
                    if (!res.success) {
                        alert('Bulk import failed: ' + (res.data || 'Unknown error'));
                        btn.prop('disabled', false).text('Import All from Files');
                        return;
                    }
                    var d = res.data;
                    var msg = 'Import complete!\n\n' +
                        'Imported: ' + d.imported_count + ' files (' + d.total_topics + ' topics)\n' +
                        'Skipped: ' + d.skipped_count + '\n' +
                        'Failed: ' + d.failed_count;
                    if (d.details.skipped.length) msg += '\n\nSkipped:\n- ' + d.details.skipped.join('\n- ');
                    if (d.details.failed.length) msg += '\n\nFailed:\n- ' + d.details.failed.join('\n- ');
                    alert(msg);
                    btn.text('Import Complete').css('background', '#1CD991');
                    // Reload overview
                    $.post(ajaxurl, { action: 'swml_overview', nonce }, function(res2) {
                        if (res2.success) {
                            var d2 = res2.data;
                            $('#tq-overview-stats').html(
                                '<strong>' + d2.populated + '</strong> / ' + d2.total_texts + ' texts have topics (' + d2.total_topics + ' total topics)'
                            );
                        }
                    });
                }).fail(function() {
                    alert('Request failed — check server logs.');
                    btn.prop('disabled', false).text('Import All from Files');
                });
            });

            // ── Cascading dropdowns ──
            $('#tq-board').on('change', function() {
                currentBoard = this.value;
                const $sub = $('#tq-subject').prop('disabled', !currentBoard).html('<option value="">— Select subject —</option>');
                $('#tq-text').prop('disabled', true).html('<option value="">— Select subject first —</option>');
                $('#tq-load').prop('disabled', true);
                if (!currentBoard) return;
                const subjects = catalogue[currentBoard];
                for (const [key, texts] of Object.entries(subjects)) {
                    $sub.append(`<option value="${key}">${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>`);
                }
            });

            $('#tq-subject').on('change', function() {
                currentSubject = this.value;
                const $txt = $('#tq-text').prop('disabled', !currentSubject).html('<option value="">— Select text —</option>');
                $('#tq-load').prop('disabled', true);
                if (!currentSubject || !catalogue[currentBoard]) return;
                const texts = catalogue[currentBoard][currentSubject];
                for (const [key, label] of Object.entries(texts)) {
                    $txt.append(`<option value="${key}">${label}</option>`);
                }
            });

            $('#tq-text').on('change', function() {
                currentText = this.value;
                $('#tq-load').prop('disabled', !currentText);
                if (currentText) loadTopics(); // Auto-load on text selection
            });

            // ── Load topics ──
            $('#tq-load').on('click', loadTopics);

            function loadTopics() {
                if (!currentBoard || !currentText) return;
                $.post(ajaxurl, {
                    action: 'swml_load_topics', nonce,
                    board: currentBoard, text: currentText
                }, function(res) {
                    if (res.success) {
                        renderTopics(res.data.topics || []);
                    } else {
                        renderTopics([]);
                    }
                    $('#tq-import').show();
                }).fail(function() {
                    renderTopics([]);
                    $('#tq-import').show();
                });
            }

            function renderTopics(topics) {
                const $c = $('#tq-content').empty();
                const textLabel = catalogue[currentBoard]?.[currentSubject]?.[currentText] || currentText;

                // Stats
                $c.append(`<div class="swml-tq-stats">
                    <div class="swml-tq-stat"><strong>${topics.length}</strong><span>Topics</span></div>
                    <div class="swml-tq-stat"><strong>${currentBoard.toUpperCase().replace('-', ' ')}</strong><span>Board</span></div>
                    <div class="swml-tq-stat"><strong>${textLabel}</strong><span>Text</span></div>
                </div>`);

                // Add button
                $c.append(`<button class="button button-primary" id="tq-add-new" style="margin-bottom:12px;">+ Add Topic ${topics.length + 1}</button>`);
                $('#tq-add-new', $c).on('click', function() {
                    showForm(null, topics.length + 1);
                });

                if (topics.length === 0) {
                    $c.append('<div class="swml-tq-empty">No topics yet. Click "Add Topic" above or use markdown import below.</div>');
                    return;
                }

                const $list = $('<div class="swml-tq-topic-list"></div>');
                topics.forEach(t => {
                    const isDual = t.question_format === 'dual';
                    const isEitherOr = t.question_format === 'either_or';
                    const isPoetry = t.question_format === 'poetry';
                    const isUnseen = t.question_format === 'unseen';
                    const isDualExtract = t.question_format === 'dual_extract';
                    const isDualPoem = t.question_format === 'dual_poem';
                    const isMultiQ = t.question_format === 'multi_question';
                    const isMultiOpt = t.question_format === 'multi_option';
                    const isDualTask = t.question_format === 'dual_task';

                    // ── Header badges ──
                    let badges = '';
                    if (t.topic_type) badges += `<span class="swml-tq-badge swml-tq-badge-type">${escHtml(t.topic_type.replace(/_/g, ' '))}</span>`;
                    if (isUnseen) badges += '<span class="swml-tq-badge swml-tq-badge-format">Q1+Q2</span>';
                    else if (isPoetry) badges += '<span class="swml-tq-badge swml-tq-badge-format">SA+SB</span>';
                    else if (isDual || isDualExtract || isDualPoem) badges += '<span class="swml-tq-badge swml-tq-badge-format">A+B</span>';
                    else if (isEitherOr) badges += '<span class="swml-tq-badge swml-tq-badge-format">Either/Or</span>';
                    else if (isMultiQ) badges += '<span class="swml-tq-badge swml-tq-badge-format">Multi-Q</span>';
                    else if (isMultiOpt) badges += '<span class="swml-tq-badge swml-tq-badge-format">Options</span>';
                    else if (isDualTask) badges += '<span class="swml-tq-badge swml-tq-badge-format">T1+T2</span>';

                    // Marks badge
                    if (isDual || isEitherOr || isPoetry || isUnseen || isDualExtract || isDualPoem || isDualTask) {
                        badges += `<span class="swml-tq-badge swml-tq-badge-marks">${t.part_a_marks||0}+${t.part_b_marks||0}m</span>`;
                    } else {
                        badges += `<span class="swml-tq-badge swml-tq-badge-marks">${t.marks||0}m</span>`;
                    }

                    // Location badge
                    const loc = t.extract_location || t.part_a_extract_location || '';
                    if (loc) badges += `<span class="swml-tq-badge swml-tq-badge-loc">${escHtml(loc)}</span>`;

                    // ── Body content ──
                    let bodyHtml = '';

                    // Context / Instruction
                    if (t.context) bodyHtml += `<div style="margin-top:8px;padding:6px 10px;background:#fff8e1;border-radius:4px;font-size:11px;border-left:3px solid #f9a825;"><strong>Context:</strong> ${escHtml(t.context)}</div>`;
                    if (t.instruction) bodyHtml += `<div style="margin-top:4px;padding:6px 10px;background:#e8f5e9;border-radius:4px;font-size:11px;border-left:3px solid #43a047;"><strong>Instruction:</strong> ${escHtml(t.instruction)}</div>`;

                    if (isUnseen) {
                        bodyHtml += `<div style="margin-top:8px;">
                            <div style="padding:6px 10px;background:#fff8f0;border-radius:4px;font-size:11px;margin-bottom:4px;"><strong>Q1 (${t.part_a_marks||24}m):</strong> ${escHtml(t.focus_poem||'')}${t.part_a_extract?' ✅':' ❌'} — ${escHtml(t.part_a_question||'—')}</div>
                            <div style="padding:6px 10px;background:#f0f8ff;border-radius:4px;font-size:11px;"><strong>Q2 (${t.part_b_marks||8}m):</strong> ${escHtml(t.comparison_poem||'')}${t.part_b_extract?' ✅':' ❌'} — ${escHtml(t.part_b_question||'—')}</div>
                        </div>`;
                    } else if (isPoetry) {
                        bodyHtml += `<div style="margin-top:8px;">
                            <div style="padding:6px 10px;background:#f5f0ff;border-radius:4px;font-size:11px;margin-bottom:4px;"><strong>Section A (${t.part_a_marks||15}m):</strong> ${escHtml(t.part_a_question||'—')}</div>
                            <div style="padding:6px 10px;background:#f0f5ff;border-radius:4px;font-size:11px;"><strong>Section B (${t.part_b_marks||25}m):</strong> ${escHtml(t.part_b_question||'—')}</div>
                        </div>`;
                    } else if (isDual || isDualExtract || isDualPoem || isEitherOr) {
                        const aLabel = isEitherOr ? 'Either' : 'Part A';
                        const bLabel = isEitherOr ? 'Or' : 'Part B';
                        bodyHtml += `<div style="margin-top:8px;">
                            <div style="padding:6px 10px;background:#f0f0ff;border-radius:4px;font-size:11px;margin-bottom:4px;"><strong>${aLabel} (${t.part_a_marks||0}m):</strong> ${escHtml(t.part_a_question||'—')}</div>
                            <div style="padding:6px 10px;background:#f0fff0;border-radius:4px;font-size:11px;"><strong>${bLabel} (${t.part_b_marks||0}m):</strong> ${escHtml(t.part_b_question||'—')}</div>
                        </div>`;
                    } else if (isDualTask) {
                        bodyHtml += `<div style="margin-top:8px;">
                            <div style="padding:6px 10px;background:#fef3e0;border-radius:4px;font-size:11px;margin-bottom:4px;"><strong>Task 1 (${t.part_a_marks||20}m):</strong> ${escHtml(t.part_a_question||'—')}</div>
                            <div style="padding:6px 10px;background:#e0f2fe;border-radius:4px;font-size:11px;"><strong>Task 2 (${t.part_b_marks||20}m):</strong> ${escHtml(t.part_b_question||'—')}</div>
                        </div>`;
                    } else {
                        if (t.question_text) bodyHtml += `<div class="swml-tq-topic-question">${escHtml(t.question_text)}</div>`;
                    }

                    // Extract indicator
                    if (t.extract_text) bodyHtml += `<div style="margin-top:4px;font-size:11px;color:#888;">📄 Extract: ${escHtml(t.extract_text.substring(0, 80))}${t.extract_text.length > 80 ? '…' : ''}</div>`;

                    // AOs
                    const aos = t.aos || (t.part_a_aos ? `${t.part_a_aos} / ${t.part_b_aos}` : '');
                    if (aos) bodyHtml += `<div style="margin-top:4px;font-size:11px;color:#888;">AOs: ${escHtml(aos)}</div>`;

                    // Teaching point
                    if (t.teaching_point) bodyHtml += `<div style="margin-top:6px;padding:6px 10px;background:#f0e6ff;border-radius:4px;font-size:11px;">💡 ${escHtml(t.teaching_point)}</div>`;

                    // Shortcode
                    const shortcode = `[wml_button board="${currentBoard}" subject="${currentSubject}" text="${currentText}" topic="${t.topic_number}" task="${t.task || 'planning'}"]`;
                    bodyHtml += `<div class="swml-tq-shortcode">
                        <code>${escHtml(shortcode)}</code>
                        <button class="button button-small tq-copy-sc" data-sc="${escAttr(shortcode)}" title="Copy shortcode">📋</button>
                    </div>`;

                    // Actions
                    bodyHtml += `<div class="swml-tq-topic-actions">
                        <button class="button tq-edit" data-topic="${t.topic_number}">✏️ Edit</button>
                        <button class="button tq-delete" data-topic="${t.topic_number}" style="color:#d63638;">🗑 Delete</button>
                    </div>`;

                    $list.append(`<div class="swml-tq-topic-card" data-topic="${t.topic_number}">
                        <div class="swml-tq-topic-header">
                            <span class="swml-tq-topic-chevron">▶</span>
                            <span class="swml-tq-topic-num">${t.topic_number}</span>
                            <span class="swml-tq-topic-label">${escHtml(t.label)}</span>
                            <span class="swml-tq-topic-badges">${badges}</span>
                        </div>
                        <div class="swml-tq-topic-body">${bodyHtml}</div>
                    </div>`);
                });

                // Accordion toggle
                $list.on('click', '.swml-tq-topic-header', function(e) {
                    if ($(e.target).closest('button').length) return;
                    $(this).closest('.swml-tq-topic-card').toggleClass('open');
                });

                $c.append($list);

                // ── Bulk Shortcode Generator ──
                if (topics.length > 0) {
                    const allShortcodes = topics.map(t => {
                        const sc = `[wml_button board="${currentBoard}" subject="${currentSubject}" text="${currentText}" topic="${t.topic_number}" task="${t.task || 'planning'}"]`;
                        return `<!-- Topic ${t.topic_number}: ${t.label} -->\n${sc}`;
                    }).join('\n\n');

                    $c.append(`<div class="swml-tq-bulk-sc">
                        <h3>📦 All Shortcodes for ${escHtml(textLabel)}</h3>
                        <p class="description">Copy these into your LearnDash units/lessons. Each shortcode generates a branded "Plan Your Essay" button that links directly to the correct topic.</p>
                        <textarea id="tq-bulk-sc" readonly style="width:100%;min-height:${Math.min(topics.length * 50 + 40, 300)}px;font-family:monospace;font-size:12px;padding:10px;">${escHtml(allShortcodes)}</textarea>
                        <button class="button button-primary" id="tq-copy-all-sc" style="margin-top:8px;">📋 Copy All Shortcodes</button>
                        <span id="tq-copy-status" style="margin-left:10px;color:#46b450;display:none;">✅ Copied!</span>
                    </div>`);

                    // Copy all shortcodes
                    $c.on('click', '#tq-copy-all-sc', function() {
                        const ta = document.getElementById('tq-bulk-sc');
                        ta.select();
                        document.execCommand('copy');
                        $('#tq-copy-status').show().delay(2000).fadeOut();
                    });
                }

                // Copy individual shortcode
                $list.on('click', '.tq-copy-sc', function() {
                    const sc = $(this).data('sc');
                    navigator.clipboard.writeText(sc).then(() => {
                        const $btn = $(this);
                        $btn.text('✅ Copied!');
                        setTimeout(() => $btn.text('📋 Copy'), 1500);
                    });
                });

                // Edit/delete handlers
                $list.on('click', '.tq-edit', function() {
                    const num = $(this).data('topic');
                    const topic = topics.find(t => t.topic_number === num);
                    if (topic) showForm(topic);
                });

                $list.on('click', '.tq-delete', function() {
                    const num = $(this).data('topic');
                    if (!confirm(`Delete topic ${num}?`)) return;
                    $.post(ajaxurl, { action: 'swml_delete_topic', nonce, board: currentBoard, text: currentText, topic_number: num }, function(res) {
                        if (res.success) loadTopics();
                        else alert(res.data || 'Error');
                    });
                });
            }

            function showForm(topic, defaultNum) {
                const isNew = !topic;
                const t = topic || { topic_number: defaultNum || 1, label: '', topic_type: '', teaching_point: '', question_format: 'single', focus_poem: '', focus_poet: '', comparison_poem: '', comparison_poet: '', question_text: '', extract_text: '', extract_location: '', marks: 30, aos: 'AO1,AO2,AO3', part_a_question: '', part_a_extract: '', part_a_extract_location: '', part_a_marks: 15, part_a_aos: 'AO1,AO2', part_b_question: '', part_b_extract: '', part_b_marks: 25, part_b_aos: 'AO1,AO2,AO4', context: '', instruction: '', intro: '', metadata: '{}', task: 'planning' };
                const isDual = t.question_format === 'dual';
                const isPoetry = t.question_format === 'poetry';
                const isUnseen = t.question_format === 'unseen';

                const formHtml = `<div class="swml-tq-form" id="tq-form">
                    <h3>${isNew ? 'Add' : 'Edit'} Topic ${t.topic_number}</h3>
                    <div class="row">
                        <label><span>Topic Number</span><input type="number" id="tf-num" value="${t.topic_number}" min="1" max="20"></label>
                        <label><span>Label</span><input type="text" id="tf-label" value="${escAttr(t.label)}" placeholder="e.g. Macbeth's Ambition"></label>
                        <label><span>Task</span>
                            <select id="tf-task">
                                <option value="planning" ${t.task==='planning'?'selected':''}>Planning</option>
                                <option value="assessment" ${t.task==='assessment'?'selected':''}>Assessment</option>
                                <option value="polishing" ${t.task==='polishing'?'selected':''}>Polishing</option>
                            </select>
                        </label>
                    </div>
                    <div class="row">
                        <label><span>Question Format</span>
                            <select id="tf-format">
                                <option value="single" ${!isDual && !isPoetry && !isUnseen?'selected':''}>Single Question</option>
                                <option value="dual" ${isDual?'selected':''}>Part A + Part B</option>
                                <option value="poetry" ${isPoetry?'selected':''}>Poetry (Section A + Section B)</option>
                                <option value="unseen" ${isUnseen?'selected':''}>Unseen Poetry (Q27.1 + Q27.2)</option>
                            </select>
                        </label>
                        <label><span>Topic Type</span>
                            <select id="tf-type">
                                <option value="" ${!t.topic_type?'selected':''}>— None —</option>
                                <optgroup label="Literature (Studied Texts)">
                                    <option value="protagonist" ${t.topic_type==='protagonist'?'selected':''}>Protagonist</option>
                                    <option value="central_theme" ${t.topic_type==='central_theme'?'selected':''}>Central Theme</option>
                                    <option value="supporting_theme" ${t.topic_type==='supporting_theme'?'selected':''}>Supporting Theme</option>
                                    <option value="supporting_character" ${t.topic_type==='supporting_character'?'selected':''}>Supporting Character</option>
                                    <option value="theme_and_character" ${t.topic_type==='theme_and_character'?'selected':''}>Theme & Character</option>
                                </optgroup>
                                <optgroup label="Language (Unseen Practice)">
                                    <option value="analytical_fiction" ${t.topic_type==='analytical_fiction'?'selected':''}>Analytical Fiction</option>
                                    <option value="analytical_nonfiction" ${t.topic_type==='analytical_nonfiction'?'selected':''}>Analytical Non-Fiction</option>
                                    <option value="analytical_poetry" ${t.topic_type==='analytical_poetry'?'selected':''}>Analytical Poetry</option>
                                    <option value="creative_fiction" ${t.topic_type==='creative_fiction'?'selected':''}>Creative Fiction</option>
                                    <option value="creative_nonfiction" ${t.topic_type==='creative_nonfiction'?'selected':''}>Creative Non-Fiction</option>
                                </optgroup>
                            </select>
                        </label>
                    </div>
                    <div class="swml-tq-teaching-point visible" id="tf-tp-wrap">
                        <label><span>💡 Teaching Point</span>
                        <textarea id="tf-teaching">${escHtml(t.teaching_point)}</textarea>
                        <p class="description">Explain to the student WHY this topic is studied at this point in the sequence.</p></label>
                    </div>

                    <!-- Poetry-specific: Focus Poem -->
                    <div id="tf-poetry-meta" style="display:${isPoetry||isUnseen?'block':'none'};">
                        <div class="row">
                            <label><span>📖 Focus Poem</span><input type="text" id="tf-focus-poem" value="${escAttr(t.focus_poem || '')}" placeholder="e.g. The Manhunt"></label>
                            <label><span>✍️ Focus Poet</span><input type="text" id="tf-focus-poet" value="${escAttr(t.focus_poet || '')}" placeholder="e.g. Simon Armitage"></label>
                        </div>
                    </div>

                    <!-- Single Question Fields -->
                    <div id="tf-single" style="display:${isDual||isPoetry||isUnseen?'none':'block'};">
                        <div style="padding:12px;background:#f7f7f7;border:1px solid #ddd;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">Question</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-marks" value="${t.marks}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-aos" value="${escAttr(t.aos)}" placeholder="AO1,AO2,AO3"></label>
                            </div>
                            <label><span>Extract Location</span><input type="text" id="tf-extract-loc" value="${escAttr(t.extract_location)}" placeholder="e.g. Act 1 Scene 7"></label>
                            <label><span>Extract Text</span><textarea id="tf-extract">${escHtml(t.extract_text)}</textarea></label>
                            <label><span>Question Text</span><textarea id="tf-question">${escHtml(t.question_text)}</textarea></label>
                        </div>
                    </div>

                    <!-- Part A + Part B Fields -->
                    <div id="tf-dual" style="display:${isDual?'block':'none'};">
                        <div style="padding:12px;background:#f0f0ff;border:1px solid #c0c0dd;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">📘 Part A — Extract Question</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-pa-marks" value="${t.part_a_marks || 15}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-pa-aos" value="${escAttr(t.part_a_aos || 'AO1,AO2')}" placeholder="AO1,AO2"></label>
                            </div>
                            <label><span>Extract Location</span><input type="text" id="tf-pa-extract-loc" value="${escAttr(t.part_a_extract_location)}" placeholder="e.g. Act 1 Scene 7"></label>
                            <label><span>Extract Text</span><textarea id="tf-pa-extract">${escHtml(t.part_a_extract)}</textarea></label>
                            <label><span>Part A Question</span><textarea id="tf-pa-question">${escHtml(t.part_a_question)}</textarea></label>
                        </div>
                        <div style="padding:12px;background:#f0fff0;border:1px solid #c0ddc0;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">📗 Part B — Whole Text Question</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-pb-marks" value="${t.part_b_marks || 25}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-pb-aos" value="${escAttr(t.part_b_aos || 'AO1,AO2,AO4')}" placeholder="AO1,AO2,AO4"></label>
                            </div>
                            <label><span>Part B Question</span><textarea id="tf-pb-question">${escHtml(t.part_b_question)}</textarea></label>
                        </div>
                    </div>

                    <!-- Poetry: Section A + Section B Fields -->
                    <div id="tf-poetry" style="display:${isPoetry?'block':'none'};">
                        <div style="padding:12px;background:#f5f0ff;border:1px solid #d0c0ee;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">📜 Section A — Single Poem Analysis (${t.part_a_marks || 15} marks)</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-sa-marks" value="${t.part_a_marks || 15}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-sa-aos" value="${escAttr(t.part_a_aos || 'AO1,AO2,AO3')}" placeholder="AO1,AO2,AO3"></label>
                            </div>
                            <label><span>Section A Question</span><textarea id="tf-sa-question">${escHtml(t.part_a_question)}</textarea></label>
                        </div>
                        <div style="padding:12px;background:#f0f5ff;border:1px solid #c0d0ee;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">🔄 Section B — Comparative Analysis (${t.part_b_marks || 25} marks)</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-sb-marks" value="${t.part_b_marks || 25}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-sb-aos" value="${escAttr(t.part_b_aos || 'AO1,AO2,AO3')}" placeholder="AO1,AO2,AO3"></label>
                            </div>
                            <label><span>Section B Question</span><textarea id="tf-sb-question">${escHtml(t.part_b_question)}</textarea></label>
                        </div>
                    </div>

                    <!-- Unseen Poetry: Q27.1 + Q27.2 Fields -->
                    <div id="tf-unseen" style="display:${isUnseen?'block':'none'};">
                        <div style="padding:12px;background:#fff8f0;border:1px solid #e0c8a0;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">📜 Q27.1 — Single Poem Analysis (${t.part_a_marks || 24} marks)</h4>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-q1-marks" value="${t.part_a_marks || 24}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-q1-aos" value="${escAttr(t.part_a_aos || 'AO1,AO2')}" placeholder="AO1,AO2"></label>
                            </div>
                            <label><span>Poem 1 Full Text</span><textarea id="tf-q1-poem" style="min-height:120px;">${escHtml(t.part_a_extract || '')}</textarea></label>
                            <label><span>Q27.1 Question</span><textarea id="tf-q1-question">${escHtml(t.part_a_question || '')}</textarea></label>
                        </div>
                        <div style="padding:12px;background:#f0f8ff;border:1px solid #a0c8e0;border-radius:6px;margin:10px 0;">
                            <h4 style="margin-top:0;">🔄 Q27.2 — Comparison (${t.part_b_marks || 8} marks)</h4>
                            <div class="row">
                                <label><span>Comparison Poem</span><input type="text" id="tf-comp-poem" value="${escAttr(t.comparison_poem || '')}" placeholder="e.g. A Day in Autumn"></label>
                                <label><span>Comparison Poet</span><input type="text" id="tf-comp-poet" value="${escAttr(t.comparison_poet || '')}" placeholder="e.g. R S Thomas"></label>
                            </div>
                            <div class="row">
                                <label><span>Marks</span><input type="number" id="tf-q2-marks" value="${t.part_b_marks || 8}" min="1" max="100"></label>
                                <label><span>AOs</span><input type="text" id="tf-q2-aos" value="${escAttr(t.part_b_aos || 'AO2')}" placeholder="AO2"></label>
                            </div>
                            <label><span>Poem 2 Full Text</span><textarea id="tf-q2-poem" style="min-height:120px;">${escHtml(t.part_b_extract || '')}</textarea></label>
                            <label><span>Q27.2 Question</span><textarea id="tf-q2-question">${escHtml(t.part_b_question || '')}</textarea></label>
                        </div>
                    </div>

                    <div style="margin-top:12px;display:flex;gap:8px;">
                        <button class="button button-primary" id="tf-save">Save Topic</button>
                        <button class="button" id="tf-cancel">Cancel</button>
                    </div>
                </div>`;

                // Remove existing form
                $('#tq-form').remove();
                $('#tq-content').prepend(formHtml);

                // Toggle single/dual/poetry/unseen
                $('#tf-format').on('change', function() {
                    const v = this.value;
                    $('#tf-single').toggle(v === 'single');
                    $('#tf-dual').toggle(v === 'dual');
                    $('#tf-poetry').toggle(v === 'poetry');
                    $('#tf-unseen').toggle(v === 'unseen');
                    $('#tf-poetry-meta').toggle(v === 'poetry' || v === 'unseen');
                });

                // Save
                $('#tf-save').on('click', function() {
                    const fmt = $('#tf-format').val();
                    const data = {
                        action: 'swml_save_topics', nonce,
                        board: currentBoard, text: currentText,
                        topic_number: $('#tf-num').val(),
                        label: $('#tf-label').val(),
                        topic_type: $('#tf-type').val(),
                        teaching_point: $('#tf-teaching').val(),
                        question_format: fmt,
                        focus_poem: $('#tf-focus-poem').val() || '',
                        focus_poet: $('#tf-focus-poet').val() || '',
                        comparison_poem: $('#tf-comp-poem').val() || '',
                        comparison_poet: $('#tf-comp-poet').val() || '',
                        // Single fields
                        question_text: $('#tf-question').val(),
                        extract_text: $('#tf-extract').val(),
                        extract_location: $('#tf-extract-loc').val(),
                        marks: $('#tf-marks').val(),
                        aos: $('#tf-aos').val(),
                        task: $('#tf-task').val(),
                    };
                    if (fmt === 'dual') {
                        // Part A/B fields
                        data.part_a_question = $('#tf-pa-question').val();
                        data.part_a_extract = $('#tf-pa-extract').val();
                        data.part_a_extract_location = $('#tf-pa-extract-loc').val();
                        data.part_a_marks = $('#tf-pa-marks').val();
                        data.part_a_aos = $('#tf-pa-aos').val();
                        data.part_b_question = $('#tf-pb-question').val();
                        data.part_b_marks = $('#tf-pb-marks').val();
                        data.part_b_aos = $('#tf-pb-aos').val();
                    } else if (fmt === 'poetry') {
                        // Section A/B fields (mapped to part_a/part_b storage)
                        data.part_a_question = $('#tf-sa-question').val();
                        data.part_a_marks = $('#tf-sa-marks').val();
                        data.part_a_aos = $('#tf-sa-aos').val();
                        data.part_b_question = $('#tf-sb-question').val();
                        data.part_b_marks = $('#tf-sb-marks').val();
                        data.part_b_aos = $('#tf-sb-aos').val();
                    } else if (fmt === 'unseen') {
                        // Q27.1/Q27.2 fields
                        data.part_a_question = $('#tf-q1-question').val();
                        data.part_a_extract = $('#tf-q1-poem').val(); // Poem 1 text
                        data.part_a_marks = $('#tf-q1-marks').val();
                        data.part_a_aos = $('#tf-q1-aos').val();
                        data.part_b_question = $('#tf-q2-question').val();
                        data.part_b_extract = $('#tf-q2-poem').val(); // Poem 2 text
                        data.part_b_marks = $('#tf-q2-marks').val();
                        data.part_b_aos = $('#tf-q2-aos').val();
                    }
                    $.post(ajaxurl, data, function(res) {
                        if (res.success) {
                            $('#tq-form').remove();
                            loadTopics();
                        } else {
                            alert(res.data || 'Error saving');
                        }
                    });
                });

                $('#tf-cancel').on('click', function() { $('#tq-form').remove(); });

                document.getElementById('tq-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // ── Import ──
            $('#tq-import-btn').on('click', function() {
                const md = $('#tq-import-md').val();
                if (!md.trim()) { alert('Paste markdown content first'); return; }
                $.post(ajaxurl, {
                    action: 'swml_import_topics', nonce,
                    board: currentBoard, text: currentText,
                    markdown: md,
                    import_mode: $('#tq-import-mode').val(),
                }, function(res) {
                    if (res.success) {
                        $('#tq-import-status').text('✅ ' + res.data.message).show().delay(3000).fadeOut();
                        $('#tq-import-md').val('');
                        loadTopics();
                    } else {
                        $('#tq-import-status').text('❌ ' + (res.data || 'Error')).show();
                    }
                });
            });

            // Helpers
            function escHtml(s) { return $('<span>').text(s || '').html(); }
            function escAttr(s) { return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

            // ═══════════════════════════════════════════
            //  TEXT BANK OVERVIEW — Expandable Rows
            // ═══════════════════════════════════════════
            (function() {
                // Build lookup from pre-loaded data
                var ovLookup = {};
                (pbOverviewData || []).forEach(function(d) {
                    ovLookup[d.board + '__' + d.anthology] = d;
                });

                // Toggle expand/collapse
                $('#pb-overview-table').on('click', '.pb-ov-row', function() {
                    var rowId = $(this).data('row');
                    var $detail = $('.pb-ov-detail[data-row="' + rowId + '"]');
                    var isOpen = $(this).hasClass('open');

                    if (isOpen) {
                        $(this).removeClass('open').find('.pb-ov-arrow').text('▶');
                        $detail.hide();
                    } else {
                        $(this).addClass('open').find('.pb-ov-arrow').text('▼');
                        var $inner = $detail.find('.pb-ov-detail-inner');
                        renderOverviewDetail($inner, rowId);
                        $detail.show();
                    }
                });

                function renderOverviewDetail($inner, rowId) {
                    var data = ovLookup[rowId];
                    if (!data || !data.poems || data.poems.length === 0) {
                        $inner.html('<p class="pb-ov-empty">No texts imported yet. Use the selector below to load and import texts.</p>');
                        return;
                    }
                    var html = '<table class="pb-ov-texts"><thead><tr><th style="width:30px;">#</th><th>Title</th><th>Author</th><th style="width:80px;text-align:center;">Content</th><th style="width:120px;"></th></tr></thead><tbody>';
                    data.poems.forEach(function(p, i) {
                        var hasText = p.poem_text && p.poem_text.trim().length > 0;
                        var textBadge = hasText
                            ? '<span style="color:#46b450;">✅ ' + p.poem_text.trim().split('\n').length + ' lines</span>'
                            : '<span style="color:#d63638;">❌</span>';
                        html += '<tr data-idx="' + i + '">';
                        html += '<td style="color:#999;">' + (i + 1) + '</td>';
                        html += '<td class="pb-ov-title">' + escHtml(p.title) + '</td>';
                        html += '<td class="pb-ov-poet">' + escHtml(p.poet) + '</td>';
                        html += '<td style="text-align:center;">' + textBadge + '</td>';
                        html += '<td style="white-space:nowrap;text-align:right;">';
                        html += '<span class="pb-ov-edit" data-idx="' + i + '" style="font-size:11px;color:#0073aa;cursor:pointer;">Edit</span>';
                        html += ' &nbsp; <span class="pb-ov-del" data-idx="' + i + '">Delete</span>';
                        html += '</td>';
                        html += '</tr>';
                    });
                    html += '</tbody></table>';
                    $inner.html(html);

                    // Inline edit
                    $inner.on('click', '.pb-ov-edit', function(e) {
                        e.stopPropagation();
                        var idx = $(this).data('idx');
                        var p = data.poems[idx];
                        var $tr = $(this).closest('tr');
                        // Remove any existing edit row first
                        $inner.find('.pb-ov-edit-row').remove();
                        $tr.find('.pb-ov-title').html('<input type="text" class="pb-ov-title-input" value="' + escAttr(p.title) + '">');
                        $tr.find('.pb-ov-poet').html('<input type="text" class="pb-ov-poet-input" value="' + escAttr(p.poet) + '">');
                        $(this).replaceWith('<span class="pb-ov-save" data-idx="' + idx + '">Save</span>');
                        // Add text content editor row below
                        var editRowHtml = '<tr class="pb-ov-edit-row" data-idx="' + idx + '">' +
                            '<td colspan="5" style="padding:8px;">' +
                            '<label style="font-weight:600;font-size:12px;color:#555;">Full Text Content</label>' +
                            '<textarea class="pb-ov-text-input" style="width:100%;min-height:150px;font-family:monospace;font-size:12px;padding:8px;margin-top:4px;border:1px solid #ccc;border-radius:4px;">' + escHtml(p.poem_text || '') + '</textarea>' +
                            '<div style="margin-top:6px;display:flex;gap:8px;">' +
                            '<button type="button" class="button button-small pb-ov-save-full" data-idx="' + idx + '" style="background:#46b450;color:#fff;border-color:#3a9a40;">Save All Changes</button>' +
                            '<button type="button" class="button button-small pb-ov-cancel-edit">Cancel</button>' +
                            '</div>' +
                            '</td></tr>';
                        $tr.after(editRowHtml);
                    });

                    // Cancel edit
                    $inner.on('click', '.pb-ov-cancel-edit', function(e) {
                        e.stopPropagation();
                        $inner.find('.pb-ov-edit-row').remove();
                        renderOverviewDetail($inner, rowId);
                    });

                    // Save inline edit (title/author only from row)
                    $inner.on('click', '.pb-ov-save', function(e) {
                        e.stopPropagation();
                        var idx = $(this).data('idx');
                        var p = data.poems[idx];
                        var $tr = $(this).closest('tr');
                        var newTitle = $tr.find('.pb-ov-title-input').val().trim();
                        var newPoet = $tr.find('.pb-ov-poet-input').val().trim();
                        var $editRow = $inner.find('.pb-ov-edit-row[data-idx="' + idx + '"]');
                        var newText = $editRow.length ? $editRow.find('.pb-ov-text-input').val() : (p.poem_text || '');
                        if (!newTitle) { alert('Title is required'); return; }
                        $.post(ajaxurl, {
                            action: 'swml_save_poem', nonce: nonce,
                            board: data.board, anthology: data.anthology,
                            poem_id: p.id, title: newTitle, poet: newPoet,
                            poem_text: newText
                        }, function(res) {
                            if (res.success) {
                                p.title = newTitle;
                                p.poet = newPoet;
                                p.poem_text = newText;
                                renderOverviewDetail($inner, rowId);
                            } else {
                                alert('Save failed: ' + (res.data || 'Unknown error'));
                            }
                        });
                    });

                    // Save all changes (from full edit row button)
                    $inner.on('click', '.pb-ov-save-full', function(e) {
                        e.stopPropagation();
                        var idx = $(this).data('idx');
                        var p = data.poems[idx];
                        var $tr = $inner.find('tr[data-idx="' + idx + '"]').not('.pb-ov-edit-row').first();
                        var $editRow = $inner.find('.pb-ov-edit-row[data-idx="' + idx + '"]');
                        var newTitle = $tr.find('.pb-ov-title-input').length ? $tr.find('.pb-ov-title-input').val().trim() : p.title;
                        var newPoet = $tr.find('.pb-ov-poet-input').length ? $tr.find('.pb-ov-poet-input').val().trim() : p.poet;
                        var newText = $editRow.find('.pb-ov-text-input').val();
                        if (!newTitle) { alert('Title is required'); return; }
                        $.post(ajaxurl, {
                            action: 'swml_save_poem', nonce: nonce,
                            board: data.board, anthology: data.anthology,
                            poem_id: p.id, title: newTitle, poet: newPoet,
                            poem_text: newText
                        }, function(res) {
                            if (res.success) {
                                p.title = newTitle;
                                p.poet = newPoet;
                                p.poem_text = newText;
                                renderOverviewDetail($inner, rowId);
                            } else {
                                alert('Save failed: ' + (res.data || 'Unknown error'));
                            }
                        });
                    });

                    // Delete
                    $inner.on('click', '.pb-ov-del', function(e) {
                        e.stopPropagation();
                        var idx = $(this).data('idx');
                        var p = data.poems[idx];
                        if (!confirm('Delete "' + p.title + '"?')) return;
                        $.post(ajaxurl, {
                            action: 'swml_delete_poem', nonce: nonce,
                            board: data.board, anthology: data.anthology,
                            poem_id: p.id
                        }, function(res) {
                            if (res.success) {
                                data.poems.splice(idx, 1);
                                renderOverviewDetail($inner, rowId);
                                // Update badge in overview row
                                var $row = $('.pb-ov-row[data-row="' + rowId + '"]');
                                var newCount = data.poems.length;
                                var newBadge = newCount > 0
                                    ? '<span style="background:#46b450;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;">' + newCount + '</span>'
                                    : '<span style="background:#d63638;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px;">0</span>';
                                $row.find('td:last').html(newBadge);
                            }
                        });
                    });
                }
            })();

            // ═══════════════════════════════════════════
            //  TEXT BANK (Poems, Prose, Non-Fiction)
            // ═══════════════════════════════════════════
            (function() {
                var pbBoard = '', pbAnthology = '', pbAnthologyType = '';

                // Anthology types to scan (in display order)
                var anthologyTypes = [
                    { key: 'poetry_anthology', label: 'Poetry' },
                    { key: 'prose_anthology', label: 'Prose' },
                    { key: 'nonfiction_anthology', label: 'Non-Fiction' }
                ];

                $('#pb-board').on('change', function() {
                    pbBoard = this.value;
                    var $ant = $('#pb-anthology').prop('disabled', !pbBoard).html('<option value="">— Select anthology —</option>');
                    $('#pb-load').prop('disabled', true);
                    if (!pbBoard || !catalogue[pbBoard]) return;
                    anthologyTypes.forEach(function(at) {
                        var anths = catalogue[pbBoard][at.key];
                        if (!anths) return;
                        var $group = $('<optgroup label="' + at.label + '">');
                        for (var key in anths) {
                            $group.append('<option value="' + key + '" data-type="' + at.key + '">' + anths[key] + '</option>');
                        }
                        $ant.append($group);
                    });
                });

                $('#pb-anthology').on('change', function() {
                    pbAnthology = this.value;
                    pbAnthologyType = $(this).find(':selected').data('type') || 'poetry_anthology';
                    $('#pb-load').prop('disabled', !pbAnthology);
                });

                $('#pb-load').on('click', loadPoems);

                function loadPoems() {
                    if (!pbBoard || !pbAnthology) return;
                    var url = (wpApiSettings && wpApiSettings.root ? wpApiSettings.root : '/wp-json/') + 'sophicly-wml/v1/poems?board=' + pbBoard + '&anthology=' + pbAnthology;
                    $.get(url, function(res) {
                        renderPoems(res.poems || []);
                        $('#pb-import').show();
                    }).fail(function() {
                        renderPoems([]);
                        $('#pb-import').show();
                    });
                }

                function renderPoems(poems) {
                    var $c = $('#pb-content').empty();
                    var anthLabel = '';
                    if (catalogue[pbBoard]) {
                        anthologyTypes.forEach(function(at) {
                            if (catalogue[pbBoard][at.key] && catalogue[pbBoard][at.key][pbAnthology]) {
                                anthLabel = catalogue[pbBoard][at.key][pbAnthology];
                            }
                        });
                    }
                    if (!anthLabel) anthLabel = pbAnthology;

                    $c.append('<p style="margin:12px 0;"><strong>' + poems.length + ' texts</strong> in ' + escHtml(anthLabel) + ' (' + pbBoard.toUpperCase() + ')</p>');
                    $c.append('<button class="button button-primary" id="pb-add-new" style="margin-bottom:8px;">+ Add Text</button>');

                    if (poems.length > 0) {
                        var table = '<table class="widefat striped" style="max-width:800px;"><thead><tr><th>#</th><th>Title</th><th>Author</th><th>Text</th><th></th></tr></thead><tbody>';
                        poems.forEach(function(p, i) {
                            var hasText = p.poem_text && p.poem_text.trim().length > 0;
                            var textStatus = hasText ? '<span style="color:#46b450;">✅ ' + p.poem_text.trim().split('\n').length + ' lines</span>' : '<span style="color:#d63638;">❌ Missing</span>';
                            table += '<tr><td>' + (i+1) + '</td><td><strong>' + escHtml(p.title) + '</strong></td><td>' + escHtml(p.poet) + '</td><td>' + textStatus + '</td><td style="white-space:nowrap;"><button class="button button-small pb-edit" data-id="' + escAttr(p.id) + '">Edit</button> <button class="button button-small pb-del" data-id="' + escAttr(p.id) + '" style="color:#d63638;">Delete</button></td></tr>';
                        });
                        table += '</tbody></table>';
                        $c.append(table);
                    }

                    // Add new poem
                    $c.on('click', '#pb-add-new', function() {
                        showPoemForm(null);
                    });

                    // Edit poem
                    $c.on('click', '.pb-edit', function() {
                        var id = $(this).data('id');
                        var poem = poems.find(function(p) { return p.id === id; });
                        if (poem) showPoemForm(poem);
                    });

                    // Delete poem
                    $c.on('click', '.pb-del', function() {
                        var id = $(this).data('id');
                        if (!confirm('Delete "' + id + '"?')) return;
                        $.post(ajaxurl, { action: 'swml_delete_poem', nonce: nonce, board: pbBoard, anthology: pbAnthology, poem_id: id }, function(res) {
                            if (res.success) loadPoems();
                        });
                    });
                }

                function showPoemForm(poem) {
                    $('#pb-poem-form').remove();
                    var isNew = !poem;
                    var p = poem || { id: '', title: '', poet: '', poem_text: '' };
                    var formHtml = '<div id="pb-poem-form" style="margin:12px 0;padding:16px;background:#f9f9f9;border:1px solid #ccc;border-radius:8px;">' +
                        '<h4 style="margin-top:0;">' + (isNew ? 'Add New Text' : 'Edit: ' + escHtml(p.title)) + '</h4>' +
                        '<div style="display:flex;gap:12px;margin-bottom:10px;">' +
                            '<label style="flex:1;font-weight:600;font-size:13px;">Title<br><input type="text" id="pf-title" value="' + escAttr(p.title) + '" style="width:100%;padding:6px 10px;"></label>' +
                            '<label style="flex:1;font-weight:600;font-size:13px;">Author<br><input type="text" id="pf-poet" value="' + escAttr(p.poet) + '" style="width:100%;padding:6px 10px;"></label>' +
                        '</div>' +
                        '<label style="font-weight:600;font-size:13px;">Full Text<br>' +
                        '<textarea id="pf-text" style="width:100%;min-height:200px;font-family:monospace;font-size:12px;padding:8px;margin-top:4px;" placeholder="Paste the full text here...">' + escHtml(p.poem_text || '') + '</textarea></label>' +
                        '<div style="margin-top:10px;display:flex;gap:8px;">' +
                            '<button class="button button-primary" id="pf-save">Save</button>' +
                            '<button class="button" id="pf-cancel">Cancel</button>' +
                        '</div>' +
                    '</div>';
                    $('#pb-content').prepend(formHtml);

                    $('#pf-save').on('click', function() {
                        var title = $('#pf-title').val().trim();
                        if (!title) { alert('Title is required'); return; }
                        $.post(ajaxurl, {
                            action: 'swml_save_poem', nonce: nonce,
                            board: pbBoard, anthology: pbAnthology,
                            poem_id: p.id || '',
                            title: title,
                            poet: $('#pf-poet').val().trim(),
                            poem_text: $('#pf-text').val(),
                        }, function(res) {
                            if (res.success) { $('#pb-poem-form').remove(); loadPoems(); }
                            else alert(res.data || 'Error');
                        });
                    });
                    $('#pf-cancel').on('click', function() { $('#pb-poem-form').remove(); });
                    document.getElementById('pb-poem-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                $('#pb-import-btn').on('click', function() {
                    var text = $('#pb-import-text').val();
                    if (!text.trim()) { alert('Paste poems first'); return; }
                    $.post(ajaxurl, { action: 'swml_import_poems', nonce: nonce, board: pbBoard, anthology: pbAnthology, poems_text: text, import_mode: $('#pb-import-mode').val() }, function(res) {
                        if (res.success) {
                            $('#pb-import-status').text('✅ ' + res.data.message + ' — Refreshing...').show();
                            // Reload page and scroll to overview so updated counts are visible
                            window.location.hash = 'pb-overview';
                            window.location.reload();
                        } else {
                            $('#pb-import-status').text('❌ ' + (res.data || 'Error')).show();
                        }
                    });
                });
            })();

            // ═══════════════════════════════════════════
            //  SHORTCODE GENERATOR
            // ═══════════════════════════════════════════
            (function buildShortcodeGenerator() {
                const $gen = $('#sc-gen');

                function scRow(label, shortcode) {
                    return '<div class="sc-row">' +
                        '<span class="sc-label">' + label + '</span>' +
                        '<span class="sc-code">' + escHtml(shortcode) + '</span>' +
                        '<button class="button button-small sc-copy" data-sc="' + escAttr(shortcode) + '">📋 Copy</button>' +
                    '</div>';
                }

                let html = '';

                // ── 1. General Entry Points ──
                html += '<details open><summary>🏠 General Entry Points</summary><div class="sc-group">';
                html += scRow('Default (shows wizard)', '[wml_button]');
                html += scRow('Mastery Programme', '[wml_button mode="guided"]');
                html += scRow('Free Practice', '[wml_button mode="exam_prep"]');
                html += '</div></details>';

                // ── 2. Board-Level Buttons ──
                html += '<details><summary>📋 Board Selection</summary><div class="sc-group">';
                for (const board of Object.keys(catalogue)) {
                    const boardLabel = board.toUpperCase().replace(/-/g, ' ');
                    html += scRow(boardLabel + ' — Programme', '[wml_button board="' + board + '" mode="guided"]');
                    html += scRow(boardLabel + ' — Free Practice', '[wml_button board="' + board + '" mode="exam_prep"]');
                }
                html += '</div></details>';

                // ── 3. Per Board → Subject → Text → Tasks + Topics ──
                const tasks = [
                    { id: 'planning', label: 'Essay Planning' },
                    { id: 'assessment', label: 'Assessment' },
                    { id: 'polishing', label: 'Polishing' },
                    { id: 'conceptual_notes', label: 'Conceptual Notes' },
                    { id: 'exam_question', label: 'Exam Question Creator' },
                    { id: 'essay_plan', label: 'Exam Essay Plan' },
                    { id: 'model_answer', label: 'Model Answer' },
                    { id: 'verbal_rehearsal', label: 'Quote Analysis' },
                ];

                for (const [board, subjects] of Object.entries(catalogue)) {
                    const boardLabel = board.toUpperCase().replace(/-/g, ' ');

                    html += '<details><summary>📚 ' + boardLabel + '</summary><div class="sc-group">';

                    for (const [subject, texts] of Object.entries(subjects)) {
                        const subjectLabel = subject.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });

                        html += '<div class="sc-section-title">' + subjectLabel + '</div>';

                        for (const [textId, textLabel] of Object.entries(texts)) {
                            // Board + Subject + Text (task picker)
                            html += scRow(textLabel + ' — Task Picker', '[wml_button board="' + board + '" subject="' + subject + '" text="' + textId + '"]');

                            // Each task
                            for (const t of tasks) {
                                html += scRow(textLabel + ' — ' + t.label, '[wml_button board="' + board + '" subject="' + subject + '" text="' + textId + '" task="' + t.id + '"]');
                            }

                            // Topic shortcuts (1-10)
                            html += scRow(textLabel + ' — Topic 1 (Diagnostic)', '[wml_button board="' + board + '" subject="' + subject + '" text="' + textId + '" topic="1" task="planning"]');
                            html += scRow(textLabel + ' — Topic 2 (CN)', '[wml_button board="' + board + '" subject="' + subject + '" text="' + textId + '" topic="2" task="conceptual_notes"]');
                            for (let i = 3; i <= 10; i++) {
                                html += scRow(textLabel + ' — Topic ' + i + ' (Development)', '[wml_button board="' + board + '" subject="' + subject + '" text="' + textId + '" topic="' + i + '" task="planning"]');
                            }
                        }
                    }

                    html += '</div></details>';
                }

                $gen.html(html);

                // Copy handler
                $gen.on('click', '.sc-copy', function() {
                    var sc = $(this).data('sc');
                    var $btn = $(this);
                    navigator.clipboard.writeText(sc).then(function() {
                        $btn.text('✅ Copied!').addClass('copied');
                        setTimeout(function() { $btn.text('📋 Copy').removeClass('copied'); }, 1500);
                    });
                });
            })();

            // ═══════════════════════════════════════════
            //  EXPORT / IMPORT ALL DATA
            // ═══════════════════════════════════════════

            $('#swml-export-btn').on('click', function() {
                var $btn = $(this), $status = $('#swml-export-status');
                $btn.prop('disabled', true).text('Exporting…');
                $status.text('');

                $.post(ajaxurl, { action: 'swml_export_all', nonce: nonce }, function(res) {
                    $btn.prop('disabled', false).text('Export All Data');
                    if (res.success) {
                        var data = res.data;
                        var topicCount = Object.keys(data.topics || {}).length;
                        var poemCount = Object.keys(data.poems || {}).length;
                        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        var date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                        a.href = url;
                        a.download = 'wml_data_export_' + date + '.json';
                        a.click();
                        URL.revokeObjectURL(url);
                        $status.css('color', '#46b450').text('✅ Exported ' + topicCount + ' topic sets + ' + poemCount + ' poem sets');
                    } else {
                        $status.css('color', '#d63638').text('❌ ' + (res.data || 'Export failed'));
                    }
                }).fail(function() {
                    $btn.prop('disabled', false).text('Export All Data');
                    $status.css('color', '#d63638').text('❌ Network error');
                });
            });

            // Enable import button when file is selected
            $('#swml-import-file').on('change', function() {
                $('#swml-import-btn').prop('disabled', !this.files.length);
            });

            $('#swml-import-btn').on('click', function() {
                var file = $('#swml-import-file')[0].files[0];
                if (!file) return;

                var $btn = $(this), $status = $('#swml-import-status');
                var mode = $('#swml-import-mode').val();

                if (mode === 'replace' && !confirm('⚠️ Replace mode will OVERWRITE all existing topics and poems with the imported data. This cannot be undone.\n\nAre you sure?')) {
                    return;
                }

                $btn.prop('disabled', true).text('Importing…');
                $status.text('');

                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var parsed = JSON.parse(e.target.result);
                        if (!parsed.topics && !parsed.poems) {
                            $status.css('color', '#d63638').text('❌ Invalid file — no topics or poems found');
                            $btn.prop('disabled', false).text('Import Data');
                            return;
                        }
                    } catch (err) {
                        $status.css('color', '#d63638').text('❌ Invalid JSON file');
                        $btn.prop('disabled', false).text('Import Data');
                        return;
                    }

                    $.post(ajaxurl, {
                        action: 'swml_import_all',
                        nonce: nonce,
                        data: JSON.stringify(parsed),
                        mode: mode
                    }, function(res) {
                        $btn.prop('disabled', false).text('Import Data');
                        if (res.success) {
                            $status.css('color', '#46b450').text('✅ ' + res.data.message);
                        } else {
                            $status.css('color', '#d63638').text('❌ ' + (res.data || 'Import failed'));
                        }
                    }).fail(function() {
                        $btn.prop('disabled', false).text('Import Data');
                        $status.css('color', '#d63638').text('❌ Network error');
                    });
                };
                reader.readAsText(file);
            });
        });
        </script>
        <?php
    }
}
