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
