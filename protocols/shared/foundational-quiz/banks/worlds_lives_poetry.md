# Foundational Quiz Bank — AQA Worlds and Lives Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
45 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. Unlike
the universal forms bank (`poetic_forms.md`, Tier A) — and the prior forms-only Worlds and Lives
bank this file replaces — these are poem-specific, testing what the student has actually read.
The picker draws a random 5 per round, stratified across categories. Keys + feedback live
server-side and are stripped before questions reach the client. The AI is never the scorekeeper.

Categories: Recognising the Poem · Form & Features · Meaning & Effects
Types: MCQ · Fill · True-False · Select All

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the
course's reading order, so the quiz only serves poems the student has read:
- **@set:1** — Lines Written in Early Spring (Wordsworth) · A Century Later (Dharker) · Name Journeys (Mundair) · A Wider View (Seneviratne) · England in 1819 (Shelley)
- **@set:2** — Homing (Liz Berry) · A Portable Paradise (Robinson) · With Birds You're Never Lonely (Antrobus) · Pot (Khan) · The Jewellery Maker (Parker)
- **@set:3** — Shall Earth No More Inspire Thee (Brontë) · In a London Drawingroom (Eliot) · On an Afternoon Train from Purley to Victoria, 1955 (James Berry) · Thirteen (Femi) · Like an Heiress (Nichols)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Worlds and Lives Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem presents a speaker seated in a grove, listening to birdsong — "a thousand blended notes" — and grieving over "what man has made of man"?
   * **Options:** A) Lines Written in Early Spring, B) England in 1819, C) A Century Later, D) A Wider View
   * **Correct:** A
   * **Feedback:** ✓ Correct. Wordsworth's "Lines Written in Early Spring" sets nature's harmony against a mournful reflection on human cruelty, captured in "what man has made of man".
   * **Why B:** England in 1819 surveys a corrupt, ageing nation, not a grove of birdsong.
   * **Why C:** A Century Later concerns a girl's journey to school under threat, not a springtime grove.
   * **Why D:** A Wider View recalls an ancestor's industrial labour in Leeds, not a pastoral grove.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Lines Written in Early Spring" best described?
   * **Options:** A) A dramatic monologue spoken to a silent listener, B) A pastoral lyric in regular rhymed quatrains, linking nature to feeling, C) An inverted political sonnet, D) A free-verse narrative poem
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wordsworth uses the pastoral lyric — nature-focused, in tight rhymed quatrains — to connect the natural world directly to human emotion.
   * **Why A:** There is no single addressed listener being manipulated, as in a dramatic monologue.
   * **Why C:** The inverted sonnet describes England in 1819, not this quatrain poem.
   * **Why D:** The poem keeps a regular rhymed form, so it is not free verse.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What contrast does Wordsworth draw in "Lines Written in Early Spring"?
   * **Options:** A) Between two rival cities, B) Between the harmony he senses in nature and the harm human beings inflict on one another, C) Between rich and poor landowners, D) Between two poets' styles
   * **Correct:** B
   * **Feedback:** ✓ Correct. The peace and "blended notes" of the natural scene are set directly against the speaker's grief at human cruelty, sharpening the poem's quiet reproach.
   * **Why A:** The poem stays within one grove, not a comparison of cities.
   * **Why C:** There is no landowning dispute in the poem; its concern is human nature broadly.
   * **Why D:** The poem is a personal reflection, not literary criticism.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem, inspired by a real attack on a schoolgirl campaigning for girls' education, follows a bullet's path before turning to imagery of orchards and fields in bloom?
   * **Options:** A) A Century Later, B) Pot, C) Homing, D) Thirteen
   * **Correct:** A
   * **Feedback:** ✓ Correct. Dharker's "A Century Later" responds to the shooting of a girl targeted for defending girls' right to education, tracing the bullet before opening into hopeful, blooming imagery.
   * **Why B:** Pot addresses a looted artefact in a museum, not a schoolgirl activist.
   * **Why C:** Homing follows a mother's suppressed regional accent, not a shooting.
   * **Why D:** Thirteen recounts the speaker's own childhood encounter with the police, not a schoolgirl abroad.

5. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** "A Century Later" is written in free [BLANK], its loose, unfolding lines carrying the poem from violence into hope.
   * **Answer:** verse
   * **Feedback:** ✓ Correct. The free verse lets the poem move fluidly from the shock of violence into the peaceful, hopeful imagery that follows.
   * **WhyWrong:** The word is "verse" — free verse, whose openness lets the poem shift naturally between violence and hope.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does Dharker ultimately insist the girl is fighting for in "A Century Later"?
   * **Options:** A) Political office, B) The ordinary right to learn and attend school without fear, C) Wealth and status, D) Revenge against her attackers
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dharker frames the girl's courage as a claim to something simple and ordinary — the right to be educated and safe — making the violence against her feel all the more unjust.
   * **Why A:** The poem centres on education, not political ambition.
   * **Why C:** Her cause is access to learning, not material wealth.
   * **Why D:** The poem holds hope rather than a desire for revenge.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens "Like Rama I have felt the Wilderness", casting Sita as "loyal pure and true of heart" to parallel the speaker's own trials as her name crosses continents?
   * **Options:** A) Name Journeys, B) Homing, C) The Jewellery Maker, D) Like an Heiress
   * **Correct:** A
   * **Feedback:** ✓ Correct. Mundair's "Name Journeys" opens "Like Rama I have felt the Wilderness", casting Sita as "loyal pure and true of heart" to parallel the speaker's own trials of identity as her name crosses continents.
   * **Why B:** Homing concerns a mother's suppressed dialect, not a mispronounced name.
   * **Why C:** The Jewellery Maker follows a craftsman's working day, not a personal name.
   * **Why D:** Like an Heiress reflects on a remembered coastline, not mythological naming.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What effect does Mundair create through the loose punctuation and free verse of "Name Journeys", as her name "became a stumble / that filled English mouths / with a discordant rhyme"?
   * **Options:** A) A strict, formal argument, B) A sense of continuous, unresolved flow, echoing the speaker's ongoing search for identity, C) A comic, sing-song rhythm, D) A rigid list of facts
   * **Correct:** B
   * **Feedback:** ✓ Correct. The free verse and sparse punctuation let lines such as "my name / a journey between rough and smooth" run on without firm stops, mirroring an identity still in motion between cultures.
   * **Why A:** The poem is personal and reflective, not a formal argument.
   * **Why C:** Its tone is searching and serious, not comic — the name becomes "a discordant rhyme", not a sing-song one.
   * **Why D:** The poem explores feeling and memory, not a factual list.

9. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "Name Journeys", the speaker's name becomes a symbol of the wider struggle to hold on to cultural heritage while adapting to life in England, her voice ending "a mystery / in the Anglo Echo chamber – / void of history and memory".
   * **Answer:** True
   * **Feedback:** ✓ Correct. The mispronunciation and reshaping of the speaker's name — from the Punjabi "dislodged as milk teeth fell" to the "Anglo Echo chamber" — stands for the larger tension between preserving heritage and assimilating into a new culture.
   * **WhyWrong:** This is the poem's central idea — the name carries the weight of heritage under pressure to assimilate, its history left "void" in the "Anglo Echo chamber".

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem imagines a great-great-grandfather "combing flax beneath / the conicals of light in Marshall's Temple Mill", still finding space to "stack his dreams" above the smoke?
    * **Options:** A) A Wider View, B) In a London Drawingroom, C) Thirteen, D) Shall Earth No More Inspire Thee
    * **Correct:** A
    * **Feedback:** ✓ Correct. Seneviratne's "A Wider View" imagines an ancestor labouring "twelve hours combing flax" in Marshall's Temple Mill, his eyes "dry with dust", yet still holding on to dreams beyond the "smoke-filled sky".
    * **Why B:** In a London Drawingroom looks out from a Victorian window at a bleak cityscape, not a mill.
    * **Why C:** Thirteen is set among the police and an inner-city estate, not a Victorian mill.
    * **Why D:** Shall Earth No More Inspire Thee is addressed to a grieving dreamer by personified Nature, not an ancestor in a mill.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "A Wider View" structured, as lines such as "he took the long way home because / he craved the comfort of a wider view" carry the narrative forward?
    * **Options:** A) As a strict sonnet, B) As five mostly regular, unrhymed free-verse stanzas, using enjambment to carry a first-person narrative, C) As a single rhyming couplet, D) As a dramatic monologue addressed to a silent Duke
    * **Correct:** B
    * **Feedback:** ✓ Correct. The five unrhymed, loosely regular stanzas and frequent enjambment — as in "he craved the comfort of a wider view" — let the narrative move forward steadily, carrying the reader through the ancestor's working day.
    * **Why A:** The poem runs across five stanzas, not a fourteen-line sonnet.
    * **Why C:** It is a developed narrative, not a single couplet.
    * **Why D:** There is no addressed listener being manipulated, unlike a dramatic monologue.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does "A Wider View" suggest about the relationship between the speaker and their ancestor, closing with the two "timeless in the flux of time, anchored / only by the axis of our gaze"?
    * **Options:** A) That the past has no bearing on the present, B) That the hardship and hope of the ancestor's industrial labour still echo in the speaker's own sense of family and continuity, C) That the ancestor was wealthy and idle, D) That the speaker resents their family history
    * **Correct:** B
    * **Feedback:** ✓ Correct. Seneviratne bridges past and present, tracing how the ancestor's gruelling labour and enduring hope still shape the speaker's sense of family legacy, the two "anchored / only by the axis of our gaze" across generations.
    * **Why A:** The poem's whole structure connects past labour to present reflection.
    * **Why C:** The ancestor is depicted labouring gruelling hours, not living in comfort.
    * **Why D:** The tone is one of connection and respect, not resentment.

