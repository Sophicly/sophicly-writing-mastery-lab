# CN-STANDARD.md — The Conceptual Notes Contract

**Status:** THE contract for every Conceptual-Notes experience (poetry, literature/novels-and-plays, nonfiction — and any future CN-like reference-building task). Read this BEFORE touching any CN protocol, CN doc template, or CN chat surface. A CN change that fails its acceptance checks does not ship.
**Established:** 2026-07-09/10, Neil's poetry-CN live sessions (v7.20.5 → v7.20.12 + protocol content commits through `8841ba4`). Reference implementation: **poetry CN** (`protocols/shared/poetry/modules/conceptual-notes/pn-conceptual-notes.md` + the poetry-CN JS in `frontend/wml-assessment.js`).
**Siblings:** `PROTOCOL-STANDARD.md` (what a protocol says) · `ASSESSMENT-MECHANICS.md` (how the assessment machine behaves) · this doc (how the CN experience behaves). Update in the same commit as any CN mechanics change.
**Sources of authority:** Neil rulings recorded in memory — `feedback_deep_but_never_dragging_pace_principle`, `feedback_student_owns_ideas_no_injection`, `feedback_effects_on_reader_four_fold_framework`, `feedback_cn_depth_scales_inverse_to_text_count`, `reference_wml_cn_start_path_must_produce_turn`.

---

## §1 — PURPOSE & DEPTH CALIBRATION

**What CN is:** the student's living reference for a text or anthology, built through Socratic dialogue with Sophia and FILED into a structured document. The marks live in the ideas beneath the text — concept-led notes, not retelling. CN is deliberate practice in conceptual thinking, not dictation.

**§1.1 — Depth scales INVERSELY with text count (Neil ruling 2026-07-10).**
- **Anthology** (poetry ~15 poems; nonfiction anthology): LIGHT per item. Poetry's 8 elements per poem is the calibrated ceiling — Neil: "just enough." Coverage IS the strategy; depth per item would make coverage impossible.
- **Individual set text** (novel, play): DEEP. The literature walk's 7 sections / 45 steps (Protagonist alone = 14 steps) is the calibrated register. One text carries a whole paper — depth IS the coverage.
- **Acceptance check:** a new/ported CN protocol states its text-count class in its header and matches the corresponding register. Never upgrade an anthology walk toward 45-step depth; never thin a set-text walk toward 8 questions.

**§1.2 — Current family status (2026-07-10):**

| Family | Files | Depth | Generation |
|---|---|---|---|
| Poetry | `pn-conceptual-notes.md` (+`pn-reference.md`) | 8 elements/poem | **CURRENT** — reference implementation of this contract |
| Literature (novels/plays) | `cn-foundation.md` + `cn-section-1…7` | 7 sections / 45 steps | BEHIND — right depth, lacks §3–§7 laws + §8 doc mold (Part B port) |
| Nonfiction (Edexcel IGCSE Lang P1) | `nfcn-foundation.md` + `nfcn-section-1…8` | 8 sections | BEHIND — same gaps as literature |

All three families load the shared spine (`modules/socratic-core.md`, `session-management.md`, `language-techniques.md` — see each `protocols/shared/*/manifest.json` `always` list). The shared spine is the ONE home for cross-family laws (chat A owns shared-module edits).

---

## §2 — ELEMENT & DOCUMENT STRUCTURE

**§2.1 — The element row shape (per element, in the doc):**
1. `<p><strong>{Element label}</strong></p>` header
2. **Notes field** — `{prefix}_{el}` (poetry: `poem_{pid}_{el}`) — the conceptual note
3. **Key quotes field** — `{prefix}_{el}_quotes` — "Key quotes (1–3)."
4. **Effect on the reader field** — `{prefix}_{el}_effect` — CRAFT ELEMENTS ONLY (§2.2), positioned AFTER quotes.

**Field order is `notes → quotes → effect` (Neil ruling 2026-07-10): the student writing order — concept, then evidence, then the effect reasoned FROM the evidence.** Never place effect between notes and quotes.

**§2.2 — Effect boxes go on CRAFT elements only.** Effect is produced by craft, felt as meaning: the box belongs where an authorial method acts on the reader. Poetry: speaker · form · structure(&language) · themes. It does NOT go on knowledge or synthesis elements: context (knowledge, effect indirect), purpose (purpose already IS the intended effect — a box would duplicate it), message/comparisons (syntheses — they inherit the per-element effects). **Port rule:** apply the same craft/knowledge test per family (novels/plays: character, form/structure, language, themes = craft; context = knowledge; nonfiction: nearly everything is reader-manipulation — effect fits wherever craft appears).

