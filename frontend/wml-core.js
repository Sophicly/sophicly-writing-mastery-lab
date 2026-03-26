/**
 * WML Core — Shared namespace, state, constants, utilities
 * Extracted from wml-app.js v7.12.60
 *
 * This module sets up window.WML with all shared dependencies.
 * Other modules (wml-app.js, future wml-assessment.js, wml-planning.js)
 * consume from this namespace.
 */
window.WML = (function() {
    'use strict';

    const config = window.swmlConfig || {};
    const API = {
        session:      config.restUrl + 'session',
        plan:         config.restUrl + 'plan',
        planElement:  config.restUrl + 'plan/element',
        progress:     config.restUrl + 'progress',
        chat:         config.restUrl + 'chat',
        saveSession:  config.restUrl + 'session/save',
        pastSessions: config.restUrl + 'sessions',
        loadSession:  config.restUrl + 'session/load',
        deleteSession: config.restUrl + 'session/delete',
        savedQuestions: config.restUrl + 'saved-questions',
        canvasSave:    config.restUrl + 'canvas/save',
        canvasLoad:    config.restUrl + 'canvas/load',
        canvasList:    config.restUrl + 'canvas/list',
        topicQuestion: config.restUrl + 'topic-question',
        phaseComplete: config.restUrl + 'phase/complete',
        phaseStatus:   config.restUrl + 'phase/status',
        chatSave:      config.restUrl + 'canvas/chat-save',
        chatLoad:      config.restUrl + 'canvas/chat-load',
        chatClear:     config.restUrl + 'canvas/chat-clear',
        learningProfile: config.restUrl + 'learning-profile',
    };
    const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce };

    // Section type colour map (used for outline, TOC, export)
    const SECTION_COLOURS = {
        cover: '#5333ed',
        question: '#51dacf',
        plan: '#5333ed',
        outline: '#42A1EC',
        response: '#1CD991',
        feedback: '#ffb432',
        scores: '#ff6b6b',
        action: '#4D76FD',
        improvement: '#7DF9E9',
        signoff: '#1CD991',
    };

    const TEXT_CATALOGUE = {
        shakespeare: {
            label: 'Shakespeare',
            texts: [
                { id: 'macbeth', label: 'Macbeth', icon: '🗡️' },
                { id: 'romeo_juliet', label: 'Romeo & Juliet', icon: '💔' },
                { id: 'the_tempest', label: 'The Tempest', icon: '🌊' },
                { id: 'merchant_of_venice', label: 'The Merchant of Venice', icon: '⚖️' },
                { id: 'much_ado', label: 'Much Ado About Nothing', icon: '💬' },
                { id: 'julius_caesar', label: 'Julius Caesar', icon: '🏛️' },
                { id: 'twelfth_night', label: 'Twelfth Night', icon: '🎭' },
                { id: 'henry_v', label: 'Henry V', icon: '👑' },
                { id: 'othello', label: 'Othello', icon: '🖤' },
            ],
        },
        modern_text: {
            label: 'Modern Text',
            texts: [
                { id: 'aic', label: 'An Inspector Calls', icon: '🔍' },
                { id: 'blood_brothers', label: 'Blood Brothers', icon: '👥' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'never_let_me_go', label: 'Never Let Me Go', icon: '💊' },
                { id: 'leave_taking', label: 'Leave Taking', icon: '🚪' },
                { id: 'dna', label: 'DNA', icon: '🧬' },
                { id: 'my_name_is_leon', label: 'My Name Is Leon', icon: '📘' },
                { id: 'taste_of_honey', label: 'A Taste of Honey', icon: '🍯' },
                { id: 'journeys_end', label: "Journey's End", icon: '⚔️' },
                { id: 'pigeon_english', label: 'Pigeon English', icon: '🐦' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
            ],
        },
        modern_prose: {
            label: 'Modern Prose',
            texts: [
                { id: 'tkam', label: 'To Kill a Mockingbird', icon: '🐦' },
                { id: 'omam', label: 'Of Mice and Men', icon: '🐭' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'old_man_sea', label: 'The Old Man and the Sea', icon: '🎣' },
                { id: 'anita_and_me', label: 'Anita and Me', icon: '🎭' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
            ],
        },
        prose: {
            label: 'Prose (Studied Novel)',
            texts: [
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'about_a_boy', label: 'About a Boy', icon: '👦' },
                { id: 'how_many_miles', label: 'How Many Miles to Babylon?', icon: '🏛️' },
                { id: 'tkam', label: 'To Kill a Mockingbird', icon: '🐦' },
                { id: 'omam', label: 'Of Mice and Men', icon: '🐭' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
            ],
        },
        '19th_century': {
            label: '19th Century Novel',
            texts: [
                { id: 'acc', label: 'A Christmas Carol', icon: '👻' },
                { id: 'jekyll_hyde', label: 'Jekyll & Hyde', icon: '🧪' },
                { id: 'frankenstein', label: 'Frankenstein', icon: '⚡' },
                { id: 'sign_of_four', label: 'The Sign of the Four', icon: '🔎' },
                { id: 'great_expectations', label: 'Great Expectations', icon: '📖' },
                { id: 'jane_eyre', label: 'Jane Eyre', icon: '🏚️' },
                { id: 'pride_prejudice', label: 'Pride & Prejudice', icon: '💐' },
                { id: 'scarlet_letter', label: 'The Scarlet Letter', icon: '🔴' },
            ],
        },
        critical_reading: {
            label: 'Critical Reading (Critical Essay)',
            texts: [
                { id: 'macbeth', label: 'Macbeth', icon: '🗡️' },
                { id: 'romeo_juliet', label: 'Romeo and Juliet', icon: '💔' },
                { id: 'much_ado', label: 'Much Ado About Nothing', icon: '💬' },
                { id: 'merchant_venice', label: 'The Merchant of Venice', icon: '⚖️' },
                { id: 'othello', label: 'Othello', icon: '🎭' },
                { id: 'aic', label: 'An Inspector Calls', icon: '🔍' },
                { id: 'blood_brothers', label: 'Blood Brothers', icon: '👥' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'my_name_is_leon', label: 'My Name Is Leon', icon: '📘' },
                { id: 'leave_taking', label: 'Leave Taking', icon: '🚪' },
                { id: 'dna', label: 'DNA', icon: '🧬' },
                { id: 'never_let_me_go', label: 'Never Let Me Go', icon: '💊' },
                { id: 'pigeon_english', label: 'Pigeon English', icon: '🐦' },
                { id: 'taste_of_honey', label: 'A Taste of Honey', icon: '🍯' },
                { id: 'journeys_end', label: "Journey's End", icon: '⚔️' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
                { id: 'curious_incident_play', label: 'The Curious Incident (Play)', icon: '🎪' },
                { id: 'jane_eyre', label: 'Jane Eyre', icon: '🏚️' },
                { id: 'pride_prejudice', label: 'Pride & Prejudice', icon: '💐' },
                { id: 'sign_of_four', label: 'The Sign of the Four', icon: '🔎' },
            ],
        },
        poetry_anthology: {
            label: 'Poetry Anthology',
            // Board-specific texts — resolved at render time via POETRY_ANTHOLOGY_BY_BOARD
            texts: [],
        },
        unseen_poetry: {
            label: 'Unseen Poetry',
            skipTextSelect: true,
        },
        unseen_prose: {
            label: 'Unseen Prose',
            skipTextSelect: true,
        },
        language1: {
            label: 'Language Paper 1',
            skipTextSelect: true,
        },
        language2: {
            label: 'Language Paper 2',
            skipTextSelect: true,
        },
        creative_writing: {
            label: 'Creative Writing',
            skipTextSelect: true,
        },
        prose_anthology: {
            label: 'Prose Anthology',
            // Board-specific texts — resolved at render time via PROSE_ANTHOLOGY_BY_BOARD
            texts: [],
        },
        nonfiction_anthology: {
            label: 'Non-Fiction Anthology',
            // Board-specific texts — resolved at render time via NONFICTION_ANTHOLOGY_BY_BOARD
            texts: [],
        },
    };

    // ── Board-specific poetry anthology texts ──
    const POETRY_ANTHOLOGY_BY_BOARD = {
        'aqa': [
            { id: 'power_conflict', label: 'Power & Conflict', icon: '⚔️' },
            { id: 'love_relationships', label: 'Love & Relationships', icon: '❤️' },
            { id: 'worlds_lives', label: 'Worlds & Lives', icon: '🌍' },
        ],
        'ocr': [
            { id: 'conflict', label: 'Conflict', icon: '⚔️' },
            { id: 'love', label: 'Love', icon: '❤️' },
            { id: 'youth_age', label: 'Youth & Age', icon: '🌱' },
        ],
        'eduqas': [
            { id: 'eduqas_poetry', label: 'EDUQAS Poetry (to 2026)', icon: '📜' },
            { id: 'eduqas_poetry_2027', label: 'EDUQAS Poetry (from 2027)', icon: '✨' },
        ],
        'edexcel': [
            { id: 'relationships', label: 'Relationships', icon: '❤️' },
            { id: 'conflict', label: 'Conflict', icon: '⚔️' },
            { id: 'time_place', label: 'Time & Place', icon: '🕰️' },
            { id: 'belonging', label: 'Belonging', icon: '🏠' },
        ],
        'edexcel-igcse': [
            { id: 'igcse_lit_poetry', label: 'Part 3 — Literature Poetry', icon: '📖' },
            { id: 'igcse_lang_poetry', label: 'Part 2 — Language Poetry', icon: '✒️' },
        ],
        'sqa': [
            { id: 'sqa_duffy', label: 'Carol Ann Duffy', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
            { id: 'sqa_maccaig', label: 'Norman MacCaig', icon: '🏔️' },
            { id: 'sqa_kay', label: 'Jackie Kay', icon: '📝' },
            { id: 'sqa_morgan', label: 'Edwin Morgan', icon: '🌃' },
            { id: 'sqa_n5_collection', label: 'N5 Scottish Poetry Collection', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
        ],
        'ccea': [
            { id: 'ccea_identity', label: 'Identity', icon: '🪞' },
            { id: 'ccea_relationships', label: 'Relationships', icon: '❤️' },
            { id: 'ccea_conflict', label: 'Conflict', icon: '⚔️' },
        ],
        'cambridge-igcse': [
            { id: 'songs_ourselves_v1', label: 'Songs of Ourselves Vol. 1', icon: '📖' },
        ],
    };

    // ── Board-specific prose anthology texts ──
    const PROSE_ANTHOLOGY_BY_BOARD = {
        'edexcel-igcse': [
            { id: 'igcse_lang_prose', label: 'Part 2 — Language Prose', icon: '📕' },
        ],
    };

    // ── Board-specific non-fiction anthology texts ──
    const NONFICTION_ANTHOLOGY_BY_BOARD = {
        'edexcel-igcse': [
            { id: 'igcse_lang_nonfiction', label: 'Part 1 — Language Non-Fiction', icon: '📰' },
        ],
    };

    // ── Author lookup for texts ──
    const AUTHOR_MAP = {
        // Shakespeare
        macbeth: 'William Shakespeare', romeo_juliet: 'William Shakespeare',
        the_tempest: 'William Shakespeare', merchant_of_venice: 'William Shakespeare',
        much_ado: 'William Shakespeare', julius_caesar: 'William Shakespeare',
        twelfth_night: 'William Shakespeare',
        // Modern texts
        aic: 'J.B. Priestley', blood_brothers: 'Willy Russell',
        lord_of_the_flies: 'William Golding', animal_farm: 'George Orwell',
        never_let_me_go: 'Kazuo Ishiguro', leave_taking: 'Winsome Pinnock',
        dna: 'Dennis Kelly', my_name_is_leon: 'Kit de Waal',
        taste_of_honey: 'Shelagh Delaney', journeys_end: 'R.C. Sherriff',
        pigeon_english: 'Stephen Kelman', curious_incident: 'Mark Haddon',
        // 19th Century
        acc: 'Charles Dickens', jekyll_hyde: 'Robert Louis Stevenson', frankenstein: 'Mary Shelley',
        sign_of_four: 'Arthur Conan Doyle', great_expectations: 'Charles Dickens',
        jane_eyre: 'Charlotte Brontë', pride_prejudice: 'Jane Austen', scarlet_letter: 'Nathaniel Hawthorne',
        // Poetry — AQA
        power_conflict: 'AQA Anthology', love_relationships: 'AQA Anthology',
        worlds_lives: 'AQA Anthology', unseen_poetry: 'Unseen',
        // Poetry — OCR
        conflict: 'OCR Anthology', love: 'OCR Anthology', youth_age: 'OCR Anthology',
        // Poetry — EDUQAS
        eduqas_poetry: 'EDUQAS Anthology', eduqas_poetry_2027: 'EDUQAS Anthology',
        // Poetry — Edexcel
        relationships: 'Edexcel Anthology', time_place: 'Edexcel Anthology', belonging: 'Edexcel Anthology',
        // Poetry — Edexcel IGCSE
        igcse_lit_poetry: 'Edexcel IGCSE Anthology', igcse_lang_poetry: 'Edexcel IGCSE Anthology',
        igcse_lang_prose: 'Edexcel IGCSE Anthology',
        // Poetry — SQA
        sqa_duffy: 'Carol Ann Duffy', sqa_maccaig: 'Norman MacCaig',
        sqa_kay: 'Jackie Kay', sqa_morgan: 'Edwin Morgan', sqa_n5_collection: 'SQA Collection',
        // Poetry — CCEA
        ccea_identity: 'CCEA Anthology', ccea_relationships: 'CCEA Anthology', ccea_conflict: 'CCEA Anthology',
        // Poetry — Cambridge IGCSE
        songs_ourselves_v1: 'Songs of Ourselves',
        // Non-fiction — Edexcel IGCSE
        igcse_lang_nonfiction: 'Edexcel IGCSE Anthology',
    };

    // Get full text label from catalogue
    function getTextLabel(textId, subjectId) {
        const subject = TEXT_CATALOGUE[subjectId];
        if (!subject) return ucfirst(textId);
        if (subject.skipTextSelect) return subject.label;
        // For poetry/prose anthology, check board-specific texts first
        if (subjectId === 'poetry_anthology' && POETRY_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = POETRY_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        if (subjectId === 'prose_anthology' && PROSE_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = PROSE_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        if (subjectId === 'nonfiction_anthology' && NONFICTION_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = NONFICTION_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        const text = (subject.texts || []).find(t => t.id === textId);
        return text ? text.label : ucfirst(textId);
    }

    const state = {
        mode: config.urlParams?.mode || '',
        board: config.urlParams?.board || '',
        subject: config.urlParams?.subject || '',
        text: config.urlParams?.text || '',
        task: config.urlParams?.task || '',       // from URL in guided mode
        planningMode: '',                        // essay_plan mode: A (Recall), B (Guided), C (Instant) | model_answer: A (Coached), B (Instant), C (Advanced)
        modelSection: '',                        // model_answer section: introduction, body1, body2, body3, conclusion
        advancedLevel: 0,                        // model_answer Advanced: 1 (Full Recall), 2 (Plan & Answer), 3 (Answer Only)
        essayTiming: '',                         // model_answer Advanced: 'paragraph' or 'full'
        courseType: config.urlParams?.type || '',
        isRedraft: config.urlParams?.redraft === '1',
        unitId: config.urlParams?.unit_id || 0,
        question: '',
        marks: 30,
        aos: ['AO1', 'AO2', 'AO3'],
        sessionId: '',
        step: 1,
        plan: {},
        chatHistory: [],
        isLoading: false,
        chatId: null,
        referrer: '',
        requestId: 0, // Incremented on each view change — stale responses are ignored
        pendingFile: null, // File upload waiting to be sent
        // Poetry poem selection
        poem: config.urlParams?.poem || '',
        poemTitle: '',
        poemAuthor: '',
        poemText: '',
        // EDUQAS poetry section selection
        questionPart: '',
        comparisonPoem: '',
        comparisonPoemTitle: '',
        comparisonPoemText: '',
        // Draft typing (programme mode)
        topicNumber: config.urlParams?.topic || 0,
        topicLabel: config.urlParams?.topic ? `Topic ${config.urlParams.topic}` : '',
        draftType: null,
        phase: null,
        _phaseMarkedComplete: false,  // Prevents double-fire of Mark Complete
    };

    const PLAN_STEPS = [
        { step: 1, label: 'Setup & Goals' },
        { step: 2, label: 'Keyword Analysis' },
        { step: 3, label: 'Anchor Quotes' },
        { step: 4, label: 'Body Paragraph 1' },
        { step: 5, label: 'Body Paragraph 2' },
        { step: 6, label: 'Body Paragraph 3' },
        { step: 7, label: 'Introduction' },
        { step: 8, label: 'Conclusion' },
    ];

    const ASSESSMENT_STEPS = [
        { step: 1, label: 'Setup & Details' },
        { step: 2, label: 'Goal Setting' },
        { step: 3, label: 'Self-Reflection' },
        { step: 4, label: 'Essay Submission' },
        { step: 5, label: 'Introduction' },
        { step: 6, label: 'Body Paragraphs' },
        { step: 7, label: 'Conclusion' },
        { step: 8, label: 'Summary & Action Plan' },
    ];

    const POLISHING_STEPS = [
        { step: 1, label: 'Context & Essay' },
        { step: 2, label: 'Level Assessment' },
        { step: 3, label: 'Focus Selection' },
        { step: 4, label: 'Polishing Round 1' },
        { step: 5, label: 'Polishing Round 2' },
        { step: 6, label: 'Polishing Round 3' },
        { step: 7, label: 'Review & Compare' },
        { step: 8, label: 'Next Steps' },
    ];

    const QUOTE_ANALYSIS_STEPS = [
        { step: 1, label: 'Random Quote' },
        { step: 2, label: 'Verbal Plan' },
        { step: 3, label: 'Plan Feedback' },
        { step: 4, label: 'Full Paragraph' },
        { step: 5, label: 'Paragraph Feedback' },
        { step: 6, label: 'AI Model' },
    ];

    const CONCEPTUAL_NOTES_STEPS = [
        { step: 1, label: 'S1 Protagonist' },
        { step: 2, label: 'S2 Context' },
        { step: 3, label: 'S3 Plot' },
        { step: 4, label: 'S4 Genre' },
        { step: 5, label: 'S5 Themes' },
        { step: 6, label: 'S6 Purpose' },
        { step: 7, label: 'S7 Message' },
    ];

    const POETRY_CN_STEPS = [
        { step: 1, label: 'S1 Speaker' },
        { step: 2, label: 'S2 Context' },
        { step: 3, label: 'S3 Form' },
        { step: 4, label: 'S4 Techniques' },
        { step: 5, label: 'S5 Themes' },
        { step: 6, label: 'S6 Purpose' },
        { step: 7, label: 'S7 Message' },
    ];

    const NONFICTION_CN_STEPS = [
        { step: 1, label: 'S1 Writer\'s Voice' },
        { step: 2, label: 'S2 Context' },
        { step: 3, label: 'S3 Structure' },
        { step: 4, label: 'S4 Text Type' },
        { step: 5, label: 'S5 Techniques' },
        { step: 6, label: 'S6 Themes' },
        { step: 7, label: 'S7 Purpose' },
        { step: 8, label: 'S8 Message' },
    ];

    const ESSAY_PLAN_STEPS = [
        { step: 1, label: 'Setup & Question' },
        { step: 2, label: 'Keywords' },
        { step: 3, label: 'Anchor Quotes' },
        { step: 4, label: 'Body Paragraph 1' },
        { step: 5, label: 'Body Paragraph 2' },
        { step: 6, label: 'Body Paragraph 3' },
        { step: 7, label: 'Introduction' },
        { step: 8, label: 'Conclusion' },
    ];

    const MODEL_ANSWER_STEPS = [
        { step: 1, label: 'Setup & Question' },
        { step: 2, label: 'Essay Plan' },
        { step: 3, label: 'Body Paragraph 1' },
        { step: 4, label: 'Body Paragraph 2' },
        { step: 5, label: 'Body Paragraph 3' },
        { step: 6, label: 'Introduction' },
        { step: 7, label: 'Conclusion' },
    ];

    const ESSAY_PLAN_RECALL_STEPS = [
        { step: 1, label: 'Question' },
        { step: 2, label: 'Verbal Recall' },
        { step: 3, label: 'AI Evaluation' },
        { step: 4, label: 'Refinement' },
        { step: 5, label: 'Confirm & Save' },
    ];

    const MODEL_ANSWER_ADVANCED_STEPS = [
        { step: 1, label: 'Question' },
        { step: 2, label: 'Plan' },
        { step: 3, label: 'Body Paragraph 1' },
        { step: 4, label: 'Body Paragraph 2' },
        { step: 5, label: 'Body Paragraph 3' },
        { step: 6, label: 'Introduction' },
        { step: 7, label: 'Conclusion' },
    ];

    const ASSESSMENT_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'goal', label: 'Assessment Goal', section: 'focus' },
        { type: 'ao1_score', label: 'AO1', section: 'scores' },
        { type: 'ao2_score', label: 'AO2', section: 'scores' },
        { type: 'ao3_score', label: 'AO3', section: 'scores' },
        { type: 'ao4_score', label: 'AO4 (SPaG)', section: 'scores' },
        { type: 'total_score', label: 'Total Score', section: 'scores' },
        { type: 'grade', label: 'Grade / Level', section: 'scores' },
        { type: 'strength_1', label: 'Key Strength', section: 'feedback' },
        { type: 'target_1', label: 'Priority Target', section: 'feedback' },
        { type: 'target_2', label: 'Second Target', section: 'feedback' },
    ];

    const POLISHING_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'current_level', label: 'Current Level', section: 'focus' },
        { type: 'target_level', label: 'Target Level', section: 'focus' },
        { type: 'polish_focus', label: 'Polish Focus', section: 'focus' },
        { type: 'revision_1', label: 'Revision 1', section: 'revisions' },
        { type: 'revision_2', label: 'Revision 2', section: 'revisions' },
        { type: 'revision_3', label: 'Revision 3', section: 'revisions' },
    ];

    const EXAM_QUESTION_STEPS = [
        { step: 1, label: 'Text & Author' },
        { step: 2, label: 'Design Preference' },
        { step: 3, label: 'Past Paper Analysis' },
        { step: 4, label: 'Question Generation' },
        { step: 5, label: 'Refinement' },
    ];

    const MEMORY_PRACTICE_STEPS = [
        { step: 1, label: 'Submit Writing' },
        { step: 2, label: 'Quality Gate' },
        { step: 3, label: 'Mode Selection' },
        { step: 4, label: 'Timer' },
        { step: 5, label: 'Exercise' },
        { step: 6, label: 'Results' },
        { step: 7, label: 'Next Steps' },
    ];

    const EXAM_QUESTION_ELEMENTS = [
        { type: 'question_text', label: 'Text', section: 'focus' },
        { type: 'goal', label: 'Author', section: 'focus' },
        { type: 'exam_question_theme', label: 'Theme / Character', section: 'question' },
        { type: 'exam_question_output', label: 'Generated Question', section: 'question' },
    ];

    // Active config based on current task
    // prose_anthology uses Literature CN, not Poetry CN
    const isPoetrySubject = () => ['poetry_anthology', 'unseen_poetry'].includes(state.subject);
    const isLanguageSubject = () => ['language1', 'language2'].includes(state.subject);
    const isNonfictionSubject = () => state.subject === 'nonfiction_anthology';
    const isAnthologySubject = () => ['poetry_anthology', 'prose_anthology', 'nonfiction_anthology'].includes(state.subject);
    function getSteps() {
        if (state.task === 'assessment') return ASSESSMENT_STEPS;
        if (state.task === 'polishing') return POLISHING_STEPS;
        if (state.task === 'exam_question') return EXAM_QUESTION_STEPS;
        if (state.task === 'memory_practice') return MEMORY_PRACTICE_STEPS;
        if (state.task === 'verbal_rehearsal') return QUOTE_ANALYSIS_STEPS;
        if (state.task === 'conceptual_notes') {
            if (isNonfictionSubject()) return NONFICTION_CN_STEPS;
            return isPoetrySubject() ? POETRY_CN_STEPS : CONCEPTUAL_NOTES_STEPS;
        }
        if (state.task === 'essay_plan') return state.planningMode === 'A' ? ESSAY_PLAN_RECALL_STEPS : ESSAY_PLAN_STEPS;
        if (state.task === 'model_answer') return state.planningMode === 'C' ? MODEL_ANSWER_ADVANCED_STEPS : MODEL_ANSWER_STEPS;
        return PLAN_STEPS;
    }
    function getElements() {
        if (state.task === 'assessment') return ASSESSMENT_ELEMENTS;
        if (state.task === 'polishing') return POLISHING_ELEMENTS;
        if (state.task === 'exam_question') return EXAM_QUESTION_ELEMENTS;
        if (state.task === 'conceptual_notes') {
            if (isNonfictionSubject()) return NONFICTION_CN_ELEMENTS;
            return isPoetrySubject() ? POETRY_CN_ELEMENTS : CONCEPTUAL_NOTES_ELEMENTS;
        }
        if (state.task === 'verbal_rehearsal') return QUOTE_ANALYSIS_ELEMENTS;
        if (state.task === 'model_answer') return MODEL_ANSWER_ELEMENTS;
        return PLAN_ELEMENTS;
    }

    const CONCEPTUAL_NOTES_ELEMENTS = [
        { type: 'cn_section_1', label: 'Protagonist', section: 'notes' },
        { type: 'cn_section_2', label: 'Historical Context', section: 'notes' },
        { type: 'cn_section_3', label: 'Plot Structure', section: 'notes' },
        { type: 'cn_section_4', label: 'Genre & Emotion', section: 'notes' },
        { type: 'cn_section_5', label: 'Themes', section: 'notes' },
        { type: 'cn_section_6', label: 'Author\'s Purpose', section: 'notes' },
        { type: 'cn_section_7', label: 'The Big Message', section: 'notes' },
    ];

    const POETRY_CN_ELEMENTS = [
        { type: 'cn_section_1', label: 'Speaker', section: 'notes' },
        { type: 'cn_section_2', label: 'Historical Context', section: 'notes' },
        { type: 'cn_section_3', label: 'Form', section: 'notes' },
        { type: 'cn_section_4', label: 'Structure & Language', section: 'notes' },
        { type: 'cn_section_5', label: 'Themes', section: 'notes' },
        { type: 'cn_section_6', label: 'Poet\'s Purpose', section: 'notes' },
        { type: 'cn_section_7', label: 'The Big Message', section: 'notes' },
    ];

    const NONFICTION_CN_ELEMENTS = [
        { type: 'nfcn_section_1', label: 'Writer\'s Voice', section: 'notes' },
        { type: 'nfcn_section_2', label: 'Context', section: 'notes' },
        { type: 'nfcn_section_3', label: 'Structure', section: 'notes' },
        { type: 'nfcn_section_4', label: 'Text Type & Form', section: 'notes' },
        { type: 'nfcn_section_5', label: 'Techniques', section: 'notes' },
        { type: 'nfcn_section_6', label: 'Themes & Ideas', section: 'notes' },
        { type: 'nfcn_section_7', label: 'Writer\'s Purpose', section: 'notes' },
        { type: 'nfcn_section_8', label: 'The Big Message', section: 'notes' },
    ];

    const QUOTE_ANALYSIS_ELEMENTS = [
        { type: 'qa_quote', label: 'Random Quote', section: 'focus' },
        { type: 'qa_student_plan', label: 'Your Plan', section: 'student' },
        { type: 'qa_student_paragraph', label: 'Your Paragraph', section: 'student' },
        { type: 'qa_ai_plan', label: 'AI Plan', section: 'model' },
        { type: 'qa_ai_paragraph', label: 'AI Paragraph', section: 'model' },
    ];

    const MODEL_ANSWER_ELEMENTS = [
        { type: 'ma_question', label: 'Essay Question', section: 'focus' },
        { type: 'ma_plan', label: 'Essay Plan', section: 'focus' },
        { type: 'ma_body_1', label: 'Body ¶1', section: 'paragraphs' },
        { type: 'ma_body_2', label: 'Body ¶2', section: 'paragraphs' },
        { type: 'ma_body_3', label: 'Body ¶3', section: 'paragraphs' },
        { type: 'ma_introduction', label: 'Introduction', section: 'structure' },
        { type: 'ma_conclusion', label: 'Conclusion', section: 'structure' },
    ];

    const PLAN_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'goal', label: 'Goal', section: 'focus' },
        { type: 'keywords', label: 'Keywords', section: 'focus' },
        { type: 'anchor_quote_start', label: 'Beginning', section: 'quotes' },
        { type: 'anchor_quote_mid', label: 'Middle', section: 'quotes' },
        { type: 'anchor_quote_end', label: 'End', section: 'quotes' },
        { type: 'body_para_1', label: 'Body ¶1', section: 'paragraphs' },
        { type: 'body_para_2', label: 'Body ¶2', section: 'paragraphs' },
        { type: 'body_para_3', label: 'Body ¶3', section: 'paragraphs' },
        { type: 'introduction', label: 'Introduction', section: 'structure' },
        { type: 'conclusion', label: 'Conclusion', section: 'structure' },
    ];

    // ── Revision Cascade Map ──
    // Each element knows: which step it belongs to, and what depends on it
    const REVISION_MAP = {
        question_text:      { step: 1, label: 'Essay Question', cascades: ['goal', 'keywords', 'anchor_quote_start', 'anchor_quote_mid', 'anchor_quote_end', 'body_para_1', 'body_para_2', 'body_para_3', 'introduction', 'conclusion'] },
        goal:               { step: 1, label: 'Goal', cascades: [] },
        keywords:           { step: 2, label: 'Keywords', cascades: [] },
        anchor_quote_start: { step: 3, label: 'Beginning Quote', cascades: ['body_para_1'] },
        anchor_quote_mid:   { step: 3, label: 'Middle Quote', cascades: ['body_para_2'] },
        anchor_quote_end:   { step: 3, label: 'End Quote', cascades: ['body_para_3'] },
        body_para_1:        { step: 4, label: 'Body ¶1 Plan', cascades: ['introduction', 'conclusion'] },
        body_para_2:        { step: 5, label: 'Body ¶2 Plan', cascades: ['introduction', 'conclusion'] },
        body_para_3:        { step: 6, label: 'Body ¶3 Plan', cascades: ['introduction', 'conclusion'] },
        introduction:       { step: 7, label: 'Introduction', cascades: [] },
        conclusion:         { step: 8, label: 'Conclusion', cascades: [] },
        // Poetry Conceptual Notes — no cascades (sections are independent)
        cn_section_1:       { step: 1, label: 'Speaker Understanding', cascades: [] },
        cn_section_2:       { step: 2, label: 'Historical Context', cascades: [] },
        cn_section_3:       { step: 3, label: 'Form', cascades: [] },
        cn_section_4:       { step: 4, label: 'Structure & Language', cascades: [] },
        cn_section_5:       { step: 5, label: 'Themes', cascades: [] },
        cn_section_6:       { step: 6, label: "Poet's Purpose", cascades: [] },
        cn_section_7:       { step: 7, label: 'The Big Message', cascades: [] },
        // Nonfiction Conceptual Notes
        nfcn_section_1:     { step: 1, label: "Writer's Voice", cascades: [] },
        nfcn_section_2:     { step: 2, label: 'Context', cascades: [] },
        nfcn_section_3:     { step: 3, label: 'Structure', cascades: [] },
        nfcn_section_4:     { step: 4, label: 'Text Type & Form', cascades: [] },
        nfcn_section_5:     { step: 5, label: 'Techniques', cascades: [] },
        nfcn_section_6:     { step: 6, label: 'Themes & Ideas', cascades: [] },
        nfcn_section_7:     { step: 7, label: "Writer's Purpose", cascades: [] },
        nfcn_section_8:     { step: 8, label: 'The Big Message', cascades: [] },
    };

    // ── Utility ──
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }
    function ucfirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : ''; }

    // ── Branded Confirm Modal ──
    function showConfirm(message, onConfirm, { confirmText = 'Continue', cancelText = 'Cancel', danger = false } = {}) {
        const overlay = el('div', { className: 'swml-confirm-overlay' });
        const modal = el('div', { className: 'swml-confirm-modal' });
        modal.appendChild(el('div', { className: 'swml-confirm-icon', textContent: danger ? '⚠️' : '💬' }));
        modal.appendChild(el('p', { className: 'swml-confirm-msg', textContent: message }));
        const actions = el('div', { className: 'swml-confirm-actions' });
        actions.appendChild(el('button', { className: 'swml-confirm-cancel', textContent: cancelText,
            onClick: () => overlay.remove() }));
        actions.appendChild(el('button', { className: `swml-confirm-ok ${danger ? 'danger' : ''}`, textContent: confirmText,
            onClick: () => { overlay.remove(); onConfirm(); } }));
        modal.appendChild(actions);
        overlay.appendChild(modal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        // Append inside canvas overlay if open (stacking context), otherwise body
        const canvasOv = document.getElementById('swml-canvas-overlay');
        (canvasOv || document.body).appendChild(overlay);
        // Focus confirm button
        requestAnimationFrame(() => modal.querySelector('.swml-confirm-ok')?.focus());
    }

    // ── Toast Notifications ──
    let toastCount = 0;
    const MAX_TOASTS_PER_SESSION = 2;
    function showToast(message, duration = 8000, skipLimit = false) {
        if (!skipLimit && toastCount >= MAX_TOASTS_PER_SESSION) return;
        if (!skipLimit) toastCount++;
        const toast = el('div', { className: 'swml-toast' });
        const msgSpan = el('span', { className: 'swml-toast-msg' });
        msgSpan.innerHTML = message;
        toast.appendChild(msgSpan);
        const close = el('button', { className: 'swml-toast-close', textContent: '✕',
            onClick: () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); } });
        toast.appendChild(close);
        const root = $('#swml-root') || document.body;
        root.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    // Trigger toast reminders after specific section completions
    function maybeTriggerToast() {
        if (state.task !== 'conceptual_notes') return;
        const completedSections = getElements().filter(e => e.section === 'notes' && state.plan[e.type]).length;
        // Show after 2nd and 5th section completions
        if (completedSections === 2 || completedSections === 5) {
            showToast('📋 <strong>Tip:</strong> Your notes are saved to your dashboard automatically. Copy any ideas to your workbook at any time!');
        }
    }

    // ── Theme ──
    function getSystemTheme() {
        return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    function getTheme() {
        // Manual override takes priority, otherwise follow system
        try {
            const manual = sessionStorage.getItem('swml-theme-manual');
            if (manual) return manual;
        } catch(e) {}
        return getSystemTheme();
    }
    function applyTheme(theme) {
        // Apply to both body and #swml-root to ensure CSS selectors match
        document.body.setAttribute('data-swml-theme', theme);
        const root = $('#swml-root');
        if (root) root.setAttribute('data-swml-theme', theme);
        // Update Jhey toggle if it exists (aria-pressed="true" = light mode)
        const toggle = $('#swml-theme-toggle');
        if (toggle) {
            const isDark = theme === 'dark';
            toggle.setAttribute('aria-pressed', isDark ? 'false' : 'true');
            toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        // Sync with site-wide theme toggle if available
        if (window.themeToggle) {
            window.themeToggle.setTheme(theme);
        }
    }
    function toggleTheme() {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        // Save as manual override
        try { sessionStorage.setItem('swml-theme-manual', newTheme); } catch(e) {}
        applyTheme(newTheme);
    }
    // Apply theme on load (respects system preference)
    applyTheme(getTheme());
    // Observe for #swml-root being added to DOM and reapply theme
    const themeObserver = new MutationObserver(() => {
        const root = document.getElementById('swml-root');
        if (root) {
            // Always sync — ensures system preference is applied after #swml-root renders
            const currentTheme = root.getAttribute('data-swml-theme');
            const correctTheme = getTheme();
            if (currentTheme !== correctTheme) {
                applyTheme(correctTheme);
            }
        }
    });
    themeObserver.observe(document.body, { childList: true, subtree: true });

    // Listen for system preference changes (only applies if no manual override)
    window.matchMedia?.('(prefers-color-scheme: light)').addEventListener('change', () => {
        try {
            if (!sessionStorage.getItem('swml-theme-manual')) {
                applyTheme(getSystemTheme());
            }
        } catch(e) {
            applyTheme(getSystemTheme());
        }
    });

    // Shared Jhey moon/sun toggle factory
    const JHEY_TOGGLE_HTML = '<div class="theme-toggle__socket"><div class="theme-toggle__socket-shadow"></div></div><div class="theme-toggle__face"><div class="theme-toggle__face-shadow"></div><div class="theme-toggle__face-glowdrop"></div><div class="theme-toggle__face-plate"></div><div class="theme-toggle__face-shine"><div class="theme-toggle__face-shine-shadow"></div></div><div class="theme-toggle__face-glows"><div></div></div><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__glow"><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke-width="0" class="theme-toggle__glow-path"></path></svg><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__trail-holder"><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke="#2CC6FE" stroke-linecap="round" stroke-dasharray="7 80" stroke-dashoffset="40" class="theme-toggle__trail"></path></svg><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__main"><g><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" fill="black" stroke="black" stroke-width="2" class="theme-toggle__outline"></path></g><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke="#2CC6FE" stroke-linecap="round" class="theme-toggle__trail"></path><g class="theme-toggle__inner"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" class="theme-toggle__inner-face"></path><path mask="url(#theme-toggle-inner-fade)" fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" class="theme-toggle__inner-bg"></path><g filter="url(#swml-theme-toggle-inner-shadow)" mask="url(#swml-theme-toggle-fade)" class="theme-toggle__inner-shadow"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" fill="hsl(0 0% 10% / .01)"></path></g></g><defs><filter id="swml-theme-toggle-inner-shadow" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dx="0.4" dy="0.5"></feOffset><feGaussianBlur stdDeviation="0.1"></feGaussianBlur><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend mode="normal" in2="shape" result="e1"></feBlend><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dx="0.3" dy="-0.5"></feOffset><feGaussianBlur stdDeviation="0.1"></feGaussianBlur><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend mode="normal" in2="e1" result="e2"></feBlend></filter><linearGradient id="swml-theme-toggle-fade-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(45)" gradientUnits="userSpaceOnUse"><stop offset="0.45" stop-color="white" stop-opacity="0"></stop><stop offset="0.75" stop-color="white" stop-opacity="0.75"></stop><stop offset="0.95" stop-color="white" stop-opacity="0.5"></stop><stop offset="1" stop-color="white" stop-opacity="0.35"></stop></linearGradient><linearGradient id="swml-theme-toggle-inner-fade-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(45)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="transparent" stop-opacity="0"></stop><stop offset="0.75" stop-color="white" stop-opacity="1"></stop></linearGradient><mask id="swml-theme-toggle-fade"><rect width="100%" height="100%" fill="url(#swml-theme-toggle-fade-gradient)"></rect></mask><mask id="swml-theme-toggle-inner-fade"><rect width="100%" height="100%" fill="url(#swml-theme-toggle-inner-fade-gradient)"></rect></mask></defs></svg></div><span class="theme-toggle__sr-only">Toggle dark mode</span>';
    function createThemeToggleBtn(id, onToggle) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle theme-toggle--wml';
        btn.setAttribute('aria-pressed', getTheme() === 'light' ? 'true' : 'false');
        btn.setAttribute('aria-label', getTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        if (id) btn.id = id;
        btn.innerHTML = JHEY_TOGGLE_HTML;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (onToggle) { onToggle(); }
            else { toggleTheme(); }
            const isDark = getTheme() === 'dark';
            btn.setAttribute('aria-pressed', isDark ? 'false' : 'true');
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        });
        return btn;
    }

    // Store referrer for Resume Course
    state.referrer = document.referrer || '';

    // ── SVG Icons (minimalist, uses currentColor for theming) ──
    // Input area (18px)
    const SVG_MIC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 3V5M1 2V6M19 3V5M23 2V6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18V22M12 22H9M12 22H15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const SVG_MIC_STOP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
    const SVG_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    const SVG_ATTACH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
    // Small inline (16px)
    const SVG_COPY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667h-8.666a2.667 2.667 0 0 1-2.667-2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1-1.012-1.737v-10c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>';
    const SVG_COPY_ASSESS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-3.333 -4c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3zm2 11h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2"/></svg>';
    const SENDER_HTML = '<img src="https://sophicly.b-cdn.net/Images/Writing%20Mastery%20Lab%20Phoenix%20Logo.svg" alt="" style="width:16px;height:16px;margin-right:5px">Sophic Intelligence';
    // Selection toolbar icons (14px)
    const SVG_SEL_REPLY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 20L1 12L11 4V9C16.5228 9 21 13.4772 21 19C21 19.2729 20.9891 19.5433 20.9676 19.8107C19.4605 16.9502 16.458 15 13 15H11V20Z"/></svg>';
    const SVG_SEL_INSERT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-4.333 4a1 1 0 0 0 -1 1v2h-2a1 1 0 0 0 -.993 .883l-.007 .117a1 1 0 0 0 1 1h2v2a1 1 0 0 0 .883 .993l.117 .007a1 1 0 0 0 1 -1v-2h2a1 1 0 0 0 .993 -.883l.007 -.117a1 1 0 0 0 -1 -1h-2v-2a1 1 0 0 0 -.883 -.993zm1 -8c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3z"/></svg>';
    const SVG_SEL_COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667h-8.666a2.667 2.667 0 0 1-2.667-2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1-1.012-1.737v-10c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>';
    const SVG_SEL_NOTE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 1V4H1V6H4V9H6V6H9V4H6V1H4ZM3 20.0066V11H5V19H13V14C13 13.45 13.45 13 14 13L19 12.999V5H11V3H20.0066C20.5552 3 21 3.45576 21 4.00247V15L15 20.996L4.00221 21C3.4487 21 3 20.5551 3 20.0066ZM18.171 14.999L15 15V18.169L18.171 14.999Z"/></svg>';

    // ── Question Selection + Utility Icons ──
    const SVG_ICON_GENERATE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 3 3 1.5-3 1.5L12 12l-1.5-3-3-1.5 3-1.5z"/><path d="M19 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M6 17l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>';
    const SVG_ICON_HAND_SELECT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.571L6.177 12.835C5.535 12.224 4.513 12.271 3.93 12.938C3.402 13.541 3.417 14.445 3.965 15.03L9.907 21.368C10.286 21.771 10.813 22 11.366 22H16C18.4 22 20 20 20 18V9.429"/><path d="M17 10V9.429C17 7.143 20 7.143 20 9.429"/><path d="M14 10V8.286C14 6 17 6 17 8.286V9.429"/><path d="M11 10V7.5C11 5.214 14 5.214 14 7.5V8.286"/><path d="M8 14.571V3.5C8 2.672 8.672 2 9.5 2C10.328 2 11 2.671 11 3.499V7.5"/></svg>';
    const SVG_ICON_PASTE = SVG_SEL_INSERT;
    const SVG_ICON_BULB = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"/><path d="M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M4.893 4.893a1 1 0 0 1 1.32 -.083l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 0 -1.414z"/><path d="M17.693 4.893a1 1 0 0 1 1.497 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7z"/><path d="M14 18a1 1 0 0 1 1 1a3 3 0 0 1 -6 0a1 1 0 0 1 .883 -.993l.117 -.007h4z"/><path d="M12 6a6 6 0 0 1 3.6 10.8a1 1 0 0 1 -.471 .192l-.129 .008h-6a1 1 0 0 1 -.6 -.2a6 6 0 0 1 3.6 -10.8z"/></svg>';
    const SVG_ICON_SAVE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3.707 10.293a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292a1 1 0 1 0 -1.414 1.414l2 2a1 1 0 0 0 1.414 0l4 -4a1 1 0 0 0 0 -1.414m-.707 -9.294l4 4.001h-4z"/></svg>';

    /** Map quick action label text to SVG icon */
    function getQuickActionIcon(label) {
        const l = label.toLowerCase();
        if (l.includes('generate') || l.includes('random question')) return SVG_ICON_GENERATE;
        if (l.includes('saved question') || l.includes('already saved')) return SVG_ICON_HAND_SELECT;
        if (l.includes('paste') || l.includes('type or paste')) return SVG_ICON_PASTE;
        // Save/confirm actions
        if (l.includes('save') || l.includes('yes, save') || l.includes('yes save')) return SVG_ICON_SAVE;
        // Edit/change/adjust actions
        if (l.includes('change') || l.includes('adjust') || l.includes('revise') || l.includes('tweak')) return SVG_ICON_EDIT;
        // Continue/proceed actions
        if (l.includes('carry on') || l.includes('continue') || l.includes('proceed') || l.includes('let\'s go') || l.includes('ready') || l.includes('yes,') || l.includes('yes!') || /^yes\b/.test(l)) return SVG_ICON_FORWARD;
        // Explain/help actions
        if (l.includes('explain') || l.includes('help') || l.includes('not sure') || l.includes('confused')) return SVG_ICON_HELP;
        return '';
    }
    const SVG_ICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4"/><path d="M13.5 6.5l4 4"/></svg>';
    const SVG_ICON_FORWARD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
    const SVG_ICON_HELP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    const SVG_NOTES_PANEL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14L16 14"/><path d="M8 10L10 10"/><path d="M8 18L12 18"/><path d="M10 3H6C4.89543 3 4 3.89543 4 5V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V5C20 3.89543 19.1046 3 18 3H14.5M10 3V1M10 3V5"/></svg>';
    const SVG_SOCRATIC = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.14466 2 1.00003 5.83274 1.00003 11C1.00003 13.2801 2.02853 15.3265 3.66073 16.8769C3.1358 18.379 2.16871 19.4171 1.29292 20.2929C1.00692 20.5789 0.921369 21.009 1.07615 21.3827C1.23093 21.7564 1.59557 22 2.00003 22C3.61633 22 4.89236 21.7348 6.02384 21.2248C6.97278 20.797 7.77846 20.215 8.56263 19.5533C9.64621 19.8437 10.8021 20 12 20C17.8554 20 23 16.1673 23 11C23 5.83274 17.8554 2 12 2ZM8.00003 7C7.44774 7 7.00003 7.44772 7.00003 8C7.00003 8.55228 7.44774 9 8.00003 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H8.00003ZM8.00003 10C7.44774 10 7.00003 10.4477 7.00003 11C7.00003 11.5523 7.44774 12 8.00003 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H8.00003ZM8.00003 13C7.44774 13 7.00003 13.4477 7.00003 14C7.00003 14.5523 7.44774 15 8.00003 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13H8.00003Z"/></svg>';
    const SVG_SAVE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3H17L20.707 6.707C20.895 6.895 21 7.149 21 7.414V20C21 20.552 20.552 21 20 21H4C3.448 21 3 20.552 3 20V4C3 3.448 3.448 3 4 3ZM12 18C13.657 18 15 16.657 15 15C15 13.343 13.657 12 12 12C10.343 12 9 13.343 9 15C9 16.657 10.343 18 12 18ZM5 5V9H15V5H5Z"/></svg>';
    const SVG_TIMER = '<svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L15 2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 10L12 14" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const SVG_BRAIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11 2.53513C10.4117 2.19479 9.72857 2 9 2 6.79086 2 5 3.79086 5 6V7.77422C4.14895 8.11644 3.45143 8.64785 2.94126 9.34933 2.29239 10.2415 2 11.3347 2 12.5 2 14.0614 2.79529 15.4356 4 16.242V17.5C4 19.9853 6.01472 22 8.5 22 9.42507 22 10.285 21.7209 11 21.2422V17.5C11 16.167 10.67 15.3147 10.1402 14.7408 9.59743 14.1528 8.71622 13.7165 7.3356 13.4864L7.6644 11.5136C8.96602 11.7305 10.1058 12.1373 11 12.8271V2.53513ZM13 2.53513V12.8271C13.8942 12.1373 15.034 11.7305 16.3356 11.5136L16.6644 13.4864C15.2838 13.7165 14.4026 14.1528 13.8598 14.7408 13.33 15.3147 13 16.167 13 17.5V21.2422C13.715 21.7209 14.5749 22 15.5 22 17.9853 22 20 19.9853 20 17.5V16.242C21.2047 15.4356 22 14.0614 22 12.5 22 11.3347 21.7076 10.2415 21.0587 9.34933 20.5486 8.64785 19.8511 8.11644 19 7.77422V6C19 3.79086 17.2091 2 15 2 14.2714 2 13.5883 2.19479 13 2.53513Z"/></svg>';
    const SVG_KEYBOARD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 5a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-16a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3zm-14 8a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m12 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m-7.998 0a1 1 0 0 0 -.004 2l4 .01a1 1 0 0 0 .005 -2zm-4.002 -4a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1"/></svg>';
    const SVG_AI_GENERATE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.7134 9.12811L19.4668 9.69379C19.2864 10.1079 18.7136 10.1079 18.5331 9.69379L18.2866 9.12811C17.8471 8.11947 17.0555 7.31641 16.0677 6.87708L15.308 6.53922C14.8973 6.35653 14.8973 5.75881 15.308 5.57612L16.0252 5.25714C17.0384 4.80651 17.8442 3.97373 18.2761 2.93083L18.5293 2.31953C18.7058 1.89349 19.2942 1.89349 19.4706 2.31953L19.7238 2.93083C20.1558 3.97373 20.9616 4.80651 21.9748 5.25714L22.6919 5.57612C23.1027 5.75881 23.1027 6.35653 22.6919 6.53922L21.9323 6.87708C20.9445 7.31641 20.1529 8.11947 19.7134 9.12811ZM6 5C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V12H22V17C22 19.2091 20.2091 21 18 21H6C3.79086 21 2 19.2091 2 17V7C2 4.79086 3.79086 3 6 3H13V5H6Z"/></svg>';
    const SVG_LIST_DETAILS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 5h8"/><path d="M13 9h5"/><path d="M13 15h8"/><path d="M13 19h5"/><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/></svg>';
    const SVG_QA_FILL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 18H18.2372L20 19.3851V9H21C21.5523 9 22 9.44772 22 10V23.5L17.5455 20H9C8.44772 20 8 19.5523 8 19V18ZM5.45455 16L1 19.5V4C1 3.44772 1.44772 3 2 3H17C17.5523 3 18 3.44772 18 4V16H5.45455Z"/></svg>';
    const SVG_NOTES = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17 2V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"/></svg>';
    const SVG_MIC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18V22M12 22H9M12 22H15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const SVG_SPARKLES = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.89 3.706c.336-1.093 1.883-1.093 2.22 0l1.553 5.049c.092.3.32.538.614.645l4.065 1.478c1.047.381 1.047 1.862 0 2.243l-4.065 1.478a1.09 1.09 0 0 0-.614.645l-1.554 5.05c-.336 1.092-1.883 1.092-2.219 0l-1.554-5.05a1.09 1.09 0 0 0-.614-.645l-4.064-1.478c-1.048-.381-1.048-1.862 0-2.243l4.064-1.478a1.09 1.09 0 0 0 .614-.645l1.554-5.05Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.801 3.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.801 17.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/></svg>';
    // Task card icons (28px)
    const SVG_PHASE_WRITE = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4"/><path d="M13.5 6.5l4 4"/></svg>';
    const SVG_PHASE_REDRAFT = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"/></svg>';
    const SVG_PHASE_LOCK = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    const SVG_PHASE_TIMER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l2 2"/><path d="M19 3l-2 2"/><path d="M12 3v2"/></svg>';
    const SVG_PHASE_CUSTOM = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    const SVG_PHASE_ZEN = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
    // Diagnostic guidance icons (16px, stroke=currentColor for theming)
    const SVG_GUIDE_LOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M8 11m0 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1z"/><path d="M10 11v-2a2 2 0 1 1 4 0v2"/></svg>';
    const SVG_GUIDE_BRAIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.535C10.412 2.195 9.729 2 9 2 6.791 2 5 3.791 5 6v1.774c-.851.342-1.549.874-2.059 1.575C2.292 10.242 2 11.335 2 12.5c0 1.561.795 2.936 2 3.742V17.5C4 19.985 6.015 22 8.5 22c.925 0 1.785-.279 2.5-.758V17.5c0-1.333-.33-2.185-.86-2.759-.543-.588-1.424-1.024-2.804-1.255l.329-1.972c1.302.217 2.441.624 3.335 1.314V2.535zM13 2.535v10.292c.894-.69 2.034-1.097 3.336-1.314l.329 1.972c-1.381.231-2.262.668-2.804 1.255-.53.574-.86 1.427-.86 2.76v3.742c.715.479 1.575.758 2.5.758C17.985 22 20 19.985 20 17.5v-1.258c1.205-.806 2-2.181 2-3.742 0-1.165-.292-2.258-.941-3.151-.51-.701-1.208-1.233-2.059-1.575V6c0-2.209-1.791-4-4-4-.729 0-1.412.195-2 .535z"/></svg>';
    const SVG_GUIDE_TARGET = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3-3h-3v-3z"/><path d="M15 9l-3 3"/></svg>';
    const SVG_GUIDE_STOPWATCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><line x1="9.14" y1="1.5" x2="14.86" y2="1.5"/><circle cx="12" cy="13.91" r="8.59"/><path d="M15.37,10.53a4.77,4.77,0,0,1-6.74,6.75"/><line x1="12" y1="5.32" x2="12" y2="1.5"/><circle cx="12" cy="13.91" r="0.95"/><line x1="12" y1="8.18" x2="12" y2="12.95"/><line x1="4.36" y1="5.32" x2="6.27" y2="7.23"/><line x1="19.64" y1="5.32" x2="17.73" y2="7.23"/></svg>';
    const SVG_GUIDE_ARM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C9.239 12 7 9.761 7 7s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm6 5v5h-2v-5c0-4.451 2.644-8.285 6.448-10.016l.828 1.821C20.164 10.221 18 13.358 18 17zM8 17v5H6v-5c0-3.642-2.163-6.779-5.274-8.195l.828-1.821C5.356 8.715 8 12.549 8 17z"/></svg>';
    const SVG_GUIDE_WRITING = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2 2-2z"/><path d="M16 7h4"/><path d="M18 19h-13a2 2 0 1 1 0-4h4a2 2 0 1 0 0-4h-3"/></svg>';
    const SVG_GUIDE_GRAPH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><rect x="2.45" y="16.77" width="3.82" height="5.73"/><rect x="17.73" y="9.14" width="3.82" height="13.36"/><rect x="10.09" y="12.95" width="3.82" height="9.55"/><line x1="0.55" y1="22.5" x2="23.45" y2="22.5"/><polyline points="15.82 1.5 20.59 1.5 20.59 6.27"/><path d="M2.45,10.09a23,23,0,0,0,16.3-6.75L20.59,1.5"/></svg>';
    const SVG_DISCUSS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>';
    const SVG_MARK_SCHEME = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12l2 2l4-4"/></svg>';
    const SVG_MODEL_ANSWER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    const SVG_PLAN = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.615 20h-2.615a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/><path d="M14 19l2 2l4-4"/><path d="M9 8h4"/><path d="M9 12h2"/></svg>';
    const SVG_ASSESS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M9 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M15 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M4 20h14"/></svg>';
    const SVG_OUTLINE_STEP = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h8"/><path d="M9 9h5"/><path d="M9 15h8"/><path d="M9 19h5"/><path d="M5 5l0 .01"/><path d="M5 9l0 .01"/><path d="M5 15l0 .01"/><path d="M5 19l0 .01"/></svg>';
    const SVG_POLISH = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.89 3.706c.336-1.093 1.883-1.093 2.22 0l1.553 5.049c.092.3.32.538.614.645l4.065 1.478c1.047.381 1.047 1.862 0 2.243l-4.065 1.478a1.09 1.09 0 0 0-.614.645l-1.554 5.05c-.336 1.092-1.883 1.092-2.219 0l-1.554-5.05a1.09 1.09 0 0 0-.614-.645l-4.064-1.478c-1.048-.381-1.048-1.862 0-2.243l4.064-1.478a1.09 1.09 0 0 0 .614-.645l1.554-5.05Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.801 3.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.801 17.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/></svg>';
    // Sidebar & nav (16px)
    const SVG_VIDEO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.6V20.4C21 20.731 20.731 21 20.4 21H7.6C7.269 21 7 20.731 7 20.4V7.6C7 7.269 7.269 7 7.6 7H20.4C20.731 7 21 7.269 21 7.6Z"/><path d="M18 4H4.6C4.269 4 4 4.269 4 4.6V18"/><path d="M12.909 11.545C12.509 11.305 12 11.593 12 12.06V15.94C12 16.407 12.509 16.695 12.909 16.455L16.143 14.515C16.531 14.282 16.531 13.718 16.143 13.486L12.909 11.545Z"/></svg>';
    const SVG_LIBRARY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><line x1="0.55" y1="22.5" x2="23.45" y2="22.5"/><rect x="2.45" y="1.5" width="4.77" height="21.05"/><rect x="7.23" y="7.23" width="3.82" height="15.27"/><rect x="16.77" y="2.45" width="4.77" height="20.05"/><rect x="11.05" y="4.36" width="5.73" height="18.14"/><line x1="7.23" y1="17.73" x2="11.05" y2="17.73"/><line x1="12.95" y1="18.68" x2="14.86" y2="18.68"/><line x1="2.45" y1="18.68" x2="7.23" y2="18.68"/><line x1="2.45" y1="5.32" x2="7.23" y2="5.32"/></svg>';
    const SVG_FOLDER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19l2.757-7.351a1 1 0 0 1 .936-.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1-1.964 1.625h-14.026a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v2"/></svg>';
    const SVG_DASHBOARD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.024 22C16.277 22 17.352 21.934 18.251 21.735C19.161 21.532 19.949 21.18 20.565 20.565C21.18 19.949 21.532 19.161 21.735 18.251C21.934 17.352 22 16.277 22 15.024V12C22 10.895 21.105 10 20 10H12C10.895 10 10 10.895 10 12V20C10 21.105 10.895 22 12 22H15.024Z"/><path d="M2 15.024C2 16.277 2.066 17.352 2.266 18.251C2.468 19.161 2.82 19.949 3.435 20.565C4.051 21.18 4.839 21.532 5.749 21.735C5.836 21.754 5.924 21.772 6.012 21.789C7.096 21.999 8 21.081 8 19.976V12C8 10.895 7.105 10 6 10H4C2.895 10 2 10.895 2 12V15.024Z"/><path d="M8.976 2C7.723 2 6.648 2.066 5.749 2.266C4.839 2.468 4.051 2.82 3.435 3.435C2.82 4.051 2.468 4.839 2.266 5.749C2.249 5.824 2.233 5.899 2.219 5.974C2.004 7.073 2.939 8 4.058 8H19.976C21.081 8 21.999 7.096 21.789 6.012C21.772 5.924 21.754 5.836 21.735 5.749C21.532 4.839 21.18 4.051 20.565 3.435C19.949 2.82 19.161 2.468 18.251 2.266C17.352 2.066 16.277 2 15.024 2H8.976Z"/></svg>';
    const SVG_BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4l4-4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>';
    const SVG_RESTART = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM16.82 17.076C18.163 15.801 19 13.998 19 12C19 8.134 15.866 5 12 5C8.134 5 5 8.134 5 12C5 15.866 8.134 19 12 19C13.061 19 14.067 18.764 14.968 18.342L13.993 16.587C13.382 16.853 12.708 17 12 17C9.239 17 7 14.761 7 12C7 9.239 9.239 7 12 7C14.761 7 17 9.239 17 12H14L16.82 17.076Z"/></svg>';
    // Phase icons (20px)
    const SVG_WRITING = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19c3.333-2 5-4 5-6c0-3-1-3-2-3s-2.032 1.085-2 3c.034 2.048 1.658 2.877 2.5 4c1.5 2 2.5 2.5 3.5 1c.667-1 1.167-1.833 1.5-2.5c1 2.333 2.333 3.5 4 3.5h2.5"/><path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2l2-2z"/><path d="M16 7h4"/></svg>';
    const SVG_REDRAFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91"><path stroke-miterlimit="10" d="M12 1.5A10.52 10.52 0 1 1 3.39 18.07"/><line stroke-linecap="round" stroke-linejoin="round" x1="1.48" y1="12.02" x2="1.48" y2="12.02"/><path stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 4.13" d="M2.28 8A10.51 10.51 0 0 1 10 1.7"/><line stroke-linecap="round" stroke-linejoin="round" x1="12" y1="1.5" x2="12" y2="1.5"/><polyline stroke-miterlimit="10" points="3.39 23.5 3.39 17.76 9.13 17.76"/></svg>';

    function el(tag, attrs = {}, children = []) {
        const e = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'className') e.className = v;
            else if (k === 'innerHTML') e.innerHTML = v;
            else if (k === 'textContent') e.textContent = v;
            else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
            else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
            else e.setAttribute(k, v);
        }
        for (const c of [].concat(children)) {
            if (typeof c === 'string') e.appendChild(document.createTextNode(c));
            else if (c) e.appendChild(c);
        }
        return e;
    }

    async function apiPost(url, body) { return (await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })).json(); }
    async function apiGet(url) { return (await fetch(url, { headers })).json(); }

    // ── 3D Push Button builder (v7.12.32) ──
    // Creates a Sophicly-branded 3D animated button with per-character text animation.
    // text1: initial text, text2: text after click, onClick: handler
    function build3DButton(text1, text2, onClick) {
        const btn = el('button', { className: 'swml-3d-btn' });
        // Background shadow layer
        btn.appendChild(el('div', { className: 'swml-3d-bg' }));
        // Splash SVG
        btn.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" height="208" width="342" class="swml-3d-splash"><path stroke-linecap="round" stroke-width="3" d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"/><path stroke-linecap="round" stroke-width="3" d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"/></svg>';
        // Wrap
        const wrap = el('div', { className: 'swml-3d-wrap' });
        wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height="42" width="221" class="swml-3d-path"><path stroke-linecap="round" stroke-width="3" d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"/></svg>';
        wrap.appendChild(el('div', { className: 'swml-3d-outline' }));
        // Content
        const content = el('div', { className: 'swml-3d-content' });
        // State 1 text (character-by-character)
        const chars1 = el('span', { className: 'swml-3d-char swml-3d-s1' });
        let charIdx = 1;
        for (const ch of text1) {
            if (ch === ' ') { charIdx++; const sp = el('span', { 'data-label': '\u00A0' }); sp.textContent = '\u00A0'; sp.style.setProperty('--i', charIdx); sp.style.marginLeft = '4px'; chars1.appendChild(sp); }
            else { const sp = el('span', { 'data-label': ch }); sp.textContent = ch; sp.style.setProperty('--i', charIdx++); chars1.appendChild(sp); }
        }
        content.appendChild(chars1);
        // Arrow icon
        const icon = el('div', { className: 'swml-3d-icon' });
        icon.appendChild(el('div'));
        content.appendChild(icon);
        // State 2 text
        const chars2 = el('span', { className: 'swml-3d-char swml-3d-s2' });
        charIdx = 1;
        for (const ch of text2) {
            if (ch === ' ') { charIdx++; const sp = el('span', { 'data-label': '\u00A0' }); sp.textContent = '\u00A0'; sp.style.setProperty('--i', charIdx); sp.style.marginLeft = '4px'; chars2.appendChild(sp); }
            else { const sp = el('span', { 'data-label': ch }); sp.textContent = ch; sp.style.setProperty('--i', charIdx++); chars2.appendChild(sp); }
        }
        content.appendChild(chars2);
        wrap.appendChild(content);
        btn.appendChild(wrap);
        btn.addEventListener('click', onClick);
        return btn;
    }

    // ── Shared Typing Indicator (v7.12.35 — refactoring Step 3) ──
    // Parameterized functions usable by both main chat and canvas chat.
    function createTypingBubble(container) {
        if (!container) return;
        const bubble = el('div', { className: 'swml-bubble ai swml-typing-bubble' });
        const content = el('div', { className: 'swml-bubble-content' });
        content.appendChild(el('div', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
        const dots = el('div', { className: 'swml-typing' });
        for (let i = 0; i < 3; i++) dots.appendChild(el('div', { className: 'swml-typing-dot' }));
        content.appendChild(dots);
        bubble.appendChild(content);
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }
    function removeTypingBubble(container) {
        if (!container) return;
        const bubble = container.querySelector('.swml-typing-bubble');
        if (bubble) bubble.remove();
    }

    // ── Vertical Stepper Component ──────────────────────────────────────────
    // Reusable stepped timeline for phase/sub-step navigation.
    // steps: [{ id, icon, title, desc, status, statusLabel, onClick }]
    // status: 'complete' | 'active' | 'not_started' | 'locked'
    function buildStepper(steps) {
        const container = el('div', { className: 'swml-stepper' });
        const SVG_STEP_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        const SVG_STEP_LOCK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

        steps.forEach((step, i) => {
            const isLast = i === steps.length - 1;
            const stateClass = step.status === 'complete' ? 'is-complete'
                : step.status === 'active' ? 'is-active'
                : step.status === 'locked' ? 'is-locked' : 'is-not-started';

            // Rail: circle + connector line
            const circleContent = step.status === 'complete' ? SVG_STEP_CHECK
                : step.status === 'locked' ? SVG_STEP_LOCK
                : String(i + 1);
            const circle = el('div', {
                className: 'swml-stepper-circle',
                ...(step.status === 'complete' || step.status === 'locked' ? { innerHTML: circleContent } : { textContent: circleContent })
            });
            const line = !isLast ? el('div', { className: 'swml-stepper-line' }) : null;
            const rail = el('div', { className: 'swml-stepper-rail' }, [circle, line].filter(Boolean));

            // Card (reuses glassmorphic card style)
            const statusTag = el('span', {
                className: 'swml-status-tag ' + (step.status === 'complete' ? 'complete' : step.status === 'active' ? 'in-progress' : step.status === 'locked' ? 'not-started' : 'not-started'),
                textContent: step.statusLabel || (step.status === 'complete' ? '✓ Complete' : step.status === 'active' ? '◐ In progress' : step.status === 'locked' ? '🔒 Locked' : '○ Not started')
            });
            if (step.statusTagId) statusTag.id = step.statusTagId;

            const card = el('button', {
                className: 'swml-stepper-card',
                onClick: (step.status === 'locked' && !window.WML?._unlockAll) ? () => {} : (step.onClick || (() => {}))
            }, [
                el('span', { className: 'swml-path-icon', innerHTML: step.icon }),
                el('span', { className: 'swml-path-title', textContent: step.title }),
                el('span', { className: 'swml-path-desc', textContent: step.desc }),
                statusTag
            ]);

            const row = el('div', { className: `swml-stepper-step ${stateClass}` }, [rail, card]);
            container.appendChild(row);
        });

        return container;
    }

    // ── Phase Sub-Step Data Model ───────────────────────────────────────────
    // Returns the sub-steps array for a given phase with status + onClick wired
    function getPhaseSubSteps(phase, statuses, baseType) {
        if (phase === 'initial') {
            return [
                {
                    id: 'diagnostic',
                    icon: SVG_PHASE_WRITE,
                    title: 'Write Essay',
                    desc: 'Write your essay independently — no AI, no notes.',
                    status: statuses.diagnostic || 'not_started',
                    statusLabel: statuses.diagnosticLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = ''; // Clear — NOT assessment mode
                        // Route directly — no intermediary screen (cross-module: late-bound via WML)
                        if (statuses.diagnostic === 'active') {
                            state.canvasTimer = 0;
                            window.WML.renderCanvasWorkspace();
                        } else if (statuses.diagnostic === 'complete') {
                            state.canvasTimer = 0;
                            window.WML.renderCanvasWorkspace();
                        } else {
                            window.WML.renderDiagnosticTimerSelect();
                        }
                    }
                },
                {
                    id: 'assessment',
                    icon: SVG_ASSESS,
                    title: 'Get Assessed',
                    desc: 'Submit your essay for detailed AI marking and feedback.',
                    status: statuses.assessment || (statuses.diagnostic === 'complete' ? 'not_started' : 'locked'),
                    statusLabel: statuses.assessmentLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = 'assessment';
                        state.canvasTimer = 0;
                        state.step = 0; // Reset so initAssessmentState can restore from chat history (v7.12.32)
                        window.WML.renderCanvasWorkspace();
                    }
                },
                // Discuss Feedback is Phase 1 — comes after assessment (v7.12.76)
                {
                    id: 'feedback_discussion',
                    icon: SVG_DISCUSS,
                    title: 'Discuss Your Feedback',
                    desc: 'Watch the feedback videos and discuss your results with your tutor.',
                    status: statuses.feedback_discussion || (statuses.assessment === 'complete' ? 'not_started' : 'locked'),
                    statusLabel: statuses.feedbackDiscussionLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = 'feedback_discussion';
                        state.canvasTimer = 0;
                        window.WML.renderCanvasWorkspace();
                    }
                }
            ];
        }
        // Phase 2 — Redraft: Mark Scheme → Model Answer → Planning → Outlining → Polishing → Reassessment
        const msDone = statuses.mark_scheme === 'complete' || statuses.mark_scheme === 'skipped';
        const maDone = statuses.model_answer === 'complete' || statuses.model_answer === 'skipped';
        return [
            {
                id: 'mark_scheme',
                icon: SVG_MARK_SCHEME,
                title: 'Mark Scheme Study',
                desc: 'Learn how your essay is marked — understand the assessment objectives.',
                status: statuses.mark_scheme || 'not_started',
                statusLabel: statuses.markSchemeLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'mark_scheme';
                    state.canvasTimer = 0;
                    window.WML.renderCanvasWorkspace(); // TipTap document (v7.12.88)
                }
            },
            {
                id: 'model_answer',
                icon: SVG_MODEL_ANSWER,
                title: 'Watch Model Answer',
                desc: 'Watch and study a model answer for this question.',
                status: statuses.model_answer || (msDone ? 'not_started' : 'locked'),
                statusLabel: statuses.modelAnswerLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'model_answer_video';
                    window.WML.renderFeedbackDiscussionCanvas(); // Reuses lightweight canvas pattern
                }
            },
            {
                id: 'planning',
                icon: SVG_PLAN,
                title: 'Plan Your Redraft',
                desc: 'Work through your feedback and build an improved essay plan.',
                status: statuses.planning || (maDone ? 'not_started' : 'locked'),
                statusLabel: statuses.planningLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('planning');
                }
            },
            {
                id: 'outlining',
                icon: SVG_OUTLINE_STEP,
                title: 'Outline Your Essay',
                desc: 'Structure your redraft — organise paragraphs, quotes, and key points.',
                status: statuses.outlining || (statuses.planning === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.outliningLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('outlining');
                }
            },
            {
                id: 'polishing',
                icon: SVG_POLISH,
                title: 'Polish Your Essay',
                desc: 'Write your improved essay using your outline with AI guidance.',
                status: statuses.polishing || (statuses.outlining === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.polishingLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('polishing');
                }
            },
            {
                id: 'reassessment',
                icon: SVG_ASSESS,
                title: 'Get Reassessed',
                desc: 'Submit your polished essay for final marking.',
                status: statuses.reassessment || (statuses.polishing === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.reassessmentLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'assessment';
                    state.canvasTimer = 0;
                    state.step = 0; // Reset so initAssessmentState can restore from chat history (v7.12.32)
                    window.WML.renderCanvasWorkspace();
                }
            }
        ];
    }

    // Strip AI internal content (JSON, function calls, protocol markers) — shared by both chat systems
    function stripAIInternals(text) {
        // Strip [PANEL:...][/PANEL] tags (keep inner text)
        text = text.replace(/\[PANEL:\s*\w+\]([\s\S]*?)\[\/PANEL\]/g, '$1').trim();
        // Strip LaTeX $$ blocks
        text = text.replace(/\$\$[^$]*?\$\$/g, '').trim();
        // Strip Python-style function calls
        text = text.replace(/^(?:```)?python\s*\n?/gm, '');
        text = text.replace(/save_plan_element\([^)]*\)\s*/g, '').trim();
        text = text.replace(/\(save_plan_element\s+called\s+for[\s\S]*?\)\s*/gi, '').trim();
        // Strip ```json blocks
        text = text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
        // Strip bare JSON with tool/function/element_type keys
        text = text.replace(/\{\s*"(?:tool|function|element_type|name|parameters)"[\s\S]*?\}\s*/g, '').trim();
        // Strip orphaned ``` and leading ---
        text = text.replace(/^```\s*$/gm, '').trim();
        text = text.replace(/^---\s*\n/, '').trim();
        // Strip [Calling function_name with arguments: ...] leaked from function calling
        text = text.replace(/\[Calling\s+\w+\s+with\s+arguments:[^\]]*\]\s*/g, '').trim();
        // Strip [SAVE: element_type] protocol markers
        text = text.replace(/\[SAVE:\s*\w+\]\s*/g, '').trim();
        // Strip [ASSESSMENT_COMPLETE] code word (v7.12.23)
        text = text.replace(/\[ASSESSMENT_COMPLETE\]\s*/gi, '').trim();
        // Strip instruction markers
        text = text.replace(/\[END[^\]]*\]/g, '').trim();
        text = text.replace(/\[do NOT[^\]]*\]/gi, '').trim();
        // Strip AI narrating internal process
        text = text.replace(/(?:The student (?:confirmed|chose|selected|wants?).*?(?:I (?:need to|should|will|must)|Let me).*?(?:save_session_element|save_plan_element|move forward|proceed)[^.]*\.?\s*)/gi, '').trim();
        text = text.replace(/(?:^|\n)\s*(?:I (?:need to|should|will|must)\s+(?:call|save|move|proceed|transition)[^.\n]*\.?\s*)/gim, '\n').trim();
        // Strip bare "json" prefix (when AI leaks code fence language tag without backticks)
        text = text.replace(/^json\s*\n/gm, '').trim();
        return text;
    }

    // ── Assessment step detection utility (v7.12.34) ──
    // Shared by sendCanvasMessage and initAssessmentState.
    // Returns { step, isComplete, totalScore, grade }
    // CRITICAL: Regexes must require DEFINITIVE scoring evidence — a score that is AWARDED
    // (e.g., "**5/7**" or "Score: 3/3"), not mentioned as context or preview.
    // The AI recaps earlier section scores in later messages, so patterns must be strict.
    function detectAssessmentStep(replyText) {
        const r = replyText || '';
        let step = 0;
        const hasTotal = /(?:total|grand total)[:\s*]+\d+(?:\.\d+)?\/\d+/i.test(r);
        const hasGrade = /\bgrade[:\s*]+(?:level\s*|grade\s*)?\d/i.test(r);

        // Step 8: Final Summary — verified safe keywords (protocol analysis v7.12.35, v7.12.51)
        // These patterns ONLY appear in the final assessment section, never in individual section feedback.
        if (/\[ASSESSMENT_COMPLETE\]/i.test(r)) step = 8;
        else if (/Closing\s+Summary/i.test(r) && (hasTotal || hasGrade)) step = 8;
        else if (/Action\s+Plan/i.test(r) && /Hattie/i.test(r)) step = 8;
        else if (/Priority\s+Target/i.test(r) && hasGrade) step = 8;
        else if (/Where\s+am\s+I\s+going/i.test(r) && /How\s+am\s+I\s+going/i.test(r)) step = 8;
        else if (/Priority\s+Target/i.test(r) && /Action\s+Plan/i.test(r)) step = 8;
        else if (/Next\s+Steps/i.test(r) && /Priority\s+Target/i.test(r)) step = 8;
        else if (/Closing\s+Summary/i.test(r) && /Key\s+Strength/i.test(r)) step = 8;
        else if (hasTotal && hasGrade) step = 8;

        // Step 7: AO4/Technical Accuracy — explicit heading at line start
        else if (/^#{1,3}\s*(?:AO4|Technical\s+Accuracy)/m.test(r)) step = 7;
        // Step 7: Conclusion — heading at line start OR "Conclusion" with awarded score on same line
        else if (/^#{1,3}\s*Conclusion/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*6\b/.test(r)) step = 7;
        else if (/\*{2}Conclusion[^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*6\b/i.test(r)) step = 7;

        // Step 6: Body Paragraphs — heading at line start with assessment context
        // Only triggers when a body paragraph heading appears with its score
        else if (/^#{1,3}\s*Body\s+Paragraph\s+[1-3]/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*7\b/.test(r)) step = 6;
        else if (/\*{2}Body\s+Paragraph\s+[1-3][^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*7\b/i.test(r)) step = 6;

        // Step 5: Introduction — heading at line start with score
        else if (/^#{1,3}\s*Introduction/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*3\b/.test(r)) step = 5;
        else if (/\*{2}Introduction[^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*3\b/i.test(r)) step = 5;

        // Step 4: Essay Review — keyword check or structure confirmation
        else if (/^#{1,3}\s*(?:Essay\s+Review|Keyword\s+Check|Structure\s+Review)/m.test(r)) step = 4;
        else if (/(?:keyword\s+check|confirm\s+the\s+(?:essay\s+)?structure|identified?\s+\d+\s+paragraph)/i.test(r)) step = 4;

        // Step 3: Self-Reflection — student rating scale
        else if (/Self-[Rr]eflection|(?:scale\s+of\s+1|rate\s+(?:your|each|this)\s+paragraph|how\s+well.*paragraph)/i.test(r)) step = 3;

        // Step 2: Goal Setting — grade aim question
        else if (/(?:grade.*aim|target.*grade|what\s+grade\s+are\s+you)/i.test(r)) step = 2;

        // Step 1: Setup — word count/deficit
        else if (/(?:word.?count|deficit|penalty|W1)/i.test(r)) step = 1;

        // Assessment complete detection — mirrors step 8 logic
        const isComplete = step >= 8;
        // Force-extract scores
        let totalScore = null;
        let grade = null;
        const ts = r.match(/(?:\*{0,2})(?:total|grand total)[:\s*]+(\d+(?:\.\d+)?\/[1-9]\d+)/i);
        if (ts) totalScore = ts[1];
        const gr = r.match(/(?:\*{0,2})grade[:\s*]+(?:level\s*|grade\s*)?(\d[^.,*\n]{0,20})/i);
        if (gr) grade = gr[0].replace(/\*/g, '').trim();
        return { step, isComplete, totalScore, grade };
    }

    function formatAI(text) {
        // ── Pre-process: strip ASCII progress bars (protocol artefact) ──
        // Matches patterns like "[Progress: ████████░░░░ 50%]" or "Progress: ███░░░ 30%"
        text = text.replace(/\[?Progress:\s*[█▓▒░■□●○\u2588-\u259F\s]+\d+%\]?/gi, '').trim();

        // ── Pre-process: split concatenated pipe table rows (AI sometimes omits newlines) ──
        // Pattern: "| cell |  | cell |" → "| cell |\n| cell |" (double-pipe = row boundary)
        text = text.replace(/\|\s*\|(?=\s*[A-Za-z0-9*])/g, '|\n|');

        // ── Markdown tables → HTML tables (before newline conversion) ──
        const tableBlocks = [];
        text = text.replace(/((?:\|[^\n]+\|\n?)+)/g, (block) => {
            const rows = block.trim().split('\n').filter(r => r.trim().startsWith('|'));
            if (rows.length < 2) return block; // not a real table
            // Check if row 2 is a separator (|---|---|)
            const isSep = /^\|[\s:]*-{2,}[\s:]*\|/.test(rows[1]);
            // If no separator but looks like a table (3+ rows, consistent columns), synthesise one
            if (!isSep && rows.length >= 3) {
                const headerCols = rows[0].split('|').filter(Boolean).length;
                const dataCols = rows[1].split('|').filter(Boolean).length;
                if (headerCols >= 2 && dataCols >= 2 && headerCols === dataCols) {
                    const sep = '|' + ' --- |'.repeat(headerCols);
                    rows.splice(1, 0, sep);
                } else {
                    return block;
                }
            } else if (!isSep) {
                return block;
            }

            let tableHtml = '<table class="swml-table"><thead><tr>';
            // Helper: convert inline markdown in cell text
            const fmtCell = (c) => c.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Header row
            rows[0].split('|').filter(Boolean).forEach(cell => {
                tableHtml += `<th>${fmtCell(cell)}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            // Data rows (skip separator at index 1)
            for (let i = 2; i < rows.length; i++) {
                const cells = rows[i].split('|').filter(Boolean);
                if (cells.length === 0) continue;
                tableHtml += '<tr>';
                cells.forEach(cell => { tableHtml += `<td>${fmtCell(cell)}</td>`; });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            const placeholder = `%%TABLE${tableBlocks.length}%%`;
            tableBlocks.push(tableHtml);
            return '\n' + placeholder + '\n';
        });

        let html = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        // Replace emoji icons with SVG equivalents
        html = html.replace(/💡/g, '<span class="swml-inline-icon">' + SVG_ICON_BULB + '</span>');
        html = html.replace(/🎲/g, '<span class="swml-inline-icon">' + SVG_ICON_GENERATE + '</span>');
        html = html.replace(/📋/g, '<span class="swml-inline-icon">' + SVG_ICON_HAND_SELECT + '</span>');
        html = html.replace(/✏️/g, '<span class="swml-inline-icon">' + SVG_ICON_PASTE + '</span>');
        html = html.replace(/✅/g, '<span class="swml-inline-icon swml-icon-save">' + SVG_ICON_SAVE + '</span>');

        // Restore table blocks
        tableBlocks.forEach((tbl, i) => {
            html = html.replace(`%%TABLE${i}%%`, tbl);
        });

        // Render --- horizontal rules — only standalone dashes, not inside table remnants
        html = html.replace(/(?:<br>)+\s*---\s*(?:<br>)+/g, '<hr class="swml-hr">');
        // Leading --- at start of message
        html = html.replace(/^---\s*(?:<br>)+/, '<hr class="swml-hr">');

        // Render markdown-style bullet lists: lines starting with "- " after <br>
        html = html.replace(/(?:<br>)- (.+?)(?=<br>|$)/g, '<br><span class="swml-bullet">•</span> $1');

        // Strip markdown blockquote prefix "> " (e.g. "> **[30 marks]**" → "**[30 marks]**")
        html = html.replace(/<br>>\s+/g, '<br>');
        html = html.replace(/^>\s+/, '');

        // Render markdown heading prefixes: ## → h4, ### → h5 styled sub-headings
        html = html.replace(/(?:<br>)###\s+(.+?)(?=<br>|$)/g, '<br><strong class="swml-chat-h5">$1</strong>');
        html = html.replace(/^###\s+(.+?)(?=<br>|$)/g, '<strong class="swml-chat-h5">$1</strong>');
        html = html.replace(/(?:<br>)##\s+(.+?)(?=<br>|$)/g, '<br><strong class="swml-chat-h4">$1</strong>');
        html = html.replace(/^##\s+(.+?)(?=<br>|$)/g, '<strong class="swml-chat-h4">$1</strong>');

        // Remove raw [Progress bar: ...] text — step blocks below handle the visual
        html = html.replace(/\[Progress bar:\s*[█▓░■□\s]*\s*\d+%\]/gi, '');

        // Render "Step X of Y" within AI messages as visual step blocks
        html = html.replace(/(?:Step|Part [A-Z]\.\d+[A-Z]?:\s*\w[\w\s&]*?>\s*Step)\s+(\d+)\s+of\s+(\d+)/gi, (match, current, total) => {
            const c = parseInt(current), t = parseInt(total);
            let blocks = '';
            for (let i = 1; i <= t; i++) {
                if (i < c) blocks += `<span class="swml-step-block filled"></span>`;
                else if (i === c) blocks += `<span class="swml-step-block filled current"></span>`;
                else blocks += `<span class="swml-step-block"></span>`;
            }
            return `<span class="swml-step-blocks">${blocks}<span class="swml-step-blocks-label">Step ${c} of ${t}</span></span>`;
        });

        // Clean up protocol navigation line: "📌 Planning > Part B.1: ..." → styled header
        html = html.replace(/📌\s*(Planning|Assessment|Polishing)\s*&gt;\s*(.+?)(?:<br>)/gi, (match, task, detail) => {
            return `<div class="swml-step-header"><span class="swml-step-task">${task}</span> <span class="swml-step-detail">${detail}</span></div>`;
        });

        // Enhance "Planning > ..." breadcrumbs with section name
        html = html.replace(/(?:📌\s*)?Planning\s*&gt;\s*(Part\s*)?([A-Z])\.?(\d+)?([A-Z])?(?::?\s*([^<]+?))?(?:\s*&gt;\s*)?/gi, (match, part, section, num, sub, detail) => {
            const sectionMap = { B: { '1': 'Setup', '2': 'Goal Setting', '2A': 'Keyword Analysis', '3': 'Diagnostic', '4': 'Anchor Quotes', '5': 'Body Paragraphs', '6': 'Thesis', '7': 'Introduction', '8': 'Conclusion', '9': 'Review', '10': 'Wrap-up' } };
            const key = num ? (sub ? num + sub : num) : '';
            const sectionName = sectionMap[section?.toUpperCase()]?.[key] || detail?.trim() || '';
            const label = sectionName ? `Planning · ${sectionName}` : 'Planning';
            return `<span class="swml-step-task">${label}</span> `;
        });

        return html;
    }

    function renderLogo() {
        const logo = el('div', { className: 'swml-logo' });
        const img = el('img', {
            className: 'swml-logo-img',
            src: 'https://sophicly.b-cdn.net/Images/Writing%20Mastery%20Lab%20Phoenix%20Logo.svg',
            alt: 'Writing Mastery Lab',
        });
        logo.appendChild(img);
        return logo;
    }

    function renderBadges(items) {
        const b = el('div', { className: 'swml-badges' });
        items.filter(Boolean).forEach(i => b.appendChild(el('span', { className: 'swml-badge', textContent: i })));
        return b;
    }

    // ── Module Exports ──
    // All core functions/constants available to consuming modules via window.WML
    return {
        // Config & API
        config, API, headers,
        // State (shared object reference — mutations visible across modules)
        state,
        // Data maps
        TEXT_CATALOGUE, POETRY_ANTHOLOGY_BY_BOARD, PROSE_ANTHOLOGY_BY_BOARD,
        NONFICTION_ANTHOLOGY_BY_BOARD, AUTHOR_MAP, SECTION_COLOURS, getTextLabel,
        // Step arrays
        PLAN_STEPS, ASSESSMENT_STEPS, POLISHING_STEPS, QUOTE_ANALYSIS_STEPS,
        CONCEPTUAL_NOTES_STEPS, POETRY_CN_STEPS, NONFICTION_CN_STEPS,
        ESSAY_PLAN_STEPS, MODEL_ANSWER_STEPS, ESSAY_PLAN_RECALL_STEPS,
        MODEL_ANSWER_ADVANCED_STEPS, EXAM_QUESTION_STEPS, MEMORY_PRACTICE_STEPS,
        // Element arrays
        ASSESSMENT_ELEMENTS, POLISHING_ELEMENTS, EXAM_QUESTION_ELEMENTS,
        CONCEPTUAL_NOTES_ELEMENTS, POETRY_CN_ELEMENTS, NONFICTION_CN_ELEMENTS,
        QUOTE_ANALYSIS_ELEMENTS, MODEL_ANSWER_ELEMENTS, PLAN_ELEMENTS,
        // Helpers
        isPoetrySubject, isLanguageSubject, isNonfictionSubject, isAnthologySubject,
        getSteps, getElements,
        // Revision map
        REVISION_MAP,
        // Utilities
        $, $$, ucfirst, el, apiPost, apiGet,
        // UI modals & toasts
        showConfirm, showToast, maybeTriggerToast,
        // UI components
        build3DButton, createTypingBubble, removeTypingBubble,
        buildStepper, getPhaseSubSteps,
        // Theme
        getSystemTheme, getTheme, applyTheme, toggleTheme,
        createThemeToggleBtn, JHEY_TOGGLE_HTML,
        // Icons — input area
        SENDER_HTML, SVG_MIC, SVG_MIC_STOP, SVG_SEND, SVG_ATTACH,
        SVG_COPY, SVG_COPY_ASSESS,
        // Icons — selection toolbar
        SVG_SEL_REPLY, SVG_SEL_INSERT, SVG_SEL_COPY, SVG_SEL_NOTE,
        // Icons — question/utility
        SVG_ICON_GENERATE, SVG_ICON_HAND_SELECT, SVG_ICON_PASTE,
        SVG_ICON_BULB, SVG_ICON_SAVE, SVG_ICON_EDIT, SVG_ICON_FORWARD, SVG_ICON_HELP,
        getQuickActionIcon,
        // Icons — panels & features
        SVG_NOTES_PANEL, SVG_SOCRATIC, SVG_SAVE, SVG_TIMER, SVG_BRAIN,
        SVG_KEYBOARD, SVG_AI_GENERATE, SVG_LIST_DETAILS, SVG_QA_FILL, SVG_NOTES,
        SVG_MIC_ICON, SVG_SPARKLES,
        // Icons — phase stepper
        SVG_PHASE_WRITE, SVG_PHASE_REDRAFT, SVG_PHASE_LOCK,
        SVG_PHASE_TIMER, SVG_PHASE_CUSTOM, SVG_PHASE_ZEN,
        SVG_DISCUSS, SVG_MARK_SCHEME, SVG_MODEL_ANSWER, SVG_PLAN, SVG_ASSESS, SVG_OUTLINE_STEP, SVG_POLISH,
        // Icons — navigation
        SVG_VIDEO, SVG_LIBRARY, SVG_FOLDER, SVG_DASHBOARD, SVG_BACK, SVG_RESTART,
        SVG_WRITING, SVG_REDRAFT,
        // Icons — guide/onboarding
        SVG_GUIDE_LOCK, SVG_GUIDE_TARGET, SVG_GUIDE_STOPWATCH,
        SVG_GUIDE_ARM, SVG_GUIDE_WRITING, SVG_GUIDE_GRAPH, SVG_GUIDE_BRAIN,
        // Text processing
        stripAIInternals, detectAssessmentStep, formatAI,
        // Rendering
        renderLogo, renderBadges,
    };
})();
