# Flaw / Wound doctrine + story-block criteria — settled FROM THE PRIMARY SOURCES

**Date:** 2026-07-29
**Brief:** Neil — *"I just want the correct thing… we just need to research what the correct one is
and just correct it."*
**Method:** every claim below is read out of a book **on disk** in
`Model Answers/Model Answer Resources/`. Where a source is *not* on disk, that is said plainly and
no claim is built on it (house rule 0b — a stated uncertainty is safe, a hidden guess is not).
**Supersedes in part:** `research/2026-07-29-story-element-criteria-research.md` (the earlier pass,
done without these books). Its per-block *shape* is confirmed and reused; two of its conclusions are
corrected — see §1.4 and §2.4.

**Scope of edits:** this file only. Nothing in `frontend/`, `protocols/` or `techniques.json` was
touched — the main chat is editing `wml-assessment.js` concurrently.

---

## §0. THE SOURCE LIBRARY — what is actually on disk

Neil named five authors. Result of a full-text sweep of all 160 `.md`/`.txt` files:

| Author | On disk? | File |
|---|---|---|
| **Eric Edson**, *The Story Solution: 23 Actions All Great Heroes Must Take* | ✅ **YES** | `Story Solution – 23 Actions All Great Heroes Must Take_nodrm.md` |
| **Robert McKee**, *Story* | ✅ **YES** | `Story_ Substance, Structure, Style and the Principles of Screenwriting ( PDFDrive.com ).md` |
| Robert McKee, *Dialogue* / *Action* | ✅ YES | `_MConverter.eu_437927620-Dialogue-Robert-McKee.md` · `Action (Robert McKee  Bassim El-Wakil) (Z-Library).md` |
| **John Truby**, *The Anatomy of Story* | ✅ **YES** | `epdf.tips_the-anatomy-of-story-22-steps-to-becoming-a-master.md` |
| John Truby, *The Anatomy of Genres* | ✅ YES | `The Anatomy of Genres_nodrm.md` |
| **Michael Hauge** | ⚠️ **NOT as a book** — but quoted directly, at length, inside Edson (Hauge wrote Edson's foreword and is thanked as his editor). Edson `@423` states Hauge's *identity → essence* model verbatim. | via Edson |
| **Chris Vogler** | ⚠️ **NOT as a book.** *The Writer's Journey* is absent (0 hits). Vogler is discussed 131× inside **Craig Batty**, *Movies That Move Us* | via Batty |

**Bonus find, and the most important one for this question:**

| **Dara Marks**, *Inside Story: The Power of the Transformational Arc* | ✅ **YES** | `Inside Story – The Power of the Transformational Arc…_nodrm.md` — **89 uses of "fatal flaw"**, the single densest treatment of this exact question in the whole library |

**Not on disk anywhere on the Sophicly drive:** Matt Bird (*The Secrets of Story* / *The Secrets of
Character*), Ackerman & Puglisi (*The Emotional Wound Thesaurus*), K.M. Weiland. A filename and
full-text search for `*secrets*story*` / `*matt*bird*` across the entire `Sophicly Website` tree
returns nothing. See §1.4.

---

# PART ONE — THE CONTRADICTION

## §1.1 What each source actually says

### Eric Edson — *The Story Solution* (Neil's first choice; the book Step 3 is already built on)

Edson names **two separate things** and never conflates them:

> "Begin in Act One by creating a Hero who has experienced a deep emotional **TRAUMA**. Just one
> single personal injury to the heart, no more. A specific past event so hurtful to your Hero that
> it has had the effect of isolating him emotionally…
> This past TRAUMA has created a source of great emotional pain, so the Hero's **SHIELD** of
> emotional self-protection raised to defend against any more suffering in the future now prohibits
> him from connecting on a personal level with others."
> — Edson, ch. 8 "The Character Growth Arc", `@235435`

And, decisively, in the Hero Goal Sequence #1 checklist, he makes the distinction explicit:

> "This usually is **not** a revelation of the actual TRAUMA (**the past event that caused the
> emotional wound which necessitates use of the SHIELD**) or of the pain itself. It's just a
> demonstration of the Hero's shield."
> — Edson, `@278913`

His worked pairs are always two-part, wound-then-behaviour:

| Story | TRAUMA (past) | SHIELD (present behaviour) |
|---|---|---|
| *Signs* | wife killed by a car | lost his faith, resigned as pastor, became an atheist |
| *The Silence of the Lambs* | failed to save the lambs as a child | became an FBI agent driven to defend the helpless |
| *Hitch* | dumped for being "too needy" | became an invulnerable, ultra-suave ladies' man |
| *Collateral* | raised to distrust his own abilities | fantasy escapism covering cowardly inaction |

Note the third and fourth: **the shield is a real capability** (Clarice's vocation, Hitch's charm),
not merely a fault. That matters for §2.

### Dara Marks — *Inside Story* (the deepest single formulation in the library)

> "This unyielding commitment to old, exhausted survival systems that have outlived their
> usefulness, and resistance to the rejuvenating energy of new, evolving levels of existence and
> consciousness is what I refer to as the **fatal flaw of character**.
> **The FATAL FLAW is a struggle within a character to maintain a survival system long after it has
> outlived its usefulness.**"
> — Marks, ch. 5, `@223454`

Two things follow, both load-bearing:
1. The flaw is a **present, ongoing struggle** — a behaviour being maintained *now*.
2. It is a **survival system**: it once protected. Marks is explicit that the flaw is *not* a moral
   judgement — "The fatal effect occurs when life stops, when growth and change are held back"
   (`@226298`). This is Edson's SHIELD, stated as a mechanism rather than an example.

Marks also supplies the *derivation* rule, which nothing in Sophicly currently teaches:
> "1. The fatal flaw represents the opposite value of the theme.
>  2. The fatal flaw is determined by inverting… the internal goal of the theme." — `@230392`

