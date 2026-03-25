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

* total\_steps \= CONDITIONAL BY QUESTION TYPE  
    
  - Q1(a): 21 (3 paragraphs × 7 steps each)  
  - Q1(b): 18 (3 paragraphs × 6 steps each \- Close Analysis skipped per v1.7.4)


* Per paragraph cycle \- CONDITIONAL BY QUESTION TYPE:

**Q1(a) Path (7 steps per paragraph):**

1. Topic Sentence (conceptual foundation)  
2. Technical Terminology (AO2 \- technique identification, interrelationship, inference, TEI construction)  
3. Evidence integration (use anchor quote)  
4. Close Analysis (AO2 \- fine-grained word/sound/structure examination)  
5. Effects on Reader/Audience (AO2 \- how methods create impact)  
6. Author's Purpose (AO1/AO2 \- why technique choices made)  
7. Context (validation only \- pedagogically essential but not written in paragraph)

**Q1(b) Path (6 steps per paragraph):**

1. Topic Sentence (conceptual foundation)  
2. Critical Interpretation (AO1 \- detailed interpretation 0.5 \+ alternative readings 0.5)  
3. Evidence integration (use anchor quote)  
4. \[SKIP Close Analysis \- not assessed for Q1(b), no AO2\]  
5. Effects on Reader/Audience (AO1 \- reader response and critical interpretation)  
6. Author's Purpose (AO1 \- conceptual/thematic focus, context can be woven naturally)  
7. Context (AO3 assessment \- 1.0 marks per paragraph, must be written with 2-part structure)  
* Repeat cycle for paragraphs 2 and 3

**Part B.6: Thesis Synthesis**

* total\_steps \= 1  
* Step 1: Synthesize thesis from body paragraph concepts

**Part B.7: Introduction Planning**

* total\_steps \= CONDITIONAL BY QUESTION TYPE  
  - Q1(a): 4 steps (Refine Thesis \+ Hook \+ Building Sentences \+ Final Check) \- building focuses on stylistic/technical analysis  
  - Q1(b): 4 steps (Refine Thesis \+ Hook \+ Building Sentences \+ Final Check) \- building evaluates how context shapes themes  
* Both questions use full introduction structure (hook \+ building \+ thesis \= 2 marks)  
* Q1(a): Building sentences focus on stylistic/technical framework (AO2)  
* Q1(b): Building sentences focus on conceptual framework (AO1)

**Part B.8: Conclusion Planning**

* total\_steps \= 4 (SAME FOR BOTH QUESTION TYPES)  
  - Step 1: Restated Thesis (0.5 marks)  
  - Step 2: Controlling Concept (1.0 marks)  
  - Step 3: Concept Links \[CONDITIONAL\] \- Q1(a): Concept→Technique Links | Q1(b): Concept→Context Links (0.5 marks)  
  - Step 4: Author's Purpose (1.0 marks)  
* Both questions use full 4-step conclusion structure (total 3.0 marks)  
* Q1(a): Step 3 connects controlling concept to stylistic methods in extract (AO2 focus)  
* Q1(b): Step 3 connects controlling concept to historical/social factors (AO3 focus)

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


📌 Planning \> Part B.7: Introduction \> Step 1 of 4

\[Progress bar: █████████░ 90%\]


---

