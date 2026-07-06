# Foundational Quiz Bank — OCR Poetry Anthologies (Poems)

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
anthology's three thematic sections, so the quiz only serves poems the student has read:
- **@set:1** — Love and Relationships (Love & Identity): Flirtation (Dove) · Poem for my Love (Jordan) · Lullaby (Asghar) · The Perseverance (Antrobus) · Looking at Your Hands (Carter)
- **@set:2** — Conflict: Papa-T (D'Aguiar) · Songs for the People (Harper) · We Lived Happily during the War (Kaminsky) · Colonization in Reverse (Bennett) · Thirteen (Femi)
- **@set:3** — Youth and Age: Equilibrium (Lola) · Prayer (Kunial) · Happy Birthday Moon (Antrobus) · Tea With Our Grandmothers (Shire) · Theme for English B (Hughes)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: OCR Poetry Anthologies

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem imagines "An orange, peeled and quartered" flaring "like a tulip on a wedgewood plate" as a small ritual before "Anything can happen" between two people?
   * **Options:** A) Flirtation, B) Poem for my Love, C) Lullaby, D) Looking at Your Hands
   * **Correct:** A
   * **Feedback:** ✓ Correct. Rita Dove's "Flirtation" builds its hesitant, expectant mood from small domestic details — the peeled orange "like a tulip on a wedgewood plate" — before "Anything can happen."
   * **Why B:** Poem for my Love pictures a settled night beside a sleeping partner, not an orange on a plate.
   * **Why C:** Lullaby is a bedtime story about two dead parents reunited underground, not a shared meal.
   * **Why D:** Looking at Your Hands is a declaration of political commitment, with no orange or plate.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Flirtation" by Rita Dove shaped on the page?
   * **Options:** A) A single unbroken block of prose, B) Short, unrhymed two-line stanzas (couplets) in free verse, C) A strict rhyming sonnet, D) A repeating pantoum
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dove's poem unfolds in brief, unrhymed two-line stanzas, its light, unhurried pacing matching the poem's hesitant, expectant mood.
   * **Why A:** The poem is broken into distinct short stanzas, not run together as prose.
   * **Why C:** There is no fixed rhyme scheme or fourteen-line structure here.
   * **Why D:** The Moon poem, "Happy Birthday Moon," uses repeating lines, not this poem.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the closing image of a "topiary" walked "through" suggest about the poem's central moment?
   * **Options:** A) That the moment should be rushed to its conclusion, B) That delaying the point of contact is itself part of the pleasure, C) That the garden setting matters more than the two people, D) That the moment ends in disappointment
   * **Correct:** B
   * **Feedback:** ✓ Correct. Shaping the moment "so the pleasure's in / walking through" suggests that lingering in anticipation, rather than rushing to a conclusion, is where the delight lies.
   * **Why A:** The image values a slow approach, not haste.
   * **Why C:** The topiary is a metaphor for the moment itself, not a literal garden.
   * **Why D:** The tone throughout is expectant and pleasurable, not disappointed.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In June Jordan's poem, the speaker says: "I am amazed by [BLANK]", naming the quiet contentment found beside a sleeping partner.
   * **Answer:** peace
   * **Feedback:** ✓ Correct. "I am amazed by peace" names the quiet wonder Jordan's speaker feels simply lying beside someone she loves.
   * **WhyWrong:** The word is "peace" — the speaker marvels at the stillness and peace of the shared night, not at anything more dramatic.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Poem for my Love" structured?
   * **Options:** A) A single unbroken stanza with no end punctuation, letting the thought flow continuously, B) Four rhymed quatrains, C) A dramatic monologue addressed to a stranger, D) A pantoum with repeating lines
   * **Correct:** A
   * **Feedback:** ✓ Correct. Jordan lets the poem run as one continuous stanza without full stops, so the speaker's wonder flows uninterrupted, mirroring the quiet, unbroken night.
   * **Why B:** There is no rhyme scheme or stanza break here.
   * **Why C:** The poem is addressed intimately to a sleeping loved one, not a stranger.
   * **Why D:** The repeating-line pantoum shape belongs to "Happy Birthday Moon," not this poem.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** "Poem for my Love" finds profundity in an ordinary, undramatic moment — simply lying beside someone breathing in the quiet air.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Jordan elevates a small, undramatic moment — a partner "asleep and breathing in the quiet air" — into a source of amazement and peace.
   * **WhyWrong:** This is the poem's method — its wonder comes from an ordinary shared stillness, not from any dramatic event.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem imagines a dead father buried in Pakistan and a dead mother buried in New York City meeting each other in a dream each night?
   * **Options:** A) Lullaby, B) Flirtation, C) The Perseverance, D) Looking at Your Hands
   * **Correct:** A
   * **Feedback:** ✓ Correct. Fatimah Asghar's "Lullaby" imagines "a man buried in pakistan" and "a woman buried in new york city" meeting through a tunnel that opens between their two worlds each night.
   * **Why B:** Flirtation is about anticipation before a meeting between living people, not deceased parents.
   * **Why C:** The Perseverance is set outside a pub, not in an imagined underworld.
   * **Why D:** Looking at Your Hands is a political declaration, with no buried parents.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What is distinctive about how "Lullaby" appears on the page?
   * **Options:** A) It is written in short two-line stanzas entirely without capital letters, B) It uses a strict rhyme scheme and formal capitalisation, C) It is a fourteen-line sonnet, D) It is written as a single justified prose block
   * **Correct:** A
   * **Feedback:** ✓ Correct. Asghar's couplets run in lower case throughout, giving the poem the hushed, informal intimacy of a story told quietly at bedtime.
   * **Why B:** The poem has no fixed rhyme scheme, and deliberately avoids capital letters.
   * **Why C:** At eleven couplets, it is far longer than a fourteen-line sonnet.
   * **Why D:** The poem is broken into short two-line stanzas, not one prose block.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What comfort does the story-within-the-poem offer in "Lullaby"?
   * **Options:** A) It proves that death ends all connection between people, B) It imagines a tender reunion between the speaker's dead parents, easing sadness with an invented myth, C) It warns the listener never to sleep, D) It argues that separated people should stop dreaming of each other
   * **Correct:** B
   * **Feedback:** ✓ Correct. The sister's bedtime story reimagines the dead parents dancing together underground, turning grief and separation into a tender, comforting myth.
   * **Why A:** The poem imagines ongoing connection after death, not its end.
   * **Why C:** Sleep is what opens the tunnel between the two worlds, not something to avoid.
   * **Why D:** The dreaming and dancing of "the lovers" is presented warmly, not as a warning against it.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem is named after a pub, with the speaker waiting outside while his father drinks inside?
    * **Options:** A) The Perseverance, B) Looking at Your Hands, C) Lullaby, D) Poem for my Love
    * **Correct:** A
    * **Feedback:** ✓ Correct. Raymond Antrobus's "The Perseverance" takes its title from the pub where the speaker waits, "outside the perseverance", for his drinking father.
    * **Why B:** Looking at Your Hands is a political declaration with no pub setting.
    * **Why C:** Lullaby is set in an imagined underworld, not outside a pub.
    * **Why D:** Poem for my Love is set beside a sleeping partner at night, not outside a pub.

11. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** "The Perseverance" is structured as a sestina, cycling six end-words — including "laughter", "minute", "father" and "[BLANK]" — through its stanzas and closing envoi.
    * **Answer:** disappear
    * **Feedback:** ✓ Correct. "Disappear" is one of the six recurring end-words, tracking how the father — and the coins, and the minutes — keep vanishing into the pub.
    * **WhyWrong:** The word is "disappear" — its repeated return marks how the father, the coins and the time all keep slipping away.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What double meaning does the poem draw from the pub's name, "the Perseverance"?
    * **Options:** A) It refers only to the strength of the beer served there, B) It names both the pub and the child's own endurance of a drinking father, C) It refers to the father's determination to stop drinking, D) It has no significance beyond being a place name
    * **Correct:** B
    * **Feedback:** ✓ Correct. "The Perseverance" names the literal pub and, at the same time, the quiet endurance the child must show while waiting for his father, again and again, outside it.
    * **Why A:** The title's weight falls on endurance, not on the strength of the drink.
    * **Why C:** The father keeps returning to drink rather than resisting it.
    * **Why D:** The epigraph and the poem's repeated waiting show the title carries real emotional weight.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem declares, "I do not sleep to dream, but dream to change the world", as a statement of political commitment?
    * **Options:** A) Looking at Your Hands, B) The Perseverance, C) Poem for my Love, D) Flirtation
    * **Correct:** A
    * **Feedback:** ✓ Correct. Martin Carter's "Looking at Your Hands" closes on this declaration, turning private dreaming into a public, active commitment to change.
    * **Why B:** The Perseverance is concerned with a father's drinking, not political struggle.
    * **Why C:** Poem for my Love is a quiet, private love poem, not a political declaration.
    * **Why D:** Flirtation concerns romantic anticipation, not political commitment.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "Looking at Your Hands" uses exclamations and direct address to a "dear friend", giving the poem an urgent, declarative voice.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Exclamation marks ("No! / I will not still my voice!") and the direct address to a "dear friend" give the poem the urgent voice of a public declaration.
    * **WhyWrong:** This is accurate — the poem's exclamations and direct address to a "dear friend" build its urgent, declarative tone.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Looking at Your Hands"?
    * **Options:** A) It presents political commitment as being felt with the same intensity as love, B) Everyday acts — looking at hands, marching in ranks — become signs of solidarity and shared purpose, C) The repeated refrain "dream to change the world" reframes private dreaming as active, collective resolve, D) The poem concludes that change is impossible and dreaming should be abandoned
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Carter's poem fuses the intensity of love with political conviction, turns ordinary gestures of solidarity into meaningful acts, and transforms the refrain of dreaming into a declaration of active, collective resolve.
    * **Why D:** The poem's whole force builds towards continued commitment to change, not resignation.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls a grandfather reciting Tennyson, picturing "companies of redcoats tin-soldiering it" through danger as a child listens?
    * **Options:** A) Papa-T, B) Songs for the People, C) Colonization in Reverse, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fred D'Aguiar's "Papa-T" recalls his grandfather's dramatic recitations of Tennyson, the child picturing "companies of redcoats tin-soldiering it" through danger as he listens.
    * **Why B:** Songs for the People is a manifesto about the purpose of poetry, not a memory of a grandfather reciting.
    * **Why C:** Colonization in Reverse celebrates Jamaican migration to England, not a grandfather's storytelling.
    * **Why D:** Thirteen follows a boy stopped by police, not a grandfather's recitations.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What distinctive feature runs through "Papa-T"?
    * **Options:** A) A refrain sung at the end of every stanza, B) Code-switching between standard English narration and the grandfather's Caribbean dialect speech, quoted directly, C) A strict, unbroken sonnet form, D) Second-person address throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. D'Aguiar shifts between standard English narration and the grandfather's directly quoted Caribbean dialect — "If yu all don't pay me mind" — capturing two voices and two heritages in one poem.
    * **Why A:** There is no repeated sung refrain in the poem.
    * **Why C:** At eighteen lines across three six-line stanzas, it is not a fourteen-line sonnet.
    * **Why D:** The poem is narrated in the first person, recalling the grandfather, not addressed to "you".

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How does "Papa-T" close, and what does this suggest?
    * **Options:** A) By repeating Tennyson's line "theirs not to reason why" unchanged, praising blind obedience, B) By reworking Tennyson's ending into "to hear, to disobey", suggesting the child values questioning over unthinking obedience, C) By condemning the grandfather's storytelling as pointless, D) By abandoning all reference to Tennyson
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's close reworks Tennyson's famous line into "to hear, to disobey" — inheriting the grandfather's voice and heritage while quietly favouring questioning over unthinking obedience.
    * **Why A:** The poem deliberately alters Tennyson's line rather than repeating it unchanged.
    * **Why C:** The poem treats the grandfather's recitals with real affection and reverence, not dismissal.
    * **Why D:** Tennyson's "Light Brigade" is directly named in the poem's final lines.

