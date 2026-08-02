# Learning Without AI — Creative Beats, Self-Generated Ideas, and Feedback at Zero API
**Date:** 2026-08-02 · **For:** WML FIXLIST #197 — the design doctrine for code-served creative walks (CW Step 6's ~100-beat plot outline first, then every walk) when the API is degraded, absent, or deliberately unspent.
**Question (Neil, verbatim):** *"How can we enhance students' understanding of what to do specifically with these beats — they're having to reach for creative ideas in their mind with absolutely minimal amounts of AI. What if in a worst case scenario we've got no AI? Servers down, credits run out. How can students learn as optimally as possible without the use of AI? The advantage of AI is dynamic and specific feedback and ideas based on what the student is learning. How can we cover that without AI? I'm talking about designing the protocol in a way that the students can manage that."*

**Scope note.** This doc governs *what replaces the API* — idea generation without a responsive partner, and feedback without a marker. It **composes with**, and never repeats:
- `2026-08-02-teen-chat-ux-for-scripted-tutoring.md` — the *delivery surface* (message length, pacing, progress framing, register). Everything served here obeys those 18 rules.
- `2026-07-18-scaffolding-escalation-and-socratic-tutoring.md` — the *help/escalation layer* (contingent shift, AutoTutor EMT, hint abuse, the ownership correction that makes L3 a **lens** menu and L4 an **unrelated-instance** model).
- `PEDAGOGY.md` — standing rulings. Nothing here overrides one. Load-bearing here: **§1** help ∝ instruction received · **§12** one committed idea beats three forced ones · **§13** verdicts withheld to the end · **§19** the student marks their own work against stated criteria · **§24** archetypal pattern by default, departure with a reason · and the house **no-gamification** ruling.

**The product fact this is answering into.** The walks are already ~95% deterministic. In CW Step 6 the API is spent on roughly **six calls per session**, and every one is *judgment*: reading the student's free text to decide push-or-accept, and open "ask Sophia" help. Teaching, criteria, examples, chips, filing, ticks, resume — all code. So the question is exact and narrow: **what covers (a) the responsive idea-partner and (b) dynamic specific feedback, when those six calls are unavailable — and does the answer make the walk better even when the API is up?** The literature below says yes to the second half, for a reason worth stating up front: the strongest-evidenced writing intervention in the field is explicitly a method for **removing the helper**.

---

## 1. Creative generation without a partner — constraints are the engine, not the fence

