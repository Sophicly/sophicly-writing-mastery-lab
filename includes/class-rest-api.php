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

        // Diagnostic endpoint — lists all canvas meta keys for current user
        register_rest_route($namespace, '/canvas/debug', [
            'methods' => 'GET', 'callback' => [$this, 'debug_canvas_keys'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        // Tutor sign-off — role-restricted
        register_rest_route($namespace, '/canvas/signoff', [
            'methods' => 'POST', 'callback' => [$this, 'tutor_signoff'],
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
        $att_role = get_user_meta(get_current_user_id(), 'sophicly_att_role', true);
        return in_array($att_role, ['tutor', 'specialist'], true);
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
        ob_start();

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

        // Signal to Protocol Router
        global $swml_active_bot_id;
        $swml_active_bot_id = $bot_id;
        global $swml_chat_history;
        $swml_chat_history = $history;
        global $swml_plan_state, $swml_current_step, $swml_current_subject;
        $swml_plan_state = $params['planState'] ?? [];
        $swml_current_step = absint($params['step'] ?? 1);

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
    //  CANVAS DOCUMENT SAVE / LOAD
    // ═══════════════════════════════════════════

    /**
     * Save canvas document content to user_meta.
     * Key: swml_canvas_{board}_{text}[_{topic_number}]
     * Value: JSON { html, wordCount, comments, savedAt }
     */
    public function save_canvas($request) {
        $user_id = get_current_user_id();
        $params = $request->get_json_params();

        $board = sanitize_text_field($params['board'] ?? '');
        $text  = sanitize_text_field($params['text'] ?? '');
        $html  = $params['html'] ?? '';
        $word_count = absint($params['wordCount'] ?? 0);
        $comments = $params['comments'] ?? null;
        $topic_number = isset($params['topicNumber']) ? absint($params['topicNumber']) : null;

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        // Build meta key — includes topic number for multi-document support
        $meta_key = 'swml_canvas_' . $board . '_' . $text;
        if ($topic_number !== null && $topic_number > 0) {
            $meta_key .= '_t' . $topic_number;
        }

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

        // wp_slash prevents WordPress's internal wp_unslash from stripping backslashes in JSON
        $result = update_user_meta($user_id, $meta_key, wp_slash(wp_json_encode($doc)));

        // Also fire a hook so the student data plugin can pick this up
        do_action('sophicly_canvas_saved', $user_id, $board, $text, $html, $word_count, $topic_number);

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
        ]);
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

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        $meta_key = 'swml_canvas_' . $board . '_' . $text;
        if ($topic_number !== null && $topic_number > 0) {
            $meta_key .= '_t' . $topic_number;
        }

        $raw = get_user_meta($user_id, $meta_key, true);
        if (empty($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => null]);
        }

        // WordPress may return an array (if it serialized/unserialized internally)
        if (is_array($raw)) {
            return rest_ensure_response(['success' => true, 'doc' => $raw]);
        }

        $doc = self::decode_canvas_json($raw);
        return rest_ensure_response([
            'success' => true,
            'doc'     => $doc,
        ]);
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
        $student_id   = absint($params['studentId'] ?? get_current_user_id());

        // Security: verify tutor is authorized for this student (v7.12.37)
        if ($student_id !== $tutor_id && !current_user_can('manage_options')) {
            $authorized = false;
            if (function_exists('learndash_get_users_group_ids')) {
                $tutor_groups   = learndash_get_users_group_ids($tutor_id);
                $student_groups = learndash_get_users_group_ids($student_id);
                $authorized     = !empty(array_intersect($tutor_groups, $student_groups));
            }
            if (!$authorized) {
                return new WP_Error('unauthorized_student', 'You are not authorized to sign off for this student.', ['status' => 403]);
            }
        }

        if (empty($board) || empty($text)) {
            return new WP_Error('missing_data', 'Missing board or text', ['status' => 400]);
        }

        $meta_key    = 'swml_canvas_' . $board . '_' . $text;
        if ($topic_number !== null && $topic_number > 0) {
            $meta_key .= '_t' . $topic_number;
        }
        $signoff_key = $meta_key . '_signoff';

        $signoff_data = [
            'tutor_id'     => $tutor_id,
            'display_name' => $tutor->display_name,
            'avatar_url'   => get_avatar_url($tutor_id, ['size' => 64]),
            'timestamp'    => current_time('c'),
            'revoked'      => false,
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
        $user_id      = get_current_user_id();
        $board        = sanitize_text_field($request->get_param('board') ?? '');
        $text         = sanitize_text_field($request->get_param('text') ?? '');
        $topic_number = $request->get_param('topicNumber');
        $topic_number = ($topic_number !== null && $topic_number !== '') ? absint($topic_number) : null;

        if (empty($board) || empty($text)) {
            return rest_ensure_response(['success' => false, 'message' => 'Missing board or text']);
        }

        $meta_key = 'swml_canvas_' . $board . '_' . $text;
        if ($topic_number !== null && $topic_number > 0) {
            $meta_key .= '_t' . $topic_number;
        }
        $signoff_key = $meta_key . '_signoff';

        $raw = get_user_meta($user_id, $signoff_key, true);
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

        if (!$board || !$text || !$topic) {
            return new WP_Error('missing_params', 'board, text, and topic_number are required', ['status' => 400]);
        }
        if (!in_array($phase, ['initial', 'redraft'], true)) {
            return new WP_Error('invalid_phase', 'phase must be initial or redraft', ['status' => 400]);
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
            'completed_at' => current_time('mysql'),
        ];

        $meta_key = sprintf('swml_phase_%s_%s_t%d_%s', $board, $text, $topic, $phase);
        $json     = wp_json_encode($data);
        $result   = update_user_meta($user_id, $meta_key, wp_slash($json));

        // Verify round-trip (rule #9)
        $verify = get_user_meta($user_id, $meta_key, true);
        $decoded = json_decode($verify, true);
        if (!$decoded || empty($decoded['status'])) {
            return new WP_Error('storage_error', 'Phase completion saved but round-trip verification failed', ['status' => 500]);
        }

        // Fire action for external integrations (student-data plugin, LearnDash bridge)
        do_action('swml_phase_complete', $user_id, $board, $text, $topic, $phase, $data);

        // Rebuild learning profile after each completion
        $profile = self::rebuild_learning_profile($user_id);

        return rest_ensure_response([
            'success'  => true,
            'meta_key' => $meta_key,
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

        if (!$board || !$text || !$topic) {
            return new WP_Error('missing_params', 'board, text, and topic are required', ['status' => 400]);
        }

        $initial_key = sprintf('swml_phase_%s_%s_t%d_initial', $board, $text, $topic);
        $redraft_key = sprintf('swml_phase_%s_%s_t%d_redraft', $board, $text, $topic);

        $initial_raw = get_user_meta($user_id, $initial_key, true);
        $redraft_raw = get_user_meta($user_id, $redraft_key, true);

        $initial = $initial_raw ? json_decode($initial_raw, true) : null;
        $redraft = $redraft_raw ? json_decode($redraft_raw, true) : null;

        return rest_ensure_response([
            'initial' => $initial,
            'redraft' => $redraft,
        ]);
    }

    // ═══════════════════════════════════════════
    //  CANVAS CHAT PERSISTENCE
    // ═══════════════════════════════════════════

    private function chat_meta_key($board, $text, $topic) {
        $key = 'swml_chat_' . $board . '_' . $text;
        if ($topic > 0) $key .= '_t' . $topic;
        return $key;
    }

    public function save_canvas_chat($request) {
        $user_id = get_current_user_id();
        $params  = $request->get_json_params();

        $board   = sanitize_text_field($params['board'] ?? '');
        $text    = sanitize_text_field($params['text'] ?? '');
        $topic   = absint($params['topicNumber'] ?? 0);
        $history = $params['history'] ?? [];
        $chat_id = sanitize_text_field($params['chatId'] ?? '');

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic);
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

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic);
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

        $board = sanitize_text_field($params['board'] ?? '');
        $text  = sanitize_text_field($params['text'] ?? '');
        $topic = absint($params['topicNumber'] ?? 0);

        if (!$board || !$text) {
            return new WP_Error('missing_params', 'board and text are required', ['status' => 400]);
        }

        $meta_key = $this->chat_meta_key($board, $text, $topic);
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
}

