<?php
/**
 * SWML Session Manager
 * 
 * Manages session context — the data object that tells the Protocol Router
 * what to load and the frontend what to display.
 */

if (!defined('ABSPATH')) exit;

class SWML_Session_Manager {

    /**
     * Build session context from URL params + unit metadata
     * 
     * Reads from the sophicly-student-data plugin's lesson meta when available.
     * Meta keys use _sophicly_ prefix (private meta).
     */
    public static function build_context($params) {
        $mode    = $params['mode'] ?? 'exam_prep';
        $unit_id = absint($params['unit_id'] ?? 0);

        $context = [
            'mode'            => $mode,
            'board'           => '',
            'subject'         => '',   // literature_type: shakespeare, modern_text, etc.
            'course_type'     => '',   // literature, language, creative_writing
            'text'            => '',
            'task'            => $params['task'] ?? '',
            'question'        => '',
            'marks'           => 0,
            'aos'             => [],
            'is_redraft'      => !empty($params['redraft']),
            'student_id'      => get_current_user_id(),
            'unit_id'         => $unit_id,
            'step'            => 1,
            'session_id'      => self::generate_session_id(),
            // Draft typing & topic rotation (unified handoff v2)
            'topic_number'    => absint($params['topic_number'] ?? 0),    // 1, 2, 3... (0 = standalone)
            'topic_label'     => sanitize_text_field($params['topic_label'] ?? ''),  // "Macbeth's Character"
            'draft_type'      => self::sanitize_draft_type($params['draft_type'] ?? null), // diagnostic, development, etc.
            'phase'           => in_array($params['phase'] ?? '', ['initial', 'redraft']) ? $params['phase'] : null,
            'plan_required'   => false,  // Set below based on phase + topic_number
            'plan_completed'  => false,
            // Poetry poem selection
            'poem'            => sanitize_key($params['poem'] ?? ''),
            'poem_title'      => sanitize_text_field($params['poem_title'] ?? ''),
        ];

        if ($mode === 'guided' && $unit_id) {
            // Use student-data plugin's accessor if available (resolves IDs to names)
            if (class_exists('Sophicly_Admin_Lesson_Meta')) {
                $lesson_ctx = Sophicly_Admin_Lesson_Meta::get_lesson_context($unit_id);
                $context['board']       = $lesson_ctx['exam_board'] ?? $params['board'] ?? '';
                $context['subject']     = $lesson_ctx['literature_type'] ?? $params['subject'] ?? '';
                $context['course_type'] = $lesson_ctx['course_type'] ?? $params['type'] ?? '';
                $context['is_redraft']  = ($lesson_ctx['is_redraft'] ?? '0') === '1';

                // Resolved text name from Library Plugin CPT
                if (!empty($lesson_ctx['text_name'])) {
                    $context['text_name'] = $lesson_ctx['text_name'];
                }
                // Resolved topic name
                if (!empty($lesson_ctx['topic_name'])) {
                    $context['topic_name'] = $lesson_ctx['topic_name'];
                }
            } else {
                // Fallback: read _sophicly_ meta directly
                $context['board']       = get_post_meta($unit_id, '_sophicly_exam_board', true) ?: $params['board'] ?? '';
                $context['subject']     = get_post_meta($unit_id, '_sophicly_literature_type', true) ?: $params['subject'] ?? '';
                $context['course_type'] = get_post_meta($unit_id, '_sophicly_course_type', true) ?: $params['type'] ?? '';
                $context['is_redraft']  = get_post_meta($unit_id, '_sophicly_is_redraft', true) === '1';
            }
        } else {
            // Exam prep mode — use URL params (wizard fills these in)
            $context['board']       = $params['board'] ?? '';
            $context['subject']     = $params['subject'] ?? '';
            $context['course_type'] = $params['type'] ?? 'literature';
        }

        // v7.15.91: In guided mode, the LearnDash lesson's own text metadata
        // wins. Previously the wizard param ($params['text']) clobbered it
        // unconditionally, producing session_records rows with the student's
        // last wizard selection (e.g. 'romeo-and-juliet') even when they
        // launched an exam-question from inside a Macbeth lesson.
        if ($mode === 'guided' && $unit_id && class_exists('Sophicly_Admin_Lesson_Meta')) {
            $lesson_ctx = Sophicly_Admin_Lesson_Meta::get_lesson_context($unit_id);
            if (!empty($lesson_ctx['text_id'])) {
                $text_post = get_post((int) $lesson_ctx['text_id']);
                if ($text_post && $text_post->post_type === 'sophicly_text' && !empty($text_post->post_name)) {
                    $context['text'] = sanitize_key($text_post->post_name);
                }
            }
        }
        // Fallback: standalone / exam-prep mode, or guided lessons with no
        // text_id meta — accept the wizard's selection.
        if (empty($context['text']) && !empty($params['text'])) {
            $context['text'] = sanitize_text_field($params['text']);
        }

        // Draft typing: resolve from lesson meta in guided mode, or from params in standalone
        if ($mode === 'guided' && $unit_id && class_exists('Sophicly_Admin_Lesson_Meta')) {
            $lesson_ctx = Sophicly_Admin_Lesson_Meta::get_lesson_context($unit_id);
            if (!empty($lesson_ctx['topic_number'])) $context['topic_number'] = absint($lesson_ctx['topic_number']);
            if (!empty($lesson_ctx['topic_label']))  $context['topic_label']  = sanitize_text_field($lesson_ctx['topic_label']);
            if (!empty($lesson_ctx['draft_type']))   $context['draft_type']   = self::sanitize_draft_type($lesson_ctx['draft_type']);
            if (!empty($lesson_ctx['phase']))        $context['phase']        = in_array($lesson_ctx['phase'], ['initial', 'redraft']) ? $lesson_ctx['phase'] : null;
        }

        // Set plan enforcement based on phase + topic_number
        $context['plan_required'] = self::is_plan_required($context);

        return $context;
    }

