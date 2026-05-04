/**
 * Sophicly Writing Mastery Lab — Selection-Chip Module (v7.19.24)
 *
 * Tiptap-style floating chip on text selection inside the inline-coaching env
 * (task='exam_crib' + future polish-env redesign). Replaces the canvas chat
 * panel as the primary invocation method for Sophia.
 *
 * Pipeline: student selects → chip appears → click opens action menu → action
 * click opens mini-chat anchored to selection → POST to API.chat with Markdown
 * envelope → reply renders inline.
 *
 * Pedagogy: Socratic-only. Sophia never grades, never writes for student. See
 * protocols/shared/modules/inline-coaching-core.md for full red lines.
 *
 * Exposed: window.WML.SelectionChip = { mount, unmount, ACTION_MAP }.
 * Mounted imperatively from buildInlineCoachingPanels().
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
        'check-concept-strength': 'Check concept strength',
        'check-ttecea-element': 'Check TTECEA element',
        'check-vocabulary-precision': 'Check vocabulary precision',
        'check-author-purpose': 'Check author purpose',
        'check-ao3-anchor': 'Check AO3 anchor',
        'check-quote-presence': 'Check quote presence',
        'check-coherence': 'Check coherence',
        'check-structure-adherence': 'Check structure adherence',
        'check-ao-coverage': 'Check AO coverage',
        'check-sensory-variety': 'Check sensory variety',
        'check-scene-structure-beats': 'Check scene structure beats',
        'check-show-dont-tell': 'Check show-don’t-tell',
    };

    const SECTION_GROUP_LABELS = {
        universal: 'Universal',
        litAnalysis: 'Literary analysis',
        paragraphOnly: 'Paragraph-level',
        cw: 'Creative writing',
    };

    // ── Module-scoped state ──
    let _ctx = null;            // { canvas, canvasEditor, exerciseConfig, miniChatHost, taskCtx }
    let _chip = null;           // floating chip DOM
    let _menu = null;           // dropdown menu DOM
    let _miniChat = null;       // active mini-chat panel DOM
    let _lastSelectionInfo = null;
    let _bound = false;
    let _selectionTimer = null;

    // ── Helpers ──

    function _wordCount(s) {
        return (s || '').trim().split(/\s+/).filter(Boolean).length;
    }

    function classifyScope(text, anchorEl, focusEl) {
        const wc = _wordCount(text);
        if (wc <= 1) return 'word';
        // Same paragraph if both anchor and focus share the closest <p> ancestor.
        const anchorP = anchorEl && (anchorEl.closest ? anchorEl.closest('p, li, h1, h2, h3, h4') : null);
        const focusP = focusEl && (focusEl.closest ? focusEl.closest('p, li, h1, h2, h3, h4') : null);
        const sameParagraph = anchorP && focusP && anchorP === focusP;
        if (wc <= 35 && sameParagraph) return 'sentence';
        return 'paragraph';
    }

    /**
     * Walk up to the nearest .swml-section-block. Reject unless data-section-type
     * is one of the editable types AND data-readonly !== 'true'.
     * Tested against both anchor + focus — straddling boundaries reject.
     */
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

    /**
     * ±200 words around the selection inside the surrounding section block.
     * Falls back to the section's text if the selection is short.
     */
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
        // Truncate to 400 words centred on the section centre — selection-aware
        // truncation would need precise positions; section-centred is good enough.
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

    function _removeChip() {
        if (_chip && _chip.parentNode) _chip.parentNode.removeChild(_chip);
        _chip = null;
        _removeMenu();
    }

    function _removeMenu() {
        if (_menu && _menu.parentNode) _menu.parentNode.removeChild(_menu);
        _menu = null;
    }

    function _removeMiniChat() {
        if (_miniChat && _miniChat.parentNode) _miniChat.parentNode.removeChild(_miniChat);
        _miniChat = null;
    }

    function _getOffsetParent() {
        if (!_ctx) return null;
        const editorEl = _ctx.canvasEditor && _ctx.canvasEditor.options && _ctx.canvasEditor.options.element;
        if (!editorEl) return null;
        return editorEl.closest('.swml-canvas-editor') || editorEl.parentElement;
    }

    function _positionChip(rect) {
        const offsetParent = _getOffsetParent();
        if (!offsetParent || !_chip) return;
        const opRect = offsetParent.getBoundingClientRect();
        const chipH = 36, chipW = 220, gap = 8;
        let top = rect.top - opRect.top + offsetParent.scrollTop - chipH - gap;
        let left = rect.left - opRect.left + (rect.width / 2) - (chipW / 2);
        if (top < offsetParent.scrollTop + 4) {
            top = rect.bottom - opRect.top + offsetParent.scrollTop + gap;
            _chip.classList.add('swml-selection-chip--below');
        } else {
            _chip.classList.remove('swml-selection-chip--below');
        }
        const maxLeft = Math.max(8, opRect.width - chipW - 8);
        left = Math.max(8, Math.min(left, maxLeft));
        _chip.style.top = top + 'px';
        _chip.style.left = left + 'px';
    }

    function _buildChip(selectionInfo) {
        const chip = el('button', {
            className: 'swml-selection-chip',
            type: 'button',
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                _toggleMenu(selectionInfo);
            },
        });
        chip.appendChild(el('span', { className: 'swml-selection-chip-label', textContent: 'Sophia' }));
        return chip;
    }

    function _toggleMenu(selectionInfo) {
        if (_menu) { _removeMenu(); return; }
        _buildMenu(selectionInfo);
    }

    function _buildMenu(selectionInfo) {
        _removeMenu();
        const offsetParent = _getOffsetParent();
        if (!offsetParent || !_chip) return;
        const groups = _filterActionsForScope(selectionInfo.scope, _ctx.taskCtx);
        const menu = el('div', { className: 'swml-selection-chip-menu' });
        groups.forEach((group) => {
            menu.appendChild(el('div', {
                className: 'swml-selection-chip-menu-section-label',
                textContent: SECTION_GROUP_LABELS[group.key] || group.key,
            }));
            group.actions.forEach((action) => {
                const item = el('button', {
                    className: 'swml-selection-chip-menu-item',
                    type: 'button',
                    textContent: ACTION_LABELS[action] || action,
                    'data-action': action,
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        _removeMenu();
                        _onActionPicked(action, selectionInfo);
                    },
                });
                menu.appendChild(item);
            });
        });

        // Position menu directly below the chip
        const chipRect = _chip.getBoundingClientRect();
        const opRect = offsetParent.getBoundingClientRect();
        const menuW = 260;
        let top = (parseFloat(_chip.style.top) || 0) + 36 + 6;
        let left = (parseFloat(_chip.style.left) || 0);
        const maxLeft = Math.max(8, opRect.width - menuW - 8);
        left = Math.max(8, Math.min(left, maxLeft));
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        offsetParent.appendChild(menu);
        _menu = menu;
    }

    function _onActionPicked(action, selectionInfo) {
        _openMiniChat(action, selectionInfo);
    }

    // ── Mini-chat panel ──────────────────────────────────────────────

    function _positionMiniChat(rect) {
        const offsetParent = _getOffsetParent();
        if (!offsetParent || !_miniChat) return;
        const opRect = offsetParent.getBoundingClientRect();
        const panelW = 380;
        const gap = 12;

        // Default: open BELOW the selection. Flip ABOVE if it would overflow.
        let top = rect.bottom - opRect.top + offsetParent.scrollTop + gap;
        let left = rect.left - opRect.left + offsetParent.scrollLeft;
        const maxLeft = Math.max(8, opRect.width - panelW - 8);
        left = Math.max(8, Math.min(left, maxLeft));

        const panelMaxH = Math.min(window.innerHeight * 0.6, 460);
        const wouldOverflow = (rect.bottom + gap + panelMaxH) > window.innerHeight;
        if (wouldOverflow && rect.top > panelMaxH + gap) {
            top = rect.top - opRect.top + offsetParent.scrollTop - panelMaxH - gap;
            _miniChat.classList.add('swml-mini-chat-panel--above');
        } else {
            _miniChat.classList.remove('swml-mini-chat-panel--above');
        }

        _miniChat.style.top = top + 'px';
        _miniChat.style.left = left + 'px';
    }

    function _renderMiniChatBubble(messagesEl, role, text, rawText) {
        const formatAI = (window.WML && window.WML.formatAI) || ((s) => s);
        const stripAIInternals = (window.WML && window.WML.stripAIInternals) || ((s) => s);
        const bubble = el('div', { className: 'swml-mini-chat-bubble swml-mini-chat-bubble--' + role });
        if (role === 'ai') {
            const clean = stripAIInternals(text || '');
            bubble.innerHTML = formatAI(clean);
        } else {
            bubble.textContent = rawText || text || '';
        }
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    function _openMiniChat(action, selectionInfo) {
        if (!_ctx) return;
        _removeMiniChat();

        const offsetParent = _getOffsetParent();
        if (!offsetParent) return;

        const panel = el('div', { className: 'swml-mini-chat-panel', 'data-action': action || 'freetext' });

        // Header
        const header = el('div', { className: 'swml-mini-chat-header' });
        const headerLabel = ACTION_LABELS[action] || 'Sophia';
        header.appendChild(el('span', { className: 'swml-mini-chat-title', textContent: headerLabel }));
        const closeBtn = el('button', {
            className: 'swml-mini-chat-close',
            type: 'button',
            innerHTML: '×',
            title: 'Close',
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); _removeMiniChat(); },
        });
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // Selection echo (truncated)
        const selPreview = (selectionInfo.text || '').slice(0, 240);
        if (selPreview) {
            const quote = el('blockquote', {
                className: 'swml-mini-chat-quote',
                textContent: selectionInfo.text.length > 240 ? selPreview + '…' : selPreview,
            });
            panel.appendChild(quote);
        }

        // Messages container
        const messages = el('div', { className: 'swml-mini-chat-messages' });
        panel.appendChild(messages);

        // Input row
        const inputRow = el('div', { className: 'swml-mini-chat-input-row' });
        const textarea = el('textarea', {
            className: 'swml-mini-chat-input',
            placeholder: 'Reply to Sophia…',
            rows: 1,
        });
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
        const sendBtn = el('button', {
            className: 'swml-mini-chat-send',
            type: 'button',
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
            title: 'Send',
        });
        inputRow.appendChild(textarea);
        inputRow.appendChild(sendBtn);
        panel.appendChild(inputRow);

        // Mount
        offsetParent.appendChild(panel);
        _miniChat = panel;
        _positionMiniChat(selectionInfo.rect);

        // Per-session mini-chat state
        const miniHistory = [];
        const miniChatId = 'crib_' + Date.now();
        let pending = false;

        const send = async (freeText) => {
            if (pending) return;
            const trimmed = (freeText || '').trim();
            const isFirstAction = miniHistory.length === 0;
            if (!isFirstAction && !trimmed) return;

            pending = true;
            sendBtn.disabled = true;
            textarea.disabled = true;

            if (trimmed) {
                _renderMiniChatBubble(messages, 'user', trimmed, trimmed);
                miniHistory.push({ role: 'user', content: trimmed });
            }

            // Typing indicator
            const typing = el('div', { className: 'swml-mini-chat-bubble swml-mini-chat-bubble--ai swml-mini-chat-typing' });
            typing.innerHTML = '<span class="swml-mini-chat-dots"><span>.</span><span>.</span><span>.</span></span>';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            const promptText = buildPrompt(
                isFirstAction ? action : 'freetext',
                selectionInfo.text,
                selectionInfo.sectionContext,
                _ctx.taskCtx,
                isFirstAction ? '' : trimmed
            );

            try {
                const apiPost = window.WML && window.WML.apiPost;
                const API = window.WML && window.WML.API;
                const state = window.WML && window.WML.state;
                if (!apiPost || !API || !API.chat) {
                    typing.remove();
                    _renderMiniChatBubble(messages, 'ai', 'Sorry — chat infrastructure not loaded.');
                    pending = false; sendBtn.disabled = false; textarea.disabled = false;
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
                    _renderMiniChatBubble(messages, 'ai', res.reply, res.reply);
                } else {
                    _renderMiniChatBubble(messages, 'ai', (res && res.message) ? res.message : 'No reply received.');
                }
            } catch (err) {
                typing.remove();
                console.error('WML SelectionChip mini-chat error', err);
                _renderMiniChatBubble(messages, 'ai', 'Sorry, something went wrong. Please try again.');
            } finally {
                pending = false;
                sendBtn.disabled = false;
                textarea.disabled = false;
                textarea.value = '';
                textarea.style.height = 'auto';
                textarea.focus();
            }
        };

        sendBtn.addEventListener('click', () => send(textarea.value));
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(textarea.value);
            }
        });

        // First fire — sends the action-only envelope (no free text).
        send('');
    }

    /**
     * Re-evaluate the current selection and decide whether to show / move /
     * remove the chip. Called on debounced mouseup / touchend / keyup.
     */
    function _recomputeSelection() {
        if (!_ctx || !_ctx.canvasEditor) return;
        const editorEl = _ctx.canvasEditor.options && _ctx.canvasEditor.options.element;
        if (!editorEl) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            _removeChip();
            return;
        }
        const range = sel.getRangeAt(0);

        // Selection must be inside our editor element
        if (!editorEl.contains(range.commonAncestorContainer)) {
            _removeChip();
            return;
        }

        const text = sel.toString().trim();
        if (!text) { _removeChip(); return; }

        // Reject if either endpoint sits outside an editable section.
        if (!isEditableSection(sel.anchorNode) || !isEditableSection(sel.focusNode)) {
            _removeChip();
            return;
        }

        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            _removeChip();
            return;
        }

        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode);
        const focusEl = sel.focusNode && (sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode);
        const scope = classifyScope(text, anchorEl, focusEl);
        const sectionContext = extractSectionContext(anchorEl);

        const selectionInfo = { text, scope, sectionContext, rect, anchorEl, focusEl };
        _lastSelectionInfo = selectionInfo;

        const offsetParent = _getOffsetParent();
        if (!offsetParent) { _removeChip(); return; }

        if (!_chip) {
            _chip = _buildChip(selectionInfo);
            offsetParent.appendChild(_chip);
        }
        _positionChip(rect);
    }

    function _scheduleRecompute() {
        if (_selectionTimer) clearTimeout(_selectionTimer);
        _selectionTimer = setTimeout(() => {
            _selectionTimer = null;
            _recomputeSelection();
        }, 60);
    }

    function _onDocumentMouseDown(e) {
        if (_chip && _chip.contains(e.target)) return;
        if (_menu && _menu.contains(e.target)) return;
        if (_miniChat && _miniChat.contains(e.target)) return;
        // mousedown outside everything — close menu only; chip rebuild on
        // selection collapse via _recomputeSelection.
        _removeMenu();
    }

    function _onKeyDown(e) {
        if (e.key === 'Escape') {
            if (_menu) { _removeMenu(); return; }
            if (_chip) { _removeChip(); return; }
        }
    }

    // ── Mount / unmount lifecycle ──

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
        console.log('WML SelectionChip: mounted');
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
        _removeChip();
        _removeMiniChat();
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
