# Foundational Quiz Bank — The Tempest

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. The Tempest is a **late romance / tragicomedy** → the `effects` aspect tests the audience's
**wonder and the relieved, warm delight of reconciliation and forgiveness**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`the_tempest.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: The Tempest

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Prospero *changes* across the play — and what drives the change?
   * **Options:** A) He is a gentle, forgiving man from the first scene and never really changes, B) He begins a wronged exile who masters magic to control his enemies, and becomes a man who chooses mercy and surrenders his power — driven by his own decision that "the rarer action is in virtue than in vengeance", C) He starts merciful and hardens into a vengeful tyrant by the end, D) The spirits force him to forgive his enemies against his will
   * **Correct:** B
   * **Feedback:** ✓ Correct. The romance is the *turn*: Prospero moves from a controlling avenger who bends the whole island to his will to a man who freely chooses forgiveness — and the engine of the change is his own choice, not compulsion.
   * **Why A:** For most of the play he is controlling and set on a reckoning; the drama lies in his turn towards mercy, not in fixed gentleness.
   * **Why C:** This reverses his actual arc — he moves *towards* forgiveness and reconciliation, not away from them.
   * **Why D:** Ariel prompts his pity, but the choice to forgive is Prospero's own; removing his agency turns a chosen mercy into a puppet's reflex and misses what makes the change his.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Prospero more than a simple avenger set on punishing those who wronged him?
   * **Options:** A) He is wholly gentle and never seeks any kind of control, B) Though he has the power and the grievance to take revenge, he chooses "virtue" over "vengeance" — and it is that reversal of his own impulse that redeems him, C) He is entirely ruthless and forgives no one, D) He has no real power and so revenge was never possible
   * **Correct:** B
   * **Feedback:** ✓ Correct. Prospero is an in-between figure: genuinely wronged and armed with near-total power, yet he masters the urge to punish. The change of heart — revenge renounced for mercy — is what lifts him above a mere avenger.
   * **Why A:** He does exert enormous control over the island and everyone on it; his greatness is in relinquishing it, not in never having it.
   * **Why C:** He forgives even Antonio, the brother who betrayed him — ruthlessness is exactly what he overcomes.
   * **Why D:** He has the power to drown or imprison his enemies; the point is that he chooses not to use it.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Prospero's evolution from beginning to end?
   * **Options:** A) A contented island king at the start → a broken, powerless exile at the end, B) A wronged duke wielding near-total magical control and bent on a reckoning → a man who forgives his enemies, frees Ariel, and vows to break his staff and "drown my book", C) A humble servant at the start → a cruel sorcerer at the end, D) A shipwrecked sailor at the start → the King of Naples at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a magus who commands storms and spirits to a man who lays that power down of his own accord. The same man, choosing mercy and freedom over mastery — that arc IS the romance.
   * **Why A:** He is a driven, powerful magus at the start, not a contented king, and he ends restored to his dukedom, not broken.
   * **Why C:** He is the master of the island throughout, not a servant who becomes cruel — this inverts who he is.
   * **Why D:** Prospero is the rightful Duke of Milan, not a sailor; this confuses him with other characters entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Prospero's arc is driven above all by his own choice to forgive rather than punish — he has full power to take revenge, but decides mercy is the "rarer", nobler action.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The magic gives him total command, so nothing forces his hand; his growth is precisely that he *chooses* virtue over vengeance, and that choice is what makes the ending his own achievement.
   * **WhyWrong:** Nothing compels Prospero to forgive — Ariel only prompts him. Treating the mercy as forced removes the free choice that makes his transformation meaningful rather than accidental.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Prospero raise the storm at the start? (What is the causal link to everything that follows?)
   * **Options:** A) The storm is a random natural disaster unconnected to the plot, B) He conjures it deliberately to wreck his enemies' ship and bring them within his power, so that the long-planned reckoning — and eventual reconciliation — can finally happen, C) The storm is raised by Caliban to overthrow Prospero, D) He raises it by accident while practising his magic
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the storm is engineered to gather Prospero's enemies onto the island, which makes possible the confrontation, the testing, and finally the mercy. The plot is a designed causal arc, not a run of chance events.
   * **Why A:** In this play events follow by design, not accident — reading the storm as random misses that Prospero *plans* it to set everything in motion.
   * **Why C:** Caliban has no such power; the storm is Prospero's art, raised through Ariel.
   * **Why D:** It is no accident — Prospero raises the tempest with precise intent, at the exact moment his enemies sail near.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the play — not just the order of events?
   * **Options:** A) A series of unrelated adventures that happen to Prospero by luck, B) Antonio usurps the dukedom → Prospero is exiled and masters magic → he raises the storm to gather his enemies → his art brings them to a reckoning → he chooses forgiveness → he relinquishes his power and order is restored, C) The spirits decide each step, so nothing is Prospero's doing, D) The events could occur in any order without changing the outcome
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in the original wrong done to Prospero and resolved by his choice to forgive. That is the romance arc: injury → engineered reckoning → mercy → restoration.
   * **Why A:** His story is not random adventure — every step is the causal outworking of the usurpation and his own design.
   * **Why C:** Ariel and the spirits *execute* Prospero's plan; making them the cause erases the design that is his.
   * **Why D:** Order matters absolutely — the reckoning must precede the mercy, and the mercy must precede the restoration; this is causation, not a shuffle of events.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that steers the play towards reconciliation rather than revenge?
   * **Options:** A) The shipwreck in the opening scene, B) The moment Ariel's account of the suffering enemies moves Prospero, and he resolves that "the rarer action is in virtue than in vengeance", C) Caliban's drunken plot with Stephano and Trinculo, D) Ferdinand carrying logs for Prospero
   * **Correct:** B
   * **Feedback:** ✓ Correct. This is the hinge: with his enemies helpless and revenge within reach, Prospero chooses mercy instead. Everything after — the forgiveness, the freeing of Ariel, the return to Milan — follows from this decision.
   * **Why A:** The shipwreck sets the plot in motion but decides nothing about mercy or revenge; the outcome is still open.
   * **Why C:** The drunken plot is a comic sub-thread and a consequence, not the choice that turns the whole play towards reconciliation.
   * **Why D:** Ferdinand's labour tests his love for Miranda; it is not the moment that determines Prospero's mercy.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** The events of The Tempest follow by cause-and-effect from Prospero's design — the shipwreck is deliberately raised to bring his enemies within reach, not a chance disaster.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Romance plotting here is built on design, not accident: the storm is engineered, the enemies are led exactly where Prospero wants them, and each event is *because of* his plan. That causal spine is what shapes the arc towards its chosen ending.
   * **WhyWrong:** Reading the storm as accidental misses the whole design — Prospero raises it on purpose, and every later event follows from that deliberate first act.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Prospero declares that "the rarer action is in virtue than in vengeance". What does this reveal about the play's view of how we should answer wrong?
   * **Options:** A) That revenge is always the just response to betrayal, B) That mercy is the harder and nobler choice — forgiveness, not vengeance, is what truly rises above being wronged, C) That the wronged should simply forget and do nothing, D) That only the powerless ever forgive
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line is the play's whole argument about injury: the "rarer", greater action is to forgive when one could punish. Mercy chosen from a position of power is the romance's moral summit.
   * **Why A:** The play sets revenge aside as the lesser path; it dramatises the opposite of Prospero's opening impulse.
   * **Why C:** Prospero does not forget — he confronts his enemies fully, then chooses to pardon; forgiveness here is active, not passive.
   * **Why D:** The point is the reverse: Prospero forgives *from* total power, which is exactly what makes the mercy "rarer".

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Both Ariel and Caliban long to be free of Prospero. Which controlling idea does this contrast most explore, and how does it work?
   * **Options:** A) That magic is more powerful than nature, B) Freedom and servitude — the play weighs one person's power over another, and moves towards releasing it, as Prospero finally frees Ariel and lays down his own mastery, C) That the weather controls the plot, D) That Ariel and Caliban are secretly the same character
   * **Correct:** B
   * **Feedback:** ✓ Correct. The two bound servants dramatise the question of control: who may hold power over whom. The play works this idea towards release — Ariel is freed and Prospero surrenders his art, so liberty answers servitude.
   * **Why A:** The contrast is about who is bound and who is free, not a contest between magic and nature.
   * **Why C:** The storm mirrors the theme but the idea itself is human freedom and servitude, not literal weather.
   * **Why D:** They are pointedly different — airy Ariel and earthbound Caliban — and the theme lives in that difference, not a hidden sameness.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Prospero's reflection "We are such stuff as dreams are made on" belongs to which idea the play keeps exploring?
   * **Options:** A) That dreams predict the future, B) Illusion and reality — from the conjured storm to the vanishing masque, the play makes us question how solid reality itself is, C) That Prospero is asleep and dreaming the whole play, D) That only magicians experience illusion
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line dissolves the boundary between the real and the illusory: if life itself is dream-stuff, then Prospero's enchantments and the "real" world stand on the same fragile ground. Illusion versus reality runs through the whole play.
   * **Why A:** It is about the dream-like fragility of reality, not prophecy or foretelling.
   * **Why C:** Prospero is awake and in command; the line is a meditation on reality's insubstantiality, not a literal dream-frame.
   * **Why D:** The illusion touches everyone — audience included — not only the magician; that universality is the point.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In The Tempest, Prospero's near-total power over the island is finally shown as something that must be given up rather than held forever.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The play weighs power against restraint: Prospero's command is real but precarious, and his greatness lies in relinquishing it — breaking his staff, drowning his book, freeing Ariel. Power over others is a thing to lay down.
   * **WhyWrong:** The movement of the play is towards surrendering control, not clinging to it — Prospero's renunciation of his magic is the very idea the ending affirms.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** The Tempest is a late romance, or tragicomedy. Which feeling, above all, is it built to leave us with by the close?
   * **Options:** A) Tragic pity and fear at a great figure's ruin, B) Wonder, and the warm, relieved delight of reconciliation — as danger and betrayal dissolve into forgiveness, reunion and restored order, C) Disgust at a villain who escapes justice, D) Boredom, since nothing serious is at stake
   * **Correct:** B
   * **Feedback:** ✓ Correct. A romance moves through threatened loss to harmony; the play is designed to make us feel wonder at its enchantments and a moving, relieved gladness as enemies are pardoned and the young lovers united — the pleasure of disorder resolved.
   * **Why A:** Pity and fear belong to tragedy; here no one is destroyed and the ending turns to mercy and reunion, so the tragic feeling is the wrong genre-emotion.
   * **Why C:** No villain escapes justice — the wrongdoers are confronted and then forgiven, which stirs relief and reconciliation, not disgust.
   * **Why D:** Real things are at stake — freedom, power, forgiveness — but they resolve into harmony; the feeling is wonder and relief, not indifference.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *wonder* rather than horror at the storm and Prospero's magic?
   * **Options:** A) Because the effects are frightening and meant to terrify us, B) Because the danger is enchanted and harmless — no one drowns, and loss is transformed into something "rich and strange", so the magic amazes rather than appals, C) Because we are afraid Prospero will drown everyone, D) We feel no wonder at all, only dread
   * **Correct:** B
   * **Feedback:** ✓ Correct. The romance turns threat into marvel: the shipwreck harms no one, and Ariel's song makes even an imagined drowning "rich and strange". The magic is designed to fill us with wonder, not the dread of a gothic tale.
   * **Why A:** The enchantments amaze rather than terrify — the mode is wonder, and the terror never lands because no real harm follows.
   * **Why C:** We soon learn everyone is safe; the wonder comes precisely because the danger is illusory.
   * **Why D:** Dread belongs to a gothic or tragic register; The Tempest's magic is marvellous and, ultimately, benevolent.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** At the play's close — enemies forgiven, lovers united, Prospero bound for home — why do we feel warmth and relief rather than grief?
   * **Options:** A) Because a hero has died a noble death, B) Because threatened disorder has resolved into forgiveness, reconciliation and freedom — the deep satisfaction of a broken world made whole, touched with a wistful poignancy at Prospero's farewell to his art, C) Because a villain has finally been punished and destroyed, D) Because the play has taught us to feel nothing
   * **Correct:** B
   * **Feedback:** ✓ Correct. Romance is built to end in harmony: the pardon of enemies and the union of Ferdinand and Miranda give the relieved, warm gladness of disorder resolved — with a gentle ache as Prospero lays down his magic and says goodbye.
   * **Why A:** No hero dies; the feeling comes from reconciliation and homecoming, not a noble death.
   * **Why C:** The wrongdoers are pardoned, not destroyed — the warmth flows from mercy, not from punishment.
   * **Why D:** The ending is designed to move us — to relief, wonder and tenderness — not to leave us cold.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** As a tragicomic romance, The Tempest is designed to move us to wonder and the relieved delight of forgiveness and reunion — not to tragic despair.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — wonder at the enchantment and a warm, relieved gladness as enemies are pardoned and lovers joined — is the emotional effect a romance is built to produce as harmony is restored.
   * **WhyWrong:** The intended effect is wonder and reconciliation, not tragic pity and fear; the play resolves its dangers into mercy and reunion rather than ruin.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about how we should respond to those who wrong us?
   * **Options:** A) That betrayal should always be repaid with revenge, B) That forgiveness is the "rarer", nobler action — mercy chosen from a position of power heals a broken world where vengeance would only prolong its wounds, C) That the wronged can never find peace, D) That power should be seized and never surrendered
   * **Correct:** B
   * **Feedback:** ✓ Correct. Prospero could punish, yet he pardons — and reconciliation, not revenge, restores order and sends everyone home. The enduring "so what" is that mercy is the greater and more human response to wrong.
   * **Why A:** The play sets revenge aside deliberately; its whole movement argues against repaying betrayal in kind.
   * **Why C:** Prospero *does* find peace — through forgiveness and homecoming, not through nursing his grievance.
   * **Why D:** The message is the opposite — Prospero's greatness is in *surrendering* his power, breaking his staff and drowning his book.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** By having Prospero renounce his magic and free Ariel, what enduring idea does the play affirm about power over others?
   * **Options:** A) That such power should be held onto at all costs, B) That mastery over others is precarious and must finally be relinquished — true freedom, for master and servant alike, lies in letting it go, C) That only the powerful can ever be happy, D) That power, once gained, can never be given up
   * **Correct:** B
   * **Feedback:** ✓ Correct. Prospero lays down the art that made him master of the island, and in doing so frees both Ariel and himself. The play affirms that power over others is something to be surrendered, not hoarded.
   * **Why A:** The ending dramatises the opposite — the nobility of *releasing* power, not clinging to it.
   * **Why C:** Prospero finds contentment in giving power up and going home, not in keeping it.
   * **Why D:** The whole close proves power *can* be surrendered — Prospero freely does so.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that forgiveness, not revenge, is the truly noble and human response to being wronged.
   * **Answer:** True
   * **Feedback:** ✓ Correct. With his enemies at his mercy, Prospero chooses to pardon them — and it is that choice, "virtue" over "vengeance", the play holds up as the greater and more human path.
   * **WhyWrong:** The play insists on mercy over vengeance: Prospero's decision to forgive, when he could easily punish, is exactly the enduring moral it affirms.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Often read as Shakespeare's farewell to the stage, the play ultimately affirms which idea about human life and power?
   * **Options:** A) That we should cling to control and never let anything go, B) That reality is fragile and dream-like, and wisdom lies in relinquishing power gracefully, forgiving what is past, and accepting an ending, C) That magic is the highest form of human achievement, D) That revenge finally brings lasting peace
   * **Correct:** B
   * **Feedback:** ✓ Correct. "We are such stuff as dreams are made on" and Prospero's laying-down of his art together affirm a wise acceptance — that power, and life itself, are things to be held lightly and finally released with grace.
   * **Why A:** The play's close is all about letting go — of magic, of grievance, of the island — not clinging on.
   * **Why C:** Prospero drowns his book; the play values the wise surrender of magic over its mastery.
   * **Why D:** Peace comes through forgiveness and homecoming, not revenge — which the play deliberately renounces.
