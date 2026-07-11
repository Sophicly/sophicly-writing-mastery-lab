# Foundational Quiz Bank — My Name Is Leon

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *My Name Is Leon* is a **coming-of-age novel (bildungsroman) rooted in social realism** → the
`effects` aspect tests the reader's **empathy, poignancy and tender hope** (edged with pathos at the
injustice Leon suffers), not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`my_name_is_leon.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: My Name Is Leon

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Leon *changes* across the novel — and what drives the change?
   * **Options:** A) He is an angry, damaged boy from the first page and never really changes, B) He begins a bewildered, grieving child torn from his family and becomes a boy who, through his own fierce love and his slow reaching for belonging, finds a fragile stability and hope, C) He forgets his family and simply grows up carefree, D) He is passively rescued by the adults, who sort out his life while he stays the same
   * **Correct:** B
   * **Feedback:** ✓ Correct. The heart of the novel is Leon's *growth*: a child broken by separation who, by holding on to those he loves and working at belonging (the allotment, protecting his brother), edges towards hope. The change is his own doing, not something done to him.
   * **Why A:** He is not fixed in anger — the novel traces a real journey from raw grief towards fragile stability; reading him as unchanging kills the coming-of-age arc.
   * **Why C:** He never forgets his family — his love for his mother and brother is what drives him; "carefree" misses the cost of his growth.
   * **Why D:** Adults help (Maureen especially), but Leon's own resilience and love do the growing; making him passive removes the agency that makes it his coming-of-age.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What most drives Leon's growth towards hope by the end?
   * **Options:** A) Pure luck — good things simply happen to him, B) His own refusal to forget his family and his active reaching for belonging — protecting his brother, working the allotment, insisting on who he is, C) The care system efficiently solving all his problems, D) His decision to give up caring about anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Leon is not merely carried along: he clings to his family, channels grief into the allotment, and asserts his own selfhood. His growth is earned through his own responses to loss — that is what makes it a coming-of-age.
   * **Why A:** His stability is hard-won, not lucky; treating it as chance erases the effort and love that produce it.
   * **Why C:** The system in fact fails him (it separates him from his brother); his hope comes despite it, through people who care and his own resilience.
   * **Why D:** The opposite is true — it is precisely his refusal to stop loving that carries him through.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Leon's evolution from beginning to end?
   * **Options:** A) A contented, settled boy at the start → a lonely runaway at the end, B) A bewildered, angry child torn from his mother and baby brother → a boy who has begun to find belonging and hope through care and the allotment, C) A cheerful orphan at the start → a wealthy adult at the end, D) A cruel child at the start → a hardened loner at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from raw loss and confusion towards a tentative, hard-won hope — the same boy, slowly healing. That arc IS the coming-of-age.
   * **Why A:** He begins in upheaval, not contentment, and ends reaching towards belonging, not deeper isolation — this reverses his actual arc.
   * **Why C:** He remains a child at the close, not a wealthy adult; and he is not an orphan — his mother is alive but unable to cope.
   * **Why D:** His difficult behaviour is grief, not cruelty, and he ends opening towards hope, not hardening — this misreads both ends.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Leon's growth towards hope is driven above all by his own resilience and love — the adults help, but he is not simply rescued, nor does he grow by forgetting his family.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Maureen's warmth and the mentors at the allotment matter, but it is Leon's own refusal to stop loving and his reaching for belonging that carry him forward — the agency that makes the change his coming-of-age, not a rescue.
   * **WhyWrong:** Leon is not a passive object of the adults' care, and he does not heal by forgetting — treating him that way removes the resilience and love that actually drive his growth.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Leon *end up* in the care system? (What is the causal link?)
   * **Options:** A) It simply happens for no reason the novel gives, B) His mother becomes unable to cope and look after her children, so Leon and his baby brother are taken into care, C) Leon chooses to leave home, D) His mother emigrates and leaves him behind
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: his mother's breakdown means she can no longer care for the children, and that inability is the reason Leon and his brother are removed. The plot turns on cause, not accident.
   * **Why A:** There is a clear cause — his mother's inability to cope; reading it as random misses the chain that drives the story.
   * **Why C:** Leon does not choose to leave; he is taken into care because of his mother's situation, not his own decision.
   * **Why D:** His mother does not emigrate — she is present but unwell and unable to cope; that is the actual cause.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Leon's baby brother get adopted while Leon does not — what *causes* the separation?
   * **Options:** A) The brothers simply drift apart by chance, B) The baby is younger, easily adopted, while Leon is older and mixed-race, so the system's preferences leave him behind — the separation is caused by how that system works, not luck, C) Leon asks to be sent away on his own, D) The brothers dislike each other and want to be apart
   * **Correct:** B
   * **Feedback:** ✓ Correct. The separation is *caused* by the care system's preferences — a young, readily-adopted baby against an older, mixed-race boy. Reading it as chance misses the social critique the plot is built on.
   * **Why A:** It is not chance — the outcome follows from the system's choices about age and race; "drift apart" erases the cause.
   * **Why C:** Leon longs to stay with his brother; he never asks to be separated — the separation is done to him.
   * **Why D:** The brothers love each other fiercely; the separation is imposed by the system, not wanted by them.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Leon's story — not just the order of events?
   * **Options:** A) A random series of unconnected episodes, B) His mother's breakdown → Leon and the baby taken into care → the baby adopted while Leon is left → Leon's grief and anger → his reaching for belonging on the allotment → a fragile, hard-won hope, C) The care system fixes everything smoothly from the start, D) Leon causes his own removal by misbehaving
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before: the breakdown causes the removal, the removal causes the loss of his brother, that loss drives his grief and his search for belonging. That causal spine is the coming-of-age arc, not a list of events.
   * **Why A:** The events are tightly linked by cause; reading them as unconnected misses how each loss produces the next stage of Leon's journey.
   * **Why C:** The system in fact separates the brothers; it does not smooth everything over — Leon's hope comes despite it.
   * **Why D:** Leon's difficult behaviour is a *result* of his grief, not the cause of his removal; the cause is his mother's inability to cope.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novel the later events follow by cause-and-effect from his mother's inability to cope and the care system's choices — they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The breakdown causes the removal; the removal and the system's preferences cause the separation from his brother; that loss drives everything Leon feels and does. Each event is *because of* the last — a causal arc, not a chronicle.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — his mother's breakdown and the system's choices set the whole chain in motion.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Leon's ache for his mother and his baby brother drives the whole novel. What does this reveal about its view of family and separation?
   * **Options:** A) That children forget their families quickly, B) That children feel the loss of family as deeply as adults — separation is a wound that shapes everything Leon does, C) That family bonds are unimportant, D) That only adults truly suffer when a family breaks up
   * **Correct:** B
   * **Feedback:** ✓ Correct. Leon's longing is the novel's emotional core, insisting that a child's grief at losing his family is as profound and lasting as any adult's — the controlling idea the whole story explores.
   * **Why A:** Leon holds on to his family fiercely; the novel argues the opposite of forgetting.
   * **Why C:** Family bonds matter enormously to Leon — they are precisely what the separation tears.
   * **Why D:** The novel centres a *child's* suffering to insist that children feel loss just as deeply.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** What does Leon's work on the allotment most explore as a controlling idea — and how does it *work* in the novel?
   * **Options:** A) A way to make money, B) Growth, patience and belonging — the slowly growing plants mirror Leon's own healing and give him a place where he matters, C) A pointless hobby that fills time, D) A punishment imposed on him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The allotment carries the novel's idea of nurture and renewal: as the plants grow with patience and care, so does Leon, and the mentorship he finds there gives him belonging the system cannot.
   * **Why A:** Its value is emotional, not financial — the point is what it grows in Leon, not money.
   * **Why C:** It is deeply meaningful, a source of stability and belonging, not idle time-filling.
   * **Why D:** The allotment is a refuge and a comfort, the reverse of a punishment.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Race runs through the novel as a controlling idea. Which best captures how it *works*?
   * **Options:** A) Race plays no part in the story, B) Leon is mixed-race, and race shapes how he is treated — set beside his adopted white baby brother, it exposes the inequities of the care and adoption system, C) Everyone in the novel is treated identically, D) Race matters only to the adults, never to Leon
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel makes race central: the contrast between Leon and his readily-adopted baby brother dramatises how a child's race can shape his whole experience of care — a quiet, pointed social critique.
   * **Why A:** Race is central to how Leon is seen and to why he is separated from his brother.
   * **Why C:** The novel highlights unequal treatment — the very opposite of everyone being treated the same.
   * **Why D:** Race shapes Leon's own experience directly; it is not only an adult concern.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novel treats grief and anger together, showing how a child may express deep hurt through frustration and difficult behaviour.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Leon's outbursts are the surface of a profound grief; the novel reads his anger with understanding, insisting that difficult behaviour in a hurt child is loss speaking, not badness.
   * **WhyWrong:** This is true — Leon's anger and difficult behaviour are expressions of deep grief and loss, not simple naughtiness.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *My Name Is Leon* is a coming-of-age story told close to a child's understanding. Why do we feel such tender *empathy* — and a poignant ache — for Leon?
   * **Options:** A) Because the adult world's failures reach us through his innocent, half-understanding eyes, so his confusion and the injustice done to him cut all the deeper, B) Because the effect is the use of a child narrator, C) Because we find his troubles amusing, D) Because we feel nothing much for him
   * **Correct:** A
   * **Feedback:** ✓ Correct. Seeing loss and injustice through a child who only half-grasps them makes us feel both his bewilderment and the unfairness more sharply — the tender, aching empathy a coming-of-age novel is built to produce.
   * **Why B:** That names a *technique* (the child's viewpoint), not the feeling; the effect we are asked for is the empathy and ache, not the device that creates it.
   * **Why C:** Amusement is the wrong emotion for this story of a grieving child — the intended feeling is pity and tender hope, not laughter.
   * **Why D:** The whole novel is engineered to make us care deeply for Leon; feeling nothing misses its emotional purpose entirely.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel about a child in the care system is designed to make the reader feel — above all — which emotions?
   * **Options:** A) Amusement and triumph, B) Empathy and poignant hope — tender feeling for a child growing through loss, edged with a pang at the injustice he suffers, C) Dread and horror, D) Boredom and indifference
   * **Correct:** B
   * **Feedback:** ✓ Correct. The form aims to move us to empathy for Leon's growth and its cost, and to a poignant hope for the belonging he begins to find — with pathos at the unfairness along the way.
   * **Why A:** Amusement and triumph belong to comedy; a story of a grieving child in care that merely entertained would miss its purpose.
   * **Why C:** Dread and horror are the emotions of the gothic — the wrong genre; this novel moves us with tenderness, not terror.
   * **Why D:** Boredom is the mark of a *failed* coming-of-age story, not its aim; the novel is built to make us care.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the ending leave us with a poignant *hope* rather than despair?
   * **Options:** A) Because Leon's troubles are all magically solved, B) Because the stability and belonging Leon begins to find are hard-won and real — so his fragile hope feels earned, and moves us, C) Because the effect is the novel's realistic setting, D) Because we stop caring what happens to him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The hope lands *because* it is fragile and earned through loss, not handed over — that hard-won quality is exactly what makes the close moving rather than sentimental.
   * **Why A:** Nothing is magically solved — Leon's losses remain real; the hope is tentative, which is why it feels true.
   * **Why C:** That names a *technique* (the realist setting), not the feeling; the effect we are asked for is the poignant hope, not the device.
   * **Why D:** By the end we care more, not less; the ending's power depends on our investment in Leon.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel empathy and a poignant hope — tender feeling for what Leon has lost, and hope for the belonging he begins to find.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — an ache for Leon's losses and a fragile hope for his future — is the emotional effect a coming-of-age novel is built to produce, edged with pathos at the injustice he has met.
   * **WhyWrong:** The intended effect is empathy and poignant hope, not amusement, triumph or horror; the ending leaves us moved and tenderly hopeful, not entertained or frightened.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about children and the care system?
   * **Options:** A) That children in care forget their families and are fine, B) That every child deserves to be seen and loved as an individual, not processed as a case — and that a system shaped by inequities, including race, can fail the children it should protect, C) That the care system always works perfectly, D) That children feel loss less than adults do
   * **Correct:** B
   * **Feedback:** ✓ Correct. Through Leon the novel insists that a child is a person with a name and a history, not a case to be managed — and it quietly indicts a system whose inequities separate a boy from his brother. That is its enduring "so what".
   * **Why A:** The novel argues the opposite — Leon never forgets his family, and the loss shapes his whole life.
   * **Why C:** The book dramatises the system's failures (the separation from his brother), not its perfection.
   * **Why D:** Its whole point is that children feel loss as deeply as anyone — Leon's grief is the emotional heart of the book.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The title, *My Name Is Leon*, is itself a claim. What enduring idea does it assert?
   * **Options:** A) That names do not matter, B) That a child has a right to his own identity and dignity — Leon insisting on who he is against a system that risks reducing him to a label or a case, C) That the novel is really about the author, D) That Leon wants to be adopted quickly
   * **Correct:** B
   * **Feedback:** ✓ Correct. The title is a quiet act of selfhood: the boy's assertion of his own name and dignity in the face of a system that threatens to define him from outside — the novel's central claim.
   * **Why A:** The whole point is that his name — his identity — matters profoundly; the title makes that its argument.
   * **Why C:** The title names the child at the story's heart, asserting *his* selfhood, not the author's.
   * **Why D:** It is a claim of identity and dignity, not a wish about adoption.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that children feel loss as deeply as adults, and deserve to be loved and seen as individuals — never merely processed by a system.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Leon's grief and his fierce love make the case that a child's inner life is as real and deep as any adult's, and that every child deserves to be known by name, not managed as a case — a central part of the novel's moral.
   * **WhyWrong:** The novel insists that children feel loss profoundly and deserve to be seen as individuals — treating a child as a case, or as less wounded than an adult, is exactly what it condemns.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about healing does the novel's close affirm?
   * **Options:** A) That a wounded child can never recover, B) That patience, love and belonging — the warmth of a carer, the mentorship of the allotment — can nurture a hurt child towards hope, C) That children heal only by forgetting their past, D) That nothing an adult does can help a grieving child
   * **Correct:** B
   * **Feedback:** ✓ Correct. As the allotment's plants grow with care, so does Leon: the novel affirms that love, patience and a place to belong can carry a wounded child towards a fragile but real hope.
   * **Why A:** The ending offers hope, not permanent damage — Leon begins, tentatively, to heal.
   * **Why C:** Leon heals *while* holding on to his family, not by forgetting; memory and love are part of his recovery.
   * **Why D:** Maureen's warmth and the allotment's mentors are exactly what help him — the novel affirms that caring adults matter.
