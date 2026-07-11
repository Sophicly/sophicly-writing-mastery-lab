# Foundational Quiz Bank — Great Expectations

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Great Expectations is a **Bildungsroman (coming-of-age novel)** → the `effects` aspect tests the
reader's **empathy, hope and poignancy** at Pip's growth and its cost, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`great_expectations.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Great Expectations

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Pip *changes* across the novel — and what drives the change?
   * **Options:** A) He is a snob from the first chapter and never really changes, B) He begins a warm-hearted forge boy and becomes an ashamed, ungrateful young gentleman — driven by his own choice to chase "great expectations" and disown his roots, C) He stays a humble, contented boy throughout and is simply unlucky, D) His fortune and pride are forced on him; he has no say in who he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The arc is the *change*: an affectionate boy who loves Joe hardens into a snob who is ashamed of him — and the engine is Pip's own decision to pursue gentility, not chance.
   * **Why A:** As a child Pip is loving and loyal ("What larks!" with Joe); the drama lies in his corruption and recovery, not in fixed snobbery.
   * **Why C:** He does not stay contented — he actively chooses to reject the forge; the fall is self-caused, which is what he must later repent.
   * **Why D:** The money enables the change, but Pip *chooses* to be ashamed of Joe; removing his agency erases the moral growth the novel is about.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Pip a *sympathetic* hero rather than simply a snob who deserts his family?
   * **Options:** A) He is faultless and never wrongs anyone, B) He is neither wholly good nor wholly bad — a decent boy corrupted by shame and false values, who finally sees his error and grows into humility, C) He is heartless from the very beginning, D) He escapes all consequences and keeps his fortune and pride intact
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pip is an in-between figure: real warmth spoiled by snobbery, then redeemed by self-knowledge. That middle position — and his honest reckoning with his faults — is why we forgive him.
   * **Why A:** If he never erred there would be no growth; the novel needs his snobbery so his repentance can move us.
   * **Why C:** He begins tender and loving, not heartless; his coldness is a corruption, not his nature.
   * **Why D:** His fortune collapses and his pride is humbled — the coming-of-age turns on loss and learning, not on keeping everything.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Pip's evolution from beginning to end?
   * **Options:** A) A cruel bully at the start → a rich, proud gentleman at the end, B) A loving forge boy ashamed of his "coarse hands" and "thick boots" → a chastened man who has learned that worth is moral, not measured in rank, C) A wealthy heir at the start → a penniless criminal at the end, D) A convict at the start → a magistrate at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a boy taught to despise his own hands to a man who values loyalty over gentility — the same person, matured by shame and its undoing. That arc IS the coming-of-age.
   * **Why A:** He starts loving, not cruel, and ends humbled, not proud — this reverses his actual growth.
   * **Why C:** He is a poor forge boy at the opening, not a wealthy heir; the movement is toward wisdom, not toward crime.
   * **Why D:** Pip is never a convict; this confuses his story with Magwitch's.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Pip's growth is driven above all by his own choices — the fortune tempts him, but the decision to be ashamed of Joe and the forge, and later to repent, is his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The expectations plant the ambition, but Pip weighs it and chooses; his agency is what turns a windfall into a moral education and keeps the growth *his*.
   * **WhyWrong:** The money never forces his snobbery — Pip decides to disown his roots, and later decides to make amends. Treating him as a puppet of his fortune removes the choices that make his growth meaningful.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does helping the convict on the marshes *lead to* Pip's rise as a gentleman? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen years apart, B) Magwitch never forgets the frightened boy who fed him — so, grown rich in Australia, he secretly funds Pip's gentility out of gratitude, C) Miss Havisham rewards Pip for catching the convict, D) Pip's fortune comes by pure luck, with no cause at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the far-off other: the boy's frightened kindness earns a convict's lifelong debt, which becomes the secret fortune. That causal thread is what makes the plot an arc, not a set of coincidences.
   * **Why A:** The marsh scene and the fortune are bound by cause — the whole twist is that they are the same story; reading them as unconnected misses the design.
   * **Why C:** Miss Havisham is a decoy benefactor in Pip's mind; the true cause is Magwitch's gratitude, not any reward.
   * **Why D:** The fortune is not luck — it is the direct consequence of Pip's early act of mercy.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Pip's story — not just the order of events?
   * **Options:** A) A series of unrelated adventures that befall Pip by chance, B) Pip pities the convict → the convict grows rich and secretly funds him → the fortune makes Pip a snob ashamed of Joe → the truth of his benefactor shatters his pride → he loses the money but gains humility, C) Miss Havisham arranges every step, so nothing is Pip's doing, D) Estella's choices decide everything, and Pip's own actions make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before, all originating in the boy's mercy on the marshes: kindness → fortune → snobbery → revelation → repentance. That is the coming-of-age arc.
   * **Why A:** His story is not random adventure — it is the causal outworking of a single early act of kindness.
   * **Why C:** Miss Havisham deceives but does not author Pip's fate; making her the cause erases the true chain from Magwitch's gratitude.
   * **Why D:** Pip's own choices — to help the convict, to be ashamed of Joe, to stand by Magwitch — drive the arc; without them there is no growth.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which revelation is the turning point that overturns everything Pip believed about himself — the point of no return?
   * **Options:** A) Pip's first meeting with Estella at Satis House, B) The night Magwitch returns and reveals that *he*, the convict, is Pip's secret benefactor, C) Mrs Joe's death, D) Joe's first visit to Pip in London
   * **Correct:** B
   * **Feedback:** ✓ Correct. When Magwitch reveals himself, Pip's whole self-image collapses: his "gentility" springs not from Miss Havisham but from a hunted convict. Everything after — his shame, his loyalty, his growth — flows from this reversal.
   * **Why A:** Estella's scorn wounds Pip and sparks his ambition, but nothing is yet overturned; the dream is still intact.
   * **Why C:** Mrs Joe's death is a sorrow, but it does not shatter the illusion on which Pip's whole identity rests.
   * **Why D:** Joe's visit shames Pip, but it is a symptom of his snobbery, not the revelation that undoes it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Great Expectations the later events follow by cause-and-effect from Pip's early kindness to the convict — they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: the boy's mercy earns Magwitch's gratitude, which becomes the fortune, which corrupts and finally educates Pip. That causal spine is what makes it an arc.
   * **WhyWrong:** Reading the events as unconnected ("things just happen to Pip") misses the causal necessity — the marsh kindness *is* the hidden source of the fortune, the very hinge of the plot.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Stung by Estella's scorn for his "coarse hands" and "thick boots", Pip resolves to become a gentleman. What does the novel ultimately reveal about social class?
   * **Options:** A) That rank and fine clothes are what make a person good, B) That true worth is moral, not social — kindness and loyalty matter more than gentility or wealth, C) That the poor deserve their poverty, D) That only the rich can be happy
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pip chases gentility and finds it hollow, while humble Joe proves the finest gentleman of all. The novel dismantles the idea that class equals worth.
   * **Why A:** The novel shows the reverse — fine clothes leave Pip empty; goodness, not rank, is what counts.
   * **Why C:** Dickens's sympathy lies with the poor and faithful; the theme condemns snobbery, not poverty.
   * **Why D:** Pip's wealth brings guilt and loneliness, not happiness — the opposite of this reading.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** From the stolen food and file he takes for the convict as a boy, guilt shadows Pip's life. Which controlling idea does this explore?
   * **Options:** A) That conscience is a lasting moral force that shapes and finally redeems Pip, B) That crime always goes unpunished, C) That Pip is simply a wicked child, D) That guilt matters only to Magwitch, not to Pip
   * **Correct:** A
   * **Feedback:** ✓ Correct. The boy's theft begins a lifelong current of conscience; guilt is not just a plot device but the moral pressure that keeps Pip's better self alive and drives his eventual growth.
   * **Why B:** The theme is about inner conscience, not escaping justice; guilt punishes Pip from within.
   * **Why C:** Pip acts out of terror and pity, not wickedness — the guilt reveals his tender conscience, not a bad nature.
   * **Why D:** Pip's guilt is central to the narrative, running from the marshes onward.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel holds ambition and contentment in tension. Which idea best describes its view of Pip's "great expectations"?
   * **Options:** A) That ambition is always rewarded and should be pursued at any cost, B) That ambition built on shame of one's own people corrodes the heart — self-improvement is worthy only when it keeps loyalty and gratitude, C) That Pip should never have wished to better himself at all, D) That contentment is impossible for anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dickens does not condemn aspiration itself — he condemns aspiration that despises its roots. Pip's fault is being ashamed of Joe, and his growth is learning that self-betterment without loyalty is hollow.
   * **Why A:** Pip's ambition brings disillusionment, not reward — the theme warns against it, not for it.
   * **Why C:** The novel does not damn all ambition; it damns ambition that betrays love and gratitude.
   * **Why D:** Contentment is possible — Joe and Biddy embody it; the point is what kind of striving destroys it.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Great Expectations, genuine worth is shown to lie in kindness, loyalty and integrity rather than in money or social rank.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Through humble, faithful Joe — the finest "gentleman" in the book — Dickens argues that true worth is moral, not measured by wealth or class.
   * **WhyWrong:** This is true — the novel repeatedly sets the goodness of Joe and Biddy above the gentility Pip chases, insisting worth is a matter of heart, not rank.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Great Expectations is a coming-of-age novel. Why do we feel *sympathy* for Pip even when he is a snob ashamed of Joe?
   * **Options:** A) Because he is entirely faultless and did nothing wrong, B) Because we recognise our own capacity for the same weakness, and the older Pip's honest regret makes us hope he will grow past it, C) Because he names the poetic device Dickens is using, D) Because his snobbery is triumphant and we admire it
   * **Correct:** B
   * **Feedback:** ✓ Correct. A Bildungsroman makes us feel empathy and hope: we wince at Pip's shame because we might share it, and the narrator's rueful self-judgement invites us to hope for — and forgive — his growth.
   * **Why A:** He is at fault, not faultless — and it is precisely a *flawed*, recognisable boy, not a blameless one, whose struggle earns our sympathy.
   * **Why C:** Naming a device is a technique label, not a *feeling*; the effect is empathy for Pip, not the recognition of a device.
   * **Why D:** His snobbery is not something to admire — the intended feeling is empathy and hope for his growth, not admiration for his coldness.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel such as Great Expectations is designed to make the reader feel — above all — which response to the hero's growth?
   * **Options:** A) Amusement at his cleverness, B) Empathy and hope — poignancy at how he grows through error and cost, C) Fear and horror, D) Cold indifference to his fate
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Bildungsroman aims to move us with empathy for the growing self and hope for who they may become — a poignancy sharpened by all that the growth costs Pip along the way.
   * **Why A:** Amusement is not the aim; the reader is meant to feel *with* Pip, not laugh at him.
   * **Why C:** Fear and horror belong to the gothic; this coming-of-age story seeks empathy and hope, not dread.
   * **Why D:** Indifference is the mark of a *failed* Bildungsroman; the whole design is to make us care about Pip's growth.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why is Pip's reconciliation with Joe, and his loyalty to the dying Magwitch, so *moving* to the reader?
   * **Options:** A) Because the events are described with alliteration, B) Because we have watched Pip lose so much and grow through his shame — his hard-won humility and tenderness feel like a costly, hopeful triumph, C) Because Pip finally becomes rich and powerful, D) Because we feel nothing and simply read on
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poignancy comes from the *cost* of the growth: having followed Pip's fall into snobbery, we feel the full weight of his return to love. Empathy and hope, earned through loss, are the coming-of-age response.
   * **Why A:** Alliteration is a technique; the feeling comes from Pip's moral change, not from a sound device.
   * **Why C:** He does not end rich — the fortune is gone; the emotion springs from humility gained, not power won.
   * **Why D:** A wholly unmoved reading misses the point — the reconciliation is built to stir empathy and hope.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel empathy and hope — poignancy at how much Pip's growth has cost him, and hope that he has become a wiser, humbler man.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That mingled empathy and hope — moved by the cost of Pip's education and glad of the man he becomes — is the emotional effect a coming-of-age novel is built to produce.
   * **WhyWrong:** The intended effect is empathy and hope, not amusement or horror; the ending is meant to leave us moved by Pip's costly growth, not merely entertained.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about class and human worth?
   * **Options:** A) That becoming a gentleman is the surest route to happiness, B) That true worth lies in loyalty, kindness and a good conscience — not in wealth or rank — and that growth means learning to value the people who love us, C) That the poor should stay in their place, D) That guilt has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pip's fortune leaves him hollow while faithful Joe proves the truest gentleman; the enduring "so what" is that worth is moral, and that maturity means honouring love and gratitude over social show.
   * **Why A:** The novel dramatises the opposite — gentility brings Pip guilt and loneliness, not happiness.
   * **Why C:** Dickens's sympathy is with the poor and faithful; the message elevates goodness, it does not defend class hierarchy.
   * **Why D:** Guilt is a lasting moral force here — conscience shapes and finally redeems Pip.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel suggest about ambition and self-improvement?
   * **Options:** A) That all ambition is corrupting and should be given up, B) That striving to better oneself is worthy only when it keeps faith with love, loyalty and one's own roots — ambition rooted in shame corrupts, C) That the only worthwhile goal is wealth, D) That people can never change for the better
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dickens does not condemn aspiration but the *shame* beneath Pip's aspiration; the message is that self-betterment is good only when it does not betray the people who love us.
   * **Why A:** The novel honours worthy striving — Pip's error is snobbery, not ambition as such.
   * **Why C:** Wealth leaves Pip empty; the message sets moral worth, not money, as the true goal.
   * **Why D:** Pip does change for the better — his hard-won humility is the whole hopeful point.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that a good conscience and faithful love matter more than money or gentility — and that true growth means learning this.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Pip's costly education teaches him — and us — that worth is moral: the loyal, loving heart of a Joe outshines any fortune or fine title.
   * **WhyWrong:** The novel insists that conscience and love outweigh wealth and rank; Pip's whole journey is learning to prize the good people he once was ashamed of.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human beings does Pip's story finally affirm?
   * **Options:** A) That people are fixed and can never redeem their faults, B) That even a corrupted heart can grow — through shame, loss and honest self-knowledge — into humility and love, C) That gratitude and loyalty are weaknesses, D) That the rich are always better than the poor
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pip falls into snobbery yet climbs back to tenderness and gratitude; the novel's hopeful message is that self-knowledge can redeem us, and that growth is possible even after real moral failure.
   * **Why A:** The whole coming-of-age shape denies this — Pip does change and redeem his faults.
   * **Why C:** The novel treasures gratitude and loyalty as the highest virtues, embodied in Joe and in the reformed Pip.
   * **Why D:** Dickens overturns this — the poor Joe is the moral superior of the gentleman Pip once tried to be.
