/**
 * WML Core — Shared namespace, state, constants, utilities
 * Extracted from wml-app.js v7.12.60
 *
 * This module sets up window.WML with all shared dependencies.
 * Other modules (wml-app.js, future wml-assessment.js, wml-planning.js)
 * consume from this namespace.
 */

// v7.20.252 (Fable F1): the BUILD version baked into this FILE (not the page HTML). Logged on load
// so "is the client running stale JS?" is answerable by a console screenshot — if this prints an
// OLD version, the browser/CDN is serving a cached bundle and no server-side fix can reach that tab.
// Pre-ship (bin/pre-ship-check.sh) asserts this string === SWML_VERSION so it can never drift.
var WML_BUILD = '7.20.587';
try { console.log('%cWML build ' + WML_BUILD, 'color:#5333ed;font-weight:bold'); } catch (_) {}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// v7.20.484 (#361) — PUBLISH THE WP ADMIN BAR'S HEIGHT, BY MEASUREMENT.
// ───────────────────────────────────────────────────────────────────────────────────────────
// The embedded canvas is sized `calc(100dvh - <spl header> - <this>)` and offset by the sum of
// the two. Before this, only the SPL header was subtracted, so on any account WITH an admin bar
// the shell overshot the bottom of the viewport by exactly the bar's height and the bottom of
// the status footer sat under the glass. Measured on prod .482: canvas top 92 (= 32 + 60),
// bottom 1029, viewport ~997.
//
// ⚠️ MEASURED, NOT ASSUMED — the constant is wrong more often than it is right:
//   · 32px on desktop but 46px below 783px;
//   · `position: fixed` on desktop and `position: absolute` on mobile, where it SCROLLS AWAY and
//     must NOT be subtracted — counting it there would shorten the canvas by 46px for nothing;
//   · absent entirely for students, which is why this resolves to 0px and changes nothing for
//     them. This is a fix for the logged-in admin view, i.e. for Neil's own QA surface.
//
// Mirrors how the LearnDash lane publishes `--spl-header-height` (v7.20.459): a measurement on
// the root element, republished on the events that can change it, so neither lane has to
// remember anything. `focusSpaNavigated` is the Focus SPA's re-boot event — spelled exactly that
// way (reference_focus_spa_reboot_event_is_focusSpaNavigated).
(function () {
    function publishAdminBar() {
        try {
            const bar = document.getElementById('wpadminbar');
            let h = 0;
            if (bar) {
                const cs = getComputedStyle(bar);
                // Only chrome that genuinely holds the top of the viewport counts. A mobile
                // admin bar is `absolute` and scrolls out of the way — subtracting it would
                // leave a permanent 46px gap at the bottom.
                if (cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden') {
                    h = Math.round(bar.getBoundingClientRect().height) || 0;
                }
            }
            document.documentElement.style.setProperty('--swml-admin-bar', h + 'px');
        } catch (e) {}
    }
    publishAdminBar();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', publishAdminBar);
    }
    window.addEventListener('resize', publishAdminBar);
    window.addEventListener('focusSpaNavigated', publishAdminBar);
    try { if (window.WML) window.WML._publishAdminBar = publishAdminBar; } catch (e) {}
})();

// v7.15.39: Mark a shared document as viewed when a tutor opens the review URL.
// The Sophicly Toasts plugin shows a "Document Shared" toast to tutors that
// links here with ?review=1&share_id=N. Firing this flips the row's status
// from 'pending' to 'viewed' so the toast stops reappearing on every page load.
// Fire-and-forget — tutors don't need a confirmation UI.
(function () {
    try {
        var params = new URLSearchParams(window.location.search);
        if (params.get('review') !== '1') return;
        var shareId = parseInt(params.get('share_id'), 10);
        if (!shareId) return;
        var cfg = window.swmlConfig || {};
        if (!cfg.restUrl || !cfg.nonce) return;
        // cfg.restUrl is '/wp-json/writing-mastery-lab/v1/'; the sibling
        // document-shares endpoint lives under '/wp-json/sophicly/v1/'.
        var shareEndpoint = cfg.restUrl.replace('/writing-mastery-lab/v1/', '/sophicly/v1/')
            + 'document-shares/' + shareId + '/view';
        fetch(shareEndpoint, {
            method: 'POST',
            headers: { 'X-WP-Nonce': cfg.nonce },
        }).catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
})();

// v7.19.234: Global styled-tooltip system.
// Replaces ad-hoc per-surface tooltip code and the browser-native title tooltip.
// Reads from `data-tooltip` OR `title`. On hover, immediately strips `title`
// (preventing browser-native race) and reveals the styled tooltip after a delay.
// On mouse-leave, restores the `title` so non-WML consumers (screen readers,
// browser bookmarks) still see the label. Tracks `currentEl` to ignore re-entry
// on child nodes of the same hovered element — child entries no longer reset
// the reveal timer.
(function () {
    if (window.__swmlTooltipInstalled) return;
    window.__swmlTooltipInstalled = true;

    function init() {
        const tooltip = document.createElement('div');
        tooltip.className = 'swml-tooltip';
        // v7.19.241: seed inline hide with !important. Some cascade rule (LD
        // focus mode / Etch theme) forces opacity:1 / visibility:visible on
        // generic divs and beats both CSS default and regular inline style.
        // Inline !important beats !important cascade (highest cascade rank).
        tooltip.style.setProperty('opacity', '0', 'important');
        tooltip.style.setProperty('visibility', 'hidden', 'important');
        document.body.appendChild(tooltip);

        let currentEl = null;
        let timer = null;
        const HOVER_DELAY = 500;

        function findTipEl(target) {
            let el = target;
            while (el && el !== document.body && el.nodeType === 1) {
                if (el.dataset && el.dataset.tooltip) return el;
                if (el.hasAttribute && el.hasAttribute('title') && el.getAttribute('title')) return el;
                el = el.parentElement;
            }
            return null;
        }

        function showTooltip(el, label) {
            tooltip.textContent = label;
            // v7.19.241: switch inline !important to opacity:1 / visibility:visible.
            // Plain inline-clear doesn't work because some cascade rule forces
            // opacity/visibility — only !important inline beats !important cascade.
            tooltip.style.setProperty('opacity', '1', 'important');
            tooltip.style.setProperty('visibility', 'visible', 'important');
            // Reset position attrs so getBoundingClientRect picks the new label width
            tooltip.classList.add('visible');
            const rect = el.getBoundingClientRect();
            const tipRect = tooltip.getBoundingClientRect();
            let top, left, placement;
            // v7.19.450: opt-in right placement (data-tooltip-pos="right"). Used by the
            // stacked outline/resources buttons, whose below-tooltips overlapped the panel.
            if ((el.dataset && el.dataset.tooltipPos) === 'right') {
                left = rect.right + 8;
                top = rect.top + rect.height / 2 - tipRect.height / 2;
                top = Math.max(4, Math.min(top, window.innerHeight - tipRect.height - 4));
                placement = 'right';
            } else {
                // Default: below the element; flip above if no room below
                top = rect.bottom + 8;
                placement = 'below';
                if (top + tipRect.height > window.innerHeight - 4) {
                    top = rect.top - tipRect.height - 8;
                    placement = 'above';
                }
                left = rect.left + rect.width / 2 - tipRect.width / 2;
                // Clamp horizontally within viewport
                left = Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4));
            }
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.dataset.placement = placement;
        }

        function hideTooltip() {
            clearTimeout(timer);
            tooltip.classList.remove('visible');
            // v7.19.241: inline !important — see init() comment. Regular inline
            // didn't hold on prod (some cascade rule forces visibility:visible
            // !important on generic divs). Inline !important beats it.
            tooltip.style.setProperty('opacity', '0', 'important');
            tooltip.style.setProperty('visibility', 'hidden', 'important');
            if (currentEl && currentEl._swmlTitleBackup !== undefined) {
                try { currentEl.setAttribute('title', currentEl._swmlTitleBackup); } catch (_) {}
                delete currentEl._swmlTitleBackup;
            }
            currentEl = null;
        }

        document.addEventListener('mouseover', (ev) => {
            const el = findTipEl(ev.target);
            if (!el) {
                if (currentEl) hideTooltip();
                return;
            }
            if (el === currentEl) return;
            // Switching elements: hide first
            if (currentEl) hideTooltip();
            currentEl = el;
            // Capture label; backup + strip native title so browser doesn't race
            let label = (el.dataset && el.dataset.tooltip) || '';
            if (!label && el.hasAttribute('title')) {
                label = el.getAttribute('title') || '';
                if (label) {
                    el._swmlTitleBackup = label;
                    try { el.removeAttribute('title'); } catch (_) {}
                }
            }
            if (!label) return;
            clearTimeout(timer);
            timer = setTimeout(() => showTooltip(el, label), HOVER_DELAY);
        }, true);

        document.addEventListener('mouseout', (ev) => {
            if (!currentEl) return;
            // If moving to a child of currentEl, ignore
            const related = ev.relatedTarget;
            if (related && currentEl.contains(related)) return;
            hideTooltip();
        }, true);

        // Hide on scroll / wheel / pointerdown to avoid stuck tooltip
        const interruptEvents = ['scroll', 'wheel', 'pointerdown', 'keydown', 'touchstart'];
        interruptEvents.forEach(e => window.addEventListener(e, hideTooltip, true));
        // v7.19.240: also hide on window blur (alt-tab, devtools focus, etc.)
        // and when pointer leaves the document (mouseout to null relatedTarget
        // doesn't always fire reliably across browser quirks).
        window.addEventListener('blur', hideTooltip);
        document.addEventListener('mouseleave', hideTooltip);

        // Re-parent into fullscreen element so it stays visible
        document.addEventListener('fullscreenchange', () => {
            const fs = document.fullscreenElement;
            const parent = fs || document.body;
            if (tooltip.parentElement !== parent) parent.appendChild(tooltip);
            hideTooltip();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

window.WML = (function() {
    'use strict';

    const config = window.swmlConfig || {};
    const API = {
        session:      config.restUrl + 'session',
        plan:         config.restUrl + 'plan',
        planElement:  config.restUrl + 'plan/element',
        progress:     config.restUrl + 'progress',
        chat:         config.restUrl + 'chat',
        saveSession:  config.restUrl + 'session/save',
        pastSessions: config.restUrl + 'sessions',
        loadSession:  config.restUrl + 'session/load',
        deleteSession: config.restUrl + 'session/delete',
        savedQuestions: config.restUrl + 'saved-questions',
        canvasSave:    config.restUrl + 'canvas/save',
        tutorComment:  config.restUrl + 'canvas/tutor-comment', // v7.19.538: was API.base (undefined) → 404
        studentComment: config.restUrl + 'canvas/student-comment', // v7.19.559: student persists feedback responses to own doc
        foundationalQuizResult: config.restUrl + 'foundational-quiz/result',
        // v7.19.992: current course's poem texts (poetry CN poem cards — v986 endpoint)
        poems:         config.restUrl + 'poems',
        // v7.19.323: deterministic code-scored mark-scheme quiz (Bug #1 root fix)
        quizStart:     config.restUrl + 'quiz/start',
        quizAnswer:    config.restUrl + 'quiz/answer',
        quizFinish:    config.restUrl + 'quiz/finish',
        // v7.19.339: codex section "Check answers" → recorded graded attempt
        codexCheck:    config.restUrl + 'codex/check',
        canvasLoad:    config.restUrl + 'canvas/load',
        canvasList:    config.restUrl + 'canvas/list',
        pullDismiss:   config.restUrl + 'canvas/pull-dismiss', // v7.19.263
        topicQuestion: config.restUrl + 'topic-question',
        topicQuestions: config.restUrl + 'topic-questions',
        phaseComplete: config.restUrl + 'phase/complete',
        phaseStatus:   config.restUrl + 'phase/status',
        chatSave:      config.restUrl + 'canvas/chat-save',
        chatLoad:      config.restUrl + 'canvas/chat-load',
        chatClear:     config.restUrl + 'canvas/chat-clear',
        // v7.15.12: Attempt management
        attempts:        config.restUrl + 'attempts',
        attemptsNew:     config.restUrl + 'attempts/new',
        attemptsSwitch:  config.restUrl + 'attempts/switch',
        attemptsComplete: config.restUrl + 'attempts/complete',
        // v7.15.51: Topic-scoped resume lookup (first not-complete lesson)
        topicResume:     config.restUrl + 'topic-resume',
        learningProfile: config.restUrl + 'learning-profile',
        // Creative writing project storage (v7.13.30)
        cwProject:       config.restUrl + 'cw-project',
        cwArtifact:      config.restUrl + 'cw-project/artifact',
        cwTrial:         config.restUrl + 'cw-project/trial',
        cwStep:          config.restUrl + 'cw-project/step',
        cwPlotTemplate:  config.restUrl + 'cw-project/plot-template',
        // Tutor review endpoints (v7.15.2)
        reviewCanvas:    config.restUrl + 'canvas/review',
        reviewChat:      config.restUrl + 'canvas/review-chat',
    };
    const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce };

    // v7.15.91: when an admin / tutor / specialist is viewing another
    // student's page, every write to the WML REST API must carry the
    // target student's id so the server-side viewer-mode gate can
    // resolve it and reject writes from read-only reviewers.
    // A scoped fetch wrapper appends `?student_id=<target>` to any
    // swml-wml POST/PUT/PATCH/DELETE request while in review mode.
    (function installReviewGuardedFetch() {
        try {
            if (!config.restUrl) return;
            const reviewTargetId = parseInt(config.targetUserId || config.reviewStudentId || 0, 10);
            if (!reviewTargetId) return;
            const currentUserId = parseInt(config.userId || 0, 10);
            if (!reviewTargetId || reviewTargetId === currentUserId) return;
            const swmlBase = config.restUrl;
            const _origFetch = window.fetch.bind(window);
            window.fetch = function(input, init) {
                try {
                    const url = typeof input === 'string' ? input : (input && input.url) || '';
                    const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
                    if (url && url.indexOf(swmlBase) === 0 && method !== 'GET' && method !== 'HEAD') {
                        const sep = url.indexOf('?') === -1 ? '?' : '&';
                        if (!/[?&]student_id=/.test(url)) {
                            const newUrl = url + sep + 'student_id=' + reviewTargetId;
                            if (typeof input === 'string') {
                                input = newUrl;
                            } else {
                                input = new Request(newUrl, input);
                            }
                        }
                    }
                } catch (_) { /* fall through to original fetch */ }
                return _origFetch(input, init);
            };
        } catch (e) { /* silent */ }
    })();

    // Section type colour map (used for outline, TOC, export)
    const SECTION_COLOURS = {
        cover: '#5333ed',
        question: '#51dacf',
        plan: '#5333ed',
        outline: '#42A1EC',
        response: '#1CD991',
        feedback: '#ffb432',
        scores: '#ff6b6b',
        action: '#4D76FD',
        improvement: '#7DF9E9',
        signoff: '#1CD991',
    };

    const TEXT_CATALOGUE = {
        shakespeare: {
            label: 'Shakespeare',
            texts: [
                { id: 'macbeth', label: 'Macbeth', icon: '🗡️' },
                { id: 'romeo_juliet', label: 'Romeo & Juliet', icon: '💔' },
                { id: 'the_tempest', label: 'The Tempest', icon: '🌊' },
                { id: 'merchant_of_venice', label: 'The Merchant of Venice', icon: '⚖️' },
                { id: 'much_ado', label: 'Much Ado About Nothing', icon: '💬' },
                { id: 'julius_caesar', label: 'Julius Caesar', icon: '🏛️' },
                { id: 'twelfth_night', label: 'Twelfth Night', icon: '🎭' },
                { id: 'henry_v', label: 'Henry V', icon: '👑' },
                { id: 'othello', label: 'Othello', icon: '🖤' },
            ],
        },
        modern_text: {
            label: 'Modern Text',
            texts: [
                { id: 'aic', label: 'An Inspector Calls', icon: '🔍' },
                { id: 'blood_brothers', label: 'Blood Brothers', icon: '👥' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'never_let_me_go', label: 'Never Let Me Go', icon: '💊' },
                { id: 'leave_taking', label: 'Leave Taking', icon: '🚪' },
                { id: 'dna', label: 'DNA', icon: '🧬' },
                { id: 'my_name_is_leon', label: 'My Name Is Leon', icon: '📘' },
                { id: 'taste_of_honey', label: 'A Taste of Honey', icon: '🍯' },
                { id: 'journeys_end', label: "Journey's End", icon: '⚔️' },
                { id: 'pigeon_english', label: 'Pigeon English', icon: '🐦' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
            ],
        },
        modern_prose: {
            label: 'Modern Prose',
            texts: [
                { id: 'tkam', label: 'To Kill a Mockingbird', icon: '🐦' },
                { id: 'omam', label: 'Of Mice and Men', icon: '🐭' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'old_man_sea', label: 'The Old Man and the Sea', icon: '🎣' },
                { id: 'anita_and_me', label: 'Anita and Me', icon: '🎭' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
            ],
        },
        drama: {
            label: 'Modern Drama',
            texts: [
                { id: 'aic', label: 'An Inspector Calls', icon: '🔍' },
                { id: 'blood_brothers', label: 'Blood Brothers', icon: '👥' },
                { id: 'leave_taking', label: 'Leave Taking', icon: '🚪' },
                { id: 'dna', label: 'DNA', icon: '🧬' },
                { id: 'taste_of_honey', label: 'A Taste of Honey', icon: '🍯' },
                { id: 'journeys_end', label: "Journey's End", icon: '⚔️' },
                { id: 'curious_incident_play', label: 'The Curious Incident (Play)', icon: '🐕' },
            ],
        },
        prose: {
            label: 'Prose (Studied Novel)',
            texts: [
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'about_a_boy', label: 'About a Boy', icon: '👦' },
                { id: 'how_many_miles', label: 'How Many Miles to Babylon?', icon: '🏛️' },
                { id: 'tkam', label: 'To Kill a Mockingbird', icon: '🐦' },
                { id: 'omam', label: 'Of Mice and Men', icon: '🐭' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
            ],
        },
        '19th_century': {
            label: '19th Century Novel',
            texts: [
                { id: 'acc', label: 'A Christmas Carol', icon: '👻' },
                { id: 'jekyll_hyde', label: 'Jekyll & Hyde', icon: '🧪' },
                { id: 'frankenstein', label: 'Frankenstein', icon: '⚡' },
                { id: 'sign_of_four', label: 'The Sign of the Four', icon: '🔎' },
                { id: 'great_expectations', label: 'Great Expectations', icon: '📖' },
                { id: 'jane_eyre', label: 'Jane Eyre', icon: '🏚️' },
                { id: 'pride_prejudice', label: 'Pride & Prejudice', icon: '💐' },
                { id: 'scarlet_letter', label: 'The Scarlet Letter', icon: '🔴' },
            ],
        },
        critical_reading: {
            label: 'Critical Reading (Critical Essay)',
            texts: [
                { id: 'macbeth', label: 'Macbeth', icon: '🗡️' },
                { id: 'romeo_juliet', label: 'Romeo and Juliet', icon: '💔' },
                { id: 'much_ado', label: 'Much Ado About Nothing', icon: '💬' },
                { id: 'merchant_venice', label: 'The Merchant of Venice', icon: '⚖️' },
                { id: 'othello', label: 'Othello', icon: '🎭' },
                { id: 'aic', label: 'An Inspector Calls', icon: '🔍' },
                { id: 'blood_brothers', label: 'Blood Brothers', icon: '👥' },
                { id: 'animal_farm', label: 'Animal Farm', icon: '🐷' },
                { id: 'lord_of_the_flies', label: 'Lord of the Flies', icon: '🐚' },
                { id: 'my_name_is_leon', label: 'My Name Is Leon', icon: '📘' },
                { id: 'leave_taking', label: 'Leave Taking', icon: '🚪' },
                { id: 'dna', label: 'DNA', icon: '🧬' },
                { id: 'never_let_me_go', label: 'Never Let Me Go', icon: '💊' },
                { id: 'pigeon_english', label: 'Pigeon English', icon: '🐦' },
                { id: 'taste_of_honey', label: 'A Taste of Honey', icon: '🍯' },
                { id: 'journeys_end', label: "Journey's End", icon: '⚔️' },
                { id: 'curious_incident', label: 'The Curious Incident', icon: '🐕' },
                { id: 'curious_incident_play', label: 'The Curious Incident (Play)', icon: '🎪' },
                { id: 'jane_eyre', label: 'Jane Eyre', icon: '🏚️' },
                { id: 'pride_prejudice', label: 'Pride & Prejudice', icon: '💐' },
                { id: 'sign_of_four', label: 'The Sign of the Four', icon: '🔎' },
            ],
        },
        poetry_anthology: {
            label: 'Poetry Anthology',
            // Board-specific texts — resolved at render time via POETRY_ANTHOLOGY_BY_BOARD
            texts: [],
        },
        unseen_poetry: {
            label: 'Unseen Poetry',
            skipTextSelect: true,
        },
        unseen_prose: {
            label: 'Unseen Prose',
            skipTextSelect: true,
        },
        language1: {
            label: 'Language Paper 1',
            skipTextSelect: true,
        },
        language2: {
            label: 'Language Paper 2',
            skipTextSelect: true,
        },
        creative_writing: {
            label: 'Creative Writing',
            skipTextSelect: true,
        },
        prose_anthology: {
            label: 'Prose Anthology',
            // Board-specific texts — resolved at render time via PROSE_ANTHOLOGY_BY_BOARD
            texts: [],
        },
        nonfiction_anthology: {
            label: 'Non-Fiction Anthology',
            // Board-specific texts — resolved at render time via NONFICTION_ANTHOLOGY_BY_BOARD
            texts: [],
        },
    };

    // ── Board-specific poetry anthology texts ──
    const POETRY_ANTHOLOGY_BY_BOARD = {
        'aqa': [
            { id: 'power_conflict', label: 'Power & Conflict', icon: '⚔️' },
            { id: 'love_relationships', label: 'Love & Relationships', icon: '❤️' },
            { id: 'worlds_lives', label: 'Worlds & Lives', icon: '🌍' },
        ],
        'ocr': [
            { id: 'conflict', label: 'Conflict', icon: '⚔️' },
            { id: 'love', label: 'Love', icon: '❤️' },
            { id: 'youth_age', label: 'Youth & Age', icon: '🌱' },
        ],
        'eduqas': [
            { id: 'eduqas_poetry', label: 'EDUQAS Poetry (to 2026)', icon: '📜' },
            { id: 'eduqas_poetry_2027', label: 'EDUQAS Poetry (from 2027)', icon: '✨' },
        ],
        'edexcel': [
            { id: 'relationships', label: 'Relationships', icon: '❤️' },
            { id: 'conflict', label: 'Conflict', icon: '⚔️' },
            { id: 'time_place', label: 'Time & Place', icon: '🕰️' },
            { id: 'belonging', label: 'Belonging', icon: '🏠' },
        ],
        'edexcel-igcse': [
            { id: 'igcse_lit_poetry', label: 'Part 3 — Literature Poetry', icon: '📖' },
            { id: 'igcse_lang_poetry', label: 'Part 2 — Language Poetry', icon: '✒️' },
        ],
        'sqa': [
            { id: 'sqa_duffy', label: 'Carol Ann Duffy', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
            { id: 'sqa_maccaig', label: 'Norman MacCaig', icon: '🏔️' },
            { id: 'sqa_kay', label: 'Jackie Kay', icon: '📝' },
            { id: 'sqa_morgan', label: 'Edwin Morgan', icon: '🌃' },
            { id: 'sqa_n5_collection', label: 'N5 Scottish Poetry Collection', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
        ],
        'ccea': [
            { id: 'ccea_identity', label: 'Identity', icon: '🪞' },
            { id: 'ccea_relationships', label: 'Relationships', icon: '❤️' },
            { id: 'ccea_conflict', label: 'Conflict', icon: '⚔️' },
        ],
        'cambridge-igcse': [
            { id: 'songs_ourselves_v1', label: 'Songs of Ourselves Vol. 1', icon: '📖' },
        ],
    };

    // ── Board-specific prose anthology texts ──
    const PROSE_ANTHOLOGY_BY_BOARD = {
        'edexcel-igcse': [
            { id: 'igcse_lang_prose', label: 'Part 2 — Language Prose', icon: '📕' },
        ],
    };

    // ── Board-specific non-fiction anthology texts ──
    const NONFICTION_ANTHOLOGY_BY_BOARD = {
        'edexcel-igcse': [
            { id: 'igcse_lang_nonfiction', label: 'Part 1 — Language Non-Fiction', icon: '📰' },
        ],
    };

    // ── Per-board text filtering for shared subject groups (v7.14.13) ──
    // When a board has an entry here, only the listed text IDs from TEXT_CATALOGUE are shown.
    // Boards without an entry show the full shared list (backwards compatible).
    const BOARD_TEXT_FILTER = {
        '19th_century': {
            'eduqas': ['acc', 'jekyll_hyde', 'silas_marner', 'war_of_worlds', 'jane_eyre', 'pride_prejudice'],
        },
    };

    // ── Author lookup for texts ──
    const AUTHOR_MAP = {
        // Shakespeare
        macbeth: 'William Shakespeare', romeo_juliet: 'William Shakespeare',
        the_tempest: 'William Shakespeare', merchant_of_venice: 'William Shakespeare',
        much_ado: 'William Shakespeare', julius_caesar: 'William Shakespeare',
        twelfth_night: 'William Shakespeare',
        // Modern texts
        aic: 'J.B. Priestley', blood_brothers: 'Willy Russell',
        lord_of_the_flies: 'William Golding', animal_farm: 'George Orwell',
        never_let_me_go: 'Kazuo Ishiguro', leave_taking: 'Winsome Pinnock',
        dna: 'Dennis Kelly', my_name_is_leon: 'Kit de Waal',
        taste_of_honey: 'Shelagh Delaney', journeys_end: 'R.C. Sherriff',
        pigeon_english: 'Stephen Kelman', curious_incident: 'Mark Haddon',
        // 19th Century
        acc: 'Charles Dickens', jekyll_hyde: 'Robert Louis Stevenson', frankenstein: 'Mary Shelley',
        sign_of_four: 'Arthur Conan Doyle', great_expectations: 'Charles Dickens',
        jane_eyre: 'Charlotte Brontë', pride_prejudice: 'Jane Austen', scarlet_letter: 'Nathaniel Hawthorne',
        // Poetry — AQA
        power_conflict: 'AQA Anthology', love_relationships: 'AQA Anthology',
        worlds_lives: 'AQA Anthology', unseen_poetry: 'Unseen',
        // Poetry — OCR
        conflict: 'OCR Anthology', love: 'OCR Anthology', youth_age: 'OCR Anthology',
        // Poetry — EDUQAS
        eduqas_poetry: 'EDUQAS Anthology', eduqas_poetry_2027: 'EDUQAS Anthology',
        // Poetry — Edexcel
        relationships: 'Edexcel Anthology', time_place: 'Edexcel Anthology', belonging: 'Edexcel Anthology',
        // Poetry — Edexcel IGCSE
        igcse_lit_poetry: 'Edexcel IGCSE Anthology', igcse_lang_poetry: 'Edexcel IGCSE Anthology',
        igcse_lang_prose: 'Edexcel IGCSE Anthology',
        // Poetry — SQA
        sqa_duffy: 'Carol Ann Duffy', sqa_maccaig: 'Norman MacCaig',
        sqa_kay: 'Jackie Kay', sqa_morgan: 'Edwin Morgan', sqa_n5_collection: 'SQA Collection',
        // Poetry — CCEA
        ccea_identity: 'CCEA Anthology', ccea_relationships: 'CCEA Anthology', ccea_conflict: 'CCEA Anthology',
        // Poetry — Cambridge IGCSE
        songs_ourselves_v1: 'Songs of Ourselves',
        // Non-fiction — Edexcel IGCSE
        igcse_lang_nonfiction: 'Edexcel IGCSE Anthology',
    };

    // Get full text label from catalogue
    function getTextLabel(textId, subjectId) {
        const subject = TEXT_CATALOGUE[subjectId];
        if (!subject) return ucfirst(textId);
        if (subject.skipTextSelect) return subject.label;
        // For poetry/prose anthology, check board-specific texts first
        if (subjectId === 'poetry_anthology' && POETRY_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = POETRY_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        if (subjectId === 'prose_anthology' && PROSE_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = PROSE_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        if (subjectId === 'nonfiction_anthology' && NONFICTION_ANTHOLOGY_BY_BOARD[state.board]) {
            const boardText = NONFICTION_ANTHOLOGY_BY_BOARD[state.board].find(t => t.id === textId);
            if (boardText) return boardText.label;
        }
        const text = (subject.texts || []).find(t => t.id === textId);
        return text ? text.label : ucfirst(textId);
    }

    // v7.19.594: true when a subject has no real text to pick (Language papers,
    // unseen poetry, etc.) — its getTextLabel returns the subject's own label, so
    // a separate "text" chip just restates board+subject. Callers use this to skip
    // the redundant text badge.
    function isSkipTextSelect(subjectId) {
        // v7.19.624: the subject id drifts across the stack — the bridge sets
        // 'language_p1' / 'language_c1' / 'language_paper_2' etc, while TEXT_CATALOGUE
        // keys only on 'language1' / 'language2'. The exact-key lookup silently missed
        // those variants, so the redundant text chip ("Aqa lang paper 1", restating
        // board + paper) kept showing in the sidebar. Language papers and unseen
        // subjects NEVER pick a real text — match the whole family by prefix so id
        // drift can't reintroduce the duplicate chip (the v7.19.594 intent, made robust).
        const s = String(subjectId || '').toLowerCase();
        if (/^language/.test(s) || /^unseen/.test(s)) return true;
        const subject = TEXT_CATALOGUE[s];
        return !!(subject && subject.skipTextSelect);
    }

    const state = {
        mode: config.urlParams?.mode || '',
        board: config.urlParams?.board || '',
        subject: config.urlParams?.subject || '',
        text: config.urlParams?.text || '',
        task: config.urlParams?.task || '',       // from URL in guided mode
        planningMode: config.urlParams?.planning_mode || '',  // essay_plan mode: A/B/C | model_answer: A/B/C — restored from URL on refresh
        modelSection: '',                        // model_answer section: introduction, body1, body2, body3, conclusion
        advancedLevel: 0,                        // model_answer Advanced: 1 (Full Recall), 2 (Plan & Answer), 3 (Answer Only)
        essayTiming: '',                         // model_answer Advanced: 'paragraph' or 'full'
        courseType: config.urlParams?.type || '',
        isRedraft: config.urlParams?.redraft === '1',
        unitId: config.urlParams?.unit_id || 0,
        question: '',
        marks: 30,
        aos: ['AO1', 'AO2', 'AO3'],
        sessionId: '',
        step: 1,
        plan: {},
        chatHistory: [],
        isLoading: false,
        chatId: null,
        referrer: '',
        requestId: 0, // Incremented on each view change — stale responses are ignored
        pendingFile: null, // File upload waiting to be sent
        // Poetry poem selection
        poem: config.urlParams?.poem || '',
        poemTitle: '',
        poemAuthor: '',
        poemText: '',
        // EDUQAS poetry section selection
        questionPart: '',
        comparisonPoem: '',
        comparisonPoemTitle: '',
        comparisonPoemText: '',
        // Draft typing (programme mode)
        topicNumber: config.urlParams?.topic || 0,
        topicLabel: config.urlParams?.topic ? `Topic ${config.urlParams.topic}` : '',
        draftType: null,
        phase: null,
        _phaseMarkedComplete: false,  // Prevents double-fire of Mark Complete
        // v7.14.3: Exercise unique ID — UUID per attempt for deep linking + dashboard + tutor access
        exerciseId: config.urlParams?.eid || '',
        // v7.15.12: Attempt number — 1-based, resolved from server attempt index
        attempt: parseInt(config.urlParams?.attempt || '0') || 0,
        // Tutor review mode (v7.15.2)
        reviewMode: !!config.reviewMode,
        // v7.15.40: 'tutor' | 'specialist' | 'admin' | 'parent' | '' — parent is read-only
        reviewRole: config.reviewRole || '',
        reviewStudentId: config.reviewStudentId || 0,
        reviewStudentName: config.reviewStudentName || '',
        // v7.15.52: three-state viewer permission resolved server-side.
        // 'edit' for student on own canvas, 'comment' for tutor/specialist/admin,
        // 'readonly' for parent with active connection to the student.
        viewerMode: config.viewerMode || 'edit',
        targetUserId: config.targetUserId || 0,
    };

    const PLAN_STEPS = [
        { step: 1, label: 'Setup & Goals' },
        { step: 2, label: 'Keyword Analysis' },
        { step: 3, label: 'Anchor Quotes' },
        { step: 4, label: 'Body Paragraph 1' },
        { step: 5, label: 'Body Paragraph 2' },
        { step: 6, label: 'Body Paragraph 3' },
        { step: 7, label: 'Introduction' },
        { step: 8, label: 'Conclusion' },
    ];

    const ASSESSMENT_STEPS = [
        { step: 1, label: 'Setup & Details' },
        { step: 2, label: 'Goal Setting' },
        { step: 3, label: 'Self-Reflection' },
        { step: 4, label: 'Essay Submission' },
        { step: 5, label: 'Introduction' },
        { step: 6, label: 'Body Paragraphs' },
        { step: 7, label: 'Conclusion' },
        { step: 8, label: 'Summary & Action Plan' },
    ];

    const POLISHING_STEPS = [
        { step: 1, label: 'Context & Essay' },
        { step: 2, label: 'Level Assessment' },
        { step: 3, label: 'Focus Selection' },
        { step: 4, label: 'Polishing Round 1' },
        { step: 5, label: 'Polishing Round 2' },
        { step: 6, label: 'Polishing Round 3' },
        { step: 7, label: 'Review & Compare' },
        { step: 8, label: 'Next Steps' },
    ];

    const QUOTE_ANALYSIS_STEPS = [
        { step: 1, label: 'Random Quote' },
        { step: 2, label: 'Verbal Plan' },
        { step: 3, label: 'Plan Feedback' },
        { step: 4, label: 'Full Paragraph' },
        { step: 5, label: 'Paragraph Feedback' },
        { step: 6, label: 'Sophia Model' },
    ];

    const CONCEPTUAL_NOTES_STEPS = [
        { step: 1, label: 'S1 Protagonist' },
        { step: 2, label: 'S2 Context' },
        { step: 3, label: 'S3 Plot' },
        { step: 4, label: 'S4 Genre' },
        { step: 5, label: 'S5 Themes' },
        { step: 6, label: 'S6 Purpose' },
        { step: 7, label: 'S7 Message' },
    ];

    // v7.15.95: Foundational quiz sidebar — light-touch 5-question recall.
    const FOUNDATIONAL_QUIZ_STEPS = [
        { step: 1, label: 'Welcome' },
        { step: 2, label: 'Q1' },
        { step: 3, label: 'Q2' },
        { step: 4, label: 'Q3' },
        { step: 5, label: 'Q4' },
        { step: 6, label: 'Q5' },
        { step: 7, label: 'Results' },
    ];

    // v7.18.23: mark_scheme_unit sub-task sidebar steps. The task slug carries
    // two distinct flows — Quiz (bridgeStep=1, mark-scheme-quiz/* protocols)
    // and Forging Your Weapon (bridgeStep=2, forging-your-weapon/* protocols).
    // getSteps() returns the right array based on state.bridgeStep below.
    const MARK_SCHEME_QUIZ_STEPS = [
        { step: 1, label: 'Welcome' },
        { step: 2, label: 'Q1' },
        { step: 3, label: 'Q2' },
        { step: 4, label: 'Q3' },
        { step: 5, label: 'Q4' },
        { step: 6, label: 'Q5' },
        { step: 7, label: 'Results' },
    ];
    const FORGING_YOUR_WEAPON_STEPS = [
        { step: 1, label: 'The Forge' },
        { step: 2, label: 'Comparison' },
        { step: 3, label: 'Critique' },
        { step: 4, label: 'Anatomy' },
        { step: 5, label: 'Next Steps' },
    ];

    // v7.19.991 (Neil SOP): THE canonical poetry-CN element spine — ONE definition, every
    // consumer derives (sidebar steps, chat beat-chip, done-poem detection). Order + slugs
    // are FROZEN to the doc fieldIds (poem_{id}_{slug}) and the protocol walk
    // (pn-conceptual-notes.md). The pre-991 sidebar hand-listed 7 steps (missing
    // Comparisons, stale 'Techniques' label) — exactly the drift a single spine prevents.
    // (Named SPINE: the legacy 7-item POETRY_CN_ELEMENTS below — old chat-protocol element
    // tracker, cn_section_N types — is ALSO stale-7; left untouched, superseded by this.)
    const POETRY_CN_SPINE = [
        { slug: 'speaker',     label: 'Speaker' },
        { slug: 'context',     label: 'Context' },
        { slug: 'form',        label: 'Form' },
        { slug: 'structure',   label: 'Structure & Language' },
        { slug: 'themes',      label: 'Themes' },
        { slug: 'purpose',     label: 'Purpose' },
        { slug: 'message',     label: 'Message' },
        { slug: 'comparisons', label: 'Comparisons' },
    ];
    const POETRY_CN_STEPS = POETRY_CN_SPINE.map((e, i) => ({ step: i + 1, label: e.label }));

    // v7.19.995 (PROTOCOL-STANDARD §A16 programmatic-first, Neil rulings 2026-07-09): designed
    // FIRST-QUESTIONS for the clean-choice CN elements. Code renders the question + stance
    // buttons + a "how do you know?" justification; the model only takes the Socratic
    // follow-up. Keyed by spine slug — an element WITHOUT an entry keeps its AI-Socratic
    // opening (capability gate, never a task-name check). Stance lists mirror the protocol's
    // own menus (pn-reference.md §Speaker Types / §Form table / §Purpose menu) — if a menu
    // changes there, change it HERE in the same commit. NO "I'm not sure" option by ruling
    // (stuck students type it → the AI scaffolds).
    const POETRY_CN_OPENERS = {
        speaker: {
            question: 'Who is speaking in “{title}”?',
            stances: [
                { id: 'poet',       label: 'The poet’s own voice' },
                { id: 'persona',    label: 'A created persona (a character)' },
                { id: 'observer',   label: 'An observer / narrator' },
                { id: 'collective', label: 'A collective voice (“we”)' },
            ],
            justify: 'How do you know? Point to a line or moment in the poem…',
        },
        form: {
            question: 'What is the primary poetic form of “{title}”? Many poems blend forms — pick the dominant one.',
            stances: [
                { id: 'ballad',             label: 'Ballad' },
                { id: 'dramatic_monologue', label: 'Dramatic monologue' },
                { id: 'elegy',              label: 'Elegy' },
                { id: 'epic',               label: 'Epic' },
                { id: 'free_verse',         label: 'Free verse' },
                { id: 'interior_monologue', label: 'Interior monologue' },
                { id: 'lyric',              label: 'Lyric' },
                { id: 'narrative',          label: 'Narrative' },
                { id: 'ode',                label: 'Ode' },
                { id: 'sonnet',             label: 'Sonnet' },
            ],
            justify: 'How do you know? Which features point to that form…',
        },
        purpose: {
            question: 'What was the poet’s primary purpose in writing “{title}”?',
            stances: [
                { id: 'entertain',   label: 'To entertain — engage us emotionally' },
                { id: 'instruct',    label: 'To instruct — teach a moral lesson' },
                { id: 'critique',    label: 'To critique — expose societal problems' },
                { id: 'warn',        label: 'To warn — prevent future mistakes' },
                { id: 'explore',     label: 'To explore — investigate human nature' },
                { id: 'persuade',    label: 'To persuade — change beliefs or behaviour' },
                { id: 'commemorate', label: 'To commemorate — preserve memory or honour' },
                { id: 'witness',     label: 'To bear witness — make the unseen visible' },
            ],
            justify: 'How do you know? Which moment in the poem serves that purpose…',
        },
    };

    // v7.20.15: CN FAMILY REGISTRY (CN-STANDARD + Part B Phase 1 build plan, Neil rulings
    // 2026-07-10). ONE canonical definition per CN family — spine (slug order is FROZEN to
    // the doc fieldIds {prefix}_{itemId}_{slug} and the family's walk protocol), craft set
    // (which elements carry an _effect box — §2.2 craft test), depth register, roster kind
    // ('anthology' = multi-item picker; 'single' = the course text, no picker) and openers
    // (frontend-owned first questions — absent slug/family = AI-Socratic open; capability
    // gate, never a task-name check). Consumers DERIVE from the family object (regexes,
    // sidebar steps, chip, done-detection, heals, template rows) — never hand-copy a slug
    // list (the one-canonical-spine law; four hand-copies drifted the sidebar pre-991).
    // PHP twin: the registry in class-rest-api.php build_cn_injection() — keep in lockstep.
    const LIT_CN_SPINE = [
        { slug: 'protagonist', label: 'Protagonist' },
        { slug: 'context',     label: 'Historical Context' },
        { slug: 'plot',        label: 'Plot Type' },
        { slug: 'genre',       label: 'Genre' },
        { slug: 'themes',      label: 'Themes' },
        { slug: 'purpose',     label: 'Author’s Purpose' },
        { slug: 'message',     label: 'Overall Message' },
    ];
    const NONFICTION_CN_SPINE = [
        { slug: 'voice',      label: 'Writer’s Voice' },
        { slug: 'context',    label: 'Context' },
        { slug: 'structure',  label: 'Structure' },
        { slug: 'texttype',   label: 'Text Type & Form' },
        { slug: 'techniques', label: 'Techniques' },
        { slug: 'themes',     label: 'Themes' },
        { slug: 'purpose',    label: 'Purpose' },
        { slug: 'message',    label: 'Message' },
    ];
    const PROSE_CN_SPINE = [
        { slug: 'narrator',  label: 'Narrator & Voice' },
        { slug: 'context',   label: 'Context' },
        { slug: 'structure', label: 'Form & Structure' },
        { slug: 'language',  label: 'Language' },
        { slug: 'themes',    label: 'Themes' },
        { slug: 'purpose',   label: 'Purpose' },
        { slug: 'message',   label: 'Message' },
    ];
    // moldReady = this family's one-doc template + shape-heal have SHIPPED. The unified-doc
    // machinery (heals, cards, chip, done-detection, picker) gates on it — never on a family
    // name — so a family switches on by flipping ONE flag when its doc surface exists, and
    // legacy-shape docs (lit cn_section_N, old nfcn) stay untouched until then.
    const CN_FAMILIES = {
        poetry: {
            id: 'poetry', prefix: 'poem', spine: POETRY_CN_SPINE,
            craft: ['speaker', 'form', 'structure', 'themes'],
            depth: 'light', roster: 'anthology', openers: POETRY_CN_OPENERS,
            moldReady: true,
        },
        literature: {
            id: 'literature', prefix: 'lit', spine: LIT_CN_SPINE,
            craft: ['protagonist', 'plot', 'genre', 'themes'],
            depth: 'deep', roster: 'single', openers: null,
            // v7.20.23: card-mold ported to lit's single-text cn_section_N shape (chip dispatcher,
            // start/resume/clear re-entry cards). Poetry heals stay off lit (isPoetryCnDoc-gated);
            // payload currentPoemId/donePoemIds no-op on lit (lit_ regex ≠ cn_section_N fields).
            moldReady: true,
        },
        nonfiction: {
            id: 'nonfiction', prefix: 'nf', spine: NONFICTION_CN_SPINE,
            craft: ['voice', 'structure', 'texttype', 'techniques', 'themes'],
            depth: 'light', roster: 'anthology', openers: null,
            moldReady: true, // v7.20.37: one-doc template + shape-heal + FQ→CN autofill activated (cards/walk deferred to CN-WALK batch)
        },
        prose: {
            id: 'prose', prefix: 'prose', spine: PROSE_CN_SPINE,
            craft: ['narrator', 'structure', 'language', 'themes'],
            depth: 'light', roster: 'anthology', openers: null,
            moldReady: false, // flips in Part B Phase 2 (light-walk template ships)
        },
    };
    // Derived fieldId regexes — THE only place CN fieldId shapes are constructed. kind:
    // 'notes' matches bare element fields only; 'any' also matches _quotes/_effect boxes.
    const cnFieldRe = (fam, kind) => {
        const alt = fam.spine.map((e) => e.slug).join('|');
        return kind === 'any'
            ? new RegExp('^' + fam.prefix + '_(.+?)_(' + alt + ')(?:_(quotes|effect))?$')
            : new RegExp('^' + fam.prefix + '_(.+?)_(' + alt + ')$');
    };

    // v7.20.38: CN STAGED-DELIVERY — per-anthology stage split (how many texts a
    // student covers per sitting). stageCount = ceil(rosterLength / perStage). An
    // anthology ABSENT from this map = NO staging (single-text novels/plays: one doc,
    // one go). Locked splits (Neil 2026-07-12): poetry 5×3, IGCSE-lit poetry 4×4,
    // nonfiction 5×2, Edexcel IGCSE P2 mixed 5×(1 poem + 1 prose). The staging ENGINE
    // is family-generic; only nonfiction is wired live in this batch — the others light
    // up by adding a line here once their rosters/bridge lessons exist (D-SPLIT).
    const CN_STAGE_SPLITS = {
        'edexcel-igcse|igcse_lang_nonfiction': { perStage: 2 },
    };
    // Resolve the split for a board+text through the same dash-ladder anthologyPoemsFor
    // uses, so every alias form resolves. Returns null when the text is not staged.
    const cnStageSplitFor = (board, text) => {
        const b = String(board || state.board || '').toLowerCase();
        const t = String(text || state.text || '');
        const tries = [t, t.replace(/_poetry$/, ''), t + '_poetry'];
        // v7.20.42 SLUG-DRIFT FIX: nonfiction's anthology is BOARD-determined — the course text
        // (edexcel_igcse_lang_a) is NOT the stage-split key (igcse_lang_nonfiction). Mirror
        // anthologyPoemsFor/cnRosterSlug (v39/v40): push the board nonfiction anthology id so the
        // split resolves off the generic course text. Without this cnStageCountFor=0 → no "Stage
        // N of M" badge on the real lesson (Neil staging v7.20.41: badge missing).
        try {
            if (isNonfictionSubject() && Array.isArray(NONFICTION_ANTHOLOGY_BY_BOARD[b])) {
                NONFICTION_ANTHOLOGY_BY_BOARD[b].forEach((a) => { if (a && a.id) tries.push(a.id); });
            }
        } catch (_) {}
        for (let i = 0; i < tries.length; i++) {
            const s = CN_STAGE_SPLITS[b + '|' + tries[i]];
            if (s) return s;
        }
        return null;
    };
    // Total stage count for a staged anthology (0 = not staged / roster not yet seeded).
    const cnStageCountFor = (board, text) => {
        const s = cnStageSplitFor(board, text);
        if (!s) return 0;
        const roster = anthologyPoemsFor(text);
        if (!roster.length) return 0;
        return Math.ceil(roster.length / s.perStage);
    };

    const NONFICTION_CN_STEPS = [
        { step: 1, label: 'S1 Writer\'s Voice' },
        { step: 2, label: 'S2 Context' },
        { step: 3, label: 'S3 Structure' },
        { step: 4, label: 'S4 Text Type' },
        { step: 5, label: 'S5 Techniques' },
        { step: 6, label: 'S6 Themes' },
        { step: 7, label: 'S7 Purpose' },
        { step: 8, label: 'S8 Message' },
    ];

    const ESSAY_PLAN_STEPS = [
        { step: 1, label: 'Setup & Question' },
        { step: 2, label: 'Keywords' },
        { step: 3, label: 'Anchor Quotes' },
        { step: 4, label: 'Body Paragraph 1' },
        { step: 5, label: 'Body Paragraph 2' },
        { step: 6, label: 'Body Paragraph 3' },
        { step: 7, label: 'Introduction' },
        { step: 8, label: 'Conclusion' },
    ];

    const MODEL_ANSWER_STEPS = [
        { step: 1, label: 'Setup & Question' },
        { step: 2, label: 'Essay Plan' },
        { step: 3, label: 'Body Paragraph 1' },
        { step: 4, label: 'Body Paragraph 2' },
        { step: 5, label: 'Body Paragraph 3' },
        { step: 6, label: 'Introduction' },
        { step: 7, label: 'Conclusion' },
    ];

    const ESSAY_PLAN_RECALL_STEPS = [
        { step: 1, label: 'Question' },
        { step: 2, label: 'Verbal Recall' },
        { step: 3, label: 'Sophia Evaluation' },
        { step: 4, label: 'Refinement' },
        { step: 5, label: 'Confirm & Save' },
    ];

    const MODEL_ANSWER_ADVANCED_STEPS = [
        { step: 1, label: 'Question' },
        { step: 2, label: 'Plan' },
        { step: 3, label: 'Body Paragraph 1' },
        { step: 4, label: 'Body Paragraph 2' },
        { step: 5, label: 'Body Paragraph 3' },
        { step: 6, label: 'Introduction' },
        { step: 7, label: 'Conclusion' },
    ];

    const ASSESSMENT_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'goal', label: 'Assessment Goal', section: 'focus' },
        { type: 'ao1_score', label: 'AO1', section: 'scores' },
        { type: 'ao2_score', label: 'AO2', section: 'scores' },
        { type: 'ao3_score', label: 'AO3', section: 'scores' },
        { type: 'ao4_score', label: 'AO4 (SPaG)', section: 'scores' },
        { type: 'total_score', label: 'Total Score', section: 'scores' },
        { type: 'grade', label: 'Grade / Level', section: 'scores' },
        { type: 'strength_1', label: 'Key Strength', section: 'feedback' },
        { type: 'target_1', label: 'Priority Target', section: 'feedback' },
        { type: 'target_2', label: 'Second Target', section: 'feedback' },
    ];

    const POLISHING_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'current_level', label: 'Current Level', section: 'focus' },
        { type: 'target_level', label: 'Target Level', section: 'focus' },
        { type: 'polish_focus', label: 'Polish Focus', section: 'focus' },
        { type: 'revision_1', label: 'Revision 1', section: 'revisions' },
        { type: 'revision_2', label: 'Revision 2', section: 'revisions' },
        { type: 'revision_3', label: 'Revision 3', section: 'revisions' },
    ];

    const EXAM_QUESTION_STEPS = [
        { step: 1, label: 'Text & Author' },
        { step: 2, label: 'Design Preference' },
        { step: 3, label: 'Past Paper Analysis' },
        { step: 4, label: 'Question Generation' },
        { step: 5, label: 'Refinement' },
    ];

    const MEMORY_PRACTICE_STEPS = [
        { step: 1, label: 'Submit Writing' },
        { step: 2, label: 'Quality Gate' },
        { step: 3, label: 'Mode Selection' },
        { step: 4, label: 'Timer' },
        { step: 5, label: 'Exercise' },
        { step: 6, label: 'Results' },
        { step: 7, label: 'Next Steps' },
    ];

    const EXAM_QUESTION_ELEMENTS = [
        { type: 'question_text', label: 'Text', section: 'focus' },
        { type: 'goal', label: 'Author', section: 'focus' },
        { type: 'exam_question_theme', label: 'Theme / Character', section: 'question' },
        { type: 'exam_question_output', label: 'Generated Question', section: 'question' },
    ];

    // ── CREATIVE WRITING CONSTANTS (v7.13.34) ──
    const CW_STEPS = [
        // Planning Phase
        { step: 1,  label: 'Writer Profile',           tier: 'si', phase: 'planning' },
        { step: 2,  label: 'Explore Story Ideas',      tier: 'si', phase: 'planning' },
        { step: 3,  label: 'Create Logline',            tier: 'si', phase: 'planning' },
        { step: 4,  label: 'Brief Outline',             tier: 'si', phase: 'planning' },
        { step: 5,  label: 'Choose Plot Structure',     tier: 'si', phase: 'planning' },
        { step: 6,  label: 'Plot Outline Workshop',     tier: 'si', phase: 'planning' },
        // ⭐ v7.20.419 (Neil, 2026-08-04) — TRAINING ENVIRONMENT, exactly as Step 5. This one word
        // is the whole environment switch: `si` → EXERCISE_MANIFEST.cw_si → `panels.chat: true`
        // + sidebar. His instruction, verbatim: *"you're not just gonna edit the current
        // environment, but you're gonna change it to training environment to, basically, exactly
        // the same as step five."* It reverses the `workbook` ruling of 2026-08-03 (#229) because
        // he reconsidered (#236): *"it might be easier when the students go through the chat
        // because it ensures that they do everything."* The DOCUMENT is unchanged — the walk
        // (_cwValuesCtl) writes into exactly the rows the workbook version already shipped.
        { step: 7,  label: 'Universal Values',          tier: 'si', phase: 'planning' },
        // ⭐⭐ v7.20.451 (Neil, 2026-08-05) — THE +1 RENUMBER. A new Step 8 ("Update Your Plot —
        // Values") sits between Step 7 and Scene Selection, so every step from the old 8 upward
        // moved. ⚠️ THIS TABLE IS NOT COSMETIC: `tier` selects the ENVIRONMENT (`si` = training
        // chat + sidebar, `workbook` = document only), so an off-by-one here boots a step into the
        // wrong environment, not merely under the wrong label. The LearnDash course (41165) was
        // renumbered first on staging; this follows it.
        // ⭐ Step 8 is `si` for the same reason Step 7 is (v7.20.419): Neil, 2026-08-05 — *"whenever
        // we need students to do things a specific way, we need them to do a walk."*
        { step: 8,  label: 'Update Plot: Values',       tier: 'si', phase: 'planning' },
        // Drafting Cycle
        // ⭐ v7.20.507 (Neil, 2026-08-13) — STRIP THE TOOLS ON 9 AND 10. His words: *"the notes tab
        // shouldn't be available. It shouldn't be available in step ten either. And the resources
        // button in the rail shouldn't be available either. And I would say neither should be the
        // majority of them — you know, the story spine button and all that kind of stuff."*
        // Step 9 is the unaided write-out and Step 10 is the test, so the reference panels (other
        // people's work, other steps' work) and the notes scratchpad both come off. `tools` is a
        // CAPABILITY — a step opts in by declaring it, and no sibling inherits it by accident.
        { step: 9,  label: 'Scene Selection',           tier: 'si', phase: 'drafting', tools: 'minimal' },
        // ⭐⭐ v7.20.507 (#366, Neil 2026-08-10) — STEP 10 IS A DIAGNOSTIC, NOT A WALK. His words:
        // *"Step ten is meant to basically be a little bit like a test — it can actually just be
        // like a diagnostic environment. So no walk there. They just write it out and try and
        // polish it to the best of their abilities, then they do their assessment."*
        // `env` is a CAPABILITY, never a `step === 10` literal (canvas task-scoping rule #2):
        // getExerciseConfig reads it, so a future step opts in by adding the word, and no sibling
        // step can inherit this environment by accident.
        { step: 10, label: 'Draft 1: Prose Style',      tier: 'si', phase: 'drafting', draft: 1, env: 'diagnostic', tools: 'minimal' },
        { id: 'trial_1', label: 'Trial 1: Story Coherence', tier: 'si', phase: 'drafting', trial: 1 },
        // v7.20.563 (#428, Neil): Step 11 gets a code-served WALK — so the SI manifest (chat + sidebar).
        { step: 11, label: 'Character Profile',         tier: 'si', phase: 'drafting' },
        // v7.20.567 (#440, Neil): Step 12 gets a code-served WALK (goals into beats, Draft 1 into
        // beats) — so the SI manifest (chat + sidebar), like Steps 8 and 11.
        { step: 12, label: 'Update Plot: Goals',        tier: 'si', phase: 'drafting' },
        // ⭐⭐ v7.20.568 (Neil, 2026-08-25, #440) — THE SECOND +1 RENUMBER. A new Step 13 ("Scene
        // Selection for Draft 2") sits between Update Plot: Goals and Draft 2, so every step from
        // the old 13 upward moved +1 (old 13–30 → 14–31). Same law as the v7.20.451 insert: this
        // table selects the ENVIRONMENT, the LearnDash course (41165) is renumbered to match on
        // each env before this ships, and `_cw_<N>` storage keys are migrated by
        // bin/cw-renumber-migrate-step-keyed-meta.php (from=13).
        // v7.20.576 (Neil, 2026-08-27): NOT tools-minimal. Step 13 was cloned from Step 9's row at
        // .568 and inherited its `tools: 'minimal'`, which took the notes tab, the rail panels and
        // Resources off a lesson that is not a test. Neil: *"steps 12, 13, 14 etc should have the
        // take notes tab visible and useable as they are not test lessons. Only steps 9 and 10 are
        // test lessons"* — which is what the predicate's own comment already said it meant.
        { step: 13, label: 'Scene Selection: Draft 2',  tier: 'si', phase: 'drafting' },
        // v7.20.577 (Neil, 2026-08-27): a POLISHING environment, not a teaching walk. *"It's meant
        // to be a polishing environment… the students select the writing that they want to edit,
        // and then they get a contextual chat."* Steps 11-13 teach the arc and choose the scenes;
        // Step 14 is where the student applies it to Draft 1, by selecting prose and improving it.
        // `lens` names WHICH polish this draft is for — the same engine serves Drafts 3-7, so the
        // lens is data, never a per-step clone.
        { step: 14, label: 'Draft 2: Character Arc',    tier: 'si', phase: 'drafting', draft: 2, env: 'polishing', lens: 'character_arc' },
        { id: 'trial_2', label: 'Trial 2: Character Depth', tier: 'si', phase: 'drafting', trial: 2 },
        { step: 15, label: 'Character Archetypes',      tier: 'workbook', phase: 'drafting' },
        { step: 16, label: 'Update Plot: Archetypes',   tier: 'workbook', phase: 'drafting' },
        { step: 17, label: 'Draft 3: Archetypes',       tier: 'si', phase: 'drafting', draft: 3 },
        { id: 'trial_3', label: 'Trial 3: Archetype Coherence', tier: 'si', phase: 'drafting', trial: 3 },
        { step: 18, label: 'Deepen Empathy',            tier: 'workbook', phase: 'drafting' },
        { step: 19, label: 'Update Plot: Empathy',      tier: 'workbook', phase: 'drafting' },
        { step: 20, label: 'Draft 4: Empathy',          tier: 'si', phase: 'drafting', draft: 4 },
        { id: 'trial_4', label: 'Trial 4: Emotional Impact', tier: 'si', phase: 'drafting', trial: 4 },
        { step: 21, label: 'Theme & Tone',              tier: 'workbook', phase: 'drafting' },
        { step: 22, label: 'Update Plot: Theme',        tier: 'workbook', phase: 'drafting' },
        { step: 23, label: 'Draft 5: Theme & Tone',     tier: 'si', phase: 'drafting', draft: 5 },
        { id: 'trial_5', label: 'Trial 5: Thematic Clarity', tier: 'si', phase: 'drafting', trial: 5 },
        { step: 24, label: 'Genre',                      tier: 'workbook', phase: 'drafting' },
        { step: 25, label: 'Update Plot: Genre',        tier: 'workbook', phase: 'drafting' },
        { step: 26, label: 'Draft 6: Genre',            tier: 'si', phase: 'drafting', draft: 6 },
        { step: 27, label: 'Structural Elements',       tier: 'workbook', phase: 'drafting' },
        { step: 28, label: 'Update Plot: Structural',   tier: 'workbook', phase: 'drafting' },
        { step: 29, label: 'Draft 7: Structural',       tier: 'si', phase: 'drafting', draft: 7 },
        { id: 'trial_6', label: 'Trial 6: Technical Proficiency', tier: 'si', phase: 'drafting', trial: 6 },
        // Polish Phase
        { step: 30, label: 'Final Draft — SPAG',        tier: 'si', phase: 'polish' },
        { step: 31, label: 'Metacognitive Reflection',  tier: 'workbook', phase: 'polish' },
    ];

    // v7.20.507: "does this step run with the tools stripped?" ONE predicate, so the rail and the
    // notes tab can never disagree about which steps are unaided — two deny-lists drifting apart
    // is how a student ends up with the notes tab in a lesson whose rail says it is a test.
    function cwToolsMinimal(task) {
        const d = getCwStepDef(task);
        return !!(d && d.tools === 'minimal');
    }

    // Lookup helper: task string → CW_STEPS entry
    function getCwStepDef(task) {
        if (!task || !task.startsWith('cw_')) return null;
        if (task.startsWith('cw_trial_')) {
            const trialNum = parseInt(task.replace('cw_trial_', ''), 10);
            return CW_STEPS.find(s => s.trial === trialNum) || null;
        }
        const stepNum = parseInt(task.replace('cw_step_', ''), 10);
        return CW_STEPS.find(s => s.step === stepNum) || null;
    }

    // Map CW step numbers to project artifact keys
    const CW_ARTIFACT_MAP = {
        1: 'writer_profile', 2: 'story_ideas', 3: 'logline', 4: 'brief_outline',
        5: 'plot_structure_choice', 6: 'plot_outline', 7: 'universal_values',
        9: 'scene_selection',
        // v7.20.568 (#440): Step 13 saves its document into its OWN key — never `scene_selection`
        // (Step 9's); its island state lives in `scene_selection_2_state`, its join in `scene_draft_2`.
        13: 'scene_selection_2',
        10: 'draft_1', 14: 'draft_2', 17: 'draft_3', 20: 'draft_4',
        23: 'draft_5', 26: 'draft_6', 29: 'draft_7', 30: 'final_draft',
        11: 'character_profile', 15: 'character_archetypes',
        18: 'empathy_plan', 21: 'theme_tone', 24: 'genre',
        27: 'structural_elements', 31: 'reflection',
        // Plot updates save back to plot_outline. v7.20.451: step 8 (Values) is the FIRST of these
        // — Neil's new step — so there are now SEVEN plot updates, not six, and every later one
        // shifted +1. It writes to plot_outline like its siblings because it APPENDS a layer to the
        // living outline (his ruling, 2026-08-05: *"we don't want to overwrite it. We want to just
        // append and add to it"*).
        8:  'plot_outline',
        12: 'plot_outline', 16: 'plot_outline', 19: 'plot_outline',
        22: 'plot_outline', 25: 'plot_outline', 28: 'plot_outline',
    };

    // Sidebar sub-steps for each CW SI exercise (from protocol sub-step tables)
    const CW_SIDEBAR_STEPS = {
        1: [
            { step: 1, label: 'Inner World' },
            { step: 2, label: 'Moral Compass' },
            { step: 3, label: 'Imagination Well' },
            { step: 4, label: 'External Sources' },
            { step: 5, label: 'Review & Save' },
        ],
        2: [
            { step: 1, label: 'Genre Exploration' },
            { step: 2, label: 'Brainstorm Ideas' },
            { step: 3, label: 'Narrow Down' },
        ],
        3: [
            { step: 1, label: 'Logline Formulas' },
            { step: 2, label: 'Draft Loglines' },
            { step: 3, label: 'Refine & Save' },
        ],
        4: [
            { step: 1, label: 'Story Spine' },
            { step: 2, label: 'Draft Outline' },
            { step: 3, label: 'Review & Save' },
        ],
        5: [
            { step: 1, label: 'Explore Templates' },
            { step: 2, label: 'Choose Structure' },
            { step: 3, label: 'Confirm Choice' },
        ],
        6: [
            { step: 1, label: 'Setup Stage' },
            { step: 2, label: 'Dream Stage' },
            { step: 3, label: 'Fascination' },
            { step: 4, label: 'Nightmare Stage' },
            { step: 5, label: 'Final Push' },
            { step: 6, label: 'Goal & Aftermath' },
            { step: 7, label: 'Review & Save' },
        ],
        // v7.20.419: the three sub-steps are the PROTOCOL's own
        // (CW-STEP-07-universal-values.md §Sub-step Overview), not invented here — and
        // _cwValuesCtl derives which one is live from where the walk actually is, never from a
        // hand-stamped count.
        7: [
            { step: 1, label: 'Values at Beginning' },
            { step: 2, label: 'Values at End' },
            { step: 3, label: 'Reflection' },
        ],
        // v7.20.492 (#364) — Step 8 (Update Plot: Values), TRAIT-FIRST (PEDAGOGY §30) in Neil's
        // corrected shape: per trait — their own Step-7 words → pick the stage, then the beat →
        // write, and it APPENDS to that beat. Tagging and writing are ONE motion now, so the old
        // 'Tag the Traits / Work the Beats' split no longer describes anything.
        8: [
            { step: 1, label: 'Trait by Trait' },
            { step: 2, label: 'Continuity Pass' },
        ],
        9: [
            { step: 1, label: 'Review Outline' },
            { step: 2, label: 'Choose Scene(s)' },
            { step: 3, label: 'Scene Plan' },
        ],
        10: [
            { step: 1, label: 'Writing Focus' },
            { step: 2, label: 'Draft Scene' },
            { step: 3, label: 'Review & Save' },
        ],
        // v7.20.563 (#428): the three parts of CW-STEP-11-character-profile.md.
        11: [
            { step: 1, label: 'Goals at Beginning' },
            { step: 2, label: 'Goals at End' },
            { step: 3, label: 'Character Arc' },
        ],
        // v7.20.567 (#440): the three passes of the Step-12 walk (_cwGoalsPlotCtl).
        12: [
            { step: 1, label: 'Goals into Beats' },
            { step: 2, label: 'Draft 1 into Beats' },
            { step: 3, label: 'Continuity Pass' },
        ],
        // v7.20.568 (#440): Step 13 = Step 9's walk over the updated plot.
        13: [
            { step: 1, label: 'Review Outline' },
            { step: 2, label: 'Choose Scene(s)' },
            { step: 3, label: 'Scene Plan' },
        ],
        14: [
            { step: 1, label: 'Character Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        17: [
            { step: 1, label: 'Archetype Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        20: [
            { step: 1, label: 'Empathy Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        23: [
            { step: 1, label: 'Theme Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        26: [
            { step: 1, label: 'Genre Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        29: [
            { step: 1, label: 'Structure Review' },
            { step: 2, label: 'Revise Draft' },
            { step: 3, label: 'Review & Save' },
        ],
        30: [
            { step: 1, label: 'SPAG Review' },
            { step: 2, label: 'Final Polish' },
            { step: 3, label: 'Submit Final Draft' },
        ],
    };

    // Trial sidebar steps (assessment format)
    // v7.20.551 (slice 4): Trial 1's rows are the trial it actually runs — read the draft, judge
    // the seven parts, hear Sophia's verdict. The old four ('Plot Fidelity · Prose Quality') named
    // criteria no trial ever assessed, and the same four rows were shared by all six trials, which
    // is why six differently-named trials looked identical. Trials 2-6 keep the generic list until
    // slice 5 gives each its own dimension.
    CW_SIDEBAR_STEPS['trial_1'] = [
        { step: 1, label: 'Read Your Draft' },
        { step: 2, label: 'Judge the Seven Parts' },
        { step: 3, label: 'Sophia’s Verdict' },
    ];
    CW_SIDEBAR_STEPS['trial_generic'] = [
        { step: 1, label: 'Read Draft' },
        { step: 2, label: 'Plot Fidelity' },
        { step: 3, label: 'Prose Quality' },
        { step: 4, label: 'Feedback' },
    ];
    CW_SIDEBAR_STEPS['trial_2'] = CW_SIDEBAR_STEPS['trial_generic'];
    CW_SIDEBAR_STEPS['trial_3'] = CW_SIDEBAR_STEPS['trial_generic'];
    CW_SIDEBAR_STEPS['trial_4'] = CW_SIDEBAR_STEPS['trial_generic'];
    CW_SIDEBAR_STEPS['trial_5'] = CW_SIDEBAR_STEPS['trial_generic'];
    CW_SIDEBAR_STEPS['trial_6'] = CW_SIDEBAR_STEPS['trial_generic'];

    // ══════════════════════════════════════════════════════════════════════════════════════════
    // ⭐ v7.20.551 (CW trials slice 4) — THE SEVEN SCENE ELEMENTS, AS TRIAL 1 ASSESSES THEM.
    //
    // `prompt` is BYTE-IDENTICAL to the row prompt the student met in Step 9 — it is the
    // definition they were actually taught, not a restatement of it (root §5c: student-facing
    // content derives from what we teach). `bin/cw-trial1-gate.js` diffs these seven strings
    // against the Step-9 template and FAILS on any divergence, so the copy cannot drift.
    // ⚠️ KNOWN DUPLICATION, flagged not fixed (root §7): the same seven definitions are also
    // inlined at three shipped sites in wml-assessment.js (the scene island's element list, the
    // Step-9 template, and buildScenePlanSection). Folding those into this list is a clean-up
    // worth doing, but it is three working features and belongs in its own change; the gate binds
    // this copy to the Step-9 one in the meantime.
    //
    // `planFid` is the Step-9 document row this element's plan lives in — written out in full
    // rather than built as `'cw-step-8-' + id`, because a key assembled at runtime is invisible to
    // `cw-keymatch-harness` and `key-lint`, and an unreadable key is how a read that lands nowhere
    // survives review (§5d). (The `-8-` is a fossil of the step renumber, not a mistake: Step 9's
    // rows kept their original ids so no student's saved document had to be re-keyed.)
    //
    // `strong` is what a strong version of the element DOES — the criterion the student judges
    // their own draft against. `example` is the one worked example that rides in the ask itself
    // (help ladder rung 0), `more` the two that the [💡 More examples] chip serves (rung 1), so
    // a stuck student never has to spend an API call to understand the question. The examples are
    // story BEATS, deliberately never quotations: a beat can be described accurately, whereas a
    // quotation would have to be verified word for word against the edition (§5c-i), and the
    // structural point does not need the words. Set texts carry the exam-facing weight; the film
    // and fairy-tale beats are there because a student who already knows the moment learns the
    // technique from it instead of decoding an unfamiliar extract first.
    // ══════════════════════════════════════════════════════════════════════════════════════════
    const CW_SCENE_ELEMENTS = [
        {
            id: 'hook', planFid: 'cw-step-8-hook', label: 'Hook',
            prompt: 'Grab your reader\u2019s attention.',
            // \u2b50 v7.20.557 (#427b, Neil): the criterion judges the JOB, never one technique. The
            // old wording ("starts in the middle of something") mandated in medias res \u2014 one hook
            // among many (premonition, setting, a voice\u2026 the Table of Techniques lists them), so
            // a student with a superb premonition hook could not honestly claim Level 2. Quality
            // words, AO5's register: convincing, compelling.
            strong: 'A strong hook is genuinely compelling \u2014 within the first few lines the reader is holding a question they need answered, so they have to read on. There are many ways to earn that (dropping into the middle of a moment, a premonition, a striking image or setting \u2014 the Table of Techniques lists more); what earns the marks is the pull, not which technique you chose.',
            example: 'Macbeth opens on a blasted heath with three witches planning to meet a man we have not met yet. Shakespeare does not begin with Macbeth\u2019s biography; he begins with a plan already in motion, and we read on to find out who it is about.',
            more: [
                'A Christmas Carol opens by insisting Marley is dead \u2014 "dead as a door-nail" \u2014 and then refuses to explain why that matters. Dickens hands you a fact and withholds its purpose, which is exactly what makes you turn the page.',
                'Jaws opens underwater, at night, with a swimmer who does not know she is being watched. The reader knows more than the character does, and that gap is the hook.',
            ],
        },
        {
            id: 'setup', planFid: 'cw-step-8-setup', label: 'Setup',
            prompt: 'Introduce the problem and the characters around it.',
            strong: 'A strong setup makes the reader understand what is at stake and who it is at stake for \u2014 the problem is not just described, it is attached to a person we can already picture.',
            example: 'In A Christmas Carol, the clerk shivering in his cell of an office and the nephew turned away at the door do the setup in a page: we know Scrooge\u2019s problem, and we know exactly who is hurt by it.',
            more: [
                'In Of Mice and Men, the setup is two men and one dream of a small farm. The problem (they own nothing and are always moving on) is inseparable from the two people it belongs to.',
                'In Finding Nemo, the setup is a father who has already lost almost everything and a son who wants to swim out further. The whole story is contained in that disagreement.',
            ],
        },
        {
            id: 'reaction', planFid: 'cw-step-8-reaction', label: 'Reaction',
            prompt: 'The protagonist deals with the problems the best they can: coping and not coping.',
            strong: 'A strong reaction shows the protagonist doing what they would naturally do \u2014 and it not being enough. The reader should see them coping in the way that has always worked for them, and see it failing this time.',
            example: 'Macbeth\u2019s first reaction to the witches is to do nothing and hope the crown arrives on its own \u2014 "chance may crown me". Waiting is his instinct, and the story exists because waiting does not work.',
            more: [
                'In An Inspector Calls, Birling\u2019s reaction to the first question is to reach for his authority \u2014 name-dropping, bluster, a reminder that he was Lord Mayor. It is what has always worked for him, and the Inspector is unmoved by it.',
                'In Frozen, Elsa reacts to being found out by running away and building a palace of ice. Running has kept her safe her whole life; here it freezes an entire kingdom.',
            ],
        },
        {
            id: 'epiphany', planFid: 'cw-step-8-epiphany', label: 'Epiphany',
            prompt: 'The protagonist begins to understand what\u2019s really going on and what to do.',
            strong: 'A strong epiphany is a change in what the protagonist UNDERSTANDS, and the reader should be able to point at the moment it happens \u2014 a line, an image, something they notice that they could not see before.',
            example: 'Scrooge\u2019s epiphany is standing at his own neglected grave. Nothing new is explained to him; he simply sees where his life is going, and from that second he behaves differently.',
            more: [
                'In Romeo and Juliet, the Friar\u2019s epiphany is realising the feud will only stop if the families are made to look at what it costs them. His plan follows from the understanding, not the other way round.',
                'In The Lion King, Simba\u2019s epiphany is being told his father lives on in him. He does not learn a new fact about Scar \u2014 he changes what he thinks he is allowed to be.',
            ],
        },
        {
            id: 'proaction', planFid: 'cw-step-8-proaction', label: 'Proaction',
            prompt: 'The protagonist implements a plan. It fails.',
            strong: 'A strong proaction is a real plan with real thought behind it, and the failure comes from something the plan could not account for \u2014 not from the protagonist suddenly being stupid.',
            example: 'Juliet\u2019s plan \u2014 the sleeping potion, the letter, the tomb \u2014 is careful and it is sound. It fails because a letter does not arrive, which is exactly the kind of thing no plan can control.',
            more: [
                'In Jekyll and Hyde, Jekyll\u2019s plan is to separate the two halves of himself so the respectable half stays clean. It works perfectly, and that is why it destroys him.',
                'In Toy Story, Woody\u2019s plan to nudge Buzz behind the desk is a plan; knocking him out of the window is the part he did not intend, and it costs him everything.',
            ],
        },
        {
            id: 'climax', planFid: 'cw-step-8-climax', label: 'Climax',
            prompt: 'The forces of good and evil collide.',
            strong: 'A strong climax puts the protagonist face to face with the thing that has been opposing them, and the outcome turns on the change they made at the epiphany \u2014 so the ending is earned rather than lucky.',
            example: 'Macbeth meets Macduff knowing the prophecy that protected him has run out. He fights anyway, and the collision settles the question the whole play has been asking about him.',
            more: [
                'In An Inspector Calls, the climax is not a fight but the Inspector\u2019s final speech \u2014 the moment the family can no longer hold their version of events together.',
                'In Star Wars, Luke switches off the targeting computer at the climax. He wins with the thing he learned, which is what makes the trench run feel earned instead of lucky.',
            ],
        },
        {
            id: 'denouement', planFid: 'cw-step-8-denouement', label: 'Denouement',
            prompt: 'You write an unforgettable ending.',
            strong: 'A strong denouement shows the world after the collision and lets the reader feel what has changed \u2014 usually in an image rather than an explanation, and never by telling them what to think.',
            example: 'A Christmas Carol ends with Scrooge as a second father to Tiny Tim and the words "God bless us, every one" given to the child. Dickens shows the changed world instead of announcing the moral.',
            more: [
                'Of Mice and Men ends with two men who saw what happened and cannot explain it to the others. The quietness of the last page is what makes it land.',
                'In Blood Brothers, the ending returns to the narrator and the same question it opened with. Nothing is explained; the frame simply closes.',
            ],
        },
    ];

    // ⭐ v7.20.559 (#431, Neil 2026-08-25): THE TRIAL'S SECOND DIMENSION. Real GCSE creative
    // writing is marked on TWO sets of criteria — Content and Organisation (AO5) and Technical
    // Accuracy (AO6) — so after the seven scene parts the student judges ONE more, out of 2, in
    // his words: 1 = "some mistakes are common", 2 = "accurate spelling, punctuation, grammar".
    // /28 → /30. This element carries its own `outOf` and Level-1 text; everything else in the
    // walk (ladder, arithmetic, rows, Sophia's tokens) DERIVES from those two fields, so a third
    // dimension would be data. Supersedes PEDAGOGY §33.1/.11 for the trials (amended same day).
    const CW_TRIAL1_ACCURACY = {
        id: 'accuracy', label: 'Technical Accuracy', outOf: 2, ao: 'AO6',
        prompt: 'Spelling, punctuation and grammar that let a reader read without stumbling.',
        // v7.20.560 (#433, Neil): Level 1 must be a THRESHOLD the student can say "yes, all of it"
        // to — the .559 wording was a deficit ("some mistakes are common"), so "Yes — all of it"
        // read as "yes, I have all the mistakes". Positive claim first; the slips are the qualifier.
        l1: 'A reader can follow the writing all the way through. Some mistakes are common — slips in spelling, punctuation or grammar that a reader notices — but none of them stops the meaning getting through.',
        strong: 'Spelling, punctuation and grammar are accurate — a reader never has to re-read a sentence to work out what you meant.',
        example: 'Read one paragraph of your draft aloud, exactly as it is written. If you stumble on a missing full stop, a run-on sentence or a misspelt word, the reader will stumble there too — that is a slip a reader notices. If you read straight through without a hitch, that paragraph is accurate.',
        more: [
            'The three slips examiners see most: a comma where a full stop belongs ("She ran, she did not look back"), their / there / they’re, and speech with no punctuation inside the speech marks. Check for those three first.',
            'Accurate is not the same as simple. A long sentence with three commas and a dash can be perfectly accurate; a short one can still be missing its full stop.',
        ],
    };
    const CW_TRIAL1_ELEMENTS = CW_SCENE_ELEMENTS.concat([CW_TRIAL1_ACCURACY]);

    // ⭐ v7.20.550 (CW trials slice 3) — WHICH DRAFT DOES A TRIAL ASSESS?
    // DERIVED from CW_STEPS, never a hand-written trial→draft map. A trial assesses the draft
    // written immediately before it, so the answer is "walk back to the nearest entry that
    // declares a `draft`" — and it stays correct on its own when a trial MOVES (PEDAGOGY §33
    // ruling 1 moves Trial 6 to follow Draft 6). A literal map would have to be remembered at
    // that moment; this cannot be forgotten, because there is nothing to remember.
    // Returns { artifactKey, draftStep, draftNumber, draftLabel } or null.
    function cwTrialSource(task) {
        const def = getCwStepDef(task);
        if (!def || !def.trial) return null;
        const idx = CW_STEPS.indexOf(def);
        if (idx < 0) return null;
        for (let i = idx - 1; i >= 0; i--) {
            const s = CW_STEPS[i];
            if (!s.draft) continue;
            const key = CW_ARTIFACT_MAP[s.step];
            if (!key) return null;
            return { artifactKey: key, draftStep: s.step, draftNumber: s.draft, draftLabel: s.label };
        }
        return null;
    }

    // ⭐ v7.20.554 (#424 / PEDAGOGY §33.9) — WHICH TRIAL FEEDS A DRAFT ITS TARGET?
    // The mirror of cwTrialSource, DERIVED the same way: a draft opens on the target the student
    // wrote at the end of the trial immediately before it, so the answer is "walk back to the
    // nearest trial entry, stopping at any earlier draft" — and it survives §33.7's Trial-6 move
    // with no edit, for the same reason cwTrialSource does.
    // Returns { trial, trialStep, trialLabel } or null (Draft 1 has no trial before it).
    function cwDraftTrialSource(task) {
        const def = getCwStepDef(task);
        if (!def || !def.draft) return null;
        const idx = CW_STEPS.indexOf(def);
        if (idx < 0) return null;
        for (let i = idx - 1; i >= 0; i--) {
            const s = CW_STEPS[i];
            if (s.draft) return null;
            if (s.trial) return { trial: s.trial, trialStep: s.step, trialLabel: s.label };
        }
        return null;
    }

    // Map draft steps to the artifact key of their predecessor (for pre-population)
    // v7.20.451: every key here is a DRAFT step, so every one shifted +1 with the renumber.
    // v7.20.568 (#440): Draft 2 (step 14) is NOT here any more — it is SEEDED from Step 13's
    // transfer (CW_SEED_FROM below), exactly as Draft 1 is seeded from Step 9's, so the merged
    // scene lands in its draft box instead of the whole Draft-1 document being copied over.
    const CW_DRAFT_PREDECESSOR = {
        17: 'draft_2', 20: 'draft_3', 23: 'draft_4',
        26: 'draft_5', 29: 'draft_6', 30: 'draft_7',
    };

    // ⭐ v7.20.507 (#366) — WHICH ARTIFACT SEEDS A STEP'S WRITING BOX, and it is deliberately a
    // DIFFERENT mechanism from CW_DRAFT_PREDECESSOR above. That map replaces the WHOLE document
    // with the previous draft's document; this one drops prose INTO the draft box of this step's
    // own template, leaving the teaching and the box's provenance flag intact.
    // Step 10 receives the scene the student wrote out and transferred in Step 9 — Neil, 2026-08-13:
    // *"it transfers all of it as just prose with no labels into some sort of area that the student
    // can check. And then that area will then seed step ten."*
    const CW_SEED_FROM = { 10: 'scene_draft', 14: 'scene_draft_2' };   // v7.20.568 (#440): Step 13 → Draft 2

    // ── EXERCISE MANIFEST — single source of truth for all exercise types (v7.13.11) ──
    // Each entry defines what panels render, which protocol loads, how completion is detected,
    // and what step/element arrays to use. The renderer reads from this instead of if/else chains.
    //
    // environment: 'canvas' = assessment canvas workspace, 'chat' = main chat interface, 'write_only' = document only (no AI chat)
    // panels: which canvas panels to show (only relevant for environment: 'canvas')
    // protocolSource: 'board' = board-specific protocol, 'shared' = shared/literature, 'preamble' = preamble-only (no file), null = none
    // protocolTask: the task key sent to protocol router (may differ from manifest key)
    // completionType: 'assessment_detect' = score/grade pattern matching, 'step_complete' = last step reached,
    //                 'manual' = student clicks complete, 'learndash' = LD Mark Complete, 'none' = no completion tracking
    // storageSuffix: appended to localStorage/DB keys to isolate data between exercise types
    // v7.14.59: Removed hardcoded phase from all entries — phase comes purely from bridge embed config
    const EXERCISE_MANIFEST = {
        // ── Phase 1: Initial Attempt ──
        diagnostic: {
            label: 'Write Essay',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        // v7.19.19+ Exam Prep Crib — in-line coaching env (Phase 1).
        // Doc-first canvas + per-Q anchor sidebar + Sophia coaching.
        // v7.19.20: TEMPORARILY uses training-env panels (chat panel visible
        //          so students can invoke Sophia by typing) until the Tiptap
        //          floating selection chip ships in the next sub-ship. After
        //          selection-chip lands, env type flips to 'inline-coaching'
        //          + chat panel hides + chip becomes primary invocation.
        // Routes to `protocols/shared/modules/inline-coaching-core.md` +
        // `inline-coaching-engine-1.md` + per-paper rubric (router L987+).
        exam_crib: {
            label: '10 Most Likely Qs',
            environment: 'inline-coaching', // v7.19.24: chip ships; flip from training
            // v7.19.24: chat panel hidden — selection-chip is primary invocation.
            // Anchor-list sidebar (Q1...Qn) rendered by buildInlineCoachingPanels().
            panels: { sidebar: true, chat: false, guidance: false, document: true, progress: false },
            steps: null,
            elements: null,
            protocolSource: 'shared',
            protocolTask: 'exam_crib',
            completionType: 'manual',
            storageSuffix: '_crib',
            chatHeaderLabel: 'Sophia — Exam Prep Coach',
            coachHeaderLabel: 'Sophia — Exam Prep Coach',
            sidebarSteps: null,
        },
        assessment: {
            label: 'Assessment',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'ASSESSMENT_STEPS',
            elements: 'ASSESSMENT_ELEMENTS',
            protocolSource: 'board',
            protocolTask: 'assessment',
            completionType: 'assessment_detect',
            storageSuffix: '',
            // v7.19.249 (Model B): the Phase 2 reassessment mounts as task='assessment'
            // (redraft_assessment collapses to it) with phase='redraft' → its OWN
            // _reassessment canvas doc, matching the redraft_assessment manifest.
            // v7.19.714 (Phase-1 snapshot chain): Phase 1 assessment now gets its OWN
            // _assessment doc too (was the legacy '' shared with the diagnostic). Diagnostic
            // + Assessment become independent per-stage snapshots — edits in Assessment no
            // longer bleed back into the Diagnostic — and the Assessment doc seeds forward
            // from the diagnostic essay (seedFromSiblings). Mirrors the proven Phase-2
            // _reassessment split; only the suffix + seed-source differ (same task/template).
            canvasStorageSuffixForPhase: function (phase) { return phase === 'redraft' ? '_reassessment' : '_assessment'; },
            // v7.19.582: the CHAT suffix MUST track the canvas suffix per phase, else the
            // Phase 1 (diagnostic) and Phase 2 (reassessment) assessment chats COLLIDE on
            // the same '' key (Phase 2 overwrote Phase 1) AND the tutor review view — which
            // loads the doc by the _reassessment suffix — finds no chat there (chat was at '').
            // Mirror canvasStorageSuffixForPhase so chat + canvas live under the same suffix.
            // v7.19.714: Phase 1 chat follows the canvas to '_assessment' (was '').
            storageSuffixForPhase: function (phase) { return phase === 'redraft' ? '_reassessment' : '_assessment'; },
            chatHeaderLabel: 'Essay Assessment',
            sidebarSteps: [
                { step: 1, label: 'Setup & Details' },
                { step: 2, label: 'Goal Setting' },
                { step: 3, label: 'Self-Reflection' },
                { step: 4, label: 'Scoring' },
                { step: 5, label: 'AO Deep Dive' },
                { step: 6, label: 'Feedback & Strengths' },
                { step: 7, label: 'Action Plan' },
                { step: 8, label: 'Session Complete' },
            ],
        },
        feedback_discussion: {
            label: 'Discuss Feedback',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: true, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            // v7.15.81: Discuss Feedback is part of the phase sequence.
            // v7.19.714 (Phase-1 snapshot chain): Phase 1 Discuss-Feedback now gets its OWN
            // _fbdiscuss doc (was the legacy '' shared with diagnostic + assessment), seeded
            // forward from the assessment doc (essay + feedback) via seedFromSiblings. Phase 2
            // still shares the redraft doc (_redraft); standalone keeps its own BYO record.
            storageSuffix: '',
            storageSuffixForPhase: function (phase) {
                if (phase === 'redraft')    return '_redraft';
                if (phase === 'standalone') return '_fb_standalone';
                return '_fbdiscuss';
            },
            chatHeaderLabel: 'Discuss Feedback',
            sidebarSteps: null,
        },

        // ── Phase 2: Redraft ──
        mark_scheme: {
            label: 'Mark Scheme Assessment',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: 'preamble',
            protocolTask: 'mark_scheme',
            completionType: 'manual',
            storageSuffix: '_ms',
            chatHeaderLabel: 'Mark Scheme Assessment',
            // v7.18.17: granular Q-by-Q sidebar with two accordion groups
            // (Questions 1-5 + Questions 6-10). Standalone steps render flat;
            // grouped steps wrap in an accordion via _renderSidebarSteps in
            // wml-assessment.js. Preamble at protocol-router.php emits
            // [STEP_ADVANCE:N] markers per Q + scoring + feedback + action plan.
            sidebarSteps: [
                { step: 1,  label: 'Setup & Board' },
                { step: 2,  label: 'Q1',  group: 'Questions 1-5' },
                { step: 3,  label: 'Q2',  group: 'Questions 1-5' },
                { step: 4,  label: 'Q3',  group: 'Questions 1-5' },
                { step: 5,  label: 'Q4',  group: 'Questions 1-5' },
                { step: 6,  label: 'Q5',  group: 'Questions 1-5' },
                { step: 7,  label: 'Q6',  group: 'Questions 6-10' },
                { step: 8,  label: 'Q7',  group: 'Questions 6-10' },
                { step: 9,  label: 'Q8',  group: 'Questions 6-10' },
                { step: 10, label: 'Q9',  group: 'Questions 6-10' },
                { step: 11, label: 'Q10', group: 'Questions 6-10' },
                { step: 12, label: 'Results & Grade' },
                { step: 13, label: 'Feedback' },
                { step: 14, label: 'Action Plan' },
            ],
        },
        model_answer_video: {
            label: 'Model Answer',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: true, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_mav',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        outlining: {
            label: 'Outline Response',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: true, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            // v7.19.249 (Model B): per-stage canvas doc. Outlining keeps its own frozen
            // snapshot; copy-forward seeds it from the planning stage on first entry.
            // storageSuffix (_redraft) stays as the per-topic attempt-index key.
            storageSuffix: '_redraft',
            canvasStorageSuffix: '_outlining',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        response: {
            label: 'Write Response',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_redraft',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        redraft_assessment: {
            label: 'Reassessment',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'ASSESSMENT_STEPS',
            elements: 'ASSESSMENT_ELEMENTS',
            protocolSource: 'board',
            protocolTask: 'assessment',
            completionType: 'assessment_detect',
            // v7.19.584 ROOT FIX: chat+state suffix aligned to '_reassessment' (was
            // '_redraft'). The phase-2 marking lives under ONE canonical key: the
            // `assessment` task (storageSuffixForPhase redraft → _reassessment), this
            // task's own canvas doc, AND tutor review (defaults task=assessment) all
            // read '_reassessment'. While redraft_assessment wrote chat to '_redraft',
            // every NEW reassessment conversation was invisible to all three. '_redraft'
            // belongs to the redraft WRITING task — a separate conversation that was
            // wrongly colliding with the marking chat.
            storageSuffix: '_reassessment',
            // v7.19.249 (Model B): reassessment marks the polished essay copied forward
            // from polishing — its own frozen doc, distinct from Phase 1 (suffix '').
            canvasStorageSuffix: '_reassessment',
            chatHeaderLabel: 'Essay Assessment',
            sidebarSteps: [
                { step: 1, label: 'Setup & Details' },
                { step: 2, label: 'Goal Setting' },
                { step: 3, label: 'Self-Reflection' },
                { step: 4, label: 'Scoring' },
                { step: 5, label: 'AO Deep Dive' },
                { step: 6, label: 'Feedback & Strengths' },
                { step: 7, label: 'Action Plan' },
                { step: 8, label: 'Session Complete' },
            ],
        },

        // v7.17.15: Mark Scheme Unit — Quiz (step=1) + Forging Your Weapon (step=2).
        // Both steps share this task slug so they write to the same canvas doc per
        // attempt (student's quiz notes remain visible during FYW). Protocol router
        // dispatches on bridge-provided step to mark-scheme-quiz/ or forging-your-weapon/.
        mark_scheme_unit: {
            label: 'Mark Scheme Unit',
            environment: 'training',
            // v7.17.16: progress panel hidden — this task is chat-driven, no protocol step progression.
            // v7.18.23: progress panel restored. Quiz (bridgeStep=1) gets a 7-step Welcome→Q1-Q5→Results
            // sidebar; FYW (bridgeStep=2) gets a 5-step Forge→Comparison→Critique→Anatomy→Next Steps
            // sidebar. getSteps() returns the right array per state.bridgeStep. state.sidebarStep
            // tracks position so state.step can stay pinned to bridge dispatch (1/2) without conflict.
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: 'shared',
            protocolTask: 'mark_scheme_unit',
            completionType: 'step_complete',
            storageSuffix: '_msu',
            chatHeaderLabel: 'Mark Scheme Unit',
            sidebarSteps: null,
            // v7.17.16: blank TipTap doc — canvas is a free-form note scratchpad for this task,
            // not a structured essay. Suppresses the default essay TOC template.
            blankCanvas: true,
        },

        // ── Canvas exercises (v7.14.29: migrated from chat to canvas) ──
        planning: {
            label: 'Response Planning',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: 'board',
            protocolTask: 'planning',
            completionType: 'step_complete',
            storageSuffix: '_planning',
            // v7.19.249 (Model B): planning is its own frozen stage doc. It's the FIRST
            // Phase 2 stage, so it starts from the template (no sibling to copy forward);
            // outlining then copies planning forward. Chat also on _planning.
            canvasStorageSuffix: '_planning',
            chatHeaderLabel: 'Essay Planning',
            sidebarSteps: null, // v7.14.66: populated dynamically from manifest via /protocol-steps endpoint
        },
        polishing: {
            label: 'Polishing',
            // v7.19.250: inline-coaching env (was 'training'). Mirrors exam_crib pattern:
            // student highlights any text → Sophia SelectionChip → Socratic coaching reply
            // (server still injects the board polishing protocol rubric via protocolTask).
            // No rigid sidebar steps; no auto-greet. Resolves the long-standing "placeholder"
            // comment that anticipated this migration.
            environment: 'inline-coaching',
            // v7.20.579: literature/language polishing said "Exam Prep Coach" too.
            coachHeaderLabel: 'Sophia — Polishing Coach',
            panels: { sidebar: true, chat: false, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: 'board',
            protocolTask: 'polishing',
            completionType: 'manual',
            storageSuffix: '_polishing',
            // v7.19.249 (Model B): polishing is its own frozen stage doc (supersedes the
            // v7.19.248 shared-_redraft merge — Model B separates per stage). Copy-forward
            // seeds it from outlining on first entry; the student then refines that essay.
            canvasStorageSuffix: '_polishing',
            chatHeaderLabel: 'Essay Polishing',
            sidebarSteps: null,
        },
        exam_question: {
            label: 'Exam Question',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'EXAM_QUESTION_STEPS',
            elements: 'EXAM_QUESTION_ELEMENTS',
            protocolSource: 'board',
            protocolTask: 'exam_question',
            completionType: 'step_complete',
            storageSuffix: '_eq',
            documentTemplate: 'exam_question',  // v7.13.17: template ready for canvas migration
            chatHeaderLabel: 'Exam Question Creator',
            sidebarSteps: null,
        },
        essay_plan: {
            label: 'Essay Plan',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'ESSAY_PLAN_STEPS',       // getSteps() handles mode A→RECALL variant
            elements: null,
            protocolSource: 'shared',
            protocolTask: 'essay_plan',
            completionType: 'step_complete',
            storageSuffix: '_ep',
            documentTemplate: 'essay_plan',     // v7.13.17: template ready for canvas migration
            chatHeaderLabel: 'Essay Plan',
            sidebarSteps: null,
        },
        model_answer: {
            label: 'Model Answer',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'MODEL_ANSWER_STEPS',     // getSteps() handles mode C→ADVANCED variant
            elements: 'MODEL_ANSWER_ELEMENTS',
            protocolSource: 'shared',
            protocolTask: 'model_answer',
            completionType: 'step_complete',
            storageSuffix: '_ma',
            documentTemplate: 'model_answer',   // v7.13.17: template ready for canvas migration
            chatHeaderLabel: 'Model Answer',
            sidebarSteps: null,
        },
        verbal_rehearsal: {
            label: 'Quote Analysis',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'QUOTE_ANALYSIS_STEPS',
            elements: 'QUOTE_ANALYSIS_ELEMENTS',
            protocolSource: 'shared',
            protocolTask: 'verbal_rehearsal',
            completionType: 'step_complete',
            storageSuffix: '_qa',
            documentTemplate: 'quote_analysis', // v7.13.17: template ready for canvas migration
            chatHeaderLabel: 'Quote Analysis',
            sidebarSteps: null,
        },
        conceptual_notes: {
            label: 'Conceptual Notes',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'CONCEPTUAL_NOTES_STEPS', // getSteps() handles poetry/nonfiction variants
            elements: 'CONCEPTUAL_NOTES_ELEMENTS', // getElements() handles variants
            protocolSource: 'shared',
            protocolTask: 'conceptual_notes',
            completionType: 'step_complete',
            storageSuffix: '_cn',
            documentTemplate: 'conceptual_notes', // v7.13.17: two variants — literature (plays/novels) + poetry
            chatHeaderLabel: 'Conceptual Notes',
            sidebarSteps: null,
        },
        foundational_quiz: {
            label: 'Foundational Quiz',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'CONCEPTUAL_NOTES_STEPS',        // reuses conceptual-notes document shell
            elements: 'CONCEPTUAL_NOTES_ELEMENTS',
            protocolSource: 'shared',
            protocolTask: 'foundational_quiz',
            completionType: 'code_word',            // [QUIZ_COMPLETE] marks done
            // Chat history stays per-FQ-lesson under _fq.
            storageSuffix: '_fq',
            // v7.19.955 (Neil rulings 2026-07-07/08): ONE doc serves the CN lesson
            // AND the FQ — the FQ's canvas doc IS the Conceptual Notes doc, so
            // quiz mastery can autofill notes the student builds on in Topic 2.
            // Doc identity remaps via canvasDocScope(): suffix _cn, text follows
            // the served BANK (state.fqBank — e.g. poetic_forms, the one shared
            // forms organiser across courses), topic pinned to the CN slot (2).
            // Chat + grade filing keep the lesson's own identity (v7.19.952 law:
            // the bank override never re-keys grades). v7.15.99's separate-_fq
            // attempt-counter concern is gone — quizzes have no attempt model
            // since v7.19.954 (mastery rounds, attempt locked to 1).
            canvasStorageSuffix: '_cn',
            canvasTextSource: 'fqBank',   // canvas text = state.fqBank || state.text (v7.19.971: POETRY excluded in canvasDocScope — poetry FQs land on the per-anthology one-doc)
            canvasTopicPin: 2,            // Topic 2 = the Conceptual Notes slot
            documentTemplate: 'conceptual_notes',   // same doc — concept sections become read-only in render
            chatHeaderLabel: 'Foundational Quiz',
            sidebarSteps: null,
        },
        memory_practice: {
            label: 'Memory Practice',
            environment: 'training',        // v7.14.36: renamed from 'canvas'
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: 'MEMORY_PRACTICE_STEPS',
            elements: null,
            protocolSource: 'shared',
            protocolTask: 'memory_practice',
            completionType: 'step_complete',
            storageSuffix: '_mp',
            documentTemplate: 'memory_practice', // v7.13.17: template ready for canvas migration
            chatHeaderLabel: 'Memory Practice',
            sidebarSteps: null,
        },
        // v7.19.203: Mastery Codex — Grade 9 Core Skills induction. ONE
        // user-scoped doc across all 9 units. Mirrors `diagnostic` env so
        // students see the same WML TipTap canvas chrome as language/lit
        // documents — no Sophia chat, no protocol stepper, no sidebar nav
        // (Codex is one continuous document; navigation between units is
        // by scrolling within the doc). Storage uses canvas pipeline; key
        // resolves to swml_canvas_all_g9_core_skills (bridge passes board=all
        // text=g9_core_skills) which is functionally user-scoped because
        // every Codex page binds to the same board/text in the bridge.
        mastery_codex: {
            label: 'Mastery Codex',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '',
            documentTemplate: 'mastery_codex',
            chatHeaderLabel: 'Mastery Codex',
            sidebarSteps: null,
        },

        // ── Creative Writing: SI-Guided Steps (v7.13.34) ──
        cw_si: {
            label: 'Creative Writing',
            environment: 'training',
            panels: { sidebar: true, chat: true, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: 'shared',
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_cw',
            chatHeaderLabel: 'Sophia',
            sidebarSteps: null,
        },
        // ── Creative Writing: DIAGNOSTIC draft steps (v7.20.507, #366) ──
        // The student's scene arrives already written (seeded from Step 9's locked section); this
        // step is where they polish it alone and hand it to the assessment. No chat, no walk, no
        // sidebar — the same shape as the essay `diagnostic` above, which is what Neil asked for.
        // ⚠️ `protocolSource: null` on purpose: CW-STEP-10-draft-1-prose-style.md still describes
        // the OLD Socratic workshop and would contradict this ruling if it were ever loaded.
        // ⚠️ The panel shape is cw_workbook's, byte for byte, because that is a SHIPPED, proven
        // doc-only rendering path (`isCwWorkbook` now admits this env). Inventing a fourth panel
        // combination would have sent Step 10 down a branch nothing has ever rendered.
        cw_diagnostic: {
            label: 'Creative Writing',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: true, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_cw',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        // ── Creative Writing: POLISHING draft steps (v7.20.577) ──
        // Neil, 2026-08-27: Draft 2 onward is a polishing environment — the student SELECTS the
        // prose they want to work on and gets a contextual chat about that selection, instead of
        // being walked through a teaching chat they have already had in Steps 11-13.
        // Panel shape and environment are the SHIPPED `polishing` entry's, byte for byte, so this
        // rides a rendering path that already works rather than inventing a new combination.
        // ⚠️ `protocolSource: null` for now, on the `cw_diagnostic` precedent: the step's own
        // CW-STEP-14 markdown is the OLD Socratic walk and would be narrated at the student if it
        // were loaded — the exact failure the retained-source law (§5) records. The coaching
        // protocol (inline-coaching-core + engine + a CW rubric) is wired in the next commit; until
        // it is, Sophia has no CW polishing rubric and this step is NOT student-ready.
        cw_polishing: {
            label: 'Creative Writing',
            environment: 'inline-coaching',
            // v7.20.579: the coach panel's own title. Without it every inline-coaching lesson
            // called itself "Exam Prep Coach" — the literal this panel was born with.
            coachHeaderLabel: 'Sophia — Writing Coach',
            panels: { sidebar: true, chat: false, guidance: false, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_cw',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
        // ── Creative Writing: Workbook Steps (v7.13.34) ──
        cw_workbook: {
            label: 'Creative Writing',
            environment: 'free',
            panels: { sidebar: false, chat: false, guidance: true, document: true },
            steps: null,
            elements: null,
            protocolSource: null,
            protocolTask: null,
            completionType: 'manual',
            storageSuffix: '_cw',
            chatHeaderLabel: null,
            sidebarSteps: null,
        },
    };

    // v7.15.70: Paper-shape resolver — DORMANT helper for the board-agnostic
    // question-generation engine. Reads window.swmlLitSpecs + window.swmlLangSpecs
    // (both embedded server-side) and returns a normalised paper-shape descriptor
    // that downstream consumers (parser, template dispatcher, injector, quality
    // gates) will switch on starting Release B+.
    //
    // Not called anywhere in v7.15.70 — shipping the plumbing alone so the spec
    // schema can be audited against real lessons before behavioural changes land.
    //
    // ctx = { board, subject, task, paper?, questionNumber?, lessonMeta? }
    // Returns: { shape, marks?, spagMarks?, aos?, extract?, questionPrefix?, source }
    //   source ∈ 'lesson-meta' | 'literature-specs' | 'language-specs' | 'default'
    function resolvePaperShape(ctx) {
        const { board = '', subject = '', questionNumber = null, lessonMeta = null } =
            ctx || {};
        const litSpecs = (typeof window !== 'undefined' && window.swmlLitSpecs) || {};
        const langSpecs = (typeof window !== 'undefined' && window.swmlLangSpecs) || {};

        // 1. Explicit lesson-meta override (manual pin set in LD admin)
        if (lessonMeta && lessonMeta.shape_override) {
            return { shape: lessonMeta.shape_override, source: 'lesson-meta' };
        }

        const normBoard = String(board).replace(/_/g, '-').toLowerCase();

        // 2. Literature specs (shape already declared per board × subject)
        const litBoard = litSpecs[normBoard];
        if (litBoard && subject && litBoard[subject]) {
            const row = litBoard[subject];
            return {
                shape: row.shape,
                marks: row.marks,
                spagMarks: row.spag_marks,
                aos: row.aos,
                extract: row.extract,
                questionPrefix: row.question_prefix,
                source: 'literature-specs',
            };
        }

        // 3. Language specs — derive shape from question `type`
        const langBoard = langSpecs[normBoard];
        if (langBoard && subject && langBoard[subject]) {
            const paperSpec = langBoard[subject];
            const derived = _deriveLangPaperShape(paperSpec, questionNumber);
            if (derived) return { ...derived, source: 'language-specs' };
        }

        // 4. Default fallback — single-extract (covers today's AQA behaviour)
        return { shape: 'lit-extract-single', source: 'default', _fallback: true };
    }

    // ── Canonical task-caps lookup (v7.19.x Commit 1 — INFRA, dormant) ──
    // The server (SWML_Protocol_Router::build_task_caps) emits swmlConfig.taskCaps:
    // every known task → { taskFamily, markingFlow, … }. These read it so client
    // gates can stop spelling literal task strings. No call site wired yet.
    function caps(task) {
        return (window.swmlConfig && window.swmlConfig.taskCaps && window.swmlConfig.taskCaps[task]) || null;
    }
    function cap(task, flag) {
        return caps(task) ? !!caps(task)[flag] : false;
    }
    // markingFlow: assessment-marking flows send the FULL chat history (the
    // v7.19.591 confirmed-loop fix). Reads the server caps; the literal fallback
    // fires ONLY if swmlConfig.taskCaps is absent (transient stale-page HTML +
    // new JS) — a silent regress otherwise. Keep the fallback set in sync with
    // SWML_Protocol_Router::build_task_caps()'s $marking_flow_tasks. (v7.19.655)
    function isMarkingFlow(task) {
        const c = caps(task);
        if (c) return !!c.markingFlow;
        return ['assessment', 'redraft_assessment', 'feedback_discussion'].includes(task);
    }
    // hasAssessmentSections: does migrateDocument inject the 5 post-assessment
    // sections? Reads server caps; the fallback (stale-page HTML + new JS)
    // reproduces migrateDocument's OLD 4-condition skip set EXACTLY so the
    // collapse is behaviour-identical either way. Keep in sync with
    // build_task_caps()'s $non_assessment_doc. (v7.19.657)
    function hasAssessmentSections(task) {
        const c = caps(task);
        if (c) return !!c.assessmentSections;
        return !(task === 'mark_scheme' || task === 'mark_scheme_unit'
            || (task && task.indexOf('cw_') === 0)
            || ['conceptual_notes', 'memory_practice', 'exam_question', 'exam_crib', 'mastery_codex', 'foundational_quiz'].includes(task));
    }

    function _deriveLangPaperShape(paperSpec, questionNumber) {
        const sections = paperSpec && paperSpec.sections;
        if (!Array.isArray(sections)) return null;
        const targetId = questionNumber != null ? 'Q' + questionNumber : null;
        for (const sec of sections) {
            for (const q of (sec.questions || [])) {
                if (targetId && q.id !== targetId) continue;
                if (q.type === 'extended_writing' || q.type === 'choice') {
                    return {
                        shape: 'lang-prompt',
                        marks: q.marks,
                        contentMarks: q.content_marks || null,
                        spagMarks: q.spag_marks || null,
                        aos: q.aos || [],
                        extract: null,
                        questionPrefix: null,
                    };
                }
                // Reading sub-question — source-based analysis
                return {
                    shape: 'lang-source-essay',
                    marks: q.marks,
                    aos: q.aos || [],
                    extract: { count: sec.source_count || 1 },
                    questionPrefix: null,
                };
            }
        }
        return null;
    }

    // Helper: get manifest entry for current task (falls back to planning)
    // v7.13.34: CW dynamic lookup — resolves cw_step_X / cw_trial_X to the correct base config
    function getExerciseConfig(task) {
        // v7.17.17: mark_scheme_unit label depends on bridge step — Quiz (step=1) vs FYW (step=2).
        if (task === 'mark_scheme_unit' && EXERCISE_MANIFEST.mark_scheme_unit) {
            const base = EXERCISE_MANIFEST.mark_scheme_unit;
            const step = Number(window.WML?.state?.step ?? 0);
            const label = step === 2 ? 'Forging Your Weapon' : 'Mark Scheme Quiz';
            return { ...base, label, chatHeaderLabel: label };
        }
        if (EXERCISE_MANIFEST[task]) return EXERCISE_MANIFEST[task];
        // v7.14.44: Empty/null task = diagnostic (write-only canvas). Was incorrectly falling
        // through to planning, causing diagnostics to load training env with chat + sidebar.
        if (!task) return EXERCISE_MANIFEST.diagnostic;
        if (task.startsWith('cw_')) {
            const stepDef = getCwStepDef(task);
            if (stepDef) {
                // v7.20.507 (#366): `env` wins over `tier` — a step that declares a diagnostic
                // environment gets it whatever its tier says. Capability first, never a literal.
                const base = stepDef.env === 'diagnostic' ? EXERCISE_MANIFEST.cw_diagnostic
                    // v7.20.577: the polishing env joins the same `env`-wins ladder, so a draft
                    // step opts in by declaring it — no literal step number decides this.
                    : stepDef.env === 'polishing' ? EXERCISE_MANIFEST.cw_polishing
                    : stepDef.tier === 'si' ? EXERCISE_MANIFEST.cw_si
                    : EXERCISE_MANIFEST.cw_workbook;
                const stepKey = stepDef.step || stepDef.id;
                // Scoped to the diagnostic env ONLY — workbook steps keep the fields they have
                // always been given, so this change cannot reach a step it was not written for.
                // v7.20.577: the polishing env has no chat PANEL either — Sophia is reached from a
                // text selection, not a walk — so it takes the same no-walk-sidebar treatment. A
                // sidebar of sub-steps nothing can ever tick is the §4d "screen that lies" shape.
                const noChat = stepDef.env === 'diagnostic' || stepDef.env === 'polishing';
                return {
                    ...base,
                    label: stepDef.label,
                    protocolTask: task,
                    storageSuffix: '_cw_' + stepKey,
                    // A step with no chat has no walk, so a walk sidebar would be a list of
                    // sub-steps nothing can ever tick — the §4d "screen that lies" shape.
                    sidebarSteps: noChat ? null : (CW_SIDEBAR_STEPS[stepKey] || null),
                    chatHeaderLabel: noChat ? null : ('Step ' + stepKey + ': ' + stepDef.label),
                };
            }
        }
        return EXERCISE_MANIFEST.planning;
    }

    // v7.15.78: Modular-by-label suffix resolver. Opt-in per exercise by defining
    // `storageSuffixForPhase(phase)`. Falls back to the static `storageSuffix` for
    // exercises that don't care about phase. First consumer: feedback_discussion.
    // Future exercises (essay_plan, model_answer, …) extend the same pattern.
    function resolveStorageSuffix(task, phase) {
        const cfg = getExerciseConfig(task);
        if (cfg && typeof cfg.storageSuffixForPhase === 'function') {
            return cfg.storageSuffixForPhase(phase);
        }
        return (cfg && cfg.storageSuffix) || '';
    }

    // v7.15.112: Canvas-context suffix resolver. Phase 2 canvas tasks (planning,
    // outlining, response, redraft_assessment, feedback_discussion) all edit the
    // SAME redraft document. Chat history, however, stays per-task so
    // planning's Sophia conversation doesn't bleed into reassessment. Tasks that
    // want this split set `canvasStorageSuffix` (doc-side) alongside
    // `storageSuffix` (chat-side).
    function resolveCanvasSuffix(task, phase) {
        const cfg = getExerciseConfig(task);
        if (cfg && typeof cfg.canvasStorageSuffix === 'string') {
            return cfg.canvasStorageSuffix;
        }
        if (cfg && typeof cfg.canvasStorageSuffixForPhase === 'function') {
            return cfg.canvasStorageSuffixForPhase(phase);
        }
        return resolveStorageSuffix(task, phase);
    }

    // v7.19.955: Canonical canvas-doc identity (text + topic). Tasks whose canvas
    // doc IS another lesson's document (foundational_quiz → the Conceptual Notes
    // doc) remap text/topic here, the same single-layer way resolveCanvasSuffix
    // remaps the suffix. Canvas load/save/signoff call sites must key off this,
    // never raw state.text / state.topicNumber — otherwise the two consumers of
    // the shared doc fork into separate meta keys again. Chat storage, quiz
    // scoring and grade filing deliberately keep the lesson's OWN identity.
    function canvasDocScope() {
        const cfg = getExerciseConfig(state.task);
        const scope = { text: state.text, topic: state.topicNumber };
        if (cfg && cfg.canvasTextSource === 'fqBank' && state.fqBank) {
            // v7.19.971 (Neil ruling, poetry CN one-doc): POETRY FQ lessons land on the
            // per-anthology Conceptual Notes doc — the bank override would fork them onto
            // the legacy shared poetic_forms doc (superseded design). Non-poetry FQs keep
            // the override untouched (Neil scope guard: this restructure is poetry ONLY).
            // v7.19.992: durable check — subject timing must never fork the doc identity.
            // v7.20.48 (Neil staging — FQ→CN seed fork, THE key-mismatch again): the fqBank
            // text-override must be excluded for EVERY CN-anthology family, not just poetry. A
            // nonfiction FQ (fqBank='igcse_nonfiction') was overriding scope.text to the BANK slug,
            // so it wrote ..._igcse_nonfiction_t2_cn while the CN lesson read ..._edexcel_igcse_lang_a_t2_cn
            // (text = the course text) — different key, seed never crossed. v39/40 fixed the roster
            // + picker gates but MISSED this one (the partial-sweep failure §5d warns of). Gate on
            // the ONE canonical CN-family predicate (cnFamily → poetry/nonfiction/prose/literature)
            // so any CN-shared FQ keeps the CN doc's own text; only a genuinely standalone
            // (non-CN) FQ still uses the bank slug. No recursion: cnFamily's deps never call canvasDocScope.
            if (!cnFamily()) scope.text = state.fqBank;
        }
        if (cfg && typeof cfg.canvasTopicPin === 'number') {
            scope.topic = cfg.canvasTopicPin;
        }
        // v7.19.971: per-poem CN lessons (e.g. EDEN ROCK) carry their own bridge topic —
        // pin poetry CN to the Topic-2 slot so every consumer opens the ONE anthology doc.
        // v7.20.19 (A0, lit FQ↔CN parity): the SAME pin for literature CN. Lit FQ pins its
        // doc key to topic 2 (canvasTopicPin), but lit CN rode state.topicNumber — so an
        // odd bridge topic silently forked the FQ doc from the CN doc. All CN is topic 2
        // (CLAUDE.md terminology: literature CN = Topic 2 always); poetry was singled out
        // ONLY for its per-poem bridge topics, and literature has the same "always topic 2"
        // truth — so pin every CN except the not-yet-ported nonfiction/prose families.
        // No-op for existing lit docs (already topic 2 ⇒ zero re-key). Non-recursive gate:
        // isNonfictionSubject/isPoetryAnthologyDoc never call canvasDocScope (cnFamily()
        // WOULD recurse here via isPoetryCnDoc, so it is deliberately NOT used).
        if (state.task === 'conceptual_notes' &&
            (isPoetryAnthologyDoc() || (!isNonfictionSubject() && state.subject !== 'prose_anthology'))) {
            scope.topic = 2;
        }
        return scope;
    }

    // v7.19.992 (doc-fork root fix): THE canonical anthology-poems lookup. Resolves the
    // swmlConfig.anthologyPoems map (built server-side from every populated
    // swml_poems_{board}_{anthology} option — new anthology = author the option, zero
    // code) for a text slug via the same dash-ladder the server uses. Every consumer
    // (doc-identity checks here, the CN template's per-poem groups, poem cards, the CN
    // walk) resolves through THIS — never an ad-hoc map[...] lookup.
    function anthologyPoemsFor(text) {
        const map = (window.swmlConfig && window.swmlConfig.anthologyPoems) || {};
        const board = String(state.board || '').toLowerCase();
        const t = String(text || state.text || '');
        const tries = [t, t.replace(/_poetry$/, ''), t + '_poetry'];
        // v7.20.39 SLUG-DRIFT FIX: nonfiction's anthology is BOARD-determined — the course text
        // (e.g. edexcel_igcse_lang_a) is NOT the anthology slug; the roster lives under
        // NONFICTION_ANTHOLOGY_BY_BOARD[board] (igcse_lang_nonfiction). Add it so a nonfiction doc
        // resolves its roster even when state.text is the generic course text. Poetry unaffected
        // (isNonfictionSubject false → no extra tries).
        try {
            if (isNonfictionSubject() && Array.isArray(NONFICTION_ANTHOLOGY_BY_BOARD[board])) {
                NONFICTION_ANTHOLOGY_BY_BOARD[board].forEach((a) => { if (a && a.id) tries.push(a.id); });
            }
        } catch (_) {}
        for (let i = 0; i < tries.length; i++) {
            const row = map[board + '|' + tries[i]];
            if (Array.isArray(row) && row.length) return row;
        }
        return [];
    }
    // v7.20.40: the anthology SLUG to fetch the roster (with poem_text bodies) from GET /poems.
    // For nonfiction the doc's course text (edexcel_igcse_lang_a) is NOT the anthology slug —
    // the roster lives under NONFICTION_ANTHOLOGY_BY_BOARD[board]. Card fetch + any /poems call
    // must resolve through THIS, not raw state.text, or it fetches the wrong (empty) option.
    function cnRosterSlug(text) {
        const board = String(state.board || '').toLowerCase();
        if (isNonfictionSubject() && Array.isArray(NONFICTION_ANTHOLOGY_BY_BOARD[board]) && NONFICTION_ANTHOLOGY_BY_BOARD[board][0]) {
            return NONFICTION_ANTHOLOGY_BY_BOARD[board][0].id;
        }
        return String(text || state.text || '');
    }
    // v7.19.992: DURABLE poetry-anthology detection for the doc-identity layer.
    // state.subject is mutable boot state — on odd access paths (course-map miss,
    // SPA-nav timing) it can be empty/late, and a false negative silently forks the
    // one-doc onto the legacy poetic_forms key (Neil's "old document, notes gone").
    // The poem list is a durable fact: course text resolves to a populated anthology
    // ⇒ this IS a poetry anthology, whatever state.subject currently says.
    // v7.20.39: exclude nonfiction — anthologyPoemsFor now also resolves the nonfiction roster
    // (board-wise), so "roster populated" alone no longer implies POETRY. isNonfictionSubject
    // guards the durable poetry detection so a nonfiction doc can't be misread as a poetry doc.
    const isPoetryAnthologyDoc = () => isPoetrySubject() || (!isNonfictionSubject() && anthologyPoemsFor().length > 0);

    // Active config based on current task
    // prose_anthology uses Literature CN, not Poetry CN
    const isPoetrySubject = () => ['poetry_anthology', 'unseen_poetry'].includes(state.subject);
    // v7.19.827 ROOT FIX: the shared-lesson shortcode carries subject="language"; the
    // plugin derives the paper form from the text slug (sophicly-writing-mastery-lab.php
    // v7.15.29) — so the frontend receives 'language_p1' / 'language_p2', NOT 'language1'.
    // Exact-match ['language1','language2'] therefore silently no-opped every language
    // gate on shared language lessons (live 2026-07-03: P1 pre-chain served the
    // LITERATURE goal options; the AQA-Language completion detector never applied).
    // Normalise once, here — every consumer reads this ONE helper.
    const isLanguageSubject = () => {
        const s = String(state.subject || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return s === 'language' || s === 'language1' || s === 'language2'
            || /^lang(uage)?(paper)?p?[12]$/.test(s);
    };
    const isNonfictionSubject = () => {
        if (state.subject === 'nonfiction_anthology') return true;
        // Edexcel IGCSE Language Paper 1 = nonfiction anthology. v7.20.39 SLUG-DRIFT FIX: the bridge
        // emits subject 'language' → derived to 'language_p1' (text_to_template_slug), NEVER the
        // legacy 'language1' literal — so the whole nonfiction family silently fell to Literature.
        // Match BOTH forms (P1 only; P2 = poetry+prose fiction, keeps its own family).
        if ((state.subject === 'language_p1' || state.subject === 'language1') && state.board === 'edexcel-igcse') return true;
        return false;
    };
    const isAnthologySubject = () => ['poetry_anthology', 'prose_anthology', 'nonfiction_anthology'].includes(state.subject);
    // v7.19.960: the shared poetry Conceptual-Notes / Foundational-Quiz organiser doc —
    // ONE doc per anthology (forms organiser part + per-poem groups). The collapse gate,
    // the render-time FQ lock, and the CN template branch all key on THIS, never on a
    // literal task name or the legacy `text==='poetic_forms'` scope (the fq_bank override
    // used to produce that scope and no longer does — forms FQ now lands on the anthology
    // doc). Per-poem groups render only when a poem list is present (unseen_poetry has
    // none → forms + General Notes only).
    const isPoetryCnDoc = () => {
        // v7.19.992: keyed on the DURABLE anthology check (poem list resolves for the
        // course text), not just the mutable state.subject — same root fix as
        // canvasDocScope. A subject-timing miss here rendered the OLD 7-section CN
        // template into the unified doc (the stale-shape docs the shape-heal repairs).
        if (isPoetryAnthologyDoc() && (state.task === 'conceptual_notes' || state.task === 'foundational_quiz')) return true;
        try { return canvasDocScope().text === 'poetic_forms'; } catch (_) { return false; }
    };
    // v7.20.15: THE CN family resolver — returns the CN_FAMILIES entry for the current
    // doc/task, or null off a CN surface. Poetry keeps its battle-tested durable check
    // (isPoetryCnDoc — includes the foundational_quiz organiser + poetic_forms scope);
    // the others key on the conceptual_notes task + subject. Order matters: poetry's
    // doc-level check wins over subject (the shared organiser doc law, v992).
    const cnFamily = () => {
        if (isPoetryCnDoc()) return CN_FAMILIES.poetry;
        // v7.20.35 (Part B Phase 2): nonfiction/prose are ANTHOLOGY mold families whose
        // FOUNDATIONAL QUIZ SHARES the one CN doc — so they must resolve for BOTH
        // conceptual_notes AND foundational_quiz, or the FQ build and the CN build would
        // diverge into two different doc shapes for one doc (heal-thrash). This mirrors poetry
        // (isPoetryCnDoc, above, already covers the FQ). SAFE + INERT until moldReady flips:
        // every mold consumer gates on _cnMoldFam (moldReady), and the only raw _cnFam
        // consumers are literature/poetry id-specific (nonfiction/prose are no-ops for them).
        // Literature is roster:single with no shared-FQ organiser → stays CN-task-only below.
        if (state.task === 'conceptual_notes' || state.task === 'foundational_quiz') {
            if (isNonfictionSubject()) return CN_FAMILIES.nonfiction;
            if (state.subject === 'prose_anthology') return CN_FAMILIES.prose;
        }
        if (state.task !== 'conceptual_notes') return null;
        // v7.20.16: NON-anthology poetry (unseen / poetic_forms) is a poetry subject but not
        // the mold — it must NOT fall through to literature (that would mis-gate the lit
        // re-layout heal onto a poetry doc). Return null: it's a CN surface with no mold family.
        if (isPoetrySubject()) return null;
        // NOTE: edexcel-igcse language2 (mixed 5-poem + 5-prose roster) is deliberately
        // unmapped until the Phase 2 wiring designs its per-item family split.
        return CN_FAMILIES.literature;
    };
    function getSteps() {
        if (state.task === 'assessment') return ASSESSMENT_STEPS;
        if (state.task === 'polishing') return POLISHING_STEPS;
        if (state.task === 'exam_question') return EXAM_QUESTION_STEPS;
        if (state.task === 'memory_practice') return MEMORY_PRACTICE_STEPS;
        if (state.task === 'verbal_rehearsal') return QUOTE_ANALYSIS_STEPS;
        if (state.task === 'foundational_quiz') {
            // v7.19.954 (Neil): DYNAMIC — staged banks serve the full part (10/15/18 Q), not
            // always 5. The quiz controller stamps state.fqRoundTotal from the server-picked
            // round and re-renders the sidebar; before that (first paint) the default-5 shape
            // renders. Derived, never hardcoded per bank (the dynamic-universal law).
            const _fqN = parseInt(state.fqRoundTotal, 10) || 0;
            if (_fqN > 0) {
                const steps = [{ step: 1, label: 'Welcome' }];
                // v7.19.965 (Neil — universal): chunk a long question list into collapsible
                // groups of 5 ('Questions 1-5', '6-10', …) exactly like the MSA sidebar, so the
                // completed group collapses and the active one expands (no endless flat list).
                // Same `group:` field the shared _renderSidebarSteps accordion already consumes —
                // one renderer, every quiz. Short rounds (≤5) stay flat. Welcome + Results ungrouped.
                const _group = _fqN > 5;
                for (let i = 1; i <= _fqN; i++) {
                    const st = { step: i + 1, label: 'Q' + i };
                    if (_group) {
                        const lo = Math.floor((i - 1) / 5) * 5 + 1;
                        st.group = 'Questions ' + lo + '-' + Math.min(lo + 4, _fqN);
                    }
                    steps.push(st);
                }
                steps.push({ step: _fqN + 2, label: 'Results' });
                return steps;
            }
            return FOUNDATIONAL_QUIZ_STEPS;
        }
        // v7.18.17: mark_scheme has 14 sidebar steps (Setup + Q1-Q10 + Results +
        // Feedback + Action Plan). Pull straight from the manifest so the
        // universal step-marker handler at wml-assessment.js:2545 validates
        // marker N against the real upper bound (14, not the PLAN_STEPS default 8).
        if (state.task === 'mark_scheme' && EXERCISE_MANIFEST.mark_scheme && EXERCISE_MANIFEST.mark_scheme.sidebarSteps) {
            return EXERCISE_MANIFEST.mark_scheme.sidebarSteps;
        }
        // v7.18.23: mark_scheme_unit dispatches to two flows. Bridge step 1 = Quiz
        // (mark-scheme-quiz/* protocol, 7-step Welcome→Q1-Q5→Results sidebar);
        // bridge step 2 = Forging Your Weapon (forging-your-weapon/* protocol,
        // 5-step Forge→Comparison→Critique→Anatomy→Next Steps sidebar).
        // state.bridgeStep is captured at boot in wml-app.js:83 for this task.
        if (state.task === 'mark_scheme_unit') {
            return state.bridgeStep === 2 ? FORGING_YOUR_WEAPON_STEPS : MARK_SCHEME_QUIZ_STEPS;
        }
        if (state.task === 'conceptual_notes') {
            if (isNonfictionSubject()) return NONFICTION_CN_STEPS;
            // v7.19.992: durable anthology check — the sidebar spine must match the doc
            // (canvasDocScope keys on the same helper; a subject-timing miss forked them).
            return isPoetryAnthologyDoc() ? POETRY_CN_STEPS : CONCEPTUAL_NOTES_STEPS;
        }
        if (state.task === 'essay_plan') return state.planningMode === 'A' ? ESSAY_PLAN_RECALL_STEPS : ESSAY_PLAN_STEPS;
        if (state.task === 'model_answer') return state.planningMode === 'C' ? MODEL_ANSWER_ADVANCED_STEPS : MODEL_ANSWER_STEPS;
        return PLAN_STEPS;
    }
    function getElements() {
        if (state.task === 'assessment') return ASSESSMENT_ELEMENTS;
        if (state.task === 'polishing') return POLISHING_ELEMENTS;
        if (state.task === 'exam_question') return EXAM_QUESTION_ELEMENTS;
        if (state.task === 'conceptual_notes') {
            if (isNonfictionSubject()) return NONFICTION_CN_ELEMENTS;
            // v7.19.992: durable anthology check (matches getSteps + canvasDocScope).
            return isPoetryAnthologyDoc() ? POETRY_CN_ELEMENTS : CONCEPTUAL_NOTES_ELEMENTS;
        }
        if (state.task === 'verbal_rehearsal') return QUOTE_ANALYSIS_ELEMENTS;
        if (state.task === 'model_answer') return MODEL_ANSWER_ELEMENTS;
        return PLAN_ELEMENTS;
    }

    const CONCEPTUAL_NOTES_ELEMENTS = [
        { type: 'cn_section_1', label: 'Protagonist', section: 'notes' },
        { type: 'cn_section_2', label: 'Historical Context', section: 'notes' },
        { type: 'cn_section_3', label: 'Plot Structure', section: 'notes' },
        { type: 'cn_section_4', label: 'Genre & Emotion', section: 'notes' },
        { type: 'cn_section_5', label: 'Themes', section: 'notes' },
        { type: 'cn_section_6', label: 'Author\'s Purpose', section: 'notes' },
        { type: 'cn_section_7', label: 'The Big Message', section: 'notes' },
    ];

    const POETRY_CN_ELEMENTS = [
        { type: 'cn_section_1', label: 'Speaker', section: 'notes' },
        { type: 'cn_section_2', label: 'Historical Context', section: 'notes' },
        { type: 'cn_section_3', label: 'Form', section: 'notes' },
        { type: 'cn_section_4', label: 'Structure & Language', section: 'notes' },
        { type: 'cn_section_5', label: 'Themes', section: 'notes' },
        { type: 'cn_section_6', label: 'Poet\'s Purpose', section: 'notes' },
        { type: 'cn_section_7', label: 'The Big Message', section: 'notes' },
    ];

    const NONFICTION_CN_ELEMENTS = [
        { type: 'nfcn_section_1', label: 'Writer\'s Voice', section: 'notes' },
        { type: 'nfcn_section_2', label: 'Context', section: 'notes' },
        { type: 'nfcn_section_3', label: 'Structure', section: 'notes' },
        { type: 'nfcn_section_4', label: 'Text Type & Form', section: 'notes' },
        { type: 'nfcn_section_5', label: 'Techniques', section: 'notes' },
        { type: 'nfcn_section_6', label: 'Themes & Ideas', section: 'notes' },
        { type: 'nfcn_section_7', label: 'Writer\'s Purpose', section: 'notes' },
        { type: 'nfcn_section_8', label: 'The Big Message', section: 'notes' },
    ];

    const QUOTE_ANALYSIS_ELEMENTS = [
        { type: 'qa_quote', label: 'Random Quote', section: 'focus' },
        { type: 'qa_student_plan', label: 'Your Plan', section: 'student' },
        { type: 'qa_student_paragraph', label: 'Your Paragraph', section: 'student' },
        { type: 'qa_ai_plan', label: 'Sophia Model Plan', section: 'model' },
        { type: 'qa_ai_paragraph', label: 'Sophia Model Paragraph', section: 'model' },
    ];

    const MODEL_ANSWER_ELEMENTS = [
        { type: 'ma_question', label: 'Essay Question', section: 'focus' },
        { type: 'ma_plan', label: 'Essay Plan', section: 'focus' },
        { type: 'ma_body_1', label: 'Body ¶1', section: 'paragraphs' },
        { type: 'ma_body_2', label: 'Body ¶2', section: 'paragraphs' },
        { type: 'ma_body_3', label: 'Body ¶3', section: 'paragraphs' },
        { type: 'ma_introduction', label: 'Introduction', section: 'structure' },
        { type: 'ma_conclusion', label: 'Conclusion', section: 'structure' },
    ];

    const PLAN_ELEMENTS = [
        { type: 'question_text', label: 'Essay Question', section: 'focus' },
        { type: 'goal', label: 'Goal', section: 'focus' },
        { type: 'keywords', label: 'Keywords', section: 'focus' },
        { type: 'anchor_quote_start', label: 'Beginning', section: 'quotes' },
        { type: 'anchor_quote_mid', label: 'Middle', section: 'quotes' },
        { type: 'anchor_quote_end', label: 'End', section: 'quotes' },
        { type: 'body_para_1', label: 'Body ¶1', section: 'paragraphs' },
        { type: 'body_para_2', label: 'Body ¶2', section: 'paragraphs' },
        { type: 'body_para_3', label: 'Body ¶3', section: 'paragraphs' },
        { type: 'introduction', label: 'Introduction', section: 'structure' },
        { type: 'conclusion', label: 'Conclusion', section: 'structure' },
    ];

    // ── Revision Cascade Map ──
    // Each element knows: which step it belongs to, and what depends on it
    const REVISION_MAP = {
        question_text:      { step: 1, label: 'Essay Question', cascades: ['goal', 'keywords', 'anchor_quote_start', 'anchor_quote_mid', 'anchor_quote_end', 'body_para_1', 'body_para_2', 'body_para_3', 'introduction', 'conclusion'] },
        goal:               { step: 1, label: 'Goal', cascades: [] },
        keywords:           { step: 2, label: 'Keywords', cascades: [] },
        anchor_quote_start: { step: 3, label: 'Beginning Quote', cascades: ['body_para_1'] },
        anchor_quote_mid:   { step: 3, label: 'Middle Quote', cascades: ['body_para_2'] },
        anchor_quote_end:   { step: 3, label: 'End Quote', cascades: ['body_para_3'] },
        body_para_1:        { step: 4, label: 'Body ¶1 Plan', cascades: ['introduction', 'conclusion'] },
        body_para_2:        { step: 5, label: 'Body ¶2 Plan', cascades: ['introduction', 'conclusion'] },
        body_para_3:        { step: 6, label: 'Body ¶3 Plan', cascades: ['introduction', 'conclusion'] },
        introduction:       { step: 7, label: 'Introduction', cascades: [] },
        conclusion:         { step: 8, label: 'Conclusion', cascades: [] },
        // Poetry Conceptual Notes — no cascades (sections are independent)
        cn_section_1:       { step: 1, label: 'Speaker Understanding', cascades: [] },
        cn_section_2:       { step: 2, label: 'Historical Context', cascades: [] },
        cn_section_3:       { step: 3, label: 'Form', cascades: [] },
        cn_section_4:       { step: 4, label: 'Structure & Language', cascades: [] },
        cn_section_5:       { step: 5, label: 'Themes', cascades: [] },
        cn_section_6:       { step: 6, label: "Poet's Purpose", cascades: [] },
        cn_section_7:       { step: 7, label: 'The Big Message', cascades: [] },
        // Nonfiction Conceptual Notes
        nfcn_section_1:     { step: 1, label: "Writer's Voice", cascades: [] },
        nfcn_section_2:     { step: 2, label: 'Context', cascades: [] },
        nfcn_section_3:     { step: 3, label: 'Structure', cascades: [] },
        nfcn_section_4:     { step: 4, label: 'Text Type & Form', cascades: [] },
        nfcn_section_5:     { step: 5, label: 'Techniques', cascades: [] },
        nfcn_section_6:     { step: 6, label: 'Themes & Ideas', cascades: [] },
        nfcn_section_7:     { step: 7, label: "Writer's Purpose", cascades: [] },
        nfcn_section_8:     { step: 8, label: 'The Big Message', cascades: [] },
    };

    // ── Utility ──
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }
    function ucfirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : ''; }

    /* ── Branded Confirm Modal ─────────────────────────────────────────────────────────────────
       ⭐ v7.20.508 (Neil, 2026-08-15): "this overlay has still got, like, strokes and the colour's
       not great… we've got an emoji as well instead of an SVG."

       ROOT, and it was a CASCADE COLLISION rather than taste. TWO stylesheets both claimed
       `.swml-confirm-*` — wml-styles.css (this modal) and wml-canvas.css (the Mark-Complete
       "Ready to submit?" modal) — and canvas.css is enqueued SECOND, so it won every shared
       property. The result on screen was one modal wearing two design systems:
         · Keep Chat  → canvas.css `.swml-confirm-cancel`: flex:1, radius 10, a 3D radial-gradient
           face and `0 2px 0 3px rgba(0,0,0,.9), 0 2px 0 4px rgba(255,255,255,.04)` — THE STROKES.
         · Clear Chat → styles.css `.swml-confirm-ok` ONLY, because canvas.css styles
           `.swml-confirm-submit`, a class THIS modal never emits: no flex:1 (hence the narrower
           button), radius 8, padding 8/22, a flat teal gradient with deep-purple text.
       Two radii, two paddings, two widths, two vocabularies, in one 420px box.

       THE FIX IS REUSE, NOT RE-TUNING (root CLAUDE.md §14c GATE 0). WML already ships the BRAND.md
       §8 house button — `.swml-halo-btn` + `.swml-roll`, built by setHaloLabel(): correct in both
       themes, halo + text roll, no stroke, no lift. Sign Off and Add-comment in the very same
       document use it. Both confirm modals now use it too, so the third system is deleted rather
       than restyled.

       Also fixed here, each a defect rather than a preference:
         · cancelText:'' (wml-app.js ~4220) rendered an EMPTY button. It is now omitted.
         · Escape closes. The only dismissal was a backdrop click — no keyboard route out.
         · Initial focus lands on CANCEL for a `danger:true` modal (Delete / Reset / Replace plan /
           Pull it through / Skip for now — five live callers) and on the confirm otherwise. A
           destructive default that is pre-focused is one Return away from firing. */
    let _confirmSeq = 0;
    function showConfirm(message, onConfirm, { confirmText = 'Continue', cancelText = 'Cancel', danger = false, iconName = '' } = {}) {
        const overlay = el('div', { className: 'swml-confirm-overlay' });
        const modal = el('div', { className: 'swml-confirm-modal' + (danger ? ' swml-confirm-danger' : '') });
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');
        const ico = el('div', { className: 'swml-confirm-icon' });
        // `iconName` lets a caller name the ACTION rather than the surface — the clear-chat callers
        // pass 'del' (Neil's bin glyph, 2026-08-15). Default stays chat/alert because showConfirm is
        // generic: a bin on "Resume your session?" would be a lie.
        ico.innerHTML = icon(iconName || (danger ? 'alert' : 'chat'), 30);
        modal.appendChild(ico);
        const msg = el('p', { className: 'swml-confirm-msg', textContent: message });
        msg.id = 'swml-confirm-msg-' + (++_confirmSeq);
        modal.setAttribute('aria-describedby', msg.id);
        modal.appendChild(msg);
        const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey, true); };
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
        const actions = el('div', { className: 'swml-confirm-actions' });
        // An empty cancelText means "there is nothing to cancel" (the info-only callers) — draw no
        // button rather than an unlabelled one.
        if (cancelText) {
            const cancelBtn = el('button', { className: 'swml-confirm-cancel', type: 'button', onClick: close });
            setHaloLabel(cancelBtn, cancelText);
            actions.appendChild(cancelBtn);
        }
        const okBtn = el('button', { className: 'swml-halo-btn swml-confirm-ok' + (danger ? ' danger' : ''), type: 'button',
            onClick: () => { close(); onConfirm(); } });
        setHaloLabel(okBtn, confirmText);
        actions.appendChild(okBtn);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onKey, true);
        // Scroll isolation (root CLAUDE.md §OVERLAY / MODAL SCROLL ISOLATION). Layer 1 is CSS on
        // the card (overflow-y:auto + overscroll-behavior:contain); layer 2 is here — swallow wheel
        // and touchmove that START ON THE BACKDROP, so a scroll gesture over the dimmed area cannot
        // move the document behind. Inside the card the events pass through, so the long
        // mid-round-quiz copy still scrolls. Layer 3 (locking the host's overflow) is not needed:
        // the backdrop is `inset: 0`, so there is no un-covered region left to catch a gesture.
        const eatScroll = (e) => { if (!modal.contains(e.target)) e.preventDefault(); };
        overlay.addEventListener('wheel', eatScroll, { passive: false });
        overlay.addEventListener('touchmove', eatScroll, { passive: false });
        /* ⭐⭐ v7.20.509 (Neil): "it needs to be centered in the middle of the viewport rather than
           the blurred overlay, because otherwise it looks weird."

           He is describing a CONTAINING-BLOCK capture, and the file already documents the class one
           screen up (wml-canvas.css ~L140): "LD's will-change:transform on .spl-entry creates a
           containing block that breaks position:fixed on detached panels". A `position: fixed`
           element resolves against the VIEWPORT only while no ancestor carries transform / filter /
           backdrop-filter / perspective / contain / will-change; the first one that does becomes its
           viewport. Mounted inside #swml-canvas-overlay, this modal inherited whichever LD ancestor
           still does that, so `inset: 0` meant "the canvas pane" — the region right of the sidebar
           and below the header. Centred in that pane, it sits right and low of true centre, which is
           exactly the "positioned strangely" he saw.

           FIX = remove every one of those ancestors from the chain: mount on <body>. Nothing about
           the modal needed the canvas host — the old comment cited stacking, and z-index 100000
           clears the canvas in both of its modes (9985 windowed, 99999 fullscreen). This also makes
           it cause-independent: we do not have to identify WHICH LD ancestor is transformed, and a
           new one appearing later cannot recapture us.
           ⚠️ Body-mounting drops the [data-swml-theme] on #swml-canvas-overlay — which is why the
           light rules are keyed on the attribute rather than a class, and why body carries it too
           (wml-assessment.js ~28049). Same reason .swml-outline-panel mirrors the theme when it
           detaches to body. */
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            const first = (danger && cancelText) ? modal.querySelector('.swml-confirm-cancel') : okBtn;
            first?.focus();
            _assertConfirmIsViewportCentred(overlay);
        });
    }
    /* Root §19 (measure, never guess): body-mount is only correct while <body>/<html> themselves are
       untransformed. Rather than assume that for ever, this ASSERTS it and, on a miss, NAMES the
       ancestor responsible — so a recurrence arrives as a console line with a selector in it instead
       of as another of Neil's test cycles. Costs one getBoundingClientRect per modal. */
    function _assertConfirmIsViewportCentred(overlay) {
        try {
            const r = overlay.getBoundingClientRect();
            const off = Math.max(Math.abs(r.top), Math.abs(r.left),
                                 Math.abs(r.width - window.innerWidth));
            if (off <= 1) return;
            const TRAP = (cs) => (cs.transform && cs.transform !== 'none')
                || (cs.filter && cs.filter !== 'none')
                || (cs.backdropFilter && cs.backdropFilter !== 'none')
                || (cs.perspective && cs.perspective !== 'none')
                || /paint|layout|strict|content/.test(cs.contain || '')
                || /transform|filter|perspective/.test(cs.willChange || '');
            let culprit = null;
            for (let n = overlay.parentElement; n && n !== document.documentElement; n = n.parentElement) {
                if (TRAP(getComputedStyle(n))) { culprit = n; break; }
            }
            const where = culprit
                ? (culprit.tagName.toLowerCase() + (culprit.id ? '#' + culprit.id : '')
                   + (culprit.className && typeof culprit.className === 'string'
                      ? '.' + culprit.className.trim().split(/\s+/).join('.') : ''))
                : '(none found — check html/body)';
            console.warn('WML v7.20.509: the confirm overlay is NOT viewport-aligned (off by '
                + Math.round(off) + 'px). A transformed/contained ancestor captured position:fixed: '
                + where);
            (window.__wmlConfirmGeom = window.__wmlConfirmGeom || []).push({ off, where, rect: r });
        } catch (_) {}
    }

    // ── Toast Notifications ──
    let toastCount = 0;
    const MAX_TOASTS_PER_SESSION = 2;
    function showToast(message, duration = 8000, skipLimit = false) {
        if (!skipLimit && toastCount >= MAX_TOASTS_PER_SESSION) return;
        if (!skipLimit) toastCount++;
        const toast = el('div', { className: 'swml-toast' });
        const msgSpan = el('span', { className: 'swml-toast-msg' });
        msgSpan.innerHTML = message;
        toast.appendChild(msgSpan);
        const close = el('button', { className: 'swml-toast-close', textContent: '✕',
            onClick: () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); } });
        toast.appendChild(close);
        // v7.19.854: centre EXACTLY like the dynamic island — SAME technique, SAME
        // containing block (Neil: the toast drifted further right with each px-math
        // "fix"; the v829/v839 attempts measured viewport rects but positioned a
        // fixed-position element, so the two coordinate spaces never agreed). The
        // island is `position:absolute; left:50%; translateX(-50%)` INSIDE the doc
        // pane (.swml-canvas-editor, position:relative). The toast now does the
        // identical thing: appended to the SAME pane with an absolute variant class —
        // no measured pixels anywhere. Outside the canvas it stays viewport-fixed.
        try {
            const pane = document.querySelector('.swml-canvas-editor');
            if (pane && pane.offsetParent !== null) {
                toast.classList.add('swml-toast--pane');
                pane.appendChild(toast);
            } else {
                ($('#swml-root') || document.body).appendChild(toast);
            }
        } catch (_) {
            ($('#swml-root') || document.body).appendChild(toast);
        }
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    // Trigger toast reminders after specific section completions
    function maybeTriggerToast() {
        if (state.task !== 'conceptual_notes') return;
        const completedSections = getElements().filter(e => e.section === 'notes' && state.plan[e.type]).length;
        // Show after 2nd and 5th section completions
        if (completedSections === 2 || completedSections === 5) {
            showToast('📋 <strong>Tip:</strong> Your notes are saved to your dashboard automatically. Copy any ideas to your workbook at any time!');
        }
    }

    // ── Theme ──
    function getSystemTheme() {
        return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    function getTheme() {
        // v7.20.13: ONE theme store. The site's `theme-preference` (sessionStorage, then the
        // durable cookie the toggle writes) is the source of truth. WML's old PRIVATE key
        // (swml-theme-manual) made the observer below FIGHT the site toggle: a stale key +
        // any DOM mutation → applyTheme → themeToggle.setTheme → the whole SITE flipped back
        // seconds after the user chose a theme (Neil, LearnDash, 2026-07-10). Private key is
        // now a last-resort legacy fallback only.
        try {
            const shared = sessionStorage.getItem('theme-preference');
            if (shared === 'dark' || shared === 'light') return shared;
            const ck = document.cookie.match(/(?:^|;\s*)theme-preference=(dark|light)/);
            if (ck) return ck[1];
        } catch(e) {}
        try {
            const manual = localStorage.getItem('swml-theme-manual') || sessionStorage.getItem('swml-theme-manual');
            if (manual === 'dark' || manual === 'light') return manual;
        } catch(e) {}
        return getSystemTheme();
    }
    /* ⭐⭐ v7.20.429 (Neil, #264): "when you switch the themes, it actually blinks."
       ROOT CAUSE, and it is structural rather than cosmetic: a theme swap is NOT one write. It
       lands on FOUR different elements in sequence — document.body, #swml-root, the overlay's
       dataset, and the `.swml-canvas-light` class on the canvas — and WML's CSS keys off several
       of them (`[data-swml-theme="light"] X` AND `.swml-canvas-light X`). Between the first write
       and the last, some rules have flipped and others have not, so elements briefly resolve to a
       MIXED state. Every one of them also carries a `transition` on background/colour/box-shadow,
       so the browser politely ANIMATES its way through that mixed state. That animated pass is
       the blink.
       You cannot fix this by reordering the writes — they cannot be simultaneous, and the
       transitions would still animate the (correct) end-to-end change. The fix is to make the swap
       INSTANT: kill transitions for the duration, then restore them.
       ONE implementation, three callers — core's applyTheme plus the two `syncCanvasTheme`s in
       wml-assessment.js (the LD-driven path, which is the one live in the canvas). Exported so a
       fourth theme path cannot quietly reintroduce the blink by hand-rolling its own version. */
    function beginThemeSwap() {
        try {
            const b = document.body;
            if (!b) return;
            b.classList.add('swml-theme-switching');
            if (beginThemeSwap._t) cancelAnimationFrame(beginThemeSwap._t);
            // TWO frames: one for the class to take effect, one for the paint to land with
            // transitions already off. Removing on a timer instead would race a slow frame.
            beginThemeSwap._t = requestAnimationFrame(() => {
                beginThemeSwap._t = requestAnimationFrame(() => {
                    b.classList.remove('swml-theme-switching');
                    beginThemeSwap._t = null;
                });
            });
        } catch (e) {}
    }

    function applyTheme(theme) {
        // `typeof` guard, not a bare call: theme-writer-harness evaluates this function in
        // ISOLATION to prove there is exactly one theme writer, so a sibling-scope reference
        // throws there while being perfectly in scope in the real bundle. Same defensive shape as
        // the two syncCanvasTheme call sites in wml-assessment.js — one pattern, three callers.
        if (typeof beginThemeSwap === 'function') beginThemeSwap();
        // Apply to both body and #swml-root to ensure CSS selectors match
        document.body.setAttribute('data-swml-theme', theme);
        const root = $('#swml-root');
        if (root) root.setAttribute('data-swml-theme', theme);
        // v7.14.21: Also update canvas overlay and canvas element (embedded + standalone)
        const overlay = document.getElementById('swml-canvas-overlay');
        if (overlay) {
            overlay.dataset.swmlTheme = theme;
            const canvas = overlay.querySelector('.swml-canvas');
            if (canvas) canvas.classList.toggle('swml-canvas-light', theme === 'light');
        }
        // Update Jhey toggle if it exists (aria-pressed="true" = light mode)
        const toggle = $('#swml-theme-toggle');
        if (toggle) {
            const isDark = theme === 'dark';
            toggle.setAttribute('aria-pressed', isDark ? 'false' : 'true');
            toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        // Sync with the site-wide toggle ONLY when the page actually disagrees (v7.20.13).
        // Unconditional setTheme was the write-back edge of the revert loop: the observer
        // fires on every DOM mutation, and each call re-stamped the whole site's theme.
        // WML FOLLOWS the page; it only drives it from its own toggle (hidden when embedded).
        if (window.themeToggle && document.documentElement.getAttribute('data-theme') !== theme) {
            window.themeToggle.setTheme(theme);
        }
    }
    function toggleTheme() {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        // v7.20.13: persist to the SHARED store (session + the durable cookie the site toggle
        // uses) and retire the private key so a stale copy can never fight the site again.
        try {
            sessionStorage.setItem('theme-preference', newTheme);
            document.cookie = 'theme-preference=' + newTheme + ';path=/;max-age=31536000;SameSite=Lax';
        } catch(e) {}
        try { localStorage.removeItem('swml-theme-manual'); sessionStorage.removeItem('swml-theme-manual'); } catch(e) {}
        applyTheme(newTheme);
    }
    // Apply theme on load (respects system preference)
    applyTheme(getTheme());
    // Observe for #swml-root being added to DOM and reapply theme
    const themeObserver = new MutationObserver(() => {
        const root = document.getElementById('swml-root');
        if (root) {
            // Always sync — ensures system preference is applied after #swml-root renders
            const currentTheme = root.getAttribute('data-swml-theme');
            const correctTheme = getTheme();
            if (currentTheme !== correctTheme) {
                applyTheme(correctTheme);
            }
        }
    });
    themeObserver.observe(document.body, { childList: true, subtree: true });

    // Listen for system preference changes (only applies when the user has no saved choice)
    window.matchMedia?.('(prefers-color-scheme: light)').addEventListener('change', () => {
        try {
            // v7.20.13: check the SHARED store (session/cookie) — a saved site preference wins over the OS.
            const saved = sessionStorage.getItem('theme-preference')
                || (document.cookie.match(/(?:^|;\s*)theme-preference=(dark|light)/) || [])[1]
                || localStorage.getItem('swml-theme-manual');
            if (!saved) {
                applyTheme(getSystemTheme());
            }
        } catch(e) {
            applyTheme(getSystemTheme());
        }
    });

    /* ═══════════════════════════════════════════════════════════════════════════════════════
       ⭐⭐ v7.20.434 — THE SELECTION-TOOLBAR BLINK INSTRUMENT (#267). THIS IS NOT A FIX.
       ═══════════════════════════════════════════════════════════════════════════════════════
       FOUR fixes (.429 .431 .432 .433) each named a plausible root cause, each shipped with a
       confident commit message, and each STILL BLINKED. Root CLAUDE.md §19 came out of that:
       for a bug whose cause has not been OBSERVED, the next change is an INSTRUMENT, not an EDIT.
       This is that instrument. It measures; it changes no behaviour; it comes out once the
       culprit is named.

       ⭐ IT IS BUILT TO FALSIFY, NOT TO CONFIRM. Every attempt so far ASSUMED the node is
       destroyed and rebuilt. Nothing has ever proven that. A repaint, an opacity/visibility
       flip, an animation replay or an ancestor re-render would look IDENTICAL to Neil. So there
       are two independent probes and they disagree with each other on purpose:
         (A) a MutationObserver on the whole body — fires on a REAL detach/attach regardless of
             which code path did it, so it does not depend on my having found every call site.
             ⭐ IF A TOGGLE PRODUCES NO DOM-REMOVED RECORD, ALL FOUR FIXES WERE AIMED AT A
             PHANTOM and the answer is in styles or an ancestor re-render.
         (B) a per-frame computed-style watch armed by the theme-toggle click — catches the
             blink that happens WITHOUT the node ever leaving the DOM.
       The hand-placed `what:'create'|'destroy'` stamps at the builders/teardowns then say WHICH
       code path did it. Two probes, three possible verdicts, no room for a fifth guess.

       USE: select text so the toolbar appears → toggle the theme ONCE → `__swmlSelDiagDump()`.
       ═══════════════════════════════════════════════════════════════════════════════════════ */
    window.__swmlSelDiag = window.__swmlSelDiag || [];
    window.__swmlSelDiagLog = function (what, where, why) {
        try {
            window.__swmlSelDiag.push({
                t: Math.round(performance.now()),
                what: what,
                where: where,
                why: why == null ? '' : String(why),
                live: document.querySelectorAll('.swml-selection-toolbar').length,
                theme: document.body?.getAttribute('data-swml-theme') || document.documentElement?.getAttribute('data-theme') || '?'
            });
            if (window.__swmlSelDiag.length > 300) window.__swmlSelDiag.shift();
        } catch (_) {}
    };
    window.__swmlSelDiagDump = function () {
        const rows = window.__swmlSelDiag || [];
        if (!rows.length) { console.log('[selDiag] EMPTY — nothing was recorded. Did the toolbar appear before you toggled?'); return ''; }
        const t0 = rows[0].t;
        const text = 'WML selDiag v' + (window.SWML_VERSION || '?') + ' — ' + rows.length + ' records\n'
            + rows.map(r => (String(r.t - t0).padStart(6) + 'ms  ' + r.what.padEnd(14) + '  live=' + r.live
                + '  ' + r.theme.padEnd(5) + '  ' + r.where + (r.why ? '  :: ' + r.why : ''))).join('\n');
        console.log(text);
        try { navigator.clipboard.writeText(text); console.log('[selDiag] copied to clipboard.'); } catch (_) {}
        return text;
    };
    (function _swmlSelDiagProbes() {
        if (window.__swmlSelDiagArmed) return;
        window.__swmlSelDiagArmed = true;
        const isTb = (n) => n && n.nodeType === 1
            && (n.classList?.contains('swml-selection-toolbar') || !!n.querySelector?.('.swml-selection-toolbar'));
        const tag = (el) => {
            if (!el || el.nodeType !== 1) return String(el && el.nodeName || '?');
            return (el.nodeName.toLowerCase() + (el.id ? '#' + el.id : '')
                + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')).slice(0, 90);
        };
        // ── PROBE A: did the node ACTUALLY leave the DOM? Independent of our own call sites. ──
        const armObserver = () => {
            if (!document.body) { setTimeout(armObserver, 50); return; }
            new MutationObserver((recs) => {
                for (const r of recs) {
                    for (const n of r.removedNodes) if (isTb(n)) window.__swmlSelDiagLog('DOM-REMOVED', 'MutationObserver', 'parent=' + tag(r.target));
                    for (const n of r.addedNodes)   if (isTb(n)) window.__swmlSelDiagLog('DOM-ADDED',   'MutationObserver', 'parent=' + tag(r.target));
                }
            }).observe(document.body, { childList: true, subtree: true });
        };
        armObserver();
        // ── PROBE B: a blink with NO detach. Armed by the toggle, samples every frame for 800ms. ──
        const WATCH = ['opacity', 'visibility', 'display', 'animationName', 'transform', 'filter', 'backgroundColor'];
        const snap = (el) => { const cs = getComputedStyle(el); const o = { connected: el.isConnected }; for (const p of WATCH) o[p] = cs[p]; return o; };
        const watchToolbar = () => {
            const tb = document.querySelector('.swml-selection-toolbar');
            if (!tb) { window.__swmlSelDiagLog('WATCH-SKIP', 'themeToggle', 'no toolbar mounted at toggle time'); return; }
            let prev = snap(tb);
            window.__swmlSelDiagLog('WATCH-START', 'themeToggle', WATCH.map(p => p + '=' + prev[p]).join(' '));
            const t0 = performance.now();
            const step = () => {
                const cur = tb.isConnected ? snap(tb) : { connected: false };
                const diff = Object.keys(cur).filter(k => cur[k] !== prev[k]).map(k => k + ': ' + prev[k] + ' → ' + cur[k]);
                if (diff.length) { window.__swmlSelDiagLog('STYLE-CHANGE', 'themeToggle', diff.join(' | ')); prev = cur; }
                if (performance.now() - t0 < 800) requestAnimationFrame(step);
                else window.__swmlSelDiagLog('WATCH-END', 'themeToggle', 'connected=' + tb.isConnected + ' live=' + document.querySelectorAll('.swml-selection-toolbar').length);
            };
            requestAnimationFrame(step);
        };
        // Capture phase so these land BEFORE any handler that might tear the toolbar down.
        document.addEventListener('mousedown', (e) => {
            if (e.target?.closest?.('.theme-toggle')) { window.__swmlSelDiagLog('THEME-MOUSEDOWN', 'themeToggle', 'live=' + document.querySelectorAll('.swml-selection-toolbar').length); watchToolbar(); }
        }, true);
        document.addEventListener('click', (e) => {
            if (e.target?.closest?.('.theme-toggle')) window.__swmlSelDiagLog('THEME-CLICK', 'themeToggle', '');
        }, true);
    })();

    // Shared Jhey moon/sun toggle factory
    const JHEY_TOGGLE_HTML ='<div class="theme-toggle__socket"><div class="theme-toggle__socket-shadow"></div></div><div class="theme-toggle__face"><div class="theme-toggle__face-shadow"></div><div class="theme-toggle__face-glowdrop"></div><div class="theme-toggle__face-plate"></div><div class="theme-toggle__face-shine"><div class="theme-toggle__face-shine-shadow"></div></div><div class="theme-toggle__face-glows"><div></div></div><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__glow"><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke-width="0" class="theme-toggle__glow-path"></path></svg><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__trail-holder"><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke="#2CC6FE" stroke-linecap="round" stroke-dasharray="7 80" stroke-dashoffset="40" class="theme-toggle__trail"></path></svg><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="theme-toggle__main"><g><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" fill="black" stroke="black" stroke-width="2" class="theme-toggle__outline"></path></g><path d="M9.8815 1.36438L9.88141 1.36429C9.70639 1.18942 9.48342 1.07041 9.24073 1.02235C8.99803 0.974286 8.74653 0.999323 8.51808 1.09429L8.51753 1.09452C4.54484 2.75146 1.75 6.6732 1.75 11.25C1.75 17.3262 6.67489 22.25 12.75 22.25C14.9217 22.2501 17.0448 21.6075 18.852 20.4032C20.6591 19.1989 22.0695 17.4868 22.9055 15.4825L22.9058 15.4818C23.0007 15.2532 23.0256 15.0015 22.9774 14.7587C22.9291 14.5159 22.8099 14.2929 22.6348 14.118C22.4597 13.9431 22.2366 13.8241 21.9937 13.7761C21.7509 13.7281 21.4993 13.7533 21.2708 13.8484L21.2707 13.8485C20.2346 14.2801 19.1231 14.5016 18.0007 14.5H18C15.7457 14.5 13.5837 13.6045 11.9896 12.0104C10.3955 10.4163 9.5 8.25433 9.5 5.99999L9.5 5.99927C9.49838 4.8769 9.71983 3.76541 10.1515 2.72938C10.2468 2.50072 10.2721 2.24888 10.224 2.00584C10.1759 1.76281 10.0567 1.53954 9.8815 1.36438Z" stroke="#2CC6FE" stroke-linecap="round" class="theme-toggle__trail"></path><g class="theme-toggle__inner"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" class="theme-toggle__inner-face"></path><path mask="url(#theme-toggle-inner-fade)" fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" class="theme-toggle__inner-bg"></path><g filter="url(#swml-theme-toggle-inner-shadow)" mask="url(#swml-theme-toggle-fade)" class="theme-toggle__inner-shadow"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.528 1.71799C9.63312 1.82308 9.70465 1.95704 9.73349 2.10286C9.76234 2.24868 9.7472 2.39979 9.69 2.53699C9.23282 3.6342 8.99828 4.81134 9 5.99999C9 8.38694 9.94821 10.6761 11.636 12.3639C13.3239 14.0518 15.6131 15 18 15C19.1886 15.0017 20.3658 14.7672 21.463 14.31C21.6001 14.2529 21.7511 14.2378 21.8968 14.2666C22.0425 14.2954 22.1763 14.3668 22.2814 14.4717C22.3865 14.5767 22.458 14.7105 22.487 14.8562C22.5159 15.0018 22.501 15.1528 22.444 15.29C21.646 17.2032 20.2997 18.8376 18.5747 19.9871C16.8496 21.1367 14.823 21.7501 12.75 21.75C6.951 21.75 2.25 17.05 2.25 11.25C2.25 6.88199 4.917 3.13799 8.71 1.55599C8.84707 1.49901 8.99797 1.48399 9.14359 1.51282C9.28921 1.54166 9.42299 1.61307 9.528 1.71799Z" fill="hsl(0 0% 10% / .01)"></path></g></g><defs><filter id="swml-theme-toggle-inner-shadow" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dx="0.4" dy="0.5"></feOffset><feGaussianBlur stdDeviation="0.1"></feGaussianBlur><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend mode="normal" in2="shape" result="e1"></feBlend><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dx="0.3" dy="-0.5"></feOffset><feGaussianBlur stdDeviation="0.1"></feGaussianBlur><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend mode="normal" in2="e1" result="e2"></feBlend></filter><linearGradient id="swml-theme-toggle-fade-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(45)" gradientUnits="userSpaceOnUse"><stop offset="0.45" stop-color="white" stop-opacity="0"></stop><stop offset="0.75" stop-color="white" stop-opacity="0.75"></stop><stop offset="0.95" stop-color="white" stop-opacity="0.5"></stop><stop offset="1" stop-color="white" stop-opacity="0.35"></stop></linearGradient><linearGradient id="swml-theme-toggle-inner-fade-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(45)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="transparent" stop-opacity="0"></stop><stop offset="0.75" stop-color="white" stop-opacity="1"></stop></linearGradient><mask id="swml-theme-toggle-fade"><rect width="100%" height="100%" fill="url(#swml-theme-toggle-fade-gradient)"></rect></mask><mask id="swml-theme-toggle-inner-fade"><rect width="100%" height="100%" fill="url(#swml-theme-toggle-inner-fade-gradient)"></rect></mask></defs></svg></div><span class="theme-toggle__sr-only">Toggle dark mode</span>';
    function createThemeToggleBtn(id, onToggle) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle theme-toggle--wml';
        btn.setAttribute('aria-pressed', getTheme() === 'light' ? 'true' : 'false');
        btn.setAttribute('aria-label', getTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        if (id) btn.id = id;
        btn.innerHTML = JHEY_TOGGLE_HTML;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (onToggle) { onToggle(); }
            else { toggleTheme(); }
            const isDark = getTheme() === 'dark';
            btn.setAttribute('aria-pressed', isDark ? 'false' : 'true');
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        });
        return btn;
    }

    // Store referrer for Resume Course
    state.referrer = document.referrer || '';

    // ── SVG Icons (minimalist, uses currentColor for theming) ──
    // Input area (18px)
    // v7.20.57 (Neil): morph-ready mic — visually identical to the old icon at rest,
    // but the capsule (rect) and details (waves/cradle/stand) carry classes so CSS can
    // MORPH mic → pulsing record dot when the button gains .swml-mic-active /
    // .swml-mic-live (the state classes every mic toggle already sets). One icon, no
    // innerHTML swapping — the swap is what made the old transition a hard cut.
    // Morph CSS lives beside the mic-button styles in wml-styles.css.
    const SVG_MIC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect class="swml-mic-capsule" x="9" y="2" width="6" height="12" rx="3"/><path class="swml-mic-detail" d="M5 3V5M1 2V6M19 3V5M23 2V6" stroke-linecap="round" stroke-linejoin="round"/><path class="swml-mic-detail" d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke-linecap="round" stroke-linejoin="round"/><path class="swml-mic-detail" d="M12 18V22M12 22H9M12 22H15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    // Legacy stop square — kept for any stray consumer; live surfaces now morph SVG_MIC in place.
    const SVG_MIC_STOP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
    const SVG_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    const SVG_ATTACH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
    // Small inline (16px)
    const SVG_COPY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667h-8.666a2.667 2.667 0 0 1-2.667-2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1-1.012-1.737v-10c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>';
    const SVG_COPY_ASSESS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-3.333 -4c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3zm2 11h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2"/></svg>';
    const SENDER_HTML = '<img src="https://sophicly.b-cdn.net/Images/Writing%20Mastery%20Lab%20Phoenix%20Logo.svg" alt="" style="width:16px;height:16px;margin-right:5px">Sophia';
    // Selection toolbar icons (14px)
    const SVG_SEL_REPLY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 20L1 12L11 4V9C16.5228 9 21 13.4772 21 19C21 19.2729 20.9891 19.5433 20.9676 19.8107C19.4605 16.9502 16.458 15 13 15H11V20Z"/></svg>';
    const SVG_SEL_INSERT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-4.333 4a1 1 0 0 0 -1 1v2h-2a1 1 0 0 0 -.993 .883l-.007 .117a1 1 0 0 0 1 1h2v2a1 1 0 0 0 .883 .993l.117 .007a1 1 0 0 0 1 -1v-2h2a1 1 0 0 0 .993 -.883l.007 -.117a1 1 0 0 0 -1 -1h-2v-2a1 1 0 0 0 -.883 -.993zm1 -8c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3z"/></svg>';
    const SVG_SEL_COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667h-8.666a2.667 2.667 0 0 1-2.667-2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1-1.012-1.737v-10c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>';
    const SVG_SEL_NOTE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 1V4H1V6H4V9H6V6H9V4H6V1H4ZM3 20.0066V11H5V19H13V14C13 13.45 13.45 13 14 13L19 12.999V5H11V3H20.0066C20.5552 3 21 3.45576 21 4.00247V15L15 20.996L4.00221 21C3.4487 21 3 20.5551 3 20.0066ZM18.171 14.999L15 15V18.169L18.171 14.999Z"/></svg>';

    // ── Question Selection + Utility Icons ──
    const SVG_ICON_GENERATE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 3 3 1.5-3 1.5L12 12l-1.5-3-3-1.5 3-1.5z"/><path d="M19 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M6 17l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>';
    const SVG_ICON_HAND_SELECT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.571L6.177 12.835C5.535 12.224 4.513 12.271 3.93 12.938C3.402 13.541 3.417 14.445 3.965 15.03L9.907 21.368C10.286 21.771 10.813 22 11.366 22H16C18.4 22 20 20 20 18V9.429"/><path d="M17 10V9.429C17 7.143 20 7.143 20 9.429"/><path d="M14 10V8.286C14 6 17 6 17 8.286V9.429"/><path d="M11 10V7.5C11 5.214 14 5.214 14 7.5V8.286"/><path d="M8 14.571V3.5C8 2.672 8.672 2 9.5 2C10.328 2 11 2.671 11 3.499V7.5"/></svg>';
    const SVG_ICON_PASTE = SVG_SEL_INSERT;
    const SVG_ICON_BULB = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"/><path d="M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M4.893 4.893a1 1 0 0 1 1.32 -.083l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 0 -1.414z"/><path d="M17.693 4.893a1 1 0 0 1 1.497 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7z"/><path d="M14 18a1 1 0 0 1 1 1a3 3 0 0 1 -6 0a1 1 0 0 1 .883 -.993l.117 -.007h4z"/><path d="M12 6a6 6 0 0 1 3.6 10.8a1 1 0 0 1 -.471 .192l-.129 .008h-6a1 1 0 0 1 -.6 -.2a6 6 0 0 1 3.6 -10.8z"/></svg>';
    const SVG_ICON_SAVE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3.707 10.293a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292a1 1 0 1 0 -1.414 1.414l2 2a1 1 0 0 0 1.414 0l4 -4a1 1 0 0 0 0 -1.414m-.707 -9.294l4 4.001h-4z"/></svg>';

    /** Map quick action label text to SVG icon */
    function getQuickActionIcon(label) {
        const l = label.toLowerCase();
        if (l.includes('generate') || l.includes('random question')) return SVG_ICON_GENERATE;
        if (l.includes('saved question') || l.includes('already saved')) return SVG_ICON_HAND_SELECT;
        if (l.includes('paste') || l.includes('type or paste')) return SVG_ICON_PASTE;
        // Save/confirm actions
        if (l.includes('save') || l.includes('yes, save') || l.includes('yes save')) return SVG_ICON_SAVE;
        // Edit/change/adjust actions
        if (l.includes('change') || l.includes('adjust') || l.includes('revise') || l.includes('tweak')) return SVG_ICON_EDIT;
        // Continue/proceed actions
        if (l.includes('carry on') || l.includes('continue') || l.includes('proceed') || l.includes('let\'s go') || l.includes('ready') || l.includes('yes,') || l.includes('yes!') || /^yes\b/.test(l)) return SVG_ICON_FORWARD;
        // Explain/help actions
        if (l.includes('explain') || l.includes('help') || l.includes('not sure') || l.includes('confused')) return SVG_ICON_HELP;
        return '';
    }
    const SVG_ICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4"/><path d="M13.5 6.5l4 4"/></svg>';
    const SVG_ICON_FORWARD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
    const SVG_ICON_HELP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    const SVG_NOTES_PANEL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14L16 14"/><path d="M8 10L10 10"/><path d="M8 18L12 18"/><path d="M10 3H6C4.89543 3 4 3.89543 4 5V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V5C20 3.89543 19.1046 3 18 3H14.5M10 3V1M10 3V5"/></svg>';
    const SVG_SOCRATIC = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.14466 2 1.00003 5.83274 1.00003 11C1.00003 13.2801 2.02853 15.3265 3.66073 16.8769C3.1358 18.379 2.16871 19.4171 1.29292 20.2929C1.00692 20.5789 0.921369 21.009 1.07615 21.3827C1.23093 21.7564 1.59557 22 2.00003 22C3.61633 22 4.89236 21.7348 6.02384 21.2248C6.97278 20.797 7.77846 20.215 8.56263 19.5533C9.64621 19.8437 10.8021 20 12 20C17.8554 20 23 16.1673 23 11C23 5.83274 17.8554 2 12 2ZM8.00003 7C7.44774 7 7.00003 7.44772 7.00003 8C7.00003 8.55228 7.44774 9 8.00003 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H8.00003ZM8.00003 10C7.44774 10 7.00003 10.4477 7.00003 11C7.00003 11.5523 7.44774 12 8.00003 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H8.00003ZM8.00003 13C7.44774 13 7.00003 13.4477 7.00003 14C7.00003 14.5523 7.44774 15 8.00003 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13H8.00003Z"/></svg>';
    const SVG_SAVE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3H17L20.707 6.707C20.895 6.895 21 7.149 21 7.414V20C21 20.552 20.552 21 20 21H4C3.448 21 3 20.552 3 20V4C3 3.448 3.448 3 4 3ZM12 18C13.657 18 15 16.657 15 15C15 13.343 13.657 12 12 12C10.343 12 9 13.343 9 15C9 16.657 10.343 18 12 18ZM5 5V9H15V5H5Z"/></svg>';
    const SVG_TIMER = '<svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L15 2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 10L12 14" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const SVG_BRAIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11 2.53513C10.4117 2.19479 9.72857 2 9 2 6.79086 2 5 3.79086 5 6V7.77422C4.14895 8.11644 3.45143 8.64785 2.94126 9.34933 2.29239 10.2415 2 11.3347 2 12.5 2 14.0614 2.79529 15.4356 4 16.242V17.5C4 19.9853 6.01472 22 8.5 22 9.42507 22 10.285 21.7209 11 21.2422V17.5C11 16.167 10.67 15.3147 10.1402 14.7408 9.59743 14.1528 8.71622 13.7165 7.3356 13.4864L7.6644 11.5136C8.96602 11.7305 10.1058 12.1373 11 12.8271V2.53513ZM13 2.53513V12.8271C13.8942 12.1373 15.034 11.7305 16.3356 11.5136L16.6644 13.4864C15.2838 13.7165 14.4026 14.1528 13.8598 14.7408 13.33 15.3147 13 16.167 13 17.5V21.2422C13.715 21.7209 14.5749 22 15.5 22 17.9853 22 20 19.9853 20 17.5V16.242C21.2047 15.4356 22 14.0614 22 12.5 22 11.3347 21.7076 10.2415 21.0587 9.34933 20.5486 8.64785 19.8511 8.11644 19 7.77422V6C19 3.79086 17.2091 2 15 2 14.2714 2 13.5883 2.19479 13 2.53513Z"/></svg>';
    const SVG_KEYBOARD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 5a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-16a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3zm-14 8a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m12 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m-7.998 0a1 1 0 0 0 -.004 2l4 .01a1 1 0 0 0 .005 -2zm-4.002 -4a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1"/></svg>';
    const SVG_AI_GENERATE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.7134 9.12811L19.4668 9.69379C19.2864 10.1079 18.7136 10.1079 18.5331 9.69379L18.2866 9.12811C17.8471 8.11947 17.0555 7.31641 16.0677 6.87708L15.308 6.53922C14.8973 6.35653 14.8973 5.75881 15.308 5.57612L16.0252 5.25714C17.0384 4.80651 17.8442 3.97373 18.2761 2.93083L18.5293 2.31953C18.7058 1.89349 19.2942 1.89349 19.4706 2.31953L19.7238 2.93083C20.1558 3.97373 20.9616 4.80651 21.9748 5.25714L22.6919 5.57612C23.1027 5.75881 23.1027 6.35653 22.6919 6.53922L21.9323 6.87708C20.9445 7.31641 20.1529 8.11947 19.7134 9.12811ZM6 5C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V12H22V17C22 19.2091 20.2091 21 18 21H6C3.79086 21 2 19.2091 2 17V7C2 4.79086 3.79086 3 6 3H13V5H6Z"/></svg>';
    const SVG_LIST_DETAILS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 5h8"/><path d="M13 9h5"/><path d="M13 15h8"/><path d="M13 19h5"/><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/></svg>';
    const SVG_QA_FILL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 18H18.2372L20 19.3851V9H21C21.5523 9 22 9.44772 22 10V23.5L17.5455 20H9C8.44772 20 8 19.5523 8 19V18ZM5.45455 16L1 19.5V4C1 3.44772 1.44772 3 2 3H17C17.5523 3 18 3.44772 18 4V16H5.45455Z"/></svg>';
    const SVG_NOTES = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17 2V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"/></svg>';
    const SVG_MIC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18V22M12 22H9M12 22H15" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const SVG_SPARKLES = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.89 3.706c.336-1.093 1.883-1.093 2.22 0l1.553 5.049c.092.3.32.538.614.645l4.065 1.478c1.047.381 1.047 1.862 0 2.243l-4.065 1.478a1.09 1.09 0 0 0-.614.645l-1.554 5.05c-.336 1.092-1.883 1.092-2.219 0l-1.554-5.05a1.09 1.09 0 0 0-.614-.645l-4.064-1.478c-1.048-.381-1.048-1.862 0-2.243l4.064-1.478a1.09 1.09 0 0 0 .614-.645l1.554-5.05Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.801 3.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.801 17.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/></svg>';
    // Task card icons (28px)
    const SVG_PHASE_WRITE = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4"/><path d="M13.5 6.5l4 4"/></svg>';
    const SVG_PHASE_REDRAFT = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"/></svg>';
    const SVG_PHASE_LOCK = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    const SVG_PHASE_TIMER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l2 2"/><path d="M19 3l-2 2"/><path d="M12 3v2"/></svg>';
    const SVG_PHASE_CUSTOM = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    const SVG_PHASE_ZEN = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
    // Diagnostic guidance icons (16px, stroke=currentColor for theming)
    const SVG_GUIDE_LOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M8 11m0 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1z"/><path d="M10 11v-2a2 2 0 1 1 4 0v2"/></svg>';
    const SVG_GUIDE_BRAIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.535C10.412 2.195 9.729 2 9 2 6.791 2 5 3.791 5 6v1.774c-.851.342-1.549.874-2.059 1.575C2.292 10.242 2 11.335 2 12.5c0 1.561.795 2.936 2 3.742V17.5C4 19.985 6.015 22 8.5 22c.925 0 1.785-.279 2.5-.758V17.5c0-1.333-.33-2.185-.86-2.759-.543-.588-1.424-1.024-2.804-1.255l.329-1.972c1.302.217 2.441.624 3.335 1.314V2.535zM13 2.535v10.292c.894-.69 2.034-1.097 3.336-1.314l.329 1.972c-1.381.231-2.262.668-2.804 1.255-.53.574-.86 1.427-.86 2.76v3.742c.715.479 1.575.758 2.5.758C17.985 22 20 19.985 20 17.5v-1.258c1.205-.806 2-2.181 2-3.742 0-1.165-.292-2.258-.941-3.151-.51-.701-1.208-1.233-2.059-1.575V6c0-2.209-1.791-4-4-4-.729 0-1.412.195-2 .535z"/></svg>';
    const SVG_GUIDE_TARGET = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M12 7a5 5 0 1 0 5 5"/><path d="M13 3.055a9 9 0 1 0 7.941 7.945"/><path d="M15 6v3h3l3-3h-3v-3z"/><path d="M15 9l-3 3"/></svg>';
    const SVG_GUIDE_STOPWATCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><line x1="9.14" y1="1.5" x2="14.86" y2="1.5"/><circle cx="12" cy="13.91" r="8.59"/><path d="M15.37,10.53a4.77,4.77,0,0,1-6.74,6.75"/><line x1="12" y1="5.32" x2="12" y2="1.5"/><circle cx="12" cy="13.91" r="0.95"/><line x1="12" y1="8.18" x2="12" y2="12.95"/><line x1="4.36" y1="5.32" x2="6.27" y2="7.23"/><line x1="19.64" y1="5.32" x2="17.73" y2="7.23"/></svg>';
    const SVG_GUIDE_ARM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C9.239 12 7 9.761 7 7s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm6 5v5h-2v-5c0-4.451 2.644-8.285 6.448-10.016l.828 1.821C20.164 10.221 18 13.358 18 17zM8 17v5H6v-5c0-3.642-2.163-6.779-5.274-8.195l.828-1.821C5.356 8.715 8 12.549 8 17z"/></svg>';
    const SVG_GUIDE_WRITING = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2 2-2z"/><path d="M16 7h4"/><path d="M18 19h-13a2 2 0 1 1 0-4h4a2 2 0 1 0 0-4h-3"/></svg>';
    const SVG_GUIDE_GRAPH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><rect x="2.45" y="16.77" width="3.82" height="5.73"/><rect x="17.73" y="9.14" width="3.82" height="13.36"/><rect x="10.09" y="12.95" width="3.82" height="9.55"/><line x1="0.55" y1="22.5" x2="23.45" y2="22.5"/><polyline points="15.82 1.5 20.59 1.5 20.59 6.27"/><path d="M2.45,10.09a23,23,0,0,0,16.3-6.75L20.59,1.5"/></svg>';
    const SVG_DISCUSS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>';
    const SVG_MARK_SCHEME = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12l2 2l4-4"/></svg>';
    const SVG_MODEL_ANSWER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    const SVG_PLAN = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.615 20h-2.615a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/><path d="M14 19l2 2l4-4"/><path d="M9 8h4"/><path d="M9 12h2"/></svg>';
    const SVG_ASSESS = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M9 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M15 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M4 20h14"/></svg>';
    const SVG_OUTLINE_STEP = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h8"/><path d="M9 9h5"/><path d="M9 15h8"/><path d="M9 19h5"/><path d="M5 5l0 .01"/><path d="M5 9l0 .01"/><path d="M5 15l0 .01"/><path d="M5 19l0 .01"/></svg>';
    const SVG_POLISH = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.89 3.706c.336-1.093 1.883-1.093 2.22 0l1.553 5.049c.092.3.32.538.614.645l4.065 1.478c1.047.381 1.047 1.862 0 2.243l-4.065 1.478a1.09 1.09 0 0 0-.614.645l-1.554 5.05c-.336 1.092-1.883 1.092-2.219 0l-1.554-5.05a1.09 1.09 0 0 0-.614-.645l-4.064-1.478c-1.048-.381-1.048-1.862 0-2.243l4.064-1.478a1.09 1.09 0 0 0 .614-.645l1.554-5.05Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.801 3.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.801 17.434c.384-1.152 2.014-1.152 2.398 0a.53.53 0 0 0 .367.368c1.152.384 1.152 2.013 0 2.397a.53.53 0 0 0-.367.367c-.384 1.152-2.014 1.152-2.398 0a.53.53 0 0 0-.367-.367c-1.152-.384-1.152-2.013 0-2.397a.53.53 0 0 0 .367-.368Z"/></svg>';
    // Sidebar & nav (16px)
    const SVG_VIDEO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.6V20.4C21 20.731 20.731 21 20.4 21H7.6C7.269 21 7 20.731 7 20.4V7.6C7 7.269 7.269 7 7.6 7H20.4C20.731 7 21 7.269 21 7.6Z"/><path d="M18 4H4.6C4.269 4 4 4.269 4 4.6V18"/><path d="M12.909 11.545C12.509 11.305 12 11.593 12 12.06V15.94C12 16.407 12.509 16.695 12.909 16.455L16.143 14.515C16.531 14.282 16.531 13.718 16.143 13.486L12.909 11.545Z"/></svg>';
    const SVG_LIBRARY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91" stroke-miterlimit="10"><line x1="0.55" y1="22.5" x2="23.45" y2="22.5"/><rect x="2.45" y="1.5" width="4.77" height="21.05"/><rect x="7.23" y="7.23" width="3.82" height="15.27"/><rect x="16.77" y="2.45" width="4.77" height="20.05"/><rect x="11.05" y="4.36" width="5.73" height="18.14"/><line x1="7.23" y1="17.73" x2="11.05" y2="17.73"/><line x1="12.95" y1="18.68" x2="14.86" y2="18.68"/><line x1="2.45" y1="18.68" x2="7.23" y2="18.68"/><line x1="2.45" y1="5.32" x2="7.23" y2="5.32"/></svg>';
    const SVG_FOLDER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19l2.757-7.351a1 1 0 0 1 .936-.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1-1.964 1.625h-14.026a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v2"/></svg>';
    const SVG_DASHBOARD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.024 22C16.277 22 17.352 21.934 18.251 21.735C19.161 21.532 19.949 21.18 20.565 20.565C21.18 19.949 21.532 19.161 21.735 18.251C21.934 17.352 22 16.277 22 15.024V12C22 10.895 21.105 10 20 10H12C10.895 10 10 10.895 10 12V20C10 21.105 10.895 22 12 22H15.024Z"/><path d="M2 15.024C2 16.277 2.066 17.352 2.266 18.251C2.468 19.161 2.82 19.949 3.435 20.565C4.051 21.18 4.839 21.532 5.749 21.735C5.836 21.754 5.924 21.772 6.012 21.789C7.096 21.999 8 21.081 8 19.976V12C8 10.895 7.105 10 6 10H4C2.895 10 2 10.895 2 12V15.024Z"/><path d="M8.976 2C7.723 2 6.648 2.066 5.749 2.266C4.839 2.468 4.051 2.82 3.435 3.435C2.82 4.051 2.468 4.839 2.266 5.749C2.249 5.824 2.233 5.899 2.219 5.974C2.004 7.073 2.939 8 4.058 8H19.976C21.081 8 21.999 7.096 21.789 6.012C21.772 5.924 21.754 5.836 21.735 5.749C21.532 4.839 21.18 4.051 20.565 3.435C19.949 2.82 19.161 2.468 18.251 2.266C17.352 2.066 16.277 2 15.024 2H8.976Z"/></svg>';
    const SVG_BACK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4l4-4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>';
    const SVG_RESTART = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM16.82 17.076C18.163 15.801 19 13.998 19 12C19 8.134 15.866 5 12 5C8.134 5 5 8.134 5 12C5 15.866 8.134 19 12 19C13.061 19 14.067 18.764 14.968 18.342L13.993 16.587C13.382 16.853 12.708 17 12 17C9.239 17 7 14.761 7 12C7 9.239 9.239 7 12 7C14.761 7 17 9.239 17 12H14L16.82 17.076Z"/></svg>';
    // Phase icons (20px)
    const SVG_WRITING = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19c3.333-2 5-4 5-6c0-3-1-3-2-3s-2.032 1.085-2 3c.034 2.048 1.658 2.877 2.5 4c1.5 2 2.5 2.5 3.5 1c.667-1 1.167-1.833 1.5-2.5c1 2.333 2.333 3.5 4 3.5h2.5"/><path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2l2-2z"/><path d="M16 7h4"/></svg>';
    const SVG_REDRAFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91"><path stroke-miterlimit="10" d="M12 1.5A10.52 10.52 0 1 1 3.39 18.07"/><line stroke-linecap="round" stroke-linejoin="round" x1="1.48" y1="12.02" x2="1.48" y2="12.02"/><path stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 4.13" d="M2.28 8A10.51 10.51 0 0 1 10 1.7"/><line stroke-linecap="round" stroke-linejoin="round" x1="12" y1="1.5" x2="12" y2="1.5"/><polyline stroke-miterlimit="10" points="3.39 23.5 3.39 17.76 9.13 17.76"/></svg>';

    // v7.20.363: `icon` prepends a glyph WITHOUT disturbing the label. This exists so a chip can
    // gain an icon while `textContent` still returns exactly the label — which matters because
    // chip labels are read as data in several places (tap handlers, quick-action detection, the
    // walk sims and four harnesses). Writing the glyph into innerHTML instead would empty
    // textContent and silently change what all of those see. An <svg> contributes no text, so
    // `btn.textContent` is unchanged by construction.
    function el(tag, attrs = {}, children = []) {
        const e = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'className') e.className = v;
            else if (k === 'innerHTML') e.innerHTML = v;
            else if (k === 'textContent') e.textContent = v;
            else if (k === 'icon') continue;   // applied after the loop, so it survives textContent
            else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
            else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
            else e.setAttribute(k, v);
        }
        if (attrs.icon) e.insertAdjacentHTML('afterbegin', attrs.icon);
        for (const c of [].concat(children)) {
            if (typeof c === 'string') e.appendChild(document.createTextNode(c));
            else if (c) e.appendChild(c);
        }
        // ⭐ v7.20.404 (#177): the trailing "→" on a chip becomes Neil's arrow — HERE, because
        // `el()` is the ONE seam every chip in the plugin passes through. There are five separate
        // `chipBar` implementations (the SINGLETONS problem, FIXLIST #38); doing it at the builders
        // would mean five edits and a sixth walk shipping without it.
        if (tag === 'button') arrowizeEl(e);
        return e;
    }
    // Swap arrow CHARACTERS for the glyph, in place, without changing what the element READS AS.
    // ⚠️ THE LITERAL SURVIVES, and that is the whole design (#89): chip labels like "Continue →" are
    // matched as STRINGS by tap handlers, walk-sim-lib and four harnesses, and several call sites
    // compare `btn.textContent`. So the character is kept in a visually-hidden span and only the
    // VISIBLE mark is the SVG — `textContent` still returns "Continue →" exactly as before.
    // Idempotent: an element already carrying .swml-arrow-glyph is skipped, so a re-render or a
    // second pass cannot stack two arrows.
    function arrowizeEl(root) {
        if (!root || root.querySelector && root.querySelector('.swml-arrow-glyph')) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const hits = [];
        let n;
        while ((n = walker.nextNode())) { if (/[→←➜]/.test(n.nodeValue)) hits.push(n); }
        hits.forEach(function (node) {
            const frag = document.createDocumentFragment();
            const parts = node.nodeValue.split(/([→←➜])/);
            parts.forEach(function (p) {
                if (p === '→' || p === '←' || p === '➜') {
                    const keep = document.createElement('span');
                    keep.className = 'swml-arrow-lit';          // visually hidden; keeps textContent honest
                    keep.textContent = p;
                    frag.appendChild(keep);
                    const g = document.createElement('span');
                    g.className = 'swml-arrow-glyph';
                    g.setAttribute('aria-hidden', 'true');
                    g.innerHTML = arrowIcon(p === '←' ? 'left' : 'right', 14);
                    frag.appendChild(g);
                } else if (p) {
                    frag.appendChild(document.createTextNode(p));
                }
            });
            node.parentNode.replaceChild(frag, node);
        });
    }

    // ── v7.20.85 NONCE SELF-HEAL (root cause of the "couldn't load the round" /
    // universal-403 storm, Neil 2026-07-14): WP REST nonces die after ~24h, and the
    // Focus SPA never full-reloads — a long-lived tab outlives its nonce and EVERY
    // REST call 403s (quiz/start, canvas save/load, chat, grades). Fix at the ONE
    // seam all WML requests share: on a 403, fetch a fresh nonce via core's
    // `rest-nonce` ajax action (what wp-api-fetch's middleware uses), update the
    // shared `headers` object + `config.nonce` IN PLACE (every consumer reads
    // them by reference), retry ONCE. A second 403 = genuinely logged out — fail
    // loud, existing error paths surface it. Single-flight so a 403 storm
    // triggers one refresh, not fifty.
    let _nonceRefreshing = null;
    function _refreshRestNonce() {
        if (_nonceRefreshing) return _nonceRefreshing;
        _nonceRefreshing = (async () => {
            try {
                const origin = new URL(config.restUrl, window.location.href).origin;
                const r = await fetch(origin + '/wp-admin/admin-ajax.php?action=rest-nonce', { credentials: 'same-origin' });
                const t = (await r.text()).trim();
                if (r.ok && t && t !== '0' && t !== '-1' && t.length <= 20) {
                    config.nonce = t;
                    headers['X-WP-Nonce'] = t;
                    console.log('WML auth: REST nonce refreshed (stale-tab self-heal)');
                    return true;
                }
            } catch (e) { console.warn('WML auth: nonce refresh failed', e && e.message); }
            return false;
        })();
        return _nonceRefreshing.finally(() => { _nonceRefreshing = null; });
    }
    async function _fetchAuth(url, opts) {
        let r = await fetch(url, opts);
        if (r.status === 403) {
            const ok = await _refreshRestNonce();
            if (ok) r = await fetch(url, opts); // headers object already carries the fresh nonce
            if (r.status === 403) console.warn('WML auth: still 403 after nonce refresh — session expired, full reload/login needed:', url);
        }
        return r;
    }
    async function apiPost(url, body) {
        try {
            const r = await _fetchAuth(url, { method: 'POST', headers, body: JSON.stringify(body) });
            const text = await r.text();
            return text ? JSON.parse(text) : { success: false, message: 'Empty server response' };
        } catch (e) { console.error('WML apiPost error:', e); return { success: false, message: e.message }; }
    }
    async function apiGet(url) {
        try {
            const r = await _fetchAuth(url, { headers });
            const text = await r.text();
            return text ? JSON.parse(text) : { success: false, message: 'Empty server response' };
        } catch (e) { console.error('WML apiGet error:', e); return { success: false, message: e.message }; }
    }

    // ── Creative Writing Project API (v7.13.30) ──
    // v7.17.36: every POST body carries lesson_url so student-data's derivation
    // listener can stamp the LD topic permalink on session_records rows.
    const _lu = () => (config && config.lessonUrl) || '';
    // v7.19.179: broadcast cw_saved so dashboard MyWork refetches in real time.
    // Wraps a Promise — fires AFTER success so failed saves don't ghost-refresh.
    const _cwBroadcast = (p, payload) => {
        try {
            if (typeof BroadcastChannel === 'function') {
                const ch = new BroadcastChannel('sophicly_cw');
                p.then(() => {
                    try { ch.postMessage({ type: 'cw_saved', ts: Date.now(), ...payload }); } catch (e) {}
                    try { ch.close(); } catch (e) {}
                }).catch(() => { try { ch.close(); } catch (e) {} });
            }
        } catch (e) { /* ignore */ }
        return p;
    };
    // ── v7.20.301: review-mode target for CW project READS ──
    // WML's review convention is that a READ carries the target explicitly — see
    // API.reviewCanvas / API.reviewChat, which both pass student_id=state.reviewStudentId.
    // The v7.15.91 review-guarded fetch wrapper (above) deliberately covers non-GET only, so
    // these four GETs were invisible to review mode and there was no review-aware CW read path
    // at all.
    // The bug that proved it: reviewing Adam Qureshi (1387), cwProject.list() returned
    // ABDULLAH's projects, which then matched HIS OWN `swml_cw_active_project` sessionStorage
    // pin, so the canvas opened "Exam Prep 2026" — a project the student has never seen. The
    // document then keyed review-target-user + reviewer's-project = a key belonging to nobody
    // and rendered blank, reading as "the student's work has disappeared". It had not: Adam's
    // 8/15 Step 1 answers were safe the whole time, in `Adams project`.
    const _cwReviewTarget = () => {
        const t  = parseInt((config && (config.targetUserId || config.reviewStudentId)) || 0, 10);
        const me = parseInt((config && config.userId) || 0, 10);
        return (t && t !== me) ? t : 0;
    };
    const _cwRq = (url) => {
        const t = _cwReviewTarget();
        if (!t) return url;
        return url + (url.indexOf('?') === -1 ? '?' : '&') + 'student_id=' + t;
    };
    // A reviewer READS a student's project and must never write to one. These writes all key
    // off get_current_user_id() server-side, so an unguarded write while reviewing lands
    // silently in the REVIEWER's own project — inventing rows in their work, not the student's.
    // Refuse at the boundary rather than relying on every call site to remember.
    const _cwReadOnly = (what) => {
        if (!_cwReviewTarget()) return null;
        console.warn('WML CW: refusing to ' + what + ' — review mode is read-only.');
        return Promise.resolve({ success: false, review_readonly: true, message: 'Review mode is read-only.' });
    };
    const cwProject = {
        /** True while viewing another user's work. Callers gate creation/naming UI on this. */
        isReviewing() { return !!_cwReviewTarget(); },
        /**
         * v7.20.301: the "which project am I in" sessionStorage pin, namespaced per viewed user.
         * It used to be ONE key for every context, so the pin leaked BOTH ways: the reviewer's
         * own pin selected a project while reviewing a student (the reported bug), and reviewing
         * a student then overwrote the reviewer's pin so their OWN next CW lesson opened a
         * project id that is not theirs. Namespacing makes the two contexts unable to collide;
         * the student's own key is unchanged, so no live pin is invalidated by this ship.
         */
        pinKey() {
            const t = _cwReviewTarget();
            return 'swml_cw_active_project' + (t ? '__review_' + t : '');
        },
        /** Create a new project. Returns { success, project }. */
        create(name, courseContext = 'standalone') {
            const blocked = _cwReadOnly('create a project');
            if (blocked) { return blocked; }
            return _cwBroadcast(
                apiPost(API.cwProject, { action: 'create', name, course_context: courseContext, lesson_url: _lu() })
                    .then((res) => {
                        // v7.20.309: the new-story gate refused. Surface it HERE, once, rather than
                        // at each of the four places a story can be started — a refusal the student
                        // cannot see is indistinguishable from the button being broken, and gating
                        // per call site is how one of them silently misses it.
                        if (res && res.new_story_gate && res.message) {
                            try { showToast('✍️ <strong>One story at a time</strong><br>' + res.message, 14000, true); }
                            catch (e) { console.warn('WML CW new-story gate:', res.message); }
                        }
                        return res;
                    }),
                { event: 'project_create' }
            );
        },
        /** Update project metadata (name, status). */
        update(projectId, updates = {}) {
            return _cwReadOnly('rename or restatus a project') || _cwBroadcast(
                apiPost(API.cwProject, { action: 'update', project_id: projectId, ...updates, lesson_url: _lu() }),
                { event: 'project_update', project_id: projectId }
            );
        },
        /** List all projects. Returns { success, projects: [] }. */
        list() {
            return apiGet(_cwRq(API.cwProject));
        },
        /** Load full project data. Returns { success, project }. */
        load(projectId) {
            return apiGet(_cwRq(API.cwProject + '?project_id=' + encodeURIComponent(projectId)));
        },
        /** Save a single artifact (e.g. 'writer_profile', 'logline'). */
        saveArtifact(projectId, key, value) {
            return _cwReadOnly('save an artifact') || _cwBroadcast(
                apiPost(API.cwArtifact, { project_id: projectId, key, value, lesson_url: _lu() }),
                { event: 'artifact_save', project_id: projectId, key }
            );
        },
        /** Load a single artifact. Returns { success, key, value }. */
        loadArtifact(projectId, key) {
            return apiGet(_cwRq(API.cwArtifact + '?project_id=' + encodeURIComponent(projectId) + '&key=' + encodeURIComponent(key)));
        },
        /** Save a trial assessment result. Pass trialNumber (1..6, e.g. state.cwTrial) so
         *  completion keys per-project — see load_cw_project -> trial_completion (v7.19.536). */
        saveTrial(projectId, trialData, trialNumber) {
            return _cwReadOnly('save a trial') || _cwBroadcast(
                apiPost(API.cwTrial, { project_id: projectId, trial: trialData, trial_number: trialNumber || null, lesson_url: _lu() }),
                { event: 'trial_save', project_id: projectId }
            );
        },
        /** Mark a step as complete. */
        completeStep(projectId, step, complete = true) {
            return _cwReadOnly('mark a step complete') || _cwBroadcast(
                apiPost(API.cwStep, { project_id: projectId, step, complete, lesson_url: _lu() }),
                { event: 'step_complete', project_id: projectId, step }
            );
        },
        /** v7.13.60: Load plot structure template HTML from server. */
        loadPlotTemplate(structureSlug = 'heros-journey') {
            return apiGet(API.cwPlotTemplate + '?structure=' + encodeURIComponent(structureSlug));
        },
    };

    // ── 3D Push Button builder (v7.12.32) ──
    // Creates a Sophicly-branded 3D animated button with per-character text animation.
    // text1: initial text, text2: text after click, onClick: handler
    function build3DButton(text1, text2, onClick) {
        const btn = el('button', { className: 'swml-3d-btn' });
        // Background shadow layer
        btn.appendChild(el('div', { className: 'swml-3d-bg' }));
        // Splash SVG
        btn.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" height="208" width="342" class="swml-3d-splash"><path stroke-linecap="round" stroke-width="3" d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"/><path stroke-linecap="round" stroke-width="3" d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"/></svg>';
        // Wrap
        const wrap = el('div', { className: 'swml-3d-wrap' });
        wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height="42" width="221" class="swml-3d-path"><path stroke-linecap="round" stroke-width="3" d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"/></svg>';
        wrap.appendChild(el('div', { className: 'swml-3d-outline' }));
        // Content
        const content = el('div', { className: 'swml-3d-content' });
        // State 1 text (character-by-character)
        const chars1 = el('span', { className: 'swml-3d-char swml-3d-s1' });
        let charIdx = 1;
        for (const ch of text1) {
            if (ch === ' ') { charIdx++; const sp = el('span', { 'data-label': '\u00A0' }); sp.textContent = '\u00A0'; sp.style.setProperty('--i', charIdx); sp.style.marginLeft = '4px'; chars1.appendChild(sp); }
            else { const sp = el('span', { 'data-label': ch }); sp.textContent = ch; sp.style.setProperty('--i', charIdx++); chars1.appendChild(sp); }
        }
        content.appendChild(chars1);
        // Arrow icon
        const icon = el('div', { className: 'swml-3d-icon' });
        icon.appendChild(el('div'));
        content.appendChild(icon);
        // State 2 text
        const chars2 = el('span', { className: 'swml-3d-char swml-3d-s2' });
        charIdx = 1;
        for (const ch of text2) {
            if (ch === ' ') { charIdx++; const sp = el('span', { 'data-label': '\u00A0' }); sp.textContent = '\u00A0'; sp.style.setProperty('--i', charIdx); sp.style.marginLeft = '4px'; chars2.appendChild(sp); }
            else { const sp = el('span', { 'data-label': ch }); sp.textContent = ch; sp.style.setProperty('--i', charIdx++); chars2.appendChild(sp); }
        }
        content.appendChild(chars2);
        wrap.appendChild(content);
        btn.appendChild(wrap);
        btn.addEventListener('click', onClick);
        return btn;
    }

    // ── Shared Typing Indicator (v7.12.35 — refactoring Step 3) ──
    // Parameterized functions usable by both main chat and canvas chat.
    function createTypingBubble(container) {
        if (!container) return;
        const bubble = el('div', { className: 'swml-bubble ai swml-typing-bubble' });
        const content = el('div', { className: 'swml-bubble-content' });
        content.appendChild(el('div', { className: 'swml-bubble-sender', innerHTML: SENDER_HTML }));
        const dots = el('div', { className: 'swml-typing' });
        for (let i = 0; i < 3; i++) dots.appendChild(el('div', { className: 'swml-typing-dot' }));
        content.appendChild(dots);
        bubble.appendChild(content);
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }
    function removeTypingBubble(container) {
        if (!container) return;
        const bubble = container.querySelector('.swml-typing-bubble');
        if (bubble) bubble.remove();
    }

    // ── Vertical Stepper Component ──────────────────────────────────────────
    // Reusable stepped timeline for phase/sub-step navigation.
    // steps: [{ id, icon, title, desc, status, statusLabel, onClick }]
    // status: 'complete' | 'active' | 'not_started' | 'locked'
    function buildStepper(steps) {
        const container = el('div', { className: 'swml-stepper' });
        const SVG_STEP_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        const SVG_STEP_LOCK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

        steps.forEach((step, i) => {
            const isLast = i === steps.length - 1;
            const stateClass = step.status === 'complete' ? 'is-complete'
                : step.status === 'active' ? 'is-active'
                : step.status === 'locked' ? 'is-locked' : 'is-not-started';

            // Rail: circle + connector line
            const circleContent = step.status === 'complete' ? SVG_STEP_CHECK
                : step.status === 'locked' ? SVG_STEP_LOCK
                : String(i + 1);
            const circle = el('div', {
                className: 'swml-stepper-circle',
                ...(step.status === 'complete' || step.status === 'locked' ? { innerHTML: circleContent } : { textContent: circleContent })
            });
            const line = !isLast ? el('div', { className: 'swml-stepper-line' }) : null;
            const rail = el('div', { className: 'swml-stepper-rail' }, [circle, line].filter(Boolean));

            // Card (reuses glassmorphic card style)
            // v7.19.952: 🔒 → tabler lock SVG (Neil). Custom statusLabel stays textContent;
            // the defaults are code-owned strings, safe as innerHTML.
            const statusTag = el('span', {
                className: 'swml-status-tag ' + (step.status === 'complete' ? 'complete' : step.status === 'active' ? 'in-progress' : step.status === 'locked' ? 'not-started' : 'not-started'),
                ...(step.statusLabel
                    ? { textContent: step.statusLabel }
                    : { innerHTML: (step.status === 'complete' ? '✓ Complete' : step.status === 'active' ? '◐ In progress' : step.status === 'locked' ? lockIconSVG(10) + ' Locked' : '○ Not started') })
            });
            if (step.statusTagId) statusTag.id = step.statusTagId;

            const card = el('button', {
                className: 'swml-stepper-card',
                onClick: (step.status === 'locked' && !window.WML?._unlockAll) ? () => {} : (step.onClick || (() => {}))
            }, [
                el('span', { className: 'swml-path-icon', innerHTML: step.icon }),
                el('span', { className: 'swml-path-title', textContent: step.title }),
                el('span', { className: 'swml-path-desc', textContent: step.desc }),
                statusTag
            ]);

            const row = el('div', { className: `swml-stepper-step ${stateClass}` }, [rail, card]);
            container.appendChild(row);
        });

        return container;
    }

    // ── Phase Sub-Step Data Model ───────────────────────────────────────────
    // Returns the sub-steps array for a given phase with status + onClick wired
    function getPhaseSubSteps(phase, statuses, baseType) {
        if (phase === 'initial') {
            return [
                {
                    id: 'diagnostic',
                    icon: SVG_PHASE_WRITE,
                    title: 'Write Essay',
                    desc: 'Write your essay independently — no AI, no notes.',
                    status: statuses.diagnostic || 'not_started',
                    statusLabel: statuses.diagnosticLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = ''; // Clear — NOT assessment mode
                        // Route directly — no intermediary screen (cross-module: late-bound via WML)
                        if (statuses.diagnostic === 'active') {
                            state.canvasTimer = 0;
                            window.WML.renderCanvasWorkspace();
                        } else if (statuses.diagnostic === 'complete') {
                            state.canvasTimer = 0;
                            window.WML.renderCanvasWorkspace();
                        } else {
                            window.WML.renderDiagnosticTimerSelect();
                        }
                    }
                },
                {
                    id: 'assessment',
                    icon: SVG_ASSESS,
                    title: 'Get Assessed',
                    desc: 'Submit your essay for detailed marking and feedback.',
                    status: statuses.assessment || (statuses.diagnostic === 'complete' ? 'not_started' : 'locked'),
                    statusLabel: statuses.assessmentLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = 'assessment';
                        state.canvasTimer = 0;
                        state.step = 0; // Reset so initAssessmentState can restore from chat history (v7.12.32)
                        window.WML.renderCanvasWorkspace();
                    }
                },
                // Discuss Feedback is Phase 1 — comes after assessment (v7.12.76)
                {
                    id: 'feedback_discussion',
                    icon: SVG_DISCUSS,
                    title: 'Discuss Your Feedback',
                    desc: 'Watch the feedback videos and discuss your results with your tutor.',
                    status: statuses.feedback_discussion || (statuses.assessment === 'complete' ? 'not_started' : 'locked'),
                    statusLabel: statuses.feedbackDiscussionLabel || null,
                    onClick: () => {
                        state.draftType = baseType === 'diagnostic' ? 'diagnostic' : 'development';
                        state.phase = 'initial';
                        state.task = 'feedback_discussion';
                        state.canvasTimer = 0;
                        window.WML.renderCanvasWorkspace();
                    }
                }
            ];
        }
        // Phase 2 — Redraft: Mark Scheme → Model Answer → Planning → Outlining → Polishing → Reassessment
        const msDone = statuses.mark_scheme === 'complete' || statuses.mark_scheme === 'skipped';
        const maDone = statuses.model_answer === 'complete' || statuses.model_answer === 'skipped';
        return [
            {
                id: 'mark_scheme',
                icon: SVG_MARK_SCHEME,
                title: 'Mark Scheme Study',
                desc: 'Learn how your essay is marked — understand the assessment objectives.',
                status: statuses.mark_scheme || 'not_started',
                statusLabel: statuses.markSchemeLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'mark_scheme';
                    state.canvasTimer = 0;
                    window.WML.renderCanvasWorkspace(); // TipTap document (v7.12.88)
                }
            },
            {
                id: 'model_answer',
                icon: SVG_MODEL_ANSWER,
                title: 'Watch Model Answer',
                desc: 'Watch and study a model answer for this question.',
                status: statuses.model_answer || (msDone ? 'not_started' : 'locked'),
                statusLabel: statuses.modelAnswerLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'model_answer_video';
                    window.WML.renderFeedbackDiscussionCanvas(); // Reuses lightweight canvas pattern
                }
            },
            {
                id: 'planning',
                icon: SVG_PLAN,
                title: 'Plan Your Redraft',
                desc: 'Work through your feedback and build an improved essay plan.',
                status: statuses.planning || (maDone ? 'not_started' : 'locked'),
                statusLabel: statuses.planningLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('planning');
                }
            },
            {
                id: 'outlining',
                icon: SVG_OUTLINE_STEP,
                title: 'Outline Your Essay',
                desc: 'Structure your redraft — organise paragraphs, quotes, and key points.',
                status: statuses.outlining || (statuses.planning === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.outliningLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('outlining');
                }
            },
            {
                id: 'polishing',
                icon: SVG_POLISH,
                title: 'Polish Your Essay',
                desc: 'Write your improved essay using your outline with Sophia\'s guidance.',
                status: statuses.polishing || (statuses.outlining === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.polishingLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    window.WML.selectTask('polishing');
                }
            },
            {
                id: 'reassessment',
                icon: SVG_ASSESS,
                title: 'Get Reassessed',
                desc: 'Submit your polished essay for final marking.',
                status: statuses.reassessment || (statuses.polishing === 'complete' ? 'not_started' : 'locked'),
                statusLabel: statuses.reassessmentLabel || null,
                onClick: () => {
                    state.draftType = baseType === 'diagnostic' ? 'diagnostic_redraft' : 'development_redraft';
                    state.phase = 'redraft';
                    state.task = 'redraft_assessment'; // v7.14.78: was 'assessment' — caused Phase 1/2 storage collision
                    state.canvasTimer = 0;
                    state.step = 0; // Reset so initAssessmentState can restore from chat history (v7.12.32)
                    window.WML.renderCanvasWorkspace();
                }
            }
        ];
    }

    // Strip AI internal content (JSON, function calls, protocol markers) — shared by both chat systems
    function stripAIInternals(text) {
        // Strip [PANEL:...][/PANEL] tags (keep inner text)
        text = text.replace(/\[PANEL:\s*\w+\]([\s\S]*?)\[\/PANEL\]/g, '$1').trim();
        // v7.14.68: Also strip [PANEL:...] without closing tag (AI sometimes omits [/PANEL])
        text = text.replace(/\[PANEL:\s*\w+\]/g, '').trim();
        // v7.14.68 / v7.18.15: Strip [PROGRESS:N] and [STEP_ADVANCE:N] step markers
        // (used for sidebar tracking, not for display)
        text = text.replace(/\[(?:STEP_ADVANCE|PROGRESS):\s*\d+\]/gi, '').trim();
        // v7.14.69: Strip [SUBSTEP_COMPLETE: step_N, substep_N, "Name"] markers (CW sub-step tracking)
        text = text.replace(/\[SUBSTEP_COMPLETE:\s*[^\]]*\]/g, '').trim();
        // v7.19.429: Strip @FIELD_COMMIT{...} chat→canvas field-fill signals (never shown to the student)
        text = text.replace(/@FIELD_COMMIT\s*\{[^}]*\}/g, '').trim();
        // v7.20.264: CW Step 2 code-turn signals — bare markers, no JSON payload.
        // @CW2_MENU  = recap done, code serves the inspiration menu.
        // @IDEA_LANDED = that message was a genuine story idea (CODE picks the row).
        // Tolerant of the model escaping the underscore (@CW2\_MENU), same as the other consumers.
        text = text.replace(/@CW2\\?_MENU/g, '').trim();
        text = text.replace(/@IDEA\\?_LANDED/g, '').trim();
        // v7.20.264: CW Step 3 — @CW3_START (recap done, code serves the walk) and
        // @COMPONENT_OK (that answer is solid; code banks it and advances).
        text = text.replace(/@CW3\\?_START/g, '').trim();
        text = text.replace(/@COMPONENT\\?_OK/g, '').trim();
        // v7.20.264: CW Step 4 — @CW4_START (recap done, code serves the spine walk) and
        // @BEAT_OK (that beat is solid; code banks it and advances).
        text = text.replace(/@CW4\\?_START/g, '').trim();
        text = text.replace(/@BEAT\\?_OK/g, '').trim();
        // v7.20.295: CW Step 4 coherence check — @COHERENCE_BEAT:N names the beat the check wants
        // the student to reconsider (code then offers to rewrite it); @COHERENCE_OK clears the
        // spine. Machine-read only: they stay in history for the resume path but never render.
        text = text.replace(/@COHERENCE\\?_BEAT[:\s]*[1-6]/g, '').trim();
        text = text.replace(/@COHERENCE\\?_OK/g, '').trim();
        // v7.20.296: CW Step 6 — @CW6_START (greeting done, code serves the outline walk),
        // @STAGE_OK / @STAGE_GAP (the per-stage micro-check verdict) and @OUTLINE_OK /
        // @OUTLINE_GAP (the sampled finish check). Machine-read only: they stay in RAW history
        // for the resume path but must never render. `\\?_`-tolerant like every marker above,
        // because formatAI's own markdown escaping turns `_` into `\_`.
        // v7.20.297: CW Step 5 — @CW5_START (greeting done, code serves the structure walk) and the
        // reflection verdict: @STRUCTURE_OK (their pick stands) / @STRUCTURE_SWAP:<key> (a different
        // archetype fits better; code then offers the switch). Machine-read only.
        text = text.replace(/@CW5\\?_START/g, '').trim();
        text = text.replace(/@STRUCTURE\\?_SWAP[:\s]*[a-z-]+/g, '').trim();
        text = text.replace(/@STRUCTURE\\?_OK/g, '').trim();
        text = text.replace(/@CW6\\?_START/g, '').trim();
        text = text.replace(/@STAGE\\?_(OK|GAP)/g, '').trim();
        text = text.replace(/@OUTLINE\\?_(OK|GAP)/g, '').trim();
        // ═══════════════════════════════════════════════════════════════════════════════════
        // v7.20.335 — GENERIC MARKER SWEEP. Neil, staging .331: "@WEAK: goal, stakes" rendered
        // in the chat, in front of students.
        //
        // ROOT: this stripper is a hand-maintained ENUMERATION. Every new marker has to be
        // remembered here as well as where it is parsed, and @WEAK/@ALL_OK (added at v7.20.325)
        // never were. Adding two more lines would leave the NEXT marker free to leak, so instead
        // strip by the SHAPE the protocol law already mandates: "put the marker on its own line
        // as the FINAL line". Anything matching that shape is a machine signal by definition and
        // can never be prose the student is meant to read.
        //
        // Deliberately conservative: the marker must occupy a WHOLE line on its own. An @NAME
        // mid-sentence is left alone, so ordinary prose cannot be eaten.
        text = text.replace(/^[ \t]*@[A-Z][A-Z0-9_]{2,}(?:[ \t]*:[^\n]*)?[ \t]*$/gm, '').trim();
        // Collapse the blank line the sweep leaves behind.
        text = text.replace(/\n{3,}/g, '\n\n').trim();

        // v7.19.434: Strip @SECTION_BEGIN{...}...@SECTION_END synthesis blocks (Phase 2 — the
        // wrapped profile/loglines are written into the canvas section, not echoed in the bubble).
        text = text.replace(/@SECTION_BEGIN\s*\{[^}]*\}[\s\S]*?@SECTION_END/g, '').trim();
        // v7.19.466: Strip @FIELD_SET{...} AI-authored row-fill signals (Phase 3 — CW Step 3
        // loglines are written into the canvas rows, not echoed in the bubble).
        text = text.replace(/@FIELD_SET\s*\{[^}]*\}/g, '').trim();
        // v7.19.978: Strip @POEM_SELECTED{...} — the poetry-CN poem-choice marker. Stays in
        // history (the poem-id restore on resume scans for it) but never renders in the bubble.
        text = text.replace(/@POEM_SELECTED\s*\{[^}]*\}/g, '').trim();
        // v7.19.854: Strip @SUMMARY_COMPLETE — the closing-chain arming marker the final-summary
        // mandate requires. It stays in history (the chain keys on it) but never renders.
        text = text.replace(/@SUMMARY_COMPLETE/g, '').trim();
        // v7.20.205 C-LADDER: Strip @ELEMENT_JUDGE{...} (the per-turn verdict) and @INSIGHT_SPENT
        // (the wallet-spend signal). Both stay in RAW history (code parses/stamps them there) but
        // MUST NEVER render to the student or chip-render — strip in the same place as @FIELD_COMMIT.
        // v7.20.206: payload OPTIONAL + case-insensitive — a bare/newline-broken/lowercased marker
        // must still never reach the bubble (the parser stays strict; heal covers the parse side).
        text = text.replace(/@ELEMENT_JUDGE(?:\s*\{[^}]*\})?/gi, '').trim();
        text = text.replace(/@INSIGHT_SPENT(?:\s*\{[^}]*\})?/gi, '').trim();
        // Piece 2 (v7.20.250): scripted-sequence player markers. @PLAY_SEQ = the API's hand-off
        // to the code-owned teaching player; @SEQ_ACK/@SEQ_DONE/@PMODE = the player's own hidden
        // audit/state markers. All stay in RAW history (code keys on them) but NEVER render.
        // v7.20.252: markdown-escaped underscores (`@PLAY\_SEQ`) leak past the strip AND the client
        // detector — the model emits them because formatAI/markdown escapes `_`. Un-escape marker
        // names FIRST so both the strip below and _detectPlaySeq see a canonical form (Fable, F4).
        // v7.20.274: the marker-name class must accept DIGITS — @CW2_MENU / @CW3_START /
        // @CW4_START all carry one, so `[A-Z]{2,}` stopped matching at the `2` and their
        // escaped form (`@CW2\_MENU`) survived the un-escape. The strip lines above are
        // `\\?_`-tolerant, so the marker never rendered — it silently failed DETECTION only,
        // and the CW Steps 2-4 walks would never have started. Widened at all 12 sites.
        text = text.replace(/(@[A-Z][A-Z0-9]+)\\_/g, '$1_');
        text = text.replace(/@PLAY_SEQ(?:\s*\{[^}]*\})?/gi, '').trim();
        // v7.20.255: @COMPARISON_CONFIRMED — the poetry comparison-choice justify verdict. The
        // model affirms the student's reasoning then emits this; code promotes the tentative pick
        // to the committed choice. Stays in RAW history (code keys on it), never renders.
        text = text.replace(/@COMPARISON_CONFIRMED(?:\s*\{[^}]*\})?/gi, '').trim();
        text = text.replace(/@ACK_FEEDBACK(?:\s*\{[^}]*\})?/gi, '').trim();
        text = text.replace(/@SEQ_ACK(?:\s*\{[^}]*\})?/gi, '').trim();
        text = text.replace(/@SEQ_DONE(?:\s*\{[^}]*\})?/gi, '').trim();
        text = text.replace(/@PMODE(?:\s*\{[^}]*\})?/gi, '').trim();
        // v7.19.839: collapse the blank-line stack the stripped marker lines leave behind —
        // the auto-file turn emits 12+ markers on their own lines, which stripped into a huge
        // empty gap in the bubble (Neil's screenshot).
        text = text.replace(/\n[ \t]*(?:\n[ \t]*){2,}/g, '\n\n').trim();
        // Strip LaTeX $$ blocks
        text = text.replace(/\$\$[^$]*?\$\$/g, '').trim();
        // Strip Python-style function calls
        text = text.replace(/^(?:```)?python\s*\n?/gm, '');
        text = text.replace(/save_plan_element\([^)]*\)\s*/g, '').trim();
        text = text.replace(/\(save_plan_element\s+called\s+for[\s\S]*?\)\s*/gi, '').trim();
        // Strip ```json blocks
        text = text.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
        // Strip bare JSON with tool/function/element_type keys
        text = text.replace(/\{\s*"(?:tool|function|element_type|name|parameters)"[\s\S]*?\}\s*/g, '').trim();
        // Strip orphaned ``` and leading ---
        text = text.replace(/^```\s*$/gm, '').trim();
        text = text.replace(/^---\s*\n/, '').trim();
        // Strip [Calling function_name with arguments: ...] leaked from function calling
        text = text.replace(/\[Calling\s+\w+\s+with\s+arguments:[^\]]*\]\s*/g, '').trim();
        // Strip [SAVE: element_type] protocol markers
        text = text.replace(/\[SAVE:\s*\w+\]\s*/g, '').trim();
        // Strip [ASSESSMENT_COMPLETE] code word (v7.12.23)
        // v7.18.40: also accept the optional question-id suffix variant
        // (e.g. `[ASSESSMENT_COMPLETE Q1]`) emitted by protocol-q1-msq.md.
        // The original regex left the suffixed form visible in chat.
        text = text.replace(/\[ASSESSMENT_COMPLETE(?:\s+[A-Z0-9_]+)?\]\s*/gi, '').trim();
        // v7.18.40: strip stale "💯 Current score: 0 / 0 marks" lines. The
        // running-score display is meaningful only when X / Y are non-zero
        // (mark scheme quizzes etc.). When the AI emits "0 / 0" — typical of
        // Q1-MSQ flows where there is no running tally — the line is just
        // visual noise that contradicts the per-question score above it.
        text = text.replace(/^\s*(?:💯\s*)?\*{0,2}Current score:\s*\*{0,2}\s*0\s*\/\s*0\s*marks?\*{0,2}\s*$/gim, '').trim();
        // Strip [QUIZ_COMPLETE] code word + machine-readable payload (v7.15.93)
        // v7.17.74: original regex required `]` immediately after QUIZ_COMPLETE, so the
        // payload form `[QUIZ_COMPLETE:score=...,grade=N]` (colon, not `]`) leaked into
        // rendered chat. Corrected to allow non-bracket payload chars before the closing
        // `]`, then gobble trailing whitespace through end of line.
        text = text.replace(/\[QUIZ_COMPLETE[^\]\n]*\][^\n]*/gi, '').trim();
        // Strip instruction markers
        text = text.replace(/\[END[^\]]*\]/g, '').trim();
        text = text.replace(/\[do NOT[^\]]*\]/gi, '').trim();
        // Strip AI narrating internal process
        text = text.replace(/(?:The student (?:confirmed|chose|selected|wants?).*?(?:I (?:need to|should|will|must)|Let me).*?(?:save_session_element|save_plan_element|move forward|proceed)[^.]*\.?\s*)/gi, '').trim();
        text = text.replace(/(?:^|\n)\s*(?:I (?:need to|should|will|must)\s+(?:call|save|move|proceed|transition)[^.\n]*\.?\s*)/gim, '\n').trim();
        // Strip bare "json" prefix (when AI leaks code fence language tag without backticks)
        text = text.replace(/^json\s*\n/gm, '').trim();
        return text;
    }

    // ── Assessment step detection utility (v7.12.34) ──
    // Shared by sendCanvasMessage and initAssessmentState.
    // Returns { step, isComplete, totalScore, grade }
    // CRITICAL: Regexes must require DEFINITIVE scoring evidence — a score that is AWARDED
    // (e.g., "**5/7**" or "Score: 3/3"), not mentioned as context or preview.
    // The AI recaps earlier section scores in later messages, so patterns must be strict.
    function detectAssessmentStep(replyText) {
        const r = replyText || '';
        let step = 0;
        const hasTotal = /(?:total|grand total)[:\s*]+\d+(?:\.\d+)?\/\d+/i.test(r);
        const hasGrade = /\bgrade[:\s*]+(?:level\s*|grade\s*)?\d/i.test(r);

        // Step 8: Final Summary — verified safe keywords (protocol analysis v7.12.35, v7.12.51)
        // These patterns ONLY appear in the final assessment section, never in individual section feedback.
        if (/\[ASSESSMENT_COMPLETE\]/i.test(r)) step = 8;
        else if (/Closing\s+Summary/i.test(r) && (hasTotal || hasGrade)) step = 8;
        else if (/Action\s+Plan/i.test(r) && /Hattie/i.test(r)) step = 8;
        else if (/Priority\s+Target/i.test(r) && hasGrade) step = 8;
        else if (/Where\s+am\s+I\s+going/i.test(r) && /How\s+am\s+I\s+going/i.test(r)) step = 8;
        else if (/Priority\s+Target/i.test(r) && /Action\s+Plan/i.test(r)) step = 8;
        else if (/Next\s+Steps/i.test(r) && /Priority\s+Target/i.test(r)) step = 8;
        else if (/Closing\s+Summary/i.test(r) && /Key\s+Strength/i.test(r)) step = 8;
        else if (hasTotal && hasGrade) step = 8;

        // Step 7: AO4/Technical Accuracy — explicit heading at line start
        else if (/^#{1,3}\s*(?:AO4|Technical\s+Accuracy)/m.test(r)) step = 7;
        // Step 7: Conclusion — heading at line start OR "Conclusion" with awarded score on same line
        else if (/^#{1,3}\s*Conclusion/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*6\b/.test(r)) step = 7;
        else if (/\*{2}Conclusion[^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*6\b/i.test(r)) step = 7;

        // Step 6: Body Paragraphs — heading at line start with assessment context
        // Only triggers when a body paragraph heading appears with its score
        else if (/^#{1,3}\s*Body\s+Paragraph\s+[1-3]/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*7\b/.test(r)) step = 6;
        else if (/\*{2}Body\s+Paragraph\s+[1-3][^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*7\b/i.test(r)) step = 6;

        // Step 5: Introduction — heading at line start with score
        else if (/^#{1,3}\s*Introduction/m.test(r) && /\d+(?:\.\d+)?\s*\/\s*3\b/.test(r)) step = 5;
        else if (/\*{2}Introduction[^*]*\*{2}.*\d+(?:\.\d+)?\s*\/\s*3\b/i.test(r)) step = 5;

        // Step 4: Essay Review — keyword check or structure confirmation
        else if (/^#{1,3}\s*(?:Essay\s+Review|Keyword\s+Check|Structure\s+Review)/m.test(r)) step = 4;
        else if (/(?:keyword\s+check|confirm\s+the\s+(?:essay\s+)?structure|identified?\s+\d+\s+paragraph)/i.test(r)) step = 4;

        // Step 3: Self-Reflection — student rating scale
        else if (/Self-[Rr]eflection|(?:scale\s+of\s+1|rate\s+(?:your|each|this)\s+paragraph|how\s+well.*paragraph)/i.test(r)) step = 3;

        // Step 2: Goal Setting — grade aim question
        else if (/(?:grade.*aim|target.*grade|what\s+grade\s+are\s+you)/i.test(r)) step = 2;

        // Step 1: Setup — word count/deficit
        else if (/(?:word.?count|deficit|penalty|W1)/i.test(r)) step = 1;

        // Assessment complete detection — mirrors step 8 logic
        const isComplete = step >= 8;
        // Force-extract scores
        let totalScore = null;
        let grade = null;
        const ts = r.match(/(?:\*{0,2})(?:total|grand total)[:\s*]+(\d+(?:\.\d+)?\/[1-9]\d+)/i);
        if (ts) totalScore = ts[1];
        const gr = r.match(/(?:\*{0,2})grade[:\s*]+(?:level\s*|grade\s*)?(\d[^.,*\n]{0,20})/i);
        if (gr) grade = gr[0].replace(/\*/g, '').trim();
        return { step, isComplete, totalScore, grade };
    }

    // v7.17.6: Canonical word-counter. Diagnostic + assessment + polishing
    // environments previously drifted by ~3 words because TipTap's default
    // `n.split(" ")` counter disagreed with ad-hoc `split(/\s+/)` callers on
    // tabs, non-breaking spaces, and consecutive whitespace. Route every
    // consumer through this helper, and pass it into CharacterCount.configure
    // so the editor's built-in counter agrees with our section counters.
    function countWords(text) {
        if (text == null) return 0;
        const s = String(text).trim();
        if (!s) return 0;
        return s.split(/\s+/).filter(Boolean).length;
    }

    // v7.17.11: Topic-flow detection. Inside a numbered topic (1–10) the
    // diagnostic / assessment / planning / outlining / polishing sequence is
    // a single attempt per CLAUDE.md — never expose the attempt UX. Standalone
    // mounts of the same task slugs (topicNumber falsy / out of range) keep
    // the attempts UI.
    // v7.17.16: mark_scheme_unit also suppressed — pre-topic standalone drill, completes once.
    // v7.18.19: mark_scheme (Final Assessment) also suppressed — no formal attempt
    // system; one assessment per unit, free-form re-attempt via clear-chat is fine
    // but no counter / overlay should render.
    // v7.20.77 (Neil: NO attempts in the lab — one doc per lesson): redraft_assessment +
    // feedback_discussion join the set so the WHOLE chain pins to attempt 1.
    const TOPIC_FLOW_TASKS = ['diagnostic', 'assessment', 'planning', 'outlining', 'polishing', 'redraft_assessment', 'feedback_discussion', 'mark_scheme_unit', 'mark_scheme', ''];
    const GUIDED_PHASES    = ['initial', 'redraft', 'preliminary'];
    function isTopicFlow() {
        const n = Number(window.WML?.state?.topicNumber ?? 0);
        const t = window.WML?.state?.task ?? '';
        const p = window.WML?.state?.phase ?? '';
        if (!TOPIC_FLOW_TASKS.includes(t)) return false;
        // v7.17.18: mark_scheme_unit unconditionally suppresses attempts UX —
        // single completion, tutor re-assigns for redo. phase may not be
        // 'preliminary' if bridge wml_phase isn't populated, so don't depend on it.
        if (t === 'mark_scheme_unit') return true;
        // v7.18.19: mark_scheme suppression mirrors mark_scheme_unit — no
        // formal attempt counter for the Final Assessment task.
        if (t === 'mark_scheme') return true;
        // v7.18.32: any LD-topic embed (sfwd-topic post) with a topic-flow task
        // is in topic flow, regardless of whether the bridge populated topicNumber
        // or phase. Standalone shortcode mounts (isLdTopic: false) fall through
        // to the topicNumber/phase checks below — preserves exam-prep selector UX.
        const cfg = window.swmlEmbedConfig || {};
        if (cfg.isLdTopic) return true;
        // v7.17.12: belt-and-braces — treat a guided phase as the fallback signal
        // for topic-flow identity when the bridge failed to populate topicNumber
        // (e.g. missing wml_topic mapping). Keeps attempt-UX suppression correct
        // even with partial bridge data. Standalone mounts use phase
        // 'exam_prep' / 'free_practice' so this does not misclassify them.
        const inNumberedTopic = n >= 1 && n <= 10;
        const inGuidedPhase   = GUIDED_PHASES.includes(p);
        return inNumberedTopic || inGuidedPhase;
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // ⭐ LIVE VALUES — the cure for the FOSSIL class (v7.20.351, Neil 2026-07-30:
    // "why are we still getting fossils… can we just get rid of it at its root?")
    //
    // THE ROOT. `canvasChatHistory` does two jobs with opposite requirements: it is a
    // TRANSCRIPT (immutable record, feeds the API) and it is the SCREEN (replayed
    // VERBATIM on every re-entry). Because replay is byte-for-byte, a turn that asserts
    // a CURRENT FACT becomes a lie the moment that fact changes — and the structure
    // offered only two states, saved-and-frozen or not-saved-and-lost. With no way to
    // say "this turn is real but part of it is live", authors baked the value in,
    // because that was the only thing the structure supported.
    //
    // TWO SUB-CLASSES, and only one of them had a rule:
    //   • TURN fossils  — a whole turn true only under a condition (the prereq gate
    //     .284, the resume re-serve .345, the anchor chips .350). Covered by WML
    //     CLAUDE.md §4c.7 "gates are ephemeral", and fixed site-by-site, each time
    //     after Neil hit it in a live lesson.
    //   • VALUE fossils — a turn that SHOULD persist but carries a MUTABLE value in its
    //     text. Never named, never fixed, no rule covered it. Proof: the Step 6 greeting
    //     saved 2026-07-25 read "You chose **Rags to Riches**" while the artifact said
    //     `tragedy` and the document had rebuilt correctly (uid 1, cwp_07aa2df334f4).
    //
    // THE DISCRIMINATOR IS TENSE, not interpolation. Of the 10 pushes built with
    // interpolation, the ones reporting a PAST EVENT ("I've received your essay (873
    // words)") are CORRECT to freeze — that is what happened. The ones asserting
    // PRESENT STATE ("you chose X") must stay live.
    //
    // THE FIX. Persist a TOKEN, resolve at render — the third state the structure was
    // missing: durable in shape, live in value. Deliberately the SAME `[SWML_*]` marker
    // idiom formatAI already resolves for progress bars and beat chips, so this is the
    // house pattern extended, not a new mechanism to learn.
    //
    //   store:  'You chose **[SWML_LIVE:cw.plotStructure]** in Step 5.'
    //   render: 'You chose **Tragedy** in Step 5.'
    //
    // ONE resolve point covers live AND all 8 replay sites, because every rendered turn
    // passes through formatAI. `resolveLiveValues` is also exported for the API-payload
    // path, so the model sees the value and never the token.
    //
    // RESOLVERS ARE SYNC BY CONTRACT. formatAI is sync and replay is a tight loop, so a
    // getter must read an already-warmed in-session cache (e.g.
    // `window._wmlCwPlotStructure[projectId]`, which the Step 5 pick sets synchronously)
    // and NEVER return a Promise. A getter that cannot answer returns '' and the
    // registered fallback renders instead.
    //
    // §4d LIVENESS: an unresolved token must NEVER reach a student as raw `[SWML_LIVE:…]`.
    // It degrades to the fallback — a sentence that is always true if less specific
    // ("your chosen plot structure") — and warns once per token so the gap is loud in
    // console without spamming a replay of 60 turns.
    const _liveValues = Object.create(null);
    const _liveWarned = Object.create(null);

    // name: dotted token id, e.g. 'cw.plotStructure'
    // get:  () => string   SYNC. '' (or throw) means "cannot answer right now".
    // fallback: the always-true, less-specific wording rendered when get() cannot answer.
    function registerLiveValue(name, get, fallback) {
        if (!name || typeof get !== 'function') {
            console.warn('WML LiveValue: refusing to register', name, '— needs a name and a sync getter');
            return;
        }
        if (typeof fallback !== 'string' || !fallback) {
            console.warn('WML LiveValue: refusing to register', name, '— a fallback string is mandatory (§4d: an unresolved token must never reach a student)');
            return;
        }
        _liveValues[name] = { get: get, fallback: fallback };
    }

    // Resolve every [SWML_LIVE:name] in `text`. Safe to call on any string, any number
    // of times — a text with no tokens is returned untouched and costs one regex test.
    function resolveLiveValues(text) {
        const s = String(text == null ? '' : text);
        if (s.indexOf('[SWML_LIVE:') === -1) return s;
        return s.replace(/\[SWML_LIVE:([A-Za-z0-9_.]+)\]/g, function (whole, name) {
            const entry = _liveValues[name];
            if (!entry) {
                if (!_liveWarned[name]) {
                    _liveWarned[name] = 1;
                    console.warn('WML LiveValue: no resolver registered for "' + name + '" — rendering nothing. A stored turn references a token this build does not know.');
                }
                return '';
            }
            let v = '';
            try { v = entry.get(); } catch (e) {
                if (!_liveWarned[name]) {
                    _liveWarned[name] = 1;
                    console.warn('WML LiveValue: resolver for "' + name + '" threw —', e && e.message, '— falling back.');
                }
            }
            if (v && typeof v.then === 'function') {
                if (!_liveWarned[name]) {
                    _liveWarned[name] = 1;
                    console.warn('WML LiveValue: resolver for "' + name + '" returned a Promise. Getters MUST be sync (they run inside formatAI and the replay loop) — read a warmed cache instead.');
                }
                v = '';
            }
            v = (typeof v === 'string') ? v.trim() : '';
            if (v) return v;
            if (!_liveWarned[name]) {
                _liveWarned[name] = 1;
                console.warn('WML LiveValue: "' + name + '" could not resolve — rendering the fallback ("' + entry.fallback + '").');
            }
            return entry.fallback;
        });
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // ⭐⭐ recordTurn — THE SINGLE WRITER INTO CHAT HISTORY (v7.20.352)
    //
    // The twin of LIVE VALUES above, and the half that closes the bug class.
    // LIVE VALUES fixed the VALUE fossil (a durable turn carrying a mutable value).
    // This fixes the TURN fossil (a whole turn that is only true while some condition
    // holds) — the .284 prereq gate, the .324 greeting, the .345 resume re-serve, the
    // .350 anchor chips, and the empty-response redirect found by the .351 audit.
    //
    // WHY A FUNNEL AND NOT A DETECTOR. A value fossil has a traceable ORIGIN (a live
    // resolver), so a lint can follow the taint — that is how fossil-lint works. A turn
    // fossil has no such marker: its defect is SEMANTIC ("this sentence is only true
    // while the response is empty"). You cannot grep for that, and a lint that guesses
    // would drown the build in false positives and get switched off. So the fix is
    // STRUCTURAL, not detective.
    //
    // THE ACTUAL ROOT. `history.push(…)` was the thing that came to hand, and it
    // silently means "persist for ever". Persisting was THE DEFAULT YOU GOT BY NOT
    // THINKING — and every fossil we have ever shipped is somebody not thinking about
    // it, including several models who had read the rule. A rule in prose cannot beat a
    // default in code.
    //
    // So: there is exactly ONE way to write a turn, and it will not let you skip the
    // question. `durable` has NO default. Omitting it fails the build (fossil-lint
    // Check C), and every call must also say WHY in one short phrase — that string is
    // the review artefact, greppable for ever after.
    //
    // THE TEST, and it decides every case correctly:
    //     "If this fact changes tomorrow, should this sentence still be on the screen?"
    //         no  → durable: false   (derived — re-draw it on entry, never store it)
    //         yes → durable: true    (a real turn — it happened, it stays)
    //   "You chose Rags to Riches"                  → no.  Not durable.
    //   "Head back and draft your response"         → no.  Not durable.
    //   "I've received your essay (873 words)"      → YES. A report of what happened.
    //   the student's own message                   → YES. They said it.
    //
    // durable:false is NOT a loss — WML CLAUDE.md §4c.7 already requires derived turns to
    // re-derive on entry, and §4d requires the screen to stay live either way. Nothing
    // disappears; it simply stops being frozen.
    //
    // WHAT THIS STILL CANNOT DO, stated plainly rather than left to be discovered: the
    // funnel forces the QUESTION, it cannot verify the ANSWER. Someone can still pass
    // durable:true wrongly. Three things blunt that, none of which rely on memory:
    //   1. fossil-lint's taint trace catches the VALUE subclass whatever the flag says;
    //   2. the present-state warn below fires at the moment of writing, with `why` in hand;
    //   3. the `why` strings make the whole set reviewable in one grep.
    const _turnWarned = Object.create(null);
    // Second-person PRESENT-STATE assertions — the linguistic signature of a turn fossil.
    // Advisory only: some are legitimately durable ("you chose" inside a past-tense recap
    // of a decision the student cannot revisit), which is exactly why this warns and never
    // blocks. A blocking rule here would be wrong often enough to get disabled.
    const PRESENT_STATE_RE = /\byou\s+(?:haven[’']?t|have\s+not|hasn[’']?t|still\s+(?:need|have)|are\s+(?:currently|now|still))\b|\bgo\s+back\s+to\s+Step\b|\bnot\s+yet\s+(?:written|completed|done|chosen)\b/i;

    /**
     * The ONLY way to write a turn into a chat history array.
     *
     * @param {Array}  history  the history array (canvasChatHistory / chatHistory / …)
     * @param {Object} entry    the turn: { role, content, ...extras (hidden, beat, preChain) }
     * @param {Object} opts     { durable: boolean (REQUIRED), why: string (REQUIRED) }
     * @returns {Object|null}   the entry when stored, null when deliberately not stored
     */
    function recordTurn(history, entry, opts) {
        const o = opts || {};
        const label = (entry && entry.role) || 'turn';

        // Contract violation. Unreachable if the gate ran — so if we are here, the gate was
        // bypassed. PERSIST and scream: losing a student's real turn is worse than a fossil,
        // so the failure mode is the recoverable one.
        if (typeof o.durable !== 'boolean') {
            console.error('WML recordTurn: `durable` is REQUIRED and must be a boolean (' + label + '). '
                + 'Persisting to avoid data loss, but this is a defect — decide it explicitly: '
                + '"if this fact changes tomorrow, should this sentence still be on the screen?"');
            if (Array.isArray(history) && entry) history.push(entry);
            return entry || null;
        }
        if (typeof o.why !== 'string' || !o.why) {
            console.error('WML recordTurn: `why` is REQUIRED (' + label + ') — one short phrase saying '
                + 'why this turn is' + (o.durable ? '' : ' NOT') + ' durable. It is the review artefact.');
        }

        if (!o.durable) return null;   // drawn elsewhere; deliberately not stored (§4c.7)

        if (Array.isArray(history) && entry) {
            const c = typeof entry.content === 'string' ? entry.content : '';
            if (entry.role === 'assistant' && c && PRESENT_STATE_RE.test(c)) {
                const key = c.slice(0, 60);
                if (!_turnWarned[key]) {
                    _turnWarned[key] = 1;
                    console.warn('WML recordTurn: a DURABLE assistant turn asserts present state — '
                        + 'check it is not a fossil.\n  why: ' + (o.why || '(none given)')
                        + '\n  text: ' + c.slice(0, 140).replace(/\n/g, ' ')
                        + '\n  Test: if this fact changes tomorrow, should this sentence still be on screen?');
                }
            }
            history.push(entry);
        }
        return entry || null;
    }

    /**
     * REHYDRATE — put an ALREADY-STORED turn back into the in-memory array on replay.
     *
     * This is NOT a persistence decision and must never be confused with one: the turn was
     * already judged when it was first written, and re-asking `durable` here would be
     * meaningless (the answer is "it is already stored"). It exists as its own named
     * function so that the gate can allow it while still banning raw `.push`, and so that
     * a reader can tell restoring from recording at a glance.
     *
     * If you find yourself wanting to DECIDE something here, you are in the wrong function —
     * the decision belongs at the site that first wrote the turn.
     */
    function rehydrateTurn(history, entry) {
        if (Array.isArray(history) && entry) history.push(entry);
        return entry || null;
    }

    function formatAI(text) {
        // ⭐ v7.20.351: resolve LIVE VALUES first, before any transform, so a resolved
        // value sits inside the surrounding markdown (**[SWML_LIVE:…]** → **Tragedy**)
        // and is escaped by the same rules as the rest of the turn. See the block above.
        text = resolveLiveValues(text);
        // v7.20.553 (#420, root §14): the trial marking contract ends the model's reply with
        // machine lines (@TRIAL_VERDICT[…] · @TRIAL_STRENGTH[…] · @TRIAL_PRIORITY[…]). They are
        // read by the parser from the RAW reply and filed into the document — a human must never
        // see them. Stripped here, at the ONE display renderer, so both pipelines and every
        // replay of saved history are clean; raw chatHistory keeps them (the parser and the
        // resume path re-read the raw turn).
        text = String(text).replace(/^[ \t]*@TRIAL_[A-Z]+\s*\[[^\]]*\][^\n]*$\n?/gm, '').trim();
        // v7.19.922 (Neil): tag marking-penalty lines with "Learn →" chip tokens BEFORE any
        // transform — detection reuses the ledger's raw-text codeRe shape. Tokens are added to
        // this local copy only; raw chatHistory and every raw-text consumer stay untouched.
        text = tagLearnChips(text);
        // v7.20.49: protocol-triggered resource deep-links + the Q5 device-card menu chip
        // (AQA P2 planning). Same token pipeline as the learn-chips — ONE chip system.
        text = tagResourceLinks(text);
        text = String(text).replace(/@DEVICE_MENU/g, '⟦SWML_DEVMENU⟧');
        // Security: escape raw HTML entities before markdown conversion (v7.15.2)
        // All HTML tags are generated programmatically AFTER this step by the markdown converter
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // ── Pre-process: render ASCII progress bars as CSS bars (v7.14.51) ──
        // Matches patterns like "[Progress: ████████░░░░ 50%]" or "Progress: ███░░░ 30%"
        // v7.17.24: also consume markdown-escape backslashes around the brackets —
        // protocols (e.g. mark-scheme-quiz/*.md) emit "\[Progress: … 50%\]" which
        // previously left a literal "\" + "\]" around the rendered bar.
        text = text.replace(/\\?\[?Progress(?:\s*bar)?:\s*[█▓▒░■□●○\u2588-\u259F\s]+(\d+)%\\?\]?/gi,
            (_, pct) => `\n[SWML_PROGRESS_${pct}]\n`
        ).trim();

        // ── Pre-process: render [BLANK] and underscore blanks as inline input fields (v7.14.56) ──
        // v7.15.103: AI sometimes escapes underscores ("\_\_\_\_\_\_") to avoid markdown italic
        //            parsing. Those show as literal backslash-underscore in the bubble. Normalise
        //            escaped sequences of 3+ before the blank replacement so fill-in-blank
        //            questions render as input fields rather than "\_\_\_\_\_\_".
        let blankIdx = 0;
        text = text.replace(/(?:\\_){3,}/g, (m) => '_'.repeat(m.length / 2));
        // v7.19.637: also match the markdown-escaped form \[BLANK\] — the quiz
        // question banks store the token escaped, and the AI sometimes relays it
        // that way, which the bare /\[BLANK\]/ regex would miss (leaving it as
        // literal text instead of a fill-in-the-gap input field).
        text = text.replace(/\\?\[BLANK\\?\]/gi, () => `[SWML_BLANK_${blankIdx++}]`);
        text = text.replace(/_{3,}/g, () => `[SWML_BLANK_${blankIdx++}]`);

        // ── Pre-process: split concatenated pipe table rows (AI sometimes omits newlines) ──
        // Pattern: "| cell |  | cell |" → "| cell |\n| cell |" (double-pipe = row boundary)
        text = text.replace(/\|\s*\|(?=\s*[A-Za-z0-9*])/g, '|\n|');

        // ── Markdown tables → HTML tables (before newline conversion) ──
        const tableBlocks = [];
        text = text.replace(/((?:\|[^\n]+\|\n?)+)/g, (block) => {
            const rows = block.trim().split('\n').filter(r => r.trim().startsWith('|'));
            if (rows.length < 2) return block; // not a real table
            // Check if row 2 is a separator (|---|---|)
            const isSep = /^\|[\s:]*-{2,}[\s:]*\|/.test(rows[1]);
            // If no separator but looks like a table (3+ rows, consistent columns), synthesise one
            if (!isSep && rows.length >= 3) {
                const headerCols = rows[0].split('|').filter(Boolean).length;
                const dataCols = rows[1].split('|').filter(Boolean).length;
                if (headerCols >= 2 && dataCols >= 2 && headerCols === dataCols) {
                    const sep = '|' + ' --- |'.repeat(headerCols);
                    rows.splice(1, 0, sep);
                } else {
                    return block;
                }
            } else if (!isSep) {
                return block;
            }

            let tableHtml = '<table class="swml-table"><thead><tr>';
            // Helper: convert inline markdown in cell text
            const fmtCell = (c) => c.trim().replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Header row
            rows[0].split('|').filter(Boolean).forEach(cell => {
                tableHtml += `<th>${fmtCell(cell)}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            // Data rows (skip separator at index 1)
            for (let i = 2; i < rows.length; i++) {
                const cells = rows[i].split('|').filter(Boolean);
                if (cells.length === 0) continue;
                tableHtml += '<tr>';
                cells.forEach(cell => { tableHtml += `<td>${fmtCell(cell)}</td>`; });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            const placeholder = `%%TABLE${tableBlocks.length}%%`;
            tableBlocks.push(tableHtml);
            return '\n' + placeholder + '\n';
        });

        let html = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        // Replace emoji icons with SVG equivalents
        // v7.19.916: 💡/📋 moved to the svgifyEmojis brand-icon map (end of this function) —
        // Neil's illustrative pack replaces the old stroke icons for decorative emojis.
        html = html.replace(/🎲/g, '<span class="swml-inline-icon">' + SVG_ICON_GENERATE + '</span>');
        html = html.replace(/✏️/g, '<span class="swml-inline-icon">' + SVG_ICON_PASTE + '</span>');
        html = html.replace(/✅/g, '<span class="swml-inline-icon swml-icon-save">' + SVG_ICON_SAVE + '</span>');

        // Restore table blocks
        tableBlocks.forEach((tbl, i) => {
            html = html.replace(`%%TABLE${i}%%`, tbl);
        });

        // Render --- horizontal rules — only standalone dashes, not inside table remnants
        html = html.replace(/(?:<br>)+\s*---\s*(?:<br>)+/g, '<hr class="swml-hr">');
        // Leading --- at start of message
        html = html.replace(/^---\s*(?:<br>)+/, '<hr class="swml-hr">');

        // Render markdown-style bullet lists: lines starting with "- " after <br>
        html = html.replace(/(?:<br>)- (.+?)(?=<br>|$)/g, '<br><span class="swml-bullet">•</span> $1');

        // Strip markdown blockquote prefix "> " (e.g. "> **[30 marks]**" → "**[30 marks]**")
        // Note: > is escaped to &gt; at formatAI() entry (v7.15.2)
        html = html.replace(/<br>&gt;\s+/g, '<br>');
        html = html.replace(/^&gt;\s+/, '');

        // Render markdown heading prefixes: ## → h4, ### → h5 styled sub-headings
        html = html.replace(/(?:<br>)###\s+(.+?)(?=<br>|$)/g, '<br><strong class="swml-chat-h5">$1</strong>');
        html = html.replace(/^###\s+(.+?)(?=<br>|$)/g, '<strong class="swml-chat-h5">$1</strong>');
        html = html.replace(/(?:<br>)##\s+(.+?)(?=<br>|$)/g, '<br><strong class="swml-chat-h4">$1</strong>');
        html = html.replace(/^##\s+(.+?)(?=<br>|$)/g, '<strong class="swml-chat-h4">$1</strong>');

        // Render progress bar placeholders as CSS bars (v7.14.51)
        const hasProgressBar = /\[SWML_PROGRESS_(?:CODE_)?\d+\]/.test(html);
        // v7.20.350: the CODE-SERVED bar (cwProgressBar, the CW walks) carries an extra class so
        // withProgressChip can tell it apart from a bar the MODEL improvised. Both render
        // identically; only the model's is strippable. Replaced FIRST — `CODE_` is not digits, so
        // the generic rule below could never match it anyway, but order makes the intent plain.
        // v7.20.356: the `_CODE_` bar HAS NO PRODUCER ANY MORE — cwProgressBar always emits
        // `[SWML_BEAT:…]` now, so every code-served walk renders the real chip. The rule is kept
        // ONLY so a message stored by .350–.355 still renders something on replay, and it now
        // renders the CHIP rather than the crude bar it was written as. Delete it once no stored
        // transcript can contain the token.
        html = html.replace(/\[SWML_PROGRESS_CODE_(\d+)\]/g, (_, pct) =>
            progressChipHTML({ pct: parseInt(pct, 10) })
        );
        // ⭐ v7.20.350 — THE BEAT CHIP, for code-served walks. Neil: "I wanted exactly the same
        // style, not just the progress bar… I think there's some text above that, and text below."
        // He is describing the FQ/MSQ gold standard, which is a real component and not a bare bar:
        // progressChipHTML() renders a top-liner (section · Step N of M) over a gradient track,
        // and its caller adds a BOLD heading underneath (_beatChipBlock, wml-assessment.js).
        // Reused verbatim here rather than re-derived, so the CW walks and the quizzes cannot
        // drift apart. `[SWML_BEAT:{…}]` carries the walk's own numbers; the JSON is built by
        // cwProgressBar, never by the model.
        html = html.replace(/\[SWML_BEAT:(\{[^}]*\})\]/g, (whole, json) => {
            let beat;
            try { beat = JSON.parse(json); } catch (e) { return ''; }
            if (!beat) return '';
            const head = beat.heading
                ? '<p><strong>' + String(beat.heading).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])) + '</strong></p>'
                : '';
            return progressChipHTML(beat) + head;
        });
        // ⭐ v7.20.356 — THE MODEL'S BAR RENDERS AS THE SAME CHIP. Neil: "I want it like that
        // UNIVERSALLY… not just creative writing." 72 protocol modules emit the ASCII
        // "[Progress bar: ███░ 50%]" line, which became this crude 10px widget in the MAIN chat
        // (planning). The CANVAS chat never showed it — withProgressChip strips it — so the
        // inconsistency was invisible from the assessment screens he was comparing against.
        // Now every progress render in the product is the one component.
        //
        // ⚠ THE MARKER CLASS IS LOAD-BEARING. withProgressChip must still be able to delete a
        // MODEL bar in the canvas chat, because parseProgressBeat adds the authoritative chip
        // there — without a way to tell them apart the student would get TWO chips on one bubble.
        // The old strip keyed on `class="swml-chat-progress-bar"`, which this markup no longer
        // has, so the distinction moves to `swml-beat--model`. Code-served chips carry no marker
        // and are never stripped, which is the same contract `--code` expressed before.
        html = html.replace(/\[SWML_PROGRESS_(\d+)\]/g, (_, pct) =>
            progressChipHTML({ pct: parseInt(pct, 10) }).replace('class="swml-beat"', 'class="swml-beat swml-beat--model"')
        );

        // Render blank placeholders as inline inputs (v7.14.51)
        // v7.18.18: Submit Answer button re-added (was dropped in v7.18.12). Student
        // UX feedback: students instinctively look for a submit button under the
        // input. Enter-key path still works — the button is an additional submit
        // path. ONE button per message regardless of how many blanks (multi-blank
        // submit gathers all values).
        let _hadBlank = false;
        html = html.replace(/\[SWML_BLANK_(\d+)\]/g, (_, idx) => {
            _hadBlank = true;
            return `<input type="text" class="swml-blank-input" data-blank-idx="${idx}" placeholder="type your answer..." autocomplete="off" />`;
        });
        if (_hadBlank) {
            html += '<div class="swml-blank-submit-wrap"><button class="swml-blank-submit" type="button">Submit Answer</button></div>';
        }

        // Render "Step X of Y" within AI messages as visual step blocks
        // v7.14.55: Skip step blocks when a CSS progress bar already renders in the same message
        if (hasProgressBar) {
            html = html.replace(/(?:Step|Part [A-Z]\.\d+[A-Z]?:\s*\w[\w\s&]*?>\s*Step)\s+(\d+)\s+of\s+(\d+)/gi, '');
        }
        html = html.replace(/(?:Step|Part [A-Z]\.\d+[A-Z]?:\s*\w[\w\s&]*?>\s*Step)\s+(\d+)\s+of\s+(\d+)/gi, (match, current, total) => {
            const c = parseInt(current), t = parseInt(total);
            let blocks = '';
            for (let i = 1; i <= t; i++) {
                if (i < c) blocks += `<span class="swml-step-block filled"></span>`;
                else if (i === c) blocks += `<span class="swml-step-block filled current"></span>`;
                else blocks += `<span class="swml-step-block"></span>`;
            }
            return `<span class="swml-step-blocks">${blocks}<span class="swml-step-blocks-label">Step ${c} of ${t}</span></span>`;
        });

        // Clean up protocol navigation line: "📌 Planning > Part B.1: ..." → styled header
        html = html.replace(/📌\s*(Planning|Assessment|Polishing)\s*&gt;\s*(.+?)(?:<br>)/gi, (match, task, detail) => {
            return `<div class="swml-step-header"><span class="swml-step-task">${task}</span> <span class="swml-step-detail">${detail}</span></div>`;
        });

        // Enhance "Planning > ..." breadcrumbs with section name
        html = html.replace(/(?:📌\s*)?Planning\s*&gt;\s*(Part\s*)?([A-Z])\.?(\d+)?([A-Z])?(?::?\s*([^<]+?))?(?:\s*&gt;\s*)?/gi, (match, part, section, num, sub, detail) => {
            const sectionMap = { B: { '1': 'Setup', '2': 'Goal Setting', '2A': 'Keyword Analysis', '3': 'Diagnostic', '4': 'Anchor Quotes', '5': 'Body Paragraphs', '6': 'Thesis', '7': 'Introduction', '8': 'Conclusion', '9': 'Review', '10': 'Wrap-up' } };
            const key = num ? (sub ? num + sub : num) : '';
            const sectionName = sectionMap[section?.toUpperCase()]?.[key] || detail?.trim() || '';
            const label = sectionName ? `Planning · ${sectionName}` : 'Planning';
            return `<span class="swml-step-task">${label}</span> `;
        });

        // v7.13.41: Auto-link URLs — convert bare https:// URLs to clickable links
        html = html.replace(/(?<![="'])(https?:\/\/[^\s<>"']+)/g, '<a href="$1" target="_blank" rel="noopener" class="swml-chat-link">$1</a>');

        // v7.19.898 (Neil): swap the AI's per-statement feedback STATUS emojis for Iconoir SVG
        // badges — via the SHARED helper so chat (this raw-HTML path) AND the canvas card
        // (cwMarkdownToDocHtml → fbGlyph schema node) render the SAME glyph and can't diverge.
        html = svgifyStatusGlyphs(html);

        // v7.19.916 (Neil): decorative emojis → brand illustrative icons (see svgifyEmojis).
        html = svgifyEmojis(html);

        // v7.19.922: swap the Learn-chip tokens (added by tagLearnChips at the top of this
        // function) for the real buttons — last, so no other transform can split them.
        html = renderLearnChipTokens(html);
        // v7.20.49: device-card menu chip (AQA P2 planning Q5 — D6 programmatic component).
        // The delegated open handler lives in wml-assessment (.swml-device-menu-chip).
        html = html.replace(/⟦SWML_DEVMENU⟧/g,
            '<button type="button" class="swml-device-menu-chip" title="Open the device construction templates">🛠 Device templates →</button>');

        // ⭐ v7.20.404 (Neil, #177): the "→" separators in chat prose become HIS arrow. LAST, so it
        // runs on finished HTML and every earlier transform still sees the plain glyph it expects
        // (the device chip a line above emits one of its own, which is why order matters here).
        html = arrowize(html);

        return html;
    }

    // v7.19.952 (Neil): ONE canonical lock icon — tabler lock-square-rounded (the SVG Neil
    // supplied, frontend/icons/tabler-lock-square-rounded-line.svg) — for EVERY lock indicator
    // in JS-built DOM, replacing the 🔒 emoji. stroke='currentColor' → inherits the host's
    // text colour on both themes. CSS content: sites carry the same paths as a data-URI
    // (pseudo-element images can't inherit currentColor); the chat emoji layer swaps via
    // icons/emoji/padlock.svg (same drawing). Keep all three in sync if the icon ever changes.
    function lockIconSVG(size) {
        const s = size || 12;
        return '<svg class="swml-lock-ico" xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"/><path d="M8 11m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z"/><path d="M10 11v-2a2 2 0 1 1 4 0v2"/></svg>';
    }

    // ══ THE ICON REGISTRY ═══════════════════════════════════════════════════════════════════
    // v7.20.363. ONE table, one glyph per CONCEPT, every consumer looks it up. Neil, approving
    // the build: "just bear in mind that we might need to update that at some point" — so this
    // is built to be edited: to change an icon, drop the new file in frontend/icons/, paste its
    // inner markup into the row below, done. The rail button, that panel's header and any chip
    // using the same concept all change together, because they read the SAME row. They used to
    // share a const by luck; now they share it by construction.
    //
    // Every glyph is VERBATIM from a file Neil supplied, extracted programmatically rather than
    // retyped, and `src` names the file it came from so provenance survives (frontend/icons/).
    //
    // ⚠️ INLINE vs <img> — the rule, because getting it wrong is invisible until it ships:
    //   MONOCHROME icon → INLINE (this table). It must inherit currentColor to sit on a green
    //     button, a purple chip and both themes; an <img> cannot inherit colour at all.
    //   FULL-COLOUR BRAND MARK → <img> (phoenixIconHTML below). It must NOT inherit colour, and
    //     inlining would paste 31KB per instance AND duplicate its <defs> gradient ids into the
    //     document, where ids are global — every url(#radial-gradient) would resolve to whichever
    //     copy landed first.
    // This is also why frontend/icons/emoji/ (512x512, gradients, <img>) can never dress a button.
    //
    // `kind` picks the wrapper: tabler FILLED glyphs paint with fill, feather/tabler OUTLINE
    // glyphs paint with stroke. Mixing them up yields a solid blob or an invisible icon.
    const ICON_WRAP = {
        filled: 'xmlns="http://www.w3.org/2000/svg" fill="currentColor"',
        line: 'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
        // Neil's Story Components puzzle is drawn at 1.91 with SQUARE caps and a mitre join.
        // Kept as drawn rather than normalised to the tabler weight — the geometry is his.
        lineSquare: 'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.91" stroke-linecap="square" stroke-miterlimit="10"',
    };
    const ICONS = {
        // ⭐ v7.20.507 — four glyphs Neil supplied 2026-08-13 to replace emoji on buttons.
        // Bodies extracted PROGRAMMATICALLY from frontend/icons/*.svg, never retyped (the rule at
        // the top of this table). ⚠️ THREE DIFFERENT GRIDS — 24, 48 and 64 — which is exactly why
        // `vb` is per ROW: a 64-grid glyph emitted on the default 24 viewBox renders as a corner
        // fragment magnified ~3x, which reads as a broken icon rather than as a wrong number.
        // Only `reopenScene` has a button so far; the other three are registered and waiting for
        // Neil to say which buttons they dress (his names are TECHNIQUES, not button names).
        foreshadowing: { kind: 'filled', vb: '0 0 24 24', src: 'foreshadowing.svg', body: '<path d="M4.00001 20V14C4.00001 9.58172 7.58173 6 12 6C16.4183 6 20 9.58172 20 14V20H21V22H3.00001V20H4.00001ZM6.00001 14H8.00001C8.00001 11.7909 9.79087 10 12 10V8C8.6863 8 6.00001 10.6863 6.00001 14ZM11 2H13V5H11V2ZM19.7782 4.80761L21.1924 6.22183L19.0711 8.34315L17.6569 6.92893L19.7782 4.80761ZM2.80762 6.22183L4.22183 4.80761L6.34315 6.92893L4.92894 8.34315L2.80762 6.22183Z"/>' },
        // The door-with-chevron. Named by Neil for the "Reopen my scene" chip. The tabler filled
        // export ships a transparent 24x24 backing plate; dropped here (it paints nothing).
        reopenScene: { kind: 'filled', vb: '0 0 24 24', src: 'reopen-my-scene.svg', body: '<path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-4.387 4.21l.094 .083l2 2a1 1 0 0 1 .083 1.32l-.083 .094l-2 2a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.292 -1.293l-1.292 -1.293a1 1 0 0 1 -.083 -1.32l.083 -.094a1 1 0 0 1 1.32 -.083z" />' },
        subplot: { kind: 'filled', vb: '0 0 48 48', src: 'subplot.svg', body: '<path d="M27.3177,35.9142c-.7659-.4966-1.8427-.9142-3.3177-.9142s-2.5518.4177-3.3177.9142c-.8898-2.8441-3.5491-4.9142-6.6823-4.9142-3.8594,0-7,3.1406-7,7s3.1406,7,7,7c3.7529,0,6.8173-2.9719,6.984-6.6844.2583-.3636,1.1115-1.3156,3.016-1.3156,1.9133,0,2.7659.9611,3.0159,1.3134.1656,3.7135,3.2305,6.6866,6.9841,6.6866,3.8594,0,7-3.1406,7-7s-3.1406-7-7-7c-3.1332,0-5.7925,2.0702-6.6823,4.9142ZM14,43c-2.7568,0-5-2.2432-5-5s2.2432-5,5-5,5,2.2432,5,5-2.2432,5-5,5ZM39,38c0,2.7568-2.2432,5-5,5s-5-2.2432-5-5,2.2432-5,5-5,5,2.2432,5,5ZM41.5928,15.8145c-.8464-.381-1.763-.5062-2.6531-.3792-4.3094-8.4137-6.7807-12.4353-8.9396-12.4353-1.3574,0-2.833.4971-4.3867,1.4785-.9961.627-2.2314.627-3.2256,0-1.5547-.9814-3.0303-1.4785-4.3877-1.4785-2.1599,0-4.6305,4.0214-8.9398,12.4343-.8903-.1268-1.8066-.0009-2.653.3802-1.3545.6104-2.3379,1.7881-2.6992,3.2314-.5352,2.1377.4551,4.3711,2.4072,5.4287,3.1182,1.6904,9.5879,4.5254,17.8848,4.5254s14.7666-2.835,17.8848-4.5254c1.9521-1.0576,2.9424-3.291,2.4072-5.4287v-.001c-.3613-1.4424-1.3447-2.6201-2.6992-3.2305ZM18,5c.96,0,2.1074.4043,3.3203,1.1699,1.6523,1.043,3.7061,1.043,5.3604,0,1.2119-.7656,2.3594-1.1699,3.2979-1.1709,1.4244.27,5.201,7.4777,7.0585,11.107-2.7214,1.36-7.0927,2.894-13.037,2.894s-10.3167-1.5343-13.038-2.8953c1.8548-3.6207,5.632-10.8354,7.038-11.1047ZM40.9316,22.7168c-2.9512,1.5996-9.0762,4.2832-16.9316,4.2832s-13.9805-2.6836-16.9316-4.2832c-1.1494-.623-1.7334-1.9336-1.4209-3.1855.2119-.8457.7881-1.5361,1.5811-1.8926.3701-.167.7646-.251,1.1582-.251.4463,0,.8916.1074,1.3027.3203,2.8867,1.502,7.7139,3.292,14.3105,3.292s11.4238-1.79,14.3105-3.291c.7715-.4023,1.6699-.4277,2.4609-.0703.793.3564,1.3691,1.0469,1.5811,1.8926.3125,1.252-.2715,2.5625-1.4209,3.1855Z"/>' },
        mcguffin: { kind: 'filled', vb: '0 0 64 64', src: 'mcguffin.svg', body: '<!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141) --> <path d="M46,21h-28c-.55,0-1,.45-1,1v6c0,.55.45,1,1,1h1v11c0,1.65,1.35,3,3,3h20c1.65,0,3-1.35,3-3v-11h1c.55,0,1-.45,1-1v-6c0-.55-.45-1-1-1ZM30,23h4v4h-4v-4ZM25,41h-3c-.55,0-1-.45-1-1v-11h4v12ZM19,27v-4h9v4h-9ZM37,41h-10v-12h10v12ZM43,40c0,.55-.45,1-1,1h-3v-12h4v11ZM45,27h-9v-4h9v4Z"/> <path d="M32,7c-5.234,0-10.246,1.603-14.491,4.637-.45.321-.554.945-.232,1.395.319.45.945.553,1.395.232,3.905-2.789,8.514-4.264,13.329-4.264,12.682,0,23,10.318,23,23s-10.318,23-23,23-23-10.318-23-23c0-4.815,1.475-9.424,4.264-13.329.321-.449.217-1.074-.232-1.395-.449-.322-1.075-.218-1.395.232-3.034,4.246-4.637,9.257-4.637,14.491,0,13.785,11.215,25,25,25s25-11.215,25-25S45.785,7,32,7Z"/> <path d="M18.708,15.745c-.539.441-1.062.915-1.556,1.408-.391.391-.391,1.023,0,1.414.387.387,1.029.385,1.414,0,.446-.446.92-.875,1.408-1.274.427-.35.49-.98.141-1.407-.35-.428-.979-.49-1.407-.141Z"/> <path d="M30.134,13.09c1.226-.12,2.489-.12,3.716-.001.548.06,1.039-.349,1.091-.899.053-.549-.349-1.038-.899-1.091-1.354-.131-2.75-.13-4.103.001-.55.054-.952.542-.898,1.092.05.517.485.903.994.903.032,0,.065-.001.098-.005Z"/> <path d="M40.924,15.224c.482.257,1.096.07,1.353-.412.26-.487.076-1.093-.412-1.353-1.208-.645-2.485-1.172-3.794-1.567-.526-.159-1.086.14-1.247.668-.16.529.14,1.087.668,1.247,1.184.357,2.338.834,3.431,1.417Z"/> <path d="M23.063,15.23c1.093-.584,2.247-1.062,3.43-1.419.529-.16.828-.718.667-1.247-.16-.529-.719-.829-1.247-.667-1.308.395-2.584.924-3.793,1.57-.88.47-.536,1.882.472,1.882.159,0,.32-.038.47-.118Z"/> <path d="M46.847,18.567c.391-.391.391-1.023,0-1.414-.493-.493-1.017-.967-1.556-1.408-.428-.349-1.058-.287-1.407.141-.35.427-.287,1.058.141,1.407.488.399.962.828,1.408,1.274.366.366,1.027.387,1.414,0Z"/> <path d="M45.433,45.433c-.446.446-.92.875-1.408,1.274-.691.565-.303,1.774.634,1.774.223,0,.447-.074.633-.226.539-.441,1.062-.915,1.556-1.408.391-.391.391-1.023,0-1.414s-1.023-.391-1.414,0Z"/> <path d="M23.076,48.776c-.488-.261-1.094-.076-1.353.412-.26.487-.076,1.093.412,1.353,1.208.644,2.485,1.172,3.794,1.567.499.151,1.088-.143,1.247-.668.16-.529-.14-1.087-.668-1.247-1.184-.357-2.338-.834-3.431-1.417Z"/> <path d="M40.937,48.77c-1.093.584-2.247,1.062-3.43,1.419-.529.16-.828.718-.668,1.246.158.522.727.825,1.247.668,1.308-.396,2.584-.924,3.793-1.57.487-.26.671-.866.411-1.353-.26-.487-.864-.67-1.353-.411Z"/> <path d="M30.149,50.911c-.551-.055-1.038.349-1.091.899-.053.549.349,1.038.899,1.091.674.065,1.362.099,2.043.099.688,0,1.38-.034,2.06-.1.55-.054.952-.542.898-1.092-.054-.549-.53-.952-1.092-.898-1.225.12-2.489.12-3.716.001Z"/> <path d="M18.708,48.255c.395.323,1.065.278,1.407-.141.35-.427.287-1.058-.141-1.407-.488-.399-.962-.828-1.408-1.274-.391-.391-1.023-.391-1.414,0s-.391,1.023,0,1.414c.493.493,1.017.967,1.556,1.408Z"/> <path d="M15.737,15.737c.391-.391.391-1.024,0-1.414s-1.024-.391-1.414,0c-.391.391-.391,1.024,0,1.414.391.391,1.024.391,1.414,0Z"/>' },
        // ⭐ v7.20.398 (Neil, on the "Both still right →" chip): "you can use a different check icon
        // there — one similar to the ones we use in the protocol progress sidebar."
        // This IS that tick, ported byte-for-byte rather than substituted with a lookalike: it is the
        // exact path the section-complete badge paints (the data-URI at wml-canvas.css ~6454, "the
        // house badge — green circle + white check", v7.20.89). So a confirm chip and a completed
        // section now show the SAME mark, which is the point — one gesture, one glyph.
        // ⚠️ The tight viewBox is the house geometry, not a mistake: the source draws only the tick,
        // with no 24-grid padding and no circle (the badge supplies its own). Normalising it to
        // 0 0 24 24 would render a tiny tick floating in space.
        // ⚠️ Was tabler-shield-check. `approval` has exactly TWO call sites — the frame's "Both still
        // right →" and the carry's "Use this →" — and both are the same confirm gesture, so changing
        // the icon here updates both by design. Nothing else consumes it (checked before editing).
        approval: { kind: 'filled', vb: '7.6 8.6 8.9 6.8', src: 'sophicly-house-check.svg', body: '<path d="M15.7071 9.29289C16.0976 9.68342 16.0976 10.3166 15.7071 10.7071L12.0243 14.3899C11.4586 14.9556 10.5414 14.9556 9.97568 14.3899L8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929C8.68342 10.9024 9.31658 10.9024 9.70711 11.2929L11 12.5858L14.2929 9.29289C14.6834 8.90237 15.3166 8.90237 15.7071 9.29289Z" />' },
        guide: { kind: 'filled', src: 'tabler-help-triangle.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm0 13.33a1 1 0 0 0 -.993 .883l-.007 .117l.007 .127a1 1 0 0 0 1.986 0l.007 -.117l-.007 -.127a1 1 0 0 0 -.993 -.883zm1.368 -6.673a2.98 2.98 0 0 0 -3.631 .728a1 1 0 0 0 1.44 1.383l.171 -.18a.98 .98 0 0 1 1.11 -.15a1 1 0 0 1 -.34 1.886l-.232 .012a1 1 0 0 0 .111 1.994a3 3 0 0 0 1.371 -5.673z" />' },
        spine: { kind: 'line', src: 'feather-layers.svg', body: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>' },
        // v7.20.535 (#396) — the plot panel's rail glyph. A CHECKLIST, deliberately distinct from
        // `outline` (the document-outline button, drawn as list-DETAILS): this panel's whole job is
        // which beats are written and which are still blank, and two near-identical list icons a
        // few pixels apart in the same rail is how a student presses the wrong one.
        plot: { kind: 'line', src: 'tabler-list-check-line.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3.5 5.5l1.5 1.5l2.5 -2.5" /><path d="M3.5 11.5l1.5 1.5l2.5 -2.5" /><path d="M3.5 17.5l1.5 1.5l2.5 -2.5" /><path d="M11 6l9 0" /><path d="M11 12l9 0" /><path d="M11 18l9 0" />' },
        outline: { kind: 'line', src: 'tabler-list-details-outline.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 5h8" /><path d="M13 9h5" /><path d="M13 15h8" /><path d="M13 19h5" /><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />' },
        resources: { kind: 'line', src: 'tabler-book-2.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z" /><path d="M19 16h-12a2 2 0 0 0 -2 2" /><path d="M9 8h6" />' },
        // v7.20.410 (FIXLIST #207) — the "come back to this" flag. Tabler `flag`, drawn on the
        // same 24 grid and the same `line` wrapper as guide/spine/outline/resources, because the
        // rail already speaks that language and a bespoke glyph here would be the odd one out.
        // NOT one of Neil's files: this control has no prototype, so there is nothing to port.
        // Swap it the moment he supplies one — it is one row (§17b: his asset wins).
        revisit: { kind: 'line', src: 'tabler-flag.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9z" /><path d="M5 21v-7" />' },
        // v7.20.493 (#365) — the My Values rail button (the student's own Step-7 audit). Same
        // 24 grid + `line` wrapper as revisit/spine, for the same reason: the rail speaks that
        // language. NOT one of Neil's files (no prototype for this control) — swap it the moment
        // he supplies one; it is one row (§17b: his asset wins).
        values: { kind: 'line', src: 'tabler-heart.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />' },
        // Already in the repo before this pass; both are currentColor-ready as shipped.
        examples: { kind: 'filled', src: 'tabler-bulb.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" /><path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z" /><path d="M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" /><path d="M4.893 4.893a1 1 0 0 1 1.32 -.083l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 0 -1.414z" /><path d="M17.693 4.893a1 1 0 0 1 1.497 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7z" /><path d="M14 18a1 1 0 0 1 1 1a3 3 0 0 1 -6 0a1 1 0 0 1 .883 -.993l.117 -.007h4z" /><path d="M12 6a6 6 0 0 1 3.6 10.8a1 1 0 0 1 -.471 .192l-.129 .008h-6a1 1 0 0 1 -.6 -.2a6 6 0 0 1 3.6 -10.8z" />' },
        // Neil's own file (2026-07-31). Drawn on a 512 grid, hence `vb` — see icon().
        rewrite: { kind: 'filled', vb: '0 0 512 512', src: 'rewrite-a-beat.svg', body: '<g><path d="m163.428 412.101v32.212c0 11.049 8.989 20.039 20.039 20.039h99.035c11.05 0 20.039-8.99 20.039-20.039v-32.212c0-11.049-8.989-20.039-20.039-20.039h-99.035c-11.05 0-20.039 8.989-20.039 20.039zm119.087 32.211s-.004 0-.013 0h-99.035v-32.212h99.035z"/><path d="m378.253 190.415c27.291-53.419 34.518-114.958 20.348-173.283-1.546-6.361-5.765-11.712-11.576-14.681-5.811-2.97-12.619-3.253-18.678-.779-55.573 22.687-101.209 64.604-128.504 118.028-27.684 54.185-34.656 115.601-20.067 174.353h-69.866c-11.304 0-20.501 9.197-20.501 20.501v29.86h-2.595c-11.304 0-20.501 9.197-20.501 20.501v126.585c0 11.304 9.197 20.501 20.501 20.501h212.343c11.304 0 20.501-9.197 20.501-20.501v-126.585c0-11.304-9.197-20.501-20.501-20.501h-2.595v-29.86c0-11.304-9.197-20.501-20.501-20.501h-36.68c42.12-23.99 76.417-59.688 98.872-103.638zm3.579-155.798c5.173 28.138 5.046 56.85-.221 84.674l-54.4 22.236zm-17.852-9.104-66.747 130.645c-.083.149-.158.303-.233.456l-13.564 26.549-16.977-69.955c23.305-38.001 57.191-68.5 97.521-87.695zm-111.634 114.51 17.11 70.504-33.21 65.003c-8.488-45.79-2.953-92.764 16.1-135.507zm64.176 174.53v29.86h-38.476c-5.533 0-10.02 4.486-10.02 10.02s4.486 10.02 10.02 10.02h61.11c.254 0 .462.207.462.462v126.585c0 .254-.207.461-.462.461h-212.343c-.254 0-.462-.207-.462-.461v-126.585c0-.254.207-.462.462-.462h60.853c5.533 0 10.02-4.486 10.02-10.02s-4.486-10.02-10.02-10.02h-38.219v-29.86c0-.254.207-.462.462-.462h166.151c.255 0 .462.208.462.462zm-62.436-29.895 34.878-68.266c.057-.109.115-.217.168-.329l24.102-47.174 62.478-25.538c-3.944 13.005-9.051 25.707-15.304 37.946-23.326 45.654-60.534 81.641-106.322 103.361z"/><circle cx="232.921" cy="354.433" r="10.02"/></g>' },
        // ⚠️ TWO FORCED CHANGES to this one, both stated (CLAUDE.md #13): his file paints via
        // a <defs><style> rule '.cls-1{stroke:#020202}'. (a) A HARDCODED colour cannot inherit,
        // so it would render near-black and vanish on the dark rail and the purple chips —
        // stroke is now currentColor, carried on the wrapper. (b) An inlined <style> puts
        // '.cls-1' into the GLOBAL stylesheet, where it collides with every other Illustrator
        // export using the same default class name — so the rule is dropped and its values ride
        // the svg element instead. The path geometry is untouched.
        components: { kind: 'lineSquare', src: 'puzzle-story-components.svg', body: '<path d="M9.7,5.88a1.87,1.87,0,0,0-.56,1.35,1.92,1.92,0,0,0,1.91,1.91H12V12H9.14V13a1.91,1.91,0,0,1-3.82,0V12H1.5V1.5H12V5.32h-.95A1.87,1.87,0,0,0,9.7,5.88Z"/><path d="M22.5,1.5V12H18.68v-.95a1.91,1.91,0,0,0-1.91-1.91,1.92,1.92,0,0,0-1.91,1.91V12H12V9.14h-.95A1.92,1.92,0,0,1,9.14,7.23a1.91,1.91,0,0,1,1.91-1.91H12V1.5Z"/><path d="M14.86,16.77A1.92,1.92,0,0,1,13,18.68H12V22.5H1.5V12H5.32V13a1.91,1.91,0,0,0,3.82,0V12H12v2.86H13A1.92,1.92,0,0,1,14.86,16.77Z"/><path d="M22.5,12V22.5H12V18.68H13a1.91,1.91,0,0,0,0-3.82H12V12h2.86v-.95a1.92,1.92,0,0,1,1.91-1.91,1.91,1.91,0,0,1,1.91,1.91V12Z"/>' },
        // ── PER-TECHNIQUE glyphs (Neil's own files, 2026-07-31). Keyed on the TABLE SYMBOL,
        // not the label: the symbol is what the deep-link already uses (SophiclyTable.open('Tn'))
        // and it cannot drift when a card is retitled. A technique with no row here keeps the
        // generic prefix — WML.techIcon() returns '' rather than warning, so adding an icon is
        // one row and adding none costs nothing.
        // Drawn on a 512 grid, solid black with no per-path fill, so it takes the wrapper's
        // currentColor exactly as exported. Geometry untouched.
        tech_Tn: { kind: 'filled', vb: '0 0 512.032 512.032', src: 'technique-tension.svg', body: '<g><path d="m494.812 367.504c-4.6-11.105-13.249-19.754-24.354-24.354-8.934-3.7-18.597-4.418-27.817-2.164-20.232-9.54-37.505-25.112-49.006-44.32l-23.143-38.655c6.949-16.16 7.647-34.99.399-52.487-14.244-34.387-53.809-50.774-88.193-36.531-10.591 4.387-19.684 11.237-26.683 19.921-6.998-8.684-16.091-15.534-26.683-19.921-34.384-14.243-73.949 2.144-88.193 36.531-7.247 17.497-6.55 36.327.4 52.487l-23.143 38.655c-11.5 19.208-28.774 34.78-49.005 44.32-9.22-2.254-18.883-1.536-27.817 2.164-11.105 4.6-19.754 13.249-24.354 24.354l-17.22 41.575 221.731 91.844 17.22-41.574c4.6-11.105 4.6-23.337 0-34.442-3.701-8.935-10.027-16.274-18.14-21.2-7.56-21.052-8.763-44.277-3.312-65.991l10.959-43.661c.291-.116.585-.218.874-.338 10.591-4.387 19.684-11.237 26.683-19.921 6.998 8.684 16.091 15.534 26.683 19.921.29.12.584.222.874.338l10.959 43.661c5.451 21.714 4.248 44.939-3.312 65.991-8.113 4.925-14.439 12.265-18.14 21.2-4.6 11.105-4.6 23.337 0 34.441l17.221 41.575 221.731-91.844zm-87.309-12.544-81.539 33.775c3.18-19.325 2.445-39.283-2.334-58.323l-8.009-31.91c6.362-.681 12.665-2.268 18.74-4.785 6.142-2.544 11.698-5.908 16.62-9.895l16.915 28.253c10.085 16.846 23.69 31.469 39.607 42.885zm-263.367-42.883 16.915-28.253c4.922 3.986 10.478 7.35 16.62 9.895 6.076 2.517 12.378 4.104 18.74 4.785l-8.009 31.909c-4.779 19.039-5.514 38.998-2.334 58.323l-81.539-33.775c15.917-11.417 29.522-26.04 39.607-42.884zm67.099 135.791-5.74 13.858-166.298-68.883 5.74-13.858c1.533-3.702 4.416-6.585 8.118-8.118 3.701-1.533 7.778-1.534 11.48 0l138.582 57.403c3.702 1.533 6.584 4.416 8.118 8.118 1.534 3.701 1.534 7.778 0 11.48zm26.912-202.161c-3.833 9.254-11.041 16.462-20.294 20.295-9.255 3.833-19.448 3.833-28.701 0-19.104-7.913-28.208-29.892-20.295-48.996 5.976-14.427 19.971-23.149 34.695-23.149 4.773 0 9.625.917 14.302 2.855 9.254 3.833 16.461 11.041 20.295 20.294 1.838 4.437 2.785 9.091 2.86 13.753-.004.399-.003.797 0 1.196-.076 4.661-1.023 9.314-2.862 13.752zm35.737 0c-1.838-4.438-2.785-9.091-2.86-13.754.004-.398.004-.796 0-1.194.075-4.662 1.022-9.316 2.86-13.754 3.833-9.254 11.041-16.461 20.295-20.294 4.678-1.938 9.528-2.855 14.302-2.855 14.722 0 28.719 8.724 34.694 23.149 7.913 19.104-1.191 41.083-20.295 48.996-9.254 3.833-19.447 3.833-28.701 0s-16.461-11.04-20.295-20.294zm32.653 216.019-5.741-13.858c-1.533-3.701-1.533-7.778 0-11.48 1.534-3.702 4.417-6.584 8.118-8.118l138.582-57.403c1.851-.767 3.795-1.15 5.74-1.15s3.89.383 5.741 1.15c3.702 1.533 6.584 4.417 8.118 8.118l5.74 13.858z"/><path d="m234.803 138.388 53.032-53.033-21.212-21.213 31.819-31.82-21.213-21.213-53.032 53.033 21.213 21.213-31.82 31.82z"/><path d="m142.516 80.122h30v60h-30z" transform="matrix(.866 -.5 .5 .866 -33.958 93.512)"/><path d="m324.516 95.122h60v30h-60z" transform="matrix(.5 -.866 .866 .5 81.888 362.08)"/></g>' },
        // ⚠️ ONE FORCED CHANGE, stated (CLAUDE.md #13): his Duality file is FULL COLOUR
        // (#b6dcfe / #dff0fe / #98ccfd fills, #4788c7 ink). A hardcoded palette cannot inherit,
        // which is the #88 landmine — it would sit unreadable on a purple chip and half-vanish in
        // the light theme. Mapped BY ROLE, geometry byte-identical: the three light tints become
        // currentColor at 0.3 (the shape fills), the blue becomes currentColor at full (the ink),
        // so the two overlapping forms still read as two rather than merging into one blob.
        tech_Dj: { kind: 'filled', vb: '0 0 40 40', src: 'technique-duality.svg', body: '<path fill="currentColor" opacity=".3" d="M18.072,28.5c-3.722,0-9.989-1.851-11.586-5.198L0.56,10.882c0.502-0.888,2.785-4.488,8.068-7.136 C12.333,1.89,15.469,1.5,17.447,1.5c0.762,0,1.315,0.06,1.608,0.102l5.923,12.413c2.013,4.219-2.182,12.859-4.729,14.134 C19.798,28.375,19.024,28.5,18.072,28.5z"/><path fill="currentColor" d="M17.448,2L17.448,2c0.545,0,0.977,0.032,1.274,0.064l5.805,12.166 c1.973,4.135-2.411,12.425-4.501,13.472C19.847,27.791,19.298,28,18.072,28c-3.671,0-9.682-1.869-11.135-4.913l-5.812-12.18 c0.674-1.109,2.93-4.31,7.726-6.713C12.47,2.381,15.524,2,17.448,2 M17.448,1C15.5,1,12.247,1.374,8.404,3.3 C2.12,6.449,0,10.869,0,10.869s3.914,8.204,6.035,12.648C7.717,27.044,14.168,29,18.072,29c1.015,0,1.859-0.133,2.401-0.404 c2.626-1.316,7.118-10.264,4.956-14.797c-2.163-4.533-6.035-12.648-6.035-12.648S18.684,1,17.448,1L17.448,1z"/><path fill="currentColor" opacity=".3" d="M1.126,10.907l5.812,12.18C8.39,26.131,14.401,28,18.072,28c1.135,0,1.685-0.177,1.903-0.275 L8.832,4.204C4.05,6.606,1.799,9.799,1.126,10.907z"/><path fill="currentColor" d="M6.271,15.003c0.154-0.604,0.522-1.382,1.397-1.82c0.35-0.176,0.719-0.265,1.096-0.265 c0.438,0,0.837,0.12,1.151,0.259L6.271,15.003z"/><path fill="currentColor" d="M7.97 13.593l-.111.056-.039.02c.024-.013.048-.026.073-.038C7.918 13.617 7.944 13.605 7.97 13.593M8.765 12.419c-.413 0-.86.087-1.321.317-1.857.931-1.783 3.132-1.783 3.132s1.682-.843 2.645-1.325c.962-.482 2.645-1.325 2.645-1.325S10.018 12.419 8.765 12.419L8.765 12.419zM12.494 22.503c-.036-1.549.36-4.018 2.946-5.368.808-.422 1.646-.636 2.49-.636 1.501 0 2.781.668 3.624 1.264-1.358.008-3.329.221-5.151 1.173C14.547 19.905 13.247 21.424 12.494 22.503z"/><path fill="currentColor" d="M17.93 17L17.93 17c.686 0 1.326.156 1.892.381-1.138.15-2.424.472-3.651 1.112-1.246.65-2.253 1.538-3.022 2.388.268-1.191.949-2.481 2.523-3.303C16.407 17.195 17.167 17 17.93 17M17.929 16c-.848 0-1.766.194-2.721.693C10.929 18.927 12.166 24 12.166 24s1.508-3.075 4.467-4.62c1.784-.931 3.732-1.116 4.997-1.116.833 0 1.37.08 1.37.08S20.881 16 17.929 16L17.929 16zM15.087 10.586c.154-.604.522-1.382 1.397-1.821.35-.175.719-.264 1.096-.264.439 0 .838.12 1.152.258L15.087 10.586z"/><path fill="currentColor" d="M16.786,9.176l-0.111,0.056l-0.039,0.02c0.024-0.013,0.048-0.026,0.073-0.038 C16.734,9.2,16.76,9.187,16.786,9.176 M17.581,8.001c-0.413,0-0.86,0.087-1.321,0.317c-1.857,0.931-1.783,3.132-1.783,3.132 s1.682-0.843,2.645-1.325C18.085,9.643,19.767,8.8,19.767,8.8S18.834,8.001,17.581,8.001L17.581,8.001z"/><path fill="currentColor" opacity=".3" d="M22.574,38.5c-0.489,0-0.903-0.053-1.197-0.153c-1.31-0.444-3.758-3.039-5.429-6.455 c-1.355-2.772-1.778-5.23-1.191-6.921l4.525-13.035C19.795,11.8,21.15,11.5,23.103,11.5c2.339,0,4.752,0.416,7.171,1.237 c5.76,1.955,8.537,5.212,9.167,6.036l-4.523,13.031C33.552,35.739,26.093,38.5,22.574,38.5z"/><path fill="currentColor" d="M23.104,12L23.104,12c2.284,0,4.642,0.407,7.01,1.211c5.211,1.768,7.927,4.639,8.765,5.659 l-4.433,12.771C33.248,35.09,26.302,38,22.574,38c-0.55,0-0.867-0.069-1.037-0.126c-1.22-0.414-3.577-3.005-5.14-6.201 c-1.278-2.613-1.703-4.996-1.168-6.538l4.436-12.778C20.275,12.215,21.471,12,23.104,12 M23.103,11 c-2.641,0-4.209,0.528-4.209,0.528s-2.99,8.613-4.61,13.279c-1.62,4.665,4.073,13.044,6.931,14.014 C21.572,38.942,22.034,39,22.574,39c3.786,0,11.371-2.867,12.817-7.032C37.042,27.21,40,18.69,40,18.69s-2.727-4.106-9.565-6.426 C27.545,11.283,25.036,11,23.103,11L23.103,11z"/><g><path fill="currentColor" opacity=".3" d="M23.104,12c-1.633,0-2.829,0.215-3.438,0.357l-4.436,12.778c-0.535,1.542-0.11,3.925,1.168,6.538 c1.563,3.196,3.919,5.787,5.14,6.201c0.002,0.001,0.005,0.001,0.007,0.002l8.563-24.667C27.742,12.407,25.385,12,23.104,12z"/></g><g><path fill="currentColor" d="M21.052,18.92c0.376-0.217,0.885-0.42,1.47-0.42c0.285,0,0.572,0.048,0.854,0.144 c0.953,0.323,1.429,1.051,1.663,1.628L21.052,18.92z"/><path fill="currentColor" d="M23.032,19.063c0.061,0.015,0.123,0.033,0.184,0.054c0.061,0.021,0.119,0.043,0.176,0.068 l-0.192-0.065L23.032,19.063 M22.522,18C21.029,18,20,19.091,20,19.091s1.831,0.621,2.878,0.977 c1.047,0.355,2.878,0.977,2.878,0.977s-0.199-2.188-2.22-2.874C23.181,18.05,22.841,18,22.522,18L22.522,18z"/></g><g><path fill="currentColor" d="M25.979,31.5c-0.631,0-1.289-0.118-1.955-0.351c-2.803-0.979-3.419-3.316-3.514-4.79 c0.819,0.878,2.212,2.074,4.186,2.763c1.347,0.471,2.807,0.709,4.338,0.709c0.286,0,0.55-0.008,0.786-0.022 C29.064,30.557,27.758,31.5,25.979,31.5L25.979,31.5z"/><path fill="currentColor" d="M21.281,27.76c0.832,0.679,1.916,1.368,3.251,1.835c1.208,0.422,2.502,0.664,3.853,0.723 C27.745,30.702,26.94,31,25.978,31c-0.575,0-1.177-0.108-1.79-0.322C22.455,30.072,21.646,28.882,21.281,27.76 M20.055,25 c0,0-0.809,5.011,3.804,6.622C24.623,31.889,25.331,32,25.978,32C29.241,32,31,29.177,31,29.177s-0.778,0.155-1.966,0.155 c-1.126,0-2.621-0.139-4.173-0.681C21.671,27.537,20.055,25,20.055,25L20.055,25z"/></g><g><path fill="currentColor" d="M29.902,22.253c0.376-0.217,0.885-0.419,1.469-0.419c0.285,0,0.573,0.048,0.854,0.144 c0.953,0.323,1.429,1.05,1.663,1.628L29.902,22.253z"/><path fill="currentColor" d="M31.881,22.397c0.061,0.015,0.123,0.033,0.184,0.054c0.061,0.021,0.119,0.043,0.176,0.068 l-0.192-0.065L31.881,22.397 M31.372,21.333c-1.493,0-2.522,1.091-2.522,1.091s1.831,0.621,2.878,0.977 c1.047,0.355,2.878,0.977,2.878,0.977s-0.199-2.188-2.22-2.874C32.03,21.383,31.691,21.333,31.372,21.333L31.372,21.333z"/></g>' },
        // Both of Neil's files are already monochrome with no per-path colour, so they take the
        // wrapper's currentColor exactly as exported — verbatim, no forced changes. (Cyclical
        // Structure carries fill="#000000" on the <svg> element only, which the wrapper replaces;
        // its paths inherit, so the geometry is untouched.)
        // v7.20.381 (Neil, #138). ZERO forced changes on both.
        // The Flaw declares no fills, so it takes the `filled` wrapper's currentColor as exported.
        tech_Fw: { kind: 'filled', vb: '0 0 114.23 140.16', src: 'technique-flaw.svg', body: '<g id="Layer_1-2"><g><path d="M57.11,140.16c-1.95,0-3.91-.62-5.54-1.86l-19.33-14.71C12.06,108.22,0,83.9,0,58.53V21.49c0-4.15,2.8-7.78,6.81-8.84L53.24,.45c2.26-.6,4.65-.6,6.92-.01l47.22,12.22c4.03,1.04,6.85,4.68,6.85,8.85v10.87c0,2.52-2.05,4.57-4.57,4.57s-4.57-2.05-4.57-4.57v-10.87L57.87,9.28c-.76-.2-1.55-.2-2.3,0L9.14,21.49V58.53c0,22.54,10.71,44.14,28.64,57.79l19.33,14.71,19.33-14.71c17.94-13.65,28.64-35.25,28.64-57.79v-10.57c0-2.52,2.05-4.57,4.57-4.57s4.57,2.05,4.57,4.57v10.57c0,25.38-12.06,49.7-32.25,65.06l-19.33,14.71c-1.63,1.24-3.58,1.86-5.53,1.86Z"/><path d="M57.11,118.37c-.97,0-1.95-.31-2.77-.93l-11.03-8.39c-14.98-11.4-25.04-32.78-25.04-53.21v-.95c0-2.52,2.05-4.57,4.57-4.57s4.57,2.05,4.57,4.57v.95c0,17.72,8.61,36.18,21.43,45.94l8.26,6.29,8.26-6.29c13.42-10.21,21.43-26.38,21.43-43.24v-22.87l-30.06-7.78-29.34,7.71v3.53c0,2.52-2.05,4.57-4.57,4.57s-4.57-2.05-4.57-4.57v-7.06c0-2.08,1.4-3.89,3.41-4.42l33.9-8.91c.76-.2,1.55-.2,2.31,0l34.64,8.97c2.02,.52,3.42,2.34,3.42,4.42v26.41c0,19.7-9.36,38.59-25.04,50.52l-11.03,8.39c-.82,.62-1.79,.93-2.77,.93Z"/><path d="M61.06,88.46h-7.89c-5.04,0-9.14-4.1-9.14-9.14v-2.8h-2.8c-5.04,0-9.14-4.1-9.14-9.14v-7.89c0-5.04,4.1-9.14,9.14-9.14h2.8v-2.8c0-5.04,4.1-9.14,9.14-9.14h7.89c5.04,0,9.14,4.1,9.14,9.14v2.8h2.8c5.04,0,9.14,4.1,9.14,9.14v7.89c0,5.04-4.1,9.14-9.14,9.14h-2.8v2.8c0,5.04-4.1,9.14-9.14,9.14Zm-19.82-28.96v7.89h7.37c2.52,0,4.57,2.05,4.57,4.57v7.37h7.89v-7.37c0-2.52,2.05-4.57,4.57-4.57h7.37v-7.89h-7.37c-2.52,0-4.57-2.05-4.57-4.57v-7.37h-7.89v7.37c0,2.52-2.05,4.57-4.57,4.57h-7.37Z"/></g></g>' },
        // Hamartia is a tabler-shaped stroke drawing on the same 24 grid the `line` wrapper is
        // built for, right down to the transparent 24×24 guard rect — so it needs nothing at all.
        tech_Hm: { kind: 'line', vb: '0 0 24 24', src: 'technique-hamartia.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /><path d="M9 10h.01" /><path d="M15 10h.01" /><path d="M9.5 15.05a3.5 3.5 0 0 1 5 0" />' },
        // v7.20.383 (Neil, Ghost.svg). ZERO forced changes: exported as tabler-FILLED on the 24 grid
        // with fill="currentColor" and no per-path colour, so it takes the `filled` wrapper exactly
        // as drawn, transparent guard rect included. Keyed on the TABLE SYMBOL (Gh), so retitling
        // the card can never orphan it. One of the 12 symbols that were falling back to 🗂.
        tech_Gh: { kind: 'filled', vb: '0 0 24 24', src: 'technique-ghost.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 1.999l.041 .002l.208 .003a8 8 0 0 1 7.747 7.747l.003 .248l.177 .006a3 3 0 0 1 2.819 2.819l.005 .176a3 3 0 0 1 -3 3l-.001 1.696l1.833 2.75a1 1 0 0 1 -.72 1.548l-.112 .006h-10c-3.445 .002 -6.327 -2.49 -6.901 -5.824l-.028 -.178l-.071 .001a3 3 0 0 1 -2.995 -2.824l-.005 -.175a3 3 0 0 1 3 -3l.004 -.25a8 8 0 0 1 7.996 -7.75zm0 10.001a2 2 0 0 0 -2 2a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1a2 2 0 0 0 -2 -2zm-1.99 -4l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm4 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" />' },
        // v7.20.380 (Neil, #137). ⚠️ ONE FORCED CHANGE, STATED (CLAUDE.md #13): the export paints
        // every path with GRADIENT fills (`fill="url(#…)"`, blue→purple stops). A gradient cannot
        // inherit `currentColor` at all — worse than the #88 flat-colour landmine — so the four
        // <linearGradient> defs are dropped and the paths take `currentColor`, mapped the same way
        // Duality and Protagonist were: the two inner shapes at .3 as a tint, the linework solid.
        // Geometry and path data verbatim.
        tech_Sk: { kind: 'filled', vb: '0 0 64 64', src: 'technique-stakes.svg', body: '<path fill="currentColor" opacity=".3" d="M36,24.828c0,2.09,1.527,3.953,3.605,4.152C41.992,29.211,44,27.34,44,25 c0-2.211-1.789-4-4-4h-0.172C37.715,21,36,22.715,36,24.828z"/><path fill="currentColor" opacity=".3" d="M20,24.828c0,2.09,1.527,3.953,3.605,4.152C25.992,29.211,28,27.34,28,25 c0-2.211-1.789-4-4-4h-0.172C21.715,21,20,22.715,20,24.828z"/><g><path fill="currentColor" d="M40,20h-0.172C37.164,20,35,22.164,35,24.828c0,2.645,1.98,4.906,4.512,5.148 c0.16,0.016,0.32,0.023,0.477,0.023c1.242,0,2.453-0.461,3.375-1.301C44.402,27.754,45,26.406,45,25C45,22.242,42.758,20,40,20z M42.02,27.219c-0.637,0.578-1.457,0.852-2.316,0.766C38.187,27.84,37,26.453,37,24.828C37,23.27,38.27,22,39.828,22H40 c1.652,0,3,1.348,3,3C43,25.844,42.641,26.652,42.02,27.219z"/><path fill="currentColor" d="M29,25c0-2.758-2.242-5-5-5h-0.172C21.164,20,19,22.164,19,24.828 c0,2.645,1.98,4.906,4.512,5.148c0.16,0.016,0.32,0.023,0.477,0.023c1.242,0,2.453-0.461,3.375-1.301 C28.402,27.754,29,26.406,29,25z M26.02,27.219c-0.637,0.578-1.457,0.852-2.316,0.766C22.187,27.84,21,26.453,21,24.828 C21,23.27,22.27,22,23.828,22H24c1.652,0,3,1.348,3,3C27,25.844,26.641,26.652,26.02,27.219z"/><path fill="currentColor" d="M32,6C19.318,6,9,16.318,9,29v8c0,2.757,2.243,5,5,5h2v9c0,3.86,3.14,7,7,7h18 c3.86,0,7-3.14,7-7v-9h2c2.757,0,5-2.243,5-5v-8C55,16.318,44.682,6,32,6z M41,56H23c-2.757,0-5-2.243-5-5v-9.004 c0.801,0,1.554,0.313,2.121,0.879c0.567,0.566,0.878,1.32,0.878,2.122L21,50c0,1.654,1.346,3,3,3c0.771,0,1.468-0.301,2-0.78 c0.532,0.48,1.229,0.78,2,0.78s1.468-0.301,2-0.78c0.532,0.48,1.229,0.78,2,0.78s1.468-0.301,2-0.78c0.532,0.48,1.229,0.78,2,0.78 s1.468-0.301,2-0.78c0.532,0.48,1.229,0.78,2,0.78c1.654,0,3-1.346,3-3l-0.001-4.997c0-0.801,0.313-1.554,0.879-2.121 c0.566-0.566,1.32-0.878,2.121-0.878h0h0V51C46,53.757,43.757,56,41,56z M50,40h-4.447v0.047c-1.165,0.103-2.252,0.583-3.089,1.42 c-0.945,0.944-1.465,2.199-1.465,3.535L41,50c0,0.551-0.449,1-1,1s-1-0.449-1-1v-2h-2v2c0,0.551-0.449,1-1,1s-1-0.449-1-1v-2h-2v2 c0,0.551-0.449,1-1,1s-1-0.449-1-1v-2h-2v2c0,0.551-0.449,1-1,1s-1-0.449-1-1v-2h-2v2c0,0.551-0.449,1-1,1s-1-0.449-1-1 l-0.001-5.003c0-1.335-0.52-2.591-1.464-3.536c-0.944-0.945-2.199-1.465-3.535-1.465l-1,0V40h-3c-1.654,0-3-1.346-3-3v-5.101 c2.279-0.465,4-2.484,4-4.899v-3h-2v3c0,1.302-0.839,2.402-2,2.816V29c0-11.58,9.42-21,21-21s21,9.42,21,21v0.816 c-1.161-0.414-2-1.514-2-2.816v-3h-2v3c0,2.414,1.721,4.434,4,4.899V37C53,38.654,51.654,40,50,40z"/><path fill="currentColor" d="M34.403,32.87c-0.546-0.73-1.444-1.166-2.403-1.166s-1.857,0.436-2.403,1.166L26.2,37.4 c-0.228,0.303-0.264,0.708-0.095,1.047S26.621,39,27,39h10c0.379,0,0.725-0.214,0.895-0.553s0.133-0.744-0.095-1.047L34.403,32.87z M29,37l2.198-2.931c0,0,0.001-0.001,0.001-0.001c0.34-0.455,1.259-0.457,1.602,0.001L35,37H29z"/></g>' },
        // v7.20.379 (Neil, #135). ZERO forced changes: the export declares no fills at all, so
        // every path inherits the `filled` wrapper's `currentColor` exactly as drawn.
        tech_Di: { kind: 'filled', vb: '0 0 512 512', src: 'technique-dramatic-irony.svg', body: '<g><g><path d="m502 107.59h-143.5c-7.183 0-14.286.596-21.251 1.763 7.286-15.891 11.083-33.169 11.083-51.014v-37.546c0-3.797-2.15-7.266-5.551-8.956-3.398-1.688-7.463-1.308-10.489.986l-37.655 28.539c-17.093 12.948-30.317 30.154-38.632 49.515-8.315-19.357-21.537-36.563-38.627-49.515l-37.67-28.54c-3.026-2.293-7.091-2.674-10.489-.984-3.4 1.689-5.55 5.159-5.55 8.955v37.546c0 17.813 3.787 35.066 11.056 50.936-6.808-1.111-13.75-1.685-20.774-1.685h-92.012v-35.953c0-17.077-13.893-30.97-30.97-30.97-16.881 0-30.969 14.09-30.969 30.97v398.6c0 17.077 13.893 30.97 30.97 30.97 16.787 0 30.97-14.183 30.97-30.97v-70.293c0-5.669-4.725-10.241-10.441-9.99-5.321.228-9.565 4.613-9.565 9.991 0 .125.002.25.007.374v69.918c0 5.844-5.126 10.97-10.97 10.97-6.049 0-10.97-4.921-10.97-10.97v-275.078c6.068 10.555 13.715 19.898 21.939 28.833v87.689c-.002.088-.004.176-.004.265 0 5.523 4.481 10 10.004 10s10-4.477 10-10v-69.116c33.1 26.914 74.636 41.901 118.041 41.901h10c18.386 0 34.721 10.679 45.193 19.643 11.334 9.687 28.61 9.244 39.559-.816 9.355-8.589 24.941-18.827 46.067-18.827h11.22c54.878 0 106.783-23.939 142.407-65.678l8.331-9.761c19.197-22.5 29.242-63.162 29.242-91.702 0-5.523-4.478-10-10-10zm-195.285-50.287 21.617-16.383v17.419c0 21.244-6.402 41.537-18.542 58.878-14.588 6.024-28.009 14.795-39.425 25.69l-4.359 4.161v-7.851c0-31.983 15.218-62.604 40.709-81.914zm-123.047 1.036v-17.424l21.63 16.388c25.49 19.318 40.708 49.939 40.708 81.913v7.5l-2.923-2.853c-11.79-11.502-25.786-20.72-41.048-26.925-12.025-17.276-18.367-37.472-18.367-58.599zm-160.467 5.548c2.082-2.077 4.841-3.22 7.769-3.22 6.049 0 10.97 4.921 10.97 10.97v35.953h-21.94v-35.953c0-2.927 1.144-5.686 3.201-7.75zm444.343 132.421-8.33 9.76c-31.818 37.28-78.179 58.662-127.194 58.662h-11.22c-24.959 0-43.763 10.743-55.985 20.937v-39.537c0-5.523-4.478-10-10-10s-10 4.477-10 10v40.268c-13.086-10.464-32.346-21.667-54.834-21.667h-10c-45.858 0-89.389-18.718-120.865-51.659-22.774-23.873-35.93-52.554-38.678-85.474l133.513-.007c27.864 0 55.215 11.136 75.157 30.589l19.91 19.42c3.798 3.702 10.05 3.746 13.893.079l21.272-20.305c19.892-19 46.809-29.783 74.317-29.783h133.115c-2.197 28.961-13.434 56.251-24.071 68.717z"/><path d="m221.472 204.048-27.582-24.48c-13.784-12.236-31.919-19.128-50.35-19.128h-58.58c-2.979 0-5.747 1.323-7.616 3.52-3.22 3.779-3.109 9.606.261 13.262l15.605 16.928 2.707 2.937c14.317 15.534 34.646 24.443 55.773 24.443h63.141c4.103 0 7.895-2.615 9.353-6.453 1.473-3.882.394-8.272-2.712-11.029zm-40.861-9.519 7.885 6.999h-36.807c-15.557 0-30.526-6.561-41.07-17.999l-2.843-3.084h35.759c13.561-.001 26.935 5.078 37.076 14.084z"/><path d="m318.111 179.567-27.583 24.481c-3.106 2.757-4.186 7.146-2.711 11.029 1.457 3.837 5.25 6.453 9.353 6.453h63.141c21.555 0 42.034-9.43 56.53-25.264l17.555-19.044c2.691-2.919 3.4-7.155 1.807-10.792-1.571-3.587-5.235-5.99-9.162-5.99h-58.58c-18.424 0-36.57 6.896-50.35 19.127zm50.354.877h35.759l-2.34 2.539c-10.572 11.666-25.803 18.545-41.573 18.545h-36.807l7.886-7c10.152-9.016 23.496-14.084 37.075-14.084z"/><path d="m60.25 350.39c-2.364-3.543-6.876-5.221-10.978-4.075-4.198 1.173-7.209 5.018-7.326 9.382-.24 8.905 11.043 13.63 17.215 7.166 3.22-3.374 3.628-8.585 1.089-12.473z"/></g></g>' },
        // v7.20.378 (Neil, #132). ⚠️ ONE FORCED CHANGE, STATED (CLAUDE.md #13): the export is
        // TWO-TONE with hardcoded fills (`.cls-1{fill:#fff}` body, `.cls-2{fill:#3b4652}` ink) and
        // a hardcoded palette cannot inherit `currentColor` (the #88 landmine) — on a purple chip
        // it would render as a white blob. Mapped exactly as Duality was (#114): the INK path is
        // solid `currentColor` because it carries the drawing, and the light body path is the same
        // colour at .3 so it reads as a tint behind it. Geometry, path data and `fill-rule:evenodd`
        // are verbatim; nothing else was touched.
        tech_Pr: { kind: 'filled', vb: '0 0 227.98 263.58', src: 'technique-protagonist.svg', body: '<path fill-rule="evenodd" opacity=".3" d="M181.17,65.79c1.83-6.57,2.16-17.39-1.67-22.98l-4.42-6.46,6.98,3.55c1.18.6,2.31,1.55,3.35,2.7C177.84,12.1,143.44,3.34,113.99,3.34c-11.45,0-27.67,1.86-37.46,8.23l-9.67,6.29,6.99-9.18c.82-1.07,1.07-2.7,1-4.31-4.5,4.12-10.36,6.79-9.64,14.08l.25,2.48c-3.27-.39-5.49-.82-8.68,1.65-.92.71-1.7,1.57-2.32,2.52,3.57-1.05,6.36-.75,9.99-.67l-3.18,3.29c-9.64,9.99-5.48,35.44-4.46,48.4l-1.83.29c-4.31.68-7.32,4.56-7.32,8.86,0,11.08,5.7,24.84,15.67,30.48,1.68.95,2.96.92,4.73.96,3.58,7.23,7.24,13.47,12.28,19.83l.68.85v18.08l-22.72,11.72h0s-2.47,1.32-2.47,1.32c-15.58,6.36-30.86,13.05-46.15,20.09-.7.32-.99.85-1.14,1.54-3.61,15.93-5.84,27.29-6.51,43.77-.05,1.16.83,2.06,2.13,2.06,53.33.02,78.58,22.36,132.98,14.27,18.4-2.73,36.26-8.53,54.9-11.62,10.61-1.76,21.21-2.66,31.97-2.66,1.15,0,1.91-.83,1.99-2.06-.3-7.44-.98-14.77-2.15-22.12-1.16-7.33-2.75-14.58-4.4-21.82-.14-.61-.54-1.11-1.11-1.38-15.27-7.04-30.56-13.72-46.12-20.08l-.71-.41-24.51-12.64v-18.08l.68-.85c5.04-6.36,8.69-12.6,12.28-19.83,1.77-.04,3.05,0,4.73-.96,9.97-5.65,15.67-19.41,15.67-30.48,0-4.3-3.02-8.19-7.33-8.86l-1.8-.28,1.43-22.2c3.3,3.77,6.49,7.05,8.53,11.86h0Z"/><path fill-rule="evenodd" d="M172.96,166.68c15.55,6.35,30.95,13.08,46.2,20.11,1.09.5,1.94,1.49,2.22,2.75,3.44,15.09,5.96,28.77,6.59,44.3.09,2.25-1.73,4.14-3.98,4.14-23.71,0-41.28,4.24-58.21,8.32-16.23,3.91-31.89,7.69-51.79,7.69s-35.56-3.78-51.79-7.69c-16.9-4.08-34.43-8.38-58.07-8.32-2.31,0-4.22-1.82-4.13-4.14.63-15.46,3.13-29.12,6.56-44.13.22-1.24,1.03-2.35,2.26-2.92,15.27-7.03,30.66-13.77,46.23-20.12l23.94-12.41v-16.16c-4.75-5.99-8.81-12.56-12.2-19.41-1.57-.03-3.09-.42-4.46-1.19-10.6-6.01-16.68-20.41-16.68-32.22,0-5.38,3.82-10.02,9.01-10.83-.95-12.09-5.11-37.46,5.16-48.1-2.58-.05-5.38.59-8.8,2.28.98-6.39,7.03-10.59,12.2-9.97-1.03-10.46,9.59-13.18,12.74-18.65,1.52,3.81.97,7.93-.52,9.89,8.77-5.71,23.66-8.56,38.56-8.56,33.47,0,72.99,11.27,74.87,51.38-1.26-3.98-4.44-9.38-7.71-11.04,3.6,5.25,5.5,18.95-.5,31.04.06-4.65-2.55-9.54-6.36-13.87-.34,4.81-.62,9.73-.98,15.59,5.2.81,9.02,5.45,9.02,10.83,0,11.82-6.08,26.22-16.68,32.22-1.37.78-2.89,1.16-4.46,1.19-3.39,6.84-7.46,13.42-12.21,19.41v16.16l23.97,12.42h0ZM59.1,81.71c-2.62-.26-5.46.86-5.46,3.56,0,7.58,2.92,15.8,8.03,21.48,3.31,3.68,6.36,5.18,11.25,6.27,3.1,6.61,7.21,13.61,12.11,19.83,7.94,10.08,15.6,17.13,28.96,17.13s21.02-7.05,28.96-17.13c4.9-6.22,9.02-13.22,12.11-19.83,4.84-1.08,7.93-2.57,11.25-6.27,5.11-5.68,8.03-13.89,8.03-21.48,0-2.51-2.46-3.66-4.91-3.59-5.27.35-6.16,8.38-6.9,13.27-.95.2-1.91.41-2.86.62,2.89-14.7,3.84-48.92-10.34-49.19-21.39-.41-45.82,10.24-70.69-7-12.51,9.1-13.86,39.87-10.4,56.18-.93-.2-1.87-.4-2.8-.61-.55-3.77-1.52-12.44-6.35-13.23h0ZM169.5,182.53c12.63,5.21,25.16,10.67,37.59,16.32,2.32,10.56,4.05,20.71,4.71,31.53,2.59-.16,5.25-.27,7.99-.32-.76-12.72-2.96-24.44-5.76-36.83-13.62-6.24-27.35-12.25-41.2-17.97-1.02,2.54-2.13,4.96-3.33,7.28h0ZM16.17,230.38c.66-10.81,2.39-20.97,4.71-31.53,12.43-5.65,24.97-11.11,37.59-16.32-1.2-2.31-2.31-4.74-3.33-7.28-13.85,5.72-27.58,11.73-41.2,17.97-2.8,12.39-5,24.12-5.76,36.83,2.75.05,5.41.16,8,.32h0ZM86.99,146.81v19.63c0,2.21-1.79,4-4,4s-4-1.79-4-4v-3.2l-16.64,8.58c8.65,21.91,27.23,38.73,51.64,38.73s42.99-16.82,51.64-38.73l-16.64-8.58v3.2c0,2.21-1.79,4-4,4s-4-1.79-4-4v-19.63c-8.29,7.71-15.34,11.17-27,11.17s-18.71-3.46-27-11.17h0Z"/>' },
        // In Medias Res is a STROKE drawing, so it rides the `line`
        // wrapper (fill:none + stroke:currentColor) rather than `filled`. ⚠️ ONE FORCED CHANGE,
        // STATED (CLAUDE.md #13): the export declares `stroke-width:4px` on a 131-unit grid and
        // the `line` wrapper sets 2, so the paths are wrapped in <g stroke-width="4"> to keep the
        // weight AS DRAWN — same reasoning as the `lineSquare` kind, which exists because Neil's
        // puzzle was drawn at 1.91. Geometry, caps and joins are verbatim; only the class-based
        // `stroke:#000` became `currentColor`, which a hardcoded colour cannot do (the #88 landmine).
        tech_Ir: { kind: 'line', vb: '0 0 130.93 140', src: 'technique-in-medias-res.svg', body: '<g stroke-width="4"><g id="Layer_2"><g id="VECTOR"><path d="M65.52,38.06s2.53,47.79-27.36,48.24c-15.94.24-28.55-10.51-28.55-10.51l-7.61,6.93c30.45,35.82,54.6,20.28,65,2.38"/><path d="M35.43,33.76s38.18-23.28,56,7.88c17.82,31.16,37.47,1.79,37.47,1.79"/><path d="M88.6,56l-7.14,17s20.23,5.42,24.54,25.24-14.9,39.76-14.9,39.76l-7.1-4.3s10.12-19.17,5.12-33.55c-2.56-7.23-13.69-11.09-22.12-15.05"/><ellipse cx="94.79" cy="14.9" rx="12.85" ry="12.9"/></g></g></g>' },
        tech_Cy: { kind: 'filled', vb: '0 0 26 26', src: 'technique-cyclical-structure.svg', body: '<path d="M 13.15625 0.03125 C 12.058594 0.0195313 10.925781 0.167969 9.84375 0.4375 C 9.308594 0.574219 8.988281 1.121094 9.125 1.65625 C 9.261719 2.191406 9.808594 2.511719 10.34375 2.375 C 13.773438 1.519531 17.394531 2.371094 20.1875 4.8125 L 18 7 L 24 7 L 24 1 L 21.625 3.375 C 19.207031 1.226563 16.203125 0.0664063 13.15625 0.03125 Z M 1 2 L 3.3125 4.3125 C 0.339844 7.632813 -0.589844 12.148438 0.4375 16.25 C 0.574219 16.785156 1.121094 17.105469 1.65625 16.96875 C 2.191406 16.832031 2.511719 16.285156 2.375 15.75 C 1.511719 12.300781 2.28125 8.546875 4.71875 5.75 L 7 8 L 7 2 Z M 24.4375 8.875 C 24.148438 8.917969 23.894531 9.082031 23.738281 9.328125 C 23.582031 9.574219 23.539063 9.878906 23.625 10.15625 C 24.496094 13.632813 23.707031 17.417969 21.21875 20.21875 L 19 18 L 19 24 L 25 24 L 22.625 21.625 C 25.644531 18.300781 26.59375 13.785156 25.5625 9.65625 C 25.457031 9.179688 25.019531 8.847656 24.53125 8.875 C 24.5 8.875 24.46875 8.875 24.4375 8.875 Z M 2 19 L 2 25 L 4.3125 22.6875 C 7.632813 25.660156 12.148438 26.589844 16.25 25.5625 C 16.785156 25.425781 17.105469 24.878906 16.96875 24.34375 C 16.832031 23.808594 16.285156 23.488281 15.75 23.625 C 12.300781 24.488281 8.546875 23.71875 5.75 21.28125 L 8 19 Z"/>' },
        tech_Sy: { kind: 'filled', vb: '0 0 32 32', src: 'technique-symbolism.svg', body: '<g id="swan"><path d="M30,10a6.16,6.16,0,0,0-4.8-6,6.09,6.09,0,0,0-6,2.38,1,1,0,0,0,1.6,1.2A3.94,3.94,0,0,1,28,9.49l-1.57,1-.5-1a1,1,0,0,0-1.34-.44l-.86.43a2.46,2.46,0,0,0-1.23,3c.2.58.39,1.18.59,1.78.49,1.55,1,3.14,1.39,4.72a6.3,6.3,0,0,1-.75,3.84,1,1,0,0,0,.4,1.36,1,1,0,0,0,1.36-.41,8,8,0,0,0,.92-5.32c-.44-1.6-.91-3.22-1.42-4.79-.19-.62-.39-1.22-.59-1.82a.46.46,0,0,1,.19-.54l.51,1,1,3.89a1,1,0,0,0,.55.67,1,1,0,0,0,.87,0l.67-.33a3.39,3.39,0,0,0,1.88-3V10h0Zm-2.36,4.47-.5-2,.86-.57v1.64A1.38,1.38,0,0,1,27.64,14.45Z"/><path d="M26,26H13.87a10.75,10.75,0,0,1-6.3-1.82,10.61,10.61,0,0,1-3.37-4l.67-.66a10.48,10.48,0,0,0,2.49,2.29A10,10,0,0,0,9.69,23a10.19,10.19,0,0,0,3.15.51,11.15,11.15,0,0,0,5.69-1.61,1,1,0,0,0-1.06-1.7,8.76,8.76,0,0,1-7.16.9,8.38,8.38,0,0,1-1.86-.89,9.15,9.15,0,0,1-3.22-3.78c.21-.13.41-.26.62-.37A14.81,14.81,0,0,1,7.3,15.3,16.47,16.47,0,0,1,10,14.7a16.22,16.22,0,0,1,7.13.58,15.69,15.69,0,0,1,3.38,1.57,1,1,0,0,0,1.3-.21,1,1,0,0,0,0-1.3A6.93,6.93,0,0,1,20,11,1,1,0,0,0,18,11a8.67,8.67,0,0,0,.48,2.62l-.78-.27a18.17,18.17,0,0,0-8-.67,19.42,19.42,0,0,0-3,.71,16.76,16.76,0,0,0-1.76.84,16.15,16.15,0,0,0-1.45.93,1,1,0,0,0-.37,1.13,10.65,10.65,0,0,0,.69,1.53L2.29,19.29a1,1,0,0,0-.21,1.1,12.57,12.57,0,0,0,4.35,5.43,2.82,2.82,0,0,0,.29.18H4a1,1,0,0,0,0,2H26a1,1,0,0,0,0-2Z"/></g>' },
        profile: { kind: 'line', src: 'tabler-user-circle.svg', body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />' },
        // v7.20.446 (#292, Neil supplied both files): the sidebar collapse / expand arrows. Saved on
        // receipt to frontend/icons/ (root CLAUDE.md §17b) and ported here BYTE-VERBATIM — they are
        // already a 24 grid at stroke-width 2 with round caps and joins, i.e. exactly the `line`
        // wrapper's own geometry, so there was nothing to adapt. `collapseLeft` is the arrow into a
        // wall at x=4 (collapse); `collapseRight` is the arrow into a wall at x=20 (expand).
        // ⭐⭐ v7.20.477 (#347d, Neil) — SPLIT INTO WALL + ARROW so the two can move independently.
        // The geometry is UNCHANGED, byte for byte: the same four subpaths, regrouped from one
        // `d` into two. `M4 4V20` / `M20 4V20` is the wall; the rest is the arrow flying at it.
        // Nothing renders differently at rest — this exists only so the hover micro-interaction
        // (wml-canvas.css, "THE HOVER IS THE ICON") can nudge the arrow toward the wall while the
        // wall holds its ground. A single path could not be animated in halves.
        // ⭐⭐ v7.20.478 (#347f, Neil) — THE WALL IS A CURVE THAT HAPPENS TO BE STRAIGHT.
        // `M4 4 Q4 12 4 20` renders PIXEL-IDENTICAL to `M4 4V20`: the quadratic's control point is
        // collinear with its endpoints, so the curve degenerates to the same segment. Nothing about
        // the supplied glyph changes at rest — this is the same line, expressed so that it CAN bend.
        // Why it has to be written this way: CSS can only transition `d` between paths with the
        // IDENTICAL command sequence. A `V` cannot morph into a `Q`, so the rest state must already
        // be the Q. See "THE WALL BENDS" in wml-canvas.css for the deflection arithmetic.
        // The barbs are separate paths so they can SPLAY about the arrow's tip on impact, which is
        // the reference's `--arrow-rotate: 45 → 70`. `.swml-ico-arrow` wraps nothing — the shaft and
        // both barbs carry it so one rule still moves the whole arrow, while the barbs can also
        // rotate about the tip (8,12) / (16,12) independently. Geometry unchanged: same four
        // subpaths, same coordinates, just addressable.
        collapseLeft:  { kind: 'line', src: 'Collapse Left.svg',
            body: '<path class="swml-ico-wall" d="M4 4 Q4 12 4 20" />'
                + '<path class="swml-ico-arrow swml-ico-shaft" d="M8 12H20" />'
                + '<path class="swml-ico-arrow swml-ico-barb swml-ico-barb--a" d="M8 12L12 8" />'
                + '<path class="swml-ico-arrow swml-ico-barb swml-ico-barb--b" d="M8 12L12 16" />' },
        collapseRight: { kind: 'line', src: 'Collapse Right.svg',
            body: '<path class="swml-ico-wall" d="M20 4 Q20 12 20 20" />'
                + '<path class="swml-ico-arrow swml-ico-shaft" d="M16 12H4" />'
                + '<path class="swml-ico-arrow swml-ico-barb swml-ico-barb--a" d="M16 12L12 8" />'
                + '<path class="swml-ico-arrow swml-ico-barb swml-ico-barb--b" d="M16 12L12 16" />' },
        // ⭐ v7.20.444 (#282, Neil): the ANIMATED Writer's-Profile glyph — `profile` above, rebuilt so
        // the reference micro-interaction can play on it. Ported from
        // `reference/animated-icons/Animated Profile Icon.html` (the CodePen dump Neil supplied),
        // `svg.user` at line 1036. The animation itself is CSS and lives in wml-canvas.css; this row
        // only supplies the four hooks it drives.
        //
        // ⚠️ A SEPARATE ROW ON PURPOSE. `profile` is also rendered by the Writer's Profile PANEL
        // HEADER at 12px (wml-assessment.js ~26647), where an eye that is 0.6 units across is mush.
        // Mutating the shared glyph would have changed that surface silently, so the rail gets its
        // own entry and `profile` is untouched.
        //
        // ⭐ WHY THE HEAD IS NOW FILLED WITH TWO HOLES, when the reference has a face and we do not.
        // The reference's "blink" is NOT a bar appearing — it is the EYES being covered for ~60ms by
        // a rect that shares the silhouette's fill. Our tabler head is a hollow outline circle with
        // no eyes, so there was literally nothing to blink: measured at the real 20px on a retina
        // render, an eye-bar or a head-flash bolted onto the outline glyph read as a glitch, not a
        // blink. Filling the head and cutting the eyes as HOLES reproduces the reference's own
        // mechanic, keeps the tabler line weight for the ring and shoulders, and the blink is
        // legible at rail size. At rest the eyes are SHUT, so the glyph reads as today's avatar;
        // they open on hover. That is the reference's rest state too.
        //
        // ⭐⭐ AND WHY THERE IS NO EYE-BAR RECT, unlike the reference. Porting its rect verbatim
        // produced a defect the reference cannot have: our icon paints in a SEMI-TRANSPARENT
        // currentColor (rgba(255,255,255,.55) at rest), so a bar overlapping the head composited
        // two 0.55 fills into ~0.8 and rendered as a visible lighter BAND across the face at rest —
        // observed in a retina render, not theorised. The reference's fills are fully opaque, so it
        // never meets this. The fix removes the overlap rather than papering over it: the eyes are
        // subpaths of the head, wound the same way as the disc, so `fill-rule` alone decides whether
        // they CUT (evenodd → eyes open) or MERGE (nonzero → eyes shut). One path, one fill, no
        // compositing, and it is correct at any colour or alpha. The blink therefore animates
        // `fill-rule` — see wml-canvas.css for the stop-for-stop mapping.
        // NOTE: no `fill-rule` attribute here on purpose — the CSS owns it, so the resting value
        // cannot disagree with the animated one.
        profileAnimated: {
            kind: 'line', src: 'tabler-user-circle.svg + Animated Profile Icon.html (svg.user)',
            body: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>'
                // The static ring — the reference's `circle.solid`. Dims on hover so the drawn ring reads.
                + '<path class="swml-wp-ring" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />'
                // The ring that DRAWS — the reference's `circle.animation`. `pathLength="200"` lets the
                // reference's literal dash values (1,200 → 200,0 with offset 2) apply verbatim to a
                // r=9 circle whose real circumference is 56.5. If an engine ignored pathLength the
                // dasharray still resolves to "hidden → fully drawn", so it degrades to a plain draw.
                + '<path class="swml-wp-ring-draw" pathLength="200" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />'
                // Head + eye holes. r 2.85 rather than the outline glyph's 3 so the filled disc carries
                // the same optical weight as the hollow one it replaces.
                // ⭐ v7.20.446 (#288): eyes r .6 → .8, offset 1.1 → 1.15. The rail icon dropped from
                // 20px to 14px in the same build (#289, the BRAND icon=button/2 rule), and Neil had
                // already said the blink was *"very small, but I can see it"* at 20px — so shrinking
                // the glyph without touching the eyes would have spent his one confirmed win to buy
                // a sizing correction. Rendered both at the real size and compared: at r .6 the
                // open/shut difference is marginal at 14px; at r .8 it reads as clearly as it did
                // before. The head stays 2.85 (a bigger head reads heavier in the rail), so the
                // change is confined to the two features that carry the effect.
                + '<path class="swml-wp-head" d="M12 10m-2.85 0a2.85 2.85 0 1 0 5.7 0a2.85 2.85 0 1 0 -5.7 0 M10.85 9.45m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0 -1.6 0 M13.15 9.45m-.8 0a.8 .8 0 1 0 1.6 0a.8 .8 0 1 0 -1.6 0" />'
                + '<path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />'
        },
        // v7.20.404 (Neil, #177 — Imagery.svg). ZERO forced changes: the export is a STROKE drawing
        // on the 24 grid with `stroke="currentColor"`, width 2, round caps and joins — i.e. exactly
        // what the `line` wrapper already emits, so it inherits as drawn. Keyed on the TABLE SYMBOL
        // (Im), like every other per-technique glyph, so retitling the card cannot orphan it.
        // This is one of the symbols that was falling back to the generic 🗂 — which is the emoji
        // Neil saw on the Imagery quick-action.
        tech_Im: { kind: 'line', vb: '0 0 24 24', src: 'neil-imagery.svg', body: '<path d="M3 16C4.40293 15.7662 6.63687 15.7073 8.94504 16.2427M8.94504 16.2427C11.5726 16.8522 14.2965 18.2317 16 21M8.94504 16.2427C10.8946 13.9852 14.5577 12 21 12H22M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM8.5 7C8 7 7 7.3 7 8.5C7 9.7 8 10 8.5 10C9 10 10 9.7 10 8.5C10 7.3 9 7 8.5 7Z" />' },
        // v7.20.406 (Neil, #199 — Rising Action.svg, his own file). A FILLED drawing (the export
        // sets `stroke-width:0`), so it rides the `filled` wrapper, not `line`. Path data and the
        // 24 grid are VERBATIM — the flame is his, nothing redrawn. Keyed on the TABLE SYMBOL (Ra),
        // like every other per-technique glyph, so retitling the card cannot orphan it. Ra is one
        // of the symbols that was falling back to the generic 🗂 — that is the emoji he saw on the
        // Rising Action quick-action. It appears on 5 beat rows across the archetypes.
        // ⚠️ ONE FORCED CHANGE, STATED (CLAUDE.md #13), identical to the arrows below: his export
        // paints through `<defs><style>.cls-1{fill:#000}</style></defs>`. A hardcoded black cannot
        // inherit, so it would sit invisible on the dark rail and on the purple chips (#88/#114),
        // and an inlined `<style>` puts `.cls-1` into the GLOBAL stylesheet where it collides with
        // every other Illustrator export using that default class name. The rule is dropped and the
        // path takes the wrapper's currentColor.
        tech_Ra: { kind: 'filled', vb: '0 0 24 24', src: 'neil-rising-action.svg', body: '<path d="M19.98,12.82c-.17-1.81-.69-3.51-1.54-5.06-1.5-2.73-3.65-4.33-5.19-5.2-.19-.11-.43-.08-.59.07-.16.15-.2.39-.11.58.12.25,1.14,2.48.01,4.54-.25.46-.58.87-.98,1.22-.11.1-.26.14-.41.11-.15-.03-.28-.13-.35-.26-.15-.3-.26-.61-.33-.93-.13-.58-.13-1.2,0-1.78.04-.18-.02-.37-.17-.49-.14-.12-.34-.15-.51-.08-.88.36-3.85,1.81-5.27,5.27l-.04.11c-.86,2.16-.68,4.58.49,6.64,1.16,2.05,3.14,3.44,5.42,3.81.53.09,1.07.13,1.6.13.58,0,1.11-.06,1.46-.12,4.05-.62,6.91-4.38,6.52-8.56ZM13.31,20.39c-.61.09-1.78.15-2.75-.01-.79-.13-1.54-.41-2.22-.8-.34-.57-.75-1.47-.83-2.62-.09-1.19.19-2.19.51-2.91.47.8,1.01,1.56,1.61,2.27.62.74,1.32,1.44,2.06,2.06.14.12.34.15.52.08.17-.07.29-.24.31-.42.05-.69.26-1.72.92-2.77.38-.6.87-1.13,1.44-1.56.28.46.5.95.66,1.45.57,1.74.37,3.35.07,4.42-.69.4-1.46.68-2.29.81ZM16.8,18.7c.15-1.09.15-2.43-.32-3.86-.25-.75-.61-1.47-1.06-2.13-.15-.22-.45-.28-.68-.14-.86.55-1.61,1.29-2.15,2.15-.51.8-.79,1.6-.94,2.28-.45-.42-.87-.87-1.26-1.33-.75-.89-1.4-1.87-1.94-2.91-.08-.16-.24-.26-.42-.27-.18-.02-.35.08-.44.23-.47.75-1.23,2.3-1.07,4.3.03.45.12.86.22,1.24-.33-.37-.62-.77-.88-1.22-1.02-1.79-1.17-3.9-.43-5.78l.04-.1c.98-2.39,2.79-3.71,3.93-4.34-.01.42.03.85.12,1.26.09.4.23.79.41,1.16.21.42.59.71,1.05.8.46.09.92-.03,1.26-.34.49-.43.9-.94,1.2-1.5.81-1.48.73-2.99.49-4.06,1.23.87,2.6,2.18,3.64,4.06.79,1.43,1.27,3,1.42,4.67.21,2.25-.66,4.37-2.19,5.78Z"/>' },
        // v7.20.409 (Neil, 2026-08-03 — Exposition.svg / Setting.svg / Theme.svg / Theme Stated.svg,
        // his own files, saved to frontend/icons/ on receipt per root CLAUDE.md §17b). ⭐ ZERO FORCED
        // CHANGES on all four: every export is a FILLED drawing with no per-path fill, no stroke and
        // no <defs><style> rule, so each takes the wrapper's currentColor exactly as drawn — unlike
        // Duality/Rising Action/the arrows, nothing had to be dropped. Path data and each file's own
        // grid (64 / 512 / 48 / 48) are verbatim, hence the per-row `vb`.
        // Keyed on the TABLE SYMBOL like every other per-technique glyph, so retitling a card cannot
        // orphan them. THESE FOUR ARE THE SYMBOLS NEIL NAMED: Xp/Se rendered with NO glyph at all in
        // the Examples panel ("exposition and setting don't have an icon"), and Th/Tz were falling
        // back to the generic 🗂 on the chat quick-actions ("theme stated and theme currently use
        // emojis") — the fallback at wml-assessment.js:22572 is `techIcon(t.s) ? '' : '🗂 '`, so
        // registering the row removes the emoji and fills the blank in one change.
        tech_Xp: { kind: 'filled', vb: '0 0 64 64', src: 'Exposition.svg', body: '<g><g id="Outline"><g><path d="M56,7H8c-.54999,0-1,.45001-1,1v48c0,.54999.45001,1,1,1h4c.08002,0,.15997-.01001.23999-.03003l16-4c.45001-.10999.76001-.51001.76001-.96997V18c0-.42004-.26001-.79004-.65002-.94l-10.82996-4.06h28.95996l-10.82996,4.06c-.39001.14996-.65002.51996-.65002.94v34c0,.45996.31.85999.76001.96997l16,4c.08002.02002.15997.03003.23999.03003h4c.54999,0,1-.45001,1-1V8c0-.54999-.45001-1-1-1ZM27,18.69v32.52997l-14,3.5V13.44l14,5.25ZM51,54.71997l-14-3.5V18.69l14-5.25v41.27997ZM55,55h-2s0-43,0-43.00003c-.00002-.51336-.43878-.98996-.96002-.98996-.01996,0-.02997-.01001-.03998-.01001H12c-.00942,0-.01883.00886-.03653.00991-.52225.03102-.96347.45391-.96347.99009v43h-2V9h46v46Z"/><path d="M42,31c-1.6543,0-3,1.3457-3,3s1.3457,3,3,3,3-1.3457,3-3-1.3457-3-3-3ZM42,35c-.55176,0-1-.44873-1-1s.44824-1,1-1,1,.44873,1,1-.44824,1-1,1Z"/><path d="M22,31c-1.6543,0-3,1.3457-3,3s1.3457,3,3,3,3-1.3457,3-3-1.3457-3-3-3ZM22,35c-.55176,0-1-.44873-1-1s.44824-1,1-1,1,.44873,1,1-.44824,1-1,1Z"/><path d="M48.56934,17.17822c-.26758-.18652-.6123-.22998-.9209-.11475l-8,3c-.38965.14648-.64844.51953-.64844.93652v6c0,.50439.37598.92969.87598.99219l8,1c.04098.00537.08294.00781.12393.00781.54737.00005,1.00009-.45232,1.00009-1v-10c0-.32812-.16113-.63525-.43066-.82178ZM47,26.86719l-6-.75v-4.42432l6-2.25v7.42432Z"/><path d="M16,29c.04102,0,.08301-.00244.12402-.00781l8-1c.5-.0625.87598-.48779.87598-.99219v-6c0-.41699-.25879-.79004-.64844-.93652l-8-3c-.30859-.11523-.65234-.07178-.9209.11475-.26953.18652-.43066.49365-.43066.82178v9.99996c0,.54713.454,1.00004,1,1.00004ZM17,19.44287l6,2.25v4.42432l-6,.75v-7.42432Z"/></g></g></g>' },
        tech_Se: { kind: 'filled', vb: '0 0 512 512', src: 'Setting.svg', body: '<g><path d="m202.509 292.272-2.449-2.121c-4.189-3.629-10.524-3.174-14.151 1.015-3.628 4.187-3.173 10.523 1.014 14.15l2.449 2.121c1.898 1.644 4.236 2.449 6.564 2.449 2.81 0 5.603-1.174 7.587-3.464 3.628-4.187 3.174-10.522-1.014-14.15z"/><path d="m169.451 263.64-2.449-2.121c-4.188-3.628-10.523-3.173-14.151 1.015-3.628 4.187-3.173 10.523 1.014 14.15l2.449 2.121c1.898 1.644 4.236 2.449 6.564 2.449 2.81 0 5.603-1.174 7.587-3.464 3.628-4.187 3.173-10.522-1.014-14.15z"/><path d="m136.391 235.007-2.449-2.121c-4.188-3.626-10.524-3.172-14.151 1.016-3.627 4.189-3.172 10.525 1.016 14.151l2.449 2.121c1.898 1.643 4.236 2.448 6.563 2.448 2.81 0 5.604-1.174 7.588-3.464 3.627-4.189 3.172-10.524-1.016-14.151z"/><path d="m103.333 206.376-2.449-2.121c-4.189-3.629-10.524-3.174-14.151 1.015-3.628 4.187-3.173 10.523 1.014 14.15l2.449 2.121c1.898 1.644 4.236 2.449 6.564 2.449 2.81 0 5.603-1.174 7.587-3.464 3.628-4.187 3.174-10.522-1.014-14.15z"/><path d="m235.568 320.904-2.449-2.121c-4.189-3.628-10.524-3.173-14.151 1.015-3.628 4.187-3.173 10.523 1.014 14.15l2.449 2.121c1.898 1.644 4.236 2.449 6.564 2.449 2.809 0 5.603-1.174 7.587-3.464 3.628-4.187 3.174-10.523-1.014-14.15z"/><path d="m293.724 340.149c-3.918-3.917-10.27-3.917-14.188 0l-5.092 5.092-5.092-5.092c-3.918-3.917-10.27-3.917-14.188 0-3.917 3.918-3.917 10.27 0 14.188l5.092 5.092-5.092 5.092c-3.917 3.918-3.917 10.27 0 14.188 1.959 1.958 4.527 2.938 7.094 2.938s5.135-.98 7.094-2.938l5.092-5.092 5.092 5.092c1.959 1.958 4.527 2.938 7.094 2.938s5.135-.98 7.094-2.938c3.917-3.918 3.917-10.27 0-14.188l-5.092-5.092 5.092-5.092c3.918-3.918 3.918-10.27 0-14.188z"/><path d="m462.762 63.907h-21.041c-11.063 0-20.064 9-20.064 20.064v30.367h-65.745c-3.287 0-6.365 1.61-8.24 4.31l-19.316 27.813-30.057-29.276c-1.873-1.825-4.385-2.846-7-2.846h-271.235c-11.063 0-20.064 9-20.064 20.064l.004 166.814c0 5.541 4.492 10.032 10.032 10.032s10.031-4.492 10.031-10.032l-.001-32.532h45.428c2.892 0 5.558 1.69 6.794 4.304l17.442 36.918c2.405 5.092 6.252 9.274 11.125 12.092l35.969 20.808c2.313 1.338 3.751 3.83 3.751 6.503v78.72l-120.509-.001.002-36.865c0-5.541-4.491-10.033-10.031-10.033-5.54 0-10.031 4.491-10.032 10.031l-.002 36.865c0 5.36 2.086 10.398 5.876 14.189 3.789 3.789 8.828 5.877 14.188 5.877l447.898.002c24.283 0 44.038-19.755 44.038-44.038v-290.91c-.003-27.152-22.091-49.24-49.241-49.24zm-139.921 105.188c2.113 2.057 5.024 3.089 7.959 2.8 2.936-.282 5.598-1.841 7.28-4.264l23.079-33.23h60.499v162.331h-112.307c-1.742 0-3.463-.458-4.977-1.323l-37.625-21.5c-3.117-1.781-5.054-5.119-5.054-8.709v-56.651c0-16.595-13.501-30.095-30.095-30.095h-39.348c-5.532 0-10.032-4.501-10.032-10.032v-34.021h105.002zm145.121 258.935-307.324-.001v-78.72c0-9.811-5.276-18.958-13.768-23.871l-35.969-20.808c-1.327-.767-2.375-1.906-3.03-3.294l-17.442-36.92c-4.534-9.596-14.322-15.796-24.934-15.796h-45.429l-.003-114.219h142.092v34.021c0 16.595 13.501 30.095 30.095 30.095h39.348c5.532 0 10.032 4.501 10.032 10.032v56.651c0 10.773 5.81 20.786 15.164 26.13l37.625 21.5c4.541 2.594 9.704 3.966 14.931 3.966h112.306v43.221c0 11.063 9.001 20.064 20.064 20.064h26.241c13.22 0 23.975 10.755 23.975 23.974 0 13.22-10.754 23.975-23.974 23.975zm23.974-60.901c-6.903-4.497-15.14-7.112-23.975-7.112h-26.241v-276.047h21.041c16.087 0 29.175 13.087 29.175 29.175z"/><circle cx="10.032" cy="346.19" r="10.032"/></g>' },
        tech_Th: { kind: 'filled', vb: '0 0 48 48', src: 'Theme.svg', body: '<path d="M42,34.9989h-1v-5c0-.33002-.16998-.64001-.44-.83002-.27002-.17999-.62-.21997-.92999-.09998l-.41998.16998c-2.71002,1.08002-5.67004,1.04999-8.35004-.09998-1.84998-.79004-4-.54004-5.59998.66998-.5.37-.91998.82001-1.26001,1.32001-.34003-.5-.76001-.95001-1.25-1.32001-1.60999-1.21002-3.76001-1.46002-5.60999-.66998-2.67999,1.14996-5.64001,1.17999-8.35004.09998l-.41998-.16998c-.31-.12-.65997-.08002-.92999.09998-.27002.19-.44.5-.44.83002v5h-1c-.54999,0-1,.45001-1,1v2c0,1.64996,1.34998,3,3,3h12.40997c.76001,1.23999,2.10004,2,3.59003,2,1.5,0,2.84998-.76001,3.59998-2h12.40002c1.65002,0,3-1.35004,3-3v-2c0-.54999-.45001-1-1-1ZM9,31.4389c2.94.90997,6.07001.76001,8.92999-.46002,1.19-.52002,2.58002-.34998,3.60999.42999.92004.67999,1.46002,1.77002,1.46002,2.91003v.67999h-14v-3.56ZM41,37.9989c0,.54999-.45001,1-1,1h-13c-.37,0-.71002.20996-.88.52997l-.13.23999c-.37.76001-1.13,1.23004-1.98999,1.23004s-1.62-.47003-2-1.26001l-.12-.21002c-.16998-.32001-.51001-.52997-.88-.52997h-13c-.54999,0-1-.45001-1-1v-1h21c.54999,0,1-.45001,1-1s-.45001-1-1-1h-3v-.67999c0-1.14001.53998-2.23004,1.46002-2.91003,1.02997-.77997,2.41998-.95001,3.60999-.42999,2.85999,1.22003,5.98999,1.37,8.92999.46002v3.56h-3c-.54999,0-1,.45001-1,1s.45001,1,1,1h5v1Z"/><path d="M19,21.9989c0,.26514.10547.51953.29297.70703s.44238.29297.70703.29297c0,2.20557,1.79395,4,4,4s4-1.79443,4-4v-.00195c.55273,0,1-.44775,1-1,0-1.53076.48242-3.00342,1.35742-4.146,1.07422-1.4043,1.64258-3.08203,1.64258-4.85205,0-2.39795-1.0625-4.64844-2.91406-6.17529-1.85059-1.52637-4.28906-2.13525-6.68066-1.66943-3.15918.61328-5.67676,3.15479-6.26465,6.32373-.41113,2.22021.08301,4.43066,1.39062,6.22363.96094,1.31738,1.46875,2.80322,1.46875,4.29736ZM26,22.9989c0,1.10303-.89746,2-2,2s-2-.89697-2-2v-.00049l1.99518-.00049c.00171,0,.00311.00098.00482.00098s.00311-.00098.00482-.00098l1.99518-.00049v.00146ZM18.10742,11.84265c.43945-2.36816,2.31933-4.26708,4.6787-4.72558,3.65074-.70946,7.21388,2.14896,7.21388,5.88183,0,1.32666-.42578,2.58398-1.23047,3.63623-.94629,1.23535-1.54004,2.75684-1.71484,4.36377h-2.05469v-4.14197c1.72052-.4472,3-1.99969,3-3.85803,0-.55225-.44727-1-1-1s-1,.44775-1,1c0,1.10303-.89746,2-2,2s-2-.89697-2-2c0-.55225-.44727-1-1-1s-1,.44775-1,1c0,1.85834,1.27948,3.41083,3,3.85803v4.14197h-2.05762c-.18262-1.57324-.79395-3.10352-1.7959-4.47607-.98047-1.34424-1.34961-3.00635-1.03906-4.68018Z"/><path d="M35,11.9989c-.55273,0-1,.44775-1,1s.44727,1,1,1h2c.55273,0,1-.44775,1-1s-.44727-1-1-1h-2Z"/><path d="M34.16309,9.78991c.12793,0,.25781-.0249.38281-.07666l1.84766-.76562c.50977-.21143.75195-.79639.54102-1.30664-.21094-.51123-.79785-.75049-1.30664-.54102l-1.84765.76562c-.97362.40344-.68005,1.92432.38281,1.92432Z"/><path d="M33.78027,18.1322l1.84765.76562c.48937.20278,1.09579-.03068,1.30665-.54101.21094-.51025-.03125-1.09521-.54102-1.30664l-1.84766-.76562c-.50781-.20947-1.0957.02979-1.30664.54102-.21094.51025.03125,1.09521.54102,1.30664Z"/><path d="M11,13.9989h2c.55273,0,1-.44775,1-1s-.44727-1-1-1h-2c-.55273,0-1,.44775-1,1s.44727,1,1,1Z"/><path d="M11.60645,8.94763l1.84765.76562c.48789.20217,1.09729-.03432,1.30664-.54101.21094-.51025-.03125-1.09521-.54102-1.30664l-1.84766-.76562c-.50781-.20996-1.0957.02979-1.30664.54102-.21094.51025.03125,1.09521.54102,1.30664Z"/><path d="M13.4541,16.28454l-1.84766.76562c-.50975.21142-.75194.79635-.54104,1.30659.2079.50298.8055.74858,1.30666.54107l1.84766-.76562c.50977-.21143.75195-.79639.54102-1.30664-.21094-.51074-.79785-.75-1.30664-.54102Z"/><path d="M31.29291,35.29181c-.39056.3905-.39056,1.02368,0,1.41418.3905.3905,1.02368.3905,1.41418,0,.39056-.3905.39056-1.02368,0-1.41418-.3905-.39056-1.02368-.39056-1.41418,0Z"/>' },
        tech_Tz: { kind: 'filled', vb: '0 0 48 48', src: 'Theme Stated.svg', body: '<path d="M42.74221,31.40972c-.71924-1.47607-2.4751-2.22461-4.10986-1.61865l-9.71545,3.6424c-.03522-1.89948-1.58582-3.43585-3.49353-3.43585h-5.37695l-3.88037-.97021c-.07959-.01953-.16113-.02979-.24268-.02979h-3c0-.55225-.44775-1-1-1h-6c-.55225,0-1,.44775-1,1v2c0,.55225.44775,1,1,1s1-.44775,1-1v-1h4v10h-4v-1c0-.55225-.44775-1-1-1s-1,.44775-1,1v2c0,.55225.44775,1,1,1h6c.55225,0,1-.44775,1-1h.87695l6.81201,1.70312c.78906.19678,1.60059.29688,2.4126.29688,1.40039,0,2.75928-.28857,4.03955-.85693l14.06884-6.25097c1.67267-.74319,2.43308-2.84564,1.60889-4.47998ZM41.00548,33.30389c-.11401.32689-.35377.60918-.68856.75964l-14.06494,6.24902c-1.61523.71826-3.4375.87646-5.15479.44775l-6.93115-1.73291c-.07959-.01953-.16113-.02979-.24268-.02979h-1v-8h2.87695l3.88037.97021c.07959.01953.16113.02979.24268.02979h5.5c.82715,0,1.5.67285,1.5,1.5s-.67285,1.5-1.5,1.5h-5.5c-.55225,0-1,.44775-1,1s.44775,1,1,1h5.5c.98987,0,1.88068-.41711,2.51794-1.08008.02765-.00769.05573-.00299.08313-.01318l11.30661-4.23925c.99781-.37411,2.032.6136,1.67443,1.63879Z"/><path d="M29.01339,6.81761c-1.85004-1.52002-4.29004-2.13-6.69-1.66003-3.15002.60999-5.67004,3.15002-6.26001,6.32001-.41003,2.22003.07996,4.42999,1.39001,6.22003.95996,1.31995,1.46997,2.81,1.46997,4.29999,0,.26996.10999.51996.28998.70996.19.18005.44.29004.71002.29004,0,2.20996,1.78998,4,4,4s4-1.79004,4-4c.54999,0,1-.45001,1-1,0-1.53003.47998-3,1.35999-4.15002,1.07001-1.39996,1.64001-3.08002,1.64001-4.84998,0-2.40002-1.06-4.65002-2.90997-6.17999ZM23.92337,24.99761c-1.09998,0-2-.90002-2-2h4c0,1.09998-.90002,2-2,2ZM28.69339,16.63762c-.95001,1.22998-1.54004,2.75-1.72003,4.35999h-2.04999v-4.14001c1.71997-.45001,3-2,3-3.85999,0-.54999-.45001-1-1-1s-1,.45001-1,1c0,1.09998-.90002,2-2,2s-2-.90002-2-2c0-.54999-.45001-1-1-1s-1,.45001-1,1c0,1.85999,1.28003,3.40997,3,3.85999v4.14001h-2.06c-.17999-1.57001-.78998-3.10004-1.78998-4.48004-.98004-1.33997-1.35004-3-1.04004-4.67999.44-2.35999,2.32001-4.26001,4.67999-4.71997,1.80005-.35004,3.63.09998,5.02002,1.25,1.39001,1.14001,2.19,2.83002,2.19,4.63,0,1.32996-.42999,2.57996-1.22998,3.64001Z"/><path d="M34.92337,11.99761c-.55225,0-1,.44775-1,1s.44775,1,1,1h2c.55225,0,1-.44775,1-1s-.44775-1-1-1h-2Z"/><path d="M34.08645,9.78862c.12744,0,.25732-.0249.38232-.07666l1.84766-.76562c.51025-.21143.75244-.79639.54102-1.30664-.21191-.51025-.79639-.75195-1.30664-.54102l-1.84765.76562c-.97918.40575-.68628,1.92432.38329,1.92432Z"/><path d="M33.70315,18.13091s1.84766.76562,1.84767.76563c.50546.20928,1.09774-.03704,1.30662-.54102.21143-.51025-.03076-1.09521-.54102-1.30664l-1.84766-.76562c-.50977-.21289-1.09521.03076-1.30664.54102s.03076,1.09521.54102,1.30664Z"/><path d="M10.92337,13.99761h2c.55225,0,1-.44775,1-1s-.44775-1-1-1h-2c-.55225,0-1,.44775-1,1s.44775,1,1,1Z"/><path d="M11.5303,8.94634l1.84765.76562c.48997.20303,1.09578-.03223,1.30664-.54101.21143-.51025-.03076-1.09521-.54102-1.30664l-1.84766-.76562c-.51074-.21094-1.0957.03076-1.30664.54102-.21143.51025.03076,1.09521.54102,1.30664Z"/><path d="M13.37796,16.28325l-1.84766.76562c-.51023.21142-.75242.79634-.54104,1.30658.20846.50319.80483.74887,1.30667.54107l1.84766-.76562c.51025-.21143.75244-.79639.54102-1.30664s-.79736-.75391-1.30664-.54102Z"/><path d="M6.63046,35.7047c.39056-.3905.39056-1.02368,0-1.41418-.3905-.39056-1.02368-.39056-1.41418,0-.39056.3905-.39056,1.02368,0,1.41418.3905.3905,1.02368.3905,1.41418,0Z"/>' },
        // ── NEIL'S ARROWS (#177, his own files, 2026-08-02). FOUR rows, because he asked to see the
        // decision rather than have it made for him: *"whether we want the square borders around the
        // outside or if we wanna minimize it… what do you think?"*
        //   `arrowRight`     — his file VERBATIM: the rounded-square frame + the chevron.
        //   `arrowRightBare` — the SAME chevron path, byte-identical, with the frame path dropped.
        // Nothing is redrawn or re-derived either way; the bare variant is a subset of his own file,
        // which is the only honest way to offer a "minimised" version of someone else's drawing.
        // ⚠️ ONE FORCED CHANGE, STATED (CLAUDE.md #13), and it applies to all four: his export paints
        // through `<defs><style>.cls-1{fill:#212121}</style></defs>`. Two problems, both the #88/#114
        // landmine: (a) a hardcoded near-black cannot inherit, so it would sit invisible on the dark
        // rail and on the purple chips; (b) an inlined `<style>` puts `.cls-1` into the GLOBAL
        // stylesheet, where it collides with every other Illustrator export using that default class
        // name. So the rule is dropped and the paths take the wrapper's currentColor. Path data,
        // the 30-unit grid and the geometry are untouched.
        arrowRight:     { kind: 'filled', vb: '0 0 30 30', src: 'neil-arrow-right.svg', body: '<path d="M24,30H6a6,6,0,0,1-6-6V6A6,6,0,0,1,6,0H24a6,6,0,0,1,6,6V24A6,6,0,0,1,24,30ZM6,2A4,4,0,0,0,2,6V24a4,4,0,0,0,4,4H24a4,4,0,0,0,4-4V6a4,4,0,0,0-4-4Z"/><path d="M12,23a1,1,0,0,1-.71-1.71L17.62,15,11.33,8.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l7,7a1,1,0,0,1,0,1.42l-7,7A1,1,0,0,1,12,23Z"/>' },
        arrowLeft:      { kind: 'filled', vb: '0 0 30 30', src: 'neil-arrow-left.svg',  body: '<path d="M24,30H6a6,6,0,0,1-6-6V6A6,6,0,0,1,6,0H24a6,6,0,0,1,6,6V24A6,6,0,0,1,24,30ZM6,2A4,4,0,0,0,2,6V24a4,4,0,0,0,4,4H24a4,4,0,0,0,4-4V6a4,4,0,0,0-4-4Z"/><path d="M18,23a1,1,0,0,1-.7-.29l-7-7a1,1,0,0,1,0-1.42l7-7a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.42L12.38,15l6.29,6.29A1,1,0,0,1,18,23Z"/>' },
        arrowRightBare: { kind: 'filled', vb: '0 0 30 30', src: 'neil-arrow-right.svg (chevron only)', body: '<path d="M12,23a1,1,0,0,1-.71-1.71L17.62,15,11.33,8.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l7,7a1,1,0,0,1,0,1.42l-7,7A1,1,0,0,1,12,23Z"/>' },
        arrowLeftBare:  { kind: 'filled', vb: '0 0 30 30', src: 'neil-arrow-left.svg (chevron only)',  body: '<path d="M18,23a1,1,0,0,1-.7-.29l-7-7a1,1,0,0,1,0-1.42l7-7a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.42L12.38,15l6.29,6.29A1,1,0,0,1,18,23Z"/>' },
        // ⭐ v7.20.508 (Neil, 2026-08-15) — the two glyphs the confirm modal was showing as EMOJI
        // (💬 / ⚠️). `.swml-confirm-icon svg { color: … }` had ALREADY been authored in
        // wml-canvas.css for an inline SVG that never arrived, so this is the treatment the CSS
        // was written for, not a new one.
        //   chat  ← frontend/icons/remix-question-answer-fill.svg, on disk and previously unused.
        //   alert ← the SAME Iconoir warning-triangle already shipping as `.swml-fb-warn`
        //           (wml-styles.css ~3889), so the modal's warning and the per-statement feedback
        //           warning are one drawing. Ported to `line` (stroke-width 2) rather than the
        //           data-URI's 1.9 so it inherits currentColor and matches the house icon weight —
        //           the ONE disclosed deviation from the source (a data-URI background cannot
        //           inherit colour, which is exactly why it could not be reused as-is).
        chat:  { kind: 'filled', vb: '0 0 24 24', src: 'remix-question-answer-fill.svg', body: '<path d="M8 18H18.2372L20 19.3851V9H21C21.5523 9 22 9.44772 22 10V23.5L17.5455 20H9C8.44772 20 8 19.5523 8 19V18ZM5.45455 16L1 19.5V4C1 3.44772 1.44772 3 2 3H17C17.5523 3 18 3.44772 18 4V16H5.45455Z"/>' },
        // ⭐ Neil's ALLY and FOIL, B versions (2026-08-15). The A versions are RETIRED and were
        // never right: Ally A was an 88-grid fist-bump and Foil A a 500-grid full-colour
        // illustration reduced to 20 linework paths — his verdict, and mine one build earlier,
        // was "a bit too intricate, so they're hard to view". A technique glyph renders at ~15px;
        // detail that survives at 500 becomes mud at 15. BOTH B versions are 24-grid strokes,
        // which is the grid the rest of this table is drawn on.
        // Each keeps ITS OWN stroke spec, baked onto the shapes as attributes rather than
        // normalised to the wrapper's: Ally is 1.91px / miterlimit 10 (his Story-Components
        // weight), Foil is 1.5px / round caps. Path attributes beat the svg-level ones, so the
        // geometry is his whichever `kind` wraps it — no silent re-weighting (§13, copy it).
        tech_Aa: { kind: 'line', vb: '0 0 24 24', src: 'ally-b.svg', body: '<path stroke-width="1.91" stroke-miterlimit="10" d="M1.5,14.89H3.41l5,2.87A7.21,7.21,0,0,0,12,18.7h0"/><polyline stroke-width="1.91" stroke-miterlimit="10" points="19.16 15.71 20.59 14.89 22.5 14.89"/><path stroke-width="1.91" stroke-miterlimit="10" d="M12,18.7a7.21,7.21,0,0,0,3.57-.94l2-1.17-3.68-5.52-2.65.66a3.42,3.42,0,0,1-.79.09A3.26,3.26,0,0,1,9,11.48a1.49,1.49,0,0,1,.08-2.71L14.16,6.6a3.77,3.77,0,0,1,3.56.33L19.64,8.2H22.5"/><path stroke-width="1.91" stroke-miterlimit="10" d="M1.5,8.2H4.36L6.28,6.93A3.77,3.77,0,0,1,9.84,6.6L12,7.53"/><line stroke-width="1.91" stroke-miterlimit="10" x1="22.5" y1="6.3" x2="22.5" y2="16.8"/><line stroke-width="1.91" stroke-miterlimit="10" x1="1.5" y1="6.3" x2="1.5" y2="16.8"/>' },
        tech_Fl: { kind: 'line', vb: '0 0 24 24', src: 'foil-b.svg', body: '<path stroke-width="1.5" d="M20 10V14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> <path stroke-width="1.5" d="M17.5 4.5L13 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> <path stroke-width="1.5" d="M19 7L11.5 13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>' },
        // Neil's, supplied 2026-08-15 for the clear-chat confirm ("can use this icon"). Bin with an
        // ✕ on the body — it names the ACTION, which the chat bubble did not.
        del:   { kind: 'filled', vb: '0 0 24 24', src: 'delete.svg', body: '<path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7ZM13.4142 13.9997L15.182 12.232L13.7678 10.8178L12 12.5855L10.2322 10.8178L8.81802 12.232L10.5858 13.9997L8.81802 15.7675L10.2322 17.1817L12 15.4139L13.7678 17.1817L15.182 15.7675L13.4142 13.9997ZM9 4V6H15V4H9Z"/>' },
        alert: { kind: 'line',   vb: '0 0 24 24', src: 'Iconoir warning-triangle (= .swml-fb-warn)', body: '<path d="M20.043 21H3.957c-1.538 0-2.5-1.664-1.734-2.997l8.043-13.988c.77-1.337 2.699-1.337 3.468 0l8.043 13.988C22.543 19.336 21.58 21 20.043 21Z"/><path d="M12 9v4"/><path d="M12 17.01l.01-.011"/>' },
    };
    // ⭐ v7.20.404 (#177) — WHICH ARROW SHIPS. One switch, so the answer lives in ONE place and
    // Neil can be shown both without a code hunt. `bare` = chevron only; `boxed` = his frame too.
    // Recommendation on file: BARE. In prose the arrow sits between words at ~14px, where a frame
    // reads as a tappable control and competes with the real buttons under it; on a chip it is
    // already inside a button, so the frame is a box inside a box. The frame earns its place where
    // the arrow IS the control on its own — which is neither of these two sites.
    let ARROW_STYLE = 'bare';
    function setArrowStyle(s) { ARROW_STYLE = (s === 'boxed') ? 'boxed' : 'bare'; }
    function arrowIcon(dir, size) {
        const suffix = (ARROW_STYLE === 'boxed') ? '' : 'Bare';
        return icon('arrow' + (dir === 'left' ? 'Left' : 'Right') + suffix, size || 14);
    }
    // ⭐ THE DISPLAY SWAP, and it is a DISPLAY swap by law (#89).
    // The trailing glyph on a chip label ("Continue →", "Use this →", "Both still right →") is
    // matched as a STRING by tap handlers, walk-sim-lib and four harnesses. Editing the literal
    // would break every one of them silently — the walk would stop recognising its own controls.
    // So the literal keeps its "→" for ever and only the RENDERED HTML carries the glyph.
    // Applied to already-escaped HTML, so the guard below never has to parse markup: it skips any
    // arrow sitting inside a tag or an attribute by splitting on '<' … '>' boundaries first.
    function arrowize(html) {
        if (!html || typeof html !== 'string') return html;
        if (html.indexOf('→') === -1 && html.indexOf('←') === -1 && html.indexOf('➜') === -1) return html;
        return html.split(/(<[^>]*>)/).map(function (part) {
            if (part.charAt(0) === '<') return part;                    // a tag — never touch it
            return part
                .replace(/[→➜]/g, arrowIcon('right', 14))
                .replace(/←/g, arrowIcon('left', 14));
        }).join('');
    }

    // icon('spine', 16) → inline SVG at that size, inheriting the host's colour.
    // Unknown key returns '' and warns ONCE — never a broken glyph, never a silent blank.
    const _iconWarned = {};
    function icon(name, size) {
        const def = ICONS[name];
        if (!def) {
            if (!_iconWarned[name]) { _iconWarned[name] = 1; try { console.warn('WML: no icon registered for "' + name + '" — add a row to WML.ICONS'); } catch (_) {} }
            return '';
        }
        const s = size || 16;
        // viewBox is per-ROW, not per-kind: most of the set is drawn on a 24 grid, but Neil's
        // "Rewrite a beat" is a 512 export. Emitting it here (and NOT in the wrappers) means a
        // future icon on any grid just declares `vb` — and it cannot produce two viewBox
        // attributes on one <svg>, where the second is silently ignored and the glyph renders
        // at the wrong scale or not at all.
        const vb = def.vb || '0 0 24 24';
        return '<svg class="swml-ico swml-ico-' + name + '" viewBox="' + vb + '" ' + ICON_WRAP[def.kind]
            + ' width="' + s + '" height="' + s + '" aria-hidden="true">' + def.body + '</svg>';
    }
    // techIcon('Tn', 15) → the per-technique glyph for that TABLE SYMBOL, or '' when none is
    // registered. Deliberately SILENT on a miss (unlike icon()): 217 technique cards exist and only
    // a handful will ever have a bespoke glyph, so a missing one is the normal case, not a defect —
    // the call site keeps its generic prefix. Adding an icon later is one ICONS row and nothing else.
    function techIcon(sym, size) {
        if (!sym || !Object.prototype.hasOwnProperty.call(ICONS, 'tech_' + sym)) return '';
        return icon('tech_' + sym, size || 15);
    }
    // Kept as named wrappers so existing call sites read plainly.
    function approvalIconSVG(size) { return icon('approval', size || 16); }
    function guideIconSVG(size) { return icon('guide', size || 15); }
    function spineIconSVG(size) { return icon('spine', size || 15); }

    // The Writing Mastery Lab phoenix — Sophia's own mark, for [Still stuck — ask Sophia].
    // Full-colour BY DESIGN: this is the one chip where the glyph is an IDENTITY, not an icon,
    // so it is deliberately the one thing in a row of monochrome glyphs that is not monochrome.
    function phoenixIconHTML(size) {
        const s = size || 16;
        const base = (typeof swmlConfig !== 'undefined' && swmlConfig.iconBaseUrl) || '';
        if (!base) return '';   // no icon base → no glyph, never a broken image
        return '<img src="' + base + 'wml-phoenix-logo.svg" class="swml-ico swml-ico-phoenix" width="' + s + '" height="' + s + '" alt="" aria-hidden="true" loading="lazy">';
    }

    // v7.20.360: THE ONLY WAY to write a label onto a house button (.swml-halo-btn, BRAND.md §8).
    // The hover roll needs the label present TWICE — so every `btn.textContent = '…'` or
    // `btn.innerHTML = '…'` on one of these silently DESTROYS the roll, and the button looks
    // perfect until the first state change. The Sign Off button rewrites its own label in SIX
    // places (lock/✍ refresh · "Click again to confirm →" · the CW count variant · "⏳ Signing…" ·
    // two error resets), so hand-written spans were never going to survive it.
    // One producer, and `bin/cw-keymatch-harness.js` fails the build on a hand-written .swml-roll
    // or on a raw textContent/innerHTML write to a button carrying .swml-halo-btn.
    // Builds by textContent, never string concat — labels carry →, ✍ and (3/5) counts.
    function setHaloLabel(btn, label, iconHTML) {
        if (!btn) return;
        btn.innerHTML = iconHTML || '';
        const roll = document.createElement('span');
        roll.className = 'swml-roll';
        const first = document.createElement('span');
        first.textContent = label;
        const second = document.createElement('span');
        second.setAttribute('aria-hidden', 'true');
        second.textContent = label;
        roll.appendChild(first);
        roll.appendChild(second);
        btn.appendChild(roll);
    }

    // v7.19.916 (Neil dislikes emojis, pt2): decorative emojis → brand illustrative SVG icons
    // (frontend/icons/emoji/, hand-picked from Neil's "SVG Icons for Sophicly" pack; 📊 chart is
    // the icon Neil attached). DISPLAY layer only — runs on rendered chat HTML; raw chatHistory
    // keeps the emoji, so every raw-text consumer (quick-action detection, parseProgressBeat's
    // 📌 pin, assessment-complete detection, marker extraction) is untouched by construction.
    // Deliberately NOT mapped (functional, or owned elsewhere): ✅ ✔ ⚠ ❌ (svgifyStatusGlyphs),
    // 📌 (beat-chip pin), 🤔 💬 (quick-action tokens), 🎲 ✏️ (existing stroke-icon swaps above),
    // ✕ ☰ ❮ ❯ and arrows (controls). Chat bubbles ONLY — canvas cards go through the PM schema,
    // which silently drops <img>; mapping there needs a schema node first (the v898 fbGlyph lesson).
    const EMOJI_ICON_MAP = {
        '📊': 'chart', '📈': 'progress', '💡': 'idea', '🎯': 'target', '📚': 'book',
        '📖': 'education', '📝': 'marker', '✍': 'marker', '📋': 'clipboard', '🧠': 'brain',
        '🚀': 'rocket', '🔍': 'search', '🔎': 'search', '🎉': 'fun', '😊': 'happiness',
        '💪': 'motivation', '🏆': 'trophy', '🕐': 'time', '🔒': 'padlock', '❤': 'heart',
        '🔥': 'torch', '⭐': 'rating', '🌟': 'rating', '📄': 'document',
    };
    let _emojiIconRe = null;
    function svgifyEmojis(html) {
        const iconBase = (typeof swmlConfig !== 'undefined' && swmlConfig.iconsUrl) || '';
        if (!iconBase || !html) return html;
        if (!_emojiIconRe) _emojiIconRe = new RegExp('(' + Object.keys(EMOJI_ICON_MAP).join('|') + ')\\uFE0F?', 'gu');
        // Split keeps <pre>/<code> segments (odd indices) verbatim — protocol snippets may quote emojis.
        return html.split(/(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/g).map((seg, i) => (i % 2) ? seg
            : seg.replace(_emojiIconRe, (m, e) =>
                '<img src="' + iconBase + EMOJI_ICON_MAP[e] + '.svg" class="swml-emoji-ico" alt="" aria-hidden="true" loading="lazy">')
        ).join('');
    }

    // ── v7.19.922 (Neil): "Fix → Learn" chips on marking-penalty lines ─────────────────
    // The feedback names the fault + the fix; the chip names WHERE TO LEARN the skill.
    // Display layer only (the svgify pattern): chip tokens are added inside formatAI's
    // local copy, so raw chatHistory and every raw-text consumer (pen ledger, detectors,
    // marker extraction) are untouched by construction. PM canvas cards are EXCLUDED v1
    // (the schema drops <button> — the v898 fbGlyph lesson); the pop-out Feedback pad is
    // covered by appendLearnChips() on its non-PM clones instead (wml-assessment.js).
    // Destinations are FEATURE-DETECTED at render time:
    //   N1      → window.SophiclyTable  (LIVE — notes v2.6.52 deep-link contract, in prod)
    //   F1 / T1 → window.SophiclyToolkit (ships DORMANT — lights up on the notes toolkit
    //             deploy with ZERO WML change; contract asks in the 2026-07-07 handoff)
    //   K1      → destination TBD (contract ask open) — no entry, so no chip.
    // NEVER a bare open() — it resolves to document.open and blanks the page (notes gotcha).
    // v7.19.949 SLUG LAW (Neil live test 2026-07-08 — F1 chips opened the toolkit LANDING):
    // every toolkit arg MUST be a section id from the notes toolkit's SECTIONS registry
    // (sophicly-notes/assets/js/sophicly-toolkit.js; tkNavigate resolves 'fix-'+slug then the
    // bare slug, unknown → landing + console.warn). 'inference-verbs' was never a section id —
    // the real id is 'wb-verbs'. Verify against SECTIONS before adding any entry.
    // v949 additions from Neil's live staging docs (uid 1355/1352): W1 = the RETIRED lit form
    // of F1 (registry v854 says read W1 as F1 — lit protocols still emit it; protocol-side fix
    // queued for the port arc), M1 plot-retell → Fix-My-Writing 'topic-sentence' ("plot retell
    // into a conceptual claim"), I1 imprecise interpretation → 'close-analysis', D1 lacks
    // sustained detail → 'finegrained'. S1 (sentence starters) has NO toolkit home yet —
    // deliberately unmapped (proposal with Neil).
    const PENALTY_LEARN_MAP = {
        F1: { dest: 'toolkit', arg: 'wb-verbs', label: 'Inference Verbs' },
        T1: { dest: 'toolkit', arg: 'wb-verbs', label: 'Inference Verbs' },
        W1: { dest: 'toolkit', arg: 'wb-verbs', label: 'Inference Verbs' },
        N1: { dest: 'table' },   // arg = technique name resolved from the penalty line itself
        // v7.19.939: K1 → the notes chat's new Toolkit section (built 2026-07-07, staging
        // v2.6.62; id FROZEN). Feature-detected — dormant until their prod push, lights up
        // automatically after (the v922 dormant-half pattern).
        K1: { dest: 'toolkit', arg: 'evaluative-keywords', label: 'Evaluative Keywords' },
        M1: { dest: 'toolkit', arg: 'topic-sentence', label: 'Topic Sentences' },
        I1: { dest: 'toolkit', arg: 'close-analysis', label: 'Close Analysis' },
        D1: { dest: 'toolkit', arg: 'finegrained', label: 'Fine-Grained Analysis' },
    };
    // Detection = the pen-ledger codeRe shape (keep in sync with _penLedgerCards' codeRe in
    // wml-assessment.js) PLUS the tally form the rebuilt Penalty Ledger / code-tallied Trend
    // emit ("**F1 — name** ×5 = −2.5" / "F1 ×8: …"). Line-anchored; the map gates which
    // codes actually chip, so lookalikes ("Q2 ×2") fall through harmlessly.
    const _LEARN_LINE_RE = /(^|\n)([ \t]*(?:[·•*-][ \t]*)?\*{0,2}([A-Z]{1,3}\d(?:-[A-Z]+)?)\*{0,2}(?:[^\n]{0,80}?\((?:−|-|–)[ \t]*[\d.]+\)|[^\n×]{0,60}×\d+)[^\n]*)/g;
    // N1 needs the technique the student misnamed. Canonical name set = the GENERATED
    // protocols/shared/reference/table-of-techniques.md headings, localized as
    // swmlConfig.techniqueNames. One combined regex, longest-first so "Extended Metaphor"
    // beats "Metaphor"; "The X" names also match without their article.
    let _techMatcher = null;
    function _resolveTechniqueName(text) {
        const names = (typeof swmlConfig !== 'undefined' && swmlConfig.techniqueNames) || [];
        if (!names.length || !text) return null;
        if (!_techMatcher) {
            const canon = {}, alts = [];
            names.forEach(n => {
                canon[n.toLowerCase()] = n; alts.push(n);
                if (/^The\s+/i.test(n)) { const s = n.replace(/^The\s+/i, ''); canon[s.toLowerCase()] = n; alts.push(s); }
            });
            alts.sort((a, b) => b.length - a.length);
            const esc = alts.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            _techMatcher = { re: new RegExp('\\b(?:' + esc.join('|') + ')\\b', 'i'), canon: canon };
        }
        const m = text.match(_techMatcher.re);
        return m ? (_techMatcher.canon[m[0].toLowerCase()] || null) : null;
    }
    // v7.19.950 (Neil): ALL distinct techniques in a line, document order. An N1 line names
    // both the MISNAMED technique and the GENUINE device in its Fix ("…not sibilance…the
    // genuine device here is parallelism") — the student should get a chip for each.
    function _resolveTechniqueNames(text) {
        if (!_resolveTechniqueName(text)) return [];   // builds _techMatcher + fast bail
        const re = new RegExp(_techMatcher.re.source, 'gi');
        const out = [], seen = {};
        let m;
        while ((m = re.exec(String(text))) !== null) {
            const canon = _techMatcher.canon[m[0].toLowerCase()];
            if (canon && !seen[canon]) { seen[canon] = true; out.push(canon); }
        }
        return out;
    }
    // v7.19.949: RAW resolver — map lookup + N1 technique resolution, NO availability gate.
    // The persisted in-doc chip nodes use this (they must be written even where the
    // destination global isn't loaded yet — visibility is gated at VIEW time by the editor
    // root attrs + CSS, so chips light up on existing docs the day a destination ships).
    function _resolveLearnChipRaw(code, context) {
        const map = PENALTY_LEARN_MAP[code];
        if (!map) return null;
        if (map.dest === 'toolkit') return { dest: 'toolkit', arg: map.arg, label: map.label };
        const name = _resolveTechniqueName(context);
        return name ? { dest: 'table', arg: name, label: name } : null;
    }
    // Map + availability gate → chip descriptor or null. Gating at render keeps the
    // toolkit half dormant until its global ships, and never renders a dead button.
    // (Chat bubbles + pad clones — transient surfaces, so render-time gating is correct.)
    function _learnChipFor(code, context) {
        if (typeof window === 'undefined') return null;
        const chip = _resolveLearnChipRaw(code, context);
        if (!chip) return null;
        if (chip.dest === 'toolkit') return (window.SophiclyToolkit && window.SophiclyToolkit.open) ? chip : null;
        return (window.SophiclyTable && window.SophiclyTable.open) ? chip : null;
    }
    // v7.19.949/950: line → chip descriptorS for the in-doc healer (wml-assessment's
    // _healLearnChips). Ungated (see _resolveLearnChipRaw); same rendered-block detection
    // shape as appendLearnChips. Empty array when the line isn't chip-eligible. v950: N1
    // lines yield ONE chip PER distinct technique named (misnamed + the genuine device in
    // the Fix); other codes stay single-chip.
    function learnChipsForLine(text) {
        const t = String(text || '').trim();
        const m = t.match(_LEARN_BLOCK_RE);
        if (!m) return [];
        const map = PENALTY_LEARN_MAP[m[1]];
        if (!map) return [];
        if (map.dest !== 'table') {
            const one = _resolveLearnChipRaw(m[1], t);
            return one ? [one] : [];
        }
        return _resolveTechniqueNames(t).map(name => ({ dest: 'table', arg: name, label: name }));
    }
    // v7.20.49: protocol-triggered resource deep-links — the AI emits
    // @RESOURCE_LINK{"dest":"toolkit|table","arg":"<section-id|technique>","label":"<text>"}
    // on its own line (AQA P2 planning session law 7); this converts each into the same
    // ⟦SWML_LEARN⟧ token the learn-chips render, so ONE chip system + ONE delegated open
    // handler serve both. VALIDATION (the F1 silent-landing lesson): toolkit args must be
    // in the frozen known-section allowlist; table args must resolve to a canonical
    // technique name (swmlConfig.techniqueNames). Unknown → drop + console.warn, never a
    // dead chip or a silent landing-page open. Keep the allowlist in sync with
    // PENALTY_LEARN_MAP + the notes plugin's SECTIONS registry (parity check at pre-ship).
    const RESOURCE_TOOLKIT_IDS = ['wb-verbs', 'evaluative-keywords', 'topic-sentence', 'close-analysis', 'finegrained'];
    function tagResourceLinks(text) {
        if (!text || String(text).indexOf('@RESOURCE_LINK') === -1) return text;
        return String(text).replace(/@RESOURCE_LINK\s*(\{[^}]*\})/g, (whole, json) => {
            try {
                const p = JSON.parse(json);
                const dest = p.dest === 'table' ? 'table' : 'toolkit';
                let arg = String(p.arg || '').trim();
                let label = String(p.label || '').trim();
                if (dest === 'toolkit') {
                    if (RESOURCE_TOOLKIT_IDS.indexOf(arg) === -1) {
                        console.warn('WML resource-link: unknown toolkit section dropped —', arg);
                        return '';
                    }
                    if (!(typeof window !== 'undefined' && window.SophiclyToolkit && window.SophiclyToolkit.open)) return '';
                } else {
                    const name = _resolveTechniqueName(arg);
                    if (!name) {
                        console.warn('WML resource-link: unknown technique dropped —', arg);
                        return '';
                    }
                    arg = name;
                    if (!label) label = name;
                    if (!(typeof window !== 'undefined' && window.SophiclyTable && window.SophiclyTable.open)) return '';
                }
                return '⟦SWML_LEARN:' + dest + ':' + arg + ':' + (label || arg) + '⟧';
            } catch (e) {
                console.warn('WML resource-link: dropped unparseable marker', String(json).slice(0, 80));
                return '';
            }
        });
    }

    // Raw-text phase (start of formatAI): append a ⟦SWML_LEARN:dest:arg:label⟧ token to each
    // chip-eligible penalty line. Colon-delimited — technique names never carry colons, and
    // the token has no markdown-active chars (| would risk the table converter).
    function tagLearnChips(text) {
        if (!text || typeof window === 'undefined') return text;
        if (!(window.SophiclyTable || window.SophiclyToolkit)) return text;
        try {
            return String(text).replace(_LEARN_LINE_RE, (whole, lead, line, code, offset, str) => {
                let context = line;
                if (code === 'N1') {
                    // Ledger tally headers carry the technique on their indented "· Q2 ¶1: …"
                    // item lines, not the header — extend the context with them.
                    const after = str.slice(offset + whole.length).replace(/^\n/, '').split('\n');
                    for (let i = 0; i < after.length; i++) {
                        if (/^[ \t]+[·•]/.test(after[i])) context += ' ' + after[i]; else break;
                    }
                }
                const chip = _learnChipFor(code, context);
                if (!chip) return whole;
                return lead + line + ' ⟦SWML_LEARN:' + chip.dest + ':' + chip.arg + ':' + chip.label + '⟧';
            });
        } catch (e) { console.warn('WML learn-chip: tag skipped —', e && e.message); return text; }
    }
    // HTML phase (end of formatAI): token → button. <pre>/<code> segments (odd indices)
    // just DROP their tokens — a quoted protocol snippet must never grow a control.
    function renderLearnChipTokens(html) {
        if (!html || html.indexOf('⟦SWML_LEARN:') === -1) return html;
        const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        return html.split(/(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/g).map((seg, i) => (i % 2)
            ? seg.replace(/\s*⟦SWML_LEARN:[^⟧]*⟧/g, '')
            : seg.replace(/⟦SWML_LEARN:([a-z]+):([^:⟧]+):([^⟧]+)⟧/g, (m, dest, arg, label) =>
                '<button type="button" class="swml-learn-chip" data-learn-dest="' + attr(dest)
                + '" data-learn-arg="' + attr(arg) + '" title="Open '
                + (dest === 'table' ? 'the Table of Techniques' : 'the Mastery Toolkit')
                + '">Learn: ' + attr(label) + ' →</button>')
        ).join('');
    }
    // Rendered-block detection shape shared by the two DOM-phase consumers below —
    // textContent form (no markdown asterisks / leading bullet chars).
    const _LEARN_BLOCK_RE = /^([A-Z]{1,3}\d(?:-[A-Z]+)?)(?:.{0,80}?\((?:−|-|–)\s*[\d.]+\)|[^×]{0,60}×\d+)/;
    // DOM phase for non-PM clones (the pop-out Feedback pad; PM doc itself stays chip-free
    // v1). Same detection on textContent — rendered blocks have no markdown asterisks or
    // leading bullet chars. Idempotent: a block that already carries a chip is skipped.
    function appendLearnChips(rootEl) {
        try {
            if (!rootEl || !rootEl.querySelectorAll) return;
            const blockRe = _LEARN_BLOCK_RE;
            rootEl.querySelectorAll('p, li').forEach(bl => {
                if (bl.querySelector('.swml-learn-chip')) return;
                const t = (bl.textContent || '').trim();
                const m = t.match(blockRe);
                if (!m) return;
                const chip = _learnChipFor(m[1], t);
                if (!chip) return;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'swml-learn-chip';
                btn.setAttribute('data-learn-dest', chip.dest);
                btn.setAttribute('data-learn-arg', chip.arg);
                btn.textContent = 'Learn: ' + chip.label + ' →';
                bl.appendChild(document.createTextNode(' '));
                bl.appendChild(btn);
            });
        } catch (e) { console.warn('WML learn-chip: DOM inject skipped —', e && e.message); }
    }
    // ONE delegated click for every chip surface (bubbles, pad, in-doc chip nodes). Window-
    // level guard so the
    // two-bundle double-load / SPA re-run can't bind twice (the __swmlBooted lesson).
    if (typeof document !== 'undefined' && !window.__swmlLearnChipBound) {
        window.__swmlLearnChipBound = true;
        document.addEventListener('click', function (e) {
            const b = e.target && e.target.closest && e.target.closest('.swml-learn-chip, .swml-learn-chip-node');
            if (!b) return;
            e.preventDefault(); e.stopPropagation();
            const dest = b.getAttribute('data-learn-dest') || '';
            const arg = b.getAttribute('data-learn-arg') || '';
            // ALWAYS window-qualified — a bare open() resolves to document.open (blank page).
            if (dest === 'table' && window.SophiclyTable && window.SophiclyTable.open) window.SophiclyTable.open(arg);
            else if (dest === 'toolkit' && window.SophiclyToolkit && window.SophiclyToolkit.open) window.SophiclyToolkit.open(arg);
            else console.warn('WML learn-chip: destination unavailable —', dest, arg);
        }, true);
    }

    // v7.19.898 (Neil dislikes emojis): ONE source of truth that turns the three feedback status
    // emojis into a house glyph span. In chat the span renders directly (CSS bg = Iconoir SVG); in
    // the canvas card the SAME span is parsed by the fbGlyph inline schema node (span[data-fb-glyph])
    // so it survives ProseMirror's schema + the save/reload round-trip. Emits data-fb-glyph (the
    // node hook) AND the swml-fb-* class (the CSS art) so both surfaces style identically. Only the
    // three status glyphs are touched. Alternation longest-first so ✔️'s variation selector can't
    // be left as a stray. Idempotent-ish: an already-swapped span has no emoji to re-match.
    function svgifyStatusGlyphs(html) {
        if (!html || html.indexOf('✅') === -1 && html.indexOf('✔') === -1 && html.indexOf('⚠') === -1 && html.indexOf('❌') === -1) return html;
        const span = (kind, cls, label) => '<span data-fb-glyph="' + kind + '" class="swml-fb-glyph ' + cls + '" role="img" aria-label="' + label + '"></span>';
        return html
            .replace(/✅|✔️|✔/g, span('ok', 'swml-fb-ok', 'correct'))
            .replace(/⚠️|⚠/g, span('warn', 'swml-fb-warn', 'partially correct'))
            .replace(/❌/g, span('no', 'swml-fb-no', 'incorrect'));
    }

    // v7.19.906: ONE root parser for Sophia's per-turn micro-progress breadcrumb.
    // Every protocol emits a "📌 <Task> > <Section> > Step N of M" pin line (and,
    // legacy, an ASCII "[Progress bar: ███░ NN%]"). This turns whatever the model
    // declared into a structured beat — the % is COMPUTED from N/M in code (never
    // trusted from the model's ASCII bar), falling back to the bar's own % only when
    // there is no Step count. Universal by construction: any board/paper/future task
    // that emits the pin gets a chip for free; no per-step wiring. Returns null when
    // the turn declared no progress (e.g. the SA-walk turns) → no chip that turn.
    function parseProgressBeat(raw) {
        if (!raw) return null;
        const s = String(raw);
        // Require the 📌 pin line — a standalone "Step N of M" in feedback prose must NOT
        // trigger a chip. Step is parsed from the pin line only; the % fallback may read the
        // separate "[Progress bar: …NN%]" line.
        const crumbLine = (s.match(/📌[^\n]*/) || [''])[0];
        if (!crumbLine) return null;
        // v7.19.987: accept the count vocab protocols actually use, not just "Step". Conceptual
        // Notes walks "Element N of 8"; others may say Part/Question/Stage/Poem. Keying on the
        // "Step" literal alone is why CN's progress slipped past the universal chip (task-name /
        // naming-drift bug class) → root-fixed here so ANY protocol's "X of Y" is recognised.
        const stepM = crumbLine.match(/(?:Step|Element|Part|Question|Stage|Poem)\s+(\d+)\s+of\s+(\d+)/i);
        let step = null, total = null, pct = null;
        if (stepM) {
            step = parseInt(stepM[1], 10);
            total = parseInt(stepM[2], 10);
            if (total > 0) pct = Math.round((step / total) * 100);
        }
        if (pct == null) {
            const barM = s.match(/\[Progress(?:\s*bar)?:[^\]]*?(\d{1,3})\s*%/i);
            if (barM) pct = parseInt(barM[1], 10);
        }
        if (pct != null) pct = Math.max(0, Math.min(100, pct));
        // Section label = the pin minus 📌 and minus EVERY count token — "Element 1 of 8" AND a
        // bare redundant "Step 1" (the model often emits both, e.g. "…Element 1 of 8: Speaker >
        // Step 1"). Split on › > — only (keep ":" so "Part B.1: Structure" survives), then strip
        // orphan separators/colons left behind per segment and drop the empties.
        const rawLabel = crumbLine
            .replace(/📌\s*/, '')
            .replace(/(?:Step|Element|Part|Question|Stage|Poem)\s+\d+(?:\s+of\s+\d+)?/gi, '');
        const parts = rawLabel
            .split(/\s*(?:&gt;|›|>|—|–)\s*/)
            .map(p => p.replace(/^[\s:—–>-]+|[\s:—–>-]+$/g, '').replace(/\s{2,}/g, ' ').trim())
            .filter(Boolean);
        let task = '', section = '';
        if (parts.length >= 2) { task = parts[0]; section = parts.slice(1).join(' · '); }
        else if (parts.length === 1) { section = parts[0]; }
        if (pct == null && !section) return null;
        return { task: task, section: section, step: step, total: total, pct: pct == null ? 0 : pct };
    }

    // v7.19.906: the single micro-progress chip. Minimal (Neil): the section label
    // + "Step X of N" on one row, a thin brand-gradient bar below. No pin, no floating
    // badge. Theme-aware; styles live in wml-styles.css .swml-beat*. Width = code-computed %.
    function progressChipHTML(beat) {
        if (!beat) return '';
        // Derive the fill % from step/total when an explicit pct wasn't supplied
        // (the setup / SA-walk / marking chips pass {section,step,total} only).
        let _p = beat.pct;
        if (_p == null && beat.step != null && beat.total > 0) _p = Math.round((beat.step / beat.total) * 100);
        const pct = Math.max(0, Math.min(100, _p || 0));
        const esc = (t) => String(t == null ? '' : t).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
        const section = beat.section ? '<span class="swml-beat-section">' + esc(beat.section) + '</span>' : '';
        // v7.19.991: count word follows the walk's own vocabulary (beat.unit — 'Element' for
        // CN, default 'Step') so the chip never says "Step" of a thing the protocol calls
        // something else (Neil: 'Step 1 of 8' + 'Element 1 of 8' side by side read as two counts).
        const unitWord = esc(beat.unit || 'Step');
        const stepLabel = (beat.step != null && beat.total != null)
            ? '<span class="swml-beat-step">' + unitWord + ' <b>' + beat.step + '</b> of ' + beat.total + '</span>'
            : '<span class="swml-beat-step">' + pct + '%</span>';
        const aria = (beat.section ? esc(beat.section) + ' — ' : '') + (beat.step != null ? unitWord.toLowerCase() + ' ' + beat.step + ' of ' + beat.total : pct + '%');
        return '<div class="swml-beat" role="status" aria-label="' + aria + '">'
            + '<div class="swml-beat-top">' + section + stepLabel + '</div>'
            + '<div class="swml-beat-track"><div class="swml-beat-fill" style="width:' + pct + '%"></div></div>'
            + '</div>';
    }

    // v7.19.906/907: STRIP the three legacy inline progress renders formatAI produces
    // (step-header + step-blocks + ASCII bar) from a canvas AI reply. These were driven by
    // the model's own "Step N of M", which is documented-unreliable on marking turns (it
    // stalls across turns — wml-assessment.js:558) and also leaked setup noise ("Type M for
    // menu"). We remove them; the AUTHORITATIVE marking progress lives in the sidebar.
    //
    // v7.19.907: this helper NO LONGER auto-adds a chip from the model beat — the chip is
    // added ONLY where the count is frontend-authoritative and exact (setup pre-chain + the
    // self-assessment walk, via progressChipHTML). A marking-turn chip would render BEFORE
    // that turn's feedback is filed to the doc, so any in-chat count there would be wrong;
    // the sidebar (built post-fill from the doc) is the source of truth for marking.
    function withProgressChip(html, raw) {
        if (!html) return html;
        void raw;
        return html
            .replace(/<div class="swml-step-header">[\s\S]*?<\/div>/gi, '')
            .replace(/<span class="swml-step-blocks">[\s\S]*?swml-step-blocks-label">[^<]*<\/span>\s*<\/span>/gi, '')
            // v7.20.350: strips the MODEL's improvised bar only. A CODE-SERVED bar
            // (`swml-chat-progress-bar--code`, from cwProgressBar) is deliberate and must
            // survive — the CW walks are the only progress a code-served walk has, and this
            // line was silently eating every one of them in the canvas chat since v7.19.906.
            // The class check is explicit, not incidental: do not relax it to a bare
            // `class="swml-chat-progress-bar` prefix match.
            .replace(/<div class="swml-chat-progress-bar">[\s\S]*?swml-chat-progress-label">[^<]*<\/span>\s*<\/div>/gi, '')
            // v7.20.356: the model's bar now renders as a beat chip (see formatAI), so the strip
            // follows it. Anchored on the FILL div's own closing sequence — a lazy `[\s\S]*?</div>`
            // would stop at the first inner `</div>` and leave two orphan closers on the page.
            // Only `--model` is stripped; a code-served chip has no marker class and survives.
            .replace(/<div class="swml-beat swml-beat--model"[\s\S]*?swml-beat-fill[^>]*><\/div><\/div><\/div>/gi, '')
            // v7.19.987: also strip the RAW model breadcrumb + ANY improvised bar the task-gated
            // stylers missed. Conceptual Notes (and any protocol using "Element N of 8" + box-char
            // bars instead of "Step N of M" + "[Progress bar:]") slipped past the Planning/
            // Assessment-keyed strips → raw ASCII leaked. Universal, no task-name gate; the beat-
            // chip (added by the caller) replaces it.
            .replace(/<p>(?:(?!<\/p>)[\s\S])*?📌(?:(?!<\/p>)[\s\S])*?<\/p>/gi, '')
            .replace(/<p>(?:(?!<\/p>)[\s\S])*?[▮▯█▓▒░■□▪▫◼◻◾◽⬛⬜▰▱]{2,}(?:(?!<\/p>)[\s\S])*?<\/p>/gi, '')
            .replace(/[▮▯█▓▒░■□▪▫◼◻◾◽⬛⬜▰▱]{2,}\s*\d{0,3}\s*%?/g, '');
    }

    function renderLogo() {
        const logo = el('div', { className: 'swml-logo' });
        const img = el('img', {
            className: 'swml-logo-img',
            src: 'https://sophicly.b-cdn.net/Images/Writing%20Mastery%20Lab%20Phoenix%20Logo.svg',
            alt: 'Writing Mastery Lab',
        });
        logo.appendChild(img);
        return logo;
    }

    function renderBadges(items) {
        const b = el('div', { className: 'swml-badges' });
        items.filter(Boolean).forEach(i => b.appendChild(el('span', { className: 'swml-badge', textContent: i })));
        return b;
    }

    // ── v7.20.129: OUTLINE ROW RULE — the ONE definition of "is this row done?" ──
    //
    // WHY THIS EXISTS. The rule was hand-copied into THREE consumers, each carrying a
    // "mirrors X" comment — a promise, not a guarantee — and they had ALREADY drifted
    // (the row nodeView never handled `locked`; the other two did):
    //   1. checkRowComplete        wml-assessment.js   (row nodeView — the row's own ✓ class)
    //   2. checkSectionComplete    wml-assessment.js   (DOM reader — section header tick)
    //   3. section nodeView        wml-section-block.js (PM-attr reader — same tick, on mount)
    // Multi-control rows would have made that four copies of a harder rule. Same failure
    // class as v7.20.125 (a hardening pass that missed one member of the family), so the
    // fix is the family's: one rule, three thin adapters.
    //
    // The adapters differ ONLY in where they read state from (live DOM vs PM attrs); the
    // RULE is here. Anything row-completion decides belongs in this file. Callers still own
    // what is genuinely theirs: text extraction, and the CW single-select pick-group
    // (a SECTION-level rule — one pick completes the group — never a row rule).
    //
    // MULTI-CONTROL (v7.20.129, Neil: "six sections, one row each, options inside"):
    // a criterion may carry `controls: [ …N control objects… ]`. A criterion WITHOUT it is
    // a single-control row and behaves byte-identically to before — every other outline
    // family (literature, CW, para-AO) passes one control and is untouched by this change.
    const outlineRow = {
        // A criterion's controls, normalised. Legacy single-control crit ⇒ [crit].
        controlsOf(crit) {
            if (!crit || typeof crit !== 'object') return [{}];
            return (Array.isArray(crit.controls) && crit.controls.length) ? crit.controls : [crit];
        },

        isMulti(crit) {
            return !!(crit && Array.isArray(crit.controls) && crit.controls.length);
        },

        // ⭐ STATE SHAPE — a persisted-identifier decision, so read this before changing it
        // ([[feedback_key_mismatch_is_the_number_one_recurring_bug]]).
        //   single-control row (legacy, UNCHANGED): { checked: [0,2], selected: "Quote" }
        //   multi-control row  (new):               { c: { hook: {checked:[0]}, tone: {selected:"urgent"} } }
        // A flat `checked` array cannot say WHICH control it belongs to, so multi rows MUST
        // namespace by control id. Legacy rows keep the flat shape untouched — every saved
        // literature/CW outline in the DB still reads correctly with zero migration.
        stateOf(crit, state, ctl) {
            const st = state || {};
            if (!this.isMulti(crit)) return st;
            return ((st.c || {})[ctl && ctl.id] || {});
        },

        // Merge one control's state back into the row's persisted object (multi-aware).
        withControlState(crit, state, ctl, next) {
            const st = state || {};
            if (!this.isMulti(crit)) return next;
            const c = Object.assign({}, st.c || {});
            c[ctl && ctl.id] = next;
            return Object.assign({}, st, { c });
        },

        // ⭐ v7.20.423 — HAS THIS CONTROL BEEN TOUCHED AT ALL? Render-agnostic, exactly like
        // controlOk: it must answer for a checkbox list, a <select> and every picker
        // ({picked,free}) without knowing how any of them draw. Needed by the two flags below,
        // which both turn on "started" rather than "satisfied".
        // `ignore` (optional) = item LABELS that do not count as an answer. Step 7 uses it for
        // "Not explored": a real tick the student made, which must satisfy the control (so the
        // walk moves on) while NOT satisfying the row's requireAny (so a value where every trait
        // is "not explored" is still unanswered). Without it those two needs collide and one of
        // them silently loses.
        controlStarted(ctl, st, ignore) {
            const c = ctl || {}, s = st || {};
            const skip = Array.isArray(ignore) && ignore.length ? ignore.map(x => String(x)) : null;
            const live = (arr) => {
                if (!Array.isArray(arr)) return false;
                return arr.some(x => String(x || '').trim() && (!skip || skip.indexOf(String(x)) === -1));
            };
            if (live(s.picked)) return true;
            if (live(s.free)) return true;
            if (Array.isArray(s.checked) && s.checked.length) {
                if (!skip) return true;
                const items = Array.isArray(c.items) ? c.items : [];
                // A checklist stores INDICES, so an ignore list can only be applied when the
                // control's own items are to hand. They always are for a real criterion; the DOM
                // reader's fallback passes DOM nodes, where indexOf simply never matches and the
                // tick counts — the safe direction (it can only make a row look less complete).
                if (s.checked.some(i => skip.indexOf(String(items[i])) === -1)) return true;
            }
            if (s.selected && (!skip || skip.indexOf(String(s.selected)) === -1)) return true;
            return false;
        },

        // ⭐ v7.20.423 — OPTIONAL CONTROL (Neil's Step-7 per-trait ruling, 2026-08-04).
        // Step 7 asks the condition of EVERY trait the student chooses — so a value row carries
        // one control PER TRAIT (23 traits across the six values). Every one of those cannot be
        // required, or the row would demand a verdict on all 23 and become the "24-cell audit"
        // he explicitly does not want. `optional: true` on a CONTROL ⇒ an untouched control is
        // satisfied; the moment it is touched it must be finished, exactly like an `optional`
        // ROW. This is the control-level twin of the row flag (v7.20.130) and reads the same way.
        controlOptional(ctl) {
            return !!(ctl && (ctl.optional === true || ctl.optional === 'true'));
        },

        // ⭐ v7.20.423 — REQUIRE-ANY (the other half of the same ruling). A row of all-optional
        // controls could be completed by text alone, which would let a student write an
        // explanation of a value and name no trait at all. Neil: *"I think they need to choose at
        // least one."* `requireAny: true` on the CRITERION ⇒ at least ONE control must be
        // started. `optional` says "you need not answer this one"; `requireAny` says "you must
        // answer one of them" — both are needed, and neither implies the other.
        requiresAny(crit) {
            return !!(crit && (crit.requireAny === true || crit.requireAny === 'true'));
        },
        anyStarted(crit, state) {
            const ignore = (crit && Array.isArray(crit.anyIgnore)) ? crit.anyIgnore : null;
            return this.controlsOf(crit).some(ctl => this.controlStarted(ctl, this.stateOf(crit, state, ctl), ignore));
        },

        // Is ONE control satisfied? `choice: true` ⇒ ≥1 ticked (the student picks what
        // applies); no flag ⇒ every item required (v7.20.99: effects vs evidence).
        controlOk(ctl, st) {
            const c = ctl || {}, s = st || {};
            // v7.20.423: an untouched OPTIONAL control is satisfied. Read FIRST, before any
            // type branch — every branch below would otherwise report it unsatisfied.
            if (this.controlOptional(c) && !this.controlStarted(c, s)) return true;
            const chk = Array.isArray(s.checked) ? s.checked.length : 0;
            // v7.20.131: the TECHNIQUE PICKER. Satisfied by ONE device — from the taught 14
            // (`picked`, table codes) or the student's own words (`free`). Deliberately NOT 2:
            // the protocol offers "2–3 to start" but rules the layer INVITED, never forced
            // (protocol-b-planning.md:607/619) — demanding two would teach a rule we don't
            // teach (PEDAGOGY.md §3b). Codes, not names, so a rename in the technique table
            // can never orphan a student's saved pick.
            // v7.20.136/137: the effect picker (four-fold) AND the choice picker (verb/tone/
            // emotion/appeal/objection) satisfy exactly like the device picker — ONE chosen item
            // completes it, same {picked,free} shape. v7.20.137 (Neil: "all of them should allow
            // choosing more than one") made `choice` MULTI-select, so it joins this branch. It
            // still reads a legacy single `{selected}` (a .134-.136 saved value) as one pick, so
            // nothing re-keys and no saved outline loses its choice.
            if (c.type === 'techniques' || c.type === 'effects' || c.type === 'choice') {
                const p = Array.isArray(s.picked) ? s.picked.length : 0;
                const f = Array.isArray(s.free) ? s.free.filter(x => String(x || '').trim()).length : 0;
                return (p + f) >= 1 || (c.type === 'choice' && !!s.selected);
            }
            if (c.type === 'dropdown') return !!s.selected;
            if (c.type === 'checklist') {
                const need = c.choice ? 1 : Math.max(1, (Array.isArray(c.items) ? c.items.length : 1));
                return chk >= need;
            }
            if (c.type === 'checkbox') return chk > 0;
            return true; // no control on this row — text alone completes it
        },

        // THE RULE. hasText is the caller's (it owns its own text source).
        // A LOCKED row is a read-only carryover the student cannot fill (v7.19.679) — it can
        // never be a completion requirement, text or not.
        //
        // v7.20.130 — OPTIONAL rows. Some protocols plan a RANGE, not a count: AQA Lang P2 Q5
        // IUMVCC methodology is "their 2–3 distinct points" (protocol-b-planning.md:648), so a
        // student who argues two points must not be left with a permanently incomplete section
        // by a third baked row. `optional: true` ⇒ an EMPTY row is satisfied. Started ⇒ finish
        // it: the moment it has text, its controls are required exactly like any other row.
        // Distinct from `locked` (read-only, satisfied even with text the STUDENT never wrote).
        // v7.20.350 — CONTROL-ONLY rows. Neil, live on Step 5: "there's an empty space there where
        // it says which plot structure best fits your story. So that space is empty, which means my
        // section doesn't get ticked off… you can get rid of the text input area because we've
        // chosen it already." The archetype row carries a DROPDOWN and a text box that asks for the
        // same answer — and because `!hasText` means incomplete, the row could never complete once
        // the pick was made by chip. Document Progress sat at 2-of-5 sections with nothing left to
        // type. `controlOnly: true` ⇒ the CONTROLS are the whole answer: text is neither required
        // nor offered (the nodeView hides the input). Distinct from `optional` (empty is fine, but
        // text is still invited) and from `locked` (read-only carryover, satisfied regardless).
        controlOnly(crit) {
            return !!(crit && (crit.controlOnly === true || crit.controlOnly === 'true'));
        },
        complete(crit, state, hasText) {
            if (crit && (crit.locked === true || crit.locked === 'true')) return true;
            // v7.20.423: requireAny rides ALONGSIDE the every() check, never instead of it —
            // "at least one answered" and "nothing half-answered" are different questions.
            const everyOk = () => this.controlsOf(crit).every(ctl => this.controlOk(ctl, this.stateOf(crit, state, ctl)));
            const anyOk = () => !this.requiresAny(crit) || this.anyStarted(crit, state);
            if (this.controlOnly(crit)) return everyOk() && anyOk();
            if (!hasText) return !!(crit && (crit.optional === true || crit.optional === 'true'));
            return everyOk() && anyOk();
        },
    };

    // ══════════════════════════════════════════════════════════════════════════════════════
    // v7.20.541 (#341) — THE MICROPHONE MUST NEVER FAIL SILENTLY. ONE VOICE, SIX SURFACES.
    // ──────────────────────────────────────────────────────────────────────────────────────
    // Neil, 2026-08-08: "I don't see any students actually using it, which is weird… some of
    // them, like, who use iPads… it doesn't seem to allow them to use the microphone." He
    // confirmed on 2026-08-20 that on an iPad, tapping the mic does NOTHING AT ALL.
    //
    // ⭐ MEASURED FIRST (root §19), and the measurement corrected the FIXLIST row: WML's
    // dictation is the WEB SPEECH API (`webkitSpeechRecognition`), NOT `MediaRecorder` —
    // `grep -rn MediaRecorder frontend/ includes/` returns ZERO. The documented
    // hardcoded-mimeType landmine belongs to a different plugin and cannot be this bug.
    //
    // WHAT IS ACTUALLY WRONG, read from the source, six surfaces:
    //   · canvas chat TWIN pipeline  — `onerror` was `console.warn` ONLY. Nothing on screen,
    //     ever, for any error. This is the one that matches "nothing at all happens".
    //   · canvas chat PRIMARY        — spoke for `network`/`not-allowed` only, and told an
    //     iPad student to "check your microphone permissions in CHROME settings".
    //   · main chat                  — alert() for `not-allowed` only; the unsupported branch
    //     said "Please use Chrome, Edge, or Safari", i.e. it advised the one thing that is
    //     least likely to work on an iPad.
    //   · document dictation         — the listening bubble just vanished.
    //   · panel mic / selection chip — `onerror` restored the idle state and said nothing.
    // The dual-pipeline drift this file's CLAUDE.md warns about, in its purest form: a fix
    // applied to one copy and not its twin. Hence ONE helper that every surface calls.
    //
    // ⚠️ THE COPY IS A MEASUREMENT AS WELL AS A FIX. Each message carries the raw engine code
    // in brackets, so the next student who taps it TELLS US THE CAUSE without needing a device
    // in our hands — an instrument, not a guess (root §19). `window.__wmlMicDiag` keeps the
    // last 20 for a console read.
    //
    // ⛔ WHAT THE COPY DOES NOT CLAIM: that Chrome on iPad cannot do this. Safari on iOS 14.5+
    // is confirmed to support the API; what third-party iOS browsers expose is NOT confirmed,
    // so the message NAMES SAFARI as the thing that works rather than asserting what fails.
    // ══════════════════════════════════════════════════════════════════════════════════════
    function _micIsApple() {
        try {
            const ua = navigator.userAgent || '';
            // iPadOS 13+ reports itself as a Mac; the touch-point count is the discriminator.
            return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
        } catch (_) { return false; }
    }

    // The words a student sees. Plain, British, and never naming a thing they cannot see
    // (root §BRAND: no insider words, no orphan references, one idea per sentence).
    function micFailureMessage(code) {
        const apple = _micIsApple();
        const c = String(code || 'unknown');
        let msg;
        switch (c) {
            case 'not-allowed':
            case 'service-not-allowed':
                msg = apple
                    ? 'Your iPad is not letting this page use the microphone. Open Settings, tap Safari, tap Microphone and choose Allow — then come back and reload this lesson.'
                    : 'Your browser is blocking the microphone for this page. Look for the microphone icon near the web address and choose Allow, then try again.';
                break;
            case 'audio-capture':
                msg = 'Your device cannot reach the microphone. If Zoom or another app is using it, close that app and tap the mic again.';
                break;
            case 'network':
                msg = 'Voice typing needs the internet, and the connection dropped. Type your answer for now and try the mic again in a moment.';
                break;
            case 'no-speech':
                msg = 'I did not hear anything. Tap the mic and speak, or just type your answer.';
                break;
            case 'unsupported':
                msg = apple
                    ? 'Voice typing does not work in this browser. On an iPad, open your lesson in Safari and the mic will work.'
                    : 'Voice typing does not work in this browser. Chrome, Edge or Safari will work — or just type your answer.';
                break;
            default:
                msg = 'Voice typing stopped and I could not tell why. Type your answer for now.';
        }
        // The bracketed code is the instrument: a student can read it out, and it names the
        // cause exactly. Never shown for 'unsupported' (nothing failed — it was never there).
        return c === 'unsupported' ? msg : msg + ' (mic: ' + c + ')';
    }

    // Record every failure so a cause can be read off a console without a device in hand.
    function micRecordFailure(surface, code) {
        try {
            window.__wmlMicDiag = window.__wmlMicDiag || [];
            window.__wmlMicDiag.push({ surface: surface, code: String(code || 'unknown'), at: new Date().toISOString() });
            if (window.__wmlMicDiag.length > 20) window.__wmlMicDiag.shift();
            console.warn('WML mic [' + surface + '] failed:', code);
        } catch (_) {}
    }

    // ⭐ LIVENESS (WML CLAUDE.md §4d): a refusal MUST put something on the screen. `render` is
    // the surface's own way of speaking (a chat bubble, a placeholder); if it is missing or
    // throws, we fall back to alert() rather than let the failure be silent. There is no path
    // through this function that shows the student nothing — that is the whole point.
    function micNotify(surface, code, render) {
        const msg = micFailureMessage(code);
        micRecordFailure(surface, code);
        let shown = false;
        try { if (typeof render === 'function') { render(msg); shown = true; } } catch (_) { shown = false; }
        if (!shown) { try { alert(msg); } catch (_) {} }
        return msg;
    }

    // `aborted` is what the browser reports when the STUDENT stopped it (or we called stop()).
    // Nothing failed, so nothing is said — but it is still recorded, so a flood of them in
    // __wmlMicDiag is visible rather than invisible.
    function micIsSilentCode(code) { return String(code || '') === 'aborted'; }

    // ── Module Exports ──
    // All core functions/constants available to consuming modules via window.WML
    return {
        // Config & API
        config, API, headers,
        // State (shared object reference — mutations visible across modules)
        state,
        // Data maps
        TEXT_CATALOGUE, POETRY_ANTHOLOGY_BY_BOARD, PROSE_ANTHOLOGY_BY_BOARD,
        NONFICTION_ANTHOLOGY_BY_BOARD, BOARD_TEXT_FILTER, AUTHOR_MAP, SECTION_COLOURS, getTextLabel, isSkipTextSelect,
        // Step arrays
        PLAN_STEPS, ASSESSMENT_STEPS, POLISHING_STEPS, QUOTE_ANALYSIS_STEPS,
        CONCEPTUAL_NOTES_STEPS, POETRY_CN_STEPS, POETRY_CN_SPINE, POETRY_CN_OPENERS, NONFICTION_CN_STEPS,
        ESSAY_PLAN_STEPS, MODEL_ANSWER_STEPS, ESSAY_PLAN_RECALL_STEPS,
        MODEL_ANSWER_ADVANCED_STEPS, EXAM_QUESTION_STEPS, MEMORY_PRACTICE_STEPS,
        FOUNDATIONAL_QUIZ_STEPS,
        // Element arrays
        ASSESSMENT_ELEMENTS, POLISHING_ELEMENTS, EXAM_QUESTION_ELEMENTS,
        CONCEPTUAL_NOTES_ELEMENTS, POETRY_CN_ELEMENTS, NONFICTION_CN_ELEMENTS,
        QUOTE_ANALYSIS_ELEMENTS, MODEL_ANSWER_ELEMENTS, PLAN_ELEMENTS,
        // Helpers
        micFailureMessage, micNotify, micRecordFailure, micIsSilentCode,
        isPoetrySubject, isLanguageSubject, isNonfictionSubject, isAnthologySubject, isPoetryCnDoc,
        anthologyPoemsFor, cnRosterSlug, isPoetryAnthologyDoc,
        // CN family registry (v7.20.15)
        CN_FAMILIES, LIT_CN_SPINE, NONFICTION_CN_SPINE, PROSE_CN_SPINE, cnFamily, cnFieldRe,
        CN_STAGE_SPLITS, cnStageSplitFor, cnStageCountFor,
        getSteps, getElements, getExerciseConfig, getCwStepDef, cwToolsMinimal, resolveStorageSuffix, resolveCanvasSuffix, canvasDocScope,
        // Exercise manifest
        EXERCISE_MANIFEST,
        // Creative Writing
        CW_STEPS, CW_ARTIFACT_MAP, CW_DRAFT_PREDECESSOR, CW_SEED_FROM, CW_SIDEBAR_STEPS,
        cwTrialSource, cwDraftTrialSource, CW_SCENE_ELEMENTS, CW_TRIAL1_ACCURACY, CW_TRIAL1_ELEMENTS,
        // Revision map
        REVISION_MAP,
        // Utilities
        $, $$, ucfirst, el, apiPost, apiGet,
        // UI modals & toasts
        showConfirm, showToast, maybeTriggerToast,
        // UI components
        build3DButton, createTypingBubble, removeTypingBubble,
        buildStepper, getPhaseSubSteps,
        // Theme
        getSystemTheme, getTheme, applyTheme, toggleTheme,
        createThemeToggleBtn, JHEY_TOGGLE_HTML,
        // Icons — input area
        SENDER_HTML, SVG_MIC, SVG_MIC_STOP, SVG_SEND, SVG_ATTACH,
        SVG_COPY, SVG_COPY_ASSESS,
        // Icons — selection toolbar
        SVG_SEL_REPLY, SVG_SEL_INSERT, SVG_SEL_COPY, SVG_SEL_NOTE,
        // Icons — question/utility
        SVG_ICON_GENERATE, SVG_ICON_HAND_SELECT, SVG_ICON_PASTE,
        SVG_ICON_BULB, SVG_ICON_SAVE, SVG_ICON_EDIT, SVG_ICON_FORWARD, SVG_ICON_HELP,
        getQuickActionIcon,
        // Icons — panels & features
        SVG_NOTES_PANEL, SVG_SOCRATIC, SVG_SAVE, SVG_TIMER, SVG_BRAIN,
        SVG_KEYBOARD, SVG_AI_GENERATE, SVG_LIST_DETAILS, SVG_QA_FILL, SVG_NOTES,
        SVG_MIC_ICON, SVG_SPARKLES,
        // Icons — phase stepper
        SVG_PHASE_WRITE, SVG_PHASE_REDRAFT, SVG_PHASE_LOCK,
        SVG_PHASE_TIMER, SVG_PHASE_CUSTOM, SVG_PHASE_ZEN,
        SVG_DISCUSS, SVG_MARK_SCHEME, SVG_MODEL_ANSWER, SVG_PLAN, SVG_ASSESS, SVG_OUTLINE_STEP, SVG_POLISH,
        // Icons — navigation
        SVG_VIDEO, SVG_LIBRARY, SVG_FOLDER, SVG_DASHBOARD, SVG_BACK, SVG_RESTART,
        SVG_WRITING, SVG_REDRAFT,
        // Icons — guide/onboarding
        SVG_GUIDE_LOCK, SVG_GUIDE_TARGET, SVG_GUIDE_STOPWATCH,
        SVG_GUIDE_ARM, SVG_GUIDE_WRITING, SVG_GUIDE_GRAPH, SVG_GUIDE_BRAIN,
        // Text processing
        stripAIInternals, detectAssessmentStep, formatAI, svgifyStatusGlyphs, countWords,
        registerLiveValue, resolveLiveValues,   // v7.20.351 — the fossil cure (see formatAI)
        recordTurn, rehydrateTurn,              // v7.20.352 — the ONLY writers into chat history
        beginThemeSwap,                         // v7.20.429 — call BEFORE any theme write (#264)
        // v7.19.906: unified micro-progress beat-chip (canvas chat)
        parseProgressBeat, progressChipHTML, withProgressChip, lockIconSVG, setHaloLabel, approvalIconSVG, guideIconSVG, spineIconSVG, phoenixIconHTML, icon, techIcon, ICONS,
        arrowIcon, arrowize, arrowizeEl, setArrowStyle,   // v7.20.404 (#177) — Neil's arrows; setArrowStyle('boxed'|'bare') switches the whole app
        appendLearnChips,   // v7.19.922: Fix→Learn chips on non-PM clones (Feedback pad)
        learnChipsForLine,  // v7.19.949/950: ungated line→chips resolver for the in-doc healer
        // v7.17.11: topic-flow detection (suppresses attempts UX inside numbered topics)
        isTopicFlow,
        // Rendering
        renderLogo, renderBadges,
        // Creative writing project API (v7.13.30)
        cwProject,
        // v7.15.70: Paper-shape resolver (dormant — consumed starting Release B)
        resolvePaperShape,
        // v7.19.x Commit 1: canonical task-caps lookup (dormant — no call site wired yet)
        caps, cap, isMarkingFlow, hasAssessmentSections,
        // v7.20.129: the ONE outline-row completion rule — all three consumers call it
        // (row nodeView, checkSectionComplete DOM reader, section nodeView PM-attr reader).
        outlineRow,
    };
})();