    /**
     * Save session context to user meta (for resumption)
     */
    public static function save_session($user_id, $session_id, $context) {
        update_user_meta($user_id, 'wml_active_session', [
            'session_id' => $session_id,
            'context'    => $context,
            'updated_at' => current_time('mysql'),
        ]);
    }

    /**
     * Get active session for a user
     */
    public static function get_active_session($user_id) {
        return get_user_meta($user_id, 'wml_active_session', true) ?: null;
    }

    /**
     * Save a completed plan element
     */
    /**
     * Save a session element (task-aware)
     * Stores the task type alongside the content so the data plugin
     * can distinguish what each element actually represents.
     */
    public static function save_session_element($user_id, $session_id, $element_type, $content, $step, $task = 'planning') {
        $plan = get_user_meta($user_id, 'wml_current_plan', true) ?: [];
        $plan[$element_type] = [
            'content'    => $content,
            'step'       => $step,
            'task'       => $task,
            'timestamp'  => current_time('mysql'),
        ];
        update_user_meta($user_id, 'wml_current_plan', $plan);

        // Fire hook for student data plugin to catch
        $active = get_user_meta($user_id, 'wml_active_session', true) ?: [];
        $context = $active['context'] ?? [];
        do_action('sophicly_element_saved', $user_id, $session_id, $element_type, $content, $step, $context, $task);

        return $plan;
    }

    /**
     * Backward compatibility alias
     */
    public static function save_plan_element($user_id, $session_id, $element_type, $content, $step) {
        return self::save_session_element($user_id, $session_id, $element_type, $content, $step, 'planning');
    }

    /**
     * Clear a single plan element (for student edits)
     */
    public static function clear_plan_element($user_id, $session_id, $element_type) {
        $plan = get_user_meta($user_id, 'wml_current_plan', true) ?: [];
        $old_content = $plan[$element_type]['content'] ?? null;
        unset($plan[$element_type]);
        update_user_meta($user_id, 'wml_current_plan', $plan);

        // Fire hook so student data plugin can track revisions
        do_action('sophicly_element_cleared', $user_id, $session_id, $element_type, $old_content);

        return $plan;
    }

    /**
     * Get the current plan data
     */
    public static function get_current_plan($user_id) {
        return get_user_meta($user_id, 'wml_current_plan', true) ?: [];
    }

    /**
     * Log a completed session to the sessions history
     */
    public static function log_session($user_id, $context, $outcome = []) {
        $sessions = get_user_meta($user_id, 'wml_sessions', true) ?: [];
        $plan = get_user_meta($user_id, 'wml_current_plan', true) ?: [];
        $session_entry = [
            'session_id'      => $context['session_id'],
            'date'            => current_time('mysql'),
            'board'           => $context['board'],
            'subject'         => $context['subject'],
            'text'            => $context['text'],
            'task'            => $context['task'],
            'question'        => $context['question'],
            'mode'            => $context['mode'],
            'unit_id'         => $context['unit_id'],
            'steps_completed' => $context['step'],
            'outcome'         => $outcome,
            // Draft typing (unified handoff v2)
            'topic_number'    => $context['topic_number'] ?? 0,
            'topic_label'     => $context['topic_label'] ?? '',
            'draft_type'      => $context['draft_type'] ?? null,
            'phase'           => $context['phase'] ?? null,
            'plan_required'   => $context['plan_required'] ?? false,
            'plan_completed'  => !empty($plan['body_para_1']),  // At least one body para planned
        ];
        $sessions[] = $session_entry;
        update_user_meta($user_id, 'wml_sessions', $sessions);

        // Fire hook for student data plugin — includes full plan snapshot
        do_action('sophicly_session_completed', $user_id, $context['session_id'], $context, $plan, $outcome);
    }