13. **Type: Select All [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which statements correctly describe "England in 1819" by Shelley?
    * **Options:** A) It opens by describing "An old, mad, blind, despised, and dying king", B) It catalogues the nation's corrupt rulers and institutions before turning towards hope, C) It closes with the image of a "glorious Phantom" that may yet burst forth to illuminate the age, D) It celebrates the King's long and successful reign
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Shelley opens on the failing king, piles up the nation's corruption, and closes on the hope of a "glorious Phantom" rising to illuminate a "tempestuous day".
    * **Why D:** The poem is a bitter attack on the king and his corrupt court, not a celebration of his reign.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** What is unusual about the sonnet form Shelley uses in "England in 1819"?
    * **Options:** A) It has thirty lines, B) It inverts the sonnet's usual structure, piling up grievances before a late turn towards hope, C) It has no rhyme scheme at all, D) It is spoken by two alternating characters
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rather than following the sonnet's normal shape, Shelley reorders it — heaping up the nation's ills first — so the turn to hope arrives only at the very end.
    * **Why A:** It remains a fourteen-line sonnet, not thirty lines.
    * **Why C:** The poem keeps rhyme, though it reorders the form's usual structure.
    * **Why D:** It is a single continuous political vision, not a dialogue.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** Why might Shelley have chosen the sonnet — a form linked with order and tradition — to attack the establishment in "England in 1819"?
    * **Options:** A) Because sonnets can only address romantic love, B) Because turning a form linked to authority and order against that same authority sharpens the poem's political force, C) Because it made the poem easier to memorise, D) Because sonnets were banned at the time
    * **Correct:** B
    * **Feedback:** ✓ Correct. Using the sonnet's traditional authority to attack the very establishment that form is associated with makes Shelley's political critique more pointed and ironic.
    * **Why A:** Sonnets can address many subjects; the irony here lies in form versus content.
    * **Why C:** Memorability is not the reason Shelley gives the form political weight.
    * **Why D:** There is no suggestion the form itself was restricted; the choice is a deliberate irony.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem uses the closing image "send your words, like pigeons, / fluttering for home" to describe a mother's regional dialect, kept "in a box beneath the bed", finally returning to where it belongs?
    * **Options:** A) Homing, B) A Portable Paradise, C) Pot, D) With Birds You're Never Lonely
    * **Correct:** A
    * **Feedback:** ✓ Correct. Liz Berry's "Homing" keeps the mother's accent "in a box beneath the bed" until, in the closing image, her words are sent "like pigeons, / fluttering for home".
    * **Why B:** A Portable Paradise concerns a grandmother's advice about carrying inner peace, not a returning accent.
    * **Why C:** Pot addresses a museum artefact and colonial history, not a dialect.
    * **Why D:** With Birds You're Never Lonely compares London and New Zealand through birdsong, not homing pigeons.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "Homing" structured, moving from suppressed dialect words such as "bibble, fittle, tay, wum" to the closing pigeon image?
    * **Options:** A) A strict rhyming sonnet, B) Free verse across five equal stanzas, its lack of fixed rhyme or metre echoing the natural, unforced quality of dialect, C) A single rhyming couplet, D) A ballad with a repeated chorus
    * **Correct:** B
    * **Feedback:** ✓ Correct. The five free-verse stanzas, without regular rhyme or metre, mirror the organic, unforced sound of words such as "bibble, fittle, tay, wum" — the Black Country dialect the poem reclaims.
    * **Why A:** The poem uses no fixed rhyme scheme, so it is not a sonnet.
    * **Why C:** It develops across five stanzas, not a single couplet.
    * **Why D:** There is no repeated sung chorus, as in a ballad.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the blacksmith's forge imagery — "I wanted to forge your voice / in my mouth, a blacksmith's furnace" — suggest in "Homing"?
    * **Options:** A) That the speaker rejects her mother's heritage entirely, B) That the speaker wants to reshape and reclaim her mother's suppressed accent in her own voice, C) That the family worked as blacksmiths, D) That language cannot be changed once learned
    * **Correct:** B
    * **Feedback:** ✓ Correct. The forging image suggests the speaker actively reshaping her inheritance, taking her mother's suppressed dialect — once silenced by "the teacher's ruler across your legs" — and remaking it, unashamed, in her own voice.
    * **Why A:** The poem embraces heritage rather than rejecting it.
    * **Why C:** The forge is used as a metaphor for reshaping language, not a literal trade.
    * **Why D:** The whole poem is built on language being reclaimed and remade.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a grandmother advise the speaker to carry paradise "always on my person, concealed, so no one else would know"?
    * **Options:** A) A Portable Paradise, B) Like an Heiress, C) The Jewellery Maker, D) A Wider View
    * **Correct:** A
    * **Feedback:** ✓ Correct. Roger Robinson's "A Portable Paradise" takes its central idea from a grandmother's advice to carry an inner, hidden paradise that cannot be taken away.
    * **Why B:** Like an Heiress reflects on a remembered coastline and pollution, not a grandmother's advice.
    * **Why C:** The Jewellery Maker follows a craftsman's working day, not inherited advice about paradise.
    * **Why D:** A Wider View recalls an ancestor's mill labour, not a portable inner paradise.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "A Portable Paradise", Robinson uses a warm, conversational free-[BLANK] voice, directly addressing the reader as he passes on his grandmother's advice.
    * **Answer:** verse
    * **Feedback:** ✓ Correct. The relaxed, conversational free verse gives the advice an intimate, spoken quality, as though passed directly from grandmother to speaker to reader.
    * **WhyWrong:** The word is "verse" — free verse, whose conversational ease suits the intimacy of passed-down advice.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the "portable paradise" ultimately represent in the poem?
    * **Options:** A) A physical location the speaker owns, B) An inner sense of hope and belonging that can be carried anywhere and cannot be stolen, C) A holiday destination, D) A grandmother's house
    * **Correct:** B
    * **Feedback:** ✓ Correct. Robinson presents paradise as something internal and self-made — hope, memory and belonging carried within — safe from being taken by others.
    * **Why A:** The paradise is explicitly hidden and internal, not a physical place.
    * **Why C:** The poem is not concerned with travel or holidays.
    * **Why D:** The grandmother gives the advice, but the paradise is not her house itself.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem, written by a Deaf poet, compares the isolation of grey London trees with the "sun-syrupped Kauri trees" and "brazen Tui birds" of Zealandia?
    * **Options:** A) With Birds You're Never Lonely, B) Homing, C) Thirteen, D) A Century Later
    * **Correct:** A
    * **Feedback:** ✓ Correct. Raymond Antrobus's "With Birds You're Never Lonely" sets London's isolated, grey trees against the "sun-syrupped Kauri trees" and "brazen Tui birds" he finds in New Zealand's forest.
    * **Why B:** Homing concerns a mother's dialect, not birdsong and two countries.
    * **Why C:** Thirteen is set on a London estate with the police, not New Zealand.
    * **Why D:** A Century Later concerns a schoolgirl's courage, not birdsong across two countries.

23. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "With Birds You're Never Lonely" is written mostly in couplets, ending on the single standalone line "who said with birds you're never lonely."
    * **Answer:** True
    * **Feedback:** ✓ Correct. The couplets suggest harmony and togetherness, while the isolated closing line — "who said with birds you're never lonely" — breaks that pattern at the close.
    * **WhyWrong:** This is true — the poem's couplets suggest togetherness, and the final standalone line, "who said with birds you're never lonely", deliberately breaks that pattern.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the young Māori woman's knowledge of bird calls — a skill "she learned from her grandfather" — represent in the poem?
    * **Options:** A) A trivial hobby, B) A traditional, inherited connection to nature and community that the speaker contrasts with urban isolation, C) A scientific classification system, D) A rejection of her grandfather's teaching
    * **Correct:** B
    * **Feedback:** ✓ Correct. Her inherited skill in recognising bird calls stands for a living connection to nature and community passed down through family, set against the isolation Antrobus feels for "any grey tree in London, / for the family they don't have".
    * **Why A:** The poem treats this knowledge as meaningful and rooted, not trivial.
    * **Why C:** The focus is on inherited cultural connection, not formal science.
    * **Why D:** She embraces rather than rejects her grandfather's teaching.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does the speaker address a museum artefact directly as "pot", admitting "I know half of the story pot / of where you come from"?
    * **Options:** A) Pot, B) The Jewellery Maker, C) In a London Drawingroom, D) Like an Heiress
    * **Correct:** A
    * **Feedback:** ✓ Correct. Shamshad Khan's "Pot" speaks directly to a displaced artefact — "I know half of the story pot" — questioning the half of its history that colonial theft has obscured.
    * **Why B:** The Jewellery Maker concerns a living craftsman, not a museum object.
    * **Why C:** In a London Drawingroom describes a bleak city view, not a spoken-to artefact.
    * **Why D:** Like an Heiress reflects on a coastline, not a museum object.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does Khan structure "Pot", repeating questions such as "did they say you were bought pot" and "did they say you were lost pot"?
    * **Options:** A) As a strict rhyming ballad, B) As a questioning, speculative address to the pot, using its uncertain history to mirror the speaker's own questions about belonging, C) As a list of museum facts, D) As a fixed fourteen-line sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's questioning, speculative address — "did they say you were bought pot", "did they say you were lost pot" — mirrors the speaker's own uncertain search for belonging and identity as part of the diaspora.
    * **Why A:** There is no song-like refrain or strict rhyme scheme.
    * **Why C:** The poem is reflective and personal, not a factual list.
    * **Why D:** It is not confined to fourteen lines or a sonnet's rhyme scheme.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the pot come to symbolise in the poem, as the speaker admits "you think they wouldn't recognise you pot / say diaspora / you left now / you're not really one of us"?
    * **Options:** A) Purely a decorative museum piece with no wider meaning, B) Displaced cultural artefacts and people alike, caught between their origins and a foreign setting, C) A celebration of British museum collections, D) An object with a fully known, uncontested history
    * **Correct:** B
    * **Feedback:** ✓ Correct. The pot becomes a symbol for objects and people displaced by colonial history and migration, unsettled between where they came from and a new setting where it is told "you're not really one of us".
    * **Why A:** The poem treats the pot as carrying deep, unresolved meaning, not mere decoration.
    * **Why C:** The tone questions rather than celebrates how the pot came to be there.
    * **Why D:** The speaker openly admits only knowing "half of the story".

