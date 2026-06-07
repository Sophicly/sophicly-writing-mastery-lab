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

    // v7.19.321: summary from the most recent capture_from_markers() finalize,
    // so the chat handler can surface the live result to the frontend for the
    // in-doc Quiz Result card. Null when the last capture didn't finalise.
    private $last_finalize_summary = null;

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

        // v7.19.319: IDEMPOTENT upsert keyed by q_num. Re-emits (page reload,
        // marker repeated in a re-rendered turn) OVERWRITE the same question
        // instead of appending a duplicate. Running totals are recomputed from
        // the questions array each time, never blind-accumulated.
        $replaced = false;
        foreach ($accumulator['questions'] as $i => $existing) {
            if ((int) ($existing['q_num'] ?? 0) === $q_num) {
                $accumulator['questions'][$i] = $entry;
                $replaced = true;
                break;
            }
        }
        if (!$replaced) {
            $accumulator['questions'][] = $entry;
        }
        $this->recompute_totals($accumulator);
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
     *
     * v7.19.319: grade is now CODE-DERIVED from the actual percentage via
     * grade_from_percentage() — the model is removed from the storage path.
     * The $grade_equivalent argument is retained only for the deprecated
     * record_quiz_score shim signature and is ignored for derivation.
     */
    public function finalize($user_id, $grade_equivalent = 0) {
        $accumulator = $this->get_accumulator($user_id);
        if (!$accumulator) {
            error_log("[WML Quiz Engine] finalize called with no active accumulator (uid={$user_id})");
            return null;
        }

        $this->recompute_totals($accumulator);
        $score = (float) $accumulator['score_running'];
        $max   = (float) $accumulator['max_running'];
        if ($max <= 0) {
            error_log("[WML Quiz Engine] finalize aborted — max_running is zero (uid={$user_id})");
            return null;
        }
        $percentage = (int) round(($score / $max) * 100);
        $grade      = $this->grade_from_percentage($percentage);

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
    //  DETERMINISTIC MARKER CAPTURE (v7.19.319) — replaces the dead
    //  AI-function-call path. The AI emits hidden markers in its reply; the
    //  SERVER parses, accumulates, auto-finalises, and strips them. The model
    //  only judges per-question points; code owns the entire storage path.
    //
    //  Marker contract (emitted by mark-scheme-quiz protocol):
    //    Per marked question:  [[QUIZ q=N of=T pts=P max=M cat=AO2 Language]]
    //    On the final message: [[QUIZ_DONE]]
    //
    //  Called from class-rest-api.php after every AI reply is generated.
    //  Returns the reply with all quiz markers stripped (safe to echo).
    // ─────────────────────────────────────────────────────────────────────

    public function capture_from_markers($user_id, $context, $reply) {
        $this->last_finalize_summary = null;
        if (!is_string($reply) || $reply === '') return $reply;
        $has_q    = (strpos($reply, '[[QUIZ') !== false);
        $has_done = (stripos($reply, '[[QUIZ_DONE]]') !== false);
        if (!$has_q && !$has_done) return $reply;

        // Resolve the active session id once (used for the done-guard).
        $session    = SWML_Session_Manager::get_active_session($user_id);
        $session_id = $session['session_id'] ?? '';
        $done_flag  = (string) get_user_meta($user_id, 'wml_quiz_done_' . absint($user_id), true);

        // Parse per-question markers in document order.
        if (preg_match_all('/\[\[QUIZ\s+([^\]]+?)\]\]/i', $reply, $matches)) {
            foreach ($matches[1] as $inner) {
                $q   = $this->marker_int($inner, 'q');
                $of  = $this->marker_int($inner, 'of');
                $pts = $this->marker_float($inner, 'pts');
                $max = $this->marker_float($inner, 'max');
                $cat = $this->marker_str($inner, 'cat');
                if ($q <= 0) continue;

                // Guard: if this session was already finalised, a stray re-emit
                // must NOT lazy-start a fresh accumulator. Skip silently.
                $accumulator = $this->get_accumulator($user_id);
                if (!$accumulator) {
                    if ($session_id !== '' && $done_flag === $session_id) {
                        continue;
                    }
                    // Lazy-start — replaces the disabled quiz_start function.
                    $accumulator = $this->start(
                        $user_id,
                        'mark_scheme',
                        $of > 0 ? $of : 5,
                        $context['board'] ?? '',
                        $context['text']  ?? '',
                        max(1, absint($context['attempt'] ?? 1))
                    );
                }
                $this->record_question($user_id, [
                    'q_num'         => $q,
                    'marks_awarded' => $pts,
                    'max_marks'     => $max > 0 ? $max : 2,
                    'category'      => $cat,
                ]);
            }
        }

        // Auto-finalise: [[QUIZ_DONE]] is the authoritative trigger.
        if ($has_done) {
            $accumulator = $this->get_accumulator($user_id);
            if ($accumulator && !($session_id !== '' && $done_flag === $session_id)) {
                $summary = $this->finalize($user_id);
                if ($summary) {
                    $this->last_finalize_summary = $summary;
                    if ($session_id !== '') {
                        update_user_meta($user_id, 'wml_quiz_done_' . absint($user_id), $session_id);
                    }
                }
            }
        }

        return $this->strip_quiz_markers($reply);
    }

    /**
     * The finalize summary from the most recent capture_from_markers() call,
     * or null if that call did not finalise. Consumed by the chat handler to
     * push the live Quiz Result to the frontend card. v7.19.321.
     */
    public function get_last_finalize_summary() {
        return $this->last_finalize_summary;
    }

    /**
     * Latest persisted Quiz Result for a doc, read back from session_records so
     * the frontend card survives a page reload. Returns
     * ['score','max','percentage','grade'] or null. Mirrors the row the
     * student-data listener writes from persist_mark_scheme(). v7.19.321.
     */
    public function get_persisted_result($user_id, $board, $text, $topic, $attempt = 1) {
        global $wpdb;
        $table = $wpdb->prefix . 'sophicly_session_records';
        // Query by columns (not the reconstructed session_id) so an attempt /
        // suffix-variant mismatch can't hide a real result. Latest scored
        // mark_scheme_unit row for this board+text(+topic) wins.
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT total_score, grade FROM {$table}
             WHERE user_id = %d AND board = %s AND text_slug = %s
               AND task = 'mark_scheme_unit'
               AND total_score IS NOT NULL AND total_score <> ''
               AND ( %d = 0 OR topic_number = %d )
             ORDER BY updated_at DESC, id DESC LIMIT 1",
            absint($user_id), sanitize_key($board), sanitize_text_field($text),
            (int) $topic, (int) $topic
        ), ARRAY_A);
        if (!$row || $row['total_score'] === null || $row['total_score'] === '') return null;
        $parts = explode('/', (string) $row['total_score']);
        $score = isset($parts[0]) ? (float) $parts[0] : 0;
        $max   = isset($parts[1]) ? (float) $parts[1] : 0;
        if ($max <= 0) return null;
        return [
            'score'      => $score,
            'max'        => $max,
            'percentage' => (int) round(($score / $max) * 100),
            'grade'      => (int) $row['grade'],
        ];
    }

    /**
     * Remove all quiz markers from a reply (safe to call even when none exist).
     */
    public function strip_quiz_markers($reply) {
        if (!is_string($reply) || $reply === '') return $reply;
        // [[QUIZ_DONE]] first, then [[QUIZ ...]]; collapse the blank line left.
        $reply = preg_replace('/\[\[QUIZ_DONE\]\]/i', '', $reply);
        $reply = preg_replace('/\[\[QUIZ\s+[^\]]*?\]\]/i', '', $reply);
        $reply = preg_replace('/\n{3,}/', "\n\n", $reply);
        return $reply;
    }

    private function marker_int($inner, $key) {
        return preg_match('/\b' . preg_quote($key, '/') . '=(-?\d+)/i', $inner, $m) ? (int) $m[1] : 0;
    }
    private function marker_float($inner, $key) {
        return preg_match('/\b' . preg_quote($key, '/') . '=(-?\d+(?:\.\d+)?)/i', $inner, $m) ? (float) $m[1] : 0.0;
    }
    private function marker_str($inner, $key) {
        // cat is free-text (may contain spaces) and is emitted LAST, so capture
        // to end of the marker inner.
        return preg_match('/\b' . preg_quote($key, '/') . '=(.+)$/i', $inner, $m) ? trim($m[1]) : '';
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
        // v7.19.321: the in-doc "Quiz Result" card is rendered by the frontend
        // (the canvas is a schema-locked TipTap editor whose autosave clobbers
        // any server-written section). The result reaches the frontend two ways:
        // live via the chat payload (get_last_finalize_summary) and on reload via
        // load_canvas (get_persisted_result). Persistence sink = the session_records
        // row written by the sophicly_canvas_saved listener above.
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
        $lines[] = 'PHASE STATE (the existence of this block means quiz is ACTIVE — Phase 1 Welcome/Ready Gate is OVER):';
        $lines[] = '  - Phase 1 is COMPLETE. The student already passed the Ready Gate (picked A "I\'m ready"). Do NOT re-emit Phase 1 copy ("Welcome to your quick AQA... five questions, each worth 2 marks", "A) I\'m ready / B) Hold on", "No rush at all", "Reply A when you\'re ready"). If you find yourself about to emit any of that Phase 1 ready-gate copy, ABORT — you have lost state. Re-render the CURRENT question (Q' . $q_now . ') instead.';
        $lines[] = '  - You are in Phase 2 at Question ' . $q_now . ' of ' . $q_tot . '. Render this question, await answer, give feedback, record via quiz_record_question, then ready-check. Loop.';
        $lines[] = '  - Single-letter input from student (A / B / C / D, or comma-list like "A,C") = ANSWER to the current question. NEVER interpret a single letter as a Phase 1 ready-gate selection. The Phase 1 A/B options no longer apply.';
        $lines[] = '  - "Y" / "yes" / "next" / "proceed" = ready-check confirmation to advance from current Q' . $q_now . ' to Q' . min($q_now + 1, $q_tot) . '. NEVER interpret as Phase 1 ready-gate.';
        $lines[] = '  - "Hold on" / "wait" / "not yet" mid-quiz = student wants to pause. Acknowledge briefly ("Take your time — reply when ready"), then WAIT. Do NOT re-emit Phase 1 ready-gate.';
        $lines[] = '';
        $lines[] = 'AUTHORITATIVE SCORING RULES:';
        $lines[] = '  1. NEVER use any score number not in this block. NEVER compute your own running total.';
        $lines[] = '  2. The "Current score" line you display in chat MUST equal "Score so far" above, formatted as `💯 Current score: X / Y marks`.';
        $lines[] = '  3. After each question feedback, emit the hidden marker `[[QUIZ q=N of=' . $q_tot . ' pts=<marks awarded> max=<max> cat=<category>]]` on its own line. The SERVER reads it and updates this block — do NOT compute your own tally. Never mention or quote the marker.';
        $lines[] = '  4. At Phase 3 dashboard, the FINAL score, percentage, and category gaps come from this block. Emit the hidden marker `[[QUIZ_DONE]]` on its own line — the SERVER finalises, derives the grade from the percentage, and persists. Do NOT compute or send the grade yourself; do NOT emit any [QUIZ_COMPLETE] marker.';
        $lines[] = '  5. Any prior-attempt scores in your session-reminder block are HISTORY only — never frame the current attempt as a "next round / fresh round / five more / second round". This is THIS attempt; numbers above are THIS attempt only.';
        $lines[] = '=== END QUIZ STATE ===';

        return implode("\n", $lines);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Recompute running totals from the questions array (single source of
     * truth). Called after every idempotent record + at finalize so re-emits
     * never inflate the score. v7.19.319.
     */
    private function recompute_totals(&$accumulator) {
        $score = 0.0;
        $max   = 0.0;
        foreach (($accumulator['questions'] ?? []) as $q) {
            $score += (float) ($q['marks_awarded'] ?? 0);
            $max   += (float) ($q['max_marks'] ?? 0);
        }
        $accumulator['score_running'] = $score;
        $accumulator['max_running']   = $max;
    }

    /**
     * Deterministic percentage → GCSE grade (1-9). v7.19.322: retuned to the
     * REAL AQA GCSE English Literature grade boundaries (June 2023, max 160) —
     * the higher/harder Literature scale, per Neil 2026-06-06 ("make it
     * aggressive, use the literature ones"). Boundaries as % of max:
     *   9=135/160(84%) 8=119(74%) 7=104(65%) 6=88(55%) 5=72(45%)
     *   4=57(36%) 3=42(26%) 2=27(17%) 1=12(8%).
     * Must stay in lock-step with the "Calculate Grade" band printed in
     * protocols/shared/mark-scheme-quiz/*.md so the chat dashboard agrees with
     * the stored grade + the in-doc Quiz Result card.
     */
    private function grade_from_percentage($pct) {
        return self::percentage_to_grade($pct);
    }

    /**
     * THIN WML-side delegate to the CANONICAL Sophicly grade band, which lives
     * in Sophicly_Grade_Mapper (sophicly-student-data) — the single source of
     * truth shared with graded components + the WML listener. Falls back to a
     * local copy of the same band if that class isn't loaded (defensive — WML
     * must never fatal on a missing cross-plugin dep).
     * Canonical band (Neil 2026-06-06, stricter-than-real, floors at Grade 1;
     * Grade 0 is reserved for "not answered" and never produced here):
     *   9≥95 8≥85 7≥75 6≥65 5≥55 4≥45 3≥35 2≥25 1<25
     */
    public static function percentage_to_grade($pct) {
        if (class_exists('Sophicly_Grade_Mapper')) {
            return Sophicly_Grade_Mapper::pct_to_gcse_grade($pct);
        }
        $pct = (int) $pct;
        if ($pct >= 95) return 9;
        if ($pct >= 85) return 8;
        if ($pct >= 75) return 7;
        if ($pct >= 65) return 6;
        if ($pct >= 55) return 5;
        if ($pct >= 45) return 4;
        if ($pct >= 35) return 3;
        if ($pct >= 25) return 2;
        return 1;
    }

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
