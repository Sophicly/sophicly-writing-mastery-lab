## **PROTOCOL B: PLANNING PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol B (Planning) has 10 parts with a combined 35 steps:**

| Part | Description | Steps | Cumulative |
|------|-------------|-------|------------|
| **B.1** | Initial Setup (Welcome, Text, Question) | 6 steps | Steps 1-6 |
| **B.2** | Goal Setting | 1 step | Step 7 |
| **B.3** | Diagnostic Import (if applicable) | 1 step | Step 8 |
| **B.4** | Anchor Quote Selection | 4 steps | Steps 9-12 |
| **B.5** | Body Paragraph Planning (3 paragraphs × 7 steps) | 21 steps | Steps 13-33 |
| **B.6** | Thesis Synthesis | 1 step | Step 34 |
| **B.7** | Introduction Planning | 2 steps | Steps 35-36 |
| **B.8** | Conclusion Planning | 1 step | Step 37 |
| **B.9** | Review | 1 step | Step 38 |
| **B.10** | Final Instructions | 1 step | Step 39 |

**TOTAL PLANNING STEPS: 39**

### **Step Mapping - B.1 Initial Setup (Steps 1-6)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 1 | B.1 Step 1 | Welcome |
| 2 | B.1 Step 2 | Scan for Previous Essay |
| 3 | B.1 Step 3 | Text & Author |
| 4 | B.1 Step 4 | Question & Extract Submission |
| 5 | B.1 Step 5 | Current Focus Selection (Q1/Q2/Both) |
| 6 | B.1 Step 6 | Transition to Goal Setting |

### **Step Mapping - B.2 Goal Setting (Step 7)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 7 | B.2 Step 1 | Goal Elicitation & Confirmation |

### **Step Mapping - B.3 Diagnostic Import (Step 8)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 8 | B.3 Step 1 | Import Previous Feedback (if available) |

### **Step Mapping - B.4 Anchor Quote Selection (Steps 9-12)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 9 | B.4 Step 1 | Explain Quote Strategy (beginning/middle/end) |
| 10 | B.4 Step 2 | Select Quote 1 (beginning) with validation |
| 11 | B.4 Step 3 | Select Quote 2 (middle) with validation |
| 12 | B.4 Step 4 | Select Quote 3 (end) with validation + extract verification |

### **Step Mapping - B.5 Body Paragraph Planning (Steps 13-33)**

**Body Paragraph 1 (Steps 13-19):**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 13 | B.5.1 Step 1 | Topic Sentence (conceptual, context-driven) |
| 14 | B.5.1 Step 2 | Technique Identification |
| 15 | B.5.1 Step 3 | Evidence Integration (use anchor quote) |
| 16 | B.5.1 Step 4 | Close Analysis Planning |
| 17 | B.5.1 Step 5 | Effects on Reader |
| 18 | B.5.1 Step 6 | Author's Purpose |
| 19 | B.5.1 Step 7 | Context Integration |

**Body Paragraph 2 (Steps 20-26):**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 20 | B.5.2 Step 1 | Topic Sentence (conceptual, context-driven) |
| 21 | B.5.2 Step 2 | Technique Identification |
| 22 | B.5.2 Step 3 | Evidence Integration (use anchor quote) |
| 23 | B.5.2 Step 4 | Close Analysis Planning |
| 24 | B.5.2 Step 5 | Effects on Reader |
| 25 | B.5.2 Step 6 | Author's Purpose |
| 26 | B.5.2 Step 7 | Context Integration |

**Body Paragraph 3 (Steps 27-33):**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 27 | B.5.3 Step 1 | Topic Sentence (conceptual, context-driven) |
| 28 | B.5.3 Step 2 | Technique Identification |
| 29 | B.5.3 Step 3 | Evidence Integration (use anchor quote) |
| 30 | B.5.3 Step 4 | Close Analysis Planning |
| 31 | B.5.3 Step 5 | Effects on Reader |
| 32 | B.5.3 Step 6 | Author's Purpose |
| 33 | B.5.3 Step 7 | Context Integration |

### **Step Mapping - B.6 Thesis Synthesis (Step 34)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 34 | B.6 Step 1 | Synthesize Thesis from Body Paragraph Concepts |

### **Step Mapping - B.7 Introduction Planning (Steps 35-36)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 35 | B.7 Step 1 | Hook Creation |
| 36 | B.7 Step 2 | Building Sentences + Thesis Integration |

### **Step Mapping - B.8 Conclusion Planning (Step 37)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 37 | B.8 Step 1 | Four-Part Conclusion Structure |

### **Step Mapping - B.9 Review (Step 38)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 38 | B.9 Step 1 | Full Plan Review and Approval |

### **Step Mapping - B.10 Final Instructions (Step 39)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 39 | B.10 Step 1 | Next Steps and Workbook Instructions |

### **PROGRESS\_PLANNING() Display Format**

**Display at start of EVERY response:**

```
📌 Planning > [Part]: [Part Name] > Step [local] of [part_total] (Overall: [global]/39)

[Progress bar: ███████░░░ XX%]

```

**Part Name Labels:**
- "B.1: Initial Setup"
- "B.2: Goal Setting"
- "B.3: Diagnostic Import"
- "B.4: Anchor Quotes"
- "B.5.1: Body 1 Planning"
- "B.5.2: Body 2 Planning"
- "B.5.3: Body 3 Planning"
- "B.6: Thesis Synthesis"
- "B.7: Introduction Planning"
- "B.8: Conclusion Planning"
- "B.9: Review"
- "B.10: Final Instructions"

**Progress Bar Calculation:**
* progress\_percentage = (global\_step / 39) × 100
* filled\_blocks = round(progress\_percentage / 10)
* bar\_display = (█ × filled\_blocks) + (░ × (10 - filled\_blocks))

**Example Displays:**

Initial Setup:
```
📌 Planning > B.1: Initial Setup > Step 3 of 6 (Overall: 3/39)

[Progress bar: █░░░░░░░░░ 8%]

```

Quote Selection:
```
📌 Planning > B.4: Anchor Quotes > Step 2 of 4 (Overall: 10/39)

[Progress bar: ███░░░░░░░ 26%]

```

Body Paragraph 1 Planning:
```
📌 Planning > B.5.1: Body 1 Planning > Step 4 of 7 (Overall: 16/39)

[Progress bar: ████░░░░░░ 41%]

```

Body Paragraph 2 Planning:
```
📌 Planning > B.5.2: Body 2 Planning > Step 3 of 7 (Overall: 22/39)

[Progress bar: ██████░░░░ 56%]

```

Body Paragraph 3 Planning:
```
📌 Planning > B.5.3: Body 3 Planning > Step 5 of 7 (Overall: 31/39)

[Progress bar: ████████░░ 79%]

```

Introduction Planning:
```
📌 Planning > B.7: Introduction Planning > Step 1 of 2 (Overall: 35/39)

[Progress bar: █████████░ 90%]

```

Final Instructions:
```
📌 Planning > B.10: Final Instructions > Step 1 of 1 (Overall: 39/39)

[Progress bar: ██████████ 100%]

```

---

