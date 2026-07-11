# Foundational Quiz Bank — Twelfth Night

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Twelfth Night is a **romantic comedy** → the `effects` aspect tests the audience's **delight,
warmth and relief** — the pleasure of disorder resolved — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`twelfth_night.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Twelfth Night

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Viola *changes* across the play — and what drives the change?
   * **Options:** A) She is confident and settled from the first scene and never really changes, B) She begins a grief-stricken, shipwrecked survivor and, through her own choice to disguise herself and serve faithfully while trusting time, moves to a woman openly united in love, C) She is simply carried from misfortune to happiness by the accident of the shipwreck, with no say in it, D) She schemes from the outset to trap Orsino into marriage
   * **Correct:** B
   * **Feedback:** ✓ Correct. The comedy is the *journey*: alone and mourning, Viola chooses disguise and patient service, and by faith and wit — not chance — she reaches open, requited love.
   * **Why A:** She starts bereft and vulnerable, washed ashore believing her brother drowned; the play lies in her transformation, not in fixed composure.
   * **Why C:** The wreck is only the starting accident — the change is driven by her *choices* to disguise, to serve, and to wait, which is what makes her the heroine rather than a passenger of fate.
   * **Why D:** She has no scheme; she falls in love and endures it silently — treating her as a plotter misreads her constancy.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Viola the play's true *heroine* rather than merely a lucky survivor of the shipwreck?
   * **Options:** A) She does nothing and is simply rescued by good fortune, B) She actively steers her own fate — choosing disguise for safety, serving Orsino, and trusting time to "untangle" the knot rather than forcing it, C) She is a passive victim whom the other characters rescue, D) She wins by cruelly deceiving everyone for her own gain
   * **Correct:** B
   * **Feedback:** ✓ Correct. A comic heroine shapes her own story: Viola's wit and self-command turn a hopeless wreck into a path through disguise to love — her agency, not luck, drives her happy end.
   * **Why A:** Good fortune sets the scene, but it is her decisions — to disguise, to serve, to endure — that carry her through.
   * **Why C:** She is resourceful, not rescued; she makes a place for herself in Orsino's court by her own action.
   * **Why D:** Her disguise protects her and, far from cruel, causes her real pain as she woos Olivia for the man she loves.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Viola's evolution from beginning to end?
   * **Options:** A) A scheming trickster at the start → an exposed liar at the end, B) A shipwrecked stranger in disguise who sighs "O time, thou must untangle this, not I" → a woman revealed as herself and united with Orsino, C) A wealthy noblewoman at the start → a lonely servant at the end, D) A widow mourning at the start → a nun by the close
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from concealed, isolated outsider — placing her faith in time — to openly herself and loved. That patient, self-chosen arc IS her comic journey.
   * **Why A:** She is no trickster; she deceives only to survive, and the ending vindicates rather than exposes her.
   * **Why C:** She serves as a page by choice for safety and rises to marriage — this reverses her actual arc.
   * **Why D:** It is Olivia who mourns a brother; Viola disguises herself and ends in marriage, not the cloister.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Viola's journey is driven above all by her own choices — the disguise she adopts and her decision to serve Orsino faithfully and trust time — not merely by the accident of the shipwreck.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The wreck strands her, but her *choices* — to disguise, to serve, to wait rather than force events — are what carry her to love, which is what makes her the heroine rather than fate's passenger.
   * **WhyWrong:** The shipwreck only begins her story; treating her as swept along by chance erases the agency — the disguise, the service, the patient faith — that actually drives her comic arc.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Viola's disguise as "Cesario" *lead to* the play's central tangle of love? (What is the causal link?)
   * **Options:** A) The disguise has no real effect on the plot, B) Disguised as a man, Viola is sent to woo Olivia for Orsino — so Olivia falls for "Cesario", while Viola loves Orsino, tying a knot none of them can undo, C) The disguise makes Olivia fall in love with Orsino, D) Everyone sees through the disguise at once, so nothing follows from it
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: the disguise puts Viola in Orsino's service, which sends her to Olivia, which makes Olivia love the wrong person — a chain of consequence, not a string of coincidences.
   * **Why A:** The disguise is the engine of the whole plot; removing it removes the comedy.
   * **Why C:** Olivia is drawn to Cesario, not Orsino — mistaking who loves whom breaks the causal chain.
   * **Why D:** No one penetrates the disguise until the twins meet; the confusions *depend* on it holding.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* that resolves the comedy — not just the order of events?
   * **Options:** A) A series of lucky accidents that happen to sort themselves out, B) Viola's disguise tangles the loves → the twin Sebastian arrives and is mistaken for Cesario → Olivia marries him → the twins meet and are recognised → every confusion is unknotted, C) The characters simply decide to marry for no particular reason, D) Malvolio's trick is what pairs off all the lovers
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage follows by necessity from the last: the disguise creates the knot, Sebastian's arrival makes untangling possible, and recognition of the twins releases every couple into marriage.
   * **Why A:** The resolution is not random luck — it turns on the necessary arrival and recognition of the identical twin.
   * **Why C:** The marriages are the logical outcome of the tangle being unpicked, not arbitrary choices.
   * **Why D:** Malvolio's gulling is a comic sub-plot; it is Sebastian, not the letter, that resolves the loves.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which event is the turning point that makes the comedy's happy resolution possible — the moment the knot can finally be untied?
   * **Options:** A) Orsino's opening speech about music and love, B) The arrival of Sebastian, Viola's identical twin, in Illyria, C) Maria's forging of the letter to Malvolio, D) Feste's closing song
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sebastian's arrival is the hinge: only a second, identical twin lets Olivia marry "Cesario" for real and lets recognition unmask Viola — everything resolves from this.
   * **Why A:** The opening speech sets the mood of love-sickness but resolves nothing; the knot is not yet even tied.
   * **Why C:** The letter drives the Malvolio sub-plot, not the resolution of the central loves.
   * **Why D:** Feste's song closes the play *after* the resolution; it reflects on it rather than causing it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Twelfth Night the final marriages follow by cause-and-effect — the arrival of the twin Sebastian, mistaken for Cesario, is what necessarily unlocks the knot — rather than being a string of lucky coincidences.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Comic plot, like tragic, runs on necessity: the disguise ties the knot and only the identical twin can loose it, so recognition — not chance — releases every couple into marriage.
   * **WhyWrong:** Reading the ending as lucky accident misses the causal spine — the disguise makes the tangle, and Sebastian's arrival is precisely what makes untangling possible.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Orsino opens the play "If music be the food of love, play on". What does this reveal about the play's view of love?
   * **Options:** A) That love is always steady, selfless and simple, B) That love has many faces — here a self-indulgent appetite fed for its own sake — set against Viola's true constancy, so the play weighs love's forms against one another, C) That love does not matter in the play, D) That only Orsino is capable of love
   * **Correct:** B
   * **Feedback:** ✓ Correct. Treating love as an "appetite" to be fed, Orsino embodies self-regarding passion; the play sets his showy longing beside Viola's quiet constancy, examining what real love is.
   * **Why A:** The play's whole point is that love takes many, often foolish, forms — Orsino's is anything but simple and steady.
   * **Why C:** Love is the play's central subject; the line announces it.
   * **Why D:** Many characters love — Viola, Olivia, Malvolio in his vanity — and the play compares their loves.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Viola tells Olivia "I am not what I am". Which controlling idea does the play explore through moments like this?
   * **Options:** A) That appearances always match reality, B) That surfaces deceive — disguise and mistaken identity repeatedly fool the characters, exposing the gap between how things look and what is true, C) That the weather governs the plot, D) That honesty is impossible for anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Viola's disguise, the confusion of the twins and the gulling of Malvolio all turn on the gulf between appearance and reality — a controlling idea that shapes the whole comedy.
   * **Why A:** The play repeatedly shows appearances *misleading* its characters, the opposite of matching reality.
   * **Why C:** The line concerns disguised identity, not literal weather.
   * **Why D:** Viola conceals for safety, but the play prizes true feeling; it dramatises deception, not its impossibility.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Feste claims it is "better a witty fool than a foolish wit". Which idea does the play most explore through him, and how does it *work*?
   * **Options:** A) That fools are simply stupid and there to be laughed at, B) That true wisdom often wears the fool's motley — the licensed jester sees more clearly than the self-important people around him, C) That cleverness is always rewarded with wealth, D) That Feste is the play's villain
   * **Correct:** B
   * **Feedback:** ✓ Correct. Feste's paradox inverts folly and wisdom: it is the "fool" who reads the others truly, while the self-serious — Malvolio above all — deceive themselves. Wisdom-in-folly runs through the comedy.
   * **Why A:** The play's whole joke is that the fool is the wise one and the "wits" are foolish.
   * **Why C:** Feste earns coins, but the theme is clear-sightedness, not riches.
   * **Why D:** Feste is a shrewd commentator and entertainer, not a villain.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** Twelfth Night sets festive "misrule" — a world of disguise, revelry and overturned order — against the joyless self-importance of Malvolio, and takes the side of generous good humour.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The holiday spirit of topsy-turvy misrule licenses the comedy's disguises and revels; Malvolio's puritan pomposity opposes it — "cakes and ale" — and the play sides with festive generosity over killjoy vanity.
   * **WhyWrong:** The comedy embraces festive disorder and good humour and mocks Malvolio's joyless self-regard — his "there shall be no more cakes and ale" is exactly the spirit the play resists.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Twelfth Night is a romantic comedy. Why do we feel *delight and warmth* at the ending, despite all the confusion along the way?
   * **Options:** A) Because we feel pity and fear at a hero's ruin, B) Because the tangled disguises and mistaken loves are unravelled into marriages — the pleasure of disorder resolved into harmony, C) Because the play ends in death and loss, D) Because we admire the cleverness of the disguise as a stage device
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy is built to make us *feel* the joy of resolution: the knot we watched tighten is happily untied, and confusion gives way to union — leaving warmth and relief.
   * **Why A:** Pity and fear belong to tragedy; a comedy that left us frightened would fail its purpose.
   * **Why C:** No one dies; the play closes in marriage and reconciliation, not loss.
   * **Why D:** This names a *technique* (the disguise device) instead of the feeling — the effect is delight at disorder resolved, not admiration of a stage trick.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A romantic comedy such as Twelfth Night is designed to make the audience feel — above all — which response?
   * **Options:** A) Dread and horror, B) Delight, warmth and relief as festive disorder resolves into harmony, C) Confusion and boredom, D) The satisfaction of naming its dramatic devices
   * **Correct:** B
   * **Feedback:** ✓ Correct. Since its roots in classical comedy, the form aims to move us from tangle to resolution and send us out warmed — the pleasure of a disordered world set right in marriage and reconciliation.
   * **Why A:** Dread and horror are the effects of gothic or tragedy, not the warmth a comedy seeks.
   * **Why C:** Confusion and boredom mark a *failed* comedy, not its aim.
   * **Why D:** Spotting devices is not a feeling; the intended response is emotional delight, not technical analysis.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** As we watch Malvolio, in yellow stockings and fixed smile, deceive himself over the forged letter, why do we feel *amused delight* rather than pity or dread?
   * **Options:** A) Because we are afraid of what Malvolio will do next, B) Because we know the letter is a trick while he does not — so his self-important vanity leading him on is comic to us, not frightening, C) Because we feel deep sorrow for his ruin, D) Because the scene names a clever theatrical device for us to admire
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comic pleasure here is knowing more than the character: we watch vanity trip itself up in absurd yellow stockings, and the gap between his certainty and the truth makes us laugh, not fear.
   * **Why A:** There is no threat to dread; the pleasure is in his harmless self-entrapment.
   * **Why C:** His comeuppance is played for laughter, not grief — sorrow would be the response to tragedy.
   * **Why D:** This substitutes admiration of a device for the *feeling*; the effect is delighted amusement at self-deception exposed.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel warmth, delight and relief as the confusions are resolved into marriage — the bittersweet notes, such as Feste's "the rain it raineth every day", deepening rather than destroying the comic pleasure.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That warm relief — disorder happily resolved into union — is the effect a romantic comedy is built to produce; the shadow of melancholy enriches the delight rather than souring it.
   * **WhyWrong:** The intended effect is delight and warmth at disorder resolved, not dread or grief; the wistful notes give the joy depth, they do not turn the comedy tragic.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about love?
   * **Options:** A) That love should be avoided as foolish and dangerous, B) That love, however foolish or misdirected it first appears, is a generous force that — given time and good humour — rights itself and knits the community together in marriage, C) That love is only ever self-deception with no worth, D) That only the powerful deserve to marry
   * **Correct:** B
   * **Feedback:** ✓ Correct. Orsino's self-love and Olivia's misplaced passion are gently corrected; the comedy affirms that love's tangles are fertile, and that time and generosity lead them to true union — its enduring "so what".
   * **Why A:** The play celebrates love and ends in marriage; it does not warn us off it.
   * **Why C:** Some loves begin in self-deception, but Viola's constancy shows the play values true love, not dismisses it.
   * **Why D:** Love crosses rank here — a shipwrecked "servant" weds a duke — so worth, not power, wins the day.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea does the play affirm through the festive spirit of "misrule" — a world of disguise and revelry that is finally set right?
   * **Options:** A) That order, once overturned, can never be restored, B) That a season of playful disorder is fertile, not destructive — confusion and disguise give way to renewed harmony and right order, C) That chaos should be embraced permanently, D) That authority must always crush festivity
   * **Correct:** B
   * **Feedback:** ✓ Correct. Like the holiday it is named for, the play lets order be joyfully overturned — then restored, richer for it: the tangle of disguise resolves into marriage and reconciliation.
   * **Why A:** Order *is* restored — the whole close reunites and pairs the characters.
   * **Why C:** The disorder is a temporary, licensed release, not a permanent state; it ends in harmony.
   * **Why D:** The play sides with festivity *against* joyless authority — Malvolio, who would crush it, is mocked.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that joyless self-importance is the enemy of festive generosity — Malvolio's puritan vanity is exposed and laughed down, while good-humoured love and revelry are affirmed.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Sir Toby's "cakes and ale" and Malvolio's humiliation dramatise the play's verdict: self-regarding, killjoy pride is the enemy of the generous, forgiving spirit the comedy celebrates.
   * **WhyWrong:** The play affirms warm, festive generosity and mocks Malvolio's joyless vanity — his self-importance is precisely what it exposes and laughs down.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human desire does the ending ultimately affirm?
   * **Options:** A) That desire is doomed to end in loss, B) That desire, briefly disordered by disguise and mistaken identity, finds its true match when given time — and that good humour untangles what force cannot, C) That people should never trust their feelings, D) That identity is fixed and disguise changes nothing
   * **Correct:** B
   * **Feedback:** ✓ Correct. "O time, thou must untangle this, not I" is the play's wisdom: forced solutions fail, but patience and good humour let misdirected desire find its rightful partner and order renew itself.
   * **Why A:** Desire ends in marriage and harmony here, not loss — that is comedy's promise.
   * **Why C:** Viola's steadfast feeling is vindicated; the play trusts true love, however tangled its path.
   * **Why D:** Disguise disorders the whole of Illyria — identity is fluid enough to drive the plot, until recognition restores it.
