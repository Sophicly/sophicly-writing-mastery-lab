# Quiz design that makes students think — research for the Foundational Quiz

**Date:** 2026-10-04 · **For:** WML Foundational Quiz (FQ) banks + engine · **Neil's question:** how can a quiz be designed, from educational research, to challenge students enough to make them think?
**Method:** primary sources read (author PDFs; abstracts checked in PubMed / ERIC). Every quotation below was checked by script against the source text. Builds on `research/2026-07-11-concept-based-fq-question-design.md` and `FQ-QUESTION-STANDARD.md`. The format matters: across 222 classroom studies, quizzing raised achievement by a medium amount (g = 0.499; Yang et al. 2021).

**Evidence labels:** **Strong** = meta-analyses or many studies, including classrooms · **Moderate** = several controlled experiments, mostly university students · **Thin** = one or two studies, another subject, or theory only.

## 0. Our banks today (script over all 66 FQ bank files, 1,706 items)

- **MCQ:** the correct option is the longest in **83%** of 1,289 items (chance is about 25%): 99% in the prose/drama banks, 71% in the poetry banks. On average it is 2.6 times the length of the wrong options. Dashes sit in 42% of correct options and 1% of wrong ones; quotations in 15% and 0.3%; absolute words ("wholly", "never", "only") in 8% and 20%.
- **True/False:** 280 of 286 are keyed **True**. **Select-all:** 54 of 58 have exactly three correct options out of four.
- **A script that never reads a text** (pick the longest option, answer True, tick the longer options) earns **81%** of the credit: 99% on prose/drama banks, 67% on poetry banks.
- Option order is already shuffled each round, so position is not a cue. But the anthology poetry banks serve the whole staged set every round (`pick_session_fq`, `class-quiz-bank.php` ~444–468), so a redo round repeats **the same 15 questions**.
- `FQ-QUESTION-STANDARD.md` already demands misreading-based wrong options. Nothing checks the surface features above.

## 1. Ten design rules

**1. Every wrong option must be a real competitor:** a misreading a student could genuinely hold. Tests "must include plausible (i.e., competitive) incorrect alternatives" to trigger the retrieval that drives learning (Little et al. 2012). Non-competitive options "can be rejected without bringing to mind specific information" and gave no benefit (Little & Bjork 2015). "Use typical errors of students to write your distractors"; avoid "Blatantly absurd, ridiculous options" (Haladyna et al. 2002). **Moderate–strong.**

**2. Make the options look alike; use three when a fourth would be filler.** "Keep the length of choices about equal"; avoid a "Conspicuous correct choice" (Haladyna et al. 2002). Three options lose nothing: "without detrimental effects on psychometric quality of test scores" (Rodriguez 2005, meta-analysis). Two good options beat adding "a third low-quality (incorrect) alternative" (Butler 2018). More wrong options also mean more wrong answers remembered later (Roediger & Marsh 2005). **Strong** as a rule; the effect of length within one item is contested (section 2).

**3. True/False: about half False, built on a real confusion, with a correction step.** Mixing true and false statements "yielded a testing effect on short-answer criterial tests, whereas evaluating only true statements produced a testing effect on true-false criterial tests". Correcting statements marked False improved retention when feedback followed (Uner, Tekin & Roediger 2022). A contrast clause, "Castle Geyser (not Steamboat Geyser) is the tallest geyser", helped both the tested and the related fact (Brabec 2023). **Moderate.** Ours: "'Follower' (not 'Walking Away') ends with the parent stumbling behind the child: true or false?"

**4. Select-all = separate true/false judgements, scored per option, with the number correct varying.** All-or-nothing select-all is a complex format "more prone to 'clueing'" (Butler 2018). Single-answer items hide partial understanding: "nearly half of the students who select the correct MC answer likely hold incorrect understandings of the other options" (Couch, Hubbard & Brassil 2018). Per-option scoring "seemed the most promising" for select-all (Betts et al. 2022). **Moderate** for measurement; **thin** for learning.

