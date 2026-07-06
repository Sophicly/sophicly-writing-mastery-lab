# Foundational Quiz Bank — Eduqas Poetry Anthology (Poems)

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
- **@set:1** — The Schoolboy · I Wandered Lonely as a Cloud · Blackberry-Picking · Catrin · Origin Story
- **@set:2** — Drummer Hodge · Disabled · Kamikaze · War Photographer · Remains
- **@set:3** — Cousin Kate · Sonnet 29 · Dusting the Phone · I Shall Return · Decomposition

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Eduqas Poetry Anthology

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does the speaker love to rise on a summer morning to birdsong and a "distant huntsman" winding his horn, only to dread school's "cruel eye outworn"?
   * **Options:** A) The Schoolboy, B) Catrin, C) Origin Story, D) I Wandered Lonely as a Cloud
   * **Correct:** A
   * **Feedback:** ✓ Correct. Blake's "The Schoolboy" opens with the boy's joy in summer birdsong and the "distant huntsman", but turns to dismay under the schoolmaster's "cruel eye outworn".
   * **Why B:** Catrin depicts a mother-daughter conflict, not a schoolboy's dawn joy.
   * **Why C:** Origin Story reflects on the speaker's parents' relationship, not a boy's school day.
   * **Why D:** I Wandered Lonely as a Cloud recalls a solitary walk among daffodils, not a schoolroom.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Blake use for "The Schoolboy"?
   * **Options:** A) A ballad narrating a battle, B) A simple, song-like lyric in short rhyming stanzas, typical of Blake's "Songs", C) A Petrarchan sonnet, D) Free verse with no rhyme
   * **Correct:** B
   * **Feedback:** ✓ Correct. Like Blake's other "Songs", the poem is built from short, simply rhymed stanzas that read almost like a nursery song, sharpening the contrast between childlike joy and adult confinement.
   * **Why A:** The poem is a personal complaint, not a narrated battle.
   * **Why C:** It has none of the sonnet's fourteen-line, argument-driven shape.
   * **Why D:** The poem is tightly rhymed, not unrhymed free verse.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** Why does Blake use the image of a bird "born for joy" shut in a cage in "The Schoolboy"?
   * **Options:** A) To praise the school's routine, B) To argue that forcing a naturally joyful child into confinement destroys that joy, just as caging silences a bird, C) To describe a real caged pet, D) To celebrate the huntsman's skill
   * **Correct:** B
   * **Feedback:** ✓ Correct. The rhetorical question about a bird "born for joy" sitting caged turns the boy's dismay into a wider argument: shutting a child away from nature and freedom can only blight, not nurture, growth.
   * **Why A:** The image is a protest against confinement, not praise for it.
   * **Why C:** The bird stands for the boy's own stifled joy, not a literal pet.
   * **Why D:** The huntsman appears only in the opening, joyful stanza, unconnected to this image.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Wordsworth's poem, the speaker wanders "lonely as a cloud" until he suddenly sees a "crowd, / A host, of golden [BLANK]" beside a lake.
   * **Answer:** daffodils
   * **Feedback:** ✓ Correct. The speaker's solitary drifting is interrupted by a great host of golden daffodils "fluttering and dancing in the breeze".
   * **WhyWrong:** The flower is "daffodils" — Wordsworth's "host, of golden daffodils" transforms a lonely walk into a lasting memory of joy.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "I Wandered Lonely as a Cloud" structured?
   * **Options:** A) Four six-line stanzas (sestets) in rhyming iambic tetrameter, B) An unrhymed sonnet, C) A single unbroken paragraph of free verse, D) Seven irregular stanzas with no rhyme
   * **Correct:** A
   * **Feedback:** ✓ Correct. The poem's four neat sestets, rhymed and flowing in iambic tetrameter, mirror the dance-like movement of the daffodils themselves.
   * **Why B:** It has no fourteen-line sonnet shape and is fully rhymed.
   * **Why C:** The poem is carefully rhymed and stanza-divided, not a single free-verse block.
   * **Why D:** Its rhyme is regular throughout, not absent.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "I Wandered Lonely as a Cloud", the final stanza reveals the memory of the daffodils continuing to bring the speaker comfort long after the walk itself, in "the bliss of solitude".
   * **Answer:** True
   * **Feedback:** ✓ Correct. The daffodils "flash upon that inward eye" whenever the speaker lies "in vacant or in pensive mood", proving that a single moment in nature can become a lasting source of joy.
   * **WhyWrong:** This is true — the closing stanza reveals memory alone reviving the same pleasure the daffodils first gave, recollected in tranquillity.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem follows children filling "milk cans" with blackberries, only to find the hoard turns to "a rat-grey fungus" in the byre?
   * **Options:** A) Blackberry-Picking, B) Catrin, C) Origin Story, D) The Schoolboy
   * **Correct:** A
   * **Feedback:** ✓ Correct. Heaney's "Blackberry-Picking" follows a summer of gathering berries "with milk cans, pea tins and jam-pots", only for the hoarded fruit to rot into "a rat-grey fungus, glutting on our cache".
   * **Why B:** Catrin concerns a mother and daughter's ongoing conflict, not berry-picking.
   * **Why C:** Origin Story reflects on the speaker's parents' courtship, not a summer harvest.
   * **Why D:** The Schoolboy laments schoolroom confinement, not fruit gathered outdoors.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "Blackberry-Picking" structured?
   * **Options:** A) A single sonnet, B) Two verse paragraphs of loosely rhymed lines — the first savouring the harvest, the second turning to decay, C) A strict villanelle with refrains, D) A ballad with a repeated chorus
   * **Correct:** B
   * **Feedback:** ✓ Correct. The two verse paragraphs mirror the poem's turn — the first paragraph's sensuous gathering giving way to the second's souring and regret.
   * **Why A:** The poem runs across two paragraphs, not a single fourteen-line sonnet.
   * **Why C:** There are no villanelle-style repeating refrain lines.
   * **Why D:** Nothing in the poem repeats as a chorus; it moves forward from harvest to decay.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the final line, "Each year I hoped they'd keep, knew they would not," reveal about "Blackberry-Picking"?
   * **Options:** A) That the speaker never picked berries again, B) A recognition that hoping to preserve something perfect cannot stop time and decay, however much one wishes it, C) That the berries were never sweet to begin with, D) That the rot was the children's fault
   * **Correct:** B
   * **Feedback:** ✓ Correct. The closing admission sets hope against experience — every year the same longing to keep the berries, and every year the same inevitable rot, an early lesson in impermanence and loss.
   * **Why A:** The line implies the cycle happens "each year", so picking continues.
   * **Why C:** The berries were "sweet" at first, "like thickened wine" — the loss is what makes the rot painful.
   * **Why D:** The rot is treated as natural and inevitable, not a fault of the children.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** In which poem does a mother recall standing "in a hot, white / Room" at her child's birth, then a present-day battle over her daughter's request to "skate in the dark, for one more hour"?
    * **Options:** A) Catrin, B) Dusting the Phone, C) I Wandered Lonely as a Cloud, D) Cousin Kate
    * **Correct:** A
    * **Feedback:** ✓ Correct. Clarke's "Catrin" moves from the "hot, white" hospital room of birth to a present argument over the daughter wanting to "skate in the dark, for one more hour", showing love and conflict as one continuous "rope".
    * **Why B:** Dusting the Phone voices longing for a lover's call, not a mother-daughter bond.
    * **Why C:** I Wandered Lonely as a Cloud recalls solitary nature, not a birth or a daughter.
    * **Why D:** Cousin Kate is a ballad of seduction and betrayal, not motherhood.

11. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** Clarke calls the hospital room a "square / [BLANK] blank, disinfected / Of paintings or toys" to picture the sterile setting of Catrin's birth.
    * **Answer:** Environmental
    * **Feedback:** ✓ Correct. The clinical phrase "Environmental blank" strips the hospital room of any warmth, against which the raw, physical bond of birth stands out.
    * **WhyWrong:** The word is "Environmental" — Clarke's "square, Environmental blank" pictures a room stripped of all comfort.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the recurring image of the "red rope" suggest about the relationship in "Catrin"?
    * **Options:** A) That mother and daughter have never had any connection, B) That love and conflict are bound together — the same tie that connects them is also what they pull against, C) That the daughter has run away permanently, D) That the poem is really about two strangers
    * **Correct:** B
    * **Feedback:** ✓ Correct. The "tight red rope of love" from birth returns at the poem's end as the daughter again pulls against her mother — the same bond that connects them is the very thing both are "fighting" over.
    * **Why A:** The rope image insists on a deep, continuing connection, not its absence.
    * **Why C:** The final argument is over one more hour out, not a permanent separation.
    * **Why D:** The intimacy of "our first fierce confrontation" makes clear this is mother and daughter, not strangers.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem opens "This is true:" and retells how the speaker's parents met at "the Greyhound bus station in the mid-eighties in Chicago", her mother buying her father's comic book for "one dollar"?
    * **Options:** A) Origin Story, B) Sonnet 29, C) Drummer Hodge, D) Decomposition
    * **Correct:** A
    * **Feedback:** ✓ Correct. Ewing's "Origin Story" opens "This is true:" and recounts her parents meeting at "the Greyhound bus station" in Chicago, her mother buying her father's hand-drawn comic book for "one dollar" — the ordinary beginning of a lasting love.
    * **Why B:** Sonnet 29 addresses the speaker's own overwhelming love directly, not a parents' backstory.
    * **Why C:** Drummer Hodge mourns a soldier buried far from home, unconnected to a parents' romance.
    * **Why D:** Decomposition reflects on a photograph of a stranger, not the speaker's own family history.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How is "Origin Story" written, and what does its central comparison — "love is like a comic book. it's fragile" — suggest?
    * **Options:** A) As a strict rhyming sonnet, suggesting a formal, timeless love, B) In free verse with conversational, unconventional punctuation, its comic-book comparison suggesting an ordinary love is fragile yet worth carefully protecting, C) As a formal ballad with a chorus, suggesting the parents' story is legendary, D) In rigid, numbered stanzas of equal length, suggesting a case study
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's free verse and loose, lower-case punctuation read like spoken storytelling, while likening the parents' love to a comic book that is "fragile" and kept safe in "plastic and cardboard, dark rooms and boxes" suggests an ordinary love is still worth preserving.
    * **Why A:** The poem has no fixed rhyme scheme or fourteen-line shape.
    * **Why C:** There is no sung refrain or chorus structure.
    * **Why D:** Its loose, conversational form resists rigid, equal-length stanzas.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Origin Story"?
    * **Options:** A) It reframes the parents' courtship, from meeting at "the Greyhound bus station" to the comic book sold for "one dollar", using the language of a superhero origin story, B) Comparing their love to a comic book that could "find its way to another decade, another home" suggests ordinary, imperfect love can still be preserved and cherished, C) Its free verse and casual, lower-case punctuation give it a modern, conversational storytelling voice, D) It concludes that real relationships are less significant than fictional ones
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Ewing borrows superhero "origin story" language, likens the parents' love to a comic book that could "find its way to another decade, another home", and tells it all in a free, conversational voice suited to modern storytelling.
    * **Why D:** The poem elevates the parents' real story rather than diminishing it against fiction.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem buries a young soldier "Uncoffined – just as found" beneath a "kopje-crest", far from his "Wessex home"?
    * **Options:** A) Drummer Hodge, B) Remains, C) Disabled, D) War Photographer
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's "Drummer Hodge" pictures a boy soldier thrown into an unmarked Boer War grave, "Uncoffined – just as found", his landmark only a "kopje-crest" on the veldt.
    * **Why B:** Remains follows a soldier's guilt over a shooting, not a burial far from home.
    * **Why C:** Disabled contrasts a wounded soldier's past and present, not a burial abroad.
    * **Why D:** War Photographer concerns a photographer developing images of war, not Hodge's grave.

17. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Drummer Hodge" is shaped as three short [BLANK]-line stanzas of rhymed, regular metre, giving the boy's death a plain, song-like dignity.
    * **Answer:** six
    * **Feedback:** ✓ Correct. The three neat six-line stanzas, rhymed throughout, give the poem a controlled, elegiac calm despite the bleakness of an anonymous burial.
    * **WhyWrong:** The stanzas are six lines long — Hardy's plain, regular form lends the burial an understated, ballad-like dignity.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does Hardy suggest by writing that Hodge will become "portion of that unknown plain" for ever, his "homely Northern breast and brain" growing "to some Southern tree"?
    * **Options:** A) That Hodge will be forgotten entirely, B) That even in an anonymous, alien grave, the soldier becomes permanently and intimately part of the foreign land he never understood, C) That his body will be brought home eventually, D) That the poem celebrates the glory of empire
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hardy transforms the anonymity of Hodge's grave into a strange permanence — his body merging with the "unknown plain" and its "strange-eyed constellations", so the unfamiliar land absorbs him for ever.
    * **Why A:** The poem's whole purpose is to memorialise Hodge, even in his namelessness.
    * **Why C:** The imagery insists he stays fused with the "Southern tree" and plain, not returned home.
    * **Why D:** The tone mourns waste and estrangement, not imperial glory.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem opens with a wounded ex-soldier who "sat in a wheeled chair, waiting for dark", remembering when "Town used to swing so gay" before he lost his legs?
    * **Options:** A) Disabled, B) Remains, C) Kamikaze, D) Drummer Hodge
    * **Correct:** A
    * **Feedback:** ✓ Correct. Owen's "Disabled" opens with the maimed young man "waiting for dark" in his wheelchair, his mind drifting back to the football glory and admiration of when "Town used to swing so gay".
    * **Why B:** Remains follows a soldier haunted by a shooting, not amputation and lost youth.
    * **Why C:** Kamikaze concerns a pilot's return from a suicide mission, not a wheelchair-bound veteran.
    * **Why D:** Drummer Hodge is buried far from home; this soldier survives, disabled, at home.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does Owen structure "Disabled" to make its point?
    * **Options:** A) A single unbroken present-tense account, B) Shifting between the bleak present and vivid memories of his able-bodied past, so the contrast exposes what war has taken from him, C) A strict, cheerful sonnet, D) A dialogue between two soldiers
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen cuts between the soldier's grey present and the glow of memory — football, admiring girls, an artist sketching his face — so each shift sharpens what his injuries have cost him.
    * **Why A:** The poem deliberately moves between past and present, not a single continuous moment.
    * **Why C:** Its tone is bitter and mournful, far from a cheerful form.
    * **Why D:** The soldier's own voice and memory dominate; there is no second speaking soldier.

21. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Disabled", Owen suggests the young man enlisted partly out of a naive, romantic idea of war and to impress a girl, only to return maimed and ignored.
    * **Answer:** True
    * **Feedback:** ✓ Correct. He joined for the romance of glinting "jewelled hilts" and to look smart in uniform for a girl, lying about his age — an illusion Owen exposes as hollow once the soldier returns broken and overlooked.
    * **WhyWrong:** This is true — the poem reveals the soldier's youthful, romanticised reasons for enlisting curdling into isolation and neglect on his return.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem, framed through a daughter's voice, follows a father-pilot who turns his plane back from a one-way mission, drawn by the "green-blue translucent sea"?
    * **Options:** A) Kamikaze, B) War Photographer, C) Remains, D) Disabled
    * **Correct:** A
    * **Feedback:** ✓ Correct. Garland's "Kamikaze" follows a pilot who abandons his suicide mission, pulled back by memories of the sea's "shoals of fish flashing silver", only to be shunned by his family on his return.
    * **Why B:** War Photographer is set in a darkroom developing images of conflict, not a cockpit over the sea.
    * **Why C:** Remains concerns a soldier's guilt over a killing, not a pilot's turning back.
    * **Why D:** Disabled follows a wounded veteran at home, not a pilot's flight.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is the story of "Kamikaze" told?
    * **Options:** A) Entirely in the pilot's own first-person voice, B) Mostly in the third person, framed by the daughter's remembered, italicised voice, C) As a rhyming ballad with a refrain, D) As a strict sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The narrative is largely third-person but framed by the daughter's voice — her italicised, personal perspective layered over her father's story of duty and regret.
    * **Why A:** The pilot never speaks directly; his story is relayed by his daughter.
    * **Why C:** There is no song-like refrain; the form is loose, not a ballad.
    * **Why D:** The poem runs across several stanzas, not a fourteen-line sonnet.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What central conflict does "Kamikaze" explore?
    * **Options:** A) Between two rival armies, B) Between duty and honour on one side and the pull of life, family and beauty on the other, C) Between paper and stone, D) Between a photographer and his subjects
    * **Correct:** B
    * **Feedback:** ✓ Correct. The pilot is torn between the honour-code demanding his death and the pull of life and beauty that call him home — a choice that then costs him everything socially.
    * **Why A:** The poem's conflict is inward and social, not a clash of armies.
    * **Why C:** There is no paper-and-stone imagery in this poem.
    * **Why D:** There is no photographer in "Kamikaze".

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem is set in a darkroom where a man develops photographs of distant wars, among them "Belfast. Beirut. Phnom Penh."?
    * **Options:** A) War Photographer, B) Kamikaze, C) Drummer Hodge, D) Disabled
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "War Photographer" opens with the photographer alone in his darkroom, developing "spools of suffering" from Belfast, Beirut and Phnom Penh.
    * **Why B:** Kamikaze follows a pilot's flight and return, not a photographer's darkroom.
    * **Why C:** Drummer Hodge concerns a soldier's burial, not photography.
    * **Why D:** Disabled follows a wounded veteran, not a war photographer.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the ordered form of "War Photographer" — regular six-line stanzas — serve the poem?
    * **Options:** A) It has no effect on meaning, B) Its rigid order contrasts with the chaos of the war scenes, mirroring the photographer's attempt to control suffering, C) It makes the poem a ballad, D) It proves the wars were peaceful
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat, controlled stanzas sit against the horror they contain, echoing the photographer ordering "spools of suffering" into frames he can manage.
    * **Why A:** The tension between orderly form and chaotic content is central to the poem.
    * **Why C:** Regular stanzas alone do not make a ballad; there is no narrative refrain.
    * **Why D:** The form contains the horror; it does not deny it.

27. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "War Photographer"?
    * **Options:** A) It criticises the public back home for feeling only brief, passing sympathy for others' suffering, B) The ordered, six-line stanzas contrast with the chaos of the scenes the photographer has witnessed, C) The photographer feels a lasting unease about the distance between suffering and its audience, D) It celebrates how deeply readers of newspapers care about distant wars
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Duffy indicts public indifference, uses ordered stanzas to contain chaotic content, and leaves the photographer uneasy at how little his images truly change his audience.
    * **Why D:** The poem accuses readers of fleeting concern, not deep or lasting care.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** In which poem does a soldier keep reliving a shooting, haunted by "his bloody life in my bloody hands"?
    * **Options:** A) Remains, B) Disabled, C) Drummer Hodge, D) Kamikaze
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "Remains" follows a soldier's guilt over shooting a looter — "probably armed, possibly not" — whose memory he cannot escape.
    * **Why B:** Disabled concerns a soldier's lost limbs and youth, not a haunting killing.
    * **Why C:** Drummer Hodge is buried anonymously abroad, with no surviving guilt to relive.
    * **Why D:** Kamikaze follows a pilot's return, not a soldier haunted by a shooting.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Remains" is written in a loose, colloquial monologue that sounds like ordinary speech or spoken testimony.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Armitage uses a loose, conversational monologue — the plain, spoken voice makes the trauma feel immediate and real, drawn from a soldier's own testimony.
    * **WhyWrong:** This is true — the poem's loose, colloquial monologue mimics real spoken testimony, heightening the sense of genuine trauma.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the main concern of "Remains"?
    * **Options:** A) The glory of victory, B) The lasting psychological trauma and guilt of killing, which follows the soldier home, C) The beauty of the landscape, D) A celebration of army life
    * **Correct:** B
    * **Feedback:** ✓ Correct. The killing "remains" in the soldier's mind long after the event — Armitage centres the enduring psychological wound and guilt, a trauma that will not fade.
    * **Why A:** There is no glory here; only guilt and trauma.
    * **Why C:** The poem's focus is inward and psychological, not scenic.
    * **Why D:** It exposes war's cost rather than celebrating army life.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem has a "cottage maiden" lament that a "great lord" lured and discarded her for her own "Cousin Kate", though she has a "fair-haired son" Kate cannot match?
    * **Options:** A) Cousin Kate, B) Sonnet 29, C) Dusting the Phone, D) Decomposition
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rossetti's "Cousin Kate" gives voice to a cottage girl seduced and cast off by a "great lord" who marries her cousin instead, though she alone has borne him a "fair-haired son".
    * **Why B:** Sonnet 29 is a declaration of overwhelming love, not a tale of seduction and betrayal.
    * **Why C:** Dusting the Phone voices longing for a lover's call, not an abandoned mother.
    * **Why D:** Decomposition reflects on a photograph of a stranger, not a personal betrayal.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Cousin Kate" is written in which form?
    * **Options:** A) A ballad, in plain rhyming stanzas that tell its story of betrayal and loss, B) A Petrarchan sonnet, C) An ode, D) Free verse
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rossetti uses a traditional ballad, its narrative stanzas and direct, song-like voice carrying the story of the speaker's seduction and social ruin.
    * **Why B:** It is a narrative told in stanzas, not a fourteen-line sonnet.
    * **Why C:** An ode is a formal poem of praise, not this tale of wrong.
    * **Why D:** Its regular, rhymed narrative stanzas make it a ballad, not free verse.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the speaker mean by claiming she has "a gift you have not got" in the closing stanzas of "Cousin Kate"?
    * **Options:** A) That she is wealthier than Kate, B) That her son gives her a private pride and claim on the lord that Kate's respectable marriage cannot provide, C) That she has forgiven the lord completely, D) That she plans to steal Kate's wedding ring
    * **Correct:** B
    * **Feedback:** ✓ Correct. Naming her son "my shame, my pride", the speaker finds one thing status and marriage cannot give Kate — a defiant, complicating claim of her own on the lord, even from her cast-off position.
    * **Why A:** The poem stresses Kate's gold and comfort against the speaker's own poverty.
    * **Why C:** Her bitterness towards the lord and Kate runs through every stanza; there is no forgiveness.
    * **Why D:** The son, not the ring, is the "gift" she claims — the poem never mentions theft.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem compares the speaker's constant thoughts of her beloved to "wild vines" twining thickly about a "palm-tree", until she longs for his real presence instead?
    * **Options:** A) Sonnet 29, B) I Wandered Lonely as a Cloud, C) Cousin Kate, D) Origin Story
    * **Correct:** A
    * **Feedback:** ✓ Correct. In Elizabeth Barrett Browning's "Sonnet 29", thoughts of the beloved grow like "wild vines... about a tree", so thickly that she begs him to "renew" his presence and burst the "bands of greenery" apart.
    * **Why B:** I Wandered Lonely as a Cloud uses daffodils in solitary memory, not a vine-and-tree metaphor for love.
    * **Why C:** Cousin Kate is a ballad of betrayal, not a sonnet of devoted love.
    * **Why D:** Origin Story reflects on the speaker's parents' courtship, not her own direct address to a beloved.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Sonnet 29" is, as its title states, a [BLANK], its fourteen lines building and then turning at the volta to demand the beloved's real presence over mere thought.
    * **Answer:** sonnet
    * **Feedback:** ✓ Correct. The poem's sonnet form disciplines the speaker's overwhelming feeling into fourteen lines, with a volta that pivots from imagining her beloved to longing for him in person.
    * **WhyWrong:** The word is "sonnet" — its fixed, fourteen-line shape gives ordered intensity to a feeling that threatens to overwhelm.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the final turn of "Sonnet 29"?
    * **Options:** A) The speaker decides she no longer loves him, B) The speaker rejects thought alone and longs instead for his actual, physical presence — "I do not think of thee—I am too near thee", C) The speaker compares him to a rival, D) The speaker describes a battle
    * **Correct:** B
    * **Feedback:** ✓ Correct. The closing couplet overturns the whole extended metaphor: real closeness would make thought unnecessary — "I do not think of thee—I am too near thee" — presence outweighing imagination.
    * **Why A:** The poem is a declaration of overwhelming love, not its rejection.
    * **Why C:** No rival appears; the poem addresses the beloved directly.
    * **Why D:** There is no battle imagery; the metaphor is botanical (vines and a tree).

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem depicts a woman polishing and dressing for a silent telephone — "Silver service. I polish it. I dress for it." — as she waits for her lover to call?
    * **Options:** A) Dusting the Phone, B) Sonnet 29, C) Cousin Kate, D) I Shall Return
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jackie Kay's "Dusting the Phone" depicts the speaker polishing and dressing for the telephone — "Silver service. I polish it. I dress for it." — her ritual devotion to the silent object standing in for her anxious wait for her lover's call.
    * **Why B:** Sonnet 29 addresses a beloved directly and confidently, not through anxious waiting for contact.
    * **Why C:** Cousin Kate narrates a completed betrayal, not present-tense waiting for a call.
    * **Why D:** I Shall Return is a vow to return to a homeland, not a wait for a lover's call.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Dusting the Phone" written, and what effect does its clipped line "The phone rings heralding some disaster. Sirens." create?
    * **Options:** A) As a fixed, rhyming sonnet, building calm certainty, B) As a free-verse monologue, its sentence fragments and personified phone conveying anxious, obsessive longing, C) As a formal ballad, narrating events at a distance, D) As a strict villanelle, its refrains offering reassurance
    * **Correct:** B
    * **Feedback:** ✓ Correct. Kay's free verse and clipped, fragmented sentences — "The phone rings heralding some disaster. Sirens." — enact the woman's restless, obsessive waiting, while the phone is personified as if it holds power over her.
    * **Why A:** The poem has no fixed rhyme scheme or sonnet shape.
    * **Why C:** There is no narrative ballad structure or refrain.
    * **Why D:** The poem does not use a villanelle's strict repeating refrains.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Dusting the Phone" suggest about the effect of waiting for a lover's call, given the speaker admits "I am trapped in it. I can't move."?
    * **Options:** A) That waiting brings only calm confidence, B) That prolonged uncertainty and dependency on someone else's contact can wear away at a person's emotional balance, trapping her even as she longs for the call, C) That the phone itself is broken, D) That the speaker no longer cares about the relationship
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem reveals how silence and uncertainty, stretched out over time, erode confidence and hope — "I am trapped in it. I can't move." — however much the speaker longs to control her own feelings.
    * **Why A:** The speaker's anxious fragments show unease, not calm confidence.
    * **Why C:** The poem's focus is emotional, not a literal fault with the telephone.
    * **Why D:** Her obsessive attention to the phone reveals she cares intensely, not that she has stopped caring.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem repeats the vow "I shall return" to a home the speaker recalls through "forest fires", "bending grasses" and village "fiddle and fife"?
    * **Options:** A) I Shall Return, B) Decomposition, C) Drummer Hodge, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. Claude McKay's "I Shall Return" repeats its title vow across three quatrains of remembered homeland imagery — forest fires, mountain streams, village dances — before easing "long, long years of pain".
    * **Why B:** Decomposition reflects on a photograph of a stranger, not a vow to return home.
    * **Why C:** Drummer Hodge concerns a soldier who will never return, buried abroad.
    * **Why D:** Catrin is about a mother and daughter, not exile and a longed-for homeland.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "I Shall Return" structured?
    * **Options:** A) A sonnet of three quatrains and a closing couplet, its repeated vow building through each stanza, B) A single unrhymed stanza, C) A ballad with dialogue, D) A poem entirely without a title-line refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem follows the traditional sonnet pattern — three quatrains and a couplet — using the repeated vow "I shall return" to build longing towards its resolving final couplet.
    * **Why B:** The poem is rhymed and divided into four sections, not one unrhymed stanza.
    * **Why C:** There is no dialogue between characters; it is a single vowing voice.
    * **Why D:** The title phrase recurs as a refrain across the poem, not just once.

42. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "I Shall Return"?
    * **Options:** A) It expresses a longing to return to a remembered, idealised homeland, B) The repeated vow "I shall return" builds a growing sense of determination across the poem, C) The closing couplet links returning home to easing "long, long years of pain", D) It concludes that the speaker has given up on ever returning
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. McKay's speaker longs for a remembered homeland, repeats his vow with mounting determination, and ties the return to relief from long years of exile's pain.
    * **Why D:** The whole poem insists on the certainty of return, never abandoning the hope.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem centres on the speaker's memory of photographing a sleeping beggar in Bombay, and his guilt at having taken the picture for the wrong reasons?
    * **Options:** A) Decomposition, B) War Photographer, C) I Shall Return, D) Cousin Kate
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zulfikar Ghose's "Decomposition" recalls a photograph of a sleeping beggar in Bombay, moving from a detached, artistic description towards uneasy recognition of the man's real suffering.
    * **Why B:** War Photographer concerns a professional photographer of distant wars, not this single remembered image of a beggar.
    * **Why C:** I Shall Return is a vow of homecoming, not a meditation on a photograph.
    * **Why D:** Cousin Kate is a ballad of betrayal, unrelated to photography or poverty.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Decomposition" written?
    * **Options:** A) As a fixed, rhyming ballad, B) In free verse, its loose, unrhymed lines allowing the description to shift from detached composition towards uncomfortable self-awareness, C) As a Petrarchan sonnet, D) As a villanelle with repeating refrains
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's free verse mirrors its shifting focus — beginning as if composing an artistic image, then loosening into the speaker's guilty recognition of the man's real, decaying poverty.
    * **Why A:** The poem has no regular rhyme or ballad-style narrative stanzas.
    * **Why C:** It does not keep to a fourteen-line sonnet shape.
    * **Why D:** There are no repeating refrains as in a villanelle.

45. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Decomposition" suggest about observing another person's suffering as art?
    * **Options:** A) That artistic composition is always more important than compassion, B) That treating suffering as an aesthetic subject can dangerously overshadow genuine human empathy for the person suffering, C) That the beggar in the poem was never really suffering, D) That photography has no power to make people uncomfortable
    * **Correct:** B
    * **Feedback:** ✓ Correct. Ghose's speaker realises that framing the beggar's decay as a composed image risks replacing real compassion with detached aesthetic pleasure — a discomfort the poem forces the reader to share.
    * **Why A:** The poem's unease comes from privileging composition over compassion, not endorsing it.
    * **Why C:** The imagery of decay and poverty presents the man's suffering as painfully real.
    * **Why D:** The poem's whole effect depends on photography's power to unsettle and implicate its viewer.
