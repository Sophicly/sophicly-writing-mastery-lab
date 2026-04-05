/**
 * WML Assessment — Canvas workspace, document building, TipTap editor
 * Extracted from wml-app.js v7.12.61
 *
 * Depends on wml-core.js (window.WML namespace).
 * Cross-module calls to planning/chat functions use late-bound WML.* wrappers.
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

    // ── Late-bound wrappers for planning/chat functions ──
    // These are defined in wml-app.js which registers them on WML.
    // At call-time (user interaction), WML.* is fully populated.
    const sendToNotes = (...args) => window.WML.sendToNotes(...args);
    const updateProgress = (...args) => window.WML.updateProgress(...args);
    const detectQuickActions = (...args) => window.WML.detectQuickActions(...args);
    const extractAssessmentContent = (...args) => window.WML.extractAssessmentContent(...args);
    const clip = (...args) => window.WML.clip(...args);
    const clipRich = (...args) => window.WML.clipRich(...args);
    const showPhaseCompleteCard = (...args) => window.WML.showPhaseCompleteCard(...args);
    const extractAndSavePlan = (...args) => window.WML.extractAndSavePlan(...args);
    const refreshPlan = (...args) => window.WML.refreshPlan(...args);

    // Pre-assessment functions (defined in wml-app.js entry flow section)
    const destroyShader = () => window.WML.destroyShader();
    const syncUrl = () => window.WML.syncUrl?.();

    // Shared mutable: shaderInitialized lives in wml-app.js.
    // wml-app.js defines WML._shaderInitialized as a getter/setter synced with its local let.
    // Assessment code reads/writes WML._shaderInitialized at runtime (after app.js has loaded).

    //  WRITING CANVAS — TipTap Editor
    // ══════════════════════════════════════════

    let canvasEditor = null;
    let canvasSaveTimer = null;
    let canvasSignoffData = null;
    let canvasTimerInterval = null; // Module-scope declaration (was inside renderCanvasWorkspace — bug fix v7.12.62)
    // v7.13.35: Use exerciseConfig.storageSuffix for ALL exercise types — prevents key collisions
    // between assessment, mark_scheme, CW steps, etc. on the same board/text/topic.
    const CANVAS_SAVE_KEY = () => {
        const suffix = WML.getExerciseConfig(state.task).storageSuffix || '';
        return `swml_canvas_${state.board}_${state.text}_${state.topicNumber || 'free'}${suffix}`;
    };
    const CHAT_SAVE_KEY = () => {
        const suffix = WML.getExerciseConfig(state.task).storageSuffix || '';
        return `swml_chat_${state.board}_${state.text}_${state.topicNumber || 'free'}${suffix}`;
    };
    let chatSaveTimer = null;
    let canvasSilentSend = false; // v7.14.3: When true, sendCanvasMessage skips user bubble display
    let _currentAddComment = null; // v7.14.48: Module-level ref for context toolbar (survives re-renders)

    function saveCanvasChat(history, chatId) {
        // 1. Instant localStorage write (include step + task for resume and stale detection)
        try {
            localStorage.setItem(CHAT_SAVE_KEY(), JSON.stringify({ history, chatId, step: state.step || 1, task: state.task, exerciseId: state.exerciseId || '', savedAt: new Date().toISOString(), count: history.length }));
        } catch (e) { /* storage full */ }
        // 2. Debounced server write (every 8s — less frequent than doc save)
        clearTimeout(chatSaveTimer);
        chatSaveTimer = setTimeout(() => {
            fetch(API.chatSave, {
                method: 'POST', headers,
                body: JSON.stringify({ board: state.board, text: state.text, topicNumber: state.topicNumber || null, suffix: WML.getExerciseConfig(state.task).storageSuffix || '', history, chatId })
            }).then(r => r.json()).then(res => {
                if (res.success) console.log('WML: Chat saved to server', { count: res.count });
                else console.warn('WML: Chat save failed', res);
            }).catch(e => console.warn('WML: Chat server save failed', e.message));
        }, 8000);
    }

    function loadCanvasChat() {
        try {
            const raw = localStorage.getItem(CHAT_SAVE_KEY());
            if (raw) return JSON.parse(raw);
        } catch (e) { /* parse error */ }
        return null;
    }

    function clearCanvasChat() {
        try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch (e) {}
        fetch(API.chatClear, {
            method: 'POST', headers,
            body: JSON.stringify({ board: state.board, text: state.text, topicNumber: state.topicNumber || null, suffix: WML.getExerciseConfig(state.task).storageSuffix || '' })
        }).catch(() => {});
    }

    function closeCanvasOverlay() {
        if (canvasEditor) {
            saveCanvasContent();
            canvasEditor.destroy();
            canvasEditor = null;
        }
        if (canvasTimerInterval) { clearInterval(canvasTimerInterval); canvasTimerInterval = null; }
        // Close floating video player if open (v7.12.78)
        if (window.wmlVideo?.isOpen()) wmlVideo.close();
        try { if (document.querySelector('.swml-dictating')) document.querySelector('.swml-dictating').click(); } catch(e) {}
        const ov = document.getElementById('swml-canvas-overlay');
        if (ov) ov.remove();
        document.body.style.overflow = '';
        // Clear task from URL and re-render setup screen (v7.12.77)
        state.task = '';
        syncUrl();
        // Re-render the setup/stepper screen if #swml-root is empty
        const root = document.getElementById('swml-root');
        if (root && (!root.children.length || root.innerHTML.trim().length < 50)) {
            if (typeof WML.renderSetup === 'function') WML.renderSetup();
        }
        // Restart WebGL shader — was destroyed on canvas entry (v7.12.59)
        const shaderBgEl = document.getElementById('swml-shader-bg');
        if (shaderBgEl) {
            shaderBgEl.style.display = '';
            if (window.swmlShader && !WML._shaderInitialized) {
                try { window.swmlShader.init(shaderBgEl); WML._shaderInitialized = true; } catch(e) { /* shader re-init failed, gradient fallback still visible */ }
            }
        }
        // Restore notepad + Take Notes tab
        const fab = document.querySelector('.sn-fab');
        const pnl = document.querySelector('.sn-panel');
        if (fab) fab.style.display = '';
        if (pnl) pnl.style.display = '';
        document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger, [class*="sticky-note-tab"], [class*="notes-tab"]').forEach(t => t.style.display = '');
        const fabTrigger = document.getElementById('snFabTrigger');
        if (fabTrigger) fabTrigger.style.display = '';
        document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]').forEach(t => {
            if (t.textContent.trim() === 'Take Notes' || t.textContent.trim() === 'TakeNotes') t.style.display = '';
        });
    }

    // ══════════════════════════════════════════════════════════════════
    //  buildTrainingPanels() — extracted from diagnostic→assessment transition (v7.14.48)
    //  Builds sidebar (protoPanel), chat panel, resize handle, and all wiring.
    //  Called by both the diagnostic Mark Complete transition AND direct training-env rendering.
    // ══════════════════════════════════════════════════════════════════
    function buildTrainingPanels(ctx) {
        const {
            canvas, canvasEditor, exerciseConfig,
            boardLabel, subjectLabel, textLabel,
            isCwTask, cwStepDef, isCwSi, isExamPrep,
            canvasInMarkScheme, canvasInFeedback,
            canvasChatHeaderLabel, canvasSidebarSteps,
        } = ctx;
        // Mutable ref — caller passes { value: btn } so we can write back
        const assessCompleteBtnRef = ctx.assessCompleteBtnRef; // { value: null }

        // 1. Build left protocol panel — sidebar
        const protoPanel = el('div', { className: 'swml-sidebar swml-canvas-proto' });

        // Logo + collapse button
        const protoHead = el('div', { className: 'swml-sidebar-head', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
        protoHead.appendChild(renderLogo ? renderLogo() : el('span'));
        const protoCollapseBtn = el('button', { className: 'swml-collapse-btn', textContent: '\u25C0', title: 'Collapse sidebar' });
        protoCollapseBtn.addEventListener('click', () => {
            protoPanel.classList.toggle('collapsed');
            const isC = protoPanel.classList.contains('collapsed');
            protoCollapseBtn.textContent = isC ? '\u25B6' : '\u25C0';
            protoCollapseBtn.title = isC ? 'Expand sidebar' : 'Collapse sidebar';
        });
        protoHead.appendChild(protoCollapseBtn);
        protoPanel.appendChild(protoHead);

        // Body wrapper
        const protoBody = el('div', { className: 'swml-sidebar-body' });

        // Badges
        const protoBadges = el('div', { className: 'swml-sidebar-badges' });
        if (isCwTask) {
            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Creative Writing Masterclass' }));
            if (state.cwProjectName) {
                const nameEl = el('span', { className: 'swml-sidebar-badge', textContent: '\u201c' + state.cwProjectName + '\u201d', style: { fontStyle: 'italic', opacity: '0.7' } });
                protoBadges.appendChild(nameEl);
            }
        } else {
            [boardLabel, subjectLabel, textLabel].filter(Boolean).forEach(b =>
                protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: b }))
            );
        }
        // Topic / mode badge
        if (state.topicNumber && (state.mode === 'guided' || canvasInMarkScheme)) {
            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: `Topic ${state.topicNumber}` }));
        } else if (state.mode === 'exam_prep' && !canvasInMarkScheme) {
            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Exam Practice' }));
        }
        // Task label
        const sidebarTaskLabel = (state.task === 'planning' && state.mode === 'guided') ? 'Plan Redraft'
            : (state.task === 'polishing' && state.mode === 'guided') ? 'Polish Redraft'
            : exerciseConfig.label || 'Assessment';
        protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge active', textContent: sidebarTaskLabel }));
        const PHASE_LABELS = { initial: 'Phase 1', redraft: 'Phase 2', preliminary: 'Preliminary', free_practice: 'Free Practice', exam_practice: 'Exam Practice' };
        const sidebarPhaseLabel = PHASE_LABELS[state.phase] || '';
        if (sidebarPhaseLabel) {
            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: sidebarPhaseLabel }));
        }
        protoBody.appendChild(protoBadges);

        // Protocol Progress label
        const progressLabel = isCwTask ? `Step ${cwStepDef?.step || ''} Progress` : 'Protocol Progress';
        protoBody.appendChild(el('div', { className: 'swml-sidebar-section-label', textContent: progressLabel }));

        // Steps — manifest-driven
        const protoSteps = el('div', { id: 'swml-progress-steps' });
        const assessSteps = canvasSidebarSteps || (isExamPrep ? (getSteps() || []).map((s, i) => ({ step: i + 1, label: s.label })) : [
            { step: 1, label: 'Setup & Details' },
            { step: 2, label: 'Goal Setting' },
            { step: 3, label: 'Self-Reflection' },
            { step: 4, label: 'Essay Review' },
            { step: 5, label: 'Introduction' },
            { step: 6, label: 'Body Paragraphs' },
            { step: 7, label: 'Conclusion' },
            { step: 8, label: 'Summary & Action Plan' },
        ]);
        assessSteps.forEach((s, i) => {
            const cls = i === 0 ? 'active' : '';
            protoSteps.appendChild(el('div', { className: `swml-step ${cls}`, 'data-step': s.step }, [
                el('div', { className: `swml-step-circle ${cls}`, textContent: s.step }),
                el('span', { className: 'swml-step-label', textContent: s.label }),
            ]));
        });
        protoBody.appendChild(protoSteps);

        // Bottom buttons
        const protoSpacer = el('div', { style: { marginTop: 'auto' } });

        function iconBtn(svgIcon, text, onClick) {
            const btn = el('button', { className: 'swml-sidebar-btn swml-sidebar-icon-btn', onClick });
            btn.appendChild(el('span', { className: 'swml-btn-icon', innerHTML: svgIcon }));
            btn.appendChild(el('span', { className: 'swml-btn-text', innerHTML: svgIcon + ' ' + text }));
            return btn;
        }

        // Assessment Mark Complete button — 3D Push Button
        const assessBtn = build3DButton('Mark Complete', 'Done!', async () => {
            if (state._phaseMarkedComplete) return;
            if (isCwSi && state.cwProjectId) {
                state._phaseMarkedComplete = true;
                const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                if (artifactKey && canvasEditor) {
                    await WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, canvasEditor.getHTML());
                }
                const stepKey = cwStepDef?.step ? 'step_' + cwStepDef.step : cwStepDef?.id;
                await WML.cwProject.markStepComplete(state.cwProjectId, stepKey);
                assessBtn.style.display = 'none';
                showToast('Step complete! Your work has been saved.');
                setTimeout(() => {
                    if (WML.renderCreativeWritingDashboard) WML.renderCreativeWritingDashboard();
                }, 1500);
                return;
            }
            showPhaseCompleteCard();
        });
        assessBtn.style.display = 'none';
        assessBtn.classList.add('swml-assess-complete-btn');
        assessCompleteBtnRef.value = assessBtn;
        protoSpacer.appendChild(assessBtn);

        // Save button
        const saveBtn = iconBtn(SVG_SAVE, 'Save Progress', () => {
            if (canvasEditor) saveCanvasContent();
            saveBtn.querySelector('.swml-btn-text').textContent = '\u2713 Saved';
            setTimeout(() => { saveBtn.querySelector('.swml-btn-text').innerHTML = SVG_SAVE + ' Save Progress'; }, 2000);
        });
        protoSpacer.appendChild(saveBtn);

        // Past Work — v7.14.50: hidden in embedded mode (LD handles navigation)
        if (!WML.isEmbedded) {
            protoSpacer.appendChild(iconBtn(SVG_FOLDER, 'Past Work', () => { closeCanvasOverlay(); if (window.WML.showPortfolio) window.WML.showPortfolio(); }));
        }

        // Dashboard
        protoSpacer.appendChild(iconBtn(SVG_DASHBOARD, 'My Dashboard', () => window.open('/dashboard/', '_blank')));

        // CW: Back to Steps
        if (isCwTask) {
            protoSpacer.appendChild(iconBtn(SVG_BACK, 'Back to Steps', () => {
                if (canvasEditor) saveCanvasContent();
                const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                if (artifactKey && state.cwProjectId && canvasEditor) {
                    const content = canvasEditor.getHTML();
                    WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, content).catch(() => {});
                }
                if (WML.renderCreativeWritingDashboard) {
                    WML.renderCreativeWritingDashboard();
                }
            }));
        }
        protoBody.appendChild(protoSpacer);
        protoPanel.appendChild(protoBody);

        // 2. Build right chat panel
        const chatPanel = el('div', { className: 'swml-canvas-chat' });

        // Chat header with clear button
        const chatHeader = el('div', { className: 'swml-canvas-chat-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
        const headerLabel = canvasChatHeaderLabel + (isCwTask && state.cwProjectName ? ' \u2014 \u201c' + state.cwProjectName + '\u201d' : '');
        chatHeader.appendChild(el('span', { innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;opacity:0.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ' + headerLabel }));

        // Chat messages area
        const chatMessages = el('div', { className: 'swml-canvas-chat-messages', id: 'swml-canvas-chat-messages' });

        // Canvas Chat — AI Engine Wiring
        const canvasChatHistory = [];
        let canvasChatId = '';
        let canvasChatLoading = false;

        // Chat message helper
        function addChatMessage(text, role, rawText) {
            chatMessages.querySelectorAll('.swml-quick-actions').forEach(q => q.remove());
            const bubble = el('div', { className: `swml-bubble ${role === 'ai' ? 'ai' : 'user'}` });
            const content = el('div', { className: 'swml-bubble-content' });
            if (role === 'ai') {
                const header = el('div', { className: 'swml-bubble-header' });
                header.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
                const rawForCopy = rawText || text.replace(/<[^>]+>/g, '');
                header.appendChild(el('button', { className: 'swml-bubble-copy', innerHTML: SVG_COPY, title: 'Copy this message',
                    onClick: (e) => { e.stopPropagation(); clip(rawForCopy, e.currentTarget); } }));
                const assessBlock = extractAssessmentContent(rawForCopy);
                if (assessBlock) {
                    header.appendChild(el('button', { className: 'swml-bubble-copy swml-copy-assess', innerHTML: SVG_COPY_ASSESS,
                        onClick: (e) => { e.stopPropagation(); clipRich(assessBlock, e.currentTarget); } }));
                }
                content.appendChild(header);
                const body = el('div', { className: 'swml-bubble-body' });
                body.innerHTML = text;
                content.appendChild(body);

                // Quick action buttons
                const detectText = rawText || text.replace(/<[^>]+>/g, '');
                const canvasAssessDone = state.task === 'assessment' && state.plan.total_score && state.plan.grade;
                const isHattieQuestion = /(?:Where\s+am\s+I\s+going|How\s+am\s+I\s+going|Where\s+to\s+next|transfer.*skills|how\s+will\s+you.*apply|Session\s+Complete)/i.test(detectText);
                const actions = (canvasAssessDone || isHattieQuestion) ? [] : detectQuickActions(detectText);
                if (actions.length > 0) {
                    const isMulti = /(?:pick|choose|select|commit to)\s*(?:(?:up to|between|at least)?\s*)?(\d)\s*[-\u2013to]+\s*(\d)/i.test(detectText)
                        || /(?:pick|choose|select)\s+(?:multiple|several|a few|some)\b/i.test(detectText)
                        || /select\s+all\s+that\s+apply/i.test(detectText);
                    const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3|targeting.*AO/i.test(detectText)
                        && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));

                    const bar = el('div', { className: 'swml-quick-actions' });

                    if ((isMulti || isAoContext) && actions.length >= 2) {
                        const selected = new Set();
                        actions.forEach(action => {
                            const btn = el('button', {
                                className: 'swml-quick-btn swml-quick-toggle',
                                textContent: action.label,
                                onClick: () => {
                                    if (selected.has(action.value)) {
                                        selected.delete(action.value);
                                        btn.classList.remove('swml-quick-toggle-on');
                                    } else {
                                        selected.add(action.value);
                                        btn.classList.add('swml-quick-toggle-on');
                                    }
                                    submitBtn.style.display = selected.size > 0 ? 'block' : 'none';
                                }
                            });
                            btn.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter') { e.preventDefault(); if (selected.size > 0) submitBtn.click(); }
                            });
                            bar.appendChild(btn);
                        });
                        const submitBtn = el('button', {
                            className: 'swml-quick-btn swml-quick-submit',
                            textContent: '\u2713 Submit',
                            style: { display: 'none' },
                            onClick: () => {
                                bar.remove();
                                chatTextarea.value = Array.from(selected).join(', ');
                                sendCanvasMessage();
                            }
                        });
                        bar.appendChild(submitBtn);
                    } else if (actions._ranking && actions.length >= 2) {
                        // ── Ranking mode for canvas chat (v7.14.51) ──
                        const ranked = [];
                        const btnMap = new Map();
                        const rankSubmitBtn = el('button', {
                            className: 'swml-quick-btn swml-quick-submit',
                            textContent: 'Submit Ranking →',
                            style: { display: 'none' },
                            onClick: () => {
                                bar.remove();
                                chatTextarea.value = ranked.map((v, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}: ${v}`).join(', ');
                                sendCanvasMessage();
                            }
                        });
                        const updateRankLabels = () => {
                            btnMap.forEach((btn, val) => {
                                const idx = ranked.indexOf(val);
                                const baseLabel = btn.dataset.baseLabel;
                                if (idx >= 0) {
                                    btn.classList.add('swml-quick-toggle-on');
                                    btn.innerHTML = `<span class="swml-rank-num">${idx + 1}</span> ${baseLabel}`;
                                } else {
                                    btn.classList.remove('swml-quick-toggle-on');
                                    btn.innerHTML = baseLabel;
                                }
                            });
                            rankSubmitBtn.style.display = ranked.length > 0 ? 'block' : 'none';
                            rankSubmitBtn.textContent = ranked.length > 0 ? `Submit Ranking (${ranked.length}) →` : 'Submit Ranking →';
                        };
                        actions.forEach(action => {
                            const cleanLabel = action.label.replace(/^[A-F]\)\s*/, '');
                            const btn = el('button', {
                                className: 'swml-quick-btn swml-rank-btn',
                                textContent: cleanLabel,
                                onClick: () => {
                                    const idx = ranked.indexOf(action.value);
                                    if (idx >= 0) { ranked.splice(idx, 1); } else { ranked.push(action.value); }
                                    updateRankLabels();
                                }
                            });
                            btn.dataset.baseLabel = cleanLabel;
                            btnMap.set(action.value, btn);
                            bar.appendChild(btn);
                        });
                        bar.appendChild(rankSubmitBtn);
                    } else {
                        actions.forEach(action => {
                            const btn = el('button', {
                                className: 'swml-quick-btn',
                                textContent: action.label,
                                onClick: () => {
                                    if (isExamPrep && /saved\s*question/i.test(action.label || action.value)) {
                                        bar.remove();
                                        _showSavedQuestionOverlay(chatTextarea, sendCanvasMessage);
                                        return;
                                    }
                                    bar.remove();
                                    chatTextarea.value = action.value;
                                    sendCanvasMessage();
                                }
                            });
                            bar.appendChild(btn);
                        });
                    }
                    content.appendChild(bar);
                }

                // Back-to-top button on long messages
                setTimeout(() => {
                    if (body.offsetHeight > 500) {
                        const topBtn = el('button', {
                            className: 'swml-msg-top-btn',
                            innerHTML: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 17a.5.5 0 0 1-.5-.5V4.707L5.354 8.854a.5.5 0 1 1-.708-.708l5-5a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1-.708.708L10.5 4.707V16.5a.5.5 0 0 1-.5.5"/></svg> Back to top of message',
                            onClick: () => { bubble.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                        });
                        content.appendChild(topBtn);
                    }
                }, 100);
            } else {
                const userHeader = el('div', { className: 'swml-bubble-header', style: { justifyContent: 'flex-end' } });
                userHeader.appendChild(el('button', { className: 'swml-bubble-copy swml-user-copy', innerHTML: SVG_COPY, title: 'Copy your message',
                    onClick: (e) => { e.stopPropagation(); clip(text, e.currentTarget); } }));
                content.appendChild(userHeader);
                content.appendChild(el('p', { textContent: text }));
            }
            bubble.appendChild(content);
            chatMessages.appendChild(bubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Clear chat button
        const clearChatBtn = el('button', {
            className: 'swml-clear-chat-btn',
            title: 'Clear chat and start fresh',
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
            onClick: () => {
                showConfirm(
                    'Clear this assessment chat and start fresh? Your document and essay are preserved \u2014 only the chat messages will be removed.',
                    () => {
                        clearCanvasChat();
                        canvasChatHistory.length = 0;
                        canvasChatId = '';
                        chatMessages.innerHTML = '';
                        state.plan = {};
                        state._phaseMarkedComplete = false;
                        state.step = 1;
                        if (assessCompleteBtnRef.value) assessCompleteBtnRef.value.classList.remove('swml-assess-ready');
                        updateProgress(1);
                        const fn = (config.userName || '').split(' ')[0] || 'there';

                        if (isCwTask && cwStepDef) {
                            const stepLabel = cwStepDef.label || 'this step';
                            const stepNum = cwStepDef.step || cwStepDef.trial || '';
                            const gt = `Welcome back to Step ${stepNum}: **${stepLabel}**\n\nLet\u2019s continue working on this step. When you\u2019re ready, hit the button below.`;
                            addChatMessage(formatAI(gt), 'ai', gt);
                            canvasChatHistory.push({ role: 'assistant', content: gt });
                            saveCanvasChat(canvasChatHistory, canvasChatId);
                            const startBar = el('div', { className: 'swml-quick-actions' });
                            startBar.appendChild(el('button', {
                                className: 'swml-quick-btn',
                                textContent: "Let's begin",
                                onClick: () => { startBar.remove(); chatTextarea.value = "Let's begin!"; sendCanvasMessage(); }
                            }));
                            const greetBubble = chatMessages.lastElementChild;
                            if (greetBubble) {
                                const bc = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                                bc.appendChild(startBar);
                            }
                        } else {
                        const tn = state.textName || state.text || 'your text';
                        const wc = getResponseWordCount(canvasEditor);
                        const qText = extractEssayQuestion(canvasEditor);
                        const questionInfo = qText ? `\n\nYour essay question: **${qText}**` : '';
                        const essayLabel = (state.mode === 'exam_prep') ? `${tn} essay` : `${tn} diagnostic essay`;
                        const gt = `Hi ${fn}! Welcome to the assessment phase. I've received your ${essayLabel} (${wc} words). Let's review your writing together.${questionInfo}\n\nBefore I begin marking, I need to know: **what grade are you aiming for?** This helps me tailor my feedback to where you want to be.`;
                        addChatMessage(formatAI(gt), 'ai', gt);
                        canvasChatHistory.push({ role: 'assistant', content: gt });
                        saveCanvasChat(canvasChatHistory, canvasChatId);
                        const gradeBarCC = el('div', { className: 'swml-quick-actions' });
                        ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                            gradeBarCC.appendChild(el('button', {
                                className: 'swml-quick-btn',
                                textContent: g,
                                onClick: () => { gradeBarCC.remove(); chatTextarea.value = g; sendCanvasMessage(); }
                            }));
                        });
                        const ccBubble = chatMessages.lastElementChild;
                        if (ccBubble) {
                            const ccContent = ccBubble.querySelector('.swml-bubble-content') || ccBubble;
                            ccContent.appendChild(gradeBarCC);
                        }
                        } // end else (non-CW)
                        console.log('WML Canvas: Chat cleared');
                    },
                    { confirmText: 'Clear Chat', cancelText: 'Keep Chat' }
                );
            }
        });
        chatHeader.appendChild(clearChatBtn);
        chatPanel.appendChild(chatHeader);

        chatPanel.appendChild(chatMessages);

        // Floating scroll buttons
        const scrollDownBtn = el('div', { className: 'swml-scroll-down-btn',
            innerHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 3a.5.5 0 0 1 .5.5v11.793l4.147-4.146a.5.5 0 0 1 .707.707l-5 5a.5.5 0 0 1-.631.062l-.076-.062-5-5a.5.5 0 0 1 .707-.707L9.5 15.293V3.5A.5.5 0 0 1 10 3"/></svg>',
            title: 'Scroll to latest message',
            onClick: () => { chatMessages.scrollTop = chatMessages.scrollHeight; }
        });
        scrollDownBtn.style.display = 'none';
        chatPanel.appendChild(scrollDownBtn);

        const scrollUpBtn = el('div', { className: 'swml-scroll-up-btn',
            innerHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 17a.5.5 0 0 1-.5-.5V4.707L5.354 8.854a.5.5 0 1 1-.708-.708l5-5a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1-.708.708L10.5 4.707V16.5a.5.5 0 0 1-.5.5"/></svg>',
            title: 'Scroll to top of chat',
            onClick: () => { chatMessages.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
        scrollUpBtn.style.display = 'none';
        chatPanel.appendChild(scrollUpBtn);

        chatMessages.addEventListener('scroll', () => {
            const gap = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
            scrollDownBtn.style.display = gap > 150 ? 'flex' : 'none';
            scrollUpBtn.style.display = chatMessages.scrollTop > 200 ? 'flex' : 'none';
        }, { passive: true });

        // Chat input
        const chatInputArea = el('div', { className: 'swml-chat-input' });
        const chatInputWrap = el('div', { className: 'swml-chat-input-wrapper' });
        const chatInputInner = el('div', { className: 'swml-chat-input-inner' });

        const chatAttachBtn = el('button', { className: 'swml-upload-btn', innerHTML: SVG_ATTACH, title: 'Upload file' });
        chatInputInner.appendChild(chatAttachBtn);

        const chatTextarea = el('textarea', { id: 'swml-canvas-chat-input', rows: '1', placeholder: 'Type your response...' });
        chatTextarea.style.cssText = 'flex:1;border:none;background:transparent;font-size:13px;outline:none;color:var(--swml-text);font-family:inherit;resize:none;line-height:1.5;max-height:200px;min-height:22px;overflow-y:auto;';
        chatTextarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 200) + 'px'; });
        function autoGrowChatTextarea() {
            requestAnimationFrame(() => {
                chatTextarea.style.height = 'auto';
                chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 200) + 'px';
            });
        }
        chatInputInner.appendChild(chatTextarea);

        // Mic button
        let canvasRecognition = null, canvasListening = false;
        const chatMicBtn = el('button', { className: 'swml-mic-btn', innerHTML: SVG_MIC, title: 'Voice input',
            onClick: () => {
                const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SR) { alert('Voice input is not supported in this browser.'); return; }
                if (canvasListening && canvasRecognition) { canvasRecognition.stop(); return; }
                if (!canvasRecognition) {
                    canvasRecognition = new SR();
                    canvasRecognition.continuous = true;
                    canvasRecognition.interimResults = true;
                    canvasRecognition.lang = 'en-GB';
                    let finalTranscript = '';
                    canvasRecognition.onresult = (e) => {
                        if (canvasChatLoading) return;
                        let interim = '';
                        for (let i = e.resultIndex; i < e.results.length; i++) {
                            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
                            else interim += e.results[i][0].transcript;
                        }
                        chatTextarea.value = finalTranscript + interim;
                        chatTextarea.dispatchEvent(new Event('input'));
                    };
                    canvasRecognition.onstart = () => {
                        canvasListening = true; finalTranscript = chatTextarea.value || '';
                        chatMicBtn.innerHTML = SVG_MIC_STOP;
                        chatMicBtn.classList.add('swml-mic-active');
                    };
                    canvasRecognition.onend = () => {
                        canvasListening = false;
                        chatMicBtn.innerHTML = SVG_MIC;
                        chatMicBtn.classList.remove('swml-mic-active');
                        chatTextarea.focus();
                    };
                    canvasRecognition.onerror = (e) => {
                        console.warn('Canvas voice error:', e.error);
                        canvasListening = false;
                        chatMicBtn.innerHTML = SVG_MIC;
                        chatMicBtn.classList.remove('swml-mic-active');
                    };
                }
                try { canvasRecognition.start(); } catch(e) { console.warn('Canvas voice start error:', e); }
            }
        });
        chatInputInner.appendChild(chatMicBtn);

        // Send button
        const chatSendBtn = el('button', { className: 'swml-send-btn', innerHTML: SVG_SEND, title: 'Send' });
        chatInputInner.appendChild(chatSendBtn);

        chatInputWrap.appendChild(chatInputInner);
        chatInputArea.appendChild(chatInputWrap);
        chatPanel.appendChild(chatInputArea);

        // Selection toolbar
        let canvasChatSelToolbar = null;
        function removeChatSelToolbar() {
            if (canvasChatSelToolbar) { canvasChatSelToolbar.remove(); canvasChatSelToolbar = null; }
        }

        chatMessages.addEventListener('mouseup', () => {
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel || sel.isCollapsed || !sel.toString().trim()) { removeChatSelToolbar(); return; }
                const selectedText = sel.toString().trim();
                if (selectedText.length < 2 || selectedText.length > 2000) return;
                const anchorEl = sel.anchorNode?.parentElement;
                if (!anchorEl || !chatMessages.contains(anchorEl)) return;

                removeChatSelToolbar();
                const quote = selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText;

                const tb = el('div', { className: 'swml-selection-toolbar swml-sel-neumorphic' });
                canvasChatSelToolbar = tb;

                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_REPLY + ' <span>Reply</span>',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        chatTextarea.value = `Regarding "${quote}" \u2014 `;
                        chatTextarea.dispatchEvent(new Event('input'));
                        autoGrowChatTextarea();
                        chatTextarea.focus();
                        removeChatSelToolbar(); sel.removeAllRanges();
                    }
                }));

                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_INSERT + ' <span>Insert into Doc</span>',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        if (canvasEditor) {
                            canvasEditor.chain().focus().insertContent(selectedText + '\n').run();
                        }
                        removeChatSelToolbar(); sel.removeAllRanges();
                    }
                }));

                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_INSERT + ' <span>Insert</span>',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        chatTextarea.value += (chatTextarea.value && !chatTextarea.value.endsWith(' ') ? ' ' : '') + selectedText;
                        chatTextarea.dispatchEvent(new Event('input'));
                        autoGrowChatTextarea();
                        chatTextarea.focus();
                        removeChatSelToolbar(); sel.removeAllRanges();
                    }
                }));

                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_COPY + ' <span>Copy</span>',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        navigator.clipboard.writeText(selectedText).catch(() => document.execCommand('copy'));
                        removeChatSelToolbar(); sel.removeAllRanges();
                    }
                }));

                tb.appendChild(el('button', { className: 'swml-sel-btn swml-sel-notes', innerHTML: SVG_SEL_NOTE + ' <span>Note</span>',
                    onClick: (ev) => {
                        ev.stopPropagation();
                        sendToNotes(selectedText);
                        removeChatSelToolbar(); sel.removeAllRanges();
                    }
                }));

                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const msgsRect = chatMessages.getBoundingClientRect();
                chatMessages.appendChild(tb);
                const tbW = tb.offsetWidth;
                tb.style.top = (rect.top - msgsRect.top + chatMessages.scrollTop - tb.offsetHeight - 8) + 'px';
                tb.style.left = Math.max(4, Math.min(
                    rect.left - msgsRect.left + (rect.width / 2) - (tbW / 2),
                    msgsRect.width - tbW - 4
                )) + 'px';
            }, 10);
        });

        document.addEventListener('mousedown', (e) => {
            if (canvasChatSelToolbar && !canvasChatSelToolbar.contains(e.target)) removeChatSelToolbar();
        });

        // Typing indicators
        function removeCanvasTyping() { removeTypingBubble(chatMessages); }
        function showCanvasTyping() { createTypingBubble(chatMessages); }

        // sendCanvasMessage — AI Engine chat
        async function sendCanvasMessage() {
            const msg = chatTextarea.value.trim();
            if (!msg || canvasChatLoading) return;
            canvasChatLoading = true;

            if (canvasListening && canvasRecognition) {
                try { canvasRecognition.stop(); } catch(e) {}
            }

            const isSilent = canvasSilentSend;
            canvasSilentSend = false;
            if (!isSilent) addChatMessage(msg, 'user');
            canvasChatHistory.push({ role: 'user', content: msg });
            chatTextarea.value = '';
            chatTextarea.style.height = '40px';
            chatSendBtn.style.opacity = '0.4';
            chatSendBtn.style.pointerEvents = 'none';

            showCanvasTyping();

            try {
                let promptText = msg;
                const essay = getResponseText(canvasEditor);
                const userMsgCount = canvasChatHistory.filter(m => m.role === 'user').length;
                const boardName = (state.board || '').toUpperCase().replace('-', ' ');
                const subjectName = (state.subject || '').replace(/_/g, ' ');
                const textName = state.textName || state.text || '';

                if (canvasInMarkScheme) {
                    if (userMsgCount === 1) {
                        promptText = `[CONTEXT: ${boardName} ${subjectName} \u2014 ${textName} \u2014 MARK SCHEME QUIZ]\n[STUDENT'S RESPONSE]\n${msg}`;
                    }
                } else if (state.task === 'planning' || state.task === 'polishing') {
                    const docContent = canvasEditor ? canvasEditor.getText() : '';
                    if (userMsgCount === 1) {
                        promptText = `[CONTEXT: ${boardName} ${subjectName} \u2014 ${textName} \u2014 ${state.task.toUpperCase()}${state.phase === 'redraft' ? ' (REDRAFT)' : ''}]\n[STUDENT'S DOCUMENT \u2014 contains question, essay plan, and response sections]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    } else if (docContent.trim().length > 50) {
                        promptText = `[STUDENT'S DOCUMENT \u2014 current state]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    }
                    console.log('WML Canvas: Planning/polishing doc injected. Length:', docContent.length);
                } else if (isCwSi) {
                    const docContent = canvasEditor ? canvasEditor.getText() : '';
                    const stepLabel = cwStepDef?.label || 'Creative Writing';
                    if (userMsgCount === 1) {
                        promptText = `[CONTEXT: Creative Writing Course \u2014 Step ${cwStepDef?.step || cwStepDef?.trial}: ${stepLabel}]\n[STUDENT'S CREATIVE WRITING DOCUMENT]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    } else if (docContent.trim().length > 50) {
                        promptText = `[CREATIVE WRITING DOCUMENT \u2014 current draft]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    }
                    console.log('WML Canvas: CW doc injected for', state.task, 'Length:', docContent.length);
                } else if (essay.trim().length > 50) {
                    const wc = getResponseWordCount(canvasEditor);
                    if (userMsgCount === 1) {
                        promptText = `[CONTEXT: ${boardName} ${subjectName} \u2014 ${textName}]\n[STUDENT'S ESSAY \u2014 ${wc} words]\n\n${essay}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    } else {
                        promptText = `[REMINDER \u2014 STUDENT'S ACTUAL ESSAY (${wc} words) \u2014 assess ONLY this text, quote from it directly]\n\n${essay}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    }
                    const sectionLabels = (essay.match(/=== .+? ===/g) || []).join(', ');
                    console.log('WML Canvas: Essay injected (' + wc + ' words). Sections: [' + (sectionLabels || 'no labels') + ']. First 200 chars:', essay.substring(0, 200));
                } else if (userMsgCount === 1) {
                    promptText = `[CONTEXT: ${boardName} ${subjectName} \u2014 ${textName}]\n[NOTE: The student's Response section is empty or very short. Ask them to paste or write their essay in the Response section of the document before continuing with the assessment.]\n\n[STUDENT'S RESPONSE]\n${msg}`;
                    console.warn('WML Canvas: Essay too short or empty. getResponseText returned:', essay.substring(0, 100));
                }

                const historyToSend = canvasChatHistory.slice(0, -1).slice(-24);

                const response = await fetch(API.chat, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        prompt: promptText,
                        botId: 'wml-claude',
                        chatId: canvasChatId,
                        history: historyToSend,
                        planState: state.plan || {},
                        step: state.step || 1,
                        board: state.board,
                        subject: state.subject,
                        text: state.text || '',
                        task: state.task || 'assessment',
                        question: state.question || '',
                        marks: state.marks || 30,
                        aos: state.aos || [],
                        draftType: state.draftType || 'diagnostic',
                        topicNumber: state.topicNumber || 1,
                        phase: state.phase || 'initial',
                    })
                });
                const res = await response.json();
                removeCanvasTyping();

                if (res.success && res.reply) {
                    const cleanReply = stripAIInternals(res.reply);
                    const formatted = formatAI(cleanReply);
                    addChatMessage(formatted, 'ai', cleanReply);
                    canvasChatHistory.push({ role: 'assistant', content: res.reply });
                    if (res.chatId) canvasChatId = res.chatId;
                    if (res.method) console.log('WML Canvas:', res.method, 'model:', res.model);
                    saveCanvasChat(canvasChatHistory, canvasChatId);
                    if (/(?:question in (?:your|the) document|question at the top|look at the.*question|essay question section)/i.test(cleanReply)) {
                        setTimeout(() => scrollToQuestionSection(), 400);
                    }
                    try {
                        await refreshPlan();
                        await extractAndSavePlan(msg, res.reply);
                        console.log('WML Canvas: Plan state after extraction:', { total_score: state.plan.total_score, grade: state.plan.grade, task: state.task });

                        if (state.task === 'assessment') {
                            const detected = detectAssessmentStep(res.reply);
                            console.log('WML Canvas: detectAssessmentStep \u2192', { step: detected.step, isComplete: detected.isComplete, totalScore: detected.totalScore, grade: detected.grade, currentStep: state.step });
                            if (detected.step > state.step) updateProgress(detected.step);
                            if (detected.isComplete) {
                                console.log('WML Canvas: Assessment Complete detected in AI response');
                                if (!state.plan.total_score && detected.totalScore) { state.plan.total_score = detected.totalScore; console.log('WML: Force-extracted total_score:', detected.totalScore); }
                                if (!state.plan.grade && detected.grade) { state.plan.grade = detected.grade; console.log('WML: Force-extracted grade:', detected.grade); }
                            }
                            if (!state._phaseMarkedComplete && assessCompleteBtnRef.value && assessCompleteBtnRef.value.style.display === 'none') {
                                const isAssessmentDone = detected.isComplete || state.step >= 8 || (state.plan.total_score && state.plan.grade);
                                if (isAssessmentDone) {
                                    assessCompleteBtnRef.value.style.display = '';
                                    assessCompleteBtnRef.value.classList.add('swml-assess-ready');
                                    assessCompleteBtnRef.value.style.opacity = '0';
                                    assessCompleteBtnRef.value.style.transform = 'translateY(10px)';
                                    requestAnimationFrame(() => {
                                        assessCompleteBtnRef.value.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                        assessCompleteBtnRef.value.style.opacity = '1';
                                        assessCompleteBtnRef.value.style.transform = 'translateY(0)';
                                    });
                                    console.log('WML: Mark Complete button \u2192 VISIBLE (assessment complete detected)');
                                }
                            }
                            if (!state._phaseMarkedComplete && assessCompleteBtnRef.value && assessCompleteBtnRef.value.style.display === 'none') {
                                if (/Closing\s+Summary/i.test(res.reply) || /Session\s+Complete/i.test(res.reply)) {
                                    assessCompleteBtnRef.value.style.display = '';
                                    assessCompleteBtnRef.value.classList.add('swml-assess-ready');
                                    assessCompleteBtnRef.value.style.opacity = '0';
                                    assessCompleteBtnRef.value.style.transform = 'translateY(10px)';
                                    requestAnimationFrame(() => {
                                        assessCompleteBtnRef.value.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                        assessCompleteBtnRef.value.style.opacity = '1';
                                        assessCompleteBtnRef.value.style.transform = 'translateY(0)';
                                    });
                                    console.log('WML: Mark Complete button \u2192 VISIBLE (safety net: Closing Summary/Session Complete keyword)');
                                }
                            }
                        }
                    } catch (exErr) {
                        console.warn('WML Canvas: extraction/completion check failed:', exErr);
                    }
                } else if (res.message) {
                    addChatMessage(`<p>Sorry, there was an issue: <strong>${res.message}</strong></p><p>Please let your teacher know about this error.</p>`, 'ai');
                } else {
                    addChatMessage('<p>I had a momentary difficulty \u2014 could you try again?</p>', 'ai');
                }
            } catch (e) {
                removeCanvasTyping();
                console.error('WML Canvas chat error:', e);
                addChatMessage(`<p>Connection error: <strong>${e.message}</strong></p><p>Check the browser console for details.</p>`, 'ai');
            }

            canvasChatLoading = false;
            chatSendBtn.style.opacity = '';
            chatSendBtn.style.pointerEvents = '';
        }

        // Send handlers
        chatSendBtn.addEventListener('click', sendCanvasMessage);
        chatTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const multiSubmit = document.querySelector('.swml-quick-submit:not([disabled])');
                if (multiSubmit && !chatTextarea.value?.trim()) { multiSubmit.click(); return; }
                if (canvasListening && canvasRecognition) {
                    canvasRecognition.stop();
                    setTimeout(() => {
                        if (chatTextarea.value.trim()) sendCanvasMessage();
                    }, 350);
                    return;
                }
                sendCanvasMessage();
            }
        });

        // Resize handle for chat panel
        const chatResizeHandle = el('div', { className: 'swml-canvas-chat-resize' });
        chatResizeHandle.style.opacity = '0';
        let chatResizing = false;
        chatResizeHandle.addEventListener('mousedown', (e) => {
            chatResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!chatResizing) return;
            const canvasRect = canvas.getBoundingClientRect();
            const newWidth = canvasRect.right - e.clientX;
            if (newWidth >= 280 && newWidth <= 600) {
                chatPanel.style.width = newWidth + 'px';
            }
        });
        document.addEventListener('mouseup', () => {
            if (chatResizing) {
                chatResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });

        return {
            protoPanel,
            chatPanel,
            chatResizeHandle,
            chatMessages,
            chatTextarea,
            chatSendBtn,
            addChatMessage,
            sendCanvasMessage,
            canvasChatHistory,
            get canvasChatId() { return canvasChatId; },
            set canvasChatId(v) { canvasChatId = v; },
            autoGrowChatTextarea,
        };
    }
    // ══════════════════════════════════════════════════════════════════

    let _canvasGuard = false; // Prevents double-render of canvas workspace (v7.12.61)
    function renderCanvasWorkspace() {
        if (_canvasGuard) return;
        _canvasGuard = true;
        setTimeout(() => { _canvasGuard = false; }, 500);

        const { Editor, StarterKit, Placeholder, TextAlign, Highlight, CharacterCount, TextStyle, Color, Node, Mark, Extension, PaginationPlus, PAGE_SIZES } = window.TipTap || {};
        if (!Editor) {
            _canvasGuard = false;
            alert('TipTap editor failed to load. Please refresh the page.');
            return;
        }

        syncUrl(); // Update URL bar with canvas state (diagnostic/assessment/polishing)

        // v7.13.34: CW project auto-load — ensure cwProjectId is set for embedded CW exercises
        if (state.task && state.task.startsWith('cw_') && !state.cwProjectId) {
            (async () => {
                try {
                    const res = await WML.cwProject.list();
                    const projects = res?.projects || [];
                    if (projects.length > 0) {
                        state.cwProjectId = projects[0].id;
                    } else {
                        const createRes = await WML.cwProject.create('My Story', 'standalone');
                        if (createRes?.success) state.cwProjectId = createRes.project.id;
                    }
                    console.log('WML CW: Auto-loaded project', state.cwProjectId);
                } catch (e) { console.warn('WML CW: Failed to auto-load project', e); }
            })();
        }

        // Kill WebGL shader when entering canvas — prevents flash-through on transitions (v7.12.53)
        destroyShader();
        const shaderBgEl = document.getElementById('swml-shader-bg');
        if (shaderBgEl) shaderBgEl.style.display = 'none';

        // v7.12.45: Early cover preload — start loading now so image is cached before tryInjectCover runs
        const _t = state.text;
        let _coverUrl = null;
        if (state.topicNumber) _coverUrl = config.covers[`${_t}:topic_${state.topicNumber}`];
        if (!_coverUrl && state.task) _coverUrl = config.covers[`${_t}:${state.task}`];
        if (!_coverUrl) _coverUrl = config.covers[_t];
        if (_coverUrl) { const _p = new Image(); _p.src = _coverUrl; }

        // Capture any existing canvas for deferred removal (v7.12.32 — prevents shader flash)
        const existing = document.getElementById('swml-canvas-overlay');

        // Create as fixed overlay on body (tasks stay underneath)
        const overlay = el('div', { id: 'swml-canvas-overlay' });
        const canvas = el('div', { className: 'swml-canvas' });

        // Editor pane
        const editorPane = el('div', { className: 'swml-canvas-editor' });

        // ── Carousel Toolbar (v7.10.148) ──
        // Infinite-loop carousel with momentum, Winona hover, neumorphic buttons

        const SVG_COMMENT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        const SVG_SAVE_SMALL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
        const SVG_EXPORT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
        const SVG_HIGHLIGHT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M12.5 5.5l4 4"/><path d="M4.5 13.5l4 4"/><path d="M21 15v4h-8l4 -4z"/></svg>';
        const SVG_EXTRACT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11H14.5H17"/><path d="M12 7H14.5H17"/><path d="M8 15V3.6C8 3.26863 8.26863 3 8.6 3H20.4C20.7314 3 21 3.26863 21 3.6V17C21 19.2091 19.2091 21 17 21V21"/><path d="M5 15H8H12.4C12.7314 15 13.0031 15.2668 13.0298 15.5971C13.1526 17.1147 13.7812 21 17 21H8H6C4.34315 21 3 19.6569 3 18V17C3 15.8954 3.89543 15 5 15Z"/></svg>';

        // Tool definitions — id, html (icon), label (Winona hover text)
        const toolDefs = [
            { id: 'bold', html: '<b>B</b>', label: 'Bold' },
            { id: 'italic', html: '<i>I</i>', label: 'Italic' },
            { id: 'underline', html: '<u>U</u>', label: 'Underline' },
            { id: 'strike', html: '<s>S</s>', label: 'Strike' },
            { id: 'highlight', html: SVG_HIGHLIGHT, label: 'Highlight' },
            { id: 'sep1', sep: true },
            { id: 'h2', html: 'H2', label: 'Heading 2' },
            { id: 'h3', html: 'H3', label: 'Heading 3' },
            { id: 'paragraph', html: '¶', label: 'Paragraph' },
            { id: 'textSmaller', html: '<span style="font-size:11px">A</span>↓', label: 'Smaller text' },
            { id: 'textLarger', html: '<span style="font-size:15px">A</span>↑', label: 'Larger text' },
            { id: 'sep2', sep: true },
            { id: 'blockquote', html: '❝', label: 'Quote' },
            { id: 'hr', html: '—', label: 'Rule' },
            { id: 'sep3', sep: true },
            { id: 'undo', html: '↩', label: 'Undo' },
            { id: 'redo', html: '↪', label: 'Redo' },
            { id: 'sep4', sep: true },
            { id: 'comment', html: SVG_COMMENT, label: 'Comment' },
            { id: 'save', html: SVG_SAVE_SMALL, label: 'Save' },
            { id: 'export', html: SVG_EXPORT, label: 'Export' },
            { id: 'sep5', sep: true },
            { id: 'dictation', html: SVG_MIC_ICON, label: 'Dictate' },
        ];

        // Text size scale — applied to editor paragraph text via CSS variable
        const TEXT_SIZES = [12, 13, 14, 15, 16, 18, 20, 22];
        let textSizeIndex = 3; // default 15px (matches CSS default)
        function applyTextSize() {
            const pm = document.getElementById('swml-tiptap-editor');
            if (pm) pm.style.setProperty('--swml-editor-font-size', TEXT_SIZES[textSizeIndex] + 'px');
        }

        // Tool click actions (resolved at click time via closures on canvasEditor)
        const toolActions = {
            bold: () => canvasEditor?.chain().focus().toggleBold().run(),
            italic: () => canvasEditor?.chain().focus().toggleItalic().run(),
            underline: () => canvasEditor?.chain().focus().toggleUnderline().run(),
            strike: () => canvasEditor?.chain().focus().toggleStrike().run(),
            highlight: (ev, li) => { ev.stopPropagation(); toggleHlPicker(li); },
            h2: () => canvasEditor?.chain().focus().toggleHeading({ level: 2 }).run(),
            h3: () => canvasEditor?.chain().focus().toggleHeading({ level: 3 }).run(),
            paragraph: () => canvasEditor?.chain().focus().setParagraph().run(),
            textSmaller: () => { textSizeIndex = Math.max(0, textSizeIndex - 1); applyTextSize(); },
            textLarger: () => { textSizeIndex = Math.min(TEXT_SIZES.length - 1, textSizeIndex + 1); applyTextSize(); },
            blockquote: () => canvasEditor?.chain().focus().toggleBlockquote().run(),
            hr: () => canvasEditor?.chain().focus().setHorizontalRule().run(),
            undo: () => canvasEditor?.chain().focus().undo().run(),
            redo: () => canvasEditor?.chain().focus().redo().run(),
            comment: () => addComment(),
            save: () => {
                saveCanvasContent();
                saveStatus.textContent = '✓ Saved';
                saveStatus.classList.add('saving');
                setTimeout(() => saveStatus.classList.remove('saving'), 1500);
            },
            export: () => exportToDocx(),
            dictation: () => toggleDictation(),
        };

        // Build one set of toolbar items as LI elements
        function buildToolSet(setIndex) {
            const frag = document.createDocumentFragment();
            toolDefs.forEach(def => {
                if (def.sep) {
                    const li = el('li', { className: 'swml-tb-sep' });
                    li.dataset.set = setIndex;
                    frag.appendChild(li);
                    return;
                }
                const li = el('li', { className: 'swml-tb-item swml-tb-winona', title: def.label });
                li.dataset.tool = def.id;
                li.dataset.set = setIndex;
                // Two identical spans for icon→icon roll effect
                const span1 = el('span', { className: 'swml-tb-icon', innerHTML: def.html });
                const span2 = el('span', { className: 'swml-tb-icon swml-tb-clone', innerHTML: def.html });
                li.appendChild(span1);
                li.appendChild(span2);
                li.addEventListener('click', (ev) => {
                    if (tbDragMoved) return; // ignore clicks from drags
                    ev.stopPropagation();
                    const action = toolActions[def.id];
                    if (action) action(ev, li);
                });
                frag.appendChild(li);
            });
            return frag;
        }

        // Toolbar container
        const toolbar = el('div', { className: 'swml-canvas-toolbar' });

        // Gradient masks
        toolbar.appendChild(el('div', { className: 'swml-tb-gradient swml-tb-gradient-left' }));
        toolbar.appendChild(el('div', { className: 'swml-tb-gradient swml-tb-gradient-right' }));

        // Scroll viewport
        const tbScroll = el('div', { className: 'swml-tb-scroll' });
        const tbItems = el('ul', { className: 'swml-tb-items' });

        // Build 3 cloned sets for seamless loop
        for (let s = 0; s < 3; s++) {
            tbItems.appendChild(buildToolSet(s));
        }
        tbScroll.appendChild(tbItems);
        toolbar.appendChild(tbScroll);

        // Arrow buttons
        const tbArrows = el('div', { className: 'swml-tb-arrows' });
        const tbArrowL = el('button', { className: 'swml-tb-arrow', innerHTML: '❮', 'aria-label': 'Scroll toolbar left' });
        const tbArrowR = el('button', { className: 'swml-tb-arrow', innerHTML: '❯', 'aria-label': 'Scroll toolbar right' });
        tbArrows.appendChild(tbArrowL);
        tbArrows.appendChild(tbArrowR);
        toolbar.appendChild(tbArrows);

        // ── Highlight picker (shared, outside scroll track) ──
        const hlPicker = el('div', { className: 'swml-hl-picker', style: { display: 'none' } });
        const hlColors = [
            { color: '#fef08a', label: 'Yellow' },
            { color: '#bbf7d0', label: 'Green' },
            { color: '#bfdbfe', label: 'Blue' },
            { color: '#fecaca', label: 'Pink' },
            { color: '#e9d5ff', label: 'Purple' },
            { color: '#fed7aa', label: 'Orange' },
        ];
        hlColors.forEach(c => {
            hlPicker.appendChild(el('button', {
                title: c.label,
                style: { background: c.color, width: '22px', height: '22px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
                onClick: (e) => {
                    e.stopPropagation();
                    canvasEditor?.chain().focus().toggleHighlight({ color: c.color }).run();
                    hlPicker.style.display = 'none';
                }
            }));
        });
        hlPicker.appendChild(el('button', {
            title: 'Remove highlight',
            style: { background: 'transparent', width: '22px', height: '22px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' },
            textContent: '✕',
            onClick: (e) => { e.stopPropagation(); canvasEditor?.chain().focus().unsetHighlight().run(); hlPicker.style.display = 'none'; }
        }));
        // Picker will be appended to overlay (position: fixed) later after overlay is created
        let hlPickerAnchor = null;
        function toggleHlPicker(clickedBtn) {
            if (hlPicker.style.display === 'flex') {
                hlPicker.style.display = 'none';
                hlPickerAnchor = null;
                return;
            }
            hlPickerAnchor = clickedBtn;
            if (hlPickerAnchor) {
                const btnRect = hlPickerAnchor.getBoundingClientRect();
                hlPicker.style.position = 'fixed';
                hlPicker.style.top = (btnRect.bottom + 6) + 'px';
                hlPicker.style.left = (btnRect.left + btnRect.width / 2) + 'px';
                hlPicker.style.transform = 'translateX(-50%)';
                hlPicker.style.zIndex = '99999';
            }
            hlPicker.style.display = 'flex';
            // Sync theme
            hlPicker.classList.toggle('swml-hl-picker-light', canvas.classList.contains('swml-canvas-light'));
        }
        document.addEventListener('click', (e) => {
            if (!hlPicker.contains(e.target) && !e.target.closest('[data-tool="highlight"]')) hlPicker.style.display = 'none';
        });
        // Append picker to body (fixed positioning, above everything)
        document.body.appendChild(hlPicker);

        // ── Dictation (shared state, synced across cloned buttons) ──
        let dictRecognition = null;
        let dictListening = false;
        function toggleDictation() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) { alert('Voice dictation is not supported in this browser.'); return; }

            if (dictListening && dictRecognition) {
                dictRecognition.stop();
                return;
            }

            let dictBubble = document.getElementById('swml-dict-bubble');
            if (!dictBubble) {
                dictBubble = el('div', { id: 'swml-dict-bubble', className: 'swml-dict-bubble' });
                dictBubble.innerHTML = '<span class="swml-dict-dot"></span><span class="swml-dict-dot"></span><span class="swml-dict-dot"></span>';
                canvas.appendChild(dictBubble);
            }

            dictRecognition = new SR();
            dictRecognition.continuous = true;
            dictRecognition.interimResults = true;
            dictRecognition.lang = 'en-GB';
            let dictLastFinalIdx = 0;

            const syncDictBtns = (cls, add) => {
                toolbar.querySelectorAll('[data-tool="dictation"]').forEach(b => {
                    if (add) b.classList.add(cls); else b.classList.remove(cls);
                });
            };

            dictRecognition.onstart = () => {
                dictListening = true;
                syncDictBtns('is-active', true);
                syncDictBtns('swml-dictating', true);
                dictLastFinalIdx = 0;
                dictBubble.style.display = 'flex';
                dictBubble.innerHTML = '<span class="swml-dict-dot"></span><span class="swml-dict-dot"></span><span class="swml-dict-dot"></span> <span style="color:rgba(255,255,255,0.4);font-size:11px;">Listening...</span>';
            };
            dictRecognition.onend = () => {
                dictListening = false;
                syncDictBtns('is-active', false);
                syncDictBtns('swml-dictating', false);
                dictBubble.style.display = 'none';
            };
            dictRecognition.onresult = (ev) => {
                let interim = '';
                for (let i = dictLastFinalIdx; i < ev.results.length; i++) {
                    if (ev.results[i].isFinal) {
                        const text = ev.results[i][0].transcript;
                        if (text && canvasEditor) {
                            canvasEditor.chain().focus().insertContent(text + ' ').run();
                        }
                        dictLastFinalIdx = i + 1;
                    } else {
                        interim += ev.results[i][0].transcript;
                    }
                }
                if (interim) {
                    dictBubble.innerHTML = '<span class="swml-dict-dot"></span><span class="swml-dict-dot"></span><span class="swml-dict-dot"></span> <span class="swml-dict-text"></span>';
                    dictBubble.querySelector('.swml-dict-text').textContent = interim;
                } else {
                    dictBubble.innerHTML = '<span class="swml-dict-dot"></span><span class="swml-dict-dot"></span><span class="swml-dict-dot"></span> <span style="color:rgba(255,255,255,0.4);font-size:11px;">Listening...</span>';
                }
            };
            dictRecognition.onerror = () => {
                dictListening = false;
                syncDictBtns('is-active', false);
                syncDictBtns('swml-dictating', false);
                if (document.getElementById('swml-dict-bubble')) document.getElementById('swml-dict-bubble').style.display = 'none';
            };
            dictRecognition.start();
        }

        // ── Carousel physics (vanilla — no GSAP dependency) ──
        let tbSetWidth = 0;
        let tbLogicalX = 0;
        let tbVelocityX = 0;
        let tbMomentumId = null;
        const TB_WHEEL_SENS = 0.8;
        const TB_FRICTION = 0.92;
        const TB_MIN_VEL = 0.05;

        function initCarousel() {
            const allItems = tbItems.children;
            const setCount = toolDefs.length;
            tbSetWidth = 0;
            for (let i = 0; i < setCount && i < allItems.length; i++) {
                const li = allItems[i];
                const s = getComputedStyle(li);
                tbSetWidth += li.offsetWidth + parseFloat(s.marginLeft) + parseFloat(s.marginRight);
            }
            if (tbSetWidth === 0) return;
            tbItems.style.width = (tbSetWidth * 3) + 'px';
            tbLogicalX = -tbSetWidth;
            tbItems.style.transform = `translateX(${tbLogicalX}px)`;
        }

        function normalizeTbX() {
            if (tbSetWidth <= 0) return;
            while (tbLogicalX > 0) tbLogicalX -= tbSetWidth;
            while (tbLogicalX < -2 * tbSetWidth) tbLogicalX += tbSetWidth;
        }

        function tbMomentum() {
            if (tbMomentumId) cancelAnimationFrame(tbMomentumId);
            tbLogicalX += tbVelocityX;
            tbVelocityX *= TB_FRICTION;
            normalizeTbX();
            tbItems.style.transform = `translateX(${tbLogicalX}px)`;
            if (Math.abs(tbVelocityX) > TB_MIN_VEL && tbSetWidth > 0) {
                tbMomentumId = requestAnimationFrame(tbMomentum);
            } else {
                tbVelocityX = 0;
                tbMomentumId = null;
            }
        }

        tbScroll.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            if (!tbMomentumId) tbVelocityX = 0;
            let delta = ev.deltaX !== 0 ? ev.deltaX : ev.deltaY;
            if (Math.abs(delta) > 50) delta = Math.sign(delta) * 50;
            tbVelocityX -= delta * TB_WHEEL_SENS;
            if (!tbMomentumId && tbSetWidth > 0) tbMomentum();
        }, { passive: false });

        function scrollCarousel(direction) {
            if (tbSetWidth === 0) return;
            if (tbMomentumId) cancelAnimationFrame(tbMomentumId);
            tbVelocityX = 0;
            tbMomentumId = null;
            const scrollAmt = tbSetWidth / 4;
            const targetX = tbLogicalX + (direction * scrollAmt);
            const startX = tbLogicalX;
            const startTime = performance.now();
            const duration = 500;
            function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
            function animateArrow(now) {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                tbLogicalX = startX + (targetX - startX) * easeOut(t);
                normalizeTbX();
                tbItems.style.transform = `translateX(${tbLogicalX}px)`;
                if (t < 1) requestAnimationFrame(animateArrow);
            }
            requestAnimationFrame(animateArrow);
        }

        tbArrowL.addEventListener('click', () => scrollCarousel(1));
        tbArrowR.addEventListener('click', () => scrollCarousel(-1));

        // Pointer drag support (document-level move/up so LI clicks aren't stolen)
        let tbDragging = false;
        let tbDragStartX = 0;
        let tbDragStartLogical = 0;
        let tbDragLastX = 0;
        let tbDragLastTime = 0;
        let tbDragMoved = false;

        tbScroll.addEventListener('pointerdown', (ev) => {
            if (ev.button !== 0) return;
            tbDragging = true;
            tbDragMoved = false;
            tbDragStartX = ev.clientX;
            tbDragStartLogical = tbLogicalX;
            tbDragLastX = ev.clientX;
            tbDragLastTime = performance.now();
            if (tbMomentumId) { cancelAnimationFrame(tbMomentumId); tbMomentumId = null; }
            tbVelocityX = 0;
            // Do NOT setPointerCapture — it steals clicks from child LIs
        });

        document.addEventListener('pointermove', (ev) => {
            if (!tbDragging) return;
            const dx = ev.clientX - tbDragStartX;
            if (Math.abs(dx) > 3) tbDragMoved = true;
            tbLogicalX = tbDragStartLogical + dx;
            normalizeTbX();
            tbItems.style.transform = `translateX(${tbLogicalX}px)`;
            const now = performance.now();
            const dt = now - tbDragLastTime;
            if (dt > 0) {
                tbVelocityX = (ev.clientX - tbDragLastX) / dt * 16;
            }
            tbDragLastX = ev.clientX;
            tbDragLastTime = now;
        });

        function tbDragEnd() {
            if (!tbDragging) return;
            tbDragging = false;
            if (Math.abs(tbVelocityX) > TB_MIN_VEL && tbSetWidth > 0) {
                tbMomentum();
            }
        }
        document.addEventListener('pointerup', tbDragEnd);
        document.addEventListener('pointercancel', tbDragEnd);

        // Init carousel after DOM append (deferred to ensure layout)
        requestAnimationFrame(() => requestAnimationFrame(() => initCarousel()));

        // Resize handler
        let tbResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(tbResizeTimer);
            tbResizeTimer = setTimeout(() => {
                const oldW = tbSetWidth;
                const prop = oldW > 0 ? (tbLogicalX % oldW) / oldW : 0;
                initCarousel();
                if (tbSetWidth > 0) {
                    tbLogicalX = -tbSetWidth + (prop * tbSetWidth);
                    normalizeTbX();
                    tbItems.style.transform = `translateX(${tbLogicalX}px)`;
                }
                tbVelocityX = 0;
                if (tbMomentumId) cancelAnimationFrame(tbMomentumId);
                tbMomentumId = null;
            }, 250);
        });

        // ── Styled Tooltip (delayed, neumorphic) ──
        const tbTooltip = el('div', { className: 'swml-tb-tooltip' });
        toolbar.appendChild(tbTooltip);
        let tbTooltipTimer = null;

        toolbar.addEventListener('pointerenter', (ev) => {
            const item = ev.target.closest('.swml-tb-item');
            if (!item) return;
            clearTimeout(tbTooltipTimer);
            tbTooltipTimer = setTimeout(() => {
                const label = item.getAttribute('title');
                if (!label) return;
                tbTooltip.textContent = label;
                tbTooltip.classList.add('visible');
                // Position above the hovered item
                const tbRect = toolbar.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                tbTooltip.style.left = (itemRect.left - tbRect.left + itemRect.width / 2) + 'px';
                tbTooltip.style.bottom = '';
                // Suppress native title while showing styled tooltip
                item.dataset.titleBackup = label;
                item.removeAttribute('title');
            }, 600);
        }, true);

        toolbar.addEventListener('pointerleave', (ev) => {
            const item = ev.target.closest('.swml-tb-item');
            if (!item) return;
            clearTimeout(tbTooltipTimer);
            tbTooltip.classList.remove('visible');
            // Restore native title
            if (item.dataset.titleBackup) {
                item.setAttribute('title', item.dataset.titleBackup);
                delete item.dataset.titleBackup;
            }
        }, true);

        // Hide tooltip during scroll/drag (picker closes via document click handler)
        tbScroll.addEventListener('pointerdown', () => {
            clearTimeout(tbTooltipTimer);
            tbTooltip.classList.remove('visible');
        });
        tbScroll.addEventListener('wheel', () => {
            clearTimeout(tbTooltipTimer);
            tbTooltip.classList.remove('visible');
            hlPicker.style.display = 'none';
        });

        // Single header row: context badges + toolbar + theme toggle
        const textLabel = state.textName || state.text || '';
        const boardLabel = (state.board || '').toUpperCase().replace('-', ' ');
        const subjectLabel = (state.subject || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const headerRow = el('div', { className: 'swml-canvas-header' });

        // Context badges (left)
        // v7.13.42: CW exercises — check BOTH state.task and state.mode for robust detection
        const ctxBadges = el('div', { className: 'swml-canvas-ctx' });
        const _isCwBadge = (state.task && state.task.startsWith('cw_')) || state.mode === 'creative' || state.subject === 'creative_writing';
        if (_isCwBadge) {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: 'Creative Writing Masterclass' }));
        } else {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: boardLabel }));
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: subjectLabel }));
            // v7.14.14: Skip text badge when it duplicates subject (skipTextSelect subjects like unseen_poetry, language1)
            if (textLabel && textLabel.toLowerCase().replace(/[\s_-]/g, '') !== subjectLabel.toLowerCase().replace(/[\s_-]/g, '')) {
                ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: textLabel }));
            }
        }

        // Topic / exercise badge
        if (state.topicNumber) {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: `Topic ${state.topicNumber}` }));
        } else if (state.task && state.task !== 'planning') {
            // v7.13.11: read label from exercise manifest instead of hardcoded map
            const headerConfig = WML.getExerciseConfig(state.task);
            if (headerConfig.label) ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: headerConfig.label }));
        }
        // Phase badge (v7.12.98) — skip for CW exercises
        const CANVAS_PHASE_LABELS = { initial: 'Phase 1', redraft: 'Phase 2', preliminary: 'Preliminary', free_practice: 'Free Practice', exam_practice: 'Exam Practice' };
        const phaseLabel = CANVAS_PHASE_LABELS[state.phase] || '';
        if (phaseLabel && !_isCwBadge) ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: phaseLabel }));
        const SVG_DIAGNOSTIC = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10" style="display:inline-block;vertical-align:-2px;margin-right:3px"><path d="M8.18,16.77V13H4.36v3.82L2.09,19a2,2,0,0,0-.59,1.44h0a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2h0a2,2,0,0,0-.6-1.44Z"/><line x1="2.45" y1="12.95" x2="10.09" y2="12.95"/><path d="M20.59,15.39V11.05H16.77v4.34a3.82,3.82,0,1,0,3.82,0Z"/><line x1="22.5" y1="11.05" x2="14.86" y2="11.05"/><path d="M18.68,11.05V3.89A2.39,2.39,0,0,0,16.3,1.5h0a2.39,2.39,0,0,0-2.39,2.39V6.27A1.91,1.91,0,0,1,12,8.18h0a1.91,1.91,0,0,1-1.91-1.91V5.32A1.9,1.9,0,0,0,8.18,3.41h0A1.91,1.91,0,0,0,6.27,5.32v.95"/><line x1="5.32" y1="9.14" x2="7.23" y2="9.14"/><line x1="14.86" y1="17.73" x2="19.64" y2="17.73"/><line x1="2.45" y1="18.68" x2="6.27" y2="18.68"/></svg>';
        // v7.13.42: Skip diagnostic badge for CW exercises
        // v7.14.34: Added planning + polishing (Phase 2 canvas exercises)
        const _epTasks = ['exam_question', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice', 'planning', 'polishing'];
        const _epConfig = WML.getExerciseConfig(state.task);
        // v7.14.39: Context-aware badge labels — mastery programme uses redraft-specific names
        const diagBadgeLabel = state.task === 'feedback_discussion' ? 'Discuss Feedback'
            : state.task === 'planning' && state.phase === 'redraft' ? 'Plan Redraft'
            : state.task === 'polishing' && state.phase === 'redraft' ? 'Polish Redraft'
            : _epTasks.includes(state.task) ? (_epConfig.chatHeaderLabel || ucfirst(state.task))
            : 'Diagnostic';
        const diagBadge = el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-diag', innerHTML: SVG_DIAGNOSTIC + diagBadgeLabel });
        if (!_isCwBadge) ctxBadges.appendChild(diagBadge);

        // Overflow ... button — shows hidden badges on small screens
        const ctxOverflowBtn = el('button', { className: 'swml-canvas-ctx-overflow', textContent: '···', title: 'Show all' });
        const ctxOverflowDrop = el('div', { className: 'swml-canvas-ctx-dropdown' });
        ctxOverflowBtn.style.display = 'none';
        ctxOverflowDrop.style.display = 'none';
        ctxOverflowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const showing = ctxOverflowDrop.style.display !== 'none';
            ctxOverflowDrop.style.display = showing ? 'none' : 'flex';
        });
        document.addEventListener('click', () => { ctxOverflowDrop.style.display = 'none'; });
        ctxBadges.appendChild(ctxOverflowBtn);
        ctxBadges.appendChild(ctxOverflowDrop);

        // Observe overflow and hide/show badges dynamically
        const ctxAllBadges = Array.from(ctxBadges.querySelectorAll('.swml-canvas-ctx-badge'));
        // v7.14.23: helper — check if badges collide with centered toolbar
        function _badgesOverlapToolbar() {
            const tb = ctxBadges.parentElement?.querySelector('.swml-canvas-toolbar');
            if (!tb) return false;
            const tbLeft = tb.getBoundingClientRect().left;
            const visible = ctxAllBadges.filter(b => b.style.display !== 'none');
            const last = visible[visible.length - 1];
            if (!last) return false;
            return last.getBoundingClientRect().right + 8 > tbLeft;
        }
        function checkCtxOverflow() {
            // Reset all visible
            ctxAllBadges.forEach(b => b.style.display = '');
            ctxOverflowBtn.style.display = 'none';
            ctxOverflowDrop.innerHTML = '';
            ctxOverflowDrop.style.display = 'none';
            void ctxBadges.offsetWidth; // force reflow
            // v7.14.23: dual check — scrollWidth overflow OR toolbar collision
            const scrollOverflow = ctxBadges.scrollWidth > ctxBadges.clientWidth + 2;
            if (!scrollOverflow && !_badgesOverlapToolbar()) return;
            // v7.14.24: In embedded mode, cap at 1 visible badge to prevent toolbar overlap
            const maxVisible = WML.isEmbedded ? 1 : 1;
            for (let i = ctxAllBadges.length - 1; i >= 1; i--) {
                ctxAllBadges[i].style.display = 'none';
                ctxOverflowDrop.insertBefore(
                    el('span', { className: 'swml-canvas-ctx-badge', textContent: ctxAllBadges[i].textContent }),
                    ctxOverflowDrop.firstChild
                );
                void ctxBadges.offsetWidth; // reflow
                // Stop when remaining visible badges fit AND don't overlap toolbar
                const visCount = ctxAllBadges.filter(b => b.style.display !== 'none').length;
                if (visCount <= maxVisible) break;
                if (ctxBadges.scrollWidth <= ctxBadges.clientWidth + 2 && !_badgesOverlapToolbar()) break;
            }
            if (ctxOverflowDrop.children.length > 0) ctxOverflowBtn.style.display = '';
        }
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(() => requestAnimationFrame(checkCtxOverflow)).observe(ctxBadges);
        }
        setTimeout(checkCtxOverflow, 200);

        // v7.14.50: Hide context badges for training-env exercises — sidebar already shows them
        // Note: useTrainingEnv is declared later, so check inline from manifest
        if ((WML.getExerciseConfig(state.task)?.environment || 'free') === 'training') ctxBadges.style.display = 'none';
        headerRow.appendChild(ctxBadges);

        // Toolbar buttons (centre)
        headerRow.appendChild(toolbar);

        // BETA label + theme toggle (right)
        const headerRight = el('div', { className: 'swml-canvas-header-right' });

        headerRight.appendChild(el('span', { className: 'swml-canvas-ctx-mode', textContent: 'BETA' }));

        // Theme toggle — hidden in embedded mode unless fullscreen (v7.14.24)
        const canvasThemeToggle = createThemeToggleBtn('swml-canvas-theme-toggle', () => {
            toggleTheme();
            const t = getTheme();
            canvas.classList.toggle('swml-canvas-light', t === 'light');
            overlay.dataset.swmlTheme = t;
        });
        if (WML.isEmbedded) canvasThemeToggle.style.display = 'none';
        headerRight.appendChild(canvasThemeToggle);
        // v7.14.22: Safe one-directional LD → WML theme sync.
        // Observe ONLY <html data-theme> (LD controls this). Update canvas directly
        // without calling applyTheme() (which sets body attrs and caused feedback loops).
        // Also save to localStorage so WML's own getTheme() stays in sync.
        {
            const syncCanvasTheme = (theme) => {
                canvas.classList.toggle('swml-canvas-light', theme === 'light');
                overlay.dataset.swmlTheme = theme;
                document.body.setAttribute('data-swml-theme', theme);
                const root = document.getElementById('swml-root');
                if (root) root.setAttribute('data-swml-theme', theme);
                try { localStorage.setItem('swml-theme-manual', theme); } catch(e) {}
                // Update Jhey toggle if it exists
                const toggle = document.getElementById('swml-theme-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'false' : 'true');
                }
            };
            // Initial: read LD's current theme, fall back to WML's own preference
            const htmlTheme = document.documentElement.getAttribute('data-theme');
            const initialTheme = htmlTheme || getTheme();
            syncCanvasTheme(initialTheme);

            // Watch LD toggle: observe <html data-theme> only (LD controls this, WML does NOT write to it)
            if (WML.isEmbedded) {
                const ldObserver = new MutationObserver(() => {
                    const ldTheme = document.documentElement.getAttribute('data-theme');
                    if (ldTheme && ldTheme !== overlay.dataset.swmlTheme) {
                        syncCanvasTheme(ldTheme);
                    }
                });
                ldObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
            }
        }
        // Fullscreen toggle — embedded mode only (v7.14.24: reworked to trigger LD sidebar + header collapse)
        if (WML.isEmbedded) {
            const SVG_EXPAND = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
            const SVG_SHRINK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>';
            const fsBtn = el('button', {
                className: 'swml-canvas-fullscreen-btn',
                title: 'Toggle fullscreen',
                innerHTML: SVG_EXPAND,
                onClick: () => {
                    const isFs = overlay.classList.toggle('swml-canvas-fullscreen');
                    fsBtn.innerHTML = isFs ? SVG_SHRINK : SVG_EXPAND;
                    fsBtn.title = isFs ? 'Exit fullscreen' : 'Toggle fullscreen';
                    // v7.14.24: CSS handles sidebar + header collapse via body class
                    document.body.classList.toggle('swml-fullscreen-active', isFs);
                    // Show WML theme toggle when LD header is collapsed (LD's toggle disappears)
                    canvasThemeToggle.style.display = isFs ? '' : 'none';
                }
            });
            headerRight.appendChild(fsBtn);
        }

        // Apply user's theme immediately — canvas fades in with correct colours
        const initTheme = getTheme();
        if (initTheme === 'light') canvas.classList.add('swml-canvas-light');
        overlay.dataset.swmlTheme = initTheme;
        headerRow.appendChild(headerRight);

        editorPane.appendChild(headerRow);

        // Content area
        const contentWrap = el('div', { className: 'swml-canvas-content' });
        const docWrap = el('div', { className: 'swml-canvas-doc' });
        const editorEl = el('div', { id: 'swml-tiptap-editor' });
        const gutterWrap = el('div', { className: 'swml-comment-gutter' });
        docWrap.appendChild(editorEl);
        docWrap.appendChild(gutterWrap);
        // docWrap appended after outline elements (below) for sticky to work

        // ── Document Outline ──
        const SVG_OUTLINE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6h11"/><path d="M12 12h8"/><path d="M15 18h5"/><path d="M5 6v.01"/><path d="M8 12v.01"/><path d="M11 18v.01"/></svg>';

        // v7.13.53: Wrap outline + resources buttons in a sticky column
        const btnColumn = el('div', { className: 'swml-outline-btn-column' });

        // Floating trigger on left edge of content area
        const outlineBtn = el('button', {
            className: 'swml-outline-btn',
            title: 'Document Outline',
            innerHTML: SVG_OUTLINE,
            onClick: (e) => { e.stopPropagation(); toggleOutlinePanel(); }
        });
        btnColumn.appendChild(outlineBtn);

        // Panel
        const outlinePanel = el('div', { className: 'swml-outline-panel' });
        // Drag grip bar — visible only when detached (v7.12.40)
        const dragGrip = el('div', { className: 'swml-outline-grip' });
        dragGrip.innerHTML = '<span class="swml-outline-grip-dots">\u2837</span>';
        outlinePanel.appendChild(dragGrip);
        const outlinePanelHeader = el('div', { className: 'swml-outline-header' });
        outlinePanelHeader.innerHTML = SVG_OUTLINE.replace('width="16"', 'width="12"').replace('height="16"', 'height="12"').replace('stroke-width="2"', 'stroke-width="2" style="opacity:0.5"') + '<span>Document Outline</span>';
        // Detach/dock button — neumorphic (v7.12.40, icon updated v7.12.41)
        const SVG_DETACH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 16m0 1a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1z"/><path d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-6"/><path d="M12 8h4v4"/><path d="M16 8l-5 5"/></svg>';
        const SVG_DOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M9 13h-2v2"/><path d="M7 15l4 -4"/></svg>';
        const detachBtn = el('button', {
            className: 'swml-outline-detach-btn',
            title: 'Detach panel',
            innerHTML: SVG_DETACH,
            onClick: (e) => { e.stopPropagation(); toggleOutlineFloat(); }
        });
        outlinePanelHeader.appendChild(detachBtn);
        const outlineClose = el('button', {
            className: 'swml-outline-close',
            innerHTML: '✕',
            onClick: () => toggleOutlinePanel(false)
        });
        outlinePanelHeader.appendChild(outlineClose);
        outlinePanel.appendChild(outlinePanelHeader);
        const outlineList = el('div', { className: 'swml-outline-list' });
        outlinePanel.appendChild(outlineList);
        const outlineEmpty = el('div', { className: 'swml-outline-empty', textContent: 'No headings yet. Use H2 and H3 to structure your essay.' });
        outlinePanel.appendChild(outlineEmpty);
        // 8 resize handles — visible only when detached (v7.12.40)
        ['n','s','e','w','nw','ne','sw','se'].forEach(dir => {
            const h = el('div', { className: `swml-outline-rh swml-outline-rh-${dir.length > 1 ? 'corner' : 'edge'} swml-outline-rh-${dir}` });
            h.dataset.dir = dir;
            outlinePanel.appendChild(h);
        });
        contentWrap.appendChild(btnColumn); // sticky button column (outline + resources triggers)
        contentWrap.appendChild(outlinePanel);

        // ── CW Resources Panel (v7.13.49) ──
        // Collapsible panel like Document Outline, for step-specific resource links
        const CW_PANEL_RESOURCES = {
            2: [
                { label: 'Explore Story Ideas Course', url: 'https://www.sophicly.com/courses/creative-writing-masterclass/units/3-how-to-come-up-with-compelling-story-ideas/lessons/3-step-2-explore-more-story-ideas/' },
                { label: 'Read: When I Was 9 Years Old', url: 'https://docs.google.com/document/d/16qbgkyyz8pKyPb4udJa5DNlvbDKIalSwu8y5B8qHczU/copy' },
                { label: 'Read: George Pickering', url: 'https://docs.google.com/document/d/101fH2I4oNmZeJSC2TQNZSs7Mme5zveXleqvqTvLhn6Y/copy' },
                { label: 'Read: Juliane Diller', url: 'https://docs.google.com/document/d/1Lcbpwr_Ce4TH1BKUEexs1kctX3N9fVe3-T_MonAp6Xs/copy' },
                { label: 'Grade 9 Stories', url: 'https://www.sophicly.com/category/grade-9-stories/' },
            ],
        };
        const _isCw = state.task && state.task.startsWith('cw_');
        const _cwDef = _isCw ? WML.getCwStepDef(state.task) : null;
        const cwStepForRes = _isCw ? (_cwDef?.step || null) : null;
        const cwPanelRes = CW_PANEL_RESOURCES[cwStepForRes];
        let resPanel = null;
        let resDetachBtn = null; // hoisted for floatRes/dockRes access
        if (cwPanelRes && cwPanelRes.length > 0) {
            const SVG_LINK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

            const SVG_ARROW_DASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12h.5m3 0h1.5m3 0h6"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/></svg>';

            // Toggle button — inside btnColumn below outline button
            const resTrigger = el('button', {
                className: 'swml-outline-btn swml-resources-trigger',
                title: 'Resources',
                innerHTML: SVG_LINK,
                onClick: (e) => {
                    e.stopPropagation();
                    const isOpen = resPanel.classList.toggle('swml-resources-open');
                    resTrigger.classList.toggle('is-active', isOpen);
                }
            });
            btnColumn.appendChild(resTrigger);

            // Panel — independent from outline (uses swml-resources-open, not swml-outline-open)
            resPanel = el('div', { className: 'swml-outline-panel swml-resources-panel' });
            // Drag grip bar (detachable)
            const resDragGrip = el('div', { className: 'swml-outline-grip' });
            resDragGrip.innerHTML = '<span class="swml-outline-grip-dots">\u2837</span>';
            resPanel.appendChild(resDragGrip);
            const resPanelHeader = el('div', { className: 'swml-outline-header' });
            resPanelHeader.innerHTML = SVG_LINK.replace('width="16"', 'width="12"').replace('height="16"', 'height="12"').replace('stroke-width="2"', 'stroke-width="2" style="opacity:0.5"') + '<span>Resources</span>';
            // Detach button — same pattern as outline
            resDetachBtn = el('button', {
                className: 'swml-outline-detach-btn',
                title: 'Detach panel',
                innerHTML: SVG_DETACH,
                onClick: (e) => { e.stopPropagation(); toggleResFloat(); }
            });
            resPanelHeader.appendChild(resDetachBtn);
            const resClose = el('button', {
                className: 'swml-outline-close',
                innerHTML: '\u2715',
                onClick: () => {
                    resPanel.classList.remove('swml-resources-open');
                    resTrigger.classList.remove('is-active');
                    if (resFloating) {
                        // Fade out first, then dock after transition completes
                        resPanel.style.opacity = '0';
                        resPanel.style.transform = 'translateX(-12px)';
                        setTimeout(() => { dockRes(); resPanel.style.opacity = ''; resPanel.style.transform = ''; }, 250);
                    }
                }
            });
            resPanelHeader.appendChild(resClose);
            resPanel.appendChild(resPanelHeader);

            const resList = el('div', { className: 'swml-outline-list', style: { padding: '10px 6px' } });
            cwPanelRes.forEach(r => {
                const link = el('div', {
                    className: 'swml-cw-resource-btn',
                    innerHTML: SVG_ARROW_DASH + ' ' + r.label,
                    onClick: () => window.open(r.url, '_blank', 'noopener')
                });
                link.style.cursor = 'pointer';
                resList.appendChild(link);
            });
            resPanel.appendChild(resList);
            // Resize handles for detached mode
            ['n','s','e','w','nw','ne','sw','se'].forEach(dir => {
                const h = el('div', { className: `swml-outline-rh swml-outline-rh-${dir.length > 1 ? 'corner' : 'edge'} swml-outline-rh-${dir}` });
                h.dataset.dir = dir;
                resPanel.appendChild(h);
            });
            contentWrap.appendChild(resPanel);

            // v7.13.50: Glow the resources button when the Resources section scrolls into view
            setTimeout(() => {
                const resSec = editorEl.querySelector('[data-section-label="Resources"]');
                if (resSec && contentWrap) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            resTrigger.classList.toggle('swml-resources-glow', entry.isIntersecting && !resPanel.classList.contains('swml-resources-open'));
                        });
                    }, { root: contentWrap, threshold: 0.3 });
                    observer.observe(resSec);
                }
            }, 1000);
        }

        contentWrap.appendChild(docWrap);
        editorPane.appendChild(contentWrap);

        // Document scroll-to-top button — positioned inside editorPane (v7.12.53)
        const docScrollUpBtn = el('div', { className: 'swml-doc-scroll-up-btn',
            innerHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 17a.5.5 0 0 1-.5-.5V4.707L5.354 8.854a.5.5 0 1 1-.708-.708l5-5a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1-.708.708L10.5 4.707V16.5a.5.5 0 0 1-.5.5"/></svg>',
            title: 'Scroll to top of document',
            onClick: () => { contentWrap.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
        docScrollUpBtn.style.display = 'none';
        editorPane.appendChild(docScrollUpBtn);
        contentWrap.addEventListener('scroll', () => {
            docScrollUpBtn.style.display = contentWrap.scrollTop > 300 ? 'flex' : 'none';
        }, { passive: true });

        let outlineOpen = false;
        function toggleOutlinePanel(force) {
            outlineOpen = typeof force === 'boolean' ? force : !outlineOpen;
            outlinePanel.classList.toggle('swml-outline-open', outlineOpen);
            outlineBtn.classList.toggle('is-active', outlineOpen);
            if (outlineOpen) {
                updateOutline();
                requestAnimationFrame(updateScrollSpy);
            }
        }

        // Close outline panel when clicking outside it (within canvas area)
        contentWrap.addEventListener('click', (e) => {
            if (!outlineOpen) return;
            if (outlineFloating) return; // Don't auto-close when detached (v7.12.40)
            if (outlinePanel.contains(e.target) || outlineBtn.contains(e.target)) return;
            // Don't close when interacting with score dropdowns (v7.12.38)
            if (e.target.closest('.swml-dropdown-overlay, .swml-dropdown-select')) return;
            toggleOutlinePanel(false);
        });

        // ── Detachable Outline Panel (v7.12.40) ──
        let outlineFloating = false;

        function toggleOutlineFloat() {
            outlineFloating ? dockOutline() : floatOutline();
        }

        function floatOutline() {
            const rect = outlinePanel.getBoundingClientRect();
            outlineFloating = true;
            outlinePanel.classList.add('swml-outline-detached');
            outlinePanel.style.position = 'fixed';
            outlinePanel.style.left = rect.left + 'px';
            outlinePanel.style.top = (rect.top - 24) + 'px'; // -24 to compensate for grip bar appearing at top
            outlinePanel.style.width = rect.width + 'px';
            outlinePanel.style.height = (rect.height + 24) + 'px'; // +24 for grip bar
            detachBtn.innerHTML = SVG_DOCK;
            detachBtn.title = 'Dock panel';
        }

        function dockOutline() {
            outlineFloating = false;
            outlinePanel.classList.remove('swml-outline-detached');
            outlinePanel.style.cssText = '';
            detachBtn.innerHTML = SVG_DETACH;
            detachBtn.title = 'Detach panel';
        }

        // Drag via grip bar
        let olDragging = false, olDragOX = 0, olDragOY = 0;
        dragGrip.addEventListener('mousedown', (e) => {
            if (!outlineFloating || e.button !== 0) return;
            e.preventDefault(); e.stopPropagation();
            olDragging = true;
            const r = outlinePanel.getBoundingClientRect();
            olDragOX = e.clientX - r.left;
            olDragOY = e.clientY - r.top;
            dragGrip.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!olDragging) return;
            outlinePanel.style.left = (e.clientX - olDragOX) + 'px';
            outlinePanel.style.top = (e.clientY - olDragOY) + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (olDragging) { olDragging = false; dragGrip.style.cursor = ''; }
        });

        // 8-direction resize
        let olResizing = false, olResDir = '', olRSX = 0, olRSY = 0, olRSW = 0, olRSH = 0, olRSL = 0, olRST = 0;
        const OL_MIN_W = 180, OL_MIN_H = 200;
        outlinePanel.querySelectorAll('.swml-outline-rh').forEach(h => {
            h.addEventListener('mousedown', (e) => {
                if (!outlineFloating || e.button !== 0) return;
                e.preventDefault(); e.stopPropagation();
                olResizing = true;
                olResDir = h.dataset.dir;
                const r = outlinePanel.getBoundingClientRect();
                olRSX = e.clientX; olRSY = e.clientY;
                olRSW = r.width; olRSH = r.height; olRSL = r.left; olRST = r.top;
            });
        });
        document.addEventListener('mousemove', (e) => {
            if (!olResizing) return;
            const dx = e.clientX - olRSX, dy = e.clientY - olRSY;
            let w = olRSW, h = olRSH, l = olRSL, t = olRST;
            if (olResDir.includes('e')) w = Math.max(OL_MIN_W, olRSW + dx);
            if (olResDir.includes('w')) { w = Math.max(OL_MIN_W, olRSW - dx); l = olRSL + (olRSW - w); }
            if (olResDir.includes('s')) h = Math.max(OL_MIN_H, olRSH + dy);
            if (olResDir.includes('n')) { h = Math.max(OL_MIN_H, olRSH - dy); t = olRST + (olRSH - h); }
            Object.assign(outlinePanel.style, { width: w+'px', height: h+'px', left: l+'px', top: t+'px' });
        });
        document.addEventListener('mouseup', () => { olResizing = false; });

        // ── Detachable Resources Panel (v7.13.53) ──
        let resFloating = false;
        function toggleResFloat() {
            if (!resPanel) return;
            resFloating ? dockRes() : floatRes();
        }
        function floatRes() {
            const rect = resPanel.getBoundingClientRect();
            resFloating = true;
            resPanel.classList.add('swml-outline-detached');
            resPanel.style.position = 'fixed';
            resPanel.style.left = rect.left + 'px';
            resPanel.style.top = (rect.top - 24) + 'px'; // -24 to compensate for grip bar appearing at top
            resPanel.style.width = rect.width + 'px';
            resPanel.style.height = (rect.height + 24) + 'px'; // +24 for grip bar
            if (resDetachBtn) { resDetachBtn.innerHTML = SVG_DOCK; resDetachBtn.title = 'Dock panel'; }
        }
        function dockRes() {
            resFloating = false;
            if (resPanel) {
                resPanel.classList.remove('swml-outline-detached');
                resPanel.style.cssText = '';
            }
            if (resDetachBtn) { resDetachBtn.innerHTML = SVG_DETACH; resDetachBtn.title = 'Detach panel'; }
        }
        // Drag resources panel via grip
        if (resPanel) {
            const resGrip = resPanel.querySelector('.swml-outline-grip');
            let resDragging = false, resDragOX = 0, resDragOY = 0;
            if (resGrip) {
                resGrip.addEventListener('mousedown', (e) => {
                    if (!resFloating || e.button !== 0) return;
                    e.preventDefault(); e.stopPropagation();
                    resDragging = true;
                    const r = resPanel.getBoundingClientRect();
                    resDragOX = e.clientX - r.left;
                    resDragOY = e.clientY - r.top;
                    resGrip.style.cursor = 'grabbing';
                });
                document.addEventListener('mousemove', (e) => {
                    if (!resDragging) return;
                    resPanel.style.left = (e.clientX - resDragOX) + 'px';
                    resPanel.style.top = (e.clientY - resDragOY) + 'px';
                });
                document.addEventListener('mouseup', () => {
                    if (resDragging) { resDragging = false; resGrip.style.cursor = ''; }
                });
            }
            // Resize handles for resources panel
            let rsResizing = false, rsDir = '', rsSX = 0, rsSY = 0, rsSW = 0, rsSH = 0, rsSL = 0, rsST = 0;
            resPanel.querySelectorAll('.swml-outline-rh').forEach(h => {
                h.addEventListener('mousedown', (e) => {
                    if (!resFloating || e.button !== 0) return;
                    e.preventDefault(); e.stopPropagation();
                    rsResizing = true;
                    rsDir = h.dataset.dir;
                    const r = resPanel.getBoundingClientRect();
                    rsSX = e.clientX; rsSY = e.clientY;
                    rsSW = r.width; rsSH = r.height; rsSL = r.left; rsST = r.top;
                });
            });
            document.addEventListener('mousemove', (e) => {
                if (!rsResizing) return;
                const dx = e.clientX - rsSX, dy = e.clientY - rsSY;
                let w = rsSW, h = rsSH, l = rsSL, t = rsST;
                if (rsDir.includes('e')) w = Math.max(180, rsSW + dx);
                if (rsDir.includes('w')) { w = Math.max(180, rsSW - dx); l = rsSL + (rsSW - w); }
                if (rsDir.includes('s')) h = Math.max(200, rsSH + dy);
                if (rsDir.includes('n')) { h = Math.max(200, rsSH - dy); t = rsST + (rsSH - h); }
                Object.assign(resPanel.style, { width: w+'px', height: h+'px', left: l+'px', top: t+'px' });
            });
            document.addEventListener('mouseup', () => { rsResizing = false; });
        }

        // v7.13.74: Unified scroll helper — used by outline panel and in-document TOC.
        // Scrolls contentWrap only (not parent containers) to avoid multi-ancestor conflicts.
        function scrollContentTo(target) {
            if (!target || !contentWrap) return;
            const containerRect = contentWrap.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            // Account for zoom: visual offset / scale = layout offset
            const scale = canvasZoom || 1;
            const visualOffset = targetRect.top - containerRect.top;
            const scrollTarget = contentWrap.scrollTop + (visualOffset / scale) - (containerRect.height / 3);
            contentWrap.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
        }

        function scrollToPos(pos) {
            if (!canvasEditor) return;
            try {
                const domNode = canvasEditor.view.domAtPos(pos + 1)?.node;
                const target = domNode?.nodeType === 1 ? domNode : domNode?.parentElement?.closest('[data-section-type], h2, h3') || domNode?.parentElement;
                scrollContentTo(target);
            } catch(e) {}
        }

        function updateOutline() {
            if (!canvasEditor) return;
            const editor = document.getElementById('swml-tiptap-editor');
            // Walk sectionBlock nodes for hierarchy
            // v7.14.29: Include dividers — used as group boundaries in outline
            const sections = [];
            canvasEditor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'sectionBlock') {
                    const type = node.attrs.sectionType || 'response';
                    // v7.14.11: Skip sections hidden in diagnostic mode (check DOM class for robustness)
                    if (type !== 'divider' && canvas.classList.contains('swml-canvas-diagnostic') && ['feedback', 'scores', 'analytics', 'action', 'signoff', 'improvement'].includes(type)) return false;
                    sections.push({ type, label: node.attrs.label || '', pos });
                }
            });

            // ── Section completion check (for indicators) ──
            function getSectionIndicator(s) {
                if (!editor) return '';
                // Find DOM section by matching attributes (avoids CSS.escape issues)
                let domSection = null;
                editor.querySelectorAll('[data-section-type]').forEach(el => {
                    if (el.getAttribute('data-section-type') === s.type &&
                        el.getAttribute('data-section-label') === s.label) {
                        domSection = el;
                    }
                });
                // Fallback: match by label only
                if (!domSection) {
                    editor.querySelectorAll('[data-section-label]').forEach(el => {
                        if (el.getAttribute('data-section-label') === s.label) domSection = el;
                    });
                }
                if (!domSection) return '';

                // Feedback sections: check if marks have been set (— means unset)
                if (s.type === 'feedback') {
                    const match = s.label.match(/\((\S+)\s*\/\s*(\d+)\)$/);
                    if (match) {
                        // If it's still "—", not yet set
                        if (match[1] === '—') return '';
                        // Any number (including 0) means it's been deliberately set
                        return ' ✓';
                    }
                    // Analytics section (type=feedback, label=Analytics) — check for student text
                    if (s.label === 'Analytics') {
                        const headings = domSection.querySelectorAll('h3');
                        if (headings.length === 0) return '';
                        let allFilled = true;
                        headings.forEach(h3 => {
                            let studentText = '';
                            let sibling = h3.nextElementSibling;
                            while (sibling && sibling.tagName !== 'H3') {
                                const clone = sibling.cloneNode(true);
                                clone.querySelectorAll('em').forEach(el => el.remove());
                                const remaining = clone.textContent?.trim() || '';
                                if (remaining.length > 0) studentText += remaining;
                                sibling = sibling.nextElementSibling;
                            }
                            if (studentText.length < 1) allFilled = false;
                        });
                        return allFilled ? ' ✓' : '';
                    }
                    return '';
                }
                // Action Plan / Action sections: check for student text beyond prompts
                if (s.type === 'action') {
                    if (s.label === 'Self-Assessment') {
                        const unrated = Array.from(domSection.querySelectorAll('p')).filter(p => p.textContent.match(/:\s*—\s*\/\s*5$/));
                        if (unrated.length === 0) return ' ✓';
                        return '';
                    }
                    // Tutor Sign-off (old documents use type 'action' instead of 'signoff')
                    if (s.label === 'Tutor Sign-off') {
                        const statusP = Array.from(domSection.querySelectorAll('p')).find(p => p.textContent.includes('Status:'));
                        if (statusP && statusP.textContent.includes('Signed off')) return ' ✓';
                        return '';
                    }
                    // Action Plan: check EACH sub-section has content (not just total text)
                    if (s.label === 'Action Plan') {
                        const headings = domSection.querySelectorAll('h3');
                        if (headings.length === 0) return '';
                        let allFilled = true;
                        headings.forEach(h3 => {
                            let studentText = '';
                            let sibling = h3.nextElementSibling;
                            while (sibling && sibling.tagName !== 'H3') {
                                // Clone paragraph, strip em prompts, check what's left
                                const clone = sibling.cloneNode(true);
                                clone.querySelectorAll('em').forEach(el => el.remove());
                                const remaining = clone.textContent?.trim() || '';
                                if (remaining.length > 0) studentText += remaining;
                                sibling = sibling.nextElementSibling;
                            }
                            if (studentText.length < 1) allFilled = false;
                        });
                        return allFilled ? ' ✓' : '';
                    }
                    // Other action sections — generic text check
                    const clone = domSection.cloneNode(true);
                    clone.querySelectorAll('em, h3').forEach(el => el.remove());
                    const studentText = clone.textContent?.trim() || '';
                    if (studentText.length > 10) return ' ✓';
                    return '';
                }
                // Scores: check if grade is set
                if (s.type === 'scores') {
                    const gradeP = Array.from(domSection.querySelectorAll('p')).find(p => p.textContent.includes('Grade:'));
                    if (gradeP && !gradeP.textContent.includes('NOT STARTED') && !gradeP.textContent.includes('in progress')) return ' ✓';
                    return '';
                }
                // Sign-off: check if signed
                if (s.label === 'Tutor Sign-off' || s.type === 'signoff') {
                    const statusP = Array.from(domSection.querySelectorAll('p')).find(p => p.textContent.includes('Status:'));
                    if (statusP && statusP.textContent.includes('Signed off')) return ' ✓';
                    return '';
                }
                // Response: check word count
                if (s.type === 'response') {
                    const text = domSection.textContent?.trim() || '';
                    if (text.length > 100) return ' ✓';
                    return '';
                }
                // Plan sections: check for actual student content (not just placeholder em text)
                if (s.type === 'plan') {
                    // Get all text NOT inside <em> tags (prompts are always in <em>)
                    const clone = domSection.cloneNode(true);
                    clone.querySelectorAll('em').forEach(em => em.remove());
                    // Also remove the section badge text (the label)
                    clone.querySelectorAll('[data-section-label]').forEach(l => { /* label is an attribute, not a child */ });
                    const studentText = clone.textContent?.replace(/Plan:.*$/m, '').trim() || '';
                    if (studentText.length > 5) return ' ✓';
                    return '';
                }
                // Outline sections: same approach as plan — strip em prompts
                if (s.type === 'outline') {
                    const clone = domSection.cloneNode(true);
                    clone.querySelectorAll('em, h3').forEach(el => el.remove());
                    const studentText = clone.textContent?.replace(/Outline:.*$/m, '').trim() || '';
                    if (studentText.length > 5) return ' ✓';
                    return '';
                }
                // Question & Extract: always considered complete (read-only, pre-populated)
                if (s.type === 'question') {
                    return ' ✓';
                }
                // Improvement Plan: check for student text beyond prompts
                if (s.type === 'improvement') {
                    const clone = domSection.cloneNode(true);
                    clone.querySelectorAll('em, h3').forEach(el => el.remove());
                    const studentText = clone.textContent?.trim() || '';
                    if (studentText.length > 10) return ' ✓';
                    return '';
                }
                return '';
            }

            // ── Compute section numbers (v7.14.34: divider-based major.minor, matching TOC) ──
            // Dividers start new groups (major++), sections after a divider get major.minor.
            // Fallback: GROUP_PREFIXES for documents without dividers.
            const GROUP_PREFIXES = ['Plan:', 'Outline:', 'Feedback:'];
            let _major = 0, _minor = 0, _inDividerGroup = false, _lastPrefixGroup = null;
            const sectionNumbers = sections.map(s => {
                if (s.type === 'cover') return '';
                if (s.type === 'divider') {
                    _major++; _minor = 0; _inDividerGroup = true; _lastPrefixGroup = null;
                    return ''; // dividers don't get a number
                }
                if (_inDividerGroup) {
                    _minor++;
                    return _major + '.' + _minor;
                }
                // Fallback: prefix-based grouping for docs without dividers
                const gp = GROUP_PREFIXES.find(p => s.label.startsWith(p));
                if (gp) {
                    if (gp !== _lastPrefixGroup) { _major++; _minor = 0; _lastPrefixGroup = gp; }
                    _minor++;
                    return _major + '.' + _minor;
                } else {
                    _major++; _minor = 0; _lastPrefixGroup = null; _inDividerGroup = false;
                    return String(_major);
                }
            });

            // ── Always update in-document section badges + numbers (v7.12.2, v7.12.56) ──
            // Runs even when outline panel is closed — keeps label checkmarks + numbers current
            if (editor) {
                sections.forEach((s, i) => {
                    let domSection = null;
                    editor.querySelectorAll('[data-section-type]').forEach(el => {
                        if (el.getAttribute('data-section-type') === s.type &&
                            el.getAttribute('data-section-label') === s.label) {
                            domSection = el;
                        }
                    });
                    if (!domSection) {
                        editor.querySelectorAll('[data-section-label]').forEach(el => {
                            if (el.getAttribute('data-section-label') === s.label) domSection = el;
                        });
                    }
                    if (domSection) {
                        const indicator = getSectionIndicator(s);
                        domSection.setAttribute('data-section-complete', indicator ? 'true' : 'false');
                    }
                });
            }

            // ── Outline panel DOM — only render when panel is open ──
            if (!outlineOpen) return;

            outlineList.innerHTML = '';
            if (sections.length === 0) {
                outlineEmpty.style.display = '';
                outlineList.style.display = 'none';
                return;
            }
            outlineEmpty.style.display = 'none';
            outlineList.style.display = '';
            outlineHeadingPositions = [];

            // Attach section numbers to sections for outline display (v7.12.56)
            sections.forEach((s, i) => { s._num = sectionNumbers[i] || ''; });

            // v7.14.29: Group sections using dividers as boundaries (fundamental fix — works for all doc types)
            // Dividers become group headers in the outline. Fallback: PREFIX_MAP for docs without dividers.
            const groups = [];
            let currentDividerGroup = null;
            const PREFIX_MAP = { 'Plan:': 'Essay Plan', 'Outline:': 'Outline', 'Feedback:': 'Feedback' };
            sections.forEach(s => {
                if (s.type === 'cover') return;
                // Dividers start new groups
                if (s.type === 'divider') {
                    currentDividerGroup = { key: s.label, children: [], type: null, isDivider: true, pos: s.pos };
                    groups.push(currentDividerGroup);
                    return;
                }
                // If inside a divider group, add as child
                if (currentDividerGroup) {
                    if (!currentDividerGroup.type) currentDividerGroup.type = s.type;
                    currentDividerGroup.children.push({ ...s, childLabel: s.label });
                    return;
                }
                // Fallback: PREFIX_MAP grouping for sections before any divider
                let groupKey = null, childLabel = s.label;
                for (const [prefix, name] of Object.entries(PREFIX_MAP)) {
                    if (s.label.startsWith(prefix)) {
                        groupKey = name;
                        childLabel = s.label.slice(prefix.length).trim();
                        break;
                    }
                }
                if (groupKey) {
                    const lastGroup = groups[groups.length - 1];
                    if (lastGroup && lastGroup.key === groupKey && !lastGroup.isDivider) {
                        lastGroup.children.push({ ...s, childLabel });
                    } else {
                        groups.push({ key: groupKey, children: [{ ...s, childLabel }], type: s.type });
                    }
                } else {
                    groups.push({ key: null, section: s });
                }
            });

            // v7.14.34: "Table of Contents" link at top of outline
            const tocEl = document.querySelector('.swml-toc');
            if (tocEl) {
                const tocLink = el('button', {
                    className: 'swml-outline-item swml-outline-toc-link',
                    tabIndex: -1,
                    textContent: 'Table of Contents',
                    onClick: () => {
                        const cw = document.querySelector('.swml-canvas-content');
                        if (cw && tocEl) {
                            const cwRect = cw.getBoundingClientRect();
                            const tRect = tocEl.getBoundingClientRect();
                            cw.scrollTo({ top: cw.scrollTop + (tRect.top - cwRect.top) - 20, behavior: 'smooth' });
                        }
                    }
                });
                const tocDot = el('span', { className: 'swml-outline-dot' });
                tocDot.style.background = 'rgba(255,255,255,0.3)';
                tocLink.insertBefore(tocDot, tocLink.firstChild);
                outlineList.appendChild(tocLink);
            }

            // v7.14.31: Render grouped outline with accordion collapse + brand colour dots
            const OUTLINE_GROUP_COLOURS = ['#51dacf', '#42A1EC', '#4D76FD', '#5333ed', '#7DF9E9', '#1CD991', '#41aaa8'];
            let _groupColorIdx = 0;
            groups.forEach(g => {
                // Skip divider groups with no children (empty structural dividers)
                if (g.isDivider && (!g.children || g.children.length === 0)) return;
                if (g.key && g.children && g.children.length >= 1) {
                    // Brand colour for this group (divider-based get cycling colours, prefix-based get section colours)
                    const groupColor = g.isDivider
                        ? OUTLINE_GROUP_COLOURS[_groupColorIdx++ % OUTLINE_GROUP_COLOURS.length]
                        : (SECTION_COLOURS[g.type] || '#888');

                    // Wrapper div for group header + collapsible children
                    const groupWrap = el('div', { className: 'swml-outline-group-wrap' });

                    // Parent group header — chevron LEFT of dot, title clicks to scroll
                    const header = el('div', {
                        className: 'swml-outline-item swml-outline-group',
                    });

                    // Chevron (left side) — toggles accordion
                    const chevron = el('button', { className: 'swml-outline-chevron', tabIndex: -1 });
                    chevron.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>';
                    header.appendChild(chevron);

                    const dot = el('span', { className: 'swml-outline-dot' });
                    dot.style.background = groupColor;
                    header.appendChild(dot);

                    // Title — clicks to scroll to section
                    const groupMajor = (g.children[0]?._num || '').split('.')[0];
                    const titleBtn = el('button', {
                        className: 'swml-outline-group-title',
                        tabIndex: -1,
                        textContent: (groupMajor ? groupMajor + '. ' : '') + g.key,
                        onClick: () => scrollToPos(g.children[0].pos),
                    });
                    header.appendChild(titleBtn);

                    // Collapsible children container (starts collapsed)
                    const childWrap = el('div', { className: 'swml-outline-children swml-outline-collapsed' });

                    // Chevron click: toggle accordion
                    chevron.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isCollapsed = childWrap.classList.contains('swml-outline-collapsed');
                        if (isCollapsed) {
                            childWrap.classList.remove('swml-outline-collapsed');
                            chevron.classList.add('swml-outline-chevron-open');
                        } else {
                            childWrap.classList.add('swml-outline-collapsed');
                            chevron.classList.remove('swml-outline-chevron-open');
                        }
                    });

                    groupWrap.appendChild(header);
                    outlineList.appendChild(groupWrap);
                    outlineHeadingPositions.push({ pos: g.children[0].pos, itemEl: header });

                    // Children inside collapsible wrapper
                    g.children.forEach(child => {
                        const childIndicator = getSectionIndicator(child);
                        const item = el('button', {
                            className: 'swml-outline-item swml-outline-child',
                            tabIndex: -1,
                            onClick: () => scrollToPos(child.pos)
                        });
                        item.appendChild(el('span', { className: 'swml-outline-label', textContent: (child._num ? child._num + ' ' : '') + (child.childLabel || child.label) }));
                        if (childIndicator) {
                            const chk = el('span', { className: 'swml-outline-check' });
                            chk.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#1CD991" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" fill="#1CD991"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
                            item.appendChild(chk);
                        }
                        childWrap.appendChild(item);
                        outlineHeadingPositions.push({ pos: child.pos, itemEl: item });
                    });
                    groupWrap.appendChild(childWrap);
                } else {
                    // Single section (or single-child group)
                    const s = g.key ? g.children[0] : g.section;
                    const label = g.key && g.children.length === 1 ? g.key : s.label;
                    const indicator = getSectionIndicator(s);
                    const item = el('button', {
                        className: 'swml-outline-item',
                        tabIndex: -1,
                        onClick: () => scrollToPos(s.pos)
                    });
                    const dot = el('span', { className: 'swml-outline-dot' });
                    dot.style.background = SECTION_COLOURS[s.type] || '#888';
                    item.appendChild(dot);
                    item.appendChild(el('span', { className: 'swml-outline-label', textContent: (s._num ? s._num + '. ' : '') + label }));
                    if (indicator) {
                        const chk = el('span', { className: 'swml-outline-check' });
                        chk.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#1CD991" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" fill="#1CD991"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
                        item.appendChild(chk);
                    }
                    outlineList.appendChild(item);
                    outlineHeadingPositions.push({ pos: s.pos, itemEl: item });
                }
            });

        }

        // Outline only closes via the ✕ button — no outside-click close

        // ── Scroll spy: highlight current heading in outline ──
        let outlineHeadingPositions = []; // [{pos, itemEl}]
        let scrollSpyRaf = null;

        function updateScrollSpy() {
            if (!outlineOpen || outlineHeadingPositions.length === 0 || !canvasEditor) return;
            const containerRect = contentWrap.getBoundingClientRect();
            const threshold = containerRect.top + containerRect.height * 0.35; // 35% from top
            let activeIdx = 0;
            for (let i = 0; i < outlineHeadingPositions.length; i++) {
                const hp = outlineHeadingPositions[i];
                try {
                    const domNode = canvasEditor.view.domAtPos(hp.pos + 1)?.node;
                    const headingEl = domNode?.nodeType === 1 ? domNode : domNode?.parentElement?.closest('h2, h3') || domNode?.parentElement;
                    if (headingEl) {
                        const rect = headingEl.getBoundingClientRect();
                        if (rect.top <= threshold) activeIdx = i;
                    }
                } catch (e) { /* pos may be stale */ }
            }
            outlineHeadingPositions.forEach((hp, i) => {
                hp.itemEl.classList.toggle('swml-outline-active', i === activeIdx);
            });
        }

        contentWrap.addEventListener('scroll', () => {
            if (!outlineOpen) return;
            if (scrollSpyRaf) cancelAnimationFrame(scrollSpyRaf);
            scrollSpyRaf = requestAnimationFrame(updateScrollSpy);
        }, { passive: true });

        // TODO: Chat input area will be added for redraft/creative writing modes
        // For diagnostic mode: no input area, dictation is via toolbar button

        // Status bar
        const statusBar = el('div', { className: 'swml-canvas-status' });
        const wcDisplay = el('span', { className: 'swml-wc', id: 'swml-footer-wc', textContent: '0 words' });
        const saveStatus = el('span', { className: 'swml-save-status', textContent: 'Ready' });
        // Back button — hidden in embedded mode (LD handles navigation) (v7.13.11)
        if (!WML.isEmbedded) {
            const backBtn = el('button', {
                className: 'swml-status-btn',
                textContent: '← Back to tasks',
                onClick: () => closeCanvasOverlay(),
            });
            statusBar.appendChild(backBtn);
        }
        // Reset Document button — clears saved content and regenerates template
        const resetBtn = el('button', {
            className: 'swml-status-btn swml-status-reset',
            textContent: '↺ Reset',
            title: 'Clear saved content and regenerate the document template',
            onClick: () => {
                showConfirm('Reset this document? All content will be cleared and the template will be regenerated from scratch.', () => {
                    // Clear localStorage
                    try { localStorage.removeItem(CANVAS_SAVE_KEY()); } catch(e) {}
                    // Clear server save
                    fetch(API.canvasSave, {
                        method: 'POST', headers,
                        body: JSON.stringify({ board: state.board, text: state.text, html: '', wordCount: 0, topicNumber: state.topicNumber || null })
                    }).catch(() => {});
                    // Regenerate template
                    if (canvasEditor) {
                        canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);
                        // Re-run topic template injection, then rebuild dropdowns
                        tryTopicTemplate().then(() => {
                            if (dropdownLayer) { dropdownLayer.remove(); dropdownLayer = null; }
                            setTimeout(() => buildDropdownOverlays(contentWrap), 200);
                        });
                    }
                }, { confirmText: 'Reset', danger: true });
            }
        });
        // v7.14.50: Hide Reset for training-env (document is protocol-driven, resetting breaks flow)
        if ((WML.getExerciseConfig(state.task)?.environment || 'free') !== 'training') statusBar.appendChild(resetBtn);
        statusBar.appendChild(wcDisplay);
        // wcRestore added after widget creation below
        let wcRestore; // forward declaration
        const wcRestorePlaceholder = el('span', { id: 'swml-wc-restore-slot' });
        statusBar.appendChild(wcRestorePlaceholder);

        // Page count display (approximate A4 pages)
        const PAGE_HEIGHT = 1020; // A4 proportional height at 720px width
        const pageDisplay = el('span', { className: 'swml-page-count', textContent: 'Page 1 of 1' });
        statusBar.appendChild(pageDisplay);

        function updatePageCount() {
            const totalPages = Math.max(1, Math.ceil(docWrap.scrollHeight / PAGE_HEIGHT));
            const scrollTop = contentWrap.scrollTop;
            const currentPage = Math.min(totalPages, Math.max(1, Math.ceil((scrollTop + contentWrap.clientHeight / 2) / PAGE_HEIGHT)));
            pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        contentWrap.addEventListener('scroll', updatePageCount);

        // v7.14.25: LD navigation proxy buttons — embedded mode only
        // Uses exact selectors from SPL footer (.spl-btn-prev, .learndash_mark_complete_button, .spl-btn-next)
        if (WML.isEmbedded) {
            const ldNav = el('div', { className: 'swml-ld-nav' });
            // Previous lesson
            const ldPrevLink = document.querySelector('.spl-footer .spl-btn-prev, .ld-content-actions a.ld-button-reverse');
            if (ldPrevLink) {
                ldNav.appendChild(el('button', {
                    className: 'swml-status-btn swml-ld-prev',
                    innerHTML: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> Previous',
                    title: 'Previous lesson',
                    onClick: () => { window.location.href = ldPrevLink.href; }
                }));
            }
            // Mark Complete
            const ldMarkBtn = document.querySelector('.spl-footer .learndash_mark_complete_button, .learndash_mark_complete_button');
            if (ldMarkBtn) {
                const markBtn = el('button', {
                    className: 'swml-status-btn swml-ld-complete',
                    innerHTML: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Mark Complete',
                    title: 'Mark this lesson complete in LearnDash',
                    onClick: () => {
                        ldMarkBtn.click();
                        markBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Completing\u2026';
                        markBtn.disabled = true;
                    }
                });
                ldNav.appendChild(markBtn);
            }
            // Next lesson
            const ldNextLink = document.querySelector('.spl-footer .spl-btn-next, .ld-content-actions a.ld-button:not(.ld-button-reverse)');
            if (ldNextLink) {
                ldNav.appendChild(el('button', {
                    className: 'swml-status-btn swml-ld-next',
                    innerHTML: 'Next <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
                    title: 'Next lesson',
                    onClick: () => { window.location.href = ldNextLink.href; }
                }));
            }
            if (ldNav.children.length > 0) statusBar.appendChild(ldNav);
            // v7.14.25: Clean up fullscreen body class on page unload (prevents state leaking to next lesson)
            window.addEventListener('beforeunload', () => {
                document.body.classList.remove('swml-fullscreen-active');
            });
        }

        // ── Canvas State Flags — moved before countdown timer so isExamPrep is available (v7.13.97) ──
        const exerciseConfig = WML.getExerciseConfig(state.task);
        const isCwTask = state.task && state.task.startsWith('cw_');
        const cwStepDef = isCwTask ? WML.getCwStepDef(state.task) : null;
        const isCwSi = isCwTask && cwStepDef?.tier === 'si';
        const isCwWorkbook = isCwTask && cwStepDef?.tier === 'workbook';
        const EXAM_PREP_TASKS = ['exam_question', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice'];
        const isExamPrep = EXAM_PREP_TASKS.includes(state.task);
        // v7.14.37: Environment detection from manifest (free/training/flexible)
        const envType = exerciseConfig?.environment || 'free';
        const useTrainingEnv = envType === 'training';
        let canvasInAssessment = useTrainingEnv; // legacy alias — all training env exercises get chat + sidebar
        const canvasInFeedback = state.task === 'feedback_discussion';
        const canvasInMarkScheme = state.task === 'mark_scheme';
        const canvasChatHeaderLabel = exerciseConfig.chatHeaderLabel || 'Essay Assessment';
        const canvasSidebarSteps = exerciseConfig.sidebarSteps || null;
        // v7.14.11: Diagnostic mode — hide assessment-only sections (feedback, scores, etc.)
        const isDiagnosticEnv = envType === 'free' && !canvasInFeedback;
        if (isDiagnosticEnv) canvas.classList.add('swml-canvas-diagnostic');
        // v7.14.50: Mark scheme class — enables notice section visibility via CSS
        if (canvasInMarkScheme) canvas.classList.add('swml-canvas-mark-scheme');

        // Countdown timer — phase-aware: Phase 1 = 10 days, Phase 2 = 14 days (v7.12.99)
        // v7.13.39: Skip for CW exercises. v7.13.97: Skip for exam prep (no phase deadline)
        const totalDays = state.phase === 'redraft' ? 14 : 10;
        const phaseKey = state.phase === 'redraft' ? 'redraft' : 'diag';
        const countdownKey = `swml_${phaseKey}_start_${state.board}_${(state.text || '').replace(/\s/g, '_')}`;
        if (state.phase === 'redraft' && !localStorage.getItem(countdownKey)) {
            localStorage.setItem(countdownKey, new Date().toISOString());
        }
        const noDeadlinePhase = ['preliminary', 'free_practice', 'exam_practice'].includes(state.phase);
        const countdownStart = (isCwTask || isExamPrep || noDeadlinePhase) ? null : localStorage.getItem(countdownKey);
        if (countdownStart) {
            const cStart = new Date(countdownStart);
            const cDeadline = new Date(cStart.getTime() + totalDays * 24 * 60 * 60 * 1000);
            const countdownDisplay = el('span', { className: 'swml-countdown-status' });
            function updateCountdown() {
                const remaining = cDeadline.getTime() - Date.now();
                if (remaining <= 0) {
                    countdownDisplay.textContent = 'Overdue';
                    countdownDisplay.style.color = '#ff6b6b';
                    return;
                }
                const daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000));
                const daysPassed = totalDays - daysLeft;
                // v7.14.50: Prepend phase label so students know this is the phase deadline, not the exercise
                const CD_PHASE_LABELS = { initial: 'Phase 1', redraft: 'Phase 2', preliminary: 'Preliminary', free_practice: 'Free Practice', exam_practice: 'Exam Practice' };
                const phasePrefix = CD_PHASE_LABELS[state.phase] ? CD_PHASE_LABELS[state.phase] + ': ' : '';
                countdownDisplay.textContent = `${phasePrefix}Day ${daysPassed + 1} · ${daysLeft}d left`;
                countdownDisplay.style.color = daysLeft <= 2 ? '#ff6b6b' : daysLeft <= 5 ? '#ffb432' : '';
            }
            updateCountdown();
            statusBar.appendChild(countdownDisplay);
        }

        // Comment count
        const commentCountEl = el('span', { className: 'swml-comment-count', style: { cursor: 'pointer' } });

        // (Canvas State Flags moved above countdown timer — v7.13.97)

        // ── Canvas Exam Timer (v7.11.0) ──
        let canvasTimerInterval = null;
        let canvasTimerRemaining = state.canvasTimer || 0;
        const canvasTimerDisplay = el('span', { className: 'swml-canvas-timer', id: 'swml-canvas-timer' });
        if (canvasTimerRemaining > 0) {
            function fmtTimer(s) {
                const m = Math.floor(s / 60);
                const sec = s % 60;
                return `${m}:${sec < 10 ? '0' : ''}${sec}`;
            }
            canvasTimerDisplay.textContent = `⏱ ${fmtTimer(canvasTimerRemaining)}`;
            canvasTimerDisplay.style.color = '#51dacf';
            statusBar.appendChild(canvasTimerDisplay);
            // Auto-start timer after a brief delay (let student read the question)
            setTimeout(() => {
                canvasTimerInterval = setInterval(() => {
                    canvasTimerRemaining--;
                    if (canvasTimerRemaining <= 0) {
                        clearInterval(canvasTimerInterval);
                        canvasTimerDisplay.textContent = '⏱ Time\'s up!';
                        canvasTimerDisplay.style.color = '#ff6b6b';
                        canvasTimerDisplay.style.fontWeight = '700';
                        return;
                    }
                    canvasTimerDisplay.textContent = `⏱ ${fmtTimer(canvasTimerRemaining)}`;
                    if (canvasTimerRemaining <= 300) canvasTimerDisplay.style.color = '#ffb432'; // 5 min warning
                    if (canvasTimerRemaining <= 60) canvasTimerDisplay.style.color = '#ff6b6b'; // 1 min warning
                }, 1000);
            }, 3000); // 3 second grace period
        }
        commentCountEl.addEventListener('click', () => {
            // Scroll to first unresolved comment
            const firstMark = editorEl.querySelector('[data-comment-id]');
            if (firstMark) {
                firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const cid = firstMark.dataset.commentId;
                if (cid) showCommentPopover(cid, firstMark);
            }
        });
        statusBar.appendChild(commentCountEl);

        function updateCommentCount() {
            // Only count comments that actually have marks in the editor
            const activeIds = new Set();
            editorEl.querySelectorAll('[data-comment-id]').forEach(m => activeIds.add(m.dataset.commentId));
            const active = Object.values(comments).filter(c => activeIds.has(c.id));
            const total = active.length;
            const unresolved = active.filter(c => !c.resolved).length;
            if (total === 0) {
                commentCountEl.textContent = '';
                commentCountEl.innerHTML = '';
                commentCountEl.title = '';
            } else {
                const SVG_COMMENT_COUNT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-miterlimit="10"><path d="M21.5,12A9.5,9.5,0,1,0,12,21.5h9.5l-2.66-2.92A9.43,9.43,0,0,0,21.5,12Z"/><line x1="14.85" y1="12" x2="16.75" y2="12"/><line x1="11.05" y1="12" x2="12.95" y2="12"/><line x1="7.25" y1="12" x2="9.15" y2="12"/></svg>';
                commentCountEl.innerHTML = SVG_COMMENT_COUNT + ` ${unresolved}/${total}`;
                commentCountEl.title = `${unresolved} unresolved of ${total} comments — click to navigate`;
            }
        }

        statusBar.appendChild(saveStatus);

        // ── Detachable Extract Panel (v7.11.6) ──
        let extractPanel = null;
        const extractBtn = el('button', {
            className: 'swml-extract-btn',
            title: 'Pop out the question extract so you can view it while writing',
            onClick: () => {
                if (extractPanel) {
                    extractPanel.remove();
                    extractPanel = null;
                    extractBtn.classList.remove('active');
                    return;
                }
                // v7.14.56: Prefer source material over question text for extract panel
                // Language papers have [data-section-type="source"] sections with extracts
                const sourceEls = editorEl.querySelectorAll('[data-section-type="source"]');
                const questionEl = editorEl.querySelector('[data-section-type="question"]');
                const extractEl = sourceEls.length > 0 ? null : questionEl; // null = use sources
                if (!extractEl && sourceEls.length === 0) return;

                extractPanel = el('div', { className: 'swml-extract-panel' });
                const extractHeader = el('div', { className: 'swml-extract-panel-header' });
                extractHeader.appendChild(el('span', { textContent: sourceEls.length > 0 ? 'Source Material' : 'Extract' }));
                extractHeader.appendChild(el('button', {
                    className: 'swml-extract-panel-close',
                    textContent: '✕',
                    onClick: () => { extractPanel.remove(); extractPanel = null; extractBtn.classList.remove('active'); }
                }));
                extractPanel.appendChild(extractHeader);

                const extractBody = el('div', { className: 'swml-extract-panel-body' });
                if (sourceEls.length > 0) {
                    // Clone all source sections into the extract panel
                    sourceEls.forEach(src => { extractBody.appendChild(src.cloneNode(true)); });
                } else {
                    extractBody.innerHTML = questionEl.innerHTML;
                }
                extractPanel.appendChild(extractBody);

                // Click on commented text inside extract → show comment popover INSIDE the extract panel
                extractBody.addEventListener('click', (e) => {
                    const mark = e.target.closest('[data-comment-id]');
                    if (mark) {
                        const cid = mark.dataset.commentId;
                        setTimeout(() => showCommentPopover(cid, mark, extractPanel), 60);
                    }
                });

                // ── Resize handles (all 4 edges + 4 corners) ──
                const DIRS = ['n','s','e','w','nw','ne','sw','se'];
                DIRS.forEach(dir => {
                    const h = el('div', { className: `swml-extract-rh swml-extract-rh-${dir.length > 1 ? 'corner' : 'edge'} swml-extract-rh-${dir}` });
                    h.dataset.dir = dir;
                    extractPanel.appendChild(h);
                });
                const EP_MIN_W = 280, EP_MIN_H = 200;
                let epResizing = false, epDir = '', epSX, epSY, epSW, epSH, epSL, epST;
                extractPanel.querySelectorAll('.swml-extract-rh').forEach(h => {
                    h.addEventListener('mousedown', (e) => {
                        if (e.button !== 0) return;
                        e.preventDefault(); e.stopPropagation();
                        epResizing = true; epDir = h.dataset.dir;
                        const r = extractPanel.getBoundingClientRect();
                        epSX = e.clientX; epSY = e.clientY;
                        epSW = r.width; epSH = r.height; epSL = r.left; epST = r.top;
                    });
                });
                const epMoveHandler = (e) => {
                    if (!epResizing || !extractPanel) return; e.preventDefault();
                    const dx = e.clientX - epSX, dy = e.clientY - epSY;
                    let w = epSW, h = epSH, l = epSL, t = epST;
                    if (epDir.indexOf('e') > -1) w = Math.max(EP_MIN_W, epSW + dx);
                    if (epDir.indexOf('w') > -1) { w = Math.max(EP_MIN_W, epSW - dx); l = epSL + (epSW - w); }
                    if (epDir.indexOf('s') > -1) h = Math.max(EP_MIN_H, epSH + dy);
                    if (epDir.indexOf('n') > -1) { h = Math.max(EP_MIN_H, epSH - dy); t = epST + (epSH - h); }
                    extractPanel.style.width = w + 'px'; extractPanel.style.maxHeight = 'none'; extractPanel.style.height = h + 'px';
                    extractPanel.style.left = l + 'px'; extractPanel.style.top = t + 'px'; extractPanel.style.right = 'auto';
                };
                const epUpHandler = () => { epResizing = false; };
                document.addEventListener('mousemove', epMoveHandler);
                document.addEventListener('mouseup', epUpHandler);

                // Make entire panel draggable (not just header) — exclude resize handles, buttons, inputs, comment marks
                let isDragging = false, dragX = 0, dragY = 0;
                extractPanel.style.cursor = 'grab';
                extractPanel.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return;
                    // Don't drag from interactive elements
                    if (e.target.closest('.swml-extract-rh') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('[data-comment-id]') || e.target.closest('.swml-comment-popover')) return;
                    isDragging = true;
                    dragX = e.clientX - extractPanel.offsetLeft;
                    dragY = e.clientY - extractPanel.offsetTop;
                    extractPanel.style.cursor = 'grabbing';
                    e.preventDefault();
                });
                document.addEventListener('mousemove', (e) => {
                    if (!isDragging || !extractPanel) return;
                    extractPanel.style.left = (e.clientX - dragX) + 'px';
                    extractPanel.style.top = (e.clientY - dragY) + 'px';
                    extractPanel.style.right = 'auto';
                });
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                    if (extractPanel) extractPanel.style.cursor = 'grab';
                });

                canvas.appendChild(extractPanel);
                extractBtn.classList.add('active');
            }
        });
        extractBtn.innerHTML = SVG_EXTRACT + ' Extract';
        // v7.13.39: Hide extract button for CW exercises (no extract to show)
        // v7.14.50: Also hide for mark_scheme (no question extract)
        if (!(state.task && state.task.startsWith('cw_')) && state.task !== 'mark_scheme') {
            statusBar.appendChild(extractBtn);
        }

        editorPane.appendChild(statusBar);

        canvas.appendChild(editorPane);

        // v7.14.48: Hide document panel when manifest says panels.document === false
        // (e.g. mark_scheme is chat-only quiz — no document needed)
        if (exerciseConfig.panels && exerciseConfig.panels.document === false) {
            editorPane.style.display = 'none';
            canvas.classList.add('swml-canvas-no-document');
        }

        // ── Right Panel — Diagnostic Tips OR Plan ──
        const rightPanel = el('div', { className: 'swml-canvas-plan' });

        // Populate plan from session data
        const planSections = [
            { key: 'goal', title: '🎯 Goal' },
            { key: 'keywords', title: '🔑 Keywords' },
            { key: 'anchor_quote_start', title: '📍 Beginning Quote' },
            { key: 'anchor_quote_mid', title: '📍 Middle Quote' },
            { key: 'anchor_quote_end', title: '📍 End Quote' },
            { key: 'body_para_1', title: '📝 Body 1' },
            { key: 'body_para_2', title: '📝 Body 2' },
            { key: 'body_para_3', title: '📝 Body 3' },
            { key: 'introduction', title: '📖 Introduction' },
            { key: 'conclusion', title: '📖 Conclusion' },
        ];

        const planData = state.sessionElements || {};
        let hasPlan = false;
        // Hoisted refs for word count (used in onUpdate closure)
        let diagProgressFill = null, diagWcLabel = null, diagCompleteBtn = null, assessCompleteBtn = null;

        planSections.forEach(s => {
            const val = planData[s.key];
            if (val) hasPlan = true;
        });

        // v7.14.48: hasPlan override removed — training-env exercises use direct rendering branch,
        // so they never reach the diagnostic else-branch. No need to force hasPlan = false.

        // ── Feedback Discussion Mode — guidance panel + auto-scroll + video (v7.12.80) ──
        if (canvasInFeedback) {
            const fbCfg = LIGHTWEIGHT_CANVAS_CONFIG.feedback_discussion;
            rightPanel.appendChild(el('h3', { textContent: fbCfg.guideHeading }));

            const guideContent = el('div', { className: 'swml-canvas-guidance' });
            fbCfg.tips.forEach(t => {
                const iconSvg = GUIDE_ICONS[t.icon] || '';
                const tip = el('div', { className: 'swml-canvas-plan-section' });
                tip.appendChild(el('p', { innerHTML: `<span class="swml-guide-icon" style="color:${t.colour}">${iconSvg}</span> ${t.text}` }));
                guideContent.appendChild(tip);
            });
            rightPanel.appendChild(guideContent);

            // Discussion questions (expandable)
            if (fbCfg.questions?.length) {
                const qWrap = el('div', { className: 'swml-canvas-plan-section' });
                const qHeader = el('h4', {
                    style: { cursor: 'pointer', userSelect: 'none' },
                    innerHTML: '<span class="swml-guide-icon" style="color:#51dacf">' + SVG_GUIDE_BRAIN + '</span> Key Questions',
                });
                const qList = el('div', { style: { display: 'none' } });
                fbCfg.questions.forEach(q => {
                    qList.appendChild(el('p', { style: { fontSize: '12px', padding: '4px 0', color: 'rgba(255,255,255,0.65)' }, innerHTML: `<em>"${q}"</em>` }));
                });
                qHeader.addEventListener('click', () => {
                    qList.style.display = qList.style.display === 'none' ? 'block' : 'none';
                });
                qWrap.appendChild(qHeader);
                qWrap.appendChild(qList);
                rightPanel.appendChild(qWrap);
            }

            // v7.14.45: Completion buttons suppressed — LearnDash handles Mark Complete and navigation.

            // v7.14.48: Show Playlist button — appears when video player is dismissed
            const fbPlaylistBtn = build3DButton('Show Playlist', 'Loading...', () => {
                const taskKey = 'feedback_discussion';
                fetch(`${config.restUrl}resources?task=${encodeURIComponent(taskKey)}&step=0&board=${encodeURIComponent(state.board)}&subject=${encodeURIComponent(state.subject)}`, { headers })
                    .then(r => r.json())
                    .then(data => {
                        if (data?.videos?.length > 0 && window.wmlVideo) {
                            wmlVideo.open(data.videos, { size: 'medium' });
                            fbPlaylistBtn.style.display = 'none';
                        }
                    })
                    .catch(() => {});
            });
            fbPlaylistBtn.style.display = 'none'; // Hidden initially — shown when video player closes
            fbPlaylistBtn.style.marginTop = '16px';
            rightPanel.appendChild(fbPlaylistBtn);

            // Listen for video player close to show the re-trigger button
            const _fbVideoObserver = setInterval(() => {
                const playerEl = document.querySelector('.swml-video-player, .swml-video-overlay');
                if (!playerEl && fbPlaylistBtn.style.display === 'none' && fbPlaylistBtn._wasOpened) {
                    fbPlaylistBtn.style.display = '';
                }
                if (playerEl) fbPlaylistBtn._wasOpened = true;
            }, 1000);
            // Clean up observer when canvas closes
            const _fbCleanup = () => { clearInterval(_fbVideoObserver); };
            canvas.addEventListener('remove', _fbCleanup);

            // Auto-scroll to feedback section + open video player after document loads
            // Use polling instead of fixed timeout — async migration chain may not have finished
            // Account for transform: scale() on docWrap which distorts getBoundingClientRect
            let fbScrollAttempts = 0;
            const fbScrollInterval = setInterval(() => {
                fbScrollAttempts++;
                const target = editorEl?.querySelector('[data-section-type="divider"][data-section-label="FEEDBACK"]')
                    || editorEl?.querySelector('[data-section-label="FEEDBACK"]')
                    || editorEl?.querySelector('[data-section-type="feedback"]');
                if (target && contentWrap) {
                    clearInterval(fbScrollInterval);
                    // Use offsetTop chain for accurate position (immune to CSS transforms)
                    let scrollTarget = 0;
                    let node = target;
                    while (node && node !== contentWrap) {
                        scrollTarget += node.offsetTop;
                        node = node.offsetParent;
                    }
                    contentWrap.scrollTo({ top: Math.max(0, scrollTarget - 20), behavior: 'smooth' });
                } else if (fbScrollAttempts >= 10) {
                    clearInterval(fbScrollInterval);
                }
            }, 400);
            // Open floating video player
            setTimeout(() => {
                const taskKey = 'feedback_discussion';
                fetch(`${config.restUrl}resources?task=${encodeURIComponent(taskKey)}&step=0&board=${encodeURIComponent(state.board)}&subject=${encodeURIComponent(state.subject)}`, { headers })
                    .then(r => r.json())
                    .then(data => {
                        if (data?.videos?.length > 0 && window.wmlVideo) {
                            wmlVideo.open(data.videos, { size: 'medium' });
                        }
                    })
                    .catch(() => {});
            }, 1500);
        }
        // ── End Feedback Discussion Mode ──

        // ── Exam Prep Canvas Mode (v7.13.76) — REMOVED in v7.13.96: exam prep now uses the same
        // assessment chat infrastructure (canvasInAssessment = true). No separate branch needed.
        // The isExamPrep flag is still used for template loading and badge labels.
        else if (false && isExamPrep) { // DISABLED — exam prep flows through assessment path
            console.log('WML EXAM PREP: Entering exam prep canvas branch for task:', state.task);
            // Build protocol sidebar (left)
            const epProtoPanel = el('div', { className: 'swml-sidebar swml-canvas-proto' });
            const epProtoHead = el('div', { className: 'swml-sidebar-head' });
            epProtoHead.appendChild(el('span', { textContent: exerciseConfig.chatHeaderLabel || ucfirst(state.task) }));
            epProtoPanel.appendChild(epProtoHead);
            const epProtoBody = el('div', { className: 'swml-sidebar-body' });
            const epSteps = WML.getSteps();
            if (epSteps?.length) {
                epSteps.forEach(s => {
                    const c = s.step < state.step ? 'complete' : s.step === state.step ? 'active' : '';
                    epProtoBody.appendChild(el('div', { className: `swml-step ${c}`, 'data-step': s.step }, [
                        el('div', { className: `swml-step-circle ${c}`, textContent: s.step < state.step ? '\u2713' : s.step }),
                        el('span', { className: 'swml-step-label', textContent: s.label }),
                    ]));
                });
            }
            epProtoPanel.appendChild(epProtoBody);
            // Deferred insertion — canvas DOM isn't assembled yet, store for later
            canvas._epProtoPanel = epProtoPanel;

            // Build chat panel (right) — reuses canvas chat DOM pattern
            const epChatPanel = el('div', { className: 'swml-canvas-chat' });
            const epChatHeader = el('div', { className: 'swml-canvas-chat-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
            epChatHeader.appendChild(el('span', { innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;opacity:0.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ' + (exerciseConfig.chatHeaderLabel || ucfirst(state.task)) }));
            epChatPanel.appendChild(epChatHeader);

            const epChatMessages = el('div', { className: 'swml-canvas-chat-messages', id: 'swml-canvas-chat-messages' });
            epChatPanel.appendChild(epChatMessages);

            // Chat input
            const epInputWrap = el('div', { className: 'swml-canvas-chat-input', style: { display: 'flex', gap: '8px', padding: '8px 12px' } });
            const epChatTextarea = el('textarea', { id: 'swml-canvas-chat-input', rows: '1', placeholder: 'Type your response...' });
            epChatTextarea.addEventListener('input', () => { epChatTextarea.style.height = 'auto'; epChatTextarea.style.height = Math.min(epChatTextarea.scrollHeight, 120) + 'px'; });
            epChatTextarea.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); epSendMessage(); } });
            const epSendBtn = el('button', { className: 'swml-send-btn', innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>', onClick: () => epSendMessage() });
            epInputWrap.appendChild(epChatTextarea);
            epInputWrap.appendChild(epSendBtn);
            epChatPanel.appendChild(epInputWrap);

            // Replace rightPanel content with chat
            rightPanel.innerHTML = '';
            rightPanel.appendChild(epChatPanel);

            // Canvas chat history + messaging
            const epChatHistory = [];
            let epChatId = state.sessionId || '';

            function epAddMessage(role, content) {
                const bubble = el('div', { className: 'swml-bubble swml-bubble-' + role });
                const inner = el('div', { className: 'swml-bubble-content' });
                inner.innerHTML = role === 'assistant' ? WML.formatAI(content) : content.replace(/</g, '&lt;').replace(/\n/g, '<br>');
                bubble.appendChild(inner);
                epChatMessages.appendChild(bubble);
                epChatMessages.scrollTop = epChatMessages.scrollHeight;
            }

            async function epSendMessage() {
                const msg = epChatTextarea.value.trim();
                if (!msg) return;
                epChatTextarea.value = '';
                epChatTextarea.style.height = 'auto';
                epAddMessage('user', msg);
                epChatHistory.push({ role: 'user', content: msg });
                epSendBtn.disabled = true;

                // Typing indicator
                const typing = el('div', { className: 'swml-bubble swml-bubble-assistant swml-typing' });
                typing.appendChild(el('div', { className: 'swml-bubble-content', innerHTML: '<span class="swml-typing-dots"><span>.</span><span>.</span><span>.</span></span>' }));
                epChatMessages.appendChild(typing);
                epChatMessages.scrollTop = epChatMessages.scrollHeight;

                try {
                    const docContent = canvasEditor ? canvasEditor.getHTML() : '';
                    const historyToSend = epChatHistory.slice(0, -1).slice(-24);
                    const res = await WML.apiPost(WML.API.chat, {
                        message: msg,
                        history: historyToSend,
                        document_content: docContent,
                        session_id: epChatId || state.sessionId,
                        board: state.board,
                        subject: state.subject,
                        text: state.text,
                        task: state.task,
                        step: state.step,
                    });
                    typing.remove();
                    if (res.reply) {
                        epChatHistory.push({ role: 'assistant', content: res.reply });
                        epAddMessage('assistant', res.reply);
                        saveCanvasChat(epChatHistory, epChatId);
                    }
                    // Step progression from AI response
                    if (res.step && res.step > state.step) {
                        state.step = res.step;
                        epProtoBody.querySelectorAll('.swml-step').forEach(stepEl => {
                            const sn = parseInt(stepEl.dataset.step);
                            const circle = stepEl.querySelector('.swml-step-circle');
                            stepEl.className = 'swml-step ' + (sn < state.step ? 'complete' : sn === state.step ? 'active' : '');
                            if (circle) { circle.className = 'swml-step-circle ' + (sn < state.step ? 'complete' : sn === state.step ? 'active' : ''); circle.textContent = sn < state.step ? '\u2713' : sn; }
                        });
                    }
                } catch (e) {
                    typing.remove();
                    epAddMessage('assistant', 'Sorry, something went wrong. Please try again.');
                    console.error('Exam prep chat error:', e);
                }
                epSendBtn.disabled = false;
                epChatTextarea.focus();
            }

            // Load saved chat or send greeting
            (() => {
                const saved = loadCanvasChat();
                if (saved?.history?.length) {
                    saved.history.forEach(m => { epChatHistory.push(m); epAddMessage(m.role, m.content); });
                    if (saved.chatId) epChatId = saved.chatId;
                    console.log('WML Exam Prep: Resumed chat with', saved.history.length, 'messages');
                } else {
                    // Auto-send greeting to start the exercise
                    setTimeout(() => {
                        epChatTextarea.value = "Let's begin!";
                        epSendMessage();
                    }, 500);
                }
            })();
        }

        else if (hasPlan) {
            // Redraft mode — show plan
            rightPanel.appendChild(el('h3', { textContent: '📋 Your Plan' }));
            planSections.forEach(s => {
                const val = planData[s.key];
                if (val) {
                    const section = el('div', { className: 'swml-canvas-plan-section' });
                    section.appendChild(el('h4', { textContent: s.title }));
                    section.appendChild(el('p', { textContent: typeof val === 'string' ? val : JSON.stringify(val) }));
                    rightPanel.appendChild(section);
                }
            });
        } else if (isCwWorkbook) {
            // v7.13.34: CW Workbook mode — step-specific guidance
            rightPanel.appendChild(el('h3', {
                innerHTML: '<span class="swml-sidebar-close-icon">−</span> ' + (cwStepDef?.label || 'Workbook Exercise'),
                style: { cursor: 'pointer' }
            }));
            const cwGuidanceContent = el('div', { className: 'swml-canvas-guidance' });

            const cwTips = [
                { icon: SVG_GUIDE_WRITING, colour: '#5333ed', text: 'This is a workbook exercise. Work through the content in the document at your own pace.' },
                { icon: SVG_GUIDE_BRAIN, colour: '#51dacf', text: 'Use the toolbar to format your writing. Your work saves automatically.' },
                { icon: SVG_GUIDE_TARGET, colour: '#4D76FD', text: 'When you\'re finished, click "Mark Complete" to save your progress and move to the next step.' },
            ];

            cwTips.forEach(t => {
                const tip = el('div', { className: 'swml-canvas-plan-section' });
                tip.appendChild(el('p', { innerHTML: `<span class="swml-guide-icon" style="color:${t.colour}">${t.icon}</span> ${t.text}` }));
                cwGuidanceContent.appendChild(tip);
            });
            rightPanel.appendChild(cwGuidanceContent);

            // CW workbook Mark Complete button
            const cwCompleteBtn = el('button', {
                className: 'swml-go-assess-btn',
                textContent: 'Mark Complete',
                onClick: async () => {
                    // Save artifact
                    const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                    if (artifactKey && state.cwProjectId && canvasEditor) {
                        const content = canvasEditor.getHTML();
                        await WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, content);
                    }
                    // Mark step complete
                    if (state.cwProjectId) {
                        const stepKey = cwStepDef?.step ? 'step_' + cwStepDef.step : cwStepDef?.id;
                        await WML.cwProject.markStepComplete(state.cwProjectId, stepKey);
                    }
                    cwCompleteBtn.textContent = 'Complete';
                    cwCompleteBtn.disabled = true;
                    cwCompleteBtn.style.opacity = '0.5';
                    showToast('Step complete! Your work has been saved.');
                    // Return to dashboard after brief delay
                    setTimeout(() => {
                        if (WML.renderCreativeWritingDashboard) WML.renderCreativeWritingDashboard();
                    }, 1500);
                }
            });
            cwCompleteBtn.style.marginTop = '16px';
            rightPanel.appendChild(cwCompleteBtn);

            // Back to steps button
            rightPanel.appendChild(el('button', {
                className: 'swml-back-link',
                textContent: '← Back to Steps',
                style: { marginTop: '8px' },
                onClick: () => {
                    if (canvasEditor) saveCanvasContent();
                    const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                    if (artifactKey && state.cwProjectId && canvasEditor) {
                        WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, canvasEditor.getHTML()).catch(() => {});
                    }
                    if (WML.renderCreativeWritingDashboard) WML.renderCreativeWritingDashboard();
                }
            }));
        } else if (useTrainingEnv) {
            // ── v7.14.48: Training-environment direct rendering ──
            // Exercises with environment:'training' (assessment, mark_scheme, planning, polishing, exam_prep, CW SI)
            // build chat + sidebar panels DIRECTLY — no diagnostic canvas, no flash, no auto-trigger.
            const _assessBtnRef = { value: null };
            const tp = buildTrainingPanels({
                canvas, canvasEditor, exerciseConfig,
                boardLabel, subjectLabel, textLabel,
                isCwTask, cwStepDef, isCwSi, isExamPrep,
                canvasInMarkScheme, canvasInFeedback,
                canvasChatHeaderLabel, canvasSidebarSteps,
                assessCompleteBtnRef: _assessBtnRef,
            });
            assessCompleteBtn = _assessBtnRef.value;

            // Insert panels directly — no animation needed, they render with the canvas
            canvas.insertBefore(tp.protoPanel, editorPane);
            canvas.appendChild(tp.chatResizeHandle);
            canvas.appendChild(tp.chatPanel);

            // Reveal resize handle
            tp.chatResizeHandle.style.transition = 'opacity 0.5s ease';
            tp.chatResizeHandle.style.opacity = '1';

            // rightPanel is not used in training env — hide it
            rightPanel.style.display = 'none';

            // Set assessment mode state
            state.step = 0;
            if (state.task !== 'mark_scheme' && state.task !== 'planning' && state.task !== 'polishing' && !(state.task && state.task.startsWith('cw_')) && !isExamPrep) state.task = 'assessment';

            // ── Chat persistence: resume or fresh start ──
            // Deferred until TipTap editor initialises + template loads
            const _initTrainingChat = async () => {
                let savedChat = loadCanvasChat();
                const skipServerChat = state.task && state.task.startsWith('cw_');
                if (!skipServerChat && (!savedChat || !savedChat.history || savedChat.history.length === 0)) {
                    try {
                        const _chatSuffix = WML.getExerciseConfig(state.task).storageSuffix || '';
                        const chatUrl = `${API.chatLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topicNumber=${state.topicNumber || ''}&suffix=${encodeURIComponent(_chatSuffix)}`;
                        const serverChat = await fetch(chatUrl, { headers }).then(r => r.json());
                        if (serverChat.success && serverChat.chat && serverChat.chat.history && serverChat.chat.history.length > 0) {
                            savedChat = serverChat.chat;
                            console.log('WML Training: Chat loaded from server (localStorage empty)');
                        }
                    } catch (e) { console.log('WML Training: Server chat load unavailable'); }
                }
                // Discard stale chats
                if (savedChat && savedChat.task && savedChat.task !== state.task) {
                    console.log('WML Training: Discarding stale chat — saved task:', savedChat.task, 'current task:', state.task);
                    savedChat = null;
                    try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                }
                if (isExamPrep && savedChat && savedChat.history && savedChat.history.length > 0) {
                    const firstAI = savedChat.history.find(m => m.role === 'assistant');
                    if (firstAI && firstAI.content.includes('assessment phase')) {
                        console.log('WML Training: Discarding stale assessment chat from exam prep exercise');
                        savedChat = null;
                        try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                    }
                }
                if (canvasInMarkScheme && savedChat && savedChat.history && savedChat.history.length > 0) {
                    console.log('WML Training: Discarding saved mark_scheme chat — protocol must drive from scratch');
                    savedChat = null;
                    try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                }
                if (isCwSi && savedChat && savedChat.history && savedChat.history.length > 0) {
                    const firstAI = savedChat.history.find(m => m.role === 'assistant');
                    if (firstAI && firstAI.content.includes('assessment phase')) {
                        console.log('WML Training: Discarding stale assessment chat from CW exercise');
                        savedChat = null;
                        try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                    }
                }
                const hasSavedChat = savedChat && savedChat.history && savedChat.history.length > 0;

                // Unified assessment state initialiser
                async function initAssessmentState() {
                    if (state.task !== 'assessment' && state.task !== 'redraft_assessment' && !isCwSi && !isExamPrep) return;
                    const allAiMsgs = tp.canvasChatHistory.filter(m => m.role === 'assistant');
                    let maxStep = allAiMsgs.length > 0 ? 1 : 0;
                    let sessionComplete = false;
                    allAiMsgs.forEach(msg => {
                        const detected = detectAssessmentStep(msg.content);
                        if (detected.step > maxStep) maxStep = detected.step;
                        if (detected.isComplete) {
                            sessionComplete = true;
                            if (!state.plan.total_score && detected.totalScore) state.plan.total_score = detected.totalScore;
                            if (!state.plan.grade && detected.grade) state.plan.grade = detected.grade;
                        }
                    });
                    if (maxStep > state.step) {
                        updateProgress(maxStep);
                        console.log('WML initAssessmentState: Sidebar → step', maxStep);
                    }
                    if (state._phaseMarkedComplete) return;
                    try {
                        const phaseUrl = `${API.phaseStatus}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${state.topicNumber || 1}`;
                        const phaseRes = await apiGet(phaseUrl);
                        const currentPhase = state.phase === 'redraft' ? 'redraft' : 'initial';
                        if (phaseRes[currentPhase]?.status === 'complete') {
                            state._phaseMarkedComplete = true;
                            console.log('WML initAssessmentState: Phase already complete');
                            return;
                        }
                    } catch (e) { /* phase check failed */ }
                    const isComplete = sessionComplete || (state.plan.total_score && state.plan.grade) || maxStep >= 8;
                    if (isComplete && assessCompleteBtn) {
                        assessCompleteBtn.style.display = '';
                        assessCompleteBtn.classList.add('swml-assess-ready');
                        console.log('WML initAssessmentState: Mark Complete → VISIBLE (restored)');
                    }
                }

                if (hasSavedChat) {
                    // Resume saved chat
                    console.log('WML Training: Resuming chat with', savedChat.count, 'messages');
                    savedChat.history.forEach(msg => {
                        if (msg.role === 'assistant') {
                            const clean = stripAIInternals(msg.content);
                            tp.addChatMessage(formatAI(clean), 'ai', clean);
                        } else if (msg.role === 'user') {
                            tp.addChatMessage(msg.content, 'user');
                        }
                        tp.canvasChatHistory.push(msg);
                    });
                    if (savedChat.chatId) tp.canvasChatId = savedChat.chatId;

                    await initAssessmentState();

                    const lastAI = savedChat.history.filter(m => m.role === 'assistant').pop();
                    if (lastAI) {
                        try {
                            const lastUser = savedChat.history.filter(m => m.role === 'user').pop();
                            await refreshPlan();
                            await extractAndSavePlan(lastUser?.content || '', lastAI.content);
                            await initAssessmentState();
                        } catch (err) { console.warn('WML Training: extraction chain failed:', err); }
                    }

                    // Restore grade buttons if only greeting exists
                    const userMsgs = savedChat.history.filter(m => m.role === 'user');
                    const aiMsgs = savedChat.history.filter(m => m.role === 'assistant');
                    if (state.task === 'assessment' && !canvasInMarkScheme && !canvasInFeedback && !isCwTask
                        && aiMsgs.length === 1 && userMsgs.length === 0) {
                        setTimeout(() => {
                            const lastBubble = tp.chatMessages.lastElementChild;
                            if (lastBubble && !lastBubble.querySelector('.swml-quick-actions')) {
                                const gradeBar = el('div', { className: 'swml-quick-actions' });
                                ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                                    gradeBar.appendChild(el('button', {
                                        className: 'swml-quick-btn',
                                        textContent: g,
                                        onClick: () => { gradeBar.remove(); tp.chatTextarea.value = g; tp.sendCanvasMessage(); }
                                    }));
                                });
                                const bc = lastBubble.querySelector('.swml-bubble-content') || lastBubble;
                                bc.appendChild(gradeBar);
                                console.log('WML: Restored grade buttons on resumed greeting');
                            }
                        }, 100);
                    }

                    setTimeout(() => { tp.chatMessages.scrollTop = tp.chatMessages.scrollHeight; }, 150);
                } else if (isCwSi) {
                    // CW SI greeting — same as transition handler
                    setTimeout(async () => {
                    const firstName = (config.userName || '').split(' ')[0] || 'there';
                    const stepLabel = cwStepDef?.label || 'this step';
                    const stepNum = cwStepDef?.step || cwStepDef?.trial || '';
                    const projectId = state.cwProjectId;

                    // Load predecessor draft
                    const draftPredKey = WML.CW_DRAFT_PREDECESSOR[cwStepDef?.step];
                    if (draftPredKey && projectId) {
                        try {
                            const predArtifact = await WML.cwProject.loadArtifact(projectId, draftPredKey);
                            if (predArtifact?.success && predArtifact.value && canvasEditor) {
                                canvasEditor.commands.setContent(predArtifact.value);
                            }
                        } catch (e) { console.log('WML CW: No predecessor draft to load'); }
                    }

                    // Load plot outline for update steps
                    const plotUpdateSteps = [11, 14, 17, 20, 23, 26];
                    if (plotUpdateSteps.includes(cwStepDef?.step) && projectId) {
                        try {
                            const plotArtifact = await WML.cwProject.loadArtifact(projectId, 'plot_outline');
                            if (plotArtifact?.success && plotArtifact.value && canvasEditor) {
                                canvasEditor.commands.setContent(plotArtifact.value);
                            }
                        } catch (e) { console.log('WML CW: No plot outline to load'); }
                    }

                    // Load dependency artifacts
                    const cwDependencies = {
                        2: ['writer_profile'], 3: ['writer_profile', 'story_ideas'],
                        4: ['logline'], 5: ['brief_outline'], 6: ['plot_structure_choice'],
                        8: ['plot_outline'], 9: ['plot_outline', 'scene_selection'],
                    };
                    const deps = cwDependencies[cwStepDef?.step];
                    let missingPrereq = null;
                    if (deps && projectId) {
                        for (const depKey of deps) {
                            try {
                                const depArtifact = await WML.cwProject.loadArtifact(projectId, depKey);
                                if (depArtifact?.success && depArtifact.value) {
                                    const depLabel = depKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    tp.canvasChatHistory.push({ role: 'user', content: `[CONTEXT FROM PREVIOUS STEP] ${depLabel}:\n\n${depArtifact.value}` });
                                } else if (!missingPrereq) {
                                    missingPrereq = depKey;
                                }
                            } catch (e) {
                                if (!missingPrereq) missingPrereq = depKey;
                            }
                        }
                    }

                    // Step-aware greeting
                    const cwPrevContext = {
                        1: 'This is the starting point of your creative writing journey.',
                        2: 'In Step 1, you built your Writer\u2019s Profile. Now we\u2019ll look outward for a spark.',
                        3: 'In Step 2, you explored story ideas. Now we\u2019ll distil your favourite into a logline.',
                        4: 'In Step 3, you crafted your logline. Now we\u2019ll give it a skeleton.',
                        5: 'In Step 4, you outlined your story. Now we\u2019ll choose the plot structure.',
                        6: 'In Step 5, you chose your plot structure. Now we\u2019ll build a detailed plot outline.',
                        7: 'In Step 6, you built your plot outline. Now we\u2019ll explore your story\u2019s values.',
                        8: 'You\u2019ve built your plot outline and explored values. Now choose your scene(s).',
                        9: 'You\u2019ve chosen your scene(s). Now write your first draft.',
                    };
                    const prevCtx = cwPrevContext[stepNum] || `Let\u2019s continue with **${stepLabel}**.`;
                    const introLine = `Welcome to Step ${stepNum}: **${stepLabel}**\n\n${prevCtx}`;
                    let greetingText;
                    if (missingPrereq && stepNum > 1) {
                        const prereqLabel = missingPrereq.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        const prereqStep = missingPrereq === 'writer_profile' ? 1 : missingPrereq === 'story_ideas' ? 2 : missingPrereq === 'logline' ? 3 : missingPrereq === 'brief_outline' ? 4 : missingPrereq === 'plot_structure_choice' ? 5 : missingPrereq === 'plot_outline' ? 6 : stepNum - 1;
                        greetingText = `Welcome to Step ${stepNum}: **${stepLabel}**\n\nIt looks like you haven\u2019t completed **Step ${prereqStep}** yet \u2014 I need your **${prereqLabel}** from that step before we can begin this one.\n\nPlease go back to **Step ${prereqStep}** and complete it first.`;
                    } else if (stepNum === 1) {
                        greetingText = `${introLine}\n\nIn this course, you\u2019ll experience what it\u2019s like to create a story from the inside \u2014 the **Inside Out** technique.\n\nWhen you\u2019re ready, hit the button below and let\u2019s get started.`;
                    } else {
                        greetingText = `${introLine}\n\nWhen you\u2019re ready, hit the button below and let\u2019s get started.`;
                    }
                    tp.addChatMessage(formatAI(greetingText), 'ai', greetingText);
                    tp.canvasChatHistory.push({ role: 'assistant', content: greetingText });
                    saveCanvasChat(tp.canvasChatHistory, tp.canvasChatId);

                    setTimeout(() => {
                        const startBar = el('div', { className: 'swml-quick-actions' });
                        if (missingPrereq && stepNum > 1) {
                            startBar.appendChild(el('button', { className: 'swml-quick-btn', textContent: 'Back to Steps',
                                onClick: () => { startBar.remove(); closeCanvasOverlay(); WML.renderCreativeWritingDashboard(); }
                            }));
                        } else {
                            startBar.appendChild(el('button', { className: 'swml-quick-btn', textContent: "Let's begin",
                                onClick: () => { startBar.remove(); tp.chatTextarea.value = "Let's begin!"; tp.sendCanvasMessage(); }
                            }));
                        }
                        const greetBubble = tp.chatMessages.lastElementChild;
                        if (greetBubble) {
                            const bc = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                            bc.appendChild(startBar);
                        }
                    }, 50);
                    }, 400);
                } else if (state.task === 'assessment') {
                    // Assessment greeting — grade target question
                    setTimeout(() => {
                    const assessTextName = state.textName || state.text || 'your text';
                    const assessWc = getResponseWordCount(canvasEditor);
                    const questionText = extractEssayQuestion(canvasEditor);
                    if (questionText) state.question = questionText;
                    const questionSnippet = questionText ? `\n\nYour essay question: **${questionText}**` : '';
                    const questionHTML = questionText ? `<div style="margin-bottom:12px;padding:10px 14px;background:rgba(81,218,207,0.06);border-left:3px solid rgba(81,218,207,0.3);border-radius:0 8px 8px 0"><p style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px">Your essay question:</p><p style="font-size:13px;font-style:italic">${questionText}</p></div>` : '';
                    const firstName = (config.userName || '').split(' ')[0] || 'there';
                    const assessEssayLabel = (state.mode === 'exam_prep') ? `${assessTextName} essay` : `${assessTextName} diagnostic essay`;
                    const greetingText = `Hi ${firstName}! Welcome to the assessment phase. I've received your ${assessEssayLabel} (${assessWc} words). Let's review your writing together.${questionSnippet}\n\nBefore I begin marking, I need to know: what grade are you aiming for? This helps me tailor my feedback to where you want to be.`;
                    const infoNote = '<div style="margin-bottom:14px;padding:10px 14px;background:rgba(83,51,237,0.08);border-left:3px solid rgba(83,51,237,0.3);border-radius:0 8px 8px 0;font-size:12px;color:rgba(255,255,255,0.6)">This assessment takes approximately <strong style="color:rgba(255,255,255,0.8)">20-25 minutes</strong>. Complete all 8 steps to receive your full score, grade, and personalised feedback.</div>';
                    tp.addChatMessage(`${infoNote}<div style="margin-bottom:12px"><p>Hi <strong>${firstName}</strong>! Welcome to the assessment phase.</p></div><div style="margin-bottom:12px"><p>I've received your <strong>${assessTextName}</strong> ${(state.mode === 'exam_prep') ? 'essay' : 'diagnostic essay'} (<strong>${assessWc} words</strong>). Let's review your writing together.</p></div>${questionHTML}<p>Before I begin marking, I need to know: <strong>what grade are you aiming for?</strong> This helps me tailor my feedback to where you want to be.</p>`, 'ai', greetingText);
                    tp.canvasChatHistory.push({ role: 'assistant', content: greetingText });
                    saveCanvasChat(tp.canvasChatHistory, tp.canvasChatId);

                    setTimeout(() => {
                        const gradeBar = el('div', { className: 'swml-quick-actions' });
                        ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                            gradeBar.appendChild(el('button', {
                                className: 'swml-quick-btn',
                                textContent: g,
                                onClick: () => { gradeBar.remove(); tp.chatTextarea.value = g; tp.sendCanvasMessage(); }
                            }));
                        });
                        const greetBubble = tp.chatMessages.lastElementChild;
                        if (greetBubble) {
                            const bubbleContent = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                            bubbleContent.appendChild(gradeBar);
                        }
                    }, 50);
                    initAssessmentState();
                    }, 200);
                } else if (canvasInMarkScheme) {
                    // v7.14.50: Mark scheme — welcome message explaining why this matters, then silent auto-send
                    const msFirstName = (config.userName || '').split(' ')[0] || 'there';
                    const msGreeting = `Hi ${msFirstName}! Welcome to your **Mark Scheme Assessment**.\n\nUnderstanding the marking criteria is one of the most powerful ways to improve your grades. Many students lose marks in exams not because they can\u2019t write well, but because they forget what the examiner is actually looking for.\n\nThis quiz will test your knowledge of how essays are marked against the assessment objectives. Your results will help you see exactly which criteria to focus on in your next essay.\n\nWhen you\u2019re ready, I\u2019ll start with Question 1.`;
                    tp.addChatMessage(formatAI(msGreeting), 'ai', msGreeting);
                    tp.canvasChatHistory.push({ role: 'assistant', content: msGreeting });
                    saveCanvasChat(tp.canvasChatHistory, tp.canvasChatId);

                    // Quick action: "Let's begin"
                    setTimeout(() => {
                        const startBar = el('div', { className: 'swml-quick-actions' });
                        startBar.appendChild(el('button', { className: 'swml-quick-btn', textContent: "Let's begin",
                            onClick: () => { startBar.remove(); canvasSilentSend = true; tp.chatTextarea.value = "Let's begin the mark scheme quiz."; tp.sendCanvasMessage(); }
                        }));
                        const greetBubble = tp.chatMessages.lastElementChild;
                        if (greetBubble) {
                            const bc = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                            bc.appendChild(startBar);
                        }
                    }, 50);
                } else {
                    // All other training-env exercises: silent auto-send (protocol drives greeting)
                    setTimeout(() => {
                        console.log('WML Training: Silent auto-send for', state.task);
                        if (tp.chatTextarea) { canvasSilentSend = true; tp.chatTextarea.value = "Let's begin!"; tp.sendCanvasMessage(); }
                    }, 400);
                }

                // Scroll document to top
                setTimeout(() => {
                    const editor = document.getElementById('swml-tiptap-editor');
                    const scrollContainer = editor?.closest('.swml-canvas-content');
                    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }, 600);
            };

            // Defer chat init until after template loads (editor needs content for word count etc.)
            // Using the same timing as the transition handler — templates load by ~800ms
            setTimeout(_initTrainingChat, 800);

            console.log('WML: Training-env direct render for', state.task, '(no diagnostic flash)');
        } else {
            // Diagnostic mode — guidance tips
            rightPanel.appendChild(el('h3', {
                innerHTML: '<span class="swml-sidebar-close-icon">−</span> Diagnostic Guidance',
                style: { cursor: 'pointer' }
            }));
            const guidanceContent = el('div', { className: 'swml-canvas-guidance' });

            function getWordGuidanceText() {
                if (canvasDualTargets) {
                    const { partA, partB } = canvasDualTargets;
                    return `This is a two-part question. Part A: aim for ${partA.target} words (${partA.marks} marks). Part B: aim for ${partB.target} words (${partB.marks} marks). A "Mark Complete" button will appear once you reach the combined minimum.`;
                }
                return `Aim for ${canvasWordTarget} words. Once you reach ${canvasWordMinimum} words, a "Mark Complete" button will appear — but push for ${canvasWordTarget} if you can.`;
            }

            const tips = [
                { icon: SVG_GUIDE_LOCK, colour: '#5333ed', text: 'This is your independent assessment. No help is available — no AI, no notes, no resources. Rely entirely on what you\'ve learned.' },
                { icon: SVG_GUIDE_BRAIN, colour: '#51dacf', text: 'Try to recall everything you were taught. Extract your best knowledge and put it on the page.' },
                { icon: SVG_GUIDE_TARGET, colour: '#4D76FD', text: getWordGuidanceText(), id: 'swml-guide-word-target' },
                { icon: SVG_GUIDE_STOPWATCH, colour: '#51dacf', text: 'Work efficiently. Get your ideas down as quickly as possible to the best of your ability.' },
                { icon: SVG_GUIDE_ARM, colour: '#1CD991', text: 'Don\'t worry about grades. The purpose is to diagnose your strengths and areas for development, so we can build on them and eliminate weaknesses.' },
                { icon: SVG_GUIDE_WRITING, colour: '#5333ed', text: 'Write the very best you know at this moment. Structure: Introduction → 3 Body Paragraphs → Conclusion.' },
            ];

            tips.forEach(t => {
                const tip = el('div', { className: 'swml-canvas-plan-section' });
                const p = el('p', { innerHTML: `<span class="swml-guide-icon" style="color:${t.colour}">${t.icon}</span> ${t.text}` });
                if (t.id) p.id = t.id;
                tip.appendChild(p);
                guidanceContent.appendChild(tip);
            });
            rightPanel.appendChild(guidanceContent);

            // Session timestamp + countdown
            const startKey = `swml_diag_start_${state.board}_${(state.text || '').replace(/\s/g, '_')}`;
            let startTime = localStorage.getItem(startKey);
            if (!startTime) {
                startTime = new Date().toISOString();
                localStorage.setItem(startKey, startTime);
            }
            const startDate = new Date(startTime);
            const deadlineDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000);

            function formatRelativeTime(date) {
                const diff = Date.now() - date.getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) return 'Just now';
                if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
                const hrs = Math.floor(mins / 60);
                if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
                const days = Math.floor(hrs / 24);
                if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
                const weeks = Math.floor(days / 7);
                return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
            }

            function formatCountdown() {
                const remaining = deadlineDate.getTime() - Date.now();
                if (remaining <= 0) return { text: 'Overdue', pct: 100, colour: '#dc2626', animated: false };
                const daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000));
                const pct = Math.min(100, Math.round(((10 - daysLeft) / 10) * 100));
                // 6+ days: animated teal/blue, 3-5: yellow, 1-2: orange, overdue: red
                if (daysLeft <= 2) return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`, pct, colour: '#E67E22', animated: false };
                if (daysLeft <= 5) return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`, pct, colour: '#F1C40F', animated: false };
                return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`, pct, colour: '#51dacf', animated: true };
            }

            const timeWrap = el('div', { className: 'swml-canvas-plan-section' });
            timeWrap.appendChild(el('h4', { innerHTML: '<span class="swml-guide-icon" style="color:#51dacf">' + SVG_GUIDE_STOPWATCH + '</span> Session' }));
            const startedLabel = el('p', { textContent: `Started: ${formatRelativeTime(startDate)}` });
            timeWrap.appendChild(startedLabel);
            const countdown = formatCountdown();
            const deadlineBar = el('div', { className: 'swml-canvas-progress-bar' });
            const deadlineFill = el('div', { className: 'swml-canvas-progress-fill', id: 'swml-deadline-fill' });
            // Apply animation or static color
            if (countdown.animated) {
                deadlineFill.style.cssText = 'height:100%;border-radius:3px;background:linear-gradient(270deg,#42a1ec,#4d76fd,#7DF9E9,#4d76fd);background-size:800% 800%;animation:swmlProgressShimmer 20s ease infinite;';
            }
            // Defer width set so transition animates from 0%
            requestAnimationFrame(() => requestAnimationFrame(() => {
                deadlineFill.style.width = countdown.pct + '%';
                if (!countdown.animated) deadlineFill.style.background = countdown.colour;
            }));
            deadlineBar.appendChild(deadlineFill);
            timeWrap.appendChild(deadlineBar);
            const deadlineLabel = el('p', { style: { fontSize: '11px', marginTop: '2px' } });
            deadlineLabel.textContent = countdown.text;
            timeWrap.appendChild(deadlineLabel);
            timeWrap.appendChild(el('p', {
                style: { fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', fontStyle: 'italic' },
                textContent: 'The faster you finish, the sooner you\'ll receive feedback and start improving.'
            }));
            rightPanel.appendChild(timeWrap);

            // Word target progress
            const progressWrap = el('div', { className: 'swml-canvas-plan-section', id: 'swml-canvas-wc-progress' });
            progressWrap.appendChild(el('h4', { innerHTML: '<span class="swml-guide-icon" style="color:#4D76FD">' + SVG_GUIDE_GRAPH + '</span> Word Count Target' }));
            const progressBar = el('div', { className: 'swml-canvas-progress-bar' });
            const progressFill = el('div', { className: 'swml-canvas-progress-fill', id: 'swml-canvas-progress-fill' });
            diagProgressFill = progressFill;
            progressBar.appendChild(progressFill);
            progressWrap.appendChild(progressBar);
            const wcLabel = el('p', { id: 'swml-canvas-wc-label', textContent: `0 / ${canvasWordTarget} words` });
            diagWcLabel = wcLabel;
            progressWrap.appendChild(wcLabel);
            rightPanel.appendChild(progressWrap);

            // Mark Complete button — hidden until 450 words
            const markCompleteBtn = el('button', {
                className: 'swml-canvas-complete-btn',
                id: 'swml-canvas-complete-btn',
                style: { display: 'none' },
                textContent: '',
            });
            // Use SVG check icon instead of emoji
            const SVG_COMPLETE_CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M5 12l5 5L20 7"/></svg>';
            markCompleteBtn.innerHTML = SVG_COMPLETE_CHECK + ' Mark Complete';
            markCompleteBtn.addEventListener('click', () => {
                    // Show confirmation modal
                    const modalOverlay = el('div', { className: 'swml-confirm-overlay' });
                    const modal = el('div', { className: 'swml-confirm-modal' });
                    modal.innerHTML = `
                        <div class="swml-confirm-icon">${SVG_ICON_SAVE.replace('width="14"', 'width="32"').replace('height="14"', 'height="32"')}</div>
                        <h3>Ready to submit?</h3>
                        <p>Your essay will be saved${WML.isEmbedded ? ' and marked as complete.' : ' and you\'ll move on to the <strong>assessment phase</strong>, where the AI will walk you through detailed feedback on your writing.'}</p>
                        <p style="font-size:12px;opacity:0.6;">You won't be able to edit your essay after this point.</p>
                        <div class="swml-confirm-actions">
                            <button class="swml-confirm-cancel">← Keep writing</button>
                            <button class="swml-confirm-submit">Yes, submit for assessment</button>
                        </div>
                    `;
                    modal.querySelector('.swml-confirm-cancel').addEventListener('click', () => modalOverlay.remove());
                    modal.querySelector('.swml-confirm-submit').addEventListener('click', () => {
                        if (canvasEditor) saveCanvasContent();
                        modalOverlay.remove();

                        // ── Persist diagnostic submitted flag for re-entry detection (v7.12.32) ──
                        try { localStorage.setItem(`swml_diag_submitted_${state.board}_${state.text}_${state.topicNumber || 'free'}`, '1'); } catch (e) {}

                        // ── Diagnostic submitted — turn deadline bar green + disable button (v7.12.28) ──
                        const dlFill = document.getElementById('swml-deadline-fill');
                        if (dlFill) dlFill.style.cssText = 'height:100%;border-radius:3px;width:100%;background:#1CD991;animation:none;transition:background 0.6s ease;';
                        if (diagCompleteBtn) {
                            diagCompleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M5 12l5 5L20 7"/></svg> Complete';
                            diagCompleteBtn.disabled = true;
                            diagCompleteBtn.style.opacity = '0.5';
                            diagCompleteBtn.style.cursor = 'default';
                        }

                        // v7.14.41: In embedded mode, exercises are standalone — no assessment transition.
                        // Mark Complete just saves and shows "Complete" state. LD handles navigation.
                        if (WML.isEmbedded) {
                            console.log('WML Embedded: Diagnostic complete — no assessment transition (LD handles sequencing)');
                            return;
                        }

                        // ── ASSESSMENT TRANSITION (standalone mode only) ──
                        // 1. Keep canvas editable (student may want to fix things during assessment)

                        // 2. Fade out diagnostic guidance content
                        rightPanel.classList.add('swml-canvas-plan-fading');
                        // Fade header badges smoothly
                        const ctxEl = canvas.querySelector('.swml-canvas-ctx');
                        if (ctxEl) { ctxEl.style.transition = 'opacity 0.4s ease'; ctxEl.style.opacity = '0'; }
                        const diagBadge = canvas.querySelector('.swml-canvas-ctx-diag');
                        if (diagBadge) { diagBadge.style.transition = 'opacity 0.4s ease'; diagBadge.style.opacity = '0'; }

                        // 3. After content fully fades, collapse + build assessment (v7.12.47)
                        setTimeout(() => {
                            rightPanel.classList.add('swml-canvas-plan-hidden');
                            if (ctxEl) ctxEl.style.display = 'none';
                            if (diagBadge) diagBadge.style.display = 'none';
                            // v7.14.10: Reveal assessment sections (feedback, scores, etc.)
                            canvas.classList.remove('swml-canvas-diagnostic');

                            // Build + insert assessment panels at SAME time as diagnostic collapse
                            {

                        // 3. Build left protocol panel — exact match to existing sidebar
                        const protoPanel = el('div', { className: 'swml-sidebar swml-canvas-proto' });

                        // Logo + collapse button (uses existing .collapsed class)
                        const protoHead = el('div', { className: 'swml-sidebar-head', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
                        protoHead.appendChild(renderLogo ? renderLogo() : el('span'));
                        const protoCollapseBtn = el('button', { className: 'swml-collapse-btn', textContent: '◀', title: 'Collapse sidebar' });
                        protoCollapseBtn.addEventListener('click', () => {
                            protoPanel.classList.toggle('collapsed');
                            const isC = protoPanel.classList.contains('collapsed');
                            protoCollapseBtn.textContent = isC ? '▶' : '◀';
                            protoCollapseBtn.title = isC ? 'Expand sidebar' : 'Collapse sidebar';
                        });
                        protoHead.appendChild(protoCollapseBtn);
                        protoPanel.appendChild(protoHead);

                        // Body wrapper (matches original sidebar structure)
                        const protoBody = el('div', { className: 'swml-sidebar-body' });

                        // Badges — v7.13.52: CW exercises show single "Creative Writing" badge instead of board/subject/text
                        const protoBadges = el('div', { className: 'swml-sidebar-badges' });
                        if (isCwTask) {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Creative Writing Masterclass' }));
                            // v7.13.58: Show project name in sidebar (synchronous from state)
                            if (state.cwProjectName) {
                                const nameEl = el('span', { className: 'swml-sidebar-badge', textContent: '\u201c' + state.cwProjectName + '\u201d', style: { fontStyle: 'italic', opacity: '0.7' } });
                                protoBadges.appendChild(nameEl);
                            }
                        } else {
                            [boardLabel, subjectLabel, textLabel].filter(Boolean).forEach(b =>
                                protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: b }))
                            );
                        }
                        // Topic / mode badge
                        // v7.14.47: Mark scheme always shows topic if available, never "Exam Practice"
                        if (state.topicNumber && (state.mode === 'guided' || canvasInMarkScheme)) {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: `Topic ${state.topicNumber}` }));
                        } else if (state.mode === 'exam_prep' && !canvasInMarkScheme) {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Exam Practice' }));
                        }
                        // v7.14.41: Context-aware task label — mastery uses redraft names, free practice uses manifest label
                        const sidebarTaskLabel = (state.task === 'planning' && state.mode === 'guided') ? 'Plan Redraft'
                            : (state.task === 'polishing' && state.mode === 'guided') ? 'Polish Redraft'
                            : exerciseConfig.label || 'Assessment';
                        protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge active', textContent: sidebarTaskLabel }));
                        const BTP_PHASE_LABELS = { initial: 'Phase 1', redraft: 'Phase 2', preliminary: 'Preliminary', free_practice: 'Free Practice', exam_practice: 'Exam Practice' };
                        const btpPhaseLabel = BTP_PHASE_LABELS[state.phase] || '';
                        if (btpPhaseLabel) {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: btpPhaseLabel }));
                        }
                        protoBody.appendChild(protoBadges);

                        // Protocol Progress label — v7.13.35: CW shows step name
                        const progressLabel = isCwTask ? `Step ${cwStepDef?.step || ''} Progress` : 'Protocol Progress';
                        protoBody.appendChild(el('div', { className: 'swml-sidebar-section-label', textContent: progressLabel }));

                        // Steps — manifest-driven (v7.13.11, replaces hardcoded if/else)
                        const protoSteps = el('div', { id: 'swml-progress-steps' });
                        // v7.13.97: Use task-specific steps for exam prep, manifest sidebarSteps for assessment, fallback to defaults
                        const assessSteps = canvasSidebarSteps || (isExamPrep ? (getSteps() || []).map((s, i) => ({ step: i + 1, label: s.label })) : [
                            { step: 1, label: 'Setup & Details' },
                            { step: 2, label: 'Goal Setting' },
                            { step: 3, label: 'Self-Reflection' },
                            { step: 4, label: 'Essay Review' },
                            { step: 5, label: 'Introduction' },
                            { step: 6, label: 'Body Paragraphs' },
                            { step: 7, label: 'Conclusion' },
                            { step: 8, label: 'Summary & Action Plan' },
                        ]);
                        assessSteps.forEach((s, i) => {
                            const cls = i === 0 ? 'active' : '';
                            protoSteps.appendChild(el('div', { className: `swml-step ${cls}`, 'data-step': s.step }, [
                                el('div', { className: `swml-step-circle ${cls}`, textContent: s.step }),
                                el('span', { className: 'swml-step-label', textContent: s.label }),
                            ]));
                        });
                        protoBody.appendChild(protoSteps);

                        // Bottom buttons — matching original sidebar, with icon+text for collapsed mode
                        const protoSpacer = el('div', { style: { marginTop: 'auto' } });

                        function iconBtn(svgIcon, text, onClick) {
                            const btn = el('button', { className: 'swml-sidebar-btn swml-sidebar-icon-btn', onClick });
                            btn.appendChild(el('span', { className: 'swml-btn-icon', innerHTML: svgIcon }));
                            btn.appendChild(el('span', { className: 'swml-btn-text', innerHTML: svgIcon + ' ' + text }));
                            return btn;
                        }

                        // ── Assessment Mark Complete button — 3D Push Button, hidden until complete (v7.12.35) ──
                        const assessBtn = build3DButton('Mark Complete', 'Done!', async () => {
                            if (state._phaseMarkedComplete) return;
                            // v7.13.34: CW SI exercises — save artifact + mark step complete
                            if (isCwSi && state.cwProjectId) {
                                state._phaseMarkedComplete = true;
                                const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                                if (artifactKey && canvasEditor) {
                                    await WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, canvasEditor.getHTML());
                                }
                                const stepKey = cwStepDef?.step ? 'step_' + cwStepDef.step : cwStepDef?.id;
                                await WML.cwProject.markStepComplete(state.cwProjectId, stepKey);
                                assessBtn.style.display = 'none';
                                showToast('Step complete! Your work has been saved.');
                                setTimeout(() => {
                                    if (WML.renderCreativeWritingDashboard) WML.renderCreativeWritingDashboard();
                                }, 1500);
                                return;
                            }
                            showPhaseCompleteCard();
                        });
                        assessBtn.style.display = 'none';
                        assessBtn.classList.add('swml-assess-complete-btn');
                        assessCompleteBtn = assessBtn;
                        protoSpacer.appendChild(assessBtn);

                        // Save button
                        const saveBtn = iconBtn(SVG_SAVE, 'Save Progress', () => {
                            if (canvasEditor) saveCanvasContent();
                            saveBtn.querySelector('.swml-btn-text').textContent = '✓ Saved';
                            setTimeout(() => { saveBtn.querySelector('.swml-btn-text').innerHTML = SVG_SAVE + ' Save Progress'; }, 2000);
                        });
                        protoSpacer.appendChild(saveBtn);

                        // Past Work
                        protoSpacer.appendChild(iconBtn(SVG_FOLDER, 'Past Work', () => { closeCanvasOverlay(); showPortfolio(); }));

                        // Dashboard
                        protoSpacer.appendChild(iconBtn(SVG_DASHBOARD, 'My Dashboard', () => window.open('/dashboard/', '_blank')));

                        // v7.14.41: CW exercises keep "Back to Steps" for CW dashboard navigation
                        // All other exercises are standalone — no "Back to Diagnostic" transition (LD handles sequencing)
                        if (isCwTask) {
                            protoSpacer.appendChild(iconBtn(SVG_BACK, 'Back to Steps', () => {
                                if (canvasEditor) saveCanvasContent();
                                const artifactKey = WML.CW_ARTIFACT_MAP[cwStepDef?.step];
                                if (artifactKey && state.cwProjectId && canvasEditor) {
                                    const content = canvasEditor.getHTML();
                                    WML.cwProject.saveArtifact(state.cwProjectId, artifactKey, content).catch(() => {});
                                }
                                if (typeof renderCreativeWritingDashboard === 'function') {
                                    renderCreativeWritingDashboard();
                                } else if (WML.renderCreativeWritingDashboard) {
                                    WML.renderCreativeWritingDashboard();
                                }
                            }));
                        }
                        protoBody.appendChild(protoSpacer);
                        protoPanel.appendChild(protoBody);

                        // 4. Build right chat panel — matching existing chat style
                        const chatPanel = el('div', { className: 'swml-canvas-chat' });

                        // Chat header with clear button
                        const chatHeader = el('div', { className: 'swml-canvas-chat-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
                        // v7.13.58: Append project name for CW exercises
                        const headerLabel = canvasChatHeaderLabel + (isCwTask && state.cwProjectName ? ' \u2014 \u201c' + state.cwProjectName + '\u201d' : '');
                        chatHeader.appendChild(el('span', { innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;opacity:0.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ' + headerLabel }));
                        const clearChatBtn = el('button', {
                            className: 'swml-clear-chat-btn',
                            title: 'Clear chat and start fresh',
                            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
                            onClick: () => {
                                showConfirm(
                                    'Clear this assessment chat and start fresh? Your document and essay are preserved — only the chat messages will be removed.',
                                    () => {
                                        clearCanvasChat();
                                        canvasChatHistory.length = 0;
                                        canvasChatId = '';
                                        chatMessages.innerHTML = '';
                                        state.plan = {};
                                        state._phaseMarkedComplete = false;
                                        state.step = 1;
                                        if (assessCompleteBtn) assessCompleteBtn.classList.remove('swml-assess-ready');
                                        // Reset protocol progress sidebar to step 1
                                        updateProgress(1);
                                        const fn = (config.userName || '').split(' ')[0] || 'there';

                                        // v7.13.42: CW exercises get CW-specific greeting on chat clear
                                        if (isCwTask && cwStepDef) {
                                            const stepLabel = cwStepDef.label || 'this step';
                                            const stepNum = cwStepDef.step || cwStepDef.trial || '';
                                            const gt = `Welcome back to Step ${stepNum}: **${stepLabel}**\n\nLet\u2019s continue working on this step. When you\u2019re ready, hit the button below.`;
                                            addChatMessage(formatAI(gt), 'ai', gt);
                                            canvasChatHistory.push({ role: 'assistant', content: gt });
                                            saveCanvasChat(canvasChatHistory, canvasChatId);
                                            // "Let's begin" quick action
                                            const startBar = el('div', { className: 'swml-quick-actions' });
                                            startBar.appendChild(el('button', {
                                                className: 'swml-quick-btn',
                                                textContent: "Let's begin",
                                                onClick: () => { startBar.remove(); chatTextarea.value = "Let's begin!"; sendCanvasMessage(); }
                                            }));
                                            const greetBubble = chatMessages.lastElementChild;
                                            if (greetBubble) {
                                                const bc = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                                                bc.appendChild(startBar);
                                            }
                                        } else {
                                        // Show fresh assessment greeting with essay question if available
                                        const tn = state.textName || state.text || 'your text';
                                        const wc = getResponseWordCount(canvasEditor);
                                        // Retrieve essay question from document
                                        const qText = extractEssayQuestion(canvasEditor);
                                        const questionInfo = qText ? `\n\nYour essay question: **${qText}**` : '';
                                        // v7.14.43: Context-aware greeting — exam practice has no "diagnostic"
                                        const essayLabel = (state.mode === 'exam_prep') ? `${tn} essay` : `${tn} diagnostic essay`;
                                        const gt = `Hi ${fn}! Welcome to the assessment phase. I've received your ${essayLabel} (${wc} words). Let's review your writing together.${questionInfo}\n\nBefore I begin marking, I need to know: **what grade are you aiming for?** This helps me tailor my feedback to where you want to be.`;
                                        addChatMessage(formatAI(gt), 'ai', gt);
                                        canvasChatHistory.push({ role: 'assistant', content: gt });
                                        saveCanvasChat(canvasChatHistory, canvasChatId);
                                        // Grade target buttons (v7.12.23)
                                        const gradeBarCC = el('div', { className: 'swml-quick-actions' });
                                        ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                                            gradeBarCC.appendChild(el('button', {
                                                className: 'swml-quick-btn',
                                                textContent: g,
                                                onClick: () => { gradeBarCC.remove(); chatTextarea.value = g; sendCanvasMessage(); }
                                            }));
                                        });
                                        const ccBubble = chatMessages.lastElementChild;
                                        if (ccBubble) {
                                            const ccContent = ccBubble.querySelector('.swml-bubble-content') || ccBubble;
                                            ccContent.appendChild(gradeBarCC);
                                        }
                                        } // end else (non-CW)
                                        console.log('WML Canvas: Chat cleared');
                                    },
                                    { confirmText: 'Clear Chat', cancelText: 'Keep Chat' }
                                );
                            }
                        });
                        chatHeader.appendChild(clearChatBtn);
                        chatPanel.appendChild(chatHeader);

                        // Messages area
                        const chatMessages = el('div', { className: 'swml-canvas-chat-messages', id: 'swml-canvas-chat-messages' });
                        chatPanel.appendChild(chatMessages);

                        // U2: Floating scroll-to-bottom arrow — Claude-style centered
                        const scrollDownBtn = el('div', { className: 'swml-scroll-down-btn',
                            innerHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 3a.5.5 0 0 1 .5.5v11.793l4.147-4.146a.5.5 0 0 1 .707.707l-5 5a.5.5 0 0 1-.631.062l-.076-.062-5-5a.5.5 0 0 1 .707-.707L9.5 15.293V3.5A.5.5 0 0 1 10 3"/></svg>',
                            title: 'Scroll to latest message',
                            onClick: () => { chatMessages.scrollTop = chatMessages.scrollHeight; }
                        });
                        scrollDownBtn.style.display = 'none';
                        chatPanel.appendChild(scrollDownBtn);

                        // Floating scroll-to-top arrow — matching style (v7.12.49)
                        const scrollUpBtn = el('div', { className: 'swml-scroll-up-btn',
                            innerHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 17a.5.5 0 0 1-.5-.5V4.707L5.354 8.854a.5.5 0 1 1-.708-.708l5-5a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1-.708.708L10.5 4.707V16.5a.5.5 0 0 1-.5.5"/></svg>',
                            title: 'Scroll to top of chat',
                            onClick: () => { chatMessages.scrollTo({ top: 0, behavior: 'smooth' }); }
                        });
                        scrollUpBtn.style.display = 'none';
                        chatPanel.appendChild(scrollUpBtn);

                        chatMessages.addEventListener('scroll', () => {
                            const gap = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
                            scrollDownBtn.style.display = gap > 150 ? 'flex' : 'none';
                            scrollUpBtn.style.display = chatMessages.scrollTop > 200 ? 'flex' : 'none';
                        }, { passive: true });
                        // Chat input — exact same structure as original chat
                        const chatInputArea = el('div', { className: 'swml-chat-input' });
                        const chatInputWrap = el('div', { className: 'swml-chat-input-wrapper' });
                        const chatInputInner = el('div', { className: 'swml-chat-input-inner' });

                        // Attach button (same class as original)
                        const chatAttachBtn = el('button', { className: 'swml-upload-btn', innerHTML: SVG_ATTACH, title: 'Upload file' });
                        chatInputInner.appendChild(chatAttachBtn);

                        // Textarea (same class as original)
                        const chatTextarea = el('textarea', { id: 'swml-canvas-chat-input', rows: '1', placeholder: 'Type your response...' });
                        chatTextarea.style.cssText = 'flex:1;border:none;background:transparent;font-size:13px;outline:none;color:var(--swml-text);font-family:inherit;resize:none;line-height:1.5;max-height:200px;min-height:22px;overflow-y:auto;';
                        chatTextarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 200) + 'px'; });
                        // Helper: trigger auto-grow after programmatic value changes
                        function autoGrowChatTextarea() {
                            requestAnimationFrame(() => {
                                chatTextarea.style.height = 'auto';
                                chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 200) + 'px';
                            });
                        }
                        chatInputInner.appendChild(chatTextarea);

                        // Mic button with voice input for canvas chat
                        let canvasRecognition = null, canvasListening = false;
                        const chatMicBtn = el('button', { className: 'swml-mic-btn', innerHTML: SVG_MIC, title: 'Voice input',
                            onClick: () => {
                                const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                                if (!SR) { alert('Voice input is not supported in this browser.'); return; }
                                if (canvasListening && canvasRecognition) { canvasRecognition.stop(); return; }
                                if (!canvasRecognition) {
                                    canvasRecognition = new SR();
                                    canvasRecognition.continuous = true;
                                    canvasRecognition.interimResults = true;
                                    canvasRecognition.lang = 'en-GB';
                                    let finalTranscript = '';
                                    canvasRecognition.onresult = (e) => {
                                        if (canvasChatLoading) return; // Don't repopulate after send
                                        let interim = '';
                                        for (let i = e.resultIndex; i < e.results.length; i++) {
                                            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
                                            else interim += e.results[i][0].transcript;
                                        }
                                        chatTextarea.value = finalTranscript + interim;
                                        chatTextarea.dispatchEvent(new Event('input'));
                                    };
                                    canvasRecognition.onstart = () => {
                                        canvasListening = true; finalTranscript = chatTextarea.value || '';
                                        chatMicBtn.innerHTML = SVG_MIC_STOP;
                                        chatMicBtn.classList.add('swml-mic-active');
                                    };
                                    canvasRecognition.onend = () => {
                                        canvasListening = false;
                                        chatMicBtn.innerHTML = SVG_MIC;
                                        chatMicBtn.classList.remove('swml-mic-active');
                                        // Focus textarea so user can press Enter to submit
                                        chatTextarea.focus();
                                    };
                                    canvasRecognition.onerror = (e) => {
                                        console.warn('Canvas voice error:', e.error);
                                        canvasListening = false;
                                        chatMicBtn.innerHTML = SVG_MIC;
                                        chatMicBtn.classList.remove('swml-mic-active');
                                    };
                                }
                                try { canvasRecognition.start(); } catch(e) { console.warn('Canvas voice start error:', e); }
                            }
                        });
                        chatInputInner.appendChild(chatMicBtn);

                        // Send button (same class as original)
                        const chatSendBtn = el('button', { className: 'swml-send-btn', innerHTML: SVG_SEND, title: 'Send' });
                        chatInputInner.appendChild(chatSendBtn);

                        chatInputWrap.appendChild(chatInputInner);
                        chatInputArea.appendChild(chatInputWrap);
                        chatPanel.appendChild(chatInputArea);

                        // Chat message helper — uses same structure as original chat
                        function addChatMessage(text, role, rawText) {
                            // Remove previous quick action bars
                            chatMessages.querySelectorAll('.swml-quick-actions').forEach(q => q.remove());

                            const bubble = el('div', { className: `swml-bubble ${role === 'ai' ? 'ai' : 'user'}` });
                            const content = el('div', { className: 'swml-bubble-content' });
                            if (role === 'ai') {
                                const header = el('div', { className: 'swml-bubble-header' });
                                header.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
                                // Copy button
                                const rawForCopy = rawText || text.replace(/<[^>]+>/g, '');
                                header.appendChild(el('button', { className: 'swml-bubble-copy', innerHTML: SVG_COPY, title: 'Copy this message',
                                    onClick: (e) => { e.stopPropagation(); clip(rawForCopy, e.currentTarget); } }));
                                // U3: Smart copy — copies just the assessment content (skips preamble/postamble)
                                const assessBlock = extractAssessmentContent(rawForCopy);
                                if (assessBlock) {
                                    header.appendChild(el('button', { className: 'swml-bubble-copy swml-copy-assess', innerHTML: SVG_COPY_ASSESS,
                                        onClick: (e) => { e.stopPropagation(); clipRich(assessBlock, e.currentTarget); } }));
                                }
                                content.appendChild(header);
                                const body = el('div', { className: 'swml-bubble-body' });
                                body.innerHTML = text;
                                content.appendChild(body);

                                // Quick action buttons — detect from raw (unformatted) text
                                const detectText = rawText || text.replace(/<[^>]+>/g, '');
                                // Suppress quick actions when assessment is complete
                                const canvasAssessDone = state.task === 'assessment' && state.plan.total_score && state.plan.grade;
                                // Suppress quick actions on Hattie reflective questions (v7.12.34)
                                const isHattieQuestion = /(?:Where\s+am\s+I\s+going|How\s+am\s+I\s+going|Where\s+to\s+next|transfer.*skills|how\s+will\s+you.*apply|Session\s+Complete)/i.test(detectText);
                                const actions = (canvasAssessDone || isHattieQuestion) ? [] : detectQuickActions(detectText);
                                if (actions.length > 0) {
                                    // Multi-select detection (AO selection, "select all that apply")
                                    const isMulti = /(?:pick|choose|select|commit to)\s*(?:(?:up to|between|at least)?\s*)?(\d)\s*[-–to]+\s*(\d)/i.test(detectText)
                                        || /(?:pick|choose|select)\s+(?:multiple|several|a few|some)\b/i.test(detectText)
                                        || /select\s+all\s+that\s+apply/i.test(detectText);
                                    // AO context detection — if AI lists AO1/AO2/AO3 as options, always multi-select (v7.12.5)
                                    const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3|targeting.*AO/i.test(detectText)
                                        && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));

                                    const bar = el('div', { className: 'swml-quick-actions' });

                                    if ((isMulti || isAoContext) && actions.length >= 2) {
                                        // Multi-select toggle mode
                                        const selected = new Set();
                                        actions.forEach(action => {
                                            const btn = el('button', {
                                                className: 'swml-quick-btn swml-quick-toggle',
                                                textContent: action.label,
                                                onClick: () => {
                                                    if (selected.has(action.value)) {
                                                        selected.delete(action.value);
                                                        btn.classList.remove('swml-quick-toggle-on');
                                                    } else {
                                                        selected.add(action.value);
                                                        btn.classList.add('swml-quick-toggle-on');
                                                    }
                                                    submitBtn.style.display = selected.size > 0 ? 'block' : 'none';
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
                                            textContent: '✓ Submit',
                                            style: { display: 'none' },
                                            onClick: () => {
                                                bar.remove();
                                                chatTextarea.value = Array.from(selected).join(', ');
                                                sendCanvasMessage();
                                            }
                                        });
                                        bar.appendChild(submitBtn);
                                    } else if (actions._ranking && actions.length >= 2) {
                                        // ── Ranking mode for training-env chat (v7.14.51) ──
                                        const ranked = [];
                                        const btnMap = new Map();
                                        const rankSubmitBtn = el('button', {
                                            className: 'swml-quick-btn swml-quick-submit',
                                            textContent: 'Submit Ranking →',
                                            style: { display: 'none' },
                                            onClick: () => {
                                                bar.remove();
                                                chatTextarea.value = ranked.map((v, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}: ${v}`).join(', ');
                                                sendCanvasMessage();
                                            }
                                        });
                                        const updateRankLabels = () => {
                                            btnMap.forEach((btn, val) => {
                                                const idx = ranked.indexOf(val);
                                                const baseLabel = btn.dataset.baseLabel;
                                                if (idx >= 0) {
                                                    btn.classList.add('swml-quick-toggle-on');
                                                    btn.innerHTML = `<span class="swml-rank-num">${idx + 1}</span> ${baseLabel}`;
                                                } else {
                                                    btn.classList.remove('swml-quick-toggle-on');
                                                    btn.innerHTML = baseLabel;
                                                }
                                            });
                                            rankSubmitBtn.style.display = ranked.length > 0 ? 'block' : 'none';
                                            rankSubmitBtn.textContent = ranked.length > 0 ? `Submit Ranking (${ranked.length}) →` : 'Submit Ranking →';
                                        };
                                        actions.forEach(action => {
                                            const cleanLabel = action.label.replace(/^[A-F]\)\s*/, '');
                                            const btn = el('button', {
                                                className: 'swml-quick-btn swml-rank-btn',
                                                textContent: cleanLabel,
                                                onClick: () => {
                                                    const idx = ranked.indexOf(action.value);
                                                    if (idx >= 0) { ranked.splice(idx, 1); } else { ranked.push(action.value); }
                                                    updateRankLabels();
                                                }
                                            });
                                            btn.dataset.baseLabel = cleanLabel;
                                            btnMap.set(action.value, btn);
                                            bar.appendChild(btn);
                                        });
                                        bar.appendChild(rankSubmitBtn);
                                    } else {
                                        // Single-select mode
                                        actions.forEach(action => {
                                            const btn = el('button', {
                                                className: 'swml-quick-btn',
                                                textContent: action.label,
                                                onClick: () => {
                                                    // v7.14.3: Intercept "Saved question" — check label (value is just the letter e.g. "B")
                                                    if (isExamPrep && /saved\s*question/i.test(action.label || action.value)) {
                                                        bar.remove();
                                                        _showSavedQuestionOverlay(chatTextarea, sendCanvasMessage);
                                                        return;
                                                    }
                                                    bar.remove();
                                                    chatTextarea.value = action.value;
                                                    sendCanvasMessage();
                                                }
                                            });
                                            bar.appendChild(btn);
                                        });
                                    }
                                    content.appendChild(bar);
                                }

                                // U1: Back-to-top button on long messages (>500px body height)
                                setTimeout(() => {
                                    if (body.offsetHeight > 500) {
                                        const topBtn = el('button', {
                                            className: 'swml-msg-top-btn',
                                            innerHTML: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 17a.5.5 0 0 1-.5-.5V4.707L5.354 8.854a.5.5 0 1 1-.708-.708l5-5a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1-.708.708L10.5 4.707V16.5a.5.5 0 0 1-.5.5"/></svg> Back to top of message',
                                            onClick: () => { bubble.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                                        });
                                        content.appendChild(topBtn);
                                    }
                                }, 100);
                            } else {
                                // User message — add subtle copy button
                                const userHeader = el('div', { className: 'swml-bubble-header', style: { justifyContent: 'flex-end' } });
                                userHeader.appendChild(el('button', { className: 'swml-bubble-copy swml-user-copy', innerHTML: SVG_COPY, title: 'Copy your message',
                                    onClick: (e) => { e.stopPropagation(); clip(text, e.currentTarget); } }));
                                content.appendChild(userHeader);
                                content.appendChild(el('p', { textContent: text }));
                            }
                            bubble.appendChild(content);
                            chatMessages.appendChild(bubble);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }

                        // ── Canvas Chat Selection Toolbar (identical to document toolbar) ──
                        let canvasChatSelToolbar = null;
                        function removeChatSelToolbar() {
                            if (canvasChatSelToolbar) { canvasChatSelToolbar.remove(); canvasChatSelToolbar = null; }
                        }

                        chatMessages.addEventListener('mouseup', () => {
                            setTimeout(() => {
                                const sel = window.getSelection();
                                if (!sel || sel.isCollapsed || !sel.toString().trim()) { removeChatSelToolbar(); return; }
                                const selectedText = sel.toString().trim();
                                if (selectedText.length < 2 || selectedText.length > 2000) return;
                                const anchorEl = sel.anchorNode?.parentElement;
                                if (!anchorEl || !chatMessages.contains(anchorEl)) return;

                                removeChatSelToolbar();
                                const quote = selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText;

                                const tb = el('div', { className: 'swml-selection-toolbar swml-sel-neumorphic' });
                                canvasChatSelToolbar = tb;

                                // Reply — prepends "Regarding ..." to chat input
                                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_REPLY + ' <span>Reply</span>',
                                    onClick: (ev) => {
                                        ev.stopPropagation();
                                        chatTextarea.value = `Regarding "${quote}" — `;
                                        chatTextarea.dispatchEvent(new Event('input'));
                                        autoGrowChatTextarea();
                                        chatTextarea.focus();
                                        removeChatSelToolbar(); sel.removeAllRanges();
                                    }
                                }));

                                // Insert into Document
                                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_INSERT + ' <span>Insert into Doc</span>',
                                    onClick: (ev) => {
                                        ev.stopPropagation();
                                        if (canvasEditor) {
                                            canvasEditor.chain().focus().insertContent(selectedText + '\n').run();
                                        }
                                        removeChatSelToolbar(); sel.removeAllRanges();
                                    }
                                }));

                                // Insert into Chat
                                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_INSERT + ' <span>Insert</span>',
                                    onClick: (ev) => {
                                        ev.stopPropagation();
                                        chatTextarea.value += (chatTextarea.value && !chatTextarea.value.endsWith(' ') ? ' ' : '') + selectedText;
                                        chatTextarea.dispatchEvent(new Event('input'));
                                        autoGrowChatTextarea();
                                        chatTextarea.focus();
                                        removeChatSelToolbar(); sel.removeAllRanges();
                                    }
                                }));

                                // Copy
                                tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_COPY + ' <span>Copy</span>',
                                    onClick: (ev) => {
                                        ev.stopPropagation();
                                        navigator.clipboard.writeText(selectedText).catch(() => document.execCommand('copy'));
                                        removeChatSelToolbar(); sel.removeAllRanges();
                                    }
                                }));

                                // Note
                                tb.appendChild(el('button', { className: 'swml-sel-btn swml-sel-notes', innerHTML: SVG_SEL_NOTE + ' <span>Note</span>',
                                    onClick: (ev) => {
                                        ev.stopPropagation();
                                        sendToNotes(selectedText);
                                        removeChatSelToolbar(); sel.removeAllRanges();
                                    }
                                }));

                                // Position above selection
                                const range = sel.getRangeAt(0);
                                const rect = range.getBoundingClientRect();
                                const msgsRect = chatMessages.getBoundingClientRect();
                                chatMessages.appendChild(tb);
                                const tbW = tb.offsetWidth;
                                tb.style.top = (rect.top - msgsRect.top + chatMessages.scrollTop - tb.offsetHeight - 8) + 'px';
                                tb.style.left = Math.max(4, Math.min(
                                    rect.left - msgsRect.left + (rect.width / 2) - (tbW / 2),
                                    msgsRect.width - tbW - 4
                                )) + 'px';
                            }, 10);
                        });

                        document.addEventListener('mousedown', (e) => {
                            if (canvasChatSelToolbar && !canvasChatSelToolbar.contains(e.target)) removeChatSelToolbar();
                        });

                        // ── Canvas Chat — AI Engine Wiring ──
                        const canvasChatHistory = [];
                        let canvasChatId = '';
                        let canvasChatLoading = false;

                        // Typing indicators — delegate to shared functions (v7.12.35)
                        function removeCanvasTyping() { removeTypingBubble(chatMessages); }
                        function showCanvasTyping() { createTypingBubble(chatMessages); }

                        async function sendCanvasMessage() {
                            const msg = chatTextarea.value.trim();
                            if (!msg || canvasChatLoading) return;
                            canvasChatLoading = true;

                            // Stop mic if recording
                            if (canvasListening && canvasRecognition) {
                                try { canvasRecognition.stop(); } catch(e) {}
                            }

                            // v7.14.3: Silent send — add to history but don't show user bubble
                            const isSilent = canvasSilentSend;
                            canvasSilentSend = false;
                            if (!isSilent) addChatMessage(msg, 'user');
                            canvasChatHistory.push({ role: 'user', content: msg });
                            chatTextarea.value = '';
                            chatTextarea.style.height = '40px';
                            chatSendBtn.style.opacity = '0.4';
                            chatSendBtn.style.pointerEvents = 'none';

                            showCanvasTyping();

                            try {
                                // Inject document content as context — on EVERY message to prevent hallucination
                                let promptText = msg;
                                const essay = getResponseText(canvasEditor);
                                const userMsgCount = canvasChatHistory.filter(m => m.role === 'user').length;
                                const boardName = (state.board || '').toUpperCase().replace('-', ' ');
                                const subjectName = (state.subject || '').replace(/_/g, ' ');
                                const textName = state.textName || state.text || '';

                                // v7.14.46: Mark scheme is a chat-only quiz — no document injection.
                                // The protocol (shakespeare.md etc.) drives the quiz via chat.
                                if (canvasInMarkScheme) {
                                    if (userMsgCount === 1) {
                                        promptText = `[CONTEXT: ${boardName} ${subjectName} — ${textName} — MARK SCHEME QUIZ]\n[STUDENT'S RESPONSE]\n${msg}`;
                                    }
                                    // No document content injected — quiz protocol handles everything
                                } else if (state.task === 'planning' || state.task === 'polishing') {
                                    // v7.14.39: Planning/polishing — inject FULL document (not just response) so AI can see question, plan, etc.
                                    const docContent = canvasEditor ? canvasEditor.getText() : '';
                                    if (userMsgCount === 1) {
                                        promptText = `[CONTEXT: ${boardName} ${subjectName} — ${textName} — ${state.task.toUpperCase()}${state.phase === 'redraft' ? ' (REDRAFT)' : ''}]\n[STUDENT'S DOCUMENT — contains question, essay plan, and response sections]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    } else if (docContent.trim().length > 50) {
                                        promptText = `[STUDENT'S DOCUMENT — current state]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    }
                                    console.log('WML Canvas: Planning/polishing doc injected. Length:', docContent.length);
                                } else if (isCwSi) {
                                    // v7.13.34: Creative Writing — inject document as "CREATIVE WRITING DOCUMENT"
                                    const docContent = canvasEditor ? canvasEditor.getText() : '';
                                    const stepLabel = cwStepDef?.label || 'Creative Writing';
                                    if (userMsgCount === 1) {
                                        promptText = `[CONTEXT: Creative Writing Course — Step ${cwStepDef?.step || cwStepDef?.trial}: ${stepLabel}]\n[STUDENT'S CREATIVE WRITING DOCUMENT]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    } else if (docContent.trim().length > 50) {
                                        promptText = `[CREATIVE WRITING DOCUMENT — current draft]\n\n${docContent}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    }
                                    console.log('WML Canvas: CW doc injected for', state.task, 'Length:', docContent.length);
                                } else if (essay.trim().length > 50) {
                                    const wc = getResponseWordCount(canvasEditor);
                                    if (userMsgCount === 1) {
                                        // First message: full context header
                                        promptText = `[CONTEXT: ${boardName} ${subjectName} — ${textName}]\n[STUDENT'S ESSAY — ${wc} words]\n\n${essay}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    } else {
                                        // Subsequent messages: re-inject essay as reminder
                                        promptText = `[REMINDER — STUDENT'S ACTUAL ESSAY (${wc} words) — assess ONLY this text, quote from it directly]\n\n${essay}\n\n---\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    }
                                    const sectionLabels = (essay.match(/=== .+? ===/g) || []).join(', ');
                                    console.log('WML Canvas: Essay injected (' + wc + ' words). Sections: [' + (sectionLabels || 'no labels') + ']. First 200 chars:', essay.substring(0, 200));
                                } else if (userMsgCount === 1) {
                                    promptText = `[CONTEXT: ${boardName} ${subjectName} — ${textName}]\n[NOTE: The student's Response section is empty or very short. Ask them to paste or write their essay in the Response section of the document before continuing with the assessment.]\n\n[STUDENT'S RESPONSE]\n${msg}`;
                                    console.warn('WML Canvas: Essay too short or empty. getResponseText returned:', essay.substring(0, 100));
                                }

                                // Sliding window: last 24 messages (excluding current)
                                const historyToSend = canvasChatHistory.slice(0, -1).slice(-24);

                                const response = await fetch(API.chat, {
                                    method: 'POST',
                                    headers,
                                    body: JSON.stringify({
                                        prompt: promptText,
                                        botId: 'wml-claude',
                                        chatId: canvasChatId,
                                        history: historyToSend,
                                        planState: state.plan || {},
                                        step: state.step || 1,
                                        board: state.board,
                                        subject: state.subject,
                                        text: state.text || '',
                                        task: state.task || 'assessment', // v7.12.98: send actual task (mark_scheme, feedback_discussion, etc.)
                                        question: state.question || '',
                                        marks: state.marks || 30,
                                        aos: state.aos || [],
                                        draftType: state.draftType || 'diagnostic',
                                        topicNumber: state.topicNumber || 1,
                                        phase: state.phase || 'initial',
                                    })
                                });
                                const res = await response.json();
                                removeCanvasTyping();

                                if (res.success && res.reply) {
                                    const cleanReply = stripAIInternals(res.reply);
                                    const formatted = formatAI(cleanReply);
                                    addChatMessage(formatted, 'ai', cleanReply);
                                    canvasChatHistory.push({ role: 'assistant', content: res.reply });
                                    if (res.chatId) canvasChatId = res.chatId;
                                    if (res.method) console.log('WML Canvas:', res.method, 'model:', res.model);
                                    // Persist chat for resume
                                    saveCanvasChat(canvasChatHistory, canvasChatId);
                                    // Auto-scroll to question section if AI references it
                                    if (/(?:question in (?:your|the) document|question at the top|look at the.*question|essay question section)/i.test(cleanReply)) {
                                        setTimeout(() => scrollToQuestionSection(), 400);
                                    }
                                    // ── Canvas score extraction + Mark Complete (v7.12.1) ──
                                    try {
                                        await refreshPlan();
                                        await extractAndSavePlan(msg, res.reply);
                                        console.log('WML Canvas: Plan state after extraction:', { total_score: state.plan.total_score, grade: state.plan.grade, task: state.task });

                                        // ── Assessment step + completion detection + Mark Complete (v7.12.35) ──
                                        if (state.task === 'assessment') {
                                            const detected = detectAssessmentStep(res.reply);
                                            console.log('WML Canvas: detectAssessmentStep →', { step: detected.step, isComplete: detected.isComplete, totalScore: detected.totalScore, grade: detected.grade, currentStep: state.step });
                                            if (detected.step > state.step) updateProgress(detected.step);
                                            // Force-extract scores when completion detected
                                            if (detected.isComplete) {
                                                console.log('WML Canvas: Assessment Complete detected in AI response');
                                                if (!state.plan.total_score && detected.totalScore) { state.plan.total_score = detected.totalScore; console.log('WML: Force-extracted total_score:', detected.totalScore); }
                                                if (!state.plan.grade && detected.grade) { state.plan.grade = detected.grade; console.log('WML: Force-extracted grade:', detected.grade); }
                                            }
                                            // Show Mark Complete button when assessment is done
                                            if (!state._phaseMarkedComplete && assessCompleteBtn && assessCompleteBtn.style.display === 'none') {
                                                const isAssessmentDone = detected.isComplete || state.step >= 8 || (state.plan.total_score && state.plan.grade);
                                                if (isAssessmentDone) {
                                                    assessCompleteBtn.style.display = '';
                                                    assessCompleteBtn.classList.add('swml-assess-ready');
                                                    assessCompleteBtn.style.opacity = '0';
                                                    assessCompleteBtn.style.transform = 'translateY(10px)';
                                                    requestAnimationFrame(() => {
                                                        assessCompleteBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                                        assessCompleteBtn.style.opacity = '1';
                                                        assessCompleteBtn.style.transform = 'translateY(0)';
                                                    });
                                                    console.log('WML: Mark Complete button → VISIBLE (assessment complete detected)');
                                                }
                                            }
                                            // v7.12.51 safety net: if detection missed but reply clearly contains closing summary
                                            if (!state._phaseMarkedComplete && assessCompleteBtn && assessCompleteBtn.style.display === 'none') {
                                                if (/Closing\s+Summary/i.test(res.reply) || /Session\s+Complete/i.test(res.reply)) {
                                                    assessCompleteBtn.style.display = '';
                                                    assessCompleteBtn.classList.add('swml-assess-ready');
                                                    assessCompleteBtn.style.opacity = '0';
                                                    assessCompleteBtn.style.transform = 'translateY(10px)';
                                                    requestAnimationFrame(() => {
                                                        assessCompleteBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                                        assessCompleteBtn.style.opacity = '1';
                                                        assessCompleteBtn.style.transform = 'translateY(0)';
                                                    });
                                                    console.log('WML: Mark Complete button → VISIBLE (safety net: Closing Summary/Session Complete keyword)');
                                                }
                                            }
                                        }
                                    } catch (exErr) {
                                        console.warn('WML Canvas: extraction/completion check failed:', exErr);
                                    }
                                } else if (res.message) {
                                    addChatMessage(`<p>Sorry, there was an issue: <strong>${res.message}</strong></p><p>Please let your teacher know about this error.</p>`, 'ai');
                                } else {
                                    addChatMessage('<p>I had a momentary difficulty — could you try again?</p>', 'ai');
                                }
                            } catch (e) {
                                removeCanvasTyping();
                                console.error('WML Canvas chat error:', e);
                                addChatMessage(`<p>Connection error: <strong>${e.message}</strong></p><p>Check the browser console for details.</p>`, 'ai');
                            }

                            canvasChatLoading = false;
                            chatSendBtn.style.opacity = '';
                            chatSendBtn.style.pointerEvents = '';
                        }

                        // Send handler
                        chatSendBtn.addEventListener('click', sendCanvasMessage);
                        chatTextarea.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                // If multi-select has selections, click its submit button (v7.12.53)
                                const multiSubmit = document.querySelector('.swml-quick-submit:not([disabled])');
                                if (multiSubmit && !chatTextarea.value?.trim()) { multiSubmit.click(); return; }
                                // If mic is recording, stop it and submit after final transcript (v7.12.70, simplified v7.12.99)
                                if (canvasListening && canvasRecognition) {
                                    canvasRecognition.stop();
                                    // Wait 350ms for final transcript to land, then submit whatever is there
                                    setTimeout(() => {
                                        if (chatTextarea.value.trim()) sendCanvasMessage();
                                    }, 350);
                                    return;
                                }
                                sendCanvasMessage();
                            }
                        });

                        // 5. Panel entrance (v7.12.46): background visible, children hidden via class
                        protoPanel.classList.add('swml-panel-entering');
                        protoPanel.style.maxWidth = '0';
                        protoPanel.style.overflow = 'hidden';
                        chatPanel.classList.add('swml-panel-entering');
                        chatPanel.style.maxWidth = '0';
                        chatPanel.style.overflow = 'hidden';

                        // Resize handle for chat panel
                        const chatResizeHandle = el('div', { className: 'swml-canvas-chat-resize' });
                        chatResizeHandle.style.opacity = '0';

                        // Resize drag logic
                        let chatResizing = false;
                        chatResizeHandle.addEventListener('mousedown', (e) => {
                            chatResizing = true;
                            document.body.style.cursor = 'col-resize';
                            document.body.style.userSelect = 'none';
                            e.preventDefault();
                        });
                        document.addEventListener('mousemove', (e) => {
                            if (!chatResizing) return;
                            const canvasRect = canvas.getBoundingClientRect();
                            const newWidth = canvasRect.right - e.clientX;
                            if (newWidth >= 280 && newWidth <= 600) {
                                chatPanel.style.width = newWidth + 'px';
                            }
                        });
                        document.addEventListener('mouseup', () => {
                            if (chatResizing) {
                                chatResizing = false;
                                document.body.style.cursor = '';
                                document.body.style.userSelect = '';
                            }
                        });

                        // Essay text available for AI
                        const essayText = canvasEditor.getText();
                        const essayHTML = canvasEditor.getHTML();

                                // 5. Insert panels (invisible) and stagger fade in
                                canvas.insertBefore(protoPanel, editorPane);
                                canvas.appendChild(chatResizeHandle);
                                canvas.appendChild(chatPanel);

                                requestAnimationFrame(() => {
                                    // v7.12.45: All width changes simultaneously — one smooth document shift
                                    // Diagnostic collapse (via CSS class) + both assessment panels expand together
                                    const panelEase = 'max-width 0.4s cubic-bezier(0.16,1,0.3,1)';
                                    protoPanel.style.transition = panelEase;
                                    protoPanel.style.maxWidth = '280px';
                                    chatPanel.style.transition = panelEase;
                                    chatPanel.style.maxWidth = '500px';

                                    // After widths settle, GSAP stagger children in (v7.12.47)
                                    setTimeout(() => {
                                        protoPanel.classList.remove('swml-panel-entering');
                                        protoPanel.style.overflow = '';
                                        chatResizeHandle.style.transition = 'opacity 0.5s ease';
                                        chatResizeHandle.style.opacity = '1';
                                        // GSAP stagger: left panel children cascade down
                                        if (window.gsap) {
                                            gsap.from(protoPanel.children, { opacity: 0, y: -12, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' });
                                        }
                                    }, 420);
                                    setTimeout(() => {
                                        chatPanel.classList.remove('swml-panel-entering');
                                        chatPanel.style.overflow = '';
                                        // GSAP stagger: right chat panel children cascade down
                                        if (window.gsap) {
                                            gsap.from(chatPanel.children, { opacity: 0, y: -12, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' });
                                        }

                                        // ── Chat persistence: resume or fresh start (v7.12.3) ──
                                        (async () => {
                                        let savedChat = loadCanvasChat();
                                        // Server fallback if localStorage is empty (v7.14.4: suffix now isolates each exercise type)
                                        // CW exercises use project artifact storage, not canvas chat
                                        const skipServerChat = state.task && state.task.startsWith('cw_');
                                        if (!skipServerChat && (!savedChat || !savedChat.history || savedChat.history.length === 0)) {
                                            try {
                                                const _chatSuffix = WML.getExerciseConfig(state.task).storageSuffix || '';
                                                const chatUrl = `${API.chatLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topicNumber=${state.topicNumber || ''}&suffix=${encodeURIComponent(_chatSuffix)}`;
                                                const serverChat = await fetch(chatUrl, { headers }).then(r => r.json());
                                                if (serverChat.success && serverChat.chat && serverChat.chat.history && serverChat.chat.history.length > 0) {
                                                    savedChat = serverChat.chat;
                                                    console.log('WML Canvas: Chat loaded from server (localStorage empty)');
                                                }
                                            } catch (e) { console.log('WML Canvas: Server chat load unavailable'); }
                                        }
                                        // v7.14.1: Discard stale chat if task type doesn't match (e.g. assessment chat saved under exam prep key)
                                        if (savedChat && savedChat.task && savedChat.task !== state.task) {
                                            console.log('WML Canvas: Discarding stale chat — saved task:', savedChat.task, 'current task:', state.task);
                                            savedChat = null;
                                            try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                                        }
                                        // Also discard if chat contains "assessment phase" but current task is exam prep
                                        if (isExamPrep && savedChat && savedChat.history && savedChat.history.length > 0) {
                                            const firstAI = savedChat.history.find(m => m.role === 'assistant');
                                            if (firstAI && firstAI.content.includes('assessment phase')) {
                                                console.log('WML Canvas: Discarding stale assessment chat from exam prep exercise');
                                                savedChat = null;
                                                try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                                            }
                                        }
                                        // v7.14.47: Discard ALL cached mark_scheme chats — the quiz protocol MUST
                                        // drive from scratch. Any saved chat (stale greetings, old self-assessment
                                        // form conversations, or generic assessment greetings) would confuse the
                                        // quiz flow and cause Q1 to be skipped.
                                        if (canvasInMarkScheme && savedChat && savedChat.history && savedChat.history.length > 0) {
                                            console.log('WML Canvas: Discarding saved mark_scheme chat — protocol must drive from scratch');
                                            savedChat = null;
                                            try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                                        }
                                        // v7.13.36: Discard stale chat for CW exercises — check that saved chat belongs to this exercise type
                                        if (isCwSi && savedChat && savedChat.history && savedChat.history.length > 0) {
                                            const firstAI = savedChat.history.find(m => m.role === 'assistant');
                                            // CW chats should contain "Creative Writing" or step-related content, not "assessment phase"
                                            if (firstAI && firstAI.content.includes('assessment phase')) {
                                                console.log('WML Canvas: Discarding stale assessment chat from CW exercise');
                                                savedChat = null;
                                                try { localStorage.removeItem(CHAT_SAVE_KEY()); } catch(e) {}
                                            }
                                        }
                                        const hasSavedChat = savedChat && savedChat.history && savedChat.history.length > 0;

                                        // ── Unified assessment state initializer (v7.12.22) ──
                                        // Single function for ALL entry paths (Get Assessed, Diagnostic→Assessment, Re-entry).
                                        // Scans canvasChatHistory for sidebar progress + Session Complete,
                                        // checks phase status, shows Mark Complete if appropriate.
                                        async function initAssessmentState() {
                                            if (state.task !== 'assessment' && state.task !== 'redraft_assessment' && !isCwSi && !isExamPrep) return;
                                            // 1. Scan ALL chat messages for sidebar step keywords
                                            const allAiMsgs = canvasChatHistory.filter(m => m.role === 'assistant');
                                            let maxStep = allAiMsgs.length > 0 ? 1 : 0; // Start at 1 only if there's chat history (v7.12.32)
                                            let sessionComplete = false;
                                            allAiMsgs.forEach(msg => {
                                                const detected = detectAssessmentStep(msg.content);
                                                if (detected.step > maxStep) maxStep = detected.step;
                                                if (detected.isComplete) {
                                                    sessionComplete = true;
                                                    if (!state.plan.total_score && detected.totalScore) state.plan.total_score = detected.totalScore;
                                                    if (!state.plan.grade && detected.grade) state.plan.grade = detected.grade;
                                                }
                                            });
                                            if (maxStep > state.step) {
                                                updateProgress(maxStep);
                                                console.log('WML initAssessmentState: Sidebar → step', maxStep);
                                            }
                                            // 2. Check if phase already marked complete
                                            if (state._phaseMarkedComplete) return;
                                            try {
                                                const phaseUrl = `${API.phaseStatus}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${state.topicNumber || 1}`;
                                                const phaseRes = await apiGet(phaseUrl);
                                                const currentPhase = state.phase === 'redraft' ? 'redraft' : 'initial';
                                                if (phaseRes[currentPhase]?.status === 'complete') {
                                                    state._phaseMarkedComplete = true;
                                                    // Phase already complete — keep button hidden, step checkmarks show completion (v7.12.33)
                                                    console.log('WML initAssessmentState: Phase already complete');
                                                    return;
                                                }
                                            } catch (e) { /* phase check failed, fall through */ }
                                            // 3. Show Mark Complete if assessment is done (v7.12.34)
                                            const isComplete = sessionComplete || (state.plan.total_score && state.plan.grade) || maxStep >= 8;
                                            if (isComplete && assessCompleteBtn) {
                                                assessCompleteBtn.style.display = '';
                                                assessCompleteBtn.classList.add('swml-assess-ready');
                                                console.log('WML initAssessmentState: Mark Complete → VISIBLE (restored)');
                                            }
                                        }

                                        if (hasSavedChat) {
                                            // Resume: replay all saved messages silently
                                            console.log('WML Canvas: Resuming chat with', savedChat.count, 'messages');
                                            savedChat.history.forEach(msg => {
                                                if (msg.role === 'assistant') {
                                                    const clean = stripAIInternals(msg.content);
                                                    addChatMessage(formatAI(clean), 'ai', clean);
                                                } else if (msg.role === 'user') {
                                                    addChatMessage(msg.content, 'user');
                                                }
                                                canvasChatHistory.push(msg);
                                            });
                                            if (savedChat.chatId) canvasChatId = savedChat.chatId;

                                            // ── Unified assessment state init (v7.12.32) ──
                                            // Await init so sidebar updates before user sees the UI
                                            await initAssessmentState();

                                            // Run extraction on last AI message to restore plan state, then re-check
                                            const lastAI = savedChat.history.filter(m => m.role === 'assistant').pop();
                                            if (lastAI) {
                                                try {
                                                    const lastUser = savedChat.history.filter(m => m.role === 'user').pop();
                                                    await refreshPlan();
                                                    await extractAndSavePlan(lastUser?.content || '', lastAI.content);
                                                    await initAssessmentState(); // re-check after scores extracted
                                                } catch (err) { console.warn('WML Canvas: extraction chain failed:', err); }
                                            }

                                            // v7.14.44: Re-add grade quick action buttons if chat only has the greeting
                                            // (grade buttons are DOM elements that don't persist in saved history)
                                            const userMsgs = savedChat.history.filter(m => m.role === 'user');
                                            const aiMsgs = savedChat.history.filter(m => m.role === 'assistant');
                                            if (canvasInAssessment && !canvasInMarkScheme && !canvasInFeedback && !isCwTask
                                                && aiMsgs.length === 1 && userMsgs.length === 0) {
                                                setTimeout(() => {
                                                    const lastBubble = chatMessages.lastElementChild;
                                                    if (lastBubble && !lastBubble.querySelector('.swml-quick-actions')) {
                                                        const gradeBar = el('div', { className: 'swml-quick-actions' });
                                                        ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                                                            gradeBar.appendChild(el('button', {
                                                                className: 'swml-quick-btn',
                                                                textContent: g,
                                                                onClick: () => { gradeBar.remove(); chatTextarea.value = g; sendCanvasMessage(); }
                                                            }));
                                                        });
                                                        const bc = lastBubble.querySelector('.swml-bubble-content') || lastBubble;
                                                        bc.appendChild(gradeBar);
                                                        console.log('WML: Restored grade buttons on resumed greeting');
                                                    }
                                                }, 100);
                                            }

                                            // Scroll to bottom after replay
                                            setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 150);
                                        } else if (isExamPrep) {
                                            // v7.14.3: Exam prep — silent auto-send (no user bubble)
                                            setTimeout(() => {
                                                console.log('WML Exam Prep: Sending initial greeting for', state.task);
                                                if (chatTextarea) { canvasSilentSend = true; chatTextarea.value = "Let's begin!"; sendCanvasMessage(); }
                                            }, 400);
                                        } else if (state.task === 'mark_scheme') {
                                            // v7.14.39: Mark Scheme Assessment — silent auto-send to let protocol drive the greeting
                                            setTimeout(() => {
                                                console.log('WML Mark Scheme: Sending initial greeting via protocol');
                                                if (chatTextarea) { canvasSilentSend = true; chatTextarea.value = "Let's begin the mark scheme assessment."; sendCanvasMessage(); }
                                            }, 400);
                                        } else if (state.task === 'planning' || state.task === 'polishing') {
                                            // v7.14.35: Phase 2 planning/polishing — silent auto-send to trigger board protocol
                                            setTimeout(() => {
                                                console.log('WML Phase 2: Sending initial greeting for', state.task);
                                                if (chatTextarea) { canvasSilentSend = true; chatTextarea.value = "Let's begin!"; sendCanvasMessage(); }
                                            }, 400);
                                        } else if (isCwSi) {
                                            // v7.13.35: Creative Writing SI-guided exercise — show greeting, then auto-trigger AI
                                            setTimeout(async () => {
                                            const firstName = (config.userName || '').split(' ')[0] || 'there';
                                            const stepLabel = cwStepDef?.label || 'this step';
                                            const stepNum = cwStepDef?.step || cwStepDef?.trial || '';
                                            const projectId = state.cwProjectId;

                                            // For draft steps, load predecessor draft into document
                                            const draftPredKey = WML.CW_DRAFT_PREDECESSOR[cwStepDef?.step];
                                            if (draftPredKey && projectId) {
                                                try {
                                                    const predArtifact = await WML.cwProject.loadArtifact(projectId, draftPredKey);
                                                    if (predArtifact?.success && predArtifact.value && canvasEditor) {
                                                        canvasEditor.commands.setContent(predArtifact.value);
                                                        console.log('WML CW: Pre-populated document from', draftPredKey);
                                                    }
                                                } catch (e) { console.log('WML CW: No predecessor draft to load'); }
                                            }

                                            // For plot update steps, load current plot outline
                                            const plotUpdateSteps = [11, 14, 17, 20, 23, 26];
                                            if (plotUpdateSteps.includes(cwStepDef?.step) && projectId) {
                                                try {
                                                    const plotArtifact = await WML.cwProject.loadArtifact(projectId, 'plot_outline');
                                                    if (plotArtifact?.success && plotArtifact.value && canvasEditor) {
                                                        canvasEditor.commands.setContent(plotArtifact.value);
                                                        console.log('WML CW: Pre-populated plot outline for update');
                                                    }
                                                } catch (e) { console.log('WML CW: No plot outline to load'); }
                                            }

                                            // v7.13.41: Load dependency artifacts into chat context
                                            // Steps 2+ need the Writer Profile; steps 3+ also need story ideas, etc.
                                            const cwDependencies = {
                                                2: ['writer_profile'], 3: ['writer_profile', 'story_ideas'],
                                                4: ['logline'], 5: ['brief_outline'], 6: ['plot_structure_choice'],
                                                8: ['plot_outline'], 9: ['plot_outline', 'scene_selection'],
                                            };
                                            const deps = cwDependencies[cwStepDef?.step];
                                            let missingPrereq = null;
                                            if (deps && projectId) {
                                                for (const depKey of deps) {
                                                    try {
                                                        const depArtifact = await WML.cwProject.loadArtifact(projectId, depKey);
                                                        if (depArtifact?.success && depArtifact.value) {
                                                            const depLabel = depKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                            const contextMsg = `[CONTEXT FROM PREVIOUS STEP] ${depLabel}:\n\n${depArtifact.value}`;
                                                            canvasChatHistory.push({ role: 'user', content: contextMsg });
                                                            console.log('WML CW: Loaded dependency artifact:', depKey);
                                                        } else if (!missingPrereq) {
                                                            // v7.13.45: Track first missing prerequisite
                                                            missingPrereq = depKey;
                                                        }
                                                    } catch (e) {
                                                        if (!missingPrereq) missingPrereq = depKey;
                                                        console.log('WML CW: Could not load dependency:', depKey);
                                                    }
                                                }
                                            }

                                            // v7.13.45: Step-aware greeting — references previous step's work
                                            const cwPrevContext = {
                                                1: 'This is the starting point of your creative writing journey.',
                                                2: 'In Step 1, you built your Writer\u2019s Profile \u2014 the themes, passions, and fears that matter most to you. Now we\u2019ll look outward for a spark that ignites those inner themes into a story.',
                                                3: 'In Step 2, you explored story ideas by combining your personal themes with external inspiration. Now we\u2019ll distil your favourite idea into a powerful one-sentence logline.',
                                                4: 'In Step 3, you crafted your logline \u2014 the DNA of your story. Now we\u2019ll give it a skeleton using the Pixar Story Spine.',
                                                5: 'In Step 4, you outlined your story using the Story Spine. Now we\u2019ll choose the archetypal plot structure that best fits your story.',
                                                6: 'In Step 5, you chose your plot structure. Now we\u2019ll build a detailed, stage-by-stage plot outline \u2014 your master document for the rest of the course.',
                                                7: 'In Step 6, you built your plot outline. Now we\u2019ll explore the universal human values that will give your story its deeper meaning.',
                                                8: 'You\u2019ve built your plot outline and explored your story\u2019s values. Now it\u2019s time to choose which scene(s) to bring to life in your first draft.',
                                                9: 'You\u2019ve chosen your scene(s). Now it\u2019s time to write your first draft \u2014 focusing on basic prose style.',
                                            };
                                            const prevCtx = cwPrevContext[stepNum] || `You\u2019ve been building your story step by step. Let\u2019s continue with **${stepLabel}**.`;
                                            const introLine = stepNum === 1
                                                ? `Welcome to Step 1: **${stepLabel}**\n\n${prevCtx}`
                                                : `Welcome to Step ${stepNum}: **${stepLabel}**\n\n${prevCtx}`;
                                            let greetingText;
                                            if (missingPrereq && stepNum > 1) {
                                                // v7.13.45: Missing prerequisite — guide student back
                                                const prereqLabel = missingPrereq.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                const prereqStep = missingPrereq === 'writer_profile' ? 1 : missingPrereq === 'story_ideas' ? 2 : missingPrereq === 'logline' ? 3 : missingPrereq === 'brief_outline' ? 4 : missingPrereq === 'plot_structure_choice' ? 5 : missingPrereq === 'plot_outline' ? 6 : stepNum - 1;
                                                greetingText = `Welcome to Step ${stepNum}: **${stepLabel}**\n\nIt looks like you haven\u2019t completed **Step ${prereqStep}** yet \u2014 I need your **${prereqLabel}** from that step before we can begin this one.\n\nPlease go back to **Step ${prereqStep}** and complete it first. You can use the **Back to Steps** button below to return to the step dashboard.\n\nOnce you\u2019ve finished Step ${prereqStep}, come back here and everything will be ready to go.`;
                                            } else if (stepNum === 1) {
                                                // Step 1 only: full Inside Out intro
                                                greetingText = `${introLine}\n\nIn this course, you\u2019ll experience what it\u2019s like to create a story from the inside \u2014 the same process that professional writers use. We call this the **Inside Out** technique.\n\nYou\u2019ll achieve two things: first, you\u2019ll craft a deeply meaningful and satisfying story of your own. Second, by experiencing the creative process yourself, you\u2019ll build a much deeper understanding of *why* authors make the choices they do \u2014 and that insight is exactly what powers top-level essays when you\u2019re analysing literature.\n\nWhen you\u2019re ready, hit the button below and let\u2019s get started.`;
                                            } else {
                                                // Steps 2+: context-aware, no generic Inside Out repeat
                                                greetingText = `${introLine}\n\nWhen you\u2019re ready, hit the button below and let\u2019s get started.`;
                                            }
                                            addChatMessage(formatAI(greetingText), 'ai', greetingText);
                                            canvasChatHistory.push({ role: 'assistant', content: greetingText });
                                            saveCanvasChat(canvasChatHistory, canvasChatId);

                                            // Quick action: "Let's begin" or "Back to Steps" button
                                            setTimeout(() => {
                                                const startBar = el('div', { className: 'swml-quick-actions' });
                                                if (missingPrereq && stepNum > 1) {
                                                    // Missing prerequisite — show "Back to Steps" button
                                                    startBar.appendChild(el('button', {
                                                        className: 'swml-quick-btn',
                                                        textContent: 'Back to Steps',
                                                        onClick: () => { startBar.remove(); closeCanvasOverlay(); WML.renderCreativeWritingDashboard(); }
                                                    }));
                                                } else {
                                                    startBar.appendChild(el('button', {
                                                        className: 'swml-quick-btn',
                                                        textContent: "Let's begin",
                                                        onClick: () => { startBar.remove(); chatTextarea.value = "Let's begin!"; sendCanvasMessage(); }
                                                    }));
                                                }
                                                const greetBubble = chatMessages.lastElementChild;
                                                if (greetBubble) {
                                                    const bc = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                                                    bc.appendChild(startBar);
                                                }
                                            }, 50);

                                            console.log('WML CW: Greeting shown for', state.task);
                                            }, 400);
                                        } else if (state.task === 'assessment') {
                                            // v7.14.48: Narrowed to assessment only (was catch-all).
                                            // Training-env exercises now render directly via buildTrainingPanels().
                                            setTimeout(() => {
                                            const assessTextName = state.textName || state.text || 'your text';
                                            // v7.14.28: Use response-only word count — no fallback to full doc count
                                            // (fallbacks were counting template/prompt text as student words)
                                            const assessWc = getResponseWordCount(canvasEditor);
                                            // Extract essay question from document + store in state (v7.12.33)
                                            const questionText = extractEssayQuestion(canvasEditor);
                                            if (questionText) state.question = questionText;
                                            const questionSnippet = questionText ? `\n\nYour essay question: **${questionText}**` : '';
                                            const questionHTML = questionText ? `<div style="margin-bottom:12px;padding:10px 14px;background:rgba(81,218,207,0.06);border-left:3px solid rgba(81,218,207,0.3);border-radius:0 8px 8px 0"><p style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px">Your essay question:</p><p style="font-size:13px;font-style:italic">${questionText}</p></div>` : '';
                                            const firstName = (config.userName || '').split(' ')[0] || 'there';
                                            // v7.14.43: Context-aware greeting — exam practice has no "diagnostic"
                                            const assessEssayLabel = (state.mode === 'exam_prep') ? `${assessTextName} essay` : `${assessTextName} diagnostic essay`;
                                            const greetingText = `Hi ${firstName}! Welcome to the assessment phase. I've received your ${assessEssayLabel} (${assessWc} words). Let's review your writing together.${questionSnippet}\n\nBefore I begin marking, I need to know: what grade are you aiming for? This helps me tailor my feedback to where you want to be.`;
                                            const infoNote = '<div style="margin-bottom:14px;padding:10px 14px;background:rgba(83,51,237,0.08);border-left:3px solid rgba(83,51,237,0.3);border-radius:0 8px 8px 0;font-size:12px;color:rgba(255,255,255,0.6)">This assessment takes approximately <strong style="color:rgba(255,255,255,0.8)">20-25 minutes</strong>. Complete all 8 steps to receive your full score, grade, and personalised feedback.</div>';
                                            addChatMessage(`${infoNote}<div style="margin-bottom:12px"><p>Hi <strong>${firstName}</strong>! Welcome to the assessment phase.</p></div><div style="margin-bottom:12px"><p>I've received your <strong>${assessTextName}</strong> ${(state.mode === 'exam_prep') ? 'essay' : 'diagnostic essay'} (<strong>${assessWc} words</strong>). Let's review your writing together.</p></div>${questionHTML}<p>Before I begin marking, I need to know: <strong>what grade are you aiming for?</strong> This helps me tailor my feedback to where you want to be.</p>`, 'ai', greetingText);
                                            canvasChatHistory.push({ role: 'assistant', content: greetingText });
                                            saveCanvasChat(canvasChatHistory, canvasChatId);

                                            // Grade target buttons — append after DOM settles (v7.12.35)
                                            setTimeout(() => {
                                                const gradeBar = el('div', { className: 'swml-quick-actions' });
                                                ['Grade 9', 'Grade 8', 'Grade 7'].forEach(g => {
                                                    gradeBar.appendChild(el('button', {
                                                        className: 'swml-quick-btn',
                                                        textContent: g,
                                                        onClick: () => { gradeBar.remove(); chatTextarea.value = g; sendCanvasMessage(); }
                                                    }));
                                                });
                                                const greetBubble = chatMessages.lastElementChild;
                                                if (greetBubble) {
                                                    const bubbleContent = greetBubble.querySelector('.swml-bubble-content') || greetBubble;
                                                    bubbleContent.appendChild(gradeBar);
                                                    console.log('WML: Grade quick action buttons appended to greeting');
                                                } else {
                                                    console.warn('WML: Could not find greeting bubble for grade buttons');
                                                }
                                            }, 50);
                                            // Path B (Diagnostic → Assessment): init state even for fresh greeting (v7.12.22)
                                            initAssessmentState();
                                            }, 200); // 200ms lets CharacterCount sync + DOM render
                                        }

                                        // Scroll document to absolute top on assessment entry
                                        setTimeout(() => {
                                            const editor = document.getElementById('swml-tiptap-editor');
                                            const scrollContainer = editor?.closest('.swml-canvas-content');
                                            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 600);
                                        })(); // end chat persistence IIFE
                                    }, 400);
                                });
                            } // end simultaneous build block
                        }, canvasInAssessment ? 200 : 580); // v7.12.47: wait for full staggered fade (300ms + 240ms delay)

                        // Hide reopen button and word count widget in assessment
                        reopenBtn.style.display = 'none';
                        const wcW = document.getElementById('swml-wc-widget');
                        if (wcW) { wcW.style.transition = 'opacity 0.3s ease'; wcW.style.opacity = '0'; setTimeout(() => { wcW.style.display = 'none'; }, 300); }
                        // Stop timer in assessment mode
                        if (canvasTimerInterval) { clearInterval(canvasTimerInterval); canvasTimerInterval = null; }
                        // Hide reset button (only available in diagnostic mode)
                        resetBtn.style.display = 'none';

                        // Mark assessment mode active (controls Note button visibility)
                        canvasInAssessment = true;
                        state.step = 0; // Reset so initAssessmentState can restore from chat history (v7.12.32)
                        // v7.13.37: Preserve CW task + mark_scheme task — only set 'assessment' for diagnostic→assessment transition
                        if (state.task !== 'mark_scheme' && state.task !== 'planning' && state.task !== 'polishing' && !(state.task && state.task.startsWith('cw_')) && !isExamPrep) state.task = 'assessment';

                        // Show notepad in assessment mode (it was hidden during diagnostic)
                        if (snFab) snFab.style.display = '';
                        if (snPanel) snPanel.style.display = '';
                        // Restore the vertical "Take Notes" sidebar tab + mobile FAB trigger
                        document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger, [class*="sticky-note-tab"], [class*="notes-tab"]').forEach(t => t.style.display = '');
                        const snFabTriggerRestore = document.getElementById('snFabTrigger');
                        if (snFabTriggerRestore) snFabTriggerRestore.style.display = '';
                        document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]').forEach(t => {
                            if (t.textContent.trim() === 'Take Notes' || t.textContent.trim() === 'TakeNotes') t.style.display = '';
                        });
                    });
                    modalOverlay.appendChild(modal);
                    canvas.appendChild(modalOverlay);
                });
            diagCompleteBtn = markCompleteBtn;
            rightPanel.appendChild(markCompleteBtn);

            // ── Persistent diagnostic completion state (v7.12.30) ──
            // On re-entry, check if diagnostic was already submitted → green bar + disabled button + nav link
            // Signal 1: phase status is "complete" (assessment done)
            // Signal 2: assessment chat exists (diagnostic submitted, assessment in progress or done)
            if (!canvasInAssessment) {
                (async () => {
                    try {
                        // Check phase status first
                        const phaseUrl = `${API.phaseStatus}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${state.topicNumber || 1}`;
                        const phaseRes = await apiGet(phaseUrl);
                        const currentPhase = state.phase === 'redraft' ? 'redraft' : 'initial';
                        const phaseData = phaseRes[currentPhase];
                        const phaseComplete = phaseData && (phaseData.status === 'complete' || phaseData.status === 'submitted');

                        // Also check if assessment chat exists (means diagnostic was submitted)
                        const savedChat = loadCanvasChat();
                        const hasAssessmentChat = savedChat && savedChat.history && savedChat.history.length > 0;

                        // Signal 3: diagnostic submitted flag (set when student confirms submission, v7.12.32)
                        let diagSubmitted = false;
                        try { diagSubmitted = !!localStorage.getItem(`swml_diag_submitted_${state.board}_${state.text}_${state.topicNumber || 'free'}`); } catch (e) {}

                        if (phaseComplete || hasAssessmentChat || diagSubmitted) {
                            // Deadline bar → green
                            const dlFill = document.getElementById('swml-deadline-fill');
                            if (dlFill) dlFill.style.cssText = 'height:100%;border-radius:3px;width:100%;background:#1CD991;animation:none;';
                            // Button → Complete (disabled)
                            if (diagCompleteBtn) {
                                diagCompleteBtn.innerHTML = SVG_COMPLETE_CHECK + ' Complete';
                                diagCompleteBtn.disabled = true;
                                diagCompleteBtn.style.opacity = '0.5';
                                diagCompleteBtn.style.cursor = 'default';
                                diagCompleteBtn.style.display = 'block';
                            }
                            // v7.14.29: "Go to Assessment" button removed — exercises decoupled, LD handles sequencing
                        }
                    } catch (e) { console.log('WML: Diagnostic completion check failed:', e); }
                })();
            }
        }

        // ── Sequence Navigation Buttons (v7.12.85) ──
        // Show Previous / Next buttons for navigating between exercise steps
        // v7.14.13: Skip for diagnostic (task='') — LearnDash handles exercise transitions
        // v7.14.48: Also skip for feedback_discussion (LD handles nav), and all training-env exercises
        if (state.topicNumber && state.task && !canvasInFeedback && !useTrainingEnv) {
            const PHASE1_SEQ = [
                { id: 'diagnostic', task: '', label: 'Write Essay' },
                { id: 'assessment', task: 'assessment', label: 'Get Assessed' },
                { id: 'feedback_discussion', task: 'feedback_discussion', label: 'Discuss Feedback' },
            ];
            const PHASE2_SEQ = [
                { id: 'mark_scheme', task: 'mark_scheme', label: 'Mark Scheme' },
                { id: 'model_answer', task: 'model_answer_video', label: 'Model Answer' },
                { id: 'planning', task: 'planning', label: 'Plan Redraft' },
                { id: 'outlining', task: 'outlining', label: 'Outline Essay' },
                { id: 'polishing', task: 'polishing', label: 'Polish Essay' },
                { id: 'reassessment', task: 'assessment', label: 'Get Reassessed' },
            ];
            const seq = state.phase === 'redraft' ? PHASE2_SEQ : PHASE1_SEQ;
            const currentTask = state.task || '';
            const currentIdx = seq.findIndex(s => s.task === currentTask);

            if (currentIdx >= 0) {
                const navWrap = el('div', { className: 'swml-seq-nav' });
                const prev = currentIdx > 0 ? seq[currentIdx - 1] : null;
                const next = currentIdx < seq.length - 1 ? seq[currentIdx + 1] : null;

                if (prev) {
                    navWrap.appendChild(el('button', {
                        className: 'swml-seq-btn swml-seq-prev',
                        innerHTML: `<span class="swml-seq-arrow">←</span> <span class="swml-seq-label">${prev.label}</span>`,
                        onClick: () => {
                            state.task = prev.task;
                            window.WML.renderCanvasWorkspace();
                        }
                    }));
                }
                if (next) {
                    const nextBtn = el('button', {
                        className: 'swml-seq-btn swml-seq-next',
                        innerHTML: `<span class="swml-seq-label">${next.label}</span> <span class="swml-seq-arrow">→</span>`,
                        onClick: () => {
                            state.task = next.task;
                            window.WML.renderCanvasWorkspace();
                        }
                    });
                    navWrap.appendChild(nextBtn);
                }
                rightPanel.appendChild(navWrap);
            }
        }

        // Sidebar — single clean toggle via header click
        let sidebarOpen = true;
        const panelHeader = rightPanel.querySelector('h3');
        if (panelHeader) {
            panelHeader.style.cursor = 'pointer';
            panelHeader.addEventListener('click', () => {
                if (sidebarOpen) {
                    rightPanel.classList.add('swml-canvas-plan-fading');
                    setTimeout(() => { rightPanel.classList.add('swml-canvas-plan-hidden'); reopenBtn.style.opacity = '1'; reopenBtn.style.pointerEvents = 'auto'; }, 300);
                }
                sidebarOpen = false;
            });
        }

        // Reopen button — top-right, plus icon, child of canvas
        const reopenBtn = el('button', {
            className: 'swml-canvas-reopen-btn',
            title: 'Show guidance',
            innerHTML: '＋',
            onClick: () => {
                rightPanel.classList.remove('swml-canvas-plan-hidden');
                setTimeout(() => { rightPanel.classList.remove('swml-canvas-plan-fading'); }, 50);
                reopenBtn.style.opacity = '0';
                reopenBtn.style.pointerEvents = 'none';
                sidebarOpen = true;
            }
        });
        reopenBtn.style.opacity = '0';
        reopenBtn.style.pointerEvents = 'none';
        canvas.appendChild(rightPanel);
        canvas.appendChild(reopenBtn);

        // v7.13.77: Insert exam prep protocol panel (deferred from earlier branch)
        if (canvas._epProtoPanel) {
            const editorPane = canvas.querySelector('.swml-canvas-editor-pane') || contentWrap.parentElement;
            if (editorPane) canvas.insertBefore(canvas._epProtoPanel, editorPane);
            else canvas.prepend(canvas._epProtoPanel);
            delete canvas._epProtoPanel;
        }

        // v7.14.48: Training-env exercises hide rightPanel in their own branch (buildTrainingPanels).
        // This guard is kept ONLY for the legacy diagnostic→assessment transition (no longer auto-triggered).
        if (canvasInAssessment && !useTrainingEnv) {
            rightPanel.style.display = 'none';
            reopenBtn.style.display = 'none';
        }

        // Draggable floating word count widget
        const wcWidget = el('div', { className: 'swml-wc-widget', id: 'swml-wc-widget' });
        const wcWidgetLabel = el('span', { id: 'swml-wc-widget-label', textContent: `0 / ${canvasWordTarget}` });
        const wcWidgetClose = el('button', {
            className: 'swml-wc-widget-close',
            textContent: '×',
            title: 'Hide word count',
            onClick: () => {
                wcWidget.style.display = 'none';
                wcRestore.style.display = 'inline';
            }
        });
        wcWidget.appendChild(wcWidgetLabel);
        wcWidget.appendChild(wcWidgetClose);
        canvas.appendChild(wcWidget);

        // Restore link for status bar
        wcRestore = el('button', {
            style: { display: 'none', background: 'none', border: 'none', color: 'rgba(81,218,207,0.6)', cursor: 'pointer', fontSize: '11px', padding: '0', textDecoration: 'underline' },
            textContent: 'Show word count',
            onClick: () => {
                wcWidget.style.display = 'flex';
                wcRestore.style.display = 'none';
            }
        });
        wcRestorePlaceholder.replaceWith(wcRestore);

        // Make widget draggable
        let wcDragging = false, wcOffX = 0, wcOffY = 0;
        wcWidget.addEventListener('mousedown', (e) => {
            if (e.target === wcWidgetClose) return;
            wcDragging = true;
            wcOffX = e.clientX - wcWidget.offsetLeft;
            wcOffY = e.clientY - wcWidget.offsetTop;
            wcWidget.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!wcDragging) return;
            wcWidget.style.left = (e.clientX - wcOffX) + 'px';
            wcWidget.style.top = (e.clientY - wcOffY) + 'px';
            wcWidget.style.right = 'auto';
            wcWidget.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => { wcDragging = false; wcWidget.style.cursor = 'grab'; });

        overlay.appendChild(canvas);
        overlay.dataset.swmlTheme = getTheme(); // Ensure CSS variables work
        // Remove old overlay just before appending new one — zero-gap swap prevents shader flash (v7.12.32)
        if (existing) existing.remove();
        // v7.13.13: Embedded mode — render inside the embed container, not as fullscreen overlay
        if (WML.isEmbedded) {
            const embedHost = document.getElementById('swml-embedded-root') || document.body;
            overlay.classList.add('swml-canvas-embedded');
            embedHost.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        }

        // Inject progress bar keyframes (failsafe — CSS file may not load in time)
        if (!document.getElementById('swml-progress-keyframes')) {
            const kfStyle = document.createElement('style');
            kfStyle.id = 'swml-progress-keyframes';
            kfStyle.textContent = '@keyframes swmlProgressShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }';
            document.head.appendChild(kfStyle);
        }

        // Hide notepad during diagnostic (no assistance allowed)
        // v7.14.48: Training-env exercises get notepad immediately — only hide for diagnostic (free-env)
        const snFab = document.querySelector('.sn-fab');
        const snPanel = document.querySelector('.sn-panel');
        if (!useTrainingEnv) {
            if (snFab) snFab.style.display = 'none';
            if (snPanel) snPanel.style.display = 'none';
            document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger, [class*="sticky-note-tab"], [class*="notes-tab"]').forEach(t => t.style.display = 'none');
            const snFabTrigger = document.getElementById('snFabTrigger');
            if (snFabTrigger) snFabTrigger.style.display = 'none';
            document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]').forEach(t => {
                if (t.textContent.trim() === 'Take Notes' || t.textContent.trim() === 'TakeNotes') t.style.display = 'none';
            });
        }

        // Cinematic entrance handled by CSS @keyframes canvasRevealForward

        // ── Comment System ──
        const commentKey = `swml_comments_${state.board}_${(state.text || '').replace(/\s/g, '_')}`;
        let comments = {};
        try { comments = JSON.parse(localStorage.getItem(commentKey)) || {}; } catch(e) {}

        function saveComments() {
            try { localStorage.setItem(commentKey, JSON.stringify(comments)); } catch(e) {}
            if (typeof updateCommentGutter === 'function') requestAnimationFrame(updateCommentGutter);
            if (typeof updateCommentCount === 'function') updateCommentCount();
        }

        // Custom Comment Mark — wraps selected text with a comment ID
        const CommentMark = Mark.create({
            name: 'comment',
            addAttributes() {
                return {
                    commentId: {
                        default: null,
                        parseHTML: element => element.getAttribute('data-comment-id'),
                        renderHTML: attributes => {
                            if (!attributes.commentId) return {};
                            return { 'data-comment-id': attributes.commentId };
                        },
                    },
                };
            },
            parseHTML() {
                return [{ tag: 'span[data-comment-id]' }];
            },
            renderHTML({ HTMLAttributes }) {
                const id = HTMLAttributes['data-comment-id'] || HTMLAttributes.commentId;
                const isResolved = comments[id]?.resolved;
                return ['span', {
                    'data-comment-id': id,
                    class: 'swml-comment-mark' + (isResolved ? ' swml-comment-resolved' : ''),
                    title: 'Click to view comment thread',
                }, 0];
            },
        });

        // ── Section Block Node (v7.10.169) ──
        // Structured document zones: question, plan, outline, response, feedback, scores, action
        const SectionBlock = Node.create({
            name: 'sectionBlock',
            group: 'block',
            content: 'block+',
            defining: true,
            isolating: true,

            addAttributes() {
                return {
                    sectionType: {
                        default: 'response',
                        parseHTML: el => el.getAttribute('data-section-type') || 'response',
                        renderHTML: attrs => ({ 'data-section-type': attrs.sectionType || 'response' }),
                    },
                    label: {
                        default: '',
                        parseHTML: el => el.getAttribute('data-section-label') || '',
                        renderHTML: attrs => {
                            const fallback = (attrs.sectionType || 'response').charAt(0).toUpperCase() + (attrs.sectionType || 'response').slice(1);
                            return { 'data-section-label': attrs.label || fallback };
                        },
                    },
                    editable: {
                        default: true,
                        parseHTML: el => el.getAttribute('data-editable') !== 'false',
                        renderHTML: attrs => ({ 'data-editable': String(attrs.editable) }),
                    },
                    partNumber: {
                        default: null,
                        parseHTML: el => el.getAttribute('data-part') ? parseInt(el.getAttribute('data-part')) : null,
                        renderHTML: attrs => attrs.partNumber ? { 'data-part': String(attrs.partNumber) } : {},
                    },
                };
            },

            parseHTML() {
                return [{ tag: 'div[data-section-type]' }];
            },

            renderHTML({ HTMLAttributes, node }) {
                const type = node.attrs.sectionType || 'response';
                const label = node.attrs.label || type.charAt(0).toUpperCase() + type.slice(1);
                const readOnly = node.attrs.editable === false;
                return ['div', {
                    ...HTMLAttributes,
                    ...(readOnly ? { 'data-readonly': 'true' } : {}),
                    class: `swml-section-block swml-section-${type}${readOnly ? ' swml-section-readonly' : ''}`,
                }, 0];
            },

            addKeyboardShortcuts() {
                return {
                    Backspace: () => isSectionBoundary(this.editor.state, 'backspace'),
                    Delete: () => isSectionBoundary(this.editor.state, 'delete'),
                };
            },
        });

        // ── InputField Node (v7.14.28) ──
        // A styled paragraph-like block with visible borders and a prompt label.
        // Content is managed by TipTap (inline*), so comments, dictation, and toolbar all work.
        // Renders as: <div class="swml-input-field" data-prompt="..."><p>student text</p></div>
        const InputField = Node.create({
            name: 'inputField',
            group: 'block',
            content: 'inline*',
            defining: true,

            addAttributes() {
                return {
                    prompt: {
                        default: '',
                        parseHTML: el => el.getAttribute('data-prompt') || '',
                        renderHTML: attrs => ({ 'data-prompt': attrs.prompt || '' }),
                    },
                    fieldId: {
                        default: '',
                        parseHTML: el => el.getAttribute('data-field-id') || '',
                        renderHTML: attrs => attrs.fieldId ? { 'data-field-id': attrs.fieldId } : {},
                    },
                };
            },

            parseHTML() {
                return [{ tag: 'div[data-input-field]' }];
            },

            renderHTML({ HTMLAttributes }) {
                return ['div', {
                    ...HTMLAttributes,
                    'data-input-field': 'true',
                    class: 'swml-input-field',
                }, 0];
            },

            addKeyboardShortcuts() {
                return {
                    // Enter inside an input field creates a new line within the field (not a new paragraph outside)
                    Enter: ({ editor }) => {
                        const { $from } = editor.state.selection;
                        for (let d = $from.depth; d >= 0; d--) {
                            if ($from.node(d).type.name === 'inputField') {
                                editor.commands.insertContent({ type: 'hardBreak' });
                                return true;
                            }
                        }
                        return false;
                    },
                };
            },
        });

        // ── Section Protection (v7.12.58) ──
        // Prevents students from accidentally deleting section structure via Backspace/Delete at boundaries.
        // Backspace at the start of a section → blocked (no merge with previous section)
        // Delete at the end of a section → blocked (no merge with next section)
        // Content within sections can still be freely edited.
        function isSectionBoundary(state, direction) {
            const { $from, $to, empty } = state.selection;
            if (!empty) {
                // Selection spans multiple sections — check if from/to are in different sectionBlocks
                const fromSection = $from.node($from.depth);
                const toSection = $to.node($to.depth);
                // Walk up to find sectionBlock ancestors
                let fromSB = null, toSB = null;
                for (let d = $from.depth; d >= 0; d--) {
                    if ($from.node(d).type.name === 'sectionBlock') { fromSB = { node: $from.node(d), depth: d }; break; }
                }
                for (let d = $to.depth; d >= 0; d--) {
                    if ($to.node(d).type.name === 'sectionBlock') { toSB = { node: $to.node(d), depth: d }; break; }
                }
                // If selection spans different sections, block the delete — sections would merge
                if (fromSB && toSB && fromSB.depth === toSB.depth) {
                    const fromPos = $from.before(fromSB.depth);
                    const toPos = $to.before(toSB.depth);
                    if (fromPos !== toPos) return true;
                }
                // If selection includes a divider section, block
                let hasDivider = false;
                state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                    if (node.type.name === 'sectionBlock' && node.attrs.sectionType === 'divider') hasDivider = true;
                });
                if (hasDivider) return true;
                return false;
            }
            // Empty selection (cursor) — check boundary
            if (direction === 'backspace') {
                // At very start of a sectionBlock?
                for (let d = $from.depth; d >= 1; d--) {
                    if ($from.node(d).type.name === 'sectionBlock') {
                        // Check if cursor is at the start of this section
                        if ($from.parentOffset === 0 && $from.index(d) === 0) {
                            // At the absolute start — check depth all the way up
                            let atStart = true;
                            for (let dd = d + 1; dd <= $from.depth; dd++) {
                                if ($from.index(dd) !== 0 || $from.parentOffset !== 0) { atStart = false; break; }
                            }
                            // Actually simplify: check textOffset
                            if ($from.textOffset === 0) {
                                // Walk up from cursor to sectionBlock, check if we're at pos 0 within the section
                                const sectionStart = $from.start(d);
                                if ($from.pos === sectionStart) return true;
                            }
                        }
                        break;
                    }
                }
            } else if (direction === 'delete') {
                for (let d = $from.depth; d >= 1; d--) {
                    if ($from.node(d).type.name === 'sectionBlock') {
                        const sectionEnd = $from.end(d);
                        if ($from.pos === sectionEnd) return true;
                        break;
                    }
                }
            }
            return false;
        }

        // Comment thread popover
        let activePopover = null;
        function closeCommentPopover() {
            if (activePopover) { activePopover.remove(); activePopover = null; }
        }

        function showCommentPopover(commentId, anchorEl, popoverContainer) {
            closeCommentPopover();
            const c = comments[commentId];
            if (!c) return;

            const pop = el('div', { className: 'swml-comment-popover' });

            // Header — TipTap style: Title | resolve | ⋯ menu | ✕ close
            const header = el('div', { className: 'swml-comment-header' });
            header.appendChild(el('span', { className: 'swml-comment-title', textContent: 'Thread' }));
            const headerRight = el('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } });

            // Resolve icon button (checkmark circle)
            const resolveIcon = el('button', {
                className: 'swml-comment-icon-btn',
                innerHTML: c.resolved
                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l4 4 14-14"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
                title: c.resolved ? 'Reopen thread' : 'Resolve thread',
                onClick: () => {
                    c.resolved = !c.resolved;
                    saveComments();
                    const marks = editorEl.querySelectorAll(`[data-comment-id="${commentId}"]`);
                    marks.forEach(m => m.classList.toggle('swml-comment-resolved', c.resolved));
                    showCommentPopover(commentId, anchorEl, popoverContainer);
                }
            });
            headerRight.appendChild(resolveIcon);

            // Three-dot menu button
            const dotsWrap = el('div', { style: { position: 'relative' } });
            const dotsBtn = el('button', {
                className: 'swml-comment-icon-btn',
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
                title: 'More options',
                onClick: (ev) => {
                    ev.stopPropagation();
                    dotsMenu.style.display = dotsMenu.style.display === 'block' ? 'none' : 'block';
                }
            });
            const dotsMenu = el('div', { className: 'swml-comment-dots-menu', style: { display: 'none' } });
            // Resolve option
            dotsMenu.appendChild(el('button', {
                className: 'swml-comment-dots-item',
                innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> ' + (c.resolved ? 'Reopen' : 'Resolve'),
                onClick: () => {
                    c.resolved = !c.resolved;
                    saveComments();
                    const marks = editorEl.querySelectorAll(`[data-comment-id="${commentId}"]`);
                    marks.forEach(m => m.classList.toggle('swml-comment-resolved', c.resolved));
                    showCommentPopover(commentId, anchorEl, popoverContainer);
                }
            }));
            // Copy link
            dotsMenu.appendChild(el('button', {
                className: 'swml-comment-dots-item',
                innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link',
                onClick: () => {
                    const link = window.location.href.split('#')[0] + '#comment-' + commentId;
                    navigator.clipboard.writeText(link).catch(() => {});
                    dotsMenu.style.display = 'none';
                    showToast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> <strong>Link copied!</strong> Deep-linking coming soon.', 3000, true);
                    closeCommentPopover();
                }
            }));
            // Delete thread
            dotsMenu.appendChild(el('button', {
                className: 'swml-comment-dots-item swml-comment-dots-danger',
                innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete thread',
                onClick: () => {
                    const { from, to } = findCommentRange(commentId);
                    if (from !== null) {
                        canvasEditor.chain().focus()
                            .setTextSelection({ from, to })
                            .unsetMark('comment')
                            .run();
                    }
                    delete comments[commentId];
                    saveComments();
                    closeCommentPopover();
                }
            }));
            dotsWrap.appendChild(dotsBtn);
            dotsWrap.appendChild(dotsMenu);
            headerRight.appendChild(dotsWrap);

            // Close button
            headerRight.appendChild(el('button', {
                className: 'swml-comment-icon-btn',
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
                title: 'Close',
                onClick: closeCommentPopover
            }));
            header.appendChild(headerRight);
            pop.appendChild(header);

            // Thread messages — Facebook-style with indented replies (v7.12.69)
            const threadWrap = el('div', { className: 'swml-comment-thread' });

            function renderThreadMessages() {
                threadWrap.innerHTML = '';
                (c.thread || []).forEach((msg, idx) => {
                    const bubble = el('div', { className: 'swml-comment-msg' });
                    bubble.appendChild(el('div', { className: 'swml-comment-msg-author', textContent: msg.author + ' · ' + formatTimeAgo(msg.timestamp) }));
                    bubble.appendChild(el('div', { className: 'swml-comment-msg-text', textContent: msg.message }));
                    // Delete button on replies (not the original comment)
                    if (idx > 0) {
                        const delBtn = el('button', {
                            className: 'swml-comment-msg-delete',
                            innerHTML: '×',
                            title: 'Delete reply',
                            onClick: (e) => {
                                e.stopPropagation();
                                c.thread.splice(idx, 1);
                                saveComments();
                                renderThreadMessages(); // Inline update — no full refresh
                            }
                        });
                        bubble.appendChild(delBtn);
                    }
                    threadWrap.appendChild(bubble);
                });
                // Auto-scroll to bottom
                threadWrap.scrollTop = threadWrap.scrollHeight;
            }
            renderThreadMessages();
            pop.appendChild(threadWrap);

            // Reply input — inline add without popover refresh (v7.12.69)
            const replyWrap = el('div', { className: 'swml-comment-reply' });
            const replyInput = el('input', {
                type: 'text',
                placeholder: 'Reply to thread...',
                onKeydown: (e) => {
                    if (e.key === 'Enter' && replyInput.value.trim()) {
                        e.preventDefault();
                        c.thread.push({ author: 'Tutor', message: replyInput.value.trim(), timestamp: Date.now() });
                        saveComments();
                        renderThreadMessages();
                        replyInput.value = '';
                        replyInput.focus();
                    }
                }
            });
            const replyBtn = el('button', {
                textContent: '→',
                onClick: () => {
                    if (!replyInput.value.trim()) return;
                    c.thread.push({ author: 'Tutor', message: replyInput.value.trim(), timestamp: Date.now() });
                    saveComments();
                    renderThreadMessages();
                    replyInput.value = '';
                    replyInput.focus();
                }
            });
            replyWrap.appendChild(replyInput);
            replyWrap.appendChild(replyBtn);
            pop.appendChild(replyWrap);

            // Prevent TipTap editor from stealing focus when interacting with the popover (v7.12.68)
            pop.addEventListener('mousedown', (e) => {
                // Allow the input/button clicks but stop propagation so TipTap doesn't refocus
                e.stopPropagation();
            });

            // Position in the appropriate container
            const targetContainer = popoverContainer || contentWrap;
            const markRect = anchorEl.getBoundingClientRect();
            const cwRect = targetContainer.getBoundingClientRect();
            const scrollTop = popoverContainer ? targetContainer.querySelector('.swml-extract-panel-body')?.scrollTop || 0 : contentWrap.scrollTop;
            pop.style.top = (markRect.bottom - cwRect.top + scrollTop + 6) + 'px';
            pop.style.left = Math.max(8, Math.min(markRect.left - cwRect.left, cwRect.width - 320)) + 'px';

            targetContainer.appendChild(pop);
            activePopover = pop;
            pop._anchorCid = commentId;
        }

        function findCommentRange(commentId) {
            let from = null, to = null;
            canvasEditor.state.doc.descendants((node, pos) => {
                if (node.isText) {
                    const mark = node.marks.find(m => m.type.name === 'comment' && m.attrs.commentId === commentId);
                    if (mark) {
                        if (from === null) from = pos;
                        to = pos + node.nodeSize;
                    }
                }
            });
            return { from, to };
        }

        function formatTimeAgo(ts) {
            const diff = Date.now() - ts;
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'just now';
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            const days = Math.floor(hrs / 24);
            return `${days}d ago`;
        }

        // Quick comment presets — two-tier system (v7.14.53)
        const SVG_QC_ISSUE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        const SVG_QC_DOC = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
        const SVG_QC_PRAISE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M18 8h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/><path d="M6 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/></svg>';
        const SVG_QC_PEN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
        const SVG_QC_STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        const SVG_QC_CROP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>';

        const QUICK_COMMENTS = [
            // ── Tier 1: shown by default ──
            { category: 'Common Issues', tier: 'default', icon: SVG_QC_ISSUE, items: [
                { label: 'Redo', text: 'This section needs to be rewritten — it doesn\'t meet the required standard.' },
                { label: 'SPaG', text: 'Spelling, punctuation, and grammar errors here — please proofread carefully.' },
                { label: 'Plan your essay', text: 'Plan your essay before writing — a clear plan leads to a stronger structure.' },
                { label: 'Outline', text: 'Create a proper outline for this section before drafting.' },
                { label: 'Polish', text: 'This needs polishing — refine the expression and tighten the language.' },
                { label: 'Reassess', text: 'Reassess this section — the analysis doesn\'t align with the mark scheme criteria.' },
                { label: 'More detail', text: 'More detail needed — develop this point further.' },
                { label: 'Be specific', text: 'Be more specific — avoid vague or general statements.' },
                { label: 'Five paragraphs', text: 'Remember the five paragraph essay structure — introduction, three body paragraphs, conclusion.' },
                { label: 'Discourse markers', text: 'Use discourse markers and transitional phrases to connect your ideas and improve flow.' },
            ]},
            { category: 'Praise', tier: 'default', icon: SVG_QC_PRAISE, items: [
                { label: 'Good detail', text: 'Good detail here — well-developed point.' },
                { label: 'Perceptive', text: 'Perceptive response — this shows real insight.' },
                { label: 'Excellent analysis', text: 'Excellent close analysis — strong engagement with language.' },
                { label: 'Great topic sentence', text: 'Strong conceptual topic sentence — clear thematic link.' },
                { label: 'Well-evidenced', text: 'Well-evidenced — effective use of quotation.' },
                { label: 'Strong effect', text: 'Excellent exploration of effect on the reader.' },
                { label: 'Clear purpose', text: 'Clear understanding of the author\'s purpose — well linked to context.' },
                { label: 'Top level', text: 'Top level quality — this is exactly the standard we\'re aiming for.' },
            ]},
            // ── Tier 2: revealed by "More..." button ──
            { category: 'TTECEA Breakdown', tier: 'expanded', icon: SVG_QC_DOC, items: [
                { label: 'Needs topic sentence', text: 'Conceptual topic sentence needed — link your point to the wider theme.' },
                { label: 'Needs technique', text: 'Technique needed — identify the writer\'s method here (language, structure, symbolism).' },
                { label: 'Needs evidence', text: 'Evidence needed — embed a quote to support this point.' },
                { label: 'Needs inference', text: 'Inference needed — explain what this suggests about the character/theme.' },
                { label: 'Needs close analysis', text: 'Close analysis needed — zoom into specific words/phrases and explore connotations.' },
                { label: 'Needs effect 1', text: 'Effect on reader needed — how does this make the reader think or feel?' },
                { label: 'Needs effect 2', text: 'Second effect needed — explore an alternative interpretation or deeper impact.' },
                { label: 'Needs author\'s purpose', text: 'Author\'s purpose needed — why has the writer made this choice? Link to context.' },
                { label: 'Needs context', text: 'Context needed — connect this point to the historical, social, or literary context.' },
            ]},
            { category: 'Topic Sentence', tier: 'expanded', icon: SVG_QC_PEN, items: [
                { label: 'Too descriptive', text: 'Topic sentence is too descriptive — make it conceptual. Link to theme, not plot.' },
            ]},
            { category: 'Creative Writing', tier: 'expanded', icon: SVG_QC_STAR, items: [
                { label: 'Dynamic verbs & nouns', text: 'Use dynamic verbs and concrete nouns for vivid imagery.' },
                { label: 'Replace with metaphor', text: 'Consider replacing this with a metaphor for stronger impact.' },
                { label: 'Replace with simile', text: 'Consider using a simile here to create a vivid comparison.' },
            ]},
            { category: "Mad Father's Crops", tier: 'expanded', icon: SVG_QC_CROP, items: [
                { label: 'Try metaphor', text: 'Try using a metaphor here.' },
                { label: 'Try alliteration', text: 'Try using alliteration here for emphasis.' },
                { label: 'Try direct address', text: 'Try direct address to engage the reader.' },
                { label: 'Try foreshadowing', text: 'Try foreshadowing to build tension.' },
                { label: 'Try assonance', text: 'Try assonance to create a musical quality.' },
                { label: 'Try hyperbole', text: 'Try hyperbole to exaggerate for effect.' },
                { label: 'Try emotive language', text: 'Try emotive language to evoke feeling.' },
                { label: 'Try rhetorical question', text: 'Try a rhetorical question to provoke thought.' },
                { label: 'Try simile', text: 'Try a simile to create a vivid comparison.' },
                { label: 'Try contrast', text: 'Try contrast to highlight differences.' },
                { label: 'Try repetition', text: 'Try repetition for emphasis and rhythm.' },
                { label: 'Try onomatopoeia', text: 'Try onomatopoeia to bring sound into your writing.' },
                { label: 'Try personification', text: 'Try personification to bring an object or idea to life.' },
                { label: 'Try sibilance', text: 'Try sibilance (repeated "s" sounds) for a sinister or soothing effect.' },
            ]},
        ];

        function addComment(selFrom, selTo) {
            const from = selFrom ?? canvasEditor.state.selection.from;
            const to = selTo ?? canvasEditor.state.selection.to;
            if (from === to) return; // v7.14.48: silent return instead of alert
            const selectedText = canvasEditor.state.doc.textBetween(from, to);

            const overlay = el('div', { className: 'swml-comment-modal-overlay', onClick: (e) => { if (e.target === overlay) overlay.remove(); } });
            const modal = el('div', { className: 'swml-comment-modal' });

            const quote = selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText;
            modal.appendChild(el('div', { className: 'swml-comment-modal-quote', textContent: `"${quote}"` }));

            // Quick comment presets
            const quickWrap = el('div', { className: 'swml-quick-comments' });
            const textarea = el('textarea', {
                className: 'swml-comment-modal-textarea',
                placeholder: 'Add your comment or pick a quick comment below...',
                rows: 3,
            });

            // Render tier 1 (default) categories
            const expandedWrap = el('div', { className: 'swml-quick-expanded collapsed' });
            QUICK_COMMENTS.forEach(cat => {
                const catEl = el('div', { className: 'swml-quick-cat' });
                const catLabel = el('div', { className: 'swml-quick-cat-label', innerHTML: cat.icon + ' ' + cat.category });
                const chipsWrap = el('div', { className: 'swml-quick-chips' });
                // Collapsible: click header to toggle (expanded tier starts collapsed)
                if (cat.tier === 'expanded') {
                    chipsWrap.classList.add('swml-quick-chips-collapsible', 'collapsed');
                    catLabel.style.cursor = 'pointer';
                    catLabel.classList.add('swml-quick-cat-collapsible', 'collapsed');
                    catLabel.addEventListener('click', () => {
                        const isCollapsed = chipsWrap.classList.contains('collapsed');
                        chipsWrap.classList.toggle('collapsed', !isCollapsed);
                        catLabel.classList.toggle('collapsed', !isCollapsed);
                    });
                }
                catEl.appendChild(catLabel);
                const chipClass = cat.category === 'Praise' ? ' swml-quick-chip-praise'
                    : cat.category.startsWith('TTECEA') ? ' swml-quick-chip-ttecea'
                    : cat.category === 'Creative Writing' || cat.category === "Mad Father's Crops" ? ' swml-quick-chip-cw'
                    : '';
                cat.items.forEach(item => {
                    chipsWrap.appendChild(el('button', {
                        className: 'swml-quick-chip' + chipClass,
                        textContent: item.label,
                        title: item.text,
                        onClick: () => {
                            textarea.value = item.text;
                            textarea.focus();
                        }
                    }));
                });
                catEl.appendChild(chipsWrap);
                if (cat.tier === 'expanded') {
                    expandedWrap.appendChild(catEl);
                } else {
                    quickWrap.appendChild(catEl);
                }
            });
            // "More..." toggle button
            const moreBtn = el('button', {
                className: 'swml-quick-more-btn',
                textContent: 'More...',
                onClick: () => {
                    const isCollapsed = expandedWrap.classList.contains('collapsed');
                    expandedWrap.classList.toggle('collapsed', !isCollapsed);
                    moreBtn.textContent = isCollapsed ? 'Less' : 'More...';
                }
            });
            quickWrap.appendChild(moreBtn);
            quickWrap.appendChild(expandedWrap);
            modal.appendChild(quickWrap);

            modal.appendChild(el('label', { className: 'swml-comment-modal-label', textContent: 'Comment' }));
            modal.appendChild(textarea);

            const btnRow = el('div', { className: 'swml-comment-modal-btns' });
            btnRow.appendChild(el('button', {
                className: 'swml-comment-modal-cancel',
                textContent: 'Cancel',
                onClick: () => overlay.remove()
            }));
            btnRow.appendChild(el('button', {
                className: 'swml-comment-modal-submit',
                textContent: 'Add Comment',
                onClick: () => {
                    const msg = textarea.value.trim();
                    if (!msg) { textarea.focus(); return; }
                    const id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
                    comments[id] = {
                        id,
                        text: selectedText,
                        author: 'Tutor',
                        thread: [{ author: 'Tutor', message: msg, timestamp: Date.now() }],
                        resolved: false,
                        createdAt: Date.now(),
                    };
                    saveComments();
                    canvasEditor.chain().focus()
                        .setTextSelection({ from, to })
                        .setMark('comment', { commentId: id })
                        .run();
                    overlay.remove();
                    // Refresh comment count + gutter
                    setTimeout(() => { updateCommentCount(); updateCommentGutter(); }, 100);
                }
            }));
            modal.appendChild(btnRow);
            overlay.appendChild(modal);
            canvas.appendChild(overlay);
            setTimeout(() => textarea.focus(), 50);
        }

        // v7.14.48: Expose addComment to module scope so the once-registered
        // context toolbar event listener always calls the current render's function.
        _currentAddComment = addComment;

        // ── Canvas Selection Toolbar ──
        // Uses fresh DOM lookups (not closure refs) to survive re-renders.
        // Listeners registered on document only ONCE via flag.
        let canvasSelToolbar = null;
        function removeCanvasSelToolbar() {
            if (canvasSelToolbar) { canvasSelToolbar.remove(); canvasSelToolbar = null; }
        }

        if (!window._swmlCanvasSelRegistered) {
            window._swmlCanvasSelRegistered = true;

            document.addEventListener('mouseup', (e) => {
                setTimeout(() => {
                    const sel = window.getSelection();
                    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

                    // Find ProseMirror editor from anchor — fresh lookup every time
                    const anchor = sel.anchorNode;
                    const pm = anchor?.parentElement?.closest?.('.ProseMirror');
                    const wrap = pm?.closest('.swml-canvas-content');
                    if (!pm || !wrap) return;

                    const selectedText = sel.toString().trim();
                    if (selectedText.length < 2 || selectedText.length > 2000) return;

                    // Remove any existing toolbar
                    const old = wrap.querySelector('.swml-selection-toolbar');
                    if (old) old.remove();

                    const range = sel.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const wrapRect = wrap.getBoundingClientRect();

                    const tFrom = canvasEditor?.state?.selection?.from;
                    const tTo = canvasEditor?.state?.selection?.to;
                    if (tFrom == null || tTo == null || tFrom === tTo) return;

                    const quote = selectedText.length > 120 ? selectedText.substring(0, 120) + '...' : selectedText;
                    const hasChat = !!document.getElementById('swml-canvas-chat-input');

                    const tb = el('div', { className: 'swml-selection-toolbar swml-sel-neumorphic' });
                    canvasSelToolbar = tb;

                    // Comment
                    const SVG_CMT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
                    tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_CMT + ' <span>Comment</span>',
                        onClick: (ev) => {
                            ev.stopPropagation();
                            // Capture positions before toolbar removal (ProseMirror mutation may reset selection)
                            const capturedFrom = tFrom, capturedTo = tTo;
                            removeCanvasSelToolbar();
                            // v7.14.48: Use module-level ref (survives re-renders) instead of closure addComment
                            requestAnimationFrame(() => { if (_currentAddComment) _currentAddComment(capturedFrom, capturedTo); });
                        }
                    }));

                    if (hasChat) {
                        tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_REPLY + ' <span>Reply</span>',
                            onClick: (ev) => {
                                ev.stopPropagation();
                                const input = document.getElementById('swml-canvas-chat-input');
                                if (input) { input.value = `Regarding "${quote}" — `; input.focus(); }
                                removeCanvasSelToolbar(); sel.removeAllRanges();
                            }
                        }));
                        tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_INSERT + ' <span>Insert</span>',
                            onClick: (ev) => {
                                ev.stopPropagation();
                                const input = document.getElementById('swml-canvas-chat-input');
                                if (input) { input.value += (input.value && !input.value.endsWith(' ') ? ' ' : '') + selectedText; input.focus(); }
                                removeCanvasSelToolbar(); sel.removeAllRanges();
                            }
                        }));
                    }

                    tb.appendChild(el('button', { className: 'swml-sel-btn', innerHTML: SVG_SEL_COPY + ' <span>Copy</span>',
                        onClick: (ev) => {
                            ev.stopPropagation();
                            navigator.clipboard.writeText(selectedText).catch(() => document.execCommand('copy'));
                            removeCanvasSelToolbar(); sel.removeAllRanges();
                        }
                    }));

                    // Note — hidden in diagnostic mode (no assistance allowed)
                    const isDiagnosticMode = state.phase === 'initial' && state.mode === 'guided' && !canvasInAssessment;
                    if (!isDiagnosticMode) {
                        tb.appendChild(el('button', { className: 'swml-sel-btn swml-sel-notes', innerHTML: SVG_SEL_NOTE + ' <span>Note</span>',
                            onClick: (ev) => {
                                ev.stopPropagation();
                                sendToNotes(selectedText);
                                removeCanvasSelToolbar(); sel.removeAllRanges();
                            }
                        }));
                    }

                    // Append to measure, then position (matching chat toolbar pattern)
                    wrap.appendChild(tb);
                    const tbW = tb.offsetWidth;
                    tb.style.top = (rect.top - wrapRect.top + wrap.scrollTop - 40) + 'px';
                    tb.style.left = Math.max(0, (rect.left - wrapRect.left + rect.width / 2 - tbW / 2)) + 'px';
                }, 10);
            });

            document.addEventListener('mousedown', (e) => {
                if (canvasSelToolbar && !canvasSelToolbar.contains(e.target)) removeCanvasSelToolbar();
            });
        }

        // Click on commented text: show popover AND let cursor place (no stopPropagation)
        editorEl.addEventListener('click', (e) => {
            const mark = e.target.closest('[data-comment-id]');
            if (mark) {
                const cid = mark.dataset.commentId;
                // Delay lets TipTap finish DOM re-render, then find the FRESH element
                setTimeout(() => {
                    const freshMark = editorEl.querySelector(`[data-comment-id="${cid}"]`);
                    if (freshMark) showCommentPopover(cid, freshMark);
                }, 60);
            } else {
                closeCommentPopover();
            }
        });

        // v7.13.45: CW resource buttons — open URL in new tab
        editorEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.swml-cw-resource-btn');
            if (btn && btn.dataset.href) {
                e.preventDefault();
                e.stopPropagation();
                window.open(btn.dataset.href, '_blank', 'noopener');
            }
        });

        // Close popover on outside click (exclude comment marks, bubbles, and theme toggle)
        canvas.addEventListener('click', (e) => {
            if (activePopover && !activePopover.contains(e.target) && !e.target.closest('[data-comment-id]') && !e.target.closest('.swml-comment-bubble') && !e.target.closest('.theme-toggle') && !e.target.closest('.swml-comment-popover')) {
                closeCommentPopover();
            }
        });

        // ── Comment Gutter Indicators (TipTap-style bubbles) ──
        const BUBBLE_POINTER_SVG = '<svg width="16" height="7" viewBox="0 0 16 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="swml-bubble-pointer"><path d="M0 0H16H12.8062C10.9897 0 9.22719 0.618246 7.80869 1.75305L2.43704 6.05036C1.4549 6.83608 0 6.13682 0 4.87906V0Z"></path></svg>';
        const avatarUrl = config.userAvatar || '';

        function updateCommentGutter() {
            gutterWrap.innerHTML = '';
            const marks = editorEl.querySelectorAll('[data-comment-id]');
            const seen = new Set();

            marks.forEach(markEl => {
                const cid = markEl.dataset.commentId;
                if (seen.has(cid)) return;
                seen.add(cid);
                const c = comments[cid];
                if (!c) return;

                // Position: top of avatar aligns with top of the commented text's first line
                // Use getBoundingClientRect relative to docWrap, adjusted for zoom
                const markRect = markEl.getBoundingClientRect();
                const docRect = docWrap.getBoundingClientRect();
                const zoom = canvasZoom || 1;
                const top = (markRect.top - docRect.top) / zoom;

                const bubble = el('div', {
                    className: 'swml-comment-bubble' + (c.resolved ? ' swml-comment-bubble-resolved' : ''),
                    title: `${c.author}: ${(c.thread?.[0]?.message || '').substring(0, 60)}`,
                });

                const btn = el('button', {
                    className: 'swml-comment-bubble-btn',
                    onClick: (ev) => { ev.stopPropagation(); showCommentPopover(cid, markEl); },
                });

                // Avatar
                const initials = (c.author || 'T').substring(0, 1).toUpperCase();
                if (avatarUrl) {
                    const img = el('img', { className: 'swml-comment-bubble-avatar', src: avatarUrl, alt: c.author || 'T' });
                    img.onerror = () => {
                        img.replaceWith(el('span', { className: 'swml-comment-bubble-initials', textContent: initials }));
                    };
                    btn.appendChild(img);
                } else {
                    btn.appendChild(el('span', { className: 'swml-comment-bubble-initials', textContent: initials }));
                }

                // Pointer SVG
                const pointerWrap = document.createElement('span');
                pointerWrap.innerHTML = BUBBLE_POINTER_SVG;
                btn.appendChild(pointerWrap.firstChild);

                bubble.appendChild(btn);
                bubble.style.top = top + 'px';
                gutterWrap.appendChild(bubble);
            });
        }

        // Gutter needs updating on scroll since we use getBoundingClientRect
        // Also reposition active popover to follow its anchor
        contentWrap.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                updateCommentGutter();
                if (activePopover && activePopover._anchorCid) {
                    const freshMark = editorEl.querySelector(`[data-comment-id="${activePopover._anchorCid}"]`);
                    if (freshMark) {
                        const markRect = freshMark.getBoundingClientRect();
                        const cwRect = contentWrap.getBoundingClientRect();
                        activePopover.style.top = (markRect.bottom - cwRect.top + contentWrap.scrollTop + 6) + 'px';
                        activePopover.style.left = Math.min(markRect.left - cwRect.left, cwRect.width - 320) + 'px';
                    }
                }
            });
        });

        // ── Initialise TipTap Editor ──
        let savedContent = loadCanvasContent();
        // v7.13.42: CW tasks — always clear stale localStorage so fresh template loads
        // CW documents are saved as project artifacts on the server, not localStorage
        if (isCwTask) {
            savedContent = '';
        }
        // v7.14.9: Discard stale generic template (pre-v7.14.8 format without section blocks)
        // The old getDefaultEssayTemplate() used bare <h2> headings with no data-section-type.
        // If that's what's in localStorage, discard it so the board-aware template loads cleanly.
        if (savedContent && !savedContent.includes('data-section-type') && /^<h2>Introduction<\/h2>/.test(savedContent.trim())) {
            console.log('WML: Discarding stale generic template from localStorage');
            try { localStorage.removeItem(CANVAS_SAVE_KEY()); } catch(e) {}
            savedContent = '';
        }

        // v7.13.92: Section Guard — snapshot section count, revert if sections are deleted
        // Uses onTransaction instead of ProseMirror Plugin (Plugin not exported from TipTap bundle)
        let _sectionCount = 0;
        function countSections(doc) {
            let n = 0;
            doc.descendants(node => { if (node.type.name === 'sectionBlock') n++; });
            return n;
        }

        canvasEditor = new Editor({
            element: editorEl,
            extensions: [
                StarterKit.configure({
                    heading: { levels: [2, 3] },
                }),
                Placeholder.configure({
                    placeholder: 'Start writing your essay here...',
                }),
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
                Highlight.configure({ multicolor: true }),
                CharacterCount,
                TextStyle,
                Color,
                CommentMark,
                SectionBlock,
                InputField,
                ...(PaginationPlus ? [PaginationPlus.configure({
                    pageHeight: 1020,
                    pageWidth: 720,
                    pageGap: 24,
                    pageGapBorderSize: 1,
                    pageGapBorderColor: 'rgba(255,255,255,0.08)',
                    pageBreakBackground: '#1c1d1f',
                    pageHeaderHeight: 0,
                    pageFooterHeight: 20,
                    marginTop: 48,
                    marginBottom: 32,
                    marginLeft: 56,
                    marginRight: 56,
                    contentMarginTop: 0,
                    contentMarginBottom: 0,
                    headerLeft: '',
                    headerRight: '',
                    footerLeft: '',
                    footerRight: '<span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:inherit">Page {page}</span>',
                })] : []),
            ],
            // v7.13.78: Don't flash generic template — start empty, async chain injects the right one
            content: savedContent || (state.task === 'mark_scheme' ? '<p></p>' : isCwTask ? getCwDocTemplate(cwStepDef) : '<p></p>'),
            editorProps: {
                attributes: {
                    spellcheck: 'true',
                },
                // Strip inline styles and section containers from pasted content (v7.12.59)
                transformPastedHTML(html) {
                    // Strip section block wrappers — paste text only, not the container
                    html = html.replace(/<div[^>]*data-section-type="[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '$1');
                    // Remove inline color, background, font-family, font-size styles
                    return html.replace(/\s*style="[^"]*"/gi, match => {
                        // Strip color, background-color, font-family, font-size but keep other styles
                        let cleaned = match
                            .replace(/color\s*:\s*[^;"]*/gi, '')
                            .replace(/background-color\s*:\s*[^;"]*/gi, '')
                            .replace(/background\s*:\s*[^;"]*/gi, '')
                            .replace(/font-family\s*:\s*[^;"]*/gi, '')
                            .replace(/font-size\s*:\s*[^;"]*/gi, '')
                            .replace(/line-height\s*:\s*[^;"]*/gi, '')
                            .replace(/;;+/g, ';')
                            .replace(/;\s*"/g, '"')
                            .replace(/style="\s*;?\s*"/gi, '');
                        return cleaned;
                    });
                },
            },
            onUpdate: ({ editor }) => {
                // Word count — response sections only (v7.11.0)
                const wc = getResponseWordCount(editor);
                wcDisplay.textContent = `${wc} word${wc !== 1 ? 's' : ''}`;

                // Progress bar + mark complete (diagnostic mode) — direct refs
                if (diagProgressFill) {
                    const pct = Math.min(100, Math.round((wc / canvasWordTarget) * 100));
                    diagProgressFill.style.width = pct + '%';
                    diagProgressFill.style.background = getWordCountColour(wc);
                }
                if (diagWcLabel) diagWcLabel.textContent = getWordCountLabel(wc);
                if (diagCompleteBtn) diagCompleteBtn.style.display = wc >= canvasWordMinimum ? 'block' : 'none';
                // Floating widget
                if (wcWidgetLabel) wcWidgetLabel.textContent = `${wc} / ${canvasWordTarget}`;

                // Page count (content may have grown/shrunk)
                requestAnimationFrame(updatePageCount);
                saveStatus.textContent = 'Editing...';
                saveStatus.classList.remove('saving');
                clearTimeout(canvasSaveTimer);
                canvasSaveTimer = setTimeout(() => {
                    saveCanvasContent();
                    saveStatus.textContent = '✓ Saved';
                    saveStatus.classList.add('saving');
                    setTimeout(() => saveStatus.classList.remove('saving'), 1500);
                }, 2000);
                // Update outline if open
                updateOutline();
                // Update comment count after any editor change (marks added/removed)
                updateCommentCount();
            },
            onTransaction: ({ editor, transaction }) => {
                // v7.13.92: Section Guard — revert if sections were deleted
                if (transaction.docChanged && _sectionCount > 0) {
                    const newCount = countSections(editor.state.doc);
                    if (newCount < _sectionCount) {
                        console.warn('WML: Section deletion blocked — reverting (' + _sectionCount + ' → ' + newCount + ')');
                        editor.commands.undo();
                        return;
                    }
                    _sectionCount = newCount;
                }
            },
            onCreate: ({ editor }) => {
                // v7.13.92: Snapshot initial section count for guard
                _sectionCount = countSections(editor.state.doc);
                // v7.13.53: Snapshot template word count BEFORE first getResponseWordCount
                snapshotTemplateBaseline(editor);
                const wc = getResponseWordCount(editor);
                wcDisplay.textContent = `${wc} word${wc !== 1 ? 's' : ''}`;

                // Sync all word count displays on load — defer progress fill to animate
                if (diagProgressFill) {
                    const pct = Math.min(100, Math.round((wc / canvasWordTarget) * 100));
                    // Double rAF: browser paints width:0% first, then animates to target
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        diagProgressFill.style.width = pct + '%';
                        diagProgressFill.style.background = getWordCountColour(wc);
                    }));
                }
                if (diagWcLabel) diagWcLabel.textContent = getWordCountLabel(wc);
                if (diagCompleteBtn) diagCompleteBtn.style.display = wc >= canvasWordMinimum ? 'block' : 'none';
                if (wcWidgetLabel) wcWidgetLabel.textContent = `${wc} / ${canvasWordTarget}`;

                // Update toolbar active states
                updateToolbarState(toolbar, editor);
                // Initial page count
                requestAnimationFrame(updatePageCount);
                // Initial comment gutter
                setTimeout(updateCommentGutter, 100);
                // Initial comment count
                updateCommentCount();
                // Initial outline + section badges
                updateOutline();
                // Inject section controls (for resumed documents that already have sections)
                setTimeout(() => buildDropdownOverlays(contentWrap), 250);
                // v7.14.34: Colorise section groups after DOM render
                setTimeout(coloriseSectionGroups, 400);
            },
            onSelectionUpdate: ({ editor }) => {
                updateToolbarState(toolbar, editor);
            },
        });

        // ── Server-side load + topic template (async, after editor is ready) ──
        // v7.13.34: CW workbook pre-population — load artifact from project if no saved content
        const tryCwPrePopulate = async () => {
            if (!isCwWorkbook || !state.cwProjectId || !canvasEditor) return;
            // Only pre-populate if editor is empty (no server-saved content)
            const currentContent = canvasEditor.getText().trim();
            if (currentContent.length > 50) return; // Already has content
            const plotUpdateSteps = [11, 14, 17, 20, 23, 26];
            const artifactKey = plotUpdateSteps.includes(cwStepDef?.step) ? 'plot_outline' : WML.CW_ARTIFACT_MAP[cwStepDef?.step];
            if (!artifactKey) return;
            try {
                const artifact = await WML.cwProject.loadArtifact(state.cwProjectId, artifactKey);
                if (artifact?.success && artifact.value) {
                    canvasEditor.commands.setContent(artifact.value);
                    console.log('WML CW Workbook: Pre-populated from artifact', artifactKey);
                }
            } catch (e) { console.log('WML CW Workbook: No artifact to pre-populate'); }
        };
        // v7.13.60: Load plot structure template from server for Step 6 (and plot update steps)
        const tryLoadPlotTemplate = async () => {
            if (!isCwTask || !canvasEditor) return;
            const stepNum = cwStepDef?.step;
            // Only Step 6 gets server-loaded templates (plot update steps use tryCwPrePopulate)
            if (stepNum !== 6) return;
            // Check if the document still has the placeholder text (TipTap strips data attributes)
            const editorText = canvasEditor.getText();
            console.log('WML CW Plot: Step', stepNum, 'checking for placeholder. Text includes loading:', editorText.includes('Loading your plot structure template'), 'Text length:', editorText.length);
            if (!editorText.includes('Loading your plot structure template')) return; // Already has real content

            // Determine which plot structure to load
            let structureSlug = 'heros-journey'; // default
            if (state.cwProjectId) {
                try {
                    const choiceArtifact = await WML.cwProject.loadArtifact(state.cwProjectId, 'plot_structure_choice');
                    if (choiceArtifact?.success && choiceArtifact.value) {
                        // The artifact value might be the slug directly or an object with a .structure field
                        const val = typeof choiceArtifact.value === 'string' ? choiceArtifact.value : (choiceArtifact.value?.structure || choiceArtifact.value?.primary || '');
                        if (val) structureSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    }
                } catch (e) { console.log('WML CW: No plot structure choice found, using default Hero\'s Journey'); }
            }

            // Fetch the template from the server
            try {
                const res = await WML.cwProject.loadPlotTemplate(structureSlug);
                if (res?.success && res.html) {
                    // Get current content and replace the placeholder paragraph with the full template
                    const currentHtml = canvasEditor.getHTML();
                    // TipTap converts the placeholder div to a <p><em>Loading...</em></p> — match that
                    const newHtml = currentHtml.replace(/<p><em>Loading your plot structure template[\u2026.]*<\/em><\/p>/, res.html);
                    canvasEditor.commands.setContent(newHtml);
                    // Re-snapshot baseline for word count — ALL editable section text is template
                    snapshotTemplateBaseline(canvasEditor);
                    // Update word count display to 0
                    const wcAfter = getResponseWordCount(canvasEditor);
                    if (wcDisplay) wcDisplay.textContent = `${wcAfter} word${wcAfter !== 1 ? 's' : ''}`;
                    if (wcWidgetLabel) wcWidgetLabel.textContent = `${wcAfter} / ${canvasWordTarget}`;
                    console.log('WML CW: Loaded plot template:', res.label, '- baseline re-snapshotted, wc:', wcAfter);
                }
            } catch (e) { console.error('WML CW: Failed to load plot template:', e); }
        };

        // v7.14.3: Exam prep template injection — version-stamped cache busting
        const EXAM_PREP_DOC_VER = 3; // v7.14.13: rebuilt all exam prep templates
        const tryExamPrepTemplate = () => {
            if (!isExamPrep || !canvasEditor) return;
            const docVerKey = CANVAS_SAVE_KEY() + '_ver';
            // Check stored template version
            try {
                const savedVer = parseInt(localStorage.getItem(docVerKey) || '0');
                if (savedVer >= EXAM_PREP_DOC_VER) return; // Up to date
            } catch(e) {}
            // Outdated — check for real student writing before replacing
            const currentHTML = canvasEditor.getHTML();
            const respSections = currentHTML.match(/data-section-type="response"[^>]*>[\s\S]*?<\/div>/g) || [];
            let studentChars = 0;
            respSections.forEach(s => {
                studentChars += s.replace(/<[^>]*>/g, '').replace(/Start writing.*|Write your.*|Your .* will appear.*/gi, '').trim().length;
            });
            if (studentChars > 50) {
                // Real student work — stamp version, don't replace
                try { localStorage.setItem(docVerKey, String(EXAM_PREP_DOC_VER)); } catch(e) {}
                console.log('WML: Keeping student content (' + studentChars + ' chars), version stamped');
                return;
            }
            // Inject fresh template
            const template = getExamPrepDocTemplate(state.task);
            if (template) {
                try {
                    localStorage.removeItem(CANVAS_SAVE_KEY());
                    localStorage.setItem(docVerKey, String(EXAM_PREP_DOC_VER));
                } catch(e) {}
                canvasEditor.commands.setContent(template);
                console.log('WML: Template upgraded to v' + EXAM_PREP_DOC_VER + ' for', state.task);
            }
        };

        tryServerLoad().then(() => tryTopicTemplate()).then(() => tryCwPrePopulate()).then(() => tryExamPrepTemplate()).then(() => tryLoadPlotTemplate()).then(() => {
            // Clean corrupted content from v7.11.8 (serialized selects as text)
            cleanCorruptedContent();
            // Migrate old documents — inject missing sections + dividers
            migrateDocument();
            migrateDividers();
            // Inject cover image if missing from loaded document
            tryInjectCover();
            // Build table of contents (after cover + migration)
            buildTableOfContents();
            // v7.14.34: Assign group colours after DOM settles (universal — works for all doc types)
            setTimeout(coloriseSectionGroups, 300);
            // Also re-run after template injection (async topic data may load later)
            setTimeout(coloriseSectionGroups, 1500);
            // v7.13.48: CW resource buttons are now in the sidebar (not in document)
            // Inject dropdown overlays after template is ready
            setTimeout(() => buildDropdownOverlays(contentWrap), 200);
            // Re-position comment gutter after all content (cover, TOC, template) is loaded (v7.12.35)
            setTimeout(() => updateCommentGutter(), 400);
            // v7.13.92: Re-snapshot section count after template injection (sections may have been added)
            if (canvasEditor) _sectionCount = countSections(canvasEditor.state.doc);

            // ── Auto-extract essay question from document for all paths (v7.12.33) ──
            const autoQ = extractEssayQuestion(canvasEditor);
            if (autoQ && !state.question) { state.question = autoQ; console.log('WML: Auto-extracted essay question:', autoQ); }

            // v7.14.48: Auto-trigger REMOVED — training-env exercises now render directly
            // via the useTrainingEnv branch + buildTrainingPanels(). No more diagnostic flash.
            // The diagnostic Mark Complete flow still works for genuine diagnostic submissions.
        });

        // ── Content Cleanup (v7.11.10) ──
        // v7.11.8 injected <select> elements inside ProseMirror, which serialized
        // them as text (e.g. "Feedback: Introduction0 / 31 / 32 / 33 / 3").
        // This function strips that corrupted text from saved documents.
        function cleanCorruptedContent() {
            if (!canvasEditor) return;
            const editor = document.getElementById('swml-tiptap-editor');
            if (!editor) return;
            let dirty = false;

            // Pattern 1: Feedback sections with serialized option text
            // e.g. "Feedback: Introduction0 / 31 / 32 / 33 / 3" repeated as paragraphs
            editor.querySelectorAll('[data-section-type="feedback"] p').forEach(p => {
                const txt = p.textContent || '';
                // Match "Feedback: <name>N / N1 / N2 / N..." pattern (serialized options)
                if (/^Feedback:\s*.+?\d\s*\/\s*\d/.test(txt) && (txt.match(/\//g) || []).length >= 3) {
                    p.remove();
                    dirty = true;
                }
            });

            // Pattern 2: Grade dropdown serialized as text in Action Plan
            // e.g. "Your target grade: — Choose —Grade 9Grade 8Grade 7..."
            editor.querySelectorAll('[data-section-type="action"] p').forEach(p => {
                const txt = p.textContent || '';
                if (txt.includes('Choose') && txt.includes('Grade 9') && txt.includes('Grade 1')) {
                    p.innerHTML = '<em>Your target grade:</em> —';
                    dirty = true;
                }
            });

            // Pattern 3: Duplicate feedback sections (same label appearing twice)
            const seenLabels = new Set();
            editor.querySelectorAll('[data-section-type="feedback"]').forEach(section => {
                const label = section.getAttribute('data-section-label') || '';
                if (seenLabels.has(label)) {
                    section.remove();
                    dirty = true;
                    console.log('WML: Removed duplicate feedback section:', label);
                } else {
                    seenLabels.add(label);
                }
            });

            // Pattern 4: Stale Improvement Plan section (removed from template in v7.11.6)
            editor.querySelectorAll('[data-section-type="improvement"]').forEach(section => {
                section.remove();
                dirty = true;
                console.log('WML: Removed stale Improvement Plan section');
            });

            if (dirty) {
                console.log('WML: Cleaned corrupted/stale content');
                saveCanvasContent();
                // Rebuild dropdown overlays after DOM cleanup
                setTimeout(() => buildDropdownOverlays(contentWrap), 300);
            }
        }

        // ── Section Dropdown Overlays (v7.11.9) ──
        // Positioned OUTSIDE ProseMirror DOM — overlays on contentWrap.
        // Each dropdown tracks its section via data-section-index.

        const GRADE_BOUNDARIES = [
            { g: '9', pct: 84 }, { g: '8', pct: 74 }, { g: '7', pct: 64 },
            { g: '6', pct: 55 }, { g: '5', pct: 45 }, { g: '4', pct: 35 },
            { g: '3', pct: 25 }, { g: '2', pct: 15 }, { g: '1', pct: 1 },
        ];

        function getGradeFromPercentage(pct) {
            for (const b of GRADE_BOUNDARIES) {
                if (pct >= b.pct) return b.g;
            }
            return 'U';
        }

        let dropdownLayer = null;
        let gradeOverride = null; // When set (1-9), overrides auto-calculated grade

        function buildDropdownOverlays(container) {
            if (!canvasEditor) return;
            const editor = document.getElementById('swml-tiptap-editor');
            if (!editor) return;

            // Remove existing overlay layer
            if (dropdownLayer) dropdownLayer.remove();
            dropdownLayer = el('div', { className: 'swml-dropdown-layer' });
            dropdownLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;pointer-events:none;z-index:5;';
            // Insert into docWrap (sibling position to editor, outside ProseMirror)
            const dw = editor.closest('.swml-canvas-doc');
            if (!dw) return;
            dw.appendChild(dropdownLayer);

            const feedbackSections = editor.querySelectorAll('[data-section-type="feedback"]');
            feedbackSections.forEach((section, idx) => {
                const label = section.getAttribute('data-section-label') || '';
                const match = label.match(/^(Feedback:\s*.+?)\s*\((?:—|(\d+))\s*\/\s*(\d+)\)$/);
                if (!match) return;

                const baseName = match[1].trim();
                const currentMarks = match[2] !== undefined ? parseInt(match[2]) : -1; // -1 = dash/unset
                const maxMarks = parseInt(match[3]);

                const wrapper = document.createElement('div');
                wrapper.className = 'swml-dropdown-overlay';
                wrapper.style.pointerEvents = 'auto';
                wrapper.dataset.sectionIdx = idx;

                const select = document.createElement('select');
                select.className = 'swml-dropdown-select';
                // — option (unset/reset)
                const dashOpt = document.createElement('option');
                dashOpt.value = '-1';
                dashOpt.textContent = '—';
                if (currentMarks === -1) dashOpt.selected = true;
                select.appendChild(dashOpt);
                for (let i = 0; i <= maxMarks; i++) {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = `${i} / ${maxMarks}`;
                    if (i === currentMarks) opt.selected = true;
                    select.appendChild(opt);
                }
                select.addEventListener('mousedown', (e) => e.stopPropagation());
                select.addEventListener('change', () => {
                    const rawVal = parseInt(select.value);
                    const displayVal = rawVal === -1 ? '—' : rawVal;
                    const newLabel = `${baseName} (${displayVal} / ${maxMarks})`;
                    // Save scroll position before DOM mutation
                    const scrollContainer = editor.closest('.swml-canvas-content');
                    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
                    // Update ProseMirror model directly — avoids fragile posAtDOM (v7.12.39)
                    let found = false;
                    canvasEditor.state.doc.descendants((node, pos) => {
                        if (found) return false;
                        if (node.type.name === 'sectionBlock' && node.attrs.label.startsWith(baseName + ' (')) {
                            canvasEditor.view.dispatch(
                                canvasEditor.state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    label: newLabel,
                                })
                            );
                            found = true;
                            return false;
                        }
                    });
                    // recalculateScoreSummary after ProseMirror re-render settles;
                    // updateOutline() is called automatically by TipTap onUpdate (line 6430)
                    requestAnimationFrame(() => {
                        recalculateScoreSummary();
                        if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                    });
                });
                wrapper.appendChild(select);
                dropdownLayer.appendChild(wrapper);
            });

            // ── Self-Assessment Dropdowns (1-5 scale) ──
            const selfAssessSection = editor.querySelector('[data-section-label="Self-Assessment"]');
            if (selfAssessSection) {
                selfAssessSection.querySelectorAll('p').forEach((p, pIdx) => {
                    const txt = p.textContent || '';
                    // Match "Skill: — / 5" or "Skill: N / 5" pattern
                    const saMatch = txt.match(/^(.+?):\s*(?:—|(\d))\s*\/\s*5$/);
                    if (!saMatch) return;
                    const skillName = saMatch[1].trim();
                    const currentVal = saMatch[2] ? parseInt(saMatch[2]) : 0;

                    const wrapper = document.createElement('div');
                    wrapper.className = 'swml-dropdown-overlay swml-dropdown-overlay-sa';
                    wrapper.style.pointerEvents = 'auto';
                    wrapper.dataset.saIdx = pIdx;
                    wrapper.dataset.skill = skillName;

                    const select = document.createElement('select');
                    select.className = 'swml-dropdown-select swml-dropdown-sa';
                    // Use skill-specific descriptors from SureForms if available, otherwise generic
                    const descriptors = SA_DESCRIPTORS[skillName];
                    const SA_FALLBACK = ['—', '1 – Basic', '2 – Developing', '3 – Secure', '4 – Good', '5 – Perceptive'];
                    for (let v = 0; v <= 5; v++) {
                        const opt = document.createElement('option');
                        opt.value = v;
                        opt.textContent = v === 0 ? '—' : descriptors ? `${v}: ${descriptors[v - 1]}` : SA_FALLBACK[v];
                        if (v === currentVal) opt.selected = true;
                        select.appendChild(opt);
                    }
                    select.addEventListener('mousedown', (e) => e.stopPropagation());
                    select.addEventListener('change', () => {
                        const newVal = parseInt(select.value);
                        const newText = `${skillName}: ${newVal || '—'} / 5`;
                        // Save scroll position before DOM mutation
                        const scrollContainer = editor.closest('.swml-canvas-content');
                        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
                        // Update ProseMirror paragraph text
                        if (p.querySelector('em')) {
                            // Don't touch if it has em tags (it's a prompt, not a rating)
                        } else {
                            p.textContent = newText;
                        }
                        // Restore scroll position after ProseMirror reconciles
                        requestAnimationFrame(() => {
                            if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                            recalculateScoreSummary(); // Update totals when SA changes (v7.12.37)
                            if (typeof updateOutline === 'function') updateOutline();
                        });
                    });
                    wrapper.appendChild(select);
                    dropdownLayer.appendChild(wrapper);
                });
            }

            // ── Score Summary Grade Dropdown ──
            const scoresSection = editor.querySelector('[data-section-type="scores"]');
            if (scoresSection) {
                // Find the Grade paragraph
                const gradePara = Array.from(scoresSection.querySelectorAll('p')).find(p =>
                    p.querySelector('em')?.textContent?.includes('Grade:') || p.textContent?.startsWith('Grade:')
                );
                if (gradePara) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'swml-dropdown-overlay swml-dropdown-overlay-grade';
                    wrapper.style.pointerEvents = 'auto';

                    const select = document.createElement('select');
                    select.className = 'swml-dropdown-select swml-dropdown-grade';
                    // Options: Auto (from marks), then Grades 9 → 1
                    const autoOpt = document.createElement('option');
                    autoOpt.value = 'auto';
                    autoOpt.textContent = 'Auto';
                    select.appendChild(autoOpt);
                    for (let g = 9; g >= 1; g--) {
                        const opt = document.createElement('option');
                        opt.value = g;
                        opt.textContent = `Grade ${g}`;
                        select.appendChild(opt);
                    }
                    // Check if a manual override is already set
                    if (gradeOverride) {
                        select.value = String(gradeOverride);
                    }
                    select.addEventListener('mousedown', (e) => e.stopPropagation());
                    select.addEventListener('change', () => {
                        const scrollContainer = editor.closest('.swml-canvas-content');
                        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
                        if (select.value === 'auto') {
                            gradeOverride = null;
                            recalculateScoreSummary(); // Re-apply auto grade
                        } else {
                            gradeOverride = parseInt(select.value);
                            // Manually set grade text
                            gradePara.innerHTML = `<em>Grade:</em> ${gradeOverride} (tutor override)`;
                        }
                        requestAnimationFrame(() => {
                            if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                        });
                    });
                    wrapper.appendChild(select);
                    dropdownLayer.appendChild(wrapper);
                }
            }

            // ── Action Plan Grade Goal Dropdown ──
            const actionPlanSection = editor.querySelector('[data-section-label="Action Plan"]');
            if (actionPlanSection) {
                const gradeGoalPara = Array.from(actionPlanSection.querySelectorAll('p')).find(p =>
                    p.querySelector('em')?.textContent?.includes('target grade') || p.textContent?.includes('target grade')
                );
                if (gradeGoalPara) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'swml-dropdown-overlay swml-dropdown-overlay-gradegoal';
                    wrapper.style.pointerEvents = 'auto';

                    const select = document.createElement('select');
                    select.className = 'swml-dropdown-select swml-dropdown-grade';
                    // Current value
                    const currentMatch = gradeGoalPara.textContent.match(/target grade:\s*(\d)/);
                    const currentVal = currentMatch ? parseInt(currentMatch[1]) : 0;
                    // Options: — then 9 → 1
                    const defOpt = document.createElement('option');
                    defOpt.value = '0'; defOpt.textContent = '—';
                    select.appendChild(defOpt);
                    for (let g = 9; g >= 1; g--) {
                        const opt = document.createElement('option');
                        opt.value = g; opt.textContent = `Grade ${g}`;
                        if (g === currentVal) opt.selected = true;
                        select.appendChild(opt);
                    }
                    if (currentVal > 0) select.value = String(currentVal);
                    select.addEventListener('mousedown', (e) => e.stopPropagation());
                    select.addEventListener('change', () => {
                        const scrollContainer = editor.closest('.swml-canvas-content');
                        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
                        const v = parseInt(select.value);
                        gradeGoalPara.innerHTML = `<em>Your target grade:</em> ${v || '—'}`;
                        requestAnimationFrame(() => {
                            if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                        });
                    });
                    wrapper.appendChild(select);
                    dropdownLayer.appendChild(wrapper);
                }
            }

            // ── Tutor Sign-off Button ──
            const signoffSection = editor.querySelector('[data-section-type="signoff"]') || editor.querySelector('[data-section-label="Tutor Sign-off"]');
            if (signoffSection) {
                const wrapper = document.createElement('div');
                wrapper.className = 'swml-dropdown-overlay swml-dropdown-overlay-signoff';
                wrapper.style.pointerEvents = 'auto';

                if (config.canSignOff) {
                    // Checkbox disclaimer — tutor must confirm before signing off
                    const disclaimerRow = document.createElement('div');
                    disclaimerRow.className = 'swml-signoff-disclaimer';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = 'swml-signoff-confirm';
                    checkbox.className = 'swml-signoff-checkbox';
                    const disclaimerLabel = document.createElement('label');
                    disclaimerLabel.htmlFor = 'swml-signoff-confirm';
                    disclaimerLabel.className = 'swml-signoff-disclaimer-text';
                    const isDiagnosticT1 = state.topicNumber === 1 && state.draftType === 'diagnostic';
                    disclaimerLabel.textContent = isDiagnosticT1
                        ? 'I confirm the student has completed all sections of this document. Essay plan is not required for the first diagnostic.'
                        : 'I confirm the student has completed all sections of this document, including the essay plan.';
                    disclaimerRow.appendChild(checkbox);
                    disclaimerRow.appendChild(disclaimerLabel);
                    wrapper.appendChild(disclaimerRow);

                    const signBtn = document.createElement('button');
                    signBtn.className = 'swml-signoff-btn';
                    signBtn.textContent = '🔒 Sign Off';
                    signBtn.disabled = true;
                    signBtn.style.opacity = '0.5';
                    signBtn.style.cursor = 'not-allowed';

                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            signBtn.disabled = false;
                            signBtn.style.opacity = '';
                            signBtn.style.cursor = '';
                            signBtn.textContent = '✍ Sign Off';
                        } else {
                            signBtn.disabled = true;
                            signBtn.style.opacity = '0.5';
                            signBtn.style.cursor = 'not-allowed';
                            signBtn.textContent = '🔒 Sign Off';
                            signBtn.dataset.confirming = 'false';
                        }
                    });

                    signBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (signBtn.disabled) return;
                        console.log('WML: Sign-off button clicked, canSignOff:', config.canSignOff);
                        // Two-step confirmation: first click shows "Confirm?", second click signs off
                        if (signBtn.dataset.confirming === 'true') {
                            signBtn.textContent = '⏳ Signing…';
                            signBtn.disabled = true;
                            fetch(config.restUrl + 'canvas/signoff', {
                                method: 'POST', headers,
                                body: JSON.stringify({
                                    board: state.board, text: state.text,
                                    topicNumber: state.topicNumber || null,
                                    suffix: WML.getExerciseConfig(state.task).storageSuffix || '',
                                    studentId: config.userId,
                                })
                            }).then(r => r.json()).then(res => {
                                console.log('WML: Sign-off response:', res);
                                if (res.success) {
                                    applySignoffToSection(signoffSection, res.signoff);
                                    wrapper.innerHTML = '';
                                    wrapper.appendChild(buildSignedBadge(res.signoff));
                                    wrapper.classList.add('swml-signoff-complete');
                                    showToast('✓ Document signed off', 4000, true);
                                } else {
                                    signBtn.textContent = '✍ Sign Off';
                                    signBtn.disabled = false;
                                    signBtn.dataset.confirming = 'false';
                                    showToast('Sign-off failed: ' + (res.message || 'unknown error'), 5000, true);
                                }
                            }).catch(err => {
                                console.warn('WML: Sign-off error:', err);
                                signBtn.textContent = '✍ Sign Off';
                                signBtn.disabled = false;
                                signBtn.dataset.confirming = 'false';
                                showToast('Sign-off failed — please try again', 5000, true);
                            });
                        } else {
                            signBtn.dataset.confirming = 'true';
                            signBtn.textContent = '✓ Confirm Sign Off';
                            signBtn.style.background = 'linear-gradient(135deg, #17b57a 0%, #1CD991 100%)';
                            // Reset after 4 seconds if not confirmed
                            setTimeout(() => {
                                if (signBtn.dataset.confirming === 'true') {
                                    signBtn.dataset.confirming = 'false';
                                    signBtn.textContent = '✍ Sign Off';
                                    signBtn.style.background = '';
                                }
                            }, 4000);
                        }
                    });
                    wrapper.appendChild(signBtn);
                } else {
                    // Students see read-only status
                    const label = document.createElement('span');
                    label.className = 'swml-signoff-pending';
                    label.textContent = '⏳ Awaiting tutor';
                    wrapper.appendChild(label);
                }

                dropdownLayer.appendChild(wrapper);

                // Load existing sign-off data
                fetch(config.restUrl + `canvas/load-signoff?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}${state.topicNumber ? '&topicNumber=' + state.topicNumber : ''}&suffix=${encodeURIComponent(WML.getExerciseConfig(state.task).storageSuffix || '')}`, { headers })
                    .then(r => r.ok ? r.json() : null)
                    .then(res => {
                        if (res && res.success && res.signoff && !res.signoff.revoked) {
                            applySignoffToSection(signoffSection, res.signoff);
                            wrapper.innerHTML = '';
                            wrapper.appendChild(buildSignedBadge(res.signoff));
                            wrapper.classList.add('swml-signoff-complete');
                        }
                    }).catch(() => { /* No signoff yet — leave as pending */ });
            }

            // Position overlays
            positionDropdownOverlays();
            // Reposition on scroll
            container.addEventListener('scroll', positionDropdownOverlays, { passive: true });
        }

        function positionDropdownOverlays() {
            if (!dropdownLayer) return;
            const editor = document.getElementById('swml-tiptap-editor');
            if (!editor) return;
            const dw = editor.closest('.swml-canvas-doc');
            if (!dw) return;
            const dwRect = dw.getBoundingClientRect();
            // getBoundingClientRect returns screen-space (post-transform) coords.
            // The overlay layer is inside docWrap which is scaled by canvasZoom.
            // Divide by zoom to convert back to docWrap's unscaled coordinate space.
            const z = canvasZoom || 1;

            // ── Position feedback dropdowns ──
            const feedbackSections = editor.querySelectorAll('[data-section-type="feedback"]');
            const fbOverlays = dropdownLayer.querySelectorAll('.swml-dropdown-overlay:not(.swml-dropdown-overlay-sa)');
            let fbIdx = 0;
            feedbackSections.forEach(section => {
                const label = section.getAttribute('data-section-label') || '';
                if (!label.match(/\((?:—|\d+)\s*\/\s*\d+\)$/)) return; // Match both — and numeric marks (v7.12.60)
                const overlay = fbOverlays[fbIdx];
                if (!overlay) return;
                fbIdx++;
                const sRect = section.getBoundingClientRect();
                const badgeWidth = Math.min(label.length * 7.5 + 24, 300) * z;
                const top = (sRect.top - dwRect.top) / z - 12;
                const left = (sRect.left - dwRect.left) / z + 12 + badgeWidth / z + 6;
                overlay.style.cssText = `position:absolute;top:${top}px;left:${left}px;pointer-events:auto;z-index:5;`;
            });

            // ── Position self-assessment dropdowns ──
            const saOverlays = dropdownLayer.querySelectorAll('.swml-dropdown-overlay-sa');
            const selfAssessSection = editor.querySelector('[data-section-label="Self-Assessment"]');
            if (selfAssessSection && saOverlays.length > 0) {
                const saRect = selfAssessSection.getBoundingClientRect();
                let saIdx = 0;
                selfAssessSection.querySelectorAll('p').forEach(p => {
                    const txt = p.textContent || '';
                    if (!txt.match(/^.+?:\s*(?:—|\d)\s*\/\s*5$/)) return;
                    const overlay = saOverlays[saIdx];
                    if (!overlay) return;
                    saIdx++;
                    const pRect = p.getBoundingClientRect();
                    // If paragraph height is unusually large (>50px), it spans a page break.
                    // Use bottom edge minus small offset instead of center.
                    let top;
                    if (pRect.height / z > 50) {
                        top = (pRect.bottom - dwRect.top) / z - 18;
                    } else {
                        top = (pRect.top - dwRect.top) / z + (pRect.height / z / 2) - 10;
                    }
                    const right = (dwRect.right - saRect.right) / z + 24;
                    overlay.style.cssText = `position:absolute;top:${top}px;right:${right}px;pointer-events:auto;z-index:5;`;
                });
            }

            // ── Position grade dropdown ──
            const gradeOverlay = dropdownLayer.querySelector('.swml-dropdown-overlay-grade');
            if (gradeOverlay) {
                const scoresSection = editor.querySelector('[data-section-type="scores"]');
                if (scoresSection) {
                    const gradePara = Array.from(scoresSection.querySelectorAll('p')).find(p =>
                        p.querySelector('em')?.textContent?.includes('Grade:') || p.textContent?.startsWith('Grade:')
                    );
                    if (gradePara) {
                        const pRect = gradePara.getBoundingClientRect();
                        const scRect = scoresSection.getBoundingClientRect();
                        // If paragraph spans a page break, use bottom edge (v7.12.39)
                        let top;
                        if (pRect.height / z > 50) {
                            top = (pRect.bottom - dwRect.top) / z - 18;
                        } else {
                            top = (pRect.top - dwRect.top) / z + (pRect.height / z / 2) - 10;
                        }
                        const right = (dwRect.right - scRect.right) / z + 24;
                        gradeOverlay.style.cssText = `position:absolute;top:${top}px;right:${right}px;pointer-events:auto;z-index:5;`;
                    }
                }
            }

            // ── Position grade goal dropdown ──
            const gradeGoalOverlay = dropdownLayer.querySelector('.swml-dropdown-overlay-gradegoal');
            if (gradeGoalOverlay) {
                const actionPlanSection = editor.querySelector('[data-section-label="Action Plan"]');
                if (actionPlanSection) {
                    const gradeGoalPara = Array.from(actionPlanSection.querySelectorAll('p')).find(p =>
                        p.querySelector('em')?.textContent?.includes('target grade') || p.textContent?.includes('target grade')
                    );
                    if (gradeGoalPara) {
                        const pRect = gradeGoalPara.getBoundingClientRect();
                        const apRect = actionPlanSection.getBoundingClientRect();
                        // If paragraph spans a page break, use bottom edge (v7.12.39)
                        let top;
                        if (pRect.height / z > 50) {
                            top = (pRect.bottom - dwRect.top) / z - 18;
                        } else {
                            top = (pRect.top - dwRect.top) / z + (pRect.height / z / 2) - 10;
                        }
                        const right = (dwRect.right - apRect.right) / z + 24;
                        gradeGoalOverlay.style.cssText = `position:absolute;top:${top}px;right:${right}px;pointer-events:auto;z-index:5;`;
                    }
                }
            }

            // ── Position signoff overlay ──
            const signoffOverlay = dropdownLayer.querySelector('.swml-dropdown-overlay-signoff');
            if (signoffOverlay) {
                const signoffSection = editor.querySelector('[data-section-type="signoff"]') || editor.querySelector('[data-section-label="Tutor Sign-off"]');
                if (signoffSection) {
                    const soRect = signoffSection.getBoundingClientRect();
                    const top = (soRect.top - dwRect.top) / z + 8;
                    if (signoffOverlay.classList.contains('swml-signoff-complete')) {
                        // Center badge over the section
                        const left = (soRect.left - dwRect.left) / z;
                        const sWidth = soRect.width / z;
                        signoffOverlay.style.cssText = `position:absolute;top:${top + 16}px;left:${left}px;width:${sWidth}px;display:flex;justify-content:center;pointer-events:auto;z-index:5;`;
                    } else {
                        const right = (dwRect.right - soRect.right) / z + 24;
                        signoffOverlay.style.cssText = `position:absolute;top:${top}px;right:${right}px;pointer-events:auto;z-index:5;`;
                    }
                }
            }
        }

        function updateSectionNodeLabel(domEl, newLabel) {
            if (!canvasEditor) return;
            try {
                const pos = canvasEditor.view.posAtDOM(domEl, 0);
                if (pos == null) return;
                const resolved = canvasEditor.state.doc.resolve(pos);
                for (let depth = resolved.depth; depth >= 0; depth--) {
                    const node = resolved.node(depth);
                    if (node.type.name === 'sectionBlock') {
                        const nodePos = resolved.before(depth);
                        canvasEditor.view.dispatch(
                            canvasEditor.state.tr.setNodeMarkup(nodePos, undefined, {
                                ...node.attrs,
                                label: newLabel,
                            })
                        );
                        break;
                    }
                }
            } catch (e) { console.warn('WML: updateSectionNodeLabel failed', e.message); }
        }

        function applySignoffToSection(section, signoff) {
            if (!section) return;
            canvasSignoffData = signoff; // Store for export
            section.classList.add('swml-section-signed');
            section.querySelectorAll('p').forEach(p => {
                const text = p.textContent || '';
                if (text.includes('Status:')) {
                    p.innerHTML = `<em>Status:</em> <span style="color:#1CD991;font-weight:700">✓ Signed off</span>`;
                    p.style.display = 'none'; // Hidden on screen, badge shows status instead
                } else if (text.includes('Tutor:')) {
                    p.innerHTML = `<em>Tutor:</em> ${signoff.display_name}`;
                    p.style.textAlign = 'left';
                } else if (text.includes('Date:')) {
                    const d = new Date(signoff.timestamp);
                    p.innerHTML = `<em>Date:</em> ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                    p.style.textAlign = 'left';
                } else if (text.trim()) {
                    // Hide stray paragraphs from old templates (e.g. hardcoded names)
                    p.style.display = 'none';
                }
            });
            section.style.borderColor = 'rgba(28, 217, 145, 0.4)';
        }

        function buildSignedBadge(signoff) {
            const badge = document.createElement('div');
            badge.className = 'swml-signoff-signed';
            const avatar = signoff.avatar_url ? `<img src="${signoff.avatar_url}" class="swml-signoff-avatar" alt="">` : '';
            const d = new Date(signoff.timestamp);
            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            badge.innerHTML = `${avatar}<span class="swml-signoff-name">✓ ${signoff.display_name}</span><span class="swml-signoff-date">${dateStr}</span>`;
            return badge;
        }

        function recalculateScoreSummary() {
            const editor = document.getElementById('swml-tiptap-editor');
            if (!editor) return;
            let totalMarks = 0, maxTotal = 0, allSet = true;
            editor.querySelectorAll('[data-section-type="feedback"]').forEach(section => {
                const label = section.getAttribute('data-section-label') || '';
                const match = label.match(/\((\S+)\s*\/\s*(\d+)\)$/);
                if (!match) return;
                maxTotal += parseInt(match[2]);
                if (match[1] === '—') {
                    allSet = false; // Not yet set
                } else {
                    totalMarks += parseInt(match[1]) || 0;
                }
            });
            if (maxTotal === 0) return;
            const pct = Math.round((totalMarks / maxTotal) * 100);
            const grade = getGradeFromPercentage(pct);

            const scoreSection = editor.querySelector('[data-section-type="scores"]');
            if (!scoreSection) return;
            scoreSection.querySelectorAll('p').forEach(p => {
                const text = p.textContent || '';
                if (text.includes('Total Marks:')) {
                    p.innerHTML = `<em>Total Marks:</em> ${totalMarks} / ${maxTotal}`;
                } else if (text.includes('Percentage:')) {
                    p.innerHTML = `<em>Percentage:</em> ${pct}%`;
                } else if (text.startsWith('Grade:') || (p.querySelector('em') && p.querySelector('em').textContent.includes('Grade:'))) {
                    if (gradeOverride) {
                        p.innerHTML = `<em>Grade:</em> ${gradeOverride} (tutor override)`;
                    } else {
                        p.innerHTML = `<em>Grade:</em> ${allSet ? grade : grade + ' (in progress)'}`;
                    }
                } else if (text.includes('Date Completed:') && allSet && totalMarks > 0) {
                    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    p.innerHTML = `<em>Date Completed:</em> ${today}`;
                } else if (text.includes('Word Count:')) {
                    const wc = getResponseWordCount(canvasEditor);
                    p.innerHTML = `<em>Word Count:</em> ${wc} / ${canvasWordTarget}`;
                }
            });
        }

        // ── Document Data Extraction (v7.11.9) ──
        // Hoisted reference — assigned inside canvas scope, callable from module-level saveCanvasContent
        _extractDocumentData = function() {
            const editor = document.getElementById('swml-tiptap-editor');
            if (!canvasEditor || !editor) return null;
            const sections = [];
            editor.querySelectorAll('[data-section-type]').forEach(section => {
                const type = section.getAttribute('data-section-type');
                const label = section.getAttribute('data-section-label');
                const isReadonly = section.getAttribute('data-readonly') === 'true';

                let marks = null, maxMarks = null;
                const marksMatch = label.match(/\((\d+)\s*\/\s*(\d+)\)$/);
                if (marksMatch) {
                    marks = parseInt(marksMatch[1]);
                    maxMarks = parseInt(marksMatch[2]);
                }

                const contentText = section.textContent?.trim() || '';
                const contentHTML = section.innerHTML || '';

                // v7.14.28: Extract InputField values as structured key-value data
                const inputFields = {};
                section.querySelectorAll('[data-input-field]').forEach(field => {
                    const fieldId = field.getAttribute('data-field-id');
                    if (fieldId) inputFields[fieldId] = field.textContent?.trim() || '';
                });
                const fields = Object.keys(inputFields).length > 0 ? inputFields : null;

                sections.push({ type, label, readonly: isReadonly, marks, maxMarks, text: contentText, html: contentHTML, fields });
            });
            return {
                board: state.board, text: state.text, subject: state.subject,
                topicNumber: state.topicNumber || null,
                mode: state.phase || 'diagnostic',
                gradeOverride: gradeOverride || null,
                extractedAt: new Date().toISOString(),
                sections,
            };
        };

        // ── Ctrl+S / Cmd+S Manual Save ──
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (canvasEditor) {
                    saveCanvasContent();
                    saveStatus.textContent = '✓ Saved';
                    saveStatus.classList.add('saving');
                    setTimeout(() => saveStatus.classList.remove('saving'), 1500);
                }
            }
        });

        // ── Pinch-to-Zoom on Canvas ──
        // Clear entrance animation so inline transform (zoom) can take effect
        docWrap.addEventListener('animationend', () => {
            docWrap.style.animation = 'none';
        }, { once: true });

        let canvasZoom = 1;
        const ZOOM_MIN = 0.5;
        const ZOOM_MAX = 2.0;
        const ZOOM_STEP = 0.04;
        const ZOOM_SNAP = 0.02; // Snap to 100% when within ±2% (must be < ZOOM_STEP)
        const DOC_NATURAL_WIDTH = 720; // matches max-width in CSS
        let userZoom = 1; // What the user explicitly set (pinch/keyboard)
        let autoFitScale = 1; // Max scale that fits without overflow

        // Zoom indicator (floating centre pill)
        const zoomIndicator = el('div', { className: 'swml-zoom-indicator' });
        zoomIndicator.textContent = '100%';
        contentWrap.appendChild(zoomIndicator);
        let zoomTimeout = null;

        // Zoom control in status bar — editable input + reset button (v7.12.54)
        const zoomWrap = el('div', { className: 'swml-zoom-control' });
        zoomWrap.style.display = 'none';
        const zoomInput = el('input', {
            className: 'swml-zoom-input',
            type: 'text',
            title: 'Type a zoom percentage (e.g. 75)',
            value: '100%',
        });
        zoomInput.style.cssText = 'width:42px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:inherit;font-size:11px;text-align:center;padding:2px 4px;font-family:inherit;outline:none;';
        zoomInput.addEventListener('focus', () => { zoomInput.value = Math.round(canvasZoom * 100).toString(); zoomInput.select(); });
        zoomInput.addEventListener('blur', () => { zoomInput.value = Math.round(canvasZoom * 100) + '%'; });
        zoomInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = parseInt(zoomInput.value);
                if (!isNaN(val) && val >= 25 && val <= 200) {
                    userZoom = val / 100;
                    applyZoom(userZoom);
                }
                zoomInput.blur();
            } else if (e.key === 'Escape') {
                zoomInput.blur();
            }
        });
        zoomWrap.appendChild(zoomInput);
        const zoomResetBtn = el('button', {
            className: 'swml-zoom-reset',
            title: 'Reset zoom to 100% (Ctrl+0)',
            textContent: '→ 100%',
            onClick: () => { userZoom = 1; applyZoom(Math.min(1, autoFitScale)); }
        });
        zoomResetBtn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.5);font-size:10px;cursor:pointer;padding:2px 4px;font-family:inherit;';
        zoomWrap.appendChild(zoomResetBtn);
        statusBar.insertBefore(zoomWrap, saveStatus);

        function applyZoom(newZoom, isAutoFit) {
            canvasZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
            // Snap to 100% when close
            if (Math.abs(canvasZoom - 1) < ZOOM_SNAP) canvasZoom = 1;
            // Reset horizontal pan when zooming back to fit (v7.12.41)
            if (canvasZoom <= 1) panOffsetX = 0;
            updateDocTransform();
            // Show indicator briefly
            const pct = Math.round(canvasZoom * 100);
            zoomIndicator.textContent = isAutoFit ? `${pct}% ← 100%` : `${pct}%`;
            zoomIndicator.classList.add('swml-zoom-visible');
            clearTimeout(zoomTimeout);
            zoomTimeout = setTimeout(() => zoomIndicator.classList.remove('swml-zoom-visible'), 1200);
            // Show/hide zoom control + update input value
            if (canvasZoom === 1) {
                zoomWrap.style.display = 'none';
            } else {
                zoomInput.value = `${pct}%`;
                zoomWrap.style.display = 'flex';
            }
            // Reposition dropdown overlays after zoom
            requestAnimationFrame(positionDropdownOverlays);
        }

        // ── Pan + Zoom Transform (v7.12.41, v7.12.50 centering fix) ──
        let panOffsetX = 0;
        function updateDocTransform(animate) {
            if (animate) {
                docWrap.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                setTimeout(() => { docWrap.style.transition = ''; }, 450);
            }
            const parts = [];
            // When document overflows container, center it with translateX before scaling
            const containerW = contentWrap.clientWidth;
            if (containerW > 0 && containerW < DOC_NATURAL_WIDTH) {
                const centerOffset = (containerW - DOC_NATURAL_WIDTH) / 2;
                parts.push(`translateX(${centerOffset + panOffsetX}px)`);
            } else if (panOffsetX !== 0) {
                parts.push(`translateX(${panOffsetX}px)`);
            }
            if (canvasZoom !== 1) parts.push(`scale(${canvasZoom})`);
            docWrap.style.transform = parts.join(' ') || '';
            docWrap.style.transformOrigin = 'top center';
        }

        // ── Auto-fit: scale document down when pane is narrower than doc ──
        function computeAutoFit() {
            const available = contentWrap.clientWidth;
            if (available <= 0 || DOC_NATURAL_WIDTH <= 0) return;
            const margin = 32; // breathing room (px)
            const fit = (available - margin) / DOC_NATURAL_WIDTH;
            autoFitScale = Math.min(fit, 1); // never auto-zoom above 100%
            // Reset horizontal pan on resize to prevent shuddering (v7.12.41)
            if (panOffsetX !== 0 || panTargetX !== 0) { panOffsetX = 0; panTargetX = 0; panVelocity = 0; if (panAnimFrame) { cancelAnimationFrame(panAnimFrame); panAnimFrame = 0; } updateDocTransform(); }
            // If effective zoom would overflow, pull it down
            const effective = Math.min(userZoom, autoFitScale);
            if (Math.abs(effective - canvasZoom) > 0.01) {
                applyZoom(effective, effective < userZoom);
            }
        }

        if (typeof ResizeObserver !== 'undefined') {
            const fitObserver = new ResizeObserver(() => computeAutoFit());
            fitObserver.observe(contentWrap);
        }

        // Trackpad pinch (reports as wheel + ctrlKey)
        contentWrap.addEventListener('wheel', (e) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            userZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, canvasZoom + delta));
            // Allow zooming above autoFitScale when user explicitly zooms in
            applyZoom(userZoom);
        }, { passive: false });

        // Keyboard zoom: Ctrl+= / Ctrl+- / Ctrl+0
        canvas.addEventListener('keydown', (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                userZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, canvasZoom + ZOOM_STEP * 3));
                applyZoom(userZoom);
            }
            else if (e.key === '-') {
                e.preventDefault();
                userZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, canvasZoom - ZOOM_STEP * 3));
                applyZoom(userZoom);
            }
            else if (e.key === '0') { e.preventDefault(); userZoom = 1; applyZoom(Math.min(1, autoFitScale)); }
            else if (e.key === 's') {
                e.preventDefault();
                saveCanvasContent();
                saveStatus.textContent = '✓ Saved';
                saveStatus.classList.add('saving');
                setTimeout(() => saveStatus.classList.remove('saving'), 1500);
            }
        });

        // ── Canvas Panning — two-finger + click-drag (v7.12.43) ──
        // Direct deltaX application with momentum deceleration after gesture ends.
        // High deadzone prevents drift during vertical-only scroll.
        let panGestureActive = false;
        let panTargetX = 0; // kept in sync for other handlers
        let panAnimFrame = 0;
        let panVelocity = 0; // momentum velocity (px/frame)
        let panGestureTimer = 0; // auto-reset gesture state
        const PAN_FRICTION = 0.92; // momentum decay per frame
        const PAN_MIN_VEL = 0.3; // stop threshold

        function panMomentumStep() {
            panVelocity *= PAN_FRICTION;
            if (Math.abs(panVelocity) < PAN_MIN_VEL) {
                panVelocity = 0;
                panAnimFrame = 0;
                return;
            }
            panOffsetX += panVelocity;
            panTargetX = panOffsetX;
            updateDocTransform();
            panAnimFrame = requestAnimationFrame(panMomentumStep);
        }

        contentWrap.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) return; // zoom handler handles pinch
            const ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);

            // Reset gesture if clearly vertical (ay dominant, ax negligible)
            if (ay > 6 && ax < ay * 0.3) {
                panGestureActive = false;
                return;
            }

            // Activate horizontal panning only with deliberate horizontal gesture
            if (ax > 8 && ax > ay * 0.8) panGestureActive = true;

            if (panGestureActive && ax > 2) {
                // Stop any momentum animation — user is actively gesturing
                if (panAnimFrame) { cancelAnimationFrame(panAnimFrame); panAnimFrame = 0; }
                panOffsetX -= e.deltaX;
                panTargetX = panOffsetX;
                panVelocity = -e.deltaX * 0.4; // track velocity for momentum
                updateDocTransform();
                requestAnimationFrame(positionDropdownOverlays);

                // Reset gesture state after 120ms of no horizontal input
                clearTimeout(panGestureTimer);
                panGestureTimer = setTimeout(() => {
                    // Start momentum deceleration when gesture ends
                    if (Math.abs(panVelocity) > PAN_MIN_VEL && !panAnimFrame) {
                        panAnimFrame = requestAnimationFrame(panMomentumStep);
                    }
                    panGestureActive = false;
                }, 120);
            }
        }, { passive: true });

        // Click-drag panning on the canvas background (outside the document):
        let isPanning = false, panStartX = 0, panStartY = 0;
        let panStartOffsetX = 0, panScrollStartY = 0;

        contentWrap.addEventListener('mousedown', (e) => {
            if (e.button !== 0 && e.button !== 1) return;
            if (e.target.closest('.swml-canvas-doc, .swml-outline-panel, .swml-outline-btn, .swml-dropdown-select, button')) return;
            isPanning = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            panStartOffsetX = panOffsetX;
            panScrollStartY = contentWrap.scrollTop;
            contentWrap.classList.add('swml-panning-active');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            panOffsetX = panStartOffsetX + (e.clientX - panStartX);
            panTargetX = panOffsetX; // sync smooth target
            contentWrap.scrollTop = panScrollStartY - (e.clientY - panStartY);
            updateDocTransform();
        });

        document.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                contentWrap.classList.remove('swml-panning-active');
                requestAnimationFrame(positionDropdownOverlays);
            }
        });

        // Double-click on canvas background → smooth recenter
        contentWrap.addEventListener('dblclick', (e) => {
            if (e.target.closest('.swml-canvas-doc, .swml-outline-panel, .swml-outline-btn, button')) return;
            if (panOffsetX === 0 && panTargetX === 0) return;
            panOffsetX = 0;
            panTargetX = 0;
            panVelocity = 0;
            if (panAnimFrame) { cancelAnimationFrame(panAnimFrame); panAnimFrame = 0; }
            updateDocTransform(true); // animate = true
            requestAnimationFrame(positionDropdownOverlays);
        });
    }

    function updateToolbarState(toolbar, editor) {
        // Clear all active states across all cloned sets
        toolbar.querySelectorAll('.swml-tb-item').forEach(li => li.classList.remove('is-active'));
        // Map TipTap active checks to data-tool IDs
        const checks = [
            ['bold', () => editor.isActive('bold')],
            ['italic', () => editor.isActive('italic')],
            ['underline', () => editor.isActive('underline')],
            ['strike', () => editor.isActive('strike')],
            ['highlight', () => editor.isActive('highlight')],
            ['h2', () => editor.isActive('heading', { level: 2 })],
            ['h3', () => editor.isActive('heading', { level: 3 })],
            ['blockquote', () => editor.isActive('blockquote')],
        ];
        checks.forEach(([tool, check]) => {
            if (check()) {
                toolbar.querySelectorAll(`[data-tool="${tool}"]`).forEach(li => li.classList.add('is-active'));
            }
        });
    }

    // ── Legacy fallback template (free practice / no sections) ──
    function getDefaultEssayTemplate() {
        return `<h2>Introduction</h2><p></p><h2>Body Paragraph 1</h2><p></p><h2>Body Paragraph 2</h2><p></p><h2>Body Paragraph 3</h2><p></p><h2>Conclusion</h2><p></p>`;
    }

    // ── CW Document Templates (v7.13.43) ──
    // Uses sectionHTML() + dividerHTML() for proper section blocks (coloured borders, document outline, labels)
    function getCwDocTemplate(stepDef) {
        if (!stepDef) return '<p></p>';
        const step = stepDef.step;
        let html = '';

        // ── Step 1: Writer Profile ──
        if (step === 1) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 1: Build Your Writer\u2019s Profile</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Mentor\u2019s first question is always: \u201cWho are you? What matters to you?\u201d Your story must come from something authentic within you.</p>' +
                '<p>John Truby writes in <em>Anatomy of Story: 22 Steps to Becoming a Master Storyteller</em>:</p>' +
                '<p><em>\u201cStep 1: write something that may change your life. This is a very high standard, but it may be the most valuable piece of advice you\u2019ll ever get as a writer. I\u2019ve never seen a writer go wrong following it. Why? Because if a story is that important to you, it may be that important to a lot of people in the audience. And when you\u2019re done writing the story, no matter what else happens, you\u2019ve changed your life.\u201d</em></p>' +
                '<p>The best story ideas come from within the author. Great writers draw from three wells of inspiration: <strong>Memory</strong> (life experience), <strong>Imagination</strong> (creative play), and <strong>External Sources</strong> (knowledge of stories).</p>' +
                '<p>Answer the questions in the chat in a good amount of detail. Your answers will be compiled into your Writer\u2019s Profile below.</p>'
            );
            // Memory Well — Inner World (5 questions)
            html += dividerHTML('MEMORY WELL \u2014 INNER WORLD');
            html += sectionHTML('plan', 'Inner World', true, null,
                '<h3>Your Inner World (Passions &amp; Fears)</h3>' +
                '<p><strong>1. What excites you or makes you feel truly alive?</strong></p><p></p>' +
                '<p><strong>2. What are you most passionate about in life?</strong></p><p></p>' +
                '<p><strong>3. What do you fear the most?</strong></p><p></p>' +
                '<p><strong>4. What makes you genuinely happy?</strong></p><p></p>' +
                '<p><strong>5. Is there something you regret, or a failure that stayed with you?</strong></p><p></p>'
            );
            // Memory Well — Moral Compass (5 questions)
            html += dividerHTML('MEMORY WELL \u2014 MORAL COMPASS');
            html += sectionHTML('plan', 'Moral Compass', true, null,
                '<h3>Your Moral Compass (Values &amp; Beliefs)</h3>' +
                '<p><strong>6. What do you value most in people?</strong></p><p></p>' +
                '<p><strong>7. What outrages you or makes you feel a sense of injustice?</strong></p><p></p>' +
                '<p><strong>8. What is one social problem \u2014 past, present, or future \u2014 that you think about often?</strong></p><p></p>' +
                '<p><strong>9. What event or discovery has made a huge difference in your life?</strong></p><p></p>' +
                '<p><strong>10. Who or what inspires you?</strong></p><p></p>'
            );
            // Big Questions + Imagination Well (3 questions)
            html += dividerHTML('IMAGINATION WELL');
            html += sectionHTML('plan', 'Imagination Well', true, null,
                '<h3>Your Imagination Well (Core Scenarios)</h3>' +
                '<p><strong>11. What questions do you have about the world, life, or the future?</strong></p><p></p>' +
                '<p><strong>12. What if you had to save the thing you\u2019re most passionate about from a powerful threat?</strong></p><p></p>' +
                '<p><strong>13. What if a character had to face your greatest fear to achieve something they desperately wanted?</strong></p><p></p>'
            );
            // External Sources Well (2 questions)
            html += dividerHTML('EXTERNAL SOURCES WELL');
            html += sectionHTML('plan', 'External Sources', true, null,
                '<h3>Your External Sources Well (Preferred Narrative Space)</h3>' +
                '<p><strong>14. What are your favourite stories of all time? (books, films, TV, games)</strong></p><p></p>' +
                '<p><strong>15. What are your favourite genres?</strong></p><p></p>'
            );
            // Writer's Profile (synthesised by AI — green response section for distinct colour)
            html += dividerHTML('YOUR WRITER\u2019S PROFILE');
            html += sectionHTML('response', 'Writer\u2019s Profile', true, null,
                '<h3>Your Writer\u2019s Profile</h3>' +
                '<p><em>Once you\u2019ve answered all the questions above, SI will compile your responses into a synthesised Writer\u2019s Profile here \u2014 a summary of your key themes, passions, and conflicts from all three wells.</em></p><p></p>'
            );
            // Seed Loglines
            html += dividerHTML('SEED LOGLINES');
            html += sectionHTML('response', 'Seed Loglines', true, null,
                '<h3>Seed Loglines</h3>' +
                '<p><em>Three story ideas inspired by your profile will be generated here after your Writer\u2019s Profile is complete.</em></p><p></p>'
            );
            return html;
        }

        // ── Step 2: Explore Story Ideas ──
        if (step === 2) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 2: Explore Story Ideas</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Mentor shows you the wider world \u2014 stories from others that might spark inspiration.</p>' +
                '<p>Some of the most famous stories in history like William Shakespeare\u2019s <em>Romeo and Juliet</em>, William Golding\u2019s <em>Lord of the Flies</em> (a retelling of R.M. Ballantyne\u2019s <em>Coral Island</em>) and even the <em>Lion King</em> (seemingly based on <em>Hamlet</em>) are all famous stories that authors retold in their own way.</p>' +
                '<p>So, before you settle on an idea, have a look at the resources below that can help you spark an idea for a story.</p>' +
                '<p>Remember that it is OK to come up with stories in the following ways:</p>' +
                '<p>\u2605 <em>Write something that inspires you, means something to you, or that you just find interesting</em></p>' +
                '<p>\u2605 <em>Write something that is completely original</em></p>' +
                '<p>\u2605 <em>Retell a story that has already been told, but add something new and interesting to it</em></p>' +
                '<p>\u2605 <em>Combine all of the above</em></p>'
            );
            html += dividerHTML('RESOURCES');
            html += sectionHTML('outline', 'Resources', false, null,
                '<h3>Resources to Explore</h3>' +
                '<p><em>Click the link button on the left to open the resources panel \u2014 you\u2019ll find stories and articles to spark your imagination.</em></p>'
            );
            html += dividerHTML('EXAMPLE STORY IDEAS');
            html += sectionHTML('question', 'Example Story Ideas', false, null,
                '<h3>Read Some More Possible Story Ideas</h3>' +
                '<p><strong>1.</strong> <em>\u201cGrief-stricken after the sudden loss of their daughter, a couple makes the controversial decision to bring her back to life as an exact replica AI robot. As she navigates the complexities of being both human and machine, the young girl must confront blurred lines between humanity and technology as she struggles to find her place in a world that no longer sees her as human.\u201d</em></p>' +
                '<p><strong>2.</strong> <em>\u201cAfter a fiery explosion engulfs a high-rise building, a seasoned firefighter is sent in to rescue survivors. But when he fails to complete his mission, he is forced to confront his own mortality and the weight of his mistakes as he fights to redeem himself and save those still trapped in the inferno.\u201d</em></p>' +
                '<p><strong>3.</strong> <em>\u201cWhen a routine flight suddenly loses its engines, the pilots are left with only one choice to make: an emergency landing in the icy waters of the Hudson River. As they struggle to keep the plane afloat and evacuate the passengers, they must use all their skills and resourcefulness to survive the chaos and the frigid conditions while being hailed as heroes.\u201d</em></p>' +
                '<p><strong>4.</strong> <em>\u201cFeathers of Fate\u201d: In a dystopian future where birds have mysteriously gained heightened intelligence and become a dominant species, a group of survivors must navigate their way through a world overrun by these avian creatures. As they seek refuge, they stumble upon a hidden society of humans with the ability to communicate and control birds.</em></p>' +
                '<p><strong>5.</strong> <em>\u201cVirtual Vengeance\u201d: In a near-future society, a brilliant programmer creates a groundbreaking virtual reality game that immerses players into an alternate world. However, as more and more people become obsessed with the game, they discover that their actions in the virtual world have real-life consequences. A group of gamers must band together to uncover the truth behind the game\u2019s origin.</em></p>' +
                '<p><strong>6.</strong> <em>\u201cEchoes of Extinction\u201d: Set in a post-apocalyptic world where a cataclysmic event has rendered most of the Earth uninhabitable, a small group of survivors discovers a hidden underground sanctuary. As they explore this refuge, they uncover a dark secret: the remaining inhabitants possess magical abilities inherited from the ancient ones.</em></p>'
            );
            html += dividerHTML('YOUR STORY IDEAS');
            html += sectionHTML('plan', 'Story Ideas', true, null,
                '<h3>Your Story Ideas</h3>' +
                '<p>Now, make a note of 3 story ideas that you might want to explore. Don\u2019t worry, you are not tied to these ideas. You will have more chances to settle on an idea before we start adding layers of depth to it.</p>' +
                '<p><strong>Idea 1:</strong></p><p></p>' +
                '<p><strong>Idea 2:</strong></p><p></p>' +
                '<p><strong>Idea 3:</strong></p><p></p>'
            );
            return html;
        }

        // ── Step 3: Create Logline ──
        if (step === 3) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 3: Create Your Logline</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Call to Adventure \u2014 you commit to one story idea and distil it to its DNA.</p>' +
                '<p>A logline is a single, powerful sentence that captures the DNA of your story: a flawed <strong>protagonist</strong>, a clear <strong>goal</strong>, a formidable <strong>obstacle</strong>, and meaningful <strong>stakes</strong>. Professional screenwriters use loglines to pitch ideas in seconds \u2014 and it\u2019s an incredibly useful way to make sure your story concept is clear and strong before you start building it.</p>' +
                '<p>John Truby writes in <em>The Anatomy of Story</em> that a great story premise captures the character\u2019s flaw, their moral argument, and the forces that will test them \u2014 all in a single line.</p>'
            );
            html += dividerHTML('YOUR LOGLINE');
            html += sectionHTML('plan', 'Your Logline', true, null, '<h3>Your Logline</h3><p></p>');
            return html;
        }

        // ── Step 4: Brief Outline (Story Spine) ──
        if (step === 4) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 4: Brief Outline (Story Spine)</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials begins \u2014 mapping the ordinary world, inciting incident, and initial consequences.</p>' +
                '<p>You\u2019ve got a strong logline \u2014 now it\u2019s time to give your story a skeleton. We\u2019re going to use a simple but powerful tool called the <strong>Story Spine</strong>, famously used by the storytellers at Pixar to make sure their plots are strong.</p>' +
                '<p>The idea is straightforward: every great story is a chain of cause and effect. Each event <em>causes</em> the next. By answering six simple prompts, you\u2019ll map out your entire story from beginning to end.</p>'
            );
            html += dividerHTML('BEAT 1: AT FIRST...');
            html += sectionHTML('plan', 'Beat 1: At First', true, null,
                '<h3>Beat 1: At First\u2026</h3>' +
                '<p><em>Your protagonist\u2019s ordinary world. What is their unmet need, their flaw, and their hidden strength?</em></p><p></p>');
            html += dividerHTML('BEAT 2: AND THEN...');
            html += sectionHTML('plan', 'Beat 2: And Then', true, null,
                '<h3>Beat 2: And Then\u2026</h3>' +
                '<p><em>Their repeated daily routine that proves their flawed state.</em></p><p></p>');
            html += dividerHTML('BEAT 3: UNTIL...');
            html += sectionHTML('plan', 'Beat 3: Until', true, null,
                '<h3>Beat 3: Until\u2026</h3>' +
                '<p><em>The inciting incident that disrupts everything. How is this event secretly an opportunity?</em></p><p></p>');
            html += dividerHTML('BEAT 4: AND BECAUSE OF THIS...');
            html += sectionHTML('plan', 'Beat 4: Because of This', true, null,
                '<h3>Beat 4: And Because of This\u2026</h3>' +
                '<p><em>The protagonist\u2019s goal is born \u2014 a physical quest representing their deeper need.</em></p><p></p>');
            html += dividerHTML('BEAT 5: AND BECAUSE OF THIS...');
            html += sectionHTML('plan', 'Beat 5: Because of This', true, null,
                '<h3>Beat 5: And Because of This\u2026</h3>' +
                '<p><em>The main obstacle and the Road of Trials.</em></p><p></p>');
            html += dividerHTML('BEAT 6: UNTIL FINALLY...');
            html += sectionHTML('plan', 'Beat 6: Until Finally', true, null,
                '<h3>Beat 6: Until Finally\u2026</h3>' +
                '<p><em>The climax, resolution, and self-revelation. How does what they get contrast with what they thought they wanted?</em></p><p></p>');
            return html;
        }

        // ── Step 5: Choose Plot Structure ──
        if (step === 5) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 5: Choose Your Archetypal Plot Structure</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> Choosing Your Path \u2014 understanding the eight variations of the universal Hero\u2019s Journey.</p>' +
                '<p>Every great story follows one of a handful of universal plot patterns. Christopher Booker calls these the \u201cseven basic plots\u201d; Christopher Vogler maps them as stages of the Hero\u2019s Journey. Joseph Campbell discovered that the same story structure appears in every culture on Earth.</p>' +
                '<p>You don\u2019t just accept a structure \u2014 you explore the <em>why</em> behind your choices. You\u2019re finding the structure that will best test your protagonist\u2019s flaw and illuminate their psychological transformation.</p>'
            );
            html += dividerHTML('THE 8 ARCHETYPAL PLOT STRUCTURES');
            html += sectionHTML('question', 'Plot Structures Reference', false, null,
                '<h3>The 8 Archetypal Plot Structures</h3>' +
                '<p>Study these structures and their symbolism. You will choose the one that best fits your story concept.</p>' +
                '<p><strong>1. Hero\u2019s Journey (Original)</strong><br>' +
                '<em>Symbolism:</em> Transformation, self-discovery, the cyclical nature of life.<br>' +
                '<em>Themes:</em> Adventure, courage, growth, personal development.<br>' +
                '<em>Emotions:</em> Excitement, fear, anticipation, triumph, relief.<br>' +
                '<em>Morals:</em> The importance of perseverance, facing fears, and self-discovery.<br>' +
                '<em>Examples:</em> <em>The Odyssey</em> by Homer, <em>Star Wars</em> by George Lucas, <em>The Hobbit</em> by J.R.R. Tolkien.</p>' +
                '<p><strong>2. Tragedy + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> Human frailty, the inevitability of fate, the consequences of hubris.<br>' +
                '<em>Themes:</em> Loss, downfall, fatal flaws, the inevitability of destiny.<br>' +
                '<em>Emotions:</em> Sadness, pity, catharsis, despair.<br>' +
                '<em>Morals:</em> The dangers of pride, the inescapability of fate, the consequences of moral failings.<br>' +
                '<em>Examples:</em> <em>Hamlet</em> by Shakespeare, <em>Oedipus Rex</em> by Sophocles, <em>Death of a Salesman</em> by Arthur Miller.</p>' +
                '<p><strong>3. Rags to Riches + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> Transformation, the fulfilment of potential, the reward for virtue and hard work.<br>' +
                '<em>Themes:</em> Ambition, perseverance, social mobility, transformation.<br>' +
                '<em>Emotions:</em> Hope, joy, satisfaction, empathy.<br>' +
                '<em>Morals:</em> Hard work and virtue lead to success, overcoming adversity is possible.<br>' +
                '<em>Examples:</em> <em>Cinderella</em> by Charles Perrault, <em>Great Expectations</em> by Charles Dickens, <em>Rocky</em> by Sylvester Stallone.</p>' +
                '<p><strong>4. Rebirth / Redemption + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> Forgiveness, transformation, the power of second chances.<br>' +
                '<em>Themes:</em> Guilt, atonement, forgiveness, transformation.<br>' +
                '<em>Emotions:</em> Hope, relief, empathy, joy.<br>' +
                '<em>Morals:</em> It\u2019s never too late to change, the power of forgiveness and personal transformation.<br>' +
                '<em>Examples:</em> <em>A Christmas Carol</em> by Charles Dickens, <em>Les Mis\u00e9rables</em> by Victor Hugo, <em>The Kite Runner</em> by Khaled Hosseini.</p>' +
                '<p><strong>5. The Quest + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> The search for something greater, self-discovery, the journey of life.<br>' +
                '<em>Themes:</em> Adventure, perseverance, the search for meaning, self-discovery.<br>' +
                '<em>Emotions:</em> Excitement, anticipation, triumph, fulfilment.<br>' +
                '<em>Morals:</em> The journey is as important as the destination, perseverance is key.<br>' +
                '<em>Examples:</em> <em>The Lord of the Rings</em> by J.R.R. Tolkien, <em>Indiana Jones</em> by George Lucas, <em>Harry Potter</em> by J.K. Rowling.</p>' +
                '<p><strong>6. Overcoming the Monster + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> The triumph of good over evil, the power of courage and bravery.<br>' +
                '<em>Themes:</em> Good vs. evil, bravery, heroism, sacrifice.<br>' +
                '<em>Emotions:</em> Tension, fear, triumph, satisfaction.<br>' +
                '<em>Morals:</em> Courage and bravery can conquer evil, standing up to threats is essential.<br>' +
                '<em>Examples:</em> <em>Beowulf</em>, <em>Dracula</em> by Bram Stoker, <em>Jaws</em> by Peter Benchley.</p>' +
                '<p><strong>7. Voyage and Return + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> Exploration and return, personal growth, the cyclical nature of experience.<br>' +
                '<em>Themes:</em> Adventure, discovery, growth, the familiar vs. the unfamiliar.<br>' +
                '<em>Emotions:</em> Curiosity, excitement, relief, satisfaction.<br>' +
                '<em>Morals:</em> Growth and self-discovery often come from venturing into the unknown and returning home changed.<br>' +
                '<em>Examples:</em> <em>Alice in Wonderland</em> by Lewis Carroll, <em>The Chronicles of Narnia</em> by C.S. Lewis, <em>The Wizard of Oz</em> by L. Frank Baum.</p>' +
                '<p><strong>8. Coming of Age + Hero\u2019s Journey</strong><br>' +
                '<em>Symbolism:</em> Growth, maturity, the transition from innocence to experience.<br>' +
                '<em>Themes:</em> Personal development, maturity, self-discovery, the trials of growing up.<br>' +
                '<em>Emotions:</em> Empathy, nostalgia, hope, satisfaction.<br>' +
                '<em>Morals:</em> Growth comes through overcoming challenges, the journey to adulthood is complex and rewarding.<br>' +
                '<em>Examples:</em> <em>To Kill a Mockingbird</em> by Harper Lee, <em>The Catcher in the Rye</em> by J.D. Salinger, <em>Harry Potter</em> series by J.K. Rowling.</p>'
            );
            html += dividerHTML('THE HERO\u2019S JOURNEY');
            html += sectionHTML('question', 'Hero\u2019s Journey Context', false, null,
                '<h3>The Hero\u2019s Journey</h3>' +
                '<p>Screenwriter and author of <em>The Writer\u2019s Journey</em>, Christopher Vogler, believes that the Hero\u2019s Journey should be understood as having both an inner and external dimension \u2014 each stage the \u201chero\u201d experiences has an internal, symbolic meaning.</p>' +
                '<p>The Hero\u2019s Journey is a universal plot structure identified by Joseph Campbell (1904\u20131987). He proposed that it has been passed down from generation to generation because societies have historically used it to teach people how to live a fulfilling life. Many of the world\u2019s most popular stories can be understood through it: <em>Harry Potter</em>, <em>Star Wars</em>, <em>The Matrix</em>, <em>Spider-Man</em>, <em>The Lion King</em>, <em>The Lord of the Rings</em>.</p>' +
                '<p><strong>The 6 stages you will build your story on:</strong></p>' +
                '<p>Stage I: Setup \u2014 The Ordinary World: False Identity<br>' +
                'Stage II: Dream Stage \u2014 Glimpse of True Self, Initial Success<br>' +
                'Stage III: Initial Fascination \u2014 Protagonist Vacillates Between False Identity and True Self<br>' +
                'Stage IV: Nightmare Stage \u2014 Complications, Protagonist Gradually Accepts True Self<br>' +
                'Stage V: Final Push \u2014 Death and Rebirth<br>' +
                'Stage VI: The Goal and the Aftermath \u2014 Final Union, Transformation Complete</p>'
            );
            html += dividerHTML('PRE-WORK REFLECTION');
            html += sectionHTML('plan', 'Pre-Work Reflection', true, null,
                '<h3>Pre-Work Reflection</h3>' +
                '<p><strong>Context:</strong> <em>What inspired your story? (personal experience, observation, question)</em></p><p></p>' +
                '<p><strong>Concept:</strong> <em>What is your story ABOUT beneath the plot? What idea or truth about life?</em></p><p></p>' +
                '<p><strong>Technique Thinking:</strong> <em>Which 1\u20132 archetypes might best convey your concept? Why?</em></p><p></p>');
            html += dividerHTML('YOUR PRIMARY CHOICE');
            html += sectionHTML('plan', 'Primary Choice', true, null,
                '<h3>Your Primary Archetype</h3>' +
                '<p><em>Which plot structure best fits your story?</em></p><p></p>' +
                '<p><strong>Why this structure fits:</strong></p><p></p>');
            html += dividerHTML('SECONDARY ELEMENTS');
            html += sectionHTML('plan', 'Secondary Elements', true, null,
                '<h3>Secondary Elements</h3>' +
                '<p><em>Are there elements from other archetypes that could enrich your story? (optional)</em></p><p></p>');
            html += dividerHTML('AUTHORIAL INTENT');
            html += sectionHTML('plan', 'Authorial Intent', true, null,
                '<h3>Authorial Intent</h3>' +
                '<p><strong>Desired reader emotion:</strong></p><p></p>' +
                '<p><strong>Thematic message / moral:</strong></p><p></p>' +
                '<p><strong>Connection to protagonist:</strong> <em>How will this structure test your protagonist\u2019s flaw and drive their transformation?</em></p><p></p>');
            return html;
        }

        // ── Step 6: Plot Outline (v7.13.60: dynamic template from server) ──
        // The actual template is loaded from the server based on the student's Step 5 choice.
        // This preamble is rendered first, then the body is replaced with the full plot template.
        // If no saved content exists, the canvas init calls loadAndInjectPlotTemplate().
        if (step === 6) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 6: Plot Outline Workshop</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials \u2014 detailed mapping through all six stages of your story.</p>' +
                '<p>This is where your story starts to take shape. We\u2019re going to build a detailed, beat-by-beat outline for your entire story, from Stage I all the way through to Stage VI.</p>' +
                '<p>This is your <strong>master plot outline</strong> \u2014 a living document. You will return to it and update it <strong>six more times</strong> as you develop your story. Each update adds a new layer of depth: character goals, archetypes, empathy, theme, genre, and structural elements.</p>'
            );
            // Placeholder — will be replaced by loadAndInjectPlotTemplate()
            html += '<div data-plot-template-placeholder="true"><p><em>Loading your plot structure template\u2026</em></p></div>';
            return html;
        }

        // ── Step 7: Universal Human Values ──
        if (step === 7) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 7: Universal Human Values</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Mentor reveals the Universal Constants \u2014 the deep values that drive all human stories.</p>' +
                '<p>Psychologists Christopher Peterson and Martin Seligman spent three years studying what makes us fundamentally human. Their research spanned 40 cultures, involved 55 scientists, and drew on 2,500 years of thought. What they discovered was striking: across every culture, era, and belief system, <strong>six core moral values remain constant</strong>: Wisdom, Courage, Humanity, Justice, Temperance, and Transcendence.</p>' +
                '<p>Every heroic character is on a journey to embody these values. Too much or too little of any virtue creates conflict \u2014 in the real world and in stories. <strong>Balance is the goal.</strong> Stories show characters finding \u2014 or failing to find \u2014 that equilibrium.</p>'
            );
            html += dividerHTML('VALUES AT THE BEGINNING');
            html += sectionHTML('plan', 'Values at Beginning', true, null, '<h3>Your Protagonist\u2019s Values (Beginning)</h3><p></p>');
            html += dividerHTML('VALUES AT THE END');
            html += sectionHTML('plan', 'Values at End', true, null, '<h3>Your Protagonist\u2019s Values (End)</h3><p></p>');
            return html;
        }

        // ── Step 8: Scene Selection (v7.13.74: full workbook match) ──
        if (step === 8) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 8: Pick the Scene(s) You Want to Focus On</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> Selecting the Most Dramatically Powerful Moment \u2014 the scene you\u2019ll bring to life first.</p>' +
                '<p>In the exam, you almost certainly won\u2019t have time to write a complete story from beginning to end. Instead, you have two options: write a short story with a compressed arc, or focus on one or two key scenes that read as a self-contained narrative. Either approach can achieve top marks \u2014 but both require careful planning.</p>' +
                '<p><strong>Keep these five principles in mind:</strong></p>' +
                '<p><strong>1. Know where you are in the story.</strong> Pay attention to whether your chosen scenes come from the beginning, middle, or end of your overall story. Your character\u2019s development should reflect where they are in their journey.</p>' +
                '<p><strong>2. Choose moments that carry weight.</strong> Your scenes should be full of meaning and, ideally, show a moment of change \u2014 a shift in understanding, a decision that can\u2019t be undone, a revelation that alters everything.</p>' +
                '<p><strong>3. Treat the structure as a guide, not rules.</strong> The Hero\u2019s Journey is a universal pattern, not a rigid template. Not every stage needs to appear.</p>' +
                '<p><strong>4. Understand what scenes are made of.</strong> Scenes are built from multiple beats \u2014 individual moments of action, reaction, or change.</p>' +
                '<p><strong>5. Stages are arcs, not scenes.</strong> Not every beat or stage translates directly into a separate scene. Skilled writers use stages as a foundation but avoid rigidity and transcend clich\u00e9.</p>'
            );
            html += dividerHTML('SCENE OVERVIEW');
            html += sectionHTML('plan', 'Scene Overview', true, null,
                '<h3>Scene Overview</h3>' +
                '<p><strong>This extract from my story is from the following part of the plot:</strong></p><p></p>' +
                '<p><strong>Describe the extract from your story in more detail, including dramatic situations:</strong></p><p></p>'
            );
            html += dividerHTML('SCENE STRUCTURE');
            html += sectionHTML('plan', 'Hook', true, null,
                '<h3>Hook</h3>' +
                '<p><em>Grab your reader\u2019s attention.</em></p><p></p>');
            html += sectionHTML('plan', 'Setup', true, null,
                '<h3>Setup</h3>' +
                '<p><em>Introduce the problem and the characters around it.</em></p><p></p>');
            html += sectionHTML('plan', 'Reaction', true, null,
                '<h3>Reaction</h3>' +
                '<p><em>The protagonist deals with the problems the best they can: coping and not coping.</em></p><p></p>');
            html += sectionHTML('plan', 'Epiphany', true, null,
                '<h3>Epiphany</h3>' +
                '<p><em>The protagonist begins to understand what\u2019s really going on and what to do.</em></p><p></p>');
            html += sectionHTML('plan', 'Proaction', true, null,
                '<h3>Proaction</h3>' +
                '<p><em>The protagonist implements a plan. It fails.</em></p><p></p>');
            html += sectionHTML('plan', 'Climax', true, null,
                '<h3>Climax</h3>' +
                '<p><em>The forces of good and evil collide.</em></p><p></p>');
            html += sectionHTML('plan', 'Denouement', true, null,
                '<h3>Denouement</h3>' +
                '<p><em>You write an unforgettable ending.</em></p><p></p>');
            return html;
        }

        // ── Draft steps (9, 12, 15, 18, 21, 24, 27) ──
        if (stepDef.draft) {
            const draftInfo = {
                1: { layer: 'basic prose style', journey: 'Writing Your First Draft', desc: 'This is where your scene comes to life as actual writing. Stephen King says in <em>On Writing</em>: \u201cThe first draft is just you telling yourself the story.\u201d Focus on strong nouns, dynamic verbs, and well-chosen techniques. Every word choice needs to serve your story\u2019s goals.' },
                2: { layer: 'character goals and needs', journey: 'The Road of Trials intensifies', desc: 'In your first draft you focused on prose style. Now add your protagonist\u2019s <strong>character arc</strong>. Robert McKee writes that the reader should <em>feel</em> the protagonist\u2019s internal struggle driving the external action. Every element of your scene should connect to this arc.' },
                3: { layer: 'archetypes', journey: 'Making Character Transformation Visible', desc: 'In Steps 13 and 14, you defined the archetypal masks your protagonist wears. Now make that transformation visible in your prose. Christopher Vogler teaches that archetype shifts are the visible evidence of character change.' },
                4: { layer: 'empathy techniques', journey: 'Making Readers Care Deeply', desc: 'This is the draft where we make your reader <em>care</em>. Karl Iglesias writes in <em>Writing for Emotional Impact</em> that empathy is the most important emotion a writer can generate. Weave victim, virtue, and desirable quality techniques into your prose.' },
                5: { layer: 'theme and tone', journey: 'Making Your Story Mean Something', desc: 'Your theme must never be stated \u2014 it must emerge through what your protagonist <em>does</em>, what happens as a result, and the images you choose. John Truby calls this the \u201cmoral argument\u201d of your story. Every word choice should reinforce both theme and tone.' },
                6: { layer: 'genre conventions', journey: 'Adding the Emotional Contract', desc: 'Genre is a <em>promise</em> to the reader about what emotional experience they will have. John Truby writes that most sophisticated stories <strong>blend genres</strong>. Your job is to deliver on that promise while keeping the character arc at the centre.' },
                7: { layer: 'structural elements', journey: 'The Final Trial', desc: 'This is where everything comes together. You\u2019ve built this scene through six progressive drafts. Now add the final layer: hooks, irony, dialogue, symbolism, and pacing \u2014 the sophisticated techniques that separate good writing from writing that stays with the reader.' },
            };
            const info = draftInfo[stepDef.draft] || { layer: '', journey: '', desc: '' };
            html += sectionHTML('question', 'About This Draft', false, null,
                `<h2>Draft ${stepDef.draft}: ${info.layer.charAt(0).toUpperCase() + info.layer.slice(1)}</h2>` +
                `<p><strong>The Hero\u2019s Journey Stage:</strong> ${info.journey}</p>` +
                `<p>${info.desc}</p>`
            );
            html += dividerHTML('YOUR WRITING');
            html += sectionHTML('response', 'Draft', true, null, '<p></p>');
            return html;
        }

        // ── Step 10: Character Profile Parts 1-3 (v7.13.74: full workbook match) ──
        if (step === 10) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 10: Create Your Protagonist\u2019s Character Profile \u2014 Parts 1\u20133</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials continues \u2014 understanding your protagonist\u2019s deeper psychology: GOALS vs. NEEDS.</p>' +
                '<p>The engine of meaningful storytelling is the <strong>gap between what a character wants and what they need</strong>. A character\u2019s <strong>goal</strong> is external and conscious \u2014 something tangible like a crown, wealth, or adventure. A character\u2019s <strong>need</strong> is internal and usually unconscious \u2014 the thing they genuinely require to become whole but cannot yet see.</p>' +
                '<p><em>Macbeth</em> chases power, blind to his need for honour and inner peace. <em>Scrooge</em> hoards wealth, unable to recognise his need for human connection. The story\u2019s entire momentum comes from this mismatch.</p>' +
                '<p>The <strong>protagonist</strong> isn\u2019t simply the main character \u2014 they are the character who undergoes the greatest transformation, and whose journey of change reveals the story\u2019s controlling concept.</p>'
            );
            // Part 1: Goals and Need at the Beginning
            html += dividerHTML('PART 1: GOALS AND NEED AT THE BEGINNING');
            html += sectionHTML('plan', 'External Goals (Beginning)', true, null,
                '<h3>External Goal(s) at the Beginning</h3>' +
                '<p><em>What tangible thing does your protagonist consciously pursue? (e.g. win, stop, retrieve, escape, revenge, deliver, maintain)</em></p><p></p>');
            html += sectionHTML('plan', 'Internal Goals (Beginning)', true, null,
                '<h3>Internal Goal(s) at the Beginning</h3>' +
                '<p><em>What deeper fulfilment do they believe the external goal will bring? (e.g. positive relationships, self-acceptance, personal growth, environmental mastery, autonomy)</em></p><p></p>');
            html += sectionHTML('plan', 'Need (Beginning)', true, null,
                '<h3>Need</h3>' +
                '<p><em>Usually the complete opposite of their goals \u2014 what does your character truly need that they might not be aware of or are in denial about?</em></p><p></p>');
            html += sectionHTML('plan', 'Stakes and Fears (Beginning)', true, null,
                '<h3>Stakes / Fears at the Beginning</h3>' +
                '<p><em>What is at risk or what is your protagonist most afraid of losing? (Survival, Love, Identity, Freedom, Justice/Revenge, Power, Knowledge/Truth, World-saving, Redemption, Achievement)</em></p><p></p>');
            // Part 2: Goals and Need at the End
            html += dividerHTML('PART 2: GOALS AND NEED AT THE END');
            html += sectionHTML('plan', 'External Goals (End)', true, null,
                '<h3>End-State of External Goal(s)</h3>' +
                '<p><em>Does the character succeed, get defeated, abandon their goal, or is it unclear?</em></p><p></p>');
            html += sectionHTML('plan', 'Internal Goals (End)', true, null,
                '<h3>Internal Goals Achieved at the End</h3>' +
                '<p><em>Which internal goals does your protagonist achieve? (positive relationships, self-acceptance, personal growth, environmental mastery, autonomy, none)</em></p><p></p>');
            html += sectionHTML('plan', 'Need Recognised (End)', true, null,
                '<h3>Does Your Protagonist Recognise Their Need?</h3><p></p>');
            html += sectionHTML('plan', 'Dilemma', true, null,
                '<h3>The Difficult Choice (Dilemma)</h3>' +
                '<p><em>What difficult choice does your protagonist need to make? What do they choose and why?</em></p><p></p>');
            html += sectionHTML('plan', 'Realisation', true, null,
                '<h3>Realisation</h3>' +
                '<p><em>What realisation does your character come to at the end? What do they learn about themselves and the world?</em></p><p></p>');
            html += sectionHTML('plan', 'Ending Tone', true, null,
                '<h3>Ending Tone</h3>' +
                '<p><em>What tone does the end of your story have? (positive, negative, bitter-sweet, ambiguous)</em></p><p></p>');
            html += sectionHTML('plan', 'Universal Meaning', true, null,
                '<h3>Universal Meaning (Moral)</h3>' +
                '<p><em>What is the universal meaning of your story?</em></p><p></p>');
            // Part 3: Character Arc Type
            html += dividerHTML('PART 3: CHARACTER ARC TYPE');
            html += sectionHTML('plan', 'Character Arc', true, null,
                '<h3>Which Type of Character Arc?</h3>' +
                '<p><em>Choose one: <strong>Positive</strong> (e.g. weakling to hero, ignorance to knowledge, immature to mature, rags to riches), <strong>Negative</strong> (e.g. good to bad, strong to weak, hero to villain), <strong>Ambiguous Positive</strong>, or <strong>Ambiguous Negative</strong>.</em></p><p></p>');
            return html;
        }

        // ── Step 13: Character Archetypes Parts 4-6 (v7.13.74: full workbook match) ──
        if (step === 13) {
            const archetypeRef =
                '<p><strong>The 10 Core Archetypes:</strong></p>' +
                '<p><strong>1. The Everyman</strong> \u2014 Relatable, ordinary \u2014 creates empathy</p>' +
                '<p><strong>2. The Underdog</strong> \u2014 Lacks resources but determined \u2014 creates compassion and suspense</p>' +
                '<p><strong>3. The Orphan</strong> \u2014 Independent, vulnerable, loyal \u2014 creates identification</p>' +
                '<p><strong>4. The Lost Soul</strong> \u2014 Wounded outsider \u2014 creates warning and understanding</p>' +
                '<p><strong>5. The Rebel</strong> \u2014 Outspoken, radical \u2014 creates admiration</p>' +
                '<p><strong>6. The Explorer</strong> \u2014 Seeks new experiences \u2014 represents stepping outside comfort zones</p>' +
                '<p><strong>7. The Mentor</strong> \u2014 Wise, knowledgeable \u2014 creates respect</p>' +
                '<p><strong>8. The Trickster</strong> \u2014 Mischievous, disruptive \u2014 creates comic relief and new perspectives</p>' +
                '<p><strong>9. The Shadow</strong> \u2014 Destructive, frightening \u2014 reflects fears and trauma</p>' +
                '<p><strong>10. The Hero</strong> \u2014 Courageous, self-sacrificing \u2014 creates admiration and aspiration</p>';
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 13: Character Profile \u2014 Parts 4\u20136 (Archetypes)</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials deepens \u2014 understanding the MASKS your protagonist wears.</p>' +
                '<p>Archetypes are universal character patterns recognised across all cultures. Your protagonist will shift between archetypes as they transform \u2014 this shift <em>is</em> the visible evidence of their change.</p>' +
                archetypeRef
            );
            // Part 4: Beginning
            html += dividerHTML('PART 4: ARCHETYPES AT THE BEGINNING');
            html += sectionHTML('plan', 'Archetypes (Beginning)', true, null,
                '<h3>Which Archetype(s) at the Beginning?</h3>' +
                '<p><em>Which archetypes does your character embody at the start? You can mix and match. For each, explain the effect on the reader and give quotes if possible.</em></p><p></p>');
            html += sectionHTML('plan', 'Physical Traits (Beginning)', true, null,
                '<h3>Physical Appearance (Beginning)</h3>' +
                '<p><em>Age, height, build, clothes, prop, bonds (relationships), hair, eyes, name \u2014 and the effect of each choice.</em></p><p></p>');
            // Part 5: Middle
            html += dividerHTML('PART 5: ARCHETYPES IN THE MIDDLE');
            html += sectionHTML('plan', 'Archetypes (Middle)', true, null,
                '<h3>Which Archetype(s) in the Middle?</h3>' +
                '<p><em>How has the archetype shifted? What does this reveal about the transformation?</em></p><p></p>');
            html += sectionHTML('plan', 'Physical Traits (Middle)', true, null,
                '<h3>Physical Appearance (Middle)</h3>' +
                '<p><em>Has anything changed since the beginning? Explain the effect of each change.</em></p><p></p>');
            // Part 6: End
            html += dividerHTML('PART 6: ARCHETYPES AT THE END');
            html += sectionHTML('plan', 'Archetypes (End)', true, null,
                '<h3>Which Archetype(s) at the End?</h3>' +
                '<p><em>What is the final archetypal identity? How does the shift from beginning to end reveal the full transformation?</em></p><p></p>');
            html += sectionHTML('plan', 'Physical Traits (End)', true, null,
                '<h3>Physical Appearance (End)</h3>' +
                '<p><em>Has anything changed since the beginning and middle? Explain the effect of each change.</em></p><p></p>');
            return html;
        }

        // ── Step 16: Empathy Techniques (v7.13.74: full workbook match) ──
        if (step === 16) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 16: Deepen Empathy for Your Protagonist</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials continues \u2014 making readers <em>care</em>.</p>' +
                '<p>According to Carl Iglesias in <em>Writing for Emotional Impact</em>, empathy is <strong>the</strong> most important emotion a writer can generate. Every protagonist, without exception, must produce empathy in the reader. This includes protagonists who are morally reprehensible.</p>' +
                '<p><strong>Empathy vs Sympathy:</strong> Sympathy means feeling sorry for someone; empathy means feeling <em>with</em> them \u2014 understanding their internal world, their fears, their reasoning, even when we disagree with their choices.</p>' +
                '<p>The Joker works because we understand the forces that shaped him. Macbeth works because Shakespeare ensures we see him not only as a murderer but as a man consumed by ambition he cannot control. Empathy is the bridge between the character and the reader \u2014 everything depends on that bridge holding.</p>'
            );
            // Criteria 1: Making Protagonist a Victim
            html += dividerHTML('CRITERIA 1: MAKE YOUR PROTAGONIST A VICTIM');
            html += sectionHTML('plan', 'Unfair Injury', true, null,
                '<h3>Unfair Injury, Mistreatment, Injustice</h3>' +
                '<p><em>Is your protagonist teased, laughed at, embarrassed, humiliated, passed over, suffering prejudice, falsely accused, abused, exploited, or made to suffer?</em></p><p></p>');
            html += sectionHTML('plan', 'Not Believed / Misunderstood', true, null,
                '<h3>Not Believed When Telling the Truth / Misunderstood (Dramatic Irony)</h3>' +
                '<p><em>Is your protagonist not believed, misunderstood, or unfairly judged?</em></p><p></p>');
            html += sectionHTML('plan', 'Jeopardy', true, null,
                '<h3>Jeopardy</h3>' +
                '<p><em>Is your character put in a threatened position?</em></p><p></p>');
            html += sectionHTML('plan', 'Universal Wishes', true, null,
                '<h3>Wish for Something Universally Understood</h3>' +
                '<p><em>Does your character wish for love, acceptance, a family, self-acceptance, personal growth, environmental mastery, or autonomy?</em></p><p></p>');
            html += sectionHTML('plan', 'Mistakes and Regrets', true, null,
                '<h3>Making Mistakes and Regretting Them</h3><p></p>');
            // Criteria 2: Humanistic Virtues
            html += dividerHTML('CRITERIA 2: GIVE YOUR PROTAGONIST HUMANISTIC VIRTUES');
            html += sectionHTML('plan', 'Universal Virtues', true, null,
                '<h3>Possessing Universal Human Virtues</h3>' +
                '<p><em>Wisdom and knowledge, courage, humanity, justice, temperance, transcendence.</em></p><p></p>');
            html += sectionHTML('plan', 'Caring for Others', true, null,
                '<h3>Show Caring for Others, Especially at a Cost to Oneself</h3><p></p>');
            html += sectionHTML('plan', 'Risking for Others', true, null,
                '<h3>Risking Dying for the Sake of Others or for a Just Cause</h3><p></p>');
            html += sectionHTML('plan', 'Important to Others', true, null,
                '<h3>Being Important to Others</h3>' +
                '<p><em>Loved at work, home, school, or in their community.</em></p><p></p>');
            html += sectionHTML('plan', 'Ethical and Moral', true, null,
                '<h3>Being Ethical, Moral, Dependable</h3><p></p>');
            // Criteria 3: Desirable Qualities
            html += dividerHTML('CRITERIA 3: GIVE YOUR PROTAGONIST DESIRABLE QUALITIES');
            html += sectionHTML('plan', 'Courage', true, null,
                '<h3>Possessing Courage (Compulsory)</h3><p></p>');
            html += sectionHTML('plan', 'Wisdom and Wit', true, null,
                '<h3>Wisdom, Wit, and Cleverness</h3><p></p>');
            html += sectionHTML('plan', 'Childlike Innocence', true, null,
                '<h3>Childlike Innocence or Enthusiasm</h3><p></p>');
            html += sectionHTML('plan', 'Misfit or Rebel', true, null,
                '<h3>Misfit, Rebel, or Eccentric</h3>' +
                '<p><em>Does not follow anyone, flouts authority, does not care about what others think, an outsider.</em></p><p></p>');
            return html;
        }

        // ── Step 19: Theme & Tone (v7.13.74: full workbook match) ──
        if (step === 19) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 19: Theme and Tone</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Road of Trials nears its end \u2014 your story\u2019s deeper meaning and emotional atmosphere.</p>' +
                '<p><strong>Theme</strong> = your story\u2019s deeper meaning about life and humanity. Theme emerges from your protagonist\u2019s transformation, NOT from explicit statement. It\u2019s what your story is REALLY about beneath the surface plot.</p>' +
                '<p><strong>Examples:</strong> <em>Macbeth</em>: \u201cUnchecked ambition corrupts absolutely.\u201d <em>An Inspector Calls</em>: \u201cWe are all responsible for each other.\u201d <em>A Christmas Carol</em>: \u201cGreed isolates; generosity connects.\u201d</p>' +
                '<p><strong>Tone</strong> = the emotional atmosphere/mood of your story. Tone often <em>shifts</em> across your story, mirroring the protagonist\u2019s emotional journey.</p>' +
                '<p><strong>Tone Categories:</strong> <strong>Positive</strong> (affectionate, calm, cheerful, ecstatic, nostalgic, optimistic, hopeful) | <strong>Neutral</strong> (impartial, indirect, matter-of-fact, questioning, speculative) | <strong>Negative</strong> (ambiguous, bitter, cold, despairing, fearful, foreboding, tense, ominous)</p>'
            );
            html += dividerHTML('THEME');
            html += sectionHTML('plan', 'Universal Human Values', true, null,
                '<h3>Universal Human Value(s)</h3>' +
                '<p><em>What Universal Human Value(s) does your story explore? (from Step 7)</em></p><p></p>');
            html += sectionHTML('plan', 'Theme Statement', true, null,
                '<h3>Theme Statement</h3>' +
                '<p><em>What is your story ultimately SAYING about this value? (This is your theme.)</em></p><p></p>');
            html += dividerHTML('TONE');
            html += sectionHTML('plan', 'Tone: Beginning', true, null,
                '<h3>Tone at the Beginning</h3>' +
                '<p><em>Which theme(s) does this part explore? Which tone(s) does it exude? (positive, neutral, negative) How does the tone tell us more about the theme?</em></p><p></p>');
            html += sectionHTML('plan', 'Tone: Middle', true, null,
                '<h3>Tone in the Middle</h3><p></p>');
            html += sectionHTML('plan', 'Tone: End', true, null,
                '<h3>Tone at the End</h3><p></p>');
            html += sectionHTML('plan', 'Tone Shift Check', true, null,
                '<h3>Tone Shift Check</h3>' +
                '<p><em>Does your tone shift mirror your protagonist\u2019s emotional journey?</em></p><p></p>');
            return html;
        }

        // ── Step 22: Genre (v7.13.74: full workbook match) ──
        if (step === 22) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 22: Give Your Story Genre(s)</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Final Trial approaches \u2014 the emotional contract with your reader.</p>' +
                '<p><strong>Genre = a promise to the reader about what emotional experience they will have.</strong> Genres are types of stories. When we understand how genres work, we can apply their styles to give our stories more depth and meaning. Most sophisticated stories <em>blend</em> genres. Your story can shift genres from beginning to middle to end.</p>'
            );
            // 5 Genre Categories
            html += dividerHTML('1. COURAGE GENRES');
            html += sectionHTML('plan', 'Courage Genres', true, null,
                '<h3>Courage Genres (Excitement, Tension)</h3>' +
                '<p><em>Action, Adventure, War, Western, Heroic Sci-Fi, Dystopian</em></p>' +
                '<p><em>Conventions: enslavement or deprivation of free will, intensified settings, victory over death</em></p>' +
                '<p><strong>Does your story suit any Courage genres?</strong></p><p></p>');
            html += dividerHTML('2. FEAR AND LOATHING GENRES');
            html += sectionHTML('plan', 'Fear and Loathing Genres', true, null,
                '<h3>Fear and Loathing Genres (Dread, Unease)</h3>' +
                '<p><em>Gothic, Horror, Supernatural, Dark Sci-Fi</em></p>' +
                '<p><em>Conventions: mystery, terror, good vs evil, decay, dreams/nightmares, mental landscape, monsters, fearful atmosphere</em></p>' +
                '<p><strong>Does your story suit any Fear and Loathing genres?</strong></p><p></p>');
            html += dividerHTML('3. WONDER AND AWE GENRES');
            html += sectionHTML('plan', 'Wonder and Awe Genres', true, null,
                '<h3>Wonder and Awe Genres (Amazement, Possibility)</h3>' +
                '<p><em>Fantasy, Science Fiction, Magical Realism</em></p>' +
                '<p><em>Conventions: otherworldly settings, mythical creatures, epic quests, mystical lore, futuristic elements</em></p>' +
                '<p><strong>Does your story suit any Wonder and Awe genres?</strong></p><p></p>');
            html += dividerHTML('4. NEED TO KNOW GENRES');
            html += sectionHTML('plan', 'Need to Know Genres', true, null,
                '<h3>Need to Know (Mystery) Genres (Curiosity, Suspense)</h3>' +
                '<p><em>Detective, Mystery, Spy, Suspense, Thriller</em></p>' +
                '<p><em>Conventions: mystery, suspense, surprise, \u201cthe innocent man\u201d thrust into danger</em></p>' +
                '<p><strong>Does your story suit any Need to Know genres?</strong></p><p></p>');
            html += dividerHTML('5. HEART GENRES');
            html += sectionHTML('plan', 'Heart Genres', true, null,
                '<h3>Heart Genres (Connection, Growth)</h3>' +
                '<p><em>Romance, Drama, Coming-of-Age</em></p>' +
                '<p><em>Conventions: relationships, emotional intimacy, personal growth, emotional conflict</em></p>' +
                '<p><strong>Does your story suit any Heart genres?</strong></p><p></p>');
            return html;
        }

        // ── Step 25: Structural Elements (v7.13.74: full workbook match) ──
        if (step === 25) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 25: Other Key Structural Elements</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Final Trial begins \u2014 these advanced structural techniques will elevate your writing to professional level.</p>' +
                '<p>Study these 11 sophisticated techniques, then plan where and how you will use each one in your scene.</p>'
            );
            html += dividerHTML('1. HOOKS');
            html += sectionHTML('plan', 'Hooks', true, null,
                '<h3>Hooks</h3>' +
                '<p><em>Which hook type best suits your story? action (in medias res), dialogue, internal monologue, mystery, premonition, profound statement, setting. You may combine more than one.</em></p><p></p>');
            html += dividerHTML('2. IRONY (COMPULSORY)');
            html += sectionHTML('plan', 'Irony', true, null,
                '<h3>Irony (Compulsory)</h3>' +
                '<p><em>Dramatic irony (reader knows more than character), Situational irony (opposite of expectation), Verbal irony (saying opposite of what\u2019s meant).</em></p><p></p>');
            html += dividerHTML('3. DIALOGUE');
            html += sectionHTML('plan', 'Dialogue', true, null,
                '<h3>Dialogue (Optional)</h3>' +
                '<p><em>Subtext (meaning beneath words), Character voice (each character sounds distinct), Conflict in dialogue (characters want different things).</em></p><p></p>');
            html += dividerHTML('4. DUALITY (RECOMMENDED)');
            html += sectionHTML('plan', 'Duality', true, null,
                '<h3>Duality (Recommended)</h3>' +
                '<p><em>Contrasting elements: light/dark, hope/despair, strength/weakness. Creates depth and complexity.</em></p><p></p>');
            html += dividerHTML('5. POINT OF VIEW');
            html += sectionHTML('plan', 'Point of View', true, null,
                '<h3>Point of View</h3>' +
                '<p><em>First person, second person (direct address), or third person? Limited vs omniscient? Reliable vs unreliable narrator?</em></p><p></p>');
            html += dividerHTML('6. SETTINGS');
            html += sectionHTML('plan', 'Settings', true, null,
                '<h3>Settings</h3>' +
                '<p><em>Does your setting reflect the protagonist\u2019s internal state (mental landscape)? Does it challenge the protagonist? What does it reveal about historical background, cultural attitudes, genre, plot, themes, and emotional tone?</em></p><p></p>');
            html += dividerHTML('7. SYMBOLS');
            html += sectionHTML('plan', 'Symbols', true, null,
                '<h3>Symbols</h3>' +
                '<p><em>Objects or images with deeper meaning. How do they recur or develop? How do they add meaning?</em></p><p></p>');
            html += dividerHTML('8. DENOUEMENT TECHNIQUES');
            html += sectionHTML('plan', 'Denouement Techniques', true, null,
                '<h3>Denouement Techniques</h3>' +
                '<p><em>Cyclical structure, cliff hanger, twist, ambiguity, framed narrative, epilogue, or resolved ending?</em></p><p></p>');
            html += dividerHTML('9. FIVE SENSES');
            html += sectionHTML('plan', 'Five Senses', true, null,
                '<h3>Five Senses (Include All 5)</h3>' +
                '<p><em>See, hear, smell, taste, touch. Which senses dominate in your story?</em></p><p></p>');
            html += dividerHTML('10. SUSPENSE');
            html += sectionHTML('plan', 'Suspense', true, null,
                '<h3>Suspense</h3>' +
                '<p><em>Foreshadowing, time pressure, dilemmas, cliffhangers, unpredictability, danger/threats, dramatic irony, rising stakes, internal conflict, pacing.</em></p><p></p>');
            html += dividerHTML('11. PACING');
            html += sectionHTML('plan', 'Pacing', true, null,
                '<h3>Pacing</h3>' +
                '<p><em>Varying sentence length. Scene tempo: fast action vs slow reflection.</em></p><p></p>');
            return html;
        }

        // ── Plot update steps (11, 14, 17, 20, 23, 26) ──
        if ([11, 14, 17, 20, 23, 26].includes(step)) {
            const plotInfo = {
                11: { layer: 'character goals and needs', desc: 'Map your protagonist\u2019s internal dynamics across your complete story. For each stage, identify what goal drives the protagonist and where their unconscious need surfaces.' },
                14: { layer: 'archetypes', desc: 'Before layering archetypes into your scene, map them across your entire story. Identify which archetype your protagonist embodies at each stage and how the shifts reveal transformation.' },
                17: { layer: 'empathy', desc: 'Map empathy-building techniques across your plot. For each stage, identify which techniques appear (victim, virtue, desirable quality) and what the reader feels for the protagonist.' },
                20: { layer: 'theme and tone', desc: 'Map meaning and atmosphere across your complete story. For each stage, identify the dominant tone and explain how it connects to the theme. Words and images should reinforce both.' },
                23: { layer: 'genre', desc: 'Map genre across your plot outline. For each stage, identify which genre(s) dominate, what conventions appear, and what emotion readers should feel.' },
                26: { layer: 'structural elements', desc: 'This is the <strong>final update</strong>. Map advanced structural techniques across your complete story. You now have a <strong>complete story architecture</strong> \u2014 a professional-level blueprint.' },
            };
            const info = plotInfo[step] || { layer: '', desc: '' };
            html += sectionHTML('question', 'Update Focus', false, null,
                `<h2>Plot Outline \u2014 Update for ${info.layer.charAt(0).toUpperCase() + info.layer.slice(1)}</h2>` +
                `<p><strong>Your plot outline is a living document.</strong> You created it in Step 6, and it has been updated after each new layer of learning. You are NOT starting fresh \u2014 you are adding to what already exists.</p>` +
                `<p>${info.desc}</p>`
            );
            html += dividerHTML('STAGE I');
            html += sectionHTML('plan', '1. Setup', true, null, '<h3>1. Setup</h3><p></p>');
            html += dividerHTML('STAGE II');
            html += sectionHTML('plan', '2. Dream Stage', true, null, '<h3>2. Dream Stage</h3><p></p>');
            html += dividerHTML('STAGE III');
            html += sectionHTML('plan', '3. Initial Fascination', true, null, '<h3>3. Initial Fascination</h3><p></p>');
            html += dividerHTML('STAGE IV');
            html += sectionHTML('plan', '4. Nightmare Stage', true, null, '<h3>4. Nightmare Stage</h3><p></p>');
            html += dividerHTML('STAGE V');
            html += sectionHTML('plan', '5. Final Push', true, null, '<h3>5. Final Push</h3><p></p>');
            html += dividerHTML('STAGE VI');
            html += sectionHTML('plan', '6. Goal &amp; Aftermath', true, null, '<h3>6. Goal &amp; Aftermath</h3><p></p>');
            return html;
        }

        // ── Step 28: Final Draft ──
        if (step === 28) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 28: Final Draft (SPAG Polish)</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Return with the Elixir \u2014 perfecting form.</p>' +
                '<p>You\u2019ve built this scene through seven progressive drafts, adding layer after layer of craft. Now we\u2019re going to make sure every word is exactly right. This step is <strong>SPAG</strong> \u2014 Spelling, Punctuation, and Grammar. No more creative changes. This is about polish and precision.</p>' +
                '<p>Read your work aloud \u2014 if a sentence sounds awkward, rewrite it. Check every comma, every full stop, every apostrophe.</p>'
            );
            html += dividerHTML('YOUR FINAL DRAFT');
            html += sectionHTML('response', 'Final Draft', true, null, '<p></p>');
            return html;
        }

        // ── Step 29: Metacognitive Reflection ──
        if (step === 29) {
            html += sectionHTML('question', 'About This Step', false, null,
                '<h2>Step 29: Metacognitive Reflection</h2>' +
                '<p><strong>The Hero\u2019s Journey Stage:</strong> The Return with the Elixir \u2014 understanding your transformation.</p>' +
                '<p>The Hero\u2019s Journey concludes. You must now reflect \u2014 understanding <em>how</em> you\u2019ve been transformed. Write a short reflection (150\u2013250 words) comparing your understanding at the beginning to now.</p>' +
                '<p>Which concept grew most? Which skill improved most dramatically? How will understanding story <em>creation</em> help you <em>analyse</em> literature? Congratulations \u2014 you\u2019ve completed the journey and returned transformed.</p>'
            );
            html += dividerHTML('YOUR REFLECTION');
            html += sectionHTML('plan', 'Reflection', true, null, '<h3>Reflection</h3><p></p>');
            return html;
        }

        // ── Trial steps ──
        if (stepDef.trial) {
            const trialFocus = { 1: 'story coherence', 2: 'character depth', 3: 'archetype coherence', 4: 'emotional impact', 5: 'thematic clarity', 6: 'technical proficiency' };
            const focus = trialFocus[stepDef.trial] || '';
            html += sectionHTML('question', 'Assessment Focus', false, null,
                `<h2>Trial ${stepDef.trial} Assessment</h2>` +
                `<p>This trial assesses your draft for <strong>${focus}</strong>. The AI will analyse your writing and provide structured feedback.</p>`
            );
            html += dividerHTML('ASSESSMENT');
            html += sectionHTML('feedback', 'Assessment', true, null, '<p><em>Your draft will be assessed here.</em></p>');
            return html;
        }

        return '<p></p>';
    }

    // ══════════════════════════════════════════
    //  DOCUMENT TEMPLATE FACTORY (v7.11.9)
    // ══════════════════════════════════════════
    // Generates structured TipTap HTML with sectionBlock nodes.
    // mode: 'diagnostic' | 'redraft' | 'exam_practice'
    // topicData: { question_text, extract_text, extract_location, marks, aos, question_format,
    //              part_a_question, part_a_extract, part_a_marks, part_a_aos,
    //              part_b_question, part_b_extract, part_b_marks, part_b_aos,
    //              label, teaching_point, task }

    // ── Word Count Model (v7.10.170) ──
    // Based on AQA examiner reports: 30 marks ≈ 650 words.
    // Scales proportionally. Minimum = ~70% of target (mark complete threshold).
    // Under 20 marks: no word count tracking (paragraph-based marking).
    let canvasWordTarget = 650;
    let canvasWordMinimum = 450;
    let canvasWordIdeal = 800;
    let canvasUsesWordCount = true;  // false for short-form (<20 marks)
    let canvasDualTargets = null;    // { partA: {target,minimum,ideal}, partB: {target,minimum,ideal} } for dual questions

    // Word count colour tiers: orange (< min) → yellow (min→target) → green (target→ideal) → purple gradient (ideal+)
    function getWordCountColour(wc) {
        if (wc > canvasWordIdeal) return 'linear-gradient(90deg, #2c003e, #5333ed)';  // Brand purple gradient — excellent
        if (wc >= canvasWordTarget) return '#1CD991';   // Green — target reached
        if (wc >= canvasWordMinimum) return '#F1C40F';  // Yellow — minimum reached
        return '#E67E22';                                // Orange — below minimum
    }
    function getWordCountLabel(wc) {
        if (canvasDualTargets) {
            const { partA, partB } = canvasDualTargets;
            const combined = partA.target + partB.target;
            if (wc > partA.ideal + partB.ideal) return `${wc} words (A: ${partA.target} + B: ${partB.target}) ✓ Excellent length!`;
            if (wc >= combined) return `${wc} words (A: ${partA.target} + B: ${partB.target}) ✓ Target reached`;
            if (wc >= canvasWordMinimum) return `${wc} words (A: ${partA.target} + B: ${partB.target}) — Minimum reached`;
            return `${wc} / ${combined} words (A: ${partA.target} + B: ${partB.target})`;
        }
        if (wc > canvasWordIdeal) return `${wc} / ${canvasWordTarget} words ✓ Excellent length!`;
        if (wc >= canvasWordTarget) return `${wc} / ${canvasWordTarget} words ✓ Target reached`;
        if (wc >= canvasWordMinimum) return `${wc} / ${canvasWordTarget} words — Minimum reached`;
        return `${wc} / ${canvasWordTarget} words`;
    }

    // Literature essay word count targets (by total marks)
    // minimum = mark complete threshold (lower bar), target = "aim for" display
    const LIT_WORD_TARGETS = {
        15: { minimum: 200, target: 300, ideal: 600 },
        20: { minimum: 300, target: 400, ideal: 650 },
        24: { minimum: 350, target: 500, ideal: 900 },
        25: { minimum: 350, target: 500, ideal: 900 },
        30: { minimum: 450, target: 650, ideal: 1000 },
        34: { minimum: 450, target: 650, ideal: 1000 },
        40: { minimum: 500, target: 700, ideal: 1100 },
    };
    // Language Section B writing word count targets (creative fiction, non-fiction, transactional)
    // minimum = mark complete threshold, target = "aim for" display
    const LANG_WORD_TARGETS = {
        20: { minimum: 300, target: 400, ideal: 400 },   // EDUQAS C2 split (2 × 20m tasks)
        30: { minimum: 350, target: 450, ideal: 500 },   // IGCSE Specs A P2 & B
        40: { minimum: 450, target: 650, ideal: 700 },   // AQA/EDUQAS/Edexcel/OCR
        45: { minimum: 450, target: 650, ideal: 750 },   // IGCSE Spec A P1 transactional
    };
    // First-diagnostic minimums (lower bar for very first attempt only)
    const FIRST_DIAG_MINS = { 15: 200, 20: 300, 24: 350, 25: 350, 30: 450, 34: 450, 40: 500, 45: 450 };

    function getWordTargets(marks, isLanguage) {
        if (!marks || marks < 15) return { target: 0, minimum: 0, ideal: 0, usesWordCount: false };
        // 8-mark (AQA Unseen Q2) — 2 TTECEA paragraphs, no word count tracking
        if (marks < 15) return { target: 0, minimum: 0, ideal: 0, usesWordCount: false };

        const table = isLanguage ? LANG_WORD_TARGETS : LIT_WORD_TARGETS;
        // Find closest match (exact or nearest lower key)
        const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
        let key = keys[0];
        for (const k of keys) { if (k <= marks) key = k; }
        const t = table[key];
        return { target: t.target, minimum: t.minimum, ideal: t.ideal, usesWordCount: true };
    }

    // Board-level default marks when topic data doesn't specify
    const BOARD_DEFAULT_MARKS = {
        aqa: { shakespeare: 34, modern_text: 34, '19th_century': 30, poetry_anthology: 30, unseen_poetry: 24, language1: 80, language2: 80, language_p1: 80, language_p2: 80 },
        eduqas: { shakespeare: 40, modern: 40, literature: 40, poetry: 40, unseen: 40, language1: 80, language2: 80, language_c1: 80, language_c2: 80 },
        edexcel: { shakespeare: 40, modern: 40, '19th_century': 40, poetry: 20, unseen: 20, language1: 64, language2: 96, language_p1: 64, language_p2: 96 },
        'edexcel-igcse': { heritage: 30, literature: 30, modern: 30, 'modern-prose': 40, unseen: 20, language1: 80, language2: 80, language_p1: 80, language_p2: 80 },
        ocr: { literature: 40, poetry: 40, language1: 80, language2: 80, language_c1: 80, language_c2: 80 },
        sqa: { critical_reading: 20 },
        ccea: { prose: 40, 'unseen-prose': 20, drama: 40, poetry: 40, language1: 80, language2: 80, language_u1: 80, language_u4: 80 },
    };

    function getDefaultMarks(board, subject) {
        return BOARD_DEFAULT_MARKS[board]?.[subject] || 30;
    }

    // ── Board Format Defaults (v7.14.8) ──
    // Complete format + marks + AOs for every board/subject.
    // Used by buildSyntheticTopicData() when no topic template exists.
    const BOARD_FORMAT_DEFAULTS = {
        // AQA GCSE Literature (8702) + Language (8700)
        aqa: {
            shakespeare:      { format: 'single', marks: 34, aos: 'AO1,AO2,AO3', hasExtract: true },
            modern_text:      { format: 'single', marks: 34, aos: 'AO1,AO2,AO3', hasExtract: false },
            '19th_century':   { format: 'single', marks: 30, aos: 'AO1,AO2', hasExtract: true },
            poetry_anthology: { format: 'single', marks: 30, aos: 'AO1,AO2,AO3' },
            unseen_poetry:    { format: 'single', marks: 24, aos: 'AO1,AO2' },
            language1:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
            language_p1:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language_p2:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
        },
        // EDUQAS GCSE Literature (C720QS) + Language (C700U)
        eduqas: {
            shakespeare:      { format: 'dual', partA: { marks: 15, aos: 'AO1,AO2' }, partB: { marks: 25, aos: 'AO1,AO2,AO3' }, hasExtract: true },
            modern_text:      { format: 'single', marks: 40, aos: 'AO1,AO2,AO3' },
            '19th_century':   { format: 'single', marks: 40, aos: 'AO1,AO2' },
            poetry_anthology: { format: 'dual', partA: { marks: 15, aos: 'AO1,AO2' }, partB: { marks: 25, aos: 'AO1,AO2,AO3' } },
            unseen_poetry:    { format: 'dual', partA: { marks: 15, aos: 'AO1,AO2' }, partB: { marks: 25, aos: 'AO1,AO2,AO3' } },
            language1:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO4,AO5,AO6' },
            language_c1:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
            language_c2:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO4,AO5,AO6' },
        },
        // Edexcel GCSE Literature (1ET0) + Language (1EN0)
        edexcel: {
            shakespeare:      { format: 'dual', partA: { marks: 20, aos: 'AO2' }, partB: { marks: 20, aos: 'AO1,AO3' }, hasExtract: true },
            '19th_century':   { format: 'dual', partA: { marks: 20, aos: 'AO1,AO2' }, partB: { marks: 20, aos: 'AO1,AO3' }, hasExtract: true },
            modern_text:      { format: 'single', marks: 40, aos: 'AO1,AO2,AO3' },
            poetry_anthology: { format: 'single', marks: 20, aos: 'AO1,AO2,AO3' },
            unseen_poetry:    { format: 'single', marks: 20, aos: 'AO1,AO2' },
            language1:        { format: 'multi_question', marks: 64, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 96, aos: 'AO1,AO2,AO3,AO4,AO5,AO6' },
            language_p1:      { format: 'multi_question', marks: 64, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language_p2:      { format: 'multi_question', marks: 96, aos: 'AO1,AO2,AO3,AO4,AO5,AO6' },
        },
        // Edexcel IGCSE Literature (4ET1) + Language
        'edexcel-igcse': {
            shakespeare:          { format: 'single', marks: 30, aos: 'AO1,AO2' },
            '19th_century':       { format: 'single', marks: 30, aos: 'AO1,AO2' },
            modern_text:          { format: 'single', marks: 30, aos: 'AO1,AO2' },
            modern_prose:         { format: 'single', marks: 40, aos: 'AO1,AO2' },
            unseen_poetry:        { format: 'single', marks: 20, aos: 'AO1,AO2' },
            poetry_anthology:     { format: 'single', marks: 30, aos: 'AO1,AO2,AO3' },
            prose_anthology:      { format: 'single', marks: 30, aos: 'AO1,AO2' },
            nonfiction_anthology: { format: 'single', marks: 30, aos: 'AO1,AO2' },
            language1:            { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language2:            { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
            language_p1:          { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language_p2:          { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
        },
        // OCR GCSE Literature (J352) + Language
        ocr: {
            shakespeare:      { format: 'single', marks: 40, aos: 'AO1,AO2,AO3' },
            '19th_century':   { format: 'single', marks: 40, aos: 'AO1,AO2' },
            modern_prose:     { format: 'dual', partA: { marks: 20, aos: 'AO1,AO2' }, partB: { marks: 20, aos: 'AO1,AO2' }, hasExtract: true },
            poetry_anthology: { format: 'dual', partA: { marks: 20, aos: 'AO1,AO2' }, partB: { marks: 20, aos: 'AO1,AO2' } },
            language1:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
            language_c1:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO4,AO5,AO6' },
            language_c2:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO3,AO5,AO6' },
        },
        // CCEA GCSE Literature + Language
        ccea: {
            prose:            { format: 'single', marks: 40, aos: 'AO1,AO2' },
            unseen_prose:     { format: 'single', marks: 20, aos: 'AO1,AO2' },
            drama:            { format: 'either_or', marks: 40, aos: 'AO1,AO2' },
            poetry_anthology: { format: 'either_or', marks: 40, aos: 'AO1,AO2,AO3' },
            language1:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language_u1:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language_u4:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
        },
        // SQA National 5
        sqa: {
            critical_reading: { format: 'single', marks: 20, aos: 'AO1,AO2' },
        },
    };

    /**
     * Generate synthetic topic data from board defaults when no template exists.
     * Returns an object matching the shape of REST API topic data.
     */
    function buildSyntheticTopicData(board, subject) {
        if (!board) return null;
        const boardDefaults = BOARD_FORMAT_DEFAULTS[board];
        const def = boardDefaults?.[subject];
        // If no specific config, generate a sensible default from board marks
        if (!def) {
            const fallbackMarks = getDefaultMarks(board, subject);
            return {
                question_format: 'single',
                marks: fallbackMarks,
                aos: 'AO1,AO2',
                question_text: 'Your exam question will appear here when your tutor assigns a topic.',
                extract_text: '',
            };
        }

        const placeholder = 'Your exam question will appear here when your tutor assigns a topic.';
        const extractPlaceholder = 'The extract will appear here when your tutor assigns a topic.';

        // Multi-question format (language papers) — generate placeholder structure from specs (v7.14.56)
        if (def.format === 'multi_question') {
            // Try to load question structure from language-paper-specs.json
            const specs = window.swmlLangSpecs || {};
            const boardSpecs = specs[board];
            // Try subject directly, then common slug variants
            const subjectKey = subject.replace(/^language/, 'language_').replace(/-/g, '_');
            const paperSpec = boardSpecs?.[subject] || boardSpecs?.[subjectKey] || null;
            const questions = [];
            const sources = [];
            if (paperSpec?.sections) {
                paperSpec.sections.forEach(sec => {
                    (sec.questions || []).forEach(q => {
                        questions.push({
                            id: q.id, marks: q.marks, type: q.type,
                            text: q.description || 'Question will appear when your tutor assigns a topic.',
                            label: q.id, aos: (q.aos || []).join(','),
                        });
                    });
                });
            }
            return {
                question_format: 'multi_question',
                marks: def.marks,
                aos: def.aos,
                question_text: questions[0]?.text || placeholder,
                extract_text: '',
                metadata: JSON.stringify({ questions, sources }),
            };
        }

        // Dual formats generate Part A + Part B document structure
        if (def.format === 'dual' || def.format === 'dual_extract') {
            return {
                question_format: def.format,
                part_a_marks: def.partA.marks,
                part_a_aos: def.partA.aos,
                part_a_question: placeholder,
                part_a_extract: def.hasExtract ? extractPlaceholder : '',
                part_b_marks: def.partB.marks,
                part_b_aos: def.partB.aos,
                part_b_question: placeholder,
            };
        }
        // either_or, single — single-essay document
        return {
            question_format: def.format === 'either_or' ? 'either_or' : 'single',
            marks: def.marks,
            aos: def.aos,
            question_text: placeholder,
            extract_text: def.hasExtract ? extractPlaceholder : '',
        };
    }

    // ── Paragraph Count Model (v7.10.170) ──
    // Analysis: ~1 TTECEA paragraph per 4 marks.
    // 20+ marks: full 5-paragraph essay (intro + 3 body + conclusion).
    // Under 20 marks: just TTECEA paragraphs, no intro/conclusion wrapper.
    function getParagraphCount(marks) {
        if (!marks) return 3;
        return Math.max(2, Math.ceil(marks / 4));
    }

    function needsFullEssayStructure(marks) {
        return !marks || marks >= 20;
    }

    /**
     * Scroll to the Essay Question section in the canvas document and pulse-highlight it.
     * Used during assessment to draw student attention to the question.
     */
    function scrollToQuestionSection() {
        const editor = document.getElementById('swml-tiptap-editor');
        if (!editor) return;
        // Find the section with the question — look for "Essay Question" or "Question" label
        const sections = editor.querySelectorAll('[data-section-label]');
        let questionSection = null;
        for (const s of sections) {
            const label = (s.getAttribute('data-section-label') || '').toLowerCase();
            if (label.includes('essay question') || label.includes('question') || label.includes('focus')) {
                questionSection = s;
                break;
            }
        }
        if (!questionSection) return;
        const scrollContainer = editor.closest('.swml-canvas-content');
        if (!scrollContainer) return;
        // Smooth scroll the question section into view
        const sRect = questionSection.getBoundingClientRect();
        const cRect = scrollContainer.getBoundingClientRect();
        const scrollTarget = scrollContainer.scrollTop + (sRect.top - cRect.top) - 60;
        scrollContainer.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        // Add pulse highlight
        questionSection.classList.add('swml-question-pulse');
        setTimeout(() => questionSection.classList.remove('swml-question-pulse'), 2200);
    }

    /**
     * Count words only inside response section blocks.
     * Falls back to full editor word count if no response sections exist (legacy template).
     */
    /**
     * Extract the essay question from the document's Question section.
     * Returns the question prompt (not the extract) formatted for display.
     * Returns empty string if no question found.
     */
    function extractEssayQuestion(editor) {
        if (!editor) return '';
        const qNode = editor.view.dom.querySelector('[data-section-label*="Question"], [data-section-label*="QUESTION"]');
        if (!qNode) return '';

        let qRaw = (qNode.innerText || qNode.textContent || '').trim();

        // Try to find just the QUESTION prompt (not the extract)
        const questionStart = qRaw.match(/(?:Starting with|How (?:does|is|do|far)|Explore how|Write about|Read the following|In this extract|Explain how|To what extent|How (?:and why)|Describe how|Compare how)/i);
        if (questionStart) {
            const idx = qRaw.indexOf(questionStart[0]);
            qRaw = qRaw.substring(idx);
        } else {
            qRaw = qRaw.replace(/^(?:Essay\s+)?Question\s*[:.]?\s*/i, '');
            qRaw = qRaw.replace(/^Extract\s*/i, '');
        }

        qRaw = qRaw.replace(/\s+/g, ' ').trim();
        if (qRaw.length > 120) qRaw = qRaw.substring(0, 120).replace(/\s+\S*$/, '') + '…';
        return qRaw.length > 10 ? qRaw : '';
    }

    function getResponseWordCount(editor) {
        if (!editor) return 0;
        const editorEl = editor.options.element;
        if (!editorEl) return editor.storage.characterCount?.words() || 0;
        // v7.13.53: Count only editable sections, minus template baseline.
        // Baseline is snapshotted on editor create (see _swmlTemplateBaseline).
        const editableSections = editorEl.querySelectorAll('[data-editable="true"]');
        if (editableSections.length === 0) {
            return editor.storage.characterCount?.words() || 0;
        }
        let total = 0;
        editableSections.forEach(section => {
            const clone = section.cloneNode(true);
            clone.querySelectorAll('h3').forEach(el => el.remove());
            const text = clone.textContent || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            total += words.length;
        });
        // Subtract template baseline (instruction text, labels, prompts in fresh template)
        const baseline = editorEl._swmlTemplateBaseline || 0;
        return Math.max(0, total - baseline);
    }
    // Snapshot the template word count once when editor content is first loaded.
    // Called from TipTap onCreate — captures instruction text before student types.
    function snapshotTemplateBaseline(editor) {
        if (!editor) return;
        const editorEl = editor.options.element;
        if (!editorEl) return;
        const editableSections = editorEl.querySelectorAll('[data-editable="true"]');
        if (editableSections.length === 0) return;
        let total = 0;
        editableSections.forEach(section => {
            const clone = section.cloneNode(true);
            clone.querySelectorAll('h3').forEach(el => el.remove());
            const text = clone.textContent || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            total += words.length;
        });
        editorEl._swmlTemplateBaseline = total;
    }

    /**
     * Extract the text content of the Response section(s) only.
     * Used to inject the student's essay into assessment chat context.
     */
    function getResponseText(editor) {
        if (!editor) return '';
        const editorEl = editor.options.element;
        if (!editorEl) return editor.getText() || '';
        const responseSections = editorEl.querySelectorAll('[data-section-type="response"]');
        if (responseSections.length === 0) return editor.getText() || '';

        // Multiple response sections (e.g. EDUQAS Part A/B) — label each
        if (responseSections.length > 1) {
            const parts = [];
            responseSections.forEach(section => {
                const text = section.textContent?.trim() || '';
                if (text) {
                    const label = section.getAttribute('data-section-label') || '';
                    parts.push(label ? `=== ${label.toUpperCase()} ===\n${text}` : text);
                }
            });
            return parts.join('\n\n');
        }

        // Single response section — split into essay paragraphs for section-level assessment
        // Query ALL block-level children (students may paste as h3, h2, p, etc.)
        const section = responseSections[0];
        const blockEls = section.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (blockEls.length === 0) return section.textContent?.trim() || '';

        // Extract substantial text blocks (20+ words = essay paragraph)
        const MIN_WORDS = 20;
        const blocks = [];
        blockEls.forEach(el => {
            const text = el.textContent?.trim() || '';
            if (!text) return;
            const wordCount = text.split(/\s+/).length;
            if (wordCount >= MIN_WORDS) {
                blocks.push(text);
            } else if (blocks.length > 0 && wordCount > 3) {
                // Short but non-trivial text — append to previous block
                blocks[blocks.length - 1] += ' ' + text;
            }
            // Skip very short fragments (≤3 words) — likely empty line artefacts
        });

        // Single block or no blocks — return without labels
        if (blocks.length <= 1) return blocks[0] || section.textContent?.trim() || '';

        // Label neutrally — the AI determines each paragraph's function (intro/body/conclusion)
        const labelled = blocks.map((block, i) => `=== PARAGRAPH ${i + 1} ===\n${block}`);
        return labelled.join('\n\n');
    }

    function sectionHTML(type, label, editable, partNumber, innerHTML) {
        const ro = editable === false ? ' data-readonly="true"' : '';
        const part = partNumber ? ` data-part="${partNumber}"` : '';
        const roClass = editable === false ? ' swml-section-readonly' : '';
        return `<div data-section-type="${type}" data-section-label="${label}" data-editable="${editable !== false}"${ro}${part} class="swml-section-block swml-section-${type}${roClass}">${innerHTML}</div>`;
    }

    function dividerHTML(label) {
        return sectionHTML('divider', label, false, null, `<p>${escapeHTML(label)}</p>`);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // v7.14.28: InputField HTML generator — renders a styled, TipTap-managed editable block
    // with a visible prompt label and bordered input area. Comments, dictation, toolbar all work.
    function inputHTML(prompt, fieldId) {
        const pid = fieldId ? ` data-field-id="${escapeHTML(fieldId)}"` : '';
        return `<div data-input-field="true" data-prompt="${escapeHTML(prompt || '')}"${pid} class="swml-input-field"></div>`;
    }

    function buildQuestionSection(questionText, extractText, extractLocation, marks, aos, partLabel) {
        const label = partLabel ? `Question & Extract — ${partLabel}` : 'Question & Extract';
        let inner = '';
        if (extractText) {
            // v7.14.43: Decode HTML entities (e.g. &nbsp;) before escaping — extract data may contain pre-encoded entities
            let cleanExtract = extractText;
            if (cleanExtract.includes('&')) {
                const tmp = document.createElement('textarea');
                tmp.innerHTML = cleanExtract;
                cleanExtract = tmp.value;
            }
            inner += `<h3>Extract</h3>`;
            if (extractLocation) inner += `<p><em>${escapeHTML(extractLocation)}</em></p>`;
            // Preserve line breaks in extract
            const lines = cleanExtract.split('\n').map(l => `<p>${escapeHTML(l) || '&nbsp;'}</p>`).join('');
            inner += lines;
            inner += `<h3>Question</h3>`;
        }
        // Split question text on bullet points (•) so each gets its own line
        if (questionText && questionText.includes('•')) {
            const parts = questionText.split('•').map(p => p.trim()).filter(Boolean);
            // First part is the preamble (before first bullet)
            const preamble = parts[0];
            const bullets = parts.slice(1);
            if (preamble.endsWith(':') || bullets.length > 0) {
                inner += `<p>${escapeHTML(preamble)}</p>`;
                bullets.forEach(b => { inner += `<p>• ${escapeHTML(b)}</p>`; });
            } else {
                inner += `<p>${escapeHTML(questionText)}</p>`;
            }
        } else {
            inner += `<p>${escapeHTML(questionText)}</p>`;
        }
        if (marks || aos) {
            const meta = [];
            if (marks) meta.push(`[${marks} marks]`);
            if (aos) meta.push(aos);
            inner += `<p><em>${meta.join(' — ')}</em></p>`;
        }
        return sectionHTML('question', label, false, null, inner);
    }

    function buildPlanSection(partLabel, marks) {
        const fullEssay = needsFullEssayStructure(marks);
        const prefix = partLabel ? ` — ${partLabel}` : '';
        let html = '';
        if (fullEssay) {
            html += sectionHTML('plan', `Plan: Introduction${prefix}`, true, null,
                inputHTML('Introduce your argument BRIEFLY.', 'plan-intro'));
            const bodyCount = marks >= 40 ? 4 : 3;
            for (let i = 1; i <= bodyCount; i++) {
                html += sectionHTML('plan', `Plan: Body Paragraph ${i}${prefix}`, true, null,
                    inputHTML(`Focus only on KEY IDEA #${i}.`, `plan-body-${i}`));
            }
            html += sectionHTML('plan', `Plan: Conclusion${prefix}`, true, null,
                inputHTML('Restate thesis. Central purpose. Universal message. CRUCIAL!', 'plan-conclusion'));
        } else {
            const paraCount = getParagraphCount(marks);
            for (let i = 1; i <= paraCount; i++) {
                html += sectionHTML('plan', `Plan: Paragraph ${i}${prefix}`, true, null,
                    inputHTML(`Plan for paragraph ${i}`, `plan-para-${i}`));
            }
        }
        return html;
    }

    function buildIUMVCCPlanSection(partLabel) {
        const prefix = partLabel ? ` — ${partLabel}` : '';
        return sectionHTML('plan', `Plan: Introduction${prefix}`, true, null, inputHTML('Hook the reader. Establish your voice and position.', 'iumvcc-intro')) +
            sectionHTML('plan', `Plan: Urgency${prefix}`, true, null, inputHTML('Why does this matter NOW? Create emotional pressure.', 'iumvcc-urgency')) +
            sectionHTML('plan', `Plan: Methodology${prefix}`, true, null, inputHTML('What is the solution? Paint a vivid picture of how it works.', 'iumvcc-method')) +
            sectionHTML('plan', `Plan: Vision${prefix}`, true, null, inputHTML('What does the future look like if we act? Use imagery.', 'iumvcc-vision')) +
            sectionHTML('plan', `Plan: Counter-Argument${prefix}`, true, null, inputHTML('Acknowledge the opposition, then dismantle it.', 'iumvcc-counter')) +
            sectionHTML('plan', `Plan: Conclusion${prefix}`, true, null, inputHTML('Call to action. Leave a lasting image.', 'iumvcc-conclusion'));
    }

    // v7.14.46: Outline section — uses InputFields with criterion labels.
    // TipTap doesn't have a Table extension, so we use InputFields (which TipTap manages)
    // with CSS-styled criterion labels above each field.
    function buildOutlineSection(aos, partLabel, marks) {
        const aoList = (aos || 'AO1,AO2,AO3').split(',').map(a => a.trim());
        const fullEssay = needsFullEssayStructure(marks);
        const prefix = partLabel ? ` — ${partLabel}` : '';
        let html = '';
        if (fullEssay) {
            html += sectionHTML('outline', `Outline: Introduction${prefix}`, true, null,
                inputHTML('Hook (AO1/AO3): An intriguing concept or contextual observation', 'outline-intro-hook') +
                inputHTML('Building Sentences (AO3): Contextual backdrop \u2014 historical, social, or cultural', 'outline-intro-building') +
                inputHTML('Thesis (AO1): Your 3-point argument \u2014 three key ideas that answer the question', 'outline-intro-thesis'));
            const bodyCount = marks >= 40 ? 4 : 3;
            for (let i = 1; i <= bodyCount; i++) {
                html += sectionHTML('outline', `Outline: Body Paragraph ${i}${prefix}`, true, null,
                    inputHTML(`Topic Sentence (AO1): A conceptual idea linking to your thesis`, `outline-body-${i}-topic`) +
                    inputHTML('Evidence + Technique (AO1/AO2): Quote + name the technique. Integrate, don\'t bolt on', `outline-body-${i}-evidence`) +
                    inputHTML('Close Analysis (AO2): Examine specific words, sounds, or structural choices', `outline-body-${i}-analysis`) +
                    inputHTML('Effects on Reader (AO2): Two specific emotional or intellectual effects', `outline-body-${i}-effects`) +
                    inputHTML("Author's Purpose + Context (AO1/AO3): Why these choices? Link to context", `outline-body-${i}-purpose`));
            }
            html += sectionHTML('outline', `Outline: Conclusion${prefix}`, true, null,
                inputHTML('Restated Thesis (AO1): Restate your argument \u2014 evolved, not repeated', 'outline-conclusion-thesis') +
                inputHTML('Controlling Concept (AO1): The single most important idea connecting your paragraphs', 'outline-conclusion-concept') +
                inputHTML("Author's Central Purpose (AO1/AO3): What the text ultimately argues or reveals", 'outline-conclusion-purpose') +
                inputHTML('Universal Message (AO1): The broader moral or idea that transcends the text', 'outline-conclusion-message'));
        } else {
            const aoPrompts = {
                AO1: 'What is the writer saying about human life? (Key ideas & interpretations)',
                AO2: 'How does the writer say it? (Language, structure, symbolism)',
                AO3: 'Why does the writer say it? (Context \u2014 social, historical, cultural)',
                AO4: 'How does this compare to the other text? (Connections & contrasts)',
            };
            const paraCount = getParagraphCount(marks);
            for (let i = 1; i <= paraCount; i++) {
                let aoInner = '';
                aoList.forEach(ao => {
                    aoInner += inputHTML(`${ao}: ${aoPrompts[ao] || ao}`, `outline-para-${i}-${ao.toLowerCase()}`);
                });
                html += sectionHTML('outline', `Outline: Paragraph ${i}${prefix}`, true, null, aoInner);
            }
        }
        return html;
    }

    function buildResponseSection(partLabel) {
        const label = partLabel ? `Response — ${partLabel}` : 'Response';
        return sectionHTML('response', label, true, null, `<p><em>Write your essay here.</em></p><p></p>`);
    }

    // ── Per-Paragraph Feedback — each paragraph is its own section ──
    // Per-paragraph mark allocation from protocols (board → total_marks → split)
    // When topic marks don't match a known split, scale proportionally from AQA 30-mark base.
    const MARK_SPLITS = {
        // EDUQAS Poetry Section A 15 marks (1+4+4+4+2=15)
        15: { intro: 1, body: 4, conclusion: 2 },
        // Edexcel GCSE poetry/unseen 20 marks / CCEA unseen prose 20 / SQA critical essay 20
        20: { intro: 2, body: 5, conclusion: 3 },
        // AQA unseen poetry 24 marks / EDUQAS unseen 24
        24: { intro: 2, body: 6, conclusion: 4 },
        // EDUQAS dual Part B 25 marks / Edexcel IGCSE anthology poetry 25
        25: { intro: 3, body: 6, conclusion: 4 },
        // AQA 19th Century 30 / Edexcel IGCSE Literary Heritage 30 / Edexcel IGCSE Modern Drama 30
        30: { intro: 3, body: 7, conclusion: 6 },
        // AQA Shakespeare 34 (30+4 AO4) / AQA Modern Text 34 (30+4 AO4)
        34: { intro: 3, body: 8, conclusion: 7 },
        // EDUQAS 40 / OCR 40 / Edexcel GCSE Shakespeare/Post-1914/19thC 40 / CCEA prose 40 / CCEA drama 40 / CCEA poetry 40
        // EDUQAS protocol: intro 5 + body 9×3 + conclusion 8 = 40
        40: { intro: 5, body: 9, conclusion: 8 },
    };

    function getMarkSplit(marks) {
        if (MARK_SPLITS[marks]) return { ...MARK_SPLITS[marks] };
        // Fallback: scale proportionally from 30-mark base
        const scale = (marks || 30) / 30;
        return {
            intro: Math.max(1, Math.round(3 * scale)),
            body: Math.max(2, Math.round(7 * scale)),
            conclusion: Math.max(1, Math.round(6 * scale)),
        };
    }

    /**
     * Look up a question's spec from the language-paper-specs.json data.
     * Returns the question object { id, marks, type, aos, description, ... } or null.
     * v7.14.16
     */
    function lookupQuestionSpec(questionId) {
        const specs = window.swmlLangSpecs || {};
        const board = (state.board || '').toLowerCase().replace(/-/g, '');
        const subject = (state.subject || '').replace(/-/g, '_');
        const paper = specs[board]?.[subject];
        if (!paper?.sections) return null;
        for (const sec of paper.sections) {
            for (const q of sec.questions || []) {
                if (q.id === questionId) return q;
            }
        }
        return null;
    }

    /**
     * Build section dividers from the specs JSON if available.
     * Returns a map: questionId → sectionLabel for inserting dividers before each question.
     * v7.14.16
     */
    function buildSectionMap() {
        const specs = window.swmlLangSpecs || {};
        const board = (state.board || '').toLowerCase().replace(/-/g, '');
        const subject = (state.subject || '').replace(/-/g, '_');
        const paper = specs[board]?.[subject];
        if (!paper?.sections) return null;
        const map = {};
        for (const sec of paper.sections) {
            const firstQ = sec.questions?.[0];
            if (firstQ) map[firstQ.id] = sec.label;
        }
        return map;
    }

    /**
     * Per-question word count target based on question type and marks.
     * Returns { target, label } or null for list-format questions.
     * v7.14.16
     */
    function getQuestionWordTarget(qType, marks) {
        switch (qType) {
            case 'multiple_choice': return null;
            case 'retrieval':       return marks <= 2 ? null : { target: marks * 15, label: `~${marks * 15} words` };
            case 'short_analysis':  return { target: marks * 25, label: `~${marks * 25} words` };
            case 'analysis':        return { target: marks * 30, label: `~${marks * 30} words` };
            case 'evaluation':      return { target: marks * 25, label: `~${marks * 25} words` };
            case 'comparison':      return { target: marks * 25, label: `~${marks * 25} words` };
            case 'extended_writing':
            case 'choice':
                return marks >= 40
                    ? { target: 550, label: '~450\u2013600 words' }
                    : { target: 350, label: '~300\u2013400 words' };
            default: return marks >= 20 ? { target: 550, label: '~450\u2013600 words' } : null;
        }
    }

    /**
     * Multi-question document template (Language papers).
     * v7.14.16: Type-aware response sections using language-paper-specs.json.
     * Falls back to marks-based logic when no spec match is found.
     *
     * Mode: 'diagnostic' = question + response (no plan).
     *        'redraft' = question + plan + response for writing questions.
     */
    function buildMultiQuestionTemplate(mode, topicData) {
        const meta = typeof topicData.metadata === 'string' ? JSON.parse(topicData.metadata || '{}') : (topicData.metadata || {});
        const questions = meta.questions || [];
        const sources = meta.sources || [];
        let html = '';

        // Build section divider map from specs (if available)
        const sectionMap = buildSectionMap();

        // ── Source texts (if any) ──
        if (sources.length > 0) {
            html += dividerHTML('SOURCE MATERIAL');
            sources.forEach(function(src) {
                let inner = '';
                if (src.title) inner += `<p><strong>${escapeHTML(src.title)}</strong></p>`;
                if (src.author) inner += `<p><em>by ${escapeHTML(src.author)}</em></p>`;
                if (src.date) inner += `<p><em>${escapeHTML(src.date)}</em></p>`;
                if (src.text) {
                    src.text.split('\n').forEach(function(line) {
                        inner += `<p>${escapeHTML(line) || '&nbsp;'}</p>`;
                    });
                }
                html += sectionHTML('source', escapeHTML(src.label), false, null, inner);
            });
        }

        // ── Questions ──
        let lastSection = '';
        questions.forEach(function(q, idx) {
            const qMarks = parseInt(q.marks) || 0;
            const qId = q.id || q.label || ('Q' + (idx + 1));

            // Look up type from specs JSON, fall back to topic metadata, then infer from marks
            const specQ = lookupQuestionSpec(qId);
            const qType = q.type || specQ?.type || null;
            const isWritingQ = qType === 'extended_writing' || qType === 'choice'
                || qMarks >= 24 || /section\s*b|writing|creative|persuasive|narrative|descriptive/i.test(q.label || '');
            const isPersuasive = /persuasive|speech|letter|article|argue|convince|advise/i.test(q.text || q.label || '');

            // Section dividers from specs (multi-section support for Edexcel P2 etc.)
            if (sectionMap && sectionMap[qId] && sectionMap[qId] !== lastSection) {
                lastSection = sectionMap[qId];
                html += dividerHTML(lastSection.toUpperCase());
            } else if (!sectionMap) {
                // Fallback: simple Section A / Section B detection
                const newSection = idx === 0 ? 'SECTION A: READING' :
                    (isWritingQ && lastSection !== 'SECTION B: WRITING') ? 'SECTION B: WRITING' : '';
                if (newSection && newSection !== lastSection) {
                    lastSection = newSection;
                    html += dividerHTML(lastSection);
                }
            }

            // Question header
            let qInner = '';
            if (q.line_ref) qInner += `<p><em>Lines: ${escapeHTML(q.line_ref)}</em></p>`;
            if (q.extract) {
                qInner += `<h3>Extract</h3>`;
                q.extract.split('\n').forEach(function(line) {
                    qInner += `<p>${escapeHTML(line) || '&nbsp;'}</p>`;
                });
            }
            // Question text
            if (q.text) {
                q.text.split('\n').forEach(function(line) {
                    if (line.trim()) qInner += `<p>${escapeHTML(line)}</p>`;
                });
            }
            if (qMarks) qInner += `<p><em>[${qMarks} marks]</em></p>`;
            if (q.aos) qInner += `<p><em>${escapeHTML(q.aos)}</em></p>`;
            // Per-question word target hint
            const wordTarget = qType ? getQuestionWordTarget(qType, qMarks) : null;
            if (wordTarget) qInner += `<p><em>Aim for ${wordTarget.label}.</em></p>`;
            html += sectionHTML('question', `${qId}`, false, null, qInner);

            // Plan (redraft mode only for writing questions)
            if (mode === 'redraft' && isWritingQ) {
                html += dividerHTML(`PLAN \u2014 ${qId}`);
                if (isPersuasive) {
                    html += buildIUMVCCPlanSection(qId);
                } else if (qMarks >= 20 || qType === 'extended_writing' || qType === 'choice') {
                    html += buildPlanSection(qId, qMarks);
                }
            }

            // ── Response area (type-aware) ──
            html += dividerHTML(`RESPONSE \u2014 ${qId}`);

            if (qType === 'multiple_choice') {
                // Multiple choice: list of statements to tick (e.g., AQA P2 Q1)
                const desc = specQ?.description || q.text || '';
                html += sectionHTML('response', `${qId} Response`, true, null,
                    `<p><em>${escapeHTML(desc)}</em></p>` +
                    `<p></p><p><em>List the correct statements below:</em></p>` +
                    `<ol><li></li><li></li><li></li><li></li></ol>`);

            } else if (qType === 'retrieval' && qMarks <= 5) {
                // Short retrieval: one bullet per mark
                const count = Math.max(1, qMarks);
                let items = '';
                for (let i = 1; i <= count; i++) {
                    items += `<li></li>`;
                }
                html += sectionHTML('response', `${qId} Response`, true, null,
                    `<ol>${items}</ol>`);

            } else if (qType === 'short_analysis') {
                // Short analysis: 1-2 paragraphs with PEA hint
                const paraCount = Math.max(1, Math.ceil(qMarks / 5));
                for (let i = 1; i <= paraCount; i++) {
                    html += sectionHTML('response', `${qId} Paragraph ${i}`, true, null,
                        `<p><em>Point \u2192 Evidence \u2192 Analysis</em></p><p></p>`);
                }

            } else if (qType === 'analysis') {
                // Multi-paragraph analysis with evidence
                const paraCount = Math.max(2, Math.ceil(qMarks / 4));
                for (let i = 1; i <= paraCount; i++) {
                    html += sectionHTML('response', `${qId} Paragraph ${i}`, true, null,
                        `<p><em>Point \u2192 Evidence \u2192 Analyse language/structure</em></p><p></p>`);
                }

            } else if (qType === 'evaluation') {
                // Extended evaluative response with personal judgement
                html += sectionHTML('response', `${qId} Introduction`, true, null,
                    `<p><em>State your position clearly.</em></p><p></p>`);
                const bodyCount = Math.max(2, Math.ceil((qMarks - 4) / 4));
                for (let i = 1; i <= bodyCount; i++) {
                    html += sectionHTML('response', `${qId} Body ${i}`, true, null,
                        `<p><em>Point \u2192 Evidence \u2192 Analysis \u2192 Judgement</em></p><p></p>`);
                }
                html += sectionHTML('response', `${qId} Conclusion`, true, null,
                    `<p><em>Overall judgement — to what extent do you agree?</em></p><p></p>`);

            } else if (qType === 'comparison') {
                // Cross-text comparison structure
                html += sectionHTML('response', `${qId} Introduction`, true, null,
                    `<p><em>Identify the key similarity or difference between the texts.</em></p><p></p>`);
                const compParas = Math.max(2, Math.ceil(qMarks / 5));
                for (let i = 1; i <= compParas; i++) {
                    html += sectionHTML('response', `${qId} Comparison ${i}`, true, null,
                        `<p><em>Text 1 point \u2192 Text 2 point \u2192 Analysis of difference/similarity</em></p><p></p>`);
                }

            } else if (qType === 'extended_writing' || qType === 'choice') {
                // Full essay: intro + body + conclusion (existing pattern)
                if (qType === 'choice') {
                    html += sectionHTML('response', `${qId} \u2014 Choose ONE task`, false, null,
                        `<p><em>Write your chosen task below.</em></p>`);
                }
                html += sectionHTML('response', `${qId} Introduction`, true, null,
                    `<p><em>Write your introduction here.</em></p><p></p>`);
                const bodyCount = qMarks >= 40 ? 4 : 3;
                for (let i = 1; i <= bodyCount; i++) {
                    html += sectionHTML('response', `${qId} Body ${i}`, true, null,
                        `<p><em>Write body paragraph ${i} here.</em></p><p></p>`);
                }
                html += sectionHTML('response', `${qId} Conclusion`, true, null,
                    `<p><em>Write your conclusion here.</em></p><p></p>`);

            } else {
                // Fallback: marks-based logic (for unverified boards or missing types)
                const fullEssay = needsFullEssayStructure(qMarks);
                if (fullEssay) {
                    html += sectionHTML('response', `${qId} Introduction`, true, null,
                        `<p><em>Write your introduction here.</em></p><p></p>`);
                    const bodyCount = qMarks >= 40 ? 4 : 3;
                    for (let i = 1; i <= bodyCount; i++) {
                        html += sectionHTML('response', `${qId} Body ${i}`, true, null,
                            `<p><em>Write body paragraph ${i} here.</em></p><p></p>`);
                    }
                    html += sectionHTML('response', `${qId} Conclusion`, true, null,
                        `<p><em>Write your conclusion here.</em></p><p></p>`);
                } else if (qMarks >= 4) {
                    const paraCount = getParagraphCount(qMarks);
                    for (let i = 1; i <= paraCount; i++) {
                        html += sectionHTML('response', `${qId} Response ${i}`, true, null, `<p></p>`);
                    }
                } else {
                    html += sectionHTML('response', `${qId} Response`, true, null, `<p></p>`);
                }
            }
        });

        return html;
    }

    function buildFeedbackSection(markSplit, partLabel) {
        const s = markSplit || { intro: 3, body: 7, conclusion: 6 };
        const prefix = partLabel ? `${partLabel} ` : '';
        let html = '';
        html += sectionHTML('feedback', `${prefix}Feedback: Introduction (— / ${s.intro})`, false, null,
            `<p><em>Feedback and revised paragraph example will appear after assessment.</em></p>`);
        for (let i = 1; i <= 3; i++) {
            html += sectionHTML('feedback', `${prefix}Feedback: Body ${i} (— / ${s.body})`, false, null,
                `<p><em>Feedback and revised paragraph example will appear after assessment.</em></p>`);
        }
        html += sectionHTML('feedback', `${prefix}Feedback: Conclusion (— / ${s.conclusion})`, false, null,
            `<p><em>Feedback and revised paragraph example will appear after assessment.</em></p>`);
        return html;
    }

    function buildScoresSection(totalMarks) {
        const marks = totalMarks || 30;
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        // Grade boundaries with colour coding (purple → blue → green → yellow → orange → red)
        const grades = [
            { g: '9', pct: 84, color: '#7c3aed' }, { g: '8', pct: 74, color: '#5333ed' },
            { g: '7', pct: 64, color: '#4D76FD' }, { g: '6', pct: 55, color: '#42A1EC' },
            { g: '5', pct: 45, color: '#1CD991' }, { g: '4', pct: 35, color: '#51dacf' },
            { g: '3', pct: 25, color: '#ffb432' }, { g: '2', pct: 15, color: '#ff8c32' },
            { g: '1', pct: 1, color: '#ff6b6b' },
        ];
        let gradeRef = `<h3>Grade Boundaries (/${marks})</h3>`;
        grades.forEach((b, i) => {
            const nextPct = i > 0 ? grades[i - 1].pct - 1 : 100;
            const minMark = Math.round(marks * b.pct / 100);
            const maxMark = i === 0 ? marks : Math.round(marks * nextPct / 100);
            gradeRef += `<p><em style="color:${b.color};opacity:0.85">Grade ${b.g}: ${minMark}–${maxMark} marks (${b.pct}–${nextPct}%)</em></p>`;
        });
        const inner =
            `<p><em>Date Started:</em> ${today}</p>` +
            `<p><em>Date Completed:</em> —</p>` +
            `<p><em>Word Count:</em> — / ${canvasWordTarget}</p>` +
            `<p><em>Total Marks:</em> — / ${marks}</p>` +
            `<p><em>Percentage:</em> —</p>` +
            `<p><em>Grade:</em> NOT STARTED</p>` +
            gradeRef;
        return sectionHTML('scores', 'Score Summary', true, null, inner);
    }

    function buildImprovementSection() {
        let inner = '';
        for (let i = 1; i <= 3; i++) {
            inner += `<h3>Improvement ${i}</h3>`;
            inner += inputHTML('What I need to improve', `improvement-${i}-what`);
            inner += inputHTML('How I will improve it', `improvement-${i}-how`);
        }
        return sectionHTML('improvement', 'Improvement Plan', true, null, inner);
    }

    // Self-assessment descriptors from SureForms (per-skill 1-5 descriptions)
    const SA_DESCRIPTORS = {
        'Hook': ['My opening is a simple statement about the text.', 'I used a basic fact or quote that is loosely related.', 'I have a clear and relevant hook that connects to the theme.', 'My hook is engaging and thoughtfully chosen to set the tone.', 'I began with a powerful, insightful hook that immediately makes the reader think about the theme in a new way.'],
        'Building Sentences': ['I jumped straight to my thesis with no context/background.', 'I mentioned the author/text but gave no other context/background.', 'I provided clear and necessary context/background for my argument.', 'I smoothly integrated relevant context/background that sets up my thesis.', 'I wove in concise, insightful context/background that perfectly frames my argument.'],
        'Thesis': ['I stated the topic, but not my specific argument.', 'My argument is present but vague, and my points are not clear.', 'I have a clear thesis with three distinct points.', 'My thesis is well-written and confidently presents a strong, specific argument.', 'My thesis is perceptive and frames a nuanced argument that will guide the entire essay.'],
        'Topic Sentence': ['I described surface details only.', 'I hinted at an idea but mostly described.', 'I stated a clear idea and started analysing.', 'I clearly linked my idea to the text\'s big message.', 'I framed a perceptive insightful concept that linked to my thesis statement.'],
        'Technical Terms': ['I misused or skipped methods.', 'I used some correct terms loosely.', 'I used the right terms accurately.', 'I used precise terms for language and structure.', 'I used varied, exact terms and demonstrated how methods are interrelated.'],
        'Evidence': ['I chose unhelpful or no evidence.', 'I quoted something loosely linked.', 'I chose an apt quote to support my point.', 'I picked a very apt, concise quote that set up analysis.', 'I chose a pinpoint quote that allowed rich analysis.'],
        'Close Analysis': ['I paraphrased instead of analysing.', 'I named words/devices with little meaning.', 'I explained key words and their connotations.', 'I analysed details with layered reasons.', 'I performed close analysis at the sound/word/structure level.'],
        'Effects on Reader': ['I gave a vague effect.', 'I named an effect but barely explained why.', 'I explained a clear effect with a basic reason.', 'I weighed specific effects with alternatives.', 'I linked detailed and nuanced effects to audience and purpose.'],
        "Author's Purpose": ['I gave a generic purpose with no evidence link.', 'I touched on purpose briefly.', 'I linked a clear purpose to my analysis.', 'I explored why the purpose matters.', 'I evaluated author\'s purpose and implications perceptively.'],
        'Context': ['I mentioned a historical fact but didn\'t link it.', 'I included loosely relevant context.', 'I used context to support the author\'s purpose.', 'I integrated context smoothly to explain the author\'s choices.', 'I wove context throughout for deep insightful understanding.'],
        'Restated Thesis': ['I did not restate my thesis.', 'I repeated my original thesis almost word-for-word.', 'I rephrased my thesis clearly.', 'I restated my thesis in a new, confident way reflecting my arguments.', 'I powerfully synthesised and restated my thesis.'],
        'Controlling Concept': ['I identified a simple theme but didn\'t connect it.', 'I found a theme but struggled to explain its links.', 'I identified a valid controlling concept linked to start and end.', 'I explained a strong controlling concept with specific details.', 'I identified a nuanced controlling concept governing the text\'s entire structure.'],
        'Central Purpose': ['I only repeated points from my body paragraphs.', 'I mentioned a general theme but not a central purpose.', 'I identified the author\'s main purpose.', 'I clearly explained the author\'s central purpose and its importance.', 'I offered a powerful evaluation of the author\'s central purpose with nuance.'],
        'Universal Message': ['My essay just stops without a final thought.', 'I ended with a simple summary of the text.', 'I made a clear connection to the world today.', 'I offered a thoughtful statement about what the text teaches us.', 'I concluded with a memorable insightful universal message.'],
        'Language Sophistication': ['My language is simple and functional.', 'I used some good vocabulary but expression was sometimes awkward.', 'My writing is clear and uses accurate academic vocabulary.', 'I used sophisticated vocabulary and varied sentence structures.', 'My language is consistently nuanced, precise, and demonstrates a distinctive academic voice.'],
        'Vocabulary Precision': ['I used simple, everyday words.', 'My vocabulary is mostly clear, with some repetition.', 'I used accurate academic and subject-specific vocabulary.', 'I used a wide range of precise and effective vocabulary.', 'My vocabulary is consistently sophisticated and nuanced.'],
        'Sentence Structure': ['My sentences are mostly short and simple.', 'I connected some ideas, but sentences are often basic.', 'I correctly used compound and complex sentences.', 'I consistently used long, detailed sentences to build arguments.', 'I used complex and compound sentences for a sophisticated academic style.'],
        'Discourse Markers': ['I mainly rely on connecting with \'the\' or \'this\'.', 'I used a few basic connecting words.', 'I used some appropriate discourse markers.', 'I used a good range of discourse markers for logical relationships.', 'I used sophisticated discourse markers seamlessly for a fluent, coherent argument.'],
    };

    function buildSelfAssessmentSection(isDual) {
        if (isDual) {
            // v7.13.83: Dual-part papers — combined overall confidence per part + key skills
            let inner = `<p><em>Rate your overall confidence (1 = not confident, 5 = very confident):</em></p>`;
            inner += `<h3>Overall Confidence</h3>`;
            inner += `<p>Part A (extract question): \u2014 / 5</p>`;
            inner += `<p>Part B (essay question): \u2014 / 5</p>`;
            inner += `<h3>Key Skills</h3>`;
            inner += `<p>Evidence Selection: \u2014 / 5</p>`;
            inner += `<p>Close Analysis: \u2014 / 5</p>`;
            inner += `<p>Effects on Reader: \u2014 / 5</p>`;
            inner += `<p>Author\u2019s Purpose: \u2014 / 5</p>`;
            inner += `<p>Context Integration: \u2014 / 5</p>`;
            inner += `<p>Academic Writing: \u2014 / 5</p>`;
            return sectionHTML('action', 'Self-Assessment', true, null, inner);
        }
        const skills = [
            { cat: 'Introduction', items: ['Hook', 'Building Sentences', 'Thesis'] },
            { cat: 'Body Paragraphs', items: ['Topic Sentence', 'Technical Terms', 'Evidence', 'Close Analysis', 'Effects on Reader', "Author's Purpose", 'Context'] },
            { cat: 'Conclusion', items: ['Restated Thesis', 'Controlling Concept', 'Central Purpose', 'Universal Message'] },
            { cat: 'Academic Writing', items: ['Language Sophistication', 'Vocabulary Precision', 'Sentence Structure', 'Discourse Markers'] },
        ];
        let inner = `<p><em>Rate your confidence in each skill (1 = basic, 5 = expert):</em></p>`;
        skills.forEach(s => {
            inner += `<h3>${s.cat}</h3>`;
            s.items.forEach(item => { inner += `<p>${item}: \u2014 / 5</p>`; });
        });
        return sectionHTML('action', 'Self-Assessment', true, null, inner);
    }

    function buildAnalyticsSection() {
        const inner =
            `<h3>Top Missed Areas</h3>` +
            inputHTML('Specify AO1, AO2, AO3, etc.', 'analytics-top-missed') +
            `<h3>Opt-outs This Attempt</h3>` +
            `<p><em>Number of opt-outs:</em> —</p>` +
            inputHTML('Opt-out items (AO1, AO2, etc.)', 'analytics-optouts') +
            `<h3>Trend: Repeated Errors</h3>` +
            inputHTML('Specify AO1, AO2, AO3, etc.', 'analytics-repeated-errors') +
            `<h3>Trend: Improvements</h3>` +
            inputHTML('Specify AO1, AO2, AO3, etc.', 'analytics-improvements') +
            `<h3>Biggest Challenges</h3>` +
            inputHTML('Specify AO1, AO2, AO3, etc.', 'analytics-challenges');
        return sectionHTML('feedback', 'Analytics', true, null, inner);
    }

    function buildActionPlanSection(mode) {
        let inner =
            `<h3>Grade Goal</h3>` +
            inputHTML('Your target grade', 'action-grade-goal') +
            `<h3>3 Priorities</h3>` +
            inputHTML('Specify AO1, AO2, AO4, etc.', 'action-priorities') +
            `<h3>Short-term Aims</h3>` +
            inputHTML('Specify AO1, AO2, AO4, etc.', 'action-short-term') +
            `<h3>Action 1: Course & Resources</h3>` +
            inputHTML('Specify AO1, AO2, AO4, etc.', 'action-1-resources') +
            `<h3>Action 2: Lessons</h3>` +
            inputHTML('Specify AO1, AO2, AO4, etc.', 'action-2-lessons') +
            `<h3>Action 3: Support</h3>` +
            inputHTML('Specify AO1, AO2, AO4, etc.', 'action-3-support');
        // Next Topic only appears in redraft — student chooses their next topic after completing the cycle
        if (mode === 'redraft') {
            inner +=
                `<h3>Next Topic</h3>` +
                inputHTML('Your next topic', 'action-next-topic') +
                inputHTML('Reason for this choice', 'action-next-reason');
        }
        return sectionHTML('action', 'Action Plan', true, null, inner);
    }

    function buildSignoffSection() {
        const inner =
            `<p><em>Status:</em> Awaiting sign-off</p>` +
            `<p><em>Tutor:</em> —</p>` +
            `<p><em>Date:</em> —</p>`;
        return sectionHTML('signoff', 'Tutor Sign-off', false, null, inner);
    }

    // ══════════════════════════════════════════
    //  EXERCISE-SPECIFIC DOCUMENT TEMPLATES (v7.13.17)
    // ══════════════════════════════════════════
    // These templates are for chat-to-canvas migrated exercises.
    // Each exercise gets a document alongside the AI chat panel.

    /**
     * Exam Question Creator — document shows the generated question + analysis.
     * Sections populated by the AI chat as the exercise progresses.
     */
    function getExamQuestionTemplate() {
        let html = '';
        html += dividerHTML('Exam Question Creator');
        html += sectionHTML('question', 'Generated Question', false, null,
            `<p><em>Your exam question will appear here once generated by the AI.</em></p>`);
        html += sectionHTML('feedback', 'Question Analysis', false, null,
            `<p><em>Past paper frequency data and theme patterns will appear here.</em></p>`);
        html += dividerHTML('Your Notes');
        html += sectionHTML('response', 'Question Notes', true, null,
            `<p><em>Use this space to note down anything about this question — themes, key quotes, initial ideas.</em></p><p></p>`);
        return html;
    }

    /**
     * Essay Plan — structured TTECEA+C plan with Introduction, Body 1-3, Conclusion.
     * Student fills in plan sections with AI guidance.
     */
    function getEssayPlanTemplate() {
        let html = '';
        html += dividerHTML('Essay Plan');
        html += sectionHTML('question', 'Question', false, null,
            `<p><em>The essay question will appear here.</em></p>`);
        html += dividerHTML('Your Plan');
        html += sectionHTML('plan', 'Plan: Introduction', true, null,
            `<p><em>Hook:</em></p><p></p>` +
            `<p><em>Building sentences (context):</em></p><p></p>` +
            `<p><em>Thesis (3 key ideas):</em></p><p></p>`);
        for (let i = 1; i <= 3; i++) {
            html += sectionHTML('plan', `Plan: Body Paragraph ${i}`, true, null,
                `<p><em>Topic sentence (key idea):</em></p><p></p>` +
                `<p><em>Technical term + Evidence (quote):</em></p><p></p>` +
                `<p><em>Close analysis + Effects:</em></p><p></p>` +
                `<p><em>Author's purpose + Context:</em></p><p></p>`);
        }
        html += sectionHTML('plan', 'Plan: Conclusion', true, null,
            `<p><em>Restated thesis:</em></p><p></p>` +
            `<p><em>Controlling concept:</em></p><p></p>` +
            `<p><em>Central purpose:</em></p><p></p>` +
            `<p><em>Universal message:</em></p><p></p>`);
        return html;
    }

    /**
     * Model Answer — question + student attempt + AI model for comparison.
     * Coached mode: student writes each section, AI refines. Instant mode: AI generates all.
     */
    function getModelAnswerTemplate() {
        let html = '';
        html += dividerHTML('Model Answer');
        html += sectionHTML('question', 'Question', false, null,
            `<p><em>The essay question will appear here.</em></p>`);
        html += dividerHTML('Your Attempt');
        html += sectionHTML('response', 'Your Introduction', true, null,
            `<p><em>Write your introduction here (7-9 sentences).</em></p><p></p>`);
        for (let i = 1; i <= 3; i++) {
            html += sectionHTML('response', `Your Body Paragraph ${i}`, true, null,
                `<p><em>Write body paragraph ${i} here (7-10 sentences, TTECEA+C structure).</em></p><p></p>`);
        }
        html += sectionHTML('response', 'Your Conclusion', true, null,
            `<p><em>Write your conclusion here (7-9 sentences).</em></p><p></p>`);
        html += dividerHTML('Grade 9 Model');
        html += sectionHTML('feedback', 'Model: Introduction', false, null,
            `<p><em>The Grade 9 model introduction will appear here after your attempt.</em></p>`);
        for (let i = 1; i <= 3; i++) {
            html += sectionHTML('feedback', `Model: Body Paragraph ${i}`, false, null,
                `<p><em>The Grade 9 model body paragraph ${i} will appear here.</em></p>`);
        }
        html += sectionHTML('feedback', 'Model: Conclusion', false, null,
            `<p><em>The Grade 9 model conclusion will appear here.</em></p>`);
        return html;
    }

    /**
     * Quote Analysis — random quote, student plan + paragraph, AI model for comparison.
     */
    function getQuoteAnalysisTemplate() {
        let html = '';
        html += dividerHTML('Random Quote Analysis');
        html += sectionHTML('question', 'Random Quote', false, null,
            `<p><em>A random quote will appear here for you to analyse.</em></p>`);
        html += dividerHTML('Your Analysis');
        html += sectionHTML('plan', 'Your Plan (TTECEA+C)', true, null,
            `<p><em>Topic sentence:</em></p><p></p>` +
            `<p><em>Technical term + Evidence:</em></p><p></p>` +
            `<p><em>Close analysis:</em></p><p></p>` +
            `<p><em>Effects on reader:</em></p><p></p>` +
            `<p><em>Author's purpose + Context:</em></p><p></p>`);
        html += sectionHTML('response', 'Your Paragraph', true, null,
            `<p><em>Write your full paragraph here (200-250 words).</em></p><p></p>`);
        html += dividerHTML('Grade 9 Comparison');
        html += sectionHTML('feedback', 'AI Model Plan', false, null,
            `<p><em>The Grade 9 model plan will appear here for comparison.</em></p>`);
        html += sectionHTML('feedback', 'AI Model Paragraph', false, null,
            `<p><em>The Grade 9 model paragraph will appear here for comparison.</em></p>`);
        return html;
    }

    /**
     * Memory Practice — quality gate reference, original writing, retrieval exercise.
     */
    function getMemoryPracticeTemplate() {
        let html = '';
        html += dividerHTML('Memory Practice');
        html += sectionHTML('question', 'Original Writing', false, null,
            `<p><em>Your submitted writing will appear here for reference during the quality gate.</em></p>`);
        html += sectionHTML('feedback', 'Quality Gate Feedback', false, null,
            `<p><em>The AI will assess your writing against grade-level criteria before proceeding.</em></p>`);
        html += dividerHTML('Retrieval Exercise');
        html += sectionHTML('response', 'Memory Exercise', true, null,
            `<p><em>Your retrieval exercise will begin here once you pass the quality gate.</em></p><p></p>`);
        html += sectionHTML('feedback', 'Results', false, null,
            `<p><em>Your accuracy score and areas to revise will appear here after completion.</em></p>`);
        return html;
    }

    /**
     * Conceptual Notes — Literature (plays/novels).
     * 7 thematic sections, each with a 3-column table: concept | notes | quote.
     */
    function getConceptualNotesLiteratureTemplate() {
        const sections = [
            { label: 'Understanding the Protagonist', cols: ['The Protagonist + Other Characters, Effects, Meaning and Author\'s Purpose', 'Notes', 'Quote'] },
            { label: 'Understanding the Context', cols: ['Context, Meaning and Author\'s Purpose', 'Notes', 'Quote'] },
            { label: 'Understanding the Plot Structure', cols: ['Plot Structure, Effects, Meaning and Author\'s Purpose', 'Notes', 'Quote'] },
            { label: 'Understanding the Genre(s)', cols: ['Genre, Effects, Meaning and Author\'s Purpose', 'Notes', 'Quote'] },
            { label: 'Understanding the Theme(s)', cols: ['Theme, Effects, Meaning and Author\'s Purpose', 'Notes', 'Quote'] },
            { label: 'Understanding the Author\'s Purpose', cols: ['Author\'s Purpose', 'Notes', 'Quote / Historical Fact'] },
            { label: 'Overall Message of the Story', cols: ['Moral, Message, Key Idea + Author\'s Purpose', 'Notes', 'Quote'] },
        ];
        let html = '';
        html += dividerHTML('Grade 9 Conceptual Notes');
        sections.forEach(s => {
            let inner = `<h3>${escapeHTML(s.label)}</h3>`;
            // Build a simple table with 5 empty rows
            inner += `<table><thead><tr>`;
            s.cols.forEach(c => { inner += `<th>${escapeHTML(c)}</th>`; });
            inner += `</tr></thead><tbody>`;
            for (let i = 0; i < 5; i++) {
                inner += `<tr>`;
                s.cols.forEach(() => { inner += `<td><p></p></td>`; });
                inner += `</tr>`;
            }
            inner += `</tbody></table>`;
            html += sectionHTML('response', s.label, true, null, inner);
        });
        return html;
    }

    /**
     * Conceptual Notes — Poetry.
     * Per-poem structure with 10 analysis categories per poem.
     * The actual poems are injected by the AI chat based on the anthology.
     */
    function getConceptualNotesPoetryTemplate() {
        const categories = [
            { label: 'Understanding the Themes', cols: ['Theme', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Speaker', cols: ['Idea', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Form', cols: ['Form', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Language', cols: ['Technique', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Structure', cols: ['Technique', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Historical Context', cols: ['Fact', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Understanding the Message / Moral / Idea', cols: ['Message', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'The Author', cols: ['Fact', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Author\'s Purpose', cols: ['Purpose', 'Quote / Author\'s Purpose / Effects on the Reader'] },
            { label: 'Comparable Poems', cols: ['Poem', 'Comparable Points'] },
        ];
        let html = '';
        html += dividerHTML('Grade 9 Poetry Conceptual Notes');
        // Poem text section (read-only — AI will populate with the current poem)
        html += sectionHTML('question', 'Poem Text', false, null,
            `<p><em>The poem text will appear here. The AI will guide you through each poem in your anthology.</em></p>`);
        html += dividerHTML('Your Analysis');
        // Build analysis tables for current poem
        categories.forEach(cat => {
            const rows = cat.label === 'Comparable Poems' ? 3 : 3;
            let inner = '';
            inner += `<table><thead><tr>`;
            cat.cols.forEach(c => { inner += `<th>${escapeHTML(c)}</th>`; });
            inner += `</tr></thead><tbody>`;
            for (let i = 0; i < rows; i++) {
                inner += `<tr>`;
                cat.cols.forEach(() => { inner += `<td><p></p></td>`; });
                inner += `</tr>`;
            }
            inner += `</tbody></table>`;
            html += sectionHTML('response', cat.label, true, null, inner);
        });
        return html;
    }

    /**
     * Outline Table — v7.14.43: Two-column structured outline for Phase 2 redraft planning.
     * Left column = read-only criterion (AO-tagged), right column = editable student response.
     * Board-aware: criteria adapt to the board's AO structure and mark allocations.
     * @param {object} topicData — topic question data (optional, for question text)
     * @returns {string} TipTap-compatible HTML
     */
    // v7.14.44: Standalone outline table template — uses shared outlineTableHTML helper
    function getOutlineTableTemplate(topicData) {
        let html = '';
        const questionText = topicData?.question || topicData?.part_a_question || '';
        html += dividerHTML('Essay Outline');
        html += sectionHTML('question', 'Question', false, null,
            questionText ? `<p>${escapeHTML(questionText)}</p>` : `<p><em>The essay question will appear here.</em></p>`);
        // Reuse buildOutlineSection for full structure
        const marks = parseInt(topicData?.marks) || 34;
        const aos = topicData?.aos || 'AO1,AO2,AO3';
        html += buildOutlineSection(aos, null, marks);
        return html;
    }

    // Expose exercise templates on WML namespace (v7.13.17)
    WML.getOutlineTableTemplate = getOutlineTableTemplate;
    WML.getExamQuestionTemplate = getExamQuestionTemplate;
    WML.getEssayPlanTemplate = getEssayPlanTemplate;
    WML.getModelAnswerTemplate = getModelAnswerTemplate;
    WML.getQuoteAnalysisTemplate = getQuoteAnalysisTemplate;
    WML.getMemoryPracticeTemplate = getMemoryPracticeTemplate;
    WML.getConceptualNotesLiteratureTemplate = getConceptualNotesLiteratureTemplate;
    WML.getConceptualNotesPoetryTemplate = getConceptualNotesPoetryTemplate;

    /**
     * Exam Prep document templates (v7.13.74)
     * Ready for canvas migration — switch environment: 'chat' → 'canvas' in EXERCISE_MANIFEST.
     * Each template creates a structured document for the exam prep exercise type.
     * @param {string} exerciseType — manifest key (exam_question, essay_plan, model_answer, etc.)
     * @returns {string} TipTap-compatible HTML
     */
    function getExamPrepDocTemplate(exerciseType) {
        let html = '';
        const board = (WML.state.board || '').toUpperCase();
        const subject = WML.state.subject || '';
        const text = WML.state.text ? ucfirst(WML.state.text.replace(/_/g, ' ')) : '';
        const headerInfo = [board, text].filter(Boolean).join(' \u2014 ');
        // v7.14.13: Board-aware marks for exam prep documents
        const boardDefaults = BOARD_FORMAT_DEFAULTS[WML.state.board]?.[subject] || {};
        const marks = parseInt(boardDefaults.marks) || getDefaultMarks(WML.state.board, subject);

        if (exerciseType === 'exam_question') {
            // ── EXAM QUESTION CREATOR ──
            // 10 question slots, each with space for the question + student notes
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Exam Question Creator</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Your AI tutor will generate exam-style questions tailored to your text and exam board. Work through them to build familiarity with exam question patterns.</p>'
            );
            for (let i = 1; i <= 10; i++) {
                html += dividerHTML('QUESTION ' + i);
                html += sectionHTML('plan', 'Question ' + i, true, null,
                    '<h3>Question ' + i + '</h3>' +
                    '<p><strong>Question:</strong></p><p></p>' +
                    '<p><strong>Theme / Character:</strong></p><p></p>' +
                    '<p><strong>Key quotes to consider:</strong></p><p></p>' +
                    '<p><strong>Your notes:</strong></p><p></p>');
            }
        } else if (exerciseType === 'essay_plan') {
            // ── ESSAY PLAN ──
            // v7.14.13: Diagnostic-style document — question + plan + response + feedback + scores.
            // Question populated via overlay selection (mastery topics / saved / AI-generated / custom).
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Essay Plan</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Build a structured essay plan with your AI tutor. Choose a question, then plan each paragraph with quotes and analysis.</p>'
            );
            html += dividerHTML('ESSAY QUESTION');
            html += sectionHTML('question', 'Essay Question', false, null,
                '<p><em>Your question will appear here once selected.</em></p>');
            html += dividerHTML('ESSAY PLAN');
            html += buildPlanSection(null, marks);
            html += dividerHTML('RESPONSE');
            html += buildResponseSection(null);
            html += dividerHTML('FEEDBACK');
            html += buildFeedbackSection(getMarkSplit(marks));
            html += dividerHTML('RESULTS');
            html += buildScoresSection(marks);
            html += buildSelfAssessmentSection(false);
            html += buildAnalyticsSection();
            html += buildActionPlanSection('diagnostic');
            html += buildSignoffSection();
        } else if (exerciseType === 'model_answer') {
            // ── MODEL ANSWER ──
            // v7.14.13: Diagnostic-style — student selects an essay plan first, then writes
            // a model answer section by section. AI provides Grade 9 model for comparison.
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Model Answer</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Write a model answer from one of your essay plans. Your AI tutor will guide you through each section and provide a Grade 9 comparison.</p>'
            );
            html += dividerHTML('ESSAY QUESTION');
            html += sectionHTML('question', 'Essay Question', false, null,
                '<p><em>The question from your selected essay plan will appear here.</em></p>');
            html += dividerHTML('YOUR ESSAY PLAN');
            html += sectionHTML('plan', 'Essay Plan Reference', false, null,
                '<p><em>Your selected essay plan will appear here as a reference.</em></p>');
            html += dividerHTML('YOUR RESPONSE');
            html += buildResponseSection(null);
            html += dividerHTML('GRADE 9 MODEL');
            html += sectionHTML('feedback', 'Model: Introduction', false, null,
                '<p><em>The Grade 9 model introduction will appear here after your attempt.</em></p>');
            for (let i = 1; i <= (marks >= 40 ? 4 : 3); i++) {
                html += sectionHTML('feedback', 'Model: Body Paragraph ' + i, false, null,
                    '<p><em>The Grade 9 body paragraph ' + i + ' will appear here.</em></p>');
            }
            html += sectionHTML('feedback', 'Model: Conclusion', false, null,
                '<p><em>The Grade 9 model conclusion will appear here.</em></p>');
            html += dividerHTML('FEEDBACK');
            html += buildFeedbackSection(getMarkSplit(marks));
            html += dividerHTML('RESULTS');
            html += buildScoresSection(marks);
            html += buildSelfAssessmentSection(false);
            html += buildActionPlanSection('diagnostic');
            html += buildSignoffSection();
        } else if (exerciseType === 'verbal_rehearsal' || exerciseType === 'quote_analysis') {
            // ── RANDOM QUOTE ANALYSIS ──
            // v7.14.13: 10 quote analysis slots with structured TTECEA response spaces.
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Random Quote Analysis</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Practise analysing quotes from your text. Each quote is presented randomly \u2014 build your speed and depth of analysis using the TTECEA+C structure.</p>'
            );
            for (let i = 1; i <= 10; i++) {
                html += dividerHTML('QUOTE ' + i);
                html += sectionHTML('question', 'Quote ' + i, false, null,
                    '<p><em>Quote ' + i + ' will appear here.</em></p>');
                html += sectionHTML('plan', 'Plan: Quote ' + i, true, null,
                    '<p><strong>T</strong> \u2014 <em>Topic sentence (key idea):</em></p><p></p>' +
                    '<p><strong>T</strong> \u2014 <em>Technical term (literary device):</em></p><p></p>' +
                    '<p><strong>E</strong> \u2014 <em>Evidence (the quote itself):</em></p><p></p>' +
                    '<p><strong>C</strong> \u2014 <em>Close analysis (word-level):</em></p><p></p>' +
                    '<p><strong>E</strong> \u2014 <em>Effects on reader:</em></p><p></p>' +
                    '<p><strong>A</strong> \u2014 <em>Author\u2019s purpose + context:</em></p><p></p>');
                html += sectionHTML('response', 'Response: Quote ' + i, true, null,
                    '<p><em>Write your full paragraph here.</em></p><p></p>');
                html += sectionHTML('feedback', 'Feedback: Quote ' + i, false, null,
                    '<p><em>AI feedback and Grade 9 model will appear here.</em></p>');
            }
        } else if (exerciseType === 'conceptual_notes') {
            // ── CONCEPTUAL NOTES ──
            // v7.14.13: 8 concept areas with structured editable spaces.
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Grade 9 Conceptual Notes</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Build deep conceptual understanding of your text. These notes go beyond surface-level plot to explore themes, context, and authorial intent.</p>'
            );
            var concepts = [
                { label: 'Characters', prompt: 'Key characters, their roles, relationships, and development. What does each character represent?' },
                { label: 'Themes', prompt: 'Major themes explored in the text. How are they developed? What is the author saying about each?' },
                { label: 'Context', prompt: 'Historical, social, cultural, and biographical context. How does context shape the text\u2019s meaning?' },
                { label: 'Structure', prompt: 'Narrative structure, chronology, turning points. How does the author organise the text for effect?' },
                { label: 'Language', prompt: 'Key techniques, imagery, motifs, symbolism. How does the author use language to create meaning?' },
                { label: 'Writer\u2019s Intent', prompt: 'What is the author trying to achieve? What message are they communicating to the reader?' },
                { label: 'Critical Perspectives', prompt: 'Alternative readings: feminist, Marxist, postcolonial, psychoanalytic. How might different readers interpret the text?' },
                { label: 'Exam Technique', prompt: 'Key quotes to memorise, argument structures, common exam angles for this text.' },
            ];
            concepts.forEach(function(c) {
                html += dividerHTML(c.label.toUpperCase());
                html += sectionHTML('plan', c.label, true, null,
                    '<h3>' + c.label + '</h3>' +
                    '<p><em>' + c.prompt + '</em></p><p></p><p></p><p></p>');
            });
        } else if (exerciseType === 'memory_practice') {
            // ── MEMORY PRACTICE ──
            // v7.14.13: Full retrieval practice document with quality gate, multiple rounds,
            // and a results summary. Student submits existing writing, AI tests recall.
            html += sectionHTML('question', 'About This Exercise', false, null,
                '<h2>Memory Practice</h2>' +
                (headerInfo ? '<p><em>' + headerInfo + '</em></p>' : '') +
                '<p>Test your recall of key quotes, analysis, and essay plans. Submit a piece of your work, then try to recreate it from memory under timed conditions.</p>'
            );
            html += dividerHTML('YOUR ORIGINAL WRITING');
            html += sectionHTML('question', 'Submitted Writing', false, null,
                '<p><em>The writing you submit for testing will appear here.</em></p>');
            html += sectionHTML('feedback', 'Quality Gate', false, null,
                '<p><em>The AI will assess whether your writing meets the standard for memory practice. If not, it will suggest improvements first.</em></p>');
            html += dividerHTML('RETRIEVAL EXERCISES');
            for (let i = 1; i <= 5; i++) {
                html += sectionHTML('response', 'Retrieval Round ' + i, true, null,
                    '<p><em>Round ' + i + ': Recreate as much as you can from memory.</em></p><p></p>');
                html += sectionHTML('feedback', 'Round ' + i + ' Results', false, null,
                    '<p><em>Accuracy score and missed elements will appear here.</em></p>');
            }
            html += dividerHTML('OVERALL RESULTS');
            html += sectionHTML('scores', 'Summary', false, null,
                '<p><em>Your overall retrieval accuracy, areas of strength, and revision targets will appear here.</em></p>');
            html += sectionHTML('action', 'Next Steps', false, null,
                '<p><em>Personalised recommendations for what to revise next.</em></p>');
        }
        return html || '<p></p>';
    }

    /**
     * Main template factory.
     * @param {string} mode  — 'diagnostic' | 'redraft' | 'exam_practice'
     * @param {object|null} topicData — topic question data from REST
     * @returns {string} TipTap-compatible HTML
     */
    function getDocumentTemplate(mode, topicData) {
        if (!topicData) return getDefaultEssayTemplate();

        const format = topicData.question_format || 'single';
        const isDual = format === 'dual' || format === 'dual_extract';
        // Word targets are set by setWordTargetsFromTopic() before this function is called

        let html = '';

        // ── COVER IMAGE — handled by tryInjectCover() as DOM element outside TipTap ──

        // ── DUAL-PART (EDUQAS Shakespeare, Edexcel, OCR Either/Or) ──
        if (isDual) {
            const marksA = parseInt(topicData.part_a_marks) || 15;
            const marksB = parseInt(topicData.part_b_marks) || 25;
            // Part A question
            html += buildQuestionSection(
                topicData.part_a_question, topicData.part_a_extract,
                topicData.part_a_extract_location, topicData.part_a_marks,
                topicData.part_a_aos, 'Part A'
            );
            // Part B question
            html += buildQuestionSection(
                topicData.part_b_question, topicData.part_b_extract,
                null, topicData.part_b_marks,
                topicData.part_b_aos, 'Part B'
            );

            if (mode === 'diagnostic') {
                html += dividerHTML('ESSAY PLAN');
                html += buildPlanSection('Part A', marksA);
                html += dividerHTML('RESPONSE');
                html += buildResponseSection('Part A');
                html += dividerHTML('ESSAY PLAN — PART B');
                html += buildPlanSection('Part B', marksB);
                html += dividerHTML('RESPONSE — PART B');
                html += buildResponseSection('Part B');
            } else if (mode === 'redraft') {
                html += dividerHTML('ESSAY PLAN');
                html += buildPlanSection('Part A', marksA);
                html += dividerHTML('OUTLINE');
                html += buildOutlineSection(topicData.part_a_aos, 'Part A', marksA);
                html += dividerHTML('RESPONSE');
                html += buildResponseSection('Part A');
                html += dividerHTML('ESSAY PLAN — PART B');
                html += buildPlanSection('Part B', marksB);
                html += dividerHTML('OUTLINE — PART B');
                html += buildOutlineSection(topicData.part_b_aos, 'Part B', marksB);
                html += dividerHTML('RESPONSE — PART B');
                html += buildResponseSection('Part B');
            } else {
                // exam_practice — minimal: question + response
                html += dividerHTML('RESPONSE');
                html += buildResponseSection('Part A');
                html += dividerHTML('RESPONSE — PART B');
                html += buildResponseSection('Part B');
            }
        }
        // ── MULTI-QUESTION (Language papers: AQA P1/P2, Edexcel P1/P2, etc.) ──
        else if (format === 'multi_question' || format === 'multi_option' || format === 'dual_task') {
            html += buildMultiQuestionTemplate(mode, topicData);
        }
        // ── SINGLE-PART (AQA, most boards) ──
        else {
            const marks = parseInt(topicData.marks) || 30;
            html += buildQuestionSection(
                topicData.question_text, topicData.extract_text,
                topicData.extract_location, topicData.marks,
                topicData.aos, null
            );

            if (mode === 'diagnostic') {
                html += dividerHTML('ESSAY PLAN');
                html += buildPlanSection(null, marks);
                html += dividerHTML('RESPONSE');
                html += buildResponseSection(null);
            } else if (mode === 'redraft') {
                html += dividerHTML('ESSAY PLAN');
                html += buildPlanSection(null, marks);
                html += dividerHTML('OUTLINE');
                html += buildOutlineSection(topicData.aos, null, marks);
                html += dividerHTML('RESPONSE');
                html += buildResponseSection(null);
            } else {
                // exam_practice
                html += dividerHTML('RESPONSE');
                html += buildResponseSection(null);
            }
        }

        // v7.14.11: Diagnostic notice — shown only in diagnostic env, hidden in assessment
        if (mode === 'diagnostic') {
            html += sectionHTML('notice', 'What happens next?', false, null,
                '<p><em>The rest of this document — feedback, scores, and your action plan — will appear when you move on to your <strong>assessment</strong> exercise. For now, focus on writing the best essay you can.</em></p>');
        }

        // Feedback + scores + improvement + sign-off (always appended, populated later by AI)
        // Mark splits from protocol data (MARK_SPLITS lookup) rather than generic scaling
        const isMultiQ = format === 'multi_question' || format === 'multi_option' || format === 'dual_task';
        if (isMultiQ) {
            // Multi-question (Language papers): feedback per question
            const meta = typeof topicData.metadata === 'string' ? JSON.parse(topicData.metadata || '{}') : (topicData.metadata || {});
            const questions = meta.questions || [];
            let totalMarks = 0;
            html += dividerHTML('FEEDBACK');
            questions.forEach(function(q) {
                const qMarks = parseInt(q.marks) || 0;
                totalMarks += qMarks;
                html += sectionHTML('feedback', `Feedback: ${q.id || q.label} (— / ${qMarks})`, false, null,
                    `<p><em>Feedback and revised answer will appear after assessment.</em></p>`);
            });
            html += dividerHTML('RESULTS');
            html += buildScoresSection(totalMarks || parseInt(topicData.marks) || 80);
        } else if (isDual) {
            // Dual format: separate feedback for Part A and Part B
            const marksA = parseInt(topicData.part_a_marks) || 15;
            const marksB = parseInt(topicData.part_b_marks) || 25;
            html += dividerHTML('FEEDBACK — PART A');
            html += buildFeedbackSection(getMarkSplit(marksA), 'Part A');
            html += dividerHTML('FEEDBACK — PART B');
            html += buildFeedbackSection(getMarkSplit(marksB), 'Part B');
            html += dividerHTML('RESULTS');
            html += buildScoresSection(marksA + marksB);
        } else {
            // Single format
            const feedbackMarks = parseInt(topicData.marks) || getDefaultMarks(state.board, state.subject);
            html += dividerHTML('FEEDBACK');
            html += buildFeedbackSection(getMarkSplit(feedbackMarks));
            html += dividerHTML('RESULTS');
            html += buildScoresSection(feedbackMarks);
        }
        html += buildSelfAssessmentSection(isDual);
        html += buildAnalyticsSection();
        html += buildActionPlanSection(mode);
        html += buildSignoffSection();

        return html;
    }

    /**
     * Mark Scheme Assessment TipTap document template (v7.12.93).
     * Rebuilt from Sureforms JSON — matches the actual assessment form exactly.
     * Sections: How You're Going → Trends → Metacognition → Introduction (rubric) →
     *   TTECEA Body Paragraphs (rubric) → Conclusion (rubric) → Academic Writing (rubric) →
     *   Where You're Going.
     * Each rubric item shows 1-5 descriptors as read-only reference + editable response.
     */
    function getMarkSchemeTemplate(topicData) {
        // v7.13.1: Rebuilt from correct Sureforms form (ID 54228) — Modern Drama/Text Unit 4 Mark Scheme Assessment
        let html = '';

        // ── Helper: TTECEA rubric item (read-only descriptors + editable self-rating) ──
        function rubricHTML(label, helpText, descriptors) {
            let inner = `<h3>${escapeHTML(label)}</h3>`;
            if (helpText) inner += `<p><em>${escapeHTML(helpText)}</em></p>`;
            inner += '<p></p>';
            descriptors.forEach(d => { inner += `<p>${escapeHTML(d)}</p>`; });
            html += sectionHTML('mark_scheme_ao', label, false, null, inner);
            html += sectionHTML('mark_scheme_response', `My rating: ${label}`, true, null,
                inputHTML('My rating (1\u20135)', `ms-rating-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
            );
        }

        // v7.14.50: Instruction banner — directs students to the chat panel first
        html += sectionHTML('notice', 'How to Use This Document', false, null,
            `<p><strong>Complete the Mark Scheme quiz using the chat panel on the right.</strong></p>`
            + `<p>The AI will test your understanding of the assessment criteria through 10 questions. `
            + `Once you\u2019ve finished the quiz, use your results and the AI\u2019s feedback to fill in this document \u2014 `
            + `it\u2019s your personal record of where you are and what to focus on next.</p>`
        );

        // ══════════════════════════════════════════════════════════
        // 1. HOW YOU'RE GOING
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('HOW YOU\'RE GOING');

        html += sectionHTML('mark_scheme_response', 'Questions Answered Correctly', true, null,
            `<p><strong>Questions Answered Correctly (out of 10):</strong></p>`
            + inputHTML('How many questions did you answer correctly out of 10?', 'ms-questions-correct')
        );
        html += sectionHTML('mark_scheme_response', 'Weighted Score', true, null,
            `<p><strong>Weighted Score (out of 20):</strong></p>`
            + inputHTML('What are your total marks out of 20?', 'ms-weighted-score')
        );
        html += sectionHTML('mark_scheme_response', 'Percentage', true, null,
            `<p><strong>Percentage:</strong></p>`
            + inputHTML('What total percentage did you score?', 'ms-percentage')
        );
        html += sectionHTML('mark_scheme_response', 'Predicted Grade', true, null,
            `<p><strong>Predicted Grade (0\u20139):</strong></p>`
            + inputHTML('What grade did you score?', 'ms-predicted-grade')
        );
        html += sectionHTML('mark_scheme_response', 'Top Missed Areas', true, null,
            `<p><strong>Top Missed Areas:</strong></p>`
            + inputHTML('Which areas cost you the most marks? Specify AOs, e.g. AO1, AO2, AO3', 'ms-top-missed')
        );
        html += sectionHTML('mark_scheme_response', 'Opt-outs Count', true, null,
            `<p><strong>Opt-outs This Attempt (0\u201310):</strong></p>`
            + inputHTML('How many questions did you opt out of?', 'ms-optouts-count')
        );
        html += sectionHTML('mark_scheme_response', 'Opt-out Items', true, null,
            `<p><strong>Opt-out Items:</strong></p>`
            + inputHTML('Which types of questions did you opt out of?', 'ms-optout-items')
        );

        // ══════════════════════════════════════════════════════════
        // 2. TRENDS
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('TRENDS');

        html += sectionHTML('mark_scheme_response', 'Repeated Errors', true, null,
            `<p><strong>Trend: Repeated Errors</strong></p>`
            + inputHTML('What errors have you seen repeated across units? Specify AOs. Put "N/A" if first attempt.', 'ms-repeated-errors')
        );
        html += sectionHTML('mark_scheme_response', 'Improvements', true, null,
            `<p><strong>Trend: Improvements</strong></p>`
            + inputHTML('Which areas have you improved across units? Specify AOs. Put "N/A" if first attempt.', 'ms-improvements')
        );

        // ══════════════════════════════════════════════════════════
        // 3. WHAT TO FIX FIRST
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('WHAT TO FIX FIRST');

        html += sectionHTML('mark_scheme_response', 'Personalised Summary', true, null,
            `<p><strong>Personalised Summary</strong></p>`
            + inputHTML('Paste your personalised feedback below. Specify AOs.', 'ms-personalised-summary')
        );

        // ══════════════════════════════════════════════════════════
        // 4. METACOGNITION
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('METACOGNITION');

        html += sectionHTML('mark_scheme_response', 'Biggest Challenges', true, null,
            `<p><strong>Biggest Challenges</strong></p>`
            + inputHTML('What felt hardest and why? Specify AOs.', 'ms-biggest-challenges')
        );
        html += sectionHTML('mark_scheme_response', 'Short-term Aims', true, null,
            `<p><strong>Short-term Aims</strong></p>`
            + inputHTML('What will you do differently next time? Specify AOs.', 'ms-short-term-aims')
        );

        // ══════════════════════════════════════════════════════════
        // 5. TTECEA ANALYSIS
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('TTECEA ANALYSIS');

        html += sectionHTML('mark_scheme_ao', 'TTECEA Introduction', false, null,
            `<h3>TTECEA Analytical Paragraphs</h3>`
            + `<p><em>The TTECEA paragraph structure helps you score against the top-level criteria in multiple assessment objectives (AOs), e.g. AO2, AO3, AO4, which focus on analysis.</em></p>`
            + `<p><em>Rating scale (1\u20135): 1 = just starting \u2022 2 = improving \u2022 3 = secure \u2022 4 = strong \u2022 5 = excellent</em></p>`
        );

        rubricHTML('TOPIC SENTENCE strength',
            'Rate how well you addressed questions about the TOPIC SENTENCE part of the TTECEA structure.',
            [
                '1: I described surface details only.',
                '2: I hinted at an idea but mostly described.',
                '3: I stated a clear idea and started analysing.',
                '4: I clearly linked my idea to the text\u2019s big message.',
                '5: I framed a perceptive insightful concept that guided my analysis.',
            ]
        );

        rubricHTML('TECHNICAL TERMS strength',
            'Rate how well you addressed questions about the TECHNICAL TERMS part of the TTECEA structure.',
            [
                '1: I misused or skipped methods.',
                '2: I used some correct terms loosely.',
                '3: I used the right terms accurately.',
                '4: I used precise terms for language and structure.',
                '5: I used varied, exact terms to show how methods combine.',
            ]
        );

        rubricHTML('EVIDENCE choice',
            'Rate how well you addressed questions about the EVIDENCE part of the TTECEA structure.',
            [
                '1: I chose unhelpful or no evidence.',
                '2: I quoted something loosely linked.',
                '3: I chose an apt quote to support my point.',
                '4: I picked a very apt, concise quote that set up analysis.',
                '5: I chose a pinpoint quote that allowed rich analysis.',
            ]
        );

        rubricHTML('CLOSE ANALYSIS',
            'Rate how well you addressed questions about the CLOSE ANALYSIS part of the TTECEA structure.',
            [
                '1: I paraphrased instead of analysing.',
                '2: I named words/devices with little meaning.',
                '3: I explained key words and their connotations.',
                '4: I analysed details with layered reasons.',
                '5: I zoomed in at sound/word/structure to explore meaning.',
            ]
        );

        rubricHTML('EFFECTS on the reader',
            'Rate how well you addressed questions about the EFFECTS on the reader part of the TTECEA structure.',
            [
                '1: I gave a vague effect (\u201cmakes you read on\u201d).',
                '2: I named an effect but barely explained why.',
                '3: I explained a clear effect with a basic reason.',
                '4: I weighed specific effects with alternatives.',
                '5: I linked detailed & nuanced effects to audience and purpose.',
            ]
        );

        rubricHTML('AUTHOR\'S PURPOSE',
            'Rate how well you addressed questions about the AUTHOR\'S PURPOSE part of the TTECEA structure.',
            [
                '1: I gave a generic purpose with no evidence link.',
                '2: I touched on purpose briefly.',
                '3: I linked a clear purpose to my analysis.',
                '4: I explored why the purpose matters.',
                '5: I evaluated author\'s purpose & implications perceptively.',
            ]
        );

        // ══════════════════════════════════════════════════════════
        // 6. WHERE YOU'RE GOING
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('WHERE YOU\'RE GOING');

        html += sectionHTML('mark_scheme_response', 'Next Focus', true, null,
            `<p><strong>Next Focus:</strong></p>`
            + inputHTML('Name one precise area you want to focus on to make the most gains.', 'ms-next-focus')
        );
        html += sectionHTML('mark_scheme_response', 'Grade Goal Reminder', true, null,
            `<p><strong>Grade Goal Reminder (1\u20139):</strong></p>`
            + inputHTML('What grade are you aiming for?', 'ms-grade-goal')
        );

        // ══════════════════════════════════════════════════════════
        // 7. WHERE TO NEXT
        // ══════════════════════════════════════════════════════════
        html += dividerHTML('WHERE TO NEXT');

        html += sectionHTML('mark_scheme_response', 'Action 1: Course & Resources', true, null,
            `<p><strong>Action 1 (Course &amp; Resources):</strong></p>`
            + inputHTML('What\u2019s the next step you will take in your course towards your goals?', 'ms-action-1')
        );
        html += sectionHTML('mark_scheme_response', 'Action 2: Lessons', true, null,
            `<p><strong>Action 2 (Lessons):</strong></p>`
            + inputHTML('How will you use the lessons to help you reach your goals?', 'ms-action-2')
        );
        html += sectionHTML('mark_scheme_response', 'Action 3: Support', true, null,
            `<p><strong>Action 3 (Support):</strong></p>`
            + inputHTML('How will you use available support to help you reach your goals?', 'ms-action-3')
        );

        return html;
    }

    /**
     * Fetch topic data from REST endpoint.
     * Returns the raw topic object, or null on failure.
     */
    async function fetchTopicData() {
        try {
            const url = `${API.topicQuestion}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${state.topicNumber}`;
            const res = await fetch(url, { headers }).then(r => r.json());
            if (res && (res.question_text || res.part_a_question)) return res;
            console.warn('WML: Topic data empty');
            return null;
        } catch (e) {
            console.warn('WML: Topic fetch failed', e.message);
            return null;
        }
    }

    /**
     * Set word targets from topic data (marks field).
     */
    function setWordTargetsFromTopic(topicData) {
        if (!topicData) return;
        const format = topicData.question_format || 'single';
        const isDual = format === 'dual' || format === 'dual_extract';
        const boardDefault = getDefaultMarks(state.board, state.subject);
        const totalMarks = isDual
            ? (parseInt(topicData.part_a_marks) || 0) + (parseInt(topicData.part_b_marks) || 0)
            : parseInt(topicData.marks) || boardDefault;
        // Language subjects use lower word count aims than literature
        const isLanguage = /^language|^lang_/i.test(state.subject || '') || /^(cw_|nonfiction)/i.test(state.task || '');
        const targets = getWordTargets(totalMarks, isLanguage);
        canvasWordTarget = targets.target || 650;
        canvasWordMinimum = targets.minimum || 450;
        canvasWordIdeal = targets.ideal || 800;
        canvasUsesWordCount = targets.usesWordCount;

        // Dual questions: compute per-part targets for guidance display
        if (isDual) {
            const marksA = parseInt(topicData.part_a_marks) || 15;
            const marksB = parseInt(topicData.part_b_marks) || 25;
            const tA = getWordTargets(marksA, isLanguage);
            const tB = getWordTargets(marksB, isLanguage);
            canvasDualTargets = {
                partA: { marks: marksA, target: tA.target, minimum: tA.minimum, ideal: tA.ideal },
                partB: { marks: marksB, target: tB.target, minimum: tB.minimum, ideal: tB.ideal },
            };
            console.log(`WML: Dual word targets — Part A: ${marksA}m → ${tA.target}w, Part B: ${marksB}m → ${tB.target}w`);
        } else {
            canvasDualTargets = null;
        }
        console.log(`WML: Word targets — ${totalMarks} marks, ${isLanguage ? 'language' : 'literature'} → min: ${canvasWordMinimum}, target: ${canvasWordTarget}, ideal: ${canvasWordIdeal}`);
    }

    let canvasSaveToServerTimer = null;
    let _extractDocumentData = null; // Assigned inside canvas builder, used by saveCanvasContent
    function saveCanvasContent() {
        if (!canvasEditor) return;
        const html = canvasEditor.getHTML();
        const wc = getResponseWordCount(canvasEditor);
        // 1. Immediate localStorage write (instant, no latency)
        try { localStorage.setItem(CANVAS_SAVE_KEY(), html); } catch (e) { /* storage full */ }
        // 2. Extract structured section data (v7.11.9)
        const sectionData = typeof _extractDocumentData === 'function' ? _extractDocumentData() : null;
        // 3. Debounced server save (every 5s, not every 2s like localStorage)
        clearTimeout(canvasSaveToServerTimer);
        canvasSaveToServerTimer = setTimeout(() => {
            fetch(API.canvasSave, {
                method: 'POST', headers,
                body: JSON.stringify({
                    board: state.board,
                    text: state.text,
                    html: html,
                    wordCount: wc,
                    topicNumber: state.topicNumber || null,
                    sectionData: sectionData,
                    suffix: WML.getExerciseConfig(state.task).storageSuffix || '',
                })
            }).then(r => r.json()).then(res => {
                if (res.success) console.log('WML: Canvas saved to server', { key: res.key, savedAt: res.savedAt, board: state.board, text: state.text, topic: state.topicNumber, wc: wc });
                else console.warn('WML: Canvas save FAILED', res);
            }).catch(e => console.warn('WML: Server save failed, localStorage retained', e.message));
        }, 5000);
    }

    function loadCanvasContent() {
        // Synchronous: return localStorage for instant editor init
        try { return localStorage.getItem(CANVAS_SAVE_KEY()) || ''; } catch (e) { return ''; }
    }

    /**
     * After editor init, try loading from server — if server has content
     * and localStorage is empty (new device / cleared cache), inject it.
     */
    async function tryServerLoad() {
        // v7.13.36: CW exercises use project artifact storage, not essay canvas storage
        if (state.task && state.task.startsWith('cw_')) {
            console.log('WML: Skipping server load — CW exercise uses project storage');
            return;
        }
        try {
            const suffix = WML.getExerciseConfig(state.task).storageSuffix || '';
            const url = `${API.canvasLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}${state.topicNumber ? '&topicNumber=' + state.topicNumber : ''}&suffix=${encodeURIComponent(suffix)}`;
            const res = await fetch(url, { headers }).then(r => r.json());
            if (res.success && res.doc && res.doc.html) {
                const localContent = loadCanvasContent();
                if (!localContent || localContent.length < 20) {
                    // No meaningful local content — use server version
                    canvasEditor.commands.setContent(res.doc.html, false);
                    console.log('WML: Canvas loaded from server (no local content found)');
                } else {
                    // Both exist — keep local (more recent), but log server availability
                    console.log('WML: Local canvas content exists, server backup available');
                }
            }
        } catch (e) {
            console.log('WML: Server load unavailable, using localStorage');
        }
    }

    /**
     * If in programme mode with a topic number, and the editor has no section blocks
     * (i.e. fresh document, not resumed), fetch the topic and inject the structured template.
     */
    async function tryTopicTemplate() {
        if (!canvasEditor) return;
        if (state.task && state.task.startsWith('cw_')) return; // v7.13.36: CW exercises don't use topic templates
        // v7.13.93: Exam prep tasks use their own templates (via tryExamPrepTemplate), skip topic template
        const EXAM_PREP_TASKS = ['exam_question', 'essay_plan', 'model_answer', 'verbal_rehearsal', 'conceptual_notes', 'memory_practice'];
        if (EXAM_PREP_TASKS.includes(state.task)) return;
        if (!state.topicNumber || state.topicNumber < 1) {
            // v7.14.8: Board-aware fallback for free practice (no topic number)
            if (canvasEditor && canvasEditor.getText().trim().length < 10 && !canvasEditor.getHTML().includes('data-section-type')) {
                const syntheticData = buildSyntheticTopicData(state.board, state.subject);
                if (syntheticData) {
                    setWordTargetsFromTopic(syntheticData);
                    canvasEditor.commands.setContent(getDocumentTemplate('diagnostic', syntheticData), false);
                    snapshotTemplateBaseline(canvasEditor);
                    refreshWordCountUI();
                    console.log(`WML: Free practice — board-aware template (${state.board}/${state.subject})`);
                } else {
                    canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);
                }
            }
            return;
        }

        // Single fetch — used for both word targets and template generation
        const topicData = await fetchTopicData();

        // Always set word targets (even for resumed docs)
        if (topicData) {
            setWordTargetsFromTopic(topicData);
        } else {
            // No topic data — use board default marks as fallback (v7.14.7)
            canvasDualTargets = null; // No topic data = no dual info
            const fallbackMarks = getDefaultMarks(state.board, state.subject);
            if (fallbackMarks > 0) {
                const isLanguage = /^language|^lang_/i.test(state.subject || '');
                const targets = getWordTargets(fallbackMarks, isLanguage);
                canvasWordTarget = targets.target || 650;
                canvasWordMinimum = targets.minimum || 450;
                canvasWordIdeal = targets.ideal || 800;
                canvasUsesWordCount = targets.usesWordCount;
                console.log(`WML: Word targets (board default fallback) — ${fallbackMarks} marks → min: ${canvasWordMinimum}, target: ${canvasWordTarget}, ideal: ${canvasWordIdeal}`);
            }
        }
        refreshWordCountUI();

        // Mark scheme: ALWAYS check first — essay sections may have leaked from localStorage (v7.12.95)
        if (state.task === 'mark_scheme') {
            const currentMS = canvasEditor.getHTML();
            // v7.13.2: Check for NEW template marker (TTECEA ANALYSIS divider). Old templates
            // had mark_scheme_ao/response too, so we can't use those as "already loaded" signals.
            const hasNewTemplate = currentMS.includes('TTECEA ANALYSIS');
            if (hasNewTemplate) {
                console.log('WML: Mark scheme document (v7.13.1+) already loaded, skipping template');
                return;
            }
            // Old template or essay sections present — clear and inject fresh
            if (currentMS.includes('mark_scheme_ao') || currentMS.includes('data-section-type')) {
                console.log('WML: Clearing stale mark scheme document (pre-v7.13.1 template)');
                try { localStorage.removeItem(CANVAS_SAVE_KEY()); } catch(e) {}
            }
            console.log('WML: Generating mark scheme study template');
            const msTemplate = getMarkSchemeTemplate(topicData);
            if (canvasEditor) {
                canvasEditor.commands.setContent(msTemplate, false);
                snapshotTemplateBaseline(canvasEditor); // v7.14.46: fix word count showing template text
                refreshWordCountUI();
                console.log('WML: Mark scheme template injected');
            }
            return;
        }



        // Already has section blocks? Don't overwrite (user resumed a saved document)
        const currentHTML = canvasEditor.getHTML();
        if (currentHTML.includes('data-section-type')) {
            console.log('WML: Document already has sections, skipping topic template');
            return;
        }

        // Determine mode from state (must be before fallback paths that reference it)
        let mode = 'diagnostic';
        if (state.phase === 'redraft' || state.draftType?.includes('redraft')) {
            mode = 'redraft';
        } else if (state.mode === 'exam_prep') {
            mode = 'exam_practice';
        }

        if (!topicData) {
            // v7.14.8: Board-aware fallback — generate correct document from board defaults
            const syntheticData = buildSyntheticTopicData(state.board, state.subject);
            if (syntheticData) {
                setWordTargetsFromTopic(syntheticData);
                refreshWordCountUI();
                console.log(`WML: No topic data — board-aware fallback (${state.board}/${state.subject}, format: ${syntheticData.question_format})`);
                const template = getDocumentTemplate(mode, syntheticData);
                if (canvasEditor && !canvasEditor.getHTML().includes('data-section-type')) {
                    canvasEditor.commands.setContent(template, false);
                    snapshotTemplateBaseline(canvasEditor);
                    refreshWordCountUI();
                }
            } else {
                console.log('WML: No topic data, no board defaults — generic template');
                if (canvasEditor && !canvasEditor.getHTML().includes('data-section-type')) {
                    canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);
                }
            }
            return;
        }

        console.log(`WML: Generating topic template — topic ${state.topicNumber}, mode: ${mode}`);
        const template = getDocumentTemplate(mode, topicData);

        // Only inject if we still have the default template (guard against race)
        if (canvasEditor && !canvasEditor.getHTML().includes('data-section-type')) {
            canvasEditor.commands.setContent(template, false);
            snapshotTemplateBaseline(canvasEditor);
            refreshWordCountUI();
            console.log('WML: Topic template injected');
        }
    }

    /**
     * Refresh all word-count-dependent UI elements after targets change.
     * Called after topic data sets canvasWordTarget/canvasWordMinimum/canvasWordIdeal.
     */
    function refreshWordCountUI() {
        if (!canvasEditor) return;
        const wc = getResponseWordCount(canvasEditor);
        // Update progress bar
        const fill = document.getElementById('swml-canvas-progress-fill');
        if (fill) {
            const pct = Math.min(100, Math.round((wc / canvasWordTarget) * 100));
            fill.style.width = pct + '%';
            fill.style.background = getWordCountColour(wc);
        }
        // Update label
        const label = document.getElementById('swml-canvas-wc-label');
        if (label) label.textContent = getWordCountLabel(wc);
        // Update floating widget
        const widget = document.getElementById('swml-wc-widget-label');
        if (widget) widget.textContent = `${wc} / ${canvasWordTarget}`;
        // Update mark complete visibility
        const btn = document.getElementById('swml-canvas-complete-btn');
        if (btn) btn.style.display = wc >= canvasWordMinimum ? 'block' : 'none';
        // Update footer word count (same baseline-aware count as sidebar)
        const footerWc = document.getElementById('swml-footer-wc');
        if (footerWc) footerWc.textContent = `${wc} word${wc !== 1 ? 's' : ''}`;
        // Update guidance tip text (fixes timing: guidance renders before async word targets)
        const guideTip = document.getElementById('swml-guide-word-target');
        if (guideTip) {
            const icon = guideTip.querySelector('.swml-guide-icon');
            const iconHTML = icon ? icon.outerHTML : '';
            if (canvasDualTargets) {
                const { partA, partB } = canvasDualTargets;
                guideTip.innerHTML = `${iconHTML} This is a two-part question. Part A: aim for ${partA.target} words (${partA.marks} marks). Part B: aim for ${partB.target} words (${partB.marks} marks). A "Mark Complete" button will appear once you reach the combined minimum.`;
            } else {
                guideTip.innerHTML = `${iconHTML} Aim for ${canvasWordTarget} words. Once you reach ${canvasWordMinimum} words, a "Mark Complete" button will appear — but push for ${canvasWordTarget} if you can.`;
            }
        }
    }

    /**
     * Document Migration System
     * Compares loaded document sections against the current template.
     * Injects missing sections (Analytics, Action Plan, SA, Sign-off, etc.)
     * without touching existing student content.
     */
    function migrateDocument() {
        if (!canvasEditor) return;
        // Mark scheme has its own sections — skip essay migration (v7.12.96)
        if (state.task === 'mark_scheme') { console.log('WML Migration: Skipping — mark scheme document'); return; }
        // v7.13.43: CW exercises have their own section structure — skip assessment migration
        if (state.task && state.task.startsWith('cw_')) { console.log('WML Migration: Skipping — CW exercise document'); return; }
        const currentHTML = canvasEditor.getHTML();
        // Only run on documents that have section blocks (i.e. structured templates)
        if (!currentHTML.includes('data-section-type')) return;

        // Collect existing section labels
        const existingLabels = new Set();
        canvasEditor.state.doc.descendants((node) => {
            if (node.type.name === 'sectionBlock') {
                existingLabels.add(node.attrs.label || '');
            }
        });

        if (existingLabels.size === 0) return;

        // Post-assessment sections that should exist (in order)
        const requiredSections = [
            { label: 'Score Summary', build: () => buildScoresSection(getDefaultMarks(state.board, state.subject)) },
            { label: 'Self-Assessment', build: () => buildSelfAssessmentSection() },
            { label: 'Analytics', build: () => buildAnalyticsSection() },
            { label: 'Action Plan', build: () => buildActionPlanSection(state.draftType?.includes('redraft') ? 'redraft' : 'diagnostic') },
            { label: 'Tutor Sign-off', build: () => buildSignoffSection() },
        ];

        // Find which sections are missing
        const missingSections = [];
        for (const req of requiredSections) {
            if (!existingLabels.has(req.label)) {
                missingSections.push(req);
            }
        }

        if (missingSections.length === 0) {
            console.log('WML Migration: Document up to date, no sections missing');
            return;
        }

        console.log('WML Migration: Injecting', missingSections.length, 'missing sections:', missingSections.map(s => s.label));

        // Build the HTML for missing sections
        let insertHTML = '';
        missingSections.forEach(s => { insertHTML += s.build(); });

        // Insert before Tutor Sign-off if it exists, otherwise append at end
        let html = currentHTML;
        if (existingLabels.has('Tutor Sign-off') && missingSections.every(s => s.label !== 'Tutor Sign-off')) {
            // Find the sign-off section div and insert before it
            const signoffMatch = html.match(/<div[^>]*data-section-label="Tutor Sign-off"[^>]*>/);
            if (signoffMatch) {
                const idx = html.indexOf(signoffMatch[0]);
                html = html.slice(0, idx) + insertHTML + html.slice(idx);
            } else {
                html += insertHTML;
            }
        } else {
            html += insertHTML;
        }

        canvasEditor.commands.setContent(html, false);
        console.log('WML Migration: Document updated with missing sections');
    }

    /**
     * Inject section dividers into documents that don't have them (v7.12.59).
     * Old documents saved before v7.12.59 lack divider sections.
     * Inserts dividers before the first Plan, Response, Feedback, and Scores sections.
     */
    function migrateDividers() {
        if (!canvasEditor) return;
        let html = canvasEditor.getHTML();
        // Already has dividers — skip
        if (html.includes('data-section-type="divider"')) return;
        if (!html.includes('data-section-type')) return;

        let changed = false;
        // Insert ESSAY PLAN divider before first Plan section
        const planMatch = html.match(/<div[^>]*data-section-type="plan"[^>]*>/);
        if (planMatch) {
            const idx = html.indexOf(planMatch[0]);
            html = html.slice(0, idx) + dividerHTML('ESSAY PLAN') + html.slice(idx);
            changed = true;
        }
        // Insert OUTLINE divider before first Outline section (if present)
        const outlineMatch = html.match(/<div[^>]*data-section-type="outline"[^>]*>/);
        if (outlineMatch) {
            const idx = html.indexOf(outlineMatch[0]);
            html = html.slice(0, idx) + dividerHTML('OUTLINE') + html.slice(idx);
            changed = true;
        }
        // Insert RESPONSE divider before first Response section
        const responseMatch = html.match(/<div[^>]*data-section-type="response"[^>]*>/);
        if (responseMatch) {
            const idx = html.indexOf(responseMatch[0]);
            html = html.slice(0, idx) + dividerHTML('RESPONSE') + html.slice(idx);
            changed = true;
        }
        // Insert FEEDBACK divider before first Feedback section
        const feedbackMatch = html.match(/<div[^>]*data-section-type="feedback"[^>]*>/);
        if (feedbackMatch) {
            const idx = html.indexOf(feedbackMatch[0]);
            html = html.slice(0, idx) + dividerHTML('FEEDBACK') + html.slice(idx);
            changed = true;
        }
        // Insert RESULTS divider before Score Summary section
        const scoresMatch = html.match(/<div[^>]*data-section-type="scores"[^>]*>/);
        if (scoresMatch) {
            const idx = html.indexOf(scoresMatch[0]);
            html = html.slice(0, idx) + dividerHTML('RESULTS') + html.slice(idx);
            changed = true;
        }
        if (changed) {
            canvasEditor.commands.setContent(html, false);
            console.log('WML Migration: Dividers injected into legacy document');
        }
    }

    /**
     * Inject cover image as a DOM element above the editor (outside TipTap).
     * Uses docWrap.insertBefore(coverEl, editorEl) so it's visually the first page
     * but TipTap never touches it. Also strips any broken cover sections from saved docs.
     */
    // ── CW Resource Buttons (v7.13.46) ──
    // Injects real clickable buttons into the Resources section block (TipTap strips data-href from content)
    function injectCwResourceButtons(editorEl) {
        if (!editorEl || !(state.task && state.task.startsWith('cw_'))) return;
        const contentWrap = document.querySelector('.swml-canvas-content');
        if (!contentWrap) return;
        // Don't inject twice
        if (contentWrap.querySelector('.swml-cw-resources-panel')) return;

        // Find the Resources section to position relative to
        const sections = editorEl.querySelectorAll('[data-section-label]');
        let resourceSection = null;
        sections.forEach(s => { if (s.getAttribute('data-section-label') === 'Resources') resourceSection = s; });
        if (!resourceSection) return;

        // Resource links per CW step
        const CW_RESOURCES = {
            2: [
                { label: 'Explore More Story Ideas (Sophicly Course)', url: 'https://www.sophicly.com/courses/creative-writing-masterclass/units/3-how-to-come-up-with-compelling-story-ideas/lessons/3-step-2-explore-more-story-ideas/' },
                { label: 'Read: When I Was 9 Years Old', url: 'https://docs.google.com/document/d/16qbgkyyz8pKyPb4udJa5DNlvbDKIalSwu8y5B8qHczU/copy' },
                { label: 'Read: George Pickering', url: 'https://docs.google.com/document/d/101fH2I4oNmZeJSC2TQNZSs7Mme5zveXleqvqTvLhn6Y/copy' },
                { label: 'Read: Juliane Diller \u2014 Miraculous Survival', url: 'https://docs.google.com/document/d/1Lcbpwr_Ce4TH1BKUEexs1kctX3N9fVe3-T_MonAp6Xs/copy' },
                { label: 'Grade 9 Stories Collection', url: 'https://www.sophicly.com/category/grade-9-stories/' },
            ],
        };
        const cwStep = WML.getCwStepDef(state.task);
        const resources = CW_RESOURCES[cwStep?.step] || [];
        if (resources.length === 0) return;

        // v7.13.48: Create panel OUTSIDE TipTap entirely — appended to contentWrap (scroll area), NOT editorEl
        const panel = document.createElement('div');
        panel.className = 'swml-cw-resources-panel';
        panel.style.cssText = 'position: absolute; z-index: 10; padding: 0 24px;';

        resources.forEach(r => {
            const btn = document.createElement('div');
            btn.className = 'swml-cw-resource-btn';
            btn.textContent = r.label;
            if (r.url) {
                btn.style.cursor = 'pointer';
                btn.onclick = function() { window.open(r.url, '_blank', 'noopener'); };
            } else {
                btn.style.opacity = '0.4';
                btn.style.cursor = 'default';
            }
            panel.appendChild(btn);
        });

        // Append to contentWrap (outside TipTap) and position below Resources section
        contentWrap.style.position = 'relative';
        contentWrap.appendChild(panel);

        function positionPanel() {
            if (!resourceSection.isConnected) return;
            const secRect = resourceSection.getBoundingClientRect();
            const wrapRect = contentWrap.getBoundingClientRect();
            panel.style.left = (secRect.left - wrapRect.left) + 'px';
            panel.style.top = (secRect.bottom - wrapRect.top + contentWrap.scrollTop + 4) + 'px';
            panel.style.width = secRect.width + 'px';
        }
        positionPanel();
        // Reposition on scroll
        contentWrap.addEventListener('scroll', () => requestAnimationFrame(positionPanel), { passive: true });
        // Reposition after pagination settles
        setTimeout(positionPanel, 500);
        setTimeout(positionPanel, 1500);
        console.log('WML CW: Injected', resources.length, 'resource buttons (outside TipTap)');
    }

    function tryInjectCover() {
        if (!canvasEditor || !config.covers) return;
        if (state.task === 'mark_scheme') return; // v7.12.98: no cover page for mark scheme
        const docWrap = document.querySelector('.swml-canvas-doc');
        const editorEl = document.getElementById('swml-tiptap-editor');
        if (!docWrap || !editorEl) return;

        // Remove existing DOM cover + gap (prevent duplicates on re-init)
        const existing = docWrap.querySelector('.swml-cover-page');
        if (existing) existing.remove();
        const existingGap = docWrap.querySelector('.swml-cover-gap');
        if (existingGap) existingGap.remove();

        // Strip any broken TipTap cover sections from saved HTML
        const currentHTML = canvasEditor.getHTML();
        if (currentHTML.includes('data-section-type="cover"')) {
            const cleaned = currentHTML.replace(/<div[^>]*data-section-type="cover"[^>]*>[\s\S]*?<\/div>/gi, '');
            canvasEditor.commands.setContent(cleaned, false);
        }

        // Resolve cover URL: topic → task → text fallback
        const t = state.text;
        let coverUrl = null;
        if (state.topicNumber) coverUrl = config.covers[`${t}:topic_${state.topicNumber}`];
        if (!coverUrl && state.task) coverUrl = config.covers[`${t}:${state.task}`];
        if (!coverUrl) coverUrl = config.covers[t];
        if (!coverUrl) return;

        // Create DOM cover element + gap (matching PaginationPlus page breaks)
        // Preload image before injecting DOM — shows instantly if cached (v7.12.43)
        const preloadImg = new Image();
        preloadImg.src = coverUrl;
        const injectCover = () => {
            const coverPage = document.createElement('div');
            coverPage.className = 'swml-cover-page';
            const img = document.createElement('img');
            img.src = coverUrl;
            img.alt = '';
            img.draggable = false;
            coverPage.appendChild(img);
            const coverGap = document.createElement('div');
            coverGap.className = 'swml-cover-gap';
            docWrap.insertBefore(coverGap, editorEl);
            docWrap.insertBefore(coverPage, coverGap);
            docWrap.dataset.coverUrl = coverUrl;
        };
        if (preloadImg.complete) {
            // Already cached — inject immediately, no fade
            injectCover();
        } else {
            // Not cached — inject placeholder, fade in when loaded
            const coverPage = document.createElement('div');
            coverPage.className = 'swml-cover-page swml-cover-loading';
            const coverGap = document.createElement('div');
            coverGap.className = 'swml-cover-gap';
            docWrap.insertBefore(coverGap, editorEl);
            docWrap.insertBefore(coverPage, coverGap);
            docWrap.dataset.coverUrl = coverUrl;
            preloadImg.addEventListener('load', () => {
                const img = document.createElement('img');
                img.src = coverUrl;
                img.alt = '';
                img.draggable = false;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.4s ease';
                coverPage.appendChild(img);
                coverPage.classList.remove('swml-cover-loading');
                requestAnimationFrame(() => { img.style.opacity = '1'; });
            });
        }
    }

    /**
     * Table of Contents — DOM element between cover/gap and editor.
     * Reads section labels from TipTap document model, renders as styled list.
     * Clickable in canvas, static in Word export.
     */
    function buildTableOfContents() {
        if (!canvasEditor) return;
        const docWrap = document.querySelector('.swml-canvas-doc');
        const editorEl = document.getElementById('swml-tiptap-editor');
        if (!docWrap || !editorEl) return;

        // Remove existing TOC + gap
        const existing = docWrap.querySelector('.swml-toc');
        if (existing) existing.remove();
        const existingTocGap = docWrap.querySelector('.swml-toc-gap');
        if (existingTocGap) existingTocGap.remove();

        // v7.14.30: Collect sections INCLUDING dividers (used as group boundaries)
        const sections = [];
        canvasEditor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'sectionBlock') {
                const type = node.attrs.sectionType || 'response';
                const label = node.attrs.label || '';
                if (type !== 'cover') sections.push({ type, label, pos });
            }
        });

        if (sections.length < 3) return; // Not enough sections for a TOC

        // v7.14.30: Group using dividers as boundaries first, then prefix fallback.
        // Dividers create accordion groups — all sections after a divider become its children.
        const tocEntries = [];
        let currentDivGroup = null;
        const groupPrefixes = ['Feedback', 'Plan', 'Outline'];
        const groupMap = {};

        sections.forEach(s => {
            // Dividers start new groups
            if (s.type === 'divider') {
                currentDivGroup = { type: null, label: s.label, displayLabel: s.label, children: [], isGroup: true, isDivider: true };
                tocEntries.push(currentDivGroup);
                return;
            }
            // If inside a divider group, add as child
            if (currentDivGroup) {
                if (!currentDivGroup.type) currentDivGroup.type = s.type;
                currentDivGroup.children.push({ type: s.type, label: s.label, displayLabel: s.label });
                return;
            }
            // Fallback: prefix-based grouping for sections before any divider
            const dualMatch = s.label.match(/^(Part [AB] Feedback):\s*/);
            const matchedPrefix = !dualMatch ? groupPrefixes.find(p => s.label.startsWith(p + ':')) : null;
            const groupKey = dualMatch ? dualMatch[1] : matchedPrefix;

            if (groupKey) {
                if (!groupMap[groupKey]) {
                    let displayName = groupKey;
                    if (groupKey === 'Plan') displayName = 'Essay Plan';
                    else if (groupKey === 'Part A Feedback') displayName = 'Feedback \u2014 Part A';
                    else if (groupKey === 'Part B Feedback') displayName = 'Feedback \u2014 Part B';
                    const entry = { type: s.type, label: s.label, displayLabel: displayName, children: [], isGroup: true };
                    groupMap[groupKey] = entry;
                    tocEntries.push(entry);
                }
                const childLabel = s.label.replace(/^[^:]+:\s*/, '');
                groupMap[groupKey].children.push({ type: s.type, label: s.label, displayLabel: childLabel });
            } else {
                tocEntries.push({ type: s.type, label: s.label, displayLabel: s.label, children: [], isGroup: false });
            }
        });

        // Build TOC element — styled as a proper page
        const toc = document.createElement('div');
        toc.className = 'swml-toc';

        const title = document.createElement('h2');
        title.className = 'swml-toc-title';
        title.textContent = 'Table of Contents';
        toc.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'swml-toc-list';

        tocEntries.forEach((entry, idx) => {
            const item = document.createElement('li');
            item.className = 'swml-toc-item';

            const row = document.createElement('div');
            row.className = 'swml-toc-row';

            const dot = document.createElement('span');
            dot.className = 'swml-toc-dot';
            // v7.14.30: Brand colour cycle for divider-based groups
            const BRAND_DOT_COLOURS = ['#51dacf', '#42A1EC', '#4D76FD', '#5333ed', '#7DF9E9', '#1CD991', '#41aaa8'];
            dot.style.background = entry.isDivider
                ? BRAND_DOT_COLOURS[idx % BRAND_DOT_COLOURS.length]
                : (SECTION_COLOURS[entry.type] || '#888');
            row.appendChild(dot);

            const labelSpan = document.createElement('span');
            labelSpan.className = 'swml-toc-label';
            const sectionNum = idx + 1;
            labelSpan.textContent = sectionNum + '. ' + entry.displayLabel;
            row.appendChild(labelSpan);

            // Page number (approximate based on position in document)
            const pageNum = document.createElement('span');
            pageNum.className = 'swml-toc-page';
            pageNum.textContent = sectionNum;
            row.appendChild(pageNum);

            // Click to scroll (on the row) — v7.13.74: manual scrollTo to avoid multi-ancestor scrollIntoView conflicts
            row.addEventListener('click', (e) => {
                if (e.target.closest('.swml-toc-chevron')) return;
                const editor = document.getElementById('swml-tiptap-editor');
                const cw = document.querySelector('.swml-canvas-content');
                if (!editor || !cw) return;
                let target = null;
                editor.querySelectorAll('[data-section-label]').forEach(el => {
                    if (el.getAttribute('data-section-label') === entry.label) target = el;
                });
                if (target) {
                    const cwRect = cw.getBoundingClientRect();
                    const tRect = target.getBoundingClientRect();
                    cw.scrollTo({ top: cw.scrollTop + (tRect.top - cwRect.top) - (cwRect.height / 3), behavior: 'smooth' });
                }
            });

            item.appendChild(row);

            // Accordion for grouped sections
            if (entry.isGroup && entry.children.length > 0) {
                const chevron = document.createElement('button');
                chevron.className = 'swml-toc-chevron';
                chevron.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>';
                chevron.title = 'Expand';
                // Insert chevron before dot
                row.insertBefore(chevron, dot);

                const subList = document.createElement('ul');
                subList.className = 'swml-toc-sublist';

                entry.children.forEach((child, ci) => {
                    const subItem = document.createElement('li');
                    subItem.className = 'swml-toc-subitem';

                    const subDot = document.createElement('span');
                    subDot.className = 'swml-toc-dot';
                    // v7.14.34: Child dots match parent's brand colour
                    subDot.style.background = dot.style.background || SECTION_COLOURS[child.type] || '#888';
                    subItem.appendChild(subDot);

                    const subLabel = document.createElement('span');
                    subLabel.className = 'swml-toc-label';
                    subLabel.textContent = sectionNum + '.' + (ci + 1) + ' ' + child.displayLabel;
                    subItem.appendChild(subLabel);

                    subItem.addEventListener('click', () => {
                        const editor = document.getElementById('swml-tiptap-editor');
                        const cw = document.querySelector('.swml-canvas-content');
                        if (!editor || !cw) return;
                        let target = null;
                        editor.querySelectorAll('[data-section-label]').forEach(el => {
                            if (el.getAttribute('data-section-label') === child.label) target = el;
                        });
                        if (target) {
                            const cwRect = cw.getBoundingClientRect();
                            const tRect = target.getBoundingClientRect();
                            cw.scrollTo({ top: cw.scrollTop + (tRect.top - cwRect.top) - (cwRect.height / 3), behavior: 'smooth' });
                        }
                    });

                    subList.appendChild(subItem);
                });

                item.appendChild(subList);

                // Toggle accordion
                chevron.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const expanded = item.classList.toggle('swml-toc-expanded');
                    chevron.title = expanded ? 'Collapse' : 'Expand';
                });
            }

            list.appendChild(item);
        });

        toc.appendChild(list);

        // Add gap after TOC (matching pagination gaps)
        const tocGap = document.createElement('div');
        tocGap.className = 'swml-toc-gap';

        // Insert after cover gap (or before editor if no cover)
        const coverGap = docWrap.querySelector('.swml-cover-gap');
        if (coverGap) {
            coverGap.after(toc);
            toc.after(tocGap);
        } else {
            docWrap.insertBefore(tocGap, editorEl);
            docWrap.insertBefore(toc, tocGap);
        }
    }

    // v7.14.31: Assign group colours to document sections based on their divider parent.
    // Walks the editor DOM, finds dividers, assigns data-group-color to sibling sections.
    // Colours cycle through brand palette matching the TOC dots.
    const GROUP_COLOURS = ['#51dacf', '#42A1EC', '#4D76FD', '#5333ed', '#7DF9E9', '#1CD991', '#41aaa8'];
    function coloriseSectionGroups() {
        const editorEl = document.getElementById('swml-tiptap-editor');
        if (!editorEl) return;
        const allSections = editorEl.querySelectorAll('[data-section-type]');
        let groupIdx = -1;
        allSections.forEach(section => {
            const type = section.getAttribute('data-section-type');
            if (type === 'divider') {
                groupIdx++;
                return;
            }
            if (groupIdx >= 0) {
                const color = GROUP_COLOURS[groupIdx % GROUP_COLOURS.length];
                const r = parseInt(color.slice(1,3), 16);
                const g = parseInt(color.slice(3,5), 16);
                const b = parseInt(color.slice(5,7), 16);
                // Use setProperty with 'important' to override CSS class specificity
                section.style.setProperty('border-left-color', `rgba(${r},${g},${b},0.5)`, 'important');
                section.style.setProperty('background', `rgba(${r},${g},${b},0.05)`, 'important');
            }
        });
    }

    function exportToDocx() {
        if (!canvasEditor) return;
        let html = canvasEditor.getHTML();
        const textName = (state.text || 'essay').replace(/[^a-zA-Z0-9]/g, '_');
        const boardName = (state.board || 'wml').toUpperCase();
        const fileName = `${boardName}_${textName}_${new Date().toISOString().slice(0,10)}.doc`;

        // Inject sign-off data into the document HTML for export
        if (canvasSignoffData) {
            const d = new Date(canvasSignoffData.timestamp);
            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            html = html.replace(/<em>Status:<\/em>\s*Awaiting sign-off/, '<em>Status:</em> <span style="color:#17b57a;font-weight:bold">✓ Signed off</span>');
            html = html.replace(/<em>Tutor:<\/em>\s*—/, `<em>Tutor:</em> ${canvasSignoffData.display_name}`);
            html = html.replace(/<em>Date:<\/em>\s*—/, `<em>Date:</em> ${dateStr}`);
        }

        // Prepend cover image for export (from DOM data attribute)
        const docWrapEl = document.querySelector('.swml-canvas-doc');
        const exportCoverUrl = docWrapEl?.dataset?.coverUrl;
        if (exportCoverUrl) {
            html = `<div style="text-align:center;margin:0;padding:0;page-break-after:always"><img src="${exportCoverUrl}" style="width:21cm;height:29.7cm;object-fit:cover;display:block;margin:-2.54cm"></div>\n` + html;
        }

        // Generate Table of Contents for export
        if (canvasEditor) {
            const tocSections = [];
            canvasEditor.state.doc.descendants((node) => {
                if (node.type.name === 'sectionBlock') {
                    const type = node.attrs.sectionType || 'response';
                    const label = node.attrs.label || '';
                    if (type !== 'cover' && type !== 'divider') tocSections.push({ type, label });
                }
            });
            if (tocSections.length > 2) {
                const colourMap = { question:'#51dacf', plan:'#5333ed', outline:'#42A1EC', response:'#1CD991', feedback:'#ffb432', scores:'#ff6b6b', action:'#4D76FD', signoff:'#1CD991', improvement:'#7DF9E9' };
                let tocHtml = '<div style="padding:24pt 0;page-break-after:always"><h2 style="font-size:11pt;text-transform:uppercase;letter-spacing:2pt;color:#999;margin-bottom:12pt">Contents</h2>';
                const seen = new Set();
                tocSections.forEach(s => {
                    let display = s.label;
                    if (s.label.startsWith('Feedback:')) { if (seen.has('Feedback')) return; display = 'Feedback'; seen.add('Feedback'); }
                    else if (s.label.startsWith('Plan:')) { if (seen.has('Essay Plan')) return; display = 'Essay Plan'; seen.add('Essay Plan'); }
                    else if (s.label.startsWith('Outline:')) { if (seen.has('Outline')) return; display = 'Outline'; seen.add('Outline'); }
                    const col = colourMap[s.type] || '#999';
                    tocHtml += `<p style="margin:4pt 0;font-size:11pt;color:#333"><span style="display:inline-block;width:8pt;height:8pt;border-radius:50%;background:${col};margin-right:8pt;vertical-align:middle"></span>${display}</p>`;
                });
                tocHtml += '</div>';
                // Insert after cover (if present) or at start
                if (exportCoverUrl) {
                    const coverEnd = html.indexOf('</div>') + 6;
                    html = html.slice(0, coverEnd) + '\n' + tocHtml + html.slice(coverEnd);
                } else {
                    html = tocHtml + html;
                }
            }
        }

        // Inline section styles for Word compatibility (Word ignores <style> blocks)
        const sectionInlineStyles = {
            'swml-section-question': 'border-left:4pt solid #51dacf;background:#f0fffe;',
            'swml-section-plan':     'border-left:4pt solid #5333ed;background:#f5f0ff;',
            'swml-section-outline':  'border-left:4pt solid #42A1EC;background:#f0f6ff;',
            'swml-section-response': 'border-left:4pt solid #1CD991;background:#f0fdf6;',
            'swml-section-feedback': 'border-left:4pt solid #ffb432;background:#fffdf0;',
            'swml-section-scores':   'border-left:4pt solid #ff6b6b;background:#fff5f5;',
            'swml-section-action':   'border-left:4pt solid #4D76FD;background:#f0f4ff;',
            'swml-section-improvement':'border-left:4pt solid #7DF9E9;background:#f0fffe;',
            'swml-section-signoff':  'border-left:4pt solid #1CD991;background:#f0fdf6;',
            'swml-section-divider': 'text-align:center;font-size:8pt;font-weight:bold;letter-spacing:2pt;color:#999;border:none;background:none;border-top:1pt solid #ddd;padding:8pt 0 0;',
        };
        const baseSectionStyle = 'padding:10pt 14pt;margin:12pt 0;border-radius:4pt;page-break-inside:avoid;';
        Object.entries(sectionInlineStyles).forEach(([cls, styles]) => {
            const re = new RegExp(`class="([^"]*${cls}[^"]*)"`, 'g');
            html = html.replace(re, (match, classes) => {
                return `class="${classes}" style="${baseSectionStyle}${styles}"`;
            });
        });

        // Word-compatible HTML envelope with proper namespaces
        const docHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${boardName} — ${textName}</title>
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml>
<![endif]-->
<style>
    @page { size: A4; margin: 2.54cm; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.6; color: #1a1a2e; }
    h1, h2, h3 { color: #2c003e; margin-top: 18pt; margin-bottom: 6pt; }
    h2 { font-size: 16pt; font-weight: bold; border-bottom: 1pt solid #e0e0e0; padding-bottom: 4pt; }
    h3 { font-size: 14pt; font-weight: bold; }
    p { margin: 0 0 8pt 0; }
    blockquote { border-left: 3pt solid #5333ed; padding-left: 12pt; margin-left: 0; color: #444; font-style: italic; }
    hr { border: none; border-top: 1pt solid #ccc; margin: 16pt 0; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }
    s { text-decoration: line-through; }
    mark { background-color: #fef08a; }
    span[data-comment-id] { background-color: #fff3cd; }
    /* Section blocks — coloured left borders */
    .swml-section-block { padding: 10pt 14pt; margin: 12pt 0; border-radius: 4pt; border-left: 4pt solid #ccc; background: #fafafa; page-break-inside: avoid; }
    .swml-section-question { border-left-color: #51dacf; background: #f0fffe; }
    .swml-section-plan { border-left-color: #5333ed; background: #f5f0ff; }
    .swml-section-outline { border-left-color: #42A1EC; background: #f0f6ff; }
    .swml-section-response { border-left-color: #1CD991; background: #f0fdf6; }
    .swml-section-feedback { border-left-color: #ffb432; background: #fffdf0; }
    .swml-section-scores { border-left-color: #ff6b6b; background: #fff5f5; }
    .swml-section-action { border-left-color: #4D76FD; background: #f0f4ff; }
    .swml-section-improvement { border-left-color: #7DF9E9; background: #f0fffe; }
    .swml-section-signoff { border-left-color: #1CD991; background: #f0fdf6; }
</style>
</head>
<body>
${html}
<br><br>
<p style="font-size:9pt;color:#999;">Exported from Sophicly Writing Mastery Lab · ${boardName} · ${new Date().toLocaleDateString('en-GB')}</p>
</body>
</html>`.trim();

        const blob = new Blob([docHtml], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(SVG_SEL_COPY + ' <strong>Exported!</strong> Your essay has been downloaded as a Word document.', 4000, true);
    }

    // ══════════════════════════════════════════
    //  LIGHTWEIGHT VIDEO CANVAS (v7.12.63)
    // ══════════════════════════════════════════
    // Reusable canvas for video-based steps: Discuss Feedback, Mark Scheme Study, Model Answer.
    // No TipTap editor, no AI chat — just a video playlist + guidance panel + completion buttons.
    // Reads state.task to determine which variant to show.

    const LIGHTWEIGHT_CANVAS_CONFIG = {
        feedback_discussion: {
            title: 'Discuss Your Feedback',
            badgeLabel: 'Discuss Feedback',
            guideHeading: 'Discuss Your Feedback',
            tips: [
                { icon: 'SVG_GUIDE_GRAPH', colour: '#5333ed', text: 'Watch the feedback playlist to understand your assessment results and what they mean.' },
                { icon: 'SVG_GUIDE_BRAIN', colour: '#51dacf', text: 'Sit down with your tutor and discuss your strengths and areas for development.' },
                { icon: 'SVG_GUIDE_TARGET', colour: '#4D76FD', text: 'Ask questions about anything you don\'t understand in your feedback.' },
                { icon: 'SVG_GUIDE_ARM', colour: '#1CD991', text: 'Agree with your tutor on what to focus on in your redraft — make a plan together.' },
            ],
            questions: [
                'Where did I gain marks? (Think about which marking criteria you met)',
                'Where did I lose marks? (Think about which marking criteria you missed)',
                'How do I plan to improve? (Be specific about what you\'ll do differently)',
            ],
            completeLabel: 'I\'ve Discussed My Feedback',
            completeConfirm: 'Have you discussed your assessment feedback with your tutor? This step is important for your learning.',
            completeMsg: '✓ Feedback discussed — well done!',
            completeToast: '✓ <strong>Feedback discussion complete!</strong> You can now move on to the next step.',
            skipMsg: '⏭ Skipped — remember to discuss with your tutor!',
            skipToast: '⏭ <strong>Skipped for now.</strong> Remember to discuss your feedback with your tutor.',
            storageKeySuffix: '',
        },
        mark_scheme: {
            title: 'Mark Scheme Study',
            badgeLabel: 'Mark Scheme',
            guideHeading: 'Understand the Mark Scheme',
            tips: [
                { icon: 'SVG_GUIDE_GRAPH', colour: '#5333ed', text: 'Watch the mark scheme videos to understand how your essay is assessed.' },
                { icon: 'SVG_GUIDE_TARGET', colour: '#4D76FD', text: 'Learn what each Assessment Objective (AO) measures and how marks are awarded.' },
                { icon: 'SVG_GUIDE_BRAIN', colour: '#51dacf', text: 'Understand the difference between each grade boundary — what separates a Grade 5 from a Grade 7?' },
                { icon: 'SVG_GUIDE_ARM', colour: '#1CD991', text: 'Take notes on what the examiner is looking for — this will help you plan your redraft.' },
            ],
            questions: [
                'What are the key assessment objectives for this paper?',
                'How many marks is each AO worth?',
                'What does a top-level response look like for AO1?',
                'What separates a Grade 7 from a Grade 9?',
            ],
            completeLabel: 'I\'ve Studied the Mark Scheme',
            completeConfirm: 'Have you watched the videos and understood how the mark scheme works?',
            completeMsg: '✓ Mark scheme study complete!',
            completeToast: '✓ <strong>Mark scheme study complete!</strong> You can now move on to the model answer.',
            skipMsg: '⏭ Skipped — come back to study the mark scheme later.',
            skipToast: '⏭ <strong>Skipped for now.</strong> Understanding the mark scheme will help your redraft.',
            storageKeySuffix: '_mark_scheme',
        },
        model_answer_video: {
            title: 'Watch Model Answer',
            badgeLabel: 'Model Answer',
            guideHeading: 'Study the Model Answer',
            tips: [
                { icon: 'SVG_GUIDE_GRAPH', colour: '#5333ed', text: 'Watch the model answer walkthrough to see what a top-grade response looks like.' },
                { icon: 'SVG_GUIDE_BRAIN', colour: '#51dacf', text: 'Pay attention to how the introduction hooks the reader and presents a clear thesis.' },
                { icon: 'SVG_GUIDE_TARGET', colour: '#4D76FD', text: 'Notice how each body paragraph follows a clear analytical structure.' },
                { icon: 'SVG_GUIDE_ARM', colour: '#1CD991', text: 'Think about how you can apply these techniques to your own redraft.' },
            ],
            questions: [
                'How does the model answer structure its introduction?',
                'What techniques are used in the body paragraphs?',
                'How does the conclusion link back to the thesis?',
                'What can I borrow for my own redraft?',
            ],
            completeLabel: 'I\'ve Studied the Model Answer',
            completeConfirm: 'Have you watched the model answer walkthrough and thought about how to apply it?',
            completeMsg: '✓ Model answer study complete!',
            completeToast: '✓ <strong>Model answer study complete!</strong> You\'re ready to plan your redraft.',
            skipMsg: '⏭ Skipped — come back to study the model answer later.',
            skipToast: '⏭ <strong>Skipped for now.</strong> Studying a model answer will improve your redraft.',
            storageKeySuffix: '_model_answer',
        },
    };

    // Icon lookup for tips (resolved at runtime from WML namespace)
    const GUIDE_ICONS = {
        SVG_GUIDE_GRAPH, SVG_GUIDE_BRAIN, SVG_GUIDE_TARGET, SVG_GUIDE_ARM,
        SVG_GUIDE_LOCK, SVG_GUIDE_STOPWATCH, SVG_GUIDE_WRITING,
    };

    let _feedbackGuard = false;
    function renderFeedbackDiscussionCanvas() {
        if (_feedbackGuard) return;
        _feedbackGuard = true;
        setTimeout(() => { _feedbackGuard = false; }, 500);

        const taskKey = state.task || 'feedback_discussion';
        const cfg = LIGHTWEIGHT_CANVAS_CONFIG[taskKey] || LIGHTWEIGHT_CANVAS_CONFIG.feedback_discussion;

        syncUrl();
        destroyShader();
        const shaderBgEl = document.getElementById('swml-shader-bg');
        if (shaderBgEl) shaderBgEl.style.display = 'none';

        // Remove any existing canvas overlay
        const existing = document.getElementById('swml-canvas-overlay');
        if (existing) existing.remove();

        // ── Overlay + Canvas container ──
        const overlay = el('div', { id: 'swml-canvas-overlay' });
        const canvas = el('div', { className: 'swml-canvas swml-feedback-canvas' });

        // ── Header: badges + theme toggle (no toolbar) ──
        const textLabel = state.textName || state.text || '';
        const boardLabel = (state.board || '').toUpperCase().replace('-', ' ');
        const subjectLabel = (state.subject || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const headerRow = el('div', { className: 'swml-canvas-header swml-feedback-header' });

        const ctxBadges = el('div', { className: 'swml-canvas-ctx' });
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: boardLabel }));
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: subjectLabel }));
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: textLabel }));
        if (state.topicNumber) {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: `Topic ${state.topicNumber}` }));
        }
        const SVG_BADGE_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:3px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-diag', innerHTML: SVG_BADGE_ICON + cfg.badgeLabel }));
        headerRow.appendChild(ctxBadges);

        // Theme toggle (right)
        const headerRight = el('div', { className: 'swml-canvas-header-right' });
        const fbThemeToggle = createThemeToggleBtn('swml-canvas-theme-toggle', () => {
            toggleTheme();
            const t = getTheme();
            canvas.classList.toggle('swml-canvas-light', t === 'light');
            overlay.dataset.swmlTheme = t;
        });
        const initTheme = getTheme();
        if (initTheme === 'light') canvas.classList.add('swml-canvas-light');
        overlay.dataset.swmlTheme = initTheme;
        headerRight.appendChild(fbThemeToggle);
        headerRow.appendChild(headerRight);
        canvas.appendChild(headerRow);

        // ── Main content area: video player + guidance panel ──
        const contentArea = el('div', { className: 'swml-feedback-content' });

        // ── Video Player (centre) — uses wml-video-player.js for drag, PiP, resize ──
        const videoPane = el('div', { className: 'swml-feedback-video-pane' });

        // Placeholder shown while loading / if no videos
        const videoPlaceholder = el('div', { className: 'swml-feedback-video-placeholder' });
        videoPlaceholder.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:48px;opacity:0.2;margin-bottom:16px">▶</div>
                <p style="font-size:14px;opacity:0.5">Loading videos...</p>
            </div>
        `;
        videoPane.appendChild(videoPlaceholder);

        // Fetch videos from admin-managed REST endpoint, then launch floating player
        fetch(`${config.restUrl}resources?task=${encodeURIComponent(taskKey)}&step=0&board=${encodeURIComponent(state.board)}&subject=${encodeURIComponent(state.subject)}`, { headers })
            .then(r => r.json())
            .then(data => {
                const videos = data?.videos || [];
                if (videos.length > 0 && window.wmlVideo) {
                    videoPlaceholder.innerHTML = `
                        <div style="text-align:center;padding:40px 20px;">
                            <p style="font-size:14px;opacity:0.7;margin-bottom:12px">${videos.length} video${videos.length > 1 ? 's' : ''} available</p>
                            <p style="font-size:12px;opacity:0.4">The video player is floating — you can drag it around the screen, resize it, and minimise it.</p>
                        </div>
                    `;
                    // Open the existing draggable player
                    wmlVideo.open(videos, { size: 'medium' });
                } else if (videos.length === 0) {
                    videoPlaceholder.innerHTML = `
                        <div style="text-align:center;padding:40px 20px;">
                            <div style="font-size:48px;opacity:0.15;margin-bottom:16px">▶</div>
                            <p style="font-size:14px;opacity:0.4">No videos assigned yet</p>
                            <p style="font-size:12px;opacity:0.3;margin-top:4px">Your teacher will add feedback videos here. Check back soon!</p>
                        </div>
                    `;
                }
            })
            .catch(e => {
                console.warn('WML: Failed to fetch feedback videos:', e);
                videoPlaceholder.innerHTML = '<div style="text-align:center;padding:40px"><p style="opacity:0.4">Could not load videos</p></div>';
            });

        contentArea.appendChild(videoPane);

        // ── Guidance Panel (right) — driven by config ──
        const guidePanel = el('div', { className: 'swml-canvas-plan swml-feedback-guide' });

        guidePanel.appendChild(el('h3', { textContent: cfg.guideHeading }));

        const guideContent = el('div', { className: 'swml-canvas-guidance' });
        cfg.tips.forEach(t => {
            const iconSvg = GUIDE_ICONS[t.icon] || '';
            const tip = el('div', { className: 'swml-canvas-plan-section' });
            tip.appendChild(el('p', { innerHTML: `<span class="swml-guide-icon" style="color:${t.colour}">${iconSvg}</span> ${t.text}` }));
            guideContent.appendChild(tip);
        });
        guidePanel.appendChild(guideContent);

        // ── Questions (expandable) ──
        if (cfg.questions && cfg.questions.length > 0) {
            const questionsWrap = el('div', { className: 'swml-canvas-plan-section' });
            const questionsHeader = el('h4', {
                style: { cursor: 'pointer', userSelect: 'none' },
                innerHTML: '<span class="swml-guide-icon" style="color:#51dacf">' + SVG_GUIDE_BRAIN + '</span> Key Questions',
            });
            const questionsList = el('div', { className: 'swml-feedback-questions', style: { display: 'none' } });
            cfg.questions.forEach(q => {
                questionsList.appendChild(el('p', { className: 'swml-feedback-question-item', innerHTML: `<em>"${q}"</em>` }));
            });
            questionsHeader.addEventListener('click', () => {
                const isOpen = questionsList.style.display !== 'none';
                questionsList.style.display = isOpen ? 'none' : 'block';
                questionsHeader.querySelector('.swml-guide-icon').style.transform = isOpen ? '' : 'rotate(90deg)';
            });
            questionsWrap.appendChild(questionsHeader);
            questionsWrap.appendChild(questionsList);
            guidePanel.appendChild(questionsWrap);
        }

        // v7.14.45: Completion + navigation buttons suppressed — LearnDash handles lesson completion
        // and exercise sequencing. Will re-enable when LD bridge is built.
        if (false) { // Suppressed
        const completionWrap = el('div', { className: 'swml-feedback-completion', style: { marginTop: 'auto' } });

        const fbCompleteKey = `swml_fb_complete_${state.board}_${state.text}_t${state.topicNumber || 0}${cfg.storageKeySuffix}`;
        const fbStatus = localStorage.getItem(fbCompleteKey);

        if (fbStatus === 'complete' || fbStatus === 'skipped') {
            const statusMsg = el('div', { className: 'swml-feedback-done' });
            statusMsg.innerHTML = fbStatus === 'complete'
                ? `<span style="color:#1CD991">${cfg.completeMsg}</span>`
                : `<span style="color:#F1C40F">${cfg.skipMsg}</span>`;
            completionWrap.appendChild(statusMsg);
        } else {
            const discussBtn = build3DButton(cfg.completeLabel, 'Done!', () => {
                showConfirm(
                    cfg.completeConfirm,
                    () => {
                        try { localStorage.setItem(fbCompleteKey, 'complete'); } catch (e) {}
                        apiPost(API.planElement, {
                            type: taskKey,
                            content: JSON.stringify({ status: 'complete', method: 'self', completedAt: new Date().toISOString() }),
                            step: 0,
                        }).catch(e => console.warn('WML: Step save failed:', e));
                        discussBtn.style.display = 'none';
                        skipBtn.style.display = 'none';
                        const successMsg = el('div', { className: 'swml-feedback-done' });
                        successMsg.innerHTML = `<span style="color:#1CD991">${cfg.completeMsg}</span>`;
                        completionWrap.appendChild(successMsg);
                        showToast(cfg.completeToast, 4000, true);
                    },
                    { confirmText: 'Yes, I\'m done' }
                );
            });
            discussBtn.classList.add('swml-feedback-discuss-btn');
            completionWrap.appendChild(discussBtn);

            const skipBtn = el('button', {
                className: 'swml-feedback-skip-btn',
                textContent: 'Skip — Come Back Later',
                onClick: () => {
                    showConfirm(
                        'You can skip this for now, but completing it will help you write a better redraft.',
                        () => {
                            try { localStorage.setItem(fbCompleteKey, 'skipped'); } catch (e) {}
                            apiPost(API.planElement, {
                                type: taskKey,
                                content: JSON.stringify({ status: 'skipped', method: 'self', completedAt: new Date().toISOString() }),
                                step: 0,
                            }).catch(e => console.warn('WML: Step skip failed:', e));
                            discussBtn.style.display = 'none';
                            skipBtn.style.display = 'none';
                            const skipMsg = el('div', { className: 'swml-feedback-done' });
                            skipMsg.innerHTML = `<span style="color:#F1C40F">${cfg.skipMsg}</span>`;
                            completionWrap.appendChild(skipMsg);
                            showToast(cfg.skipToast, 4000, true);
                        },
                        { confirmText: 'Skip for now', danger: true }
                    );
                },
            });
            completionWrap.appendChild(skipBtn);
        }

        guidePanel.appendChild(completionWrap);
        } // end if(false) — v7.14.45 suppression

        // v7.14.45: Sequence navigation suppressed — LearnDash handles exercise transitions.
        // Was: Previous/Next buttons for Phase 1 and Phase 2 step sequences.

        contentArea.appendChild(guidePanel);
        canvas.appendChild(contentArea);

        // ── Status Bar ──
        const statusBar = el('div', { className: 'swml-canvas-status swml-feedback-status' });
        statusBar.appendChild(el('button', {
            className: 'swml-status-btn',
            textContent: '← Back to tasks',
            onClick: () => closeCanvasOverlay(),
        }));
        if (state.topicNumber) {
            statusBar.appendChild(el('span', { className: 'swml-feedback-topic-label', textContent: `Topic ${state.topicNumber}` }));
        }
        canvas.appendChild(statusBar);

        overlay.appendChild(canvas);
        // v7.13.13: Embedded mode — render inside embed container
        if (WML.isEmbedded) {
            const embedHost = document.getElementById('swml-embedded-root') || document.body;
            overlay.classList.add('swml-canvas-embedded');
            embedHost.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        }

        // Hide notepad
        const fab = document.querySelector('.sn-fab');
        const pnl = document.querySelector('.sn-panel');
        if (fab) fab.style.display = 'none';
        if (pnl) pnl.style.display = 'none';
        document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger, [class*="sticky-note-tab"], [class*="notes-tab"]').forEach(t => t.style.display = 'none');
        const fabTrigger = document.getElementById('snFabTrigger');
        if (fabTrigger) fabTrigger.style.display = 'none';

        // Entrance animation
        overlay.style.opacity = '0';
        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '1';
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  EXAM PREP CANVAS (v7.13.80)
    //  Dedicated renderer for: exam_question, essay_plan, model_answer,
    //  verbal_rehearsal, conceptual_notes, memory_practice.
    //  Clean document + chat layout — no diagnostic/assessment state machine.
    // ══════════════════════════════════════════════════════════════════════════

    // ── Question Selection Helpers (inside canvas) ──
    const _TASKS_NEEDING_Q = ['essay_plan', 'model_answer', 'planning', 'assessment'];
    function _needsQuestionSelection(task) {
        // Programme mode has topic pre-set; only free practice needs selection
        if (WML.state.mode === 'guided' && WML.state.topicNumber) return false;
        return _TASKS_NEEDING_Q.includes(task);
    }

    function _showCanvasQuestionSelector(chatPanel, chatMessages, chatTextarea, sendMsgFn) {
        const selectorOverlay = el('div', { className: 'swml-canvas-q-selector', id: 'swml-canvas-q-selector' });
        selectorOverlay.style.cssText = 'position:absolute;inset:0;z-index:20;background:oklch(0.17 0.01 270 / 0.97);backdrop-filter:blur(12px);display:flex;flex-direction:column;overflow-y:auto;padding:24px 20px;';

        const header = el('div', { style: { textAlign: 'center', marginBottom: '16px' } });
        header.appendChild(el('h3', { textContent: 'Choose a Question', style: { color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: '600', margin: '0 0 4px' } }));
        header.appendChild(el('p', { textContent: 'Select a topic, a saved question, or write your own', style: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0' } }));
        selectorOverlay.appendChild(header);

        const container = el('div', { style: { flex: '1' } });
        container.appendChild(el('div', { textContent: 'Loading...', style: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0', fontSize: '12px' } }));
        selectorOverlay.appendChild(container);

        // Make chatPanel position:relative so overlay covers it
        chatPanel.style.position = 'relative';
        chatPanel.appendChild(selectorOverlay);

        function selectAndGo(question, marks, aos) {
            state.question = question || '';
            if (marks) state.marks = marks;
            if (aos) state.aos = aos;
            selectorOverlay.style.opacity = '0';
            selectorOverlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                selectorOverlay.remove();
                canvasSilentSend = true; // v7.14.3: Silent — question selection is the real user action
                chatTextarea.value = "Let's begin!";
                sendMsgFn();
            }, 300);
        }

        // Fetch topics + saved questions
        Promise.all([
            fetch(`${API.topicQuestions}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}`, { headers }).then(r => r.json()).catch(() => ({ topics: [] })),
            fetch(`${API.savedQuestions}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}`, { headers }).then(r => r.json()).catch(() => ({ questions: [] })),
        ]).then(([topicRes, savedRes]) => {
            container.innerHTML = '';
            const topics = topicRes.topics || [];
            const saved = savedRes.questions || [];

            // ── Mastery Topics ──
            if (topics.length > 0) {
                container.appendChild(el('div', { className: 'swml-cqs-title', textContent: `MASTERY TOPICS (${topics.length})` }));
                const tGrid = el('div', { className: 'swml-cqs-grid' });
                topics.forEach(t => {
                    const qText = t.question_text || t.part_a_question || '';
                    const marks = t.marks || (t.part_a_marks && t.part_b_marks ? (t.part_a_marks + t.part_b_marks) : 0);
                    const aos = t.aos || [t.part_a_aos, t.part_b_aos].filter(Boolean).join(',');
                    tGrid.appendChild(el('button', { className: 'swml-cqs-card', onClick: () => selectAndGo(qText, marks, aos) }, [
                        el('span', { className: 'swml-cqs-badge', textContent: `T${t.topic_number}` }),
                        el('span', { className: 'swml-cqs-label', textContent: t.label || `Topic ${t.topic_number}` }),
                        qText ? el('span', { className: 'swml-cqs-preview', textContent: qText.length > 80 ? qText.slice(0, 80) + '\u2026' : qText }) : null,
                    ].filter(Boolean)));
                });
                container.appendChild(tGrid);
            }

            // ── Saved Questions ──
            if (saved.length > 0) {
                container.appendChild(el('div', { className: 'swml-cqs-title', textContent: `YOUR QUESTIONS (${saved.length})` }));
                const sGrid = el('div', { className: 'swml-cqs-grid' });
                saved.forEach((q, i) => {
                    sGrid.appendChild(el('button', { className: 'swml-cqs-card', onClick: () => selectAndGo(q.full_text || q.summary || '', q.marks || '', q.aos || '') }, [
                        el('span', { className: 'swml-cqs-badge', textContent: q.theme ? q.theme.slice(0, 16) : `Q${i + 1}` }),
                        el('span', { className: 'swml-cqs-label', textContent: q.summary || `Question ${i + 1}` }),
                        q.location ? el('span', { className: 'swml-cqs-preview', textContent: q.location }) : null,
                    ].filter(Boolean)));
                });
                container.appendChild(sGrid);
            }

            // ── Custom Question ──
            container.appendChild(el('div', { className: 'swml-cqs-title', textContent: 'CUSTOM QUESTION' }));
            const customArea = el('textarea', { placeholder: 'Type or paste your own question\u2026', rows: '3' });
            customArea.style.cssText = 'width:100%;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.9);padding:10px 12px;font-size:12px;font-family:inherit;resize:vertical;min-height:60px;outline:none;box-sizing:border-box;';
            container.appendChild(customArea);
            const useBtn = el('button', { textContent: 'Use this question', onClick: () => {
                const q = customArea.value.trim();
                if (!q) { customArea.focus(); return; }
                selectAndGo(q, '', '');
            }});
            useBtn.style.cssText = 'margin-top:8px;background:linear-gradient(135deg,#5333ed,#42A1EC);border:none;border-radius:8px;color:#fff;padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;';
            container.appendChild(useBtn);

            // ── Skip ──
            const skipBtn = el('button', { textContent: 'Skip \u2014 let the AI choose', onClick: () => selectAndGo('', '', '') });
            skipBtn.style.cssText = 'display:block;margin:16px auto 0;background:none;border:none;color:rgba(255,255,255,0.3);font-size:11px;cursor:pointer;padding:4px;';
            container.appendChild(skipBtn);
        });
    }

    // ── Saved Question Overlay (v7.13.99) ──
    // Shows an overlay on the document area with saved questions + mastery topics.
    // When student selects one, it's injected into the Essay Question section and sent to chat.
    function _showSavedQuestionOverlay(chatTextarea, sendFn) {
        const contentWrap = document.querySelector('.swml-canvas-content');
        if (!contentWrap) return;

        const overlay = el('div', { className: 'swml-question-overlay', id: 'swml-question-overlay' });

        const header = el('div', { className: 'swml-qo-header' });
        header.appendChild(el('h3', { textContent: 'Select a Question', style: { margin: '0', fontSize: '15px', fontWeight: '600' } }));
        header.appendChild(el('button', { className: 'swml-qo-close', innerHTML: '&times;', title: 'Close', onClick: () => overlay.remove() }));
        overlay.appendChild(header);

        const body = el('div', { className: 'swml-qo-body' });
        body.appendChild(el('p', { textContent: 'Loading...', style: { color: 'rgba(255,255,255,0.4)', fontSize: '12px' } }));
        overlay.appendChild(body);

        contentWrap.style.position = 'relative';
        contentWrap.appendChild(overlay);

        // Fetch saved questions + mastery topics in parallel
        Promise.all([
            apiGet(API.savedQuestions + `?board=${state.board}&text=${state.text}`).catch(() => ({ questions: [] })),
            apiGet(API.topicQuestions + `?board=${state.board}&text=${state.text}`).catch(() => ({ topics: [] })),
        ]).then(([savedRes, topicRes]) => {
            body.innerHTML = '';
            const saved = savedRes.questions || [];
            const topics = topicRes.topics || [];

            function selectQuestion(qText) {
                // Inject into document's Essay Question section
                if (canvasEditor) {
                    let injected = false;
                    canvasEditor.state.doc.descendants((node, pos) => {
                        if (!injected && node.type.name === 'sectionBlock' && (node.attrs.label || '').includes('Essay Question')) {
                            const sectionStart = pos + 1;
                            const sectionEnd = pos + node.nodeSize - 1;
                            canvasEditor.chain().focus().setTextSelection({ from: sectionStart, to: sectionEnd })
                                .insertContent(`<h3>Essay Question</h3><p>${qText.replace(/</g, '&lt;')}</p>`).run();
                            injected = true;
                        }
                    });
                }
                // Send to chat
                overlay.remove();
                if (chatTextarea) chatTextarea.value = qText;
                if (sendFn) sendFn();
            }

            // Saved questions
            if (saved.length > 0) {
                body.appendChild(el('div', { className: 'swml-qo-title', textContent: `YOUR QUESTIONS (${saved.length})` }));
                saved.forEach((q, i) => {
                    body.appendChild(el('button', { className: 'swml-qo-card', onClick: () => selectQuestion(q.full_text || q.summary || '') }, [
                        q.theme ? el('span', { className: 'swml-qo-badge', textContent: q.theme.slice(0, 20) }) : el('span', { className: 'swml-qo-badge', textContent: `Q${i + 1}` }),
                        el('span', { className: 'swml-qo-label', textContent: q.summary || `Question ${i + 1}` }),
                        q.location ? el('span', { className: 'swml-qo-meta', textContent: q.location }) : null,
                    ].filter(Boolean)));
                });
            }

            // Mastery topics
            if (topics.length > 0) {
                body.appendChild(el('div', { className: 'swml-qo-title', textContent: `MASTERY TOPICS (${topics.length})` }));
                topics.forEach(t => {
                    const qText = t.question_text || t.part_a_question || '';
                    if (!qText) return;
                    body.appendChild(el('button', { className: 'swml-qo-card', onClick: () => selectQuestion(qText) }, [
                        el('span', { className: 'swml-qo-badge', textContent: `T${t.topic_number}` }),
                        el('span', { className: 'swml-qo-label', textContent: t.label || `Topic ${t.topic_number}` }),
                        el('span', { className: 'swml-qo-meta', textContent: qText.length > 80 ? qText.slice(0, 80) + '\u2026' : qText }),
                    ]));
                });
            }

            if (saved.length === 0 && topics.length === 0) {
                body.appendChild(el('p', { textContent: 'No saved questions found. Use the Exam Question Creator to generate questions first, or type your own in the chat.', style: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', padding: '16px 0' } }));
            }
        });
    }

    let _examPrepGuard = false;

    function renderExamPrepCanvas() {
        if (_examPrepGuard) return;
        _examPrepGuard = true;
        setTimeout(() => { _examPrepGuard = false; }, 500);

        const { Editor, StarterKit, Placeholder, TextAlign, Highlight, CharacterCount, TextStyle, Color } = window.TipTap || {};
        if (!Editor) { _examPrepGuard = false; alert('Editor failed to load. Please refresh.'); return; }

        // Kill shader + existing overlay
        if (typeof destroyShader === 'function') destroyShader();
        const shaderBg = document.getElementById('swml-shader-bg');
        if (shaderBg) shaderBg.style.display = 'none';
        const existing = document.getElementById('swml-canvas-overlay');
        if (existing) { if (canvasEditor) { canvasEditor.destroy(); canvasEditor = null; } existing.remove(); }

        syncUrl();
        const exerciseConfig = WML.getExerciseConfig(state.task);

        // ── Overlay + Canvas Shell ──
        const overlay = el('div', { id: 'swml-canvas-overlay' });
        const canvas = el('div', { className: 'swml-canvas' });

        // ── Header Row ──
        const headerRow = el('div', { className: 'swml-canvas-header' });
        const ctxBadges = el('div', { className: 'swml-canvas-ctx' });
        [state.board?.toUpperCase(), ucfirst(state.subject || ''), state.textName || ucfirst(state.text || '')].filter(Boolean).forEach(b => {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: b }));
        });
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-diag', textContent: exerciseConfig.chatHeaderLabel || ucfirst(state.task || '') }));
        headerRow.appendChild(ctxBadges);

        // Simplified toolbar (essential tools only)
        const toolbar = el('div', { className: 'swml-canvas-toolbar', style: { display: 'flex', gap: '2px', alignItems: 'center' } });
        const tbTools = [
            { id: 'bold', label: 'B', style: 'font-weight:700', action: () => canvasEditor?.chain().focus().toggleBold().run() },
            { id: 'italic', label: 'I', style: 'font-style:italic', action: () => canvasEditor?.chain().focus().toggleItalic().run() },
            { id: 'underline', label: 'U', style: 'text-decoration:underline', action: () => canvasEditor?.chain().focus().toggleUnderline().run() },
            { id: 'h2', label: 'H2', style: '', action: () => canvasEditor?.chain().focus().toggleHeading({ level: 2 }).run() },
            { id: 'h3', label: 'H3', style: '', action: () => canvasEditor?.chain().focus().toggleHeading({ level: 3 }).run() },
            { id: 'undo', label: '\u21A9', style: '', action: () => canvasEditor?.chain().focus().undo().run() },
            { id: 'redo', label: '\u21AA', style: '', action: () => canvasEditor?.chain().focus().redo().run() },
        ];
        tbTools.forEach(t => {
            const btn = el('button', {
                className: 'swml-tb-btn',
                innerHTML: `<span style="${t.style}">${t.label}</span>`,
                title: t.id,
                tabIndex: -1,
                onClick: t.action,
            });
            btn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:rgba(255,255,255,0.6);cursor:pointer;padding:4px 8px;font-size:12px;min-width:28px;';
            toolbar.appendChild(btn);
        });
        headerRow.appendChild(toolbar);

        // Theme toggle + fullscreen
        const headerRight = el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' } });
        if (!WML.isEmbedded) {
            const themeBtn = createThemeToggleBtn('swml-ep-theme', () => {
                toggleTheme();
                const t = getTheme();
                canvas.classList.toggle('swml-canvas-light', t === 'light');
                overlay.dataset.swmlTheme = t;
            });
            headerRight.appendChild(themeBtn);
        }
        if (WML.isEmbedded) {
            const SVG_EXPAND = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
            const SVG_SHRINK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>';
            const fsBtn = el('button', { className: 'swml-canvas-fullscreen-btn', title: 'Fullscreen', innerHTML: SVG_EXPAND, onClick: () => {
                const isFs = overlay.classList.toggle('swml-canvas-fullscreen');
                fsBtn.innerHTML = isFs ? SVG_SHRINK : SVG_EXPAND;
            }});
            headerRight.appendChild(fsBtn);
            // Theme sync with LD
            const syncLD = () => {
                const dark = document.body.classList.contains('dark-mode') || document.documentElement.getAttribute('data-theme') === 'dark';
                const t = dark ? 'dark' : 'light';
                if (t !== getTheme()) { localStorage.setItem('swml-theme', t); applyTheme(t); canvas.classList.toggle('swml-canvas-light', t === 'light'); overlay.dataset.swmlTheme = t; }
            };
            syncLD();
            new MutationObserver(syncLD).observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        }
        headerRow.appendChild(headerRight);

        // ── Editor Pane (CENTER) ──
        const editorPane = el('div', { className: 'swml-canvas-editor' });
        editorPane.appendChild(headerRow);
        const contentWrap = el('div', { className: 'swml-canvas-content' });
        const docWrap = el('div', { className: 'swml-canvas-doc' });
        const editorEl = el('div', { id: 'swml-tiptap-editor' });
        docWrap.appendChild(editorEl);
        contentWrap.appendChild(docWrap);
        editorPane.appendChild(contentWrap);

        // ── Protocol Sidebar (LEFT) ──
        const protoPanel = el('div', { className: 'swml-sidebar swml-canvas-proto' });
        const protoHead = el('div', { className: 'swml-sidebar-head' });
        protoHead.appendChild(el('span', { textContent: exerciseConfig.chatHeaderLabel || ucfirst(state.task || '') }));
        protoPanel.appendChild(protoHead);
        const protoBody = el('div', { className: 'swml-sidebar-body' });
        const stepList = WML.getSteps();
        if (stepList?.length) {
            stepList.forEach(s => {
                const cls = s.step < state.step ? 'complete' : s.step === state.step ? 'active' : '';
                protoBody.appendChild(el('div', { className: `swml-step ${cls}`, 'data-step': s.step }, [
                    el('div', { className: `swml-step-circle ${cls}`, textContent: s.step < state.step ? '\u2713' : s.step }),
                    el('span', { className: 'swml-step-label', textContent: s.label }),
                ]));
            });
        }
        protoPanel.appendChild(protoBody);

        // ── Chat Panel (RIGHT) ──
        const chatPanel = el('div', { className: 'swml-canvas-chat' });

        const chatHeader = el('div', { className: 'swml-canvas-chat-header' });
        chatHeader.appendChild(el('span', {
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:6px;opacity:0.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' + (exerciseConfig.chatHeaderLabel || 'Sophic Intelligence')
        }));
        chatPanel.appendChild(chatHeader);

        const chatMessages = el('div', { className: 'swml-canvas-chat-messages', id: 'swml-canvas-chat-messages' });
        chatPanel.appendChild(chatMessages);

        // Chat input
        const chatInputWrap = el('div', { className: 'swml-canvas-chat-input' });
        const chatTextarea = el('textarea', { id: 'swml-canvas-chat-input-field', rows: '1', placeholder: 'Type your response...' });
        chatTextarea.style.cssText = 'flex:1;resize:none;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.9);padding:10px 12px;font-size:13px;font-family:inherit;outline:none;min-height:40px;max-height:120px;';
        chatTextarea.addEventListener('input', () => { chatTextarea.style.height = 'auto'; chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 120) + 'px'; });
        chatTextarea.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } });
        const sendBtn = el('button', {
            innerHTML: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
            onClick: () => sendMsg(),
        });
        sendBtn.style.cssText = 'background:linear-gradient(135deg,#5333ed,#42A1EC);border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;flex-shrink:0;';
        chatInputWrap.style.cssText = 'display:flex;gap:8px;padding:10px 12px;align-items:flex-end;';
        chatInputWrap.appendChild(chatTextarea);
        chatInputWrap.appendChild(sendBtn);
        chatPanel.appendChild(chatInputWrap);

        // ── Chat State + Messaging ──
        const chatHistory = [];
        let chatId = state.sessionId || '';

        function addMsg(role, content) {
            const bubble = el('div', { className: `swml-bubble swml-bubble-${role}` });
            const inner = el('div', { className: 'swml-bubble-content' });
            inner.innerHTML = role === 'assistant' ? WML.formatAI(content) : content.replace(/</g, '&lt;').replace(/\n/g, '<br>');
            bubble.appendChild(inner);
            chatMessages.appendChild(bubble);
            requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
        }

        async function sendMsg() {
            const msg = chatTextarea.value.trim();
            if (!msg) return;
            chatTextarea.value = '';
            chatTextarea.style.height = 'auto';
            addMsg('user', msg);
            chatHistory.push({ role: 'user', content: msg });
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';

            // Typing indicator
            const typing = el('div', { className: 'swml-bubble swml-bubble-assistant swml-typing' });
            typing.innerHTML = '<div class="swml-bubble-content"><span class="swml-typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
            chatMessages.appendChild(typing);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const docContent = canvasEditor ? canvasEditor.getHTML() : '';
                const res = await fetch(API.chat, {
                    method: 'POST', headers,
                    body: JSON.stringify({
                        prompt: msg,
                        botId: config.botId,
                        chatId: chatId || state.sessionId,
                        history: chatHistory.slice(0, -1).slice(-24),
                        planState: {},
                        step: state.step,
                        board: state.board,
                        subject: state.subject,
                        text: state.text,
                        task: state.task,
                        question: state.question || '',
                        marks: state.marks || '',
                        aos: state.aos || '',
                        draftType: state.draftType || '',
                        topicNumber: state.topicNumber || 0,
                        phase: state.phase || '',
                        documentContent: docContent.length < 15000 ? docContent : '',
                    }),
                });
                const data = await res.json();
                typing.remove();

                if (data.reply) {
                    chatHistory.push({ role: 'assistant', content: data.reply });
                    addMsg('assistant', data.reply);
                    saveCanvasChat(chatHistory, chatId);
                    // Step progression
                    if (data.step && data.step > state.step) {
                        state.step = data.step;
                        protoBody.querySelectorAll('.swml-step').forEach(stepEl => {
                            const sn = parseInt(stepEl.dataset.step);
                            const circle = stepEl.querySelector('.swml-step-circle');
                            const cls = sn < state.step ? 'complete' : sn === state.step ? 'active' : '';
                            stepEl.className = `swml-step ${cls}`;
                            if (circle) { circle.className = `swml-step-circle ${cls}`; circle.textContent = sn < state.step ? '\u2713' : sn; }
                        });
                    }
                } else {
                    addMsg('assistant', 'Sorry, I didn\u2019t get a response. Please try again.');
                }
            } catch (e) {
                typing.remove();
                addMsg('assistant', 'Something went wrong. Please try again.');
                console.error('WML exam prep chat error:', e);
            }
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
            chatTextarea.focus();
        }

        // ── Status Bar ──
        const statusBar = el('div', { className: 'swml-canvas-status' });
        if (!WML.isEmbedded) {
            statusBar.appendChild(el('button', { className: 'swml-status-btn', textContent: '\u2190 Back to tasks', onClick: () => closeCanvasOverlay() }));
        }
        const wcDisplay = el('span', { className: 'swml-wc-display', textContent: '0 words' });
        statusBar.appendChild(wcDisplay);
        const saveStatus = el('span', { className: 'swml-save-status' });
        statusBar.appendChild(saveStatus);

        // ── Assemble DOM ──
        canvas.appendChild(protoPanel);
        canvas.appendChild(editorPane);
        canvas.appendChild(chatPanel);
        canvas.appendChild(statusBar);

        // Apply theme
        const initTheme = getTheme();
        if (initTheme === 'light') canvas.classList.add('swml-canvas-light');
        overlay.dataset.swmlTheme = initTheme;

        overlay.appendChild(canvas);
        if (WML.isEmbedded) {
            const embedHost = document.getElementById('swml-embedded-root') || document.body;
            overlay.classList.add('swml-canvas-embedded');
            embedHost.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        }

        // Hide notepad
        const fab = document.querySelector('.sn-fab');
        const pnl = document.querySelector('.sn-panel');
        if (fab) fab.style.display = 'none';
        if (pnl) pnl.style.display = 'none';
        document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger').forEach(t => t.style.display = 'none');

        // ── TipTap Editor ──
        const SectionBlock = window.TipTap?.Node?.create({
            name: 'sectionBlock', group: 'block', content: 'block+', defining: true,
            addAttributes() { return { sectionType: { default: 'response' }, label: { default: '' }, editable: { default: 'true' }, readonly: { default: null }, part: { default: null } }; },
            parseHTML() { return [{ tag: 'div[data-section-type]', getAttrs: d => ({ sectionType: d.getAttribute('data-section-type'), label: d.getAttribute('data-section-label') || '', editable: d.getAttribute('data-editable') || 'true', readonly: d.getAttribute('data-readonly') || null, part: d.getAttribute('data-part') || null }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-section-type': a.sectionType, 'data-section-label': a.label, 'data-editable': a.editable, ...(a.readonly ? { 'data-readonly': a.readonly } : {}), ...(a.part ? { 'data-part': a.part } : {}), class: `swml-section-block swml-section-${a.sectionType}${a.readonly ? ' swml-section-readonly' : ''}` }, 0]; },
        });

        // Load saved content or template
        const savedKey = CANVAS_SAVE_KEY();
        let savedContent = null;
        try { savedContent = localStorage.getItem(savedKey); } catch (e) {}

        canvasEditor = new Editor({
            element: editorEl,
            extensions: [
                StarterKit.configure({ heading: { levels: [2, 3] } }),
                Placeholder.configure({ placeholder: 'Start working here...' }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Highlight.configure({ multicolor: true }),
                CharacterCount, TextStyle, Color,
                SectionBlock,
            ],
            content: savedContent || getExamPrepDocTemplate(state.task),
            editorProps: { attributes: { spellcheck: 'true' } },
            onUpdate: ({ editor }) => {
                const wc = getResponseWordCount(editor);
                wcDisplay.textContent = `${wc} word${wc !== 1 ? 's' : ''}`;
                // Auto-save (debounced)
                saveStatus.textContent = '';
                clearTimeout(canvasSaveToServerTimer);
                canvasSaveToServerTimer = setTimeout(() => {
                    saveCanvasContent();
                    saveStatus.textContent = '\u2713 Saved';
                    setTimeout(() => { saveStatus.textContent = ''; }, 2000);
                }, 2000);
            },
            onCreate: ({ editor }) => {
                const wc = getResponseWordCount(editor);
                wcDisplay.textContent = `${wc} word${wc !== 1 ? 's' : ''}`;
            },
        });

        // Try loading from server if no localStorage content
        if (!savedContent) {
            fetch(`${API.canvasLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topic=${state.topicNumber || 0}`, { headers })
                .then(r => r.json())
                .then(data => {
                    if (data?.html && canvasEditor && canvasEditor.getText().trim().length < 50) {
                        canvasEditor.commands.setContent(data.html, false);
                        console.log('WML Exam Prep: Loaded saved document from server');
                    }
                })
                .catch(() => {});
        }

        // ── Load saved chat or show question selector or auto-greet ──
        const savedChat = loadCanvasChat();
        if (savedChat?.history?.length) {
            savedChat.history.forEach(m => { chatHistory.push(m); addMsg(m.role, m.content); });
            if (savedChat.chatId) chatId = savedChat.chatId;
            // Restore step progression from saved state
            if (savedChat.step && savedChat.step > 1) {
                state.step = savedChat.step;
                protoBody.querySelectorAll('.swml-step').forEach(stepEl => {
                    const sn = parseInt(stepEl.dataset.step);
                    const circle = stepEl.querySelector('.swml-step-circle');
                    const cls = sn < state.step ? 'complete' : sn === state.step ? 'active' : '';
                    stepEl.className = `swml-step ${cls}`;
                    if (circle) { circle.className = `swml-step-circle ${cls}`; circle.textContent = sn < state.step ? '\u2713' : sn; }
                });
            }
            console.log('WML Exam Prep: Resumed chat with', savedChat.history.length, 'messages, step:', savedChat.step || 1);
        } else if (_needsQuestionSelection(state.task) && !state.question) {
            // Show question selector overlay inside the canvas
            _showCanvasQuestionSelector(chatPanel, chatMessages, chatTextarea, sendMsg);
        } else {
            // Auto-send greeting to start the exercise
            setTimeout(() => {
                chatTextarea.value = "Let's begin!";
                sendMsg();
            }, 500);
        }

        console.log('WML Exam Prep: Canvas rendered for', state.task, '— board:', state.board, 'text:', state.text);
    }

    // ── Register assessment functions on WML namespace ──
    WML.renderCanvasWorkspace = renderCanvasWorkspace;
    WML.closeCanvasOverlay = closeCanvasOverlay;
    WML.renderFeedbackDiscussionCanvas = renderFeedbackDiscussionCanvas;
    WML.renderExamPrepCanvas = renderExamPrepCanvas;
    WML.saveCanvasChat = saveCanvasChat;
    WML.loadCanvasChat = loadCanvasChat;
    WML.clearCanvasChat = clearCanvasChat;
    WML.saveCanvasContent = saveCanvasContent;
    WML.loadCanvasContent = loadCanvasContent;
    WML.exportToDocx = exportToDocx;
    WML.getDocumentTemplate = getDocumentTemplate;
    WML.buildTableOfContents = buildTableOfContents;

})();
