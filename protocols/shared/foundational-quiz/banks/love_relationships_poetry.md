# Foundational Quiz Bank — AQA Love and Relationships Poetry (Poems)

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
- **@set:1** — Climbing My Grandfather · Follower · Walking Away · Before You Were Mine · Mother, Any Distance
- **@set:2** — Eden Rock · Neutral Tones · Winter Swans · When We Two Parted · Love's Philosophy
- **@set:3** — Sonnet 29 'I think of thee' · Singh Song! · Letters from Yorkshire · The Farmer's Bride · Porphyria's Lover

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Love and Relationships Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem treats a grandfather as a mountain, the speaker climbing him "free, without a rope or net" up to the summit of his head?
   * **Options:** A) Follower, B) Climbing My Grandfather, C) Eden Rock, D) Walking Away
   * **Correct:** B
   * **Feedback:** ✓ Correct. Waterhouse's "Climbing My Grandfather" turns the old man's body into a mountain the speaker scales — nails, brogue, cheek — reaching the "summit" of his head.
   * **Why A:** Follower watches a father plough, not a grandfather climbed like a mountain.
   * **Why C:** Eden Rock imagines dead parents picnicking beyond a stream.
   * **Why D:** Walking Away recalls a father watching his son leave, not a climb.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the free verse of "Climbing My Grandfather" serve its meaning?
   * **Options:** A) Its strict sonnet form argues a case, B) Its loose form sustains the extended metaphor of a slow, careful climb up a beloved elder, C) Its ballad refrain tells a heroic tale, D) It has no effect on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The unhurried free verse lets the single extended metaphor of the climb unfold steadily, mirroring the patient, tender act of coming to know his grandfather.
   * **Why A:** The poem flows freely; it is not a tightly argued sonnet.
   * **Why C:** It is an intimate portrait, not a heroic ballad.
   * **Why D:** The open form is central to the sustained climbing metaphor.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What feeling does "Climbing My Grandfather" ultimately convey?
   * **Options:** A) Fear and resentment of the grandfather, B) Deep admiration, intimacy and respect, as the speaker explores and comes to know him, C) Indifference towards family, D) Anger at growing old
   * **Correct:** B
   * **Feedback:** ✓ Correct. The effort of the climb becomes an act of love — reaching the "summit" and lying breathless conveys awe, closeness and respect for the grandfather.
   * **Why A:** The tone is tender admiration, not fear or resentment.
   * **Why C:** The whole poem is an act of intimate attention, not indifference.
   * **Why D:** It celebrates the elder rather than resenting age.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does a child follow his father ploughing, only for the roles to reverse so the father now "keeps stumbling / Behind me"?
   * **Options:** A) Follower, B) Mother, Any Distance, C) Winter Swans, D) Neutral Tones
   * **Correct:** A
   * **Feedback:** ✓ Correct. Heaney's "Follower" watches the expert father plough, then turns at the end to the father stumbling behind the grown speaker — a role reversal.
   * **Why B:** Mother, Any Distance concerns a son measuring a new home, not ploughing.
   * **Why C:** Winter Swans follows a couple reconciling by a lake.
   * **Why D:** Neutral Tones recalls a dead love by a winter pond.

5. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "Follower" is written in regular, rhymed quatrains, whose steady, controlled shape reflects the father's skill and the rhythm of ploughing.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Heaney's neat ABAB quatrains move with the measured, expert rhythm of the plough, embodying the father's mastery.
   * **WhyWrong:** This is true — the ordered rhymed quatrains mirror the father's skilled, rhythmic ploughing.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the effect of the final turn in "Follower", where the father now stumbles behind the speaker?
   * **Options:** A) It suggests the father was always incompetent, B) It reverses the roles of admiration and dependence, exposing time, ageing and the son's guilt or discomfort, C) It proves the son never loved his father, D) It celebrates a happy family outing
   * **Correct:** B
   * **Feedback:** ✓ Correct. The reversal — once the follower, now the followed — captures the passing of time, the father's decline and the son's uneasy mix of love and impatience.
   * **Why A:** The father is shown as an "expert"; the point is change, not incompetence.
   * **Why C:** The poem is rooted in admiration; love is not denied.
   * **Why D:** The tone is reflective and uneasy, not a cheerful outing.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem recalls, "eighteen years ago", a parent watching a son drift away "behind a scatter of boys" after a game?
   * **Options:** A) Before You Were Mine, B) Walking Away, C) Eden Rock, D) Letters from Yorkshire
   * **Correct:** B
   * **Feedback:** ✓ Correct. Day-Lewis's "Walking Away" remembers watching his son go off after a football game "like a satellite / Wrenched from its orbit".
   * **Why A:** Before You Were Mine imagines the mother's youth, not a son walking away.
   * **Why C:** Eden Rock pictures dead parents beyond a stream.
   * **Why D:** Letters from Yorkshire concerns letters across distance, not a parting after a game.

8. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** In "Walking Away", Day-Lewis compares his departing son to a [BLANK] "wrenched from its orbit", showing him pulled painfully out of the parent's hold.
   * **Answer:** satellite
   * **Feedback:** ✓ Correct. The simile of a "satellite / Wrenched from its orbit" captures the painful, natural pull of the child away from the parent.
   * **WhyWrong:** The word is "satellite" — the son is like a satellite wrenched from orbit, drifting inevitably away.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What idea about parental love does "Walking Away" reach in its final lines?
   * **Options:** A) That love means holding a child close forever, B) That "love is proved in the letting go" — selfhood begins with separation, C) That parents and children should never part, D) That the son was ungrateful
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poem resolves that "selfhood begins with a walking away, / And love is proved in the letting go" — real love allows painful independence.
   * **Why A:** The poem argues the opposite: love releases rather than clings.
   * **Why C:** It accepts parting as necessary to growth.
   * **Why D:** The ache is the parent's; the son is not blamed.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** In which poem does a daughter imagine her mother's glamorous, carefree youth — a "polka-dot dress", laughing on a pavement — before she was born?
    * **Options:** A) Before You Were Mine, B) Neutral Tones, C) The Farmer's Bride, D) Follower
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "Before You Were Mine" pictures the mother young and glamorous — "the ballroom with the thousand eyes" — in the years "before" the speaker existed.
    * **Why B:** Neutral Tones recalls a dead love by a pond, not a mother's youth.
    * **Why C:** The Farmer's Bride tells of a frightened runaway wife.
    * **Why D:** Follower watches a father ploughing.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How does the free verse of "Before You Were Mine" serve its meaning?
    * **Options:** A) Its strict form argues a legal case, B) Its loose, interior-monologue style lets the daughter freely imagine her mother's life before motherhood, C) Its ballad refrain tells a heroic tale, D) Its sonnet volta resolves a debate
    * **Correct:** B
    * **Feedback:** ✓ Correct. The free, wandering voice suits memory and imagination as the daughter pictures her mother young, carefree and "before" she was hers.
    * **Why A:** The poem flows like private thought, not a legal argument.
    * **Why C:** It is a personal reflection, not a heroic ballad.
    * **Why D:** It is free verse, without a sonnet's formal turn.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** In "Before You Were Mine", the daughter's imagining of her mother's free, glamorous past carries a faint sense of loss — that this vivid life existed before, and partly ended with, the child.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The love is tinged with wistfulness: the mother's "possessive" glamour belonged to a self that motherhood — the arrival of the speaker — began to close down.
    * **WhyWrong:** This is true — beneath the celebration runs a wistful sense that the mother's carefree self existed "before" the daughter claimed her.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem uses a tape measure across a new house — "you at the zero-end" — as a metaphor for a mother and son's stretching bond?
    * **Options:** A) Mother, Any Distance, B) Climbing My Grandfather, C) Winter Swans, D) Love's Philosophy
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Mother, Any Distance" measures a new home with his mother at "the zero-end" of the tape, the line "unreeling / years between us" as he grows independent.
    * **Why B:** Climbing My Grandfather uses a mountain-climb metaphor, not a tape measure.
    * **Why C:** Winter Swans watches a couple reconcile by a lake.
    * **Why D:** Love's Philosophy argues from nature that lovers should unite.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "Mother, Any Distance" uses an extended, stretched sonnet form, its shape pulled out like the tape measure in the poem.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The loosely stretched sonnet works like the "tape measure" — its form is pulled out as the bond between mother and son is tested.
    * **WhyWrong:** It does use a stretched sonnet — the form is extended and loosened, echoing the measuring tape and the stretching bond.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the ending of "Mother, Any Distance" — reaching "a hatch that opens on an endless sky / to fall or fly" — convey?
    * **Options:** A) That the son will never leave home, B) The risk and possibility of independence, as the son lets go of the mother's hold to make his own way, C) That the mother refuses to let go, D) That measuring a house is pointless
    * **Correct:** B
    * **Feedback:** ✓ Correct. "To fall or fly" captures the thrilling danger of independence — the son releasing the mother's steadying line to risk his own adult life.
    * **Why A:** The whole poem moves towards leaving, not staying.
    * **Why C:** It is the son who lets go of the line; the mother anchors him.
    * **Why D:** The measuring is a metaphor for the bond, not a literal chore.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem imagines dead parents picnicking on the far side of a stream, the mother pouring tea, telling the speaker "crossing is not as hard as you might think"?
    * **Options:** A) Eden Rock, B) Walking Away, C) When We Two Parted, D) Winter Swans
    * **Correct:** A
    * **Feedback:** ✓ Correct. Causley's "Eden Rock" pictures his dead parents waiting "somewhere beyond Eden Rock", reassuring him that "crossing is not as hard as you might think".
    * **Why B:** Walking Away recalls a living father watching a son leave.
    * **Why C:** When We Two Parted grieves a secret, broken love.
    * **Why D:** Winter Swans follows a couple reconciling by a lake.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the mostly gentle, regular form of "Eden Rock" support its subject?
    * **Options:** A) Its harsh, broken structure conveys rage, B) Its calm, ordered stanzas make the vision of the dead parents feel peaceful and reassuring, until the quiet final-line shift, C) It is a chaotic free verse, D) It is a galloping ballad of war
    * **Correct:** B
    * **Feedback:** ✓ Correct. The measured, tender stanzas keep the scene serene and comforting, so the closing "I had not thought that it would be like this" lands as a soft, moving turn.
    * **Why A:** The tone is calm and reassuring, not enraged.
    * **Why C:** The poem is controlled and ordered, not chaotic.
    * **Why D:** It is an intimate family vision, not a war ballad.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does "Eden Rock" ultimately explore?
    * **Options:** A) A quarrel between lovers, B) Death, memory and the comforting hope of reunion with lost parents, C) The horror of battle, D) A celebration of youth
    * **Correct:** B
    * **Feedback:** ✓ Correct. Causley turns the fear of death into comfort — imagining his parents waiting to welcome him makes "crossing" over into death feel gentle and hopeful.
    * **Why A:** The poem concerns parents and mortality, not a lovers' quarrel.
    * **Why C:** There is no battlefield; the setting is a tender family picnic.
    * **Why D:** It faces death, though with warmth, rather than celebrating youth.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls standing by a pond "that winter day", the sun "white, as though chidden of God", framing a bitter memory of dead love?
    * **Options:** A) Neutral Tones, B) Love's Philosophy, C) Letters from Yorkshire, D) Singh Song!
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "Neutral Tones" fixes a grey winter pond, the "white" sun and a "grin of bitterness" into an emblem of love turned cold.
    * **Why B:** Love's Philosophy is a warm, persuasive plea, not a bleak memory.
    * **Why C:** Letters from Yorkshire concerns connection across distance.
    * **Why D:** Singh Song! is a joyful, comic love poem.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What mood do the reflective, greyish quatrains of "Neutral Tones" create?
    * **Options:** A) Joyful celebration, B) Melancholic disillusionment with love, C) Comic mockery, D) Patriotic pride
    * **Correct:** B
    * **Feedback:** ✓ Correct. The measured, colourless quatrains suit Hardy's bleak reflection on a love that has faded into disillusionment.
    * **Why A:** The tone is sorrowful, not celebratory.
    * **Why C:** It is quietly sad, not comic.
    * **Why D:** The poem concerns lost love, not patriotism.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Neutral Tones", the bleak winter scene becomes a lasting emblem: the speaker says such greyness has shaped how he sees love and deception ever since.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Hardy makes the grey pond, white sun and bitter grin into a fixed image of love's betrayal — a scene that has coloured his view of love and "wrongs" ever after.
    * **WhyWrong:** This is true — the frozen, colourless scene becomes a permanent emblem of disillusionment that stays with the speaker.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a couple, silent after a quarrel, watch swans and slowly reach for each other's hands "like a pair of wings settling"?
    * **Options:** A) Winter Swans, B) Eden Rock, C) Follower, D) The Farmer's Bride
    * **Correct:** A
    * **Feedback:** ✓ Correct. Sheers's "Winter Swans" watches the mating swans "righting in rough weather" as a couple's hands quietly reunite, "like a pair of wings settling".
    * **Why B:** Eden Rock imagines dead parents beyond a stream.
    * **Why C:** Follower watches a father ploughing.
    * **Why D:** The Farmer's Bride tells of a frightened, fleeing wife.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Winter Swans" reflect its meaning?
    * **Options:** A) Long unbroken stanzas show endless argument, B) The poem moves from separated tercets and couplets towards a final joining, mirroring the couple's reconciliation, C) A strict sonnet argues a case, D) A galloping ballad drives to war
    * **Correct:** B
    * **Feedback:** ✓ Correct. The shift towards paired lines and the closing image of hands as "wings settling" lets the structure enact the couple coming back together.
    * **Why A:** The movement is towards union, not endless argument.
    * **Why C:** It is not a formal fourteen-line sonnet.
    * **Why D:** It is a tender reconciliation, not a war ballad.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How do the swans, who "mate for life", function in the poem?
    * **Options:** A) As a threat to the couple, B) As a natural model of constancy that helps the couple heal and silently reconcile, C) As a symbol of betrayal, D) As comic relief
    * **Correct:** B
    * **Feedback:** ✓ Correct. The swans' lifelong pairing and their "righting in rough weather" mirror and encourage the couple's own recovery of togetherness.
    * **Why A:** The swans model harmony, not threat.
    * **Why C:** They represent faithfulness, the opposite of betrayal.
    * **Why D:** Their role is symbolic and healing, not comic.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem remembers a secret past love ending "in silence and tears", and imagines greeting the former lover the same way after long years?
    * **Options:** A) When We Two Parted, B) Love's Philosophy, C) Singh Song!, D) Winter Swans
    * **Correct:** A
    * **Feedback:** ✓ Correct. Byron's "When We Two Parted" grieves a secret, broken love, framed by the repeated "silence and tears" of parting and future meeting.
    * **Why B:** Love's Philosophy is a warm plea for union, not a grief.
    * **Why C:** Singh Song! is a joyful, comic celebration of love.
    * **Why D:** Winter Swans ends in reconciliation, not lasting sorrow.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "When We Two Parted" uses ballad-like [BLANK] — repeated words and the returning phrase "silence and tears" — to deepen its sorrow and sense of loss.
    * **Answer:** repetition
    * **Feedback:** ✓ Correct. The refrain-like repetition gives the lyric a mournful, echoing quality that suits Byron's grief over a secret, broken love.
    * **WhyWrong:** The word is "repetition" — the ballad-like repeated words and the returning "silence and tears" intensify the poem's sorrow.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** Why must the speaker of "When We Two Parted" grieve "in silence"?
    * **Options:** A) Because the love was secret, so his sorrow and the lover's betrayal cannot be spoken openly, B) Because he no longer cares, C) Because the lover has died, D) Because he is proud of the relationship
    * **Correct:** A
    * **Feedback:** ✓ Correct. The affair was hidden, so the pain of the lover's later dishonour must be borne privately — the silence deepens the sense of secret, festering grief.
    * **Why B:** The intensity of the grief reveals he cares deeply.
    * **Why C:** The lover lives on and is heard of; the loss is of trust, not life.
    * **Why D:** He grieves the betrayal; there is shame, not pride.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues from nature — "the fountains mingle with the river" — that since everything in the world unites, the beloved should kiss the speaker?
    * **Options:** A) Love's Philosophy, B) Neutral Tones, C) Letters from Yorkshire, D) Porphyria's Lover
    * **Correct:** A
    * **Feedback:** ✓ Correct. Shelley's "Love's Philosophy" builds a persuasive case from nature's minglings — "nothing in the world is single" — to press for the beloved's kiss.
    * **Why B:** Neutral Tones is a bleak memory of dead love, not a plea.
    * **Why C:** Letters from Yorkshire concerns connection across distance.
    * **Why D:** Porphyria's Lover is a disturbing monologue of possessive murder.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Love's Philosophy" support its persuasive purpose?
    * **Options:** A) Its broken, chaotic lines undercut the argument, B) Its regular, rhythmic lyric stanzas and rhetorical questions build a smooth, rhetorical case, ending on a direct appeal, C) It is an unrhymed epic, D) It is a dramatic monologue exposing madness
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat, musical stanzas and mounting examples give the argument a persuasive, almost logical momentum, culminating in "What is all this sweet work worth / If thou kiss not me?".
    * **Why A:** The form is controlled and rhetorical, not chaotic.
    * **Why C:** It is a short persuasive lyric, not an epic.
    * **Why D:** It is a charming plea, not a monologue of madness.

30. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "Love's Philosophy" uses the harmony of nature as a persuasive device, implying it would be unnatural for the beloved to withhold love.
    * **Answer:** True
    * **Feedback:** ✓ Correct. By stacking up nature's unions, Shelley frames the beloved's refusal as going against the very law of the world — a flattering, pressing argument.
    * **WhyWrong:** This is true — the poem weaponises nature's minglings to argue that not returning love would be unnatural.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem do the speaker's thoughts "twine and bud / About thee, as wild vines", until she longs for the lover's real presence over mere thought?
    * **Options:** A) Sonnet 29 'I think of thee', B) Letters from Yorkshire, C) Follower, D) Eden Rock
    * **Correct:** A
    * **Feedback:** ✓ Correct. Barrett Browning's "Sonnet 29" imagines thoughts wrapping the beloved like "wild vines", then bursts them aside — "I do not think of thee—I am too near thee".
    * **Why B:** Letters from Yorkshire concerns letters across physical distance.
    * **Why C:** Follower watches a father ploughing.
    * **Why D:** Eden Rock imagines dead parents beyond a stream.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Sonnet 29" uses which form, and how?
    * **Options:** A) Free verse with dialect, B) A Petrarchan sonnet, subverted by an early volta that lets passion strain against the form, C) A galloping ballad, D) Rhyming couplets of a monologue
    * **Correct:** B
    * **Feedback:** ✓ Correct. It is a Petrarchan sonnet, but the volta comes early, so the speaker's desire for presence over thought breaks impatiently through the traditional shape.
    * **Why A:** It keeps sonnet length and rhyme; it is not dialect free verse.
    * **Why C:** It is an intimate sonnet, not a narrative ballad.
    * **Why D:** The couplet-monologue shape belongs to Porphyria's Lover.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the extended "wild vines" image, then its bursting, convey in "Sonnet 29"?
    * **Options:** A) That the speaker prefers thinking about her lover to seeing him, B) That thought is only a poor substitute — she craves the lover's actual, physical presence, which overwhelms mere imagining, C) That she has stopped loving him, D) That nature is more important than love
    * **Correct:** B
    * **Feedback:** ✓ Correct. The vines of thought threaten to hide the "tree" of the real man; she wants him present — "I am too near thee" — passion overflowing thought.
    * **Why A:** She rejects thought as a substitute; she wants the real presence.
    * **Why C:** The poem is a surge of desire, not a falling-out of love.
    * **Why D:** Nature is only the vehicle; the tenor is intense love.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, spoken in Punjabi-inflected dialect, has a newly-married shopkeeper neglect his father's shop to be with his bride, ending "is priceless baby"?
    * **Options:** A) Singh Song!, B) The Farmer's Bride, C) Love's Philosophy, D) When We Two Parted
    * **Correct:** A
    * **Feedback:** ✓ Correct. Nagra's "Singh Song!" has the smitten shopkeeper abandon his duties for his bride, celebrating their love with warmth, humour and cultural pride.
    * **Why B:** The Farmer's Bride tells of a frightened, fleeing wife, not a joyful marriage.
    * **Why C:** Love's Philosophy is a persuasive plea from nature.
    * **Why D:** When We Two Parted grieves a secret, broken love.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** In "Singh Song!", how do the dialect and free verse work together?
    * **Options:** A) They show the speaker cannot write English, B) They celebrate cultural identity and playful, joyful love, C) They make the poem a solemn elegy, D) They have no effect on meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The lively dialect and loose form give the poem its warmth and humour, rooting the love story in the speaker's cultural identity.
    * **Why A:** The dialect is a proud, deliberate voice, not a failing.
    * **Why C:** The poem is playful and joyful, not a solemn elegy.
    * **Why D:** The form and voice are central to its celebratory meaning.

36. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "Singh Song!" presents modern love as joyful and all-consuming, set within — not against — the speaker's cultural and family world.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The shopkeeper's love is exuberant and distracting, yet it lives inside his father's shop and his cultural identity, celebrating love and heritage together.
    * **WhyWrong:** This is true — the poem's joyful, consuming love is rooted within the speaker's family shop and cultural identity, not opposed to it.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem contrasts one lover digging and planting in Yorkshire with the distant other, their "souls tap out messages across the icy miles"?
    * **Options:** A) Letters from Yorkshire, B) Winter Swans, C) Neutral Tones, D) Climbing My Grandfather
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dooley's "Letters from Yorkshire" sets the earthy, outdoor life of one against the distant other, connected as "our souls tap out messages across the icy miles".
    * **Why B:** Winter Swans watches a couple reconcile by a lake, not across distance.
    * **Why C:** Neutral Tones recalls a dead love by a winter pond.
    * **Why D:** Climbing My Grandfather scales an elder like a mountain.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the form of "Letters from Yorkshire" reflect its subject?
    * **Options:** A) Its rigid sonnet argues a case, B) Its loose free-verse tercets and enjambment let thought flow easily between the two distant lives, like the letters themselves, C) Its galloping ballad drives to war, D) It repeats a fixed refrain each stanza
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unforced tercets and run-on lines carry the conversational, connecting movement of correspondence, bridging the gap between the two lives.
    * **Why A:** The poem is loose free verse, not a formal sonnet.
    * **Why C:** It is a quiet meditation on connection, not a war ballad.
    * **Why D:** There is no fixed repeating refrain.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Letters from Yorkshire" suggest about love and connection?
    * **Options:** A) That distance and different lives make love impossible, B) That genuine connection can survive distance and difference — communication keeps love alive across the "icy miles", C) That letters are meaningless, D) That only physical closeness matters
    * **Correct:** B
    * **Feedback:** ✓ Correct. Despite separate worlds and physical distance, the exchange of words keeps the bond real and alive — connection is sustained through communication.
    * **Why A:** The poem affirms that love endures the distance.
    * **Why C:** The letters are exactly what sustains the relationship.
    * **Why D:** It values the connection of souls over mere physical closeness.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does a farmer recount choosing a young "maid" who, terrified, "runned away", is caught and brought home, and remains fearful and distant?
    * **Options:** A) The Farmer's Bride, B) Porphyria's Lover, C) Before You Were Mine, D) Eden Rock
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mew's "The Farmer's Bride" has the farmer tell how his frightened young wife fled, was "fetched home", and stays withdrawn — a tragic, unreachable love.
    * **Why B:** Porphyria's Lover strangles his lover; the bride here flees and survives.
    * **Why C:** Before You Were Mine imagines a mother's youth.
    * **Why D:** Eden Rock pictures dead parents beyond a stream.

41. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "The Farmer's Bride" is a dramatic [BLANK] with narrative, ballad-like features, spoken by the farmer himself.
    * **Answer:** monologue
    * **Feedback:** ✓ Correct. The farmer's own voice tells the story — a dramatic monologue whose narrative details expose his wife's terror and their tragic distance.
    * **WhyWrong:** The word is "monologue" — a dramatic monologue, spoken by the farmer, carrying a sad narrative of unreachable love.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What makes "The Farmer's Bride" tragic and unsettling?
    * **Options:** A) The farmer's open cruelty and violence, B) The gap between the farmer's baffled, growing desire and the bride's silent terror — a love that cannot be reached or forced, C) The bride's happiness in the marriage, D) The comedy of rural life
    * **Correct:** B
    * **Feedback:** ✓ Correct. The farmer is not simply cruel; the horror lies in the unbridgeable gulf between his mounting longing ("her hair, her hair!") and her animal fear, love that can neither be shared nor compelled.
    * **Why A:** He is bewildered and yearning rather than openly brutal, which is what unsettles.
    * **Why C:** The bride is frightened and withdrawn, not happy.
    * **Why D:** The tone is tragic, not comic.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does a calm speaker strangle his lover with her own hair to freeze a perfect moment, then note "God has not said a word"?
    * **Options:** A) Porphyria's Lover, B) The Farmer's Bride, C) When We Two Parted, D) Sonnet 29 'I think of thee'
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's "Porphyria's Lover" has the speaker strangle Porphyria with her hair to possess the moment forever, ending on the chilling "And yet God has not said a word!".
    * **Why B:** The Farmer's Bride flees and survives; she is not murdered.
    * **Why C:** When We Two Parted grieves a broken love, with no violence.
    * **Why D:** Sonnet 29 is a surge of longing, not a murder.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What is the effect of the dramatic monologue form in "Porphyria's Lover"?
    * **Options:** A) It keeps the reader at a safe, comfortable distance, B) It draws us uncomfortably close to a disturbed mind, letting the speaker calmly expose his own madness, C) It hides the speaker completely, D) It makes the poem funny
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unbroken, composed voice traps us inside the speaker's chilling logic, so his madness reveals itself the more we listen.
    * **Why A:** The form creates uneasy closeness, not safe distance.
    * **Why C:** It exposes the speaker's mind rather than hiding him.
    * **Why D:** The effect is disturbing, not comic.

45. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "Porphyria's Lover" presents love twisted into a desire for total control — the speaker kills to possess the perfect moment and stop it changing.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The murder is an act of possessive control: by killing Porphyria at the height of the moment, the speaker tries to fix her love forever, exposing a chilling obsession.
    * **WhyWrong:** This is true — the poem turns love into possessive control, the speaker killing to freeze and own a perfect moment.
