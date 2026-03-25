# WML BACKLOG — Complete List

**Last updated:** 21 March 2026 (v7.12.31)

---

## P0 — Assessment Architecture

| # | Item | Notes |
|---|------|-------|
| 1 | **Mark Complete during active session** | Real-time detection checks `state.plan.total_score && state.plan.grade`. Content-based detection (Total+Grade in same message) added v7.12.23. Grade regex broadened v7.12.25 for `Grade: Level 3` patterns. Always-visible button with dormant/ready/done states added v7.12.24-31. Test thoroughly across different AI output formats. |
| 2 | **Deadline progress bar dynamic colours** | Thresholds implemented in `formatCountdown()` (6+ days=animated, 3-5=yellow, 1-2=orange, overdue=red) but bar doesn't re-render when days change mid-session. Persistent green on diagnostic re-entry added v7.12.30. |
| 3 | **W1 penalty inconsistency** | AI says -5 early, 0 in final summary. Protocol is correct — AI compliance issue. Needs protocol-level enforcement or preamble guard. |

## P1 — UX Polish

| # | Item | Notes |
|---|------|-------|
| 4 | **Entrance animation** | Assessment panels still "pop" rather than smooth fade. Consider flex-basis animation or pre-reserved placeholder approach. |
| 5 | **Grade quick action buttons on first message** | Fixed in v7.12.23 (added to Clear Chat handler). Verify on fresh assessment entry from stepper. |
| 6 | **Copy Assessment button** | Regex broadened in v7.12.15. Verify on current AI output format. |
| 7 | **Task selection overlay on page load** | Neil saw elements overlapping. Cleared on reload — possible caching issue. Investigate `transitionSetup` DOM cleanup. |
| 8 | **Comments stuck at top of page** | When opening canvas, TipTap comments are positioned at the top of the document rather than attached to the commented text. Likely a positioning calculation issue on canvas init. |
| 9 | **Score Summary not updating when scores change** | SA dropdowns save the first value only. When AI gives updated scores, the document outline panel and Score Summary section don't reflect the change. Investigate SA dropdown save logic. |

## P2 — Protocol/AI

| # | Item | Notes |
|---|------|-------|
| 10 | **Mark Complete timing in protocol** | Should appear after student responds to final Hattie question, not when scores are first extracted. |
| 11 | **Multi-select AO follow-up** | AI should ask "how" students plan to target those AOs after selection. |
| 12 | **AO4 for 19th century** | Feedback only, no marks. Protocol update needed. |
| 13 | **Assessment protocol complete run** | Must reliably complete: Introduction → Body ×3 → Conclusion → AO4 → Summary. Prerequisite for Phase 2. |
| 14 | **Deep protocol audit: remove panel save references** | Search ALL protocol files for panel/confirm language. Legacy references from old chat-only system. |
| 15 | **Standardise SOPs** | Formalise assessment flow learnings into protocol files. |
| 16 | **Protocol sidebar step detection too eager** | Conclusion step marked complete before feedback received. Detection regex matches `Conclusion` alone without requiring assessment/marks qualifier. Tighten the regex. |

## P3 — Phase 2 Architecture

| # | Item | Notes |
|---|------|-------|
| 17 | **Planning protocol migration to canvas** | Same interface as assessment but with planning protocol. The big next feature. |
| 18 | **Outlining step** | New step between planning and polishing. |
| 19 | **Polishing in canvas** | Student rewrites essay using outline. |
| 20 | **Free Practice horizontal grid mode** | Same cards as stepper but in a 2-3 column grid, no connector line, no locks, no gating. |
| 21 | **Re-entry behaviour** | Clicking a completed step opens saved canvas with chat history restored. Diagnostic=read-only essay, Assessment=marked doc+chat, Planning=plan doc+chat, Polishing=polished doc+chat. |

## HIGH — UX Features

| # | Item | Notes |
|---|------|-------|
| 22 | **Chat saved visual indicator** | Subtle "✓ Chat saved" status in assessment chat. |
| 23 | **Deadline tooltip** | Click "Day 4, 7 days left" → popup with actual due date. |
| 24 | **AI auto-highlight 3 mark-loss areas** | After assessment, AI highlights 3 areas in document with comments (AI avatar = Sophicly logo). |
| 25 | **Canvas pan ability** | Currently missing. Google Docs-style hand-drag panning. |
| 26 | **Canvas zoom % input** | Google Docs-style presets + custom percentage input. |

