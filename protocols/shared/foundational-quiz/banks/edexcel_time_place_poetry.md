# Foundational Quiz Bank — Edexcel Time and Place Poetry (Poems)

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
- **@set:1** — To Autumn (Keats) · Composed upon Westminster Bridge (Wordsworth) · Adlestrop (Thomas) · In Romney Marsh (Davidson) · Home Thoughts from Abroad (Browning)
- **@set:2** — London (Blake) · Where the Picnic Was (Hardy) · Absence (Jennings) · I started Early – Took my Dog (Dickinson) · First Flight (Fanthorpe)
- **@set:3** — Presents from my Aunts in Pakistan (Alvi) · Hurricane Hits England (Nichols) · Nothing's Changed (Afrika) · Postcard from a Travel Snob (Hannah) · Stewart Island (Adcock)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Time and Place Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem addresses the season directly as "Season of mists and mellow fruitfulness", picturing it seated on a granary floor and drowsed by the fume of poppies?
   * **Options:** A) To Autumn (Keats), B) Composed upon Westminster Bridge (Wordsworth), C) Adlestrop (Thomas), D) Home Thoughts from Abroad (Browning)
   * **Correct:** A
   * **Feedback:** ✓ Correct. Keats's ode personifies autumn as a fruitful reaper, richly detailing harvest imagery across three stanzas.
   * **Why B:** Westminster Bridge admires a sleeping city at dawn, not a personified harvest season.
   * **Why C:** Adlestrop recalls a stationary train stop, not seasonal personification.
   * **Why D:** Home Thoughts from Abroad longs for English spring, not autumn's harvest.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Keats use for "To Autumn", and how is it built?
   * **Options:** A) A Horatian ode of three eleven-line stanzas, addressed directly to the season, B) A ballad with a repeating refrain, C) A Petrarchan sonnet, D) Free verse with no stanza pattern
   * **Correct:** A
   * **Feedback:** ✓ Correct. To Autumn is a Horatian ode of three eleven-line stanzas, its dense, formal address to the season slowing the reader into its ripeness.
   * **Why B:** There is no narrative refrain; the poem is a formal ode, not a ballad.
   * **Why C:** It runs across three eleven-line stanzas, not a fourteen-line sonnet.
   * **Why D:** Its stanzas are patterned and rhymed, not open free verse.

