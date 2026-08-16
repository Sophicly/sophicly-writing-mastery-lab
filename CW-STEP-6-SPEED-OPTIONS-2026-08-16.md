# STEP 6 IS TOO SLOW — WHAT THE DATA SAYS, AND FOUR OPTIONS

**For:** Neil. **From:** WML chat C, 2026-08-16. **Source:** FIXLIST #376 (verbatim), measured against
live prod data the same day. **Status:** options paper — nothing built, nothing decided.

You asked for this "relatively soon" and named two possible causes yourself. I measured before
designing, because the two causes point at different fixes.

---

## 1. WHAT I MEASURED (prod, 9 real students, 2026-08-16)

All nine are genuine students — role `student`, personal email addresses, no test accounts.
Beats counted as filled = the box contains text the student wrote.

| student | plot | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 |
|---|---|---|---|---|---|---|---|
| Reeham Khan | tragedy | **18/18** | **25/25** | **21/21** | **13/13** | **20/20** | **6/6** |
| Billo SOUMAH | tragedy | **18/18** | **25/25** | **21/21** | 2/13 | 0/20 | 1/6 |
| Yusra Kazi | coming-of-age | **19/19** | 8/26 | 0/23 | 0/13 | 0/18 | 1/5 |
| Maysa Adham | hero's journey | **18/18** | 2/26 | 0/23 | 0/13 | 0/18 | 1/6 |
| Adam Qureshi | tragedy | 14/18 | 0/25 | 0/21 | 0/13 | 0/20 | 1/6 |
| Shounok Shoummo | tragedy | 3/18 | 0/25 | 0/21 | 0/13 | 0/20 | 1/6 |
| Mohhamod Rifat Miah | hero's journey | 0/18 | 0/26 | 0/23 | 0/13 | 0/18 | 0/6 |
| Pareshay Khan | hero's journey | 0/17 | 0/25 | 0/22 | 0/12 | 0/17 | 0/5 |
| Hafsa Humayun | hero's journey | 0/17 | 0/25 | 0/22 | 0/12 | 0/17 | 0/5 |

**Roll-up:** Stage 1 56% filled (4/9 complete) · Stage 2 26% (2/9) · Stage 3 21% (2/9) ·
Stage 4 13% (1/9) · Stage 5 12% (1/9) · Stage 6 22% (1/9).

**One student in nine has finished Step 6.** Your "many haven't even finished stage one" is correct
and, if anything, understated.

---

## 2. ⭐ THE FINDING THAT SPLITS YOUR TWO HYPOTHESES

You named two causes: *they don't understand how story works*, and *it's a technique problem — they're
typing*. The shape of the data points at a third thing that neither quite names.

**It is not a slow grind. It is a cliff.**

If typing speed were the main constraint, you would expect a steady partial fill — everyone
trickling along, stopping mid-stage wherever they ran out of session. That is not what happened.
Yusra filled **19 of 19** boxes in Stage 1 and then **8 of 26** in Stage 2. Maysa filled **18 of 18**
and then **2 of 26**. Billo filled 64 boxes across three stages and then stopped dead at 2 of 13.

These are students who demonstrably *could* type 18–19 boxes. They didn't stop because typing got
harder. They stopped at a **boundary**.

And look at what is on the other side of that boundary:

| | S1 | **S2** | S3 | S4 | S5 | S6 |
|---|---|---|---|---|---|---|
| beats in the stage | 17–19 | **25–26** | 21–23 | 12–13 | 17–20 | 5–6 |

**Stage 2 is the biggest stage in the whole workshop, and it is the one immediately after the only
stage most students finish.** A student completes 18 boxes, feels done, clicks on, and is shown 26
more — with four more stages behind it and no visible end. That is a motivation and volume problem,
not a words-per-minute problem.

⚠️ **Labelled honestly:** the cliff is measured; the *explanation* for it is my inference from the
shape. I cannot prove causation from stored documents. The one cheap way to test it is in §5.

**A second, separate problem the numbers exposed:** **three of the nine (Rifat, Pareshay, Hafsa) have
never started at all** — zero beats, and no edit timestamps anywhere in the document. Their first and
last beats were never even poured in from the spine exercise. That is not "Step 6 is slow", that is
"Step 6 was never entered", and no redesign of the beat flow will fix it. It wants its own look.

