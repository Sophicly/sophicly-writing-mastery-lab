<?php
/**
 * SWML Function Handlers
 *
 * Registers WML AI Engine functions via two-filter Path C wiring:
 *   - mwai_ai_query (priority 11)    attach functions to WML chatbot queries
 *   - mwai_ai_feedback (priority 9)  execute handler when LLM calls one
 *
 * AI Engine Pro's premium/function-aware.php only executes type='code-engine'
 * (DB-stored snippets) and gates per-bot via Code Engine UI. Our functions
 * are type='manual' so we own dispatch via the mwai_ai_feedback filter, and
 * attach per-query via mwai_ai_query so no bot-config DB entry is required.
 *
 * History:
 *   - pre v7.17.80: hooked non-existent 'mwai_ai_functions' filter; dead code.
 *   - v7.17.80: migrated to Path C (mwai_ai_query + mwai_ai_feedback).
 */

if (!defined('ABSPATH')) exit;

class SWML_Function_Handlers {

    private static $instance = null;

    private $function_handlers = [
        'save_session_element'    => 'handle_save_session_element',
        'save_plan_element'       => 'handle_save_session_element',
        'update_progress'         => 'handle_update_progress',
        'fetch_student_reminders' => 'handle_fetch_reminders',
        'record_quiz_score'       => 'handle_record_quiz_score',
    ];

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_filter('mwai_ai_query',    [$this, 'attach_functions'], 11, 2);
        add_filter('mwai_ai_feedback', [$this, 'execute_function'],  9, 3);
    }

    /**
     * Attach WML functions to query when bot is a WML bot.
     * Predicate mirrors class-protocol-router.php:506-518.
     */
    public function attach_functions($query, $params = null) {
        if (!class_exists('Meow_MWAI_Query_Function'))  return $query;
        if (!class_exists('Meow_MWAI_Query_Parameter')) return $query;

        $bot_id = $query->botId ?? '';
        $is_wml = ($bot_id === 'wml' || strpos($bot_id, 'wml-') === 0);
        if (!$is_wml) {
            global $swml_active_bot_id;
            if (!empty($swml_active_bot_id) && ($swml_active_bot_id === 'wml' || strpos($swml_active_bot_id, 'wml-') === 0)) {
                $is_wml = true;
            }
        }
        if (!$is_wml) return $query;

        foreach ($this->build_functions() as $func) {
            $query->add_function($func);
        }
        return $query;
    }

    /**
     * Dispatch when LLM calls one of our functions.
     * mwai_ai_feedback returns last non-null. Pass through if name not ours.
     */
    public function execute_function($value, $needFeedback, $reply) {
        if ($value !== null) return $value;
        $name = $needFeedback['name'] ?? '';
        if (!isset($this->function_handlers[$name])) return $value;
        $method = $this->function_handlers[$name];
        $args = $needFeedback['arguments'] ?? [];
        if (!is_array($args)) $args = [];
        return $this->$method($args);
    }

    /**
     * Build the 5 Meow_MWAI_Query_Function objects.
     */
    private function build_functions() {
        $out = [];

        // save_session_element (primary)
        $out[] = new Meow_MWAI_Query_Function(
            'save_session_element',
            'IMPORTANT: Call this function every time an element is confirmed — whether it\'s a plan element, assessment score, conceptual note, model answer section, or any other output. This saves the element to the student\'s live panel. Calling with the same element_type will OVERWRITE the previous value. Call SILENTLY — never narrate the function call.',
            [
                new Meow_MWAI_Query_Parameter('element_type', 'The type of element being saved. Use the task-specific prefix: planning = question_text/goal/keywords/anchor_quote_start/mid/end/body_para_1/2/3/introduction/conclusion. Assessment = question_text/total_score/grade/strength_1/target_1/target_2 (per-AO slots ao1_score/ao2_score/ao3_score/ao4_score are DEPRECATED as of v7.15.113 — do not use them). Polishing = current_level/target_level/polish_focus/revision_1/2/3. Conceptual Notes = cn_section_1 through cn_section_7. Quote Analysis = qa_quote/qa_student_plan/qa_student_paragraph/qa_ai_plan/qa_ai_paragraph. Model Answer = ma_question/ma_plan/ma_body_1/2/3/ma_introduction/ma_conclusion. Exam Question = eq_theme/eq_output.', 'string', true),
                new Meow_MWAI_Query_Parameter('content', 'The confirmed content (e.g. the quote text, score like "12/20", section summary, model paragraph, etc.)', 'string', true),
                new Meow_MWAI_Query_Parameter('step_number', 'Current protocol step or section number', 'integer', true),
            ],
            'manual', 'wml-save-session-element', 'server'
        );

        // save_plan_element (backward-compat alias)
        $out[] = new Meow_MWAI_Query_Function(
            'save_plan_element',
            'Save a plan/assessment/polishing element. Alias for save_session_element — prefer save_session_element for new protocols.',
            [
                new Meow_MWAI_Query_Parameter('element_type', 'The type of element being saved', 'string', true),
                new Meow_MWAI_Query_Parameter('content', 'The confirmed content', 'string', true),
                new Meow_MWAI_Query_Parameter('step_number', 'Current protocol section number', 'integer', true),
            ],
            'manual', 'wml-save-plan-element', 'server'
        );

        // update_progress
        $out[] = new Meow_MWAI_Query_Function(
            'update_progress',
            'Update the student\'s progress when they move to a new step in the protocol. Call this when a step is completed and the conversation transitions to the next step.',
            [
                new Meow_MWAI_Query_Parameter('step', 'The step number being transitioned to (1-8)', 'integer', true),
                new Meow_MWAI_Query_Parameter('status', 'Status of the step. Send "active" or "complete" only.', 'string', true),
            ],
            'manual', 'wml-update-progress', 'server'
        );

        // fetch_student_reminders
        $out[] = new Meow_MWAI_Query_Function(
            'fetch_student_reminders',
            'Fetch the student\'s historical data including previous scores, weak areas, streak count, and tutor reminders. Call this at the start of a session to personalise the experience.',
            [
                new Meow_MWAI_Query_Parameter('text', 'The text being studied (e.g. "macbeth")', 'string', true),
            ],
            'manual', 'wml-fetch-student-reminders', 'server'
        );

        // record_quiz_score (v7.17.79 added; wired in v7.17.80)
        $out[] = new Meow_MWAI_Query_Function(
            'record_quiz_score',
            'Mark Scheme Quiz ONLY. Call SILENTLY at end of Phase 3 (dashboard) with the final computed score. Triggers immediate write to session_records via the canvas-saved hook. NEVER narrate this call. NEVER mention saving. The student should see only the dashboard.',
            [
                new Meow_MWAI_Query_Parameter('score', 'Number of questions answered correctly (0-10).', 'integer', true),
                new Meow_MWAI_Query_Parameter('total', 'Total questions in the quiz (typically 10).', 'integer', true),
                new Meow_MWAI_Query_Parameter('percentage', 'Score as percentage 0-100. If omitted, computed from score/total.', 'integer', false),
                new Meow_MWAI_Query_Parameter('grade', 'GCSE grade equivalent 1-9 derived from the rubric in the protocol.', 'integer', true),
            ],
            'manual', 'wml-record-quiz-score', 'server'
        );

        return $out;
    }

    /**
     * Handle save_session_element / save_plan_element function call.
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
     * Handle update_progress function call.
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
     * Handle fetch_student_reminders function call.
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

    /**
     * Handle record_quiz_score function call (v7.17.79 / wired v7.17.80).
     * Fires sophicly_canvas_saved with quiz_extra populated so student-data v2.29.6+
     * listener writes to session_records.grade / total_score.
     */
    public function handle_record_quiz_score($args) {
        $user_id    = get_current_user_id();
        $score      = isset($args['score'])      ? absint($args['score'])      : null;
        $total      = isset($args['total'])      ? absint($args['total'])      : null;
        $percentage = isset($args['percentage']) ? absint($args['percentage']) : null;
        $grade      = isset($args['grade'])      ? absint($args['grade'])      : null;

        if (!$user_id || $score === null || $total === null || $grade === null) {
            return json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
        }

        $session = SWML_Session_Manager::get_active_session($user_id);
        if (!$session) {
            return json_encode(['status' => 'error', 'message' => 'No active session']);
        }
        $task = $session['context']['task'] ?? '';
        if ($task !== 'mark_scheme_unit') {
            return json_encode(['status' => 'error', 'message' => 'record_quiz_score only valid for mark_scheme_unit']);
        }

        $score = max(0, min($score, $total));
        if ($percentage === null && $total > 0) {
            $percentage = (int) round(($score / $total) * 100);
        }
        $percentage = max(0, min(100, (int) $percentage));
        $grade      = max(1, min(9, $grade));

        $board  = $session['context']['board']        ?? '';
        $text   = $session['context']['text']         ?? '';
        $topic  = $session['context']['topic_number'] ?? 0;
        $suffix = '_msu';

        $quiz_extra = [
            'score_raw'        => $score,
            'score_max'        => $total,
            'score_percentage' => $percentage,
            'grade_equivalent' => $grade,
            'task_kind'        => 'mark_scheme_quiz',
        ];

        do_action('sophicly_canvas_saved', $user_id, $board, $text, '', 0, $topic, $suffix, $quiz_extra);

        error_log("[WML record_quiz_score] uid={$user_id} score={$score}/{$total} pct={$percentage} grade={$grade} board={$board} text={$text}");

        return json_encode([
            'status'     => 'recorded',
            'score'      => "{$score}/{$total}",
            'percentage' => $percentage,
            'grade'      => $grade,
        ]);
    }
}
