<?php
/**
 * SWML Quiz Engine (v7.18.0+)
 *
 * Server-authoritative quiz scoring. Replaces LLM-internal score tracking
 * across all WML quiz types (mark_scheme, foundational, future literature_recap,
 * conceptual, etc).
 *
 * Architecture:
 *   1. LLM calls quiz_start(quiz_type, total_questions, board, text, attempt_number)
 *      → engine creates accumulator in user_meta key 'wml_quiz_active_{user_id}'.
 *   2. After every student answer + ✓/⚠️/✗ feedback, LLM calls
 *      quiz_record_question(q_num, marks_awarded, max_marks, category, correct, student_answer)
 *      → engine appends to accumulator's questions array, updates running totals.
 *   3. On NEXT LLM turn, class-protocol-router.php inject_session_context() pulls
 *      build_state_block($user_id) and appends to preamble. LLM consumes deterministic
 *      tally — never computes its own.
 *   4. At Phase 3 dashboard, LLM calls quiz_finalize(grade_equivalent)
 *      → engine reads accumulator, dispatches to per-quiz_type persistence,
 *      clears accumulator.
 *
 * Persistence dispatch:
 *   mark_scheme  → do_action('sophicly_canvas_saved', ...) via existing student-data
 *                  WML listener (writes session_records.score_raw + total_score + grade)
 *   foundational → user_meta swml_foundational_quiz_results + sophicly_foundational_quiz_complete
 *                  hook (existing dashboard reads this; student-data v2.22.5+ also dual-writes
 *                  to session_records via the hook listener)
 *
 * Why user_meta not transient: durable across sessions, matches WML idiom
 * (class-session-manager.php uses update_user_meta for active session).
 */

if (!defined('ABSPATH')) exit;

class SWML_Quiz_Engine {

    private static $instance = null;