### John Truby — *The Anatomy of Story*

Truby's term for the wound is the **ghost**, and his definition settles the causal direction:

> "The first and most common is an event from the past that still haunts the hero in the present.
> **The ghost is an open wound that is often the source of the hero's psychological and moral
> weakness.**… You can also think of this first kind of ghost as the hero's *internal opponent*. It
> is the great fear that is holding him back from action."
> — Truby, Step 2 "Ghost and Story World", `@485292`

So for Truby: **ghost (past event) → weakness (present)**. Two steps, causally linked, never the
same step. He lists them as separate numbered structure steps (`2. ghost and story world`;
`3. weakness and need` — see his *Godfather* breakdown, `@578563`).

**And — this is the finding that dissolves the second half of the conflict — Truby is also the
source of the "flip-side of a strength" idea the `Fw` card teaches:**

> "A second technique for creating a good moral need is to **push a strength so far that it becomes
> a weakness**. The technique works like this: 1. Identify a virtue in your character. Then make him
> so passionate about it that it becomes oppressive. 2. Come up with a value the character believes
> in. Then find the negative version of that value."
> — Truby, "Seven-Steps Technique: Creating the Moral Need", `@63996`

### Michael Hauge (via Edson, `@423`)

> "Author and top Hollywood script consultant Michael Hauge calls this progressive discovery of
> personal truth the hero's inner journey: a transformation from **identity**, *the state of hiding
> behind a self-protective mask*, to **essence**, where the hero at last reaches an unmasked,
> emotionally honest and fulfilled existence."

Hauge's *identity* is Edson's *shield* under another name. Independent corroboration, same model.

### Robert McKee — *Story*

McKee does not use "wound" or "shield". His axis is different and, for our purposes, complementary:

> "*Characterization* is the sum of all observable qualities of a human being… This singular
> assemblage of traits is *characterization* … but it is not *character.*
> **TRUE CHARACTER is revealed in the choices a human being makes under pressure** — the greater the
> pressure, the deeper the revelation."
> — McKee, "Character Versus Characterization", `@191402`

> "The revelation of true character in contrast or contradiction to characterization is fundamental
> to all fine storytelling. Life teaches this grand principle: **What *seems* is not what *is.***"
> — `@195597`

This is the bridge to GCSE Literature (§2.3): the shield is what *seems*; the wound is part of what
*is*; and the instrument that separates them is **pressure**.

## §1.2 Do the authors disagree? (Do not blend them — say where they part.)

**They agree on the chain.** Past hurt → protective present behaviour → story applies pressure →
behaviour fails → change. Edson (TRAUMA→SHIELD), Truby (ghost→weakness), Marks (obsolete survival
system), Hauge (identity→essence) are four descriptions of one mechanism. That is not an averaging;
it is four sources independently naming the same two-layer structure.

**Two genuine divergences, which must be kept and not smoothed over:**

1. **Is the flaw *admirable*?**
   *Marks* says the fatal flaw is neither moral judgement nor defect — it is an outdated survival
   system, morally neutral. *Truby* goes further: he actively recommends **building the flaw out of
   a virtue** ("push a strength so far that it becomes a weakness"). *Edson's* examples split both
   ways — Clarice's shield is a vocation, Melvin Udall's is plain unpleasantness.
   **Ruling for Sophicly:** teach "usually a real strength pushed too far" as the *rich* form, not
   the *only* form. Word it as "usually", never "always" — otherwise a student writing a genuinely
   ugly flaw is told they are wrong when Edson and Marks would both accept it.

2. **Does the story require ONE wound?**
   *Edson* is emphatic: "Just one single personal injury to the heart, **no more**." *Truby* allows
   a ghost that is not a single event at all — Michael Corleone's is "not a single event from his
   past but a family legacy of crime and killing" (`@578563`).
   **Ruling for Sophicly:** follow **Edson** (one specific moment). This is a pedagogical choice and
   should be stated as one: a 14-year-old who may write "a legacy" writes a mood, and a mood cannot
   be pressed on by an inciting incident. Edson's constraint is the teachable one.

## §1.3 THE VERDICT — is A vs B a real doctrinal conflict?

**No. It is one model described badly on one of the two surfaces — and the error is a wording
error, not a doctrine error.**

- **B (the Step 3 ask)** — *"a flaw… is an emotional shield — a behaviour built to protect a deeper
  hurt"* — is **correct and well-sourced**. It is Edson's TRAUMA/SHIELD verbatim, corroborated by
  Truby's ghost→weakness and Hauge's identity→essence.
- **A (the `Fw` card)** — *"not the past wound that caused it, but the trait that shapes how they
  act now"* — is **making a correct DEFINITIONAL point in words that read as a DENIAL of the causal
  link.** The card is trying to say *the flaw is not identical to the wound*. That is right, and
  every source agrees. But the phrase "**not the past wound that caused it**" — read cold by a
  fourteen-year-old one minute after being taught "a behaviour built to protect a deeper hurt" —
  reads as *"forget what you were just told."* The clause is technically defensible and
  pedagogically indefensible.

**Three pieces of internal evidence confirm this reading:**

1. **Sophicly's own `Gh` card already teaches the correct unified model** and nobody noticed:
   > *"An old loss, betrayal or failure leaves a wound, and **the defences built over it harden into
   > the flaw** the story must break down… **the flaw we judge is usually a defence built over a
   > wound.**"* — `techniques.json`, card `Gh` "The Ghost / Wound", alias **"The Wound & Shield"**,
   > tags include `shield`.
   So `Gh` and the Step 3 ask agree with each other and with Edson. **`Fw` is the lone outlier, by
   one clause.**
