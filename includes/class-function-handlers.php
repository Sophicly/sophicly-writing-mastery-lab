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
        // v7.18.4 REMOVED 'fetch_student_reminders' from registration.
        // Cause: AI Engine discards function-handler return values, so the LLM
        // never received the reminder data. Claude saw the function declared,
        // called it, got no readable result, called it again trying to retrieve
        // the data → loop → after 4 iterations AI Engine declared "function
        // call loop detected" → falls back to GPT-5. This was the PRIMARY
        // cause of model-switching mid-conversation (visible in console as
        // "simpleChatbotQuery model: Claude" alternating with "model: GPT")
        // and the downstream phase-confusion / count-drift bugs we've been
        // chasing as symptoms. Function was dead code — kept the handler
        // method below for any external callers but unregistered from the
        // LLM-facing function list.
        'record_quiz_score'       => 'handle_record_quiz_score',
        // v7.18.0 unified quiz engine
        'quiz_start'              => 'handle_quiz_start',
        'quiz_record_question'    => 'handle_quiz_record_question',
        'quiz_finalize'           => 'handle_quiz_finalize',
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

        // v7.18.4: fetch_student_reminders REMOVED from function registration.
        // Function was dead — AI Engine discards function-handler return values,
        // so the LLM never received the reminder data. Claude looped trying to
        // get it (4 iterations → "function call loop detected" → fallback to
        // GPT-5 → mid-conversation model switching → phase confusion). Removed
        // to fix the underlying loop. If reminders are needed in future,
        // inject them as a STATIC preamble block (not a function call).

        // record_quiz_score (v7.17.79 added; wired in v7.17.80; DEPRECATED v7.18.0)
        // Kept as backward-compat shim for one release cycle. Internally routes
        // to the new quiz engine. Removed in v7.19.0.
        $out[] = new Meow_MWAI_Query_Function(
            'record_quiz_score',
            'DEPRECATED — use quiz_finalize instead. Mark Scheme Quiz ONLY. Call SILENTLY at end of Phase 3 (dashboard). Backward-compat shim only; new protocols MUST use quiz_finalize.',
            [
                new Meow_MWAI_Query_Parameter('score', 'Number of questions answered correctly (0-10).', 'integer', true),
                new Meow_MWAI_Query_Parameter('total', 'Total questions in the quiz (typically 10).', 'integer', true),
                new Meow_MWAI_Query_Parameter('percentage', 'Score as percentage 0-100. If omitted, computed from score/total.', 'integer', false),
                new Meow_MWAI_Query_Parameter('grade', 'GCSE grade equivalent 1-9 derived from the rubric in the protocol.', 'integer', true),
            ],
            'manual', 'wml-record-quiz-score', 'server'
        );

        // ─── v7.18.0 unified quiz engine functions ───

        // quiz_start
        $out[] = new Meow_MWAI_Query_Function(
            'quiz_start',
            'Call ONCE at the start of every quiz, immediately after the student confirms their exam board (or board is pre-known). Initialises the server-side accumulator that tracks score, per-question record, and category gaps for THIS attempt. Call SILENTLY — never narrate. Subsequent turns will receive a QUIZ STATE block in the system prompt; use those numbers for ALL running-score and final-score displays. NEVER compute score yourself.',
            [
                new Meow_MWAI_Query_Parameter('quiz_type', 'One of: mark_scheme | foundational. Marks Scheme protocols pass mark_scheme; Foundational Quiz passes foundational.', 'string', true),
                new Meow_MWAI_Query_Parameter('total_questions', 'Number of questions in this quiz (typically 5).', 'integer', true),
                new Meow_MWAI_Query_Parameter('board', 'Exam board slug (aqa, edexcel, eduqas, ocr, sqa, ccea, edexcel-igcse, cambridge, etc).', 'string', true),
                new Meow_MWAI_Query_Parameter('text', 'Text or paper identifier (e.g. macbeth, aqa_lang_paper_1, duchess_of_malfi).', 'string', true),
                new Meow_MWAI_Query_Parameter('attempt_number', 'Attempt number for this student+text combo (1 for first attempt; increment for retries within same session).', 'integer', false),
            ],
            'manual', 'wml-quiz-start', 'server'
        );

        // quiz_record_question
        $out[] = new Meow_MWAI_Query_Function(
            'quiz_record_question',
            'Call IMMEDIATELY AFTER you emit feedback for each question (✓/⚠️/✗). Records the student\'s result on the server. The server will return a fresh QUIZ STATE block on your NEXT turn — use those numbers for the running-score line, never your own count. Call SILENTLY — never narrate. Skipping this call breaks the score persistence chain.',
            [
                new Meow_MWAI_Query_Parameter('q_num', 'Question number (1-N where N is total_questions).', 'integer', true),
                new Meow_MWAI_Query_Parameter('marks_awarded', 'Marks the student earned on this question (e.g. 0, 1, 2). Half-marks supported for partial credit.', 'number', true),
                new Meow_MWAI_Query_Parameter('max_marks', 'Maximum marks for this question (typically 2 for mark_scheme, 1 for foundational).', 'number', true),
                new Meow_MWAI_Query_Parameter('category', 'Question category for gap analysis. Examples: "AO1 Retrieval", "AO2 Language", "AO3 Context", "Themes", "Plot", "Characters". Free-form short string.', 'string', true),
                new Meow_MWAI_Query_Parameter('correct', 'Correct answer letters or text (e.g. "B", "A,B,D", "ambition").', 'string', false),
                new Meow_MWAI_Query_Parameter('student_answer', 'Student\'s submitted answer (e.g. "A", "true", "vaulting").', 'string', false),
            ],
            'manual', 'wml-quiz-record-question', 'server'
        );

        // quiz_finalize
        $out[] = new Meow_MWAI_Query_Function(
            'quiz_finalize',
            'Call ONCE at end of Phase 3 dashboard, AFTER recording every question. Server reads the accumulator, computes deterministic final score, persists per quiz_type (mark_scheme → session_records via sophicly_canvas_saved; foundational → user_meta + sophicly_foundational_quiz_complete hook), then clears the accumulator. Call SILENTLY — never narrate. Do NOT emit any [QUIZ_COMPLETE] text marker (deprecated).',
            [
                new Meow_MWAI_Query_Parameter('grade_equivalent', 'GCSE grade 1-9 derived from the percentage rubric in the protocol. Server clamps to [1,9].', 'integer', true),
            ],
            'manual', 'wml-quiz-finalize', 'server'
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
     * Handle record_quiz_score function call (v7.17.79+; DEPRECATED v7.18.0).
     * Backward-compat shim: routes to the unified quiz engine. If an active
     * accumulator exists, uses it (server truth). Otherwise falls back to the
     * LLM-supplied args (legacy behaviour, hallucination-prone — logged loud).
     */
    public function handle_record_quiz_score($args) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        }

        $grade = isset($args['grade']) ? absint($args['grade']) : null;
        if ($grade === null) {
            return json_encode(['status' => 'error', 'message' => 'Missing grade parameter']);
        }

        if (class_exists('SWML_Quiz_Engine')) {
            $engine = SWML_Quiz_Engine::instance();
            $accumulator = $engine->get_accumulator($user_id);
            if ($accumulator) {
                error_log("[WML record_quiz_score deprecated] uid={$user_id} routed to quiz_finalize via shim");
                $summary = $engine->finalize($user_id, $grade);
                if ($summary) {
                    return json_encode([
                        'status'     => 'recorded',
                        'score'      => "{$summary['score']}/{$summary['max']}",
                        'percentage' => $summary['percentage'],
                        'grade'      => $summary['grade'],
                    ]);
                }
            }
        }

        // Legacy fallback — LLM-supplied score (hallucination-prone). Loud log.
        $score = isset($args['score']) ? absint($args['score']) : null;
        $total = isset($args['total']) ? absint($args['total']) : null;
        $percentage = isset($args['percentage']) ? absint($args['percentage']) : null;
        if ($score === null || $total === null) {
            return json_encode(['status' => 'error', 'message' => 'Missing score/total and no active accumulator']);
        }

        error_log("[WML record_quiz_score deprecated FALLBACK] uid={$user_id} no accumulator; using LLM args score={$score}/{$total} grade={$grade} — HALLUCINATION RISK");

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
        $grade = max(1, min(9, $grade));

        $board  = $session['context']['board']        ?? '';
        $text   = $session['context']['text']         ?? '';
        $topic  = $session['context']['topic_number'] ?? 0;

        $quiz_extra = [
            'score_raw'        => $score,
            'score_max'        => $total,
            'score_percentage' => $percentage,
            'grade_equivalent' => $grade,
            'task_kind'        => 'mark_scheme_quiz',
        ];
        do_action('sophicly_canvas_saved', $user_id, $board, $text, '', 0, $topic, '_msu', $quiz_extra);

        return json_encode([
            'status'     => 'recorded',
            'score'      => "{$score}/{$total}",
            'percentage' => $percentage,
            'grade'      => $grade,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  v7.18.0 UNIFIED QUIZ ENGINE HANDLERS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Handle quiz_start function call.
     */
    public function handle_quiz_start($args) {
        $user_id = get_current_user_id();
        if (!$user_id) return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        if (!class_exists('SWML_Quiz_Engine')) {
            error_log("[WML quiz_start] SWML_Quiz_Engine not loaded — bootstrap problem");
            return json_encode(['status' => 'error', 'message' => 'Quiz engine unavailable']);
        }
        $engine = SWML_Quiz_Engine::instance();
        $accumulator = $engine->start(
            $user_id,
            sanitize_key($args['quiz_type']  ?? 'mark_scheme'),
            absint($args['total_questions'] ?? 5),
            sanitize_key($args['board']     ?? ''),
            sanitize_text_field($args['text'] ?? ''),
            absint($args['attempt_number'] ?? 1)
        );
        return json_encode([
            'status'    => 'started',
            'quiz_type' => $accumulator['quiz_type'],
            'total'     => $accumulator['total_questions'],
        ]);
    }

    /**
     * Handle quiz_record_question function call.
     */
    public function handle_quiz_record_question($args) {
        $user_id = get_current_user_id();
        if (!$user_id) return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        if (!class_exists('SWML_Quiz_Engine')) {
            return json_encode(['status' => 'error', 'message' => 'Quiz engine unavailable']);
        }
        $engine = SWML_Quiz_Engine::instance();
        $accumulator = $engine->record_question($user_id, $args);
        if (!$accumulator) {
            return json_encode(['status' => 'error', 'message' => 'No active quiz accumulator — call quiz_start first']);
        }
        return json_encode([
            'status'        => 'recorded',
            'q_num'         => (int) ($args['q_num'] ?? 0),
            'score_running' => $accumulator['score_running'],
            'max_running'   => $accumulator['max_running'],
        ]);
    }

    /**
     * Handle quiz_finalize function call.
     */
    public function handle_quiz_finalize($args) {
        $user_id = get_current_user_id();
        if (!$user_id) return json_encode(['status' => 'error', 'message' => 'Not authenticated']);
        if (!class_exists('SWML_Quiz_Engine')) {
            return json_encode(['status' => 'error', 'message' => 'Quiz engine unavailable']);
        }
        $grade = absint($args['grade_equivalent'] ?? 0);
        if (!$grade) {
            return json_encode(['status' => 'error', 'message' => 'Missing grade_equivalent']);
        }
        $engine = SWML_Quiz_Engine::instance();
        $summary = $engine->finalize($user_id, $grade);
        if (!$summary) {
            return json_encode(['status' => 'error', 'message' => 'No active quiz accumulator — call quiz_start first']);
        }
        return json_encode([
            'status'     => 'finalized',
            'score'      => "{$summary['score']}/{$summary['max']}",
            'percentage' => $summary['percentage'],
            'grade'      => $summary['grade'],
            'quiz_type'  => $summary['quiz_type'],
        ]);
    }
}
