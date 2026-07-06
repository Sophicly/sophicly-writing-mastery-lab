# Foundational Quiz Bank — Edexcel Relationships Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
45 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. Unlike
the universal forms bank (`poetic_forms.md`, Tier A), these are poem-specific, testing what the
student has actually read. The picker draws a random 5 per round, stratified across categories.
Keys + feedback live server-side and are stripped before questions reach the client. The AI is
never the scorekeeper.

Categories: Recognising the Poem · Form & Features · Meaning & Effects
Types: MCQ · Fill · True-False · Select All

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the
course's reading order, so the quiz only serves poems the student has read:
- **@set:1** — She Walks in Beauty (Byron) · Sonnet 43 (Elizabeth Barrett Browning) · Valentine (Carol Ann Duffy) · i wanna be yours (John Cooper Clarke) · 1st Date – She / 1st Date – He (Wendy Cope)
- **@set:2** — La Belle Dame Sans Merci (John Keats) · My Last Duchess (Robert Browning) · Neutral Tones (Thomas Hardy) · Love's Dog (Jen Hadfield) · A Complaint (William Wordsworth)
- **@set:3** — A Child to his Sick Grandfather (Joanna Baillie) · One Flesh (Elizabeth Jennings) · Nettles (Vernon Scannell) · The Manhunt (Simon Armitage) · My Father Would Not Show Us (Ingrid de Kok)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Edexcel Relationships Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens with the line "She walks in beauty, like the night / Of cloudless climes and starry skies"?
   * **Options:** A) She Walks in Beauty, B) Sonnet 43, C) Neutral Tones, D) One Flesh
   * **Correct:** A
   * **Feedback:** ✓ Correct. Byron's "She Walks in Beauty" opens with this famous comparison, likening his subject's beauty to a clear, starlit night.
   * **Why B:** Sonnet 43 opens "How do I love thee? Let me count the ways", not a night-sky image.
   * **Why C:** Neutral Tones opens beside a wintry pond, not a starlit night.
   * **Why D:** One Flesh opens with an ageing couple lying apart, not a starry comparison.

2. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** "She Walks in Beauty" is a romantic [BLANK] — a short, musical poem of personal feeling celebrating beauty.
   * **Answer:** lyric
   * **Feedback:** ✓ Correct. The smooth, musical lyric form matches Byron's harmonious praise of his subject's beauty.
   * **WhyWrong:** The word is "lyric" — a romantic lyric, its musical flow suiting the celebration of beauty.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What idea about beauty does Byron develop across "She Walks in Beauty"?
   * **Options:** A) That beauty is only skin-deep and untrustworthy, B) That outer beauty and inner goodness exist in perfect harmony together, C) That beauty always fades with age, D) That beauty is a source of conflict between rivals
   * **Correct:** B
   * **Feedback:** ✓ Correct. Byron presents his subject's outer beauty as a harmonious blend of "dark and bright", mirrored by "A mind at peace with all below, / A heart whose love is innocent" — beauty and goodness united.
   * **Why A:** The poem insists beauty and virtue are matched, not that beauty is deceptive.
   * **Why C:** The poem celebrates a single moment of harmony, not the passage or loss of beauty.
   * **Why D:** There is no rival or conflict; the poem is a calm, admiring tribute.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem begins "How do I love thee? Let me count the ways", listing the many forms the speaker's love takes?
   * **Options:** A) Sonnet 43, B) She Walks in Beauty, C) Valentine, D) A Complaint
   * **Correct:** A
   * **Feedback:** ✓ Correct. Barrett Browning's "Sonnet 43" opens with this famous question, then itemises her love "to the depth and breadth and height / My soul can reach".
   * **Why B:** She Walks in Beauty praises a single vision of beauty, not a counted list of loves.
   * **Why C:** Valentine offers an onion instead of clichéd tokens, not a counted declaration.
   * **Why D:** A Complaint mourns a love that has dried up, the opposite of this poem's overflowing devotion.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Elizabeth Barrett Browning use for "Sonnet 43", and how is it shaped?
   * **Options:** A) A ballad with a repeating refrain, B) A Petrarchan sonnet, its structure giving order to an outpouring of devotion, C) Free verse with no rhyme, D) A dramatic monologue to a silent listener
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sonnet 43 is a Petrarchan sonnet, its disciplined fourteen lines channelling and intensifying the speaker's declaration of love.
   * **Why A:** There is no song-like refrain; the fourteen-line sonnet form is fixed, not a ballad.
   * **Why C:** The poem keeps a set rhyme and structure, so it is not free verse.
   * **Why D:** The speaker addresses her beloved directly as "thee", not a silent listener overheard by a reader.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "Sonnet 43", the sonnet's disciplined structure is used to intensify, rather than restrain, the speaker's overflowing devotion.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The tight form of the sonnet channels Barrett Browning's expanding list of loves — "to the depth and breadth and height" — so the structure amplifies rather than limits the feeling.
   * **WhyWrong:** This is the poem's effect — the sonnet's order intensifies rather than restrains the speaker's overflowing love.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem offers an onion instead of "a red rose or a satin heart" as a symbol of love?
   * **Options:** A) Valentine, B) i wanna be yours, C) Sonnet 43, D) La Belle Dame Sans Merci
   * **Correct:** A
   * **Feedback:** ✓ Correct. Duffy's "Valentine" rejects conventional gifts, offering an onion whose layers and sting stand for love's complexity.
   * **Why B:** i wanna be yours lists everyday objects like a vacuum cleaner or electric meter, not an onion.
   * **Why C:** Sonnet 43 counts abstract ways of loving, without a central object like an onion.
   * **Why D:** La Belle Dame Sans Merci is a ballad of enchantment, with no love-token at all.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the free verse form of "Valentine" serve Duffy's purpose?
   * **Options:** A) It imposes strict rhyme to make the poem sound like a greetings-card verse, B) Its loose, conversational lines reject conventional romantic form to match the poem's rejection of clichéd love tokens, C) It follows a strict ballad refrain, D) It uses a fixed sonnet structure to argue a case
   * **Correct:** B
   * **Feedback:** ✓ Correct. The free verse, unrhymed and direct, matches Duffy's refusal of the neat, sentimental clichés she sets out to reject.
   * **Why A:** The poem's whole point is to avoid greetings-card sentiment, not to sound like one.
   * **Why C:** There is no repeating refrain-driven ballad narrative.
   * **Why D:** The poem deliberately avoids the ordered argument of a fixed sonnet.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the onion come to represent across "Valentine"?
   * **Options:** A) A love that is simple and untroubled, B) A love that is honest, layered, and capable of both tenderness and pain, C) A love that has already ended, D) A love that is purely comic
   * **Correct:** B
   * **Feedback:** ✓ Correct. The onion's layers, its power to "blind you with tears", and its lingering "cling to your knife" present love as honest and layered — capable of tenderness and hurt together.
   * **Why A:** The extended metaphor insists love is complicated, not simple.
   * **Why C:** The poem offers the onion as a present-tense gift, not a memorial to a lost love.
   * **Why D:** The tone turns serious and even threatening ("Lethal"), not comic.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem repeats the plea "I wanna be yours", picturing the speaker as everyday objects such as a vacuum cleaner or an electric meter?
    * **Options:** A) i wanna be yours, B) Valentine, C) Sonnet 43, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Cooper Clarke's "i wanna be yours" builds its devotion from ordinary household objects, driven by the insistent refrain "I wanna be yours".
    * **Why B:** Valentine centres on a single symbol, the onion, not a catalogue of household objects.
    * **Why C:** Sonnet 43 counts abstract ways of loving rather than picturing the speaker as objects.
    * **Why D:** The Manhunt traces a partner's injuries after war, with no household-object imagery.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** What technique structures "i wanna be yours"?
    * **Options:** A) A single unbroken argument in blank verse, B) A list-like, chant-like repetition of "I don't wanna be... / I wanna be...", building through everyday objects to the refrain "I wanna be yours", C) A strict Petrarchan octave and sestet, D) A silent listener addressed throughout, as in a dramatic monologue
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's insistent, list-like repetition gives it a chant-like, performance-poem energy, building through household objects towards its refrain.
    * **Why A:** The poem is built from repeated short lines and a refrain, not one continuous argument.
    * **Why C:** There is no octave-sestet turn; the poem is looser and more song-like.
    * **Why D:** There is no silent listener being addressed as in a dramatic monologue — the poem speaks directly to "you".

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** In "i wanna be yours", the everyday, unglamorous objects the speaker compares himself to (an electric meter, a vacuum cleaner) suggest a devotion that is constant and practical rather than grand or traditionally poetic.
    * **Answer:** True
    * **Feedback:** ✓ Correct. By choosing ordinary household objects rather than roses or stars, Cooper Clarke presents devotion as steady, useful and everyday rather than an idealised, traditional romantic image.
    * **WhyWrong:** This is the poem's effect — the mundane objects present love as constant and practical, a deliberate contrast with traditional romantic imagery.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem gives the same first date twice, once from a hopeful woman's viewpoint and once from a more detached man's, so the reader sees the mismatch between them?
    * **Options:** A) 1st Date – She and 1st Date – He, B) One Flesh, C) Neutral Tones, D) A Complaint
    * **Correct:** A
    * **Feedback:** ✓ Correct. Cope's paired poems present the identical evening from two contrasting first-person perspectives, exposing the gap between the woman's hope and the man's detachment.
    * **Why B:** One Flesh reflects on a long, faded marriage, not a single first date told twice.
    * **Why C:** Neutral Tones recalls the end of a relationship beside a pond, not a paired first-date structure.
    * **Why D:** A Complaint mourns love that has already dried up, not a first meeting.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is the pairing of "1st Date – She" and "1st Date – He" structured?
    * **Options:** A) As two independent poems with no connection, B) As matching, parallel monologues describing the same event, so the reader can directly compare each speaker's private thoughts, C) As a single ballad narrated by an outside voice, D) As a strict Petrarchan sonnet pair
    * **Correct:** B
    * **Feedback:** ✓ Correct. Cope deliberately mirrors the two poems' structure and setting so the reader measures one speaker's private hopes directly against the other's private indifference.
    * **Why A:** The poems are designed to be read together, their parallel structure inviting direct comparison.
    * **Why C:** There is no single outside narrator; each poem is a distinct first-person voice.
    * **Why D:** The poems are conversational free verse, not fixed-form sonnets.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "1st Date – She" and "1st Date – He"?
    * **Options:** A) They reveal a mismatch between the woman's hopeful investment in the date and the man's more casual, detached attitude, B) The ironic contrast between the two viewpoints creates the poem's wry, comic effect, C) Reading both perspectives together lets the reader judge the gap between private feeling and outward behaviour, D) Both speakers openly reveal their true feelings to each other during the date
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Cope's paired structure exposes the mismatch between hope and detachment, generates gentle irony and comedy, and lets the reader judge a gap neither speaker admits openly.
    * **Why D:** Neither speaker voices their private feelings to the other — the reader alone sees both sides.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem tells of a knight found "Alone and palely loitering" after meeting a beautiful, otherworldly lady in the meadows?
    * **Options:** A) La Belle Dame Sans Merci, B) My Last Duchess, C) Neutral Tones, D) A Complaint
    * **Correct:** A
    * **Feedback:** ✓ Correct. Keats's "La Belle Dame Sans Merci" finds a knight left desolate after his encounter with an enchanting lady who later abandons him.
    * **Why B:** My Last Duchess is a Duke's monologue about a portrait, not an enchanted knight.
    * **Why C:** Neutral Tones recalls a real, failed relationship beside a pond, without any faery figure.
    * **Why D:** A Complaint mourns love's decline in plain, personal terms, without any ballad enchantment.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "La Belle Dame Sans Merci" is written in which form?
    * **Options:** A) A ballad, its narrative stanzas and repetition building a haunting, dreamlike story, B) A dramatic monologue to a silent listener, C) A Petrarchan sonnet, D) Free verse with no set rhyme
    * **Correct:** A
    * **Feedback:** ✓ Correct. Keats uses the ballad form, its rhythmic stanzas and eerie repetition suiting the poem's dreamlike tale of enchantment and abandonment.
    * **Why B:** The poem narrates a story rather than exposing one speaker's mind to a silent listener.
    * **Why C:** It runs across many stanzas, not a fourteen-line sonnet.
    * **Why D:** The ballad keeps a regular rhyme and metre, unlike free verse.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the knight's fate at the end of "La Belle Dame Sans Merci" suggest about the lady's power over him?
    * **Options:** A) That she has healed and restored him, B) That love and desire can enchant, then leave a person desolate and trapped in longing, C) That the knight was never truly affected by her, D) That the poem celebrates a happy ending
    * **Correct:** B
    * **Feedback:** ✓ Correct. Left "palely loitering" long after she vanishes, the knight is caught in the trance of a love that enchanted then abandoned him, haunted rather than healed.
    * **Why A:** He is found withered and ill, not restored.
    * **Why C:** The pale, sick knight is clearly still in her thrall.
    * **Why D:** The knight's desolate state is the opposite of a happy ending.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a Duke show a visitor a portrait of his dead wife, letting slip that he had her killed for smiling too readily at others?
    * **Options:** A) My Last Duchess, B) La Belle Dame Sans Merci, C) One Flesh, D) Nettles
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's "My Last Duchess" has the Duke display his late wife's portrait, revealing that "I gave commands; / Then all smiles stopped together".
    * **Why B:** La Belle Dame Sans Merci concerns a knight and an enchantress, not a Duke and a portrait.
    * **Why C:** One Flesh reflects on an ageing couple's faded marriage, not a murdered Duchess.
    * **Why D:** Nettles concerns a father's fury at his son's injury, not a Duke's confession.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "My Last Duchess" is a dramatic [BLANK], its rhyming couplets smoothed by enjambment so the Duke sounds calm even as his menace surfaces.
    * **Answer:** monologue
    * **Feedback:** ✓ Correct. The dramatic monologue lets the Duke's controlled, flowing speech gradually expose the cold cruelty beneath it.
    * **WhyWrong:** The word is "monologue" — a dramatic monologue, whose smooth couplets let the Duke's menace surface almost by accident.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the dramatic monologue form reveal about the Duke in "My Last Duchess"?
    * **Options:** A) That he is a modest, self-effacing man, B) That beneath his composed, cultured speech lies a controlling, possessive cruelty, C) That he deeply regrets his wife's death, D) That he has no interest in status or possessions
    * **Correct:** B
    * **Feedback:** ✓ Correct. The Duke's calm, cultivated words let slip his obsession with control and status, exposing the menace behind his politeness.
    * **Why A:** His pride in his "nine-hundred-years-old name" and possessions is the opposite of modesty.
    * **Why C:** He voices no remorse, only irritation at his wife's warmth towards others.
    * **Why D:** His entire speech is preoccupied with rank, ownership and appearances.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls standing "by a pond that winter day", with a sun "white, as though chidden of God", as a relationship ends?
    * **Options:** A) Neutral Tones, B) A Complaint, C) She Walks in Beauty, D) La Belle Dame Sans Merci
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "Neutral Tones" sets a relationship's cold end beside a wintry pond under a pale, reproached sun.
    * **Why B:** A Complaint mourns a love already lost using a fountain metaphor, without this pond setting.
    * **Why C:** She Walks in Beauty is a joyful tribute to beauty, not a bleak farewell.
    * **Why D:** La Belle Dame Sans Merci is set in enchanted meadows, not by a winter pond.

23. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Neutral Tones" is a reflective lyric written in regular quatrains, its measured, controlled form suiting Hardy's disillusionment with love.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The controlled, grey quatrains mirror Hardy's bleak, restrained reflection on a love that has faded to nothing.
    * **WhyWrong:** This is true — the reflective lyric's measured quatrains suit the poem's controlled, melancholic tone.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the pond scene come to symbolise by the end of "Neutral Tones"?
    * **Options:** A) A moment of renewed hope for the couple, B) The lasting, bitter lesson that love can deceive, fixed permanently in the speaker's memory, C) A celebration of a new relationship, D) A scene the speaker has since forgotten
    * **Correct:** B
    * **Feedback:** ✓ Correct. The "keen lessons that love deceives" fix the pond, the sun and the "grayish leaves" permanently in the speaker's memory as an emblem of love's disillusionment.
    * **Why A:** The scene is one of ending and disillusionment, not renewed hope.
    * **Why C:** The poem mourns a loss, not a fresh beginning.
    * **Why D:** The final stanza insists the memory has shaped him ever since — it is not forgotten.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem builds an extended comparison between love and a dog, exploring loyalty, training and the difficulty of taming something wild?
    * **Options:** A) Love's Dog, B) i wanna be yours, C) Sonnet 43, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hadfield's "Love's Dog" develops love through the sustained image of a dog, weighing its loyalty and affection against its unruly, untameable instincts.
    * **Why B:** i wanna be yours pictures the speaker as household objects, not as a dog.
    * **Why C:** Sonnet 43 uses abstract counting rather than an animal conceit.
    * **Why D:** The Manhunt traces a partner's war wounds, with no dog imagery.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does "Love's Dog" use its central animal image?
    * **Options:** A) As a brief, one-line simile with no further development, B) As a sustained, extended metaphor running through the poem, using the dog's behaviour to explore the demands of love, C) As a strict refrain repeated unchanged in every stanza, D) As a direct address to a silent listener, as in a dramatic monologue
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hadfield develops the dog comparison as a sustained, extended metaphor, returning to the animal's behaviour to think through love's mix of devotion and difficulty.
    * **Why A:** The image is built up and returned to, not used just once.
    * **Why C:** The poem develops and varies the image rather than repeating one fixed refrain.
    * **Why D:** The poem reflects on love in general terms; it is not a monologue addressed to one silent figure.

27. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Love's Dog", the comparison between love and a dog suggests that love, like an animal, needs patience and care but can never be fully controlled.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The dog conceit captures love as something that responds to devotion and care yet keeps an unpredictable, untameable side.
    * **WhyWrong:** This is the poem's central idea — love, like the dog, rewards care and patience but resists total control.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem mourns that a love which once flowed freely, "a fountain at my fond heart's door", has now dried into "a comfortless and hidden well"?
    * **Options:** A) A Complaint, B) Neutral Tones, C) One Flesh, D) Valentine
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth's "A Complaint" mourns love's change from a freely flowing fountain to a hidden, comfortless well.
    * **Why B:** Neutral Tones uses a pond and a fading sun as its central images, not a fountain-and-well metaphor.
    * **Why C:** One Flesh reflects on a long marriage grown quiet, not a dried-up fountain.
    * **Why D:** Valentine's central image is an onion, not a fountain of love.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What technique structures Wordsworth's "A Complaint"?
    * **Options:** A) A dramatic monologue exposing a Duke's cruelty, B) A controlled lyric built on an extended metaphor, contrasting love as a once-flowing fountain with love as a hidden, comfortless well, C) A ballad narrating an enchanted knight's fate, D) Free verse rejecting all traditional imagery
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's short, disciplined stanzas develop the fountain-to-well metaphor, giving ordered shape to the speaker's grief over changed love.
    * **Why A:** There is no Duke or silent listener; the speaker addresses the change in love itself.
    * **Why C:** There is no ballad narrative or enchanted figure.
    * **Why D:** The poem keeps a regular, traditional metre and rhyme rather than free verse.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "A Complaint"?
    * **Options:** A) The poem mourns a love that has changed from generous and open to guarded and diminished, B) The fountain-to-well metaphor conveys a sense of loss and quiet grief, C) The poem presents the change in love as something the speaker regrets rather than welcomes, D) The poem celebrates a love that has grown stronger over time
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Wordsworth's poem regrets a love that has narrowed from an open, giving fountain into a hidden well, its quiet grief carried by that central metaphor.
    * **Why D:** The poem laments diminished love; it does not celebrate growth.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is spoken by a child trying gently to comfort a dying grandfather, recalling happier times together?
    * **Options:** A) A Child to his Sick Grandfather, B) My Father Would Not Show Us, C) Nettles, D) One Flesh
    * **Correct:** A
    * **Feedback:** ✓ Correct. Baillie's poem gives voice to a child addressing a sick grandfather directly, offering comfort and remembered affection as he nears death.
    * **Why B:** My Father Would Not Show Us is narrated by an adult recalling a father's decision, not a child comforting a grandfather.
    * **Why C:** Nettles is spoken by a parent protecting a young child, the reverse relationship.
    * **Why D:** One Flesh is a reflection on a parents' marriage, not a child's direct address to a grandparent.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "A Child to his Sick Grandfather" structured?
    * **Options:** A) As a dramatic monologue spoken directly by a child to the grandfather, in simple, tender language, B) As a Petrarchan sonnet, C) As a free-verse catalogue of objects, D) As a paired poem giving two contrasting viewpoints
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem is a direct address from the child to the grandfather, its plain, affectionate language suiting a young speaker's genuine tenderness.
    * **Why B:** The poem is not shaped as a fourteen-line sonnet.
    * **Why C:** It is a direct, tender address, not a list of objects.
    * **Why D:** There is only one speaker throughout, not two paired viewpoints.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What effect does the child's simple, direct voice have in "A Child to his Sick Grandfather"?
    * **Options:** A) It makes the grandfather's illness seem trivial, B) It makes the love and sorrow feel especially sincere, since a child's plain words carry no artifice, C) It reveals that the child resents the grandfather, D) It turns the poem into a comic piece
    * **Correct:** B
    * **Feedback:** ✓ Correct. The child's unaffected, simple language makes the tenderness and sorrow feel genuine and unforced, without adult artifice or performance.
    * **Why A:** The child's care for the grandfather takes his illness seriously, not lightly.
    * **Why C:** The child's words are affectionate and comforting, not resentful.
    * **Why D:** The tone is tender and sorrowful, not comic.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem reflects on an ageing couple "Lying apart now, each in a separate bed", their passion long since faded?
    * **Options:** A) One Flesh, B) Neutral Tones, C) A Complaint, D) My Last Duchess
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jennings's "One Flesh" pictures her parents lying apart in separate beds, their old intimacy reduced to a quiet, distant companionship.
    * **Why B:** Neutral Tones recalls one meeting beside a pond, not an ageing couple's shared home.
    * **Why C:** A Complaint mourns love through a fountain-and-well metaphor, not two separate beds.
    * **Why D:** My Last Duchess is the Duke's monologue about a dead wife, not a reflection on living parents.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "One Flesh" is a quiet, reflective [BLANK], its stillness suiting the poem's tender observation of a couple whose intimacy has faded into distance.
    * **Answer:** lyric
    * **Feedback:** ✓ Correct. The still, reflective lyric form matches the poem's hushed, contemplative tone as it studies a marriage grown quiet.
    * **WhyWrong:** The word is "lyric" — a reflective lyric, its calm form suiting the poem's tender, contemplative distance.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the title "One Flesh" suggest, when set against the couple's separate beds in the poem?
    * **Options:** A) That the couple are more united in body and spirit than ever before, B) An ironic contrast — a phrase for marital union set against a couple now lying apart, their passion faded into stillness, C) That the couple have divorced, D) That the poem celebrates youthful romance
    * **Correct:** B
    * **Feedback:** ✓ Correct. The title's promise of union sits ironically against the separate beds and faded "fire and desire", so the poem quietly mourns intimacy that has cooled into distant companionship.
    * **Why A:** The poem stresses distance and stillness, not closer union.
    * **Why C:** They remain together in the same home, only emotionally and physically apart.
    * **Why D:** The poem reflects on age and distance, not youthful passion.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a father slashing at a nettle bed in fury after his three-year-old son is stung?
    * **Options:** A) Nettles, B) The Manhunt, C) A Child to his Sick Grandfather, D) My Father Would Not Show Us
    * **Correct:** A
    * **Feedback:** ✓ Correct. Scannell's "Nettles" follows a father who "slashed in fury" at the nettle bed after his young son fell among the "green spears" and was badly stung.
    * **Why B:** The Manhunt follows a wife tracing her husband's war wounds, not a father and a nettle bed.
    * **Why C:** A Child to his Sick Grandfather is a child's address to a dying grandfather, not a parent's protective fury.
    * **Why D:** My Father Would Not Show Us concerns a mining disaster, not a garden injury.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does "Nettles" use its central battle imagery?
    * **Options:** A) It has no extended imagery beyond the literal garden scene, B) It builds an extended military metaphor — the nettles as a "regiment" and "fierce parade" the father slashes down — turning a garden task into a small battle, C) It uses a strict ballad refrain about war, D) It is written as a dramatic monologue addressed to the son
    * **Correct:** B
    * **Feedback:** ✓ Correct. Scannell extends the nettles into a military image — a "regiment", a "fierce parade" — so the father's protective anger becomes a small, private battle.
    * **Why A:** The military language is deliberately extended well beyond the literal task.
    * **Why C:** There is no repeating song-like refrain; the poem is a compact, controlled lyric.
    * **Why D:** The poem is spoken about the son in reflection, not addressed to him directly throughout.

39. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** The final image in "Nettles" — that new nettles will grow back and may sting the boy again — suggests that a parent cannot always protect a child from every future hurt.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The regrown nettles behind the shed remind the father, and the reader, that some pain cannot be permanently defeated, however fierce the parent's protective instinct.
    * **WhyWrong:** This is the poem's closing idea — new nettles growing back reveal that total, lasting protection from harm is impossible.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a partner gently tracing the physical and psychological wounds of a soldier returned from war?
    * **Options:** A) The Manhunt, B) Nettles, C) La Belle Dame Sans Merci, D) A Complaint
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "The Manhunt" follows a wife's patient, careful exploration of her partner's injuries, tracing the "frozen river" scarring his face and the wounds hidden beneath.
    * **Why B:** Nettles concerns a father and his young son, not a returning soldier.
    * **Why C:** La Belle Dame Sans Merci is a ballad of enchantment, unrelated to a returning soldier's injuries.
    * **Why D:** A Complaint mourns a change in love through a fountain metaphor, not physical war wounds.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the free verse form of "The Manhunt" suit its subject?
    * **Options:** A) Its loose, intimate form traces the slow, careful search into a wounded partner's body and mind, B) It tells a triumphant battle narrative, C) It argues a formal legal case, D) It celebrates a military victory
    * **Correct:** A
    * **Feedback:** ✓ Correct. The gentle, fragmentary free verse mirrors the patient, intimate process of a partner trying to reach and understand a man changed by war.
    * **Why B:** It is an intimate poem of care and searching, not a battle narrative.
    * **Why C:** It reads as tender exploration, not a legal argument.
    * **Why D:** The poem explores trauma and reconnection, not victory.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the process of "tracing" the soldier's body come to represent in "The Manhunt"?
    * **Options:** A) A medical examination with no emotional weight, B) An act of love and patient understanding, searching for the man beneath both his visible scars and his hidden psychological wounds, C) An accusation against the soldier, D) A single, instant moment of full recovery
    * **Correct:** B
    * **Feedback:** ✓ Correct. The wife's careful tracing becomes an act of devoted searching, reaching past visible scars towards the "sweating, unexploded mine" of trauma still buried in his mind.
    * **Why A:** The tracing is tender and emotional, an act of love, not clinical detachment.
    * **Why C:** The wife's patience is compassionate, not accusatory.
    * **Why D:** The poem presents recovery as a slow, ongoing search, not a single instant.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem recalls a father, involved in recovering victims of a disaster, who refused to let his children see the bodies?
    * **Options:** A) My Father Would Not Show Us, B) Nettles, C) The Manhunt, D) A Child to his Sick Grandfather
    * **Correct:** A
    * **Feedback:** ✓ Correct. De Kok's poem recalls a father whose work brought him close to a disaster's dead, and who chose to shield his children from that horror.
    * **Why B:** Nettles concerns a father protecting a son from nettle stings, a far smaller, everyday harm.
    * **Why C:** The Manhunt concerns a returning soldier's wounds, not a father shielding children from a disaster's aftermath.
    * **Why D:** A Child to his Sick Grandfather is a child comforting a dying grandparent, not a father's protective silence.

44. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "My Father Would Not Show Us" is a reflective free-verse poem built around the repeated idea of the title, returning to what the father chose to withhold.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem's loose, reflective free verse circles back to the father's refusal, using that repeated idea to structure its meditation on protection and memory.
    * **WhyWrong:** This is true — the poem's free verse repeatedly returns to the father's refusal, structuring its reflection around that withheld sight.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "My Father Would Not Show Us"?
    * **Options:** A) The father's silence is presented as an act of protective love, shielding his children from horror, B) The poem reflects on how a parent's decision to withhold something shapes a child's later understanding of them, C) The poem contrasts the innocence of childhood with an adult awareness of disaster and death, D) The poem states plainly and directly everything the children were kept from seeing
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. De Kok presents the father's silence as protective love, explores how withheld knowledge shapes the children's later understanding, and sets childhood innocence against adult horror.
    * **Why D:** The poem's whole point is what remains unseen and unspoken — the withheld sight is never directly described.