28. **Type: Select All [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which statements correctly describe "The Jewellery Maker" by Louisa Adjoa Parker?
    * **Options:** A) A jewellery maker walks to his workshop, continuing a trade passed down from his father and grandfather, B) He greets people warmly on his way to work, C) The poem highlights the contrast between the luxury he creates and the simplicity of his own life, D) The poem is set inside a courtroom
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Parker follows the jewellery maker's warm, ordinary walk to a trade inherited across generations, using his craft to highlight the gap between the wealth he creates and his own simple life.
    * **Why D:** The poem follows the man's walk and workshop, not a courtroom.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What technique does Parker use in the simile describing the jewellery maker laying out his tools "the way a surgeon might"?
    * **Options:** A) It mocks his profession, B) It emphasises the precision and skill his craft demands, comparing it to a medical professional's care, C) It suggests he is actually a doctor, D) It has no effect on tone
    * **Correct:** B
    * **Feedback:** ✓ Correct. Comparing his careful tool-laying to a surgeon's precision elevates his craft, presenting the skill and care his work demands as equal to that of a trained professional.
    * **Why A:** The comparison honours his skill rather than mocking it.
    * **Why C:** The simile is figurative, not a literal claim about his profession.
    * **Why D:** The simile shapes the reader's respect for his precision and care.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What wider point does "The Jewellery Maker" make?
    * **Options:** A) That craftsmanship is worthless, B) That societal structures often mean some benefit unfairly from the labour and skill of others, C) That all jewellery makers become wealthy, D) That family trades should be abandoned
    * **Correct:** B
    * **Feedback:** ✓ Correct. Parker draws attention to the disparity between the luxury the jewellery maker creates for others and the modest life his own skilled labour affords him.
    * **Why A:** The poem values his craftsmanship highly, not as worthless.
    * **Why C:** The poem depicts his own life as remaining simple, not one of wealth.
    * **Why D:** The poem honours the continuity of the family trade rather than rejecting it.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem gives nature a voice, urging a "lonely dreamer" to return and be comforted by its "mountain breezes" and "magic power"?
    * **Options:** A) Shall Earth No More Inspire Thee, B) In a London Drawingroom, C) A Wider View, D) England in 1819
    * **Correct:** A
    * **Feedback:** ✓ Correct. Brontë's "Shall Earth No More Inspire Thee" personifies Nature speaking directly to a grieving "lonely dreamer", promising to soothe and inspire them once more.
    * **Why B:** In a London Drawingroom laments a bleak city view, without Nature personified as a speaking comforter.
    * **Why C:** A Wider View is spoken by a descendant remembering an ancestor, not personified Nature.
    * **Why D:** England in 1819 is a political attack on the state, not an address from Nature.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Shall Earth No More Inspire Thee" structured?
    * **Options:** A) A single long unbroken stanza of free verse, B) Seven quatrains in a consistent ABAB rhyme, giving the address an ode-like, elevated and persuasive quality, C) A Shakespearean sonnet, D) A dramatic monologue with a silent listener being manipulated
    * **Correct:** B
    * **Feedback:** ✓ Correct. The seven regular ABAB quatrains give Nature's appeal a raised, persuasive, ode-like tone as it urges the dreamer to return.
    * **Why A:** The poem is organised into regular quatrains, not one unbroken free-verse stanza.
    * **Why C:** It runs to twenty-eight lines across seven quatrains, not a fourteen-line sonnet.
    * **Why D:** Nature speaks with open, comforting intent, not the withheld menace of a dramatic monologue.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does personified Nature offer the grieving dreamer in the poem?
    * **Options:** A) Wealth and status, B) Comfort, companionship and the power to drive away grief, if the dreamer will return to it, C) A warning of future disaster, D) Silence and isolation
    * **Correct:** B
    * **Feedback:** ✓ Correct. Nature offers itself as comrade and healer, promising its "magic power" to drive away grief if only the dreamer will return and dwell with it.
    * **Why A:** The offer is emotional and spiritual comfort, not material reward.
    * **Why C:** The tone is comforting and inviting, not a warning of disaster.
    * **Why D:** Nature offers companionship, directly opposed to isolation.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a sky "cloudy, yellowed by the smoke" and houses opposite that cut the sky "like solid fog", ending on the image of a "huge prison-house"?
    * **Options:** A) In a London Drawingroom, B) Homing, C) A Century Later, D) Pot
    * **Correct:** A
    * **Feedback:** ✓ Correct. George Eliot's "In a London Drawingroom" paints a bleak, smoke-yellowed cityscape, closing with the sense that the world outside has become a "huge prison-house".
    * **Why B:** Homing concerns a suppressed regional accent, not a smoke-choked cityscape.
    * **Why C:** A Century Later follows a schoolgirl's courage, not a drawingroom view.
    * **Why D:** Pot addresses a museum artefact, not a bleak city window.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "In a London Drawingroom" is written as a single 19-line stanza in unrhymed [BLANK] pentameter, its unbroken rhythm echoing the "monotony of surface and of form" it describes.
    * **Answer:** iambic
    * **Feedback:** ✓ Correct. The steady, unrhymed iambic pentameter mirrors the flat, unrelieved monotony of the city view the poem describes.
    * **WhyWrong:** The word is "iambic" — unrhymed iambic pentameter, whose steady rhythm reflects the scene's monotony.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What overall impression does Eliot create of London life in this poem?
    * **Options:** A) Vibrant and full of colour, B) Oppressive, monotonous and isolating, as though the city itself were a kind of prison, C) Peaceful and connected to nature, D) Full of warmth between neighbours
    * **Correct:** B
    * **Feedback:** ✓ Correct. Eliot's bleak imagery of smoke, fog-like walls and unbroken monotony builds a sense of the city as an oppressive, isolating "prison-house".
    * **Why A:** The poem's imagery is smoke-yellowed and grey, not colourful.
    * **Why C:** The city view is explicitly cut off from any sense of nature.
    * **Why D:** The tone stresses isolation, not neighbourly warmth.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does an English woman ask a Jamaican train passenger, "What part of Africa is Jamaica?"
    * **Options:** A) On an Afternoon Train from Purley to Victoria, 1955, B) Thirteen, C) A Wider View, D) Pot
    * **Correct:** A
    * **Feedback:** ✓ Correct. James Berry's poem captures a well-meaning but ignorant question from an English woman on a train, revealing common misunderstandings about the Caribbean in 1950s Britain.
    * **Why B:** Thirteen is set on a London estate with the police, not a train conversation.
    * **Why C:** A Wider View concerns an ancestor's mill labour, not a 1950s train journey.
    * **Why D:** Pot addresses a museum artefact, not a spoken exchange on a train.

38. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "On an Afternoon Train from Purley to Victoria, 1955" is written across five stanzas of varying length, in free verse without a fixed rhyme scheme.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Berry's five uneven, free-verse stanzas let the conversation unfold naturally, without the constraint of a fixed pattern.
    * **WhyWrong:** This is true — the poem's five stanzas vary in length and follow no fixed rhyme scheme, letting the exchange unfold naturally.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What overall tone does Berry create in this poem?
    * **Options:** A) Pure anger and confrontation, B) A mixture of gentle humour, cultural misunderstanding and an underlying sense that even a clumsy attempt at connection can be moving, C) Complete indifference between the two passengers, D) Triumphant celebration of shared culture
    * **Correct:** B
    * **Feedback:** ✓ Correct. Berry balances the woman's cultural ignorance with genuine warmth, suggesting that her clumsy, well-meaning effort at connection still carries real feeling.
    * **Why A:** The tone is tinged with humour and warmth, not pure anger.
    * **Why C:** The two passengers do engage with one another, however imperfectly.
    * **Why D:** The exchange is muddled and touching, not a clean celebration of shared culture.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem recounts the poet's real experience of being questioned by police at thirteen — "Thirteen, you'll tell him: you're thirteen" — recognising an officer from a school visit where he had once called the pupils "supernovas"?
    * **Options:** A) Thirteen, B) Pot, C) Homing, D) With Birds You're Never Lonely
    * **Correct:** A
    * **Feedback:** ✓ Correct. Caleb Femi's "Thirteen" recalls being confronted by police as a child — "Thirteen, you'll tell him: you're thirteen" — the "supernova" praise from an earlier school visit now bitterly at odds with how he is treated.
    * **Why B:** Pot addresses a museum artefact, not a childhood police encounter.
    * **Why C:** Homing concerns a mother's suppressed dialect, not policing.
    * **Why D:** With Birds You're Never Lonely compares London and New Zealand through birdsong, not a police encounter.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What effect does Femi's use of the second-person perspective have in "Thirteen", as in "You will be four minutes from home / when you are cornered by an officer"?
    * **Options:** A) It distances the reader from the events, B) It draws the reader directly into the experience, making the injustice feel immediate and shared, C) It makes the poem read like a formal report, D) It removes any sense of feeling from the poem
    * **Correct:** B
    * **Feedback:** ✓ Correct. Addressing the reader as "you" pulls them directly into the encounter — "You will watch the two men cast lots for your organs" — making the racial profiling and injustice feel immediate rather than distant.
    * **Why A:** The second person draws the reader closer, not further away.
    * **Why C:** The voice is personal and charged, not clinically formal.
    * **Why D:** The direct address intensifies feeling rather than removing it.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the "supernova" image come to represent, as the poem closes recalling that supernovas "are, in fact, dying stars / on the verge of becoming black holes"?
    * **Options:** A) A literal astronomy lesson, B) The painful gap between the childhood promise once seen in the speaker and the way systemic racism later treats him, C) A celebration of the police officer's kindness, D) A description of the weather that day
    * **Correct:** B
    * **Feedback:** ✓ Correct. The bright promise once seen in the "supernova" image collapses into the harsh reality of being profiled and seen as "powerless – plump", exposing how systemic racism crushes youthful potential.
    * **Why A:** The image is symbolic, not a literal science lesson.
    * **Why C:** The poem exposes the officer's hypocrisy rather than celebrating him.
    * **Why D:** The image concerns identity and potential, not weather.

