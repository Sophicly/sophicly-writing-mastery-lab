# Foundational Quiz Bank — Edexcel IGCSE Literature Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
48 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. Unlike
the universal forms bank (`poetic_forms.md`, Tier A), these are poem-specific, testing what the
student has actually read. The picker draws a random 5 per round, stratified across categories.
Keys + feedback live server-side and are stripped before questions reach the client. The AI is
never the scorekeeper.

Categories: Recognising the Poem · Form & Features · Meaning & Effects
Types: MCQ · Fill · True-False · Select All

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time (set 3 holds
6) by the course's reading order, so the quiz only serves poems the student has read:
- **@set:1** — Sonnet 116 (William Shakespeare) · La Belle Dame sans Merci (John Keats) · My Last Duchess (Robert Browning) · Remember (Christina Rossetti) · Poem at Thirty-Nine (Alice Walker)
- **@set:2** — Blessing (Imtiaz Dharker) · Search For My Tongue (Sujata Bhatt) · Half-caste (John Agard) · Prayer Before Birth (Louis MacNeice) · If— (Rudyard Kipling)
- **@set:3** (6 poems) — Half-past Two (U. A. Fanthorpe) · Piano (D. H. Lawrence) · Hide and Seek (Vernon Scannell) · Do not go gentle into that good night (Dylan Thomas) · War Photographer (Carol Ann Duffy) · The Tyger (William Blake)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: IGCSE Literature Poetry (Poems)

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that true love "is an ever-fixed mark" that never alters, even though "rosy lips and cheeks" fall within "his bending sickle's compass"?
   * **Options:** A) Sonnet 116, B) Remember, C) My Last Duchess, D) La Belle Dame sans Merci
   * **Correct:** A
   * **Feedback:** ✓ Correct. Shakespeare's "Sonnet 116" insists love does not alter with time or circumstance, comparing it to a fixed mark that survives even as beauty fades.
   * **Why B:** Remember asks a loved one not to grieve after death; it does not build this definition of unchanging love.
   * **Why C:** My Last Duchess is the Duke's own account of a wife he had killed, not an argument about constant love.
   * **Why D:** La Belle Dame sans Merci tells of a knight enchanted and abandoned, not a definition of steadfast love.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What form does Shakespeare use for "Sonnet 116", and how does it build its argument?
   * **Options:** A) A villanelle with two recurring refrains, B) A sonnet — three quatrains of argument sealed by a final rhyming couplet, C) A ballad narrating a love story, D) Free verse with no fixed rhyme
   * **Correct:** B
   * **Feedback:** ✓ Correct. The sonnet's three quatrains build the case for constant love step by step, and the closing couplet clinches it with a personal, almost legal, guarantee.
   * **Why A:** A villanelle circles around two repeating refrains; this poem argues in quatrains and a couplet instead.
   * **Why C:** There is no narrative here — the poem argues a definition, rather than telling a story.
   * **Why D:** The poem keeps strict rhyme and metre throughout, so it is not free verse.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the effect of the closing couplet, "If this be error and upon me proved, / I never writ, nor no man ever loved"?
   * **Options:** A) It undercuts everything argued before, admitting the speaker was wrong, B) It stakes the poet's own reputation as a writer on the truth of love's constancy, clinching the argument with total conviction, C) It introduces a joke to lighten the poem's tone, D) It apologises to the reader for the poem's claims
   * **Correct:** B
   * **Feedback:** ✓ Correct. By risking his entire authorship on the claim, Shakespeare turns a definition into an absolute, unshakeable vow — love's constancy becomes as certain as his own existence as a writer.
   * **Why A:** The couplet is a challenge, not a retraction — it dares anyone to disprove the claim.
   * **Why C:** The tone is solemn and assertive, not comic.
   * **Why D:** There is no apology; the couplet stakes a claim rather than backing down from one.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** In Keats's ballad, the faery lady feeds the enchanted knight "roots of relish sweet, / And honey wild, and manna [BLANK]".
   * **Answer:** dew
   * **Feedback:** ✓ Correct. "Manna dew" is part of the strange, enchanted food the lady gives the knight before he falls under her spell.
   * **WhyWrong:** The word is "dew" — the lady's gifts of "honey wild, and manna dew" mark the knight's seduction into her enchanted world.