**5. A fresh version of each question every round.** Three different questions on a concept, rather than one asked three times, "produced superior transfer of knowledge to new examples" (Butler et al. 2017). Transfer from quizzing (d = 0.40) depends on "elaborated retrieval practice, as well as initial test performance" (Pan & Rickard 2018). **Moderate.** A 100% on fresh versions shows knowledge. A 100% on the same 15 questions may only show memory of last round's answers.

**6. Mix the poems, and make similar poems compete.** "A prudent reading of the data suggests that at least a portion of the exposures should be interleaved" (Rohrer 2012). Mixed examples taught painters' styles better, yet students "rated massing as more effective" (Kornell & Bjork 2008). Effects are stronger "for learning material more similar between categories" (Brunmair & Richter 2019, g = 0.42). **Moderate**; untested on poems.

**7. Spread repetition across days instead of grinding one sitting to 100%.** Reach "3 correct recalls and then … relearn them 3 times at widely spaced intervals" (Rawson & Dunlosky 2011). Eighth-graders given three relearning sessions "recalled nearly 60% of the concepts" a month later (Dunlosky et al. 2023). **Strong** for spacing, **moderate** in schools. This research used recall, and a correct multiple-choice answer can be a guess. Our inference (untested): count a concept as secure after correct answers on two different versions, in different sessions.

**8. Aim for about three in four right first time, with difficulty coming from competing options, never from tricks or untaught content.** Items should "challenge students but allow them to succeed much of the time"; for three options the best figure is .77 (Butler 2018). Extra wrong options helped strong performers but "at lower levels of multiple-choice performance … produced costs" (Butler et al. 2006). Without the needed knowledge, difficulties "become undesirable" (Bjork & Bjork 2011). **Moderate.** The popular "85%" comes from learning algorithms, not pupils (Wilson et al. 2019).

**9. Explain every item, right or wrong.** Feedback "reduced the proportion of intrusions" from wrong options (Butler & Roediger 2008) and "doubled the retention of correct low-confidence responses" (Butler, Karpicke & Roediger 2008). Explanations beat the bare answer: 0.49 against 0.32, and 0.05 for right/wrong alone (Van der Kleij et al. 2015). **Strong.** Keep the `Why X:` notes; show them after correct answers too.

**10. Ask for judgements backed by evidence.** With middle-school and college students, "higher order and mixed quizzes improved higher order test performance, but fact quizzes did not" (Agarwal 2019). **Moderate.** Auto-markable forms: "Which line best supports the reading that…?" (every option a real quotation, which removes the quotation cue); "Which reading is better grounded in the poem?"

## 2. What the research does not support

