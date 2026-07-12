# Foundational Quiz Bank — AQA Love and Relationships Poetry (Poems)

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
   * **Question:** Which poem builds a single sustained metaphor — a beloved elder treated as a mountain to be climbed slowly and carefully up to his "summit" — to argue that truly knowing someone is patient, physical, loving work?
   * **Options:** A) Follower, B) Climbing My Grandfather, C) Eden Rock, D) Walking Away
   * **Correct:** B
   * **Feedback:** ✓ Correct. Waterhouse's "Climbing My Grandfather" turns the old man's body into terrain the speaker scales — nails "giving good purchase" — reaching the "summit" of his head, so the climb itself becomes an act of intimate knowing and respect.
   * **Why A:** Follower's argument is a son's changing relationship with a ploughing father and the reversal of roles, not the knowing of an elder through a climb.
   * **Why C:** Eden Rock's argument is the comfort of imagining reunion with dead parents, not coming to know a living elder.
   * **Why D:** Walking Away argues that parental love means releasing a child, not scaling and knowing one.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the free verse of "Climbing My Grandfather" serve its meaning?
   * **Options:** A) Its strict sonnet form argues a case, B) Its loose, unhurried form lets the single extended metaphor of the climb unfold steadily, mirroring the patient act of coming to know a beloved elder, C) Its ballad refrain tells a heroic tale, D) It has no effect on the meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The open, unhurried free verse lets the one climbing metaphor build without interruption, so the form itself enacts the slow, tender attention the poem pays to the grandfather.
   * **Why A:** The poem flows freely; it is not a tightly argued sonnet.
   * **Why C:** It is an intimate portrait, not a heroic ballad.
   * **Why D:** The open form is exactly what sustains the single climbing metaphor.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What feeling does "Climbing My Grandfather" ultimately leave us with?
   * **Options:** A) Fear and resentment of the grandfather, B) Deep admiration, intimacy and respect, as the effort of the climb becomes an act of love, C) Indifference towards family, D) Anger at growing old
   * **Correct:** B
   * **Feedback:** ✓ Correct. The strain of the climb becomes tenderness — reaching the "summit" and lying breathless conveys awe, closeness and respect for the grandfather.
   * **Why A:** The tone is tender admiration, not fear or resentment.
   * **Why C:** The whole poem is an act of intimate attention, the opposite of indifference.
   * **Why D:** It celebrates the elder rather than resenting age.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that admiration can invert with time — a boy who once trailed his expert father now leads, while the ageing father "will not go away" but stumbles behind him?
   * **Options:** A) Follower, B) Mother, Any Distance, C) Winter Swans, D) Neutral Tones
   * **Correct:** A
   * **Feedback:** ✓ Correct. Heaney's "Follower" watches the skilled father plough, then reverses the roles at the close — the father now the one who "will not go away" — arguing that dependence and admiration shift as generations age.
   * **Why B:** Mother, Any Distance argues a son's growth means loosening the mother's hold, not a father's decline.
   * **Why C:** Winter Swans argues a couple can silently reconcile, not that roles reverse with age.
   * **Why D:** Neutral Tones argues love fades into lasting disillusionment, not generational reversal.

5. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "Follower" is written in regular, rhymed quatrains, whose steady, controlled shape reflects the father's skill and the measured rhythm of ploughing.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Heaney's neat quatrains move with the measured, expert rhythm of the plough, so the ordered form embodies the father's mastery.
   * **WhyWrong:** This is true — the ordered rhymed quatrains mirror the father's skilled, rhythmic ploughing.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the effect of the final turn in "Follower", where the father now stumbles behind the speaker?
   * **Options:** A) It suggests the father was always incompetent, B) It reverses the roles of admiration and dependence, exposing time, ageing and the son's uneasy mix of love and impatience, C) It proves the son never loved his father, D) It celebrates a happy family outing
   * **Correct:** B
   * **Feedback:** ✓ Correct. The reversal — once the follower, now the followed — captures the passing of time, the father's decline and the son's troubled tenderness.
   * **Why A:** The father is shown as an expert; the point is change, not incompetence.
   * **Why C:** The poem is rooted in admiration; love is not denied.
   * **Why D:** The tone is reflective and uneasy, not a cheerful outing.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem, recalling a parting "eighteen years ago" as a son walked off behind a "scatter of boys", argues that real parental love is proved by releasing a child into independence?
   * **Options:** A) Before You Were Mine, B) Walking Away, C) Eden Rock, D) Letters from Yorkshire
   * **Correct:** B
   * **Feedback:** ✓ Correct. Day-Lewis's "Walking Away" watches his son drift off after a game like a "satellite" pulled from orbit, reaching the conviction that "selfhood begins with a walking away" — love matures by letting go.
   * **Why A:** Before You Were Mine imagines a mother's youth before the speaker existed, not a parent releasing a child.
   * **Why C:** Eden Rock imagines dead parents welcoming the speaker, not a living parting.
   * **Why D:** Letters from Yorkshire argues connection survives distance, not that love means release.

8. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** In "Walking Away", Day-Lewis compares his departing son to a [BLANK] "wrenched from its orbit", so the image itself enacts the child pulled painfully and naturally out of the parent's hold.
   * **Answer:** satellite
   * **Feedback:** ✓ Correct. The simile of a "satellite" "wrenched from its orbit" makes the son's leaving feel like an unstoppable, natural force — the image carrying the poem's argument about inevitable separation.
   * **WhyWrong:** The word is "satellite" — the son is like a satellite wrenched from orbit, drifting inevitably away, so the image does the poem's thinking about letting go.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What idea about parental love does "Walking Away" reach in its final lines?
   * **Options:** A) That love means holding a child close forever, B) That "selfhood begins with a walking away" — love is shown in the letting go, so separation is where a child's independent self begins, C) That parents and children should never part, D) That the son was ungrateful
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poem resolves that "selfhood begins with a walking away" and that love is proved in the letting go — real love allows, even requires, painful independence.
   * **Why A:** The poem argues the opposite — love releases rather than clings.
   * **Why C:** It accepts parting as necessary to growth.
   * **Why D:** The ache is the parent's; the son is never blamed.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that a parent had a vivid life of her own before her child — the daughter picturing a "polka-dot dress" and "the ballroom with the thousand eyes" in the years "before you were mine"?
    * **Options:** A) Before You Were Mine, B) Neutral Tones, C) The Farmer's Bride, D) Follower
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "Before You Were Mine" pictures the mother young and carefree — the "polka-dot dress", "the ballroom with the thousand eyes" — arguing that this glamorous self existed, and was partly given up, "before you were mine".
    * **Why B:** Neutral Tones argues love fades into disillusionment by a winter pond, not a mother's lost youth.
    * **Why C:** The Farmer's Bride explores an unreachable, frightened wife, not a celebrated mother.
    * **Why D:** Follower explores a son's changing bond with a ploughing father, not a mother's glamour.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How does the free verse of "Before You Were Mine" serve its meaning?
    * **Options:** A) Its strict form argues a legal case, B) Its loose, interior-monologue style lets the daughter freely imagine and reconstruct her mother's life before motherhood, C) Its ballad refrain tells a heroic tale, D) Its sonnet volta resolves a debate
    * **Correct:** B
    * **Feedback:** ✓ Correct. The free, wandering voice suits memory and imagination as the daughter conjures her mother young, carefree and not yet hers — the open form mirroring the drift of remembering.
    * **Why A:** The poem flows like private thought, not a legal argument.
    * **Why C:** It is a personal reflection, not a heroic ballad.
    * **Why D:** It is free verse, without a sonnet's formal turn.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** In "Before You Were Mine", the daughter's imagining of her mother's free, glamorous past carries a faint sense of loss — that this vivid life existed before, and was partly closed down by, the child.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The love is tinged with wistfulness: the mother's glamour belonged to a self that motherhood — the arrival of the speaker — began to close down, so celebration and loss run together.
    * **WhyWrong:** This is true — beneath the celebration runs a wistful sense that the mother's carefree self existed "before" the daughter claimed her.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem uses a tape measure across a new house — the mother at the "zero-end", the tape "unreeling" as the speaker moves off — as a metaphor for a mother-and-son bond stretched by the son's growing independence?
    * **Options:** A) Mother, Any Distance, B) Climbing My Grandfather, C) Winter Swans, D) Love's Philosophy
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Mother, Any Distance" has the mother hold the "zero-end" of the tape as it goes "unreeling", measuring not just a home but the widening, testing distance of the son's independence.
    * **Why B:** Climbing My Grandfather uses a mountain-climb to know an elder, not a stretching bond measured out.
    * **Why C:** Winter Swans watches a couple reconcile, not a parent and child separating.
    * **Why D:** Love's Philosophy argues lovers should unite, the opposite of stretching apart.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "Mother, Any Distance" uses a loose, stretched sonnet form, its shape pulled out and loosened like the tape measure in the poem.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The loosely stretched sonnet works like the tape measure — its form is extended as the bond between mother and son is tested and drawn out.
    * **WhyWrong:** It does use a stretched sonnet — the form is extended and loosened, echoing the measuring tape and the stretching bond.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the ending of "Mother, Any Distance" — reaching a hatch that "opens on an endless sky", the son left to fall or fly — convey?
    * **Options:** A) That the son will never leave home, B) The risk and exhilaration of independence, as the son lets go of the mother's steadying line to make his own way, C) That the mother refuses to let go, D) That measuring a house is pointless
    * **Correct:** B
    * **Feedback:** ✓ Correct. The hatch that "opens on an endless sky" and the choice to fall or fly capture the danger and thrill of independence — the son releasing the mother's line to risk his own adult life.
    * **Why A:** The whole poem moves towards leaving, not staying.
    * **Why C:** It is the son who lets go of the line; the mother anchors him.
    * **Why D:** The measuring is a metaphor for the bond, not a literal chore.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem imagines dead parents waiting on the far bank of a stream, picnicking as in life and beckoning the speaker across — so that death is reimagined as a gentle crossing towards a longed-for reunion?
    * **Options:** A) Eden Rock, B) Walking Away, C) When We Two Parted, D) Winter Swans
    * **Correct:** A
    * **Feedback:** ✓ Correct. Causley's "Eden Rock" pictures his dead parents beyond a stream, beckoning the speaker across; the quiet close — "I had not thought that it would be like this" — turns the fear of death into calm, hopeful reunion.
    * **Why B:** Walking Away recalls a living father watching a son leave, not a reunion beyond death.
    * **Why C:** When We Two Parted grieves a secret, broken love, not the comfort of reunion.
    * **Why D:** Winter Swans follows a living couple reconciling, not the dead across a stream.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the mostly gentle, regular form of "Eden Rock" support its subject?
    * **Options:** A) Its harsh, broken structure conveys rage, B) Its calm, ordered stanzas keep the vision of the dead parents peaceful and reassuring, so the quiet final-line shift lands with real force, C) It is a chaotic free verse, D) It is a galloping ballad of war
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
    * **Feedback:** ✓ Correct. Causley turns the fear of death into comfort — imagining his parents waiting to welcome him makes the "crossing" over into death feel gentle and hopeful.
    * **Why A:** The poem concerns parents and mortality, not a lovers' quarrel.
    * **Why C:** There is no battlefield; the setting is a tender family picnic.
    * **Why D:** It faces death, though with warmth, rather than celebrating youth.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem fixes a single bleak memory — a couple standing by a pond that winter day under a sun "chidden of God" — into a lasting emblem of love turned cold and deceitful?
    * **Options:** A) Neutral Tones, B) Love's Philosophy, C) Letters from Yorkshire, D) Singh Song!
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "Neutral Tones" freezes the grey pond, the white sun "chidden of God" and a "grin of bitterness" into one image, arguing that a single dead love can colour how we see love ever after.
    * **Why B:** Love's Philosophy argues warmly for union, not a bleak memory of dead love.
    * **Why C:** Letters from Yorkshire argues connection survives distance, not that love curdles.
    * **Why D:** Singh Song! celebrates joyful, consuming love, the opposite of disillusionment.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What mood do the reflective, greyish quatrains of "Neutral Tones" create, and why?
    * **Options:** A) Joyful celebration, B) A melancholic disillusionment — the measured, colourless stanzas suit a love that has faded and stopped moving, C) Comic mockery, D) Patriotic pride
    * **Correct:** B
    * **Feedback:** ✓ Correct. The measured, drained quatrains match Hardy's bleak reflection on a dead love, so the very flatness of the form deepens the sense of disillusionment.
    * **Why A:** The tone is sorrowful, not celebratory.
    * **Why C:** It is quietly sad, not comic.
    * **Why D:** The poem concerns lost love, not patriotism.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Neutral Tones", the bleak winter scene becomes a lasting emblem: the speaker suggests such greyness has shaped how he sees love and "wrongs" ever since.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Hardy makes the grey pond, white sun and bitter grin into a fixed image of love's betrayal — a scene that has coloured his view of love and "wrongs" ever after.
    * **WhyWrong:** This is true — the frozen, colourless scene becomes a permanent emblem of disillusionment that stays with the speaker.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem sets a silent, estranged couple beside swans "righting in rough weather" until their hands quietly reunite "like a pair of wings settling" — arguing that love can recover without a word?
    * **Options:** A) Winter Swans, B) Eden Rock, C) Follower, D) The Farmer's Bride
    * **Correct:** A
    * **Feedback:** ✓ Correct. Sheers's "Winter Swans" watches the swans that "mate for life" "righting in rough weather", and the couple's hands close "like a pair of wings settling" — reconciliation modelled on natural constancy.
    * **Why B:** Eden Rock imagines dead parents beyond a stream, not a couple reconciling.
    * **Why C:** Follower explores a son and his ploughing father, not lovers healing.
    * **Why D:** The Farmer's Bride explores a love that cannot be reached, the opposite of quiet reunion.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Winter Swans" reflect its meaning?
    * **Options:** A) Long unbroken stanzas show endless argument, B) The poem moves from separated tercets towards paired lines and a final joining, so the structure enacts the couple coming back together, C) A strict sonnet argues a case, D) A galloping ballad drives to war
    * **Correct:** B
    * **Feedback:** ✓ Correct. The shift towards paired lines and the closing image of hands as "a pair of wings settling" lets the structure itself perform the couple's reconciliation.
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
    * **Question:** Which poem grieves a secret past love that ended in silence and tears, and imagines meeting the faithless lover again years later with the very same "silence and tears"?
    * **Options:** A) When We Two Parted, B) Love's Philosophy, C) Singh Song!, D) Winter Swans
    * **Correct:** A
    * **Feedback:** ✓ Correct. Byron's "When We Two Parted" frames a secret, broken love with the returning "silence and tears", arguing that a betrayal kept hidden festers into lasting, unspoken grief.
    * **Why B:** Love's Philosophy is a warm plea for union, not a grief over betrayal.
    * **Why C:** Singh Song! is a joyful, comic celebration of love.
    * **Why D:** Winter Swans ends in reconciliation, not lasting sorrow.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "When We Two Parted", the ballad-like [BLANK] of key words — and the returning phrase "silence and tears" — makes the poem circle back on its grief, so its very structure enacts a speaker unable to move on.
    * **Answer:** repetition
    * **Feedback:** ✓ Correct. The refrain-like repetition and the returning "silence and tears" give the lyric a circling, inescapable movement — the form itself embodying grief that cannot be left behind.
    * **WhyWrong:** The word is "repetition" — the repeated words and returning "silence and tears" make the sorrow feel circular and unresolved.

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
    * **Question:** Which poem argues from nature — "The fountains mingle with the river", "Nothing in this world is single" — that since all things unite, the beloved should therefore unite with the speaker?
    * **Options:** A) Love's Philosophy, B) Neutral Tones, C) Letters from Yorkshire, D) Porphyria's Lover
    * **Correct:** A
    * **Feedback:** ✓ Correct. Shelley's "Love's Philosophy" stacks nature's minglings — "The fountains mingle with the river", "Nothing in this world is single" — into a persuasive case that refusing love would break the law of the world.
    * **Why B:** Neutral Tones argues love decays into disillusionment, not that lovers should unite.
    * **Why C:** Letters from Yorkshire argues connection survives distance, not a seductive plea.
    * **Why D:** Porphyria's Lover argues love twists into possessive control, the opposite of a gentle appeal.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Love's Philosophy" support its persuasive purpose?
    * **Options:** A) Its broken, chaotic lines undercut the argument, B) Its regular, musical lyric stanzas and mounting natural examples build a smooth, almost logical case that culminates in a direct personal appeal, C) It is an unrhymed epic, D) It is a dramatic monologue exposing madness
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat, rhythmic stanzas and accumulating images of nature uniting give the argument a persuasive, almost inevitable momentum, so the closing turn to the beloved feels like the conclusion of a proof.
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
    * **Question:** Which poem lets the speaker's thoughts "twine and bud / About thee, as wild vines", then bursts them aside — "I do not think of thee" — arguing that real presence must overwhelm the mere thought of the beloved?
    * **Options:** A) Sonnet 29 'I think of thee', B) Letters from Yorkshire, C) Follower, D) Eden Rock
    * **Correct:** A
    * **Feedback:** ✓ Correct. Barrett Browning's "Sonnet 29" lets thoughts wrap the beloved like "wild vines", then casts them off — "I do not think of thee" because she is too near to need to — arguing that desire for the real presence outstrips imagining it.
    * **Why B:** Letters from Yorkshire argues connection survives physical distance, not that presence beats thought.
    * **Why C:** Follower explores a son and his ageing father, not longing for a lover.
    * **Why D:** Eden Rock imagines reunion with dead parents, not desire for a living beloved.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the sonnet form of "Sonnet 29" shape its meaning?
    * **Options:** A) It stays perfectly regular to show calm control, B) The traditional shape is strained by an early turn, so the speaker's desire for presence over thought seems to break impatiently through the form, C) It is a galloping ballad, D) It abandons rhyme entirely for dialect
    * **Correct:** B
    * **Feedback:** ✓ Correct. The volta comes early, so the surge of longing for the real man breaks through the ordered sonnet shape — the form enacting passion overflowing thought.
    * **Why A:** The point is that passion strains against the form, not that it stays serenely regular.
    * **Why C:** It is an intimate sonnet, not a narrative ballad.
    * **Why D:** It keeps sonnet length and rhyme; it is not dialect free verse.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the extended "wild vines" image, then its bursting, convey in "Sonnet 29"?
    * **Options:** A) That the speaker prefers thinking about her lover to seeing him, B) That thought is only a poor substitute — she craves the lover's actual presence, which overwhelms mere imagining, C) That she has stopped loving him, D) That nature matters more than love
    * **Correct:** B
    * **Feedback:** ✓ Correct. The "wild vines" of thought threaten to hide the real man; she wants him present — "I am too near to thee" to be content with only thinking — desire overflowing imagination.
    * **Why A:** She rejects thought as a substitute; she wants the real presence.
    * **Why C:** The poem is a surge of desire, not a falling-out of love.
    * **Why D:** Nature is only the vehicle; the real subject is intense love.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, spoken in a playful Punjabi-inflected voice, has a newly-married shopkeeper neglect his father's shop — even as customers call it "di worst Indian shop" — because he would rather be upstairs with his bride?
    * **Options:** A) Singh Song!, B) The Farmer's Bride, C) Love's Philosophy, D) When We Two Parted
    * **Correct:** A
    * **Feedback:** ✓ Correct. Nagra's "Singh Song!" has the smitten shopkeeper abandon his duties — customers grumble it is "di worst Indian shop / in di whole Indian road" — celebrating a joyful, all-consuming love rooted in his cultural and family world.
    * **Why B:** The Farmer's Bride tells of a frightened, fleeing wife, not a joyful marriage.
    * **Why C:** Love's Philosophy is a persuasive plea from nature, not a comic celebration.
    * **Why D:** When We Two Parted grieves a secret, broken love.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** In "Singh Song!", how do the dialect and free verse work together?
    * **Options:** A) They show the speaker cannot write English, B) They root the love story in the speaker's cultural identity and give the poem its warm, playful, celebratory energy, C) They make the poem a solemn elegy, D) They have no effect on meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The lively dialect and loose form give the poem its warmth and humour, tying the joy of the love directly to the speaker's cultural and family world.
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
    * **Question:** Which poem contrasts one partner digging and planting outdoors in Yorkshire with a distant other, insisting that "our souls tap out messages across the icy miles" — that love survives on connection, not proximity?
    * **Options:** A) Letters from Yorkshire, B) Winter Swans, C) Neutral Tones, D) Climbing My Grandfather
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dooley's "Letters from Yorkshire" sets the earthy, outdoor life of one against the distant other, arguing that "our souls tap out messages across the icy miles" — genuine connection outlasts physical separation.
    * **Why B:** Winter Swans watches a couple reconcile in one place, not love sustained across distance.
    * **Why C:** Neutral Tones argues love decays into disillusionment, not that it endures apart.
    * **Why D:** Climbing My Grandfather explores knowing an elder up close, not connection at a distance.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the form of "Letters from Yorkshire" reflect its subject?
    * **Options:** A) Its rigid sonnet argues a case, B) Its loose free-verse tercets and run-on lines let thought flow easily between the two distant lives, like the letters themselves, C) Its galloping ballad drives to war, D) It repeats a fixed refrain each stanza
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unforced tercets and enjambment carry the conversational, connecting movement of correspondence, bridging the gap between the two lives.
    * **Why A:** The poem is loose free verse, not a formal sonnet.
    * **Why C:** It is a quiet meditation on connection, not a war ballad.
    * **Why D:** There is no fixed repeating refrain.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Letters from Yorkshire" suggest about love and connection?
    * **Options:** A) That distance and different lives make love impossible, B) That genuine connection can survive distance and difference — communication keeps love alive across the "icy miles", C) That letters are meaningless, D) That only physical closeness matters
    * **Correct:** B
    * **Feedback:** ✓ Correct. Despite separate worlds and physical distance, the exchange of words keeps the bond real and alive — connection is sustained across the "icy miles" through communication.
    * **Why A:** The poem affirms that love endures the distance.
    * **Why C:** The letters are exactly what sustains the relationship.
    * **Why D:** It values the connection of souls over mere physical closeness.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem has a farmer recount choosing a young "maid" who, terrified, "runned away" and was chased down — "we caught her" — yet stays fearful and unreachable, a love that can be captured but never won?
    * **Options:** A) The Farmer's Bride, B) Porphyria's Lover, C) Before You Were Mine, D) Eden Rock
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mew's "The Farmer's Bride" has the farmer tell how his frightened young "maid" "runned away" and "we caught her", then withdrew in terror — arguing that love cannot be forced into being, only left tragically unreachable.
    * **Why B:** Porphyria's Lover ends in murder to possess a lover; the bride here flees and survives.
    * **Why C:** Before You Were Mine imagines a mother's glamorous youth, not a fearful marriage.
    * **Why D:** Eden Rock imagines reunion with dead parents, not an unreachable wife.

41. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "The Farmer's Bride" is a dramatic [BLANK], spoken by the farmer himself — and hearing the story only in his baffled voice, never the wife's, is what exposes the tragic gulf between them.
    * **Answer:** monologue
    * **Feedback:** ✓ Correct. Because it is a dramatic monologue in the farmer's voice alone, the silenced wife's terror reaches us only through his bewilderment — the one-sided form itself dramatising a love that cannot be shared.
    * **WhyWrong:** The word is "monologue" — a dramatic monologue in the farmer's voice, whose one-sidedness exposes the unbridgeable distance between him and his frightened wife.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What makes "The Farmer's Bride" tragic and unsettling?
    * **Options:** A) The farmer's open cruelty and violence, B) The gap between the farmer's baffled, mounting longing — fixing on "her hair" — and the bride's silent terror: a love that can be neither shared nor forced, C) The bride's happiness in the marriage, D) The comedy of rural life
    * **Correct:** B
    * **Feedback:** ✓ Correct. The farmer is not simply cruel; the horror lies in the unbridgeable gulf between his growing desire — dwelling on "her hair" — and her animal fear, a love that can be neither returned nor compelled.
    * **Why A:** He is bewildered and yearning rather than openly brutal, which is what unsettles.
    * **Why C:** The bride is frightened and withdrawn, not happy.
    * **Why D:** The tone is tragic, not comic.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does a calm speaker strangle his lover with her own hair to freeze a perfect moment forever, then sit unpunished — so that love has curdled into a will to possess and control?
    * **Options:** A) Porphyria's Lover, B) The Farmer's Bride, C) When We Two Parted, D) Sonnet 29 'I think of thee'
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's "Porphyria's Lover" has the speaker wind her hair around her throat — "And strangled her" — to keep the moment of her love forever, arguing that possessive love can twist into control and murder.
    * **Why B:** The Farmer's Bride flees and survives; she is not murdered.
    * **Why C:** When We Two Parted grieves a broken love, with no violence.
    * **Why D:** Sonnet 29 is a surge of longing for presence, not a murder.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What is the effect of the dramatic monologue form in "Porphyria's Lover"?
    * **Options:** A) It keeps the reader at a safe, comfortable distance, B) It draws us uncomfortably close to a disturbed mind, letting the speaker calmly expose his own madness the more he talks, C) It hides the speaker completely, D) It makes the poem funny
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
