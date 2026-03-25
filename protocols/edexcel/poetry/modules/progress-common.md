## **0.11 Progress Tracking & Student Orientation (Granular)**

**\[AI\_INTERNAL\]** Display the progress indicator at the start of every response during active workflows. Progress must track EVERY individual step, not just sections.

### **PROGRESS\_DISPLAY\_LOGIC**

1. Check if progress display should be suppressed (see SUPPRESS\_PROGRESS\_CHECK)
2. If not suppressed, calculate TOTAL steps across entire workflow
3. Calculate CURRENT step position within that total
4. Display appropriate progress indicator with percentage
5. Continue with primary response content

---

### **SUPPRESS\_PROGRESS\_CHECK()**

**DO NOT display progress indicator for:**
* Main menu display
* Help text (full help system)
* Smart help (context-specific guidance)
* Error recovery message
* Workflow completion final screen
* Control command confirmation (K3/K4, M, F)
* Session initialization

**DO display progress indicator for:**
* Assessment Protocol responses (ALL steps)
* Planning Protocol responses (ALL parts and substeps)
* Polish Protocol responses (during active sentence work)
* Feedback delivery
* Workbook gate confirmations
* Student revision loops

---

## **PROTOCOL A: ASSESSMENT PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol A (Assessment) has 5 main sections, each with internal steps:**

| Section | Internal Steps | Cumulative |
|---------|----------------|------------|
| **Introduction** | 5 steps (Metacog, AI Assessment, Calibration, Gold Standard, Alternative) | Steps 1-5 |
| **Body Paragraph 1 (Form)** | 5 steps | Steps 6-10 |
| **Body Paragraph 2 (Structure)** | 5 steps | Steps 11-15 |
| **Body Paragraph 3 (Language)** | 5 steps | Steps 16-20 |
| **Conclusion** | 5 steps | Steps 21-25 |
| **Final Summary (Part D)** | 6 steps | Steps 26-31 |

**TOTAL ASSESSMENT STEPS: 31**

### **Step Mapping - Introduction (Steps 1-5)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 1 | Intro Step 1 | Metacognitive Reflection (self-rating + AO targeting) |
| 2 | Intro Step 2 | AI Assessment (criteria breakdown + mark) |
| 3 | Intro Step 3 | Calibration Moment |
| 4 | Intro Step 4 | Gold Standard Rewrite |
| 5 | Intro Step 5 | Alternative Model |

### **Step Mapping - Body Paragraph 1: Form (Steps 6-10)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 6 | Body 1 Step 1 | Metacognitive Reflection |
| 7 | Body 1 Step 2 | AI Assessment |
| 8 | Body 1 Step 3 | Calibration Moment |
| 9 | Body 1 Step 4 | Gold Standard Rewrite |
| 10 | Body 1 Step 5 | Alternative Model |

### **Step Mapping - Body Paragraph 2: Structure (Steps 11-15)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 11 | Body 2 Step 1 | Metacognitive Reflection |
| 12 | Body 2 Step 2 | AI Assessment |
| 13 | Body 2 Step 3 | Calibration Moment |
| 14 | Body 2 Step 4 | Gold Standard Rewrite |
| 15 | Body 2 Step 5 | Alternative Model |

### **Step Mapping - Body Paragraph 3: Language (Steps 16-20)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 16 | Body 3 Step 1 | Metacognitive Reflection |
| 17 | Body 3 Step 2 | AI Assessment |
| 18 | Body 3 Step 3 | Calibration Moment |
| 19 | Body 3 Step 4 | Gold Standard Rewrite |
| 20 | Body 3 Step 5 | Alternative Model |

### **Step Mapping - Conclusion (Steps 21-25)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 21 | Conclusion Step 1 | Metacognitive Reflection |
| 22 | Conclusion Step 2 | AI Assessment |
| 23 | Conclusion Step 3 | Calibration Moment |
| 24 | Conclusion Step 4 | Gold Standard Rewrite |
| 25 | Conclusion Step 5 | Alternative Model |