19. **Type: Fill [Tests Recognising the Poem]**
    @set:2
    * **Question:** The poem opens: "Let me make the songs for the [BLANK], / Songs for the old and young", declaring poetry's civic purpose.
    * **Answer:** people
    * **Feedback:** ✓ Correct. "Let me make the songs for the people" opens Frances E. W. Harper's poem, announcing songs meant for everyone, "old and young" alike.
    * **WhyWrong:** The word is "people" — the poem is a manifesto for songs written for the whole community, not for any single listener.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "Songs for the People" shaped?
    * **Options:** A) Free verse with no rhyme, B) Regular, rhymed quatrains built on repeated phrases such as "Let me make" and "Let me sing", C) A single unbroken stanza, D) A sestina with six recurring end-words
    * **Correct:** B
    * **Feedback:** ✓ Correct. Harper's regular, rhymed quatrains and their repeated openings ("Let me make", "Let me sing") give the poem the steady, song-like insistence of the very songs it calls for.
    * **Why A:** The poem keeps a consistent rhyme scheme throughout, unlike free verse.
    * **Why C:** It is divided into eight distinct quatrains, not run together as one stanza.
    * **Why D:** The sestina's six recurring end-words describe "The Perseverance", not this poem.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "Songs for the People" presents song and poetry as a healing, unifying force, set against "the clashing of sabres" and "carnage".
    * **Answer:** True
    * **Feedback:** ✓ Correct. Harper explicitly rejects songs "for the clashing of sabres" or "carnage", calling instead for music that soothes sorrow and helps "hearts of men grown tender" bring peace to the world.
    * **WhyWrong:** This is the poem's central claim — it sets healing, unifying song directly against violence and strife.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem admits, "we (forgive us) / lived happily during the war", confessing a comfortable citizen's guilt?
    * **Options:** A) We Lived Happily during the War, B) Colonization in Reverse, C) Thirteen, D) Papa-T
    * **Correct:** A
    * **Feedback:** ✓ Correct. Ilya Kaminsky's poem closes on this confession — "we (forgive us) / lived happily during the war" — admitting the guilt of continuing an ordinary, comfortable life while conflict rages elsewhere.
    * **Why B:** Colonization in Reverse celebrates migration in a joyful, comic voice, not guilt over war.
    * **Why C:** Thirteen concerns a police stop, not a confession of wartime complacency.
    * **Why D:** Papa-T recalls a grandfather's storytelling, not a confession about war.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What technique dominates the poem's account of America "falling" during the war?
    * **Options:** A) A single, unbroken rhyming couplet, B) Fragmented lineation and repetition, such as "invisible house by invisible house by invisible house", C) A tightly rhymed ballad quatrain, D) Second-person address throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. Kaminsky breaks the lines apart and repeats phrases such as "invisible house by invisible house by invisible house", the fractured form enacting the numbing repetition of watching disaster from a safe distance.
    * **Why A:** The poem is written in loosely broken free verse, not rhyming couplets.
    * **Why C:** There is no regular rhyme scheme here.
    * **Why D:** The poem is narrated in the first person plural ("we"), not addressed to "you".

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the repetition "in the street of money in the city of money in the country of money" suggest?
    * **Options:** A) That the speaker's country is admirably wealthy, B) That comfort and materialism dulled the urgency to act while war continued elsewhere, C) That money can end any war, D) That the speaker has personally profited from war
    * **Correct:** B
    * **Feedback:** ✓ Correct. The insistent repetition of "money" indicts a society absorbed in wealth and comfort, protesting "but not enough" while war continues unseen.
    * **Why A:** The repetition reads as an indictment of materialism, not admiration.
    * **Why C:** Money is presented as a distraction from the war, not a solution to it.
    * **Why D:** The guilt described is collective and passive ("we lived happily"), not personal profiteering.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem, written in Jamaican patois and addressed to "miss Mattie", celebrates Jamaican people "colonizin / Englan in reverse"?
    * **Options:** A) Colonization in Reverse, B) Songs for the People, C) We Lived Happily during the War, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Louise Bennett's "Colonization in Reverse" opens with joyful news for "miss Mattie": Jamaican people are "colonizin / Englan in reverse."
    * **Why B:** Songs for the People is a manifesto about poetry's purpose, not about migration.
    * **Why C:** We Lived Happily during the War is set in an unnamed wealthy country during conflict, not about Jamaican migration.
    * **Why D:** Thirteen follows a boy stopped by police, not a celebration of migration.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** Louise Bennett writes the whole poem in Jamaican [BLANK] (dialect), giving her satire of empire an authentic, spoken voice.
    * **Answer:** patois
    * **Feedback:** ✓ Correct. Writing entirely in Jamaican patois — "Wat a devilment a Englan!" — lets Bennett satirise empire in a genuine, spoken Caribbean voice rather than standard English.
    * **WhyWrong:** The word is "patois" — the poem's Jamaican dialect voice is essential to its comic, satirical effect.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the effect of Bennett's comic, celebratory tone in "Colonization in Reverse"?
    * **Options:** A) It trivialises the seriousness of migration and empire, B) It makes a serious political point about empire and migration accessible and memorable through humour, C) It proves the speaker disapproves of migration, D) It has no relationship to the poem's meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Bennett's playful, comic voice — "tun history upside dung!" — carries a serious point about empire being reversed through migration, making the political inversion vivid and memorable rather than solemn.
    * **Why A:** The comic tone sharpens the political point rather than trivialising it.
    * **Why C:** The speaker's "joyful news" reveals delight in migration, not disapproval.
    * **Why D:** The humour is central to how the poem makes its point about empire.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem addresses "you" as a boy "four minutes from home" when "cornered by an officer" who accuses him of matching a robbery description?
    * **Options:** A) Thirteen, B) Papa-T, C) Songs for the People, D) Colonization in Reverse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Caleb Femi's "Thirteen" addresses a boy stopped just "four minutes from home" by an officer investigating a robbery, though he is only thirteen years old.
    * **Why B:** Papa-T is narrated in the first person about a grandfather, not addressed to "you".
    * **Why C:** Songs for the People is a manifesto about poetry, not a narrative about a police stop.
    * **Why D:** Colonization in Reverse celebrates migration, not a police encounter.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Thirteen" is narrated in the second person ("you") and builds an extended metaphor of stars, supernovas and black holes.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Femi addresses the boy throughout as "you", and extends the metaphor of "supernovas" and "dying stars / on the verge of becoming black holes" across the poem.
    * **WhyWrong:** This is accurate — the second-person address and the star/supernova/black hole metaphor both run through the whole poem.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "Thirteen"?
    * **Options:** A) It exposes the racial profiling of a Black child through a police stop-and-search, B) It contrasts a teacher's earlier praise of the child as a "supernova" with the officer's dehumanising treatment of him, C) The extended metaphor of "dying stars" and "black holes" suggests a loss of childhood potential, D) The poem concludes that the officer's actions were entirely justified
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Femi exposes racial profiling in a police stop, sets a teacher's praise of the child as a "supernova" against an officer's dehumanising treatment, and turns the extended metaphor of "dying stars" and "black holes" into an image of potential extinguished.
    * **Why D:** The poem's whole force is a protest against the officer's treatment of the child, not an endorsement of it.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a grandfather's eyes becoming "two stopwatches / counting down his own exit" as a new-born brother arrives?
    * **Options:** A) Equilibrium, B) Prayer, C) Happy Birthday Moon, D) Theme for English B
    * **Correct:** A
    * **Feedback:** ✓ Correct. Theresa Lola's "Equilibrium" opens with the new-born brother's arrival turning the grandfather's eyes into "two stopwatches / counting down his own exit."
    * **Why B:** Prayer is framed by a birth and a death at the very start and end of a life, not a grandfather's ageing.
    * **Why C:** Happy Birthday Moon is about a father reading to his deaf son, not a grandfather's decline.
    * **Why D:** Theme for English B concerns a college assignment and identity, not a family's births and declines.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Equilibrium" shaped, and what extended image does it use?
    * **Options:** A) A long, rhymed ballad using a nautical metaphor, B) Five short, unrhymed couplets built around an extended metaphor of mathematics and balance, C) A pantoum with repeating lines, D) A sestina with six recurring end-words
    * **Correct:** B
    * **Feedback:** ✓ Correct. Lola's ten lines fall into five spare, unrhymed couplets, built around the extended metaphor of an "equation of equilibrium" balancing a life beginning against a life fading.
    * **Why A:** The poem is short and unrhymed, with no nautical imagery.
    * **Why C:** The repeating-line pantoum shape belongs to "Happy Birthday Moon", not this poem.
    * **Why D:** The sestina's six recurring end-words describe "The Perseverance", not this poem.

33. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "Equilibrium" explores a moment where a new life beginning and an older life declining seem to be held in balance within the same family.
    * **Answer:** True
    * **Feedback:** ✓ Correct. As the new-born brother "was crowned with a name", the grandfather's "brain began to forget his" — the poem holds arrival and decline in a single, poised balance.
    * **WhyWrong:** This is the poem's central idea — the "equation of equilibrium" balances a birth against a grandfather's fading memory.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem begins with the Islamic call to prayer, "Allah hu Akbar", spoken by a father "in the Queen Elizabeth maternity ward"?
    * **Options:** A) Prayer, B) Equilibrium, C) Happy Birthday Moon, D) Tea With Our Grandmothers
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zaffar Kunial's "Prayer" opens with the father's whispered "Allah hu Akbar – God is great" at his son's birth in "the Queen Elizabeth maternity ward."
    * **Why B:** Equilibrium is set at a naming ceremony, not a maternity ward, and includes no Islamic prayer.
    * **Why C:** Happy Birthday Moon is about a father reading a picture book, not a call to prayer.
    * **Why D:** Tea With Our Grandmothers is set around a death and shared tea, not a birth.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What distinctive technique does "Prayer" use?
    * **Options:** A) It weaves in quotation from the seventeenth-century poet George Herbert alongside the Islamic call to prayer, B) It repeats a full stanza verbatim as a refrain, C) It is written entirely in Jamaican patois, D) It uses only single-word lines throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. Kunial interlaces his own family's births and deaths with quotation from George Herbert ("God's breath in man returning to his birth, / says Herbert, is prayer"), placing Islamic and Christian traditions of prayer side by side.
    * **Why B:** The poem develops through new detail stanza to stanza rather than repeating one stanza as a refrain.
    * **Why C:** Colonization in Reverse is written in Jamaican patois, not this poem.
    * **Why D:** The poem is written in longer, flowing lines, not single words.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the poem's closing line, "She stared on, ahead. I won't know if she heard", convey?
    * **Options:** A) Certainty that the mother heard every word, B) The helplessness and uncertainty of grief, as love is spoken without any confirmation it was received, C) Anger at the mother for not responding, D) Relief that the ordeal is over
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unresolved close — "I won't know if she heard" — leaves the speaker's whispered love unanswered, capturing grief's helplessness at the edge of death.
    * **Why A:** The line's whole force is uncertainty, not confirmation.
    * **Why C:** The tone is tender and grieving, with no trace of anger.
    * **Why D:** The poem ends in irresolution, not relief.