    const META_KEY_PREFIX = 'wml_quiz_active_';

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // No filters/actions to register at load time — engine is invoked
        // explicitly by function-handlers and protocol-router.
    }

    // ─────────────────────────────────────────────────────────────────────
    //  ACCUMULATOR CRUD
    // ─────────────────────────────────────────────────────────────────────

    private function meta_key($user_id) {
        return self::META_KEY_PREFIX . absint($user_id);
    }

    /**
     * Read the current accumulator. Returns null if no active quiz.
     */
    public function get_accumulator($user_id) {
        $raw = get_user_meta($user_id, $this->meta_key($user_id), true);
        if (empty($raw)) return null;
        if (is_array($raw)) return $raw;
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            // Try wp_unslash recovery (CLAUDE.md known gotcha).
            $decoded = json_decode(wp_unslash($raw), true);
        }
        return is_array($decoded) ? $decoded : null;
    }

    private function save_accumulator($user_id, $accumulator) {
        return update_user_meta(
            $user_id,
            $this->meta_key($user_id),
            wp_slash(wp_json_encode($accumulator))
        );
    }

    private function clear_accumulator($user_id) {
        delete_user_meta($user_id, $this->meta_key($user_id));
    }

    // ─────────────────────────────────────────────────────────────────────
    //  PUBLIC API — called by function-handlers
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Start a new quiz attempt. Resets any previous accumulator.
     */
    public function start($user_id, $quiz_type, $total_questions, $board, $text, $attempt_number = 1) {
        $session = SWML_Session_Manager::get_active_session($user_id);
        $session_id   = $session['session_id']            ?? '';
        $topic_number = $session['context']['topic_number'] ?? 0;

        $accumulator = [
            'quiz_type'       => sanitize_key($quiz_type),
            'session_id'      => sanitize_text_field($session_id),
            'attempt_number'  => max(1, absint($attempt_number)),
            'board'           => sanitize_key($board),
            'text'            => sanitize_text_field($text),
            'topic_number'    => absint($topic_number),
            'started_at'      => current_time('mysql'),
            'current_question' => 1,
            'total_questions' => max(1, absint($total_questions)),
            'score_running'   => 0,
            'max_running'     => 0,
            'questions'       => [],
        ];

        $this->save_accumulator($user_id, $accumulator);
        error_log("[WML Quiz Engine] start uid={$user_id} type={$accumulator['quiz_type']} total={$accumulator['total_questions']} board={$accumulator['board']} text={$accumulator['text']} attempt={$accumulator['attempt_number']}");
        return $accumulator;
    }

    /**
     * Record a single question's result. Updates running totals.
     */
    public function record_question($user_id, $args) {
        $accumulator = $this->get_accumulator($user_id);
        if (!$accumulator) {
            error_log("[WML Quiz Engine] record_question called with no active accumulator (uid={$user_id})");
            return null;
        }

        $q_num          = absint($args['q_num']          ?? count($accumulator['questions']) + 1);
        $marks_awarded  = max(0, (float) ($args['marks_awarded'] ?? 0));
        $max_marks      = max(1, (float) ($args['max_marks']     ?? 2));
        $marks_awarded  = min($marks_awarded, $max_marks);

        $entry = [
            'q_num'           => $q_num,
            'marks_awarded'   => $marks_awarded,
            'max_marks'       => $max_marks,
            'category'        => sanitize_text_field($args['category']        ?? ''),
            'correct'         => sanitize_text_field($args['correct']         ?? ''),
            'student_answer'  => sanitize_text_field($args['student_answer']  ?? ''),
        ];
        $accumulator['questions'][] = $entry;
        $accumulator['score_running'] += $marks_awarded;
        $accumulator['max_running']   += $max_marks;
        $accumulator['current_question'] = min(
            $q_num + 1,
            $accumulator['total_questions']
        );

        $this->save_accumulator($user_id, $accumulator);
        error_log("[WML Quiz Engine] record_question uid={$user_id} q={$q_num} {$marks_awarded}/{$max_marks} running={$accumulator['score_running']}/{$accumulator['max_running']}");
        return $accumulator;
    }

    /**
     * Finalize and persist. Returns the final summary.
     */
    public function finalize($user_id, $grade_equivalent) {
        $accumulator = $this->get_accumulator($user_id);
        if (!$accumulator) {
            error_log("[WML Quiz Engine] finalize called with no active accumulator (uid={$user_id})");
            return null;
        }

        $score = (float) $accumulator['score_running'];
        $max   = (float) $accumulator['max_running'];
        if ($max <= 0) {
            error_log("[WML Quiz Engine] finalize aborted — max_running is zero (uid={$user_id})");
            return null;
        }
        $percentage = (int) round(($score / $max) * 100);
        $grade      = max(1, min(9, absint($grade_equivalent)));

        $summary = [
            'quiz_type'      => $accumulator['quiz_type'],
            'score'          => $score,
            'max'            => $max,
            'percentage'     => $percentage,
            'grade'          => $grade,
            'attempt_number' => $accumulator['attempt_number'],
            'board'          => $accumulator['board'],
            'text'           => $accumulator['text'],
            'topic_number'   => $accumulator['topic_number'],
            'categories_with_errors' => $this->categories_with_errors($accumulator),
            'finalized_at'   => current_time('mysql'),
        ];

        // Dispatch persistence per quiz_type
        $method = 'persist_' . sanitize_key($accumulator['quiz_type']);
        if (method_exists($this, $method)) {
            $this->$method($user_id, $accumulator, $summary);
        } else {
            error_log("[WML Quiz Engine] finalize NO PERSISTENCE for quiz_type={$accumulator['quiz_type']} uid={$user_id} (add persist_{$accumulator['quiz_type']} method)");
        }

        $this->clear_accumulator($user_id);
        error_log("[WML Quiz Engine] finalize uid={$user_id} type={$summary['quiz_type']} score={$score}/{$max} pct={$percentage} grade={$grade}");
        return $summary;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  PERSISTENCE DISPATCH — one method per quiz_type
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Mark Scheme Quiz persistence.
     * Mirrors class-function-handlers.php handle_record_quiz_score (v7.17.79+).
     * Fires sophicly_canvas_saved → student-data WML listener writes
     * session_records.score_raw / total_score / grade.
     */
    private function persist_mark_scheme($user_id, $accumulator, $summary) {
        $score_int = (int) round($summary['score']);
        $max_int   = (int) round($summary['max']);
        $quiz_extra = [
            'score_raw'        => $score_int,
            'score_max'        => $max_int,
            'score_percentage' => $summary['percentage'],
            'grade_equivalent' => $summary['grade'],
            'task_kind'        => 'mark_scheme_quiz',
        ];
        do_action(
            'sophicly_canvas_saved',
            $user_id,
            $accumulator['board'],
            $accumulator['text'],
            '',
            0,
            $accumulator['topic_number'],
            '_msu',
            $quiz_extra
        );
    }

    /**
     * Foundational Quiz persistence.
     * Writes user_meta swml_foundational_quiz_results (existing dashboard read path)
     * AND fires sophicly_foundational_quiz_complete (student-data v2.22.5+ dual-writes
     * to session_records via this hook).
     */
    private function persist_foundational($user_id, $accumulator, $summary) {
        $board = $accumulator['board'];
        $text  = $accumulator['text'];
        $score_int = (int) round($summary['score']);
        $max_int   = (int) round($summary['max']);
        $key   = $board . '_' . $text;

        $raw  = get_user_meta($user_id, 'swml_foundational_quiz_results', true);
        $all  = is_string($raw) ? (json_decode($raw, true) ?: []) : (is_array($raw) ? $raw : []);
        $prev = $all[$key] ?? [];

        $attempts    = (int) ($prev['attempts'] ?? 0) + 1;
        $prev_best   = (int) ($prev['best_score'] ?? 0);
        $is_new_best = $score_int > $prev_best;
        $cats_str    = implode(', ', $summary['categories_with_errors']);

        $all[$key] = [
            'best_score'      => $is_new_best ? $score_int : $prev_best,
            'best_score_max'  => $max_int,
            'best_percentage' => $is_new_best ? $summary['percentage'] : (int) ($prev['best_percentage'] ?? 0),
            'best_grade'      => $is_new_best ? (string) $summary['grade'] : ($prev['best_grade'] ?? ''),
            'attempts'        => $attempts,
            'last_attempt_at' => $summary['finalized_at'],
            'last_score'      => $score_int,
            'last_percentage' => $summary['percentage'],
            'last_grade'      => (string) $summary['grade'],
            'last_categories' => $cats_str,
        ];

        update_user_meta(
            $user_id,
            'swml_foundational_quiz_results',
            wp_slash(wp_json_encode($all))
        );

        do_action('sophicly_foundational_quiz_complete', $user_id, $board, $text, $all[$key]);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  STATE BLOCK — consumed by class-protocol-router.php inject_session_context
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Build the QUIZ STATE preamble block. Returns empty string when no active
     * accumulator (so injection adds nothing for non-quiz turns).
     *
     * This block is the anti-hallucination anchor: the LLM uses these numbers
     * verbatim and never computes its own running tally or final score.
     */
    public function build_state_block($user_id) {
        $accumulator = $this->get_accumulator($user_id);
        if (!$accumulator) return '';

        $type   = strtoupper((string) $accumulator['quiz_type']);
        $board  = strtoupper((string) $accumulator['board']);
        $text   = (string) $accumulator['text'];
        $q_now  = (int) $accumulator['current_question'];
        $q_tot  = (int) $accumulator['total_questions'];
        $score  = $accumulator['score_running'];
        $max    = $accumulator['max_running'];
        $attempt = (int) $accumulator['attempt_number'];

        $score_str = $this->fmt_num($score);
        $max_str   = $this->fmt_num($max);

        $lines = [];
        $lines[] = '=== QUIZ STATE (server truth — use these numbers, do NOT compute your own) ===';
        $lines[] = "Quiz type: {$type} | Board: {$board} | Text/paper: {$text} | Attempt #{$attempt}";
        $lines[] = "Question: {$q_now} of {$q_tot}";
        $lines[] = "Score so far: {$score_str} / {$max_str} marks";

        if (!empty($accumulator['questions'])) {
            $lines[] = 'Per-question record:';
            foreach ($accumulator['questions'] as $q) {
                $cat = $q['category'] ?: '(no category)';
                $ma  = $this->fmt_num($q['marks_awarded']);
                $mm  = $this->fmt_num($q['max_marks']);
                $sa  = $q['student_answer'] !== '' ? $q['student_answer'] : '?';
                $cc  = $q['correct'] !== '' ? $q['correct'] : '?';
                $lines[] = "  Q{$q['q_num']} [{$cat}]: {$ma}/{$mm} (student answered {$sa}; correct {$cc})";
            }
            $errors = $this->categories_with_errors($accumulator);
            $err_line = !empty($errors) ? implode(', ', $errors) : '(none yet)';
            $lines[] = "Categories with errors so far: {$err_line}";
        } else {
            $lines[] = 'Per-question record: (none yet — quiz just started)';
        }

        $lines[] = '';
        $lines[] = 'AUTHORITATIVE SCORING RULES:';
        $lines[] = '  1. NEVER use any score number not in this block. NEVER compute your own running total.';
        $lines[] = '  2. The "Current score" line you display in chat MUST equal "Score so far" above, formatted as `💯 Current score: X / Y marks`.';
        $lines[] = '  3. After each question feedback, call `quiz_record_question(q_num, marks_awarded, max_marks, category, correct, student_answer)` SILENTLY. Do not narrate the call.';
        $lines[] = '  4. At Phase 3 dashboard, the FINAL score, percentage, and category gaps come from this block (after recording Q' . $q_tot . '). Then call `quiz_finalize(grade_equivalent)` SILENTLY — server persists. Do NOT emit any [QUIZ_COMPLETE] marker.';
        $lines[] = '  5. Any prior-attempt scores in your session-reminder block are HISTORY only — never frame the current attempt as a "next round / fresh round / five more / second round". This is THIS attempt; numbers above are THIS attempt only.';
        $lines[] = '=== END QUIZ STATE ===';

        return implode("\n", $lines);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────

    private function categories_with_errors($accumulator) {
        $errors = [];
        foreach (($accumulator['questions'] ?? []) as $q) {
            if ($q['marks_awarded'] < $q['max_marks']) {
                $cat = $q['category'] ?? '';
                if ($cat && !in_array($cat, $errors, true)) $errors[] = $cat;
            }
        }
        return $errors;
    }

    private function fmt_num($n) {
        $f = (float) $n;
        if (abs($f - round($f)) < 0.0001) return (string) (int) round($f);
        return rtrim(rtrim(number_format($f, 2, '.', ''), '0'), '.');
    }
}
