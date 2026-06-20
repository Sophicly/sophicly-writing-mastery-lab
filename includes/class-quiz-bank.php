<?php
/**
 * SWML Quiz Bank (v7.19.323 — Phase 1 of deterministic code-scored quiz)
 *
 * Parses the inline mark-scheme-quiz protocol markdown into structured,
 * machine-scoreable questions, and scores a student's answer against the key
 * in CODE — the AI is never the scorekeeper. Pairs with SWML_Quiz_Engine
 * (which owns the accumulator, finalise, grade band, persistence + card).
 *
 * Single canonical question format across all 6 files
 * (protocols/shared/mark-scheme-quiz/*.md), e.g.:
 *
 *   N. **Type: MCQ \[Tests AO1 Conceptualised\]**
 *      * **Question:** ...
 *      * **Options:** A) ..., B) ..., C) ..., D) ...
 *      * **Correct:** A            (MCQ / Select All)
 *      * **Answer:** Judicious      (Fill / True-False)
 *      * **Scoring:** 2 marks for A,B,D. 1 mark if mostly correct.  (Select All)
 *      * **Feedback:** ✓ Correct. ...
 *      * **Stretch (unscored):** ... (discussion only — ignored by scorer)
 *
 * Board section headings come in two styles — both handled:
 *   ### **SECTION A: AQA (8702)**            (5 "clean" files)
 *   ### Quiz: AQA GCSE English Language Paper 2   (language2.md)
 */

if (!defined('ABSPATH')) exit;

class SWML_Quiz_Bank {

    /** subject slug → protocol filename (mirrors class-protocol-router.php L1058). */
    private static $subject_map = [
        'shakespeare'      => 'shakespeare.md',
        'modern_text'      => 'modern_text.md',
        '19th_century'     => '19th_century.md',
        'poetry_anthology' => 'poetry_anthology.md',
        'unseen_poetry'    => 'poetry_anthology.md',
        'language_paper_1' => 'language1.md',
        'language_paper_2' => 'language2.md',
        'language1'        => 'language1.md',
        'language2'        => 'language2.md',
        'language_p1'      => 'language1.md',
        'language_p2'      => 'language2.md',
        'lang_p1'          => 'language1.md',
        'lang_p2'          => 'language2.md',
    ];

    private static function dir() {
        return plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/mark-scheme-quiz/';
    }

