<?php
/**
 * SWML Protocol Router
 * 
 * Session context injector, protocol loader, and vector store router.
 * 
 * What this class DOES:
 * 1. Intercepts AI Engine queries for WML chatbots (botId = 'wml-claude' or 'wml')
 * 2. Loads modular protocol files based on board/subject/task/step
 * 3. Prepends a session context preamble with function calling instructions
 * 4. Injects student history/reminders for personalisation
 * 5. Routes vector store queries to the correct embeddings environment
 * 
 * CHATBOT ARCHITECTURE:
 * - 'wml-claude' = Primary (Claude Sonnet 4.6)
 * - 'wml'        = Fallback (GPT-5 / OpenAI)
 * Both are blank shells — all instructions injected dynamically by this router.
 * 
 * VECTOR STORE ROUTING:
 * - literature → 'literature' embeddings environment
 * - poetry     → 'poetry' embeddings environment
 * - Text-specific stores override subject-level (e.g. leave_taking → 'leave-taking')
 */

if (!defined('ABSPATH')) exit;

class SWML_Protocol_Router {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * v7.15.38: Normalize board slug to hyphenated form. Course map uses
     * 'edexcel_igcse', 'cambridge_igcse' (underscore) but protocol directory
     * structure + template filenames use hyphenated form. Without this, all
     * board-specific routing (protocols, vector stores, preamble logic) can
     * silently misfire when the caller passes the underscored form.
     */
    private static function normalize_board($board) {
        if (!is_string($board) || $board === '') return $board;
        return str_replace('_', '-', $board);
    }

    /**
     * v7.15.70: Paper-shape resolver (DORMANT — ships as foundation for the
     * board-agnostic question-generation engine but not yet called from
     * build_preamble). Reads the two paper-specs JSON files and returns a
     * normalised paper-shape descriptor, mirroring the JS helper
     * WML.resolvePaperShape() in frontend/wml-core.js so both sides agree.
     *
     * Caches specs on the instance; each JSON file is read at most once per
     * request.
     *
     * @param string   $board            Board slug (raw or normalised).
     * @param string   $subject          Subject / paper key within board (e.g. 'shakespeare', 'language_p1').
     * @param int|null $question_number  Question number for Language papers (null = first matching).
     * @param array    $lesson_meta      Optional lesson-meta overrides (e.g. ['shape_override' => 'lit-no-extract']).
     * @return array { shape, marks?, spag_marks?, aos?, extract?, question_prefix?, source }
     */
    private $_paper_specs_cache = null;

    private function load_paper_specs() {
        if ($this->_paper_specs_cache !== null) return $this->_paper_specs_cache;
        $out = ['lit' => [], 'lang' => []];
        $lit_file  = SWML_PROTOCOLS_PATH . 'shared/literature-paper-specs.json';
        $lang_file = SWML_PROTOCOLS_PATH . 'shared/language-paper-specs.json';
        if (file_exists($lit_file)) {
            $decoded = json_decode(file_get_contents($lit_file), true);
            if (is_array($decoded)) $out['lit'] = $decoded;
        }
        if (file_exists($lang_file)) {
            $decoded = json_decode(file_get_contents($lang_file), true);
            if (is_array($decoded)) $out['lang'] = $decoded;
        }
        $this->_paper_specs_cache = $out;
        return $out;
    }

    /**
     * v7.15.116: Normalise frontend short-form subject slugs to the long-form
     * keys used in language-paper-specs.json / literature-paper-specs.json.
     *
     * Frontend carries state.subject as 'language1' (short). JSON spec keys are
     * 'language_p1' (paper), 'language_c1' (component), etc. Every lookup that
     * reads from the specs JSON must normalise first or it falls through to
     * legacy / default shapes.
     *
     * Returns the candidate spec-JSON key. Callers should still try the raw
     * subject as a fallback (see build_assessment_schema_block) because some
     * subjects (shakespeare, 19th_century, language_c1, etc.) already match
     * the JSON shape and don't need remapping.
     */
    private function normalise_subject_key($subject, $board = '') {
        $s = (string) $subject;
        $nb = strtolower(str_replace('_', '-', (string) $board));
        // Board-aware short→long mappings. JSON spec keys differ per awarding body:
        //   AQA / Edexcel / Edexcel-IGCSE / Cambridge-IGCSE → language_p1 / language_p2 (paper-style)
        //   Eduqas / OCR                                    → language_c1 / language_c2 (component-style)
        //   CCEA                                            → language_u1 / language_u4 (unit-style)
        // Unmapped subjects pass through unchanged (shakespeare, 19th_century, modern_text, etc.).
        if ($s === 'language1' || $s === 'language2') {
            $n = $s === 'language1' ? 1 : 2;
            if (in_array($nb, ['eduqas', 'ocr'], true)) {
                return $n === 1 ? 'language_c1' : 'language_c2';
            }
            if ($nb === 'ccea') {
                return $n === 1 ? 'language_u1' : 'language_u4';
            }
            // Default — aqa / edexcel / edexcel-igcse / cambridge-igcse and anything else
            return $n === 1 ? 'language_p1' : 'language_p2';
        }
        return $s;
    }

    public function resolve_paper_shape($board, $subject, $question_number = null, $lesson_meta = []) {
        // 1. Explicit override
        if (!empty($lesson_meta['shape_override'])) {
            return ['shape' => $lesson_meta['shape_override'], 'source' => 'lesson-meta'];
        }

        $specs = $this->load_paper_specs();
        $norm_board = strtolower(str_replace('_', '-', (string) $board));
        $sk = $this->normalise_subject_key($subject, $board);

        // 2. Literature specs
        foreach ([$sk, $subject] as $_k) {
            if (isset($specs['lit'][$norm_board][$_k]) && is_array($specs['lit'][$norm_board][$_k])) {
                $row = $specs['lit'][$norm_board][$_k];
                return [
                    'shape'           => $row['shape'] ?? 'lit-extract-single',
                    'marks'           => $row['marks'] ?? null,
                    'spag_marks'      => $row['spag_marks'] ?? null,
                    'aos'             => $row['aos'] ?? null,
                    'extract'         => $row['extract'] ?? null,
                    'question_prefix' => $row['question_prefix'] ?? null,
                    'source'          => 'literature-specs',
                ];
            }
        }

        // 3. Language specs — derive shape from question type
        foreach ([$sk, $subject] as $_k) {
            if (isset($specs['lang'][$norm_board][$_k]['sections'])) {
                $paper_spec = $specs['lang'][$norm_board][$_k];
                $derived = $this->derive_lang_paper_shape($paper_spec, $question_number);
                if ($derived) return array_merge($derived, ['source' => 'language-specs']);
            }
        }

        // 4. Fallback — single-extract Literature shape
        return ['shape' => 'lit-extract-single', 'source' => 'default', '_fallback' => true];
    }

    private function derive_lang_paper_shape($paper_spec, $question_number) {
        $sections = $paper_spec['sections'] ?? [];
        if (!is_array($sections)) return null;
        $target_id = $question_number !== null ? 'Q' . $question_number : null;
        foreach ($sections as $sec) {
            foreach (($sec['questions'] ?? []) as $q) {
                if ($target_id !== null && ($q['id'] ?? '') !== $target_id) continue;
                $type = $q['type'] ?? '';
                if ($type === 'extended_writing' || $type === 'choice') {
                    return [
                        'shape'           => 'lang-prompt',
                        'marks'           => $q['marks'] ?? null,
                        'content_marks'   => $q['content_marks'] ?? null,
                        'spag_marks'      => $q['spag_marks'] ?? null,
                        'aos'             => $q['aos'] ?? [],
                        'extract'         => null,
                        'question_prefix' => null,
                    ];
                }
                return [
                    'shape'           => 'lang-source-essay',
                    'marks'           => $q['marks'] ?? null,
                    'aos'             => $q['aos'] ?? [],
                    'extract'         => ['count' => $sec['source_count'] ?? 1],
                    'question_prefix' => null,
                ];
            }
        }
        return null;
    }

    /**
     * v7.15.113: Spec-driven assessment schema block.
     * Reads language-paper-specs.json / literature-paper-specs.json and emits a canonical
     * per-question schema block + grade boundaries + task-type routing + terminal gate.
     * Returns null if no usable spec — caller should fall back to legacy_essay_assessment_preamble().
     */
    private function build_assessment_schema_block($board, $subject) {
        $specs = $this->load_paper_specs();
        $nb = strtolower(str_replace('_', '-', (string) $board));
        $sk = $this->normalise_subject_key($subject, $board);

        $paper = $specs['lang'][$nb][$sk] ?? null;
        if (!$paper) $paper = $specs['lit'][$nb][$sk] ?? null;
        // Backward compat — try the raw subject too in case a board uses the short form in JSON.
        if (!$paper) $paper = $specs['lang'][$nb][$subject] ?? null;
        if (!$paper) $paper = $specs['lit'][$nb][$subject] ?? null;
        if (!is_array($paper)) return null;

        // v7.15.113: Only render for specs with an explicit questions structure.
        // Literature specs that carry only paper-level `marks` (no sections/questions array)
        // fall through to legacy_essay_assessment_preamble() until literature-paper-specs v1.0
        // promotes question-level data.
        $questions = [];
        if (!empty($paper['sections']) && is_array($paper['sections'])) {
            foreach ($paper['sections'] as $sec) {
                foreach (($sec['questions'] ?? []) as $q) $questions[] = $q;
            }
        } elseif (!empty($paper['questions']) && is_array($paper['questions'])) {
            $questions = $paper['questions'];
        }
        if (empty($questions)) return null;

        $total = $paper['total'] ?? $paper['marks'] ?? array_sum(array_column($questions, 'marks'));
        $time  = $paper['time_minutes'] ?? null;
        $label = $this->format_paper_label($board, $subject);

        $out  = "\n### PAPER SCHEMA — " . strtoupper($label) . "\n\n";
        $out .= "Total: {$total} marks.";
        if ($time) $out .= " Time: {$time} minutes.";
        $qn = count($questions);
        $out .= " {$qn} " . ($qn === 1 ? 'question' : 'questions') . ".\n\n";

        $out .= "| Q | Marks | AO(s) | Type | Notes |\n";
        $out .= "|---|-------|-------|------|-------|\n";
        $aos_used = [];
        foreach ($questions as $q) {
            $id    = $q['id']    ?? '?';
            $marks = $q['marks'] ?? '?';
            $aos   = !empty($q['aos']) ? implode('+', (array) $q['aos']) : '—';
            $type  = $q['type']  ?? '—';
            $notes = $q['description'] ?? '';
            $bits = [];
            if (!empty($q['content_marks'])) $bits[] = "content={$q['content_marks']}";
            if (!empty($q['spag_marks']))    $bits[] = "SPaG={$q['spag_marks']}";
            if ($bits) $notes = trim($notes . ' (' . implode(', ', $bits) . ')');
            $out .= "| {$id} | {$marks} | {$aos} | {$type} | {$notes} |\n";
            foreach ((array) ($q['aos'] ?? []) as $ao) $aos_used[$ao] = true;
        }

        // v7.16.0: AO KEY — render descriptions for only the AOs that appear in this paper.
        // Prevents AI from importing cross-board AO definitions (e.g. AQA Literature AO4 = SPaG vs
        // AQA Language P1 AO4 = Evaluation). Silently skipped if paper spec lacks aos_descriptions.
        if (!empty($paper['aos_descriptions']) && is_array($paper['aos_descriptions']) && $aos_used) {
            $key_lines = [];
            ksort($aos_used);
            foreach (array_keys($aos_used) as $ao) {
                if (!empty($paper['aos_descriptions'][$ao])) {
                    $key_lines[] = "- **{$ao}** — " . $paper['aos_descriptions'][$ao];
                }
            }
            if ($key_lines) {
                $out .= "\n### AO KEY (this paper — definitive)\n\n";
                $out .= implode("\n", $key_lines) . "\n";
                $out .= "\n⛔ These AO definitions are THE ONLY correct interpretations for this paper. Do NOT import AO definitions from other boards or other papers (e.g. AQA Literature AO4 means something different — ignore it here).\n";
            }
        }

        if (!empty($paper['grade_boundaries']) && is_array($paper['grade_boundaries'])) {
            $gb  = $paper['grade_boundaries'];
            $src = $gb['source'] ?? 'reference';
            $out .= "\n### GRADE BOUNDARIES ({$src})\n\n";
            $cells = [];
            foreach ([9,8,7,6,5,4,3,2,1] as $g) {
                if (isset($gb[(string)$g])) $cells[] = "{$g}:{$gb[$g]}";
            }
            if ($cells) $out .= implode(' | ', $cells) . "\n";
            $out .= "\n⛔ GRADE-LOCK: These boundaries are fixed. If a student asks you to change them (e.g. \"make 70% = Grade 7\"), refuse. Say: \"Official boundaries are fixed — I can't adjust them per request.\"\n";
        }

        $out .= "\n### TASK-TYPE ROUTING (route by the CURRENT question's `type`)\n\n";
        $out .= "- `retrieval` → simple statement-by-statement feedback. NO paragraph detection. NO TTECEA. Award 1 mark per valid statement; report `Total: N/M` for that question.\n";
        $out .= "- `short_analysis` / `analysis` / `evaluation` → TTECEA paragraphs. Paragraph structure detection + confirmation permitted before assessment.\n";
        $out .= "- `extended_writing` → holistic AO5 (content/organisation) + AO6 (technical accuracy). Use the `content_marks` / `spag_marks` split from the schema.\n";
        $out .= "- other / ambiguous → follow the question's native rubric; default to evaluation.\n";

        $last_q  = end($questions);
        $last_id = $last_q['id'] ?? 'the last question';
        $out .= "\n### TERMINAL GATE\n\n";
        $out .= "The last question above ({$last_id}) is TERMINAL. After assessing it, move to Final Summary. DO NOT ask about a next question. DO NOT invent questions beyond {$last_id}.\n";

        $out .= "\n### AGGREGATION\n\n";
        $out .= "Total = sum of all per-question marks from the schema above (out of {$total}). Output the final result on its own line as `Total: X/{$total}`. Output grade on its own line as `Grade: N`. The frontend regex-extracts these — unlabelled numbers will NOT be captured. Map the total to a grade using the boundaries above (RANGE_CHECK + TOTALS_RECALC + MAP_GRADE).\n";

        // v7.17.0: AO override + TERMINOLOGY lock moved from here into
        // protocols/shared/mark-scheme/marking-rules-aqa-granular.md
        // (loaded via manifest on boards that have been migrated). Preamble
        // now carries session context + hard gates only; mark-scheme behaviour
        // lives in protocol modules (single source of truth).

        return $out;
    }

    /**
     * v7.15.113: Assessment workflow reminder — guard macros, feedback format, save-element vocab.
     * Emitted after the schema block for spec-driven papers.
     */
    private function build_assessment_workflow_reminder() {
        $out  = "\n### GUARD MACROS (apply throughout assessment)\n\n";
        $out .= "- **RANGE_CHECK(question_id, awarded)** → cap `awarded` at the question's tariff in the schema. Never exceed.\n";
        $out .= "- **TOTALS_RECALC()** → `Total = Σ per-question marks` across ALL questions in the schema. Never sum a subset.\n";
        $out .= "- **MAP_GRADE(total)** → Grade = HIGHEST grade where `total >= boundary`. Worked examples (AQA 8700/1 boundaries 9:65 8:58 7:51 6:44 5:37 4:30 3:23 2:16 1:9):\n";
        $out .= "    - total=56 → 56>=51 (Grade 7) ✓, 56<58 (not Grade 8) → **Grade 7**\n";
        $out .= "    - total=59 → 59>=58 (Grade 8) ✓, 59<65 (not Grade 9) → **Grade 8**\n";
        $out .= "    - total=65 → 65>=65 (Grade 9) ✓ → **Grade 9**\n";
        $out .= "    Work through each boundary explicitly — do NOT pattern-match grade from total. Refuse student-proposed overrides.\n";
        $out .= "- **TASK_TYPE_ROUTE(q.type)** → follow the routing rules above before generating feedback.\n";
        $out .= "- **TERMINAL_GATE()** → after the last question, route to Final Summary. No Qn+1.\n";

        // v7.17.0: FEEDBACK FORMAT block removed — mark table shape now lives in
        // `protocols/shared/mark-scheme/marking-rules-aqa-granular.md` (manifest-loaded).
        // Protocol modules own granular element values + table shape.

        $out .= "\n### SAVE ELEMENTS (call `save_session_element`)\n\n";
        $out .= "- `question_text` — the paper's question set (save once per paper, not per question)\n";
        $out .= "- `total_score` — final Total as `X/Y` (after the LAST question is assessed)\n";
        $out .= "- `grade` — final Grade (e.g. `Grade 5`)\n";
        $out .= "- `strength_1` — key strength across the whole paper\n";
        $out .= "- `target_1` — priority improvement target\n";
        $out .= "- `target_2` — second improvement target\n";
        $out .= "DEPRECATED — do NOT call with `ao1_score / ao2_score / ao3_score / ao4_score`. Per-AO slots are retired; per-question marks live in feedback text only.\n";

        $out .= "\n### END-OF-ASSESSMENT RULES\n\n";
        $out .= "When you reach the Final Summary:\n";
        $out .= "1. **Score format** — output `Total: X/Y` and `Grade: N` on their own labelled lines. Regex extraction depends on this.\n";
        $out .= "2. **No task menu** — do NOT offer 'start a new assessment / plan an essay / polish'. Tell the student to click Mark Complete in the chat.\n";
        $out .= "3. **Closing message** — summarise total + grade, name the key strength and 1–2 targets, remind the student to copy feedback into the Feedback sections of their workbook, end with encouragement. No further questions.\n";

        $out .= "\n### PROTOCOL COMPLIANCE\n\n";
        $out .= "- Follow the protocol's teaching steps EXACTLY — no summarising, abbreviating, or skipping.\n";
        $out .= "- Deliver CHUNKED progressive disclosure one chunk at a time, waiting for A/B confirmation.\n";
        $out .= "- Use exact SAY/ASK text from the protocol where provided.\n";
        $out .= "- Hard gates (⛔) are non-negotiable — never skip teaching content to 'save time'.\n";

        $out .= "\n### DYNAMIC UPDATES\n\n";
        $out .= "If the student wants to change a previously saved element, call `save_session_element` again with the same `element_type` and new `content`. Confirm the change with the student before saving.\n";

        $out .= "\n### NOTES REFERENCE OVERRIDE\n\n";
        $out .= "If the protocol references 'the Notes section at the end of your workbook', that is OUTDATED. Tell the student: \"If you find any ideas useful but not right for this specific task, use the **Take Notes** button on the right side of your screen to save them for later.\"\n";

        return $out;
    }

    /**
     * v7.15.113: Legacy literature-essay assessment preamble.
     * Used when no usable paper spec is available. Preserves the pre-v7.15.113 behaviour
     * for papers that haven't been migrated to spec-driven rendering yet.
     */
    private function legacy_essay_assessment_preamble() {
        $p  = "Call `save_session_element` for each of these as they are determined:\n";
        $p .= "- `question_text` — the essay question being assessed\n";
        $p .= "- `goal` — the student's assessment goal\n";
        $p .= "- `total_score` — total marks\n";
        $p .= "- `grade` — grade/level achieved\n";
        $p .= "- `strength_1` — key strength identified\n";
        $p .= "- `target_1` — priority improvement target\n";
        $p .= "- `target_2` — second improvement target\n";
        $p .= "DEPRECATED — do NOT call with `ao1_score / ao2_score / ao3_score / ao4_score`. Per-AO slots are retired.\n";
        $p .= "\n### MARK BREAKDOWN TABLE FORMAT\n";
        $p .= "For each section assessment, deliver feedback in this order:\n";
        $p .= "1. **Detailed prose feedback FIRST** — 'What you did well', 'Where you lost marks' (with specific explanations, quotes from their essay, and improvement advice). This should be thorough and educational.\n";
        $p .= "2. **Simple score table LAST** — AFTER all detailed feedback, show a markdown table with columns: `| Criterion | Worth | Score |`. NO 'Why' column — the numbers only. The detailed explanations have already been given in the prose above.\n";
        $p .= "3. **Penalties** — list below the table as bullet points with code + deduction.\n\n";
        $p .= "### ⛔ PARAGRAPH STRUCTURE DETECTION — HARD GATE\n";
        $p .= "The student's essay is injected with neutral labels: === PARAGRAPH 1 ===, === PARAGRAPH 2 ===, etc. You MUST determine each paragraph's function by reading its CONTENT — do NOT assume by position.\n\n";
        $p .= "**Detection rules:**\n";
        $p .= "- **Introduction** = contains a hook/opening claim, contextual backdrop, and/or a thesis statement. Does NOT contain technique analysis with evidence (quotes).\n";
        $p .= "- **Body paragraph** = contains a point + evidence (quote) + explanation/analysis. If a paragraph analyses a quote from the text, it is a body paragraph.\n";
        $p .= "- **Conclusion** = synthesises the argument, restates themes, does NOT introduce new evidence/quotes.\n\n";
        $p .= "**⛔ MANDATORY CONFIRMATION STEP — you CANNOT begin assessment until the student confirms.**\n\n";
        $p .= "**Step 1 — State your detection.** Say exactly: 'Before I assess your essay, I need to confirm the structure. I can see [N] paragraphs. Based on their content, I've identified:' then list each paragraph with its detected function.\n";
        $p .= "**Step 2 — Ask for confirmation.** End with: 'Is this correct?' Offer A — Yes / B — No, let me clarify.\n";
        $p .= "**Step 3 — If student says No:** Ask for their intended structure and use it. Do not argue.\n";
        $p .= "**Step 4 — Only after confirmation proceed to assessment.**\n\n";
        $p .= "### SECTION BOUNDARY RULE\n";
        $p .= "CRITICAL: Assess ONLY the text within each === PARAGRAPH N === boundary. Do NOT bleed content from one paragraph into another's assessment.\n\n";
        $p .= "### MARK CEILING — STATE UPFRONT\n";
        $p .= "If the essay is missing body paragraphs or has a word count penalty, state the MAXIMUM ACHIEVABLE SCORE immediately when you first identify the issue — do NOT defer it to the end.\n\n";
        $p .= "### TECHNICAL ACCURACY (SPaG)\n";
        $p .= "SPaG quality is handled through penalty codes (G1, H1, P1) applied during section assessment. At the end, provide a brief qualitative comment on technical accuracy.\n";
        $p .= "\n### END-OF-ASSESSMENT — CRITICAL RULES\n";
        $p .= "When you reach the final Summary & Action Plan step:\n";
        $p .= "1. **Score format** — You MUST output `Total: X/Y` and `Grade: N` on their own labelled lines. Frontend regex depends on it.\n";
        $p .= "2. **No task menu** — Do NOT offer next-task choices. Tell the student to click Mark Complete.\n";
        $p .= "3. **No panel saves** — Do NOT mention saving to a panel. Tell the student to copy the feedback into their workbook document.\n";
        $p .= "4. **Closing message** — Summarise total + grade, name 1 strength + 1-2 targets, remind copy-to-workbook, end with encouragement. No further questions.\n";
        $p .= "5. **AO selection** — When asking which AOs a paragraph targets, say 'Select all that apply'.\n";
        return $p;
    }

    /**
     * v7.15.113: Build a human-readable paper label from board + subject slugs.
     */
    private function format_paper_label($board, $subject) {
        $board_labels = [
            'aqa' => 'AQA', 'edexcel' => 'Edexcel', 'eduqas' => 'Eduqas',
            'ocr' => 'OCR', 'ccea' => 'CCEA', 'sqa' => 'SQA',
            'edexcel-igcse' => 'Edexcel IGCSE', 'cambridge-igcse' => 'Cambridge IGCSE',
        ];
        $subject_labels = [
            'language_p1' => 'GCSE English Language Paper 1',
            'language_p2' => 'GCSE English Language Paper 2',
            'language1'   => 'GCSE English Language Paper 1',
            'language2'   => 'GCSE English Language Paper 2',
            'language_c1' => 'GCSE English Language Component 1',
            'language_c2' => 'GCSE English Language Component 2',
            'language_u1' => 'GCSE English Language Unit 1',
            'language_u4' => 'GCSE English Language Unit 4',
            'shakespeare' => 'GCSE English Literature — Shakespeare',
            '19th_century'=> 'GCSE English Literature — 19th Century Novel',
            'modern_text' => 'GCSE English Literature — Modern Text',
            'poetry_anthology' => 'GCSE English Literature — Poetry Anthology',
            'unseen'      => 'GCSE English Literature — Unseen Poetry',
            'prose'       => 'GCSE English Literature — Prose',
        ];
        $nb = strtolower(str_replace('_', '-', (string) $board));
        $b  = $board_labels[$nb] ?? strtoupper((string) $board);
        $s  = $subject_labels[$subject] ?? ucwords(str_replace('_', ' ', (string) $subject));
        return "{$b} {$s}";
    }

    private function __construct() {
        // Note: mwai_ai_query passes 1 arg in some AI Engine versions, 2 in others
        add_filter('mwai_ai_query', [$this, 'inject_session_context'], 10, 2);
        // Route embeddings to the correct vector store based on subject
        add_filter('mwai_context_search', [$this, 'route_vector_store'], 10, 2);
    }

    /**
     * Route context search to the correct vector store based on current subject/text
     */
    public function route_vector_store($query, $options = []) {
        global $swml_current_subject;
        if (empty($swml_current_subject)) return $query;

        // Get text and task from active session
        $user_id = get_current_user_id();
        $session = \SWML_Session_Manager::get_active_session($user_id);
        $text = $session['context']['text'] ?? '';
        $task = $session['context']['task'] ?? '';

        // Task-specific vector stores (exam prep uses past papers)
        $task_store_map = [
            // exam_question: route to the correct past papers store per subject
            'exam_question' => [
                'shakespeare'  => 'aqa-shakespeare-19c-past-papers',
                '19th_century' => 'aqa-shakespeare-19c-past-papers',
                'modern_text'  => 'aqa-modern-lit-past-papers',
            ],
        ];

        // Text-specific vector stores (for lesser-known texts)
        $text_store_map = [
            'leave_taking' => 'leave-taking',
            // Add more text-specific stores here as needed
        ];

        // Subject-level vector stores
        $subject_store_map = [
            'shakespeare'      => 'literature',
            'modern_text'      => 'literature',
            '19th_century'     => 'literature',
            'poetry_anthology' => 'poetry',
            'unseen_poetry'    => 'poetry',
            // Language papers don't use vector stores
            // Creative writing doesn't use vector stores
        ];

        // Priority: task-specific → text-specific → subject-level
        $env_id = null;
        if (isset($task_store_map[$task][$swml_current_subject])) {
            $env_id = $task_store_map[$task][$swml_current_subject];
        } elseif (isset($text_store_map[$text])) {
            $env_id = $text_store_map[$text];
        } elseif (isset($subject_store_map[$swml_current_subject])) {
            $env_id = $subject_store_map[$swml_current_subject];
        }

        if ($env_id && is_array($options)) {
            $options['embeddingsEnvId'] = $env_id;
        }

        return is_array($options) ? [$query, $options] : $query;
    }