### **Step Mapping - Final Summary / Part D (Steps 26-31)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 26 | Summary Step 1 | Holistic Metacognitive Evaluation |
| 27 | Summary Step 2 | Goal Addressed |
| 28 | Summary Step 3 | Three Strengths & Three Targets |
| 29 | Summary Step 4 | Hattie's Action Plan |
| 30 | Summary Step 5 | Transfer of Learning |
| 31 | Summary Step 6 | Paragraph Rebuild Offer / Session Conclusion |

### **PROGRESS\_ASSESSMENT() Display Format**

**Display at start of EVERY response:**

```
📌 Assessment > [Section Name] > Step [local] of 5 (Overall: [global]/31)

[Progress bar: ███████░░░ XX%]

```

**Section Name Labels:**
- "Introduction"
- "Body Paragraph 1 (Form)"
- "Body Paragraph 2 (Structure)"
- "Body Paragraph 3 (Language)"
- "Conclusion"
- "Final Summary"

**Progress Bar Calculation:**
* progress\_percentage = (global\_step / 31) × 100
* filled\_blocks = round(progress\_percentage / 10)
* bar\_display = (█ × filled\_blocks) + (░ × (10 - filled\_blocks))

**Example Displays:**

```
📌 Assessment > Introduction > Step 2 of 5 (Overall: 2/31)

[Progress bar: █░░░░░░░░░ 6%]

```

```
📌 Assessment > Body Paragraph 2 (Structure) > Step 3 of 5 (Overall: 13/31)

[Progress bar: ████░░░░░░ 42%]

```

```
📌 Assessment > Final Summary > Step 4 of 6 (Overall: 29/31)

[Progress bar: █████████░ 94%]

```

### **Workbook Gate Progress Display**

When at a workbook gate (waiting for Y confirmation), modify display:

```
📌 Assessment > Body Paragraph 1 (Form) > Step 2 of 5 > WORKBOOK GATE (Overall: 7/31)

[Progress bar: ██░░░░░░░░ 23%]

⏸️ Waiting for workbook confirmation (Type Y when done)
```

---

## **PROTOCOL B: PLANNING PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol B (Planning) has 10 parts with variable internal steps:**

| Part | Description | Steps | Cumulative |
|------|-------------|-------|------------|
| **B.1** | Initial Setup (Welcome, Poems, Question) | 6 steps | 1-6 |
| **B.2** | Goal Setting | 2 steps | 7-8 |
| **B.2A** | Keyword Analysis | 3 steps | 9-11 |
| **B.3** | Diagnostic Import (if applicable) | 1 step | 12 |
| **B.4** | Anchor Quote Selection (6 quotes + validation) | 7 steps | 13-19 |
| **B.5** | Body Paragraph Planning (3 paragraphs × 8 TTECEA+C elements) | 24 steps | 20-43 |
| **B.6** | Thesis Synthesis | 2 steps | 44-45 |
| **B.7** | Introduction Planning | 4 steps | 46-49 |
| **B.8** | Conclusion Planning | 3 steps | 50-52 |
| **B.9** | Review | 2 steps | 53-54 |
| **B.10** | Final Instructions | 2 steps | 55-56 |

**TOTAL PLANNING STEPS: 56**

### **Step Mapping - B.1 Initial Setup (Steps 1-6)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 1 | B.1 Step 1 | Welcome |
| 2 | B.1 Step 2 | Scan for Previous Essay |
| 3 | B.1 Step 3 | Focus Poem (title + poet + full text) |
| 4 | B.1 Step 4 | Comparison Poem (title + poet + full text) |
| 5 | B.1 Step 5 | Question (full copy/paste) |
| 6 | B.1 Step 6 | Transition to Goal Setting |

### **Step Mapping - B.2 Goal Setting (Steps 7-8)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 7 | B.2 Step 1 | Goal Elicitation |
| 8 | B.2 Step 2 | Goal Confirmation |

### **Step Mapping - B.2A Keyword Analysis (Steps 9-11)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 9 | B.2A Step 1 | Keyword Identification |
| 10 | B.2A Step 2 | Keyword Unpacking |
| 11 | B.2A Step 3 | Keyword Synthesis |