2. **Neil has already ruled on the causality.** `PEDAGOGY.md` §20 (2026-07-28): *"Neil asked whether
   the wound should come before the flaw, since 'the flaw actually grows out of the wound'. **He is
   right about the causality** and it still stays flaw-first."* The flaw-first ordering is a
   *sequencing* decision (observable before inferred), never a denial that the wound causes the flaw.
   `Fw`'s wording contradicts a ruling already on the books.
3. **The `Hm` (Hamartia) card is already correct and must not be disturbed.** It says hamartia is
   *"Crucially NOT a 'fatal flaw' they were born with: that is a mistranslation of the Greek. The
   tragedy turns on a decision, not a defect of birth."* This is right, and it means Sophicly
   already distinguishes three things properly: **wound** (`Gh`) · **flaw** (`Fw`) · **the error in
   action** (`Hm`). The fix must preserve that three-way split.

**So: no ruling from Neil is required on "shield vs hamartia".** The earlier research pass
(§2.2a of `2026-07-29-story-element-criteria-research.md`) framed this as two rival models needing
Neil's adjudication. That framing is **overturned**: they are not rivals.
- The "flip-side of a strength" idea is **Truby's**, not Aristotle's, and Truby teaches it *inside*
  the same wound→weakness framework. It is a technique for *generating* a flaw, not a competing
  definition of one.
- Aristotle's hamartia is a *different concept altogether* (an error in action), already correctly
  and separately carded as `Hm`.
There is nothing to average and nothing to choose between.

## §1.4 THE MATT BIRD ATTRIBUTION — verdict: **wrong as written; unverifiable as a claim about Bird; the right citation is Edson**

The live student-facing sentence, `frontend/wml-assessment.js` ~line 38700 (reference guide):
> "**3. Flaw** — The protagonist's **emotional shield** — a visible behaviour they've developed to
> protect themselves from a deeper wound or trauma. **Matt Bird calls this the "emotional shield"
> concept.**"

Same claim in Neil's own `Creative Writing Reference Guide.md` (`@40936`):
> "(The idea of the flaw as an emotional shield comes from Matt Bird's *The Secrets of Story*; at
> Sophicly we treat it as the heart of character.)"

**What the disk actually shows:**

| Evidence | Finding |
|---|---|
| `"emotional shield"` across all 160 files | **10 hits in Edson**, 3 hits in Sophicly's own CW Reference Guide. **Zero anywhere else.** |
| `"Matt Bird"` across all 160 files | 2 hits. One is Sophicly's own guide (the claim itself). The other is `48 Techniques to Generate Emotions in the Reader.md` `@5698` — where Bird is cited **only on sympathy vs empathy** *(Bird, 2017)*, nothing to do with shields. |
| Bird's books on the Sophicly drive | **Absent.** No file matches `*secrets*story*` or `*matt*bird*` anywhere under `Sophicly Website`. |
| Corroboration that Step 3 is built on Edson | **"Stunning Surprise" appears 77× in Edson** — and the reference guide uses "the *stunning surprise*" for the inciting incident in the very same paragraph block as the Bird attribution. The architecture around the sentence is Edson's. |

**Verdict, stated at the confidence the evidence supports:**
- **The sentence as written should not ship.** We have no source on disk for it, and the term it
  attributes to Bird is used ten times by an author we *do* hold.
- **I cannot verify from primary sources whether Matt Bird ever uses the phrase**, because his books
  are not on the drive. I am therefore **not** asserting he never did. I am asserting that
  **nothing available to us supports the claim**, and that a student-facing sentence naming a real,
  living author must not rest on nothing.
- **The earlier research pass proposed Ackerman & Puglisi instead.** That is also unverifiable here
  (their book is likewise absent) and would swap one unsourced name for another.
- **✅ Recommended fix — cite what we hold.** Either:
  - **(a) preferred:** *"Eric Edson calls this the **emotional shield** — the self-protective
    behaviour raised over a past hurt (*The Story Solution*)."* — this is defensible from the copy on
    our own disk, quotable at `@235435`; **or**
  - **(b) simplest:** delete the attribution clause entirely. The teaching is not weakened by having
    no name attached, and no name is safer than a wrong one.

---

# PART TWO — THE CORRECTED MODEL

## §2.1 One model, three parts, stated once

> **THE WOUND** is what happened. **THE FLAW** is what they now do about it. **THE STORY** is the
> pressure that makes doing it stop working.

- **WOUND** *(past · inferred · card `Gh`)* — one specific hurt, before page one.
  *Edson's TRAUMA; Truby's ghost, "an open wound… the source of the hero's weakness".*
- **FLAW** *(present · observable · card `Fw`)* — the repeated behaviour built over that hurt to
  keep it from being felt again. It **once worked**, which is why it is still there; it has now
  **outlived its usefulness**, which is why it costs them. Its richest form is a genuine strength
  pushed too far, which is why letting it go feels like losing themselves.
  *Edson's SHIELD; Marks' "survival system… long after it has outlived its usefulness"; Hauge's
  identity-mask; Truby's "push a strength so far that it becomes a weakness".*
- **They are two things, and one causes the other.** The flaw is not the wound; the flaw is the
  wound's *armour*. Saying "not the wound" is right; saying "not the wound **that caused it**" is
  the sentence that broke.

## §2.2 Corrected wording — the `Fw` card

**CURRENT (`techniques.json`, card `Fw`, field `definition`):**
> "A character's present defining weakness — **not the past wound that caused it**, but the trait
> that shapes how they act now. Its richest form is the flip-side of a genuine strength: courage
> shading into recklessness, loyalty into blindness. That is why it is so hard to give up, since to
> lose the flaw risks losing the strength that comes with it."

**PROPOSED `definition`:**
> "A character's present defining weakness — the behaviour we watch them repeat, rather than the
> past wound it is built over (that hurt is the Ghost, `Gh`). A flaw is armour: it protected them
> once, and it is still in use long after the danger has passed. Its richest form is the flip-side
> of a genuine strength — courage shading into recklessness, loyalty into blindness — which is why
> it is so hard to give up: to lose the flaw risks losing the strength that comes with it."

