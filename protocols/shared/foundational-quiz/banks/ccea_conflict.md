# Foundational Quiz Bank — CCEA GCSE Literature Conflict Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
45 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. This
replaces the earlier forms-only pass on this anthology: these questions are poem-specific,
testing what the student has actually read, rather than generic form definitions (those live
in the universal forms bank, `poetic_forms.md`, Tier A). The picker draws a random 5 per
round, stratified across categories. Keys + feedback live server-side and are stripped before
questions reach the client. The AI is never the scorekeeper.

Categories: Recognising the Poem · Form & Features · Meaning & Effects
Types: MCQ · Fill · True-False · Select All

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the
course's reading order, so the quiz only serves poems the student has read:
- **@set:1** — The Charge of the Light Brigade (Tennyson) · Vitaï Lampada (Newbolt) · Who's for the Game? (Pope) · The Man He Killed (Hardy) · An Irish Airman Foresees His Death (Yeats)
- **@set:2** — Anthem for Doomed Youth (Owen) · Bayonet Charge (Hughes) · Vergissmeinnicht (Douglas) · Mametz Wood (Sheers) · Requiem for the Croppies (Heaney)
- **@set:3** — Poppies (Weir) · Last Post (Duffy) · Easter Monday, In Memoriam E.T. (Farjeon) · What lips my lips have kissed, and where, and why (Millay) · Out of the Blue – 12 (Armitage)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: CCEA Conflict Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem repeatedly sends six hundred cavalrymen "into the valley of Death" after a fatal order is given in error?
   * **Options:** A) The Charge of the Light Brigade, B) Vitaï Lampada, C) An Irish Airman Foresees His Death, D) Bayonet Charge
   * **Correct:** A
   * **Feedback:** ✓ Correct. Tennyson's "The Charge of the Light Brigade" sends the six hundred riding "into the valley of Death" after "someone had blundered", honouring their obedience even as the command fails them.
   * **Why B:** Vitaï Lampada uses a cricket match and a desert square, not a cavalry charge.
   * **Why C:** An Irish Airman Foresees His Death is a pilot's solitary reflection, not a mass cavalry charge.
   * **Why D:** Bayonet Charge follows one panicked infantryman on foot, not six hundred horsemen.

2. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "The Charge of the Light Brigade" is carried forward by a driving, galloping rhythm and a repeated refrain ("the valley of Death", "the six hundred") that returns stanza after stanza.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tennyson's insistent dactylic rhythm mimics galloping horses, while the repeated refrain propels the doomed charge relentlessly onward through each stanza.
   * **WhyWrong:** This is true — the poem's driving rhythm and its repeated refrain are exactly what carry the charge forward stanza by stanza.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What effect does Tennyson create by honouring the soldiers' courage while also noting that "someone had blundered"?
   * **Options:** A) He blames the soldiers for the disaster, B) He holds admiration for the men's obedience and courage alongside quiet criticism of the command that doomed them, C) He presents the charge as a great military victory, D) He mocks the soldiers as foolish
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tennyson lets pride in the men's discipline ("theirs but to do and die") sit alongside the unavoidable fact of a fatal command error, so honour and criticism of leadership coexist.
   * **Why A:** The blame falls on the blundering command, not on the obedient soldiers.
   * **Why C:** The charge ends in slaughter, not a celebrated victory.
   * **Why D:** The poem's tone is reverent towards the men, not mocking.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens on a school cricket pitch — "Ten to make and the match to win" — before extending the same code of honour to a desert battlefield?
   * **Options:** A) Vitaï Lampada, B) Who's for the Game?, C) The Man He Killed, D) Anthem for Doomed Youth
   * **Correct:** A
   * **Feedback:** ✓ Correct. Newbolt's "Vitaï Lampada" begins with a tense cricket finish, then carries the same schoolboy code of honour onto a desert square under fire.
   * **Why B:** Who's for the Game? uses rhetorical questions about enlisting, not a cricket match extended into war.
   * **Why C:** The Man He Killed is a soldier's private monologue, not a cricket-to-battlefield extended metaphor.
   * **Why D:** Anthem for Doomed Youth opens with the sounds of the guns, not a cricket pitch.

5. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** Every stanza of "Vitaï Lampada" closes on the same [BLANK] — "Play up! play up! and play the game!" — carrying the cricket-field cry into the desert battle.
   * **Answer:** refrain
   * **Feedback:** ✓ Correct. The repeated refrain, unchanged from the cricket pitch to the battlefield, is exactly what welds sporting code to duty under fire.
   * **WhyWrong:** The word is "refrain" — the repeated line that closes every stanza and carries the schoolboy cry into war.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the survival of the same refrain from cricket pitch to battlefield reveal about the poem's attitude to war?
   * **Options:** A) It questions whether the schoolboy code of honour has any place on a real battlefield, B) It transfers the code uncritically, treating duty in war as a natural extension of sporting spirit rather than something to be doubted, C) It reveals the speaker regretting ever having played cricket, D) It proves the soldiers refuse to fight
   * **Correct:** B
   * **Feedback:** ✓ Correct. Newbolt carries the cricketing cry straight into the "sand of the desert" without irony, treating patriotic duty as a natural extension of schoolboy sportsmanship rather than something the poem questions.
   * **Why A:** The poem endorses the transfer rather than doubting it.
   * **Why C:** The speaker treats the code with pride, not regret.
   * **Why D:** The refrain rallies broken ranks to keep fighting, not to refuse.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem presses the reader with a string of rhetorical questions — asking who will "grip and tackle" the job and "who wants a seat in the stand" — to shame young men into enlisting?
   * **Options:** A) Who's for the Game?, B) The Man He Killed, C) An Irish Airman Foresees His Death, D) Requiem for the Croppies
   * **Correct:** A
   * **Feedback:** ✓ Correct. Pope's "Who's for the Game?" stacks question after question, dressing enlistment as sport so that sitting it out looks like shameful cowardice.
   * **Why B:** The Man He Killed is a quiet, doubting monologue, not a barrage of recruiting questions.
   * **Why C:** An Irish Airman Foresees His Death is inward and fatalistic, without a recruiting purpose.
   * **Why D:** Requiem for the Croppies recalls a defeated 1798 Irish rebellion, not a recruitment appeal.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the form of "Who's for the Game?" suit its purpose?
   * **Options:** A) Brisk, tightly rhymed quatrains built from rhetorical questions give it the jaunty push of a recruiting poster, B) Loose free verse conveys private uncertainty, C) A single unbroken sonnet argues a careful case, D) Seven unrhymed tercets let ideas surface slowly
   * **Correct:** A
   * **Feedback:** ✓ Correct. The brisk, sing-song quatrains and their stacked questions give the poem the confident, upbeat push of a recruitment poster set to verse.
   * **Why B:** The poem is confidently public and rhymed, not a private, loose reflection.
   * **Why C:** It is built from short rhyming stanzas, not a single fourteen-line sonnet.
   * **Why D:** Unrhymed tercets describe Mametz Wood, not this brisk, rhymed recruiting verse.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the effect of dressing war up as "the biggest game" that is played?
   * **Options:** A) It exposes the true horror and futility of trench warfare, B) It makes joining the army sound exciting and honourable, pressuring readers to enlist rather than be left out of the game, C) It criticises the government for starting the war, D) It mourns soldiers already killed
   * **Correct:** B
   * **Feedback:** ✓ Correct. Framing war as sport makes it sound thrilling and honourable, so the poem pressures young men to enlist rather than risk the shame of being left on the sidelines.
   * **Why A:** The poem glamorises war rather than exposing its horror.
   * **Why C:** Pope's target is the reluctant reader, not the government.
   * **Why D:** The tone is recruiting and upbeat, not mourning the dead.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem has a soldier reflect, in his own halting words, that he shot a man who might otherwise have stood him a drink at an old country inn?
    * **Options:** A) The Man He Killed, B) Vergissmeinnicht, C) Bayonet Charge, D) Out of the Blue – 12
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "The Man He Killed" has a soldier reason, hesitantly, that had he met his victim "by some old ancient inn" they might have shared a drink instead of gunfire.
    * **Why B:** Vergissmeinnicht concerns a dead German gunner found after the fact, not a soldier musing on an inn meeting.
    * **Why C:** Bayonet Charge is a single charge told from inside a soldier's panic, not a reflective monologue.
    * **Why D:** Out of the Blue – 12 concerns a man trapped in a burning tower, not a soldier and his enemy.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "The Man He Killed" delivered?
    * **Options:** A) As a formal sonnet addressed to a silent listener, B) As a plain, conversational dramatic monologue in five rhyming quatrains, its dashes and qualifications catching a man thinking aloud, C) As a chorus of many soldiers' voices, D) As an unrhymed sequence of tercets
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hardy's five quatrains keep an ordinary, spoken rhythm, and the dashes and self-corrections ("because— / Because he was my foe") catch the soldier working out his own logic as he speaks.
    * **Why A:** The poem is plain-spoken, not the elevated form of a sonnet.
    * **Why C:** It is one man's private voice, not a chorus.
    * **Why D:** The stanzas are rhymed quatrains, not unrhymed tercets.

