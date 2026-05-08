/**
 * WML SectionBlock NodeView — shared between main canvas + exam-prep canvas.
 *
 * v7.19.77: Adds a "Select-All" chip on the heading row of plan / response /
 * extract sections in exam_crib documents. Click selects the whole section
 * content + dispatches a synthetic mouseup so the existing canvas-doc selection
 * toolbar mounts via its normal codepath (no toolbar-show extraction needed).
 *
 * Loaded BEFORE wml-assessment.js so the global is available when SectionBlock
 * Node definitions in that file call WML.SectionBlock.createNodeView().
 */
(function () {
    'use strict';

    const SVG_SELECT_ALL =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M8 8m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />' +
            '<path d="M12 20v.01" />' +
            '<path d="M16 20v.01" />' +
            '<path d="M8 20v.01" />' +
            '<path d="M4 20v.01" />' +
            '<path d="M4 16v.01" />' +
            '<path d="M4 12v.01" />' +
            '<path d="M4 8v.01" />' +
            '<path d="M4 4v.01" />' +
            '<path d="M8 4v.01" />' +
            '<path d="M12 4v.01" />' +
            '<path d="M16 4v.01" />' +
            '<path d="M20 4v.01" />' +
            '<path d="M20 8v.01" />' +
            '<path d="M20 12v.01" />' +
            '<path d="M20 16v.01" />' +
            '<path d="M20 20v.01" />' +
        '</svg>';

    const CHIPPED_TYPES = new Set(['plan', 'response', 'extract', 'question']);

    // v7.19.95: pull-chip lives on plan sections in exam_crib only — students can
    // import a plan they wrote in another exercise (Phase-2 planning, essay-plan,
    // exam-practice, model-answer, conceptual-notes) into THIS slot.
    const PULL_CHIPPED_TYPES = new Set(['plan']);
    const SVG_PULL =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 5v14"/>' +
            '<path d="M19 12l-7 7-7-7"/>' +
            '<path d="M5 21h14"/>' +
        '</svg>';

    /**
     * Create a TipTap NodeView for SectionBlock.
     *
     * @param {Object}   deps
     * @param {Function} deps.getStateRef       () => current canvas state object (for state.task gating).
     * @param {Function} deps.computeDomAttrs   (node) => { class, data-section-type, ... }
     *                                          MUST return the same attribute set that main renderHTML
     *                                          would emit. Constructed at the callsite where
     *                                          _feedbackEditable() is in scope. Without this, the
     *                                          dom lacks .swml-section-block / .swml-section-{type}
     *                                          classes (NodeView's `HTMLAttributes` param does NOT
     *                                          include the assembled class string from main
     *                                          renderHTML — only the raw addAttributes output).
     * @returns {Function} TipTap NodeView factory: ({ node, HTMLAttributes }) => ({ dom, contentDOM, ... })
     */
    function createNodeView(deps) {
        const getStateRef = (deps && typeof deps.getStateRef === 'function') ? deps.getStateRef : (() => null);
        const computeDomAttrs = (deps && typeof deps.computeDomAttrs === 'function') ? deps.computeDomAttrs : null;

        return ({ node, HTMLAttributes }) => {
            const type = (node && node.attrs && node.attrs.sectionType) || 'response';

            // Prefer caller-supplied computeDomAttrs (mirrors main renderHTML, includes class
            // string + readonly handling). Fall back to raw HTMLAttributes if not provided —
            // safer than rendering an unstyled dom.
            const attrs = computeDomAttrs ? computeDomAttrs(node) : (HTMLAttributes || {});

            const dom = document.createElement('div');
            for (const key in attrs) {
                if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
                const val = attrs[key];
                if (val == null || val === false) continue;
                try { dom.setAttribute(key, String(val)); } catch (_) { /* skip bad attrs */ }
            }

            const st = getStateRef();
            const showChip = !!st
                && st.task === 'exam_crib'
                && CHIPPED_TYPES.has(type);

            if (!showChip) {
                // Default path: dom IS contentDOM. Zero behavioural change vs renderHTML output.
                return { dom, contentDOM: dom };
            }

            // Chip path: wrap content in inner div so chip can be a sibling outside contentDOM.
            const contentDOM = document.createElement('div');
            contentDOM.className = 'swml-section-content';
            dom.appendChild(contentDOM);

            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'swml-section-select-all';
            chip.setAttribute('contenteditable', 'false');
            chip.setAttribute('aria-label', 'Select all text in this section');
            chip.setAttribute('data-tooltip', 'Select all text in this section to edit with Sophia');
            chip.innerHTML = SVG_SELECT_ALL;

            // Prevent focus shift / selection collapse before click handler runs.
            chip.addEventListener('mousedown', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
            });

            chip.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                try {
                    const range = document.createRange();
                    range.selectNodeContents(contentDOM);
                    const sel = window.getSelection();
                    if (!sel) return;
                    sel.removeAllRanges();
                    sel.addRange(range);
                    // Existing canvas-doc mouseup listener (wml-assessment.js:10658) builds the
                    // toolbar from window.getSelection() + does fresh DOM lookup off anchorNode.
                    // Synthetic dispatch fires that listener via the same codepath as a real user
                    // mouseup — no toolbar-mount duplication needed.
                    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, view: window }));
                } catch (err) {
                    if (window.console) console.warn('[SectionBlock chip] select-all failed', err);
                }
            });

            dom.appendChild(chip);

            // v7.19.95: pull-chip on plan sections in exam_crib. Sits above the
            // Select-All chip (top-right with offset). Click dispatches a custom
            // event picked up by wml-pull-overlay.js, which opens the source
            // chooser modal. No direct overlay coupling here — keeps this file
            // light and the chip simple.
            let pullChip = null;
            if (PULL_CHIPPED_TYPES.has(type)) {
                pullChip = document.createElement('button');
                pullChip.type = 'button';
                pullChip.className = 'swml-section-pull';
                pullChip.setAttribute('contenteditable', 'false');
                pullChip.setAttribute('aria-label', 'Pull a plan from your other work');
                pullChip.setAttribute('data-tooltip', 'Pull a plan from your other work');
                pullChip.innerHTML = SVG_PULL;
                pullChip.addEventListener('mousedown', (ev) => { ev.preventDefault(); ev.stopPropagation(); });
                pullChip.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const sectionLabel = (node && node.attrs && (node.attrs.sectionLabel || node.attrs.partLabel)) || dom.getAttribute('data-section-label') || '';
                    if (window.console) console.log('[pull-chip] clicked, sectionLabel=' + sectionLabel + ', dispatching wml:pull-plan-request');
                    document.dispatchEvent(new CustomEvent('wml:pull-plan-request', {
                        detail: {
                            sectionLabel,
                            sectionEl: dom,
                            contentDOM,
                        },
                    }));
                });
                dom.appendChild(pullChip);
            }

            return {
                dom,
                contentDOM,
                // Firewall the chips from ProseMirror's mutation observer so chip-subtree changes
                // never trigger a transaction / re-render loop.
                ignoreMutation: (mutation) => {
                    if (!mutation || !mutation.target) return false;
                    if (chip === mutation.target || chip.contains(mutation.target)) return true;
                    if (pullChip && (pullChip === mutation.target || pullChip.contains(mutation.target))) return true;
                    return false;
                },
            };
        };
    }

    window.WML = window.WML || {};
    window.WML.SectionBlock = window.WML.SectionBlock || {};
    window.WML.SectionBlock.createNodeView = createNodeView;
})();
