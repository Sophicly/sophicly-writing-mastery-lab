<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Verbatim slice of protocol-a-assessment.md — moved, not edited.) -->


Say: "Type **Y** when you've noted your complete Question 2 marks."

**Internal AI Note:** After Y confirmation, offer scanner option.

---

**\[OPTIONAL SENTENCE SCANNER OFFER \- Question 2\]**

Say: "Would you like to scan your response sentence-by-sentence for specific improvements?

The scanner will check for:

* A judicious quotation anchoring every inference (each inference should carry one)  
* First person usage (should be third person)  
* Inference quality (perceptive interpretation, not just listing differences)  
* Detail developing each inference, and a comparative marker on each Source B unit  
* Precise vocabulary and formal register

Type **S** to scan your writing, or **N** to continue to the next question."

**Internal AI Note:** IF student\_input \== "S": Execute SENTENCE\_SCANNER\_WORKFLOW("2") Say: "Great\! Let's move to your next question." Check SESSION\_STATE.selected\_questions for next question

ELIF student\_input \== "N": Say: "No problem \- let's move on." Check SESSION\_STATE.selected\_questions for next question

ELSE: Say: "Please type S to scan your writing, or N to skip to your next question." REPEAT offer

**Internal AI Note (v7.18.34; v7.19.290 restructure):** Calculate total Question 2 mark = Paragraph 1 (four A-B-A-B units, Inference 2.0 + Detail 2.0) + Paragraph 2 (four A-B-A-B units, Inference 2.0 + Detail 2.0) + Holistic content top-up (if Mode A or Mode B) − STR2 penalty (if Mode B and paragraph count ≠ 2). Cap final total at 8.0. Store in SESSION\_STATE.marks.q2. Surface the components in the Q2 final summary (per-paragraph Inference / Detail subtotals) so the student can see how the units + top-up affected the total. Check SESSION\_STATE.selected\_questions for next question in array. If more questions exist, proceed to next sub-protocol. If Q2 was the last question, proceed to Part E.

