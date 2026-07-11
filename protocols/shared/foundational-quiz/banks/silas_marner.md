# Foundational Quiz Bank — Silas Marner

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Silas Marner is a **rebirth / redemption** story → the `effects` aspect tests the reader's **hope
and relief softening into tender empathy** — the faith that no heart is beyond change — not the naming of
techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`silas_marner.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Silas Marner

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Silas *changes* across the novel — and what drives the change?
   * **Options:** A) He is a cold, joyless miser from first page to last and never really changes, B) He begins a betrayed, embittered recluse who worships his gold, and becomes a warm, loved man restored to the community — driven by his own choice to take in and cherish Eppie, C) He stays a contented, sociable man throughout and is simply misunderstood, D) He is changed entirely by luck, playing no part in his own renewal
   * **Correct:** B
   * **Feedback:** ✓ Correct. The whole novel is the *thaw*: a heart frozen by betrayal is reopened — and the engine is Silas's own choice to love the child, not chance alone.
   * **Why A:** He is warm and generous at the start of his Lantern Yard life and again at the close; the drama lies in his transformation, not in fixed coldness.
   * **Why C:** He is bitterly isolated for the long middle of the book — the point is the change *out* of that state, not a steady contentment.
   * **Why D:** Eppie arrives by chance, but Silas *chooses* to keep and raise her; removing his agency turns a redemption into an accident and misses why the renewal is his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Silas's story a *redemption* rather than mere good fortune falling on a lucky man?
   * **Options:** A) He is rewarded with money for doing nothing, B) A hardened, cut-off self is remade because Silas confronts his isolation and chooses human love over his hoarded gold — the change costs him and is his own, C) He was never really hardened, so nothing needs redeeming, D) He is rescued entirely by others and stays exactly as he was inside
   * **Correct:** B
   * **Feedback:** ✓ Correct. Redemption turns on a *thawed self*: Silas's cold, gold-worshipping isolation is real, and choosing to love Eppie is the inner change that brings him back to life.
   * **Why A:** He loses his gold and gains no wealth; his renewal is of the heart, not the purse.
   * **Why C:** His years of bitter, miserly isolation are exactly the frozen self the story melts — denying them erases the redemption.
   * **Why D:** Eppie draws him out, but the reopening of his heart is his own; a rescue that left him unchanged inside would not be a redemption.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Silas's evolution from beginning to end?
   * **Options:** A) A trusted village elder at the start → a lonely outcast at the end, B) A betrayed, solitary linen-weaver hoarding his gold at the loom → a beloved father, thawed and restored to the life of Raveloe, C) A wealthy landowner at the start → a penniless wanderer at the end, D) A cheerful child at the start → a bitter old miser at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from cold, cut-off gold-worship to warm belonging — the same man, brought back to life by his own care for Eppie. That arc IS the redemption.
   * **Why A:** He begins an isolated outsider and ends drawn *into* the community — this reverses his actual arc.
   * **Why C:** He is a humble weaver throughout, never a landowner; the change is of the heart, not of fortune.
   * **Why D:** His arc runs from bitter isolation *towards* warmth, not away from it — this inverts the redemption.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Silas's renewal is driven above all by his own choice to open his heart — Eppie arrives by chance, but choosing to keep, love and raise her is his own doing.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Fortune brings the child to his hearth, but Silas weighs it and chooses to become her father; that choice is what turns a chance event into a redemption, and keeps the change *his*.
   * **WhyWrong:** Chance never forces his hand — the child could have been given up. Treating him as passive removes the choice that makes his rebirth his own, not an accident that happened to him.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the *theft* of Silas's gold *lead to* his renewal? (What is the causal link?)
   * **Options:** A) The theft and the renewal are unconnected events that simply happen in order, B) Losing the hoard empties his life of the dead treasure he worshipped, so that when Eppie wanders in he takes the living child into the void the gold has left, C) The thief returns the gold and Silas is grateful, D) Silas grows richer after the theft and forgets his loneliness
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the emptied hearth makes room for the child, and cold treasure is answered by living love. This causal necessity is what makes the plot a redemptive arc, not a list of events.
   * **Why A:** In a redemption arc events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the whole hinge of the story.
   * **Why C:** The gold is never returned in Silas's time of need; its *loss*, not its recovery, clears the way for Eppie.
   * **Why D:** He gains no wealth — the point is that the *absence* of gold opens him to a love money never gave him.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Silas's renewal — not just the order of events?
   * **Options:** A) A series of unrelated happenings that fall on him by chance, B) Betrayal at Lantern Yard → loss of faith and withdrawal into gold-hoarding → the gold is stolen → Eppie fills the emptied life → raising her draws him back into the community and renews him, C) Each step is caused by pure luck, so nothing Silas does matters, D) The villagers plan his whole recovery from the start
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before — the wound of betrayal drives the isolation, the theft empties it, the child fills it — all resolving in his return to community. That is the redemptive arc.
   * **Why A:** His renewal is not random luck — it is the causal outworking of loss making room for love.
   * **Why C:** His choice to keep and love Eppie is the hinge; removing it erases the causation that is his own.
   * **Why D:** The village does not engineer his recovery — it grows, step by step, from his own care for the child.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that reverses Silas's slide into cold isolation — the hinge of the whole story?
   * **Options:** A) His false accusation at Lantern Yard, B) The night Eppie wanders in from the snow and Silas chooses to keep her, C) Dunstan Cass stealing the gold, D) Godfrey Cass's final confession
   * **Correct:** B
   * **Feedback:** ✓ Correct. Taking in the child is the reversal: from that choice his descent into isolation turns upward into warmth and belonging. That is the redemptive turning point.
   * **Why A:** The betrayal begins his *fall* into isolation; it is the wound, not the moment that reverses it.
   * **Why C:** The theft empties his life and prepares the ground — a necessary cause, but the *turn* comes with Eppie, not the loss.
   * **Why D:** Godfrey's confession comes long after Silas is already renewed; it resolves a loose thread, it does not cause the change.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Silas Marner the events follow by cause and effect — losing the gold empties his life so that Eppie's coming can fill it — not just as a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: the theft clears the way, the child fills the void, and raising her renews him — each event *because of* the last. That causal spine is what makes it a redemption, not a chronicle.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the loss preparing the ground for love — which is the very thing that makes the story a redemptive arc.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel pointedly links the stolen gold with Eppie's golden hair. What does this reveal about its view of what truly enriches a life?
   * **Options:** A) That money and love are equally worthless, B) That living, human love — not dead, hoarded treasure — is what gives a life warmth and worth, C) That Silas remains greedy to the end, D) That wealth should always be shared among neighbours
   * **Correct:** B
   * **Feedback:** ✓ Correct. The warm gold of the child replacing the cold gold of the coins is the novel's whole argument: love, not money, is the true treasure of a life.
   * **Why A:** Love is shown to be precious, not worthless — it is what saves Silas; the two are set in contrast, not levelled.
   * **Why C:** The parallel marks his change *away* from gold-worship, not proof that greed remains.
   * **Why D:** The point is love's redeeming power over treasure, not a lesson about sharing wealth.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Silas moves from bitter solitude back into the life of Raveloe. Which controlling idea does this most explore, and how does it *work*?
   * **Options:** A) That solitude is the happiest state for a person, B) That human belonging heals — a person cut off from others is restored by being drawn back into community, here through caring for Eppie, C) That villages are always cruel to outsiders, D) That Silas was never really alone
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's idea of community works through Eppie: caring for her reconnects Silas to his neighbours, and belonging, not isolation, is what brings him back to life.
   * **Why A:** The book shows solitude as a living death for Silas — the opposite of happiness.
   * **Why C:** Raveloe mistrusts him at first but finally receives him; the movement is towards acceptance, not fixed cruelty.
   * **Why D:** His years of real, bitter isolation are exactly what the theme of belonging heals.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Silas loses his religious faith when his own community betrays him. How does the novel treat faith and trust across the story?
   * **Options:** A) It shows faith is pointless and never returns, B) Faith destroyed by human betrayal is quietly restored through human love — Eppie's care rebuilds the trust in others that Lantern Yard had shattered, C) It shows Silas was never really faithful, D) It shows only wealth can restore a broken man
   * **Correct:** B
   * **Feedback:** ✓ Correct. The wound is human betrayal, and so is the cure: loving and being loved through Eppie rebuilds Silas's trust in others, and with it a quiet faith in life.
   * **Why A:** Trust and faith *do* return through Eppie — the novel affirms restoration, not despair.
   * **Why C:** His devout, trusting life at Lantern Yard is real; it is its betrayal that breaks him.
   * **Why D:** It is love and belonging, not money, that restore him — the gold left him empty.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novel sets living, loving warmth against cold hoarded gold — Eppie's golden hair answering the lost coins — so that love is shown to replace treasure as the true source of worth.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The lost gold and the golden-haired child are deliberately linked: living affection stands against the dead hoard Silas once worshipped, and love proves the real treasure.
   * **WhyWrong:** The parallel is deliberate and central — the child's warmth answers the coins' coldness, dramatising the novel's idea that living love, not money, gives a life worth.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Silas Marner is a redemption story. Why do we feel *hope and relief* by the end, watching Silas restored?
   * **Options:** A) Because we are glad a villain has finally been punished, B) Because a heart frozen by betrayal and greed is thawed — his renewal moves us and quietly promises that no one is beyond change, C) Because we are frightened for Silas throughout, D) Because we are amused by the villagers' gossip
   * **Correct:** B
   * **Feedback:** ✓ Correct. A redemption is built to console: watching a cold, cut-off man brought back to warmth leaves us hopeful and relieved — the faith that even a hardened heart can begin again.
   * **Why A:** Silas is no villain to be punished; the feeling is warmth at his *restoration*, not satisfaction at a downfall.
   * **Why C:** Dread and fear belong to a gothic tale or a tragedy — this story is built to reassure, not to frighten.
   * **Why D:** Passing amusement is not the point; the intended response is hope and tender relief at a life renewed.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A redemption story such as Silas Marner is designed to make the reader feel — above all — which response?
   * **Options:** A) Pity and fear at an inevitable downfall, B) Hope and warm relief, softening into tender empathy — the belief that no heart is beyond change, C) Dread and horror at something monstrous, D) Amusement and light delight
   * **Correct:** B
   * **Feedback:** ✓ Correct. The redemptive arc aims to leave us hopeful and moved: a frozen self reopened to love reassures us that renewal is always possible.
   * **Why A:** Pity and fear are the effects of *tragedy*, where the hero falls — here the movement is a rise from cold to warmth.
   * **Why C:** Dread and horror belong to gothic fiction; Silas Marner is built to console, not to disturb.
   * **Why D:** There is warmth and even joy, but the deep effect is hopeful, tender relief — not mere amusement.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel a tender *ache of empathy* for Silas, not just detached approval that things turned out well?
   * **Options:** A) Because the story names its literary techniques for us, B) Because his lonely, betrayed years are recognisable — we long to believe our own cold, cut-off parts could be warmed too, so his thaw moves us deeply, C) Because we are relieved a dangerous man has been stopped, D) Because we admire how cleverly Silas hoards his gold
   * **Correct:** B
   * **Feedback:** ✓ Correct. The empathy comes from recognition: Silas's frozen isolation is a human state we know, so watching it thaw touches the hope that no one — including us — is past saving.
   * **Why A:** Naming a device is not a feeling; the effect is the tender empathy the story stirs, not the label of a technique.
   * **Why C:** Silas is no danger to be stopped; the feeling is warmth for a suffering man restored, not relief at a threat removed.
   * **Why D:** His gold-hoarding is his sickness, not a skill to admire; we ache for the loneliness behind it.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close we are meant to feel hope and warm relief, softening into empathy — that even a heart frozen by betrayal and greed can be reopened by love.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — relief at Silas restored and tender empathy for the cold years that make the warmth so moving — is the emotional effect a redemption story is built to produce.
   * **WhyWrong:** The intended effect is hope and empathy, not dread or triumph over an enemy; the ending's restored warmth is meant to console and move us, not to satisfy us at someone's defeat.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about what redeems a wasted, lonely life?
   * **Options:** A) That wealth, carefully hoarded, is the surest source of happiness, B) That human love and belonging — not money — restore and redeem a life, and that no heart is beyond change, C) That once a man is betrayed he can never trust again, D) That guilt has no consequences in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Silas's cold, gold-worshipping isolation is redeemed by love and community, not riches — the novel's enduring "so what": affection, not treasure, makes a life, and renewal is always possible.
   * **Why A:** The novel dramatises the opposite — the hoarded gold leaves Silas empty and lonely.
   * **Why C:** Silas's trust *is* rebuilt through Eppie; the message affirms restoration, not permanent bitterness.
   * **Why D:** Godfrey's concealed guilt returns to cost him Eppie's love — wrongdoing is answered in time.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel finally affirm about money set beside human bonds?
   * **Options:** A) That gold can buy back what love has lost, B) That gold cannot fill or redeem a life, while human love and belonging can — a truth sealed when Eppie chooses the father who raised her over Godfrey's wealth, C) That the wealthy always deserve the children they claim, D) That money and love matter equally in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Eppie's choice of Silas over Godfrey's riches is the novel's verdict: love and belonging outweigh money, which could never restore what Silas's heart had lost.
   * **Why A:** Godfrey's wealth cannot win back the daughter his silence gave away — gold buys nothing that love has made.
   * **Why C:** The novel rejects the claim of mere blood-and-money; Eppie belongs to the man who *loved* her.
   * **Why D:** The two are pointedly weighed and love wins — Eppie turns from wealth to the father who raised her.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that no heart is beyond change — even a life frozen by betrayal and greed can be renewed by love.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Silas's thaw from bitter miser to loving father affirms the redemptive faith at the novel's core: a cold, cut-off soul can always be brought back to warmth through the care of others.
   * **WhyWrong:** The novel insists that renewal is possible: Silas's frozen heart *is* reopened by love, which is a central part of its hopeful, redemptive message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about the human soul does the ending affirm?
   * **Options:** A) That a person once hardened stays hardened forever, B) That a soul cut off from others can be brought back to life through love and community — that second chances are real, C) That solitude and gold are all a person truly needs, D) That fate alone decides who is redeemed, whatever they choose
   * **Correct:** B
   * **Feedback:** ✓ Correct. Silas restored to warmth and belonging affirms the novel's redemptive worldview: no one is past saving, and love and community can renew even the most isolated soul.
   * **Why A:** Silas's transformation directly disproves this — the frozen heart *does* thaw.
   * **Why C:** His years of gold and solitude are shown to be a living death, not a sufficiency.
   * **Why D:** Silas's own *choice* to love Eppie drives his renewal; the ending affirms human agency, not blind fate.