### 1.1 Constraints raise creative output. This is experimental, and it is on a *writing* task.
- **Haught-Tromp (2017, *Psychology of Aesthetics, Creativity, and the Arts* 11(1) — "The Green Eggs and Ham Hypothesis: How Constraints Facilitate Creativity")** — two experiments on a common writing task: produce a two-line rhyme for an occasion. The constrained condition had to include a **given noun**. Constrained rhymes were rated **more creative**, with an order interaction indicating a **carryover effect** — mere practice under constraint stimulated creativity on later, freer items.
- **Stokes (2006, *Creativity from Constraints*, Springer)** — the book-length theoretical/case-study account: creativity comes from *paired* constraints, one that **precludes** the habitual low-variability response and one that **promotes** a higher-variability search. Evidence is historical case analysis (Monet, Mondrian) plus behavioural variability work, not RCTs — cite it as theory with converging support, not as an effect size.
- **Boden (1990/2004, *The Creative Mind*)** — the standard taxonomy: **combinatorial** (recombine familiar elements), **exploratory** (search a structured conceptual space), **transformational** (alter the space's enabling constraints). Constraints *define* the space in which exploration is even possible. Theory, universally cited, no effect size attached.

→ **A blank ask is the worst ask we can serve.** "What happens in the Inciting Incident?" is an unbounded search; a 14-year-old with no partner has nothing to push against. **Every generate-ask must ship a constraint the student's answer has to satisfy** — a required element ("it must be caused by someone your protagonist trusts"), a forbidden move ("not a death, not a phone call"), a fixed length, a named material from their own earlier answers. The constraint is not a difficulty tax; it is the thing that makes generation *possible* without a partner.
→ **The beat sheet is already the constraint engine — reframe it internally.** Step 6's ~100 beats are not scaffolding overhead sitting on top of the creative work; they are Stokes's precluding/promoting pair, pre-authored. Each beat says *this must happen here, and it must do this job*. The design work is not to soften them but to make each one carry its constraint **explicitly, in the ask**.
→ **Exploratory before transformational (and this is already a house ruling).** PEDAGOGY §24 — follow the archetypal pattern by default, depart with a reason — is Boden's exploratory/transformational distinction in Sophicly's own words. The evidence supports it: novices do not have the schema whose transformation would be meaningful.

### 1.2 Random / oblique prompts: do NOT build this. The best available evidence is negative.
- **Malthouse, Liang, Russell & Hills (2022, *Cognition* 218, 104937 — "The influence of exposure to randomness on lateral thinking in divergent, convergent, and creative search")** — pre-registered, 592 UK participants, three tasks (one convergent forecasting, two divergent fluency), stimulus = Wikipedia's random-page generator. **No improvement; often significant impairment.** A Bayesian meta-analysis across tasks gave **strong support for the null**. The authors' own conclusion is that random stimuli must be *task-related* or "optimally random" to do anything.

→ **Kill the "random idea spark" / shuffle-a-prompt button before anyone proposes it.** It is the intuitive free-with-no-API feature, and it is the one with a pre-registered null against it. Oblique-strategies-style decks are practitioner folklore; we do not ship folklore as a rung.
→ **What survives is the *task-related* combinatorial prompt.** Boden's combinatorial creativity, restricted to material the session already holds: combine **the student's own** protagonist flaw × **their own** setting × **the beat's job**. This is a pure code operation over stored answers — zero API, zero randomness, and it satisfies the ownership law because every input is theirs. *("What does your protagonist's [stored flaw] make them do in [stored setting] when [beat's demand] happens?")*

### 1.3 Generic creativity training works — but only the domain-specific, strategy-shaped kind.
- **Scott, Leritz & Mumford (2004, *Creativity Research Journal* 16(4), 361–388 — "The Effectiveness of Creativity Training: A Quantitative Review")** — 70 studies, overall effect ≈ **0.68**, generalising across criteria, settings and populations. The moderator finding is the useful one: the successful programmes **develop cognitive skills and the heuristics for applying them, using realistic exercises appropriate to the domain**. Idea-production and cognitive training were the effective types; several commonly-applied generic strategies were not.

→ **Any idea-help we build is domain-specific by construction:** it is about *this beat, in this plot structure, for this student's story* — never a general ideation game. This is the same finding that condemns the random-prompt button and vindicates the beat templates.

### 1.4 Concrete material beats abstract instruction for idea generation — but it is a small effect.
- **Graham & Perin (2007, *Journal of Educational Psychology* 99(3) — "Writing Next" meta-analysis, grades 4–12, 123 documents / 154 effect sizes for writing quality)** — **inquiry activities** (analysing concrete data/material to develop ideas for writing) and **prewriting** both land in the *small*-effect band, far below strategy instruction (0.82). Real, replicated, modest.

→ **Sensory/image/material prompts are worth a rung, not a pillar.** A "look at this concrete thing and describe what your character notices" ask is evidenced but low-yield; it belongs as a *More examples*-tier alternative, not as the main generative mechanism. The main mechanism is §4 (strategy + mnemonic).

### 1.5 ⚠ The conformity effect — the single biggest hazard on the worked-example route
- **Smith, Ward & Schumacher (1993, *Memory & Cognition* 21(6) — "Constraining effects of examples in a creative generation task")**, extended in **Ward and colleagues' structured-imagination work**: participants who saw three examples before generating new exemplars produced designs **containing the examples' features**. The findings that matter for us:
  1. **More examples → more conformity.**
  2. A **23-minute interpolated delay did not reduce it.**
  3. **Explicitly instructing people to be different from the examples did not reduce it.**
- **Graham & Perin (2007)** independently rates "study of models" as one of the *smaller*-effect interventions in the writing corpus — consistent with the picture that models are useful but easily copied rather than abstracted.

→ **This is why we cannot answer "no AI" simply by serving more examples.** Volume of examples is the one lever the evidence says makes copying *worse*, and the two obvious defences (wait a bit; tell them not to copy) are both empirically dead.
→ **Two defences do survive, and both are already house law:** (a) **model on an unrelated instance** — the sibling doc's L4 correction, never on the student's own text/story; (b) **make the student compare examples rather than absorb one** (§2.3). Comparison is the mechanism that pulls out the *principle* instead of the *features*.
→ **Never end a teaching chunk on a single example with no comparison and no constraint.** That is the exact configuration Smith et al. show gets copied.

---

## 2. The worked-example route — does studying and completing models transfer to open generation?

### 2.1 Yes, and it has been tested in *our* domain, not just maths.
- **Sweller & Cooper (1985); Renkl (1997/2002)** — the worked-example effect for novices (full treatment in the sibling scaffolding doc; not repeated here).
- **Kyun, Kalyuga & Sweller (2013, *The Journal of Experimental Education* 81(3), 385–408 — "The Effect of Worked Examples When Learning to Write Essays in English Literature")** — the important citation for this doc: worked examples tested in an **ill-defined domain**. The worked-example condition studied **model essays offering several possible answers** to the question before attempting similar questions; the control simply attempted the equivalent number of questions unaided. **Worked examples were more effective**, with the benefit concentrated in **lower-prior-knowledge learners** — i.e. exactly the cognitive-load account, holding in English rather than algebra.
- **Kalyuga et al. — expertise reversal** — the same support that helps novices *harms* the more expert; support must fade.

→ **A model is legitimate in a creative/analytical writing ask, and it is *most* legitimate for the weakest student.** This is the empirical licence for ASK-template rule 4c.2 (worked examples inside the ask) and for rung 1 (`[💡 More examples]`) — both free, both code-served.
→ **The Kyun design detail is worth copying exactly: several possible answers, not one.** The model condition that worked showed *multiple* answers to the same question. That is simultaneously the conformity mitigation (§1.5) and the comparison mechanism (§2.3) — the same design choice satisfies three findings at once.

### 2.2 Completion beats both open generation and passive study, at first exposure.
- **van Merriënboer (completion strategy / 4C-ID); Renkl & Atkinson (fading)** — the **completion problem**: a partially-worked solution the learner finishes. The instructional-design consensus in this tradition is that goal-free problems, worked examples and completion problems outperform conventional unaided problem-solving for building transferable schemas, with the completion form acting as the bridge between studying and solving; fading is the mechanism that gets to independence.

→ **A beat's first ask should often be a COMPLETION, not open generation.** Serve the sentence's opening and its constraint, and have the student finish it — *"Your protagonist finally does the thing they have avoided all story: they ______, even though it costs them ______."* This converts an impossible recall task into an achievable completion, needs no partner, and is byte-identical in cost to any other code-served ask.
→ **Fade across the walk, not per student cleverness.** Beat 1 of a stage = completion; by beat 4 of the same stage = open ask with criteria only. The fade is authored into the STEPS table, so it cannot silently regress and does not require the API to detect competence.

### 2.3 ONE deep exemplar vs TWO contrasting ones — the evidence says **two**, and it is not close.
- **Gentner, Loewenstein & Thompson (2003, *Journal of Educational Psychology* 95(2), 393–408 — "Learning and Transfer: A General Role for Analogical Encoding")** — across three studies with novices, **comparing two cases produced markedly better schema abstraction and transfer than studying the same two cases separately**. In the negotiation training line (**Loewenstein, Thompson & Gentner, 1999, *Psychonomic Bulletin & Review* 6(4)**), learners who drew an analogy between two cases were **roughly three times more likely** to apply the strategy in a later live negotiation than those given the same cases separately. Study 3: increasing comparison support increased transfer further.
- **Schwartz & Bransford (1998, *Cognition and Instruction* 16 — "A Time for Telling")** — analysing **contrasting cases** *before* being told the principle produced better learning from the subsequent telling: noticing the distinctions creates the readiness for the explanation. **Schwartz & Martin (2004, *Cognition and Instruction* 22)** extends this to inventing-before-telling.

→ **The house's single threaded story (the CW4 Scrooge spine) is right for CONTINUITY and wrong as the whole exemplar strategy.** Threading one known story across a walk is genuinely valuable — it assembles a complete worked model in parallel with the student's, and it costs nothing to hold. But at any ask where the student must *abstract what the beat is for*, one example is the configuration Smith et al. (§1.5) show gets copied and Gentner et al. show under-transfers.
→ **THE RULE: one threaded spine + one short contrasting instance at the ask, and the student is asked what differs.** Two examples from *different* stories doing the *same* beat, followed by a one-tap or one-line comparison ("what do both of these do, that a weak version wouldn't?"). This is free, code-served, and it is the highest-leverage single change this document recommends.
→ **Contrast before telling where the concept is new** (Schwartz & Bransford): show the ✗/✓ pair *first*, ask the student to name the difference, *then* state the criterion. The criteria-upfront law (4c.1) still holds for the *production* ask — this is about the teaching chunk that precedes it.
→ **Minimal pairs.** The two contrasted cases must differ on the criterion and as little else as possible, or the student abstracts the wrong dimension (surface features, per §1.5).

---

## 3. Feedback without AI — the student can run most of Sadler's loop alone

### 3.1 What feedback actually requires — and which parts need another mind
- **Sadler (1989, *Instructional Science* 18, 119–144)** — the canonical statement. Improvement requires the learner to: **(a)** possess a concept of the **standard** being aimed for; **(b)** **compare** their actual performance with that standard; **(c)** take **action to close the gap**. Sadler's own premise is that students must "develop the capacity to monitor the quality of their own work during actual production."

→ **Only (a) is expensive, and it is the part a machine does not have to supply.** (a) is delivered by **criteria + exemplars** — both code-served, both already in the ASK template. (b) is a comparison the student performs. (c) is a revision slot the walk owns. **The API is not any of the three conditions.** It is one convenient implementation of the *comparison* step — and the one the student should end up not needing.
→ **This gives the doctrine its one-line justification:** if the standard is concrete enough to compare against, the feedback loop closes without a marker. If it isn't, no amount of AI fixes the underlying design.

### 3.2 Criteria-referenced self-assessment works, at our exact age, on writing
- **Andrade, Du & Mycek (2010, *Assessment in Education* 17(2), 199–214 — "Rubric-referenced self-assessment and middle school students' writing")** — N = 162. Treatment: **read a model essay → generate a list of criteria → review the written rubric → self-assess the first draft against it.** Comparison: generate criteria and review drafts, without the rubric-referenced self-assessment. **Main effect of treatment on total essay scores AND on every individual criterion on the rubric.** Related work by the same group (**Andrade & Boulay; Andrade, Du & Wang**) finds the associated self-efficacy benefits.
- **Panadero, Jonsson & Botella (2017, *Educational Research Review* 22, 74–98)** — four meta-analyses, 19 studies, 2,305 students: self-assessment improved self-regulated learning (effects of **0.23, 0.65, 0.43** across SRL measures) and **self-efficacy (0.73)**; self-monitoring was a significant moderator.
- **Graham, Hebert & Harris (2015, *Elementary School Journal* 115(4) — "Formative Assessment and Writing: A Meta-Analysis", grades 1–8)** — feedback about writing enhanced quality with average weighted effects by **source**: **adult 0.87 · self 0.62 · peer 0.58 · computer 0.38**.

→ **The Andrade sequence is, almost verbatim, the sequence our ask already serves** — model, criteria, self-assess against the criteria. That is not a coincidence to be pleased about; it is the licence to make the self-check **the default terminal move of every generate-ask**, not an optional extra when the API is down.
→ **The 0.62-vs-0.38 comparison is suggestive, and must be stated honestly.** In that corpus, *self*-feedback outperformed *computer*-delivered feedback. **Caveats, stated because the number will get quoted:** grades 1–8 (below our audience); "computer" there means the automated-essay-scoring generation, **not an LLM**; and these are between-intervention comparisons, not a head-to-head trial. It does **not** prove self-assessment beats Sophia. What it does support is the weaker and sufficient claim: **student self-assessment sits in the same effect band as machine feedback, so losing the machine is not a collapse.**
→ **Self-assessment is also the SRL/self-efficacy intervention (Panadero).** So the degraded path is not merely tolerable — it trains the thing PEDAGOGY wants trained.

### 3.3 More feedback is not automatically better — a third of it makes performance worse
- **Kluger & DeNisi (1996, *Psychological Bulletin* 119(2), 254–284)** — 607 effect sizes, 23,663 observations. Average **d ≈ 0.41**, but **over one third of feedback interventions *decreased* performance**. The reliable moderator: feedback directed at the **task and how to improve it** helps; feedback directed at the **person** consistently harms.

→ **Losing six judgment calls is not automatically a loss of six benefits.** This is the honest counterweight to "AI gives dynamic specific feedback": dynamic specific feedback is only reliably good when it is task-directed and improvement-oriented.
→ **Every self-check item is task-directed by construction** — it asks about the *sentence*, never about the *writer*. No item may be phrased as a judgment of the student ("are you being creative enough?"); every item names an observable property of the text ("does your sentence name what the character *does*, not what they feel?"). This is also the PEDAGOGY §13 withhold-verdicts posture in self-check clothing.

### 3.4 Contrasting ✗/✓ pairs and error-spotting — evidenced, but gated on prior instruction
- **Schwartz & Bransford (1998)** (above) — the contrasting-case warrant for the house's weak-vs-strong pairs.
- **Große & Renkl (2007, *Learning and Instruction* — "Finding and fixing errors in worked examples")** — the critical boundary: learners **with some prior knowledge** benefited from correct + erroneous examples; learners with **no prior knowledge learned significantly more from correct examples alone**. Errors hurt the true novice.
- **McLaren et al. (interactive erroneous examples, middle-school decimals)** — students who **explained and corrected** erroneous examples **with feedback on their explanations** outperformed problem-solving controls on a **delayed** post-test.

→ **Error-spotting is a *later* rung, never a first-exposure teaching move.** This maps exactly onto **PEDAGOGY §1** (support is withdrawn as instruction is received): a student who has just met the beat gets the ✓ model; a student who has been taught it gets the ✗ to fix. Serving an erroneous example to a novice is an evidenced *harm*, not a neutral variation.
→ **McLaren's required "feedback" is a stored answer key, not a marker.** The condition that worked was *explain and correct, then be told whether you were right* — and the "right answer" for a pre-authored erroneous example is pre-authored too. **Zero API.** This is the cheapest place to buy a genuine feedback loop back.
→ Error-spotting items are authored per beat as ✗/✓ minimal pairs (§2.3), so one artefact serves teaching, comparison and error-spotting.

### 3.5 Is instant AI feedback actually better than next-lesson tutor feedback here?
- **Kulik & Kulik (1988)** — the classic meta-analytic corpus favoured **immediate** feedback with small-to-moderate effects.
- **Butler, Karpicke & Roediger (2007)** — **delayed** feedback produced better final-test performance at a **one-week** retention interval; no significant difference at one day. Mechanisms proposed include spacing and consolidation rather than timing per se.
- **Shute (2008, *Review of Educational Research*)** and subsequent reviews — the working synthesis: immediate feedback suits acquisition of procedural steps; delayed feedback is tolerable-to-advantageous for retention and transfer. **The field remains contested**; recent meta-analytic work on feedback timing in computer-assisted learning still reports mixed results.

→ **State this as contested, never as "delayed is better."** But the design conclusion is safe in the weak form we need: **next-lesson tutor or peer feedback on a piece of extended writing is inside the range the literature treats as a live trade-off, not a degradation off the edge of the map.** Losing instant feedback on a plot beat costs less than the intuition suggests, particularly for work whose payoff is transfer to the next story.
→ **So the degraded ask-Sophia rung has a legitimate destination:** capture the question for the tutor. That is a real feedback route with real evidence behind it (**adult feedback 0.87** — the *highest* source in Graham, Hebert & Harris), merely slower.

---

## 4. Self-questioning and strategy instruction — SRSD is the headline answer to Neil's question

This is the section that most directly answers *"designing the protocol in a way that the students can manage that."* There is an established instructional model whose entire purpose is to make the student self-sustaining, and it has the strongest evidence base in writing instruction.

### 4.1 The effect sizes
- **Graham & Perin (2007, "Writing Next", *JEP* 99(3))** — adolescents, grades 4–12. **Strategy instruction 0.82** and **summarisation 0.82** top the table, ahead of **peer assistance 0.75**, **setting product goals 0.70**, **word processing 0.55**. The same report places **study of models**, **inquiry activities** and **prewriting** in the *small*-effect band — an order of magnitude of practical difference from strategy instruction.
- **SRSD (Self-Regulated Strategy Development; Harris & Graham, from the 1980s on)** — meta-analytic effects routinely **exceed 0.85** and commonly run **1.0–2.55** across writing and affective outcomes; **Graham & Harris (2003)** reported averages around **1.86 for length and above 2.0 for structural elements** among students with learning disabilities; a **2022 decade review (*Reading and Writing*)** reports **ES ≈ 1.17**. Gains appear in **text quality, self-efficacy, knowledge of writing, genre elements included, and approach to writing**, from elementary through high school. **SRSD carries a positive What Works Clearinghouse intervention report.**

→ **When a walk must choose between adding another example and adding a strategy the student can run in their head, the evidence says add the strategy** — by roughly a factor of three in effect size.

### 4.2 Why SRSD is *the* model for a zero-AI protocol
SRSD does not merely teach a writing strategy; it teaches the **self-regulation to run that strategy without the teacher** — goal-setting, self-instructions (what you say to yourself when stuck), self-monitoring, and self-reinforcement. Its six stages are, in order: **develop background knowledge → discuss it → model it → memorise it → support it → independent performance**, with instructor support **faded to zero by design**.

→ **Map the walk onto the six stages and the answer to "what if there's no AI?" becomes structural rather than defensive:**

| SRSD stage | The walk's code-served equivalent | API? |
|---|---|---|
| Develop background knowledge | the beat's teaching chunks + Table of Techniques cards | none |
| Discuss it | orientation chunks; "why this beat exists"; the ✗/✓ comparison ask | none |
| **Model it** | threaded spine + contrasting instance (§2.3), several answers (§2.1) | none |
| **Memorise it** | **the beat's mnemonic / 3–4-item question set — the missing piece** | none |
| Support it | the help ladder rungs 0–2, completion asks, fading (§2.2) | none |
| Independent performance | the open ask with criteria only; the self-check | none |

→ **"Memorise it" is the stage our walks currently skip, and it is precisely the idea-partner, internalised.** SRSD's students carry the strategy in their heads. Ours re-read it, or ask.

### 4.3 Story grammar and the mnemonic — the evidenced form of a "question checklist"
- **SRSD narrative strand: POW + W-W-W, What = 2, How = 2** — *Pick an idea, Organise notes, Write and say more*, plus the story-grammar questions: **Who** is the main character · **When** does it take place · **Where** does it take place · **What** does the main character want to do · **What** happens then · **How** does it end · **How** do the characters feel. SRSD narrative studies report significantly greater gains than regular instruction in **holistic quality, story elements included, and length**.
- The literature on **question checklists** generally (journalist's questions, "what would make this worse for her?") has no comparable controlled base — **practitioner consensus**. Story grammar is the version that has been tested, and the reason it works is instructive: its questions are **structural properties of the genre**, not general creativity prompts.

→ **Every beat gets a memorisable 3–4-question set derived from what that beat *is*, and it is served in the ask.** Not a generic idea-prompt; the beat's own defining questions. *Inciting Incident: what breaks the normal? who causes it? what can't they ignore now?* That is the idea-partner in the student's own head, is free, is portable to the exam hall — and the exam hall is the real zero-AI environment we are ultimately designing for.
→ **The set must be short enough to be held** (≤4 items, per the teen-UX doc's Cowan budget) **and stable across beats of the same type**, so it is learned by repetition rather than re-read each time. A student who can recite the three questions for an Inciting Incident has internalised the partner.
→ **Keep the "what would make this worse for her?" style prompts** — they are good practitioner craft and they are *task-related* (§1.2) — but label them in our own docs as consensus, and let the story-grammar-shaped sets carry the structural load.

### 4.4 Self-monitoring without gamification
SRSD's self-monitoring is typically a **private count of the strategy elements included** and a record of the student's own prior performance. This is not points, streaks, badges or competition.

→ **This is compatible with the house no-gamification ruling, but the distinction must be drawn explicitly in any implementation:** a self-monitoring artefact is the student checking *"did my sentence contain the three things this beat needs?"* against **stated criteria** — it is PEDAGOGY §19 (the student marks their own work) applied per beat. Anything that turns the count into a score, a comparison with others, or a reward is out.

---

## 5. Peer routes — strong evidence, hard preconditions, and a product question rather than a build

- **Graham & Perin (2007)** — **peer assistance 0.75** for adolescents, one of the top five interventions in the corpus.
- **Graham, Hebert & Harris (2015)** — **peer feedback 0.58**, sitting between self (0.62) and computer (0.38).
- **Gielen, Tops, Dochy, Onghena & Smeets (2010, *British Educational Research Journal* 36(1), 143–162)** — the directly relevant study: peer *versus* teacher feedback in a **secondary school writing curriculum**. **Single peer feedback was as effective as teacher comments.** Follow-up work by the same group found **"justified" peer comments — those carrying an explanation — produced better gains than unexplained ones**, with the advantage diminishing for higher-performing students.
- **Preconditions (Topping's peer-assessment reviews and the surrounding literature; substantially practitioner consensus):** peer assessment needs **explicit criteria, training, teacher modelling of how to assess, and repeated practice**. Unstructured peer response reliably degrades into praise and proofreading, and can be actively harmful when it becomes personal (Kluger & DeNisi, §3.3).

→ **The evidence is good enough that a peer route is worth having, and the preconditions are exactly what we already produce.** The self-check card *is* the criteria artefact a peer needs; a peer route costs no new pedagogy, only a surface.
→ **The design rule if it is ever built: the peer sees the same criteria card and answers the same items about someone else's sentence — never a free-form "what do you think?".** And per Gielen, the form must **require a reason**, since justified comments are what carried the effect.
→ **This is a product decision for Neil, not a unilateral build.** Sophicly's model (group of ≤16 with a tutor, every piece marked individually) makes it structurally available, but it touches safeguarding, moderation, and the tutor's time. **Flagged, not assumed.** It is recorded here so the option is not re-derived from scratch later.

---

## 6. DEGRADED-MODE DESIGN DOCTRINE — engineering, not research

Not evidence; the rules that make the above shippable when the API returns an error. The governing invariant, from which everything else follows:

> **NO API CALL IS EVER LOAD-BEARING FOR COMPLETION.** The API enhances judgment; it never gates progress. A student with zero API can start, work, be helped, self-assess, file every answer, tick every beat, resume, and **finish the walk**.

**What each help-ladder rung does at zero API** (§4c.9 order is unchanged — it was already cheapest-first, which is why the surface area is small):

| Rung | Normal | At zero API |
|---|---|---|
| 0 — the ask (criteria + inline example) | code | **identical** |
| 1 — `[💡 More examples]` | code | **identical** |
| 2 — `[📖 Guidance]` · `[🗂 Technique]` | code | **identical** |
| 3 — `[🤔 Still stuck — ask Sophia]` | API | **honest message + re-offer 0–2 + capture for the tutor** |
| the push/accept judgment turn | API | **accept-with-self-check** |

**The push cycle degrades, it never dead-ends.** The judgment turn's job is to decide push-or-accept on the student's free text. With no API it becomes **accept + serve the self-check**: the answer is filed exactly as it would have been, and the student is handed the criteria as a checklist against their *own* sentence ("Read yours back. Does it do these three things? [Yes, moving on] [Let me redo it]"). This is Sadler (b) performed by the student, is the Andrade sequence verbatim, and — crucially — **the student, not the system, holds the redo option**, so a wrong self-judgment costs nothing but a beat. It must never become "I couldn't check that, so we're stuck" (**CLAUDE.md §4d** — a refusal is half a change; liveness is the other half).

**The ask-Sophia chip degrades to an honest message with somewhere to go.** Three parts, in student language: (1) say it plainly — *"I can't think this through with you right now"* — never a silent no-op and never a fake answer; (2) re-offer the free rungs, which are the ones that were supposed to be used first anyway; (3) **capture the question** — one tap files "I got stuck here: [their words]" into the document / tutor-visible surface. That capture converts a dead rung into the **highest-effect feedback source in the corpus** (adult 0.87, §3.2), merely delayed — which §3.5 says is a defensible trade rather than a loss.

**Nothing that is code stops being code.** Filing, `@FIELD_COMMIT`/`@FIELD_SET`, ticks, sidebar rows, progress, pacing chips, resume, the durable/`why` turn contract, `_healFossilTurns` — all unaffected by API state, because none of them ever consulted it. **A degraded session must be resumable and indistinguishable from a normal one on re-entry**, apart from the answers the student self-checked.

**Degraded mode is a first-class, testable state — not an error path discovered in production.**
- It must be **forceable** (`?swml_no_ai=1`-style preview param, mirroring the house preview-flag convention) so it can be walked deliberately without breaking anything, by Neil, as himself.
- It must be **simulated**: every registered walk sim runs a **zero-API pass**, and `walk-sim-lib`'s existing automatic liveness check (§4d) then proves the no-dead-end property for free, with no opt-out.
- It must **fail loud to us** (console/error_log naming the failed call) and **fail honest to the student** (student-language sentence, zero machine tells — teen-UX rule 13).
- It must be **entered on a real signal** (HTTP error, credit exhaustion, timeout), never guessed, and it must **recover silently** — if the next call succeeds, the walk simply resumes judging; the student is never told a second time.

**And the part Neil suspected, stated plainly:** every improvement above — the constraint in the ask, the second contrasting example, the completion form, the memorisable question set, the terminal self-check — **also fires when the API is up**, and each one makes an API call less likely to be needed. That is the ladder's "Sophia last" law paying off, and it is the same direction SRSD points: the goal state is a student who does not reach for the helper, because the helper's questions are now their own.

---

## THE RULES, COMPRESSED — design rules for protocol authors (grep a walk against these)

1. **No blank asks. Every generate-ask ships a constraint the answer must satisfy** — a required element, a forbidden move, a fixed length, or a named piece of the student's own earlier material. An unbounded "what happens next?" is a defect (Haught-Tromp 2017).
2. **Constraints are task-related, never random.** No shuffle/spark/random-prompt feature; a pre-registered null exists against random stimuli (Malthouse et al. 2022). Combinatorial prompts recombine **the student's own stored answers**, never a random bank.
3. **Two examples, from different stories, doing the same beat — and the student is asked what they share.** One example gets copied (conformity effect, Smith et al. 1993); comparison abstracts the principle (Gentner et al. 2003). A teaching chunk ending on a single uncontrasted example is a defect.
4. **Never model on the student's own story/text.** The threaded spine is a *different* story; the contrasting instance is a *third*. (Sibling doc's L4 ownership correction.)
5. **More examples is the wrong lever.** Volume increases copying; contrast and constraint do not. If an ask feels weak, add a constraint or a comparison, not a fourth example.
6. **First exposure to a beat is a COMPLETION ask; later beats of the same type are open.** Serve the sentence stem + constraint and have the student finish it. The fade is authored into the STEPS table, never inferred at runtime.
7. **Every beat carries a memorisable 3–4-question set derived from what that beat IS** (story-grammar shaped, not generic creativity prompts), stable across beats of the same type. ≤4 items — it must be holdable, because its purpose is to be carried into the exam hall (SRSD).
8. **Every generate-ask ends with a self-check the student can run against their own sentence** — the same criteria that opened the ask, restated as a checklist. This is the terminal move by default, not a fallback (Sadler 1989; Andrade, Du & Mycek 2010).
9. **Self-check items are task-directed and observable, never person-directed.** "Does your sentence name what they DO?" — never "are you being creative enough?" (Kluger & DeNisi 1996: over a third of feedback interventions harm; person-directed is the harmful kind.)
10. **Error-spotting (✗ examples) is gated on instruction already received** — never at first exposure, where errors are an evidenced harm to novices (Große & Renkl 2007). Ties to PEDAGOGY §1.
11. **Every ✗ example ships its pre-authored correction** — "explain and correct, then be told" is the configuration that worked (McLaren et al.); the answer key is code, not an API call.
12. **✗/✓ pairs are minimal pairs** — differing on the criterion and as little else as possible, or the student abstracts the wrong dimension.
13. **Where a concept is new, contrast BEFORE telling:** show the pair, ask what differs, then state the criterion (Schwartz & Bransford 1998). Criteria-upfront (4c.1) still governs the production ask.
14. **When choosing between another example and a strategy the student can run in their head, add the strategy** (strategy instruction 0.82 vs models in the small band, Graham & Perin 2007).
15. **The push cycle degrades to accept-plus-self-check, never to a dead end.** The answer is filed either way; the redo option belongs to the student.
16. **Self-monitoring is a private criteria check, never a score, streak, badge or comparison** (house no-gamification ruling; PEDAGOGY §19).
17. **Any peer route reuses the self-check card as the peer card and requires a stated reason** — never free-form "what do you think?" (Gielen et al. 2010). Building one is a Neil product decision, not an author's call.
18. **Every rule above applies when the API is UP.** None of this is a fallback; it is the walk, and it is what makes rung 3 rare.

---

## THE DEGRADED-MODE CONTRACT — must hold at zero API (testable in a walk sim)

1. **Completion is never gated by the API.** A student with every API call failing can start, work, be helped, self-assess, file, tick, resume, and **reach the end of the walk**. Any code path where an API failure blocks progress is a defect.
2. **Liveness holds at every inbound event.** After any answer, chip tap, stale tap, resume or reload — including one whose API call just failed — the student has **either a question on screen or a chip to press**. Never zero. (`walk-sim-lib` checks this automatically; the zero-API pass inherits it.)
3. **The judgment turn degrades to accept-plus-self-check.** The student's answer is filed byte-identically to the normal path, and the criteria are re-served as a self-check with a student-owned `[Let me redo it]`.
4. **Rungs 0–2 are byte-identical at zero API.** Criteria, inline example, `[💡 More examples]`, `[📖 Guidance]`, `[🗂 Technique]` — no code path in any of them touches the API.
5. **Rung 3 degrades to the honest triple:** plain-language "I can't think this through with you right now" + re-offer rungs 0–2 + a one-tap **capture for the tutor** that files the student's stuck-point. Never a silent no-op, never a fabricated answer, never a dangling chip that does nothing.
6. **Nothing is lost.** Filing, field markers, ticks, sidebar rows, progress, pacing, chat history durability and `_healFossilTurns` behave identically; a degraded session is **indistinguishable on resume** from a normal one apart from the self-checked answers.
7. **The state is forceable and simulated.** A preview flag drives the whole walk in zero-API mode without breaking anything, and every registered walk sim runs a zero-API pass in the rig.
8. **Loud to us, honest to the student.** Every failed call logs, naming the call; the student sees one student-language sentence with zero machine tells and no internal vocabulary.
9. **Entered on a real signal, exited silently.** Degrade on an actual failure (error/credits/timeout), never on a guess; recover on the next success without announcing it a second time.
10. **No double-charging the student for our outage.** A degraded beat is filed as complete, counts as complete, and is never re-demanded, re-asked or marked provisional when the API returns.

---

**Key citations:** Haught-Tromp (2017); Stokes (2006); Boden (1990/2004); Malthouse, Liang, Russell & Hills (2022, *Cognition* 218); Scott, Leritz & Mumford (2004); Smith, Ward & Schumacher (1993); Ward (structured imagination); Sweller & Cooper (1985); Renkl (1997/2002); Renkl & Atkinson (2003); Kyun, Kalyuga & Sweller (2013); Kalyuga et al. (expertise reversal); van Merriënboer (completion strategy / 4C-ID); Gentner, Loewenstein & Thompson (2003); Loewenstein, Thompson & Gentner (1999); Schwartz & Bransford (1998); Schwartz & Martin (2004); Sadler (1989); Andrade, Du & Mycek (2010); Andrade & Boulay; Andrade, Du & Wang; Panadero, Jonsson & Botella (2017); Graham, Hebert & Harris (2015); Kluger & DeNisi (1996); Große & Renkl (2007); McLaren et al. (erroneous examples); Kulik & Kulik (1988); Butler, Karpicke & Roediger (2007); Shute (2008); Graham & Perin (2007, "Writing Next"); Harris & Graham (SRSD; Graham & Harris 2003; WWC intervention report; 2022 decade review in *Reading and Writing*); Gielen, Tops, Dochy, Onghena & Smeets (2010); Topping (peer assessment reviews). Items labelled **practitioner consensus** in the body — generic question checklists, oblique-strategy decks, the peer-assessment precondition list — have no single controlling study and are marked as such.

---
*Companion docs: `2026-08-02-teen-chat-ux-for-scripted-tutoring.md` (delivery surface — every message served under this doc obeys its 18 rules) · `2026-07-18-scaffolding-escalation-and-socratic-tutoring.md` (help/escalation layer — this doc supplies what the rungs contain when rung 3 is unavailable) · `PEDAGOGY.md` (standing rulings — this doc defers to it everywhere they touch).*