    /**
     * Get student data for AI personalisation
     */
    public static function get_student_reminders($user_id, $text = '') {
        $data = [
            'previous_scores' => [],
            'weak_aos'        => [],
            'streak'          => 0,
            'total_sessions'  => 0,
            'last_feedback'   => '',
            'reminders'       => [],
        ];

        // Session count
        $sessions = get_user_meta($user_id, 'wml_sessions', true) ?: [];
        $data['total_sessions'] = count($sessions);

        // Try to read from sophicly-student-data if available
        if (function_exists('sophicly_get_student_data')) {
            $student_data = sophicly_get_student_data($user_id);
            $data['previous_scores'] = $student_data['scores'][$text] ?? [];
            $data['weak_aos']        = $student_data['weak_areas'] ?? [];
            $data['streak']          = $student_data['current_streak'] ?? 0;
            $data['reminders']       = $student_data['tutor_reminders'] ?? [];
        } else {
            // Fallback: read from user_meta directly
            $scores = get_user_meta($user_id, 'wml_student_scores', true) ?: [];
            $data['previous_scores'] = $scores[$text] ?? [];
            $data['weak_aos']        = get_user_meta($user_id, 'wml_weak_areas', true) ?: [];
            $data['streak']          = (int) get_user_meta($user_id, 'wml_current_streak', true);
            $data['reminders']       = get_user_meta($user_id, 'wml_tutor_reminders', true) ?: [];
        }

        // Calculate streak from WML sessions
        if ($data['streak'] === 0 && !empty($sessions)) {
            $data['streak'] = self::calculate_streak($sessions);
        }

        return $data;
    }

    /**
     * Calculate session streak (consecutive days with sessions)
     */
    private static function calculate_streak($sessions) {
        if (empty($sessions)) return 0;

        $dates = array_unique(array_map(function($s) {
            return date('Y-m-d', strtotime($s['date']));
        }, $sessions));
        rsort($dates);

        $streak = 0;
        $check_date = date('Y-m-d');

        foreach ($dates as $date) {
            if ($date === $check_date) {
                $streak++;
                $check_date = date('Y-m-d', strtotime($check_date . ' -1 day'));
            } else {
                break;
            }
        }

        return $streak;
    }

    // ═══════════════════════════════════════════
    //  SAVED EXAM QUESTIONS
    // ═══════════════════════════════════════════

    /**
     * Save a generated exam question for future use in essay planning.
     * Questions are stored per user, keyed by board + text.
     */
    public static function save_question($user_id, $board, $subject, $text, $question_data) {
        $raw = get_user_meta($user_id, 'wml_saved_questions', true);
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        $all = is_array($decoded) ? $decoded : [];
        $key = sanitize_key($board . '_' . $text);

        if (!isset($all[$key])) $all[$key] = [];

        // Deduplicate by summary (first 80 chars)
        $summary_prefix = substr($question_data['summary'] ?? '', 0, 80);
        foreach ($all[$key] as $existing) {
            if (substr($existing['summary'] ?? '', 0, 80) === $summary_prefix) return $all[$key];
        }

        $all[$key][] = [
            'summary'   => sanitize_text_field($question_data['summary'] ?? ''),
            'theme'     => sanitize_text_field($question_data['theme'] ?? ''),
            'location'  => sanitize_text_field($question_data['location'] ?? ''),
            'full_text' => wp_kses_post($question_data['full_text'] ?? ''),
            'board'     => sanitize_text_field($board),
            'subject'   => sanitize_text_field($subject),
            'text'      => sanitize_text_field($text),
            'saved_at'  => current_time('mysql'),
        ];

        update_user_meta($user_id, 'wml_saved_questions', wp_slash(wp_json_encode($all)));
        return $all[$key];
    }

    /**
     * Get saved questions for a specific board + text combination.
     */
    public static function get_saved_questions($user_id, $board, $text) {
        $raw = get_user_meta($user_id, 'wml_saved_questions', true);
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        $all = is_array($decoded) ? $decoded : [];
        $key = sanitize_key($board . '_' . $text);
        return $all[$key] ?? [];
    }

