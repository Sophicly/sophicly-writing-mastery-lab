# Foundational Quiz Bank — Edexcel Time and Place Poetry (Poems)

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
- **@set:1** — To Autumn (Keats) · Composed upon Westminster Bridge (Wordsworth) · Adlestrop (Thomas) · In Romney Marsh (Davidson) · Home Thoughts from Abroad (Browning)
- **@set:2** — London (Blake) · Where the Picnic Was (Hardy) · Absence (Jennings) · I started Early – Took my Dog (Dickinson) · First Flight (Fanthorpe)
- **@set:3** — Presents from my Aunts in Pakistan (Alvi) · Hurricane Hits England (Nichols) · Nothing's Changed (Afrika) · Postcard from a Travel Snob (Hannah) · Stewart Island (Adcock)

### Quiz: Time and Place Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that autumn is a season of ripeness and quiet fulfilment to be savoured rather than mourned — opening by hailing the "Season of mists and mellow fruitfulness"?
   * **Options:** A) To Autumn (Keats), B) Composed upon Westminster Bridge (Wordsworth), C) Adlestrop (Thomas), D) Home Thoughts from Abroad (Browning)
   * **Correct:** A
   * **Feedback:** ✓ Correct. Keats's ode dwells on harvest abundance and, rather than lamenting the lost "songs of Spring", insists autumn has "thy music too" — an argument for accepting and savouring the season's fullness.
   * **Why B:** Composed upon Westminster Bridge celebrates a city's dawn calm, not a harvest season's ripeness.
   * **Why C:** Adlestrop recalls a still moment at a country station, not autumn's abundance.
   * **Why D:** Home Thoughts from Abroad longs for English spring, the opposite of autumn's harvest.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "To Autumn" unfolds in three long, densely packed stanzas. How does that unhurried three-stanza shape serve the poem?
   * **Options:** A) The slow, richly loaded lines make the reader linger over each detail of ripeness, and the movement across the three stanzas carries us gently from harvest to the day's "soft-dying" close, B) The brisk, clipped form rushes the reader past the season, C) The broken, irregular shape enacts panic and disorder, D) The stanza pattern has no bearing on how we read the poem
   * **Correct:** A
   * **Feedback:** ✓ Correct. The dense, sensuous lines slow us to dwell on abundance, while the three-stanza progression moves quietly from ripeness to the "soft-dying day" — the shape enacting the season's gentle turn.
   * **Why B:** The loaded, lingering lines slow the reader down; they do not rush.
   * **Why C:** The measured, ordered ode is calm and controlled, not broken or panicked.
   * **Why D:** The unhurried three-stanza movement is central to the poem's mood of savouring and acceptance.

