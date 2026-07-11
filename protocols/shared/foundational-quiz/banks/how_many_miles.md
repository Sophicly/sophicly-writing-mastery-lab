# Foundational Quiz Bank — How Many Miles to Babylon?

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *How Many Miles to Babylon?* is a **tragedy** (an anti-war tragedy of a friendship destroyed by
class and war) → the `effects` aspect tests the reader's **pity and fear**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`how_many_miles.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: How Many Miles to Babylon?

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Alec *changes* across the novel — and what drives the change?
   * **Options:** A) He is independent and self-possessed from the first page and never really changes, B) He begins a lonely, emotionally starved boy dominated by his controlling mother, and becomes a young man who — in one decisive act of loyalty to Jerry — finally chooses for himself, C) He stays a passive, obedient son throughout and is simply unlucky in war, D) He is swept along by events and the army, with no real say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: a stifled, affection-starved boy grows, through friendship, into a man who at last acts on his own conscience — and the engine of that final act is his own choice, not chance.
   * **Why A:** He opens sheltered and controlled by his mother, not self-possessed; the drama lies in his transformation, not in fixed independence.
   * **Why C:** He does not stay merely passive — his final act of shooting Jerry is a deliberate choice; his fall is self-authored, which is what makes it tragic.
   * **Why D:** War and the army pressure him, but removing his agency turns a tragic figure into a puppet and misses that the last, fatal choice is his own.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Alec a *tragic* figure rather than simply an unlucky victim of circumstance?
   * **Options:** A) He is entirely blameless and merely swept away by events beyond his control, B) A young man of real feeling is destroyed by the very loyalty that is his finest quality — his ruin is a self-chosen act, which is why it moves us, C) He is cold and unfeeling, so his fate leaves us indifferent, D) He escapes the war unharmed and prospers
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic figure falls through his own decisive act, not mere bad luck: Alec *chooses* to shoot Jerry out of loyalty, and it is that self-caused ruin of a good young man that arouses pity rather than mere sadness.
   * **Why A:** If he were only a blameless leaf on the wind his fate would be pathos, not tragedy — the tragedy needs his own decisive choice.
   * **Why C:** His deep feeling for Jerry is exactly what makes the loss move us; indifference misreads the whole novel.
   * **Why D:** He is condemned to death at the close — a tragic figure falls; he does not escape and prosper.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Alec's evolution from beginning to end?
   * **Options:** A) A confident, worldly young man at the start → a broken coward at the end, B) A lonely, sheltered boy ruled by his mother and starved of affection → a man who, in a single act of loyalty to his friend, finally chooses for himself and faces death, C) A rebellious troublemaker at the start → an obedient soldier at the end, D) A hardened officer at the start → a carefree civilian at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a controlled, affection-starved boyhood to a final, freely chosen act of loyalty — the same young man, grown at last into moral autonomy at the cost of his life. That arc IS the tragedy.
   * **Why A:** He begins sheltered and controlled, not confident and worldly; this reverses his actual starting point.
   * **Why C:** His movement is toward self-determination, not toward mere obedience — his last act defies authority.
   * **Why D:** He begins a sheltered gentry boy, not a hardened officer, and ends condemned, not a carefree civilian.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Alec's downfall is driven above all by his own choice — the army condemns him, but the decision to shoot Jerry as an act of loyalty is his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The war and its discipline set the trap, but Alec weighs the moment and chooses loyalty over orders; that agency is what turns victimhood into tragedy and keeps the fall *his*.
   * **WhyWrong:** The army never forces his hand at the cell — he could have obeyed and commanded the firing squad. Treating him as a mere victim of circumstance removes the choice that makes him a tragic figure rather than an accident of war.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Jerry's desertion *lead to* Alec's own condemnation? (What is the causal link?)
   * **Options:** A) The two events are unconnected and simply happen in order, B) Jerry deserts to search for his father, is caught and sentenced to death by firing squad — and Alec, rather than let his friend die at strangers' hands, shoots him himself, an act of loyalty for which Alec is then condemned, C) The army randomly picks Alec to punish, D) Alec betrays Jerry to save himself
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: Jerry's desertion brings the death sentence, and Alec's loyalty turns that sentence into his own doom. This causal necessity is what makes the plot a tragic arc, not a list of wartime events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** Alec is not chosen at random — his condemnation flows directly from his own chosen act of mercy toward Jerry.
   * **Why D:** Alec does the opposite of betrayal: he sacrifices himself out of loyalty, and that loyalty is the cause of his ruin.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the tragedy — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the friends by bad luck, B) A forbidden cross-class friendship → both enlist → the army's harsh discipline re-imposes the officer–private divide → Jerry deserts to find his father and is sentenced to death → Alec chooses loyalty over orders and shoots him → Alec is condemned, C) The war alone decides everything, and the characters' choices make no difference, D) Alec's mother personally arranges each disaster
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all rooted in the forbidden friendship and Alec's final choice. That is the tragic arc: a bond the world forbids, escalating consequence, catastrophe.
   * **Why A:** The ruin is not random misfortune — it is the logical outworking of the friendship the world will not allow and the choice Alec makes.
   * **Why C:** If choice made no difference it would not be a tragedy; the arc turns on Alec's decision to be loyal.
   * **Why D:** His mother pressures him early, but she does not engineer the war, the desertion or the cell — the chain is causal, not her plot.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes Alec's catastrophe unavoidable — the point of no return?
   * **Options:** A) The boys' first secret meeting in the Irish countryside, B) Alec's decision to enter Jerry's cell and shoot him himself, C) Jerry's desertion across the lines, D) Alec's mother pressing him to enlist
   * **Correct:** B
   * **Feedback:** ✓ Correct. Shooting Jerry is the irreversible act: once done, Alec cannot go back, and his own condemnation follows from it. That is the tragic turning point.
   * **Why A:** The first meeting begins the friendship but fixes nothing; the tragedy is not yet inevitable.
   * **Why C:** Jerry's desertion is a *cause* that brings the death sentence, but Alec could still have obeyed — the point of no return is *his* choice, not Jerry's.
   * **Why D:** The mother's pressure sets events moving but leaves every later choice open; it is not the irreversible act.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novel the final disasters follow by cause-and-effect from the forbidden friendship and Alec's own choice — they are not just a string of unconnected wartime events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: the bond the world forbids leads to enlistment, discipline, desertion, and Alec's fatal act of loyalty — each *because of* the last. That causal spine is what makes it a tragedy rather than a war chronicle.
   * **WhyWrong:** Reading the events as unconnected ("war is just like that") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a record of happenings.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which controlling idea does the novel most explore, and how does it *work* through the story?
   * **Options:** A) The joys of military glory, B) A deep friendship tested and finally destroyed by the twin pressures of class division and war — the bond is real, but the world will not let it survive, C) The pleasures of wealth and landed comfort, D) A comic misunderstanding between two families
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's whole argument is that a genuine human bond is crushed between class prejudice and the machinery of war — the friendship works as the measure of everything those forces destroy.
   * **Why A:** The novel undercuts military glory entirely; it dramatises waste, not glory.
   * **Why C:** Wealth is the source of the *division*, not a pleasure the novel celebrates.
   * **Why D:** It is a tragedy of a destroyed friendship, not a comedy of misunderstanding.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** How does the theme of class division *work* across the novel?
   * **Options:** A) Class makes no real difference once the war begins, B) The gentry–working-class gulf that forbids the boys' friendship is reproduced in the army as the officer–private divide, so the same barrier follows and hardens even at the front, C) Only personal dislike, not class, keeps the friends apart, D) Class matters in Ireland but vanishes in France
   * **Correct:** B
   * **Feedback:** ✓ Correct. Class is not a backdrop but a controlling force: the barrier that divides Alec and Jerry at home re-forms as military rank, so the war deepens rather than dissolves the divide — the idea works by repetition across settings.
   * **Why A:** The divide persists in military form; it never disappears.
   * **Why C:** It is social class, not personal dislike, that separates them — they are close friends.
   * **Why D:** The divide follows them from Ireland to the front, re-cast as rank; it does not vanish.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** How does the novel present war, and how does that idea *work*?
   * **Options:** A) As a noble adventure that ennobles the young, B) As futile and dehumanising — it wastes young lives and subordinates friendship, mercy and conscience to a merciless discipline, C) As unimportant to the characters' lives, D) As a fair test that rewards the brave
   * **Correct:** B
   * **Feedback:** ✓ Correct. War in the novel works as an anti-heroic force: it strips away humanity, setting rigid discipline above compassion until loyalty itself becomes a capital crime.
   * **Why A:** The novel dismantles any idea of war as noble adventure.
   * **Why C:** War dominates and destroys the characters' lives; it is central, not incidental.
   * **Why D:** War here punishes loyalty and mercy rather than rewarding virtue — it is shown as unjust, not fair.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** A central idea of the novel is the clash between personal loyalty and the demands of duty and authority — the tension that drives its tragedy.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The novel sets Alec's loyalty to Jerry against the orders of military authority, and it is that irreconcilable conflict — loyalty on one side, duty on the other — that produces the catastrophe.
   * **WhyWrong:** The clash between loyalty and authority is exactly the novel's engine: Alec cannot honour his friend and obey his orders at once, and the tragedy grows from that impossible choice.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** This is a tragedy. Why do we feel *pity* for Alec by the end, despite the fact that he shoots Jerry?
   * **Options:** A) Because he is entirely innocent and did nothing at all, B) Because a young man of real feeling is destroyed by the very loyalty that is his finest quality — his ruin feels like a terrible waste, C) Because the army forced him and he had no choice, D) Because he escapes punishment and we are glad for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy makes us pity a *self-chosen* fall: Alec's loyalty is genuine and admirable, so watching it destroy him moves us. The pity comes from a good young man ruined by his own act of love, not from innocence.
   * **Why A:** He is not passive or innocent — he chooses to shoot Jerry; it is precisely a good young man's *chosen* act, not blamelessness, that earns tragic pity.
   * **Why C:** Blaming the army removes his choice; we pity him *because* the act is his own, an honourable loyalty that costs him everything.
   * **Why D:** He does not escape — he is condemned to death; and the feeling at the close is pity and fear, not relief for him.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A tragedy such as this is designed to make the reader feel two emotions above all others. Which two?
   * **Options:** A) Amusement and satisfaction, B) Pity and fear, C) Confusion and boredom, D) Admiration for the characters' cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy aims to arouse *pity* (for the young men's ruin) and *fear* (that the same forces of war and class could destroy any of us) — the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom are the marks of a *failed* tragedy, not its aim.
   * **Why D:** We may admire Alec's courage, but the intended response is pity and fear, not admiration for cleverness.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *fear* as we watch the friendship destroyed?
   * **Options:** A) Because we are frightened of the enemy's guns and shells, B) Because Alec and Jerry are ordinary young men "like us" — so their destruction warns that the same machinery of war and class could crush anyone, C) Because we are afraid the friends will win the war and rule, D) We feel no fear at all, only mild sadness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragic fear is *fear for ourselves*: because Alec and Jerry are recognisably human and unremarkable, their ruin feels like a warning that the same forces could destroy any of us.
   * **Why A:** The fear is moral and human, not fright at weaponry; the trenches horrify, but the deeper fear is for the young men's humanity, and our own.
   * **Why C:** There is no triumph to fear — the dread is of *how* they are destroyed and what it reveals, not that they will win.
   * **Why D:** The novel is built to disturb, not merely sadden; recognising the friends as "like us" is exactly what turns sadness into fear.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel both pity and fear — pity for the wasted lives and loyalty, and fear that war and class division could destroy anyone.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for a self-sacrificing young man and fear for "one like us" — is the emotional effect a tragedy is built to produce; the novel leaves us moved, not consoled.
   * **WhyWrong:** The intended effect is pity *and* fear together, not amusement or relief; the elegiac close is meant to leave us grieving and disturbed, not satisfied.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about war and class?
   * **Options:** A) That war is a glorious proving-ground for the young, B) That rigid class division and the brutal machinery of war destroy love, loyalty and the young who possess them — an indictment of both forces, C) That the class system is natural and right, D) That loyalty between friends counts for nothing
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel condemns both the class prejudice that forbids the friendship and the war that finally destroys it, mourning the human bonds and young lives that such systems waste — its enduring "so what".
   * **Why A:** The novel dramatises the opposite — war as waste and horror, not glory.
   * **Why C:** Class division is presented as cruel and destructive, not natural or just.
   * **Why D:** Loyalty is the novel's highest value — the tragedy is that the world destroys it, not that it is worthless.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about loyalty and authority does the novel affirm?
   * **Options:** A) That obedience to authority is always the highest good, B) That human love and loyalty are of greater worth than the rules of class and military authority — yet a world that enforces those rules destroys those who honour them, C) That rules should never be questioned, D) That friendship is a weakness to be overcome
   * **Correct:** B
   * **Feedback:** ✓ Correct. Alec's choice affirms that loyalty and love outweigh orders — but the tragedy is that the system punishes exactly that human worth, so the novel both exalts loyalty and grieves its destruction.
   * **Why A:** The novel sides with Alec's loyalty *against* blind obedience; obedience here is the cruelty, not the good.
   * **Why C:** The whole tragedy questions the rules of class and army rather than upholding them.
   * **Why D:** Friendship is the novel's measure of worth, not a weakness — its loss is the tragedy.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that war and rigid class division are forces that waste young lives and crush the human bonds between people.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The novel indicts both the class system and the war as destroyers of love, loyalty and youth — the young men are broken not by any fault of their own but by the systems that rule them.
   * **WhyWrong:** The novel's steady message is that these forces destroy what is most human; the friends are ruined by class and war, not by any failing of character.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The title echoes the old nursery rhyme "How many miles to Babylon?". What enduring idea does the ending, and that childlike refrain, affirm?
   * **Options:** A) That childhood games have no bearing on the story, B) That innocence, love and loyalty are the true measure of a life — and the elegiac, backward-looking frame mourns how war and class destroy those who keep faith with them, C) That the characters simply run out of time by chance, D) That authority and rank are what give a life meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The wistful nursery-rhyme refrain and Alec's backward-looking narration frame the novel as an elegy: it affirms the worth of innocence and loyalty precisely by grieving how the adult world of class and war destroys them.
   * **Why A:** The rhyme is load-bearing — its childlike note deepens the sense of lost innocence, and is not incidental.
   * **Why C:** The ruin is not chance but the outworking of class and war; the ending is caused, not accidental.
   * **Why D:** The novel affirms love and loyalty over rank; authority is the destroyer, not the source of meaning.
