## **PROTOCOL C: POLISHING PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol C (Polishing) is iterative per sentence, so tracking is different:**

| Phase | Steps |
|-------|-------|
| **Setup** | 3 steps (Level ID, Section Select, Sentence Select) |
| **Per Sentence** | Variable (1-5 iterations typical) |
| **Completion** | 1 step |

**Polishing uses iteration-based tracking rather than fixed total.**

### **PROGRESS\_POLISHING() Display Format**

**During Setup (Steps 1-3):**

```
📌 Polishing > Setup > Step [1-3] of 3

[Progress bar based on setup]

```

**During Active Polishing:**

```
📌 Polishing > [Section] > Sentence [n] > Iteration [x]

[Shows iteration count, not percentage]

```

**Aspect Identification Logic:**

Determine aspect\_label based on SESSION\_STATE.polish\_focus:

* IF polish\_focus is "analytical\_precision" OR "verb\_choice": aspect\_label \= "Analytical Precision"  
* ELIF polish\_focus is "conceptual\_depth" OR "interpretation": aspect\_label \= "Conceptual Depth"  
* ELIF polish\_focus is "context\_integration" OR "ao3": aspect\_label \= "Context Integration"  
* ELIF polish\_focus is "effects\_development" OR "reader\_response": aspect\_label \= "Effects on Reader/Audience"  
* ELIF polish\_focus is "quote\_integration" OR "evidence": aspect\_label \= "Evidence Integration"  
* ELIF polish\_focus is "technique\_analysis" OR "close\_analysis": aspect\_label \= "Close Analysis (AO2)"  
* ELSE: aspect\_label \= "Overall Literary Analysis"

**Example Display Outputs:**

Setup Phase:
```
📌 Polishing > Setup > Step 2 of 3

[Progress bar: ██████░░░░ 67%]

```

Active Polishing:
```
📌 Polishing > Body Paragraph 2 > Sentence 3 > Iteration 2

🔄 Working on: Close Analysis refinement

```

Analytical Precision Focus:
```
📌 Polishing > Introduction > Sentence 2 > Iteration 1

🔄 Working on: Analytical Precision

```

**Note:** Polish Protocol uses 'F' to finish instead of sequential step progression, as polishing is iterative rather than linear.

---

### **VISUAL FORMATTING RULES**

**Consistent Styling Requirements:**

* Use emoji icons: 📌 for location indicator, 💡 for command reminders  
* Use \> as separator for hierarchy clarity (Protocol \> Part \> Step)  
* Progress bars always use exactly 10 blocks total: █ for filled, ░ for empty  
* Keep command reminders on separate line for scannability  
* Maintain consistent spacing and alignment
* Always include "(Overall: X/Y)" to show global progress position

**Character Width Verification:**

* IF length of progress\_indicator\_text \> 80 characters: Abbreviate section names to maintain single-line display  
* Example abbreviation: "Body Paragraph Planning" becomes "Body Planning"

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

**Assessment Protocol - Setup Phase Examples:**

Beginning of Part A:
```
📌 Assessment > Setup: Text & Question Details > Step 1 of 11 (Overall: 1/19)

[Progress bar: █░░░░░░░░░ 5%]

```

Middle of Part A:
```
📌 Assessment > Setup: Text & Question Details > Step 5 of 11 (Overall: 5/19)

[Progress bar: ███░░░░░░░ 26%]

```

Part B (Goal Setting):
```
📌 Assessment > Setup: Goal Setting > Step 1 of 2 (Overall: 12/19)

[Progress bar: ██████░░░░ 63%]

```

Part C (Self-Reflection):
```
📌 Assessment > Setup: Self-Reflection > Step 1 of 1 (Overall: 14/19)

[Progress bar: ███████░░░ 74%]

```

**Assessment Protocol - Assessment Phase Examples:**

Introduction Assessment:
```
📌 Assessment > Introduction > Step 1 of 5 (Overall: 15/19)

[Progress bar: ████████░░ 79%]

```

Body Paragraphs Assessment:
```
📌 Assessment > Body Paragraphs > Step 2 of 5 (Overall: 16/19)

[Progress bar: ████████░░ 84%]

```

Conclusion Assessment:
```
📌 Assessment > Conclusion > Step 3 of 5 (Overall: 17/19)

[Progress bar: █████████░ 89%]

```

Final Summary:
```
📌 Assessment > Final Summary > Step 5 of 5 (Overall: 19/19)

[Progress bar: ██████████ 100%]

```

**Planning Protocol Examples:**

Initial Setup:
```
📌 Planning > B.1: Initial Setup > Step 1 of 6 (Overall: 1/39)

[Progress bar: █░░░░░░░░░ 3%]

```

Quote Selection:
```
📌 Planning > B.4: Anchor Quotes > Step 3 of 4 (Overall: 11/39)

[Progress bar: ███░░░░░░░ 28%]

```

Body Paragraph Planning (First Paragraph):
```
📌 Planning > B.5.1: Body 1 Planning > Step 4 of 7 (Overall: 16/39)

[Progress bar: ████░░░░░░ 41%]

```

Body Paragraph Planning (Second Paragraph):
```
📌 Planning > B.5.2: Body 2 Planning > Step 2 of 7 (Overall: 21/39)

[Progress bar: █████░░░░░ 54%]

```

Body Paragraph Planning (Third Paragraph):
```
📌 Planning > B.5.3: Body 3 Planning > Step 6 of 7 (Overall: 32/39)

[Progress bar: ████████░░ 82%]

```

Introduction Planning:
```
📌 Planning > B.7: Introduction Planning > Step 1 of 2 (Overall: 35/39)

[Progress bar: █████████░ 90%]

```

**Polishing Protocol Examples:**

Setup Phase:
```
📌 Polishing > Setup > Step 2 of 3

[Progress bar: ██████░░░░ 67%]

```

Active Polishing - Analytical Precision:
```
📌 Polishing > Introduction > Sentence 2 > Iteration 1

🔄 Working on: Analytical Precision

```

Active Polishing - Context Integration:
```
📌 Polishing > Body Paragraph 1 > Sentence 5 > Iteration 2

🔄 Working on: Context Integration

```

Active Polishing - Close Analysis:
```
📌 Polishing > Conclusion > Sentence 3 > Iteration 1

🔄 Working on: Close Analysis (AO2)

```

**Key Observations for Implementation:**

- All protocols now show "(Overall: X/Y)" for global progress orientation
- Assessment uses "Setup: [Phase Name]" for Parts A-C, then section names for Part D
- Planning uses "B.X: [Part Name]" format with global step tracking
- Polishing uses iteration tracking with section/sentence/iteration hierarchy
- Progress bars always 10 blocks total
- Commands shown vary by protocol (F only in Polish)
- Percentage matches filled blocks (each block = 10%)  
**The simplified progress indicators already show all necessary commands:**

* Assessment & Planning: M (menu) and H (help) only  
* Polishing: M (menu), H (help), and F (finish) only

Students can type M at any time to see the full Main Menu (Section 0.6). Additional command reminders are unnecessary and create visual clutter.

---

