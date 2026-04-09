<?php
/**
 * WML Topic Markdown Parser v3.0
 *
 * Parses topic question markdown in 56+ format patterns across all exam boards.
 * Called by SWML_Topic_Questions::parse_markdown_topics().
 *
 * Storage strategy:
 * - Core fields (question_text, extract_text, marks, aos, part_a_*, part_b_*) → flat fields
 * - Format-specific data (context, instruction, intro, sub-questions, source texts, glossary) → metadata JSON
 * - question_format identifies which parser branch was used
 *
 * @since 7.10.65
 */

if (!defined('ABSPATH')) exit;

class SWML_Topic_Parser {

    /**
     * Default topic structure — all fields initialised
     */
    private static function defaults() {
        return [
            'topic_number'             => 0,
            'label'                    => '',
            'topic_type'               => '',
            'teaching_point'           => '',
            'question_format'          => 'single',
            // Poetry/Unseen metadata
            'focus_poem'               => '',
            'focus_poet'               => '',
            'comparison_poem'          => '',
            'comparison_poet'          => '',
            // Single-question fields
            'question_text'            => '',
            'extract_text'             => '',
            'extract_location'         => '',
            'marks'                    => 30,
            'aos'                      => 'AO1,AO2,AO3',
            // Part A fields
            'part_a_question'          => '',
            'part_a_extract'           => '',
            'part_a_extract_location'  => '',
            'part_a_marks'             => 0,
            'part_a_aos'               => '',
            // Part B fields
            'part_b_question'          => '',
            'part_b_extract'           => '',
            'part_b_marks'             => 0,
            'part_b_aos'               => '',
            // New v3.0 fields
            'context'                  => '',
            'instruction'              => '',
            'intro'                    => '',
            'metadata'                 => '{}',
            'task'                     => 'planning',
            'updated_at'               => '',
        ];
    }

    /**
     * Main entry point — parse full markdown into topic array
     */
    public static function parse($markdown) {
        $topics = [];
        $blocks = preg_split('/^#\s+Topic\s+(\d+)\s*[:—–\-]\s*/mi', $markdown, -1, PREG_SPLIT_DELIM_CAPTURE);

        for ($i = 1; $i < count($blocks) - 1; $i += 2) {
            $topic = self::defaults();
            $topic['topic_number'] = (int) $blocks[$i];
            $topic['updated_at']   = current_time('mysql');
            $content = trim($blocks[$i + 1]);

            // Extract label from first line
            $lines = explode("\n", $content);
            $topic['label'] = trim($lines[0]);

            // Parse common metadata
            self::parse_common_metadata($topic, $content);

            // Detect format and dispatch to appropriate parser
            $format = self::detect_format($topic, $content);
            $topic['question_format'] = $format;

            switch ($format) {
                case 'either_or':
                    self::parse_either_or($topic, $content);
                    break;
                case 'dual_extract':
                    self::parse_dual_extract($topic, $content);
                    break;
                case 'dual_poem':
                    self::parse_dual_poem($topic, $content);
                    break;
                case 'dual':
                    self::parse_dual($topic, $content);
                    break;
                case 'poetry':
                    self::parse_poetry($topic, $content);
                    break;
                case 'unseen':
                    self::parse_unseen($topic, $content);
                    break;
                case 'multi_question':
                    self::parse_multi_question($topic, $content);
                    break;
                case 'multi_option':
                    self::parse_multi_option($topic, $content);
                    break;
                case 'dual_task':
                    self::parse_dual_task($topic, $content);
                    break;
                default:
                    self::parse_single($topic, $content);
                    break;
            }

            // Parse top-level context/instruction/intro (may be overridden by format-specific parser)
            if (!$topic['context'])    self::extract_field($topic, 'context', $content, '/^##\s*Context\s*\n(.*?)(?=\n##|\n---|\z)/si');
            if (!$topic['instruction']) self::extract_field($topic, 'instruction', $content, '/^##\s*Instruction\s*\n(.*?)(?=\n##|\n---|\z)/si');
            if (!$topic['intro'])       self::extract_field($topic, 'intro', $content, '/^##\s*Intro\s*\n(.*?)(?=\n##|\n---|\z)/si');

            $topics[] = $topic;
        }

        return $topics;
    }

    // ═══════════════════════════════════════════
    //  FORMAT DETECTION
    // ═══════════════════════════════════════════