**§2.3 — One-doc mold.** One document per anthology/text: a section-header super-group opens the CN half (TOC nesting), one collapsible section per poem/major-unit, dividers as titles. Per-poem groups DEFAULT COLLAPSED (a map of the anthology); the ACTIVE item auto-expands **and the expand is PERSISTED** to the same localStorage key the manual chevron writes (`data-collapse-key` on the wrapper) — an unpersisted programmatic expand snaps shut on the next NodeView redraw (v7.20.6 lesson; memory `reference_wml_nodeview_redraw_re_defaults_collapse`).

**§2.4 — Doc mutations on load: additive, idempotent, hydration-gated heals only.** Every structural upgrade to live student docs ships as a heal in the orchestrator (`_runPoetryCnHeals` shape): keyed on fieldId existence, TARGETED `insertContentAt` (never `setContent` from a heal), descending-position application, PM transactions only, content-preserving node-JSON moves when repositioning. New fields added to the template MUST ship with the matching heal in the same change (live docs otherwise silently lack them).

**§2.5 — Filing is `@FIELD_SET` markers** (function-calling is disabled WML-wide). The per-session injected fieldId contract (router `build_poetry_cn_injection` shape) must name EVERY fileable field including `_effect` — an injected "EXACT fieldIds" list that omits a field overrides the protocol and the model never files it (v7.20.7 lesson). **Revisit / gap-completion turns re-file ONLY the field(s) worked on** — never re-emit an element's other markers with guessed values. The client writer is generic (matches any fieldId in the doc), fails loud on a miss, fills-only-while-empty with hash provenance: the AI's re-file replaces its own earlier auto-fill; a student hand-edit ALWAYS wins.

**§2.6 — STAGED anthology delivery (Neil rulings 2026-07-10).** An anthology CN is not one
sitting — students work it in STAGES (the poetry-FQ staging pattern: bridge stage param, e.g.
`cn_stage=N`; stage-scoped chat suffix per the quiz-session-identity law; roster sliced per
stage). The rule: **a stage = one honest sitting.** Ruled sizes:

| Anthology | Items | Per stage | Stages |
|---|---|---|---|
| GCSE poetry anthologies (AQA/Edexcel/Eduqas/OCR) | 15 | 3 poems | 5 |
| Edexcel IGCSE Lang P1 (nonfiction) | 10 | 2 texts | 5 |
| Edexcel IGCSE Lang P2 (poetry+prose) | 5+5 | 1 poem + 1 prose | 5 |
| Edexcel IGCSE Lit P1 (poetry) | 16 | 4 poems (recommended — avoids an orphan 1-poem stage 6; pending Neil confirm) | 4 |

Design note: stage completion = all stage-roster items done (the done-poem derivation, sliced);
re-entry, gap-targeting and the picker all scope to the ACTIVE stage's roster. Bridge/LD
topic-sync changes ride the staged-CN design (backlog item, wml-backlog.md 2026-07-09).

**§2.7 — Which boards have anthology-register CN.** Edexcel IGCSE Spec A is the ONLY board
whose LANGUAGE papers are anthology-based (P1 nonfiction / P2 poetry+prose — data authored,
both envs, verified 2026-07-10). All other boards' Language papers are unseen-text. Literature
poetry anthologies: all boards. Watch: Cambridge IGCSE Literature uses Songs of Ourselves
(poetry) and potentially Stories of Ourselves (PROSE anthology) — the prose-anthology register
built for Edexcel IGCSE gets reused there.

---

## §3 — PACE: DEEP, NEVER DRAGGING (programme principle)

Neil: "We want them to think deeply, but move on at the right time… it might have to feel long, to change the way the student thinks — but never unnecessarily long."

**§3.1 — The calibration rule: depth = the student is still producing NEW thinking. Never exchange count.**
- Concept still FORMING → stay in the Socratic chain, however long it feels. That stretch IS the lesson; it must not be cut.
- Concept HELD (they said it back in their own words) → converge in ONE move: synthesise, confirm, file, bridge on.
- What gets cut is CEREMONY, never cognition: re-asking what's known, re-walking filed work, multi-step confirmations, unscoped "deepen this" wanders.

**§3.2 — Stall rule:** two consecutive student turns producing no new thinking → change approach (reframe, point at the text, descend the §5.2 ladder) — never re-ask the same question in new clothes. Repetition is ceremony.

