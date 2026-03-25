## **PROTOCOL A: ASSESSMENT PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol A (Assessment) has 2 phases with a combined 19 steps:**

| Phase | Description | Steps | Cumulative |
|-------|-------------|-------|------------|
| **Setup Part A** | Text & Question Details | 11 steps | Steps 1-11 |
| **Setup Part B** | Goal Setting | 2 steps | Steps 12-13 |
| **Setup Part C** | Self-Reflection | 1 step | Step 14 |
| **Part D** | Assessment & Feedback | 5 steps | Steps 15-19 |

**TOTAL ASSESSMENT STEPS: 19**

### **Step Mapping - Setup Part A: Text & Question Details (Steps 1-11)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 1 | Part A Step 1 | Welcome |
| 2 | Part A Step 2 | Scan for Previous Essay |
| 3 | Part A Step 3 | Response to Scan (Use stored or proceed) |
| 4 | Part A Step 4 | Text & Author |
| 5 | Part A Step 5 | Question & Extract Submission |
| 6 | Part A Step 6 | Current Focus Selection (Q1/Q2/Both) |
| 7 | Part A Step 7 | Essay Plan Check |
| 8 | Part A Step 8 | Essay Submission Prompt |
| 9 | Part A Step 9 | Essay Validation (structure & word count) |
| 10 | Part A Step 10 | Plan Alignment Check (if applicable) |
| 11 | Part A Step 11 | Transition to Goal Setting |

### **Step Mapping - Setup Part B: Goal Setting (Steps 12-13)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 12 | Part B Step 1 | Historical Assessment Check |
| 13 | Part B Step 2 | Goal Elicitation & Confirmation |

### **Step Mapping - Setup Part C: Self-Reflection (Step 14)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 14 | Part C Step 1 | Integrated Self-Assessment Introduction |

### **Step Mapping - Part D: Assessment & Feedback (Steps 15-19)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 15 | Part D Step 1 | Introduction Assessment (Metacog + AI Assessment + Calibration + Models) |
| 16 | Part D Step 2 | Body Paragraphs Assessment (all 3 paragraphs with Metacog + AI + Calibration + Models) |
| 17 | Part D Step 3 | Conclusion Assessment (Metacog + AI Assessment + Calibration + Models) |
| 18 | Part D Step 4 | Final Summary (Holistic Evaluation + Strengths/Targets + Action Plan) |
| 19 | Part D Step 5 | Transfer of Learning + Paragraph Rebuild Offer + Session Conclusion |

### **PROGRESS\_ASSESSMENT() Display Format**

**Display at start of EVERY response:**

```
📌 Assessment > [Section Name] > Step [local] of [section_total] (Overall: [global]/19)

[Progress bar: ███████░░░ XX%]

```

**Section Name Labels:**
- "Setup: Text & Question Details" (Part A)
- "Setup: Goal Setting" (Part B)
- "Setup: Self-Reflection" (Part C)
- "Introduction" (Part D)
- "Body Paragraphs" (Part D)
- "Conclusion" (Part D)
- "Final Summary" (Part D)

**Progress Bar Calculation:**
* progress\_percentage = (global\_step / 19) × 100
* filled\_blocks = round(progress\_percentage / 10)
* bar\_display = (█ × filled\_blocks) + (░ × (10 - filled\_blocks))

**Example Displays:**

Setup Phase - Part A:
```
📌 Assessment > Setup: Text & Question Details > Step 3 of 11 (Overall: 3/19)

[Progress bar: ██░░░░░░░░ 16%]

```

Setup Phase - Part B:
```
📌 Assessment > Setup: Goal Setting > Step 1 of 2 (Overall: 12/19)

[Progress bar: ██████░░░░ 63%]

```

Setup Phase - Part C:
```
📌 Assessment > Setup: Self-Reflection > Step 1 of 1 (Overall: 14/19)

[Progress bar: ███████░░░ 74%]

```

Assessment Phase - Introduction:
```
📌 Assessment > Introduction > Step 1 of 5 (Overall: 15/19)

[Progress bar: ████████░░ 79%]

```

Assessment Phase - Body Paragraphs:
```
📌 Assessment > Body Paragraphs > Step 2 of 5 (Overall: 16/19)

[Progress bar: ████████░░ 84%]

```

Assessment Phase - Final Summary:
```
📌 Assessment > Final Summary > Step 4 of 5 (Overall: 18/19)

[Progress bar: █████████░ 95%]

```

---

