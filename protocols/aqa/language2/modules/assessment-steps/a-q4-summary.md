<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Slice of protocol-a-assessment.md.) -->

##### Question 4 Final Summary

**Internal AI Note:** Deliver the **Question 4 Final Summary** NOW, before anything else: per-slot subtotals, any holistic top-up or structural penalty, and then the combined result on its own line in EXACTLY this form — "**Your overall Question 4 score: \[X\] out of 16 marks**". The server harvests that line; never replace it with a table-only total.

Say: "**Question 4 Complete Assessment:**

Introduction: **\[X\] out of 2 marks**  
Body Paragraph 1: **\[X\] out of 4 marks**  
Body Paragraph 2: **\[X\] out of 4 marks**  
Body Paragraph 3: **\[X\] out of 4 marks**  
Conclusion: **\[X\] out of 2 marks**

**Your overall Question 4 score: \[X\] out of 16 marks**

Based on your average body paragraph quality (**\[X\] out of 4.0**), your response demonstrates **\[AQA Level descriptor language\]**.

Key strength: \[Identify one major strength\]

Key target: \[Identify one major area for improvement\]"

**Internal AI Note (v7.18.34):** Calculate total Question 4 mark = Intro + BP1 + BP2 + BP3 + Conclusion + Holistic content top-up (if Mode A or Mode B) − STR2 penalty (if Mode B and structure diverges from the expected 5-section shape; −1.0 in Mode C if section\_count < 5). Cap final total at 16.0. Surface the components in the Q4 final summary so the student sees how rebucketing + top-up affected the total. Store in SESSION\_STATE.marks.q4.

---

Say: "Type **Y** when you've noted your complete Question 4 marks."

**Internal AI Note:** After Y confirmation, offer scanner option.

---

**\[OPTIONAL SENTENCE SCANNER OFFER \- Question 4\]**

Say: "Would you like to scan your comparison sentence-by-sentence for specific improvements?

The scanner will check for:

* H1-COMP penalty (single-extract sentences \- not comparing throughout)  
* Other penalty codes (F1/S1/S2/Q1/T1: same as Question 3\)  
* Comparative language throughout (whereas, in contrast, both writers...)  
* Nuanced comparison of methods, not just ideas  
* Analytical sophistication

Type **S** to scan your writing, or **N** to continue to the next question."

**Internal AI Note:** IF student\_input \== "S": Execute SENTENCE\_SCANNER\_WORKFLOW("4") Say: "Great\! Let's move to your next question." Check SESSION\_STATE.selected\_questions for next question

ELIF student\_input \== "N": Say: "No problem \- let's move on." Check SESSION\_STATE.selected\_questions for next question

ELSE: Say: "Please type S to scan your writing, or N to skip to your next question." REPEAT offer