    /**
     * Get ALL saved questions across all texts, optionally filtered by board.
     * Returns array of banks: [ { board, text, count, questions[] } ]
     */
    public static function get_all_saved_questions($user_id, $board_filter = '') {
        $raw = get_user_meta($user_id, 'wml_saved_questions', true);
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        $all = is_array($decoded) ? $decoded : [];

        $banks = [];
        foreach ($all as $key => $questions) {
            if (!is_array($questions) || empty($questions)) continue;

            // Extract board/text from first question's stored fields (avoids underscore ambiguity in key)
            $first = $questions[0];
            $q_board = $first['board'] ?? '';
            $q_text  = $first['text'] ?? '';

            // Fallback: parse from key if stored fields are empty
            if (empty($q_board) && strpos($key, '_') !== false) {
                $parts = explode('_', $key, 2);
                $q_board = $parts[0];
                $q_text  = $parts[1] ?? '';
            }

            if ($board_filter && $q_board !== $board_filter) continue;

            $banks[] = [
                'board'     => $q_board,
                'text'      => $q_text,
                'count'     => count($questions),
                'questions' => $questions,
            ];
        }

        return $banks;
    }

    private static function generate_session_id() {
        return 'wml_' . bin2hex(random_bytes(8));
    }

    /**
     * Sanitize draft_type to allowed enum values (unified handoff v2)
     */
    private static function sanitize_draft_type($value) {
        $allowed = ['diagnostic', 'diagnostic_redraft', 'development', 'development_redraft', 'notes'];
        return in_array($value, $allowed, true) ? $value : null;
    }

    /**
     * Determine plan enforcement rules based on phase + topic_number (unified handoff v2, corrected)
     * 
     * Topic rotation:
     * - Topic 1 = Diagnostic (essay)
     * - Topic 2 = Notes (no essay writing — the ONLY notes topic)
     * - Topic 3, 4, 5, 6... = Development Essays (ALL are essays)
     * 
     * Rules:
     * - Phase 1 (initial), Topic 1 (diagnostic): plan is OPTIONAL
     * - Phase 1 (initial), Topic 3+ (development): plan is COMPULSORY
     * - Phase 2 (redraft), any topic: plan is ALWAYS COMPULSORY
     * - Topic 2 (notes): N/A — no essay planning
     * - Standalone exam practice (topic_number = 0): no enforcement
     */
    public static function is_plan_required($context) {
        $phase = $context['phase'] ?? null;
        $topic = $context['topic_number'] ?? 0;

        if ($topic === 0) return false;   // Standalone — no enforcement
        if ($topic === 2) return false;   // Notes topic — no essay
        if ($phase === 'redraft') return true;  // All redrafts require planning
        if ($phase === 'initial' && $topic >= 3) return true;  // Development essays require planning
        return false;  // Topic 1 initial (diagnostic) = optional
    }

    /**
     * Get draft_type display label for UI
     */
    public static function get_draft_type_label($draft_type) {
        $labels = [
            'diagnostic'          => 'Diagnostic',
            'diagnostic_redraft'  => 'Diagnostic Redraft',
            'development'         => 'Development Essay',
            'development_redraft' => 'Development Redraft',
            'notes'               => 'Conceptual Notes',
        ];
        return $labels[$draft_type] ?? 'Exam Practice';
    }

    // ═══════════════════════════════════════════
    //  CREATIVE WRITING PROJECTS (v7.13.30)
    // ═══════════════════════════════════════════

    /**
     * Create a new creative writing project.
     * Returns the full project index entry.
     */
    public static function create_project($user_id, $name, $course_context = 'standalone') {
        $project_id = 'cwp_' . bin2hex(random_bytes(6));
        $now = current_time('mysql');

        $index_entry = [
            'id'             => $project_id,
            'name'           => sanitize_text_field($name),
            'created'        => $now,
            'updated'        => $now,
            'current_step'   => 0,
            'plot_template'  => '',
            'status'         => 'in_progress',
            'course_context' => sanitize_key($course_context),
        ];

        // Add to project index (stored as JSON string — must decode first)
        $raw = get_user_meta($user_id, 'swml_cw_projects', true);
        $index = is_string($raw) ? (json_decode($raw, true) ?: []) : (is_array($raw) ? $raw : []);
        $index[$project_id] = $index_entry;
        update_user_meta($user_id, 'swml_cw_projects', wp_slash(wp_json_encode($index)));

        // Create empty project data blob
        $project_data = [
            'id'              => $project_id,
            'writer_profile'  => null,
            'story_ideas'     => [],
            'logline'         => '',
            'brief_outline'   => null,
            'plot_template'   => '',
            'scene_selection'  => null,
            'character_profile' => null,
            'universal_values' => [],
            'theme_tone'      => null,
            'genre'           => null,
            'structural_elements' => null,
            'trials'          => [],
            'calibration_trend' => [],
            'step_completion' => [],
        ];
        update_user_meta($user_id, 'swml_cw_' . $project_id, wp_slash(wp_json_encode($project_data)));

        do_action('sophicly_cw_project_created', $user_id, $project_id, $index_entry);

        return $index_entry;
    }

