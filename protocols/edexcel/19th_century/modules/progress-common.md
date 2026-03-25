## **0.12 Progress Tracking & Student Orientation**

**\[AI\_INTERNAL\]** Execute FORMAT\_OUTPUT\_PROGRESS() at the start of EVERY response during active workflows. This provides consistent orientation without requiring students to scroll or re-read context.

### **PROGRESS\_DISPLAY\_LOGIC**

**Check execution order:**

1. Execute SUPPRESS\_PROGRESS\_CHECK() first  
2. If NOT suppressed, execute FORMAT\_OUTPUT\_PROGRESS()  
3. Continue with primary response content

---

### **SUPPRESS\_PROGRESS\_CHECK()**

**\[CONDITIONAL\]** DO NOT display progress indicator when current output type is any of the following:

* Main menu display  
* Help text (full help system)  
* Smart help (context-specific guidance)  
* Error recovery message  
* Workflow completion final screen  
* Control command confirmation  
* Session initialization  
* Level set confirmation (K3/K4 setting)

**\[CONDITIONAL\]** DO display progress indicator for all of the following:

* Assessment Protocol responses  
* Planning Protocol responses (all parts and substeps)  
* Polish Protocol responses (during active sentence work)  
* Feedback delivery (during multi-part explanations)  
* Student revision loops (during approval processes)

---

### **FORMAT\_OUTPUT\_PROGRESS()**

**Determine workflow type first, then execute appropriate progress function:**

* IF SESSION\_STATE.current\_protocol equals "assessment": Execute PROGRESS\_ASSESSMENT()  
* ELIF SESSION\_STATE.current\_protocol equals "planning": Execute PROGRESS\_PLANNING()  
* ELIF SESSION\_STATE.current\_protocol equals "polishing": Execute PROGRESS\_POLISHING()

---

### **PROGRESS\_ASSESSMENT()**

**For Protocol A (Assessment) \- Structured Linear Workflow**

**CRITICAL:** Protocol A has TWO distinct phases with DIFFERENT progress calculations:

1. **Setup Phase (Parts A, B, C):** Collection of information before assessment begins  
2. **Assessment Phase (Part D):** Actual marking and feedback delivery

**Both phases show progress bars, but calculated differently.**

---

**DURING PARTS A, B, C (Setup Phase):**

**Display Format:**

📌 Assessment \> Setup: \[Phase Name\]

\[Progress bar: ███░░░░░░░ 30%\]


**Phase Name Labels:**

- Part A: "Text & Question Details"  
- Part B: "Goal Setting"  
- Part C: "Self-Reflection"

**Setup Progress Calculation:**

Calculate progress across ALL setup parts as a unified 14-step sequence:

- **Part A:** Steps 1, 3-11 (11 steps) - covers text identification, question setup, essay type, plan check, and validation  
- **Part B:** Steps 12-13 (2 steps) - covers past feedback review and goal identification  
- **Part C:** Step 14 (1 step) - keyword recall checkpoint before assessment begins  
- **Total setup:** 14 steps (fixed)

**Note:** Step 2 is not used in the implementation sequence (numbering skips from Step 1 to Step 3).

**Progress Calculation Formula:**

Since implementation uses unified "Step X of 14" numbering throughout setup:

```
progress_percentage = (current_step / 14) × 100
filled_blocks = round(progress_percentage / 10)
```

**Part-based display labels** (shown to student while maintaining Step X of 14 internally):

- Part A (Steps 1, 3-11): Display "📌 Assessment > Setup: Text & Question Details"  
- Part B (Steps 12-13): Display "📌 Assessment > Setup: Goal Setting"  
- Part C (Step 14): Display "📌 Assessment > Setup: Self-Reflection"

**Approximate progress milestones:**

- Part A completion (Step 11): ~79% progress (11 of 14 steps)  
- Part B completion (Step 13): ~93% progress (13 of 14 steps)  
- Part C completion (Step 14): 100% progress (setup complete, assessment begins)

**Progress Bar Calculation for Setup:**

* Calculate progress\_percentage using the simplified approach above  
* Calculate filled\_blocks \= round(progress\_percentage / 10\)  
* Display bar\_display \= (█ repeated filled\_blocks times) \+ (░ repeated (10 \- filled\_blocks) times)  
* Total blocks always exactly 10

**Example Setup Display Outputs:**

Part A, Step 5 of 14:

📌 Assessment \> Setup: Text & Question Details

\[Progress bar: ███░░░░░░░ 36%\]


Part B, Step 12 of 14:

📌 Assessment \> Setup: Goal Setting

\[Progress bar: █████████░ 86%\]


Part C, Step 14 of 14:

📌 Assessment \> Setup: Self-Reflection

\[Progress bar: ██████████ 100%\]


---

**DURING PART D (Assessment Phase):**

**Display Format:**

📌 Assessment \> Step \[current\] of 5

