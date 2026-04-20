<?php
/**
 * SWML Function Handlers
 * 
 * Registers functions with AI Engine's Code Engine addon.
 * These are PHP functions the AI can call during conversation
 * to trigger real-time updates in the frontend.
 * 
 * IMPORTANT: Requires the AI Engine Code Engine addon (free).
 * Install from: Meow Apps → AI Engine → Code Engine
 * 
 * The AI calls these via function/tool calling. The response
 * is returned to the AI and also triggers frontend updates
 * via the streaming response.
 */

if (!defined('ABSPATH')) exit;

class SWML_Function_Handlers {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Register functions with AI Engine's Code Engine
        add_filter('mwai_ai_functions', [$this, 'register_functions']);
    }

    /**
     * Register all WML functions with Code Engine
     */
    public function register_functions($functions) {

        // ── save_session_element (primary) ──
        // Replaces save_plan_element — works for ALL task types
        $functions[] = [
            'name'        => 'save_session_element',
            'description' => 'IMPORTANT: Call this function every time an element is confirmed — whether it\'s a plan element, assessment score, conceptual note, model answer section, or any other output. This saves the element to the student\'s live panel. Calling with the same element_type will OVERWRITE the previous value. Call SILENTLY — never narrate the function call.',
            'parameters'  => [
                'type'       => 'object',
                'properties' => [
                    'element_type' => [
                        'type'        => 'string',
                        'description' => 'The type of element being saved. Use the task-specific prefix: planning = question_text/goal/keywords/anchor_quote_start/mid/end/body_para_1/2/3/introduction/conclusion. Assessment = question_text/total_score/grade/strength_1/target_1/target_2 (per-AO slots ao1_score/ao2_score/ao3_score/ao4_score are DEPRECATED as of v7.15.113 — do not use them). Polishing = current_level/target_level/polish_focus/revision_1/2/3. Conceptual Notes = cn_section_1 through cn_section_7. Quote Analysis = qa_quote/qa_student_plan/qa_student_paragraph/qa_ai_plan/qa_ai_paragraph. Model Answer = ma_question/ma_plan/ma_body_1/2/3/ma_introduction/ma_conclusion. Exam Question = eq_theme/eq_output.',
                    ],
                    'content' => [
                        'type'        => 'string',
                        'description' => 'The confirmed content (e.g. the quote text, score like "12/20", section summary, model paragraph, etc.)',
                    ],
                    'step_number' => [
                        'type'        => 'integer',
                        'description' => 'Current protocol step or section number',
                    ],
                ],
                'required' => ['element_type', 'content', 'step_number'],
            ],
            'callback' => [$this, 'handle_save_session_element'],
        ];

        // ── save_plan_element (backward compatibility alias) ──
        // Kept so existing protocols and chatbot instructions still work
        $functions[] = [
            'name'        => 'save_plan_element',
            'description' => 'Save a plan/assessment/polishing element. Alias for save_session_element — prefer save_session_element for new protocols.',
            'parameters'  => [
                'type'       => 'object',
                'properties' => [
                    'element_type' => [
                        'type'        => 'string',
                        'description' => 'The type of element being saved',
                    ],
                    'content' => [
                        'type'        => 'string',
                        'description' => 'The confirmed content',
                    ],
                    'step_number' => [
                        'type'        => 'integer',
                        'description' => 'Current protocol section number',
                    ],
                ],
                'required' => ['element_type', 'content', 'step_number'],
            ],
            'callback' => [$this, 'handle_save_session_element'],
        ];

        // ── update_progress ──
        $functions[] = [
            'name'        => 'update_progress',
            'description' => 'Update the student\'s progress when they move to a new step in the protocol. Call this when a step is completed and the conversation transitions to the next step.',
            'parameters'  => [
                'type'       => 'object',
                'properties' => [
                    'step' => [
                        'type'        => 'integer',
                        'description' => 'The step number being transitioned to (1-8)',
                    ],
                    'status' => [
                        'type'        => 'string',
                        'description' => 'Status of the step',
                        'enum'        => ['active', 'complete'],
                    ],
                ],
                'required' => ['step', 'status'],
            ],
            'callback' => [$this, 'handle_update_progress'],
        ];

        // ── fetch_student_reminders ──
        $functions[] = [
            'name'        => 'fetch_student_reminders',
            'description' => 'Fetch the student\'s historical data including previous scores, weak areas, streak count, and tutor reminders. Call this at the start of a session to personalise the experience.',
            'parameters'  => [
                'type'       => 'object',
                'properties' => [
                    'text' => [
                        'type'        => 'string',
                        'description' => 'The text being studied (e.g. "macbeth")',
                    ],
                ],
                'required' => ['text'],
            ],
            'callback' => [$this, 'handle_fetch_reminders'],
        ];

        return $functions;
    }

    /**
     * Handle save_session_element / save_plan_element function call
     * Both function names route here.
     */
    public function handle_save_session_element($args) {
        $user_id      = get_current_user_id();
        $element_type = sanitize_text_field($args['element_type'] ?? '');
        $content      = sanitize_text_field($args['content'] ?? '');
        $step         = absint($args['step_number'] ?? 0);

        if (!$user_id || !$element_type || !$content) {
            return json_encode([
                'status' => 'error',
                'message' => 'Missing required parameters',
            ]);
        }

        $session = SWML_Session_Manager::get_active_session($user_id);
        $session_id = $session['session_id'] ?? '';
        $task = $session['context']['task'] ?? 'planning';

        $plan = SWML_Session_Manager::save_session_element(
            $user_id, $session_id, $element_type, $content, $step, $task
        );

        // Count completed elements
        $completed = count(array_filter($plan, function($el) {
            return !empty($el['content']);
        }));

        return json_encode([
            'status'             => 'saved',
            'element_saved'      => $element_type,
            'task'               => $task,
            'completed_elements' => $completed,
            'message'            => "Element '{$element_type}' saved successfully. The student can see it in their panel.",
        ]);
    }

    /**
     * Handle update_progress function call
     */
    public function handle_update_progress($args) {
        $user_id = get_current_user_id();
        $step    = absint($args['step'] ?? 1);
        $status  = sanitize_text_field($args['status'] ?? 'active');

        if (!$user_id) {
            return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        }

        $session = SWML_Session_Manager::get_active_session($user_id);
        if ($session) {
            $session['context']['step'] = $step;
            SWML_Session_Manager::save_session($user_id, $session['session_id'], $session['context']);
        }

        return json_encode([
            'status'  => 'updated',
            'step'    => $step,
            'message' => "Progress updated to step {$step} ({$status}). The student's sidebar will reflect this change.",
        ]);
    }

    /**
     * Handle fetch_student_reminders function call
     */
    public function handle_fetch_reminders($args) {
        $user_id = get_current_user_id();
        $text    = sanitize_text_field($args['text'] ?? '');

        if (!$user_id) {
            return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        }

        $data = SWML_Session_Manager::get_student_reminders($user_id, $text);

        return json_encode([
            'status' => 'ok',
            'data'   => $data,
        ]);
    }
}
