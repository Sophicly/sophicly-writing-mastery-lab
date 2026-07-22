# Phase-1 Build-Spec — Poetry Planning Flow Batch (v7.20.246)

**Owner split:** Opus scripts the engine; Fable runs the per-piece TECHNICAL-CORRECTION pass (byte-exact key-match / ids / labels / ported content). Every piece: Opus builds → Fable precision-corrects → Opus gates (harness + run-the-flow).
**Scope:** AQA poetry + lit, this cycle. **Prod held on v7.20.245** (paste-wall) — this batch becomes the prod ship.
**Governing law:** WML CLAUDE.md #3 (never demand known data) + #4 (programmatic-first for deterministic turns).

---

## PIECE 1 — b1 poem/question: kill the paste wall (correctness + biggest token win)

**Goal:** b1 opens already knowing the lesson. Focus poem + question injected from stored data; comparison poem = inline theme chips → auto-load text from bank. Zero paste (paste = off-bank fallback only).

**Mechanisms to reuse (Opus verifies exact refs at build):**
- Poem bank + resolver: `swml_poems_{board}_{anthology}` options → `includes/class-rest-api.php` (`get_poems`/`poems_option_rows`, ~:655-700), the SAME source `build_poetry_cn_injection` uses.
- Picker path already admits poetry: `needsTextPicker = ['poetry_anthology', …]` (`frontend/wml-app.js:~747`) — clone/extend, don't invent.
- Question: `topicData.question_text` (already `@CONFIRM_ELEMENT`-wired). Focus poem: `topicData.focus_poem` / `part_a_extract`.
- Server-side injection precedent: poetry CN already injects poem text from the bank via the router.

**Build:**
1. b1-setup.md rewrite: DROP Steps 3–5 poem/question paste. Open with a code-served confirmation turn (programmatic, no API): "We're planning your comparison of **[focus poem]** by [poet] for: '[question]'." (values from topicData).
2. Comparison-poem step → inline theme-chip picker: code renders ~4–5 theme-matched poems from the bank as quick-action chips + a "Browse all 15" chip → full list. Theme = derived from question/topic.
3. On tap → load that poem's text from the bank into session state (same shape the pasted text would have taken) so all downstream b4/b5 quote work is unchanged.
4. Fallback: off-bank poem → "type the title, or paste it" (the ONLY surviving paste, explicitly a fallback).

**Fable technical-correction pass:** bank option-key format (`swml_poems_{board}_{anthology}`, `sanitize_key`) byte-exact; the poem-id→text lookup key; theme→poem-cluster mapping correctness; `needsTextPicker` extension doesn't regress other subjects; topicData field names exact (`focus_poem` vs `part_a_extract`).

**Stays API:** nothing in b1. First judgment = b2A keyword validation.
**Verify:** load the staging test page → b1 shows the question + focus poem, chips render, tap loads text, no paste demanded. Data-on-target check: `swml_poems_aqa_love_relationships` populated on staging (CN-v982 inert lesson).

---

## PIECE 2 — Scripted-sequence player (the keystone) + apply to b4/b5 + mode toggle

**Goal:** a code-owned player that plays a fixed sequence of message-chunks with acknowledgment gating + per-chunk "explain more" expansions — NO API round-trip. Content authored as DATA. Reused everywhere deterministic.

**Mechanism to generalise:** the S0–S1 pre-planning chain (`_planChain*`, `frontend/wml-assessment.js:~3070`) already injects code-owned chat turns with no AI round-trip via the `sendCanvasMessage` intercept. Extend it into a protocol-driven sequence player.

