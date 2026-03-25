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
    const CANVAS_SAVE_KEY = () => {
        const base = `swml_canvas_${state.board}_${state.text}_${state.topicNumber || 'free'}`;
        if (state.task === 'mark_scheme') return base + '_ms';
        return base;
    };
    const CHAT_SAVE_KEY = () => `swml_chat_${state.board}_${state.text}_${state.topicNumber || 'free'}`;
    let chatSaveTimer = null;

    function saveCanvasChat(history, chatId) {
        // 1. Instant localStorage write
        try {
            localStorage.setItem(CHAT_SAVE_KEY(), JSON.stringify({ history, chatId, savedAt: new Date().toISOString(), count: history.length }));
        } catch (e) { /* storage full */ }
        // 2. Debounced server write (every 8s — less frequent than doc save)
        clearTimeout(chatSaveTimer);
        chatSaveTimer = setTimeout(() => {
            fetch(API.chatSave, {
                method: 'POST', headers,
                body: JSON.stringify({ board: state.board, text: state.text, topicNumber: state.topicNumber || null, history, chatId })
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
            body: JSON.stringify({ board: state.board, text: state.text, topicNumber: state.topicNumber || null })
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

    let _canvasGuard = false; // Prevents double-render of canvas workspace (v7.12.61)
    function renderCanvasWorkspace() {
        if (_canvasGuard) return;
        _canvasGuard = true;
        setTimeout(() => { _canvasGuard = false; }, 500);

        const { Editor, StarterKit, Placeholder, TextAlign, Highlight, CharacterCount, TextStyle, Color, Node, Mark, PaginationPlus, PAGE_SIZES } = window.TipTap || {};
        if (!Editor) {
            _canvasGuard = false;
            alert('TipTap editor failed to load. Please refresh the page.');
            return;
        }

        syncUrl(); // Update URL bar with canvas state (diagnostic/assessment/polishing)

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
        const ctxBadges = el('div', { className: 'swml-canvas-ctx' });
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: boardLabel }));
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: subjectLabel }));
        ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge', textContent: textLabel }));

        // Topic / exercise badge
        if (state.topicNumber) {
            ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: `Topic ${state.topicNumber}` }));
        } else if (state.task && state.task !== 'planning') {
            const taskNames = { assessment: 'Assessment', polishing: 'Polishing', exam_question: 'Exam Question', essay_plan: 'Essay Plan', model_answer: 'Model Answer', verbal_rehearsal: 'Quote Analysis', conceptual_notes: 'Conceptual Notes', memory_practice: 'Memory Practice' };
            const tn = taskNames[state.task];
            if (tn) ctxBadges.appendChild(el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-topic', textContent: tn }));
        }
        const SVG_DIAGNOSTIC = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10" style="display:inline-block;vertical-align:-2px;margin-right:3px"><path d="M8.18,16.77V13H4.36v3.82L2.09,19a2,2,0,0,0-.59,1.44h0a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2h0a2,2,0,0,0-.6-1.44Z"/><line x1="2.45" y1="12.95" x2="10.09" y2="12.95"/><path d="M20.59,15.39V11.05H16.77v4.34a3.82,3.82,0,1,0,3.82,0Z"/><line x1="22.5" y1="11.05" x2="14.86" y2="11.05"/><path d="M18.68,11.05V3.89A2.39,2.39,0,0,0,16.3,1.5h0a2.39,2.39,0,0,0-2.39,2.39V6.27A1.91,1.91,0,0,1,12,8.18h0a1.91,1.91,0,0,1-1.91-1.91V5.32A1.9,1.9,0,0,0,8.18,3.41h0A1.91,1.91,0,0,0,6.27,5.32v.95"/><line x1="5.32" y1="9.14" x2="7.23" y2="9.14"/><line x1="14.86" y1="17.73" x2="19.64" y2="17.73"/><line x1="2.45" y1="18.68" x2="6.27" y2="18.68"/></svg>';
        const diagBadgeLabel = state.task === 'feedback_discussion' ? 'Discuss Feedback' : 'Diagnostic';
        const diagBadge = el('span', { className: 'swml-canvas-ctx-badge swml-canvas-ctx-diag', innerHTML: SVG_DIAGNOSTIC + diagBadgeLabel });
        ctxBadges.appendChild(diagBadge);

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
        function checkCtxOverflow() {
            // Reset all visible
            ctxAllBadges.forEach(b => b.style.display = '');
            ctxOverflowBtn.style.display = 'none';
            ctxOverflowDrop.innerHTML = '';
            ctxOverflowDrop.style.display = 'none';
            // Force reflow so measurements are accurate
            void ctxBadges.offsetWidth;
            // Check if badges actually overflow — compare scrollWidth to clientWidth
            if (ctxBadges.scrollWidth <= ctxBadges.clientWidth + 2) return; // +2px tolerance
            // Overflow detected — find the break point
            const containerRight = ctxBadges.getBoundingClientRect().right;
            for (let i = ctxAllBadges.length - 1; i >= 1; i--) {
                ctxAllBadges[i].style.display = 'none';
                ctxOverflowDrop.insertBefore(
                    el('span', { className: 'swml-canvas-ctx-badge', textContent: ctxAllBadges[i].textContent }),
                    ctxOverflowDrop.firstChild
                );
                void ctxBadges.offsetWidth; // reflow
                if (ctxBadges.scrollWidth <= ctxBadges.clientWidth + 2) break;
            }
            if (ctxOverflowDrop.children.length > 0) ctxOverflowBtn.style.display = '';
        }
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(() => requestAnimationFrame(checkCtxOverflow)).observe(ctxBadges);
        }
        setTimeout(checkCtxOverflow, 200);

        headerRow.appendChild(ctxBadges);

        // Toolbar buttons (centre)
        headerRow.appendChild(toolbar);

        // BETA label + theme toggle (right)
        const headerRight = el('div', { className: 'swml-canvas-header-right' });

        headerRight.appendChild(el('span', { className: 'swml-canvas-ctx-mode', textContent: 'BETA' }));

        // Theme toggle — shared Jhey moon/sun toggle, syncs with canvas light/dark
        const canvasThemeToggle = createThemeToggleBtn('swml-canvas-theme-toggle', () => {
            toggleTheme();
            const t = getTheme();
            canvas.classList.toggle('swml-canvas-light', t === 'light');
            overlay.dataset.swmlTheme = t;
        });
        // Apply user's theme immediately — canvas fades in with correct colours
        const initTheme = getTheme();
        if (initTheme === 'light') canvas.classList.add('swml-canvas-light');
        overlay.dataset.swmlTheme = initTheme;
        headerRight.appendChild(canvasThemeToggle);
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

        // Floating trigger on left edge of content area
        const outlineBtn = el('button', {
            className: 'swml-outline-btn',
            title: 'Document Outline',
            innerHTML: SVG_OUTLINE,
            onClick: (e) => { e.stopPropagation(); toggleOutlinePanel(); }
        });
        contentWrap.appendChild(outlineBtn);

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
        contentWrap.appendChild(outlinePanel);
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
            outlinePanel.style.top = rect.top + 'px';
            outlinePanel.style.width = rect.width + 'px';
            outlinePanel.style.height = rect.height + 'px';
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

        function scrollToPos(pos) {
            if (!canvasEditor) return;
            canvasEditor.chain().setTextSelection(pos + 1).run();
            requestAnimationFrame(() => {
                try {
                    const domNode = canvasEditor.view.domAtPos(pos + 1)?.node;
                    const target = domNode?.nodeType === 1 ? domNode : domNode?.parentElement?.closest('[data-section-type], h2, h3') || domNode?.parentElement;
                    if (target) {
                        const containerRect = contentWrap.getBoundingClientRect();
                        const targetRect = target.getBoundingClientRect();
                        const scrollTarget = contentWrap.scrollTop + (targetRect.top - containerRect.top) - (containerRect.height / 3);
                        contentWrap.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                    }
                } catch(e) {}
            });
        }

        function updateOutline() {
            if (!canvasEditor) return;
            const editor = document.getElementById('swml-tiptap-editor');
            // Walk sectionBlock nodes for hierarchy
            const sections = [];
            canvasEditor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'sectionBlock') {
                    const type = node.attrs.sectionType || 'response';
                    if (type === 'divider') return false; // skip group dividers (v7.12.59)
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

            // ── Compute section numbers (major.minor grouped format, matching TOC) (v7.12.56) ──
            const GROUP_PREFIXES = ['Plan:', 'Outline:', 'Feedback:'];
            let _major = 0, _minor = 0, _lastGroup = null;
            const sectionNumbers = sections.map(s => {
                if (s.type === 'cover') return '';
                const gp = GROUP_PREFIXES.find(p => s.label.startsWith(p));
                if (gp) {
                    if (gp !== _lastGroup) { _major++; _minor = 0; _lastGroup = gp; }
                    _minor++;
                    return _major + '.' + _minor;
                } else {
                    _major++; _minor = 0; _lastGroup = null;
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

            // Group consecutive sections by label prefix
            const groups = [];
            let currentGroup = null;
            const PREFIX_MAP = { 'Plan:': 'Essay Plan', 'Outline:': 'Outline', 'Feedback:': 'Feedback' };
            sections.forEach(s => {
                // Skip cover images from outline
                if (s.type === 'cover') return;
                let groupKey = null, childLabel = s.label;
                for (const [prefix, name] of Object.entries(PREFIX_MAP)) {
                    if (s.label.startsWith(prefix)) {
                        groupKey = name;
                        childLabel = s.label.slice(prefix.length).trim();
                        break;
                    }
                }
                if (groupKey) {
                    if (currentGroup && currentGroup.key === groupKey) {
                        currentGroup.children.push({ ...s, childLabel });
                    } else {
                        currentGroup = { key: groupKey, children: [{ ...s, childLabel }], type: s.type };
                        groups.push(currentGroup);
                    }
                } else {
                    currentGroup = null;
                    groups.push({ key: null, section: s });
                }
            });

            // Render grouped outline (v7.12.56: grouped section numbers)
            groups.forEach(g => {
                if (g.key && g.children.length > 1) {
                    // Parent group header (clicks to first child)
                    const header = el('button', {
                        className: 'swml-outline-item swml-outline-group',
                        onClick: () => scrollToPos(g.children[0].pos)
                    });
                    const dot = el('span', { className: 'swml-outline-dot' });
                    dot.style.background = SECTION_COLOURS[g.type] || '#888';
                    header.appendChild(dot);
                    // Extract major number from first child's number (e.g., "2.1" → "2")
                    const groupMajor = (g.children[0]?._num || '').split('.')[0];
                    header.appendChild(document.createTextNode((groupMajor ? groupMajor + '. ' : '') + g.key));
                    outlineList.appendChild(header);
                    outlineHeadingPositions.push({ pos: g.children[0].pos, itemEl: header });
                    // Children
                    g.children.forEach(child => {
                        const childIndicator = getSectionIndicator(child);
                        const item = el('button', {
                            className: 'swml-outline-item swml-outline-child',
                            onClick: () => scrollToPos(child.pos)
                        });
                        item.appendChild(el('span', { className: 'swml-outline-label', textContent: (child._num ? child._num + ' ' : '') + (child.childLabel || child.label) }));
                        if (childIndicator) {
                            const chk = el('span', { className: 'swml-outline-check' });
                            chk.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#1CD991" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" fill="#1CD991"/><path d="M7.5 12.5l3 3 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
                            item.appendChild(chk);
                        }
                        outlineList.appendChild(item);
                        outlineHeadingPositions.push({ pos: child.pos, itemEl: item });
                    });
                } else {
                    // Single section (or single-child group)
                    const s = g.key ? g.children[0] : g.section;
                    const label = g.key && g.children.length === 1 ? g.key : s.label;
                    const indicator = getSectionIndicator(s);
                    const item = el('button', {
                        className: 'swml-outline-item',
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
        const wcDisplay = el('span', { className: 'swml-wc', textContent: '0 words' });
        const saveStatus = el('span', { className: 'swml-save-status', textContent: 'Ready' });
        const backBtn = el('button', {
            className: 'swml-status-btn',
            textContent: '← Back to tasks',
            onClick: () => closeCanvasOverlay(), // v7.12.60: unified cleanup (shader restart, etc.)
        });
        statusBar.appendChild(backBtn);
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
        statusBar.appendChild(resetBtn);
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

        // Countdown timer — reuses the diagnostic start time
        const countdownKey = `swml_diag_start_${state.board}_${(state.text || '').replace(/\s/g, '_')}`;
        const countdownStart = localStorage.getItem(countdownKey);
        if (countdownStart) {
            const cStart = new Date(countdownStart);
            const cDeadline = new Date(cStart.getTime() + 10 * 24 * 60 * 60 * 1000);
            const countdownDisplay = el('span', { className: 'swml-countdown-status' });
            function updateCountdown() {
                const remaining = cDeadline.getTime() - Date.now();
                if (remaining <= 0) {
                    countdownDisplay.textContent = 'Overdue';
                    countdownDisplay.style.color = '#ff6b6b';
                    return;
                }
                const daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000));
                const daysPassed = 10 - daysLeft;
                countdownDisplay.textContent = `Day ${daysPassed + 1} · ${daysLeft}d left`;
                countdownDisplay.style.color = daysLeft <= 2 ? '#ff6b6b' : daysLeft <= 5 ? '#ffb432' : '';
            }
            updateCountdown();
            statusBar.appendChild(countdownDisplay);
        }

        // Comment count
        const commentCountEl = el('span', { className: 'swml-comment-count', style: { cursor: 'pointer' } });

        // ── Canvas State Flags ──
        let canvasInAssessment = state.task === 'assessment' || state.task === 'mark_scheme'; // assessment or mark scheme study
        const canvasInFeedback = state.task === 'feedback_discussion'; // true when reviewing feedback (v7.12.80)
        const canvasInMarkScheme = state.task === 'mark_scheme'; // true for mark scheme study (v7.12.89)

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
                // Find the question section in the editor
                const questionEl = editorEl.querySelector('[data-section-type="question"]');
                if (!questionEl) return;

                extractPanel = el('div', { className: 'swml-extract-panel' });
                const extractHeader = el('div', { className: 'swml-extract-panel-header' });
                extractHeader.appendChild(el('span', { textContent: '📋 Extract' }));
                extractHeader.appendChild(el('button', {
                    className: 'swml-extract-panel-close',
                    textContent: '✕',
                    onClick: () => { extractPanel.remove(); extractPanel = null; extractBtn.classList.remove('active'); }
                }));
                extractPanel.appendChild(extractHeader);

                const extractBody = el('div', { className: 'swml-extract-panel-body' });
                extractBody.innerHTML = questionEl.innerHTML;
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
        statusBar.appendChild(extractBtn);

        editorPane.appendChild(statusBar);

        canvas.appendChild(editorPane);

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

        // Direct assessment entry — force diagnostic branch so diagCompleteBtn is created
        // (the auto-trigger will click it after content loads, transitioning to assessment UI)
        if (canvasInAssessment) hasPlan = false;

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

            // Completion buttons
            const compWrap = el('div', { style: { marginTop: 'auto' } });
            const fbCompleteKey = `swml_fb_complete_${state.board}_${state.text}_t${state.topicNumber || 0}${fbCfg.storageKeySuffix}`;
            const fbStatus = localStorage.getItem(fbCompleteKey);

            if (fbStatus === 'complete' || fbStatus === 'skipped') {
                compWrap.appendChild(el('div', { className: 'swml-feedback-done', innerHTML: fbStatus === 'complete'
                    ? `<span style="color:#1CD991">${fbCfg.completeMsg}</span>`
                    : `<span style="color:#F1C40F">${fbCfg.skipMsg}</span>` }));
            } else {
                const doneBtn = build3DButton(fbCfg.completeLabel, 'Done!', () => {
                    showConfirm(fbCfg.completeConfirm, () => {
                        try { localStorage.setItem(fbCompleteKey, 'complete'); } catch (e) {}
                        apiPost(API.planElement, { type: 'feedback_discussion', content: JSON.stringify({ status: 'complete', method: 'self', completedAt: new Date().toISOString() }), step: 0 }).catch(() => {});
                        doneBtn.style.display = 'none';
                        skipBtn.style.display = 'none';
                        compWrap.appendChild(el('div', { className: 'swml-feedback-done', innerHTML: `<span style="color:#1CD991">${fbCfg.completeMsg}</span>` }));
                        showToast(fbCfg.completeToast, 4000, true);
                    }, { confirmText: 'Yes, I\'m done' });
                });
                compWrap.appendChild(doneBtn);

                const skipBtn = el('button', { className: 'swml-feedback-skip-btn', textContent: 'Skip — Come Back Later', onClick: () => {
                    showConfirm('You can skip this for now, but completing it will help you write a better redraft.', () => {
                        try { localStorage.setItem(fbCompleteKey, 'skipped'); } catch (e) {}
                        apiPost(API.planElement, { type: 'feedback_discussion', content: JSON.stringify({ status: 'skipped', method: 'self', completedAt: new Date().toISOString() }), step: 0 }).catch(() => {});
                        doneBtn.style.display = 'none';
                        skipBtn.style.display = 'none';
                        compWrap.appendChild(el('div', { className: 'swml-feedback-done', innerHTML: `<span style="color:#F1C40F">${fbCfg.skipMsg}</span>` }));
                        showToast(fbCfg.skipToast, 4000, true);
                    }, { confirmText: 'Skip for now', danger: true });
                }});
                compWrap.appendChild(skipBtn);
            }
            rightPanel.appendChild(compWrap);

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
        } else {
            // Diagnostic mode — guidance tips
            rightPanel.appendChild(el('h3', {
                innerHTML: '<span class="swml-sidebar-close-icon">−</span> Diagnostic Guidance',
                style: { cursor: 'pointer' }
            }));
            const guidanceContent = el('div', { className: 'swml-canvas-guidance' });

            const tips = [
                { icon: SVG_GUIDE_LOCK, colour: '#5333ed', text: 'This is your independent assessment. No help is available — no AI, no notes, no resources. Rely entirely on what you\'ve learned.' },
                { icon: SVG_GUIDE_BRAIN, colour: '#51dacf', text: 'Try to recall everything you were taught. Extract your best knowledge and put it on the page.' },
                { icon: SVG_GUIDE_TARGET, colour: '#4D76FD', text: `Aim for ${canvasWordTarget} words. Once you reach ${canvasWordMinimum} words, a "Mark Complete" button will appear — but push for ${canvasWordTarget} if you can.` },
                { icon: SVG_GUIDE_STOPWATCH, colour: '#51dacf', text: 'Work efficiently. Get your ideas down as quickly as possible to the best of your ability.' },
                { icon: SVG_GUIDE_ARM, colour: '#1CD991', text: 'Don\'t worry about grades. The purpose is to diagnose your strengths and areas for development, so we can build on them and eliminate weaknesses.' },
                { icon: SVG_GUIDE_WRITING, colour: '#5333ed', text: 'Write the very best you know at this moment. Structure: Introduction → 3 Body Paragraphs → Conclusion.' },
            ];

            tips.forEach(t => {
                const tip = el('div', { className: 'swml-canvas-plan-section' });
                tip.appendChild(el('p', { innerHTML: `<span class="swml-guide-icon" style="color:${t.colour}">${t.icon}</span> ${t.text}` }));
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
                        <p>Your diagnostic essay will be saved and you'll move on to the <strong>assessment phase</strong>, where the AI will walk you through detailed feedback on your writing.</p>
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

                        // ── ASSESSMENT TRANSITION ──
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

                        // Badges
                        const protoBadges = el('div', { className: 'swml-sidebar-badges' });
                        [boardLabel, subjectLabel, textLabel].filter(Boolean).forEach(b =>
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: b }))
                        );
                        // Topic / mode badge
                        if (state.topicNumber && state.mode === 'guided') {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: `Topic ${state.topicNumber}` }));
                        } else if (state.mode === 'exam_prep') {
                            protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge', textContent: 'Exam Practice' }));
                        }
                        protoBadges.appendChild(el('span', { className: 'swml-sidebar-badge active', textContent: 'Assessment' }));
                        protoBody.appendChild(protoBadges);

                        // Protocol Progress label
                        protoBody.appendChild(el('div', { className: 'swml-sidebar-section-label', textContent: 'Protocol Progress' }));

                        // Steps
                        const protoSteps = el('div', { id: 'swml-progress-steps' });
                        const assessSteps = [
                            { step: 1, label: 'Setup & Details' },
                            { step: 2, label: 'Goal Setting' },
                            { step: 3, label: 'Self-Reflection' },
                            { step: 4, label: 'Essay Review' },
                            { step: 5, label: 'Introduction' },
                            { step: 6, label: 'Body Paragraphs' },
                            { step: 7, label: 'Conclusion' },
                            { step: 8, label: 'Summary & Action Plan' },
                        ];
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
                        const assessBtn = build3DButton('Mark Complete', 'Done!', () => {
                            if (state._phaseMarkedComplete) return;
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

                        // Back to Writing — smooth reverse transition
                        protoSpacer.appendChild(iconBtn(SVG_BACK, 'Back to Diagnostic', () => {
                            // Reset state when returning to diagnostic (v7.12.32)
                            state.task = 'diagnostic';
                            canvasInAssessment = false;

                            // 1. Fade out assessment panel content (v7.12.45)
                            protoPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            protoPanel.style.opacity = '0';
                            protoPanel.style.transform = 'translateX(-20px)';
                            chatPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            chatPanel.style.opacity = '0';
                            chatPanel.style.transform = 'translateX(20px)';
                            if (chatResizeHandle) { chatResizeHandle.style.transition = 'opacity 0.3s ease'; chatResizeHandle.style.opacity = '0'; }

                            // 2. After fade: collapse assessment + expand diagnostic SIMULTANEOUSLY
                            setTimeout(() => {
                                // Collapse assessment panels
                                const panelEase = 'max-width 0.4s cubic-bezier(0.16,1,0.3,1)';
                                protoPanel.style.transition = panelEase;
                                protoPanel.style.maxWidth = '0';
                                protoPanel.style.overflow = 'hidden';
                                chatPanel.style.transition = panelEase;
                                chatPanel.style.maxWidth = '0';
                                chatPanel.style.overflow = 'hidden';
                                if (chatResizeHandle) chatResizeHandle.style.display = 'none';

                                // Simultaneously expand diagnostic panel
                                rightPanel.classList.remove('swml-canvas-plan-hidden');
                            }, 350);

                            // 3. After widths settle, hide assessment + fade in diagnostic content
                            setTimeout(() => {
                                protoPanel.style.display = 'none';
                                chatPanel.style.display = 'none';

                                // Fade diagnostic children back in
                                setTimeout(() => {
                                    rightPanel.classList.remove('swml-canvas-plan-fading');
                                    // Restore header badges
                                    if (ctxEl) { ctxEl.style.display = ''; requestAnimationFrame(() => { ctxEl.style.transition = 'opacity 0.4s ease'; ctxEl.style.opacity = '1'; }); }
                                    if (diagBadge) { diagBadge.style.display = ''; requestAnimationFrame(() => { diagBadge.style.transition = 'opacity 0.4s ease'; diagBadge.style.opacity = '1'; }); }
                                    reopenBtn.style.display = '';
                                    resetBtn.style.display = '';
                                    sidebarOpen = true;
                                    const ww = document.getElementById('swml-wc-widget');
                                    if (ww) { ww.style.display = ''; ww.style.opacity = '1'; }

                                    // ── Re-add "Go to Assessment" 3D button after returning from assessment (v7.12.32) ──
                                    if (diagCompleteBtn && !rightPanel.querySelector('.swml-go-assess-btn')) {
                                        diagCompleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M5 12l5 5L20 7"/></svg> Complete';
                                        diagCompleteBtn.disabled = true;
                                        diagCompleteBtn.style.opacity = '0.5';
                                        diagCompleteBtn.style.cursor = 'default';
                                        diagCompleteBtn.style.display = 'block';
                                        const goBackBtn = build3DButton('Go to Assessment', "Let's Go", () => {
                                            // v7.12.45: Simultaneous width changes — one smooth document shift
                                            state.task = 'assessment';
                                            state.canvasTimer = 0;
                                            state.step = 0;
                                            canvasInAssessment = true;

                                            // Fade out diagnostic panel content + badges
                                            rightPanel.classList.add('swml-canvas-plan-fading');
                                            if (ctxEl) { ctxEl.style.transition = 'opacity 0.3s ease'; ctxEl.style.opacity = '0'; }
                                            if (diagBadge) { diagBadge.style.transition = 'opacity 0.3s ease'; diagBadge.style.opacity = '0'; }

                                            // After content fades: collapse diagnostic + expand assessment SIMULTANEOUSLY
                                            setTimeout(() => {
                                                // Collapse diagnostic panel
                                                rightPanel.classList.add('swml-canvas-plan-hidden');
                                                if (ctxEl) ctxEl.style.display = 'none';
                                                if (diagBadge) diagBadge.style.display = 'none';

                                                // Show assessment panels (v7.12.46: background visible, children hidden)
                                                protoPanel.style.display = '';
                                                protoPanel.style.opacity = '';
                                                protoPanel.style.transform = '';
                                                protoPanel.classList.add('swml-panel-entering');
                                                protoPanel.style.maxWidth = '0';
                                                protoPanel.style.overflow = 'hidden';
                                                chatPanel.style.display = '';
                                                chatPanel.style.opacity = '';
                                                chatPanel.style.transform = '';
                                                chatPanel.classList.add('swml-panel-entering');
                                                chatPanel.style.maxWidth = '0';
                                                chatPanel.style.overflow = 'hidden';
                                                if (chatResizeHandle) { chatResizeHandle.style.display = ''; chatResizeHandle.style.opacity = '0'; }

                                                // All width changes in same frame — one smooth document shift
                                                requestAnimationFrame(() => {
                                                    const panelEase = 'max-width 0.4s cubic-bezier(0.16,1,0.3,1)';
                                                    protoPanel.style.transition = panelEase;
                                                    protoPanel.style.maxWidth = '280px';
                                                    chatPanel.style.transition = panelEase;
                                                    chatPanel.style.maxWidth = '500px';

                                                    // After widths settle, GSAP stagger children in (v7.12.47)
                                                    setTimeout(() => {
                                                        protoPanel.classList.remove('swml-panel-entering');
                                                        protoPanel.style.overflow = '';
                                                        if (chatResizeHandle) { chatResizeHandle.style.transition = 'opacity 0.5s ease'; chatResizeHandle.style.opacity = '1'; }
                                                        if (window.gsap) {
                                                            gsap.from(protoPanel.children, { opacity: 0, y: -12, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' });
                                                        }
                                                    }, 420);
                                                    setTimeout(() => {
                                                        chatPanel.classList.remove('swml-panel-entering');
                                                        chatPanel.style.overflow = '';
                                                        if (window.gsap) {
                                                            gsap.from(chatPanel.children, { opacity: 0, y: -12, duration: 0.4, stagger: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' });
                                                        }
                                                    }, 520);
                                                });

                                                // Hide diagnostic-only UI
                                                reopenBtn.style.display = 'none';
                                                resetBtn.style.display = 'none';
                                                const wcW2 = document.getElementById('swml-wc-widget');
                                                if (wcW2) { wcW2.style.transition = 'opacity 0.3s ease'; wcW2.style.opacity = '0'; setTimeout(() => { wcW2.style.display = 'none'; }, 300); }
                                                if (canvasTimerInterval) { clearInterval(canvasTimerInterval); canvasTimerInterval = null; }
                                            }, 580); // v7.12.47: wait for full staggered fade
                                        });
                                        goBackBtn.classList.add('swml-go-assess-btn');
                                        rightPanel.appendChild(goBackBtn);
                                    }
                                }, 380);
                            }, 780); // v7.12.45: 350ms fade + 400ms collapse + margin
                        }));
                        protoBody.appendChild(protoSpacer);
                        protoPanel.appendChild(protoBody);

                        // 4. Build right chat panel — matching existing chat style
                        const chatPanel = el('div', { className: 'swml-canvas-chat' });

                        // Chat header with clear button
                        const chatHeader = el('div', { className: 'swml-canvas-chat-header', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
                        chatHeader.appendChild(el('span', { innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;opacity:0.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Essay Assessment' }));
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
                                        // Show fresh greeting with essay question if available
                                        const fn = (config.userName || '').split(' ')[0] || 'there';
                                        const tn = state.textName || state.text || 'your text';
                                        const wc = getResponseWordCount(canvasEditor);
                                        // Retrieve essay question from document
                                        const qText = extractEssayQuestion(canvasEditor);
                                        const questionInfo = qText ? `\n\nYour essay question: **${qText}**` : '';
                                        const gt = `Hi ${fn}! Welcome to the assessment phase. I've received your ${tn} diagnostic essay (${wc} words). Let's review your writing together.${questionInfo}\n\nBefore I begin marking, I need to know: **what grade are you aiming for?** This helps me tailor my feedback to where you want to be.`;
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
                                    } else {
                                        // Single-select mode
                                        actions.forEach(action => {
                                            const btn = el('button', {
                                                className: 'swml-quick-btn',
                                                textContent: action.label,
                                                onClick: () => {
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
                                            textContent: '↑ Back to top of message',
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

                            addChatMessage(msg, 'user');
                            canvasChatHistory.push({ role: 'user', content: msg });
                            chatTextarea.value = '';
                            chatTextarea.style.height = '40px';
                            chatSendBtn.style.opacity = '0.4';
                            chatSendBtn.style.pointerEvents = 'none';

                            showCanvasTyping();

                            try {
                                // Inject essay text as context — on EVERY message to prevent hallucination
                                let promptText = msg;
                                const essay = getResponseText(canvasEditor);
                                const userMsgCount = canvasChatHistory.filter(m => m.role === 'user').length;
                                const boardName = (state.board || '').toUpperCase().replace('-', ' ');
                                const subjectName = (state.subject || '').replace(/_/g, ' ');
                                const textName = state.textName || state.text || '';

                                if (essay.trim().length > 50) {
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
                                        task: 'assessment',
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
                                // If mic is recording, stop it and submit after final transcript arrives (v7.12.70)
                                if (canvasListening && canvasRecognition) {
                                    canvasRecognition.stop();
                                    // Wait for final transcript, then submit — poll briefly for content
                                    const preVal = chatTextarea.value.trim();
                                    let tries = 0;
                                    const trySubmit = () => {
                                        const val = chatTextarea.value.trim();
                                        if (val && (val !== preVal || tries > 3)) { sendCanvasMessage(); }
                                        else if (tries < 8) { tries++; setTimeout(trySubmit, 100); }
                                        else if (val) { sendCanvasMessage(); } // Submit whatever we have
                                    };
                                    setTimeout(trySubmit, 150);
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
                                        // Server fallback if localStorage is empty
                                        if (!savedChat || !savedChat.history || savedChat.history.length === 0) {
                                            try {
                                                const chatUrl = `${API.chatLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}&topicNumber=${state.topicNumber || ''}`;
                                                const serverChat = await fetch(chatUrl, { headers }).then(r => r.json());
                                                if (serverChat.success && serverChat.chat && serverChat.chat.history && serverChat.chat.history.length > 0) {
                                                    savedChat = serverChat.chat;
                                                    console.log('WML Canvas: Chat loaded from server (localStorage empty)');
                                                }
                                            } catch (e) { console.log('WML Canvas: Server chat load unavailable'); }
                                        }
                                        const hasSavedChat = savedChat && savedChat.history && savedChat.history.length > 0;

                                        // ── Unified assessment state initializer (v7.12.22) ──
                                        // Single function for ALL entry paths (Get Assessed, Diagnostic→Assessment, Re-entry).
                                        // Scans canvasChatHistory for sidebar progress + Session Complete,
                                        // checks phase status, shows Mark Complete if appropriate.
                                        async function initAssessmentState() {
                                            if (state.task !== 'assessment') return;
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

                                            // Scroll to bottom after replay
                                            setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 100);
                                        } else {
                                            // Fresh start: show greeting (delay to let CharacterCount sync)
                                            setTimeout(() => {
                                            const assessTextName = state.textName || state.text || 'your text';
                                            // Try section-based count first, fall back to full editor count, then DOM count
                                            let assessWc = getResponseWordCount(canvasEditor);
                                            if (assessWc === 0 && canvasEditor) {
                                                assessWc = canvasEditor.storage.characterCount?.words() || 0;
                                            }
                                            if (assessWc === 0) {
                                                const edEl = document.getElementById('swml-tiptap-editor');
                                                if (edEl) assessWc = (edEl.textContent || '').trim().split(/\s+/).filter(w => w.length > 0).length;
                                            }
                                            // Extract essay question from document + store in state (v7.12.33)
                                            const questionText = extractEssayQuestion(canvasEditor);
                                            if (questionText) state.question = questionText;
                                            const questionSnippet = questionText ? `\n\nYour essay question: **${questionText}**` : '';
                                            const questionHTML = questionText ? `<div style="margin-bottom:12px;padding:10px 14px;background:rgba(81,218,207,0.06);border-left:3px solid rgba(81,218,207,0.3);border-radius:0 8px 8px 0"><p style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px">Your essay question:</p><p style="font-size:13px;font-style:italic">${questionText}</p></div>` : '';
                                            const firstName = (config.userName || '').split(' ')[0] || 'there';
                                            const greetingText = `Hi ${firstName}! Welcome to the assessment phase. I've received your ${assessTextName} diagnostic essay (${assessWc} words). Let's review your writing together.${questionSnippet}\n\nBefore I begin marking, I need to know: what grade are you aiming for? This helps me tailor my feedback to where you want to be.`;
                                            const infoNote = '<div style="margin-bottom:14px;padding:10px 14px;background:rgba(83,51,237,0.08);border-left:3px solid rgba(83,51,237,0.3);border-radius:0 8px 8px 0;font-size:12px;color:rgba(255,255,255,0.6)">This assessment takes approximately <strong style="color:rgba(255,255,255,0.8)">20-25 minutes</strong>. Complete all 8 steps to receive your full score, grade, and personalised feedback.</div>';
                                            addChatMessage(`${infoNote}<div style="margin-bottom:12px"><p>Hi <strong>${firstName}</strong>! Welcome to the assessment phase.</p></div><div style="margin-bottom:12px"><p>I've received your <strong>${assessTextName}</strong> diagnostic essay (<strong>${assessWc} words</strong>). Let's review your writing together.</p></div>${questionHTML}<p>Before I begin marking, I need to know: <strong>what grade are you aiming for?</strong> This helps me tailor my feedback to where you want to be.</p>`, 'ai', greetingText);
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
                        state.task = 'assessment'; // Required for extractAndSavePlan + Mark Complete detection

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
                            // Add "Go to Assessment" 3D navigation button (v7.12.32)
                            const goAssessBtn = build3DButton('Go to Assessment', "Let's Go", () => {
                                state.task = 'assessment';
                                state.canvasTimer = 0;
                                state.step = 0;
                                renderCanvasWorkspace();
                            });
                            goAssessBtn.classList.add('swml-go-assess-btn');
                            rightPanel.appendChild(goAssessBtn);
                        }
                    } catch (e) { console.log('WML: Diagnostic completion check failed:', e); }
                })();
            }
        }

        // ── Sequence Navigation Buttons (v7.12.85) ──
        // Show Previous / Next buttons for navigating between exercise steps
        if (state.topicNumber) {
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

        // Direct assessment entry — hide diagnostic UI immediately (auto-trigger will transition)
        if (canvasInAssessment) {
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
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Inject progress bar keyframes (failsafe — CSS file may not load in time)
        if (!document.getElementById('swml-progress-keyframes')) {
            const kfStyle = document.createElement('style');
            kfStyle.id = 'swml-progress-keyframes';
            kfStyle.textContent = '@keyframes swmlProgressShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }';
            document.head.appendChild(kfStyle);
        }

        // Hide notepad during diagnostic (no assistance allowed)
        const snFab = document.querySelector('.sn-fab');
        const snPanel = document.querySelector('.sn-panel');
        if (snFab) snFab.style.display = 'none';
        if (snPanel) snPanel.style.display = 'none';
        // Also hide the vertical "Take Notes" sidebar tab (Sophicly Notes tab trigger)
        document.querySelectorAll('.sn-tab, .sn-tab-trigger, #snTabTrigger, [class*="sticky-note-tab"], [class*="notes-tab"]').forEach(t => t.style.display = 'none');
        // Hide mobile FAB trigger too
        const snFabTrigger = document.getElementById('snFabTrigger');
        if (snFabTrigger) snFabTrigger.style.display = 'none';
        // Fallback: hide any fixed element containing "Take Notes" text on the right edge
        document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]').forEach(t => {
            if (t.textContent.trim() === 'Take Notes' || t.textContent.trim() === 'TakeNotes') t.style.display = 'none';
        });

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

        // Quick comment presets
        const QUICK_COMMENTS = [
            { category: 'Issues', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', items: [
                { label: 'Spelling', text: 'Spelling error — please check and correct.' },
                { label: 'Punctuation', text: 'Punctuation needs attention here.' },
                { label: 'Grammar', text: 'Grammar issue — revise this sentence.' },
                { label: 'Comma splice', text: 'Comma splice — two independent clauses joined with just a comma. Use a full stop, semicolon, or conjunction.' },
                { label: 'More detail', text: 'More detail needed — develop this point further.' },
                { label: 'More depth', text: 'More depth needed — go beyond surface-level analysis and explore deeper meaning.' },
                { label: 'Be specific', text: 'Be more specific — avoid vague or general statements.' },
                { label: 'More perceptive', text: 'This needs to be more perceptive — show deeper understanding.' },
                { label: 'Follow structure', text: 'Follow the TTECEA structure more carefully — ensure each paragraph has all the required elements.' },
                { label: 'Five paragraphs', text: 'Remember the five paragraph essay structure — introduction, three body paragraphs, conclusion.' },
                { label: 'Discourse markers', text: 'Use discourse markers and transitional phrases to connect your ideas and improve flow.' },
            ]},
            { category: 'TTECEA', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', items: [
                { label: 'Topic sentence', text: 'Conceptual topic sentence needed — link your point to the wider theme.' },
                { label: 'Technique', text: 'Technique needed — identify the writer\'s method here (language, structure, symbolism).' },
                { label: 'Evidence', text: 'Evidence needed — embed a quote to support this point.' },
                { label: 'Inference', text: 'Inference needed — explain what this suggests about the character/theme.' },
                { label: 'Close analysis', text: 'Close analysis needed — zoom into specific words/phrases and explore connotations.' },
                { label: 'Effect 1', text: 'Effect on reader needed — how does this make the reader think or feel?' },
                { label: 'Effect 2', text: 'Second effect needed — explore an alternative interpretation or deeper impact.' },
                { label: 'Author\'s purpose', text: 'Author\'s purpose needed — why has the writer made this choice? Link to context.' },
            ]},
            { category: 'Praise', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M18 8h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/><path d="M6 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/></svg>', items: [
                { label: 'Good detail', text: 'Good detail here — well-developed point.' },
                { label: 'Perceptive', text: 'Perceptive response — this shows real insight.' },
                { label: 'Excellent analysis', text: 'Excellent close analysis — strong engagement with language.' },
                { label: 'Great topic sentence', text: 'Strong conceptual topic sentence — clear thematic link.' },
                { label: 'Well-evidenced', text: 'Well-evidenced — effective use of quotation.' },
                { label: 'Strong effect', text: 'Excellent exploration of effect on the reader.' },
                { label: 'Clear purpose', text: 'Clear understanding of the author\'s purpose — well linked to context.' },
                { label: 'Top level', text: 'Top level quality — this is exactly the standard we\'re aiming for.' },
            ]},
        ];

        function addComment(selFrom, selTo) {
            const from = selFrom ?? canvasEditor.state.selection.from;
            const to = selTo ?? canvasEditor.state.selection.to;
            if (from === to) { alert('Select some text to comment on.'); return; }
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

            QUICK_COMMENTS.forEach(cat => {
                const catEl = el('div', { className: 'swml-quick-cat' });
                catEl.appendChild(el('div', { className: 'swml-quick-cat-label', innerHTML: cat.icon + ' ' + cat.category }));
                const chipsWrap = el('div', { className: 'swml-quick-chips' });
                cat.items.forEach(item => {
                    chipsWrap.appendChild(el('button', {
                        className: 'swml-quick-chip' + (cat.category === 'Praise' ? ' swml-quick-chip-praise' : cat.category === 'TTECEA' ? ' swml-quick-chip-ttecea' : ''),
                        textContent: item.label,
                        title: item.text,
                        onClick: () => {
                            textarea.value = item.text;
                            textarea.focus();
                        }
                    }));
                });
                catEl.appendChild(chipsWrap);
                quickWrap.appendChild(catEl);
            });
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
                            // Microtask delay: let ProseMirror settle after DOM mutation before opening modal
                            requestAnimationFrame(() => addComment(capturedFrom, capturedTo));
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
        const savedContent = loadCanvasContent();

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
                ...(PaginationPlus ? [PaginationPlus.configure({
                    pageHeight: 1020,
                    pageWidth: 720,
                    pageGap: 24,
                    pageGapBorderSize: 1,
                    pageGapBorderColor: 'rgba(255,255,255,0.08)',
                    pageBreakBackground: '#16181d',
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
            content: savedContent || (state.task === 'mark_scheme' ? '<p></p>' : getDefaultEssayTemplate()),
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
            onCreate: ({ editor }) => {
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
            },
            onSelectionUpdate: ({ editor }) => {
                updateToolbarState(toolbar, editor);
            },
        });

        // ── Server-side load + topic template (async, after editor is ready) ──
        tryServerLoad().then(() => tryTopicTemplate()).then(() => {
            // Clean corrupted content from v7.11.8 (serialized selects as text)
            cleanCorruptedContent();
            // Migrate old documents — inject missing sections + dividers
            migrateDocument();
            migrateDividers();
            // Inject cover image if missing from loaded document
            tryInjectCover();
            // Build table of contents (after cover + migration)
            buildTableOfContents();
            // Inject dropdown overlays after template is ready
            setTimeout(() => buildDropdownOverlays(contentWrap), 200);
            // Re-position comment gutter after all content (cover, TOC, template) is loaded (v7.12.35)
            setTimeout(() => updateCommentGutter(), 400);

            // ── Auto-extract essay question from document for all paths (v7.12.33) ──
            const autoQ = extractEssayQuestion(canvasEditor);
            if (autoQ && !state.question) { state.question = autoQ; console.log('WML: Auto-extracted essay question:', autoQ); }

            // ── Direct Assessment Entry (v7.12.8) ──
            // When entering canvas with state.task = 'assessment' (from stepper "Get Assessed"),
            // auto-trigger the assessment transition after content loads.
            if (canvasInAssessment && diagCompleteBtn) {
                // Force button visible and show the right panel briefly for transition code
                diagCompleteBtn.style.display = '';
                rightPanel.style.display = '';
                // Pre-hide guidance so it doesn't flash
                rightPanel.classList.add('swml-canvas-plan-fading');
                rightPanel.classList.add('swml-canvas-plan-hidden');
                setTimeout(() => {
                    // Programmatically trigger the Mark Complete flow
                    diagCompleteBtn.click();
                    // Hide the confirm modal instantly (user shouldn't see "Ready to submit?")
                    const overlay = canvas.querySelector('.swml-confirm-overlay');
                    if (overlay) overlay.style.opacity = '0';
                    // Auto-confirm immediately
                    setTimeout(() => {
                        const confirmBtn = canvas.querySelector('.swml-confirm-submit');
                        if (confirmBtn) confirmBtn.click();
                        // Clean up invisible overlay
                        const ol = canvas.querySelector('.swml-confirm-overlay');
                        if (ol) ol.remove();
                    }, 20);
                }, 100);
            }
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
                fetch(config.restUrl + `canvas/load-signoff?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}${state.topicNumber ? '&topicNumber=' + state.topicNumber : ''}`, { headers })
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

                sections.push({ type, label, readonly: isReadonly, marks, maxMarks, text: contentText, html: contentHTML });
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

    // Word count colour tiers: orange (< min) → yellow (min→target) → green (target→ideal) → purple gradient (ideal+)
    function getWordCountColour(wc) {
        if (wc > canvasWordIdeal) return 'linear-gradient(90deg, #2c003e, #5333ed)';  // Brand purple gradient — excellent
        if (wc >= canvasWordTarget) return '#1CD991';   // Green — target reached
        if (wc >= canvasWordMinimum) return '#F1C40F';  // Yellow — minimum reached
        return '#E67E22';                                // Orange — below minimum
    }
    function getWordCountLabel(wc) {
        if (wc > canvasWordIdeal) return `${wc} / ${canvasWordTarget} words ✓ Excellent length!`;
        if (wc >= canvasWordTarget) return `${wc} / ${canvasWordTarget} words ✓ Target reached`;
        if (wc >= canvasWordMinimum) return `${wc} / ${canvasWordTarget} words — Minimum reached`;
        return `${wc} / ${canvasWordTarget} words`;
    }

    function getWordTargets(marks) {
        if (!marks || marks < 20) return { target: 0, minimum: 0, ideal: 0, usesWordCount: false };
        // Simple range model (Neil's approximation):
        // 20–34 marks → 650 words (450 minimum to submit), 800 ideal
        // 35+ marks  → 750 words (500 minimum to submit), 1000 ideal
        if (marks <= 34) return { target: 650, minimum: 450, ideal: 800, usesWordCount: true };
        return { target: 750, minimum: 500, ideal: 1000, usesWordCount: true };
    }

    // Board-level default marks when topic data doesn't specify
    const BOARD_DEFAULT_MARKS = {
        aqa: { shakespeare: 30, modern_text: 30, '19th_century': 30, poetry_anthology: 30, unseen_poetry: 24 },
        eduqas: { shakespeare: 40, modern: 40, literature: 40, poetry: 40, unseen: 24 }, // dual: A=15 + B=25
        edexcel: { shakespeare: 40, modern: 40, '19th_century': 40, poetry: 30, unseen: 20 }, // dual: a=20 + b=20
        'edexcel-igcse': { heritage: 25, literature: 25, modern: 30 },
        ocr: { literature: 40, poetry: 40 },
        sqa: { critical_reading: 20 },
        ccea: { prose: 25 },
    };

    function getDefaultMarks(board, subject) {
        return BOARD_DEFAULT_MARKS[board]?.[subject] || 30;
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
        const responseSections = editorEl.querySelectorAll('[data-section-type="response"]');
        if (responseSections.length === 0) {
            // No section blocks — legacy template, count everything
            return editor.storage.characterCount?.words() || 0;
        }
        let total = 0;
        responseSections.forEach(section => {
            const text = section.textContent || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            total += words.length;
        });
        return total;
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

    function buildQuestionSection(questionText, extractText, extractLocation, marks, aos, partLabel) {
        const label = partLabel ? `Question & Extract — ${partLabel}` : 'Question & Extract';
        let inner = '';
        if (extractText) {
            inner += `<h3>Extract</h3>`;
            if (extractLocation) inner += `<p><em>${escapeHTML(extractLocation)}</em></p>`;
            // Preserve line breaks in extract
            const lines = extractText.split('\n').map(l => `<p>${escapeHTML(l) || '&nbsp;'}</p>`).join('');
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
                `<p><em>Introduce your argument BRIEFLY.</em></p><p></p>`);
            const bodyCount = marks >= 40 ? 4 : 3;
            for (let i = 1; i <= bodyCount; i++) {
                html += sectionHTML('plan', `Plan: Body Paragraph ${i}${prefix}`, true, null,
                    `<p><em>Focus only on KEY IDEA #${i}.</em></p><p></p>`);
            }
            html += sectionHTML('plan', `Plan: Conclusion${prefix}`, true, null,
                `<p><em>Restate thesis. Central purpose. Universal message. CRUCIAL!</em></p><p></p>`);
        } else {
            const paraCount = getParagraphCount(marks);
            for (let i = 1; i <= paraCount; i++) {
                html += sectionHTML('plan', `Plan: Paragraph ${i}${prefix}`, true, null, `<p></p>`);
            }
        }
        return html;
    }

    function buildIUMVCCPlanSection(partLabel) {
        const prefix = partLabel ? ` — ${partLabel}` : '';
        return sectionHTML('plan', `Plan: Introduction${prefix}`, true, null, `<p><em>Hook the reader. Establish your voice and position.</em></p><p></p>`) +
            sectionHTML('plan', `Plan: Urgency${prefix}`, true, null, `<p><em>Why does this matter NOW? Create emotional pressure.</em></p><p></p>`) +
            sectionHTML('plan', `Plan: Methodology${prefix}`, true, null, `<p><em>What is the solution? Paint a vivid picture of how it works.</em></p><p></p>`) +
            sectionHTML('plan', `Plan: Vision${prefix}`, true, null, `<p><em>What does the future look like if we act? Use imagery.</em></p><p></p>`) +
            sectionHTML('plan', `Plan: Counter-Argument${prefix}`, true, null, `<p><em>Acknowledge the opposition, then dismantle it.</em></p><p></p>`) +
            sectionHTML('plan', `Plan: Conclusion${prefix}`, true, null, `<p><em>Call to action. Leave a lasting image.</em></p><p></p>`);
    }

    function buildOutlineSection(aos, partLabel, marks) {
        const aoList = (aos || 'AO1,AO2,AO3').split(',').map(a => a.trim());
        const aoPrompts = {
            AO1: 'What is the writer saying about human life? (Key ideas & interpretations)',
            AO2: 'How does the writer say it? (Language, structure, symbolism)',
            AO3: 'Why does the writer say it? (Context — social, historical, cultural)',
            AO4: 'How does this compare to the other text? (Connections & contrasts)',
        };
        const fullEssay = needsFullEssayStructure(marks);
        const prefix = partLabel ? ` — ${partLabel}` : '';
        let html = '';
        if (fullEssay) {
            html += sectionHTML('outline', `Outline: Introduction${prefix}`, true, null,
                `<p><em>Hook (AO1): Quote, question, metaphor, or historical fact</em></p><p></p>` +
                `<p><em>Building sentences (AO3): Context / counter-argument</em></p><p></p>` +
                `<p><em>Thesis (AO1): Key idea 1, Key idea 2, Key idea 3</em></p><p></p>`);
            const bodyCount = marks >= 40 ? 4 : 3;
            for (let i = 1; i <= bodyCount; i++) {
                let aoInner = '';
                aoInner += `<p><em>WHAT? Topic sentence (AO1): Key idea ${i}</em></p><p></p>`;
                aoInner += `<p><em>HOW? Supporting sentences (AO2): Terminology → Evidence → Close analysis → Effects</em></p><p></p>`;
                aoInner += `<p><em>WHY? Concluding sentences (AO2/AO3): Author's purpose / context</em></p><p></p>`;
                html += sectionHTML('outline', `Outline: Body Paragraph ${i}${prefix}`, true, null, aoInner);
            }
            html += sectionHTML('outline', `Outline: Conclusion${prefix}`, true, null,
                `<p><em>Restated thesis (AO1)</em></p><p></p>` +
                `<p><em>Controlling concept (AO1): Link thesis to central theme</em></p><p></p>` +
                `<p><em>Central purpose (AO1/AO3): How does this reflect the author's purpose?</em></p><p></p>` +
                `<p><em>Universal message (AO1): What is the MAIN message of the text?</em></p><p></p>`);
        } else {
            const paraCount = getParagraphCount(marks);
            for (let i = 1; i <= paraCount; i++) {
                let aoInner = '';
                aoList.forEach(ao => {
                    aoInner += `<p><em>${ao}: ${aoPrompts[ao] || ao}</em></p><p></p>`;
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
    function buildFeedbackSection(markSplit) {
        const s = markSplit || { intro: 3, body: 7, conclusion: 6 };
        let html = '';
        html += sectionHTML('feedback', `Feedback: Introduction (— / ${s.intro})`, false, null,
            `<p><em>Feedback and revised paragraph example will appear after assessment.</em></p>`);
        for (let i = 1; i <= 3; i++) {
            html += sectionHTML('feedback', `Feedback: Body ${i} (— / ${s.body})`, false, null,
                `<p><em>Feedback and revised paragraph example will appear after assessment.</em></p>`);
        }
        html += sectionHTML('feedback', `Feedback: Conclusion (— / ${s.conclusion})`, false, null,
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
            inner += `<p><em>What I need to improve:</em></p><p></p>`;
            inner += `<p><em>How I will improve it:</em></p><p></p>`;
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

    function buildSelfAssessmentSection() {
        const skills = [
            { cat: 'Introduction', items: ['Hook', 'Building Sentences', 'Thesis'] },
            { cat: 'Body Paragraphs', items: ['Topic Sentence', 'Technical Terms', 'Evidence', 'Close Analysis', 'Effects on Reader', "Author's Purpose", 'Context'] },
            { cat: 'Conclusion', items: ['Restated Thesis', 'Controlling Concept', 'Central Purpose', 'Universal Message'] },
            { cat: 'Academic Writing', items: ['Language Sophistication', 'Vocabulary Precision', 'Sentence Structure', 'Discourse Markers'] },
        ];
        let inner = `<p><em>Rate your confidence in each skill (1 = basic, 5 = expert):</em></p>`;
        skills.forEach(s => {
            inner += `<h3>${s.cat}</h3>`;
            s.items.forEach(item => { inner += `<p>${item}: — / 5</p>`; });
        });
        return sectionHTML('action', 'Self-Assessment', true, null, inner);
    }

    function buildAnalyticsSection() {
        const inner =
            `<h3>Top Missed Areas</h3>` +
            `<p><em>Specify AO1, AO2, AO3, etc.</em></p><p></p>` +
            `<h3>Opt-outs This Attempt</h3>` +
            `<p><em>Number of opt-outs:</em> —</p>` +
            `<p><em>Opt-out items (AO1, AO2, etc.):</em></p><p></p>` +
            `<h3>Trend: Repeated Errors</h3>` +
            `<p><em>Specify AO1, AO2, AO3, etc.</em></p><p></p>` +
            `<h3>Trend: Improvements</h3>` +
            `<p><em>Specify AO1, AO2, AO3, etc.</em></p><p></p>` +
            `<h3>Biggest Challenges</h3>` +
            `<p><em>Specify AO1, AO2, AO3, etc.</em></p><p></p>`;
        return sectionHTML('feedback', 'Analytics', true, null, inner);
    }

    function buildActionPlanSection(mode) {
        let inner =
            `<h3>Grade Goal</h3>` +
            `<p><em>Your target grade:</em> —</p>` +
            `<h3>3 Priorities</h3>` +
            `<p><em>Specify AO1, AO2, AO4, etc.</em></p><p></p>` +
            `<h3>Short-term Aims</h3>` +
            `<p><em>Specify AO1, AO2, AO4, etc.</em></p><p></p>` +
            `<h3>Action 1: Course & Resources</h3>` +
            `<p><em>Specify AO1, AO2, AO4, etc.</em></p><p></p>` +
            `<h3>Action 2: Lessons</h3>` +
            `<p><em>Specify AO1, AO2, AO4, etc.</em></p><p></p>` +
            `<h3>Action 3: Support</h3>` +
            `<p><em>Specify AO1, AO2, AO4, etc.</em></p><p></p>`;
        // Next Topic only appears in redraft — student chooses their next topic after completing the cycle
        if (mode === 'redraft') {
            inner +=
                `<h3>Next Topic</h3>` +
                `<p><em>Your next topic:</em> —</p>` +
                `<p><em>Reason for this choice:</em></p><p></p>`;
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

        // Feedback + scores + improvement + sign-off (always appended, populated later by AI)
        // Mark split per paragraph — AQA 30 marks: Intro /3, Body /7 each, Conclusion /6
        // Scale proportionally for other totals
        const feedbackMarks = isDual
            ? (parseInt(topicData.part_a_marks) || 0) + (parseInt(topicData.part_b_marks) || 0)
            : parseInt(topicData.marks) || getDefaultMarks(state.board, state.subject);
        const scale = feedbackMarks / 30;
        const markSplit = {
            intro: Math.round(3 * scale),
            body: Math.round(7 * scale),
            conclusion: Math.round(6 * scale),
        };
        html += dividerHTML('FEEDBACK');
        html += buildFeedbackSection(markSplit);
        html += dividerHTML('RESULTS');
        html += buildScoresSection(feedbackMarks);
        html += buildSelfAssessmentSection();
        html += buildAnalyticsSection();
        html += buildActionPlanSection(mode);
        html += buildSignoffSection();

        return html;
    }

    /**
     * Mark Scheme Study TipTap document template (v7.12.88).
     * Board-specific AO descriptions with editable student response areas.
     * Sections: Question → AO Criteria → Top-Grade Thinking → Self-Assessment → Notes.
     */
    function getMarkSchemeTemplate(topicData) {
        const board = (state.board || '').toLowerCase();
        const marks = topicData ? (parseInt(topicData.marks) || 30) : 30;
        const questionText = topicData?.question_text || topicData?.part_a_question || '';

        // Board-specific AO descriptions
        const AO_DATA = {
            aqa: {
                aos: [
                    { id: 'AO1', weight: '~50%', title: 'The "WHAT" — Interpretation & Argument',
                      desc: 'Read, understand and respond to texts. Maintain a critical style and develop an informed personal response. Use textual references, including quotations, to support and illustrate interpretations.',
                      topLevel: 'Critical, exploratory, conceptualised response to task and whole text. Judicious use of precise references to support interpretation(s).' },
                    { id: 'AO2', weight: '~30%', title: 'The "HOW" — Language, Form & Structure',
                      desc: 'Analyse the language, form and structure used by a writer to create meanings and effects, using relevant subject terminology where appropriate.',
                      topLevel: 'Analysis of the writer\'s methods with subject terminology used judiciously. Exploration of effects of writer\'s methods to create meanings.' },
                    { id: 'AO3', weight: '~20%', title: 'The "WHY" — Context',
                      desc: 'Show understanding of the relationships between texts and the contexts in which they were written.',
                      topLevel: 'Exploration of ideas/perspectives/contextual factors shown by specific, detailed links between context/text/task.' },
                    { id: 'AO4', weight: 'SPaG', title: 'The "POLISH" — Precision of Expression',
                      desc: 'Use a range of vocabulary and sentence structures for clarity, purpose and effect, with accurate spelling and punctuation.',
                      topLevel: 'A compelling, fluent writing style with a wide vocabulary and varied sentence structures.' },
                ],
                structure: 'Introduction → 3 Body Paragraphs (TTECEA+C) → Conclusion',
            },
            eduqas: {
                aos: [
                    { id: 'AO1', weight: '~33%', title: 'The "WHAT" — Interpretation & Argument',
                      desc: 'Read, understand and respond to texts. Students should be able to maintain a critical style and develop an informed personal response. Use textual references, including quotations, to support interpretations.',
                      topLevel: 'Sensitive and evaluative approach with a perceptive understanding. Seamless integration of extract and whole text.' },
                    { id: 'AO2', weight: '~33%', title: 'The "HOW" — Language, Form & Structure',
                      desc: 'Analyse the language, form and structure used by a writer to create meanings and effects, using relevant subject terminology where appropriate.',
                      topLevel: 'Assured reference to meanings and effects with cohesive evaluation of the writer\'s craft.' },
                    { id: 'AO3', weight: '~33%', title: 'The "WHY" — Context (Equally Weighted!)',
                      desc: 'Show understanding of the relationships between texts and the contexts in which they were written. In EDUQAS, context is worth a FULL THIRD of your marks — it must be central to your argument, not bolted on.',
                      topLevel: 'Assured understanding of relationships between texts and contexts, integrated convincingly throughout.' },
                ],
                structure: 'Introduction → 3 Body Paragraphs (TTECEA+C) → Conclusion',
            },
            'edexcel-igcse': {
                aos: [
                    { id: 'AO1', weight: '~40%', title: 'The "WHAT" — Knowledge & Perceptive Engagement',
                      desc: 'Show knowledge and understanding of a range of texts. Produce a personal and informed response with assured engagement.',
                      topLevel: 'Assured and perceptive engagement with the text. Discriminating references that precisely support interpretation.' },
                    { id: 'AO2', weight: '~40%', title: 'The "HOW" — Cohesive Evaluation of Methods',
                      desc: 'Analyse and evaluate the ways in which writers use linguistic, structural and presentational features to achieve effects and engage the reader.',
                      topLevel: 'Cohesive evaluation of the writer\'s methods with convincing analysis of effects on the reader.' },
                    { id: 'AO4', weight: '~20%', title: 'The "WHY" — Context (Integrated Convincingly)',
                      desc: 'Relate texts to their social, cultural and historical traditions. No extract is provided — you must select quotations from memory.',
                      topLevel: 'Convincing contextual integration that shows how historical/social forces drove the author\'s message.' },
                ],
                structure: 'Introduction → 3 Body Paragraphs (TTECEA+C) → Conclusion',
            },
        };

        // Fallback for boards not yet configured
        const boardData = AO_DATA[board] || AO_DATA['aqa'];

        let html = '';

        // ── Question section (read-only) ──
        if (questionText) {
            html += sectionHTML('question', 'Question', false, null,
                `<p><strong>Your essay question:</strong></p><p><em>${escapeHTML(questionText)}</em></p><p><strong>Total marks: ${marks}</strong></p>`
            );
        }

        // ── Divider: ASSESSMENT OBJECTIVES ──
        html += dividerHTML('ASSESSMENT OBJECTIVES');

        // Each AO: read-only description + editable student response
        boardData.aos.forEach(ao => {
            // Read-only AO criteria
            html += sectionHTML('mark_scheme_ao', `${ao.id}: ${ao.title}`, false, null,
                `<h3>${ao.id} — ${ao.title} <em style="font-weight:400;opacity:0.6">(${ao.weight} of marks)</em></h3>`
                + `<p>${escapeHTML(ao.desc)}</p>`
                + `<p><strong>Top level:</strong> <em>"${escapeHTML(ao.topLevel)}"</em></p>`
            );
            // Editable student response
            html += sectionHTML('mark_scheme_response', `My understanding of ${ao.id}`, true, null,
                `<p></p>`
            );
        });

        // ── Divider: TOP-GRADE THINKING ──
        html += dividerHTML('TOP-GRADE THINKING');

        html += sectionHTML('mark_scheme_ao', 'Key Definitions', false, null,
            `<h3>Key Definitions for Top-Grade Thinkers</h3>`
            + `<p><strong>Perceptive:</strong> Seeing what others miss — noticing subtle details, patterns, and layers of meaning not immediately obvious.</p>`
            + `<p><strong>Detailed:</strong> Using specific, well-chosen evidence and explaining why it\'s significant. Zoom in on individual words.</p>`
            + `<p><strong>Critical:</strong> Evaluating the author\'s argument, not just accepting it. Exploring ambiguities and weighing different interpretations.</p>`
            + `<p><strong>Conceptual:</strong> Connecting specific moments in the text to the author\'s bigger argument about the world.</p>`
        );

        html += sectionHTML('mark_scheme_response', 'Grade boundary differences', true, null,
            `<p><em>What separates a Grade 5 from a Grade 7? What separates a Grade 7 from a Grade 9?</em></p><p></p>`
        );

        // ── Divider: ESSAY STRUCTURE ──
        html += dividerHTML('ESSAY STRUCTURE');

        html += sectionHTML('mark_scheme_ao', 'Paragraph Toolkit: TTECEA+C', false, null,
            `<h3>${boardData.structure}</h3>`
            + `<p><strong>T</strong> — Topic Sentence: Your conceptual point (AO1)</p>`
            + `<p><strong>T</strong> — Technique: The literary method the author uses (AO2)</p>`
            + `<p><strong>E</strong> — Evidence: Your anchor quote, with inference (AO1/AO2)</p>`
            + `<p><strong>C</strong> — Close Analysis: Break the quote down — connotations, word choice, sounds (AO2)</p>`
            + `<p><strong>E</strong> — Effect: How this manipulates the reader\'s focus, emotions, or thoughts (AO2)</p>`
            + `<p><strong>A</strong> — Author\'s Purpose: Why the author made this choice (AO1)</p>`
            + `<p><strong>+C</strong> — Context: How the concepts and techniques are driven by the historical context (AO3)</p>`
        );

        // ── Divider: SELF-ASSESSMENT ──
        html += dividerHTML('SELF-ASSESSMENT');

        html += sectionHTML('mark_scheme_response', 'My strongest AO', true, null,
            `<p><em>Look at your assessed essay. Which Assessment Objective was your strongest? Why?</em></p><p></p>`
        );

        html += sectionHTML('mark_scheme_response', 'My weakest AO', true, null,
            `<p><em>Which Assessment Objective needs the most improvement? What specifically went wrong?</em></p><p></p>`
        );

        html += sectionHTML('mark_scheme_response', 'Redraft action plan', true, null,
            `<p><em>Based on what you\'ve learned about the mark scheme, what three specific things will you change in your redraft?</em></p>`
            + `<p>1. </p><p>2. </p><p>3. </p>`
        );

        // ── Divider: NOTES ──
        html += dividerHTML('NOTES');

        html += sectionHTML('mark_scheme_response', 'My notes', true, null,
            `<p><em>Use this space for any additional notes from the videos or your own research.</em></p><p></p>`
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
        const targets = getWordTargets(totalMarks);
        canvasWordTarget = targets.target || 650;
        canvasWordMinimum = targets.minimum || 450;
        canvasWordIdeal = targets.ideal || 800;
        canvasUsesWordCount = targets.usesWordCount;
        console.log(`WML: Word targets — ${totalMarks} marks (board default: ${boardDefault}) → min: ${canvasWordMinimum}, target: ${canvasWordTarget}, ideal: ${canvasWordIdeal}`);
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
        // Mark scheme has its own document — skip server load of the essay (v7.12.90)
        if (state.task === 'mark_scheme') {
            console.log('WML: Skipping server load — mark scheme uses its own template');
            return;
        }
        try {
            const url = `${API.canvasLoad}?board=${encodeURIComponent(state.board)}&text=${encodeURIComponent(state.text)}${state.topicNumber ? '&topicNumber=' + state.topicNumber : ''}`;
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
        if (!state.topicNumber || state.topicNumber < 1) return;

        // Single fetch — used for both word targets and template generation
        const topicData = await fetchTopicData();

        // Always set word targets (even for resumed docs)
        if (topicData) {
            setWordTargetsFromTopic(topicData);
            refreshWordCountUI();
        }

        // Already has section blocks? Don't overwrite (user resumed a saved document)
        const currentHTML = canvasEditor.getHTML();
        if (currentHTML.includes('data-section-type')) {
            console.log('WML: Document already has sections, skipping topic template');
            return;
        }

        if (!topicData) {
            console.log('WML: No topic data available, keeping default template');
            return;
        }

        // Mark scheme study uses a different template entirely (v7.12.90)
        // Force-inject: ignore "already has sections" check — the essay sections
        // may have leaked from localStorage or server load; mark scheme is a separate document.
        if (state.task === 'mark_scheme') {
            const currentMS = canvasEditor.getHTML();
            // Only skip if we already have mark_scheme sections (resumed mark scheme doc)
            if (currentMS.includes('mark_scheme_ao') || currentMS.includes('mark_scheme_response')) {
                console.log('WML: Mark scheme document already loaded, skipping template');
                return;
            }
            console.log('WML: Generating mark scheme study template');
            const msTemplate = getMarkSchemeTemplate(topicData);
            if (canvasEditor) {
                canvasEditor.commands.setContent(msTemplate, false);
                console.log('WML: Mark scheme template injected');
            }
            return;
        }

        // Determine mode from state
        let mode = 'diagnostic';
        if (state.phase === 'redraft' || state.draftType?.includes('redraft')) {
            mode = 'redraft';
        } else if (state.mode === 'exam_prep') {
            mode = 'exam_practice';
        }

        console.log(`WML: Generating topic template — topic ${state.topicNumber}, mode: ${mode}`);
        const template = getDocumentTemplate(mode, topicData);

        // Only inject if we still have the default template (guard against race)
        if (canvasEditor && !canvasEditor.getHTML().includes('data-section-type')) {
            canvasEditor.commands.setContent(template, false);
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
    }

    /**
     * Document Migration System
     * Compares loaded document sections against the current template.
     * Injects missing sections (Analytics, Action Plan, SA, Sign-off, etc.)
     * without touching existing student content.
     */
    function migrateDocument() {
        if (!canvasEditor) return;
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
    function tryInjectCover() {
        if (!canvasEditor || !config.covers) return;
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

        // Collect sections from TipTap model (skip dividers)
        const sections = [];
        canvasEditor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'sectionBlock') {
                const type = node.attrs.sectionType || 'response';
                const label = node.attrs.label || '';
                if (type !== 'cover' && type !== 'divider') sections.push({ type, label, pos });
            }
        });

        if (sections.length < 3) return; // Not enough sections for a TOC

        // Group sections: top-level entries + children for accordion groups
        const tocEntries = [];
        const groupMap = {}; // prefix → { entry, children }
        const groupPrefixes = ['Feedback', 'Plan', 'Outline'];

        sections.forEach(s => {
            const matchedPrefix = groupPrefixes.find(p => s.label.startsWith(p + ':'));
            if (matchedPrefix) {
                if (!groupMap[matchedPrefix]) {
                    const displayName = matchedPrefix === 'Plan' ? 'Essay Plan' : matchedPrefix;
                    const entry = { type: s.type, label: s.label, displayLabel: displayName, children: [], isGroup: true };
                    groupMap[matchedPrefix] = entry;
                    tocEntries.push(entry);
                }
                // Add child with cleaned label (part after "Prefix: ")
                const childLabel = s.label.replace(/^[^:]+:\s*/, '');
                groupMap[matchedPrefix].children.push({ type: s.type, label: s.label, displayLabel: childLabel });
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
            dot.style.background = SECTION_COLOURS[entry.type] || '#888';
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

            // Click to scroll (on the row)
            row.addEventListener('click', (e) => {
                if (e.target.closest('.swml-toc-chevron')) return; // let chevron handle its own click
                const editor = document.getElementById('swml-tiptap-editor');
                if (!editor) return;
                let target = null;
                editor.querySelectorAll('[data-section-label]').forEach(el => {
                    if (el.getAttribute('data-section-label') === entry.label) target = el;
                });
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                    subDot.style.background = SECTION_COLOURS[child.type] || '#888';
                    subItem.appendChild(subDot);

                    const subLabel = document.createElement('span');
                    subLabel.className = 'swml-toc-label';
                    subLabel.textContent = sectionNum + '.' + (ci + 1) + ' ' + child.displayLabel;
                    subItem.appendChild(subLabel);

                    subItem.addEventListener('click', () => {
                        const editor = document.getElementById('swml-tiptap-editor');
                        if (!editor) return;
                        let target = null;
                        editor.querySelectorAll('[data-section-label]').forEach(el => {
                            if (el.getAttribute('data-section-label') === child.label) target = el;
                        });
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        // ── Completion Buttons — driven by config ──
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

        // ── Sequence Navigation for lightweight canvas (v7.12.85) ──
        if (state.topicNumber) {
            const FB_PHASE1_SEQ = [
                { id: 'diagnostic', task: '', label: 'Write Essay', render: () => { state.task = ''; state.canvasTimer = 0; window.WML.renderCanvasWorkspace(); } },
                { id: 'assessment', task: 'assessment', label: 'Get Assessed', render: () => { state.task = 'assessment'; state.canvasTimer = 0; state.step = 0; window.WML.renderCanvasWorkspace(); } },
                { id: 'feedback_discussion', task: 'feedback_discussion', label: 'Discuss Feedback', render: () => { state.task = 'feedback_discussion'; window.WML.renderFeedbackDiscussionCanvas(); } },
            ];
            const FB_PHASE2_SEQ = [
                { id: 'mark_scheme', task: 'mark_scheme', label: 'Mark Scheme', render: () => { state.task = 'mark_scheme'; state.canvasTimer = 0; window.WML.renderCanvasWorkspace(); } },
                { id: 'model_answer', task: 'model_answer_video', label: 'Model Answer', render: () => { state.task = 'model_answer_video'; window.WML.renderFeedbackDiscussionCanvas(); } },
                { id: 'planning', task: 'planning', label: 'Plan Redraft', render: () => { window.WML.selectTask('planning'); } },
                { id: 'outlining', task: 'outlining', label: 'Outline Essay', render: () => { window.WML.selectTask('outlining'); } },
                { id: 'polishing', task: 'polishing', label: 'Polish Essay', render: () => { window.WML.selectTask('polishing'); } },
                { id: 'reassessment', task: 'assessment', label: 'Get Reassessed', render: () => { state.task = 'assessment'; state.canvasTimer = 0; state.step = 0; window.WML.renderCanvasWorkspace(); } },
            ];
            const fbSeq = state.phase === 'redraft' ? FB_PHASE2_SEQ : FB_PHASE1_SEQ;
            const fbCurrentIdx = fbSeq.findIndex(s => s.task === taskKey);
            if (fbCurrentIdx >= 0) {
                const fbNavWrap = el('div', { className: 'swml-seq-nav' });
                const fbPrev = fbCurrentIdx > 0 ? fbSeq[fbCurrentIdx - 1] : null;
                const fbNext = fbCurrentIdx < fbSeq.length - 1 ? fbSeq[fbCurrentIdx + 1] : null;
                if (fbPrev) {
                    fbNavWrap.appendChild(el('button', {
                        className: 'swml-seq-btn swml-seq-prev',
                        innerHTML: `<span class="swml-seq-arrow">\u2190</span> <span class="swml-seq-label">${fbPrev.label}</span>`,
                        onClick: () => { closeCanvasOverlay(); fbPrev.render(); }
                    }));
                }
                if (fbNext) {
                    fbNavWrap.appendChild(el('button', {
                        className: 'swml-seq-btn swml-seq-next',
                        innerHTML: `<span class="swml-seq-label">${fbNext.label}</span> <span class="swml-seq-arrow">\u2192</span>`,
                        onClick: () => { closeCanvasOverlay(); fbNext.render(); }
                    }));
                }
                guidePanel.appendChild(fbNavWrap);
            }
        }

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
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

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

    // ── Register assessment functions on WML namespace ──
    WML.renderCanvasWorkspace = renderCanvasWorkspace;
    WML.closeCanvasOverlay = closeCanvasOverlay;
    WML.renderFeedbackDiscussionCanvas = renderFeedbackDiscussionCanvas;
    WML.saveCanvasChat = saveCanvasChat;
    WML.loadCanvasChat = loadCanvasChat;
    WML.clearCanvasChat = clearCanvasChat;
    WML.saveCanvasContent = saveCanvasContent;
    WML.loadCanvasContent = loadCanvasContent;
    WML.exportToDocx = exportToDocx;
    WML.getDocumentTemplate = getDocumentTemplate;
    WML.buildTableOfContents = buildTableOfContents;

})();
