# Foundational Quiz Bank — Edexcel Relationships Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
45 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. Unlike
the universal forms bank (`poetic_forms.md`, Tier A), these are poem-specific, testing what the
student has actually read. The picker draws a random 5 per round, stratified across categories.
Keys + feedback live server-side and are stripped before questions reach the client. The AI is
never the scorekeeper.

**Concept-based (governed by `FQ-QUESTION-STANDARD.md` § POETRY).** Every item tests the CENTRAL
CONCEPT of its dimension, not surface trivia. **Recognising** keys on the poem's *controlling idea /
argument* (anchored by a signature line), not image-matching; **Form & Features** tests how the form
*shapes meaning*, not its label; **Meaning & Effects** tests the controlling idea + the reader's
response. Distractors are plausible CONCEPTUAL MISREADINGS — for Recognising, other anthology poems
whose *argument differs*.

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
   * **Question:** Which poem argues that outer beauty is the sign of an inner goodness — that physical loveliness and a pure, peaceful mind meet in perfect harmony?
   * **Options:** A) She Walks in Beauty, B) Sonnet 43, C) Valentine, D) Neutral Tones
   * **Correct:** A
   * **Feedback:** ✓ Correct. Byron's "She Walks in Beauty" argues that "all that's best of dark and bright" meet in one face, so her outward beauty stands as the sign of an inner peace and goodness.
   * **Why B:** Sonnet 43 measures the boundless extent of the speaker's own love, not the union of a woman's beauty and virtue.
   * **Why C:** Valentine argues love is layered and painful, rejecting pretty tokens — not a serene harmony of beauty and goodness.
   * **Why D:** Neutral Tones remembers love's bitter death by a winter pond, the opposite of a calm tribute to harmony.

2. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** The gliding, even rhythm of "She Walks in Beauty" and its balanced play of opposites — "all that's best of dark and bright" — leave the reader with an overriding sense of [BLANK], mirroring the union of beauty and goodness it praises.
   * **Answer:** harmony
   * **Feedback:** ✓ Correct. The regular, flowing metre and the poised balancing of dark against bright make the poem feel harmonious, so its very movement enacts the union of outer beauty and inner virtue.
   * **WhyWrong:** The word is "harmony" — the balanced, gliding form produces a feeling of harmony that mirrors the poem's argument.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What are we left feeling about the woman by the end of "She Walks in Beauty"?
   * **Options:** A) Admiration for a beauty that is only skin-deep and fleeting, B) Calm admiration for a beauty that seems the outward sign of an inner peace and goodness, C) Unease that her beauty hides something false, D) Pity that her beauty will fade
   * **Correct:** B
   * **Feedback:** ✓ Correct. Byron ties the "smiles that win" to "days in goodness spent" and "A heart whose love is innocent", so we admire not just her looks but the serene virtue they seem to reveal.
   * **Why A:** The poem insists her beauty reflects inner goodness, not surface only.
   * **Why C:** The tone is one of trust and admiration, with no hint of falseness.
   * **Why D:** The poem dwells on present harmony, not the loss of beauty to age.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem sets out to measure love to its very limits — loving "to the depth and breadth and height / My soul can reach", in every mode of life and even beyond death?
   * **Options:** A) Sonnet 43, B) She Walks in Beauty, C) i wanna be yours, D) A Complaint
   * **Correct:** A
   * **Feedback:** ✓ Correct. Barrett Browning answers her own "How do I love thee? Let me count the ways" by cataloguing love at every scale — everyday need, spiritual reach, and a love she will "but love thee better after death".
   * **Why B:** She Walks in Beauty praises one vision of a woman's harmony, not a measured accounting of the speaker's own love.
   * **Why C:** i wanna be yours pledges humble, everyday devotion through household objects, not love stretched to its spiritual limits.
   * **Why D:** A Complaint mourns a love that has dwindled, the reverse of this overflowing, expanding devotion.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the tight sonnet form of "Sonnet 43" shape its declaration of love?
   * **Options:** A) It makes the love sound reluctant and restrained, boxed in by the rules, B) The disciplined fourteen lines contain and concentrate an ever-expanding list of loves, so the form intensifies rather than limits the feeling, C) It turns the poem into a light, song-like refrain, D) Its looseness lets the feeling wander without any shape
   * **Correct:** B
   * **Feedback:** ✓ Correct. The set fourteen lines press the mounting catalogue — "I love thee... I love thee..." — into a single controlled shape, so the containment makes the devotion feel more intense, not less.
   * **Why A:** The form channels and heightens the feeling; it never sounds grudging or held back.
   * **Why C:** The measured, elevated sonnet is far from a song-like refrain.
   * **Why D:** The poem keeps a fixed sonnet shape, not a loose, wandering form.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "Sonnet 43", the speaker's love is presented as boundless — reaching into everyday life, the spiritual, and even beyond death — so that we feel the sheer totality of her devotion.
   * **Answer:** True
   * **Feedback:** ✓ Correct. By loving "to the level of everyday's / Most quiet need" and vowing to "but love thee better after death", the speaker makes her love feel all-encompassing — that totality is what moves us.
   * **WhyWrong:** This is the poem's effect — love reaching from daily life to beyond death makes us feel its boundless totality.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem rejects the clichés of romance — "Not a red rose or a satin heart" — offering instead a gift that stands for love as honest, layered and even dangerous?
   * **Options:** A) Valentine, B) Sonnet 43, C) She Walks in Beauty, D) i wanna be yours
   * **Correct:** A
   * **Feedback:** ✓ Correct. Duffy refuses "a red rose or a satin heart" and gives an onion, whose layers, tears and "fierce kiss" make love truthful and complicated rather than sweet and simple.
   * **Why B:** Sonnet 43 embraces grand, idealised declarations of love — exactly the tradition Valentine sets out to reject.
   * **Why C:** She Walks in Beauty offers a serene, admiring tribute, not a deliberate rejection of romantic cliché.
   * **Why D:** i wanna be yours also uses humble objects, but to pledge constant devotion, not to insist love is layered and painful.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the loose, unrhymed free verse of "Valentine" — dropping to blunt single lines like "Lethal." — serve the poem?
   * **Options:** A) Its neat rhyme makes it sound like the greetings-card verse Duffy admires, B) Refusing tidy romantic form mirrors the poem's refusal of clichéd love, and the abrupt short lines land like warnings that love can wound, C) It turns the poem into a soothing lullaby, D) The form has no bearing on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The unrhymed, conversational lines reject sentimental neatness just as the poem rejects the red rose, and stark one-word lines like "Lethal." make love's danger cut through.
   * **Why A:** The poem has no comforting rhyme and mocks card sentiment rather than admiring it.
   * **Why C:** The blunt, sometimes menacing lines are the opposite of a soothing lullaby.
   * **Why D:** The broken, plain form directly enacts the poem's rejection of romantic cliché.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the onion make us understand and feel about love in "Valentine"?
   * **Options:** A) That love is simple, sweet and untroubled, B) That love is truthful but layered — tender yet able to sting and cling, "possessive and faithful" — so we feel its complexity rather than easy romance, C) That love is a joke to be laughed at, D) That love has already died
   * **Correct:** B
   * **Feedback:** ✓ Correct. The onion "will blind you with tears", its scent will "cling to your knife", and it is "possessive and faithful" — so the gift makes love feel honest and complicated, capable of hurt as well as tenderness.
   * **Why A:** The extended metaphor insists love is layered and can wound, not simple and sweet.
   * **Why C:** The tone turns serious and even threatening ("Lethal"), not comic.
   * **Why D:** The onion is offered now, as a living gift, not as a memorial to lost love.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem pledges love not through roses or stars but by longing to be the speaker's most ordinary, useful possessions — a "vacuum cleaner", a "ford cortina", a "coffee pot" — a devotion that is humble and constant?
    * **Options:** A) i wanna be yours, B) Valentine, C) Sonnet 43, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Cooper Clarke stacks up humble household objects — offering to be a "vacuum cleaner", a "ford cortina", a "coffee pot" — so devotion is pledged as steady usefulness rather than grand romance.
    * **Why B:** Valentine also uses a humble object, but to argue love is layered and painful — not to pledge constant, practical devotion.
    * **Why C:** Sonnet 43 reaches for the spiritual and eternal, the opposite of this deliberately ordinary, down-to-earth love.
    * **Why D:** The Manhunt traces a wounded soldier's body with tender care; it has no catalogue of household objects.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How does the repeated, list-like structure of "i wanna be yours", returning again and again to the refrain "i wanna be yours", shape its effect?
    * **Options:** A) Its single, unbroken argument in stately blank verse makes the love sound formal, B) The piling-up of humble images and the chanted refrain build a cumulative, heartfelt insistence, so devotion feels wholehearted and unpretentious, C) A strict sonnet turn splits the poem into a formal argument, D) The repetition has no effect on how we read the devotion
    * **Correct:** B
    * **Feedback:** ✓ Correct. Each "let me be your..." adds another humble pledge, and the returning refrain "i wanna be yours" drives the feeling home, so the love sounds insistent, sincere and unforced.
    * **Why A:** The poem is built from short, repeated lines and a refrain, not stately blank verse.
    * **Why C:** There is no sonnet turn; the poem is loose, song-like and cumulative.
    * **Why D:** The mounting repetition and refrain are exactly what make the devotion feel wholehearted.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** In "i wanna be yours", comparing himself to unglamorous objects like an "electric meter" or a "vacuum cleaner" makes the speaker's devotion feel constant and practical rather than grand or idealised.
    * **Answer:** True
    * **Feedback:** ✓ Correct. By longing to be useful, everyday things rather than roses or stars, the speaker presents love as steady, dependable and humble — the effect is warmth, not lofty romance.
    * **WhyWrong:** This is the poem's effect — the ordinary, useful objects present devotion as constant and practical, a deliberate contrast with idealised romance.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem tells one first date twice over — once by each person — so the reader sees the gulf between the two speakers' private thoughts, each wrongly sure the other is "quite undistracted by me"?
    * **Options:** A) 1st Date – She and 1st Date – He, B) One Flesh, C) Love's Dog, D) Neutral Tones
    * **Correct:** A
    * **Feedback:** ✓ Correct. Cope gives the identical evening from both sides — each privately nervous, each concluding the other is "quite undistracted by me" — so we alone see the mismatch between their inner feelings and outward calm.
    * **Why B:** One Flesh reflects on a long-faded marriage from one observer's view, not one date told from two sides.
    * **Why C:** Love's Dog catalogues love's contradictions in general, not a single encounter seen twice.
    * **Why D:** Neutral Tones recalls a relationship's cold ending from one speaker only, without a paired viewpoint.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How does the paired, mirror-image structure of "1st Date – She" and "1st Date – He" shape the poem's effect?
    * **Options:** A) The two halves are unconnected, so no comparison is possible, B) The matching structure — each ending on almost the same line, "quite undistracted by me" — lets the reader set one speaker's private thoughts directly against the other's, creating dramatic irony neither speaker sees, C) A single narrator tells us plainly what each really feels, D) The strict sonnet form argues one settled conclusion
    * **Correct:** B
    * **Feedback:** ✓ Correct. Cope mirrors the two poems down to their closing lines, so we measure her hopeful nerves against his casual ones and enjoy an irony — each thinks the other indifferent — that neither character can see.
    * **Why A:** The halves are deliberately built to be read together and compared.
    * **Why C:** There is no outside narrator; each voice is private, and the irony depends on that.
    * **Why D:** The poems are conversational free verse, not a fixed sonnet with one conclusion.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "1st Date – She" and "1st Date – He"?
    * **Options:** A) Each speaker is privately anxious and self-conscious — she hoping to seem "tastefully sexy" with "something clever to say", he admitting he only "implied" a shared love of music, B) The gap between their inner thoughts and outward calm creates a wry, comic irony, C) Because we hear both sides while neither speaker does, we alone judge the mismatch between private feeling and behaviour, D) Both speakers frankly confess their true feelings to each other on the date
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Cope exposes each speaker's private nerves — her wish to seem "tastefully sexy" and worth "something clever to say", his admission that he merely "implied" an interest — generating gentle comic irony, since only the reader hears both sides.
    * **Why D:** Neither speaker voices these private thoughts aloud; the whole point is what stays unsaid between them.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem warns that love can enchant and then destroy — leaving a knight "Alone and palely loitering", wasted and haunted long after the beautiful lady has vanished?
    * **Options:** A) La Belle Dame Sans Merci, B) My Last Duchess, C) Sonnet 43, D) A Child to his Sick Grandfather
    * **Correct:** A
    * **Feedback:** ✓ Correct. Keats's knight, seduced by a "faery's child" who claimed "I love thee true", is left "Alone and palely loitering" — an argument that desire can bewitch, then abandon and ruin.
    * **Why B:** My Last Duchess concerns a husband's possessive control over a wife, not a lover destroyed by enchantment.
    * **Why C:** Sonnet 43 celebrates a sustaining, life-giving love, the opposite of a love that drains and abandons.
    * **Why D:** A Child to his Sick Grandfather is about tender family love and dying, not romantic enchantment.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the ballad form of "La Belle Dame Sans Merci" — with its eerie repetitions and its return at the end to the same "Alone and palely loitering" — shape the poem's effect?
    * **Options:** A) The repeated stanzas and circling structure create a haunting, dreamlike spell that traps the knight — and the reader — in unresolved longing, B) The neat rhyme makes the poem cheerful and reassuring, C) A single silent listener is addressed throughout, as in a dramatic monologue, D) The loose free verse refuses any pattern
    * **Correct:** A
    * **Feedback:** ✓ Correct. The ballad's chant-like repetition and its return to the opening image leave the knight exactly where he began, so the very shape of the poem enacts a spellbound, inescapable longing.
    * **Why B:** The eerie, withered atmosphere is haunting, not cheerful or reassuring.
    * **Why C:** The poem narrates a story rather than exposing one mind to a silent listener.
    * **Why D:** The ballad keeps a firm rhyme and rhythm, not free verse.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What are we left feeling about the knight's fate at the end of "La Belle Dame Sans Merci"?
    * **Options:** A) Relief that love has healed and restored him, B) A haunted pity — love enchanted him and then abandoned him, leaving him desolate and trapped in endless longing, C) Amusement at a light, happy adventure, D) Certainty that he was never really affected
    * **Correct:** B
    * **Feedback:** ✓ Correct. Found still "palely loitering" where "no birds sing", the knight is caught in the after-trance of a love that bewitched then abandoned him — we feel a haunted pity, not comfort.
    * **Why A:** He is withered and haunted, not healed.
    * **Why C:** The barren, deathly imagery makes the mood eerie and sorrowful, not amusing.
    * **Why D:** The pale, loitering knight is plainly still in the lady's thrall.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem exposes love turned into possessive control — a husband so jealous of his wife's easy warmth to others that "I gave commands; / Then all smiles stopped together"?
    * **Options:** A) My Last Duchess, B) La Belle Dame Sans Merci, C) One Flesh, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's Duke, resentful that "her looks went everywhere", lets slip that "I gave commands; / Then all smiles stopped together" — love reduced to jealous, absolute ownership.
    * **Why B:** La Belle Dame Sans Merci concerns a lover enchanted and abandoned, not a husband's possessive control.
    * **Why C:** One Flesh reflects on an ageing couple's faded, gentle intimacy, not jealous domination.
    * **Why D:** The Manhunt traces tender, patient care for a wounded partner — the opposite of controlling cruelty.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "My Last Duchess" the rhyming couplets, smoothed over by enjambment, give the Duke an unruffled air of [BLANK] — and it is exactly that composure, as he calmly recalls having his wife killed, that chills us.
    * **Answer:** control
    * **Feedback:** ✓ Correct. The even, flowing couplets make the Duke sound calm and reasonable, so his casual confession surfaces beneath a polished poise — the control of the voice is what makes the menace so disturbing.
    * **WhyWrong:** The word is "control" — the smooth couplets project a chilling composure beneath which the Duke's cruelty surfaces.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** As the Duke talks on in "My Last Duchess", what does the poem make us realise and feel about him?
    * **Options:** A) That he is a modest man grieving a lost wife, B) That beneath his cultured, courteous speech lies a chillingly possessive cruelty — and we grow uneasy as we decode a confession he barely realises he is making, C) That he cares nothing for rank or possessions, D) That he deeply regrets his cruelty
    * **Correct:** B
    * **Feedback:** ✓ Correct. His prizing of a "nine-hundred-years-old name" and his refusal ever to "stoop" reveal a controlling pride, so we listen like uneasy judges, piecing together the menace behind his politeness.
    * **Why A:** His pride in name and possessions is the opposite of modest grief.
    * **Why C:** His whole speech is preoccupied with rank, ownership and appearances.
    * **Why D:** He voices irritation, not remorse, over his wife's warmth to others.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem remembers the cold death of a relationship beside a winter pond and draws from it a lasting, bitter lesson "that love deceives"?
    * **Options:** A) Neutral Tones, B) She Walks in Beauty, C) Sonnet 43, D) i wanna be yours
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy stands "by a pond that winter day" under a sun "white, as though chidden of God", and from that grey scene learns "keen lessons that love deceives" — disillusionment fixed permanently in memory.
    * **Why B:** She Walks in Beauty is a serene tribute to beauty and goodness, not a bitter memory of love's death.
    * **Why C:** Sonnet 43 is an overflowing declaration of living love, the opposite of disillusionment.
    * **Why D:** i wanna be yours pledges hopeful, constant devotion, not the bleak aftermath of a failed love.

23. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** In "Neutral Tones", the measured, regular quatrains and drained, colourless imagery — the "white" sun, the "grayish leaves" — give the poem a restrained, bleak mood that mirrors a love emptied of feeling.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The controlled quatrains and greyed-out palette hold the emotion tightly in check, so the very restraint of the form conveys a love — and a landscape — drained of warmth.
    * **WhyWrong:** This is true — the disciplined quatrains and monotone imagery create a bleak restraint that mirrors the dead relationship.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the wintry pond scene come to mean, and make us feel, by the end of "Neutral Tones"?
    * **Options:** A) A hopeful new start for the couple, B) It hardens into a permanent emblem of disillusionment — the "keen lessons that love deceives" fixing the grey scene in the speaker's memory forever, leaving a lasting bitterness, C) A warm, nostalgic memory, D) A scene the speaker has happily forgotten
    * **Correct:** B
    * **Feedback:** ✓ Correct. The final stanza returns to "Your face, and the God-curst sun, and a tree, / And a pond edged with grayish leaves" — the dead scene fixed for good as an emblem of how love deceived him.
    * **Why A:** The scene is one of ending and disillusionment, not hope.
    * **Why C:** The memory is bitter and cold, not warm or nostalgic.
    * **Why D:** The final stanza insists the scene has shaped him ever since.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem defines love only by its contradictions — the same thing praised in one breath and complained of in the next, from its "truth serum" to its "sick parrot"?
    * **Options:** A) Love's Dog, B) Sonnet 43, C) i wanna be yours, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hadfield lists what she loves and hates about love side by side — its "truth serum", its "petting zoo", its "sick parrot" — refusing any single definition and insisting love is a tangle of contradictions.
    * **Why B:** Sonnet 43 gives a single, unified, exalted account of love, not a run of contradictions.
    * **Why C:** i wanna be yours pledges one steady kind of devotion, not love's warring opposites.
    * **Why D:** The Manhunt narrates one act of patient, healing love, not a catalogue of contradictions.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the repeated "What I love about love is its... / What I hate about love is its..." structure of "Love's Dog" shape its effect?
    * **Options:** A) It states one fixed metaphor once and leaves it, B) The see-sawing repetition keeps flipping between delight and complaint, so the very structure enacts love's contradictory, unsettled nature, C) A strict octave-and-sestet turn resolves the poem into one conclusion, D) It addresses a single silent listener throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. Each line swings from loving to hating love, and the relentless repetition keeps the poem tipping back and forth — so the shape itself refuses to settle, just as love refuses a single definition.
    * **Why A:** The poem piles up many images across many lines, never resting on one.
    * **Why C:** There is no sonnet turn or settled conclusion; the flipping never resolves.
    * **Why D:** The poem reflects on love in general, not one addressed listener.

27. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Love's Dog", ending on love as "its pirate" and then "its sick parrot" deflates the poem into something comic, refusing to close on a neat or solemn note.
    * **Answer:** True
    * **Feedback:** ✓ Correct. After stranger and tenderer images, the final "pirate" and "sick parrot" pairing turns wry and faintly ridiculous, so the poem leaves love comic and unresolved rather than grand.
    * **WhyWrong:** This is the poem's effect — the "pirate" / "sick parrot" ending deliberately deflates into comedy rather than a solemn close.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem mourns a love that has changed and shrunk — once "a fountain at my fond heart's door" that freely flowed, now become "a comfortless and hidden well"?
    * **Options:** A) A Complaint, B) Neutral Tones, C) Valentine, D) One Flesh
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth grieves that a love which was once a fountain "Whose only business was to flow" has dwindled to "a comfortless and hidden well" — the poem's ache is for love's lost openness.
    * **Why B:** Neutral Tones remembers love's cold ending by a pond, not a love slowly dried to a well.
    * **Why C:** Valentine offers a living, present love through the onion, not grief at a diminished one.
    * **Why D:** One Flesh observes an ageing couple from outside; A Complaint voices the speaker's own loss directly.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "A Complaint" shape its grief over changed love?
    * **Options:** A) A Duke's monologue exposes cruelty to a silent listener, B) Short, controlled stanzas develop one extended metaphor — love as a free-flowing "fountain" turned to a "hidden well" — so the shift of image enacts the very change in love the speaker mourns, C) A ballad narrates an enchanted knight's fate, D) Free verse throws off all pattern to sound spontaneous
    * **Correct:** B
    * **Feedback:** ✓ Correct. The disciplined stanzas carry the fountain-to-well metaphor from open flow to sealed silence, so the ordered movement of the images mirrors love's decline into concealment.
    * **Why A:** There is no Duke or silent listener; the speaker mourns love itself.
    * **Why C:** There is no ballad narrative or enchanted figure.
    * **Why D:** The poem keeps a regular, controlled metre and rhyme, not loose free verse.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "A Complaint"?
    * **Options:** A) It mourns a love that has changed from generous and freely giving to guarded and withheld, B) The fountain-to-well metaphor makes us feel a quiet, aching grief rather than anger, C) The speaker feels impoverished by the change — "There is a change—and I am poor", D) The poem celebrates a love that has deepened and strengthened over time
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Wordsworth laments love narrowed from an open fountain to a hidden well, feeling himself made "poor" by it — the metaphor carries a quiet, aching grief, not celebration.
    * **Why D:** The poem laments diminished love; it never celebrates growth.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is spoken by a young child trying to comfort a dying grandfather — "old and frail" — its tenderness deepened by the child's innocent, half-understanding of death?
    * **Options:** A) A Child to his Sick Grandfather, B) My Father Would Not Show Us, C) One Flesh, D) Nettles
    * **Correct:** A
    * **Feedback:** ✓ Correct. Baillie's child notices the grandfather is "old and frail", offers stories and closeness, and reaches the quiet, unanswered "You do not hear me, dad" — innocent love made poignant by not quite grasping death.
    * **Why B:** My Father Would Not Show Us is an adult's grief at a father already dead, not a child comforting a living grandfather.
    * **Why C:** One Flesh reflects on an ageing marriage, not a child's address to a grandparent.
    * **Why D:** Nettles is spoken by a protective parent, the reverse of a child comforting an elder.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the form of "A Child to his Sick Grandfather" — its direct address and its plain, repeated "dad" — shape the poem's effect?
    * **Options:** A) The child speaks straight to the grandfather in simple, repeated words, so the unpolished voice makes the love and sorrow feel sincere and unforced, B) A Petrarchan sonnet argues a philosophical case about death, C) A detached narrator describes the scene from far off, D) Two paired speakers give opposing viewpoints
    * **Correct:** A
    * **Feedback:** ✓ Correct. Speaking directly to the grandfather and circling back to the plain "dad", the child's simple, childlike tales carry no adult artifice — so the affection and grief land as wholly genuine.
    * **Why B:** The poem is a child's tender address, not a formal sonnet argument.
    * **Why C:** The child speaks intimately and directly, not through a distant narrator.
    * **Why D:** There is only one speaker throughout, not two paired viewpoints.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What effect does the child's simple, direct voice have in "A Child to his Sick Grandfather", from "I love my own old dad" to the final, unanswered "You do not hear me, dad"?
    * **Options:** A) It makes the grandfather's illness seem trivial, B) It makes the love and sorrow feel especially sincere and poignant, since the child's plain words carry no adult artifice — and the unanswered ending quietly signals the approach of death, C) It reveals that the child resents the grandfather, D) It turns the poem into a comic piece
    * **Correct:** B
    * **Feedback:** ✓ Correct. The child's unaffected "I love my own old dad" and the hushed, unanswered "You do not hear me, dad" make the tenderness feel genuine, while that silence lets us feel the nearness of death the child cannot name.
    * **Why A:** The child's care takes the illness seriously, not lightly.
    * **Why C:** The child's words are affectionate and comforting, not resentful.
    * **Why D:** The tone is tender and sorrowful, not comic.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem watches an ageing couple "Lying apart now, each in a separate bed", their old passion cooled into a quiet, companionable distance?
    * **Options:** A) One Flesh, B) Neutral Tones, C) A Complaint, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jennings observes her parents lying apart, "Strangely apart, yet strangely close together", their passion long since faded to a still, quiet companionship.
    * **Why B:** Neutral Tones recalls one bitter meeting by a pond, not an ageing couple at home.
    * **Why C:** A Complaint mourns love through a fountain-and-well metaphor, not a couple in separate beds.
    * **Why D:** The Manhunt traces a young partner's war wounds, not an old marriage grown quiet.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** The hushed, unhurried movement of "One Flesh" — a couple who "hardly ever touch" — settles the poem into a mood of quiet [BLANK] that mirrors their faded passion.
    * **Answer:** stillness
    * **Feedback:** ✓ Correct. The calm, slow-moving lines hold the poem in a hush, so its stillness echoes the cooled, motionless intimacy of the ageing couple.
    * **WhyWrong:** The word is "stillness" — the poem's calm, unhurried form produces a stillness that mirrors the couple's faded passion.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the title "One Flesh" come to mean, set against the couple's separate beds?
    * **Options:** A) That the couple are more united in body and spirit than ever, B) An ache of irony — a phrase for marital oneness set against two people now lying apart, their passion cooled until the "fire from which I came" "has now grown cold", C) That the couple have angrily divorced, D) That the poem celebrates youthful romance
    * **Correct:** B
    * **Feedback:** ✓ Correct. The title's promise of union sits painfully against the separate beds, and the closing image of the "fire from which I came" that "has now grown cold" makes us feel a quiet melancholy for intimacy that has faded to distance.
    * **Why A:** The poem stresses distance and stillness, not deeper union.
    * **Why C:** They remain together in one home, parted in feeling, not divorced.
    * **Why D:** The poem reflects on age and cooled passion, not youthful romance.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem shows a father's fierce protective love turned on a nettle bed after his young son is stung — only for the poem to admit that new nettles, and new hurts, will return?
    * **Options:** A) Nettles, B) The Manhunt, C) My Father Would Not Show Us, D) A Child to his Sick Grandfather
    * **Correct:** A
    * **Feedback:** ✓ Correct. Scannell's father "slashed in fury" at the "fierce parade" of nettles to protect his son, yet "in two weeks" they regrow — so love's fierce protection cannot guard a child from every future wound.
    * **Why B:** The Manhunt traces a wife's care for a wounded soldier, not a father protecting a son.
    * **Why C:** My Father Would Not Show Us concerns a father's death, not protective fury in a garden.
    * **Why D:** A Child to his Sick Grandfather is a child comforting an elder, not a parent shielding a child.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the extended military imagery of "Nettles" — the nettles as a "regiment", a "fierce parade", the regrowth as "recruits" — shape its meaning?
    * **Options:** A) It has no imagery beyond the literal garden scene, B) It turns a small garden mishap into a private war, dignifying the father's protective fury while hinting, as fresh "recruits" return, that this battle can never be finally won, C) A song-like refrain about war lightens the tone, D) It addresses the son directly throughout as a dramatic monologue
    * **Correct:** B
    * **Feedback:** ✓ Correct. Casting the nettles as an army the father slashes down makes his protectiveness a real battle, and the returning "recruits" quietly concede that the war to shield his son from hurt is unwinnable.
    * **Why A:** The military language is deliberately extended well beyond the literal task.
    * **Why C:** There is no song-like refrain; the tone is taut and serious.
    * **Why D:** The poem reflects about the son, not addressed to him throughout.

39. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** The closing image of "Nettles" — new nettles growing back to sting the boy again — leaves us feeling that a parent cannot protect a child from every future hurt, however fierce their love.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The regrown "recruits" and the plain admission that "My son would often feel sharp wounds again" turn the father's fury into a sober, tender helplessness — some pain cannot be defeated.
    * **WhyWrong:** This is the poem's closing feeling — the regrowth reveals that total, lasting protection is impossible, however fierce the love.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a partner slowly, tenderly tracing a returned soldier's wounds — the "frozen river" of his scarred face, and deeper still the "unexploded mine" in his mind — trying to reach the man war has changed?
    * **Options:** A) The Manhunt, B) Nettles, C) La Belle Dame Sans Merci, D) One Flesh
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's speaker patiently traces the "frozen river which ran through his face" and finally the "sweating, unexploded mine" of trauma, so love becomes a careful search to reach a partner altered by war.
    * **Why B:** Nettles concerns a father and his young son, not a wounded returning soldier.
    * **Why C:** La Belle Dame Sans Merci is a ballad of enchantment and abandonment, not tender care for war wounds.
    * **Why D:** One Flesh observes an ageing couple's cooled passion, not a partner healing after war.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the fragmentary, step-by-step free verse of "The Manhunt" — advancing "only then... only then..." — suit its subject?
    * **Options:** A) Its slow, piece-by-piece movement mirrors the patient, intimate search into a wounded partner's body and mind, one careful step at a time, B) Its galloping rhythm imitates a triumphant cavalry charge, C) It argues a formal legal case, D) It celebrates a military victory
    * **Correct:** A
    * **Feedback:** ✓ Correct. The short, halting phrases and the repeated "only then" let the poem advance cautiously, mirroring the slow, tender process of reaching a man changed by war.
    * **Why B:** The measured, gentle movement is intimate, not a galloping charge.
    * **Why C:** It reads as tender exploration, not a legal argument.
    * **Why D:** The poem explores trauma and reconnection, not victory.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the slow "tracing" of the soldier's body come to mean, and make us feel, in "The Manhunt"?
    * **Options:** A) A clinical examination with no feeling, B) An act of patient love — reaching past the visible scars towards the "unexploded mine" of trauma in his mind — so we feel tenderness and a fragile hope of reconnection, C) An accusation against the soldier, D) A single instant of full recovery
    * **Correct:** B
    * **Feedback:** ✓ Correct. The wife's careful tracing becomes devoted searching, reaching toward the "sweating, unexploded mine / buried deep in his mind", so we feel tenderness and a cautious hope that love might yet reach him.
    * **Why A:** The tracing is tender and emotional, an act of love, not clinical detachment.
    * **Why C:** The wife's patience is compassionate, not accusatory.
    * **Why D:** The poem presents recovery as a slow, ongoing search, not a single instant.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem watches an adult confront a father "five days dead" and realise that, in dying as in life, "my father would not show us how to die" — grief bound up with a lifetime of his withdrawal?
    * **Options:** A) My Father Would Not Show Us, B) A Child to his Sick Grandfather, C) Nettles, D) The Manhunt
    * **Correct:** A
    * **Feedback:** ✓ Correct. De Kok views the father's face "five days dead" and circles the refrain "My father would not show us how to die" — his final silence of a piece with the emotional withdrawal that marked his life.
    * **Why B:** A Child to his Sick Grandfather is a young child's tender comfort of a dying elder, not an adult reckoning with a withdrawn father.
    * **Why C:** Nettles concerns a father's protective fury in a garden, not his death and reserve.
    * **Why D:** The Manhunt traces a wounded soldier's recovery, not a father's dying.

44. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** In "My Father Would Not Show Us", the free-verse refrain shifts from "My father would not show us how to die" to the later "My father could not show us how to die" — the change of verb tracing his withdrawal from wilful choice to helpless incapacity.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Moving from the deliberate "would not" to the helpless "could not", the refrain quietly charts how the father's reserve passes from something chosen to something death forces on him.
    * **WhyWrong:** This is true — the refrain's shift from "would not" to "could not" is how the poem's free verse structures its meditation on the father's withheld death.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "My Father Would Not Show Us", from its "organised" viewing of the body to its closing image of him turning "face to the wall"?
    * **Options:** A) The father's withdrawal — "He hid, he hid away" — is felt as a withholding from his children of his own dying, as much as a retreat from them, B) The poem reflects on how a parent's silence and reserve shape a child's later understanding of him, C) It sets a remembered, "louder, braver" childhood against the present hush beside the coffin, D) The poem narrates plainly and fully everything the father felt as he died
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. De Kok feels the father's "He hid, he hid away" as both withholding and retreat, reflects on how his silence shapes her later understanding, and sets a "louder, braver" childhood against the cold present hush.
    * **Why D:** The poem's whole point is what stays unseen and unspoken — his dying is never plainly narrated, only circled around.
