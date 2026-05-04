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
    let _hint = null;                // floating discovery hint DOM
    let _hintDismissed = false;      // session-scoped (resets on next mount)
    let _activeSelection = null;     // last valid selection info, frozen at box-open
    let _bound = false;
    let _selectionTimer = null;
    let _hintShown = false;

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
        if (_box && _box.parentNode) _box.parentNode.removeChild(_box);
        _box = null;
        _activeSelection = null;
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

    function _renderReplyBubble(messagesEl, role, text) {
        const formatAI = (window.WML && window.WML.formatAI) || ((s) => s);
        const stripAIInternals = (window.WML && window.WML.stripAIInternals) || ((s) => s);
        const bubble = el('div', { className: 'swml-coach-bubble swml-coach-bubble--' + role });
        if (role === 'ai') {
            bubble.innerHTML = formatAI(stripAIInternals(text || ''));
        } else {
            bubble.textContent = text || '';
        }
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    // ── The single floating coach box ───────────────────────────────

    function _openBox(selectionInfo) {
        _removeBox();
        _activeSelection = selectionInfo;

        const offsetParent = _getOffsetParent();
        if (!offsetParent) return;

        const box = el('div', { className: 'swml-coach-box', 'data-scope': selectionInfo.scope });

        // 1. Selection echo (truncated, italic)
        const selPreview = (selectionInfo.text || '').slice(0, 200);
        const quote = el('div', {
            className: 'swml-coach-quote',
            textContent: selectionInfo.text.length > 200 ? selPreview + '…' : selPreview,
        });
        box.appendChild(quote);

        // 2. Messages — Socratic replies render here
        const messages = el('div', { className: 'swml-coach-messages' });
        box.appendChild(messages);

        // 3. Input row — textarea + send button
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
        const sendBtn = el('button', {
            className: 'swml-coach-send',
            type: 'button',
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
            title: 'Send',
        });
        inputRow.appendChild(textarea);
        inputRow.appendChild(sendBtn);
        box.appendChild(inputRow);

        // 4. Quick-actions row(s) — grouped, scope-filtered
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

        // 5. Footer — close button
        const closeBtn = el('button', {
            className: 'swml-coach-close',
            type: 'button',
            innerHTML: '×',
            title: 'Close',
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); _removeBox(); _hideHint(); },
        });
        box.appendChild(closeBtn);

        // Mount
        offsetParent.appendChild(box);
        _box = box;
        _positionBox(selectionInfo.rect);

        // Pin selection: clicking inside box collapses native selection,
        // but _activeSelection is preserved. Prevent inner clicks from bubbling
        // to the document mousedown handler (which would close the box).
        box.addEventListener('mousedown', (e) => { e.stopPropagation(); });

        // Per-session state
        const miniHistory = [];
        const miniChatId = 'crib_' + Date.now();
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

            // Echo user intent in the messages stream
            const userLabel = isAction
                ? (ACTION_LABELS[action] || action)
                : trimmed;
            _renderReplyBubble(messages, 'user', userLabel);
            if (trimmed) {
                miniHistory.push({ role: 'user', content: trimmed });
            } else if (isAction) {
                miniHistory.push({ role: 'user', content: '[' + action + ']' });
            }

            // Hide hint after first invocation
            _hideHint();

            const typing = el('div', { className: 'swml-coach-bubble swml-coach-bubble--ai swml-coach-typing' });
            typing.innerHTML = '<span class="swml-coach-dots"><span>.</span><span>.</span><span>.</span></span>';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            const promptText = buildPrompt(
                isAction ? action : 'freetext',
                _activeSelection.text,
                _activeSelection.sectionContext,
                _ctx.taskCtx,
                trimmed
            );

            try {
                const apiPost = window.WML && window.WML.apiPost;
                const API = window.WML && window.WML.API;
                const state = window.WML && window.WML.state;
                if (!apiPost || !API || !API.chat) {
                    typing.remove();
                    _renderReplyBubble(messages, 'ai', 'Chat infrastructure not loaded.');
                    return;
                }

                const body = {
                    prompt: promptText,
                    botId: 'wml-claude',
                    chatId: miniChatId,
                    history: miniHistory.slice(-12),
                    board: state ? state.board : '',
                    subject: state ? state.subject : '',
                    text: state ? state.text : '',
                    task: state ? state.task : 'exam_crib',
                    topicNumber: state ? (state.topicNumber || 0) : 0,
                };

                const res = await apiPost(API.chat, body);
                typing.remove();
                if (res && res.success && res.reply) {
                    miniHistory.push({ role: 'assistant', content: res.reply });
                    _renderReplyBubble(messages, 'ai', res.reply);
                } else {
                    _renderReplyBubble(messages, 'ai', (res && res.message) ? res.message : 'No reply received.');
                }
            } catch (err) {
                typing.remove();
                console.error('WML SelectionChip coach error', err);
                _renderReplyBubble(messages, 'ai', 'Sorry, something went wrong. Please try again.');
            } finally {
                pending = false;
                sendBtn.disabled = false;
                textarea.disabled = false;
                actionsWrap.querySelectorAll('button').forEach(b => { b.disabled = false; });
                textarea.value = '';
                textarea.style.height = 'auto';
                textarea.focus();
            }
        };

        sendBtn.addEventListener('click', () => send(null, textarea.value));
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(null, textarea.value);
            }
        });

        // Auto-focus textarea so student can start typing immediately.
        setTimeout(() => { try { textarea.focus(); } catch (_) {} }, 30);
    }

    // ── Discovery hint (bottom-right ghost pill) ────────────────────

    function _showHint() {
        if (_hintDismissed || _hintShown || !_ctx) return;
        const offsetParent = _getOffsetParent();
        if (!offsetParent) return;

        const hint = el('div', { className: 'swml-coach-hint', role: 'status' });
        hint.appendChild(el('span', { className: 'swml-coach-hint-icon', textContent: '✨' }));
        hint.appendChild(el('span', {
            className: 'swml-coach-hint-text',
            textContent: 'Highlight text in your plan or response to work with Sophia.',
        }));
        const closeBtn = el('button', {
            className: 'swml-coach-hint-close',
            type: 'button',
            innerHTML: '×',
            title: 'Dismiss',
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); _hideHint(); _hintDismissed = true; },
        });
        hint.appendChild(closeBtn);
        document.body.appendChild(hint);
        _hint = hint;
        _hintShown = true;

        // Slide in
        requestAnimationFrame(() => { hint.classList.add('swml-coach-hint--visible'); });
    }

    function _hideHint() {
        if (!_hint) return;
        _hint.classList.remove('swml-coach-hint--visible');
        const node = _hint;
        setTimeout(() => { try { if (node.parentNode) node.parentNode.removeChild(node); } catch (_) {} }, 250);
        _hint = null;
        _hintShown = false;
    }

    // ── Selection event handler ─────────────────────────────────────

    function _recomputeSelection() {
        if (!_ctx || !_ctx.canvasEditor) return;
        const editorEl = _ctx.canvasEditor.options && _ctx.canvasEditor.options.element;
        if (!editorEl) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);

        // Selection must be inside our editor element
        if (!editorEl.contains(range.commonAncestorContainer)) return;

        const text = sel.toString().trim();
        if (!text) return;

        // Reject if either endpoint sits outside an editable section.
        if (!isEditableSection(sel.anchorNode) || !isEditableSection(sel.focusNode)) return;

        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) return;

        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode);
        const focusEl = sel.focusNode && (sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode);
        const scope = classifyScope(text, anchorEl, focusEl);
        const sectionContext = extractSectionContext(anchorEl);

        const selectionInfo = { text, scope, sectionContext, rect, anchorEl, focusEl };
        _openBox(selectionInfo);
    }

    function _scheduleRecompute() {
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
        _hintDismissed = false;
        const editorEl = ctx.canvasEditor.options && ctx.canvasEditor.options.element;
        if (!editorEl) {
            console.warn('WML SelectionChip: editor element not available');
            return { unmount };
        }

        editorEl.addEventListener('mouseup', _scheduleRecompute);
        editorEl.addEventListener('touchend', _scheduleRecompute);
        editorEl.addEventListener('keyup', _scheduleRecompute);
        document.addEventListener('mousedown', _onDocumentMouseDown);
        document.addEventListener('keydown', _onKeyDown);

        _bound = true;
        console.log('WML SelectionChip v7.19.26: mounted');

        // Show discovery hint shortly after mount — gives doc a beat to seed.
        setTimeout(_showHint, 1200);
        return { unmount };
    }

    function unmount() {
        if (!_bound) return;
        const editorEl = _ctx && _ctx.canvasEditor && _ctx.canvasEditor.options && _ctx.canvasEditor.options.element;
        if (editorEl) {
            editorEl.removeEventListener('mouseup', _scheduleRecompute);
            editorEl.removeEventListener('touchend', _scheduleRecompute);
            editorEl.removeEventListener('keyup', _scheduleRecompute);
        }
        document.removeEventListener('mousedown', _onDocumentMouseDown);
        document.removeEventListener('keydown', _onKeyDown);
        if (_selectionTimer) { clearTimeout(_selectionTimer); _selectionTimer = null; }
        _removeBox();
        _hideHint();
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
