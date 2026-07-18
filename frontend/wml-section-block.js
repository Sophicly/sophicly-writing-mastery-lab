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

            // v7.19.491: completion tick computed FROM THE NODE MODEL at render time, so
            // it survives every re-render/pagination (computeDomAttrs above carries no
            // completion state, and JS-set attributes were getting wiped on rebuild). A
            // section with outline rows is complete when every row is filled — text present,
            // and for checkbox rows the box ticked. Mirrors checkRowComplete so the main-doc
            // tick agrees with the outline panel. (Radio logline drafts can't all tick, so
            // that section stays un-ticked — the Chosen Logline carries the tick instead.)
            try {
                // v7.19.500: NEVER track completion on read-only sections — they're
                // instruction/scaffold (e.g. CW "Resources to Explore"), not something the
                // student fills, so a tick on them is wrong (Neil). Their body text was
                // tripping the free-prose branch into data-section-complete="true".
                const _secRO = node.attrs && (node.attrs.editable === false || node.attrs.editable === 'false'
                    || node.attrs.readonly === 'true' || node.attrs.readonly === true);
                if (!_secRO && (type === 'plan' || type === 'response' || type === 'outline' || type === 'improvement'
                    || type === 'mark_scheme_response' /* v7.20.89 (Neil B6/B7): MSA sections tick + feed the progress card */
                    || type === 'notes' /* v7.20.96 (Neil): keyword/Question-Focus sections tick like everything else (field-filled = done) */)) {
                    let rowCount = 0, filled = 0, pickGroup = false, anyChecked = false;
                    node.forEach((child) => {
                        if (!child.type || child.type.name !== 'outlineRow') return;
                        rowCount++;
                        const hasText = (child.textContent || '').trim().length > 0;
                        let rowOk = hasText;
                        try {
                            const crit = JSON.parse((child.attrs && child.attrs.criteria) || '{}');
                            const cs = JSON.parse((child.attrs && child.attrs.checkState) || '{}');
                            // v7.20.129: THE RULE LIVES IN ONE PLACE — WML.outlineRow.complete
                            // (wml-core.js). This used to be a hand-copy of it and had drifted.
                            // This adapter owns only what is genuinely section-level:
                            //  • anyChecked / pickGroup — the CW single-select group (logline /
                            //    idea rows): the row needs text only, the SECTION needs one pick.
                            //    All-ticked is impossible there by design (v7.20.89 A2 ruling).
                            const rule = window.WML && window.WML.outlineRow;
                            if (!rule) {
                                // Load-order break (core must load before this file). Fail loud —
                                // silently ticking every section would read as success.
                                if (!window.__swmlOutlineRuleWarned) {
                                    window.__swmlOutlineRuleWarned = true;
                                    console.warn('WML: WML.outlineRow missing — section ticks degraded to text-only. Check wml-core.js load order.');
                                }
                            } else {
                                const anyOn = (Array.isArray(cs.checked) && cs.checked.length > 0)
                                    || (cs.c && Object.keys(cs.c).some(k => Array.isArray(cs.c[k].checked) && cs.c[k].checked.length > 0));
                                if (anyOn) anyChecked = true;
                                const isPick = /^cw-step-\d+-(logline|idea)/.test(String((child.attrs && child.attrs.fieldId) || ''));
                                if (isPick) pickGroup = true;
                                else rowOk = rule.complete(crit, cs, hasText);
                            }
                        } catch (_) { /* default rowOk = hasText */ }
                        if (rowOk) filled++;
                    });
                    // Complete = every row satisfied AND (if a pick group) one chosen.
                    const complete = rowCount > 0 && filled === rowCount && (!pickGroup || anyChecked);
                    if (rowCount > 0) {
                        dom.setAttribute('data-section-complete', complete ? 'true' : 'false');
                    } else {
                        // v7.19.506: InputField/SelectField sections (Codex reflections +
                        // quizzes). Complete = every input has text + every plain select has a
                        // value; for QUIZ sections (selects carrying a `correct` answer) every
                        // gradable select must be CORRECT (100%) — not merely answered (Neil).
                        let inputs = 0, inputsFilled = 0, gradable = 0, gradableOk = 0, plainSel = 0, plainSelFilled = 0;
                        node.descendants((c) => {
                            if (!c.type) return;
                            if (c.type.name === 'inputField') {
                                inputs++; if ((c.textContent || '').trim().length > 0) inputsFilled++;
                            } else if (c.type.name === 'selectField') {
                                const v = ((c.attrs && c.attrs.value) || '').trim();
                                const cor = ((c.attrs && c.attrs.correct) || '').trim();
                                if (cor) { gradable++; if (v && v === cor) gradableOk++; }
                                else { plainSel++; if (v) plainSelFilled++; }
                            }
                        });
                        if (inputs + gradable + plainSel > 0) {
                            const fComplete = (gradable === 0 || gradableOk === gradable)
                                && inputsFilled === inputs && plainSelFilled === plainSel;
                            dom.setAttribute('data-section-complete', fComplete ? 'true' : 'false');
                        } else {
                            // v7.20.141 (Neil — Q1 tick "still not working"): the true/false
                            // statements render as checklistItem nodes — no outlineRow, no
                            // inputField, no paragraph — so every branch above AND the free-prose
                            // scan below missed them, and THIS nodeView (the authoritative,
                            // render-time completion; it wipes any data-section-complete the DOM
                            // side sets, L86-88) kept forcing the section back to incomplete. That
                            // is why the earlier DOM-side (checkSectionComplete) fix never held.
                            // DONE = ticked count >= number of TRUE statements (the "choose N"
                            // count, from the `correct` attr; fallback 1). Grade-agnostic —
                            // correctness is marked separately (so students don't guess-to-green).
                            let chkCount = 0, chkTrue = 0, chkChecked = 0;
                            node.forEach((child) => {
                                if (!child.type || child.type.name !== 'checklistItem') return;
                                chkCount++;
                                if (child.attrs && child.attrs.correct === true) chkTrue++;
                                if (child.attrs && child.attrs.checked) chkChecked++;
                            });
                            if (chkCount > 0) {
                                const target = chkTrue > 0 ? chkTrue : 1;
                                dom.setAttribute('data-section-complete', chkChecked >= target ? 'true' : 'false');
                            } else {
                            // v7.19.495: free-prose section (no rows/fields, e.g. Step-1 Writer's
                            // Profile / Seed Loglines) — trackable if it has a NON-LOCKED block;
                            // complete when that block has text.
                            let trackable = false, hasText = false;
                            node.forEach((child) => {
                                if (!child.type) return;
                                if (child.type.name !== 'paragraph' && child.type.name !== 'heading') return;
                                const locked = child.attrs && (child.attrs.locked === true || child.attrs.locked === 'true');
                                if (locked) return;
                                trackable = true;
                                // v7.19.532: ignore all-italic text — it's placeholder/instruction
                                // (older free-prose docs seeded the AI-output placeholder UNLOCKED,
                                // e.g. Step-1 Writer's Profile / Seed Loglines), so an untouched
                                // placeholder must not tick the section complete. Mirrors the em-strip
                                // used by the DOM completion check + the older getSectionIndicator.
                                if ((child.textContent || '').trim().length === 0) return;
                                let allItalic = true;
                                child.forEach((inline) => {
                                    if (inline.isText && !((inline.marks || []).some(m => m.type && m.type.name === 'italic'))) allItalic = false;
                                });
                                if (!allItalic) hasText = true;
                            });
                            if (trackable) dom.setAttribute('data-section-complete', hasText ? 'true' : 'false');
                            }
                        }
                    }
                }
            } catch (_) { /* never block render */ }

            // v7.20.55 (Neil): prediction-capture sections (type 'notes', pred-* fields —
            // AQA P2 planning) tick like fillable sections: complete when every pred-*
            // field holds text. Scoped to pred-* fieldIds ONLY so CN/General-Notes 'notes'
            // sections (which also carry inputFields) are untouched.
            try {
                if (type === 'notes') {
                    let predInputs = 0, predFilled = 0, otherInputs = 0;
                    node.descendants((c) => {
                        if (c.type && c.type.name === 'inputField') {
                            const fid = ((c.attrs && c.attrs.fieldId) || '');
                            if (/^pred-/.test(fid)) { predInputs++; if ((c.textContent || '').trim().length > 0) predFilled++; }
                            else otherInputs++;
                        }
                    });
                    if (predInputs > 0 && otherInputs === 0) {
                        dom.setAttribute('data-section-complete', predFilled === predInputs ? 'true' : 'false');
                    }
                }
            } catch (_) { /* never block render */ }

            // v7.19.760: the three STUDENT-FILLED assessment sections compute completion
            // HERE, at render time, from the node model — so the tick survives nodeView
            // rebuild (JS-set attrs get wiped, comment L88). Analytics is type 'feedback', so
            // the "any text = complete" block below forced it green (its h3 labels + the
            // "Number of opt-outs: —" line are non-placeholder text) → false green when empty.
            // Action Plan + Self-Assessment are type 'action' — not handled anywhere here, so
            // their externally-set tick was wiped on rebuild. One authoritative source now.
            let _assessHandled = false;
            try {
                const _lbl = (node.attrs && node.attrs.label) || '';
                if (_lbl === 'Analytics' || _lbl === 'Action Plan' || _lbl === 'Self-Assessment') {
                    let comp;
                    if (_lbl === 'Self-Assessment') {
                        comp = true; // complete unless a 5-scale dropdown is still "— / 5"
                        node.descendants((c) => {
                            if (c.type && c.type.name === 'paragraph' && /:\s*—\s*\/\s*5\s*$/.test((c.textContent || '').trim())) comp = false;
                        });
                    } else {
                        let inp = 0, inpFilled = 0;
                        node.descendants((c) => {
                            if (c.type && c.type.name === 'inputField') { inp++; if ((c.textContent || '').trim().length > 0) inpFilled++; }
                        });
                        comp = inp > 0 && inpFilled === inp; // every InputField filled
                        if (_lbl === 'Analytics') {
                            // the opt-out count must also be chosen ("Number of opt-outs: —" = not done)
                            node.descendants((c) => {
                                if (c.type && c.type.name === 'paragraph') {
                                    const t = (c.textContent || '').trim();
                                    if (/Number of opt-outs/i.test(t) && /—\s*$/.test(t)) comp = false;
                                }
                            });
                        }
                    }
                    dom.setAttribute('data-section-complete', comp ? 'true' : 'false');
                    _assessHandled = true;
                }
            } catch (_) { /* never block render */ }

            // v7.19.817: Score Summary (type 'scores') computes its tick at render time
            // too — same wipe-on-rebuild class as the three sections above. The recompute
            // pass (wml-assessment.js v767) set the attr from the DOM, but every nodeView
            // rebuild (pagination, the marking pass's own PM writes to this section)
            // recreated the dom WITHOUT it, so the tick never survived. Auto-derived
            // section: complete once the essay is MARKED — the "Total Marks" line shows a
            // number, not the "—" placeholder (Date Completed is the tutor's field and
            // does not gate this).
            try {
                if (type === 'scores') {
                    let comp = false, found = false;
                    node.descendants((c) => {
                        if (found || !c.type || c.type.name !== 'paragraph') return;
                        const t = (c.textContent || '').trim();
                        if (/Total Marks/i.test(t)) { found = true; comp = !/Total Marks:\s*—/i.test(t); }
                    });
                    dom.setAttribute('data-section-complete', comp ? 'true' : 'false');
                }
            } catch (_) { /* never block render */ }

            // v7.19.607: feedback boxes get a completion tick too — "complete" = the box
            // holds real (non-placeholder) feedback text. Computed from the node model so it
            // survives re-render. Lives OUTSIDE the read-only guard above because feedback is
            // read-only for students yet must still show its tick. (Skips Analytics — handled
            // above as a student-filled form, not an AI feedback box.)
            try {
                if (type === 'feedback' && !_assessHandled) {
                    const _txt = (node.textContent || '').trim();
                    const _placeholder = !_txt || /will appear after assessment|will be assessed here|appear here (?:after|once)|summary[\s\S]*will appear here/i.test(_txt);
                    // v7.19.823: mark-bearing boxes (label ends "(… / N)") also require the
                    // ACTUAL mark to be chosen (Neil 2026-07-02) — feedback content alone
                    // must not green the tick while the mark pill still reads "—" (the
                    // Predicted · Actual · Δ readout is only meaningful once Actual exists).
                    // Boxes with no mark pattern in the label (Overall Feedback, CW
                    // feedback) keep the content-only rule.
                    const _fbLblTxt = String((node.attrs && node.attrs.label) || '');
                    const _markPat = /\(\s*(—|\d+(?:\.\d+)?)\s*\/\s*\d+\s*\)\s*$/.exec(_fbLblTxt);
                    const _markChosen = !_markPat || _markPat[1] !== '—';
                    dom.setAttribute('data-section-complete', (!_placeholder && _markChosen) ? 'true' : 'false');
                }
            } catch (_) { /* never block render */ }

            // v7.19.607: feedback boxes are COLLAPSIBLE (manual toggle, persisted in
            // localStorage per page+label). Mirrors the chip path: content goes in an inner
            // contentDOM so the toggle button can be a sibling OUTSIDE the editable content,
            // and ignoreMutation firewalls it from ProseMirror. (Auto-collapse-on-complete is
            // deferred to the calibration tier — it needs the engagement/gap-reflection signal.)
            // v7.19.920 (Neil Run 8 ruling): CAPABILITY-KEYED, not type-guarded — the two
            // 'action' assessment forms (Self-Assessment / Action Plan) collapse too, and a
            // capability table names which sections carry a code-owned headline strip and
            // whether it shows always (Analytics, the v913 readout) or as the collapsed
            // preview (the others). wml-assessment's _renderSectionStrips fills them all.
            const _cvLabel = String((node.attrs && node.attrs.label) || dom.getAttribute('data-section-label') || '');
            // v7.19.928 (Neil Run 9): ALL strips are always-on — the headline preview is a
            // standing overview at the top of each section, not just a collapsed teaser
            // ("students can look at the detail below if they need to"). The 'collapsed'
            // machinery stays for any future strip that should only show as a teaser.
            const _STRIP_MODE = { 'Analytics': 'always', 'Self-Assessment': 'always', 'Action Plan': 'always', 'Overall Feedback': 'always', 'Score Summary': 'always' };
            // v7.19.926 (Neil Run 9): Score Summary ('scores') collapses too, with a
            // Total·%·Grade preview strip (builder in wml-assessment's _renderSectionStrips).
            // v7.19.957 (Neil): the Poetic Forms Knowledge Organiser's 'plan' sections (one
            // per form, ×11 + General Notes) collapse too — long reference doc, students tidy
            // mastered forms away. Scoped by the doc's canonical identity (canvasDocScope),
            // NOT by type alone: 'plan' sections in every other doc (CN concept sections,
            // planning boards) keep their current non-collapsible render. Default = expanded
            // (localStorage per page+label, same as every collapsible); the FQ autofill
            // auto-expands the section it files into (v912 fill-visibility law).
            // v7.19.971: gate = the poetry-CN doc FAMILY (isPoetryCnDoc — forms organiser
            // + per-poem groups, one doc per anthology), with the legacy poetic_forms
            // scope kept as fallback for stale bundles. Never a literal task name.
            let _isOrganiserDoc = false;
            try {
                _isOrganiserDoc = !!(window.WML && (
                    (typeof window.WML.isPoetryCnDoc === 'function' && window.WML.isPoetryCnDoc())
                    // v7.20.38: nonfiction anthology one-doc is organiser-like too (per-item groups,
                    // collapsible/stacked). isNonfictionSubject() is subject-keyed → TASK-INDEPENDENT
                    // (matches both the CN render and the FQ render, same reason as _isLitCnDoc).
                    || (typeof window.WML.isNonfictionSubject === 'function' && window.WML.isNonfictionSubject())
                    || (typeof window.WML.canvasDocScope === 'function' && window.WML.canvasDocScope().text === 'poetic_forms')));
            } catch (_) { _isOrganiserDoc = false; }
            // v7.20.17 (Part B step 2 fix): literature CN docs are collapsible too — this is
            // what makes them STACK. Collapsibility triggers the nested .swml-section-content
            // wrapper below, so the input fields are NOT direct children of .swml-section-plan
            // → the :has(> _quotes) side-column CSS can't fire → notes/quotes/effect stack
            // full-width (exactly like poetry). Doc-level gate via the CN registry (literature
            // family only — poetry already handled by _isOrganiserDoc; unseen/forms → null).
            // v7.20.26 (Neil): detect the lit CN doc by its FIELD SHAPE (a cn_* field in this plan
            // section — content-addressed, same idiom as _isPoemGroup below), NOT via cnFamily(),
            // which returns null unless task==='conceptual_notes'. The Foundational Quiz renders the
            // SAME lit CN doc under task='foundational_quiz', so the task-gated check went false →
            // sections weren't made collapsible → boxes fell to the direct-child flex rule (3 cramped
            // columns). Content-addressed = TASK-INDEPENDENT → the FQ render now matches the CN render
            // (collapsible + stacked), the ROOT fix for the FQ/CN divergence. `cn_` catches BOTH the
            // concept sections (cn_section_N) AND General Notes (cn_general_notes); poetry (poem_/pf_
            // fields) is untouched — already collapsible via _isOrganiserDoc. Same collapsible NodeView
            // path CN already uses → no new PM foreign-mutation/freeze surface.
            let _isLitCnDoc = false;
            if (type === 'plan') {
                try {
                    node.descendants((n) => {
                        if (n.type && n.type.name === 'inputField'
                            && /^cn_/.test(String((n.attrs && n.attrs.fieldId) || ''))) _isLitCnDoc = true;
                        return !_isLitCnDoc;
                    });
                } catch (_) { _isLitCnDoc = false; }
            }
            // v7.19.971: per-poem section-group detection — by the STABLE poem_ fieldId
            // prefix in the node model (content-addressed; data-* attrs on the wrapper
            // don't survive the HTML round-trip, fieldIds do).
            let _isPoemGroup = false;
            if (_isOrganiserDoc && type === 'plan') {
                // v7.20.38: per-ITEM anthology group = a section whose input fields use an anthology
                // family's prefix (poem_ poetry, nf_ nonfiction, prose_ prose). Content-addressed
                // (house idiom, NOT cnFamily()) — prefixes derived from the CN family registry when
                // present, else the known anthology set. Poetry (poem_) behaviour is unchanged.
                let _antRe;
                try {
                    const _fams = window.WML && window.WML.CN_FAMILIES; const _ps = [];
                    if (_fams) Object.keys(_fams).forEach((k) => { if (_fams[k] && _fams[k].roster === 'anthology' && _fams[k].prefix) _ps.push(_fams[k].prefix); });
                    _antRe = new RegExp('^(' + (_ps.length ? _ps.join('|') : 'poem|nf|prose') + ')_');
                } catch (_) { _antRe = /^(poem|nf|prose)_/; }
                try {
                    node.descendants((n) => {
                        if (n.type && n.type.name === 'inputField' && _antRe.test(String((n.attrs && n.attrs.fieldId) || ''))) _isPoemGroup = true;
                        return !_isPoemGroup;
                    });
                } catch (_) { _isPoemGroup = false; }
            }
            const _collapsible = type === 'feedback' || type === 'scores'
                || type === 'outline' /* v7.20.89 (Neil A3): outline sections collapse like assessment docs */
                || type === 'mark_scheme_response' || type === 'notice' /* v7.20.89 (Neil B7): MSA doc parity */
                || (type === 'action' && (_cvLabel === 'Self-Assessment' || _cvLabel === 'Action Plan'))
                /* v7.20.96 (Neil universal-consistency ruling, 2026-07-14): plan + response
                   collapse EVERYWHERE (was plan on organiser/CN docs only); keyword/Question-
                   Focus 'notes' collapse on essay-flow docs — CN docs keep their current notes
                   layout until the CN-STANDARD look is decided (pending Neil). */
                || type === 'plan' || type === 'response'
                || (type === 'notes' && !_isOrganiserDoc && !_isLitCnDoc);
            if (_collapsible) {
                const contentDOM = document.createElement('div');
                contentDOM.className = 'swml-section-content';
                dom.appendChild(contentDOM);

                const fbLabel = _cvLabel;

                // v7.19.913: headline readout strip — IN-FLOW (the progress-card/sign-off
                // technique). A firewalled strip ABOVE the content wraps freely and occupies
                // real layout space; wml-assessment fills it via WML.renderAnalyticsReadout
                // on every (re)mount + overlay rebuild. 'collapsed' mode = visible only while
                // the section is collapsed (the preview); 'always' = the Analytics readout.
                let anaStrip = null;
                // v7.20.89 (Neil B7): generic collapsed-only TEASER strip for collapsible
                // sections with no bespoke builder (outline / MSA / notice) — collapsed view
                // previews the section's first line ("headline first, detail on expand").
                // Filled by the same _renderSectionStrips pass (data-strip-teaser branch).
                const _teaser = !_STRIP_MODE[fbLabel]
                    && (type === 'outline' || type === 'mark_scheme_response' || type === 'notice'
                        /* v7.20.96: the newly-collapsible families get the same first-line preview */
                        || type === 'plan' || type === 'response' || type === 'notes');
                if (_STRIP_MODE[fbLabel] || _teaser) {
                    anaStrip = document.createElement('div');
                    anaStrip.className = 'swml-ana-strip' + ((_teaser || _STRIP_MODE[fbLabel] === 'collapsed') ? ' swml-strip-collapsed-only' : '');
                    anaStrip.setAttribute('data-strip', fbLabel);
                    if (_teaser) anaStrip.setAttribute('data-strip-teaser', '1');
                    anaStrip.setAttribute('contenteditable', 'false');
                    dom.insertBefore(anaStrip, contentDOM);
                    const _fillAna = () => {
                        try {
                            if (window.WML && typeof window.WML.renderAnalyticsReadout === 'function') {
                                window.WML.renderAnalyticsReadout();
                            }
                        } catch (_) { /* ignore */ }
                    };
                    requestAnimationFrame(_fillAna);
                    setTimeout(_fillAna, 250);
                    setTimeout(_fillAna, 800);
                }

                // v7.19.951: in-flow CONTROL ROW (overlay naturalization, Neil ruling
                // 2026-07-08) — the mark selector + Predicted·Actual·Δ readout, SA dropdowns,
                // grade / grade-goal / opt-out pill rows all render HERE, inside the section,
                // instead of the old absolutely-positioned .swml-dropdown-layer that detached
                // on fast scroll. Same PM-firewalled derived-display technique as the
                // ana-strip above; wml-assessment fills it via WML.renderControlRows
                // (sig-idempotent) on (re)mount + every overlay rebuild. Starts hidden —
                // stays hidden when the fill finds nothing for this section.
                const ctlRow = document.createElement('div');
                ctlRow.className = 'swml-ctl-row';
                ctlRow.setAttribute('contenteditable', 'false');
                ctlRow.style.display = 'none';
                dom.insertBefore(ctlRow, contentDOM);

                // v7.19.992: read-along POEM CARD — per-poem groups only. Derived display
                // (the anaStrip/progress-card technique): an empty firewalled slot here,
                // filled by wml-assessment's WML.renderPoemCards from GET /poems (poem
                // texts are NEVER persisted into the student doc — admin edits propagate,
                // autosaves stay slim). Collapsible; the active poem auto-expands.
                let poemCard = null;
                if (_isPoemGroup) {
                    poemCard = document.createElement('div');
                    poemCard.className = 'swml-poem-card';
                    poemCard.setAttribute('contenteditable', 'false');
                    dom.insertBefore(poemCard, contentDOM);
                    const _fillPoem = () => {
                        try {
                            if (window.WML && typeof window.WML.renderPoemCards === 'function') {
                                window.WML.renderPoemCards();
                            }
                        } catch (_) { /* ignore */ }
                    };
                    requestAnimationFrame(_fillPoem);
                    setTimeout(_fillPoem, 250);
                    setTimeout(_fillPoem, 800);
                }
                const _fillCtl = () => {
                    try {
                        if (window.WML && typeof window.WML.renderControlRows === 'function') {
                            window.WML.renderControlRows();
                        }
                    } catch (_) { /* ignore */ }
                };
                requestAnimationFrame(_fillCtl);
                setTimeout(_fillCtl, 250);
                setTimeout(_fillCtl, 800);

                let COLLAPSE_KEY = '';
                try { COLLAPSE_KEY = 'swml_fbcollapse:' + location.pathname + ':' + fbLabel; } catch (_) { COLLAPSE_KEY = ''; }
                // v7.20.6 (Neil): expose the collapse-key on the wrapper so a programmatic
                // expand (poetry-CN poem-open) can PERSIST '0' the same way the manual chevron
                // does. Without this, a fill-driven NodeView redraw re-reads the default-collapsed
                // rule (391) and snaps an open poem shut mid-element. Construction-time attr,
                // covered by the wrapper-attr firewall (471). Idempotent same-value write.
                try { if (COLLAPSE_KEY && dom.dataset.collapseKey !== COLLAPSE_KEY) dom.dataset.collapseKey = COLLAPSE_KEY; } catch (_) { /* dataset off */ }
                // v7.19.971: per-poem groups default COLLAPSED (Neil ruling — 15 poem rows
                // are a map of the anthology; the poem being worked on auto-expands via the
                // v912 fill-visibility law). A student's explicit toggle ('0') still wins.
                let collapsed = false;
                try {
                    const _stored = COLLAPSE_KEY ? localStorage.getItem(COLLAPSE_KEY) : null;
                    collapsed = _stored === '1' || (_stored === null && _isPoemGroup);
                } catch (_) { collapsed = _isPoemGroup; }
                if (collapsed) dom.classList.add('swml-fb-collapsed');

                // v7.19.971: render-time task lock — during the FQ the per-poem groups are
                // CN-lesson territory: display-only. Class stamped at NodeView CONSTRUCTION
                // (part of the created DOM, before PM mounts it — no post-mount mutation,
                // §PM NodeView law), derived from state.task on each render and NEVER
                // persisted (a lock baked into saved HTML would freeze the CN lesson —
                // the v955 one-doc law).
                // v7.19.973 (Neil: still editable): CSS pointer-events blocked the mouse but
                // not keyboard/arrow-key caret entry — enforce with contenteditable=false,
                // the SAME mechanism baked-readonly sections use (renderHTML stamps it).
                // Construction-time attribute; the wrapper-attr firewall covers it besides.
                try {
                    const _st = getStateRef() || (window.WML && window.WML.state) || null;
                    const _fqLock = !!(_isPoemGroup && _st && _st.task === 'foundational_quiz');
                    if (_fqLock) {
                        dom.classList.add('swml-task-locked');
                        dom.setAttribute('contenteditable', 'false');
                    }
                    if (_isPoemGroup && !window.__swmlPoemLockDbg) {
                        window.__swmlPoemLockDbg = true;
                        console.info('[WML poetry-CN] poem-group NodeView: task =', _st && _st.task, '→ fq-locked =', _fqLock);
                    }
                } catch (_) { /* never block render */ }

                // v7.19.925: ANY section that carries the collapse chevron stamps this class —
                // the completion-tick clearance (right:44px) keys off it, so the tick can never
                // sit under the chevron on a new collapsible type (the v762 bug re-appeared on
                // Self-Assessment when v920 gave action forms the chevron but the CSS shift was
                // still enumerated to .swml-section-feedback only). Capability class, no type list.
                dom.classList.add('swml-collapsible');
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'swml-fb-toggle';
                toggle.setAttribute('contenteditable', 'false');
                toggle.setAttribute('aria-label', 'Collapse or expand'); /* v7.20.96 (Neil): generic — not every collapsible section is feedback */
                toggle.setAttribute('data-tooltip', 'Collapse / expand'); /* v7.20.97 (Neil): generic — the chevron lives on every section family now */
                toggle.innerHTML = '<span class="swml-fb-chevron" aria-hidden="true"></span>';
                toggle.addEventListener('mousedown', (ev) => { ev.preventDefault(); ev.stopPropagation(); });
                toggle.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const nowCollapsed = dom.classList.toggle('swml-fb-collapsed');
                    try { if (COLLAPSE_KEY) localStorage.setItem(COLLAPSE_KEY, nowCollapsed ? '1' : '0'); } catch (_) { /* storage off */ }
                    // v7.19.920: refresh headline strips so a just-collapsed section previews live data.
                    try { if (window.WML && window.WML.renderAnalyticsReadout) window.WML.renderAnalyticsReadout(); } catch (_) { /* best-effort */ }
                    if (window.console) console.log('[WML feedback] collapse toggle', JSON.stringify(fbLabel), '→', nowCollapsed ? 'collapsed' : 'expanded');
                    // v7.19.814 (Neil): expanding while sat near the viewport top made the
                    // section appear to grow UPWARDS (scroll anchoring holds the content
                    // below steady), leaving the student at its bottom. If the expanded
                    // section's top sits above the visible area, scroll it to the top so
                    // reading always starts at the start of the feedback.
                    if (!nowCollapsed) {
                        requestAnimationFrame(() => {
                            try {
                                const sc = dom.closest('.swml-canvas-content');
                                if (sc) {
                                    const dr = dom.getBoundingClientRect();
                                    const cr = sc.getBoundingClientRect();
                                    if (dr.top < cr.top) sc.scrollTo({ top: sc.scrollTop + (dr.top - cr.top) - 16, behavior: 'smooth' });
                                } else if (dom.getBoundingClientRect().top < 0) {
                                    dom.scrollIntoView({ block: 'start', behavior: 'smooth' });
                                }
                            } catch (_) { /* never block the toggle */ }
                        });
                    }
                });
                dom.appendChild(toggle);

                return {
                    dom,
                    contentDOM,
                    ignoreMutation: (mutation) => {
                        if (!mutation || !mutation.target) return false;
                        // v7.19.912: wrapper-attr firewall (the v7.19.866 rule) — collapse-class
                        // writes on this dom (manual chevron toggle + the fill's auto-expand in
                        // wml-assessment) are display-only, never a doc change; without this each
                        // toggle fires a DOMObserver flush → needless full NodeView redraw.
                        if (mutation.type === 'attributes' && mutation.target === dom) return true;
                        // v7.19.913: the in-flow Analytics readout strip is derived display —
                        // firewall its fills like the progress card / sign-off UI.
                        if (anaStrip && (anaStrip === mutation.target || anaStrip.contains(mutation.target))) return true;
                        // v7.19.951: the in-flow control row is derived display too — its fills
                        // (widgets, data-sig, display toggles) must never reach PM's DOMObserver.
                        if (ctlRow === mutation.target || ctlRow.contains(mutation.target)) return true;
                        // v7.19.992: the poem card is derived display (renderPoemCards fills +
                        // toggles it) — firewall it or every fill is a foreign mutation (§PM law).
                        if (poemCard && (poemCard === mutation.target || poemCard.contains(mutation.target))) return true;
                        return toggle === mutation.target || toggle.contains(mutation.target);
                    },
                    // v7.20.90 (ctlrows-storm amplifier fix): WITHOUT update(), every doc
                    // transaction destroyed + recreated this NodeView — re-arming the three
                    // _fillCtl timers per section (~40 collapsible sections on the big doc
                    // tripped the >50/s breaker) and re-reading the collapse default (the
                    // v7.20.6 snap-shut landmine). Same-identity updates keep the DOM; PM
                    // manages contentDOM children itself. Completion attr stays fresh via
                    // the DOM recompute path (checkSectionComplete), whose attr writes the
                    // wrapper-attr firewall above already ignores.
                    update: (updatedNode) => {
                        if (!updatedNode.type || updatedNode.type.name !== node.type.name) return false;
                        const ua = updatedNode.attrs || {};
                        const na = node.attrs || {};
                        if (ua.sectionType !== na.sectionType || (ua.label || '') !== (na.label || '')) return false;
                        node = updatedNode;
                        return true;
                    },
                };
            }

            // v7.19.497: Progress-summary section — a REAL doc node (reserves layout
            // space, sits cleanly above the sign-off, unlike the prior floating overlay).
            // Renders a non-editable derived card; the live %/links are filled by
            // wml-assessment._updateProgressSummary after each completion recompute.
            // A hidden content hole satisfies the sectionBlock schema; ignoreMutation
            // firewalls the external card writes from ProseMirror's observer.
            if (type === 'progress') {
                const card = document.createElement('div');
                card.className = 'swml-progress-card';
                card.setAttribute('contenteditable', 'false');
                const contentDOM = document.createElement('div');
                contentDOM.className = 'swml-progress-content-hole';
                dom.appendChild(card);
                dom.appendChild(contentDOM);
                // Fill on mount, after sibling section nodeViews have set their
                // data-section-complete attrs — kills the empty-box flash and the
                // stuck-collapsed state. A few staggered retries cover late attr
                // timing / pagination remounts (v7.19.499).
                const _fill = () => {
                    try {
                        if (window.WML && typeof window.WML.updateProgressSummary === 'function') {
                            window.WML.updateProgressSummary();
                        }
                    } catch (_) { /* ignore */ }
                };
                requestAnimationFrame(_fill);
                setTimeout(_fill, 250);
                setTimeout(_fill, 800);
                return {
                    dom,
                    contentDOM,
                    ignoreMutation: (mutation) => {
                        if (!mutation || !mutation.target) return false;
                        // v7.19.866: firewall ALSO the derived-card wrapper's OWN attribute
                        // writes (wml-assessment._renderProgressCardBody toggles this
                        // .swml-section-block's style.display to hide the card when nothing is
                        // trackable). Without this, that runtime style write is a foreign
                        // mutation → PM's DOMObserver flush → full NodeView redraw → the card
                        // re-fills (rAF+250+800) → re-writes display → infinite remount loop on
                        // large docs where `total` flickers during mount (staging lang-P1 T1P1
                        // freeze, 2026-07-04). The card + our own wrapper attrs are display-only.
                        if (mutation.type === 'attributes' && mutation.target === dom) return true;
                        return card === mutation.target || card.contains(mutation.target);
                    },
                };
            }

            // v7.19.828: Sign-off section — the interactive UI (disclaimer/checkbox/
            // Sign Off button, or the signed badge) renders IN-FLOW inside the section
            // (the progress-card technique) instead of the old absolutely-positioned
            // .swml-dropdown-overlay-signoff, which drifted off its section on
            // resize/zoom until a scroll re-seated it. A firewalled footer div sits
            // after the PM content; wml-assessment fills it via WML.renderSignoffUI
            // on every (re)mount, so it survives pagination remounts.
            if (type === 'signoff') {
                const contentDOM = document.createElement('div');
                contentDOM.className = 'swml-section-content';
                dom.appendChild(contentDOM);
                // v7.20.196 (Neil): the optional tutor free-comment box is a SECOND firewalled footer
                // ABOVE the sign-off UI, in the SAME sign-off section. Rendered chrome (not PM doc), so
                // it rides everywhere sign-off does and needs NO doc-shape heal for existing docs. Its
                // text persists to the _tutorcomment sidecar via WML.renderTutorCommentUI.
                const noteFoot = document.createElement('div');
                noteFoot.className = 'swml-tutorcomment-ui';
                noteFoot.setAttribute('contenteditable', 'false');
                dom.appendChild(noteFoot);
                const foot = document.createElement('div');
                foot.className = 'swml-signoff-ui';
                foot.setAttribute('contenteditable', 'false');
                dom.appendChild(foot);
                const _fill = () => {
                    try {
                        if (window.WML && typeof window.WML.renderTutorCommentUI === 'function') {
                            window.WML.renderTutorCommentUI();
                        }
                    } catch (_) { /* ignore */ }
                    try {
                        if (window.WML && typeof window.WML.renderSignoffUI === 'function') {
                            window.WML.renderSignoffUI();
                        }
                    } catch (_) { /* ignore */ }
                };
                requestAnimationFrame(_fill);
                setTimeout(_fill, 250);
                setTimeout(_fill, 800);
                return {
                    dom,
                    contentDOM,
                    ignoreMutation: (mutation) => {
                        if (!mutation || !mutation.target) return false;
                        // v7.19.866: same wrapper-attr firewall as the progress card — any runtime
                        // style/attr write on THIS section-block dom is display-only, never a doc
                        // change, so it must not trigger a DOMObserver flush/redraw loop.
                        if (mutation.type === 'attributes' && mutation.target === dom) return true;
                        return foot === mutation.target || foot.contains(mutation.target)
                            || noteFoot === mutation.target || noteFoot.contains(mutation.target);
                    },
                    // v7.20.197 (Neil): the tutor-comment <textarea> lives in noteFoot. Without this,
                    // ProseMirror intercepts its keystrokes (PM owns keydown for the editable view) so
                    // the box renders but can't be TYPED into. stopEvent tells PM to leave events that
                    // originate in the footer UIs to the DOM — so the textarea gets its keyboard, and
                    // the sign-off checkbox/button keep working (they never needed it, harmless here).
                    stopEvent: (event) => {
                        const t = event && event.target;
                        return !!(t && (noteFoot.contains(t) || foot.contains(t)));
                    },
                };
            }

            // v7.20.168 (Neil QUEUE-A): PLAN/OUTLINE dividers get a firewalled in-flow ctlRow so
            // the "Transfer All" button renders as a real HTML sibling — the last absolute overlay
            // (.swml-transfer-layer) is retired. SCOPED to just these two divider labels; every
            // other divider (structural headings, STORY SPINE, RESPONSE, etc.) keeps the flat
            // default path below untouched (zero blast radius). contentDOM holds the heading text;
            // ctlRow is a display-only sibling filled by WML.renderControlRows; ignoreMutation keeps
            // its fills off PM's DOMObserver (the derived-card technique — §PM law).
            if (type === 'divider') {
                const _dLabel = (node.attrs && node.attrs.label) || '';
                const _isTransferDivider = /^ESSAY\s*PLAN/i.test(_dLabel) || /^PLAN\s*—/i.test(_dLabel)
                    || /^YOUR\s*(?:ESSAY\s*)?PLAN/i.test(_dLabel) || /^OUTLINE/i.test(_dLabel);
                if (_isTransferDivider) {
                    // marker class → CSS lays this divider out as a flex row (heading left,
                    // Transfer-All right) WITHOUT a :has() dependency. Construction-time attr,
                    // covered by the wrapper-attr firewall in ignoreMutation below.
                    dom.classList.add('swml-divider-has-ctl');
                    const contentDOM = document.createElement('div');
                    contentDOM.className = 'swml-divider-content';
                    dom.appendChild(contentDOM);

                    const ctlRow = document.createElement('div');
                    ctlRow.className = 'swml-ctl-row swml-ctl-row-divider';
                    ctlRow.setAttribute('contenteditable', 'false');
                    ctlRow.style.display = 'none';
                    dom.appendChild(ctlRow);

                    const _fillCtl = () => {
                        try {
                            if (window.WML && typeof window.WML.renderControlRows === 'function') {
                                window.WML.renderControlRows();
                            }
                        } catch (_) { /* ignore */ }
                    };
                    requestAnimationFrame(_fillCtl);
                    setTimeout(_fillCtl, 250);
                    setTimeout(_fillCtl, 800);

                    return {
                        dom,
                        contentDOM,
                        ignoreMutation: (mutation) => {
                            if (!mutation || !mutation.target) return false;
                            if (mutation.type === 'attributes' && mutation.target === dom) return true;
                            if (ctlRow === mutation.target || ctlRow.contains(mutation.target)) return true;
                            return false;
                        },
                        update: (updatedNode) => {
                            if (!updatedNode.type || updatedNode.type.name !== node.type.name) return false;
                            const ua = updatedNode.attrs || {};
                            const na = node.attrs || {};
                            if (ua.sectionType !== na.sectionType || (ua.label || '') !== (na.label || '')) return false;
                            node = updatedNode;
                            return true;
                        },
                    };
                }
            }

            const st = getStateRef();
            const showChip = !!st
                && st.task === 'exam_crib'
                && CHIPPED_TYPES.has(type);

            if (!showChip) {
                // Default path: dom IS contentDOM. Zero behavioural change vs renderHTML output.
                // v7.20.200 — THE SAME WRAPPER-ATTR FIREWALL the chip path below already carries
                // (added .125), but MISSED on THIS return. Non-exam_crib docs (every ordinary
                // lesson) take this path, so their sections had NO ignoreMutation at all. Two
                // runtime attr writes land on every section's own dom: coloriseSectionGroups
                // (wml-assessment.js:42705 — `style.setProperty('border-left-color', …)`) and
                // data-section-num (.897). Un-firewalled, each is a foreign `attributes` mutation
                // → PM DOMObserver flush → updateState → redraw every NodeView → the sign-off
                // NodeView is recreated → the tutor-comment <textarea> inside it is destroyed
                // mid-type (text lost, comment never saves, vanishes on nav) + the ctlrows fill
                // storm the breaker reported. Caught by Neil's console: the captured stack was
                // colorise@42705 → PM observer → flush → redraw → _fillCtl. These wrapper attrs are
                // DISPLAY-ONLY; PM's source of truth is the doc, never this DOM. Content edits are
                // childList/characterData (dom IS contentDOM here), never `attributes`, so they are
                // untouched. Same line, same reason, as the chip/sign-off/divider siblings.
                return {
                    dom, contentDOM: dom,
                    ignoreMutation: (mutation) => {
                        if (!mutation || !mutation.target) return false;
                        if (mutation.type === 'attributes' && mutation.target === dom) return true;
                        return false;
                    },
                };
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
                    // v7.20.125 — THE MISSING WRAPPER-ATTR FIREWALL. Caught by Neil's console:
                    // the '"ctlrows" derived-card fill storm' breaker fired on R&J, and the stack
                    // named updateOutline → wml-assessment.js:16299 → `attributes` → PM observer
                    // → flush → redraw → _fillCtl → storm.
                    // ROOT: v7.19.866/912 added this exact firewall to the DERIVED-CARD NodeViews
                    // (progress ~638, sign-off ~682, analytics ~570) but MISSED this one — the
                    // GENERAL section NodeView that renders every ordinary section. v7.19.897 then
                    // introduced a runtime attr write (`data-section-num`) on every section's dom
                    // and asserted it was "firewalled on the section-block dom exactly like
                    // data-section-complete above (proven no PM flush-loop)". That proof belonged
                    // to the derived-card NodeViews; it never applied here. The write is idempotent,
                    // which is NOT enough: sections mount raggedly, so the computed number genuinely
                    // CHANGES between passes → real write → foreign mutation → flush → redraw →
                    // re-number → compounding loop until the breaker trips (and suppressing ctlrows
                    // fills means control rows stop rendering — the visible damage).
                    // Our runtime attrs on this wrapper (data-section-num / -complete / -codex-num,
                    // collapse classes, style) are DISPLAY-ONLY and never a doc change; PM's source
                    // of truth is the doc, not this DOM. Same line, same reason, as the siblings.
                    if (mutation.type === 'attributes' && mutation.target === dom) return true;
                    if (chip === mutation.target || chip.contains(mutation.target)) return true;
                    if (pullChip && (pullChip === mutation.target || pullChip.contains(mutation.target))) return true;
                    // v7.20.126 probe REMOVED at .127 — it did its job by finding NOTHING. Zero
                    // un-firewalled mutations reached here on the R&J load that was "storming",
                    // which disproved the flush-loop diagnosis outright and turned the search to
                    // the breaker itself (it was false-positiving on a healthy 53-section mount).
                    // Keep this in mind before re-opening a firewall hunt here: the evidence says
                    // this NodeView's mutations are fully firewalled.
                    return false;
                },
            };
        };
    }

    window.WML = window.WML || {};
    window.WML.SectionBlock = window.WML.SectionBlock || {};
    window.WML.SectionBlock.createNodeView = createNodeView;
})();
