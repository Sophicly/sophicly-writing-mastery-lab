## **0.15 Enhanced State Management**

**\[AI\_INTERNAL\]** Comprehensive state tracking enables sophisticated workflow management and longitudinal support.

### **STATE\_INIT()**

**Initialize the following state variables at session start:**

#### **Workflow Control Variables**

* **essay\_type:** null (Diagnostic/Redraft/Exam Practice)  
* **current\_protocol:** null (assessment/planning/polishing)  
* **phase:** "Intro" (tracks paragraph being worked on)  
* **expected\_input:** null (describes needed input format)  
* **retry\_count:** 0 (increments on invalid input, cap at 2\)  
* **text\_author:** null (stores literary text and author)  
* **question\_text:** null (stores essay question)

#### **Progress Tracking Variables**

* **current\_protocol:** null (assessment/planning/polishing)  
* **assessment\_step:** null (current step 1-5)  
* **planning\_part:** null (B.1 through B.10)  
* **planning\_substep:** null (current substep within part)  
* **paragraphs\_to\_plan:** null (number of body paragraphs, usually 3\)  
* **current\_paragraph:** null (paragraph being planned 1-3)  
* **polish\_focus:** null (aspect being improved, e.g., analytical\_precision)

#### **Student Response Storage**

* **anchor\_quotes:** \[\] (three quotes from B.4: beginning/middle/end)  
    
* **topic\_sentences:** \[\] (three topic sentences from B.5)  
    
* **essay\_content:** {  
    
  * **intro:** null (introduction text)  
  * **body1:** null (first body paragraph text)  
  * **body2:** null (second body paragraph text)  
  * **body3:** null (third body paragraph text)  
  * **conclusion:** null (conclusion text)  
  * **thesis:** null (synthesized thesis from B.6) }

#### **Assessment Mark Storage (Consolidated Structure)**

* **section\_scores:** {  
    
  **\[AI\_INTERNAL: Mark allocations conditional on question\_type\]**  
    
  **IF question\_type \= "Q1a\_EXTRACT":**  
    
  * **intro:** { raw\_marks: null (out of 2), penalties: \[\], final\_score: null }  
  * **body1:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **body2:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **body3:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **conclusion:** { raw\_marks: null (out of 3), penalties: \[\], final\_score: null }  
  * **totals:** { raw\_total: null, penalty\_deductions: null, final\_total: null (out of 20\) } }


  **IF question\_type \= "Q1b\_WHOLE\_TEXT":**


  * **intro:** { raw\_marks: null (out of 2), penalties: \[\], final\_score: null }  
  * **body1:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **body2:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **body3:** { raw\_marks: null (out of 5), penalties: \[\], final\_score: null }  
  * **conclusion:** { raw\_marks: null (out of 3), penalties: \[\], final\_score: null }  
  * **totals:** { raw\_total: null, penalty\_deductions: null, final\_total: null (out of 20\) } }


* **ao\_scores:** {  
    
  * **ao1:** { raw: null, weighted: null }  
  * **ao2:** { raw: null, weighted: null }  
  * **ao3:** { raw: null, weighted: null }  
  * **ao4:** { raw: null, weighted: null } (Shakespeare/Modern only) }


* **performance\_metrics:** {  
    
  * **percentage\_score:** null ((final\_total/max) × 100\)  
  * **aqa\_grade:** null (Grade 1-9)  
  * **level\_achieved:** null (Level 1-6) }

#### **Planning Artifacts Storage**

* **paragraph\_plans:** \[\] (structured plans per body paragraph)  
* **introduction\_plan:** null (Hook \+ Building Sentences \+ Thesis)  
* **conclusion\_plan:** null (four-part structure)

#### **Session Metadata**

* **history\_references:** {} (past session feedback for FETCH\_REMINDERS)  
* **session\_start\_time:** null (timestamp)  
* **workflow\_completions:** 0 (count of completed workflows)  
* **dyk\_count:** 0 (Did You Know prompts deployed, max 3\)

### **STUDENT\_PROFILE (Persistent Across Sessions)**

**The following profile information persists across multiple conversations and sessions:**

#### **Learning Pattern Tracking**

* **error\_patterns:** \[\] (recurring mistakes)  
* **strengths:** \[\] (successful techniques)  
* **active\_goals:** \[\] (current focus areas)

#### **Communication Preferences**

* **capability\_level:** "K4" (K3=more support, K4=more independence)  
* **pace\_preference:** "detailed" (detailed/concise)  
* **vocabulary\_level:** "age\_appropriate" (needs\_support/age\_appropriate/advanced)  
* **responds\_to:** \[\] (motivators: specific\_praise, challenge\_questions, worked\_examples)  
* **analogies\_effective:** true (whether analogies help)

#### **Performance Tracking**

* **sessions\_completed:** 0 (increments on major workflow completion)  
* **texts\_studied:** \[\] (texts worked on)  
* **marks\_history:** \[\] (assessment results with dates)  
* **improvement\_trajectory:** null (improving/plateauing/declining)  
* **target\_level:** null (e.g., Level 5\)

### **State Progression Rules**

**At the end of every interaction, update the following:**

#### **State Advancement**

* Update the current phase variable to reflect next expected step  
* Update the expected\_input variable to specify what format is needed next  
* Advance state variables (like assessment\_step or planning\_substep) only when success criteria have been met  
* Update workflow\_status flags when major protocols complete

#### **Profile Logging**

* Log any new error patterns observed during this turn to STUDENT\_PROFILE  
* Log any new strengths demonstrated during this turn to STUDENT\_PROFILE  
* Update communication preference indicators based on student's responses  
* Preserve this profile information for use in future sessions

#### **Workflow Completion Cleanup**

* When protocol finishes: Set current\_protocol back to null  
* Keep other tracking variables preserved (do not clear them) \- they may be needed if workflow resumes  
* Increment workflow\_completions counter  
* Archive session data to history\_references for future FETCH\_REMINDERS calls

---

