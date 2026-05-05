/**
 * Sophicly Writing Mastery Lab — Selection-Coach Module (v7.19.42)
 *
 * Tiptap-style coach box opened from the canvas selection toolbar's Sophia
 * button (`.swml-sel-btn.swml-sel-sophia` in wml-assessment.js). Box has:
 * selection echo + textarea + mic + send + scope-filtered quick-actions +
 * drag / resize / snap-back / auto-follow on layout reflow. Replies render
 * in the right Sophia panel (persistent thread, localStorage-backed).
 *
 * v7.19.42: dropped the standalone "Sophia" chip — collision with the canvas
 * selection toolbar (Comment / Copy / Note) on short selections. Toolbar is
 * now the single host; Sophia button calls `WML.SelectionChip.openBox()`.
 *
 * Pedagogy: Socratic-only. Sophia never grades, never writes for student. See
 * protocols/shared/modules/inline-coaching-core.md.
 *
 * Exposed: window.WML.SelectionChip = { mount, unmount, openBox, ACTION_MAP, ... }.
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
    let _box = null;                  // full prompt box (opens on toolbar Sophia button)
    let _activeSelection = null;     // last valid selection info, frozen at box-open
    let _bound = false;
    let _conversationHistory = [];   // shared across selections within a mount
    let _conversationId = '';
    let _currentRange = null;        // live Range used to follow layout shifts
    let _autoFollow = true;          // false once user drags — they own the spot
    let _resizeObs = null;
    let _onWindowResize = null;
    let _detachWatcher = null;       // v7.19.46: watches for box detachment (theme toggle / canvas re-render)
    let _onCanvasScroll = null;      // v7.19.47: tracks .swml-canvas-content scroll → reposition
    let _scrollHost = null;          // resolved scroll container; cleared on _removeBox
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
        // v7.19.40: anchor the box inside the .swml-canvas-content scroll
        // container so the box rides the doc as the student scrolls. The
        // container is position:relative (per wml-canvas.css L264), so
        // absolute children position correctly within it.
        const editorEl = _getEditorEl();
        if (!editorEl) return null;
        return editorEl.closest('.swml-canvas-content') ||
            editorEl.closest('.swml-canvas-editor') ||
            editorEl.parentElement;
    }

    function _removeBox() {
        if (_resizeObs) { try { _resizeObs.disconnect(); } catch (_) {} _resizeObs = null; }
        if (_detachWatcher) { try { _detachWatcher.disconnect(); } catch (_) {} _detachWatcher = null; }
        if (_onWindowResize) {
            window.removeEventListener('resize', _onWindowResize);
            _onWindowResize = null;
        }
        if (_onCanvasScroll && _scrollHost) {
            try { _scrollHost.removeEventListener('scroll', _onCanvasScroll); } catch (_) {}
        }
        _onCanvasScroll = null;
        _scrollHost = null;
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

    // ── Persistence ─────────────────────────────────────────────────
    // localStorage per board+text+task so the right Sophia panel survives
    // page refresh. Stores the rendered thread (role / content / optional
    // selection echo) AND the conversation history sent to the API.

    function _storageKey() {
        if (!_ctx || !_ctx.taskCtx) return '';
        const t = _ctx.taskCtx;
        return 'swml_coach_thread_' + (t.board || '') + '_' + (t.text || '') + '_' + (t.task || 'exam_crib');
    }

    function _saveHistory(thread) {
        const key = _storageKey();
        if (!key) return;
        try {
            localStorage.setItem(key, JSON.stringify({
                thread,
                history: _conversationHistory,
                lastSelection: _lastSelectionInfo ? {
                    text: _lastSelectionInfo.text,
                    sectionContext: _lastSelectionInfo.sectionContext,
                    scope: _lastSelectionInfo.scope,
                } : null,
                ts: Date.now(),
            }));
        } catch (_) {}
    }

    function _loadHistory() {
        const key = _storageKey();
        if (!key) return null;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (_) { return null; }
    }

    function _renderedThread() {
        // Snapshot the panel's current messages as plain data for re-render
        // after page reload.
        const messagesHost = _ctx && _ctx.messagesHost;
        if (!messagesHost) return [];
        return Array.from(messagesHost.querySelectorAll('.swml-coach-msg, .swml-coach-selection-echo, .swml-bubble'))
            .map((node) => {
                if (node.classList.contains('swml-coach-selection-echo')) {
                    return { kind: 'echo', content: node.textContent || '' };
                }
                if (node.classList.contains('swml-bubble')) {
                    const isAi = node.classList.contains('ai');
                    const body = node.querySelector('.swml-bubble-body');
                    const userP = node.querySelector('p');
                    return {
                        kind: 'bubble',
                        role: isAi ? 'ai' : 'user',
                        content: isAi
                            ? (body ? body.innerHTML : '')
                            : (userP ? userP.textContent : ''),
                        isHTML: !!isAi,
                    };
                }
                return null;
            }).filter(Boolean);
    }

    function _hydrateFromHistory() {
        const stored = _loadHistory();
        if (!stored || !stored.thread || stored.thread.length === 0) return;
        const messagesHost = _ctx && _ctx.messagesHost;
        if (!messagesHost) return;
        _hideEmptyState();
        stored.thread.forEach((entry) => {
            if (entry.kind === 'echo') {
                const echo = el('div', { className: 'swml-coach-selection-echo', textContent: entry.content || '' });
                messagesHost.appendChild(echo);
            } else if (entry.kind === 'bubble') {
                const SENDER_HTML = (window.WML && window.WML.SENDER_HTML) || 'Sophia';
                const bubble = el('div', { className: 'swml-bubble ' + (entry.role === 'ai' ? 'ai' : 'user') });
                const inner = el('div', { className: 'swml-bubble-content' });
                if (entry.role === 'ai') {
                    const headerEl = el('div', { className: 'swml-bubble-header' });
                    headerEl.appendChild(el('span', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
                    inner.appendChild(headerEl);
                    const body = el('div', { className: 'swml-bubble-body' });
                    body.innerHTML = entry.content || '';
                    inner.appendChild(body);
                } else {
                    inner.appendChild(el('p', { textContent: entry.content || '' }));
                }
                bubble.appendChild(inner);
                messagesHost.appendChild(bubble);
            }
        });
        if (Array.isArray(stored.history)) _conversationHistory = stored.history.slice();
        // Show Continue button if a thread exists, since the user has no
        // active selection on reload.
        if (_conversationHistory.length > 0) _ensureContinueBtn();
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
        // Persist after each turn so refresh restores the thread.
        _saveHistory(_renderedThread());
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

    // ── Public opener ──────────────────────────────────────────────
    // v7.19.42: chip dropped — toolbar Sophia button opens the box directly.
    // Caller supplies a Range + the selected text; we derive scope, section
    // context, and the bounding rect. Range is cloned defensively so caller
    // can collapse/remove the native selection (toolbar removal does this).

    function openBox(opts) {
        console.log('[SelectionChip] openBox called', {
            bound: _bound,
            hasOpts: !!opts,
            hasRange: !!(opts && opts.range),
            hasText: !!(opts && opts.selectedText),
            textLen: opts && opts.selectedText ? opts.selectedText.length : 0,
            hasRect: !!(opts && opts.rect),
        });
        if (!_bound) {
            console.error('[SelectionChip] openBox called before mount — chip module never mounted. Check that inline-coaching render branch fired.');
            return;
        }
        if (!opts || !opts.range || !opts.selectedText) {
            console.error('[SelectionChip] openBox missing range/selectedText', opts);
            return;
        }
        const range = opts.range;
        const text = String(opts.selectedText || '').trim();
        if (!text) {
            console.warn('[SelectionChip] openBox empty text after trim');
            return;
        }

        // Derive anchor/focus elements from range endpoints.
        const startNode = range.startContainer;
        const endNode = range.endContainer;
        const anchorEl = startNode && (startNode.nodeType === 3 ? startNode.parentElement : startNode);
        const focusEl = endNode && (endNode.nodeType === 3 ? endNode.parentElement : endNode);

        // Bounding rect: prefer caller-supplied (toolbar already had one) —
        // fall back to live range. Falls back to first client rect if 0×0.
        let rect = opts.rect;
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            try { rect = range.getBoundingClientRect(); } catch (_) { rect = null; }
        }
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            try {
                const rects = range.getClientRects();
                if (rects && rects.length > 0) rect = rects[0];
            } catch (_) {}
        }
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            console.debug('[SelectionChip] openBox: zero-rect range, skipping');
            return;
        }

        const scope = classifyScope(text, anchorEl, focusEl);
        const sectionContext = extractSectionContext(anchorEl);

        let rangeClone = null;
        try { rangeClone = range.cloneRange(); } catch (_) {}

        const selectionInfo = {
            text, scope, sectionContext, rect, anchorEl, focusEl,
            range: rangeClone,
        };
        _openBox(selectionInfo);
    }

    // Re-derive the box position from the LIVE selection Range. Used after
    // canvas reflow (LD sidebar toggle, window resize, fullscreen toggle, …).
    function _positionBoxFromRange() {
        if (!_box || !_currentRange || !_autoFollow) return;
        // v7.19.46: theme toggle / canvas re-render can detach .swml-canvas-content
        // (box's offset parent), removing the box from the DOM. Re-attach to
        // the current parent before positioning so the chat survives reflows.
        _ensureBoxAttached();
        let rect;
        try { rect = _currentRange.getBoundingClientRect(); }
        catch (_) { return; }
        if (!rect || (rect.width === 0 && rect.height === 0)) return;
        _positionBox(rect);
    }

    function _ensureBoxAttached() {
        if (!_box) return;
        if (_box.isConnected) return;
        // v7.19.47: box now lives on document.body (position:fixed). Body
        // doesn't get rebuilt on theme toggle / canvas re-render, so the
        // box survives. Re-append to body if some external cleanup detached.
        document.body.appendChild(_box);
        console.log('[SelectionChip] box re-attached to document.body');
    }

    function _positionBox(rect) {
        if (!_box) return;
        // v7.19.47: box uses position:fixed anchored to document.body.
        // rect is viewport-coords (from getBoundingClientRect), so we apply
        // it directly — no offset-parent / scrollTop math. Survives theme
        // toggle / canvas re-render because body never detaches. Vertical
        // scroll on .swml-canvas-content is tracked by a scroll listener
        // (re-fires _positionBoxFromRange).
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const boxW = 480;
        const gap = 12;
        const estBoxH = Math.min(vh * 0.55, 420);

        // Horizontal: align to selection left, clamp to viewport.
        let left = rect.left;
        const maxLeft = Math.max(8, vw - boxW - 8);
        left = Math.max(8, Math.min(left, maxLeft));

        // Default: open BELOW. Flip above if it would overflow viewport bottom.
        let top;
        const wouldOverflowBottom = (rect.bottom + gap + estBoxH) > vh;
        if (wouldOverflowBottom && rect.top > estBoxH + gap) {
            top = rect.top - estBoxH - gap;
            _box.classList.add('swml-coach-box--above');
        } else {
            top = rect.bottom + gap;
            _box.classList.remove('swml-coach-box--above');
        }

        // Clamp top to keep box in viewport even if selection scrolled off.
        top = Math.max(8, Math.min(top, vh - 80));

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

        // Mount + pin selection. v7.19.47: anchor to document.body with
        // position:fixed (CSS class .swml-coach-box--fixed) so the box
        // survives theme toggle / canvas re-render — body never detaches.
        // Vertical scroll on .swml-canvas-content tracked by scroll listener
        // (re-fires _positionBoxFromRange to ride the highlighted text).
        box.classList.add('swml-coach-box--fixed');
        document.body.appendChild(box);
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

        // v7.19.47: track .swml-canvas-content scroll so the box rides the
        // highlighted text vertically (the body-anchored fixed box doesn't
        // move with the canvas's internal scroll otherwise).
        _scrollHost = offsetParent;
        _onCanvasScroll = () => { _positionBoxFromRange(); };
        try { _scrollHost.addEventListener('scroll', _onCanvasScroll, { passive: true }); }
        catch (_) {}

        // v7.19.46: theme toggle / canvas re-render can detach the box (and
        // its offset parent) from the DOM. ResizeObserver fires only if a
        // surviving element gets resized, so it doesn't catch full subtree
        // replacement. MutationObserver on document.body subtree spots the
        // detach + _ensureBoxAttached re-mounts to the fresh parent.
        if (typeof MutationObserver !== 'undefined') {
            try {
                _detachWatcher = new MutationObserver(() => {
                    if (_box && !_box.isConnected) {
                        _ensureBoxAttached();
                        _positionBoxFromRange();
                    }
                });
                _detachWatcher.observe(document.body, { childList: true, subtree: true });
            } catch (_) { _detachWatcher = null; }
        }

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
            // v7.19.47: position:fixed → clamp inside viewport, not offsetParent.
            const vw = window.innerWidth || document.documentElement.clientWidth;
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const boxRect = box.getBoundingClientRect();
            let nextLeft = startLeft + dx;
            let nextTop = startTop + dy;
            const maxLeft = Math.max(0, vw - boxRect.width);
            const maxTop = Math.max(0, vh - 60); // keep the drag handle reachable
            nextLeft = Math.max(0, Math.min(nextLeft, maxLeft));
            nextTop = Math.max(0, Math.min(nextTop, maxTop));
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

    function _onDocumentMouseDown(e) {
        if (!_box) return;
        if (_box.contains(e.target)) return;
        // Don't close the box when the user mouses down inside the canvas
        // selection toolbar — toolbar buttons (incl. Sophia re-open) need
        // a clean click cycle.
        const tb = e.target.closest && e.target.closest('.swml-selection-toolbar');
        if (tb) return;
        // Outside click → close box. Student is moving on.
        _removeBox();
    }

    function _onKeyDown(e) {
        if (e.key === 'Escape' && _box) { _removeBox(); }
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
        // v7.19.42: drop mouseup/touchend/keyup chip-trigger listeners.
        // Toolbar Sophia button is the single entry point now. Keep
        // mousedown for outside-click close + keydown for Escape.
        document.addEventListener('mousedown', _onDocumentMouseDown);
        document.addEventListener('keydown', _onKeyDown);

        _bound = true;
        // Restore prior thread from localStorage so the panel survives reload.
        try { _hydrateFromHistory(); }
        catch (err) { console.warn('WML SelectionChip: hydrate failed', err); }
        console.log('WML SelectionChip v7.19.42: mounted (toolbar-driven, persistent thread)');
        return { unmount };
    }

    function unmount() {
        if (!_bound) return;
        document.removeEventListener('mousedown', _onDocumentMouseDown);
        document.removeEventListener('keydown', _onKeyDown);
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
        openBox,
        ACTION_MAP,
        ACTION_LABELS,
        buildPrompt,
        classifyScope,
        isEditableSection,
        extractSectionContext,
    };
})();
