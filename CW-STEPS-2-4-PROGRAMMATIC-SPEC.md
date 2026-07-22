# CW Steps 2–4 — Programmatic-First Rebuild (SPEC, agreed with Neil 2026-07-22)

Status: **agreed, no open design questions.** Build order in §6.
Governing laws: WML CLAUDE.md #3 (never ask for what the system holds), #4 (programmatic-first),
#5 (code-served source never in a manifest-loaded module). Root CLAUDE.md #12 (one test cycle).

---

## 1. The division of labour (applies to all three steps)

| Owner | What |
|---|---|
| **CODE** | Teaching text · worked examples · the questions themselves · menus/chips · walk state · verbatim commits · fill-scroll · sub-step progress |
| **STUDENT** | Their own ideas, loglines and beats — verbatim into the doc — **and their own spelling/punctuation/grammar** |
| **API** | Judgment ONLY: solid-vs-thin verdict, the Socratic push when thin, concept refinement, the two irony follow-ups, the Step-8 coherence check |

**The API is a judge, not an asker.** The questions are fixed and identical for every student, so code
asks them. What code cannot do is read the answer — "her flaw is she's clumsy" vs "she pushes people
away before they can leave her" are both valid sentences and only one is a flaw.

**Student does their own SPaG (Neil, 2026-07-22).** This is a writing course; SPaG is assessed (AO6).
Silent AI tidying removes the practice AND hides the student's real error patterns from Neil. Rows are
editable — the student fixes them in the document. Shape constraints (present tense, one sentence, no
lead-in connective) go in the ASK, not in a clean-up pass afterwards.

## 2. Per-component turn cycle

