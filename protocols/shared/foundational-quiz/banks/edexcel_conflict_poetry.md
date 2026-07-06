# Foundational Quiz Bank — Edexcel Conflict Poetry (Poems)

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
- **@set:1** — A Poison Tree · Cousin Kate · Catrin · Extract from The Prelude · The Class Game
- **@set:2** — The Charge of the Light Brigade · Exposure · The Man He Killed · The Destruction of Sennacherib · Belfast Confetti
- **@set:3** — Half-caste · No Problem · What Were They Like? · War Photographer (Satyamurti) · Poppies

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Edexcel Conflict Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does the speaker nurse a hidden anger with tears and smiles until it grows into a poisoned "apple bright" that kills his foe?
   * **Options:** A) A Poison Tree, B) Cousin Kate, C) Catrin, D) The Class Game
   * **Correct:** A
   * **Feedback:** ✓ Correct. Blake's "A Poison Tree" traces how concealed wrath, watered with "fears" and sunned with "smiles", ripens into a poisoned apple that destroys the foe who steals it.
   * **Why B:** Cousin Kate tells of a woman's betrayal by a lord, not a nursed grudge grown into poison.
   * **Why C:** Catrin explores a mother-daughter bond, not buried anger.
   * **Why D:** The Class Game challenges class prejudice, not private wrath.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Blake use for "A Poison Tree", and how does it work against its content?
   * **Options:** A) A dramatic monologue with a silent listener, B) A short lyric of rhyming couplets, whose simple, sing-song form sits uneasily against its dark subject, C) An unrhymed epic in blank verse, D) A fragmented free-verse poem
   * **Correct:** B
   * **Feedback:** ✓ Correct. The neat quatrains and tidy rhyming couplets sound almost like a nursery rhyme, an unsettling contrast with the poem's tale of nursed hatred and death.
   * **Why A:** There is no listener being addressed; the speaker reflects privately on his own feelings.
   * **Why C:** The poem is tightly rhymed and short, not unrhymed epic verse.
   * **Why D:** Its regular rhyme and stanza shape are the opposite of fragmented free verse.

