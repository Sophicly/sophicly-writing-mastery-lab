# Foundational Quiz Bank — CCEA GCSE Literature Poetry: Identity (Poems)

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
- **@set:1** — Invictus · The Road Not Taken · Dover Beach · Sonnet 29 · Efface
- **@set:2** — Piano · In Mrs Tilscher's Class · I Remember, I Remember · Kid · Catrin
- **@set:3** — Prayer Before Birth · Belfast Confetti · Here · Docker · Genetics

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: CCEA Identity Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens "Out of the night that covers me, / Black as the Pit from pole to pole" and closes "I am the master of my fate: / I am the captain of my soul"?
   * **Options:** A) Invictus, B) Sonnet 29, C) Dover Beach, D) The Road Not Taken
   * **Correct:** A
   * **Feedback:** ✓ Correct. Henley's "Invictus" answers a night of suffering with unbroken defiance, closing on the famous claim to be "the master of my fate".
   * **Why B:** Sonnet 29 begins in self-pitying disgrace, not a defiant address to night and fate.
   * **Why C:** Dover Beach opens on a calm literal seascape, not a declaration of an unconquerable soul.
   * **Why D:** The Road Not Taken opens at a fork in a "yellow wood", not a meditation on fate and the soul.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Invictus" by William Ernest Henley shaped?
   * **Options:** A) Four rhymed quatrains in a tight ABAB rhyme scheme and driving tetrameter, B) A Shakespearean sonnet with a volta, C) A villanelle built from two recurring refrains, D) Free verse with no fixed rhyme
   * **Correct:** A
   * **Feedback:** ✓ Correct. Henley's four tight, regularly rhymed quatrains give the poem its drum-like, unwavering resolve.
   * **Why B:** A fourteen-line sonnet with a volta describes "Sonnet 29", not this four-quatrain poem.
   * **Why C:** A villanelle's nineteen lines and two refrains describe "Genetics", not "Invictus".
   * **Why D:** "Invictus" keeps a steady rhyme and metre throughout; it is not free verse.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does "Invictus" assert about identity in the face of suffering?
   * **Options:** A) It admits total defeat by circumstance, B) It asserts defiant self-mastery over pain and fate, closing "I am the master of my fate: / I am the captain of my soul", C) It celebrates a lucky escape from all hardship, D) It mocks the very idea of willpower
   * **Correct:** B
   * **Feedback:** ✓ Correct. Henley insists that even under "the bludgeonings of chance", the self's will remains unconquered.
   * **Why A:** The poem insists the speaker's "head is bloody, but unbowed" — the opposite of admitting defeat.
   * **Why C:** The poem confronts real suffering ("the fell clutch of circumstance") rather than describing an easy life.
   * **Why D:** The poem earnestly champions willpower and self-command, not mockery.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does a speaker stand at a fork, "Two roads diverged in a yellow wood", and later claim he "took the one less traveled by"?
   * **Options:** A) The Road Not Taken, B) Dover Beach, C) Invictus, D) Piano
   * **Correct:** A
   * **Feedback:** ✓ Correct. Frost's "The Road Not Taken" follows a speaker weighing two paths, later claiming his choice "has made all the difference".
   * **Why B:** Dover Beach is set on a shoreline at night, not at a fork in a wood.
   * **Why C:** Invictus addresses night and fate directly, with no literal roads or woods.
   * **Why D:** Piano recalls a childhood memory triggered by song, not a choice between two paths.

5. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** "The Road Not Taken" is written in four stanzas of five lines each, a stanza form called a [BLANK].
   * **Answer:** quintain
   * **Feedback:** ✓ Correct. Each five-line quintain, rhymed ABAAB, gives the poem its measured, deliberating pace as the speaker weighs his choice.
   * **WhyWrong:** The term is "quintain" — the five-line stanza Frost repeats four times, rhymed ABAAB.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the irony at the heart of "The Road Not Taken"?
   * **Options:** A) The speaker admits the two roads were worn "really about the same", yet later claims his choice "has made all the difference" — showing how identity is partly built from the stories we tell about our past, B) The poem proves one road was objectively harder than the other, C) The speaker regrets his choice completely, D) The poem argues that all choices are meaningless
   * **Correct:** A
   * **Feedback:** ✓ Correct. Frost quietly undercuts the heroic myth of individual choice, showing how retrospective storytelling shapes a sense of self.
   * **Why B:** The poem states the paths "equally lay / In leaves no step had trodden black" — neither was objectively harder.
   * **Why C:** The speaker's tone is wistful rather than a plain admission of regret.
   * **Why D:** The poem takes choice seriously; it questions the myth-making around it, not choice itself.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens "The sea is calm tonight" and turns to plead "Ah, love, let us be true / To one another!" against a darkening world?
   * **Options:** A) Dover Beach, B) Sonnet 29, C) Kid, D) Efface
   * **Correct:** A
   * **Feedback:** ✓ Correct. Arnold's "Dover Beach" moves from a calm nighttime shoreline to a plea for human faithfulness amid loss of certainty.
   * **Why B:** Sonnet 29 turns on the speaker's own self-worth restored by love, not on the retreat of religious faith.
   * **Why C:** Kid gives voice to a comic-book sidekick, not a philosophical address on a moonlit shore.
   * **Why D:** Efface addresses a specific former lover, Nora, not humanity's shared loss of certainty.

8. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "Dover Beach" abandons a fixed rhyme scheme and regular metre, its four stanzas of unequal length moving with the irregular rhythm of the tide.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Arnold lets the lines lengthen and shorten irregularly, echoing the "grating roar" of the pebbles as the tide draws back.
   * **WhyWrong:** This is true — the poem's irregular line lengths and loose rhyme mimic the sea's unpredictable ebb and flow.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does "Dover Beach" suggest about faith and love in the modern world?
   * **Options:** A) It celebrates the triumph of religious faith in the modern age, B) The retreating "Sea of Faith" leaves only human love as a fragile anchor against a world of "confused alarms" and "ignorant armies", C) It argues that love is a needless distraction from serious matters, D) It describes a purely joyful, untroubled seascape
   * **Correct:** B
   * **Feedback:** ✓ Correct. As certainty withdraws with "its melancholy, long, withdrawing roar", the speaker clings to love as the one steady thing left.
   * **Why A:** The "Sea of Faith" is explicitly retreating — the opposite of triumphant.
   * **Why C:** The speaker pleads "let us be true / To one another" precisely because love is his one remaining certainty.
   * **Why D:** Beneath its calm opening, the poem darkens into "a darkling plain" of confusion and conflict.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem begins "When in disgrace with fortune and men's eyes / I all alone beweep my outcast state"?
    * **Options:** A) Sonnet 29, B) Invictus, C) Piano, D) Here
    * **Correct:** A
    * **Feedback:** ✓ Correct. Shakespeare's "Sonnet 29" opens in self-pitying disgrace before turning towards a self restored by love.
    * **Why B:** Invictus addresses fate and the night directly, without the self-pitying opening of disgrace and envy.
    * **Why C:** Piano is triggered by a woman singing, not by social disgrace and envy.
    * **Why D:** Here is a stark confession of guilt in short tercets, not a sonnet about self-worth restored by love.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "Sonnet 29" by William Shakespeare is written in which form?
    * **Options:** A) A Shakespearean sonnet, B) A ballad, C) Free verse, D) A villanelle
    * **Correct:** A
    * **Feedback:** ✓ Correct. "Sonnet 29" is a Shakespearean sonnet — fourteen lines of three quatrains and a closing couplet, turning at "Yet in these thoughts" from self-loathing to joy.
    * **Why B:** It is a fourteen-line meditation, not a narrative told in song-like stanzas.
    * **Why C:** It keeps a strict rhyme scheme and metre, so it is not free verse.
    * **Why D:** A villanelle circles two refrains across nineteen lines; this poem has fourteen lines and no refrains.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** How does the sonnet form of "Sonnet 29" serve its meaning?
    * **Options:** A) Its single sweep and volta carry the speaker from self-loathing to joy, so the form enacts an identity restored by love, B) Its refrains circle obsessively, C) Its long lines collapse into chaos, D) It tells a rhymed heroic tale
    * **Correct:** A
    * **Feedback:** ✓ Correct. The one unbroken argument turns at "Yet", lifting the speaker "like to the lark" — the sonnet's shape stages a self remade by being loved.
    * **Why B:** The sonnet has no refrains; circling refrains belong to the villanelle.
    * **Why C:** The form is controlled and shapely, not a collapse into chaos.
    * **Why D:** It is an inward meditation on self-worth, not a rhymed heroic tale.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem addresses a woman named Nora, recalling ballet terms like "développés and port de bras" and comparing her to Odette from Swan Lake?
    * **Options:** A) Efface, B) Dover Beach, C) Catrin, D) Kid
    * **Correct:** A
    * **Feedback:** ✓ Correct. Maddern's "Efface" recalls a past romance through ballet imagery, casting the speaker as a "mincing prince" and Nora as his lost Odette.
    * **Why B:** Dover Beach addresses "love" in the abstract on a shoreline, not a named former partner recalled through ballet imagery.
    * **Why C:** Catrin is a mother's memory of childbirth and a daughter's growing independence, not a lost romance.
    * **Why D:** Kid is spoken by a comic-book sidekick, not a man reflecting on a relationship he almost lived.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How does "Efface" by Paul Maddern treat the sonnet form?
    * **Options:** A) As a conventional Petrarchan sonnet with a strict octave/sestet split, B) As fourteen lines that keep sonnet length but subvert it — three uneven stanzas, a loose, mixed rhyme, a late volta at "But", and no closing rhymed couplet, C) As a villanelle built on two repeating refrains, D) As free verse with no set line count at all
    * **Correct:** B
    * **Feedback:** ✓ Correct. Maddern keeps the fourteen-line frame but breaks its symmetry — an uneven 5-5-4 stanza shape, mixed rhyme, and an ending that fades rather than resolves.
    * **Why A:** The poem keeps fourteen lines but divides them unevenly (5-5-4), not into a clean octave and sestet.
    * **Why C:** Efface has no repeating refrains; a villanelle describes "Genetics".
    * **Why D:** The poem still keeps a fixed fourteen-line count, so it is not free verse.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Efface"?
    * **Options:** A) The speaker regrets that living the conventional life ("the 2.4") with Nora would have meant living a lie about who he truly is, B) The Swan Lake imagery, casting himself as the "mincing prince" and Nora as Odette, frames the lost romance as a fairy tale he cannot quite believe in, C) The poem ends on wistful, resigned acceptance rather than triumphant celebration, D) The poem insists the speaker made the wrong choice and should return to Nora
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Maddern's speaker weighs a life of comfortable pretence against honesty about his own identity, casting the lost romance in fairy-tale ballet imagery before settling into rueful, resigned acceptance.
    * **Why D:** The poem's late volta and unrhymed close suggest quiet acceptance, not a call to reverse the choice.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem's speaker, hearing a woman sing in the dusk, is carried back to a childhood memory of sitting under the piano, "in the boom of the tingling strings"?
    * **Options:** A) Piano, B) In Mrs Tilscher's Class, C) I Remember, I Remember, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. Lawrence's "Piano" is drawn back by present-day song into a vivid memory of childhood evenings around the family piano.
    * **Why B:** In Mrs Tilscher's Class is set in a primary-school classroom, not triggered by an adult hearing a woman sing.
    * **Why C:** I Remember, I Remember is set on a stalled train, not beside a piano.
    * **Why D:** Catrin recalls childbirth and a hospital window, not a childhood evening of hymns.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "Piano" by D.H. Lawrence shaped?
    * **Options:** A) Three four-line stanzas (quatrains) in rhyming couplets, the final stanza broken by a short, halting line, B) A sonnet with a single volta, C) Free verse with no rhyme at all, D) A villanelle with two refrains
    * **Correct:** A
    * **Feedback:** ✓ Correct. Lawrence's steady rhyming couplets move like the remembered song itself, until the final stanza's rhythm stumbles as the memory overwhelms him.
    * **Why B:** The poem runs to twelve lines across three quatrains, not fourteen lines with a volta.
    * **Why C:** Lawrence rhymes each stanza in couplets (AABB); it is not free verse.
    * **Why D:** There are no repeating refrains; a villanelle describes "Genetics".

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What happens to the adult speaker in "Piano"?
    * **Options:** A) The song's "insidious mastery" overwhelms his composure, collapsing his grown "manhood" until he "weep[s] like a child for the past", B) He calmly enjoys the song without being affected, C) The poem celebrates the speaker's own musical talent, D) He rejects the memory of his mother entirely
    * **Correct:** A
    * **Feedback:** ✓ Correct. Despite resisting "in spite of myself", the speaker is dragged under by nostalgia, his adult self dissolving into a child's tears.
    * **Why B:** The speaker is "cast / Down in the flood of remembrance" — anything but calm and unaffected.
    * **Why C:** The poem is about being sung to, not about the speaker's own musical skill.
    * **Why D:** The memory of his mother's "poised feet" and smile is precisely what overwhelms him.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem follows a school day where "you could travel up the Blue Nile / with your finger", ending as "the sky split open into a thunderstorm"?
    * **Options:** A) In Mrs Tilscher's Class, B) Piano, C) Kid, D) Here
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "In Mrs Tilscher's Class" tracks a school year of geography lessons and classroom pets, closing as a storm marks the end of childhood.
    * **Why B:** Piano is an adult's memory triggered by song, not a chronological account of a school year.
    * **Why C:** Kid is spoken by a grown sidekick asserting independence from Batman, not a schoolchild.
    * **Why D:** Here is a stark adult confession in short stanzas, not a classroom memory.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "In Mrs Tilscher's Class" moves through four stanzas — the first two eight lines long, the last two seven — all written in [BLANK], with no fixed rhyme scheme.
    * **Answer:** free verse
    * **Feedback:** ✓ Correct. The loosening free verse, its stanzas shortening as the poem goes on, tracks the speaker's drift from settled childhood into restless adolescence.
    * **WhyWrong:** The term is "free verse" — Duffy uses no regular rhyme or metre, shaping the poem instead around the speaker's changing mood.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "In Mrs Tilscher's Class" traces a shift from safe childhood wonder to the restless, heady unsettlement of approaching adolescence, ending as "the sky split open into a thunderstorm."
    * **Answer:** True
    * **Feedback:** ✓ Correct. The classroom's comforting certainties give way to a charged, restless atmosphere as the speaker nears adolescence, the storm marking a decisive change in her sense of self.
    * **WhyWrong:** This is true — the poem moves from contented childhood absorption to restless unease as the speaker nears adolescence.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem follows a speaker whose train unexpectedly stops at his birthplace, ending on the flat, deadpan line "Nothing, like something, happens anywhere"?
    * **Options:** A) I Remember, I Remember, B) Piano, C) Docker, D) Prayer Before Birth
    * **Correct:** A
    * **Feedback:** ✓ Correct. Larkin's "I Remember, I Remember" has the speaker's train stall at Coventry, prompting a deflating catalogue of things that never happened to him there.
    * **Why B:** Piano is triggered by present-day song, not by an unplanned train stop at a birthplace.
    * **Why C:** Docker is set in a pub, watching a bigoted dockworker, not on a train passing through a hometown.
    * **Why D:** Prayer Before Birth is spoken by a child not yet born, not by an adult passing through Coventry.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "I Remember, I Remember" by Philip Larkin structured?
    * **Options:** A) Seven five-line stanzas (quintains), plus one final line set apart on its own, B) A single unbroken sonnet, C) A villanelle with two refrains, D) Rhyming couplets throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. Larkin's seven quintains build a deadpan catalogue of absent memories, before the poem steps back into one final, detached line.
    * **Why B:** The poem runs well beyond fourteen lines across several stanzas, not one sonnet.
    * **Why C:** It has no repeating refrains; a villanelle describes "Genetics".
    * **Why D:** Its stanzas are quintains, not paired rhyming couplets.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What view of identity and "roots" does "I Remember, I Remember" put forward?
    * **Options:** A) The speaker insists his childhood held all the formative moments memory usually claims, B) The poem denies that this "unspent" place shaped who he became, deflating any nostalgic myth of "roots" and ending on the flat claim that "Nothing, like something, happens anywhere", C) The poem argues his hometown was uniquely traumatic, D) The poem celebrates a joyful homecoming
    * **Correct:** B
    * **Feedback:** ✓ Correct. Larkin refuses the sentimental idea that a birthplace must shape identity, undercutting nostalgia with flat, ironic understatement.
    * **Why A:** The speaker instead lists the events that "didn't happen" to him there, refusing the expected nostalgic claims.
    * **Why C:** The tone is deflating and ironic rather than dramatic or traumatic.
    * **Why D:** The visit is accidental and the speaker feels detached, not joyfully reunited with his past.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem gives voice to Robin, Batman's former sidekick, who declares "now I'm the real boy wonder" as he strikes out on his own?
    * **Options:** A) Kid, B) Docker, C) Piano, D) Here
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Kid" lets Robin mock Batman and claim his own independent identity.
    * **Why B:** Docker is a bigoted dockworker brooding in a pub, not a comic-book sidekick.
    * **Why C:** Piano is an adult recalling childhood song, not a superhero parody.
    * **Why D:** Here is a stark confession of adult guilt, not a playful comic-book voice.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** Every line of "Kid" ends on an "-er" rhyme and runs to about ten syllables — the metre known as [BLANK] — echoing the driving rhythm of the old Batman theme tune.
    * **Answer:** iambic pentameter
    * **Feedback:** ✓ Correct. The insistent "-er" rhymes and ten-syllable lines give the poem a bouncing, sing-song pulse that mimics the campness of the original Batman television theme.
    * **WhyWrong:** The term is "iambic pentameter" — the regular ten-syllable line Armitage keeps throughout, rhymed on "-er" each time.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does "Kid" suggest about Robin's identity?
    * **Options:** A) Robin mourns the loss of Batman and wants to return to his side, B) Robin rejects his old subordinate role, mocking Batman's fading authority and declaring himself independent — "now I'm the real boy wonder", C) Robin admits he was always the weaker hero, D) The poem celebrates Batman's continuing dominance
    * **Correct:** B
    * **Feedback:** ✓ Correct. Robin's mocking, triumphant tone reclaims an identity no longer defined by his old sidekick role.
    * **Why A:** Robin's tone is mocking and triumphant, not mournful or eager to return.
    * **Why C:** Robin claims superiority for himself, not weakness.
    * **Why D:** The poem instead pictures Batman diminished and alone, while Robin asserts himself.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem's speaker remembers giving birth, standing "in a hot, white / Room at the window," and recalls later fighting her daughter over "the tight red rope of love"?
    * **Options:** A) Catrin, B) In Mrs Tilscher's Class, C) Efface, D) Docker
    * **Correct:** A
    * **Feedback:** ✓ Correct. Clarke's "Catrin" moves from the memory of childbirth to an ongoing struggle with her daughter for independence.
    * **Why B:** In Mrs Tilscher's Class is a schoolchild's own memory, not a mother's memory of childbirth.
    * **Why C:** Efface addresses a former lover, not a daughter.
    * **Why D:** Docker studies a bigoted stranger in a pub, not a mother-daughter bond.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Catrin" by Gillian Clarke is written in which form?
    * **Options:** A) Free verse, B) A sonnet, C) A villanelle, D) A ballad
    * **Correct:** A
    * **Feedback:** ✓ Correct. "Catrin" is written in free verse — two verse paragraphs with no regular rhyme or metre, letting the mother's memory run on unbroken.
    * **Why B:** It has no fourteen-line shape or volta, so it is not a sonnet.
    * **Why C:** It never repeats refrains, so it is not a villanelle.
    * **Why D:** It tells no song-like rhymed narrative, so it is not a ballad.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "Catrin"?
    * **Options:** A) The "tight red rope" recalls the umbilical cord while also standing for the ongoing bond and struggle between mother and daughter, B) The poem ends with the conflict still unresolved, cast as a continuing "tug of war" over the daughter's independence, C) The free verse form, without tidy rhyme, mirrors a relationship that never neatly resolves, D) The poem suggests the mother has now fully let go and no longer struggles with her daughter
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Clarke's "tight red rope" binds and divides mother and daughter at once, the unresolved "tug of war" and unrhymed free verse both keeping the struggle open rather than settled.
    * **Why D:** The poem's closing image is of continuing struggle, not of the mother releasing her hold.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, spoken by an unborn child, repeats "I am not yet born" as it pleads to be shielded from a violent, corrupting world?
    * **Options:** A) Prayer Before Birth, B) Genetics, C) Here, D) Docker
    * **Correct:** A
    * **Feedback:** ✓ Correct. MacNeice's "Prayer Before Birth" voices an unborn child's mounting fears in a chanted, incantatory plea.
    * **Why B:** Genetics speaks after birth, tracing inheritance through the hands, not pleading before birth.
    * **Why C:** Here is spoken by a grown man confessing guilt, not an unborn child.
    * **Why D:** Docker studies a stranger in a pub, not an unborn child's plea.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Prayer Before Birth" by Louis MacNeice is best described as which form?
    * **Options:** A) A dramatic monologue, B) A sonnet, C) A ballad, D) An ode
    * **Correct:** A
    * **Feedback:** ✓ Correct. An unborn child speaks throughout, addressing the world in a single sustained voice — a dramatic monologue, cast as an incantatory prayer.
    * **Why B:** It runs to many free-verse stanzas, not fourteen rhymed lines.
    * **Why C:** It pleads rather than telling a rhymed story, so it is not a ballad.
    * **Why D:** It voices fear and appeal, not praise, so it is not an ode.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the unborn speaker in "Prayer Before Birth" fear most?
    * **Options:** A) Losing his own identity to violence and conformity, pleading "Let them not make me a stone" rather than being shaped into "a killer" or "a thing", B) That life will bring only comfort and safety, C) That the adult world he is entering is entirely innocent, D) Nothing at all — the poem presents an untroubled child
    * **Correct:** A
    * **Feedback:** ✓ Correct. MacNeice builds a mounting catalogue of dreads, the child begging to keep his own conscience rather than be remade into an instrument of cruelty.
    * **Why B:** The poem is a mounting catalogue of dreads, not a confident welcome.
    * **Why C:** The world the child fears entering is violent and corrupting, far from innocent.
    * **Why D:** The entire poem is built from the child's escalating fears.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens as "the riot squad moved in", picturing shrapnel as "raining exclamation marks" and the explosion as "an asterisk on the map"?
    * **Options:** A) Belfast Confetti, B) Docker, C) Here, D) Prayer Before Birth
    * **Correct:** A
    * **Feedback:** ✓ Correct. Carson's "Belfast Confetti" turns a riot into a storm of punctuation, its typographic imagery enacting the speaker's confusion.
    * **Why B:** Docker is a static portrait of one man in a pub, not a riot unfolding in real time.
    * **Why C:** Here is a calm, confessional set of tercets, not a fractured account of an explosion.
    * **Why D:** Prayer Before Birth is spoken before birth, not amid a Belfast riot.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "Belfast Confetti" is written in fractured free verse, its long, broken lines and scattered punctuation marks acting out the chaos of the riot itself.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Exclamation marks, colons and stops litter the poem as debris and roadblocks at once, the broken syntax enacting a mind and a sentence unable to find a way through.
    * **WhyWrong:** This is true — the poem's fractured, punctuation-heavy free verse performs the very confusion it describes.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What happens to the speaker's sense of identity in "Belfast Confetti"?
    * **Options:** A) The riot's debris and the city's punctuation-like street names trap the speaker in a maze he cannot escape, his identity dissolving into the closing questions "What is My name? / Where am I coming from?", B) The poem confidently answers who the speaker is and where he belongs, C) The poem argues the riot has no lasting effect on identity, D) The speaker calmly narrates the events from a safe distance
    * **Correct:** A
    * **Feedback:** ✓ Correct. Carson leaves the speaker lost inside his own city, the riot's chaos unsettling even his most basic sense of self.
    * **Why B:** The poem ends in unresolved questions, not confident answers.
    * **Why C:** The riot's confusion directly unsettles the speaker's sense of self.
    * **Why D:** The stuttering, broken syntax presents a speaker caught inside the chaos, not observing it calmly.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem's speaker declares "I am a man now" and asks "Why, then, are my hands red / With the blood of so many dead?"
    * **Options:** A) Here, B) Docker, C) Genetics, D) Piano
    * **Correct:** A
    * **Feedback:** ✓ Correct. R.S. Thomas's "Here" is a grown man's stark, guilt-ridden confession of complicity in violence.
    * **Why B:** Docker portrays a stranger observed in a pub, not a man's own first-person confession.
    * **Why C:** Genetics traces inheritance through the hands, not guilt over "blood ... of so many dead".
    * **Why D:** Piano is a memory of childhood song, not an adult reckoning with guilt and stasis.

38. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Here" unfolds across seven three-line stanzas, a form called the [BLANK], most of them rhyming or half-rhyming within the stanza to give the confession its plain, chant-like voice.
    * **Answer:** tercet
    * **Feedback:** ✓ Correct. Each short, chiming tercet lands like a plain, confessional statement, giving the poem's guilt an insistent, almost liturgical rhythm.
    * **WhyWrong:** The term is "tercet" — the three-line stanza R.S. Thomas repeats seven times.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Here" reveal about the speaker's sense of self?
    * **Options:** A) The speaker calmly accepts his past and moves forward with hope, B) The speaker confesses guilt and complicity in violence, feeling trapped and "too late to start" anew, resigned to "stay here with my hurt", C) The poem argues that the speaker is entirely innocent, D) The poem celebrates the speaker's freedom to choose his own future
    * **Correct:** B
    * **Feedback:** ✓ Correct. Thomas presents a man paralysed by his own past actions, unable to escape either his guilt or his own hands.
    * **Why A:** The poem ends in stasis and hurt, not calm forward motion.
    * **Why C:** The speaker directly questions his own guilt — "Why, then, are my hands red / With the blood of so many dead?"
    * **Why D:** The speaker feels his hands "will not do as I say" — the opposite of free choice.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem pictures a man in a pub whose "cap juts like a gantry's crossbeam" and who believes "That fist would drop a hammer on a Catholic"?
    * **Options:** A) Docker, B) Kid, C) Efface, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney's "Docker" builds its portrait of sectarian bigotry from shipyard and industrial imagery.
    * **Why B:** Kid is a comic-book sidekick's boastful monologue, not a portrait of a bigoted dockworker.
    * **Why C:** Efface recalls a lost romance, not a stranger observed in a pub.
    * **Why D:** Catrin is a mother's memory of her daughter, not a study of sectarian prejudice.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Docker" by Seamus Heaney shaped?
    * **Options:** A) Four unrhymed quatrains, built from a sustained industrial metaphor of gantries, rivets and a foreman-God, B) A Shakespearean sonnet, C) A villanelle with two refrains, D) Rhyming couplets throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney's four plain, unrhymed quatrains carry an extended shipyard metaphor that fuses religion with mechanised control.
    * **Why B:** The poem runs to sixteen lines across four stanzas, not fourteen with a volta.
    * **Why C:** It has no repeating refrains; a villanelle describes "Genetics".
    * **Why D:** Heaney's lines carry no regular end-rhyme; they are not paired couplets.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Docker" suggest about the docker's identity?
    * **Options:** A) His sectarian bigotry is cast in mechanised, industrial terms — his God is "a foreman with certain definite views" who "orders life in shifts" — collapsing faith into rigid control that extends into his silent, feared household, B) The poem presents the docker as a warm, open-minded family man, C) The poem argues religion and industry have nothing to do with each other, D) The docker's household is presented as cheerful and untroubled
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney fuses shipyard mechanism with religious authority, showing a rigid, threatening identity that extends from the pub into his own home.
    * **Why B:** The poem hints at threat ("That fist would drop a hammer on a Catholic"), not warmth.
    * **Why C:** The poem fuses shipyard imagery with religious authority throughout — foreman, rivets, Resurrection.
    * **Why D:** The closing lines picture the household forced into tense quiet, not cheerful ease.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens "My father's in my fingers, but my mother's in my palms", tracing the speaker's inherited identity through her hands?
    * **Options:** A) Genetics, B) Prayer Before Birth, C) Here, D) Piano
    * **Correct:** A
    * **Feedback:** ✓ Correct. Morrissey's "Genetics" reads the speaker's own hands as proof that her separated parents remain joined in her.
    * **Why B:** Prayer Before Birth is spoken before birth, fearing the world, not tracing inherited hands after birth.
    * **Why C:** Here confesses adult guilt over violence, not the shape of inherited hands.
    * **Why D:** Piano is a memory triggered by song, not a meditation on genetic inheritance.

44. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Genetics" by Sinéad Morrissey is a [BLANK] — a nineteen-line form whose two refrains recur and finally combine.
    * **Answer:** villanelle
    * **Feedback:** ✓ Correct. "Genetics" is a villanelle, its returning refrains about the father in the fingers and the mother in the palms enacting how parents recombine in a child.
    * **WhyWrong:** The word is "villanelle" — the nineteen-line form whose two refrains circle back and join at the close.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Genetics"?
    * **Options:** A) The two refrains about fingers and palms recur in shifting variation and finally combine, enacting how the parents remain joined in the speaker's hands, B) The final line's shift to "We" widens the poem from personal inheritance to a shared, universal claim, C) The poem frames the parents' separation as something still overcome through the child's body, D) The poem presents genetic inheritance as a curse the speaker wishes to escape
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Morrissey's recombining refrains, the widening final "We", and the image of a marriage preserved in the child's hands all frame inheritance as continuity and comfort, not affliction.
    * **Why D:** The poem's tone is one of pleasure and comfort ("I lift them up and look at them with pleasure"), not a wish to escape inheritance.
