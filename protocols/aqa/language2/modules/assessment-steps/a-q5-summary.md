<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Slice of protocol-a-assessment.md.) -->

##### SECTION B FINAL MARK

**Internal AI Note:** Calculate the total Section B mark FIRST, applying the WC penalty for Diagnostic submissions where one was set:

**Internal AI Note:** IF SESSION\_STATE.assessment\_type \== "Diagnostic" AND SESSION\_STATE.penalties.q5\_WC \> 0:

SET raw\_total \= SESSION\_STATE.marks.q5\_ao5 \+ SESSION\_STATE.marks.q5\_ao6
SET adjusted\_total \= MAX(0, raw\_total \- SESSION\_STATE.penalties.q5\_WC)
SET SESSION\_STATE.marks.q5\_total \= adjusted\_total

ELSE:

SET SESSION\_STATE.marks.q5\_total \= SESSION\_STATE.marks.q5\_ao5 \+ SESSION\_STATE.marks.q5\_ao6

**Internal AI Note:** The "**Total Section B score:**" line below is the ONE authoritative total — the server harvests it. It must always show the FINAL total (after any WC penalty), never the raw pre-penalty figure. Show the penalty arithmetic on the lines above it when a penalty applies.

Say: "**Your complete Section B Question 5 mark:**

AO5 (Content & Organisation): **\[X\] out of 24 marks**  
AO6 (Technical Accuracy): **\[X\] out of 16 marks**  
\[Only if a WC penalty applies, add these two lines:\]  
Raw mark (AO5 \+ AO6): **\[raw\_total\]/40**  
WC Penalty: **\-\[SESSION\_STATE.penalties.q5\_WC\] marks**  
**Total Section B score: \[SESSION\_STATE.marks.q5\_total\] out of 40 marks**

Overall: \[Summary of key strengths and key areas for improvement\]

Key strength: \[Identify one major strength\]

Key target: \[Identify one major area for improvement\]"

---

Say: "Type **Y** when you've noted your complete Section B marks."

**Internal AI Note:** After Y confirmation, offer scanner option.

---

**\[OPTIONAL SENTENCE SCANNER OFFER\]**

Say: "Would you like to scan your writing sentence-by-sentence for specific technical improvements?

The scanner will:

* Check each sentence for AO5 issues (clarity, precision, cohesion)  
* Check each sentence for AO6 issues (punctuation, grammar, spelling)  
* Suggest quick fixes for any problems found

Type **S** to scan your writing, or **N** to proceed to your action plan."

**Internal AI Note:** IF student\_input \== "S": Execute SENTENCE\_SCANNER\_WORKFLOW("Section B") Say: "Great\! Let's review your action plan now." Proceed to Part E

ELIF student\_input \== "N": Say: "No problem \- let's move to your action plan." Proceed to Part E

ELSE: Say: "Please type S to scan your writing, or N to skip to your action plan." REPEAT offer
