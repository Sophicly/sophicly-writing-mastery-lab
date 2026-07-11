# Foundational Quiz Bank — The Sign of the Four

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. The Sign of the Four is a **detective mystery with a Gothic strain** → the `effects` aspect tests
the reader's **suspense and fascinated dread** (the pull to uncover a hidden truth as danger closes in),
not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`sign_of_the_four.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: The Sign of the Four

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Holmes *changes* across the novel — and what drives the change?
   * **Options:** A) He is exactly the same cold, tireless machine from first page to last, untouched by events, B) He begins numbed and restless in drug-induced boredom and is transformed into the fiercely engaged, masterful reasoner by a real case — driven by his own craving for mental work, C) He is a bumbling amateur who slowly learns how to detect, D) The cocaine takes him over and he has no say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel opens on a Holmes idle and deadened, then a genuine mystery reignites him; the engine of the change is his own hunger for brainwork, not chance or the drug.
   * **Why A:** He is *not* unchanged — he moves from listless stagnation to electric engagement; missing that arc misses the point of the opening chapter.
   * **Why C:** He is a master from the start, not a learner; his skill is a given, and what shifts is his energy and purpose.
   * **Why D:** The cocaine is a symptom of his boredom, not a force controlling him; removing his agency turns a self-driven man into a puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Holmes's evolution across the novel?
   * **Options:** A) A cheerful, contented man at the start → a broken despairing one at the end, B) An idle, drugged Holmes whose "mind rebels at stagnation" → an energised reasoner absorbed in the hunt → back to the cocaine bottle once the stimulation ends, C) A criminal at the start → a reformed detective at the end, D) A clumsy beginner at the start → a competent detective at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. His arc is a self-driven cycle: stagnation rouses to mastery when the case grips him, then subsides again to the needle when the work is done — the same restless nature throughout.
   * **Why A:** He is restless and deadened at the opening, not contented, and satisfied (not broken) at the close; this reverses his actual movement.
   * **Why C:** Holmes is the detective throughout, never a criminal; this confuses who he is entirely.
   * **Why D:** He is already the supreme reasoner; the change is in his engagement, not his competence.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Watson also travels an arc in the novel. Which best captures how he *changes* — and what drives it?
   * **Options:** A) He grows to hate Holmes and leaves him, B) He moves from a solitary companion to a man in love, engaged to Mary Morstan — a change driven by his own growing feeling as the case unfolds, C) He becomes a criminal, D) He turns into a better detective than Holmes
   * **Correct:** B
   * **Feedback:** ✓ Correct. Watson's evolution is the human thread beside the mystery: he falls in love with the client and ends betrothed — driven by his own deepening affection, not by arrangement or chance.
   * **Why A:** Watson remains Holmes's loyal friend; there is no rupture between them.
   * **Why C:** Watson is the honest narrator and companion, never a wrongdoer.
   * **Why D:** Watson admires Holmes's reasoning but never surpasses it; his growth is emotional, not deductive.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Holmes's transformation from listless stagnation to brilliant engagement is driven by his own craving for mental work — no one forces the change upon him.
   * **Answer:** True
   * **Feedback:** ✓ Correct. "My mind rebels at stagnation" is the key: the case reanimates him because he *needs* the challenge; the drive is internal, which is what makes the arc his own.
   * **WhyWrong:** Nothing external compels the change — the drug is a symptom of his boredom, not its cause; treating him as passively acted upon removes the self-driven hunger that defines him.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the stolen Agra treasure *lead to* Bartholomew Sholto's murder? (What is the causal link?)
   * **Options:** A) The two are unconnected events that simply happen in the same story, B) Major Sholto's theft of the treasure betrayed Jonathan Small, whose long-nursed vow of revenge finally brings him and Tonga to reclaim it — and the killing follows from that chain, C) Holmes causes the murder by investigating, D) Bartholomew dies by pure accident with no cause
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the original betrayal over the treasure sets Small on a course of revenge, so the death at Pondicherry Lodge is the outworking of a chain begun years earlier in India — not a random crime.
   * **Why A:** In a mystery the crimes follow by hidden cause, not mere coincidence; reading them as unconnected misses the buried chain the plot exists to reveal.
   * **Why C:** Holmes uncovers the cause; he does not create it — the murder springs from Small's revenge, not the investigation.
   * **Why D:** The death is the deliberate result of Small and Tonga's break-in to seize the treasure, not an accident.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* behind the crimes — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike by bad luck, B) A betrayal over the treasure in India → Small imprisoned, vowing revenge → his escape with Tonga → the raid to reclaim the treasure → Bartholomew's death and the treasure's flight → the Thames chase → the confession that lays the whole cause bare, C) The police cause each step by blundering, D) Fate alone arranges everything, and no one's choices matter
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all rooted in the original betrayal; the present-day crime is the return of a buried past. That causal spine is what makes it a mystery, not a list of happenings.
   * **Why A:** The crimes are not random — they are the logical unfolding of a wrong done years earlier over the treasure.
   * **Why C:** The bumbling police (Athelney Jones) obstruct but do not cause the chain; the cause is Small's revenge.
   * **Why D:** The plot turns on human choices — Sholto's theft, Small's vow — not on impersonal fate.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the steam-launch chase down the Thames *lead to* the mystery being solved?
   * **Options:** A) The chase is exciting but changes nothing about the solution, B) Capturing Jonathan Small ends the flight and forces his confession — the only source of the hidden history the whole case depends on, so the pursuit *causes* the revelation, C) The treasure is recovered in the chase and explains everything, D) The police solve it by luck, unrelated to the chase
   * **Correct:** B
   * **Feedback:** ✓ Correct. The chase is not mere spectacle: it seizes the one man who holds the buried backstory, and his confession supplies the cause the reader has been kept blind to. The pursuit is what unlocks the truth.
   * **Why A:** The chase is the hinge — without Small's capture there is no confession, and without the confession the hidden cause stays sealed.
   * **Why C:** The treasure is *lost* in the river, not recovered; it is Small's confession, not the gold, that explains the crimes.
   * **Why D:** The resolution comes through Holmes's pursuit and Small's testimony, not police luck.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** The murders and thefts in the novel form a cause-and-effect chain reaching back to a betrayal in India — they are not a string of unconnected crimes that merely happen in sequence.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Mystery plotting is built on hidden causation: the present crime is the return of a past wrong, each event *because of* the last, all rooted in the theft of the Agra treasure. That buried chain is the story's spine.
   * **WhyWrong:** Reading the crimes as unconnected ("they just happen one after another") misses the causal necessity — the very thing a detective plot exists to uncover and lay bare.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Holmes declares that "Detection is, or ought to be, an exact science." What does this reveal about the novel's view of reason?
   * **Options:** A) That reason is powerless against real mystery, B) That disciplined reason and observation can bring order to chaos — detection as rigorous logic, not luck or guesswork, C) That solving crime is a matter of chance, D) That intuition and magic solve the case
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line sums up the novel's faith in method: the world's confusions can be read and mastered by patient reasoning, and Holmes embodies that Victorian confidence in science.
   * **Why A:** The novel celebrates reason's power to explain, not its helplessness — Holmes's deductions pierce the mystery.
   * **Why C:** Holmes rejects chance; his whole method is systematic reasoning from evidence.
   * **Why D:** There is no magic or mere intuition — the case yields to observation and logic.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The Agra treasure drives the plot yet is finally lost in the Thames. Which controlling idea does this most explore?
   * **Options:** A) That wealth is the just reward of virtue, B) That greed and plundered riches bring betrayal, death and ruin rather than happiness — the treasure curses all who chase it, C) That money guarantees a happy ending, D) That the treasure is unimportant to the story
   * **Correct:** B
   * **Feedback:** ✓ Correct. The treasure sparks betrayal, murder and grief and ends at the bottom of the river; the novel's argument is that riches built on greed and plunder corrupt and destroy, never satisfy.
   * **Why A:** The treasure is won by theft and betrayal, not virtue, and it rewards no one — the idea is the opposite.
   * **Why C:** Far from a happy ending, the fortune brings only death; its loss, not its gain, clears the way for happiness.
   * **Why D:** The treasure is central — it is the engine of the whole chain of crime and its loss is thematically pointed.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Watson's love for Mary runs beside Holmes's cold detachment. Which idea does this tension most explore?
   * **Options:** A) That love and reason are exactly the same thing, B) That human feeling and calculating reason stand in tension — and that the loss of the treasure clears the way for love to flourish, C) That love has no place in the novel, D) That Holmes falls in love too
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel weighs Watson's warmth against Holmes's detachment (who prizes the reasoning mind above feeling); tellingly, the fortune that would have set Mary above Watson is lost, freeing their love.
   * **Why A:** The novel *contrasts* feeling and cold reason rather than equating them — Holmes distrusts emotion as a clouding of judgement.
   * **Why C:** The romance is a deliberate human thread beside the mystery, ending in Watson's engagement.
   * **Why D:** Holmes remains detached; it is Watson, not Holmes, who loves and marries.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In the novel the Agra treasure, rooted in colonial plunder and greed, brings only betrayal, death and ruin — and is finally lost in the Thames.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The riches that drive every crime end scattered in the river; the novel's idea is that plundered, greed-driven wealth curses those who pursue it and is rightly lost.
   * **WhyWrong:** The treasure does bring misfortune — tied to greed and the wrongs of empire, it causes death and division and is never recovered.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** The Sign of the Four is a detective mystery. Why do we feel a tense *fascination* as the story unfolds?
   * **Options:** A) Because the truth is handed to us at once, leaving nothing to wonder about, B) Because the truth is withheld and released clue by clue — we are kept partly blind, gripped by the pull to see the hidden secret revealed, C) Because the effect is the first-person narration, D) Because we feel amused and light-hearted throughout
   * **Correct:** B
   * **Feedback:** ✓ Correct. A mystery grips through controlled withholding: the gap between the evidence we see and the truth we cannot yet reach holds us in taut fascination, needing to read on until the secret breaks.
   * **Why A:** The suspense depends on *not* knowing — the truth is doled out slowly, which is exactly what creates the pull.
   * **Why C:** "First-person narration" names a technique, not the feeling it produces; the effect is the reader's fascinated suspense.
   * **Why D:** Amusement belongs to comedy; a mystery is built to grip and unsettle, not to amuse.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** What is the emotional effect of the novel's grotesque, Gothic touches — Bartholomew's fixed death-grin, the poisoned thorn, Tonga in the dark, the river fog?
   * **Options:** A) Comfort and reassurance, B) Dread and unease — a shiver of horror that sharpens the mystery's sense of menace, C) The effect is simply "imagery" and "setting", D) Amusement at how silly they are
   * **Correct:** B
   * **Feedback:** ✓ Correct. These grotesque details are built to disturb: the death-grin, the unseen killer and the fog charge the mystery with dread, so the hunt feels genuinely dangerous, not merely clever.
   * **Why A:** The touches are meant to unsettle, not soothe — they make the threat feel close and real.
   * **Why C:** "Imagery" and "setting" name devices, not the feeling; the effect is the dread those devices arouse.
   * **Why D:** The Gothic detail is designed to chill, not to amuse — reading it as silly misses its unsettling purpose.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel suspense and then astonishment as Holmes reaches his conclusions?
   * **Options:** A) Because we always know more than Holmes and are never surprised, B) Because we are kept as much in the dark as Watson, so each revelation lands as a thrill of surprise as the withheld truth breaks through, C) Because the effect is that the story is told in the first person, D) Because we feel bored, having guessed everything already
   * **Correct:** B
   * **Feedback:** ✓ Correct. Being held at Watson's level of knowledge keeps us blind to the reasoning until it is unveiled, so each deduction arrives as a genuine shock of understanding — that suspense-then-surprise is the mystery's designed feeling.
   * **Why A:** We are kept *behind* the solution, not ahead of it — that gap is what makes the reveals startle us.
   * **Why C:** "Told in the first person" names a technique; the effect asked for is the *feeling* — suspense giving way to astonishment.
   * **Why D:** The withholding is precisely what stops us guessing; boredom is the mark of a failed mystery, not this one.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** A detective mystery like this is built above all to make us feel suspense and a fascinated dread — the pull to uncover a hidden truth as danger closes in — not amusement or triumph.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The controlled release of clues, the grotesque Gothic menace and the claustrophobic viewpoint all serve one emotional aim: to hold us in tense, fascinated dread until the secret breaks and order is restored.
   * **WhyWrong:** The intended effect is suspense and fascinated dread, not amusement or triumph; a mystery that merely entertained or reassured would fail its purpose.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about reason and the world?
   * **Options:** A) That the world is unknowable and confusion always wins, B) That disciplined reason can pierce even the darkest confusion and restore order — a faith that the truth, however hidden, can be uncovered and known, C) That crime is best solved by luck, D) That mystery is beyond any human understanding
   * **Correct:** B
   * **Feedback:** ✓ Correct. Holmes's method turns a baffling, menacing puzzle into a solved and ordered account — the enduring "so what" is a confidence that patient reason can master the hidden truths of the world.
   * **Why A:** The novel affirms the opposite — that the hidden *can* be known when reason is applied.
   * **Why C:** It insists on method over chance; luck is precisely what Holmes rejects.
   * **Why D:** Far from beyond understanding, the mystery is fully explained by the close through reasoning.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about wealth and empire does the novel affirm through the fate of the Agra treasure?
   * **Options:** A) That riches built on plunder are a glorious reward, B) That wealth seized through greed and colonial plunder brings ruin, not happiness — the treasure curses all who chase it and is rightly lost, a quiet unease about the wrongs at empire's heart, C) That the empire's riches always bring peace, D) That greed is harmless and profitable
   * **Correct:** B
   * **Feedback:** ✓ Correct. The treasure, rooted in the plunder of India, sows only betrayal and death and ends in the river; the novel's message is that such greed-driven, ill-gotten wealth destroys, and it lets a shadow fall over empire's spoils.
   * **Why A:** The plundered treasure is a curse, not a glory — it rewards no one and is lost.
   * **Why C:** The imperial fortune brings violence and division, not peace.
   * **Why D:** Greed here is ruinous, not harmless — it drives every crime in the book.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that greed for stolen wealth destroys those who pursue it — the Agra treasure brings only death and is finally lost, so no one profits from the crime.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Every hand that grasps at the treasure meets betrayal or ruin, and it ends scattered in the Thames; the moral is that greed-driven, plundered riches bring destruction, not reward.
   * **WhyWrong:** The novel insists that no one profits from the treasure — the greed it inspires brings only death, and the fortune itself is lost forever.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the ending ultimately affirm about order and justice?
   * **Options:** A) That crime pays and the criminal triumphs, B) That truth and order are restored — the guilty are caught, the mystery solved, the corrupting treasure removed, and human happiness (Watson and Mary's love) can flourish once the fortune is gone, C) That disorder wins and the detective fails, D) That the treasure secures a happy marriage
   * **Correct:** B
   * **Feedback:** ✓ Correct. By the close the case is solved, Small is taken, the divisive treasure is gone, and Watson is free to marry Mary — the restoration of order, and the clearing away of greed, that the mystery is built to deliver.
   * **Why A:** Small is captured and the crime laid bare; wrongdoing does not triumph.
   * **Why C:** Holmes solves the mystery and order returns; the detective succeeds.
   * **Why D:** It is the *loss* of the treasure, not its keeping, that frees Watson and Mary to marry.
