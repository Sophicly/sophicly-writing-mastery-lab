# Foundational Quiz Bank — A Taste of Honey

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. A Taste of Honey is **social realism (kitchen-sink drama)** → the `effects` aspect tests the
audience's **pathos and recognising moral discomfort** — the ache for ordinary lives hemmed in by poverty
and neglect — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`a_taste_of_honey.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: A Taste of Honey

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Jo *changes* across the play — and what drives the change?
   * **Options:** A) She is a bitter, unlikeable girl from the first scene and never really changes, B) She grows from a defended, unloved teenager into a young woman who reaches for love and builds a fragile home of her own — driven by her own longing to escape the neglect she has known, C) She stays exactly the same throughout and is simply a victim of bad luck, D) She is wholly transformed into a contented, secure woman by the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jo's arc is the change: a hardened, unloved girl who reaches for warmth and a home of her own — and the engine is her own longing to escape her mother's neglect, not mere circumstance.
   * **Why A:** She is defensive because she has been starved of love, not fixed in bitterness; the drama lies in her reaching for tenderness, not in unchanging spite.
   * **Why C:** She is not merely unlucky — she actively seeks affection (the Boy, then Geof); reading her as a passive victim erases the choices that drive her.
   * **Why D:** She is not left contented and secure; Helen's return closes the cycle back on her — treating the ending as a happy transformation misreads the play's pathos.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What drives Jo's development, making her more than a passive victim of her circumstances?
   * **Options:** A) Nothing she does matters; Helen decides everything for her, B) Her own reaching for affection — taking up with the Boy, welcoming Geof — is her attempt to build the warmth her mother denied her, so the change is her own doing, C) She is controlled entirely by the men who pass through her life, D) She was always fiercely independent and never needed anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jo's growth is self-authored: starved of care, she actively reaches for love and a home, so the arc is hers — that agency is what lifts her above being merely done-to.
   * **Why A:** Helen shapes her world, but Jo makes her own choices within it; removing her agency turns a rounded figure into a puppet.
   * **Why C:** The Boy and Geof affect her, but she chooses to let them in; she is not simply steered by others.
   * **Why D:** Her whole story is a craving for affection and belonging — reading her as needing no one misses the longing that drives her.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Jo's evolution from beginning to end?
   * **Options:** A) A pampered, well-loved child → a neglected outcast, B) A neglected, defensively hardened girl → an expectant mother who has tasted real tenderness with Geof, yet ends back under Helen's shadow, C) A wealthy young woman → a pauper by the close, D) A devoted daughter → a cruel and heartless mother
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from a loveless, guarded girlhood to fragile tenderness and impending motherhood — only for her mother's return to pull her back toward where she began. That arc IS the pathos.
   * **Why A:** She is never pampered or loved as a child; the neglect is there from the start, so this reverses her actual situation.
   * **Why C:** Jo is poor throughout — the change is emotional, not a fall from wealth.
   * **Why D:** She grows more tender, not crueller; the fear is that Helen's pattern may repeat, not that Jo becomes heartless.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Jo's development is driven above all by her own longing for love and a home — she actively reaches for the affection her mother withheld, rather than merely having things done to her.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Neglect is her starting point, but it is Jo's own reaching — for the Boy, then for the household she builds with Geof — that drives her arc and makes her a rounded figure, not just a victim.
   * **WhyWrong:** Treating Jo as wholly passive removes the longing and the choices that shape her — the very agency that makes her change her own.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Helen's neglect *lead to* Jo's romance with the Boy? (What is the causal link?)
   * **Options:** A) The two are unconnected events that simply happen in order, B) Starved of maternal warmth, Jo craves affection, so when the young sailor offers love she seizes it — her mother's neglect is the cause of her hunger for the Boy, C) Helen orders Jo to find a boyfriend, D) Jo falls for the Boy purely by chance, with no connection to her home life
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: the love Jo is denied at home creates the hunger that draws her to the Boy. That causal link is what makes the plot an arc, not a list of events.
   * **Why A:** In social realism events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** Helen issues no such order; Jo reaches for the Boy out of her own unmet need, not instruction.
   * **Why D:** The romance is rooted in her loveless home, not random chance — the neglect is precisely what makes her vulnerable to the Boy's affection.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Jo's story — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike Jo by bad luck, B) Helen's neglect → Jo's loneliness → brief love with the Boy → pregnancy and abandonment → Geof steps in as carer → Helen returns and Geof leaves → Jo faces motherhood back under her mother's shadow, C) Fate causes each step directly, so nothing follows from the characters' choices, D) The events could be reshuffled in any order without changing the story
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in Helen's neglect. That causal spine — not a chronicle of happenings — is what makes the plot cohere.
   * **Why A:** Jo's troubles are not random misfortune — they are the logical outworking of the neglect at the play's root.
   * **Why C:** There is no fate here; the events flow from character and circumstance, which is exactly what social realism dramatises.
   * **Why D:** Reshuffling the events would break the causal necessity — the loneliness must precede the romance, the abandonment must precede Geof's care.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act near the end is the turning point that threatens the fragile home Jo has built — returning her to where she began?
   * **Options:** A) Jo's first meeting with the Boy, B) Helen's return, which drives Geof to leave and pulls Jo back under her mother's control, C) Geof first moving in to care for Jo, D) Jo's early quarrel with Helen at the start
   * **Correct:** B
   * **Feedback:** ✓ Correct. Helen's reappearance is the pivot: Geof slips away rather than compete with her, and Jo is drawn back into the neglectful mother's orbit — the cycle closing on itself.
   * **Why A:** The meeting with the Boy sets Jo's story going; it is not the point that undoes the home she later builds.
   * **Why C:** Geof moving in *creates* the fragile home; it is Helen's return that threatens it, not its founding.
   * **Why D:** The early quarrel establishes the neglect but is not the turning point that reverses Jo's fragile progress near the close.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In A Taste of Honey the later events follow by cause and effect from Helen's neglect — Jo's loneliness, her romance, and her longing for a family all stem from the maternal warmth she was denied — not a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: each event is *because of* the last, all rooted in the love Jo never received at home. That causal spine is what gives the play its shape.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that turns Jo's story into an arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** What does the relationship between Jo and her mother Helen reveal about the play's view of motherhood?
   * **Options:** A) That motherhood is always devoted and self-sacrificing, B) That maternal love can fail — Helen's self-centred neglect leaves Jo starved of care, and that failure shapes Jo's whole life, C) That mothers and daughters are naturally close, D) That Jo has no mother at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's whole argument about motherhood is embodied in Helen: love that puts itself first and abandons the child, so that the failure of care ripples through everything Jo does.
   * **Why A:** Helen is the opposite of self-sacrificing — the play exposes how far maternal love can fall short, not how devoted it always is.
   * **Why C:** Jo and Helen are estranged and rivalrous, not naturally close; the theme is the *absence* of that bond.
   * **Why D:** Jo does have a mother in Helen — the tragedy is precisely that Helen offers so little.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Jo and Geof build an unconventional household together. Which controlling idea does this most explore, and how does it *work*?
   * **Options:** A) That only blood relatives can form a real family, B) That family and love can be found in unexpected, chosen bonds — care, not convention or blood, is what makes a family, C) That the household is merely a comic mistake, D) That Geof is secretly Jo's real father
   * **Correct:** B
   * **Feedback:** ✓ Correct. The makeshift home Jo and Geof create — built on tenderness rather than blood — quietly argues that family is made by care, gently challenging conventional ideas of what a family should be.
   * **Why A:** The play affirms the opposite — the warmth Jo finds comes from a chosen bond, not a blood one.
   * **Why C:** Their household is tender and genuine, not a joke; reading it as comic misses the real emotional care at its heart.
   * **Why D:** Geof is a caring friend and companion, not a relative — the point is that love here is chosen, not inherited.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which idea does the play most explore through the shabby lodgings and constant money worries — and how does it work?
   * **Options:** A) That poverty is easily escaped by simple hard work, B) That class and poverty are constraints hemming the characters in from outside — shaping choices they cannot fully see or escape, C) That money is unimportant to the characters, D) That the characters are secretly wealthy but mean
   * **Correct:** B
   * **Feedback:** ✓ Correct. The unsettled life in run-down flats keeps poverty constantly before us, dramatising how class and money press on the characters from outside and narrow the lives they can lead.
   * **Why A:** The play shows poverty as a persistent trap, not something willed away by effort — that is its social-realist honesty.
   * **Why C:** Money worries are everywhere in the play; they are central, not incidental, to the characters' constrained world.
   * **Why D:** The characters are genuinely poor, not concealing wealth — their hardship is real and shaping.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The title *A Taste of Honey* is ironic: the scraps of happiness Jo finds prove brief and fragile, expressing the play's theme that in this world joy is fleeting.
   * **Answer:** True
   * **Feedback:** ✓ Correct. A "taste" is something brief and quickly gone; the title captures the play's idea that Jo's moments of sweetness — with the Boy, with Geof — are always passing and precarious.
   * **WhyWrong:** The title is ironic, not literal: it points to how short-lived the characters' happiness turns out to be — a central theme, not a stray detail.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A Taste of Honey is a work of social realism. Why do we feel a pang of *pathos* for Jo by the end, rather than triumph?
   * **Options:** A) Because she is rewarded with wealth and a secure home, B) Because we recognise a life hemmed in by poverty and neglect — she reaches for love and a home yet is left much where she began, and that quiet defeat aches, C) Because the play is a comedy that leaves us laughing, D) Because Jo is a wicked character who deserves her fate
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social realism makes us *recognise* rather than escape: Jo's longing is real and her circumstances close back around her, so the ending lands as a quiet, recognising ache — pathos, not triumph.
   * **Why A:** She wins no wealth or security — reading in a happy reward misses the constrained, unresolved life the play insists on.
   * **Why C:** Amusement belongs to comedy; a social-realist drama built on Jo's hardship aims for a recognising ache, not laughter.
   * **Why D:** Jo is sympathetic, not wicked — the feeling is pity for a constrained life, not satisfaction at a deserved fall.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A social-realist play such as this is designed to make the audience feel — above all — what?
   * **Options:** A) Amusement and delight at a neat, happy ending, B) A recognising ache and moral discomfort — sympathy for ordinary lives constrained by circumstance, and unease that society offers them no rescue, C) Fear and dread at supernatural horror, D) Admiration for a hero's triumphant, clever victory
   * **Correct:** B
   * **Feedback:** ✓ Correct. Realism holds a mirror up to ordinary life: its intended effect is recognition — sympathy and a moral discomfort at lives hemmed in by circumstance, the ending refusing easy comfort.
   * **Why A:** Delight at a tidy ending belongs to comedy; social realism deliberately refuses neat resolution.
   * **Why C:** Dread and horror belong to the gothic; this play's unease is social and human, not supernatural.
   * **Why D:** There is no triumphant hero here — the response is a recognising ache for the constrained, not admiration for a victor.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the warmth between Jo and Geof deepen the play's emotional effect rather than simply cheering us up?
   * **Options:** A) Because it guarantees the play a happy ending, B) Because their tenderness is real yet fragile — its warmth makes Helen's return and Geof's departure all the more poignant, sharpening the ache, C) Because it is meant to make us laugh at the two of them, D) Because it is an example of a dramatic device
   * **Correct:** B
   * **Feedback:** ✓ Correct. The genuine warmth Jo and Geof share is precisely what makes its loss hurt: the sweeter the fragile home, the sharper the pathos when Helen's return breaks it apart.
   * **Why A:** The warmth does not secure a happy ending — it is fragile, and its fragility is what makes it moving.
   * **Why C:** Their bond is tender and sincere, not a joke; reading it as comic misses the pathos it creates.
   * **Why D:** This names a technique instead of the *feeling*; the effect is the deepened ache, not the label for a device.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel pathos and a quiet moral discomfort — sympathy for Jo's constrained life and unease that nothing has truly rescued her — not triumph or amusement.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That recognising ache — sympathy for a life hemmed in by poverty and neglect, and unease at its lack of rescue — is the emotional effect social realism is built to produce, its unresolved ending refusing tidy comfort.
   * **WhyWrong:** The intended effect is pathos and moral discomfort, not triumph or amusement; the play holds a mirror to ordinary hardship rather than rewarding us with a happy resolution.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about love and family?
   * **Options:** A) That only conventional, blood families can offer real love, B) That love and family can be found in unexpected, chosen bonds — and that the marginalised deserve dignity and sympathy — even as poverty and neglect are shown to persist, C) That happiness, once found, is always permanent, D) That the poor bring their troubles entirely on themselves
   * **Correct:** B
   * **Feedback:** ✓ Correct. The warmth Jo finds with Geof insists that family is made by care, not blood, and that ordinary, marginalised lives deserve sympathy — even as the play refuses to pretend poverty and neglect can be easily escaped.
   * **Why A:** The play affirms the opposite — the truest care Jo receives comes from a chosen bond, not a blood family.
   * **Why C:** Its message is that happiness here is fragile and fleeting, not permanent — the honey is only ever "tasted".
   * **Why D:** The play blames circumstance and neglect, not the poor themselves — it asks for sympathy, not judgement.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea does Jo's ending — pregnant and back under Helen's shadow — affirm?
   * **Options:** A) That every problem is neatly solved by the final scene, B) That poverty and neglect tend to repeat across generations unless something breaks the cycle — and society offers little to break it, C) That mothers always reform and make amends in the end, D) That Jo is certain to become a flawless mother
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jo, pregnant and drawn back to the mother who failed her, embodies the play's warning that neglect and poverty tend to repeat down the generations — and that nothing in her world has arrived to break the cycle.
   * **Why A:** Social realism refuses tidy solutions; the ending is deliberately unresolved, mirroring how rarely life grants clean closure.
   * **Why C:** Helen shows little real change; the play offers no neat reform or reconciliation.
   * **Why D:** The play leaves Jo's future uncertain — the fear is that Helen's pattern may repeat, not that Jo is guaranteed to succeed.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that ordinary, marginalised working-class lives deserve to be shown honestly and with dignity — without being sentimentalised or tidily resolved.
   * **Answer:** True
   * **Feedback:** ✓ Correct. By presenting poverty, neglect and a chosen family plainly and without idealising them, Delaney insists that the lives of the poor and marginalised are worthy of serious, unsentimental attention.
   * **WhyWrong:** The play's honesty is deliberate: it refuses to sentimentalise or tidy away hardship, holding these lives up with dignity rather than either pity or a neat resolution.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written by a working-class teenager for the kitchen-sink stage, the play ultimately affirms which idea?
   * **Options:** A) That only the wealthy and powerful are worth dramatising, B) That the lives of the poor and marginalised are worthy of serious, unsentimental attention — a mirror held up to a Britain that preferred to look away, C) That poverty is romantic and enviable, D) That social problems resolve themselves without any change
   * **Correct:** B
   * **Feedback:** ✓ Correct. Delaney's frank Salford world put class, poverty and marginalised lives centre-stage, affirming that such lives deserve serious attention — a mirror held up to a society reluctant to see them.
   * **Why A:** The play's whole boldness lies in dramatising the poor and marginalised, not the wealthy or powerful.
   * **Why C:** Poverty here is a constraint and a hardship, not something romanticised or enviable.
   * **Why D:** The play insists that these problems persist unless something changes — it offers no comforting self-resolution.