**PROPOSED `concept`** *(the literary-analysis register; keeps the tragic engine, adds the mechanism)*:
> "The flaw is a character's present defining weakness, and it is best read as a defence: a
> behaviour raised over an old hurt, which served them once and now costs them. Its deepest form is
> the flip-side of a strength we admire, so that valour shades into recklessness or loyalty into
> blindness, and to surrender the flaw is to risk the very quality that makes the character
> themselves. That is the quiet engine of every tragic fall — a survival system kept long after it
> has stopped keeping anyone safe."

**What changed and why, clause by clause:**

| Change | Reason |
|---|---|
| "not the past wound **that caused it**" → "rather than the past wound **it is built over** (that hurt is the Ghost, `Gh`)" | Removes the accidental denial of causation. Keeps the definitional distinction, which every source supports. Points the student at the sibling card instead of leaving a dangling negation. |
| **added** "A flaw is armour: it protected them once, and it is still in use long after the danger has passed." | Imports Marks' actual definition (`@223454`) and Edson's SHIELD. This is the clause the card was missing — without it "weakness" is just a fault, and the card cannot agree with `Gh` or with the ask. |
| "richest form is the flip-side of a genuine strength" — **kept verbatim** | Now known to be **Truby's** technique (`@63996`), not a rival Aristotelian model. It belongs here. |
| `Hm` (Hamartia) card — **no change** | Already correct: hamartia is an error in action, "not a defect of birth". The three-way split wound / flaw / error must survive this edit. |
| `Gh` card — **no change to `definition`** | Already teaches the unified model correctly. |
| `Fw.related` | Suggest adding `Gh` **first** in the array (currently `Pr, Gh, Wa, Ax, Cr`) — low priority, but the wound is now named in the definition. |

**Literature check — does it survive hamartia-style use?** The card's own three examples still work,
and work *better*:
- **Macbeth** — flaw: valour driven into ambition (Truby's strength-pushed-too-far). Armour: force
  as the answer to insecurity, which "protected him once" on the battlefield and is catastrophic in
  a palace. Wound/`Gh`: kept separate. Error in action/`Hm`: choosing to murder Duncan *after* he
  has argued himself out of it. Three distinct things, three distinct cards.
- **Othello** — flaw: openness curdling into credulity. Armour: the soldier's directness that served
  him in Venice's wars and cannot survive Venice's drawing rooms. `Gh` already carries his wound
  ("the buried wound as a perpetual outsider"). `Hm`: trusting Iago over Desdemona.
- **Sheila (*An Inspector Calls*)** — flaw: thoughtlessness, "the flip-side of a real capacity for
  feeling"; armour: the comfortable blindness of her class.
- **McKee bridge:** the flaw is *characterization* (what seems); pressure reveals *true character*
  (what is). An essay that says "the pressure of X strips the characterization to reveal…" is doing
  exactly what McKee describes and exactly what AO2 rewards.

## §2.3 Corrected wording — the Step 3 flaw ask

**CURRENT (`frontend/wml-assessment.js` ~18675, `fid: 'cw-step-3-flaw'`; mirrored in
`protocols/shared/creative-writing/_cw-step-3-source.md:69`):**
> **2 of 7 — The flaw**
> In the strongest stories the protagonist isn't perfect — they carry a **flaw**: a visible,
> repeated behaviour that gets them into trouble.
> **A strong flaw:**
> - is an **emotional shield** — a behaviour built to protect a deeper hurt (that hurt is our next block)
> - **actually works** — in everyday life it holds the pain at bay, which is exactly why they keep using it
> - is something the protagonist **doesn't yet understand about themselves**

Three defects: (1) two of the three ticks are truncations that certify nothing (the `criteria-lint`
DENY + INFO-LOSS failures); (2) "actually works" is present-tense, but the thing that *works* is the
past-tense protection — the whole point is that it has stopped working, which is what the inciting
incident does; (3) it never says the flaw is often a strength, so it silently disagrees with `Fw`.

**PROPOSED — full replacement ask** (paced per WML CLAUDE.md §4b; `HELP_LINE` unchanged):

> **2 of 7 — The flaw**
>
> Your protagonist isn't perfect — they carry a **flaw**: a behaviour you could watch them repeat,
> and it keeps getting them into trouble.
>
> Here is the part that turns a bad habit into a story. A flaw is **armour**. Something hurt them
> once, and they built this behaviour over the top of it so nothing could reach that place again.
> It worked. That is exactly why they still do it — and why the story is going to have to take it
> off them.
>
> **A strong flaw:**
>
> - **is a behaviour we could watch them repeat**. Not a mood and not a backstory — something a
>   camera could film them doing more than once.
> - **protected them once, back when the hurt happened**. That is exactly why it is still there:
>   it worked.
> - **costs them something now that the danger has passed**. The armour is out of date, and the
>   story is what finally proves it.
> - **is usually a real strength pushed too far**. Loyalty hardening into blindness, courage into
>   recklessness — which is why letting go of it feels like losing themselves.
> - **is something the protagonist cannot yet see in themselves**. Everyone around them can see it
>   perfectly well.
>
> **Examples:**
>
> - Scrooge's flaw is **greed** — money is armour against people, because money cannot abandon him.
> - Katniss's flaw is **cold detachment** — the self-reliance that kept her family alive, hardened
>   until she cannot let anyone close.
> - Marlin's flaw in *Finding Nemo* is **smothering overprotection** — a father's care pushed so far
>   it becomes the cage his son swims out of.
>
> **Watch out:** "clumsy" or "shy" on its own is a quirk, not a flaw. A habit is something they do;
> a flaw is something they do *instead of* facing something. If you cannot say what it is protecting
> them from, you have a habit — and the next block will not have anything to hold.
>
> *(HELP_LINE)*
>
> **What does your protagonist do, again and again, that keeps getting them into trouble?**

**The two surfaces now agree**, in these words, on all four points: the flaw is the *behaviour*; the
wound is a *separate, causally prior* thing; the behaviour is *armour that once worked*; and it is
*often a strength pushed too far*.

## §2.4 One thing from the earlier pass to keep, one to drop

- **KEEP:** its "**the sentence the wound taught them**" mechanism for the Wound block. It has no
  single named source on disk, but it is a faithful operationalisation of Marks' "self-perception"
  (`@226298` — "the flaw in George's limited perception of his own identity") and Truby's ghost-as-
  internal-opponent. It is the only proposal in either pass that makes "fits the flaw exactly"
  *checkable* rather than vibes. Retained in §3, Wound criterion 3.
- **DROP:** its §2.2a framing of shield-vs-hamartia as a live conflict requiring Neil's ruling
  (see §1.3), and its Ackerman & Puglisi attribution recommendation (see §1.4).

---

# PART THREE — CRITERIA FOR ALL TEN BLOCKS

## §3.0 ⚠️ THE AUTHORING RULE THE HARNESS ENFORCES — and a trap that will bite the next author

Three gates apply to every tick line:
1. **`bin/cw-keymatch-harness.js:360`** — each criterion must be a **verbatim substring** of its own
   ask.
2. **`bin/criteria-lint.js`** — INFO-LOSS (≥40% of the source clause) · MIN-WORDS (≥4) · BARE-VERB ·
   NO-NOUN · DENY · DUPLICATE (<0.7 Jaccard) · RESTATES · COUNT (≥3).
3. `PEDAGOGY.md` §19 — criteria are **lifted, never authored beside the ask**.

**The pattern that satisfies all three:**

> **Write each bullet as `**<TICK LINE>**. <one elaborating sentence>`** — the tick line *is* the
> bullet's whole first sentence, so nothing can be lost in the lift and retention is ~90–98%.

**⚠️ THE TRAP — put the closing `**` BEFORE the full stop, not after.**
`criteria-lint.js::definingClause()` finds the end of the source clause with `/[.!?](?:\s|$)/` and
**does not strip markdown from the bullet first**. So `**…frightened.**` puts the full stop next to
an asterisk, not whitespace — the regex skips it, the "clause" swallows the entire bullet, and a
perfectly good criterion fails INFO-LOSS at ~30%.

I hit this on the first pass: the *identical* 42 criteria scored **24 INFO-LOSS failures** written as
`**tick.** elab` and **0 failures** written as `**tick**. elab`. Same words, different asterisk.
Worth a one-line comment in `criteria-lint.js` or a `stripMd()` on the bullet inside
`definingClause()` — as it stands the gate punishes a formatting choice, not a quality one.

**Verification status of everything in §3.1–§3.10 below:** all 42 criteria were run against
`criteria-lint.js`'s own rule set and thresholds, copied verbatim (MIN_RETAIN 0.40, MIN_WORDS 4,
MIN_CRITERIA 3, DUP_SIMILARITY 0.7, the full DENY_LIST / VERB_HEADS / DETERMINERS / CRAFT_NOUNS
sets), with each criterion paired to its proposed bullet.
**Result: 10 blocks, 42 criteria, `✅ CLEAN` — 0 failures.**
*(For comparison, the current live set fails 44 checks.)* These were **not** run through
`cw-keymatch-harness.js`, which needs the real edited file — but the substring property holds by
construction, since every tick line is authored as the literal opening of its own bullet.