3. **Type: Select All [Tests Meaning & Effects]**
   @set:1
   * **Question:** Which statements correctly describe the meaning and effect of "To Autumn"?
   * **Options:** A) The ode presents autumn as an active, almost human figure at work in the harvest, B) Its final stanza turns to the sounds of an autumn evening rather than mourning the loss of summer, C) The dense, sensuous language leaves us feeling contentment and calm acceptance of the season's ripeness, D) The poem treats the coming winter with fear and horror
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. Keats personifies autumn at work, closes on evening sound rather than lament, and leaves us with a contented, unhurried acceptance of ripeness and the turning year.
   * **Why D:** The tone is accepting and celebratory, not fearful; the poem savours the season rather than dreading what follows.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that the man-made city, hushed and still at dawn, can be as sublimely beautiful and calm as any natural landscape — claiming "Earth has not anything to show more fair"?
   * **Options:** A) Composed upon Westminster Bridge (Wordsworth), B) To Autumn (Keats), C) In Romney Marsh (Davidson), D) Adlestrop (Thomas)
   * **Correct:** A
   * **Feedback:** ✓ Correct. Wordsworth's sonnet finds an unexpected, reverent calm in London at daybreak — "all that mighty heart is lying still" — arguing the sleeping city rivals nature's own beauty.
   * **Why B:** To Autumn celebrates a harvest season, not a city seen at dawn.
   * **Why C:** In Romney Marsh admires a coastal marsh at dusk, not a sleeping cityscape.
   * **Why D:** Adlestrop recalls a country railway halt, not the view over London.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Composed upon Westminster Bridge" is a sonnet — a form usually reserved for love. What does using it here achieve?
   * **Options:** A) Its calm, ordered octave-and-sestet movement mirrors the hushed stillness of the scene, while the love-sonnet form itself elevates the city into an object of reverent devotion, B) Its jagged, broken shape enacts the chaos of the waking city, C) It makes the poem a lively, comic song, D) The sonnet form has no effect on how we read the city
   * **Correct:** A
   * **Feedback:** ✓ Correct. The measured sonnet shape holds the scene in a serene, ordered calm, and borrowing the form of love-poetry makes London itself an object of quiet reverence.
   * **Why B:** The sonnet is calm and controlled, not jagged or chaotic — the city is asleep.
   * **Why C:** The tone is hushed and reverent, not lively or comic.
   * **Why D:** The ordered, reverent form is exactly what lends the city its sublime calm.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "Composed upon Westminster Bridge", picturing the city as a sleeping body whose "mighty heart is lying still" leaves us with a feeling of calm, almost reverent wonder.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Imagining London as a living body at rest — its "mighty heart" lying still — fills the close with a hushed, reverent calm rather than any urban bustle.
   * **WhyWrong:** This is the effect — the sleeping-body image makes us feel a serene, reverent wonder at the still city, not noise or unease.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that a chance, unremarkable pause — an unscheduled stop where "no one left and no one came" — can open outward into a deep sense of belonging to a whole living landscape?
   * **Options:** A) Adlestrop (Thomas), B) In Romney Marsh (Davidson), C) Where the Picnic Was (Hardy), D) First Flight (Fanthorpe)
   * **Correct:** A
   * **Feedback:** ✓ Correct. Thomas's "Adlestrop" holds still on a deserted platform, then widens outward as a blackbird's song spreads to "all the birds / Of Oxfordshire and Gloucestershire" — a single quiet moment expanding into belonging.
   * **Why B:** In Romney Marsh traces an absorbed coastal walk, not a still railway halt opening outward.
   * **Why C:** Where the Picnic Was returns to a site of loss, not a moment of expansive belonging.
   * **Why D:** First Flight is about the disorientation of air travel, not a quiet grounded stillness.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Adlestrop" is built from plain, simple quatrains that hold almost motionless — until the final stanza. How does this shape the poem?
   * **Options:** A) The still, understated quatrains suspend the remembered minute in silence, and the widening last stanza — the birdsong reaching "farther and farther" — opens that stillness outward into the whole countryside, B) The galloping rhythm drives the poem urgently forward, C) The broken, chaotic form enacts confusion and panic, D) The stanza shape has no link to the poem's meaning
   * **Correct:** A
   * **Feedback:** ✓ Correct. The quiet quatrains hold the moment still, then the final stanza's outward-spreading birdsong — "farther and farther" — lets the contained stillness expand into a sense of the whole living landscape.
   * **Why B:** The poem is hushed and still, not driven by a galloping rhythm.
   * **Why C:** The form is calm and ordered, enacting stillness, not panic.
   * **Why D:** The move from held stillness to widening birdsong is central to the poem's effect.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What feeling does the widening birdsong at the close of "Adlestrop" leave us with?
   * **Options:** A) A quiet, expansive sense of peace and belonging, as one still moment connects the speaker to the whole surrounding countryside, B) Alarm that something has gone wrong with the train, C) Irritation at a noisy, crowded platform, D) Boredom at an empty, meaningless halt
   * **Correct:** A
   * **Feedback:** ✓ Correct. As the blackbird's song spreads to all the birds of the neighbouring counties, the single still moment opens into a calm, expansive sense of belonging to the whole landscape.
   * **Why B:** The mood is peaceful stillness, not alarm or mechanical trouble.
   * **Why C:** The platform is bare and empty; the birdsong brings calm, not irritation.
   * **Why D:** The stillness feels rich and meaningful, not boring or empty.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem builds an absorbed, almost musical appreciation of a place — a dusk walk along "Dymchurch Wall" where a "veil of purple vapour" and the singing telegraph wire fill the marsh with colour and sound?
    * **Options:** A) In Romney Marsh (Davidson), B) Nothing's Changed (Afrika), C) Hurricane Hits England (Nichols), D) Presents from my Aunts in Pakistan (Alvi)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Davidson's walk down and back up "Dymchurch Wall" gathers the marsh's shifting evening light, its "veil of purple vapour" and the wire's shrill music into a rapt, harmonious sense of place.
    * **Why B:** Nothing's Changed is set in apartheid-era District Six, not on the English coast.
    * **Why C:** Hurricane Hits England follows a storm reconnecting the speaker to ancestral forces, not a coastal walk.
    * **Why D:** Presents from my Aunts in Pakistan concerns cultural gifts and identity, not a marsh landscape.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** Davidson frames "In Romney Marsh" by going "down to Dymchurch Wall" at the start and coming "up from Dymchurch Wall" at the end. What does this framing achieve?
    * **Options:** A) The matched departure and return enclose the walk as one complete, ordered journey, so the marsh feels a contained, harmonious whole, B) The mismatched openings make the poem feel broken and disordered, C) It turns the poem into a comic monologue, D) The framing has no bearing on the poem's meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. Beginning "down to Dymchurch Wall" and closing "up from Dymchurch Wall" rounds the walk into a complete circuit, the return echoing the departure so the whole landscape feels ordered and harmonious.
    * **Why B:** The echoing frame gives the poem shape and order, not brokenness.
    * **Why C:** The poem observes a landscape; it is not a comic self-exposing monologue.
    * **Why D:** The circular frame is what makes the marsh feel a contained, harmonious whole.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** In "In Romney Marsh", turning the roar of the waves into a beach "with all its organ stops / Pealing" makes the wild coast feel ordered and almost musical, deepening the poem's rapt appreciation of the place.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The closing image of the beach "with all its organ stops / Pealing again" reshapes the natural roar into something ordered and musical, reinforcing the poem's absorbed, reverent sense of the marsh.
    * **WhyWrong:** This is the effect — the "organ stops" image turns the waves' roar into ordered, almost sacred music, part of the poem's rapt appreciation of place.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that distance turns love of home into an intense, idealising homesickness — treasuring every small remembered detail of English spring, down to the "wise thrush" who "sings each song twice over"?
    * **Options:** A) Home Thoughts from Abroad (Browning), B) To Autumn (Keats), C) Adlestrop (Thomas), D) Stewart Island (Adcock)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's exile cries "Oh, to be in England / Now that April's there", hoarding tiny cherished details of the English spring — an argument that absence idealises home.
    * **Why B:** To Autumn savours a present harvest, not a longed-for, absent homeland.
    * **Why C:** Adlestrop recalls a still English moment without the ache of exile and longing.
    * **Why D:** Stewart Island gives a guarded account of a remote place, the opposite of idealising homesickness.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "Home Thoughts from Abroad" moves from tiny, precise natural details out to a fuller English scene, in eager, exclamatory lines. How does this shape the feeling?
    * **Options:** A) The rush of exclamations and the pile-up of cherished small details enact the speaker's overflowing, longing nostalgia for home, B) The flat, list-like tone shows the speaker's boredom with England, C) The strict, slow sonnet form holds the emotion tightly in check, D) The structure has no effect on how we feel the speaker's longing
    * **Correct:** A
    * **Feedback:** ✓ Correct. The breathless exclamations ("Oh, to be in England") and the treasured, accumulating details make the longing feel eager and overflowing — form enacting homesickness.
    * **Why B:** The vivid, delighted detail expresses deep longing, not boredom.
    * **Why C:** The poem is eager and unevenly lined, not a tightly reined sonnet.
    * **Why D:** The exclamatory rush and heaped detail are exactly what convey the speaker's yearning.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the speaker's precise, treasured recollection of English spring — the thrush, the buttercups — make us feel about home?
    * **Options:** A) An idealising, intense homesickness that reduces a whole country to its most cherished, remembered sights, B) Indifference to being far from home, C) A wish never to return to England, D) Contempt for the English countryside
    * **Correct:** A
    * **Feedback:** ✓ Correct. The lovingly exact, hoarded details reveal a homesickness so intense it distils all of England into a handful of treasured spring images.
    * **Why B:** The vivid longing throughout expresses deep feeling, not indifference.
    * **Why C:** The whole poem yearns to return, not to stay away.
    * **Why D:** The countryside is remembered with tenderness, not contempt.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that a whole city's suffering is caused by human institutions — its people bound by "mind-forg'd manacles" in every "charter'd street"?
    * **Options:** A) London (Blake), B) Where the Picnic Was (Hardy), C) Absence (Jennings), D) First Flight (Fanthorpe)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Blake walks the "charter'd" streets and blames church, palace and law for the misery in every cry — arguing that the city's oppression is systemic and even internalised as "mind-forg'd manacles".
    * **Why B:** Where the Picnic Was mourns lost friends at a hillside, not a city's institutional misery.
    * **Why C:** Absence grieves a lost relationship in a quiet garden, not urban oppression.
    * **Why D:** First Flight concerns the strangeness of air travel, not a suffering city.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How do the tight, regular quatrains and the hammered repetition of "every" shape the meaning of "London"?
    * **Options:** A) They make the misery feel relentless and total — the rigid, repetitive form enacts a trap from which no one in the city can escape, B) They make the poem feel free, open and hopeful, C) They give the city a lively, celebratory energy, D) The form and repetition have no effect on the meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The locked-in quatrains and the pounding "every... every... every" make the suffering feel inescapable — the controlled form itself becomes a kind of manacle.
    * **Why B:** The form is rigid and repetitive, the opposite of free or hopeful.
    * **Why C:** The relentless repetition deepens the misery; it does not celebrate.
    * **Why D:** The regularity and repetition are central to the feeling of total, inescapable oppression.

18. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "London", the phrase "mind-forg'd manacles" suggests the people's oppression is partly mental and internalised, not only forced on them from outside.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The manacles are "forg'd" in the mind — Blake's darkest point is that the people are chained by authority and by their own internalised acceptance of it.
    * **WhyWrong:** This is the force of the image — chains made in the mind mean the oppression is internalised as well as imposed.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that returning to the site of a past happiness only measures how much has been lost — climbing to a hilltop where a "burnt circle" is all that remains of a group of friends now scattered, one of whom has "shut her eyes / For evermore"?
    * **Options:** A) Where the Picnic Was (Hardy), B) Adlestrop (Thomas), C) First Flight (Fanthorpe), D) I started Early – Took my Dog (Dickinson)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy climbs back to the cold "burnt circle" of a summer picnic to find the group gone — two "wandered far" and one dead "For evermore" — arguing that revisiting joy sharpens grief.
    * **Why B:** Adlestrop holds a still, peaceful moment, not a return to a site of loss.
    * **Why C:** First Flight is about the disorientation of flying, not mourning at a remembered place.
    * **Why D:** I started Early imagines the sea as a pursuing suitor, not a hilltop of lost friends.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Where the Picnic Was" moves from the physical traces of the fire to the bare final statement that one of the group has "shut her eyes / For evermore". How does this shaping affect the poem?
    * **Options:** A) Ending on that plain, unadorned fact lets the loss land quietly and heavily, the spare form deepening the grief, B) The elaborate, ornate closing lines make the loss feel distant and abstract, C) A cheerful refrain turns the ending celebratory, D) The way the poem closes has no bearing on its feeling
    * **Correct:** A
    * **Feedback:** ✓ Correct. After the charred traces, the flat finality of "For evermore" falls with quiet weight — the understated form making the mourning land all the harder.
    * **Why B:** The closing is stark and plain, not ornate or distancing.
    * **Why C:** There is no cheerful refrain; the ending is one of loss.
    * **Why D:** The move to that bare final fact is exactly what makes the grief land.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What feeling does revisiting the picnic site produce in Hardy's poem?
    * **Options:** A) A deepened grief, as a once-happy place now stands empty of the people who filled it, B) Simple joy and no sadness at all, C) Relief that the speaker has forgotten the event, D) Delight at a reunion of old friends
    * **Correct:** A
    * **Feedback:** ✓ Correct. Standing again on the hilltop, the speaker measures present emptiness against past happiness, and the visit deepens the mourning for friends now gone.
    * **Why B:** The dominant feeling is grief and loss, not simple joy.
    * **Why C:** The vivid, detailed return shows the memory is far from forgotten.
    * **Why D:** No reunion occurs; the speaker instead confronts absence.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that an unchanged place can make loss strike hardest — returning to "the place where we last met", where the fountains still spray "their usual steady jet", until an inward "earthquake tremor" of grief breaks through?
    * **Options:** A) Absence (Jennings), B) Hurricane Hits England (Nichols), C) Presents from my Aunts in Pakistan (Alvi), D) Stewart Island (Adcock)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jennings returns to a once-shared place where nothing has changed — the fountains' "usual steady jet" — so that the sudden "earthquake tremor" of the loved one's absence lands with all the greater force.
    * **Why B:** Hurricane Hits England reconnects the speaker to ancestral storm-gods, not a place of lost love.
    * **Why C:** Presents from my Aunts in Pakistan concerns cultural identity, not a revisited garden.
    * **Why D:** Stewart Island describes a remote landscape, not a place tied to a lost relationship.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Absence" holds a calm, ordered, tightly-rhymed surface through most of its stanzas before the final "earthquake tremor". How does that form serve the poem?
    * **Options:** A) The serene, controlled stanzas mirror the outwardly unchanged place, so that when the ordered calm is broken by the "earthquake tremor" the shock of grief lands all the harder, B) The loose, chaotic verse enacts the speaker's open weeping from the start, C) A comic, sing-song rhythm undercuts the emotion, D) The ordered form has no effect on how the ending lands
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem's calm, ordered surface matches the deceptively unchanged place, so the eruption of the "earthquake tremor" in the final lines breaks that composure with sudden force.
    * **Why B:** The verse is composed and ordered, not chaotic — the point is the calm being broken.
    * **Why C:** There is no comic rhythm; the control is serious and is deliberately shattered.
    * **Why D:** The contrast between ordered calm and the final tremor is exactly what gives the grief its force.

24. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Absence", the very ordinariness of the revisited place — the fountains still spraying "their usual steady jet" — makes the final "earthquake tremor" of feeling for the absent person hit harder, not less.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Because the fountains and gardens seem unchanged, the sudden "earthquake tremor" that shakes "fountain, birds and grass" lands with far greater force than an obviously altered scene would.
    * **WhyWrong:** This is true — the unchanged calm of the place is exactly what makes the final "earthquake tremor" of grief strike so powerfully.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem imagines the sea as a courting-yet-threatening suitor — its rising tide pressing past the speaker's "Shoe", "Apron" and "Belt" before withdrawing "with a Mighty look" — blending desire, danger and awe?
    * **Options:** A) I started Early – Took my Dog (Dickinson), B) In Romney Marsh (Davidson), C) Adlestrop (Thomas), D) Stewart Island (Adcock)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dickinson personifies the sea as a pursuing figure, its tide climbing past "Shoe", "Apron" and "Belt" before it bows and withdraws "with a Mighty look" — the encounter charged with courtship, threat and awe.
    * **Why B:** In Romney Marsh observes a marsh landscape at dusk, not a personified sea pursuing the speaker.
    * **Why C:** Adlestrop is set at a still country railway station, far from the shore.
    * **Why D:** Stewart Island describes a remote island, not the sea imagined as a suitor.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Dickinson writes "I started Early – Took my Dog" in short, hymn-like quatrains broken by dashes and slant rhyme. How does that form shape the poem?
    * **Options:** A) The clipped, dash-broken lines give a halting, breathless movement that heightens the suspense of the sea's advance, B) The long, flowing lines make the encounter feel calm and untroubled, C) The strict sonnet form contains the drama in fourteen ordered lines, D) The metre and dashes have no bearing on the poem's tension
    * **Correct:** A
    * **Feedback:** ✓ Correct. The short quatrains and the dashes that keep interrupting the lines create a halting, held-breath movement, tightening the suspense as the sea rises past the speaker.
    * **Why B:** The dash-broken lines feel halting and tense, not calm and flowing.
    * **Why C:** The poem is built from short quatrains, not a fourteen-line sonnet.
    * **Why D:** The clipped, interrupted movement is central to the poem's mounting suspense.

27. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "I started Early – Took my Dog"?
    * **Options:** A) The sea is personified as pursuing the speaker, its tide rising past her "Shoe", "Apron" and "Belt", B) The speaker finally retreats to the safety of "the Solid Town", C) The charged imagery blends courtship, threat and awe at the sea's power, D) The poem is a light comic nursery rhyme with no deeper meaning
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Dickinson personifies the sea as an advancing suitor, has the speaker retreat to "the Solid Town", and blends courtship, danger and awe throughout.
    * **Why D:** The charged personification and its undertow of threat give the poem serious depth, far beyond a nursery rhyme.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that modern air travel lifts us into a strange, disorientating remove from ordinary place and time — a nervous flyer, unsettled that "We have come too high for history", above a "broad meringue kingdom / Of cumulus"?
    * **Options:** A) First Flight (Fanthorpe), B) Home Thoughts from Abroad (Browning), C) Where the Picnic Was (Hardy), D) London (Blake)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fanthorpe's uneasy passenger — "I don't like the feel of it" — rises above the clouds until "We have come too high for history", the flight cutting her off from familiar, grounded ways of knowing place.
    * **Why B:** Home Thoughts from Abroad longs for a remembered English spring, not the strangeness of flying.
    * **Why C:** Where the Picnic Was mourns a remembered gathering, not a journey by air.
    * **Why D:** London surveys a city's suffering on foot, not a flight above the clouds.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Fanthorpe repeatedly interrupts the speaker's thoughts with italicised snippets of a fellow passenger's small talk ("This is rather a short hop for me"). What does this do?
    * **Options:** A) The banal chatter cutting across the speaker's private unease dramatises the gap between ordinary small-talk and the strange, disorientating wonder of flight, B) The interruptions make the poem feel calm, ordered and untroubled, C) They turn the poem into a heroic ballad, D) The interruptions have no effect on how we read the flight
    * **Correct:** A
    * **Feedback:** ✓ Correct. The seasoned traveller's trivial chatter keeps breaking in on the speaker's quiet dread, so the form itself sets banal talk against the uncanny experience of being lifted "too high for history".
    * **Why B:** The intrusions unsettle the poem, heightening the contrast rather than calming it.
    * **Why C:** There is no sung refrain; the interruptions are overheard small-talk, not a ballad.
    * **Why D:** The clash between chatter and private unease is central to the poem's effect.

30. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "First Flight", the line "We have come too high for history" makes us feel that air travel has lifted the speaker into a strange, disorientating remove from ordinary time and place.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Declaring "We have come too high for history", the speaker registers a flight so far above the ordinary world that time itself seems suspended — the poem's sense of dislocation and wonder.
    * **WhyWrong:** This is the effect — "We have come too high for history" conveys exactly this sense of being lifted clear of ordinary time and place.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that a young speaker is caught between two cultures — drawn to yet alienated from Pakistani gifts, the "glass bangles" that "snapped, drew blood" — leaving her identity divided and unresolved?
    * **Options:** A) Presents from my Aunts in Pakistan (Alvi), B) Nothing's Changed (Afrika), C) Hurricane Hits England (Nichols), D) Stewart Island (Adcock)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Alvi's speaker, sent a salwar kameez and "glass bangles" that "snapped, drew blood", feels "half-English" and "alien" in her own sitting-room — an argument about a divided, in-between identity.
    * **Why B:** Nothing's Changed protests apartheid-era segregation, not divided cultural identity.
    * **Why C:** Hurricane Hits England is about a storm reconnecting the speaker to her roots, not conflicted gifts.
    * **Why D:** Stewart Island describes a remote landscape, not the pull between two cultures.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Presents from my Aunts in Pakistan" is written in loose, irregular free verse with shifting, uneven line lengths. How does that form serve the poem?
    * **Options:** A) The unsettled, shifting lines enact the speaker's divided, in-between sense of belonging to neither culture fully, B) The strict, regular rhyme scheme shows her secure, settled identity, C) The galloping metre gives the poem heroic momentum, D) The form has no bearing on the speaker's sense of identity
    * **Correct:** A
    * **Feedback:** ✓ Correct. The loose, drifting free verse — lines breaking and shifting unpredictably — mirrors the speaker's unresolved, "half-English" identity, at home in neither culture.
    * **Why B:** The verse is loose and irregular, the opposite of a secure, ordered rhyme scheme.
    * **Why C:** The reflective free verse has no galloping, heroic momentum.
    * **Why D:** The unsettled shape of the verse is exactly what conveys her divided identity.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the speaker feel toward the Pakistani clothes and jewellery she is sent?
    * **Options:** A) A conflicted mix of longing, discomfort and guilt, unsure whether she belongs to the culture the gifts represent, B) Pure, uncomplicated delight, C) Complete indifference, D) Outright, settled rejection of her heritage
    * **Correct:** A
    * **Feedback:** ✓ Correct. Drawn to the gifts' beauty yet "alien" wearing them and longing "for denim and corduroy", the speaker's ambivalence captures her unresolved place between two cultures.
    * **Why B:** Her response is conflicted, not simply delighted.
    * **Why C:** The gifts provoke strong, complicated feeling, not indifference.
    * **Why D:** She is drawn to her heritage even as she feels distanced from it, not rejecting it outright.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that a violent English storm can reconnect a Caribbean-born speaker to her ancestral roots — the hurricane read as an elemental visitation and addressed as the storm-gods "Huracan" and "Oya"?
    * **Options:** A) Hurricane Hits England (Nichols), B) Nothing's Changed (Afrika), C) Stewart Island (Adcock), D) Presents from my Aunts in Pakistan (Alvi)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Nichols greets the storm as ancestral gods — "Talk to me Huracan / Talk to me Oya" — so the hurricane becomes a force reconnecting her to her Caribbean and African origins rather than merely a threat.
    * **Why B:** Nothing's Changed protests apartheid-era segregation, not a storm's ancestral power.
    * **Why C:** Stewart Island gives a guarded account of a remote place, not an elemental reconnection.
    * **Why D:** Presents from my Aunts in Pakistan concerns cultural gifts, not a storm.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Hurricane Hits England" is written in loose, surging free verse threaded with the repeated call "Talk to me". How does this form serve the poem?
    * **Options:** A) The irregular, building lines and the chant-like "Talk to me" mirror the storm's wild energy and the speaker's rising, ecstatic reconnection with ancestral forces, B) The neat, contained rhyme scheme keeps the storm calm and distant, C) The comic, sing-song rhythm mocks the storm, D) The free-verse form has no bearing on the poem's energy
    * **Correct:** A
    * **Feedback:** ✓ Correct. The surging, irregular lines and the incantatory "Talk to me Huracan / Talk to me Oya" enact both the storm's dynamic force and the speaker's swelling, exalted response to it.
    * **Why B:** The verse is loose and surging, not neatly contained; the storm feels close and charged.
    * **Why C:** The tone is awed and reverent, not comic or mocking.
    * **Why D:** The building, chant-like form is central to the poem's storm-energy and reconnection.

36. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** In "Hurricane Hits England", the storm brings the speaker closer to her Caribbean and African ancestry rather than simply frightening her.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Naming the storm after ancestral gods and "aligning" herself to it, the speaker reads the hurricane as a force reconnecting her to her origins, not merely a threat.
    * **WhyWrong:** This is true — the storm becomes a means of reconnecting the speaker to her ancestral, elemental origins.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that injustice can persist in substance even when its signs are gone — a speaker walking through the ruins of District Six, where "small round hard stones click" underfoot, standing barred from a "whites only" inn?
    * **Options:** A) Nothing's Changed (Afrika), B) Postcard from a Travel Snob (Hannah), C) Stewart Island (Adcock), D) London (Blake)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Afrika walks District Six — "small round hard stones click / under my heels" — and finds the "whites only" exclusion still operating though "No board says it is", provoking a burning, suppressed anger.
    * **Why B:** Postcard from a Travel Snob mocks a pretentious tourist, not the persistence of apartheid.
    * **Why C:** Stewart Island describes a remote island landscape, not a segregated city district.
    * **Why D:** London surveys an oppressive Georgian city, not apartheid-era South Africa.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Nothing's Changed" is written in short, clipped, unrhymed lines, closing on the flat statement "Nothing's changed". How does that form shape the poem?
    * **Options:** A) The tight, hard-edged lines and the blunt final "Nothing's changed" enact the speaker's controlled, mounting fury and the deadlock of the injustice, B) The flowing, ornate lines make the poem feel calm and decorative, C) A cheerful refrain gives the ending a note of hope, D) The form has no bearing on the speaker's anger
    * **Correct:** A
    * **Feedback:** ✓ Correct. The clipped, unrhymed lines hold the anger tight, and the flat, final "Nothing's changed" lands the injustice as an unbroken, unresolved deadlock.
    * **Why B:** The lines are hard and clipped, not flowing or decorative.
    * **Why C:** The blunt ending offers no hope; it insists nothing has changed.
    * **Why D:** The taut form and flat close are central to the poem's controlled fury.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What feeling does the speaker's reaction outside the "whites only" inn provoke, and what does it reveal?
    * **Options:** A) A burning, suppressed anger at recognising that apartheid's divisions persist in practice, even where "No board says it is", B) Calm satisfaction that segregation has fully ended, C) Complete indifference to the exclusion, D) Warm gratitude that the inn welcomes everyone equally
    * **Correct:** A
    * **Feedback:** ✓ Correct. Though "No board says it is", the speaker recognises the same exclusion still operating, and the poem burns with his suppressed, inward-turning fury at an injustice that has not changed.
    * **Why B:** The poem insists the division persists in reality, whatever the signs no longer state.
    * **Why C:** His anger is intense, even where he does not act on it.
    * **Why D:** The inn's exclusivity is exactly what provokes his anger.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is a comic dramatic monologue whose boastful speaker — opening "I do not wish that anyone were here" and sneering at ordinary tourists — unwittingly exposes their own snobbery and pretension?
    * **Options:** A) Postcard from a Travel Snob (Hannah), B) Nothing's Changed (Afrika), C) Hurricane Hits England (Nichols), D) I started Early – Took my Dog (Dickinson)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hannah's speaker boasts "I do not wish that anyone were here" and sneers at the "package-philistine" masses, the comic irony exposing their own snobbery through their own words.
    * **Why B:** Nothing's Changed protests apartheid-era segregation, not a tourist's pretension.
    * **Why C:** Hurricane Hits England reconnects a speaker to ancestral storm-gods, not tourist boasting.
    * **Why D:** I started Early imagines the sea as a suitor, not a travelling snob.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the dramatic-monologue form of "Postcard from a Travel Snob" — closing on the boast "I am an anthropologist in trunks" — deliver the poem's judgement?
    * **Options:** A) By letting the speaker condemn themselves in their own words — the preening claim to be "an anthropologist in trunks" rather than "a British tourist in the sea" exposes the snobbery without the poet needing to state it, B) By mourning a lost companion in a solemn elegy, C) By praising the abundance of a season, D) By narrating a heroic battle
    * **Correct:** A
    * **Feedback:** ✓ Correct. The monologue hands the speaker the rope: boasting to be "an anthropologist in trunks" not "a British tourist in the sea", they expose their own pretension, and the form itself delivers the satire.
    * **Why B:** The poem is comic satire, not an elegy for someone lost.
    * **Why C:** It mocks pretension rather than celebrating a season.
    * **Why D:** There is no battle; the target is social snobbery.

42. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** The comic tone of "Postcard from a Travel Snob" — boasting of "sleeping in a local farmer's van" while sneering at "seaside-town-consumer-hell" — works to mock a certain kind of pretentious, superior attitude to travel.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The wit, from the boast about "a local farmer's van" to the sneer at "seaside-town-consumer-hell", targets the speaker's self-satisfied superiority, using comedy to expose snobbery rather than celebrate it.
    * **WhyWrong:** This is true — the humour is aimed squarely at mocking the traveller's pretension and condescension.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem sets another woman's easy praise of a place — "But look at all this beauty" — against the speaker's cooler, more guarded account, letting an undercurrent of discomfort surface beneath the scenery?
    * **Options:** A) Stewart Island (Adcock), B) Adlestrop (Thomas), C) Home Thoughts from Abroad (Browning), D) London (Blake)
    * **Correct:** A
    * **Feedback:** ✓ Correct. Adcock opens on the hotel manager's wife's claim "But look at all this beauty", then gives the speaker's own colder account — a seagull attacking her son, a decision "to leave the country" — so discomfort stirs beneath the island's beauty.
    * **Why B:** Adlestrop finds peace and belonging in a still English moment, not guarded discomfort.
    * **Why C:** Home Thoughts from Abroad idealises a longed-for home, the opposite of a wary account.
    * **Why D:** London surveys a crowded, oppressive city, not a remote, sparsely peopled island.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Stewart Island" opens with another woman's quoted enthusiasm — "But look at all this beauty" — before the speaker's own account. What does setting one voice against the other achieve?
    * **Options:** A) Framing the wife's easy praise against the speaker's cooler report creates an ironic distance that quietly undercuts the postcard view of the island, B) The two voices agree, doubling the celebration of the island's beauty, C) The quoted voice turns the poem into a comic monologue of self-exposure, D) The other voice has no bearing on how we read the island
    * **Correct:** A
    * **Feedback:** ✓ Correct. Placing the wife's "But look at all this beauty" against the speaker's guarded, detached account opens an ironic gap, so the easy praise is quietly undercut by what the speaker actually sees and feels.
    * **Why B:** The voices clash rather than agree — the speaker resists the wife's praise.
    * **Why C:** The tone is reflective, not the comic self-exposure of a monologue like Postcard.
    * **Why D:** The contrast between the two voices is exactly what creates the poem's ironic distance.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Stewart Island"?
    * **Options:** A) The hotel manager's wife's enthusiasm for the island's beauty is not shared by the speaker, who ends by deciding "to leave the country", B) An undercurrent of discomfort and isolation runs beneath the island's scenic beauty, C) The seagull's attack on the speaker's son sharpens the sense of unease beneath the surface calm, D) The poem concludes warmly that the island is welcoming and idyllic
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Adcock's speaker resists the wife's easy praise, closes on her decision "to leave the country" after a seagull attacks her son, and lets discomfort and isolation stir beneath the island's beauty.
    * **Why D:** The poem's guarded tone and its closing wish "to leave the country" undercut any sense of an idyllic, welcoming place.