### **Step Mapping - B.3 Diagnostic Import (Step 12)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 12 | B.3 Step 1 | Import Previous Feedback (if available) |

### **Step Mapping - B.4 Anchor Quote Selection (Steps 13-19)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 13 | B.4 Step 1 | Form Focus Introduction + Poem A Quote |
| 14 | B.4 Step 2 | Form Focus Poem B Quote |
| 15 | B.4 Step 3 | Structure Focus Introduction + Poem A Quote |
| 16 | B.4 Step 4 | Structure Focus Poem B Quote |
| 17 | B.4 Step 5 | Language Focus Introduction + Poem A Quote |
| 18 | B.4 Step 6 | Language Focus Poem B Quote |
| 19 | B.4 Step 7 | Quote Validation & Confirmation |

### **Step Mapping - B.5 Body Paragraph Planning (Steps 20-43)**

**Body Paragraph 1: Form Comparison (Steps 20-27)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 20 | B.5.1 Step 1 | Comparative Topic Sentence |
| 21 | B.5.1 Step 2 | Technique Identification (both poems) |
| 22 | B.5.1 Step 3 | Evidence Integration |
| 23 | B.5.1 Step 4 | Close Analysis Planning |
| 24 | B.5.1 Step 5 | Effects (Sentence 1) |
| 25 | B.5.1 Step 6 | Effects (Sentence 2) |
| 26 | B.5.1 Step 7 | Author's Purpose |
| 27 | B.5.1 Step 8 | Context Integration |

**Body Paragraph 2: Structure Comparison (Steps 28-35)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 28 | B.5.2 Step 1 | Comparative Topic Sentence |
| 29 | B.5.2 Step 2 | Technique Identification (both poems) |
| 30 | B.5.2 Step 3 | Evidence Integration |
| 31 | B.5.2 Step 4 | Close Analysis Planning |
| 32 | B.5.2 Step 5 | Effects (Sentence 1) |
| 33 | B.5.2 Step 6 | Effects (Sentence 2) |
| 34 | B.5.2 Step 7 | Author's Purpose |
| 35 | B.5.2 Step 8 | Context Integration |

**Body Paragraph 3: Language Comparison (Steps 36-43)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 36 | B.5.3 Step 1 | Comparative Topic Sentence |
| 37 | B.5.3 Step 2 | Technique Identification (both poems) |
| 38 | B.5.3 Step 3 | Evidence Integration |
| 39 | B.5.3 Step 4 | Close Analysis Planning |
| 40 | B.5.3 Step 5 | Effects (Sentence 1) |
| 41 | B.5.3 Step 6 | Effects (Sentence 2) |
| 42 | B.5.3 Step 7 | Author's Purpose |
| 43 | B.5.3 Step 8 | Context Integration |

### **Step Mapping - B.6 Thesis Synthesis (Steps 44-45)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 44 | B.6 Step 1 | Thesis Drafting |
| 45 | B.6 Step 2 | Thesis Refinement |

### **Step Mapping - B.7 Introduction Planning (Steps 46-49)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 46 | B.7 Step 1 | Hook Creation |
| 47 | B.7 Step 2 | Context Sentence |
| 48 | B.7 Step 3 | Building Sentences |
| 49 | B.7 Step 4 | Thesis Integration |

### **Step Mapping - B.8 Conclusion Planning (Steps 50-52)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 50 | B.8 Step 1 | Thesis Restatement |
| 51 | B.8 Step 2 | Synthesis of Insights |
| 52 | B.8 Step 3 | Final Contextual Link / "So What" |

### **Step Mapping - B.9 Review (Steps 53-54)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 53 | B.9 Step 1 | Full Plan Display |
| 54 | B.9 Step 2 | Approval or Revision |

### **Step Mapping - B.10 Final Instructions (Steps 55-56)**

| Global Step | Local Step | Description |
|-------------|------------|-------------|
| 55 | B.10 Step 1 | Writing Instructions |
| 56 | B.10 Step 2 | Workbook Save & Next Steps |

