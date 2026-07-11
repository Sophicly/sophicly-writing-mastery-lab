# Foundational Quiz Bank — Jane Eyre

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Jane Eyre is a **bildungsroman** (a novel of formation, with Gothic texture) → the `effects`
aspect tests the reader's **empathy, hope and poignancy** at Jane's growth and its cost, not the naming
of techniques and not the Gothic dread that merely serves that arc.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`jane_eyre.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Jane Eyre

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Jane *changes* across the novel — and what drives the change?
   * **Options:** A) She is strong and independent from the first page and never really changes, B) She grows from a powerless, mistreated orphan into a self-respecting, independent woman — driven by her own repeated choice to keep her integrity, C) She stays a helpless victim throughout and is simply rescued at the end, D) She is shaped entirely by luck — an inheritance and a fire — with no say of her own
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel of formation IS the change: the unloved child of Gateshead becomes a woman who marries as an equal — and the engine is her own insistence on dignity, not fortune or a rescuer.
   * **Why A:** As a child she is powerless and passionate, not yet self-possessed; the drama lies in her formation, not in a fixed character.
   * **Why C:** She is not merely rescued — she leaves Rochester, refuses St John and returns on her own terms; the growth is self-won.
   * **Why D:** The inheritance and the fire remove barriers, but Jane's defining acts are her own choices; making them mere luck erases the growth that is hers.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Jane's development her *own achievement* rather than something that simply happens to her?
   * **Options:** A) She inherits money, which changes everything for her without any effort, B) At each test she chooses integrity over comfort — leaving Rochester rather than live compromised, refusing a loveless marriage — so her growth is earned by her own will, C) She never faces any real choice; events carry her along, D) A kind benefactor makes all her decisions for her
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman turns on the protagonist's own choices: Jane forms herself by what she refuses — wealth without dignity, love without honour, duty without love. The growth is willed, not received.
   * **Why A:** The inheritance arrives late and matters because Jane has already chosen her principles; it rewards her formation, it does not cause it.
   * **Why C:** Her life is a chain of hard choices — to flee Thornfield, to reject St John — each one an act of will.
   * **Why D:** No one decides for Jane; her conscience is her only guide, and that self-direction is the point.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Jane's evolution from beginning to end?
   * **Options:** A) A cherished, wealthy daughter at the start → a lonely outcast at the end, B) A powerless, unloved orphan who can say only "I care for myself" as her whole security → an independent woman, equal in fortune and spirit, who declares "Reader, I married him", C) A contented servant at the start → an embittered spinster at the end, D) A cruel child at the start → a punished outcast at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from a child whose only refuge is her own self-respect to a woman who chooses marriage freely, as an equal. That arc of formation IS the novel.
   * **Why A:** She begins orphaned and unloved, not cherished, and ends fulfilled, not cast out — this reverses her actual arc.
   * **Why C:** She is a dependent child, not a servant, at the opening, and fulfilled, not embittered, at the close.
   * **Why D:** Jane is the mistreated child, not the cruel one; she grows through endurance, not into punishment.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Jane's transformation from powerless orphan to independent equal is driven above all by her own moral choices — the events around her open doors, but the decisions that shape her are hers.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Circumstance offers Jane options; her will chooses among them. Leaving Rochester and refusing St John are acts of self-formation, which is what makes her growth her own.
   * **WhyWrong:** Reading Jane as merely swept along by luck removes the choices — to keep her integrity at every cost — that turn a mistreated child into a self-possessed woman.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the discovery of Bertha *lead to* Jane leaving Thornfield? (What is the causal link?)
   * **Options:** A) The two events are unconnected and simply happen one after the other, B) Rochester is already married, so to stay would make Jane his mistress — and rather than betray her self-respect she chooses to leave, C) The law physically forces Jane to leave the house, D) Jane leaves at random because she has lost her reason
   * **Correct:** B
   * **Feedback:** ✓ Correct. One fact *causes* the next choice: a living wife means staying would compromise Jane's integrity, and that impossibility drives her flight. The plot moves by the pressure of principle, not by mere sequence.
   * **Why A:** In a novel of formation events follow by cause: the revelation creates the moral impasse that forces her decision — reading them as unconnected misses the arc.
   * **Why C:** No law removes her; Jane chooses to go, against her own longing, to keep her self-respect.
   * **Why D:** Her leaving is a clear-eyed moral decision, not a collapse into madness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Jane's story — not just the order of events?
   * **Options:** A) A series of unrelated places and misfortunes that happen to her by chance, B) Cruelty at Gateshead and hardship at Lowood forge her principles → those principles make her leave Rochester when Bertha is revealed → her flight and inheritance win her independence → freed and humbled by the fire, Rochester can meet her as an equal, C) A benefactor arranges each stage of her life for her, so nothing follows from her own nature, D) Fate alone decides everything, and Jane's character makes no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before: her early formation makes the later choices inevitable for a person of her integrity. That is the shape of a bildungsroman — character producing consequence.
   * **Why A:** Her life is not random misfortune; each place forms the self that makes the next choice.
   * **Why C:** No one arranges Jane's path; it unfolds from her own tested character.
   * **Why D:** If her character made no difference there would be no formation; the whole arc turns on who she chooses to be.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that forces Jane's defining choice — the point on which her growth pivots?
   * **Options:** A) Her childhood punishment in the red-room at Gateshead, B) The interrupted wedding, when Bertha is revealed as Rochester's living wife, C) Helen Burns's death at Lowood, D) The moment Jane inherits her uncle's fortune
   * **Correct:** B
   * **Feedback:** ✓ Correct. The revelation of Bertha is the pivot: it confronts Jane with the choice between love and integrity, and her decision to leave defines the woman she becomes. That is the novel's peripeteia.
   * **Why A:** The red-room shapes the frightened child, but nothing there is the decisive test of the formed woman.
   * **Why C:** Helen's death teaches Jane endurance early on; it forms her, but it is not the choice her whole arc turns upon.
   * **Why D:** The inheritance rewards Jane's formed character; it follows the turning point rather than being it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Jane Eyre the ending marriage becomes possible by cause-and-effect — the fire frees Rochester from Bertha and humbles him, while Jane's inheritance makes her independent — not by mere coincidence.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The reunion is not luck but the outworking of causes: the fire removes the barrier and levels Rochester, Jane's fortune makes her his equal, so a union of equals is finally possible. That causal spine is the plot's logic.
   * **WhyWrong:** Reading the ending as coincidence ("things just worked out") misses the causal necessity — the barrier removed and the equality established — that lets Jane return on honourable terms.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Refusing to be owned, Jane declares "I am no bird; and no net ensnares me". What does this reveal about the novel's view of independence?
   * **Options:** A) That a woman should depend entirely on a husband, B) That Jane's self-worth requires freedom — she will not be caged or possessed by anyone, however much she loves, C) That Jane dislikes nature and animals, D) That independence matters only to wealthy women
   * **Correct:** B
   * **Feedback:** ✓ Correct. The caged-bird image she rejects is the novel's whole argument about freedom: Jane's dignity depends on belonging to no one but herself, even inside love.
   * **Why A:** The line asserts the opposite — Jane refuses to be owned or made dependent.
   * **Why C:** The bird is a metaphor for confinement, not a literal comment on nature.
   * **Why D:** Jane is poor and dependent, yet claims her freedom regardless — the theme is precisely that worth is not bought.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Jane tells Rochester, "I have as much soul as you, — and full as much heart!" Which controlling idea does this announce?
   * **Options:** A) That the poor and plain are equal in soul to the rich and powerful — worth is spiritual, not social, B) That Jane wants Rochester's money, C) That women are naturally inferior to men, D) That physical beauty decides a person's value
   * **Correct:** A
   * **Feedback:** ✓ Correct. The claim collapses the gap of rank and gender into a spiritual equality: Jane insists her inner worth matches Rochester's, whatever the difference in station — an idea that shapes the whole novel.
   * **Why B:** She rejects his wealth as the basis of the bond; she claims equality of soul, not a share of his fortune.
   * **Why C:** The line asserts equality, directly against the notion of a woman's inferiority.
   * **Why D:** Jane calls herself "poor, obscure, plain", yet claims full equality — the point is that worth is not looks or rank.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Jane leaves the man she loves and refuses a respectable proposal from St John Rivers. Which idea does this most explore, and how does it *work*?
   * **Options:** A) That love should always be sacrificed to duty, B) That conscience and self-respect must govern love — Jane will accept neither passion without honour nor duty without love, C) That Jane cannot make up her mind, D) That marriage is unimportant to her
   * **Correct:** B
   * **Feedback:** ✓ Correct. Both refusals dramatise the same idea: integrity comes first. She rejects Rochester to keep her honour and St John to keep her heart — love must be worthy of the self, or it is refused.
   * **Why A:** She refuses St John's dutiful, loveless marriage — duty alone is not enough for her.
   * **Why C:** Her refusals are decisive acts of principle, not indecision.
   * **Why D:** Jane longs for love deeply; she insists only that it be honourable and equal.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Jane Eyre, self-respect is shown as a person's ultimate security — Jane holds to "I care for myself" even when she is friendless, poor and unloved.
   * **Answer:** True
   * **Feedback:** ✓ Correct. "I care for myself" is the novel's moral anchor: when everything else fails her, Jane's keeping faith with her own conscience is what preserves her dignity.
   * **WhyWrong:** Self-respect is exactly what Jane clings to — she will value herself even when abandoned, which is the novel's idea of where true security lies.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Jane Eyre is a novel of formation. Why do we feel *empathy and hope* as we follow Jane's growth, despite all she suffers?
   * **Options:** A) Because the story frightens us with a madwoman and a haunted house, B) Because we share the inner life of a mistreated child who wins her dignity by her own will — her struggle is one we recognise, and her rise gives us hope, C) Because we are amused by her misfortunes, D) Because we feel detached, judging her coldly from the outside
   * **Correct:** B
   * **Feedback:** ✓ Correct. A bildungsroman makes us live inside the protagonist's formation: because Jane's longing for worth and love is our own, we ache with her setbacks and are lifted by her hard-won triumph. Empathy and hope are the intended feeling.
   * **Why A:** The Gothic dread of Thornfield is real, but it serves the growth arc; the governing feeling is empathy for Jane, not horror at Bertha.
   * **Why C:** Her suffering moves us, not amuses us — amusement is the response of comedy, not of a novel of formation.
   * **Why D:** The first-person voice draws us close, not detached; we feel *with* Jane, which is the whole design.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel such as Jane Eyre is designed to make the reader feel — above all — which response?
   * **Options:** A) Terror at the supernatural, B) Empathy and hope at a young person's growth, moved by both its cost and its triumph, C) Amusement at a comic misunderstanding, D) Admiration for the cleverness of the plot
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel of formation is built to make us invest in the protagonist's becoming — to feel with her the pain of the journey and the hope of her arrival. That empathetic hope is its emotional purpose.
   * **Why A:** Terror belongs to the Gothic strand, which colours the story but is not its governing aim.
   * **Why C:** Amusement is the effect of comedy; Jane's story earns feeling, not laughter.
   * **Why D:** We may admire the shape of the story, but the intended response is empathy and hope, not appreciation of craft.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *poignancy* — a tender sadness — even as Jane's story ends happily?
   * **Options:** A) Because the novel names its own literary techniques for us, B) Because her fulfilment is hard-won and costly — the lonely child, the loss of Helen Burns, the years apart from Rochester — so her happiness is shadowed by what it took, C) Because we are relieved the frightening parts are over, D) Because nothing sad ever happens to Jane
   * **Correct:** B
   * **Feedback:** ✓ Correct. Poignancy comes from the price of growth: we feel the cost of every loss and separation behind Jane's final joy, which is what makes a bildungsroman moving rather than merely pleasant.
   * **Why A:** Naming a technique is not a feeling; the effect is the tender sadness the growth-cost produces.
   * **Why C:** The lingering feeling is tenderness at what Jane endured, not simple relief at escaping the Gothic scares.
   * **Why D:** Much sorrow marks her path — that accumulated cost is exactly what gives the ending its poignancy.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel empathy and hope, tinged with poignancy — moved by Jane's growth into an equal and by all it cost her — rather than mainly the Gothic dread of Thornfield.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Gothic dread is a means, not the end: the governing feeling of a novel of formation is empathetic hope at the protagonist's becoming, deepened by tenderness for the cost.
   * **WhyWrong:** Treating dread as the main effect mistakes the Gothic texture for the purpose; the novel is built to leave us moved and hopeful at Jane's hard-won growth, not merely frightened.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about worth and equality?
   * **Options:** A) That a person's value is set by their wealth and rank, B) That every person — however poor, plain or lowly — possesses equal dignity and worth, and deserves to be met as an equal, C) That women should accept their inferior place, D) That love matters more than integrity
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jane's whole journey affirms that worth is spiritual and moral, not social: "I have as much soul as you" is the novel's enduring claim that dignity belongs to all, whatever their station.
   * **Why A:** The novel dramatises the opposite — a poor, plain governess proves equal in soul to her wealthy master.
   * **Why C:** Jane insists on equality against the age's hierarchy; submission is precisely what she refuses.
   * **Why D:** Jane will not sacrifice integrity even for love — she leaves Rochester rather than compromise it — so integrity, not love alone, is the higher value.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about how to live does Jane's story finally affirm?
   * **Options:** A) That comfort should be taken wherever it is offered, whatever the cost to conscience, B) That keeping faith with one's own conscience — even at great cost — is finally vindicated, C) That obedience to duty should always override the heart, D) That fortune, not character, decides a life
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jane sacrifices love and security to keep her integrity, and the novel rewards that fidelity to self with a fulfilment freely and honourably won. Its "so what" is that integrity is worth its cost.
   * **Why A:** Jane refuses comfort that would compromise her — the message is the reverse of taking ease at any price.
   * **Why C:** She rejects St John's dutiful, loveless proposal; pure duty is not the novel's ideal.
   * **Why D:** The novel affirms that Jane's character shapes her fate; fortune only rewards the self she has formed.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that a true union must be between equals — of soul and of standing — not a bond of ownership, dependence or mere duty.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Jane can marry Rochester only once she is his equal in fortune and he is humbled — "Reader, I married him" crowns a union of equals, which the novel holds up as love's proper form.
   * **WhyWrong:** The novel insists on equality in love: Jane refuses both possession by Rochester and loveless duty with St John, and marries only when she can meet her husband as an equal.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Jane both loves passionately and refuses to be owned. What does the novel ultimately suggest about the relationship between love and independence?
   * **Options:** A) That love requires surrendering one's independence entirely, B) That true love and self-respect are not opposed — real love is possible only between two people who remain free and equal, C) That independence means giving up on love altogether, D) That a woman must choose wealth over both love and freedom
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jane will neither lose herself in love nor deny her heart to stay free; the novel's message is that the two are reconciled only in a union of equals, where love and independence sustain each other.
   * **Why A:** Jane leaves rather than surrender herself — love that demands the loss of self is exactly what she refuses.
   * **Why C:** She does not renounce love; she refuses St John's loveless offer and returns to Rochester on equal terms.
   * **Why D:** Jane values neither wealth above love nor above freedom; her inheritance matters only because it lets her love as an equal.