---

## §3.1 PROTAGONIST — *adequate; sharpened, not replaced*

| # | Bullet (as it appears in the ask) | Tick line (verbatim lift) |
|---|---|---|
| 1 | **changes more than anyone else in the story**. The distance they travel is what the story means. | `changes more than anyone else in the story` |
| 2 | **takes action even when they are frightened**. Flawed, failing and afraid is fine; too passive to act is not. | `takes action even when they are frightened` |
| 3 | **gives the reader a reason to care in the first few lines**. Good at something, kind to someone, or treated unfairly through no fault of their own. | `gives the reader a reason to care in the first few lines` |

*Fixes:* `has courage` failed MIN-WORDS, BARE-VERB and NO-NOUN, and misdescribed what the bullet
actually asks for (acting while afraid, not being brave).

**Examples (varied):**
- **Strong —** Scrooge begins cruel and miserly and ends generous; the distance *is* the meaning of
  *A Christmas Carol*.
- **Strong —** Sheila Birling begins pleased with herself and ends the only Birling who has genuinely
  changed — in a play where the others' refusal to move is the point.
- **Strong (negative arc) —** Macbeth begins a loyal soldier and ends a tyrant; a change towards ruin
  reveals meaning just as powerfully.
- **Weak → strong —** "A boy who is really good at football." *(no change, so no meaning)* → "A boy
  who has to choose between the team that made him and the brother who needs him at home."

**Watch out:** the protagonist is not automatically the narrator, the strongest character, or the one
who speaks most. It is whoever is most different on the last page from the first.

## §3.2 FLAW — *worst of the ten; fully rebuilt (see §2.3 for the whole ask)*

| # | Bullet | Tick line |
|---|---|---|
| 1 | **is a behaviour we could watch them repeat**. Not a mood and not a backstory — something a camera could film them doing more than once. | `is a behaviour we could watch them repeat` |
| 2 | **protected them once, back when the hurt happened**. That is exactly why it is still there: it worked. | `protected them once, back when the hurt happened` |
| 3 | **costs them something now that the danger has passed**. The armour is out of date, and the story is what finally proves it. | `costs them something now that the danger has passed` |
| 4 | **is usually a real strength pushed too far**. Loyalty hardening into blindness, courage into recklessness — which is why letting go of it feels like losing themselves. | `is usually a real strength pushed too far` |
| 5 | **is something the protagonist cannot yet see in themselves**. Everyone around them can see it perfectly well. | `is something the protagonist cannot yet see in themselves` |

