## **0.12 Progress Tracking & Student Orientation**

**\[AI\_INTERNAL\]** Display the progress indicator at the start of every response during active workflows. This provides consistent orientation without requiring students to scroll or re-read context.

### **PROGRESS\_DISPLAY\_LOGIC**

**Check execution order:**

1. Check if progress display should be suppressed based on message type  
2. If not suppressed, display the appropriate progress indicator  
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

**Determine workflow type first, then display appropriate progress indicator:**

* IF SESSION\_STATE.current\_protocol equals "assessment": Display assessment progress indicator  
* ELIF SESSION\_STATE.current\_protocol equals "planning": Display planning progress indicator  
* ELIF SESSION\_STATE.current\_protocol equals "polishing": Display polishing progress indicator

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

📌 Assessment \> Setup: \[Phase Name\] \> Step \[current\] of \[total\]

\[Progress bar: ███░░░░░░░ 30%\]


**Phase Name Labels:**

- Part A: "Text & Question Details" (total\_steps \= 8\)  
- Part B: "Goal Setting" (total\_steps \= 1\)  
- Part C: "Self-Reflection" (total\_steps \= 3-5, typically 4\)

**Step Counting Logic:**

- **Part A:** Display "Step \[1-8\] of 8" as student progresses through 8 setup questions  
- **Part B:** Display "Step 1 of 1" (single goal-setting question)  
- **Part C:** Display "Step \[current\] of \[total\_c\_questions\]" based on how many self-assessment questions are asked

**Setup Progress Calculation:**

Calculate progress across ALL setup parts as a percentage of total setup:

- Part A has 8 steps (questions 1-8 in Part A)  
- Part B has 1 step  
- Part C has variable steps (depends on number of self-assessment questions, typically 3-5)  
- **Total setup steps ≈ 12-14 steps**

Formula:

- IF in Part A: current\_step\_in\_part\_a / 8 × 100 \= percentage through Part A  
- IF in Part B: Add 8 (Part A complete) \+ current\_step / 1 × 100  
- IF in Part C: Add 9 (Parts A+B complete) \+ current\_step / total\_c\_questions × remaining percentage

**Simplified approach:** Divide setup into thirds:

- Part A (steps 1-8): Show 0-60% progress (increment by \~7.5% per step)  
- Part B (1 step): Show 70% progress  
- Part C (3-5 questions): Show 75-95% progress (increment by \~5-7% per question)

**Progress Bar Calculation for Setup:**

* Calculate progress\_percentage using the simplified approach above  
* Calculate filled\_blocks \= round(progress\_percentage / 10\)  
* Display bar\_display \= (█ repeated filled\_blocks times) \+ (░ repeated (10 \- filled\_blocks) times)  
* Total blocks always exactly 10

**Example Setup Display Outputs:**

Part A, Step 3 of 8:

📌 Assessment \> Setup: Text & Question Details \> Step 3 of 8

\[Progress bar: ██░░░░░░░░ 22%\]


Part B:

📌 Assessment \> Setup: Goal Setting \> Step 1 of 1

\[Progress bar: ███████░░░ 70%\]


Part C, Question 2 of 4:

📌 Assessment \> Setup: Self-Reflection \> Step 2 of 4

\[Progress bar: ████████░░ 82%\]


---

**DURING PART D (Assessment Phase):**

**Display Format:**

📌 Assessment \> Step \[current\] of 6

\[Progress bar: ████████░░ 80%\]


**Assessment Step Counting:**

**total\_steps \= 6:**

* Step 1: Essay submission and initial review  
* Step 2: Introduction assessment (4 marks)  
* Step 3: Body paragraphs assessment (7.5+7.5+7.5 marks \= 22.5)  
* Step 4: Conclusion assessment (5.5 marks)  
* Step 5: **AO4** assessment (8 marks \- assessed for all modern drama/prose texts)  
* Step 6: Summary, action plan, and next steps

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
* Step 1 of 2: Welcome and text identification (displays 20% progress)  
* Step 2 of 2: Question understanding (displays 40% progress)

**Progressive Percentage Display for Initial Setup:**

- After Step 1 of 2 (text identification): 20% complete  
- After Step 2 of 2 (question understanding): 40% complete  
- Transition to goal setting: 60% complete  
- Goal setting confirmation: 80% complete  
- Ready to begin planning: 100% Initial Setup complete

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
  - Step 1: **Topic** Sentence (conceptual, context-driven)  
  - Step 2: **Technique** identification  
  - Step 3: **Evidence** integration (use anchor quote)  
  - Step 4: **Close analysis** planning  
  - Step 5: **Effects** on reader  
  - Step 6: **Author's purpose**  
  - Step 7: **Context** integration (**AO3**)  
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

### **PROGRESS\_POLISHING()**

**For Protocol C (Polishing) \- Iterative Refinement Workflow**

**Display Format (NO step numbers):**

📌 Polish \> Improving: \[Aspect\]


**Aspect Identification Logic:**

