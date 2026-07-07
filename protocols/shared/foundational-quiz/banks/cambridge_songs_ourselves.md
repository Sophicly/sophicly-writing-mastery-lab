# Foundational Quiz Bank — Cambridge IGCSE Songs of Ourselves Volume 1 (Poems)

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
- **@set:1** — Song: Love Armed (Aphra Behn) · A Married State (Katherine Philips) · Sonnet 18 (Shakespeare) · Follower (Seamus Heaney) · Carpet-weavers, Morocco (Carol Rumens)
- **@set:2** — The Cockroach (Kevin Halligan) · Hunting Snake (Judith Wright) · Before the Sun (Charles Mungoshi) · Lament (Gillian Clarke) · from An Essay on Man (Alexander Pope)
- **@set:3** — A Different History (Sujata Bhatt) · Where I Come From (Elizabeth Brewster) · Report to Wordsworth (Boey Kim Cheng) · The Chimney-Sweeper (William Blake) · Storyteller (Liz Lochhead)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Songs of Ourselves Volume 1 Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem presents Love as a triumphant tyrant enthroned amid "Bleeding Hearts", who takes his fire from one lover's eyes and his deadly darts from the other?
   * **Options:** A) A Married State, B) Song: Love Armed, C) Sonnet 18, D) Follower
   * **Correct:** B
   * **Feedback:** ✓ Correct. Behn's "Song: Love Armed" opens with Love "in Fantastic Triumph" seated among bleeding hearts, arming himself from both lovers to leave one alone wounded.
   * **Why A:** A Married State weighs marriage against single life, without a personified Love-tyrant.
   * **Why C:** Sonnet 18 compares the beloved to a summer's day, not a warring god of Love.
   * **Why D:** Follower recalls a father ploughing a field, with no mythological figure of Love.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Song: Love Armed" shaped?
   * **Options:** A) A single unbroken sonnet, B) Two eight-line stanzas of brisk, song-like tetrameter, C) Four ballad quatrains, D) Free verse with no set metre
   * **Correct:** B
   * **Feedback:** ✓ Correct. Behn's lyric falls into two symmetrical eight-line stanzas of tetrameter, its quick, musical metre suiting its origin as a song within a play.
   * **Why A:** The poem's sixteen lines split into two even stanzas, not one continuous fourteen-line sonnet.
   * **Why C:** Its two stanzas are not four separate quatrains.
   * **Why D:** The tetrameter is regular and driving, not loose free verse.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the ending of "Song: Love Armed" reveal about the two lovers?
   * **Options:** A) Both lovers suffer equally, B) The pain of love falls entirely on the speaker, while the beloved remains untouched and "the Victor", C) Love brings only joy to both, D) The beloved dies of grief
   * **Correct:** B
   * **Feedback:** ✓ Correct. The final lines confess that only the speaker's "poor Heart alone is harmed", while the beloved stays "the Victor... and free" — love's suffering is one-sided.
   * **Why A:** The poem insists the harm is unequal, not shared.
   * **Why C:** The poem's dominant note is of wounding and tyranny, not simple joy.
   * **Why D:** No death is described; the beloved instead escapes unscathed.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Philips's poem, married life is said to afford but little [BLANK], for even the best husbands are hard to please.
   * **Answer:** ease
   * **Feedback:** ✓ Correct. "A married state affords but little ease" opens the poem's case against marriage, before husbands are called "hard to please".
   * **WhyWrong:** The missing word is "ease" — Philips opens by denying that marriage brings the contentment it promises.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does Philips structure her argument in "A Married State"?
   * **Options:** A) As a random list of complaints with no order, B) As a persuasive, couplet-driven argument, weighing married misery against single content before a mock-advising conclusion, C) As a dialogue between two named speakers, D) As a series of unconnected riddles
   * **Correct:** B
   * **Feedback:** ✓ Correct. The rhyming couplets build a deliberate, persuasive case — married hardship, then virgin content — before the speaker turns to "advise" the addressee directly.
   * **Why A:** The couplets follow a clear, escalating structure, not a random list.
   * **Why C:** One speaker addresses "Madam" throughout; there is no second named voice.
   * **Why D:** The argument is plainly stated, not riddling.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "A Married State", Philips presents remaining unmarried as offering more freedom and contentment than marriage.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The poem calls the "virgin state... crowned with much content", free of a husband's temper, childbirth's pain and children's cries — a direct challenge to the assumption that marriage guarantees happiness.
   * **WhyWrong:** This is the poem's central claim — singleness is praised as freer and more content than the married state it mocks.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens by asking whether the beloved should be compared to a summer's day, before deciding the beloved is "more lovely and more temperate"?
   * **Options:** A) Sonnet 18, B) A Married State, C) Song: Love Armed, D) Carpet-weavers, Morocco
   * **Correct:** A
   * **Feedback:** ✓ Correct. Shakespeare's "Sonnet 18" opens with this famous comparison, then finds summer wanting beside the beloved's steadier beauty.
   * **Why B:** A Married State weighs marriage against singleness, not beauty against the seasons.
   * **Why C:** Song: Love Armed personifies Love as a tyrant, not a summer's day.
   * **Why D:** Carpet-weavers, Morocco pictures children at a loom, with no comparison to summer.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does "Sonnet 18" take, and where does its turn fall?
   * **Options:** A) A Shakespearean sonnet — three quatrains and a couplet, with the turn at line 9, B) A Petrarchan sonnet with the turn at line 5, C) A villanelle with a repeating refrain, D) Free verse with no fixed rhyme
   * **Correct:** A
   * **Feedback:** ✓ Correct. The sonnet's three quatrains catalogue summer's flaws before the volta at line 9 ("But thy eternal summer shall not fade") pivots to the beloved's permanence, sealed by the closing couplet.
   * **Why B:** The turn falls at line 9, the Shakespearean position, not at line 5.
   * **Why C:** There is no repeating refrain; the poem is a single argued sonnet.
   * **Why D:** The sonnet keeps a strict rhyme scheme, not free verse.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What claim does the closing couplet of "Sonnet 18" make?
   * **Options:** A) That summer will return every year regardless, B) That the poem itself will outlast time, preserving the beloved's beauty for as long as it is read, C) That the beloved will physically never age, D) That nature is crueller than any human
   * **Correct:** B
   * **Feedback:** ✓ Correct. "So long as men can breathe, or eyes can see, / So long lives this" claims the poem's own survival keeps the beloved's beauty alive beyond the reach of time.
   * **Why A:** The couplet's claim is about the poem's endurance, not summer's yearly return.
   * **Why C:** Immortality is granted through art, not literal, unaging flesh.
   * **Why D:** The couplet celebrates art's power over time, not nature's cruelty.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem recalls a father guiding a horse-plough, his shoulders "globed like a full sail strung" between the shafts?
    * **Options:** A) Follower, B) Where I Come From, C) Report to Wordsworth, D) Before the Sun
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney's "Follower" opens with this image of his father's strength at the plough, the child watching in admiration from behind.
    * **Why B:** Where I Come From contrasts rural and city origins, without a ploughing father.
    * **Why C:** Report to Wordsworth addresses the Romantic poet directly about environmental loss, not a childhood memory of ploughing.
    * **Why D:** Before the Sun follows a boy preparing a fire and roasting maize, not following a plough.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "Follower" structured, and what happens to that structure at the end?
    * **Options:** A) Six regular quatrains that hold steady throughout, with no change, B) Six quatrains of steady, controlled memory that pivot in the final stanza to reverse the roles of father and son, C) A single long stanza with no breaks, D) A sonnet with a turn at line nine
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's even quatrains mirror ordered, remembered admiration until the last stanza flips the roles: now it is the aged father who stumbles, and the son who cannot shake him off.
    * **Why A:** The final stanza's reversal is the poem's key structural move, not a static repetition.
    * **Why C:** The poem is built from six separate quatrains, not one continuous block.
    * **Why D:** Follower's shift comes in its final stanza, not at a mid-poem sonnet turn.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the ending of "Follower" reveal about the father-son relationship?
    * **Options:** A) The father remains dominant and admired throughout, unchanged, B) Time has reversed the roles: the once-mighty father now stumbles and depends on the son who once followed him, C) The son has abandoned his father entirely, D) The father becomes a stronger figure with age
    * **Correct:** B
    * **Feedback:** ✓ Correct. The closing role-reversal presents the once-idolised, powerful father now the one who "keeps stumbling", dependent on the son who used to trail behind him — a meditation on time, ageing and inherited roles.
    * **Why A:** The final stanza deliberately overturns this earlier admiration.
    * **Why C:** The son has not left; instead, he cannot escape his now-dependent father.
    * **Why D:** Age has weakened the father, not strengthened him.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem pictures children weaving a prayer rug, watching their "flickering knots like television" before it is carried off to a mosque?
    * **Options:** A) Carpet-weavers, Morocco, B) A Different History, C) Storyteller, D) The Chimney-Sweeper
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rumens's "Carpet-weavers, Morocco" watches child weavers at "the loom of another world", their work destined for "the servants of the mosque".
    * **Why B:** A Different History concerns language, colonialism and sacred books in India, not carpet-weaving children.
    * **Why C:** Storyteller depicts a village storyteller entrancing listeners with tales, not children at a loom.
    * **Why D:** The Chimney-Sweeper follows child chimney sweeps in England, not Moroccan carpet-weavers.

14. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** "Carpet-weavers, Morocco" closes by describing how the colours of "all-that-will-be" fly and [BLANK] into the frame of "all-that-was".
    * **Answer:** freeze
    * **Feedback:** ✓ Correct. The closing image has future colour "freeze" into a fixed, finished pattern — the carpet holding both the children's present labour and a frozen future within it.
    * **WhyWrong:** The missing word is "freeze" — the poem's final paradox fixes the future's colours permanently into the carpet's past-tense frame.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Carpet-weavers, Morocco"?
    * **Options:** A) The comparison of knot-watching to television suggests the work is hypnotic and absorbing, in a way modern readers will recognise, B) The carpet's destination in a mosque links the children's labour to something held sacred and lasting, C) The poem openly condemns the children's parents for cruelty, D) The closing image folds past, present and future together, as the carpet fixes "all-that-will-be" into "all-that-was"
    * **Correct:** A, B, D
    * **Scoring:** 2 marks for A,B,D. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Rumens holds child labour and reverence in uneasy balance: the television simile makes the weaving hypnotic and familiar, the mosque destination lends it sanctity, and the closing lines collapse future, present and past into a single woven frame.
    * **Why C:** The poem does not accuse the parents; its tone stays contemplative rather than condemning.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem ends with the speaker watching an insect's restless pacing and admitting, "I thought I recognised myself"?
    * **Options:** A) The Cockroach, B) Hunting Snake, C) Before the Sun, D) An Essay on Man
    * **Correct:** A
    * **Feedback:** ✓ Correct. Halligan's "The Cockroach" tracks the insect's aimless pacing and circling before the final line collapses the distance between man and insect.
    * **Why B:** Hunting Snake ends with relief as the snake passes, not with the speaker recognising himself in the creature.
    * **Why C:** Before the Sun follows a boy's purposeful morning routine, not a wandering insect.
    * **Why D:** An Essay on Man argues abstractly about humanity's place between beast and God, without a literal insect.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What form does "The Cockroach" take, and how does Halligan use its turn?
    * **Options:** A) A ballad with a repeated refrain, B) A Petrarchan sonnet, its volta arriving in the final line to spring an unsettling self-recognition, C) Free verse with no set line count, D) Rhyming couplets throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's fourteen lines build steadily to a late volta, so the closing admission of self-recognition lands as a sudden, unsettling twist.
    * **Why A:** There is no sung refrain; the form is a sonnet, not a ballad.
    * **Why C:** The poem keeps to the fixed fourteen-line sonnet form, not open free verse.
    * **Why D:** The turn is reserved for the final line, not spread across paired couplets.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the speaker ultimately realise while watching the cockroach?
    * **Options:** A) That insects are entirely alien to human experience, B) That the insect's aimless, restless circling mirrors something uncomfortably human in himself, C) That the cockroach should be destroyed, D) That nature is always orderly and purposeful
    * **Correct:** B
    * **Feedback:** ✓ Correct. The closing recognition unsettles the reader by finding the insect's directionless pacing disturbingly familiar — a mirror for human restlessness and lack of purpose.
    * **Why A:** The poem's whole force depends on collapsing that distance, not confirming it.
    * **Why C:** The speaker's response is reflective, not hostile or violent.
    * **Why D:** The insect's own behaviour is aimless, undercutting any claim to order.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes two walkers who "froze half-through a pace" on encountering a snake gliding through the grass?
    * **Options:** A) Hunting Snake, B) Lament, C) A Different History, D) Storyteller
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wright's "Hunting Snake" catches the shock of the encounter in that frozen half-pace, before the snake moves on, "cold, dark and splendid".
    * **Why B:** Lament mourns the casualties of the Gulf War, not a snake encounter.
    * **Why C:** A Different History concerns language and colonial legacy in India, not a walk disturbed by a snake.
    * **Why D:** Storyteller depicts a village storyteller entrancing an audience, not walkers meeting a snake.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the rhyme scheme of "Hunting Snake" change, and what does this suggest?
    * **Options:** A) It stays in strict ABAB throughout, showing total calm, B) The regular ABAB of the first three stanzas breaks in the final stanza, mirroring the walkers' disturbed, altered state after the encounter, C) It has no rhyme at any point, D) It becomes a strict rhyming couplet form at the end
    * **Correct:** B
    * **Feedback:** ✓ Correct. The steady ABAB pattern gives way to a different scheme in the last stanza, formally enacting the disruption the snake's passing leaves behind.
    * **Why A:** The rhyme scheme does not stay constant; it shifts precisely where the poem's mood shifts.
    * **Why C:** The poem keeps a clear rhyme scheme throughout, though it changes shape at the end.
    * **Why D:** The final stanza does not settle into rhyming couplets.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Hunting Snake", the walkers' silence after the snake has passed suggests the experience is too powerful and strange to be reduced to words.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The observers say nothing once the snake is gone, as though speech would diminish an encounter with a creature of such danger and grace.
    * **WhyWrong:** This is the poem's implication — the walkers' silence honours an experience that ordinary words cannot capture.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem follows a boy chopping wood and roasting maize cobs over a fire before dawn breaks?
    * **Options:** A) Before the Sun, B) Follower, C) Report to Wordsworth, D) The Chimney-Sweeper
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mungoshi's "Before the Sun" follows the boy's early-morning ritual of chopping, firing and roasting, completed before the sun itself rises.
    * **Why B:** Follower recalls a father at a horse-plough, not a boy roasting maize.
    * **Why C:** Report to Wordsworth addresses the Romantic poet about ecological ruin, not a boy's morning routine.
    * **Why D:** The Chimney-Sweeper follows child chimney sweeps in England, not a Zimbabwean boy at a fire.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Before the Sun" suit its subject?
    * **Options:** A) A strict sonnet argues an abstract case, B) Free verse with shifting line lengths mirrors the boy's immersive, sensory experience of his task, C) Rhyming couplets celebrate a battle, D) A fixed ballad refrain tells a heroic story
    * **Correct:** B
    * **Feedback:** ✓ Correct. The loose, varying lines let the poem move with the boy's actions and senses rather than forcing his morning into a fixed pattern.
    * **Why A:** The poem stays close to lived, sensory experience rather than abstract argument.
    * **Why C:** There is no battle and no rhyming couplet structure here.
    * **Why D:** The poem has no repeated sung refrain; its form is open, not balladic.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the boy's morning routine in "Before the Sun" come to represent?
    * **Options:** A) The pointlessness of rural labour, B) The value of preparing early and working diligently, so that life's demands are met ready, C) A punishment imposed on the boy, D) A rejection of nature
    * **Correct:** B
    * **Feedback:** ✓ Correct. The boy's disciplined preparation before sunrise becomes an allegory for readiness — those who work and prepare early meet what the day brings already equipped.
    * **Why A:** The poem treats the boy's labour as purposeful and rewarding, not futile.
    * **Why C:** Nothing suggests the routine is forced as punishment; it reads as diligent self-reliance.
    * **Why D:** The boy works closely and harmoniously with nature, not against it.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem mourns the casualties of the Gulf War — soldiers, seabirds and turtles alike — through a litany of oil-blackened images?
    * **Options:** A) Lament, B) An Essay on Man, C) Where I Come From, D) A Married State
    * **Correct:** A
    * **Feedback:** ✓ Correct. Clarke's "Lament" grieves for every casualty of the 1991 Gulf War, holding human and animal suffering in the same breath of oil-soaked imagery.
    * **Why B:** An Essay on Man is a philosophical argument about human nature, not an elegy for a specific war.
    * **Why C:** Where I Come From contrasts rural and city origins, not wartime loss.
    * **Why D:** A Married State debates marriage against single life, not the cost of war.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Lament" repeats the word "[BLANK]" at the start of many of its lines, building a litany that mourns each casualty in turn.
    * **Answer:** for
    * **Feedback:** ✓ Correct. The anaphoric "for" begins the majority of the poem's lines, turning it into a chant-like litany of loss for soldier, seabird and shoreline alike.
    * **WhyWrong:** The repeated word is "for" — its litany-like repetition mourns every kind of casualty in the same breath.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is distinctive about how "Lament" distributes its grief?
    * **Options:** A) It mourns only the human soldiers who died, B) It refuses to rank suffering, mourning soldiers, civilians, seabirds and the burning land as equally worthy of grief, C) It blames only one side of the conflict, D) It celebrates the war's outcome
    * **Correct:** B
    * **Feedback:** ✓ Correct. Clarke's litany places human and non-human loss side by side, refusing any hierarchy of suffering — the oil-choked cormorant grieved as fully as the soldier.
    * **Why A:** The poem widens its grief well beyond human casualties, to animals and landscape.
    * **Why C:** The poem's focus is on universal loss, not assigning blame to a side.
    * **Why D:** There is no celebration here; the tone is unbroken mourning.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem opens with the command "Know then thyself, presume not God to scan; / The proper study of Mankind is Man"?
    * **Options:** A) from An Essay on Man, B) Sonnet 18, C) Song: Love Armed, D) A Married State
    * **Correct:** A
    * **Feedback:** ✓ Correct. Pope's extract from "An Essay on Man" opens by redirecting philosophical enquiry from God to human nature itself.
    * **Why B:** Sonnet 18 addresses a beloved's beauty, not a philosophical argument about humanity's place.
    * **Why C:** Song: Love Armed personifies Love as a tyrant god, not a treatise on human nature.
    * **Why D:** A Married State debates marriage, not the philosophical study of mankind.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What verse form does Pope use in "An Essay on Man", and to what effect?
    * **Options:** A) Free verse, mirroring humanity's disorder, B) Heroic couplets, whose balanced, rhyming pairs enact the very contradictions — beast and angel, reason and passion — that the poem describes, C) A ballad refrain, D) An unrhymed sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The tightly rhymed heroic couplets balance opposing ideas within each pair of lines, formally mirroring the tug-of-war Pope diagnoses within human nature.
    * **Why A:** Pope's verse is tightly rhymed and metrical, the opposite of free verse.
    * **Why C:** There is no sung refrain; the extract argues in couplets, not a ballad.
    * **Why D:** The couplets rhyme throughout; the extract is not an unrhymed sonnet.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the argument of "An Essay on Man"?
    * **Options:** A) Humanity occupies a confused "middle state" between beast and God, B) Pope presents humans as both "great lord of all things" and "a prey to all", capturing their contradictory nature, C) Pope concludes that humans should aspire only to animal instinct, D) The poem uses balanced antithesis to capture humanity's unresolved, paradoxical condition
    * **Correct:** A, B, D
    * **Scoring:** 2 marks for A,B,D. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Pope places humanity on the "isthmus of a middle state", at once master and victim, reasoning and erring — a paradox his balanced couplets hold in constant tension.
    * **Why C:** Pope does not urge a retreat into animal instinct; he diagnoses the tension between reason and instinct without resolving it in favour of either.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens by imagining that the Greek god Pan has "emigrated" to India, where books are treated as sacred and gods live in trees?
    * **Options:** A) A Different History, B) Where I Come From, C) Storyteller, D) The Chimney-Sweeper
    * **Correct:** A
    * **Feedback:** ✓ Correct. Bhatt's "A Different History" begins with Pan's migration to India, sketching a world where nature, religion and books are bound together in reverence.
    * **Why B:** Where I Come From concerns rural and city origins in a Western setting, not gods migrating to India.
    * **Why C:** Storyteller depicts an oral tale-teller in an unnamed village, not sacred books or Pan.
    * **Why D:** The Chimney-Sweeper follows English child chimney sweeps, unconnected to Indian religious life.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "A Different History" structured?
    * **Options:** A) As a single, continuous argument with no divisions, B) In two distinct parts — first a vision of Indian reverence for nature and books, then a reflection on the legacy of a colonising language, C) As a strict rhyming sonnet, D) As a dialogue between two named characters
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's two clearly separated parts move from a syncretic, sacred vision of India to a harder meditation on the inherited weight of English as a colonial language.
    * **Why A:** The poem's two-part division is a deliberate structural choice, not a single unbroken argument.
    * **Why C:** The poem is written in free verse, not a rhymed sonnet.
    * **Why D:** One reflective speaker's voice runs throughout; there is no second named character.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What tension does the second part of "A Different History" explore?
    * **Options:** A) A simple hatred of the English language, B) The uneasy position of loving and creating in a language that was also an instrument of colonial violence, C) A wish to abolish all languages, D) Nostalgia for British rule
    * **Correct:** B
    * **Feedback:** ✓ Correct. Bhatt holds both truths at once — the poet's own art depends on English, even as English carries the history of conquest and loss that made her ancestors' first languages vulnerable.
    * **Why A:** The poem's stance is more conflicted than simple hatred; it holds affection and unease together.
    * **Why C:** The poem reflects on one particular colonial language, not language in general.
    * **Why D:** The poem critiques the violence of colonial language imposition rather than expressing nostalgia for it.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that people are "made of places", contrasting a rural, fire-scarred childhood landscape with the smells of the city?
    * **Options:** A) Where I Come From, B) A Different History, C) Report to Wordsworth, D) Lament
    * **Correct:** A
    * **Feedback:** ✓ Correct. Brewster's "Where I Come From" contrasts a rural upbringing among blueberries and ruined schoolhouses with the sensory life of the city, arguing that landscape shapes identity.
    * **Why B:** A Different History concerns language and colonial history in India, not rural-versus-city origins.
    * **Why C:** Report to Wordsworth addresses environmental destruction directly to a poet, not personal origins.
    * **Why D:** Lament mourns Gulf War casualties, not a meditation on childhood place.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "Where I Come From" uses primarily visual and tactile imagery for the rural landscape, but shifts to smell when describing the city.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem draws on sight and touch for its remembered countryside, then narrows to olfactory imagery for the city — a shift in sense that marks the difference between the two worlds.
    * **WhyWrong:** This is accurate — the poem changes its dominant sense from touch and sight in the country to smell in the city.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the closing image of a door blowing open suggest in "Where I Come From"?
    * **Options:** A) That the past is permanently locked away and inaccessible, B) That childhood place and memory can suddenly resurface and reclaim the present self, C) That the speaker has forgotten her origins entirely, D) That doors are only ever physical, literal objects in the poem
    * **Correct:** B
    * **Feedback:** ✓ Correct. The door "blows open" to suggest that the formative landscape of childhood never fully disappears — it can return unbidden and reassert its hold on identity.
    * **Why A:** The image presents the past breaking back in, not staying sealed away.
    * **Why C:** The sudden return of memory contradicts any idea of total forgetting.
    * **Why D:** The door works figuratively, as a symbol of memory reopening, not merely a literal object.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem directly addresses William Wordsworth, reporting that Proteus, Triton and Neptune now lie defeated and choked by human waste?
    * **Options:** A) Report to Wordsworth, B) Follower, C) The Cockroach, D) Sonnet 18
    * **Correct:** A
    * **Feedback:** ✓ Correct. Boey Kim Cheng's "Report to Wordsworth" apostrophises the Romantic poet, updating him on nature's ruin through the drowned voices of ancient sea-gods.
    * **Why B:** Follower addresses no historical poet; it recalls a father at the plough.
    * **Why C:** The Cockroach concerns a single insect indoors, not mythic sea-gods or Wordsworth.
    * **Why D:** Sonnet 18 addresses a beloved, not a fellow poet about ecological collapse.

38. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Report to Wordsworth" opens with a direct [BLANK] to the Romantic poet, creating urgency through his imagined absence.
    * **Answer:** address
    * **Feedback:** ✓ Correct. The poem's opening apostrophe — a direct address to Wordsworth — immediately conjures his absence and the need for his guidance now.
    * **WhyWrong:** The missing word is "address" — the poem's direct address to Wordsworth structures its urgent report on nature's decline.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the overall message of "Report to Wordsworth"?
    * **Options:** A) That nature has fully recovered since Wordsworth's time, B) That human greed and pollution have devastated the natural world Wordsworth once revered, silencing even the old gods and poetry itself, C) That Wordsworth's ideas were always mistaken, D) That only animals are affected by pollution
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem reports catastrophic decline — polluted seas, disappearing birds, a tearing sky — suggesting that the reverence for nature Wordsworth championed has been betrayed by human destruction.
    * **Why A:** The poem's report is one of decline, not recovery.
    * **Why C:** The poem mourns the loss of Wordsworth's vision rather than dismissing it as wrong.
    * **Why D:** The devastation described extends to poetry, piety and the divine, not only animal life.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a chimney sweep who comforts Tom Dacre after his head is shaved, and later dreams of an Angel who frees sweeps from "coffins of black"?
    * **Options:** A) The Chimney-Sweeper, B) Storyteller, C) A Different History, D) Before the Sun
    * **Correct:** A
    * **Feedback:** ✓ Correct. Blake's "The Chimney-Sweeper" (from Songs of Innocence) follows the young speaker comforting Tom Dacre before his dream of angelic release from "coffins of black".
    * **Why B:** Storyteller depicts a village storyteller weaving tales, unrelated to child chimney sweeps.
    * **Why C:** A Different History concerns language and colonial India, not English child labour.
    * **Why D:** Before the Sun follows a boy's fire-building morning in rural Zimbabwe, not a chimney sweep's dream.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does Blake's simple, songlike form in "The Chimney-Sweeper" work against its content?
    * **Options:** A) The gentle rhyme and childlike voice have no effect on the poem's meaning, B) The innocent, ballad-like rhyme and simple diction sit ironically against the poem's dark subject of child exploitation, sharpening the social criticism, C) The complex, difficult form matches the difficulty of the subject, D) The poem abandons rhyme entirely to sound more mournful
    * **Correct:** B
    * **Feedback:** ✓ Correct. The lilting, childlike rhymes and simple vocabulary of a nursery song sit uneasily beside the horror of child labour, deepening Blake's critique by wrapping it in false comfort.
    * **Why A:** The gentle form is central to the poem's irony, not incidental to it.
    * **Why C:** The form is deliberately simple and songlike, not formally complex.
    * **Why D:** The poem keeps its regular rhyme throughout; it does not become unrhymed.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** Why is the poem's closing line, "So if all do their duty, they need not fear harm", ironic?
    * **Options:** A) Because the sweeps genuinely came to no harm, B) Because their real "duty" is dangerous, exploitative labour, and the promised reward is a comforting illusion that keeps them compliant, C) Because the line refers to the Angel's own duty, not the children's, D) Because it has no religious meaning at all
    * **Correct:** B
    * **Feedback:** ✓ Correct. The closing moral rewards obedience with an empty promise of safety, when in truth "duty" means continuing to labour and suffer — Blake exposes how comforting doctrine sustains exploitation.
    * **Why A:** The children remain in real danger; the "safety" promised is illusory, not actual.
    * **Why C:** The line addresses the sweeps' own duty and its false reward, not the Angel's.
    * **Why D:** The line's religious framing (duty rewarded by God) is exactly what makes its irony sting.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem compares storytelling to "spinning, gathering thin air to the single strongest thread", describing tales that outlast the night in the sleeping heads of children?
    * **Options:** A) Storyteller, B) Carpet-weavers, Morocco, C) Lament, D) An Essay on Man
    * **Correct:** A
    * **Feedback:** ✓ Correct. Lochhead's "Storyteller" likens the craft of tale-telling to spinning thread from air, its stories surviving morning in the memories of listening children.
    * **Why B:** Carpet-weavers, Morocco concerns child weavers and a physical carpet, not spoken storytelling.
    * **Why C:** Lament is an elegy for war casualties, not a portrait of an oral storyteller.
    * **Why D:** An Essay on Man is a philosophical argument, without a storyteller figure or its spinning simile.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does Lochhead use free verse in "Storyteller"?
    * **Options:** A) To create a strict, formal argument, B) To move fluidly between the storyteller's spoken tales and the poem's own descriptive voice, mirroring the flexibility of oral storytelling itself, C) To imitate a fixed ballad refrain, D) To enforce a strict rhyme scheme throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. The open, unrhymed lines let the poem shift easily between narration and the storyteller's own voice, echoing the fluid, adaptive nature of oral tale-telling.
    * **Why A:** The poem's form is loose and descriptive, not a formal argument.
    * **Why C:** There is no repeated sung refrain to imitate a ballad.
    * **Why D:** The poem is not built on a fixed rhyme scheme.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Storyteller"?
    * **Options:** A) The poem values the storyteller's craft as work of real skill and importance, not idle chatter, B) Stories are shown to persist beyond the telling, living on in "the sleeping heads of the children", C) The poem argues storytelling is a trivial pastime with no lasting value, D) The poem gives central importance to a figure — often a woman — whose voice might otherwise go unrecorded
    * **Correct:** A, B, D
    * **Scoring:** 2 marks for A,B,D. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Lochhead treats the storyteller's craft as skilled work whose tales outlive the telling, deliberately restoring central importance to a voice — often a woman's — usually left out of history.
    * **Why C:** The poem's whole force argues the opposite — that storytelling carries deep, lasting value.