**Data schema (authored per sequence):**
```
{ id, chunks: [ { text, ack:{label}, explainMore?:{text}, choices?:[{label,next}] } ], onComplete:'handToAI'|nextStep }
```
- `text` = the chunk message (byte-for-byte PORT from the existing b-files — #13, no re-authoring).
- `ack` = the "continue" chip (per-chunk acknowledgment stays — Neil).
- `explainMore` = the PRE-WRITTEN expansion (already in the b-files as the "B) explain" branches) — served by code, no API.
- `choices` = A/B multiple-choice ONLY (deterministic; e.g. b4 CHUNK 3's own-words check stays A/B — if ever free-text, it becomes a judged turn → API).
- ONE standing line up front: "Ask me to explain anything, any time" (the engine already scaffolds on explain/help intent — `wml-core.js:2382`).

**Apply to:**
- **b4 teaching CHUNKs 1–4** (`b4-anchors.md:12-35`) → sequence data. Keep F/S/L defs + Form≠Structure + the A/B own-words check + Ozymandias illustration. Port verbatim.
- **b5 rationale CHUNKs 1–4** (`b5-bodies.md:17-38`) → sequence data. Keep TTECEA+C table + Owen/Hughes example. Port verbatim.
- **Advanced/Standard mode** (`b5:114-117`, `b7:33`, `b8:30`) → ask ONCE as a code-owned pre-chain stage (precedent: the Lang "plan mode" pre-chain stage, WML canvas rule 5), store it, per-paragraph override = a code-served chip (0 API). The COMPILE stays API (judgment — condenses the student's words; v7.20.221 law).

**Fable technical-correction pass:** the ported chunk/expansion text is byte-identical to the source b-files (no drift, no dropped ✗/✓ examples, no swapped illustration poem); the intercept wiring fires the sequence at the right step and hands to AI cleanly on completion (no double-fire, no lost turn — the .898 scope-crash class); mode-store key-match with the compile read.

**Stays API (the over-strip line — do NOT convert):** all b4 Socratic gathering (form id, 6 quote validations, pair-strength), all b2A keyword validation, all 7 b5 element judgments ×3 + WEAK-pushes + `@ELEMENT_JUDGE` + `CONTEXT_DRIVE_CHECK`, plan compilation at approval, b6 recall/synthesis/thesis, b7 hook gate + building CONTEXT_DRIVE_CHECK, all 4 b8 elements.

**Verify:** run b4 + b5 openings on staging — chunks play with taps, "explain more" serves text, NO network call on those turns (devtools), production check + all downstream still hit the AI. Full `WML-SMOKE-TEST.md` matrix (canvas/both pipelines).

---

## PIECE 3 — pre-ship lint (enforce the LAW mechanically)

**Goal:** the grep-gate that makes the paste-wall class un-shippable.
**Build:** `bin/known-context-lint.js` (or extend pre-ship-check) — grep protocol planning files for demand-phrases: `copy and paste`, `paste the`, `paste that in`, `provide the .* (poem|text|question)`, `entire poem`, `tell me the (title|question)`, `what is the .* question`. Any hit in a planning protocol = FAIL (allow-list a phrase only with an explicit `<!-- lint-ok: fallback -->` marker on the same line, for the off-bank paste fallback). Wire into `bin/pre-ship-check.sh --all`.
**Fable technical-correction pass:** the regex set catches the real cases without false-positiving legitimate judgment prompts; the allow-list marker mechanism is exact.

---

## OUT OF PHASE 1 (tracked, not this cycle)
- Extend player → b9 wrap · b3 note · b2A framing; code-append ✍️ block + plan labels (Phase 2).
- Protocol-text UX polish: compound-Q splits (b8:18, b4:69, b6:21), 📌 pins through b5–b8, b9 double-CTA, `targets:` plain-words (Phase 2).
- Port player + b1 pattern to the other 26 board protocols (Phase 3).

## SEQUENCE + VERSION
Piece 3 (lint) → Piece 1 (b1) → Piece 2 (player). Bump v7.20.246. Commit per piece. Fable precision-corrects each before the next. `pre-ship-check --all` GREEN + staging live-drive before prod.

---

## ⭐ RECON-VERIFIED (Opus, 2026-07-21h — byte-level; supersedes spec assumptions where noted)

**Seam correction — the spec's `needsTextPicker` setup-picker assumption (line 15) is WRONG for guided lessons.**
- Guided planning lessons SKIP the setup picker: `wml-app.js:752` — `if (state.task) selectTask(...)`. Shortcode sets `state.task='planning'` → setup screens (incl. `renderComparisonPoemSelect`) never fire. So `state.poem` / `state.comparisonPoem*` are NOT set by any picker for a real lesson.
- The REAL seam = the **code-served planning chain** (`_planChain*` in `frontend/wml-assessment.js`), which intercepts `sendCanvasMessage` and plays fixed turns with quick-action chips, NO API round-trip. Renderers: `_renderPlanChainQuestion` (:12965), `_appendPlanChainActions` (:12999), stage detection `_planPreChainStageFor` (:810), stage texts `_planChainQuestionText` (:908), order `_planChainOrder` (:836), beats `_planChainBeat` (:843).
- **Poetry is NOT on this chain.** `_planPreChainActive()` (:749-753) = `task==='planning' && board==='aqa' && (_isLangPaper1()||_isLangPaper2())`. Poetry planning currently opens via the API/protocol (b1-setup.md → LLM). **Piece 1 must add a poetry arm to this chain**, reusing the render/intercept plumbing.

**Comparison-poem picker logic to CLONE (into an inline chain-stage chip bar, NOT the setup screen):** `renderComparisonPoemSelect` (`wml-app.js:2818-2901`).
- Fetch: `fetch(\`${config.restUrl}poems?board=${state.board}&anthology=${state.text}\`, {headers})` → `res.poems` = `[{id,title,poet,poem_text}]`.
- Exclude focus: `.filter(p => p.id !== <focusPoemId>)`.
- On tap set: `state.comparisonPoem=p.id; state.comparisonPoemTitle=p.title; state.comparisonPoemText=p.poem_text||''`. These state fields already exist + are read in the preamble (`wml-app.js:6682-6685`, `6944-6945`, `7327`).
- Off-bank fallback = typed input (the ONE surviving paste; mark `<!-- lint-ok: fallback -->`).

**Server key-map is SOLVED server-side.** REST `poems` route → `poems_option_rows($board,$text)` (`class-rest-api.php:696-708`) walks the canonical slug ladder (`love_relationships_poetry`→`love_relationships`). Client passes `anthology=state.text` raw — no client key-building. Bank storage key = `swml_topics/poems_{sanitize_key(board)}_{sanitize_key(anthology)}` (`class-topic-questions.php:332,774`).

**topicData (poetry topic) fields — verified against `class-topic-questions.php:623-657`:** `focus_poem` (TITLE string, `sanitize_text_field`), `focus_poet`, `comparison_poem`, `comparison_poet`, `question_text`, `question_format` (`'single'` for these). Focus poem TEXT is NOT in topicData — look it up in the bank by matching `focus_poem` title → poem `id`. `topicData` reaches the client via the topic-question fetch (`wml-app.js:6563-6569`, var `topicQuestion`).

**Data-on-target (staging, verified 2026-07-21h):**
- `swml_topics_aqa_love_relationships` = 16 topics. Every real topic has `focus_poem` + `question_text` populated; **`comparison_poem` = BLANK on all** → the picker IS needed (design holds). Also identical twin key `swml_topics_aqa_love_relationships_poetry` (slug ladder covers both).
- `swml_poems_aqa_love_relationships` = **15 poems** ✅. Topic #2 = Conceptual Notes (no focus poem).
- ⚠ **MARKDOWN LEAK — all 15 bank rows:** `title` has LEADING `**` (`"**When We Two Parted"`), `poet` has TRAILING `**` (`"Lord Byron**"`). Same defect already shows in the existing assessment picker. FIX = shared `cleanPoemField()` strip-on-render (robust vs source; Neil #7 shared-surface) — applied to BOTH the new chips and `renderComparisonPoemSelect`. Root option: also clean the bank source via wp eval.

**Theme→cluster map:** Opus authors from the real AQA L&R anthology thematic groupings in the model-answer resources (NOT Fable, NOT invented — literary pairing knowledge). Chips ship with flat "all-15 − focus + Browse" as the working fallback day 1; theme-ordering rides the same piece.

**Piece 1 minimal shippable (kills paste wall = unblocks prod):** poetry chain arm = `greeting(focus-poem+question confirm, code-served from topicData) → comparison-pick(inline chips) → hand to protocol at B.2`. b1-setup.md drops Steps 3–5. Lint CONVERTED promotion (`aqa/poetry/planning` + `aqa/literature/planning`) = LAST step, proves the fix.

**PIPELINE CONFIRMED (decisive, not inferred): poetry planning = CANVAS pipeline.** `wml-app.js:2955-2967` — `planning` was REMOVED from `chatTasks` (v7.14.33: "planning + polishing removed — now canvas-based via EXERCISE_MANIFEST") → routes to `renderCanvasWorkspace` (wml-assessment.js). So the `_planChain` (canvas) IS the seam. ⚠ The `wml-app.js:6636-6713` preamble (comparison-poem-text injection at :6682-6685, topicQuestion at :6692-6707) is the OLD **MAIN-CHAT** greeting (`API.chat`, `state.chatId`, `addMessage`) used by the surviving `chatTasks` (assessment/essay_plan/model_answer/conceptual_notes) — NOT poetry planning. Do not wire Piece 1 there.

**Two intercept sites (DUAL PIPELINE — wire BOTH):** `wml-assessment.js:13189` (assessment twin) + `:23266` (training twin). Pattern per site: `if (_planPreChainActive()) { stage = _planPreChainStageFor(history); if (stage) { render, return; } }`. Add the poetry arm alongside — either extend `_planPreChainActive`+`_planPreChainStageFor` with a poetry branch, or a parallel `_poetryPlanChain*` set (poetry stages differ structurally: async bank-fetch chips vs text predictions → a PARALLEL set is cleaner, reuses `_renderPlanChainQuestion`/`_appendPlanChainActions` render plumbing + the intercept shape).

**⚠ LAST RECON THREAD (must resolve at build, do NOT assume):** how does the CANVAS poetry-planning preamble get the FOCUS + COMPARISON poem full text into the API context (so b4/b5 quote validation has it)? The `:6682-6685` comparison-text injection is MAIN-CHAT only. Find the canvas/router preamble builder (likely server-side `class-protocol-router.php inject_session_context` / a `build_poetry_*_injection` like CN's) and confirm it reads `state.comparisonPoemText` + a focus-poem text. If it doesn't, the greeting stage must set `state.poem/poemTitle/poemAuthor/poemText` (focus, from bank by `topicData.focus_poem` title→id) AND `state.comparisonPoem*` (from chip), and the canvas preamble must inject both. This is the "downstream quote work unchanged" guarantee — verify it end-to-end before calling Piece 1 done (#15).

**⚠ THREAD RESOLVED — and it ENLARGES the build (PHP, not JS-only).** Poetry PLANNING has NO poem-text injection today. `build_poetry_cn_injection` (`class-protocol-router.php:1353`, called at the `$skip_block` :1019) injects poem full text ONLY for Conceptual Notes. For poetry PLANNING the poem text reaches the API **solely via the student's b1 paste (Steps 3–4)** — that is the paste wall's reason to exist. So Piece 1 MUST add planning-side injection:
- **New `build_poetry_planning_injection($context)` in class-protocol-router.php** (mirror `build_poetry_cn_injection` :1353-1460: same `swml_poems_{board}_{anthology}` lookup + slug-ladder, first-non-empty-`poem_text` wins). Inject BOTH the focus poem (id from `topicData.focus_poem` title→bank match) AND the comparison poem (from `state.comparisonPoem`/`comparison_poem` passed in the session context). Gate it on poetry + task=planning; wire it at the `$skip_block` assembly the way :1019 wires CN.
- **Client must pass the comparison poem id/text into the canvas session context** so the router can resolve it (the chip sets `state.comparisonPoem*`; confirm the canvas chat request forwards it — `selectTask` already sends `comparison_poem`/`comparison_poem_title` at wml-app.js:2948-2949, but NOT `comparison_poem_text`; the router re-looks-up text from the bank by id, so id is enough).
- Focus poem id: resolve `topicData.focus_poem` (title) → bank poem `id`. The CN injection already walks the bank rows — reuse that match logic.

**BUILD SPANS 3 LAYERS:** PHP (router injection) + JS (wml-assessment.js poetry chain arm ×2 sites + chips + `cleanPoemField`; wml-app.js state/context forwarding) + protocol markdown (b1-setup.md) + lint promotion + theme map + version bump. This is a multi-layer feature (#15/#16 — plan the whole chain), NOT a JS picker clone. Estimate: substantial; do NOT one-shot without full context budget.

**RECON STATUS: 100% COMPLETE.** Pipeline verified (canvas), seam verified (`_planChain` dual sites), picker-clone-source verified, topicData fields verified, data-on-target verified, markdown leak verified, poem-text-injection gap verified. Build is fully execution-ready against this spec.