    /**
     * List all creative writing projects for a user.
     */
    public static function list_projects($user_id) {
        $raw = get_user_meta($user_id, 'swml_cw_projects', true);
        if (empty($raw)) return [];
        if (is_array($raw)) return $raw;
        return json_decode($raw, true) ?: [];
    }

    /**
     * Get full project data blob.
     */
    public static function get_project($user_id, $project_id) {
        $raw = get_user_meta($user_id, 'swml_cw_' . sanitize_key($project_id), true);
        if (empty($raw)) return null;
        if (is_array($raw)) return $raw;
        return json_decode($raw, true) ?: null;
    }

    /**
     * Save a specific artifact key within a project.
     * Also updates the project index timestamp.
     */
    public static function save_project_artifact($user_id, $project_id, $key, $value) {
        $project_id = sanitize_key($project_id);
        $project = self::get_project($user_id, $project_id);
        if ($project === null) return false;

        $key = sanitize_key($key);
        $project[$key] = $value;
        update_user_meta($user_id, 'swml_cw_' . $project_id, wp_slash(wp_json_encode($project)));

        // Update index timestamp
        $index = self::list_projects($user_id);
        if (isset($index[$project_id])) {
            $index[$project_id]['updated'] = current_time('mysql');
            // Sync plot_template to index for quick display
            if ($key === 'plot_template') {
                $index[$project_id]['plot_template'] = $value;
            }
            update_user_meta($user_id, 'swml_cw_projects', wp_slash(wp_json_encode($index)));
        }

        do_action('sophicly_cw_artifact_saved', $user_id, $project_id, $key, $value);

        return true;
    }

    /**
     * Get a specific artifact key from a project.
     */
    public static function get_project_artifact($user_id, $project_id, $key) {
        $project = self::get_project($user_id, sanitize_key($project_id));
        if ($project === null) return null;
        return $project[sanitize_key($key)] ?? null;
    }

    /**
     * Append a trial result to a project.
     * Updates the calibration_trend array automatically.
     */
    public static function save_trial_result($user_id, $project_id, $trial_data) {
        $project_id = sanitize_key($project_id);
        $project = self::get_project($user_id, $project_id);
        if ($project === null) return false;

        $project['trials'][] = $trial_data;

        // Update calibration trend (delta between self-rating and AI rating)
        if (isset($trial_data['calibration_delta'])) {
            $project['calibration_trend'][] = (int) $trial_data['calibration_delta'];
        }

        update_user_meta($user_id, 'swml_cw_' . $project_id, wp_slash(wp_json_encode($project)));

        // Update index timestamp
        $index = self::list_projects($user_id);
        if (isset($index[$project_id])) {
            $index[$project_id]['updated'] = current_time('mysql');
            update_user_meta($user_id, 'swml_cw_projects', wp_slash(wp_json_encode($index)));
        }

        do_action('sophicly_cw_trial_saved', $user_id, $project_id, $trial_data);

        return true;
    }

    /**
     * Mark a step as complete (or incomplete) within a project.
     * Also updates current_step in the index if advancing.
     */
    public static function update_step_completion($user_id, $project_id, $step, $complete = true) {
        $project_id = sanitize_key($project_id);
        $step = absint($step);
        $project = self::get_project($user_id, $project_id);
        if ($project === null) return false;

        $project['step_completion'][$step] = (bool) $complete;
        update_user_meta($user_id, 'swml_cw_' . $project_id, wp_slash(wp_json_encode($project)));

        // Update current_step in index (highest completed step)
        $index = self::list_projects($user_id);
        if (isset($index[$project_id])) {
            if ($complete && $step > ($index[$project_id]['current_step'] ?? 0)) {
                $index[$project_id]['current_step'] = $step;
            }
            $index[$project_id]['updated'] = current_time('mysql');
            update_user_meta($user_id, 'swml_cw_projects', wp_slash(wp_json_encode($index)));
        }

        do_action('sophicly_cw_step_completed', $user_id, $project_id, $step, $complete);

        return true;
    }
}
