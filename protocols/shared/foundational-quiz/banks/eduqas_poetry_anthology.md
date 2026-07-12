# Foundational Quiz Bank — Eduqas Poetry Anthology (Poems)

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**45 questions on the actual ANTHOLOGY POEMS — three per poem** across the three understanding
dimensions: Recognising the Poem · Form & Features · Meaning & Effects. The picker draws a random 5
per round, stratified across categories. Keys + feedback live server-side and are stripped before
questions reach the client. The AI is never the scorekeeper.

**Concept-based (governed by `FQ-QUESTION-STANDARD.md` § POETRY).** Every item tests the CENTRAL
CONCEPT of its dimension, not surface trivia. **Recognising** keys on the poem's *controlling idea /
argument* (anchored by a signature line), not image-matching; **Form & Features** tests how the form
*shapes meaning*, not its label; **Meaning & Effects** tests the controlling idea + the reader's
response. Distractors are plausible CONCEPTUAL MISREADINGS — for Recognising, other anthology poems
whose *argument differs*.

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the
course's reading order (unchanged), so the quiz only serves poems the student has read:
- **@set:1** — The Schoolboy · I Wandered Lonely as a Cloud · Blackberry-Picking · Catrin · Origin Story
- **@set:2** — Drummer Hodge · Disabled · Kamikaze · War Photographer · Remains
- **@set:3** — Cousin Kate · Sonnet 29 · Dusting the Phone · I Shall Return · Decomposition

