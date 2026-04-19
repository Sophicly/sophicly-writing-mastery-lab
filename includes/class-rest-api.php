<?php
/**
 * SWML REST API
 * 
 * Custom REST endpoints for the Writing Mastery Lab frontend.
 */

if (!defined('ABSPATH')) exit;

class SWML_REST_API {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('sophicly_canvas_saved', [$this, 'maybe_extract_exam_questions'], 10, 7);
    }

    public function register_routes() {
        $namespace = 'sophicly-wml/v1';

        register_rest_route($namespace, '/session', [
            'methods' => 'POST', 'callback' => [$this, 'handle_session'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/session', [
            'methods' => 'GET', 'callback' => [$this, 'get_session'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/plan/element', [
            'methods' => 'POST', 'callback' => [$this, 'save_session_element'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/session/element', [
            'methods' => 'POST', 'callback' => [$this, 'save_session_element'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/plan', [
            'methods' => 'GET', 'callback' => [$this, 'get_plan'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/progress', [
            'methods' => 'POST', 'callback' => [$this, 'update_progress'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/resources', [
            'methods' => 'GET', 'callback' => [$this, 'get_resources'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/question/(?P<unit_id>\d+)', [
            'methods' => 'GET', 'callback' => [$this, 'get_unit_question'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/student/reminders', [
            'methods' => 'GET', 'callback' => [$this, 'get_student_reminders'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Chat proxy
        register_rest_route($namespace, '/chat', [
            'methods' => 'POST', 'callback' => [$this, 'handle_chat'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Session save (auto-save + manual save)
        register_rest_route($namespace, '/session/save', [
            'methods' => 'POST', 'callback' => [$this, 'save_session_data'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // List past sessions (portfolio)
        register_rest_route($namespace, '/sessions', [
            'methods' => 'GET', 'callback' => [$this, 'list_sessions'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Load a specific session (resume)
        register_rest_route($namespace, '/session/load', [
            'methods' => 'GET', 'callback' => [$this, 'load_session_data'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Delete a session
        register_rest_route($namespace, '/session/delete', [
            'methods' => 'POST', 'callback' => [$this, 'delete_session'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Saved exam questions — for essay plan question selection
        register_rest_route($namespace, '/saved-questions', [
            'methods' => 'GET', 'callback' => [$this, 'get_saved_questions'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/saved-questions', [
            'methods' => 'POST', 'callback' => [$this, 'save_question'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Question bank — dashboard aggregation endpoints (v7.14.84)
        register_rest_route($namespace, '/question-bank/all', [
            'methods' => 'GET', 'callback' => [$this, 'get_all_question_banks'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/question-bank', [
            'methods' => 'GET', 'callback' => [$this, 'get_question_bank'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Safe diagnostic — probes AI Engine without calling it
        register_rest_route($namespace, '/debug', [
            'methods' => 'GET', 'callback' => [$this, 'handle_debug'],
            'permission_callback' => [$this, 'check_admin_auth'],
        ]);

        // Canvas document save/load (server-side persistence)
        register_rest_route($namespace, '/canvas/save', [
            'methods' => 'POST', 'callback' => [$this, 'save_canvas'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/canvas/load', [
            'methods' => 'GET', 'callback' => [$this, 'load_canvas'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/canvas/list', [
            'methods' => 'GET', 'callback' => [$this, 'list_canvas_documents'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // v7.14.66: Protocol manifest step labels — for sidebar
        register_rest_route($namespace, '/protocol-steps', [
            'methods' => 'GET', 'callback' => [$this, 'get_protocol_steps'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Diagnostic endpoint — lists all canvas meta keys for current user (admin only, v7.15.2)
        register_rest_route($namespace, '/canvas/debug', [
            'methods' => 'GET', 'callback' => [$this, 'debug_canvas_keys'],
            'permission_callback' => [$this, 'check_admin_auth'],
        ]);

        // Tutor sign-off — role-restricted
        register_rest_route($namespace, '/canvas/signoff', [
            'methods' => 'POST', 'callback' => [$this, 'tutor_signoff'],
            'permission_callback' => [$this, 'check_tutor_auth'],
        ]);

        // Tutor review — load student canvas/chat (v7.15.2)
        register_rest_route($namespace, '/canvas/review', [
            'methods' => 'GET', 'callback' => [$this, 'tutor_load_canvas'],
            'permission_callback' => [$this, 'check_tutor_auth'],
        ]);
        register_rest_route($namespace, '/canvas/review-chat', [
            'methods' => 'GET', 'callback' => [$this, 'tutor_load_canvas_chat'],
            'permission_callback' => [$this, 'check_tutor_auth'],
        ]);

        // Tutor comment — save comments on student's canvas (v7.15.30)
        register_rest_route($namespace, '/canvas/tutor-comment', [
            'methods' => 'POST', 'callback' => [$this, 'tutor_save_comments'],
            'permission_callback' => [$this, 'check_tutor_auth'],
        ]);

        // Load sign-off data for a canvas document
        register_rest_route($namespace, '/canvas/load-signoff', [
            'methods' => 'GET', 'callback' => [$this, 'load_signoff'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Cover images — admin only for writes
        register_rest_route($namespace, '/covers', [
            'methods' => 'GET', 'callback' => [$this, 'get_covers'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/covers', [
            'methods' => 'POST', 'callback' => [$this, 'save_covers'],
            'permission_callback' => [$this, 'check_admin_auth'],
        ]);

        // Phase completion — mark a phase as complete
        register_rest_route($namespace, '/phase/complete', [
            'methods' => 'POST', 'callback' => [$this, 'complete_phase'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Phase status — read completion data (used by phase overview)
        register_rest_route($namespace, '/phase/status', [
            'methods' => 'GET', 'callback' => [$this, 'get_phase_status'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // v7.15.12: Attempt management endpoints
        register_rest_route($namespace, '/attempts', [
            'methods' => 'GET', 'callback' => [$this, 'get_attempts'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/attempts/new', [
            'methods' => 'POST', 'callback' => [$this, 'create_attempt'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/attempts/switch', [
            'methods' => 'POST', 'callback' => [$this, 'switch_attempt'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/attempts/complete', [
            'methods' => 'POST', 'callback' => [$this, 'complete_attempt'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // v7.15.78: Flat list of ALL the student's attempts across every
        // (board, text, topic, suffix) combo. Powers the standalone feedback-
        // discussion picker so students can pull in a prior attempt to discuss.
        register_rest_route($namespace, '/student/attempts-all', [
            'methods' => 'GET', 'callback' => [$this, 'get_all_attempts'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // v7.15.51: Topic-scoped "resume" resolver — given (board, text, topic),
        // returns the URL of the first not-complete LD lesson in that topic's
        // WML-task sequence. Used by the diagnostic attempt overlay's Continue
        // button to deep-link the student back to where they left off WITHIN the
        // topic. Topics are self-contained in WML, so this search is topic-scoped.
        register_rest_route($namespace, '/topic-resume', [
            'methods' => 'GET', 'callback' => [$this, 'get_topic_resume'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Canvas chat persistence — save/load/clear assessment chat
        register_rest_route($namespace, '/canvas/chat-save', [
            'methods' => 'POST', 'callback' => [$this, 'save_canvas_chat'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/canvas/chat-load', [
            'methods' => 'GET', 'callback' => [$this, 'load_canvas_chat'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/canvas/chat-clear', [
            'methods' => 'POST', 'callback' => [$this, 'clear_canvas_chat'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Learning profile — aggregated cross-text feedback
        register_rest_route($namespace, '/learning-profile', [
            'methods' => 'GET', 'callback' => [$this, 'get_learning_profile'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Creative writing project storage (v7.13.30)
        register_rest_route($namespace, '/cw-project', [
            'methods' => 'POST', 'callback' => [$this, 'save_cw_project'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/cw-project', [
            'methods' => 'GET', 'callback' => [$this, 'load_cw_project'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/cw-project/artifact', [
            'methods' => 'POST', 'callback' => [$this, 'save_cw_artifact'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/cw-project/artifact', [
            'methods' => 'GET', 'callback' => [$this, 'load_cw_artifact'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/cw-project/trial', [
            'methods' => 'POST', 'callback' => [$this, 'save_cw_trial'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/cw-project/step', [
            'methods' => 'POST', 'callback' => [$this, 'complete_cw_step'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        // v7.13.60: Plot structure templates — serves markdown as TipTap HTML
        register_rest_route($namespace, '/cw-project/plot-template', [
            'methods' => 'GET', 'callback' => [$this, 'get_plot_template'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // v7.15.93: Foundational quiz result capture
        register_rest_route($namespace, '/foundational-quiz/result', [
            'methods' => 'POST', 'callback' => [$this, 'save_foundational_quiz_result'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
        register_rest_route($namespace, '/foundational-quiz/result', [
            'methods' => 'GET', 'callback' => [$this, 'load_foundational_quiz_result'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    // ═══════════════════════════════════════════
    //  SESSION MANAGEMENT
    // ═══════════════════════════════════════════

    public function handle_session($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();
        $context = SWML_Session_Manager::build_context($params);

        if (!empty($params['task']))     $context['task']     = sanitize_text_field($params['task']);
        if (!empty($params['question'])) $context['question'] = sanitize_text_field($params['question']);
        if (!empty($params['marks']))    $context['marks']    = absint($params['marks']);
        if (!empty($params['aos']))      $context['aos']      = array_map('sanitize_text_field', (array) $params['aos']);
        if (!empty($params['planning_mode'])) $context['planning_mode'] = sanitize_text_field($params['planning_mode']);
        if (!empty($params['model_section'])) $context['model_section'] = sanitize_text_field($params['model_section']);
        if (!empty($params['advanced_level'])) $context['advanced_level'] = absint($params['advanced_level']);
        if (!empty($params['essay_timing'])) $context['essay_timing'] = sanitize_text_field($params['essay_timing']);

        // Clear the plan from the previous session
        update_user_meta($user_id, 'wml_current_plan', []);

        SWML_Session_Manager::save_session($user_id, $context['session_id'], $context);

        return rest_ensure_response([
            'status' => 'ok', 'session_id' => $context['session_id'], 'context' => $context,
        ]);
    }

    public function get_session($request) {
        $session = SWML_Session_Manager::get_active_session(get_current_user_id());
        return rest_ensure_response($session ? ['status' => 'ok', 'session' => $session] : ['status' => 'no_session']);
    }

    public function save_session_element($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();
        $type    = sanitize_text_field($params['element_type'] ?? $params['type'] ?? '');
        $content = sanitize_text_field($params['content'] ?? '');
        $step    = absint($params['step'] ?? 0);
        $clear   = !empty($params['clear']);

        if (empty($type)) {
            return new WP_Error('missing_data', 'element_type is required', ['status' => 400]);
        }

        $session = SWML_Session_Manager::get_active_session($user_id);
        $session_id = $session['session_id'] ?? '';
        $task = $session['context']['task'] ?? 'planning';

        if ($clear) {
            $plan = SWML_Session_Manager::clear_plan_element($user_id, $session_id, $type);
            return rest_ensure_response(['status' => 'cleared', 'element' => $type, 'plan' => $plan]);
        }

        if (empty($content)) {
            return new WP_Error('missing_data', 'content is required', ['status' => 400]);
        }

        $plan = SWML_Session_Manager::save_session_element($user_id, $session_id, $type, $content, $step, $task);
        return rest_ensure_response(['status' => 'saved', 'element' => $type, 'task' => $task, 'plan' => $plan]);
    }

    public function get_plan($request) {
        return rest_ensure_response(['status' => 'ok', 'plan' => SWML_Session_Manager::get_current_plan(get_current_user_id())]);
    }

    public function update_progress($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();
        $step    = absint($params['step'] ?? 1);
        $session = SWML_Session_Manager::get_active_session($user_id);
        if ($session) {
            $session['context']['step'] = $step;
            SWML_Session_Manager::save_session($user_id, $session['session_id'], $session['context']);
        }
        return rest_ensure_response(['status' => 'ok', 'step' => $step]);
    }

    public function get_resources($request) {
        $task    = sanitize_text_field($request->get_param('task') ?? 'planning');
        $step    = absint($request->get_param('step') ?? 1);
        $board   = sanitize_text_field($request->get_param('board') ?? 'aqa');
        $subject = sanitize_text_field($request->get_param('subject') ?? '');

        $map = get_option('swml_video_map', []);

        // Collect videos from multiple sources (most specific → general)
        $videos = [];
        $step_key = "step_{$step}";

        // Priority 1: task + step specific
        if (!empty($map[$task][$step_key])) {
            $videos = array_merge($videos, $map[$task][$step_key]);
        }
        // Priority 2: task general
        if (!empty($map[$task]['general'])) {
            $videos = array_merge($videos, $map[$task]['general']);
        }
        // Priority 3: subject-specific
        if (!empty($map[$subject]['general'])) {
            $videos = array_merge($videos, $map[$subject]['general']);
        }
        // Priority 4: global resources
        if (!empty($map['global'])) {
            $videos = array_merge($videos, $map['global']);
        }

        // Each video should have: title, hls (Bunny Stream URL), optional poster, duration
        // Format: { title, hls: "https://vz-xxx.b-cdn.net/{id}/playlist.m3u8", poster, duration }
        return rest_ensure_response([
            'videos' => array_values($videos),
            'task'   => $task,
            'step'   => $step,
        ]);
    }

    public function get_unit_question($request) {
        $id = absint($request['unit_id']);
        if (!$id) return new WP_Error('invalid_unit', 'unit_id is required', ['status' => 400]);
        return rest_ensure_response([
            'question' => get_post_meta($id, '_sophicly_essay_question', true) ?: '',
            'marks'    => absint(get_post_meta($id, '_sophicly_question_marks', true)) ?: 30,
            'aos'      => get_post_meta($id, '_sophicly_question_aos', true) ?: 'AO1+AO2+AO3',
        ]);
    }

    public function get_student_reminders($request) {
        return rest_ensure_response(SWML_Session_Manager::get_student_reminders(
            get_current_user_id(), sanitize_text_field($request->get_param('text') ?? '')
        ));
    }

    public function check_auth() { return is_user_logged_in() && get_current_user_id() > 0; }

    public function check_tutor_auth() {
        if (!is_user_logged_in()) return false;
        if (current_user_can('manage_options')) return true;
        $uid       = get_current_user_id();
        $att_role  = get_user_meta($uid, 'sophicly_att_role', true);
        $soph_role = get_user_meta($uid, 'sophicly_role', true);
        // v7.15.82: SSS is dual-checked — att_role='specialist' OR sophicly_role='sss'
        // per CLAUDE.md role convention. Tutor stays att_role-only.
        if ($att_role === 'tutor') return true;
        if ($att_role === 'specialist') return true;
        if ($soph_role === 'sss') return true;
        return false;
    }

    public function check_admin_auth() {
        return is_user_logged_in() && current_user_can('manage_options');
    }

    // ═══════════════════════════════════════════
    //  COVER IMAGES
    // ═══════════════════════════════════════════

    public function get_covers() {
        $covers = get_option('swml_cover_images', []);
        return rest_ensure_response(['success' => true, 'covers' => $covers]);
    }

    public function save_covers($request) {
        $params = $request->get_json_params();
        $covers = $params['covers'] ?? [];
        // Sanitize: key = board:text, value = URL
        $clean = [];
        foreach ($covers as $key => $url) {
            $key = sanitize_text_field($key);
            $url = esc_url_raw(trim($url));
            if ($key && $url) $clean[$key] = $url;
        }
        update_option('swml_cover_images', $clean);
        return rest_ensure_response(['success' => true, 'covers' => $clean]);
    }

    // ═══════════════════════════════════════════
    //  DEBUG ENDPOINT — safe probe, calls nothing
    // ═══════════════════════════════════════════

    public function handle_debug($request) {
        $debug = [
            'php_version' => PHP_VERSION,
            'wp_version'  => get_bloginfo('version'),
            'timestamp'   => date('Y-m-d H:i:s'),
        ];

        // Check global $mwai
        global $mwai;
        $debug['mwai_global'] = isset($mwai) ? (is_object($mwai) ? get_class($mwai) : gettype($mwai)) : 'not set';

        // Find all Meow/MWAI classes
        $all_classes = get_declared_classes();
        $mwai_classes = array_values(array_filter($all_classes, function($c) {
            return stripos($c, 'meow') !== false || stripos($c, 'mwai') !== false;
        }));
        $debug['mwai_classes'] = $mwai_classes;
        $debug['mwai_class_count'] = count($mwai_classes);

        // Check specific classes
        $debug['class_exists'] = [
            'Meow_MWAI_Core'     => class_exists('Meow_MWAI_Core'),
            'MeowPro_MWAI_Core'  => class_exists('MeowPro_MWAI_Core'),
            'Meow_MWAI_Query_Text' => class_exists('Meow_MWAI_Query_Text'),
            'Meow_MWAI_Query_Chat' => class_exists('Meow_MWAI_Query_Chat'),
        ];

        // If we have a core, list its methods (without calling any)
        $core = null;
        if (isset($mwai) && is_object($mwai)) {
            $core = $mwai;
        } elseif (class_exists('Meow_MWAI_Core') && method_exists('Meow_MWAI_Core', 'getInstance')) {
            try { $core = Meow_MWAI_Core::getInstance(); } catch (\Throwable $e) {
                $debug['core_init_error'] = $e->getMessage();
            }
        }

        if ($core) {
            $debug['core_class'] = get_class($core);
            $methods = get_class_methods($core);
            $debug['all_methods'] = $methods;
            $debug['query_methods'] = array_values(array_filter($methods, function($m) {
                return stripos($m, 'query') !== false || stripos($m, 'chat') !== false
                    || stripos($m, 'simple') !== false || stripos($m, 'run') !== false;
            }));
        } else {
            $debug['core_class'] = 'NONE FOUND';
        }

        // Check AI Engine plugin status
        $debug['ai_engine_active'] = is_plugin_active('ai-engine/ai-engine.php') 
            || is_plugin_active('ai-engine-pro/ai-engine.php');
        
        // Check AI Engine options for chatbots
        $chatbots = get_option('mwai_chatbots', null);
        if ($chatbots !== null) {
            $debug['chatbots_option_type'] = gettype($chatbots);
            if (is_array($chatbots)) {
                $debug['chatbot_count'] = count($chatbots);
                $debug['chatbot_ids'] = array_map(function($b) {
                    return $b['botId'] ?? $b['id'] ?? $b['name'] ?? 'unknown';
                }, $chatbots);
            }
        } else {
            $debug['chatbots_option'] = 'not found';
        }

        // Check for recent PHP errors in log
        $debug['error_log_path'] = ini_get('error_log') ?: 'default';

        // Check last fatal error
        $last_error = error_get_last();
        if ($last_error && in_array($last_error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            $debug['last_fatal'] = $last_error;
        }

        // Discover AI Engine REST routes
        $server = rest_get_server();
        $routes = array_keys($server->get_routes());
        $debug['ai_engine_routes'] = array_values(array_filter($routes, function($r) {
            return stripos($r, 'mwai') !== false || stripos($r, 'ai-engine') !== false || stripos($r, 'meow') !== false;
        }));

        // Inspect Query_Text structure
        if (class_exists('Meow_MWAI_Query_Text')) {
            try {
                $q = new \Meow_MWAI_Query_Text();
                $debug['query_text_props'] = array_keys(get_object_vars($q));
                $debug['query_text_methods'] = get_class_methods($q);
            } catch (\Throwable $e) {
                $debug['query_text_error'] = $e->getMessage();
            }
        }

        return rest_ensure_response($debug);
    }

    // ═══════════════════════════════════════════
    //  CHAT ENDPOINT — with fatal error capture
    // ═══════════════════════════════════════════

    public function handle_chat($request) {
        // v7.15.91: reject AI chat writes when viewing another student read-only.
        $gate = $this->check_viewer_write_allowed($request);
        if (is_wp_error($gate)) return $gate;

        ob_start();

        // Rate limiting: 60 requests per minute per user (v7.15.2)
        $rate_user_id = get_current_user_id();
        $rate_key = 'swml_rate_' . $rate_user_id;
        $rate_count = (int) get_transient($rate_key);
        if ($rate_count >= 60) {
            ob_end_clean();
            return new WP_Error('rate_limited', 'Too many requests. Please wait a moment.', ['status' => 429]);
        }
        set_transient($rate_key, $rate_count + 1, MINUTE_IN_SECONDS);

        register_shutdown_function(function() {
            $error = error_get_last();
            if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
                while (ob_get_level()) ob_end_clean();
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'success' => false, 'code' => 'php_fatal', 'reply' => null,
                    'message' => 'An unexpected server error occurred. Please try again.',
                ]);
            }
        });

        $params = $request->get_json_params();
        $prompt  = $params['prompt'] ?? $params['message'] ?? '';
        $bot_id  = sanitize_text_field($params['botId'] ?? 'wml-claude');
        $chat_id = sanitize_text_field($params['chatId'] ?? '');
        $history = $params['history'] ?? [];

        if (empty($prompt)) {
            ob_end_clean();
            return rest_ensure_response(['success' => false, 'code' => 'missing_prompt', 'message' => 'prompt is required']);
        }

        // Get student name
        $user_id = get_current_user_id();
        $user = get_userdata($user_id);
        $first_name = $user ? ($user->first_name ?: $user->display_name) : 'there';

        // Signal to Protocol Router — globals read by inject_session_context()
        global $swml_active_bot_id;
        $swml_active_bot_id = $bot_id;
        global $swml_chat_history;
        $swml_chat_history = $history;
        global $swml_plan_state, $swml_current_step, $swml_current_subject;
        $swml_plan_state = $params['planState'] ?? [];
        $swml_current_step = absint($params['step'] ?? 1);
        // v7.14.45: Pass frontend context directly to Protocol Router via globals.
        // This bypasses session storage timing issues (WP object cache may not reflect
        // update_user_meta immediately within the same request).
        global $swml_request_context;
        $swml_request_context = [
            'board'   => sanitize_text_field($params['board'] ?? ''),
            'subject' => sanitize_text_field($params['subject'] ?? ''),
            'task'    => sanitize_text_field($params['task'] ?? ''),
            'text'    => sanitize_text_field($params['text'] ?? ''),
            'step'    => absint($params['step'] ?? 1),
            'topic_number' => absint($params['topicNumber'] ?? 0),
            'phase'   => sanitize_text_field($params['phase'] ?? ''),
            'marks'   => absint($params['marks'] ?? 0),
        ];

        // Session context: prefer params sent with chat request (authoritative),
        // fall back to wml_active_session only if params not provided.
        // This eliminates race conditions when resuming sessions.
        $req_board   = sanitize_text_field($params['board'] ?? '');
        $req_subject = sanitize_text_field($params['subject'] ?? '');
        $req_task    = sanitize_text_field($params['task'] ?? '');

        $session = SWML_Session_Manager::get_active_session(get_current_user_id());

        if ($req_board && $req_subject && $req_task) {
            // Frontend sent explicit context — use it and update active session
            if ($session) {
                $session['context']['board']   = $req_board;
                $session['context']['subject'] = $req_subject;
                $session['context']['task']    = $req_task;
                SWML_Session_Manager::save_session($user_id, $session['session_id'], $session['context']);
            } else {
                // v7.14.44: No session exists yet — create one on the fly so Protocol Router
                // gets the correct task context (fixes mark_scheme, planning, polishing protocols)
                $new_context = [
                    'board' => $req_board, 'subject' => $req_subject, 'task' => $req_task,
                    'text' => sanitize_text_field($params['text'] ?? ''),
                    'step' => absint($params['step'] ?? 1),
                    'topic_number' => absint($params['topicNumber'] ?? 0),
                    'phase' => sanitize_text_field($params['phase'] ?? ''),
                ];
                $new_session_id = 'chat_' . wp_generate_uuid4();
                SWML_Session_Manager::save_session($user_id, $new_session_id, $new_context);
                $session = ['session_id' => $new_session_id, 'context' => $new_context];
                error_log("WML REST: Created on-the-fly session for task={$req_task}");
            }
            $swml_current_subject = $req_subject;
        } else {
            // Legacy fallback: read from active session
            $swml_current_subject = $session['context']['subject'] ?? '';
        }

        // ── Build messages array (proper OpenAI format) ──
        $messages = [];
        if (is_array($history)) {
            foreach ($history as $msg) {
                $role = ($msg['role'] ?? '') === 'user' ? 'user' : 'assistant';
                $content = $msg['content'] ?? '';
                if ($content) {
                    $messages[] = ['role' => $role, 'content' => $content];
                }
            }
        }

        // Add student name to first message only
        $message_text = $prompt;
        if (empty($messages)) {
            $message_text = "[Student's name is {$first_name}.]\n\n" . $prompt;
        }

        $reply = null;
        $reply_chat_id = $chat_id;
        $method_used = null;
        $model_used = null;
        $errors = [];

        // ════════════════════════════════════════════════════════════
        // FALLBACK CHAIN: wml-claude (primary) → wml (OpenAI fallback)
        //
        // The frontend always sends botId='wml-claude'. If that fails
        // (rate limit, error), we fall back to 'wml' (OpenAI/GPT).
        // ════════════════════════════════════════════════════════════
        $fallback_bot_id = 'wml'; // OpenAI fallback
        $chatbots = get_option('mwai_chatbots', []);
        $fallback_exists = false;
        if (is_array($chatbots)) {
            foreach ($chatbots as $bot) {
                $id = $bot['botId'] ?? $bot['id'] ?? '';
                if ($id === $fallback_bot_id) {
                    $fallback_exists = true;
                    break;
                }
            }
        }

        $bot_ids_to_try = $fallback_exists
            ? [$bot_id, $fallback_bot_id]  // Claude first, OpenAI fallback
            : [$bot_id];                    // Claude only
        error_log("WML: Fallback chain: " . implode(' → ', $bot_ids_to_try));

        // ════════════════════════════════════════════════════════════
        // simpleChatbotQuery — with fallback chain
        // ════════════════════════════════════════════════════════════
        global $mwai;
        $api = (isset($mwai) && is_object($mwai)) ? $mwai : null;

        if ($api && method_exists($api, 'simpleChatbotQuery')) {
            foreach ($bot_ids_to_try as $try_bot_id) {
                try {
                    // Signal to Protocol Router which bot we're trying
                    $swml_active_bot_id = $try_bot_id;

                    $query_params = [];
                    if (!empty($messages)) {
                        $query_params['messages'] = $messages;
                    }
                    if (!empty($chat_id)) {
                        $query_params['chatId'] = $chat_id;
                    }

                    error_log('WML: simpleChatbotQuery('
                        . 'botId=' . $try_bot_id
                        . ', msg=' . strlen($message_text) . 'chars'
                        . ', messages=' . count($messages)
                        . ', chatId=' . ($chat_id ?: 'none')
                        . ')');

                    $result = $api->simpleChatbotQuery($try_bot_id, $message_text, $query_params, false);

                    if (is_array($result)) {
                        $reply = $result['reply'] ?? null;
                        if (!empty($result['chatId'])) {
                            $reply_chat_id = $result['chatId'];
                        }
                        if ($reply) {
                            $method_used = 'simpleChatbotQuery';
                            $model_used = $try_bot_id;
                            error_log("WML: SUCCESS via {$try_bot_id}, reply=" . strlen($reply) . 'chars');
                            break; // Success — stop trying
                        } else {
                            $errors[] = "{$try_bot_id}: array result but no reply";
                        }
                    } elseif (is_string($result) && !empty($result)) {
                        $reply = $result;
                        $method_used = 'simpleChatbotQuery (string)';
                        $model_used = $try_bot_id;
                        break; // Success
                    } else {
                        $errors[] = "{$try_bot_id}: empty result";
                    }
                } catch (\Throwable $e) {
                    $err_msg = $e->getMessage();
                    $errors[] = "{$try_bot_id}: {$err_msg}";
                    error_log("WML: {$try_bot_id} FAILED: {$err_msg}");

                    // If this is rate limiting or overloaded, try next bot
                    if (strpos($err_msg, '429') !== false || stripos($err_msg, 'rate') !== false || stripos($err_msg, 'overloaded') !== false) {
                        error_log("WML: Rate limited on {$try_bot_id}, trying next in chain...");
                        continue;
                    }

                    // For other errors, also try next bot
                    error_log("WML: Error on {$try_bot_id}, trying next in chain...");
                    continue;
                }
            }
        } else {
            $errors[] = '$mwai API not available or simpleChatbotQuery missing';
        }

        // ════════════════════════════════════════════════════════════
        // Fallback: simpleTextQuery (no conversation support, last resort)
        // ════════════════════════════════════════════════════════════
        if (!$reply && $api && method_exists($api, 'simpleTextQuery')) {
            try {
                error_log('WML: Fallback to simpleTextQuery');
                $result = $api->simpleTextQuery($message_text);
                if (!empty($result)) {
                    $reply = is_string($result) ? $result : (string) $result;
                    $method_used = 'simpleTextQuery (fallback)';
                }
            } catch (\Throwable $e) {
                $errors[] = 'simpleTextQuery: ' . $e->getMessage();
            }
        }

        $stray_output = ob_get_clean();
        if ($stray_output) error_log('WML: Stray output: ' . substr($stray_output, 0, 500));

        if ($reply) {
            // Determine friendly model name for frontend indicator
            $model_label = 'AI';
            if ($model_used && strpos($model_used, '-claude') !== false) {
                $model_label = 'Claude';
            } elseif ($model_used) {
                $model_label = 'GPT';
            }

            return rest_ensure_response([
                'success' => true,
                'reply' => $reply,
                'chatId' => $reply_chat_id,
                'method' => $method_used,
                'model' => $model_label,
                'modelBot' => $model_used,
            ]);
        }

        return rest_ensure_response([
            'success' => false, 'code' => 'no_method_worked', 'reply' => null,
            'message' => 'The AI tutor is temporarily unavailable. Please try again in a moment.',
        ]);
    }

    /**
     * Save session data (auto-save + manual save)
     */
    public function save_session_data($request) {
        // v7.15.91: block session writes when impersonating read-only.
        $gate = $this->check_viewer_write_allowed($request);
        if (is_wp_error($gate)) return $gate;

        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        $session_id = sanitize_text_field($params['session_id'] ?? '');
        if (empty($session_id)) {
            return rest_ensure_response(['status' => 'error', 'message' => 'Missing session_id']);
        }

        $data = [
            'session_id'   => $session_id,
            'user_id'      => $user_id,
            'date'         => current_time('mysql'),
            'chat_history' => $params['chat_history'] ?? [],
            'plan'         => $params['plan'] ?? [],
            'step'         => absint($params['step'] ?? 1),
            'ai_chat_id'   => sanitize_text_field($params['ai_chat_id'] ?? ''),
            'context'      => $params['context'] ?? [],
            'attempt'      => isset($params['attempt']) ? absint($params['attempt']) : null,
        ];

        update_user_meta($user_id, 'wml_session_' . $session_id, $data);

        // Keep wml_active_session in sync — ensures Protocol Router always has
        // the correct context, especially after resuming a different session
        if (!empty($data['context'])) {
            SWML_Session_Manager::save_session($user_id, $session_id, $data['context']);
        }

        // Update sessions index for portfolio
        $index = get_user_meta($user_id, 'wml_sessions_index', true) ?: [];
        $ctx = $data['context'];
        $index[$session_id] = [
            'session_id' => $session_id, 'date' => $data['date'],
            'board' => $ctx['board'] ?? '', 'subject' => $ctx['subject'] ?? '',
            'text' => $ctx['text'] ?? '', 'text_name' => $ctx['text_name'] ?? '',
            'task' => $ctx['task'] ?? 'planning', 'question' => $ctx['question'] ?? '',
            'step' => $data['step'], 'is_redraft' => !empty($ctx['is_redraft']),
            'is_manual' => !empty($params['is_manual']),
            'exchanges' => is_array($data['chat_history']) ? count(array_filter($data['chat_history'], function($m) { return ($m['role'] ?? '') === 'user'; })) : 0,
            'attempt' => $data['attempt'],
        ];
        update_user_meta($user_id, 'wml_sessions_index', $index);

        // Fire hook for student data plugin — full session snapshot on every save
        do_action('sophicly_session_saved', $user_id, $session_id, $data, !empty($params['is_manual']));

        return rest_ensure_response(['status' => 'saved', 'session_id' => $session_id]);
    }

    /**
     * List past sessions for portfolio
     */
    public function list_sessions($request) {
        $user_id = get_current_user_id();
        $index = get_user_meta($user_id, 'wml_sessions_index', true) ?: [];
        $sessions = array_values($index);
        usort($sessions, function($a, $b) { return strtotime($b['date']) - strtotime($a['date']); });
        return rest_ensure_response(['sessions' => $sessions]);
    }

    /**
     * Load a specific session for resume
     */
    public function load_session_data($request) {
        $user_id = get_current_user_id();
        $session_id = sanitize_text_field($request->get_param('session_id'));
        if (empty($session_id)) {
            return rest_ensure_response(['status' => 'error', 'message' => 'Missing session_id']);
        }
        $data = get_user_meta($user_id, 'wml_session_' . $session_id, true);
        if (empty($data)) {
            return rest_ensure_response(['status' => 'error', 'message' => 'Session not found']);
        }
        return rest_ensure_response($data);
    }

    /**
     * Delete a session
     */
    public function delete_session($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        $session_id = sanitize_text_field($params['session_id'] ?? '');
        if (empty($session_id)) {
            return rest_ensure_response(['status' => 'error', 'message' => 'Missing session_id']);
        }

        // Remove session data
        delete_user_meta($user_id, 'wml_session_' . $session_id);

        // Remove from index
        $index = get_user_meta($user_id, 'wml_sessions_index', true) ?: [];
        unset($index[$session_id]);
        update_user_meta($user_id, 'wml_sessions_index', $index);

        return rest_ensure_response(['status' => 'deleted', 'session_id' => $session_id]);
    }

    // ═══════════════════════════════════════════
    //  SAVED EXAM QUESTIONS
    // ═══════════════════════════════════════════

    public function get_saved_questions($request) {
        $user_id = get_current_user_id();
        $board = sanitize_text_field($request->get_param('board') ?? '');
        $text = sanitize_text_field($request->get_param('text') ?? '');

        $questions = SWML_Session_Manager::get_saved_questions($user_id, $board, $text);
        return rest_ensure_response(['success' => true, 'questions' => $questions]);
    }

    public function save_question($request) {
        // v7.15.91: read-only views can't save questions.
        $gate = $this->check_viewer_write_allowed($request);
        if (is_wp_error($gate)) return $gate;

        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $subject = sanitize_text_field($params['subject'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['status' => 'error', 'message' => 'Missing board or text']);
        }

        $question_data = [
            'summary'   => $params['summary'] ?? '',
            'theme'     => $params['theme'] ?? '',
            'location'  => $params['location'] ?? '',
            'full_text' => $params['full_text'] ?? '',
        ];

        $saved = SWML_Session_Manager::save_question($user_id, $board, $subject, $text, $question_data);
        return rest_ensure_response(['success' => true, 'count' => count($saved)]);
    }

    // ═══════════════════════════════════════════
    //  QUESTION BANK — DASHBOARD AGGREGATION (v7.14.84)
    // ═══════════════════════════════════════════

    /**
     * GET /question-bank/all[?board=X]
     * Returns all saved questions grouped by board+text.
     * Dashboard ExamPrepPanel calls this.
     */
    public function get_all_question_banks($request) {
        $user_id = get_current_user_id();
        $board_filter = sanitize_text_field($request->get_param('board') ?? '');

        $banks = SWML_Session_Manager::get_all_saved_questions($user_id, $board_filter);

        // Map fields to dashboard-expected names
        foreach ($banks as &$bank) {
            $bank['questions'] = array_map([$this, 'map_question_for_dashboard'], $bank['questions']);
        }
        unset($bank);

        return rest_ensure_response(['success' => true, 'banks' => $banks]);
    }

    /**
     * GET /question-bank?board=X&text=Y
     * Returns saved questions for a specific board+text.
     */
    public function get_question_bank($request) {
        $user_id = get_current_user_id();
        $board = sanitize_text_field($request->get_param('board') ?? '');
        $text  = sanitize_text_field($request->get_param('text') ?? '');

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        $questions = SWML_Session_Manager::get_saved_questions($user_id, $board, $text);
        $mapped = array_map([$this, 'map_question_for_dashboard'], $questions);

        return rest_ensure_response(['success' => true, 'questions' => $mapped]);
    }

    /**
     * Map stored question fields to dashboard-expected field names.
     * Storage: full_text, saved_at  →  Dashboard: questionText, createdAt
     */
    private function map_question_for_dashboard($q) {
        return [
            'theme'        => $q['theme'] ?? '',
            'questionText' => $q['full_text'] ?? $q['summary'] ?? '',
            'summary'      => $q['summary'] ?? '',
            'location'     => $q['location'] ?? '',
            'marks'        => $q['marks'] ?? '',
            'aos'          => $q['aos'] ?? '',
            'board'        => $q['board'] ?? '',
            'subject'      => $q['subject'] ?? '',
            'text'         => $q['text'] ?? '',
            'createdAt'    => $q['saved_at'] ?? '',
        ];
    }

    // ═══════════════════════════════════════════
    //  PROTOCOL MANIFEST STEP LABELS (v7.14.66)
    // ═══════════════════════════════════════════

    /**
     * Return sidebar step labels from the protocol manifest for the given board/subject/task.
     */
    public function get_protocol_steps($request) {
        $board   = sanitize_text_field($request->get_param('board') ?? 'aqa');
        $subject = sanitize_text_field($request->get_param('subject') ?? '');
        $task    = sanitize_text_field($request->get_param('task') ?? 'planning');

        $router = SWML_Protocol_Router::instance();
        $result = $router->get_manifest_steps($board, $subject, $task);

        // v7.15.1: Return groups alongside steps for accordion sidebar
        return rest_ensure_response([
            'success' => true,
            'steps'   => $result['steps'] ?? [],
            'groups'  => $result['groups'] ?? null,
        ]);
    }

    // ═══════════════════════════════════════════
    //  CANVAS DOCUMENT SAVE / LOAD
    // ═══════════════════════════════════════════

    /**
     * Save canvas document content to user_meta.
     * Key: swml_canvas_{board}_{text}[_{topic_number}]
     * Value: JSON { html, wordCount, comments, savedAt }
     */
    public function save_canvas($request) {
        // v7.15.91: read-only views can't write canvas docs.
        $gate = $this->check_viewer_write_allowed($request);
        if (is_wp_error($gate)) return $gate;

        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $board = sanitize_text_field($params['board'] ?? '');
        $text  = sanitize_text_field($params['text'] ?? '');
        $html  = $params['html'] ?? '';

        // Security: sanitize canvas HTML — allow TipTap structural attrs, strip scripts/handlers (v7.15.2)
        $allowed_canvas_tags = wp_kses_allowed_html('post');
        $tiptap_tags = ['p','h1','h2','h3','h4','h5','h6','span','div','li','ul','ol',
                        'blockquote','table','tr','td','th','thead','tbody','section','mark','br','hr'];
        foreach ($tiptap_tags as $tag) {
            if (!isset($allowed_canvas_tags[$tag])) $allowed_canvas_tags[$tag] = [];
            $allowed_canvas_tags[$tag]['class'] = true;
            $allowed_canvas_tags[$tag]['data-type'] = true;
            $allowed_canvas_tags[$tag]['data-id'] = true;
            $allowed_canvas_tags[$tag]['data-indent'] = true;
            $allowed_canvas_tags[$tag]['data-text-align'] = true;
            $allowed_canvas_tags[$tag]['style'] = true;
        }
        $html = wp_kses($html, $allowed_canvas_tags);

        $word_count = absint($params['wordCount'] ?? 0);
        $comments = $params['comments'] ?? null;
        $topic_number = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 0);
        $lesson_url = esc_url_raw($params['lessonUrl'] ?? '');
        // v7.15.64: autosaves carry the planning mode so legacy attempts gain the field on next save
        $planning_mode = sanitize_text_field($params['planningMode'] ?? '');

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        // v7.15.12: Resolve attempt number — use provided, or fall back to current from index
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        // Build meta key — includes topic number + exercise suffix + attempt for document isolation
        $meta_key = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);

        $doc = [
            'html'       => $html,
            'wordCount'  => $word_count,
            'savedAt'    => current_time('c'),
            'board'      => $board,
            'text'       => $text,
        ];
        if ($comments !== null) {
            $doc['comments'] = $comments;
        }
        if ($topic_number !== null) {
            $doc['topicNumber'] = $topic_number;
        }
        if (!empty($suffix)) {
            $doc['suffix'] = $suffix;
        }
        // v7.15.30: Store LD lesson URL for dashboard deep links
        if (!empty($lesson_url)) {
            $doc['lessonUrl'] = $lesson_url;
        }

        // wp_slash prevents WordPress's internal wp_unslash from stripping backslashes in JSON
        $result = update_user_meta($user_id, $meta_key, wp_slash(wp_json_encode($doc)));

        // Also fire a hook so the student data plugin can pick this up
        do_action('sophicly_canvas_saved', $user_id, $board, $text, $html, $word_count, $topic_number, $suffix);

        // v7.15.12: Update attempt index with latest word count + status
        // v7.15.64: also backfill planningMode from save payload so continue restores it
        $idx = $this->get_attempt_index($user_id, $board, $text, $topic_number, $suffix);
        foreach ($idx['attempts'] as &$a) {
            if ($a['num'] === $attempt) {
                $a['wordCount'] = $word_count;
                if ($a['status'] === 'not_started') $a['status'] = 'in_progress';
                if (!empty($planning_mode) && empty($a['planningMode'])) {
                    $a['planningMode'] = $planning_mode;
                }
                break;
            }
        }
        unset($a);
        $this->save_attempt_index($user_id, $board, $text, $topic_number, $suffix, $idx);

        // Check if write actually succeeded
        if ($result === false) {
            return rest_ensure_response([
                'success' => false,
                'key'     => $meta_key,
                'message' => 'update_user_meta returned false — DB write may have failed',
            ]);
        }

        return rest_ensure_response([
            'success' => true,
            'key'     => $meta_key,
            'savedAt' => $doc['savedAt'],
            'attempt' => $attempt,
        ]);
    }

    /**
     * Auto-extract exam questions from canvas InputFields into wml_saved_questions.
     * Fires on sophicly_canvas_saved hook — only processes exam_question documents.
     * Deduplication handled by SWML_Session_Manager::save_question() (80-char summary match).
     *
     * @since 7.14.85
     */
    public function maybe_extract_exam_questions($user_id, $board, $text, $html, $word_count, $topic_number, $suffix) {
        if ($suffix !== 'exam_question' || empty($html)) return;

        $doc = new \DOMDocument();
        @$doc->loadHTML('<meta charset="utf-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODERRRECOVERY);

        $xpath = new \DOMXPath($doc);
        $fields = $xpath->query('//div[@data-input-field]');

        if (!$fields || $fields->length === 0) return;

        foreach ($fields as $field) {
            $content = trim($field->textContent);
            if (empty($content) || strlen($content) < 10) continue;

            SWML_Session_Manager::save_question($user_id, $board, '', $text, [
                'summary'   => mb_substr(strip_tags($content), 0, 100),
                'full_text' => wp_kses_post($content),
                'theme'     => '',
            ]);
        }
    }

    /**
     * Load canvas document content from user_meta.
     */
    public function load_canvas($request) {
        $user_id = get_current_user_id();

        $board = sanitize_text_field($request->get_param('board') ?? '');
        $text  = sanitize_text_field($request->get_param('text') ?? '');
        $topic_number = $request->get_param('topicNumber');
        $topic_number = ($topic_number !== null && $topic_number !== '') ? absint($topic_number) : null;
        $suffix = sanitize_text_field($request->get_param('suffix') ?? '');
        $attempt = absint($request->get_param('attempt') ?? 0);

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        // v7.15.12: Resolve attempt — use provided, or current from index
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);

        $raw = get_user_meta($user_id, $meta_key, true);
        if (empty($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => null, 'attempt' => $attempt]);
        }

        // WordPress may return an array (if it serialized/unserialized internally)
        if (is_array($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => $raw, 'attempt' => $attempt]);
        }

        $doc = self::decode_canvas_json($raw);
        return rest_ensure_response([
            'success' => true,
            'doc'     => $doc,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Tutor review: load a student's canvas document (v7.15.2).
     * Requires tutor auth + LearnDash group overlap (or admin).
     */
    public function tutor_load_canvas($request) {
        $student_id = absint($request->get_param('student_id') ?? 0);
        if (!$student_id) {
            return new WP_Error('missing_student', 'student_id is required', ['status' => 400]);
        }

        // v7.15.40: read-only viewers (parents with active connection) also allowed
        $auth = $this->verify_viewer_access($student_id);
        if (is_wp_error($auth)) return $auth;

        $board = sanitize_text_field($request->get_param('board') ?? '');
        $text  = sanitize_text_field($request->get_param('text') ?? '');
        $topic_number = $request->get_param('topicNumber');
        $topic_number = ($topic_number !== null && $topic_number !== '') ? absint($topic_number) : null;
        $suffix = sanitize_text_field($request->get_param('suffix') ?? '');
        $attempt = absint($request->get_param('attempt') ?? 0);

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        // v7.15.12: Resolve attempt for tutor review
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($student_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);
        $raw = get_user_meta($student_id, $meta_key, true);
        if (empty($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => null, 'attempt' => $attempt]);
        }
        if (is_array($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => $raw, 'attempt' => $attempt]);
        }
        $doc = self::decode_canvas_json($raw);
        return rest_ensure_response(['success' => true, 'doc' => $doc, 'attempt' => $attempt]);
    }

    /**
     * Tutor review: load a student's canvas chat history (v7.15.2).
     */
    public function tutor_load_canvas_chat($request) {
        $student_id = absint($request->get_param('student_id') ?? 0);
        if (!$student_id) {
            return new WP_Error('missing_student', 'student_id is required', ['status' => 400]);
        }

        // v7.15.40: read-only viewers (parents with active connection) also allowed
        $auth = $this->verify_viewer_access($student_id);
        if (is_wp_error($auth)) return $auth;

        $board  = sanitize_text_field($request->get_param('board') ?? '');
        $text   = sanitize_text_field($request->get_param('text') ?? '');
        $topic  = absint($request->get_param('topicNumber') ?? 0);
        $suffix = sanitize_text_field($request->get_param('suffix') ?? '');

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic, $suffix);
        $raw = get_user_meta($student_id, $meta_key, true);
        $data = $raw ? json_decode($raw, true) : null;

        $student = get_userdata($student_id);
        return rest_ensure_response([
            'success' => !empty($data),
            'chat'    => $data,
            'studentName' => $student ? ($student->first_name ?: $student->display_name) : 'Student',
        ]);
    }

    /**
     * Tutor review: save comments + updated HTML on student's canvas (v7.15.30).
     * Merges tutor comments into the student's existing canvas document.
     */
    public function tutor_save_comments($request) {
        $params = $request->get_json_params();
        $student_id = absint($params['student_id'] ?? 0);
        if (!$student_id) {
            return new \WP_Error('missing_student', 'student_id is required', ['status' => 400]);
        }

        $auth = $this->verify_tutor_student_access($student_id);
        if (is_wp_error($auth)) return $auth;

        $board = sanitize_text_field($params['board'] ?? '');
        $text  = sanitize_text_field($params['text'] ?? '');
        $topic_number = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 1);
        $new_comments = $params['comments'] ?? null;
        $html = $params['html'] ?? '';

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        if ($attempt < 1) {
            $idx = $this->get_attempt_index($student_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);
        $raw = get_user_meta($student_id, $meta_key, true);
        $doc = [];
        if (!empty($raw)) {
            $doc = is_array($raw) ? $raw : (self::decode_canvas_json($raw) ?: []);
        }

        // Merge tutor comments into student's canvas doc
        if ($new_comments !== null) {
            $doc['comments'] = $new_comments;
        }
        // Update HTML with comment marks
        if (!empty($html)) {
            // Sanitize tutor HTML the same way as student canvas
            $allowed = wp_kses_allowed_html('post');
            $tags = ['p','h1','h2','h3','h4','h5','h6','span','div','li','ul','ol',
                     'blockquote','table','tr','td','th','thead','tbody','section','mark','br','hr'];
            foreach ($tags as $tag) {
                if (!isset($allowed[$tag])) $allowed[$tag] = [];
                $allowed[$tag]['class'] = true;
                $allowed[$tag]['data-type'] = true;
                $allowed[$tag]['data-id'] = true;
                $allowed[$tag]['data-comment-id'] = true;
                $allowed[$tag]['style'] = true;
            }
            $doc['html'] = wp_kses($html, $allowed);
        }
        $doc['savedAt'] = current_time('c');

        $result = update_user_meta($student_id, $meta_key, wp_slash(wp_json_encode($doc)));

        return rest_ensure_response([
            'success' => $result !== false,
            'key'     => $meta_key,
            'savedAt' => $doc['savedAt'],
        ]);
    }

    /**
     * Verify tutor/specialist/admin has access to review student work (v7.15.3).
     * Any tutor or specialist can view any student — they're all qualified teachers.
     */
    /**
     * v7.15.91: Gate write REST endpoints on viewerMode === 'edit'.
     *
     * When a dashboard "view as student" admin POSTs to a write endpoint,
     * the request either carries a `student_id` / `studentId` param that
     * differs from the caller or doesn't carry one at all. If the caller
     * is not in an 'edit' viewer mode for the resolved target, the write
     * must be blocked — otherwise the admin's activity is silently
     * attributed to their own user_id (see handoff 2026-04-19).
     *
     * Returns WP_Error on denial, true when the write may proceed.
     */
    private function check_viewer_write_allowed($request) {
        $viewer_id = get_current_user_id();
        if (!$viewer_id) {
            return new WP_Error('rest_forbidden', 'Login required.', ['status' => 401]);
        }
        // Accept snake_case and camelCase aliases for the target id.
        $target = $request->get_param('student_id');
        if ($target === null || $target === '') $target = $request->get_param('studentId');
        if ($target === null || $target === '') {
            // Also inspect JSON body for writes that send it in the payload.
            $body = $request->get_json_params();
            if (is_array($body)) {
                $target = $body['student_id'] ?? $body['studentId'] ?? null;
            }
        }
        $target_id = absint($target ?? 0);
        // No target specified — caller writing to themselves is allowed.
        if (!$target_id || $target_id === $viewer_id) return true;
        // Different target — only allow when the caller has 'edit' rights.
        if (class_exists('Sophicly_Writing_Mastery_Lab')) {
            $mode = Sophicly_Writing_Mastery_Lab::resolve_viewer_mode($viewer_id, $target_id);
            if ($mode === 'edit') return true;
        }
        return new WP_Error(
            'forbidden_viewer',
            'This view is read-only — switch out of review mode to make changes.',
            ['status' => 403]
        );
    }

    private function verify_tutor_student_access($student_id) {
        $tutor_id = get_current_user_id();
        if ($student_id === $tutor_id) return true;
        if (current_user_can('manage_options')) return true;
        $att_role  = get_user_meta($tutor_id, 'sophicly_att_role', true);
        $soph_role = get_user_meta($tutor_id, 'sophicly_role', true);
        // v7.15.82: SSS dual-check — CLAUDE.md role convention says SSS is either
        // att_role='specialist' OR sophicly_role='sss'. Both forms exist in the DB.
        if ($att_role === 'tutor' || $att_role === 'specialist' || $soph_role === 'sss') return true;
        return new WP_Error('unauthorized', 'You are not authorized to view this student\'s work.', ['status' => 403]);
    }

    /**
     * v7.15.40: Read-only viewer access. Accepts everyone that
     * verify_tutor_student_access does, PLUS parents who have an ACTIVE
     * connection linking them to the student in wp_sophicly_connections.
     * Used by canvas/review + canvas/review-chat (read). Comment saves
     * continue to use the stricter verify_tutor_student_access.
     */
    private function verify_viewer_access($student_id) {
        // First try the write-access path — tutors, specialists, admins, the student themselves.
        $tutor_result = $this->verify_tutor_student_access($student_id);
        if ($tutor_result === true) return true;
        // Fall through to parent check.
        $viewer_id = get_current_user_id();
        if (!$viewer_id) {
            return new WP_Error('unauthorized', 'Login required.', ['status' => 401]);
        }
        // Parent role (by sophicly_role OR sophicly_att_role) with an active connection.
        $sophicly_role = get_user_meta($viewer_id, 'sophicly_role', true);
        $att_role      = get_user_meta($viewer_id, 'sophicly_att_role', true);
        $is_parent_role = ($sophicly_role === 'parent') || ($att_role === 'parent');
        if (!$is_parent_role) return $tutor_result;
        global $wpdb;
        $table = $wpdb->prefix . 'sophicly_connections';
        // v7.15.52: accept both 'active' (legacy) and 'connected' (current) — source
        //           plugin wrote 'active' historically and 'connected' on accept today.
        $row = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table}
             WHERE parent_id = %d AND student_id = %d
             AND status IN ('active', 'connected')
             LIMIT 1",
            $viewer_id, $student_id
        ));
        if ($row) return true;
        return new WP_Error('unauthorized', 'You are not linked to this student.', ['status' => 403]);
    }

    /**
     * List all canvas documents for the current user (for document picker).
     * Returns lightweight metadata without full HTML content.
     */
    public function list_canvas_documents($request) {
        $user_id = get_current_user_id();

        $board = sanitize_text_field($request->get_param('board') ?? '');
        $text  = sanitize_text_field($request->get_param('text') ?? '');

        global $wpdb;
        $like_key = 'swml_canvas_';
        if ($board) $like_key .= $board . '_';
        if ($text) $like_key .= $text;
        $like_key .= '%';

        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->usermeta} WHERE user_id = %d AND meta_key LIKE %s ORDER BY meta_key",
            $user_id,
            $like_key
        ));

        $docs = [];
        foreach ($rows as $row) {
            $val = $row->meta_value;
            if (is_array($val)) { $doc = $val; }
            else { $doc = self::decode_canvas_json($val); }
            if (!is_array($doc)) continue;
            $docs[] = [
                'key'         => $row->meta_key,
                'board'       => $doc['board'] ?? '',
                'text'        => $doc['text'] ?? '',
                'wordCount'   => $doc['wordCount'] ?? 0,
                'savedAt'     => $doc['savedAt'] ?? '',
                'topicNumber' => $doc['topicNumber'] ?? null,
            ];
        }

        return rest_ensure_response(['success' => true, 'documents' => $docs]);
    }

    /**
     * Debug: list ALL canvas meta keys for the current user.
     * Access: GET /sophicly-wml/v1/canvas/debug
     * Returns every meta_key starting with swml_canvas_ and its size.
     */
    public function debug_canvas_keys($request) {
        $user_id = get_current_user_id();
        global $wpdb;

        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, LENGTH(meta_value) as size, LEFT(meta_value, 200) as preview FROM {$wpdb->usermeta} WHERE user_id = %d AND meta_key LIKE %s ORDER BY meta_key",
            $user_id,
            'swml_canvas_%'
        ));

        $keys = [];
        foreach ($rows as $row) {
            $keys[] = [
                'key'     => $row->meta_key,
                'size'    => (int) $row->size,
                'preview' => $row->preview,
            ];
        }

        // Also try a test write/read/delete to verify DB is working
        $test_key = 'swml_canvas_debug_test_' . time();
        $test_val = wp_json_encode(['test' => true, 'time' => current_time('c')]);
        $write_result = update_user_meta($user_id, $test_key, $test_val);
        $read_result  = get_user_meta($user_id, $test_key, true);
        $read_ok      = ($read_result === $test_val);
        delete_user_meta($user_id, $test_key);

        return rest_ensure_response([
            'success'     => true,
            'user_id'     => $user_id,
            'canvas_keys' => $keys,
            'total_keys'  => count($keys),
            'db_test'     => [
                'write' => $write_result !== false,
                'read'  => $read_ok,
            ],
        ]);
    }

    /**
     * Tutor sign-off — stores tutor details on a canvas document.
     * Role-restricted via check_tutor_auth.
     */
    public function tutor_signoff($request) {
        $tutor_id = get_current_user_id();
        $tutor    = wp_get_current_user();
        $params   = $request->get_json_params();

        $board        = sanitize_text_field($params['board'] ?? '');
        $text         = sanitize_text_field($params['text'] ?? '');
        $topic_number = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix       = sanitize_text_field($params['suffix'] ?? '');
        $attempt      = absint($params['attempt'] ?? 0);
        $student_id   = absint($params['studentId'] ?? get_current_user_id());

        // Security: prevent tutor from signing off their own work (v7.15.2)
        if ($student_id === $tutor_id) {
            return new WP_Error('self_signoff', 'Cannot sign off your own work.', ['status' => 403]);
        }

        // v7.15.52: any tutor/specialist/admin may sign off for any student — group
        //           scoping was removed because catch-up lessons routinely mix tutors
        //           across groups. Route permission is already gated by check_tutor_auth.
        $auth = $this->verify_tutor_student_access($student_id);
        if (is_wp_error($auth)) return $auth;

        if (empty($board) || empty($text)) {
            return new WP_Error('missing_data', 'Missing board or text', ['status' => 400]);
        }

        // v7.15.44: Resolve the student's current attempt if not supplied so signoff lands on the right document
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($student_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key    = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);
        $signoff_key = $meta_key . '_signoff';

        $signoff_data = [
            'tutor_id'     => $tutor_id,
            'display_name' => $tutor->display_name,
            'avatar_url'   => get_avatar_url($tutor_id, ['size' => 64]),
            'timestamp'    => current_time('c'),
            'revoked'      => false,
            'attempt'      => $attempt,
        ];

        update_user_meta($student_id, $signoff_key, wp_slash(wp_json_encode($signoff_data)));

        return rest_ensure_response([
            'success' => true,
            'signoff' => $signoff_data,
        ]);
    }

    /**
     * Load sign-off data for a canvas document.
     */
    public function load_signoff($request) {
        $viewer_id    = get_current_user_id();
        // v7.15.84: accept studentId query param so tutor review loads the
        // student's signoff rather than the tutor's own meta. Falls back to
        // the current user for self-view. Permission still enforced below.
        $student_id_param = $request->get_param('studentId');
        $student_id   = ($student_id_param !== null && $student_id_param !== '') ? absint($student_id_param) : $viewer_id;
        $board        = sanitize_text_field($request->get_param('board') ?? '');
        $text         = sanitize_text_field($request->get_param('text') ?? '');
        $topic_number = $request->get_param('topicNumber');
        $topic_number = ($topic_number !== null && $topic_number !== '') ? absint($topic_number) : null;
        $suffix       = sanitize_text_field($request->get_param('suffix') ?? '');
        $attempt      = absint($request->get_param('attempt') ?? 0);

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        // If viewing someone else's signoff, verify the viewer is allowed to see it.
        // Read-only path uses verify_viewer_access so parents with active
        // connections to the student are also permitted.
        if ($student_id !== $viewer_id) {
            $auth = $this->verify_viewer_access($student_id);
            if (is_wp_error($auth)) return $auth;
        }

        // v7.15.44: Resolve current attempt if not supplied
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($student_id, $board, $text, $topic_number, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key    = $this->canvas_meta_key($board, $text, $topic_number, $suffix, $attempt);
        $signoff_key = $meta_key . '_signoff';

        $raw = get_user_meta($student_id, $signoff_key, true);
        if (empty($raw)) {
            return rest_ensure_response(['success' => true, 'signoff' => null]);
        }

        if (is_array($raw)) {
            return rest_ensure_response(['success' => true, 'signoff' => $raw]);
        }

        $signoff = json_decode($raw, true);
        if (!is_array($signoff)) {
            $signoff = json_decode(wp_unslash($raw), true);
        }

        return rest_ensure_response(['success' => true, 'signoff' => $signoff]);
    }

    /**
     * Decode canvas JSON from user_meta, with recovery for WordPress-corrupted data.
     *
     * WordPress's update_metadata() calls wp_unslash() on values before storing.
     * This strips the backslash escaping from JSON strings containing HTML attributes,
     * turning valid JSON like {"html":"<div class=\"foo\">"} into broken JSON like
     * {"html":"<div class="foo">"}. The unescaped quotes inside the HTML value
     * cause json_decode to fail.
     *
     * Recovery approach: The metadata fields (wordCount, savedAt, board, text, topicNumber)
     * are at the end of the string and have simple values. We find them using strrpos,
     * extract the HTML as everything between the first value and the metadata,
     * then parse the metadata separately.
     */
    private static function decode_canvas_json($raw) {
        if (!is_string($raw) || empty($raw)) return null;

        // 1. Try normal json_decode (works for properly-saved data via wp_slash)
        $doc = json_decode($raw, true);
        if (is_array($doc)) return $doc;

        // 2. Try wp_unslash / stripslashes (might help in some edge cases)
        $doc = json_decode(wp_unslash($raw), true);
        if (is_array($doc)) return $doc;
        $doc = json_decode(stripslashes($raw), true);
        if (is_array($doc)) return $doc;

        // 3. Recovery: extract fields from corrupted JSON
        // The string looks like: {"html":"...corrupted HTML...","wordCount":453,"savedAt":"...","board":"aqa","text":"macbeth","topicNumber":1}
        // Strategy: find the metadata at the END (searching backwards), treat everything else as HTML

        $result = [];

        // Find the last occurrence of ","wordCount": — this marks where the HTML value ends
        $wc_marker = '","wordCount":';
        $wc_pos = strrpos($raw, $wc_marker);

        if ($wc_pos !== false) {
            // HTML is between {"html":" (8 chars) and the wordCount marker
            $html_start = 9; // strlen('{"html":"')
            if (strpos($raw, '{"html":"') === 0 && $wc_pos > $html_start) {
                $result['html'] = substr($raw, $html_start, $wc_pos - $html_start);
            }

            // Metadata is from wordCount marker onwards, wrapped in braces to make valid JSON
            $meta_json = '{' . substr($raw, $wc_pos + 2); // skip the leading ","
            $meta = json_decode($meta_json, true);
            if (is_array($meta)) {
                $result = array_merge($result, $meta);
            } else {
                // Metadata JSON also broken — extract individual fields with regex
                if (preg_match('/"wordCount"\s*:\s*(\d+)/', $raw, $m)) $result['wordCount'] = (int) $m[1];
                if (preg_match('/"savedAt"\s*:\s*"([^"]+)"/', $raw, $m)) $result['savedAt'] = $m[1];
                if (preg_match('/"board"\s*:\s*"([^"]+)"/', $raw, $m)) $result['board'] = $m[1];
                if (preg_match('/"text"\s*:\s*"([^"]+)"/', $raw, $m)) $result['text'] = $m[1];
                if (preg_match('/"topicNumber"\s*:\s*(\d+)/', $raw, $m)) $result['topicNumber'] = (int) $m[1];
            }
        } else {
            // No wordCount marker found — try regex extraction as last resort
            if (preg_match('/"wordCount"\s*:\s*(\d+)/', $raw, $m)) $result['wordCount'] = (int) $m[1];
            if (preg_match('/"savedAt"\s*:\s*"([^"]+)"/', $raw, $m)) $result['savedAt'] = $m[1];
            if (preg_match('/"board"\s*:\s*"([^"]+)"/', $raw, $m)) $result['board'] = $m[1];
            if (preg_match('/"text"\s*:\s*"([^"]+)"/', $raw, $m)) $result['text'] = $m[1];
            if (preg_match('/"topicNumber"\s*:\s*(\d+)/', $raw, $m)) $result['topicNumber'] = (int) $m[1];

            // Try to extract HTML by finding the start
            if (strpos($raw, '{"html":"') === 0) {
                // Take everything up to the first metadata field we found
                $first_meta_pos = PHP_INT_MAX;
                foreach (['"wordCount"', '"savedAt"', '"board"', '"text"'] as $field) {
                    $pos = strrpos($raw, ',' . $field . ':');
                    if ($pos === false) $pos = strrpos($raw, ',"' . trim($field, '"') . '":');
                    if ($pos !== false && $pos < $first_meta_pos) $first_meta_pos = $pos;
                }
                if ($first_meta_pos < PHP_INT_MAX) {
                    $result['html'] = substr($raw, 9, $first_meta_pos - 9);
                }
            }
        }

        return !empty($result) ? $result : null;
    }

    // ═══════════════════════════════════════════
    //  PHASE COMPLETION
    // ═══════════════════════════════════════════

    /**
     * Mark a phase as complete.
     * Stores: swml_phase_{board}_{text}_t{topic}_{phase}
     * Fires: do_action('swml_phase_complete', ...) for external integrations.
     */
    public function complete_phase($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');
        $topic   = absint($params['topic_number'] ?? 0);
        $phase   = sanitize_text_field($params['phase'] ?? 'initial');
        $attempt = absint($params['attempt'] ?? 0);

        if (!$board || !$text || !$topic) {
            return new WP_Error('missing_params', 'board, text, and topic_number are required', ['status' => 400]);
        }
        if (!in_array($phase, ['initial', 'redraft', 'preliminary', 'free_practice', 'exam_practice'], true)) {
            return new WP_Error('invalid_phase', 'phase must be initial, redraft, preliminary, free_practice, or exam_practice', ['status' => 400]);
        }

        // v7.15.44: Resolve current attempt if not supplied
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, '');
            $attempt = $idx['current'] ?? 1;
        }

        $data = [
            'status'       => 'complete',
            'grade'        => sanitize_text_field($params['grade'] ?? ''),
            'total_score'  => sanitize_text_field($params['total_score'] ?? ''),
            'ao1_score'    => sanitize_text_field($params['ao1_score'] ?? ''),
            'ao2_score'    => sanitize_text_field($params['ao2_score'] ?? ''),
            'ao3_score'    => sanitize_text_field($params['ao3_score'] ?? ''),
            'ao4_score'    => sanitize_text_field($params['ao4_score'] ?? ''),
            'strength_1'   => sanitize_text_field($params['strength_1'] ?? ''),
            'target_1'     => sanitize_text_field($params['target_1'] ?? ''),
            'target_2'     => sanitize_text_field($params['target_2'] ?? ''),
            'attempt'      => $attempt,
            'completed_at' => current_time('mysql'),
        ];

        $meta_key = $this->phase_meta_key($board, $text, $topic, $phase, $attempt);
        $json     = wp_json_encode($data);
        $result   = update_user_meta($user_id, $meta_key, wp_slash($json));

        // Verify round-trip (rule #9)
        $verify = get_user_meta($user_id, $meta_key, true);
        $decoded = json_decode($verify, true);
        if (!$decoded || empty($decoded['status'])) {
            return new WP_Error('storage_error', 'Phase completion saved but round-trip verification failed', ['status' => 500]);
        }

        // v7.15.44: When Phase 2 (redraft) finishes, auto-mark the attempt complete in the index
        if ($phase === 'redraft') {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, '');
            foreach ($idx['attempts'] as &$a) {
                if ($a['num'] === $attempt) {
                    $a['status']      = 'complete';
                    $a['completedAt'] = current_time('c');
                    if (!empty($data['grade']))       $a['grade'] = $data['grade'];
                    if (!empty($data['total_score'])) $a['score'] = $data['total_score'];
                    break;
                }
            }
            unset($a);
            $this->save_attempt_index($user_id, $board, $text, $topic, '', $idx);
        }

        // Fire action for external integrations (student-data plugin, LearnDash bridge)
        // v7.15.44: Attempt number now lives inside $data; listeners that care can read $data['attempt']
        do_action('swml_phase_complete', $user_id, $board, $text, $topic, $phase, $data);

        // Rebuild learning profile after each completion
        $profile = self::rebuild_learning_profile($user_id);

        return rest_ensure_response([
            'success'  => true,
            'meta_key' => $meta_key,
            'attempt'  => $attempt,
            'data'     => $decoded,
            'profile'  => $profile ? true : false,
        ]);
    }

    /**
     * Get phase status for a specific topic.
     * Returns initial + redraft status from WML's own meta.
     */
    public function get_phase_status($request) {
        $user_id = get_current_user_id();
        $board   = sanitize_text_field($request->get_param('board') ?? '');
        $text    = sanitize_text_field($request->get_param('text') ?? '');
        $topic   = absint($request->get_param('topic') ?? 0);
        $attempt = absint($request->get_param('attempt') ?? 0);

        if (!$board || !$text || !$topic) {
            return new WP_Error('missing_params', 'board, text, and topic are required', ['status' => 400]);
        }

        // v7.15.44: Resolve current attempt if not supplied
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, '');
            $attempt = $idx['current'] ?? 1;
        }

        // v7.15.44: Attempt 1 uses the legacy un-suffixed key, attempt 2+ uses __aN
        $initial_key = $this->phase_meta_key($board, $text, $topic, 'initial', $attempt);
        $redraft_key = $this->phase_meta_key($board, $text, $topic, 'redraft', $attempt);

        $initial_raw = get_user_meta($user_id, $initial_key, true);
        $redraft_raw = get_user_meta($user_id, $redraft_key, true);

        $initial = $initial_raw ? json_decode($initial_raw, true) : null;
        $redraft = $redraft_raw ? json_decode($redraft_raw, true) : null;

        return rest_ensure_response([
            'initial' => $initial,
            'redraft' => $redraft,
            'attempt' => $attempt,
        ]);
    }

    // ═══════════════════════════════════════════
    //  CANVAS CHAT PERSISTENCE
    // ═══════════════════════════════════════════

    // v7.15.12: Attempt-aware meta keys — attempt 1 has no suffix (backward compatible), attempt 2+ appends __a{N}
    private function canvas_meta_key($board, $text, $topic, $suffix = '', $attempt = 1) {
        $key = 'swml_canvas_' . $board . '_' . $text;
        if ($topic !== null && $topic > 0) {
            $key .= '_t' . $topic;
        }
        if (!empty($suffix)) {
            $key .= $suffix;
        }
        if ($attempt > 1) {
            $key .= '__a' . $attempt;
        }
        return $key;
    }

    private function chat_meta_key($board, $text, $topic, $suffix = '', $attempt = 1) {
        $key = 'swml_chat_' . $board . '_' . $text;
        if ($topic > 0) $key .= '_t' . $topic;
        if (!empty($suffix)) $key .= $suffix;
        if ($attempt > 1) $key .= '__a' . $attempt;
        return $key;
    }

    // v7.15.12: Attempt index — base key without attempt suffix, stores attempt metadata
    private function attempt_index_key($board, $text, $topic, $suffix = '') {
        $key = 'swml_attempts_' . $board . '_' . $text;
        if ($topic !== null && $topic > 0) $key .= '_t' . $topic;
        if (!empty($suffix)) $key .= $suffix;
        return $key;
    }

    // v7.15.44: Phase completion meta key — attempt-aware. Attempt 1 keeps legacy un-suffixed format for backward compat.
    private function phase_meta_key($board, $text, $topic, $phase, $attempt = 1) {
        $key = sprintf('swml_phase_%s_%s_t%d_%s', $board, $text, $topic, $phase);
        if ($attempt > 1) $key .= '__a' . $attempt;
        return $key;
    }

    /**
     * Get or create the attempt index for an exercise.
     * Returns array: { count, current, attempts: [ { num, started, status, grade, score, wordCount } ] }
     */
    private function get_attempt_index($user_id, $board, $text, $topic, $suffix) {
        $idx_key = $this->attempt_index_key($board, $text, $topic, $suffix);
        $raw = get_user_meta($user_id, $idx_key, true);
        if (!empty($raw)) {
            $idx = is_array($raw) ? $raw : json_decode($raw, true);
            if (is_array($idx) && isset($idx['count'])) return $idx;
        }
        // Auto-create index — check if a legacy (attempt 1) document exists
        $legacy_key = $this->canvas_meta_key($board, $text, $topic, $suffix, 1);
        $legacy = get_user_meta($user_id, $legacy_key, true);
        if (!empty($legacy)) {
            $doc = is_array($legacy) ? $legacy : json_decode($legacy, true);
            $idx = [
                'count'   => 1,
                'current' => 1,
                'attempts' => [[
                    'num'       => 1,
                    'started'   => $doc['savedAt'] ?? current_time('c'),
                    'status'    => 'in_progress',
                    'grade'     => null,
                    'score'     => null,
                    'wordCount' => $doc['wordCount'] ?? 0,
                ]],
            ];
        } else {
            $idx = [
                'count'    => 1,
                'current'  => 1,
                'attempts' => [[
                    'num'       => 1,
                    'started'   => current_time('c'),
                    'status'    => 'not_started',
                    'grade'     => null,
                    'score'     => null,
                    'wordCount' => 0,
                ]],
            ];
        }
        update_user_meta($user_id, $idx_key, wp_slash(wp_json_encode($idx)));
        return $idx;
    }

    private function save_attempt_index($user_id, $board, $text, $topic, $suffix, $idx) {
        $idx_key = $this->attempt_index_key($board, $text, $topic, $suffix);
        update_user_meta($user_id, $idx_key, wp_slash(wp_json_encode($idx)));
    }

    public function save_canvas_chat($request) {
        // v7.15.91: read-only views can't append to the canvas chat log.
        $gate = $this->check_viewer_write_allowed($request);
        if (is_wp_error($gate)) return $gate;

        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');
        $topic   = absint($params['topicNumber'] ?? 0);
        $suffix  = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 0);
        $history = $params['history'] ?? [];
        $chat_id = sanitize_text_field($params['chatId'] ?? '');

        // Security: sanitize chat message content to prevent stored XSS (v7.15.2)
        $history = array_map(function($msg) {
            if (is_array($msg) && isset($msg['content'])) {
                $msg['content'] = wp_kses_post($msg['content']);
            }
            return $msg;
        }, $history);

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        // v7.15.12: Resolve attempt
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic, $suffix, $attempt);
        $data = [
            'history'  => $history,
            'chatId'   => $chat_id,
            'savedAt'  => current_time('c'),
            'count'    => count($history),
        ];

        $result = update_user_meta($user_id, $meta_key, wp_slash(wp_json_encode($data)));

        return rest_ensure_response([
            'success' => $result !== false,
            'key'     => $meta_key,
            'count'   => count($history),
        ]);
    }

    public function load_canvas_chat($request) {
        $user_id = get_current_user_id();
        $board   = sanitize_text_field($request->get_param('board') ?? '');
        $text    = sanitize_text_field($request->get_param('text') ?? '');
        $topic   = absint($request->get_param('topicNumber') ?? 0);
        $suffix  = sanitize_text_field($request->get_param('suffix') ?? '');
        $attempt = absint($request->get_param('attempt') ?? 0);

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        // v7.15.12: Resolve attempt
        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic, $suffix, $attempt);
        $raw = get_user_meta($user_id, $meta_key, true);
        $data = $raw ? json_decode($raw, true) : null;

        return rest_ensure_response([
            'success' => !empty($data),
            'chat'    => $data,
        ]);
    }

    public function clear_canvas_chat($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board  = sanitize_text_field($params['board'] ?? '');
        $text   = sanitize_text_field($params['text'] ?? '');
        $topic  = absint($params['topicNumber'] ?? 0);
        $suffix = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 0);

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        if ($attempt < 1) {
            $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
            $attempt = $idx['current'] ?? 1;
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic, $suffix, $attempt);
        delete_user_meta($user_id, $meta_key);

        return rest_ensure_response(['success' => true, 'key' => $meta_key]);
    }

    // ═══════════════════════════════════════════
    //  LEARNING PROFILE (cross-text aggregation)
    // ═══════════════════════════════════════════

    /**
     * Rebuild learning profile by scanning all swml_phase_* meta for this user.
     * Stores aggregated profile in swml_learning_profile user_meta.
     * Fires do_action('swml_learning_profile_updated') for student-data plugin.
     */
    public static function rebuild_learning_profile($user_id) {
        global $wpdb;

        // Fetch all phase completion meta keys for this user
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->usermeta} WHERE user_id = %d AND meta_key LIKE 'swml_phase_%%'",
            $user_id
        ));

        if (empty($rows)) return null;

        $assessments = [];
        $all_targets = [];
        $all_strengths = [];
        $score_history = [];

        foreach ($rows as $row) {
            $data = json_decode($row->meta_value, true);
            if (!$data || empty($data['status']) || $data['status'] !== 'complete') continue;

            // Parse meta key: swml_phase_{board}_{text}_t{topic}_{phase}
            $parts = explode('_', str_replace('swml_phase_', '', $row->meta_key));
            $board = $parts[0] ?? '';
            // Text may contain underscores — everything between board and _t{N}_{phase}
            $key_remainder = str_replace('swml_phase_' . $board . '_', '', $row->meta_key);
            preg_match('/^(.+)_t(\d+)_(initial|redraft)$/', $key_remainder, $m);
            $text  = $m[1] ?? '';
            $topic = (int) ($m[2] ?? 0);
            $phase = $m[3] ?? '';

            $assessments[] = [
                'board' => $board,
                'text'  => $text,
                'topic' => $topic,
                'phase' => $phase,
                'total_score'  => $data['total_score'] ?? '',
                'grade'        => $data['grade'] ?? '',
                'ao1_score'    => $data['ao1_score'] ?? '',
                'ao2_score'    => $data['ao2_score'] ?? '',
                'ao3_score'    => $data['ao3_score'] ?? '',
                'ao4_score'    => $data['ao4_score'] ?? '',
                'strength_1'   => $data['strength_1'] ?? '',
                'target_1'     => $data['target_1'] ?? '',
                'target_2'     => $data['target_2'] ?? '',
                'completed_at' => $data['completed_at'] ?? '',
            ];

            if (!empty($data['target_1'])) $all_targets[] = $data['target_1'];
            if (!empty($data['target_2'])) $all_targets[] = $data['target_2'];
            if (!empty($data['strength_1'])) $all_strengths[] = $data['strength_1'];
            if (!empty($data['total_score'])) $score_history[] = $data['total_score'];
        }

        if (empty($assessments)) return null;

        // Count recurring targets (top patterns)
        $target_counts = array_count_values(array_map('strtolower', $all_targets));
        arsort($target_counts);
        $recurring_targets = array_slice(array_keys($target_counts), 0, 5);

        // Count recurring strengths
        $strength_counts = array_count_values(array_map('strtolower', $all_strengths));
        arsort($strength_counts);
        $recurring_strengths = array_slice(array_keys($strength_counts), 0, 3);

        $profile = [
            'assessment_count'     => count($assessments),
            'texts_assessed'       => array_values(array_unique(array_column($assessments, 'text'))),
            'score_history'        => $score_history,
            'recurring_targets'    => $recurring_targets,
            'recurring_strengths'  => $recurring_strengths,
            'assessments'          => $assessments,
            'updated_at'           => current_time('mysql'),
        ];

        update_user_meta($user_id, 'swml_learning_profile', wp_slash(wp_json_encode($profile)));

        // Fire hook for student-data plugin
        do_action('swml_learning_profile_updated', $user_id, $profile);

        return $profile;
    }

    public function get_learning_profile($request) {
        $user_id = get_current_user_id();
        $raw = get_user_meta($user_id, 'swml_learning_profile', true);
        $profile = $raw ? json_decode($raw, true) : null;

        return rest_ensure_response([
            'success' => !empty($profile),
            'profile' => $profile,
        ]);
    }

    // ═══════════════════════════════════════════
    //  CREATIVE WRITING PROJECT STORAGE (v7.13.30)
    // ═══════════════════════════════════════════

    /**
     * Create or update a creative writing project.
     * POST { action: 'create', name: '...', course_context: '...' }
     * POST { action: 'update', project_id: '...', name: '...', status: '...' }
     */
    public function save_cw_project($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();
        $action = sanitize_key($params['action'] ?? 'create');

        if ($action === 'create') {
            $name = sanitize_text_field($params['name'] ?? 'Untitled Story');
            $course_context = sanitize_key($params['course_context'] ?? 'standalone');
            $entry = SWML_Session_Manager::create_project($user_id, $name, $course_context);

            return rest_ensure_response([
                'success' => true,
                'project' => $entry,
            ]);
        }

        if ($action === 'update') {
            $project_id = sanitize_key($params['project_id'] ?? '');
            if (empty($project_id)) {
                return rest_ensure_response(['success' => false, 'message' => 'Missing project_id']);
            }

            $index = SWML_Session_Manager::list_projects($user_id);
            if (!isset($index[$project_id])) {
                return rest_ensure_response(['success' => false, 'message' => 'Project not found']);
            }

            if (!empty($params['name'])) $index[$project_id]['name'] = sanitize_text_field($params['name']);
            if (!empty($params['status'])) $index[$project_id]['status'] = sanitize_key($params['status']);
            $index[$project_id]['updated'] = current_time('mysql');

            update_user_meta($user_id, 'swml_cw_projects', wp_slash(wp_json_encode($index)));

            return rest_ensure_response([
                'success' => true,
                'project' => $index[$project_id],
            ]);
        }

        return rest_ensure_response(['success' => false, 'message' => 'Invalid action']);
    }

    /**
     * Load a creative writing project by ID, or list all projects.
     * GET ?project_id=cwp_xxx  → full project data
     * GET (no params)          → project index (list)
     */
    public function load_cw_project($request) {
        $user_id = get_current_user_id();
        $project_id = sanitize_key($request->get_param('project_id') ?? '');

        if (empty($project_id)) {
            // List all projects
            $index = SWML_Session_Manager::list_projects($user_id);
            return rest_ensure_response([
                'success'  => true,
                'projects' => array_values($index),
            ]);
        }

        // Load specific project
        $project = SWML_Session_Manager::get_project($user_id, $project_id);
        if ($project === null) {
            return rest_ensure_response(['success' => false, 'message' => 'Project not found']);
        }

        return rest_ensure_response([
            'success' => true,
            'project' => $project,
        ]);
    }

    /**
     * Save a specific artifact within a project.
     * POST { project_id: '...', key: 'writer_profile', value: { ... } }
     */
    public function save_cw_artifact($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $project_id = sanitize_key($params['project_id'] ?? '');
        $key = sanitize_key($params['key'] ?? '');
        $value = $params['value'] ?? null;

        if (empty($project_id) || empty($key)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing project_id or key']);
        }

        $result = SWML_Session_Manager::save_project_artifact($user_id, $project_id, $key, $value);
        if ($result === false) {
            return rest_ensure_response(['success' => false, 'message' => 'Project not found']);
        }

        return rest_ensure_response([
            'success' => true,
            'key'     => $key,
        ]);
    }

    /**
     * Load a specific artifact from a project.
     * GET ?project_id=cwp_xxx&key=writer_profile
     */
    public function load_cw_artifact($request) {
        $user_id = get_current_user_id();
        $project_id = sanitize_key($request->get_param('project_id') ?? '');
        $key = sanitize_key($request->get_param('key') ?? '');

        if (empty($project_id) || empty($key)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing project_id or key']);
        }

        $value = SWML_Session_Manager::get_project_artifact($user_id, $project_id, $key);

        return rest_ensure_response([
            'success' => true,
            'key'     => $key,
            'value'   => $value,
        ]);
    }

    /**
     * Save a trial result to a project.
     * POST { project_id: '...', trial: { trial_number, focus, band, ... } }
     */
    public function save_cw_trial($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $project_id = sanitize_key($params['project_id'] ?? '');
        $trial_data = $params['trial'] ?? null;

        if (empty($project_id) || empty($trial_data)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing project_id or trial data']);
        }

        $result = SWML_Session_Manager::save_trial_result($user_id, $project_id, $trial_data);
        if ($result === false) {
            return rest_ensure_response(['success' => false, 'message' => 'Project not found']);
        }

        return rest_ensure_response(['success' => true]);
    }

    /**
     * Mark a step as complete within a project.
     * POST { project_id: '...', step: 5, complete: true }
     */
    public function complete_cw_step($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $project_id = sanitize_key($params['project_id'] ?? '');
        $step = absint($params['step'] ?? 0);
        $complete = $params['complete'] ?? true;

        if (empty($project_id) || $step === 0) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing project_id or step']);
        }

        $result = SWML_Session_Manager::update_step_completion($user_id, $project_id, $step, (bool) $complete);
        if ($result === false) {
            return rest_ensure_response(['success' => false, 'message' => 'Project not found']);
        }

        return rest_ensure_response(['success' => true, 'step' => $step]);
    }

    /**
     * v7.13.60: Serve plot structure template as TipTap-compatible HTML.
     * GET /cw-project/plot-template?structure=heros-journey
     * Reads markdown from protocols/shared/templates/plot-structures/{slug}.md
     * and converts the table format to sectionHTML blocks.
     */
    public function get_plot_template($request) {
        $structure = sanitize_file_name($request->get_param('structure') ?: 'heros-journey');

        // Map friendly names to file slugs
        $slug_map = [
            'heros_journey'          => 'heros-journey',
            'heros-journey'          => 'heros-journey',
            'hero_journey'           => 'heros-journey',
            'coming_of_age'          => 'coming-of-age',
            'coming-of-age'          => 'coming-of-age',
            'overcoming_the_monster' => 'overcoming-the-monster',
            'overcoming-the-monster' => 'overcoming-the-monster',
            'rags_to_riches'         => 'rags-to-riches',
            'rags-to-riches'         => 'rags-to-riches',
            'rebirth_redemption'     => 'rebirth-redemption',
            'rebirth-redemption'     => 'rebirth-redemption',
            'redemption'             => 'rebirth-redemption',
            'the_quest'              => 'the-quest',
            'the-quest'              => 'the-quest',
            'quest'                  => 'the-quest',
            'tragedy'                => 'tragedy',
            'voyage_and_return'      => 'voyage-and-return',
            'voyage-and-return'      => 'voyage-and-return',
        ];
        $slug = $slug_map[strtolower($structure)] ?? $structure;

        $file = SWML_PROTOCOLS_PATH . 'shared/templates/plot-structures/' . $slug . '.md';
        if (!file_exists($file)) {
            // Default to Hero's Journey
            $file = SWML_PROTOCOLS_PATH . 'shared/templates/plot-structures/heros-journey.md';
        }

        $markdown = file_get_contents($file);
        $html = $this->convert_plot_markdown_to_tiptap($markdown, $slug);

        // Structure name labels
        $labels = [
            'heros-journey'          => "Hero's Journey (Original)",
            'coming-of-age'          => 'Coming of Age + Hero\'s Journey',
            'overcoming-the-monster'  => 'Overcoming the Monster + Hero\'s Journey',
            'rags-to-riches'         => 'Rags to Riches + Hero\'s Journey',
            'rebirth-redemption'     => 'Rebirth / Redemption + Hero\'s Journey',
            'the-quest'              => 'The Quest + Hero\'s Journey',
            'tragedy'                => 'Tragedy + Hero\'s Journey',
            'voyage-and-return'      => 'Voyage and Return + Hero\'s Journey',
        ];

        return rest_ensure_response([
            'success'   => true,
            'structure' => $slug,
            'label'     => $labels[$slug] ?? $slug,
            'html'      => $html,
        ]);
    }

    /**
     * Convert plot template markdown (pipe tables) to TipTap section HTML.
     * Each STAGE header becomes a divider + plan section with the beats as content.
     */
    private function convert_plot_markdown_to_tiptap($markdown, $slug) {
        $lines = explode("\n", $markdown);
        $html = '';
        $current_stage = '';
        $current_beats = [];
        $stage_num = 0;
        $stage_labels = [
            'I'   => ['num' => 1, 'short' => 'Setup'],
            'II'  => ['num' => 2, 'short' => 'Dream Stage'],
            'III' => ['num' => 3, 'short' => 'Initial Fascination'],
            'IV'  => ['num' => 4, 'short' => 'Nightmare Stage'],
            'V'   => ['num' => 5, 'short' => 'Final Push'],
            'VI'  => ['num' => 6, 'short' => 'Goal & Aftermath'],
        ];

        // Flush accumulated beats for current stage
        $flush = function() use (&$html, &$current_stage, &$current_beats, &$stage_num, $stage_labels) {
            if (empty($current_stage) || empty($current_beats)) return;

            // Find stage Roman numeral — match precisely with word boundary
            $roman = '';
            // Check longest numerals first to avoid "I" matching "II"
            foreach (['VI', 'IV', 'V', 'III', 'II', 'I'] as $r) {
                if (preg_match('/STAGE\s+' . $r . '(?![IVX])/i', $current_stage)) {
                    $roman = $r;
                    $stage_num = $stage_labels[$r]['num'];
                    break;
                }
            }
            $short = $stage_labels[$roman]['short'] ?? 'Stage';
            $full_label = $stage_num . '. ' . $short;
            $divider_label = 'STAGE ' . $roman . ': ' . strtoupper($short);

            // Build section HTML with visual hierarchy
            $inner = '<h3>' . esc_html($full_label) . '</h3>';
            // Stage subtitle as a beat (negative tone) — students write about this thematic prompt
            $inner .= '<p><mark data-color="#ff8b94" style="background-color:#ff8b94"><em>' . esc_html($current_stage) . '</em></mark></p>';
            $inner .= '<p></p>';

            foreach ($current_beats as $beat) {
                $beat = trim($beat);
                if (empty($beat)) continue;

                // Extract explicit tone marker: [negative], [positive], [neutral], [turning-point], [shocking], [marker]
                $tone = 'neutral';
                if (preg_match('/^\[(negative|positive|neutral|turning-point|shocking|marker)\]\s*/i', $beat, $tm)) {
                    $tone = strtolower($tm[1]);
                    $beat = trim(substr($beat, strlen($tm[0])));
                }

                // Classify: headings vs beats
                // Headings: turning points, sub-headers (no writing space, no icon)
                // Named beats: stunning surprises, epiphanies (bold + icon + writing space)
                // Regular beats: everything else (italic + icon + writing space)
                $is_turning_point = preg_match('/^TURNING POINT/i', $beat);
                // Only structural markers are headings — NOT "B Story", "New Information", "Theme Stated" (those are beats)
                $is_subheader = $tone === 'marker' || preg_match('/^(ANTICIPATION|FRUSTRATION|INCITING INCIDENT|HIGHER STAKES|DREAM STAGE)\b/i', $beat);
                $is_heading = $is_turning_point || $is_subheader;

                $is_epiphany = preg_match('/^(FIRST|SECOND|THIRD) EPIPHANY/i', $beat);
                $is_surprise = preg_match('/^STUNNING SURPRISE/i', $beat);
                $is_named_beat = $is_epiphany || $is_surprise; // bold beats that still need writing

                // Map shocking → negative for colour purposes
                if ($tone === 'shocking') $tone = 'negative';
                if ($tone === 'marker') $tone = 'turning-point';

                // Colour map: turning-point=teal, positive=green, negative=red, neutral=peach
                $tone_colours = [
                    'turning-point' => '#51dacf',
                    'positive'      => '#a8e6cf',
                    'negative'      => '#ff8b94',
                    'neutral'       => '#ffd3b6',
                ];
                $mark_colour = $tone_colours[$tone] ?? '';

                if ($is_heading) {
                    // Headings (Turning Points, sub-headers) — bold, NO mark, no icon, no writing space
                    $inner .= '<p><strong>' . esc_html($beat) . '</strong></p>';
                } elseif ($is_named_beat) {
                    // Named beats (Stunning Surprise, Epiphany) — bold + mark (gets icon via CSS) + writing space
                    if ($mark_colour) {
                        $inner .= '<p><mark data-color="' . esc_attr($mark_colour) . '" style="background-color:' . esc_attr($mark_colour) . '"><strong>' . esc_html($beat) . '</strong></mark></p>';
                    } else {
                        $inner .= '<p><mark data-color="#ffd3b6" style="background-color:#ffd3b6"><strong>' . esc_html($beat) . '</strong></mark></p>';
                    }
                    $inner .= '<p></p>';
                } else {
                    // Regular beat — italic + mark (gets icon via CSS) + writing space
                    if ($mark_colour) {
                        $inner .= '<p><mark data-color="' . esc_attr($mark_colour) . '" style="background-color:' . esc_attr($mark_colour) . '"><em>' . esc_html($beat) . '</em></mark></p>';
                    } else {
                        $inner .= '<p><mark data-color="#ffd3b6" style="background-color:#ffd3b6"><em>' . esc_html($beat) . '</em></mark></p>';
                    }
                    $inner .= '<p></p>';
                }
            }

            // Section uses plan type (editable, purple border)
            $html .= '<div data-section-type="divider" data-section-label="' . esc_attr($divider_label) . '" data-editable="false" class="swml-section-block swml-section-divider swml-section-readonly"><p>' . esc_html($divider_label) . '</p></div>';
            $html .= '<div data-section-type="plan" data-section-label="' . esc_attr($full_label) . '" data-editable="true" class="swml-section-block swml-section-plan">' . $inner . '</div>';

            $current_beats = [];
        };

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip empty lines and table separator lines
            if (empty($line) || preg_match('/^\|?\s*-+\s*\|/', $line)) continue;

            // Check for stage header: | STAGE I: ... | | — match Roman numerals I-VI
            if (preg_match('/^\|\s*STAGE\s+(VI|IV|V|III|II|I)\s*:\s*(.+?)\s*\|/i', $line, $m)) {
                // Flush previous stage
                $flush();
                $current_stage = 'Stage ' . strtoupper($m[1]) . ': ' . trim($m[2], " |");
                continue;
            }

            // Regular table row: | content | notes |
            if (preg_match('/^\|\s*(.+?)\s*\|/', $line, $m)) {
                $content = trim($m[1]);
                // Strip markdown escapes and clean up
                $content = str_replace(['\\-', '\\#', '\\*'], ['-', '#', '*'], $content);
                $content = preg_replace('/\*\*?(.+?)\*\*?/', '$1', $content); // strip bold/italic markers
                $content = trim($content);
                if (!empty($content) && $content !== '|') {
                    $current_beats[] = $content;
                }
            }
        }
        // Flush final stage
        $flush();

        return $html;
    }

    // ═══════════════════════════════════════════
    //  ATTEMPT MANAGEMENT (v7.15.12)
    // ═══════════════════════════════════════════

    /**
     * GET /attempts — returns attempt index for a given exercise.
     * Query params: board, text, topicNumber, suffix
     */
    public function get_attempts($request) {
        $user_id = get_current_user_id();
        $board  = sanitize_text_field($request->get_param('board') ?? '');
        $text   = sanitize_text_field($request->get_param('text') ?? '');
        $topic  = $request->get_param('topicNumber');
        $topic  = ($topic !== null && $topic !== '') ? absint($topic) : null;
        $suffix = sanitize_text_field($request->get_param('suffix') ?? '');

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
        return rest_ensure_response(['success' => true, 'attempts' => $idx]);
    }

    /**
     * v7.15.78: GET /student/attempts-all — flat list of every attempt across
     * every (board, text, topic, suffix) combo for the current user. Powers
     * the standalone feedback-discussion picker. Admin/tutor/SSS may pass
     * ?student_id= to query a specific student.
     */
    public function get_all_attempts($request) {
        $viewer_id = get_current_user_id();
        $student_id = absint($request->get_param('student_id') ?? 0);

        if ($student_id && $student_id !== $viewer_id) {
            $att_role  = get_user_meta($viewer_id, 'sophicly_att_role', true);
            $soph_role = get_user_meta($viewer_id, 'sophicly_role', true);
            $allowed = current_user_can('manage_options')
                || $att_role === 'tutor'
                || $att_role === 'specialist'
                || $soph_role === 'sss';
            if (!$allowed) {
                return new WP_Error('forbidden', 'Not authorised to view this student', ['status' => 403]);
            }
            $user_id = $student_id;
        } else {
            $user_id = $viewer_id;
        }

        global $wpdb;
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->usermeta}
             WHERE user_id = %d AND meta_key LIKE %s
             ORDER BY meta_key",
            $user_id,
            'swml_attempts_%'
        ));

        // v7.15.98: known task suffixes stored WITHOUT a topic segment.
        // Parser previously only recognised suffixes after a `t<digit>` token,
        // so keys like swml_attempts_aqa_macbeth_eq were mis-parsed as
        // text='macbeth_eq' with empty suffix, breaking dashboard joins.
        $TASK_SUFFIXES = ['eq', 'ma', 'vr', 'ep', 'cn', 'mp'];
        $TASK_BY_SUFFIX = [
            '_eq' => 'exam_question',
            '_ma' => 'model_answer',
            '_vr' => 'verbal_rehearsal',
            '_ep' => 'essay_plan',
            '_cn' => 'conceptual_notes',
            '_mp' => 'memory_practice',
        ];

        $out = [];
        foreach ((array) $rows as $row) {
            $key = $row->meta_key;
            $val = $row->meta_value;
            // key shape: swml_attempts_{board}_{text}[_t{topic}][_suffix]
            $rest = substr($key, strlen('swml_attempts_'));
            $parts = explode('_', $rest);
            if (count($parts) < 2) continue;
            $board = $parts[0];
            $text_parts = [];
            $topic = 0;
            $suffix = '';
            $i = 1;
            while ($i < count($parts)) {
                $p = $parts[$i];
                if (preg_match('/^t(\d+)$/', $p, $m)) {
                    $topic = (int) $m[1];
                    $i++;
                    // remaining parts form the suffix
                    if ($i < count($parts)) {
                        $suffix = '_' . implode('_', array_slice($parts, $i));
                    }
                    break;
                }
                // v7.15.98: last segment that matches a known task suffix
                // is the suffix itself, not part of the text slug.
                if ($i === count($parts) - 1 && in_array($p, $TASK_SUFFIXES, true)) {
                    $suffix = '_' . $p;
                    break;
                }
                $text_parts[] = $p;
                $i++;
            }
            $text = implode('_', $text_parts ?: [$parts[1] ?? '']);
            $task = $TASK_BY_SUFFIX[$suffix] ?? null;
            $idx = is_array($val) ? $val : json_decode($val, true);
            if (!is_array($idx) || empty($idx['attempts'])) continue;
            foreach ($idx['attempts'] as $a) {
                if (!is_array($a)) continue;
                $out[] = [
                    'board'      => $board,
                    'text'       => $text,
                    'topic'      => $topic,
                    'suffix'     => $suffix,
                    'task'       => $task,
                    'attempt'    => isset($a['num']) ? (int) $a['num'] : 1,
                    'status'     => $a['status'] ?? 'not_started',
                    'grade'      => $a['grade'] ?? null,
                    'score'      => $a['score'] ?? null,
                    'wordCount'  => $a['wordCount'] ?? 0,
                    'started'    => $a['started'] ?? '',
                    'label'      => sprintf(
                        '%s %s%s — Attempt %d',
                        strtoupper($board),
                        $text,
                        $topic ? ' / Topic ' . $topic : '',
                        isset($a['num']) ? (int) $a['num'] : 1
                    ),
                ];
            }
        }

        return rest_ensure_response([
            'success'  => true,
            'user_id'  => $user_id,
            'attempts' => $out,
        ]);
    }

    /**
     * POST /attempts/new — creates a new attempt, returns the new attempt number.
     * Body: board, text, topicNumber, suffix
     */
    public function create_attempt($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board  = sanitize_text_field($params['board'] ?? '');
        $text   = sanitize_text_field($params['text'] ?? '');
        $topic  = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix = sanitize_text_field($params['suffix'] ?? '');
        // v7.15.64: capture planning mode at creation so Continue restores it without re-prompting
        $planning_mode = sanitize_text_field($params['planningMode'] ?? '');

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
        $new_num = $idx['count'] + 1;
        $idx['count'] = $new_num;
        $idx['current'] = $new_num;
        $new_entry = [
            'num'       => $new_num,
            'started'   => current_time('c'),
            'status'    => 'not_started',
            'grade'     => null,
            'score'     => null,
            'wordCount' => 0,
        ];
        if (!empty($planning_mode)) {
            $new_entry['planningMode'] = $planning_mode;
        }
        $idx['attempts'][] = $new_entry;
        $this->save_attempt_index($user_id, $board, $text, $topic, $suffix, $idx);

        return rest_ensure_response([
            'success' => true,
            'attempt' => $new_num,
            'attempts' => $idx,
        ]);
    }

    /**
     * POST /attempts/switch — switches the current pointer to a different attempt.
     * Body: board, text, topicNumber, suffix, attempt
     */
    public function switch_attempt($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');
        $topic   = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix  = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 0);

        if (!$board || !$text || $attempt < 1) {
            return new WP_Error('missing_params', 'board, text, and attempt are required', ['status' => 400]);
        }

        $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
        if ($attempt > $idx['count']) {
            return new WP_Error('invalid_attempt', 'Attempt number does not exist', ['status' => 400]);
        }

        $idx['current'] = $attempt;
        $this->save_attempt_index($user_id, $board, $text, $topic, $suffix, $idx);

        return rest_ensure_response(['success' => true, 'current' => $attempt, 'attempts' => $idx]);
    }

    /**
     * POST /attempts/complete — marks an attempt as complete with grade/score.
     * Body: board, text, topicNumber, suffix, attempt, grade, score
     */
    public function complete_attempt($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');
        $topic   = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;
        $suffix  = sanitize_text_field($params['suffix'] ?? '');
        $attempt = absint($params['attempt'] ?? 0);
        $grade   = sanitize_text_field($params['grade'] ?? '');
        $score   = sanitize_text_field($params['score'] ?? '');

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $idx = $this->get_attempt_index($user_id, $board, $text, $topic, $suffix);
        if ($attempt < 1) $attempt = $idx['current'] ?? 1;

        foreach ($idx['attempts'] as &$a) {
            if ($a['num'] === $attempt) {
                $a['status'] = 'complete';
                $a['completedAt'] = current_time('c');
                if (!empty($grade)) $a['grade'] = $grade;
                if (!empty($score)) $a['score'] = $score;
                break;
            }
        }
        unset($a);
        $this->save_attempt_index($user_id, $board, $text, $topic, $suffix, $idx);

        return rest_ensure_response(['success' => true, 'attempts' => $idx]);
    }

    /**
     * v7.15.51: Resolve the first not-complete LD lesson within a topic's
     * WML-task sequence. Used by the diagnostic overlay's Continue button to
     * deep-link the student back to where they left off.
     *
     * GET /sophicly-wml/v1/topic-resume?board=X&text=Y&topic=N
     *
     * Response:
     *   { success: true, url: "...", task: "assessment", reason: "not_started" }
     *   { success: true, url: "...", task: "diagnostic", reason: "all_complete" }
     *   { success: false, error: "..." }
     *
     * Uses Sophicly_LearnDash_Bridge (from sophicly-student-data plugin) to map
     * (board, text, topic, task) -> LD lesson post ID, then learndash_is_lesson_complete
     * to find the first incomplete step. Topic sequence hard-coded here from
     * wml-core.js::getPhaseSubSteps.
     */
    public function get_topic_resume($request) {
        $user_id = get_current_user_id();
        $board   = sanitize_text_field($request->get_param('board'));
        $text    = sanitize_text_field($request->get_param('text'));
        $topic   = absint($request->get_param('topic'));

        if (!$board || !$text || !$topic) {
            return new WP_Error('missing_params', 'board, text, topic required', ['status' => 400]);
        }

        if (!class_exists('Sophicly_LearnDash_Bridge') || !function_exists('learndash_is_lesson_complete')) {
            return new WP_Error('bridge_unavailable', 'LearnDash bridge not available', ['status' => 503]);
        }

        $bridge = Sophicly_LearnDash_Bridge::init();

        // v7.15.74: Root-fix the shared-topic board-switch bug. Sophicly shares
        // sfwd-topic post IDs across multiple courses (e.g. one Language P1
        // topic appears in BOTH the AQA course AND the EDUQAS course). Two LD
        // behaviours combine to redirect students out of their current course:
        //
        //   1. get_permalink($topic_id) returns the canonical course-scoped URL
        //      for the topic — whichever course LD registered it under first.
        //      For a shared AQA/EDUQAS topic originally created in the EDUQAS
        //      course, this returns the EDUQAS permalink regardless of which
        //      course the student actually clicked from.
        //
        //   2. learndash_get_course_id($topic_id) similarly returns the
        //      canonical course, not the student's current one, so completion
        //      lookups are scoped to the wrong course and trigger redirects.
        //
        // Fix: resolve the target course from (board, text) via the Sophicly
        // course_map, then use learndash_get_step_permalink($topic_id, $course_id)
        // to build a URL that respects the student's actual course context.
        $course_map = function_exists('sophicly_get_course_map') ? sophicly_get_course_map() : [];
        $target_course_id = isset($course_map[$text][$board]) ? (int) $course_map[$text][$board] : 0;

        $sequence = [
            'diagnostic',
            'assessment',
            'feedback_discussion',
            'mark_scheme',
            'model_answer_video',
            'planning',
            'outlining',
            'polishing',
            'redraft_assessment',
        ];

        $first_lesson_id = null;
        $first_lesson_task = null;

        foreach ($sequence as $task) {
            $lesson_id = $bridge->find_ld_topic($board, $text, $topic, $task);
            if (!$lesson_id) continue;

            if ($first_lesson_id === null) {
                $first_lesson_id = $lesson_id;
                $first_lesson_task = $task;
            }

            // Use resolved target_course_id (from course_map) if we have it —
            // the canonical learndash_get_course_id may point at a sibling course.
            $course_id = $target_course_id
                ?: (function_exists('learndash_get_course_id') ? learndash_get_course_id($lesson_id) : 0);
            $complete = learndash_is_lesson_complete($user_id, $lesson_id, $course_id);

            if (!$complete) {
                return rest_ensure_response([
                    'success'   => true,
                    'url'       => $this->swml_step_permalink($lesson_id, $course_id),
                    'task'      => $task,
                    'reason'    => 'not_started',
                    'course_id' => $course_id,
                ]);
            }
        }

        if ($first_lesson_id) {
            $course_id = $target_course_id
                ?: (function_exists('learndash_get_course_id') ? learndash_get_course_id($first_lesson_id) : 0);
            return rest_ensure_response([
                'success'   => true,
                'url'       => $this->swml_step_permalink($first_lesson_id, $course_id),
                'task'      => $first_lesson_task,
                'reason'    => 'all_complete',
                'course_id' => $course_id,
            ]);
        }

        return new WP_Error('no_lessons', 'No lessons mapped for this topic', ['status' => 404]);
    }

    /**
     * v7.15.74: Build a course-scoped permalink for a shared LD topic.
     * Prefer LearnDash's native helper; fall back to canonical permalink with
     * ?course_id= query arg so LD can still resolve context client-side.
     */
    private function swml_step_permalink($step_id, $course_id) {
        if (!$step_id) return '';
        if ($course_id && function_exists('learndash_get_step_permalink')) {
            $url = learndash_get_step_permalink($step_id, $course_id);
            if ($url) return $url;
        }
        $base = get_permalink($step_id) ?: '';
        if (!$base) return '';
        return $course_id ? add_query_arg('course_id', $course_id, $base) : $base;
    }

    // ═══════════════════════════════════════════
    //  FOUNDATIONAL QUIZ (v7.15.93)
    // ═══════════════════════════════════════════

    /**
     * POST /foundational-quiz/result
     * Saves a completed foundational quiz result to user_meta.
     * Keyed by {board}_{text_slug}. Stores best + last + attempts.
     */
    public function save_foundational_quiz_result($request) {
        $uid = get_current_user_id();
        if (!$uid) return new WP_Error('unauthorised', 'Not logged in', ['status' => 401]);

        $params = $request->get_json_params();
        $board  = sanitize_key($params['board'] ?? '');
        $text   = sanitize_key($params['text']  ?? '');
        $score  = (int) ($params['score'] ?? 0);
        $max    = (int) ($params['max']   ?? 5);
        $grade  = sanitize_text_field($params['grade'] ?? '');
        $cats   = sanitize_text_field($params['categories'] ?? '');

        if (!$board || !$text || $max <= 0) {
            return new WP_Error('bad_request', 'board, text, and max are required', ['status' => 400]);
        }

        $percentage = (int) round(($score / $max) * 100);
        $now = current_time('mysql');
        $key = $board . '_' . $text;

        $raw  = get_user_meta($uid, 'swml_foundational_quiz_results', true);
        $all  = is_string($raw) ? (json_decode($raw, true) ?: []) : (is_array($raw) ? $raw : []);
        $prev = $all[$key] ?? [];

        $attempts     = (int) ($prev['attempts'] ?? 0) + 1;
        $prev_best    = (int) ($prev['best_score'] ?? 0);
        $is_new_best  = $score > $prev_best;

        $all[$key] = [
            'best_score'       => $is_new_best ? $score : $prev_best,
            'best_score_max'   => $max,
            'best_percentage'  => $is_new_best ? $percentage : (int) ($prev['best_percentage'] ?? 0),
            'best_grade'       => $is_new_best ? $grade : ($prev['best_grade'] ?? ''),
            'attempts'         => $attempts,
            'last_attempt_at'  => $now,
            'last_score'       => $score,
            'last_percentage'  => $percentage,
            'last_grade'       => $grade,
            'last_categories'  => $cats,
        ];

        update_user_meta($uid, 'swml_foundational_quiz_results', wp_slash(wp_json_encode($all)));

        do_action('sophicly_foundational_quiz_complete', $uid, $board, $text, $all[$key]);

        return rest_ensure_response(['success' => true, 'result' => $all[$key]]);
    }

    /**
     * GET /foundational-quiz/result?board=aqa&text=macbeth
     * Returns the saved result for a given board+text for the current user.
     * No params → returns all results keyed by {board}_{text}.
     */
    public function load_foundational_quiz_result($request) {
        $uid = get_current_user_id();
        if (!$uid) return new WP_Error('unauthorised', 'Not logged in', ['status' => 401]);

        $raw = get_user_meta($uid, 'swml_foundational_quiz_results', true);
        $all = is_string($raw) ? (json_decode($raw, true) ?: []) : (is_array($raw) ? $raw : []);

        $board = sanitize_key($request->get_param('board') ?? '');
        $text  = sanitize_key($request->get_param('text')  ?? '');

        if ($board && $text) {
            $key = $board . '_' . $text;
            return rest_ensure_response(['result' => $all[$key] ?? null]);
        }

        return rest_ensure_response(['results' => $all]);
    }
}

