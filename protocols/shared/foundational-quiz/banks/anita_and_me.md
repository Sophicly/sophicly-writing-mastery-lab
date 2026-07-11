# Foundational Quiz Bank — Anita and Me

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Anita and Me is a **bildungsroman (coming-of-age novel)** → the `effects` aspect tests the reader's
**empathy, poignancy and hope** at a child's growth and its cost, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`anita_and_me.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Anita and Me

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Meena *changes* across the novel — and what drives the change?
   * **Options:** A) She is confident and secure in her identity from the first page and never really changes, B) She begins an insecure child who lies and idolises Anita, and becomes a self-assured girl at home in her Indian-British identity — driven by her own choice to see the prejudice around her and reclaim her heritage, C) She stays a naive little girl throughout and things simply happen to her, D) She is pushed into every change by the adults around her and makes no choices of her own
   * **Correct:** B
   * **Feedback:** ✓ Correct. The coming-of-age is the *change*: an uncertain child who invents stories and craves Anita's approval grows into a girl secure in who she is — and the engine is her own reckoning with the prejudice she comes to see.
   * **Why A:** She starts insecure and story-telling, not settled; the whole novel lies in her transformation, not in fixed confidence.
   * **Why C:** She does not stay passive — she chooses to see clearly and to reclaim her heritage; the growth is hers.
   * **Why D:** Nanima and her family shape her, but the decisive turn — recognising the prejudice and outgrowing Anita — is Meena's own.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Meena a true *coming-of-age* protagonist rather than simply a child who gets older?
   * **Options:** A) She is already wise and has nothing left to learn, B) She is neither wholly naive nor yet wise — a child whose formative experiences force her to trade innocence for understanding, and the growth is earned through her own reckoning, C) She never learns anything and ends exactly as she began, D) She grows up only in body, her ideas untouched by experience
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman hero stands between innocence and understanding: real experiences dismantle her early illusions until clear sight is *earned*. That won knowledge — not mere ageing — is what makes her arc a coming-of-age.
   * **Why A:** If she were already wise there would be nothing to learn; the form needs her early naivety.
   * **Why C:** She changes profoundly — outgrowing Anita and embracing her heritage; a static child is not a coming-of-age protagonist.
   * **Why D:** Her growth is inward, a change of understanding — ageing without changed ideas is exactly what the form is *not*.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Meena's evolution from beginning to end?
   * **Options:** A) A proud, settled girl at the start → a lost, uncertain child at the end, B) An insecure girl inventing stories and longing for Anita's approval → a grounded girl who has outgrown her idol and embraces her Indian heritage, C) A cruel bully at the start → a friendless outcast at the end, D) A grown woman at the start → a small child at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from an unsure child hungry for Anita's approval to a girl secure in herself and her roots — the same person, made whole by what she comes to understand. That arc IS the coming-of-age.
   * **Why A:** She begins insecure and ends grounded — this reverses her actual arc.
   * **Why C:** Her lying reflects a search for self, not cruelty, and she ends more secure, not an outcast.
   * **Why D:** She is a growing child throughout; this confuses the direction of her development entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Meena's growth is driven above all by her own choice to see clearly — the prejudice around her opens her eyes, but recognising it and reclaiming her heritage is her own doing.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Events expose the prejudice, but Meena weighs what she sees and chooses to turn from Anita's world toward her own roots; that choice is what turns experience into maturity and keeps the growth *hers*.
   * **WhyWrong:** Meena is not merely carried along by circumstance — she reckons with what she witnesses and decides to reclaim her heritage, and that agency is what makes her arc a coming-of-age rather than mere ageing.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Meena's *idolising of Anita* eventually *lead to* her disillusionment? (What is the causal link?)
   * **Options:** A) The two are unconnected — she just happens to fall out with Anita for no reason, B) Craving Anita's approval draws Meena deep into her world, and from inside it she comes to see the casual racism and cruelty at its heart — so the very admiration that pulled her in forces her to see what Anita really is, C) Nanima orders Meena to stop seeing Anita, D) Meena turns on Anita at random because she has grown bored
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: getting close enough to worship Anita is exactly what lets Meena see the prejudice she had been blind to. The closeness produces the disillusionment — that causal link makes the plot a growth-arc, not a list of episodes.
   * **Why A:** In a coming-of-age novel the events follow by cause, not chance; reading the break as random misses the arc.
   * **Why C:** Nanima strengthens Meena's roots, but she issues no order; Meena sees Anita's world for herself.
   * **Why D:** Her turn from Anita is driven by what she comes to *see*, not boredom.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Meena's growing up — not just the order of events?
   * **Options:** A) A series of unrelated village happenings that occur one after another, B) She idolises Anita → mimics her rebellion → witnesses the casual racism of Anita's world, including Sam Lowbridge's → is disillusioned → Nanima's visit and her own reflection return her to her heritage → she matures and looks beyond Tollington, C) The adults arrange each step for her, so nothing follows from her own experience, D) Nothing she does matters; she ends up the same whatever happens
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before, all set going by her longing to belong: closeness breeds sight, sight breeds disillusion, disillusion (with Nanima's warmth) breeds a return to her roots. That is the coming-of-age arc: naivety → formative experience → earned understanding.
   * **Why A:** Her growth is not a string of unrelated happenings — it is the causal outworking of her own longing and what it exposes her to.
   * **Why C:** The adults shape her, but the decisive movement — sight, disillusion, return — is worked out through her own experience.
   * **Why D:** If her choices made no difference there would be no growth; the whole arc turns on what she comes to see and decide.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which is the turning point that makes Meena's disillusionment with Anita's world irreversible — the point she can no longer un-see?
   * **Options:** A) Nanima's arrival from India, B) Witnessing Sam Lowbridge's racist attack — and Anita's approval of it — which lays bare the prejudice at the heart of the world Meena idolised, C) Meena breaking her leg falling from the horse, D) Meena passing the eleven-plus for grammar school
   * **Correct:** B
   * **Feedback:** ✓ Correct. Seeing the racist violence Anita condones is the irreversible moment: once Meena grasps what her idol's world truly is, she cannot go back to admiring it, and her turn toward her own heritage follows from it. That is the coming-of-age turning point.
   * **Why A:** Nanima's arrival deepens Meena's roots — a cause of her return, not the rupture that breaks the idol.
   * **Why C:** Breaking her leg gives her time to reflect; it is a consequence and pause, not the recognition that shatters her illusion.
   * **Why D:** The eleven-plus marks her moving *beyond* Tollington — the result of her growth, not the moment her illusion collapses.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Anita and Me the later stages of Meena's growth follow by cause-and-effect from her disillusionment with Anita — they are not just a string of unconnected episodes.
   * **Answer:** True
   * **Feedback:** ✓ Correct. A coming-of-age plot is built on necessity, not mere sequence: seeing through Anita's world *causes* Meena to turn back to her heritage and mature. That causal spine is what makes it a growth-arc rather than a chronicle of village life.
   * **WhyWrong:** Reading the events as unconnected ("things just happen next in the village") misses the causal chain — the disillusionment is precisely what drives Meena's return to her roots and her maturing.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Meena is a British-born girl of Indian parents in a white English village. Which controlling idea does her situation most explore, and how does it *work* through the novel?
   * **Options:** A) The search for identity and belonging between two cultures — Meena is pulled between her family's Indian heritage and the English village, and must work out who she is, B) That village weather shapes people's moods, C) That families are best left behind as one grows up, D) That English and Indian life are identical and never in tension
   * **Correct:** A
   * **Feedback:** ✓ Correct. The whole novel turns on Meena standing between two cultures — Indian heritage and English village — and the tension between them is the engine of her growing up.
   * **Why B:** The idea is cultural belonging, not weather; the village setting matters for what it makes Meena feel, not the climate.
   * **Why C:** Her growth *reconnects* her to family and heritage — it does not teach her to leave them behind.
   * **Why D:** The novel's tension is exactly that the two cultures pull against each other in Meena; treating them as identical erases the theme.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which controlling idea about *prejudice* does the novel explore, and how does it *work* through the text?
   * **Options:** A) That racism belongs only to obvious, distant villains, B) That prejudice runs quietly beneath ordinary village life, surfacing even in a friend like Anita and in Sam Lowbridge — so belonging for Meena's family is conditional and fragile, C) That there is no prejudice in the village at all, D) That racism is harmless because it is only words
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's power is that the prejudice is *everyday* — woven through friendly faces and village life, and finally erupting in Sam's violence — which is what forces Meena to see how conditional her family's belonging is.
   * **Why A:** The theme's sting is that racism sits inside the ordinary and the familiar — even in Anita — not only in distant villains.
   * **Why C:** Prejudice is present throughout, from casual remarks to Sam's attack; denying it misses the theme entirely.
   * **Why D:** The novel shows prejudice turning to real violence and real harm — it is never presented as harmless.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Meena often tells lies and invents stories as a child. Which idea does this most explore, and how does it *work*?
   * **Options:** A) That she is simply dishonest and cruel, B) Her creativity and her unsettled sense of self — she tries on different identities through her stories while she works out who she is, C) That she cannot speak English, D) That she dislikes her family
   * **Correct:** B
   * **Feedback:** ✓ Correct. Meena's storytelling dramatises the theme of a searching identity: the invented tales are both her imagination and her way of trying on selves before she knows which is truly hers.
   * **Why A:** Her lying is bound up with identity and imagination, not simple cruelty.
   * **Why C:** Meena speaks English fluently; the lying is about *self*, not language.
   * **Why D:** She loves her family even as she rebels; the stories reflect her search for self, not dislike.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Anita and Me, the theme of heritage is dramatised through Nanima's visit — her Indian language, stories and warmth deepen Meena's pride in her roots.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Nanima brings Meena's heritage vividly into the house, and that living connection to her roots is a central strand of how the novel explores belonging and identity.
   * **WhyWrong:** Heritage is indeed a controlling idea here — Nanima's arrival makes Meena's Indian roots warm and real, strengthening her sense of who she is against the pull of the village.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Anita and Me is a coming-of-age novel. Why do we feel *poignancy* — a tender ache — as Meena grows up, even though her growing up is in many ways happy?
   * **Options:** A) Because nothing is lost and her growth costs her nothing, B) Because her new, clearer sight is *bought* at a cost — she has to lose her childhood illusions and her idol to gain a secure self — and that exchange moves us, C) Because the novel's effect is really the retrospective narrator looking back, D) Because we are simply amused and feel nothing tender at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman makes us feel the *price* of growing up: Meena's wisdom cannot restore the certainty it cost, so watching her trade innocence for understanding is quietly moving. Poignancy comes from growth *and its loss*, not from a painless happy ending.
   * **Why A:** Her growth costs her — her illusions, her idol; the ache we feel is exactly that something is given up to gain understanding.
   * **Why C:** The retrospective voice is a *technique* the writer uses; the effect it produces is the feeling — the poignancy — not the device itself.
   * **Why D:** The novel's warmth and humour sit *beside* a real tenderness; a reader who feels only amusement misses its emotional aim.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel such as Anita and Me is designed to make the reader feel — above all — which response?
   * **Options:** A) Fear and dread, B) Empathy and a poignant hope at a child's growth and the cost of it, C) Amusement and triumph, D) Admiration for a clever, twisting plot
   * **Correct:** B
   * **Feedback:** ✓ Correct. The bildungsroman's aim is to make us *feel with* the child as she matures — empathy for her struggle, poignancy at the innocence she loses, and hope in the wiser self she becomes. That is the emotional purpose the whole arc serves.
   * **Why A:** Fear and dread belong to gothic or tragedy; a coming-of-age novel moves us through empathy, not terror.
   * **Why C:** There is warmth and humour, but the intended feeling is tender and hopeful, not triumphant.
   * **Why D:** We may enjoy the story, but the designed response is empathy and poignant hope, not admiration for plot mechanics.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *hope* at the close of the novel, even after the prejudice and disillusionment Meena has faced?
   * **Options:** A) Because a villain has finally been defeated and we feel relief, B) Because Meena emerges wiser and more secure in herself — her growth suggests the pain of disillusionment can be survived and turned into strength, C) Because the effect really lies in the novel's warm, comic descriptions, D) Because we are left in despair with no sense of a future
   * **Correct:** B
   * **Feedback:** ✓ Correct. Coming-of-age hope is hope in the *self forged by experience*: Meena has lost her illusions but gained a firmer identity, so we close feeling that growing up, though costly, leads somewhere good.
   * **Why A:** The feeling is not relief at a villain's defeat but hope in Meena's own maturing — a different, gentler emotion.
   * **Why C:** The comic warmth is a technique; the hope it helps create is the *feeling*, not the descriptive style itself.
   * **Why D:** The ending is quietly hopeful, not despairing — Meena steps toward a wider, surer future.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel both poignancy and hope — poignancy at the childhood innocence Meena loses, and hope in the surer, wiser self she gains.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — the ache of what is lost and the hope in what is won — is the emotional effect a coming-of-age novel is built to produce as the child steps into understanding.
   * **WhyWrong:** The intended effect is poignancy *and* hope together, not fear or triumph; the ending is meant to leave us tenderly moved by Meena's growth and its cost, and hopeful for who she has become.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about identity and belonging?
   * **Options:** A) That we must choose one culture and reject the other to belong, B) That identity is not simply inherited but forged — a child caught between cultures grows by learning to see prejudice clearly and to claim her own heritage, and belonging comes from within, not from others' approval, C) That belonging can only ever be granted by the people around you, D) That heritage should be abandoned in order to fit in
   * **Correct:** B
   * **Feedback:** ✓ Correct. Meena's coming-of-age affirms that a whole identity is *made*, not handed down: she stops chasing Anita's approval and claims both her Indian roots and her British self — the novel's enduring "so what".
   * **Why A:** The novel's message is that Meena can hold *both* cultures; forcing a single choice is the very trap she grows beyond.
   * **Why C:** She learns that belonging is claimed from within, not conferred by others — chasing Anita's approval is what she outgrows.
   * **Why D:** Reclaiming her heritage — not abandoning it — is exactly what makes her secure; the message is the opposite.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about *prejudice in ordinary communities* does the novel affirm?
   * **Options:** A) That racism exists only in obvious extremists and never in ordinary people, B) That prejudice is not confined to distant villains but woven through everyday life — even in friends — so it must be recognised and outgrown, C) That prejudice is harmless and best ignored, D) That immigrant families can never truly belong anywhere
   * **Correct:** B
   * **Feedback:** ✓ Correct. By placing the racism inside friendly, familiar Tollington — in Anita and in Sam — the novel insists that prejudice hides in the everyday, and its lasting call is to see it clearly and grow past it.
   * **Why A:** The novel's point is precisely that prejudice sits in ordinary people and friends, not only in obvious extremists.
   * **Why C:** It shows prejudice doing real harm, ending in violence; the message is to recognise it, not ignore it.
   * **Why D:** Meena ends more secure in her belonging, not excluded — the novel affirms a hard-won place, not permanent exile.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that growing up means unlearning inherited illusions — the wisdom Meena gains is bought by losing her childhood certainties.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The bildungsroman insists that understanding is *earned*, never free: Meena trades the comfort of her illusions — about Anita, about belonging — for clear sight, and that exchange is the heart of its message about growing up.
   * **WhyWrong:** The novel affirms that maturity is bought at a price — Meena must lose her childhood certainties to gain understanding — which is a central part of its message about coming of age.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about the second-generation immigrant experience does the ending most affirm?
   * **Options:** A) That a child of immigrants must give up one heritage to be accepted, B) That a British-born child of immigrants can hold *both* heritages and forge a confident, whole identity — belonging is claimed from within, not granted by others, C) That such a child will always remain an outsider, D) That fitting in matters more than knowing who you are
   * **Correct:** B
   * **Feedback:** ✓ Correct. Meena ends rooted in her Indian heritage *and* at home in her British life, no longer needing Anita's approval — the novel's affirming message that a dual identity can be whole and self-claimed.
   * **Why A:** The ending shows Meena keeping *both* cultures; the "give one up" reading is the trap she escapes.
   * **Why C:** She finishes more secure and hopeful, not an outsider — the novel affirms belonging can be won.
   * **Why D:** The novel's message is the reverse — knowing who you are, not merely fitting in, is what gives Meena her confidence.
