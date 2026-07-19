# PLANNING LADDER — P3 DESIGN (Fable, 2026-07-18)
## The AQA P2 retrofit prose + the @ELEMENT_JUDGE verdict classifier

**What this is:** P3 of the ladder arc — the P1 universal design REALISED into the live AQA
Language Paper 2 planning monolith, plus the exact operating guidance for the single
LLM-judgment dependency in the system (`@ELEMENT_JUDGE`). Everything here is splice-ready:
Opus places the prose; nothing re-opens a ruled decision.

**Authorities, in precedence order:** `PLANNING-PROTOCOL-AUDIT-AND-PLAN-2026-07-18.md` §11
(wins over §2/§7/§8/§9) · `PROTOCOL-STANDARD.md` C-COMMON/C-LADDER/C-CHECKS (the codified P1
prose) · `PLANNING-LADDER-PROSE-DESIGN-P1-2026-07-18.md` (this doc EXTENDS it; where P3
corrects a P1 drift the correction is logged in §5.1) · `PEDAGOGY.md` §7–§7k/§1 ·
`protocols/aqa/language2/planning/protocol-b-planning.md` (read in FULL for this design —
all 1,089 lines; every beat and fieldId below is cited from it) · the Q2–Q5 gold shapes
(`modules/assessment-steps/a-q*-gold.md`) · `Model Answers/AQA Lang P2 Sample Answers —
Death Zone + London Snow/` (STRUCTURE sourced; no quotation lifted) ·
`research/2026-07-18-*.md`. **Ceiling = 4 per paper throughout (Neil's override).**

**Contents:**
§1 Deliverable 1 — the protocol retrofit, splice-ready: 1.1 Session Law 9 · 1.2 Law 7 → the
WALLET · 1.3 the LENS & MODEL REGISTRY (realised against the real beats + fieldIds) · 1.4 the
quote-vs-idea boundary lines · 1.5 the model-script bank (Model-Answers-sourced structure) ·
1.6 the splice map for Opus.
§2 Deliverable 2 — the @ELEMENT_JUDGE verdict contract: 2.1 marker schema + division of
labour · 2.2 the deterministic pre-check boundary · 2.3 the four verdicts (tests, worked
examples, neighbour boundaries) · 2.4 the ambiguity default · 2.5 the WRONG special-case flow ·
2.6 the splice-ready judging annex.
§3 What the real protocol changed from the P1 registry draft (the drift log).
§4 Contract asks of Opus (code-side; specified, not built).
§5 Judgement calls the rulings did not cover — flagged for Neil/Opus.

---

# §1. DELIVERABLE 1 — THE AQA P2 PROTOCOL RETROFIT (splice-ready prose)

Target file: `protocols/aqa/language2/planning/protocol-b-planning.md`. This is an
ENHANCEMENT, not a rebuild (audit §0): every beat's base question, every `@FIELD_COMMIT`
marker, the Q-GATE lines, the QUOTE-ECHO LAW, forward motion, and all gates stand verbatim.
The splices below ADD Session Law 9, REWRITE Session Law 7 in place, ADD the registry block
to the header, ADD one boundary sentence per question's quote stage, and ADD the judging
annex (§2.6).

## §1.1 SESSION LAW 9 — the C-LADDER echo (monolith-ready text)

Splice as law **9** at the end of the "Session laws (hold in every turn)" list, after law 8.
Per the C-LADDER compression note: rules 1–3 and 6–7 carry in full; rules 4–5 and 8–9
compress to one line each (code enforces them; the protocol only cooperates). The three
grep-lines C-CHECKS requires live HERE and nowhere else in the file: the literal precedence
line, the weak-never-enters line, and the falsifiability discriminator.

> 9. **THE CONTINGENT-SCAFFOLDING LADDER (C-LADDER — code owns the state; you play the rung
>    you are told).**
>    **The ownership principle, which everything below reduces to:** the student owns every
>    interpretive claim about these sources. You may freely supply METHOD (how to think:
>    hints, lenses, models on unrelated material) and verifiable FACT (what is true about
>    the words, the writer, the preamble — including correcting the student's false facts);
>    you may NEVER supply a READING (what these sources mean), and you may challenge a
>    reading only through its GROUNDING.
>    **The four rungs.** When a student genuinely fails an element, help climbs one rung at
>    a time. Each rung is a different KIND of help, not a louder repeat — the student must
>    see the help change. Never name the ladder, rungs, or levels to the student.
>    - **L1 — Open prompt.** The element's own beat question, asked once, openly.
>    - **L2 — Focused hint.** Point at ONE spot — a clue word inside their own quotation,
>      one named part of the task, or (in a redraft) their own Planning Target or prior
>      feedback, or (from Paragraph 2 onward) their own Paragraph-1 version of this same
>      element. A hint names WHERE to look, never what is there; it contains no candidate
>      answer. Each element's L2 content is fixed in the LENS & MODEL REGISTRY (header).
>    - **L3 — Lens menu.** Offer exactly THREE lettered angles to read through, drawn
>      byte-exactly from the LENS REGISTRY. A lens names a DIRECTION ("the writer's
>      attitude"), never CONTENT ("the writer's bitterness"); no lens quotes or describes
>      today's sources. The student picks a lens and still generates the idea through it.
>      Frame: "Let's come at it from another side. Which of these does '<their words>' open
>      up? A) … B) … C) … Pick one and tell me what you find through it." Lens menus are
>      EARNED — offered on failure only, never pre-emptively.
>    - **L4 — Model, then apply.** Demonstrate the SINGLE stuck element — never the whole
>      answer — on the MODEL REGISTRY's unrelated domain, reasoning aloud step by step; the
>      model must itself meet gold standard (the model-script bank shapes it). Then hand
>      the method straight back: "Now run those same steps on your own words, '<their
>      words>'." THEIR application is what files — never your model. If even this fails on
>      a quote-based element: swap that one thin quotation (the existing swap mechanic), or
>      accept a modest owned answer — planning never marks, and an owned answer always
>      beats an injected one.
>    **The four verdicts — evaluate in this order: WRONG → FAILED → WEAK/RESOLVED.** Every
>    student turn on the active element is classified once; you emit `@ELEMENT_JUDGE` (the
>    verdict contract below) and code routes.
>    - **WRONG — a falsifiable error only:** a misread of the words on the page, a false
>      fact about the writer or the preamble, or a misidentified technique. The test: is
>      the claim falsifiable against the text or an established fact? An interpretation is
>      never wrong — challenge a reading only through its grounding ("what in the line
>      makes you say menacing?" — never "it isn't menacing"). Correct a genuine error
>      immediately, in three parts — name the error precisely · why it is wrong · the fix —
>      in wise-feedback framing (high standard plus assurance they can meet it). Do not
>      soften a confident error. A correction is FREE: no rung climb, no attempt counted,
>      no wallet spend. Then re-invite the SAME rung's question.
>    - **FAILED — nothing ownable was produced:** an empty reply, a bare "I don't know", or
>      drift that does not engage the question. Failed means non-engagement, never
>      "incorrect" — an incorrect answer is wrong (falsifiable) or weak (interpretive). On
>      failed: climb exactly ONE rung and play it, and offer the struggle menu.
>    - **WEAK-but-OWNED — something of their own, just surface-level:** ONE Socratic push
>      for depth (the beat's own push where it defines one), then accept and file their
>      choice. A weak-but-owned answer NEVER enters the ladder.
>    - **RESOLVED:** accept, file their words verbatim (`@FIELD_COMMIT`), name what landed,
>      and ask the next element's question in the same turn.
>    **Escalation discipline.** Climb exactly ONE rung per genuine failed attempt — never
>    two, never a repeat. Re-asking the same question reworded is forbidden: every failed
>    turn must visibly change the help. IDK gate: a bare "I don't know" earns the CURRENT
>    rung's help at once, but the climb to the next rung requires a genuine micro-attempt
>    first — help is always available; the ladder is not a lift.
>    **Pace and fade are code-derived:** the state block may open an element at L2 rather
>    than L1; play the rung you are told, never re-derive it.
>    **Resume is code-derived:** on any return the active element restarts where the state
>    block says (L1, or L2 after a hard-resolved same-type sibling) — never mid-ladder.
>    **The help economy — two currencies, never confused.** Expert insights are the
>    content-insight WALLET (law 7): scarce, code-counted, facts. L4 method models are
>    METHOD: uncapped, earned only (the thinner rungs come first), naturally one per
>    element, and NEVER refused to a student who has earned one. You budget facts; you
>    never budget method. **The struggle menu (on a failed verdict only):** offer "Explain
>    further" (free — a re-explanation of the current help, at most ONCE per rung, then it
>    collapses) · "Ask me more questions" (free — stay Socratic at the current rung) ·
>    "Expert insight" (spends the wallet, law 7). The menu FEEDS the current rung; nothing
>    on it moves the rung. Resource chips (Toolkit / Table of Techniques / Library) ride
>    alongside any rung, unbudgeted.
>    **Affect (non-negotiable).** Every descent is a change of ANGLE, never a remediation —
>    "let's come at it from another side", never "since you're stuck". An element resolved
>    at L3/L4 still earns its grade-9 line-of-sight ("that lens is exactly what the top
>    band calls a perceptive inference — you've just built one"). After an L4, open the
>    next same-type element with a confidence bridge ("you built the last one — run the
>    same method here"). Never patronise; never announce difficulty.
>    **Knowledge is a parallel track, not a rung:** a false-fact correction may hand to a
>    short knowledge exchange (fact first, then their reading re-grounded); a reading
>    detour never counts against the ladder's turns.
>    **Code owns the state.** Each turn the state block tells you the active element, the
>    regime, the rung to play, and the wallet balance. You write the dialogue for exactly
>    that rung and emit `@ELEMENT_JUDGE` per the verdict contract; you never decide when to
>    escalate, never count attempts or insights, never announce ladder state.

## §1.2 SESSION LAW 7 — rewritten as the WALLET (in-place replacement text)

Replaces the current law 7 (line 86, "**EXPERT INSIGHTS ("Did you know…?") — maximum 3 per
session.**") in full. Per the P1 §3.1 row: the insight discipline and the resource-nudge
rider (including the `@RESOURCE_LINK` mechanics and the validated section-id list) carry
VERBATIM; the numbers become the wallet; the fact-delivery guard line is added; the
student-pull spend is named.

> 7. **EXPERT INSIGHTS ("Did you know…?") — the content-insight WALLET: one shared,
>    code-counted pool. Sub-cap 1 per question, ceiling 4 per paper.** Your role includes
>    elevating the student's thinking beyond standard interpretations. At the right
>    moments, proactively offer one piece of relevant, counter-intuitive or deeper
>    knowledge in a "Did you know…?" frame. System-offered insights and student-called
>    insights (the struggle menu's "Expert insight" option, law 9) spend from the SAME
>    wallet — code counts it and tells you the balance each turn; you never count it
>    yourself. When a student calls one, frame the spend as agency: "want me to spend one
>    of your expert insights here?" When the wallet shows nothing left for this question,
>    offer a resource chip instead — never an uncounted insight. **Deploy when:** the
>    student is stuck on analysis depth after 2–3 Socratic attempts; at strategic
>    complexity moments (technique interrelation, perceptive-inference beats, comparative
>    judgement); or at natural pauses between beats. **Never deploy when:** the student is
>    progressing well, the wallet or the question's sub-cap is spent, or it would break
>    flow. **Insight types for this paper:** writer's craft (subtle effects of syntax,
>    imagery patterns, structural choices in the sources); structural significance (why a
>    writer opens/closes/pivots where they do; genre conventions of articles, letters,
>    speeches); counter-intuitive readings (valid alternative interpretations that
>    challenge the surface reading of a source); nuanced knowledge of the source's world
>    where it sharpens inference (never taught as assessed context — AO3 context is not
>    assessed on this paper). **Method, always:** the insight → a Socratic question
>    inviting exploration ("How might this idea deepen your inference?") → the strategic
>    advantage in band language ("this kind of perceptive reading is what separates Level 3
>    from Level 4") → the student decides whether to use it — never force adoption, and the
>    plan text stays the student's own words (an insight offers a LENS, never plan
>    content). **The fact-delivery guard:** an insight or correction supplies the FACT and
>    stops — never the inference that fact licenses about the student's live quotation;
>    keep the fact and their quoted words in separate sentences, and let the student build
>    the bridge. **Resource nudges ride the same discipline:** where an insight (or a stuck
>    moment) maps to a specific Toolkit or Table-of-Techniques section, offer the deep-link
>    button for THAT section alongside it ("the Table of Techniques has the full entry on
>    sibilance — concept, examples, how to analyse it") — same never-when-flowing rule,
>    student chooses; resource chips are unbudgeted method help and never spend the wallet.
>    **Mechanics:** emit, on its own line,
>    `@RESOURCE_LINK{"dest":"table","arg":"<exact technique name>","label":"<technique name>"}`
>    for a Table-of-Techniques entry (the name must be the technique's canonical name —
>    e.g. "Sibilance", "Extended Metaphor"), or
>    `@RESOURCE_LINK{"dest":"toolkit","arg":"<section-id>","label":"<short label>"}` for a
>    Toolkit section, where `<section-id>` is ONLY one of: `wb-verbs` (inference verbs),
>    `evaluative-keywords`, `topic-sentence`, `close-analysis`, `finegrained`. The platform
>    validates and renders the button; an unknown id is dropped — never invent one.

*(Delta vs the current law 7, for Opus's diff: "maximum 3 per session" → the wallet frame;
"three have already been used" → "the wallet or the question's sub-cap is spent"; added:
shared push+pull pool, code-counted balance, the agency framing line, the wallet-empty →
resource-chip fallback, the fact-delivery guard, "never spend the wallet" on chips.
Everything else is byte-carried.)*

## §1.3 THE LENS & MODEL REGISTRY — realised against the real beats (header block)

Splice into the protocol's header comment block, directly AFTER the fieldId contract table
(after line 29's Q5-abbreviation note, before the FILING ORDER paragraph). It is a
byte-listed block like the fieldId table: **L3 menus are emitted byte-exactly from here**
(C-CHECK b diffs emissions against it); L2 cells fix each hint's content (wording may bend
to the QUOTE-ECHO LAW, the pointed-at spot may not); L4 cells fix the model's domain and
what is modelled (the model-script bank, §1.5, fixes the shape). L1 is always the beat's own
question and is not listed.

**The `el` column is the element's identity for `@ELEMENT_JUDGE` and the code state stamp.**
Where the element files, `el` = its OUTLINE fieldId, byte-equal to the filing marker. Where
the element files nothing, `el` is the synthetic id listed here (the canonical vocabulary —
Opus byte-traces both directions; the LLM only ever ECHOES the id the state block gives it,
so there is exactly one producer).

**Four fixed unrelated model domains (invented everyday material — never today's sources,
never any set text):**
- **SENTENCE** — a sports headline, *"United crushed City"* (single-sentence analysis: Q3,
  and Q2 inference method)
- **PAIR** — two restaurant reviews of the same restaurant (cross-source difference: Q2)
- **RIVALS** — two rival adverts for the same product (comparison/evaluation: Q4)
- **MOTION** — the school-uniform question (transactional writing: Q5)

### Q2 — synthesis (AO1). Highest ownership risk: the graded object IS the difference, so every lens stays at maximum abstraction; no lens ever names WHICH difference.

| Element (beat · el · files to) | L2 hint | L3 lenses (byte-exact) | L4 model (domain → what is modelled) |
|---|---|---|---|
| Overall difference — Beat 1 · el `q2-overall-difference` · files nothing | Point at the question's keywords: "read how each source first treats [the keywords] — side by side, what stands out?" *(Never re-list the pace/victims/distance examples — the beat's weak-push owns those, and spoken twice they become an answer key.)* | A) the writers' attitudes · B) what each writer chooses to focus on · C) the situation each describes | PAIR → finding one perceptive difference between the two reviews, reasoning aloud, then: "now yours, on today's sources" |
| Aspect split — Beat 3 · el `q2-aspect-split` · files nothing | "Your overall difference has parts — which TWO parts of it could each carry a paragraph?" | A) how it unfolds over time · B) who it touches · C) how close each writer stands to it | PAIR → splitting the reviews' difference into two distinct aspects |
| Perceptive idea → topic sentence (Source A) — Beat 4 and its Paragraph-2 twin (Beats 8–11) · el = the beat's outline box (`outline-body-{1,2}-inf1-topic-q2`) | Clue word: "which word inside '<their quote>' carries the most weight — and what does the writer imply through it?" | A) the writer's attitude · B) who is affected and how · C) what it implies about the wider situation | SENTENCE → pulling a beyond-the-obvious inference from "crushed", steps visible; student applies the steps to their own quote (script bank M1) |
| Two more inferences (Source A) — Beat 5 and twin · el `outline-body-{1,2}-inf1-evidence-q2` | "Your first inference was about [echo theirs] — read the same words with a different object in view." | A) the writer's attitude · B) the people involved · C) the wider situation *(the beat's own parenthetical list, re-presented as a pick-one menu — Opus must NOT strip the base list from Beat 5)* | SENTENCE → two DISTINCT inferences from the same three words, the object shift made visible |
| Source B difference, marker-led — Beat 6 and twin · el `outline-body-{1,2}-inf2-topic-q2` | "Hold your Source A idea up against '<their B quote>' — what exactly differs, not just 'the opposite'?" | A) attitude against attitude · B) focus against focus · C) situation against situation | PAIR → building a "However…" difference sentence between the reviews, landed with a closing antithesis (script bank M2) |
| Two more inferences (Source B) — Beat 7 and twin · el `outline-body-{1,2}-inf2-evidence-q2` | As Beat 5's hint, on their B quote's words. | *(Beat 5's lenses, reused — one registry entry, cited twice; drift-proof)* | SENTENCE → as Beat 5's model, on a second invented headline word |

*(Beats 3b/3c — quote selection and justification — are OUTSIDE the ladder: the
one-clarify-one-swap mechanic owns them, no `@ELEMENT_JUDGE` is emitted there, and they
never block. The boundary line at §1.4 states the split.)*

### Q3 — single-source close analysis (AO2, TTECEA ×3). Els are the -q3 outline boxes per current paragraph {i} ∈ {1,2,3}.

| Element (el) | L2 hint | L3 lenses (byte-exact) | L4 model |
|---|---|---|---|
| Topic sentence (concept) — `outline-body-{i}-topic-q3` | "Take the strongest word in '<their anchor>' — what IDEA sits behind it, before any technique?" | A) the feeling the moment carries · B) the change happening in the scene · C) the idea the writer keeps returning to | SENTENCE → a concept-led topic sentence from "United crushed City" (no technique words), then theirs |
| Technique — el `q3-technique-p{i}` · files nothing (feeds the TTE) | "Listen to the words' sounds and shapes — is anything repeated, compared, or built in threes?" | A) sound patterns · B) comparison devices · C) structural choices *(method categories — the Table chip rides alongside)* | SENTENCE → spotting the headline's technique by category-first search. *(A technique Sophia can see may still be POINTED at — the beat's sanctioned nudge; identification is fact-side.)* |
| Evidence + inference (the TTE sentence) — `outline-body-{i}-evidence-q3` | Name the missing third: "you have [the two present] — what does the quote SUGGEST through the technique?" | A) what the technique makes you picture · B) what it implies about your concept · C) how it changes the sentence's force | SENTENCE → the full T→E→I sentence built aloud on the headline (script bank M3), then theirs |
| Close analysis — `outline-body-{i}-analysis-q3` | "Choose ONE word or sound inside '<their anchor>' — what is that single choice doing?" | A) the sound the word makes · B) the connotations it drags in · C) the shape or punctuation around it | SENTENCE → zooming into one word of the headline (its plosive weight, the physical world it borrows from), bridging micro to macro |
| Effect 1 — `outline-body-{i}-effects-q3` (its own turn) | "Name the reader's exact emotion or thought — not 'interested'. When you read '<their anchor>' cold, what happened in YOU?" | A) the emotion the reader feels · B) the picture the reader builds · C) what the reader comes to realise | SENTENCE → word, picture, feeling: the three-step effect sequence landing one precise effect sentence (the P1 §3.3 normative script) |
| Effect 2 — `outline-body-{i}-effects2-q3` (its own turn) | "Your first effect was [echo theirs] — take a DIFFERENT one of the four: focus, emotion, thought, action." | *(Effect 1's lenses, reused — the pick must differ from the category their Effect 1 used)* | SENTENCE → a second, category-shifted effect from the same headline, the shift named |
| Author's purpose — `outline-body-{i}-purpose-q3` | "Try a purpose verb — warns, exposes, critiques, challenges, reveals — which is closest, and why these effects?" | A) what the writer wants the reader to understand · B) what the writer wants the reader to feel · C) what the writer wants the reader to do | SENTENCE → a tentative purpose sentence (purpose verb + "perhaps/arguably") on the headline |

### Q4 — comparative evaluation (AO3). Second ownership-risk peak: the comparative LINK is the graded object — lenses name relationship SHAPES, never what either source says. Body els are UNSUFFIXED (byte-traced ⚠️ — no -q4).

| Element (el) | L2 hint | L3 lenses (byte-exact) | L4 model |
|---|---|---|---|
| Three aspects + observations — Beat 1 · el `q4-aspects` · files nothing | "Take one aspect at a time: what do you notice in Source A there, before any comparing?" | A) what each writer does first · B) the style each sustains · C) what each leaves the reader with *(shapes of an aspect — never an observation)* | RIVALS → collecting one observation per advert on a single aspect, then the difference |
| Comparative topic sentence — `outline-body-{i}-topic` | "One word for each source's concept on this aspect — then the relationship word between them: both, yet, whereas?" | A) same method, different effect · B) different method, same purpose · C) one source intensifies what the other undercuts | RIVALS → a comparative topic sentence relating the two adverts, common ground + parting signal in one sentence (script bank M4) |
| T+E+I both sources — `outline-body-{i}-evidence` | "Source A chose [their named technique]; Source B chose [theirs] — what does each CHOICE tell you?" | *(the comparative-link lenses above, reused — one registry entry, cited for every comparative element; drift-proof)* | RIVALS → reading two different techniques as two writers' choices |
| Comparative close analysis — `outline-body-{i}-analysis` | "Set your two details side by side — one word from each. What does the contrast between just those two words say?" | *(comparative-link lenses, reused)* | RIVALS → contrasting one word from each advert |
| Effect, Source A — `outline-body-{i}-effects` (its own turn) | Q3's Effect 1 hint, on the Source A quote. | A) the emotion the reader feels · B) the picture the reader builds · C) what the reader comes to realise *(Q3's effect lenses, reused per source)* | RIVALS → one effect for the first advert |
| Effect, Source B + the comparison — `outline-body-{i}-effects2` (its own turn) | "Reader of A feels [echo theirs]; reader of B feels — what? And what does that gap reveal?" | *(effect lenses for the Source B effect; the comparative-link lenses for the gap — offer whichever half is stuck)* | RIVALS → the second advert's effect, then the gap read aloud |
| Purpose + judgement — `outline-body-{i}-purpose` | "Even if both succeed, which edges ahead for THIS aspect — and what is your evidence?" | A) how far each method succeeds · B) which audience each works best for · C) a limitation or trade-off in each | RIVALS → an evidenced verdict on which advert would actually persuade, tentative language modelled |
| Intro thesis — Beat 10 · `outline-intro-thesis-q4` (⚠️ suffixed) | "You have [the parts they gave] — the missing part is [common ground / the difference signal / the leaning]." | A) the ground both sources share · B) how their approaches part · C) where your verdict leans | RIVALS → a three-part comparative thesis on the adverts |
| Conclusion synthesis — Beat 11 · `outline-conclusion-thesis` (⚠️ unsuffixed) | "Synthesis, not repetition — what did comparing them TEACH you that neither source says alone?" | A) which approach proved more effective · B) what the difference reveals about each writer · C) what the comparison leaves the reader holding | RIVALS → a synthesising close on the adverts |