Determine aspect\_label based on SESSION\_STATE.polish\_focus:

* IF polish\_focus is "analytical\_precision" OR "verb\_choice": aspect\_label \= "Analytical Precision"  
* ELIF polish\_focus is "conceptual\_depth" OR "interpretation": aspect\_label \= "Conceptual Depth"  
* ELIF polish\_focus is "context\_integration" OR "ao3": aspect\_label \= "Context Integration (**AO3**)"  
* ELIF polish\_focus is "effects\_development" OR "reader\_response": aspect\_label \= "Effects on Reader/Audience"  
* ELIF polish\_focus is "quote\_integration" OR "evidence": aspect\_label \= "Evidence Integration"  
* ELIF polish\_focus is "technique\_analysis" OR "close\_analysis": aspect\_label \= "Close Analysis"  
* ELSE: aspect\_label \= "Overall Literary Analysis"

**Example Display Outputs:**

📌 Polish \> Improving: Analytical Precision


📌 Polish \> Improving: **Context** Integration (**AO3**)


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

📌 Assessment \> Setup: Text & Question Details \> Step 1 of 8

\[Progress bar: █░░░░░░░░░ 7%\]


Middle of Part A:

📌 Assessment \> Setup: Text & Question Details \> Step 5 of 8

\[Progress bar: ████░░░░░░ 37%\]


Part B (Goal Setting):

📌 Assessment \> Setup: Goal Setting \> Step 1 of 1

\[Progress bar: ███████░░░ 70%\]


Part C (Self-Reflection):

📌 Assessment \> Setup: Self-Reflection \> Step 3 of 4

\[Progress bar: █████████░ 88%\]


**Assessment Protocol \- Assessment Phase Examples:**

Beginning (Introduction):

📌 Assessment \> Step 2 of 6

\[Progress bar: ███░░░░░░░ 33%\]


Middle (Body Paragraphs):

📌 Assessment \> Step 3 of 6

\[Progress bar: █████░░░░░ 50%\]


Final Step:

📌 Assessment \> Step 6 of 6

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

📌 Planning \> Part B.7: Introduction \> Step 1 of 2

\[Progress bar: █████████░ 92%\]


**Polishing Protocol Examples:**

Analytical Precision Focus:

📌 Polish \> Improving: Analytical Precision


Context Integration Focus:

📌 Polish \> Improving: **Context** Integration (**AO3**)


Close Analysis Focus:

📌 Polish \> Improving: Close Analysis


**Key Observations for Implementation:**

- Setup phase uses "Setup: \[Phase Name\] \> Step X of Y" format  
- Assessment phase uses "Step X of 6" format  
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

### **ANTI-HARDCODING IMPLEMENTATION EXAMPLES**

**\[AI\_INTERNAL\]** The following examples demonstrate correct vs. incorrect progress tracking implementation to prevent hardcoded responses.

**❌ INCORRECT (Hardcoded \- Don't Do This):**

\# Always shows "Step 1 of 6" regardless of actual position

📌 Assessment \> Step 1 of 6

\[Progress bar: ██░░░░░░░░ 16%\]

This hardcoded approach fails because:

- Does not track actual workflow position  
- Shows wrong step number throughout entire workflow  
- Progress bar doesn't reflect real progress  
- Confuses students about where they are

**✅ CORRECT (Dynamic \- Do This):**

\# Dynamically calculates current step based on SESSION\_STATE variables

IF SESSION\_STATE.assessment\_step \== 2:

📌 Assessment \> Step 2 of 6

\[Progress bar: ███░░░░░░░ 33%\]

IF SESSION\_STATE.assessment\_step \== 5:

📌 Assessment \> Step 5 of 6

\[Progress bar: ████████░░ 83%\]

This dynamic approach works because:

- Reads actual position from SESSION\_STATE.assessment\_step  
- Calculates progress percentage: (current\_step / total\_steps) × 100  
- Updates filled\_blocks dynamically: round(progress\_percentage / 10\)  
- Displays accurate progress at every stage

**Key Implementation Rules:**

1. **Never hardcode step numbers** \- Always read from SESSION\_STATE variables  
2. **Calculate percentages dynamically** \- Use formulas, not fixed values  
3. **Update state variables** \- Increment counters as workflow progresses  
4. **Validate before displaying** \- Check state exists before showing progress

**Example of Proper State-Based Display:**

current\_step \= SESSION\_STATE.planning\_substep  \# Read current position

total\_steps \= 7  \# Body paragraph has 7 TTECEA elements

progress\_percentage \= (current\_step / total\_steps) \* 100

filled\_blocks \= round(progress\_percentage / 10\)

Display: 📌 Planning \> Part B.5: Body Paragraphs \> Paragraph 2, Step {current\_step} of {total\_steps}

Display: \[Progress bar: {"█" \* filled\_blocks}{"░" \* (10 \- filled\_blocks)} {progress\_percentage}%\]

This approach ensures progress indicators always reflect actual workflow state, providing accurate orientation for students throughout their session.

---