**§3.3 — Bounded choices as lettered options.** When the fastest honest route is a bounded choice (candidate quotes, aspects to strengthen, effect lenses, next steps), OFFER it as lettered options — the interface renders them as one-click buttons. One click beats three exchanges. Multi-select where combinations are natural.

**§3.4 — No dead-end turns.** Never end a turn with an open "just let me know…". After filing, after a synthesis, after any natural pause: lettered next-step options ("A — Continue to Historical Context · B — Revisit an element"). An open ending costs a typed message for a click's decision.

**§3.5 — Move-on honesty.** If existing work is already strong, say so and recommend moving on: unfilled elements are worth more marks than gold-plating filled ones. Never pad a completed element to fill an expected length.

**Acceptance checks:** grep the protocol for a PACE section; every filing/synthesis instruction ends in lettered options; the stall rule is present; no instruction mandates a fixed number of questions per element.

---

## §4 — EFFECTS: THE FOUR-FOLD FRAMEWORK (all reader-effect work)

Effects on the reader are one (or a combination) of FOUR things, taught as a CAUSAL CHAIN — not four islands:
1. **FOCUS** — what the author makes us look at, where, and what it means.
2. **EMOTION** — the most important: what the focus makes us feel (empathy first; also tension, sadness, suspense…), always linked to the themes.
3. **THOUGHTS** — how those feelings about the ideas shape what we think.
4. **ACTIONS** — how that thinking might change what we do.

**§4.1 — Plain lenses, never abstraction.** Effect questions are asked IN these lenses. Never an abstract effect question — "what does that force the reader to do with their own response?" was unparseable even to Neil. The lens names ARE the plain language.

**§4.2 — Elicitation is a CHOICE (ownership device).** The student picks the lens(es) they noticed — multi-select welcome (focus+emotion is common) — and probing stays inside their pick. Code-owned lens card where built (poetry `_poetryCnEffectLensCard`: four chips + "what did you notice?" + mic); lettered options from the AI where the interface hasn't sent one.

**§4.3 — Never pad an effect.** If the walk didn't establish a reader-effect, omit the `_effect` marker — never invent one to fill the box.

---

## §5 — OWNERSHIP: THE STUDENT'S IDEAS, POLISHED, NEVER REPLACED

**Scope (Neil ruling): UNIVERSAL** — CN, planning, outlining, polishing, everything student-authored. **Assessments excluded** (marking legitimately brings examiner knowledge). Why: ownership IS the pedagogy — "students say they feel like they're cheating if it's a bit too easy." One principle powers all five modes below: **the TEXT is shared ground and the arbiter; evidence can be pointed at freely; conclusions stay the student's.**

**§5.1 — Mode 1, student got there: polish and file.** A filed note is assembled ONLY from ideas the student articulated in this walk. Polish wording, tighten, order — fine. NEVER introduce a new conceptual claim at synthesis (the "complicity" case: student never said it, the synthesis did — forbidden). **The filing test: could the student point at their own words for every claim in the note? If not, cut it.**

**§5.2 — Mode 2, student won't get there (most 13–16-year-olds WILL miss good ideas): the EVIDENCE LADDER.** One rung per exchange; a rung that fails twice → descend (§3.2):
1. **Point at evidence, not the idea.** Quote the line that carries it; ask what they notice ("Look again at 'mine, mine' — why say it twice?").
2. **Narrow the question.** A contrast or either/or that carves the space ("Is he telling US, or telling HIMSELF?"). They pick and justify — the synthesis stays theirs.
3. **Candidate readings, labelled as candidates** (last rung): 2–3 lettered readings, each anchored to a quote, posed as a TEST — "Which fits the line best, and why?" Their evaluation against the text makes the pick theirs.

**THE LINE: an idea offered as a candidate and tested by the student is scaffolding; an idea appearing unbidden in the synthesis is injection.**

**§5.3 — Mode 3, student got there and could go further: ENRICHMENT (optional, never rescue).** Once their own reading is filed (ownership secure), Sophia MAY offer 1–2 alternative readings — quote-anchored, framed as readings to TEST, lettered options always including "move on". Exam-honest framing stated to the student: top bands reward exploring alternative interpretations. Their reading stays the spine of the note; an explored alternative is added only if THEY judge it earns its place.

