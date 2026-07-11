# Foundational Quiz Bank — Julius Caesar

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *Julius Caesar* is a **tragedy** → the `effects` aspect tests the audience's **pity and fear**,
not the naming of techniques. Its tragic hero is **Brutus**, whose fatal error drives the arc.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`julius_caesar.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Julius Caesar

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Brutus *changes* across the play — and what drives the change?
   * **Options:** A) He is a scheming traitor from the first scene and never really changes, B) He begins an honoured, principled Roman loved even by Caesar and becomes the ruined leader of a doomed conspiracy — driven by his own choice to believe murder could save Rome, C) He stays untroubled and successful throughout and is simply unlucky at the end, D) He is controlled by Cassius and fate, and has no real say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: a man of the highest integrity is drawn to kill his friend for Rome, and that one fatal choice unmakes him. The engine of the fall is his own idealistic decision, not chance.
   * **Why A:** He is honoured and trusted at the start — even Cassius must *work* on him; the drama lies in his transformation, not fixed treachery.
   * **Why C:** He is not merely unlucky — he chooses to join and lead the murder; the fall is self-caused, which is what makes it tragic.
   * **Why D:** Cassius tempts and flatters, but Brutus deliberates alone and decides for himself; removing his agency turns a tragic hero into a puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Brutus a *tragic hero* rather than simply a traitor?
   * **Options:** A) He is wholly wicked and envious from the very beginning, B) He is neither wholly good nor wholly guilty — a genuinely honourable man brought down by his own fatal error of judgement, so his fall moves us, C) He is completely innocent and does nothing wrong, D) He escapes all consequences and lives to rule Rome
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic hero is an in-between figure: real virtue undone by a fatal error (hamartia). Brutus acts for Rome, not from envy, yet kills a friend on a mistaken principle — that middle position is why his ruin arouses pity, not disgust.
   * **Why A:** Envy is Cassius's motive, not Brutus's; if Brutus were wholly wicked his fall would satisfy rather than move us.
   * **Why C:** He does help kill Caesar and misjudges disastrously; a blameless man cannot be a tragic hero, whose fall must be self-caused.
   * **Why D:** He is defeated at Philippi and dies by his own hand — a tragic hero falls; he does not thrive.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Brutus's evolution from beginning to end?
   * **Options:** A) A cowardly flatterer at the start → a triumphant emperor at the end, B) A revered, honourable Roman whose good faith Cassius must court → a defeated, self-slain leader mourned as "the noblest Roman of them all", C) A common soldier at the start → a scheming tyrant at the end, D) One of Caesar's open enemies at the start → Caesar's loyal general at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from honoured integrity to ruin — the same principled man, undone by a single misjudged act. Antony's tribute over his body measures how far the fall reaches. That arc IS the tragedy.
   * **Why A:** He starts respected, not a coward, and ends dead, not triumphant — this reverses his actual arc.
   * **Why C:** He is a leading senator, not a common soldier, at the opening, and his motive is principle, not tyranny.
   * **Why D:** Brutus is Caesar's friend who turns against him for Rome, not an open enemy who becomes loyal — this inverts his relationship with Caesar.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Brutus's downfall is driven above all by his own choice and misjudgement — Cassius tempts him, but the decision to kill Caesar, and the fatal errors that follow, are his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Cassius plants the idea, but Brutus weighs it alone and chooses; then his own misjudgements — sparing Antony, letting him speak — doom the cause. His agency is what turns temptation into tragedy and keeps the fall *his*.
   * **WhyWrong:** Cassius never forces Brutus's hand — he flatters and persuades. Treating Brutus as a puppet removes the choices and errors that make him a tragic hero rather than a mere victim.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the assassination of Caesar *lead to* civil war rather than to the free republic the conspirators intended? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen in order, B) Killing Caesar removes the one figure holding power, but Brutus then lets Antony speak at the funeral — Antony turns the crowd, and the unleashed chaos becomes the war that destroys the conspirators, C) The gods declare war as a punishment unrelated to anyone's actions, D) The conspirators grow bored and start a war for no reason
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the murder creates a power vacuum, Brutus's misjudgement hands Antony the crowd, and the roused mob's fury becomes civil war. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** The war springs from human choices and consequences, not an arbitrary divine decree.
   * **Why D:** The war is driven by Antony's roused mob and the struggle for power, not boredom or randomness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Brutus's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) Cassius persuades him → he chooses to kill Caesar for Rome → he misjudges by sparing Antony and letting him speak → Antony turns the people → civil war follows → he is defeated and takes his own life, C) Fate alone decides everything, and his choices make no difference, D) Cassius secretly controls every step, so nothing is Brutus's doing
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in his choice to act on principle. That is the tragic arc: hamartia → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the logical, causal outworking of his own decisions.
   * **Why C:** If choice made no difference it would not be a tragedy; the whole arc turns on his decisions.
   * **Why D:** Cassius advises, but Brutus overrules him on the crucial points; making Cassius the cause erases the causation that is Brutus's own.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that dooms the conspirators' cause — the point after which they cannot recover?
   * **Options:** A) The Soothsayer's warning to "Beware the ides of March", B) Brutus's decision to let Antony deliver Caesar's funeral oration, which swings the crowd against the conspiracy, C) Caesar's refusal of the crown offered by Antony, D) The defeat at the Battle of Philippi
   * **Correct:** B
   * **Feedback:** ✓ Correct. Letting Antony speak is the irreversible misjudgement: once the crowd turns, the conspirators lose Rome and every later disaster follows. That is the tragic reversal (peripeteia).
   * **Why A:** The warning only foreshadows; nothing is yet irreversible — Caesar could still heed it.
   * **Why C:** The refusal happens before the murder and settles nothing; the cause is not yet lost there.
   * **Why D:** Philippi marks the arrival of the catastrophe, not the choice that made it inevitable.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In *Julius Caesar* the civil war and the conspirators' deaths follow by cause-and-effect from the assassination and Brutus's misjudgements — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: each event is *because of* the last, all rooted in the murder and the errors around it. That causal spine is what separates tragedy from a chronicle.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a list of happenings.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Cassius tells Brutus, "The fault, dear Brutus, is not in our stars, / But in ourselves, that we are underlings." What does this reveal about the play's view of fate and responsibility?
   * **Options:** A) That the stars and omens control everything, so no one is to blame, B) That men are responsible for their own choices — power and ruin come from what people *do*, not from destiny, C) That Brutus has no choice but to obey Cassius, D) That only the gods decide who rises and falls
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line insists the cause lies in human will, not the heavens: the play's argument is that people make their own fate through action, which is why the conspirators — not fate — bear the guilt.
   * **Why A:** The line says the opposite — the fault is *not* in the stars but in ourselves; the play stresses human responsibility.
   * **Why C:** Cassius urges self-determination here; the point is that Brutus *can* act, not that he must obey.
   * **Why D:** The whole thrust of the line rejects a world ruled by the gods alone in favour of human agency.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Antony begins, "Friends, Romans, countrymen, lend me your ears." Which controlling idea does the funeral scene most explore?
   * **Options:** A) That the weather affects the outcome of battles, B) That persuasive speech is a form of power — rhetoric can move a crowd from one belief to its opposite and reshape events, C) That the Roman crowd never listens to anyone, D) That funerals should always be brief
   * **Correct:** B
   * **Feedback:** ✓ Correct. Antony sways the fickle citizens from approval of the murder to fury against its authors using only words — the play's idea that rhetoric, well aimed, can outweigh truth and turn the course of history.
   * **Why A:** The scene turns on the force of speech, not the weather.
   * **Why C:** The crowd listens intensely and swings completely — that responsiveness is the point.
   * **Why D:** The theme is the power of what is *said*, not the length of the ceremony.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Brutus joins the plot from honourable motives, yet the result is disaster. Which idea does the play most explore through him — and how does it *work*?
   * **Options:** A) That good intentions always guarantee good outcomes, B) That honour and idealism, cut off from political realism, can lead a good man to commit and justify terrible acts — noble motive does not redeem the deed, C) That Brutus never really cared about Rome, D) That only selfish people ever cause harm
   * **Correct:** B
   * **Feedback:** ✓ Correct. Brutus's very integrity is his undoing: because he trusts principle over consequence, he kills a friend and mismanages the aftermath. The play tests whether honourable ends can excuse violent means — and answers no.
   * **Why A:** The play shows the reverse — Brutus's good intentions produce catastrophe, not good outcomes.
   * **Why C:** He acts precisely *because* he loves Rome; the tragedy is that this love is misdirected, not absent.
   * **Why D:** The play shows a well-meaning man causing enormous harm, complicating the idea that only the selfish do damage.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In *Julius Caesar*, the crowd is shown as dangerously fickle — the same citizens who praise Brutus's reasons turn moments later to fury when Antony's rhetoric moves them.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The people cheer Brutus, then Antony reverses them entirely — dramatising the play's idea that public opinion is unstable and can be steered by whoever speaks best.
   * **WhyWrong:** The crowd's loyalty is strikingly unstable: it swings from one speaker to his opposite, which is exactly the play's warning about the fickleness of the mob and the power of rhetoric over it.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *Julius Caesar* is a tragedy. Why do we feel *pity* for Brutus by the end, despite his part in Caesar's murder?
   * **Options:** A) Because he is entirely innocent and did nothing wrong, B) Because a genuinely honourable man has been destroyed by his own misjudgement — his ruin feels like a terrible waste of real virtue, C) Because Cassius forced him and he could not help it, D) Because he escapes punishment and we are glad for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy makes us pity a *self-caused* fall: Brutus's integrity is real, so watching his own error waste it moves us. Even Antony calls him "the noblest Roman of them all". Pity comes from that wasted goodness, not from innocence.
   * **Why A:** He is guilty of the murder, not innocent — and it is precisely a *flawed* good man, not a blameless one, whose fall earns tragic pity.
   * **Why C:** Blaming Cassius removes Brutus's choice; we pity him *because* the ruin is his own doing, wasting real virtue.
   * **Why D:** He does not escape — he dies by his own hand; and the feeling at the close is pity and fear, not relief.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A tragedy such as *Julius Caesar* is designed to make the audience feel two emotions above all others. Which two?
   * **Options:** A) Amusement and satisfaction, B) Pity and fear, C) Confusion and boredom, D) Admiration for the conspirators' cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Since Aristotle, tragedy has aimed to arouse *pity* (for the hero's ruin) and *fear* (that one like ourselves could fall the same way) — the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom are the marks of a *failed* tragedy, not its aim.
   * **Why D:** We may note the political cunning, but the intended response is pity and fear, not admiration for cleverness.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *fear* as we watch Brutus's fall?
   * **Options:** A) Because we are frightened of the storms and omens as supernatural threats, B) Because Brutus is a good, principled man "like us" — so his ruin warns that even honest ideals, if misjudged, could undo anyone, C) Because we are afraid Brutus will win and seize Rome, D) We feel no fear at all, only contempt
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragic fear is *fear for ourselves*: because Brutus is recognisably decent, not a monster, his fall feels like a warning that the same misjudgement could destroy any of us.
   * **Why A:** The omens create dread, but the deeper fear is moral and human — fear for a good man's fate, and our own.
   * **Why C:** We know he will fall; the fear is of *how* he falls and what it reveals, not that he will triumph.
   * **Why D:** A wholly wicked figure would earn contempt; Brutus's genuine nobility is exactly what turns contempt into fear and pity.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both pity and fear — pity for the nobility Brutus has wasted, and fear that even honourable intentions, badly judged, can bring ruin.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for the self-destroyed hero and fear for "one like us" — is the emotional effect a tragedy is built to produce.
   * **WhyWrong:** The intended effect is pity *and* fear together, not triumph or amusement; the ending is meant to leave us moved, not satisfied at anyone's defeat.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about using violence to protect liberty?
   * **Options:** A) That killing a powerful man is a reliable route to freedom, B) That political murder, even for a good cause, unleashes chaos rather than liberty — the conspirators destroy the very republic they meant to save, C) That the crowd always chooses wisely, D) That honourable motives make any act turn out well
   * **Correct:** B
   * **Feedback:** ✓ Correct. Brutus kills Caesar to save the republic, yet the deed brings civil war, the conspirators' deaths, and the rise of new rulers — the play's enduring "so what": violence to defend freedom devours it.
   * **Why A:** The play dramatises the opposite — the assassination brings chaos and defeat, not freedom.
   * **Why C:** The crowd is shown as fickle and easily swayed, not a wise judge of events.
   * **Why D:** Brutus's honourable motive does *not* save the outcome — the play insists good intentions cannot redeem the deed.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play suggest about whether noble ends can justify violent means?
   * **Options:** A) That a good enough cause makes any act right, B) That even the highest motives cannot redeem murder — the deed carries its own ruinous consequences, C) That motives do not matter at all, D) That only the guilty are ever punished
   * **Correct:** B
   * **Feedback:** ✓ Correct. Brutus acts for Rome, yet the murder still unleashes war and destroys him and his cause. The message is that a noble end does not sanctify a bloody means — consequences follow the act, not the intention.
   * **Why A:** The play shows a noble cause producing catastrophe, refuting the idea that ends justify means.
   * **Why C:** Motives matter greatly — they are why we pity Brutus — but the play denies that they *excuse* the deed.
   * **Why D:** The tragedy engulfs the well-meaning Brutus too; ruin here is not confined to the wicked.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that unleashing violence to defend a republic can destroy the very order it was meant to protect.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The conspirators kill Caesar to preserve the republic, but the act plunges Rome into civil war and clears the way for new tyranny — the freedom they sought is the first casualty.
   * **WhyWrong:** The play insists the assassination backfires: meant to save the republic, it destroys it — a central part of its moral warning about political violence.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Through Cassius's line that "the fault … is not in our stars, / But in ourselves", the play affirms which enduring idea?
   * **Options:** A) That the heavens decide everything and people are helpless, B) That human beings shape their own destiny through their choices — and so must answer for them, C) That omens can never be ignored safely, D) That ambition is the highest virtue
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's enduring worldview is one of human responsibility: the conspirators' fate flows from what they choose to do, not from destiny — so the guilt, and the tragedy, are theirs.
   * **Why A:** The line rejects a helpless, star-ruled world in favour of human agency.
   * **Why C:** The message is about responsibility for choices, not the reliability of omens.
   * **Why D:** The play presents unchecked ambition and its violent opposition as destructive, not virtuous.
