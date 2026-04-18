/**
 * Writing Mastery Lab — Frontend App v1.3
 *
 * Depends on wml-core.js (window.WML namespace).
 *
 * Flow:
 *   Guided + task:    text select → workspace (task from URL)
 *   Guided + no task: text select → task select → workspace
 *   Exam prep:        board → subject → text → task → workspace
 */

(function() {
    'use strict';

    const WML = window.WML;

    // ── Destructure core exports as local variables ──
    const { config, API, headers, state } = WML;
    const { TEXT_CATALOGUE, POETRY_ANTHOLOGY_BY_BOARD, PROSE_ANTHOLOGY_BY_BOARD,
            NONFICTION_ANTHOLOGY_BY_BOARD, AUTHOR_MAP, SECTION_COLOURS, getTextLabel } = WML;
    const { PLAN_STEPS, ASSESSMENT_STEPS, POLISHING_STEPS, QUOTE_ANALYSIS_STEPS,
            CONCEPTUAL_NOTES_STEPS, POETRY_CN_STEPS, NONFICTION_CN_STEPS,
            ESSAY_PLAN_STEPS, MODEL_ANSWER_STEPS, ESSAY_PLAN_RECALL_STEPS,
            MODEL_ANSWER_ADVANCED_STEPS, EXAM_QUESTION_STEPS, MEMORY_PRACTICE_STEPS } = WML;
    const { ASSESSMENT_ELEMENTS, POLISHING_ELEMENTS, EXAM_QUESTION_ELEMENTS,
            CONCEPTUAL_NOTES_ELEMENTS, POETRY_CN_ELEMENTS, NONFICTION_CN_ELEMENTS,
            QUOTE_ANALYSIS_ELEMENTS, MODEL_ANSWER_ELEMENTS, PLAN_ELEMENTS } = WML;
    const { isPoetrySubject, isLanguageSubject, isNonfictionSubject, isAnthologySubject,
            getSteps, getElements, REVISION_MAP } = WML;
    const { $, $$, ucfirst, el, apiPost, apiGet } = WML;
    const { showConfirm, showToast, maybeTriggerToast } = WML;
    const { build3DButton, createTypingBubble, removeTypingBubble, buildStepper, getPhaseSubSteps } = WML;
    const { getSystemTheme, getTheme, applyTheme, toggleTheme, createThemeToggleBtn, JHEY_TOGGLE_HTML } = WML;
    const { SENDER_HTML, SVG_MIC, SVG_MIC_STOP, SVG_SEND, SVG_ATTACH,
            SVG_COPY, SVG_COPY_ASSESS,
            SVG_SEL_REPLY, SVG_SEL_INSERT, SVG_SEL_COPY, SVG_SEL_NOTE,
            SVG_ICON_GENERATE, SVG_ICON_HAND_SELECT, SVG_ICON_PASTE,
            SVG_ICON_BULB, SVG_ICON_SAVE, SVG_ICON_EDIT, SVG_ICON_FORWARD, SVG_ICON_HELP,
            getQuickActionIcon,
            SVG_NOTES_PANEL, SVG_SOCRATIC, SVG_SAVE, SVG_TIMER, SVG_BRAIN,
            SVG_KEYBOARD, SVG_AI_GENERATE, SVG_LIST_DETAILS, SVG_QA_FILL, SVG_NOTES,
            SVG_MIC_ICON, SVG_SPARKLES,
            SVG_PHASE_WRITE, SVG_PHASE_REDRAFT, SVG_PHASE_LOCK,
            SVG_PHASE_TIMER, SVG_PHASE_CUSTOM, SVG_PHASE_ZEN,
            SVG_PLAN, SVG_ASSESS, SVG_OUTLINE_STEP, SVG_POLISH,
            SVG_VIDEO, SVG_LIBRARY, SVG_FOLDER, SVG_DASHBOARD, SVG_BACK, SVG_RESTART,
            SVG_WRITING, SVG_REDRAFT,
            SVG_GUIDE_LOCK, SVG_GUIDE_TARGET, SVG_GUIDE_STOPWATCH,
            SVG_GUIDE_ARM, SVG_GUIDE_WRITING, SVG_GUIDE_GRAPH, SVG_GUIDE_BRAIN } = WML;
    const { stripAIInternals, detectAssessmentStep, formatAI } = WML;
    const { renderLogo, renderBadges } = WML;

    // ══════════════════════════════════════════
    //  ENTRY FLOW
    // ══════════════════════════════════════════

    // ── Embedded Mode Detection (v7.13.11) ──
    // When WML is embedded inside a LearnDash lesson via [writing_mastery_lab] shortcode,
    // swmlEmbedConfig is set by PHP. WML strips its own chrome and reads exercise config from it.
    const embedConfig = window.swmlEmbedConfig || null;
    const isEmbedded = !!embedConfig;

    if (isEmbedded) {
        // v7.13.78: Add body class for LearnDash CSS overrides (.spl-content full-width)
        document.body.classList.add('swml-embedded-active');
        // Override state from embed config — skip setup wizard
        if (embedConfig.board)   state.board   = embedConfig.board;
        if (embedConfig.subject) state.subject = embedConfig.subject;
        if (embedConfig.text)    state.text    = embedConfig.text;
        if (embedConfig.task)    state.task    = embedConfig.task;
        if (embedConfig.topic)   state.topicNumber = embedConfig.topic;
        if (embedConfig.phase) {
            state.phase = embedConfig.phase;
            state.isRedraft = embedConfig.phase === 'redraft';
        }
        // v7.14.52: Infer mode — mastery has phase+topic, preliminary has phase+topic but sequential,
        // free_practice/exam_practice are non-sequential
        const guidedPhases = ['initial', 'redraft', 'preliminary'];
        state.mode = (embedConfig.phase && embedConfig.topic && guidedPhases.includes(embedConfig.phase)) ? 'guided' : 'exam_prep';
        // v7.14.17: 'diagnostic' and 'development' are draftTypes, not exercise tasks.
        // They arrive from shortcodes like [writing_mastery_lab task="diagnostic"].
        // Clear them so the topicNumber-based draftType inference handles routing correctly.
        if (state.task === 'diagnostic' || state.task === 'development') {
            state.task = '';
        }
        // Resolve textName from catalogue
        if (state.text && !state.textName) {
            state.textName = getTextLabel(state.text, state.subject);
        }
        // v7.13.34: CW embedded mode — set creative writing state + auto-load project
        if (state.task && state.task.startsWith('cw_')) {
            state.board = 'universal';
            state.subject = 'creative_writing';
            state.text = 'creative_writing';
            state.textName = 'Creative Writing';
            state.mode = 'creative';
            const cwStepDef = WML.getCwStepDef(state.task);
            state.cwStep = cwStepDef?.step || null;
            state.cwTrial = cwStepDef?.trial || null;
            // Project ID loaded async after boot (renderCanvasWorkspace will handle it)
        }
    }

    let shaderInitialized = false;
    let isFirstPageLoad = true;

    /**
     * Split text into individually animated characters.
     * Preserves word boundaries for natural wrapping.
     */
    function splitTextAnimate(element, baseDelay = 0.15) {
        const text = element.textContent;
        element.textContent = '';
        element.style.perspective = '600px';
        let charIndex = 0;
        const words = text.split(' ');
        words.forEach((word, wi) => {
            const wordSpan = el('span', { className: 'swml-split-word' });
            for (const char of word) {
                const charSpan = el('span', {
                    className: 'swml-split-char',
                    textContent: char,
                    style: { animationDelay: `${baseDelay + charIndex * 0.025}s` }
                });
                wordSpan.appendChild(charSpan);
                charIndex++;
            }
            element.appendChild(wordSpan);
            if (wi < words.length - 1) {
                element.appendChild(el('span', { className: 'swml-split-word', textContent: ' ' }));
                charIndex++;
            }
        });
    }

    /**
     * Transition to a new setup screen with slide animation.
     * The shader canvas persists behind all setup screens.
     * @param {Function} buildContent - receives swml-setup-inner div to populate
     * @param {string} direction - 'forward' (slide left) or 'back' (slide right)
     */
    let _navGuard = false; // Prevents double-render from rapid clicks (v7.12.61)
    function transitionSetup(buildContent, direction = 'forward') {
        if (_navGuard) return;
        _navGuard = true;
        setTimeout(() => { _navGuard = false; }, 300);

        const root = $('#swml-root');
        const isEntrance = isFirstPageLoad;

        // Init shader container on first call
        if (!shaderInitialized) {
            root.innerHTML = '';
            if (isEntrance) root.classList.add('swml-entrance-active');
            const shaderBg = el('div', { className: 'swml-shader-bg', id: 'swml-shader-bg' });
            root.appendChild(shaderBg);
            let shaderOk = false;
            if (window.swmlShader) {
                try { shaderOk = window.swmlShader.init(shaderBg); } catch(e) { console.warn('Shader init failed:', e); }
            }
            if (!shaderOk) {
                shaderBg.style.background = 'linear-gradient(135deg, #5333ed, #2c003e)';
            }
            shaderInitialized = true;

            // Remove anti-FOUC style injected by PHP (dark background + hidden content)
            const antiFouc = document.getElementById('swml-anti-fouc');
            if (antiFouc) antiFouc.remove();
        }

        // Crossfade: old content fades out, new content fades in
        const oldSetup = root.querySelector('.swml-setup');
        if (oldSetup) {
            oldSetup.classList.add('swml-fade-out');
            setTimeout(() => oldSetup.remove(), 250);
        }

        // Build new content
        const setup = el('div', { className: isEntrance ? 'swml-setup' : 'swml-setup swml-fade-in' });
        const inner = el('div', { className: 'swml-setup-inner' });
        buildContent(inner);
        syncUrl(); // Update URL bar to reflect current navigation state

        // Persistent Past Work button on all setup screens
        if (!inner.querySelector('.swml-setup-resume-btn')) {
            inner.appendChild(el('button', {
                className: 'swml-setup-resume-btn small',
                textContent: '📂 Past Work',
                onClick: () => showPortfolio()
            }));
        }

        // ── Cinematic entrance on first load ──
        if (isEntrance) {
            isFirstPageLoad = false;
            const children = Array.from(inner.children);
            let delay = 0.1;
            children.forEach((child, i) => {
                if (child.tagName === 'H2') {
                    // Clip-path reveal for gradient headings — preserves background-clip: text
                    child.classList.add('swml-entrance-heading');
                    child.style.animationDelay = `${delay}s`;
                    delay += 0.5; // Heading takes 0.7s, give it breathing room
                } else {
                    // Staggered fade-in-up for all other elements
                    child.classList.add('swml-entrance-item');
                    child.style.animationDelay = `${delay}s`;
                    delay += 0.1;
                }
            });
            // Remove entrance class from root after all animations complete
            setTimeout(() => root.classList.remove('swml-entrance-active'), 2500);
        }

        setup.appendChild(inner);
        root.appendChild(setup);
        if (!isEntrance) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setup.classList.remove('swml-fade-in'));
            });
        }
    }

    /** Destroy shader when leaving setup (entering workspace) */
    function destroyShader() {
        if (window.swmlShader) window.swmlShader.destroy();
        shaderInitialized = false;
    }

    // ── Tier Access Levels ──
    const userTier = config.userTier || 'free';
    const hasWMLAccess = ['silver', 'gold', 'platinum'].includes(userTier);
    const hasProgrammeAccess = ['gold', 'platinum'].includes(userTier);

    // ── URL Sync (v7.12.62) ──
    // Updates the browser URL bar to reflect current exercise state.
    // Enables copy/paste sharing, browser back, and dashboard deep links.
    const basePath = window.location.pathname;
    function syncUrl() {
        if (isEmbedded) return; // Don't modify URL in embedded mode (v7.13.11)
        const p = {};
        if (state.board) p.board = state.board;
        if (state.subject) p.subject = state.subject;
        if (state.text) p.text = state.text;
        if (state.topicNumber) p.topic = state.topicNumber;
        if (state.task) p.task = state.task;
        // Include draftType for diagnostic/development canvas (when task is empty but canvas is active)
        if (state.draftType && !state.task) p.draft = state.draftType;
        if (state.phase === 'redraft' || state.isRedraft) p.redraft = '1';
        if (state.mode) p.mode = state.mode; // v7.14.1: include all modes (was skipping exam_prep)
        if (state.planningMode) p.planning_mode = state.planningMode;
        if (state.poem) p.poem = state.poem;
        if (state.unitId) p.unit_id = state.unitId;
        if (state.exerciseId) p.eid = state.exerciseId; // v7.14.3: exercise unique ID
        const qs = Object.entries(p).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        const newUrl = qs ? `${basePath}?${qs}` : basePath;
        if (newUrl !== window.location.pathname + window.location.search) {
            history.replaceState(null, '', newUrl);
        }
    }

    function resetState() {
        state.board = ''; state.subject = ''; state.text = ''; state.textName = '';
        state.task = ''; state.mode = ''; state.question = ''; state.marks = '';
        state.aos = ''; state.planningMode = ''; state.modelSection = '';
        state.advancedLevel = 0; state.essayTiming = '';
        removeTimer();
        state.topicNumber = 0; state.topicLabel = ''; state.draftType = null; state.phase = null;
        state.canvasTimer = 0; state.canvasTimerLabel = '';
        state.poem = ''; state.poemTitle = ''; state.poemAuthor = ''; state.poemText = '';
        state.questionPart = ''; state.comparisonPoem = ''; state.comparisonPoemTitle = ''; state.comparisonPoemText = '';
        state.exerciseId = ''; // v7.14.3: clear exercise ID on reset
        syncUrl(); // Clear URL params on reset
    }

    function renderSetup() {
        // Tier gate: Free and Guest cannot use WML at all
        if (!hasWMLAccess) {
            renderUpgradePrompt();
            return;
        }

        // ── Tutor review mode: skip all setup, go straight to canvas (v7.15.3) ──
        if (state.reviewMode && state.board && state.text) {
            state.mode = 'exam_prep';
            state.task = state.task || 'assessment';
            state.topicNumber = state.topicNumber || 0;
            state.topicLabel = state.topicNumber ? `Topic ${state.topicNumber}` : '';
            if (!state.textName) state.textName = getTextLabel(state.text, state.subject) || state.text;
            if (!state.draftType) {
                if (state.topicNumber === 1) state.draftType = 'diagnostic';
                else if (state.topicNumber >= 3) state.draftType = 'development';
            }
            state.canvasTimer = 0;
            state.step = 0;
            console.log('WML Review: Auto-entering canvas for', state.board, state.text, state.task);
            WML.renderCanvasWorkspace();
            return;
        }

        // ── Embedded mode: skip setup, go straight to exercise (v7.13.12) ──
        // PHP outputs #swml-root inside #swml-embedded-root — JS boot finds it normally.
        // v7.14.16: Fallback for missing embed config — show error instead of blank page
        if (isEmbedded && !state.board && !state.text && !(state.task && state.task.startsWith('cw_'))) {
            const root = $('#swml-root');
            root.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.5);font-family:var(--swml-font-body,sans-serif)">' +
                '<p style="font-size:15px;margin-bottom:8px">Exercise not configured</p>' +
                '<p style="font-size:12px">This lesson is missing its board, subject, or text configuration. Please contact your tutor.</p></div>';
            return;
        }
        if (isEmbedded && state.board && state.text) {
            // Infer draftType and topic label for embedded context
            if (state.topicNumber > 0 && !state.draftType) {
                if (state.topicNumber === 2 && state.subject !== 'unseen_poetry') {
                    state.draftType = 'notes';
                } else if (state.topicNumber === 1) {
                    state.draftType = state.isRedraft ? 'diagnostic_redraft' : 'diagnostic';
                } else {
                    state.draftType = state.isRedraft ? 'development_redraft' : 'development';
                }
            }
            state.topicLabel = state.topicNumber ? `Topic ${state.topicNumber}` : '';

            // Route to the right exercise based on manifest config
            const exerciseConfig = WML.getExerciseConfig(state.task);

            if (state.task === 'feedback_discussion' || state.task === 'model_answer_video') {
                // Lightweight canvas: feedback discussion + model answer video (v7.13.16)
                WML.renderFeedbackDiscussionCanvas();
            } else if (['training', 'free', 'flexible'].includes(exerciseConfig.environment)) {
                // v7.14.36: All canvas environments — training (protocol), free (independent), flexible (inline-AI)
                state.canvasTimer = 0;
                state.step = 0;
                // v7.14.43: Create session BEFORE rendering canvas so Protocol Router has correct task context.
                // Without this, training-env exercises (mark_scheme, planning, polishing) in embedded mode
                // never create a session, so the Protocol Router falls back to generic instructions.
                // Session MUST exist before the first chat message (silent auto-send fires after 400ms).
                if (exerciseConfig.environment === 'training') {
                    state.sessionId = '';
                    state.chatId = '';
                    apiPost(API.session, {
                        mode: state.mode || 'exam_prep', board: state.board, subject: state.subject,
                        text: state.text, unit_id: state.unitId, task: state.task,
                        type: state.courseType, redraft: state.isRedraft ? '1' : '',
                        question: state.question, marks: state.marks, aos: state.aos,
                        topic_number: state.topicNumber || 0, topic_label: state.topicLabel || '',
                        draft_type: state.draftType || '', phase: state.phase || '',
                        poem: state.poem || '', poem_title: state.poemTitle || '',
                    }).then(res => {
                        if (res.session_id) { state.sessionId = res.session_id; state.chatId = res.session_id; }
                        console.log('WML Embedded: Session created for training env, task=' + state.task);
                        WML.renderCanvasWorkspace();
                    }).catch(e => {
                        console.warn('WML Embedded: Session creation failed, rendering anyway:', e);
                        WML.renderCanvasWorkspace();
                    });
                } else {
                    WML.renderCanvasWorkspace();
                }
            } else if (state.task === 'conceptual_notes') {
                state.draftType = 'notes';
                state.phase = null;
                selectTask('conceptual_notes');
            } else if (state.task) {
                // Chat-based exercises: planning, polishing, etc.
                selectTask(state.task);
            } else {
                // No task — show diagnostic canvas (write-only)
                state.task = '';
                state.canvasTimer = 0;
                WML.renderCanvasWorkspace();
            }
            return;
        }

        // Infer topic metadata from URL params if not already set
        if (state.topicNumber > 0 && !state.draftType) {
            if (state.topicNumber === 2 && state.subject !== 'unseen_poetry') {
                state.draftType = 'notes';
            } else if (state.topicNumber === 1) {
                state.draftType = state.isRedraft ? 'diagnostic_redraft' : 'diagnostic';
            } else {
                state.draftType = state.isRedraft ? 'development_redraft' : 'development';
            }
            state.phase = state.isRedraft ? 'redraft' : 'initial';
        }

        // Resolve textName from catalogue when coming from URL params
        if (state.text && !state.textName) {
            state.textName = getTextLabel(state.text, state.subject);
        }

        // ── Deep link: Mastery Programme (v7.12.62) ──
        // URL: ?board=aqa&subject=shakespeare&text=macbeth&topic=1&task=assessment
        if (state.topicNumber > 0 && state.board && state.subject && state.text) {
            state.mode = 'exam_prep';
            state.topicLabel = `Topic ${state.topicNumber}`;
            const baseType = state.topicNumber === 1 ? 'diagnostic'
                : (state.topicNumber === 2 && state.subject !== 'unseen_poetry') ? 'notes'
                : 'development';

            // Deep link: direct canvas entry via &draft=diagnostic or &task=assessment
            const urlDraft = config.urlParams?.draft || '';
            if (urlDraft === 'diagnostic' || urlDraft === 'development') {
                state.draftType = urlDraft;
                state.phase = 'initial';
                state.task = '';
                state.canvasTimer = 0;
                WML.renderCanvasWorkspace();
                return;
            }
            if (state.task === 'assessment' || state.task === 'feedback_discussion') {
                state.canvasTimer = 0;
                state.step = 0;
                WML.renderCanvasWorkspace();
                return;
            }
            if (state.task === 'conceptual_notes' || baseType === 'notes') {
                state.draftType = 'notes';
                state.phase = null;
                selectTask('conceptual_notes');
                return;
            }
            if (state.task) {
                selectTask(state.task);
                return;
            }
            // No task specified — show phase stepper for this topic
            pickTopic(state.topicNumber, baseType);
            return;
        }

        // ── Deep link: Creative Writing (v7.13.55) ──
        // URL: ?task=cw_step_2 (board/subject may or may not be present)
        if (state.task && state.task.startsWith('cw_')) {
            state.mode = state.mode || 'creative';
            state.subject = state.subject || 'creative_writing';
            state.board = state.board || 'universal';
            state.text = state.text || 'creative_writing';
            state.textName = state.textName || 'Creative Writing';
            // Load project context — use most recent project (or go to naming screen)
            WML.cwProject.list().then(res => {
                const projects = res?.projects || [];
                if (projects.length === 0) {
                    // No projects — show naming screen
                    renderCwProjectNaming([], (newProject) => {
                        state.cwProjectId = newProject.id;
                        state.canvasTimer = 0;
                        state.step = 0;
                        WML.renderCanvasWorkspace();
                    });
                    return;
                }
                // Use most recently updated project
                projects.sort((a, b) => new Date(b.updated) - new Date(a.updated));
                state.cwProjectId = projects[0].id;
                state.cwProjectName = projects[0].name || '';
                const exerciseConfig = WML.getExerciseConfig(state.task);
                if (['training', 'free', 'flexible'].includes(exerciseConfig.environment)) {
                    state.canvasTimer = 0;
                    state.step = 0;
                    WML.renderCanvasWorkspace();
                } else {
                    selectTask(state.task);
                }
            });
            return;
        }

        if (state.mode === 'guided' && state.board && state.subject) {
            if (state.text && state.task) {
                selectTask(state.task);
                return;
            }
            if (state.text) {
                renderTaskSelect();
                return;
            }
            renderTextSelect();
            return;
        }
        // v7.14.1: Free practice deep link — if board/text/task are in URL, go straight to exercise
        if (state.mode === 'exam_prep' && state.board && state.text && state.task) {
            if (!state.subject) {
                // Infer subject from text catalogue
                for (const [subj, cat] of Object.entries(WML.TEXT_CATALOGUE)) {
                    if (cat.texts?.some(t => t.id === state.text) || cat.skipTextSelect) {
                        state.subject = subj;
                        break;
                    }
                }
            }
            selectTask(state.task);
            return;
        }
        renderExamPrepWizard();
    }

    function renderUpgradePrompt() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'Writing Mastery Lab' }));

            const card = el('div', { className: 'swml-upgrade-card' });
            card.appendChild(el('div', { className: 'swml-upgrade-icon', textContent: '🔒' }));
            card.appendChild(el('h3', { textContent: 'Upgrade to unlock the Writing Mastery Lab', style: { margin: '12px 0 8px', fontSize: '18px' } }));
            card.appendChild(el('p', { textContent: 'Get access to AI-powered essay planning, assessment, polishing, model answers, and exam preparation across all exam boards.', style: { fontSize: '13px', opacity: '0.7', lineHeight: '1.5', margin: '0 0 16px' } }));

            const features = [
                { tier: 'Silver', price: '£20/month', desc: 'AI writing tools — practise freely on any text' },
                { tier: 'Gold', price: '£140/month', desc: 'Full mastery programme with structured topics & progress tracking', recommended: true },
            ];
            features.forEach(f => {
                const row = el('div', { className: `swml-upgrade-tier${f.recommended ? ' recommended' : ''}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', margin: '6px 0', borderRadius: '10px', background: f.recommended ? 'rgba(81,218,207,0.1)' : 'rgba(255,255,255,0.03)', border: f.recommended ? '1px solid rgba(81,218,207,0.3)' : '1px solid rgba(255,255,255,0.08)' } });
                row.appendChild(el('div', {}, [
                    el('div', { textContent: `${f.tier} — ${f.price}`, style: { fontWeight: '700', fontSize: '14px' } }),
                    el('div', { textContent: f.desc, style: { fontSize: '11px', opacity: '0.6', marginTop: '2px' } }),
                ]));
                if (f.recommended) row.appendChild(el('span', { textContent: '⭐ Recommended', style: { fontSize: '10px', color: 'var(--swml-teal)', fontWeight: '700' } }));
                card.appendChild(row);
            });

            card.appendChild(el('a', { href: '/pricing', className: 'swml-programme-btn', textContent: 'View Plans & Upgrade', style: { display: 'block', textAlign: 'center', marginTop: '16px', textDecoration: 'none' } }));
            inner.appendChild(card);
        });
    }

    // ── Text Selection ──
    function renderTextSelect() {
        // Clear downstream state — if user is back at text/cluster selection,
        // any previous individual poem/text pick is stale
        state.poem = ''; state.poemTitle = ''; state.poemAuthor = ''; state.poemText = '';
        state.questionPart = ''; state.comparisonPoem = ''; state.comparisonPoemTitle = ''; state.comparisonPoemText = '';

        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: state.mode === 'guided' ? '📚 Mastery Programme' : state.mode === 'exam_prep' ? '🎯 Free Practice' : 'Selected' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject)]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change subject', onClick: () => renderSubjectSelect('back') }));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            const subjectData = TEXT_CATALOGUE[state.subject];
            inner.appendChild(el('h2', { textContent: 'Which text are you studying?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: `Select your ${subjectData?.label || ucfirst(state.subject)} text` }));

            const grid = el('div', { className: 'swml-text-grid' });
            // For poetry/prose anthology, use board-specific text list
            let texts;
            if (state.subject === 'poetry_anthology' && POETRY_ANTHOLOGY_BY_BOARD[state.board]) {
                texts = POETRY_ANTHOLOGY_BY_BOARD[state.board];
            } else if (state.subject === 'prose_anthology' && PROSE_ANTHOLOGY_BY_BOARD[state.board]) {
                texts = PROSE_ANTHOLOGY_BY_BOARD[state.board];
            } else if (state.subject === 'nonfiction_anthology' && NONFICTION_ANTHOLOGY_BY_BOARD[state.board]) {
                texts = NONFICTION_ANTHOLOGY_BY_BOARD[state.board];
            } else {
                texts = subjectData?.texts || [];
            }

            // v7.14.13: Per-board text filtering — hide texts not on this board's syllabus
            const boardFilter = WML.BOARD_TEXT_FILTER?.[state.subject]?.[state.board];
            if (boardFilter) {
                texts = texts.filter(t => boardFilter.includes(t.id));
            }

            if (texts.length === 0) {
                const input = el('input', { className: 'swml-text-input', placeholder: 'e.g. Macbeth, An Inspector Calls...',
                    style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
                grid.appendChild(input);
                grid.appendChild(el('button', { className: 'swml-task-btn', style: { marginTop: '12px', width: '100%' }, textContent: 'Continue →',
                    onClick: () => { if (input.value.trim()) { state.text = input.value.trim().toLowerCase().replace(/\s+/g, '_'); afterTextSelected(); } } }));
            } else {
                texts.forEach(t => {
                    grid.appendChild(el('button', { className: 'swml-text-btn', onClick: () => { state.text = t.id; state.textName = t.label; afterTextSelected(); } }, [
                        el('span', { className: 'icon', textContent: t.icon }),
                        el('span', { className: 'label', textContent: t.label }),
                    ]));
                });
            }

            inner.appendChild(grid);
            inner.appendChild(el('button', { className: 'swml-setup-resume-btn small', textContent: '📂 Past Work', onClick: () => showPortfolio() }));
        });
    }

    function afterTextSelected() {
        // Anthology subjects need individual text selection before continuing
        // (NOT unseen poetry — poem pasted in session)
        const needsTextPicker = ['poetry_anthology', 'nonfiction_anthology', 'prose_anthology'].includes(state.subject) && !state.poem;
        if (needsTextPicker) {
            renderAnthologyTextSelect();
            return;
        }
        // If task was already set by the URL (guided mode from LearnDash), skip pickers
        if (state.task) {
            selectTask(state.task);
        } else if (state.mode === 'guided' && !state.topicNumber) {
            // Programme mode — need topic/phase before task grid
            renderTopicSelect();
        } else {
            renderTaskSelect();
        }
    }

    // ── Text Picker (all anthology subjects — poems, prose, non-fiction) ──
    function renderAnthologyTextSelect() {
        // Determine labels based on subject type
        const subjectLabels = {
            'poetry_anthology': { heading: 'Which poem?', hint: 'Select the poem you want to work on', badge: 'Poetry', fallback: 'No poems configured yet. Type your poem title below.', placeholder: 'e.g. Ozymandias, London, Tissue...' },
            'prose_anthology': { heading: 'Which text?', hint: 'Select the prose text you want to work on', badge: 'Prose', fallback: 'No texts configured yet. Type the text title below.', placeholder: 'e.g. The Necklace, Night...' },
            'nonfiction_anthology': { heading: 'Which text?', hint: 'Select the non-fiction text you want to work on', badge: 'Non-Fiction', fallback: 'No texts configured yet. Type the text title below.', placeholder: 'e.g. The Danger of a Single Story...' },
        };
        const labels = subjectLabels[state.subject] || subjectLabels['poetry_anthology'];

        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: state.mode === 'guided' ? '📚 Mastery Programme' : '🎯 Free Practice' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), labels.badge, state.textName || ucfirst(state.text)]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change anthology', onClick: () => renderTextSelect('back') }));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: labels.heading }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: labels.hint }));

            const grid = el('div', { className: 'swml-text-grid' });
            const loading = el('div', { className: 'swml-setup-hint', textContent: 'Loading texts...' });
            inner.appendChild(loading);
            inner.appendChild(grid);

            // Fetch texts from admin bank
            fetch(`${config.restUrl}poems?board=${state.board}&anthology=${state.text}`, { headers })
                .then(r => r.ok ? r.json() : null)
                .then(res => {
                    loading.remove();
                    const poems = res?.poems || [];

                    if (poems.length === 0) {
                        // No texts in bank — show free text input as fallback
                        grid.appendChild(el('p', { className: 'swml-setup-hint', textContent: labels.fallback }));
                        const input = el('input', { className: 'swml-text-input', placeholder: labels.placeholder,
                            style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
                        grid.appendChild(input);
                        grid.appendChild(el('button', { className: 'swml-task-btn', style: { marginTop: '12px', width: '100%' }, textContent: 'Continue →',
                            onClick: () => {
                                if (input.value.trim()) {
                                    state.poem = input.value.trim().toLowerCase().replace(/\s+/g, '_');
                                    state.poemTitle = input.value.trim();
                                    afterTextSelected();
                                }
                            }
                        }));
                        return;
                    }

                    poems.forEach(p => {
                        grid.appendChild(el('button', { className: 'swml-text-btn', onClick: () => {
                            state.poem = p.id;
                            state.poemTitle = p.title;
                            state.poemAuthor = p.poet || '';
                            state.poemText = p.poem_text || '';
                            afterTextSelected(); // Re-enter — now state.poem is set, so it continues
                        }}, [
                            el('span', { className: 'label', textContent: p.title }),
                            ...(p.poet ? [el('span', { className: 'swml-poem-poet', textContent: p.poet })] : []),
                        ]));
                    });
                })
                .catch(() => {
                    loading.textContent = 'Could not load texts. Type the title below.';
                    const input = el('input', { placeholder: labels.placeholder,
                        style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
                    grid.appendChild(input);
                    grid.appendChild(el('button', { className: 'swml-task-btn', style: { marginTop: '12px', width: '100%' }, textContent: 'Continue →',
                        onClick: () => {
                            if (input.value.trim()) {
                                state.poem = input.value.trim().toLowerCase().replace(/\s+/g, '_');
                                state.poemTitle = input.value.trim();
                                afterTextSelected();
                            }
                        }
                    }));
                });
        }, 'forward');
    }

    // ── Topic & Phase Selection (programme mode only) ──
    function renderTopicSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: '📚 Mastery Programme' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text)]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change text', onClick: () => renderTextSelect('back') }));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'What are you working on?' }));

            const grid = el('div', { className: 'swml-text-grid swml-topic-grid' });

            function topicCard(num, defaultLabel, type) {
                const btn = el('button', { className: 'swml-text-btn swml-topic-btn', onClick: () => pickTopic(num, type) }, [
                    el('span', { className: 'swml-topic-num-badge', textContent: String(num) }),
                    el('span', { className: 'label', id: `swml-topic-label-${num}`, textContent: `Topic ${num} — ${defaultLabel}` }),
                ]);
                // Hidden status tag — only shown when real data arrives
                const tag = el('span', {
                    className: 'swml-status-tag',
                    id: `swml-topic-status-${num}`,
                    style: { display: 'none' },
                });
                btn.appendChild(tag);
                return btn;
            }

            // Fixed topics 1 & 2
            grid.appendChild(topicCard(1, 'Diagnostic', 'diagnostic'));
            grid.appendChild(topicCard(2, 'Conceptual Notes', 'notes'));

            // Development essays — default 10, but check if admin has more
            const defaultMax = 10;
            for (let i = 3; i <= defaultMax; i++) {
                grid.appendChild(topicCard(i, 'Development Essay', 'development'));
            }

            inner.appendChild(grid);

            // Check admin for topics beyond 10 and add cards dynamically
            fetch(`${config.restUrl}topic-questions?board=${state.board}&text=${state.text}`, { headers })
                .then(r => r.ok ? r.json() : null)
                .then(res => {
                    if (!res || !res.topics) return;
                    const maxTopic = Math.max(...res.topics.map(t => t.topic_number || 0), defaultMax);
                    for (let i = defaultMax + 1; i <= maxTopic; i++) {
                        grid.appendChild(topicCard(i, 'Development Essay', 'development'));
                    }
                    // Update labels from admin topic data — show topic name
                    res.topics.forEach(t => {
                        if (t.label) {
                            const lbl = document.getElementById(`swml-topic-label-${t.topic_number}`);
                            if (lbl) lbl.textContent = `Topic ${t.topic_number} — ${t.label}`;
                        }
                    });
                }).catch(() => {});

            // Query topic statuses from TWO sources in parallel
            const topicProgressUrl = config.wpRestUrl + `sophicly/v1/student-progress?board=${state.board}&text=${state.text}`;
            const topicCanvasUrl = `${API.canvasList}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}`;

            Promise.allSettled([
                apiGet(topicProgressUrl).catch(() => null),
                apiGet(topicCanvasUrl).catch(() => null)
            ]).then(([progressResult, canvasResult]) => {
                const res = progressResult.value || {};
                const canvasRes = canvasResult.value || {};

                // Build canvas active docs map
                const activeDocs = {};
                if (canvasRes.success && canvasRes.documents) {
                    canvasRes.documents.forEach(d => {
                        if (d.topicNumber) activeDocs[d.topicNumber] = d;
                    });
                }

                // Build student-progress status map
                const spMap = {};
                if (res.topics && Array.isArray(res.topics)) {
                    res.topics.forEach(t => { spMap[t.number] = t; });
                }

                console.log('WML Topic Status:', { board: state.board, text: state.text, spTopics: res.topics?.length || 0, canvasDocs: Object.keys(activeDocs) });

                // Apply status to all topic tags
                document.querySelectorAll('[id^="swml-topic-status-"]').forEach(tag => {
                    const num = parseInt(tag.id.replace('swml-topic-status-', '') || '0');
                    if (!num) return;
                    const sp = spMap[num];
                    const hasCanvas = !!activeDocs[num];
                    const effectiveStatus = (sp?.status === 'complete') ? 'complete'
                        : (sp?.status === 'redraft_due') ? 'redraft_due'
                        : (sp?.status === 'in_progress') ? 'in_progress'
                        : hasCanvas ? 'in_progress'
                        : null;

                    tag.style.display = '';
                    tag.classList.remove('loading');
                    if (effectiveStatus === 'complete') {
                        const lift = (sp?.initial_grade && sp?.redraft_grade) ? ` · ${sp.initial_grade} → ${sp.redraft_grade}` : '';
                        tag.textContent = `✓ Complete${lift}`;
                        tag.className = 'swml-status-tag complete';
                    } else if (effectiveStatus === 'redraft_due') {
                        tag.textContent = `◐ Redraft due${sp?.initial_grade ? ' · ' + sp.initial_grade : ''}`;
                        tag.className = 'swml-status-tag in-progress';
                    } else if (effectiveStatus === 'in_progress') {
                        tag.textContent = '◐ In progress';
                        tag.className = 'swml-status-tag in-progress';
                    } else {
                        tag.textContent = '○ Not started';
                        tag.className = 'swml-status-tag not-started';
                    }
                });
            });

            // Exam Preparation — separate from topic work
            inner.appendChild(el('div', { className: 'swml-setup-separator', innerHTML: '<span>or</span>' }));
            inner.appendChild(el('button', { className: 'swml-path-card', style: { maxWidth: '520px', margin: '0 auto', width: '100%' }, onClick: () => {
                // Switch to exam prep mode (no topic context)
                state.mode = 'exam_prep';
                state.topicNumber = 0;
                state.topicLabel = '';
                state.draftType = null;
                state.phase = null;
                renderTaskSelect();
            }}, [
                el('span', { className: 'swml-path-icon', textContent: '🎯' }),
                el('span', { className: 'swml-path-title', textContent: 'Exam Preparation' }),
                el('span', { className: 'swml-path-desc', textContent: 'Practice exam questions, model answers, essay plans, and random quote analysis' }),
            ]));
        }, 'forward');
    }

    function pickTopic(topicNum, baseType) {
        state.topicNumber = topicNum;
        // Use admin label from the card if available
        const cardLabel = document.getElementById(`swml-topic-label-${topicNum}`);
        state.topicLabel = cardLabel ? cardLabel.textContent : `Topic ${topicNum}`;

        if (baseType === 'notes') {
            state.draftType = 'notes';
            state.phase = null;
            // Topic 2 — go straight to conceptual notes task
            selectTask('conceptual_notes');
            return;
        }

        // Essay topics need phase selection
        renderPhaseSelect(topicNum, baseType);
    }

    function renderPhaseSelect(topicNum, baseType) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: '📚 Mastery Programme' }));
            const badgeRow = renderBadges([state.board.toUpperCase(), state.textName || '', `Topic ${topicNum}`]);
            const backLinks = el('span', { className: 'swml-badge-back-links' }, [
                el('button', { className: 'swml-back-link', textContent: '← Topics', onClick: () => renderTopicSelect('back') }),
                el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } })
            ]);
            badgeRow.appendChild(backLinks);
            card.appendChild(badgeRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Your journey' }));

            // Stepper container — rebuilt when async status arrives
            const stepperWrap = el('div', { className: 'swml-stepper-wrap' });

            // Initial loading stepper (before status is known)
            stepperWrap.appendChild(buildStepper([
                { id: 'phase1', icon: SVG_WRITING, title: 'Phase 1 — Initial Attempt', desc: 'Write your essay independently, then get it assessed.', status: 'not_started' },
                { id: 'phase2', icon: SVG_PHASE_LOCK, title: 'Phase 2 — Redraft', desc: 'Complete Phase 1 first. Then plan, polish, and get reassessed.', status: 'locked' }
            ]));
            inner.appendChild(stepperWrap);

            // Query progress from THREE sources in parallel
            const phaseUrl = `${API.phaseStatus}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${topicNum}`;
            const progressUrl = config.wpRestUrl + `sophicly/v1/student-progress?board=${state.board}&text=${state.text}&topic=${topicNum}`;
            const canvasUrl = `${API.canvasLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topicNumber=${topicNum}`;
            const debugUrl = config.restUrl + 'canvas/debug';

            Promise.allSettled([
                apiGet(phaseUrl).catch(() => null),
                apiGet(progressUrl).catch(() => null),
                fetch(canvasUrl, { headers }).then(r => r.json()).catch(() => null),
                fetch(debugUrl, { headers }).then(r => r.json()).catch(() => null)
            ]).then(([phaseResult, progressResult, canvasResult, debugResult]) => {
                const wmlPhase = phaseResult.value || {};
                const res = progressResult.value || {};
                const canvasRes = canvasResult.value || {};
                const debug = debugResult.value || {};

                // Determine Phase 1 status
                const wmlP1 = wmlPhase.initial?.status;
                const spStatus = res.initial?.status;
                const hasCanvas = canvasRes.success && canvasRes.doc && (canvasRes.doc.wordCount > 0 || (canvasRes.doc.html && canvasRes.doc.html.length > 100));
                const effectiveP1 = (wmlP1 === 'complete') ? 'complete'
                    : (spStatus === 'complete' || spStatus === 'in_progress' || spStatus === 'submitted') ? spStatus
                    : hasCanvas ? 'in_progress' : null;

                // Merge grade from WML phase meta
                if (wmlP1 === 'complete' && wmlPhase.initial?.grade) {
                    if (!res.initial) res.initial = {};
                    res.initial.grade = wmlPhase.initial.grade;
                    res.initial.status = 'complete';
                }

                // Determine Phase 2 status
                const wmlP2 = wmlPhase.redraft?.status;
                if (wmlP2 === 'complete' && wmlPhase.redraft?.grade) {
                    if (!res.redraft) res.redraft = {};
                    res.redraft.grade = wmlPhase.redraft.grade;
                    res.redraft.status = 'complete';
                }

                const p1Complete = effectiveP1 === 'complete' || effectiveP1 === 'submitted';
                const p1InProgress = effectiveP1 === 'in_progress';
                const p2Status = res.redraft?.status;
                const p2Complete = p2Status === 'complete' || p2Status === 'submitted';
                const p2InProgress = p2Status === 'in_progress';

                // Map to stepper status values — Phase 2 is never locked (LearnDash handles sequencing)
                const p1StepperStatus = p1Complete ? 'complete' : p1InProgress ? 'active' : 'not_started';
                const p2StepperStatus = p2Complete ? 'complete' : p2InProgress ? 'active' : 'not_started';

                const p1Label = p1Complete ? `✓ Complete${res.initial?.grade ? ' · ' + res.initial.grade : ''}` : p1InProgress ? '◐ In progress' : '○ Not started';
                const p2Label = p2Complete ? `✓ Complete${res.redraft?.grade ? ' · ' + res.redraft.grade : ''}` : p2InProgress ? '◐ In progress' : '○ Not started';

                console.log('WML Phase Status:', { board: state.board, text: state.text, topic: topicNum, wmlPhase, studentProgress: res, effectiveP1, p1StepperStatus, p2StepperStatus, canvasDebug: debug });

                // Rebuild stepper with resolved statuses
                stepperWrap.innerHTML = '';
                stepperWrap.appendChild(buildStepper([
                    {
                        id: 'phase1',
                        icon: SVG_WRITING,
                        title: 'Phase 1 — Initial Attempt',
                        desc: p1Complete ? 'Essay written and assessed.' : p1InProgress ? 'Essay started — continue writing or submit for assessment.' : 'Write your essay independently, then get it assessed.',
                        status: p1StepperStatus,
                        statusLabel: p1Label,
                        onClick: () => {
                            state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                            state.phase = 'initial';
                            renderPhaseSubSteps('initial', topicNum, baseType, { effectiveP1, wmlPhase, res, canvasRes });
                        }
                    },
                    {
                        id: 'phase2',
                        icon: SVG_REDRAFT,
                        title: 'Phase 2 — Redraft',
                        desc: p1Complete ? 'Improve your essay with AI guidance. Plan, polish, and get reassessed.' : 'Plan, polish, and get reassessed.',
                        status: p2StepperStatus,
                        statusLabel: p2Label,
                        onClick: () => {
                            state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                            state.phase = 'redraft';
                            renderPhaseSubSteps('redraft', topicNum, baseType, { wmlPhase, res });
                        }
                    }
                ]));
            });

        }, 'forward');
    }

    /**
     * Level 2 — Sub-steps within a phase (vertical stepper).
     * Phase 1: Write Essay → Get Assessed
     * Phase 2: Planning → Outlining → Polishing → Assessment
     */
    function renderPhaseSubSteps(phase, topicNum, baseType, progressData) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            // Context card with back links inline in the badges row
            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: '📚 Mastery Programme' }));
            const badgeItems = [state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text), `Topic ${topicNum}`, phase === 'initial' ? 'Initial' : 'Redraft'];
            const badgeRow = renderBadges(badgeItems);
            // Append back links directly into the badge row
            const backLinks = el('span', { className: 'swml-badge-back-links' }, [
                el('button', { className: 'swml-back-link', textContent: '← Back', onClick: () => renderPhaseSelect(topicNum, baseType) }),
                el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } })
            ]);
            badgeRow.appendChild(backLinks);
            card.appendChild(badgeRow);
            inner.appendChild(card);

            const phaseTitle = phase === 'initial' ? 'Phase 1 — Initial Attempt' : 'Phase 2 — Redraft';
            inner.appendChild(el('h2', { textContent: phaseTitle }));

            if (phase === 'initial') {
                // Phase 1 sub-steps: Write Essay → Get Assessed
                const { effectiveP1, wmlPhase, res, canvasRes } = progressData;
                const p1Complete = effectiveP1 === 'complete' || effectiveP1 === 'submitted';
                const p1InProgress = effectiveP1 === 'in_progress';

                // Diagnostic = "Write Essay" — done when canvas has content (v7.12.26)
                const hasCanvas = canvasRes?.success && canvasRes?.doc && (canvasRes.doc.wordCount > 0 || (canvasRes.doc.html && canvasRes.doc.html.length > 100));
                const diagnosticDone = p1Complete || hasCanvas;

                // Check feedback discussion status (now Phase 1, v7.12.76)
                const fbKey = `swml_fb_complete_${state.board}_${state.text}_t${state.topicNumber || 0}`;
                const fbStatus = localStorage.getItem(fbKey);
                const fbDone = fbStatus === 'complete' || fbStatus === 'skipped';

                // All sub-steps unlocked — LearnDash handles sequencing
                const statuses = {
                    diagnostic: diagnosticDone ? 'complete' : p1InProgress ? 'active' : 'not_started',
                    diagnosticLabel: diagnosticDone ? '✓ Complete · Essay submitted' : p1InProgress ? '◐ In progress' : null,
                    diagnosticGrade: res?.initial?.grade,
                    assessment: p1Complete ? 'complete' : 'not_started',
                    assessmentLabel: p1Complete ? `✓ Complete${res?.initial?.grade ? ' · ' + res.initial.grade : ''}` : null,
                    feedback_discussion: fbDone ? 'complete' : 'not_started',
                    feedbackDiscussionLabel: fbStatus === 'complete' ? '✓ Discussed' : fbStatus === 'skipped' ? '⏭ Skipped' : null,
                };

                const stepperWrap1 = el('div', { className: 'swml-stepper-wrap' });
                stepperWrap1.appendChild(buildStepper(getPhaseSubSteps('initial', statuses, baseType)));
                inner.appendChild(stepperWrap1);
            } else {
                // Phase 2 sub-steps: Discuss Feedback → Planning → Outlining → Polishing → Assessment
                const { wmlPhase, res } = progressData;
                const redraftData = res?.redraft || {};

                const redraftComplete = redraftData.status === 'complete' || redraftData.status === 'submitted';
                const redraftInProgress = redraftData.status === 'in_progress';

                // Check step completion statuses from localStorage (v7.12.76)
                const msKey = `swml_fb_complete_${state.board}_${state.text}_t${state.topicNumber || 0}_mark_scheme`;
                const maKey = `swml_fb_complete_${state.board}_${state.text}_t${state.topicNumber || 0}_model_answer`;
                const msStatus = localStorage.getItem(msKey);
                const maStatus = localStorage.getItem(maKey);
                const msDone = msStatus === 'complete' || msStatus === 'skipped';
                const maDone = maStatus === 'complete' || maStatus === 'skipped';

                // All sub-steps unlocked — LearnDash handles sequencing
                const statuses = {
                    mark_scheme: msDone ? 'complete' : 'not_started',
                    markSchemeLabel: msStatus === 'complete' ? '✓ Complete' : msStatus === 'skipped' ? '⏭ Skipped' : null,
                    model_answer: maDone ? 'complete' : 'not_started',
                    modelAnswerLabel: maStatus === 'complete' ? '✓ Complete' : maStatus === 'skipped' ? '⏭ Skipped' : null,
                    planning: redraftInProgress ? 'active' : redraftComplete ? 'complete' : 'not_started',
                    planningLabel: null,
                    outlining: redraftComplete ? 'complete' : 'not_started',
                    outliningLabel: null,
                    polishing: redraftComplete ? 'complete' : 'not_started',
                    polishingLabel: null,
                    reassessment: redraftComplete ? 'complete' : 'not_started',
                    reassessmentLabel: redraftComplete ? `✓ Complete${redraftData.grade ? ' · ' + redraftData.grade : ''}` : null
                };

                const stepperWrap2 = el('div', { className: 'swml-stepper-wrap' });
                stepperWrap2.appendChild(buildStepper(getPhaseSubSteps('redraft', statuses, baseType)));
                inner.appendChild(stepperWrap2);
            }
        }, 'forward');
    }

    /**
     * Timer selection before diagnostic canvas.
     * Options: Exam conditions (45 min), Custom timer, No timer.
     */
    function renderDiagnosticTimerSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: '📚 Mastery Programme' }));
            const badges = [state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text), `Topic ${state.topicNumber}`, 'Initial'];
            card.appendChild(renderBadges(badges));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change phase', onClick: () => {
                const baseType = state.topicNumber === 1 ? 'diagnostic' : 'development';
                renderPhaseSelect(state.topicNumber, baseType);
            }}));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Set your timer' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'This is your independent assessment — no AI, no notes. Choose your timing.' }));

            const grid = el('div', { className: 'swml-path-grid' });

            // Exam conditions — 45 minutes
            grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                state.canvasTimer = 45 * 60; // seconds
                state.canvasTimerLabel = 'Exam Conditions — 45 minutes';
                WML.renderCanvasWorkspace();
            }}, [
                el('span', { className: 'swml-path-icon', innerHTML: SVG_PHASE_LOCK }),
                el('span', { className: 'swml-path-title', textContent: 'Exam Conditions' }),
                el('span', { className: 'swml-path-desc', textContent: '45 minutes — no pausing, simulates real exam timing.' }),
            ]));

            // Custom timer
            grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                const mins = prompt('How many minutes?', '45');
                if (mins && !isNaN(parseInt(mins))) {
                    state.canvasTimer = parseInt(mins) * 60;
                    state.canvasTimerLabel = `Custom Timer — ${mins} minutes`;
                    WML.renderCanvasWorkspace();
                }
            }}, [
                el('span', { className: 'swml-path-icon', innerHTML: SVG_PHASE_CUSTOM }),
                el('span', { className: 'swml-path-title', textContent: 'Custom Timer' }),
                el('span', { className: 'swml-path-desc', textContent: 'Set your own time limit.' }),
            ]));

            // No timer
            grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                state.canvasTimer = 0;
                state.canvasTimerLabel = '';
                WML.renderCanvasWorkspace();
            }}, [
                el('span', { className: 'swml-path-icon', innerHTML: SVG_PHASE_ZEN }),
                el('span', { className: 'swml-path-title', textContent: 'No Timer' }),
                el('span', { className: 'swml-path-desc', textContent: 'Take your time — no time pressure.' }),
            ]));

            inner.appendChild(grid);
        }, 'forward');
    }

    /**
     * Options for Phase 1 when already in progress or complete.
     * Shows: Continue Writing, Submit for Assessment.
     */
    function renderInitialPhaseOptions(phaseData) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: '📚 Mastery Programme' }));
            const badges = [state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text), `Topic ${state.topicNumber}`, 'Initial'];
            card.appendChild(renderBadges(badges));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change phase', onClick: () => {
                const baseType = state.topicNumber === 1 ? 'diagnostic' : 'development';
                renderPhaseSelect(state.topicNumber, baseType);
            }}));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'What do you want to do?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Initial attempt — your independent test' }));

            const grid = el('div', { className: 'swml-path-grid' });

            // Continue writing — opens canvas
            const isComplete = phaseData && phaseData.status === 'complete';
            if (!isComplete) {
                grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                    state.canvasTimer = 0;
                    WML.renderCanvasWorkspace();
                }}, [
                    el('span', { className: 'swml-path-icon', innerHTML: SVG_PHASE_WRITE }),
                    el('span', { className: 'swml-path-title', textContent: 'Continue Writing' }),
                    el('span', { className: 'swml-path-desc', textContent: 'Resume your diagnostic essay where you left off.' }),
                ]));
            }

            // Submit for assessment
            grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                selectTask('assessment');
            }}, [
                el('span', { className: 'swml-path-icon', innerHTML: SVG_ASSESS }),
                el('span', { className: 'swml-path-title', textContent: 'Submit for Assessment' }),
                el('span', { className: 'swml-path-desc', textContent: 'Submit your essay for detailed marking and feedback.' }),
            ]));

            inner.appendChild(grid);

            // Explanation note
            inner.appendChild(el('p', {
                className: 'swml-task-note',
                style: { textAlign: 'center', maxWidth: '520px', margin: '16px auto 0' },
                textContent: 'Planning and polishing become available after assessment. You\'ll be guided to the correct steps during the redraft phase.'
            }));
        }, 'forward');
    }

    function applyStatusTag(tag, phaseData) {
        tag.classList.remove('loading');
        if (!phaseData || !phaseData.status) {
            tag.textContent = '○ Not started';
            tag.classList.add('not-started');
            return;
        }
        if (phaseData.status === 'complete') {
            tag.textContent = `✓ Complete${phaseData.grade ? ' · ' + phaseData.grade : ''}`;
            tag.classList.add('complete');
        } else if (phaseData.status === 'in_progress') {
            tag.textContent = '◐ In progress';
            tag.classList.add('in-progress');
        } else {
            tag.textContent = '○ Not started';
            tag.classList.add('not-started');
        }
    }

    // ── Creative Writing Step Dashboard (v7.13.30) ──
    // Shows all 29 steps + 6 trials as cards grouped by phase.
    // Loads project data from CW project storage to show progress.
    // CW_STEPS moved to wml-core.js (v7.13.34) — use WML.CW_STEPS
    const CW_STEPS = WML.CW_STEPS;

    // ── Step 0: Project Naming Screen (v7.13.55) ──
    function renderCwProjectNaming(projects, onCreated) {
        const existingNames = (projects || []).map(p => (p.name || '').toLowerCase().trim());
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'Name Your Project', style: { marginBottom: '8px' } }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Every great story needs a working title. You can change it later.' }));

            const card = el('div', { className: 'swml-context-card', style: { maxWidth: '480px', margin: '24px auto', padding: '28px' } });

            const SVG_QUILL = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7DF9E9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5 -1.5"/><path d="M14.5 3.5c3.5 -1 6.5 0 7.5 1l-2 2c-1.5 -.5 -2.5 0 -3.5 1l-4 4c-1 1 -1.5 2.5 -1 3.5l2 2c-1 1 -3 2 -7 2l-1 1"/></svg>';
            card.innerHTML = '<div style="text-align:center;margin-bottom:16px">' + SVG_QUILL + '</div>';

            const nameInput = el('input', {
                type: 'text',
                placeholder: 'e.g. The Lost Garden, My Dystopian Future...',
                maxLength: 60,
                style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
            card.appendChild(nameInput);

            const errorMsg = el('div', { style: { color: '#ff6b6b', fontSize: '12px', marginTop: '6px', minHeight: '18px' } });
            card.appendChild(errorMsg);

            const createBtn = build3DButton('Create Project', '#5333ed', async () => {
                const name = nameInput.value.trim();
                if (!name) { errorMsg.textContent = 'Please enter a project name.'; return; }
                if (name.length < 2) { errorMsg.textContent = 'Name must be at least 2 characters.'; return; }
                if (existingNames.includes(name.toLowerCase())) { errorMsg.textContent = 'You already have a project with this name. Choose a different one.'; return; }
                errorMsg.textContent = '';
                createBtn.disabled = true;
                createBtn.style.opacity = '0.5';
                const res = await WML.cwProject.create(name, 'standalone');
                if (res?.success && res.project) {
                    onCreated(res.project);
                } else {
                    errorMsg.textContent = 'Failed to create project. Please try again.';
                    createBtn.disabled = false;
                    createBtn.style.opacity = '1';
                }
            });
            createBtn.style.marginTop = '16px';
            createBtn.style.width = '100%';
            card.appendChild(createBtn);

            // Enter key submits
            nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') createBtn.click(); });

            inner.appendChild(card);

            const backRow = el('div', { className: 'swml-back-row', style: { justifyContent: 'center', marginTop: '12px' } });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '\u2190 Back', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            inner.appendChild(backRow);

            // Auto-focus the input
            requestAnimationFrame(() => nameInput.focus());
        });
    }

    // ── Project Selector (v7.13.55) ──
    function renderCwProjectSelector(projects) {
        // Sort by most recently updated
        projects.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'Your Projects', style: { marginBottom: '8px' } }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Continue a project or start something new' }));

            const grid = el('div', { className: 'swml-cw-project-grid' });
            projects.forEach(p => {
                const pCard = el('div', { className: 'swml-cw-project-card' + (p.status === 'completed' ? ' completed' : '') });
                const statusIcon = p.status === 'completed' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1CD991"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : '';
                pCard.innerHTML = statusIcon;
                pCard.appendChild(el('div', { className: 'swml-cw-project-name', textContent: p.name || 'Untitled' }));
                pCard.appendChild(el('div', { className: 'swml-cw-project-meta', textContent: p.status === 'completed' ? 'Completed' : `Step ${p.current_step || 0} of 29` }));
                const updated = p.updated ? new Date(p.updated) : null;
                if (updated) pCard.appendChild(el('div', { className: 'swml-cw-project-date', textContent: 'Last worked: ' + updated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }));
                pCard.addEventListener('click', () => {
                    renderCreativeWritingDashboard(p.id);
                });
                grid.appendChild(pCard);
            });

            // "New Project" card
            const newCard = el('div', { className: 'swml-cw-project-card swml-cw-project-new' });
            newCard.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
            newCard.appendChild(el('div', { className: 'swml-cw-project-name', textContent: 'New Project' }));
            if (projects.some(p => p.status !== 'completed')) {
                newCard.appendChild(el('div', { className: 'swml-cw-project-meta', textContent: 'Finish your current project first', style: { color: '#F1C40F' } }));
            }
            newCard.addEventListener('click', () => {
                renderCwProjectNaming(projects, (newProject) => {
                    renderCreativeWritingDashboard(newProject.id);
                });
            });
            grid.appendChild(newCard);

            inner.appendChild(grid);

            const backRow = el('div', { className: 'swml-back-row', style: { justifyContent: 'center', marginTop: '12px' } });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '\u2190 Back', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            inner.appendChild(backRow);
        });
    }

    async function renderCreativeWritingDashboard(forceProjectId) {
        // Load projects
        let projectsRes = await WML.cwProject.list();
        let projects = projectsRes?.projects || [];

        // v7.13.55: No projects → show naming screen (Step 0)
        if (projects.length === 0) {
            renderCwProjectNaming([], (newProject) => {
                renderCreativeWritingDashboard(newProject.id);
            });
            return;
        }

        // v7.13.55: Multiple projects + no forceProjectId → show selector
        if (projects.length > 1 && !forceProjectId) {
            renderCwProjectSelector(projects);
            return;
        }

        // Select the requested project or most recent
        let project = forceProjectId
            ? projects.find(p => p.id === forceProjectId) || projects[0]
            : projects.sort((a, b) => new Date(b.updated) - new Date(a.updated))[0];

        // Load full project data for step completion
        let projectData = null;
        if (project) {
            const loadRes = await WML.cwProject.load(project.id);
            projectData = loadRes?.project || null;
        }
        const completedSteps = projectData?.step_completion || {};

        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            // Context card with project name
            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Creative Writing Masterclass' }));
            card.appendChild(renderBadges([project?.name || 'My Story', `Step ${project?.current_step || 0} of 29`]));

            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '\u2190 Back', onClick: () => { resetState(); renderExamPrepWizard(); } }));

            // Switch project (if multiple)
            if (projects.length > 1) {
                backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: 'Switch Project', onClick: () => {
                    renderCwProjectSelector(projects);
                }}));
            }

            // New Project button
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '+ New Project', onClick: () => {
                renderCwProjectNaming(projects, (newProject) => {
                    renderCreativeWritingDashboard(newProject.id);
                });
            }}));

            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Your Creative Writing Journey' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Build your story step by step \u2014 each layer adds depth to your writing' }));

            // Scrollable container for all phase sections
            const scrollWrap = el('div', { className: 'swml-cw-scroll-wrap' });

            // Phase groups
            const phases = [
                { key: 'planning', title: 'Planning Phase', desc: 'Discover your voice, find your story, and plan your plot' },
                { key: 'drafting', title: 'Drafting Cycle', desc: '7 progressive drafts — each adding a new creative layer' },
                { key: 'polish',   title: 'Polish Phase', desc: 'Perfect your final draft and reflect on your growth' },
            ];

            phases.forEach(phase => {
                const section = el('div', { className: 'swml-cw-phase-section' });
                section.appendChild(el('h3', { className: 'swml-cw-phase-title', textContent: phase.title }));
                section.appendChild(el('p', { className: 'swml-cw-phase-desc', textContent: phase.desc }));

                const grid = el('div', { className: 'swml-cw-step-grid' });
                const phaseSteps = CW_STEPS.filter(s => s.phase === phase.key);

                phaseSteps.forEach((stepDef, idx) => {
                    const stepKey = stepDef.step || stepDef.id;
                    const isComplete = !!completedSteps[stepKey];
                    const isTrial = !!stepDef.trial;
                    const isDraft = !!stepDef.draft;

                    // Determine recommended order indicator
                    const sequenceIdx = CW_STEPS.indexOf(stepDef);
                    const prevStep = sequenceIdx > 0 ? CW_STEPS[sequenceIdx - 1] : null;
                    const prevKey = prevStep ? (prevStep.step || prevStep.id) : null;
                    const prevComplete = prevKey ? !!completedSteps[prevKey] : true;
                    const highestComplete = project?.current_step || 0;
                    const stepNum = stepDef.step || 0;
                    const needsEarlierSteps = stepNum > 1 && highestComplete < stepNum - 1 && !isComplete;

                    const stepCard = el('div', {
                        className: 'swml-cw-step-card'
                            + (isComplete ? ' complete' : '')
                            + (isTrial ? ' trial' : '')
                            + (isDraft ? ' draft' : ''),
                    });

                    // Step number badge
                    const numBadge = el('div', { className: 'swml-cw-step-num' });
                    if (isTrial) {
                        numBadge.textContent = 'T' + stepDef.trial;
                        numBadge.classList.add('trial-badge');
                    } else {
                        numBadge.textContent = stepDef.step;
                    }
                    stepCard.appendChild(numBadge);

                    // Title
                    stepCard.appendChild(el('div', { className: 'swml-cw-step-label', textContent: stepDef.label }));

                    // Tier indicator
                    const tierLabel = stepDef.tier === 'si' ? 'SI Guided' : 'Workbook';
                    stepCard.appendChild(el('div', { className: 'swml-cw-step-tier ' + stepDef.tier, textContent: tierLabel }));

                    // Status
                    const statusEl = el('div', { className: 'swml-cw-step-status' });
                    if (isComplete) {
                        statusEl.textContent = 'Complete';
                        statusEl.classList.add('complete');
                    } else if (needsEarlierSteps) {
                        statusEl.textContent = 'Start from Step ' + (highestComplete + 1);
                        statusEl.classList.add('suggestion');
                    } else {
                        statusEl.textContent = 'Not started';
                        statusEl.classList.add('not-started');
                    }
                    stepCard.appendChild(statusEl);

                    // Click handler — store which CW step we're opening
                    stepCard.addEventListener('click', () => {
                        state.board = 'universal';
                        state.subject = 'creative_writing';
                        state.text = 'creative_writing';
                        state.textName = 'Creative Writing';
                        state.mode = 'creative';
                        state.cwProjectId = project?.id;
                        state.cwProjectName = project?.name || '';
                        state.cwStep = stepDef.step || null;
                        state.cwTrial = stepDef.trial || null;
                        // Set task for protocol router
                        if (stepDef.trial) {
                            state.task = 'cw_trial_' + stepDef.trial;
                        } else {
                            state.task = 'cw_step_' + stepDef.step;
                        }
                        // v7.13.34: Render the CW exercise canvas
                        state.canvasTimer = 0;
                        state.step = 0;
                        WML.renderCanvasWorkspace();
                    });

                    grid.appendChild(stepCard);
                });

                section.appendChild(grid);
                scrollWrap.appendChild(section);
            });

            inner.appendChild(scrollWrap);
        });
    }

    // ── Task Selection (only for exam prep or guided without task) ──
    function renderTaskSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            const isProgramme = state.mode === 'guided' && state.topicNumber;
            card.appendChild(el('div', { className: 'swml-context-label', textContent: isProgramme ? '📚 Mastery Programme' : state.mode === 'exam_prep' ? '🎯 Free Practice' : 'Your session' }));
            const badges = [state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text)];
            if (isProgramme) badges.push(`Topic ${state.topicNumber}`, state.phase === 'redraft' ? 'Redraft' : 'Initial');
            card.appendChild(renderBadges(badges));
            const backRow = el('div', { className: 'swml-back-row' });
            if (isProgramme) {
                backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change phase', onClick: () => {
                    const baseType = state.topicNumber === 1 ? 'diagnostic' : 'development';
                    renderPhaseSelect(state.topicNumber, baseType);
                }}));
            } else {
                backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change text', onClick: () => renderTextSelect('back') }));
            }
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'What do you want to do?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: isProgramme ? `${state.phase === 'redraft' ? 'Redraft' : 'Initial attempt'} — ${state.phase === 'initial' ? 'Submit your solo essay for marking' : 'Plan, improve, and get reassessed'}` : 'Choose how you\'d like to work today' }));

            const grid = el('div', { className: 'swml-task-grid' });

            // Essay Skills — phase-aware for programme mode
            const activeForEssaySkills = ['aqa', 'ocr', 'eduqas', 'edexcel', 'edexcel-igcse', 'ccea', 'sqa'];
            const poetryEssayBoards = ['aqa', 'eduqas']; // Boards with poetry essay protocols
            const hasEssaySkills = activeForEssaySkills.includes(state.board) && (!isPoetrySubject() || poetryEssayBoards.includes(state.board));
            const boardsWithAssessment = ['aqa', 'ocr', 'eduqas', 'edexcel', 'edexcel-igcse', 'ccea', 'sqa'];
            const hasAssessment = boardsWithAssessment.includes(state.board) && (!isPoetrySubject() || poetryEssayBoards.includes(state.board));

            // Programme initial phase: ONLY assessment (it's a test — no planning, no polishing)
            // Programme redraft phase: all three (plan, assess, polish)
            // Free practice / standalone: all three
            const isInitialPhase = isProgramme && state.phase === 'initial';

            grid.appendChild(el('div', { className: 'swml-task-category swml-task-collapsible collapsed', onClick: function() { this.classList.toggle('collapsed'); this.nextElementSibling.classList.toggle('swml-collapsed'); }, innerHTML: `<span class="swml-collapse-chevron"></span> ${isLanguageSubject() ? 'Writing Skills' : 'Essay Skills'}` }));
            const essayGroup = el('div', { className: 'swml-task-group swml-collapsed' });
            const essayInner = el('div', { className: 'swml-task-group-inner' });
            essayGroup.appendChild(essayInner);

            if (isInitialPhase) {
                // Initial phase — only assessment
                essayInner.appendChild(el('button', {
                    className: 'swml-task-btn',
                    onClick: () => { if (hasAssessment) selectTask('assessment'); },
                    style: !hasAssessment ? { opacity: '0.4', cursor: 'not-allowed' } : {},
                }, [
                    el('span', { className: 'icon', innerHTML: SVG_ASSESS }),
                    el('span', { className: 'label', textContent: 'Submit for Assessment' }),
                    el('span', { className: 'desc', textContent: 'Submit your essay for detailed marking and feedback' }),
                ]));
                essayInner.appendChild(el('div', { className: 'swml-task-note', textContent: 'Planning and polishing are available during the redraft phase. The initial attempt is your independent test.' }));
            } else {
                // Redraft or free practice — all three
                [
                    { id: 'planning', icon: SVG_PLAN, label: isLanguageSubject() ? 'Plan an Answer' : 'Plan an Essay', desc: isLanguageSubject() ? 'Build a structured answer plan through guided questions' : 'Build a structured essay plan through guided questions', enabled: hasEssaySkills },
                    { id: 'assessment', icon: SVG_ASSESS, label: 'Get Assessed', desc: 'Submit your essay for detailed marking and feedback', enabled: hasAssessment },
                    { id: 'polishing', icon: SVG_POLISH, label: 'Polish My Writing', desc: 'Refine and elevate your existing draft', enabled: hasEssaySkills },
                ].forEach(t => {
                    const disabled = !t.enabled;
                    essayInner.appendChild(el('button', {
                        className: 'swml-task-btn',
                        onClick: () => {
                            if (disabled) return;
                            if (t.id === 'polishing' && state.mode === 'exam_prep') { renderWorkSelect(); return; }
                            selectTask(t.id);
                        },
                        style: disabled ? { opacity: '0.4', cursor: 'not-allowed' } : {},
                    }, [
                        el('span', { className: 'icon', innerHTML: t.icon }),
                        el('span', { className: 'label', textContent: t.label }),
                        el('span', { className: 'desc', textContent: disabled ? 'Coming soon for this board' : t.desc }),
                    ]));
                });

                // Writing Canvas — available for all literature subjects with essay skills
                if (hasEssaySkills && !isLanguageSubject()) {
                    essayInner.appendChild(el('button', {
                        className: 'swml-task-btn',
                        onClick: () => WML.renderCanvasWorkspace(),
                    }, [
                        el('span', { className: 'icon', textContent: '✍️' }),
                        el('span', { className: 'label', textContent: 'Write Essay' }),
                        el('span', { className: 'desc', textContent: 'Write in the AI-powered editor with your plan beside you' }),
                        el('span', { style: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(81,218,207,0.25)', color: '#51dacf', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.5px' }, textContent: 'BETA' }),
                    ]));
                }
            }
            grid.appendChild(essayGroup);

            // Exam Preparation — only in free practice mode, NOT in programme mode
            if (!isProgramme) {
            grid.appendChild(el('div', { className: 'swml-task-category swml-task-collapsible collapsed', onClick: function() { this.classList.toggle('collapsed'); this.nextElementSibling.classList.toggle('swml-collapsed'); }, innerHTML: '<span class="swml-collapse-chevron"></span> Exam Preparation' }));
            const examGroup = el('div', { className: 'swml-task-group swml-collapsed' });
            const examInner = el('div', { className: 'swml-task-group-inner' });
            examGroup.appendChild(examInner);
            const examTasks = [
                { id: 'quote_test', icon: '🎯', label: 'Quote Quiz', desc: 'Test your recall of key quotes for this text', disabled: true },
                { id: 'timed_practice', icon: '⏱️', label: 'Timed Practice', desc: 'Simulate exam conditions with a timer', disabled: true },
            ];

            // Board-aware task availability for exam prep
            // TTECEA+C tasks (verbal_rehearsal, essay_plan, model_answer) work for: AQA, OCR (shakespeare/19c), EDUQAS (19c), Edexcel IGCSE (heritage)
            const ttecBoards = ['aqa', 'ocr', 'eduqas', 'edexcel-igcse', 'ccea', 'sqa'];
            const hasTTEC = ttecBoards.includes(state.board) && ['shakespeare', '19th_century', 'modern_text', 'modern_prose', 'prose', 'critical_reading'].includes(state.subject);
            // Full exam prep (exam_question) is AQA only for now
            const hasFullExamPrep = state.board === 'aqa' && ['shakespeare', '19th_century', 'modern_text'].includes(state.subject);

            if (hasTTEC) {
                examTasks.unshift({ id: 'verbal_rehearsal', icon: SVG_MIC_ICON, label: 'Random Quote Analysis', desc: 'Get a random quote and build a TTECEA+C paragraph — great exam prep', step: hasFullExamPrep ? 4 : undefined });
                examTasks.unshift({ id: 'model_answer', icon: SVG_QA_FILL, label: 'Model Answers', desc: 'Generate or co-write Grade 9 model answers', step: hasFullExamPrep ? 3 : undefined });
                examTasks.unshift({ id: 'essay_plan', icon: SVG_LIST_DETAILS, label: 'Essay Plan', desc: 'Build a structured TTECEA+C essay plan — choose your intensity', step: hasFullExamPrep ? 2 : undefined });
            }
            // Conceptual notes available for all literature boards EXCEPT unseen poetry, unseen prose, and language papers
            if (state.subject !== 'unseen_poetry' && state.subject !== 'unseen_prose' && !isLanguageSubject()) {
                const cnDesc = isNonfictionSubject()
                    ? 'Build deep understanding of writer\'s voice, techniques, themes, context and purpose'
                    : isPoetrySubject()
                        ? 'Build deep understanding of speaker, form, themes, context and purpose'
                        : 'Build deep understanding of themes, characters, context and purpose';
                examTasks.splice(examTasks.length - 2, 0, { id: 'conceptual_notes', icon: SVG_NOTES, label: 'Grade 9 Conceptual Notes', desc: cnDesc });
            }
            // Memory Practice — universal, all boards, all subjects
            examTasks.splice(examTasks.length - 2, 0, { id: 'memory_practice', icon: SVG_BRAIN, label: 'Memory Practice', desc: 'Submit your writing, pass the quality gate, then lock it in with retrieval practice' });
            if (hasFullExamPrep) {
                examTasks.unshift({ id: 'exam_question', icon: SVG_AI_GENERATE, label: 'Create Exam Question', desc: '⭐ Recommended first step — create questions, then plan essays', recommended: true, step: 1 });
            }
            examTasks.forEach(t => {
                const btn = el('button', {
                    className: `swml-task-btn${t.recommended ? ' swml-task-recommended' : ''}`,
                    style: t.disabled ? { opacity: '0.4', cursor: 'not-allowed' } : {},
                    onClick: () => {
                        if (t.disabled) return;
                        if (t.id === 'essay_plan') { renderEssayPlanModeSelect(); return; }
                        if (t.id === 'model_answer') { renderModelAnswerSetup(); return; }
                        if (t.id === 'verbal_rehearsal') { selectTask('verbal_rehearsal'); return; }
                        selectTask(t.id);
                    },
                }, [
                    ...(t.step ? [el('span', { className: 'swml-task-step', textContent: t.step })] : []),
                    el('span', { className: 'icon', innerHTML: t.icon }),
                    el('span', { className: 'label', textContent: t.label }),
                    el('span', { className: 'desc', textContent: t.disabled ? 'Coming soon' : t.desc }),
                ]);
                if (t.id === 'exam_question') btn.id = 'swml-task-exam-question';
                if (t.id === 'essay_plan') btn.id = 'swml-task-essay-plan';
                if (t.id === 'model_answer') btn.id = 'swml-task-model-answer';
                if (t.id === 'verbal_rehearsal') btn.id = 'swml-task-verbal-rehearsal';
                examInner.appendChild(btn);
            });
            grid.appendChild(examGroup);
            } // end !isProgramme (exam prep only in free practice)

            inner.appendChild(grid);

            // Fetch saved question count and show badges
            apiGet(API.savedQuestions + `?board=${state.board}&text=${state.text}`).then(res => {
                if (!res.success || !res.questions) return;
                const count = res.questions.length;
                if (count === 0) return;
                const eqBtn = $('#swml-task-exam-question');
                if (eqBtn) eqBtn.appendChild(el('span', { className: 'swml-task-badge', textContent: `${count} question${count > 1 ? 's' : ''} saved` }));
                const epBtn = $('#swml-task-essay-plan');
                if (epBtn) epBtn.appendChild(el('span', { className: 'swml-task-badge', textContent: `${count} question${count > 1 ? 's' : ''} ready` }));
                const maBtn = $('#swml-task-model-answer');
                if (maBtn) maBtn.appendChild(el('span', { className: 'swml-task-badge', textContent: `${count} question${count > 1 ? 's' : ''} ready` }));
            }).catch(() => {});
        });
    }

    // ── Essay Plan Mode Selection ──
    function renderEssayPlanModeSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Your session' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), ucfirst(state.text)]));
            card.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change task', onClick: () => renderTaskSelect('back') }));
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Choose Your Planning Mode' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'How much guidance do you want?' }));

            const grid = el('div', { className: 'swml-task-grid' });
            [
                { id: 'A', icon: '🔥', label: 'Recall', desc: 'Test yourself under timed exam conditions — explain a full plan from memory using your voice. Best when you\'ve already built plans and want to test recall.' },
                { id: 'B', icon: '⚡', label: 'Guided', desc: 'You choose your quotes and I\'ll build the plan. Faster, but still personalised.' },
                { id: 'C', icon: '🚀', label: 'Instant', desc: 'Give me the question and I\'ll generate a complete plan immediately. Best for quick exam prep.' },
            ].forEach(m => {
                grid.appendChild(el('button', {
                    className: 'swml-task-btn',
                    onClick: () => { state.planningMode = m.id; selectTask('essay_plan'); },
                }, [
                    el('span', { className: 'icon', textContent: m.icon }),
                    el('span', { className: 'label', textContent: m.label }),
                    el('span', { className: 'desc', textContent: m.desc }),
                ]));
            });
            inner.appendChild(grid);
        });
    }

    // ── Model Answer Setup — Coached vs Instant vs Advanced ──
    function renderModelAnswerSetup() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Your session' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), ucfirst(state.text)]));
            card.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change task', onClick: () => renderTaskSelect('back') }));
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Choose Your Model Answer Mode' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'The AI will guide you through each section in the chat' }));

            const grid = el('div', { className: 'swml-task-grid' });
            [
                { id: 'A', icon: '🔥', label: 'Coached', desc: 'You explain each section first, then get feedback and a refined Grade 9 model. Best for building exam skills.' },
                { id: 'B', icon: '🚀', label: 'Instant', desc: 'Grade 9 model answers generated immediately for each section. Best for quick reference or revision.' },
                { id: 'C', icon: '⏱️', label: 'Advanced', desc: 'Timed verbal recall — plan and explain a full essay from memory under exam conditions. The ultimate test.' },
            ].forEach(m => {
                grid.appendChild(el('button', {
                    className: 'swml-task-btn',
                    onClick: () => {
                        if (m.id === 'C') {
                            renderAdvancedLevelSelect();
                        } else {
                            state.planningMode = m.id;
                            state.advancedLevel = 0;
                            selectTask('model_answer');
                        }
                    },
                }, [
                    el('span', { className: 'icon', textContent: m.icon }),
                    el('span', { className: 'label', textContent: m.label }),
                    el('span', { className: 'desc', textContent: m.desc }),
                ]));
            });
            inner.appendChild(grid);
        });
    }

    // ── Model Answer Advanced — Level Selection ──
    function renderAdvancedLevelSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Advanced Recall' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), ucfirst(state.text)]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change mode', onClick: () => renderModelAnswerSetup() }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Choose Your Challenge Level' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'All levels test your ability to explain a Grade 9 essay from memory' }));

            const grid = el('div', { className: 'swml-task-grid' });
            [
                { level: 1, icon: '🔥', label: 'Full Recall', desc: 'Random question + plan from memory + essay from memory. Everything from scratch — the hardest challenge.', tag: 'Hardest' },
                { level: 2, icon: '⚡', label: 'Plan & Answer', desc: 'You choose the question, but still plan and write from memory under timed pressure.', tag: 'Medium' },
                { level: 3, icon: '🚀', label: 'Answer Only', desc: 'Bring your question and plan — just the essay is tested. Great for practising essay fluency.', tag: 'Entry' },
            ].forEach(l => {
                const btn = el('button', {
                    className: 'swml-task-btn',
                    onClick: () => {
                        state.planningMode = 'C';
                        state.advancedLevel = l.level;
                        // Level 1 = fully random (no question needed), Levels 2-3 = student chooses question
                        selectTask('model_answer');
                    },
                }, [
                    el('span', { className: 'icon', textContent: l.icon }),
                    el('span', { className: 'label', textContent: `Level ${l.level} — ${l.label}` }),
                    el('span', { className: 'desc', textContent: l.desc }),
                ]);
                if (l.tag) {
                    const tag = el('span', { className: 'swml-level-tag', textContent: l.tag });
                    btn.querySelector('.label').appendChild(tag);
                }
                grid.appendChild(btn);
            });
            inner.appendChild(grid);
        });
    }

    // ══════════════════════════════════════════
    //  QUESTION SELECTOR (Free Practice)
    // ══════════════════════════════════════════
    // Shown before essay_plan, model_answer, planning, assessment in free practice mode.
    // Three sources: mastery topics, saved questions from Exam Question Creator, custom input.

    const TASKS_NEEDING_QUESTION = ['essay_plan', 'model_answer', 'planning', 'assessment'];

    function needsQuestionSelect(taskId) {
        // Only in free practice (not programme mode where topic is already set)
        if (state.mode === 'guided' && state.topicNumber) return false;
        return TASKS_NEEDING_QUESTION.includes(taskId);
    }

    function renderQuestionSelect(taskId) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Select a Question' }));
            const taskLabel = taskId === 'essay_plan' ? 'Essay Plan' : taskId === 'model_answer' ? 'Model Answer' : taskId === 'assessment' ? 'Assessment' : 'Planning';
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text), taskLabel]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '\u2190 Back', onClick: () => {
                if (taskId === 'essay_plan') renderEssayPlanModeSelect();
                else if (taskId === 'model_answer') renderModelAnswerSetup();
                else renderTaskSelect('back');
            }}));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Which question?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Choose a question from your topics, your question bank, or write your own' }));

            const container = el('div', { className: 'swml-question-select' });
            const loading = el('div', { className: 'swml-setup-hint', textContent: 'Loading questions...' });
            container.appendChild(loading);
            inner.appendChild(container);

            // Fetch topics + saved questions in parallel
            Promise.all([
                apiGet(API.topicQuestions + `?board=${state.board}&text=${state.text}`).catch(() => ({ topics: [] })),
                apiGet(API.savedQuestions + `?board=${state.board}&text=${state.text}`).catch(() => ({ questions: [] })),
            ]).then(([topicRes, savedRes]) => {
                container.innerHTML = '';
                const topics = topicRes.topics || [];
                const saved = savedRes.questions || [];

                // ── Section 1: Mastery Programme Topics ──
                if (topics.length > 0) {
                    container.appendChild(el('div', { className: 'swml-qs-section-title', textContent: `Mastery Topics (${topics.length})` }));
                    const topicGrid = el('div', { className: 'swml-qs-grid' });
                    topics.forEach(t => {
                        const label = t.label || `Topic ${t.topic_number}`;
                        const qText = t.question_text || t.part_a_question || '';
                        const marks = t.marks || (t.part_a_marks && t.part_b_marks ? (t.part_a_marks + t.part_b_marks) : 0);
                        const aos = t.aos || [t.part_a_aos, t.part_b_aos].filter(Boolean).join(',');

                        topicGrid.appendChild(el('button', { className: 'swml-qs-card', onClick: () => {
                            state.question = qText;
                            state.marks = marks;
                            state.aos = aos;
                            state.topicLabel = label;
                            selectTask(taskId);
                        }}, [
                            el('div', { className: 'swml-qs-card-num', textContent: `T${t.topic_number}` }),
                            el('div', { className: 'swml-qs-card-label', textContent: label }),
                            qText ? el('div', { className: 'swml-qs-card-q', textContent: qText.length > 100 ? qText.slice(0, 100) + '...' : qText }) : null,
                            marks ? el('div', { className: 'swml-qs-card-marks', textContent: `${marks} marks` }) : null,
                        ].filter(Boolean)));
                    });
                    container.appendChild(topicGrid);
                }

                // ── Section 2: Saved Questions (from Exam Question Creator) ──
                if (saved.length > 0) {
                    container.appendChild(el('div', { className: 'swml-qs-section-title', textContent: `Your Questions (${saved.length})` }));
                    const savedGrid = el('div', { className: 'swml-qs-grid' });
                    saved.forEach((q, i) => {
                        savedGrid.appendChild(el('button', { className: 'swml-qs-card', onClick: () => {
                            state.question = q.full_text || q.summary || '';
                            state.marks = q.marks || '';
                            state.aos = q.aos || '';
                            selectTask(taskId);
                        }}, [
                            q.theme ? el('div', { className: 'swml-qs-card-num', textContent: q.theme.slice(0, 20) }) : el('div', { className: 'swml-qs-card-num', textContent: `Q${i + 1}` }),
                            el('div', { className: 'swml-qs-card-label', textContent: q.summary || `Question ${i + 1}` }),
                            q.location ? el('div', { className: 'swml-qs-card-q', textContent: q.location }) : null,
                        ].filter(Boolean)));
                    });
                    container.appendChild(savedGrid);
                }

                // ── Section 3: Custom Question ──
                container.appendChild(el('div', { className: 'swml-qs-section-title', textContent: 'Custom Question' }));
                const customWrap = el('div', { className: 'swml-qs-custom' });
                const customInput = el('textarea', {
                    className: 'swml-qs-custom-input',
                    placeholder: 'Type or paste your own question here...',
                    rows: '3',
                });
                customInput.style.cssText = 'width:100%;border:1px solid rgba(255,255,255,0.15);border-radius:8px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.9);padding:12px;font-size:13px;font-family:inherit;resize:vertical;min-height:70px;outline:none;';
                customWrap.appendChild(customInput);
                const customBtn = el('button', {
                    className: 'swml-task-btn',
                    style: { marginTop: '8px', maxWidth: '200px' },
                    textContent: 'Use this question',
                    onClick: () => {
                        const q = customInput.value.trim();
                        if (!q) { customInput.focus(); return; }
                        state.question = q;
                        state.marks = '';
                        state.aos = '';
                        selectTask(taskId);
                    },
                });
                customWrap.appendChild(customBtn);
                container.appendChild(customWrap);

                // ── Section 4: Skip (no question) ──
                container.appendChild(el('button', {
                    className: 'swml-back-link muted',
                    style: { marginTop: '16px', display: 'block', textAlign: 'center' },
                    textContent: 'Skip \u2014 let the AI choose',
                    onClick: () => { state.question = ''; selectTask(taskId); },
                }));
            });
        });
    }

    // ══════════════════════════════════════════
    //  WORK SELECTOR (Polish My Writing)
    // ══════════════════════════════════════════
    // Lists saved documents so the student can choose which one to polish.

    function renderWorkSelect() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: 'Select Work to Polish' }));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), state.textName || ucfirst(state.text), 'Polishing']));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '\u2190 Back', onClick: () => renderTaskSelect('back') }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Which piece of work?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Choose a previous essay or draft to refine and polish' }));

            const container = el('div', { className: 'swml-question-select' });
            const loading = el('div', { className: 'swml-setup-hint', textContent: 'Loading your saved work...' });
            container.appendChild(loading);
            inner.appendChild(container);

            apiGet(API.canvasList + `?board=${state.board}&text=${state.text}`).then(res => {
                container.innerHTML = '';
                const docs = (res.documents || []).filter(d => (d.wordCount || 0) > 20);

                if (docs.length === 0) {
                    container.appendChild(el('div', { className: 'swml-setup-hint', style: { textAlign: 'center', padding: '24px 0' }, textContent: 'No saved work found for this text yet. Write an essay first, then come back to polish it.' }));
                    container.appendChild(el('button', {
                        className: 'swml-task-btn', style: { maxWidth: '260px', margin: '12px auto', display: 'block' },
                        textContent: 'Write an essay first',
                        onClick: () => renderTaskSelect('back'),
                    }));
                    return;
                }

                container.appendChild(el('div', { className: 'swml-qs-section-title', textContent: `Your Work (${docs.length})` }));
                const grid = el('div', { className: 'swml-qs-grid' });
                docs.forEach(d => {
                    // Parse key to extract topic info: swml_canvas_board_text_topicN[_suffix]
                    const keyParts = d.key.replace('swml_canvas_', '').split('_');
                    const topicNum = d.topicNumber || '';
                    const suffix = d.key.match(/_([a-z]+)$/)?.[1] || '';
                    const suffixLabels = { eq: 'Exam Question', ep: 'Essay Plan', ma: 'Model Answer', qa: 'Quote Analysis', cn: 'Conceptual Notes', ms: 'Mark Scheme', redraft: 'Redraft', outline: 'Outline', fb: 'Feedback' };
                    const typeLabel = suffixLabels[suffix] || (topicNum ? `Topic ${topicNum}` : 'Essay');
                    const dateStr = d.savedAt ? new Date(d.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

                    grid.appendChild(el('button', { className: 'swml-qs-card', onClick: () => {
                        if (d.topicNumber) state.topicNumber = d.topicNumber;
                        selectTask('polishing');
                    }}, [
                        el('div', { className: 'swml-qs-card-num', textContent: typeLabel }),
                        el('div', { className: 'swml-qs-card-label', textContent: `${d.wordCount || 0} words` }),
                        dateStr ? el('div', { className: 'swml-qs-card-q', textContent: `Saved ${dateStr}` }) : null,
                    ].filter(Boolean)));
                });
                container.appendChild(grid);

                // Option to polish without loading (start fresh)
                container.appendChild(el('button', {
                    className: 'swml-back-link muted',
                    style: { marginTop: '16px', display: 'block', textAlign: 'center' },
                    textContent: 'Skip \u2014 paste my own text',
                    onClick: () => selectTask('polishing'),
                }));
            }).catch(() => {
                container.innerHTML = '';
                container.appendChild(el('div', { className: 'swml-setup-hint', textContent: 'Could not load saved work. You can still start polishing.' }));
                container.appendChild(el('button', {
                    className: 'swml-task-btn', style: { maxWidth: '260px', margin: '12px auto', display: 'block' },
                    textContent: 'Start polishing',
                    onClick: () => selectTask('polishing'),
                }));
            });
        });
    }

    // ── EDUQAS Section B Task Selector (Two compulsory tasks) ──
    function renderEduqasSectionBTaskSelect() {
        const tasks = [
            { id: 'B_T1', label: 'Task 1 Only', desc: '20 marks • First persuasive writing task' },
            { id: 'B_T2', label: 'Task 2 Only', desc: '20 marks • Second persuasive writing task' },
            { id: 'B', label: 'Both Tasks', desc: '40 marks • Complete both tasks in order' },
        ];

        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'EDUQAS Section B — Persuasive Writing' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'EDUQAS Section B has two compulsory writing tasks (20 marks each). Which would you like to practise?' }));

            const grid = el('div', { className: 'swml-text-grid' });
            tasks.forEach(t => {
                grid.appendChild(el('button', { className: 'swml-text-btn', onClick: () => {
                    state.questionPart = t.id;
                    renderTaskSelect();
                }}, [
                    el('span', { className: 'icon', textContent: t.id === 'B' ? '📝' : '📢' }),
                    el('span', { className: 'label', textContent: t.label }),
                    el('span', { className: 'desc', textContent: t.desc }),
                ]));
            });
            inner.appendChild(grid);

            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Back', onClick: () => renderPersuasiveWritingBoardSelect() }));
            inner.appendChild(backRow);
        });
    }

    // ── Persuasive Writing Quick-Access Board Selector ──
    function renderPersuasiveWritingBoardSelect() {
        // Maps each board to its language paper that contains persuasive/transactional writing
        const persuasiveBoards = [
            { id: 'aqa', label: 'AQA', subject: 'language2', desc: 'Paper 2 Section B — Q5 (40 marks)' },
            { id: 'ocr', label: 'OCR', subject: 'language2', desc: 'Component 2 Section B (40 marks)' },
            { id: 'eduqas', label: 'EDUQAS', subject: 'language2', desc: 'Component 2 Section B — Two Tasks (40 marks)', hasTasks: true },
            { id: 'edexcel', label: 'Edexcel', subject: 'language2', desc: 'Paper 2 Section B — Q8/Q9 (40 marks)' },
            { id: 'edexcel-igcse', label: 'Edexcel IGCSE', subject: 'language1', desc: 'Paper 1 Section B — Q6 (30 marks)' },
        ];

        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'Persuasive Writing (Creative Non-Fiction)' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Select your exam board so we use the right mark scheme and question format' }));

            const grid = el('div', { className: 'swml-text-grid' });
            persuasiveBoards.forEach(b => {
                grid.appendChild(el('button', { className: 'swml-text-btn', onClick: () => {
                    state.board = b.id;
                    state.subject = b.subject;
                    state.text = b.subject; state.textName = b.label + ' Persuasive Writing';
                    if (b.hasTasks) {
                        renderEduqasSectionBTaskSelect();
                    } else {
                        state.questionPart = 'B';
                        renderTaskSelect();
                    }
                }}, [
                    el('span', { className: 'icon', textContent: '📢' }),
                    el('span', { className: 'label', textContent: b.label }),
                    el('span', { className: 'desc', textContent: b.desc }),
                ]));
            });
            inner.appendChild(grid);

            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Back', onClick: () => renderExamPrepWizard() }));
            inner.appendChild(backRow);
        });
    }

    // ── Exam Prep Wizard ──
    function renderExamPrepWizard() {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            inner.appendChild(el('h2', { textContent: 'Welcome to the Writing Mastery Lab' }));

            if (hasProgrammeAccess) {
                // ── Gold/Platinum: Two pathway cards ──
                inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'How would you like to work today?' }));

                const pathGrid = el('div', { className: 'swml-path-grid' });

                // Card 1: Mastery Programme
                pathGrid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                    state.mode = 'guided';
                    renderBoardSelect('programme');
                }}, [
                    el('span', { className: 'swml-path-icon', textContent: '📚' }),
                    el('span', { className: 'swml-path-title', textContent: 'Mastery Programme' }),
                    el('span', { className: 'swml-path-desc', textContent: 'Continue your structured learning pathway with diagnostics, development essays, and progress tracking' }),
                ]));

                // Card 2: Free Practice
                pathGrid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                    state.mode = 'exam_prep';
                    renderBoardSelect('practice');
                }}, [
                    el('span', { className: 'swml-path-icon', textContent: '🎯' }),
                    el('span', { className: 'swml-path-title', textContent: 'Free Practice' }),
                    el('span', { className: 'swml-path-desc', textContent: 'Practise freely — plan essays, get assessed, polish your writing, or try exam prep tasks' }),
                ]));

                inner.appendChild(pathGrid);

                // Resume + Creative Writing + Persuasive Writing row
                const bottomRow = el('div', { className: 'swml-welcome-bottom' });
                bottomRow.appendChild(el('button', { className: 'swml-welcome-pill', textContent: '▶ Resume Last Task', onClick: () => {
                    apiGet(API.pastSessions).then(res => {
                        if (res?.sessions?.length > 0) resumeSession(res.sessions[0]);
                        else alert('No previous sessions found.');
                    }).catch(() => alert('Could not load past sessions.'));
                }}));
                bottomRow.appendChild(el('button', { className: 'swml-welcome-pill', textContent: '✍️ Creative Writing', onClick: () => {
                    state.board = 'universal'; state.subject = 'creative_writing';
                    state.text = 'creative_writing'; state.textName = 'Creative Writing';
                    state.mode = 'creative'; renderCreativeWritingDashboard();
                }}));
                bottomRow.appendChild(el('button', { className: 'swml-welcome-pill', textContent: '📢 Persuasive Writing', onClick: () => {
                    state.mode = 'exam_prep';
                    renderPersuasiveWritingBoardSelect();
                }}));
                bottomRow.appendChild(el('button', { className: 'swml-welcome-pill', textContent: '📂 Resume Past Work', onClick: () => showPortfolio() }));
                inner.appendChild(bottomRow);

            } else {
                // ── Silver: Straight to board selection (no programme card) ──
                inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Select your exam board to get started' }));
                renderBoardGrid(inner);

                inner.appendChild(el('div', { className: 'swml-setup-separator', innerHTML: '<span>or</span>' }));
                const cwGrid = el('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' } });
                cwGrid.appendChild(el('button', { className: 'swml-text-btn', style: { width: '160px' },
                    onClick: () => {
                        state.board = 'universal'; state.subject = 'creative_writing';
                        state.text = 'creative_writing'; state.textName = 'Creative Writing';
                        state.mode = 'creative'; renderTaskSelect();
                    } }, [el('span', { className: 'icon', textContent: '✍️' }), el('span', { className: 'label', textContent: 'Creative Writing' })]));
                cwGrid.appendChild(el('button', { className: 'swml-text-btn', style: { width: '180px' },
                    onClick: () => {
                        state.mode = 'exam_prep';
                        renderPersuasiveWritingBoardSelect();
                    } }, [el('span', { className: 'icon', textContent: '📢' }), el('span', { className: 'label', textContent: 'Persuasive Writing' })]));
                inner.appendChild(cwGrid);

                inner.appendChild(el('div', { className: 'swml-setup-separator', innerHTML: '<span>or</span>' }));
                inner.appendChild(el('button', { className: 'swml-setup-resume-btn', textContent: '📂 Resume Past Work', onClick: () => showPortfolio() }));
            }

            // Navigation links
            const nav = el('div', { className: 'swml-welcome-nav' });
            if (config.courseResumeUrl) nav.appendChild(el('a', { href: config.courseResumeUrl, className: 'swml-welcome-nav-link', textContent: '← Resume Course' }));
            if (config.dashboardUrl) nav.appendChild(el('a', { href: config.dashboardUrl, className: 'swml-welcome-nav-link', textContent: '📊 My Dashboard' }));
            if (config.libraryUrl) nav.appendChild(el('a', { href: config.libraryUrl, className: 'swml-welcome-nav-link', textContent: '📚 Library' }));
            if (nav.children.length > 0) inner.appendChild(nav);

            // Admin tier testing
            if (config.isAdmin) {
                inner.appendChild(el('div', { className: 'swml-admin-tier-bar', innerHTML: `🔧 Admin: Viewing as <strong>${userTier}</strong> · <a href="?tier_test=free">Free</a> · <a href="?tier_test=silver">Silver</a> · <a href="?tier_test=gold">Gold</a> · <a href="?tier_test=platinum">Platinum</a> · <a href="${window.location.pathname}">Reset</a>` }));
            }
        });
    }

    function renderBoardGrid(container) {
        const grid = el('div', { className: 'swml-text-grid' });
        const activeBoards = ['aqa', 'ocr', 'edexcel', 'eduqas', 'edexcel-igcse', 'sqa', 'ccea', 'cambridge-igcse'];
        [{ id: 'aqa', label: 'AQA' }, { id: 'ocr', label: 'OCR' }, { id: 'edexcel', label: 'Edexcel' }, { id: 'eduqas', label: 'EDUQAS' }, { id: 'edexcel-igcse', label: 'Edexcel IGCSE' }, { id: 'cambridge-igcse', label: 'Cambridge IGCSE' }, { id: 'sqa', label: 'SQA' }, { id: 'ccea', label: 'CCEA' }].forEach(b => {
            const active = activeBoards.includes(b.id);
            const btn = el('button', { className: 'swml-text-btn',
                onClick: active ? () => { state.board = b.id; renderSubjectSelect(); } : null },
                [el('span', { className: 'label', textContent: b.label })]);
            if (!active) { btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    // Board select for both programme and practice paths
    function renderBoardSelect(pathway) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: pathway === 'programme' ? '📚 Mastery Programme' : '🎯 Free Practice' }));
            card.appendChild(el('button', { className: 'swml-back-link', textContent: '← Back', onClick: () => { resetState(); renderExamPrepWizard('back'); } }));
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Select your exam board' }));

            const grid = el('div', { className: 'swml-text-grid' });
            const activeBoards = ['aqa', 'ocr', 'edexcel', 'eduqas', 'edexcel-igcse', 'sqa', 'ccea', 'cambridge-igcse'];
            [{ id: 'aqa', label: 'AQA' }, { id: 'ocr', label: 'OCR' }, { id: 'edexcel', label: 'Edexcel' }, { id: 'eduqas', label: 'EDUQAS' }, { id: 'edexcel-igcse', label: 'Edexcel IGCSE' }, { id: 'cambridge-igcse', label: 'Cambridge IGCSE' }, { id: 'sqa', label: 'SQA' }, { id: 'ccea', label: 'CCEA' }].forEach(b => {
                const active = activeBoards.includes(b.id);
                const btn = el('button', { className: 'swml-text-btn',
                    onClick: active ? () => { state.board = b.id; renderSubjectSelect(); } : null },
                    [el('span', { className: 'label', textContent: b.label })]);
                if (!active) { btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
                grid.appendChild(btn);
            });
            inner.appendChild(grid);
        }, 'forward');
    }

    function renderSubjectSelect(dir) {
        // Clear downstream state — if user is back at subject selection,
        // any previous text/poem picks are stale
        state.text = ''; state.textName = '';
        state.poem = ''; state.poemTitle = ''; state.poemAuthor = ''; state.poemText = '';
        state.questionPart = ''; state.comparisonPoem = ''; state.comparisonPoemTitle = ''; state.comparisonPoemText = '';
        state.topicNumber = 0; state.topicLabel = ''; state.draftType = null; state.phase = null;
        state.canvasTimer = 0; state.canvasTimerLabel = '';

        transitionSetup(inner => {
            inner.appendChild(renderLogo());

            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(el('div', { className: 'swml-context-label', textContent: state.mode === 'guided' ? '📚 Mastery Programme' : state.mode === 'exam_prep' ? '🎯 Free Practice' : 'Selected' }));
            card.appendChild(renderBadges([state.board.toUpperCase()]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change board', onClick: () => hasProgrammeAccess ? renderBoardSelect(state.mode === 'guided' ? 'programme' : 'practice') : renderExamPrepWizard('back') }));
            backRow.appendChild(el('button', { className: 'swml-back-link muted', textContent: '↩ Start over', onClick: () => { resetState(); renderExamPrepWizard(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'What subject area?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Choose your area of study' }));

            const allSubjects = [
                { id: 'shakespeare', label: 'Shakespeare', icon: '🎭' },
                { id: 'modern_text', label: 'Modern Text', icon: '📗' },
                { id: 'modern_prose', label: 'Modern Prose', icon: '📖' },
                { id: 'prose', label: 'Prose (Studied Novel)', icon: '📖' },
                { id: 'critical_reading', label: 'Critical Reading (Critical Essay)', icon: '📝' },
                { id: '19th_century', label: '19th Century Novel', icon: '📜' },
                { id: 'poetry_anthology', label: 'Poetry Anthology', icon: '✒️' },
                { id: 'prose_anthology', label: 'Prose Anthology', icon: '📕' },
                { id: 'nonfiction_anthology', label: 'Non-Fiction Anthology', icon: '📰' },
                { id: 'unseen_poetry', label: 'Unseen Poetry', icon: '📝' },
                { id: 'unseen_prose', label: 'Unseen Prose', icon: '📄' },
                { id: 'language1', label: 'Language Paper 1', icon: '📰' },
                { id: 'language2', label: 'Language Paper 2', icon: '📄' },
            ];
            // Board-specific subject availability
            const boardSubjects = {
                'aqa':            ['shakespeare', 'modern_text', '19th_century', 'poetry_anthology', 'unseen_poetry', 'language1', 'language2'],
                'ocr':            ['shakespeare', '19th_century', 'modern_prose', 'poetry_anthology', 'language1', 'language2'],
                'eduqas':         ['shakespeare', 'modern_text', '19th_century', 'poetry_anthology', 'unseen_poetry', 'language1', 'language2'],
                'edexcel':        ['shakespeare', 'modern_text', '19th_century', 'poetry_anthology', 'unseen_poetry', 'language1', 'language2'],
                'edexcel-igcse':  ['shakespeare', '19th_century', 'modern_text', 'modern_prose', 'poetry_anthology', 'prose_anthology', 'nonfiction_anthology', 'language1', 'language2'],
                'sqa':            ['critical_reading', 'poetry_anthology'],
                'ccea':           ['prose', 'unseen_prose', 'drama', 'poetry_anthology'],
                'cambridge-igcse':['poetry_anthology'],
            };
            const available = boardSubjects[state.board] || [];
            const subjects = allSubjects.filter(s => available.includes(s.id));

            // For Edexcel IGCSE, relabel to Heritage Texts terminology + Modern Drama/Prose split
            if (state.board === 'edexcel-igcse') {
                subjects.forEach(s => {
                    if (s.id === 'shakespeare') s.label = 'Heritage Text — Shakespeare';
                    if (s.id === '19th_century') s.label = 'Heritage Text — 19th Century Novel';
                    if (s.id === 'modern_text') s.label = 'Modern Drama';
                    if (s.id === 'modern_prose') s.label = 'Modern Prose';
                });
            }
            // For EDUQAS, relabel Language Papers to Components
            if (state.board === 'eduqas') {
                subjects.forEach(s => {
                    if (s.id === 'language1') s.label = 'Language Component 1';
                    if (s.id === 'language2') s.label = 'Language Component 2';
                });
            }
            // For OCR, relabel Language Papers to Components
            if (state.board === 'ocr') {
                subjects.forEach(s => {
                    if (s.id === 'language1') s.label = 'Language Component 1';
                    if (s.id === 'language2') s.label = 'Language Component 2';
                });
            }

            const grid = el('div', { className: 'swml-text-grid' });
            subjects.forEach(s => {
                grid.appendChild(el('button', { className: 'swml-text-btn',
                    onClick: () => {
                        state.subject = s.id;
                        const cat = TEXT_CATALOGUE[s.id];
                        // Skip text selection for subjects that don't need it, or for
                        // poetry/prose anthology on boards without specific anthology collections
                        const skipText = (cat && cat.skipTextSelect)
                            || (s.id === 'poetry_anthology' && !POETRY_ANTHOLOGY_BY_BOARD[state.board])
                            || (s.id === 'prose_anthology' && !PROSE_ANTHOLOGY_BY_BOARD[state.board])
                            || (s.id === 'nonfiction_anthology' && !NONFICTION_ANTHOLOGY_BY_BOARD[state.board]);
                        if (skipText) {
                            state.text = s.id;
                            state.textName = s.label;
                            afterTextSelected(); // v7.14.14: route through afterTextSelected so mastery mode shows topic selector
                        } else {
                            renderTextSelect();
                        }
                    } },
                    [el('span', { className: 'icon', textContent: s.icon }), el('span', { className: 'label', textContent: s.label })]));
            });
            inner.appendChild(grid);
        }, dir === 'back' ? 'back' : 'forward');
    }

    // ── Dual-Part Question Selector (EDUQAS Shakespeare Part A/B, Poetry Section A/B) ──
    const DUAL_PART_CONFIG = {
        // Key: board_subject
        'eduqas_poetry_anthology': {
            heading: 'Which section?',
            hint: 'EDUQAS Poetry has two sections. Choose which to work on.',
            options: [
                { id: 'A', label: 'Section A — Single Poem', desc: '15 marks • Analyse your focus poem only' },
                { id: 'B', label: 'Section B — Comparative', desc: '25 marks • Compare two poems' },
                { id: 'both', label: 'Whole Paper', desc: '40 marks • Complete both sections in order' },
            ],
            needsComparisonPoem: true,  // Part B needs comparison poem picker
        },
        'eduqas_shakespeare': {
            heading: 'Which part?',
            hint: 'EDUQAS Shakespeare has two parts. Choose which to work on.',
            options: [
                { id: 'A', label: 'Part A — Extract', desc: '15 marks • Analyse a specific extract' },
                { id: 'B', label: 'Part B — Whole Text', desc: '25 marks • Write about the play as a whole' },
                { id: 'both', label: 'Whole Paper', desc: '40 marks • Complete both parts in order' },
            ],
            needsComparisonPoem: false,
        },
        'edexcel_shakespeare': {
            heading: 'Which question?',
            hint: 'Edexcel Shakespeare has two questions. Choose which to work on.',
            options: [
                { id: 'A', label: 'Question A — Extract', desc: '20 marks • AO2 — Analyse language, form & structure in an extract' },
                { id: 'B', label: 'Question B — Whole Text', desc: '20 marks • AO1 + AO3 — Whole text with context' },
                { id: 'both', label: 'Whole Paper', desc: '40 marks • Complete both questions in order' },
            ],
            needsComparisonPoem: false,
        },
        'aqa_unseen_poetry': {
            heading: 'Which question?',
            hint: 'AQA Unseen Poetry has two questions. Choose which to practise.',
            options: [
                { id: 'A', label: 'Q27.1 — Single Poem', desc: '24 marks • AO1 + AO2 — Analyse one unseen poem' },
                { id: 'B', label: 'Q27.2 — Comparison', desc: '8 marks • AO2 — Compare two poems' },
                { id: 'both', label: 'Whole Section', desc: '32 marks • Complete both questions in order' },
            ],
            needsComparisonPoem: false,
        },
        'ocr_poetry_anthology': {
            heading: 'Which part?',
            hint: 'OCR Poetry has two parts. Choose which to work on.',
            options: [
                { id: 'A', label: 'Part (a) — Comparative', desc: '20 marks • Compare two poems from your cluster (AO1 + AO2)' },
                { id: 'B', label: 'Part (b) — Single Poem', desc: '20 marks • Analyse one poem in detail (AO1 + AO2)' },
                { id: 'both', label: 'Whole Paper', desc: '40 marks • Complete both parts in order' },
            ],
            needsComparisonPoem: false,
        },
        'eduqas_unseen_poetry': {
            heading: 'Which question?',
            hint: 'EDUQAS Unseen Poetry has two questions. Choose which to practise.',
            options: [
                { id: 'A', label: 'Q3.1 — Single Poem', desc: '15 marks • Write about the poem and its effect on you' },
                { id: 'B', label: 'Q3.2 — Comparison', desc: '25 marks • Compare both poems' },
                { id: 'both', label: 'Whole Section', desc: '40 marks • Complete both questions in order' },
            ],
            needsComparisonPoem: false,
        },
        // ── LANGUAGE PAPERS ──
        'aqa_language1': {
            heading: 'What would you like to practise?',
            hint: 'AQA Language Paper 1 has two sections. You can focus on a section, pick a single question, or do the whole paper.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q1-Q4 • Analyse a fiction extract (40 marks)' },
                { id: 'B', label: 'Section B — Creative Writing', desc: 'Q5 • Descriptive or narrative writing (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: '80 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q2', label: 'Q2 — Language Analysis', desc: '8 marks • How does the writer use language?' },
                { id: 'Q3', label: 'Q3 — Structural Analysis', desc: '8 marks • How does the writer structure the text?' },
                { id: 'Q4', label: 'Q4 — Evaluation', desc: '20 marks • To what extent do you agree?' },
                { id: 'Q5', label: 'Q5 — Creative Writing', desc: '40 marks • Descriptive or narrative writing' },
            ],
        },
        'aqa_language2': {
            heading: 'What would you like to practise?',
            hint: 'AQA Language Paper 2 has two sections. You can focus on a section, pick a single question, or do the whole paper.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q1-Q4 • Compare two non-fiction sources (40 marks)' },
                { id: 'B', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: 'Q5 • Write to present a viewpoint (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: '80 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q1', label: 'Q1 — True/False', desc: '4 marks • Identify true statements' },
                { id: 'Q2', label: 'Q2 — Summary', desc: '8 marks • Summarise differences/similarities' },
                { id: 'Q3', label: 'Q3 — Language Analysis', desc: '12 marks • How does the writer use language?' },
                { id: 'Q4', label: 'Q4 — Comparison', desc: '16 marks • Compare how writers convey their perspectives' },
                { id: 'Q5', label: 'Q5 — Persuasive Writing (Creative Non-Fiction)', desc: '40 marks • Write to present a viewpoint' },
            ],
        },
        'ocr_language1': {
            heading: 'What would you like to practise?',
            hint: 'OCR Component 1 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Analyse a fiction extract' },
                { id: 'B', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: 'Write for purpose and audience' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: 'All questions in order' },
            ],
            needsComparisonPoem: false,
        },
        'ocr_language2': {
            heading: 'What would you like to practise?',
            hint: 'OCR Component 2 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Analyse non-fiction texts' },
                { id: 'B', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: 'Write for purpose and audience' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: 'All questions in order' },
            ],
            needsComparisonPoem: false,
        },
        'eduqas_language1': {
            heading: 'What would you like to practise?',
            hint: 'EDUQAS Component 1 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q1-Q5 • Analyse a fiction extract (40 marks)' },
                { id: 'B', label: 'Section B — Creative Writing', desc: 'Creative prose writing (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Component', desc: '80 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q2', label: 'Q2 — Language Analysis', desc: '5 marks • How does the writer use language?' },
                { id: 'Q3', label: 'Q3 — Explanation', desc: '10 marks • What impressions do you get?' },
                { id: 'Q4', label: 'Q4 — Inference & Deduction', desc: '10 marks • How does the writer create effects?' },
                { id: 'Q5', label: 'Q5 — Evaluation', desc: '10 marks • How far do you agree?' },
                { id: 'SB', label: 'Section B — Creative Writing', desc: '40 marks • Narrative or descriptive writing' },
            ],
        },
        'eduqas_language2': {
            heading: 'What would you like to practise?',
            hint: 'EDUQAS Component 2 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q2-Q6 • Analyse two non-fiction sources (40 marks)' },
                { id: 'B', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: 'Write to persuade/argue (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Component', desc: '80 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q2', label: 'Q2 — Language Analysis', desc: '5 marks • How does the writer use language?' },
                { id: 'Q3', label: 'Q3 — Inference', desc: '10 marks • What do you learn from the source?' },
                { id: 'Q4', label: 'Q4 — Language Comparison', desc: '10 marks • Compare language use across both sources' },
                { id: 'Q5', label: 'Q5 — Summary', desc: '5 marks • Summarise from both sources' },
                { id: 'Q6', label: 'Q6 — Comparison', desc: '10 marks • Compare attitudes across both sources' },
                { id: 'B_T1', label: 'Section B — Task 1', desc: '20 marks • First persuasive writing task' },
                { id: 'B_T2', label: 'Section B — Task 2', desc: '20 marks • Second persuasive writing task' },
                { id: 'SB', label: 'Section B — Both Tasks', desc: '40 marks • Both persuasive writing tasks' },
            ],
        },
        'edexcel_language1': {
            heading: 'What would you like to practise?',
            hint: 'Edexcel Language Paper 1 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q2-Q4 • Analyse a fiction extract (24 marks)' },
                { id: 'B', label: 'Section B — Creative Writing', desc: 'Q5 • Imaginative writing (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: '64 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q2', label: 'Q2 — Implicit Information', desc: '2 marks • Identify implicit information (AO1)' },
                { id: 'Q3', label: 'Q3 — Language & Structure', desc: '6 marks • How does the writer use language and structure? (AO2)' },
                { id: 'Q4', label: 'Q4 — Critical Evaluation', desc: '15 marks • To what extent do you agree? (AO4)' },
                { id: 'Q5', label: 'Q5 — Creative Writing', desc: '40 marks • Imaginative writing (AO5/AO6)' },
            ],
        },
        'edexcel_language2': {
            heading: 'What would you like to practise?',
            hint: 'Edexcel Language Paper 2 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q1-Q7 • Analyse two non-fiction sources (24 marks)' },
                { id: 'B', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: 'Q8/Q9 • Write to persuade/argue (40 marks)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: '64 marks • All questions in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q3', label: 'Q3 — Language Analysis', desc: '15 marks • How does the writer use language? (AO2)' },
                { id: 'Q6', label: 'Q6 — Evaluation', desc: '15 marks • To what extent do you agree? (AO4)' },
                { id: 'Q7a', label: 'Q7a — Summary', desc: '6 marks • Summarise from both sources (AO1)' },
                { id: 'Q7b', label: 'Q7b — Comparison', desc: '14 marks • Compare how writers convey perspectives (AO3)' },
                { id: 'SB', label: 'Section B — Persuasive Writing (Creative Non-Fiction)', desc: '40 marks • Write to persuade or argue (AO5/AO6)' },
            ],
        },
        'edexcel-igcse_language1': {
            heading: 'What would you like to practise?',
            hint: 'Edexcel IGCSE Language Paper 1 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Reading', desc: 'Q1-Q5 • Two non-fiction texts (45 marks)' },
                { id: 'B', label: 'Section B — Transactional Writing', desc: 'Choose 1 of 2 tasks • Article, speech, letter, report, leaflet (45 marks, AO4/AO5)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: 'All questions in order (90 marks)' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q4', label: 'Q4 — Language & Structure', desc: '12 marks • Analyse language and structure in the anthology text (AO1/AO2)' },
                { id: 'Q5', label: 'Q5 — Compare Texts', desc: '22 marks • Compare ideas and perspectives across both texts (AO1/AO3)' },
                { id: 'Q6', label: 'Q6 — Transactional Writing', desc: '45 marks • Write to persuade/argue/advise (AO4/AO5)' },
            ],
        },
        'edexcel-igcse_language2': {
            heading: 'What would you like to practise?',
            hint: 'Edexcel IGCSE Language Paper 2 has two sections. Choose how you\'d like to work.',
            options: [
                { id: 'A', label: 'Section A — Analytical Essay', desc: 'Q1 • Analyse one anthology poem or prose text (30 marks, AO1/AO2)' },
                { id: 'B', label: 'Section B — Imaginative Writing', desc: 'Choose 1 of 3 tasks • Descriptive, narrative, or story writing (30 marks, AO4/AO5)' },
                { id: 'individual', label: 'Pick a Question', desc: 'Choose a specific question to practise' },
                { id: 'both', label: 'Whole Paper', desc: '60 marks • Both sections in order' },
            ],
            needsComparisonPoem: false,
            individualQuestions: [
                { id: 'Q1', label: 'Q1 — Analytical Essay', desc: '30 marks • Explore how the writer presents [theme] (AO1/AO2)' },
                { id: 'SB', label: 'Section B — Imaginative Writing', desc: '30 marks • Descriptive, narrative, or story writing (AO4/AO5)' },
            ],
        },
    };

    function getDualPartConfig() {
        return DUAL_PART_CONFIG[`${state.board}_${state.subject}`] || null;
    }

    function needsQuestionPartSelect(taskId) {
        const essayTasks = ['planning', 'assessment', 'polishing'];
        return getDualPartConfig() && essayTasks.includes(taskId) && !state.questionPart;
    }

    function renderQuestionPartSelect(taskId) {
        const config = getDualPartConfig();
        if (!config) { selectTask(taskId); return; }

        // Programme mode: auto-select 'both' (students must do both parts)
        if (state.topicNumber > 0) {
            state.questionPart = 'both';
            if (config.needsComparisonPoem) {
                renderComparisonPoemSelect(taskId);
            } else {
                selectTask(taskId);
            }
            return;
        }

        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            const card = el('div', { className: 'swml-context-card' });
            const isAnthologyWithPick = ['poetry_anthology', 'nonfiction_anthology', 'prose_anthology'].includes(state.subject);
            const contextLabel = isAnthologyWithPick ? (state.poemTitle || state.poem || state.textName || ucfirst(state.text)) : (state.textName || ucfirst(state.text));
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject), contextLabel]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change task', onClick: () => { state.questionPart = ''; renderTaskSelect(); } }));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: config.heading }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: config.hint }));

            const grid = el('div', { className: 'swml-task-grid' });
            config.options.forEach(s => {
                grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                    if (s.id === 'individual' && config.individualQuestions) {
                        // Show individual question sub-picker
                        renderIndividualQuestionPicker(taskId, config);
                    } else {
                        state.questionPart = s.id;
                        if (config.needsComparisonPoem && s.id !== 'A') {
                            renderComparisonPoemSelect(taskId);
                        } else {
                            selectTask(taskId);
                        }
                    }
                }}, [
                    el('span', { className: 'swml-path-title', textContent: s.label }),
                    el('span', { className: 'swml-path-desc', textContent: s.desc }),
                ]));
            });
            inner.appendChild(grid);
        }, 'forward');
    }

    // ── Individual Question Picker (Language Papers) ──
    function renderIndividualQuestionPicker(taskId, config) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            const card = el('div', { className: 'swml-context-card' });
            card.appendChild(renderBadges([state.board.toUpperCase(), ucfirst(state.subject)]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Back to section choice', onClick: () => {
                state.questionPart = '';
                renderQuestionPartSelect(taskId);
            }}));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Which question?' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Choose a specific question to practise.' }));

            const grid = el('div', { className: 'swml-task-grid' });
            config.individualQuestions.forEach(q => {
                grid.appendChild(el('button', { className: 'swml-path-card', onClick: () => {
                    state.questionPart = q.id;
                    selectTask(taskId);
                }}, [
                    el('span', { className: 'swml-path-title', textContent: q.label }),
                    el('span', { className: 'swml-path-desc', textContent: q.desc }),
                ]));
            });
            inner.appendChild(grid);
        }, 'forward');
    }

    // ── Comparison Poem Picker (EDUQAS Section B / Whole Paper) ──
    function renderComparisonPoemSelect(taskId) {
        transitionSetup(inner => {
            inner.appendChild(renderLogo());
            const card = el('div', { className: 'swml-context-card' });
            const sectionLabel = state.questionPart === 'both' ? 'Whole Paper (40 marks)' : 'Section B — Comparative (25 marks)';
            card.appendChild(renderBadges([state.board.toUpperCase(), 'Poetry', sectionLabel]));
            card.appendChild(el('div', { className: 'swml-context-item' }, [
                el('span', { className: 'swml-label', textContent: 'Focus poem' }),
                el('span', { className: 'swml-value', textContent: state.poemTitle || state.poem }),
            ]));
            const backRow = el('div', { className: 'swml-back-row' });
            backRow.appendChild(el('button', { className: 'swml-back-link', textContent: '← Change section', onClick: () => {
                state.questionPart = '';
                state.comparisonPoem = '';
                state.comparisonPoemTitle = '';
                state.comparisonPoemText = '';
                renderQuestionPartSelect(taskId);
            }}));
            card.appendChild(backRow);
            inner.appendChild(card);

            inner.appendChild(el('h2', { textContent: 'Choose your comparison poem' }));
            inner.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Select the second poem to compare with ' + (state.poemTitle || state.poem) }));

            const grid = el('div', { className: 'swml-text-grid' });
            const loading = el('div', { className: 'swml-setup-hint', textContent: 'Loading poems...' });
            inner.appendChild(loading);
            inner.appendChild(grid);

            // Fetch poems and exclude the focus poem
            fetch(`${config.restUrl}poems?board=${state.board}&anthology=${state.text}`, { headers })
                .then(r => r.ok ? r.json() : null)
                .then(res => {
                    loading.remove();
                    const poems = (res?.poems || []).filter(p => p.id !== state.poem);

                    if (poems.length === 0) {
                        // No other poems — fall back to text input
                        grid.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'No other poems in the bank. Type your comparison poem below.' }));
                        const input = el('input', { className: 'swml-text-input', placeholder: 'e.g. London, Tissue, Exposure...',
                            style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
                        grid.appendChild(input);
                        grid.appendChild(el('button', { className: 'swml-task-btn', style: { marginTop: '12px', width: '100%' }, textContent: 'Continue →',
                            onClick: () => {
                                if (input.value.trim()) {
                                    state.comparisonPoem = input.value.trim().toLowerCase().replace(/\s+/g, '_');
                                    state.comparisonPoemTitle = input.value.trim();
                                    selectTask(taskId);
                                }
                            }
                        }));
                        return;
                    }

                    poems.forEach(p => {
                        grid.appendChild(el('button', { className: 'swml-text-btn', onClick: () => {
                            state.comparisonPoem = p.id;
                            state.comparisonPoemTitle = p.title;
                            state.comparisonPoemText = p.poem_text || '';
                            selectTask(taskId);
                        }}, [
                            el('span', { className: 'label', textContent: p.title }),
                            ...(p.poet ? [el('span', { className: 'swml-poem-poet', textContent: p.poet })] : []),
                        ]));
                    });
                })
                .catch(() => {
                    loading.textContent = 'Could not load poems. Type your comparison poem below.';
                    const input = el('input', { placeholder: 'Comparison poem title...',
                        style: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' } });
                    grid.appendChild(input);
                    grid.appendChild(el('button', { className: 'swml-task-btn', style: { marginTop: '12px', width: '100%' }, textContent: 'Continue →',
                        onClick: () => {
                            if (input.value.trim()) {
                                state.comparisonPoem = input.value.trim().toLowerCase().replace(/\s+/g, '_');
                                state.comparisonPoemTitle = input.value.trim();
                                selectTask(taskId);
                            }
                        }
                    }));
                });
        }, 'forward');
    }

    // ══════════════════════════════════════════

    // ── Start Session ──
    async function selectTask(taskId) {
        // EDUQAS poetry: intercept to show Section A/B selector if not yet chosen
        if (needsQuestionPartSelect(taskId)) {
            renderQuestionPartSelect(taskId);
            return;
        }

        state.task = taskId;
        // v7.14.3: Generate exercise ID if not resuming an existing one
        if (!state.exerciseId) {
            state.exerciseId = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).slice(0, 12);
        }
        syncUrl(); // Update URL bar with current task
        allVideosCache = null; // Reset video cache for new task
        videoTooltipShownForStep = 0;
        // Clear any previous session data
        state.chatHistory = [];
        state.plan = {};
        state.step = 1;
        state.sessionId = '';
        state.chatId = '';
        console.log('WML: Session state cleared for new task:', taskId);
        try {
            const res = await apiPost(API.session, {
                mode: state.mode || 'exam_prep', board: state.board, subject: state.subject,
                text: state.text, unit_id: state.unitId, task: state.task,
                type: state.courseType, redraft: state.isRedraft ? '1' : '',
                question: state.question, marks: state.marks, aos: state.aos,
                planning_mode: state.planningMode || '',
                advanced_level: state.advancedLevel || 0,
                essay_timing: state.essayTiming || '',
                model_section: state.modelSection || '',
                // Draft typing (programme mode)
                topic_number: state.topicNumber || 0,
                topic_label: state.topicLabel || '',
                draft_type: state.draftType || '',
                phase: state.phase || '',
                // Poetry poem selection
                poem: state.poem || '',
                poem_title: state.poemTitle || '',
                // EDUQAS poetry section
                question_part: state.questionPart || '',
                comparison_poem: state.comparisonPoem || '',
                comparison_poem_title: state.comparisonPoemTitle || '',
            });
            if (res.session_id) { state.sessionId = res.session_id; state.chatId = res.session_id; }
        } catch (e) { console.warn('Session creation failed:', e); }

        // v7.13.78: exam prep restored to chat — canvas needs dedicated renderer
        // v7.14.33: planning + polishing removed — now canvas-based via EXERCISE_MANIFEST
        const chatTasks = ['assessment', 'exam_question', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice', 'outlining'];
        const exerciseConfig = WML.EXERCISE_MANIFEST?.[taskId] || {};

        // v7.14.36: All canvas environments → renderCanvasWorkspace (training, free, flexible)
        if (['training', 'free', 'flexible'].includes(exerciseConfig.environment)) {
            const root = $('#swml-root');
            root.style.transition = 'opacity 0.3s ease';
            root.style.opacity = '0';
            setTimeout(() => {
                destroyShader();
                state.canvasTimer = 0;
                WML.renderCanvasWorkspace();
                root.style.opacity = '1';
            }, 300);
        } else if (chatTasks.includes(taskId)) {
            const root = $('#swml-root');
            root.style.transition = 'opacity 0.3s ease';
            root.style.opacity = '0';
            setTimeout(() => {
                destroyShader();
                renderWorkspace();
                root.style.opacity = '1';
                sendInitialMessage();
            }, 300);
        }
    }

    // ══════════════════════════════════════════
    //  PLANNING WORKSPACE
    // ══════════════════════════════════════════
    function renderWorkspace() {
        const root = $('#swml-root');
        root.innerHTML = '';
        const ws = el('div', { className: 'swml-workspace' });

        // ── Sidebar (collapsible) ──
        const sb = el('div', { className: 'swml-sidebar', id: 'swml-sidebar' });
        const sbHead = el('div', { className: 'swml-sidebar-head' });
        sbHead.appendChild(renderLogo());
        sbHead.appendChild(el('button', { className: 'swml-collapse-btn', textContent: '◀', title: 'Collapse sidebar', onClick: () => togglePanel('sidebar') }));
        sb.appendChild(sbHead);

        const sbBody = el('div', { className: 'swml-sidebar-body', id: 'swml-sidebar-body' });

        const badges = el('div', { className: 'swml-sidebar-badges' });
        const badgeItems = state.board === 'universal'
            ? ['Creative Writing']
            : [state.board.toUpperCase(), ucfirst(state.subject), ucfirst(state.text)].filter(Boolean);
        badgeItems.forEach(b =>
            badges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: b })));
        // Topic / mode badge
        if (state.topicNumber && state.mode === 'guided') {
            badges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: `Topic ${state.topicNumber}` }));
        } else if (state.mode === 'exam_prep') {
            badges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Exam Practice' }));
        } else if (!state.topicNumber && state.mode !== 'guided') {
            badges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Free Practice' }));
        }
        const modeLabel = state.task === 'essay_plan' && state.planningMode ? { A: 'Recall', B: 'Guided', C: 'Instant' }[state.planningMode] : '';
        const maMode = state.task === 'model_answer' ? (state.planningMode === 'C' ? `Advanced · L${state.advancedLevel || 1}` : state.planningMode === 'A' ? 'Coached' : 'Instant') : '';
        const taskLabels = { planning: 'Essay Skills', assessment: 'Assessment', polishing: 'Polishing', exam_question: 'Exam Question', essay_plan: modeLabel ? `Essay Plan · ${modeLabel}` : 'Exam Essay Plan', model_answer: maMode ? `Model Answer · ${maMode}` : 'Model Answer', verbal_rehearsal: 'Quote Analysis', conceptual_notes: 'Conceptual Notes', memory_practice: 'Memory Practice' };
        badges.appendChild(el('span', { className: 'swml-sidebar-badge active', textContent: taskLabels[state.task] || ucfirst(state.task) }));
        if (state.isRedraft) badges.appendChild(el('span', { className: 'swml-sidebar-badge active', textContent: 'Redraft' }));
        sbBody.appendChild(badges);

        sbBody.appendChild(el('div', { className: 'swml-sidebar-section-label', textContent: 'Protocol Progress' }));
        const steps = el('div', { id: 'swml-progress-steps' });
        getSteps().forEach(s => {
            const c = s.step < state.step ? 'complete' : s.step === state.step ? 'active' : '';
            steps.appendChild(el('div', { className: `swml-step ${c}`, 'data-step': s.step }, [
                el('div', { className: `swml-step-circle ${c}`, textContent: s.step < state.step ? '✓' : s.step }),
                el('span', { className: 'swml-step-label', textContent: s.label }),
            ]));
        });
        sbBody.appendChild(steps);

        const textSlug = (state.text || '').replace(/_/g, '-');
        const libraryUrl = textSlug
            ? `/library/texts/${textSlug}/`
            : `/library/`;
        sbBody.appendChild(el('button', { className: 'swml-sidebar-btn video-btn', id: 'swml-video-btn', innerHTML: SVG_VIDEO + ' Video Lessons', onClick: showVideoPanel }));
        sbBody.appendChild(el('button', { className: 'swml-sidebar-btn resources', innerHTML: SVG_LIBRARY + ' Library & Resources', onClick: () => window.open(libraryUrl, '_blank') }));

        // Past work button
        sbBody.appendChild(el('button', { className: 'swml-sidebar-btn', innerHTML: SVG_FOLDER + ' Past Work', style: { marginTop: '8px' },
            onClick: showPortfolio }));

        // Dashboard button
        sbBody.appendChild(el('button', { className: 'swml-sidebar-btn', innerHTML: SVG_DASHBOARD + ' My Dashboard', style: { marginTop: '6px' },
            onClick: () => { window.open('/dashboard/', '_blank'); } }));

        const spacer = el('div', { style: { marginTop: 'auto' } });
        spacer.appendChild(el('button', { className: 'swml-sidebar-btn', innerHTML: SVG_BACK + ' Back to Start',
            onClick: () => showConfirm('Return to setup? Your progress is saved.', () => {
                state.requestId++;
                if (window.wmlVideo?.isOpen()) wmlVideo.close();
                const root = $('#swml-root');
                root.style.transition = 'opacity 0.3s ease';
                root.style.opacity = '0';
                setTimeout(() => {
                    destroyShader(); shaderInitialized = false;
                    resetState();
                    state.chatHistory = []; state.plan = {}; state.sessionId = ''; state.chatId = '';
                    renderSetup();
                    root.style.opacity = '1';
                }, 300);
            }) }));
        spacer.appendChild(el('button', { className: 'swml-sidebar-btn', innerHTML: SVG_BACK + ' Resume Course', style: { marginTop: '6px' },
            onClick: () => showConfirm('Leave WML and return to your course?', () => {
                    if (config.courseResumeUrl) {
                        window.location.href = config.courseResumeUrl;
                    } else if (state.referrer && state.referrer !== window.location.href) {
                        window.location.href = state.referrer;
                    } else {
                        window.location.href = '/courses/';
                    }
                }) }));
        sbBody.appendChild(spacer);
        sb.appendChild(sbBody);
        ws.appendChild(sb);

        // ── Chat ──
        const cp = el('div', { className: 'swml-chat-panel' });
        const ch = el('div', { className: 'swml-panel-header' });
        const essayPlanTitle = state.planningMode ? `📋 Essay Plan · ${{ A: 'Recall', B: 'Guided', C: 'Instant' }[state.planningMode]}` : '📋 Essay Plan Builder';
        const modelTitle = state.planningMode ? `📄 Model Answer · ${state.planningMode === 'C' ? `Advanced L${state.advancedLevel || 1}` : state.planningMode === 'A' ? 'Coached' : 'Instant'}` : '📄 Model Answer';
        const chatTitles = { assessment: '📊 Essay Assessment', polishing: '✨ Writing Polish', exam_question: '✏️ Exam Question Creator', essay_plan: essayPlanTitle, model_answer: modelTitle, verbal_rehearsal: '🎙️ Random Quote Analysis', conceptual_notes: '📚 Conceptual Notes', memory_practice: SVG_BRAIN + ' Memory Practice' };
        const titleEl = el('div', { className: 'swml-panel-title' });
        titleEl.innerHTML = chatTitles[state.task] || (SVG_SOCRATIC + ' Socratic Conversation');
        ch.appendChild(titleEl);
        const headerRight = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
        // Jhey moon/sun theme toggle
        const themeToggleBtn = createThemeToggleBtn('swml-theme-toggle');
        headerRight.appendChild(themeToggleBtn);
        headerRight.appendChild(el('button', { className: 'swml-save-btn', id: 'swml-save-btn', innerHTML: SVG_SAVE + ' Save', title: 'Save session', onClick: manualSave }));
        headerRight.appendChild(el('div', { className: 'swml-panel-meta', id: 'swml-step-indicator', textContent: `Section 1 of ${getSteps().length} · ${getSteps()[0]?.label || 'Setup'}` }));
        ch.appendChild(headerRight);
        cp.appendChild(ch);

        cp.appendChild(el('div', { className: 'swml-chat-messages', id: 'swml-messages' }));

        const ia = el('div', { className: 'swml-chat-input' });
        const ii = el('div', { className: 'swml-chat-input-inner' });
        const textarea = el('textarea', { id: 'swml-input', placeholder: 'Type your response...', rows: 1,
            onKeydown: (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // If multi-select has selections, click its submit button (v7.12.53)
                    const multiSubmit = document.querySelector('.swml-quick-submit:not([disabled])');
                    if (multiSubmit && !textarea.value?.trim()) { multiSubmit.click(); return; }
                    // If mic is recording, stop it and submit after final transcript arrives (v7.12.54)
                    if (isListening && recognition) {
                        recognition.stop();
                        setTimeout(() => sendMessage(), 250);
                        return;
                    }
                    sendMessage();
                }
            },
            onInput: (e) => {
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            },
            onPaste: (e) => {
                // Allow paste to preserve line breaks naturally in textarea
                setTimeout(() => {
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
                }, 0);
            }
        });
        ii.appendChild(textarea);
        // File upload button
        const fileInput = el('input', { type: 'file', id: 'swml-file-input', accept: 'image/*,.pdf,.doc,.docx,.txt', style: { display: 'none' },
            onChange: (e) => handleFileUpload(e.target.files) });
        ii.appendChild(fileInput);
        ii.appendChild(el('button', { className: 'swml-upload-btn', innerHTML: SVG_ATTACH, title: 'Upload file (image, PDF, document)',
            onClick: () => fileInput.click() }));
        ii.appendChild(el('button', { className: 'swml-mic-btn', id: 'swml-mic-btn', innerHTML: SVG_MIC, title: 'Voice input', onClick: toggleVoice }));
        ii.appendChild(el('button', { className: 'swml-send-btn', id: 'swml-send-btn', innerHTML: SVG_SEND, onClick: sendMessage }));
        const iw = el('div', { className: 'swml-chat-input-wrapper' });
        iw.appendChild(ii);
        ia.appendChild(iw);
        cp.appendChild(ia);
        ws.appendChild(cp);

        // ── Resize Handle ──
        const rh = el('div', { className: 'swml-resize-handle', title: 'Drag to resize' });
        rh.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const pp = $('#swml-plan-panel');
            if (!pp || pp.classList.contains('collapsed')) return;
            const startX = e.clientX;
            const startW = pp.offsetWidth;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            const onMove = (ev) => {
                const diff = startX - ev.clientX;
                const newW = Math.min(600, Math.max(200, startW + diff));
                pp.style.width = newW + 'px';
            };
            const onUp = () => {
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        ws.appendChild(rh);

        // ── Plan Panel (collapsible) ──
        const pp = el('div', { className: 'swml-plan-panel', id: 'swml-plan-panel' });
        const ph = el('div', { className: 'swml-panel-header' });
        ph.appendChild(el('button', { className: 'swml-collapse-btn right', textContent: '▶', title: 'Collapse plan', onClick: () => togglePanel('plan') }));
        const panelTitleText = state.task === 'assessment' ? '📊 Assessment Results' : state.task === 'polishing' ? '✨ Polish Tracker' : state.task === 'exam_question' ? '✏️ Question Builder' : state.task === 'essay_plan' ? '📋 Essay Plan' : state.task === 'model_answer' ? '📄 Model Answer' : state.task === 'verbal_rehearsal' ? '🎙️ Quote Analysis' : state.task === 'conceptual_notes' ? '📚 Section Progress' : state.task === 'memory_practice' ? ' Memory Tracker' : '📋 Your Essay Plan';
        const panelTitleEl = el('div', { className: 'swml-panel-title' });
        panelTitleEl.innerHTML = (state.task === 'memory_practice' ? SVG_BRAIN : '') + panelTitleText;
        ph.appendChild(panelTitleEl);
        pp.appendChild(ph);
        pp.appendChild(el('div', { className: 'swml-plan-content', id: 'swml-plan-content' }));
        ws.appendChild(pp);

        // ── Mobile toggle buttons (hidden on desktop via CSS) ──
        const mobileToggles = el('div', { className: 'swml-mobile-toggles' });
        mobileToggles.appendChild(el('button', { className: 'swml-mobile-toggle', textContent: '☰ Menu',
            onClick: () => toggleMobilePanel('sidebar') }));
        mobileToggles.appendChild(el('button', { className: 'swml-mobile-toggle', textContent: '📋 Plan',
            onClick: () => toggleMobilePanel('plan') }));
        ws.appendChild(mobileToggles);

        root.appendChild(ws);
        applyTheme(getTheme());
        renderPlan();
        setupSelectionReply();
    }

    /** 
     * Selection Toolbar: highlight text in AI messages → floating toolbar with Reply, Insert, Copy, Add to Notes.
     */
    function setupSelectionReply() {
        let toolbar = null;

        function removeToolbar() {
            if (toolbar) { toolbar.remove(); toolbar = null; }
        }

        document.addEventListener('mouseup', (e) => {
            // Small delay to let selection finalise
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel || sel.isCollapsed || !sel.toString().trim()) { removeToolbar(); return; }

                // Check selection is inside an AI message bubble
                const anchor = sel.anchorNode;
                const msgEl = anchor?.parentElement?.closest?.('.swml-bubble.ai');
                const msgs = $('#swml-messages');
                if (!msgEl || !msgs?.contains(msgEl)) { removeToolbar(); return; }

                const selectedText = sel.toString().trim();
                if (selectedText.length < 2 || selectedText.length > 2000) { removeToolbar(); return; }

                // Position the toolbar near the selection
                removeToolbar();
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const msgsRect = msgs.getBoundingClientRect();

                toolbar = el('div', { className: 'swml-selection-toolbar' });

                // Truncate for display
                const quote = selectedText.length > 120 
                    ? selectedText.substring(0, 120) + '...' 
                    : selectedText;

                // 1. Reply — "Regarding '...' —"
                toolbar.appendChild(el('button', {
                    className: 'swml-sel-btn',
                    innerHTML: SVG_SEL_REPLY + ' <span>Reply</span>',
                    title: 'Reply to this text',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        const input = $('#swml-input');
                        if (input) {
                            input.value = `Regarding "${quote}" — `;
                            input.focus();
                            input.setSelectionRange(input.value.length, input.value.length);
                            input.style.height = 'auto';
                            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
                        }
                        removeToolbar(); sel.removeAllRanges();
                    }
                }));

                // 2. Insert — paste raw text into input
                toolbar.appendChild(el('button', {
                    className: 'swml-sel-btn',
                    innerHTML: SVG_SEL_INSERT + ' <span>Insert</span>',
                    title: 'Add text to input',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        const input = $('#swml-input');
                        if (input) {
                            const existing = input.value;
                            input.value = existing + (existing && !existing.endsWith(' ') ? ' ' : '') + selectedText;
                            input.focus();
                            input.setSelectionRange(input.value.length, input.value.length);
                            input.style.height = 'auto';
                            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
                        }
                        removeToolbar(); sel.removeAllRanges();
                    }
                }));

                // 3. Copy — clipboard
                toolbar.appendChild(el('button', {
                    className: 'swml-sel-btn',
                    innerHTML: SVG_SEL_COPY + ' <span>Copy</span>',
                    title: 'Copy to clipboard',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        navigator.clipboard.writeText(selectedText).then(() => {
                            showToast(SVG_SEL_COPY + ' <strong>Copied!</strong> Text copied to clipboard.', 4000, true);
                        }).catch(() => {
                            const ta = document.createElement('textarea');
                            ta.value = selectedText; document.body.appendChild(ta);
                            ta.select(); document.execCommand('copy'); ta.remove();
                            showToast(SVG_SEL_COPY + ' <strong>Copied!</strong> Text copied to clipboard.', 4000, true);
                        });
                        removeToolbar(); sel.removeAllRanges();
                    }
                }));

                // 4. Add to Notes — POST to Sophicly Notes REST API
                toolbar.appendChild(el('button', {
                    className: 'swml-sel-btn swml-sel-notes',
                    innerHTML: SVG_SEL_NOTE + ' <span>Note</span>',
                    title: 'Save to your notes',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        sendToNotes(selectedText);
                        removeToolbar(); sel.removeAllRanges();
                    }
                }));

                // Position relative to the messages container
                toolbar.style.top = (rect.top - msgsRect.top + msgs.scrollTop - 40) + 'px';
                toolbar.style.left = Math.max(0, (rect.left - msgsRect.left + rect.width / 2 - 100)) + 'px';
                msgs.appendChild(toolbar);
            }, 10);
        });

        // Remove on click elsewhere or scroll
        document.addEventListener('mousedown', (e) => {
            if (toolbar && !toolbar.contains(e.target)) removeToolbar();
        });
        const msgs = $('#swml-messages');
        if (msgs) msgs.addEventListener('scroll', removeToolbar);
    }

    // ── Sophicly Notes Integration ──
    // Opens the Sophicly Notes panel and saves text via REST API with full WML context
    function sendToNotes(text) {
        // Build WML context string (e.g. "Assessment · Step 3" or "Planning · Step 5")
        const taskLabels = { planning: 'Planning', assessment: 'Assessment', polishing: 'Polishing', essay_plan: 'Essay Plan', model_answer: 'Model Answer', verbal_rehearsal: 'Quote Analysis', conceptual_notes: 'Conceptual Notes', memory_practice: 'Memory Practice', exam_question: 'Exam Question' };
        const taskLabel = taskLabels[state.task] || ucfirst(state.task || 'Session');
        const wmlContext = state.step ? `${taskLabel} · Step ${state.step}` : taskLabel;

        // Preferred path: use the Notes plugin's global API (v2.0.3+)
        if (window.sophiclyNotesAPI && typeof window.sophiclyNotesAPI.createNote === 'function') {
            window.sophiclyNotesAPI.open();
            window.sophiclyNotesAPI.createNote({
                content: text,
                source: 'wml',
                text_name: state.textName || ucfirst(state.text || ''),
                board: (state.board || '').toUpperCase(),
                wml_context: wmlContext,
                page_title: 'Writing Mastery Lab',
                page_url: window.location.href
            }).then(() => {
                showToast(SVG_SEL_NOTE + ' <strong>Saved to notes</strong> — tagged as WML · ' + taskLabel, 4000, true);
            }).catch(() => {
                showToast('Could not save note — please try again.', 5000, true);
            });
            return;
        }

        // Fallback: POST directly to the Notes REST endpoint
        const notesUrl = config.wpRestUrl ? config.wpRestUrl + 'sophicly/v1/notes' : null;
        if (notesUrl) {
            fetch(notesUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
                body: JSON.stringify({
                    content: text,
                    source: 'wml',
                    text_name: state.textName || ucfirst(state.text || ''),
                    board: (state.board || '').toUpperCase(),
                    wml_context: wmlContext,
                    page_title: 'Writing Mastery Lab',
                    page_url: window.location.href
                })
            }).then(r => {
                if (!r.ok) throw new Error('API ' + r.status);
                return r.json();
            }).then(() => {
                // Open the notes panel so the student can see it
                const snTrigger = document.getElementById('snTabTrigger');
                const snPanel = document.querySelector('.sn-panel');
                if (snPanel && !snPanel.classList.contains('sn-open') && snTrigger) snTrigger.click();
                // Refresh the notes list if the global API became available after our check
                if (window.sophiclyNotesAPI) window.sophiclyNotesAPI.refreshList();
                showToast(SVG_SEL_NOTE + ' <strong>Saved to notes</strong> — tagged as WML · ' + taskLabel, 4000, true);
            }).catch(() => {
                showToast('Could not save note — please try again.', 5000, true);
            });
            return;
        }

        // Last resort: paste into the notes editor textarea (no context tagging)
        const snInput = document.getElementById('snInput');
        if (!snInput) {
            showToast('Notes plugin not available on this page.', 5000, true);
            return;
        }
        const snTrigger = document.getElementById('snTabTrigger');
        const snPanel = document.querySelector('.sn-panel');
        if (snPanel && !snPanel.classList.contains('sn-open') && snTrigger) snTrigger.click();
        setTimeout(() => {
            const existing = snInput.value;
            const separator = existing && !existing.endsWith('\n') ? '\n\n' : '';
            snInput.value = existing + separator + text;
            snInput.focus();
            snInput.setSelectionRange(snInput.value.length, snInput.value.length);
            snInput.dispatchEvent(new Event('input', { bubbles: true }));
            showToast(SVG_SEL_NOTE + ' <strong>Added to notes editor</strong> — review and save when ready.', 5000, true);
        }, 350);
    }

    // ── Panel collapse/expand ──
    function toggleMobilePanel(panel) {
        const sb = $('#swml-sidebar');
        const pp = $('#swml-plan-panel');
        const existing = $('.swml-mobile-backdrop');

        if (panel === 'sidebar') {
            const isOpen = sb?.classList.contains('mobile-open');
            sb?.classList.toggle('mobile-open');
            pp?.classList.remove('mobile-open');
            if (!isOpen && !existing) addMobileBackdrop();
            else if (isOpen && existing) existing.remove();
        } else if (panel === 'plan') {
            const isOpen = pp?.classList.contains('mobile-open');
            pp?.classList.toggle('mobile-open');
            sb?.classList.remove('mobile-open');
            if (!isOpen && !existing) addMobileBackdrop();
            else if (isOpen && existing) existing.remove();
        }
    }

    function addMobileBackdrop() {
        const backdrop = el('div', { className: 'swml-mobile-backdrop', onClick: () => {
            $('#swml-sidebar')?.classList.remove('mobile-open');
            $('#swml-plan-panel')?.classList.remove('mobile-open');
            backdrop.remove();
        }});
        const ws = $('.swml-workspace');
        if (ws) ws.appendChild(backdrop);
    }

    function togglePanel(panel) {
        if (panel === 'sidebar') {
            const sb = $('#swml-sidebar');
            const btn = sb.querySelector('.swml-collapse-btn');
            sb.classList.toggle('collapsed');
            const isCollapsed = sb.classList.contains('collapsed');
            btn.textContent = isCollapsed ? '▶' : '◀';
            btn.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
        } else if (panel === 'plan') {
            const pp = $('#swml-plan-panel');
            const rh = $('.swml-resize-handle');
            const btn = pp.querySelector('.swml-collapse-btn');
            pp.classList.toggle('collapsed');
            const isCollapsed = pp.classList.contains('collapsed');
            // Clear any inline width from resize drag so CSS class takes effect
            if (isCollapsed) {
                pp.dataset.prevWidth = pp.style.width || '';
                pp.style.width = '';
            } else {
                if (pp.dataset.prevWidth) pp.style.width = pp.dataset.prevWidth;
            }
            // Hide/show resize handle
            if (rh) rh.style.display = isCollapsed ? 'none' : '';
            btn.textContent = isCollapsed ? '◀' : '▶';
            btn.title = isCollapsed ? 'Expand plan' : 'Collapse plan';
        }
    }

    let _lastPlanSnapshot = '';
    function renderPlan() {
        const c = $('#swml-plan-content');
        if (!c) return;
        // Dirty check: only re-render if plan data actually changed
        const snapshot = JSON.stringify(state.plan);
        if (snapshot === _lastPlanSnapshot) return;
        _lastPlanSnapshot = snapshot;
        c.innerHTML = '';

        if (state.task === 'assessment') {
            renderAssessmentPanel(c);
        } else if (state.task === 'polishing') {
            renderPolishingPanel(c);
        } else if (state.task === 'exam_question') {
            renderExamQuestionPanel(c);
        } else if (state.task === 'verbal_rehearsal') {
            renderQuoteAnalysisPanel(c);
        } else if (state.task === 'conceptual_notes') {
            renderConceptualNotesPanel(c);
        } else if (state.task === 'memory_practice') {
            renderMemoryPracticePanel(c);
        } else {
            renderPlanningPanel(c);
        }
    }

    function renderAssessmentPanel(c) {
        // ── Focus section ──
        const focusElems = ['question_text', 'goal'];
        const focusHas = focusElems.some(e => state.plan[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${focusHas ? '' : 'pending'}`, textContent: 'Session Focus' }));
        focusElems.forEach(t => c.appendChild(renderPlanElement(t)));

        // ── AO Scores section ──
        const scoreElems = ['ao1_score', 'ao2_score', 'ao3_score', 'ao4_score', 'total_score', 'grade'];
        const scoresHas = scoreElems.some(e => state.plan[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${scoresHas ? '' : 'pending'}`, textContent: 'AO Scores' }));
        scoreElems.forEach(t => c.appendChild(renderPlanElement(t)));

        // ── Feedback section ──
        const fbElems = ['strength_1', 'target_1', 'target_2'];
        const fbHas = fbElems.some(e => state.plan[e]);
        const fbHeader = el('div', { className: `swml-plan-section-title ${fbHas ? '' : 'pending'}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
        fbHeader.appendChild(document.createTextNode('Feedback'));
        fbHeader.appendChild(el('button', { className: 'swml-copy-btn', textContent: 'Copy Results', onClick: copyPlan }));
        c.appendChild(fbHeader);
        fbElems.forEach(t => c.appendChild(renderPlanElement(t)));
    }

    function renderPolishingPanel(c) {
        // ── Focus section ──
        const focusElems = ['question_text', 'current_level', 'target_level', 'polish_focus'];
        const focusHas = focusElems.some(e => state.plan[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${focusHas ? '' : 'pending'}`, textContent: 'Polish Focus' }));
        focusElems.forEach(t => c.appendChild(renderPlanElement(t)));

        // ── Revisions section ──
        const revElems = ['revision_1', 'revision_2', 'revision_3'];
        const revHas = revElems.some(e => state.plan[e]);
        const revHeader = el('div', { className: `swml-plan-section-title ${revHas ? '' : 'pending'}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
        revHeader.appendChild(document.createTextNode('Revisions'));
        revHeader.appendChild(el('button', { className: 'swml-copy-btn', textContent: 'Copy Progress', onClick: copyPlan }));
        c.appendChild(revHeader);
        revElems.forEach(t => c.appendChild(renderPlanElement(t)));
    }

    function renderExamQuestionPanel(c) {
        // ── Focus section ──
        const focusElems = ['question_text', 'goal'];
        const focusHas = focusElems.some(e => state.plan[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${focusHas ? '' : 'pending'}`, textContent: 'Question Focus' }));
        focusElems.forEach(t => c.appendChild(renderPlanElement(t)));

        // ── Generated Questions — rendered dynamically from chat history ──
        const questions = collectAllQuestions();
        const qHeader = el('div', { className: `swml-plan-section-title ${questions.length > 0 ? '' : 'pending'}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
        qHeader.appendChild(document.createTextNode(questions.length > 0 ? `Generated Questions (${questions.length})` : 'Generated Question'));
        qHeader.appendChild(el('button', { className: 'swml-copy-btn', textContent: questions.length > 1 ? 'Copy All' : 'Copy Question', onClick: copyPlan }));
        c.appendChild(qHeader);

        if (questions.length === 0) {
            c.appendChild(el('div', { className: 'swml-plan-element' },
                [el('div', { className: 'swml-plan-element-empty', textContent: 'Awaiting...' })]));
        } else {
            questions.forEach((q, idx) => {
                const qEl = el('div', { className: 'swml-plan-element complete' });
                const label = el('div', { className: 'swml-plan-element-label-row' });
                label.appendChild(el('span', { className: 'swml-plan-element-label', textContent: `✓ Question ${idx + 1}` }));
                qEl.appendChild(label);
                if (q.theme) {
                    qEl.appendChild(el('div', { className: 'swml-plan-element-content', style: { fontSize: '11px', opacity: '0.7', marginBottom: '2px' }, textContent: `Theme: ${q.theme}` }));
                }
                if (q.location) {
                    qEl.appendChild(el('div', { className: 'swml-plan-element-content', style: { fontSize: '11px', opacity: '0.5', marginBottom: '4px', fontStyle: 'italic' }, textContent: `📍 ${q.location}` }));
                }
                qEl.appendChild(el('div', { className: 'swml-plan-element-content', textContent: q.summary }));
                c.appendChild(qEl);
            });
        }
    }

    function renderQuoteAnalysisPanel(c) {
        const p = state.plan;

        // Task-specific element types with legacy fallback
        const sections = [
            { key: 'qa_quote',              legacy: 'question_text', title: 'Random Quote', label: ' ' },
            { key: 'qa_student_plan',       legacy: 'body_para_1',   title: "Student's Plan", label: ' ' },
            { key: 'qa_student_paragraph',  legacy: 'body_para_2',   title: "Student's Paragraph", label: ' ' },
            { key: 'qa_ai_plan',            legacy: 'body_para_3',   title: 'AI Plan (Grade 9)', label: ' ' },
            { key: 'qa_ai_paragraph',       legacy: 'introduction',  title: 'AI Paragraph (Grade 9)', label: ' ' },
        ];
        sections.forEach(s => {
            const has = !!(p[s.key] || p[s.legacy]);
            c.appendChild(el('div', { className: `swml-plan-section-title ${has ? '' : 'pending'}`, textContent: s.title }));
            const effectiveKey = p[s.key] ? s.key : (p[s.legacy] ? s.legacy : s.key);
            c.appendChild(renderPlanElement(effectiveKey, false, s.label));
        });
    }

    function renderConceptualNotesPanel(c) {
        const p = state.plan;
        const poetry = isPoetrySubject();
        const nonfiction = isNonfictionSubject();

        // Sections adapt for poetry vs nonfiction vs literature
        const sections = nonfiction ? [
            { key: 'nfcn_section_1', title: 'S1 Writer\'s Voice', label: ' ' },
            { key: 'nfcn_section_2', title: 'S2 Context', label: ' ' },
            { key: 'nfcn_section_3', title: 'S3 Structure', label: ' ' },
            { key: 'nfcn_section_4', title: 'S4 Text Type & Form', label: ' ' },
            { key: 'nfcn_section_5', title: 'S5 Techniques', label: ' ' },
            { key: 'nfcn_section_6', title: 'S6 Themes & Ideas', label: ' ' },
            { key: 'nfcn_section_7', title: 'S7 Writer\'s Purpose', label: ' ' },
            { key: 'nfcn_section_8', title: 'S8 The Big Message', label: ' ' },
        ] : poetry ? [
            { key: 'cn_section_1', title: 'S1 Speaker Understanding', label: ' ' },
            { key: 'cn_section_2', title: 'S2 Historical Context', label: ' ' },
            { key: 'cn_section_3', title: 'S3 Form', label: ' ' },
            { key: 'cn_section_4', title: 'S4 Structure & Language', label: ' ' },
            { key: 'cn_section_5', title: 'S5 Themes', label: ' ' },
            { key: 'cn_section_6', title: 'S6 Poet\'s Purpose', label: ' ' },
            { key: 'cn_section_7', title: 'S7 The Big Message', label: ' ' },
        ] : [
            { key: 'cn_section_1', title: 'S1 Protagonist Understanding', label: ' ' },
            { key: 'cn_section_2', title: 'S2 Historical Context', label: ' ' },
            { key: 'cn_section_3', title: 'S3 Plot Structure', label: ' ' },
            { key: 'cn_section_4', title: 'S4 Genre & Emotion', label: ' ' },
            { key: 'cn_section_5', title: 'S5 Themes', label: ' ' },
            { key: 'cn_section_6', title: 'S6 Author\'s Purpose', label: ' ' },
            { key: 'cn_section_7', title: 'S7 The Big Message', label: ' ' },
        ];
        // Also check legacy keys (body_para_1 etc.) for backward compatibility with existing sessions
        const legacyMap = {
            cn_section_1: 'body_para_1', cn_section_2: 'body_para_2', cn_section_3: 'body_para_3',
            cn_section_4: 'conclusion', cn_section_5: 'keywords', cn_section_6: 'goal', cn_section_7: 'introduction'
        };
        sections.forEach(s => {
            const has = !!(p[s.key] || p[legacyMap[s.key]]);
            c.appendChild(el('div', { className: `swml-plan-section-title ${has ? '' : 'pending'}`, textContent: s.title }));
            // Render from new key first, fall back to legacy
            const effectiveKey = p[s.key] ? s.key : (p[legacyMap[s.key]] ? legacyMap[s.key] : s.key);
            c.appendChild(renderPlanElement(effectiveKey, false, s.label));
        });
    }

    function renderMemoryPracticePanel(c) {
        const p = state.plan;

        // ── Setup section ──
        const setupElems = ['mp_writing_type', 'mp_grade_claim', 'mp_quality_gate', 'mp_gate_targets'];
        const setupHas = setupElems.some(e => p[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${setupHas ? '' : 'pending'}`, textContent: 'Setup & Quality Gate' }));
        setupElems.forEach(t => c.appendChild(renderPlanElement(t, false, t === 'mp_writing_type' ? 'Writing Type' : t === 'mp_grade_claim' ? 'Grade Claim' : t === 'mp_quality_gate' ? 'Quality Gate' : 'Improvement Targets')));

        // ── Exercise section ──
        const exerciseElems = ['mp_mode'];
        const exerciseHas = exerciseElems.some(e => p[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${exerciseHas ? '' : 'pending'}`, textContent: 'Exercise' }));
        exerciseElems.forEach(t => c.appendChild(renderPlanElement(t, false, 'Mode')));

        // ── Results section ──
        const resultElems = ['mp_score', 'mp_recommendation'];
        const resultHas = resultElems.some(e => p[e]);
        const resultHeader = el('div', { className: `swml-plan-section-title ${resultHas ? '' : 'pending'}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
        resultHeader.appendChild(document.createTextNode('Results'));
        resultHeader.appendChild(el('button', { className: 'swml-copy-btn', textContent: 'Copy Results', onClick: copyPlan }));
        c.appendChild(resultHeader);
        resultElems.forEach(t => c.appendChild(renderPlanElement(t, false, t === 'mp_score' ? 'Score' : 'Next Step')));
    }

    function renderPlanningPanel(c) {
        // ── Question Focus section ──
        const focusElems = ['question_text', 'goal', 'keywords'];
        const focusHas = focusElems.some(e => state.plan[e]);
        c.appendChild(el('div', { className: `swml-plan-section-title ${focusHas ? '' : 'pending'}`, textContent: 'Question Focus' }));
        focusElems.forEach(t => c.appendChild(renderPlanElement(t)));

        // ── Anchor Quotes section (with info tooltip) ──
        const quoteElems = ['anchor_quote_start', 'anchor_quote_mid', 'anchor_quote_end'];
        const quotesHas = quoteElems.some(e => state.plan[e]);
        const quoteHeader = el('div', { className: `swml-plan-section-title ${quotesHas ? '' : 'pending'}` });
        quoteHeader.appendChild(document.createTextNode('Anchor Quotes '));
        const infoBtn = el('span', {
            className: 'swml-info-btn',
            textContent: 'ⓘ',
            title: 'Anchor quotes are key evidence from the beginning, middle, and end of the text.',
            onClick: (e) => {
                e.stopPropagation();
                const existing = $('#swml-info-modal');
                if (existing) { existing.remove(); return; }
                const modal = el('div', { className: 'swml-info-modal', id: 'swml-info-modal' });
                modal.appendChild(el('div', { className: 'swml-info-modal-title', textContent: 'What are Anchor Quotes?' }));
                modal.appendChild(el('div', { className: 'swml-info-modal-body', textContent: 'Anchor quotes are key pieces of evidence selected from the beginning, middle, and end of the text. By choosing quotes from across the whole text, you show the examiner that you understand how the writer develops themes, characters, and ideas throughout — not just in one section. Each anchor quote becomes the foundation for one of your body paragraphs.' }));
                modal.appendChild(el('button', { className: 'swml-info-modal-close', textContent: 'Got it', onClick: () => modal.remove() }));
                quoteHeader.parentNode.insertBefore(modal, quoteHeader.nextSibling);
            }
        });
        quoteHeader.appendChild(infoBtn);
        c.appendChild(quoteHeader);
        quoteElems.forEach(t => c.appendChild(renderPlanElement(t, true)));

        // ── Essay Plan section ──
        const planElems = ['introduction', 'body_para_1', 'body_para_2', 'body_para_3', 'conclusion'];
        const planHas = planElems.some(e => state.plan[e]);
        const planHeader = el('div', { className: `swml-plan-section-title ${planHas ? '' : 'pending'}`, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } });
        planHeader.appendChild(document.createTextNode('Essay Plan'));
        planHeader.appendChild(el('button', { className: 'swml-copy-btn', textContent: 'Copy Plan', onClick: copyPlan }));
        c.appendChild(planHeader);
        planElems.forEach(t => c.appendChild(renderPlanElement(t)));
    }

    /** Render a single plan element with copy and edit buttons */
    function renderPlanElement(type, isQuote = false, customLabel = null) {
        const info = getElements().find(e => e.type === type) || PLAN_ELEMENTS.find(e => e.type === type);
        const d = state.plan[type];
        const rev = REVISION_MAP[type];
        const elem = el('div', { className: `swml-plan-element ${d ? 'complete' : ''}` });
        const labelRow = el('div', { className: 'swml-plan-element-label-row' });
        const labelText = customLabel || info?.label || type;
        labelRow.appendChild(el('span', { className: 'swml-plan-element-label', textContent: (d ? '✓ ' : '') + labelText }));
        if (d) {
            const btnGroup = el('div', { className: 'swml-plan-btn-group' });
            btnGroup.appendChild(el('button', { className: 'swml-plan-copy-btn', innerHTML: SVG_COPY, title: 'Copy',
                onClick: (e) => { e.stopPropagation(); clip(d.content, e.currentTarget); } }));
            btnGroup.appendChild(el('button', { className: 'swml-plan-clear-btn', textContent: '✏️', title: 'Revise this',
                onClick: (e) => {
                    e.stopPropagation();
                    const cascades = rev?.cascades || [];
                    const affectedLabels = cascades
                        .filter(c => state.plan[c])
                        .map(c => REVISION_MAP[c]?.label || c);

                    let msg = `Revise your ${rev?.label || info?.label}?`;
                    if (affectedLabels.length > 0) {
                        msg += `\n\nThis will also clear: ${affectedLabels.join(', ')} (they depend on this).`;
                    }
                    msg += `\n\nThe AI will take you back to this step to redo it.`;

                    showConfirm(msg, () => reviseElement(type));
                } }));
            labelRow.appendChild(btnGroup);
        }
        elem.appendChild(labelRow);
        if (d) {
            // Decode HTML entities and truncate very long content for display
            let displayContent = d.content;
            // Decode &gt; &lt; &amp; etc.
            const decodeEl = document.createElement('textarea');
            decodeEl.innerHTML = displayContent;
            displayContent = decodeEl.value;
            // Truncate for panel display (full content preserved for copy)
            const maxLen = type === 'question_text' ? 150 : 300;
            if (displayContent.length > maxLen) {
                displayContent = displayContent.substring(0, maxLen).trim() + '...';
            }

            if (isQuote) {
                const content = el('div', { className: 'swml-plan-element-content' });
                content.appendChild(el('q', { textContent: displayContent, style: { fontStyle: 'italic', fontSize: '11px' } }));
                elem.appendChild(content);
            } else {
                elem.appendChild(el('div', { className: 'swml-plan-element-content', textContent: displayContent }));
            }
        } else {
            elem.appendChild(el('div', { className: 'swml-plan-element-empty', textContent: 'Awaiting...' }));
        }
        return elem;
    }

    /**
     * Revise a plan element: clear it + cascaded dependents, rewind step, tell AI
     */
    async function reviseElement(type) {
        const rev = REVISION_MAP[type];
        const info = getElements().find(e => e.type === type);
        const label = rev?.label || info?.label || type;

        // Collect elements to clear (this one + any cascades)
        const cascades = rev?.cascades || [];
        const toClear = [type, ...cascades];
        const clearedLabels = [];

        for (const t of toClear) {
            if (state.plan[t]) {
                clearedLabels.push(REVISION_MAP[t]?.label || getElements().find(e => e.type === t)?.label || t);
                delete state.plan[t];
                try { await apiPost(API.planElement, { type: t, content: '', step: 0, clear: true }); } catch(e) {}
            }
        }

        // Rewind step if needed (only for planning with defined steps)
        const targetStep = rev?.step || state.step;
        if (targetStep < state.step) {
            state.step = targetStep;
            updateProgress(targetStep);
        }

        renderPlan();

        // Send a system message to the AI explaining what happened
        const stepInfo = getSteps().find(s => s.step === targetStep);
        const redirectMsg = [
            `[REVISION REQUEST] The student wants to revise their ${label}.`,
            clearedLabels.length > 1 ? `Cleared elements: ${clearedLabels.join(', ')}.` : '',
            `Please guide the student through updating their ${label}.`,
            `The student's established plan state is included in the session preamble — refer to it for what's already confirmed.`,
            `When the student confirms the new value, call save_plan_element with element_type="${type}" to overwrite the old value.`,
        ].filter(Boolean).join(' ');

        // Add a visual notice
        const msgs = $('#swml-messages');
        if (msgs) {
            msgs.appendChild(el('div', { className: 'swml-resume-notice', textContent: `↳ Revising ${rev.label} — returning to Section ${targetStep}` }));
            msgs.scrollTop = msgs.scrollHeight;
        }

        // Send the redirect as a user message (hidden from display, sent to AI)
        setLoading(true); showTyping();
        try {
            const trimmedHistory = state.chatHistory.length > MAX_HISTORY_MESSAGES
                ? state.chatHistory.slice(-MAX_HISTORY_MESSAGES)
                : state.chatHistory;

            const response = await fetch(API.chat, { method: 'POST', headers, body: JSON.stringify({
                prompt: redirectMsg,
                botId: 'wml-claude',
                chatId: state.chatId,
                history: trimmedHistory,
                planState: state.plan,
                step: state.step,
                board: state.board,
                subject: state.subject,
                task: state.task,
            }) });
            const res = await response.json();
            hideTyping();

            if (res.success && res.reply) {
                addMessage('ai', res.reply);
                if (res.chatId) state.chatId = res.chatId;
            } else {
                addMessage('ai', `Let's revise your ${rev.label}. What would you like to change?`);
            }
        } catch (e) {
            hideTyping();
            addMessage('ai', `Let's revise your ${rev.label}. What would you like to change?`);
        }
        setLoading(false);
        autoSave();
    }

    // ── Video Button + Contextual Tooltip ──
    let videoTooltipShownForStep = 0;
    let allVideosCache = null;

    function fetchAllVideos() {
        if (allVideosCache) return Promise.resolve(allVideosCache);
        // Fetch videos for all sections + general
        const fetches = [0, ...getSteps().map(s => s.step)].map(step =>
            fetch(`${config.restUrl}resources?task=${state.task}&step=${step}&board=${state.board}&subject=${state.subject}`, { headers })
                .then(r => r.json())
                .then(data => ({ step, videos: data?.videos || [] }))
                .catch(() => ({ step, videos: [] }))
        );
        return Promise.all(fetches).then(results => {
            allVideosCache = {};
            let all = [];
            results.forEach(r => {
                if (r.videos.length > 0) {
                    allVideosCache[r.step] = r.videos;
                    all = all.concat(r.videos);
                }
            });
            // Deduplicate by title
            const seen = new Set();
            allVideosCache._all = all.filter(v => {
                const key = v.hls || v.title;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            return allVideosCache;
        });
    }

    function showVideoPanel() {
        if (window.wmlVideo?.isOpen()) { wmlVideo.close(); return; }

        fetchAllVideos().then(cache => {
            const allVideos = cache._all || [];
            if (allVideos.length === 0) {
                showConfirm('No video lessons available yet. Check back soon!', () => {}, { confirmText: 'OK', cancelText: '' });
                return;
            }

            // If only general videos (no section-specific), open directly
            const sectionKeys = Object.keys(cache).filter(k => k !== '_all' && k !== '0' && cache[k].length > 0);
            if (sectionKeys.length <= 1) {
                if (window.wmlVideo) wmlVideo.open(allVideos);
                return;
            }

            // Show section picker
            const existing = $('#swml-video-picker');
            if (existing) { existing.remove(); return; }

            const picker = el('div', { className: 'swml-video-picker', id: 'swml-video-picker' });
            picker.appendChild(el('div', { className: 'swml-vp-pick-header', textContent: '🎬 Choose a section' }));

            // "Watch All" option
            picker.appendChild(el('button', { className: 'swml-vp-pick-item all', textContent: `▶ Watch All (${allVideos.length} videos)`,
                onClick: () => { picker.remove(); if (window.wmlVideo) wmlVideo.open(allVideos); } }));

            // Section-specific options
            const steps = getSteps();
            sectionKeys.sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
                const stepNum = parseInt(key);
                const stepInfo = steps.find(s => s.step === stepNum);
                const videos = cache[key];
                const btn = el('button', { className: `swml-vp-pick-item ${stepNum === state.step ? 'current' : ''}`,
                    textContent: `${stepInfo?.label || 'Section ' + stepNum} (${videos.length})`,
                    onClick: () => { picker.remove(); if (window.wmlVideo) wmlVideo.open(videos); } });
                picker.appendChild(btn);
            });

            // General videos
            if (cache[0]?.length > 0) {
                picker.appendChild(el('button', { className: 'swml-vp-pick-item',
                    textContent: `General Tips (${cache[0].length})`,
                    onClick: () => { picker.remove(); if (window.wmlVideo) wmlVideo.open(cache[0]); } }));
            }

            // Position near the button
            const videoBtn = $('#swml-video-btn');
            const rect = videoBtn?.getBoundingClientRect();
            if (rect) {
                picker.style.position = 'fixed';
                picker.style.left = (rect.right + 8) + 'px';
                picker.style.bottom = (window.innerHeight - rect.bottom) + 'px';
            }

            document.body.appendChild(picker);

            // Click outside to close
            setTimeout(() => {
                const closeHandler = (e) => {
                    if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', closeHandler); }
                };
                document.addEventListener('click', closeHandler);
            }, 100);
        });
    }

    function checkVideoTooltip() {
        const btn = $('#swml-video-btn');
        if (!btn) return;
        if (videoTooltipShownForStep === state.step) return;
        if (window.wmlVideo?.isOpen()) return;

        fetchAllVideos().then(cache => {
            // Find videos for current section specifically
            const sectionVideos = cache[state.step] || [];
            if (sectionVideos.length === 0) return;

            videoTooltipShownForStep = state.step;
            const first = sectionVideos[0];
            const stepInfo = getSteps().find(s => s.step === state.step);

            // Remove any existing tooltip
            const old = $('.swml-video-tooltip');
            if (old) old.remove();

            const tooltip = el('div', { className: 'swml-video-tooltip' });
            tooltip.innerHTML = `
                <div class="swml-vt-thumb">
                    ${first.thumbnail ? `<img src="${first.thumbnail}" alt="">` : '<div class="swml-vt-play">▶</div>'}
                </div>
                <div class="swml-vt-info">
                    <div class="swml-vt-label">📚 ${stepInfo?.label || 'This section'}</div>
                    <div class="swml-vt-title">${first.title || 'Watch the guide'}</div>
                    <div class="swml-vt-count">${sectionVideos.length} video${sectionVideos.length > 1 ? 's' : ''} · Click to watch</div>
                </div>
            `;
            tooltip.addEventListener('click', () => {
                tooltip.remove();
                if (window.wmlVideo) wmlVideo.open(sectionVideos);
            });

            // Position fixed relative to the button so it's never clipped
            const btnRect = btn.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = (btnRect.right + 8) + 'px';
            tooltip.style.top = (btnRect.top - 40) + 'px';
            document.body.appendChild(tooltip);

            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-6px)';
                    setTimeout(() => tooltip.remove(), 300);
                }
            }, 8000);
        });
    }

    function updateProgress(step) {
        state.step = step;
        const ind = $('#swml-step-indicator');
        const info = getSteps().find(s => s.step === step);
        if (ind && info) ind.textContent = `Section ${step} of ${getSteps().length} · ${info.label}`;
        $$('.swml-step').forEach(el => {
            const s = parseInt(el.dataset.step);
            const circle = el.querySelector('.swml-step-circle');
            // Mark current step as complete too when phase is marked complete (v7.12.53)
            const c = s < step ? 'complete' : s === step ? (state._phaseMarkedComplete ? 'complete' : 'active') : '';
            el.className = `swml-step ${c}`; circle.className = `swml-step-circle ${c}`;
            circle.textContent = (s < step || (s === step && state._phaseMarkedComplete)) ? '✓' : s;
        });
        // v7.14.68: Accordion group state — open the group containing the active step, update group headers
        $$('.swml-step-group').forEach(group => {
            const header = group.querySelector('.swml-step-group-header');
            const body = group.querySelector('.swml-step-group-body');
            if (!header || !body) return;
            const groupSteps = body.querySelectorAll('.swml-step');
            let hasActive = false, allComplete = true, anyStep = false;
            groupSteps.forEach(gs => {
                const s = parseInt(gs.dataset.step);
                if (isNaN(s)) return;
                anyStep = true;
                if (s === step) hasActive = true;
                if (s >= step && !state._phaseMarkedComplete) allComplete = false;
            });
            header.classList.remove('group-active', 'group-complete');
            if (anyStep && allComplete) {
                header.classList.add('group-complete');
            } else if (hasActive) {
                header.classList.add('group-active');
            }
            // Auto-open the active group, close others
            if (hasActive && !header.classList.contains('open')) {
                $$('.swml-step-group-header').forEach(h => h.classList.remove('open'));
                $$('.swml-step-group-body').forEach(b => { b.style.maxHeight = '0'; });
                header.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
        // Check for video hints when step changes
        checkVideoTooltip();
    }

    // ══════════════════════════════════════════
    //  CHAT ENGINE
    // ══════════════════════════════════════════
    function addMessage(from, text, silent = false, model = null) {
        const msgs = $('#swml-messages');
        if (!msgs) return;

        // Strip any leaked function call artifacts from AI messages
        if (from === 'ai') {
            // ── [PANEL] TAG EXTRACTION ──
            // Extract structured save data from [PANEL: type]content[/PANEL] tags.
            // Store as pending saves — confirmed when student clicks A on the confirm prompt.
            const panelRegex = /\[PANEL:\s*(\w+)\]([\s\S]*?)\[\/PANEL\]/g;
            let panelMatch;
            const pendingSaves = {};
            while ((panelMatch = panelRegex.exec(text)) !== null) {
                const pType = panelMatch[1].trim();
                const pContent = panelMatch[2].trim();
                if (pType && pContent && pContent.length > 2) {
                    pendingSaves[pType] = pContent;
                    console.log('WML [PANEL]: Extracted', pType, '→', pContent.substring(0, 80));
                }
            }
            if (Object.keys(pendingSaves).length > 0) {
                state._pendingPanelSaves = { ...state._pendingPanelSaves, ...pendingSaves };

                // ── AUTO-SAVE for Memory Practice ──
                // Memory practice milestones are auto-detected or confirmed by button clicks.
                // No separate A/B confirmation needed — save immediately.
                if (state.task === 'memory_practice') {
                    for (const [pType, pContent] of Object.entries(pendingSaves)) {
                        if (pContent && pContent.length > 1) {
                            apiPost(API.planElement, { type: pType, content: pContent, step: state.step }).then(() => {
                                state.plan[pType] = { content: pContent };
                                renderPlan();
                                console.log('WML [PANEL] Auto-save (memory_practice):', pType, '→', pContent.substring(0, 80));
                            }).catch(e => console.warn('WML auto-save failed:', pType, e));
                        }
                    }
                    state._pendingPanelSaves = {}; // Clear — already saved
                }
            }
            // Strip [PANEL] tags from display text — student never sees them
            // Then apply shared stripping for JSON, function calls, protocol markers
            text = stripAIInternals(text);
        }

        // Remove any existing quick action buttons (new message supersedes old choices)
        if (!silent) {
            const oldActions = msgs.querySelectorAll('.swml-quick-actions');
            oldActions.forEach(a => a.remove());
        }

        const bubble = el('div', { className: `swml-bubble ${from}` });
        if (silent) bubble.style.animation = 'none';
        const content = el('div', { className: 'swml-bubble-content' });

        if (from === 'ai') {
            const hdr = el('div', { className: 'swml-bubble-header' });
            hdr.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
            hdr.appendChild(el('button', { className: 'swml-bubble-copy', innerHTML: SVG_COPY, title: 'Copy this message',
                onClick: (e) => { e.stopPropagation(); clip(text, e.currentTarget); } }));
            content.appendChild(hdr);
        }

        const body = el('div', { className: 'swml-bubble-body' });
        body.innerHTML = formatAI(text);
        content.appendChild(body);

        // ── Fill-in-the-blank event handling (v7.14.51) ──
        if (from === 'ai' && !silent) {
            const blankInputs = body.querySelectorAll('.swml-blank-input');
            const blankSubmit = body.querySelector('.swml-blank-submit');
            if (blankInputs.length > 0 && blankSubmit) {
                const submitBlanks = () => {
                    const answers = [];
                    blankInputs.forEach((inp, i) => {
                        const val = inp.value.trim();
                        if (val) answers.push(blankInputs.length > 1 ? `${i + 1}: ${val}` : val);
                    });
                    if (answers.length === 0) return;
                    blankSubmit.disabled = true;
                    blankInputs.forEach(inp => { inp.disabled = true; });
                    const input = $('#swml-input');
                    if (input) { input.value = answers.join(', '); }
                    sendMessage();
                };
                blankSubmit.addEventListener('click', submitBlanks);
                blankInputs.forEach(inp => {
                    inp.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') { e.preventDefault(); submitBlanks(); }
                    });
                });
            }
        }

        // Copy button on user messages
        if (from === 'user') {
            const userCopy = el('button', { className: 'swml-bubble-copy swml-user-copy', innerHTML: SVG_COPY, title: 'Copy your message',
                onClick: (e) => { e.stopPropagation(); clip(text, e.currentTarget); } });
            content.appendChild(userCopy);
        }

        // Quick action buttons for AI messages (only on live messages, not replay)
        if (from === 'ai' && !silent) {
            // Suppress old A/B/C task-selection quick actions when assessment is complete
            const assessmentDone = state.task === 'assessment' && state.plan.total_score && state.plan.grade;
            const actions = assessmentDone ? [] : detectQuickActions(text);
            if (actions.length > 0) {
                // Detect if this is a multi-select context (pick 3-5, choose multiple, select several, select all that apply)
                const isMulti = /(?:pick|choose|select|commit to)\s*(?:(?:up to|between|at least)?\s*)?(\d)\s*[-–to]+\s*(\d)/i.test(text)
                    || /(?:pick|choose|select)\s+(?:multiple|several|a few|some)\b/i.test(text)
                    || /select\s+all\s+that\s+apply/i.test(text);
                // AO context detection — if AI lists AO1/AO2/AO3 as options, always multi-select (v7.12.5)
                const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3|targeting.*AO/i.test(text)
                    && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));

                const bar = el('div', { className: 'swml-quick-actions' });

                if ((isMulti || isAoContext) && actions.length >= 2) {
                    // Multi-select mode: toggle buttons, then submit
                    const selected = new Set();
                    actions.forEach(action => {
                        const icon = getQuickActionIcon(action.label);
                        const btn = el('button', {
                            className: 'swml-quick-btn',
                            innerHTML: (icon || '') + ' ' + action.label.replace(/^[A-F]\)\s*/, '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}✅✏️✓✗🎲📋🔥⚡🚀📂💡🎙️📝📊✨📄📚🎯]\s*/gu, '').trim(),
                            onClick: () => {
                                if (selected.has(action.value)) {
                                    selected.delete(action.value);
                                    btn.classList.remove('selected');
                                } else {
                                    selected.add(action.value);
                                    btn.classList.add('selected');
                                }
                                submitBtn.textContent = selected.size > 0 ? `Submit (${selected.size}) →` : 'Submit →';
                                submitBtn.disabled = selected.size === 0;
                            }
                        });
                        // Enter on focused toggle button submits instead of toggling (v7.12.54)
                        btn.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') { e.preventDefault(); if (selected.size > 0) submitBtn.click(); }
                        });
                        bar.appendChild(btn);
                    });
                    const submitBtn = el('button', {
                        className: 'swml-quick-btn swml-quick-submit',
                        textContent: 'Submit →',
                        disabled: true,
                        onClick: () => {
                            bar.remove();
                            const input = $('#swml-input');
                            if (input) { input.value = [...selected].join(', '); }
                            sendMessage();
                        }
                    });
                    bar.appendChild(submitBtn);
                } else if (actions._ranking && actions.length >= 2) {
                    // ── Ranking mode: click to assign rank order (v7.14.51) ──
                    const ranked = []; // ordered array of values
                    const btnMap = new Map(); // value → button element
                    const rankSubmitBtn = el('button', {
                        className: 'swml-quick-btn swml-quick-submit',
                        textContent: 'Submit Ranking →',
                        disabled: true,
                        onClick: () => {
                            bar.remove();
                            const input = $('#swml-input');
                            if (input) {
                                input.value = ranked.map((v, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}: ${v}`).join(', ');
                            }
                            sendMessage();
                        }
                    });
                    const updateRankLabels = () => {
                        btnMap.forEach((btn, val) => {
                            const idx = ranked.indexOf(val);
                            const baseLabel = btn.dataset.baseLabel;
                            if (idx >= 0) {
                                btn.classList.add('selected');
                                btn.innerHTML = `<span class="swml-rank-num">${idx + 1}</span> ${baseLabel}`;
                            } else {
                                btn.classList.remove('selected');
                                btn.innerHTML = baseLabel;
                            }
                        });
                        rankSubmitBtn.disabled = ranked.length === 0;
                        rankSubmitBtn.textContent = ranked.length > 0 ? `Submit Ranking (${ranked.length}) →` : 'Submit Ranking →';
                    };
                    actions.forEach(action => {
                        const cleanLabel = action.label.replace(/^[A-F]\)\s*/, '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}✅✏️🎲📋🔥⚡🚀📂💡🎙️📝📊✨📄📚🎯]\s*/gu, '');
                        const btn = el('button', {
                            className: 'swml-quick-btn swml-rank-btn',
                            innerHTML: cleanLabel,
                            onClick: () => {
                                const idx = ranked.indexOf(action.value);
                                if (idx >= 0) {
                                    // Already ranked — remove it
                                    ranked.splice(idx, 1);
                                } else {
                                    // Add to end of ranking
                                    ranked.push(action.value);
                                }
                                updateRankLabels();
                            }
                        });
                        btn.dataset.baseLabel = cleanLabel;
                        btnMap.set(action.value, btn);
                        bar.appendChild(btn);
                    });
                    bar.appendChild(rankSubmitBtn);
                } else {
                    // Single-select mode: click to send immediately
                    actions.forEach(action => {
                        const icon = getQuickActionIcon(action.label);
                        const btn = el('button', {
                            className: 'swml-quick-btn',
                            innerHTML: (icon || '') + ' ' + action.label.replace(/^[A-F]\)\s*/, '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}✅✏️✓✗🎲📋🔥⚡🚀📂💡🎙️📝📊✨📄📚🎯]\s*/gu, '').trim(),
                            onClick: () => {
                                bar.remove();
                                const input = $('#swml-input');
                                if (input) { input.value = action.value; }
                                sendMessage();
                            }
                        });
                        bar.appendChild(btn);
                    });
                }
                content.appendChild(bar);
            }
        }

        bubble.appendChild(content);
        msgs.appendChild(bubble);
        if (!silent) msgs.scrollTop = msgs.scrollHeight;

        // Timer detection for Random Quote Analysis
        if (from === 'ai' && !silent && state.task === 'verbal_rehearsal') {
            // Check the last portion of the message to determine what the AI is asking RIGHT NOW
            const tail = text.slice(-300).toLowerCase();
            if (tail.includes('90 seconds') && tail.includes('ready')) {
                showTimer(90, '⏱️ Planning');
            } else if ((tail.includes('2.5 minutes') || tail.includes('2½ minutes')) && tail.includes('ready')) {
                showTimer(150, '⏱️ Paragraph');
            }
        }

        // Timer detection for Recall exercises (Essay Plan Recall + Model Answer Advanced)
        if (from === 'ai' && !silent) {
            const isRecallTask = (state.task === 'essay_plan' && state.planningMode === 'A') ||
                                 (state.task === 'model_answer' && state.planningMode === 'C');
            if (isRecallTask) {
                const tail = text.slice(-500).toLowerCase();
                // Only trigger timer on the ACTUAL timer briefing — NOT the opening explanation
                // The opening says "a 4-minute timer will start" (descriptive)
                // The briefing says "press the microphone when you're ready" or "🎙️" (actionable)
                const isTimerBriefing = (tail.includes('press the microphone') || tail.includes('🎙️')) &&
                                        !tail.includes('here\'s how it works') &&
                                        !tail.includes('here\'s how this works') &&
                                        !tail.includes('let\'s get your question');
                if (isTimerBriefing) {
                    // Determine timer duration from AI message context
                    let seconds = 240, label = '⏱️ Plan Recall'; // default: 4 min
                    if (tail.includes('43-minute') || tail.includes('43 minutes')) {
                        seconds = 2580; label = '⏱️ Full Essay';
                    } else if (tail.includes('10 minutes')) {
                        seconds = 600;
                        if (tail.includes('paragraph 1') || tail.includes('body ¶1')) label = '⏱️ Body ¶1';
                        else if (tail.includes('paragraph 2') || tail.includes('body ¶2')) label = '⏱️ Body ¶2';
                        else if (tail.includes('paragraph 3') || tail.includes('body ¶3')) label = '⏱️ Body ¶3';
                        else label = '⏱️ Body Paragraph';
                    } else if (tail.includes('5 minutes') && tail.includes('introduction')) {
                        seconds = 300; label = '⏱️ Introduction';
                    } else if (tail.includes('8 minutes') && tail.includes('conclusion')) {
                        seconds = 480; label = '⏱️ Conclusion';
                    }
                    showTimer(seconds, label);
                }
            }
        }

        // Timer detection for Memory Practice exercises
        if (from === 'ai' && !silent && state.task === 'memory_practice') {
            const fullLower = text.toLowerCase();
            // Detect: "[X] seconds — press the microphone" pattern anywhere in message
            // (trigger phrase appears BEFORE the exercise text, so tail-only won't work)
            if (fullLower.includes('seconds') && (fullLower.includes('press the microphone') || fullLower.includes('start typing when'))) {
                const secMatch = fullLower.match(/(\d+)\s*seconds/);
                if (secMatch) {
                    const seconds = parseInt(secMatch[1], 10);
                    if (seconds > 0 && seconds <= 600) {
                        const label = seconds <= 60 ? (SVG_TIMER + ' Quick Recall') : seconds <= 120 ? (SVG_TIMER + ' Memory Challenge') : (SVG_TIMER + ' Extended Recall');
                        showTimer(seconds, label);
                    }
                }
            }
        }

        // Only add to history for live messages, not replays
        if (!silent) state.chatHistory.push({ role: from === 'user' ? 'user' : 'assistant', content: text });
    }

    /**
     * Detect quick action choices in AI responses
     * Returns array of { label: 'display text', value: 'what to send' }
     */
    function detectQuickActions(text) {
        // Strip markdown bold markers so **1–5** becomes 1–5 (AI wraps in bold)
        text = text.replace(/\*{2}/g, '');
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // ══════════════════════════════════════════
        //  LETTER OPTIONS: A) B) C) / A. B. / **A** — / A — etc.
        //  Single unified pattern that handles all markdown variants
        //  v7.14.55: Also handles emoji prefix (🧠 A — ...) for BBB classification
        // ══════════════════════════════════════════
        const letterOptions = [];
        const letterRegex = /^[-•🔹]*\s*(?:[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}]\s*)?(?:[\uFE00-\uFE0F]\s*)?\*{0,2}([A-F])[).:—\-]\*{0,2}\s*[—\-]?\s*(.+)/iu;
        const letterBoldRegex = /^[-•]*\s*(?:[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}]\s*)?(?:[\uFE00-\uFE0F]\s*)?\*{0,2}([A-F])\*{0,2}\s*[).:—\-]+\s*(.+)/iu;
        for (const line of lines) {
            const m = line.match(letterRegex) || line.match(letterBoldRegex);
            if (m) {
                const letter = m[1].toUpperCase();
                let label = m[2].replace(/[\*_]/g, '').replace(/["']/g, '').replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
                if (label.length > 55) label = label.substring(0, 52) + '...';
                if (!letterOptions.some(o => o.value === letter)) {
                    letterOptions.push({ label: `${letter}) ${label}`, value: letter });
                }
            }
        }
        if (letterOptions.length >= 2) {
            // v7.14.55: Check for ranking context — if message asks to rank/order, flag for ranking mode
            const isRankingContext = /(?:rank|order|arrange|sort)\s+(?:these|them|the|from)/i.test(text);
            if (isRankingContext) letterOptions._ranking = true;
            return letterOptions;
        }

        // ══════════════════════════════════════════
        //  YES/NO: explicit or implied confirmation questions
        // ══════════════════════════════════════════
        const yesNoExplicit = /\byes\s+or\s+no\b/i;
        if (yesNoExplicit.test(text) && text.includes('?')) {
            return [
                { label: '✓ Yes', value: 'Yes' },
                { label: '✗ No', value: 'No' }
            ];
        }

        // Implied yes/no at end of message (would you like / are you happy / ready to)
        const lastChunk = lines.slice(-3).join(' ');
        const hasLetterChoices = /^\s*[-•🔹]*\s*\*{0,2}[A-F][).:—\-]\*{0,2}\s/m.test(text);
        const isQuestion = lastChunk.includes('?');

        // Confirmation prompt: "is that correct?" / "would you like a different" → context-aware labels
        const isConfirmation = /(?:is that (?:correct|right)|would you like (?:a )?different|or (?:a )?different|would you (?:prefer|rather))/i;
        if (isConfirmation.test(lastChunk) && isQuestion && !hasLetterChoices) {
            // Detect what's being confirmed (poem, text, etc.)
            const isPoemConfirm = /poem|poet/i.test(text);
            const isTextConfirm = /text|extract|piece/i.test(text);
            const noun = isPoemConfirm ? 'poem' : isTextConfirm ? 'text' : 'selection';
            return [
                { label: `✓ Yes, that's correct`, value: `Yes, that's correct` },
                { label: `✗ No, choose a different ${noun}`, value: `No, I'd like to choose a different ${noun}` }
            ];
        }

        // Refinement prompt: "anything you would like to change?" → context-aware labels
        const isRefinement = /(?:anything you(?:'d| would) like to (?:change|adjust|modify)|anything (?:else )?(?:you'd|you would) like (?:to (?:change|adjust))|any changes)/i;
        if (isRefinement.test(lastChunk) && isQuestion && !hasLetterChoices) {
            return [
                { label: '✓ Happy with this', value: 'No, I\'m happy with this' },
                { label: '✏️ Make changes', value: 'Yes, I\'d like to change something' }
            ];
        }

        const impliedYesNo = /(?:would you like|do you want|shall (?:we|I)|are you (?:happy|ready|satisfied)|does (?:that|this) (?:work|look|sound)|sound good|ready to (?:proceed|continue|move|begin|start|select)|want (?:me )?to (?:proceed|continue))/i;
        // Guard: don't show yes/no when the AI is asking for specific text input
        const isContentRequest = /(?:(?:tell|give) me|please (?:tell|provide|share|paste|type)|what (?:is|are) (?:the|your)|which (?:poem|text|quote|character|theme)|paste (?:the|your|a)|submit (?:the|your|a))/i;
        // Also check full text for content requests (paste/submit may not be in last 3 lines)
        const isContentRequestFull = /(?:paste (?:the|your|a)|submit (?:the|your|a)|paste.*(?:below|writing|text|paragraph|essay))/i;
        if (impliedYesNo.test(lastChunk) && isQuestion && !hasLetterChoices && !isContentRequest.test(lastChunk) && !isContentRequestFull.test(text)) {
            return [
                { label: '✓ Yes', value: 'Yes' },
                { label: '✗ No, explain more', value: 'No, can you explain a bit more?' }
            ];
        }

        // ══════════════════════════════════════════
        //  A or B at end of message / "respond with A or B"
        // ══════════════════════════════════════════

        // Re-ask pattern: "Choose A, B, C, or D" without options listed (e.g. after Socratic guidance)
        // Look back in chat history for the original options
        const chooseABCD = /(?:choose|type|select)\s+A,?\s*B,?\s*C,?\s*(?:or\s+)?D/i;
        if (chooseABCD.test(lastChunk) && !hasLetterChoices) {
            // Try to find original options from previous AI message
            const prevAiMsgs = (state.chatHistory || []).filter(m => m.role === 'assistant').map(m => m.content);
            for (let i = prevAiMsgs.length - 2; i >= Math.max(0, prevAiMsgs.length - 4); i--) {
                const prevLines = prevAiMsgs[i].split('\n').map(l => l.trim()).filter(Boolean);
                const prevOptions = [];
                for (const pl of prevLines) {
                    const pm = pl.match(letterRegex) || pl.match(letterBoldRegex);
                    if (pm) {
                        const letter = pm[1].toUpperCase();
                        let plabel = pm[2].replace(/[\*_]/g, '').replace(/["']/g, '').replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
                        if (plabel.length > 55) plabel = plabel.substring(0, 52) + '...';
                        if (!prevOptions.some(o => o.value === letter)) {
                            prevOptions.push({ label: `${letter}) ${plabel}`, value: letter });
                        }
                    }
                }
                if (prevOptions.length >= 2) return prevOptions;
            }
            // Fallback: generic A/B/C/D
            return [
                { label: 'A', value: 'A' },
                { label: 'B', value: 'B' },
                { label: 'C', value: 'C' },
                { label: 'D', value: 'D' }
            ];
        }

        const respondAB = /(?:respond|reply|answer|type|choose|like|prefer|pick|just)\s*[,:]?\s*(?:with\s+)?(?:option\s+)?['\"]?\*{0,2}([A-F])\*{0,2}['\"]?\s+or\s+['\"]?\*{0,2}([A-F])\*{0,2}['\"]?/i;
        const endAB = text.match(/\*{0,2}([A-F])\*{0,2}\s+or\s+\*{0,2}([A-F])\*{0,2}\s*[?!.]?\s*$/im);
        const abMatch = text.match(respondAB) || endAB;
        if (abMatch) {
            const optA = abMatch[1].toUpperCase();
            const optB = abMatch[2].toUpperCase();
            const findLabel = (letter) => {
                for (const line of lines) {
                    const m = line.match(new RegExp(`^[\\*_\\-•]*\\s*\\*{0,2}(?:Option\\s+)?${letter}[).:—\\-]\\*{0,2}\\s*[—\\-]?\\s*(.+)`, 'i'))
                        || line.match(new RegExp(`^[\\*_\\-•]*\\s*\\*{0,2}${letter}\\*{0,2}\\s*[).:—\\-]+\\s*(.+)`, 'i'));
                    if (m) return m[1].replace(/[\*_"']/g, '').trim();
                }
                return letter;
            };
            const labelA = findLabel(optA);
            const labelB = findLabel(optB);
            return [
                { label: labelA.length > 55 ? optA : `${optA}) ${labelA}`, value: optA },
                { label: labelB.length > 55 ? optB : `${optB}) ${labelB}`, value: optB }
            ];
        }

        // ══════════════════════════════════════════
        //  SPECIAL KEYWORDS: NEXT, MENU, READY, HELP, KEY SCENES, TIP, DONE
        // ══════════════════════════════════════════
        if (/\btype\s+['"]?NEXT['"]?\b/i.test(text) || /\bNEXT\s+to\s+(?:continue|proceed)\b/i.test(text)) {
            return [{ label: 'Next →', value: 'NEXT' }];
        }
        if (/\btype\s+\*{0,2}['"]?(?:ready|READY)['"]?\*{0,2}\b/i.test(text) || /\b(?:say|respond(?:\s+with)?|send)\s+['"]?ready['"]?\b/i.test(text)) {
            return [{ label: '✓ Ready', value: 'ready' }];
        }
        if (/\btype\s+['"]?M(?:ENU)?['"]?\b/i.test(text)) {
            return [{ label: '📋 Menu', value: 'M' }];
        }
        if (/\btype\s+['"]?K['"]?\b/i.test(text) && /key.?scene|suggestions/i.test(text)) {
            return [{ label: '🔑 Key Scenes', value: 'K' }];
        }
        if (/\btype\s+['"]?H['"]?\b/i.test(text) && /help/i.test(text)) {
            return [{ label: '❓ Help', value: 'H' }];
        }
        if (/\btype\s+['"]?T['"]?\b/i.test(text) && /tip|reminder|technique|hint/i.test(text)) {
            return [{ label: '💡 Tip', value: 'T' }];
        }
        if (/\btype\s+['"]?done['"]?\b/i.test(text)) {
            return [{ label: '✅ Done', value: 'done' }];
        }

        // ══════════════════════════════════════════
        //  SCALE: "on a scale of 1 to 5" / "rate 1-5" / "1–5" (em/en dash)
        // ══════════════════════════════════════════
        const scaleMatch = text.match(/(?:on a )?scale (?:of |from )?(\d)\s*(?:to|[-–—])\s*(\d)/i)
            || text.match(/rate\s*(?:from\s*)?(\d)\s*(?:to|[-–—])\s*(\d)/i)
            || text.match(/(?:type|enter|choose|confidence)\s*\(?(\d)\s*[-–—]\s*(\d)\)?/i);
        if (scaleMatch) {
            const lo = parseInt(scaleMatch[1]);
            const hi = parseInt(scaleMatch[2]);
            if (hi - lo <= 6 && hi > lo) {
                const scaleOptions = [];
                // Try to find descriptive labels from bullet list: "• 1 = Struggled" or "1 = Struggled"
                for (let n = lo; n <= hi; n++) {
                    const labelLine = lines.find(l => new RegExp(`^[-•*\\s]*${n}\\s*[=:–—-]\\s*(.+)`, 'i').test(l));
                    const labelMatch = labelLine?.match(new RegExp(`^[-•*\\s]*${n}\\s*[=:–—-]\\s*(.+)`, 'i'));
                    const desc = labelMatch ? labelMatch[1].replace(/[\*_]/g, '').trim() : '';
                    scaleOptions.push({ label: desc ? `${n} — ${desc}` : String(n), value: String(n) });
                }
                return scaleOptions;
            }
        }

        // ══════════════════════════════════════════
        //  NUMBERED OPTIONS: 1. option / 1) option / 1 — option
        //  Triggers if the message asks to choose OR ends with a question
        // v7.15.65: accept em/en-dash/hyphen as the separator so protocol menus
        //  like "**1** — **Choose a theme** — ..." render as quick-action buttons.
        //  Also split labels on the SECOND dash so we keep the short action verb
        //  ("Choose a theme") for the button and the explanation falls off —
        //  this lets the avgLen ≤ 55 summary-rejection guard still work.
        // ══════════════════════════════════════════
        const numberedOptions = [];
        const numRegex = /^[\*_]*(\d+)(?:[.)]|\s*[—\-–])\s*[\*_]*\s*(.+)/;
        for (const line of lines) {
            const m = line.match(numRegex);
            if (m && parseInt(m[1]) <= 6) {
                let rawLabel = m[2].replace(/[\*_]/g, '').trim();
                // v7.15.65: split on the first em/en dash — keep the action verb only
                const dashSplit = rawLabel.split(/\s+[—–]\s+/);
                if (dashSplit.length >= 2) {
                    const head = dashSplit[0].trim();
                    if (head.length >= 2 && head.length <= 50) rawLabel = head;
                }
                let label = rawLabel.length > 50 ? rawLabel.substring(0, 47) + '...' : rawLabel;
                numberedOptions.push({ label: `${m[1]}. ${label}`, value: m[1], rawLen: rawLabel.length });
            }
        }
        if (numberedOptions.length >= 2 && numberedOptions.length <= 6) {
            // Skip if average raw label is very long — these are summaries/explanations, not choices
            const avgLen = numberedOptions.reduce((s, o) => s + o.rawLen, 0) / numberedOptions.length;
            if (avgLen <= 55) {
                const lastLines = lines.slice(-3).join(' ');
                if (/(?:choose|select|pick|type the number|which (?:one|option)|give me|respond with)/i.test(lastLines)
                    || (isQuestion && numberedOptions.length >= 2)) {
                    return numberedOptions.map(o => ({ label: o.label, value: o.value }));
                }
            }
        }

        // ══════════════════════════════════════════
        //  INLINE PARENTHETICAL: "feedback (A), or proceed (B)"
        // ══════════════════════════════════════════
        const inlineChoices = [];
        const inlineRegex = /([^.?!(]{5,60}?)\s*\(([A-F])\)/gi;
        let inlineMatch;
        while ((inlineMatch = inlineRegex.exec(text)) !== null) {
            const label = inlineMatch[1].replace(/^.*?(?:,\s*(?:or\s+)?|;\s*(?:or\s+)?)/, '').trim();
            const letter = inlineMatch[2].toUpperCase();
            if (label.length > 3 && !inlineChoices.some(c => c.value === letter)) {
                inlineChoices.push({ label: `${letter}) ${label.length > 45 ? label.slice(0, 42) + '...' : label}`, value: letter });
            }
        }
        if (inlineChoices.length >= 2 && inlineChoices.length <= 4) return inlineChoices;

        // ══════════════════════════════════════════
        //  AO OPTIONS: "AO1", "AO2", "AO3" presented as choices
        // ══════════════════════════════════════════
        const aoOptions = [];
        const aoRegex = /^[-•*]*\s*\*{0,2}(AO\d)\*{0,2}\s*[=:—–\-]+\s*(.+)/i;
        for (const line of lines) {
            const m = line.match(aoRegex);
            if (m) {
                const ao = m[1].toUpperCase();
                let label = m[2].replace(/[\*_]/g, '').trim();
                if (label.length > 45) label = label.substring(0, 42) + '...';
                if (!aoOptions.some(o => o.value === ao)) {
                    aoOptions.push({ label: `${ao} — ${label}`, value: ao });
                }
            }
        }
        // AO options trigger if 2+ found — no question mark requirement (AI often phrases as instruction)
        if (aoOptions.length >= 2) return aoOptions;

        return [];
    }

    // ── File Upload Handler ──
    async function handleFileUpload(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            addMessage('ai', '⚠️ File too large. Maximum size is 10MB.');
            return;
        }

        // Show preview in chat
        const msgs = $('#swml-messages');
        const preview = el('div', { className: 'swml-file-preview' });
        preview.appendChild(el('span', { textContent: `📎 ${file.name} (${(file.size / 1024).toFixed(0)}KB)` }));
        if (file.type.startsWith('image/')) {
            const img = el('img', { style: { maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', marginTop: '6px', display: 'block' } });
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        }
        if (msgs) { msgs.appendChild(preview); msgs.scrollTop = msgs.scrollHeight; }

        // Convert to base64 and send as message with file context
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                const input = $('#swml-input');
                const userMsg = input?.value?.trim() || '';
                // Store file data for the next send
                state.pendingFile = { name: file.name, type: file.type, data: base64 };
                if (!userMsg) {
                    input.value = file.type.startsWith('image/') 
                        ? `[Uploaded image: ${file.name}] Please assess this handwritten work.`
                        : `[Uploaded file: ${file.name}] Please review this document.`;
                }
                input.focus();
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error('File upload error:', e);
            addMessage('ai', '⚠️ Could not process the file. Please try again.');
        }
        // Reset file input so same file can be re-selected
        const fi = $('#swml-file-input');
        if (fi) fi.value = '';
    }

    /**
     * U3: Extract just the assessment content from an AI message.
     * Finds the block between "## [Section] Assessment" and "Please copy this full feedback"
     * or falls back to end of second "Gold Standard" model if present.
     * Returns null if no assessment block detected.
     */
    function extractAssessmentContent(text) {
        if (!text) return null;
        // Find start: ## Something Assessment, **Something Assessment**, or **Something — Formal Assessment**
        const startMatch = text.match(/^(#{2,3}\s+(?:\w[\w\s]*)?Assessment|\*{2}(?:\w[\w\s]*)?(?:Assessment|Formal Assessment)[\w\s()]*\*{2}|#{2,3}\s+Mark Breakdown)/m);
        if (!startMatch) return null;
        const startIdx = text.indexOf(startMatch[0]);
        // Find end: "Please copy" or "Have you copied" or "Are you ready" or Hattie questions
        const endRegex = /(?:Please copy this full feedback|Have you copied everything|Are you ready to (?:move|continue)|Action Plan.*Hattie)/i;
        const endMatch = text.substring(startIdx).match(endRegex);
        let endIdx;
        if (endMatch) {
            endIdx = startIdx + text.substring(startIdx).indexOf(endMatch[0]);
        } else {
            endIdx = text.length;
        }
        const block = text.substring(startIdx, endIdx).trim();
        return block.length > 50 ? block : null;
    }

    function clip(text, btn) {
        const SVG_CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--swml-teal)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
        function showFeedback() {
            if (!btn) return;
            // Ensure we have the button element, not a child SVG/path
            const button = btn.closest('button') || btn;
            const origHTML = button.innerHTML;
            button.innerHTML = SVG_CHECK;
            button.classList.add('swml-copied');
            // Tooltip
            const tip = document.createElement('span');
            tip.className = 'swml-copy-tooltip';
            tip.textContent = 'Copied!';
            button.style.position = 'relative';
            button.appendChild(tip);
            setTimeout(() => {
                button.innerHTML = origHTML;
                button.classList.remove('swml-copied');
            }, 1500);
        }
        navigator.clipboard.writeText(text).then(showFeedback).catch(() => {
            const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            showFeedback();
        });
    }

    // Convert markdown assessment text to TipTap-friendly HTML (no <table> — TipTap strips those)
    function formatForTipTap(markdown) {
        // Convert markdown tables to structured paragraphs
        let text = markdown.replace(/((?:\|[^\n]+\|\n?)+)/g, (block) => {
            const rows = block.trim().split('\n').filter(r => r.trim().startsWith('|'));
            if (rows.length < 2) return block;
            const isSep = /^\|[\s:]*-{2,}[\s:]*\|/.test(rows[1]);
            if (!isSep) return block;
            const headers = rows[0].split('|').filter(Boolean).map(c => c.trim());
            let result = '';
            for (let i = 2; i < rows.length; i++) {
                const cells = rows[i].split('|').filter(Boolean).map(c => c.trim());
                if (cells.length === 0) continue;
                // Build: "**Criterion** — Worth: X | Score: Y | Reason"
                let line = '';
                cells.forEach((cell, j) => {
                    const hdr = headers[j] || '';
                    if (j === 0) {
                        line += `<strong>${cell}</strong>`;
                    } else {
                        line += ` · ${hdr}: ${cell}`;
                    }
                });
                result += `<p>${line}</p>`;
            }
            return '\n' + result + '\n';
        });
        // Standard markdown formatting
        text = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^###\s+(.+?)$/gm, '<p><strong>$1</strong></p>')
            .replace(/^##\s+(.+?)$/gm, '<p><strong>$1</strong></p>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        if (!text.startsWith('<p>')) text = '<p>' + text;
        if (!text.endsWith('</p>')) text += '</p>';
        // Clean empty paragraphs
        text = text.replace(/<p>\s*<\/p>/g, '');
        return text;
    }

    function clipRich(markdown, btn) {
        const SVG_CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--swml-teal)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
        function showFeedback() {
            if (!btn) return;
            const button = btn.closest('button') || btn;
            const origHTML = button.innerHTML;
            button.innerHTML = SVG_CHECK;
            button.classList.add('swml-copied');
            const tip = document.createElement('span');
            tip.className = 'swml-copy-tooltip';
            tip.textContent = 'Copied!';
            button.style.position = 'relative';
            button.appendChild(tip);
            setTimeout(() => { button.innerHTML = origHTML; button.classList.remove('swml-copied'); }, 1500);
        }
        const html = formatForTipTap(markdown);
        if (navigator.clipboard && navigator.clipboard.write) {
            const blob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([markdown], { type: 'text/plain' });
            navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })]).then(showFeedback).catch(() => {
                navigator.clipboard.writeText(markdown).then(showFeedback);
            });
        } else {
            navigator.clipboard.writeText(markdown).then(showFeedback).catch(() => {
                const ta = document.createElement('textarea'); ta.value = markdown; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                showFeedback();
            });
        }
    }

    // ── Voice Input (Web Speech API) ──
    let recognition = null;
    let isListening = false;

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-GB';

        let finalTranscript = '';

        rec.onstart = () => {
            isListening = true;
            const btn = $('#swml-mic-btn');
            if (btn) { btn.classList.add('swml-mic-active'); btn.innerHTML = SVG_MIC_STOP; btn.title = 'Stop listening'; }
            const input = $('#swml-input');
            if (input) input.placeholder = 'Listening...';
        };

        rec.onend = () => {
            isListening = false;
            const btn = $('#swml-mic-btn');
            if (btn) { btn.classList.remove('swml-mic-active'); btn.innerHTML = SVG_MIC; btn.title = 'Voice input'; }
            const input = $('#swml-input');
            if (input) input.placeholder = 'Type your response...';
            finalTranscript = '';
        };

        rec.onresult = (event) => {
            let interim = '';
            finalTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interim += t;
                }
            }
            const input = $('#swml-input');
            if (input) {
                // Show final + interim (interim in lighter style via placeholder trick)
                input.value = finalTranscript + interim;
                // Programmatic value changes don't fire 'input' event — resize manually
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 200) + 'px';
            }
        };

        rec.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice input.');
            }
            isListening = false;
            const btn = $('#swml-mic-btn');
            if (btn) { btn.classList.remove('swml-mic-active'); btn.innerHTML = SVG_MIC; btn.title = 'Voice input'; }
        };

        return rec;
    }

    function toggleVoice() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (isListening && recognition) {
            recognition.stop();
            return;
        }

        if (!recognition) {
            recognition = initSpeechRecognition();
        }
        if (recognition) {
            try {
                recognition.start();
                // Auto-start timer when mic is pressed (if timer is waiting)
                triggerTimerFromMic();
            }
            catch (e) { console.warn('Speech start error:', e); }
        }
    }

    // ══════════════════════════════════════════
    //  PHASE COMPLETION CARD
    // ══════════════════════════════════════════

    function showPhaseCompleteCard() {
        if (state._phaseMarkedComplete) return;
        state._phaseMarkedComplete = true; // Set immediately to prevent double-click (v7.12.53)
        // Disable sidebar assess button immediately too
        if (assessCompleteBtn) {
            assessCompleteBtn.disabled = true;
            assessCompleteBtn.style.pointerEvents = 'none';
        }
        // Try canvas chat first (assessment from writing environment), then main chat (v7.12.60: broader search)
        const msgs = document.getElementById('swml-canvas-chat-messages')
            || document.querySelector('.swml-canvas-chat-messages')
            || document.querySelector('.swml-chat-messages')
            || $('#swml-messages');
        if (!msgs) {
            // Can't find chat container — reset flag so user can retry
            state._phaseMarkedComplete = false;
            if (assessCompleteBtn) { assessCompleteBtn.disabled = false; assessCompleteBtn.style.pointerEvents = ''; }
            console.error('WML showPhaseCompleteCard: No messages container found');
            return;
        }

        const card = el('div', { className: 'swml-phase-complete-card' });
        card.innerHTML = `
            <div class="swml-phase-complete-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1CD991" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h3 class="swml-phase-complete-title">Assessment Complete</h3>
            <p class="swml-phase-complete-desc">Your diagnostic essay has been fully assessed. Mark this phase as complete to unlock Phase 2 — the redraft cycle.</p>
            <div class="swml-phase-complete-scores">
                ${state.plan.total_score ? `<span class="swml-pcs-badge">${typeof state.plan.total_score === 'object' ? state.plan.total_score.content : state.plan.total_score}</span>` : ''}
                ${state.plan.grade ? `<span class="swml-pcs-badge">${typeof state.plan.grade === 'object' ? state.plan.grade.content : state.plan.grade}</span>` : ''}
            </div>
            <button class="swml-phase-complete-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M5 12l5 5L20 7"/></svg>
                Mark Phase 1 Complete
            </button>
        `;

        const btn = card.querySelector('.swml-phase-complete-btn');
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Saving...';
            try {
                const p = state.plan;
                const getVal = (v) => typeof v === 'object' && v !== null ? (v.content || '') : (v || '');
                const payload = {
                    board: state.board,
                    text: state.text,
                    topic_number: state.topicNumber || 1,
                    phase: state.isRedraft ? 'redraft' : 'initial',
                    grade: getVal(p.grade),
                    total_score: getVal(p.total_score),
                    ao1_score: getVal(p.ao1_score),
                    ao2_score: getVal(p.ao2_score),
                    ao3_score: getVal(p.ao3_score),
                    ao4_score: getVal(p.ao4_score),
                    strength_1: getVal(p.strength_1),
                    target_1: getVal(p.target_1),
                    target_2: getVal(p.target_2),
                };
                const res = await apiPost(API.phaseComplete, payload);
                if (res.success) {
                    state._phaseMarkedComplete = true;
                    card.classList.add('swml-phase-complete-done');
                    card.innerHTML = `
                        <div class="swml-phase-complete-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1CD991" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12l5 5L20 7"/>
                            </svg>
                        </div>
                        <h3 class="swml-phase-complete-title" style="color:#1CD991">Phase 1 Complete!</h3>
                        <p class="swml-phase-complete-desc">Your results have been saved. Phase 2 (redraft) is now unlocked.</p>
                    `;
                    console.log('WML Phase Complete:', res);
                    // Turn deadline bar green on completion (v7.12.22)
                    const dlFill = document.getElementById('swml-deadline-fill');
                    if (dlFill) dlFill.style.cssText = 'height:100%;border-radius:3px;width:100%;background:#1CD991;animation:none;transition:background 0.6s ease;';
                    // Also show completed state on assess sidebar button (v7.12.28)
                    if (assessCompleteBtn) {
                        assessCompleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M5 12l5 5L20 7"/></svg> Complete';
                        assessCompleteBtn.disabled = true;
                        assessCompleteBtn.style.opacity = '0.5';
                        assessCompleteBtn.style.cursor = 'default';
                        assessCompleteBtn.classList.remove('swml-assess-ready');
                    }
                    // Refresh progress so final step turns green (v7.12.53)
                    updateProgress(state.step);
                } else {
                    state._phaseMarkedComplete = false; // Reset so user can retry (v7.12.53)
                    if (assessCompleteBtn) { assessCompleteBtn.disabled = false; assessCompleteBtn.style.pointerEvents = ''; }
                    btn.disabled = false;
                    btn.textContent = 'Mark Phase 1 Complete';
                    console.error('WML Phase Complete failed:', res);
                    addMessage('ai', '⚠️ There was a problem saving your completion status. Please try again or let your teacher know.');
                }
            } catch (e) {
                state._phaseMarkedComplete = false; // Reset so user can retry (v7.12.53)
                if (assessCompleteBtn) { assessCompleteBtn.disabled = false; assessCompleteBtn.style.pointerEvents = ''; }
                btn.disabled = false;
                btn.textContent = 'Mark Phase 1 Complete';
                console.error('WML Phase Complete error:', e);
            }
        });

        msgs.appendChild(card);
        msgs.scrollTop = msgs.scrollHeight;
    }

    // Typing indicators — delegate to shared functions (v7.12.35)
    function showTyping() { createTypingBubble($('#swml-messages')); }
    function hideTyping() { removeTypingBubble($('#swml-messages')); }

    // ══════════════════════════════════════════
    //  TIMER COMPONENT (Quote Analysis + Recall Exercises)
    // ══════════════════════════════════════════

    let timerInterval = null;
    let timerState = { running: false, remaining: 0, seconds: 0, examMode: true, onComplete: null };

    function showTimer(seconds, label) {
        removeTimer();
        const msgs = $('#swml-messages');
        if (!msgs) return;

        timerState = { running: false, remaining: seconds, seconds, examMode: true, onComplete: null };

        const bar = el('div', { className: 'swml-timer-bar', id: 'swml-timer-bar' });
        const timerLabel = el('span', { className: 'swml-timer-label' });
        timerLabel.innerHTML = label;
        const timerDisplay = el('span', { className: 'swml-timer-display', id: 'swml-timer-display', textContent: formatTime(seconds) });

        // Mode toggle: Exam (no pause/reset) vs Practice (pause + reset)
        const modeToggle = el('div', { className: 'swml-timer-mode' });
        const examBtn = el('button', { className: 'swml-timer-mode-btn active', id: 'swml-timer-exam',
            innerHTML: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Exam',
            title: 'No pausing — real exam conditions',
            onClick: () => { timerState.examMode = true; examBtn.classList.add('active'); practiceBtn.classList.remove('active'); updateControls(); } });
        const practiceBtn = el('button', { className: 'swml-timer-mode-btn', id: 'swml-timer-practice',
            innerHTML: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v0"/></svg> Practice',
            title: 'Pause and reset available',
            onClick: () => { timerState.examMode = false; examBtn.classList.remove('active'); practiceBtn.classList.add('active'); updateControls(); } });
        modeToggle.appendChild(examBtn);
        modeToggle.appendChild(practiceBtn);

        // Pause button (Practice mode only)
        const pauseBtn = el('button', { className: 'swml-timer-btn swml-timer-pause', id: 'swml-timer-pause', textContent: '⏸ Pause', style: { display: 'none' },
            onClick: () => {
                if (timerState.running) {
                    clearInterval(timerInterval);
                    timerState.running = false;
                    pauseBtn.textContent = '▶ Resume';
                    bar.classList.add('swml-timer-paused');
                } else {
                    startTimerCountdown();
                    pauseBtn.textContent = '⏸ Pause';
                    bar.classList.remove('swml-timer-paused');
                }
            }
        });

        // Reset button (Practice mode only)
        const resetBtn = el('button', { className: 'swml-timer-btn swml-timer-reset', id: 'swml-timer-reset', textContent: '↺ Reset', style: { display: 'none' },
            onClick: () => {
                clearInterval(timerInterval);
                timerState.running = false;
                timerState.remaining = timerState.seconds;
                timerDisplay.textContent = formatTime(timerState.seconds);
                timerDisplay.classList.remove('swml-timer-warning', 'swml-timer-done');
                bar.classList.remove('swml-timer-paused');
                pauseBtn.textContent = '⏸ Pause';
                micPrompt.textContent = '🎙️ Press microphone to start';
                micPrompt.style.display = '';
            }
        });

        function updateControls() {
            pauseBtn.style.display = timerState.examMode ? 'none' : 'inline-flex';
            resetBtn.style.display = timerState.examMode ? 'none' : 'inline-flex';
        }

        // Mic prompt
        const micPrompt = el('span', { className: 'swml-timer-mic-prompt', id: 'swml-timer-mic-prompt', textContent: '🎙️ Press microphone to start' });

        bar.appendChild(timerLabel);
        bar.appendChild(timerDisplay);
        bar.appendChild(micPrompt);
        bar.appendChild(modeToggle);
        bar.appendChild(pauseBtn);
        bar.appendChild(resetBtn);
        msgs.appendChild(bar);
        msgs.scrollTop = msgs.scrollHeight;
    }

    /** Called by toggleVoice when mic is pressed — auto-starts the timer if waiting */
    function triggerTimerFromMic() {
        const bar = $('#swml-timer-bar');
        if (!bar || timerState.running) return;
        const prompt = $('#swml-timer-mic-prompt');
        if (prompt) { prompt.textContent = '🔴 Recording...'; }
        startTimerCountdown();
    }

    function startTimerCountdown() {
        timerState.running = true;
        const timerDisplay = $('#swml-timer-display');
        const bar = $('#swml-timer-bar');
        if (!timerDisplay) return;

        timerInterval = setInterval(() => {
            timerState.remaining--;
            timerDisplay.textContent = formatTime(timerState.remaining);
            if (timerState.remaining <= 30 && timerState.remaining > 10) bar?.classList.add('swml-timer-pulse');
            if (timerState.remaining <= 10) { timerDisplay.classList.add('swml-timer-warning'); bar?.classList.remove('swml-timer-pulse'); }
            if (timerState.remaining <= 0) {
                clearInterval(timerInterval);
                timerState.running = false;
                timerDisplay.textContent = "Time's up";
                timerDisplay.classList.add('swml-timer-done');
                const prompt = $('#swml-timer-mic-prompt');
                if (prompt) prompt.style.display = 'none';
                // Soft chime
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.value = 523.25; osc.type = 'sine';
                    gain.gain.value = 0.12;
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.2);
                } catch (e) { /* audio unavailable */ }

                // ── EXAM MODE: Auto-submit whatever the student has ──
                if (timerState.examMode) {
                    // Stop voice recording if active
                    if (isListening && recognition) {
                        recognition.stop();
                        isListening = false;
                    }
                    const input = $('#swml-input');
                    if (input && input.value.trim()) {
                        // Has content — auto-submit it
                        setTimeout(() => sendMessage(), 500); // Brief delay so chime is heard
                    } else if (input) {
                        // No content typed — send a marker so AI knows time expired
                        input.value = "[Timer expired — no response submitted]";
                        setTimeout(() => sendMessage(), 500);
                    }
                } else {
                    // Practice mode — just prompt, don't auto-submit
                    const input = $('#swml-input');
                    if (input) { input.placeholder = "Time's up! Share your response now..."; input.focus(); }
                }
            }
        }, 1000);
    }

    function removeTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        const existing = $('#swml-timer-bar');
        if (existing) existing.remove();
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    // ══════════════════════════════════════════
    //  PLAN EXTRACTION FROM CONVERSATION
    // ══════════════════════════════════════════

    /**
     * SHARED DETECTION: Is this AI message an actual generated exam question?
     * 
     * Modern: Requires "Section A: Modern prose or drama" + Either + marks.
     * Extract: Requires "Starting with this extract" + marks + ACTUAL extract content
     *          (character names like MACBETH: or stage directions). This prevents
     *          the analysis/pattern message from false-matching when it describes
     *          the question format using example phrases.
     *
     * This is the SINGLE SOURCE OF TRUTH — used by extractAndSavePlan,
     * renderExamQuestionPanel, and copyPlan.
     */
    function isGeneratedQuestion(msg) {
        const hasSectionA = /Section A:\s*Modern prose or drama/i.test(msg);
        const hasMarks = /\[\s*30\s*marks?\s*\]/i.test(msg);
        // Modern: "Section A" + Either + marks
        if (hasSectionA && /\bEither\b/i.test(msg) && hasMarks) return 'modern';
        // Extract: must have the question phrase + marks + ACTUAL extracted text
        // (character names like "> **MACBETH:**" in block quotes prove real extract is present)
        const hasStarting = /Starting with this (?:extract|speech),?\s*how does/i.test(msg);
        const hasActualExtract = /\n>\s*\*{0,2}[A-Z][A-Z ]+\*{0,2}:/.test(msg) || /\n\*{0,2}[A-Z][A-Z ]+\*{0,2}:\s*\n/.test(msg);
        const hasWriteAbout = /^(?:\*{0,2})Write about:(?:\*{0,2})/m.test(msg);
        if (hasStarting && hasMarks && hasActualExtract && hasWriteAbout) return 'extract';
        return false;
    }

    /** Extract theme + summary + location from a generated question message. */
    function extractQuestionData(msg, type) {
        let theme = '', summary = '', location = '';
        if (type === 'modern') {
            const q1M = msg.match(/\*{0,2}0\s*1\*{0,2}\s*(?:&nbsp;|\u00a0|\s)*(How does .+?\?)/i);
            const q2M = msg.match(/\*{0,2}0\s*2\*{0,2}\s*(?:&nbsp;|\u00a0|\s)*(How does .+?\?)/i);
            const q1 = q1M ? q1M[1].replace(/[\*_]/g, '').substring(0, 120).trim() : '';
            const q2 = q2M ? q2M[1].replace(/[\*_]/g, '').substring(0, 120).trim() : '';
            summary = q1 && q2 ? `Q1: ${q1} | Q2: ${q2}` : (q1 || q2 || '');
            const tm = (q1M ? q1M[1] : '').match(/use (?:the character of )?(.+?)\s+to\s+(?:explore|suggest|present|show)/i);
            if (tm) theme = tm[1].replace(/[\*_]/g, '').trim();
            // Modern texts have no extract, so no location
        } else if (type === 'extract') {
            const qM = msg.match(/(Starting with this (?:extract|speech),?\s*how does .+?\?)/i);
            summary = qM ? qM[1].substring(0, 200).trim() : '';
            const tm = msg.match(/how does \w+ present\s+(.{5,80}?)(?:\s+in\s+this|\s+in\s+the|\?)/im);
            if (tm) theme = tm[1].replace(/[\*_]/g, '').trim();

            // Extract location: "Act X Scene Y", "Act X", "Chapter X", etc.
            const locMatch = msg.match(/(?:extract from|Extract \()\s*\*{0,2}((?:Act\s+\d+(?:\s+Scene\s+\d+)?|Chapter\s+\d+))/i)
                || msg.match(/\*{0,2}(Act\s+\d+(?:[,:]?\s*Scene\s+\d+)?)\*{0,2}/i);
            if (locMatch) location = locMatch[1].replace(/[\*_]/g, '').trim();
        }
        return (summary || theme) ? { theme, summary: summary.substring(0, 250), location } : null;
    }

    /** 
     * Collect only CONFIRMED generated questions from chat history.
     * A question is "confirmed" when a student sends a confirmation message
     * (e.g. "I'm happy with this", "no changes") AFTER the question appears.
     * Unconfirmed questions (student hasn't responded yet) are excluded.
     */
    function collectAllQuestions() {
        const history = state.chatHistory;
        const confirmPattern = /(?:happy|satisfied|looks good|that's great|perfect|no changes?|don'?t change|i'?m good|yes.*fine|no.*change|happy with this|i'?m done)/i;
        const questions = [];
        const seen = new Set();

        // Scan full interleaved history
        let lastQuestionMsg = null;
        let lastQuestionType = null;
        let lastQuestionIdx = -1;

        for (let i = 0; i < history.length; i++) {
            const msg = history[i];

            if (msg.role === 'assistant') {
                const type = isGeneratedQuestion(msg.content);
                if (type) {
                    // Found a question — track it, but don't add yet
                    lastQuestionMsg = msg.content;
                    lastQuestionType = type;
                    lastQuestionIdx = i;
                }
            } else if (msg.role === 'user' && lastQuestionMsg) {
                // Student message after a detected question — is it a confirmation?
                if (confirmPattern.test(msg.content)) {
                    const data = extractQuestionData(lastQuestionMsg, lastQuestionType);
                    if (data && data.summary) {
                        const key = data.summary.substring(0, 80);
                        if (!seen.has(key)) {
                            seen.add(key);
                            questions.push({ ...data, index: lastQuestionIdx, rawMsg: lastQuestionMsg });
                        }
                    }
                    lastQuestionMsg = null; // consumed
                }
            }
        }
        return questions;
    }

    /**
     * FALLBACK plan extraction from conversation.
     * Primary saving happens via AI function calls (save_plan_element).
     * This regex-based extraction catches elements the AI may not have
     * explicitly saved via function calling (e.g. question detection).
     */
    async function extractAndSavePlan(studentMsg, aiReply) {
        const saves = [];
        console.log('WML Plan Extract: student msg length =', studentMsg.length, ', task =', state.task);

        // ══════════════════════════════════════════
        //  FUNCTION CALLS ARE PRIMARY — this fallback is CONSERVATIVE.
        //  Only extract from STUDENT messages when AI explicitly asked.
        //  Never extract from AI commentary — too unreliable.
        // ══════════════════════════════════════════

        if (state.task === 'exam_question') {
            // ── Text + Author: always save from session state ──
            if (!state.plan.question_text) {
                const textLabel = state.textName || getTextLabel(state.text, state.subject);
                if (textLabel) saves.push({ type: 'question_text', content: textLabel, step: 1 });
            }
            if (!state.plan.goal && AUTHOR_MAP[state.text]) {
                saves.push({ type: 'goal', content: AUTHOR_MAP[state.text], step: 1 });
            }

            // ── Theme + Question: CONFIRMATION-TRIGGERED ──
            // Only save when the student has CONFIRMED they're happy.
            // Search backwards through chat history to find the actual question.
            const isConfirmation = /(?:happy|satisfied|looks good|that's great|perfect|no changes?|don'?t change|i'?m good|yes.*fine|no.*change)/i.test(studentMsg);
            const isRefinementConfirm = /(?:happy with this|i'?m done|no,?\s*i'?m|no thanks)/i.test(studentMsg);

            if (isConfirmation || isRefinementConfirm) {
                const aiMessages = state.chatHistory
                    .filter(m => m.role === 'assistant')
                    .map(m => m.content);

                // Search backwards for the MOST RECENT actual generated question
                for (let i = aiMessages.length - 1; i >= 0; i--) {
                    const type = isGeneratedQuestion(aiMessages[i]);
                    if (!type) continue;

                    const data = extractQuestionData(aiMessages[i], type);
                    if (!data) continue;

                    if (data.theme && data.theme.length > 3) {
                        saves.push({ type: 'exam_question_theme', content: data.theme, step: 3 });
                    }
                    if (data.summary) {
                        saves.push({ type: 'exam_question_output', content: data.summary, step: 4 });
                    }

                    console.log('WML: Confirmation-triggered save from msg', i, '| type:', type, '| theme:', data.theme, '| summary:', data.summary?.substring(0, 60));

                    // Persist to saved questions for future essay plan use
                    try {
                        // Clean the AI message: strip confirm prompts and A/B options
                        let cleanMsg = (aiMessages[i] || '')
                            .replace(/(?:Is this your final version|Here is your confirmed|Are you happy)[\s\S]*$/i, '')
                            .replace(/\*{0,2}A\)?\*{0,2}\s*[—\-–]?\s*[✅][\s\S]*$/i, '')
                            .trim();
                        apiPost(API.savedQuestions, {
                            board: state.board, subject: state.subject, text: state.text,
                            summary: data.summary || '', theme: data.theme || '',
                            location: data.location || '',
                            full_text: cleanMsg || data.summary,
                        });
                        console.log('WML: Question persisted to saved questions');
                        // Pulse the save button to remind student to save
                        const saveBtn = $('#swml-save-btn');
                        if (saveBtn) { saveBtn.classList.add('swml-pulse'); }
                    } catch (e) { console.warn('WML: Failed to persist question:', e); }

                    break;
                }
            }
        }

        // ══════════════════════════════════════════
        //  PLANNING/ASSESSMENT/POLISHING — Conservative fallback only
        //  Rule: Only extract from STUDENT message when previous AI
        //  explicitly asked for that specific element.
        // ══════════════════════════════════════════

        if (state.task !== 'exam_question') {
            const prevAssistantMsgs = state.chatHistory.filter(m => m.role === 'assistant');
            const prevAI = prevAssistantMsgs.length >= 2 ? (prevAssistantMsgs[prevAssistantMsgs.length - 2]?.content || '') : '';

            // ── CONFIRMATION INTERCEPTOR ──
            // When the student confirms via A/B prompt, the AI often says "Saved!" but
            // doesn't actually call save_session_element. This interceptor detects the
            // confirmation and saves the element directly from the frontend.
            const trimmedStudent = studentMsg.trim().replace(/^["']|["']$/g, '');
            const isConfirmA = /^(?:A\)?\.?\s*$|A\)?\s*[—\-–]|yes.*save|save (?:this|it)|✅|confirm|i'?m happy|looks? good|that'?s? (?:good|great|fine|perfect))/i.test(trimmedStudent) && trimmedStudent.length < 80;
            const aiAcknowledgedSave = /(?:saved|pinned|recorded|noted)\s*[!.]*\s*✅/i.test(aiReply);

            if ((isConfirmA || aiAcknowledgedSave) && prevAI.length > 20) {
                // ── PRIMARY PATH: [PANEL] tag saves ──
                // If the AI used [PANEL: type]content[/PANEL] tags, we have exact content — no regex needed.
                if (state._pendingPanelSaves && Object.keys(state._pendingPanelSaves).length > 0) {
                    for (const [pType, pContent] of Object.entries(state._pendingPanelSaves)) {
                        if (pContent && pContent.length > 2 && validatePlanContent(pType, pContent)) {
                            saves.push({ type: pType, content: pContent, step: state.step });
                            console.log('WML [PANEL] Save: Confirmed', pType, '→', pContent.substring(0, 80));
                        }
                    }
                    state._pendingPanelSaves = {}; // Clear after saving
                }

                // ── FALLBACK PATH: regex extraction (only if no [PANEL] saves were found) ──
                if (saves.length === 0) {
                // Check if prevAI had a confirm prompt (the A/B save options)
                const hasConfirmPrompt = /[✅].*(?:save|yes)/i.test(prevAI) && /[✏️].*(?:change|adjust)/i.test(prevAI);

                if (hasConfirmPrompt) {
                    // Extract the label from the confirm prompt
                    const labelMatch = prevAI.match(/(?:final version of (?:your\s+)?|happy with (?:your\s+)?)\*{0,2}([^*?\n]+?)\*{0,2}\s*\?/i);
                    let label = labelMatch ? labelMatch[1].trim() : '';

                    // ── FALLBACK: AI often paraphrases the confirm template ──
                    // e.g. "Here's the goal I'll save:" instead of "Is this your final version of your Goal?"
                    // Only fires when hasConfirmPrompt is true (A/B with ✅/✏️) but standard label not found.
                    if (!label) {
                        if (/(?:goal.*(?:i'll|to|we'll)\s*save|(?:save|confirm).*goal|here'?s.*goal)/i.test(prevAI)) {
                            label = 'goal';
                        } else if (/(?:question.*(?:save|confirm)|(?:save|confirm).*question)/i.test(prevAI)) {
                            label = 'essay question';
                        } else if (/keyword/i.test(prevAI) && /save|confirm/i.test(prevAI)) {
                            label = 'keywords';
                        } else if (/(?:beginning|opening|first).*quote/i.test(prevAI)) {
                            label = 'beginning quote';
                        } else if (/(?:middle|second|turning).*quote/i.test(prevAI)) {
                            label = 'middle quote';
                        } else if (/(?:end|closing|final|third).*quote/i.test(prevAI)) {
                            label = 'end quote';
                        } else if (/introduction/i.test(prevAI) && /save|confirm/i.test(prevAI)) {
                            label = 'introduction';
                        } else if (/conclusion/i.test(prevAI) && /save|confirm/i.test(prevAI)) {
                            label = 'conclusion';
                        } else if (/(?:body|paragraph)\s*(?:1|one|first)/i.test(prevAI)) {
                            label = 'body paragraph 1';
                        } else if (/(?:body|paragraph)\s*(?:2|two|second)/i.test(prevAI)) {
                            label = 'body paragraph 2';
                        } else if (/(?:body|paragraph)\s*(?:3|three|third)/i.test(prevAI)) {
                            label = 'body paragraph 3';
                        }
                        if (label) console.log('WML Confirm Interceptor: Fallback label detected →', label);
                    }

                    // Map label → element_type
                    const LABEL_MAP = {
                        'essay question':       'question_text',
                        'goal':                 'goal',
                        'keywords':             'keywords',
                        'beginning quote':      'anchor_quote_start',
                        'middle quote':         'anchor_quote_mid',
                        'end quote':            'anchor_quote_end',
                        'body paragraph 1 plan':'body_para_1',
                        'body paragraph 2 plan':'body_para_2',
                        'body paragraph 3 plan':'body_para_3',
                        'body paragraph 1':     'body_para_1',
                        'body paragraph 2':     'body_para_2',
                        'body paragraph 3':     'body_para_3',
                        'introduction plan':    'introduction',
                        'introduction':         'introduction',
                        'conclusion plan':      'conclusion',
                        'conclusion':           'conclusion',
                    };
                    const elementType = LABEL_MAP[label.toLowerCase()] || '';

                    const existingContent = state.plan[elementType]?.content || '';
                    const existingLooksLikeJunk = /(?:step \d|planning\s*>|setting\s*>|assessment\s*>|polishing\s*>|section \d|part [ab]\.\d)/i.test(existingContent)
                        || (elementType === 'keywords' && /(?:might be|stronger|capture|think about|consider|with that in mind|here'?s a)/i.test(existingContent))
                        || (elementType === 'keywords' && existingContent.length < 40 && !/[;,]/.test(existingContent))  // single-word or short keyword — overwrite with full list
                        || (elementType === 'goal' && existingContent.length < 15);

                    if (elementType && (!existingContent || existingLooksLikeJunk)) {
                        // Extract content: text ABOVE the confirm prompt
                        // Split on the A/B option line and take everything above
                        const splitPoint = prevAI.search(/\*{0,2}A\)?\*{0,2}\s*[—\-–]?\s*✅/i);
                        let candidateContent = splitPoint > 0 ? prevAI.substring(0, splitPoint).trim() : '';

                        // Strip progress bar / step indicator lines (these leak into extraction)
                        candidateContent = candidateContent.replace(/^.*?(?:Planning|Setting|Assessment|Polishing|Goal Setting)\s*>.*?(?:Step \d+).*$/gim, '').trim();
                        // Also remove the "Is this your final version..." question
                        candidateContent = candidateContent.replace(/\*{0,2}Is this your final version.*?\?\*{0,2}\s*$/i, '').trim();
                        // Remove "Are you happy with..." question
                        candidateContent = candidateContent.replace(/\*{0,2}(?:Are you happy|Review these).*?\?\*{0,2}\s*$/i, '').trim();
                        // Strip emoji progress indicators (📝🔨 etc. at start of lines)
                        candidateContent = candidateContent.replace(/^[\u{1F4DD}\u{1F528}\u{1F3AF}\u{2705}\u{1F6E0}]\s*/gmu, '').trim();

                        // For specific types, apply targeted extraction from candidateContent
                        let finalContent = '';
                        if (elementType === 'question_text') {
                            // Look for question patterns in the candidate
                            const qMatch = candidateContent.match(/(?:Starting with this (?:extract|speech|moment).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))|(?:How (?:does|far|is).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))|(?:(?:Explore|Discuss|Analyse|To what extent).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))/is);
                            finalContent = qMatch ? qMatch[0].trim() : '';
                            // Fallback: use last substantial paragraph
                            if (!finalContent) {
                                const paras = candidateContent.split(/\n\n+/).filter(p => p.trim().length > 20);
                                finalContent = paras[paras.length - 1]?.trim() || '';
                            }
                        } else if (elementType === 'goal') {
                            // Look for "Your goal:" or "goal I'll save:" pattern, then capture content after
                            const goalMatch = candidateContent.match(/(?:your\s+)?goal(?:\s+(?:I'll|I will|to|we'll)\s+save)?[:\s]+\n?\s*(.{10,300})/i);
                            if (goalMatch) {
                                finalContent = goalMatch[1].replace(/\*{1,2}/g, '').trim();
                            } else {
                                // Fallback: last substantial line (always contains the goal text)
                                const lines = candidateContent.split('\n').filter(l => l.trim().length > 10);
                                finalContent = lines[lines.length - 1]?.replace(/\*{1,2}/g, '').trim() || '';
                            }
                        } else if (elementType === 'keywords') {
                            // Strategy: find the KEYWORD LIST, not the advice text around it.
                            // The AI presents keywords in various formats — check all of them.
                            const lines = candidateContent.split('\n').map(l => l.trim()).filter(Boolean);

                            // 1. Look for bullet-point list (3+ lines starting with - or • or *)
                            const bulletLines = lines.filter(l => /^[-•*]\s+/.test(l));
                            if (bulletLines.length >= 3) {
                                finalContent = bulletLines.map(l => l.replace(/^[-•*]\s+/, '').replace(/\*{1,2}/g, '').trim()).join('; ');
                            }
                            // 2. Look for semicolon-separated list (most common: "ambition; moral conflict; tension")
                            if (!finalContent) {
                                const semiList = lines.find(l => (l.match(/;/g) || []).length >= 2 && l.length < 300);
                                if (semiList) finalContent = semiList.replace(/\*{1,2}/g, '').trim();
                            }
                            // 3. Look for "Keywords:" or "Key words:" or "keyword set:" label
                            if (!finalContent) {
                                const kwMatch = candidateContent.match(/(?:keywords?|key ?words?|keyword (?:set|list)|refined set)[:\s]+\n?\s*(.{5,300})/i);
                                if (kwMatch) finalContent = kwMatch[1].replace(/\*{1,2}/g, '').trim();
                            }
                            // 4. Look for comma-separated list with 3+ items
                            if (!finalContent) {
                                const commaList = lines.find(l => (l.match(/,/g) || []).length >= 2 && l.length > 10 && l.length < 300 && !/(?:think about|notice|stronger|capture)/i.test(l));
                                if (commaList) finalContent = commaList.replace(/\*{1,2}/g, '').trim();
                            }
                            // 5. Fallback: last bold line (keywords are often in **bold**)
                            if (!finalContent) {
                                const boldLine = lines.filter(l => /^\*\*[^*]+\*\*$/.test(l)).pop();
                                if (boldLine) finalContent = boldLine.replace(/\*{1,2}/g, '').trim();
                            }
                        } else if (/^anchor_quote/.test(elementType)) {
                            // Look for quoted text — AI uses various formats
                            // 1. Standard quotes: "text" or 'text' or "text"
                            const quoteMatch = candidateContent.match(/['""""]([^'""""]{5,200}?)['""""]/);
                            if (quoteMatch) {
                                finalContent = quoteMatch[1].trim();
                            }
                            // 2. Markdown italic quote: *"text"* or _text_
                            if (!finalContent) {
                                const italicMatch = candidateContent.match(/\*([^*]{5,200}?)\*/);
                                if (italicMatch && !/(?:think about|consider|notice)/i.test(italicMatch[1])) {
                                    finalContent = italicMatch[1].replace(/^["'""]|["'""]$/g, '').trim();
                                }
                            }
                            // 3. "Quote:" or "Your quote:" label
                            if (!finalContent) {
                                const labelMatch = candidateContent.match(/(?:quote|anchor|your (?:beginning|middle|end))[:\s]+\n?\s*(.{5,200})/i);
                                if (labelMatch) finalContent = labelMatch[1].replace(/\*{1,2}|["'""]/g, '').trim();
                            }
                        } else {
                            // Body paras, intro, conclusion: find the plan summary, not advice text
                            // Clean markdown formatting
                            let cleaned = candidateContent
                                .replace(/^#+\s*.*/gm, '')  // remove headers
                                .replace(/\*{1,2}/g, '')     // remove bold/italic
                                .trim();
                            const blocks = cleaned.split(/\n\n+/).filter(b => b.trim().length > 15);

                            // Prefer blocks that look like plan content (contain structural words)
                            const planBlock = blocks.find(b =>
                                /(?:topic sentence|argument|thesis|point|evidence|quote|analysis|technique|context|AO[1-4]|TTECEA|paragraph|opening|closing)/i.test(b)
                            );
                            if (planBlock) {
                                finalContent = planBlock.trim();
                            } else if (blocks.length > 1) {
                                // Fallback: last substantial block
                                finalContent = blocks[blocks.length - 1].trim();
                            } else {
                                finalContent = cleaned;
                            }
                        }

                        // Reject progress-bar / step indicator text that leaked through
                        if (finalContent && /^(?:.*(?:step \d|planning\s*>|setting\s*>|section \d|part [ab]))/i.test(finalContent)) {
                            console.warn('WML Confirm Interceptor: Rejected progress-bar content for', elementType, '→', finalContent.substring(0, 60));
                            finalContent = '';
                        }

                        if (finalContent && finalContent.length > 3) {
                            saves.push({ type: elementType, content: finalContent, step: state.step });
                            console.log('WML Confirm Interceptor: Detected', elementType, '→', finalContent.substring(0, 80));
                        } else {
                            console.warn('WML Confirm Interceptor: Matched label "' + label + '" → ' + elementType + ' but could not extract content from prevAI');
                        }
                    }
                }
                } // close if (saves.length === 0) — fallback regex path
            }

            // ── QUESTION-SPECIFIC INTERCEPTOR ──
            // The AI often skips the formal confirm prompt for questions, going straight to goals.
            // When the student says "happy", "looks good", etc. and the previous AI message
            // contained a generated question, save it directly.
            // v7.15.66: Widened from planning-only to also cover essay_plan + model_answer.
            // The Generate / Paste protocol paths confirm questions with plain-text
            // "happy / save it?" prompts rather than @CONFIRM_ELEMENT markers — this
            // interceptor is exactly what pushes question_text into `saves` for those
            // paths, which then feeds the WML.injectQuestionIntoCanvas hook below
            // so the Essay Question / Extract sections actually get written.
            if (!state.plan.question_text && (state.task === 'planning' || state.task === 'essay_plan' || state.task === 'model_answer')) {
                const studentConfirmsQuestion = /(?:happy|satisfied|looks? good|that'?s? (?:good|great|fine|perfect)|no change|don'?t change|i'?m good|yes|yep|yeah)/i.test(trimmedStudent) && trimmedStudent.length < 80;
                // Also catch when AI says "Saved!" for a question (it thinks it saved but didn't)
                const aiClaimsSaved = /(?:saved|pinned|recorded|noted).*(?:question|essay question)/i.test(aiReply);

                if (studentConfirmsQuestion || aiClaimsSaved) {
                    // Search backwards through AI messages for the most recent generated question
                    for (let i = prevAssistantMsgs.length - 1; i >= Math.max(0, prevAssistantMsgs.length - 4); i--) {
                        const msg = prevAssistantMsgs[i]?.content || '';
                        // Look for question patterns: "Starting with this extract", mark allocations, "How does Shakespeare"
                        const hasQuestionPattern = /(?:starting with this (?:extract|speech|moment)|how (?:does|far|is)\s+\w+\s+(?:present|use|explore|convey)|to what extent|\[\s*\d+\s*marks?\s*\])/i.test(msg);
                        if (hasQuestionPattern && msg.length > 50) {
                            // Extract the question text
                            const qMatch = msg.match(/(?:Starting with this (?:extract|speech|moment).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))|(?:How (?:does|far|is).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))|(?:(?:Explore|Discuss|Analyse|To what extent).*?(?:\[\d+ marks?\]|\(\d+ marks?\)))/is);
                            if (qMatch) {
                                saves.push({ type: 'question_text', content: qMatch[0].trim(), step: 1 });
                                console.log('WML Question Interceptor: Captured question from AI message', i, '→', qMatch[0].substring(0, 80));
                                break;
                            }
                            // Fallback: find the question between "Question:" and the mark allocation
                            const qBlock = msg.match(/(?:\*{0,2}Question[:\s]*\*{0,2}\s*\n?)(.{20,500}?\[\s*\d+\s*marks?\s*\])/is);
                            if (qBlock) {
                                saves.push({ type: 'question_text', content: qBlock[1].trim(), step: 1 });
                                console.log('WML Question Interceptor: Captured question block from AI message', i);
                                break;
                            }
                        }
                    }
                }
            }

            // Question text: ONLY from student message, ONLY if it looks like an actual exam question
            // v7.15.19: Strip protocol breadcrumbs/progress bars before saving
            const cleanStudentMsg = studentMsg
                .replace(/📌[^\n]*(?:Planning|Setting|Assessment|Polishing|Goal Setting)[^\n]*/gi, '')
                .replace(/\[Progress bar:[^\]]*\]/gi, '')
                .replace(/\[PROGRESS:\s*\d+\]/gi, '')
                .trim();
            if (!state.plan.question_text && cleanStudentMsg.length > 30) {
                const looksLikeQuestion = /(?:starting with this (?:extract|speech)|how (?:does|far|is)|to what extent|read the following extract)/i.test(cleanStudentMsg);
                const hasMarks = /\[\s*\d+\s*marks?\s*\]/i.test(cleanStudentMsg);
                if (looksLikeQuestion || hasMarks) {
                    saves.push({ type: 'question_text', content: cleanStudentMsg, step: 1 });
                }
            }

            // Goal: DISABLED — now handled exclusively by confirm interceptor via @GOAL_SETUP → @CONFIRM_ELEMENT
            // The old fallback saved student's raw message before confirmation. Removed in v7.10.16.

            // Keywords: DISABLED — now handled exclusively by confirm interceptor via @CONFIRM_ELEMENT
            // The old fallback saved student's raw message before confirmation (e.g. "supernatural" saved
            // immediately when student typed it, before the AI's Socratic keyword refinement). Removed in v7.10.16.

            // Anchor quotes: ONLY from student messages using explicit B:/M:/E: format
            if (state.task === 'planning' && state.step >= 3) {
                if (studentMsg.length > 5 && studentMsg.length < 300) {
                    const bStudent = studentMsg.match(/\bB[:\s)]+\s*['""""](.{5,120}?)['""""]/i);
                    const mStudent = studentMsg.match(/\bM[:\s)]+\s*['""""](.{5,120}?)['""""]/i);
                    const eStudent = studentMsg.match(/\bE[:\s)]+\s*['""""](.{5,120}?)['""""]/i);
                    if (bStudent) saves.push({ type: 'anchor_quote_start', content: bStudent[1].trim(), step: 3 });
                    if (mStudent) saves.push({ type: 'anchor_quote_mid', content: mStudent[1].trim(), step: 3 });
                    if (eStudent) saves.push({ type: 'anchor_quote_end', content: eStudent[1].trim(), step: 3 });
                }
            }
        }

        // ── Polishing-specific extraction (level, focus, revisions) ──
        if (state.task === 'polishing') {
            // Current level: "your writing currently shows Level 4" or "currently at Level 3"
            if (!state.plan.current_level) {
                const lvlMatch = aiReply.match(/(?:currently (?:shows?|at|sits? at|demonstrates?)|writing is at)\s*(Level \d[^.,\n]{0,30})/i);
                if (lvlMatch) saves.push({ type: 'current_level', content: lvlMatch[1].trim(), step: 2 });
            }
            // Target level: "working towards Level 5" or "target is Level 5"
            if (!state.plan.target_level) {
                const tgtMatch = aiReply.match(/(?:work(?:ing)? towards?|target(?:ing)?|aim(?:ing)? for|to reach)\s*(Level \d[^.,\n]{0,30})/i);
                if (tgtMatch) saves.push({ type: 'target_level', content: tgtMatch[1].trim(), step: 2 });
            }
            // Polish focus: "you'd like to polish" or "focusing on" a specific area
            if (!state.plan.polish_focus) {
                const focusMatch = aiReply.match(/(?:polish(?:ing)?|focus(?:ing)? on|improv(?:e|ing)|work(?:ing)? on)\s*(?:your\s*)?(.{10,100}?)(?:\.|to reach|—|,\s*(?:which|let's))/i);
                if (focusMatch && /introduction|body|conclusion|analysis|evidence|thesis|AO\d|technique|vocabulary|structure/i.test(focusMatch[1])) {
                    saves.push({ type: 'polish_focus', content: focusMatch[1].trim(), step: 3 });
                }
            }
        }

        // ── Assessment-specific extraction (AO scores, grade, feedback) ──
        if (state.task === 'assessment') {
            // AO scores: "AO1: 12/20" or "AO1 = 12" or "AO1 score: 12/20"
            const aoPatterns = [
                { type: 'ao1_score', regex: /AO1[:\s=]+(\d+(?:\/\d+)?(?:\s*marks?)?)/i },
                { type: 'ao2_score', regex: /AO2[:\s=]+(\d+(?:\/\d+)?(?:\s*marks?)?)/i },
                { type: 'ao3_score', regex: /AO3[:\s=]+(\d+(?:\/\d+)?(?:\s*marks?)?)/i },
                { type: 'ao4_score', regex: /AO4[:\s=]+(\d+(?:\/\d+)?(?:\s*marks?)?)/i },
            ];
            for (const { type: aoType, regex } of aoPatterns) {
                const m = aiReply.match(regex);
                if (m) saves.push({ type: aoType, content: m[1].trim(), step: 5 });
            }

            // Total score: "Total: 24/30" or "Total score: 24/30" or "Overall: 24"
            // IMPORTANT: Per-section totals use small denominators (X/2, X/3, X/4). Final essay total uses X/30 or X/34.
            // Only match when denominator is >= 10 to avoid premature extraction from per-section assessments.
            if (!state.plan.total_score) {
                const totalMatch = aiReply.match(/(?:total|overall|grand total|final score)\s*(?:score|marks?)?[:\s=]+(\d+(?:\.\d+)?\/[1-9]\d+(?:\s*marks?)?)/i)
                    || aiReply.match(/(\d+(?:\.\d+)?\/[1-9]\d+)\s*(?:marks?\s*)?(?:overall|total|grand)/i);
                if (totalMatch) saves.push({ type: 'total_score', content: totalMatch[1].trim(), step: 8 });
            }

            // Grade/Level: "Grade 7" or "Grade: 3" — NOT "Level 3 features" from per-section alignment descriptions
            // The protocol requires "Grade: Z" format in the final summary. "Level X" in mid-assessment is AQA level alignment, not the grade.
            if (!state.plan.grade) {
                const gradeMatch = aiReply.match(/\bgrade\s*:?\s*(\d[^.,\n]{0,30})/i)
                    || aiReply.match(/\blevel\s*:\s*(\d[^.,\n]{0,30})/i);
                if (gradeMatch) saves.push({ type: 'grade', content: gradeMatch[0].trim(), step: 8 });
            }

            // Strengths: "Key strength:" or "Main strength:" or "Your strongest area:"
            if (!state.plan.strength_1) {
                const strMatch = aiReply.match(/(?:key strength|main strength|strongest area|biggest strength)[:\s]+(.{10,200}?)(?:\.|$)/im);
                if (strMatch) saves.push({ type: 'strength_1', content: strMatch[1].trim(), step: 8 });
            }

            // Targets: "Priority target:" or "Key target:" or "Focus on:"
            const targetPatterns = [
                /(?:priority target|first target|key target|target 1|main target)[:\s]+(.{10,200}?)(?:\.|$)/im,
                /(?:second target|target 2|also work on|additionally)[:\s]+(.{10,200}?)(?:\.|$)/im,
            ];
            if (!state.plan.target_1) {
                const m = aiReply.match(targetPatterns[0]);
                if (m) saves.push({ type: 'target_1', content: m[1].trim(), step: 8 });
            }
            if (!state.plan.target_2) {
                const m = aiReply.match(targetPatterns[1]);
                if (m) saves.push({ type: 'target_2', content: m[1].trim(), step: 8 });
            }
        }

        // ── Save any extracted elements ──
        for (const item of saves) {
            if (!validatePlanContent(item.type, item.content)) continue;
            try {
                await apiPost(API.planElement, item);
                state.plan[item.type] = { content: item.content };
                console.log('WML: Saved plan element:', item.type, '→', item.content.substring(0, 60));
            } catch (e) {
                console.warn('WML: Failed to save plan element:', item.type, e);
            }
        }

        // v7.15.65: Inject a confirmed question (and any accompanying extract) into
        // the canvas — mirrors what the Saved-Question overlay does via selectQuestion,
        // so the Generate + Paste paths also populate the Essay Question / Extract
        // sections. Guarded by a placeholder check inside the helper (idempotent).
        const qSave = saves.find(s => s.type === 'question_text' && s.content && s.content.length > 20);
        // v7.15.66: diagnostic — one-line check of why injection did/did not fire
        console.log('WML inject-check: task=', state.task, 'qSave=', !!qSave, 'saves.len=', saves.length, 'hasHelper=', typeof WML !== 'undefined' && typeof WML.injectQuestionIntoCanvas === 'function');
        if (qSave
            && typeof WML !== 'undefined'
            && typeof WML.injectQuestionIntoCanvas === 'function'
            && (state.task === 'essay_plan' || state.task === 'model_answer')) {
            // Pull any accompanying extract from the AI message: block-quote lines are
            // the extract text; "from Act X Scene Y" / "Chapter N" / "pages N" is the location.
            const aiLines = (aiReply || '').split('\n');
            const quoteLines = aiLines
                .filter(l => /^\s*>\s*/.test(l))
                .map(l => l.replace(/^\s*>\s*/, '').trim())
                .filter(Boolean);
            const extractText = quoteLines.join('\n');
            const locMatch = (aiReply || '').match(
                /from\s+(Act\s+\d+[^\n.,]{0,40}|Chapter\s+\d+[^\n.,]{0,40}|Scene\s+\d+[^\n.,]{0,40}|pages?\s+\d+[^\n.,]{0,40})/i
            );
            const extractLoc = locMatch ? locMatch[1].trim() : '';
            try {
                WML.injectQuestionIntoCanvas(qSave.content, extractText, extractLoc);
            } catch (e) {
                console.warn('WML: injectQuestionIntoCanvas failed', e);
            }
        }

        // ── Offer to save generated question to bank (planning only) ──
        // Don't show if question was loaded from the saved bank (already saved)
        if (state.task === 'planning' && !state._questionFromBank) {
            const savedQuestion = saves.find(s => s.type === 'question_text' && s.content.length > 20);
            if (savedQuestion) {
                // Find the source AI message containing the question for full_text
                const aiMsgs = state.chatHistory.filter(m => m.role === 'assistant').map(m => m.content);
                let sourceAI = '';
                for (let i = aiMsgs.length - 1; i >= Math.max(0, aiMsgs.length - 5); i--) {
                    if (aiMsgs[i] && aiMsgs[i].includes(savedQuestion.content.substring(0, 40))) {
                        sourceAI = aiMsgs[i];
                        break;
                    }
                }
                showSaveToQuestionBankPrompt(savedQuestion.content, sourceAI);
            }
        }

        if (saves.length > 0) {
            renderPlan();
            const est = estimateStep(state.plan);
            if (est > state.step) updateProgress(est);
        } else {
            console.log('WML Plan Extract: no elements detected in this exchange');
        }
    }

    const MAX_HISTORY_MESSAGES = 24; // ~12 exchanges — keeps context manageable

    /**
     * Show saved question picker above the chat input for essay_plan tasks.
     * Fetches questions from the backend and renders clickable cards.
     * Clicking a card auto-fills the input and sends the message.
     */
    async function showSavedQuestionPicker() {
        try {
            const res = await apiGet(API.savedQuestions + `?board=${state.board}&text=${state.text}`);
            if (!res.success || !res.questions || res.questions.length === 0) return;

            const msgs = $('#swml-messages');
            if (!msgs) return;

            const picker = el('div', { className: 'swml-saved-questions', id: 'swml-saved-questions' });
            picker.appendChild(el('div', { className: 'swml-saved-questions-title', textContent: `📂 Your saved questions for ${getTextLabel(state.text, state.subject)} (${res.questions.length})` }));
            picker.appendChild(el('div', { className: 'swml-saved-questions-hint', textContent: 'Click a question to use it, or type your own below' }));

            const list = el('div', { className: 'swml-saved-questions-list' });
            res.questions.forEach((q, idx) => {
                const card = el('button', { className: 'swml-saved-question-card', onClick: () => {
                    // Auto-fill and send
                    const input = $('#swml-input');
                    if (input) {
                        // Strategy: use full_text FIRST (has extract + question),
                        // fall back to summary (stem only) if full_text unavailable.
                        let questionText = '';
                        if (q.full_text && q.full_text.length > 40) {
                            // Clean markdown and strip any leftover confirm/prompt text
                            let ft = q.full_text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
                            ft = ft.replace(/(?:Is this your final version|Here is your confirmed|Are you happy)[\s\S]*$/i, '').trim();
                            ft = ft.replace(/\*{0,2}A\)?\*{0,2}\s*[—\-–]?\s*[✅][\s\S]*$/i, '').trim();
                            ft = ft.replace(/(?:Saved!|Great|Excellent).*?(?:question|locked)[\s\S]{0,100}$/i, '').trim();
                            questionText = ft;
                        }
                        // Fallback to summary if full_text was empty or too short
                        if (!questionText || questionText.length < 20) {
                            questionText = q.summary || `Question ${idx + 1}`;
                        }
                        input.value = questionText;
                        input.style.height = 'auto';
                        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
                    }
                    // Flag: question came from saved bank — don't show save-to-bank prompt again
                    state._questionFromBank = true;
                    // Remove the picker
                    picker.remove();
                    // Send the message
                    sendMessage();
                }});

                if (q.theme) card.appendChild(el('div', { className: 'swml-saved-q-theme', textContent: q.theme }));
                if (q.location) card.appendChild(el('div', { className: 'swml-saved-q-location', textContent: `📍 ${q.location}` }));
                card.appendChild(el('div', { className: 'swml-saved-q-summary', textContent: q.summary || `Question ${idx + 1}` }));
                list.appendChild(card);
            });

            picker.appendChild(list);
            picker.appendChild(el('button', { className: 'swml-saved-questions-dismiss', textContent: '✕ Type my own instead', onClick: () => picker.remove() }));
            msgs.appendChild(picker);
            msgs.scrollTop = msgs.scrollHeight;
        } catch (e) {
            console.warn('WML: Failed to load saved questions:', e);
        }
    }

    /**
     * Show inline prompt offering to save a generated question to the question bank.
     * Appears in the chat after a question_text element is confirmed during planning.
     * Two options: "Save to question bank" (persists for future essay plans) or "Just use it now" (dismisses).
     */
    function showSaveToQuestionBankPrompt(questionContent, fullAIMessage) {
        const msgs = $('#swml-messages');
        if (!msgs) return;
        // Prevent duplicate prompts
        if ($('#swml-save-to-bank')) return;

        const card = el('div', { className: 'swml-save-to-bank', id: 'swml-save-to-bank' });
        card.appendChild(el('div', { className: 'swml-save-to-bank-title', textContent: 'Save this question for future sessions?' }));
        card.appendChild(el('div', { className: 'swml-save-to-bank-hint', textContent: 'Saved questions appear as quick-select options when you start a new essay plan.' }));

        const actions = el('div', { className: 'swml-save-to-bank-actions' });

        const saveBtn = el('button', {
            className: 'swml-save-to-bank-btn swml-save-to-bank-primary',
            textContent: 'Save to question bank',
            onClick: async () => {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving…';
                try {
                    // Extract theme from question if possible
                    const themeMatch = (fullAIMessage || '').match(/(?:theme|focus|topic)[:\s]+(.{5,80}?)(?:\n|$)/i);
                    // Clean full_text: strip confirm prompts and A/B options
                    let cleanFullText = (fullAIMessage || questionContent)
                        .replace(/(?:Is this your final version|Here is your confirmed|Are you happy)[\s\S]*$/i, '')
                        .replace(/\*{0,2}A\)?\*{0,2}\s*[—\-–]?\s*[✅][\s\S]*$/i, '')
                        .trim();
                    await apiPost(API.savedQuestions, {
                        board: state.board,
                        subject: state.subject,
                        text: state.text,
                        summary: questionContent || '',
                        theme: themeMatch ? themeMatch[1].trim() : '',
                        location: '',
                        full_text: cleanFullText || questionContent,
                    });
                    saveBtn.textContent = 'Saved ✓';
                    saveBtn.classList.add('swml-save-to-bank-done');
                    console.log('WML: Question saved to bank for', state.board, state.text);
                    setTimeout(() => { card.classList.add('swml-save-to-bank-exit'); setTimeout(() => card.remove(), 300); }, 1200);
                } catch (e) {
                    saveBtn.textContent = 'Failed — try again';
                    saveBtn.disabled = false;
                    console.warn('WML: Failed to save question to bank:', e);
                }
            }
        });

        const dismissBtn = el('button', {
            className: 'swml-save-to-bank-btn swml-save-to-bank-dismiss',
            textContent: 'Just use it now',
            onClick: () => { card.classList.add('swml-save-to-bank-exit'); setTimeout(() => card.remove(), 300); }
        });

        actions.appendChild(saveBtn);
        actions.appendChild(dismissBtn);
        card.appendChild(actions);
        msgs.appendChild(card);
        msgs.scrollTop = msgs.scrollHeight;
    }

    async function sendMessage() {
        const input = $('#swml-input');
        const text = input?.value?.trim();
        if (!text || state.isLoading) return;
        // Stop voice recording if active — mic should not stay on after submit
        if (isListening && recognition) {
            recognition.stop();
            isListening = false;
        }
        input.value = '';
        // Reset textarea height after clearing
        input.style.height = 'auto';

        // ── SAVED QUESTION PICKER INTERCEPT ──
        // When the student picks "B" (Saved question), DON'T send "B" to the AI backend.
        // Instead show the picker and return. When the student clicks a question card,
        // the picker calls sendMessage() again with the actual question text.
        const prevAIMsgs = state.chatHistory.filter(m => m.role === 'assistant');
        const lastAI = prevAIMsgs.length > 0 ? (prevAIMsgs[prevAIMsgs.length - 1]?.content || '') : '';
        const aiOfferedSavedQuestions = /\bB\b.*(?:saved question|already saved)/i.test(lastAI);
        const isRecallMode = state.task === 'essay_plan' && state.planningMode === 'A';
        const isAdvancedMode = state.task === 'model_answer' && state.planningMode === 'C';
        const isPlanningQuestionStep = state.task === 'planning' && state.step <= 2;
        if ((isRecallMode || isAdvancedMode || isPlanningQuestionStep) && text.trim().toUpperCase() === 'B' && aiOfferedSavedQuestions) {
            // Show "B" in chat but DON'T send to backend
            addMessage('user', text);
            showSavedQuestionPicker();
            console.log('WML: Saved question picker intercepted — waiting for student to pick a question');
            return; // ← Early return — don't send "B" to AI
        }

        addMessage('user', text);
        // Remove saved question picker if present (for other responses)
        const picker = $('#swml-saved-questions');
        if (picker) picker.remove();
        // Remove timer if running
        removeTimer();
        setLoading(true); showTyping();

        try {
            // Sliding window: send only the last N messages, plus established plan state
            const fullHistory = state.chatHistory.slice(0, -1); // exclude current msg (sent as prompt)
            const trimmedHistory = fullHistory.length > MAX_HISTORY_MESSAGES
                ? fullHistory.slice(-MAX_HISTORY_MESSAGES)
                : fullHistory;
            
            const response = await fetch(API.chat, { method: 'POST', headers, body: JSON.stringify({
                prompt: text,
                botId: 'wml-claude',
                chatId: state.chatId,
                history: trimmedHistory,
                planState: state.plan,
                step: state.step,
                board: state.board,
                subject: state.subject,
                task: state.task,
            }) });
            const res = await response.json();
            hideTyping();
            if (res.method) console.log('WML method:', res.method, 'model:', res.model);

            if (res.success && res.reply) {
                addMessage('ai', res.reply, false, res.model);
                if (res.chatId) state.chatId = res.chatId;
                // 1. Refresh plan from DB first (picks up function call saves)
                await refreshPlan();
                // 2. Then run regex extraction as fallback for any gaps
                await extractAndSavePlan(text, res.reply);
                // 3. Check if assessment is complete — show Mark Phase Complete card
                if (state.task === 'assessment' && !state._phaseMarkedComplete && state.plan.total_score && state.plan.grade) {
                    showPhaseCompleteCard();
                }
            } else if (res.code) {
                // WP_Error response — show the actual error
                console.error('WML Chat Error:', res.code, res.message);
                if (res.debug) console.error('WML Debug:', JSON.stringify(res.debug, null, 2));
                addMessage('ai', `Sorry, there was an issue: **${res.message || res.code}**\n\nPlease let your teacher know about this error.`);
            } else if (typeof res.data === 'string') {
                addMessage('ai', res.data);
            } else {
                console.error('WML unexpected response:', res);
                addMessage('ai', 'I had a momentary difficulty — could you try again?');
            }
            await refreshPlan();
            autoSave();
        } catch (e) {
            hideTyping();
            console.error('WML fetch error:', e);
            addMessage('ai', `Connection error: **${e.message}**\n\nThis usually means a server error. Check the browser console (F12) for details.`);
        }
        setLoading(false);
    }

    async function sendInitialMessage() {
        const thisRequest = ++state.requestId;
        setLoading(true); showTyping();
        const textLabel = getTextLabel(state.text, state.subject);
        const author = AUTHOR_MAP[state.text] || '';
        // For anthology subjects, the specific text is the individual poem/text, not the cluster
        const specificTitle = state.poemTitle || textLabel;
        const specificAuthor = state.poemAuthor || author;
        const specificTextLabel = specificTitle + (specificAuthor ? ' by ' + specificAuthor : '');
        const boardLabel = state.board.toUpperCase();
        const subjectLabel = ucfirst(state.subject);
        const redraftNote = state.isRedraft
            ? 'This is a REDRAFT of a previous essay.'
            : 'This is a brand-new essay (not a redraft). No previous essay or feedback exists in the conversation history.';

        const taskLabel = state.task === 'assessment' ? 'assessment' : state.task === 'polishing' ? 'polishing' : state.task === 'exam_question' ? 'exam question creation' : state.task === 'essay_plan' ? 'exam essay planning' : state.task === 'model_answer' ? 'model answer writing' : state.task === 'verbal_rehearsal' ? 'random quote analysis' : state.task === 'conceptual_notes' ? 'conceptual notes' : state.task === 'memory_practice' ? 'memory practice' : 'essay skills planning';

        // Fetch fixed topic question if in Mastery Programme with a topic number
        let topicQuestion = null;
        if (state.topicNumber > 0 && !(state.topicNumber === 2 && state.subject !== 'unseen_poetry')) { // Topic 2 = CN (except unseen poetry)
            try {
                const tqRes = await fetch(`${config.restUrl}topic-question?board=${state.board}&text=${state.text}&topic=${state.topicNumber}`, { headers });
                if (tqRes.ok) {
                    topicQuestion = await tqRes.json();
                    console.log('WML: Loaded topic question:', topicQuestion);
                }
            } catch (e) {
                console.warn('WML: Could not fetch topic question:', e);
            }
        }
        // Workbook reminder — anthology subjects get "follow along with text" version, others get "take notes" version
        const workbookReminder = isAnthologySubject()
            ? ` In the welcome message, tell the student: "We won't be displaying the full text in this chat — please make sure you have your Conceptual Notes workbook open and follow along with the text as we work through each section. Having the text in front of you will help you find quotes and connect ideas." Do NOT paste or display the full text in the chat at any point during the session.`
            : (state.task === 'conceptual_notes' ? ` In the welcome message, remind the student to have their Conceptual Notes workbook open alongside this session so they can take notes as we go.` : '');
        const taskInstructions = {
            assessment: `Begin the assessment protocol. The text and author are already confirmed above — skip any steps that ask the student to provide or confirm the text title and author. CRITICAL: The student's full essay has ALREADY been loaded from the document and will be attached to their first message automatically. Do NOT ask the student to paste their essay — you already have it. When you receive the first student message, it will contain [STUDENT'S ESSAY] followed by their response to your greeting. Proceed directly to marking the essay section by section, starting with the introduction. Combine your greeting with the first actionable step (the self-reflection questions) into ONE single opening message — do NOT send the protocol's initial SAY blocks as a separate message before your greeting. IMPORTANT: The essay question is already visible in the student's document (in the Essay Question section at the top). When referring to it, say "Look at the essay question in your document" or "Refer to the question at the top of your document" — do NOT say "thinking back to the question you're answering" or ask the student to recall the question from memory. ALSO IMPORTANT: Never output raw JSON, function calls, or element_type objects in your messages.

CRITICAL ANTI-HALLUCINATION RULES:
1. You MUST ONLY assess what the student ACTUALLY wrote. The student's essay will be re-injected in [STUDENT'S ESSAY] blocks throughout the conversation. ALWAYS refer back to the most recent [STUDENT'S ESSAY] block for the actual text.
2. When providing feedback on ANY paragraph, you MUST quote at least 2-3 SHORT direct snippets from the student's actual text (in quotation marks) to prove you are assessing THEIR writing, not the Gold Standard examples or your own expectations. For example: "You wrote: 'guilt overtakes their personality' — this shows awareness of..."
3. If you cannot find specific text from the student's essay to reference, you are hallucinating. STOP and re-read the [STUDENT'S ESSAY] block.
4. Do NOT confuse the Gold Standard model answers in the protocol with the student's writing. The Gold Standards are YOUR examples — the student did NOT write them.
5. NEVER attribute sophisticated techniques to the student that do not exist in their actual text.

PARAGRAPH DETECTION RULES:
Before marking the introduction, ask the student to confirm their essay structure: "Looking at your essay, I need to confirm: did you write a separate introduction paragraph? Please answer Yes or No." If they say no, give them 0 for the introduction, provide a Gold Standard model, store it in feedback, and move to Body Paragraph 1. Ask the same for each section: "Did you write Body Paragraph 1?", "Body Paragraph 2?", "Body Paragraph 3?", "A conclusion?" For missing paragraphs: on the FIRST diagnostic (Topic 1), accept whatever is provided and assess what exists. On ALL other submissions (subsequent diagnostics, redrafts, exam practice), if ANY required paragraph is missing, tell the student: "Your essay is missing [section]. Please go back to the writing phase, complete the missing section, and then return for assessment." Do NOT proceed with assessment if paragraphs are missing on non-first-diagnostic work.`,
            polishing: `Begin the polishing protocol. The text and author are already confirmed above — skip any steps that ask the student to provide or confirm the text title and author. Combine your greeting, the quick tip about the workbook, and the context-gathering question (title, author, extract, question) into ONE single opening message — do NOT send the protocol's initial SAY blocks as a separate message before your greeting. Then ask the student to paste their essay for polishing.`,
            planning: `Begin the planning protocol. The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. Skip any steps that ask the student to provide or confirm the text title and author — proceed directly to the next step. When you reach the question selection step (Step 4), present THREE options as lettered choices on separate lines: A — Generate a question (AI creates one using past paper patterns), B — Saved question (choose from saved questions), C — Paste your own. Combine the welcome, quick tip, and question selection into ONE opening message. After the student responds, do NOT re-send the welcome — but DO complete their chosen path in full: If A: You MUST generate a complete exam question with a real extract (15-30 lines) using the EXAM QUESTION FORMAT REFERENCE. Present the full question and extract. Do NOT skip question generation. If B: The frontend shows a saved question picker — wait for the student to share the question text. If C: Ask for the question (and extract if Shakespeare/19th Century). After the question is confirmed, proceed to goal setting.`,
            exam_question: `Begin the Exam Question Creator protocol. The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. Skip Steps 1 and 2 (text name and author). Do NOT narrate or explain that you are skipping steps — do NOT say "I'll skip to Step 3" or "Since the text is already confirmed". Just go straight into the Step 3 content. Present the question design preference options (A and B EXACTLY as written in the protocol, in that order) in your FIRST and ONLY opening message. Do NOT send a second message repeating these options. When the student replies with A or B, proceed IMMEDIATELY to the relevant branch — do NOT re-present the options. When the student chooses A, present a full past paper analysis first (question structure + theme frequency list + your recommendation), then wait for them to confirm before generating the question.${state.subject === 'modern_text' || state.subject === 'modern_prose' || state.subject === 'prose' ? ' IMPORTANT: This is a Modern Prose/Drama text — do NOT include an extract. Generate an Either/Or question pair (Question 1 and Question 2) as whole-text questions only.' : ' Always include a real extract from the text in the generated question.'}`,
            essay_plan: state.planningMode === 'A'
                ? `Begin the Essay Plan protocol in Mode A (Recall — Timed Verbal). The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. The planning mode has already been selected — do NOT show the mode selection menu (Session Start). Skip Step 1 (text & author) and Shared Setup Steps 2-3. Do NOT narrate that you are skipping steps. In your FIRST message, combine A.0 (Opening Explanation) and A.1 (Question Selection) into a SINGLE message. Send the opening explanation AND immediately follow it with the question selection options (A — Random question, B — Saved question, C — Paste your own). Present these as lettered options on separate lines so they render as clickable buttons. CRITICAL: Send A.0 + A.1 ONCE ONLY. When the student responds with their choice, move FORWARD — do NOT re-send the opening or options. Follow the Recall flow: question selection → extract check (A.1b) → timer briefing (A.2) → wait for verbal response → AI evaluation (A.3) → refinement (A.4) → confirm & save (A.5). The 4-minute timer is managed by the frontend — do NOT try to track time. The timer appears automatically when you send the timer briefing at A.2 (which must include 🎙️ emoji). When evaluating, check EVERY element in the evaluation criteria table and use Socratic questions for gaps — never just list what's missing. Save ALL plan elements when the student confirms.`
                : `Begin the Essay Plan protocol in Mode ${state.planningMode || 'B'} (${{ B: 'Guided', C: 'Instant' }[state.planningMode] || 'Guided'}). The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. The planning mode has already been selected — do NOT show the mode selection menu (Session Start). Skip Step 1 (text & author). Do NOT narrate that you are skipping steps. Proceed directly to Step 2 — ask the student for the essay question. Then proceed to Step 3 (extract) if applicable. After setup, follow ONLY the Mode ${state.planningMode || 'B'} steps in the protocol. One question per message. Be collaborative in Mode B; generate immediately in Mode C.`,
            model_answer: state.planningMode === 'C'
                ? `Begin the Model Answer Writing protocol in ADVANCED mode (Level ${state.advancedLevel || 1}). The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. The mode and level have already been selected — do NOT show any mode/level selection menus. Skip the Session Start SAY block AND Step 1 (text & author) — combine your greeting with the first actionable step into ONE single opening message. Do NOT send the protocol's "Crafting a Grade 9 Model Answer" SAY block as a separate message. Do NOT narrate that you are skipping steps. Follow the ADVANCED MODE section of the protocol exactly. Level ${state.advancedLevel || 1} rules: ${state.advancedLevel === 1 ? 'LEVEL 1 (Full Recall): Generate a RANDOM board-appropriate question first. Then verbal plan recall (4 min timer managed by frontend). Then essay (student chooses paragraph-by-paragraph or full — the frontend will ask). For random question generation, use the board format reference and vector store. NEVER show vector store queries.' : state.advancedLevel === 2 ? 'LEVEL 2 (Plan & Answer): Student provides their own question. Then verbal plan recall (4 min timer managed by frontend). Then essay.' : 'LEVEL 3 (Answer Only): Student provides their question AND their plan. Review the plan briefly but do not require a rebuild. Then essay only.'} CRITICAL: Timers are managed by the frontend — do NOT try to track time. Wait for the student\'s verbal response. When evaluating plans, use Socratic questions for gaps. When evaluating essay sections, check every criterion and provide specific, actionable feedback. Clean up verbal responses into polished Grade 9 prose that preserves the student\'s argument and voice. Save all ma_* elements as sections are confirmed. Read GOLD STANDARD EXAMPLES before ANY output.`
                : `Begin the Model Answer Writing protocol in ${state.planningMode === 'A' ? 'Coached' : 'Instant'} mode. The text and author are already confirmed above — the student selected "${textLabel}"${author ? ' by ' + author : ''}. The mode (${state.planningMode === 'A' ? 'Coached' : 'Instant'}) has already been selected — do NOT show the mode selection menu. Skip the Session Start SAY block AND Step 1 (text & author) — combine your greeting with Step 2 (asking for the question) into ONE single opening message. Do NOT send the protocol's "Crafting a Grade 9 Model Answer" SAY block as a separate message. Do NOT narrate that you are skipping steps. Do NOT show the section selection menu (A-E) — we are building a COMPLETE model answer with ALL five sections. Proceed directly to Step 2 (question), then Step 3 (extract), then Step 4 (essay plan). CRITICAL: Generate ONE section at a time — never combine multiple sections in one message. This prevents sentence compression and ensures quality.${state.planningMode === 'A' ? ' COACHED: Explain WHY body paragraphs come first. Then: Body 1 → Body 2 → Body 3 → Introduction → Conclusion. For each, offer paste/voice options, give feedback, produce refined model when YES. After each section, remind to copy to workbook.' : ' INSTANT: Generate one section at a time: Introduction → Body 1 → Body 2 → Body 3 → Conclusion. Give each paragraph your full attention (7-10 sentences). After each, remind to copy, ask YES for next.'} After all five, offer optional compilation. Read GOLD STANDARD EXAMPLES before ANY output.`,
            verbal_rehearsal: `Begin a Random Quote Analysis session. The text and author are already confirmed — the student selected "${textLabel}"${author ? ' by ' + author : ''}. This is a TEST exercise — do NOT show the TTECEA+C structure or remind the student of the framework. They should know it. Combine your greeting with the exercise explanation AND the first random quote into ONE single opening message — do NOT send the protocol's Step 1 SAY block as a separate message before the quote. FLOW for this ONE opening message: (1) Brief greeting using the student's name and mentioning the text. (2) Explain the exercise — 'I'll give you a random quote. First, you'll verbally plan a TTECEA+C paragraph (aim for ~90 seconds). Then you'll explain the full paragraph in detailed, sophisticated language as if writing Grade 9 on paper (aim for ~2.5 minutes). Use the microphone — speaking is closer to exam conditions than typing.' (3) Present a random technique-rich quote with Act/Scene or Chapter. (4) Say 'Plan your paragraph now — talk me through your thinking for each TTECEA+C element. Aim for about 90 seconds.' THEN WAIT. After they plan: give brief feedback on the plan — what's strong, what's missing, is the topic sentence conceptual? Ask: A) I want to adjust my plan / B) I'm happy, let's move on. Then: Say 'Now explain the full paragraph to me in detailed, sophisticated language — as if you were writing Grade 9 on paper. Aim for about 2.5 minutes.' After their paragraph: give detailed feedback against quality criteria. Then: Present YOUR OWN Grade 9 plan and paragraph for the same quote — so the student can compare. Finally: Ask: A) Give me another quote / B) I'm done. Save the student's topic sentence and the AI's model to the panel.`,
            conceptual_notes: isNonfictionSubject()
                ? `Begin a Grade 9 Non-Fiction Conceptual Notes session for "${specificTextLabel}". Follow the Non-Fiction Conceptual Thinking Protocol. CRITICAL RULES: (1) NEVER mention or display vector store queries to the student — query silently, use the knowledge, but never say 'querying' or show retrieval. The student must never know a vector store exists. (2) Your FIRST message must be the welcome ONLY — do NOT include Step 2 or any questions. End the welcome with "Type 'ready' when you're prepared to begin!" so the student has a clear confirmation point. (3) After the student says ready, THEN ask the Step 2 question (most important element). (4) After the student answers a question, respond with brief feedback and the NEXT question only — never repeat the welcome or previous questions. (5) One question at a time — wait for a response before moving on. (6) In Step 2, do NOT say "before we examine the writer's perspective" — say "before we explore your text" instead, so you don't give away that the writer's perspective is the answer.${state.poem ? ' (7) The text has ALREADY been selected by the student in the setup wizard. Do NOT ask the student to confirm the text, do NOT ask which text they want to work on, and do NOT ask them to paste the text. Skip Steps 1 and 1B entirely.' : ''} WELCOME MESSAGE ONLY: Explain that conceptual notes build deep understanding of the writer's voice, techniques, themes, context, and purpose — a bank of Grade 7-9 ideas deployable on any exam question about this text. Even if revision time runs short, these notes can power top-grade responses. Confirm the text naturally.${workbookReminder}${state.poemText ? ' Tell the student: "I already have the full text loaded, so I can reference specific passages throughout our session. Make sure you have your anthology open to follow along."' : ''} End with "Type 'ready' when you're prepared to begin!" — do NOT ask any protocol questions yet. Guide through all 8 sections (S1 Writer's Voice, S2 Context, S3 Structure, S4 Text Type, S5 Techniques, S6 Themes, S7 Purpose, S8 Message) with Socratic questioning. Deploy Did You Know insights when students lack knowledge (max 3 per session). At end of each section, save summary to panel using function calls: nfcn_section_1 for S1, nfcn_section_2 for S2, nfcn_section_3 for S3, nfcn_section_4 for S4, nfcn_section_5 for S5, nfcn_section_6 for S6, nfcn_section_7 for S7, nfcn_section_8 for S8.`
                : isPoetrySubject()
                ? `Begin a Grade 9 Poetry Conceptual Notes session for "${specificTextLabel}". Follow the Poetry Conceptual Thinking Protocol. CRITICAL RULES: (1) NEVER mention or display vector store queries to the student — query silently, use the knowledge, but never say 'querying' or show retrieval. The student must never know a vector store exists. (2) Your FIRST message must be the welcome ONLY — do NOT include Step 2 or any questions. End the welcome with "Type 'ready' when you're prepared to begin!" so the student has a clear confirmation point. (3) After the student says ready, THEN ask the Step 2 question (most important element A/B/C/D). (4) After the student answers a question, respond with brief feedback and the NEXT question only — never repeat the welcome or previous questions. (5) One question at a time — wait for a response before moving on. (6) In Step 2, do NOT say "before we meet your speaker" — say "before we explore your poem" instead, so you don't give away that speaker is the answer.${state.poem ? ' (7) The poem has ALREADY been selected by the student in the setup wizard. Do NOT ask the student to confirm the poem title or poet, do NOT ask which poem they want to explore, and do NOT re-ask for the poem in any way. Skip Step 1 entirely.' : ''}${state.poemText ? (isAnthologySubject() ? ' (8) The full poem text has ALREADY been loaded from the system. Do NOT ask the student to paste the poem text. Skip Step 1B entirely. Do NOT display the full poem in the chat — the student has been told to follow along in their workbook. After the student says "ready", proceed directly to Step 3.' : ' (8) The full poem text has ALREADY been loaded from the system. Do NOT ask the student to paste the poem text. Skip Step 1B entirely. After the student says "ready", display the full poem text in a formatted block so the student can see it, then proceed directly to Step 3.') : ' After the student says ready, ask them to paste the full poem text (Step 1B) before proceeding to Step 3.'} WELCOME MESSAGE ONLY: Explain that conceptual notes build deep understanding of the speaker, form, themes, context, and purpose — a bank of Grade 7-9 ideas deployable on any exam question about this poem. Even if revision time runs short, these notes can power top-grade responses. Confirm the poem naturally.${workbookReminder} End with "Type 'ready' when you're prepared to begin!" — do NOT ask any protocol questions yet. Guide through all 7 sections (S1 Speaker, S2 Context, S3 Form, S4 Structure & Language, S5 Themes, S6 Purpose, S7 Message) with Socratic questioning. Deploy Did You Know insights when students lack knowledge (max 3 per session). At end of each section, save summary to panel using function calls: cn_section_1 for S1, cn_section_2 for S2, cn_section_3 for S3, cn_section_4 for S4, cn_section_5 for S5, cn_section_6 for S6, cn_section_7 for S7.`
                : `Begin a Grade 9 Conceptual Notes session for "${specificTextLabel}". Follow the Unified Conceptual Thinking Protocol. CRITICAL RULES: (1) NEVER mention or display vector store queries to the student — query silently, use the knowledge, but never say 'querying' or show retrieval. The student must never know a vector store exists. (2) Your FIRST message must be the welcome ONLY — do NOT include Step 2 or any questions. End the welcome with "Type 'ready' when you're prepared to begin!" so the student has a clear confirmation point. (3) After the student says ready, THEN ask the Step 2 question (most important element A/B/C/D). (4) After the student answers a question, respond with brief feedback and the NEXT question only — never repeat the welcome or previous questions. (5) One question at a time — wait for a response before moving on. (6) In Step 2, do NOT say "before we meet your protagonist" — say "before we explore your text" instead, so you don't give away that protagonist is the answer. WELCOME MESSAGE ONLY: Explain that conceptual notes build deep understanding of themes, characters, context, and purpose — a bank of Grade 7-9 ideas deployable on any exam question. Even if revision time runs short, these notes can power top-grade responses. Confirm the text naturally.${workbookReminder} End with "Type 'ready' when you're prepared to begin!" — do NOT ask any protocol questions yet. Guide through all 7 sections with Socratic questioning. Deploy Did You Know insights when students lack knowledge (max 3 per session). At end of each section, save summary to panel using function calls: cn_section_1 for S1, cn_section_2 for S2, cn_section_3 for S3, cn_section_4 for S4, cn_section_5 for S5, cn_section_6 for S6, cn_section_7 for S7.`,
            memory_practice: `Begin the Memory Practice protocol. Combine your greeting with the Step 1 welcome and text submission prompt into ONE single opening message — do NOT send a second message repeating the welcome. Do NOT skip or combine protocol steps after this. CRITICAL RULES: (1) The Quality Gate (Step 2) is STRICT and cannot be bypassed — the student must pass before any memory exercise begins. (2) When reprinting the student's text for Gap-Fill mode, reproduce it EXACTLY — same punctuation, capitalisation, paragraph breaks, errors. Do not correct or improve anything. (3) Never give hints during the recall exercise. If the student asks for help: "Give it your best shot — even if you're not sure, write something down. The effort of trying is what builds the memory! 💪" (4) Store target words/phrases internally before delivering any exercise — never display them to the student. (5) One step at a time — wait for the student's response before proceeding. (6) Recommend using the microphone for faster responses. Save progress to the right panel using function calls: mp_writing_type (detected writing type), mp_grade_claim (claimed grade), mp_quality_gate (PASS/FAIL status), mp_gate_targets (failed criteria names on FAIL only), mp_mode (selected mode + difficulty), mp_score (score after assessment), mp_recommendation (progression recommendation).`,
        };
        const taskInstruction = taskInstructions[state.task] || taskInstructions.planning;

        // Give the AI everything we already know so it doesn't need to ask
        const isCreative = state.board === 'universal';
        const greetingInstruction = `GREETING: Start your first message with a warm, friendly greeting using the student's name. Mention the SPECIFIC text they'll be working on (${specificTextLabel}) and what you'll be doing together (${taskLabel}). Keep the greeting brief — 1-2 sentences max — then move straight into the protocol. ALWAYS refer to the specific text by name throughout the session — never say "your text" or "the anthology", say "${specificTitle}".`;
        const greeting = isCreative ? [
            `The student is starting a new creative writing session.`,
            ``,
            `CONFIRMED DETAILS:`,
            `• Mode: Creative Writing (KS3/KS4, no specific exam board)`,
            `• ${redraftNote}`,
            ``,
            `Begin the creative writing session. Welcome the student warmly using their name and ask what kind of writing they'd like to work on today (e.g. short story, descriptive writing, narrative, monologue, etc.).`,
        ].join('\n') : [
            `The student is starting a new ${taskLabel} session.`,
            ``,
            `CONFIRMED DETAILS (already selected by the student — do NOT re-ask for any of this):`,
            `• Exam board: ${boardLabel}`,
            `• Subject area: ${subjectLabel}`,
            `• Text: ${textLabel}${author ? ' by ' + author : ''}`,
            ...(state.poem ? [
                `• ${state.subject === 'poetry_anthology' ? 'Poem' : 'Text'}: ${specificTextLabel} (from the ${textLabel} anthology — the student has already selected this ${state.subject === 'poetry_anthology' ? 'poem' : 'text'} in the setup wizard. Do NOT re-ask, do NOT ask to confirm, do NOT ask which ${state.subject === 'poetry_anthology' ? 'poem' : 'text'} — it is CONFIRMED. Skip Step 1 entirely. Always refer to it as "${specificTitle}" throughout the session.)`,
                ...(state.poemText ? [
                    ``,
                    `FULL ${state.subject === 'poetry_anthology' ? 'POEM' : 'TEXT'} (provided by the system — use this as the authoritative text for all analysis, quotes, and validation):`,
                    `---`,
                    state.poemText,
                    `---`,
                    `CRITICAL: The student does NOT need to paste the ${state.subject === 'poetry_anthology' ? 'poem' : 'text'} — you already have it above. Skip Step 1B entirely.${state.subject === 'poetry_anthology' ? ' After the student says "ready", display this poem text in a formatted block so they can see it, then go directly to Step 3.' : ' The text is too long to display in chat. Tell the student to have their anthology open to this text. Go directly to Step 3 after "ready".'} Reference this text for all quote validation and analysis throughout the session.`,
                ] : []),
            ] : []),
            ...(state.questionPart ? (() => {
                const dpc = getDualPartConfig();
                const isPoetryDual = state.subject === 'poetry_anthology';
                const partLabel = dpc ? dpc.options.find(o => o.id === state.questionPart)?.label || state.questionPart : state.questionPart;
                const totalLabel = dpc ? dpc.options.find(o => o.id === 'both')?.desc || '40 marks' : '40 marks';
                const lines = [];
                if (isPoetryDual) {
                    lines.push(`• Poetry Section: ${state.questionPart === 'A' ? 'Section A only (Single Poem Analysis, 15 marks)' : state.questionPart === 'B' ? 'Section B only (Comparative Analysis, 25 marks)' : 'Both Sections (Section A: 15 marks + Section B: 25 marks = 40 marks total)'}`);
                    if (state.questionPart === 'A') lines.push(`IMPORTANT: This is Section A ONLY — single poem analysis. Do NOT ask about or reference a comparison poem. All body paragraphs analyse the focus poem only (Form, Structure, Language). Total: 15 marks.`);
                    if (state.questionPart === 'B') lines.push(`IMPORTANT: This is Section B ONLY — comparative analysis. The student will need to identify a comparison poem during setup. All body paragraphs must compare BOTH poems. Total: 25 marks.`);
                    if (state.questionPart === 'both') lines.push(`IMPORTANT: The student is doing the WHOLE PAPER. Start with Section A (single poem, 15 marks), then transition to Section B (comparative, 25 marks). Follow the protocol's transition guidance between sections.`);
                } else {
                    // Shakespeare, Language, or other dual-part — pull labels from config
                    const optA = dpc?.options?.find(o => o.id === 'A');
                    const optB = dpc?.options?.find(o => o.id === 'B');
                    const optBoth = dpc?.options?.find(o => o.id === 'both');
                    const aDesc = optA?.desc || 'Extract analysis';
                    const bDesc = optB?.desc || 'Whole text analysis';
                    const bothDesc = optBoth?.desc || '40 marks total';

                    // Check if this is an individual question selection (e.g. Q2, Q3, Q4, Q5)
                    const isIndividualQ = /^Q\d+$/i.test(state.questionPart);
                    if (isIndividualQ) {
                        const qLabel = dpc?.individualQuestions?.find(q => q.id === state.questionPart);
                        lines.push(`• Selected Question: ${qLabel?.label || state.questionPart} (${qLabel?.desc || 'individual question'})`);
                        lines.push(`IMPORTANT: The student has selected ${state.questionPart} ONLY. Focus exclusively on this question. Do NOT present other questions. Skip the question selection step in the protocol — the student has already chosen.`);
                    } else if (state.questionPart === 'A') {
                        lines.push(`• Question Part: ${optA?.label || 'Section A'} only (${aDesc})`);
                        lines.push(`IMPORTANT: This is ${optA?.label || 'Section A'} ONLY. Follow ONLY the reading/Section A workflow in the protocol. Skip Section B.`);
                    } else if (state.questionPart === 'B' || state.questionPart === 'SB') {
                        lines.push(`• Question Part: ${optB?.label || 'Section B'} only (${bDesc})`);
                        lines.push(`IMPORTANT: This is ${optB?.label || 'Section B'} ONLY. Follow ONLY the writing/Section B workflow in the protocol. Skip Section A.`);
                    } else if (state.questionPart === 'B_T1') {
                        lines.push(`• Question Part: Section B — Task 1 ONLY (20 marks • Persuasive Writing)`);
                        lines.push(`IMPORTANT: The student wants to practise Section B TASK 1 ONLY. Skip Section A entirely. In the Section B setup, go directly to Task 1 — do NOT ask the student which task they want. Skip Task 2 entirely. Total: 20 marks.`);
                    } else if (state.questionPart === 'B_T2') {
                        lines.push(`• Question Part: Section B — Task 2 ONLY (20 marks • Persuasive Writing)`);
                        lines.push(`IMPORTANT: The student wants to practise Section B TASK 2 ONLY. Skip Section A entirely. In the Section B setup, go directly to Task 2 — do NOT ask the student which task they want. Skip Task 1 entirely. Total: 20 marks.`);
                    } else {
                        lines.push(`• Question Part: Both Sections (${bothDesc})`);
                        lines.push(`IMPORTANT: The student is doing the WHOLE PAPER. Start with ${optA?.label || 'Section A'}, then transition to ${optB?.label || 'Section B'}. Follow the protocol's transition guidance between parts.`);
                    }
                }
                if (state.comparisonPoem) {
                    lines.push(`• Comparison Poem: ${state.comparisonPoemTitle || state.comparisonPoem} (pre-selected — do NOT re-ask for the comparison poem)`);
                    if (state.comparisonPoemText) {
                        lines.push('', `COMPARISON POEM FULL TEXT (provided by the system — use for quote validation and analysis):`, `---`, state.comparisonPoemText, `---`);
                    }
                }
                return lines;
            })() : []),
            `• ${redraftNote}`,
            ...(state.topicNumber > 0 ? [`• Mastery Programme Topic: ${state.topicNumber} (${state.topicLabel})`] : []),
            ...(topicQuestion ? [
                ``,
                `FIXED TOPIC QUESTION (from the Mastery Programme — do NOT ask the student for a question):`,
                `• Topic: ${topicQuestion.label || 'Topic ' + topicQuestion.topic_number}`,
                ...(topicQuestion.teaching_point ? [
                    `• TEACHING POINT (include in your greeting — explain to the student why they are studying this topic at this point in the sequence): ${topicQuestion.teaching_point}`,
                ] : []),
                ...(topicQuestion.extract_text ? [
                    `• Extract (${topicQuestion.extract_location || 'provided'}):`,
                    topicQuestion.extract_text,
                ] : []),
                `• Question: ${topicQuestion.question_text}`,
                `• Marks: ${topicQuestion.marks}`,
                `• Assessment Objectives: ${topicQuestion.aos}`,
                ``,
                `CRITICAL: Present this question to the student. Say something like "Here's your question for Topic ${topicQuestion.topic_number}. This is also in your workbook." Then present the extract (if any) and the question clearly. Do NOT ask the student to provide their own question — this is a fixed Mastery Programme topic. After presenting the question, proceed directly into the ${taskLabel} workflow.`,
            ] : []),
            ``,
            greetingInstruction,
            ``,
            taskInstruction,
        ].join('\n');

        try {
            const response = await fetch(API.chat, { method: 'POST', headers, body: JSON.stringify({ prompt: greeting, botId: 'wml-claude', chatId: state.chatId, planState: state.plan, step: state.step, board: state.board, subject: state.subject, task: state.task }) });
            const res = await response.json();
            hideTyping();
            // If user navigated away (resume, portfolio) while waiting, discard this response
            if (state.requestId !== thisRequest) { setLoading(false); return; }
            if (res.method) console.log('WML initial method:', res.method, 'model:', res.model);

            if (res.success && res.reply) {
                addMessage('ai', res.reply, false, res.model);
                if (res.chatId) state.chatId = res.chatId;
                // Show video hint after initial greeting
                setTimeout(checkVideoTooltip, 1500);
                // Auto-save topic question to plan panel if available
                if (topicQuestion && topicQuestion.question_text) {
                    try {
                        await apiPost(config.restUrl + 'plan/element', {
                            session_id: state.sessionId,
                            element_type: 'question_text',
                            content: topicQuestion.question_text,
                            step: 1,
                        });
                    } catch (e) { console.warn('WML: Could not auto-save topic question:', e); }
                }
                // Refresh plan in case function calls saved elements
                await refreshPlan();
                // Show saved question picker only for essay_plan non-recall and model_answer non-advanced
                // Planning now uses A/B/C question selection — picker shows when student picks B
                const isRecallMode = state.task === 'essay_plan' && state.planningMode === 'A';
                const isAdvancedMode = state.task === 'model_answer' && state.planningMode === 'C';
                if ((state.task === 'essay_plan' || state.task === 'model_answer') && !isRecallMode && !isAdvancedMode) {
                    showSavedQuestionPicker();
                }
            } else if (res.code) {
                console.error('WML Initial Chat Error:', res.code, res.message);
                if (res.debug) console.error('WML Initial Debug:', JSON.stringify(res.debug, null, 2));
                addMessage('ai', `Welcome! There was an issue connecting to Sophia: **${res.message || res.code}**\n\nPlease try refreshing the page, or let your teacher know.`);
            } else if (typeof res.data === 'string') {
                addMessage('ai', res.data);
            } else {
                // Fallback greeting
                addMessage('ai', `Welcome to the Writing Mastery Lab! You're working on **${boardLabel} ${subjectLabel}** — **${textLabel}**.\n\nLet's plan an essay together. What aspect of ${textLabel} would you like to explore?`);
            }
        } catch (e) {
            hideTyping();
            console.error('WML initial fetch error:', e);
            addMessage('ai', `Welcome to the Writing Mastery Lab! You're working on **${boardLabel} ${subjectLabel}** — **${textLabel}**.\n\nLet's plan an essay together. What aspect of ${textLabel} would you like to explore?\n\n*(AI connection unavailable: ${e.message})*`);
        }
        setLoading(false);
    }

    async function refreshPlan() {
        if (!state.sessionId) { renderPlan(); return; } // No session yet — just render empty
        try {
            const res = await apiGet(API.plan);
            if (res.plan) {
                // CRITICAL: Only UPDATE elements that already exist in state.plan.
                // NEVER add new elements from DB — they come from premature AI function calls.
                // New elements should ONLY enter state.plan via the confirm interceptor / [PANEL] system.
                const merged = { ...state.plan };
                let updated = false;
                for (const [key, val] of Object.entries(res.plan)) {
                    if (!val || !val.content || !validatePlanContent(key, val.content)) continue;
                    if (state.plan[key]) {
                        // Element already exists locally — update it (e.g. content was refined)
                        merged[key] = val;
                        updated = true;
                    } else {
                        // Element is NEW in DB but not in local state — SKIP it.
                        // It was saved by premature AI function call before student confirmed.
                        console.log('WML refreshPlan: Skipping new element', key, '— must come via confirm interceptor');
                    }
                }
                state.plan = merged;
                if (updated) renderPlan();
            }
        } catch (e) {
            console.warn('WML: refreshPlan failed:', e);
        }
    }

    /**
     * Validate that plan element content is real data, not an option label or instruction leak.
     * Returns true if content is valid, false if it should be rejected.
     */
    function validatePlanContent(type, content) {
        if (!content || typeof content !== 'string') return false;
        const c = content.trim();

        // Reject option labels: "A — ...", "B — ...", "A) ...", "B. ..."
        if (/^[A-F]\s*[—\-).:\s]+\s*.+/i.test(c) && c.length < 100) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c}" (looks like an option label)`);
            return false;
        }

        // Reject protocol instruction leaks
        if (/^\[(?:SAVE|Calling|END)/i.test(c)) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c}" (protocol leak)`);
            return false;
        }

        // Reject progress-bar / step indicator text (AI function call sometimes saves these)
        // v7.15.19: Removed length cap — protocol markers can appear in long messages too
        if (/(?:Planning|Setting|Assessment|Polishing|Goal Setting)\s*>.*(?:Step \d|of \d)/i.test(c)) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c.substring(0, 60)}" (progress indicator)`);
            return false;
        }

        // v7.15.19: Reject protocol breadcrumb navigation (📌 emoji marker)
        if (/📌/.test(c)) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c.substring(0, 60)}" (protocol breadcrumb)`);
            return false;
        }

        // Reject progress bar text
        if (/\[Progress bar:/i.test(c)) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c.substring(0, 60)}" (progress bar)`);
            return false;
        }

        // Reject advice/commentary text saved as keywords (should be a list, not sentences)
        if (type === 'keywords' && /(?:might be|stronger if|with that in mind|here'?s a|think about|consider|capture)/i.test(c)) {
            console.warn(`WML: Rejected bad plan content for ${type}: "${c.substring(0, 60)}" (advice text, not keyword list)`);
            return false;
        }

        // Reject empty-ish content
        if (c.length < 2) return false;

        return true;
    }

    function estimateStep(p) {
        if (state.task === 'assessment') {
            if (p.target_1 || p.total_score) return 8;
            if (p.ao4_score) return 7;
            if (p.ao3_score) return 6;
            if (p.ao2_score || p.ao1_score) return 5;
            if (p.goal) return 2;
            return 1;
        }
        if (state.task === 'polishing') {
            if (p.revision_3) return 7;
            if (p.revision_2) return 6;
            if (p.revision_1) return 4;
            if (p.polish_focus) return 3;
            if (p.current_level || p.target_level) return 2;
            return 1;
        }
        if (state.task === 'exam_question') {
            if (p.exam_question_output) return 5;
            if (p.exam_question_theme) return 4;
            if (p.goal) return 2;
            return 1;
        }
        // Planning
        if (p.conclusion) return 8; if (p.introduction) return 7;
        if (p.body_para_3) return 6; if (p.body_para_2) return 5; if (p.body_para_1) return 4;
        if (p.anchor_quote_start || p.anchor_quote_mid || p.anchor_quote_end) return 3;
        if (p.keywords || p.goal) return 2; return 1;
    }

    function setLoading(l) {
        state.isLoading = l;
        const b = $('#swml-send-btn'), i = $('#swml-input');
        if (b) b.disabled = l; if (i) i.disabled = l;
    }

    // ══════════════════════════════════════════
    //  AUTO-SAVE & MANUAL SAVE
    // ══════════════════════════════════════════

    let saveTimeout = null;
    function autoSave() {
        // Only auto-save if there are at least 3 exchanges (avoids clutter from abandoned sessions)
        const exchanges = state.chatHistory.filter(m => m.role === 'user').length;
        if (exchanges < 2) return;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => doSave(false), 2000);
    }

    async function manualSave() {
        const btn = $('#swml-save-btn');
        if (btn) { btn.textContent = '⏳ Saving...'; btn.disabled = true; btn.classList.remove('swml-pulse'); }
        await doSave(true);
        if (btn) {
            btn.textContent = '✓ Saved!';
            setTimeout(() => { btn.innerHTML = SVG_SAVE + ' Save'; btn.disabled = false; }, 2000);
        }
    }

    async function doSave(isManual) {
        try {
            await apiPost(API.saveSession, {
                session_id: state.sessionId,
                chat_history: state.chatHistory,
                plan: state.plan,
                step: state.step,
                ai_chat_id: state.chatId,
                is_manual: isManual,
                attempt: state.attempt || null,
                context: {
                    board: state.board, subject: state.subject, text: state.text,
                    text_name: state.textName, task: state.task, question: state.question,
                    marks: state.marks, aos: state.aos, is_redraft: state.isRedraft,
                    poem: state.poem, poem_title: state.poemTitle,
                    question_part: state.questionPart || '',
                    comparison_poem: state.comparisonPoem || '',
                    comparison_poem_title: state.comparisonPoemTitle || '',
                    topic_number: state.topicNumber || null,
                    phase: state.phase || null,
                    topic_label: state.topicLabel || null,
                    draft_type: state.draftType || null,
                },
            });
            if (isManual) console.log('WML: Manual save completed');
        } catch (e) {
            console.warn('WML: Save failed:', e);
        }
    }

    // ══════════════════════════════════════════
    //  PAST WORK PORTFOLIO
    // ══════════════════════════════════════════

    // ── Video Lessons ──
    async function showPortfolio() {
        state.requestId++; // Invalidate any in-flight requests
        const root = $('#swml-root');
        root.innerHTML = '';
        // Scroll handled by .swml-portfolio-scroll — root stays overflow:hidden

        // Shader background (same as setup screens)
        const shaderBg = el('div', { className: 'swml-shader-bg', id: 'swml-shader-bg' });
        root.appendChild(shaderBg);
        // Init shader after container is in DOM so it has dimensions
        requestAnimationFrame(() => {
            if (window.swmlShader) {
                try {
                    destroyShader();
                    if (swmlShader.init(shaderBg)) shaderInitialized = true;
                } catch(e) { console.warn('Portfolio shader init failed:', e); }
            }
        });

        const container = el('div', { className: 'swml-portfolio' });

        // Header with back button
        const header = el('div', { className: 'swml-portfolio-header' });
        header.appendChild(renderLogo());
        header.appendChild(el('h2', { textContent: 'Your Past Work' }));
        header.appendChild(el('p', { className: 'swml-setup-hint', textContent: 'Resume a session or start fresh', style: { marginBottom: '0' } }));
        const headerActions = el('div', { className: 'swml-portfolio-actions' });
        headerActions.appendChild(el('button', { className: 'swml-portfolio-back-btn', textContent: '← Back',
            onClick: () => {
                root.style.overflowY = '';
                destroyShader(); shaderInitialized = false;
                if (state.chatHistory.length > 0) {
                    renderWorkspace();
                    state.chatHistory.forEach(m => addMessage(m.role === 'user' ? 'user' : 'ai', m.content, true));
                    const msgs = $('#swml-messages');
                    if (msgs) msgs.scrollTop = msgs.scrollHeight;
                    renderPlan(); updateProgress(state.step);
                } else {
                    renderSetup();
                }
            } }));
        headerActions.appendChild(el('button', { className: 'swml-portfolio-new-btn', textContent: '+ New Session',
            onClick: () => { root.style.overflowY = ''; destroyShader(); shaderInitialized = false; state.chatHistory = []; state.plan = {}; state.task = ''; state.sessionId = ''; state.chatId = ''; if (window.wmlVideo?.isOpen()) wmlVideo.close(); renderSetup(); } }));
        header.appendChild(headerActions);
        container.appendChild(header);

        container.appendChild(el('div', { className: 'swml-portfolio-loading', textContent: 'Loading your sessions...' }));
        root.appendChild(container);

        try {
            // Fetch both chat sessions and canvas documents in parallel
            const [sessRes, canvasRes] = await Promise.all([
                apiGet(API.pastSessions),
                apiGet(API.canvasList).catch(() => ({ success: false, documents: [] })),
            ]);
            const sessions = sessRes.sessions || [];
            const canvasDocs = (canvasRes.documents || []).filter(d => d.topicNumber);

            // Remove loading, keep header
            container.innerHTML = '';
            container.appendChild(header);

            // ── Scrollable body (header stays pinned, everything below scrolls) ──
            const scrollBody = el('div', { className: 'swml-portfolio-scroll' });

            // ── Filter bar (above all cards) ──
            const filterBar = el('div', { className: 'swml-portfolio-filters' });
            let activeTask = '';
            let activeSubject = '';
            let applyAllFilters = () => {}; // Assigned later once sessions are loaded
            // SVG icon helper (14px inline icons for filter pills)
            const _ico = (d, stroke) => stroke
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
            const ICONS = {
                brain: _ico('<path d="M11 2.5C10.4 2.2 9.7 2 9 2 6.8 2 5 3.8 5 6v1.8c-.9.3-1.5.9-2.1 1.5C2.3 10.2 2 11.3 2 12.5c0 1.6.8 3 2 3.7V17.5C4 20 6 22 8.5 22c.9 0 1.8-.3 2.5-.8V17.5c0-1.3-.3-2.2-.9-2.8-.5-.6-1.4-1-2.8-1.2l.3-2 c1.3.2 2.4.6 3.4 1.3V2.5zm2 0v10.3c.9-.7 2-1.1 3.3-1.3l.3 2c-1.4.2-2.3.7-2.8 1.2-.5.6-.9 1.5-.9 2.8v3.7c.7.5 1.6.8 2.5.8 2.5 0 4.5-2 4.5-4.5v-1.3c1.2-.8 2-2.2 2-3.7 0-1.2-.3-2.3-.9-3.2-.5-.7-1.2-1.2-2.1-1.5V6c0-2.2-1.8-4-4-4-.7 0-1.4.2-2 .5z"/>'),
                list: _ico('<path d="M3 7h4m0 0V3m0 4l4 4M3 17h4m0 0v4m0-4l4-4M17 3l-4 4M17 21l-4-4M21 7h-4m0 0V3m0 4l-4 4M21 17h-4m0 0v4m0-4l-4-4"/>', true),
                question: _ico('<path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm-1-7v2h2v-2h-2zm2-1.6c1.4-.4 2.5-1.8 2.5-3.4 0-1.9-1.6-3.5-3.5-3.5-1.7 0-3.1 1.2-3.4 2.8l2 .4c.1-.7.7-1.2 1.4-1.2.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5c-.6 0-1 .4-1 1V14h2v-.6z"/>'),
                doc: _ico('<path d="M4 21.4V2.6c0-.3.3-.6.6-.6h11.7c.1 0 .3.1.4.2l3.1 3.1c.1.1.2.3.2.4V21.4c0 .3-.3.6-.6.6H4.6c-.3 0-.6-.3-.6-.6z"/><path d="M8 10h8M8 14h8M8 18h5"/>', true),
                docplus: _ico('<path d="M20.6 8.2v14.3H3.4V1.5h12.4l4.8 4.8v1.9"/><path d="M14.9 7.2V1.5"/><path d="M6.3 7.2h5.7M9.1 4.4v5.7"/><path d="M9.1 13.9h8.6M6.3 17.7h11.5"/>', true),
                sparkle: _ico('<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>'),
                listcheck: _ico('<path d="M3.5 5.5l2 2L9 4M3.5 11.5l2 2L9 10M3.5 17.5l2 2L9 16M13 6h8M13 12h8M13 18h8"/>', true),
                quoteanalysis: _ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', true),
                pencil: _ico('<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>', true),
            };
            const taskLabels = {
                planning: ICONS.list + ' Essay Skills',
                assessment: ICONS.listcheck + ' Assessment',
                polishing: ICONS.sparkle + ' Polishing',
                exam_question: ICONS.pencil + ' Exam Question',
                essay_plan: ICONS.listcheck + ' Exam Essay Plan',
                model_answer: ICONS.doc + ' Model Answer',
                verbal_rehearsal: ICONS.quoteanalysis + ' Quote Analysis',
                conceptual_notes: ICONS.docplus + ' Conceptual Notes',
                memory_practice: ICONS.brain + ' Memory Practice',
            };
            // Collect unique tasks and subjects from both sources
            const uniqueTasks = [...new Set(sessions.map(s => s.task).filter(Boolean))];
            const uniqueSubjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))];
            const allPill = el('button', { className: 'swml-filter-pill active', textContent: 'All', onClick: () => { activeTask = ''; activeSubject = ''; applyAllFilters(); } });
            filterBar.appendChild(allPill);
            // Add "Mastery Programme" filter if there are canvas docs
            if (canvasDocs.length > 0) {
                const mpPill = el('button', { className: 'swml-filter-pill',
                    dataset: { filter: 'mastery', type: 'task' },
                    onClick: () => { activeTask = activeTask === 'mastery' ? '' : 'mastery'; applyAllFilters(); }
                });
                mpPill.innerHTML = ICONS.listcheck + ' Mastery Programme';
                filterBar.appendChild(mpPill);
            }
            uniqueTasks.forEach(t => {
                const pill = el('button', { className: 'swml-filter-pill',
                    dataset: { filter: t, type: 'task' },
                    onClick: () => { activeTask = activeTask === t ? '' : t; applyAllFilters(); }
                });
                pill.innerHTML = taskLabels[t] || ucfirst(t);
                filterBar.appendChild(pill);
            });
            if (uniqueSubjects.length > 1) {
                filterBar.appendChild(el('span', { className: 'swml-filter-sep', textContent: '|' }));
                uniqueSubjects.forEach(s => {
                    filterBar.appendChild(el('button', { className: 'swml-filter-pill', textContent: ucfirst(s),
                        dataset: { filter: s, type: 'subject' },
                        onClick: () => { activeSubject = activeSubject === s ? '' : s; applyAllFilters(); }
                    }));
                });
            }
            scrollBody.appendChild(filterBar);

            // ── Mastery Programme section (canvas documents) ──
            const mpSection = el('div', { className: 'swml-portfolio-section', id: 'swml-portfolio-mastery' });
            if (canvasDocs.length > 0) {
                mpSection.appendChild(el('div', { className: 'swml-portfolio-group-title', innerHTML: '📘 Mastery Programme' }));
                const mpGrid = el('div', { className: 'swml-portfolio-grid' });

                canvasDocs.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || '')).forEach((doc, idx) => {
                    const textName = ucfirst((doc.text || '').replace(/_/g, ' '));
                    const boardLabel = (doc.board || '').toUpperCase();
                    const topicLabel = doc.topicNumber ? `Topic ${doc.topicNumber}` : '';
                    const wc = doc.wordCount || 0;
                    const dateStr = doc.savedAt ? new Date(doc.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

                    const card = el('div', { className: 'swml-portfolio-card',
                        style: { cursor: 'pointer' },
                        onClick: () => {
                            try {
                                destroyShader(); shaderInitialized = false;
                                // Set all required state for canvas
                                state.board = doc.board || state.board;
                                state.text = doc.text || state.text;
                                state.textName = textName;
                                state.topicNumber = doc.topicNumber;
                                state.phase = 'initial';
                                state.mode = 'guided';
                                state.draftType = doc.topicNumber === 1 ? 'diagnostic' : 'development';
                                state.canvasTimer = 0;
                                state.task = '';
                                state.question = '';
                                state.marks = '';
                                // Infer subject from text
                                const shakespeareTexts = ['macbeth', 'romeo_juliet', 'much_ado', 'othello', 'tempest', 'twelfth_night', 'julius_caesar', 'merchant_of_venice'];
                                state.subject = shakespeareTexts.includes(doc.text) ? 'shakespeare' : (state.subject || 'shakespeare');
                                console.log('WML: Opening canvas from Past Work:', { board: state.board, text: state.text, topic: state.topicNumber, subject: state.subject, draftType: state.draftType });
                                WML.renderCanvasWorkspace();
                            } catch (err) {
                                console.error('WML: Failed to open canvas from Past Work:', err);
                                alert('Could not open this document. Please try again.');
                            }
                        }
                    });
                    card.style.animationDelay = `${idx * 0.06}s`;

                    card.appendChild(el('div', { className: 'swml-portfolio-card-text', textContent: textName }));
                    const badgeRow = el('div', { className: 'swml-portfolio-card-badges' });
                    badgeRow.appendChild(el('span', { className: 'swml-portfolio-card-task-badge', innerHTML: `📘 ${topicLabel} · Diagnostic` }));
                    badgeRow.appendChild(el('span', { className: 'swml-portfolio-badge draft', textContent: wc > 0 ? `${wc} words` : 'Draft' }));
                    card.appendChild(badgeRow);
                    card.appendChild(el('div', { className: 'swml-portfolio-card-board', textContent: `${boardLabel} · Shakespeare` }));

                    // Word count as progress indicator
                    const progress = el('div', { className: 'swml-portfolio-card-progress' });
                    const pct = Math.min(100, Math.round((wc / 650) * 100));
                    const progressBar = el('div', { className: 'swml-portfolio-step-dot filled', style: { width: `${pct}%`, height: '4px', borderRadius: '2px', background: wc >= 450 ? '#1CD991' : '#51dacf', display: 'inline-block' } });
                    const progressBg = el('div', { style: { width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' } });
                    progressBg.appendChild(progressBar);
                    progress.appendChild(progressBg);
                    progress.appendChild(el('span', { className: 'swml-portfolio-step-label', textContent: `${wc}/650` }));
                    card.appendChild(progress);

                    if (dateStr) card.appendChild(el('div', { className: 'swml-portfolio-card-date', textContent: dateStr }));
                    mpGrid.appendChild(card);
                });
                mpSection.appendChild(mpGrid);
                scrollBody.appendChild(mpSection);
            }

            if (sessions.length === 0 && canvasDocs.length === 0) {
                scrollBody.appendChild(el('div', { className: 'swml-portfolio-empty', textContent: 'No past sessions yet. Start a planning session to see your work here!' }));
            } else if (sessions.length === 0 && canvasDocs.length > 0) {
                // Only canvas docs — minimal filter
                applyAllFilters = function() {
                    filterBar.querySelectorAll('.swml-filter-pill').forEach(pill => {
                        const f = pill.dataset.filter;
                        if (!f) { pill.classList.toggle('active', !activeTask); }
                        else { pill.classList.toggle('active', activeTask === f); }
                    });
                    if (mpSection) mpSection.style.display = (activeTask && activeTask !== 'mastery') ? 'none' : '';
                };
            } else if (sessions.length > 0) {
                // Sessions container
                const sessionsContainer = el('div', { id: 'swml-portfolio-sessions' });
                scrollBody.appendChild(sessionsContainer);

                applyAllFilters = function() {
                    // Update pill active states
                    filterBar.querySelectorAll('.swml-filter-pill').forEach(pill => {
                        const f = pill.dataset.filter;
                        const t = pill.dataset.type;
                        if (!f) { pill.classList.toggle('active', !activeTask && !activeSubject); }
                        else if (t === 'task') { pill.classList.toggle('active', activeTask === f); }
                        else if (t === 'subject') { pill.classList.toggle('active', activeSubject === f); }
                    });

                    // Show/hide mastery programme section
                    if (mpSection) {
                        mpSection.style.display = (activeTask && activeTask !== 'mastery') ? 'none' : '';
                    }

                    // Filter sessions (hide if "mastery" filter is active)
                    if (activeTask === 'mastery') {
                        sessionsContainer.innerHTML = '';
                        return;
                    }

                    const filtered = sessions.filter(s => {
                        if (activeTask && s.task !== activeTask) return false;
                        if (activeSubject && s.subject !== activeSubject) return false;
                        return true;
                    });

                    // Group by text name
                    const grouped = {};
                    filtered.forEach(s => {
                        const key = s.text_name || ucfirst((s.text || '').replace(/_/g, ' ')) || 'Other';
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(s);
                    });

                    sessionsContainer.innerHTML = '';
                    if (filtered.length === 0 && (!canvasDocs.length || activeTask)) {
                        sessionsContainer.appendChild(el('div', { className: 'swml-portfolio-empty', textContent: 'No sessions match these filters.' }));
                        return;
                    }

                    let cardIndex = 0;
                Object.entries(grouped).forEach(([subjectName, items]) => {
                    const section = el('div', { className: 'swml-portfolio-section' });
                    section.appendChild(el('div', { className: 'swml-portfolio-group-title', textContent: subjectName }));
                    const grid = el('div', { className: 'swml-portfolio-grid' });

                    items.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(s => {
                        const card = el('div', { className: 'swml-portfolio-card', onClick: () => resumeSession(s) });
                        card.style.animationDelay = `${cardIndex * 0.06}s`;
                        cardIndex++;
                        const taskLabel = { planning: '📝 Essay Skills', assessment: '📊 Assessment', polishing: '✨ Polishing', exam_question: '✏️ Exam Question', essay_plan: '📋 Exam Essay Plan', model_answer: '📄 Model Answer', verbal_rehearsal: '🎙️ Random Quote Analysis', conceptual_notes: '📚 Conceptual Notes', memory_practice: '🧠 Memory Practice' }[s.task] || s.task;
                        const textName = s.text_name || ucfirst((s.text || '').replace(/_/g, ' '));

                        card.appendChild(el('div', { className: 'swml-portfolio-card-text', textContent: textName }));
                        // Save status badge
                        const badgeRow = el('div', { className: 'swml-portfolio-card-badges' });
                        badgeRow.appendChild(el('span', { className: 'swml-portfolio-card-task-badge', textContent: taskLabel }));
                        if (s.is_manual) {
                            badgeRow.appendChild(el('span', { className: 'swml-portfolio-badge saved', innerHTML: SVG_SAVE + ' Saved' }));
                        } else {
                            badgeRow.appendChild(el('span', { className: 'swml-portfolio-badge draft', textContent: 'Draft' }));
                        }
                        card.appendChild(badgeRow);
                        card.appendChild(el('div', { className: 'swml-portfolio-card-board', textContent: `${(s.board || '').toUpperCase()} · ${ucfirst(s.subject || '')}` }));
                        if (s.question) card.appendChild(el('div', { className: 'swml-portfolio-card-question', textContent: s.question.length > 60 ? s.question.slice(0, 60) + '…' : s.question }));

                        // Progress indicator
                        const progress = el('div', { className: 'swml-portfolio-card-progress' });
                        const step = s.step || s.steps_completed || 1;
                        for (let i = 1; i <= 8; i++) {
                            progress.appendChild(el('span', { className: `swml-portfolio-step-dot ${i <= step ? 'filled' : ''}` }));
                        }
                        progress.appendChild(el('span', { className: 'swml-portfolio-step-label', textContent: `${step}/8` }));
                        card.appendChild(progress);

                        const date = new Date(s.date);
                        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        card.appendChild(el('div', { className: 'swml-portfolio-card-date', textContent: dateStr }));

                        // Delete button
                        card.appendChild(el('button', { className: 'swml-portfolio-delete', textContent: '×', title: 'Delete',
                            onClick: (e) => {
                                e.stopPropagation();
                                showConfirm('Delete this session? This cannot be undone.', async () => {
                                    try { await apiPost(API.deleteSession, { session_id: s.session_id }); card.remove(); } catch (err) { console.warn('Delete failed:', err); }
                                }, { confirmText: 'Delete', danger: true });
                            }
                        }));

                        grid.appendChild(card);
                    });

                    section.appendChild(grid);
                    sessionsContainer.appendChild(section);
                });
                } // end applyAllFilters

                // Initial render with no filters
                applyAllFilters();
            }

            container.appendChild(scrollBody);
        } catch (e) {
            container.innerHTML = '';
            container.appendChild(header);
            container.appendChild(el('div', { className: 'swml-portfolio-empty', textContent: 'Could not load past sessions. Please try again.' }));
            console.error('Portfolio error:', e);
        }
    }

    async function resumeSession(session) {
        const textName = session.text_name || ucfirst((session.text || '').replace(/_/g, ' '));
        showConfirm(`Resume your ${session.task} session for ${textName}?`, () => doResume(session), { confirmText: 'Resume' });
    }

    async function doResume(session) {
        state.requestId++; // Invalidate any in-flight greeting request

        // Smooth fade-out transition
        const root = $('#swml-root');
        root.style.transition = 'opacity 0.35s ease';
        root.style.opacity = '0';
        await new Promise(r => setTimeout(r, 350));

        destroyShader(); shaderInitialized = false;
        try {
            const res = await apiGet(API.loadSession + '?session_id=' + encodeURIComponent(session.session_id));

            // Clear state before loading saved data
            state.chatHistory = [];
            state.plan = {};

            if (res.chat_history) state.chatHistory = res.chat_history;
            if (res.plan) state.plan = res.plan;
            if (res.context) {
                state.board = res.context.board || state.board;
                state.subject = res.context.subject || state.subject;
                state.text = res.context.text || state.text;
                state.textName = res.context.text_name || state.textName;
                state.task = res.context.task || state.task;
                state.question = res.context.question || state.question;
                state.marks = res.context.marks || state.marks;
                state.aos = res.context.aos || state.aos;
                state.isRedraft = res.context.is_redraft || false;
                state.poem = res.context.poem || '';
                state.poemTitle = res.context.poem_title || '';
                state.questionPart = res.context.question_part || res.context.poetry_section || '';
                state.comparisonPoem = res.context.comparison_poem || '';
                state.comparisonPoemTitle = res.context.comparison_poem_title || '';
            }
            state.step = res.step || session.step || session.steps_completed || 1;
            state.sessionId = session.session_id;
            state.chatId = res.ai_chat_id || session.session_id;

            // Immediately sync active session on backend so the Protocol Router
            // has the correct context if the student sends a message right away
            doSave(false);

            renderWorkspace();

            // Fade workspace back in
            requestAnimationFrame(() => {
                const r = $('#swml-root');
                if (r) { r.style.opacity = '1'; }
            });

            // Replay saved chat history into the UI (silent=true, no quick actions)
            state.chatHistory.forEach(m => {
                addMessage(m.role === 'user' ? 'user' : 'ai', m.content, true);
            });

            // Show quick action buttons for the LAST AI message (so student can respond)
            const lastAIMsg = [...state.chatHistory].reverse().find(m => m.role === 'assistant');
            if (lastAIMsg) {
                const actions = detectQuickActions(lastAIMsg.content);
                if (actions.length > 0) {
                    const msgs = $('#swml-messages');
                    const lastBubble = msgs?.querySelector('.swml-msg-ai:last-child .swml-bubble');
                    if (lastBubble && !lastBubble.querySelector('.swml-quick-actions')) {
                        const bar = el('div', { className: 'swml-quick-actions' });
                        actions.forEach(action => {
                            const icon = getQuickActionIcon(action.label);
                            bar.appendChild(el('button', {
                                className: 'swml-quick-btn',
                                innerHTML: (icon || '') + ' ' + action.label.replace(/^[A-F]\)\s*/, '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}✅✏️✓✗🎲📋🔥⚡🚀📂💡🎙️📝📊✨📄📚🎯]\s*/gu, '').trim(),
                                onClick: () => {
                                    const input = $('#swml-input');
                                    if (input) { input.value = action.value; sendMessage(); }
                                }
                            }));
                        });
                        lastBubble.appendChild(bar);
                    }
                }
            }

            const msgs = $('#swml-messages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
            renderPlan();
            updateProgress(state.step);

            // Add a visual "Resumed" indicator, no AI request
            const resumeNote = el('div', { className: 'swml-resume-notice', textContent: '↳ Session resumed — continue where you left off.' });
            if (msgs) msgs.appendChild(resumeNote);
            if (msgs) msgs.scrollTop = msgs.scrollHeight;

            // Trigger timer on resume if the last AI message was a timer prompt
            if (state.task === 'verbal_rehearsal' && state.chatHistory.length > 0) {
                const lastAI = [...state.chatHistory].reverse().find(m => m.role === 'assistant');
                if (lastAI) {
                    const tail = lastAI.content.slice(-300).toLowerCase();
                    if (tail.includes('90 seconds') && tail.includes('ready')) {
                        showTimer(90, '⏱️ Planning');
                    } else if ((tail.includes('2.5 minutes') || tail.includes('2½ minutes')) && tail.includes('ready')) {
                        showTimer(150, '⏱️ Paragraph');
                    }
                }
            }

        } catch (e) {
            console.error('Resume error:', e);
            alert('Could not load this session. It may have expired.');
        }
    }

    function copyPlan() {
        const elems = getElements();
        const isAssessment = state.task === 'assessment';
        const isExamQ = state.task === 'exam_question';
        let t = `${isAssessment ? '📊 ASSESSMENT RESULTS' : isExamQ ? '📝 EXAM QUESTIONS' : '📋 ESSAY PLAN'}\n═══════════════════\n\n${state.board.toUpperCase()} · ${ucfirst(state.subject)} · ${ucfirst(state.text)}\n`;
        if (state.question) t += `\nQuestion: ${state.question}\n${state.marks} marks · ${state.aos.join(' + ')}\n`;
        t += '\n';

        if (isExamQ) {
            const questions = collectAllQuestions();
            if (questions.length === 0) {
                t += 'No questions generated yet.\n';
            } else {
                questions.forEach((q, idx) => {
                    t += `QUESTION ${idx + 1}\n───────────────────\n`;
                    const cleaned = q.rawMsg
                        .replace(/\*\*(.+?)\*\*/g, '$1')
                        .replace(/\*(.+?)\*/g, '$1')
                        .replace(/^#+\s*/gm, '')
                        .replace(/Is there anything you would like to change\?.*$/im, '')
                        .replace(/\*{0,2}A\*{0,2}\s*[—\-]+\s*💡.*$/im, '')
                        .replace(/\*{0,2}B\*{0,2}\s*[—\-]+\s*📋.*$/im, '')
                        .trim();
                    t += cleaned + '\n\n';
                });
            }
        } else if (isAssessment) {
            [
                { title: 'SESSION FOCUS', elems: ['question_text', 'goal'] },
                { title: 'AO SCORES', elems: ['ao1_score', 'ao2_score', 'ao3_score', 'ao4_score', 'total_score', 'grade'] },
                { title: 'FEEDBACK', elems: ['strength_1', 'target_1', 'target_2'] },
            ].forEach(s => {
                t += s.title + '\n───────────────────\n';
                s.elems.forEach(e => {
                    const info = elems.find(x => x.type === e);
                    const d = state.plan[e];
                    t += `${info?.label || e}: ${d ? d.content : '(not yet completed)'}\n`;
                });
                t += '\n';
            });
        } else if (state.task === 'polishing') {
            [
                { title: 'POLISH FOCUS', elems: ['question_text', 'current_level', 'target_level', 'polish_focus'] },
                { title: 'REVISIONS', elems: ['revision_1', 'revision_2', 'revision_3'] },
            ].forEach(s => {
                t += s.title + '\n───────────────────\n';
                s.elems.forEach(e => {
                    const info = elems.find(x => x.type === e);
                    const d = state.plan[e];
                    t += `${info?.label || e}: ${d ? d.content : '(not yet completed)'}\n`;
                });
                t += '\n';
            });
        } else {
            [
                { title: 'QUESTION FOCUS', elems: ['goal', 'keywords'] },
                { title: 'ANCHOR QUOTES', elems: ['anchor_quote_start', 'anchor_quote_mid', 'anchor_quote_end'] },
                { title: 'ESSAY PLAN', elems: ['introduction', 'body_para_1', 'body_para_2', 'body_para_3', 'conclusion'] },
            ].forEach(s => {
                t += s.title + '\n───────────────────\n';
                s.elems.forEach(e => {
                    const info = elems.find(x => x.type === e);
                    const d = state.plan[e];
                    t += `${info?.label || e}: ${d ? d.content : '(not yet completed)'}\n`;
                });
                t += '\n';
            });
        }
        clip(t, $('.swml-copy-btn'));
    }



    // ── Register cross-module functions on WML namespace ──
    // Used by wml-core.js getPhaseSubSteps() onClick handlers
    WML.selectTask = selectTask;
    WML.renderDiagnosticTimerSelect = renderDiagnosticTimerSelect;
    WML.renderSetup = renderSetup;
    WML.renderWorkspace = renderWorkspace;
    WML.destroyShader = destroyShader;
    WML.syncUrl = syncUrl;

    // Used by wml-assessment.js (late-bound wrappers)
    WML.sendToNotes = sendToNotes;
    WML.updateProgress = updateProgress;
    WML.detectQuickActions = detectQuickActions;
    WML.extractAssessmentContent = extractAssessmentContent;
    WML.clip = clip;
    WML.clipRich = clipRich;
    WML.showPhaseCompleteCard = showPhaseCompleteCard;
    WML.extractAndSavePlan = extractAndSavePlan;
    WML.refreshPlan = refreshPlan;

    // v7.13.34: CW dashboard — accessible from assessment module
    WML.renderCreativeWritingDashboard = renderCreativeWritingDashboard;
    WML.showPortfolio = showPortfolio; // v7.14.48: Expose for assessment module sidebar

    // Embedded mode flag — accessible from assessment module (v7.13.11)
    WML.isEmbedded = isEmbedded;
    WML.embedConfig = embedConfig;

    // Sync shaderInitialized with assessment module
    Object.defineProperty(WML, '_shaderInitialized', {
        get() { return shaderInitialized; },
        set(v) { shaderInitialized = v; },
        configurable: true
    });

    // ── Boot ──
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderSetup);
    else renderSetup();

    // ── SPA Re-initialization (v7.13.15) ──
    // LearnDash Focus Mode uses AJAX navigation — content is replaced without page reload.
    // Poll for embed root changes instead of MutationObserver to avoid infinite loops.
    if (isEmbedded) {
        let _lastEmbedPost = embedConfig?.postId || 0;
        setInterval(() => {
            const embedRoot = document.getElementById('swml-embedded-root');
            if (!embedRoot) {
                // Navigated away — clean up all WML state from persistent DOM
                const overlay = document.getElementById('swml-canvas-overlay');
                if (overlay) { overlay.remove(); document.body.style.overflow = ''; }
                document.body.classList.remove('swml-has-embed', 'swml-embedded-active');
                _lastEmbedPost = 0;
                return;
            }
            // v7.15.7: Re-add embedded class on every tick — handles SPA return navigation
            // classList.add is idempotent (no-op if already present)
            document.body.classList.add('swml-embedded-active');
            // Check if the embed root has a different post ID (SPA navigated to new WML lesson)
            try {
                const cfg = JSON.parse(embedRoot.dataset.swmlEmbed || '{}');
                if (cfg.postId && cfg.postId !== _lastEmbedPost) {
                    _lastEmbedPost = cfg.postId;
                    console.log('WML SPA: New lesson detected (post ' + cfg.postId + ') — re-initializing');

                    // Clean up old canvas
                    const oldOverlay = document.getElementById('swml-canvas-overlay');
                    if (oldOverlay) oldOverlay.remove();
                    document.body.style.overflow = '';

                    // Update config and state
                    window.swmlEmbedConfig = cfg;
                    if (cfg.board)   state.board   = cfg.board;
                    if (cfg.subject) state.subject = cfg.subject;
                    if (cfg.text)    state.text    = cfg.text;
                    if (cfg.task)    state.task    = cfg.task;
                    if (cfg.topic)   state.topicNumber = cfg.topic;
                    if (cfg.phase === 'redraft') { state.phase = 'redraft'; state.isRedraft = true; }
                    else if (cfg.phase === 'initial') { state.phase = 'initial'; state.isRedraft = false; }
                    state.mode = 'exam_prep';
                    state.textName = cfg.text ? getTextLabel(cfg.text, cfg.subject) : '';

                    renderSetup();
                }
            } catch (e) {}
            // v7.14.18: REMOVED — this was causing infinite re-render loops.
            // If canvas overlay doesn't exist (chat exercise, failed boot, or TipTap not loaded),
            // this fired renderSetup() every 1s, freezing the browser.
            // The SPA post-ID check above (line 6496) is sufficient for detecting navigation.
        }, 1000);
    }

    // ── LD Theme Toggle Sync — REMOVED v7.14.21 ──
    // WML now uses its own independent toggle. Both respect system preferences.

})();