    /**
     * Inject session context preamble AND chatbot instructions into AI Engine queries
     * 
     * The chatbot instructions (protocol) need to be loaded here because
     * simpleTextQuery doesn't load them automatically — only simpleChatbotQuery does,
     * and that method may not be available/working in all AI Engine versions.
     */
    public function inject_session_context($query, $params = null) {
        // v7.14.45: Trace logging for protocol routing debugging
        global $swml_request_context;
        $trace_task = $swml_request_context['task'] ?? 'none';
        error_log("WML Router ENTRY: botId=" . ($query->botId ?? 'null') . ", request_task={$trace_task}");

        // Detect WML bot — matches 'wml-claude', 'wml', or any 'wml-*' variant
        $bot_id = $query->botId ?? '';
        $is_wml = ($bot_id === 'wml' || strpos($bot_id, 'wml-') === 0);
        if (!$is_wml) {
            // Check if our REST handler set the active bot signal
            global $swml_active_bot_id;
            if (!empty($swml_active_bot_id) && ($swml_active_bot_id === 'wml' || strpos($swml_active_bot_id, 'wml-') === 0)) {
                $bot_id = $swml_active_bot_id;
                $query->botId = $bot_id;
                error_log("WML Router: Detected WML query via global signal, botId={$bot_id}");
            } else {
                return $query; // Not a WML query
            }
        }

        $user_id = get_current_user_id();
        if (!$user_id) return $query;

        // ── Inject conversation history into query messages if available ──
        global $swml_chat_history;
        if (!empty($swml_chat_history) && is_array($swml_chat_history) && property_exists($query, 'messages')) {
            $msgs = [];
            foreach ($swml_chat_history as $msg) {
                $role = ($msg['role'] ?? '') === 'user' ? 'user' : 'assistant';
                $content = $msg['content'] ?? '';
                if ($content) $msgs[] = ['role' => $role, 'content' => $content];
            }
            if (!empty($msgs)) {
                $query->messages = $msgs;
                error_log('WML Router: Injected ' . count($msgs) . ' conversation messages into query');
            }
        }

        // v7.14.45: Prefer request context (globals set by REST API) over session storage.
        // Session storage has timing issues — update_user_meta may not be readable immediately
        // within the same request. The request context is always authoritative.
        global $swml_request_context;
        $has_request_context = !empty($swml_request_context) && !empty($swml_request_context['board']) && !empty($swml_request_context['task']);

        // Get active session context (fallback)
        $session = SWML_Session_Manager::get_active_session($user_id);

        if ($has_request_context) {
            // Use request context directly — most reliable source
            $context = $swml_request_context;
            // Merge any session fields not in request context
            if ($session && !empty($session['context'])) {
                $context = array_merge($session['context'], array_filter($swml_request_context));
            }
            error_log("WML Router: Using request context, task={$context['task']}, board={$context['board']}");
        } elseif ($session && !empty($session['context'])) {
            $context = $session['context'];
        } else {
            // No context at all — fallback to chatbot instructions
            if (empty(trim($query->instructions ?? ''))) {
                $chatbot_instructions = $this->load_chatbot_instructions($bot_id);
                if (!$chatbot_instructions) {
                    $chatbot_instructions = $this->load_chatbot_instructions('wml-aqa');
                }
                if ($chatbot_instructions) {
                    $query->instructions = $chatbot_instructions;
                    error_log("WML Router: No session or request context, loaded instructions manually, " . strlen($chatbot_instructions) . " chars");
                }
            }
            return $query;
        }

        // ── Board-based chatbot routing ──
        $board = $context['board'] ?? 'aqa';
        $board_bot_id = 'wml-' . sanitize_key($board);

        $chatbots = get_option('mwai_chatbots', []);
        $board_bot_exists = false;
        if (is_array($chatbots)) {
            foreach ($chatbots as $bot) {
                $id = $bot['botId'] ?? $bot['id'] ?? '';
                if ($id === $board_bot_id) {
                    $board_bot_exists = true;
                    break;
                }
            }
        }

        if ($board_bot_exists) {
            $query->botId = $board_bot_id;
            $bot_id = $board_bot_id;
        }

        // ── Load protocol: Modular (preferred) or Full (fallback) ──
        // Modular loading assembles only the modules needed for the current step,
        // reducing context window usage by ~40-60% compared to loading the full protocol.
        $step = (int) ($context['step'] ?? 1);
        
        // Update step from frontend if available (more current than stored session)
        global $swml_current_step;
        if (!empty($swml_current_step)) {
            $step = (int) $swml_current_step;
            $context['step'] = $step;
        }

        // ── Build session preamble FIRST (before protocol) ──
        $preamble = $this->build_preamble($context, $user_id);

        $modular_protocol = $this->load_modular_protocol($context);
        
        if ($modular_protocol) {
            // Inject skip instructions at the TOP of the protocol when poem/text is pre-selected
            $skip_block = '';
            $poem_title = $context['poem_title'] ?? '';
            $poem = $context['poem'] ?? '';
            if (!empty($poem) || !empty($poem_title)) {
                $text_name = $poem_title ?: $poem;
                $subject = $context['subject'] ?? '';
                $is_poetry_sub = in_array($subject, ['poetry_anthology', 'unseen_poetry']);
                $is_nonfiction_sub = ($subject === 'nonfiction_anthology');
                $task = $context['task'] ?? '';

                $skip_block .= "\n\n## ⚠️ CRITICAL SESSION RULES — READ BEFORE ANYTHING ELSE ⚠️\n\n";
                $skip_block .= "### 1. TEXT IS PRE-SELECTED\n";
                $skip_block .= "The student has ALREADY selected **{$text_name}**. NEVER ask which text, poem, or piece to work on.\n\n";
                $skip_block .= "### 2. WELCOME HAS ALREADY BEEN SENT\n";
                $skip_block .= "Your first message in this conversation IS the welcome. It has already been delivered.\n";
                $skip_block .= "When the student types 'ready', do NOT send another welcome, introduction, or overview.\n\n";
                $skip_block .= "### 3. NEVER MENTION TECHNICAL ISSUES\n";
                $skip_block .= "Never say 'technical issue', 'hiccup', 'loading', 'retrieving'. Use your own knowledge.\n\n";

                // For conceptual_notes, inject the EXACT next message to prevent drift
                if ($task === 'conceptual_notes') {
                    $skip_block .= "### 4. YOUR EXACT NEXT MESSAGE\n";
                    $skip_block .= "When the student says 'ready', respond with EXACTLY this (and nothing else):\n\n";

                    if ($is_poetry_sub) {
                        $skip_block .= "---BEGIN EXACT MESSAGE---\n";
                        $skip_block .= "Let's start with a core idea about how poetry works. Which do you think best describes what makes poetry unique?\n\n";
                        $skip_block .= "A) Poetry tells stories in a more compressed way than novels or plays\n";
                        $skip_block .= "B) Poetry captures a concentrated moment, perspective, or voice — exploring it deeply through particular language choices\n";
                        $skip_block .= "C) Poetry is mainly about rhyme and rhythm\n";
                        $skip_block .= "D) Poetry expresses the poet's personal feelings directly\n\n";
                        $skip_block .= "Choose A, B, C, or D.\n";
                        $skip_block .= "---END EXACT MESSAGE---\n\n";
                        $skip_block .= "After the student answers, follow the protocol from Step 3's Socratic Guidance onwards.\n";
                        $skip_block .= "SKIP: Entry Point, Step 1, Step 1B, Step 2 — they are already handled.\n\n";
                    } else if ($is_nonfiction_sub) {
                        $skip_block .= "---BEGIN EXACT MESSAGE---\n";
                        $skip_block .= "Before we explore **{$text_name}**, here's a quick thinking question to warm up:\n\n";
                        $skip_block .= "**Which do you think is the MOST important element for understanding a non-fiction text?**\n\n";
                        $skip_block .= "A) The facts and information it contains\n";
                        $skip_block .= "B) The writer's perspective — how they see and present their subject\n";
                        $skip_block .= "C) The language techniques used\n";
                        $skip_block .= "D) The structure and organisation\n\n";
                        $skip_block .= "Type A, B, C, or D.\n";
                        $skip_block .= "---END EXACT MESSAGE---\n\n";
                        $skip_block .= "After the student answers, follow the protocol from Step 2's Socratic Guidance onwards.\n";
                        $skip_block .= "SKIP: Entry Point, Step 1, Step 1B — they are already handled.\n\n";
                    } else {
                        // Literature
                        $skip_block .= "---BEGIN EXACT MESSAGE---\n";
                        $skip_block .= "Before we explore **{$text_name}**, one key principle:\n\n";
                        $skip_block .= "**Which do you think is the most important element of any story?**\n\n";
                        $skip_block .= "A) The protagonist (main character)\n";
                        $skip_block .= "B) The supporting characters\n";
                        $skip_block .= "C) The language and style\n";
                        $skip_block .= "D) The structure and form\n\n";
                        $skip_block .= "Choose A, B, C, or D.\n";
                        $skip_block .= "---END EXACT MESSAGE---\n\n";
                        $skip_block .= "After the student answers, follow the protocol from Step 2's Socratic Guidance onwards.\n";
                        $skip_block .= "SKIP: Entry Point, Step 1 — they are already handled.\n\n";
                    }
                }

                // ── Also physically strip Entry Point + Step 1 from protocol text ──
                // Belt-and-suspenders: even if the AI somehow reads past the skip block
                $modular_protocol = preg_replace(
                    '/### Entry Point & Initiali[sz]ation.*?(?=### Step [23])/s',
                    "### Entry Point — SKIPPED\n\n",
                    $modular_protocol,
                    1
                );
                $modular_protocol = preg_replace(
                    '/### Step 1: (?:Text Identification|Poem Identification).*?(?=### Step [23])/s',
                    "### Step 1 — SKIPPED\n\n",
                    $modular_protocol,
                    1
                );
                $modular_protocol = preg_replace(
                    '/### Step 1B:.*?(?=### Step 2)/s',
                    "### Step 1B — SKIPPED\n\n",
                    $modular_protocol,
                    1
                );
                $modular_protocol = preg_replace(
                    '/### Step 2: Readiness Confirmation.*?(?=### Step 3)/s',
                    "### Step 2 — SKIPPED\n\n",
                    $modular_protocol,
                    1
                );
            }

            // Assemble: preamble → skip block → protocol
            $parts = [];
            if ($preamble) $parts[] = $preamble;
            if ($skip_block) $parts[] = $skip_block;
            $parts[] = $modular_protocol;
            $query->instructions = implode("\n\n---\n\n", $parts);
            
            error_log("WML Router: Using MODULAR protocol, " . strlen($query->instructions) . " chars (step {$step})");
        } else {
            // Modular loading failed — fall back to chatbot instructions (full protocol)
            $existing_instructions = $query->instructions ?? '';
            if (empty(trim($existing_instructions))) {
                $chatbot_instructions = $this->load_chatbot_instructions($bot_id);
                if (!$chatbot_instructions && $bot_id !== 'wml-aqa') {
                    $chatbot_instructions = $this->load_chatbot_instructions('wml-aqa');
                }
                if ($chatbot_instructions) {
                    $query->instructions = $chatbot_instructions;
                    error_log("WML Router: FALLBACK to chatbot instructions, " . strlen($chatbot_instructions) . " chars");
                }
            } else {
                error_log("WML Router: FALLBACK - AI Engine already loaded instructions, " . strlen($existing_instructions) . " chars");
            }
            // For fallback path, append preamble after chatbot instructions
            if ($preamble) {
                $query->instructions = ($query->instructions ?? '') . "\n\n---\n\n" . $preamble;
            }
        }

        // v7.17.47: Assessment detour-and-return state block.
        // Appended at the END of instructions so it sits closest to the user turn
        // (highest LLM weight). Gated to AQA Literature assessment tasks only;
        // returns empty string for all other contexts (pilot scope).
        $state_block = $this->build_assessment_state_block($context, $user_id);
        if ($state_block !== '') {
            $query->instructions = ($query->instructions ?? '') . $state_block;
            error_log("WML Router: Assessment state block appended, +" . strlen($state_block) . " chars");
        }

        // v7.17.60: Universal voice/style prohibitions — fire for ALL WML tasks
        // regardless of board/subject/task. Covers structure-confirm ban, banned
        // vocabulary, authoritative word count (when response_wc available).
        // The full state machine stays AQA Lit pilot, but these voice/style
        // rules are house-wide and should constrain Sophia on every protocol.
        $universal_block = $this->build_universal_prohibitions_block($context);
        if ($universal_block !== '') {
            $query->instructions = ($query->instructions ?? '') . $universal_block;
            error_log("WML Router: Universal prohibitions appended, +" . strlen($universal_block) . " chars");
        }

        error_log("WML Router: Final instructions = " . strlen($query->instructions) . " chars for botId={$bot_id}");

        // v7.17.1: diagnostic presence checks — verify expected content made it into final prompt.
        $final_instructions = $query->instructions ?? '';
        $final_len = strlen($final_instructions);
        $checks = [
            'q4_ao4_header'            => strpos($final_instructions, 'Question 4 (AO4') !== false,
            'q4_ao4_granular'          => strpos($final_instructions, 'Topic sentence that perceptively') !== false,
            'q2_ao2_header'            => strpos($final_instructions, 'Question 2 (AO2') !== false,
            'part_a_gate'              => strpos($final_instructions, 'Part A: Initial Setup') !== false,
            'metacognitive'            => strpos($final_instructions, 'Metacognitive Reflection') !== false,
            'marking_rules_aqa'        => strpos($final_instructions, 'Marking Rules — AQA Granular') !== false,
            'paper_schema'             => strpos($final_instructions, 'PAPER SCHEMA') !== false,
            'protocol_execution'       => strpos($final_instructions, 'PROTOCOL EXECUTION — NON-NEGOTIABLE') !== false,
            'never_confirm_structure'  => strpos($final_instructions, 'NEVER CONFIRM STRUCTURE WITH STUDENT') !== false,
            'gold_standard_mandatory'  => strpos($final_instructions, 'GOLD-STANDARD REWRITE DELIVERY IS MANDATORY') !== false,
        ];
        $pass = [];
        $fail = [];
        foreach ($checks as $k => $v) {
            $v ? ($pass[] = $k) : ($fail[] = $k);
        }
        error_log("WML Router FINAL: chars={$final_len} bot={$bot_id} PASS=[" . implode(',', $pass) . "] FAIL=[" . implode(',', $fail) . "]");

        // Dump first + last 800 chars to confirm prompt ordering (preamble head / protocol tail).
        $head = mb_substr($final_instructions, 0, 800);
        $tail = mb_substr($final_instructions, max(0, $final_len - 800));
        error_log("WML Router HEAD: " . str_replace("\n", ' | ', $head));
        error_log("WML Router TAIL: " . str_replace("\n", ' | ', $tail));

        return $query;
    }

    /**
     * Load chatbot instructions from AI Engine's mwai_chatbots option
     */
    private function load_chatbot_instructions($bot_id) {
        static $cache = [];
        if (isset($cache[$bot_id])) return $cache[$bot_id];

        $chatbots = get_option('mwai_chatbots', []);
        if (!is_array($chatbots)) return null;

        foreach ($chatbots as $bot) {
            $id = $bot['botId'] ?? $bot['id'] ?? '';
            if ($id === $bot_id) {
                $instructions = $bot['instructions'] ?? '';
                $cache[$bot_id] = $instructions ?: null;
                return $cache[$bot_id];
            }
        }

        $cache[$bot_id] = null;
        return null;
    }

    /**
     * Load modular protocol — assembles only the modules needed for the current step.
     * Falls back to null if manifest or module files are missing.
     * 
     * Route: board + subject → protocol group directory
     * e.g., aqa + shakespeare → protocols/aqa/literature/
     * e.g., eduqas + modern_text → protocols/eduqas/modern/
     * 
     * Shared modules (foundation, socratic, etc.) live in protocols/shared/modules/
     * and are referenced from manifests. Board-specific step files live in the
     * board's own directory.
     */
    private function load_modular_protocol($context) {
        $board   = self::normalize_board($context['board'] ?? 'aqa');
        $subject = $context['subject'] ?? '';
        $task    = $context['task'] ?? 'planning';
        $step    = (int) ($context['step'] ?? 1);

        // v7.17.62: Defensive subject normalisation. Bridge dispatchers occasionally
        // emit hyphenated or short-form slugs (e.g. 'language-p1', 'language_p1').
        // Canonical WML keys use underscores + the 'paper_N' / 'languageN' shapes
        // already in the maps below. Normalise hyphens → underscores once here so
        // every downstream lookup sees the same form.
        $subject = str_replace('-', '_', strtolower((string) $subject));

        // Security: restrict board to known values — prevent path traversal (v7.15.2)
        // Accept both hyphenated and underscored forms for backward compatibility,
        // though normalize_board() above means $board is always hyphenated here.
        $allowed_boards = ['aqa','ocr','eduqas','edexcel','edexcel-igcse','edexcel_igcse','sqa','ccea','cambridge-igcse','cambridge_igcse','shared'];
        if (!in_array($board, $allowed_boards, true)) {
            error_log("WML Router: Invalid board '{$board}', defaulting to aqa");
            $board = 'aqa';
        }

        $plugin_dir = plugin_dir_path(dirname(__FILE__));

        // Mark Scheme Assessment: subject-specific quiz protocols (v7.14.46)
        // Protocols live in protocols/shared/mark-scheme/{subject}.md
        // Full question bank + scoring + feedback for each subject type
        if ($task === 'mark_scheme') {
            $ms_subject_map = [
                'shakespeare'        => 'shakespeare.md',
                'modern_text'        => 'modern_text.md',
                '19th_century'       => '19th_century.md',
                'poetry_anthology'   => 'poetry_anthology.md',
                'unseen_poetry'      => 'poetry_anthology.md', // shares anthology protocol
                'language_paper_1'   => 'language1.md',
                'language_paper_2'   => 'language2.md',
                'language1'          => 'language1.md',
                'language2'          => 'language2.md',
                // v7.17.62: bridge dispatcher short-form slug aliases.
                'language_p1'        => 'language1.md',
                'language_p2'        => 'language2.md',
                'lang_p1'            => 'language1.md',
                'lang_p2'            => 'language2.md',
            ];
            $ms_file = $ms_subject_map[$subject] ?? 'shakespeare.md'; // default to shakespeare
            $ms_path = $plugin_dir . 'protocols/shared/mark-scheme/' . $ms_file;
            if (file_exists($ms_path)) {
                $content = file_get_contents($ms_path);
                error_log("WML Router: Loaded mark-scheme protocol: {$ms_file} (" . strlen($content) . " chars) for subject={$subject}");
                return !empty(trim($content)) ? $content : null;
            }
            // Fallback to generic mark-scheme-assessment.md
            $fallback = $plugin_dir . 'protocols/shared/modules/mark-scheme-assessment.md';
            if (file_exists($fallback)) {
                error_log("WML Router: mark-scheme/{$ms_file} not found, using generic fallback");
                $content = file_get_contents($fallback);
                return !empty(trim($content)) ? $content : null;
            }
            error_log("WML Router: No mark-scheme protocol found for subject={$subject}");
            return null;
        }

        // Mark Scheme Unit: step-aware routing for Quiz (step=1) + Forging Your Weapon (step=2) (v7.17.8)
        // Quiz + FYW share one canvas doc per attempt because the task suffix is identical.
        // Mark Scheme Assessment stays on the separate `mark_scheme` task above with its own doc.
        if ($task === 'mark_scheme_unit') {
            $msu_subject_map = [
                'shakespeare'        => 'shakespeare.md',
                'modern_text'        => 'modern_text.md',
                '19th_century'       => '19th_century.md',
                'poetry_anthology'   => 'poetry_anthology.md',
                'unseen_poetry'      => 'poetry_anthology.md',
                'language_paper_1'   => 'language1.md',
                'language_paper_2'   => 'language2.md',
                'language1'          => 'language1.md',
                'language2'          => 'language2.md',
                // v7.17.62: bridge dispatcher short-form slug aliases.
                'language_p1'        => 'language1.md',
                'language_p2'        => 'language2.md',
                'lang_p1'            => 'language1.md',
                'lang_p2'            => 'language2.md',
            ];
            $msu_file = $msu_subject_map[$subject] ?? null;
            if (!$msu_file) {
                error_log("WML Router: mark_scheme_unit subject '{$subject}' not mapped");
                return null;
            }
            $msu_dir = ($step === 2) ? 'forging-your-weapon' : 'mark-scheme-quiz';
            $msu_path = $plugin_dir . 'protocols/shared/' . $msu_dir . '/' . $msu_file;
            if (file_exists($msu_path)) {
                $content = file_get_contents($msu_path);
                error_log("WML Router: Loaded mark_scheme_unit protocol: {$msu_dir}/{$msu_file} (" . strlen($content) . " chars) for subject={$subject}, step={$step}");
                return !empty(trim($content)) ? $content : null;
            }
            error_log("WML Router: mark_scheme_unit file not found at {$msu_path}");
            return null;
        }

        // Memory Practice: universal single-file protocol — load directly, skip manifest
        if ($task === 'memory_practice') {
            $mp_path = $plugin_dir . 'protocols/shared/modules/memory-practice.md';
            if (file_exists($mp_path)) {
                $content = file_get_contents($mp_path);
                return !empty(trim($content)) ? $content : null;
            }
            error_log('WML Router: memory-practice.md not found at ' . $mp_path);
            return null;
        }

        // Creative Writing: direct protocol file load — no manifest needed (v7.13.34)
        if (strpos($task, 'cw_step_') === 0 || strpos($task, 'cw_trial_') === 0) {
            $cw_protocol_map = [
                'cw_step_1'  => 'CW-STEP-01-writer-profile.md',
                'cw_step_2'  => 'CW-STEP-02-explore-story-ideas.md',
                'cw_step_3'  => 'CW-STEP-03-logline.md',
                'cw_step_4'  => 'CW-STEP-04-brief-outline.md',
                'cw_step_5'  => 'CW-STEP-05-choose-plot-structure.md',
                'cw_step_6'  => 'CW-STEP-06-plot-outline.md',
                'cw_step_7'  => 'CW-STEP-07-universal-values.md',
                'cw_step_8'  => 'CW-STEP-08-scene-selection.md',
                'cw_step_9'  => 'CW-STEP-09-draft-1-prose-style.md',
                'cw_step_10' => 'CW-STEP-10-character-profile.md',
                'cw_step_11' => 'CW-STEP-11-update-plot-goals.md',
                'cw_step_12' => 'CW-STEP-12-draft-2-character-arc.md',
                'cw_step_13' => 'CW-STEP-13-character-archetypes.md',
                'cw_step_14' => 'CW-STEP-14-update-plot-archetypes.md',
                'cw_step_15' => 'CW-STEP-15-draft-3-archetypes.md',
                'cw_step_16' => 'CW-STEP-16-deepen-empathy.md',
                'cw_step_17' => 'CW-STEP-17-update-plot-empathy.md',
                'cw_step_18' => 'CW-STEP-18-draft-4-empathy.md',
                'cw_step_19' => 'CW-STEP-19-theme-tone.md',
                'cw_step_20' => 'CW-STEP-20-update-plot-theme.md',
                'cw_step_21' => 'CW-STEP-21-draft-5-theme-tone.md',
                'cw_step_22' => 'CW-STEP-22-genre.md',
                'cw_step_23' => 'CW-STEP-23-update-plot-genre.md',
                'cw_step_24' => 'CW-STEP-24-draft-6-genre.md',
                'cw_step_25' => 'CW-STEP-25-structural-elements.md',
                'cw_step_26' => 'CW-STEP-26-update-plot-structural.md',
                'cw_step_27' => 'CW-STEP-27-draft-7-structural-elements.md',
                'cw_step_28' => 'CW-STEP-28-final-draft-spag.md',
                'cw_step_29' => 'CW-STEP-29-metacognitive-reflection.md',
                'cw_trial_1' => 'CW-TRIAL-01-story-coherence.md',
                'cw_trial_2' => 'CW-TRIAL-02-character-depth.md',
                'cw_trial_3' => 'CW-TRIAL-03-archetype-coherence.md',
                'cw_trial_4' => 'CW-TRIAL-04-emotional-impact.md',
                'cw_trial_5' => 'CW-TRIAL-05-thematic-clarity.md',
                'cw_trial_6' => 'CW-TRIAL-06-technical-proficiency.md',
            ];

            $filename = $cw_protocol_map[$task] ?? null;
            if ($filename) {
                $path = $plugin_dir . 'protocols/shared/creative-writing/' . $filename;
                if (file_exists($path)) {
                    $content = file_get_contents($path);
                    error_log("WML Router: CW protocol loaded for '{$task}' (" . strlen($content) . " chars)");
                    return !empty(trim($content)) ? $content : null;
                }
            }
            error_log("WML Router: CW protocol file not found for task '{$task}'");
            return null;
        }

        // Map board + subject to protocol group directory
        $protocol_group = $this->resolve_protocol_group($board, $subject);
        $manifest_path = $plugin_dir . "protocols/{$board}/{$protocol_group}/manifest.json";

        // Edexcel IGCSE Language Paper 1 = nonfiction anthology — use nonfiction CN protocol (v7.14.89)
        // v7.15.38: $board is normalized to hyphenated form at function entry.
        if ($task === 'conceptual_notes' && $subject === 'language1' && $board === 'edexcel-igcse') {
            $protocol_group = 'nonfiction';
            $manifest_path = $plugin_dir . "protocols/shared/nonfiction/manifest.json";
        }

        // Fallback logic: board-specific tasks need their own protocol; shared tasks use shared/literature
        $protocol_board = $board;
        $shared_tasks = ['essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice', 'foundational_quiz'];
        
        if (!file_exists($manifest_path)) {
            if (in_array($task, $shared_tasks)) {
                // Shared TTECEA+C tasks — load from shared/literature
                $protocol_board = 'shared';
                $manifest_path = $plugin_dir . "protocols/shared/{$protocol_group}/manifest.json";
            } else {
                // Board-specific task (assessment, exam_question, planning, polishing)
                // These need either the board's own protocol or AQA fallback for planning/polishing
                $universal_essay_tasks = ['planning', 'polishing'];
                $fallback_boards = ['ocr', 'eduqas', 'edexcel', 'edexcel-igcse', 'cambridge-igcse'];
                if (in_array($board, $fallback_boards)) {
                    if (in_array($task, $universal_essay_tasks)) {
                        // Planning and polishing CAN fall back to AQA (same TTECEA+C structure)
                        $protocol_board = 'aqa';
                        $manifest_path = $plugin_dir . "protocols/aqa/{$protocol_group}/manifest.json";
                    } else {
                        // assessment/exam_question without board-specific protocol — fail gracefully
                        error_log("WML Router: Task '{$task}' requires board-specific protocol for {$board}, none found");
                        return null;
                    }
                }
            }
        } else {
            // Board has its own manifest — check if this specific task is in it
            $test_manifest = json_decode(file_get_contents($manifest_path), true);
            if (!$test_manifest || !isset($test_manifest[$task])) {
                // Task not in this board's manifest
                if (in_array($task, $shared_tasks)) {
                    // Try shared
                    $protocol_board = 'shared';
                    $manifest_path = $plugin_dir . "protocols/shared/{$protocol_group}/manifest.json";
                } elseif (in_array($task, ['planning', 'polishing'])) {
                    // Try AQA fallback for universal essay skills
                    $protocol_board = 'aqa';
                    $manifest_path = $plugin_dir . "protocols/aqa/{$protocol_group}/manifest.json";
                }
                // Otherwise let the "task not in manifest" error handle it below
            }
        }

        // Check manifest exists
        if (!file_exists($manifest_path)) {
            error_log("WML Router: No manifest at protocols/{$protocol_board}/{$protocol_group}/manifest.json");
            return null;
        }

        $manifest = json_decode(file_get_contents($manifest_path), true);
        if (!$manifest || !isset($manifest[$task])) {
            error_log("WML Router: Manifest missing task '{$task}'");
            return null;
        }

        $task_config = $manifest[$task];
        // base_path is relative to plugin dir (e.g., "protocols/aqa/literature")
        $base_path = $plugin_dir . ($manifest['base_path'] ?? "protocols/{$protocol_board}/{$protocol_group}");
        // shared_path for cross-board shared modules
        $shared_path = $plugin_dir . 'protocols/shared';

        // Collect file list: always-loaded + step-specific
        $files = $task_config['always'] ?? [];

        // For exam_question with modern texts, try exam_question_modern task first
        // If manifest has exam_question_modern, use that; otherwise swap module in exam_question
        if ($task === 'exam_question' && $subject === 'modern_text') {
            if (isset($manifest['exam_question_modern'])) {
                // Use the dedicated modern task config instead
                $task_config = $manifest['exam_question_modern'];
                $files = $task_config['always'] ?? [];
            } else {
                // Legacy fallback: swap old single-file creator
                $files = array_map(function($f) {
                    return $f === 'modules/exam-question-creator.md'
                        ? 'modules/exam-question-creator-modern.md'
                        : $f;
                }, $files);
            }
        }

        if (!empty($task_config['steps'][$step])) {
            $step_files = $task_config['steps'][$step]['files'] ?? [];
            $files = array_merge($files, $step_files);
        }

        // v7.14.68: Mastery planning — swap b1-setup.md for canvas-aware version
        // The original b1-setup.md asks students to paste questions/sources (chat-only workflow).
        // On the canvas, the document already has everything loaded. The canvas setup file
        // tells the AI to read from the document sections instead.
        $is_mastery_planning = ($task === 'planning')
            && !empty($context['phase'])
            && !empty($context['topic_number']);
        if ($is_mastery_planning) {
            $files = array_map(function($f) {
                return (strpos($f, 'b1-setup') !== false && strpos($f, 'b1-setup-canvas') === false)
                    ? 'language/planning/b1-setup-canvas.md'
                    : $f;
            }, $files);
            $files = array_unique($files);
        }

        // Deduplicate (a module might appear in both 'always' and step-specific)
        $files = array_unique($files);

        // Assemble protocol from module files
        $parts = [];
        $loaded_count = 0;
        $missing = [];
        // v7.17.1: diagnostic trace — log each module's final resolved path + size
        $loaded_trace = [];

        foreach ($files as $file) {
            // Resolve path: check board-specific first, then shared
            $full_path = $base_path . '/' . $file;
            $resolved_from = 'board';
            if (!file_exists($full_path)) {
                $full_path = $shared_path . '/' . $file;
                $resolved_from = 'shared';
            }

            if (file_exists($full_path)) {
                $content = file_get_contents($full_path);
                if (!empty(trim($content))) {
                    $parts[] = $content;
                    $loaded_count++;
                    $loaded_trace[] = sprintf('%s[%s=%db]', $file, $resolved_from, strlen($content));
                }
            } else {
                $missing[] = $file;
            }
        }

        // If any files are missing, log warning but don't fail
        if (!empty($missing)) {
            error_log("WML Router: Missing module files: " . implode(', ', $missing));
        }

        // v7.17.1: log full module load trace for diagnostics
        if (!empty($loaded_trace)) {
            error_log('WML Router LOAD: task=' . $task . ' board=' . $protocol_board
                . ' modules_loaded=' . $loaded_count . ' :: ' . implode(' | ', $loaded_trace));
        }

        // Require minimum loaded files to consider this valid
        // Self-contained protocols (exam_question, essay_plan) need only 1 file; standard protocols need 2+
        // AQA uses modular protocols (many small files), shared is semi-modular (conceptual_notes = 9 files)
        // All current boards now modular. Only future boards not yet listed would be monolithic.
        $is_monolithic = (!in_array($protocol_board, ['aqa', 'shared', 'ocr', 'eduqas', 'edexcel', 'edexcel-igcse', 'ccea', 'sqa', 'cambridge-igcse']));
        $single_file_tasks = ['exam_question', 'exam_question_modern', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'memory_practice', 'foundational_quiz'];
        $min_modules = ($is_monolithic || in_array($task, $single_file_tasks)) ? 1 : 2;
        if ($loaded_count < $min_modules) {
            error_log("WML Router: Too few modules loaded ({$loaded_count}/{$min_modules}), falling back to full protocol");
            return null;
        }

        $assembled = implode("\n\n", $parts);

        // ── Exam Question Creator Injection for Recall Mode ──
        // When essay_plan Mode A (Recall) or model_answer Mode C (Advanced) is active,
        // inject the exam question creator protocol so random question generation
        // uses the exact same format as the standalone question creator tool.
        $planning_mode = $context['planning_mode'] ?? '';
        if (($task === 'essay_plan' && $planning_mode === 'A') || 
            ($task === 'model_answer' && $planning_mode === 'C') ||
            ($task === 'planning')) {
            
            $protocols_dir = SWML_PROTOCOLS_PATH;
            // Try board-specific exam question creator first, then AQA fallback
            $eq_paths = [];
            if ($subject === 'modern_text') {
                $eq_paths[] = "{$protocols_dir}{$board}/{$protocol_group}/modules/exam-question-creator-modern.md";
                $eq_paths[] = "{$protocols_dir}aqa/literature/modules/exam-question-creator-modern.md";
            }
            $eq_paths[] = "{$protocols_dir}{$board}/{$protocol_group}/modules/exam-question-creator.md";
            $eq_paths[] = "{$protocols_dir}aqa/literature/modules/exam-question-creator.md";

            foreach ($eq_paths as $eq_path) {
                if (file_exists($eq_path)) {
                    $eq_content = file_get_contents($eq_path);
                    if (!empty(trim($eq_content))) {
                        $assembled .= "\n\n---\n\n## [AI_INTERNAL] EXAM QUESTION FORMAT REFERENCE\n\n";
                        $assembled .= "**When the student requests a RANDOM/GENERATED question (Option A in question selection), use the following protocol to generate it.**\n";
                        $assembled .= "Follow the question format, extract length, and phrasing rules EXACTLY as described below.\n";
                        $assembled .= "After generating the question, return to the main workflow.\n\n";
                        $assembled .= $eq_content;
                        error_log("WML Router: Injected exam question creator from " . basename($eq_path));
                    }
                    break;
                }
            }
        }

        // ── Universal Template Injection ──
        // Replace @CONFIRM_SAVE markers with the centralised confirm-before-save block
        $assembled = $this->inject_confirm_templates($assembled, $board, $subject);

        // ── Board-specific template substitution (v7.14.6) ──
        $board_config = $this->load_board_config($protocol_board, $protocol_group);
        if ($board_config) {
            $assembled = $this->apply_board_template($assembled, $board_config);
        }

        $word_count = str_word_count($assembled);
        $step_label = $task_config['steps'][$step]['label'] ?? "Step {$step}";

        error_log("WML Router: Assembled {$board}/{$protocol_group} for {$task} step {$step} ({$step_label}): {$loaded_count} modules, {$word_count} words");

        return $assembled;
    }