## MEDIUM — Feature Backlog

| # | Item | Notes |
|---|------|-------|
| 27 | Reference Panel | View past documents alongside current work. |
| 28 | TOC links | Click section in table of contents to scroll to it in document. |
| 29 | TipTap tables | Native table support in editor. |
| 30 | Essay injection optimisation | Improve how essay text is injected into the canvas document. |
| 31 | Tutor sign-off | Role-restricted mark complete — only tutors can sign off. |
| 32 | Essay plan migration | Old chat plans → canvas format conversion. |
| 33 | EDUQAS/Edexcel mark splits | Different AO weightings per board. |
| 34 | Language Paper templates | Reading + writing sections in canvas document. |
| 35 | SureForms PDF generation | Generate PDF reports from assessment data. |
| 36 | Auto-insert assessment into feedback section | AI feedback auto-populates document feedback sections. |
| 37 | Database overwrite behaviour | When student re-does a completed assessment, does it overwrite the phase meta? Confirm and decide: keep history or overwrite. |

## LOW — Technical Debt & Polish

| # | Item | Notes |
|---|------|-------|
| 38 | Console cleanup | Remove dev `console.log` statements before production. |
| 39 | ScrollTrigger fix | GSAP ScrollTrigger reference runs before library loads. `Uncaught ReferenceError: ScrollTrigger is not defined` in console. |
| 40 | Cover export | PDF/image export of cover page. |
| 41 | Creative writing multi-doc | Linked documents for scenes/chapters. |
| 42 | Keyboard shortcuts | Ctrl+S save, Ctrl+B bold, etc. |
| 43 | Inline editing AI | Select text → AI rewrites suggestion. |
| 44 | Badges loading delay | Sidebar badges flash on load. |

## NEW — From Session 10 (v7.12.22-31)

| # | Item | Notes |
|---|------|-------|
| 45 | **Phase Complete card gamification** | Tie into XP/badges when gamification plugin is built. Card works but is plain. |
| 46 | **Copy Assessment → scroll to document section** | When clicking "Copy Assessment Only", scroll the document to the matching section and highlight it. |
| 47 | **Creative writing 30+ step scalability** | Scrollable stepper built. May need collapsed phases (completed → single summary line) for very long flows. |
| 48 | **Document sidebar step detection as a skill** | Document how content-based keyword detection maps AI responses to sidebar steps. |
| 49 | **Copy Assessment + multi-select as skills** | Document both `extractAssessmentContent()` and the AO multi-select toggle pattern as reusable skills. |
| 50 | **`[ASSESSMENT_COMPLETE]` code word in protocol** | Add to assessment protocol final summary instruction so AI always includes it. Currently detection works without it (Total+Grade), but code word is a guaranteed trigger. |
| 51 | **Mark Complete button placement consistency** | Diagnostic = bottom-right panel, Assessment = bottom-left panel. Consider unified placement. |
| 52 | **Go to Assessment button styling** | Button works (v7.12.30) but needs brand-consistent styling. Currently inline purple gradient. |

---

## COMPLETED THIS SESSION (v7.12.22-31)

- ✅ `initAssessmentState()` unified function — all 3 entry paths
- ✅ Deadline bar → green on diagnostic submit (persistent on re-entry)
- ✅ Content-based assessment complete detection (Total+Grade in same message)
- ✅ `[ASSESSMENT_COMPLETE]` code word support + stripping from display
- ✅ Grade buttons after Clear Chat
- ✅ Always-visible Mark Complete with dormant/ready/done states
- ✅ Grade regex broadened for `Grade: Level 3 (Grade 4)` patterns
- ✅ Better early-click confirmation wording
- ✅ Diagnostic sub-step shows complete when essay exists
- ✅ Button text centering
- ✅ Disabled "Complete" state after marking complete (green, not grey)
- ✅ Confirm modal z-index fix (100 → 10000)
- ✅ Double checkmark fix
- ✅ Go to Assessment navigation button from diagnostic
- ✅ Icon-btn pattern for collapsed sidebar support
- ✅ `setAssessBtnState()` helper for clean state management
