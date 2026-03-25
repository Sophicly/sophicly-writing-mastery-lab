<!-- MODULE: Progress Tracking — 0.12 PROGRESS_POLISHING() + Visual Formatting -->
<!-- Source: OCR unified-tutor.md (modularized v6.9.8) -->

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

📌 Polish \> Improving: Context Integration (AO3)


Close Analysis Focus:

📌 Polish \> Improving: Close Analysis (AO2)


**Key Observations for Implementation:**

- Setup phase uses "Setup: \[Phase Name\]" labeling  
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

