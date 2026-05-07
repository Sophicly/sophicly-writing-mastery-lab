<?php
/**
 * Plugin Name: Sophicly Writing Mastery Lab
 * Description: AI-powered GCSE English tutoring interface with adaptive layouts for essay planning, assessment, and polishing.
 * Version: 7.19.81
 * Author: Sophicly
 * Text Domain: sophicly-wml
 */

if (!defined('ABSPATH')) exit;

define('SWML_VERSION', '7.19.81');
define('SWML_PATH', plugin_dir_path(__FILE__));
define('SWML_URL', plugin_dir_url(__FILE__));
define('SWML_PROTOCOLS_PATH', SWML_PATH . 'protocols/');

/**
 * Main plugin class
 */
class Sophicly_Writing_Mastery_Lab {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->load_includes();
        $this->init_hooks();
    }

    private function load_includes() {
        require_once SWML_PATH . 'includes/class-session-manager.php';
        require_once SWML_PATH . 'includes/class-protocol-router.php';
        require_once SWML_PATH . 'includes/class-quiz-engine.php';
        require_once SWML_PATH . 'includes/class-function-handlers.php';
        require_once SWML_PATH . 'includes/class-rest-api.php';
        require_once SWML_PATH . 'includes/class-feedback-unlock.php';
        require_once SWML_PATH . 'includes/class-video-admin.php';
        require_once SWML_PATH . 'includes/class-topic-parser.php';
        require_once SWML_PATH . 'includes/class-topic-questions.php';
    }

    private function init_hooks() {
        // Initialize components
        add_action('init', [$this, 'register_rewrite_rules']);
        add_action('init', [$this, 'register_shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('wp_head', [$this, 'anti_fouc_dark_background'], 1); // Priority 1 = very early
        add_filter('template_include', [$this, 'load_page_template']);
        add_filter('query_vars', [$this, 'add_query_vars']);

        // Initialize protocol router (hooks into AI Engine)
        SWML_Protocol_Router::instance();

        // Initialize unified quiz engine (v7.18.0)
        SWML_Quiz_Engine::instance();

        // Initialize function handlers (Code Engine)
        SWML_Function_Handlers::instance();

        // Initialize REST API
        SWML_REST_API::instance();

        // Initialize video admin (WP admin only)
        if (is_admin()) {
            SWML_Video_Admin::instance();
        }

        // Initialize topic question bank (admin UI + REST endpoint)
        SWML_Topic_Questions::instance();

        // One-time migration: AQA Shakespeare/Modern Text marks 30 → 34 (v7.14.6)
        add_action('admin_init', [$this, 'migrate_aqa_marks_v7146']);

        // Cover images admin page
        if (is_admin()) {
            add_action('admin_menu', [$this, 'add_covers_menu']);
        }

        // Flush rewrite rules on activation
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // v7.15.57: Block Mark Complete POSTs while a reviewer has ?student_id= in
        // the request context. The focus-mode template hides the button in review
        // mode, but a malicious viewer could still POST directly — catch it here
        // early in the request (priority 5, before LearnDash processes the form).
        add_action('init', [$this, 'block_review_mark_complete'], 5);
    }

    /**
     * v7.15.57: Refuse LearnDash Mark Complete POSTs made while the request
     * context includes ?student_id=X where X is not the authenticated user.
     * LD's form fires on the current URL, so $_GET['student_id'] is set when
     * a reviewer POSTs from the focus-mode page.
     */
    public function block_review_mark_complete() {
        // LD Mark Complete form always posts the `sfwd_mark_complete` hidden input.
        if (empty($_POST) || empty($_POST['sfwd_mark_complete'])) return;

        $target = absint($_GET['student_id'] ?? ($_POST['student_id'] ?? 0));
        if (!$target) return;

        $viewer = get_current_user_id();
        if ($target === $viewer) return;

        wp_die(
            esc_html__('Cannot mark lessons complete while reviewing another user.', 'sophicly-wml'),
            esc_html__('Review mode', 'sophicly-wml'),
            ['response' => 403, 'back_link' => true]
        );
    }

    /**
     * Register the /writing-mastery-lab/ URL
     */
    public function register_rewrite_rules() {
        add_rewrite_rule(
            '^writing-mastery-lab/?$',
            'index.php?swml_page=1',
            'top'
        );
    }

    public function add_query_vars($vars) {
        $vars[] = 'swml_page';
        return $vars;
    }

    /**
     * Load our custom page template when /writing-mastery-lab/ is hit
     */
    public function load_page_template($template) {
        if (get_query_var('swml_page')) {
            // User must be logged in
            if (!is_user_logged_in()) {
                wp_redirect(wp_login_url(home_url('/writing-mastery-lab/')));
                exit;
            }
            return SWML_PATH . 'templates/page-writing-mastery-lab.php';
        }
        return $template;
    }

    /**
     * Anti-FOUC: inject dark background as early as possible in <head> to prevent white flash.
     * Runs at wp_head priority 1 — before any external CSS loads.
     */
    public function anti_fouc_dark_background() {
        // Check if this is a WML page (standalone or embedded)
        $is_wml = get_query_var('swml_page');
        if (!$is_wml) {
            global $post;
            $is_wml = is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'writing_mastery_lab');
        }
        if (!$is_wml) return;

        echo '<style id="swml-anti-fouc">
            html, body { background: #16181d !important; color: #fff; }
        </style>';
    }

    /**
     * Enqueue frontend assets on the WML page OR any page with [writing_mastery_lab] shortcode
     */
    public function enqueue_assets() {
        // Standalone WML page
        $is_wml_page = get_query_var('swml_page');

        // Embedded mode: detect [writing_mastery_lab] shortcode in current post content (v7.13.12)
        $is_embedded = false;
        if (!$is_wml_page && is_singular()) {
            global $post;
            if ($post && has_shortcode($post->post_content, 'writing_mastery_lab')) {
                $is_embedded = true;
            }
        }

        if (!$is_wml_page && !$is_embedded) return;

        wp_enqueue_style(
            'swml-styles',
            SWML_URL . 'frontend/wml-styles.css',
            [],
            SWML_VERSION
        );

        wp_enqueue_style(
            'swml-theme-toggle',
            SWML_URL . 'frontend/wml-theme-toggle.css',
            [],
            SWML_VERSION
        );

        // Shader background (pure WebGL, no dependencies)
        wp_enqueue_script(
            'swml-shader',
            SWML_URL . 'frontend/wml-shader.js',
            [],
            SWML_VERSION,
            true
        );

        // TipTap rich text editor bundle (exposes window.TipTap)
        wp_enqueue_script(
            'swml-tiptap',
            SWML_URL . 'frontend/wml-tiptap.min.js',
            [],
            SWML_VERSION,
            true
        );

        // Canvas workspace styles
        wp_enqueue_style(
            'swml-canvas',
            SWML_URL . 'frontend/wml-canvas.css',
            ['swml-styles'],
            SWML_VERSION
        );

        // Core module: shared namespace, state, constants, utilities (window.WML)
        wp_enqueue_script(
            'swml-core',
            SWML_URL . 'frontend/wml-core.js',
            [],
            SWML_VERSION,
            true
        );

        // v7.19.78: Shared SectionBlock NodeView factory — must load BEFORE wml-assessment
        // so window.WML.SectionBlock.createNodeView exists when both SectionBlock Node
        // definitions in wml-assessment.js call it via addNodeView().
        wp_enqueue_script(
            'swml-section-block',
            SWML_URL . 'frontend/wml-section-block.js',
            ['swml-core'],
            SWML_VERSION,
            true
        );

        // Assessment module: canvas workspace, document building, TipTap editor
        wp_enqueue_script(
            'swml-assessment',
            SWML_URL . 'frontend/wml-assessment.js',
            ['swml-core', 'swml-section-block', 'swml-tiptap'],
            SWML_VERSION,
            true
        );

        // v7.19.24: Selection-chip module — Tiptap-style floating chip + quick-action
        // menu + mini-chat for the inline-coaching env (task='exam_crib' + Phase 2
        // polish env redesign). Self-registers as window.WML.SelectionChip.
        wp_enqueue_script(
            'swml-selection-chip',
            SWML_URL . 'frontend/wml-selection-chip.js',
            ['swml-core', 'swml-assessment'],
            SWML_VERSION,
            true
        );

        // App module: navigation, planning, chat, boot (loads LAST — contains boot sequence)
        wp_enqueue_script(
            'swml-app',
            SWML_URL . 'frontend/wml-app.js',
            ['swml-core', 'swml-assessment', 'swml-shader'],
            SWML_VERSION,
            true
        );

        // Floating video player (HLS via Bunny Stream)
        wp_enqueue_script(
            'hls-js',
            'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js',
            [],
            null,
            true
        );
        wp_enqueue_style(
            'swml-video-player',
            SWML_URL . 'frontend/wml-video-player.css',
            [],
            SWML_VERSION
        );
        wp_enqueue_script(
            'swml-video-player',
            SWML_URL . 'frontend/wml-video-player.js',
            ['hls-js'],
            SWML_VERSION,
            true
        );

        // Pass config to JS
        // Build course resume URL from LearnDash if available
        $course_resume_url = '';
        $unit_id = absint($_GET['unit_id'] ?? 0);
        if ($unit_id && function_exists('learndash_get_course_id')) {
            $course_id = learndash_get_course_id($unit_id);
            if ($course_id) {
                $course_resume_url = get_permalink($course_id);
                // Try to get exact resume point
                if (function_exists('learndash_get_course_resume_url') && get_current_user_id()) {
                    $resume = learndash_get_course_resume_url($course_id, get_current_user_id());
                    if ($resume) $course_resume_url = $resume;
                }
            }
        }

        // Get user tier from library plugin (SureMembers integration)
        $user_tier = function_exists('sophicly_get_user_tier') ? sophicly_get_user_tier() : 'free';

        // Admin-only tier override for testing: ?tier_test=silver
        if (current_user_can('manage_options') && !empty($_GET['tier_test'])) {
            $test_tier = sanitize_text_field($_GET['tier_test']);
            if (in_array($test_tier, ['free', 'silver', 'gold', 'platinum', 'guest'])) {
                $user_tier = $test_tier;
            }
        }

        // Tutor/parent review mode: resolve student info if ?student_id= is set
        // (v7.15.4 tutor; v7.15.40 parent + embed-path support).
        $embed_review = $this->resolve_review_context();
        $review_mode         = $embed_review['review_mode'];
        $review_role         = $embed_review['review_role'];
        $review_student_id   = $embed_review['student_id'];
        $review_student_name = $embed_review['student_name'];

        wp_localize_script('swml-core', 'swmlConfig', [
            'restUrl'          => rest_url('sophicly-wml/v1/'),
            'wpRestUrl'        => rest_url(),  // Generic WP REST base for cross-plugin calls
            'nonce'            => wp_create_nonce('wp_rest'),
            'userId'           => get_current_user_id(),
            'userName'         => wp_get_current_user()->display_name,
            'userAvatar'       => get_avatar_url(get_current_user_id(), ['size' => 64]),
            'userTier'         => $user_tier,  // 'platinum', 'gold', 'silver', 'free', 'guest'
            'isAdmin'          => current_user_can('manage_options'),
            // v7.15.82: SSS dual-check added (att_role='specialist' OR sophicly_role='sss')
            'canSignOff'       => current_user_can('manage_options')
                                  || get_user_meta(get_current_user_id(), 'sophicly_att_role', true) === 'tutor'
                                  || get_user_meta(get_current_user_id(), 'sophicly_att_role', true) === 'specialist'
                                  || get_user_meta(get_current_user_id(), 'sophicly_role', true) === 'sss',
            'reviewMode'       => $review_mode,
            'reviewRole'       => $review_role,  // v7.15.40: 'tutor' | 'specialist' | 'admin' | 'parent' | ''
            'reviewStudentId'  => $review_student_id,
            'reviewStudentName' => $review_student_name,
            'viewerMode'       => $embed_review['viewer_mode'],    // v7.15.53: 'edit' | 'comment' | 'readonly'
            'targetUserId'     => $embed_review['target_user_id'], // v7.15.53: student whose canvas is being viewed
            // v7.15.76: Feedback-unlock flags for the target student. Falls back
            // to the current user when not in review mode (student self-view).
            // JS gates on viewerMode==='edit' before applying, so tutor/parent
            // review never gains edit access regardless of these values.
            'feedbackUnlocked'       => SWML_Feedback_Unlock::is_global_unlocked($embed_review['target_user_id'] ?: get_current_user_id()),
            'feedbackUnlockedTopics' => SWML_Feedback_Unlock::get_unlocked_topics($embed_review['target_user_id'] ?: get_current_user_id()),
            'dashboardUrl'     => home_url('/my-dashboard/'),
            'libraryUrl'       => home_url('/library/'),
            'pageUrl'          => home_url('/writing-mastery-lab/'),
            'courseResumeUrl'   => $course_resume_url,
            // v7.17.36: LD topic permalink the WML shortcode is embedded in. Stamped
            // onto session_records rows by student-data listeners. Empty on the
            // standalone /writing-mastery-lab/ page (no host lesson).
            'lessonUrl'        => get_queried_object_id() ? get_permalink(get_queried_object_id()) : '',
            'covers'           => get_option('swml_cover_images', []),
            'urlParams'  => [
                'mode'    => sanitize_text_field($_GET['mode'] ?? ''),
                'board'   => sanitize_text_field($_GET['board'] ?? ''),
                'subject' => sanitize_text_field($_GET['subject'] ?? ''),
                'text'    => sanitize_text_field($_GET['text'] ?? ''),
                'task'    => sanitize_text_field($_GET['task'] ?? ''),
                'topic'   => absint($_GET['topic'] ?? 0),
                'poem'    => sanitize_text_field($_GET['poem'] ?? ''),
                'type'    => sanitize_text_field($_GET['type'] ?? ''),
                'draft'   => sanitize_text_field($_GET['draft'] ?? ''),
                'redraft' => sanitize_text_field($_GET['redraft'] ?? ''),
                'unit_id' => absint($_GET['unit_id'] ?? 0),
                'planning_mode' => sanitize_text_field($_GET['planning_mode'] ?? ''),
                'eid'     => sanitize_text_field($_GET['eid'] ?? ''),
                'attempt' => absint($_GET['attempt'] ?? 0),
                'student_id' => $review_student_id,
            ],
        ]);

        // v7.14.16: Embed language paper specs for type-aware document builder
        $specs_file = SWML_PATH . 'protocols/shared/language-paper-specs.json';
        if (file_exists($specs_file)) {
            $specs_json = file_get_contents($specs_file);
            wp_add_inline_script('swml-core', 'window.swmlLangSpecs=' . $specs_json . ';', 'before');
        }

        // v7.15.70: Embed literature paper specs (dormant — WML.resolvePaperShape reads this)
        $lit_specs_file = SWML_PATH . 'protocols/shared/literature-paper-specs.json';
        if (file_exists($lit_specs_file)) {
            $lit_specs_json = file_get_contents($lit_specs_file);
            wp_add_inline_script('swml-core', 'window.swmlLitSpecs=' . $lit_specs_json . ';', 'before');
        }
    }

    /**
     * Register the [wml_button] shortcode for LearnDash integration
     */
    public function register_shortcode() {
        add_shortcode('wml_button', [$this, 'render_launch_button']);
        add_shortcode('writing_mastery_lab', [$this, 'render_embedded_wml']);
    }

    /**
     * Render the "Open The Writing Mastery Lab" button in LearnDash lessons
     * 
     * Usage: [wml_button task="planning"]
     * Usage: [wml_button task="assessment"]
     * Usage: [wml_button task="polishing"]
     * Usage: [wml_button task="exam_question"]
     * Usage: [wml_button board="aqa" subject="shakespeare" text="macbeth" task="planning"]
     * Usage: [wml_button] (no task = shows task picker in WML)
     * 
     * When text is specified, WML skips straight to the workspace.
     * When only board+subject are set, student picks their text in WML.
     */
    public function render_launch_button($atts) {
        $atts = shortcode_atts([
            'board'   => '',
            'subject' => '',
            'text'    => '',
            'task'    => '', // planning | assessment | polishing | exam_question | ''
            'topic'   => '', // Topic number for Mastery Programme (1-10+)
        ], $atts, 'wml_button');

        $unit_id = get_the_ID();

        // Course map takes priority over lesson meta for shared lessons (v7.14.90)
        $board   = $atts['board'];
        $subject = $atts['subject'];
        $text    = $atts['text'];
        $task    = $atts['task'];
        $topic   = $atts['topic'] ?: get_post_meta($unit_id, '_sophicly_topic_number', true);

        $course_id = $this->resolve_current_course_id($unit_id);
        if ($course_id) {
            $ctx = $this->get_embed_course_context($course_id);
            if (!empty($ctx['board']))     $board   = $ctx['board'];
            if (!empty($ctx['text_slug'])) $text    = $ctx['text_slug'];
            if (!empty($ctx['category'] ?? $ctx['type'] ?? '')) {
                $subject = $ctx['category'] ?? $ctx['type'] ?? '';
            }
        }

        // Fall back to lesson post meta
        if (empty($board))   $board   = get_post_meta($unit_id, '_sophicly_exam_board', true);
        if (empty($subject)) $subject = get_post_meta($unit_id, '_sophicly_literature_type', true);

        // If no task specified, try to infer from course_type + lit_type
        if (empty($task)) {
            $lit_type = get_post_meta($unit_id, '_sophicly_lit_type', true);
            $task = self::infer_task_from_lit_type($lit_type);
        }

        // Also read course_type to distinguish literature/language/creative_writing
        $course_type = get_post_meta($unit_id, '_sophicly_course_type', true);
        $is_redraft  = get_post_meta($unit_id, '_sophicly_is_redraft', true);

        $params = [
            'mode'    => 'guided',
            'unit_id' => $unit_id,
        ];
        if ($board)       $params['board']   = $board;
        if ($subject)     $params['subject'] = $subject;
        if ($text)        $params['text']    = $text;
        if ($task)        $params['task']    = $task;
        if ($topic)       $params['topic']   = absint($topic);
        if ($course_type) $params['type']    = $course_type;
        if ($is_redraft)  $params['redraft'] = '1';

        $url = add_query_arg($params, home_url('/writing-mastery-lab/'));

        // Button label adapts to task
        $labels = [
            'planning'      => '📝 Plan Your Essay',
            'assessment'    => '📊 Get Your Essay Assessed',
            'polishing'     => '✨ Polish Your Essay',
            'exam_question' => '✏️ Create an Exam Question',
            'exam_crib'     => '📚 Open Exam Prep Crib',
        ];
        $label = $labels[$task] ?? '✍️ Open The Writing Mastery Lab';

        return sprintf(
            '<a href="%s" target="_blank" rel="noopener" class="swml-launch-btn" style="
                display: inline-flex; align-items: center; gap: 10px;
                padding: 14px 28px; border-radius: 12px;
                background: linear-gradient(135deg, #5333ed, #2c003e);
                color: #fff; font-weight: 600; font-size: 15px;
                text-decoration: none; transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(83,51,237,0.3);
            ">%s</a>',
            esc_url($url),
            esc_html($label)
        );
    }

    /**
     * Render WML embedded inside a LearnDash lesson (v7.13.11)
     *
     * Usage: [writing_mastery_lab task="assessment" phase="initial" topic="1"]
     *        [writing_mastery_lab task="mark_scheme" phase="redraft" topic="1" board="aqa" text="macbeth"]
     *
     * Detects LearnDash Focus Mode and adjusts: strips WML chrome, adds body class,
     * removes LD content padding only for this lesson.
     */
    public function render_embedded_wml($atts) {
        if (!is_user_logged_in()) {
            return '<p>Please log in to access the Writing Mastery Lab.</p>';
        }

        $atts = shortcode_atts([
            'task'    => '',
            'phase'   => '',
            'topic'   => '',
            'step'    => '',
            'board'   => '',
            'subject' => '',
            'text'    => '',
        ], $atts, 'writing_mastery_lab');

        $post_id = get_the_ID();

        // Resolve board/subject/text — course context takes priority over lesson meta
        // for shared lessons (same lesson ID reused across multiple courses). (v7.14.90)
        $task    = sanitize_key($atts['task']);
        $phase   = sanitize_key($atts['phase']);
        $topic   = absint($atts['topic']);
        // v7.17.16: shortcode step attribute (bridge emits this alongside task for mark_scheme_unit).
        // Bridge option at line ~548 still wins (authoritative); shortcode value acts as fallback
        // when the bridge option lookup misses (e.g. new lesson not yet mapped).
        $step_from_shortcode = absint($atts['step']);

        // 1. Try course map first — authoritative for shared lessons
        $board = $atts['board'];
        $subject = $atts['subject'];
        $text = $atts['text'];

        // LearnDash: resolve course ID for shared lessons (v7.14.91)
        // Shared lessons have ONE post ID but appear in multiple courses.
        // The course map is AUTHORITATIVE — it always overrides shortcode attributes
        // because shortcode content is static (baked into the shared lesson's post_content)
        // while the course map dynamically resolves from the current course URL. (v7.14.95)
        $course_id = $this->resolve_current_course_id($post_id);
        if ($course_id) {
            $ctx = $this->get_embed_course_context($course_id);
            if (!empty($ctx['board']))     $board   = $ctx['board'];
            if (!empty($ctx['text_slug'])) $text    = $ctx['text_slug'];
            if (!empty($ctx['category'] ?? $ctx['type'] ?? '')) {
                $subject = $ctx['category'] ?? $ctx['type'] ?? '';
            }
        }

        // v7.15.38: Normalize board slug — course map uses underscore form
        // (edexcel_igcse, cambridge_igcse) but WML frontend + REST API expect
        // hyphenated form (edexcel-igcse, cambridge-igcse). Without this,
        // BOARD_FORMAT_DEFAULTS lookup, REST auto-import filename, and frontend
        // igcse_lang regex all silently fail for IGCSE courses.
        if (!empty($board)) {
            $board = str_replace('_', '-', $board);
        }

        // v7.15.29: For language papers, derive paper-specific subject from text_slug
        // so frontend BOARD_FORMAT_DEFAULTS can find the correct format entry
        // (e.g. 'language' → 'language_p1' for AQA paper 1)
        if ($subject === 'language' && !empty($text)) {
            $paper_slug = SWML_Topic_Questions::text_to_template_slug($text, $board);
            if ($paper_slug && strpos($paper_slug, 'language-') === 0) {
                $subject = str_replace('-', '_', $paper_slug);
            }
        }

        // 2. Bridge mapping is AUTHORITATIVE (v7.17.15)
        // Admin UI mappings override hardcoded shortcode attributes. Previously the
        // bridge only filled task/topic/phase when shortcode left them empty, so
        // shared lessons with baked-in [writing_mastery_lab task="planning"] ignored
        // newer admin UI mappings (e.g. mark_scheme_unit). Bridge also supplies
        // wml_step for multi-step tasks like mark_scheme_unit (step=1 Quiz, step=2 FYW).
        // v7.17.16: seed step from shortcode; bridge option (if present) overrides below.
        $step = $step_from_shortcode;
        if ($course_id) {
            $bridge_map = get_option('sophicly_ld_bridge_' . $course_id, []);
            $bridge_entry = $bridge_map[(string)$post_id] ?? [];
            if (!empty($bridge_entry['wml_topic'])) {
                $topic = absint($bridge_entry['wml_topic']);
            }
            if (!empty($bridge_entry['wml_task'])) {
                $task = sanitize_key($bridge_entry['wml_task']);
            }
            if (!empty($bridge_entry['wml_phase'])) {
                $phase = sanitize_key($bridge_entry['wml_phase']);
            }
            if (!empty($bridge_entry['wml_step'])) {
                $step = absint($bridge_entry['wml_step']);
            }
        }

        // v7.19.1: dropped v7.19.0 FYW post-title regex heuristic. It never fired
        // on Neil's 2026-05-02 staging test — LD lesson titles for FYW lessons are
        // generic (no "forging/forge/weapon/FYW" wording). Bridge admin UI
        // (`wml_step` field at L574-576) is the single source of truth. FYW mount
        // race fix = bridge data backfill (`wml_step=2` for all FYW lessons across
        // boards × subjects), tracked separately as a manual data-ops pass.

        // 3. Fall back to lesson post meta if course map didn't resolve
        if (empty($board))   $board   = get_post_meta($post_id, '_sophicly_exam_board', true);
        if (empty($subject)) $subject = get_post_meta($post_id, '_sophicly_literature_type', true);

        // Detect LearnDash Focus Mode (template = focus, or body has ld-in-focus-mode)
        $in_focus_mode = false;
        if (function_exists('learndash_get_active_theme_key')) {
            $ld_theme = learndash_get_active_theme_key();
            $in_focus_mode = ($ld_theme === 'ld30'); // LD30 = Focus Mode theme
        }
        // Also check if this is a LearnDash topic at all
        $is_ld_topic = (get_post_type($post_id) === 'sfwd-topic');

        // Assets should be enqueued by enqueue_assets() via has_shortcode() detection.
        // But on LD Focus Mode pages, $post may not be set during wp_enqueue_scripts,
        // so we also enqueue here as fallback. Footer scripts still work from the_content. (v7.13.13)
        $this->enqueue_embed_assets();

        // Build the embedded config — JS reads this instead of URL params
        $embed_config = [
            'embedded'    => true,
            'focusMode'   => $in_focus_mode,
            'isLdTopic'   => $is_ld_topic,
            'postId'      => $post_id,
            'task'        => $task,
            'phase'       => $phase,
            'topic'       => $topic,
            'step'        => $step,
            'board'       => $board,
            'subject'     => $subject,
            'text'        => $text,
        ];


        // Inline CSS: embedded mode layout fixes (v7.13.14)
        $css = '<style>
            /* v7.14.20: #swml-root in embedded mode — no height, no overflow trap */
            #swml-root.swml-embedded { min-height: 0; height: auto; overflow: visible; }

            /* Embedded host fills content area */
            .swml-embedded-host { width: 100%; }
        </style>';
        if ($is_ld_topic) {
            $css .= '<style>
                /* Remove LD content padding around WML (v7.13.14) */
                body.swml-has-embed .spl-entry { padding: 0 !important; margin: 0 !important; }
                body.swml-has-embed .spl-content { padding-left: 0 !important; padding-right: 0 !important; max-width: 100% !important; }
                body.swml-has-embed .ld-focus-content .ld-tab-content { padding: 0 !important; }
                body.swml-has-embed .ld-focus-content .learndash_content_wrap { padding: 0 !important; }

                /* v7.14.16: Ensure sticky canvas positioning works — ancestors need overflow:visible */
                body.swml-has-embed .spl-content,
                body.swml-has-embed .ld-focus-content,
                body.swml-has-embed .ld-tab-content,
                body.swml-has-embed .learndash_content_wrap { overflow: visible !important; }

                /* Keep padding on LD header (progress bar, COMPLETE button) */
                body.swml-has-embed .spl-content-header { padding: 16px 30px; }

                /* v7.14.20: LD bottom navigation — flush, no extra padding */
                body.swml-has-embed .spl-nav,
                body.swml-has-embed .ld-content-actions,
                body.swml-has-embed .learndash-wrapper .ld-content-actions { padding: 0 !important; }

                /* Hide LD lesson title when WML is embedded — title is redundant */
                body.swml-has-embed .spl-content-header .spl-title { display: none; }
            </style>';
        }

        // Body class injection via inline script
        $body_class_js = '<script>document.body.classList.add("swml-has-embed");</script>';

        ob_start();
        echo $css;
        echo $body_class_js;
        // CRITICAL: inner div must be #swml-root — the JS boot sequence looks for this ID
        echo '<div id="swml-embedded-root" class="swml-embedded-host" data-swml-embed="' . esc_attr(wp_json_encode($embed_config)) . '">';
        echo '<div id="swml-root" class="swml-app swml-embedded"></div>';
        echo '</div>';

        // Pass embed config to JS — must be BEFORE wml-app.js boots
        echo '<script>window.swmlEmbedConfig = ' . wp_json_encode($embed_config) . ';</script>';

        return ob_get_clean();
    }

    /**
     * Enqueue WML assets for embedded mode (called from shortcode render)
     */
    private function enqueue_embed_assets() {
        // Styles
        wp_enqueue_style('swml-styles', SWML_URL . 'frontend/wml-styles.css', [], SWML_VERSION);
        wp_enqueue_style('swml-theme-toggle', SWML_URL . 'frontend/wml-theme-toggle.css', [], SWML_VERSION);
        wp_enqueue_style('swml-canvas', SWML_URL . 'frontend/wml-canvas.css', ['swml-styles'], SWML_VERSION);

        // Scripts
        wp_enqueue_script('swml-shader', SWML_URL . 'frontend/wml-shader.js', [], SWML_VERSION, true);
        wp_enqueue_script('swml-tiptap', SWML_URL . 'frontend/wml-tiptap.min.js', [], SWML_VERSION, true);
        wp_enqueue_script('swml-core', SWML_URL . 'frontend/wml-core.js', [], SWML_VERSION, true);
        // v7.19.78: shared SectionBlock NodeView factory — load before wml-assessment.
        wp_enqueue_script('swml-section-block', SWML_URL . 'frontend/wml-section-block.js', ['swml-core'], SWML_VERSION, true);
        wp_enqueue_script('swml-assessment', SWML_URL . 'frontend/wml-assessment.js', ['swml-core', 'swml-section-block', 'swml-tiptap'], SWML_VERSION, true);
        wp_enqueue_script('swml-app', SWML_URL . 'frontend/wml-app.js', ['swml-core', 'swml-assessment', 'swml-shader'], SWML_VERSION, true);

        // Video player
        wp_enqueue_script('hls-js', 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js', [], null, true);
        wp_enqueue_style('swml-video-player', SWML_URL . 'frontend/wml-video-player.css', [], SWML_VERSION);
        wp_enqueue_script('swml-video-player', SWML_URL . 'frontend/wml-video-player.js', ['hls-js'], SWML_VERSION, true);

        // User tier
        $user_tier = function_exists('sophicly_get_user_tier') ? sophicly_get_user_tier() : 'free';

        // Localize swmlConfig (if not already done by standalone page)
        if (!wp_script_is('swml-core', 'done')) {
            // v7.15.40: review mode must work in embedded (LearnDash lesson) context
            // too, not just on the standalone /writing-mastery-lab/ page. Parent
            // read-only access + tutor review both gate off $_GET['student_id'].
            $embed_review = $this->resolve_review_context();

            wp_localize_script('swml-core', 'swmlConfig', [
                'restUrl'        => rest_url('sophicly-wml/v1/'),
                'wpRestUrl'      => rest_url(),
                'nonce'          => wp_create_nonce('wp_rest'),
                'userId'         => get_current_user_id(),
                'userName'       => wp_get_current_user()->display_name,
                'userAvatar'     => get_avatar_url(get_current_user_id(), ['size' => 64]),
                'userTier'       => $user_tier,
                'isAdmin'        => current_user_can('manage_options'),
                // v7.15.82: SSS dual-check added
                'canSignOff'     => current_user_can('manage_options')
                                    || get_user_meta(get_current_user_id(), 'sophicly_att_role', true) === 'tutor'
                                    || get_user_meta(get_current_user_id(), 'sophicly_att_role', true) === 'specialist'
                                    || get_user_meta(get_current_user_id(), 'sophicly_role', true) === 'sss',
                'reviewMode'        => $embed_review['review_mode'],
                'reviewRole'        => $embed_review['review_role'],
                'reviewStudentId'   => $embed_review['student_id'],
                'reviewStudentName' => $embed_review['student_name'],
                'viewerMode'        => $embed_review['viewer_mode'],
                'targetUserId'      => $embed_review['target_user_id'],
                // v7.15.76: Feedback-unlock flags for target student (self if not review).
                'feedbackUnlocked'       => SWML_Feedback_Unlock::is_global_unlocked($embed_review['target_user_id'] ?: get_current_user_id()),
                'feedbackUnlockedTopics' => SWML_Feedback_Unlock::get_unlocked_topics($embed_review['target_user_id'] ?: get_current_user_id()),
                'dashboardUrl'   => home_url('/my-dashboard/'),
                'libraryUrl'     => home_url('/library/'),
                'pageUrl'        => home_url('/writing-mastery-lab/'),
                'courseResumeUrl' => '',
                // v7.17.36: LD topic permalink for student-data lesson_url stamping.
                'lessonUrl'      => get_queried_object_id() ? get_permalink(get_queried_object_id()) : '',
                'covers'         => get_option('swml_cover_images', []),
                'urlParams'      => [
                    'mode' => 'guided', 'board' => '', 'subject' => '', 'text' => '',
                    'task' => '', 'topic' => 0, 'poem' => '', 'type' => '',
                    'draft' => '', 'redraft' => '', 'unit_id' => 0,
                    'student_id' => $embed_review['student_id'],
                ],
            ]);
        } else {
            // v7.14.16: Refresh nonce for LD Focus Mode AJAX transitions
            wp_add_inline_script('swml-core', 'if(window.swmlConfig) swmlConfig.nonce="' . wp_create_nonce('wp_rest') . '";');
        }

        // v7.14.16: Embed language paper specs for type-aware document builder
        $specs_file = SWML_PATH . 'protocols/shared/language-paper-specs.json';
        if (file_exists($specs_file)) {
            $specs_json = file_get_contents($specs_file);
            wp_add_inline_script('swml-core', 'window.swmlLangSpecs=' . $specs_json . ';', 'before');
        }

        // v7.15.70: Embed literature paper specs (dormant — WML.resolvePaperShape reads this)
        $lit_specs_file = SWML_PATH . 'protocols/shared/literature-paper-specs.json';
        if (file_exists($lit_specs_file)) {
            $lit_specs_json = file_get_contents($lit_specs_file);
            wp_add_inline_script('swml-core', 'window.swmlLitSpecs=' . $lit_specs_json . ';', 'before');
        }
    }

    /**
     * v7.15.40: Resolve review-mode context from $_GET['student_id'].
     * Used by both the standalone page handler AND the embedded shortcode
     * handler so review mode works in either context (direct /writing-mastery-lab/
     * URL OR inside a LearnDash lesson that embeds WML via shortcode).
     *
     * Returns:
     *   review_mode   bool     — true when a valid viewer is viewing another student
     *   review_role   string   — 'tutor' | 'specialist' | 'admin' | 'parent' | ''
     *   student_id    int      — student being viewed (0 if not review mode)
     *   student_name  string   — student's first or display name
     *
     * Parent check: user has sophicly_role='parent' (or att_role='parent')
     * AND an active row in wp_sophicly_connections linking them to the student.
     * Parents can READ but cannot comment (enforced at REST + frontend layers).
     */
    private function resolve_review_context() {
        $out = [
            'review_mode'    => false,
            'review_role'    => '',
            'student_id'     => 0,
            'student_name'   => '',
            'viewer_mode'    => 'edit',
            'target_user_id' => 0,
        ];
        $student_id = absint($_GET['student_id'] ?? 0);
        if (!$student_id) return $out;

        $current_uid = get_current_user_id();
        if (!$current_uid) return $out;

        $viewer_mode = self::resolve_viewer_mode($current_uid, $student_id);
        if ($viewer_mode === false || $viewer_mode === 'edit') return $out;

        $att_role      = get_user_meta($current_uid, 'sophicly_att_role', true);
        $sophicly_role = get_user_meta($current_uid, 'sophicly_role', true);

        if (current_user_can('manage_options')) {
            $role = 'admin';
        } elseif ($att_role === 'tutor') {
            $role = 'tutor';
        } elseif ($att_role === 'specialist' || $sophicly_role === 'sss') {
            $role = 'specialist';
        } else {
            $role = 'parent';
        }

        $student = get_userdata($student_id);
        if (!$student) return $out;

        return [
            'review_mode'    => true,
            'review_role'    => $role,
            'student_id'     => $student_id,
            'student_name'   => $student->first_name ?: $student->display_name,
            'viewer_mode'    => $viewer_mode,
            'target_user_id' => $student_id,
        ];
    }

    /**
     * Resolve the viewer's permission tier for a target student's canvas.
     * Single source of truth for viewer-mode gating (v7.15.53).
     *
     * Returns 'edit' | 'comment' | 'readonly' | false.
     *   edit     — viewer is the student themselves.
     *   comment  — admin/tutor/specialist; can view any student and add comments.
     *              Tutor scoping is deliberately NOT enforced: Sophicly runs
     *              catch-up lessons where any tutor may need access to any
     *              student's work, regardless of group assignment.
     *   readonly — parent with an ACTIVE sophicly_connections row to the target.
     *              The connections table uses both 'active' and 'connected' as
     *              linked states (legacy drift), so both are accepted.
     *   false    — no permission.
     *
     * See CLAUDE.md "Sophicly role + permission conventions" for the role model.
     */
    public static function resolve_viewer_mode($viewer_id, $target_user_id) {
        $viewer_id      = absint($viewer_id);
        $target_user_id = absint($target_user_id);
        if (!$viewer_id || !$target_user_id) return false;
        if ($viewer_id === $target_user_id) return 'edit';

        if (user_can($viewer_id, 'manage_options')) return 'comment';

        $att_role      = get_user_meta($viewer_id, 'sophicly_att_role', true);
        $sophicly_role = get_user_meta($viewer_id, 'sophicly_role', true);

        if ($att_role === 'tutor' || $att_role === 'specialist' || $sophicly_role === 'sss') {
            return 'comment';
        }

        if ($sophicly_role === 'parent' || $att_role === 'parent') {
            global $wpdb;
            $table = $wpdb->prefix . 'sophicly_connections';
            $linked = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$table}
                 WHERE parent_id = %d AND student_id = %d
                 AND status IN ('active', 'connected')
                 LIMIT 1",
                $viewer_id, $target_user_id
            ));
            if ($linked) return 'readonly';
        }

        return false;
    }

    /**
     * Resolve the CURRENT course ID for a LearnDash topic/lesson post.
     * For shared lessons, learndash_get_course_id() returns the PRIMARY course,
     * not the one the student is currently browsing. This method tries multiple
     * strategies to get the correct current course. (v7.14.91)
     */
    private function resolve_current_course_id($post_id) {
        $debug = defined('SWML_DEBUG_COURSE_RESOLVE') && SWML_DEBUG_COURSE_RESOLVE;
        if ($debug) error_log("[SWML] resolve_course START: post_id={$post_id} uri=" . ($_SERVER['REQUEST_URI'] ?? 'none'));

        // 1. Explicit request param (URL or AJAX POST)
        if (!empty($_REQUEST['course_id'])) {
            $cid = absint($_REQUEST['course_id']);
            if ($debug) error_log("[SWML] resolve_course: strategy=request_param course_id={$cid}");
            return $cid;
        }

        // 2. LD course slug query var — LD rewrite rules parse /courses/{slug}/ into this (v7.14.95)
        //    This is exactly how learndash_get_course_id() resolves shared steps internally.
        //    We do it ourselves FIRST to avoid LD's fallback to post_meta which returns the primary course.
        $course_slug = get_query_var('sfwd-courses', '');
        if (!empty($course_slug)) {
            if (function_exists('learndash_get_page_by_path')) {
                $course_post = learndash_get_page_by_path($course_slug, 'sfwd-courses');
            } else {
                $course_post = get_page_by_path($course_slug, OBJECT, 'sfwd-courses');
            }
            if ($course_post && $course_post instanceof WP_Post) {
                $cid = (int) $course_post->ID;
                if ($debug) error_log("[SWML] resolve_course: strategy=ld_course_slug slug={$course_slug} course_id={$cid}");
                return $cid;
            }
        }

        // 3. LD query var 'course_id' — some LD setups use this
        $ld_course = get_query_var('course_id', 0);
        if ($ld_course) {
            if ($debug) error_log("[SWML] resolve_course: strategy=query_var_course_id course_id={$ld_course}");
            return absint($ld_course);
        }

        // 4. Parse from URL — fallback regex for LD permalink structures (v7.14.95)
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        if (preg_match('#/(?:courses|sfwd-courses)/([^/]+)/#', $uri, $m)) {
            $course_posts = get_posts([
                'name'        => $m[1],
                'post_type'   => 'sfwd-courses',
                'numberposts' => 1,
                'fields'      => 'ids',
            ]);
            if (!empty($course_posts)) {
                $cid = (int) $course_posts[0];
                if ($debug) error_log("[SWML] resolve_course: strategy=url_parse slug={$m[1]} course_id={$cid}");
                return $cid;
            }
        }

        // 5. Reverse lookup: if lesson is in only one course, use it (v7.14.95)
        if (function_exists('learndash_get_courses_for_step')) {
            $course_ids = learndash_get_courses_for_step($post_id);
            if (is_array($course_ids) && count($course_ids) === 1) {
                $cid = (int) reset($course_ids);
                if ($debug) error_log("[SWML] resolve_course: strategy=reverse_lookup course_id={$cid}");
                return $cid;
            }
        }

        // 6. Fallback: LD's standard function (returns primary course for shared lessons)
        if (function_exists('learndash_get_course_id')) {
            $cid = (int) learndash_get_course_id($post_id);
            if ($debug) error_log("[SWML] resolve_course: strategy=ld_fallback course_id={$cid}");
            return $cid;
        }

        if ($debug) error_log("[SWML] resolve_course: strategy=NONE");
        return 0;
    }

    /**
     * Get board/text context from a course ID via the course map
     */
    private function get_embed_course_context($course_id) {
        // v7.17.57: Delegate to bridge so meta-registered courses (Course
        // Context Metabox in student-data v2.29.0+) resolve correctly. The
        // bridge reads post_meta first, falls back to sophicly_get_course_map().
        // Falls through to map-only iteration if bridge class isn't available.
        if (class_exists('Sophicly_LearnDash_Bridge')) {
            $ctx = Sophicly_LearnDash_Bridge::init()->get_course_context((int) $course_id);
            if (!empty($ctx['text_slug'])) {
                return [
                    'board'     => $ctx['board'] ?? '',
                    'text_slug' => $ctx['text_slug'],
                    'type'      => $ctx['type'] ?? '',
                    'category'  => $ctx['category'] ?? '',
                ];
            }
            return [];
        }

        $course_map = function_exists('sophicly_get_course_map') ? sophicly_get_course_map() : [];
        foreach ($course_map as $text_slug => $boards) {
            foreach ($boards as $board => $cid) {
                if (strpos($board, '_') === 0) continue;
                if ((int) $cid === (int) $course_id) {
                    return [
                        'board'     => $board,
                        'text_slug' => $text_slug,
                        'type'      => $boards['_type'] ?? '',
                        'category'  => $boards['_category'] ?? '',
                    ];
                }
            }
        }
        return [];
    }

    /**
     * Infer the WML task from the student-data lit_type field
     */
    private static function infer_task_from_lit_type($lit_type) {
        $map = [
            'diagnostic_essay'       => 'assessment',
            'redraft_essay'          => 'assessment',
            'extended_essay'         => 'assessment',
            'exam_practice'          => 'assessment',
            'mark_scheme_assessment' => 'assessment',
            'conceptual_notes'       => '', // doesn't map to WML
            'foundational_quiz'      => 'foundational_quiz',
        ];
        return $map[$lit_type] ?? '';
    }

    public function activate() {
        $this->register_rewrite_rules();
        flush_rewrite_rules();
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    // ═══════════════════════════════════════════
    //  COVER IMAGES ADMIN
    // ═══════════════════════════════════════════

    public function add_covers_menu() {
        $parent = class_exists('Sophicly_Admin_Hub') ? 'sophicly' : 'options-general.php';
        add_submenu_page(
            $parent,
            'WML Cover Images',
            'WML Covers',
            'manage_options',
            'sophicly-wml-covers',
            [$this, 'render_covers_page']
        );
    }

    public function render_covers_page() {
        global $wpdb;
        $covers = get_option('swml_cover_images', []);

        // Enumerate all texts and topic counts from the topic bank
        $rows = $wpdb->get_results("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE 'swml_topics_%'");
        $texts = [];
        foreach ($rows as $row) {
            $parts = explode('_', str_replace('swml_topics_', '', $row->option_name), 2);
            if (count($parts) === 2) {
                $board = $parts[0];
                $text = $parts[1];
                $topics = get_option($row->option_name, []);
                $count = is_array($topics) ? count($topics) : 0;
                if (!isset($texts[$text]) || $texts[$text] < $count) {
                    $texts[$text] = $count; // Keep highest topic count across boards
                }
            }
        }
        ksort($texts);

        // Standard exercise types
        $exercises = ['conceptual_notes', 'random_quote', 'exam_question', 'essay_plan', 'model_answer', 'memory_practice'];

        // Build all possible keys as JSON for JS
        $all_keys = [];
        foreach ($texts as $text => $topicCount) {
            $label = ucwords(str_replace(['-', '_'], ' ', $text));
            $all_keys[] = ['key' => $text, 'label' => "$label (default)"];
            for ($i = 1; $i <= $topicCount; $i++) {
                $all_keys[] = ['key' => "$text:topic_$i", 'label' => "$label — Topic $i"];
            }
            foreach ($exercises as $ex) {
                $exLabel = ucwords(str_replace('_', ' ', $ex));
                $all_keys[] = ['key' => "$text:$ex", 'label' => "$label — $exLabel"];
            }
        }
        $keys_json = wp_json_encode($all_keys);
        ?>
        <div class="wrap">
            <h1>WML Cover Images</h1>
            <p>Select a text and exercise from the dropdown, then paste the <strong>Bunny CDN URL</strong>.<br>
            Recommended size: <code>1440 × 2036px</code> (A4 ratio, 2× retina). Images display as full-bleed first page in the canvas and Word export.</p>
            <div id="swml-covers-app" style="max-width:900px">
                <table class="wp-list-table widefat striped" id="swml-covers-table">
                    <thead><tr><th style="width:35%">Text + Exercise</th><th>CDN URL</th><th style="width:60px">Preview</th><th style="width:50px"></th></tr></thead>
                    <tbody>
                    <?php foreach ($covers as $key => $url): ?>
                        <tr>
                            <td><select class="swml-cover-key" style="width:100%"><option value="<?php echo esc_attr($key); ?>"><?php echo esc_html($key); ?></option></select></td>
                            <td><input type="url" class="swml-cover-url large-text" value="<?php echo esc_attr($url); ?>" style="width:100%"></td>
                            <td><?php if ($url): ?><img src="<?php echo esc_url($url); ?>" style="height:40px;border-radius:3px"><?php endif; ?></td>
                            <td><button type="button" class="button swml-cover-remove" style="color:#d63638">✕</button></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <p style="margin-top:12px">
                    <button type="button" class="button" id="swml-cover-add">+ Add Cover</button>
                    <button type="button" class="button button-primary" id="swml-cover-save" style="margin-left:8px">Save All</button>
                    <span id="swml-cover-status" style="margin-left:12px;color:#1CD991;font-weight:600"></span>
                </p>
            </div>
            <script>
            (function(){
                const allKeys = <?php echo $keys_json; ?>;
                const tbl = document.getElementById('swml-covers-table').querySelector('tbody');

                function buildSelect(selectedKey) {
                    const sel = document.createElement('select');
                    sel.className = 'swml-cover-key';
                    sel.style.width = '100%';
                    const blank = document.createElement('option');
                    blank.value = ''; blank.textContent = '— Select —';
                    sel.appendChild(blank);
                    let currentGroup = null, optgroup = null;
                    allKeys.forEach(k => {
                        const text = k.key.split(':')[0];
                        const groupLabel = text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        if (text !== currentGroup) {
                            currentGroup = text;
                            optgroup = document.createElement('optgroup');
                            optgroup.label = groupLabel;
                            sel.appendChild(optgroup);
                        }
                        const opt = document.createElement('option');
                        opt.value = k.key;
                        opt.textContent = k.label;
                        if (k.key === selectedKey) opt.selected = true;
                        (optgroup || sel).appendChild(opt);
                    });
                    return sel;
                }

                // Populate dropdowns for existing rows
                tbl.querySelectorAll('tr').forEach(tr => {
                    const oldSel = tr.querySelector('.swml-cover-key');
                    if (!oldSel) return;
                    const key = oldSel.value;
                    const newSel = buildSelect(key);
                    oldSel.replaceWith(newSel);
                });

                document.getElementById('swml-cover-add').addEventListener('click', () => {
                    const tr = document.createElement('tr');
                    const tdSel = document.createElement('td'); tdSel.appendChild(buildSelect('')); tr.appendChild(tdSel);
                    const tdUrl = document.createElement('td'); tdUrl.innerHTML = '<input type="url" class="swml-cover-url large-text" placeholder="https://sophicly.b-cdn.net/covers/..." style="width:100%">'; tr.appendChild(tdUrl);
                    const tdPrev = document.createElement('td'); tr.appendChild(tdPrev);
                    const tdDel = document.createElement('td'); tdDel.innerHTML = '<button type="button" class="button swml-cover-remove" style="color:#d63638">✕</button>'; tr.appendChild(tdDel);
                    tbl.appendChild(tr);
                });

                tbl.addEventListener('click', e => { if (e.target.classList.contains('swml-cover-remove')) e.target.closest('tr').remove(); });

                document.getElementById('swml-cover-save').addEventListener('click', () => {
                    const covers = {};
                    tbl.querySelectorAll('tr').forEach(tr => {
                        const key = tr.querySelector('.swml-cover-key')?.value?.trim();
                        const url = tr.querySelector('.swml-cover-url')?.value?.trim();
                        if (key && url) covers[key] = url;
                    });
                    fetch('<?php echo esc_url(rest_url('sophicly-wml/v1/covers')); ?>', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>' },
                        body: JSON.stringify({ covers })
                    }).then(r => r.json()).then(res => {
                        document.getElementById('swml-cover-status').textContent = res.success ? '✓ Saved' : '✕ Error';
                        setTimeout(() => document.getElementById('swml-cover-status').textContent = '', 3000);
                    });
                });
            })();
            </script>
        </div>
        <?php
    }

    /**
     * One-time migration: AQA Shakespeare + Modern Text marks 30 → 34 (v7.14.6).
     *
     * AO4 (4 marks) is absorbed into the content total per our assessment principle.
     * Updates any existing topic data in the database where marks=30 and ao4=4.
     */
    public function migrate_aqa_marks_v7146() {
        if (get_option('swml_migrated_aqa_marks_v7146')) return;

        global $wpdb;
        $rows = $wpdb->get_results(
            "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'swml_topics_aqa_%'",
            ARRAY_A
        );

        $updated = 0;
        foreach ($rows as $row) {
            $topics = maybe_unserialize($row['option_value']);
            if (!is_array($topics)) continue;

            $changed = false;
            foreach ($topics as &$t) {
                $marks = (int) ($t['marks'] ?? 0);
                $ao4   = (int) ($t['ao4'] ?? 0);
                if ($marks === 30 && $ao4 === 4) {
                    $t['marks'] = 34;
                    $changed = true;
                }
            }
            unset($t);

            if ($changed) {
                update_option($row['option_name'], $topics, false);
                $updated++;
            }
        }

        update_option('swml_migrated_aqa_marks_v7146', true, false);
        if ($updated > 0) {
            error_log("WML Migration v7.14.6: Updated marks 30→34 for {$updated} AQA text(s)");
        }
    }
}

// Boot the plugin
add_action('plugins_loaded', function() {
    Sophicly_Writing_Mastery_Lab::instance();
});
