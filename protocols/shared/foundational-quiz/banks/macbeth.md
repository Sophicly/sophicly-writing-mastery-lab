# Foundational Quiz Bank — Macbeth

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Macbeth is a **tragedy** → the `effects` aspect tests the audience's **pity and fear**, not the
naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`macbeth.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Macbeth

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Macbeth *changes* across the play — and what drives the change?
   * **Options:** A) He is a villain from the first scene and never really changes, B) He begins a brave, honoured general and becomes an isolated, guilt-ridden tyrant — driven by his own choice to act on the prophecy, C) He stays a good man throughout and is simply unlucky, D) He is controlled by the witches and has no say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: "brave Macbeth" falls to tyrant — and the engine of the fall is his own decision to murder, not fate or bad luck.
   * **Why A:** He is honoured and loyal at the start ("brave Macbeth"); the drama lies in his transformation, not in fixed villainy.
   * **Why C:** He is not merely unlucky — he chooses to murder; the fall is self-caused, which is what makes it tragic.
   * **Why D:** The witches only tempt; removing his agency turns a tragic hero into a puppet and misses why the change is his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Macbeth a *tragic hero* rather than simply a villain?
   * **Options:** A) He is wholly evil from the very beginning, B) He is neither wholly good nor wholly evil — a great man brought down by his own fatal error, so his fall moves us, C) He is completely innocent and does nothing wrong, D) He escapes all consequences and thrives
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic hero is an in-between figure: real greatness undone by a fatal error (hamartia). That middle position is exactly why his ruin arouses pity, not mere disgust.
   * **Why A:** If he were wholly evil his fall would satisfy rather than move us — the tragedy needs his early nobility.
   * **Why C:** He is the murderer, not an innocent; his guilt is his own and is essential to the tragedy.
   * **Why D:** He is destroyed at the close — a tragic hero falls; he does not thrive.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Macbeth's evolution from beginning to end?
   * **Options:** A) A cowardly traitor at the start → a beloved king at the end, B) "brave Macbeth", a valued and loyal soldier → a hated, weary tyrant who calls life "a tale told by an idiot", C) A weak king at the start → a humble subject at the end, D) One of the witches at the start → a free man at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from honoured valour to exhausted despair — the same man, hollowed out by his own choices. That arc IS the tragedy.
   * **Why A:** He starts honoured, not a traitor, and ends hated, not beloved — this reverses his actual arc.
   * **Why C:** He is a general, not a king, at the opening, and a tyrant, not a humble subject, at the close.
   * **Why D:** Macbeth is the witches' subject, not one of them; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Macbeth's downfall is driven above all by his own choice to act — the witches tempt him, but the decision to murder is his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The prophecy plants the idea, but Macbeth weighs it and chooses; his agency is what turns temptation into tragedy and keeps the fall *his*.
   * **WhyWrong:** The witches never force his hand — they only foretell. Treating him as their puppet removes the choice that makes him a tragic hero rather than a victim.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does murdering Duncan *lead to* murdering Banquo? (What is the causal link?)
   * **Options:** A) The two murders are unconnected events that simply happen in order, B) Duncan's murder wins Macbeth the crown, but the witches promised Banquo's descendants the throne — so Macbeth kills to hold on to what he seized, C) The witches order Macbeth to kill Banquo, D) Macbeth kills at random because he has gone mad
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: seizing the crown creates the fear of losing it, and that fear drives the second murder. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** The witches prophesy but issue no orders; Macbeth decides to kill Banquo himself, out of fear.
   * **Why D:** His killing is driven by calculated fear of Banquo's line, not random madness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Macbeth's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) The prophecy tempts him → he chooses regicide → fear of exposure drives further murder → his tyranny provokes rebellion → he is destroyed, C) The witches cause each step directly, so nothing is his doing, D) Fate alone decides everything, and his choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in his first choice. That is the tragic arc: hamartia → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the logical, causal outworking of his own first act.
   * **Why C:** The witches tempt but do not act; making them the cause erases the causation that is his.
   * **Why D:** If choice made no difference it would not be a tragedy; the whole arc turns on his decision.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes Macbeth's catastrophe unavoidable — the point of no return?
   * **Options:** A) The witches' first prophecy on the heath, B) The murder of King Duncan, C) The appearance of Banquo's ghost at the feast, D) The moving of Birnam Wood to Dunsinane
   * **Correct:** B
   * **Feedback:** ✓ Correct. Killing Duncan is the irreversible act: once done, Macbeth cannot go back, and every later disaster follows from it. That is the tragic turning point (peripeteia).
   * **Why A:** The prophecy only tempts; nothing is yet irreversible — Macbeth could still refuse.
   * **Why C:** The ghost is a *consequence* of the murders, a sign the fall is already underway, not the turning point itself.
   * **Why D:** Birnam Wood marks the arrival of the catastrophe, not the choice that made it inevitable.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Macbeth the later disasters follow by cause-and-effect from his first choice to murder — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: each event is *because of* the last, all rooted in the first murder. That causal spine is what separates tragedy from a list of happenings.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Macbeth names his only "spur" to act as "vaulting ambition, which o'erleaps itself". What does this reveal about the play's view of ambition?
   * **Options:** A) That ambition is always rewarded, B) That unchecked ambition overreaches and destroys the very person who indulges it, C) That Macbeth has no ambition at all, D) That ambition matters only to Lady Macbeth
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of a rider leaping too far and falling is the play's whole argument about ambition: pursued without restraint, it overreaches and ruins the self.
   * **Why A:** Ambition here brings destruction, not reward — the opposite of the play's warning.
   * **Why C:** He names ambition as his single driving "spur"; he has it in excess, not absence.
   * **Why D:** He speaks these words of himself — the ambition, and its destruction, are his own.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The witches' paradox "Fair is foul, and foul is fair" runs through the play. Which controlling idea does it announce?
   * **Options:** A) That appearances deceive — what looks good may hide evil, and moral order has been inverted, B) That the weather is important to the plot, C) That the witches are kind and helpful, D) That fair-minded people always win
   * **Correct:** A
   * **Feedback:** ✓ Correct. The chant collapses good and evil into each other, announcing a world of deceptive surfaces and inverted order — an idea that shapes the whole play, from Duncan trusting his host to Macbeth's "false face".
   * **Why B:** The line is about moral inversion, not literal weather, though the storm mirrors the theme.
   * **Why C:** The witches unsettle and mislead; the paradox warns of danger, not kindness.
   * **Why D:** The play shows the opposite — for much of it the "foul" prospers and the fair suffer.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The play holds fate and free will in tension. Which idea best describes how Macbeth's downfall comes about?
   * **Options:** A) The witches force him to kill Duncan against his will, B) The prophecy tempts him, but he chooses to act on it — the choice, and so the guilt, is his, C) Duncan brings about his own death, D) Lady Macbeth casts a spell that controls him
   * **Correct:** B
   * **Feedback:** ✓ Correct. Fate and choice work together: the witches predict but never compel, and it is Macbeth's own decision that turns prophecy into tragedy.
   * **Why A:** The witches only foretell — they never physically force his hand.
   * **Why C:** Duncan is an innocent victim; he does not seek or cause his death.
   * **Why D:** Lady Macbeth pressures him, but there is no spell — the deed remains his choice.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Macbeth, guilt is shown as inescapable and almost physical — it surfaces in blood that will not wash away and in the loss of sleep.
   * **Answer:** True
   * **Feedback:** ✓ Correct. "Out, damned spot!" and "Macbeth does murder sleep" make guilt a bodily torment that cannot be cleansed — the play's idea that conscience punishes from within.
   * **WhyWrong:** Guilt here is intensely physical and inescapable — imagined bloodstains that will not wash out and the ruin of sleep dramatise a conscience that cannot rest.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Macbeth is a tragedy. Why do we feel *pity* for Macbeth by the end, despite the murders he has committed?
   * **Options:** A) Because he is entirely innocent and did nothing wrong, B) Because a man of real greatness has been destroyed by his own error — his ruin feels like a terrible waste, C) Because the witches forced him and he could not help it, D) Because he escapes punishment and we are glad for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy makes us pity a *self-caused* fall: Macbeth's early nobility is real, so watching him waste it moves us. Pity comes from undeserved-*seeming* ruin brought on by his own hand, not from innocence.
   * **Why A:** He is guilty, not innocent — and it is precisely a *flawed* great man, not a blameless one, whose fall earns tragic pity.
   * **Why C:** Blaming the witches removes his choice; we pity him *because* the ruin is his own doing, wasting real greatness.
   * **Why D:** He does not escape — he is killed; and the feeling at the close is pity and fear, not relief for him.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A tragedy such as Macbeth is designed to make the audience feel two emotions above all others. Which two?
   * **Options:** A) Amusement and satisfaction, B) Pity and fear, C) Confusion and boredom, D) Admiration for the hero's cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Since Aristotle, tragedy has aimed to arouse *pity* (for the hero's ruin) and *fear* (that one like ourselves could fall the same way) — the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom are the marks of a *failed* tragedy, not its aim.
   * **Why D:** We may note Macbeth's daring, but the intended response is pity and fear, not admiration for cleverness.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *fear* as we watch Macbeth's fall?
   * **Options:** A) Because we are frightened of the witches' magic tricks, B) Because Macbeth is a capable man "like us" — so his ruin warns that ambition could undo anyone, C) Because we are afraid Macbeth will win and rule forever, D) We feel no fear at all, only disgust
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragic fear is *fear for ourselves*: because Macbeth is recognisably human, not a monster, his fall feels like a warning that the same flaw could destroy any of us.
   * **Why A:** The fear is moral and human, not fright at stage magic; the witches unsettle, but the deeper fear is for Macbeth's humanity, and our own.
   * **Why C:** We know he will fall; the fear is of *how* he falls and what it reveals, not that he will triumph.
   * **Why D:** A wholly evil figure would earn disgust; Macbeth's residual humanity is exactly what turns disgust into fear and pity.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both pity and fear — pity for the greatness Macbeth has wasted, and fear that unchecked ambition could ruin anyone.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for the self-destroyed hero and fear for "one like us" — is the emotional effect a tragedy is built to produce as order is finally restored.
   * **WhyWrong:** The intended effect is pity *and* fear together, not triumph or amusement; the ending's restored order is meant to leave us moved, not satisfied at a villain's defeat.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about ambition and power?
   * **Options:** A) That ambition should be pursued at any cost, B) That ambition without moral restraint corrupts and destroys the self, and that disorder follows the murder of a king — yet rightful order is finally restored, C) That kings can never be defeated, D) That guilt has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth's unchecked ambition ruins him and throws Scotland into chaos, yet Malcolm's restoration affirms that the moral and natural order ultimately reasserts itself — the play's enduring "so what".
   * **Why A:** The play dramatises the opposite — ambition without limit is shown to be self-destructive.
   * **Why C:** Macbeth is defeated by Macduff; the "invincibility" prophecies prove to be equivocations.
   * **Why D:** Guilt is an inescapable torment here — the message insists that wrongdoing is punished, within and without.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play suggest happens when the natural, God-given order is violated by killing a king?
   * **Options:** A) Nothing changes; life carries on as normal, B) Chaos and unnatural disorder follow, until the rightful order is restored, C) The murderer is rewarded with a long and happy reign, D) The country becomes a peaceful republic
   * **Correct:** B
   * **Feedback:** ✓ Correct. After the regicide, nature itself recoils — darkness at noon, horses turning wild — and the disorder ends only when Malcolm, the rightful king, is restored. Order violated is order avenged.
   * **Why A:** The murder unleashes cosmic and political chaos; nothing stays normal.
   * **Why C:** Macbeth's reign is short, fearful and tormented — the reverse of a reward.
   * **Why D:** Order is restored through rightful kingship, not a republic.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that terrible deeds bring their own punishment — the guilty are destroyed from within, by their own conscience, as well as by their enemies.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Both Macbeth and Lady Macbeth are ruined less by armies than by guilt — sleeplessness, madness and despair — affirming the moral that wrongdoing punishes the self.
   * **WhyWrong:** The play insists that guilt cannot be escaped: the Macbeths are broken from within long before their outward defeat — a central part of its moral message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written for King James I, the play ultimately affirms which idea about kingship?
   * **Options:** A) That murdering a king is a clever route to lasting power, B) That legitimate, rightful kingship is the foundation of a stable and natural order, C) That the witches are the true rulers of Scotland, D) That ambition is the highest virtue
   * **Correct:** B
   * **Feedback:** ✓ Correct. The restoration of Malcolm, Duncan's rightful heir, affirms legitimate kingship and the natural order — a message reassuring to James I, who claimed descent from Banquo.
   * **Why A:** Regicide brings Macbeth only chaos and ruin, not lasting power.
   * **Why C:** The witches tempt and unsettle, but they do not rule; rightful kingship is restored.
   * **Why D:** The play presents unchecked ambition as destructive, not virtuous.
