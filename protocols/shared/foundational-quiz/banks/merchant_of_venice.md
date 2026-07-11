# Foundational Quiz Bank — The Merchant of Venice

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. The Merchant of Venice is a **comedy** → the `effects` aspect tests the audience's **delight and
relief** as disorder resolves into harmony, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`merchant_of_venice.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: The Merchant of Venice

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Portia *changes* across the play — and what drives the change?
   * **Options:** A) She is a scheming manipulator from the first scene and never really changes, B) She begins a wealthy heiress bound and made passive by her dead father's casket test, and becomes the play's most active agent — driven by her own choice to disguise herself as a lawyer and save Antonio through her wit, C) She stays a helpless bride throughout and is simply rescued by the men around her, D) The Duke commands her every move, so nothing she becomes is her own doing
   * **Correct:** B
   * **Feedback:** ✓ Correct. Portia's arc is the change: from an heiress who cannot even choose her own husband to the advocate who out-argues Shylock and saves a life — and the engine of that change is her own decision to act, not luck or command.
   * **Why A:** She is dutiful and constrained at the start, not a schemer; the drama lies in her transformation into an active agent, not in fixed cunning.
   * **Why C:** She is not merely rescued — she does the rescuing, choosing to disguise herself and enter the court; treating her as passive misses the whole arc.
   * **Why D:** No one commands her; removing her agency turns the play's most decisive figure into a puppet and erases why the change is her own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Portia the play's true *protagonist* rather than a decorative heroine?
   * **Options:** A) She is powerless and merely inherits her fortune, doing nothing herself, B) She refuses to remain a passive prize — by her own choice she leaves Belmont, disguises herself as the advocate Balthazar and resolves the crisis with wit and law, C) She is wholly ruthless and cares for no one, D) She does nothing and the plot resolves itself without her
   * **Correct:** B
   * **Feedback:** ✓ Correct. A comic protagonist sheds a rigid or constrained self and acts to restore order; Portia does exactly this, moving from a bound heiress to the agent who mends the crisis by her own initiative.
   * **Why A:** Her inheritance is the starting constraint, not her achievement; what marks her out is the action she chooses to take beyond it.
   * **Why C:** She is clever and playful, not ruthless; her care for Antonio and Bassanio is precisely what drives her to act.
   * **Why D:** The plot resolves *because* of her — remove Portia and Antonio dies; she is the cause of the resolution, not a bystander.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Portia's evolution from beginning to end?
   * **Options:** A) A powerful ruler at the start → a humble servant at the end, B) A wealthy heiress bound by her father's casket test, unable to choose her own husband → the clever advocate who saves Antonio's life and stage-manages the ring plot, C) A poor commoner at the start → a crowned queen at the end, D) A disguised man at the start → a woman revealed at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from constraint to command — the same woman, freed by her own wit into decisive action. That arc from bound heiress to resourceful agent IS her story.
   * **Why A:** She begins constrained, not ruling, and ends empowered, not servile — this reverses her actual arc.
   * **Why C:** She is wealthy from the outset and never crowned; this invents a rise she does not make.
   * **Why D:** Portia is a woman who *adopts* a disguise partway through, not a man revealed as a woman; this confuses who she is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Portia's decisive role is driven above all by her own initiative — bound at first by her father's test, she chooses to disguise herself and enter the court to save Antonio.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The casket test constrains her, but she is not content to wait: she weighs the danger and acts, and it is her choice to intervene that turns her from a passive heiress into the play's driving force.
   * **WhyWrong:** No one forces Portia into the courtroom — she chooses to go. Treating her as a bystander who is merely rescued removes the initiative that makes her the protagonist rather than a prize.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Antonio's loan from Shylock *lead to* the courtroom crisis? (What is the causal link?)
   * **Options:** A) The loan and the trial are unconnected events that simply happen in order, B) Antonio seals a deadly bond to fund Bassanio's courtship; when his ships are reported lost he cannot repay, so the forfeit — a pound of flesh — falls due and must be settled in court, C) The Duke orders Antonio arrested for no reason, D) Shylock sinks Antonio's ships himself to force the trial
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the bond taken to help a friend becomes deadly the moment the ships are lost, and that unpaid forfeit is what drives the case to court. This causal necessity is what makes the plot an arc, not a list of events.
   * **Why A:** In a well-made plot events follow by cause, not mere sequence; reading the bond and the trial as unconnected misses the chain that links them.
   * **Why C:** Antonio is brought to court by Shylock's lawful claim on the bond, not by an arbitrary royal order.
   * **Why D:** Shylock does not destroy the ships; they are reported lost at sea by chance, and it is the *bond* that hands him his opening.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the play's central crisis and its resolution — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the characters by bad luck, B) Antonio borrows for Bassanio → seals the flesh-bond → his ships are lost → the forfeit falls due → the disguised Portia turns the bond's own wording ("no jot of blood") against Shylock → Antonio is freed and the lovers reunited, C) Fate decides each step directly, so no character's choice matters, D) The events happen at random, with no cause connecting them
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before — the bond made in friendship becomes the trap, and the trap is sprung by Portia's reading of its very words. That linked chain is the comic arc: threat escalates, then recognition sets everything right.
   * **Why A:** The crisis is not random misfortune — it is the logical outworking of the bond Antonio freely sealed.
   * **Why C:** The resolution turns on Portia's *choice* to intervene and her wit — making fate the cause erases the agency that drives the plot.
   * **Why D:** If the events were unconnected there would be no arc; the whole play turns on the bond causing the trial causing the rescue.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that lifts the crisis from deadly toward resolution — the point where Shylock's certain victory collapses?
   * **Options:** A) Bassanio choosing the lead casket at Belmont, B) The disguised Portia granting the pound of flesh but ruling the bond allows "no jot of blood", C) Jessica eloping with Lorenzo, D) Antonio's ships first setting sail
   * **Correct:** B
   * **Feedback:** ✓ Correct. "No jot of blood" is the irreversible turn: the instant Portia concedes the flesh yet forbids the blood, Shylock's winning case becomes his ruin, and the deadly plot swings toward comic resolution. That is the recognition that sets everything right.
   * **Why A:** The casket choice wins Portia a husband but does nothing to resolve the trial; the deadly crisis is still to come.
   * **Why C:** Jessica's elopement deepens Shylock's bitterness — a *cause* feeding the crisis, not the turn that resolves it.
   * **Why D:** The ships setting sail is the ordinary background that later, by their loss, *triggers* the crisis; it is not the point that undoes it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the play the courtroom crisis follows by cause-and-effect from the flesh-bond Antonio sealed to help Bassanio — it is not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. A well-made plot is built on necessity, not mere sequence: the bond causes the danger, the lost ships trigger the forfeit, and Portia's ruling resolves it — each event *because of* the last.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal chain — the very thing that turns the plot into an arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Portia pleads that "the quality of mercy is not strained". What does this reveal about the play's view of justice and mercy?
   * **Options:** A) That the law must always be applied to its exact letter, whatever the cost, B) That justice tempered by mercy is higher than the law's rigid letter — mercy, freely given, blesses both the one who gives and the one who receives, C) That mercy is weakness and revenge is the just course, D) That mercy matters only to Shylock
   * **Correct:** B
   * **Feedback:** ✓ Correct. Portia sets mercy — unforced, falling "like gentle rain from heaven" — against Shylock's demand for the letter of the bond; the play's argument is that true justice must be softened by compassion.
   * **Why A:** The speech pleads the *opposite* — that clinging to the law's exact letter, without mercy, becomes cruelty.
   * **Why C:** The play frames mercy as strength and grace, not weakness; it is Shylock's insistence on revenge that is shown to destroy him.
   * **Why D:** Mercy is urged upon Shylock but stands as a value for everyone; the plea is universal, not his private concern.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The gold casket's scroll warns that "all that glisters is not gold". Which controlling idea does the casket test announce?
   * **Options:** A) That gold is the most valuable of metals, B) That outward show deceives — true worth lies beneath the surface, so the humble lead casket, not the glittering gold, wins Portia, C) That appearances always tell the truth, D) That wealth is a sure guarantee of happiness
   * **Correct:** B
   * **Feedback:** ✓ Correct. The casket test dramatises the gap between showy surface and real value: the suitor who looks past glitter to the plain lead casket wins, making appearance-versus-reality a controlling idea of the whole play.
   * **Why A:** The line is a warning *against* being dazzled by gold, not praise of it as most valuable.
   * **Why C:** The test shows the reverse — the golden surface promises more than it holds, so appearances mislead.
   * **Why D:** Portia's wealth complicates rather than guarantees happiness; the theme is worth beneath show, not riches as reward.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Shylock's speech "Hath not a Jew eyes? ... If you prick us, do we not bleed?" most explores which idea, and how does it *work*?
   * **Options:** A) The folly of ambition, B) Shared humanity — Shylock insists a Jew feels, bleeds and suffers exactly as a Christian does, exposing the cruelty of the prejudice he endures, C) The power of fate over human lives, D) The beauty of the natural world
   * **Correct:** B
   * **Feedback:** ✓ Correct. By pressing "if you prick us, do we not bleed?", Shylock builds, step by step, a claim to a common humanity — forcing the audience to feel the injustice of the hatred that surrounds him.
   * **Why A:** The speech is about shared feeling and the wrong of prejudice, not ambition.
   * **Why C:** Shylock appeals to human sameness, not to destiny or fate.
   * **Why D:** His subject is human equality, not nature; the "eyes... hands... senses" are the body's proof of shared feeling.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In the play the demand for strict justice — Shylock's bond enforced to its exact letter — is set against the plea for mercy, and this tension between law and compassion is one of its controlling ideas.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The trial stages the play's great moral debate: Shylock's insistence on the letter of the bond against Portia's plea that "the quality of mercy is not strained" — justice and mercy weighed against each other.
   * **WhyWrong:** The courtroom is built precisely on this tension; treating it as a simple contest of good against evil misses the ideas of law and mercy the scene is designed to explore.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** The Merchant of Venice is a comedy. Why do we feel *relief* by the close, despite the darkness of the trial?
   * **Options:** A) Because a man of real greatness has been destroyed by his own error, and his ruin feels like a terrible waste, B) Because the deadly threat is lifted, the lovers are united at Belmont, and disorder gives way to harmony — the comic pleasure of a crisis survived and mended, C) Because we are impressed by the technique of dramatic irony, D) Because Shylock triumphs at last and takes his revenge on Antonio
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy is built to leave us relieved and warmed: the knife is stayed, Antonio lives, and the tangle of the plot resolves into reunion and marriage. The feeling is the pleasure of order restored.
   * **Why A:** Pity for a great man's self-caused ruin is the emotion of *tragedy* — the wrong genre; this comedy resolves in survival and reunion, not waste.
   * **Why C:** Dramatic irony is a *device*, not the feeling it produces; naming the technique mistakes the tool for the effect it creates.
   * **Why D:** Shylock is defeated and Antonio saved — the relief flows from the threat being lifted, not from revenge succeeding.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A comedy such as this is designed, above all, to make the audience feel which emotions?
   * **Options:** A) Pity and fear at a hero's ruin, B) Delight and relief, as confusion, disguise and threatened disaster resolve into harmony and marriage, C) Dread and horror at the supernatural, D) The recognition of a soliloquy
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy aims at delight and relief — the enjoyment of watching misunderstanding and danger untangle, ending in reunion. That is the emotional purpose the whole arc serves.
   * **Why A:** Pity and fear are the aims of tragedy; a comedy that only frightened or grieved us would fail its purpose.
   * **Why C:** Dread and horror belong to the gothic; this play ends in warmth and harmony, not terror.
   * **Why D:** A soliloquy is a *technique*, not a feeling — naming a device answers the wrong question about the audience's response.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *delight* as Portia wins the courtroom scene?
   * **Options:** A) Because we admire the cruelty of the punishment inflicted on Shylock, B) Because her wit turns a deadly situation to safety — the pleasure of watching cleverness restore order and lift the threat to Antonio, C) Because we are frightened for our own lives as we watch, D) Because the scene lets us name the device of disguise
   * **Correct:** B
   * **Feedback:** ✓ Correct. The delight is comic relief: a life in mortal danger is saved by a stroke of wit, and we enjoy the ingenuity that snatches order out of disaster.
   * **Why A:** The pleasure is in the rescue, not in cruelty; Shylock's harsh defeat in fact complicates, rather than sweetens, our delight.
   * **Why C:** Fear for ourselves is the response of tragedy or the gothic; here the feeling is relief that the threat is defeated.
   * **Why D:** Disguise is a *technique* Portia uses; naming the device is not the same as the delight the resolution makes us feel.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel relief and warmth — the threat lifted, the lovers reunited at Belmont — the emotional effect a comedy is built to produce as disorder resolves into harmony.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That relieved, warmed feeling as danger gives way to reunion is exactly what a comedy is designed to leave us with — though Shylock's forced defeat lends this particular ending a disquieting aftertaste.
   * **WhyWrong:** The intended effect is comic relief and warmth as order is restored, not the pity and fear of tragedy or the dread of the gothic; the ending is built to reunite and reassure, not to grieve.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about justice and mercy?
   * **Options:** A) That the law should always be enforced to its exact letter, whatever the human cost, B) That true justice must be tempered by mercy — a society that shows compassion, rather than demanding the strict letter of the law, is the one that heals and endures, C) That revenge is a just and satisfying response to being wronged, D) That mercy has no proper place in matters of law
   * **Correct:** B
   * **Feedback:** ✓ Correct. Through Portia's plea and Shylock's undoing, the play argues that clinging to the letter of the law without mercy turns justice into cruelty — its enduring "so what" is that compassion must temper the law.
   * **Why A:** The trial shows the letter of the law, pressed without mercy, becoming deadly — the opposite of the message.
   * **Why C:** Revenge destroys Shylock rather than satisfying anyone; the play sets mercy, not vengeance, as the higher course.
   * **Why D:** The whole courtroom argues that mercy *belongs* at the heart of justice — dismissing it inverts the play's meaning.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about appearance and worth does the play affirm through the casket test and the disguises?
   * **Options:** A) That glittering surfaces reliably reveal true value, B) That outward show deceives and true worth lies beneath the surface — the plain lead casket wins, and hidden identities see and act more truly than open ones, C) That wealth is the truest measure of a person's worth, D) That disguise is always a wicked deception
   * **Correct:** B
   * **Feedback:** ✓ Correct. The lead casket over the gold, and Portia's truth-telling disguise, both affirm that reality lies beneath appearance — the play's lasting warning against being dazzled by surface.
   * **Why A:** "All that glisters is not gold" says the exact reverse — surfaces mislead.
   * **Why C:** The caskets teach that worth is not measured by glitter or gold; wealth is the deceptive surface, not the truth.
   * **Why D:** Portia's disguise serves justice and love; the play uses it to *reveal* truth, not to condemn all concealment.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting concerns is that prejudice dehumanises — Shylock's "Hath not a Jew eyes?" presses the audience to recognise a common humanity beneath the labels that divide Venice.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Even within a comedy, Shylock's speech forces the question of shared humanity, so that the play leaves an enduring unease about the cruelty of the prejudice it depicts.
   * **WhyWrong:** The speech insists a Jew "bleeds" and "feels" as any Christian does; reading Shylock as simply a villain to be defeated misses the play's lasting challenge to prejudice.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The play closes with the lovers reunited at Belmont. What worldview does this comic resolution affirm?
   * **Options:** A) That human divisions are permanent and can never be healed, B) That folly, misunderstanding and division can be survived, forgiven and mended — order restored and community renewed through love and reconciliation, C) That revenge and the strict letter of the law should have the final word, D) That marriage and harmony are ultimately meaningless
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy's worldview is renewal: the play ends with reunion and marriage at Belmont, affirming that the confusions and conflicts which seem to define us can be outgrown and put right.
   * **Why A:** The comic ending exists to show the *opposite* — that division can be resolved into harmony.
   * **Why C:** The resolution turns *away* from revenge and the bare letter of the law toward mercy and reconciliation.
   * **Why D:** The closing marriages are the very emblem of restored order; treating them as meaningless denies the genre's affirmation of renewal.