*Criteria 2 and 3 are the split that makes "emotional shield" tickable.* Marks' definition is
precisely the **gap** between "it protected them once" and "it costs them now". A student who can
tick 2 but not 3 has written backstory; one who can tick 3 but not 2 has written a bad habit. Neither
alone is a flaw. This is the direct answer to Neil's *"research about how emotional shields actually
work."* Criterion 4 is Truby (`@63996`), worded "usually" per §1.2.

**Examples (varied):**
- **Strong —** Miss Havisham's stopped clocks (*Great Expectations*): a behaviour that froze time at
  the moment of the wound so it could never happen again — and cost her everything after it.
- **Strong —** Marlin's overprotection (*Finding Nemo*): a father's care, which genuinely kept Nemo
  safe, pushed until it becomes the cage his son swims out of. The armour causes the exact disaster
  it was built to prevent.
- **Strong —** Sheila Birling's comfortable blindness: it kept her world pleasant for eighteen years
  and costs Eva Smith her job in a single afternoon.
- **Weak → strong —** "He is arrogant." *(a label; nothing to film, nothing protected)* → "He answers
  every question before anyone else can, especially the ones he cannot actually answer."

**Watch out:** if you cannot say what the behaviour is protecting them *from*, you have a habit, not
a flaw — and the Wound block will have nothing to hold on to.

## §3.3 WOUND

| # | Bullet | Tick line |
|---|---|---|
| 1 | **is one specific moment, not a general sadness**. A day, a room, a thing that was said. | `is one specific moment, not a general sadness` |
| 2 | **happened before your story begins**. It is the reason they are already like this on page one. | `happened before your story begins` |
| 3 | **taught them a sentence they still believe**. "Need no one and no one can leave you." That sentence is the hinge between the wound and the flaw. | `taught them a sentence they still believe` |
| 4 | **explains the exact shape of the flaw**. The armour always matches the injury it was built over. | `explains the exact shape of the flaw` |
| 5 | **stays unspoken while the behaviour shows it**. We see it in what they do long before anyone says it aloud. | `stays unspoken while the behaviour shows it` |

*Criterion 1 follows Edson's "one single personal injury… no more" (§1.2, ruling 2). Criterion 5
follows Truby's warning against over-exposition: "try withholding a lot of information about your
hero, including the details of his ghost" (`@488062`).*

**Examples (varied):**
- **Strong —** Miss Havisham: jilted at twenty to nine. So specific the clocks still show it.
- **Strong —** Heathcliff: brought into a house as an outsider and never allowed to belong → the
  sentence *"people like me are always sent away"* → the flaw of taking by force what he was never
  given.
