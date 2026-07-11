# Foundational Quiz Bank — Romeo and Juliet

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Romeo and Juliet is a **tragedy** → the `effects` aspect tests the audience's **pity and fear**,
not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`romeo_and_juliet.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Romeo and Juliet

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Juliet *changes* across the play — and what drives the change?
   * **Options:** A) She is a rebellious daughter from the first scene and never really changes, B) She grows from an obedient, sheltered child into a decisive woman who defies her family and dies by her own hand — driven by her own choice to love Romeo across the feud, C) She stays a passive girl throughout and is simply carried along by others, D) She is controlled by fate and has no say in what she becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: a dutiful child who will "look to like" whom her parents choose becomes a woman who marries in secret, defies her father and takes the potion — and the engine is her own decision to love, not fate alone.
   * **Why A:** At the start she is obedient and untried ("I'll look no more than your consent gives strength"); the drama lies in her transformation into defiance, not in fixed rebellion.
   * **Why C:** She is not passive — she proposes marriage, drinks the potion and chooses death; treating her as merely carried along erases the agency that makes her fall tragic.
   * **Why D:** Fate presses on the lovers, but Juliet weighs and chooses at every turn; removing her agency turns a tragic heroine into a puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Romeo and Juliet *tragic* figures rather than simply reckless children or pure victims of fate?
   * **Options:** A) They are foolish from the very beginning and deserve what happens, B) They are neither wholly wise nor merely unlucky — young lovers of real feeling brought down by their own impetuous haste, so their fall moves us, C) They are entirely innocent and make no mistakes at all, D) They escape all consequences and live on together
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic figure is an in-between one: genuine love and worth undone by a fatal flaw — here, headlong haste. That middle position is exactly why their ruin arouses pity, not mere impatience with silly teenagers.
   * **Why A:** If they were merely foolish their deaths would irritate rather than move us — the tragedy needs their love to be real and worthy.
   * **Why C:** Their haste and secrecy are their own errors; a flawless pair would earn sympathy but not tragic pity.
   * **Why D:** They are destroyed at the close — tragic figures fall; they do not live on.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Romeo's evolution from beginning to end?
   * **Options:** A) A hardened soldier at the start → a gentle peacemaker at the end, B) A love-sick boy sighing over Rosaline → a devoted husband and then a desperate man who kills Tybalt and himself — driven by his own headlong passion, C) A cold, unfeeling man at the start → a calm philosopher at the end, D) An enemy of the Capulets at the start → their loyal servant at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from shallow infatuation to true, committed love and then to violence and despair — the same impetuous heart, following its passion to ruin. That arc IS the tragedy.
   * **Why A:** He begins a lover, not a soldier, and ends in violence and suicide, not peacemaking — this reverses his actual arc.
   * **Why C:** He is passionate throughout, never cold or philosophically calm; his undoing is excess of feeling, not its absence.
   * **Why D:** Romeo is a Montague throughout and never serves the Capulets; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** The lovers' downfall is driven partly by their own choices — their headlong haste to love, marry in secret and act on impulse — not by fate alone.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The stars press on them, but they choose at every turn — instant love, a secret marriage, an untested plan, Romeo's rush to die; that agency is what makes the fall *theirs* and the pair tragic rather than merely unlucky.
   * **WhyWrong:** Fate never simply forces their hands — they decide. Treating them as pure puppets of the stars removes the choices that make them tragic figures rather than victims.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Romeo killing Tybalt *lead to* the lovers' final catastrophe? (What is the causal link?)
   * **Options:** A) The two events are unconnected and simply happen in order, B) Killing Tybalt gets Romeo banished, which forces the lovers apart, drives the desperate potion plan, and so sets the double suicide in motion, C) The Prince orders Romeo to kill himself as punishment, D) Romeo kills at random because he has gone mad
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: revenge for Mercutio brings banishment, banishment forces separation, separation demands the risky plan, and the plan's failure ends in the tomb. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** The Prince banishes Romeo, he does not command a suicide; the deaths flow from the lovers' own desperate choices.
   * **Why D:** Romeo kills Tybalt out of grief and revenge for Mercutio, not random madness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the tragedy — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the lovers by bad luck, B) The feud makes love forbidden → the lovers marry in secret → Romeo avenges Mercutio by killing Tybalt → he is banished → the potion plan is hatched → the letter fails to reach him → both die, C) The stars cause each step directly, so nothing is the lovers' doing, D) Fate alone decides everything, and their choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in the feud and the lovers' haste. That is the tragic arc: an inherited hatred and a rash passion working themselves out to catastrophe.
   * **Why A:** Their ruin is not random misfortune — it is the logical, causal outworking of the feud and their own choices.
   * **Why C:** The stars loom over the play, but it is human acts — the marriage, the killing, the failed letter — that drive each step.
   * **Why D:** If choice made no difference it would not be a tragedy; the whole arc turns on the lovers' decisions.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes the catastrophe unavoidable — the point of no return?
   * **Options:** A) Romeo and Juliet meeting at the Capulet feast, B) Romeo killing Tybalt in revenge for Mercutio, C) Romeo drinking the poison in the tomb, D) The Prince reconciling the families at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Killing Tybalt is the irreversible act: it earns banishment, splits the lovers, and makes every later disaster follow. Before it, reconciliation is still possible; after it, only tragedy remains. That is the tragic turning point (peripeteia).
   * **Why A:** The meeting begins the love but is not yet irreversible — the feud could still be crossed peacefully.
   * **Why C:** The poison is the *catastrophe itself*, the end the turning point made inevitable, not the choice that set it in motion.
   * **Why D:** The reconciliation is the aftermath — the cost paid, not the act that caused the fall.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the play the later disasters follow by cause-and-effect from the feud and the lovers' secret marriage — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: the brawl, the banishment, the potion and the tomb are each *because of* the last, all rooted in the feud and the hasty marriage. That causal spine is what separates tragedy from a list of happenings.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Juliet cries "My only love sprung from my only hate" (1.5). What does this reveal about the play's view of love and hatred?
   * **Options:** A) That she secretly hates Romeo, B) That love and hatred are bound inseparably together — her love grows from the very house she is bound to hate, and cannot survive the feud, C) That she still loves an earlier suitor, D) That the Nurse disapproves of the match
   * **Correct:** B
   * **Feedback:** ✓ Correct. The oxymoron captures the play's whole argument: love born out of hatred, doomed by the feud it cannot escape. Love and hate are shown as fatally entangled.
   * **Why A:** She loves Romeo — the line laments that he belongs to the hated house, not that she hates him.
   * **Why C:** The line is about the feud dividing her from Romeo, not about a rival suitor.
   * **Why D:** The Nurse's opinion is not what this line explores — it is the clash of love and inherited hate.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Friar Lawrence warns "These violent delights have violent ends" (2.6). Which controlling idea does this announce?
   * **Options:** A) That love should always be pursued as fast as possible, B) That passion pursued in haste overreaches and destroys itself — impetuous love ends in ruin, C) That the lovers feel no real delight, D) That only the Friar's plans ever go wrong
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of delights that burn out violently is the play's argument about haste: love and revenge alike, pursued without restraint, consume the very people who indulge them.
   * **Why A:** The line warns *against* haste — the opposite of pursuing love as fast as possible.
   * **Why C:** The delights are real and intense; it is their *speed and excess*, not their absence, that destroys.
   * **Why D:** The theme is universal in the play — every rash choice, not only the Friar's, ends violently.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The Prologue calls the lovers "star-cross'd", yet the play also blames human choices. Which idea best describes how their downfall comes about?
   * **Options:** A) Fate alone destroys them and their choices are irrelevant, B) Fate and free will work together — the stars set a doom, but the lovers' own haste and the families' hatred bring it to pass, C) The feud has nothing to do with their deaths, D) The Friar casts a spell that controls them
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play holds fate and choice in tension: "star-cross'd" foretells a doom, but it is human hatred and human haste — the marriage, the killing, the rushed suicide — that actually deliver it.
   * **Why A:** If choice were irrelevant the lovers' rashness would carry no weight; the play repeatedly shows their decisions driving the ruin.
   * **Why C:** The feud is the very soil the tragedy grows from — it makes the love forbidden and the deaths possible.
   * **Why D:** There is no spell; the Friar advises and schemes, but the lovers choose their own path.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In the play, young love is set against a backdrop of inherited hatred — "Two households, both alike in dignity" — and it is the feud that makes the lovers' love both precious and doomed.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Prologue frames the whole tragedy as love caught inside an "ancient grudge"; the feud is the controlling condition that makes the lovers' devotion beautiful and impossible at once.
   * **WhyWrong:** The love and the feud are inseparable in the play — the hatred of the two houses is exactly what dooms the love, not a detail beside it.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Romeo and Juliet is a tragedy. Why do we feel *pity* for the lovers by the end, despite the rash choices that ruin them?
   * **Options:** A) Because they are entirely blameless and made no mistakes, B) Because two young people capable of real, tender love are destroyed by hatred and their own haste — their deaths feel like a terrible waste, C) Because fate forced them and they could do nothing at all, D) Because they escape their families and we are glad for them
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragedy makes us pity a *partly self-caused* fall: the lovers' feeling is genuine and full of promise, so watching it wasted by feud and haste moves us. Pity comes from ruined worth, not from innocence.
   * **Why A:** Their haste is a real flaw — and it is precisely *flawed* lovers, not blameless ones, whose fall earns tragic pity.
   * **Why C:** Blaming fate alone removes their choices; we pity them *because* their own rashness helps waste something real.
   * **Why D:** They do not escape — they die; and the feeling at the close is pity and fear, not relief for them.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A tragedy such as Romeo and Juliet is designed to make the audience feel two emotions above all others. Which two?
   * **Options:** A) Amusement and satisfaction, B) Pity and fear, C) Confusion and boredom, D) Admiration for the lovers' cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Since Aristotle, tragedy has aimed to arouse *pity* (for the lovers' ruin) and *fear* (that hatred and haste like this could destroy any of us) — the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom are the marks of a *failed* tragedy, not its aim.
   * **Why D:** We may admire the lovers' devotion, but the intended response is pity and fear, not admiration for cleverness.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *fear* and dread as we watch the lovers rush towards the tomb?
   * **Options:** A) Because we are frightened of ghosts and the dark vault, B) Because the lovers are recognisably like us — so their ruin warns that hatred, haste and blind chance could destroy anyone, C) Because we are afraid the feud will spread across all of Italy, D) We feel no fear at all, only mild curiosity
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tragic fear is *fear for ourselves*: because the lovers are ordinary young people, not monsters, their fall feels like a warning that the same forces — inherited hatred, headlong passion, unlucky timing — could undo any of us.
   * **Why A:** The fear is moral and human, not a fright at ghosts; the tomb disturbs, but the deeper fear is for how easily love is destroyed.
   * **Why C:** We fear for the lovers themselves and for our own vulnerability, not for the geographical spread of the quarrel.
   * **Why D:** The foreboding that hangs over the play makes us fear the outcome throughout — indifference is the mark of a failed tragedy.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both pity and fear — pity for the young love wasted, and fear that hatred and haste could destroy the innocent.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for the self- and feud-destroyed lovers and fear for "ones like us" — is the emotional effect a tragedy is built to produce as the families are finally, painfully reconciled.
   * **WhyWrong:** The intended effect is pity *and* fear together, not amusement or triumph; the reconciliation is meant to leave us moved and warned, not merely satisfied.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about hatred and the feud?
   * **Options:** A) That family loyalty should always come before love, B) That senseless, inherited hatred destroys the innocent young — and that only a terrible cost finally teaches the warring families peace, C) That love can never really exist, D) That the feud has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. The lovers die because of an "ancient grudge" they did not make, and only their deaths reconcile the houses — the play's enduring "so what": hatred consumes the next generation, and peace is bought at the price of the young.
   * **Why A:** The play dramatises the opposite — the feud's demand for loyalty is exactly what destroys the lovers.
   * **Why C:** The play affirms that love is real and precious; it is hatred, not love, that it condemns.
   * **Why D:** The feud's consequences are catastrophic — it costs the lives of Mercutio, Tybalt, Paris and both lovers.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the reconciliation of the Montagues and Capulets at the very end suggest the play is saying?
   * **Options:** A) That the feud was harmless all along, B) That peace was always possible, but it took the death of their innocent children to force the families to see the cost of their hatred, C) That the Prince alone caused the tragedy, D) That the lovers died for nothing and change nothing
   * **Correct:** B
   * **Feedback:** ✓ Correct. "All are punish'd" — the families make peace only over their children's bodies, the play's warning that hatred is broken only at unbearable cost, and far too late.
   * **Why A:** The feud is shown to be lethal, not harmless — it kills four young people before it ends.
   * **Why C:** The Prince tries to keep order; the tragedy is caused by the families' hatred and the lovers' haste, not by him.
   * **Why D:** The deaths do change things — they end the feud — but the message is that this reconciliation comes tragically late.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that the hatred of one generation destroys the next — the children pay for the quarrel of their parents.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The "star-cross'd" children die for an "ancient grudge" they never chose, and only their deaths end it — affirming that inherited hatred consumes the innocent young.
   * **WhyWrong:** The play insists the feud's cost falls on the children: Romeo and Juliet are destroyed by a quarrel made by their elders, a central part of its moral message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Which enduring idea about love and hate does the ending most affirm?
   * **Options:** A) That private love can always overcome public hatred if it is strong enough, B) That love pursued inside a world of hatred cannot survive — yet its destruction can, at last, shame that hatred into peace, C) That hatred always triumphs and love is worthless, D) That fate is the only thing that matters and human choices are meaningless
   * **Correct:** B
   * **Feedback:** ✓ Correct. The lovers' love is real but cannot outlast the feud; only their deaths reconcile the houses — the play's enduring worldview: love and hate cannot share a world, and hatred is broken only at a devastating cost.
   * **Why A:** The play shows the opposite — however strong, the love is crushed by the feud; it wins peace only through death, not survival.
   * **Why C:** Love is not worthless here — it is precious, and its loss is precisely what finally ends the hatred.
   * **Why D:** The play holds fate and choice in tension; the lovers' and families' decisions plainly shape the outcome, so choice is not meaningless.