43. **Type: Select All [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which statements correctly describe "Like an Heiress" by Grace Nichols?
    * **Options:** A) The speaker compares herself to an heiress inheriting the beauty of a remembered coastline, B) The poem reflects on a return to a childhood coastal landscape, C) The poem confronts pollution — "tyres, bottles, and Styrofoam" — washed back onto the shore, D) The poem is set entirely inside a museum
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Nichols casts the speaker as heiress to a remembered coastal childhood, then confronts that inheritance with the pollution now washing back onto the shore.
    * **Why D:** The poem is set on a remembered coastline, not inside a museum.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does Nichols shape "Like an Heiress"?
    * **Options:** A) As a strict, traditionally rhymed sonnet, B) As a fourteen-line poem that echoes the sonnet's length but is written in free verse, without its regular rhyme or metre, C) As a ballad with a repeated refrain, D) As a piece of unstructured prose
    * **Correct:** B
    * **Feedback:** ✓ Correct. Nichols keeps the sonnet's traditional fourteen lines but frees it from regular rhyme and metre, reshaping the love-poem form to voice her feeling for a threatened homeland.
    * **Why A:** The poem keeps sonnet length but abandons the sonnet's traditional strict rhyme.
    * **Why C:** There is no repeated sung refrain, as in a ballad.
    * **Why D:** It remains a fourteen-line poem, not unstructured prose.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the central tension in "Like an Heiress"?
    * **Options:** A) Between two rival heiresses, B) Between treasured childhood memories of natural beauty and the damage done to that same coastline by pollution, C) Between wealth and poverty in the same family, D) Between two different poets' styles
    * **Correct:** B
    * **Feedback:** ✓ Correct. Nichols sets her inherited, treasured memories of the coastline against the painful reality of the pollution now washing back onto it.
    * **Why A:** The poem concerns one speaker's inheritance, not rival heiresses.
    * **Why C:** The "heiress" image concerns natural inheritance, not family wealth or poverty.
    * **Why D:** The tension is personal and environmental, not a literary comparison.
