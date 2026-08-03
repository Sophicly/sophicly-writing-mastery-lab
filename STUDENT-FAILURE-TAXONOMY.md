# The student failure taxonomy — and what code can do about each one

**Source:** Neil, 2026-08-03, from teaching and from reviewing the feedback his marking team wrote.
He flagged it himself as anecdotal — *"this is anecdotal, I don't have any hardcore evidence on
this"* — but it is expert practitioner observation across a cohort, plus a marking-team audit, which
is the strongest evidence we currently hold. **Formal research is queued (see §4), and until it lands
this document is the working spec, not settled fact.**

**Why this document exists.** Sophicly is moving Creative Writing (then Language, then Literature) to
a **zero-API** delivery for September (FIXLIST #214/#214b/#220b). The question that decides whether
that is viable is not "can code mark?" — it is **"what do students actually get wrong, and how much
of that needs judgement?"** This is that list.

---

## 1. The taxonomy, in Neil's words

1. **Describing vs analysing.** *"A lot of them can't tell the difference between describing what
   happens in a text and exploring the concepts."* Conceptual analysis is the single biggest struggle.
2. **Borrowed interpretations.** *"A lot of them rely on interpretations that they've heard elsewhere
   rather than using their understanding of the historical context to derive their own."*
3. **Quote selection.** *"A significant number struggle with selecting quotes that give them ideas
   and material to talk about."*
4. **Quote boundaries.** *"They'll cut it off in the wrong place — they'll cut off a metaphor in half,
   so it's not a metaphor anymore. So they can't talk about the metaphor because it's not in the quote."*
5. **Quote embedding.** *"They also sometimes leave it hanging at the end of the sentence, or just by
   itself. So they're not embedding it properly."*
6. **Narrow technique vocabulary.** *"Many of them have a limited vocabulary of the author's
   techniques, so they can only see a few techniques, they can only pick a few up."*
7. **Close analysis.** *"Many, if not most, struggle with close analysis. They don't actually go deep
   into fine-grained details of any specific aspect."*
8. **Inference.** *"Generally, they struggle with inference."*
9. **⭐ Effects on the reader.** *"We had a team of markers. When I looked at the feedback they were
   giving students, almost every single one of them included effects. So they struggle to understand
   how the author's techniques affect the reader."* — **the most frequent single defect in the data
   we have, because it appeared in nearly every marker's feedback.**
10. **Author's purpose.** *"A lot of them also struggle with author's purposes."*
11. **Historical context.** *"A lot of them don't see the importance of historical context. They don't
    understand the role it plays. When they're writing their analysis, they're not explaining how the
    ideas in the text, the concepts, might have originated from the context."* Compounded by school
    advice: *"some of them are even told at school that they don't actually need to know context,
    because technically with AO3 it's perspectives OR context."* Result: a shallow context link, or
    they substitute alternative interpretations. **Neil's position:** *"when they don't understand the
    historical context, it's actually very difficult to come up with a confident interpretation."*
12. **SPaG — explicitly NOT a major problem.** *"A small number have general spelling, punctuation and
    grammar mistakes. We find that when they practise a lot, they tend to iron those out naturally…
    I don't find it's one of the major problems we see."* **Do not over-invest here.**

---

## 2. ABSENCE is the easy half. ⭐ WEAK is the real problem — Neil's correction

An earlier draft of this document said "most of this list is absence, not wrongness". **Neil
corrected it, and the correction is the most important thing on this page:**

> *"Yes, I am describing absence, but sometimes they're just weak. Sometimes they are doing it.
> Sometimes it is completely absent. Maybe we can detect where it's absent — but what about where
> it's just weak? They are doing it, maybe, but they're lacking detail. I think that's probably the
> biggest issue: when they ARE doing it, it's just the detail and the specificity of the language
> that's lacking."*

So there are two populations and they need different machinery:

- **ABSENT** — the element was never written. Cheap to detect (element presence), and real: the
  marking-team audit shows missing effects across nearly every marker's feedback.
- **WEAK** — the element is present but vague. **This is the larger and harder population, and it is
  where the grade is actually lost.** A student who writes *"this makes the reader feel sad"* has
  satisfied every presence check ever written.

**A presence check passes perfectly on weak writing.** That is the same failure shape as
`feedback_negative_only_tests_pass_on_a_dead_screen` — a suite of "did they write something?"
questions returns all-green on a page full of vagueness. Any design that stops at presence checking
will report success and teach nothing.

### 2b. ⭐⭐ The move that answers it: don't DETECT weak — make weak HARD TO WRITE

Code cannot judge whether analysis is perceptive. But it does not have to, because **specificity has
mechanical signatures**, and those signatures can be turned into *requirements at the point of
writing* rather than *judgements afterwards*.

| Signature of WEAK | What code measures | The requirement it becomes |
|---|---|---|
| Close analysis that never zooms in | Does the analysis sentence contain a short quoted span (1–3 words) that is a substring of the evidence quote? | The close-analysis row requires a micro-quotation. "Which single word?" |
| ⭐ Paraphrase dressed as analysis | **Lexical overlap between the analysis sentence and the quote.** High content-word overlap = restating the quote, not exploring it | Flag: "You've re-said the quote. What does that word DO?" — this is a direct proxy for item 1, describing-vs-analysing |
| Generic technique | The named technique is a vague word ("language", "words", "device", "technique") rather than one of the 217 cards | Name the technique from the table |
| Lazy effect | A closed set of stock phrases: *"makes the reader feel sad / interested / want to read on"* | The effect must name a specific response tied to a specific word |
| Vagueness markers | Word list: *very, really, a lot of, some, things, stuff, aspects, certain, quite* | Precision prompt, with the `W1` upgrade-verb list already authored |
| Thin development | Sentence length / clause count in the element (`S2`, already specified) | Expand |

**Why this is stronger than detection.** If the outline row *requires* a micro-quotation before it can
be marked complete, the student cannot produce a vague close analysis in the first place. You have
made weak writing **structurally harder to write**, instead of catching it afterwards — which is
cheaper, faster, and matches our own research finding that **constraint beats examples**
(`research/2026-08-02-learning-without-ai-creative-beats.md`).

**The honest residual.** None of this catches a student who satisfies every surface constraint and is
still shallow — correct micro-quote, named technique, specific-sounding effect, and no real insight.
That student needs judgement: the AI tier, or the tutor. **That residual is the true size of the
zero-API gap** — much smaller than "we cannot mark without AI", much larger than zero. State it that
way; do not let a green checklist imply the gap is closed.

---

## 3. What each item needs — the three-way split that IS the design

### A. CODE CAN DETECT IT (zero API, high confidence)

| # | Item | Mechanism |
|---|---|---|
| 9 | Missing effect on reader | Element presence in the TTECEA row — is the effect element written at all? |
| 10 | Missing author's purpose | Element presence |
| 11 | Missing / shallow context | Element presence, + length and whether it names anything concrete |
| 5 | Quote not embedded | Penalty `H1`, already written as a detection rule with a worked fix |
| 4 | Quote cut in the wrong place | **Verify the quoted span against the source text on disk** — we hold the texts. A quote that is not verbatim, or that ends mid-clause, is detectable. Truncating a metaphor is harder, but *"does this quotation actually exist as written"* catches a large share and catches misquoting for free. |
| 6 | Narrow technique vocabulary | **Count DISTINCT techniques named across their work against the 217-card Table of Techniques.** A number that goes up over a term — diagnostic and motivating, zero API. |
| 12 | SPaG | Penalties `P1`, `S1`, `S2`, `T1`, `W1` — already specified. Low priority per Neil. |

### B. NEEDS JUDGEMENT (the genuine loss — keep for the AI tier, or accept degradation)

| # | Item | Why code cannot |
|---|---|---|
| 1 | Describing vs analysing | The hard one. Partial proxies exist (past-tense narrative verbs, character-as-grammatical-subject, sequence markers "then/after/next" — the `M1` retelling signature). **Use as a self-check prompt, never as a mark.** |
| 7 | Close analysis depth | Depth is a quality judgement. Weak proxy: is any single word or phrase quoted *inside* the analysis? |
| 8 | Inference quality | Not detectable. |
| 11 | Context genuinely *derived* vs bolted on | Presence is detectable; derivation is not. |

### C. NOT A DETECTION PROBLEM AT ALL — a TASK-DESIGN problem

Items 2, 3 and 11 are not things to catch after the fact. They are caused by how the task is set, and
they are fixed by changing the task — which costs nothing and needs no model:

- **2 (borrowed interpretations)** — require the interpretation to be *traced to a contextual fact
  the student names first*. If the context comes first, a borrowed reading has nowhere to attach.
- **3 (quote selection)** — teach and enforce a selection checklist *before* writing: does this quote
  contain a technique? does it carry more than one possible meaning? is it complete?
- **11 (context)** — the school advice ("AO3 is perspectives OR context") is the root. Answer it
  directly in the teaching, with Neil's own argument: without the context you cannot hold a confident
  interpretation.

---

## 4. On the dynamic gold rewrite — the loss Neil named, examined honestly

> *"the biggest thing that we would miss is actually just dynamic models — rewriting the students'
> answer to a grade nine standard. I think that would be the biggest loss. And maybe some of the
> inference as well."*

**He is right that it is the biggest single loss, and pre-written models do not fully replace it.**
The four-part per-paragraph rule gives: mark · feedback · *their own answer rewritten to gold* · an
alternative optimal model. A pre-written exemplar replaces the fourth exactly and the third not at all.

**But what makes a gold rewrite teach is not that it is dynamic — it is that the student can see the
DELTA between it and their own attempt.** A pre-written model for the same question, placed beside
their paragraph, with a *structured* comparison, recovers much of that:

> "Find the sentence in the model that states the effect on the reader. Now find yours. Write down
> what the model does that yours doesn't."

That is a harder cognitive task than reading a rewrite of their own words, and it is closer to what
the exam actually demands. It is not a full replacement. It is a good one.

---

## 5. Open — research queued

Neil: *"You could do some research if you want."* **Queued, not done.** The taxonomy above is expert
anecdote and should be tested against the literature and against our own marked-essay corpus:

1. **Our own data first** — we hold thousands of essays marked against fixed criteria at element
   level. Which elements are most often absent? Which penalty codes recur most? That converts Neil's
   anecdote into measurement using data we already own, at zero API cost. **Do this before any
   literature review.**
2. Then: KS4 literature on analysis-vs-description, effect-on-reader instruction, quotation selection
   and embedding, and whether contextual knowledge improves interpretive confidence (Neil's claim in
   item 11).

Findings go to `research/` per the repo convention.

---

## 6. Related

- FIXLIST #214 / #214b / #220 / #220b — the code-first strategy and the admin switch
- FIXLIST #215 — which penalty codes are mechanically detectable (verified from the protocols)
- FIXLIST #221 — the zero-API AO self-assessment walk
- FIXLIST #217 — pre-prepared model answers
- `research/2026-08-02-learning-without-ai-creative-beats.md` — constraint beats examples; the
  conformity effect (more examples can make outcomes worse); the degraded-mode contract
