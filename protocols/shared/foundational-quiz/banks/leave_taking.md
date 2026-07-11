# Foundational Quiz Bank — Leave Taking

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Leave Taking is a work of **social realism** (a domestic drama of Windrush-generation migration)
→ the `effects` aspect tests the audience's **pathos and moral discomfort** — poignant sympathy for the
migrant generation's sacrifice and the ache of belonging and letting go — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`leave_taking.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Leave Taking

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Enid *changes* across the play — and what drives the change?
   * **Options:** A) She is cold and unloving from the first scene and never really changes, B) She begins a proud mother defined by the dream of one day returning "home" to Jamaica, and — through loss and her daughters' distance — learns to let go of that dream and accept that her home and family are now in Britain, driven by her own refusal to face change, C) She stays exactly the same throughout, simply working hard, D) She is controlled by Mai's obeah and has no say in what she becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The change is the point: Enid moves from clinging to an idealised Jamaica to taking leave of it and accepting her life in Britain — and it is her own denial, not fate, that she must overcome.
   * **Why A:** She loves her daughters deeply from the start; the drama lies in her transformation, not in fixed coldness.
   * **Why C:** She does change — her whole journey is learning to let go; reading her as static misses the arc.
   * **Why D:** Mai guides but never controls; removing Enid's agency erases the choice that makes her growth her own.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Enid a *sympathetic* central figure rather than simply a controlling mother?
   * **Options:** A) She is wholly selfish and cares nothing for her children, B) She is a woman of real strength and sacrifice whose flaw — clinging too tightly to an idealised "home" and to her grip on her daughters — springs from love and loss, so her struggle moves us, C) She is faultless and never wrong about anything, D) She abandons her family and feels nothing
   * **Correct:** B
   * **Feedback:** ✓ Correct. A sympathetic protagonist in social realism is an in-between figure: real strength and love, undermined by an understandable fault. That is why her loneliness and denial move us rather than repel us.
   * **Why A:** Her sacrifice is for her daughters' sake; selfishness misreads the love that drives her.
   * **Why C:** She does err — her clinging strains the family; a faultless figure could not grow.
   * **Why D:** She never abandons them; her whole life is sacrifice for them.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Enid's evolution from beginning to end?
   * **Options:** A) A carefree woman at the start → a bitter recluse at the end, B) A mother defined by longing for Jamaica and the hope of return → a woman who takes leave of that dream and reaches, however painfully, toward her daughters and her life in Britain, C) A wealthy landowner at the start → a penniless beggar at the end, D) A young student at the start → a retired teacher at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from a self built on the dream of "home" to a hard-won acceptance that home is here, with her daughters — the same woman, remade by loss. That arc is the leave-taking of the title.
   * **Why A:** She is burdened, not carefree, at the start, and reaches toward reconciliation, not bitter isolation, at the end.
   * **Why C:** The play concerns migration and family, not lost wealth; this misreads her situation entirely.
   * **Why D:** Enid is the hardworking migrant mother, not a student or teacher; this confuses who she is.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Enid's journey is driven above all by her own need to let go — of an idealised Jamaica and of her tight grip on her daughters; loss forces the reckoning, but the acceptance is hers to reach.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Circumstance presses on her, but the growth is Enid's own: she must choose to release the dream of return and reach toward her daughters. That agency is what makes the arc hers.
   * **WhyWrong:** Nothing simply happens to Enid — her transformation turns on her own hard choice to let go; treating her as passive removes the very struggle at the play's heart.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Enid's clinging to an idealised "home" in Jamaica *lead to* conflict with her daughters? (What is the causal link?)
   * **Options:** A) The two things are unconnected and simply happen at the same time, B) Because Enid measures her British-born daughters against Caribbean values and the dream of return, they feel she cannot accept who they are — so her longing for the past causes the rift in the present, C) Mai orders the daughters to rebel against Enid, D) The daughters rebel for no reason at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: Enid's backward-looking hold on "home" makes her daughters feel unseen, and that is what drives the estrangement. The conflict is caused, not coincidental.
   * **Why A:** The clash flows directly from Enid's clinging; reading the two as unconnected misses the causal link.
   * **Why C:** Mai guides Del but issues no orders; the rebellion grows from the family's own tensions.
   * **Why D:** The daughters' distance has a clear cause — feeling caught between their mother's world and their own.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the family's crisis — not just the order of events?
   * **Options:** A) A series of unrelated troubles that strike the family by chance, B) Enid's grip on an idealised past strains her daughters → Del rebels and leaves, turning to Mai and her heritage → the loss of Enid's mother in Jamaica shatters the dream of return → Enid is forced to confront her denial and reach, at last, toward acceptance and her daughters, C) Mai's obeah magically causes every event, so nothing is the family's doing, D) Nothing the characters do matters; events are fixed from the outset
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage grows by necessity from the one before, all rooted in Enid's refusal to let go. That causal spine — not a list of happenings — is what makes it a shaped drama.
   * **Why A:** The crisis is not random misfortune; it is the outworking of the family's own tensions and Enid's denial.
   * **Why C:** Mai guides but works no plot-driving magic; the causes are human and emotional.
   * **Why D:** The characters' choices drive everything — Enid's clinging, Del's leaving, Enid's final acceptance.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which event is the turning point that finally forces Enid to confront her denial and begin to let go?
   * **Options:** A) Enid's first arrival in Britain years before the play begins, B) The death of Enid's mother back in Jamaica, which destroys the possibility of ever "returning home", C) Viv sitting an ordinary school exam, D) Del first learning to cook a Caribbean dish
   * **Correct:** B
   * **Feedback:** ✓ Correct. Her mother's death is the irreversible blow: with "home" gone, the dream of return collapses, and Enid can no longer avoid facing where her life and family truly are. That is the play's turning point.
   * **Why A:** Her arrival is the play's backstory, not the turning point within its action.
   * **Why C:** Viv's exams are a real pressure but not the pivot that breaks Enid's denial.
   * **Why D:** A single domestic moment is not the loss that shatters Enid's dream of return.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Leave Taking the family's estrangement and reconciliation follow by cause-and-effect from Enid's refusal to let go of the past — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The drama is built on emotional cause and effect: Enid's clinging drives the rift, loss forces the reckoning, and acceptance makes reconciliation possible. Each step is *because of* the last.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal spine — Enid's denial and its consequences — that shapes the whole play.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Raising her daughters alone, Enid says she has had to be "man and woman". What does this reveal about the play's view of the migrant generation's sacrifice?
   * **Options:** A) That migrant parents had easy, comfortable lives, B) That the migrant generation, often alone and unsupported, bore an immense double burden of labour and care so their British-born children might have more, C) That Enid does not really care for her children, D) That only fathers matter in a family
   * **Correct:** B
   * **Feedback:** ✓ Correct. "Man and woman" captures the whole theme of sacrifice: Enid carries the work of two parents single-handed, dramatising what the Windrush generation gave up for the next.
   * **Why A:** The line testifies to hardship, not ease; the play stresses how heavy that burden was.
   * **Why C:** The sacrifice springs precisely from love for her daughters.
   * **Why D:** The point is that Enid must be *both* — the play honours her labour, not a father's role.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Del rebels against Enid yet later turns to Mai and obeah. Which controlling idea does this explore?
   * **Options:** A) That heritage is worthless and best abandoned, B) That the second generation must find its own path to identity — and that belonging is often reclaimed by reconnecting with the Caribbean heritage it first resisted, C) That obeah is simply a joke, D) That Del has no interest in who she is
   * **Correct:** B
   * **Feedback:** ✓ Correct. Del's journey — away from her mother, toward Mai — dramatises the play's idea that identity is not simply inherited but sought, and that roots first rejected can be reclaimed on one's own terms.
   * **Why A:** The play affirms heritage as a source of belonging, not something worthless.
   * **Why C:** Obeah is treated as a serious spiritual inheritance, not a joke.
   * **Why D:** Del's whole arc is a search for identity; indifference misreads her.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The daughters are British-born children of a Jamaican mother. Which idea does the play most explore through them, and how does it *work*?
   * **Options:** A) That identity is fixed at birth and never in question, B) That the second generation is caught between two cultures — their mother's Caribbean heritage and their British upbringing — and must forge a belonging of their own, C) That the daughters have no connection to Britain at all, D) That culture has no effect on who a person becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. Del and Viv live on the line between Caribbean and British; the play works through their divided belonging to ask how the second generation makes an identity that is truly theirs.
   * **Why A:** The play shows identity as something struggled for, not fixed at birth.
   * **Why C:** They are British-born and rooted here; the tension is between two belongings, not the absence of one.
   * **Why D:** Culture and heritage shape the whole conflict; denying their effect misses the play's subject.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Leave Taking, "home" is shown to be not simply a place on a map but something remembered, longed for, and finally remade — Enid must learn that home is the life and family she has built in Britain.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The play turns "home" from a fixed Caribbean destination into something carried, mourned and rebuilt — Enid's growth is learning that home is now here, with her daughters.
   * **WhyWrong:** "Home" in the play is far more than a location — it is memory, longing and, at last, the family remade in Britain; Enid's journey is precisely to relearn where home is.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Leave Taking is a work of social realism. Why do we feel deep *sympathy* for Enid by the end, despite her clinging and her clashes with her daughters?
   * **Options:** A) Because she is faultless and never does anything wrong, B) Because we see the loneliness and sacrifice beneath her hardness — a woman who gave everything and is losing the "home" and children she clung to — so her struggle moves us to compassion, C) Because Mai's magic forces us to feel sorry for her, D) Because she wins a great fortune and we are glad for her
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social realism moves us through recognisable human pain: Enid's fault is understandable and her sacrifice real, so watching her loneliness and loss stirs compassion, not blame.
   * **Why A:** We feel for her *because* she is flawed and human, not despite being faultless — sympathy needs her real struggle.
   * **Why C:** The feeling comes from her recognisable humanity, not any magic; obeah does not manufacture our pity.
   * **Why D:** There is no fortune; the emotion is poignant sympathy for loss, not gladness at gain.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A social-realist family drama such as Leave Taking is designed to make the audience feel — above all — which response?
   * **Options:** A) Amusement and light entertainment, B) Poignant sympathy and moral discomfort — we ache for the family's divisions and sacrifices, and are troubled by the hardship and prejudice they endure, C) Triumphant excitement at a hero's victory, D) Fear of a supernatural monster
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social realism aims to move and to trouble: we feel the pathos of the family's losses and the moral discomfort of the injustice they face, so we look with new eyes at real lives like theirs.
   * **Why A:** Light amusement belongs to comedy; a drama that merely entertained would miss its purpose.
   * **Why C:** There is no triumphant victory; the register is poignant, not exultant.
   * **Why D:** The play holds no supernatural monster; its power is human and social, not gothic dread.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *moral discomfort* as we watch the family's story unfold?
   * **Options:** A) Because the characters are strange creatures unlike anyone real, B) Because the family's hardship — the racism and struggle of 1980s Black Britain, and the cost borne by the migrant generation — implicates the society around them, and so unsettles us, C) Because we are afraid the family will use magic against us, D) We feel nothing at all, only boredom
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social realism turns private pain outward: the family's suffering exposes the prejudice and hardship of the world they live in, so our discomfort is really unease at an injustice we are asked to see.
   * **Why A:** The family are recognisably real; that reality is exactly what makes their hardship trouble us.
   * **Why C:** The unease is moral and social, not fear of magic.
   * **Why D:** Boredom is the mark of a failed drama; this play is built to move and disturb.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both pathos and a note of hope — sympathy for all Enid has sacrificed and lost, and quiet hope in the family's fragile reconciliation.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — poignant sorrow for the leave-taking and cautious hope at the reaching-together — is the emotional effect this social-realist drama is built to leave us with.
   * **WhyWrong:** The intended effect is pathos *and* tempered hope, not amusement or triumph; the reconciliation is meant to move us, mixing sorrow at what is lost with hope for what may yet mend.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about identity and belonging?
   * **Options:** A) That identity is fixed by where you were born and can never change, B) That belonging is not simply inherited but forged — each generation must make its own identity from its roots, and "home" is claimed and remade, not merely returned to, C) That heritage should be forgotten entirely in order to fit in, D) That family bonds do not really matter
   * **Correct:** B
   * **Feedback:** ✓ Correct. Through Enid's letting go and the daughters' search, the play affirms that identity and belonging are actively made — roots honoured, not clung to — a truth that outlasts any one family.
   * **Why A:** The play shows identity as something struggled for and remade, not fixed at birth.
   * **Why C:** It affirms heritage as a source of belonging, not something to erase.
   * **Why D:** The mother-daughter bond is the heart of the play's meaning, not a triviality.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play suggest about the sacrifices of the Windrush generation and the cost of migration?
   * **Options:** A) That migration was easy and cost the migrants nothing, B) That the migrant generation bore great hardship, loss and prejudice so their children might belong — a sacrifice the play insists we recognise and honour, C) That their children owed them nothing and should forget them, D) That Britain welcomed them without difficulty
   * **Correct:** B
   * **Feedback:** ✓ Correct. Enid's "man and woman" labour and her lost "home" dramatise the price the Windrush generation paid; the play's lasting claim is that this sacrifice must be seen and valued.
   * **Why A:** The play stresses how heavy the cost was — loneliness, loss, prejudice — not ease.
   * **Why C:** The daughters' journeys toward their heritage affirm the tie, not its erasure.
   * **Why D:** The 1980s setting foregrounds the hostility Black British families faced, not an easy welcome.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that healing between generations comes not from clinging to the past but from taking leave of it — honouring one's roots while accepting change.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Enid's growth embodies the message: reconciliation becomes possible only once she loosens her grip on an idealised past and accepts her daughters and her life as they are.
   * **WhyWrong:** The play insists that letting go, not clinging, is what heals — Enid must take leave of the past to reach her daughters; that acceptance is central to its meaning.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written about Black British family life, the play ultimately affirms which idea about "home"?
   * **Options:** A) That home is only ever the country you were born in, and nowhere else, B) That home is not a fixed place you return to but the life, family and belonging you build and carry with you, C) That home does not really matter to anyone, D) That the past should be abandoned completely and forgotten
   * **Correct:** B
   * **Feedback:** ✓ Correct. The title's "leave taking" is the play's answer: home is remade, not merely returned to — Enid learns her home is the family she has built in Britain, roots and all.
   * **Why A:** The play redefines home away from a single birthplace toward something built and carried.
   * **Why C:** Home — where one belongs — is the play's central concern, not an irrelevance.
   * **Why D:** The play honours the past even as it lets go of clinging; it does not counsel forgetting.