**§5.4 — Mode 4, student is WRONG (the Macbeth-rocket case): be willing to correct — the text is the arbiter.** An interpretation is an argument from evidence. The correction arc:
1. Challenge: "Where in the text? Show me the line." — the text corrects them, not the tutor; dignity survives.
2. The challenge turn ENDS with buttons (the click is the face-saving exit — easier than typing an admission):
   - `A — Here's my evidence (quote the line below)`
   - `B — I can't find evidence for it`
3. On B (or evidence that doesn't hold): letting go is framed as a SCHOLARLY move ("dropping a reading the text won't support is exactly what strong critics do"), then the honest exam framing in the examiner's own register — **"unsupported assertion"** — never "irresponsible", never shaming. Immediate redirect to a more valuable idea in the same line.
4. Persistence without evidence → plainly and kindly: without a line to stand on, a reading cannot go in the notes.

**§5.5 — WRONG ≠ UNUSUAL.** WRONG = no textual support → reject. UNUSUAL-BUT-EVIDENCED = a minority reading with a line to stand on → welcome it. The boundary is evidence, so outside-the-box thinking is protected. **Never validate a baseless reading to be encouraging: false praise files a note that fails them in the exam.**

---

## §6 — SESSION LIFECYCLE LAWS (the chat surface)

**§6.1 — THE START PATH MUST ALWAYS PRODUCE A TURN.** Any "begin/start/open" path ends in either a code-owned card OR an AI directive — a silent bail is a dead chat (two shipped members of this failure class: v7.20.5 pid bail, v7.20.8 capability-gate bail; memory `reference_wml_cn_start_path_must_produce_turn`). Implementation shape: after the opener attempt, a CATCH-ALL checks whether a live card landed; if not — for ANY reason, including future ones — a silent directive fires and the AI takes the turn. Never fix one bail reason and omit the catch-all.

**§6.2 — Programmatic-first cards (§A16) own the bounded turns.** Where the answer space is bounded, code renders the question — zero AI calls until the student answers: poem picker → confirm (Start/Change) → stance openers (speaker/form/purpose) → effect lens card → re-entry card. Every free-text input on a card carries a mic (`_attachPanelMic` — SOP). Cards send ONE silent message carrying the student's answer + interface markers.

**§6.3 — Re-entry is GAP-AWARE, with agency.** Starting an item with filed elements renders the re-entry card: "Welcome back — you've filed N of M… In {Element}, your {box} is still empty." Buttons, in order: **Continue — next: {element}** (primary; time is the scarce resource) → **targeted gap buttons** (max 3: "✎ {Element} — add {box}"; empty `_quotes`/`_effect` boxes on filed elements, doc-derived) → **Revisit a filed element** (generic). All-done items: gaps + revisit, no Continue. NO Wipe (Neil ruling: destructive surface, rare need, fields stay hand-editable).

**§6.4 — Revisit converges.** Gap directives scope to ONE box, recap-first, one-two exchanges: quotes → Sophia proposes 2–3 candidate quotes from the text matched to the note as lettered options (one click files); effect → the lens card (§4.2). Generic revisit → recap, then "what SPECIFICALLY do you want to strengthen?" with lettered options drawn from the note + "Happy with it — move on". Deep only where the student points.

**§6.5 — Progress chip is CODE-DERIVED, and names what's being worked on.** The model never draws the pin. The chip derives position from the doc (filled elements → next unfilled). A revisit pins the chip to the revisited element via the persisted `@ELEMENT_REVISIT{poem,el,box}` marker until that element re-files, and the heading names the box: "Speaker — Effect on the reader". Marker laws: interface markers (`@POEM_SELECTED`, `@ELEMENT_STANCE`, `@ELEMENT_REVISIT`) ride hidden student turns so identity/state survive refresh and rebuild from history on resume; the AI never repeats a marker in its own prose.

**§6.6 — Fail loud, never a silent generic fallback.** Empty roster → a visible "report this to your tutor" card, never an AI-invented picker. Missing poem text → "POEM TEXT UNAVAILABLE", never quoted from memory. Missing per-text bank/file → warn naming the slug tried. A data miss means "fix the data", never a code fork that reads as success.

**§6.7 — Router preamble covers EVERY arrival shape.** The injected per-session context must handle: stance-card arrival AND continue arrival AND revisit arrival AND single-box arrival — a preamble written for only the happy path contradicts the others and the model re-asks/restarts (v7.20.8/9 lessons). Never restart at element 1 uninvited; never re-walk elements/boxes the message didn't name.

**§6.8 — In-element checkpoints (BEATS) — designed, not yet built.** The unknown-length Socratic chain is the last "drags forever" surface. Cycle-2 design (Fable, PACE-grounded) at `~/.claude/plans/wml-cn-beats-ux-design-spec.md`: named concept-beats per element, mini-checklist ledger in the chip, `@BEAT` markers code-validated (student's demonstrating turn only), degrade-to-today floor. AWAITING Neil's red pen on the 8 beat sets; build against this contract.

---

## §7 — VOICE & LANGUAGE (student-facing, CN-specific)

Universal bans live in memory/BRAND (never "shows", no arrows, academic register, Sophia never "AI"). CN adds:
- Effect language = the four lenses in plain words (§4.1).
- Correction language: "unsupported assertion" (the examiner's term), NEVER "irresponsible interpretation" or any shaming register (§5.4).
- Letting go of a wrong reading = "what strong critics do" — scholarly reframe, not defeat.
- Exam-honest framing is allowed and encouraged where it motivates ("top bands reward exploring alternative interpretations").

---

## §8 — PART B PORT CHECKLIST (novels/plays, then nonfiction)

Porting literature/nonfiction CN to this contract (Macbeth = the mold text; locked doc rulings in `wml-OPUS-fq-stage-pair-and-cn-standardisation-2026-07-10.md`):

**Protocol side (chat A owns shared-spine placement; family files per family owner):**
- [ ] PACE section (§3) — verbatim principle, stall rule, no-dead-end, lettered options
- [ ] OWNERSHIP section (§5) — all five modes incl. evidence-challenge buttons + examiner language
- [ ] EFFECTS four-fold (§4) — elicitation-as-choice on the family's CRAFT elements (§2.2 test)
- [ ] Filing contract: per-element fieldIds incl. `_quotes` + craft `_effect`; single-field re-file rule; never-pad-an-effect
- [ ] Router injection names every fileable fieldId (§2.5) + covers all arrival shapes (§6.7)
- [ ] Depth register preserved (§1.1): the 45-step walk keeps its depth — the port adds LAWS, not thinning

**Doc side (JS currently poetry-gated — generalise, don't fork):**
- [ ] One-doc mold (§2.3): element rows notes → quotes → effect; collapsible sections; TOC super-group
- [ ] Additive heal for live legacy docs (§2.4) — the legacy 7-box (`cn_section_N`) content carries over (the poetry `_healPoetryCnShape` carried/fold pattern)
- [ ] Collapse persistence on programmatic expand (§2.3)
- [ ] Start-path catch-all (§6.1), re-entry/gap cards (§6.3), lens card (§4.2), chip laws (§6.5) — keyed on the family's fieldId prefix via ONE canonical spine per family (never a hand-copied element list)
- [ ] Rollout matrix before prod: fresh doc + legacy-doc heal + re-entry + revisit + wrong-interpretation arc, in BOTH chat pipelines

**§8.1 — Remaining arcs (Neil's roadmap 2026-07-10): Part B (novels/plays) → planning → creative writing.** Ownership (§5) and PACE (§3) apply verbatim to planning/outlining AND creative writing (Neil ruling: universal to everything student-authored; assessments excluded). Each arc builds against those two sections; scope lives in the roadmap (`project_wml_protocol_finalize_and_port_roadmap`). CW additionally keeps its own settled canon (Pixar six-beat Story Spine in CW-STEP-04, one-path-per-project persistence).

---

## §9 — ACCEPTANCE CHECKS (run before shipping any CN change)

1. `grep -l "PACE" <protocol>` — pace section present; no fixed question quotas anywhere.
2. `grep -l "OWNERSHIP\|unsupported assertion" <protocol>` — ownership section + correction language present.
3. `grep "FOCUS\|EMOTION\|THOUGHTS\|ACTIONS" <protocol>` — four-fold present; no abstract effect questions.
4. Field order in template AND heal: notes → quotes → effect (craft only). Template change ⇒ heal ships in the same commit.
5. Injected fieldId contract lists every fileable field the protocol can emit.
6. Start path: simulate every entry state (fresh, mid-walk re-entry, all-done) — each produces a card or a directive. No silent bail.
7. Chip: never model-drawn; revisit shows element + box; reverts on re-file.
8. Dead-end sweep: every filing/synthesis turn in the protocol ends with lettered options.
9. Standard gates: `bin/pre-ship-check.sh`, both chat pipelines, WML-SMOKE-TEST matrix where canvas/pipeline code moved.
