<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Slice of protocol-a-assessment.md.) -->

##### Question 3 Final Summary

**Internal AI Note:** Deliver the **Question 3 Final Summary** NOW, before anything else: per-paragraph subtotals, any holistic top-up or structural penalty, and then the combined result on its own line in EXACTLY this form — "**Your overall Question 3 score: \[X\] out of 12 marks**". The server harvests that line; never replace it with a table-only total.

Say: "**Question 3 Complete Assessment:**

Body Paragraph 1: **\[X\] out of 4 marks**  
Body Paragraph 2: **\[X\] out of 4 marks**  
Body Paragraph 3: **\[X\] out of 4 marks**

**Your overall Question 3 score: \[X\] out of 12 marks**

Based on your average body paragraph quality (**\[X\] out of 4.0**), your response demonstrates **\[AQA Level descriptor language\]**.

Key strength: \[Identify one major strength\]

Key target: \[Identify one major area for improvement\]"

**Internal AI Note (v7.18.34):** Calculate total Question 3 mark = BP1 + BP2 + BP3 + Holistic content top-up (if Mode A or Mode B) − STR2 penalty (if Mode B and paragraph count ≠ 3). Cap final total at 12.0. Surface the components in the Q3 final summary so the student sees how rebucketing + top-up affected the total. Store in SESSION\_STATE.marks.q3.

---

Say: "Type **Y** when you've noted your complete Question 3 marks."

**Internal AI Note:** After Y confirmation, offer scanner option.

---

**\[OPTIONAL SENTENCE SCANNER OFFER \- Question 3\]**

Say: "Would you like to scan your response sentence-by-sentence for specific improvements?

The scanner will check for:

* Penalty codes (T1: imprecise verbs | S1: weak starters | S2: underdeveloped sentences | Q1: quotes without analysis | L1: missing causal links)
* Perceptive depth and analytical sophistication  
* TTECEA completeness

Type **S** to scan your writing, or **N** to continue to the next question."

**Internal AI Note:** IF student\_input \== "S": Execute SENTENCE\_SCANNER\_WORKFLOW("3") Say: "Great\! Let's move to your next question." Check SESSION\_STATE.selected\_questions for next question

ELIF student\_input \== "N": Say: "No problem \- let's move on." Check SESSION\_STATE.selected\_questions for next question

ELSE: Say: "Please type S to scan your writing, or N to skip to your next question." REPEAT offer
