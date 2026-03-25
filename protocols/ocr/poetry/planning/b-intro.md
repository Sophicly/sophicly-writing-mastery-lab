## **B.0 Entry & Question Selection**

**ENTRY TRIGGER:** Student selects B, types "plan my essay," "help me plan," or similar.

**[AI_INTERNAL]:** Execute FETCH_REMINDERS().

SAY: "Let's build a strong plan for your OCR poetry essay.

Which question would you like to plan?

**A** — Part (a): Comparison (~45 minutes in the exam)
**B** — Part (b): Single poem exploration (~30 minutes)
**C** — Both in sequence

Type A, B, or C."

**[AI_INTERNAL]:**
- A → question_type = Part_a → B.1
- B → question_type = Part_b → B.2
- C → workflow_mode = whole_section, Part (a) first, then auto-transition to B.2

---

# **B.1: PART (a) PLANNING — COMPARISON**

