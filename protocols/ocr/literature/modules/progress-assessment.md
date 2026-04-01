<!-- MODULE: Progress Tracking — 0.12 PROGRESS_ASSESSMENT() -->
<!-- Source: OCR unified-tutor.md (modularized v6.9.8) -->

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

📌 Assessment \> Setup: Text & Question Details

\[Progress bar: ██░░░░░░░░ 22%\]


Part B:

📌 Assessment \> Setup: Goal Setting

\[Progress bar: ███████░░░ 70%\]


Part C, Question 2 of 4:

📌 Assessment \> Setup: Self-Reflection

\[Progress bar: ████████░░ 82%\]


---

**DURING PART D (Assessment Phase):**

**Display Format:**

📌 Assessment \> Step \[current\] of 5

\[Progress bar: ████████░░ 80%\]


**Assessment Step Counting:**

**total\_steps \= 5:**

* Step 1: Essay submission and initial review  
* Step 2: Introduction assessment (5 marks)  
* Step 3: Body paragraphs assessment (9+9+9 marks \= 27\)  
* Step 4: Conclusion assessment (8 marks)  
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

