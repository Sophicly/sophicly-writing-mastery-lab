/**
 * Mastery Codex — Frontend Workspace (v7.19.201)
 *
 * Single user-scoped document that persists across all 9 units of the
 * Grade 9 Core Skills induction course. Renders simple form fields
 * (short / long / checkbox / date / dropdown) against the stable
 * section IDs documented in
 * ~/.claude/handoffs/open/wml-tiptap-induction-reflection-block-2026-05-03.md
 * (UPDATE 3 + UPDATE 4 + UPDATE 5).
 *
 * Storage: REST /codex/load + /codex/save (WML v7.19.200).
 * Persistence key: user_meta `swml_canvas_mastery_codex`.
 *
 * Triggered from wml-app.js bootstrap when state.task === 'mastery_codex'.
 *
 * NOT TipTap-based (yet). InputField nodes can be added in a future
 * iteration once the section-by-section UX has been ground-tested with
 * real students.
 */

(function () {
    'use strict';

    const WML = window.WML = window.WML || {};
    const state = WML.state = WML.state || {};
    const config = WML.config = WML.config || (window.swmlConfig || {});
    const el = WML.el || ((tag, props = {}, children = []) => {
        const e = document.createElement(tag);
        Object.entries(props).forEach(([k, v]) => {
            if (k === 'className') e.className = v;
            else if (k === 'dataset') Object.assign(e.dataset, v);
            else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
            else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
            else e.setAttribute(k, v);
        });
        (Array.isArray(children) ? children : [children]).forEach(c => {
            if (c == null) return;
            if (typeof c === 'string') e.appendChild(document.createTextNode(c));
            else e.appendChild(c);
        });
        return e;
    });

    // ───────────────────────────────────────────────────────────────────
    // CODEX TEMPLATE — full inventory of stable section IDs per unit.
    // Mirrors the handoff §5 + §9 sections.
    // ───────────────────────────────────────────────────────────────────

    const CODEX_TEMPLATE = [
        {
            num: 1,
            title: 'Why This Course Exists',
            sections: [
                { kind: 'heading', label: 'Launch Reflection' },
                { id: 'unit-1.launch.grade-last', kind: 'dropdown', label: 'What grade did you last achieve in English?', options: [
                    { value: '', label: '— select —' },
                    { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
                    { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
                    { value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9' },
                    { value: 'not-sat', label: 'Not sat yet' },
                ]},
                { id: 'unit-1.launch.improvement', kind: 'short', cap: 280, label: 'What is one thing your English teacher said you needed to improve?' },
                { id: 'unit-1.launch.change-one-thing', kind: 'short', cap: 280, label: 'If you could change one thing about how you study English, what would it be?' },

                { id: 'unit-1.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: write your guess to the hook question on the previous slide (before we tell you the answer).' },
                { id: 'unit-1.meta-skills.in-own-words', kind: 'short', cap: 280, label: 'Define meta-skills in your own words.' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1)' },
                { id: 'unit-1.exit-ticket.surprises.1', kind: 'short', cap: 200, label: 'Three things from this introduction that surprised you — #1' },
                { id: 'unit-1.exit-ticket.surprises.2', kind: 'short', cap: 200, label: 'Three things from this introduction that surprised you — #2' },
                { id: 'unit-1.exit-ticket.surprises.3', kind: 'short', cap: 200, label: 'Three things from this introduction that surprised you — #3' },
                { id: 'unit-1.exit-ticket.meta-skills-lacked.1', kind: 'short', cap: 200, label: 'Two meta-skills you know you currently lack — #1' },
                { id: 'unit-1.exit-ticket.meta-skills-lacked.2', kind: 'short', cap: 200, label: 'Two meta-skills you know you currently lack — #2' },
                { id: 'unit-1.exit-ticket.reason-different', kind: 'short', cap: 280, label: 'One reason you are willing to do this course differently.' },

                { kind: 'heading', label: 'Mastery Pledge' },
                { id: 'unit-1.pledge.name', kind: 'short', cap: 80, label: 'Type your name to sign', required: true },
                { id: 'unit-1.pledge.implementation-intention', kind: 'long', cap: 280, label: 'If/then implementation intention (e.g. "If I fall behind by a week, then I will book a catch-up session that day.")' },
                { id: 'unit-1.pledge.committed', kind: 'checkbox', label: 'I commit to walking this road with intention.', required: true },
            ],
        },
        {
            num: 2,
            title: 'The Call to Mastery',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-2.launch.percentage-national', kind: 'short', cap: 80, label: 'Name the percentage of students nationally who reach Grade 7–9.' },
                { id: 'unit-2.launch.meta-skills-named.1', kind: 'short', cap: 200, label: 'Name two of the eight meta-skills students often lack — #1' },
                { id: 'unit-2.launch.meta-skills-named.2', kind: 'short', cap: 200, label: 'Name two of the eight meta-skills students often lack — #2' },
                { id: 'unit-2.launch.heros-journey-framing', kind: 'long', cap: 500, label: 'Why do we frame your journey as a Hero\'s Journey?' },

                { id: 'unit-2.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: two heroes start the same road on the same day. One has a map and a quest log. The other does not. Who arrives first — and why?' },
                { id: 'unit-2.literature-definition', kind: 'short', cap: 280, label: 'Define Literature in your own words.' },
                { id: 'unit-2.story-definition', kind: 'short', cap: 280, label: 'Define Story in your own words.' },
                { id: 'unit-2.protagonist-definition', kind: 'short', cap: 280, label: 'Define Protagonist in your own words + name the protagonist of the last text you studied.' },

                { kind: 'heading', label: 'Activity A — Know Thyself' },
                { id: 'unit-2.activity-a.know-thyself.1', kind: 'short', cap: 200, label: 'Prompt 1' },
                { id: 'unit-2.activity-a.know-thyself.2', kind: 'short', cap: 200, label: 'Prompt 2' },
                { id: 'unit-2.activity-a.know-thyself.3', kind: 'short', cap: 200, label: 'Prompt 3' },

                { kind: 'heading', label: 'Activity B — Accept the Call' },
                { id: 'unit-2.activity-b.accept-call', kind: 'long', cap: 1000, label: 'Write a 4–6 sentence paragraph: why are you accepting this call to mastery?' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-2.exit-ticket.three-resources.1', kind: 'short', cap: 80, label: 'Three of the six resources you can name from memory — #1' },
                { id: 'unit-2.exit-ticket.three-resources.2', kind: 'short', cap: 80, label: 'Three of the six resources you can name from memory — #2' },
                { id: 'unit-2.exit-ticket.three-resources.3', kind: 'short', cap: 80, label: 'Three of the six resources you can name from memory — #3' },
                { id: 'unit-2.exit-ticket.two-questions.1', kind: 'long', cap: 200, label: 'Two questions about which resource to use when — #1' },
                { id: 'unit-2.exit-ticket.two-questions.2', kind: 'long', cap: 200, label: 'Two questions about which resource to use when — #2' },
                { id: 'unit-2.exit-ticket.one-resource-explored', kind: 'short', cap: 200, label: 'One specific resource you will explore in the next 48 hours.' },
                { id: 'unit-2.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [day + time] arrives this week, I will [a specific action with my chosen resource]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-2.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 3,
            title: 'Equipping for the Quest',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-3.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 2?' },

                { id: 'unit-3.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: what single mistake stops more students from reaching Grade 9 than any other?' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-3.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-3.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-3.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-3.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-3.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-3.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-3.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [a specific session this week] starts, I will [arrive 5 minutes early with screen on and materials ready]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-3.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 4,
            title: 'Code of the Quest',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-4.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 3?' },

                { id: 'unit-4.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: what single mistake do you think most students make?' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-4.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-4.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-4.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-4.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-4.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-4.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-4.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [I feel disappointed in a result this week], I will [name Trust, Focus, Practice — and ask which I am missing]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-4.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 5,
            title: 'Forging a Hero\'s Mindset',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-5.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 4?' },

                { id: 'unit-5.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: why does mock-9 sometimes drop in the real exam?' },

                { kind: 'heading', label: 'Activity C — Hero\'s Tale' },
                { id: 'unit-5.activity-c.heros-tale', kind: 'long', cap: 1000, label: 'Write one paragraph: one habit you will adopt + one obstacle you anticipate.' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-5.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-5.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-5.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-5.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-5.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-5.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-5.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [day + time next week] arrives, I will [close the book and write everything I remember from memory]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-5.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 6,
            title: 'Science of Mastery',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-6.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 5?' },

                { id: 'unit-6.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: why does re-reading and highlighting feel productive but isn\'t?' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-6.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-6.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-6.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-6.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-6.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-6.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-6.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [day + time this week] arrives, I will [open one mark scheme and highlight three Grade 9 descriptors]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-6.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 7,
            title: 'Language of Excellence',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-7.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 6?' },

                { id: 'unit-7.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: what single document tells you exactly how to score Grade 9 — and most students never read it?' },

                { kind: 'heading', label: 'MADFATHER\'s CROPS — Apply Three Letters' },
                { id: 'unit-7.madfather-application.1', kind: 'long', cap: 400, label: 'Letter 1 — technique found + exact quote + effect on reader.' },
                { id: 'unit-7.madfather-application.2', kind: 'long', cap: 400, label: 'Letter 2 — technique found + exact quote + effect on reader.' },
                { id: 'unit-7.madfather-application.3', kind: 'long', cap: 400, label: 'Letter 3 — technique found + exact quote + effect on reader.' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-7.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-7.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-7.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-7.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-7.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-7.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-7.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [I write my next analytical paragraph], I will [use TTECEA+C and check each letter is present]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-7.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 8,
            title: 'The Hero\'s Arsenal',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-8.launch.retrieval', kind: 'long', cap: 500, label: 'What did you take away from Unit 7?' },

                { id: 'unit-8.hook-hypothesis', kind: 'long', cap: 500, label: 'Hypothesis: what separates the student who signs the pledge and forgets it from the one who lives by it?' },

                { kind: 'heading', label: 'TTECEA Application' },
                { id: 'unit-8.ttecea-application', kind: 'long', cap: 1200, label: 'One TTECEA+C paragraph (~7 sentences) on a sentence your tutor supplies.' },

                { kind: 'heading', label: 'Story-Spine Draft (6 Beats)' },
                { id: 'unit-8.story-spine-draft.1', kind: 'long', cap: 400, label: 'Beat 1' },
                { id: 'unit-8.story-spine-draft.2', kind: 'long', cap: 400, label: 'Beat 2' },
                { id: 'unit-8.story-spine-draft.3', kind: 'long', cap: 400, label: 'Beat 3' },
                { id: 'unit-8.story-spine-draft.4', kind: 'long', cap: 400, label: 'Beat 4' },
                { id: 'unit-8.story-spine-draft.5', kind: 'long', cap: 400, label: 'Beat 5' },
                { id: 'unit-8.story-spine-draft.6', kind: 'long', cap: 400, label: 'Beat 6' },

                { kind: 'heading', label: 'IUMVCC Draft (6 Beats)' },
                { id: 'unit-8.iumvcc-draft.1', kind: 'long', cap: 400, label: 'I — Issue' },
                { id: 'unit-8.iumvcc-draft.2', kind: 'long', cap: 400, label: 'U — Urgency' },
                { id: 'unit-8.iumvcc-draft.3', kind: 'long', cap: 400, label: 'M — Methodology' },
                { id: 'unit-8.iumvcc-draft.4', kind: 'long', cap: 400, label: 'V — Vision' },
                { id: 'unit-8.iumvcc-draft.5', kind: 'long', cap: 400, label: 'C — Counter-argument' },
                { id: 'unit-8.iumvcc-draft.6', kind: 'long', cap: 400, label: 'C — Conclusion' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + When-Intention' },
                { id: 'unit-8.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-8.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-8.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-8.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-8.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-8.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-8.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention: "When [the date above] arrives, I will [open the curriculum and begin Piece 1 — even if I don\'t feel ready]."' },

                { kind: 'heading', label: 'Pledge Re-Affirm' },
                { id: 'unit-8.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge for this unit.' },
            ],
        },
        {
            num: 9,
            title: 'Crossing the Threshold',
            sections: [
                { kind: 'heading', label: 'Launch Retrieval' },
                { id: 'unit-9.launch.retrieval', kind: 'long', cap: 500, label: 'Pull one key takeaway from each previous unit (Units 1–8).' },

                { kind: 'heading', label: 'First Quest Log Entry' },
                { id: 'unit-9.first-quest-log.skill', kind: 'short', cap: 280, label: 'Skill you will work on first.' },
                { id: 'unit-9.first-quest-log.measure', kind: 'short', cap: 280, label: 'How you will measure progress.' },
                { id: 'unit-9.first-quest-log.weekly-action', kind: 'short', cap: 280, label: 'Weekly action you commit to.' },

                { kind: 'heading', label: 'Exit Ticket (3-2-1) + Date Commitment' },
                { id: 'unit-9.exit-ticket.three.1', kind: 'short', cap: 200, label: 'Three takeaways — #1' },
                { id: 'unit-9.exit-ticket.three.2', kind: 'short', cap: 200, label: 'Three takeaways — #2' },
                { id: 'unit-9.exit-ticket.three.3', kind: 'short', cap: 200, label: 'Three takeaways — #3' },
                { id: 'unit-9.exit-ticket.two.1', kind: 'long', cap: 200, label: 'Two questions — #1' },
                { id: 'unit-9.exit-ticket.two.2', kind: 'long', cap: 200, label: 'Two questions — #2' },
                { id: 'unit-9.exit-ticket.one', kind: 'short', cap: 200, label: 'One action you will take this week.' },
                { id: 'unit-9.exit-ticket.first-piece-date', kind: 'date', label: 'Date you commit to your first piece.' },
                { id: 'unit-9.exit-ticket.implementation-intention', kind: 'long', cap: 280, label: 'When-intention for your first piece.' },

                { kind: 'heading', label: 'Pledge Re-Affirm (Final)' },
                { id: 'unit-9.pledge-reaffirm', kind: 'checkbox', label: 'I re-affirm my pledge — final affirmation.' },
            ],
        },
    ];

    WML.CODEX_TEMPLATE = CODEX_TEMPLATE;

    // ───────────────────────────────────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────────────────────────────────

    let _codexViewerMode = 'edit';
    let _codexPledgeSigned = false;

    function renderCodexWorkspace() {
        if (typeof WML.destroyShader === 'function') WML.destroyShader();
        const shaderBgEl = document.getElementById('swml-shader-bg');
        if (shaderBgEl) shaderBgEl.style.display = 'none';

        const existing = document.getElementById('swml-canvas-overlay');
        if (existing) existing.remove();

        const overlay = el('div', { id: 'swml-canvas-overlay', className: 'swml-codex-overlay' });
        const canvas = el('div', { className: 'swml-canvas swml-codex-canvas' });

        const header = el('div', { className: 'swml-codex-header' });
        const title = el('h1', { className: 'swml-codex-title' });
        title.textContent = 'Mastery Codex';
        const subtitle = el('p', { className: 'swml-codex-subtitle' });
        subtitle.textContent = 'Your personal record across the nine units of Grade 9 Core Skills.';
        header.appendChild(title);
        header.appendChild(subtitle);

        const saveStatus = el('div', { className: 'swml-codex-save-status', id: 'swml-codex-save-status' });
        saveStatus.textContent = 'Loading…';
        header.appendChild(saveStatus);

        canvas.appendChild(header);

        const body = el('div', { className: 'swml-codex-body' });

        const currentUnit = detectCurrentUnit();
        const unitsToRender = currentUnit > 0
            ? CODEX_TEMPLATE.filter(u => u.num === currentUnit)
            : CODEX_TEMPLATE;

        if (currentUnit > 0) {
            const unitNav = el('div', { className: 'swml-codex-unit-nav' });
            unitNav.innerHTML = `<p>Showing Unit ${currentUnit} only. <a href="#" class="swml-codex-show-all">Show all units</a></p>`;
            unitNav.querySelector('.swml-codex-show-all').addEventListener('click', (e) => {
                e.preventDefault();
                body.querySelectorAll('.swml-codex-unit').forEach(u => u.style.display = '');
                unitNav.style.display = 'none';
            });
            body.appendChild(unitNav);
        }

        (currentUnit > 0 ? CODEX_TEMPLATE : unitsToRender).forEach(unit => {
            const unitBlock = renderCodexUnit(unit);
            if (currentUnit > 0 && unit.num !== currentUnit) {
                unitBlock.style.display = 'none';
            }
            body.appendChild(unitBlock);
        });

        canvas.appendChild(body);
        overlay.appendChild(canvas);
        document.body.appendChild(overlay);

        loadCodexValues();

        const editor = document.querySelector('.swml-floating-editor');
        if (editor) editor.style.display = 'none';
    }

    function detectCurrentUnit() {
        const meta = document.querySelector('meta[name="sophicly-unit-number"]');
        if (meta) {
            const n = parseInt(meta.getAttribute('content'), 10);
            if (n >= 1 && n <= 9) return n;
        }
        const titleEl = document.querySelector('h1, h2, .ld-focus-header__title, .entry-title');
        if (titleEl) {
            const m = titleEl.textContent.match(/Unit\s*(\d)/i);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n >= 1 && n <= 9) return n;
            }
        }
        return 0;
    }

    function renderCodexUnit(unit) {
        const block = el('div', { className: 'swml-codex-unit', dataset: { unit: String(unit.num) } });
        const h = el('h2', { className: 'swml-codex-unit-title' });
        h.textContent = `Unit ${unit.num} — ${unit.title}`;
        block.appendChild(h);
        unit.sections.forEach(section => {
            const node = section.kind === 'heading'
                ? renderCodexSectionHeading(section)
                : renderCodexField(section);
            block.appendChild(node);
        });
        return block;
    }

    function renderCodexSectionHeading(section) {
        const h = el('h3', { className: 'swml-codex-section-heading' });
        h.textContent = section.label;
        return h;
    }

    function renderCodexField(section) {
        const wrapper = el('div', { className: 'swml-codex-field', dataset: { fieldId: section.id, fieldKind: section.kind } });
        if (section.kind !== 'checkbox') {
            const label = el('label', { className: 'swml-codex-label' });
            label.setAttribute('for', section.id);
            label.textContent = section.label + (section.required ? ' *' : '');
            wrapper.appendChild(label);
        }

        let input;
        if (section.kind === 'short') {
            input = el('input', { type: 'text', maxLength: String(section.cap || 280), id: section.id });
        } else if (section.kind === 'long') {
            input = el('textarea', { rows: '4', maxLength: String(section.cap || 500), id: section.id });
        } else if (section.kind === 'checkbox') {
            const label = el('label', { className: 'swml-codex-checkbox-label' });
            label.setAttribute('for', section.id);
            input = el('input', { type: 'checkbox', id: section.id });
            label.appendChild(input);
            const span = el('span');
            span.textContent = ' ' + section.label + (section.required ? ' *' : '');
            label.appendChild(span);
            wrapper.appendChild(label);
        } else if (section.kind === 'date') {
            input = el('input', { type: 'date', id: section.id });
        } else if (section.kind === 'dropdown') {
            input = el('select', { id: section.id });
            (section.options || []).forEach(opt => {
                const o = el('option', { value: opt.value });
                o.textContent = opt.label;
                input.appendChild(o);
            });
        }

        if (input) {
            input.setAttribute('data-codex-id', section.id);
            input.setAttribute('data-codex-kind', section.kind);
            if (section.required) input.setAttribute('data-codex-required', '1');
            input.addEventListener('blur', queueSave);
            input.addEventListener('change', queueSave);
            if (section.kind === 'checkbox') {
                // checkbox already inside label; do not append separately
            } else {
                wrapper.appendChild(input);
            }
        }

        return wrapper;
    }

    // ───────────────────────────────────────────────────────────────────
    // LOAD / SAVE
    // ───────────────────────────────────────────────────────────────────

    async function loadCodexValues() {
        const status = document.getElementById('swml-codex-save-status');
        try {
            const targetUid = state.reviewStudentId || state.userId || 0;
            const url = `${config.restUrl}codex/load` + (targetUid && state.reviewMode ? `?student_id=${targetUid}` : '');
            const res = await fetch(url, {
                headers: { 'X-WP-Nonce': config.nonce, 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            if (!json.success) {
                if (status) status.textContent = 'Could not load Codex.';
                return;
            }
            _codexViewerMode = json.viewerMode || 'edit';
            const sections = (json.doc && json.doc.sections) || {};
            _codexPledgeSigned = !!sections['unit-1.pledge.signed-at'];

            document.querySelectorAll('[data-codex-id]').forEach(input => {
                const id = input.getAttribute('data-codex-id');
                const v = sections[id];
                if (v === undefined) return;
                if (input.type === 'checkbox') {
                    input.checked = !!v;
                } else {
                    input.value = (v == null ? '' : String(v));
                }
            });

            applyViewerMode();
            applyPledgeLock();

            if (status) status.textContent = _codexViewerMode === 'edit' ? 'Loaded. Edits autosave.' : `Loaded (read-only — ${_codexViewerMode}).`;
        } catch (e) {
            console.error('Codex load failed', e);
            if (status) status.textContent = 'Network error loading Codex.';
        }
    }

    function applyViewerMode() {
        const readonly = _codexViewerMode !== 'edit';
        document.querySelectorAll('[data-codex-id]').forEach(input => {
            if (readonly) {
                input.setAttribute('disabled', 'disabled');
            } else {
                input.removeAttribute('disabled');
            }
        });
    }

    function applyPledgeLock() {
        if (!_codexPledgeSigned) return;
        document.querySelectorAll('[data-codex-id^="unit-1.pledge."]').forEach(input => {
            input.setAttribute('disabled', 'disabled');
            input.classList.add('swml-codex-locked');
        });
    }

    let _saveTimer = null;
    function queueSave() {
        if (_codexViewerMode !== 'edit') return;
        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(saveCodexValues, 1500);
    }

    async function saveCodexValues() {
        const status = document.getElementById('swml-codex-save-status');
        if (status) status.textContent = 'Saving…';
        const sections = {};
        document.querySelectorAll('[data-codex-id]').forEach(input => {
            const id = input.getAttribute('data-codex-id');
            if (input.type === 'checkbox') {
                sections[id] = !!input.checked;
            } else if (input.value !== '') {
                sections[id] = input.value;
            }
        });
        try {
            const targetUid = state.reviewStudentId || 0;
            const body = { sections };
            if (targetUid && state.reviewMode === false) body.student_id = targetUid;
            const res = await fetch(`${config.restUrl}codex/save`, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': config.nonce,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!json.success) {
                if (status) status.textContent = 'Save failed.';
                return;
            }
            const newSections = (json.doc && json.doc.sections) || {};
            const wasSigned = _codexPledgeSigned;
            _codexPledgeSigned = !!newSections['unit-1.pledge.signed-at'];
            if (_codexPledgeSigned && !wasSigned) {
                applyPledgeLock();
            }
            if (status) {
                const at = new Date().toLocaleTimeString();
                status.textContent = `Saved at ${at}.`;
            }
        } catch (e) {
            console.error('Codex save failed', e);
            if (status) status.textContent = 'Network error saving.';
        }
    }

    // ───────────────────────────────────────────────────────────────────
    // EXPORTS
    // ───────────────────────────────────────────────────────────────────

    WML.renderCodexWorkspace = renderCodexWorkspace;
})();
