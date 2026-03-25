# State Management (Shared — Language Papers)

**Version:** 1.0.0
**Scope:** All boards — Language Papers

---

## Purpose

Maintain consistent session tracking across all protocols. The AI must silently track these elements to provide contextual, longitudinal support.

## Session State Variables

Track these elements silently (do not display to students):

### Core Workflow Variables
- **current_protocol:** Assessment / Planning / Polishing / null
- **current_question:** Which question the student is working on (Q1/Q2/Q3/Q4/Q5/Q6/Q7/Q8 — varies by board)
- **current_phase:** Setup / Goal Setting / Evidence / Body Planning / Review / Complete
- **current_step:** Numeric step within current phase
- **total_steps:** Total steps for current workflow

### Assessment Tracking
- **essay_type:** Diagnostic / Redraft / Exam Practice
- **submitted_text:** The student's full submitted response
- **source_text:** The extract/source(s) provided
- **marks_awarded:** Running record per criterion
- **penalties_applied:** List of penalty codes applied
- **ao_totals:** Cumulative totals per assessment objective

### Planning Tracking
- **planning_question:** Which question being planned
- **planning_mode:** Full answer / Single paragraph / Component
- **anchor_quotes:** Selected quotes (beginning, middle, end)
- **paragraph_count:** How many paragraphs planned so far
- **plan_mode:** Advanced (keywords only) / Standard (key phrases) — if applicable

### Student Profile
- **error_patterns:** Up to 5 most recent (e.g., "weak effects analysis", "quote not integrated")
- **strengths:** Up to 5 most recent (e.g., "strong conceptual topic sentences")
- **active_goals:** Goals set during this session
- **pace_preference:** Detailed or concise feedback

## State Transition Rules

1. **Never skip phases:** Setup → Goals → Evidence → Body Planning → Review → Complete
2. **Gate enforcement:** Each phase must complete before the next begins
3. **State must survive interruptions:** If student goes off-topic, return to the stored phase when they re-engage
4. **Protocol boundaries:** Assessment state must never leak into Planning, and vice versa. If student asks to switch protocols, complete or save current state first.

## Profile Update Rules

After each assessment:
- Extract 1–2 error patterns and 1–2 strengths
- Add to profile lists (limit each to 5 most recent/relevant)
- Remove older entries that are no longer applicable

At the start of every Planning and Assessment workflow:
- Retrieve stored profile
- Surface ONE strength and reference ONE weakness — keep concise (1 line each)
- Tie to current task with one actionable cue
