# Foundational Quiz Bank — Henry V

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *Henry V* is a **history play** (heroic-national mode); it is not in the standard's genre table,
so the `effects` aspect is authored to its named genre-emotion: **stirring admiration and national
pride** at heroic leadership and against-the-odds triumph — shadowed by a **sober unease at the cost of
war**, so we are moved, not merely triumphant. NOT the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`henry_v.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Henry V

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Henry *changes* across the play — and what drives the change?
   * **Options:** A) He is a solemn, unbending king from the first scene and never really changes, B) The riotous Prince Hal of the earlier plays has grown into a disciplined, self-mastering warrior-king — driven by his own choice to reform and shoulder the burden of rule, C) He stays a wild, idle youth throughout and simply gets lucky at Agincourt, D) He is made great by fortune and his advisers, with little of his own doing
   * **Correct:** B
   * **Feedback:** ✓ Correct. The drama is the *change*: the wayward Prince Hal remakes himself into a serious, commanding king — and the engine is his own chosen self-discipline and his readiness to bear the weight of kingship, not luck.
   * **Why A:** His younger self was famously wild; the play shows the king he has *become*, so "always solemn" erases the transformation that defines him.
   * **Why C:** He is no longer the idle youth and does not merely stumble into victory — his triumph flows from mastered discipline and leadership.
   * **Why D:** Crediting fortune and advisers removes his agency; the reform, and so the greatness, is his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Henry an *exemplary king* rather than simply a lucky conqueror?
   * **Options:** A) He wins purely by chance, with no virtue of his own, B) He earns his authority by mastering himself — uniting piety, courage and shared brotherhood, and choosing to carry his men's lives on his conscience, C) He is a foreign invader with no real claim, D) He inherits greatness at birth and need not prove anything
   * **Correct:** B
   * **Feedback:** ✓ Correct. Henry is exemplary because his kingship is *earned*: self-command, faith and fellowship with his men, and the deliberate acceptance of responsibility for their lives — greatness proven, not stumbled upon.
   * **Why A:** If victory were mere chance his kingship would move no one; the play insists his triumph flows from chosen virtue and leadership.
   * **Why C:** Henry presses a claim the Church affirms and leads his own rightful people; "foreign invader" mistakes who he is.
   * **Why D:** Birth gives him the crown, but the play shows greatness must be *proven* — the reformed prince coming into his own.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Henry's evolution from beginning to end?
   * **Options:** A) A wise elder statesman at the start → a reckless youth at the end, B) The riotous "Prince Hal" of the *Henry IV* plays → a disciplined warrior-king who leads in person and calls his men "we happy few, we band of brothers", C) A foreign prince at the start → a defeated prisoner at the end, D) A cowardly deserter at the start → a beloved poet at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from wayward prince to self-mastered king — the same man, remade by his own choices into a leader who binds an army into brotherhood. That reform IS his arc.
   * **Why A:** This reverses his actual arc — he grows *from* wildness *into* discipline, not the other way.
   * **Why C:** He is the rightful English king and the victor, not a foreign prince taken prisoner.
   * **Why D:** He is neither a deserter nor a poet — he is a soldier-king who leads the charge and wins.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Henry's growth into a great king is the fruit of his own deliberate reform — casting off his wild youth and choosing the discipline of rule — not something merely handed to him by birth.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The crown is inherited, but the *kingship* is earned: Henry chooses self-mastery and shoulders the burden of his men's lives, and that chosen reform is what makes his greatness his own.
   * **WhyWrong:** Reducing his greatness to birthright removes the choice that defines him — the reformed prince who *makes* himself worthy of the crown he already wears.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the Dauphin's mocking gift of tennis balls *lead to* war? (What is the causal link?)
   * **Options:** A) The gift and the war are unconnected events that simply happen in order, B) The insult dismisses Henry as a frivolous youth; he converts the mockery into a vow, so his already-affirmed claim to France hardens into invasion, C) The tennis balls are a peace offering that Henry accepts, D) The Dauphin's gift magically forces Henry to fight against his will
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the taunt stiffens Henry's resolve, turning a legal claim into an armed campaign. That causal necessity is what makes the plot an arc, not a list of events.
   * **Why A:** In a well-made plot events follow by cause, not mere sequence — reading the insult and the war as unconnected misses the chain.
   * **Why C:** The tennis balls are a contemptuous taunt, not a gesture of peace; they push the two nations towards war.
   * **Why D:** Nothing forces Henry — he *chooses* to answer the insult with war; his resolve is his own.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Henry's campaign — not just the order of events?
   * **Options:** A) A series of unrelated episodes that happen to occur one after another, B) His claim to France is affirmed → the Dauphin's insult hardens his resolve → he invades and takes Harfleur → outnumbered at Agincourt, his leadership rallies the men → they win → the victory secures peace and marriage, C) Fortune alone decides each stage, and Henry's choices change nothing, D) The Chorus makes each event happen by narrating it
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all set in motion by his claim and his answer to the insult. That is the arc: cause → escalating consequence → resolution.
   * **Why A:** The campaign is not random episodes — each step is the logical outworking of the last.
   * **Why C:** If choice changed nothing there would be no drama; the arc turns on Henry's decisions and leadership.
   * **Why D:** The Chorus *frames* and narrates the action but does not cause it; the causation lies in Henry's choices and their consequences.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which is the decisive turning point after which peace and the union of the crowns become possible?
   * **Options:** A) The Dauphin's gift of tennis balls, B) The English victory at Agincourt, won against overwhelming odds, C) The Chorus's opening apology for the "wooden O", D) Henry's wooing of Princess Katherine
   * **Correct:** B
   * **Feedback:** ✓ Correct. Agincourt is the hinge: the against-the-odds victory forces France to terms, and only *because* of it do the treaty and royal marriage follow. That is the turning point of the arc.
   * **Why A:** The tennis balls only *provoke* the war — nothing is yet decided; they set the chain going, not its climax.
   * **Why C:** The Chorus frames the story; it is a narrative device, not an event that turns the plot.
   * **Why D:** The wooing is a *consequence* of the victory, part of the resolution — not the turning point that made peace possible.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In *Henry V* the events follow by cause and effect — the claim and the insult drive the invasion, Henry's leadership wins Agincourt, and the victory secures the peace — not a loose string of unconnected episodes.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: each event is *because of* the last, from provocation to victory to treaty. That causal spine is what gives the history its shape.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that turns a chronicle into a shaped dramatic arc.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Henry binds his outnumbered soldiers as "we happy few, we band of brothers". What does this reveal about the play's view of unity and leadership?
   * **Options:** A) That soldiers only fight for money, B) That true leadership forges a nation into fellowship — shared struggle levels rank, so even a common soldier is made kin to the king, C) That the men are already stronger than the French, D) That unity matters only to the nobility
   * **Correct:** B
   * **Feedback:** ✓ Correct. Making every soldier a "brother" turns a frightened, outnumbered army into a fellowship in which rank dissolves — the play's argument that leadership binds a people through shared honour, not force.
   * **Why A:** Henry offers not wealth but honour and brotherhood; the bond he forges is not bought.
   * **Why C:** The English are heavily outnumbered — the theme's power lies in turning weakness into shared glory.
   * **Why D:** The "band of brothers" deliberately *crosses* rank, making the common soldier kin to his king.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which idea about war does the play most explore, and how does it *work*?
   * **Options:** A) That war is pure, uncomplicated glory, B) That war is both stirring and costly — patriotic courage set beside its brutality and the human suffering it brings, so glory and grimness are held together, C) That war is a minor background to a love story, D) That Henry regrets the war and abandons it
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play celebrates the courage of Agincourt yet never hides war's harshness — the fierce threats at Harfleur, the dead on the field — so its vision of war is glory *and* cost at once.
   * **Why A:** Alongside the triumph the play shows menace and death, so its view of war is not simply glorious.
   * **Why C:** War is the play's central subject; the wooing of Katherine comes only after the fighting is won.
   * **Why D:** Henry pursues the campaign to victory rather than abandoning it in regret.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** On the night before Agincourt, disguised, Henry debates a king's responsibility for the lives of his men. Which controlling idea does this explore?
   * **Options:** A) That a king bears no responsibility for his soldiers, B) That true kingship is a heavy burden — the good king carries the weight of his people's lives on his conscience, C) That soldiers should never question their king, D) That Henry doubts his claim and wishes to give up the throne
   * **Correct:** B
   * **Feedback:** ✓ Correct. Moving unrecognised among his men, Henry weighs what a king owes those he leads — the play's idea that authority is inseparable from the burden of responsibility.
   * **Why A:** The whole scene turns on Henry *feeling* the weight of that responsibility, not escaping it.
   * **Why C:** The soldiers openly voice their doubts, and Henry engages them — the theme is the king's duty, not blind obedience.
   * **Why D:** He is troubled by the cost of leadership, not by his claim; he does not seek to abdicate.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The play holds the glory and the cost of war together — celebrating the courage of Agincourt while never hiding war's brutality and the weight of the dead.
   * **Answer:** True
   * **Feedback:** ✓ Correct. From the savage threats at Harfleur to the reckoning of the slain, the play sets triumph beside suffering, so its patriotism is clear-eyed rather than blind.
   * **WhyWrong:** Reading the play as simple, untroubled glory misses its double vision — Shakespeare stages both the stirring courage and the grim human cost of war.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *Henry V* is a history play built to stir. Why do we feel roused *admiration and pride* during the St Crispin's Day speech?
   * **Options:** A) Because we are amused by Henry's clever jokes, B) Because a leader lifts an outnumbered, frightened army through shared honour — and we are stirred to feel we too could belong to that "band of brothers", C) Because the effect is simply the rhetorical repetition Shakespeare uses, D) Because we feel bored and detached from the whole scene
   * **Correct:** B
   * **Feedback:** ✓ Correct. The speech makes us feel the swell of heroic pride and fellowship — we are drawn into the brotherhood it forges, sharing the soldiers' kindled courage. That stirred admiration is the designed emotional effect.
   * **Why A:** The scene rouses pride and courage, not amusement — laughter belongs to comedy, not this heroic call to arms.
   * **Why C:** "Repetition" names a *device*, not a feeling; the effect is the pride and fellowship the speech makes us feel.
   * **Why D:** Boredom is the mark of a *failed* rousing speech; this one is built to kindle us, and does.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A history play like *Henry V* is designed to make the audience feel, above all, which response?
   * **Options:** A) Amusement and light relief, B) Stirring admiration and national pride at heroic leadership and against-the-odds triumph — shadowed by a sober sense of war's cost, C) Dread and horror at supernatural evil, D) Confusion and boredom
   * **Correct:** B
   * **Feedback:** ✓ Correct. The heroic-national mode is built to *rouse* — pride and admiration at courageous leadership and improbable victory — while the play's honesty about war's cost keeps that pride sober rather than hollow. That is its emotional purpose.
   * **Why A:** Amusement belongs to comedy; a history play that merely entertained would miss its stirring aim.
   * **Why C:** Dread and horror belong to gothic; here the dominant feeling is roused pride, not supernatural terror.
   * **Why D:** Confusion and boredom mark a *failed* history play, not its intended effect.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why, even amid the triumph, are we left feeling *sobered* rather than simply exultant?
   * **Options:** A) Because the play shows war's brutality and the cost in lives, so our pride is shadowed by the human price of victory, B) Because we are frightened the English will lose, C) Because the effect is the Chorus, a narrating device, D) We feel nothing but pure, untroubled celebration
   * **Correct:** A
   * **Feedback:** ✓ Correct. Shakespeare sets the glory beside the grief — the threats at Harfleur, the reckoning of the dead — so triumph never becomes hollow cheering. We feel pride *and* its weight, which is the play's fuller emotional effect.
   * **Why B:** We know the English win; the sobering feeling is about the *cost* of that victory, not fear of defeat.
   * **Why C:** The Chorus is a *device*, not a feeling; the effect is the sober unease the play's honesty about war creates.
   * **Why D:** The play deliberately complicates its triumph with the cost of war — pure untroubled celebration misreads that double vision.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** A history play like *Henry V* is built above all to stir admiration and national pride at heroic leadership — though Shakespeare shadows that pride with the sober cost of war, so we are moved, not merely triumphant.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — roused pride at courageous leadership *and* a sober sense of what victory costs — is the emotional effect the heroic-national mode is built to produce.
   * **WhyWrong:** The intended effect is stirred admiration and pride, tempered by war's cost — not amusement, dread, or hollow triumphalism.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about kingship and leadership?
   * **Options:** A) That the crown alone makes a great king, B) That true kingship is earned, not merely inherited — proven through self-mastery, courage and the burden of responsibility for one's people, C) That a king should avoid war at all costs, D) That leadership is a matter of luck
   * **Correct:** B
   * **Feedback:** ✓ Correct. Henry's reform and his readiness to shoulder his men's lives affirm the play's enduring idea: greatness in a ruler is *made*, through chosen virtue and responsibility, not handed down by birth.
   * **Why A:** The play insists the crown must be *deserved* — Henry proves himself worthy of what he inherits.
   * **Why C:** Henry leads a just war to victory; the message concerns *how* he leads, not the avoidance of war.
   * **Why D:** His success flows from mastered virtue and leadership, not chance — the opposite of luck.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about *nationhood* does the play affirm?
   * **Options:** A) That a nation's strength lies only in numbers, B) That a people's true strength is fellowship that crosses rank — a "band of brothers" forged in shared danger and common cause, C) That ordinary soldiers do not matter to a country's fate, D) That unity is impossible in wartime
   * **Correct:** B
   * **Feedback:** ✓ Correct. The outnumbered English win because Henry binds them into one fellowship; the play's message is that nationhood is forged in shared struggle, where even the humblest soldier is made kin to the king.
   * **Why A:** The English are heavily outnumbered — the play's point is that *fellowship*, not numbers, wins the day.
   * **Why C:** The "band of brothers" deliberately honours the common soldier as kin to his king.
   * **Why D:** The play shows unity being *achieved* in war — Henry forges it precisely under threat.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that true kingship is proven, not merely inherited — greatness earned through self-mastery, courage and the weight of responsibility a leader chooses to bear.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Henry's whole arc — the reformed prince who masters himself and carries his men's lives on his conscience — affirms that a ruler must *earn* the greatness the crown alone cannot confer.
   * **WhyWrong:** The play insists kingship must be deserved: Henry proves himself worthy through chosen virtue, so "the crown alone makes the king" misses its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play finally suggest about the *glory* of war?
   * **Options:** A) That heroic triumph is pure and comes without cost, B) That courageous victory is genuinely glorious, yet inseparable from a real human cost — so glory and grief go together, C) That war is always shameful and never worth fighting, D) That victory belongs to whoever has the larger army
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play affirms the glory of Agincourt's courage while insisting on its price — the dead, the suffering — so its patriotism is clear-eyed: glory earned is glory that costs.
   * **Why A:** Shakespeare shadows the triumph with its cost; untroubled, costless glory misreads the play's honesty.
   * **Why C:** The play *does* celebrate heroic courage — it is not simple anti-war condemnation, but glory held together with its cost.
   * **Why D:** The outnumbered English win through leadership and fellowship, not superior numbers — the reverse of the claim.