3. **Type: Select All [Tests Meaning & Effects]**
   @set:1
   * **Question:** Which statements correctly describe "To Autumn"?
   * **Options:** A) The ode personifies autumn as an active, almost human figure at work in the harvest, B) The final stanza turns to the sounds of an autumn evening rather than mourning summer's loss, C) The dense, sensuous language slows the reader to dwell on ripeness and abundance, D) The poem treats the coming winter with fear and horror
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. Keats personifies autumn at work in the harvest, closes on evening sound rather than lament, and uses rich language to slow the reader into savouring abundance.
   * **Why D:** The tone is accepting and celebratory, not fearful, even as the season turns.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Wordsworth's sonnet, the speaker declares that "[BLANK] has not anything to show more fair" than the view from the bridge at dawn.
   * **Answer:** Earth
   * **Feedback:** ✓ Correct. The sonnet opens with this superlative claim, the whole poem building outward from that hushed dawn view of London.
   * **WhyWrong:** The word is "Earth" — Wordsworth's opening claim that nothing on Earth is fairer than this sleeping cityscape.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Wordsworth use for "Composed upon Westminster Bridge"?
   * **Options:** A) A Petrarchan sonnet, B) A dramatic monologue, C) An ode, D) A ballad
   * **Correct:** A
   * **Feedback:** ✓ Correct. It is a Petrarchan sonnet, its calm, ordered octave-and-sestet shape capturing a tranquil early-morning view of the sleeping city.
   * **Why B:** There is no single revealing speaker addressing a silent listener, as in a monologue.
   * **Why C:** It is a fourteen-line sonnet, not an extended ode of praise.
   * **Why D:** There is no narrative story told in song-like stanzas.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "Composed upon Westminster Bridge", the city is personified as sleeping, its buildings compared to a great heart lying still.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The poem's close pictures "all that mighty heart" of the city lying still, personifying London as a living body at rest.
   * **WhyWrong:** This is true — the poem personifies the city as a sleeping body, its "mighty heart" lying still in the dawn hush.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does an express train draw up unexpectedly at a small, empty station, where "no one left and no one came" onto the bare platform?
   * **Options:** A) Adlestrop, B) In Romney Marsh, C) Stewart Island, D) First Flight
   * **Correct:** A
   * **Feedback:** ✓ Correct. Thomas's "Adlestrop" recalls an unscheduled stop at a deserted country station, its stillness broken only by a blackbird's song.
   * **Why B:** In Romney Marsh describes a walk through marshland at dusk, not a stationary train.
   * **Why C:** Stewart Island describes a remote island landscape, not an English railway halt.
   * **Why D:** First Flight concerns air travel, not a train stopping at a country station.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Adlestrop" structured?
   * **Options:** A) As a quiet narrative in four simple rhymed quatrains, B) As a dramatic monologue exposing a speaker's pretension, C) As an unrhymed Horatian ode, D) As a villanelle with a repeating refrain
   * **Correct:** A
   * **Feedback:** ✓ Correct. The poem's four plain, rhymed quatrains hold the memory still, matching the calm, unhurried stillness of the moment recalled.
   * **Why B:** There is no self-revealing speaker addressing a listener; this is a quiet personal recollection.
   * **Why C:** The poem is simply rhymed and stanzaic, not an ode's elevated form.
   * **Why D:** There is no repeating refrain of the kind a villanelle demands.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the widening birdsong at the end of "Adlestrop" suggest?
   * **Options:** A) That the moment connects the speaker outward to the whole surrounding countryside, B) That the train is about to break down, C) That the station is crowded and noisy, D) That the speaker dislikes birds
   * **Correct:** A
   * **Feedback:** ✓ Correct. As the blackbird's song spreads to all the birds of the surrounding counties, the single still moment opens out into a sense of belonging to the whole landscape.
   * **Why B:** The poem's mood is peaceful stillness, not mechanical trouble.
   * **Why C:** The platform is described as bare and empty, not crowded.
   * **Why D:** The birdsong is a moment of calm connection, not dislike.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem follows a speaker walking along a sea wall at dusk through the flat marshland landscape of the Kent coast, absorbed in the changing light and the sounds of sea and land?
    * **Options:** A) In Romney Marsh, B) Nothing's Changed, C) Hurricane Hits England, D) Presents from my Aunts in Pakistan
    * **Correct:** A
    * **Feedback:** ✓ Correct. Davidson's poem traces a walk across the flat coastal marsh at evening, the speaker absorbed by the landscape's changing light and sound.
    * **Why B:** Nothing's Changed is set in apartheid-era District Six, not the English coast.
    * **Why C:** Hurricane Hits England follows a Caribbean-born speaker reconnecting with elemental storm-gods.
    * **Why D:** Presents from my Aunts in Pakistan concerns gifts and cultural identity, not a coastal walk.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "In Romney Marsh" built?
    * **Options:** A) As a descriptive, regularly rhymed narrative following the walk in ordered stanzas, B) As a free-verse interior monologue, C) As a strict villanelle with a repeating refrain, D) As a dramatic monologue exposing the speaker's snobbery
    * **Correct:** A
    * **Feedback:** ✓ Correct. Davidson uses regular rhymed stanzas to move steadily through the walk, the ordered form matching the measured pace of a coastal evening stroll.
    * **Why B:** The poem is patterned and rhymed, not loose free verse.
    * **Why C:** It has no repeating refrain of the kind a villanelle demands.
    * **Why D:** The poem observes landscape outward; it does not expose a speaker's own pretension.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** "In Romney Marsh" presents the marshland landscape as a place of quiet beauty, observed closely as light and weather shift across it.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem's close attention to changing light and coastal detail builds a sense of quiet, absorbed appreciation for the marsh landscape.
    * **WhyWrong:** This is true — the poem's careful observation of shifting light and scene creates its sense of quiet coastal beauty.

