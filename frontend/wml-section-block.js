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
            '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
            '<path d="M8 8h8M8 12h8M8 16h6"/>' +
        '</svg>';

    const CHIPPED_TYPES = new Set(['plan', 'response', 'extract']);

    /**
     * Create a TipTap NodeView for SectionBlock.
     *
     * @param {Object}  deps
     * @param {Function} deps.getStateRef  () => current canvas state object (for state.task gating).
     * @returns {Function} TipTap NodeView factory: ({ node, HTMLAttributes }) => ({ dom, contentDOM, ... })
     */
    function createNodeView(deps) {
        const getStateRef = (deps && typeof deps.getStateRef === 'function') ? deps.getStateRef : (() => null);

        return ({ node, HTMLAttributes }) => {
            const type = (node && node.attrs && node.attrs.sectionType) || 'response';

            const dom = document.createElement('div');
            const attrs = HTMLAttributes || {};
            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    try { dom.setAttribute(key, attrs[key]); } catch (_) { /* skip bad attrs */ }
                }
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
            chip.setAttribute('aria-label', 'Select all in this section');
            chip.title = 'Select section';
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

            return {
                dom,
                contentDOM,
                // Firewall the chip from ProseMirror's mutation observer so chip-subtree changes
                // never trigger a transaction / re-render loop.
                ignoreMutation: (mutation) => {
                    if (!mutation || !mutation.target) return false;
                    return chip === mutation.target || chip.contains(mutation.target);
                },
            };
        };
    }

    window.WML = window.WML || {};
    window.WML.SectionBlock = window.WML.SectionBlock || {};
    window.WML.SectionBlock.createNodeView = createNodeView;
})();