### Quiz: Eduqas Poetry Anthology

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that shutting a naturally joyful child away in the classroom can only blight, never nurture, their growth — asking how "the bird that is born for joy" can "Sit in a cage and sing"?
   * **Options:** A) The Schoolboy, B) Catrin, C) Origin Story, D) Blackberry-Picking
   * **Correct:** A
   * **Feedback:** ✓ Correct. Blake's "The Schoolboy" sets the boy's summer joy against the schoolmaster's "cruel eye outworn", arguing through the caged-bird image that confinement destroys a child's natural delight.
   * **Why B:** Catrin's argument is about the bound-together love and conflict of mother and daughter, not a child stifled by school.
   * **Why C:** Origin Story reflects on the fragile worth of the speaker's parents' love, not childhood confinement.
   * **Why D:** Blackberry-Picking is about the yearly hope to preserve perfection against decay, not a child at school.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "The Schoolboy" is built from short, simply rhymed, song-like stanzas. What does that song-like form achieve?
   * **Options:** A) It turns the poem into a triumphant marching song, B) The innocent, nursery-song shape sharpens the contrast between the child's natural joy and the confinement that stifles it, so the gentle form makes the loss feel like a violation, C) It proves the boy enjoys his lessons, D) It has no effect on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. Casting a protest against confinement in the shape of a children's song makes the stifling of joy all the more poignant — the childlike music is exactly what the schoolroom crushes.
   * **Why A:** The tone is plaintive complaint, not a triumphant march.
   * **Why C:** The song-like form underscores lost joy, not enjoyment of lessons.
   * **Why D:** The clash between the innocent form and its dismal subject is central to the feeling.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** Why does Blake picture a bird "born for joy" shut in a cage in "The Schoolboy"?
   * **Options:** A) To praise the school's discipline, B) To argue that forcing a naturally joyful child into confinement can only blight that joy, just as caging silences a bird born to fly, C) To describe a real caged pet, D) To celebrate the huntsman's skill
   * **Correct:** B
   * **Feedback:** ✓ Correct. The rhetorical question about a caged bird turns the boy's dismay into a wider argument: shutting a child away from freedom and nature can only stunt, never nurture, growth.
   * **Why A:** The image protests confinement rather than praising discipline.
   * **Why C:** The bird stands for the boy's own stifled joy, not a literal pet.
   * **Why D:** The huntsman belongs only to the opening joyful stanza, unconnected to this image.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that a single, fleeting encounter with nature can become a lasting inner joy — its "host, of golden daffodils" returning to "flash upon that inward eye" long afterwards?
   * **Options:** A) I Wandered Lonely as a Cloud, B) The Schoolboy, C) Blackberry-Picking, D) Catrin
   * **Correct:** A
   * **Feedback:** ✓ Correct. Wordsworth's speaker drifts past the daffodils, but the poem's real argument is that the remembered sight returns in "the bliss of solitude" to gladden him for ever.
   * **Why B:** The Schoolboy argues confinement blights a child's joy, not that nature's memory sustains it.
   * **Why C:** Blackberry-Picking argues the opposite — that summer's sweetness cannot be kept and rots away.
   * **Why D:** Catrin is about the bond and struggle between mother and daughter, not solitary nature remembered.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** Wordsworth writes "I Wandered Lonely as a Cloud" in flowing, regular, dancing stanzas. How does that form serve the poem?
   * **Options:** A) The lilting, dance-like movement of the verse echoes the daffodils "dancing in the breeze", so the poem's rhythm carries the very joy it describes, B) The broken, halting rhythm mirrors the speaker's despair, C) The formless free verse shows the speaker's confusion, D) It has no bearing on the meaning
   * **Correct:** A
   * **Feedback:** ✓ Correct. The smooth, tripping metre moves like the flowers themselves, so the form re-enacts the delight — and, at the close, the heart that "dances with the daffodils".
   * **Why B:** The rhythm is buoyant and glad, not halting or despairing.
   * **Why C:** The verse is carefully rhymed and regular, not formless.
   * **Why D:** The dancing movement of the form is exactly what conveys the joy.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "I Wandered Lonely as a Cloud", the memory of the daffodils keeps bringing the speaker joy long after the walk itself, in "the bliss of solitude".
   * **Answer:** True
   * **Feedback:** ✓ Correct. The daffodils "flash upon that inward eye" whenever the speaker lies "in vacant or in pensive mood", proving that one moment in nature can become a lasting source of happiness.
   * **WhyWrong:** This is true — the closing stanza reveals memory alone reviving the same pleasure the daffodils first gave, recollected in tranquillity.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that our longing to keep something perfect is always defeated by time — its hoarded berries souring each year into "a rat-grey fungus"?
   * **Options:** A) Blackberry-Picking, B) I Wandered Lonely as a Cloud, C) Origin Story, D) The Schoolboy
   * **Correct:** A
   * **Feedback:** ✓ Correct. Heaney's "Blackberry-Picking" gathers the summer's sweet fruit only to watch it rot "in the byre", ending on the yearly hope for fruit that would never keep — an argument about impermanence and inevitable loss.
   * **Why B:** I Wandered Lonely as a Cloud argues the opposite — that a moment's joy can be preserved for ever in memory.
   * **Why C:** Origin Story argues fragile love is worth protecting, not that decay always wins.
   * **Why D:** The Schoolboy is about a child stifled by school, not the souring of a harvest.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Blackberry-Picking" falls into two verse paragraphs — the first gathering the ripe fruit, the second finding it rotted. How does that two-part shape serve the poem?
   * **Options:** A) It has no effect — the two parts are interchangeable, B) The structure enacts the poem's turn from sweet ripeness to souring decay, so the form itself performs the loss it describes, C) It makes the poem a repeating, song-like ballad, D) It proves the berries never rotted
   * **Correct:** B
   * **Feedback:** ✓ Correct. The break between the sensuous gathering and the "rat-grey fungus" lets the form fall from ripeness into rot, so the shape of the poem carries its argument about impermanence.
   * **Why A:** The sequence — ripeness then decay — is the whole point; the parts cannot be swapped.
   * **Why C:** There is no repeating refrain; the poem moves forward, it does not circle like a ballad.
   * **Why D:** The second paragraph turns explicitly on the fruit fermenting and going "sour".

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the final line, "Each year I hoped they'd keep, knew they would not", reveal about "Blackberry-Picking"?
   * **Options:** A) That the speaker never picked berries again, B) A recognition that hoping to preserve something perfect cannot hold back time and decay, however much one wishes it, C) That the berries were never sweet to begin with, D) That the rot was the children's fault
   * **Correct:** B
   * **Feedback:** ✓ Correct. The closing admission sets hope against experience — every year the same longing to keep the fruit, and every year the same inevitable rot: an early lesson in impermanence.
   * **Why A:** The line implies the cycle recurs "each year", so the picking continues.
   * **Why C:** The fruit was sweet "Like thickened wine" at first — the loss is what makes the rot painful.
   * **Why D:** The rot is treated as natural and inevitable, not the children's fault.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that love and conflict are bound together as one — a mother and daughter joined and divided by the same "red rope of love" from birth to a present-day quarrel?
    * **Options:** A) Catrin, B) Cousin Kate, C) Origin Story, D) Dusting the Phone
    * **Correct:** A
    * **Feedback:** ✓ Correct. Clarke's "Catrin" runs from the "hot, white" room of birth to an argument over one more hour skating, arguing that the same rope that ties mother and daughter is what they both "Fought over".
    * **Why B:** Cousin Kate is about seduction, betrayal and defiant pride, not a mother-daughter bond.
    * **Why C:** Origin Story reflects on a couple's fragile love, not the tie between parent and child.
    * **Why D:** Dusting the Phone is about anxious longing for a lover's call, not motherhood.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "Catrin" runs its sentences on across the line-breaks (enjambment) rather than stopping neatly at each line's end. How does that shape its meaning?
    * **Options:** A) It makes the poem feel calm, resolved and orderly, B) The lines pull on across the breaks like the "red rope of love" itself, so the unbroken form enacts the tie of love and struggle that mother and daughter cannot cut, C) It shows the mother has lost all feeling for her daughter, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The sentences strain over the line-endings just as the rope pulls tight between them — the very movement of the verse embodies a bond that is also a tug-of-war.
    * **Why A:** The run-on lines create tension and pull, not calm resolution.
    * **Why C:** The straining form insists on a fierce, continuing connection, not lost feeling.
    * **Why D:** The enjambment mirroring the rope is central to how the poem feels.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the recurring image of the "red rope of love" suggest about the relationship in "Catrin"?
    * **Options:** A) That mother and daughter have never had any real connection, B) That love and conflict are bound together — the same tie that binds them is the very thing they pull against, C) That the daughter has left home for good, D) That the poem is really about two strangers
    * **Correct:** B
    * **Feedback:** ✓ Correct. The rope of love from birth returns at the poem's end as the daughter again pulls against her mother — the same bond that connects them is what both are fighting over.
    * **Why A:** The rope insists on a deep, continuing connection, not its absence.
    * **Why C:** The closing argument is over one more hour out, not a permanent parting.
    * **Why D:** Their "first" fierce confrontation makes clear this is mother and daughter, not strangers.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that an ordinary, fragile love is precious and worth protecting — retelling how the speaker's parents met when her mother bought her father's hand-drawn comic book for "one dollar"?
    * **Options:** A) Origin Story, B) Sonnet 29, C) Cousin Kate, D) I Shall Return
    * **Correct:** A
    * **Feedback:** ✓ Correct. Ewing's "Origin Story" opens "This is true" and likens her parents' modest love to a comic book — "love is like a comic book. it's fragile" — arguing that even an unglamorous love is worth cherishing.
    * **Why B:** Sonnet 29 argues the beloved's real presence outweighs even the richest thoughts of him, a different claim.
    * **Why C:** Cousin Kate is about betrayal and a wronged woman's defiant pride, not a cherished ordinary love.
    * **Why D:** I Shall Return is a vow to a lost homeland, not a parents' romance.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "Origin Story" is written in loose free verse with casual, lower-case punctuation, and likens the parents' love to a comic book that is "fragile". How does that form serve its meaning?
    * **Options:** A) Its strict rhyme and formal shape suggest a grand, timeless romance, B) The conversational, unpolished free verse makes the love feel ordinary and real, while the comic-book comparison suggests that something fragile is exactly what deserves careful protecting, C) A marching ballad-refrain makes the parents' story sound legendary, D) Rigid, numbered stanzas turn the poem into a case study
    * **Correct:** B
    * **Feedback:** ✓ Correct. The relaxed, spoken free verse reads like a story told aloud, and comparing the love to a comic book kept in "plastic and cardboard, dark rooms and boxes" makes plain that an ordinary, breakable love is still worth preserving.
    * **Why A:** The poem has no fixed rhyme or formal shape; its looseness is the point.
    * **Why C:** There is no sung refrain or legendary ballad tone.
    * **Why D:** Its loose, conversational form resists rigid, equal stanzas.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Origin Story"?
    * **Options:** A) It reframes the parents' courtship — meeting at "the Greyhound bus station", the comic book sold for "one dollar" — in the language of a superhero origin story, B) Comparing their love to a comic book that could "find its way to another decade" suggests ordinary, imperfect love can still be preserved and cherished, C) Its free verse and casual, lower-case punctuation give it a modern, conversational storytelling voice, D) It concludes that real relationships matter less than fictional ones
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Ewing borrows superhero "origin story" language, likens the parents' love to a comic book that might survive into "another decade", and tells it all in a free, conversational voice suited to modern storytelling.
    * **Why D:** The poem elevates the parents' real story rather than diminishing it against fiction.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that a boy soldier, thrown "Uncoffined" into an unmarked grave far from his "Wessex home", becomes for ever a part of the strange foreign land he never understood?
    * **Options:** A) Drummer Hodge, B) Disabled, C) Remains, D) War Photographer
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "Drummer Hodge" buries the boy beneath a "kopje-crest" and insists that "portion of that unknown plain" will be Hodge for ever — the alien land absorbing him eternally.
    * **Why B:** Disabled is about a maimed survivor's ruined life at home, not a burial abroad.
    * **Why C:** Remains is about a soldier's lasting guilt over a killing, not an anonymous grave.
    * **Why D:** War Photographer is about a public indifferent to distant suffering, not a soldier's burial.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Hardy tells "Drummer Hodge" in plain, regular, song-like rhyming stanzas. What does that steady form achieve, given the bleakness of the burial?
    * **Options:** A) The calm, controlled regularity lends the anonymous, unmarked death an understated, elegiac dignity, B) The chaotic, broken metre mirrors the violence of battle, C) The comic, jaunty rhythm mocks the dead boy, D) The form has no bearing on the meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The measured, ballad-like stanzas hold their composure over a desolate subject, and that quiet control is exactly what dignifies a boy tipped nameless into foreign soil.
    * **Why B:** The metre is even and controlled, not broken or violent.
    * **Why C:** The steady form mourns the boy; it never mocks him.
    * **Why D:** The dignity of the plain form against the bleak content is central to the poem.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does Hardy suggest by writing that "portion of that unknown plain" will be Hodge for ever, his "homely Northern breast and brain" growing to "some Southern tree"?
    * **Options:** A) That Hodge will be entirely forgotten, B) That even in an anonymous, alien grave the boy becomes permanently and intimately part of the foreign land he never understood, C) That his body will be brought home in the end, D) That the poem celebrates the glory of empire
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hardy turns the anonymity of the grave into a strange permanence — the boy's body merging with the "unknown plain" and its "strange-eyed constellations", so the unfamiliar land claims him for ever.
    * **Why A:** The poem's whole purpose is to memorialise Hodge, even in his namelessness.
    * **Why C:** The imagery insists he stays fused with the "some Southern tree" and plain, not returned home.
    * **Why D:** The tone mourns waste and estrangement, not imperial glory.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that war robs a young man of everything he had — following an ex-soldier who "sat in a wheeled chair, waiting for dark", remembering when "Town used to swing so gay" before he lost his legs?
    * **Options:** A) Disabled, B) Drummer Hodge, C) Kamikaze, D) Remains
    * **Correct:** A
    * **Feedback:** ✓ Correct. Owen's "Disabled" cuts between the maimed man's grey present and his vivid, admired past, arguing that a young life lured into war by romantic illusion returns broken and ignored.
    * **Why B:** Drummer Hodge is about a boy buried abroad, not a maimed survivor at home.
    * **Why C:** Kamikaze is about a pilot torn between duty and life, not lost limbs and youth.
    * **Why D:** Remains is about the guilt that haunts a soldier, not the loss of his body.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Owen structures "Disabled" by cutting between the soldier's bleak present and vivid memories of his able-bodied past. How does that serve the poem?
    * **Options:** A) A single unbroken present-tense account keeps the focus steady, B) Each cut between the grey present and the glow of memory sharpens the contrast, exposing exactly what war has taken from him, C) The strict, cheerful sonnet form lightens the mood, D) A dialogue between two soldiers shares the blame
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen swings between the wheelchair's cold present and remembered football, admiring girls and glory, so every shift measures the distance between what the soldier was and what war has left him.
    * **Why A:** The poem deliberately moves between past and present rather than staying in one moment.
    * **Why C:** Its tone is bitter and mournful, far from a cheerful form.
    * **Why D:** The soldier's own memory dominates; there is no second speaking soldier.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Disabled", Owen suggests the young man enlisted partly out of a naive, romantic idea of war and to impress a girl, only to return maimed and ignored.
    * **Answer:** True
    * **Feedback:** ✓ Correct. He joined for the glamour of "jewelled hilts" and to look "a god in kilts" for his girl, lying about his age — an illusion Owen exposes as hollow once the soldier returns broken and overlooked.
    * **WhyWrong:** This is true — the poem reveals the soldier's youthful, romanticised reasons for enlisting curdling into isolation and neglect on his return.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that a rigid code of honour can be crueller than death itself — following a pilot who turns back from his suicide mission, only to be treated by his own family "as though he no longer existed"?
    * **Options:** A) Kamikaze, B) Remains, C) Disabled, D) Drummer Hodge
    * **Correct:** A
    * **Feedback:** ✓ Correct. Garland's "Kamikaze" shows a pilot drawn back to life by the "green-blue translucent sea", then shunned by a family bound to an honour-code — arguing that such a code can punish the choice of life more harshly than death.
    * **Why B:** Remains is about the guilt of a killing, not a choice between duty and life.
    * **Why C:** Disabled is about a maimed survivor robbed of his youth, not a pilot's turning back.
    * **Why D:** Drummer Hodge is about a boy buried abroad, not a living pilot shunned at home.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** In "Kamikaze" the pilot never speaks; his story reaches us through his daughter's remembered voice. How does that framing shape the poem's effect?
    * **Options:** A) It lets the pilot justify himself directly to the reader, B) Because we judge him only through the family that later shunned him, the framing turns the poem into a quiet reckoning with the honour-code, letting the daughter's regret colour our sympathy, C) It makes the poem an impersonal news report, D) It has no effect on how we read the pilot
    * **Correct:** B
    * **Feedback:** ✓ Correct. Filtering the pilot's story through the daughter's voice means his choice reaches us wrapped in her later regret and the family's rejection, so the form itself weighs the human cost of the honour-code.
    * **Why A:** The pilot is silent throughout; he never speaks for himself.
    * **Why C:** The daughter's personal, remembering voice is the opposite of an impersonal report.
    * **Why D:** Hearing him only through the family that shunned him is exactly what shapes our judgement.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What central conflict does "Kamikaze" make us feel?
    * **Options:** A) A clash between two rival armies, B) A conflict between duty and honour on one side and the pull of life, family and beauty on the other — with the poem's sympathy for the pilot who chose life yet paid for it, C) A conflict between paper and stone, D) A conflict between a photographer and his subjects
    * **Correct:** B
    * **Feedback:** ✓ Correct. The pilot is torn between the honour-code demanding his death and the beauty of the sea and life that call him home — and the poem quietly sides with his choice, even as it costs him everything.
    * **Why A:** The conflict is inward and social, not a clash of armies.
    * **Why C:** There is no paper-and-stone imagery in this poem.
    * **Why D:** There is no photographer in "Kamikaze".

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that a comfortable public feels only a flicker of sympathy for distant suffering before returning to its ease — set through a man developing "spools of suffering" from "Belfast. Beirut. Phnom Penh."?
    * **Options:** A) War Photographer, B) Remains, C) Drummer Hodge, D) Disabled
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "War Photographer" sets the man's care against readers whose eyeballs "prick" with tears for a moment before comfort resumes and "they do not care" — an argument about indifference to others' pain.
    * **Why B:** Remains is about one soldier's private guilt, not the public's apathy.
    * **Why C:** Drummer Hodge is about a boy's anonymous burial, not photography or public feeling.
    * **Why D:** Disabled is about a maimed veteran at home, not distant war images and their audience.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the ordered form of "War Photographer" — regular, controlled six-line stanzas — serve the poem?
    * **Options:** A) It has no effect on meaning, B) The rigid order sits against the chaos of the war scenes, mirroring the photographer's effort to control and contain unbearable suffering, C) It makes the poem a heroic ballad, D) It proves the wars were peaceful
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat stanzas frame horror the way the photographer orders "spools of suffering" into manageable images — the tension between orderly form and chaotic content is the point.
    * **Why A:** The clash between form and content is central to the meaning.
    * **Why C:** Regular stanzas alone do not make a ballad; there is no narrative refrain.
    * **Why D:** The form contains the horror; it does not deny it.

27. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "War Photographer"?
    * **Options:** A) It criticises the public back home for feeling only brief, passing sympathy for others' suffering, B) The ordered, six-line stanzas contrast with the chaos of the scenes the photographer has witnessed, C) The photographer is left uneasy at the distance between suffering and its comfortable audience, D) It celebrates how deeply newspaper readers care about distant wars
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Duffy indicts public indifference, uses ordered stanzas to contain chaotic content, and leaves the photographer uneasy at how little his images truly change his audience.
    * **Why D:** The poem accuses readers of fleeting concern — "they do not care" — not deep or lasting care.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that war's deepest wound is the guilt that will not leave — a soldier reliving a shooting until the dead man is "here in my head", "his bloody life in my bloody hands"?
    * **Options:** A) Remains, B) Disabled, C) Drummer Hodge, D) Kamikaze
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Remains" follows a soldier haunted by shooting a looter, "probably armed, possibly not", arguing that the true cost of war is the trauma that follows him home.
    * **Why B:** Disabled is about lost limbs and youth, not a haunting act of killing.
    * **Why C:** Drummer Hodge is buried abroad, with no surviving guilt to carry.
    * **Why D:** Kamikaze is about a pilot's choice of life, not a soldier's guilt over a shooting.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Remains" is written as a loose, colloquial monologue that sounds like real spoken testimony — and that plain, spoken voice makes the trauma feel immediate and true.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The conversational, testimony-like voice strips away any poetic distance, so the horror lands as one man's raw, real experience — the form serving the sense of genuine trauma.
    * **WhyWrong:** This is true — the loose, colloquial monologue mimics real spoken testimony, and that plainness heightens the trauma.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the controlling idea of "Remains"?
    * **Options:** A) The glory of victory, B) The lasting psychological trauma and guilt of killing, which follows the soldier home long after the event, C) The beauty of the landscape, D) A celebration of army life
    * **Correct:** B
    * **Feedback:** ✓ Correct. The killing "remains" in the soldier's mind long after the event — Armitage centres the enduring psychological wound and guilt, a portrait of what we now call PTSD.
    * **Why A:** There is no glory here, only guilt and trauma.
    * **Why C:** The poem's focus is inward and psychological, not scenic.
    * **Why D:** It exposes war's cost rather than celebrating army life.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that a woman publicly ruined by a "great lord" can still hold a defiant private pride over the respectable "Cousin Kate" who replaced her — because she alone bore his "fair-haired son"?
    * **Options:** A) Cousin Kate, B) Sonnet 29, C) Dusting the Phone, D) Origin Story
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rossetti's "Cousin Kate" voices a cottage girl seduced and discarded, yet ending on the "gift you have not got" — the son who gives her a claim on the lord that Kate's marriage never can.
    * **Why B:** Sonnet 29 is a declaration of overwhelming love, not a tale of betrayal and defiant pride.
    * **Why C:** Dusting the Phone is about anxious longing for a lover's call, not seduction and social ruin.
    * **Why D:** Origin Story cherishes an ordinary love, not a wronged woman's bitter triumph.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Rossetti tells "Cousin Kate" in plain, song-like ballad stanzas. What does that traditional folk-song form achieve?
    * **Options:** A) It makes a private betrayal sound like a public, communal tale of wrong, giving the outcast woman a direct voice to accuse the lord and Kate, B) It makes the poem sound like a joyful celebration, C) It hides the story behind difficult, obscure language, D) It has no effect on the meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The ballad's clear, singing narrative carries her seduction and ruin as if it were a story the whole community should hear — and its direct address lets her answer back, "howl in dust" while Kate sits "in gold and sing".
    * **Why B:** The song-like form carries grievance and defiance, not celebration.
    * **Why C:** The ballad's plainness makes the story clear and public, not obscure.
    * **Why D:** The communal, accusing voice the ballad gives her is central to the effect.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the speaker mean by claiming she has "a gift you have not got" in the closing stanzas of "Cousin Kate"?
    * **Options:** A) That she is wealthier than Kate, B) That her son gives her a private pride and a claim on the lord that Kate's respectable marriage cannot provide, C) That she has forgiven the lord completely, D) That she plans to steal Kate's wedding ring
    * **Correct:** B
    * **Feedback:** ✓ Correct. Naming her son "my shame, my pride", the speaker finds the one thing status and marriage cannot give Kate — a defiant claim of her own, even from her cast-off position.
    * **Why A:** The poem stresses Kate's gold and comfort against the speaker's own poverty.
    * **Why C:** Her bitterness towards the lord and Kate runs through every stanza; there is no forgiveness.
    * **Why D:** The son, not a ring, is the "gift" she claims; the poem never mentions theft.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that even the richest thoughts of a beloved are a poor substitute for his real presence — the speaker's thoughts twining like "wild vines" about a tree until she begs to have him near instead?
    * **Options:** A) Sonnet 29, B) Cousin Kate, C) I Shall Return, D) Dusting the Phone
    * **Correct:** A
    * **Feedback:** ✓ Correct. In Barrett Browning's "Sonnet 29" thoughts grow thickly as "wild vines" over her "palm-tree", but she longs to "Renew thy presence" — ending "I do not think of thee—I am too near thee": presence outweighing imagination.
    * **Why B:** Cousin Kate is a ballad of betrayal and defiant pride, not devoted longing for presence.
    * **Why C:** I Shall Return longs for a homeland, not a beloved's physical nearness.
    * **Why D:** Dusting the Phone dwells on anxious, uncertain waiting, not a confident craving for presence over thought.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Sonnet 29" pours an overwhelming feeling into the tight fourteen-line sonnet form, turning at its volta. How does that form shape the poem's meaning?
    * **Options:** A) The strict form disciplines a feeling that threatens to overwhelm, and the volta pivots from imagined thought to a craving for real presence, so the shape enacts the poem's argument, B) The loose, sprawling form shows the speaker has no strong feeling, C) The form makes the poem a light, comic song, D) The form has no bearing on the meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The sonnet's discipline holds in a feeling as tangled as the "wild vines", and the volta breaks that tangle open — from thinking of the beloved to needing him near, so the turn of the form carries the turn of the thought.
    * **Why B:** The feeling is intense and contained by the form, not absent.
    * **Why C:** The tone is passionate and serious, not comic.
    * **Why D:** The form's containment and its volta are exactly what shape the meaning.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the final turn of "Sonnet 29"?
    * **Options:** A) The speaker decides she no longer loves him, B) The speaker rejects thought alone and longs instead for his actual, physical presence — "I do not think of thee—I am too near thee", C) The speaker compares him to a rival, D) The speaker describes a battle
    * **Correct:** B
    * **Feedback:** ✓ Correct. The close overturns the whole extended metaphor: real closeness would make thought unnecessary — "I do not think of thee—I am too near thee" — presence outweighing imagination.
    * **Why A:** The poem is a declaration of overwhelming love, not its rejection.
    * **Why C:** No rival appears; the poem addresses the beloved directly.
    * **Why D:** There is no battle; the metaphor is botanical — vines and a tree.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that waiting on another person's contact can slowly consume and trap you — a speaker who polishes and dresses for a silent phone, "Silver service. I polish it. I dress for it."?
    * **Options:** A) Dusting the Phone, B) Sonnet 29, C) Cousin Kate, D) I Shall Return
    * **Correct:** A
    * **Feedback:** ✓ Correct. Kay's "Dusting the Phone" turns a wait for a lover's call into an obsessive ritual, ending "I am trapped in it. I can't move." — arguing that dependence on another's contact erodes a person's balance.
    * **Why B:** Sonnet 29 is a confident craving for a beloved's presence, not anxious, trapped waiting.
    * **Why C:** Cousin Kate narrates a completed betrayal, not present-tense longing for a call.
    * **Why D:** I Shall Return is a vow to a homeland, not a wait for a lover.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the free-verse, fragmented form of "Dusting the Phone" — clipped lines like "The phone rings heralding some disaster. Sirens." — shape its effect?
    * **Options:** A) A fixed, rhyming sonnet builds calm certainty, B) The broken sentence-fragments, and the phone treated as if it holds power over her, enact a restless, obsessive anxiety, so the form itself feels like nervous waiting, C) A formal ballad narrates events from a calm distance, D) A strict villanelle's refrains offer reassurance
    * **Correct:** B
    * **Feedback:** ✓ Correct. The clipped fragments jump and stall like an anxious mind, and personifying the phone as something that "sends me hoaxes" gives it power over her — the form re-enacting obsessive, restless longing.
    * **Why A:** The poem has no fixed rhyme or sonnet calm.
    * **Why C:** The voice is close and agitated, not distanced and calm.
    * **Why D:** There are no reassuring villanelle refrains.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Dusting the Phone" suggest about the effect of waiting for a lover's call, given the speaker admits "I am trapped in it. I can't move."?
    * **Options:** A) That waiting brings only calm confidence, B) That drawn-out uncertainty and dependence on someone else's contact can wear away a person's emotional balance, trapping her even as she longs for the call, C) That the phone itself is broken, D) That the speaker no longer cares about the relationship
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem reveals how silence and uncertainty, stretched over time, erode confidence and hope — "I am trapped in it. I can't move." — however much the speaker longs to master her own feelings.
    * **Why A:** The anxious fragments show unease, not calm confidence.
    * **Why C:** The focus is emotional, not a literal fault with the telephone.
    * **Why D:** Her obsessive attention shows she cares intensely, not that she has stopped.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that returning to an idealised, remembered homeland will heal years of exile — vowing "I shall return" to its "forest fires", "bending grasses" and village "fiddle and fife"?
    * **Options:** A) I Shall Return, B) Decomposition, C) Drummer Hodge, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. McKay's "I Shall Return" repeats its vow across remembered homeland images, ending on returning to ease "long, long years of pain" — an argument that homecoming will heal exile.
    * **Why B:** Decomposition is about the guilt of aestheticising a stranger's suffering, not a longed-for homecoming.
    * **Why C:** Drummer Hodge concerns a boy who will never return, buried abroad.
    * **Why D:** Catrin is about a mother and daughter, not exile and homecoming.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "I shall return" recurs as a refrain through the stanzas of McKay's poem, before its closing couplet. How does that repetition shape the poem's effect?
    * **Options:** A) The repeated vow builds a mounting sense of longing and determination, gathering toward the resolving final couplet, B) The repetition suggests the speaker has given up and expects never to return, C) The refrain makes the poem sound like a comic nonsense rhyme, D) The repetition has no bearing on the feeling
    * **Correct:** A
    * **Feedback:** ✓ Correct. Each return of the vow deepens the longing and steadies the resolve, so that by the final couplet the promise of homecoming feels certain — the refrain enacting the determination the poem argues for.
    * **Why B:** The mounting refrain insists on certainty, never surrender.
    * **Why C:** The tone is heartfelt and yearning, not comic.
    * **Why D:** The building repetition is exactly what creates the sense of determination.

42. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "I Shall Return"?
    * **Options:** A) It expresses a longing to return to a remembered, idealised homeland, B) The repeated vow "I shall return" builds a growing sense of determination across the poem, C) The closing couplet links returning home to easing "long, long years of pain", D) It concludes that the speaker has given up on ever returning
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. McKay's speaker longs for a remembered homeland, repeats his vow with mounting determination, and ties the return to relief from "long, long years of pain".
    * **Why D:** The whole poem insists on the certainty of return, never abandoning the hope.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that framing another person's suffering as art can crowd out real compassion — a speaker guilty at having photographed a sleeping beggar in Bombay and "glibly called it 'The Man in the Street'"?
    * **Options:** A) Decomposition, B) War Photographer, C) I Shall Return, D) Cousin Kate
    * **Correct:** A
    * **Feedback:** ✓ Correct. Ghose's "Decomposition" moves from a detached "good composition" of a beggar to the man's posture that "chides me now" — arguing that aestheticising suffering can displace genuine empathy.
    * **Why B:** War Photographer indicts a distant public's apathy, not the speaker's own guilt at composing one image.
    * **Why C:** I Shall Return is a vow of homecoming, not a meditation on a photograph.
    * **Why D:** Cousin Kate is a ballad of betrayal, unrelated to photography or poverty.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Decomposition" is written in loose, unrhymed free verse. How does that form serve the poem?
    * **Options:** A) A fixed, rhyming ballad keeps the mood light, B) The loose free verse lets the description drift from a detached, artistic "composition" into the speaker's uncomfortable, guilty self-awareness, so the form follows his change of heart, C) A strict sonnet contains the feeling neatly, D) A villanelle's refrains circle back reassuringly
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unrhymed, shifting lines let the poem slide from composing an image to recognising the man's real suffering — the form loosening as the speaker's detachment gives way to guilt.
    * **Why A:** The poem has no rhyming ballad shape, and its mood is troubled, not light.
    * **Why C:** It keeps no strict sonnet form.
    * **Why D:** There are no reassuring repeating refrains.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Decomposition" suggest about observing another person's suffering as art?
    * **Options:** A) That artistic composition always matters more than compassion, B) That treating suffering as an aesthetic subject can dangerously overshadow genuine human empathy for the person suffering, C) That the beggar in the poem was never really suffering, D) That photography has no power to make us uncomfortable
    * **Correct:** B
    * **Feedback:** ✓ Correct. Ghose's speaker realises that framing the beggar's decay as a composed image risks replacing real compassion with detached aesthetic pleasure — a discomfort the poem forces the reader to share.
    * **Why A:** The poem's unease comes from privileging composition over compassion, not endorsing it.
    * **Why C:** The imagery of decay and poverty presents the man's suffering as painfully real.
    * **Why D:** The poem's whole effect depends on photography's power to unsettle and implicate its viewer.