    private static function detect_format(&$topic, $content) {
        // Explicit format metadata overrides auto-detection
        if (preg_match('/\*\*Format:\*\*\s*(.+)/i', $content, $m)) {
            $fmt = trim(strtolower($m[1]));
            $valid = ['single','dual','either_or','dual_extract','dual_poem','poetry','unseen','multi_question','multi_option','dual_task'];
            if (in_array($fmt, $valid)) return $fmt;
        }

        // Auto-detect by heading patterns (ordered most specific → least specific)

        // Either/Or (OCR Lit, Edexcel Lit, CCEA Lit, Cambridge IGCSE)
        if (preg_match('/^##\s*Either\b/mi', $content) && preg_match('/^##\s*Or\b/mi', $content)) {
            // Check if it's a dual-extract (OCR Modern Text — "Part A — Compare Extracts")
            if (preg_match('/^##\s*Part\s*A\s*—?\s*Compare\s*Extracts/mi', $content)) return 'dual_extract';
            return 'either_or';
        }

        // Dual poem (OCR Poetry — "## Poems" heading with ## Part A / ## Part B)
        if (preg_match('/^##\s*Poems?\s*$/mi', $content) && preg_match('/^##\s*Part\s*A/mi', $content)) return 'dual_poem';

        // Multi-option writing (3+ ## Option or ## Either + ## Or with writing prompts)
        if (preg_match('/^##\s*Option\s+[1234]/mi', $content)) return 'multi_option';

        // Dual task (EDUQAS lang2 writing — ## Task 1 + ## Task 2)
        if (preg_match('/^##\s*Task\s*1\b/mi', $content) && preg_match('/^##\s*Task\s*2\b/mi', $content)) return 'dual_task';

        // Single task (CCEA lang writing — ## Task alone)
        if (preg_match('/^##\s*Task\s*$/mi', $content) && !preg_match('/^##\s*Task\s*[12]/mi', $content)) return 'single';

        // Multi-question papers (## Q1 or ## Q1.1 or ## Q1(a) patterns)
        if (preg_match('/^##\s*Q\d/mi', $content)) return 'multi_question';

        // Dual Part A/B (EDUQAS Shakespeare, Edexcel 19C etc.)
        if (preg_match('/^##\s*Part\s*A/mi', $content)) return 'dual';

        // Poetry (Section A + Section B)
        if (preg_match('/^##\s*Section\s*A/mi', $content)) return 'poetry';

        // Unseen (Q27.1/Q27.2 or Q3.1/Q3.2)
        if (preg_match('/^##\s*Q(?:27|3)\.1/mi', $content)) return 'unseen';

        // Source-based single (## Source or ## Text One — language reading)
        if (preg_match('/^##\s*(?:Source\s*[AB]?|Text\s*(?:One|Two|1|2)|21st\s*Century|19th\s*Century|Non-Fiction|Media|Passage)\b/mi', $content)) return 'multi_question';

        return 'single';
    }

    // ═══════════════════════════════════════════
    //  COMMON METADATA PARSING
    // ═══════════════════════════════════════════

    private static function parse_common_metadata(&$topic, $content) {
        if (preg_match('/\*\*Type:\*\*\s*(.+)/i', $content, $m)) $topic['topic_type'] = trim(strtolower($m[1]));
        if (preg_match('/\*\*Task:\*\*\s*(.+)/i', $content, $m)) $topic['task'] = trim(strtolower($m[1]));
        if (preg_match('/\*\*Teaching Point:\*\*\s*(.+?)(?=\n##|\n\*\*|\z)/si', $content, $m)) $topic['teaching_point'] = trim($m[1]);

        // Poetry metadata
        if (preg_match('/\*\*(?:Focus Poem|Poem 1 Title):\*\*\s*(.+)/i', $content, $m)) $topic['focus_poem'] = trim($m[1]);
        if (preg_match('/\*\*(?:Focus Poet|Poem 1 Poet):\*\*\s*(.+)/i', $content, $m)) $topic['focus_poet'] = trim($m[1]);
        if (preg_match('/\*\*(?:Comparison Poem|Poem 2 Title):\*\*\s*(.+)/i', $content, $m)) $topic['comparison_poem'] = trim($m[1]);
        if (preg_match('/\*\*(?:Comparison Poet|Poem 2 Poet):\*\*\s*(.+)/i', $content, $m)) $topic['comparison_poet'] = trim($m[1]);
    }

    // ═══════════════════════════════════════════
    //  FORMAT PARSERS
    // ═══════════════════════════════════════════