---

## 3. WHAT I COULD NOT MEASURE — AND WHY THAT MATTERS

**Whether a student typed or dictated is not recorded anywhere.** There are 45 dictation references in
the frontend, none in PHP, and nothing that saves, counts or logs the mode — the only
persistence-adjacent line is a `console.log`. So:

- Your "they're all typing" stands on your own observation of the group, which is good evidence. The
  system holds no record of it, so I can't put a number on it and won't pretend to.
- **More importantly: if we ship a dictation-first fix, we currently have no way to tell whether it
  worked.** We would be back to eyeballing the next group.

**Time-on-task is also not recorded.** Documents carry a last-edit stamp per stage, not a duration,
so "how long does Stage 2 actually take" is not answerable from stored data. What the stamps do show
is elapsed spread: Reeham did the entire workshop inside ~10 hours across two days — close to your
own "one or two sittings" — while Billo's three stages spread over 9 days.

---

## 4. THE FOUR OPTIONS

### Option A — Skeleton first, then backfill (your proposed shape)
First and last beat of the story poured from the spine exercise, then per stage: the first beat plus
one key beat, then go back and fill the rest.
- **Targets the measured failure directly** — it replaces "here are 26 boxes" with "here are 2", and
  gives a student a complete-looking spine early, so the remaining boxes are additions to something
  that already exists rather than a wall to climb.
- Every student who stalled has a *complete Stage 1* to build from, so it also helps the ones already
  stuck, not just the next intake.
- **Cost:** "key beats" needs a code-owned definition. Per WML CLAUDE.md §4c.9 this must be a
  **row → concept map**, not per-template hand-authoring — the 8 templates hold ~100 rows each
  (measured above: 17–26 per stage), and hand-picking per template is a job that never finishes.

### Option B — Dictation first
Make voice the default input for beats; teach it explicitly at the start of Step 6.
- Attacks the cause you can see with your own eyes, and it's how *you* finish in two sittings.
- Plausibly the cheaper build — Dictate already ships on the rail.
- **But:** the cliff shape suggests this is the *secondary* constraint, not the primary one. Faster
  typing does not make 26 boxes feel like fewer boxes. And per §3 we cannot currently measure whether
  it worked.
- ⚠️ Worth knowing before betting on it: these are 13–16-year-olds, often working in a room with
  other people. Speaking a story aloud in company is a social cost that doesn't apply to you working
  alone. Some will not use it however well we teach it.

### Option C — Cut the beat count
Reduce what a stage asks for outright.
- Simplest, and directly addresses volume.
- **But** it trades away the teaching. The beats are the plot structure; fewer beats is a thinner
  story model. I'd only reach for this if A fails.

### Option D — A + B together
Skeleton-first as the structure, dictation taught at the moment the first beat is asked for.
- **My recommendation**, with one condition attached — see §5.

---

## 5. RECOMMENDATION, AND ONE THING TO DO FIRST

**Do A, and teach dictation inside it (Option D). But instrument the input mode in the same change.**

The instrumentation is small — record, per beat, whether the text arrived by keyboard or microphone.
It costs almost nothing and it converts your next group from another round of eyeballing into an
actual answer to the question you asked. Without it we will be having this same conversation about
the next intake with the same absence of evidence.

**Order I'd suggest:**
1. Instrument input mode (small, and it must ride the same release, not follow it).
2. Build the row → concept map that defines "key beat" (§4c.9 — this is the real work, and it is
   reusable: those ~100 rows per template are roughly 40 recurring concepts, most of which already
   exist as technique cards).
3. Ship skeleton-first with dictation taught at the first beat.
4. Look separately at the three students who never started — that is a different bug.

**What I have NOT done:** designed the walk, chosen the key beats, or written anything. Those need
your call on the option first, and the key-beat definition is a design job in its own right.

---

## 6. OPEN QUESTIONS FOR YOU

1. **Option A, B, C or D?**
2. **The three who never started** — do you know from the room whether they opened Step 6 at all?
   That is the one fact the database cannot hold, and it decides whether that is an onboarding
   problem or a bug.
3. **Does a stalled student restart, or continue?** Everyone who stalled has real work banked. A
   redesign that resets them to a new flow would throw that away; one that carries it forward has to
   ask "what changed?" rather than re-asking from zero (§4c.8b).