13. **Type: Fill [Tests Recognising the Poem]**
    @set:1
    * **Question:** Browning's homesick speaker cries "Oh, to be in [BLANK] / Now that April's there", picturing the English spring from abroad.
    * **Answer:** England
    * **Feedback:** ✓ Correct. The exclamation opens the poem, the speaker picturing English spring in vivid, longing detail while away from home.
    * **WhyWrong:** The word is "England" — the speaker's homesick cry for English spring while abroad.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "Home Thoughts from Abroad" structured?
    * **Options:** A) Two stanzas of varying line length, lyrical and rhymed, building from close detail to a wider English scene, B) A single unbroken sonnet, C) A ballad with a chorus, D) Free verse with no rhyme
    * **Correct:** A
    * **Feedback:** ✓ Correct. The two rhymed, unevenly lined stanzas move from precise natural detail — the elm, the thrush — outward to a fuller picture of English spring.
    * **Why B:** The poem runs across two stanzas of uneven length, not a fourteen-line sonnet.
    * **Why C:** There is no sung refrain or chorus of the kind a ballad uses.
    * **Why D:** The stanzas are rhymed and patterned, not open free verse.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the repeated, precise detail of English spring — the thrush that "sings each song twice over", the buttercups — suggest about the speaker's feelings?
    * **Options:** A) An idealised, intense homesickness that treasures small, remembered details of England above all else, B) Indifference to being abroad, C) A wish never to return home, D) Contempt for the English countryside
    * **Correct:** A
    * **Feedback:** ✓ Correct. The speaker's precise, treasured recollection of small English details reveals an intense, idealising homesickness for a country reduced to its most cherished sights and sounds.
    * **Why B:** The vivid longing throughout expresses deep feeling, not indifference.
    * **Why C:** The whole poem yearns to return, not to stay away.
    * **Why D:** The countryside is remembered with tenderness, not contempt.

<!-- ============================ SET 2 ============================ -->

16. **Type: Fill [Tests Recognising the Poem]**
    @set:2
    * **Question:** In Blake's poem, the speaker wanders through the "chartered" streets of [BLANK], hearing misery in every voice he passes.
    * **Answer:** London
    * **Feedback:** ✓ Correct. "London" walks through the "chartered" streets of the city, cataloguing suffering audible in every face and cry.
    * **WhyWrong:** The city is London — Blake's chartered streets and "mind-forg'd manacles" map its suffering.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "London" structured, and which technique dominates it?
    * **Options:** A) Regular rhymed quatrains driven by insistent repetition of words like "every", B) Free verse with no repetition, C) A Petrarchan sonnet, D) A loose dramatic monologue
    * **Correct:** A
    * **Feedback:** ✓ Correct. Blake's tight, regular quatrains and the pounding repetition of "every" make the city's misery feel relentless and inescapable.
    * **Why B:** The poem is heavily rhymed and repetitive, not free verse.
    * **Why C:** It runs across four quatrains, not a fourteen-line sonnet.
    * **Why D:** There is a single observing voice, but no revealing monologue addressed to a listener.

18. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "London", the phrase "mind-forg'd manacles" suggests that the people's oppression is partly mental and self-imposed, not only external.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The "mind-forg'd manacles" imply chains forged in the mind — oppression imposed by authority, but also internalised by those who suffer it.
    * **WhyWrong:** This is the force of the image — manacles forged in the mind suggest oppression internalised as well as imposed.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does the speaker climb back to a hilltop where a picnic once took place, finding only the traces of a burnt-out fire and reflecting that most of the group are now dead?
    * **Options:** A) Where the Picnic Was, B) Adlestrop, C) I started Early – Took my Dog, D) First Flight
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's elegy returns the speaker to the hilltop scene of a past picnic, its cold ashes prompting mourning for companions since lost.
    * **Why B:** Adlestrop recalls a train's brief stop at a country station, not a returned-to picnic site.
    * **Why C:** Dickinson's poem imagines a walk with the personified sea, not a memorial visit.
    * **Why D:** First Flight concerns the experience of air travel, not a remembered picnic.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Where the Picnic Was" by Hardy is best described as which form?
    * **Options:** A) An elegy, mourning a lost happy time and the friends now gone, B) An epic narrative, C) A sonnet, D) A villanelle
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem is an elegy, its quiet, mournful reflection returning to a site of past happiness now marked by loss.
    * **Why B:** It is a short, personal poem of mourning, not a long heroic epic.
    * **Why C:** It is not shaped as a fourteen-line sonnet.
    * **Why D:** It carries no villanelle-style repeating refrains.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What effect does revisiting the physical site of the picnic have on the speaker in Hardy's poem?
    * **Options:** A) It sharpens the sense of loss, as a once-happy place now stands mostly empty of the people who filled it, B) It brings only joy and no sadness, C) It proves the speaker has entirely forgotten the event, D) It celebrates a reunion of old friends
    * **Correct:** A
    * **Feedback:** ✓ Correct. Standing again on the hilltop, the speaker measures present emptiness against past happiness, deepening the sense of mourning for friends now gone.
    * **Why B:** The dominant feeling is grief and loss, not simple joy.
    * **Why C:** The vivid, detailed return proves the memory is far from forgotten.
    * **Why D:** No reunion occurs; the speaker instead confronts absence.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes a speaker returning to a garden or place once shared with someone now absent, expecting powerful memories but instead finding the place strangely ordinary?
    * **Options:** A) Absence, B) Hurricane Hits England, C) Presents from my Aunts in Pakistan, D) Stewart Island
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jennings's "Absence" returns the speaker to a once-shared place, where the expected flood of memory fails to arrive, leaving only an ordinary scene.
    * **Why B:** Hurricane Hits England follows a storm reconnecting the speaker to ancestral elemental forces, not a place of past love.
    * **Why C:** Presents from my Aunts in Pakistan concerns gifts and cultural identity, not a revisited garden.
    * **Why D:** Stewart Island describes a remote landscape, not a place tied to a lost relationship.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "Absence" by Jennings shaped?
    * **Options:** A) As a quiet, reflective free-verse meditation on a single visited place, B) As a strict rhymed sonnet, C) As a ballad telling an adventure story, D) As a dramatic monologue exposing the speaker's pretension
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem's loose, reflective free verse suits its quiet, searching meditation on a place and an absence.
    * **Why B:** The poem does not hold to the fixed fourteen-line sonnet form.
    * **Why C:** There is no narrative adventure told in song-like stanzas.
    * **Why D:** The speaker reflects honestly rather than unwittingly exposing pretension.

24. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Absence", the ordinariness of the revisited place makes the absence of the loved person feel more powerful, not less.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Because the place offers no dramatic reminder, the plain, unchanged scene throws the person's absence into sharper relief.
    * **WhyWrong:** This is true — the very ordinariness of the place is what makes the absence felt so strongly.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem imagines the sea as a courting or threatening suitor, its tide rising past the speaker's shoe, apron and belt, before withdrawing "with a Mighty look"?
    * **Options:** A) I started Early – Took my Dog, B) In Romney Marsh, C) Adlestrop, D) Stewart Island
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dickinson's poem personifies the sea as a pursuing figure, its rising tide and eventual withdrawal charged with courtship and threat.
    * **Why B:** In Romney Marsh observes a marsh landscape at dusk, not a personified sea pursuing the speaker.
    * **Why C:** Adlestrop is set at a still country railway station, not the shore.
    * **Why D:** Stewart Island describes a remote island's landscape, not the sea personified as a suitor.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** Dickinson writes "I started Early – Took my Dog" in her characteristic hymn-like [BLANK] metre, using dashes and near-rhyme across short quatrains.
    * **Answer:** common
    * **Feedback:** ✓ Correct. Dickinson's familiar common-metre quatrains, broken by dashes, give the poem its distinctive, halting, hymn-like rhythm.
    * **WhyWrong:** The word is "common" — her common-metre quatrains, with their dashes and slant rhyme, are a hallmark of Dickinson's style.

27. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe "I started Early – Took my Dog"?
    * **Options:** A) The sea is personified as pursuing the speaker, rising past her shoe, apron and belt, B) The speaker eventually retreats safely to "the Solid Town", C) The poem's charged imagery blends courtship, threat and awe at the sea's power, D) The poem is a comic nursery rhyme with no deeper meaning
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Dickinson personifies the sea as an advancing, courting-and-threatening figure, has the speaker retreat to "the Solid Town", and blends courtship, danger and awe throughout.
    * **Why D:** The poem's charged personification and ambiguity give it serious depth, far beyond a simple nursery rhyme.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes the experience of a first journey by aeroplane, weighing the strangeness and wonder of modern air travel against an older, more traditional sense of place?
    * **Options:** A) First Flight, B) Home Thoughts from Abroad, C) Where the Picnic Was, D) London
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fanthorpe's "First Flight" reflects on the disorientating newness of air travel, set against older, more grounded ways of experiencing distance and place.
    * **Why B:** Home Thoughts from Abroad longs for a remembered English spring, not the experience of flying itself.
    * **Why C:** Where the Picnic Was mourns a remembered gathering, not a journey by air.
    * **Why D:** London surveys a city's suffering on foot, not a flight.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "First Flight" by Fanthorpe shaped?
    * **Options:** A) As a wry, conversational free-verse reflection, B) As a strict Petrarchan sonnet, C) As a ballad with a sung refrain, D) As rhyming couplets throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fanthorpe's characteristically wry, conversational free verse suits her reflective, questioning treatment of a modern experience.
    * **Why B:** The poem does not hold to the fixed fourteen-line sonnet shape.
    * **Why C:** There is no repeated sung refrain of the kind a ballad uses.
    * **Why D:** The poem is not built from continuous rhyming couplets.

30. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "First Flight" explores a sense of dislocation and wonder at how far modern travel has changed the human experience of distance and place.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem sets the speed and strangeness of flight against older, slower ways of understanding distance, producing both wonder and unease.
    * **WhyWrong:** This is true — the poem holds modern flight's speed and strangeness against older, slower ideas of distance and place.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does a speaker describe glass bangles that "snapped, drew blood" and salwar kameez sent from aunts abroad, feeling caught between two cultures?
    * **Options:** A) Presents from my Aunts in Pakistan, B) Nothing's Changed, C) Hurricane Hits England, D) Stewart Island
    * **Correct:** A
    * **Feedback:** ✓ Correct. Alvi's poem catalogues gifts from Pakistan — bangles, salwar kameez, a camel-skin lamp — while the speaker feels suspended between English and Pakistani identities.
    * **Why B:** Nothing's Changed is set in apartheid-era District Six, not gifts from relatives abroad.
    * **Why C:** Hurricane Hits England follows a storm, not a parcel of clothes and jewellery.
    * **Why D:** Stewart Island describes a remote landscape, not cultural gifts and identity.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Presents from my Aunts in Pakistan" structured?
    * **Options:** A) In free verse, its loose, shifting lines mirroring the speaker's unsettled sense of identity, B) In a strict rhymed sonnet, C) As a ballad with a repeating refrain, D) In rhyming couplets throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. The open, irregular free verse suits the speaker's divided, shifting sense of belonging between two cultures.
    * **Why B:** The poem does not hold to the fixed fourteen-line sonnet shape.
    * **Why C:** There is no sung, repeating refrain in the poem.
    * **Why D:** The poem is not built from continuous rhyming couplets.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the speaker feel towards the Pakistani clothes and jewellery she receives?
    * **Options:** A) A mix of guilt, discomfort and longing, unsure whether she belongs to the culture the gifts represent, B) Pure, uncomplicated delight, C) Total indifference, D) Outright rejection of her heritage
    * **Correct:** A
    * **Feedback:** ✓ Correct. The speaker's ambivalence — drawn to the gifts' beauty yet uneasy wearing them — captures her unresolved position between English and Pakistani identity.
    * **Why B:** Her response is conflicted, not simply delighted.
    * **Why C:** The gifts provoke strong, complicated feeling, not indifference.
    * **Why D:** She is drawn to her heritage even as she feels distanced from it, not rejecting it outright.