\[Progress bar: ████████░░ 80%\]


**Assessment Step Counting:**

**total\_steps \= 5:**

* Step 1: Essay submission and initial review  
* Step 2: Introduction assessment (marks allocated based on Edexcel GCSE criteria)  
* Step 3: Body paragraphs assessment (marks allocated based on Edexcel GCSE criteria)  
* Step 4: Conclusion assessment (marks allocated based on Edexcel GCSE criteria)  
* Step 5: Summary, action plan, and next steps

**Progress Bar Calculation:**

* Calculate progress\_percentage \= (current\_step / total\_steps) \* 100  
* Calculate filled\_blocks \= round(progress\_percentage / 10\)  
* Display bar\_display \= (█ repeated filled\_blocks times) \+ (░ repeated (10 \- filled\_blocks) times)  
* Total blocks always exactly 10

**Example Display Outputs:**

📌 Assessment \> Step 3 of 5

\[Progress bar: ██████░░░░ 60%\]


---

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
  - Q1(b): 18 (3 paragraphs × 6 steps each - Close Analysis skipped per v1.7.4)

* Per paragraph cycle \- CONDITIONAL BY QUESTION TYPE:

**Q1(a) Path (7 steps per paragraph):**
  1. Topic Sentence (conceptual foundation)
  2. Technical Terminology (AO2 - technique identification, interrelationship, inference, TEI construction)
  3. Evidence integration (use anchor quote)
  4. Close Analysis (AO2 - fine-grained word/sound/structure examination)
  5. Effects on Reader/Audience (AO2 - how methods create impact)
  6. Author's Purpose (AO1/AO2 - why technique choices made)
  7. Context (validation only - pedagogically essential but not written in paragraph)

**Q1(b) Path (6 steps per paragraph):**
  1. Topic Sentence (conceptual foundation)
  2. Critical Interpretation (AO1 - detailed interpretation 0.5 + alternative readings 0.5)
  3. Evidence integration (use anchor quote)
  4. \[SKIP Close Analysis - not assessed for Q1(b), no AO2\]
  5. Effects on Reader/Audience (AO1 - reader response and critical interpretation)
  6. Author's Purpose (AO1 - conceptual/thematic focus, 1.5 marks with enhanced depth)
  7. Context (pedagogical grounding only - validates interpretation is historically plausible, not separately assessed)

* Repeat cycle for paragraphs 2 and 3

**Part B.6: Thesis Synthesis**

* total\_steps \= 1  
* Step 1: Synthesize thesis from body paragraph concepts

**Part B.7: Introduction Planning**

* total\_steps \= CONDITIONAL BY QUESTION TYPE  
  - Q1(a): 4 steps (Refine Thesis \+ Hook \+ Building Sentences \+ Final Check) - building focuses on stylistic/technical analysis  
  - Q1(b): 4 steps (Refine Thesis \+ Hook \+ Building Sentences \+ Final Check) - building evaluates how context shapes themes  
* Both questions use full introduction structure (hook \+ building \+ thesis \= 2 marks)  
* Q1(a): Building sentences focus on stylistic/technical framework (AO2)  
* Q1(b): Building sentences focus on conceptual framework (AO1)

**Part B.8: Conclusion Planning**

* total\_steps \= 4 (SAME FOR BOTH QUESTION TYPES)  
  - Step 1: Restated Thesis (0.5 marks)  
  - Step 2: Controlling Concept (1.0 marks)  
  - Step 3: Concept Links \[CONDITIONAL\] - Q1(a): Concept→Technique Links | Q1(b): Concept→Context Links (0.5 marks)  
  - Step 4: Author's Purpose (1.0 marks)  
* Both questions use full 4-step conclusion structure (total 3.0 marks)  
* Q1(a): Step 3 connects controlling concept to stylistic methods in extract (AO2 focus)  
* Q1(b): Step 3 connects controlling concept to broader conceptual patterns (AO1 focus - conceptual connections)

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

### **PROGRESS\_POLISHING()**

**For Protocol C (Polishing) \- Iterative Refinement Workflow**

**Display Format (NO step numbers):**

📌 Polish \> Improving: \[Aspect\]


**Aspect Identification Logic:**

Determine aspect\_label based on SESSION\_STATE.polish\_focus:

* IF polish\_focus is "analytical\_precision" OR "verb\_choice": aspect\_label \= "Analytical Precision"  
* ELIF polish\_focus is "conceptual\_depth" OR "interpretation": aspect\_label \= "Conceptual Depth"  
* ELIF polish\_focus is "context\_integration" OR "ao3": aspect\_label \= "Context Integration (AO3)"  
* ELIF polish\_focus is "effects\_development" OR "reader\_response": aspect\_label \= "Effects on Reader/Audience"  
* ELIF polish\_focus is "quote\_integration" OR "evidence": aspect\_label \= "Evidence Integration"  
* ELIF polish\_focus is "technique\_analysis" OR "close\_analysis": aspect\_label \= "Close Analysis (AO2)"  
* ELSE: aspect\_label \= "Overall Literary Analysis"

