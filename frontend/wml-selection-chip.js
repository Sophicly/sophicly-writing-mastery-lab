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

    // ── Quick-action vocabulary (locked to inline-coaching-engine-1.md v3 — 7-tier polish ladder) ──
    // T1-T5 = silent-audit tier scans (BLOCK-on-gap within tier).
    // T6 = prose mechanics (vocab / sentence length / register).
    // T7 = SPaG (spelling / punctuation / grammar).
    // Reference = Move 4 quote-exemplar from gold-standard-exemplars-aqa-lit.md.
    const ACTION_MAP = {
        tierScans:    ['scan-structure', 'scan-elements', 'scan-coherence', 'scan-concept', 'scan-context-drive'],
        elementPolish:['strengthen-hook'],
        polishProse:  ['strengthen-vocabulary', 'tighten', 'adjust-tone'],
        fixSpag:      ['fix-spelling', 'fix-grammar', 'fix-punctuation'],
        reference:    ['compare-gold-standard'],
        cw:           ['check-sensory-variety', 'check-scene-structure-beats', 'check-show-dont-tell'],
    };

    const ACTION_LABELS = {
        // T1-T5 tier scans
        'scan-structure':       'Scan structure',
        'scan-elements':        'Scan elements',
        'scan-coherence':       'Scan coherence',
        'scan-concept':         'Scan concept',
        'scan-context-drive':   'Scan context-drive',
        // Element polish (v7.19.74) — element-scoped strengthen actions.
        // Sophia diagnoses + offers ONE alternative using a different technique.
        'strengthen-hook':       'Strengthen hook',
        // T6 polish prose (span-scoped)
        'strengthen-vocabulary': 'Strengthen vocabulary',
        'tighten':               'Tighten sentence',
        'adjust-tone':           'Adjust tone',
        // T7 fix SPaG
        'fix-spelling':    'Fix spelling',
        'fix-grammar':     'Fix grammar',
        'fix-punctuation': 'Fix punctuation',
        // Reference
        'compare-gold-standard': 'Compare gold-standard',
        // CW (subject-conditional)
        'check-sensory-variety':       'Sensory variety',
        'check-scene-structure-beats': 'Scene-structure beats',
        'check-show-dont-tell':        'Show-don’t-tell',
    };

    const SECTION_GROUP_LABELS = {
        tierScans:    'Tier scan',
        elementPolish:'Element polish',
        polishProse:  'Polish prose',
        fixSpag:      'Fix SPaG',
        reference:    'Reference',
        cw:           'Creative writing',
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
        // v7.19.67: 7-tier polish ladder — tier-scan group always visible
        // (scans operate on parent element/doc, not the highlighted span).
        // Polish-prose + Fix-SPaG groups operate on the highlighted span.
        // Reference (Compare gold-standard) always available.
        // v7.19.74: Element polish group — element-scoped strengthen actions
        // (currently just Strengthen hook). Sophia diagnoses the highlighted
        // element + offers ONE alternative using a different technique. The
        // chip itself is always visible; the protocol module enforces scope
        // (e.g. redirects if highlight isn't actually a hook).
        const groups = [];
        groups.push({ key: 'tierScans',    actions: ACTION_MAP.tierScans });
        groups.push({ key: 'elementPolish',actions: ACTION_MAP.elementPolish });
        groups.push({ key: 'polishProse',  actions: ACTION_MAP.polishProse });
        groups.push({ key: 'fixSpag',      actions: ACTION_MAP.fixSpag });
        groups.push({ key: 'reference',    actions: ACTION_MAP.reference });
        if (taskCtx && taskCtx.subject === 'creative_writing') {
            groups.push({ key: 'cw', actions: ACTION_MAP.cw });
        }
        return groups;
    }

    function buildPrompt(action, selection, sectionContext, taskCtx, freeText, fullDoc) {
        const lines = [
            '## Inline Coaching Invocation',
            '',
            '- **Action:** ' + (action || 'freetext'),
            '- **Selection (frozen at open):** ' + JSON.stringify(selection || ''),
            '- **Section context (live, re-read this turn):** ' + JSON.stringify(sectionContext || ''),
            '- **Task context:** ' + JSON.stringify(taskCtx || {}),
        ];
        // v7.19.72: live full-doc snapshot per turn so cross-section student
        // edits become visible to Sophia without copy-paste workaround. The
        // frozen Selection above is what the student originally asked about;
        // this Current Document block is everything as it stands NOW.
        if (fullDoc && fullDoc.trim()) {
            lines.push('');
            lines.push('**Current full document (live this turn):**');
            lines.push('```');
            lines.push(fullDoc);
            lines.push('```');
        }
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
                // v7.19.68: re-add copy button on rehydrated bubbles.
                _addCopyButton(bubble);
            }
        });
        if (Array.isArray(stored.history)) _conversationHistory = stored.history.slice();
        // v7.19.57: rehydrate _lastSelectionInfo from stored.lastSelection
        // so Continue button has the text + scope to reopen a box. The DOM
        // Range can't survive reload, so rect/range fields stay null and
        // _openBox falls back to a viewport-anchored position.
        if (stored.lastSelection && stored.lastSelection.text) {
            _lastSelectionInfo = {
                text: stored.lastSelection.text,
                sectionContext: stored.lastSelection.sectionContext || '',
                scope: stored.lastSelection.scope || 'paragraph',
                rect: null,
                range: null,
                anchorEl: null,
                focusEl: null,
            };
        }
        // Show Continue button if a thread exists, since the user has no
        // active selection on reload.
        if (_conversationHistory.length > 0) _ensureContinueBtn();
    }

    // v7.19.68: clipboard helper + copy-button factory for chat bubbles.
    // Mirrors the wml-app.js clip()/SVG_COPY pattern so visual feedback
    // matches the training-env chat (icon flash + "Copied!" tooltip).
    function _clipText(text, btn) {
        if (!text || !btn) return;
        const SVG_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--swml-teal,#51dacf)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
        const showFeedback = () => {
            const button = btn.closest('button') || btn;
            const origHTML = button.innerHTML;
            button.innerHTML = SVG_CHECK;
            button.classList.add('swml-copied');
            const tip = document.createElement('span');
            tip.className = 'swml-copy-tooltip';
            tip.textContent = 'Copied!';
            button.style.position = 'relative';
            button.appendChild(tip);
            setTimeout(() => {
                button.innerHTML = origHTML;
                button.classList.remove('swml-copied');
            }, 1500);
        };
        try {
            navigator.clipboard.writeText(text).then(showFeedback).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (_) {}
                document.body.removeChild(ta);
                showFeedback();
            });
        } catch (_) {
            // Fallback only.
        }
    }

    function _addCopyButton(bubble) {
        if (!bubble || bubble.querySelector('.swml-bubble-copy')) return;
        const SVG_COPY = (window.WML && window.WML.SVG_COPY) ||
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        const isUser = bubble.classList.contains('user');
        const btn = el('button', {
            type: 'button',
            className: 'swml-bubble-copy' + (isUser ? ' swml-user-copy' : ''),
            innerHTML: SVG_COPY,
            title: 'Copy message',
        });
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const body = bubble.querySelector('.swml-bubble-body');
            const userP = bubble.querySelector('.swml-bubble-content > p');
            const text = (body ? body.textContent : (userP ? userP.textContent : (bubble.textContent || ''))).trim();
            if (!text) return;
            _clipText(text, btn);
        });
        // Place the button inside the bubble — for AI bubbles the existing
        // .swml-bubble-header sits above body, so we append into header to
        // mirror the wml-assessment.js "swml-copy-assess" placement. For
        // user bubbles append into the bubble-content (no header).
        const header = bubble.querySelector('.swml-bubble-header');
        if (header) {
            header.appendChild(btn);
        } else {
            const inner = bubble.querySelector('.swml-bubble-content') || bubble;
            inner.appendChild(btn);
        }
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
        // v7.19.68: copy button on every message (user + AI) per Neil 2026-05-06.
        _addCopyButton(bubble);
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
        // it directly — no offset-parent / scrollTop math.
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const boxW = 480;
        const gap = 12;
        const estBoxH = Math.min(vh * 0.55, 420);

        // v7.19.57: null rect → fallback (Continue button after page reload
        // when the live Range is gone). Anchor near right edge above the
        // Sophia panel's Continue button so the user sees continuity.
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            _box.style.left = Math.max(8, vw - boxW - 24) + 'px';
            _box.style.top = Math.max(8, (vh - estBoxH) / 2) + 'px';
            _box.style.width = boxW + 'px';
            _box.classList.remove('swml-coach-box--above');
            return;
        }

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
        // v7.19.60: sparkle-button design (jh3y/LYJMPBL). Spinning conic halo
        // behind a 3-path bouncing sparkle SVG, with 18 floating particles
        // emanating on hover. Hue rebased to brand 252°. Codepen `bodydrop`
        // (page-bg swap on hover) intentionally dropped.
        const SPARKLE_SVG = '<svg class="sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" stroke-linecap="round" stroke-linejoin="round" />' +
            '<path d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" stroke-linecap="round" stroke-linejoin="round" />' +
            '<path d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" stroke-linecap="round" stroke-linejoin="round" />' +
            '</svg>';
        const PARTICLE_SVG = '<svg class="particle" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z" stroke-linecap="round" stroke-linejoin="round" />' +
            '</svg>';
        const btn = el('button', {
            className: 'swml-coach-continue-btn',
            type: 'button',
            innerHTML:
                '<span class="spark"></span>' +
                '<span class="backdrop"></span>' +
                SPARKLE_SVG +
                '<span class="text">Continue with Sophia</span>',
            title: 'Reopen the coach box with your last conversation',
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!_lastSelectionInfo) {
                    console.warn('WML SelectionChip: Continue clicked but no _lastSelectionInfo');
                    return;
                }
                // Re-derive a fresh rect from the live Range if available.
                // After page reload range is null → _openBox + _positionBox
                // fall back to a viewport-anchored position.
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
        const wrap = el('div', { className: 'swml-coach-continue-wrap' });
        wrap.appendChild(btn);
        const pen = document.createElement('span');
        pen.className = 'particle-pen';
        pen.setAttribute('aria-hidden', 'true');
        pen.innerHTML = Array(18).fill(PARTICLE_SVG).join('');
        const RANDOM = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
        pen.querySelectorAll('.particle').forEach((p) => {
            p.setAttribute('style',
                '--x:' + RANDOM(20, 80) + ';' +
                '--y:' + RANDOM(20, 80) + ';' +
                '--duration:' + RANDOM(6, 20) + ';' +
                '--delay:' + RANDOM(1, 10) + ';' +
                '--alpha:' + (RANDOM(40, 90) / 100) + ';' +
                '--origin-x:' + (Math.random() > 0.5 ? -RANDOM(300, 800) : RANDOM(300, 800)) + '%;' +
                '--origin-y:' + (Math.random() > 0.5 ? -RANDOM(300, 800) : RANDOM(300, 800)) + '%;' +
                '--size:' + (RANDOM(40, 90) / 100) + ';'
            );
        });
        wrap.appendChild(pen);
        panel.appendChild(wrap);
        _continueBtn = wrap;
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
        // v7.19.53: redesigned echo as glowing inset card with sparkle gutter
        // (option B from the design review).
        const handle = el('div', { className: 'swml-coach-handle' });
        handle.appendChild(el('span', { className: 'swml-coach-handle-grip', innerHTML: '&#8942;&#8942;' }));
        const selPreview = (selectionInfo.text || '').slice(0, 200);
        const quote = el('div', { className: 'swml-coach-quote' });
        const SVG_QUOTE_SPARK = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23.47 30.13l-1.47 3.36c-.56 1.29-2.35 1.29-2.92 0l-1.47-3.36c-1.31-2.99-3.66-5.37-6.59-6.67l-4.04-1.79c-1.28-.57-1.28-2.44 0-3.01l3.91-1.74c3.01-1.33 5.4-3.8 6.68-6.9l1.49-3.58c.55-1.33 2.39-1.33 2.94 0l1.49 3.58c1.28 3.09 3.68 5.56 6.68 6.9l3.91 1.74c1.28.57 1.28 2.44 0 3.01l-4.04 1.79c-2.93 1.3-5.28 3.68-6.59 6.67Z"/></svg>';
        quote.innerHTML =
            '<span class="swml-coach-quote-gutter">' + SVG_QUOTE_SPARK + '</span>' +
            '<span class="swml-coach-quote-text"></span>';
        quote.querySelector('.swml-coach-quote-text').textContent =
            selectionInfo.text.length > 200 ? selPreview + '…' : selPreview;
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
        // v7.19.51: wrap ONLY the textarea in the animated gradient frame —
        // mic + send buttons sit outside the gradient.
        const inputFrame = el('div', { className: 'swml-coach-input-frame' });
        inputFrame.appendChild(textarea);
        inputRow.appendChild(inputFrame);
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

            // Left/right: viewport-edge clamp (Neil spec — natural viewport boundaries OK).
            const maxLeft = Math.max(0, vw - boxRect.width);
            nextLeft = Math.max(0, Math.min(nextLeft, maxLeft));

            // Top/bottom: v7.19.81 — clamp inside .swml-canvas-content rect so the box
            // can't drift into the LearnDash header above or behind the WML canvas
            // footer (Mark Complete / Extract row) below. Falls back to viewport-edge
            // math if canvas content isn't in the DOM.
            let minTop = 0;
            let maxTop = Math.max(0, vh - 60);
            const canvasContent = document.querySelector('.swml-canvas-content');
            if (canvasContent) {
                const ccRect = canvasContent.getBoundingClientRect();
                minTop = ccRect.top;
                maxTop = Math.max(minTop, ccRect.bottom - boxRect.height);
            }
            nextTop = Math.max(minTop, Math.min(nextTop, maxTop));

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

            // v7.19.72: doc-awareness fix — re-read live section context + full
            // document per turn. Previously sel.sectionContext was the snapshot
            // captured at openBox() time; doc edits after the box opened were
            // invisible to Sophia, forcing students to copy-paste their changes.
            // Now: section context refreshes from live DOM (anchorEl still in tree),
            // full doc text pulled from canvasEditor.getText() and appended via
            // buildPrompt's new fullDoc param.
            let liveSectionContext = sel.sectionContext;
            try {
                if (sel.anchorEl && sel.anchorEl.isConnected) {
                    liveSectionContext = extractSectionContext(sel.anchorEl);
                }
            } catch (_) { /* fall back to frozen snapshot */ }
            let liveFullDoc = '';
            try {
                if (_ctx && _ctx.canvasEditor && typeof _ctx.canvasEditor.getText === 'function') {
                    liveFullDoc = _ctx.canvasEditor.getText() || '';
                }
            } catch (_) { /* leave empty if editor handle stale */ }
            const promptText = buildPrompt(
                isAction ? action : 'freetext',
                sel.text,
                liveSectionContext,
                _ctx.taskCtx,
                trimmed,
                liveFullDoc
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

    // v7.19.48: outside-click close DROPPED. The box is a persistent chat
    // surface, not a popover. Closing on any outside click made theme toggle
    // / sidebar / notes tab / canvas click destroy the conversation. Now
    // close paths are: × button, Escape, or unmount on env teardown.
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
        // Toolbar Sophia button is the single entry point now.
        // v7.19.48: outside-click close also dropped — box persists until
        // × button / Escape / unmount. Theme toggle, sidebar, notes tab,
        // canvas clicks no longer destroy the conversation.
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
