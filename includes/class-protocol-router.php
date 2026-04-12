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

        error_log("WML Router: Final instructions = " . strlen($query->instructions) . " chars for botId={$bot_id}");

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
        $board   = $context['board'] ?? 'aqa';
        $subject = $context['subject'] ?? '';
        $task    = $context['task'] ?? 'planning';
        $step    = (int) ($context['step'] ?? 1);

        // Security: restrict board to known values — prevent path traversal (v7.15.2)
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
        if ($task === 'conceptual_notes' && $subject === 'language1' && $board === 'edexcel_igcse') {
            $protocol_group = 'nonfiction';
            $manifest_path = $plugin_dir . "protocols/shared/nonfiction/manifest.json";
        }

        // Fallback logic: board-specific tasks need their own protocol; shared tasks use shared/literature
        $protocol_board = $board;
        $shared_tasks = ['essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice'];
        
        if (!file_exists($manifest_path)) {
            if (in_array($task, $shared_tasks)) {
                // Shared TTECEA+C tasks — load from shared/literature
                $protocol_board = 'shared';
                $manifest_path = $plugin_dir . "protocols/shared/{$protocol_group}/manifest.json";
            } else {
                // Board-specific task (assessment, exam_question, planning, polishing)
                // These need either the board's own protocol or AQA fallback for planning/polishing
                $universal_essay_tasks = ['planning', 'polishing'];
                $fallback_boards = ['ocr', 'eduqas', 'edexcel', 'edexcel-igcse'];
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

        foreach ($files as $file) {
            // Resolve path: check board-specific first, then shared
            $full_path = $base_path . '/' . $file;
            if (!file_exists($full_path)) {
                $full_path = $shared_path . '/' . $file;
            }

            if (file_exists($full_path)) {
                $content = file_get_contents($full_path);
                if (!empty(trim($content))) {
                    $parts[] = $content;
                    $loaded_count++;
                }
            } else {
                $missing[] = $file;
            }
        }

        // If any files are missing, log warning but don't fail
        if (!empty($missing)) {
            error_log("WML Router: Missing module files: " . implode(', ', $missing));
        }

        // Require minimum loaded files to consider this valid
        // Self-contained protocols (exam_question, essay_plan) need only 1 file; standard protocols need 2+
        // AQA uses modular protocols (many small files), shared is semi-modular (conceptual_notes = 9 files)
        // All current boards now modular. Only future boards not yet listed would be monolithic.
        $is_monolithic = (!in_array($protocol_board, ['aqa', 'shared', 'ocr', 'eduqas', 'edexcel', 'edexcel-igcse', 'ccea', 'sqa', 'cambridge-igcse']));
        $single_file_tasks = ['exam_question', 'exam_question_modern', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'memory_practice'];
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

            case 'edexcel_igcse':
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
            'edexcel_igcse' => [
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
            'cambridge_igcse' => [
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
        $user = get_userdata($user_id);
        $student_name = $user ? $user->display_name : 'Student';
        $first_name = $user ? ($user->first_name ?: $user->display_name) : 'Student';

        // Task → Protocol mapping
        $protocol_map = [
            'planning'     => 'Protocol B (Essay Planning)',
            'assessment'   => 'Protocol A (Essay Assessment)',
            'polishing'    => 'Protocol C (Prose Polishing)',
            'mark_scheme'  => 'Mark Scheme Self-Assessment',
        ];
        $task = $context['task'] ?? 'planning';
        $protocol_label = $protocol_map[$task] ?? 'Protocol B (Essay Planning)';

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
            $is_nonfiction = ($subject === 'nonfiction_anthology')
                || ($subject === 'language1' && $board === 'edexcel_igcse');
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
            $preamble .= "Call `save_session_element` for each of these as they are determined:\n";
            $preamble .= "- `question_text` — the essay question being assessed\n";
            $preamble .= "- `goal` — the student's assessment goal\n";
            $preamble .= "- `ao1_score` — AO1 score (e.g. '12/20')\n";
            $preamble .= "- `ao2_score` — AO2 score\n";
            $preamble .= "- `ao3_score` — AO3 score\n";
            $preamble .= "- `ao4_score` — (deprecated, no longer used — AO4 marks absorbed into section criteria)\n";
            $preamble .= "- `total_score` — total marks\n";
            $preamble .= "- `grade` — grade/level achieved\n";
            $preamble .= "- `strength_1` — key strength identified\n";
            $preamble .= "- `target_1` — priority improvement target\n";
            $preamble .= "- `target_2` — second improvement target\n";
            $preamble .= "\n### MARK BREAKDOWN TABLE FORMAT\n";
            $preamble .= "For each section assessment, deliver feedback in this order:\n";
            $preamble .= "1. **Detailed prose feedback FIRST** — 'What you did well', 'Where you lost marks' (with specific explanations, quotes from their essay, and improvement advice). This should be thorough and educational.\n";
            $preamble .= "2. **Simple score table LAST** — AFTER all detailed feedback, show a markdown table with columns: `| Criterion | Worth | Score |`. NO 'Why' column — the numbers only. The detailed explanations have already been given in the prose above.\n";
            $preamble .= "3. **Penalties** — list below the table as bullet points with code + deduction.\n\n";
            $preamble .= "### ⛔ PARAGRAPH STRUCTURE DETECTION — HARD GATE\n";
            $preamble .= "The student's essay is injected with neutral labels: === PARAGRAPH 1 ===, === PARAGRAPH 2 ===, etc. You MUST determine each paragraph's function by reading its CONTENT — do NOT assume by position.\n\n";
            $preamble .= "**Detection rules:**\n";
            $preamble .= "- **Introduction** = contains a hook/opening claim, contextual backdrop, and/or a thesis statement. Does NOT contain technique analysis with evidence (quotes). Many diagnostic students will NOT have an introduction — they may jump straight into PEE/PEEL body paragraphs.\n";
            $preamble .= "- **Body paragraph** = contains a point + evidence (quote) + explanation/analysis. Most students write PEE, PEEL, or TTECEA structure. If a paragraph analyses a quote from the text, it is a body paragraph.\n";
            $preamble .= "- **Conclusion** = synthesises the argument, restates themes, does NOT introduce new evidence/quotes. Many diagnostic students will NOT have a conclusion.\n\n";
            $preamble .= "**⛔ MANDATORY CONFIRMATION STEP — you CANNOT begin assessment until the student confirms.**\n\n";
            $preamble .= "**Step 1 — State your detection.** Say exactly: 'Before I assess your essay, I need to confirm the structure. I can see [N] paragraphs. Based on their content, I've identified:' then list each paragraph with its detected function, e.g.:\n";
            $preamble .= "- Paragraph 1 → Introduction (contains a claim about [theme] but no evidence/quotes)\n";
            $preamble .= "- Paragraph 2 → Body Paragraph 1 (analyses [quote] using [technique])\n";
            $preamble .= "- Paragraph 3 → Body Paragraph 2 (analyses [quote])\n";
            $preamble .= "- etc.\n\n";
            $preamble .= "**Step 2 — Ask for confirmation.** End with: 'Is this correct?'\n";
            $preamble .= "Offer two options:\n";
            $preamble .= "- A — Yes, that's correct\n";
            $preamble .= "- B — No, let me clarify\n\n";
            $preamble .= "**Step 3 — If student says No:**\n";
            $preamble .= "Ask: 'No problem — please tell me the structure you intended. For example: Paragraph 1 is my introduction, Paragraphs 2-4 are body paragraphs, Paragraph 5 is my conclusion.'\n";
            $preamble .= "Accept whatever the student says and use THEIR stated structure for the rest of the assessment. Do not argue with the student's classification.\n\n";
            $preamble .= "**Step 4 — Only after confirmation (A or student's correction), proceed to the self-reflection and assessment.**\n\n";
            $preamble .= "**Extra paragraphs (more than 5):** Assess them ALL. Note that the standard essay structure is 5 paragraphs (intro + 3 body + conclusion), but do not penalise extra body paragraphs heavily — a brief structural observation is sufficient.\n\n";
            $preamble .= "**Fewer than 5 paragraphs:** If the student has only written body paragraphs with no introduction or conclusion, acknowledge this as a structural observation and assess all paragraphs as body paragraphs. The missing intro/conclusion will naturally reduce their total score since those section marks cannot be awarded.\n\n";
            $preamble .= "### SECTION BOUNDARY RULE\n";
            $preamble .= "CRITICAL: Assess ONLY the text within each === PARAGRAPH N === boundary. Do NOT bleed content from one paragraph into another's assessment.\n\n";
            $preamble .= "### MARK CEILING — STATE UPFRONT\n";
            $preamble .= "If the essay is missing body paragraphs or has a word count penalty, state the MAXIMUM ACHIEVABLE SCORE immediately when you first identify the issue — do NOT defer it to the end.\n\n";
            $preamble .= "### TECHNICAL ACCURACY (SPaG)\n";
            $preamble .= "AO4 marks are fully absorbed into the section criteria — there is NO separate AO4 assessment step. All marks are distributed across introduction, body paragraphs, and conclusion. SPaG quality is handled through penalty codes (G1, H1, P1) applied during section assessment. At the end of all section assessments, provide a brief qualitative comment on technical accuracy (spelling, punctuation, grammar) but do NOT assign any separate AO4 mark.\n";

            // v7.14.69: Language paper multi-question assessment awareness
            $raw_subject = $context['subject'] ?? '';
            if (stripos($raw_subject, 'language') !== false) {
                $preamble .= "\n### MULTI-QUESTION LANGUAGE PAPER ASSESSMENT\n\n";
                $preamble .= "This is a LANGUAGE PAPER with multiple exam questions. The student's document contains separate response sections for each question (e.g. `=== Q2 RESPONSE [response] ===`, `=== Q3 RESPONSE [response] ===`, etc.).\n\n";
                $preamble .= "**Assessment sequence:**\n";
                $preamble .= "1. Assess EACH response section independently, in question order\n";
                $preamble .= "2. Each question has its OWN mark allocation (from the `[question]` section) — do NOT use the same marks for every response\n";
                $preamble .= "3. For each response: detect paragraph structure, confirm with student, assess, provide feedback + score table\n";
                $preamble .= "4. After ALL responses are assessed, provide a combined summary with the grand total\n\n";
                $preamble .= "**Important differences from single-essay assessment:**\n";
                $preamble .= "- Short-answer questions (1-5 marks) need brief assessment, not full paragraph structure analysis\n";
                $preamble .= "- Analysis questions (5-15 marks) need technique identification and evidence quality assessment\n";
                $preamble .= "- Only extended writing responses (20+ marks) need the full paragraph structure detection + confirmation flow\n";
                $preamble .= "- The `Total: X/Y` at the end should reflect the sum of ALL question scores, not just one response\n\n";
            }

            // ── END-OF-ASSESSMENT RULES (v7.11.99) ──
            $preamble .= "\n### ⛔ END-OF-ASSESSMENT — CRITICAL RULES\n";
            $preamble .= "When you reach the final Summary & Action Plan step:\n";
            $preamble .= "1. **Score format** — You MUST output the total score on a labelled line: `Total: X/Y` (e.g. 'Total: 8.5/34'). You MUST output the grade on a labelled line: `Grade: Z` (e.g. 'Grade 2'). The frontend uses regex to extract these — unlabelled numbers will NOT be captured.\n";
            $preamble .= "2. **No task menu** — Do NOT offer 'What would you like to focus on next? A) Start a new assessment, B) Plan an essay, C) Polish my writing'. This is OBSOLETE. The student's next action is to mark the phase complete using a button that appears automatically in the chat.\n";
            $preamble .= "3. **No panel saves** — Do NOT say 'Shall I confirm these to your panel?' or 'Let me save this to your panel'. The right-side panel is no longer used. Instead, tell the student: 'Copy the feedback from this session into the Feedback sections of your workbook document.'\n";
            $preamble .= "4. **Closing message** — Your final message should: (a) summarise the total score and grade, (b) state the key strength and 1-2 priority targets, (c) remind the student to copy feedback into their workbook, (d) end with encouragement. Do NOT ask any further questions or offer choices.\n";
            $preamble .= "5. **AO selection** — When asking which assessment objectives a paragraph targets, say 'Select all that apply' so the student can choose multiple AOs. Students typically target 2-3 AOs per paragraph.\n";

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
}