- **Fits / doesn't fit —** wound "my family was taken while I was not looking" → sentence "looking
  away is fatal" → flaw "cannot let anyone out of sight." ✅ Versus: wound "his brother drowned" →
  flaw "he is arrogant." ❌ Nothing connects them until you add the middle term (*he was praised for
  surviving when his brother did not* → arrogance as armour over survivor's guilt).

**Watch out:** the commonest mistake is going too big. A wound need not be a death. Being humiliated
once, in front of people whose opinion mattered, will run a whole novel — provided you can say what
it taught them.

## §3.4 INCITING INCIDENT

| # | Bullet | Tick line |
|---|---|---|
| 1 | **is a single event on one particular day**. Not a situation, not a mood, not "things were getting worse". | `is a single event on one particular day` |
| 2 | **breaks the routine they were hiding inside**. The comfortable pattern that kept the wound at a safe distance stops being available. | `breaks the routine they were hiding inside` |
| 3 | **makes the shield stop working**. Check it against your Flaw answer: the event must press on exactly that behaviour. | `makes the shield stop working` |
| 4 | **arrives from outside, not from a decision they made**. It happens TO them; their choice comes next, and that choice is the story. | `arrives from outside, not from a decision they made` |
| 5 | **feels like escaping the frying pan into the fire**. Whatever relief it brings drops them somewhere worse. | `feels like escaping the frying pan into the fire` |

*Criterion 3 is the block's real job and is currently only implied by the ask's prose ("the moment
their emotional shield stops working") while the tick list asks about the routine instead.*

**Examples (varied):**
- **Strong —** Marley's ghost arrives, and Scrooge can no longer hide behind his ledgers.
- **Strong —** the Inspector rings the doorbell mid-celebration, and the Birlings' comfortable
  evening cannot be resumed.
- **Strong —** Hagrid hands over a letter, and the cupboard under the stairs is finished.
- **Weak → strong —** "Life is hard at school." *(a situation)* → "On the first morning of term the
  new head teacher confiscates his brother's coat." *(a day, a person, an object)*

**Watch out:** if your protagonist *chose* it, it is not the inciting incident — it is their response
to one. Look for the thing that happened to them just before.

## §3.5 GOAL — *currently 2 criteria; fails `COUNT`*

| # | Bullet | Tick line |
|---|---|---|
| 1 | **is one physical finish line we could photograph**. We would know the moment it is reached without being told. | `is one physical finish line we could photograph` |
| 2 | **stands for a deeper need they cannot yet name**. The visible goal drives the plot; the hidden need drives the meaning. | `stands for a deeper need they cannot yet name` |
| 3 | **is the opposite of what the shield gives them**. The goal chases comfort; the need asks them to put the armour down. | `is the opposite of what the shield gives them` |
| 4 | **can be blocked by another person**. If nobody can stand in the way, there is no story yet. | `can be blocked by another person` |

*Criterion 3 is Marks' inversion rule (`@230392`: "the fatal flaw is determined by inverting… the
internal goal") turned into something a 14-year-old can check. Criterion 4 imports Truby's point
that desire is what the opponent contests.*

**Examples (varied):**
- **Luke Skywalker —** external goal: rescue Leia. Internal need: discover who he is meant to become.
- **Marlin —** goal: find Nemo. Need: learn to let go. Exact opposites, which is why the film can only
  end when he lets Nemo swim into the net.
- **Scrooge —** goal: protect his wealth. Need: people. Exact opposites.
- **Failing example —** shield "he pushes people away"; need "to be left alone." Those *agree*, so
  achieving the goal costs him nothing and the story has no engine.

**Watch out:** "to be happy" is not a goal — you cannot photograph it. Ask what the last shot would be.

## §3.6 OBSTACLE — *third-worst; rebuilt*

| # | Bullet | Tick line |
|---|---|---|
| 1 | **attacks the flaw at its weakest point**. It forces the protagonist to face the very thing they have been hiding behind. | `attacks the flaw at its weakest point` |
| 2 | **is a person, a group or a force we can point at**. Never "society" or "fate" in the abstract. | `is a person, a group or a force we can point at` |
| 3 | **is strong enough that the protagonist must change to win**. If the old armour would still do the job, the obstacle is too weak. | `is strong enough that the protagonist must change to win` |
| 4 | **often mirrors the flaw back at them**. The darkest opponent shows the protagonist what they could become. | `often mirrors the flaw back at them` |
| 5 | **gets harder each time they push back**. Pressure that stays level stops teaching us anything about them. | `gets harder each time they push back` |

*Criterion 3 is the one the current list lacks entirely, and it is the load-bearing one: it is Marks'
whole thesis ("the conflict in his outer life demands inner transformation if survival is to be
achieved", `@223454`) and McKee's "the greater the pressure, the deeper the revelation" (`@191402`).
Criterion 5 is the escalation principle — without it students write one obstacle five times.*

**Examples (varied):**
- **Strong —** Inspector Goole forces Sheila to confront her family's complicity, attacking the
  comfortable blindness she has been living inside. She cannot win by being charming — she has to
  change.
- **Strong (dark mirror) —** Hyde as the mirror of Jekyll's own repressed appetites — "the animal
  within me licking the chops of memory."
- **Strong (impersonal but pointable) —** in *Exposure*, "the merciless iced east winds that knive
  us" kill the soldiers no human enemy could. Not a villain, still a force you can point at.
- **Weak → strong —** "Society is against her." *(cannot be pointed at)* → "The head of sixth form,
  who taught her mother and has already decided who she is."

**Watch out:** if your protagonist could beat this obstacle **without changing at all**, you have an
inconvenience, not an obstacle.

## §3.7 STAKES

| # | Bullet | Tick line |
|---|---|---|
| 1 | **name the one thing lost and the person who loses it**. "The world ends" is vague; "her little sister goes into the arena alone" is not. | `name the one thing lost and the person who loses it` |
| 2 | **would cost as much as survival, even in a comedy**. Failing has to take something the protagonist cannot simply replace. | `would cost as much as survival, even in a comedy` |
| 3 | **land on the wound, not just on the plot**. The best stakes threaten the exact thing that already hurt them once. | `land on the wound, not just on the plot` |
| 4 | **would devastate this protagonist in particular**. Swap in another character and the loss should stop hurting as much. | `would devastate this protagonist in particular` |

**Examples (varied):**
- **Katniss —** wound: losing family. Stake: Prim. Same target. Not a coincidence — that is the design.
- **Marlin —** wound: losing a child to the open sea. Stake: losing a child to the open sea. The story
  makes him face the identical loss with the armour off.
- **Scrooge —** if he does not change he dies alone and unmourned: the exact future the ghost makes
  him watch.
- **Weak → strong —** "If she fails, the world ends." → "If she fails, her sister finds out it was
  her." *(smaller, and infinitely heavier)*

**Watch out:** bigger is not heavier. A city you have never met is worth less than one person we have
watched them love.

## §3.8 LOGLINE 1 — ACTION-ORIENTED *(adequate; MIN-WORDS fixes only)*

| # | Bullet | Tick line |
|---|---|---|
| 1 | **a single clear event that kicks the story off**. "After being rescued by a German bounty hunter…" | `a single clear event that kicks the story off` |
| 2 | **a concrete action the protagonist takes in response**. "…a freed slave sets out to rescue his wife…" | `a concrete action the protagonist takes in response` |
| 3 | **a specific antagonist standing in their way**. "…from a brutal Mississippi plantation owner." | `a specific antagonist standing in their way` |
| 4 | **one sentence a stranger could picture immediately**. If they have to ask what actually happens, it is not there yet. | `one sentence a stranger could picture immediately` |

**Examples:** *Django Unchained* (above, split across the three ticks) · *Stranger Things* — "When a
young boy disappears, his mother, a police chief, and his three friends must confront terrifying
forces to get him back."
**Watch out:** "a young man goes on a journey of self-discovery" contains no event, no action and no
antagonist. Three ticks fail at once.

## §3.9 LOGLINE 2 — GOAL-ORIENTED *(adequate; MIN-WORDS fixes only)*

| # | Bullet | Tick line |
|---|---|---|
| 1 | **a protagonist we glimpse in a single phrase**. "Luke Skywalker, a spirited farm boy…" | `a protagonist we glimpse in a single phrase` |
| 2 | **a picturable goal with a finish line**. "…joins rebel forces to fight the evil Darth Vader and rescue Princess Leia…" | `a picturable goal with a finish line` |
| 3 | **a stake that would genuinely hurt to lose**. "…from certain death at the hands of the Empire." | `a stake that would genuinely hurt to lose` |

**Watch out:** "a girl" is not a glimpse. "A guarded, self-reliant teenager" is — two adjectives that
already hint at the flaw.

## §3.10 LOGLINE 3 — CHARACTER-ARC ORIENTED — *second-worst; rebuilt*

The current ticks (`the opportunity` · `the flaw they must change` · `the solution changing it
unlocks`) are slot *names* rather than standards — a student ticks them by having written *something*
in each slot. Rebuilt so each names what the slot must contain:

| # | Bullet | Tick line |
|---|---|---|
| 1 | **the opportunity in front of the protagonist**. "An old, greedy capitalist called Scrooge has an opportunity to improve the lives of those around him…" | `the opportunity in front of the protagonist` |
| 2 | **the flaw they must learn to let go of**. "…but he must learn to let go of his fear of human relationships…" | `the flaw they must learn to let go of` |
| 3 | **what they become once the flaw is dropped**. "…so he can become more generous…" | `what they become once the flaw is dropped` |
| 4 | **the wider problem their change helps solve**. "…and find a solution to his and others' unhappiness." | `the wider problem their change helps solve` |

**Examples (varied):** *A Christmas Carol* (above) · *An Inspector Calls* — "A young daughter of a
capitalist family called Sheila has an opportunity to improve the lives of those around her but she
must learn to recognise the injustices that she and her family commit so she can become more selfless
and help find a solution to her society's inequalities."
**Watch out:** criterion 2 must name the **behaviour**, not the wound. "He must learn to let go of his
lonely childhood" is the wound; "he must learn to let go of his fear of human relationships" is the
armour built over it. This is the Part One distinction, arriving where a student can feel it.

---

## §4. WHAT I AM CERTAIN OF VS WHAT I AM EXTRAPOLATING

**Certain — quoted, from books on disk, with locators:**
- Edson's TRAUMA/SHIELD split and his explicit "the past event that caused the emotional wound which
  necessitates use of the SHIELD" (`@278913`, `@235435`).
- Marks' definition of the fatal flaw as an obsolete survival system (`@223454`) and the theme-
  inversion derivation (`@230392`).
- Truby's ghost as "an open wound… the source of the hero's… weakness" (`@485292`) and his
  push-a-strength-until-it-becomes-a-weakness technique (`@63996`).
- McKee's characterization / true character / choice-under-pressure (`@191402`, `@195597`).
- Hauge's identity→essence, as quoted inside Edson (`@423`).
- That "emotional shield" occurs 10× in Edson and 0× outside Edson and Sophicly's own documents.
- That all 42 proposed criteria pass `criteria-lint.js`'s rules, and the current 45 fail 44 checks.

**Extrapolation, flagged as such:**
- The **"sentence the wound taught them"** device (Wound criterion 3). Faithful to Marks and Truby;
  not a phrase either of them uses.
- The **"protected once / costs now" split** (Flaw criteria 2–3). This is my operationalisation of
  Marks' definition, not a formulation she states as a two-part test.
- All **weak→strong example pairs** are written for this document; the strong examples are drawn from
  texts already used across Sophicly's protocols and the technique cards.

**Cannot verify, stated as such:**
- Whether Matt Bird ever uses "emotional shield". His books are not on the drive. I assert only that
  nothing we hold supports the sentence (§1.4).

---

## §5. RECOMMENDED ORDER OF WORK

1. **`Fw` card** `definition` + `concept` (§2.2). One-line edit to `techniques.json`; unblocks
   everything else because the two surfaces then agree.
2. **Delete or re-cite the Matt Bird sentence** in `wml-assessment.js` ~38700 and in
   `Creative Writing Reference Guide.md` (§1.4). Student-facing and currently unsupported.
3. **Rebuild the Flaw ask + criteria** (§2.3, §3.2) — in `wml-assessment.js` *and* its byte-diff twin
   `protocols/shared/creative-writing/_cw-step-3-source.md`, or the seq-port harness fails.
4. **Obstacle → Logline 3 → Goal** (the other three judged worst / failing `COUNT`).
5. **Protagonist · Wound · Inciting Incident · Stakes · Loglines 1–2** — sharpening passes.
6. **Consider `stripMd()` on the bullet inside `criteria-lint.js::definingClause()`** (§3.0), or add
   the asterisk-placement rule as a comment there. As it stands the gate fails good criteria for a
   formatting reason.

**Out of scope but noted:** the six Step-4 spine blocks also fail `criteria-lint`
(`Until`, `Until finally` fail COUNT; three INFO-LOSS). Not part of this brief — flagged so they are
not assumed clean.

---

## Sources — all quotations verified against files on disk

- Eric Edson, *The Story Solution: 23 Actions All Great Heroes Must Take* —
  `Model Answer Resources/Story Solution – 23 Actions All Great Heroes Must Take_nodrm.md`
- Dara Marks, *Inside Story: The Power of the Transformational Arc* —
  `Model Answer Resources/Inside Story – The Power of the Transformational Arc…_nodrm.md`
- John Truby, *The Anatomy of Story: 22 Steps to Becoming a Master Storyteller* —
  `Model Answer Resources/epdf.tips_the-anatomy-of-story-22-steps-to-becoming-a-master.md`
- Robert McKee, *Story: Substance, Structure, Style and the Principles of Screenwriting* —
  `Model Answer Resources/Story_ Substance, Structure, Style… ( PDFDrive.com ).md`
- Michael Hauge, *Writing Screenplays That Sell* — **not on disk**; quoted within Edson `@423`.
- Chris Vogler — **not on disk**; discussed within Craig Batty, *Movies That Move Us*.
- Sophicly internal: `techniques.json` (cards `Fw`, `Gh`, `Hm`) · `PEDAGOGY.md` §19, §20 ·
  `bin/criteria-lint.js` · `bin/cw-keymatch-harness.js` ·
  `protocols/shared/creative-writing/_cw-step-3-source.md` ·
  `Model Answer Resources/Creative Writing Reference Guide.md`
