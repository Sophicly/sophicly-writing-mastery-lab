# Story-element criteria — craft research and proposed rewrite

**Date:** 2026-07-29
**Status:** PROPOSAL for Neil. Nothing here is implemented. No code was changed by this research.
**Scope:** the 7 story blocks of CW Step 3 (Protagonist · Flaw · Wound · Inciting Incident · Goal ·
Obstacle · Stakes) plus the 3 logline formulas, and what the Table of Techniques cards for those
concepts should carry.
**Trigger:** Neil reviewed the Flaw block live and judged its criteria too generic to help a student —
*"I think you need to do some research about how emotional shields actually work."*

**Source of truth read before writing (rule 5c — derive, never invent):**

| What | Where |
|---|---|
| The 7 asks + their `criteria` arrays (what we teach TODAY) | `frontend/wml-assessment.js:18602–18665` (`COMPONENTS`, `FORMULAS`) |
| The 3 logline formulas | `frontend/wml-assessment.js:18646–18664` |
| Technique deep-link map | `frontend/wml-assessment.js:18765–18772` (`TECH`) |
| CW reference guide, Step 3 ("8 Logline Components", "3 Logline Formulas") | `frontend/wml-assessment.js:38622–38659` |
| The protocol that governs the walk | `protocols/shared/creative-writing/CW-STEP-03-logline.md` |
| Self-assessment law | `PEDAGOGY.md` §19 |
| Flaw-before-wound ordering law | `PEDAGOGY.md` §20 |
| Technique card data (299 cards) | `protocols/shared/reference/techniques.json`; shipped copy `sophicly-plugins/sophicly-notes/assets/js/sophicly-techniques.js` |

---

## §0. READ THIS FIRST — the hard constraint on any criteria rewrite

**`PEDAGOGY.md` §19 makes the tick list and the ask text a single unit.** Verbatim:

> **CRITERIA ARE LIFTED, NEVER AUTHORED BESIDE THE ASK.** Each tickable criterion must be a verbatim
> substring of that ask's own "A strong X:" bullets, enforced mechanically
> (`bin/cw-keymatch-harness.js`). A student must never be asked to tick a criterion the teaching did
> not give them.

**Consequence: you cannot fix the criteria without also editing the ask bullets.** Every proposal
below therefore gives BOTH — the reworded ask bullet and the tick-line lifted from it. Any attempt to
sharpen only the `criteria` array will fail the harness, and rightly so.

Two further laws constrain the shape:

- **§20 flaw before wound** — the flaw is OBSERVABLE, the wound is INFERRED. Criteria for the flaw
  must therefore be answerable by *watching* the character; criteria for the wound may require
  reasoning back. The proposals respect this and lean on it harder than the current text does.
- **§4c.9 the help ladder** — criteria are Rung 0. If a student cannot tick a box, the criterion must
  tell them *where to look* without spending a call. Every proposed criterion below carries an
  explicit "if you can't tick it, look here" line for exactly this reason.

---

## §1. THREE DEFECTS FOUND WHILE READING THE EXISTING MATERIAL

These are not criteria problems. They are separate, and two of them are cheap fixes. Reporting them
because they sit directly under Neil's complaint.

### 1.1 The Wound block's technique chip is broken — it opens the Table, not the card

`frontend/wml-assessment.js:18767` maps the wound ask to symbol `'Wu'`:

```js
'cw-step-3-wound':    [{ s: 'Wu', l: 'The Wound & Shield' }],
```

**There is no card with symbol `Wu`.** I checked both data copies (`techniques.json`, 299 cards; the
shipped `sophicly-techniques.js`). The card exists, but its symbol is **`Gh`** — *"The Ghost / Wound"* —
and `"The Wound & Shield"` is only an **alias** in that card's `k` (keyword) array.

The resolver does not search aliases. `sophicly-notes/assets/js/sophicly-techniques.js:2000`:

```js
var _d = D.find(function(x){return x.s===sym;})
      || D.find(function(x){return x.n && x.n.toLowerCase()===String(sym).toLowerCase();});
if(_d) requestAnimationFrame(function(){ openModal(_d); });
else console.warn('[Sophicly] Table deep-link: no technique for "'+sym+'"');
```

Symbol match or exact-name match only. `open('Wu')` matches neither → console warning → the Table
opens on the full grid and the student never reaches the card.

Two things make this worse than a typo:
- The comment immediately above the map (line 18760) asserts *"Symbols verified against
  sophicly-techniques.js data"*. It was not verified for `Wu`.
- It is **Rung 2 of the help ladder on the one block Neil flagged as unhelpful**. The block with the
  weakest criteria also has the broken escape hatch.

**Fix:** `'Wu'` → `'Gh'`. One word. I have not made it — `wml-assessment.js` is being edited
concurrently by the main chat. Worth also adding an alias-aware fallback in the resolver, or a
build-time gate asserting every `TECH` symbol resolves (the pattern already exists in
`sophicly-components/bin/verify-technique-links.js`).

### 1.2 "Matt Bird calls this the 'emotional shield' concept" is very probably a misattribution

The reference guide (`wml-assessment.js:38635`) states this outright to students. I could not
substantiate it.

- "Emotional shielding" as a named craft concept belongs to **Angela Ackerman & Becca Puglisi**
  (*The Emotional Wound Thesaurus*, 2017; *One Stop for Writers*). Their published definition is
  explicit and matches our usage exactly: *"The fatal flaw … manifests as emotional shielding."*
- Matt Bird (*The Secrets of Story*, 2016; *The Secrets of Character*, 2022) works the same territory
  but through different named tools — the hero's "false statement of philosophy", the social /
  personal / spiritual problem set. I found no evidence he coined or uses "emotional shield".

**This matters under rule 5c** because it is a factual claim printed in student-facing material.
Recommend either re-attributing to Ackerman & Puglisi or dropping the attribution and keeping the
concept. I am confident the term is theirs; I am *not* claiming Bird never used the phrase anywhere —
only that nothing supports the sentence as written.

### 1.3 The reference guide and the walk teach different lists

A student on the Flaw ask taps **📖 Guidance** (Rung 2) and lands on a numbered list that does not
match the seven blocks they are walking:

| Reference guide — "The 8 Logline Components" | Step 3 walk — 7 blocks |
|---|---|
| 1 Protagonist | Protagonist |
| 2 Inciting Incident | Flaw |
| 3 Flaw | **Wound** *(absent from the guide's list)* |
| 4 Life-Changing Event *(absent from the walk)* | Inciting Incident |
| 5 Opponent / Antagonist | **Goal** *(absent from the guide's list)* |
| 6 Ally *(absent from the walk)* | Obstacle |
| 7 Battle *(absent from the walk)* | Stakes |
| 8 Stakes | |

Three items in the guide are not in the walk; two items in the walk (Wound, Goal) are not numbered
components in the guide. The guide also splits "Inciting Incident" from "Life-Changing Event", which
the walk merges. Whatever we do to the criteria, the guide should be reconciled to the seven blocks —
otherwise the free help rung actively confuses.

---

## §2. WHAT THE CRAFT LITERATURE ACTUALLY SAYS

Five frameworks bear on these seven blocks. They agree on the spine and **disagree in three places
that matter to us**. Per CLAUDE.md §7 I have kept them separate rather than blending them.

### 2.1 The chain everyone agrees on

Wound (past) → a false belief → fear → a protective behaviour (the flaw) → which the plot attacks
until it breaks.

- **Ackerman & Puglisi** name each link and are the most *mechanical* — the most useful for teenagers.
  Their chain: **wounding event → the lie → fear of recurrence → emotional shielding** (behaviours,
  attitudes, negative traits) → *that shielding IS the fatal flaw*. Their definition of the flaw is
  the sharpest thing I found for our purpose: *"the character's **antiquated and ineffective approach
  to dealing with life** that must be adapted or cast aside."* Their worked example is Marlin in
  *Finding Nemo* — the same example our Flaw ask already uses, which is a good sign our material is
  downstream of them.
  They also peg the lie to one of **five basic human needs** (Maslow): survival · safety · love and
  belonging · esteem · self-actualisation, each with a matching lie (*"I am not worthy of love"*,
  *"I can't do anything right"*).
- **K.M. Weiland** gives the same chain a cleaner vocabulary: the **Ghost** (the formative backstory
  wound) → the **Lie the Character Believes** → the **Thing the Character Wants** (external,
  conscious, *fuelled by the Lie*) vs the **Thing the Character Needs** (the thematic Truth). Her
  glossary states the Ghost *"can be thought of as the root cause of the Lie"* — and credits the term
  Ghost to **John Truby**.
- **John Truby** (*The Anatomy of Story*) supplies the oldest layer and one distinction the others
  drop — see 2.2.

### 2.2 Where they genuinely disagree — decide, don't average

**(a) Is a flaw a shield, or the flip side of a strength?**

This is the live conflict inside Sophicly's own material, and it is the root of Neil's complaint.

- **Ackerman / Bird / Weiland — the shield model.** The flaw is *armour*: a defence built over a
  wound. It is not admirable; it is outdated. Beat it by facing the wound.
- **Truby / Aristotle — the hamartia model.** Truby splits weakness in two: a **psychological
  weakness** (harms only the hero) and a **moral weakness** (makes the hero hurt others). The
  classical reading treats the flaw as inseparable from a virtue — courage curdling into
  recklessness.

**Our two surfaces currently teach one each.** The Step 3 ask teaches the shield model. The
Table of Techniques card `Fw` ("The Flaw") teaches the hamartia model verbatim:

> *"Its richest form is the flip-side of a genuine strength: courage shading into recklessness,
> loyalty into blindness."*

A student tapping the 🗂 chip from the Flaw ask therefore reads a definition that contradicts the
one they were just given. **This needs a ruling from Neil, not a blend.** My recommendation: keep the
**shield model** as the operative teaching for CW Step 3 (it is procedural — a 14-year-old can build
from it), and reframe the hamartia point on the card as *why the shield is hard to drop* rather than
as a rival definition. That reconciles them without averaging: the shield often *is* a real strength
overused, which is exactly why giving it up feels like a loss.

**(b) Must the inciting incident be caused by the protagonist?**

- **Story Grid (Shawn Coyne)** insists on a binary the others don't: every inciting incident is
  either **causal** (an active choice by a character) or **coincidental** (random/accidental). Not a
  third option. It is *"a ball of chaos that spins into the story and knocks the protagonist's life
  out of balance"* — the first of the Five Commandments of Storytelling.
- **Robert McKee** (*Story*) requires only that it *"radically upsets the balance of forces in the
  protagonist's life"* — indifferent to cause.
- **Blake Snyder** (*Save the Cat!*) locates it as the Catalyst at ~12% and cares about placement,
  not causation.

Story Grid's binary is the more *teachable* of the two, and it is a free tick a student can actually
perform. I propose we adopt it — flagged below as an addition to what we currently teach.

**(c) Does the opponent have to want the same thing?**

- **Truby is emphatic and alone on this**: hero and opponent must be in direct conflict **over the
  same goal**. If they want different things they can simply walk away from each other and there is
  no story. This is the single most testable obstacle criterion in the whole literature and we do not
  currently teach it.
- **Snyder / Story Grid** treat the antagonist more loosely as escalating opposition.
- Our existing "dark mirror" idea is closest to Truby's *"the opponent attacks the hero's greatest
  weakness"* — which we already teach well.

---

## §3. PER-BLOCK: VERDICT, PROPOSED CRITERIA, EXAMPLES, WATCH-OUT

Format per block:
**CURRENT** (verbatim from the code) → **VERDICT** → **PROPOSED** ask bullets + the tick lines lifted
from them → **examples per criterion** → **watch out**.

Test applied to every criterion, from the brief:
1. does it stand alone out of context? 2. can a 14–16-year-old honestly tick or not tick it against
their own answer? 3. if they can't tick it, does it tell them where to look?

---

### BLOCK 1 — PROTAGONIST

**CURRENT criteria:** `changes more than anyone else` · `has courage` · `makes us care fast`

**VERDICT: ADEQUATE — sharpen the third, don't replace the block.** The first two are genuinely
strong: standalone, tickable, and they point somewhere. `makes us care fast` is the weak one — it is
a *reader outcome*, not something a student can check in their own sentence. The ask already glosses
it ("good at something, kind to someone, or treated unfairly") and the fix is to lift the gloss into
the tick line rather than the vague headline.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line (verbatim substring) | If you can't tick it |
|---|---|---|---|
| 1 | **changes more than anyone else** — the distance they travel is the story's meaning | `changes more than anyone else` | Write the first line and the last line of their story. If those two lines could be the same person, you have the wrong protagonist. |
| 2 | **has courage** — flawed, frightened and failing is fine; too passive to act is not | `has courage` | Find the moment they *choose* to do something difficult. If they only ever react, they are a passenger. |
| 3 | **is good at something, kind to someone, or treated unfairly** — one of the three, in the first page | `is good at something, kind to someone, or treated unfairly` | Point at the actual line where the reader is given a reason to like them. If you can't point at one, add one. |
| 4 | **has something they will not do** — a line they won't cross tells us who they are before the plot does | `has something they will not do` | Ask what they'd refuse even if it cost them the goal. |

Criterion 3 replaces the untickable `makes us care fast`. It is Sophicly's own existing gloss, promoted;
it maps to the three levers already on the `Ey` (Empathy) card. Criterion 4 is an addition —
see the confidence ledger at §5.

**Worked examples**

*Criterion 1 — changes more than anyone else*
- **Sheila Birling** (*An Inspector Calls*) — starts pleased with a ring, ends the only Birling who
  has understood the Inspector. Her father is louder; she travels furthest, so the play is hers.
- **Scrooge** (*A Christmas Carol*) — cruel to generous; the whole novella is the distance.
- *Weak vs strong:* "My protagonist is a detective who solves the case" — the case changes, the
  detective doesn't. Strong: "a detective who starts certain everyone lies, and ends able to believe
  one person."

*Criterion 2 — has courage*
- **Mickey** (*Blood Brothers*) is frightened, depressed and failing by Act 2 — and still acts. Courage
  is not fearlessness.
- **Marlin** (*Finding Nemo*) is the most anxious character in his own film and crosses an ocean anyway.
- *Weak:* a narrator who watches the entire story happen to other people.

*Criterion 3 — good at something / kind to someone / treated unfairly*
- **Katniss** volunteers for Prim — kind to someone, in the first ten minutes.
- **Pip** (*Great Expectations*) is a child bullied by his sister and terrified in a graveyard —
  treated unfairly, through no fault of his own.
- **Curley's wife** (*Of Mice and Men*) is only ever "treated unfairly" and never given the other
  two levers — which is exactly why readers argue about whether to sympathise with her.

*Criterion 4 — has something they will not do*
- **Macduff** will not bend the knee, and it costs him his family.
- **Eva Smith** refuses to accept the stolen money — a refusal, not an action, and it defines her.

> **WATCH OUT:** the commonest misfire is picking the **most powerful** character rather than the one
> who changes most. If your protagonist is already the strongest, cleverest or most certain person in
> your story, ask who has the furthest to travel — that is usually your real protagonist.

---

### BLOCK 2 — FLAW ⚠ WORST OF THE TEN

**CURRENT criteria:** `is an emotional shield` · `actually works` ·
`is something the protagonist doesn't yet understand about themselves`

**VERDICT: REPLACE.** Neil is right, and the reason is diagnosable:

- **`actually works`** — read out of context on a tick list, this parses as *"is it a good flaw?"*
  There is nothing a student can check. It is the exact defect class the brief names.
- **`is an emotional shield`** — a *label*, not a test. Ticking it only proves the student can repeat
  the phrase. There is no procedure attached.
- **`is something the protagonist doesn't yet understand about themselves`** — this one is fine and
  should survive.

**What the literature gives us that we are not yet using.** Ackerman & Puglisi's definition of the
fatal flaw is *"an **antiquated and ineffective** approach to dealing with life."* Two words, two
distinct properties — and our single bullet `actually works` collapses them into one and loses both:

- **antiquated** — it *did* work, once, at the time of the wound. That is why it is still there.
- **ineffective** — it does not work *now*, and it is costing them something they want.

**A shield is only a flaw because of the gap between those two.** Splitting them is the single
biggest improvement available in this document, and it directly answers Neil's *"how emotional
shields actually work."*

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | **is a behaviour someone could film** — not a feeling, but something they repeatedly DO | `is a behaviour someone could film` | You have named a mood. Ask what they do *when* they feel it. §20: observable first. |
| 2 | **protected them once** — back when the hurt happened, this behaviour genuinely kept them safe | `protected them once` | You may have a bad habit rather than a shield. Ask what it was defending. |
| 3 | **costs them something they now want** — the same armour that saved them is now in the way | `costs them something they now want` | Then it isn't a flaw yet — it's just a trait. Name the thing it is blocking. |
| 4 | **they would defend it if challenged** — they see it as sensible, not as a problem | `they would defend it if challenged` | If they already know it's wrong, there's no arc left to write. |
| 5 | **is something the protagonist doesn't yet understand about themselves** *(kept)* | `is something the protagonist doesn't yet understand about themselves` | Ask who in the story can see it that they can't. |

Criteria 2 + 3 together are the "emotional shield" mechanism made tickable. A student who can tick
both has understood the concept without ever needing the label; one who can tick 2 but not 3 has a
backstory, not a flaw; one who can tick 3 but not 2 has a bad habit, not a shield.

**Worked examples**

*Criterion 1 — a behaviour someone could film*
- **Strong:** Scrooge *"a squeezing, wrenching, grasping, scraping, clutching, covetous old sinner"* —
  every word is a filmable action. **Weak:** "Scrooge is unhappy."
- **Marlin** doesn't "feel anxious"; he counts, checks, forbids, and follows Nemo to school.
- **Weak vs strong pair:** "She has trust issues" *(unfilmable)* → "She reads every message twice
  before sending it, and deletes half of them" *(filmable)*.

*Criterion 2 — protected them once*
- **Katniss's detachment** was correct policy in District 12 after her father died: caring got you
  hurt, and she had a family to feed. It worked.
- **Miss Havisham's stopped clocks** (*Great Expectations*) froze time at the moment of the wound so
  she never had to live past it. Grotesque — and effective, on its own terms.
- **Jekyll's respectability** genuinely bought him standing in Victorian London before it split him.

*Criterion 3 — costs them something they now want*
- **Marlin** wants his son close; the overprotection is precisely what drives Nemo over the reef.
  The shield causes the disaster it was built to prevent — this is the pattern to teach.
- **Scrooge** wants to be left alone and gets it: an unmourned death. He is granted exactly what his
  shield asked for.
- **Eddie/Mrs Lyons** (*Blood Brothers*) — the secrecy that protects her position destroys the family
  it was meant to preserve.

*Criterion 4 — they would defend it if challenged*
- Scrooge argues for the workhouses. He is not embarrassed; he thinks he is the reasonable one.
- **Mr Birling** delivers an entire speech justifying sacking Eva — *"if you don't come down sharply
  on some of these people…"* He defends the flaw in dialogue, on stage.
- *Counter-example that fails the tick:* a character who says "I know I push people away" on page one
  has no arc left — they've done the self-revelation before the story started.

> **WATCH OUT:** *(keep the existing line, it is good)* "clumsy" or "shy" on its own is a quirk, not
> a flaw. New second half: **if you cannot say what the behaviour once protected them from, you have
> a habit, not a shield.** A habit is something they do; a shield is something they do *instead of
> feeling something*.

---

### BLOCK 3 — WOUND

**CURRENT criteria:** `is one specific past hurt` · `fits the flaw exactly` · `stays hidden at first`

**VERDICT: NEEDS WORK — one strong, one untestable, one untickable.**

- `is one specific past hurt` — excellent, keep verbatim.
- `fits the flaw exactly` — the right idea with no test attached. "Exactly" is undefined, so the
  student ticks it on vibes. **The literature supplies the missing middle term:** the wound and the
  flaw are connected by **the lie** (Ackerman) / **the Lie the Character Believes** (Weiland). Once
  you can say the sentence the wound taught them, "fits the flaw" becomes checkable in one move.
- `stays hidden at first` — this is a property of a **story the student has not written yet**. At
  Step 3 there is nothing to check it against. It belongs in Step 4+ as a craft note, not here as a
  tick.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | **is one specific past hurt** — a moment, not a general sadness *(kept)* | `is one specific past hurt` | If you wrote "a difficult childhood", find the one afternoon that stands for it. |
| 2 | **happened before your story starts** — it is the reason they are like this on page one | `happened before your story starts` | If it happens *during* the story, that's your inciting incident, not the wound. |
| 3 | **taught them one sentence about themselves or the world** — write that sentence down | `taught them one sentence about themselves or the world` | Finish this: *"After that, I decided that…"* That is the sentence. |
| 4 | **makes the flaw the obvious defence** — given that sentence, the flaw is the sensible response | `makes the flaw the obvious defence` | If the armour doesn't match the injury, one of the two is wrong. Change whichever you're less attached to. |

Criterion 3 is the important addition: it turns the vague `fits the flaw exactly` into a two-step
check a student can actually perform. Note it introduces **no new jargon** — the student writes a
sentence; they never have to learn the word "Lie". Criterion 4 is then genuinely testable because
criterion 3 produced the thing to test against.

**Worked examples**

*Criterion 1 — one specific past hurt*
- **Strong:** "The barracuda attack that killed Coral and every egg but one." **Weak:** "Marlin had a
  hard time in the past."
- **Strong:** "Jilted at the altar at twenty to nine." *(Miss Havisham — the wound is so specific it
  has a **time**.)*
- **Strong:** "His father was killed at the Somme and the telegram came on his birthday."

*Criterion 3 — the sentence it taught them*
- **Marlin:** *"The ocean will take everything I love if I look away."* → hence: never look away.
- **Katniss:** *"Loving someone is how you lose them."* → hence: love no one.
- **Scrooge:** *"People leave; money doesn't."* → hence: choose money.
- **Heathcliff:** *"I will always be the one they throw out."* → hence: own everything, forgive nothing.
- **Weak vs strong pair:** "She was sad when her mum left" *(an event with no lesson)* →
  "When her mum left she decided she must be easy to leave" *(a sentence that predicts behaviour)*.

*Criterion 4 — makes the flaw the obvious defence*
- **Fits:** wound = "my family was taken while I wasn't looking" → sentence = "looking away is fatal"
  → flaw = never letting Nemo out of sight. Armour matches injury.
- **Doesn't fit:** wound = "his brother drowned" → flaw = "he's arrogant". Nothing connects them.
  Either the wound becomes "he was praised for surviving when his brother didn't" (→ arrogance as
  survivor's armour), or the flaw becomes fear of water. Fixing the mismatch is the exercise.

> **WATCH OUT:** the commonest misfire is **an event with no lesson attached** — "her dad left" is a
> fact, not a wound. It becomes a wound only when you can say what it taught her. The second
> commonest is going too big: a wound does not have to be a death. Being humiliated once, in front of
> people who mattered, is enough to build a lifetime of armour.

---

### BLOCK 4 — INCITING INCIDENT

**CURRENT criteria:** `is a single event, not a situation` · `breaks the routine` ·
`feels like escaping the frying pan`

**VERDICT: MOSTLY GOOD — replace the third.**

- `is a single event, not a situation` — the best criterion in the entire current set. Standalone,
  binary, and the ask's watch-out ("life is hard at school" vs "the new head confiscates every phone")
  is a model of how to teach one. Keep verbatim.
- `breaks the routine` — fine, keep.
- `feels like escaping the frying pan` — a truncated idiom. Out of context on a tick list it is
  meaningless, and it is not something a student can verify. Replace.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | is a **single event, not a situation** — something that happens on a particular day *(kept)* | `is a single event, not a situation` | If you can't put a date on it, it's a situation. Find the day it tipped. |
| 2 | **breaks the routine** the protagonist was comfortably hiding inside *(kept)* | `breaks the routine` | Describe their ordinary Tuesday first. The incident is what makes that Tuesday impossible. |
| 3 | **is either something they chose or something that happened to them** — you should be able to say which | `is either something they chose or something that happened to them` | If you can't say which, the event isn't concrete enough yet. |
| 4 | **leaves no way back** — the old life is not available any more, even if they want it | `leaves no way back` | If they could shrug and go home, it isn't inciting. Raise it until they can't. |
| 5 | **makes the shield stop working** — the flaw that used to cope no longer copes *(kept from the ask's own framing)* | `makes the shield stop working` | Check it against your Flaw answer. If the event doesn't press on the flaw, it's the wrong event. |

Criterion 3 is Story Grid's causal/coincidental binary, made student-facing. Criterion 4 is McKee's
"radically upsets the balance" reduced to something tickable — and it replaces the frying-pan idiom
with the thing the idiom was gesturing at.

**Worked examples**

*Criterion 1 — single event, not a situation*
- *(keep the existing pair — it works)* Weak: "life is hard at school." Strong: "On the first morning
  of term, the new head teacher confiscates every phone in the school."
- **Strong:** "The Inspector rings the doorbell during the engagement dinner."

*Criterion 3 — chosen, or happened to them*
- **Happened to them (coincidental):** Marley's ghost arrives; Will Byers vanishes; the letter comes
  for Harry.
- **Chosen (causal):** Macbeth chooses to write to his wife rather than dismiss the witches;
  Sheila chooses to complain about a shop girl. **Both plays turn on a decision, and that is why
  guilt is available to them as themes** — a useful thing for students to notice.
- Teaching point: coincidental incidents are easier to write; causal ones make the protagonist
  responsible, which usually makes the story better.

*Criterion 4 — leaves no way back*
- **Strong:** Marley's chains — Scrooge cannot un-see them; the spirits are already booked.
- **Strong:** the Inspector has a photograph and a name, and the Birlings cannot un-hear them.
- **Weak:** "He gets an unsettling text message." He can delete it. Nothing is forced.
- **Weak vs strong pair:** "She hears a rumour about her dad" *(deletable)* → "She finds the second
  phone in his coat, and he sees her holding it" *(no way back — he knows she knows)*.

> **WATCH OUT:** *(keep)* "life is hard at school" is a situation; an event happens on a day.
> New second half: **an incident the protagonist could ignore is not an inciting incident.** If they
> could go to bed and carry on as normal, push it further.

---

### BLOCK 5 — GOAL

**CURRENT criteria:** `is one physical, picturable finish line` · `stands for a deeper need`

**VERDICT: ADEQUATE BUT THIN — two criteria where the brief asks for 3–5.** Both existing ones are
good and should be kept verbatim. `is one physical, picturable finish line` is, with the inciting
incident's, among the best-written criteria we have. The block needs one or two more, not a rewrite.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | is **one physical, picturable finish line** — we could photograph the moment they achieve it *(kept)* | `is one physical, picturable finish line` | "Be happy" can't be photographed; "win the county final" can. |
| 2 | **stands for a deeper need** the protagonist doesn't fully understand yet *(kept)* | `stands for a deeper need` | Ask what they think getting it will *prove*. That's the need. |
| 3 | **can fail** — there is a version of the story where they don't get it | `can fail` | If success is guaranteed, there's no story. Give the obstacle real teeth. |
| 4 | **the need is roughly the opposite of what the shield gives them** — the goal chases comfort; the need asks them to drop the armour | `the need is roughly the opposite of what the shield gives them` | Look at your Flaw answer. If the need and the shield want the same thing, one of them is wrong. |

Criterion 4 is Weiland's Want-vs-Need and Truby's desire-vs-need made checkable against the student's
own earlier answer — the same cross-block test the protocol's batched review already performs
(`CW-STEP-03-logline.md`: *"the flaw must be an emotional shield over the wound"*). It gives the
student the check for free, at Rung 0, instead of spending a call on it.

**Worked examples**

*Criterion 1 — picturable finish line*
- *(keep)* Weak: "be happy", "get rich". Strong: "win the county final".
- **Strong:** "get Nemo out of that tank and home." **Strong:** "rescue Princess Leia."
- **Weak vs strong:** "She wants to be respected" → "She wants her name read out at the awards
  evening, with her mother in the room."

*Criterion 3 — can fail*
- **Of Mice and Men** — the farm is picturable *and* it is lost. The novella works because the goal
  was genuinely losable.
- **Macbeth** gets the crown by Act 3 — which is why the goal has to change; a goal achieved at the
  midpoint isn't the story's goal.

*Criterion 4 — need opposes the shield*
- **Marlin:** shield = control; need = to let go. Exact opposites, which is why the film ends with
  him letting Nemo swim to the boat.
- **Scrooge:** shield = money as a substitute for people; need = people. Exact opposites.
- **Sheila:** shield = comfortable blindness; need = to see clearly and take responsibility.
- **Failing example:** shield = "he pushes people away"; need = "to be left alone." Those agree, so
  there is no arc — the story would be over on page one.

> **WATCH OUT:** the commonest misfire is a goal that is really a **mood** — "be happy", "feel
> confident", "get her life together". If a camera couldn't record the moment it happens, it is a
> need, not a goal, and you still need to find the physical thing that stands for it.

---

### BLOCK 6 — OBSTACLE ⚠ THIRD-WORST

**CURRENT criteria:** `attacks the flaw specifically` · `is often a dark mirror` · `is specific`

**VERDICT: NEEDS WORK.**

- `attacks the flaw specifically` — strong, keep verbatim. This is Truby's central point and we teach
  it well.
- `is often a dark mirror` — **"often" makes it untickable.** A criterion with a hedge in it cannot be
  honestly ticked or not ticked; the student cannot tell whether they are failing or whether this
  one simply doesn't apply. Either it is required, or it is a teaching note and does not belong on a
  tick list. Recommend: demote to a teaching note in the ask body, keep it out of the tick list.
- `is specific` — two words. It is *true* but it carries no procedure, and out of context it is
  indistinguishable from every other "be specific" instruction a student has ever been given. The ask
  body has the real content ("a person, a group, a force we can point at; never 'society' in the
  abstract") — promote that.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | **attacks the flaw specifically** — it forces the protagonist to face the thing they've been hiding behind *(kept)* | `attacks the flaw specifically` | Reread your Flaw answer. If the obstacle would trouble anyone equally, it isn't aimed at *this* character. |
| 2 | **is a person, a group, or a force I can point at** — never "society" in the abstract | `is a person, a group, or a force I can point at` | Name it. If your answer is a concept, find the character who carries it. |
| 3 | **wants something that rules out what my protagonist wants** — they cannot both win | `wants something that rules out what my protagonist wants` | If they could each get their way and walk off, there is no conflict. Put them on the same prize. |
| 4 | **gets stronger when the protagonist uses their flaw** — the armour makes things worse, not better | `gets stronger when the protagonist uses their flaw` | This is what turns opposition into a trap. If the flaw helps them win, the story has no pressure. |
| 5 | **is strong enough that losing is believable** | `is strong enough that losing is believable` | If we never doubt the outcome, raise the opposition. |

Criterion 3 is Truby's same-goal rule — the strongest addition available for this block, and it is
absent from our material. Criterion 4 is the mechanism that makes "attacks the flaw" *do something*
across a plot rather than just be true once.

**Worked examples**

*Criterion 1 — attacks the flaw specifically*
- *(keep the existing three, they are good)* Inspector Goole → Sheila's comfortable blindness.
  President Snow → Katniss through the people she loves. Lady Macbeth → Macbeth's hesitation.
- Add: **the tank and the dentist's office** in *Finding Nemo* attack Marlin's control by putting his
  son somewhere he physically cannot supervise.

*Criterion 2 — a person, a group, or a force I can point at*
- **Weak:** "society's expectations." **Strong:** "Mr Birling, who will sack a girl for asking for a
  raise" — the same idea, carried by someone who can be in a room.
- **Strong, non-person:** *"the merciless iced east winds that knive us"* (*Exposure*) — nature as a
  pointable force. Non-human is fine; abstract is not.
- **Strong, group:** the boys' chant in *Lord of the Flies* — "Kill the beast!" — savagery given a
  body and a voice.

*Criterion 3 — wants something that rules out what my protagonist wants*
- **Macbeth vs Macduff** — both want the throne settled, incompatibly. Direct.
- **Sheila vs her parents** — she wants the family to accept responsibility; they want the evening to
  return to normal. Only one of those can happen.
- **Fails the tick:** "the antagonist is a bully who's just mean to her." He isn't after anything she
  wants; he's weather, not an opponent. Fix: give him a reason to need her to fail.

*Criterion 4 — gets stronger when the protagonist uses their flaw*
- **Marlin:** every time he tightens control, he loses more ground — the flaw feeds the obstacle.
- **Macbeth:** each murder committed to feel secure creates the next threat. The shield manufactures
  the enemy.
- **Jekyll:** every dose taken to protect respectability strengthens Hyde.

> **WATCH OUT:** the commonest misfire is an obstacle that is **merely difficult** — bad weather, a
> long journey, an exam. Difficulty is not opposition. Ask what it *wants*, and whether the
> protagonist's flaw makes it worse. If your obstacle would be equally hard for any character in the
> world, it is not opposing *yours*.

---

### BLOCK 7 — STAKES

**CURRENT criteria:** `personal and specific` · `as heavy as survival` · `devastating for THIS protagonist`

**VERDICT: ADEQUATE — sharpen one.** The block is in decent shape and the ask's weak/strong pair
("the world ends" vs "her little sister goes into the arena alone") is the best teaching example in
the whole set.

- `personal and specific` — good, keep.
- `as heavy as survival` — ambiguous. A student writing a comedy reads this and thinks their stakes
  are wrong. The ask body already handles it ("even in a comedy, failing must cost something
  enormous") but the tick line loses that. Reword.
- `devastating for THIS protagonist` — good, keep verbatim; it is the one that does the work.

**PROPOSED ask bullets → tick lines:**

| # | Ask bullet (reworded) | Tick line | If you can't tick it |
|---|---|---|---|
| 1 | **personal and specific** — we can picture exactly what would be lost, and who loses it *(kept)* | `personal and specific` | Name the person who suffers. "The town" is not a person. |
| 2 | **I can name who else gets hurt** — a loss that lands on someone the protagonist loves is heavier than one that lands only on them | `I can name who else gets hurt` | If only the protagonist suffers, add someone they'd protect. |
| 3 | **costs them something they cannot get back** — even in a comedy, failure must be permanent in some way | `costs them something they cannot get back` | If they could try again next week, the stakes are low. Make one door shut. |
| 4 | **devastating for THIS protagonist** — the loss lands exactly on their wound *(kept)* | `devastating for THIS protagonist` | Reread your Wound answer. The best stakes threaten the exact thing that already hurt them once. |

Criterion 3 replaces `as heavy as survival` with the property that bullet was reaching for
(irreversibility) without the genre problem. Criterion 2 is Snyder's "primal stakes" point in
teenage-usable form.

**Worked examples**

*Criterion 1 — personal and specific*
- *(keep)* Weak: "If she fails, the world ends." Strong: "If she fails, her little sister goes into
  the arena alone."
- **Strong:** "If Scrooge doesn't change, he dies alone and unmourned" — the ghost shows him the
  exact image.

*Criterion 2 — who else gets hurt*
- **Of Mice and Men:** Lennie's fate is the stake, and George is the one who pays for it. Two people
  lose, differently — which is why the ending lands.
- **A Christmas Carol:** Tiny Tim's empty stool sits beside Scrooge's own grave. Dickens gives us
  both, and the child's chair is the one that hurts.
- **Weak vs strong:** "If he fails he won't get into university" *(only him)* → "If he fails, his mum
  gave up her second job for nothing" *(someone else pays)*.

*Criterion 3 — cannot get back*
- **Blood Brothers:** the whole play runs on a decision that cannot be undone, and the audience is
  told the ending in the opening minutes.
- **Macbeth:** *"what's done cannot be undone."*
- **Fails the tick:** "if she doesn't win the competition she'll be disappointed." There's another
  competition next year.

*Criterion 4 — lands on the wound*
- **Katniss's wound** is losing family; **her stake** is Prim. Same target. That is not a coincidence
  — it is the design.
- **Marlin's wound** is losing a child to the open sea; **his stake** is losing a child to the open
  sea. The story threatens him with the identical injury.

> **WATCH OUT:** the commonest misfire is **scaling up instead of in** — students reach for the world
> ending because it sounds bigger. Bigger is not heavier. One named person the protagonist loves
> beats a city every time.

---

### LOGLINE 1 — ACTION-ORIENTED

> **INCITING INCIDENT + PROTAGONIST + ACTION + ANTAGONIST**

**CURRENT criteria:** `a single clear event kicking things off` · `a concrete action` ·
`a specific antagonist`

**VERDICT: ADEQUATE.** These are the best of the three formula sets. They are noun phrases rather than
statements, which is a mild version of the Logline 3 problem, but each one names something the
student can look for in their own sentence, so the tick is performable. Recommend light rewording to
full statements for consistency, not replacement.

**PROPOSED tick lines:** `my sentence names the event that starts it` ·
`my sentence names what the protagonist DOES` · `my sentence names who or what opposes them` ·
`someone could tell my story apart from any other from this sentence alone`

The fourth is the addition — it is the only test that catches a logline which contains all three
required parts and is still generic.

**Worked examples**
- *(keep the two published ones — Django Unchained, Stranger Things)*
- **Passes 1–3, fails 4:** "When something terrible happens, a teenage girl must fight a powerful
  enemy to save her family." Every slot is filled; nothing is specific. This is the single commonest
  student logline and the fourth criterion is what catches it.
- **Fixed:** "When her brother is arrested for a crime she committed, a sixteen-year-old shoplifter
  has to confess to the police officer who has been protecting her."

> **WATCH OUT:** filling every slot is not the same as writing a logline. If you could swap in a
> different story and the sentence would still work, it isn't yours yet.

---

### LOGLINE 2 — GOAL-ORIENTED

> **PROTAGONIST + ACTION + ANTAGONIST + GOAL + STAKE**

**CURRENT criteria:** `a protagonist we glimpse in a phrase` · `a picturable goal` ·
`a stake that would genuinely hurt`

**VERDICT: ADEQUATE — the strongest current set of the ten.** All three stand alone, all three are
checkable against the student's own sentence, and `a protagonist we glimpse in a phrase` is
particularly good because the ask anchors it to a concrete model ("a spirited farm boy"). Keep.

**Optional addition:** `the stake is in the same sentence as the goal` — students routinely write the
goal and forget the stake, and this makes that omission visible without a call.

**Worked examples**
- *(keep the published Star Wars example)*
- *a protagonist we glimpse in a phrase:* "a spirited farm boy" · "a freed slave" · "a retired
  getaway driver with a bad hip". Two or three words that carry a whole person.
- **Weak vs strong:** "A girl called Amy" *(a name is not a glimpse)* → "Amy, the only one of her
  friends who never learned to swim."

> **WATCH OUT:** the commonest misfire is writing the goal and stopping. If your sentence ends at what
> they want, add what it costs them to fail.

---

### LOGLINE 3 — CHARACTER-ARC ORIENTED ⚠ SECOND-WORST

> **PROTAGONIST has an opportunity to DO SOMETHING LIFE-CHANGING but must learn to CHANGE THEIR FLAW
> so they can find a solution TO THE PROBLEM**

**CURRENT criteria:** `the opportunity` · `the flaw they must change` ·
`the solution changing it unlocks`

**VERDICT: REPLACE — objectively the worst-formed criteria in the walk.** All three are **bare noun
phrases lifted straight out of the formula template**. On a tick list, "the opportunity" is not a
statement a student can agree or disagree with; there is no verb and nothing asserted. A student
reading `the opportunity` and being asked *"does your answer do this?"* has been asked nothing at all.

This is the same defect as the Flaw block's `actually works`, in a more advanced form: the Flaw
criteria at least contained verbs.

It also matters more than it looks, because Logline 3 is the one that carries the **character arc** —
the thing Sophicly's whole method treats as where the meaning lives. It has the weakest tick list of
the ten.

**PROPOSED tick lines (full statements, lifted from reworded ask bullets):**

| # | Tick line | If you can't tick it |
|---|---|---|
| 1 | `my sentence says what chance they are given` | The opportunity is the door the inciting incident opens. Name it. |
| 2 | `my sentence names the flaw by what they DO, not by a label` | "Must overcome his flaws" names nothing. Say the behaviour. |
| 3 | `my sentence says what they must learn instead` | This is the need from block 5. It should be roughly the opposite of the flaw. |
| 4 | `the change, not the plot, is the main clause of my sentence` | If the sentence is mostly events, you have written Logline 1 again. |
| 5 | `someone who has not read my story could say what it is about` | Read it to a friend. If they ask "so what happens?", the arc isn't visible yet. |

Criterion 4 is the one that distinguishes this formula from the other two, and it is exactly what the
current tick list fails to test.

**Worked examples**

*Criterion 2 — names the flaw by what they DO*
- *(keep the published pair)* Scrooge: *"must learn to let go of his fear of human relationships"*;
  Sheila: *"must learn to recognise the injustices that she and her family commit."*
- **Weak:** "must overcome his personal flaws." **Strong:** "must stop answering every question with
  a joke."
- **Weak:** "must learn to be a better person." **Strong:** "must stop checking her brother's phone."

*Criterion 4 — the change is the main clause*
- **Passes:** "An old, greedy capitalist called Scrooge has an opportunity to improve the lives of
  those around him **but he must learn to let go of his fear of human relationships**…" — the
  learning is the spine; the ghosts aren't even mentioned.
- **Fails:** "Scrooge is visited by three ghosts who show him his past, present and future, and he
  changes." Plot in the main clause, change tacked on. This is Logline 1 wearing Logline 3's clothes.

*Criterion 5 — a stranger could say what it's about*
- Read the Sheila example to someone who has never seen *An Inspector Calls*: they can tell you it is
  about a privileged girl learning to see the harm her family does. That is the test passing.

> **WATCH OUT:** the commonest misfire is **naming a flaw as a label instead of a behaviour** —
> "must overcome his pride" tells us nothing we could film. The second is writing the plot again:
> if your third logline sounds like your first, the change has gone missing.

---

## §4. TABLE OF TECHNIQUES — what the cards should carry

Neil's second ask: the cards for these concepts should carry **criteria plus more examples**, not
just a definition and three examples.

**Current card shape** (`techniques.json`): `s` (symbol) · `n` (name) · `family` · `definition` ·
`concept` · `examples` (3) · `effect` (focus/feel/think/act) · `related` · `tags` ·
`hasCollection`.

**Recommended addition: a `criteria` array on the eight story-element cards**, holding the SAME tick
lines proposed above.

Why the same strings rather than card-specific ones:
- It closes the help ladder honestly. A student who can't tick a box taps 🗂 and finds *that exact
  box* explained with more examples — Rung 2 answering Rung 0's question, which is the design intent
  of §4c.9.
- It avoids the drift class. Two independently authored criteria sets for one concept is exactly the
  "depth lives in the Table, not duplicated" problem CLAUDE.md §4c.9 already warns about.
- `bin/cw-keymatch-harness.js` could be extended to assert card `criteria` ⊇ ask `criteria`, making
  the link mechanical rather than remembered.

**Cards affected, and what each needs:**

| Symbol | Card | Action |
|---|---|---|
| `Pr` | Protagonist | Add 4 criteria. Examples are strong already (Pip, Victor, Porphyria's Lover). |
| `Fw` | The Flaw | **Add 5 criteria AND resolve the definition conflict (§2.2a).** Currently teaches hamartia; the ask teaches the shield. Needs Neil's ruling. |
| `Gh` | The Ghost / Wound | Add 4 criteria. Add the "sentence it taught them" mechanism — the card describes the wound well but doesn't give the procedure. |
| `Ii` | Inciting Incident | Add 5 criteria, including the causal/coincidental split, which the card doesn't currently mention. |
| `Wa` | Want (Goal) vs Need | Add 4 criteria. This is the best-written card of the eight; it needs criteria only. |
| `Ax` | Antagonist | Add 5 criteria. **Add Truby's same-goal rule** — the card covers "dark mirror" and "attacks their weakest point" but not the competing-goal requirement. |
| `Sk` | Stakes | Add 4 criteria. Examples strong (Lennie, Scrooge, Porphyria). |
| `Ey` | Empathy | Add the three empathy levers as criteria — the card already names them in prose. |

**Also fix:** the `TECH` map's `'Wu'` → `'Gh'` (§1.1), or the wound card is unreachable from the chat
regardless of what we put on it.

**On "more examples":** every card above already carries exactly three, all from GCSE set texts. For
CW the useful addition is a **second tier of examples from film/TV** — students building their own
stories reason better from *Finding Nemo* and *Stranger Things* than from *Porphyria's Lover*, and
the walk's asks already use them. Suggest an optional `examplesCW` array so the literature examples
stay canonical for the analysis courses while CW gets its own set. **This is a proposal, not a
derivation — Neil should decide whether CW-specific examples belong on shared cards at all.**

---

## §5. CONFIDENCE LEDGER — what is derived vs what I am extrapolating

Per the brief: stating clearly where I am on solid ground and where I am going beyond what Sophicly
currently teaches.

**HIGH CONFIDENCE — derived from our own material or directly sourced:**
- Every "CURRENT" quotation, every file:line, the §19/§20 constraints. Read from source.
- The `Wu` defect (§1.1). Verified against both data copies and the resolver code.
- The `Fw` card vs Flaw ask conflict (§2.2a). Both texts read verbatim; the contradiction is plain.
- The guide-vs-walk list mismatch (§1.3). Both lists read verbatim.
- Ackerman & Puglisi's wound→lie→fear→shielding chain and the "antiquated and ineffective" definition.
  Directly sourced.
- Weiland's Ghost / Lie / Want / Need, and her crediting "Ghost" to Truby. Directly sourced from her
  glossary.
- Story Grid's causal/coincidental binary. Directly sourced.
- Which criteria fail the standalone test. This is assessable from the strings themselves.

**MEDIUM CONFIDENCE — sound craft, but an ADDITION to what Sophicly teaches today:**
- **The "sentence it taught them" step** in the Wound block. This is Weiland's Lie / Ackerman's lie,
  introduced without jargon. It is the strongest single improvement here, and it adds a step to the
  ask. Neil should approve the extra load before it ships.
- **Truby's same-goal rule** for the Obstacle. Well-attested and highly teachable; genuinely new to
  our material.
- **Story Grid's causal/coincidental tick** for the Inciting Incident. New to our material.
- **Splitting `actually works` into "protected them once" + "costs them something they now want".**
  This is my reading of Ackerman's definition, not a quotation of it. I think it is right and it is
  the direct answer to Neil's question — but it is an interpretation.

**LOWER CONFIDENCE — my own proposals, flagged as such:**
- Protagonist criterion 4 ("has something they will not do"). Defensible craft, but not from a named
  framework and not currently taught. Drop it without loss if the block should stay at three.
- Logline 1 criterion 4 and Logline 3 criterion 5 ("a stranger could say what it's about"). Practical
  tests I believe in; not sourced.
- The `examplesCW` proposal (§4). Purely a suggestion about data shape.

**The Matt Bird attribution (§1.2)** sits between: I am confident "emotional shielding" is Ackerman &
Puglisi's term, and confident nothing supports our sentence as written. I am *not* asserting Bird
never uses the phrase in any of his work.

---

## §6. RECOMMENDED ORDER OF WORK

Cheapest and most certain first, per the batch rule (§12) — though none of this should ship without
Neil's sign-off on §2.2a and §5's medium-confidence items.

1. **`'Wu'` → `'Gh'`** in the `TECH` map. One word; restores Rung 2 on the block Neil flagged.
2. **Neil's ruling on the flaw model** (§2.2a) — shield vs hamartia. Everything else in the Flaw and
   Wound blocks depends on it, and the Table card cannot be written until it is settled.
3. **Rewrite the Flaw and Logline 3 blocks** — ask bullets and tick lines together (§0). These are
   the two worst and they are independent of each other.
4. **Rewrite the Obstacle block**; then Wound, Inciting Incident, Stakes, Goal.
5. **Reconcile the reference guide** to the seven blocks (§1.3).
6. **Add `criteria` to the eight cards** and extend `bin/cw-keymatch-harness.js` to assert the card
   set contains the ask set.

---

## Sources

Craft literature consulted directly:

- [What Is Your Character's Emotional Shielding and Why Does It Matter? — Angela Ackerman, Writers Helping Writers](https://writershelpingwriters.net/2021/03/what-is-your-characters-emotional-shielding-and-why-does-it-matter/)
- [Identifying Your Character's Fatal Flaw — Writers Helping Writers](https://writershelpingwriters.net/2019/10/identifying-your-characters-fatal-flaw/)
- [How Your Hero's Past Pain Will Determine His Character Flaws — Writers Helping Writers](https://writershelpingwriters.net/2015/10/past-pain-flaws/)
- [Using Dysfunctional Behavior to Reveal Characters' Emotional Wounds — Angela Ackerman, via Jane Friedman](https://janefriedman.com/using-dysfunctional-behavior-reveal-characters-emotional-wounds/)
- [The Ultimate Writing Glossary (Ghost, Lie, Want, Need, Thematic Truth) — K.M. Weiland](https://www.helpingwritersbecomeauthors.com/writing-glossary/)
- [Creating Your Character's Inner Conflict: Want vs. Need — K.M. Weiland](https://www.helpingwritersbecomeauthors.com/your-characters-inner-conflict-want-vs-want/)
- [Inciting Incident: Definition and 6 Examples — Story Grid](https://storygrid.com/inciting-incident/)
- [The Secrets of Story — Matt Bird (publisher listing)](https://inkwellmanagement.com/books/secrets-of-story) · [The Secrets of Character — Matt Bird](https://www.amazon.com/Secrets-Character-Writing-Hero-Anyone/dp/0593331222)

Referenced from established craft knowledge rather than fetched this session (John Truby,
*The Anatomy of Story*; Robert McKee, *Story*; Blake Snyder, *Save the Cat!*) — the specific claims
attributed to them above are standard to those works, but I have not quoted them from source in this
session and they should be checked against the books before any of it is printed for students.
