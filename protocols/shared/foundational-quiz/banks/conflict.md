# Foundational Quiz Bank — OCR GCSE Literature Poetry: Conflict ("Towards a World Unknown") (Poems)

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
- **@set:1** — The Destruction of Sennacherib (Byron) · Vergissmeinnicht (Douglas) · We Lived Happily during the War (Kaminsky) · What Were They Like? (Levertov) · Lament (Clarke)
- **@set:2** — Boat Stealing / Extract from The Prelude (Wordsworth) · Envy (Lamb) · There's a Certain Slant of Light (Dickinson) · Honour Killing (Dharker) · Partition (Bhatt)
- **@set:3** — Flag (Agard) · Colonization in Reverse (Bennett) · Songs for the People (Harper) · Papa-T (D'Aguiar) · Thirteen (Femi)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: OCR Conflict Poetry (Poems)

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem tells how a mighty army is destroyed overnight, its host wasted "like the leaves of the forest", after coming down "like the wolf on the fold"?
   * **Options:** A) Vergissmeinnicht, B) The Destruction of Sennacherib, C) What Were They Like?, D) Boat Stealing
   * **Correct:** B
   * **Feedback:** ✓ Correct. Byron's "The Destruction of Sennacherib" retells the biblical account of the Assyrian army struck down in a single night, its ranks left as scattered and lifeless as autumn leaves.
   * **Why A:** Vergissmeinnicht follows a single dead German gunner found by soldiers in the desert, not a whole army destroyed overnight.
   * **Why C:** What Were They Like? questions and answers about a vanished culture, not a biblical army.
   * **Why D:** Boat Stealing follows a boy's night on a lake, not a besieging army.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does Byron shape "The Destruction of Sennacherib" to suit its subject?
   * **Options:** A) Free verse with no metre or rhyme, B) Rhymed four-line stanzas driven by a galloping, three-beat (anapaestic) rhythm, C) A single unbroken verse paragraph, D) A question-and-answer structure
   * **Correct:** B
   * **Feedback:** ✓ Correct. Byron's rhymed quatrains ride a rolling anapaestic beat, so the verse itself seems to charge like the advancing host before it collapses into stillness.
   * **Why A:** The poem is tightly metred and rhymed, the opposite of free verse.
   * **Why C:** It is divided into six clear stanzas, not run together as one paragraph.
   * **Why D:** That question-and-answer shape belongs to "What Were They Like?", not to Byron's narrative.

3. **Type: Select All [Tests Meaning & Effects]**
   @set:1
   * **Question:** Which statements correctly describe the meaning and effect of "The Destruction of Sennacherib"?
   * **Options:** A) The poem retells a biblical account of a besieging army destroyed in a single night, B) The galloping rhythm mirrors the army's swift advance and then its sudden collapse, C) The poem presents earthly military power as fragile beside a greater, unseen force, D) The poem celebrates the Assyrian army's ultimate victory
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. Byron dramatises the biblical destruction of Sennacherib's army, using a driving rhythm that charges and then stalls, to show how swiftly imposing military power can be undone.
   * **Why D:** The Assyrian host is annihilated, not victorious — the poem's force comes from that reversal.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem describes soldiers returning to a battlefield to find the body of an enemy gunner they had killed weeks before, a photograph of his sweetheart still beside him?
   * **Options:** A) Vergissmeinnicht, B) The Destruction of Sennacherib, C) Lament, D) Boat Stealing
   * **Correct:** A
   * **Feedback:** ✓ Correct. Keith Douglas's "Vergissmeinnicht" (German for "forget-me-not") follows soldiers who return three weeks on to find the enemy gunner they killed, his body still lying beside a photograph of his girlfriend.
   * **Why B:** Sennacherib describes a whole army struck down overnight, not one gunner found by returning soldiers.
   * **Why C:** Lament mourns a wider list of war's victims, not one specific dead gunner and his photograph.
   * **Why D:** Boat Stealing follows a boy on a lake, with no soldiers or battlefield.

5. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** Douglas arranges "Vergissmeinnicht" into six four-line stanzas, known as [BLANK].
   * **Answer:** quatrains
   * **Feedback:** ✓ Correct. Each measured quatrain holds one stage of the soldiers' return to the dead gunner, containing the scene's horror within a controlled shape.
   * **WhyWrong:** The word is "quatrains" — the four-line stanzas that structure the poem's six-part account.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What paradox does "Vergissmeinnicht" centre on?
   * **Options:** A) The dead gunner is shown as purely evil, with no humanity at all, B) The same man is both a "lover and killer... mingled" — tender in the photograph, but also the soldier who nearly killed the speaker, C) The poem argues that all enemies deserve equal cruelty, D) The poem celebrates the soldiers' victory with no reflection
   * **Correct:** B
   * **Feedback:** ✓ Correct. Douglas holds the dead gunner as both dangerous combatant and someone loved — "the lover and killer... mingled" — complicating any simple hatred of the enemy.
   * **Why A:** The photograph and inscription "Vergissmeinnicht" ("forget-me-not") insist on his tenderness and humanity, not pure evil.
   * **Why C:** The poem unsettles easy judgement of the enemy rather than arguing for cruelty.
   * **Why D:** The tone is uneasy and reflective, not celebratory.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem reflects on ordinary people continuing their comfortable daily lives while a war rages elsewhere, admitting their own complicity in looking away?
   * **Options:** A) We Lived Happily during the War, B) The Destruction of Sennacherib, C) What Were They Like?, D) Envy
   * **Correct:** A
   * **Feedback:** ✓ Correct. Ilya Kaminsky's "We Lived Happily during the War" confronts the guilt of a comfortable life continuing undisturbed while war and suffering happen to others, protested against only weakly.
   * **Why B:** Sennacherib retells a biblical battle, not a modern reflection on guilt and complicity.
   * **Why C:** What Were They Like? mourns an already-destroyed culture, rather than confessing present-day complicity.
   * **Why D:** Envy is a moral poem about the vice of envy, not about war and complicity.

8. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "We Lived Happily during the War" is written in free verse, without a fixed rhyme scheme or regular metre.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Kaminsky lets the lines break irregularly and without rhyme, the unsettled form matching the poem's uneasy, confessional tone.
   * **WhyWrong:** This is true — the poem moves in free verse, its irregular lines suiting its unsettled, confessional voice.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does "We Lived Happily during the War" ultimately confront?
   * **Options:** A) The heroism of soldiers on the front line, B) The uncomfortable guilt of continuing an untroubled, comfortable life while others suffer a war close by, C) The joy of a nation's peacetime celebrations, D) A detailed account of a specific battle
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poem's central discomfort is complicity — the speaker admits that life carried on in comfort while war and suffering continued elsewhere, protested against only weakly.
   * **Why A:** The poem is not concerned with the front line but with civilian life continuing at a distance from the war.
   * **Why C:** The tone is uneasy and self-critical, not celebratory.
   * **Why D:** The poem stays general and reflective rather than narrating one battle's events.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem is structured as a series of numbered questions about a vanished people, followed by numbered answers admitting how much has been destroyed and forgotten?
    * **Options:** A) What Were They Like?, B) Lament, C) Vergissmeinnicht, D) Boat Stealing
    * **Correct:** A
    * **Feedback:** ✓ Correct. Denise Levertov's "What Were They Like?" asks a series of numbered questions about a people's vanished way of life, answered by a voice that can recall only devastation and loss.
    * **Why B:** Lament proceeds as a litany of "For the..." stanzas, not a question-and-answer structure.
    * **Why C:** Vergissmeinnicht follows one dead gunner, not a whole erased culture.
    * **Why D:** Boat Stealing recounts a personal childhood memory, not a lost civilisation.

11. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** Levertov divides "What Were They Like?" into two clearly labelled parts, [BLANK] and Answers.
    * **Answer:** Questions
    * **Feedback:** ✓ Correct. The poem's "Questions" and "Answers" halves mirror each other, so every hopeful enquiry about the vanished culture returns only loss.
    * **WhyWrong:** The word is "Questions" — paired with the "Answers" that follow, the two halves stage an interrogation about a destroyed people.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What effect does the question-and-answer form create in "What Were They Like?"?
    * **Options:** A) It makes the poem read as a lighthearted quiz, B) The measured questions expect an intact, living culture, but the answers return only devastation, so the form itself enacts the loss it describes, C) It proves that the culture in question still thrives unharmed, D) It argues that no war ever really happened
    * **Correct:** B
    * **Feedback:** ✓ Correct. The calm, almost anthropological questions expect ordinary details of a living culture; the answers instead admit destruction and forgetting, so the poem's shape performs the erasure it describes.
    * **Why A:** The tone is elegiac and grave, not lighthearted.
    * **Why C:** The answers report loss and destruction, not survival.
    * **Why D:** The poem mourns a real devastation rather than denying it.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem takes the form of a litany, each stanza opening "For the...", mourning a widening list of casualties of war?
    * **Options:** A) Lament, B) Songs for the People, C) Envy, D) Papa-T
    * **Correct:** A
    * **Feedback:** ✓ Correct. Gillian Clarke's "Lament" repeats "For the..." through a roll-call of war's casualties, gathering both human and natural victims into one act of mourning.
    * **Why B:** Songs for the People looks towards hope and unity through song, not a litany of casualties.
    * **Why C:** Envy is a moral poem about the vice of envy, not a lament for war's victims.
    * **Why D:** Papa-T reflects on a family figure, not a litany of war casualties.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "Lament" is written in seven unrhymed three-line stanzas (tercets).
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem's seven tercets, each without rhyme, let the roll-call of mourning accumulate steadily, stanza by stanza.
    * **WhyWrong:** This is true — "Lament" proceeds in seven three-line, unrhymed stanzas that build its steady litany.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What is the effect of the repeated "For the..." openings across "Lament"?
    * **Options:** A) It builds a widening litany that extends mourning beyond soldiers to the wider natural world affected by war, B) It lists a set of cheerful blessings, C) It narrates a single soldier's journey home, D) It argues a legal case
    * **Correct:** A
    * **Feedback:** ✓ Correct. Each repeated "For the..." adds another casualty to the roll-call, so the mourning widens from human victims to the wider natural world caught up in war's damage.
    * **Why B:** The repeated openings mourn loss, not celebrate blessings.
    * **Why C:** The poem gathers many losses rather than following one soldier's story.
    * **Why D:** The anaphora builds grief, not a legal argument.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a boy steal a rowing boat at night, only to feel a huge dark peak seem to stride after him across the water?
    * **Options:** A) Boat Stealing (Extract from The Prelude), B) Vergissmeinnicht, C) Partition, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth's "Boat Stealing" extract from "The Prelude" recounts stealing a boat at night, then a "huge peak, black and huge" that seems to pursue him, leaving lasting awe and guilt.
    * **Why B:** Vergissmeinnicht is set on a desert battlefield, not a boy alone on a lake.
    * **Why C:** Partition recalls a mother's memory of a divided homeland, not a night on the water.
    * **Why D:** Thirteen reflects on urban adolescence, not a solitary boat theft.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Boat Stealing" is written in which form?
    * **Options:** A) Blank verse — unrhymed iambic pentameter, B) Rhyming couplets, C) A villanelle, D) A ballad in song-like stanzas
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth recounts the episode in a single unbroken passage of unrhymed iambic pentameter, its steady onward movement carrying the boy from confidence into dread.
    * **Why B:** The lines do not rhyme in pairs; they run on without a rhyme scheme.
    * **Why C:** It has no refrains or fixed nineteen-line shape, so it is not a villanelle.
    * **Why D:** It is a continuous meditation, not a story told in regular ballad stanzas.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the episode in "Boat Stealing" reveal about nature?
    * **Options:** A) Nature is harmless and purely decorative, B) Nature is a powerful, almost moral force that can awe, humble and instruct the human mind, C) Nature is entirely indifferent to people, D) Nature exists only to be conquered
    * **Correct:** B
    * **Feedback:** ✓ Correct. The looming peak leaves the boy with "huge and mighty forms" in his mind, presenting nature as a sublime power that teaches humility and shapes the self.
    * **Why A:** The overwhelming, guilt-inducing peak is the opposite of harmless decoration.
    * **Why C:** Nature acts on him so strongly that indifference cannot be the point.
    * **Why D:** The boy is humbled, not triumphant; nature masters him, not the reverse.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem offers moral counsel on the vice of envy, contrasting the envious person's misery with the ease of contentment?
    * **Options:** A) Envy, B) Lament, C) Flag, D) Colonization in Reverse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mary Lamb's "Envy" reflects on envy as a self-destructive vice, weighing the envious person's discontent against the quiet ease of a contented life.
    * **Why B:** Lament mourns victims of war, not the vice of envy.
    * **Why C:** Flag questions the power of a national symbol, not personal envy.
    * **Why D:** Colonization in Reverse satirises empire and migration, not an individual vice.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Envy" by Mary Lamb is written in six-line stanzas, known as [BLANK], held together by a tail-rhyme pattern.
    * **Answer:** sestets
    * **Feedback:** ✓ Correct. Each sestet pairs two rhymed couplets with a shorter tail line, the neat, controlled pattern suiting the poem's measured moral counsel.
    * **WhyWrong:** The word is "sestets" — the six-line stanzas whose tail-rhyme gives the poem its measured, didactic shape.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the central message of "Envy"?
    * **Options:** A) Envy is a harmless, even admirable trait, B) Envy corrodes the person who feels it, while contentment with one's own lot brings greater ease, C) Envy always leads to material success, D) Envy should be encouraged in children
    * **Correct:** B
    * **Feedback:** ✓ Correct. Lamb's moral verse presents envy as self-harming, urging instead the quieter reward of contentment with what one already has.
    * **Why A:** The poem treats envy as damaging, not harmless or admirable.
    * **Why C:** Envy is shown as corrosive, not a path to success.
    * **Why D:** As a piece of moral counsel, the poem discourages envy rather than encouraging it.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes a wintry "certain Slant of light" that brings an unexplained, oppressive despair, likened to "the Heft of Cathedral Tunes"?
    * **Options:** A) There's a Certain Slant of Light, B) Lament, C) What Were They Like?, D) Songs for the People
    * **Correct:** A
    * **Feedback:** ✓ Correct. Emily Dickinson's "There's a Certain Slant of Light" describes a winter light that presses down like the weight of cathedral music, bringing an inward "Heavenly Hurt" with no visible cause.
    * **Why B:** Lament mourns named casualties of war, not an unexplained inward despair.
    * **Why C:** What Were They Like? mourns an erased culture through questions and answers, not a described light.
    * **Why D:** Songs for the People looks towards hope and song, the opposite of the poem's oppressive mood.

23. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "There's a Certain Slant of Light" is written in four quatrains using Dickinson's characteristic dashes and slant (near) rhyme.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Dickinson's dashes interrupt the flow and her rhymes only half-chime, so the hymn-like quatrain form is strained from within, matching the poem's inward disturbance.
    * **WhyWrong:** This is true — the poem's four quatrains, broken by dashes and unsettled by slant rhyme, embody the "internal difference" it describes.

24. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "There's a Certain Slant of Light"?
    * **Options:** A) The poem describes an unexplained, inward despair brought on by a particular quality of winter light, B) Dickinson calls this despair an "internal difference" that leaves "no scar", C) The poem's dashes and slant rhyme unsettle its hymn-like form, mirroring the speaker's inward disturbance, D) The poem concludes that the despair is easily explained and quickly cured
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Dickinson locates an unexplained, scarless despair in a particular slant of winter light, calling it an "internal difference"; the poem's disturbed hymn form, unsettled by dashes and slant rhyme, enacts that inward wound.
    * **Why D:** The despair is described as mysterious and un-teachable, not easily explained or resolved.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem presents a speaker stripping away layer after layer of clothing and imposed identity, asserting the right to define herself?
    * **Options:** A) Honour Killing, B) Envy, C) Boat Stealing, D) Vergissmeinnicht
    * **Correct:** A
    * **Feedback:** ✓ Correct. Imtiaz Dharker's "Honour Killing" has its speaker remove one imposed garment and expectation after another, reclaiming ownership of her own identity.
    * **Why B:** Envy is moral counsel about a personal vice, not about imposed identity.
    * **Why C:** Boat Stealing is a childhood memory of nature, unrelated to imposed identity.
    * **Why D:** Vergissmeinnicht concerns a dead soldier on a battlefield, not a speaker reclaiming selfhood.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Honour Killing" suit its meaning?
    * **Options:** A) Loosening, free-verse lines without regular punctuation enact the speaker's gradual casting-off of every imposed identity, B) A strict sonnet argues a single legal case, C) Rhymed couplets celebrate a public victory, D) Regular ballad stanzas tell a heroic story
    * **Correct:** A
    * **Feedback:** ✓ Correct. As the speaker sheds one imposed layer after another, the free verse loosens with her, the open form enacting her move towards self-definition.
    * **Why B:** The poem's shape is open and shifting, not the tight fourteen lines of a sonnet.
    * **Why C:** It is an act of reclamation, not a celebration in rhymed couplets.
    * **Why D:** It is an unfolding meditation, not a story in regular ballad stanzas.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does "Honour Killing" ultimately assert?
    * **Options:** A) That imposed expectations of identity should be accepted without question, B) That the speaker has the right to remove every identity imposed on her and define herself on her own terms, C) That clothing has no symbolic significance at all, D) That the poem is only about fashion
    * **Correct:** B
    * **Feedback:** ✓ Correct. Dharker's speaker casts off each imposed marker of identity in turn, asserting her right to define who she is for herself.
    * **Why A:** The poem resists imposed expectations rather than accepting them.
    * **Why C:** The clothing and objects removed are treated as heavily symbolic, not incidental.
    * **Why D:** The stripping-away is symbolic of identity and control, not a poem about fashion.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls a mother's memory of the 1947 Partition of India, ending on a single haunting question about dividing a country?
    * **Options:** A) Partition, B) Lament, C) Songs for the People, D) Colonization in Reverse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Sujata Bhatt's "Partition" follows a mother's remembered experience of the 1947 Partition, closing on a stark question about how a country can be divided.
    * **Why B:** Lament mourns casualties of war generally, not one family's memory of Partition.
    * **Why C:** Songs for the People looks towards collective hope, not a specific family memory.
    * **Why D:** Colonization in Reverse satirises empire and migration, not the Partition of India.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Partition" is written as a single unbroken verse paragraph, without stanza breaks, before an isolated closing question.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem runs on without a break, like memory spilling out, before the indented final question falls into that flow with sudden weight.
    * **WhyWrong:** This is true — Bhatt lets the poem run as one continuous verse paragraph, so the closing question lands in isolation.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the effect of the poem's closing, isolated question in "Partition"?
    * **Options:** A) It resolves the poem with a clear, comforting answer, B) It leaves the trauma of Partition unresolved, forcing the reader to sit with a question that has no easy answer, C) It changes the subject to something unrelated, D) It celebrates the drawing of the new border
    * **Correct:** B
    * **Feedback:** ✓ Correct. By ending on an unanswered question, Bhatt refuses any tidy resolution, leaving the reader to confront the lasting, unresolved pain of Partition.
    * **Why A:** The poem deliberately withholds a comforting resolution.
    * **Why C:** The question returns directly to the poem's central concern with division.
    * **Why D:** The tone is one of grief and unease, not celebration.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem repeats a dismissive refrain about a flag being "just a piece of cloth", even as it reveals the terrible power people invest in it?
    * **Options:** A) Flag, B) Colonization in Reverse, C) Songs for the People, D) Thirteen
    * **Correct:** A
    * **Feedback:** ✓ Correct. John Agard's "Flag" returns again and again to a refrain that shrugs off the flag as mere fabric, even as the poem shows people killing and dying in its name.
    * **Why B:** Colonization in Reverse satirises empire through migration, not a repeated refrain about a flag.
    * **Why C:** Songs for the People looks towards unifying song, not a symbol of division like a flag.
    * **Why D:** Thirteen reflects on adolescence, not a national emblem.

32. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Flag" is built from three-line stanzas known as [BLANK], each holding a question, a dismissive refrain, and its consequence.
    * **Answer:** tercets
    * **Feedback:** ✓ Correct. Each tercet's tight three-line shape holds the poem's call-and-response between question, refrain and consequence.
    * **WhyWrong:** The word is "tercets" — the three-line stanzas from which Agard builds the poem's structure.

33. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Flag"?
    * **Options:** A) The poem repeats a refrain that dismisses the flag as mere cloth, B) The gap between the dismissive refrain and the flag's real power to provoke war and death creates irony, C) The poem questions how a simple object can command such extreme loyalty and violence, D) The poem concludes that flags have no real influence on people's actions
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Agard's refrain keeps insisting the flag is "just a piece of cloth", but the irony sharpens with every return, since the poem shows how much death and loyalty a flag can command.
    * **Why D:** The poem's whole point is that the flag commands enormous, often violent, influence over people.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, written in Jamaican dialect, satirically reverses the story of empire — instead of Britain colonising Jamaica, Jamaicans now migrate to Britain in large numbers?
    * **Options:** A) Colonization in Reverse, B) Flag, C) Envy, D) Boat Stealing
    * **Correct:** A
    * **Feedback:** ✓ Correct. Louise Bennett's "Colonization in Reverse" comically inverts the colonial narrative, imagining Jamaican migration to Britain as a reversal of empire's direction.
    * **Why B:** Flag concerns a national symbol, not migration and empire.
    * **Why C:** Envy is moral counsel on a personal vice, unrelated to colonial history.
    * **Why D:** Boat Stealing is a childhood memory of nature, unrelated to empire or migration.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "Colonization in Reverse" uses a song-like ballad stanza and Jamaican dialect to carry its satire of empire.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Bennett sets her reversal of colonial history to a lively, song-like ballad metre in dialect, and the cheerful, familiar tune sharpens the satire.
    * **WhyWrong:** This is true — the bouncing ballad stanza and dialect voice are exactly what carry the poem's comic, pointed satire.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the effect of Bennett's comic tone in "Colonization in Reverse"?
    * **Options:** A) It trivialises the history of empire completely, B) The light, comic surface makes the serious reversal of colonial history land more sharply, C) It proves that migration never really happened, D) It celebrates British colonial rule
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's playful, song-like humour makes its serious point about the reversal of colonial power all the more pointed and memorable.
    * **Why A:** The comedy sharpens the satire rather than trivialising the history it addresses.
    * **Why C:** The poem's whole premise is the reality of large-scale migration to Britain.
    * **Why D:** The satire questions and reverses colonial power, rather than celebrating it.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem expresses a poet's wish to create songs that can unite and uplift ordinary people, offering hope in place of division?
    * **Options:** A) Songs for the People, B) Lament, C) Vergissmeinnicht, D) Partition
    * **Correct:** A
    * **Feedback:** ✓ Correct. Frances E. W. Harper's "Songs for the People" voices a wish to write songs that can reach and unite ordinary people, offering comfort and hope.
    * **Why B:** Lament is a mourning litany for war's victims, not a wish to unite people through song.
    * **Why C:** Vergissmeinnicht concerns one dead soldier, not a hopeful vision of collective song.
    * **Why D:** Partition recalls one family's memory of a divided homeland, not a wish for unifying song.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** Given that Harper wrote in the accessible, rhymed, song-like tradition typical of nineteenth-century verse meant to be recited and sung, what kind of form would you expect "Songs for the People" to use?
    * **Options:** A) Regular, rhymed stanzas in a simple, song-like metre, B) Unrhymed free verse with no regular metre, C) A single unbroken prose paragraph, D) A strict Petrarchan sonnet
    * **Correct:** A
    * **Feedback:** ✓ Correct. Harper's verse favours regular, rhymed, song-like stanzas, fitting a poem that is itself a plea for unifying "songs for the people".
    * **Why B:** Harper's accessible, singable style favours regular rhyme and metre, not unrhymed free verse.
    * **Why C:** The poem is written in verse, not prose.
    * **Why D:** Harper's accessible style does not follow the tight fourteen-line argument of a Petrarchan sonnet.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What vision does "Songs for the People" offer?
    * **Options:** A) A vision of songs that divide people further, B) A hopeful vision of song as something that can comfort, unite and uplift people across differences, C) A rejection of music and poetry altogether, D) A demand that songs be reserved only for the powerful
    * **Correct:** B
    * **Feedback:** ✓ Correct. Harper imagines songs as a shared gift capable of comforting and uniting people, offering hope rather than division.
    * **Why A:** The poem's wish is for songs that unite, not divide.
    * **Why C:** The poem itself is a celebration of song's power, not a rejection of it.
    * **Why D:** Harper's "people" are ordinary and shared, not reserved for the powerful alone.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem takes its title from a family nickname, reflecting on a father or grandfather figure and the experience passed down through a family?
    * **Options:** A) Papa-T, B) Flag, C) The Destruction of Sennacherib, D) There's a Certain Slant of Light
    * **Correct:** A
    * **Feedback:** ✓ Correct. Fred D'Aguiar's "Papa-T" reflects on a family elder figure, considering the experience and memory carried down through the family.
    * **Why B:** Flag concerns a national symbol, not a family figure.
    * **Why C:** The Destruction of Sennacherib retells a biblical battle, unrelated to a family nickname.
    * **Why D:** There's a Certain Slant of Light describes an inward, wintry despair, not a family elder.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** As a piece of contemporary free verse reflecting on personal and family memory, how would you expect "Papa-T" to be shaped?
    * **Options:** A) In loose, unrhymed free verse rather than a fixed traditional form, B) As a strict fourteen-line sonnet, C) In rhymed heroic couplets, D) As a repeating villanelle refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. Contemporary reflective poems of this kind typically favour loose, unrhymed free verse over a fixed inherited form, letting personal memory shape the lines.
    * **Why B:** A fixed fourteen-line sonnet argument does not suit this kind of open, reflective family memory.
    * **Why C:** Rhymed heroic couplets belong to a more formal, historical register than this reflective piece.
    * **Why D:** A villanelle's repeating refrains do not fit an open reflection on personal memory.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is "Papa-T" most concerned with?
    * **Options:** A) A biblical battle from the ancient world, B) The memory and inheritance carried down through a family, shaped by experiences of displacement and history, C) A national flag as a symbol, D) A photographer's darkroom
    * **Correct:** B
    * **Feedback:** ✓ Correct. D'Aguiar's poem centres on a family figure and the inherited memory of experience shaped by displacement and history.
    * **Why A:** The poem's focus is a personal, family relationship, not an ancient battle.
    * **Why C:** There is no flag or national symbol at the centre of this poem.
    * **Why D:** The poem is concerned with family memory, not a photographer's work.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem reflects on being thirteen years old, growing up amid the pressures and tensions of inner-city life?
    * **Options:** A) Thirteen, B) Envy, C) Boat Stealing, D) Partition
    * **Correct:** A
    * **Feedback:** ✓ Correct. Caleb Femi's "Thirteen" reflects on the experience of being thirteen, growing up within a community shaped by the pressures of inner-city life.
    * **Why B:** Envy is moral counsel on a personal vice, not a coming-of-age reflection.
    * **Why C:** Boat Stealing recalls a rural, solitary childhood memory, not urban adolescence.
    * **Why D:** Partition recalls a mother's memory of the 1947 Partition, not a coming-of-age poem.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** As a contemporary poem reflecting on adolescence and community, how would you expect "Thirteen" to be shaped?
    * **Options:** A) In free verse with a contemporary, reflective voice, rather than a strict historical form, B) As a strict Shakespearean sonnet, C) In rhymed heroic couplets, D) As a repeating villanelle refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. Contemporary reflective poems on adolescence and community typically favour free verse and a direct, present-day voice over an inherited fixed form.
    * **Why B:** A tightly argued fourteen-line sonnet does not suit this open, contemporary reflection.
    * **Why C:** Rhymed heroic couplets belong to a far more formal, historical register.
    * **Why D:** A villanelle's fixed repeating refrains do not fit this open, reflective poem.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Thirteen" ultimately explore?
    * **Options:** A) A biblical battle from the ancient world, B) The experience of coming of age within a community shaped by the tensions of inner-city life, C) A grieving mother visiting a war memorial, D) A soldier's guilt over a killing
    * **Correct:** B
    * **Feedback:** ✓ Correct. Femi's poem explores the experience of growing up at thirteen, within a community shaped by the pressures and tensions of inner-city life.
    * **Why A:** The poem's focus is personal and contemporary, not an ancient battle.
    * **Why C:** There is no grieving mother or war memorial in this poem.
    * **Why D:** The poem is not about a soldier's guilt, but coming of age.