3. **Type: Select All [Tests Meaning & Effects]**
   @set:1
   * **Question:** Which statements correctly describe the meaning and effect of "A Poison Tree" by Blake?
   * **Options:** A) Voicing anger to a friend lets it end, while hiding it from a foe lets it grow, B) The nursed anger is fed with "fears" (tears) and "smiles" (deceit) until it ripens into a poisoned apple, C) The simple, sing-song rhyme heightens the horror of the ending, where the speaker is "glad" to see his foe dead, D) The poem argues that expressing anger openly is always the most dangerous choice
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. Blake shows honest anger dissolving while hidden anger is nursed into poison, its tidy rhyme jarring against the speaker's chilling satisfaction at his foe's death.
   * **Why D:** The poem argues the opposite — concealing and nursing anger is what proves destructive, not voicing it.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Rossetti's poem, the speaker is a "cottage maiden" abandoned by a lord who marries her cousin, [BLANK], instead.
   * **Answer:** Kate
   * **Feedback:** ✓ Correct. The speaker is cast aside once the lord "wearied" of her, marrying her cousin Kate and making her his "queen" while the speaker is left with only her son.
   * **WhyWrong:** The cousin's name is Kate — the poem's title names her as the woman the lord marries instead of the speaker.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does "Cousin Kate" take, and what effect does this have?
   * **Options:** A) A traditional ballad, its regular narrative stanzas and plain rhyme carrying the story of betrayal like a folk tale, B) A Petrarchan sonnet, C) A dramatic monologue with no other characters mentioned, D) Fragmented free verse
   * **Correct:** A
   * **Feedback:** ✓ Correct. Rossetti's ballad form, with its steady rhythm and storytelling stanzas, gives the speaker's personal wrong the weight and reach of a traditional tale of betrayal.
   * **Why B:** The poem tells a story across several stanzas rather than arguing a single case in fourteen lines.
   * **Why C:** The lord and Kate are both directly addressed and described, not absent from a single private voice.
   * **Why D:** Its regular, song-like stanzas are the opposite of fragmented free verse.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What complicates the speaker's position at the end of "Cousin Kate"?
   * **Options:** A) She has nothing left and regrets everything, B) Although shamed as "an unclean thing", she takes pride in her son, a "gift" Kate lacks, complicating simple victimhood, C) She forgives the lord completely, D) She and Kate become friends
   * **Correct:** B
   * **Feedback:** ✓ Correct. Though shamed by society, the speaker asserts a quiet triumph: she has "a gift" — her son — that childless Kate does not have, giving her a measure of defiance alongside her grief.
   * **Why A:** Her pride in her son shows she has not lost everything.
   * **Why C:** She indicts the lord's cruelty rather than forgiving him.
   * **Why D:** The cousins remain rivals; there is no reconciliation in the poem.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem moves between the memory of a hospital birth and a present-day argument with a teenage daughter who wants her independence?
   * **Options:** A) Catrin, B) Cousin Kate, C) The Class Game, D) A Poison Tree
   * **Correct:** A
   * **Feedback:** ✓ Correct. Clarke's "Catrin" links the "hot, white / Room" of childbirth to a later clash with her daughter, who now pushes for freedom of her own.
   * **Why B:** Cousin Kate is a narrative of seduction and betrayal, not a mother-daughter relationship.
   * **Why C:** The Class Game addresses class prejudice, not a parent and child.
   * **Why D:** A Poison Tree concerns private, festering anger, not a family bond.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Catrin" structured?
   * **Options:** A) As a strict sonnet, B) In two free-verse stanzas — the first recalling the birth, the second the present-day conflict — without a fixed rhyme scheme, C) As a rhyming ballad, D) As a villanelle with a repeated refrain
   * **Correct:** B
   * **Feedback:** ✓ Correct. Clarke's two loosely shaped stanzas move between past and present without formal rhyme, letting the poem's tension flow between memory and the ongoing pull of the relationship.
   * **Why A:** The poem does not keep to fourteen lines or a fixed rhyme scheme.
   * **Why C:** There is no ballad-style narrative rhyme or refrain.
   * **Why D:** The poem has no repeating refrain lines, unlike a villanelle.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the recurring image of the "tight red rope of love" convey in "Catrin"?
   * **Options:** A) That the mother and daughter have no connection, B) That love between them is a continuing tug-of-war — binding them together even as they struggle against each other, C) That the daughter resents her mother completely, D) That physical strength decides who wins the conflict
   * **Correct:** B
   * **Feedback:** ✓ Correct. The umbilical image recurs as a "rope" that once physically joined them and now figures their ongoing emotional pull — close and loving, yet a struggle over control and independence.
   * **Why A:** The rope image insists on a deep, continuing connection, not its absence.
   * **Why C:** The tension is loving as well as frustrated, not simple resentment.
   * **Why D:** The conflict is emotional and generational, not a matter of physical strength.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** In which poem does a boy steal a boat at night, only to feel a huge dark peak seem to stride after him across the water?
    * **Options:** A) Extract from The Prelude, B) Catrin, C) The Charge of the Light Brigade, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth's extract from "The Prelude" recounts stealing a boat, then a "huge peak, black and huge" that seems to pursue him, leaving lasting awe and guilt.
    * **Why B:** Catrin is set between a hospital room and a home, not a night lake.
    * **Why C:** The Charge of the Light Brigade recounts a cavalry charge, not a boy alone on water.
    * **Why D:** Belfast Confetti is set amid a riot, not a solitary night on a lake.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** The extract from Wordsworth's "The Prelude" is written in...
    * **Options:** A) Rhyming couplets, B) Blank verse — unrhymed iambic pentameter, in the tradition of epic, C) A strict sonnet, D) Ballad quatrains
    * **Correct:** B
    * **Feedback:** ✓ Correct. Wordsworth uses the unrhymed iambic pentameter of blank-verse epic to raise a personal childhood memory to grand, lasting significance.
    * **Why A:** The poem is unrhymed, unlike the closed couplets of a poem such as Cousin Kate.
    * **Why C:** The extract flows continuously across many lines, not in a fixed fourteen-line sonnet.
    * **Why D:** Its measured blank verse is far from the song-like ballad quatrain.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the mountain episode in "The Prelude" reveal about nature?
    * **Options:** A) Nature is harmless and purely decorative, B) Nature is a powerful, almost moral force that can awe, humble and instruct the human mind, C) Nature is entirely indifferent to people, D) Nature exists only to be conquered
    * **Correct:** B
    * **Feedback:** ✓ Correct. The looming peak leaves the boy with "huge and mighty forms" in his mind, presenting nature as a sublime power that teaches humility and shapes the self.
    * **Why A:** The overwhelming, guilt-inducing peak is the opposite of harmless decoration.
    * **Why C:** Nature acts on him so strongly that indifference cannot be the point.
    * **Why D:** The boy is humbled, not triumphant; nature masters him, not the reverse.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem directly challenges a listener's assumptions about someone based on their class background?
    * **Options:** A) The Class Game, B) A Poison Tree, C) Extract from The Prelude, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mary Casey's "The Class Game" confronts the listener over judging her by class, insisting she cannot be reduced to a label.
    * **Why B:** A Poison Tree concerns private, nursed anger, not class prejudice.
    * **Why C:** The Prelude extract is a memory of nature and guilt, not a challenge about class.
    * **Why D:** Catrin is about a family bond, not class judgement.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "The Class Game" uses a direct, confrontational, first-person voice with colloquial, conversational phrasing, challenging the listener as though in speech.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Casey's speaker addresses the listener head-on in an informal, spoken register, making the challenge to class prejudice feel immediate and personal.
    * **WhyWrong:** This is true — the poem's direct, conversational address puts the listener on the spot, much like a spoken-word confrontation.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What is the central argument of "The Class Game"?
    * **Options:** A) That class background should be celebrated above all else, B) That a person cannot be reduced to assumptions made from their class, accent or background, C) That class no longer exists in society, D) That only one class faces prejudice
    * **Correct:** B
    * **Feedback:** ✓ Correct. The speaker rejects being pre-judged and labelled by class, insisting she should be seen and accepted as herself, not as a stereotype.
    * **Why A:** The poem resists class-based judgement altogether, not celebrating any one class.
    * **Why C:** The poem's whole premise is that class prejudice is still very much alive.
    * **Why D:** The poem's argument is about class prejudice in general, not confined to one group.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem memorialises a doomed cavalry charge, repeating that the soldiers rode "into the valley of Death"?
    * **Options:** A) Exposure, B) The Charge of the Light Brigade, C) The Man He Killed, D) The Destruction of Sennacherib
    * **Correct:** B
    * **Feedback:** ✓ Correct. Tennyson's "The Charge of the Light Brigade" honours the six hundred who rode "into the valley of Death" after "someone had blundered".
    * **Why A:** Exposure depicts soldiers frozen and waiting, not a cavalry charge.
    * **Why C:** The Man He Killed is a soldier's reflective monologue, not a narrative of a charge.
    * **Why D:** The Destruction of Sennacherib recounts an army destroyed overnight by a divine force, not a doomed charge.

17. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "The Charge of the Light Brigade", Tennyson's driving, galloping [BLANK] imitates the sound of the horses charging into battle.
    * **Answer:** rhythm
    * **Feedback:** ✓ Correct. The pounding dactylic rhythm ("Half a league, half a league") gallops like the cavalry, giving the narrative its relentless momentum.
    * **WhyWrong:** The word is "rhythm" — the poem's insistent, galloping metre drives the charge forward and memorialises the soldiers' momentum.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How does Tennyson present the soldiers of the Light Brigade?
    * **Options:** A) As cowards who deserted, B) As heroic and honourable in their obedience, even though a blunder sent them to death, C) As villains who caused the war, D) As victorious conquerors
    * **Correct:** B
    * **Feedback:** ✓ Correct. Tennyson honours the soldiers' courage and duty — "theirs but to do and die" — while quietly acknowledging the fatal blunder of their commanders.
    * **Why A:** The poem celebrates their bravery; they charge despite the error.
    * **Why C:** They are the victims of a blunder, not its cause.
    * **Why D:** The charge is a catastrophe to be honoured, not a victory.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem are soldiers killed not by the enemy but by the "merciless iced east winds", with the refrain "But nothing happens"?
    * **Options:** A) The Man He Killed, B) Exposure, C) Belfast Confetti, D) The Destruction of Sennacherib
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen's "Exposure" shows the true enemy as the freezing weather and endless waiting, punctuated by the hopeless refrain "But nothing happens".
    * **Why A:** The Man He Killed reflects on a single killing, not a whole platoon suffering the cold.
    * **Why C:** Belfast Confetti is set amid a riot and explosion, not frozen trenches.
    * **Why D:** The Destruction of Sennacherib recounts an ancient army's destruction, not modern trench warfare.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "Exposure", Owen uses [BLANK] — near or half-rhyme — to create unease and a sense of things never quite resolving.
    * **Answer:** pararhyme
    * **Feedback:** ✓ Correct. The dissonant pararhyme (near-rhymes that do not fully chime) mirrors the soldiers' suspended, hopeless waiting in the cold.
    * **WhyWrong:** The word is "pararhyme" — Owen's near-rhymes deliberately fail to resolve, deepening the poem's unease.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the central irony of "Exposure"?
    * **Options:** A) The soldiers win a great battle, B) The real enemy is not the opposing army but the weather, boredom and futility of waiting, C) The soldiers are never in any danger, D) The poem celebrates the glory of war
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen subverts the expectation of combat: the men are worn down and killed by cold, inertia and futility rather than by enemy fire.
    * **Why A:** No battle is won; the poem is one of attrition, not victory.
    * **Why C:** Men die of exposure — the danger is real, just not from bullets.
    * **Why D:** Owen exposes war's misery; he does not glorify it.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does an ordinary soldier reflect, in a plain, conversational voice, that he shot a man he might otherwise have shared a drink with "at some old ancient inn"?
    * **Options:** A) The Man He Killed, B) The Charge of the Light Brigade, C) Half-caste, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's speaker imagines he and his victim "should have sat us down to wet / Right many a nipperkin" had they met anywhere but a battlefield.
    * **Why B:** The Charge of the Light Brigade narrates a mass cavalry charge, not one soldier's private reflection.
    * **Why C:** Half-caste confronts prejudice about mixed heritage, not a soldier's guilt.
    * **Why D:** Poppies voices a grieving mother, not a soldier recalling a killing.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "The Man He Killed" takes which form, and what effect does this have?
    * **Options:** A) A dramatic monologue in a plain, conversational voice and simple ballad-like quatrains, exposing the absurdity of killing a stranger, B) A Petrarchan sonnet, C) An epic narrative with many characters, D) A villanelle with a repeated refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The soldier's hesitant, ordinary speech and plain rhyming quatrains let his confusion and unease surface naturally, sharpening the irony of killing a man he might have befriended.
    * **Why B:** The poem is a short spoken monologue, not a fourteen-line argued sonnet.
    * **Why C:** Only one speaker and one incident are described, not an epic cast.
    * **Why D:** There is no repeated refrain line, unlike a villanelle.

24. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "The Man He Killed" by Hardy?
    * **Options:** A) The soldier's hesitant, stumbling reasoning ("Because he was my foe, / Just so") exposes how arbitrary war's violence really is, B) Hardy suggests the two men, met elsewhere, "should have sat us down to wet / Right many a nipperkin" as friends, C) The plain, conversational voice makes an ordinary soldier's confusion feel real and immediate, D) The poem concludes that killing an enemy in war is always a clear, justified duty
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Hardy's soldier fumbles to justify a killing that makes little sense to him, imagining friendship with the very man he shot, his plain voice giving the irony real human weight.
    * **Why D:** The soldier's halting justification reveals doubt and discomfort, not confident certainty that killing was right.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes an army that "came down like the wolf on the fold", destroyed overnight by a divine force rather than in battle?
    * **Options:** A) The Destruction of Sennacherib, B) The Charge of the Light Brigade, C) Exposure, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Byron's poem recounts the Assyrian army's overnight destruction by the "Angel of Death", its might melting away "like snow in the glance of the Lord".
    * **Why B:** The Charge of the Light Brigade narrates a doomed but very real cavalry battle, not divine destruction.
    * **Why C:** Exposure shows soldiers dying slowly of cold, not a single overnight catastrophe.
    * **Why D:** Belfast Confetti is set during a modern riot, not an ancient biblical destruction.

26. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "The Destruction of Sennacherib" is a narrative poem with a galloping, anapestic rhythm and rhyming couplets.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Byron's driving anapestic metre gives the narrative the momentum of charging horses, carrying the story of sudden, overwhelming destruction.
    * **WhyWrong:** This is true — the poem tells its story through rhyming couplets and a galloping anapestic rhythm that drives the narrative forward.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the destruction of the Assyrian army suggest in Byron's poem?
    * **Options:** A) That human military power can be swept aside overnight by a far greater force, B) That the Assyrians won a great victory, C) That war is always decided by superior weapons, D) That the poem celebrates human conquest
    * **Correct:** A
    * **Feedback:** ✓ Correct. The mighty Assyrian host, boastfully arrayed "gleaming in purple and gold", is annihilated in a single night, showing how quickly earthly power can be undone.
    * **Why B:** The army is utterly destroyed, not victorious.
    * **Why C:** The destruction comes from a divine force, not superior human weaponry.
    * **Why D:** The poem shows conquest collapsing into ruin, not something to celebrate.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem turns punctuation marks — exclamation marks, question marks, an asterisk — into images of a riot and explosion in the city?
    * **Options:** A) Belfast Confetti, B) The Man He Killed, C) Cousin Kate, D) A Poison Tree
    * **Correct:** A
    * **Feedback:** ✓ Correct. Carson's "Belfast Confetti" imagines shrapnel and debris "raining" as punctuation, the city's streets becoming "a fusillade of question-marks" as the speaker loses his way.
    * **Why B:** The Man He Killed is a soldier's quiet monologue, not a scene of urban riot.
    * **Why C:** Cousin Kate is a narrative of personal betrayal, not a riot in Belfast.
    * **Why D:** A Poison Tree concerns private, nursed anger, not a public explosion.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What effect does the fragmented free verse of "Belfast Confetti" create?
    * **Options:** A) It creates calm and order, B) Its broken lines and scattered punctuation mirror the chaos, confusion and violence of the explosion and riot, C) It tells a gentle love story, D) It makes the poem comic
    * **Correct:** B
    * **Feedback:** ✓ Correct. Broken lines and disrupted punctuation fall across the page like shrapnel, enacting the disorientation of the blast and its aftermath.
    * **Why A:** The form conveys chaos, not calm or order.
    * **Why C:** The poem depicts violence and confusion, not romance.
    * **Why D:** The effect is disorientating and threatening, not comic.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the speaker's confusion at the end of "Belfast Confetti" — unable to find his way or name his own street — suggest?
    * **Options:** A) That violence disorientates and fractures even someone's sense of their own home and identity, B) That the speaker is simply lost as a tourist, C) That the riot has no lasting effect on him, D) That the poem ends in celebration
    * **Correct:** A
    * **Feedback:** ✓ Correct. The riot doesn't just wreck the streets — it unmakes the speaker's sense of place and self, leaving him unable to answer basic questions about who he is and where he belongs.
    * **Why B:** This is his own home city, not unfamiliar territory to a visitor.
    * **Why C:** His disorientation shows the riot has a deep, lasting effect on him.
    * **Why D:** The ending is unsettling and fractured, not celebratory.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem confronts the listener directly over the term "half-caste", using examples like mixed colours in a painting and mixed weather?
    * **Options:** A) Half-caste, B) No Problem, C) What Were They Like?, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Agard's "Half-caste" challenges the listener to "explain yuself" over the label, pointing to how painters mix colours and English weather mixes grey and sun without being called "half".
    * **Why B:** No Problem challenges being seen as a stereotype or "problem", not the specific term "half-caste".
    * **Why C:** What Were They Like? mourns a lost culture through a question-and-answer structure, not a direct challenge over a label.
    * **Why D:** Poppies voices a grieving mother, not a challenge about mixed heritage.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the loose, phonetic-spelling form of "Half-caste" serve its meaning?
    * **Options:** A) It shows the speaker cannot write standard English, B) It acts as resistance, using the speaker's own voice and rhythm to reject the imposed, reductive label "half-caste", C) It has no effect on meaning, D) It makes the poem a traditional sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The dialect spelling and free, conversational rhythm assert the speaker's own identity and voice, refusing to accept a label imposed by someone else.
    * **Why A:** The non-standard spelling is a deliberate, purposeful choice, not a failing.
    * **Why C:** The form is central to the poem's act of resistance and self-assertion.
    * **Why D:** The poem rejects fixed traditional forms like the sonnet in favour of a free, spoken voice.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Half-caste" ultimately demand of the listener?
    * **Options:** A) That they apologise and say nothing further, B) That they return and see the speaker with "de whole of yu eye… an de whole of yu mind" — as a complete person, not a fraction, C) That they adopt the speaker's language exactly, D) That they avoid all further contact
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem ends by demanding the listener engage fully and honestly, seeing the speaker as whole rather than reducing him to a partial, demeaning label.
    * **Why A:** The poem demands genuine reconsideration, not silence.
    * **Why C:** The demand is for full recognition of the speaker's humanity, not imitation of his speech.
    * **Why D:** The poem insists on renewed, fuller engagement, not avoidance.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, in a confident, performance-style voice, rejects being seen as a "problem" because of racial stereotyping?
    * **Options:** A) No Problem, B) Half-caste, C) The Class Game, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zephaniah's speaker asserts his own identity with confidence and defiance, refusing the label of "problem" that racist assumptions try to attach to him.
    * **Why B:** Half-caste challenges the specific term "half-caste" and mixed heritage, a related but distinct target.
    * **Why C:** The Class Game challenges prejudice based on social class, not race.
    * **Why D:** Belfast Confetti describes a riot and its disorientating aftermath, not racial stereotyping.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "No Problem" uses a loose, spoken-word style with a confident, direct first-person voice, in the tradition of performance poetry.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Zephaniah, known for performance and dub poetry, gives the speaker a rhythmic, spoken-word voice that suits his confident, public rejection of stereotyping.
    * **WhyWrong:** This is true — the poem's loose, rhythmic, spoken-word style reflects Zephaniah's performance-poetry roots and suits its confident, confrontational tone.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the overall stance of the speaker in "No Problem"?
    * **Options:** A) Apologetic and ashamed of his background, B) Self-assured and defiant, asserting his identity and achievements against those who stereotype him, C) Indifferent to how he is perceived, D) Angry only at other members of his own community
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rather than apologising for who he is, the speaker meets prejudice with pride and self-assurance, standing his ground against being reduced to a stereotype.
    * **Why A:** The tone is confident and unapologetic, not ashamed.
    * **Why C:** The speaker cares enough to directly confront the stereotyping he faces.
    * **Why D:** His challenge is aimed at those who stereotype him, not at his own community.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is structured as a series of questions and answers about a culture largely destroyed by war, such as whether its people "held ceremonies to reverence the opening of buds"?
    * **Options:** A) What Were They Like?, B) The Man He Killed, C) Catrin, D) The Class Game
    * **Correct:** A
    * **Feedback:** ✓ Correct. Levertov's poem poses questions about a devastated culture — its customs, laughter, poetry — and answers them with the quiet devastation of war's aftermath.
    * **Why B:** The Man He Killed is a single soldier's monologue, not a question-and-answer structure about a whole culture.
    * **Why C:** Catrin concerns a personal, family relationship, not a lost civilisation.
    * **Why D:** The Class Game addresses class prejudice through direct address, not a Q&A elegy for a destroyed culture.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "What Were They Like?" structured?
    * **Options:** A) As a series of questions from one voice, answered by another, giving the poem the shape of an elegy or interrogation about a vanished people, B) As a strict rhyming sonnet, C) As a single unbroken narrative told in order, D) As a villanelle with a repeated refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The question-and-answer form gives the poem the feel of a testimony or elegy, mourning a culture that can now only be recalled in fragments, if at all.
    * **Why B:** The poem is built from free-verse questions and answers, not a fixed rhyming sonnet.
    * **Why C:** Its Q&A structure interrupts straightforward narrative telling.
    * **Why D:** There is no repeated refrain line, unlike a villanelle.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the uncertainty in the answers of "What Were They Like?" — "It is not remembered" — suggest?
    * **Options:** A) That the culture's traditions and gentle ways of life have been erased almost entirely by war, B) That the culture never had any traditions worth recording, C) That the war caused no lasting damage, D) That the answers are simply forgetful rather than devastating
    * **Correct:** A
    * **Feedback:** ✓ Correct. The hesitant, incomplete answers imply that war has destroyed not just lives but memory itself — a whole way of life reduced to fragments and silence.
    * **Why B:** The questions imply rich traditions once existed; it is their loss that is mourned.
    * **Why C:** The uncertain, broken answers point to devastating, lasting damage.
    * **Why D:** The forgetting is presented as a consequence of destruction, not simple absent-mindedness.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem centres on a war photographer, contrasting the horror of what his images show with the reactions of those who view them?
    * **Options:** A) War Photographer, B) Belfast Confetti, C) The Destruction of Sennacherib, D) A Poison Tree
    * **Correct:** A
    * **Feedback:** ✓ Correct. Satyamurti's "War Photographer" sets the suffering captured in the photographer's images against the more detached, distanced responses of those who later view them.
    * **Why B:** Belfast Confetti is the speaker's own first-hand experience of a riot, not a photographer's images of it.
    * **Why C:** Sennacherib recounts an ancient battle narrative, not a modern photographer's work.
    * **Why D:** A Poison Tree concerns private anger, not war photography.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What effect does Satyamurti create by structuring the poem around contrast?
    * **Options:** A) It shows the photographer's world of suffering has no connection to any other, B) It juxtaposes the reality the photographer has witnessed with the more comfortable distance of those who later encounter the images, sharpening the poem's unease, C) It makes the poem read as a straightforward celebration of photography, D) It removes any sense of the photographer's own feelings
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's structure holds the photographer's direct experience of suffering against the more removed reactions of an audience encountering it afterwards, exposing the gap between the two.
    * **Why A:** The contrast is the poem's whole point — connecting two very different responses to the same suffering.
    * **Why C:** The poem is unsettling rather than celebratory in tone.
    * **Why D:** The photographer's own discomfort and complex feelings run through the poem.

42. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "War Photographer" by Satyamurti explores the uneasy gap between witnessing suffering directly and encountering it only as a distant image.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem probes the difference between the photographer's direct, visceral experience of conflict and the more detached way that suffering is later received by others.
    * **WhyWrong:** This is true — the poem's central concern is that unsettling gap between direct witness and distanced reception of suffering.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem voices a mother preparing to visit a war memorial, days "before Armistice Sunday", after her son has gone?
    * **Options:** A) Poppies, B) Catrin, C) Cousin Kate, D) What Were They Like?
    * **Correct:** A
    * **Feedback:** ✓ Correct. Weir's "Poppies" follows a mother pinning a poppy to her son's blazer and later tracing "the inscriptions on the war memorial" in his absence.
    * **Why B:** Catrin is about a mother and a living daughter's push for independence, not a son gone to war.
    * **Why C:** Cousin Kate concerns betrayal by a lord, not a mother's grief for a son.
    * **Why D:** What Were They Like? mourns a whole vanished culture, not one mother's personal loss.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the form of "Poppies" by Weir suit its subject?
    * **Options:** A) A strict sonnet argues a case, B) Free verse, with the drift of interior monologue, conveys a mother's private, wandering grief, C) A ballad refrain tells a heroic story, D) A villanelle's repetition celebrates victory
    * **Correct:** B
    * **Feedback:** ✓ Correct. The loose free verse and inward, monologue-like voice let the mother's grief drift naturally between memory and present, like an elegy for her son.
    * **Why A:** The poem flows like private thought, not a tightly argued sonnet.
    * **Why C:** It is an intimate elegy of grief, not a heroic ballad.
    * **Why D:** It mourns rather than celebrates, and is not a villanelle.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Poppies" by Weir?
    * **Options:** A) It explores the impact of war from the perspective of a mother left at home, rather than from the battlefield, B) The poppy and the war memorial anchor her private grief to a wider, public act of remembrance, C) The free-verse, interior-monologue form lets her memories and present grief blend together, D) It concludes that the mother feels no lasting connection to her son once he has gone
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Weir centres a mother's private grief on the home front, ties it to the public ritual of the poppy and memorial, and lets free verse blend memory and present loss.
    * **Why D:** The poem shows an enduring, aching bond with her son, not a loss of connection.