5. **Type: True-False [Tests Form & Features]**
   @set:1
   * **Question:** "La Belle Dame sans Merci" is written as a ballad, using regular rhyming quatrains and a story-telling structure with a shorter final line in each stanza.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Keats uses the traditional ballad quatrain, its clipped final line giving each stanza a haunting, song-like close.
   * **WhyWrong:** This is true — the poem's regular quatrains and shortened final lines are the hallmark of the ballad form Keats borrows for this haunting tale.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the knight's abandonment "on the cold hill's side" suggest about the poem's vision of love and enchantment?
   * **Options:** A) That love always ends in mutual happiness, B) That enchantment and desire can be seductive yet destructive, leaving the lover wasted and isolated, C) That the poem is a purely comic tale, D) That the knight chooses to leave the lady of his own free will
   * **Correct:** B
   * **Feedback:** ✓ Correct. The knight is left "palely loitering", drained and alone, showing how the lady's beauty and enchantment prove dangerous rather than nurturing.
   * **Why A:** The knight is abandoned and wasted, the opposite of a happy ending.
   * **Why C:** The tone is eerie and mournful throughout, not comic.
   * **Why D:** The knight is left behind by the lady's vanishing, not by his own choice.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** In which poem does a Duke show a visitor a portrait of his late wife, letting slip through his own words that he had her killed for smiling too freely at others?
   * **Options:** A) My Last Duchess, B) Sonnet 116, C) Remember, D) La Belle Dame sans Merci
   * **Correct:** A
   * **Feedback:** ✓ Correct. Browning's Duke of Ferrara reveals, almost in passing, that "I gave commands; / Then all smiles stopped together" — his jealous control over his last Duchess ended in her death.
   * **Why B:** Sonnet 116 defines constant love; it contains no Duke or murdered wife.
   * **Why C:** Remember is a plea not to grieve after death, not a Duke's confession.
   * **Why D:** La Belle Dame sans Merci concerns a knight enchanted by a faery lady, not a Duke and a portrait.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How is "My Last Duchess" structured, and what effect does this have?
   * **Options:** A) Free verse capturing spontaneous, unplanned thought, B) A dramatic monologue in rhyming couplets, smoothed over by enjambment so the Duke's menace hides beneath calm, controlled speech, C) A villanelle with two recurring refrains, D) A ballad quatrain telling a folk story
   * **Correct:** B
   * **Feedback:** ✓ Correct. The couplets are disguised by enjambment, giving the Duke's voice a fluent, composed surface under which his jealous cruelty gradually emerges.
   * **Why A:** The poem is tightly rhymed throughout, not free verse.
   * **Why C:** There are no repeating refrains; it is one continuous dramatic speech.
   * **Why D:** It is a single extended monologue, not a story told in song-like quatrains.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the Duke's closing remark about a bronze statue of Neptune "taming a sea-horse" reveal about him?
   * **Options:** A) His appreciation of art purely for its own sake, B) His obsession with mastering and possessing beautiful things, echoing how he treated his last Duchess, C) His plan to remarry for love alone, D) His regret over his wife's death
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of a god taming a wild creature mirrors the Duke's own need to control and own beauty — the same impulse that destroyed his Duchess.
   * **Why A:** He prizes the statue as a "rarity" he possesses, not for art's own sake alone.
   * **Why C:** He is already negotiating a new dowry, showing possession rather than romantic feeling.
   * **Why D:** He voices no remorse; he moves straight from her death to negotiating his next match.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which sonnet begins "Remember me when I am gone away, / Gone far away into the silent land" and asks a loved one not to grieve?
    * **Options:** A) Remember, B) Sonnet 116, C) My Last Duchess, D) Poem at Thirty-Nine
    * **Correct:** A
    * **Feedback:** ✓ Correct. Rossetti's "Remember" opens with this plea, then turns towards releasing the loved one from grief rather than clinging to memory.
    * **Why B:** Sonnet 116 defines constant love; it does not address death or memory in this way.
    * **Why C:** My Last Duchess is the Duke's own monologue, not an address to a loved one about being remembered.
    * **Why D:** Poem at Thirty-Nine is a daughter's tribute to her father, not a plea about being forgotten.

11. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** "Remember" is a [BLANK] — a fourteen-line poem whose volta turns from pleading to be remembered towards releasing the loved one from grief.
    * **Answer:** sonnet
    * **Feedback:** ✓ Correct. The sonnet form gives Rossetti room to build her plea in the octave, then turn it in the sestet towards selfless comfort.
    * **WhyWrong:** The word is "sonnet" — its fourteen lines and volta carry the poem from a request to be remembered towards a gentler, more selfless conclusion.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What is the emotional turn, or volta, of "Remember"?
    * **Options:** A) From anger towards forgiveness, B) From asking to be remembered towards accepting being forgotten, if forgetting brings happiness rather than grief, C) From love towards resentment, D) From describing the past towards describing the future only
    * **Correct:** B
    * **Feedback:** ✓ Correct. Having asked to be remembered, the speaker turns to say it is "better far" to be forgotten and smile than to be remembered and grieve — love expressed as selflessness.
    * **Why A:** There is no anger in the poem; its tone stays tender throughout.
    * **Why C:** The turn moves towards generosity, not resentment.
    * **Why D:** The turn is about how to feel, not simply a shift in tense.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem is a daughter's tribute to her late father, remembering his practical skill and care, and voicing regret at questions she never asked him before he died?
    * **Options:** A) Poem at Thirty-Nine, B) Piano, C) Prayer Before Birth, D) Hide and Seek
    * **Correct:** A
    * **Feedback:** ✓ Correct. Alice Walker's "Poem at Thirty-Nine" reflects on her father's everyday skill and care, and on the questions she wishes she had asked before his death.
    * **Why B:** Piano is a man's own nostalgic memory of his mother's playing, not a daughter's tribute to a father.
    * **Why C:** Prayer Before Birth is voiced by an unborn child pleading against a cruel world, not a grown daughter's memory.
    * **Why D:** Hide and Seek follows a child's own experience of a game, not a reflection on a parent.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** What form does Alice Walker use for "Poem at Thirty-Nine"?
    * **Options:** A) A strict villanelle with two refrains, B) Free verse, its loose, conversational lines — "Writing deposit slips and checks I think of him" — suiting intimate, reflective memory, C) A traditional ballad, D) A Shakespearean sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unrhymed, flowing free verse lets the poem move naturally between memory, regret and quiet affection, closing on an unpunctuated list — "cooking, writing, chopping wood, staring into the fire" — that reads like a private reflection rather than a formal argument.
    * **Why A:** There are no repeating refrains; the poem does not follow villanelle rules.
    * **Why C:** It reflects rather than narrates a single dramatic story, and does not use ballad stanzas.
    * **Why D:** It is not fourteen lines and carries no fixed rhyme scheme.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Poem at Thirty-Nine"?
    * **Options:** A) The speaker reflects fondly on her father's practical skill and care — "He taught me / that telling the truth / did not always mean a beating" — now that she is an adult herself, B) The poem voices regret at questions left unasked before her father's death, C) The speaker recognises, by the poem's end, that she has inherited something of her father's qualities — "Now I look and cook just like him", D) The poem depicts a father the speaker barely knew or thought about
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Walker's poem moves from fond, specific memory — "He taught me / that telling the truth / did not always mean a beating" — through regret at things left unsaid, towards a quiet recognition of inheritance from her father, admitting "Now I look and cook just like him".
    * **Why D:** The poem is built from close, affectionate memory, not distance or indifference towards her father.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem describes a community's joy when a municipal pipe bursts and water suddenly rushes out, with people running to collect it in every vessel they own?
    * **Options:** A) Blessing, B) Half-caste, C) If—, D) Search For My Tongue
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dharker's "Blessing" turns a burst municipal pipe into a moment of communal celebration, as people rush with every container they can find to seize the sudden, precious water.
    * **Why B:** Half-caste challenges prejudice about mixed identity, not water scarcity.
    * **Why C:** If— gives fatherly advice through conditional clauses, not a scene of a community and water.
    * **Why D:** Search For My Tongue concerns a mother tongue and bilingual identity, not a water shortage.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What form does Dharker use for "Blessing", and how does it suit the poem's subject?
    * **Options:** A) A strict sonnet arguing a case, B) Free verse, with short, irregular lines — the pipe bursts and "silver crashes to the ground" — that mimic the unpredictable, precious flow of water, C) A villanelle with two recurring refrains, D) A regular ballad telling a folk tale
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's uneven, free-verse lines rush and pause like water itself, listing the "brass, copper, aluminium, plastic buckets" people snatch up, reflecting how scarce and unpredictable this "blessing" really is.
    * **Why A:** There is no fixed sonnet argument here; the form stays loose and irregular.
    * **Why C:** The poem does not repeat any refrain in the villanelle manner.
    * **Why D:** It is not a narrative ballad with regular song-like stanzas.

18. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Blessing", water becomes a symbol of scarcity — "The skin cracks like a pod. There never is enough water" — and the joy it brings is fragile and only occasionally seized.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The rare, sudden abundance of water, treated almost as a miracle in "the voice of a kindly god", underlines how precious and scarce it usually is, and the poem closes on children "screaming in the liquid sun" as "the blessing sings over their small bones" — joy that is intense but fleeting.
    * **WhyWrong:** This is true — the poem's celebration of water only makes sense because it is normally so scarce ("There never is enough water"), making the "blessing" fragile and fleeting.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem explores the fear of losing a mother tongue while living with a second language, weaving lines of Gujarati script into English?
    * **Options:** A) Search For My Tongue, B) Half-caste, C) Prayer Before Birth, D) If—
    * **Correct:** A
    * **Feedback:** ✓ Correct. Sujata Bhatt's "Search For My Tongue" explores what it feels like to lose, and then recover, a mother tongue when a second language takes over daily life.
    * **Why B:** Half-caste challenges a prejudiced term about mixed race, not bilingual identity.
    * **Why C:** Prayer Before Birth is an unborn child's plea against a cruel world, not about language loss.
    * **Why D:** If— offers advice for living, with no concern for language or mother tongue.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the form of "Search For My Tongue" reflect its subject?
    * **Options:** A) It stays in strict rhyming couplets throughout, B) Free verse that shifts into Gujarati script mid-poem embodies living between two languages and cultures, C) It is a tightly argued sonnet, D) It follows a fixed ballad refrain
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's shifting, unrhymed form breaks into untransliterated Gujarati script before returning to English, enacting the very experience of holding two languages and identities at once; the repeated "rot, rot and die in your mouth" mimics the mother tongue's feared decay.
    * **Why A:** The poem has no regular rhyme scheme; its form is loose and shifting.
    * **Why C:** It does not build a single fourteen-line argument like a sonnet.
    * **Why D:** There is no repeating refrain in the ballad sense.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the central image of the mother tongue "growing back" — it "grows longer, grows moist, grows strong veins" until "the bud opens" — suggest in "Search For My Tongue"?
    * **Options:** A) That the mother tongue is lost forever once a second language takes over, B) That a mother tongue, even when suppressed by daily use of another language, can quietly persist and reassert itself, C) That the speaker regrets ever learning English, D) That language has no real connection to identity
    * **Correct:** B
    * **Feedback:** ✓ Correct. The image of the tongue growing back, until "it blossoms out of my mouth", suggests the mother tongue is never truly lost — it can return and flourish again, however dominant the second language becomes.
    * **Why A:** The image is one of survival and return, not permanent loss.
    * **Why C:** The poem reveals both languages coexisting, not straightforward regret at learning English.
    * **Why D:** The whole poem hinges on language being bound up with identity and self.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem directly challenges the term used in its own title, using examples such as mixed weather, a Picasso painting and an orchestra to argue against being labelled only "half"?
    * **Options:** A) Half-caste, B) Prayer Before Birth, C) Blessing, D) If—
    * **Correct:** A
    * **Feedback:** ✓ Correct. John Agard's "Half-caste" turns everyday examples of mixing — weather, painting, music — into evidence against the prejudice behind the term.
    * **Why B:** Prayer Before Birth is a plea from an unborn child, not an argument about racial prejudice.
    * **Why C:** Blessing concerns water and community, not identity or prejudice.
    * **Why D:** If— gives advice on character, with no concern for race or mixed identity.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What is distinctive about the language and form John Agard uses in "Half-caste"?
    * **Options:** A) Strict Received Pronunciation and formal, elevated syntax, B) Non-standard, phonetic Caribbean spelling and a conversational, confrontational direct address to the reader, C) A fixed villanelle with two refrains, D) Latinate, elevated diction throughout
    * **Correct:** B
    * **Feedback:** ✓ Correct. Agard's phonetic Caribbean spelling and direct, challenging address put the reader on the spot, resisting the "standard" English the poem implicitly critiques.
    * **Why A:** The poem deliberately rejects standard spelling and formal syntax.
    * **Why C:** There is no repeating refrain structure; the poem builds through accumulating examples instead.
    * **Why D:** Its diction is everyday and confrontational, not elevated or Latinate.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What effect does Agard's repeated rhetorical questioning create in "Half-caste"?
    * **Options:** A) It politely invites the reader's agreement, B) It challenges the reader to justify a prejudiced term, turning the poem into a confident, confrontational defence of mixed identity, C) It expresses the speaker's own uncertainty about his identity, D) It apologises for having caused offence
    * **Correct:** B
    * **Feedback:** ✓ Correct. By repeatedly demanding "explain yuself", the speaker puts the burden of justification onto anyone who uses the term, asserting his identity rather than defending it apologetically.
    * **Why A:** The tone is challenging and assertive, not merely polite.
    * **Why C:** The speaker betrays no uncertainty; he is confident throughout.
    * **Why D:** There is no apology — the poem confronts prejudice rather than excusing it.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem is voiced by an unborn child, pleading for protection against war, cruelty and those who would turn it into "a lethal automaton"?
    * **Options:** A) Prayer Before Birth, B) Piano, C) The Tyger, D) Hide and Seek
    * **Correct:** A
    * **Feedback:** ✓ Correct. Louis MacNeice's "Prayer Before Birth" gives voice to an unborn child, praying to be spared a world of violence and to be saved from becoming an unthinking, controlled thing.
    * **Why B:** Piano is an adult's nostalgic memory triggered by music, not an unborn child's plea.
    * **Why C:** The Tyger questions who could create a fearsome creature; it is not a plea against cruelty.
    * **Why D:** Hide and Seek follows a child playing a game, not an unborn child's prayer.

26. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Prayer Before Birth" is a dramatic monologue built as a litany, its repeated opening "I am not yet [BLANK]" beginning almost every stanza.
    * **Answer:** born
    * **Feedback:** ✓ Correct. The refrain "I am not yet born" repeats like a prayer, giving the poem its incantatory, pleading rhythm.
    * **WhyWrong:** The word is "born" — the repeated "I am not yet born" gives the poem its litany-like, urgent structure.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the unborn child most afraid of becoming, according to the poem?
    * **Options:** A) Rich and powerful, B) A person without will of their own — controlled, used and turned into something less than human, C) Forgotten by their family, D) A soldier who wins every battle
    * **Correct:** B
    * **Feedback:** ✓ Correct. The child fears being made into "a lethal automaton" or "a stone" — stripped of free will and humanity by a cruel, corrupting world.
    * **Why A:** The child's fears are moral and existential, not about wealth or power.
    * **Why C:** The poem is concerned with being controlled or dehumanised, not with being forgotten.
    * **Why D:** The child fears being used for violence, not achieving victory in it.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem builds through repeated conditional clauses beginning "If you can..." towards its closing promise that "you'll be a Man, my son!"?
    * **Options:** A) If—, B) Sonnet 116, C) Remember, D) Half-caste
    * **Correct:** A
    * **Feedback:** ✓ Correct. Kipling's "If—" piles up conditions for resilience and integrity before resolving on this final line of fatherly advice.
    * **Why B:** Sonnet 116 argues a definition of love, with no conditional structure of advice.
    * **Why C:** Remember is a plea about memory and grief, not a set of conditions for maturity.
    * **Why D:** Half-caste challenges prejudice; it gives no advice about character.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is "If—" by Kipling structured?
    * **Options:** A) Four regular rhymed stanzas of conditional clauses, piling up advice before the final resolution, B) A single unrhymed sonnet, C) A ballad telling one dramatic event, D) Free verse with no repetition
    * **Correct:** A
    * **Feedback:** ✓ Correct. The steady, rhymed stanzas of accumulating "If" clauses build a sense of patient discipline, resolving in the poem's closing promise.
    * **Why B:** The poem is not fourteen lines, and it rhymes throughout, unlike an unrhymed sonnet.
    * **Why C:** It gives general advice rather than narrating a single story.
    * **Why D:** The poem's whole structure depends on the repeated "If" clauses, not an absence of repetition.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "If—"?
    * **Options:** A) It presents resilience, patience and humility as marks of maturity, B) It treats "Triumph and Disaster" as "two impostors" to be met with equal composure, C) The accumulation of conditions builds towards an idealised vision of manhood, D) It argues that a person's worth depends entirely on winning
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Kipling values how a person copes with both success and failure, building through patient, cumulative advice towards an idealised, resilient manhood.
    * **Why D:** The poem values equal composure in both triumph and disaster, not winning as the sole measure of worth.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a child kept behind after school who cannot yet tell the time, so lives inside an invented, timeless world of his own until a teacher eventually releases him?
    * **Options:** A) Half-past Two, B) Hide and Seek, C) Piano, D) Poem at Thirty-Nine
    * **Correct:** A
    * **Feedback:** ✓ Correct. U. A. Fanthorpe's "Half-past Two" imagines a child, punished and unable to read a clock, inhabiting his own private, timeless world until he is finally sent home.
    * **Why B:** Hide and Seek follows a child during a game, not being kept in after school.
    * **Why C:** Piano is an adult's nostalgic memory, not a child's own present experience.
    * **Why D:** Poem at Thirty-Nine is an adult daughter's tribute to her father, not a child's experience of school.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What form does Fanthorpe use for "Half-past Two", and how does it suit the subject?
    * **Options:** A) A regular ballad with a repeating refrain, B) Free verse, with invented compound words — "Gettinguptime, timeyouwereofftime, / Timetogohomenowtime" — for the child's own private sense of time, breaking from ordinary clock-time language, C) A strict villanelle, D) A traditional sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The loose free verse and the child's own invented time-words, opening on the fairy-tale-like "Once upon a schooltime", capture a private, imaginative logic that ordinary clock-time cannot express.
    * **Why A:** There is no repeating refrain or song-like ballad structure here.
    * **Why C:** The poem does not use the villanelle's two fixed refrains.
    * **Why D:** It is not fourteen lines, and it has no fixed rhyme scheme.

33. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** In "Half-past Two", the child's eventual return to ordinary, clock-measured "Time" suggests something valuable about childhood imagination is lost as we grow up.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Once "slotted ... back into schooltime", the child's private, imaginative world — where he had escaped "into the clockless land for ever" — is lost, implying growing up narrows a more open, wondering way of experiencing the world.
    * **WhyWrong:** This is true — the poem frames the return to clock-time as a kind of loss, closing off the child's freer, more imaginative world where "time hides tick-less waiting to be born".

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem depicts an adult overwhelmed by nostalgia as a woman's singing carries him back to childhood evenings under the piano, listening to his mother play?
    * **Options:** A) Piano, B) Half-past Two, C) Hide and Seek, D) The Tyger
    * **Correct:** A
    * **Feedback:** ✓ Correct. D. H. Lawrence's "Piano" has an adult speaker undone by a woman's singing, which carries him back to childhood evenings under the piano with his mother.
    * **Why B:** Half-past Two follows a child's present experience, not an adult's remembered childhood.
    * **Why C:** Hide and Seek follows a child playing a game, not an adult recalling the past.
    * **Why D:** The Tyger questions a creature's creation; it has no scene of childhood memory.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Piano" by D. H. Lawrence structured?
    * **Options:** A) Three regular rhymed stanzas, giving the poem a controlled, musical form, B) Free verse with no rhyme at all, C) A dramatic monologue spoken to a silent listener, D) A villanelle with two recurring refrains
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem's three neat, rhymed stanzas give it a musical, song-like control that mirrors the singing and piano-playing at its centre.
    * **Why B:** The poem rhymes throughout; it is not unrhymed free verse.
    * **Why C:** The speaker addresses no listener directly; it is an internal, reflective memory.
    * **Why D:** There are no repeating refrains in the villanelle sense.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the poem's ending, in which the adult speaker weeps "like a child for the past", suggest?
    * **Options:** A) That nostalgia can overpower even an adult's usual composure, pulling him back into the emotional world of childhood, B) That the speaker regrets ever learning to play the piano, C) That the speaker has entirely forgotten his childhood, D) That music has no real emotional power over him
    * **Correct:** A
    * **Feedback:** ✓ Correct. Despite resisting the "clamour" of the present performance, the speaker is defeated by memory, reduced to childlike tears for a past he cannot recover.
    * **Why B:** The poem is not about learning an instrument, but about the emotional pull of memory.
    * **Why C:** The vividness of his memory reveals the opposite — the past remains powerfully present to him.
    * **Why D:** The whole poem depends on music's power to overwhelm him emotionally.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem follows a child hiding during a game, growing colder and more excited as he waits, only to realise the other children have given up and gone inside without him?
    * **Options:** A) Hide and Seek, B) Piano, C) Half-past Two, D) Prayer Before Birth
    * **Correct:** A
    * **Feedback:** ✓ Correct. Vernon Scannell's "Hide and Seek" follows a child's rising excitement while hiding, curdling into cold isolation when he realises he has been left behind and forgotten.
    * **Why B:** Piano is an adult's memory of music and childhood, not a child's present game.
    * **Why C:** Half-past Two concerns being kept in after school, not a game of hide and seek.
    * **Why D:** Prayer Before Birth is an unborn child's plea, not a game between children.

38. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Hide and Seek" is written in [BLANK] verse, its shifting, unrhymed lines following the child's changing feelings in real time.
    * **Answer:** free
    * **Feedback:** ✓ Correct. The unrhymed, flexible free verse mirrors the child's shifting emotions, from excited anticipation to cold disappointment.
    * **WhyWrong:** The word is "free" — free verse lets the poem's rhythm follow the child's changing state of mind moment by moment.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the ending of "Hide and Seek" suggest about the game as a wider idea?
    * **Options:** A) That games always end happily for everyone involved, B) That triumphant anticipation can curdle into isolation, giving the child a first taste of being abandoned or forgotten by others, C) That the other children are punished for leaving, D) That hiding is always the safest choice
    * **Correct:** B
    * **Feedback:** ✓ Correct. The child's excited confidence in his hiding place turns to cold, growing dread, and finally to the bitter realisation that everyone else has moved on without him.
    * **Why A:** The ending is one of disappointment and isolation, not a happy resolution.
    * **Why C:** The poem gives no sense that the other children are punished; the focus stays on the hider's feelings.
    * **Why D:** By the end, hiding has left him cold, alone and forgotten, undercutting any sense of safety.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem urges a dying father to "rage, rage against the dying of the light", citing wise, good, wild and grave men who all resisted death?
    * **Options:** A) Do not go gentle into that good night, B) Remember, C) Sonnet 116, D) The Tyger
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dylan Thomas's villanelle urges his dying father to resist death fiercely, drawing on wise, good, wild and grave men as examples of men who fought against "the dying of the light".
    * **Why B:** Remember asks for gentle acceptance of death, the opposite of raging against it.
    * **Why C:** Sonnet 116 concerns love's constancy, not a father's death.
    * **Why D:** The Tyger questions a creature's creation, with no father or deathbed scene.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What form does Dylan Thomas use for this poem, and what does it demand?
    * **Options:** A) A villanelle — nineteen lines built from two recurring refrains, B) A ballad telling a single narrative event, C) Free verse with no repetition, D) A Shakespearean sonnet
    * **Correct:** A
    * **Feedback:** ✓ Correct. The villanelle's strict nineteen-line structure, with its two obsessively returning refrains, forces the poem to circle back again and again to its central plea.
    * **Why B:** The poem builds its argument through repeated refrains and examples, not a single narrated event.
    * **Why C:** The poem's repetition is central and deliberate, not absent.
    * **Why D:** It is nineteen lines with refrains, not a fourteen-line sonnet.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the effect of the villanelle's two refrains recurring and finally combining in the last stanza?
    * **Options:** A) It creates calm, peaceful acceptance of death, B) The obsessive, circling repetition enacts the speaker's desperate refusal to let his father die quietly, C) It makes the poem comic in tone, D) It signals that the father has already died peacefully
    * **Correct:** B
    * **Feedback:** ✓ Correct. Forcing "Do not go gentle" and "Rage, rage against the dying of the light" to return and finally combine mimics a grief and desperation that cannot let go.
    * **Why A:** The refrains resist acceptance; they demand resistance and rage instead.
    * **Why C:** The tone is anguished and urgent, not comic.
    * **Why D:** The poem is a plea for the father to keep fighting, implying he is not yet at peace.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is set in a darkroom where a man develops photographs of suffering from conflicts in places such as Belfast, Beirut and Phnom Penh?
    * **Options:** A) War Photographer, B) Prayer Before Birth, C) The Tyger, D) Half-caste
    * **Correct:** A
    * **Feedback:** ✓ Correct. Carol Ann Duffy's "War Photographer" opens with a man alone in his darkroom, developing "spools of suffering" gathered from Belfast, Beirut and Phnom Penh.
    * **Why B:** Prayer Before Birth is an unborn child's plea, with no darkroom or photographs.
    * **Why C:** The Tyger questions a fearsome creature's creation, unconnected to war photography.
    * **Why D:** Half-caste challenges prejudice about mixed identity, not the work of a photographer.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the ordered form of "War Photographer" — regular six-line stanzas — serve the poem?
    * **Options:** A) It has no real effect on the poem's meaning, B) Its rigid order contrasts with the chaos of the war scenes it describes, mirroring the photographer's attempt to control unbearable suffering, C) It makes the poem a ballad, D) It suggests the conflicts described were not truly serious
    * **Correct:** B
    * **Feedback:** ✓ Correct. The neat, controlled stanzas sit against the horror they describe, echoing how the photographer tries to order and contain suffering within his careful frames.
    * **Why A:** The tension between orderly form and chaotic content is central to the poem's effect.
    * **Why C:** Regular stanzas alone do not make a ballad; there is no narrative refrain here.
    * **Why D:** The form contains the horror described; it does not diminish it.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "War Photographer"?
    * **Options:** A) It criticises the public back home for their fleeting sympathy before returning to comfortable lives, B) It contrasts the ordered calm of England with the chaos of the conflicts the photographer has witnessed, C) The photographer feels a duty to record suffering that others would rather ignore, D) It celebrates how readily the public accepts and acts on distant suffering
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Duffy indicts public indifference, sets calm England against remembered chaos, and honours the photographer's quiet sense of duty to bear witness.
    * **Why D:** The poem's charge is public indifference and quickly forgotten sympathy, not eager acceptance or action.

46. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem repeatedly asks "What immortal hand or eye / Could frame thy fearful symmetry?", addressing a fearsome, burning creature?
    * **Options:** A) The Tyger, B) Piano, C) Hide and Seek, D) Blessing
    * **Correct:** A
    * **Feedback:** ✓ Correct. William Blake's "The Tyger" repeatedly questions what kind of creator could make such a terrifying, beautifully patterned creature.
    * **Why B:** Piano concerns a nostalgic childhood memory, not a fearsome creature.
    * **Why C:** Hide and Seek follows a child's game, unrelated to questions of creation.
    * **Why D:** Blessing concerns water and community, not a burning tiger.

47. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What form and rhythm does Blake use in "The Tyger"?
    * **Options:** A) Free verse with no set rhythm, B) Regular rhyming quatrains in a hammering, driving rhythm that echoes a blacksmith's forge, C) A villanelle with two recurring refrains, D) A single long, unrhymed sentence
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem's insistent rhyme and hammering rhythm, alongside imagery of hammer, chain, furnace and anvil, make the tiger sound forged rather than born.
    * **Why A:** The poem is tightly rhymed and rhythmic, not free verse.
    * **Why C:** There are no repeating refrains in the villanelle sense.
    * **Why D:** The poem is built from short rhyming quatrains, not one long unrhymed sentence.

48. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What central question does "The Tyger" explore through its imagery of hammer, chain, furnace and anvil?
    * **Options:** A) How tigers are trained for a circus, B) How the same creator could make both the fearsome tiger and the gentle lamb, confronting the existence of terror alongside innocence, C) How blacksmiths make weapons for war, D) How to escape from a predator in the wild
    * **Correct:** B
    * **Feedback:** ✓ Correct. By asking "Did he who made the Lamb make thee?", Blake confronts the puzzle of a creation that holds both gentle innocence and violent terror within it.
    * **Why A:** The poem is not concerned with training animals for performance.
    * **Why C:** The forge imagery is metaphorical, describing creation itself, not literal weapon-making.
    * **Why D:** The poem questions the tiger's origin, not how to survive an encounter with one.
