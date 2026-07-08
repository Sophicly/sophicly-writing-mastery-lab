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

    /**
     * v7.19.955: Parse a bank's `.concept-notes.md` sidecar into
     * [ entity_slug => [ slot => text ] ]. The sidecar carries the pre-authored
     * one-line concept notes the FQ autofills into the knowledge organiser when
     * the student answers that entity's question correctly (Neil 2026-07-08:
     * "correct answers auto-fill the document"). Shape:
     *   ### <Entity Heading>          → slug: lowercase, non-alnum → _
     *   - **<Slot Label>:** <text>    → slot keys below
     * Slot labels map to the four organiser slots; the map doubles as the
     * category→slot bridge for handle_quiz_answer (bank [Tests …] categories).
     */
    public static function concept_notes_for($text) {
        static $cache = [];
        $text = sanitize_file_name((string) $text);
        if (isset($cache[$text])) return $cache[$text];
        $path = self::fq_dir() . $text . '.concept-notes.md';
        $out = [];
        if (file_exists($path)) {
            $slot_map = [
                'definition'     => 'definition',
                'features'       => 'features',
                'effects'        => 'effects',
                'form & meaning' => 'meaning',
                'meaning'        => 'meaning',
            ];
            $cur = '';
            foreach (preg_split('/\r\n|\r|\n/', (string) file_get_contents($path)) as $ln) {
                if (preg_match('/^###\s+(.+?)\s*$/', $ln, $m)) {
                    $cur = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', trim($m[1])), '_'));
                    continue;
                }
                if ($cur && preg_match('/^\s*-\s*\*\*(.+?):\*\*\s*(.+)$/', $ln, $m)) {
                    $slot = $slot_map[strtolower(trim($m[1]))] ?? '';
                    if ($slot) $out[$cur][$slot] = self::clean($m[2]);
                }
            }
        }
        $cache[$text] = $out;
        return $out;
    }

    /**
     * v7.19.955: Map a bank question's [Tests …] category to its organiser slot.
     * poetic_forms categories; unknown category → '' (no autofill — fail quiet
     * here is correct: the note is a bonus artefact, never quiz-blocking).
     */
    public static function concept_slot_for_category($category) {
        $map = [
            'recognising forms' => 'definition',
            'form features'     => 'features',
            'form effects'      => 'effects',
            'forms & meaning'   => 'meaning',
        ];
        return $map[strtolower(trim((string) $category))] ?? '';
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
                    'set'       => null, // v7.19.899: poem-quiz reading STAGE (@set:N) — bridge fq_stage
                    'part'      => null, // v7.19.899: forms-quiz STAGE (@part:N) — bridge fq_part
                    'form'      => '',   // v7.19.955: concept-note ENTITY (@form:slug) — autofill target
                ];
                continue;
            }
            if ($q === null) continue;

            // v7.19.899: capture the staging tokens the poem/forms banks carry on the line
            // after Type (indented, own line) — the parser previously dropped them silently, so
            // every stage served at once. @set = poem reading-stage; @part = poetic-form stage.
            if (preg_match('/^\s*@set:(\d+)\s*$/i', $ln, $m))  { $q['set']  = (int) $m[1]; continue; }
            if (preg_match('/^\s*@part:(\d+)\s*$/i', $ln, $m)) { $q['part'] = (int) $m[1]; continue; }
            // v7.19.955: concept-note entity token — which form (later: poem) this question
            // tests. Slug = slugified `### <Heading>` of the bank's .concept-notes.md sidecar.
            // Kept OUT of the [Tests …] stratification key (same law as @set/@part). Questions
            // without the token (general poetry-literacy Qs) simply never autofill — by design.
            if (preg_match('/^\s*@form:([a-z0-9_]+)\s*$/i', $ln, $m)) { $q['form'] = strtolower($m[1]); continue; }

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
        if (in_array($q['type'], ['mcq', 'select_all', 'ranking'], true)) {
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
        return self::resolve_board($sections, $board);
    }

    /**
     * Resolve a requested board to its section's questions — matches the board
     * token inside the section label (case-insensitive), then the board's first
     * word, then falls back to the first section. Shared by the MSQ (subject-keyed)
     * and MSA (text-keyed) banks.
     */
    private static function resolve_board($sections, $board) {
        if (empty($sections)) return [];
        $needle = trim(strtolower(preg_replace('/[^a-z0-9]+/i', ' ', (string) $board)));
        // Try exact-ish board-token containment first.
        foreach ($sections as $label => $qs) {
            $hay = strtolower(preg_replace('/[^a-z0-9]+/i', ' ', $label));
            if ($needle !== '' && strpos($hay, $needle) !== false) return $qs;
        }
        // Try the first word of the board (e.g. "edexcel").
        $first = strtok($needle, ' ');
        if ($first) {
            foreach ($sections as $label => $qs) {
                if (strpos(strtolower($label), $first) !== false) return $qs;
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
    public static function pick_session($subject, $board, $n = 5, $text = '') {
        // v7.19.963 (Neil — mark-scheme examples MUST come from the student's own text/anthology,
        // never a generic cross-anthology bank): prefer a per-TEXT mark-scheme-quiz bank resolved
        // through the ONE canonical slug ladder, fall back to the subject-generic bank ONLY when
        // none exists. Per-text ids get the `msq:{text}:{board}` namespace so resume-scoring
        // (resolve_quiz_question) routes to the right pool. When no per-text bank is authored yet,
        // the generic bank serves (still cross-anthology — that's a chat-B authoring gap, tracked).
        if ($text !== '' && $text !== null) {
            $tpool = self::questions_for_text($text, $board);
            if (!empty($tpool)) {
                return self::pick_from_pool($tpool, 'msq:' . sanitize_key((string) $text) . ':' . sanitize_key($board), $n);
            }
        }
        $pool = self::questions_for($subject, $board);
        if (empty($pool)) return [];
        // v7.19.964 (Neil — "what about ALL the other texts?"): the engine already scales to every
        // text via the ladder above; the only gap is un-authored per-text banks. Make that gap
        // LOUD instead of silent — if this text HAS a per-text ASSESSMENT bank but we're still
        // falling back to the GENERIC quiz bank, the quiz is serving cross-text examples. Log it
        // so the missing mark-scheme-quiz/{slug}.md is authored (coverage never silently reads OK).
        if ($text !== '' && $text !== null && function_exists('error_log') && !empty(self::parse_sections_msa($text))) {
            error_log('WML mark-scheme quiz: no per-text bank for "' . $text . '" — serving GENERIC "' . $subject . '" (cross-text examples). Author protocols/shared/mark-scheme-quiz/ for this text (a per-text assessment bank already exists).');
        }
        return self::pick_from_pool($pool, sanitize_key($subject) . ':' . sanitize_key($board), $n);
    }

    /**
     * v7.19.963: per-TEXT mark-scheme-QUIZ bank resolution — THE one canonical slug ladder
     * (mirrors parse_sections_msa; NEVER an ad-hoc per-dir filename guess). Candidates in order:
     *   {text}.md · {text}_poetry.md · {canonical(text)}.md · {canonical(text)}_poetry.md
     * canonical() = the $SLUG_ALIASES registry (class-rest-api.php — the single slug source of
     * truth). Returns [] when no per-text bank exists → caller falls back to the subject bank.
     */
    public static function parse_sections_text($text) {
        $text = (string) $text;
        if ($text === '') return [];
        $aliases = class_exists('SWML_REST_API') ? SWML_REST_API::slug_aliases() : [];
        $canon   = $aliases[$text] ?? $text;
        $slugs = array_values(array_unique(array_filter([
            sanitize_file_name($text),
            sanitize_file_name($text) . '_poetry',
            sanitize_file_name($canon),
            sanitize_file_name($canon) . '_poetry',
        ])));
        foreach ($slugs as $slug) {
            if ($slug === '') continue;
            $path = self::dir() . $slug . '.md';
            if (file_exists($path)) return self::parse_file($path);
        }
        return [];
    }

    public static function questions_for_text($text, $board) {
        $sections = self::parse_sections_text($text);
        return empty($sections) ? [] : self::resolve_board($sections, $board);
    }

    /** FQ: text-keyed, single-section pool (board-agnostic). */
    public static function questions_for_fq($text) {
        $sections = self::parse_sections_fq($text);
        return empty($sections) ? [] : reset($sections);
    }

    /**
     * v7.19.899: FQ session pick — now STAGE-aware for the poem / poetic-form quizzes.
     * $stage + $stage_kind ('set' = poem reading-stage @set:N via bridge fq_stage; 'part' =
     * poetic-form @part:N via bridge fq_part). Behaviour (Neil — no random-N subset for these):
     *   • Bank carries the stage token AND a valid stage is requested → serve the FULL matching
     *     part (every poem/form in the part tested each attempt), shuffled.
     *   • No stage requested / bank has no stage tokens (e.g. igcse_lang single-stage) → serve the
     *     WHOLE bank, shuffled. Empty stage match → whole bank + a fail-loud log (never silent).
     * Serving the full set bypasses the REST count cap (a 15/18-Q part exceeds min(10,…)). Question
     * numbering is global per bank, so the 'fq:{text}:{q_num}' ids stay unique across sets → scoring
     * (stateless-by-id) is unaffected. Order + MCQ options shuffle via pick_from_pool as before.
     */
    public static function pick_session_fq($text, $n = 5, $stage = null, $stage_kind = 'set') {
        $pool = self::questions_for_fq($text);
        if (empty($pool)) return [];
        $serve = self::fq_stage_subset($pool, $text, $stage, $stage_kind);
        // n = count($serve) → pick_from_pool returns the ENTIRE served set, shuffled + id-stamped.
        return self::pick_from_pool($serve, 'fq:' . sanitize_key((string) $text), count($serve));
    }

    /**
     * v7.19.968: the FQ stage-subset selection, extracted so pick_session_fq (the served
     * round) and fq_round_size (the boot-time sidebar count) run the SAME code — a fork
     * here would make the first-paint sidebar lie about the round (§9.8 cross-copy drift).
     */
    private static function fq_stage_subset($pool, $text, $stage, $stage_kind) {
        // v7.19.952: the stage-token namespace follows the BANK, not the caller's param name.
        // The bridge unified both families to fq_stage=N (v2.31.109), so a poetic_forms lesson
        // arrives as kind='set' while its bank stages by @part:N — filtering by the param name
        // matched nothing and served the whole bank. Detect which token the bank actually
        // carries; the caller's kind only breaks the tie if a bank ever carries both.
        $has_part = false; $has_set = false;
        foreach ($pool as $q) {
            if (isset($q['part']) && $q['part'] !== null) $has_part = true;
            if (isset($q['set'])  && $q['set']  !== null) $has_set  = true;
            if ($has_part && $has_set) break;
        }
        $key = ($has_part && $has_set) ? (($stage_kind === 'part') ? 'part' : 'set')
             : ($has_part ? 'part' : 'set');
        $has_tokens = $has_part || $has_set;

        $serve = $pool;
        if ($has_tokens && $stage !== null && (int) $stage > 0) {
            $stage = (int) $stage;
            $sub = array_values(array_filter($pool, function ($q) use ($key, $stage) {
                return isset($q[$key]) && (int) $q[$key] === $stage;
            }));
            if (!empty($sub)) {
                $serve = $sub;
            } elseif (function_exists('error_log')) {
                error_log('WML FQ: stage ' . $key . '=' . $stage . ' matched 0 questions in bank "' . $text . '" — serving whole bank instead');
            }
        }
        return $serve;
    }

    /**
     * v7.19.968 (Neil C — sidebar correct from FIRST PAINT): the number of questions
     * pick_session_fq would serve for (bank, stage) — same stage subset, same stem-dedup,
     * no shuffle/id side effects. The embed config injects this at boot so the sidebar
     * renders the real step count immediately, never a 5-step placeholder that re-renders
     * to 10/15/18 once the round starts. 0 = no bank (caller falls back to the default shape).
     */
    public static function fq_round_size($text, $stage = null, $stage_kind = 'set') {
        $pool = self::questions_for_fq($text);
        if (empty($pool)) return 0;
        $serve = self::fq_stage_subset($pool, $text, $stage, $stage_kind);
        return count(self::dedupe_stems($serve, '', false));
    }

    /**
     * Mark Scheme ASSESSMENT banks (v7.19.739): per-TEXT, board-sectioned,
     * examiner-level. A DISTINCT (harder, exact-mark-scheme-vocabulary) bank from
     * the MSQ drill — one file per text at
     * protocols/shared/mark-scheme-assessment/banks/{text}.md with board sections
     * (### **SECTION A: AQA (8702 — Shakespeare)**). Picks ~10, AO-stratified.
     */
    private static function msa_dir() {
        return plugin_dir_path(dirname(__FILE__)) . 'protocols/shared/mark-scheme-assessment/banks/';
    }

    public static function parse_sections_msa($text) {
        $dir = self::msa_dir();
        // Prefer an exact text-named bank (e.g. romeo_and_juliet); else resolve a
        // drifted Language subject alias (language_p1 / language_paper_1 / lang_p1)
        // to the canonical basename via the shared subject_map, so state.text drift
        // still finds the bank instead of silently falling back to the legacy AI MSA
        // (Reeham AQA Lang P1, 2026-06-30 — only romeo_and_juliet.md existed). (v7.19.781)
        $candidates = [sanitize_file_name((string) $text)];
        if (isset(self::$subject_map[$text])) {
            $candidates[] = preg_replace('/\.md$/', '', self::$subject_map[$text]);
        }
        // Canvas-slug form: <board>_lang_paper_N / language_paper_N → languageN.md.
        // state.text drifts between the subject ('language1'), the alias ('language_p1')
        // and the canvas slug ('aqa_lang_paper_1') — one canonical naming layer
        // (CLAUDE.md canvas rule #3). Requires the "lang" token so no Literature text
        // (none contain "lang_paper") can false-match.
        if (preg_match('/(?:lang|language)_?paper[_-]?([12])/i', (string) $text, $mm)) {
            $candidates[] = 'language' . $mm[1];
        }
        foreach ($candidates as $slug) {
            if ($slug === '') continue;
            $path = $dir . $slug . '.md';
            if (file_exists($path)) return self::parse_file($path);
        }
        return [];
    }

    public static function questions_for_msa($text, $board) {
        return self::resolve_board(self::parse_sections_msa($text), $board);
    }

    public static function pick_session_msa($text, $board, $n = 10, $avoid = []) {
        $pool = self::questions_for_msa($text, $board);
        if (empty($pool)) return [];
        return self::pick_from_pool($pool, 'msa:' . sanitize_key((string) $text) . ':' . sanitize_key((string) $board), $n, $avoid);
    }

    /**
     * Spread N picks across category groups (AO, else [Tests …] category), then
     * fill round-robin. Returns FULL question objects (keys + feedback) — the
     * caller MUST strip keys before sending to the client. Shared by MSQ + FQ.
     */
    /**
     * v7.19.961 (Neil — no duplicate questions in any round): drop duplicate question
     * STEMS from a pool. Universal — every quiz AND assessment draws through
     * pick_from_pool, so the guard lives at the root, not per-quiz. Normalises case /
     * whitespace / punctuation so a re-typed duplicate is caught; keeps the FIRST
     * occurrence (bank order). Same-concept-different-wording near-dupes are a bank-
     * authoring concern (handed to chat B), not catchable from the stem alone.
     * v7.19.968: extracted so fq_round_size counts the SAME post-dedup pool the round
     * will serve ($log=false there — the serve-time call is the one that reports).
     */
    private static function dedupe_stems($pool, $id_prefix = '', $log = true) {
        $seen_stems = [];
        $deduped = [];
        foreach ($pool as $q) {
            $stem = strtolower(preg_replace('/\s+/', ' ', trim(preg_replace('/[^a-z0-9]+/i', ' ', (string) ($q['question'] ?? '')))));
            if ($stem !== '' && isset($seen_stems[$stem])) continue;   // exact/near-duplicate stem — skip
            if ($stem !== '') $seen_stems[$stem] = true;
            $deduped[] = $q;
        }
        if ($log && count($deduped) < count($pool) && function_exists('error_log')) {
            error_log('WML quiz: pick_from_pool dropped ' . (count($pool) - count($deduped)) . ' duplicate-stem question(s) from "' . $id_prefix . '" pool (' . count($pool) . ' → ' . count($deduped) . ').');
        }
        return $deduped;
    }

    private static function pick_from_pool($pool, $id_prefix, $n = 5, $avoid = []) {
        $pool = self::dedupe_stems($pool, $id_prefix, true);
        $n = max(1, min($n, count($pool)));
        $avoid = array_flip(array_map('intval', (array) $avoid));   // q_num set served last attempt

        $by_cat = [];
        foreach ($pool as $q) {
            $key = ($q['ao'] ?? '') !== '' ? $q['ao'] : ($q['category'] ?: '_');
            $by_cat[$key][] = $q;
        }
        // Shuffle within each category, then float UNSEEN questions ahead of any served
        // in the student's last attempt (v7.19.744 MSA anti-repeat). Seen ones stay as a
        // fallback so a thin AO bucket (e.g. AO4 = 1 Q) can still fill. Explicit partition
        // (not usort) preserves the shuffle within each partition regardless of PHP sort
        // stability. Empty $avoid (MSQ/FQ) → behaviour byte-unchanged.
        foreach ($by_cat as &$g) {
            shuffle($g);
            if (!empty($avoid)) {
                $unseen = []; $seen = [];
                foreach ($g as $q) {
                    if (isset($avoid[(int) ($q['q_num'] ?? 0)])) $seen[] = $q; else $unseen[] = $q;
                }
                $g = array_merge($unseen, $seen);
            }
        }
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

        // Stamp a stable id + sequential session position, and (v7.19.785) shuffle
        // the OPTION ORDER so the answer isn't always at the same letter across re-sits.
        $out = [];
        foreach (array_values($picked) as $i => $q) {
            $q['id']     = $id_prefix . ':' . $q['q_num'];
            $q['seq']    = $i + 1;
            $q           = self::shuffle_options($q);
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

    /**
     * v7.19.785: shuffle the OPTION ORDER (mcq / select_all / ranking) and remap the
     * correct-letter set + per-distractor why-keys by POSITION, so the answer isn't
     * pinned to the same letter across re-sits. Re-letters the same A.. set in a new
     * order — the scorer reads the SAME shuffled copy that the client sees (the picked
     * set is persisted whole), so keys stay in sync.
     *
     * GUARD: only shuffles when the feedback / why text does NOT cite an option by
     * letter ("(C)", "C)", "B =", "A, B"). Legacy letter-citing banks keep their
     * authored order until rewritten content-referenced — re-lettering can then never
     * desync a letter reference. Fail-safe: any doubt → no shuffle.
     */
    private static function shuffle_options($q) {
        if (empty($q['options']) || !in_array($q['type'], ['mcq', 'select_all', 'ranking'], true)) return $q;
        $letters = array_keys($q['options']);
        if (count($letters) < 2) return $q;
        $cite = $q['feedback'] . ' ' . implode(' ', (array) ($q['why'] ?? [])) . ' ' . ($q['why_generic'] ?? '');
        if (preg_match('/\([A-E]\)|(?<![A-Za-z])[A-E]\s*[\)=,]/', $cite)) return $q;  // letter-cite → leave order

        $perm = range(0, count($letters) - 1);
        shuffle($perm);
        $newOptions = [];
        $oldToNew   = [];
        foreach ($perm as $newPos => $oldPos) {
            $nl = $letters[$newPos];
            $ol = $letters[$oldPos];
            $newOptions[$nl]  = $q['options'][$ol];
            $oldToNew[$ol]    = $nl;
        }
        $q['options'] = $newOptions;
        $q['correct'] = array_map(function ($l) use ($oldToNew) { return $oldToNew[$l] ?? $l; }, $q['correct']);
        if (!empty($q['why'])) {
            $nw = [];
            foreach ($q['why'] as $l => $g) { $nw[$oldToNew[$l] ?? $l] = $g; }
            $q['why'] = $nw;
        }
        return $q;
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
                // v7.19.740: partial credit — exact (incl. UK/US spelling) = full; right word
                // in an imprecise form ("conceptual" for "conceptualised") = half; wrong = 0.
                $fg = self::fill_grade($raw, $q['answer']);
                $marks = ($fg === 'exact') ? $max : (($fg === 'near') ? round($max / 2, 1) : 0.0);
                break;
            case 'ranking':
                // Correct is the authored ORDER (e.g. "C, B, D, A" = weakest→top).
                $pick = self::ordered_letters($raw);
                $key  = $q['correct'];
                if (!empty($pick) && $pick === $key) {
                    $marks = $max;                                   // exact order
                } elseif (!empty($pick) && !empty($key)
                    && count($pick) === count($key)
                    && $pick[0] === $key[0] && end($pick) === end($key)) {
                    $marks = 1.0;                                    // top + bottom correctly placed
                } else {
                    $marks = 0.0;
                }
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
        if (strpos($r, 'rank') !== false) return 'ranking';
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

    /** Ordered A-E letters from raw input, preserving sequence, de-duped (ranking). */
    private static function ordered_letters($raw) {
        if (!preg_match_all('/[A-E]/i', (string) $raw, $m)) return [];
        $out = [];
        foreach ($m[0] as $l) {
            $l = strtoupper($l);
            if (!in_array($l, $out, true)) $out[] = $l;
        }
        return $out;
    }

    private static function norm_tf($raw) {
        $r = strtolower(trim((string) $raw));
        if ($r === '') return '';
        if ($r === 't' || strpos($r, 'true') === 0)  return 'true';
        if ($r === 'f' || strpos($r, 'false') === 0) return 'false';
        return '';
    }

    /**
     * Grade a fill-blank answer (v7.19.740 — partial credit). Returns:
     *   'exact' → full marks: identical, UK/US spelling variant, or key word(s) present as a phrase.
     *   'near'  → half marks: the RIGHT word in an imprecise form ("conceptual" for
     *             "conceptualised" — a prefix of the key) or a 1-2 char typo. Rewards the
     *             concept while still teaching the precise mark-scheme word (the lost mark
     *             + feedback do the teaching). Neil 2026-06-29.
     *   'no'    → 0: a different word ("judicial" for "judiciously").
     */
    private static function fill_grade($raw, $answer) {
        $norm = function ($s) {
            $s = strtolower(trim((string) $s));
            // US→UK so "conceptualized" === "conceptualised" (full marks, not a near-miss).
            $s = preg_replace('/iz(e|ed|es|ing)\b/', 'is$1', $s);
            $s = str_replace(['ization', 'izations'], ['isation', 'isations'], $s);
            $s = preg_replace('/[^a-z0-9\s]/', '', $s);
            return trim(preg_replace('/\s+/', ' ', $s));
        };
        $a = $norm($raw);
        $b = $norm($answer);
        if ($a === '' || $b === '') return 'no';
        if ($a === $b) return 'exact';
        // Key word(s) present as a phrase within the answer = full credit.
        if (strpos(' ' . $a . ' ', ' ' . $b . ' ') !== false) return 'exact';
        // NEAR: same word, imprecise form — one is a prefix of the other (>=4 shared
        // leading chars, e.g. "conceptual" -> "conceptualised"), or a small typo.
        $short = (strlen($a) <= strlen($b)) ? $a : $b;
        $long  = (strlen($a) <= strlen($b)) ? $b : $a;
        if (strlen($short) >= 4 && strpos($long, $short) === 0) return 'near';
        $lev = levenshtein($a, $b);
        if ($lev > 0 && $lev <= 2 && strlen($long) >= 5) return 'near';
        return 'no';
    }

    private static function display_key($q) {
        if (in_array($q['type'], ['mcq', 'select_all', 'ranking'], true)) return implode(', ', $q['correct']);
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
