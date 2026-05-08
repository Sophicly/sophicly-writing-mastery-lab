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
            try {
                if (activeOverlay._restoreOverflow !== undefined && activeOverlay._canvasContent) {
                    activeOverlay._canvasContent.style.overflow = activeOverlay._restoreOverflow;
                }
            } catch (_) {}
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
     * Strip the source HTML down to the most relevant plan-like content per task.
     * For tasks with a clear "plan" section, return that section's inner HTML.
     * Otherwise return the whole html (let student see it all).
     */
    function extractPlanFromSource(sourceHtml, task) {
        try {
            const wrap = document.createElement('div');
            wrap.innerHTML = sourceHtml;
            const planSection = wrap.querySelector('[data-section-type="plan"]');
            if (planSection) {
                // Prefer the inner content holder if it exists (chip-wrapped sections).
                const inner = planSection.querySelector('.swml-section-content');
                return (inner ? inner.innerHTML : planSection.innerHTML).trim();
            }
            // For pure essay-plan / model-answer / notes docs the whole doc IS the plan.
            return wrap.innerHTML.trim();
        } catch (_) {
            return sourceHtml;
        }
    }

    /**
     * Replace the target plan section's content with new HTML via TipTap's
     * transaction system (so undo works). Returns true on success.
     */
    function replaceSectionContent(contentDOM, newHtml) {
        const editor = window.WML && typeof window.WML.getCanvasEditor === 'function' ? window.WML.getCanvasEditor() : null;
        if (!editor || !editor.view) {
            if (window.console) console.warn('[pull-overlay] no canvasEditor available');
            return false;
        }
        try {
            const view = editor.view;
            // posAtDOM gives the position INSIDE the contentDOM; we want the
            // start + end of its range relative to the doc.
            const startPos = view.posAtDOM(contentDOM, 0);
            // Walk to the contentDOM's last child end for the end position. If
            // contentDOM has no children, treat it as zero-length range.
            const lastChild = contentDOM.lastChild;
            const endPos = lastChild
                ? view.posAtDOM(lastChild, lastChild.childNodes ? lastChild.childNodes.length : 0)
                : startPos;
            // Resolve outwards to the plan-section node range (inclusive content).
            const $start = view.state.doc.resolve(Math.max(0, startPos));
            // Use the depth at startPos to find the wrapping section block.
            // Plan nodes typically sit at depth 1 (top-level). Going up one
            // gets the block boundary. Then `before` / `after` give the slot.
            let depth = $start.depth;
            // Find the node whose contentMatch produces a document fragment for
            // a plan-section. Simplest: pick the deepest ancestor whose DOM
            // matches contentDOM's parent (the section block dom).
            let nodeStart = $start.before(depth);
            let nodeEnd = $start.after(depth);
            // Defensive: if computed range is empty, fall back to deleting any
            // content between startPos and endPos and inserting at startPos.
            if (nodeStart >= nodeEnd) {
                nodeStart = startPos;
                nodeEnd = endPos;
            }
            // Replace just the inner content (don't destroy the section block
            // itself — we want to keep its data-attrs / class / chips). We do
            // this by deleting the inner range then inserting at startPos.
            editor
                .chain()
                .focus()
                .command(({ tr }) => {
                    // Inner range = (nodeStart + 1) .. (nodeEnd - 1)
                    const innerStart = nodeStart + 1;
                    const innerEnd = Math.max(innerStart, nodeEnd - 1);
                    if (innerEnd > innerStart) tr.delete(innerStart, innerEnd);
                    tr.insertText('', innerStart); // no-op anchor
                    return true;
                })
                .insertContentAt(nodeStart + 1, newHtml, { updateSelection: false })
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
        closeOverlay(); // singleton
        activeRequest = detail;

        const state = (window.WML && typeof window.WML.getStateRef === 'function') ? window.WML.getStateRef() : (window.WML && window.WML.state) || {};
        const board = state.board || '';
        const text  = state.text || '';

        const overlay = document.createElement('div');
        overlay.className = 'swml-pull-overlay';
        overlay.style.cssText = 'position:absolute;inset:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);overflow:hidden;overscroll-behavior:contain;';

        // Block backdrop wheel/touch from leaking into doc behind
        const _block = (e) => { if (e.target === overlay) e.preventDefault(); };
        overlay.addEventListener('wheel', _block, { passive: false });
        overlay.addEventListener('touchmove', _block, { passive: false });

        // Lock canvas overflow while mounted
        const canvasContent = document.querySelector('.swml-canvas-content') || document.body;
        if (canvasContent && canvasContent !== document.body) {
            canvasContent.style.position = canvasContent.style.position || 'relative';
            overlay._canvasContent = canvasContent;
            overlay._restoreOverflow = canvasContent.style.overflow;
            canvasContent.style.overflow = 'hidden';
        }

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

        // Mount inside canvas-content so it scrolls with the canvas, mirroring
        // attempt-selector overlay (CLAUDE.md OVERLAY pattern).
        canvasContent.appendChild(overlay);
        activeOverlay = overlay;

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
            // Confirm
            const confirmed = window.confirm(
                'Replace ' + headerLabel + '’s plan with this content?\n\n' +
                'Your existing plan content will be replaced. You can undo with ⌘Z (Mac) or Ctrl+Z (Windows).'
            );
            if (!confirmed) return;
            const planHtml = extractPlanFromSource(selectedHtml, selectedSource.task);
            const ok = replaceSectionContent(detail.contentDOM, planHtml);
            closeOverlay();
            if (ok && window.WML && typeof window.WML.toast === 'function') {
                window.WML.toast('Plan pulled from ' + selectedSource.label + '. ⌘Z to undo.');
            } else if (!ok && window.console) {
                console.warn('[pull-overlay] replace returned false');
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
