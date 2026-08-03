# The zero-API strategy — everything decided on 2026-08-03

**One document for a conversation that ran across a dozen FIXLIST rows.** Read this first; the rows
(#214 – #224 in `~/.claude/handoffs/open/wml-FIXLIST.md`) carry the verbatim quotes and the detail.

**Status:** direction agreed, nothing built yet. The build order is §7.

---

## 1. Why this exists

Neil watched a markets analysis arguing the AI bubble will burst, that some AI companies may not
survive, and that unsubsidised pricing will put AI out of reach for many. His conclusion:

> *"I think we need to develop our website and our platform so that it's actually independent of AI.
> Meaning that all the protocols and things, they actually need to be code first, with AI as like a
> nice to have."*

**My honest read on the premise** (declared conflict: I am made by Anthropic, discount accordingly).
Two claims got run together and deserve different answers:

- *"Valuations are a bubble, some companies won't survive."* Plausible. Capital is running ahead of
  revenue, much of the compute buildout is debt-financed. I would not argue against it.
- *"Unsubsidised, nobody will afford it."* Weaker. It assumes today's cost curve frozen; the actual
  trend has been steep, repeated falls in cost per unit of capability. Our own bill shows it — WML
  runs on prompt caching where the protocol bills at ~0.1×. Caveat: frontier capability stays dear,
  and cheap models are cheap partly because frontier research subsidises them.

**But the strategy does not depend on who is right about the bubble.** Vendor risk is ordinary
supply-chain risk: price changes, model deprecations, rate limits, an outage mid-lesson. That is
reason enough, and it arrives regardless.

---

## 2. The ruling — and a correction I had to take

I initially proposed *"code floor, AI enhancement on top"*. **Neil rejected half of it:**

> *"What I'm thinking is actually trying to do it entirely with no AI, entirely. But what I don't
> wanna do is engineer it out."*

**RULED (do not re-propose the alternative):**

1. **Creative Writing targets ENTIRELY zero API.** Not code-with-AI-on-top.
2. **The AI protocols are kept, un-deleted, behind an admin switch** (#220). They stay on file.
3. **A single admin switch is enough now.** I proposed a site→tier→group→student→lesson resolution
   ladder; Neil: *"no other classes are running right now… We're only running the creative writing."*
   Noted as a later refinement, not built.
4. ⭐ **The AI protocols are the QUALITY BAR, not a test subject.** *"We've already engineered the
   planning and the assessments to a really high degree. So I don't think we need to test them again.
   What we need to do is get that level of effectiveness but without AI."* They are the specification
   the zero-API version must match — which is why this is achievable before September rather than a
   blank-page rebuild.
5. **There is nothing to migrate.** The data model does not change; only which layer produces the
   feedback. This dissolves the "students would have to transfer their data" worry.

**One engineering rule that decides whether the switch survives:** whichever path is the default is
the path that stays working. A fallback nobody runs is broken by the day you need it
(`feedback_negative_only_tests_pass_on_a_dead_screen`). So the harnesses must drive every walk with
AI **off**, and a feature that only passes with AI on has not met the contract.

**Commercial note worth deciding on separately:** AI mode is a natural tier differentiator — the code
floor is what every tier gets, the judgement layer is what a paid tier gets. That turns the cost
problem into a pricing structure. (Never the word "AI" in customer copy.)

---

## 3. What we are actually replacing

Split the work honestly, because the halves have very different answers:

- **~90% of the TEACHING is code-able.** Criteria, worked examples, technique cards, structure,
  process. **CW Step 6 already proves it: ~800 beats taught with zero API calls.** Planning is
  largely solved by the same pattern — porting it to Language and Literature is FIXLIST #213.
- **~90% of the MARKING JUDGEMENT is not.** Valid inference, perceptive-vs-clear, convincing effect.

Neil named the single biggest loss precisely:

> *"the biggest thing that we would miss is dynamic models — rewriting the students' answer to a
> grade nine standard. And maybe some of the inference as well."*

He is right, and pre-written exemplars do not fully replace it: the four-part per-paragraph rule gives
mark · feedback · **their own answer rewritten to gold** · an alternative optimal model. A pre-written
exemplar replaces the fourth exactly and the third not at all.

**What recovers most of it:** what makes a gold rewrite teach is not that it is dynamic — it is that
the student sees the **delta**. A pre-written model for the same question, beside their paragraph,
with a *structured* comparison ("find the sentence in the model that states the effect on the reader;
now find yours; write down what the model does that yours doesn't") is a harder, more exam-like task
than reading a rewrite of their own words. Not a full replacement. A good one.

---

## 4. What students actually get wrong — and the absence/weak split

Full detail: **`STUDENT-FAILURE-TAXONOMY.md`** (same folder). Two things from it govern the design.

**Neil's correction, which is the most important technical point of the day:**

> *"Yes, I am describing absence, but sometimes they're just weak… They are doing it, maybe, but
> they're lacking detail. I think that's probably the biggest issue: when they ARE doing it, it's
> just the detail and the specificity of the language that's lacking."*

- **ABSENT** — element never written. Cheap to detect. Real: the marking-team audit showed missing
  effects in nearly every marker's feedback.
- **WEAK** — present but vague. **The larger population, and where the grade is lost.**
  ⚠️ **A presence check passes perfectly on weak writing.** Any design that stops at presence
  checking will report all-green and teach nothing.

**The answer is not to detect weak — it is to make weak hard to write.** Specificity has mechanical
signatures; each becomes a *requirement at the point of writing*: a required micro-quotation in close
analysis · **lexical overlap between the analysis and the quote** (high overlap = restating, a direct
proxy for describing-vs-analysing) · a technique named from the 217-card table, not "language" ·
an effect that is not one of a closed set of stock phrases · vagueness word lists + the already-authored
`W1` upgrade verbs. Constraint beats examples
(`research/2026-08-02-learning-without-ai-creative-beats.md`).

**The honest residual:** a student can satisfy every surface constraint and still be shallow. That
needs judgement — the AI tier, or the tutor. **That residual is the true size of the zero-API gap.**
Much smaller than "we cannot mark without AI". Not zero. Never let a green checklist imply otherwise.

**Penalties (#215) — verified from source, not estimated.** The protocols already write the detection
rule for each code. Fully code-detectable: `W1` weak analytical verb (word list + upgrade list already
authored), `S1` repeated sentence starters (**the rule is already written as an algorithm**), `S2`
underdeveloped sentences, `T1` missing discourse markers, `P1` comma splice, `H1` hanging quotes.
Still needs judgement: `M1` retelling-vs-analysis, `I1`, `P2`, `E2`, `A1`, `X1`, `Q1`, `C1`.
Neil de-prioritised SPaG: *"when they practise a lot they tend to iron those out naturally."*

---

## 5. The self-assessment walk — the core deliverable (#221)

Neil's design, with the real AQA 8700/1 June 2024 mark scheme in hand.

> *"The chat needs to feed them the criteria, and then they need to mark themselves against that
> criteria."*

**Per assessment objective, one at a time** (CW = AO5 then AO6; Literature = up to four, resolved from
the paper specs, never assumed):

1. Serve the **levels** as paced chunks — band + headline ("Compelling, Convincing" 19–24) — then a pick.
2. Then the **full skills descriptors** for the chosen level, then **upper/lower half** (AQA genuinely
   splits these: U-L4 22–24 vs L-L4 19–21 are different descriptor sets).
3. **Per-descriptor multi-select** — met well / met less well.
4. A **reason**, free-typed, banked verbatim, **re-openable at any point** (Neil's explicit requirement).
5. **Model answer auto-filed** into the correct section of the document (#217).
6. **Tutor calibrates and signs off** — reuse the existing sign-off machinery.

**Why this is not a downgrade dressed up:** placing yourself against Level 4/3/2/1 and justifying it is
a *harder* cognitive task than reading feedback someone else wrote. It replaces *being marked* with
*learning to mark* — which is what transfers into the exam hall.

**Descriptors and mark arithmetic:** descriptors come from the paper's real mark scheme (verify against
the June 2024 scheme Neil supplied — never paraphrase from memory); the arithmetic is code.

---

## 6. The 1-to-many problem, and peer feedback

Neil's blocker: *"the problem is one teacher to many students. Teacher's not gonna be able to read
everything."*

**Proposed answer — the calibration gap, computed at zero API.** Student self-rates → code runs the
structural and penalty checks → **the gap between the claim and the signal is the triage number**.
Teacher reads the flagged few (biggest gap · biggest drop · no submission) plus a rotating sample:
16 essays becomes ~4 targeted reads. Calibration accuracy is also a real learning outcome in its own
right, so the metric is worth having twice over. A per-group tutor dashboard is handed off to the
dashboard lane (`open/wml-to-dashboard-GROUP-DASHBOARD-and-calibration-2026-08-03.md`).

**Peer feedback (#218)** — Neil asked whether peers need to comment on the document itself.
**Recommendation: start with transcription** ("write down your peer's feedback and who you spoke
with") — ships in days, no permission model, and transcribing is itself a learning act. Build
document-anchored peer comments only if the trial shows transcription failing.
⚠️ **The fallback is the majority path, not an edge case:** Silver students have no peer by
definition, and anyone working at home has no peer *at that moment*. So peer feedback can only ever be
an **enhancement over a self-assessment path that is complete on its own**. Research queued.

---

## 7. Build order — there is a September deadline behind this

**CW critical path (#219), Neil's order:**
Step 6 (in progress — the concept-map fix) → **Step 7** → **Step 8 scene selection** (#204 beat-transfer
picker; #205's course restructure rides with it) → **Step 9 Draft 1** → **TRIAL 1**.

**Step 9 is already a zero-API design** and Neil specified it: Draft 1 runs as a test in the
**diagnostic environment** — call the student's existing document into the diagnostic canvas, no API.
**Treat it as the first end-to-end proof of this whole strategy and instrument it.**

**Then:** the self-assessment walk (§5) for CW → trial 1 → Language → Literature.

**The trial must measure three things** or it tells us nothing:
1. **API calls per lesson**, before and after — the acceptance criterion for all of this;
2. the **self-rating vs structural-signal gap** — does it flag the students Neil would have picked?
3. **how many students the teacher actually had to read** — the number the whole model lives on.

---

## 8. The mini-LLM question (#222) — answered, so it is not re-litigated

> *"What would it take for us to build a mini LLM specifically for GCSE English?"*

- **"From scratch" videos are toy models** (~10–100M params). They produce plausible-sounding babble.
  The distance from that to judging whether a student's inference about *Macbeth* is valid is the
  central hard problem of the field, not a matter of effort.
- **The realistic version is FINE-TUNING open weights** (3–8B) on our protocols and our marked essays.
  Genuinely plausible *later*, because our rare ingredient is real: thousands of essays marked against
  fixed criteria **at element level**.
- **It does not remove dependence — it swaps API dependence for ML-ops dependence** (data curation,
  eval harnesses, GPU hosting, regression testing per model update). That is a new discipline for the
  business.
- ⭐ **For the actual worry — vendor collapse — the hedge is self-hosted OPEN WEIGHTS, not
  from-scratch.** If every AI company vanished, an open model on our own server keeps running.

**Can it run on our existing web server? Measured, not guessed** (#224): 8 vCPU Xeon Platinum 8488C,
30 GB RAM (24 GB free), 67 GB disk, **no GPU**, load 0.17.
**Installable — but not usable for LIVE marking.** CPU inference saturates all 8 cores, which
WordPress, MySQL and LiteSpeed share, so a class of 16 takes the *site* down, not just the marking.
RAM is not the constraint; cores are.
⭐ **The overnight shape is genuinely promising and fits Neil's own design** — students self-assess
first and see a tutor later, so marking never needs to be instant: submit → batch at 3am → feedback
next morning. No GPU, no monthly cost, no vendor, and it *is* the collapse hedge.
**Experiment (queued, after the September floor):** install `llama.cpp` on **staging only**, load a
quantised 7–8B model, run one real marking prompt, measure tokens/sec and wall-clock per essay. Half a
day, and it replaces an argument with a number.

**Sequence:** code-first floor now → keep banking the marked-essay data (already stored) → revisit
fine-tuning in 2027 if wanted. Not before the trial.

---

## 9. Related documents

- `STUDENT-FAILURE-TAXONOMY.md` — what students get wrong, and what code can do about each
- `ASSESSMENT-MECHANICS.md` — the engine contract (mark arithmetic is already code-owned)
- `PEDAGOGY.md` — the WHY layer; rulings register
- `research/2026-08-02-learning-without-ai-creative-beats.md` — constraint > examples; conformity
  effect; the degraded-mode contract
- `~/.claude/handoffs/open/wml-FIXLIST.md` #214 – #224 — verbatim quotes and full detail