    /**
     * SINGLE FORMAT (default) — Formats A, A-19C, AL, AM, V, X, Y, AH, etc.
     * ## Extract + ## Question, or ## Question alone, or ## Statement + ## Question
     */
    private static function parse_single(&$topic, $content) {
        self::extract_marks_aos($topic, $content);

        if (preg_match('/\*\*Extract Location:\*\*\s*(.+)/i', $content, $m)) $topic['extract_location'] = trim($m[1]);
        if (preg_match('/\*\*Extract Context:\*\*\s*(.+)/i', $content, $m)) {
            $topic['extract_location'] .= ($topic['extract_location'] ? ' — ' : '') . trim($m[1]);
        }

        // Extract text
        if (preg_match('/^##\s*Extract\s*\n(.*?)(?=\n^##|\n---|\z)/smi', $content, $m)) {
            $topic['extract_text'] = trim($m[1]);
        }

        // Glossary
        if (preg_match('/^##\s*Glossary\s*\n(.*?)(?=\n^##|\n---|\z)/smi', $content, $m)) {
            $meta = self::get_metadata($topic);
            $meta['glossary'] = trim($m[1]);
            self::set_metadata($topic, $meta);
        }

        // Poem text (reuse extract field)
        if (preg_match('/^###?\s*Poem\s*\n(.*?)(?=\n^##|\z)/smi', $content, $m)) {
            $topic['extract_text'] = trim($m[1]);
        }

        // Statement (prepend to question)
        $statement = '';
        if (preg_match('/^##\s*Statement\s*\n(.*?)(?=\n^##|\z)/smi', $content, $m)) {
            $statement = trim($m[1]) . "\n\n";
        }

        // Question
        if (preg_match('/^##\s*Question\s*\n(.*?)(?=\n---|\n^#\s|\z)/smi', $content, $m)) {
            $topic['question_text'] = $statement . trim($m[1]);
        }

        // Source text (language reading — ## Source)
        if (preg_match('/^##\s*Source\s*\n(.*?)(?=\n^##|\z)/smi', $content, $m)) {
            $meta = self::get_metadata($topic);
            $meta['source_text'] = trim($m[1]);
            self::set_metadata($topic, $meta);
        }

        // Context (## Context — not ### which is handled within format-specific parsers)
        self::extract_field($topic, 'context', $content, '/^##\s*Context\s*\n(.*?)(?=\n^##|\n---|\z)/smi');

        // Instruction
        self::extract_field($topic, 'instruction', $content, '/^##\s*Instruction\s*\n(.*?)(?=\n^##|\n---|\z)/smi');

        // Form/Audience/Purpose metadata
        self::parse_fap_metadata($topic, $content);
    }

