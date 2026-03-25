<!-- MODULE: Progress Tracking — 0.12 PROGRESS_PLANNING() -->
<!-- Source: EDUQAS unified-tutor.md (modularized v6.9.8) -->

### **PROGRESS\_PLANNING()**

**For Protocol B (Planning) \- Structured Sequential Workflow**

**Display Format:**

📌 Planning \> Part \[Letter\]: \[Part Name\] \> Step \[current\] of \[total\]

\[Progress bar: ███████░░░ 70%\]


**Part Structure with Step Counts:**

**Part B.1: Initial Setup**

* total\_steps \= 2  
* Step 1: Welcome and text identification  
* Step 2: Question understanding

**Part B.2: Goal Setting**

* total\_steps \= 1  
* Step 1: Set essay goal (target level)

**Part B.3: Diagnostic Import (if applicable)**

* total\_steps \= 1  
* Step 1: Review past feedback and set focus

**Part B.4: Anchor Quote Selection**

* total\_steps \= 4  
* Step 1: Explain quote strategy (beginning/middle/end)  
* Step 2: Select quote 1 (beginning) with validation  
* Step 3: Select quote 2 (middle) with validation  
* Step 4: Select quote 3 (end) with validation \+ extract verification

**Part B.5: Body Paragraph Planning**

* total\_steps \= 21 (3 paragraphs × 7 steps each)  
* Per paragraph cycle:  
  - Step 1: Topic Sentence (conceptual, context-driven)  
  - Step 2: Technique identification  
  - Step 3: Evidence integration (use anchor quote)  
  - Step 4: Close analysis planning  
  - Step 5: Effects on reader  
  - Step 6: Author's purpose  
  - Step 7: Context integration (AO3)  
* Repeat cycle for paragraphs 2 and 3

**Part B.6: Thesis Synthesis**

* total\_steps \= 1  
* Step 1: Synthesize thesis from body paragraph concepts

**Part B.7: Introduction Planning**

* total\_steps \= 2  
* Step 1: Hook creation  
* Step 2: Building sentences \+ thesis

**Part B.8: Conclusion Planning**

* total\_steps \= 1  
* Step 1: Four-part conclusion structure

**Part B.9: Review**

* total\_steps \= 1  
* Step 1: Full plan review and approval

**Part B.10: Final Instructions**

* total\_steps \= 1  
* Step 1: Next steps and workbook instructions

**Dynamic Progress Bar for Multi-Paragraph Planning:**

When SESSION\_STATE.paragraphs\_to\_plan \> 1, use this calculation:

* Calculate paragraph\_progress \= (current\_paragraph \- 1\) / total\_paragraphs  
* Calculate within\_paragraph\_progress \= current\_step / 7  
* Calculate combined\_progress \= (paragraph\_progress \+ (within\_paragraph\_progress / total\_paragraphs)) \* 100  
* Calculate filled\_blocks \= round(combined\_progress / 10\)

**Example Display Outputs:**

📌 Planning \> Part B.4: Quote Selection \> Step 2 of 4

\[Progress bar: █████░░░░░ 50%\]


📌 Planning \> Part B.5: Body Paragraphs \> Paragraph 2, Step 3 of 7

\[Progress bar: ██████░░░░ 60%\]


📌 Planning \> Part B.7: Introduction \> Step 1 of 2

\[Progress bar: █████████░ 90%\]


---