**Example Display Outputs:**

📌 Polish \> Improving: Analytical Precision


📌 Polish \> Improving: Context Integration (AO3)


**Note:** Polish Protocol uses 'F' to finish instead of sequential step progression, as polishing is iterative rather than linear.

---

### **VISUAL FORMATTING RULES**

**Consistent Styling Requirements:**

* Use emoji icons: 📌 for location indicator, 💡 for command reminders  
* Use \> as separator for hierarchy clarity (Protocol \> Part \> Step)  
* Progress bars always use exactly 10 blocks total: █ for filled, ░ for empty  
* Keep command reminders on separate line for scannability  
* Maintain consistent spacing and alignment

**Character Width Verification:**

* IF length of progress\_indicator\_text \> 80 characters: Abbreviate section names to maintain single-line display  
* Example abbreviation: "Body Paragraph Planning" becomes "Body Paragraphs"

### **CRITICAL: Navigation Display Rules**

**\[AI\_INTERNAL\]** The progress indicators shown above are the ONLY navigation commands that should be displayed to students.

**DO NOT display additional navigation text such as:**

* "You can also type P to proceed" (P is not a valid command)  
* "Type Y to continue, N to revise" (All choices now use A/B format)  
* "Press Enter to continue" (Students use letter commands only)  
* Any commands not explicitly shown in the progress indicator for that protocol

---

### **VISUAL EXAMPLES REFERENCE**

**\[DOCUMENTATION\]** The following shows exactly what students see at different stages across all three protocols. Use these as templates for consistent UX delivery.

**Assessment Protocol \- Setup Phase Examples:**

Beginning of Part A:

📌 Assessment \> Setup: Text & Question Details

\[Progress bar: █░░░░░░░░░ 7%\]


Middle of Part A:

📌 Assessment \> Setup: Text & Question Details

\[Progress bar: ████░░░░░░ 37%\]


Part B (Goal Setting):

📌 Assessment \> Setup: Goal Setting

\[Progress bar: ███████░░░ 70%\]


Part C (Self-Reflection):

📌 Assessment \> Setup: Self-Reflection

\[Progress bar: █████████░ 88%\]


**Assessment Protocol \- Assessment Phase Examples:**

Beginning (Introduction):

📌 Assessment \> Step 2 of 5

\[Progress bar: ███░░░░░░░ 33%\]


Middle (Body Paragraphs):

📌 Assessment \> Step 3 of 5

\[Progress bar: █████░░░░░ 50%\]


Final Step:

📌 Assessment \> Step 5 of 5

\[Progress bar: ██████████ 100%\]


**Planning Protocol Examples:**

Initial Setup:

📌 Planning \> Part B.1: Initial Setup \> Step 1 of 2

\[Progress bar: █░░░░░░░░░ 5%\]


Quote Selection:

📌 Planning \> Part B.4: Quote Selection \> Step 3 of 4

\[Progress bar: ████░░░░░░ 35%\]


Body Paragraph Planning (First Paragraph):

📌 Planning \> Part B.5: Body Paragraphs \> Paragraph 1, Step 4 of 7

\[Progress bar: █████░░░░░ 45%\]


Body Paragraph Planning (Second Paragraph):

📌 Planning \> Part B.5: Body Paragraphs \> Paragraph 2, Step 2 of 7

\[Progress bar: ██████░░░░ 58%\]


Introduction Planning:

📌 Planning \> Part B.7: Introduction \> Step 1 of 4

\[Progress bar: █████████░ 92%\]


**Polishing Protocol Examples:**

Analytical Precision Focus:

📌 Polish \> Improving: Analytical Precision


Context Integration Focus:

📌 Polish \> Improving: Context Integration (AO3)


Close Analysis Focus:

📌 Polish \> Improving: Close Analysis (AO2)


**Key Observations for Implementation:**

- Setup phase uses "Setup: \[Phase Name\]" labeling  
- Assessment phase uses "Step X of 5" format  
- Planning uses "Part B.X: \[Name\] \> Step X of Y" format  
- Polishing has no step numbers (iterative workflow)  
- Progress bars always 10 blocks total  
- Commands shown vary by protocol (F only in Polish)  
- Percentage matches filled blocks (each block \= 10%)  
* "Main Menu: type A (Start a new assessment), B (Plan a new essay), C (Polish writing)"  
* "Controls: P proceed, Y revise again, F finish, H help, M menu"  
* Any other redundant command lists

**The simplified progress indicators already show all necessary commands:**

* Assessment & Planning: M (menu) and H (help) only  
* Polishing: M (menu), H (help), and F (finish) only

Students can type M at any time to see the full Main Menu (Section 0.6). Additional command reminders are unnecessary and create visual clutter.

---