12. **Type: True-False [Tests Meaning & Effects]**
    @set:1
    * **Question:** The soldier's hesitant, self-correcting speech in "The Man He Killed" exposes the arbitrary illogic of killing a man who, in different circumstances, could have been a friend.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The soldier's stumbling justifications reveal that only the accident of being enemies made killing seem reasonable — the poem exposes how thin and arbitrary that logic really is.
    * **WhyWrong:** This is true — the halting, self-correcting reasoning is exactly how Hardy exposes the arbitrary illogic of the killing.

13. **Type: Fill [Tests Recognising the Poem]**
    @set:1
    * **Question:** In Yeats's poem, the pilot claims he fights from neither hatred nor duty but from a [BLANK] impulse, a pure joy in flying rather than any political cause.
    * **Answer:** lonely
    * **Feedback:** ✓ Correct. The airman fights only from "a lonely impulse of delight" — a private thrill in flight, detached from patriotism or hatred of any enemy.
    * **WhyWrong:** The word is "lonely" — the airman's "lonely impulse of delight" is his one true motive, not duty or hatred.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "An Irish Airman Foresees His Death" shaped?
    * **Options:** A) A single unbroken stanza in steady iambic tetrameter with alternating rhyme, B) A sonnet with an octave and sestet, C) Six quatrains of half-rhyme, D) A ballad with a repeated refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem runs as one continuous sixteen-line stanza, its even tetrameter and alternating rhyme giving the airman's fatalistic balancing of life and death a calm, measured control.
    * **Why B:** An octave-and-sestet turn belongs to a sonnet, such as Anthem for Doomed Youth, not this single stanza.
    * **Why C:** Six quatrains of half-rhyme describe Vergissmeinnicht, not this poem.
    * **Why D:** There is no repeated refrain driving the airman's private reflection.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "An Irish Airman Foresees His Death"?
    * **Options:** A) The airman feels no hatred for those he fights and no love for those he supposedly defends, B) He weighs the years he has already lived against the years he might still have, and finds both "a waste of breath", C) His true motive is a private, almost joyful impulse to fly, detached from any political cause, D) The poem ends with the airman refusing to fly again
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Yeats detaches the airman from hatred and love alike, has him weigh past and future years and find both wanting, and roots his real motive in a private "lonely impulse of delight" rather than any cause.
    * **Why D:** The poem foresees the airman's death in the air, not a refusal ever to fly.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem asks "What passing-bells for these who die as cattle?", answering that only the guns provide their funeral rites?
    * **Options:** A) Anthem for Doomed Youth, B) Bayonet Charge, C) Requiem for the Croppies, D) Last Post
    * **Correct:** A
    * **Feedback:** ✓ Correct. Owen's "Anthem for Doomed Youth" opens by asking what "passing-bells" mark the deaths of men who die "as cattle", answering that only the "monstrous anger of the guns" rings for them.
    * **Why B:** Bayonet Charge follows one soldier's panicked advance, not a meditation on funeral rites.
    * **Why C:** Requiem for the Croppies recalls a defeated Irish rebellion, not the sound of "passing-bells".
    * **Why D:** Last Post imagines reversing time for the WWI dead, not asking what marks their deaths.

17. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Anthem for Doomed Youth" is a [BLANK] whose octave answers its opening question with the sounds of war before the turn brings the sestet home to quiet mourning.
    * **Answer:** sonnet
    * **Feedback:** ✓ Correct. The poem's fourteen lines form a sonnet, its octave giving the guns' "monstrous anger" before the volta turns to candles and mourners at home.
    * **WhyWrong:** The word is "sonnet" — its octave answers the battlefield's noise, then the turn brings the sestet home to private grief.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What contrast does "Anthem for Doomed Youth" draw between its octave and its sestet?
    * **Options:** A) The mechanised violence of the battlefield, where men die "as cattle", against the quiet, private grief of mourners at home, B) A joyful victory against a shameful defeat, C) Two rival soldiers arguing over tactics, D) A peaceful garden against a stormy sea
    * **Correct:** A
    * **Feedback:** ✓ Correct. Owen sets the dehumanising noise of "the monstrous anger of the guns" against the hushed, personal mourning of "each slow dusk a drawing-down of blinds", weighing public slaughter against private loss.
    * **Why B:** The poem is a lament, not a tale of victory and defeat.
    * **Why C:** There is no dialogue between soldiers here, only Owen's own meditation.
    * **Why D:** The contrast is between battlefield and home, not garden and sea.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem plunges straight into a soldier's terror with "Suddenly he awoke and was running", his patriotism dissolving as he charges?
    * **Options:** A) Bayonet Charge, B) The Charge of the Light Brigade, C) Vergissmeinnicht, D) Mametz Wood
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hughes's "Bayonet Charge" opens in the middle of the action — "Suddenly he awoke and was running" — as the soldier's patriotic feeling burns away into raw animal instinct.
    * **Why B:** The Charge of the Light Brigade recounts a mounted cavalry charge, not one infantryman's inner panic.
    * **Why C:** Vergissmeinnicht is set after a killing, examining the dead man, not a live charge.
    * **Why D:** Mametz Wood looks back years afterwards at buried remains, not an unfolding charge.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the structure of "Bayonet Charge" mirror its subject?
    * **Options:** A) Its fragmented, in-medias-res free verse and jolting enjambment enact the soldier's disorientation and the collapse of his heroic ideals, B) Its calm, ordered sonnet argues a clear case, C) Its ballad refrain celebrates a heroic victory, D) Its steady rhyming couplets create smooth control
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hughes drops the reader mid-action and fractures the lines with jolting enjambment, the disordered form itself mirroring the soldier's disorientation as patriotic certainty collapses.
    * **Why B:** The poem is deliberately disordered, not a calm, argued sonnet.
    * **Why C:** There is no celebratory refrain; the tone is terror, not triumph.
    * **Why D:** Its jolting form resists the smooth control of rhyming couplets.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Bayonet Charge", the soldier's patriotism dissolves under fire, replaced by raw instinct, while the wounded hare comes to stand for war's indifferent damage to the natural world.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The abstract "patriotic tear" burns away into bare survival instinct, and the yellow hare that "rolled like a flame" casts nature as collateral caught up in a violence that has no regard for it.
    * **WhyWrong:** This is true — patriotism collapses into instinct, and the hare's suffering figures nature as an indifferent casualty of the charge.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes soldiers returning three weeks later to find a dead German gunner beside a photograph of his girlfriend, inscribed "Steffi. Vergissmeinnicht"?
    * **Options:** A) Vergissmeinnicht, B) Mametz Wood, C) The Man He Killed, D) Anthem for Doomed Youth
    * **Correct:** A
    * **Feedback:** ✓ Correct. Douglas's "Vergissmeinnicht" has soldiers return to the "nightmare ground" to find the gunner they killed, his sweetheart's photograph beside him inscribed "Steffi. Vergissmeinnicht" — forget-me-not.
    * **Why B:** Mametz Wood concerns Welsh soldiers' remains surfacing years later from a ploughed field, not a single gunner found soon after death.
    * **Why C:** The Man He Killed is a soldier's private monologue about an enemy he never sees again, not a body examined in detail.
    * **Why D:** Anthem for Doomed Youth mourns soldiers in general through sonnet form, without this specific scene.

23. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Vergissmeinnicht" is built from six [BLANK] of cool, almost documentary observation, its detached tone at odds with the intimacy of what it describes.
    * **Answer:** quatrains
    * **Feedback:** ✓ Correct. The six four-line quatrains keep an eerily level, documentary tone even as they describe a decaying body beside a lover's photograph.
    * **WhyWrong:** The word is "quatrains" — six four-line stanzas whose cool, observational tone contrasts with the intimacy of the scene.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does Douglas mean by writing that "the lover and killer are mingled / who had one body and one heart"?
    * **Options:** A) That the dead gunner was simultaneously someone's beloved and an enemy killer, so tenderness and violence cannot be neatly separated, B) That the speaker has fallen in love with the dead man, C) That two different soldiers share one grave, D) That love always defeats hatred in war
    * **Correct:** A
    * **Feedback:** ✓ Correct. The same man who fired on the speaker's tank was also cherished enough to carry a sweetheart's photograph — Douglas fuses tenderness and violence in one body, complicating any simple hatred of "the enemy".
    * **Why B:** The line describes the dead soldier's own dual nature, not the speaker's feelings towards him.
    * **Why C:** One gunner's body is described, not two soldiers sharing a grave.
    * **Why D:** The poem holds love and violence together in tension; neither simply defeats the other.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem has farmers, years afterwards, keep finding the bones of "the wasted young" surfacing under their plough blades?
    * **Options:** A) Mametz Wood, B) Requiem for the Croppies, C) Vergissmeinnicht, D) The Charge of the Light Brigade
    * **Correct:** A
    * **Feedback:** ✓ Correct. Sheers's "Mametz Wood" describes farmers still finding "the wasted young, turning up under their plough blades" long after the Welsh soldiers who died there were buried.
    * **Why B:** Requiem for the Croppies recalls a defeated 1798 Irish rebellion, not remains surfacing in ploughed fields decades later.
    * **Why C:** Vergissmeinnicht finds a body soon after death, not remains surfacing years afterwards.
    * **Why D:** The Charge of the Light Brigade honours a cavalry charge, not buried remains found by farmers.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What form does Sheers use for "Mametz Wood", and how does it suit the subject?
    * **Options:** A) Seven unrhymed three-line tercets, their broken shape suiting the fragments of the dead surfacing from the earth, B) A single rhymed sonnet, C) A ballad built on a repeated refrain, D) Six quatrains of half-rhyme
    * **Correct:** A
    * **Feedback:** ✓ Correct. The seven unrhymed tercets, broken across stanza and line, mirror the fragmented bones — "a chit of bone, the china plate of a shoulder blade" — surfacing piece by piece from the ploughed field.
    * **Why B:** The poem runs far longer than fourteen lines and follows no sonnet rhyme.
    * **Why C:** There is no repeated refrain driving a narrative here.
    * **Why D:** Six quatrains of half-rhyme describe Vergissmeinnicht, not this poem.

27. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** The broken, fragmented imagery of bone in "Mametz Wood" reflects how war reduces individual young men to scattered, unresolved pieces that the land continues to surface long after the battle.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Images such as "a chit of bone" and "the blown and broken bird's egg of a skull" reduce whole young lives to scattered fragments that the earth keeps yielding up, unresolved, for years afterwards.
    * **WhyWrong:** This is true — the poem's broken bone imagery reduces individual lives to fragments that surface, unresolved, long after the battle.