37. **Type: Fill [Tests Recognising the Poem]**
    @set:3
    * **Question:** In Raymond Antrobus's poem, a father reads a picture book each night to his [BLANK] son "who slurs his speech".
    * **Answer:** deaf
    * **Feedback:** ✓ Correct. The father reads nightly to "his deaf son who slurs his speech", the pair's shared ritual built around the boy's deafness.
    * **WhyWrong:** The word is "deaf" — the whole poem turns on the father's patient reading ritual with his deaf son.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What structural technique shapes "Happy Birthday Moon"?
    * **Options:** A) A pantoum-like form, where lines from one stanza recur as lines in the next, B) A sestina cycling six end-words, C) An unrhymed sonnet, D) A ballad with a sung refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. Antrobus repeats lines from each stanza in the next — "Sometimes his finger moves past words, tracing white space" recurs, then "to his deaf son who slurs his speech" — a pantoum-like circling that mirrors the pair's repeated, patient ritual.
    * **Why B:** The sestina's six recurring end-words describe "The Perseverance", not this poem.
    * **Why C:** The poem runs far longer than fourteen lines and has no fixed rhyme.
    * **Why D:** There is no sung refrain here, though lines do recur in a different way.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the invented word "Rain-nan Akabok" come to represent in the poem?
    * **Options:** A) A mistake that the father is determined to correct, B) An affectionate, private language shared between father and deaf son, born from mispronunciation, C) A word borrowed from another poem in the anthology, D) A term of frustration between them
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rather than correcting it, the father laughs and calls his son "something else" — "Rain-nan Akabok" becomes a private, affectionate language of their own, part of "really hear[ing] each other."
    * **Why A:** The father embraces the mispronunciation with laughter rather than insisting it be fixed.
    * **Why C:** The word belongs only to this poem, invented between father and son.
    * **Why D:** The moment is warm and joyful, not frustrated.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem moves through four grandmothers — including one who died "grinding cardamom" and one who "broke cinnamon barks between her palms" — to comfort a grieving friend?
    * **Options:** A) Tea With Our Grandmothers, B) Equilibrium, C) Prayer, D) Theme for English B
    * **Correct:** A
    * **Feedback:** ✓ Correct. Warsan Shire's "Tea With Our Grandmothers" moves through four grandmothers in turn, including one who "died grinding cardamom" and one who "broke cinnamon barks between her palms", to comfort a friend whose habooba has died.
    * **Why B:** Equilibrium concerns one grandfather, not four grandmothers.
    * **Why C:** Prayer concerns a father and a dying mother, not a catalogue of grandmothers.
    * **Why D:** Theme for English B is set in a college classroom, with no grandmothers.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Tea With Our Grandmothers" structured?
    * **Options:** A) Four unrhymed stanzas of equal length, each devoted to a different grandmother, linked in one cumulative sentence, B) A single rhyming quatrain, C) A sestina with six recurring end-words, D) A pantoum with repeating lines
    * **Correct:** A
    * **Feedback:** ✓ Correct. Shire builds four matching stanzas, one for each grandmother, joined by semicolons into a single cumulative sentence — a structure of parallel tribute.
    * **Why B:** The poem runs to four full stanzas, not one quatrain, and has no fixed rhyme.
    * **Why C:** The sestina's six recurring end-words describe "The Perseverance", not this poem.
    * **Why D:** The repeating-line pantoum shape belongs to "Happy Birthday Moon", not this poem.

42. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Tea With Our Grandmothers"?
    * **Options:** A) It draws solidarity in grief by cataloguing different grandmothers' shared endurance of illness, loss and hardship, B) Spices and tea act as symbols of ritual, comfort and inherited female labour across cultures, C) The closing image of steam that "would rise like a ghost" fuses loss with lingering memory, D) The poem argues that only one culture's grief truly matters
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Shire draws solidarity across cultures by cataloguing grandmothers' shared endurance, uses spices and tea as symbols of ritual and inherited labour, and closes on steam that "would rise like a ghost", fusing loss with memory.
    * **Why D:** The poem's whole structure honours grandmothers across several different cultures equally, not one alone.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens with a college instructor's assignment — "Go home and write / a page tonight" — before the speaker reflects on being "the only colored student" in his class?
    * **Options:** A) Theme for English B, B) Prayer, C) Happy Birthday Moon, D) Tea With Our Grandmothers
    * **Correct:** A
    * **Feedback:** ✓ Correct. Langston Hughes's "Theme for English B" opens with the instructor's assignment before the speaker reflects on being "the only colored student in my class."
    * **Why B:** Prayer concerns birth and death within a family, not a college classroom.
    * **Why C:** Happy Birthday Moon is about a father and deaf son at home, not a classroom assignment.
    * **Why D:** Tea With Our Grandmothers concerns grief and grandmothers, not a college assignment.

44. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** The poem opens by directly quoting the [BLANK]'s assignment in short, indented lines, before shifting into the speaker's own first-person voice.
    * **Answer:** instructor
    * **Feedback:** ✓ Correct. The poem opens with the instructor's assignment quoted directly, then moves into the speaker's own reflective, conversational first-person voice addressed back to that same instructor.
    * **WhyWrong:** The word is "instructor" — his assignment opens the poem before the speaker takes over in his own voice.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What conclusion does the speaker reach about his relationship with his white instructor?
    * **Options:** A) That they share nothing at all in common, B) That despite racial and social inequality, each is "a part of" the other, and both shape and are shaped by each other, C) That the instructor is entirely wrong to have set the assignment, D) That only the instructor can ever learn anything from the other
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hughes concludes that speaker and instructor are mutually bound — "a part of you, instructor... yet a part of me" — even as he notes the instructor remains "older—and white—and somewhat more free."
    * **Why A:** The poem insists on shared, intertwined identity, not total separation.
    * **Why C:** The poem questions the assignment's premise but does not reject it outright.
    * **Why D:** The closing lines insist that learning runs both ways between them.
