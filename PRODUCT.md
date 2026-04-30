# Sophicly — Product Context

## What Sophicly is

A UK GCSE/IGCSE English tutoring platform. AI-assisted essay writing, assessment, planning, and polishing — paired with human tutors and Student Success Specialists. The AI tutor is named **Sophia**.

Built around exam-board protocols (AQA, Edexcel, Eduqas, OCR, Edexcel IGCSE, SQA, CCEA). Every interaction is anchored to the actual mark scheme of the paper the student is preparing for.

## Register

**product** — design serves the product. Sophicly is software students use to learn, not a marketing site. Most surfaces are dashboards, canvases, and forms.

The marketing layer (landing page, About, course pages) is **brand**. When working on those specifically, switch register.

## Users

### Primary — Students (13–16)

GCSE/IGCSE English students. Anxious about exams. Often told by school they're "not good at English." Many are second-language English speakers from immigrant families with high parental academic expectations.

What they need:
- Clear, kind, confident guidance
- Specific feedback grounded in the exam mark scheme — not vague "good job" or "try harder"
- Visible progress — they need to see they are getting better
- A teacher who treats them as intelligent. They've been condescended to enough.

What they don't want:
- Gamified Duolingo "streaks and confetti" energy
- Cute mascots
- Childish copy ("Awesome!", "Way to go!", "Yay!")
- Being told their work is wrong without being shown how to fix it

### Secondary — Parents

Often first-generation immigrant professionals. Pay for Sophicly. Need visible proof their child is progressing. Read dashboards more than students do.

What they need:
- Calm, professional UI that signals "this is serious tuition, not an app"
- Real metrics, not vanity numbers
- The ability to see their child's actual essays + feedback
- No drama — no aggressive red banners, no panic notifications

### Tertiary — Tutors and Specialists

Sophicly's human tutoring staff. Tutors deliver lessons, Specialists (SSS — Student Success Specialists) handle pastoral and academic-progression conversations. Both review student work in the same UI students use.

What they need:
- Comment + grade on student essays inline
- Move quickly between students
- Trust that the AI grading is anchored to the exam mark scheme they teach to

## Product purpose

Make GCSE/IGCSE English mastery achievable through:

1. Granular, mark-scheme-anchored feedback on every essay
2. Modelling — students study model answers, key quotes, and protocols specific to their exam paper
3. Deliberate practice — every essay is an attempt that builds toward exam confidence
4. Calibration — students learn to grade their own work against the examiner's lens

Every design choice should make one of those four easier. If a feature doesn't help one of them, it doesn't ship.

## Brand & tone

### Voice

- **Scholarly, calm, encouraging.**
- Treats the student as an intelligent adult-in-training, not a child to be entertained.
- Never patronising, never panicked, never gushing.
- Confident without being cold. Warm without being soft.
- British English spelling and idiom. UK student audience.

### Words to avoid

- "Awesome", "great job", "way to go", "you got this!" — too American-app, too gushing
- "Patriarchy", "patriarchal" — loaded liberal-feminist framing the founder rejects (use society / social order / paternal / Elizabethan)
- "AI tutor", "AI assistant" — the AI is named **Sophia**, always
- "Just" as filler ("just click here") — patronising
- Exclamation marks outside quoted text or genuine emergencies
- Any contraction in formal essay analysis copy (`doesn't` → `does not`)

### Words to favour

- "Sophia" not "the AI"
- "Mark scheme", "examiner", "AO1/AO2/AO3" — the language of the exam, used precisely
- "Attempt 1, Attempt 2…" — every essay is an attempt, never a "submission"
- "Diagnostic" / "Redraft" / "Polish" — Sophicly's named pedagogical phases

## Anti-references

Sophicly should NOT look or feel like:

1. **Duolingo / Khan Academy** — gamified, playful, mascot-heavy, streak-driven. Sophicly is studious, not playful.
2. **Generic SaaS dashboards** — neutral greys, blue accent, hero metric template. Sophicly has identity.
3. **AI chat wrappers** (ChatGPT clones with Sophicly logo) — Sophicly is a structured tutoring environment, not a chat box.
4. **Linear / Notion / Vercel cool-tech aesthetic** — high-density, monospace, terminal vibe. Sophicly is humanist, not engineering-cool.
5. **EdTech-cream** — ivory backgrounds, Garamond, soft rounded corners, "warm and friendly". Sophicly is exam-serious.
6. **AI-typical purple gradients** — see DESIGN.md. Sophicly's purples were chosen pre-AI and are brand identity.

## Strategic principles

1. **Every analytical claim anchors to a quotation.** This applies to AI feedback, model answers, crib sheets, every piece of analytical content. Students always ask for quotes — assume the question, answer it pre-emptively.
2. **No vague gestures.** If copy says "the controlling concept" or "the key part", the next sentence MUST name which part. No abstract gestures.
3. **Pedagogy over UX cleverness.** When a UX tweak conflicts with the way teachers actually teach the mark scheme, teachers win.
4. **Enhance existing work, don't overcorrect.** Sophicly UI is ~80% right. Prefer additive changes and targeted fixes over rewrites.
5. **Surface best-practice risks before building.** Founder is a teacher, not a dev. Flag known pitfalls (toasts without dismiss, modals without scroll iso, destructive without confirm) as one-line suggestions before coding. Wait for acknowledgement.
6. **Automate by default.** Sophicly is huge and growing. Derive from bridge / course map / structure where possible. Avoid per-lesson manual config.

## What "good" looks like

Reference designs Sophicly is proud of (study these before designing anything new — see DESIGN.md §0):

- LearnDash SPA pages
- Landing page + full-screen menu + mobile menu
- About page (serif-led, unique)
- Library text page header (excerpt under heading)
- Single course page
- Push buttons (signature gradient)
- Black neumorphic + light blue neumorphic buttons
- Library copy-button with wave-hover effect
- Sidebar (always dark, brand gradient, doesn't invert with theme)

If a new design looks worse than these, the new design is wrong.

## Out of scope

- Public marketing copy revisions (handled by founder directly)
- Pedagogical content (model answers, mark schemes, crib sheets — owned by founder, edited only on instruction)
- A/B testing infrastructure (Sophicly trusts pedagogy + craft over experimentation at current scale)

## Pointers

- Brand & design tokens: [DESIGN.md](DESIGN.md) (mirrors `sophicly-plugins/BRAND.md`)
- Project rules: [CLAUDE.md](CLAUDE.md)
- Cross-plugin deploy SOP: `~/.claude/plans/sophicly-deploy-sop.md`
