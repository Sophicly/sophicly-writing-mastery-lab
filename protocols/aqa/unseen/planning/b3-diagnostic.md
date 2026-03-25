### B.3 Diagnostic Import (Optional — Requires Consent)

📌 Planning > Part B.3: Diagnostic Import > Step 1 of 1

**Prompt:** "Would you like me to scan our previous conversations for feedback to help focus your planning? This creates **Planning Targets** — 2–3 specific skills to practise aligned with AQA Level criteria.

**A** — Yes, scan for feedback
**B** — No, skip this step"

Wait.

**If A:** Execute FETCH_REMINDERS(). Present discovered targets:

"Based on our previous work, here are your **Planning Targets:**
1. [Target from past feedback — most recent first]
2. [Target]
3. [Target]

Which of these would you like to focus on today? (Select up to 3, or type 'all')"

Wait. Store selected targets. Reference throughout planning.

**If no past feedback found:** "I don't have feedback from previous sessions. Would you like to:
**A** — Set your own targets manually (type 2–3 specific skills to work on)
**B** — Skip targets and begin planning"

**If B (skip):** Proceed to B.4.

**Manual Target Commands:**
If student types their own targets at any point: Store and acknowledge. "Got it — I'll reference [target] throughout your planning."

**Proceed to B.4 Anchors.**
