/**
 * Sophicly Writing Mastery Lab — Selection-Coach Module (v7.19.26)
 *
 * Tiptap-style single floating box on text selection inside the inline-coaching
 * env (task='exam_crib' + future polish env). Replaces the chip + menu
 * two-click flow from v7.19.24-25 with a single prompt-box: "Ask Sophia..."
 * textarea + quick-action buttons + send. Reply renders Socratic-only inside
 * the box (never replaces text inline — pedagogy red line).
 *
 * Pedagogy: Socratic-only. Sophia never grades, never writes for student. See
 * protocols/shared/modules/inline-coaching-core.md.
 *
 * Exposed: window.WML.SelectionChip = { mount, unmount, ACTION_MAP, ... }.
 * Mounted imperatively from the inline-coaching render branch in wml-assessment.js.
 */
(function () {
    'use strict';

    if (!window.WML) { console.warn('WML SelectionChip: WML namespace missing'); return; }
    const { el } = window.WML;
    if (typeof el !== 'function') { console.warn('WML SelectionChip: el helper missing'); return; }

    // ── Quick-action vocabulary (locked to inline-coaching-core.md L194-229) ──
    const ACTION_MAP = {
        universal: ['fix-spelling', 'fix-grammar', 'fix-punctuation', 'adjust-tone', 'tighten'],
        litAnalysis: ['check-concept-strength', 'check-ttecea-element', 'check-vocabulary-precision', 'check-author-purpose', 'check-ao3-anchor', 'check-quote-presence'],
        paragraphOnly: ['check-coherence', 'check-structure-adherence', 'check-ao-coverage'],
        cw: ['check-sensory-variety', 'check-scene-structure-beats', 'check-show-dont-tell'],
    };

    const ACTION_LABELS = {
        'fix-spelling': 'Fix spelling',
        'fix-grammar': 'Fix grammar',
        'fix-punctuation': 'Fix punctuation',
        'adjust-tone': 'Adjust tone',
        'tighten': 'Tighten',
        'check-concept-strength': 'Concept strength',
        'check-ttecea-element': 'TTECEA element',
        'check-vocabulary-precision': 'Vocabulary precision',
        'check-author-purpose': 'Author purpose',
        'check-ao3-anchor': 'AO3 anchor',
        'check-quote-presence': 'Quote presence',
        'check-coherence': 'Coherence',
        'check-structure-adherence': 'Structure adherence',
        'check-ao-coverage': 'AO coverage',
        'check-sensory-variety': 'Sensory variety',
        'check-scene-structure-beats': 'Scene-structure beats',
        'check-show-dont-tell': 'Show-don’t-tell',
    };

    const SECTION_GROUP_LABELS = {
        universal: 'Polish',
        litAnalysis: 'Literary analysis',
        paragraphOnly: 'Paragraph-level',
        cw: 'Creative writing',
    };

    // ── Module-scoped state ──
    let _ctx = null;
    let _box = null;                 // floating prompt box DOM
    let _activeSelection = null;     // last valid selection info, frozen at box-open
    let _bound = false;
    let _selectionTimer = null;
    let _conversationHistory = [];   // shared across selections within a mount
    let _conversationId = '';
    let _currentRange = null;        // live Range used to follow layout shifts
    let _autoFollow = true;          // false once user drags — they own the spot
    let _resizeObs = null;
    let _onWindowResize = null;
    let _lastSelectionInfo = null;   // remembers last opened selection for re-open
    let _continueBtn = null;         // sticky footer in right panel

    // ── Helpers ──

    function _wordCount(s) {
        return (s || '').trim().split(/\s+/).filter(Boolean).length;
    }

    function classifyScope(text, anchorEl, focusEl) {
        const wc = _wordCount(text);
        if (wc <= 1) return 'word';
        const anchorP = anchorEl && (anchorEl.closest ? anchorEl.closest('p, li, h1, h2, h3, h4') : null);
        const focusP = focusEl && (focusEl.closest ? focusEl.closest('p, li, h1, h2, h3, h4') : null);
        const sameParagraph = anchorP && focusP && anchorP === focusP;
        if (wc <= 35 && sameParagraph) return 'sentence';
        return 'paragraph';
    }

    function isEditableSection(domNode) {
        if (!domNode) return false;
        let cur = domNode.nodeType === 3 ? domNode.parentElement : domNode;
        while (cur && cur !== document.body) {
            if (cur.classList && cur.classList.contains('swml-section-block')) {
                if (cur.getAttribute('data-readonly') === 'true') return false;
                if (cur.getAttribute('data-editable') === 'false') return false;
                const type = cur.getAttribute('data-section-type');
                return type === 'plan' || type === 'response';
            }
            cur = cur.parentElement;
        }
        return false;
    }

    function extractSectionContext(domNode) {
        if (!domNode) return '';
        let cur = domNode.nodeType === 3 ? domNode.parentElement : domNode;
        while (cur && cur !== document.body) {
            if (cur.classList && cur.classList.contains('swml-section-block')) break;
            cur = cur.parentElement;
        }
        if (!cur || cur === document.body) return '';
        const text = (cur.textContent || '').replace(/\s+/g, ' ').trim();
        const words = text.split(/\s+/);
        if (words.length <= 400) return text;
        return words.slice(0, 400).join(' ') + '…';
    }

    function _filterActionsForScope(scope, taskCtx) {
        const groups = [];
        groups.push({ key: 'universal', actions: ACTION_MAP.universal });
        groups.push({ key: 'litAnalysis', actions: ACTION_MAP.litAnalysis });
        if (scope === 'paragraph') {
            groups.push({ key: 'paragraphOnly', actions: ACTION_MAP.paragraphOnly });
        }
        if (taskCtx && taskCtx.subject === 'creative_writing') {
            groups.push({ key: 'cw', actions: ACTION_MAP.cw });
        }
        return groups;
    }

    function buildPrompt(action, selection, sectionContext, taskCtx, freeText) {
        const lines = [
            '## Inline Coaching Invocation',
            '',
            '- **Action:** ' + (action || 'freetext'),
            '- **Selection:** ' + JSON.stringify(selection || ''),
            '- **Section context:** ' + JSON.stringify(sectionContext || ''),
            '- **Task context:** ' + JSON.stringify(taskCtx || {}),
        ];
        if (freeText) {
            lines.push('');
            lines.push('**Student message:** ' + freeText);
        }
        return lines.join('\n');
    }

    function _getOffsetParent() {
        if (!_ctx) return null;
        const editorEl = _ctx.canvasEditor && _ctx.canvasEditor.options && _ctx.canvasEditor.options.element;
        if (!editorEl) return null;
        return editorEl.closest('.swml-canvas-editor') || editorEl.parentElement;
    }

    function _removeBox() {
        if (_resizeObs) { try { _resizeObs.disconnect(); } catch (_) {} _resizeObs = null; }
        if (_onWindowResize) {
            window.removeEventListener('resize', _onWindowResize);
            _onWindowResize = null;
        }
        if (_box && _box.parentNode) _box.parentNode.removeChild(_box);
        _box = null;
        _currentRange = null;
        _autoFollow = true;
        // Surface the "Continue conversation" button in the right panel so the
        // student can reopen the inline coach box at their last selection
        // without having to re-highlight. Only shown when a thread exists.
        if (_lastSelectionInfo && _conversationHistory.length > 0) {
            _ensureContinueBtn();
        }
    }

    // ── Right panel — persistent reply thread ───────────────────────

    function _ensurePanelOpen() {
        const panel = _ctx && _ctx.sophiaPanel;
        if (!panel) return;
        panel.classList.remove('swml-coach-panel--collapsed');
    }

    function _hideEmptyState() {
        const messagesHost = _ctx && _ctx.messagesHost;
        if (!messagesHost) return;
        const empty = messagesHost.querySelector('.swml-coach-panel-empty');
        if (empty) empty.remove();
    }

    function _appendMessage(role, content, opts) {
        const messagesHost = _ctx && _ctx.messagesHost;
        if (!messagesHost) return null;
        _hideEmptyState();
        _ensurePanelOpen();
        const formatAI = (window.WML && window.WML.formatAI) || ((s) => s);
        const stripAIInternals = (window.WML && window.WML.stripAIInternals) || ((s) => s);
        const SENDER_HTML = (window.WML && window.WML.SENDER_HTML) || 'Sophia';

        // Selection echo (only on the first user turn for this box) — sits
        // ABOVE the user bubble as a quoted lead-in, mirroring the prior-art
        // chat-toolbar selection rendering.
        if (role === 'user' && opts && opts.selection) {
            const echo = el('div', { className: 'swml-coach-selection-echo' });
            const truncated = (opts.selection || '').slice(0, 200);
            echo.textContent = opts.selection.length > 200 ? truncated + '…' : truncated;
            messagesHost.appendChild(echo);
        }

        // Build a training-env-style bubble: .swml-bubble.{ai|user} >
        // .swml-bubble-content > [.swml-bubble-header (ai only)] + .swml-bubble-body
        const bubble = el('div', { className: 'swml-bubble ' + (role === 'ai' ? 'ai' : 'user') });
        const inner = el('div', { className: 'swml-bubble-content' });
        if (role === 'ai') {
            const headerEl = el('div', { className: 'swml-bubble-header' });
            headerEl.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
            inner.appendChild(headerEl);
            const body = el('div', { className: 'swml-bubble-body' });
            body.innerHTML = formatAI(stripAIInternals(content || ''));
            inner.appendChild(body);
        } else {
            inner.appendChild(el('p', { textContent: content || '' }));
        }
        bubble.appendChild(inner);
        messagesHost.appendChild(bubble);
        messagesHost.scrollTop = messagesHost.scrollHeight;
        return bubble;
    }

    function _appendTyping() {
        const messagesHost = _ctx && _ctx.messagesHost;
        if (!messagesHost) return null;
        _hideEmptyState();
        const SENDER_HTML = (window.WML && window.WML.SENDER_HTML) || 'Sophia';
        const bubble = el('div', { className: 'swml-bubble ai swml-coach-typing' });
        const inner = el('div', { className: 'swml-bubble-content' });
        const headerEl = el('div', { className: 'swml-bubble-header' });
        headerEl.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
        inner.appendChild(headerEl);
        const body = el('div', { className: 'swml-bubble-body' });
        body.innerHTML = '<span class="swml-coach-dots"><span>.</span><span>.</span><span>.</span></span>';
        inner.appendChild(body);
        bubble.appendChild(inner);
        messagesHost.appendChild(bubble);
        messagesHost.scrollTop = messagesHost.scrollHeight;
        return bubble;
    }

    // Re-derive the box position from the LIVE selection Range. Used after
    // canvas reflow (LD sidebar toggle, window resize, fullscreen toggle, …).
    function _positionBoxFromRange() {
        if (!_box || !_currentRange || !_autoFollow) return;
        let rect;
        try { rect = _currentRange.getBoundingClientRect(); }
        catch (_) { return; }
        if (!rect || (rect.width === 0 && rect.height === 0)) return;
        _positionBox(rect);
    }

    function _positionBox(rect) {
        const offsetParent = _getOffsetParent();
        if (!offsetParent || !_box) return;
        const opRect = offsetParent.getBoundingClientRect();
        const boxW = 480;
        const gap = 12;

        let left = rect.left - opRect.left + offsetParent.scrollLeft;
        const maxLeft = Math.max(8, opRect.width - boxW - 8);
        left = Math.max(8, Math.min(left, maxLeft));

        // Default: open BELOW selection. Flip above if it would overflow.
        const estBoxH = Math.min(window.innerHeight * 0.55, 420);
        const wouldOverflow = (rect.bottom + gap + estBoxH) > window.innerHeight;
        let top;
        if (wouldOverflow && rect.top > estBoxH + gap) {
            top = rect.top - opRect.top + offsetParent.scrollTop - estBoxH - gap;
            _box.classList.add('swml-coach-box--above');
        } else {
            top = rect.bottom - opRect.top + offsetParent.scrollTop + gap;
            _box.classList.remove('swml-coach-box--above');
        }

        _box.style.top = top + 'px';
        _box.style.left = left + 'px';
        _box.style.width = boxW + 'px';
    }

    // ── The single floating coach box (entry-point only) ────────────
    // Box has: selection echo + textarea + send + scope-filtered actions.
    // After submit, box closes; replies render in the right-side Sophia panel.

    function _ensureContinueBtn() {
        const panel = _ctx && _ctx.sophiaPanel;
        if (!panel || _continueBtn) return;
        const btn = el('button', {
            className: 'swml-coach-continue-btn',
            type: 'button',
            innerHTML: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:-2px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Continue conversation',
            title: 'Reopen the inline coach box at your last selection',
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!_lastSelectionInfo) return;
                // Re-derive a fresh rect from the live Range so the box anchors
                // wherever the source text now sits.
                let freshRect = _lastSelectionInfo.rect;
                if (_lastSelectionInfo.range) {
                    try {
                        const r = _lastSelectionInfo.range.getBoundingClientRect();
                        if (r && (r.width !== 0 || r.height !== 0)) freshRect = r;
                    } catch (_) {}
                }
                const reopenInfo = Object.assign({}, _lastSelectionInfo, { rect: freshRect });
                _openBox(reopenInfo);
            },
        });
        panel.appendChild(btn);
        _continueBtn = btn;
    }

    function _removeContinueBtn() {
        if (_continueBtn && _continueBtn.parentNode) _continueBtn.parentNode.removeChild(_continueBtn);
        _continueBtn = null;
    }

    function _openBox(selectionInfo) {
        _removeBox();
        _removeContinueBtn();
        _activeSelection = selectionInfo;
        _lastSelectionInfo = selectionInfo;

        const offsetParent = _getOffsetParent();
        if (!offsetParent) return;

        const box = el('div', { className: 'swml-coach-box', 'data-scope': selectionInfo.scope });

        // 1. Drag handle + selection echo. The whole top strip is grabbable.
        const handle = el('div', { className: 'swml-coach-handle' });
        handle.appendChild(el('span', { className: 'swml-coach-handle-grip', innerHTML: '&#8942;&#8942;' }));
        const selPreview = (selectionInfo.text || '').slice(0, 200);
        const quote = el('div', {
            className: 'swml-coach-quote',
            textContent: selectionInfo.text.length > 200 ? selPreview + '…' : selPreview,
        });
        handle.appendChild(quote);
        box.appendChild(handle);

        // 2. Input row — textarea + mic + send
        const inputRow = el('div', { className: 'swml-coach-input-row' });
        const textarea = el('textarea', {
            className: 'swml-coach-input',
            placeholder: 'Ask Sophia… or pick a quick-action below',
            rows: 1,
        });
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });

        // Mic — Web Speech API, mirrors the training-env mic wiring at
        // wml-assessment.js:2738. Pushes interim + final transcripts into
        // the textarea.
        const SVG_MIC = (window.WML && window.WML.SVG_MIC) || '🎤';
        const SVG_MIC_STOP = (window.WML && window.WML.SVG_MIC_STOP) || '■';
        let coachRecognition = null;
        let coachListening = false;
        let coachMicRetries = 0;
        const MIC_MAX_RETRIES = 3;
        const micBtn = el('button', {
            className: 'swml-coach-mic',
            type: 'button',
            innerHTML: SVG_MIC,
            title: 'Voice input',
        });
        micBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) { alert('Voice input is not supported in this browser.'); return; }
            if (coachListening && coachRecognition) { coachRecognition.stop(); return; }
            coachMicRetries = 0;
            if (!coachRecognition) {
                coachRecognition = new SR();
                coachRecognition.continuous = true;
                coachRecognition.interimResults = true;
                coachRecognition.lang = 'en-GB';
                let finalTranscript = '';
                coachRecognition.onresult = (ev) => {
                    coachMicRetries = 0;
                    let interim = '';
                    for (let i = ev.resultIndex; i < ev.results.length; i++) {
                        if (ev.results[i].isFinal) finalTranscript += ev.results[i][0].transcript + ' ';
                        else interim += ev.results[i][0].transcript;
                    }
                    textarea.value = finalTranscript + interim;
                    textarea.dispatchEvent(new Event('input'));
                };
                coachRecognition.onstart = () => {
                    coachListening = true;
                    finalTranscript = textarea.value || '';
                    micBtn.innerHTML = SVG_MIC_STOP;
                    micBtn.classList.add('swml-mic-active');
                };
                coachRecognition.onend = () => {
                    coachListening = false;
                    micBtn.innerHTML = SVG_MIC;
                    micBtn.classList.remove('swml-mic-active');
                    textarea.focus();
                };
                coachRecognition.onerror = (ev) => {
                    if (ev.error === 'no-speech' && coachMicRetries < MIC_MAX_RETRIES) {
                        coachMicRetries++;
                        setTimeout(() => {
                            try { coachRecognition.start(); }
                            catch (_) {
                                coachListening = false;
                                micBtn.innerHTML = SVG_MIC;
                                micBtn.classList.remove('swml-mic-active');
                            }
                        }, 200);
                        return;
                    }
                    coachListening = false;
                    micBtn.innerHTML = SVG_MIC;
                    micBtn.classList.remove('swml-mic-active');
                    if (ev.error === 'network' || ev.error === 'not-allowed') {
                        const isHTTP = window.location.protocol === 'http:';
                        alert(isHTTP
                            ? 'Voice input requires a secure (HTTPS) connection.'
                            : 'Voice input failed — check microphone permissions.');
                    }
                };
            }
            try { coachRecognition.start(); }
            catch (err) { console.warn('WML SelectionChip mic start failed', err); }
        });

        const sendBtn = el('button', {
            className: 'swml-coach-send',
            type: 'button',
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
            title: 'Send',
        });
        inputRow.appendChild(textarea);
        inputRow.appendChild(micBtn);
        inputRow.appendChild(sendBtn);
        box.appendChild(inputRow);

        // 3. Quick-actions row(s) — grouped, scope-filtered
        const groups = _filterActionsForScope(selectionInfo.scope, _ctx.taskCtx);
        const actionsWrap = el('div', { className: 'swml-coach-actions' });
        groups.forEach((group) => {
            const groupEl = el('div', { className: 'swml-coach-action-group' });
            groupEl.appendChild(el('div', {
                className: 'swml-coach-action-label',
                textContent: SECTION_GROUP_LABELS[group.key] || group.key,
            }));
            const btnRow = el('div', { className: 'swml-coach-action-row' });
            group.actions.forEach((action) => {
                const btn = el('button', {
                    className: 'swml-coach-action-btn',
                    type: 'button',
                    textContent: ACTION_LABELS[action] || action,
                    'data-action': action,
                    title: ACTION_LABELS[action] || action,
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        send(action, '');
                    },
                });
                btnRow.appendChild(btn);
            });
            groupEl.appendChild(btnRow);
            actionsWrap.appendChild(groupEl);
        });
        box.appendChild(actionsWrap);

        // 4. Snap-back button — returns box to its original anchor near the
        //    selection rect after the student has dragged it elsewhere.
        const snapBtn = el('button', {
            className: 'swml-coach-snap',
            type: 'button',
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/></svg>',
            title: 'Snap back to selection',
        });
        box.appendChild(snapBtn);

        // 5. Close button
        const closeBtn = el('button', {
            className: 'swml-coach-close',
            type: 'button',
            innerHTML: '×',
            title: 'Close',
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); _removeBox(); },
        });
        box.appendChild(closeBtn);

        // 6. Resize handles — 4 edges + 4 corners. Mirror the extract panel
        //    pattern at wml-assessment.js:5499.
        ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].forEach((dir) => {
            const h = el('div', {
                className: 'swml-coach-rh swml-coach-rh-' + (dir.length > 1 ? 'corner' : 'edge') + ' swml-coach-rh-' + dir,
            });
            h.dataset.dir = dir;
            box.appendChild(h);
        });

        // Mount + pin selection
        offsetParent.appendChild(box);
        _box = box;
        _currentRange = selectionInfo.range || null;
        _autoFollow = true;
        _positionBox(selectionInfo.rect);
        box.addEventListener('mousedown', (e) => { e.stopPropagation(); });

        // Resize handlers — track per-direction drag, clamp to a min width/height.
        const RH_MIN_W = 320, RH_MIN_H = 220;
        let resizing = false, resizeDir = '', resizeSX = 0, resizeSY = 0,
            resizeSW = 0, resizeSH = 0, resizeSL = 0, resizeST = 0;
        const onResizeMove = (e) => {
            if (!resizing) return;
            e.preventDefault();
            const dx = e.clientX - resizeSX;
            const dy = e.clientY - resizeSY;
            let w = resizeSW, h = resizeSH, l = resizeSL, t = resizeST;
            if (resizeDir.indexOf('e') > -1) w = Math.max(RH_MIN_W, resizeSW + dx);
            if (resizeDir.indexOf('w') > -1) { w = Math.max(RH_MIN_W, resizeSW - dx); l = resizeSL + (resizeSW - w); }
            if (resizeDir.indexOf('s') > -1) h = Math.max(RH_MIN_H, resizeSH + dy);
            if (resizeDir.indexOf('n') > -1) { h = Math.max(RH_MIN_H, resizeSH - dy); t = resizeST + (resizeSH - h); }
            box.style.width = w + 'px';
            box.style.height = h + 'px';
            box.style.left = l + 'px';
            box.style.top = t + 'px';
            // Resizing implies the user owns the spot now — stop auto-following
            // layout shifts until they hit snap-back.
            _autoFollow = false;
            box.classList.add('swml-coach-box--floating');
        };
        const endResize = () => {
            resizing = false;
            resizeDir = '';
            box.classList.remove('swml-coach-box--resizing');
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', endResize);
        };
        box.querySelectorAll('.swml-coach-rh').forEach((h) => {
            h.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                resizing = true;
                resizeDir = h.dataset.dir;
                const r = box.getBoundingClientRect();
                const offsetParentEl = _getOffsetParent();
                const opRect = offsetParentEl ? offsetParentEl.getBoundingClientRect() : { left: 0, top: 0 };
                resizeSX = e.clientX;
                resizeSY = e.clientY;
                resizeSW = r.width;
                resizeSH = r.height;
                resizeSL = parseFloat(box.style.left) || 0;
                resizeST = parseFloat(box.style.top) || 0;
                box.classList.add('swml-coach-box--resizing');
                document.addEventListener('mousemove', onResizeMove);
                document.addEventListener('mouseup', endResize);
            });
        });

        // Follow layout shifts: ResizeObserver on the offset parent catches
        // sidebar / fullscreen / panel-collapse reflows; window resize covers
        // browser resizes. Both re-derive position from the live Range, so
        // the box always tracks the highlighted text — until the user drags
        // it (then they own the spot until they hit snap-back).
        if (typeof ResizeObserver !== 'undefined') {
            try {
                _resizeObs = new ResizeObserver(() => { _positionBoxFromRange(); });
                _resizeObs.observe(offsetParent);
            } catch (_) { _resizeObs = null; }
        }
        _onWindowResize = () => { _positionBoxFromRange(); };
        window.addEventListener('resize', _onWindowResize);

        // Snap-back: re-derive from the live Range so it tracks the current
        // selection rect, not the stale open-time coordinates.
        snapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            _autoFollow = true;
            box.classList.remove('swml-coach-box--floating');
            _positionBoxFromRange();
        });

        // ── Drag handling ──
        // Whole top strip (handle + selection echo) is grabbable. Drag clamps
        // box to the viewport so it can't be dragged completely off-screen.
        let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
        const onMove = (e) => {
            if (!dragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const offsetParentEl = _getOffsetParent();
            const opRect = offsetParentEl ? offsetParentEl.getBoundingClientRect() : null;
            const boxRect = box.getBoundingClientRect();
            let nextLeft = startLeft + dx;
            let nextTop = startTop + dy;
            if (opRect) {
                // Clamp inside the offset-parent so the drag stays usable.
                const maxLeft = opRect.width - boxRect.width;
                const maxTop = (offsetParentEl.scrollHeight || opRect.height) - boxRect.height;
                nextLeft = Math.max(0, Math.min(nextLeft, Math.max(0, maxLeft)));
                nextTop = Math.max(0, Math.min(nextTop, Math.max(0, maxTop)));
            }
            box.style.left = nextLeft + 'px';
            box.style.top = nextTop + 'px';
        };
        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            box.classList.remove('swml-coach-box--dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', endDrag);
        };
        const startDrag = (e) => {
            if (e.button !== 0) return;
            // Don't start drag from interactive elements inside the handle.
            if (e.target.closest('button')) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(box.style.left) || 0;
            startTop = parseFloat(box.style.top) || 0;
            // User now owns the position — stop auto-following layout shifts
            // until they hit snap-back.
            _autoFollow = false;
            box.classList.add('swml-coach-box--dragging', 'swml-coach-box--floating');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', endDrag);
            e.preventDefault();
            e.stopPropagation();
        };
        handle.addEventListener('mousedown', startDrag);

        let pending = false;

        const send = async (action, freeText) => {
            if (pending) return;
            const trimmed = (freeText || '').trim();
            const isAction = !!action;
            if (!isAction && !trimmed) return;

            pending = true;
            sendBtn.disabled = true;
            textarea.disabled = true;
            actionsWrap.querySelectorAll('button').forEach(b => { b.disabled = true; });

            // Snapshot the selection-info NOW (before we close the box —
            // it'll be needed for follow-up replies even after the box is gone).
            const sel = _activeSelection;
            const userLabel = isAction ? (ACTION_LABELS[action] || action) : trimmed;

            // Echo user turn into the right panel + start typing indicator.
            // Echo selection only on the first user turn for this box (subsequent
            // follow-ups in the same box reference the same selection).
            const echoSelection = !box.dataset.swmlSent;
            _appendMessage('user', userLabel, echoSelection ? { selection: sel.text } : null);
            const typingEl = _appendTyping();
            box.dataset.swmlSent = '1';

            if (trimmed) {
                _conversationHistory.push({ role: 'user', content: trimmed });
            } else if (isAction) {
                _conversationHistory.push({ role: 'user', content: '[' + action + ']' });
            }

            // Box stays open — student can keep responding without re-selecting.
            // Clear textarea + reset height so the next turn feels clean.
            textarea.value = '';
            textarea.style.height = 'auto';

            const promptText = buildPrompt(
                isAction ? action : 'freetext',
                sel.text,
                sel.sectionContext,
                _ctx.taskCtx,
                trimmed
            );

            try {
                const apiPost = window.WML && window.WML.apiPost;
                const API = window.WML && window.WML.API;
                const state = window.WML && window.WML.state;
                if (!apiPost || !API || !API.chat) {
                    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
                    _appendMessage('ai', 'Chat infrastructure not loaded.');
                    return;
                }

                const body = {
                    prompt: promptText,
                    botId: 'wml-claude',
                    chatId: _conversationId,
                    history: _conversationHistory.slice(-12),
                    board: state ? state.board : '',
                    subject: state ? state.subject : '',
                    text: state ? state.text : '',
                    task: state ? state.task : 'exam_crib',
                    topicNumber: state ? (state.topicNumber || 0) : 0,
                };

                const res = await apiPost(API.chat, body);
                if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
                if (res && res.success && res.reply) {
                    _conversationHistory.push({ role: 'assistant', content: res.reply });
                    _appendMessage('ai', res.reply);
                } else {
                    _appendMessage('ai', (res && res.message) ? res.message : 'No reply received.');
                }
            } catch (err) {
                if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
                console.error('WML SelectionChip coach error', err);
                _appendMessage('ai', 'Sorry, something went wrong. Please try again.');
            } finally {
                // Re-enable inline controls so the student can keep responding
                // in the same box without re-selecting. Box stays open.
                pending = false;
                sendBtn.disabled = false;
                textarea.disabled = false;
                actionsWrap.querySelectorAll('button').forEach(b => { b.disabled = false; });
                try { textarea.focus(); } catch (_) {}
            }
        };

        sendBtn.addEventListener('click', () => send(null, textarea.value));
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(null, textarea.value);
            }
        });

        setTimeout(() => { try { textarea.focus(); } catch (_) {} }, 30);
    }

    // ── Selection event handler ─────────────────────────────────────

    // _getEditorEl — re-resolves the LIVE editor element each call, in case
    // TipTap rebuilt it during a layout reflow (theme toggle / fullscreen /
    // sidebar). Falls back to DOM lookup by id if the closure handle is stale.
    function _getEditorEl() {
        if (_ctx && _ctx.canvasEditor && _ctx.canvasEditor.options && _ctx.canvasEditor.options.element) {
            return _ctx.canvasEditor.options.element;
        }
        return document.getElementById('swml-tiptap-editor') ||
            document.querySelector('.ProseMirror');
    }

    function _recomputeSelection() {
        if (!_ctx) { console.debug('[SelectionChip] no ctx'); return; }
        const editorEl = _getEditorEl();
        if (!editorEl) { console.debug('[SelectionChip] no editor element'); return; }

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);

        if (!editorEl.contains(range.commonAncestorContainer)) {
            console.debug('[SelectionChip] selection outside editor', range.commonAncestorContainer);
            return;
        }

        const text = sel.toString().trim();
        if (!text) return;

        if (!isEditableSection(sel.anchorNode)) {
            console.debug('[SelectionChip] anchor not in plan/response', sel.anchorNode);
            return;
        }
        if (!isEditableSection(sel.focusNode)) {
            console.debug('[SelectionChip] focus not in plan/response', sel.focusNode);
            return;
        }

        let rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            // Fallback: try first client rect (multi-line ranges can return 0x0
            // bounding rect on some browsers / after transform shifts).
            try {
                const rects = range.getClientRects();
                if (rects && rects.length > 0) rect = rects[0];
            } catch (_) {}
            if (!rect || (rect.width === 0 && rect.height === 0)) {
                console.debug('[SelectionChip] zero-rect range — skipping', range);
                return;
            }
        }

        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode);
        const focusEl = sel.focusNode && (sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode);
        const scope = classifyScope(text, anchorEl, focusEl);
        const sectionContext = extractSectionContext(anchorEl);

        let rangeClone = null;
        try { rangeClone = range.cloneRange(); } catch (_) {}

        const selectionInfo = { text, scope, sectionContext, rect, anchorEl, focusEl, range: rangeClone };
        console.debug('[SelectionChip] opening box', { scope, textLen: text.length });
        _openBox(selectionInfo);
    }

    function _scheduleRecompute(e) {
        // Only fire when the gesture originated inside the live editor —
        // protects against random page-wide selections triggering the chip.
        if (e && e.target) {
            const editorEl = _getEditorEl();
            if (!editorEl || !editorEl.contains(e.target)) return;
        }
        if (_selectionTimer) clearTimeout(_selectionTimer);
        _selectionTimer = setTimeout(() => {
            _selectionTimer = null;
            _recomputeSelection();
        }, 80);
    }

    function _onDocumentMouseDown(e) {
        if (_box && _box.contains(e.target)) return;
        if (_hint && _hint.contains(e.target)) return;
        // Outside click → close box (but preserve hint, since student may still
        // want to discover the feature).
        _removeBox();
    }

    function _onKeyDown(e) {
        if (e.key === 'Escape') {
            if (_box) { _removeBox(); return; }
        }
    }

    // ── Mount / unmount ─────────────────────────────────────────────

    function mount(ctx) {
        if (_bound) {
            console.warn('WML SelectionChip: already mounted, unmounting first');
            unmount();
        }
        if (!ctx || !ctx.canvasEditor) {
            console.warn('WML SelectionChip: mount called without canvasEditor');
            return { unmount };
        }
        _ctx = ctx;
        _conversationHistory = [];
        _conversationId = 'crib_' + Date.now();
        // v7.19.37: document-level delegation so listeners survive TipTap
        // editor rebuilds (theme toggle / fullscreen / sidebar reflow can
        // detach the editor element). _scheduleRecompute filters by ancestry.
        document.addEventListener('mouseup', _scheduleRecompute);
        document.addEventListener('touchend', _scheduleRecompute);
        document.addEventListener('keyup', _scheduleRecompute);
        document.addEventListener('mousedown', _onDocumentMouseDown);
        document.addEventListener('keydown', _onKeyDown);

        _bound = true;
        console.log('WML SelectionChip v7.19.37: mounted (document-level delegation)');
        return { unmount };
    }

    function unmount() {
        if (!_bound) return;
        document.removeEventListener('mouseup', _scheduleRecompute);
        document.removeEventListener('touchend', _scheduleRecompute);
        document.removeEventListener('keyup', _scheduleRecompute);
        document.removeEventListener('mousedown', _onDocumentMouseDown);
        document.removeEventListener('keydown', _onKeyDown);
        if (_selectionTimer) { clearTimeout(_selectionTimer); _selectionTimer = null; }
        _removeBox();
        _removeContinueBtn();
        _activeSelection = null;
        _lastSelectionInfo = null;
        _conversationHistory = [];
        _conversationId = '';
        _ctx = null;
        _bound = false;
        console.log('WML SelectionChip: unmounted');
    }

    window.WML.SelectionChip = {
        mount,
        unmount,
        ACTION_MAP,
        ACTION_LABELS,
        buildPrompt,
        classifyScope,
        isEditableSection,
        extractSectionContext,
    };
})();