34. **Type: Fill [Tests Recognising the Poem]**
    @set:3
    * **Question:** In Grace Nichols's poem, the hurricane is felt as an ancestral, elemental force, named after gods such as "Huracan" and "[BLANK]".
    * **Answer:** Oya
    * **Feedback:** ✓ Correct. Nichols names African and Caribbean storm-deities — Huracan, Oya, Shango — reframing the English storm as an ancestral, elemental visitation.
    * **WhyWrong:** The name is "Oya" — one of the storm-goddesses Nichols invokes to reconnect the speaker to ancestral, elemental forces.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Hurricane Hits England" by Nichols structured?
    * **Options:** A) In free verse, its irregular lines mirroring the storm's dynamic, unpredictable energy, B) As a strict Petrarchan sonnet, C) As rhyming couplets throughout, D) As a villanelle with a fixed refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem's loose, irregular free verse mirrors the storm's dynamic energy and the speaker's own charged, shifting response to it.
    * **Why B:** The poem does not hold to a fixed fourteen-line sonnet shape.
    * **Why C:** The poem is not built from continuous rhyming couplets.
    * **Why D:** There is no fixed, repeating refrain of the kind a villanelle demands.

36. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** In "Hurricane Hits England", the storm brings the speaker closer to her Caribbean and African ancestry rather than simply frightening her.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Naming the storm after ancestral gods, the speaker reads the hurricane as a force reconnecting her to her origins, not merely a threat.
    * **WhyWrong:** This is true — the storm becomes a means of reconnecting the speaker to her ancestral, elemental origins.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a speaker walking through District Six, hearing "small round hard stones click under my heels", and standing outside a "whites only" restaurant?
    * **Options:** A) Nothing's Changed, B) Postcard from a Travel Snob, C) Stewart Island, D) London
    * **Correct:** A
    * **Feedback:** ✓ Correct. Afrika's poem walks the speaker through the ruins of District Six, the segregated inn's "haute cuisine" sharpening his anger at apartheid's persistence.
    * **Why B:** Postcard from a Travel Snob is a comic monologue exposing a pretentious tourist, not a protest against apartheid.
    * **Why C:** Stewart Island describes a remote landscape, not a segregated city district.
    * **Why D:** London surveys an oppressive Georgian city, not apartheid-era South Africa.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Nothing's Changed" structured?
    * **Options:** A) In free verse, its raw, unconstrained lines suiting the speaker's anger and sense of dislocation, B) As a Petrarchan sonnet, C) As a ballad with a sung refrain, D) In strict rhyming couplets
    * **Correct:** A
    * **Feedback:** ✓ Correct. The unconstrained free verse matches the speaker's bitter, unresolved response to the injustice and division he observes.
    * **Why B:** The poem does not hold to a fixed fourteen-line sonnet shape.
    * **Why C:** There is no sung, repeating refrain in the poem.
    * **Why D:** The poem is not built from continuous rhyming couplets.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the speaker's reaction outside the "whites only" restaurant reveal?
    * **Options:** A) That apartheid's divisions persist in substance even where explicit signs no longer say so, B) That segregation has fully ended, C) That the speaker feels no anger at all, D) That the restaurant welcomes everyone equally
    * **Correct:** A
    * **Feedback:** ✓ Correct. Though "no board says it is", the speaker recognises the same exclusion still operating in practice, fuelling his suppressed fury.
    * **Why B:** The poem insists the division persists in reality, whatever signs no longer state.
    * **Why C:** His anger is intense, even where he does not act on it.
    * **Why D:** The restaurant's exclusivity is exactly what provokes his anger.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is a comic dramatic monologue in the voice of a boastful traveller, who sneers at conventional tourists while unwittingly revealing their own pretension?
    * **Options:** A) Postcard from a Travel Snob, B) Nothing's Changed, C) Hurricane Hits England, D) I started Early – Took my Dog
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hannah's monologue lets a self-satisfied traveller's own boasting expose their snobbery, the comedy sharpening the poem's gentle satire.
    * **Why B:** Nothing's Changed protests apartheid-era segregation, not a tourist's pretension.
    * **Why C:** Hurricane Hits England reconnects a speaker to ancestral storm-gods, not tourist boasting.
    * **Why D:** Dickinson's poem personifies the sea as a suitor, not a travelling snob.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the dramatic monologue form shape "Postcard from a Travel Snob"?
    * **Options:** A) It lets the speaker's own words expose their snobbery and pretension without the poet needing to state it directly, B) It mourns a lost companion, C) It praises a season's abundance, D) It tells a heroic battle story
    * **Correct:** A
    * **Feedback:** ✓ Correct. By letting the traveller speak in their own boastful voice, the form itself delivers the poem's satirical judgement.
    * **Why B:** The poem is comic satire, not an elegy for someone lost.
    * **Why C:** It mocks pretension, not celebrates a season.
    * **Why D:** There is no battle narrative; the target is social snobbery.

42. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** The comic tone of "Postcard from a Travel Snob" works to mock a certain kind of pretentious, superior attitude towards travel and other tourists.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem's wit targets the speaker's self-satisfied superiority, using comedy to expose snobbery rather than celebrate it.
    * **WhyWrong:** This is true — the poem's humour is aimed squarely at mocking the traveller's pretension and condescension.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a remote island landscape at the edge of the world, its wildness and isolation prompting quiet reflection?
    * **Options:** A) Stewart Island, B) Adlestrop, C) Home Thoughts from Abroad, D) London
    * **Correct:** A
    * **Feedback:** ✓ Correct. Adcock's poem sets its reflection against the wild, isolated landscape of Stewart Island, off New Zealand's southern coast.
    * **Why B:** Adlestrop is a brief English railway stop, not a remote southern island.
    * **Why C:** Home Thoughts from Abroad longs for England, rather than dwelling on a remote landscape's isolation.
    * **Why D:** London surveys a crowded, oppressive city, the opposite of a remote, sparsely populated island.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Stewart Island" by Adcock shaped?
    * **Options:** A) As a reflective free-verse description of landscape and isolation, B) As a strict Petrarchan sonnet, C) As a comic dramatic monologue, D) As a ballad narrating a battle
    * **Correct:** A
    * **Feedback:** ✓ Correct. The open, reflective free verse suits the poem's quiet dwelling on a remote landscape's wildness and isolation.
    * **Why B:** The poem does not hold to a fixed fourteen-line sonnet shape.
    * **Why C:** The poem's tone is reflective, not comic self-exposure.
    * **Why D:** There is no narrated battle in the poem's quiet landscape description.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Stewart Island"?
    * **Options:** A) It reflects on the isolation and wildness of a remote southern landscape, B) Its quiet, open form suits a mood of reflection rather than drama, C) The stark setting prompts a meditation on distance and solitude, D) It concludes that the island is crowded and unremarkable
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Adcock's poem dwells on a remote, wild landscape, its calm reflective form matching a mood of solitude and distance.
    * **Why D:** The island's isolation and stark wildness are central, not any sense of crowding.
