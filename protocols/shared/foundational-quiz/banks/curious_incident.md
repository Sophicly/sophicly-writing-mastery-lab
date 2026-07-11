# Foundational Quiz Bank — The Curious Incident of the Dog in the Night-Time

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *The Curious Incident of the Dog in the Night-Time* is a **coming-of-age novel (bildungsroman)** —
so the `effects` aspect tests the reader's **empathy, hope and poignancy** at Christopher's growth and its
cost, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`curious_incident.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: The Curious Incident of the Dog in the Night-Time

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Christopher *changes* across the novel — and what drives the change?
   * **Options:** A) He is exactly the same at the end as at the start; nothing about him really changes, B) He grows from a boy confined by fear of the unfamiliar and dependent on his father into one who has travelled alone, uncovered the truth and believes he "can do anything" — driven by his own determination to investigate and to reach his mother, C) He is transformed by pure luck — events simply happen to turn out well for him, D) He is forced to change by his teacher Siobhan, who makes every decision for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The coming-of-age story IS the *change*: a boy who cannot bear the unfamiliar becomes one who crosses the country alone and finds new confidence — and the engine is his own determination, not chance or someone else's will.
   * **Why A:** He changes profoundly — the whole novel traces his growth from fearful dependence to courageous independence.
   * **Why C:** His growth is earned by his own choices and courage, not delivered by luck; treating it as chance removes the *why*.
   * **Why D:** Siobhan encourages him, but the decisions to investigate and to travel are his own — his agency is what makes the growth his.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Christopher's story a genuine *coming-of-age* rather than merely a boy growing older?
   * **Options:** A) He simply ages, without learning anything or changing how he sees the world, B) He passes from innocence to hard-won understanding — learning that people he trusted can lie, and gaining courage and independence at real emotional cost, C) He ends the novel believing exactly what he believed at the start, D) His growth costs him nothing and comes to him easily
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman is a curve from innocence to understanding, *bought not given*: Christopher's new maturity is paid for in shattered trust — and that cost is exactly what makes it real growth.
   * **Why A:** He does not just age; he unlearns his innocence about his family and the world — a genuine change of understanding.
   * **Why C:** If nothing he believed changed, there would be no coming-of-age; his view of trust, his father and himself all shift.
   * **Why D:** The growth is bought at real cost — a broken trust and a fractured family — which is what makes it more than mere adventure.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Christopher's evolution from beginning to end?
   * **Options:** A) A confident, worldly traveller at the start → a frightened recluse at the end, B) A boy who cannot bear to leave his ordered world and believes his mother is dead → a boy who has crossed the country alone, found his mother, and declares he "can do anything", C) A cruel bully at the start → a gentle friend at the end, D) A grown, working detective at the start → a helpless schoolboy at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from fearful confinement and false belief to courage and self-belief — the same boy, enlarged by what he has faced. That arc IS the coming-of-age.
   * **Why A:** This reverses his actual arc — he begins fearful of the unfamiliar and *ends* braver, not the other way round.
   * **Why C:** Christopher is not a bully; this mistakes his character entirely — his difficulty is fear of the world, not cruelty.
   * **Why D:** He is a schoolboy investigating like his hero Holmes, not a grown detective; and he grows *into* confidence, not out of it.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Christopher's growth is driven above all by his own choices — his decision to investigate Wellington's death and then to travel alone to find his mother — rather than by luck or by others deciding for him.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Others encourage or hinder him, but the determination to solve the mystery and to reach his mother is his own; that agency is what turns events into genuine growth.
   * **WhyWrong:** Treating his change as luck, or as something Siobhan or his father does *to* him, removes the choices that make the coming-of-age his own achievement.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does investigating Wellington's death *lead to* Christopher discovering that his mother is alive? (What is the causal link?)
   * **Options:** A) The two are unconnected events that simply happen one after the other, B) Investigating the dog drives him to write his book and question his father, and while searching the house he finds his mother's hidden letters — so the detective quest uncovers the family's buried truth, C) His mother returns to Swindon by coincidence, unconnected to the investigation, D) Siobhan simply tells him where his mother is living
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the investigation makes him search, question and read — and that searching unearths the letters. The mystery of the dog opens the door to the deeper mystery of his family.
   * **Why A:** In this plot the events follow by cause, not mere sequence — searching *because of* the investigation is what turns up the letters.
   * **Why C:** The discovery is not coincidence; it grows directly out of the searching his detective quest sets in motion.
   * **Why D:** Christopher finds the hidden letters himself; his father has concealed the truth, not Siobhan revealed it.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the novel — not just the order of events?
   * **Options:** A) A string of unrelated events that happen to Christopher by chance, B) He finds Wellington killed → investigates like Holmes → uncovers his father's lies and his mother's hidden letters → flees alone to London → survives the ordeal, and it gives him the confidence to sit his A-level and imagine independence, C) Nothing he does makes any difference; the outcome would be the same whatever he chose, D) His father secretly arranges every event to teach Christopher a lesson
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all set off by the dead dog: investigation → discovery → flight → hard-won growth. That causal spine is what makes it a coming-of-age arc, not a chronicle.
   * **Why A:** His journey is not random misfortune — each step is the logical consequence of the last, beginning with the investigation.
   * **Why C:** If his choices made no difference there would be no growth; the whole arc turns on what he decides to do.
   * **Why D:** No one stages the events; they unfold from Christopher's own investigation and his father's concealed guilt.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that makes the rest of Christopher's journey inevitable — the point of no return?
   * **Options:** A) Christopher deciding to number his chapters with prime numbers, B) The discovery of the hidden letters revealing his mother is alive and that his father lied about her death — his trust collapses and he can no longer stay, C) Christopher passing his maths A-level with a top grade, D) The first sight of Wellington lying dead on Mrs Shears's lawn
   * **Correct:** B
   * **Feedback:** ✓ Correct. Finding the letters — and soon after, that his father also killed Wellington — shatters Christopher's trust. Once he can no longer feel safe at home, the flight to London and everything after follows from it. That is the turning point.
   * **Why A:** The prime-numbered chapters reflect his mind but change nothing in the plot; they are a detail, not the turning point.
   * **Why C:** The A-level is a *consequence* near the end — a sign the growth is complete — not the choice that set the later events in motion.
   * **Why D:** Wellington's death is the *inciting* incident that starts the investigation; the turning point is the later collapse of trust that drives him away.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novel, Christopher's flight to London and his later achievements follow by cause-and-effect from the investigation and the shattering of his trust — they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Coming-of-age plot is built on necessity, not mere sequence: he runs *because* trust breaks, and he grows *because* he survives the running. Each event is because of the last.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the story a growth arc rather than a diary of happenings.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Christopher finds it almost impossible to lie, yet his father repeatedly deceives him. What does this reveal about the novel's view of trust and truth?
   * **Options:** A) That lies never really matter, B) That trust, once broken by lies, is painful and slow to rebuild — Christopher, who cannot lie himself, is devastated by his father's deceptions and must learn to trust again, C) That Christopher is the one who lies constantly, D) That every character always tells the truth
   * **Correct:** B
   * **Feedback:** ✓ Correct. The gap between Christopher's honesty and his father's lies is the novel's whole argument about trust: deception wounds deeply, and rebuilding faith after it is slow, hard work.
   * **Why A:** The lies matter enormously — they shatter Christopher's world and drive the second half of the book.
   * **Why C:** A key point about Christopher is that he *cannot* lie; that is precisely what makes his father's dishonesty so wounding.
   * **Why D:** Christopher is repeatedly deceived, above all by his father — trust cannot be taken for granted here.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which idea does the novel most explore through Christopher's unusual way of seeing the world — and how does it *work*?
   * **Options:** A) That a mind which thinks differently is less capable and to be pitied, B) That a mind which perceives the world differently has its own clarity, honesty and courage — the novel invites us to *value* Christopher's way of seeing, not to correct it, C) That Christopher ought to try to become exactly like everyone else, D) That his talents are worthless
   * **Correct:** B
   * **Feedback:** ✓ Correct. The controlling idea is difference-as-worth: by placing us inside Christopher's logical, literal mind, the novel makes us admire its clarity and courage rather than pity its owner.
   * **Why A:** The novel presents Christopher as highly capable — gifted in maths and brave under pressure; the deficit reading is the one it argues *against*.
   * **Why C:** The story celebrates Christopher as he is, rather than urging him to erase his differences.
   * **Why D:** His gifts, especially in mathematics, are shown to be considerable and full of promise.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Christopher relies on private systems — prime numbers, maths, counting cars ("a Good Day"). Which idea do these most explore, and how do they *work*?
   * **Options:** A) They are meaningless quirks with no purpose in the book, B) They are how Christopher imposes order and safety on a world he finds chaotic and frightening — logic is his defence against a bewildering reality, C) They prove that Christopher cannot think logically, D) They show that the world really is perfectly ordered
   * **Correct:** B
   * **Feedback:** ✓ Correct. The theme is order against chaos: Christopher's maths and counting are how a frightened mind makes an unpredictable world feel safe and navigable.
   * **Why A:** The systems are central, not incidental — they dramatise how Christopher copes with a world that overwhelms him.
   * **Why C:** They show the opposite — a mind of intense logical order, using rules to steady itself.
   * **Why D:** The world Christopher lives in feels chaotic to him; the order is one *he* imposes, not one already there.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** Christopher's terror of crowds and noise, set against his decision to travel alone to London, dramatises the idea that real courage is pushing through fear rather than the absence of it.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The journey terrifies him, yet he presses on to reach his mother; the novel locates courage precisely in acting *despite* fear — one of its clearest controlling ideas.
   * **WhyWrong:** Courage in the novel is not fearlessness; it is Christopher overcoming genuine terror to do what he must — that is the theme the journey dramatises.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** The novel is a coming-of-age story. Why do we feel *empathy and hope* for Christopher as he struggles across a bewildering world, rather than mere pity?
   * **Options:** A) Because we are amused by his difficulties, B) Because we share his fear and root for his courage — his effort to grow and to find his mother moves us to empathy and hope, not to pity from above, C) Because we feel dread and horror at what awaits him, D) Because we admire the clever first-person narration with its diagrams and lists
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman is built to make us *feel with* its young hero: because we see the world through Christopher's eyes, his courage stirs empathy and hope, not detached pity.
   * **Why A:** Amusement is the wrong response — the novel invites us to feel *with* Christopher's struggle, not to be entertained by it.
   * **Why C:** Dread and horror belong to a gothic tale; this coming-of-age story moves us toward empathy and hope instead.
   * **Why D:** The diagrams and lists are *techniques*; the effect is a feeling — empathy for Christopher — not the naming of a device.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel such as this is designed, above all, to make the reader feel which response?
   * **Options:** A) Triumphant amusement, B) Empathy and hope — a poignant feeling for a young person's growth and the cost at which it comes, C) Fear as a warning, as in a dystopia, D) Pity and fear, as in a tragedy
   * **Correct:** B
   * **Feedback:** ✓ Correct. The coming-of-age form aims at empathy and hope tinged with poignancy: we feel *with* the young person, moved by growth that is real yet bought at a price.
   * **Why A:** Amusement belongs to comedy; a coming-of-age story that merely entertained would miss its purpose.
   * **Why C:** Fear-as-warning is the effect of dystopia — the wrong genre for Christopher's hopeful growth.
   * **Why D:** Pity and fear are the effects of *tragedy*; this novel ends in earned hope, not catastrophe — a crucial contrast.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why is the ending — Christopher's conviction that he "can do anything" — so *poignant* rather than simply happy?
   * **Options:** A) Because all his problems have vanished and nothing at all has been lost, B) Because his hard-won confidence is genuine yet bought at real cost — a broken trust and a fractured family — so we feel hope and poignancy together, C) Because we feel horror at what Christopher has become, D) Because we are impressed by the prime-number chapter headings
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poignancy is in the *mixture*: Christopher's triumph is real and moving, but it comes after pain and loss, so hope and ache arrive together — the signature feeling of coming-of-age.
   * **Why A:** The cost is exactly what makes the ending poignant; pretending nothing was lost flattens the feeling into mere cheerfulness.
   * **Why C:** Horror is the wrong emotion — we feel warmth and hope for Christopher, not dread at him.
   * **Why D:** The chapter headings are a *technique*; the effect is a feeling — poignant hope — not admiration for a device.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** The novel is a coming-of-age story, and its emotional effect is empathy and hope — we feel for Christopher's courage and are moved by the growth he wins at real cost — rather than amusement or dread.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That blend — empathy for the struggling boy and hope at his growth, shadowed by its cost — is the feeling a bildungsroman is built to produce.
   * **WhyWrong:** The intended effect is empathy and hope, not amusement (comedy) or dread (gothic); the ending's earned confidence is meant to move us, not merely to entertain or frighten.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about minds that see the world differently?
   * **Options:** A) That people who think differently should be pitied and shielded from the world, B) That a mind which perceives the world differently is not lesser but has its own clarity, courage and worth — and, with determination, can face and master a bewildering world, C) That Christopher would be better off becoming exactly like everyone else, D) That difference makes real achievement impossible
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's enduring "so what" is that difference is not deficiency: Christopher's way of seeing carries real strength, and his journey proves such a mind can meet the world on its own terms.
   * **Why A:** The novel argues the opposite of pity — it asks us to *respect* Christopher's capability, shown by all he achieves.
   * **Why C:** The message celebrates Christopher as he is; conforming to others is not the growth the book values.
   * **Why D:** Christopher's success — the journey, the A-level — refutes this; his difference is a source of strength, not a barrier.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** At the close Christopher reflects: "I found my mother and I was brave and I wrote a book and that means I can do anything." What enduring idea does the ending affirm?
   * **Options:** A) That achievement is really a matter of luck, B) That courage and perseverance through fear can transform a life — having faced the world and survived, Christopher rightly believes he can do anything, C) That the safest life is one that never leaves home, D) That truth and trust do not matter in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line gathers up the whole arc: Christopher's confidence is earned by what he has *done*, so the novel affirms that determination through fear is genuinely transforming.
   * **Why A:** His achievements are earned through his own courage and effort, not luck — that is the point the line makes.
   * **Why C:** The ending affirms the opposite — that leaving safety and facing the world is what enlarges Christopher.
   * **Why D:** Truth and trust matter greatly here; the confidence of the ending is built on the truth he uncovered and the trust he begins to rebuild.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that a mind which sees the world differently is a source of strength, not a deficiency — the book asks us to value Christopher's way of seeing rather than to correct it.
   * **Answer:** True
   * **Feedback:** ✓ Correct. By living inside Christopher's logic and honesty, the novel makes his difference a strength to admire — its central, enduring claim about how we should regard such minds.
   * **WhyWrong:** The novel's message is that difference is worth, not lack; reading Christopher as someone to be pitied or corrected misses the "so what" the whole book affirms.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel ultimately suggest about truth, trust and family?
   * **Options:** A) That lies are harmless as long as they are well-meant, B) That truth and trust are the foundation of love — lies, even meant kindly, wound deeply, and trust once broken must be slowly and painfully rebuilt, C) That family bonds do not really matter, D) That Christopher can never forgive anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ed's lies are meant to protect Christopher, yet they devastate him; the novel's enduring message is that love rests on truth, and broken trust can only be rebuilt slowly, through honesty.
   * **Why A:** Ed's lies are well-meant but they still shatter Christopher — the novel insists that kindly-intended deception still wounds.
   * **Why C:** Family bonds matter enormously; the whole second half turns on repairing them.
   * **Why D:** The ending moves toward rebuilding trust, not permanent estrangement — Christopher begins, cautiously, to trust his father again.