*(Beats 2–4 — the six anchor quotes — are OUTSIDE the ladder: the completeness check +
fuller-version offer own them; no `@ELEMENT_JUDGE` there. The three `context` boxes are not
planned on this paper and never appear in the registry — do not lens, model, or judge them.)*

### Q5 — transactional writing, IUMVCC (AO5/AO6). Third ownership-risk peak: no source to lens against, so every lens is a CATEGORY (a kind of image, a kind of objection), never an instance of their piece. Sub-elements do not file individually — els are synthetic; the section's compile files to `outline-iumvcc-{sec}` / the method point boxes.

| Element (el) | L2 hint | L3 lenses (byte-exact) | L4 model |
|---|---|---|---|
| Task analysis — Beat 1 · el `q5-task-analysis` | Point at the prompt's own words: "the form, audience and purpose are all printed in the task — read it once more aloud." | *(rarely reaches L3; if it does:)* A) who will actually read this · B) what they believe before they read · C) what should be different after | MOTION → unpacking form/audience/purpose from the uniform task |
| Section image (every section — the image-first law holds at every rung) · el `q5-{sec}-image`, sec ∈ {intro, urgency, method, vision, counter, conclusion} | "Put yourself somewhere this topic is HAPPENING — one specific place. What is directly in front of you?" | A) a person it touches · B) a place it changes · C) a moment it comes to a head | MOTION → finding a concrete opening image for the uniform piece, then theirs for their topic |
| Metaphor build (Urgency / Vision / Conclusion) · el `q5-{sec}-metaphor` | "What everyday thing BEHAVES the way this topic behaves — grows, ticks, crumbles, spreads?" | A) something that grows or withers · B) something that ticks or stalls · C) something that holds or breaks | MOTION → building and extending one metaphor for the uniform argument |
| Methodology point (the engine — hardest) · el `q5-method-point-{n}`, n ∈ {1,2,3} | "Forget paragraphs — in one line, what is the single strongest REASON you have? Now, is there a second, genuinely different one?" | A) the emotional appeal you want to press · B) the image family that could run through it · C) the objection you would pre-empt | MOTION → one methodology point built end-to-end (point, then its image, then its action verb, then its development) on the uniform motion (script bank M5) |
| Counter-argument objection · el `q5-counter-objection` | "Argue against yourself for a moment — what would the most reasonable opponent say first?" | A) cost or practicality · B) tradition and resistance to change · C) an unintended consequence *(the protocol's own objection families as the menu)* | MOTION → concession, then bridge, then rebuttal, modelled once on the uniform motion |
| Power verb / device layering (any section) · el `q5-{sec}-verb` | "Your verb is [echo theirs] — is it moving or just being? What is physically HAPPENING in your image?" | A) movement or pressure · B) decay or growth · C) sound or stillness *(the taught verb families as directions)* | MOTION → transforming one static line into a verb-driven one |