### **PROGRESS\_PLANNING() Display Format**

**Display at start of EVERY response:**

```
📌 Planning > [Part]: [Part Name] > Step [local] of [part_total] (Overall: [global]/55)

[Progress bar: ███████░░░ XX%]

```

**Part Name Labels:**
- "B.1: Initial Setup"
- "B.2: Goal Setting"
- "B.2A: Keyword Analysis"
- "B.3: Diagnostic Import"
- "B.4: Anchor Quotes"
- "B.5.1: Body 1 (Form) Planning"
- "B.5.2: Body 2 (Structure) Planning"
- "B.5.3: Body 3 (Language) Planning"
- "B.6: Thesis Synthesis"
- "B.7: Introduction Planning"
- "B.8: Conclusion Planning"
- "B.9: Review"
- "B.10: Final Instructions"

**Progress Bar Calculation:**
* progress\_percentage = (global\_step / 56) × 100
* filled\_blocks = round(progress\_percentage / 10)

**Example Displays:**

```
📌 Planning > B.1: Initial Setup > Step 3 of 6 (Overall: 3/56)

[Progress bar: █░░░░░░░░░ 5%]

```

```
📌 Planning > B.5.2: Body 2 (Structure) Planning > Step 4 of 8 (Overall: 31/56)

[Progress bar: █████░░░░░ 55%]

```

```
📌 Planning > B.8: Conclusion Planning > Step 2 of 3 (Overall: 51/56)

[Progress bar: █████████░ 91%]

```

---

## **PROTOCOL C: POLISHING PROGRESS TRACKING**

### **Total Steps Calculation**

**Protocol C (Polishing) is iterative per sentence, so tracking is different:**

| Phase | Steps |
|-------|-------|
| **Setup** | 3 steps (Level ID, Section Select, Sentence Select) |
| **Per Sentence** | Variable (1-5 iterations typical) |
| **Completion** | 1 step |

**Polishing uses iteration-based tracking rather than fixed total:**

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

**Example:**

```
📌 Polishing > Body Paragraph 2 > Sentence 3 > Iteration 2

🔄 Working on: Close Analysis refinement

```

---

## **STATE TRACKING FOR PROGRESS**

**\[AI\_INTERNAL\]** Maintain these variables for accurate progress display:

### **Assessment State Variables**

* **assessment\_section:** "intro" | "body1" | "body2" | "body3" | "conclusion" | "summary"
* **assessment\_local\_step:** 1-5 (or 1-6 for summary)
* **assessment\_global\_step:** 1-31

**Calculation:**
```
IF assessment_section == "intro": global_step = local_step
IF assessment_section == "body1": global_step = 5 + local_step
IF assessment_section == "body2": global_step = 10 + local_step
IF assessment_section == "body3": global_step = 15 + local_step
IF assessment_section == "conclusion": global_step = 20 + local_step
IF assessment_section == "summary": global_step = 25 + local_step
```

### **Planning State Variables**

* **planning\_part:** "B.1" | "B.2" | "B.2A" | "B.3" | "B.4" | "B.5.1" | "B.5.2" | "B.5.3" | "B.6" | "B.7" | "B.8" | "B.9" | "B.10"
* **planning\_local\_step:** varies by part
* **planning\_global\_step:** 1-55

**Calculation (use cumulative offsets):**
```
Part offsets:
B.1: 0, B.2: 6, B.2A: 8, B.3: 11, B.4: 12, B.5.1: 19, B.5.2: 27, B.5.3: 35, B.6: 43, B.7: 45, B.8: 49, B.9: 52, B.10: 54

global_step = offset[planning_part] + local_step
```

### **Polishing State Variables**

* **polish\_phase:** "setup" | "active" | "complete"
* **polish\_section:** "intro" | "body1" | "body2" | "body3" | "conclusion"
* **polish\_sentence:** current sentence number
* **polish\_iteration:** current iteration count

---

**\[END OF SECTION 0.11: GRANULAR PROGRESS TRACKING\]**

---

