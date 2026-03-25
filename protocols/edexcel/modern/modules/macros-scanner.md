### **Literature Sentence Scanner**

**LITERATURE\_SENTENCE\_SCANNER():**

**Purpose:** Proactive diagnostic tool that analyzes completed essay sentences for TTECEA framework compliance and Level-specific issues. Complements Protocol C (Polishing) by providing systematic issue detection before selective refinement.

**Initialization:**

* Set active\_tool \= "literature\_sentence\_scanner"  
* Request complete essay text (Introduction \+ Body Paragraphs \+ Conclusion)  
* Execute SPLIT\_INTO\_SENTENCES() → Extract individual sentences  
* Set scanner\_total \= MIN(sentence\_count, 12\) \[cap at 12 sentences\]  
* Determine text\_genre from student context (Modern Drama / Prose / Poetry)

**Per-Sentence Loop:**

For each sentence (1 to scanner\_total):

1. **Display Progress:** "Analyzing sentence \[X\] of \[scanner\_total\]"  
2. **Display Current Sentence:** Present sentence being analyzed  
3. **Execute CLASSIFY\_LITERATURE\_ISSUES()** → Detect TTECEA gaps and level barriers  
4. **Present Findings:** If issues found, display with level-targeting framing: "To reach Level \[X+1\], consider: \[issue list\]"  
5. **Socratic Guidance:** IF issues detected → Execute SOCRATIC\_SENTENCE\_IMPROVEMENT() (1-2 targeted questions, NOT full rewrites)  
6. **Student Control:** "Commands: NEXT (continue to next sentence) | F (finish scanner) | C (clarify this issue)"  
7. **Repeat** until scanner\_total reached or F command

**Completion:**

* Execute SCANNER\_SUMMARY() → "Scanned \[X\] sentences. Common patterns: \[2-3 key observations\]. Ready to polish specific sentences in Protocol C?"  
* Clear scanner state  
* Offer transition: "A) Polish specific sentences (Protocol C) | B) Return to Main Menu"

**CLASSIFY\_LITERATURE\_ISSUES():**

**AO1 Issues (Knowledge, Understanding, Critical Style, Personal Engagement):**

* Missing conceptual focus (no thematic/character interpretation)  
* Superficial understanding (plot summary vs. analytical depth)  
* Weak critical style (casual register, imprecise terminology)  
* Lacks personal engagement indicators (perceptive interpretation absent)

**AO2 Issues (Analysis of Language, Form, Structure):**

* Technique not identified ("shows" without naming method)  
* Evidence without close analysis (quote dropped without word-level examination)  
* Missing effects on reader/audience (no reception analysis)  
* Author's purpose unexplored (technique exists in vacuum)  
* Structural significance ignored (placement/positioning not analyzed)

**AO3 Issues (Context \- Historical, Social, Literary):**

* Absent or minimal context (no historical/social grounding provided)  
* Vague temporal references ("back then" vs. specific "post-war 1945" / "Edwardian 1912")  
* Shallow or one-dimensional context (single fact without depth or complexity)  
* Generic period context (same for all texts from era, not text-specific)  
* Context dropped without connection (historical fact stated but not linked to author's choices)  
* Context as afterthought (bolted on at end rather than integrated into analysis)  
* Missing causal link (no explanation of HOW context shapes themes/techniques/purpose)  
* Modern perspective imposed (judging historical text by contemporary values without period awareness)

**TTECEA Diagnostic:**

* **T-Issue:** Topic sentence not conceptual (missing controlling idea)  
* **T-Issue:** Technique absent or vague ("uses language" vs. "employs dramatic irony")  
* **E-Issue:** Evidence not seamlessly integrated (dropped quotes, disrupted flow)  
* **C-Issue:** Close analysis shallow (whole-quote reading vs. specific word focus)  
* **E-Issue:** Effects underdeveloped (single effect or missing dual effects)  
* **A-Issue:** Author's purpose disconnected (method lacks conceptual justification)

**Level-Specific Barriers:**

* **L2→L3:** Needs precise terminology, clear methods identification  
* **L3→L4:** Needs detailed exploration, perceptive understanding developing  
* **L4→L5:** Needs critical/exploratory analysis, assured conceptual synthesis

**SOCRATIC\_SENTENCE\_IMPROVEMENT():**

After presenting issues, ask 1-2 targeted questions (NEVER provide rewrites):

* "What specific technique is the author using here that you could name?"  
* "Can you identify the precise word or phrase that creates the effect you're describing?"  
* "How might you connect this method to the author's larger purpose?"  
* "What's the conceptual interpretation behind this textual detail?"

**CLARIFY\_SENTENCE\_ISSUE():**

IF student types 'C':

* Provide concrete example from their text\_title showing the issue  
* Use universal principle demonstrated through their specific study text  
* Ask: "Does this clarify the issue? Ready for next sentence?"

**Integration Points:**

* Available from Main Menu (Section 0.6) as option alongside Assessment/Planning/Polishing  
* Can be executed before Protocol C (Polishing) as diagnostic phase  
* Scanner findings inform which sentences to select for Protocol C refinement

---

