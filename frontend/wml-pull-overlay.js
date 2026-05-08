/**
 * WML Pull Overlay (v7.19.95)
 *
 * Per-slot plan pull. Listens for `wml:pull-plan-request` events dispatched
 * by the pull-chip in wml-section-block.js, opens a modal showing the
 * student's prior plan-source canvases for the current text (planning,
 * essay-plan, exam-practice, model-answer, conceptual-notes), and on
 * confirm replaces the target plan section's content with the chosen
 * source.
 *
 * Replacement goes through TipTap's transaction system so Ctrl/Cmd-Z
 * reverts the change.
 */
(function () {
    'use strict';

    const config = window.swmlConfig || {};
    const REST = (config.restUrl || '/wp-json/sophicly-wml/v1/').replace(/\/+$/, '/') ;
    const NONCE = config.nonce || '';

    function authedHeaders() {
        return { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE };
    }

    // ── Overlay element refs (singleton — only one open at a time) ──
    let activeOverlay = null;
    let activeRequest = null;

    function closeOverlay() {
        if (activeOverlay && activeOverlay.parentNode) {
            activeOverlay.parentNode.removeChild(activeOverlay);
        }
        activeOverlay = null;
        activeRequest = null;
    }

    function timeAgo(iso) {
        if (!iso) return '';
        const t = Date.parse(iso);
        if (isNaN(t)) return '';
        const diff = Math.floor((Date.now() - t) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
        const days = Math.floor(diff / 86400);
        if (days < 30) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
        const months = Math.floor(days / 30);
        if (months < 12) return months + ' mo' + (months === 1 ? '' : 's') + ' ago';
        return Math.floor(months / 12) + ' yr ago';
    }

    /**
     * Extract plain prose (paragraphs / lists / headings) from a source canvas.
     *
     * v7.19.97 — strip ALL section-block wrappers + InputField placeholders +
     * feedback / outline / divider / notice sections. Keep only the text-bearing
     * content from PLAN-relevant sections. Result is a flat sequence of <p>,
     * <ul>, <ol>, <h2>, <h3>, <li> nodes the TipTap schema understands.
     *
     * Per Neil: pulled content should be just the text, not the source doc's
     * structural sections (general-notes, protagonist, feedback, etc.).
     */
    function extractPlanFromSource(sourceHtml, task) {
        try {
            const wrap = document.createElement('div');
            wrap.innerHTML = sourceHtml;

            // Always drop these — they pollute the pulled prose.
            wrap.querySelectorAll([
                '[data-section-type="divider"]',
                '[data-section-type="notice"]',
                '[data-section-type="feedback"]',
                '[data-section-type="outline"]',
                '[data-section-type="response"]',
                '[data-section-type="extract"]',
                '[data-section-type="question"]',
                '[data-section-type="preamble"]',
                '[data-section-type="frame"]',
                '.swml-comment-popover',
                '.swml-section-select-all',
                '.swml-section-pull',
                '.swml-input-field-placeholder',
            ].join(',')).forEach(n => n.remove());

            // Pick scope: prefer plan section's inner content if present, else
            // whole doc minus the strip-list above.
            let scope = wrap.querySelector('[data-section-type="plan"]');
            if (scope) {
                const inner = scope.querySelector('.swml-section-content');
                if (inner) scope = inner;
            } else {
                scope = wrap;
            }

            // Collect text-bearing nodes only. TipTap schema knows: p, ul, ol,
            // li, h1, h2, h3, blockquote. Anything else (custom NodeView attrs,
            // SectionBlock wrappers) gets unwrapped to its children.
            const allowed = new Set(['P', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'STRONG', 'EM', 'BR', 'A', 'CODE']);
            const out = [];
            (function walk(node) {
                if (!node) return;
                node.childNodes.forEach((child) => {
                    if (child.nodeType === 3) {
                        const t = (child.textContent || '').trim();
                        if (t) out.push(t);
                        return;
                    }
                    if (child.nodeType !== 1) return;
                    const tag = child.tagName;
                    if (allowed.has(tag)) {
                        out.push(child.outerHTML);
                    } else {
                        // Unwrap container — descend into its children.
                        walk(child);
                    }
                });
            })(scope);

            // Wrap loose text fragments in <p>. Most fragments will already be
            // <p>/<ul> outerHTML strings, but stray text nodes need wrapping.
            const html = out
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => (/^<(p|ul|ol|h\d|blockquote)/i.test(s) ? s : '<p>' + s + '</p>'))
                .join('');

            return html || '<p></p>';
        } catch (err) {
            if (window.console) console.warn('[pull-overlay] extract failed', err);
            return '<p></p>';
        }
    }

    /**
     * Replace the target plan section's content with new HTML via TipTap's
     * transaction system (so undo works). Returns true on success.
     *
     * Strategy v7.19.97: locate the wrapping section node by walking the
     * resolved position upwards until we find the node whose attrs.sectionType
     * === 'plan'. Then chain delete-inner-range + insertContentAt as ONE atomic
     * transaction so undo reverts in a single Cmd-Z.
     */
    function replaceSectionContent(contentDOM, newHtml) {
        const editor = window.WML && typeof window.WML.getCanvasEditor === 'function' ? window.WML.getCanvasEditor() : null;
        if (!editor || !editor.view) {
            if (window.console) console.warn('[pull-overlay] no canvasEditor available');
            return false;
        }
        try {
            const view = editor.view;
            const startPos = view.posAtDOM(contentDOM, 0);
            const $start = view.state.doc.resolve(Math.max(0, startPos));

            // Walk depths to find the section-block node (by attrs.sectionType).
            let nodeStart = -1, nodeEnd = -1, foundDepth = -1;
            for (let d = $start.depth; d >= 0; d--) {
                const n = $start.node(d);
                const st = n && n.attrs && n.attrs.sectionType;
                if (st === 'plan') {
                    nodeStart = $start.before(d);
                    nodeEnd = $start.after(d);
                    foundDepth = d;
                    break;
                }
            }
            if (nodeStart < 0) {
                if (window.console) console.warn('[pull-overlay] could not locate plan section node');
                return false;
            }
            // Inner content range = (nodeStart + 1) .. (nodeEnd - 1)
            const innerStart = nodeStart + 1;
            const innerEnd = Math.max(innerStart, nodeEnd - 1);
            if (window.console) console.log('[pull-overlay] replace range', { nodeStart, nodeEnd, innerStart, innerEnd, depth: foundDepth, htmlLen: newHtml.length });

            // Single atomic transaction: delete inner + insert new.
            // insertContent at innerStart after delete should land inside the section node.
            editor
                .chain()
                .focus()
                .command(({ tr, dispatch }) => {
                    if (innerEnd > innerStart) tr.delete(innerStart, innerEnd);
                    return true;
                })
                .insertContentAt(innerStart, newHtml, { updateSelection: false })
                .run();
            return true;
        } catch (err) {
            if (window.console) console.warn('[pull-overlay] replace failed', err);
            return false;
        }
    }

    /**
     * Build + mount the overlay. Receives the request detail.
     */
    function openOverlay(detail) {
        if (window.console) console.log('[pull-overlay] openOverlay called', detail);
        closeOverlay(); // singleton
        activeRequest = detail;

        const state = (window.WML && window.WML.state) || {};
        const board = state.board || '';
        const text  = state.text || '';
        if (window.console) console.log('[pull-overlay] board=' + board + ' text=' + text);

        const overlay = document.createElement('div');
        overlay.className = 'swml-pull-overlay';
        // v7.19.96: position:fixed (was absolute) so overlay is viewport-anchored
        // regardless of canvas-content scroll position. Mount on body (was
        // canvas-content) so ancestor CSS transforms in LD focus-mode don't trap
        // the fixed positioning — same fix shipped for outline panel in v7.19.91.
        // v7.19.97 — dropped backdrop-filter: blur(4px). Caused flicker on
        // Chrome/Safari composite layers. Darker bg gives the focal effect
        // without the GPU paint cost.
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;overflow:hidden;overscroll-behavior:contain;';

        // Block backdrop wheel/touch from leaking into doc behind
        const _block = (e) => { if (e.target === overlay) e.preventDefault(); };
        overlay.addEventListener('wheel', _block, { passive: false });
        overlay.addEventListener('touchmove', _block, { passive: false });
        // Click on backdrop (outside card) closes
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

        // ── Card ──
        const card = document.createElement('div');
        card.className = 'swml-pull-overlay__card';

        // Header
        const targetLabel = (detail.sectionLabel || '').match(/^(Q\d+)/);
        const headerLabel = targetLabel ? targetLabel[1] : 'this slot';
        const header = document.createElement('div');
        header.className = 'swml-pull-overlay__header';
        header.innerHTML = '<h3>Pull a plan into ' + headerLabel + '</h3>' +
            '<button type="button" class="swml-pull-overlay__close" aria-label="Close">&times;</button>';
        card.appendChild(header);

        // Body — list + preview
        const body = document.createElement('div');
        body.className = 'swml-pull-overlay__body';

        const list = document.createElement('div');
        list.className = 'swml-pull-overlay__list';
        list.innerHTML = '<div class="swml-pull-overlay__loading">Loading your prior work…</div>';
        body.appendChild(list);

        const preview = document.createElement('div');
        preview.className = 'swml-pull-overlay__preview';
        preview.innerHTML = '<p class="swml-pull-overlay__preview-empty">Pick a source on the left to preview.</p>';
        body.appendChild(preview);

        card.appendChild(body);

        // Footer — cancel + replace
        const footer = document.createElement('div');
        footer.className = 'swml-pull-overlay__footer';
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'swml-pull-overlay__btn swml-pull-overlay__btn--ghost';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', closeOverlay);
        const replaceBtn = document.createElement('button');
        replaceBtn.type = 'button';
        replaceBtn.className = 'swml-pull-overlay__btn swml-pull-overlay__btn--primary';
        replaceBtn.textContent = 'Replace plan';
        replaceBtn.disabled = true;
        footer.appendChild(cancelBtn);
        footer.appendChild(replaceBtn);
        card.appendChild(footer);

        overlay.appendChild(card);

        // v7.19.96: mount on body for fixed positioning + escape ancestor
        // stacking context (LearnDash focus-mode applies CSS transforms that
        // trap descendant fixed elements — same workaround as outline panel).
        document.body.appendChild(overlay);
        activeOverlay = overlay;
        if (window.console) console.log('[pull-overlay] overlay mounted');

        // Wire close button
        header.querySelector('.swml-pull-overlay__close').addEventListener('click', closeOverlay);

        // ── Fetch sources ──
        let selectedSource = null;
        let selectedHtml = null;

        const url = REST + 'canvas/list-pull-sources?board=' + encodeURIComponent(board) + '&text=' + encodeURIComponent(text);
        fetch(url, { headers: authedHeaders() })
            .then(r => r.json())
            .then(data => {
                if (!data || !data.success || !Array.isArray(data.sources) || data.sources.length === 0) {
                    list.innerHTML = '<div class="swml-pull-overlay__empty">' +
                        '<p>No prior plans found for this text.</p>' +
                        '<p class="swml-pull-overlay__empty-sub">Try the planning, essay-plan, exam-practice, model-answer, or conceptual-notes exercises first — saved work shows up here.</p>' +
                        '</div>';
                    return;
                }
                list.innerHTML = '';
                data.sources.forEach((src) => {
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'swml-pull-overlay__item';
                    item.dataset.key = src.key;
                    item.innerHTML =
                        '<span class="swml-pull-overlay__task-chip swml-pull-overlay__task-chip--' + src.colour + '">' + src.label + '</span>' +
                        '<span class="swml-pull-overlay__item-meta">' + (timeAgo(src.saved_at) || '') + (src.wordCount ? ' &middot; ' + src.wordCount + ' words' : '') + '</span>' +
                        '<p class="swml-pull-overlay__item-snippet">' + escapeHtml(src.snippet || '') + '…</p>';
                    item.addEventListener('click', () => {
                        // Mark active
                        list.querySelectorAll('.swml-pull-overlay__item--active').forEach(x => x.classList.remove('swml-pull-overlay__item--active'));
                        item.classList.add('swml-pull-overlay__item--active');
                        selectedSource = src;
                        selectedHtml = null;
                        replaceBtn.disabled = true;
                        preview.innerHTML = '<div class="swml-pull-overlay__preview-loading">Loading…</div>';
                        const purl = REST + 'canvas/pull-source?key=' + encodeURIComponent(src.key);
                        fetch(purl, { headers: authedHeaders() })
                            .then(r => r.json())
                            .then(d => {
                                if (!d || !d.success || !d.html) {
                                    preview.innerHTML = '<p class="swml-pull-overlay__preview-error">Failed to load source.</p>';
                                    return;
                                }
                                selectedHtml = d.html;
                                const pv = document.createElement('div');
                                pv.className = 'swml-pull-overlay__preview-content';
                                pv.innerHTML = d.html;
                                preview.innerHTML = '';
                                preview.appendChild(pv);
                                replaceBtn.disabled = false;
                            })
                            .catch(() => {
                                preview.innerHTML = '<p class="swml-pull-overlay__preview-error">Failed to load source.</p>';
                            });
                    });
                    list.appendChild(item);
                });
            })
            .catch(() => {
                list.innerHTML = '<div class="swml-pull-overlay__empty"><p>Failed to load your prior work. Try again.</p></div>';
            });

        // ── Replace handler ──
        replaceBtn.addEventListener('click', () => {
            if (!selectedSource || !selectedHtml) return;
            // v7.19.97 — use brand-styled confirm modal (was native window.confirm).
            const doReplace = () => {
                const planHtml = extractPlanFromSource(selectedHtml, selectedSource.task);
                const ok = replaceSectionContent(detail.contentDOM, planHtml);
                closeOverlay();
                if (ok && window.WML && typeof window.WML.showToast === 'function') {
                    window.WML.showToast('Plan pulled from ' + selectedSource.label + '. ⌘Z to undo.');
                } else if (!ok && window.console) {
                    console.warn('[pull-overlay] replace returned false');
                }
            };
            if (window.WML && typeof window.WML.showConfirm === 'function') {
                window.WML.showConfirm(
                    'Replace ' + headerLabel + '’s plan with this content? Your existing plan content will be replaced. You can undo with ⌘Z (Mac) or Ctrl+Z (Windows).',
                    doReplace,
                    { confirmText: 'Replace plan', cancelText: 'Cancel', danger: true }
                );
            } else {
                if (window.confirm('Replace ' + headerLabel + '’s plan? You can undo with ⌘Z.')) doReplace();
            }
        });
    }

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Bind to event ──
    document.addEventListener('wml:pull-plan-request', (e) => {
        if (!e || !e.detail) return;
        openOverlay(e.detail);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeOverlay) closeOverlay();
    });

    window.WML = window.WML || {};
    window.WML.PullOverlay = { open: openOverlay, close: closeOverlay };
})();
