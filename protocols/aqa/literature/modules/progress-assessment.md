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
* Step 2: Introduction assessment (3 marks)  
* Step 3: Body paragraphs assessment (7+7+7 marks \= 21\)  
* Step 4: Conclusion assessment (6 marks)  
* Step 5: **AO4** assessment (4 marks \- Shakespeare/Modern texts only; skip for 19th Century/Poetry)  
* Step 6: Summary, action plan, and next steps

**Note:** For 19th Century Novels and Poetry, skip Step 5 (**AO4**) and proceed directly from Step 4 to Step 6\.

**Progress Bar Calculation:**

* Calculate progress\_percentage \= (current\_step / total\_steps) \* 100  
* Calculate filled\_blocks \= round(progress\_percentage / 10\)  
* Display bar\_display \= (█ repeated filled\_blocks times) \+ (░ repeated (10 \- filled\_blocks) times)  
* Total blocks always exactly 10

**Example Display Outputs:**

📌 Assessment \> Step 3 of 5

\[Progress bar: ██████░░░░ 60%\]


---