28. **Type: Fill [Tests Recognising the Poem]**
    @set:2
    * **Question:** In Heaney's poem, the rebels move quickly and secretly through their own country with "the pockets of our greatcoats full of [BLANK]".
    * **Answer:** barley
    * **Feedback:** ✓ Correct. The rebels carry seed barley in their pockets as they fight — grain that, planted by nothing but their own burial, grows up from the grave by the poem's close.
    * **WhyWrong:** The word is "barley" — the seed the rebels carry, which later grows from their grave.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "Requiem for the Croppies" shaped?
    * **Options:** A) As a fourteen-line sonnet compressed into one unbroken, driving stanza, its scarce punctuation and enjambment matching the rebels' rapid, guerrilla movement, B) As a set of six rhymed quatrains, C) As seven unrhymed tercets, D) As a loose free-verse monologue
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney fits the poem's fourteen lines into a single unbroken sonnet-stanza, its onward enjambment and scarce punctuation carrying the same quick, guerrilla momentum as the rebels themselves.
    * **Why B:** Six rhymed quatrains describe Vergissmeinnicht, not this compressed single-stanza sonnet.
    * **Why C:** Seven unrhymed tercets describe Mametz Wood, not this poem.
    * **Why D:** The poem holds a tight fourteen-line sonnet shape, not loose, unstructured free verse.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "Requiem for the Croppies"?
    * **Options:** A) The rebels are defeated at Vinegar Hill, cut down while "shaking scythes at cannon", B) The barley growing from their grave figures their cause and memory surviving physical defeat, C) Heaney uses the sonnet — a form linked to order and love — to commemorate violent rebellion rather than romance, D) The poem celebrates the British forces who won the battle
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. The rebels fall at Vinegar Hill against cannon, yet the barley rising from their grave figures their cause outliving defeat, and Heaney turns the sonnet — usually a form of order or love — to commemorate rebellion instead.
    * **Why D:** The poem mourns and honours the defeated rebels; it does not celebrate the forces who crushed them.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a mother pinning a poppy to her son's blazer before he leaves, later tracing the inscriptions on a war memorial in his absence?
    * **Options:** A) Poppies, B) Last Post, C) Easter Monday, In Memoriam E.T., D) Anthem for Doomed Youth
    * **Correct:** A
    * **Feedback:** ✓ Correct. Weir's "Poppies" follows a mother pinning a poppy to her son's blazer, then later tracing "the inscriptions on the war memorial" once he has gone.
    * **Why B:** Last Post imagines reversing time for soldiers already dead, not a mother's present-day leave-taking.
    * **Why C:** Easter Monday is addressed directly to a friend killed in the First World War, not a mother and son.
    * **Why D:** Anthem for Doomed Youth mourns soldiers in general through sonnet form, without this mother-and-son scene.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the form of "Poppies" suit its subject?
    * **Options:** A) Free verse, with the drift of interior monologue, conveys a mother's private, wandering grief, B) A strict sonnet argues a formal case, C) A ballad refrain tells a heroic story, D) A villanelle's repetition celebrates victory
    * **Correct:** A
    * **Feedback:** ✓ Correct. The loose free verse and inward, monologue-like voice let the mother's grief drift naturally between memory and present, unconfined by any fixed pattern.
    * **Why B:** The poem flows like private thought, not a tightly argued sonnet.
    * **Why C:** It is an intimate account of grief, not a heroic ballad.
    * **Why D:** It mourns rather than celebrates, and is not a villanelle.

33. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "Poppies" shifts the focus of war's cost onto the home front, exploring a mother's private, ongoing grief rather than combat itself.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Weir keeps the battlefield entirely offstage, dwelling instead on the mother's ache, memory and loss — war's cost measured through those left behind.
    * **WhyWrong:** This is true — the poem centres the mother left behind, showing war's grief through the home front rather than the battlefield.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem imagines time running backwards so that soldiers killed in the First World War live again, in direct dialogue with Owen's "Dulce et Decorum Est"?
    * **Options:** A) Last Post, B) Requiem for the Croppies, C) Anthem for Doomed Youth, D) Mametz Wood
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "Last Post" imagines rewinding a gas attack and the years that follow, restoring to the dead a life of "love, work, children, talent, English beer, good food", in direct dialogue with Owen's "Dulce et Decorum Est".
    * **Why B:** Requiem for the Croppies looks back at a defeated 1798 rebellion, without this reversing-time conceit.
    * **Why C:** Anthem for Doomed Youth mourns the dead through sonnet form, without imagining them restored to life.
    * **Why D:** Mametz Wood looks at remains surfacing from the earth, not time reversing to undo death.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Last Post" is structured around the conceit of running events [BLANK] — undoing a gas attack and the years since — rather than following a fixed rhyme scheme.
    * **Answer:** backwards
    * **Feedback:** ✓ Correct. The poem's organising idea is to run time backwards, unwinding the gas attack and its aftermath so that the dead briefly live again, more than any fixed metrical pattern.
    * **WhyWrong:** The word is "backwards" — the poem's structure rests on reversing events, not on a set rhyme scheme.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the impossible reversal at the heart of "Last Post" ultimately suggest?
    * **Options:** A) That war can be genuinely undone if we try hard enough, B) That imagining the dead restored only underlines how completely and irrecoverably war has taken from them, C) That the soldiers were never really in danger, D) That poetry has no power to affect how we see war
    * **Correct:** B
    * **Feedback:** ✓ Correct. By imagining what cannot happen — the dead living out "love, work, children" — Duffy makes the true, irreversible scale of war's loss felt all the more sharply.
    * **Why A:** The reversal is explicitly impossible; the poem registers loss, not genuine undoing.
    * **Why C:** The men are shown dying from a gas attack; the danger was real.
    * **Why D:** The poem itself demonstrates poetry's power to reframe how war's cost is felt.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is addressed directly to a friend killed at the Front, recalling his last letter and an Easter egg, set against ordinary garden seeds being sown at home?
    * **Options:** A) Easter Monday, In Memoriam E.T., B) What lips my lips have kissed, and where, and why, C) Poppies, D) Vergissmeinnicht
    * **Correct:** A
    * **Feedback:** ✓ Correct. Farjeon's "Easter Monday, In Memoriam E.T." speaks directly to Edward Thomas, recalling his last letter and a hidden Easter egg, set against sowing seeds in the garden at home — before the closing admission that "there are three letters that you will not get".
    * **Why B:** Millay's sonnet mourns forgotten lovers in general, not one named friend killed in battle.
    * **Why C:** Poppies is spoken by a mother about her son, not addressed to a named poet-friend.
    * **Why D:** Vergissmeinnicht examines an enemy soldier's body, not a friend addressed directly in an elegy.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does "Easter Monday, In Memoriam E.T." deliver its elegy?
    * **Options:** A) As an intimate direct address to the dead friend himself, in plain, conversational language rather than grand or formal diction, B) As a public ballad performed for a crowd, C) As an anonymous third-person report, D) As a rigid villanelle with two refrains
    * **Correct:** A
    * **Feedback:** ✓ Correct. Farjeon speaks straight to Edward Thomas as "you", in the plain, conversational language of a private letter, which makes the closing revelation of his death land as quiet, personal pathos rather than public rhetoric.
    * **Why B:** The poem is private and addressed to one person, not performed for a public audience.
    * **Why C:** It is a direct, personal "you", not a distanced, anonymous report.
    * **Why D:** It has no repeating refrains; its force lies in plain, direct address, not a villanelle's formal repetition.

39. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** The ordinary, domestic details in "Easter Monday" — sowing garden seeds, an Easter egg, a letter — make the friend's death at war feel more devastating through understatement rather than direct description.
    * **Answer:** True
    * **Feedback:** ✓ Correct. By dwelling on small domestic details and only obliquely revealing the death — "there are three letters that you will not get" — Farjeon lets understatement carry more force than a direct account of the death itself could.
    * **WhyWrong:** This is true — the quiet domestic details and the withheld final revelation are exactly how the poem achieves its understated, devastating effect.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem has a speaker admit she has forgotten which lips she has kissed, comparing herself in the end to a lonely winter tree that no longer remembers its birds?
    * **Options:** A) What lips my lips have kissed, and where, and why, B) Easter Monday, In Memoriam E.T., C) Last Post, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Millay's sonnet has the speaker confess she has "forgotten" the "unremembered lads" she once loved, before likening herself to "the lonely tree" that no longer knows which birds have gone.
    * **Why B:** Easter Monday mourns one named friend killed in war, not forgotten former lovers.
    * **Why C:** Last Post concerns soldiers killed in the First World War, not fading personal romance.
    * **Why D:** Poppies is spoken by a grieving mother, not a speaker reflecting on past lovers.

41. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** Millay's poem is a fourteen-line [BLANK] whose turn moves from the octave's forgotten lovers to the sestet's image of a lonely winter tree.
    * **Answer:** sonnet
    * **Feedback:** ✓ Correct. The poem is a sonnet, and at its volta the speaker becomes "the lonely tree" that cannot name the birds now gone, figuring all she has lost.
    * **WhyWrong:** The word is "sonnet" — the fourteen-line form whose turn likens the speaker to a bare winter tree.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What kind of conflict does "What lips my lips have kissed" explore?
    * **Options:** A) An internal, emotional conflict — mourning the fading of youthful passion and feeling over time, rather than any one lost love, B) A soldier's conflict with an enemy in battle, C) A political conflict between two nations, D) A public conflict between rival poets
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem's conflict is private and internal: Millay mourns that "summer sang in me / A little while, that in me sings no more" — the loss of intensity and feeling itself, not any single remembered lover.
    * **Why B:** There is no battlefield or enemy in this poem; its conflict is entirely internal.
    * **Why C:** The poem is personal and emotional, not a conflict between nations.
    * **Why D:** No rivalry between poets appears in the poem.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem has a speaker trapped in a burning tower wave a white cotton shirt at those watching from a distance, hoping to be seen and rescued?
    * **Options:** A) Out of the Blue – 12, B) Bayonet Charge, C) Vergissmeinnicht, D) The Charge of the Light Brigade
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Out of the Blue – 12" has its speaker, trapped high in a burning building, wave a "white cotton shirt", pleading to be noticed by whoever is watching from far below.
    * **Why B:** Bayonet Charge follows a soldier charging on open ground, not someone trapped in a burning building.
    * **Why C:** Vergissmeinnicht examines a body already dead, not someone desperately signalling to be saved.
    * **Why D:** The Charge of the Light Brigade describes a cavalry charge, not a lone figure in a burning tower.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What is a distinctive feature of the form of "Out of the Blue – 12"?
    * **Options:** A) Insistent present-participle end rhymes and half-rhymes — such as "turning"/"burning" and "waving"/"saving" — paired with direct second-person address to an unseen watcher, B) A regular ABAB ballad stanza with a heroic refrain, C) A silent sonnet with no direct address, D) Six unrhymed quatrains of documentary reportage
    * **Correct:** A
    * **Feedback:** ✓ Correct. The insistent "-ing" rhymes and half-rhymes drive the poem's urgency, while addressing "you" directly places the reader in the position of the distant, watching rescuer.
    * **Why B:** There is no heroic ballad refrain; the poem's rhythm comes from its driving participle rhymes.
    * **Why C:** The poem depends on direct second-person address, not a silent, self-contained sonnet.
    * **Why D:** The stanzas are built on insistent rhyme, not unrhymed documentary reportage.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Out of the Blue – 12"?
    * **Options:** A) It dramatises a desperate human need to be seen and rescued against the near-certainty of death, B) Addressing the reader as "you" forces them into the position of a distant, helpless witness to the disaster, C) It presents one individual's terror within a much larger catastrophe, D) The speaker is confident that rescue is close at hand
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Armitage dramatises one trapped individual's desperate hope for rescue, casts the reader as the distant witness through direct address, and sets this single terror within a far larger catastrophe.
    * **Why D:** The poem's urgency and repeated pleading ("trying and trying") suggest desperation, not confidence that rescue is imminent.