    /**
     * EITHER/OR FORMAT — Formats C, C-19C, AL, AJ, AK, AY, AZ, BA, BB, K, O, Q, AC, AE, AG, AS
     * ## Either + ## Or — maps to part_a (either) and part_b (or)
     */
    private static function parse_either_or(&$topic, $content) {
        // Either section → part_a
        if (preg_match('/^##\s*Either\b[^\n]*\n(.*?)(?=\n^##\s*Or\b|\z)/smi', $content, $m)) {
            $either = $m[1];
            self::extract_marks_aos_from($topic, $either, 'part_a');
            self::extract_question_from($topic, $either, 'part_a');
            self::extract_extract_from($topic, $either, 'part_a');

            // Context within Either
            if (preg_match('/^###\s*Context\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $either, $cm)) {
                $topic['context'] = trim($cm[1]);
            }

            // Extract location
            if (preg_match('/\*\*Extract Location:\*\*\s*(.+)/i', $either, $el)) {
                $topic['part_a_extract_location'] = trim($el[1]);
            }

            // Poem text within Either (Cambridge IGCSE)
            if (preg_match('/^###\s*Poem\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $either, $pm)) {
                $topic['part_a_extract'] = trim($pm[1]);
            }
        }

        // Or section → part_b
        if (preg_match('/^##\s*Or\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            $or = $m[1];
            self::extract_marks_aos_from($topic, $or, 'part_b');
            self::extract_question_from($topic, $or, 'part_b');
            self::extract_extract_from($topic, $or, 'part_b');

            // Poem text within Or
            if (preg_match('/^###\s*Poem\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $or, $pm)) {
                $topic['part_b_extract'] = trim($pm[1]);
            }
        }

        // Top-level metadata
        self::parse_fap_metadata($topic, $content);
        self::extract_field($topic, 'context', $content, '/^##\s*Context\s*\n(.*?)(?=\n^##|\n---|\z)/smi');
        self::extract_field($topic, 'instruction', $content, '/^##\s*Instruction\s*\n(.*?)(?=\n^##|\n---|\z)/smi');
    }

    /**
     * DUAL FORMAT — Formats B, B-MT, B-19C, Y (Edexcel 19C a/b)
     * ## Part A + ## Part B
     */
    private static function parse_dual(&$topic, $content) {
        // Part A
        if (preg_match('/^##\s*Part\s*A\b[^\n]*\n(.*?)(?=\n^##\s*Part\s*B\b|\z)/smi', $content, $m)) {
            $pa = $m[1];
            self::extract_marks_aos_from($topic, $pa, 'part_a');
            self::extract_question_from($topic, $pa, 'part_a');
            self::extract_extract_from($topic, $pa, 'part_a');
            if (preg_match('/\*\*Extract Location:\*\*\s*(.+)/i', $pa, $el)) {
                $topic['part_a_extract_location'] = trim($el[1]);
            }
            // Context within Part A
            if (preg_match('/^###\s*Context\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $pa, $cm)) {
                $topic['context'] = trim($cm[1]);
            }
        }

        // Part B
        if (preg_match('/^##\s*Part\s*B\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            $pb = $m[1];
            self::extract_marks_aos_from($topic, $pb, 'part_b');
            self::extract_question_from($topic, $pb, 'part_b');
            self::extract_extract_from($topic, $pb, 'part_b');
        }

        self::extract_field($topic, 'instruction', $content, '/^##\s*Instruction\s*\n(.*?)(?=\n^##|\n---|\z)/smi');
        self::parse_fap_metadata($topic, $content);
    }

    /**
     * DUAL EXTRACT FORMAT — Format D (OCR Modern Text)
     * ## Part A — Compare Extracts (two extracts) + ## Part B — Whole Text
     */
    private static function parse_dual_extract(&$topic, $content) {
        $meta = self::get_metadata($topic);
        $meta['extracts'] = [];

        // Part A — Compare Extracts
        if (preg_match('/^##\s*Part\s*A\b[^\n]*\n(.*?)(?=\n^##\s*Part\s*B\b|\z)/smi', $content, $m)) {
            $pa = $m[1];
            self::extract_marks_aos_from($topic, $pa, 'part_a');
            self::extract_question_from($topic, $pa, 'part_a');

            // Extract 1
            if (preg_match('/^###\s*Extract\s*1\b[^\n]*\n(.*?)(?=\n^###\s*Extract\s*2\b|\n^###\s*Question|\z)/smi', $pa, $e1)) {
                $ext1 = ['title' => '', 'author' => '', 'context' => '', 'text' => ''];
                if (preg_match('/^###\s*Extract\s*1\s*—?\s*(.+)/mi', $pa, $t1)) {
                    $parts = self::parse_title_author($t1[1]);
                    $ext1['title'] = $parts['title'];
                    $ext1['author'] = $parts['author'];
                }
                if (preg_match('/^####\s*Context\s*\n(.*?)(?=\n^####|\n^###|\z)/smi', $e1[1], $c1)) $ext1['context'] = trim($c1[1]);
                if (preg_match('/^####\s*Extract\s*\n(.*?)(?=\n^####|\n^###|\z)/smi', $e1[1], $t1)) $ext1['text'] = trim($t1[1]);
                $meta['extracts'][] = $ext1;
                $topic['part_a_extract'] = $ext1['text']; // Primary extract in flat field
            }

            // Extract 2
            if (preg_match('/^###\s*Extract\s*2\b[^\n]*\n(.*?)(?=\n^###\s*Question|\n^##|\z)/smi', $pa, $e2)) {
                $ext2 = ['title' => '', 'author' => '', 'context' => '', 'text' => ''];
                if (preg_match('/^###\s*Extract\s*2\s*—?\s*(.+)/mi', $pa, $t2)) {
                    $parts = self::parse_title_author($t2[1]);
                    $ext2['title'] = $parts['title'];
                    $ext2['author'] = $parts['author'];
                }
                if (preg_match('/^####\s*Context\s*\n(.*?)(?=\n^####|\n^###|\z)/smi', $e2[1], $c2)) $ext2['context'] = trim($c2[1]);
                if (preg_match('/^####\s*Extract\s*\n(.*?)(?=\n^####|\n^###|\z)/smi', $e2[1], $t2)) $ext2['text'] = trim($t2[1]);
                $meta['extracts'][] = $ext2;
            }
        }

        // Part B — Whole Text
        if (preg_match('/^##\s*Part\s*B\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            $pb = $m[1];
            self::extract_marks_aos_from($topic, $pb, 'part_b');
            self::extract_question_from($topic, $pb, 'part_b');
        }

        self::set_metadata($topic, $meta);
    }

    /**
     * DUAL POEM FORMAT — Format E (OCR Poetry Anthology)
     * ## Poems (with ### Poem 1, ### Poem 2) + ## Part A + ## Part B
     */
    private static function parse_dual_poem(&$topic, $content) {
        $meta = self::get_metadata($topic);
        $meta['poems'] = [];

        // Parse poems section
        if (preg_match('/^##\s*Poems?\s*\n(.*?)(?=\n^##\s*Part|\z)/smi', $content, $m)) {
            $poems_block = $m[1];

            // Poem 1
            if (preg_match('/^###\s*Poem\s*1\b[^\n]*\n(.*?)(?=\n^###\s*Poem\s*2|\z)/smi', $poems_block, $p1)) {
                $poem1 = self::parse_poem_block($p1[1]);
                $meta['poems'][] = $poem1;
                $topic['focus_poem'] = $poem1['title'];
                $topic['focus_poet'] = $poem1['poet'];
                $topic['part_a_extract'] = $poem1['text']; // Primary poem in flat field
            }

            // Poem 2
            if (preg_match('/^###\s*Poem\s*2\b[^\n]*\n(.*?)(?=\n^##|\z)/smi', $poems_block, $p2)) {
                $poem2 = self::parse_poem_block($p2[1]);
                $meta['poems'][] = $poem2;
                $topic['comparison_poem'] = $poem2['title'];
                $topic['comparison_poet'] = $poem2['poet'];
                $topic['part_b_extract'] = $poem2['text'];
            }
        }

        // Part A — Compare
        if (preg_match('/^##\s*Part\s*A\b[^\n]*\n(.*?)(?=\n^##\s*Part\s*B|\z)/smi', $content, $m)) {
            self::extract_marks_aos_from($topic, $m[1], 'part_a');
            self::extract_question_from($topic, $m[1], 'part_a');
        }

        // Part B — Explore One Other
        if (preg_match('/^##\s*Part\s*B\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            self::extract_marks_aos_from($topic, $m[1], 'part_b');
            self::extract_question_from($topic, $m[1], 'part_b');
        }

        self::set_metadata($topic, $meta);
    }

    /**
     * POETRY FORMAT — Format F, G, H (Section A + Section B)
     */
    private static function parse_poetry(&$topic, $content) {
        // Section A → part_a
        if (preg_match('/^##\s*Section\s*A\b[^\n]*\n(.*?)(?=\n^##\s*Section\s*B|\z)/smi', $content, $m)) {
            self::extract_marks_aos_from($topic, $m[1], 'part_a');
            self::extract_question_from($topic, $m[1], 'part_a');
        }

        // Section B → part_b
        if (preg_match('/^##\s*Section\s*B\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            self::extract_marks_aos_from($topic, $m[1], 'part_b');
            self::extract_question_from($topic, $m[1], 'part_b');
        }

        // Poetry defaults
        if (!$topic['part_a_marks']) $topic['part_a_marks'] = 15;
        if (!$topic['part_a_aos'])   $topic['part_a_aos'] = 'AO1,AO2,AO3';
        if (!$topic['part_b_marks']) $topic['part_b_marks'] = 25;
        if (!$topic['part_b_aos'])   $topic['part_b_aos'] = 'AO1,AO2,AO3';
    }

    /**
     * UNSEEN FORMAT — Format I (AQA Q27 / EDUQAS Q3)
     */
    private static function parse_unseen(&$topic, $content) {
        $is_eduqas = (bool) preg_match('/^##\s*Q3\.1/mi', $content);

        $q1_tag = $is_eduqas ? 'Q3\.1' : 'Q27\.1';
        $q2_tag = $is_eduqas ? 'Q3\.2' : 'Q27\.2';

        // Q1 → part_a
        if (preg_match('/^##\s*' . $q1_tag . '\b[^\n]*\n(.*?)(?=\n^##\s*' . $q2_tag . '|\z)/smi', $content, $m)) {
            $q1 = $m[1];
            self::extract_marks_aos_from($topic, $q1, 'part_a');
            self::extract_question_from($topic, $q1, 'part_a');
            if (preg_match('/^###\s*Poem\s*\n(.*?)(?=\n^###|\z)/smi', $q1, $pm)) {
                $topic['part_a_extract'] = trim($pm[1]);
            }
        }

        // Q2 → part_b
        if (preg_match('/^##\s*' . $q2_tag . '\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            $q2 = $m[1];
            self::extract_marks_aos_from($topic, $q2, 'part_b');
            self::extract_question_from($topic, $q2, 'part_b');
            if (preg_match('/^###\s*Poem\s*\n(.*?)(?=\n^###|\z)/smi', $q2, $pm)) {
                $topic['part_b_extract'] = trim($pm[1]);
            }
        }

        // Defaults
        if (!$topic['part_a_marks']) $topic['part_a_marks'] = $is_eduqas ? 15 : 24;
        if (!$topic['part_a_aos'])   $topic['part_a_aos'] = 'AO1,AO2';
        if (!$topic['part_b_marks']) $topic['part_b_marks'] = $is_eduqas ? 25 : 8;
        if (!$topic['part_b_aos'])   $topic['part_b_aos'] = $is_eduqas ? 'AO1,AO2' : 'AO2';

        // Intro (EDUQAS unseen — thematic linking line)
        self::extract_field($topic, 'intro', $content, '/^##\s*Intro\s*\n(.*?)(?=\n^##|\n---|\z)/smi');
    }

    /**
     * MULTI-QUESTION FORMAT — Formats J, L, N, P, R, T, AB, AD, AF, AH, AT, AW, AX, BD, BE
     * Language reading papers with ## Q1, ## Q2, etc. or ## Source A / ## Text One + questions
     * Also handles Cambridge IGCSE multi-part questions (Q1(a), Q1(b), etc.)
     */
    private static function parse_multi_question(&$topic, $content) {
        $meta = self::get_metadata($topic);
        $meta['questions'] = [];
        $meta['sources'] = [];

        // Parse source/text blocks
        $source_patterns = [
            '/^##\s*(Source\s*[AB]?)\s*\n(.*?)(?=\n^##\s*(?:Source|Text|Q\d|21st|19th)|\n---|\z)/smi',
            '/^##\s*(Text\s*(?:One|Two|1|2|A|B|C)(?:\s*\([^)]+\))?)\s*\n(.*?)(?=\n^##\s*(?:Text|Source|Q\d|###)|\n---|\z)/smi',
            '/^##\s*(21st\s*Century\s*Text)\s*\n(.*?)(?=\n^##\s*(?:19th|Q\d|###)|\n---|\z)/smi',
            '/^##\s*(19th\s*Century\s*Text)\s*\n(.*?)(?=\n^##\s*(?:21st|Q\d|###)|\n---|\z)/smi',
            '/^##\s*(Non-Fiction\s*Text)\s*\n(.*?)(?=\n^##\s*(?:Task|Q\d|Media)|\n---|\z)/smi',
            '/^##\s*(Media\s*Text)\s*\n(.*?)(?=\n^##\s*(?:Task|Q\d)|\n---|\z)/smi',
            '/^##\s*(Passage)\s*\n(.*?)(?=\n^##\s*Q|\n---|\z)/smi',
            '/^##\s*(Poem)\s*\n(.*?)(?=\n^##\s*Q|\n---|\z)/smi',
            '/^##\s*(Extract)\s*\n(.*?)(?=\n^##\s*Q|\n---|\z)/smi',
        ];

        foreach ($source_patterns as $pattern) {
            if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $source = ['label' => trim($match[1]), 'text' => trim($match[2])];
                    // Extract metadata within source
                    if (preg_match('/\*\*Title:\*\*\s*(.+)/i', $source['text'], $tm)) $source['title'] = trim($tm[1]);
                    if (preg_match('/\*\*Author:\*\*\s*(.+)/i', $source['text'], $am)) $source['author'] = trim($am[1]);
                    if (preg_match('/\*\*Source:\*\*\s*(.+)/i', $source['text'], $sm)) $source['source'] = trim($sm[1]);
                    if (preg_match('/\*\*Poet:\*\*\s*(.+)/i', $source['text'], $pm)) $source['poet'] = trim($pm[1]);
                    if (preg_match('/\*\*Date:\*\*\s*(.+)/i', $source['text'], $dm)) $source['date'] = trim($dm[1]);
                    if (preg_match('/\*\*Context:\*\*\s*(.+)/i', $source['text'], $cm)) $source['context'] = trim($cm[1]);
                    $meta['sources'][] = $source;
                }
            }
        }

        // Parse individual questions: ## Q1, ## Q2, ## Q1.1, ## Q1(a), ## Task 2, etc.
        $q_pattern = '/^##\s*(Q\d+(?:\.\d+)?(?:\([a-z]\))?(?:\s*—[^\n]*)?)\s*\n(.*?)(?=\n^##\s*(?:Q\d|Task\s*\d)|(?:\n---|\n^#\s+Topic|\z))/smi';
        if (preg_match_all($q_pattern, $content, $qmatches, PREG_SET_ORDER)) {
            foreach ($qmatches as $qm) {
                $q = [
                    'id'       => trim(preg_replace('/\s*—.*/', '', $qm[1])),
                    'label'    => trim($qm[1]),
                    'text'     => '',
                    'marks'    => 0,
                    'aos'      => '',
                    'extract'  => '',
                    'bullets'  => '',
                ];
                $qcontent = $qm[2];

                if (preg_match('/\*\*Marks:\*\*\s*(\d+)/i', $qcontent, $mm)) $q['marks'] = (int) $mm[1];
                if (preg_match('/\*\*AOs?:\*\*\s*(.+)/i', $qcontent, $am)) $q['aos'] = trim($am[1]);
                if (preg_match('/\*\*Mark Split:\*\*\s*(.+)/i', $qcontent, $ms)) $q['mark_split'] = trim($ms[1]);
                if (preg_match('/\*\*Text:\*\*\s*(.+)/i', $qcontent, $tm)) $q['text_ref'] = trim($tm[1]);
                if (preg_match('/\*\*Line Reference:\*\*\s*(.+)/i', $qcontent, $lr)) $q['line_ref'] = trim($lr[1]);

                // Extract within question
                if (preg_match('/^###\s*Extract\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $qcontent, $em)) {
                    $q['extract'] = trim($em[1]);
                }

                // Question text (after removing metadata and sub-headings)
                $q_text = preg_replace('/\*\*(?:Marks|AOs?|Mark Split|Text|Line Reference|Source Note|Form|Audience|Purpose|Word (?:Limit|Count)|Genre):\*\*[^\n]*/i', '', $qcontent);
                $q_text = preg_replace('/^###[^\n]*\n/mi', '', $q_text);
                $q['text'] = trim($q_text);

                $meta['questions'][] = $q;
            }
        }

        // Also parse ## Task N patterns (CCEA language)
        $task_pattern = '/^##\s*(Task\s*\d+\b[^\n]*)\s*\n(.*?)(?=\n^##\s*Task|\n^##\s*(?:Media|Non-Fiction)|(?:\n---|\n^#\s+Topic|\z))/smi';
        if (preg_match_all($task_pattern, $content, $tmatches, PREG_SET_ORDER)) {
            foreach ($tmatches as $tm) {
                $q = [
                    'id'    => trim(preg_replace('/\s*—.*/', '', $tm[1])),
                    'label' => trim($tm[1]),
                    'text'  => '',
                    'marks' => 0,
                    'aos'   => '',
                ];
                $tcontent = $tm[2];
                if (preg_match('/\*\*Marks:\*\*\s*(\d+)/i', $tcontent, $mm)) $q['marks'] = (int) $mm[1];
                if (preg_match('/\*\*AOs?:\*\*\s*(.+)/i', $tcontent, $am)) $q['aos'] = trim($am[1]);
                $q_text = preg_replace('/\*\*(?:Marks|AOs?|Mark Split|Form|Audience|Purpose):\*\*[^\n]*/i', '', $tcontent);
                $q['text'] = trim($q_text);
                $meta['questions'][] = $q;
            }
        }

        // Total marks from top-level
        self::extract_marks_aos($topic, $content);

        // Context
        self::extract_field($topic, 'context', $content, '/^##\s*Context\s*\n(.*?)(?=\n^##|\n---|\z)/smi');

        // Store first question text in flat field for backward compatibility
        if (!empty($meta['questions']) && !$topic['question_text']) {
            $topic['question_text'] = $meta['questions'][0]['text'];
            $topic['marks'] = $meta['questions'][0]['marks'] ?: $topic['marks'];
        }

        // Store first source in extract_text for backward compatibility
        if (!empty($meta['sources']) && !$topic['extract_text']) {
            $topic['extract_text'] = $meta['sources'][0]['text'];
        }

        self::set_metadata($topic, $meta);
    }

    /**
     * MULTI-OPTION FORMAT — Formats U, AI, AV (3-4 creative writing options)
     * ## Option 1, ## Option 2, ## Option 3, [## Option 4]
     */
    private static function parse_multi_option(&$topic, $content) {
        $meta = self::get_metadata($topic);
        $meta['options'] = [];

        $opt_pattern = '/^##\s*(Option\s*\d+\b[^\n]*)\s*\n(.*?)(?=\n^##\s*Option|\n---|\n^#\s+Topic|\z)/smi';
        if (preg_match_all($opt_pattern, $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $om) {
                $opt = [
                    'label' => trim($om[1]),
                    'text'  => '',
                    'marks' => 0,
                ];
                $ocontent = $om[2];
                if (preg_match('/\*\*Marks:\*\*\s*(\d+)/i', $ocontent, $mm)) $opt['marks'] = (int) $mm[1];
                $opt_text = preg_replace('/\*\*(?:Marks|AOs?|Mark Split|Word Count):\*\*[^\n]*/i', '', $ocontent);
                $opt['text'] = trim($opt_text);
                $meta['options'][] = $opt;
            }
        }

        // Top-level metadata
        self::extract_marks_aos($topic, $content);
        self::parse_fap_metadata($topic, $content);

        // First option in flat field for compatibility
        if (!empty($meta['options']) && !$topic['question_text']) {
            $topic['question_text'] = $meta['options'][0]['text'];
        }

        self::set_metadata($topic, $meta);
    }

    /**
     * DUAL TASK FORMAT — Format S (EDUQAS Language C2 Writing — two compulsory tasks)
     * ## Task 1 + ## Task 2 — maps to part_a/part_b
     */
    private static function parse_dual_task(&$topic, $content) {
        // Task 1 → part_a
        if (preg_match('/^##\s*Task\s*1\b[^\n]*\n(.*?)(?=\n^##\s*Task\s*2\b|\z)/smi', $content, $m)) {
            $t1 = $m[1];
            self::extract_marks_aos_from($topic, $t1, 'part_a');
            // Task question text
            $t1_text = preg_replace('/\*\*(?:Marks|AOs?|Mark Split|Form|Audience|Purpose):\*\*[^\n]*/i', '', $t1);
            $topic['part_a_question'] = trim($t1_text);

            // FAP per task
            $meta = self::get_metadata($topic);
            $meta['task1_fap'] = self::extract_fap($t1);
            self::set_metadata($topic, $meta);
        }

        // Task 2 → part_b
        if (preg_match('/^##\s*Task\s*2\b[^\n]*\n(.*?)(?=\n---|\n^#\s+Topic|\z)/smi', $content, $m)) {
            $t2 = $m[1];
            self::extract_marks_aos_from($topic, $t2, 'part_b');
            $t2_text = preg_replace('/\*\*(?:Marks|AOs?|Mark Split|Form|Audience|Purpose):\*\*[^\n]*/i', '', $t2);
            $topic['part_b_question'] = trim($t2_text);

            $meta = self::get_metadata($topic);
            $meta['task2_fap'] = self::extract_fap($t2);
            self::set_metadata($topic, $meta);
        }
    }

    // ═══════════════════════════════════════════
    //  HELPER METHODS
    // ═══════════════════════════════════════════

    /**
     * Extract marks/AOs from content into top-level fields
     */
    private static function extract_marks_aos(&$topic, $content) {
        if (preg_match('/\*\*Marks:\*\*\s*(\d+)/i', $content, $m)) $topic['marks'] = (int) $m[1];
        if (preg_match('/\*\*AOs?:\*\*\s*(.+)/i', $content, $m)) $topic['aos'] = trim($m[1]);
        if (preg_match('/\*\*AO4:\*\*\s*(\d+)/i', $content, $m)) $topic['aos'] .= ',AO4(' . $m[1] . ')';
        if (preg_match('/\*\*Mark Split:\*\*\s*(.+)/i', $content, $m)) {
            $meta = self::get_metadata($topic);
            $meta['mark_split'] = trim($m[1]);
            self::set_metadata($topic, $meta);
        }
    }

    /**
     * Extract marks/AOs from a sub-section into part_a or part_b fields
     */
    private static function extract_marks_aos_from(&$topic, $section_content, $prefix) {
        if (preg_match('/\*\*Marks:\*\*\s*(\d+)/i', $section_content, $m)) $topic[$prefix . '_marks'] = (int) $m[1];
        if (preg_match('/\*\*AOs?:\*\*\s*(.+)/i', $section_content, $m)) $topic[$prefix . '_aos'] = trim($m[1]);
    }

    /**
     * Extract question text from a sub-section into part_a_question or part_b_question
     */
    private static function extract_question_from(&$topic, $section_content, $prefix) {
        if (preg_match('/\*\*Question:\*\*\s*(.+?)(?=\n^##|\z)/smi', $section_content, $m)) {
            $topic[$prefix . '_question'] = trim($m[1]);
        } elseif (preg_match('/^###\s*Question\s*\n(.*?)(?=\n^##|\n^###|\z)/smi', $section_content, $m)) {
            $topic[$prefix . '_question'] = trim($m[1]);
        }
    }

    /**
     * Extract extract/text from a sub-section into part_a_extract or part_b_extract
     */
    private static function extract_extract_from(&$topic, $section_content, $prefix) {
        if (preg_match('/^###\s*Extract\s*\n(.*?)(?=\n^###|\n^##|\z)/smi', $section_content, $m)) {
            $topic[$prefix . '_extract'] = trim($m[1]);
        }
    }

    /**
     * Generic field extraction by regex
     */
    private static function extract_field(&$topic, $field, $content, $pattern) {
        if (preg_match($pattern, $content, $m)) {
            $topic[$field] = trim($m[1]);
        }
    }

    /**
     * Parse Form/Audience/Purpose metadata into metadata JSON
     */
    private static function parse_fap_metadata(&$topic, $content) {
        $fap = self::extract_fap($content);
        if (!empty(array_filter($fap))) {
            $meta = self::get_metadata($topic);
            $meta = array_merge($meta, $fap);
            self::set_metadata($topic, $meta);
        }
    }

    /**
     * Extract Form/Audience/Purpose from content
     */
    private static function extract_fap($content) {
        $fap = [];
        if (preg_match('/\*\*Form:\*\*\s*(.+)/i', $content, $m)) $fap['form'] = trim($m[1]);
        if (preg_match('/\*\*Audience:\*\*\s*(.+)/i', $content, $m)) $fap['audience'] = trim($m[1]);
        if (preg_match('/\*\*Purpose:\*\*\s*(.+)/i', $content, $m)) $fap['purpose'] = trim($m[1]);
        if (preg_match('/\*\*Collection:\*\*\s*(.+)/i', $content, $m)) $fap['collection'] = trim($m[1]);
        if (preg_match('/\*\*Anthology:\*\*\s*(.+)/i', $content, $m)) $fap['anthology'] = trim($m[1]);
        if (preg_match('/\*\*Genre:\*\*\s*(.+)/i', $content, $m)) $fap['genre'] = trim($m[1]);
        if (preg_match('/\*\*Word (?:Limit|Count):\*\*\s*(.+)/i', $content, $m)) $fap['word_limit'] = trim($m[1]);
        if (preg_match('/\*\*Open Book:\*\*\s*(.+)/i', $content, $m)) $fap['open_book'] = trim($m[1]);
        if (preg_match('/\*\*Paper:\*\*\s*(.+)/i', $content, $m)) $fap['paper'] = trim($m[1]);
        if (preg_match('/\*\*Section:\*\*\s*(.+)/i', $content, $m)) $fap['section'] = trim($m[1]);
        return $fap;
    }

    /**
     * Parse poem block → title, poet, text
     */
    private static function parse_poem_block($block_content) {
        $poem = ['title' => '', 'poet' => '', 'text' => ''];
        if (preg_match('/\*\*Title:\*\*\s*(.+)/i', $block_content, $m)) $poem['title'] = trim($m[1]);
        if (preg_match('/\*\*Poet:\*\*\s*(.+)/i', $block_content, $m)) $poem['poet'] = trim($m[1]);
        // Text is everything after metadata lines
        $text = preg_replace('/\*\*(?:Title|Poet):\*\*[^\n]*/i', '', $block_content);
        $poem['text'] = trim($text);
        return $poem;
    }

    /**
     * Parse "Title by Author" string
     */
    private static function parse_title_author($str) {
        $str = trim($str);
        if (preg_match('/^(.+?)\s+by\s+(.+)$/i', $str, $m)) {
            return ['title' => trim($m[1]), 'author' => trim($m[2])];
        }
        return ['title' => $str, 'author' => ''];
    }

    /**
     * Get metadata array from topic
     */
    private static function get_metadata(&$topic) {
        $meta = json_decode($topic['metadata'] ?? '{}', true);
        return is_array($meta) ? $meta : [];
    }

    /**
     * Set metadata array on topic
     */
    private static function set_metadata(&$topic, $meta) {
        $topic['metadata'] = wp_json_encode($meta, JSON_UNESCAPED_UNICODE);
    }
}
