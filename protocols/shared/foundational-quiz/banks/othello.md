# Foundational Quiz Bank — Othello

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Othello is a **tragedy** → the `effects` aspect tests the audience's **pity and fear**, not the
naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`othello.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Othello

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Othello *changes* across the play — and what drives the change?
   * **Options:** A) He is a jealous, violent man from the first scene and never really changes, B) He begins a dignified, self-possessed general and becomes a wild, murderous husband — driven by his own choice to trust Iago's lies over Desdemona, C) He stays calm and noble throughout and is simply the victim of bad luck, D) He is controlled by Iago's power and has no say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: the composed commander who "keeps his sword" falls to a man who smothers his wife — and the engine of the fall is his own decision to believe Iago rather than trust Desdemona.
   * **Why A:** He is dignified and admired at the start; the drama lies in his transformation, not in fixed jealousy.
   * **Why C:** He is not merely unlucky — he chooses to believe the lie; the fall is self-caused, which is what makes it tragic.
   * **Why D:** Iago only tempts and deceives; removing Othello's agency turns a tragic hero into a puppet and misses why the change is his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Othello a *tragic hero* rather than simply a violent villain?
   * **Options:** A) He is wholly evil and cruel from the very beginning, B) He is neither wholly good nor wholly evil — a great and loving man brought down by his own fatal weakness for jealousy, so his fall moves us, C) He is completely innocent and does nothing wrong, D) He escapes all consequences and lives on happily
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic hero is an in-between figure: real nobility and love undone by a fatal error (hamartia). That middle position is exactly why his ruin arouses pity, not mere disgust.
   * **Why A:** If he were wholly evil his fall would satisfy rather than move us — the tragedy needs his early nobility and love.
   * **Why C:** He kills the innocent Desdemona; his error is his own and is essential to the tragedy.
   * **Why D:** He takes his own life at the close — a tragic hero falls; he does not live on happily.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Othello's evolution from beginning to end?
   * **Options:** A) A cowardly outcast at the start → a beloved duke at the end, B) A trusted, eloquent general whose word commands Venice → a self-deceived husband who murders his wife and then himself, C) A jealous schemer at the start → a forgiving friend at the end, D) A common soldier at the start → the ruler of Cyprus at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from honoured command and calm eloquence to jealous frenzy and self-slaughter — the same man, hollowed out by his own choice to believe Iago. That arc IS the tragedy.
   * **Why A:** He starts honoured, not an outcast, and ends in ruin, not made a duke — this reverses his actual arc.
   * **Why C:** He begins trusting and open, not a schemer; the schemer is Iago, and Othello ends in death, not forgiveness.
   * **Why D:** He is already Venice's leading general at the opening, and he ends dead, not ruling.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Othello's downfall is driven above all by his own choice to believe Iago — Iago plants the suspicion, but the decision to trust the lie over Desdemona is Othello's.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Iago pours in the poison, but Othello weighs it and chooses to believe; his agency is what turns manipulation into tragedy and keeps the fall *his*.
   * **WhyWrong:** Iago never forces his hand — he only insinuates. Treating Othello as a helpless puppet removes the choice that makes him a tragic hero rather than a mere victim.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Iago's failure to be promoted *lead to* Othello's ruin? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen in order, B) Passed over for lieutenant, Iago vows "I hate the Moor" and turns his wounded pride into a plot — so his resentment becomes the engine that destroys Othello, C) Othello promotes Iago instead, so Iago has no reason to act, D) Iago acts at random because he has gone mad
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the lost promotion breeds the hatred, and that hatred drives the scheme that ruins Othello. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** Othello promotes Cassio, not Iago — the passing-over is precisely the wound that lights Iago's resentment.
   * **Why D:** Iago's scheming is coldly calculated, not random madness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Othello's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) Iago's resentment breeds his plot → he plants suspicion of Desdemona → the handkerchief gives false "proof" → Othello's jealousy hardens into certainty → he murders her and, learning the truth, kills himself, C) Iago casts a spell that forces each step, so nothing is Othello's doing, D) Fate alone decides everything, and Othello's choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in Iago's resentment and Othello's choice to believe him. That is the tragic arc: temptation → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the logical, causal outworking of the plot and his own choice.
   * **Why C:** There is no spell; Iago deceives but Othello decides — making Iago the sole cause erases the causation that is Othello's.
   * **Why D:** If choice made no difference it would not be a tragedy; the whole arc turns on Othello's decision to believe the lie.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the handkerchief become the turning point that makes Othello's catastrophe unavoidable?
   * **Options:** A) It is a valuable object that is sold for a large sum, B) Once Iago plants it on Cassio, Othello takes it as "ocular proof" of betrayal — the suspicion becomes fixed certainty, and from there murder follows, C) It is used to signal the Ottoman fleet and start a war, D) It cures Othello of his jealousy and delays the ending
   * **Correct:** B
   * **Feedback:** ✓ Correct. The planted handkerchief is the irreversible hinge: once Othello reads it as proof, doubt becomes deadly conviction, and every later disaster follows from it. That is the tragic turning point (peripeteia).
   * **Why A:** Its power lies in what it seems to *prove*, not in money — reading it as a mere valuable misses its causal role.
   * **Why C:** It is a private love-token twisted into false evidence, not a military signal.
   * **Why D:** It hardens his jealousy into certainty; it does not cure or delay it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Othello the murder of Desdemona follows by cause-and-effect from Iago's planted "proof" and Othello's choice to believe it — it is not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: each event is *because of* the last, all rooted in Iago's deception and Othello's belief. That causal spine is what separates tragedy from a list of happenings.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Iago warns of "the green-eyed monster which doth mock the meat it feeds on". What does this reveal about the play's view of jealousy?
   * **Options:** A) That jealousy is a harmless, passing feeling, B) That jealousy is a devouring force that torments and consumes the very person who suffers it, C) That only Iago is capable of jealousy, D) That jealousy protects a marriage from harm
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of a monster feeding on its own host is the play's whole argument about jealousy: it destroys the mind it inhabits, hollowing out the noble Othello from within.
   * **Why A:** Jealousy here is ruinous, not harmless — it drives Othello to murder and suicide.
   * **Why C:** The point is that jealousy can consume *anyone*, above all the trusting Othello, not Iago alone.
   * **Why D:** The play shows the opposite — jealousy destroys the marriage rather than guarding it.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Iago declares "I am not what I am". Which controlling idea does this most clearly announce?
   * **Options:** A) That appearances deceive — "honest Iago" is a mask, and seeming and being are dangerously far apart, B) That Iago is unsure of his own name, C) That the weather on Cyprus is important to the plot, D) That fair-minded people always prosper
   * **Correct:** A
   * **Feedback:** ✓ Correct. Iago's paradox confesses that his outward "honesty" is a performance, announcing a world of deceptive surfaces where trust is misplaced — the theme that ruins Othello, who cannot see the villain behind the loyal face.
   * **Why B:** The line is a confession of deceit, not confusion about his identity.
   * **Why C:** It is about moral appearance and reality, not literal weather.
   * **Why D:** The play shows the reverse — for much of it the deceiver prospers and the honest suffer.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Cassio cries "Reputation, reputation, reputation! O, I have lost my reputation!" Which idea does the play most explore through moments like this?
   * **Options:** A) That a good name and honour govern the characters' whole sense of worth — and that its loss feels like the loss of the self, B) That Cassio simply drinks too much, C) That reputation matters only to soldiers, D) That names should be written down carefully
   * **Correct:** A
   * **Feedback:** ✓ Correct. Cassio's anguish shows how a good name governs identity in this world; the same obsession with honour is what Iago exploits, making the fear of shame a weapon that drives the tragedy.
   * **Why B:** The drunkenness is the occasion; the *theme* is the value the play places on reputation.
   * **Why C:** Reputation weighs on everyone — Othello, Desdemona, Iago — not soldiers alone.
   * **Why D:** The line is about honour and worth, not the literal recording of names.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Othello, Iago exploits Othello's status as an outsider — a Moor in white Venice — to make him doubt whether Desdemona could truly love him.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The theme of the outsider is central: Iago turns Othello's sense of not belonging into self-doubt, whispering that Desdemona's love is unnatural and cannot last — poison aimed straight at his insecurity.
   * **WhyWrong:** Othello's outsider status is exactly what Iago weaponises; race and belonging are woven through the tragedy, not incidental to it.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Othello is a tragedy. Why do we feel *pity* for Othello by the end, despite the murder he has committed?
   * **Options:** A) Because he is entirely innocent and did nothing wrong, B) Because a great and loving man has been destroyed by his own error — his ruin, and the death of the wife he loved, feel like a terrible waste, C) Because Iago forced him and he could not help it, D) Because he escapes punishment and we are glad for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy makes us pity a *self-caused* fall: Othello's nobility and love are real, so watching him destroy Desdemona and himself moves us. Pity comes from ruin brought on by his own hand, not from innocence.
   * **Why A:** He is guilty of Desdemona's death — and it is precisely a *flawed* great man, not a blameless one, whose fall earns tragic pity.
   * **Why C:** Blaming Iago removes Othello's choice; we pity him *because* the ruin is his own doing, wasting real greatness and love.
   * **Why D:** He does not escape — he kills himself; and the feeling at the close is pity and fear, not relief for him.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A tragedy such as Othello is designed to make the audience feel two emotions above all others. Which two?
   * **Options:** A) Amusement and satisfaction, B) Pity and fear, C) Confusion and boredom, D) Admiration for Iago's cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Since Aristotle, tragedy has aimed to arouse *pity* (for the hero's ruin) and *fear* (that one like ourselves could fall the same way) — the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom are the marks of a *failed* tragedy, not its aim.
   * **Why D:** We may note Iago's cunning, but the intended response to Othello's fall is pity and fear, not admiration for the villain.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *fear* as we watch Othello's fall?
   * **Options:** A) Because we are frightened of a storm or a physical monster on Cyprus, B) Because Othello is a noble, capable man "like us" — so his ruin warns that jealousy and misplaced trust could undo anyone, C) Because we are afraid Iago will be caught and punished too soon, D) We feel no fear at all, only amusement
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragic fear is *fear for ourselves*: because Othello is recognisably human and admirable, not a monster, his fall feels like a warning that the same weakness could destroy any of us.
   * **Why A:** The "green-eyed monster" is jealousy within, not a literal beast; the fear is moral and human, not fright at a storm.
   * **Why C:** The fear is for how Othello falls and what it reveals, not for Iago's timing.
   * **Why D:** Amusement is the response to comedy; Othello's suffering is built to disturb, not to amuse.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both pity and fear — pity for the noble love Othello has destroyed, and fear that jealousy and deceit could ruin anyone.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for the self-destroyed hero and fear for "one like us" — is the emotional effect a tragedy is built to produce as the truth is finally, too-late, revealed.
   * **WhyWrong:** The intended effect is pity *and* fear together, not triumph or amusement; the ending is meant to leave us moved, not satisfied at a downfall.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about jealousy?
   * **Options:** A) That jealousy is a healthy sign of true love, B) That jealousy, once admitted, is a devouring force that destroys reason, love and life — corrupting even the noblest mind from within, C) That jealousy affects only weak or foolish people, D) That jealousy has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Othello's jealousy consumes his judgement, his marriage and finally himself — the play's enduring "so what": that this passion, once entertained, poisons and destroys the very person who feels it.
   * **Why A:** The play dramatises the opposite — jealousy destroys love rather than proving it.
   * **Why C:** It is precisely the noble, capable Othello who is undone; the warning is that jealousy can ruin *anyone*.
   * **Why D:** The consequences are total — murder and suicide; the message insists jealousy is ruinous.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play suggest about trust, honesty and deception?
   * **Options:** A) That we should always trust whoever seems most honest, B) That evil can hide behind a mask of loyalty, and that misplaced trust in a deceiver can destroy even the good, C) That everyone in Venice is secretly wicked, D) That honesty is never rewarded
   * **Correct:** B
   * **Feedback:** ✓ Correct. "Honest Iago" is the play's bitter irony: appearances deceive, and Othello's tragedy is that he trusts the villain and doubts the faithful. The message warns how far seeming can betray being.
   * **Why A:** The play warns against exactly this — Othello trusts the "honest" Iago and it destroys him.
   * **Why C:** Desdemona, Cassio and Emilia are loyal and good; the evil is concentrated in Iago, not universal.
   * **Why D:** Emilia's honesty finally exposes the truth — at great cost, but the play still values it.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that misjudging others — trusting the deceiver and doubting the faithful — can bring irreversible tragedy.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Othello believes the lying Iago and kills the loving Desdemona; the play affirms that a failure to see truth behind appearance can destroy everything of worth, beyond any repair.
   * **WhyWrong:** The tragedy turns on exactly this misjudgement — trusting the false and doubting the true — which the play holds up as a devastating, enduring warning.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human nature does Othello's downfall affirm?
   * **Options:** A) That great and admirable people are immune to weakness, B) That even the noblest of us carry a vulnerability — here, insecurity and jealousy — that, once exploited, can bring total ruin, C) That outsiders can never be truly loved, D) That reason always defeats emotion in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Othello's greatness does not protect him; his hidden insecurity is the crack Iago widens into catastrophe. The play's "so what" is that no one is beyond the reach of a fatal weakness.
   * **Why A:** The play shows the reverse — even the great Othello is undone by his own vulnerability.
   * **Why C:** Desdemona genuinely loves Othello; the tragedy is that he cannot believe it, not that outsiders cannot be loved.
   * **Why D:** Here emotion overwhelms reason; the ruin comes precisely because jealousy defeats Othello's judgement.