- **That one long correct option always gives itself away.** Item studies disagree. It raised scores in Pham, Besanko & Devitt (2018); Martínez et al. (2009, 630 items) found no "negative effects of a different-length option"; a pilot was non-significant (Casu & García-García 2019). None tested a cue present in 83% of a bank. Our case rests on the guideline plus our measurement.
- **A confidence slider on its own.** A global confidence rating "does not provide the same enhancement" as choosing a point between two options (Sparck, Bjork & Bjork 2016; one paper, university students). Confident errors are corrected more often after feedback (Butterfield & Metcalfe 2001) but can return within a week (Butler, Fazio & Marsh 2011).
- **"Answer + reason" and "spot the error" as proven learning tools.** Evidence is mostly diagnosis in science (Treagust 1988). Written justifications were "usually positive", but "students are not always able to articulate the correct reason" (Koretsky et al. 2016). Error-spotting helped "only … 'good' learners" (Große & Renkl 2007). Keep these for later rounds.
- **Smaller points.** "All of the above" is mixed (Bishara & Lanzo 2015) and not needed. I found no learning studies of ordering items. Feedback timing is contested (Butler's laboratory studies against Van der Kleij et al. 2015). For word learning, blocking beat interleaving (g = −0.39; Brunmair & Richter 2019).
- **English literature specifically.** I found no controlled study of quiz design for secondary English literature or poetry. Classroom evidence is "concentrated in mathematics and science (and in KS2 to KS4)" (Perry 2022), and most studies above used university students reading science or history passages. UK practitioner advice agrees with rule 1 (Allen & Evans 2025) but is not experimental.

## 3. Checklist for every item (each line can become an automatic gate)

1. Correct option within ±20% of the average wrong-option length; across a bank, the longest option is correct in no more than about one item in three.
2. Quotation marks, dashes, qualifying clauses and absolute words appear in wrong options as often as in correct ones.
3. Every wrong option names a misreading in its `Why` note. None says "no effect", "at random", "for no reason" or "nothing to do with".
4. Three options, unless three plausible wrong options exist.
5. True/False: 40–60% keyed False per bank, each False built from a real confusion, ideally a "(not X)" clause.
6. Select-all: the number correct varies from 1 to 3, scored per option.
7. At least three versions per poem and dimension; no question repeats in consecutive rounds.
8. At least one question in three needs a quotation or a reason.
9. Nothing the student has not yet been taught (`PEDAGOGY.md` §17).
10. Feedback on every item explains the correct option and the most tempting wrong one.
11. Blind-script check: "longest / True / longer options" must score close to guessing (about a third), not 81%.

## 4. Sources

Read in full:
- Little, J. L., Bjork, E. L., Bjork, R. A., & Angello, G. (2012). Multiple-choice tests exonerated, at least of some charges. *Psychological Science*, 23(11), 1337–1344. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Little_EBjork_RBjork_Angello_2012.pdf
- Little, J. L., & Bjork, E. L. (2015). Optimizing multiple-choice tests as tools for learning. *Memory & Cognition*, 43, 14–26. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf
- Butler, A. C. (2018). Multiple-choice testing in education: Are the best practices for assessment also good for learning? *Journal of Applied Research in Memory and Cognition*, 7(3), 323–331. https://sites.wustl.edu/mdl1/files/2026/06/Butler-2018-Multiple-choice-testing-in-education-Are-the-best-practices-for-assessment-also-good-for-learning.pdf
- Butler, A. C., Marsh, E. J., Goode, M. K., & Roediger, H. L. (2006). When additional multiple-choice lures aid versus hinder later memory. *Applied Cognitive Psychology*, 20, 941–956. https://sites.wustl.edu/mdl1/files/2026/06/Butler-et-al.-2006-When-additional-multiple-choice-lures-aid-versus-hinder-later-memory.pdf
- Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition*, 36(3), 604–616. https://sites.wustl.edu/mdl1/files/2026/06/Butler-and-Roediger-2008-Feedback-enhances-the-positive-effects-and-reduces-the-negative-effects-of-multiple-choice-testing.pdf
- Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2008). Correcting a metacognitive error: Feedback increases retention of low-confidence correct responses. *JEP: Learning, Memory, and Cognition*, 34(4), 918–928. https://sites.wustl.edu/mdl1/files/2026/06/Butler-et-al.-2008-Correcting-a-metacognitive-error-Feedback-increases-retention-of-low-confidence-correct-responses.pdf
- Butler, A. C., Fazio, L. K., & Marsh, E. J. (2011). The hypercorrection effect persists over a week, but high-confidence errors return. *Psychonomic Bulletin & Review*, 18, 1238–1244. https://sites.wustl.edu/mdl1/files/2026/06/Butler-et-al.-2011-The-hypercorrection-effect-persists-over-a-week-but-high-confidence-errors-return.pdf
- Butler, A. C., Godbole, N., & Marsh, E. J. (2013). Explanation feedback is better than correct answer feedback for promoting transfer of learning. *Journal of Educational Psychology*, 105(2), 290–298. https://sites.wustl.edu/mdl1/files/2026/06/Butler-et-al.-2013-Explanation-feedback-is-better-than-correct-answer-feedback-for-promoting-transfer-of-learning.pdf
- Butler, A. C., Black-Maier, A. C., Raley, N. D., & Marsh, E. J. (2017). Retrieving and applying knowledge to different examples promotes transfer of learning. *JEP: Applied*, 23(4), 433–446. https://sites.wustl.edu/mdl1/files/2026/06/Butler-et-al.-2017-Retrieving-and-applying-knowledge-to-different-examples-promotes-transfer-of-learning.pdf
- Brabec, J. A. (2023). *The true-false test at its best: A (not the) treatise of optimization with competitive construction* (doctoral dissertation, UCLA). https://escholarship.org/uc/item/7rv1b6qc
- Sparck, E. M., Bjork, E. L., & Bjork, R. A. (2016). On the learning benefits of confidence-weighted testing. *Cognitive Research: Principles and Implications*, 1, 3. https://pmc.ncbi.nlm.nih.gov/articles/PMC5256426/
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? *Psychological Science*, 19(6), 585–592. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Kornell_Bjork_2008_PsychScience.pdf
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In *Psychology and the Real World* (FABBS / Worth), chapter 5. https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/Making-Things-Hard-on-Yourself-but-in-a-Good-Way-20111.pdf
- Dunlosky, J., Greve, M., Badali, S., Wissman, K. T., & Rawson, K. A. (2023). Successive relearning: An introduction and guide for educators. In Overson et al. (Eds.), *In Their Own Words* (APA Division 2). https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-successive-relearning-dunlosky-greve-badali-wissman-rawson.pdf
- Pham, H., Besanko, J., & Devitt, P. (2018). Examining the impact of specific types of item-writing flaws on student performance and psychometric properties of the multiple choice question. *MedEdPublish*, 7, 225. https://pmc.ncbi.nlm.nih.gov/articles/PMC10711986/
- Martínez, R. J., Moreno, R., Martín, I., & Trigo, M. E. (2009). Evaluation of five guidelines for option development in multiple-choice item-writing. *Psicothema*, 21(2), 326–330. https://www.psicothema.com/pdf/3634.pdf
- Casu, G., & García-García, C. (2019). Differential length and overlap with the stem in multiple-choice item options: A pilot experiment. *Psicología Educativa*, 25(1), 43–48. https://journals.copmadrid.org/psed/art/psed2018a20
- Perry, T. (2022). What we don't yet know about cognitive science in the classroom. *Impact*, Issue 16 (Chartered College of Teaching). https://my.chartered.college/impact_article/what-we-dont-yet-know-about-cognitive-science-in-the-classroom/

