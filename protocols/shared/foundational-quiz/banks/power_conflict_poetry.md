# Foundational Quiz Bank — AQA Power and Conflict Poetry (Poems)

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
- **@set:1** — Ozymandias · London · Extract from The Prelude · My Last Duchess · The Charge of the Light Brigade
- **@set:2** — Exposure · Storm on the Island · Bayonet Charge · Remains · Poppies
- **@set:3** — War Photographer · Tissue · The Émigrée · Checking Out Me History · Kamikaze

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Power and Conflict Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem describes a shattered statue in a desert, with "two vast and trunkless legs of stone" and a half-sunk, sneering face?
   * **Options:** A) London, B) Ozymandias, C) Exposure, D) Tissue
   * **Correct:** B
   * **Feedback:** ✓ Correct. Shelley's "Ozymandias" pictures the ruined statue of a boastful ancient king, its "trunkless legs" and shattered visage now stranded in empty sand.
   * **Why A:** London is set in the streets of a modern city, not a desert of ruined statues.
   * **Why C:** Exposure is set among freezing soldiers in the trenches, not a desert.
   * **Why D:** Tissue meditates on paper and human structures, with no shattered statue.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Shelley use for "Ozymandias", and how does he treat it?
   * **Options:** A) A ballad with a driving refrain, B) A sonnet — used in a broken, irregular way, C) A villanelle, D) Blank-verse epic
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ozymandias is a fourteen-line sonnet, but its irregular rhyme deliberately breaks the form associated with order and permanence.
   * **Why A:** There is no song-like refrain; the poem keeps sonnet length and shape.
   * **Why C:** A villanelle relies on strict repeating refrains, which this poem does not use.
   * **Why D:** Blank-verse epic describes The Prelude, not this fourteen-line sonnet.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** Why is Shelley's choice of the sonnet form for "Ozymandias" ironic?
   * **Options:** A) Because sonnets can only be about love, B) Because the sonnet, linked to permanence and order, is used to mock how power crumbles to nothing, C) Because sonnets are always comic, D) Because he breaks every rule of grammar
   * **Correct:** B
   * **Feedback:** ✓ Correct. Turning a form associated with lasting art and order against a boastful tyrant sharpens the message that even the greatest power does not endure.
   * **Why A:** Sonnets can treat many subjects; the irony lies in the contrast with power's decay.
   * **Why C:** The tone is grave and ironic, not comic.
   * **Why D:** The irony comes from the form's associations, not from broken grammar.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Blake's poem, the speaker wanders through the "chartered" streets of [BLANK], hearing misery in every voice.
   * **Answer:** London
   * **Feedback:** ✓ Correct. "London" walks the reader through the "chartered" streets of the city, where every cry reveals institutional suffering.
   * **WhyWrong:** The city is London — Blake maps its "chartered" streets and the "mind-forg'd manacles" of its people.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "London" structured, and which technique dominates it?
   * **Options:** A) Free verse with no repetition, B) Regular ABAB quatrains driven by insistent repetition, such as "every", C) A single unbroken sonnet, D) Rhyming couplets hidden by enjambment
   * **Correct:** B
   * **Feedback:** ✓ Correct. Blake's tight, regular quatrains and the pounding repetition of "every" make the city's misery feel relentless and inescapable.
   * **Why A:** The poem is tightly rhymed and heavily repetitive, not free verse.
   * **Why C:** It is four quatrains, not a fourteen-line sonnet.
   * **Why D:** Hidden couplets belong to My Last Duchess; London's rhyme is openly regular.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "London", the phrase "mind-forg'd manacles" suggests that the people's oppression is partly mental and self-imposed, not only external.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The "mind-forg'd manacles" imply chains made in the mind — the people are trapped by imposed authority and by their own acceptance of it.
   * **WhyWrong:** This is the force of the image — the manacles are forged in the mind, suggesting oppression internalised as well as imposed.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does a boy steal a boat at night, only to feel a huge dark peak seem to stride after him across the water?
   * **Options:** A) Bayonet Charge, B) Extract from The Prelude, C) Storm on the Island, D) Kamikaze
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wordsworth's extract from "The Prelude" recounts stealing a boat, then a "huge peak, black and huge" that seems to pursue him, leaving lasting awe and guilt.
   * **Why A:** Bayonet Charge is set in the panic of a soldier's advance, not a night on a lake.
   * **Why C:** Storm on the Island describes a community braced against a storm, not a boat theft.
   * **Why D:** Kamikaze follows a pilot turning back from his mission, not a boy on a lake.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** The extract from Wordsworth's "The Prelude" is written in...
   * **Options:** A) Rhyming couplets, B) Blank verse — unrhymed iambic pentameter, in the tradition of epic, C) A strict sonnet, D) Ballad quatrains
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wordsworth uses the unrhymed iambic pentameter of blank-verse epic to raise a personal childhood memory to grand, lasting significance.
   * **Why A:** Rhyming couplets describe My Last Duchess, not this reflective blank verse.
   * **Why C:** The extract flows continuously, not in a fixed fourteen-line sonnet.
   * **Why D:** Its measured blank verse is far from the song-like ballad quatrain.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the mountain episode in "The Prelude" reveal about nature?
   * **Options:** A) Nature is harmless and purely decorative, B) Nature is a powerful, almost moral force that can awe, humble and instruct the human mind, C) Nature is entirely indifferent to people, D) Nature exists only to be conquered
   * **Correct:** B
   * **Feedback:** ✓ Correct. The looming peak leaves the boy with "huge and mighty forms" in his mind, presenting nature as a sublime power that teaches humility and shapes the self.
   * **Why A:** The overwhelming, guilt-inducing peak is the opposite of harmless decoration.
   * **Why C:** Nature acts on him so strongly that indifference cannot be the point.
   * **Why D:** The boy is humbled, not triumphant; nature masters him, not the reverse.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** In which poem does a proud Duke show a visitor a portrait of his late wife, revealing he had her killed for smiling too freely?
    * **Options:** A) My Last Duchess, B) The Émigrée, C) Remains, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's "My Last Duchess" has the Duke of Ferrara display his dead wife's portrait, letting slip that "I gave commands; / Then all smiles stopped together".
    * **Why B:** The Émigrée concerns a remembered homeland, not a murdered wife.
    * **Why C:** Remains follows a soldier haunted by a killing, not a Duke and a portrait.
    * **Why D:** Poppies voices a grieving mother, not a controlling aristocrat.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "My Last Duchess" is written as a dramatic monologue in...
    * **Options:** A) Free verse, B) Iambic pentameter rhyming couplets, smoothed over by enjambment, C) Ballad quatrains, D) A broken sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The couplets are hidden by enjambment so the Duke sounds calm and controlled — the smooth surface beneath which his menace lurks.
    * **Why A:** The poem is tightly rhymed, not free verse.
    * **Why C:** It is one continuous speech, not song-like quatrains.
    * **Why D:** It runs far longer than fourteen lines and is not a sonnet.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** In a dramatic monologue like "My Last Duchess", where does the form position the reader?
    * **Options:** A) As a passive bystander who learns nothing, B) As a kind of judge or detective, decoding the truth the speaker reveals without meaning to, C) As the Duke's loyal servant, D) As the poet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The gap between what the Duke says and what he betrays makes the reader work like a detective, judging the menace beneath his controlled speech.
    * **Why A:** The form demands active interpretation, not passive listening.
    * **Why C:** The reader interprets the Duke rather than serving him.
    * **Why D:** The reader decodes the speaker rather than becoming the poet.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem memorialises a doomed cavalry charge, repeating that the soldiers rode "into the valley of Death"?
    * **Options:** A) Exposure, B) The Charge of the Light Brigade, C) War Photographer, D) Bayonet Charge
    * **Correct:** B
    * **Feedback:** ✓ Correct. Tennyson's "The Charge of the Light Brigade" honours the six hundred who rode "into the valley of Death" after "someone had blundered".
    * **Why A:** Exposure depicts soldiers frozen and waiting, not a cavalry charge.
    * **Why C:** War Photographer concerns a photographer developing images of distant wars.
    * **Why D:** Bayonet Charge follows one panicked infantryman, not the famous six hundred.

14. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** In "The Charge of the Light Brigade", Tennyson's driving, galloping [BLANK] imitates the sound of the horses charging into battle.
    * **Answer:** rhythm
    * **Feedback:** ✓ Correct. The pounding dactylic rhythm ("Half a league, half a league") gallops like the cavalry, giving the narrative its relentless momentum.
    * **WhyWrong:** The word is "rhythm" — the poem's insistent, galloping metre drives the charge forward and memorialises the soldiers' momentum.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** How does Tennyson present the soldiers of the Light Brigade?
    * **Options:** A) As cowards who deserted, B) As heroic and honourable in their obedience, even though a blunder sent them to death, C) As villains who caused the war, D) As victorious conquerors
    * **Correct:** B
    * **Feedback:** ✓ Correct. Tennyson honours the soldiers' courage and duty — "theirs but to do and die" — while quietly acknowledging the fatal blunder of their commanders.
    * **Why A:** The poem celebrates their bravery; they charge despite the error.
    * **Why C:** They are the victims of a blunder, not its cause.
    * **Why D:** The charge is a catastrophe to be honoured, not a victory.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem are soldiers killed not by the enemy but by the "merciless iced east winds", with the refrain "But nothing happens"?
    * **Options:** A) Storm on the Island, B) Exposure, C) Remains, D) Poppies
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen's "Exposure" presents the true enemy as the freezing weather and endless waiting, punctuated by the hopeless refrain "But nothing happens".
    * **Why A:** Storm on the Island braces a community against a storm, not trench cold.
    * **Why C:** Remains concerns a soldier's guilt over a shooting, not death by weather.
    * **Why D:** Poppies voices a grieving mother at home, not soldiers in the snow.

17. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** In "Exposure", Owen uses [BLANK] — near or half-rhyme — to create unease and a sense of things never quite resolving.
    * **Answer:** pararhyme
    * **Feedback:** ✓ Correct. The dissonant pararhyme (near-rhymes that do not fully chime) mirrors the soldiers' suspended, hopeless waiting in the cold.
    * **WhyWrong:** The word is "pararhyme" — Owen's near-rhymes deliberately fail to resolve, deepening the poem's unease.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the central irony of "Exposure"?
    * **Options:** A) The soldiers win a great battle, B) The real enemy is not the Germans but the weather, boredom and futility of waiting, C) The soldiers are never in any danger, D) The poem celebrates the glory of war
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen subverts the expectation of combat: the men are worn down and killed by cold, inertia and futility rather than by enemy fire.
    * **Why A:** No battle is won; the poem is one of attrition, not victory.
    * **Why C:** Men die of exposure — the danger is real, just not from bullets.
    * **Why D:** Owen exposes war's misery; he does not glorify it.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem depicts an island community that has built its houses "squat" to withstand a storm, only to fear "a huge nothing"?
    * **Options:** A) Storm on the Island, B) The Prelude, C) Ozymandias, D) Checking Out Me History
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney's "Storm on the Island" opens "We are prepared: we build our houses squat", ending on "It is a huge nothing that we fear".
    * **Why B:** The Prelude recounts a boy's night on a lake, not an island storm.
    * **Why C:** Ozymandias concerns a ruined desert statue, not a coastal community.
    * **Why D:** Checking Out Me History is about reclaiming identity, not a storm.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Which technique does Heaney use when the storm "spits like a tame cat / Turned savage"?
    * **Options:** A) A simile that makes the familiar suddenly threatening, B) A regular rhyme scheme, C) A refrain, D) An extended metaphor of paper
    * **Correct:** A
    * **Feedback:** ✓ Correct. The simile "like a tame cat / Turned savage" makes the domestic suddenly menacing, capturing how nature turns on the islanders without warning.
    * **Why B:** Storm on the Island is written in unrhymed blank verse, not regular rhyme.
    * **Why C:** There is no repeated refrain in the poem.
    * **Why D:** The paper metaphor belongs to Tissue, not this poem.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Storm on the Island", the greatest fear is of something invisible and intangible — "a huge nothing" — as much as the physical storm.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Heaney twists the threat inward: what truly unsettles is the "huge nothing" — the empty air and anticipation — as much as the storm's force.
    * **WhyWrong:** This is the poem's turn — the fear is of "a huge nothing", the invisible and intangible, not only the physical storm.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem begins "Suddenly he awoke and was running", plunging the reader straight into a soldier's terrified advance?
    * **Options:** A) Remains, B) Bayonet Charge, C) The Charge of the Light Brigade, D) War Photographer
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hughes's "Bayonet Charge" opens in medias res — "Suddenly he awoke and was running" — throwing us into the raw panic of combat.
    * **Why A:** Remains opens with the memory of a looting patrol, not a running charge.
    * **Why C:** The Charge of the Light Brigade opens with "Half a league", a cavalry charge.
    * **Why D:** War Photographer opens in a quiet darkroom, not a battlefield.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the structure of "Bayonet Charge" reflect its subject?
    * **Options:** A) A calm, ordered sonnet argues a case, B) A fragmented, in-medias-res structure mirrors the chaos of battle and the collapse of heroic ideals, C) A ballad refrain celebrates victory, D) Rhyming couplets create smooth control
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hughes opens mid-action and fractures the structure, the disorientating form mirroring panic and the breakdown of patriotic, heroic certainty.
    * **Why A:** The poem is deliberately disordered, not a calm, argued sonnet.
    * **Why C:** There is no celebratory refrain; the tone is terror, not triumph.
    * **Why D:** Its jolting form resists the smooth control of couplets.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What happens to the soldier's patriotism in "Bayonet Charge"?
    * **Options:** A) It grows stronger as he charges, B) It dissolves — "the patriotic tear" is replaced by raw instinct and the terror of survival, C) It is rewarded with a medal, D) It inspires the whole army
    * **Correct:** B
    * **Feedback:** ✓ Correct. The abstract "patriotic tear" burns away into animal fear; noble ideals collapse into the bare instinct to survive.
    * **Why A:** His patriotism disintegrates under terror rather than strengthening.
    * **Why C:** There is no reward; the poem strips war of glory.
    * **Why D:** The focus narrows to one man's panic, not an inspired army.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a soldier keep reliving a shooting, haunted by "his bloody life in my bloody hands"?
    * **Options:** A) Exposure, B) Remains, C) Poppies, D) Kamikaze
    * **Correct:** B
    * **Feedback:** ✓ Correct. Armitage's "Remains" follows a soldier's guilt over shooting a looter — "probably armed, possibly not" — whose memory he cannot escape.
    * **Why A:** Exposure concerns cold and futility, not a single haunting killing.
    * **Why C:** Poppies voices a mother's grief at home, not a soldier's guilt.
    * **Why D:** Kamikaze follows a pilot's return, not a soldier haunted by a shooting.

26. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Remains" is written in a loose, colloquial monologue that sounds like ordinary speech or spoken testimony.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Armitage uses a loose, conversational monologue — the plain, spoken voice makes the trauma feel immediate and real, drawn from a soldier's own testimony.
    * **WhyWrong:** This is true — the poem's loose, colloquial monologue mimics real spoken testimony, heightening the sense of genuine trauma.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the main concern of "Remains"?
    * **Options:** A) The glory of victory, B) The lasting psychological trauma and guilt of killing, which follows the soldier home, C) The beauty of the landscape, D) A celebration of army life
    * **Correct:** B
    * **Feedback:** ✓ Correct. The killing "remains" in the soldier's mind long after the event — Armitage centres the enduring psychological wound and guilt, a form of PTSD.
    * **Why A:** There is no glory here; only guilt and trauma.
    * **Why C:** The poem's focus is inward and psychological, not scenic.
    * **Why D:** It exposes war's cost rather than celebrating army life.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem voices a mother preparing to visit a war memorial, days "before Armistice Sunday", after her son has gone?
    * **Options:** A) Poppies, B) The Émigrée, C) Tissue, D) London
    * **Correct:** A
    * **Feedback:** ✓ Correct. Weir's "Poppies" follows a mother pinning a poppy to her son's blazer and later tracing "the inscriptions on the war memorial" in his absence.
    * **Why B:** The Émigrée remembers a lost homeland, not a mother and son.
    * **Why C:** Tissue meditates on paper and human fragility, not maternal grief.
    * **Why D:** London surveys a city's suffering, not one grieving mother.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Poppies" by Weir suit its subject?
    * **Options:** A) A strict sonnet argues a case, B) Free verse, with the drift of interior monologue, conveys a mother's private, wandering grief, C) A ballad refrain tells a heroic story, D) A villanelle's repetition celebrates victory
    * **Correct:** B
    * **Feedback:** ✓ Correct. The loose free verse and inward, monologue-like voice let the mother's grief drift naturally between memory and present, like an elegy for her son.
    * **Why A:** The poem flows like private thought, not a tightly argued sonnet.
    * **Why C:** It is an intimate elegy of grief, not a heroic ballad.
    * **Why D:** It mourns rather than celebrates, and is not a villanelle.

30. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "Poppies" explores the impact of war from the perspective of those left at home, especially a grieving mother, rather than from the battlefield.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Weir shifts war's cost onto the home front — the mother's ache, memory and loss — rather than depicting combat directly.
    * **WhyWrong:** This is true — the poem centres the mother left behind, showing war's grief through those at home rather than on the battlefield.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is set in a darkroom where a man develops photographs of distant wars — "Belfast. Beirut. Phnom Penh."?
    * **Options:** A) War Photographer, B) Exposure, C) Kamikaze, D) Remains
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "War Photographer" opens "In his darkroom he is finally alone", developing "spools of suffering" from Belfast, Beirut and Phnom Penh.
    * **Why B:** Exposure is set in the trenches, not a darkroom.
    * **Why C:** Kamikaze follows a pilot's flight and return, not a photographer.
    * **Why D:** Remains concerns a soldier's guilt, not a photographer's images.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the ordered form of "War Photographer" — regular six-line stanzas — serve the poem?
    * **Options:** A) It has no effect on meaning, B) Its rigid order contrasts with the chaos of the war scenes, mirroring the photographer's attempt to control suffering, C) It makes the poem a ballad, D) It proves the wars were peaceful
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat, controlled stanzas sit against the horror they contain, echoing the photographer ordering "spools of suffering" into frames he can manage.
    * **Why A:** The tension between orderly form and chaotic content is central.
    * **Why C:** Regular stanzas alone do not make a ballad; there is no narrative refrain.
    * **Why D:** The form contains the horror; it does not deny it.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What criticism does "War Photographer" make of the public back home?
    * **Options:** A) That they care too much and grieve endlessly, B) That they are indifferent — moved briefly, then returning to comfortable lives while others suffer, C) That they cause the wars directly, D) That they are all photographers
    * **Correct:** B
    * **Feedback:** ✓ Correct. Duffy indicts public apathy: readers' eyes "prick / with tears" only briefly before they return to comfort, while "they do not care".
    * **Why A:** The poem's charge is indifference, not excessive grief.
    * **Why C:** The public are accused of apathy, not of causing the wars.
    * **Why D:** Only the central figure is a photographer; the public are his distant audience.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem uses paper — receipts, maps, holy books, "paper that lets the light / shine through" — as a metaphor for human fragility and power?
    * **Options:** A) Tissue, B) Ozymandias, C) Poppies, D) The Émigrée
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dharker's "Tissue" builds an extended metaphor from paper — maps, documents, holy books — to explore how fragile and transient human power really is.
    * **Why B:** Ozymandias uses a ruined statue, not paper, as its symbol.
    * **Why C:** Poppies centres on a mother's grief, not paper imagery.
    * **Why D:** The Émigrée uses light and a remembered city, not the paper metaphor.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "Tissue" is written largely in free verse, in loose unrhymed quatrains, ending on a much shorter final line.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The airy free-verse quatrains and the pared-down closing line mirror the poem's theme of fragility and the light passing through paper.
    * **WhyWrong:** This is true — Dharker uses loose, unrhymed quatrains and a short final line, the open form echoing paper's delicacy.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the paper metaphor in "Tissue" ultimately suggest about human power and structures?
    * **Options:** A) They are permanent and unbreakable, B) They are as fragile and transient as paper, and might be more human if we accepted that fragility, C) They are worthless and should be destroyed, D) They have no connection to people at all
    * **Correct:** B
    * **Feedback:** ✓ Correct. Dharker implies that maps, money and monuments are as fragile as paper; embracing that transience — "turned into your skin" — is more truly human than clinging to control.
    * **Why A:** The whole point is impermanence, not permanence.
    * **Why C:** The poem values fragility; it does not urge destruction.
    * **Why D:** Paper "turned into your skin" ties these structures intimately to people.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem remembers a childhood homeland bathed in "sunlight", insisting on its brightness even though "it may be at war, it may be sick with tyrants"?
    * **Options:** A) The Émigrée, B) London, C) Storm on the Island, D) Bayonet Charge
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rumens's "The Émigrée" clings to a sunlit memory of a lost homeland, its "sunlight" undimmed even as the real place "may be sick with tyrants".
    * **Why B:** London depicts a present, oppressive city, not a remembered homeland.
    * **Why C:** Storm on the Island braces against weather, not exile and memory.
    * **Why D:** Bayonet Charge is set in the panic of combat, not nostalgic memory.

38. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** In "The Émigrée", the repeated image of [BLANK] runs through all three stanzas, keeping the remembered homeland bright despite everything.
    * **Answer:** sunlight
    * **Feedback:** ✓ Correct. The recurring "sunlight" threads through the poem, symbolising an idealised, undimmable memory of the lost city.
    * **WhyWrong:** The image is "sunlight" — its repetition keeps the remembered homeland glowing, however dark the reality has become.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What tension lies at the heart of "The Émigrée"?
    * **Options:** A) Between two lovers, B) Between an idealised, remembered homeland and the darker political reality that has overtaken it, C) Between a soldier and his commander, D) Between paper and stone
    * **Correct:** B
    * **Feedback:** ✓ Correct. The speaker's luminous, childlike memory of home is set against the tyranny and hostility that now surround it, and the accusing voices that "mutter death".
    * **Why A:** The poem's love is for a place, not a person.
    * **Why C:** There is no military hierarchy in the poem.
    * **Why D:** The paper-and-stone contrast belongs to Tissue and Ozymandias.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, written in non-standard phonetic spelling, contrasts the British history the speaker was taught with the Black history he was denied, as he "carving out me identity"?
    * **Options:** A) Checking Out Me History, B) London, C) War Photographer, D) My Last Duchess
    * **Correct:** A
    * **Feedback:** ✓ Correct. Agard's "Checking Out Me History" sets "Dem tell me" British history against suppressed Black figures — Toussaint, Nanny de Maroon, Mary Seacole — as the speaker reclaims his identity.
    * **Why B:** London critiques a city's institutions, not a suppressed history curriculum.
    * **Why C:** War Photographer concerns images of war, not education and identity.
    * **Why D:** My Last Duchess is a Duke's monologue, not a reclaiming of history.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the loose, non-standard form of "Checking Out Me History" serve its meaning?
    * **Options:** A) It suggests the speaker cannot write properly, B) It acts as resistance — breaking imposed rules of spelling and form to reclaim identity and a hidden history, C) It has no effect on meaning, D) It makes the poem a traditional sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rejecting standard spelling and form becomes an act of resistance, reclaiming a suppressed history and asserting the speaker's own voice and identity.
    * **Why A:** The non-standard form is a deliberate, meaningful choice, not a failure.
    * **Why C:** The form is central to the meaning of resistance and reclaimed identity.
    * **Why D:** The poem deliberately rejects fixed traditional forms like the sonnet.

42. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Checking Out Me History"?
    * **Options:** A) It protests a curriculum that taught British history while erasing Black history, B) It reclaims suppressed Black figures such as Toussaint and Mary Seacole, C) The final act of "carving out me identity" turns the whole poem towards self-definition and empowerment, D) It concludes that the speaker's own history does not matter
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Agard protests an erasing curriculum, restores suppressed Black heroes, and ends by "carving out me identity" — turning grievance into self-definition and empowerment.
    * **Why D:** The poem insists his history matters deeply; reclaiming it is the whole point.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** In which poem does a pilot set out on a one-way mission, turn back for love of life, and return home only to be treated "as though he no longer existed"?
    * **Options:** A) Kamikaze, B) Remains, C) The Charge of the Light Brigade, D) Exposure
    * **Correct:** A
    * **Feedback:** ✓ Correct. Garland's "Kamikaze" follows a pilot who turns back from his suicide mission, then is shunned by family and community "as though he no longer existed".
    * **Why B:** Remains concerns a soldier's guilt over a shooting, not a pilot's return.
    * **Why C:** The Charge of the Light Brigade honours a cavalry charge, not a lone pilot.
    * **Why D:** Exposure depicts soldiers frozen in the trenches, not a kamikaze pilot.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is the story of "Kamikaze" told?
    * **Options:** A) Entirely in the pilot's own first-person voice, B) Mostly in the third person, framed by the daughter's remembered, italicised voice, C) As a rhyming ballad with a refrain, D) As a strict sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The narrative is largely third-person but framed by the daughter's voice — the italicised, personal perspective layered over the pilot's story of duty and regret.
    * **Why A:** The pilot never speaks directly; his story is relayed by others.
    * **Why C:** There is no song-like refrain; the form is loose, not a ballad.
    * **Why D:** The poem runs across seven stanzas, not a fourteen-line sonnet.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What central conflict does "Kamikaze" explore?
    * **Options:** A) Between two rival armies, B) Between duty and honour on one side and the pull of life, family and beauty on the other, C) Between paper and stone, D) Between a photographer and his subjects
    * **Correct:** B
    * **Feedback:** ✓ Correct. The pilot is torn between the honour-code demanding his death and the beauty of the sea and life that call him home — where survival then costs him everything socially.
    * **Why A:** The poem's conflict is inward and social, not a clash of armies.
    * **Why C:** The paper-and-stone contrast belongs to Tissue and Ozymandias.
    * **Why D:** There is no photographer; that is War Photographer.
