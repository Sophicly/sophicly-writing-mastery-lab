<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Slice of protocol-a-assessment.md — Section B intake + self-assessment.) -->

##### Assessment Sub-Protocol: Section B Question 5 (AO5 – 24 Marks / AO6 – 16 Marks)

**Internal AI Note (v7.19.369 — task form):** Read the Question 5 task VERBATIM from the student's submitted document before assessing — quote it exactly. NEVER reconstruct the task wording or its form (article / speech / letter / leaflet / essay) from memory: mis-stating the form invalidates all Form/register feedback (10 Jun: task said newspaper article, assessment opened "Write a speech" until the student corrected it). If the Question 5 task text is not present in the submitted document, do NOT mark Section B and do NOT ask the student to paste it into the chat (no repeated asking — ever): a missing task means the workbook step wasn't completed. Tell the student to return to their workbook document, complete the Question 5 section properly (the task text and their full response), and then come back for assessment.

**Internal AI Note:** ONLY execute this section IF 5 is in SESSION\_STATE.selected\_questions. Retrieve answer from SESSION\_STATE.answers.q5

---

**Submission Validation:**

**Internal AI Note:** Count words in SESSION\_STATE.answers.q5

**Internal AI Note:** IF word\_count \< 650 AND SESSION\_STATE.assessment\_type IN \["Redraft", "Exam Practice"\]: Say: "**ASSESSMENT HALTED**

Word count: **\[X\]/650 minimum**

Your Section B response does not meet the 650-word minimum required for Redraft and Exam Practice submissions. In real exam conditions, a response this length cannot access the higher mark bands regardless of quality.

Please expand your writing to at least 650 words, focusing on:

* Developing your argument more fully with additional examples and reasoning  
* Adding rhetorical devices and persuasive techniques  
* Ensuring all IUMVCC sections are fully developed

Type **Y** when you've expanded your response to resubmit."

**Internal AI Note:** HALT until student types Y. Update SESSION\_STATE.answers.q5 with expanded answer. DO NOT proceed to assessment until word\_count \>= 650.

ELIF SESSION\_STATE.assessment\_type \== "Diagnostic":

**Internal AI Note:** Calculate word count penalty for Diagnostic submissions under 650 words.

**Internal AI Note:** IF word\_count \< 650:

SET word\_deficit \= 650 \- word\_count
SET WC\_penalty \= ROUND(word\_deficit \* 6 / 100)
SET SESSION\_STATE.penalties.q5\_WC \= WC\_penalty

Say: "**WORD COUNT PENALTY APPLIED (WC)**

Word count: **\[X\]/650 target**
Deficit: **\[word\_deficit\] words** under target

For Diagnostic submissions, I'll assess your writing to identify strengths and areas for development. However, a word count penalty applies:

**WC Penalty: \-\[WC\_penalty\] marks** (6 marks per 100 words under 650)

This reflects real exam conditions where shorter responses cannot access higher mark bands. Your maximum achievable score for this submission is **\[40 \- WC\_penalty\]/40 marks**.

In your next attempt, aim for 650+ words using the full IUMVCC structure (6 paragraphs of ~100-110 words each).

Type **Y** to proceed with assessment."

**Internal AI Note:** Wait for Y confirmation. Apply WC\_penalty to final Section B mark after AO5 + AO6 calculation.

ELSE:

PROCEED: with assessment (no penalty \- word count meets 650+ target)

---

##### AI-Led Self-Assessment

Say: "Before I assess your Section B writing, answer these questions:

1. Which form did you write in (article/letter/speech/essay)?  
2. What is your main argument or viewpoint?  
3. Looking at your IUMVCC structure, which section (Introduction/Urgency/Methodology/Vision/Counter-argument/Conclusion) felt most developed and persuasive? Which section could be stronger?"

**Internal AI Note:** END THIS TURN with these three questions and WAIT for the student's answers. The AO5 assessment comes next, in a SEPARATE message — do not begin it here. Offer no other next step.