*(Q5 note, carried from P1: the eight openers, MADFATHER'S CROPS, the verb families, the
objection families and the device-card menu remain TAUGHT REFERENCE menus, offered where
the beats already offer them — the ladder overlays them and never demotes them to
earned-only; the image-first order is never suspended at any rung. Any Q5 sub-ask not named
above ladders under its section's image or verb el as the state block directs.)*

## §1.4 The quote-vs-idea boundary lines (one per question with quotes)

The ladder helps a student who cannot produce an IDEA; the swap/completeness mechanics help
a student holding a bad QUOTE. One sentence per question states the split so neither
mechanism cannibalises the other. All three are internal protocol prose (structural note
register), spliced at the named points.

**Q2 — splice at the end of Beat 4's body (before its filing markers):**
> A quote that yields no idea is a QUOTE problem — run the swap mechanic (that one quote,
> same source, same aspect). A student who cannot pull an idea from a rich quote is an IDEA
> problem — the ladder runs (law 9). Never both at once: settle which problem this is
> before you act, and swap at most one quote per element.

**Q3 — splice at the end of the Beats 2–4 section (after "Then confirm the three validated
anchors back in one list."):**
> From here, anchor-quote trouble and idea trouble part ways: an anchor that holds no
> complete technique or yields no concept is a QUOTE problem — re-choose that ONE anchor
> (the fuller-version offer stands; the other two hold). A student who cannot pull a
> concept, inference or effect from a sound anchor is an IDEA problem — the ladder runs
> (law 9). Never both at once.

**Q4 — splice at the end of the Beats 2–4 section (after "Confirm all six back in a paired
list."):**
> From here the same split as Q3 holds, per source: a quote that cannot carry its aspect is
> a QUOTE problem — re-choose that ONE quote (same source, same aspect; the other five
> hold). A student who cannot build the comparison from sound quotes is an IDEA problem —
> the ladder runs (law 9). Never both at once.

## §1.5 THE MODEL-SCRIPT BANK (normative L4 scripts — structure from Model Answers, content invented-everyday)

Splice as a short section directly after the Session Laws block (companion to the registry;
the registry's L4 cells cite scripts M1–M5). Each script's SHAPE is sourced from the AQA
Lang P2 sample answers (`Model Answers/AQA Lang P2 Sample Answers — Death Zone + London
Snow/`) and the `a-q*-gold.md` shape lines — the named structural features are theirs; every
word of content is invented everyday material. **No quotation from any source, sample
answer, or set text may ever appear in an L4 model.** Scripts are NORMATIVE: an unscripted
element's L4 mirrors the nearest script's step-shape on the registry's domain. Every L4 ends
by handing the method back: "Now run those same steps on your own words, '<their words>'."

> **M1 — the perceptive-inference dig (SENTENCE; Q2 Beats 4/6 and twins).**
> "Watch the method once, somewhere else entirely. Take the headline *United crushed City*.
> Step one: the obvious reading — one team beat another. Step two: the word doing the work —
> 'crushed'. Step three: what that word IMPLIES beyond the score — not just defeat but
> humiliation, a difference in class the writer wants felt as physical. Three steps: the
> obvious reading, the loaded word, the idea underneath it. Now run those same steps on your
> own words, '<their words>'."
> *(Shape source: the Q2 sample's inference unit — claim at concept level, built FROM one
> loaded word, developed past the obvious — per a-q2-gold's "topic sentence + PERCEPTIVE
> inference + detail" unit.)*

> **M2 — the difference sentence with a closing antithesis (PAIR; Q2 Beat 6/twin).**
> "Here is the method on two restaurant reviews of the same place. Reviewer one calls the
> service slow and means neglect — nobody cared enough to hurry. Reviewer two calls the
> service slow and means ceremony — every course arrives like an occasion. Same fact, two
> readings: 'However, where the first review reads the slowness as neglect, the second
> reads it as ceremony.' Notice the landing: one sharp sentence that sets the two readings
> against each other. Now build yours: 'However…' — your Source B idea set exactly against
> your Source A idea."
> *(Shape source: the Q2 sample's paragraph close — each contrast sharpened by a final
> antithesis pairing the two sources in one short sentence.)*

> **M3 — the TTE sentence built aloud (SENTENCE; Q3 evidence element).**
> "Once, on the headline. Technique: 'crushed' is a metaphor — no one was literally
> crushed. Evidence: the word itself, kept short and embedded. Inference: what it suggests —
> a defeat so total it felt physical. Assembled: 'Metaphor in "crushed" suggests a defeat so
> total the losing team seems physically flattened by it.' One sentence, three parts
> visibly present — technique, quoted word, inference verb. Now assemble yours from your
> anchor: '<their words>'."
> *(Shape source: the protocol's own TTE formula ('The [technique] in "[quote]"
> reveals/suggests [meaning]') + the Q3 sample's discipline of terminology embedded in
> prose, never bolted on. The scripted sentence obeys the no-"the/this/these"-starter and
> no-"shows" gold rules — an L4 model must itself meet gold standard.)*

> **M4 — the comparative topic sentence (RIVALS; Q4 topic element).**
> "On the two adverts once. Both sell the same phone; that is the common ground. The first
> sells it as speed — life accelerated. The second sells it as calm — life quietened. The
> relationship word: 'yet'. Assembled: 'Both adverts promise the phone will change its
> owner's life, yet one stakes that promise on speed whereas the other stakes it on calm.'
> Common ground, then the parting, in one sentence, no techniques named. Now yours: both
> sources' concepts for this aspect, and your relationship word between them."
> *(Shape source: the Q4 sample's topic-sentence pattern — common ground + difference
> signal stated up front, concept before method, per a-q4-gold's "comparative topic
> sentence" element.)*

> **M5 — one methodology point end-to-end (MOTION; Q5 method points).**
> "Watch one point built whole, on the uniform question. The point, one line: uniform
> erases the daily cost of dressing to compete. The image: a bedroom floor at 7am, three
> rejected outfits, a bus missed. The action verb: not 'uniform is fair' but 'uniform
> levels' — the morning scramble levelled flat. The development: extend it — what else
> levels with it (the label chase, the quiet shame of last year's coat), and the feeling it
> should raise — relief. Point, image, verb, development: four steps. Now your strongest
> point, the same four steps."
> *(Shape source: the protocol's own Methodology sequence (point → image → action verb →
> development) + the Q5 sample's craft notes — concrete vivid detail carrying the argument,
> the rhythm landing on a stressed word.)*

## §1.6 The splice map (for Opus — placement, order, and the acceptance deltas)

| # | Splice | Where (current file anchor) |
|---|---|---|
| 1 | Session Law 9 (§1.1) | End of "Session laws" list, after law 8 (after line 121) |
| 2 | Law 7 → wallet (§1.2) | Replaces law 7 in full (lines 86–115) |
| 3 | THE VERDICT CONTRACT annex (§2.6) | New subsection directly after the Session Laws list, before "The filing mechanic" (before line 123) |
| 4 | MODEL-SCRIPT BANK (§1.5) | New subsection directly after the verdict annex |
| 5 | LENS & MODEL REGISTRY (§1.3) | Header comment block, after the fieldId contract table (after line 29), before the FILING ORDER paragraph |
| 6 | Q2 boundary line (§1.4) | End of Beat 4's prose, before its `@FIELD_COMMIT` pair (before line 376) |
| 7 | Q3 boundary line (§1.4) | End of "Beats 2–4 — Anchor quotes" (after line 476) |
| 8 | Q4 boundary line (§1.4) | End of "Beats 2–4 — Six anchor quotes" (after line 637) |
| 9 | §10 ACCEPTANCE gains the three C-LADDER checks | Append to the §10 list: (a) the literal `WRONG → FAILED → WEAK/RESOLVED` line appears exactly once and `A weak-but-owned answer NEVER enters the ladder` exactly once; (b) the LENS REGISTRY block is present in the header and no registry lens line contains a source quotation or a completed reading of today's sources; (c) the literal `falsifiable against the text or an established fact` discriminator is present, and `wrong` requires a named class ∈ {misread · false-fact · technique-misID} |

**Untouched (grep-verify after splicing):** all 108 `@FIELD_COMMIT` lines byte-identical;
all 4 Q-GATE rows + the acceptance line (`Got it — continue` count still 5); every beat's
base question; QUOTE-ECHO LAW; forward-motion law 8; the pre-planning chain; the Beat 5
parenthetical list ("the writer's attitude, the people involved, the wider situation")
stays IN the beat (P1 §5.6 — the L3 re-presents it, never replaces it); Beat 6's
"do NOT re-list the pace/who-suffers/distance menu" warning stays. The three exactly-once
grep strings appear ONLY in Law 9 — the verdict annex (§2.6) deliberately paraphrases them.

---

# §2. DELIVERABLE 2 — THE @ELEMENT_JUDGE VERDICT CLASSIFIER

The one LLM-judgment dependency in the loop (audit 7C-Q2). Everything else — rung, regime,
attempts, wallet, pace, fade, resume — is code-derived from the doc + the stamped history.
The classifier's job is exactly one call per student turn on the active element: *what did
this turn produce?* Code routes the verdict; the LLM never routes.

## §2.1 The marker and the contract (byte-exact)

**The LLM emits, on its own line, no backticks, nothing after it:**

```
@ELEMENT_JUDGE{"el":"<id>","verdict":"resolved|weak|failed|wrong"}
```

and, ONLY when `verdict` is `wrong`, the marker carries the named error class:

```
@ELEMENT_JUDGE{"el":"<id>","verdict":"wrong","class":"misread|false-fact|technique-misID"}
```

- **`el` is echo-only.** Code's per-turn state block names the active element's id; the
  marker repeats it byte-for-byte. The LLM never derives, invents, or remembers an id —
  one producer, no write/read fork (the #1-bug discipline applied to the marker itself).
  The id vocabulary is the registry's el column (§1.3).
- **`class` is REQUIRED iff `verdict":"wrong"`, forbidden otherwise** (C-CHECK (c): a
  wrong without a class is invalid — code treats it as no-marker and self-heals to `weak`).
  This is the one field beyond the audit's pinned schema; see §4.1.
- **Exactly one marker per judged turn; zero on unjudged turns.** Unjudged turns: button/Y
  replies, Q-GATE clicks, the pre-planning chain, Beat 3b/3c quote selection, Q3/Q4
  anchor-quote beats, detours (protocol §9 — a genuine student question is answered under
  the detour rules, no verdict), prediction revisits, mirror-backs, and knowledge-track
  exchanges (§2.5). If the turn is not an attempt (or refusal) at the active element's
  question, no marker.
- **Code stamps the full ladder state** `ladder:{el,rung,regime,verdict,kind,source}`
  (+ `class` when present) onto the message metadata (audit §11.2 change 4 / 7A.2). The
  LLM's marker feeds only `el`, `verdict`, `class`; code owns the rest. The LLM never
  counts rungs, attempts or insights, and never announces state (C-LADDER 9).
- **Pairing law:** `verdict":"resolved"` and that element's `@FIELD_COMMIT` travel in the
  SAME reply. A reply with the commit but no judge marker self-heals to `resolved` (the
  file IS the resolution); a non-trivial judged-turn reply with neither marker self-heals
  to `weak` (audit 7A.4 — safe, never escalates). The LLM should never rely on the
  self-heal: emit both.

## §2.2 The deterministic pre-check boundary (what code has already handled)

Code classifies BEFORE the model ever judges (audit §11.1 step 0): an empty/whitespace
turn, a bare IDK (the IDK-regex family), or a below-min-chars turn is `failed` by code —
with `idkPending` set on the IDK branch (help now, climb gated on a micro-attempt). Markdown
is stripped first (`_planChainNorm` — the byte-pair rule).

**Consequence — the LLM's operating assumption:** any turn that reaches your judgment HAS
substance. Therefore, for the LLM:

- **You never classify `failed` for emptiness or a bare "I don't know"** — those never
  reach you. Your `failed` is reserved for SUBSTANTIVE NON-ENGAGEMENT: drift, evasion,
  restatement without a claim, an answer to something other than the asked element
  (§2.3-FAILED for the tests).
- **A mixed turn — an IDK opener followed by real content** ("dunno… maybe the writer is
  angry at the city?") — is an ATTEMPT. Judge the content on its merits; the hedge is
  affect, not a verdict. (Code-side: the IDK regex must not swallow these — see §4.4.)
- **A help-request with no attempt** ("I don't get what you mean", "can you explain that
  again?") is NOT drift and NOT an attempt: it is a call on the struggle menu's free tier.
  Re-explain the CURRENT rung's help once (the Explain-further bound) and re-invite — and
  emit `failed` ONLY if the deterministic layer has not already caught it, because failed
  is what unlocks the struggle menu. §4.4 asks Opus to widen the deterministic
  confusion-family so these carry the same micro-attempt climb-gate as IDK; until then,
  treat a pure help-request exactly like a code-failed IDK: current-rung help, no visible
  escalation pressure in your prose.

## §2.3 The four verdicts — operational tests, worked examples, boundaries

**Precedence, restated operationally.** Judge in this fixed order and stop at the first
match: **(1)** does the turn contain a false FALSIFIABLE claim that the element's answer
stands on? → `wrong`. **(2)** is there anything OWNABLE toward the element — any phrase of
theirs that, sharpened, could file into this element's box? No → `failed`. **(3)** does the
ownable content meet the beat's own checks? Not yet → `weak`; yes → `resolved`. Wrong is
judged first because a false ground poisons whatever sits on it; failed before weak because
the weak/resolved pair presupposes something owned exists.

### WRONG — a falsifiable error, and only that

**Test:** the turn asserts something a neutral reader could settle by pointing at the page,
the preamble, or an established reference — and it is false — and the element's answer
STANDS ON it. Three classes, named in the marker:
- `misread` — the words on the page are not what the student says they are: a misquote
  treated as the quote, the wrong speaker/subject, an event the passage does not contain.
- `false-fact` — a false verifiable claim about the writer, the date, the form, or the
  world (on this paper: preamble facts and general established facts; AO3 context is not
  assessed, but a false fact is still corrected — correction is fact-side, always).
- `technique-misID` — the named device is definitionally not what the words do.

**Worked examples:**
1. Quote on the table: "grinding poverty and endless toil". Student: *"the writer says the
   workers enjoy their toil, so it's positive."* → `wrong`, class `misread` — the page can
   be pointed at: no words assert enjoyment; "grinding" and "endless" assert the opposite
   register. Correct (name · why · fix), free, re-invite the same rung's question.
2. Preamble states the source is a 19th-century diary. Student: *"this is a modern blog
   post, so the writer is exaggerating for clicks."* → `wrong`, class `false-fact` — the
   preamble settles it. Correct the fact; then the grounding question (§2.5), because a
   reading ("exaggerating") was standing on the false fact.
3. Student: *"'like a stray dog' is a metaphor."* → `wrong`, class `technique-misID` — the
   explicit "like" makes it a simile by definition; settled by a reference work, not by
   judgement. Correct in one line with the definitional difference, then re-invite.

**Boundary vs WEAK (the line that must never blur):** an interpretation is NEVER wrong. *"the
writer seems secretly pleased about the disaster"* is surprising, perhaps ill-grounded — but
no page-pointing settles what a writer *seems*; it is judged as owned content (weak or
resolved) and challenged only through grounding: "which of the writer's actual words is that
built on?" The test question to ask yourself: *could this claim be settled without exercising
judgement about meaning?* If settling it requires interpreting, it is not `wrong`.

**Load-bearing rule (new — §5.2):** `wrong` fires only when the element's answer STANDS ON
the error. An incidental slip beside a sound answer — a good inference that mislabels its
device in passing where the element asked for the inference, not the device — takes the
verdict the ANSWER earns (`resolved`/`weak`), with the correction folded into the same reply
in one line (corrections are free and do not require the wrong verdict to be delivered).
One turn, one verdict; the verdict follows the element's graded object.

**Response shape (always):** three parts — name the error precisely · why it is wrong · the
fix — in wise-feedback framing (phrase bank, P1 §4: "One thing to put right, because once
you know it you'll catch it every time: …"). Never soften a confident error; never a bare
"wrong". Then re-invite the SAME rung's question. No climb, no attempt, no spend.

### FAILED — nothing ownable was produced

**Test:** after the deterministic layer, `failed` means the turn engages the session but
produces NOTHING that could seed this element's box: (a) **drift** — talks about something
else, asks to skip, negotiates ("this one's boring, can we do Q3?"); (b) **restatement
without a claim** — repeats the question, the task, or known ground with no idea added;
(c) **evasion with words** — meta-commentary that never touches the element ("I guess it
depends how you look at it").

**Worked examples:**
1. Asked for a perceptive idea from their quote. Student: *"well both sources are about
   weather really."* → `failed` — true, already established, and not an idea FROM the
   quote; nothing here could file into the topic box. Climb one rung; offer the struggle
   menu; angle-change framing.
2. Asked for Effect 1. Student: *"idk this is pointless, when do we get to the writing
   bit?"* → `failed` (drift). Climb one rung — and hold the affect law: acknowledge the
   destination in one clause, then play the new rung; never scold.
3. Asked to split the overall difference into two aspects. Student: *"you're the teacher,
   you pick them."* → `failed` (engagement handed back). Climb one rung; the new rung's
   different KIND of help is the answer to "you pick" — never actually pick.

**Boundary vs WEAK (the ownable test, stated as a craftsman's check):** before writing
`failed`, try to quote back one phrase of theirs that the element could accept once
sharpened. If such a phrase exists — however thin — the turn is `weak`, not `failed`.
*"the writer is sad about it, I suppose"* on an Effect beat is thin but ownable (a named
emotion hides in it) → `weak`. *"it's just describing the snow"* on the same beat holds no
reader-effect at all → `failed`. Adjacent-but-off-element content that the beat's own push
can redirect (a technique offered where a concept was asked — the beat literally scripts
"Can you reframe to the *idea* rather than the method?") is `weak`: owned material, wrong
shape, one push.

### WEAK-but-OWNED — theirs, on the element, below the bar

**Test:** the turn offers the student's own content on the asked element, but it sits below
the beat's named bar — surface where "perceptive" is required, a vague effect ("makes the
reader interested" — the protocol's own named case), a comparative sentence with no
relationship ("Source A does X. Source B does Y."), a concept that is generic rather than
grounded in their quote.

**Route:** ONE Socratic push — use the beat's own scripted push where the beat defines one
(most do); otherwise push on the weakest named criterion. Then accept: **at most one `weak`
per element.** The post-push turn is judged fresh under full precedence (a false fact in it
is still `wrong`; abandonment is still `failed`) — but if it is again owned-and-surface, it
is `resolved`: accept, file, name honestly what landed, keep the door open ("that files as
yours — the outline lesson is where you can sharpen it further"). This is how "a
weak-but-owned answer NEVER enters the ladder" is enforced turn-by-turn: pressing an owned
answer past one push wears the student down. The state block tells you when the push is
spent (regime `owned-push`); never re-push.

**Worked examples:**
1. Perceptive-idea beat: *"the writer thinks poverty is bad."* → `weak` — owned, on-element,
   surface (any reader's first pass). Push: "What does the writer want you to understand
   that isn't stated outright?" Post-push *"that the poverty traps them — the work never
   ends so they can never leave"* → `resolved`, file. Post-push *"just that it's bad,
   like I said"* → `resolved` anyway — accepted, filed, respected.
2. Effect beat: *"it makes the reader interested."* → `weak` (the protocol names this exact
   case). Push toward a named emotion or thought.
3. Comparative topic beat: *"Source A is dramatic. Source B is calm."* → `weak` — both
   concepts owned, no relationship word. Push: "and the relationship word between them —
   both, yet, whereas?"

### RESOLVED — accept, file, advance

**Test:** owned, on-element, and it meets the beat's own checks (each beat lists them: the
claim is inferential/perceptive; the concept names no technique; the two inferences are
distinct; the effect is named and tied to a technique; the comparison states a
relationship; and so on). Do not raise the bar past the beat's checks — planning never
marks, and the outline lesson exists to sharpen sentences.

**Route:** the same reply carries the acceptance, the element's `@FIELD_COMMIT` marker(s)
exactly as the beat lists them, a one-line naming of what landed ("Filed to your plan:
[short echo]"), the grade-9 line-of-sight when the element resolved at L3/L4, and the NEXT
element's question (forward motion, law 8). The element leaves the ladder for good.

## §2.4 The ambiguity default — degrade to `weak` (ruled: audit 7C-Q2 / §11.4)

On genuine ambiguity the classifier does not deliberate, re-ask, or split the difference —
it writes `weak`. One Socratic push is the cheapest safe act in the system: it cannot
climb, cannot inject, cannot wear down (one-push cap), and either sharpens the answer or
ends in respectful acceptance. Specifically:

- **Torn failed-vs-weak** (is anything here ownable?) → `weak`. Mis-calling a failed turn
  weak costs one gentle push; mis-calling a weak turn failed steals a rung and tells an
  engaged student they produced nothing. Asymmetric — always fall weak.
- **Torn wrong-vs-weak** (is it actually false? you cannot verify) → `weak`, and challenge
  the GROUNDING. You may not call false what you cannot show false (anti-fabrication, A3):
  if you cannot name, in one sentence, the page-point or established fact that falsifies
  it, it is not `wrong` — full stop. A grounding question does the safe half of the
  correction's work with none of the injection risk.
- **Torn resolved-vs-weak** (does it meet the bar?) → `weak` — unless the push is already
  spent for this element, in which case `resolved` by the one-push law.
- The same default is code's self-heal for a dropped marker (7A.4): the system degrades
  toward the verdict that never escalates. Design intent: **every failure mode of this
  classifier lands on a one-push, zero-climb, zero-injection turn.**

## §2.5 The WRONG special-case flow — false fact under a reading (the audit §11.1 probe case)

The one place two regimes chain. A student asserts a confident reading grounded in a false
context/preamble fact ("this is a modern blog, so the writer is exaggerating for clicks").

1. **Judge fires `wrong` on the FACT** (class `false-fact`) — never on the reading. The
   reading is interpretive and stays untouched.
2. **Correct the fact hard** — three parts, wise framing, hypercorrection welcome (a
   confident error corrected cleanly is the one they remember). **Fact-delivery guard:**
   supply the corrected fact and STOP — the corrected fact and their live quotation stay in
   separate sentences; never state what the true fact implies about their quote.
3. **Question the now-ungrounded reading's GROUNDING, same rung, same turn:** "Strong
   conviction — wrong fact, and it's a useful one to fix: [the fix]. Now, with that
   corrected, what does your reading stand on?" (phrase bank). The reading may survive on
   new ground — that is the student's call, never yours.
4. **If the next turn flounders** (fails the grounding question), that is a
   KNOWLEDGE-deficit, not a method-deficit: no lens fixes a missing situation model. Hand
   to the knowledge track — ask-first ("what do you know about [the relevant ground]?"),
   then a wallet insight if the balance allows, then a resource/Library chip — OUTSIDE the
   ladder's rungs and turn ceiling. No `@ELEMENT_JUDGE` on knowledge-track turns (code
   stamps them `kind:'insight'`/`'reading'`); judging resumes when the element's question
   is re-asked, at the rung it left.
5. On this paper (context never assessed), the corrected fact feeds their INFERENCE only —
   it is never planned as content, and the wallet discipline (law 7) governs any insight
   spent here.

## §2.6 Splice-ready prose — THE VERDICT CONTRACT annex (goes into the monolith, after the Session Laws)

This is the operational text the model runs; it deliberately does NOT repeat Law 9's three
grep-lines (C-CHECKS count them exactly once). Splice verbatim:

> ### The verdict contract (@ELEMENT_JUDGE) — classify every judged turn, once
>
> On every student turn that attempts (or refuses) the active element's question, emit on
> its own line, nothing after it:
> `@ELEMENT_JUDGE{"el":"<the active element id from the state block, byte-exact>","verdict":"resolved|weak|failed|wrong"}`
> — adding `"class":"misread|false-fact|technique-misID"` when and only when the verdict is
> `wrong`. Echo the element id exactly as the state block gives it; never derive one. Emit
> NO verdict on: button or Y replies, gate clicks, the pre-planning chain, quote-selection
> and anchor-quote beats, detour questions, prediction revisits, mirror-backs, or
> knowledge exchanges.
>
> Judge in this fixed order and stop at the first match:
> 1. **Is a falsifiable claim the answer stands on FALSE?** A misread of the words on the
>    page (`misread`), a false verifiable fact about the writer, date or form
>    (`false-fact`), or a definitionally misnamed device (`technique-misID`) → `wrong`.
>    Ask yourself: could a neutral reader settle this by pointing at the page, the
>    preamble, or a reference work — without judging meaning? If settling it needs
>    interpretation, it is NOT wrong. If you cannot name in one sentence what falsifies it,
>    it is NOT wrong. An incidental slip beside a sound answer takes the answer's verdict,
>    with the correction folded in free. Correct in three parts (name · why · fix), warmly
>    and without softening, then re-invite the same question. A false fact propping up a
>    reading: correct the fact, keep it clear of their quotation, then ask what the reading
>    now stands on — and if they then flounder, build knowledge (ask-first, then law 7)
>    before returning to the element.
> 2. **Is anything here OWNABLE toward this element?** Before answering no, try to quote
>    back one phrase of theirs this element could accept once sharpened. If no such phrase
>    exists — drift, restatement without a claim, evasion, the work handed back to you —
>    → `failed`. (Empty turns and bare "I don't know" never reach you; a pure
>    help-request gets the current help re-explained, not a climb in tone.)
> 3. **Does the owned content meet this beat's own checks?** Below the bar — surface where
>    perceptive is asked, a vague effect, a comparison with no relationship — → `weak`:
>    give the beat's ONE scripted push, then accept whatever returns. If the state block
>    says the push is already spent, an owned answer is `resolved` — file it and honour it;
>    the outline lesson sharpens sentences, this one respects owners.
> 4. **Otherwise → `resolved`:** the same reply files their words (`@FIELD_COMMIT` exactly
>    as the beat lists), names what landed, and asks the next element's question.
>
> When genuinely torn, write `weak`. Torn between wrong and weak: `weak`, and challenge the
> grounding ("which of the writer's actual words is that built on?") — never assert an
> error you cannot cite. Torn between failed and weak: `weak` — one respectful push costs
> a turn; a stolen rung costs trust. The resolved judgement and the filing marker always
> travel in the same reply.

---

# §3. WHERE THE REAL PROTOCOL DIVERGED FROM THE P1 REGISTRY DRAFT (drift log — verified against the live file, 2026-07-18)

Read in full before splicing; each item is folded into §1.3 already.

1. **Q2 "Perceptive idea from a quote (Beats 4, 6…)" mis-grouped Beat 6.** In the live file
   Beat 4 = Source A perceptive idea → topic; Beat 6 = Source B difference (marker-led) —
   its own element with its own filing box. P3 splits them into two registry rows (Beat 6
   keeps the against-lenses). Beat 5/7 = the two-more-inferences elements. Paragraph-2
   twins are Beats 8–11 (same shape, `-2-` boxes).
2. **Effects are TWO turns and TWO boxes everywhere** (`effects` + `effects2`, Q3 §5a/5b
   and Q4 4a/4b — "one message cannot feed two boxes"). P1's single Effects row is split;
   Q4's `effects2` turn also carries the comparative gap question, so its L2/L3 serve the
   gap, not just the second effect.
3. **FieldIds attached throughout; Q4's mixed convention confirmed:** body boxes UNSUFFIXED
   (`outline-body-{i}-…`, no -q4), intro `outline-intro-thesis-q4` (suffixed), conclusion
   `outline-conclusion-thesis` (unsuffixed); Q2/Q3 boxes suffixed `-q2`/`-q3`; the three
   Q4 `context` boxes render but are never planned — the registry never touches them.
4. **Q3's Technique step files nothing** (absorbed into the evidence box) — P1 had this
   right; P3 gives it the synthetic el `q3-technique-p{i}` so its ladder state has an
   identity.
5. **Q4 Beat 1 is richer than P1's draft assumed:** it offers a default aspect frame AND
   collects per-aspect observations — a coachable element. P3 adds the `q4-aspects` row
   (P1 had no Q4 Beat-1 row).
6. **Q2 Beat 1's weak-push already owns the pace/victims/distance examples, and Beat 6
   explicitly bans re-listing them.** The L2 hint cell now carries that constraint so no
   rung ever re-lists the beat's push menu (answer-key risk).
7. **Q5 sub-elements never file individually** — only section compiles (and method points)
   file. P3 therefore mints synthetic els (`q5-{sec}-image` etc.) and states that any
   unlisted Q5 sub-ask ladders under its section's image/verb el as the state block
   directs. Method points are 2–3 (the protocol plans two or three; point-3 pair emitted
   only if a third point exists).
8. **The monolith's §10 ACCEPTANCE block must gain the three C-LADDER checks** (splice 9) —
   the P1 splice list ended at the beats; the acceptance delta is new.

---

# §4. CONTRACT ASKS OF OPUS (code-side; specified here, built there)

1. **`class` on `@ELEMENT_JUDGE` and on the `ladder:{}` stamp** — required iff
   `verdict='wrong'` (C-CHECK (c) demands the named class). One optional field beyond the
   pinned `ladder:{el,rung,regime,verdict,kind,source}`; a wrong-without-class is treated
   as no-marker (self-heal → weak) and `console.warn`ed. Harness fixture: wrong-with-class
   passes; wrong-without-class heals to weak; interpretation fixtures never classify wrong;
   `wrong` increments neither rung nor attempts.
2. **el is echo-only:** the TELL/state block names the active element id each turn; parser
   validates the echoed el equals the told el (mismatch → warn + trust the told id). The el
   vocabulary = §1.3's el column; byte-trace registry ↔ TELL builder ↔ parser in one table
   before ship (CLAUDE.md 5d).
3. **One-weak-per-element is code-visible:** the TELL block must say when the element's
   push is spent (regime `owned-push` already stamps it) so the §2.3 WEAK rule ("second
   owned-surface turn = resolved") is playable without the LLM counting.
4. **Widen the deterministic IDK family two ways** (precision holes found designing §2.2):
   (a) the IDK regex must fire only when the IDK phrase IS the turn (near-whole-match /
   post-strip length floor) — today's start-anchored regex would swallow "dunno, maybe the
   writer is angry…", discarding a genuine micro-attempt that should clear `idkPending`;
   (b) add the confusion family ("I don't understand", "I don't get it", "what do you
   mean", bare "huh"/"?") to the deterministic branch so help-requests earn current-rung
   help under the micro-attempt climb-gate instead of climbing via an LLM `failed`.
5. **No-verdict turns:** the parser must tolerate judged-turn markers being absent on the
   §2.1 unjudged-turn list without warning (they are contractually markerless); the
   existing self-heals (commit-without-judge → resolved; neither, non-trivial, on an active
   element → weak) stand.
6. **Knowledge-track turns** stamp `kind:'insight'|'reading'` with no verdict (audit change
   10) so resume can self-locate around a §2.5 detour.

---

# §5. JUDGEMENT CALLS FLAGGED (supersessions and translations Neil/Opus should see; nothing re-opens a ruling)

1. **Ceiling 4 carried throughout** (Neil's override; audit §11.2's "3" superseded — same
   as P1 §5.1). The Law 7 rewrite prints "ceiling 4 per paper" in the monolith.
2. **The load-bearing rule for WRONG (§2.3) is new.** The rulings define wrong's classes
   but not what happens when a falsifiable slip rides shotgun on a sound answer. Ruled
   here: the verdict follows the element's graded object; incidental errors are corrected
   free inside the answer's verdict. Without this, every passing mislabel would eat a turn
   re-inviting an element the student had already met.
3. **One-weak-per-element enforcement (§2.3 WEAK) is a translation, not a new rule:** it is
   the settled one-push law expressed as verdict behaviour (second owned-surface turn =
   resolved). It needs ask §4.3 from Opus to be playable.
4. **Help-requests vs failed (§2.2/§4.4):** the audit routes the struggle menu off
   `verdict=failed`, but a pure "I don't understand" climbing a rung per repeat would make
   confusion a lift. Recommended: deterministic confusion-family + micro-attempt gate
   (mirrors IDK). Until built, the annex tells the model to re-explain at the current rung
   with no escalation pressure. **Needs an Opus yes** (small code change) — the annex text
   works either way.
5. **The IDK-regex whole-turn fix (§4.4a)** — found, not ruled: the drafted regex would
   misclassify mixed IDK+content turns. Pure precision repair; flagged because it silently
   discards micro-attempts, which corrupts the climb-gate.
6. **el vocabulary for non-filing beats and Q5 sub-elements (§1.3)** is mine (synthetic
   ids). Safe because el is echo-only (one producer); Opus may rename at build so long as
   registry, TELL builder and parser move together (one commit, byte-traced).
7. **The verdict annex and model-script bank live in the monolith for now** (this is the
   reference protocol every port copies). When the second planning protocol ports, promote
   the annex verbatim into PROTOCOL-STANDARD (a C-LADDER companion block) rather than
   fork-editing per protocol — same promotion path C-CHECKS took.
8. **M1–M5 scripts obey the gold rules** (no "the/this/these" sentence-starters inside the
   modelled sentences, no "shows", tentative purpose language) so an L4 model can never
   demonstrate below the standard the golds demand — "a model is exemplary or it is not a
   model" (PEDAGOGY §7). Structure sources are named per script; zero quotations lifted
   from any source, sample answer, or set text.
9. **Q4 `effects2`'s dual duty** (Source B effect + the comparative gap) means its stuck
   states differ — the registry offers whichever lens half is stuck. That is a per-element
   authoring nuance the universal design didn't anticipate; recorded here so ports of
   other comparative papers reuse the pattern instead of re-deriving it.