Abstract only (PubMed, ERIC or publisher page):
- Roediger, H. L., & Marsh, E. J. (2005). The positive and negative consequences of multiple-choice testing. *JEP: LMC*, 31(5), 1155–1159. https://pubmed.ncbi.nlm.nih.gov/16248758/
- Marsh, E. J., Roediger, H. L., Bjork, R. A., & Bjork, E. L. (2007). The memorial consequences of multiple-choice testing. *Psychonomic Bulletin & Review*, 14(2), 194–199. https://pubmed.ncbi.nlm.nih.gov/17694900/
- Haladyna, T. M., Downing, S. M., & Rodriguez, M. C. (2002). A review of multiple-choice item-writing guidelines for classroom assessment. *Applied Measurement in Education*, 15(3), 309–333. https://eric.ed.gov/?id=EJ660246 (guideline wording read from a reproduction: https://bookdown.org/stefanmosjos/manualesitems/_book/haladyna-2002.html)
- Rodriguez, M. C. (2005). Three options are optimal for multiple-choice items: A meta-analysis of 80 years of research. *Educational Measurement: Issues and Practice*, 24(2), 3–13. https://eric.ed.gov/?id=EJ718250
- Uner, O., Tekin, E., & Roediger, H. L. (2022). True-false tests enhance retention relative to rereading. *JEP: Applied*, 28(1), 114–129. https://pubmed.ncbi.nlm.nih.gov/34110858/
- Couch, B. A., Hubbard, J. K., & Brassil, C. E. (2018). Multiple-true-false questions reveal the limits of the multiple-choice format for detecting students with incomplete understandings. *BioScience*, 68(6), 455–463. https://academic.oup.com/bioscience/article/68/6/455/4995444
- Betts, J., Muntean, W., Kim, D., & Kao, S. (2022). Evaluating different scoring methods for multiple response items providing partial credit. *Educational and Psychological Measurement*, 82(1), 151–176. https://pmc.ncbi.nlm.nih.gov/articles/PMC8725057/
- Bishara, A. J., & Lanzo, L. A. (2015). All of the above: When multiple correct response options enhance the testing effect. *Memory*, 23(7), 1013–1028. https://pubmed.ncbi.nlm.nih.gov/25122187/
- Pan, S. C., & Rickard, T. C. (2018). Transfer of test-enhanced learning: Meta-analytic review and synthesis. *Psychological Bulletin*, 144(7), 710–756. https://pubmed.ncbi.nlm.nih.gov/29733621/
- Rohrer, D. (2012). Interleaving helps students distinguish among similar concepts. *Educational Psychology Review*, 24(3), 355–367. https://eric.ed.gov/?id=EJ977131
- Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin*, 145(11), 1029–1052. https://pubmed.ncbi.nlm.nih.gov/31556629/
- Rawson, K. A., & Dunlosky, J. (2011). Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough? *JEP: General*, 140(3), 283–302. https://pubmed.ncbi.nlm.nih.gov/21707204/
- Wilson, R. C., Shenhav, A., Straccia, M., & Cohen, J. D. (2019). The Eighty Five Percent Rule for optimal learning. *Nature Communications*, 10, 4646. https://pubmed.ncbi.nlm.nih.gov/31690723/
- Van der Kleij, F. M., Feskens, R. C. W., & Eggen, T. J. H. M. (2015). Effects of feedback in a computer-based learning environment on students' learning outcomes: A meta-analysis. *Review of Educational Research*, 85(4), 475–511. https://eric.ed.gov/?id=EJ1081708
- Agarwal, P. K. (2019). Retrieval practice & Bloom's taxonomy: Do students need fact knowledge before higher order learning? *Journal of Educational Psychology*, 111(2), doi:10.1037/edu0000282. https://eric.ed.gov/?id=EJ1205208
- Butterfield, B., & Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. *JEP: LMC*, 27(6), 1491–1494. https://pubmed.ncbi.nlm.nih.gov/11713883/
- Treagust, D. F. (1988). Development and use of diagnostic tests to evaluate students' misconceptions in science. *International Journal of Science Education*, 10(2). https://eric.ed.gov/?id=EJ380815 (ERIC summary only)
- Koretsky, M. D., Brooks, B. J., & Higgins, A. Z. (2016). Written justifications to multiple-choice concept questions during active learning in class. *International Journal of Science Education*. https://eric.ed.gov/?id=EJ1111974
- Große, C. S., & Renkl, A. (2007). Finding and fixing errors in worked examples: Can this foster learning outcomes? *Learning and Instruction*, 17(6), 612–634. https://eric.ed.gov/?id=EJ780439
- Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review. *Psychological Bulletin*, 147(4), 399–435. https://pubmed.ncbi.nlm.nih.gov/33683913/
- Allen, B., & Evans, M. (2025). Can we, and should we, write difficult multiple-choice questions? (practitioner Substack). https://100assessment.substack.com/p/can-we-and-should-we-write-difficult

## 5. Where I looked, and what I could not confirm

- Searched: web search, PubMed (E-utilities), the ERIC API, authors' lab pages (Bjork lab, UCLA; Butler lab, WUSTL) and PMC. ERIC returned nothing relevant for poetry or English-literature quiz design, for ordering items and the testing effect, or for select-all and the testing effect.
- Not read, so not relied on: Millman, Bishop & Ebel (1965) on test-wiseness; Rodriguez (1997), seen only as cited by Casu & García-García; Brabec et al. (2021) in *Educational Psychology Review*, whose findings I saw through the 2023 dissertation; Gierl et al. (2017) on distractors (abstract only); Cronbach (1942) on students guessing "True"; the full EEF review by Perry et al. (2021), blocked with HTTP 403.
- Read through a page-extraction tool rather than the raw page: the Haladyna guideline wording, the Couch abstract and the Allen & Evans quotation. The Couch wording matched a second, independent search result.
- Section 0 comes from a script over the bank text, not from student data. The 81% figure simulates a test-wise strategy; it is not observed student behaviour.
