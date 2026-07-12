# Foundational Quiz Bank — OCR Poetry Anthologies (Poems)

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

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the anthology's
three thematic sections (unchanged), so the quiz only serves poems the student has read:
- **@set:1** — Love and Relationships: Flirtation · Poem for my Love · Lullaby · The Perseverance · Looking at Your Hands
- **@set:2** — Conflict: Papa-T · Songs for the People · We Lived Happily during the War · Colonization in Reverse · Thirteen
- **@set:3** — Youth and Age: Equilibrium · Prayer · Happy Birthday Moon · Tea With Our Grandmothers · Theme for English B

### Quiz: OCR Poetry Anthologies

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that the deepest pleasure of love lies in ANTICIPATION — savouring the charged, unhurried moment before "Anything can happen" between two people, ritualised in an orange flaring "like a tulip on a wedgewood plate"?
   * **Options:** A) Flirtation, B) Poem for my Love, C) Lullaby, D) Looking at Your Hands
   * **Correct:** A
   * **Feedback:** ✓ Correct. Rita Dove's "Flirtation" makes its whole argument out of delay — the peeled orange "like a tulip on a wedgewood plate" and the hush before "Anything can happen" insist that the delight is in the lingering approach, not the arrival.
   * **Why B:** Poem for my Love finds its wonder in a settled, peaceful moment beside a sleeping partner, not in charged anticipation.
   * **Why C:** Lullaby's argument is about consoling grief with an invented myth, not romantic expectancy.
   * **Why D:** Looking at Your Hands argues for active political commitment, not the pleasure of a private moment.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** Dove writes "Flirtation" in brief, unrhymed two-line stanzas separated by wide pauses. What does that spare, unhurried form achieve?
   * **Options:** A) It rushes the poem headlong to its conclusion, B) It slows and suspends the poem, so the drifting stanzas enact the very lingering anticipation the poem prizes, C) It makes the poem a strict, formal argument, D) It has no effect on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The short, gapped couplets keep pausing and drifting — the shape of the poem on the page enacts the savoured delay it describes, so form and feeling move at the same unhurried pace.
   * **Why A:** The airy, pausing form deliberately slows the poem rather than rushing it.
   * **Why C:** The loose, unrhymed stanzas are the opposite of a tight formal argument.
   * **Why D:** The unhurried pacing is exactly how the form carries the poem's meaning.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the closing image of shaping the moment into "a topiary / so the pleasure's in / walking through" reveal about the poem's central idea?
   * **Options:** A) That the moment should be rushed to its conclusion, B) That delaying the point of contact is itself the pleasure — the joy lies in the approach, not the arrival, C) That the garden setting matters more than the two people, D) That the moment ends in disappointment
   * **Correct:** B
   * **Feedback:** ✓ Correct. Making the moment "a topiary" to walk "through" turns anticipation into the point — the poem leaves us with the pleasurable ache of lingering rather than any rush to resolution.
   * **Why A:** The image values a slow approach, not haste.
   * **Why C:** The topiary is a metaphor for the charged moment itself, not a literal garden.
   * **Why D:** The tone throughout is expectant and pleasurable, not disappointed.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that the profoundest love is found in an ordinary, undramatic moment — a speaker "amazed by peace" simply lying beside a partner "asleep / and breathing in the quiet air"?
   * **Options:** A) Flirtation, B) Poem for my Love, C) The Perseverance, D) Lullaby
   * **Correct:** B
   * **Feedback:** ✓ Correct. June Jordan's "Poem for my Love" finds its wonder not in drama but in stillness — the speaker "amazed by peace" beside a sleeping lover, arguing that love's depth lies in quiet, shared ordinariness.
   * **Why A:** Flirtation is about the charged anticipation before intimacy, not the peace of an established love.
   * **Why C:** The Perseverance is about a child's endurance of a drinking father, not romantic peace.
   * **Why D:** Lullaby consoles grief through an invented myth, not the quiet of a shared night.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** Jordan runs "Poem for my Love" as one continuous stanza with almost no punctuation to stop it. What does that unbroken flow achieve?
   * **Options:** A) It makes the poem feel jagged and interrupted, B) The seamless, unstopped syntax mirrors the quiet, unbroken intimacy of the shared night, letting the speaker's wonder flow uninterrupted, C) It turns the poem into a strict rhyming song, D) It has no bearing on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. With no full stops to break it, the poem flows as one continuous breath — the form itself enacts the unbroken calm of lying beside a sleeping partner.
   * **Why A:** The continuous flow is smooth and unbroken, not jagged.
   * **Why C:** There is no rhyme scheme; the effect is flowing thought, not song.
   * **Why D:** The unstopped syntax is precisely how the form conveys the poem's peace.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** "Poem for my Love" finds profundity in an ordinary, undramatic moment — simply lying beside someone "breathing in the quiet air" — rather than in any grand event.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Jordan elevates a small, undramatic moment — a partner "asleep / and breathing in the quiet air" — into a source of amazement and peace, locating love's depth in stillness.
   * **WhyWrong:** This is the poem's method — its wonder comes from an ordinary shared stillness, not from any dramatic event.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem eases grief by inventing a consoling myth — imagining a dead father "buried in pakistan" and a dead mother "buried in new york city" reunited to dance each night?
   * **Options:** A) Lullaby, B) Flirtation, C) The Perseverance, D) Looking at Your Hands
   * **Correct:** A
   * **Feedback:** ✓ Correct. Fatimah Asghar's "Lullaby" answers sadness with a made-up bedtime story — the dead parents meeting through a tunnel between "pakistan" and "new york city" — arguing that invented myth can soften grief and loss.
   * **Why B:** Flirtation is about anticipation between living people, not consoling grief.
   * **Why C:** The Perseverance concerns a child enduring a father's addiction, not a myth of reunited dead parents.
   * **Why D:** Looking at Your Hands is a political declaration, not a story that comforts mourning.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** Asghar writes "Lullaby" in hushed lower-case couplets throughout, with no capital letters. What does that quiet, informal form achieve?
   * **Options:** A) It suggests the speaker cannot write correctly, B) The lower-case couplets give the poem the soft, murmured intimacy of a real bedtime story told to soothe a grieving child, C) It makes the poem sound loud and public, D) It has no effect on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The un-capitalised, gentle couplets strip away formality, so the poem sounds like a story whispered at bedtime — the hushed form itself does the consoling work the poem describes.
   * **Why A:** The lower case is a deliberate, expressive choice, not an error.
   * **Why C:** The murmured, intimate form is the opposite of loud or public.
   * **Why D:** The hushed lower-case shape is central to the poem's comforting effect.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What comfort does the story-within-the-poem offer in "Lullaby", and how does it make us feel?
   * **Options:** A) It insists that death ends all connection between people, B) It imagines a tender reunion of the dead parents, turning grief and separation into a consoling, gentle myth, C) It warns the listener never to sleep, D) It argues that separated people should stop dreaming of each other
   * **Correct:** B
   * **Feedback:** ✓ Correct. The sister's bedtime story reimagines the dead parents dancing together underground, turning loss into something tender — we are left consoled rather than desolate.
   * **Why A:** The poem imagines ongoing connection after death, not its end.
   * **Why C:** Sleep is what opens the tunnel between the two worlds, not something to avoid.
   * **Why D:** The dreaming and dancing of the lovers is offered warmly, not as a warning.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem captures a child's quiet endurance of a parent's addiction — waiting "outside the perseverance" while his father drinks, watching him "disappear / into smoke and laughter"?
    * **Options:** A) The Perseverance, B) Looking at Your Hands, C) Lullaby, D) Poem for my Love
    * **Correct:** A
    * **Feedback:** ✓ Correct. Raymond Antrobus's "The Perseverance" centres a child's patient endurance of a drinking father — waiting "outside the perseverance" as he vanishes "into smoke and laughter" — arguing that such love is bound up with loss.
    * **Why B:** Looking at Your Hands is a political declaration, not a child's private endurance.
    * **Why C:** Lullaby consoles grief with an invented myth, not the waiting of a real child outside a pub.
    * **Why D:** Poem for my Love finds peace beside a sleeping lover, not a father's addiction.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "The Perseverance" is a sestina, cycling the same six end-words — including "father", "disappear", "minute" and "laughter" — through every stanza. What does that relentless recurrence achieve?
    * **Options:** A) It proves the poet has run out of words, B) The compulsive return of the same words enacts the repetitive cycle of the father's drinking and the child's endless, circling waiting, C) It makes the poem feel random and free, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The sestina forces the same words back again and again — "father", "disappear", "minute", "laughter" — so the very form circles helplessly, enacting the repeating cycle of addiction and the child's endless waiting.
    * **Why A:** The strict, demanding sestina is a deliberate choice, not a shortage of words.
    * **Why C:** The obsessive, recurring end-words are the opposite of random freedom.
    * **Why D:** The circling repetition is exactly how the form carries the poem's meaning.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What double meaning does the poem draw from the pub's name, "the perseverance", and what does it make us feel?
    * **Options:** A) It refers only to the strength of the beer served there, B) It names both the literal pub and the child's own quiet endurance of a drinking father — turning a place name into an image of painful perseverance, C) It refers to the father's determination to stop drinking, D) It has no significance beyond being a place name
    * **Correct:** B
    * **Feedback:** ✓ Correct. "The perseverance" is at once the pub and the endurance the child must show, waiting again and again outside it — the pun turns a name into the poem's ache of loyal, wearying love.
    * **Why A:** The title's weight falls on endurance, not on the strength of the drink.
    * **Why C:** The father keeps returning to drink rather than resisting it.
    * **Why D:** The repeated waiting shows the title carries real emotional weight.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that private dreaming must become public, active commitment — declaring "I do not sleep to dream, but dream to change the world"?
    * **Options:** A) Looking at Your Hands, B) The Perseverance, C) Poem for my Love, D) Flirtation
    * **Correct:** A
    * **Feedback:** ✓ Correct. Martin Carter's "Looking at Your Hands" turns inward dreaming outward — "I do not sleep to dream, but dream to change the world" — arguing that to dream is to commit to changing it.
    * **Why B:** The Perseverance concerns a father's drinking and a child's endurance, not political commitment.
    * **Why C:** Poem for my Love is a quiet, private love poem, not a call to change the world.
    * **Why D:** Flirtation concerns romantic anticipation, not active resolve.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** In "Looking at Your Hands", the exclamations ("No! / I will not still my voice!") and direct address to a "dear friend" give the poem the urgent, declarative voice of a public rallying-cry.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The exclamations and the direct address to a "dear friend" charge the poem with urgency — the form itself sounds like a spoken declaration, matching its call to active commitment.
    * **WhyWrong:** This is the form's effect — the exclamations and direct address build an urgent, declarative voice that suits the poem's political resolve.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Looking at Your Hands"?
    * **Options:** A) It presents political commitment as being felt with the same intensity as love, B) Everyday acts — looking at hands, marching in ranks — become signs of solidarity and shared purpose, C) The closing "I do not sleep to dream, but dream to change the world" reframes private dreaming as active, collective resolve, D) The poem concludes that change is impossible and dreaming should be abandoned
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Carter's poem fuses the intensity of love with political conviction, turns ordinary gestures of solidarity into meaningful acts, and reframes dreaming as a declaration of active, collective resolve.
    * **Why D:** The poem's whole force builds towards continued commitment to change, not resignation.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem explores inheriting a grandfather's voice and heritage — a child hearing Tennyson recited, seeing "companies of redcoats tin-soldiering it" — while learning to question what is passed down?
    * **Options:** A) Papa-T, B) Songs for the People, C) Colonization in Reverse, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fred D'Aguiar's "Papa-T" makes its subject the inheritance of a grandfather's dramatic recitals — the child picturing "companies of redcoats tin-soldiering it" — while quietly reworking that inheritance into something questioning.
    * **Why B:** Songs for the People is a manifesto about poetry's civic purpose, not a grandfather's recitals.
    * **Why C:** Colonization in Reverse celebrates Jamaican migration, not an inherited voice across generations.
    * **Why D:** Thirteen exposes the racial profiling of a boy, not a family inheritance of recitation.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Papa-T" shifts between standard-English narration and the grandfather's directly quoted Caribbean dialect ("If yu all don't pay me mind"). What does that code-switching achieve?
    * **Options:** A) It shows the grandfather cannot speak properly, B) It holds two voices and two heritages together in one poem, dramatising the child's dual inheritance, C) It turns the poem into a sung ballad, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Moving between narration and the grandfather's quoted dialect lets both voices — and both heritages — live in the same poem, so the form itself enacts the child's mixed inheritance.
    * **Why A:** The dialect is rendered with reverence and affection, not as incorrect speech.
    * **Why C:** There is no sung refrain; the effect is two living voices, not a ballad.
    * **Why D:** The shift between voices is central to the poem's meaning about inheritance.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How does "Papa-T" close, and what does this suggest about the inheritance it describes?
    * **Options:** A) By repeating Tennyson's original line about not reasoning why, praising blind obedience, B) By reworking Tennyson's ending into "to hear, to disobey", suggesting the child inherits the grandfather's voice yet values questioning over unthinking obedience, C) By condemning the grandfather's storytelling as pointless, D) By abandoning all reference to Tennyson
    * **Correct:** B
    * **Feedback:** ✓ Correct. The close reworks Tennyson's famous charge into "to hear, to disobey" — the child keeps the grandfather's voice and heritage but bends it towards questioning rather than obedience.
    * **Why A:** The poem deliberately alters Tennyson's line rather than repeating it to praise obedience.
    * **Why C:** The poem treats the grandfather's recitals with real affection, not dismissal.
    * **Why D:** Tennyson's Light Brigade is directly named in the poem's final lines.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem is a manifesto arguing that poetry should be a healing, unifying force for everyone — "songs for the people", for "the old and young", set against "the clashing of sabres"?
    * **Options:** A) Songs for the People, B) Papa-T, C) We Lived Happily during the War, D) Colonization in Reverse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Frances E. W. Harper's "Songs for the People" argues for poetry as a civic, healing force — songs for "the old and young" that soothe sorrow rather than serve "the clashing of sabres".
    * **Why B:** Papa-T recalls a grandfather's recitals and inheritance, not a manifesto for poetry's purpose.
    * **Why C:** We Lived Happily during the War confesses the guilt of comfortable bystanders, not poetry's healing role.
    * **Why D:** Colonization in Reverse satirises empire through migration, not the civic purpose of song.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Harper builds the poem from regular, rhymed quatrains with repeated openings ("Let me make", "Let me sing"). What does that steady, chant-like form achieve?
    * **Options:** A) It makes the poem feel chaotic and broken, B) The insistent, repeating rhythm gives the poem the communal, song-like quality of the very anthems it calls for, C) It turns the poem into a private confession, D) It has no bearing on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The regular quatrains and their chanted openings make the poem sound like a shared song — the form performs the communal, healing music it argues poetry should be.
    * **Why A:** The steady, rhymed form is ordered and insistent, not chaotic.
    * **Why C:** The public, chant-like voice is the opposite of a private confession.
    * **Why D:** The song-like rhythm is exactly how the form embodies the poem's argument.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "Songs for the People" makes us feel poetry as a healing, unifying force by setting song directly against violence — "the clashing of sabres" and "carnage" — and calling instead for music that brings peace.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Harper rejects songs for "the clashing of sabres" or "carnage" and calls for music that soothes sorrow and helps "hearts of men grown tender" bring peace — leaving us with poetry as balm, not weapon.
    * **WhyWrong:** This is the poem's central feeling — it sets healing, unifying song directly against violence and strife.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem confesses the guilt of comfortable complicity — bystanders who "protested / but not enough" and finally "lived happily during the war"?
    * **Options:** A) We Lived Happily during the War, B) Colonization in Reverse, C) Thirteen, D) Papa-T
    * **Correct:** A
    * **Feedback:** ✓ Correct. Ilya Kaminsky's poem argues that comfort makes us complicit — the speakers "protested / but not enough" and "lived happily during the war", confessing the quiet guilt of the safe bystander.
    * **Why B:** Colonization in Reverse celebrates migration in a comic voice, not wartime guilt.
    * **Why C:** Thirteen exposes racial profiling of a child, not the complicity of comfortable citizens.
    * **Why D:** Papa-T recalls a grandfather's recitals, not a confession about war.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** As America is "falling", Kaminsky fractures the lines and repeats "invisible house by invisible house by invisible house". What does that broken, repetitive form achieve?
    * **Options:** A) It makes the disaster feel exciting and heroic, B) The numbing repetition and fractured lines enact the deadening distance of watching catastrophe from safety, C) It turns the poem into a marching song, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Breaking the lines and repeating "invisible house" over and over makes the horror feel remote and numbed — the form itself performs the anaesthetised comfort the poem confesses.
    * **Why A:** The flat, numbed repetition is the opposite of heroic excitement.
    * **Why C:** There is no rousing song here; the effect is deadened distance.
    * **Why D:** The fractured repetition is central to the poem's sense of detached complicity.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the repetition "in the street of money in the city of money in the country of money" make us feel about the speakers' society?
    * **Options:** A) That their country is admirably wealthy, B) That comfort and materialism dulled the urgency to act while war continued elsewhere, C) That money can end any war, D) That the speaker personally profited from the war
    * **Correct:** B
    * **Feedback:** ✓ Correct. The insistent repetition of "money" indicts a society so absorbed in wealth and comfort that it protested "but not enough" — leaving us uneasily implicated in its complacency.
    * **Why A:** The repetition reads as an indictment of materialism, not admiration.
    * **Why C:** Money is presented as a distraction from the war, not a solution.
    * **Why D:** The guilt is collective and passive ("we lived happily"), not personal profiteering.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem joyfully turns empire on its head — celebrating Jamaican people "colonizin / Englan in reverse" as a comic reversal of colonial history?
    * **Options:** A) Colonization in Reverse, B) Songs for the People, C) We Lived Happily during the War, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Louise Bennett's "Colonization in Reverse" argues, in a joyful comic voice, that Jamaican migration "colonizin / Englan in reverse" turns the history of empire upside down.
    * **Why B:** Songs for the People is a manifesto about poetry's healing purpose, not migration.
    * **Why C:** We Lived Happily during the War confesses wartime complicity, not a comic reversal of empire.
    * **Why D:** Thirteen exposes the racial profiling of a boy, not a celebration of migration.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Bennett writes the whole poem in Jamaican patois ("Wat a devilment a Englan!"). What does that dialect voice achieve?
    * **Options:** A) It suggests the speaker is uneducated, B) It claims a proud, authentic Caribbean voice, so the form itself reverses colonial hierarchy and sharpens the poem's comic satire of empire, C) It makes the poem hard to take seriously, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Writing entirely in patois lets Bennett satirise empire in a genuine, spoken Caribbean voice — the dialect is itself an act of reversal, giving the "colonizin in reverse" argument its authentic, comic force.
    * **Why A:** The patois is a proud, deliberate assertion of voice, not a mark of ignorance.
    * **Why C:** The dialect carries a serious political point through its humour, not against it.
    * **Why D:** The Caribbean voice is central to how the poem reverses colonial power.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the effect of Bennett's comic, celebratory tone in "Colonization in Reverse"?
    * **Options:** A) It trivialises the seriousness of migration and empire, B) It makes a serious point about empire and migration vivid and memorable, carrying the political inversion through delighted humour, C) It proves the speaker disapproves of migration, D) It has no relationship to the poem's meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Bennett's playful, comic voice — "tun history upside dung!" — makes the reversal of empire feel joyful and memorable, so the humour sharpens rather than softens the political point.
    * **Why A:** The comic tone sharpens the political point rather than trivialising it.
    * **Why C:** The speaker's "joyful news" reveals delight in migration, not disapproval.
    * **Why D:** The humour is central to how the poem makes its point about empire.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem exposes the racial profiling of a Black child — a boy "four minutes from home" "cornered by an officer" who accuses him of matching a robbery, though he is only thirteen?
    * **Options:** A) Thirteen, B) Papa-T, C) Songs for the People, D) Colonization in Reverse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Caleb Femi's "Thirteen" argues that racial profiling steals a child's innocence — a boy "four minutes from home" "cornered by an officer" and treated as a suspect at thirteen.
    * **Why B:** Papa-T recalls a grandfather's recitals and inheritance, not a police stop.
    * **Why C:** Songs for the People is a manifesto about poetry's purpose, not a profiling encounter.
    * **Why D:** Colonization in Reverse celebrates migration, not the profiling of a child.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** In "Thirteen", the second-person "you" places the reader inside the boy's experience, while the extended metaphor of "supernovas" and "dying stars" turns his lost potential into something cosmic — so the form makes the injustice feel both intimate and vast.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The direct "you" pulls us into the boy's place, and the star metaphor enlarges his stolen promise to cosmic scale — the form makes the profiling feel at once personal and immense.
    * **WhyWrong:** This is the form's effect — the second-person address and the star/supernova metaphor together make the injustice feel both intimate and vast.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "Thirteen"?
    * **Options:** A) It exposes the racial profiling of a Black child through a police stop-and-search, B) It contrasts a teacher's earlier praise of the child as a "supernova" with the officer's dehumanising treatment of him, C) The extended metaphor of "dying stars" and "black holes" suggests a loss of childhood potential, D) The poem concludes that the officer's actions were entirely justified
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Femi exposes racial profiling, sets a teacher's praise of the child as a "supernova" against an officer's dehumanising treatment, and turns "dying stars" and "black holes" into an image of potential extinguished.
    * **Why D:** The poem's whole force is a protest against the officer's treatment of the child, not an endorsement of it.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem holds a new life beginning against an old one fading — a grandfather's eyes turning to "two stopwatches / counting down his own exit" as a new-born brother arrives?
    * **Options:** A) Equilibrium, B) Prayer, C) Happy Birthday Moon, D) Theme for English B
    * **Correct:** A
    * **Feedback:** ✓ Correct. Theresa Lola's "Equilibrium" argues that a family balances arrival against decline — the grandfather's eyes become "two stopwatches / counting down his own exit" just as the new brother is born.
    * **Why B:** Prayer frames a whole life between a birth and a death, but through prayer and faith, not a grandfather's ageing beside a new baby.
    * **Why C:** Happy Birthday Moon is about a father and deaf son inventing a language, not a birth balanced against a decline.
    * **Why D:** Theme for English B concerns race and identity in a college assignment, not a family's births and declines.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Lola builds "Equilibrium" from spare, unrhymed couplets around a mathematical metaphor of balance. What does that paired, equation-like form achieve?
    * **Options:** A) It makes the poem feel sprawling and chaotic, B) The couplets and the "equation of equilibrium" hold birth and decline in visible balance, so the form itself weighs one life's rise against another's fall, C) It turns the poem into a lively song, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The two-line units and the "equation of equilibrium" set arrival beside decline on the page — the balanced form enacts the poem's central idea of a life beginning as another fades.
    * **Why A:** The spare, paired couplets are precise and balanced, not sprawling.
    * **Why C:** The measured, elegiac form is far from a lively song.
    * **Why D:** The balanced, equation-like shape is exactly how the form carries the meaning.

33. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "Equilibrium" holds a new life beginning and an older life declining in a single balance — as the new-born brother "was crowned with a name", the grandfather's "brain began to forget his".
    * **Answer:** True
    * **Feedback:** ✓ Correct. As the brother "was crowned with a name", the grandfather's "brain began to forget his" — the poem poises arrival against decline, leaving us with the bittersweet balance of one life rising as another fades.
    * **WhyWrong:** This is the poem's central idea — the "equation of equilibrium" balances a birth against a grandfather's fading memory.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem frames a whole life between prayer at a birth and love spoken at a death — opening with a father's "Allah hu Akbar" "in the Queen Elizabeth maternity ward"?
    * **Options:** A) Prayer, B) Equilibrium, C) Happy Birthday Moon, D) Tea With Our Grandmothers
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zaffar Kunial's "Prayer" argues that prayer is the language binding a life's edges — a father's "Allah hu Akbar" at a birth "in the Queen Elizabeth maternity ward", answered later by love whispered at a mother's deathbed.
    * **Why B:** Equilibrium balances a birth against a grandfather's decline, without prayer or faith.
    * **Why C:** Happy Birthday Moon is about a father and deaf son inventing a language, not prayer across a life.
    * **Why D:** Tea With Our Grandmothers gathers grandmothers in shared grief, not a life framed by prayer.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Kunial interlaces his family's Muslim births and deaths with quotation from the Christian poet George Herbert. What does that interweaving of two traditions achieve?
    * **Options:** A) It shows the two faiths cannot coexist, B) Placing Islamic and Christian prayer side by side makes prayer feel universal — one shared human language for birth and death across faiths, C) It turns the poem into a comic satire, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Weaving the "Allah hu Akbar" of his father together with Herbert's lines lets two traditions of prayer speak as one — the form itself argues that prayer is a shared human response to birth and death.
    * **Why A:** The interweaving unites the two traditions rather than opposing them.
    * **Why C:** The tone is tender and reflective, not comic or satirical.
    * **Why D:** The blending of Islamic and Christian prayer is central to the poem's meaning.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the poem's closing line, "She stared on, ahead. I won't know if she heard", convey?
    * **Options:** A) Certainty that the mother heard every word, B) The helplessness and uncertainty of grief, as love is spoken without any confirmation it was received, C) Anger at the mother for not responding, D) Relief that the ordeal is over
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unresolved close — "I won't know if she heard" — leaves the speaker's whispered love unanswered, capturing grief's helplessness at the very edge of death.
    * **Why A:** The line's whole force is uncertainty, not confirmation.
    * **Why C:** The tone is tender and grieving, with no trace of anger.
    * **Why D:** The poem ends in irresolution, not relief.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem shows a father and his deaf son building a private language of love — a nightly reading ritual with "his deaf son who slurs his speech" that turns a mispronunciation into a shared word?
    * **Options:** A) Happy Birthday Moon, B) Equilibrium, C) Prayer, D) Theme for English B
    * **Correct:** A
    * **Feedback:** ✓ Correct. Raymond Antrobus's "Happy Birthday Moon" argues that love makes its own language — a father reading nightly to "his deaf son who slurs his speech", the pair inventing words so they can "really hear each other".
    * **Why B:** Equilibrium balances a birth against a grandfather's decline, not a father and deaf son.
    * **Why C:** Prayer frames a life between birth and death through prayer, not a shared invented language.
    * **Why D:** Theme for English B concerns race and identity in a college assignment, not a father and son.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Antrobus repeats lines from each stanza in the next, circling back on the same phrases. What does that pantoum-like recurrence achieve?
    * **Options:** A) It suggests the speaker has forgotten what he wrote, B) The circling repetition mirrors the pair's patient, repeated ritual and the way understanding is built by going over the same ground together, C) It turns the poem into a heroic ballad, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Lines like "his deaf son who slurs his speech" keep returning — the pantoum-like circling enacts the patient, repeated ritual of father and son slowly learning to hear each other.
    * **Why A:** The recurrence is a deliberate, meaningful pattern, not forgetfulness.
    * **Why C:** The gentle, circling form is intimate, not a heroic ballad.
    * **Why D:** The repetition is exactly how the form mirrors the pair's patient ritual.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the invented word "Rain-nan Akabok" come to represent in the poem, and how does it make us feel?
    * **Options:** A) A mistake the father is determined to correct, B) An affectionate, private language shared between father and deaf son, born from a mispronunciation and kept out of love, C) A word borrowed from another poem in the anthology, D) A term of frustration between them
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rather than correcting it, the father laughs and calls his son "something else" — "Rain-nan Akabok" becomes a warm, private language of their own, part of "really hear[ing] each other".
    * **Why A:** The father embraces the mispronunciation with laughter rather than fixing it.
    * **Why C:** The word belongs only to this poem, invented between father and son.
    * **Why D:** The moment is warm and joyful, not frustrated.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem draws cross-cultural solidarity in grief — moving through four grandmothers, one who "died grinding cardamom" and one who "broke cinnamon barks between her palms", to comfort a mourning friend?
    * **Options:** A) Tea With Our Grandmothers, B) Equilibrium, C) Prayer, D) Theme for English B
    * **Correct:** A
    * **Feedback:** ✓ Correct. Warsan Shire's "Tea With Our Grandmothers" argues that grief is shared across cultures — gathering four grandmothers, one who "died grinding cardamom", another who "broke cinnamon barks between her palms", to console a grieving friend.
    * **Why B:** Equilibrium concerns one grandfather's decline, not four grandmothers across cultures.
    * **Why C:** Prayer frames a life between birth and death, not a catalogue of grandmothers.
    * **Why D:** Theme for English B is set in a college classroom, with no grandmothers.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Shire gives each grandmother a matching stanza, all joined by semicolons into one long, cumulative sentence. What does that parallel, unbroken structure achieve?
    * **Options:** A) It keeps the grandmothers separate and unrelated, B) The parallel stanzas set the grandmothers side by side as equals, and the single flowing sentence binds their separate lives into one shared act of tribute and solidarity, C) It turns the poem into a strict rhyming sonnet, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. Matching stanzas and the one cumulative sentence place the grandmothers alongside one another and link them into a single tribute — the form itself performs the cross-cultural solidarity the poem seeks.
    * **Why A:** The parallel, joined structure connects the grandmothers rather than separating them.
    * **Why C:** The poem is loose free verse, not a rhyming sonnet.
    * **Why D:** The parallel, unbroken structure is central to the poem's sense of shared grief.

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
    * **Question:** Which poem turns a college writing assignment into a meditation on race and shared identity — "the only colored student" answering an instructor's "Go home and write / a page tonight"?
    * **Options:** A) Theme for English B, B) Prayer, C) Happy Birthday Moon, D) Tea With Our Grandmothers
    * **Correct:** A
    * **Feedback:** ✓ Correct. Langston Hughes's "Theme for English B" argues that identity is shared and intertwined — "the only colored student" answers the instructor's "Go home and write / a page tonight" by questioning what is true across race.
    * **Why B:** Prayer concerns birth and death within a family, not a college assignment and race.
    * **Why C:** Happy Birthday Moon is about a father and deaf son at home, not a classroom meditation on identity.
    * **Why D:** Tea With Our Grandmothers concerns grief and grandmothers, not a writing assignment.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** The poem opens with the instructor's assignment in short, clipped, indented lines, then opens out into the speaker's flowing, conversational first-person voice. What does that shift in form achieve?
    * **Options:** A) It shows the speaker cannot follow instructions, B) Moving from the institution's clipped command into the student's own expansive voice enacts his claim to speak for himself and answer the assignment on his own terms, C) It turns the poem into a formal ode, D) It has no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The brief, boxed-in assignment gives way to the speaker's roomy, talking voice — the change of form itself dramatises him taking ownership of the page and answering as himself.
    * **Why A:** The shift is a deliberate assertion of voice, not a failure to follow the task.
    * **Why C:** The relaxed, conversational voice is the opposite of a formal ode.
    * **Why D:** The move from clipped command to expansive voice is central to the poem's meaning.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What conclusion does the speaker reach about his relationship with his white instructor, and how does it make us feel?
    * **Options:** A) That they share nothing at all in common, B) That despite racial and social inequality, each is "a part of" the other — both shape and are shaped by each other — leaving us with a hard-won sense of shared humanity, C) That the instructor is entirely wrong to have set the assignment, D) That only the instructor can ever learn anything from the other
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hughes concludes that speaker and instructor are mutually bound — "a part of you, instructor... yet a part of me" — even as he notes the instructor remains "older—and white—and somewhat more free", leaving us with a complex, shared humanity.
    * **Why A:** The poem insists on shared, intertwined identity, not total separation.
    * **Why C:** The poem questions the assignment's premise but does not reject it outright.
    * **Why D:** The closing lines insist that learning runs both ways between them.