1. CODE — teaching + examples + question (chips where it's a menu)
2. STUDENT — types the answer
3. CODE — `@FIELD_COMMIT`-equivalent: verbatim into the row, fill-scroll, persist
4. API — one small call: solid or thin? If thin → one probing question. If solid → one line of affirmation.
5. CODE — serves the next component immediately (no API)

On a strong answer the API output is ~2 lines, not a teaching block. That is where the saving is —
fewer calls AND far smaller outputs. Est. ~30 API calls today → ~12 across the three steps.

## 3. Step 2 — Explore Story Ideas

- **Code-served:** opener (4 inspiration categories, 4 example ideas, 2 resource links — currently a
  large API-generated block, identical every run), the "next idea?" invites, the wrap-up + tick prompt.
- **API:** profile recap (reads their real profile), reading each idea + the deepening question,
  springboards when stuck.
- **THE IDEA LADDER (Neil's ruling, 2026-07-22):**
  1. Idea 1 lands → saved → one deepening question.
  2. Invite idea 2 **once**. If given → invite idea 3 **once**. Decline at any point → accepted
     **permanently**, idea 1 auto-ticked, on to Step 3.
  3. Hard cap 3. Never a 4th ask; never a re-ask after a decline.
  - Decline is a **code-owned chip** (`[Try one more]` / `[I'm set on this one]`), so the loop Neil hit
    is structurally impossible rather than a politeness instruction the model may ignore.
  - Rows 2/3 relabelled optional; completion gate stops requiring them.
- **Slot assignment moves to code.** The LLM currently picks `idea1/2/3`; it will emit only "this
  message is an idea" and code assigns the next free row (kills a key-drift class).
- Delete the five places that assume 3 ideas (§2.1, §2.2, L171 "continue until at least 3", §Step 5
  "happy with all three", doc row labels).

## 4. Step 3 — Logline

- **Code-served:** all seven component asks (protagonist · flaw · wound · incident · goal · obstacle ·
  stakes) with their Scrooge/Katniss/Macbeth examples baked in; the three logline formulas + worked
  examples; the student's own components echoed back from the doc.
- **API:** seven solid/thin verdicts (Socratic push only fires when thin); light **concept** refinement
  of each student-written logline.
- **OWNERSHIP FIX — the student writes the loglines.** Today Sophia composes all three and `@FIELD_SET`s
  them in (CW-STEP-03-logline.md:237); the student only ticks one. That is the exact thing CW-STEP-02 §3
  forbids one file over — and it is the DNA sentence of their story. New flow per formula:
  code serves formula + examples + their components → **student writes it** → verbatim `@FIELD_COMMIT`
  → one API concept-polish → refined `@FIELD_SET` over it (the existing two-grade pattern).
- **All three loglines stay — no escape hatch.** Different from Step 2's ladder: three *ideas* was
  busywork; three *loglines* is the same story through three lenses (action / goal / character-arc) =
  deliberate practice, and it scaffolds (formula 3 is easy after 1 and 2).

## 5. Step 4 — Story Spine

- **Six pure menu turns → chips, zero API** (the protocol already says "quick-action button options"
  and then pays API rates to render them): unmet need (6) · inciting-incident type (3) · goal type (7) ·
  obstacle type (3) · stakes (2) · throughline (3).
- **OWNERSHIP FIX — student writes the beats** (same two-grade pattern as the loglines). The present-tense
  /no-lead-in shape goes in the ask; the student tidies their own SPaG in the row.
- **API RETAINED — confirmed by Neil, do not strip:**
  1. **The Step-8 coherence check.** Reads all six beats together and finds the causal gap
     ("decided to find the treasure" → "was captured by pirates" with nothing linking them). This is
     the entire point of a *spine* rather than six boxes. Highest-value call in the arc.
  2. **The two irony follow-ups** — Beat 3 "how is this disaster secretly the opportunity she needs?"
     and Beat 6 "how does what she gets contrast with what she thought she wanted?"
  3. **Reading each beat answer** — Beat 2's push for a concrete visual action over an abstract state,
     Beat 5's "how does this obstacle attack *her* flaw".
- **PASTE-WALL DEFECT to fix:** Step 4 re-asks flaw, inciting incident, goal, obstacle and stakes —
  all five already answered in Step 3 and sitting in the student's document. Code echoes the Step-3
  answer and asks them to DEVELOP it into a beat; never re-asks cold. (WML CLAUDE.md #3.)

## 6. Build order

1. **The judge-resume hook (engine, first).** `_cwProfileCtl` hands off to the API once and never comes
   back (`active = false`, wml-assessment.js:16363). Steps 2–4 need mid-walk handoff + resume — 7× in
   Step 3, 6× in Step 4. Same missing piece as poetry **BUILD 1** ("player v2 — mid-sequence API
   interruption + resume"), so building it once unblocks both. Write it as a shared capability, not a
   per-step improvisation.
2. Step 2 → checkpoint with Neil → Step 3 → Step 4.
3. PEDAGOGY.md: record the idea-ladder ruling AND the student-does-their-own-SPaG ruling in the SAME
   session (a ruling kept only in a memory file survived one day last time).
4. One deploy, one test cycle, TEST-THIS / QUEUED lists.

## 7. Build constraints (each has cost a live session before)

- **Sidecars.** Every teaching block lifted into code must land in a NON-manifest-loaded file
  (leading `_`, absent from `protocols/{board}/{subject}/manifest.json`). The manifest loads whole `.md`
  files into Sophia's context and she narrates retained text regardless of any "do not deliver" fence —
  the v7.20.250/.252 bug. `bin/seq-port-harness.js`'s retained-source guard enforces this.
- **Ask components in document-row order** so the field-granular fill-scroll walks down the page instead
  of jumping (v7.20.260).
- **Verbatim commit path already exists and is correct:** `applyFieldCommits` → `_writeOutlineRowField`
  (wml-assessment.js:3431) writes the student's own message text and calls `_scrollToFilledField`, which
  is field-granular in multi-field sections — so idea 2 / component 5 / beat 3 visibly scroll.
- Mirror `_cwProfileCtl`'s shape (persist / tryResume / sub-step progress / resetSend). Do not invent a
  second walk pattern.

## 8. Deliberately NOT in this batch

- **Sonnet 4.6 → Sonnet 5.** A model swap changes every protocol chat's behaviour and needs its own test
  pass; bundling it means Neil can't tell which change caused what. Do it as its own cycle. When we do:
  Sonnet 5's tokenizer produces ~30% more tokens for the same text (so the introductory $2/$10 rate
  roughly cancels out), and **adaptive thinking is ON when the `thinking` field is omitted** (4.6 ran
  thinking-off) — thinking bills at the output rate, so what AI Engine sends for `thinking` must be
  pinned BEFORE switching. Non-default `temperature`/`top_p` are rejected outright. WML sets no model
  params itself — this is an AI Engine config question.
- Token/cost logging (still open from the previous session's handoff).