    /**
     * Inject universal templates into assembled protocol text.
     * 
     * Supported markers:
     *   <!-- @CONFIRM_SAVE: element_type="cn_section_1" -->
     *   <!-- @CONFIRM_ELEMENT: element_type="body_para_1" label="Body Paragraph 1 Plan" -->
     *   <!-- @CONFIRM_SCORES -->
     * 
     * Each marker is replaced with the corresponding universal block.
     * Protocol files only need the marker — the full flow lives here.
     */
    private function inject_confirm_templates($text, $board = '', $subject = '') {
        // ── @GOAL_SETUP — Subject-aware goal setting (v7.14.64) ──
        $text = preg_replace_callback(
            '/<!-- @GOAL_SETUP\s*-->/',
            function ($matches) use ($board, $subject) {
                return $this->get_goal_setup_template($board, $subject);
            },
            $text
        );

        // ── @CONFIRM_SAVE — Section summary confirmation (CN, future tasks) ──
        $text = preg_replace_callback(
            '/<!-- @CONFIRM_SAVE:\s*element_type="([^"]+)"\s*-->/',
            function ($matches) {
                $element_type = $matches[1];
                return $this->get_confirm_save_template($element_type);
            },
            $text
        );

        // ── @CONFIRM_ELEMENT — Individual element confirmation (planning, etc.) ──
        $text = preg_replace_callback(
            '/<!-- @CONFIRM_ELEMENT:\s*element_type="([^"]+)"\s*label="([^"]+)"\s*-->/',
            function ($matches) {
                $element_type = $matches[1];
                $label = $matches[2];
                return $this->get_confirm_element_template($element_type, $label);
            },
            $text
        );

        // ── @CONFIRM_SCORES — Assessment score confirmation ──
        $text = preg_replace_callback(
            '/<!-- @CONFIRM_SCORES\s*-->/',
            function ($matches) {
                return $this->get_confirm_scores_template();
            },
            $text
        );

        return $text;
    }

    /**
     * Universal confirm-before-save template for section summaries (Conceptual Notes).
     * Used by: Poetry CN, Literature CN, Nonfiction CN, future CN types.
     */
    private function get_confirm_save_template($element_type) {
        return <<<TEMPLATE
**Review these notes carefully.** Are you happy with them, or would you like to change anything?

A) ✅ Save these notes — I'm happy with them
B) ✏️ I want to change something"

**IF student chooses A (Save):**
**[AI_INTERNAL]** 🔴 NOW call save_session_element with element_type=`{$element_type}`. Content = the full section summary above. Call the function SILENTLY — never narrate it. Say "Notes saved! ✅" and then deliver the transition text that follows this block (the bridge to the next section).

**IF student chooses B (Edit):**
"What would you like to change? You can:
- Edit specific wording in any point
- Add something I missed
- Remove something you disagree with
- Completely redo a point

Just tell me what you'd like to adjust."

**[AI_INTERNAL]** After making the requested changes, re-present the UPDATED summary with the same A/B choice. Repeat until the student chooses A. Only call save_session_element when they confirm.

TEMPLATE;
    }

    /**
     * Universal confirm template for individual plan elements (Essay Planning, etc.).
     * Used by: Planning (anchor quotes, paragraph plans), Model Answer sections.
     */
    private function get_confirm_element_template($element_type, $label) {
        return <<<TEMPLATE
**[AI_INTERNAL] CRITICAL: You MUST wrap the saveable content in panel tags like this:**
[PANEL: {$element_type}]the exact content to be saved[/PANEL]

Present a summary of the {$label}, then ask for confirmation:

**Is this your final version of your {$label}?**

A) ✅ Yes, save it
B) ✏️ I want to adjust it"

**Example of correct format:**
Here is your {$label}:
[PANEL: {$element_type}]Level 6 critical response — focusing on AO3 context integration[/PANEL]

Is this your final version of your {$label}?
A) ✅ Yes, save it
B) ✏️ I want to adjust it

**IF student chooses A:**
**[AI_INTERNAL]** The frontend will detect the [PANEL] tag and save automatically. You may also call save_session_element with element_type=`{$element_type}` as a backup.

**IF student chooses B:**
"What would you like to change?"
**[AI_INTERNAL]** Help the student revise, then re-present with the same [PANEL] tag and A/B choice. Loop until A.
TEMPLATE;
    }

    /**
     * Universal confirm template for assessment scores and feedback.
     * Used by: Assessment task.
     */
    private function get_confirm_scores_template() {
        return <<<TEMPLATE
**Review these scores and feedback.** Do you have any questions, or are you happy for me to save them?

A) ✅ Save these results
B) ❓ I have a question about the marking
C) 🔄 I think a score should be different"

**IF student chooses A:**
**[AI_INTERNAL]** 🔴 NOW save ALL score and feedback elements using save_session_element. Call silently for each element type.

**IF student chooses B:**
Answer their question about the marking criteria or reasoning. After answering, re-present the same A/B/C choice.

**IF student chooses C:**
Ask which score they want to discuss. Explain the reasoning. If appropriate, adjust. Re-present updated scores with A/B/C choice. Loop until A.
TEMPLATE;
    }

    /**
     * Universal two-step goal setting template with button options.
     * Replaces the open-ended goal question with structured level + skill selection.
     * Board determines level/band terminology and descriptors.
     */
    private function get_goal_setup_template($board, $subject = '') {
        $board_key = str_replace('-', '_', $board);
        $is_language = (strpos($subject, 'language') !== false);

        // ──────────────────────────────────────────────────────
        // LANGUAGE PAPER 2 — Level-based A/B/C + past feedback + routing
        // Faithful to AQA LP2 v6.58 / Edexcel LP2 v7.1.1 reference protocols
        // ──────────────────────────────────────────────────────
        if ($is_language && (strpos($subject, '2') !== false || strpos($subject, 'paper_2') !== false)) {
            // Board-specific level labels for LP2
            switch ($board_key) {
                case 'edexcel':
                    $goal_a = "A) Just trying to understand the structure";
                    $goal_b = "B) Pushing for Level 5 (top marks)";
                    $goal_c = "C) Aiming for 100% (flawless execution)";
                    $resp_c = "That's the mindset I want to see! 100% means perfect quote selection, surgical analysis, and flawless execution at every step. Let's build a plan that leaves no marks on the table.";
                    $resp_b = "Excellent goal! Level 5 requires sophisticated analysis, perceptive insights, and consistent high-quality throughout. Let's build a plan that gets you there.";
                    $resp_a = "Perfect — understanding structure first is smart. I'll walk you through each element so you see how everything fits together.";
                    break;
                case 'eduqas':
                    $goal_a = "A) Just trying to understand the structure";
                    $goal_b = "B) Aiming for a solid Band 4 response";
                    $goal_c = "C) Pushing for Band 5 (top marks)";
                    $resp_c = "Ambitious — I like it! Band 5 requires sensitive, evaluative analysis and perceptive insights. Let's build a plan that gets you there.";
                    $resp_b = "Great goal. Band 4 requires thoughtful, sustained analysis with well-selected evidence. Let's make sure your plan hits all those marks.";
                    $resp_a = "Perfect — understanding structure first is smart. I'll walk you through each element so you see how everything fits together.";
                    break;
                case 'aqa':
                default:
                    $goal_a = "A) Just trying to understand the structure";
                    $goal_b = "B) Aiming for a solid Level 3 response";
                    $goal_c = "C) Pushing for Level 4 (top marks)";
                    $resp_c = "Ambitious — I like it! Level 4 requires sophisticated analysis, perceptive insights, and flawless structure. Let's build a plan that gets you there.";
                    $resp_b = "Great goal. Level 3 requires clear analysis, well-selected evidence, and consistent structure. Let's make sure your plan hits all those marks.";
                    $resp_a = "Perfect — understanding structure first is smart. I'll walk you through each element so you see how everything fits together.";
                    break;
            }

            return <<<TEMPLATE
[ASK] "Before we start planning, what's your goal for this response?

{$goal_a}
{$goal_b}
{$goal_c}
D) I have my own specific goal — let me type it

Type the letter."

**[AI_INTERNAL]** Wait for response. Store goal level in SESSION_STATE.planning_goal.

---

**[CONDITIONAL]** IF planning_goal == "D": [ASK] "Great — tell me your specific goal for this plan." **[AI_INTERNAL]** Wait for response. Store their custom goal.

ELIF planning_goal == "C": [SAY] "{$resp_c}"

ELIF planning_goal == "B": [SAY] "{$resp_b}"

ELIF planning_goal == "A": [SAY] "{$resp_a}"

ELSE: Execute REQUIRE_MATCH("A, B, C, or D") HALT: true

---

**[AI_INTERNAL]** If STUDENT_PROFILE contains past feedback relevant to the current question type, briefly reference it now:

**[CONDITIONAL]** IF relevant_past_feedback EXISTS: [SAY] "Quick reminder from last time: [one strength] was strong, but watch out for [one weakness]. Let's make sure this plan addresses that."

---

**[AI_INTERNAL]** Wrap the student's chosen goal in [PANEL] tags for saving:
[PANEL: goal]the student's goal level and any past feedback reference[/PANEL]

<!-- @CONFIRM_ELEMENT: element_type="goal" label="Goal" -->

---

[SAY] "Let's start planning."

**[AI_INTERNAL]** Branch to appropriate planning sub-protocol based on SESSION_STATE.current_question.

**[CONDITIONAL]** IF SESSION_STATE.current_question == "2": PROCEED: Question 2 Planning Sub-Protocol

ELIF SESSION_STATE.current_question == "3": PROCEED: Question 3 Planning Sub-Protocol

ELIF SESSION_STATE.current_question == "4": PROCEED: Question 4 Planning Sub-Protocol

ELIF SESSION_STATE.current_question IN ["Section B", "section b", "B", "5"]: [SAY] "For Section B transactional writing, we'll use the IUMVCC structure (Introduction, Urgency, Methodology, Vision, Counter-argument, Conclusion). This framework is specifically designed for persuasive writing." PROCEED: Section B Planning Sub-Protocol

ELIF SESSION_STATE.current_question == "6": PROCEED: Question 6 Planning Sub-Protocol

ELIF SESSION_STATE.current_question IN ["7a"]: PROCEED: Question 7a Planning Sub-Protocol

ELIF SESSION_STATE.current_question IN ["7b"]: PROCEED: Question 7b Planning Sub-Protocol

ELIF SESSION_STATE.current_question IN ["8", "9"]: PROCEED: Section B Planning Sub-Protocol

TEMPLATE;
        }

        // ──────────────────────────────────────────────────────
        // LANGUAGE PAPER 1 — Skill-based A-E options
        // Faithful to AQA LP1 v3.2 / Edexcel LP1 v3.9.3 reference protocols
        // ──────────────────────────────────────────────────────
        if ($is_language) {
            return <<<TEMPLATE
Say: "Excellent. Before we begin planning, let's connect this to your ongoing progress."

**AI-Led Progress Check:** Say: "In your last action plan, you decided to focus on your previously set goal. This planning session is a perfect opportunity to put that into practice."

**Student-Led Goal Setting:** Ask: "So, with that in mind, what is **one specific thing** we should concentrate on during this plan to really master that skill? Please select:
**A** — Writing about effects in more detail
**B** — Tracking focus shifts for structure
**C** — Using evaluative language like 'this suggests' or 'perhaps'
**D** — Varying sentence length for control and accuracy
**E** — Other (please specify)"

**[AI_INTERNAL]** Store the student's stated goal to refer back to during the planning process.

**[AI_INTERNAL]** Wrap the student's goal in [PANEL] tags for saving:
[PANEL: goal]the student's stated skill focus goal[/PANEL]

<!-- @CONFIRM_ELEMENT: element_type="goal" label="Goal" -->

TEMPLATE;
        }

        // ──────────────────────────────────────────────────────
        // LITERATURE / DEFAULT — Level target + skill focus
        // Board-specific level descriptors from mark schemes
        // ──────────────────────────────────────────────────────
        switch ($board_key) {
            case 'eduqas':
                $level_term = 'Band';
                $levels = [
                    ['label' => 'Band 3', 'desc' => 'explained, structured response'],
                    ['label' => 'Band 4', 'desc' => 'thoughtful, sustained focus'],
                    ['label' => 'Band 5', 'desc' => 'sensitive, evaluative response'],
                ];
                break;

            case 'edexcel':
                $level_term = 'Level';
                $levels = [
                    ['label' => 'Level 3', 'desc' => 'explained, structured response'],
                    ['label' => 'Level 4', 'desc' => 'developed, analytical response'],
                    ['label' => 'Level 5', 'desc' => 'assured, convincing, critical response'],
                ];
                break;

            case 'edexcel-igcse':
                $level_term = 'Level';
                $levels = [
                    ['label' => 'Level 3', 'desc' => 'explained, structured response'],
                    ['label' => 'Level 4', 'desc' => 'developed, analytical response'],
                    ['label' => 'Level 5', 'desc' => 'critical, exploratory response'],
                ];
                break;

            case 'ocr':
                $level_term = 'Level';
                $levels = [
                    ['label' => 'Level 4', 'desc' => 'developed, clear response'],
                    ['label' => 'Level 5', 'desc' => 'thoughtful, developed consideration'],
                    ['label' => 'Level 6', 'desc' => 'critical, exploratory response'],
                ];
                break;

            case 'aqa':
            default:
                $level_term = 'Level';
                $levels = [
                    ['label' => 'Level 4', 'desc' => 'explained, structured response'],
                    ['label' => 'Level 5', 'desc' => 'thoughtful, developed consideration'],
                    ['label' => 'Level 6', 'desc' => 'critical, exploratory response'],
                ];
                break;
        }

        // Build level options
        $letters = ['A', 'B', 'C'];
        $level_options = '';
        foreach ($levels as $i => $level) {
            $level_options .= "**{$letters[$i]}** — {$level['label']} — {$level['desc']}\n";
        }

        return <<<TEMPLATE
Say: "Excellent. Before we begin planning, let's set a clear goal so your plan targets what matters most to you."

**Step 1 — {$level_term} Target:**

Ask: "What {$level_term} are you aiming for in this essay?"

{$level_options}
**[AI_INTERNAL]** Wait for the student's response. Store their chosen level/band. Then proceed to Step 2.

**Step 2 — Skill Focus:**

Ask: "Great — now what specific skill do you want to focus on to reach that {$level_term}?"

**A** — Word-level analysis (AO2) — close analysis of individual words and techniques
**B** — Context integration (AO3) — weaving in historical/social context meaningfully
**C** — Conceptual topic sentences — crafting unique, defensible opening arguments per paragraph
**D** — Write my own — tell me your specific focus

**[AI_INTERNAL]** If student picks D, ask them to describe their focus. Otherwise, store their selection.

**Step 3 — Confirm Goal:**

Combine the level and skill into a single goal string, e.g.: "{$levels[2]['label']} {$levels[2]['desc']} — focusing on AO3 context integration"

**[AI_INTERNAL]** Wrap the combined goal in [PANEL] tags:
[PANEL: goal]the combined level + skill goal string[/PANEL]

<!-- @CONFIRM_ELEMENT: element_type="goal" label="Goal" -->

**After confirmation, transition:** "Great goal. Working towards {$level_term} [X] requires exactly that kind of focus. We'll keep that front and center as we build your plan."