    public static function file_for_subject($subject) {
        return self::$subject_map[$subject] ?? null;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  PARSE
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Parse a subject's protocol file into [ section_label => [questions] ].
     * Returns [] if the file can't be resolved/read.
     */
    public static function parse_sections($subject) {
        $file = self::file_for_subject($subject);
        if (!$file) return [];
        return self::parse_file(self::dir() . $file);
    }

    /**
     * Foundational-quiz banks (v7.19.578): text-keyed, board-agnostic. One file
     * per text at protocols/shared/foundational-quiz/banks/{text}.md with a single
     * "### Quiz: <Text>" section. Reuses the SAME parser + scorer as the MSQ banks.
     */
    private static function fq_dir() {
        return plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/foundational-quiz/banks/';
    }

    public static function parse_sections_fq($text) {
        return self::parse_file(self::fq_dir() . sanitize_file_name((string) $text) . '.md');
    }

    /** Parse a bank markdown file at $path into [ section_label => [questions] ]. */
    public static function parse_file($path) {
        if (!file_exists($path)) return [];
        $lines = preg_split('/\r\n|\r|\n/', (string) file_get_contents($path));

        $sections = [];
        $cur = null;        // current section label
        $q   = null;        // question being assembled

        $flush = function () use (&$q, &$sections, &$cur) {
            if ($q !== null && $cur !== null && self::is_scoreable($q)) {
                $sections[$cur][] = $q;
            }
            $q = null;
        };

        foreach ($lines as $ln) {
            // Section heading — two styles.
            if (preg_match('/^###\s+\*\*SECTION\s+[A-Z0-9]+:\s*(.+?)\*\*/i', $ln, $m)
             || preg_match('/^###\s+Quiz:\s*(.+?)\s*$/i', $ln, $m)) {
                $flush();
                $cur = trim($m[1]);
                if (!isset($sections[$cur])) $sections[$cur] = [];
                continue;
            }
            // Leaving the quiz-questions area entirely (next top-level ## that
            // isn't a quiz heading, e.g. ## Answer Keys / ## TEACHER NOTES).
            if (preg_match('/^##\s+(?!#)/', $ln) && stripos($ln, 'quiz') === false) {
                $flush();
                $cur = null;
                continue;
            }
            // Question start.
            if (preg_match('/^\s*(\d+)\.\s+\*\*Type:\s*([^\[\*]+?)\s*(?:\\\\?\[Tests\s*(.+?)\\\\?\])?\s*\*\*/i', $ln, $m)) {
                $flush();
                $q = [
                    'q_num'     => (int) $m[1],
                    'type'      => self::norm_type($m[2]),
                    'category'  => isset($m[3]) ? trim($m[3]) : '',
                    'question'  => '',
                    'options'   => [],
                    'correct'   => [],   // MCQ / Select-All letters
                    'answer'    => '',   // Fill / True-False
                    'feedback'  => '',
                    'ao'        => '',   // explicit AO tag (Phase 2), e.g. "AO2"
                    'why'       => [],   // per-distractor why-wrong glosses, letter => gloss
                    'why_generic' => '', // why-wrong gloss for fill/true-false
                    'max_marks' => 2,
                ];
                continue;
            }
            if ($q === null) continue;

            if (preg_match('/^\s*\*\s*\*\*Question:\*\*\s*(.+)$/i', $ln, $m)) { $q['question'] = self::clean($m[1]); continue; }
            if (preg_match('/^\s*\*\s*\*\*Options:\*\*\s*(.+)$/i', $ln, $m)) {
                foreach (preg_split('/,\s*(?=[A-E]\))/', trim($m[1])) as $p) {
                    if (preg_match('/^([A-E])\)\s*(.+?)\s*$/', trim($p), $mm)) {
                        $q['options'][$mm[1]] = self::clean(rtrim($mm[2], '.'));
                    }
                }
                continue;
            }
            if (preg_match('/^\s*\*\s*\*\*Correct:\*\*\s*(.+)$/i', $ln, $m)) {
                $q['correct'] = array_values(array_filter(array_map('trim', preg_split('/\s*,\s*/', trim($m[1])))));
                continue;
            }
            if (preg_match('/^\s*\*\s*\*\*Answer:\*\*\s*(.+)$/i', $ln, $m)) { $q['answer'] = self::clean($m[1]); continue; }
            if (preg_match('/^\s*\*\s*\*\*Feedback:\*\*\s*(.+)$/i', $ln, $m)) { $q['feedback'] = self::clean($m[1]); continue; }
            if (preg_match('/^\s*\*\s*\*\*AO:\*\*\s*(.+)$/i', $ln, $m)) { $q['ao'] = self::clean($m[1]); continue; }
            if (preg_match('/^\s*\*\s*\*\*Why\s+([A-E]):\*\*\s*(.+)$/i', $ln, $m)) { $q['why'][strtoupper($m[1])] = self::clean($m[2]); continue; }
            if (preg_match('/^\s*\*\s*\*\*WhyWrong:\*\*\s*(.+)$/i', $ln, $m)) { $q['why_generic'] = self::clean($m[1]); continue; }
            // Scoring + Stretch lines are intentionally ignored by the scorer.
        }
        $flush();
        return $sections;
    }

    /** A question is scoreable only if it has a resolvable key + stem. */
    private static function is_scoreable($q) {
        if (($q['question'] ?? '') === '') return false;
        if (in_array($q['type'], ['mcq', 'select_all'], true)) {
            return !empty($q['correct']) && !empty($q['options']);
        }
        if (in_array($q['type'], ['true_false', 'fill_blank'], true)) {
            return ($q['answer'] ?? '') !== '';
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  BOARD RESOLUTION + SESSION PICK
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Resolve the requested board to its section's questions.
     * Matches the board token inside the section label, case-insensitive.
     * Falls back to the first section if nothing matches.
     */
    public static function questions_for($subject, $board) {
        $sections = self::parse_sections($subject);
        if (empty($sections)) return [];
        $needle = strtolower(preg_replace('/[^a-z0-9]+/i', ' ', (string) $board));
        $needle = trim($needle);
        // Try exact-ish board-token containment first.
        foreach ($sections as $label => $qs) {
            $hay = strtolower(preg_replace('/[^a-z0-9]+/i', ' ', $label));
            if ($needle !== '' && strpos($hay, $needle) !== false) return $qs;
        }
        // Try the first word of the board (e.g. "edexcel").
        $first = strtok($needle, ' ');
        if ($first) {
            foreach ($sections as $label => $qs) {
                $hay = strtolower($label);
                if (strpos($hay, $first) !== false) return $qs;
            }
        }
        // Fallback: first section in the file.
        return reset($sections);
    }

    /**
     * Pick a session of N questions for a board. Spreads across categories
     * where possible, then fills randomly. Returns the FULL question objects
     * (with keys + feedback) — the caller must strip keys before sending to
     * the client.
     */
    public static function pick_session($subject, $board, $n = 5) {
        $pool = self::questions_for($subject, $board);
        if (empty($pool)) return [];
        return self::pick_from_pool($pool, sanitize_key($subject) . ':' . sanitize_key($board), $n);
    }

    /** FQ: text-keyed, single-section pool (board-agnostic). */
    public static function questions_for_fq($text) {
        $sections = self::parse_sections_fq($text);
        return empty($sections) ? [] : reset($sections);
    }

    public static function pick_session_fq($text, $n = 5) {
        $pool = self::questions_for_fq($text);
        if (empty($pool)) return [];
        return self::pick_from_pool($pool, 'fq:' . sanitize_key((string) $text), $n);
    }

    /**
     * Spread N picks across category groups (AO, else [Tests …] category), then
     * fill round-robin. Returns FULL question objects (keys + feedback) — the
     * caller MUST strip keys before sending to the client. Shared by MSQ + FQ.
     */
    private static function pick_from_pool($pool, $id_prefix, $n = 5) {
        $n = max(1, min($n, count($pool)));

        $by_cat = [];
        foreach ($pool as $q) {
            $key = ($q['ao'] ?? '') !== '' ? $q['ao'] : ($q['category'] ?: '_');
            $by_cat[$key][] = $q;
        }
        foreach ($by_cat as &$g) { shuffle($g); }
        unset($g);
        $cats = array_keys($by_cat);
        shuffle($cats);

        $picked = [];
        while (count($picked) < $n) {
            $progressed = false;
            foreach ($cats as $c) {
                if (!empty($by_cat[$c])) {
                    $picked[] = array_shift($by_cat[$c]);
                    $progressed = true;
                    if (count($picked) >= $n) break;
                }
            }
            if (!$progressed) break;
        }

        // Stamp a stable id + sequential session position.
        $out = [];
        foreach (array_values($picked) as $i => $q) {
            $q['id']     = $id_prefix . ':' . $q['q_num'];
            $q['seq']    = $i + 1;
            $out[]       = $q;
        }
        return $out;
    }

    /** Public-safe projection of a question (no key, no feedback) for the client. */
    public static function public_question($q, $total) {
        $opts = [];
        foreach ($q['options'] as $letter => $text) {
            $opts[] = ['letter' => $letter, 'text' => $text];
        }
        return [
            'id'       => $q['id'],
            'seq'      => $q['seq'],
            'total'    => $total,
            'type'     => $q['type'],
            'category' => $q['category'],
            'question' => $q['question'],
            'options'  => $opts,           // empty for fill/true-false
            'maxMarks' => $q['max_marks'],
        ];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  SCORING (pure code — the whole point)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Score a student's raw answer against a question's key.
     * Returns ['marks'=>float,'max'=>float,'correct'=>bool,'feedback'=>string,
     *          'correctKey'=>string].
     */
    public static function score($q, $raw) {
        $max = (float) ($q['max_marks'] ?? 2);
        $marks = 0.0;
        switch ($q['type']) {
            case 'mcq':
                $pick = self::letters($raw);
                $marks = (count($pick) === 1 && in_array($pick[0], $q['correct'], true)) ? $max : 0.0;
                break;
            case 'select_all':
                $pick = self::letters($raw);
                $key  = $q['correct'];
                $right = count(array_intersect($pick, $key));
                $wrong = count(array_diff($pick, $key));
                if ($right === count($key) && $wrong === 0) {
                    $marks = $max;                                  // exact
                } elseif ($wrong === 0 && $right >= (int) ceil(count($key) / 2)) {
                    $marks = 1.0;                                   // "mostly correct"
                } else {
                    $marks = 0.0;
                }
                break;
            case 'true_false':
                $marks = (self::norm_tf($raw) !== '' && self::norm_tf($raw) === self::norm_tf($q['answer'])) ? $max : 0.0;
                break;
            case 'fill_blank':
                $marks = self::fill_matches($raw, $q['answer']) ? $max : 0.0;
                break;
        }
        $correct = ($marks >= $max);
        // Blake-Harvard why-wrong glosses (Phase 2): on a wrong answer, return the
        // gloss for EVERY distractor (not just the one picked) so the end-of-round
        // review can explain why each wrong option is wrong. Empty when correct or
        // when the bank has no glosses yet (graceful pre-content behaviour).
        $why = [];
        if (!$correct) {
            if (in_array($q['type'], ['mcq', 'select_all'], true) && !empty($q['why'])) {
                foreach ($q['why'] as $letter => $gloss) {
                    if (!in_array($letter, $q['correct'], true) && $gloss !== '') {
                        $why[] = $letter . ') ' . $gloss;
                    }
                }
            } elseif (($q['why_generic'] ?? '') !== '') {
                $why[] = $q['why_generic'];
            }
        }
        return [
            'marks'      => $marks,
            'max'        => $max,
            'correct'    => $correct,
            'partial'    => ($marks > 0 && $marks < $max),
            'whyWrong'   => $why,
            // v7.19.324: strip the authored "✓ Correct." affirmation — the
            // explanation must read correctly under a WRONG (✗) result too, and
            // the caller already renders the real ✓/✗ + marks line above it.
            'feedback'   => self::strip_affirmation($q['feedback'] ?? ''),
            'correctKey' => self::display_key($q),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  NORMALISERS
    // ─────────────────────────────────────────────────────────────────────

    private static function norm_type($raw) {
        $r = strtolower($raw);
        if (strpos($r, 'select all') !== false) return 'select_all';
        if (strpos($r, 'true') !== false && strpos($r, 'false') !== false) return 'true_false';
        if (strpos($r, 'fill') !== false) return 'fill_blank';
        if (strpos($r, 'mcq') !== false) return 'mcq';
        return 'unknown';
    }

    /** Extract A-E answer letters from a raw chat input ("B", "a,c", "A and D"). */
    private static function letters($raw) {
        if (!preg_match_all('/[A-E]/i', (string) $raw, $m)) return [];
        $out = array_map('strtoupper', $m[0]);
        return array_values(array_unique($out));
    }

    private static function norm_tf($raw) {
        $r = strtolower(trim((string) $raw));
        if ($r === '') return '';
        if ($r === 't' || strpos($r, 'true') === 0)  return 'true';
        if ($r === 'f' || strpos($r, 'false') === 0) return 'false';
        return '';
    }

    private static function fill_matches($raw, $answer) {
        $norm = function ($s) {
            $s = strtolower(trim((string) $s));
            $s = preg_replace('/[^a-z0-9\s]/', '', $s);
            return trim(preg_replace('/\s+/', ' ', $s));
        };
        $a = $norm($raw);
        $b = $norm($answer);
        if ($a === '' || $b === '') return false;
        if ($a === $b) return true;
        // Accept the key word(s) appearing as a phrase within the student answer.
        return strpos(' ' . $a . ' ', ' ' . $b . ' ') !== false;
    }

    private static function display_key($q) {
        if (in_array($q['type'], ['mcq', 'select_all'], true)) return implode(', ', $q['correct']);
        return (string) $q['answer'];
    }

    /** Strip stray markdown emphasis the parser shouldn't keep literally. */
    private static function clean($s) {
        return trim((string) $s);
    }

    /**
     * Strip the authored "✓ Correct." (and minor variants) affirmation prefix
     * from a feedback string. The remaining explanation is outcome-neutral, so it
     * reads correctly whether the student got the question right or wrong — the
     * caller renders the actual ✓/✗ + marks line separately. Only a LEADING
     * affirmation is removed; "correct" appearing mid-sentence is untouched.
     */
    private static function strip_affirmation($s) {
        // Require the leading ✓ so checkmark-less feedback (or a sentence that
        // happens to start with the word "Correct") is never touched. Strips
        // "✓ Correct. ", "✓ Correct — ", or a lone leading "✓ ".
        return trim(preg_replace('/^\s*\x{2713}\s*(?:correct)?[\s.!:\x{2014}\-]*/iu', '', (string) $s));
    }
}
