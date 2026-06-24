# WML-SMOKE-TEST.md — manual regression gate

**Plugin:** sophicly-writing-mastery-lab · **Last verified version:** 7.19.653 · **Last run:** 2026-06-24 (staging)

No automated tests exist for WML. This is the repeatable manual gate. **Run the full matrix on STAGING before every production ship** of any change that touches: the canvas, either chat pipeline, the migrate/heal chain, saved doc shape, the quiz engine, or boot/SPA wiring. Trivial copy/protocol-markdown edits are exempt.

Environment: staging `runcloud@18.133.5.229`, deploy via `deploy-staging.sh`. Open browser console for the whole run — **any red error = fail**, investigate before prod.

---

## 0. Boot & SPA navigation
- [ ] Hard-load a WML lesson page. Console shows `[WML boot] evaluation #1` **exactly once** (no duplicate boot — single-boot guard `window.__swmlBooted`, v7.19.653).
- [ ] Soft-nav away (Focus SPA) to another lesson and back. Canvas renders once per postId — no double/triple render, no duplicate chat panels.
- [ ] No uncaught errors in console on either path.

## 1. Canvas load + SAVE (the load-bearing round-trip)
For each cell in the matrix below: open the canvas, confirm it renders the right scaffold, **type into a section box, trigger save, reload the page, confirm the text persisted** (save→load→decode round-trip, not just the DB write).
- [ ] Edit-lock holds: clicking in the GAP between section blocks does NOT accept typing; only inside a `sectionBlock` (v7.19.649).
- [ ] No content loss or duplicated sections after reload.

### Matrix — run every cell
| Subject | Phase | Topic |
|---------|-------|-------|
| Language **P1** | diagnostic | topic 1 + one later topic |
| Language **P1** | redraft    | topic 1 + one later topic |
| Language **P2** | diagnostic | topic 1 + one later topic |
| Language **P2** | redraft    | topic 1 + one later topic |

(Spot-check at least one Literature essay topic too — multi-AO scaffold differs from Language.)

## 2. Both chat pipelines (dual-pipeline drift is a known bug class)
- [ ] **Main chat / planning** (`sendChat`): send a message, AI replies, reply renders formatted. Plan element confirm (`@CONFIRM_ELEMENT`) saves to plan.
- [ ] **Canvas chat / assessment** (`sendCanvasMessage`): send a message in the assessment canvas, AI replies, reply renders.
- [ ] Marker-driven canvas fills run in BOTH pipelines (feedback boxes / `@FIELD_SET` / section fills appear when the reply carries them, no-op silently when it doesn't).

## 3. Assessment complete + Mark Complete
- [ ] Run an assessment to completion. Mark Complete button goes **dormant → ready (pulses) → done**.
- [ ] Re-enter a completed assessment: chat history restored, button shows **done**.

## 4. Creative Writing (CW) steps 1–4
- [ ] CW project loads; Steps 1–3 scaffolds render with their boxes/checkboxes.
- [ ] Step 2 + Step 3 checkboxes tick.
- [ ] **Step 4 Story-Spine autofill:** agree the six beats with Sophia → `cw-step-4-beat1..6` fill (live via `@FIELD_SET`, and the deterministic `applySpineSynthesis()` backstop fills them at synthesis even if a marker is omitted). v7.19.650–.651.
- [ ] Reload a CW step — content persists (per-project key path).

## 5. Quiz record + resume (this session's bug)
- [ ] Answer an MSQ and an FQ — score records, no "couldn't record that one" error.
- [ ] Leave mid-round, return / resume the round, answer another question — **still records** (stateless `resolve_quiz_question()` rebuilds from markdown by id; not dependent on the per-user bank slot). v7.19.643–.647.
- [ ] Confirm no PHP 500 in console/network on any answer submit.

---

## Per-change sanity (from CLAUDE.md WML pre-ship checklist)
- [ ] Traced the full click path: click → function → render → state change; no second handler also fires.
- [ ] Checked for dual event bindings (`.onclick =` AND `.addEventListener` on the same element).
- [ ] Verified screen transitions: old screen cleared before new one renders.
- [ ] Tested the async path BOTH ways (data-before-click AND click-before-data).
- [ ] Validation passed: `node --check` on every changed JS, `php -l` + brace-count on every changed PHP.

## On any failure
Stop. Do not ship to prod. Go to the BUG FIX SOP (CLAUDE.md): investigate root cause, don't patch the symptom.