TEMPLATE;
    }

    /**
     * v7.14.66: Return the step labels from the protocol manifest for sidebar display.
     * Called by the REST endpoint /protocol-steps.
     */
    public function get_manifest_steps($board, $subject, $task = 'planning') {
        // v7.15.38: normalize so callers can pass either 'edexcel_igcse' or 'edexcel-igcse'
        $board = self::normalize_board($board);
        $plugin_dir = plugin_dir_path(dirname(__FILE__));
        $protocol_group = $this->resolve_protocol_group($board, $subject);

        // Try board-specific manifest first, then AQA fallback
        $paths = [
            $plugin_dir . "protocols/{$board}/{$protocol_group}/manifest.json",
            $plugin_dir . "protocols/aqa/{$protocol_group}/manifest.json",
        ];

        $manifest = null;
        foreach ($paths as $path) {
            if (file_exists($path)) {
                $manifest = json_decode(file_get_contents($path), true);
                if ($manifest) break;
            }
        }

        if (!$manifest || empty($manifest[$task]['steps'])) return ['steps' => [], 'groups' => null];

        $steps = [];
        foreach ($manifest[$task]['steps'] as $num => $step_data) {
            $steps[] = ['step' => (int) $num, 'label' => $step_data['label'] ?? "Step {$num}"];
        }

        // v7.15.1: Return manifest-defined groups for accordion sidebar display
        $groups = $manifest[$task]['groups'] ?? null;

        return ['steps' => $steps, 'groups' => $groups];
    }

    /**
     * Get minimum word count target based on marks and subject type (v7.14.7).
     * Returns the standard minimum (not first-diagnostic lower bar).
     */
    private function get_word_count_target($marks, $subject) {
        $is_language = preg_match('/^language|^lang_/i', $subject);
        if ($is_language) {
            $targets = [20 => 400, 30 => 450, 40 => 650, 45 => 650];
        } else {
            $targets = [15 => 300, 20 => 400, 24 => 500, 25 => 500, 30 => 650, 34 => 650, 40 => 700];
        }
        // Find closest match (exact or nearest lower key)
        $result = 0;
        foreach ($targets as $key => $val) {
            if ($key <= $marks) $result = $val;
        }
        return $result;
    }

    /**
     * Load board-specific config for template substitution (v7.14.6).
     *
     * Reads protocols/shared/assessment/board-configs.json and returns
     * the config for the given board/protocol_group key, or null.
     */
    private function load_board_config($board, $protocol_group) {
        static $configs = null;
        if ($configs === null) {
            $path = SWML_PROTOCOLS_PATH . 'shared/assessment/board-configs.json';
            if (file_exists($path)) {
                $raw = file_get_contents($path);
                $configs = json_decode($raw, true);
                if (!is_array($configs)) {
                    error_log('WML Router: Failed to parse board-configs.json');
                    $configs = [];
                }
            } else {
                $configs = [];
            }
        }
        $key = "{$board}/{$protocol_group}";
        return $configs[$key] ?? null;
    }

    /**
     * Replace {{MARKER}} placeholders in protocol text with board-specific values (v7.14.6).
     *
     * Config keys are uppercased to match markers: 'board_name' → {{BOARD_NAME}}.
     * Only string values are replaced. Returns text unchanged if no config.
     */
    private function apply_board_template($text, $config) {
        if (!$config || !is_array($config)) {
            return $text;
        }
        foreach ($config as $key => $value) {
            if (is_string($value)) {
                $marker = '{{' . strtoupper($key) . '}}';
                $text = str_replace($marker, $value, $text);
            }
        }
        return $text;
    }

    /**
     * Map board + subject to the protocol group directory name.
     *
     * Protocol groups bundle subjects that share the same protocol:
     * - AQA: Shakespeare + Modern + 19th Century all use "literature" protocol
     * - Other boards: each subject may need its own protocol
     *
     * Returns directory name (e.g., "literature", "poetry", "modern", "language1")
     */
    private function resolve_protocol_group($board, $subject) {
        // v7.17.4: normalise language_p1/language_p2 → language1/language2 for map lookup.
        // Frontend + schema use language_p1; protocol dir + map use language1. Converge here.
        $subject = preg_replace('/^language_p(\d)$/', 'language$1', $subject);

        // Normalise board key (frontend uses hyphens, map uses underscores)
        $board_key = str_replace('-', '_', $board);

        $map = [
            'aqa' => [
                'shakespeare'           => 'literature',
                'modern_text'           => 'literature',
                '19th_century'          => 'literature',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'ocr' => [
                'shakespeare'           => 'literature',
                '19th_century'          => 'literature',
                'modern_text'           => 'modern',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'poetry', // OCR: unseen is Part (a) of the poetry paper, not separate
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'eduqas' => [
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => 'literature',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'edexcel' => [
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => '19th_century',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'edexcel-igcse' => [
                'shakespeare'           => 'heritage',
                'modern_text'           => 'modern',
                'modern_prose'          => 'modern-prose',
                '19th_century'          => 'heritage',
                'poetry_anthology'      => 'poetry',
                'prose_anthology'       => 'literature',
                'nonfiction_anthology'  => 'nonfiction',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'cambridge-igcse' => [
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => '19th_century',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'sqa' => [
                'critical_reading'      => 'critical-reading',
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => '19th_century',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
            'ccea' => [
                'prose'                 => 'prose',
                'unseen_prose'          => 'unseen-prose',
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => '19th_century',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
        ];

        // Look up the group, with fallbacks
        if (isset($map[$board_key][$subject])) {
            return $map[$board_key][$subject];
        }

        // Fallback: try the subject as-is (e.g., "literature")
        error_log("WML Router: No protocol group mapped for {$board}/{$subject}, trying subject as directory name");
        return sanitize_key($subject) ?: 'literature';
    }

    /**
     * Build the session-specific preamble (public for fallback use by REST API)
     */
    public function build_preamble($context, $user_id) {
        // v7.15.38: normalize board slug upstream so all downstream $board references
        // work with the hyphenated canonical form (edexcel-igcse, cambridge-igcse).
        if (isset($context['board'])) {
            $context['board'] = self::normalize_board($context['board']);
        }
        $user = get_userdata($user_id);
        $student_name = $user ? $user->display_name : 'Student';
        $first_name = $user ? ($user->first_name ?: $user->display_name) : 'Student';

        // Task → Protocol mapping
        // v7.17.64: extended with mark_scheme_unit + other live tasks. Previous
        // fallback to 'Protocol B (Essay Planning)' was actively harmful — when
        // the modular protocol was Mark Scheme Quiz but preamble said Essay
        // Planning, Sophia asked the student to disambiguate ("which mode?").
        // Neutral ucwords fallback now used for unknown tasks so the modular
        // protocol's own framing wins.
        $protocol_map = [
            'planning'             => 'Protocol B (Essay Planning)',
            'assessment'           => 'Protocol A (Essay Assessment)',
            'polishing'            => 'Protocol C (Prose Polishing)',
            'diagnostic'           => 'Diagnostic Assessment',
            'development'          => 'Development Essay',
            'mark_scheme'          => 'Mark Scheme Self-Assessment',
            'mark_scheme_unit'     => 'Mark Scheme Mastery Quiz',
            'foundational_quiz'    => 'Foundational Quiz',
            'conceptual_notes'     => 'Conceptual Notes',
            'memory_practice'      => 'Memory Practice',
            'exam_prep'            => 'Exam Practice',
            'feedback_discussion'  => 'Feedback Discussion',
            'essay_plan'           => 'Essay Plan',
        ];
        $task = $context['task'] ?? 'planning';
        $protocol_label = $protocol_map[$task] ?? ucwords(str_replace('_', ' ', $task));

        // v7.15.78: Standalone feedback-discussion note. Student has pasted
        // bring-your-own-work into the canvas; no prior-attempt context exists
        // in the system. Sophia should treat the pasted text as the draft.
        $standalone_feedback_note = '';
        if ($task === 'feedback_discussion' && ($context['phase'] ?? '') === 'standalone') {
            $standalone_feedback_note = "\n**Standalone Session:** {$first_name} is using Discuss Feedback outside the Mastery Programme. They have pasted their own essay and any existing feedback into the canvas for discussion. Treat the pasted text as the draft under discussion — do not attempt to retrieve prior-attempt context from the system.\n\n";
        }

        // v7.13.34: Creative Writing preamble — entirely different context
        if (strpos($task, 'cw_step_') === 0 || strpos($task, 'cw_trial_') === 0) {
            $cw_step_labels = [
                'cw_step_1' => 'Writer Profile', 'cw_step_2' => 'Explore Story Ideas',
                'cw_step_3' => 'Create Logline', 'cw_step_4' => 'Brief Outline',
                'cw_step_5' => 'Choose Plot Structure', 'cw_step_6' => 'Plot Outline Workshop',
                'cw_step_7' => 'Universal Values', 'cw_step_8' => 'Scene Selection',
                'cw_step_9' => 'Draft 1: Prose Style', 'cw_step_10' => 'Character Profile',
                'cw_step_11' => 'Update Plot: Goals', 'cw_step_12' => 'Draft 2: Character Arc',
                'cw_step_13' => 'Character Archetypes', 'cw_step_14' => 'Update Plot: Archetypes',
                'cw_step_15' => 'Draft 3: Archetypes', 'cw_step_16' => 'Deepen Empathy',
                'cw_step_17' => 'Update Plot: Empathy', 'cw_step_18' => 'Draft 4: Empathy',
                'cw_step_19' => 'Theme & Tone', 'cw_step_20' => 'Update Plot: Theme',
                'cw_step_21' => 'Draft 5: Theme & Tone', 'cw_step_22' => 'Genre',
                'cw_step_23' => 'Update Plot: Genre', 'cw_step_24' => 'Draft 6: Genre',
                'cw_step_25' => 'Structural Elements', 'cw_step_26' => 'Update Plot: Structural',
                'cw_step_27' => 'Draft 7: Structural', 'cw_step_28' => 'Final Draft — SPAG',
                'cw_step_29' => 'Metacognitive Reflection',
                'cw_trial_1' => 'Trial 1: Story Coherence', 'cw_trial_2' => 'Trial 2: Character Depth',
                'cw_trial_3' => 'Trial 3: Archetype Coherence', 'cw_trial_4' => 'Trial 4: Emotional Impact',
                'cw_trial_5' => 'Trial 5: Thematic Clarity', 'cw_trial_6' => 'Trial 6: Technical Proficiency',
            ];
            $step_label = $cw_step_labels[$task] ?? ucwords(str_replace(['cw_step_', 'cw_trial_', '_'], ['Step ', 'Trial ', ' '], $task));

            $preamble  = "## WRITING MASTERY LAB — CREATIVE WRITING SESSION\n\n";
            $preamble .= "**Active Exercise:** {$step_label}\n";
            $preamble .= "**Student:** {$student_name} (call them {$first_name})\n";
            $preamble .= "**Course:** Creative Writing Masterclass\n";
            $preamble .= "**Mode:** Sophia Guided\n\n";
            $preamble .= "You are Sophia, a creative writing tutor guiding {$first_name} through the Creative Writing Masterclass.\n";
            $preamble .= "Follow the protocol instructions precisely. Be encouraging, specific, and constructive.\n";
            $preamble .= "The student's creative writing document is attached to each message for context.\n\n";
            $preamble .= "**The Inside Out Technique:** This creative writing course is not just about producing a story. It is the 'Inside Out' companion to the student's literature analysis work ('Outside In'). ";
            $preamble .= "By experiencing the creative process themselves — generating ideas from personal meaning, making deliberate craft choices, understanding WHY a writer makes certain decisions — students develop genuine insight into authorial intent. ";
            $preamble .= "At natural moments during the exercise, briefly connect what the student is doing to how published authors do the same. For example: 'Notice how you're drawing from your own values here — this is exactly what authors like Dickens and Priestley did.' ";
            $preamble .= "Do NOT overdo this — one or two brief connections per exercise is enough. The priority is the creative writing exercise itself.\n";

            return $preamble;
        }

        // Subject label
        $subject_labels = [
            'shakespeare'      => 'Shakespeare',
            'modern_text'      => 'Modern Text',
            '19th_century'     => '19th Century Novel',
            'poetry_anthology' => 'Poetry Anthology',
            'unseen_poetry'    => 'Unseen Poetry',
        ];
        $subject = $subject_labels[$context['subject'] ?? ''] ?? ucfirst($context['subject'] ?? '');

        $preamble  = "## WRITING MASTERY LAB — SESSION CONTEXT\n\n";
        $preamble .= "**Active Protocol:** {$protocol_label}\n";
        $preamble .= "**Student:** {$student_name} (call them {$first_name})\n";
        $board_labels = [
            'aqa' => 'AQA', 'ocr' => 'OCR', 'edexcel' => 'Edexcel',
            'eduqas' => 'EDUQAS', 'edexcel-igcse' => 'Edexcel IGCSE',
            'cambridge-igcse' => 'Cambridge IGCSE', 'sqa' => 'SQA',
        ];
        $board_label = $board_labels[$context['board'] ?? 'aqa'] ?? strtoupper($context['board'] ?? 'AQA');
        $preamble .= "**Exam Board:** {$board_label}\n";
        $preamble .= "**Subject Area:** {$subject}\n";

        // Text — may come from student selection or be pending
        $text = $context['text'] ?? '';
        $text_name = $context['text_name'] ?? '';
        
        // Author lookup
        $author_map = [
            'macbeth' => 'William Shakespeare', 'romeo_juliet' => 'William Shakespeare',
            'the_tempest' => 'William Shakespeare', 'merchant_of_venice' => 'William Shakespeare',
            'much_ado' => 'William Shakespeare', 'julius_caesar' => 'William Shakespeare',
            'twelfth_night' => 'William Shakespeare',
            'aic' => 'J.B. Priestley', 'acc' => 'Charles Dickens', 'blood_brothers' => 'Willy Russell',
            'lord_of_the_flies' => 'William Golding', 'animal_farm' => 'George Orwell',
            'never_let_me_go' => 'Kazuo Ishiguro',
            'jekyll_hyde' => 'Robert Louis Stevenson', 'frankenstein' => 'Mary Shelley',
            'sign_of_four' => 'Arthur Conan Doyle', 'great_expectations' => 'Charles Dickens',
            'jane_eyre' => 'Charlotte Brontë', 'pride_prejudice' => 'Jane Austen',
            'scarlet_letter' => 'Nathaniel Hawthorne',
        ];
        $author = $author_map[$text] ?? '';
        
        if ($text_name) {
            $preamble .= "**Text:** {$text_name}" . ($author ? " by {$author}" : '') . " (CONFIRMED — do not re-ask)\n";
        } elseif ($text) {
            $display_text = ucwords(str_replace('_', ' ', $text));
            $preamble .= "**Text:** {$display_text}" . ($author ? " by {$author}" : '') . " (CONFIRMED — do not re-ask)\n";
        } else {
            $preamble .= "**Text:** Not yet selected (student will choose in conversation)\n";
        }

        $preamble .= "**Session Mode:** " . ($context['mode'] === 'guided' ? 'Guided (from LearnDash course)' : 'Exam Prep (self-directed)') . "\n";

        // Draft typing context (unified handoff v2)
        $draft_type  = $context['draft_type'] ?? null;
        $phase       = $context['phase'] ?? null;
        $topic_num   = $context['topic_number'] ?? 0;
        $topic_label = $context['topic_label'] ?? '';

        if ($draft_type) {
            $draft_label = SWML_Session_Manager::get_draft_type_label($draft_type);
            $preamble .= "**Draft Type:** {$draft_label}\n";
            if ($topic_num > 0) {
                $preamble .= "**Topic:** {$topic_label} (Topic {$topic_num})\n";
            }
            if ($phase) {
                $preamble .= "**Phase:** " . ucfirst($phase) . "\n";
            }
            if (in_array($draft_type, ['diagnostic_redraft', 'development_redraft'])) {
                $preamble .= "**This is a redraft session.** The student has already been assessed on their initial attempt and received feedback. Reference their prior targets.\n";
            } elseif ($draft_type === 'diagnostic') {
                $preamble .= "**This is a diagnostic essay.** It establishes the student's baseline — no scaffolding, no hints. Assess what they can do independently.\n";
            } elseif ($draft_type === 'development') {
                $preamble .= "**This is a development essay** on a new theme. Skills from previous topics should transfer. Note if the student's starting level has improved.\n";
            }
        } else {
            // Standalone exam practice or legacy session
            if (!empty($context['is_redraft'])) {
                $preamble .= "**Redraft:** Yes — this is a redraft session\n";
            } else {
                $preamble .= "**Redraft:** No — this is a brand-new essay. No previous essay or feedback in history.\n";
            }
        }

        // Plan enforcement (unified handoff v2)
        $plan_required = $context['plan_required'] ?? false;
        if ($plan_required && in_array($task, ['planning', 'polishing'])) {
            $preamble .= "**Plan Enforcement:** Essay plan is COMPULSORY for this session. The student must complete a plan before writing.\n";
        }

        // v7.14.67: Planning on canvas — positive contextual preamble
        // The student's document is attached to every message with labelled sections.
        // Assessment-only protocol files have been removed from planning manifests.
        if ($task === 'planning') {
            $raw_subject = $context['subject'] ?? '';
            $is_lang = (stripos($raw_subject, 'language') !== false);
            $is_mastery = !empty($context['phase']) && !empty($context['topic_number']);
            $phase = ucfirst($context['phase'] ?? 'initial');

            $preamble .= "\n### PLANNING SESSION — ROLE & PURPOSE\n\n";
            $preamble .= "You are a planning tutor helping {$first_name} prepare their response to a {$board_label} {$subject} paper. ";
            $preamble .= "Guide them through the planning process using Socratic questioning — help them think through each question, select evidence, and structure their ideas before they write.\n\n";

            $preamble .= "### THE STUDENT'S DOCUMENT\n\n";
            $preamble .= "The student's document is attached to each message as `[STUDENT'S DOCUMENT]`. ";
            $preamble .= "Each section is labelled with `=== LABEL [type] ===`. Use these labels to find content:\n\n";

            if ($is_lang) {
                $preamble .= "- `[source]` — Source texts and extracts (e.g. `=== SOURCE A — THE CROSSING [source] ===`). Read the full text from these sections.\n";
                $preamble .= "- `[question]` — Exam questions with marks and AOs (e.g. `=== Q3 [question] ===`). Read the question details from these sections.\n";
                $preamble .= "- `[plan]` — Planning areas where the student fills in their plan notes.\n";
                $preamble .= "- `[response]` — Response areas where the student writes their answer.\n\n";

                $preamble .= "All source texts, extracts, and exam questions are already in the document. Read them directly from the labelled sections. ";
                $preamble .= "The student writes in the document's plan and response sections — not in the chat.\n";
                $preamble .= "Skip Part A Steps 1-2 of the protocol (question/source collection and pasting) — the document already contains everything.\n\n";

                if ($is_mastery) {
                    $topic_num = $context['topic_number'] ?? 0;
                    $preamble .= "### MASTERY PROGRAMME — {$phase} PHASE (Topic {$topic_num})\n\n";
                    $preamble .= "This student is in the mastery programme ({$phase} phase). All questions are compulsory.\n\n";
                    $preamble .= "**SKIP THE ENTIRE Part A of the protocol.** Part A (setup, question selection, source collection) is completely redundant because:\n";
                    $preamble .= "- The document already contains all source texts, questions, and response areas\n";
                    $preamble .= "- This is confirmed as a {$phase} session — no need to ask\n";
                    $preamble .= "- ALL questions are planned sequentially — no question selection needed\n\n";
                    $preamble .= "**START DIRECTLY WITH Part B (Goal Setting)** for the first question in the document (typically Q2).\n";
                    $preamble .= "Read the question text from the `[question]` section, then begin the goal-setting conversation.\n";
                    $preamble .= "After completing planning for that question, move to the next question and repeat Part B → Part C.\n";
                    $preamble .= "Continue until all questions have been planned.\n\n";

                    // Build step map from manifest for progress markers
                    $manifest_path = SWML_PATH . "protocols/{$context['board']}/{$raw_subject}/manifest.json";
                    if (!file_exists($manifest_path)) {
                        // Try shared path resolution
                        $manifest_path = SWML_PATH . "protocols/shared/{$raw_subject}/manifest.json";
                    }
                    $planning_steps = [];
                    if (file_exists($manifest_path)) {
                        $man = json_decode(file_get_contents($manifest_path), true);
                        if (!empty($man['planning']['steps'])) {
                            foreach ($man['planning']['steps'] as $num => $step_data) {
                                $planning_steps[] = "- Step {$num}: {$step_data['label']}";
                            }
                        }
                    }
                    if (!empty($planning_steps)) {
                        $preamble .= "### PROGRESS TRACKING — MANDATORY\n\n";
                        $preamble .= "The sidebar shows the student's progress. You MUST include a `[PROGRESS: N]` tag in your response whenever you move to a new step.\n";
                        $preamble .= "The student will NOT see this tag — it is stripped from the display.\n\n";
                        $preamble .= "**Steps:**\n" . implode("\n", $planning_steps) . "\n\n";
                        $preamble .= "**Rules:**\n";
                        $preamble .= "- Include `[PROGRESS: N]` ONCE per response, at the point where you transition to that step's content\n";
                        $preamble .= "- Only include the tag when you BEGIN working on that step (not when you're still in the previous step)\n";
                        $preamble .= "- Example: When you start asking about Q2 evidence, include `[PROGRESS: 2]`. When you move to Q2 paragraph planning, include `[PROGRESS: 3]`.\n\n";
                    }
                } else {
                    $preamble .= "### FREE PRACTICE — STUDENT CHOOSES\n\n";
                    $preamble .= "This is a free practice session. Present the questions from the document as options and let the student choose which to plan. ";
                    $preamble .= "Then proceed with Part B (Goal Setting) and Part C (Core Planning) for the chosen question(s).\n\n";
                }
            } else {
                $preamble .= "- `[question]` or `[source]` — The essay question and any extract. Read from these sections.\n";
                $preamble .= "- `[response]` — Where the student writes their answer.\n\n";
                $preamble .= "The essay question and extract are already in the document. Read them directly from the labelled sections. ";
                $preamble .= "The student writes in the document — not in the chat.\n\n";
            }
        }

        // v7.14.69: Polishing on canvas — same document-awareness as planning
        if ($task === 'polishing') {
            $raw_subject = $context['subject'] ?? '';
            $is_lang = (stripos($raw_subject, 'language') !== false);
            $is_mastery = !empty($context['phase']) && !empty($context['topic_number']);

            $preamble .= "\n### POLISHING SESSION — ROLE & PURPOSE\n\n";
            $preamble .= "You are a polishing tutor helping {$first_name} refine their written response to a {$board_label} {$subject} paper. ";
            $preamble .= "Use Socratic questioning to help them identify weaknesses and rewrite specific sentences or paragraphs.\n\n";

            $preamble .= "### THE STUDENT'S DOCUMENT\n\n";
            $preamble .= "The student's document is attached to each message as `[STUDENT'S DOCUMENT]`. ";
            $preamble .= "Each section is labelled with `=== LABEL [type] ===`. Key sections:\n\n";
            $preamble .= "- `[response]` — The student's essay response. This is the text you will help them polish.\n";
            $preamble .= "- `[question]` — The exam question with marks and AOs.\n";

            if ($is_lang) {
                $preamble .= "- `[source]` — Source texts and extracts.\n";
            }

            $preamble .= "\nThe student's essay is already in the document. Read it directly from the `[response]` section.\n";
            $preamble .= "**SKIP protocol steps 3-6** (asking what they're polishing, asking to paste text, asking question number). ";
            $preamble .= "You already have all of this information from the document.\n\n";

            if ($is_mastery) {
                $phase = ucfirst($context['phase'] ?? 'initial');
                $topic_num = $context['topic_number'] ?? 0;
                $preamble .= "### MASTERY PROGRAMME — {$phase} PHASE (Topic {$topic_num})\n\n";
                $preamble .= "This is a mastery session. The question and response are pre-assigned.\n";
                $preamble .= "**START DIRECTLY** by reading the student's response from the document, identifying the first area to polish, and beginning the Socratic polishing dialogue.\n";
                $preamble .= "Do NOT ask the student to paste text, select a question, or choose what to polish.\n\n";
            }
        }

        // Question if established
        if (!empty($context['question'])) {
            $preamble .= "\n**Essay Question:** \"{$context['question']}\"\n";
            if (!empty($context['marks'])) {
                $marks = (int) $context['marks'];
                $preamble .= "**Marks:** {$marks}\n";
                // Word count guidance based on marks (v7.14.7)
                $wc_target = $this->get_word_count_target($marks, $context['subject'] ?? '');
                if ($wc_target > 0) {
                    $preamble .= "**Minimum Word Count:** {$wc_target} words for proper assessment. Students should aim higher where possible.\n";
                }
            }
            if (!empty($context['aos'])) {
                $preamble .= "**Assessment Objectives:** " . implode(', ', $context['aos']) . "\n";
            }
        }

        // Student history and reminders
        $reminders = $this->build_reminders($user_id, $text);
        if ($reminders) {
            $preamble .= "\n" . $reminders;
        }

        // ── Universal Socratic Enforcement ──
        // These rules apply to ALL task types — they are non-negotiable
        $preamble .= "\n### ⚠️ UNIVERSAL RULES — APPLY TO EVERY MESSAGE ⚠️\n\n";

        $preamble .= "**RULE 1: NEVER REVEAL ANSWERS.**\n";
        $preamble .= "When a student answers a multiple-choice question incorrectly, NEVER say 'the answer is B' or 'the correct answer is...' or 'actually, it's B.'\n";
        $preamble .= "Instead, ask a Socratic guiding question that helps them reconsider. For example: 'That's an interesting thought. But consider: [guiding question that leads them toward the right answer]. Does that shift your thinking?'\n";
        $preamble .= "Then WAIT for them to respond. If they still don't get it after 2 attempts, offer a reframed explanation and let them try again. The student must always be the one who arrives at the understanding.\n\n";

        $preamble .= "**RULE 2: ONE QUESTION PER MESSAGE. STRICTLY.**\n";
        $preamble .= "Every message you send must contain AT MOST one question for the student to answer. After asking a question, STOP. Do not add another question, do not preview the next step, do not combine steps.\n";
        $preamble .= "After the student responds, give brief feedback on THEIR answer, then ask the NEXT question in a NEW message.\n";
        $preamble .= "This rule has NO exceptions. Even if the protocol lists Steps 3 and 4 sequentially, you must send Step 3, wait for a response, give feedback, THEN send Step 4.\n\n";

        $preamble .= "**RULE 3: SOCRATIC BEFORE SCAFFOLDING.**\n";
        $preamble .= "When a student gives a weak, shallow, or off-track answer, follow this sequence:\n";
        $preamble .= "1. Ask a focusing question (e.g. 'What makes you say that? Can you explain further?')\n";
        $preamble .= "2. If still stuck, offer a conceptual lens (e.g. 'Think about it this way...')\n";
        $preamble .= "3. Only after 2 failed attempts, offer scaffolding options (A/B/C/D choices)\n";
        $preamble .= "Never jump straight to giving them the answer or providing options on the first attempt.\n\n";

        $preamble .= "**RULE 4: FEEDBACK BEFORE FORWARD.**\n";
        $preamble .= "After every student response, ALWAYS acknowledge what they said and give specific feedback BEFORE moving to the next question.\n";
        $preamble .= "Good: 'Good thinking — you've identified that the speaker is observing from outside. That's important because it means... Now, let's think about...'\n";
        $preamble .= "Bad: 'Correct. Moving on — what type of speaker does the poem have?' (no feedback, jumps ahead)\n\n";

        $preamble .= "**RULE 5: NEVER REPEAT CONTENT ALREADY SENT.**\n";
        $preamble .= "If you have already sent a welcome message, opening explanation, introduction, or set of instructions in a previous message in this conversation, do NOT send it again.\n";
        $preamble .= "When you see 'Send this message' or 'Send the following message exactly' in the protocol, check whether you have ALREADY sent that content. If yes, skip it and proceed to the NEXT step.\n";
        $preamble .= "This applies to all opening messages, mode explanations, exercise descriptions, and instructions. The student should never see the same block of content twice.\n";
        $preamble .= "After the student responds to your opening, move FORWARD to the next step — do not re-send the opening.\n\n";

        $preamble .= "**RULE 6: CHOICES AS BUTTONS.**\n";
        $preamble .= "Whenever you present options for the student to choose from, format them as lettered options (A, B, C, etc.) on SEPARATE LINES. The interface renders these as clickable buttons.\n";
        $preamble .= "NEVER use 'Type P to proceed', 'Type M for menu', 'Type H for help', 'Type Y/N', or any single-letter control prompts. These are legacy patterns that no longer apply.\n";
        $preamble .= "Instead of: 'Type Y for Yes or N for No' → write:\n";
        $preamble .= "**A** — Yes\n";
        $preamble .= "**B** — No\n";
        $preamble .= "NEVER append control footers like '💡 Type M for menu | H for help | P to proceed' to your messages.\n\n";

        $preamble .= "**RULE 7: CONFIRM BEFORE EVERY SAVE — USE [PANEL] TAGS.**\n";
        $preamble .= "You MUST NEVER call `save_session_element` without first presenting an explicit confirmation prompt to the student.\n";
        $preamble .= "For EVERY element that gets saved to the right panel, follow this exact sequence:\n";
        $preamble .= "1. Gather all parts of the element through your Socratic questioning\n";
        $preamble .= "2. Wrap the saveable content in `[PANEL: element_type]...[/PANEL]` tags — the frontend uses these to identify what to save\n";
        $preamble .= "3. Show a confirmation prompt:\n";
        $preamble .= "**A** — ✅ Save this\n";
        $preamble .= "**B** — ✏️ I want to change something\n";
        $preamble .= "4. ONLY call `save_session_element` when the student picks A\n";
        $preamble .= "5. If B: ask what they want to change, revise, then re-present with [PANEL] tags and the same A/B choice. Loop until A.\n\n";
        $preamble .= "**[PANEL] TAG FORMAT — MANDATORY:**\n";
        $preamble .= "Every time you present content for confirmation, wrap it in:\n";
        $preamble .= "`[PANEL: element_type]exact content to save[/PANEL]`\n";
        $preamble .= "Examples:\n";
        $preamble .= "- `[PANEL: goal]Level 6 critical, exploratory response — focusing on AO3 context integration[/PANEL]`\n";
        $preamble .= "- `[PANEL: keywords]ambition; moral conflict; psychological tension; regicide; conscience[/PANEL]`\n";
        $preamble .= "- `[PANEL: anchor_quote_start]\"Stars, hide your fires; let not light see my black and deep desires\"[/PANEL]`\n";
        $preamble .= "- `[PANEL: body_para_1]Topic: Macbeth's ambition is presented as a destructive force...[/PANEL]`\n";
        $preamble .= "The student will NOT see the [PANEL] tags — they are stripped from the display. The content inside IS what appears in the right panel.\n";
        $preamble .= "This rule has NO exceptions. The `@CONFIRM_ELEMENT` markers in the protocol expand into the full confirmation flow with [PANEL] tags. Follow them exactly.\n\n";

        // ── ANTI-DUPLICATION GUARD: when conversation history exists, the welcome has already been sent ──
        global $swml_chat_history;
        $has_history = !empty($swml_chat_history) && is_array($swml_chat_history) && count($swml_chat_history) >= 1;
        if ($has_history) {
            $preamble .= "**⚠️ CONVERSATION IN PROGRESS — DO NOT RE-SEND THE WELCOME.**\n";
            $preamble .= "The welcome message, quick tip, and question selection (A/B/C) have ALREADY been sent. Do NOT repeat them.\n";
            $preamble .= "HOWEVER, you MUST still complete all protocol steps in full. Skipping the welcome does NOT mean skipping the actual work.\n";
            $preamble .= "If the student chose A (Generate a question): First present the sub-options (1: Choose a theme, 2: Random, 3: Recommended). Then generate a complete exam question with extract using the EXAM QUESTION FORMAT REFERENCE. Present it in full. Do NOT skip this.\n";
            $preamble .= "If the student chose B (Saved question): The frontend shows a picker. Wait for the question text.\n";
            $preamble .= "If the student chose C (Paste your own): Wait for them to paste it.\n";
            $preamble .= "After the question is established, follow EVERY subsequent step (goals, keywords, anchors, body paragraphs, etc.) fully — do not rush or skip any step.\n\n";
        }

        // ── MARK SCHEME QUIZ: context injection (v7.14.49) ──
        // The subject-specific protocol files (protocols/shared/mark-scheme/*.md) contain the
        // full quiz instructions. This preamble injects session context so the AI skips setup
        // questions that the system already knows the answers to.
        if ($task === 'mark_scheme') {
            $board_label = strtoupper(str_replace('-', ' ', $board));
            $ms_unit = ($topic_num <= 1) ? 2 : 4;
            $ms_phase_label = ($topic_num <= 1) ? 'First diagnostic checkpoint' : 'Progress check and reinforcement';

            $preamble .= "\n### MARK SCHEME QUIZ — SESSION CONTEXT\n\n";
            $preamble .= "The following details are already known. Do NOT ask the student for any of these — skip straight to the quiz questions.\n\n";
            $preamble .= "- **Board:** {$board_label} (pre-selected)\n";
            $preamble .= "- **Unit:** Unit {$ms_unit} ({$ms_phase_label})\n";
            if ($phase) {
                $preamble .= "- **Phase:** " . ucfirst($phase) . "\n";
            }
            $preamble .= "\n**SKIP THESE STEPS ENTIRELY:**\n";
            $preamble .= "- Do NOT ask which exam board the student is on — it is {$board_label}.\n";
            $preamble .= "- Do NOT ask which unit they are working on — it is Unit {$ms_unit}.\n";
            $preamble .= "- Do NOT display the 'do not delete this chat' message — the system handles persistence.\n";
            $preamble .= "- Do NOT ask any setup/confirmation questions.\n\n";
            $preamble .= "**START DIRECTLY** with the Unit {$ms_unit} quiz questions. Your first message should present Question 1.\n\n";

            // ── Text-specific key quotes for mark scheme examples (v7.14.52) ──
            $text_name = $context['text'] ?? '';
            if (!empty($text_name)) {
                $text_slug = sanitize_title($text_name);
                $data_path = SWML_PROTOCOLS_PATH . 'shared/mark-scheme/text-data/' . $text_slug . '.md';

                $preamble .= "### TEXT-SPECIFIC EXAMPLES\n\n";
                $preamble .= "The student is studying **{$text_name}**. When quiz questions contain example student responses, quotes, or passages, ADAPT them to use **{$text_name}** material instead of the default examples in the protocol. Keep the same difficulty level and pedagogical point — only change the text references.\n\n";

                if (file_exists($data_path)) {
                    $text_data = file_get_contents($data_path);
                    if (!empty(trim($text_data))) {
                        $preamble .= "Use these key quotes and scenes as source material for adapted examples:\n\n";
                        $preamble .= $text_data . "\n\n";
                    }
                }
            }
        }

        // Function calling instructions — determine task from session context
        $task = $context['task'] ?? sanitize_text_field($_POST['task'] ?? $_GET['task'] ?? 'planning');

        // ── Learning profile loaded here, injected only inside assessment block (v7.12.5) ──
        $user_id = $context['user_id'] ?? get_current_user_id();
        $profile_raw = get_user_meta($user_id, 'swml_learning_profile', true);
        $profile = $profile_raw ? json_decode($profile_raw, true) : null;

        // Exam question creator — board-agnostic preamble + text data injection
        if ($task === 'exam_question' || $task === 'exam_question_modern') {
            $is_modern = ($subject === 'modern_text' || $task === 'exam_question_modern');
            $board_label = strtoupper(str_replace('_', ' ', $board));
            $preamble .= "\n### CRITICAL INSTRUCTIONS FOR THIS SESSION\n";
            $preamble .= "You are running the **Exam Question Creator** protocol ONLY. Do NOT follow any planning, assessment, or polishing workflows.\n";
            $preamble .= "Follow the protocol text EXACTLY — use the EXACT wording from the protocol for each step. Do not paraphrase, reorder, or swap options.\n";
            $preamble .= "When the protocol says option A, B, or C, present them EXACTLY in the order and with the descriptions from the protocol.\n";
            $preamble .= "When the student responds with a single letter (A, B, C, a, b, c), treat it as their selection — do not ask them to clarify. NEVER re-present the same options the student has already answered. Proceed immediately to the corresponding Branch.\n";
            $preamble .= "The BOARD FORMAT MODULE loaded in this session defines the EXACT question format for {$board_label}. Follow its phrasing, mark allocation, extract requirements, and structure rules precisely. Do NOT use another board's format.\n";
            $preamble .= "AFTER STUDENT CONFIRMS THE QUESTION (says 'happy with this', 'no changes', etc.), you MUST present the tips/done choice FIRST:\n";
            $preamble .= "**A** — 💡 Give me tips on how to answer this question\n";
            $preamble .= "**B** — 📋 I'm done — just remind me to save it\n";
            $preamble .= "Do NOT skip this step. Do NOT jump straight to the 'generate another question' prompt. The tips/done choice ALWAYS comes first after confirmation.\n";
            $preamble .= "Only AFTER the student chooses tips (and you give them) OR chooses done, THEN show the final reminder and the 'generate another question' A/B prompt.\n";
            $preamble .= "NEVER include parenthetical notes like '(save_session_element called for...)' in your messages.\n";
            $preamble .= "IMPORTANT: When the session is complete, give the final reminder ONLY. Do NOT suggest planning an essay or any other task.\n";
            $preamble .= "NEVER add disclaimers like 'this is for practice only' or 'visit the exam board website'.\n\n";

            $preamble .= "### FUNCTION CALLS\n";
            $preamble .= "You MUST call `save_session_element` for each confirmed element. Call the function SILENTLY — NEVER write '[Calling save_session_element with arguments: ...]' or any narration of the function call in your message text.\n";
            $preamble .= "- `question_text` — the text name. If known from session context, save with your FIRST message.\n";
            $preamble .= "- `goal` — the author name. If known from session context, save with your FIRST message.\n";
            $preamble .= "- `exam_question_theme` — the ACTUAL theme or character name. Do NOT save option letters. Only save AFTER the student's specific theme/character is confirmed.\n";
            $preamble .= "- `exam_question_output` — a short summary of the generated question (save when generated)\n";
            $preamble .= "The `content` must be the ACTUAL value — NOT your commentary.\n\n";

            // ── Inject per-text past paper data from markdown files ──
            $text_name = $context['text'] ?? '';
            if (!empty($text_name)) {
                $text_slug = sanitize_title($text_name); // e.g. "macbeth", "a-christmas-carol"
                $board_slug = sanitize_title($board); // e.g. "aqa", "edexcel"
                $data_dir = SWML_PROTOCOLS_PATH . 'shared/exam-question/data/';

                // Try board-specific data file first, then generic
                $data_paths = [
                    $data_dir . $board_slug . '-' . $text_slug . '.md',
                    $data_dir . $text_slug . '.md',
                ];

                $data_loaded = false;
                foreach ($data_paths as $data_path) {
                    if (file_exists($data_path)) {
                        $text_data = file_get_contents($data_path);
                        if (!empty(trim($text_data))) {
                            $preamble .= "### PAST PAPER DATA FOR THIS TEXT\n\n";
                            $preamble .= "Use this data when the student chooses Mode A (pattern-based) or Mode C (recreate from description). This is your primary source for theme frequency, extract patterns, and prediction candidates.\n\n";
                            $preamble .= $text_data . "\n\n";
                            $data_loaded = true;
                            error_log("WML Router: Loaded exam question text data from " . basename($data_path));
                        }
                        break;
                    }
                }

                if (!$data_loaded) {
                    $preamble .= "### PAST PAPER DATA\n";
                    $preamble .= "No specific past paper data file found for '{$text_name}' on {$board_label}. Use your own knowledge of past paper patterns for this text and board. Be transparent with the student if you're less certain about specific year/question details.\n\n";
                    error_log("WML Router: No exam question text data found for {$board_slug}-{$text_slug}");
                }
            }
        } else if ($task === 'essay_plan') {
            // Essay Plan protocol — three modes: A (Recall), B (Guided), C (Instant)
            $planning_mode = $context['planning_mode'] ?? 'A';
            $mode_labels = ['A' => 'Recall (Timed Verbal)', 'B' => 'Guided (Collaborative)', 'C' => 'Instant (Quick)'];
            $mode_label = $mode_labels[$planning_mode] ?? $mode_labels['A'];

            $preamble .= "\n### CRITICAL INSTRUCTIONS FOR THIS SESSION\n";
            $preamble .= "You are running the **Essay Plan** protocol in **{$mode_label}** mode. Do NOT follow exam question creator, assessment, or polishing workflows.\n";
            $preamble .= "Follow the protocol text EXACTLY. Do not skip steps, combine steps, or reorder them.\n";
            $preamble .= "When the student responds with a single letter, treat it as their selection — do not ask them to clarify.\n";
            $preamble .= "NEVER include parenthetical notes like '(save_session_element called for...)' in your messages.\n";
            $preamble .= "NEVER add disclaimers. Stay in role as an essay planning tutor.\n";
            $preamble .= "NEVER include step navigation, breadcrumbs, progress bars, or step numbers in your messages (e.g. 'Planning > Part B.1 > Step 4 of 5' or '[Progress bar: ...]'). The frontend sidebar handles progress display.\n";
            $preamble .= "When presenting the final essay plan, use the EXACT format from the ESSAY PLAN FORMAT section of the protocol.\n\n";

            $preamble .= "**CRITICAL: `question_text` content must be a SHORT summary** — just the question stem (e.g. 'Starting with this extract, how does Shakespeare present Macbeth's guilt?'). Do NOT save the full extract text. Do NOT include `>` characters, stage directions, or speaker lines.\n\n";

            if ($planning_mode === 'A') {
                // RECALL MODE — timed verbal recall
                $preamble .= "### MODE A — RECALL (TIMED VERBAL)\n";
                $preamble .= "This is a **retrieval practice** exercise. The student explains a complete TTECEA+C essay plan from memory under time pressure.\n\n";
                $preamble .= "**FLOW:** A.0 Opening Explanation → A.1 Question Selection (random/saved/paste) → A.1b Extract Check → A.2 Timer Briefing → WAIT for verbal response → A.3 AI Evaluation → A.4 Refinement → A.5 Confirm & Save.\n\n";
                $preamble .= "**CRITICAL TIMER RULES:**\n";
                $preamble .= "- The 4-minute timer is managed by the frontend — do NOT try to track time.\n";
                $preamble .= "- After the timer briefing (A.2), simply WAIT for the student's response.\n";
                $preamble .= "- The student may speak via microphone or type — accept either.\n";
                $preamble .= "- In Exam mode, the student's response is AUTO-SUBMITTED when the timer expires. The response may be incomplete — this is expected. Evaluate whatever they managed to produce.\n";
                $preamble .= "- If you receive '[Timer expired — no response submitted]', the student didn't get anything down. Respond encouragingly and help them identify what blocked them.\n";
                $preamble .= "- In Practice mode, the student submits manually after the timer ends.\n\n";
                $preamble .= "**SKIP-AHEAD RULE (v7.15.14):**\n";
                $preamble .= "- If the student's FIRST message contains a question AND an `[EXTRACT` marker, they selected the question from the frontend overlay. Skip A.0 (Opening) and A.1 (Question Selection) — go directly to A.1b (Extract Check) then A.2 (Timer Briefing).\n";
                $preamble .= "- **CONVERSATION STATE:** Read the chat history carefully. If you already sent the timer briefing ('press the microphone button when you're ready'), do NOT repeat it. Proceed to the NEXT step (wait for verbal response, then A.3 AI Evaluation).\n";
                $preamble .= "- Never repeat a step you already completed in the conversation.\n\n";
                $preamble .= "**RANDOM QUESTION GENERATION (when student picks Option A in A.1):**\n";
                $preamble .= "- The full Exam Question Creator protocol has been loaded at the end of the assembled protocol under 'EXAM QUESTION FORMAT REFERENCE'.\n";
                $preamble .= "- Follow it EXACTLY for question format, extract length, phrasing, and mark allocation.\n";
                $preamble .= "- Query the vector store for past paper patterns. Note theme frequency to the student.\n";
                $preamble .= "- NEVER show vector store queries or internal analysis to the student.\n";
                $preamble .= "- After generating the question, return to the Recall flow (A.1b → A.2 → etc).\n\n";
                $preamble .= "**AI EVALUATION (A.3) — MUST USE SOCRATIC QUESTIONING:**\n";
                $preamble .= "- Check EVERY element in the evaluation criteria table (15 elements).\n";
                $preamble .= "- For ❌ MISSING elements: ask a Socratic question to help the student recall — do NOT just give the answer.\n";
                $preamble .= "- For ⚠️ WEAK elements: give specific, actionable feedback with a Socratic nudge.\n";
                $preamble .= "- For ✅ STRONG elements: briefly praise the specific quality.\n";
                $preamble .= "- End with a clear summary: 'You recalled X out of Y elements.'\n\n";
                $preamble .= "**REFINEMENT (A.4):** Work through gaps one at a time with Socratic questioning. If the student is stuck after two attempts, give a brief teaching moment, then ask them to apply the approach.\n\n";

                $preamble .= "### FUNCTION CALLS\n";
                $preamble .= "You MUST call `save_session_element` for each confirmed element. Call the function SILENTLY.\n\n";
                $preamble .= "Save `question_text` when the question is confirmed (A.1b).\n";
                $preamble .= "Save `goal` = 'Recall · Grade 9' with the timer briefing message (A.2).\n";
                $preamble .= "Save ALL remaining elements when the student confirms the final plan (A.5):\n\n";
                $preamble .= "| element_type | content = |\n";
                $preamble .= "|---|---|\n";
                $preamble .= "| `keywords` | Comma-separated key concepts from the question |\n";
                $preamble .= "| `anchor_quote_start` | Beginning quote text |\n";
                $preamble .= "| `anchor_quote_mid` | Middle quote text |\n";
                $preamble .= "| `anchor_quote_end` | End quote text |\n";
                $preamble .= "| `body_para_1` | Body Paragraph 1 topic sentence |\n";
                $preamble .= "| `body_para_2` | Body Paragraph 2 topic sentence |\n";
                $preamble .= "| `body_para_3` | Body Paragraph 3 topic sentence |\n";
                $preamble .= "| `introduction` | Hook + thesis summary |\n";
                $preamble .= "| `conclusion` | Restated thesis + universal message summary |\n\n";

            } else if ($planning_mode === 'C') {
                // Instant mode: auto-populate EVERYTHING when plan is generated
                $preamble .= "The student selected **Mode C** (Instant). Follow ONLY the steps for Mode C in the protocol (after completing the shared setup Steps 1-3).\n\n";

                $preamble .= "### KEYWORD & QUOTE SELECTION — ALWAYS OFFER CHOICES\n";
                $preamble .= "When asking the student to identify keywords (Step B.1), ALWAYS present 3-4 suggested keyword sets as lettered options, PLUS a 'write my own' option.\n\n";

                $preamble .= "### FUNCTION CALLS\n";
                $preamble .= "You MUST call `save_session_element` for each confirmed element. Call the function SILENTLY.\n\n";

                $preamble .= "**INSTANT MODE — SAVE ALL ELEMENTS IMMEDIATELY** when you generate the plan.\n";
                $preamble .= "After the student provides the question (Step 2) and extract (Step 3 if applicable), generate the complete plan AND save ALL of these elements in the SAME response:\n\n";
                $preamble .= "| element_type | content = |\n";
                $preamble .= "|---|---|\n";
                $preamble .= "| `question_text` | Short question stem (NOT the full extract) |\n";
                $preamble .= "| `goal` | 'Instant · Grade 9' |\n";
                $preamble .= "| `keywords` | Comma-separated key concepts from the question |\n";
                $preamble .= "| `anchor_quote_start` | The quote used in Body Paragraph 1 (beginning) |\n";
                $preamble .= "| `anchor_quote_mid` | The quote used in Body Paragraph 2 (middle) |\n";
                $preamble .= "| `anchor_quote_end` | The quote used in Body Paragraph 3 (end) |\n";
                $preamble .= "| `body_para_1` | Topic sentence from Body Paragraph 1 |\n";
                $preamble .= "| `body_para_2` | Topic sentence from Body Paragraph 2 |\n";
                $preamble .= "| `body_para_3` | Topic sentence from Body Paragraph 3 |\n";
                $preamble .= "| `introduction` | Hook + thesis statement summary |\n";
                $preamble .= "| `conclusion` | Restated thesis + universal message summary |\n\n";
                $preamble .= "Save ALL of these together when the plan is generated. Do NOT wait for student confirmation — instant mode generates and saves in one go.\n";
            } else {
                // Guided (B) mode: save as confirmed
                $preamble .= "The student selected **Mode B** (Guided). Follow ONLY the steps for Mode B in the protocol (after completing the shared setup Steps 1-3).\n\n";

                $preamble .= "### KEYWORD & QUOTE SELECTION — ALWAYS OFFER CHOICES\n";
                $preamble .= "When asking the student to identify keywords (Step B.1), ALWAYS present 3-4 suggested keyword sets as lettered options, PLUS a 'write my own' option. Base suggestions on the question and text. Example format:\n";
                $preamble .= "**A** — Ambition, power, moral conflict\n";
                $preamble .= "**B** — Guilt, conscience, loyalty\n";
                $preamble .= "**C** — Supernatural, fate, free will\n";
                $preamble .= "**D** — ✍️ Write my own keywords (recommended for deeper thinking)\n\n";
                $preamble .= "When asking for anchor quotes (B.2), ALWAYS offer a 'choose for me' option alongside asking the student to provide their own. Present it as:\n";
                $preamble .= "**A** — I'll choose my own quote\n";
                $preamble .= "**B** — Choose for me\n\n";
                $preamble .= "This ensures every step has clickable options for the student.\n\n";

                $preamble .= "### FUNCTION CALLS\n";
                $preamble .= "You MUST call `save_session_element` for each confirmed element. Call the function SILENTLY.\n\n";

                $preamble .= "Save each element as it is confirmed by the student or generated:\n\n";
                $preamble .= "- `question_text` — short question stem only (save when student provides it in Step 2)\n";
                $preamble .= "- `goal` — save 'Guided · Grade 9' with your FIRST message\n";
                $preamble .= "- `keywords` — comma-separated key concepts (when identified)\n";
                $preamble .= "- `anchor_quote_start` — Beginning quote text only (when confirmed/selected)\n";
                $preamble .= "- `anchor_quote_mid` — Middle quote text only (when confirmed/selected)\n";
                $preamble .= "- `anchor_quote_end` — End quote text only (when confirmed/selected)\n";
                $preamble .= "- `body_para_1` — Body Paragraph 1 topic sentence (when confirmed/generated)\n";
                $preamble .= "- `body_para_2` — Body Paragraph 2 topic sentence (when confirmed/generated)\n";
                $preamble .= "- `body_para_3` — Body Paragraph 3 topic sentence (when confirmed/generated)\n";
                $preamble .= "- `introduction` — Hook + thesis summary (when confirmed/generated)\n";
                $preamble .= "- `conclusion` — Restated thesis + universal message (when confirmed/generated)\n";
            }
            $preamble .= "\nThe `content` must be the ACTUAL value, not commentary.\n";

        } else if ($task === 'model_answer') {
            // Model Answer protocol — Coached, Instant, or Advanced (3 levels)
            $ma_mode = $context['planning_mode'] ?? 'A';
            $advanced_level = (int) ($context['advanced_level'] ?? 0);
            $level_labels = [1 => 'Full Recall', 2 => 'Plan & Answer', 3 => 'Answer Only'];
            $level_label_text = $level_labels[$advanced_level] ?? 'Full Recall';
            $mode_label = ($ma_mode === 'C') ? "Advanced — Level {$advanced_level} ({$level_label_text})" : (($ma_mode === 'A') ? 'Coached' : 'Instant');

            $preamble .= "\n### CRITICAL INSTRUCTIONS FOR THIS SESSION\n";
            $preamble .= "You are running the **Model Answer Writing** protocol in **{$mode_label}** mode. Do NOT follow exam question, essay plan, assessment, or polishing workflows.\n";
            $preamble .= "Follow the protocol text EXACTLY.\n";

            if ($ma_mode === 'C') {
                // ADVANCED MODE — timed verbal recall
                $preamble .= "**ADVANCED MODE — TIMED VERBAL RECALL (Level {$advanced_level})**\n\n";
                $preamble .= "Follow the ADVANCED MODE section of the protocol exactly.\n\n";

                $preamble .= "**CRITICAL TIMER RULES:**\n";
                $preamble .= "- All timers are managed by the frontend — do NOT try to track time.\n";
                $preamble .= "- After presenting a timer prompt (with 🎙️), simply WAIT for the student's response.\n";
                $preamble .= "- The student may speak via microphone or type — accept either.\n\n";

                if ($advanced_level === 1) {
                    $preamble .= "**LEVEL 1 — FULL RECALL (Hardest):**\n";
                    $preamble .= "Phase 1: Generate a RANDOM board-appropriate question using the vector store and board format reference. Note theme frequency. NEVER show vector store queries.\n";
                    $preamble .= "Phase 2: Verbal plan recall (4 min timer). Evaluate with Socratic questioning for gaps.\n";
                    $preamble .= "Phase 3: Essay — ask student to choose paragraph-by-paragraph or full essay timing. Then proceed.\n\n";
                } elseif ($advanced_level === 2) {
                    $preamble .= "**LEVEL 2 — PLAN & ANSWER (Medium):**\n";
                    $preamble .= "Phase 1: Student provides their own question (saved or pasted).\n";
                    $preamble .= "Phase 2: Verbal plan recall (4 min timer). Evaluate with Socratic questioning for gaps.\n";
                    $preamble .= "Phase 3: Essay — ask student to choose paragraph-by-paragraph or full essay timing. Then proceed.\n\n";
                } else {
                    $preamble .= "**LEVEL 3 — ANSWER ONLY (Entry):**\n";
                    $preamble .= "Phase 1: Student provides their own question (saved or pasted).\n";
                    $preamble .= "Phase 2: Student submits their existing plan. Review briefly — do NOT require a full rebuild.\n";
                    $preamble .= "Phase 3: Essay — ask student to choose paragraph-by-paragraph or full essay timing. Then proceed.\n\n";
                }

                $preamble .= "**ESSAY EVALUATION — ALL LEVELS:**\n";
                $preamble .= "For each section (whether paragraph-by-paragraph or holistic), evaluate against ALL criteria in the protocol: topic sentence quality, TTE integration, close analysis depth, both effects, author's purpose + context, academic vocabulary, sentence complexity, evaluative language, quote integration.\n";
                $preamble .= "Use Socratic questioning for gaps — never just list what's missing.\n";
                $preamble .= "When polishing sections, preserve the student's argument and voice while elevating quality to Grade 9.\n\n";

                $preamble .= "**SECTION ORDER:** Body ¶1 → Body ¶2 → Body ¶3 → Introduction → Conclusion.\n";
                $preamble .= "Explain WHY this order at the start: ideas develop as you write, so the introduction is stronger when written last.\n\n";

            } else {
                $preamble .= "**FULL ESSAY MODE:** You are building a COMPLETE model answer with ALL five sections — do NOT show the section selection menu (A-E). Work through all sections.\n";

                if ($ma_mode === 'A') {
                    $preamble .= "**COACHED ORDER:** After setup, guide the student through sections in this order: Body Paragraph 1 → Body Paragraph 2 → Body Paragraph 3 → Introduction → Conclusion.\n\n";
                    $preamble .= "**IMPORTANT — EXPLAIN WHY THIS ORDER:** When you begin, explain to the student: 'We'll work through body paragraphs first, then the introduction and conclusion. The reason? In an exam, your ideas evolve as you write. If you write the introduction first, you can get locked into ideas that you later want to change. By planning and writing your body paragraphs first, you'll know exactly what your three key ideas are — and your introduction will be much stronger because it accurately introduces what you've actually written. The conclusion then ties everything together.'\n\n";
                    $preamble .= "**FOR EACH BODY PARAGRAPH:** (1) Offer the student TWO ways to share their attempt:\n";
                    $preamble .= "   **A** — Paste your notes or a draft for this paragraph\n";
                    $preamble .= "   **B** — Explain it from memory using your voice (recommended — great exam preparation!)\n";
                    $preamble .= "When prompting the student, list the EXACT TTECEA+C elements they should cover:\n";
                    $preamble .= "   • Topic sentence — introduce the key concept (not a surface observation)\n";
                    $preamble .= "   • TTE — name the technique, embed the quote, and state the inference — all in ONE integrated sentence\n";
                    $preamble .= "   • Close analysis — zoom in on specific words, sounds, syntax and their connotations\n";
                    $preamble .= "   • Effect 1 — how does it direct the audience's attention and what emotions does it evoke?\n";
                    $preamble .= "   • Effect 2 — what thoughts does it prompt? Could it influence real-world attitudes or actions?\n";
                    $preamble .= "   • Author's purpose + Context — why did the author make these choices? What historical/social context compelled them?\n";
                    $preamble .= "For the INTRODUCTION, prompt: Hook (quote/fact/question/metaphor) → Building sentence(s) (historical/social context) → Thesis statement (names all three key ideas).\n";
                    $preamble .= "For the CONCLUSION, prompt: Restated thesis → Controlling concept → Author's central purpose → Universal message.\n";
                    $preamble .= "(2) Once the student shares their attempt, give detailed feedback against the quality criteria. (3) Ask the student to type YES when ready. (4) Produce a refined Grade 9 model for that section — give it your FULL attention. Each body paragraph should be 7-10 rich, complex sentences. Do NOT shorten sentences to save space.\n\n";
                    $preamble .= "**AFTER EACH SECTION:** Remind the student: '📋 Copy and paste this into your workbook before we move on.' Then proceed to the next section.\n";
                    $preamble .= "**ONE SECTION AT A TIME.** Present each section individually. Do NOT try to combine multiple sections into one message — this causes sentence compression and reduces quality.\n";
                    $preamble .= "After all five sections are complete, ask: 'Would you like me to compile the full essay into one piece for reference?' Only compile if the student says yes.\n";
                } else {
                    $preamble .= "**INSTANT MODE — ONE SECTION AT A TIME:** Do NOT generate the entire essay in one response. This causes sentence compression and reduces quality.\n";
                    $preamble .= "Generate sections one at a time in this order: Introduction → Body ¶1 → Body ¶2 → Body ¶3 → Conclusion.\n";
                    $preamble .= "For EACH section: (1) Present the Grade 9 model paragraph — give it your FULL attention, 7-10 rich complex sentences for body paragraphs. Do NOT shorten sentences. (2) Remind: '📋 Copy this into your workbook.' (3) Ask: 'Ready for the next section? Type YES.' Then generate the next.\n";
                    $preamble .= "After all five, ask: 'Would you like me to compile the full essay into one piece for reference?'\n";
                }
            }

            $preamble .= "When the student responds with a single letter, treat it as their selection — do not ask them to clarify.\n";
            $preamble .= "NEVER include parenthetical notes like '(save_session_element called for...)' in your messages.\n";
            $preamble .= "NEVER add disclaimers. Stay in role as a model answer writing tutor.\n";
            $preamble .= "NEVER use the verb 'shows' — use depicts, portrays, emphasises, highlights, reveals, suggests, illustrates, conveys, evokes, underscores, reinforces, critiques, challenges, exposes, examines instead.\n";
            $preamble .= "NEVER start a sentence with 'The' or 'This' — use discourse markers, transitional phrases, or varied constructions.\n";
            $preamble .= "NEVER use the word 'extract' — refer to 'this passage', 'this scene', 'this moment in the text'.\n";
            $preamble .= "ALWAYS use evaluative, tentative language: perhaps, suggests, arguably, possibly, may, appears to.\n";
            $preamble .= "Read the GOLD STANDARD EXAMPLES in the protocol before generating ANY model answer. Every output must match that quality.\n\n";

            $preamble .= "### FUNCTION CALLS — SAVE TO RIGHT PANEL\n";
            $preamble .= "You MUST call `save_session_element` at each trigger point below. Call the function SILENTLY.\n\n";

            if ($ma_mode === 'C') {
                // Advanced mode saves to ma_* elements
                $preamble .= "| element_type | WHEN to save | content = |\n";
                $preamble .= "|---|---|---|\n";
                $preamble .= "| `ma_question` | When question is confirmed | Short question stem only |\n";
                $preamble .= "| `ma_plan` | When plan is confirmed | Thesis statement summary |\n";
                $preamble .= "| `anchor_quote_start` | When Body ¶1 is confirmed | Quote from beginning |\n";
                $preamble .= "| `anchor_quote_mid` | When Body ¶2 is confirmed | Quote from middle |\n";
                $preamble .= "| `anchor_quote_end` | When Body ¶3 is confirmed | Quote from end |\n";
                $preamble .= "| `ma_body_1` | When Body ¶1 is polished & confirmed | First sentence (topic sentence) of polished Body ¶1 |\n";
                $preamble .= "| `ma_body_2` | When Body ¶2 is polished & confirmed | First sentence (topic sentence) of polished Body ¶2 |\n";
                $preamble .= "| `ma_body_3` | When Body ¶3 is polished & confirmed | First sentence (topic sentence) of polished Body ¶3 |\n";
                $preamble .= "| `ma_introduction` | When Introduction is polished & confirmed | First sentence (hook) of polished Introduction |\n";
                $preamble .= "| `ma_conclusion` | When Conclusion is polished & confirmed | First sentence of polished Conclusion |\n\n";
                $preamble .= "Save `ma_question` when the question is set. Save `ma_plan` when the plan phase is complete. Save each essay section when the student confirms it.\n";
            } else {
                $preamble .= "| element_type | WHEN to save | content = |\n";
                $preamble .= "|---|---|---|\n";
                $preamble .= "| `question_text` | When student provides/selects the question | Short question stem only (e.g. 'How does Shakespeare present guilt?') — NOT the full extract |\n";
                $preamble .= "| `goal` | With your FIRST message | 'Develop a well-structured argument · Grade 7–9' |\n";
                $preamble .= "| `keywords` | After you identify the key concepts from the question | Comma-separated keywords (e.g. 'guilt, conscience, moral conflict') |\n";
                $preamble .= "| `anchor_quote_start` | When Body ¶1 model is generated/confirmed | The quote used in Body ¶1 (beginning of text) |\n";
                $preamble .= "| `anchor_quote_mid` | When Body ¶2 model is generated/confirmed | The quote used in Body ¶2 (middle of text) |\n";
                $preamble .= "| `anchor_quote_end` | When Body ¶3 model is generated/confirmed | The quote used in Body ¶3 (end of text) |\n";
                $preamble .= "| `body_para_1` | When Body ¶1 model is generated/confirmed | First sentence (topic sentence) of model Body ¶1 |\n";
                $preamble .= "| `body_para_2` | When Body ¶2 model is generated/confirmed | First sentence (topic sentence) of model Body ¶2 |\n";
                $preamble .= "| `body_para_3` | When Body ¶3 model is generated/confirmed | First sentence (topic sentence) of model Body ¶3 |\n";
                $preamble .= "| `introduction` | When Introduction model is generated/confirmed | First sentence (hook) of model Introduction |\n";
                $preamble .= "| `conclusion` | When Conclusion model is generated/confirmed | First sentence of model Conclusion |\n\n";

                if ($ma_mode === 'B') {
                    $preamble .= "**INSTANT:** Save `question_text`, `goal`, and `keywords` after setup. Save each section's elements (quote + first sentence) as you generate each section — one at a time.\n";
                } else {
                    $preamble .= "**COACHED:** Save `question_text`, `goal`, and `keywords` during setup. Save each section's elements (quote + first sentence) as the student confirms each section (types YES).\n";
                }
            }
            $preamble .= "The `content` must be the ACTUAL value — not your commentary about it.\n";

        } else if ($task === 'verbal_rehearsal') {
            // Random Quote TTECEA+C Analysis — standalone exam prep test
            $preamble .= "\n### CRITICAL INSTRUCTIONS FOR THIS SESSION\n";
            $preamble .= "You are running a **Random Quote Analysis** session. This is a TEST — do NOT show or remind the student of the TTECEA+C framework structure. They should already know it. If they miss elements, that's what the feedback is for.\n";
            $preamble .= "NEVER add disclaimers. Stay in role.\n";
            $preamble .= "Read the GOLD STANDARD EXAMPLES (plan AND paragraph) at the end of the protocol BEFORE generating any AI model. Your plan and paragraph must match that quality.\n\n";

            $preamble .= "### SESSION FLOW\n\n";

            $preamble .= "**STEP 1 — GREETING & EXPLANATION** (first message only)\n";
            $preamble .= "Greet the student, then explain the exercise:\n";
            $preamble .= "'For this exercise, I'm going to give you a random quote from the text. Here's how it works:\n";
            $preamble .= "1. **Plan** — I'll give you the quote, and you verbally plan your TTECEA+C paragraph. Use the microphone in the input area — speaking is closer to exam conditions than typing. Aim for about **90 seconds**.\n";
            $preamble .= "2. **Paragraph** — Once your plan is ready, explain the full paragraph to me in detailed, sophisticated language, as if you were writing a Grade 9 answer on paper. Aim for about **2.5 minutes**.\n";
            $preamble .= "This is a brilliant way to practise getting your ideas across fluently and confidently. Let's go!'\n\n";

            $preamble .= "**STEP 2 — RANDOM QUOTE**\n";
            $preamble .= "Present a random, technique-rich quote from the text. Choose one the student might not expect — not the most famous quotes. State the Act/Scene or Chapter location. Keep it brief — just the quote and location, no analysis hints.\n";
            $preamble .= "🔴 **SAVE NOW:** Call `save_session_element` with `question_text` = the quote + location (e.g. 'Act 1 Scene 7: I have no spur to prick...') IN THIS SAME MESSAGE. Also save `goal` = 'Random Quote Analysis · Exam Prep'.\n\n";

            $preamble .= "**STEP 3 — VERBAL PLAN (~90 seconds)**\n";
            $preamble .= "Say: 'Plan your paragraph now — talk me through your thinking for each TTECEA+C element. Aim for about 90 seconds. Go whenever you're ready.'\n";
            $preamble .= "Do NOT list the elements — this is a test of whether they know the framework.\n";
            $preamble .= "Wait for their response.\n\n";

            $preamble .= "**STEP 4 — PLAN FEEDBACK + ITERATION**\n";
            $preamble .= "Give BRIEF, specific feedback on the plan:\n";
            $preamble .= "- Which TTECEA+C elements are present? Which are missing?\n";
            $preamble .= "- Is the topic sentence conceptual (Level 5-6) or descriptive (Level 3-4)?\n";
            $preamble .= "- Is the quote connection to a technique clear?\n";
            $preamble .= "- Are both effects distinguished (emotion vs thought)?\n";
            $preamble .= "- Is the context specific or generic?\n";
            $preamble .= "Then ask:\n";
            $preamble .= "**A** — I want to adjust my plan\n";
            $preamble .= "**B** — I'm happy with it, let's move on to the paragraph\n";
            $preamble .= "If **A**: Let them adjust, give quick feedback, repeat A/B until they choose B.\n\n";

            $preamble .= "**STEP 4B — PLAN CLEANUP + SAVE (when student chooses B)**\n";
            $preamble .= "When the student confirms they are happy (chooses B), CLEAN UP their plan into a structured TTECEA+C format. Students who use the microphone will ramble — distil their thinking into a clean plan:\n";
            $preamble .= "Present it as: 'Here's your plan, tidied up:'\n";
            $preamble .= "- **T** — [their topic sentence concept, sharpened]\n";
            $preamble .= "- **TTE** — [technique + quote + inference, structured]\n";
            $preamble .= "- **C** — [close analysis words + connotations]\n";
            $preamble .= "- **E1** — [emotion on audience]\n";
            $preamble .= "- **E2** — [thought/attitude prompted]\n";
            $preamble .= "- **A+C** — [author's purpose + context]\n";
            $preamble .= "🔴 **SAVE NOW:** Call `save_session_element` with `body_para_1` = the FULL cleaned-up plan (all 6 elements, formatted as above). Save the ENTIRE plan, not just the topic sentence.\n";
            $preamble .= "Then proceed to Step 5.\n\n";

            $preamble .= "**STEP 5 — FULL PARAGRAPH (~2.5 minutes)**\n";
            $preamble .= "Say: 'Now explain the full paragraph to me in detailed, sophisticated language — as if you were writing a Grade 9 answer on paper. Aim for about 2.5 minutes. Go whenever you're ready.'\n";
            $preamble .= "Wait for their response.\n\n";

            $preamble .= "**STEP 6 — PARAGRAPH FEEDBACK + ITERATION**\n";
            $preamble .= "Give detailed, specific feedback against the quality criteria:\n";
            $preamble .= "- Topic sentence quality (concept-level?)\n";
            $preamble .= "- TTE integration (technique + evidence + inference in one?)\n";
            $preamble .= "- Close analysis depth (specific words and connotations?)\n";
            $preamble .= "- Effect 1 vs Effect 2 distinction\n";
            $preamble .= "- Author's purpose + context specificity\n";
            $preamble .= "- Vocabulary sophistication, evaluative language, discourse markers\n";
            $preamble .= "- Overall coherence and Grade level estimate\n";
            $preamble .= "Then ask:\n";
            $preamble .= "**A** — I want to try again / improve it\n";
            $preamble .= "**B** — I'm happy with it, show me your version\n";
            $preamble .= "If **A**: Use Socratic questioning to help them improve specific elements. Let them re-attempt. Repeat until they choose B.\n\n";

            $preamble .= "**STEP 6B — PARAGRAPH CLEANUP + SAVE (when student chooses B)**\n";
            $preamble .= "When confirmed, clean up their spoken paragraph into written form (fix grammar, remove filler words, structure sentences properly — but keep their ideas and arguments intact).\n";
            $preamble .= "Present it as: 'Here's your paragraph, cleaned up into written form:'\n";
            $preamble .= "🔴 **SAVE NOW:** Call `save_session_element` with `body_para_2` = the cleaned-up paragraph text.\n";
            $preamble .= "Then proceed to Step 7.\n\n";

            $preamble .= "**STEP 7 — AI MODEL (for comparison)**\n";
            $preamble .= "Present YOUR OWN Grade 9 plan AND paragraph for the same quote — so the student can compare their attempt with the gold standard.\n";
            $preamble .= "Label it clearly: '📝 Here's how I would approach this quote:'\n";
            $preamble .= "First show the plan (brief TTECEA+C elements), then the full paragraph (7-10 sentences, Grade 9 quality).\n";
            $preamble .= "The model must meet ALL quality markers: no 'shows', no starting with 'The'/'This', no 'extract', evaluative language throughout, two distinct effects, etc.\n";
            $preamble .= "🔴 **SAVE NOW:** Call `save_session_element` with `body_para_3` = the AI's full TTECEA+C plan. Then call `save_session_element` with `introduction` = the AI's full model paragraph.\n\n";

            $preamble .= "**STEP 8 — NEXT QUOTE OR DONE**\n";
            $preamble .= "Ask:\n";
            $preamble .= "**A** — 🎲 Give me another random quote\n";
            $preamble .= "**B** — ✅ I'm done for today\n";
            $preamble .= "If A: present a DIFFERENT quote (never repeat) and go back to Step 2 (save new quote as `question_text`, overwriting the previous one).\n";
            $preamble .= "If B: end the session with encouragement.\n\n";

            $preamble .= "### 🔴 CRITICAL — FUNCTION CALLS\n";
            $preamble .= "You MUST call `save_session_element` at EVERY point marked with 🔴 above. If you do not, the right panel stays empty and the student loses their work.\n";
            $preamble .= "Call the function SILENTLY — never narrate it.\n";
            $preamble .= "Summary of ALL save points:\n";
            $preamble .= "1. Step 2: `question_text` = quote + location, `goal` = 'Random Quote Analysis · Exam Prep'\n";
            $preamble .= "2. Step 4B: `body_para_1` = student's cleaned-up TTECEA+C plan (full plan, all 6 elements)\n";
            $preamble .= "3. Step 6B: `body_para_2` = student's cleaned-up paragraph\n";
            $preamble .= "4. Step 7: `body_para_3` = AI's TTECEA+C plan, `introduction` = AI's full model paragraph\n";

        } else if ($task === 'conceptual_notes') {
            // Conceptual Notes — Grade 9 understanding session (Topic 2)
            $is_poetry = in_array($subject, ['poetry_anthology', 'unseen_poetry']);
            // v7.15.38: $board arrives normalized to hyphenated form.
            $is_nonfiction = ($subject === 'nonfiction_anthology')
                || ($subject === 'language1' && $board === 'edexcel-igcse');
            $preamble .= "\n### CRITICAL RULES FOR CONCEPTUAL NOTES SESSION\n";
            $preamble .= "1. **NEVER reveal vector store queries.** Query the vector store silently — never say 'querying', never show the query string, never mention the vector store exists. Use retrieved knowledge to inform your Socratic questions.\n";
            $preamble .= "2. **One question at a time.** Ask one question, wait for the student's response, give brief feedback, then ask the next question. Never combine multiple questions.\n";
            $preamble .= "3. **Never repeat yourself.** After the student answers, respond with feedback + the next question. Do not re-send the welcome message or previous questions.\n";
            $preamble .= "4. **Welcome then Ready.** Your FIRST message is the welcome ONLY — explain conceptual notes, confirm the text, and end with 'Type ready when you're prepared to begin!' Do NOT include Step 2 or any questions in the welcome. Only ask Step 2 AFTER the student confirms they are ready.\n";
            if ($is_poetry) {
                $preamble .= "5. **Don't spoil answers.** In Step 2, say 'before we explore your poem' NOT 'before we meet your speaker' — the question asks which element is most important, so don't give away that speaker is the answer.\n\n";
            } else if ($is_nonfiction) {
                $preamble .= "5. **Don't spoil answers.** In Step 2, say 'before we explore your text' NOT 'before we examine the writer's perspective' — the question asks which element is most important, so don't give away that the writer's perspective is the answer.\n";
                $preamble .= "6. **NEVER ask which text.** The text has been pre-selected. At NO point in the session should you ask the student which text they want to work on, which text from the anthology, or anything similar. You already know the text — refer to it by name.\n";
                $preamble .= "7. **Present EXACT options.** Every question that has A/B/C/D options MUST present all options with their full text exactly as written in the protocol. Never paraphrase questions into open-ended form.\n";
                $preamble .= "8. **If vector store fails, use your knowledge.** Never mention technical issues, loading problems, or retrieval failures to the student.\n\n";
            } else {
                $preamble .= "5. **Don't spoil answers.** In Step 2, say 'before we explore your text' NOT 'before we meet your protagonist' — the question asks which element is most important, so don't give away that protagonist is the answer.\n\n";
            }
            $preamble .= "### PANEL SAVE POINTS — CONFIRM BEFORE SAVING\n";
            $preamble .= "You have access to the `save_session_element` function.\n";
            $preamble .= "**CRITICAL: Do NOT call save_session_element automatically.** At the end of each section:\n";
            $preamble .= "1. Generate the section summary using the student's actual answers and quotes\n";
            $preamble .= "2. Present the summary to the student in a formatted block\n";
            $preamble .= "3. Ask: 'Review these notes. Are you happy with them?'\n";
            $preamble .= "4. Present TWO options:\n";
            $preamble .= "   A) ✅ Save these notes — I'm happy with them\n";
            $preamble .= "   B) ✏️ I want to change something\n";
            $preamble .= "5. **IF student chooses A:** THEN call `save_session_element` with the summary. Say 'Notes saved! ✅' and transition to next section.\n";
            $preamble .= "6. **IF student chooses B:** Ask what they want to change. Make the edits. Re-present the updated summary with the SAME A/B choice. Loop until they choose A.\n";
            $preamble .= "7. **NEVER call save_session_element before the student confirms.** The save must be student-triggered.\n\n";
            $preamble .= "| Section | element_type | content = |\n";
            $preamble .= "|---|---|---|\n";
            if ($is_poetry) {
                $preamble .= "| S1 Speaker | `cn_section_1` | Section summary (speaker identity, perspective, where poem arrives, emotions) |\n";
                $preamble .= "| S2 Context | `cn_section_2` | Section summary (period, issues, context-poem link) |\n";
                $preamble .= "| S3 Form | `cn_section_3` | Section summary (poetic form, form-meaning connection) |\n";
                $preamble .= "| S4 Techniques | `cn_section_4` | Section summary (structural features, language techniques) |\n";
            } else if ($is_nonfiction) {
                $preamble .= "| S1 Writer's Voice | `nfcn_section_1` | Section summary (voice category, perspectives, emotions, journey meaning, effect on audience) |\n";
                $preamble .= "| S2 Context | `nfcn_section_2` | Section summary (context of production + subject, context-perspective link) |\n";
                $preamble .= "| S3 Structure | `nfcn_section_3` | Section summary (structural pattern, opening-closing, pace, structure-meaning) |\n";
                $preamble .= "| S4 Text Type | `nfcn_section_4` | Section summary (text type, conventions, form blending, audience response) |\n";
                $preamble .= "| S5 Techniques | `nfcn_section_5` | Section summary (language, rhetorical, structural techniques + combined analysis) |\n";
            } else {
                $preamble .= "| S1 Protagonist | `cn_section_1` | Section summary (protagonist, states, emotions, journey meaning) |\n";
                $preamble .= "| S2 Context | `cn_section_2` | Section summary (period, issues, context-protagonist link) |\n";
                $preamble .= "| S3 Plot | `cn_section_3` | Section summary (plot type, inner/outer journey) |\n";
                $preamble .= "| S4 Genre | `cn_section_4` | Section summary (primary emotion, conventions, blend) |\n";
            }
            if ($is_nonfiction) {
                $preamble .= "| S6 Themes | `nfcn_section_6` | Section summary (themes, writer-text connection, evidence, contemporary relevance) |\n";
                $preamble .= "| S7 Purpose | `nfcn_section_7` | Section summary (primary + secondary purpose, evidence, target audience) |\n";
                $preamble .= "| S8 Message | `nfcn_section_8` | Section summary (overall message, contemporary application) |\n";
            } else {
                $preamble .= "| S5 Themes | `cn_section_5` | Section summary (themes, " . ($is_poetry ? "speaker" : "protagonist") . " connection) |\n";
                $preamble .= "| S6 Purpose | `cn_section_6` | Section summary (purpose, evidence, audience) |\n";
                $preamble .= "| S7 Message | `cn_section_7` | Section summary (big message, contemporary application) |\n";
            }
            $preamble .= "Call the function SILENTLY when the student confirms (chooses A) — never narrate it.\n";

        } else if ($task === 'memory_practice') {
            // Memory Practice protocol — universal, all boards, all subjects
            $preamble .= "\n### CRITICAL INSTRUCTIONS FOR THIS SESSION\n";
            $preamble .= "You are running the **Memory Practice** protocol. Do NOT follow essay planning, assessment, polishing, or any other workflow.\n";
            $preamble .= "Your FIRST and ONLY opening message should combine a brief greeting with the Step 1 welcome and text submission prompt. Do NOT send a second message repeating the welcome. After the student responds, proceed one step at a time through Steps 2–7.\n";
            $preamble .= "NEVER include parenthetical notes like '(save_session_element called for...)' in your messages.\n";
            $preamble .= "NEVER add disclaimers. Stay in role as a memory practice coach.\n";
            $preamble .= "One step at a time — wait for the student's response before proceeding to the next step.\n";
            $preamble .= "The Quality Gate (Step 2) is STRICT and CANNOT be bypassed under any circumstances.\n";
            $preamble .= "When reprinting text for Gap-Fill mode, reproduce EXACTLY — same punctuation, capitalisation, paragraph breaks, errors.\n";
            $preamble .= "NEVER give hints during the recall exercise.\n\n";

            $preamble .= "### BUTTON-FRIENDLY INTERACTIONS\n";
            $preamble .= "Present ALL choices as lettered options (A/B/C) on separate lines so they render as clickable buttons.\n";
            $preamble .= "This applies to: grade selection (A/B/C for 7/8/9), mode selection (A-F), timer selection (A-G), and next steps (A-D).\n";
            $preamble .= "Follow the protocol's SAY blocks EXACTLY for option formatting.\n\n";

            $preamble .= "### QUALITY GATE FAILURE PATHWAY\n";
            $preamble .= "When writing fails the gate, present THREE options as buttons: A) Fix it myself, B) Go to Polishing, C) Go to Planning.\n";
            $preamble .= "If student chooses B or C, save `mp_quality_gate` and `mp_gate_targets` FIRST, then guide them warmly to the appropriate task and end the Memory Practice session gracefully.\n";
            $preamble .= "If student chooses A, wait for revised writing and rescan.\n\n";

            $preamble .= "### RESUME DETECTION\n";
            $preamble .= "If the ESTABLISHED SESSION STATE contains `mp_quality_gate` = 'Revising...' AND `mp_gate_targets`, this is a resumed session from a previous failed gate.\n";
            $preamble .= "Skip the full welcome. Instead, greet the student, remind them what needed fixing (from `mp_gate_targets`), and ask them to paste their improved version.\n";
            $preamble .= "Do NOT re-ask for the grade claim — use the existing `mp_grade_claim` from state.\n\n";

            $preamble .= "### FRONTEND TIMER\n";
            $preamble .= "The timer is managed by the frontend UI — it appears automatically when your exercise delivery message contains the trigger pattern.\n";
            $preamble .= "When delivering the exercise (Step 5) with a timer, you MUST include this exact phrase: **⏱️ [X] seconds — press the microphone or start typing when you're ready!** where [X] is the chosen duration in seconds (60, 90, 120, 180, or 300).\n";
            $preamble .= "The frontend detects this pattern and displays a visual countdown bar with exam/practice mode toggle. Do NOT tell students to use their phone timer.\n";
            $preamble .= "If the student chose 'No timer' (G), omit the ⏱️ line entirely from the exercise delivery.\n";
            $preamble .= "If the student chose 'Custom time' (F), ask them how many seconds, then use that number in the trigger phrase.\n\n";

            $preamble .= "### TIMER EXPIRED — NO RESPONSE\n";
            $preamble .= "If the student's message is exactly '[Timer expired — no response submitted]', do NOT assess it as 0%. Instead, offer 4 button choices: A) Same timer, B) More time, C) No timer, D) Different mode.\n";
            $preamble .= "When re-delivering the exercise for options A or B, you MUST include the timer trigger phrase so the frontend timer reappears. Use the EXACT same gaps/keywords/starters — do NOT regenerate them.\n\n";

            $preamble .= "### FUNCTION CALLS — AUTO-SAVE (RULE 7 OVERRIDE)\n";
            $preamble .= "**For Memory Practice, Rule 7 (confirm before save) is OVERRIDDEN.** Memory Practice milestones are auto-detected or confirmed by button clicks — no separate A/B confirmation is needed.\n";
            $preamble .= "Instead, wrap each saveable value in `[PANEL: element_type]content[/PANEL]` tags. The frontend auto-saves these immediately for memory_practice.\n";
            $preamble .= "Do NOT show A/B save confirmation prompts. Do NOT call `save_session_element` directly — the [PANEL] tags handle it.\n";
            $preamble .= "Include the [PANEL] tag in the SAME message where the value is determined. Examples:\n";
            $preamble .= "- After detecting writing type: `[PANEL: mp_writing_type]Analytical/Essay[/PANEL]`\n";
            $preamble .= "- After student picks grade A: `[PANEL: mp_grade_claim]Grade 7[/PANEL]`\n";
            $preamble .= "- After quality gate passes: `[PANEL: mp_quality_gate]PASS — Grade 9 Analytical/Essay[/PANEL]`\n";
            $preamble .= "- After mode selection: `[PANEL: mp_mode]Gap-Fill (Standard)[/PANEL]`\n";
            $preamble .= "- After scoring: `[PANEL: mp_score]Gap-Fill Standard — 8/10 (80%)[/PANEL]` and `[PANEL: mp_recommendation]Step up to Keyword Prompt[/PANEL]`\n\n";

            $preamble .= "| element_type | When to save | content = |\n";
            $preamble .= "|---|---|---|\n";
            $preamble .= "| `mp_writing_type` | After detecting writing type (Step 2) | Detected type, e.g. 'Analytical/Essay', 'Creative/Story', 'Descriptive', 'Speech', 'Article/Transactional' |\n";
            $preamble .= "| `mp_grade_claim` | After student claims grade (Step 2) | e.g. 'Grade 9' |\n";
            $preamble .= "| `mp_quality_gate` | After gate result (Step 2) | 'PASS — Grade 9 Analytical/Essay' or 'Revising — 2 criteria to improve' |\n";
            $preamble .= "| `mp_gate_targets` | After gate FAIL only (Step 2) | Short comma-separated list of failed criteria names, e.g. 'Concept-led topic sentence, Effects analysis beyond surface' (max ~50 words) |\n";
            $preamble .= "| `mp_mode` | After mode selection (Step 3) | e.g. 'Gap-Fill (Standard)', 'Free Recall' |\n";
            $preamble .= "| `mp_score` | After assessment (Step 6) | e.g. 'Gap-Fill Standard — 8/10 (80%)', 'Free Recall — 72%' |\n";
            $preamble .= "| `mp_recommendation` | After assessment (Step 6) | e.g. 'Step up to Keyword Prompt', 'Retry same difficulty', 'Mastery — exam-ready' |\n\n";

            $preamble .= "The `content` inside [PANEL] tags must be the ACTUAL value, not commentary.\n";

        } else {
        $preamble .= "\n### MANDATORY FUNCTION CALLS\n";
        $preamble .= "You have access to the `save_session_element` function. You MUST call it every time the student confirms an element.\n";
        $preamble .= "**Do NOT skip this** — it is how the student's live panel updates in real time.\n";
        $preamble .= "**NEVER narrate function calls.** Do NOT write '[Calling save_session_element with arguments: ...]' or any text describing the function call. Call the function silently through the tool/function calling mechanism.\n";
        $preamble .= "**Overwriting:** If a student wants to change a previously confirmed element (e.g. change their question, update a quote, revise a goal), call `save_session_element` again with the same `element_type` — it will overwrite the old value.\n\n";

        if ($task === 'planning') {
            $preamble .= "Call `save_session_element` ONLY after the student confirms via the A/B prompt (Rule 7). Never before.\n\n";
            $preamble .= "| element_type | Summary shown before A/B | content = |\n";
            $preamble .= "|---|---|---|\n";
            $preamble .= "| `question_text` | The full essay question text (and extract reference if applicable) | The exact essay question text |\n";
            $preamble .= "| `goal` | Level target + skill focus combined | The student's complete goal string |\n";
            $preamble .= "| `keywords` | Final keyword list | Comma-separated keywords |\n";
            $preamble .= "| `anchor_quote_start` | The Beginning quote | The quote text only |\n";
            $preamble .= "| `anchor_quote_mid` | The Middle quote | The quote text only |\n";
            $preamble .= "| `anchor_quote_end` | The End quote | The quote text only |\n";
            $preamble .= "| `body_para_1` | Full paragraph 1 plan (topic sentence + quote + techniques) | The paragraph plan summary |\n";
            $preamble .= "| `body_para_2` | Full paragraph 2 plan | The paragraph plan summary |\n";
            $preamble .= "| `body_para_3` | Full paragraph 3 plan | The paragraph plan summary |\n";
            $preamble .= "| `introduction` | Introduction plan (hook + building sentences + thesis) | The introduction plan summary |\n";
            $preamble .= "| `conclusion` | Conclusion plan (restated thesis + concept + purpose + moral) | The conclusion plan summary |\n\n";
            $preamble .= "**CRITICAL RULES FOR SAVING:**\n";
            $preamble .= "- The `content` must be the ACTUAL element value — NOT your commentary about it. For `question_text`, save the question itself, not 'great question' or 'crystal clear'.\n";
            $preamble .= "- For quotes: save ONLY the quote text in quotation marks, not your analysis of it.\n";
            $preamble .= "- The protocol contains `@CONFIRM_ELEMENT` markers at each save point. These expand into the full A/B confirmation flow. Follow them exactly.\n";
            $preamble .= "- **QUESTION SAVE (ALL pathways):** Whether the student generates a question (Option A), picks a saved question (Option B), or pastes their own (Option C) — present the full question text and the A/B confirmation prompt BEFORE saving. Never save the question without showing the confirm prompt first.\n";
            $preamble .= "- **NEVER STALL AFTER SAVING.** Every save MUST be followed by an immediate transition to the next step. Save silently, say 'Saved! ✅', then present the next question/step in the SAME message.\n";

            // Button-friendly interaction for all planning steps
            $preamble .= "\n### OFFER CHOICES AT KEY STEPS\n";
            $preamble .= "When asking the student to identify keywords, present 3-4 suggested keyword sets as lettered options PLUS a 'write my own' option. Base suggestions on the question and text.\n";
            $preamble .= "When asking for anchor quotes, always offer a 'choose for me' option (A — I'll choose my own / B — Choose for me).\n";
            $preamble .= "This ensures every step has clickable buttons for the student.\n";

        } elseif ($task === 'assessment') {
            // v7.15.113: Spec-driven assessment preamble.
            // Attempt to build a canonical schema block from language-paper-specs.json /
            // literature-paper-specs.json. Falls back to legacy essay preamble when no spec.
            $schema_block = $this->build_assessment_schema_block($board, $subject);
            if ($schema_block) {
                // v7.17.5: Pattern-based structure ban + universal gold-standard DELIVERY mandate.
                // v7.17.3 introduced an exact-match FORBIDDEN A/B GATES list; AI paraphrased
                // around it ("Before I dive into..." instead of "Before I assess..."). Replaced
                // with a pattern-based "NEVER CONFIRM STRUCTURE" rule that covers ALL paraphrases.
                // Gold-standard rule mandates DELIVERY (universal) while delegating CONTENT
                // (AOs, TTECEA variant, banned constructions) to each paper's schema + protocol
                // module — AO sets differ per board/paper (e.g. Edexcel Shakespeare = AO1+AO2,
                // AQA Shakespeare = AO1+AO2+AO3+AO4), so content must not be prescribed here.
                // Historical context: v7.17.3 rewrote the HARD GATE after v7.16.0-v7.17.2's
                // "Proceed directly from grade-target to Q1" line was misread as workflow-
                // ordering and caused Part A / Part B / metacognitive reflection skips.
                $preamble .= "\n### ⛔ PROTOCOL EXECUTION — NON-NEGOTIABLE\n\n";
                $preamble .= "Follow the ASSESSMENT PROTOCOL module below step-by-step. It is NOT reference material — it is an executable workflow.\n\n";
                $preamble .= "- Emit every `Say:` / `Ask:` text verbatim (or as near as possible) where the protocol specifies.\n";
                $preamble .= "- Wait for the student's response at every `Wait for Y confirmation`, `HALT`, `Type Y`, `Type C`, or numerical rating gate. Do NOT generate subsequent steps in the same message.\n";
                $preamble .= "- Do NOT summarise, consolidate, compress, or batch steps. Do NOT collapse Q1-Q5 assessments into one message. Each question is its own multi-turn exchange.\n";
                $preamble .= "- Emit EVERY scaffolding element the protocol specifies: TTECEA checklists, metacognitive reflection (self-rating 1-5 + AO targeting), per-element granular mark breakdowns, penalty codes with deductions, gold-standard paragraph rewrites (yours + optimal, TTECEA-labelled), clarification-mode responses when student types C.\n";
                $preamble .= "- If the canvas/document already contains the student's answers (canvas workflow), treat that as the submission — do NOT ask the student to re-paste. Still emit all downstream scaffolding (reflection, checklist, assessment, rewrites, Y gates).\n\n";

                $preamble .= "### ⛔ NEVER CONFIRM STRUCTURE WITH STUDENT\n\n";
                $preamble .= "The PAPER SCHEMA below is the ONLY source of truth for paper structure. Do NOT ask the student to confirm, verify, validate, check, or 'make sure about' ANY of:\n";
                $preamble .= "- Question count / which questions exist\n";
                $preamble .= "- Paragraph count per question\n";
                $preamble .= "- Mark allocation per question\n";
                $preamble .= "- Essay/paper structure, format, or type\n";
                $preamble .= "- Which exam board or paper this is\n\n";
                $preamble .= "This rule covers EVERY paraphrase. Forbidden openers include (non-exhaustive): \"Before I assess...\", \"Before I dive into...\", \"Before we begin...\", \"Just to confirm the structure...\", \"Let me verify...\", \"I can see [N] paragraphs... is this correct?\", \"Is this the standard [board] [paper] format?\". If your next turn would ask the student to validate ANY aspect of the paper, STOP — you are the authority on structure, they are not.\n\n";
                $preamble .= "You MAY ask the student to confirm THEIR OWN WORK (\"did you paste the full paragraph?\", \"is this your final answer?\"). That is different — it is about their submission, not paper structure.\n\n";
                $preamble .= "For workflow order inside the assessment (Part A → Part B → Part C question-by-question → Part D summary), follow the protocol module below EXACTLY.\n\n";

                $preamble .= "### ⛔ GOLD-STANDARD REWRITE DELIVERY IS MANDATORY\n\n";
                $preamble .= "For ANY analytical question (language reading / literature essay, every board), after you emit a per-paragraph granular mark table, you MUST deliver BOTH of these BEFORE any A/B or Y/C gate:\n";
                $preamble .= "1. **Your Paragraph Rewritten to Gold Standard** — the student's own paragraph, lifted to the top band.\n";
                $preamble .= "2. **Optimal Gold Standard Model** — an independent optimal model on the same focus. Must be of equal quality and length to the rewrite — NOT shorter, NOT less developed.\n\n";
                $preamble .= "This rule governs DELIVERY ONLY — that both models are emitted, in this order, every time, before any gate. NEVER gate gold-standard delivery behind an A/B student choice. NEVER offer \"A) clarify / B) next paragraph\" before rewrites. Skipping to \"save tokens\" or \"keep momentum\" is forbidden — the rewrites ARE the teaching.\n\n";
                $preamble .= "The CONTENT of each gold-standard model MUST follow:\n";
                $preamble .= "- The specific AOs assessed by THIS question on THIS paper (from the PAPER SCHEMA below — e.g. AQA Lit Shakespeare = AO1+AO2+AO3+AO4, Edexcel Lit Shakespeare = AO1+AO2 only, Eduqas Lit Modern = AO1+AO2, Edexcel Lit Modern = AO1+AO3).\n";
                $preamble .= "- The paragraph structure specified in the paper's protocol module (TTECEA / TTECEA+C / 3-aspect parallel for AQA Lang P2 Q4 / Story-spine or IUMVCC for Q5-creative, etc.).\n";
                $preamble .= "- Any board-specific quality criteria or banned constructions listed in the protocol module for THIS paper.\n\n";
                $preamble .= "Do NOT import AOs, paragraph shapes, or quality rules from a different paper or board. When a paper does not assess AO3, do not include contextual analysis in that paper's gold standard. When a paper labels Context as AO4 (Edexcel IGCSE Lit), do not confuse it with SPaG-AO4 (AQA). The schema + protocol module are the ONLY source of truth for content; this preamble rule only mandates that delivery happens.\n\n";
                $preamble .= "Applies to every analytical question across AQA, Edexcel, Eduqas, OCR, Edexcel-IGCSE, SQA, CCEA — language reading and literature essays. Creative / extended writing (Q5-type) delivers holistic-structural feedback per the creative-writing protocol instead; this mandate does not cover those questions.\n";

                $preamble .= $schema_block;
                $preamble .= $this->build_assessment_workflow_reminder();
            } else {
                $preamble .= $this->legacy_essay_assessment_preamble();
            }

            // ── Compact learning profile (v7.12.5) — assessment only, minimal tokens ──
            if ($profile && !empty($profile['assessment_count'])) {
                $preamble .= "\n### STUDENT HISTORY (reference only — do NOT change your assessment workflow)\n";
                $preamble .= "Assessments completed: {$profile['assessment_count']}. ";
                $preamble .= "Texts: " . implode(', ', $profile['texts_assessed'] ?? []) . ". ";
                if (!empty($profile['recurring_targets'])) {
                    $preamble .= "Recurring targets: " . implode('; ', $profile['recurring_targets']) . ". ";
                }
                if (!empty($profile['recurring_strengths'])) {
                    $preamble .= "Recurring strengths: " . implode('; ', $profile['recurring_strengths']) . ". ";
                }
                $preamble .= "If a target or strength from a previous text reappears, briefly mention the pattern. Do NOT let this profile alter your step-by-step assessment workflow.\n";
            }
        } elseif ($task === 'polishing') {
            $preamble .= "Call `save_session_element` for each of these as they are determined:\n";
            $preamble .= "- `question_text` — the essay question\n";
            $preamble .= "- `current_level` — the student's current AQA level\n";
            $preamble .= "- `target_level` — the target level to work towards\n";
            $preamble .= "- `polish_focus` — what specific area is being polished\n";
            $preamble .= "- `revision_1/2/3` — each completed revision\n";
        }
        $preamble .= "\nAlso call `update_progress` when moving to a new section.\n";
        $preamble .= "\n**DYNAMIC UPDATES:** If the student wants to change a previously saved element (e.g. change their question, update a quote, revise a goal), call `save_session_element` again with the same `element_type` and the new `content`. This will overwrite the old value. Always confirm the change with the student before saving.\n";

        // v7.14.39: Notes reference update — the note-taking app has replaced the workbook Notes section
        $preamble .= "\n### NOTES REFERENCE OVERRIDE\n";
        $preamble .= "The protocol may reference 'the Notes section at the end of your workbook'. This is OUTDATED. Instead, tell the student: \"If you find any ideas useful but not right for this specific task, use the **Take Notes** button on the right side of your screen to save them for later.\"\n";

        // Protocol compliance reinforcement
        $preamble .= "\n### PROTOCOL COMPLIANCE RULES\n";
        $preamble .= "- Follow EVERY teaching step EXACTLY as written in the protocol. Do not summarise, abbreviate, compress, or skip steps.\n";
        $preamble .= "- When the protocol provides CHUNKED progressive disclosure (Chunk 1, Chunk 2, etc.), deliver each chunk separately and wait for the student's A/B response before proceeding to the next chunk.\n";
        $preamble .= "- Never combine multiple chunks into one message. Never say 'quick version'. The full teaching sequence exists for pedagogical reasons.\n";
        $preamble .= "- Use the EXACT 'SAY:' and 'ASK:' text from the protocol where provided. You may adapt examples to the current text but do not shorten the teaching content.\n";

        $preamble .= "\n### ⛔ HARD GATE ENFORCEMENT\n";
        $preamble .= "The protocol contains HARD GATES marked with ⛔. These are NON-NEGOTIABLE checkpoints:\n";
        $preamble .= "- You MUST deliver ALL teaching content BEFORE a gate allows you to proceed.\n";
        $preamble .= "- If a student provides an answer that belongs to a LATER step (e.g. submits a quote before the anchor quote teaching is delivered), do NOT accept it. Instead, acknowledge their enthusiasm and deliver the teaching content first.\n";
        $preamble .= "- A student typing something that LOOKS like an answer to a later step does NOT mean you can skip to that step.\n";
        $preamble .= "- Every CHUNK must be delivered individually with its A/B confirmation before moving to the next chunk.\n";
        $preamble .= "- Skipping teaching content to 'save time' is NEVER acceptable — the teaching IS the product.\n";

        if ($task === 'planning') {
            $preamble .= "\n### ⛔ ANCHOR QUOTE GATE (B.4 — CRITICAL)\n";
            $preamble .= "When you reach section B.4 (Anchor Quotes), there are 4 MANDATORY teaching chunks about WHY we use beginning/middle/end quotes.\n";
            $preamble .= "YOU MUST:\n";
            $preamble .= "1. Deliver CHUNK 1 (teaching mechanism intro) → wait for A/B\n";
            $preamble .= "2. Deliver CHUNK 2 (protagonist's journey) → wait for A/B\n";
            $preamble .= "3. Deliver CHUNK 3 (application to themes) → wait for A/B\n";
            $preamble .= "4. Deliver CHUNK 4 (teaching benefit) → wait for A/B confirmation to proceed to quote selection\n";
            $preamble .= "If a student submits a quote BEFORE all 4 chunks are delivered, REJECT it with: \"Great that you're already thinking about quotes! But before we select them, I need to explain WHY we choose quotes from the beginning, middle, and end — this understanding will help you make much stronger choices. Let me walk you through it first.\"\n";
            $preamble .= "Then deliver from CHUNK 1 onwards. Do NOT skip ANY chunk. Do NOT combine chunks.\n";

            // v7.14.39: Question detection for mastery programme
            // v7.14.41: Question detection — mastery vs free practice
            $is_mastery = !empty($context['phase']) && !empty($context['topic_number']);
            $preamble .= "\n### QUESTION DETECTION (B.1 Step 4 — Question Selection)\n";
            $preamble .= "The student's FULL document (including the Question & Extract section) is injected into every message.\n";
            $preamble .= "Look for: a 'Question & Extract' section, or text that reads like an exam question (e.g. 'How does Shakespeare present...', 'Starting with this extract...').\n\n";
            if ($is_mastery) {
                $preamble .= "**MASTERY PROGRAMME MODE** — the essay question is COMPULSORY and pre-assigned to this topic.\n";
                $preamble .= "- Do NOT ask for confirmation or offer A/B/C selection.\n";
                $preamble .= "- Acknowledge the question, save it immediately with `save_session_element`, and move directly to goal setting.\n";
                $preamble .= "- If the question is not found in the document, say 'I can see this is a mastery session but I couldn't find the pre-assigned question in your document. Could you check the Question & Extract section?'\n";
            } else {
                $preamble .= "**FREE PRACTICE MODE** — the student may or may not have a question.\n";
                $preamble .= "- If the document ALREADY CONTAINS a question: acknowledge it, read it back, and offer A/B confirmation before saving.\n";
                $preamble .= "- If the document does NOT contain a question: proceed with the normal A/B/C question selection flow (generate / saved / paste).\n";
            }
        }
        } // end else (non-exam_question tasks)

        // ── Inject established plan state (sliding window support) ──
        // This ensures the AI knows what's been confirmed even if older messages are trimmed
        global $swml_plan_state, $swml_current_step;
        if (!empty($swml_plan_state) && is_array($swml_plan_state)) {
            $preamble .= "\n### ESTABLISHED SESSION STATE (already confirmed — do not re-ask)\n";
            $preamble .= "**Current section:** " . ($swml_current_step ?: 1) . " of 8\n";

            $labels = [
                'question_text' => 'Essay Question',
                'goal' => 'Student Goal',
                'keywords' => 'Keywords',
                'anchor_quote_start' => 'Beginning Quote',
                'anchor_quote_mid' => 'Middle Quote',
                'anchor_quote_end' => 'End Quote',
                'body_para_1' => 'Body ¶1 Plan',
                'body_para_2' => 'Body ¶2 Plan',
                'body_para_3' => 'Body ¶3 Plan',
                'introduction' => 'Introduction Plan',
                'conclusion' => 'Conclusion Plan',
                // Memory Practice elements
                'mp_writing_type' => 'Writing Type',
                'mp_grade_claim' => 'Grade Claim',
                'mp_quality_gate' => 'Quality Gate',
                'mp_gate_targets' => 'Gate Targets',
                'mp_mode' => 'Exercise Mode',
                'mp_score' => 'Score',
                'mp_recommendation' => 'Recommendation',
            ];

            $has_state = false;
            foreach ($labels as $key => $label) {
                if (!empty($swml_plan_state[$key])) {
                    $content = is_array($swml_plan_state[$key]) 
                        ? ($swml_plan_state[$key]['content'] ?? json_encode($swml_plan_state[$key]))
                        : $swml_plan_state[$key];
                    if ($content) {
                        $safe = sanitize_text_field(substr($content, 0, 500));
                        $preamble .= "- **{$label}:** {$safe}\n";
                        $has_state = true;
                    }
                }
            }

            if (!$has_state) {
                $preamble .= "- No plan elements established yet.\n";
            }
        }

        // ── Universal learning profile injection (v7.14.52, v7.14.61: subject-aware AO labels) ──
        // Inject student's learning profile into ALL tasks so the AI can reference prior work
        if ($profile && !empty($profile['assessment_count']) && $profile['assessment_count'] > 0) {
            $preamble .= "\n### STUDENT LEARNING PROFILE\n\n";

            // v7.14.61: AO definitions differ between Language and Literature — tell the AI which subject
            $subject = $context['subject'] ?? '';
            $is_language = (strpos($subject, 'language') !== false);
            if ($is_language) {
                $preamble .= "**Subject: English Language.** AO definitions for Language:\n";
                $preamble .= "- AO1 = Identify and interpret explicit and implicit information; synthesise ideas from different texts\n";
                $preamble .= "- AO2 = Explain, comment, analyse how writers use language and structure for effect\n";
                $preamble .= "- AO3 = Compare writers' ideas and perspectives across texts (NOT historical context)\n";
                $preamble .= "- AO4 = (Section B only) Use vocabulary, sentence structures, spelling, punctuation accurately\n";
                $preamble .= "- AO5 = (Section B only) Communicate clearly, effectively, imaginatively; organise information\n";
                $preamble .= "- AO6 = (Section B only) Technical accuracy (some boards merge AO6 into AO4)\n\n";
                $preamble .= "IMPORTANT: In Language, AO3 means COMPARISON, not historical/social context. There is NO context assessment in Language papers (except Edexcel IGCSE anthology).\n\n";
            } else {
                $preamble .= "**Subject: English Literature.** AO definitions for Literature:\n";
                $preamble .= "- AO1 = Read, respond, develop a critical and personal interpretation of the text\n";
                $preamble .= "- AO2 = Analyse language, form and structure used by the writer to create meanings and effects\n";
                $preamble .= "- AO3 = Show understanding of the relationships between texts and the contexts they were written/received in\n";
                $preamble .= "- AO4 = (Comparison questions only) Use a range of vocabulary and sentence structures for clarity; accurate spelling and punctuation\n\n";
            }

            $preamble .= "This student has completed {$profile['assessment_count']} assessment(s). ";

            if (!empty($profile['recurring_targets'])) {
                $targets = array_slice($profile['recurring_targets'], 0, 4);
                $preamble .= "Recurring targets: " . implode(', ', $targets) . ". ";
            }
            if (!empty($profile['recurring_strengths'])) {
                $strengths = array_slice($profile['recurring_strengths'], 0, 4);
                $preamble .= "Recurring strengths: " . implode(', ', $strengths) . ". ";
            }
            if (!empty($profile['score_history'])) {
                $recent = array_slice($profile['score_history'], -3);
                $scores = array_map(function($s) { return ($s['score'] ?? '?') . '/' . ($s['total'] ?? '?'); }, $recent);
                $preamble .= "Recent scores: " . implode(', ', $scores) . ". ";
            }

            $preamble .= "\n\n";

            // Task-specific instructions for how to USE the profile
            $task = $context['task'] ?? '';
            if (in_array($task, ['assessment', 'redraft_assessment'], true)) {
                $preamble .= "**Profile usage:** Reference targets when giving feedback. Do NOT alter the assessment workflow or skip any steps based on this profile.\n\n";
            } elseif (in_array($task, ['planning', 'polishing', 'essay_plan'], true)) {
                $preamble .= "**Profile usage:** Reference the student's prior targets when setting goals. If a recurring weakness appears, address it proactively in the plan.\n\n";
            } elseif ($task === 'mark_scheme') {
                $preamble .= "**Profile usage:** If the student's profile shows recurring weaknesses in specific AOs, note them when giving feedback on quiz answers.\n\n";
            } else {
                $preamble .= "**Profile usage:** Tailor examples and difficulty to the student's demonstrated level. Reference their strengths to build confidence and their targets to focus improvement. Do NOT skip protocol steps based on this profile.\n\n";
            }
        }

        // v7.15.78: Append standalone feedback-discussion note if applicable.
        if (!empty($standalone_feedback_note)) {
            $preamble .= $standalone_feedback_note;
        }

        return $preamble;
    }

    /**
     * Build student history/reminders section
     */
    private function build_reminders($user_id, $text) {
        $data = SWML_Session_Manager::get_student_reminders($user_id, $text);

        if ($data['total_sessions'] === 0 && empty($data['reminders'])) {
            return null;
        }

        $section = "### Student History\n";

        if ($data['total_sessions'] > 0) {
            $section .= "- Total WML sessions: {$data['total_sessions']}\n";
        }
        if ($data['streak'] > 0) {
            $section .= "- Current streak: {$data['streak']} consecutive days\n";
        }
        if (!empty($data['previous_scores'])) {
            $scores_str = implode(', ', array_map(function($s) {
                return is_array($s) ? json_encode($s) : $s;
            }, $data['previous_scores']));
            $section .= "- Previous scores for this text: {$scores_str}\n";
        }
        if (!empty($data['weak_aos'])) {
            $section .= "- Weak areas to target: " . implode(', ', $data['weak_aos']) . "\n";
        }
        if (!empty($data['reminders'])) {
            $section .= "- Tutor reminders:\n";
            foreach ($data['reminders'] as $reminder) {
                $section .= "  - {$reminder}\n";
            }
        }

        return $section;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  ASSESSMENT DETOUR-AND-RETURN STATE MACHINE (v7.17.47)
    //  AQA Literature pilot. Gates: board === 'aqa' && literature subject.
    //  Reads/writes state via SWML_Session_Manager::*_assessment_state().
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * AQA literature subjects eligible for the v7.17.47 state machine.
     * Non-matching contexts retain pre-v7.17.47 prose-only flow.
     */
    public static function is_assessment_state_machine_enabled($context) {
        if (empty($context) || !is_array($context)) return false;
        $board   = self::normalize_board($context['board'] ?? '');
        $subject = $context['subject'] ?? '';
        $task    = $context['task'] ?? '';
        if ($board !== 'aqa') return false;
        if ($task !== 'assessment' && $task !== 'redraft_assessment') return false;
        $lit_subjects = ['shakespeare', 'modern_text', '19th_century', 'poetry_anthology', 'unseen_poetry'];
        return in_array($subject, $lit_subjects, true);
    }

    /**
     * Resolve attempt signature fields from the request context globals + active session.
     * Returns [board, text, topic, suffix, attempt] or null if insufficient data.
     */
    private static function resolve_attempt_signature($context) {
        global $swml_request_context;
        $board   = $swml_request_context['board']        ?? ($context['board'] ?? '');
        $text    = $swml_request_context['text']         ?? ($context['text'] ?? '');
        $topic   = (int) ($swml_request_context['topic_number'] ?? ($context['topic_number'] ?? 0));
        $suffix  = $swml_request_context['suffix']       ?? ($context['suffix'] ?? '');
        $attempt = (int) ($swml_request_context['attempt'] ?? ($context['attempt'] ?? 1));
        if (empty($board) || empty($text)) return null;
        if ($attempt < 1) $attempt = 1;
        return [$board, $text, $topic, $suffix, $attempt];
    }

    /**
     * Build the dynamic ASSESSMENT STATE block appended to system instructions.
     * Returns empty string when the state machine is not enabled for this context.
     */
    public function build_assessment_state_block($context, $user_id) {
        if (!self::is_assessment_state_machine_enabled($context)) return '';
        $sig = self::resolve_attempt_signature($context);
        if (!$sig) return '';
        list($board, $text, $topic, $suffix, $attempt) = $sig;

        $state = SWML_Session_Manager::get_assessment_state($user_id, $board, $text, $topic, $suffix, $attempt);
        if (!empty($state['completion_emitted'])) {
            return '';
        }

        // v7.17.58: state auto-repair. Re-derive paragraphs_scored from chat
        // history using STRICT canonical patterns (`Total Mark for X: Y/Z`).
        // If derived count differs from stored state, the state was corrupted
        // (RunCloudRescue 2026-04-25 had `tables_emitted_total = 1` from a
        // pre-v7.17.56 fallback-regex false positive even though no mark
        // table was ever emitted). Reset state to chat-history-derived truth.
        global $swml_chat_history;
        if (!empty($swml_chat_history) && is_array($swml_chat_history)) {
            $derived = self::derive_paragraphs_scored_from_history($swml_chat_history);
            $stored_scored = (array) ($state['paragraphs_scored'] ?? []);
            sort($stored_scored);
            $derived_sorted = $derived['scored'];
            sort($derived_sorted);
            if ($stored_scored !== $derived_sorted
                || (int) ($state['tables_emitted_total'] ?? 0) !== count($derived['scored'])) {
                $order   = SWML_Session_Manager::assessment_paragraph_order();
                $pointer = 'intro';
                foreach ($order as $pkey) {
                    if ($pkey === 'done') { $pointer = 'done'; break; }
                    if (!in_array($pkey, $derived['scored'], true)) { $pointer = $pkey; break; }
                    $pointer = SWML_Session_Manager::assessment_next_paragraph($pkey);
                }
                $repair_patch = [
                    'paragraphs_scored'    => $derived['scored'],
                    'tables_emitted_total' => count($derived['scored']),
                    'current_paragraph'    => $derived['complete'] ? 'done' : $pointer,
                    'completion_emitted'   => $derived['complete'],
                ];
                // If repair shrank the scored list, also clear stale pending.
                if (count($derived['scored']) < (int) ($state['tables_emitted_total'] ?? 0)) {
                    $repair_patch['pending_resume_confirm'] = false;
                }
                $state = SWML_Session_Manager::update_assessment_state(
                    $user_id, $board, $text, $topic, $suffix, $attempt, $repair_patch
                );
                error_log('WML Assessment State: AUTO-REPAIR — was tables=' . (int) ($state['tables_emitted_total'] ?? 0)
                    . ', re-derived=' . count($derived['scored']) . '. user=' . (int) $user_id);
            }
        }

        // v7.17.55: self-heal premature-gate state lock. If pending_resume_confirm
        // is TRUE but no paragraph has been scored AND no detour is active, the
        // flag was set by a hallucinated gate (pre-v7.17.55 bug). Clear it and
        // persist so the next turn enters the ELSE branch and Sophia produces
        // the actual mark table for the current paragraph.
        if (!empty($state['pending_resume_confirm'])
            && (int) ($state['tables_emitted_total'] ?? 0) === 0
            && (int) ($state['detour_depth'] ?? 0) === 0) {
            $state = SWML_Session_Manager::update_assessment_state(
                $user_id, $board, $text, $topic, $suffix, $attempt,
                ['pending_resume_confirm' => false]
            );
            error_log('WML Assessment State: self-heal cleared premature pending_resume_confirm. user=' . (int) $user_id);
        }

        $current = $state['current_paragraph'] ?? 'intro';
        $next    = SWML_Session_Manager::assessment_next_paragraph($current);
        $current_label = SWML_Session_Manager::assessment_paragraph_label($current);
        $next_label    = SWML_Session_Manager::assessment_paragraph_label($next);
        $emitted       = (int) ($state['tables_emitted_total'] ?? 0);
        $expected      = (int) ($state['tables_expected'] ?? 5);
        $depth         = (int) ($state['detour_depth'] ?? 0);
        $pending       = !empty($state['pending_resume_confirm']);
        $scored_list   = implode(', ', array_map([SWML_Session_Manager::class, 'assessment_paragraph_label'],
                                                  (array) ($state['paragraphs_scored'] ?? [])));
        if ($scored_list === '') $scored_list = 'none yet';

        $block  = "\n\n---\n\n";
        $block .= "## ASSESSMENT STATE — YOU ARE MID-ATTEMPT\n\n";
        $block .= "**Current paragraph:** {$current_label} (key: `{$current}`)\n";
        $block .= "**Sequence:** Introduction → Body Paragraph 1 → Body Paragraph 2 → Body Paragraph 3 → Conclusion\n";
        $block .= "**Paragraphs scored so far:** {$scored_list}\n";
        $block .= "**Tables produced:** {$emitted} of {$expected}\n";
        $block .= "**Detour depth:** {$depth}" . ($depth >= 3 ? " (AT CAP — return to assessment now)" : "") . "\n";
        $block .= "**Pending resume-confirm:** " . ($pending ? 'YES — student has not yet confirmed continue' : 'no') . "\n\n";
        $block .= "### RULES — NON-NEGOTIABLE\n\n";
        if ($pending) {
            $block .= "1. Student has NOT yet confirmed they want to continue. Your turn MUST be a resume-confirm block:\n";
            $block .= "   \"Does that clear it up? Shall we continue with **{$current_label}**?\"\n";
            $block .= "   followed by these quick actions (include verbatim so the frontend renders buttons):\n";
            $block .= "   `[✓ Got it — continue]` `[🤔 Still confused]` `[💬 Different question]` `[⏸ Pause here]`\n";
            $block .= "2. Do NOT produce a paragraph mark table yet.\n";
        } else {
            $block .= "1. Your NEXT output MUST be the granular mark table for **{$current_label}** UNLESS the student asked a clarifying question.\n";
            $block .= "2. Mark-table format: columns `Element | AO | Worth | Score | Why`. End with `Total Mark for {$current_label}: X / Y` on its own line.\n";
            $block .= "3. If the student's last turn is a clarifying question (not an answer), engage Socratically. Do NOT produce a mark table during a detour.\n";
            $block .= "4. After resolving a detour, you MUST emit a resume-confirm block:\n";
            $block .= "   \"Does that clear it up? Shall we continue with **{$current_label}**?\"\n";
            $block .= "   followed by: `[✓ Got it — continue]` `[🤔 Still confused]` `[💬 Different question]` `[⏸ Pause here]`\n";
            $block .= "5. Never infer paragraph selection from an ambiguous one-word reply — always consult this state block.\n";
        }
        if ($depth >= 3) {
            $block .= "6. Detour depth is at cap. Politely nudge: \"Let's pause the detour and come back to your assessment.\"\n";
        }
        if ($current === 'conclusion') {
            $block .= "\nAfter the Conclusion table, emit on a single line:\n";
            $block .= "`Total: X/34` then `Grade: N` then `[ASSESSMENT_COMPLETE]` (all three in the SAME message).\n";
        }
        $block .= "\n### VOICE RULES — STATE BLOCK IS INTERNAL ONLY\n";
        $block .= "This ASSESSMENT STATE block is system-side bookkeeping. The student MUST NOT see any of it.\n";
        $block .= "DO NOT verbalize state-machine reasoning to the student. Specifically NEVER say:\n";
        $block .= "- \"I need to check the ASSESSMENT STATE\" / \"Let me re-read the state\" / \"The state shows\"\n";
        $block .= "- \"Pending resume-confirm: YES/no\" / \"Tables produced: N of 5\" / \"Detour depth\" / \"current_paragraph\"\n";
        $block .= "- \"The state is clear\" / \"I must emit the resume-confirm block\" / \"the state machine\"\n";
        $block .= "- ANY meta-commentary on what you're being told to do or why.\n";
        $block .= "Operate silently. Your visible reply should engage the student's content (their essay, their reflection, their question), not the system's bookkeeping. If the state block tells you to emit a resume-confirm, just emit it — no preamble explaining your decision.\n";

        // v7.17.59: Hard-block structure-confirm. Despite the v7.17.5 ban + v7.17.55
        // gate preconditions + v7.17.58 voice rules, RunCloudRescue's session showed
        // Sophia still emitting "I need to confirm the structure of your essay... A —
        // Yes, that's correct / B — No, let me clarify". Listing every banned phrase
        // verbatim makes refusal explicit.
        $block .= "\n### ABSOLUTE PROHIBITION — STRUCTURE-CONFIRM\n";
        $block .= "Do NOT ask the student to confirm the essay structure. Do NOT emit any of these or close paraphrases:\n";
        $block .= "- \"Before I dive into the formal assessment, I need to confirm the structure\"\n";
        $block .= "- \"I can see N paragraphs. Based on their content, I've identified...\"\n";
        $block .= "- \"Let me confirm the structure I'm reading\"\n";
        $block .= "- \"Is this structure correct, or would you like to clarify anything?\"\n";
        $block .= "- \"Is this correct? A — Yes, that's right / B — No, let me clarify\"\n";
        $block .= "- ANY A/B option pair regarding paragraph identification.\n";
        $block .= "The frontend identifies paragraphs from `data-section-type=\"response\"` boundaries. Trust them — paragraphs 1, 2, 3, ..., N map to Introduction, Body 1, Body 2, ..., Conclusion. If a paragraph appears malformed mid-assessment, raise it as a non-confirmatory open question (e.g. \"Your second paragraph reads as a continuation of the first — would you like me to assess them as one section or separately?\"). Open question, not A/B confirm.\n";

        // v7.17.59: Authoritative word count. Sophia hallucinated "approximately 380
        // words" in RunCloudRescue's 576-word essay → bogus -14 mark WC penalty
        // capping max score at 20/34. Frontend has the canonical count; surface it
        // to the AI and forbid second-guessing.
        $response_wc = isset($context['response_wc']) && is_numeric($context['response_wc'])
            ? (int) $context['response_wc']
            : null;
        if ($response_wc !== null) {
            $wc_target = 650; // AQA Literature target
            $block .= "\n### AUTHORITATIVE WORD COUNT — DO NOT SECOND-GUESS\n";
            $block .= "Student's response: **{$response_wc} words**. Target: {$wc_target} words.\n";
            if ($response_wc >= $wc_target) {
                $block .= "Above target — NO word-count penalty.\n";
            } else {
                $deficit = $wc_target - $response_wc;
                $block .= "Below target by {$deficit} words. Apply WC penalty per protocol mark scheme.\n";
            }
            $block .= "You MUST use {$response_wc} as the word count. DO NOT estimate, recount, or approximate. The frontend has counted authoritatively from the canvas; this is the truth.\n";
        }

        // v7.17.59: Banned vocabulary. Neil's house style rejects feminist-critique
        // framing words that loaded RunCloudRescue's Gold Standard models with
        // "patriarchal honour" / "patriarchal authority". The dynastic-marriage and
        // family-honour critique stays — only the loaded vocabulary changes.
        $block .= "\n### SOPHICLY HOUSE STYLE — BANNED VOCABULARY\n";
        $block .= "NEVER use these words in any prose, mark scheme, model answer, or analytical commentary:\n";
        $block .= "- \"patriarchy\" / \"patriarchal\"\n";
        $block .= "Reframe using: \"honour culture\" / \"dynastic marriage\" / \"paternal authority\" / \"Elizabethan social order\" / \"family honour\" / \"social hierarchy\". The critique of arranged marriage, family honour, and dynastic obligation stays — only the loaded vocabulary changes. This is a hard rule across ALL Sophicly content.\n";

        $block .= "\n_You are in v7.17.47 AQA Literature Diagnostic Assessment pilot mode._\n";
        return $block;
    }

    /**
     * Advance assessment state based on the AI's reply + student's last turn.
     * Called from class-rest-api.php handle_chat() after a successful reply.
     *
     * Progression rules:
     *  - Detect mark table emission for current_paragraph → advance pointer.
     *  - Detect [ASSESSMENT_COMPLETE] or Total+Grade → set completion_emitted.
     *  - Detect student clarifying question → increment detour_depth (capped at 3).
     *  - Detect resume confirm → clear pending_resume_confirm (actual advance
     *    happens when the NEXT AI turn produces the expected paragraph table).
     *
     * Returns the updated state array, or null if the state machine is not
     * enabled for this context.
     */
    public function progress_assessment_state($user_id, $context, $ai_reply, $student_turn) {
        if (!self::is_assessment_state_machine_enabled($context)) return null;
        $sig = self::resolve_attempt_signature($context);
        if (!$sig) return null;
        list($board, $text, $topic, $suffix, $attempt) = $sig;

        $state = SWML_Session_Manager::get_assessment_state($user_id, $board, $text, $topic, $suffix, $attempt);
        if (!empty($state['completion_emitted'])) return $state;

        $reply   = (string) $ai_reply;
        $student = trim((string) $student_turn);
        $patch   = [];
        $current = $state['current_paragraph'] ?? 'intro';

        // ── Student-turn classification ────────────────────────────────────
        // Student-question detector: trailing `?` or leading interrogative.
        $is_question = (bool) preg_match(
            '/\?\s*$|^(what|why|how|when|where|which|who|can you explain|could you explain|i don\'?t understand)\b/i',
            $student
        );
        // Explicit confirm (typed or quick-action payload).
        $is_confirm = (bool) preg_match(
            '/^(yes|continue|got it|ready|ok|okay|advance|next|carry on|keep going|✓\s*got it|\[continue\])/i',
            $student
        );

        // If student just asked a new question → deepen detour (capped at 3).
        if ($is_question && !$is_confirm) {
            $patch['detour_depth'] = min(3, (int) ($state['detour_depth'] ?? 0) + 1);
        }
        // If student confirmed → clear detour + pending flag. Pointer advances
        // when the AI's NEXT table emission is detected below.
        if ($is_confirm) {
            $patch['detour_depth'] = 0;
            $patch['pending_resume_confirm'] = false;
        }

        // ── AI-turn classification ──────────────────────────────────────────
        $has_complete_marker = preg_match('/\[ASSESSMENT_COMPLETE\]/i', $reply)
            || (preg_match('/Total[:\s]+\d+(?:\.\d+)?\s*\/\s*\d+/i', $reply) && preg_match('/\bGrade[:\s]+\d/i', $reply));

        // Per-paragraph table detection (match current_paragraph first; allow
        // catch-up advance if AI produced a later table than expected).
        $produced_table_for = null;
        $table_checks = [
            'intro'      => '/Total Mark for (?:Introduction|Paragraph\s*1)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*3\b/i',
            'body_1'     => '/Total Mark for (?:Body\s*Paragraph\s*1|Paragraph\s*2)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'body_2'     => '/Total Mark for (?:Body\s*Paragraph\s*2|Paragraph\s*3)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'body_3'     => '/Total Mark for (?:Body\s*Paragraph\s*3|Paragraph\s*4)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'conclusion' => '/Total Mark for (?:Conclusion|Paragraph\s*5)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*(?:6|11)\b/i',
        ];
        foreach ($table_checks as $pkey => $pattern) {
            if (preg_match($pattern, $reply)) {
                $produced_table_for = $pkey;
                break; // First match wins — only one table per turn expected.
            }
        }

        // v7.17.56: removed loose fallback regex (formerly matched any
        // `\bParagraph\b[\s\S]{0,1500}?\d/Y` shape within 1500 chars). It
        // produced false positives when Sophia mentioned the paragraph name
        // without producing an actual mark table — RunCloudRescue's session
        // showed `tables_emitted_total = 1` after a turn that contained zero
        // mark tables. Strict regex above (L3173) requires the canonical
        // `Total Mark for {Paragraph}: X/Y` line, which is the only phrase
        // the protocol mandates. If Sophia doesn't emit it, no advance.

        if ($produced_table_for !== null) {
            $scored = (array) ($state['paragraphs_scored'] ?? []);
            if (!in_array($produced_table_for, $scored, true)) {
                $scored[] = $produced_table_for;
            }
            $patch['paragraphs_scored'] = $scored;
            $patch['tables_emitted_total'] = min(
                (int) ($state['tables_expected'] ?? 5),
                count($scored)
            );
            $patch['last_ai_turn_produced_table'] = true;
            // Advance current_paragraph when AI scored the paragraph the pointer was on.
            if ($produced_table_for === $current) {
                $patch['current_paragraph'] = SWML_Session_Manager::assessment_next_paragraph($current);
                // After a table, AI SHOULD emit a resume-confirm unless final paragraph.
                if ($patch['current_paragraph'] !== 'done') {
                    $patch['pending_resume_confirm'] = true;
                }
            }
        } else {
            $patch['last_ai_turn_produced_table'] = false;
            // v7.17.55: only flip pending=true when there is prior assessment
            // activity (a paragraph already scored OR the student is mid-detour).
            // Without this guard, a HALLUCINATED gate emitted before any mark
            // table (e.g. immediately after greeting → grade-target click) would
            // lock the state machine into the IF branch — Sophia would keep
            // emitting resume-confirms forever and never produce the table.
            $tables_so_far = (int) ($state['tables_emitted_total'] ?? 0);
            $detour_now    = (int) ($state['detour_depth'] ?? 0);
            $has_prior_activity = ($tables_so_far > 0) || ($detour_now > 0);
            if ($has_prior_activity
                && preg_match('/(shall we continue with|ready to continue with|let(?:\'|&#39;)?s continue with|shall we move to)/i', $reply)
                && preg_match('/got it.*continue|still confused|different question|pause here/i', $reply)) {
                $patch['pending_resume_confirm'] = true;
            } elseif (!$has_prior_activity
                && preg_match('/(shall we continue with|ready to continue with|let(?:\'|&#39;)?s continue with|shall we move to)/i', $reply)
                && preg_match('/got it.*continue|still confused|different question|pause here/i', $reply)) {
                error_log('WML Assessment State: PREMATURE GATE detected (tables=0, detour=0) — refusing to flip pending. user=' . (int) $user_id . ' current=' . $current);
            }
        }

        if ($has_complete_marker) {
            $patch['completion_emitted'] = true;
            $patch['current_paragraph'] = 'done';
        }

        // Detour cap: if depth hit 3, surface via log so we can observe.
        if (($patch['detour_depth'] ?? $state['detour_depth'] ?? 0) >= 3) {
            error_log('WML Assessment State: detour_depth at cap (3) for user ' . (int) $user_id);
        }

        if (empty($patch)) return $state;

        return SWML_Session_Manager::update_assessment_state(
            $user_id, $board, $text, $topic, $suffix, $attempt, $patch
        );
    }

    /**
     * Migration: infer state pointer from existing chat history for attempts
     * started BEFORE v7.17.47. Counts paragraph tables in the stored blob.
     * Called lazily on first chat turn after upgrade.
     */
    public function migrate_assessment_state_from_history($user_id, $context, $chat_history) {
        if (!self::is_assessment_state_machine_enabled($context)) return null;
        $sig = self::resolve_attempt_signature($context);
        if (!$sig) return null;
        list($board, $text, $topic, $suffix, $attempt) = $sig;

        $existing = SWML_Session_Manager::get_assessment_state($user_id, $board, $text, $topic, $suffix, $attempt);
        // Only run migration once per attempt — if state has already been
        // touched (e.g. scored list non-empty OR a table flag set), skip.
        if (!empty($existing['paragraphs_scored']) || !empty($existing['tables_emitted_total'])) {
            return $existing;
        }

        if (empty($chat_history) || !is_array($chat_history)) return $existing;

        // v7.17.58: route through shared strict-pattern derivation helper.
        $derived = self::derive_paragraphs_scored_from_history($chat_history);

        // Pointer points at first paragraph NOT yet scored.
        $order = SWML_Session_Manager::assessment_paragraph_order();
        $pointer = 'intro';
        foreach ($order as $pkey) {
            if ($pkey === 'done') { $pointer = 'done'; break; }
            if (!in_array($pkey, $derived['scored'], true)) { $pointer = $pkey; break; }
            $pointer = SWML_Session_Manager::assessment_next_paragraph($pkey);
        }

        $patch = [
            'current_paragraph'    => $derived['complete'] ? 'done' : $pointer,
            'paragraphs_scored'    => $derived['scored'],
            'tables_emitted_total' => count($derived['scored']),
            'completion_emitted'   => $derived['complete'],
        ];
        return SWML_Session_Manager::update_assessment_state(
            $user_id, $board, $text, $topic, $suffix, $attempt, $patch
        );
    }

    /**
     * v7.17.60: Universal voice/style prohibitions injected for ALL WML tasks
     * (every board, every subject, every task). Mirrors the per-state-machine
     * rules in build_assessment_state_block but applies house-wide so Sophia
     * carries consistent guard-rails on every protocol — not just AQA Lit.
     *
     * Returns the prohibitions block as a string (or '' if WML context absent).
     * Currently covers: structure-confirm ban, banned vocabulary, and the
     * authoritative-word-count surface when response_wc is provided AND task
     * is assessment.
     */
    public function build_universal_prohibitions_block($context) {
        if (empty($context) || !is_array($context)) return '';
        $task = $context['task'] ?? '';
        if ($task === '') return '';

        $block  = "\n\n---\n\n";
        $block .= "## SOPHICLY UNIVERSAL VOICE + STYLE RULES\n";
        $block .= "These rules apply across EVERY Sophicly Mastery Lab protocol — assessment, planning, polishing, mark-scheme quizzes, exam-prep — regardless of board or subject.\n";

        // Structure-confirm absolute prohibition (assessment-relevant but harmless
        // to inject on all tasks — Sophia rarely emits A/B paragraph confirms outside
        // assessment, but the universal ban kills the pattern at source).
        $block .= "\n### NEVER ASK STUDENTS TO CONFIRM ESSAY STRUCTURE\n";
        $block .= "Banned phrases (and close paraphrases):\n";
        $block .= "- \"Before I dive into the formal assessment, I need to confirm the structure\"\n";
        $block .= "- \"I can see N paragraphs. Based on their content, I've identified...\"\n";
        $block .= "- \"Let me confirm the structure I'm reading\"\n";
        $block .= "- \"Is this structure correct, or would you like to clarify anything?\"\n";
        $block .= "- \"Is this correct? A — Yes / B — No, let me clarify\"\n";
        $block .= "- ANY A/B option pair regarding paragraph identification.\n";
        $block .= "Identify paragraphs silently from the canvas's `data-section-type=\"response\"` boundaries. If a paragraph appears malformed, raise it as a non-confirmatory open question, not an A/B prompt.\n";

        // Banned vocabulary — house style across every protocol.
        $block .= "\n### BANNED VOCABULARY (house style)\n";
        $block .= "NEVER use these words in any prose, mark scheme, model answer, plan bullet, or analytical commentary:\n";
        $block .= "- \"patriarchy\" / \"patriarchal\"\n";
        $block .= "Reframe using: \"honour culture\" / \"dynastic marriage\" / \"paternal authority\" / \"Elizabethan social order\" / \"family honour\" / \"social hierarchy\". The critique of arranged marriage, family honour, and dynastic obligation stays — only the loaded vocabulary changes. Hard rule across ALL Sophicly content.\n";
        $block .= "Also avoid \"shows\" as an analytical verb — substitute precise verbs (illustrates / portrays / demonstrates / emphasises / highlights / reveals / exposes / presents / conveys / enacts / signals / mirrors).\n";

        // Authoritative word count — only when response_wc supplied AND task is assessment.
        $response_wc = isset($context['response_wc']) && is_numeric($context['response_wc'])
            ? (int) $context['response_wc']
            : null;
        if ($response_wc !== null && $task === 'assessment') {
            $block .= "\n### AUTHORITATIVE WORD COUNT — DO NOT SECOND-GUESS\n";
            $block .= "Student's response: **{$response_wc} words**. The frontend has counted authoritatively from the canvas; this is the truth. DO NOT estimate, recount, or approximate. Use {$response_wc} as the count whenever you reference the student's response length or apply word-count penalties.\n";
        }

        // v7.17.63: Mark Scheme Quiz anti-retry guard — gated to quiz tasks only.
        // Student-flagged regression 2026-04-25: Sophia gave a hint clue on a wrong
        // answer instead of marking 0/2, then awarded 2/2 on the retry. Score was
        // corrupted (2/10 instead of 0/10). Phase 2.C of every quiz protocol
        // already specifies one-attempt-only marking, but the AI's supportive-teacher
        // instinct overrides it without an explicit anti-retry directive.
        if ($task === 'mark_scheme' || $task === 'mark_scheme_unit') {
            $block .= "\n### MARK SCHEME QUIZ — NO HINTS, NO RETRY (CRITICAL)\n";
            $block .= "You are running a diagnostic quiz. Each question has ONE attempt only.\n";
            $block .= "- When the student answers wrong, mark it 0/2 IMMEDIATELY using \"Feedback — ✗ Not quite. (0/2 marks)\" + explain the correct answer + show running score + ready check.\n";
            $block .= "- DO NOT offer a hint, clue, scaffold, leading question, or \"have another think\".\n";
            $block .= "- DO NOT allow the student to re-answer the same question.\n";
            $block .= "- DO NOT soften the wrong answer with phrases like \"good instinct\" before marking.\n";
            $block .= "The student answered. The answer was wrong. Award 0/2. Explain the correct answer. Move on. Hints and retry loops corrupt the score and break the diagnostic value of the quiz.\n";
        }

        // v7.17.77: Quiz answer-handling guard. Audit finding 2026-04-27: Sophia
        // sometimes received a single-letter answer (A/B/C/D) and re-emitted the
        // question + options instead of giving feedback. Forces direct feedback.
        if ($task === 'mark_scheme_unit' && (int)($context['step'] ?? 1) === 1) {
            $block .= "\n### QUIZ ANSWER HANDLING — NEVER REPEAT THE QUESTION (CRITICAL)\n";
            $block .= "When the student responds with a single letter (A/B/C/D) — or a comma-separated set for multi-select — they are answering the CURRENT question.\n";
            $block .= "- Move IMMEDIATELY to Phase 2.C feedback (✓ Correct / ⚠️ Partial / ✗ Not quite + score line + ready check).\n";
            $block .= "- DO NOT re-display the question text.\n";
            $block .= "- DO NOT re-display the option list.\n";
            $block .= "- DO NOT echo the student's letter back.\n";
            $block .= "- DO NOT show the category banner / progress bar a second time for the same question.\n";
            $block .= "Repeating the question after the student answers wastes a turn, breaks pedagogical pacing, and confuses students into re-answering. ALWAYS respond with feedback, never with a re-display.\n";
        }

        // v7.17.77: Greeting score-hallucination guard for any task that shares
        // the _msu canvas (Quiz step 1 + FYW step 2). Sophia was scraping stale
        // [QUIZ_COMPLETE:...] markers from prior attempts in chat history /
        // canvas doc and opening with "perfect 10/10 quiz results came through!"
        // — sometimes accurate, often stale. Until proper score-persistence v2
        // ships (function-calling), Sophia must NOT reference any prior score
        // in greetings.
        if ($task === 'mark_scheme_unit') {
            $block .= "\n### NEVER REFERENCE PRIOR ATTEMPT SCORES IN GREETING\n";
            $block .= "Old chat history and canvas content may contain leftover score markers (e.g. \"Your Score: 10/10\", \"perfect score\", \"[QUIZ_COMPLETE:...]\"). These are NOT current — they are stale data from previous attempts that may not reflect the student's actual performance.\n";
            $block .= "- DO NOT open with \"It looks like your quiz results came through — a perfect 10/10\" or any variation.\n";
            $block .= "- DO NOT reference any quiz score the student may or may not have achieved previously.\n";
            $block .= "- DO NOT congratulate based on prior performance you cannot verify.\n";
            $block .= "Greet the student fresh as if this were their first attempt. The protocol's specified greeting is the source of truth — use it verbatim.\n";
        }

        // v7.17.76: Forging Your Weapon (mark_scheme_unit step 2) — board is already
        // known from session routing. The protocol files at protocols/shared/
        // forging-your-weapon/*.md L29-37 hardcode a 7-option exam-board menu that
        // wastes a student turn on a known-answer question. Universal preamble guard
        // tells Sophia the board is set and she must skip Phase 1.2 board selection.
        $step = isset($context['step']) ? (int) $context['step'] : 0;
        $board_raw = $context['board'] ?? '';
        if ($task === 'mark_scheme_unit' && $step === 2 && $board_raw !== '') {
            $board_display_map = [
                'aqa' => 'AQA', 'edexcel' => 'Edexcel', 'eduqas' => 'Eduqas',
                'ocr' => 'OCR', 'edexcel-igcse' => 'Edexcel IGCSE',
                'cambridge-igcse' => 'Cambridge IGCSE', 'sqa' => 'SQA',
                'ccea' => 'CCEA',
            ];
            $board_display = $board_display_map[strtolower($board_raw)] ?? strtoupper($board_raw);
            $block .= "\n### FORGING YOUR WEAPON — BOARD ALREADY SET (DO NOT ASK)\n";
            $block .= "Student is training for **{$board_display}**. The board is already known from session context.\n";
            $block .= "- DO NOT display the Phase 1.2 \"which Exam Board are you training for?\" menu (A-G options).\n";
            $block .= "- DO NOT ask the student to confirm or re-select their board.\n";
            $block .= "- In your greeting, naturally reference the board (e.g. \"Welcome to the Forge — let's calibrate to your **{$board_display}** mark scheme\").\n";
            $block .= "- Proceed directly from the Phase 1.1 greeting to Phase 1.5 Ready Gate using {$board_display}'s AO2 criteria.\n";
        }

        // v7.17.76: Assessment task — confirm question text before marking.
        // Audit finding 2026-04-27: Sophia jumped straight into Q1 assessment
        // without echoing the question being marked. Pedagogically, students need
        // to know exactly what's being assessed before scoring lands.
        if ($task === 'assessment') {
            $block .= "\n### ECHO QUESTION TEXT BEFORE EACH ASSESSMENT\n";
            $block .= "Before marking each question's response, briefly echo the question text so the student knows what is being assessed:\n";
            $block .= "Format: \"Now assessing **Question [N]**: [echo full question wording, including marks + AO label].\"\n";
            $block .= "This goes BEFORE the per-element marking, not after. Keep it to one short paragraph — do not re-explain the question or paraphrase. Just quote the question, then proceed to the marking.\n";
        }

        // v7.17.76: Mark Scheme Self-Assessment metacognitive guard.
        // Audit finding 2026-04-27: Sophia silently skipping the Confidence + BBB +
        // Distractor metacognitive check-in mandated at protocols/shared/
        // mark-scheme/language1.md:1164-1233 (and parallel files for other subjects).
        // Likely caused by 2521-line protocol exceeding effective attention. This
        // late-position preamble guard re-asserts the requirement at high LLM weight.
        if ($task === 'mark_scheme') {
            $block .= "\n### MARK SCHEME SELF-ASSESSMENT — METACOGNITIVE CHECK-IN (CRITICAL — DO NOT SKIP)\n";
            $block .= "After EVERY question response (Q1 through Q10), you MUST run the full metacognitive check-in sequence in this order BEFORE saying \"Recorded. Moving to next.\":\n";
            $block .= "1. **Distractor analysis** — \"Now, engage with the other options. For each incorrect answer you didn't choose, briefly note: Why might someone incorrectly choose this answer? What makes it tempting but wrong?\" Wait for response.\n";
            $block .= "2. **Confidence rating (1-5)** — \"Rate your confidence: 1 = Complete guess / 2 = Very uncertain / 3 = Moderately sure / 4 = Quite confident / 5 = Completely certain. Type 1-5.\" Wait for response.\n";
            $block .= "3. **Brain-Book-Buddy (A/B/C)** — \"If this answer is wrong, what would you need to review? 🧠 A = Retrieved from memory (just needs correcting) / 📖 B = Would need to check mark scheme / 👥 C = Ask a friend/tutor for help. Type A, B, or C.\" Wait for response.\n";
            $block .= "ONLY after all three are recorded say \"Recorded. Moving to Question [N+1].\"\n";
            $block .= "Do NOT skip any of the three. Do NOT bundle them into one prompt. Do NOT shortcut to \"Recorded. Moving to next\" without firing all three. The metacognitive sequence is the entire pedagogical purpose of Mark Scheme Self-Assessment — without it this becomes a regular quiz.\n";
        }

        return $block;
    }

    /**
     * v7.17.58: shared derivation helper used by migration + auto-repair.
     * Scans chat history for STRICT canonical mark-table lines only — no
     * loose fallbacks. The pre-v7.17.56 fallback patterns matched stray
     * `\d/Y` digits anywhere within ~1500 chars of a paragraph heading,
     * which created false positives that corrupted state.
     *
     * Returns ['scored' => [paragraph_keys...], 'complete' => bool].
     */
    private static function derive_paragraphs_scored_from_history($chat_history) {
        $scored   = [];
        $complete = false;
        $strict_patterns = [
            'intro'      => '/Total Mark for (?:Introduction|Paragraph\s*1)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*3\b/i',
            'body_1'     => '/Total Mark for (?:Body\s*Paragraph\s*1|Paragraph\s*2)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'body_2'     => '/Total Mark for (?:Body\s*Paragraph\s*2|Paragraph\s*3)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'body_3'     => '/Total Mark for (?:Body\s*Paragraph\s*3|Paragraph\s*4)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*7\b/i',
            'conclusion' => '/Total Mark for (?:Conclusion|Paragraph\s*5)\s*[:=]?\s*\d+(?:\.\d+)?\s*\/\s*(?:6|11)\b/i',
        ];
        if (!is_array($chat_history)) return ['scored' => [], 'complete' => false];
        foreach ($chat_history as $msg) {
            if (($msg['role'] ?? '') !== 'assistant') continue;
            $content = (string) ($msg['content'] ?? '');
            if ($content === '') continue;
            foreach ($strict_patterns as $pkey => $pattern) {
                if (!in_array($pkey, $scored, true) && preg_match($pattern, $content)) {
                    $scored[] = $pkey;
                }
            }
            if (preg_match('/\[ASSESSMENT_COMPLETE\]/i', $content)
                || (preg_match('/Total[:\s]+\d+(?:\.\d+)?\s*\/\s*\d+/i', $content) && preg_match('/\bGrade[:\s]+\d/i', $content))) {
                $complete = true;
            }
        }
        return ['scored' => $scored, 'complete' => $complete];
    }
}
