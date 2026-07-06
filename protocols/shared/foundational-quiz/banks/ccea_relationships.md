# Foundational Quiz Bank — CCEA GCSE Literature Poetry: Relationships (Poems)

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
- **@set:1** — Sonnet 130 (Shakespeare) · How Do I Love Thee? (Elizabeth Barrett Browning) · i carry your heart (E. E. Cummings) · When You Are Old (W. B. Yeats) · Symptoms of Love (Robert Graves)
- **@set:2** — To His Coy Mistress (Andrew Marvell) · The Laboratory (Robert Browning) · Wild Oats (Philip Larkin) · I Am Very Bothered (Simon Armitage) · Before You Were Mine (Carol Ann Duffy)
- **@set:3** — On My First Son (Ben Jonson) · Remember (Christina Rossetti) · Funeral Blues (W. H. Auden) · Long Distance II (Tony Harrison) · Clearances 7: In the Last Minutes (Seamus Heaney)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: CCEA Relationships Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem mocks the exaggerated comparisons of love poetry, insisting "my mistress' eyes are nothing like the sun"?
   * **Options:** A) Sonnet 130, B) How Do I Love Thee?, C) i carry your heart, D) The Laboratory
   * **Correct:** A
   * **Feedback:** ✓ Correct. Shakespeare's "Sonnet 130" refuses stock comparisons — "coral is far more red than her lips' red" — before prizing an honest love that needs no false compare.
   * **Why B:** How Do I Love Thee? counts devotion's depth and height without mocking comparison.
   * **Why C:** i carry your heart is a tender declaration of union, not a satire of love-poetry cliché.
   * **Why D:** The Laboratory follows a jealous speaker watching poison being mixed, not a mockery of compliments.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Sonnet 130" by Shakespeare is written in which form?
   * **Options:** A) A Shakespearean sonnet — three quatrains and a closing couplet, B) A ballad, C) Free verse, D) An ode
   * **Correct:** A
   * **Feedback:** ✓ Correct. Its fourteen lines catalogue the mistress against false compliment and close on the couplet "And yet, by heaven, I think my love as rare" — a Shakespearean sonnet.
   * **Why B:** It argues a case in fourteen lines rather than telling a story in song-like stanzas.
   * **Why C:** It keeps a strict rhyme and a fixed fourteen-line shape, so it is not free verse.
   * **Why D:** An ode praises its subject outright; this poem mocks flattery before it prizes honest love.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What is the effect of the closing couplet in "Sonnet 130"?
   * **Options:** A) It turns from mocking false compliments to affirming a love that is rare precisely because it is honest, B) It repeats the opening insult unchanged, C) It abandons the argument entirely, D) It reveals the mistress does not love him back
   * **Correct:** A
   * **Feedback:** ✓ Correct. After twelve lines refusing "false compare", the couplet declares his love "as rare" as any dressed in flattering lies — sincerity outvalues cliché.
   * **Why B:** The couplet resolves rather than repeats — it delivers the poem's turn.
   * **Why C:** The couplet completes the argument's logic rather than dropping it.
   * **Why D:** The poem affirms mutual, genuine love; it never doubts her feeling.

4. **Type: Fill [Tests Recognising the Poem]**
   @set:1
   * **Question:** "How Do I [BLANK]?" by Elizabeth Barrett Browning counts the ways of devotion "to the depth and breadth and height / My soul can reach".
   * **Answer:** Love Thee
   * **Feedback:** ✓ Correct. Barrett Browning's sonnet opens with this question, then measures a love too vast for ordinary bounds.
   * **WhyWrong:** The title is "How Do I Love Thee?" — the poem that counts devotion "to the depth and breadth and height".

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "How Do I Love Thee?" by Elizabeth Barrett Browning is written in which form?
   * **Options:** A) A sonnet — fourteen lines that turn towards loving "better after death", B) A dramatic monologue, C) A villanelle, D) An epitaph
   * **Correct:** A
   * **Feedback:** ✓ Correct. It is a sonnet, its fourteen lines measuring a devotion that keeps overflowing every bound the speaker proposes.
   * **Why B:** There is no silent listener being unwittingly exposed, as in a dramatic monologue.
   * **Why C:** It carries no two recurring refrains, as a villanelle demands.
   * **Why D:** An epitaph memorialises the dead; this poem addresses a living beloved.

6. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** In "How Do I Love Thee?", the speaker's list of comparisons — to "Right", to "Praise", to childhood "faith" — ultimately proves too small, so the poem reaches beyond life itself, promising to love "better after death".
   * **Answer:** True
   * **Feedback:** ✓ Correct. Each measure the speaker offers is exceeded by the next, until the sonnet's final line pushes devotion past mortality itself.
   * **WhyWrong:** This is true — the poem's comparisons keep failing to contain the feeling, ending by reaching past death itself.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem opens "i carry your heart with me(i carry it in / my heart)", nesting one phrase inside another?
   * **Options:** A) i carry your heart, B) How Do I Love Thee?, C) Symptoms of Love, D) Before You Were Mine
   * **Correct:** A
   * **Feedback:** ✓ Correct. Cummings' poem folds "i carry it in / my heart" inside brackets from its very first line, enacting the closeness it describes.
   * **Why B:** How Do I Love Thee? counts love's measures in a formal sonnet, without bracketed nesting.
   * **Why C:** Symptoms of Love lists love's effects in short, spare stanzas, not nested parentheses.
   * **Why D:** Before You Were Mine addresses a mother's remembered youth, not a lover's heart.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "i carry your heart" by E. E. Cummings, with its lower-case lines and nested brackets, is written in which form?
   * **Options:** A) Free verse — abandoning fixed metre, capital letters and conventional punctuation, B) A Petrarchan sonnet, C) A ballad, D) A villanelle
   * **Correct:** A
   * **Feedback:** ✓ Correct. The poem drops capitals and regular metre, folding phrases inside parentheses to create an unmistakably free-verse shape.
   * **Why B:** It has no octave-and-sestet structure or fourteen-line frame.
   * **Why C:** It declares private union rather than telling a narrative in balanced, song-like stanzas.
   * **Why D:** It carries no two recurring refrains, as a villanelle demands.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What effect does the nested, bracketed structure of "i carry your heart" create?
   * **Options:** A) It enacts the very closeness it describes — one heart folded inside another, with nothing kept apart, B) It conveys the speaker's confusion about his feelings, C) It creates comic distance from the subject, D) It proves the relationship has ended
   * **Correct:** A
   * **Feedback:** ✓ Correct. By nesting each parenthetical phrase inside the last, Cummings makes the poem's form perform its meaning: two hearts held one within the other.
   * **Why B:** The brackets clarify devotion rather than expressing uncertainty.
   * **Why C:** The tone is tender and sincere, not comic.
   * **Why D:** The poem is a declaration of lasting union, not a farewell.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem imagines its subject grown old, "nodding by the fire", taking down a book to remember "how many loved" her?
    * **Options:** A) When You Are Old, B) Remember, C) Funeral Blues, D) The Laboratory
    * **Correct:** A
    * **Feedback:** ✓ Correct. Yeats's "When You Are Old" pictures the beloved in old age, reading of those who "loved your moments of glad grace" and the one who loved "the pilgrim soul in you".
    * **Why B:** Remember is spoken by someone anticipating their own death, not imagining the beloved's old age.
    * **Why C:** Funeral Blues mourns a death that has already happened, not an imagined future.
    * **Why D:** The Laboratory follows a jealous speaker watching a poison being mixed, not an old-age reverie.

11. **Type: Fill [Tests Form & Features]**
    @set:1
    * **Question:** "When You Are Old" is built from three [BLANK]s, quatrains rhyming ABBA, closing on the image of Love hiding "amid a crowd of stars".
    * **Answer:** quatrain
    * **Feedback:** ✓ Correct. The three enclosed ABBA quatrains give the poem a settled, musing shape suited to looking back across a whole life.
    * **WhyWrong:** The unit is the "quatrain" — three four-line, ABBA-rhymed stanzas structure the poem's reflection.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What distinguishes the speaker's love in "When You Are Old" from the love of others who admired her "beauty with love false or true"?
    * **Options:** A) He alone loved her ageing, inward self — "the pilgrim soul in you" — not merely her surface beauty, B) He loved her only for her wealth, C) He never loved her at all, D) He loved her exactly as much as everyone else
    * **Correct:** A
    * **Feedback:** ✓ Correct. Where others prized her "glad grace" and beauty, the speaker singles out a rarer devotion — to her changing, ageing, striving self.
    * **Why B:** Wealth plays no part in the poem's contrast between surface and depth.
    * **Why C:** The poem insists his love was real and lasting, unlike the others' passing admiration.
    * **Why D:** The poem explicitly sets his love apart from — not equal to — the others'.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem opens by calling love "a universal migraine, / A bright stain on the vision / Blotting out reason"?
    * **Options:** A) Symptoms of Love, B) i carry your heart, C) Wild Oats, D) How Do I Love Thee?
    * **Correct:** A
    * **Feedback:** ✓ Correct. Graves's "Symptoms of Love" diagnoses love as an affliction — a "migraine" that clouds judgement — before listing its symptoms.
    * **Why B:** i carry your heart celebrates union tenderly, without describing love as an illness.
    * **Why C:** Wild Oats recalls a real, faltering courtship, not an aphoristic list of symptoms.
    * **Why D:** How Do I Love Thee? counts devotion's depths; it does not diagnose love as a migraine.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** "Symptoms of Love" is built like a short, list-like diagnosis, naming symptoms — "leanness, jealousy, / Laggard dawns" — rather than telling a continuous story.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem reads like a set of clinical symptoms rather than a narrative, its short, spare stanzas cataloguing love's effects one after another.
    * **WhyWrong:** This is true — the poem's compressed, listing structure names symptoms rather than narrating events.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning and effect of "Symptoms of Love"?
    * **Options:** A) It presents love as an affliction that clouds reason, comparable to a migraine, B) It lists symptoms such as jealousy and sleepless "laggard dawns" to capture love's restless anxiety, C) Its final address to the "lover" asks whether such pain is worth enduring for the one who causes it, D) It concludes that love is simple and painless
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Graves diagnoses love as a reason-clouding affliction, lists its restless, anxious symptoms, then asks the lover whether such suffering is worth enduring for her sake.
    * **Why D:** The whole poem insists love is painful and disorientating, not simple or painless.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem opens "Had we but world enough, and time", before warning that "at my back I always hear / Time's wingèd chariot hurrying near"?
    * **Options:** A) To His Coy Mistress, B) The Laboratory, C) Wild Oats, D) On My First Son
    * **Correct:** A
    * **Feedback:** ✓ Correct. Marvell's "To His Coy Mistress" opens with this leisurely fantasy, then turns urgent as the "wingèd chariot" of time closes in.
    * **Why B:** The Laboratory is a jealous monologue over a poison being mixed, not a meditation on time.
    * **Why C:** Wild Oats recalls a real, faltering courtship years later, not an argument about time running out.
    * **Why D:** On My First Son mourns a dead child, not a plea to seize the moment.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How is Marvell's argument in "To His Coy Mistress" structured and paced?
    * **Options:** A) In brisk rhyming couplets, moving through three stages — "had we", "but", "now therefore" — like a logical case, B) In free verse with no clear structure, C) As a sonnet with a single turn, D) As a ballad with a repeated refrain
    * **Correct:** A
    * **Feedback:** ✓ Correct. The tight rhyming couplets drive a three-part argument — a leisurely "if", an urgent "but", and a decisive "now therefore" — building like a case in logic.
    * **Why B:** The poem is tightly rhymed and carefully organised, not loose free verse.
    * **Why C:** It runs far beyond fourteen lines and does not turn on a single sonnet volta.
    * **Why D:** There is no repeated refrain; each couplet advances the argument instead.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the effect of the poem's central image that "Time's wingèd chariot" is always "hurrying near"?
    * **Options:** A) It creates urgency, pressuring the mistress by making mortality feel close and unavoidable, B) It reassures her that time is unlimited, C) It has no bearing on the argument, D) It celebrates a long and settled marriage
    * **Correct:** A
    * **Feedback:** ✓ Correct. By making time itself a pursuing chariot, Marvell turns an abstract idea into a felt threat, sharpening his carpe-diem argument that they should seize the moment.
    * **Why B:** The chariot image insists time is short and pressing, not unlimited.
    * **Why C:** The image is the argument's turning point, driving the poem's urgency.
    * **Why D:** The poem argues for seizing a fleeting moment, not for settled permanence.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem has its speaker watch an apothecary at his "devil's-smithy", gloating over the poison being prepared for a rival?
    * **Options:** A) The Laboratory, B) On My First Son, C) Remember, D) i carry your heart
    * **Correct:** A
    * **Feedback:** ✓ Correct. Browning's "The Laboratory" has a jealous speaker relish every stage of the poison's mixing, savouring "the delicate droplet, my whole fortune's fee".
    * **Why B:** On My First Son grieves a dead son, with no poison or rival.
    * **Why C:** Remember is a plea about being remembered after death, not a revenge plot.
    * **Why D:** i carry your heart declares tender union, the opposite of jealous plotting.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "The Laboratory" is best described as a [BLANK] — one speaker addresses a silent listener, and in doing so exposes her own jealous mind.
    * **Answer:** dramatic monologue
    * **Feedback:** ✓ Correct. As in Browning's other monologues, the speaker's own words betray far more about her than she intends to reveal.
    * **WhyWrong:** The form is "dramatic monologue" — a single speaker unwittingly exposing herself to a silent listener.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the effect of the dramatic monologue form in "The Laboratory"?
    * **Options:** A) It lets the speaker's gleeful jealousy expose itself as she savours the poison's preparation, B) It hides the speaker's feelings entirely, C) It turns the poem into a calm lullaby, D) It hands the main voice to the silent apothecary
    * **Correct:** A
    * **Feedback:** ✓ Correct. Because she speaks so freely to the poison-maker, her relished detail betrays a mind curdled into vengeful delight.
    * **Why B:** The form centres the speaker, laying her thoughts bare rather than concealing them.
    * **Why C:** The eager, galloping voice is menacing, not soothing.
    * **Why D:** The apothecary stays silent throughout; only the jealous speaker is heard.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls the speaker meeting "two girls" at work "about twenty years ago" — "a bosomy English rose" and "her friend in specs I could talk to"?
    * **Options:** A) Wild Oats, B) Before You Were Mine, C) I Am Very Bothered, D) Symptoms of Love
    * **Correct:** A
    * **Feedback:** ✓ Correct. Larkin's "Wild Oats" looks back on courting the plainer friend rather than the "bosomy English rose", and on how it ended.
    * **Why B:** Before You Were Mine addresses a mother's youth, not a workplace meeting between the speaker and two girls.
    * **Why C:** I Am Very Bothered recalls a single childhood incident with scissors, not two girls met at work.
    * **Why D:** Symptoms of Love is an aphoristic list of love's effects, not a specific remembered story.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does Larkin tell the story in "Wild Oats"?
    * **Options:** A) In a loose, conversational free verse with irregular, understated rhyme, narrating events flatly and drily, B) In a strict Shakespearean sonnet, C) As a villanelle with two repeating refrains, D) In rhyming heroic couplets throughout
    * **Correct:** A
    * **Feedback:** ✓ Correct. The plain, unhurried free verse and dry, matter-of-fact tone — noting he "got that learnt" — let the speaker downplay a painful failed courtship.
    * **Why B:** The poem runs across several irregular stanzas, not one fixed fourteen-line sonnet.
    * **Why C:** There are no two recurring refrains, as a villanelle demands.
    * **Why D:** Its lines are irregular and only loosely rhymed, not the tight couplets of Marvell or Jonson.

24. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "Wild Oats", the speaker's flat, understated tone — keeping two old photographs as "Unlucky charms, perhaps" — masks real regret about a relationship he ended.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Beneath the wry, deadpan surface, the closing "Unlucky charms, perhaps" hints at a lingering, unresolved regret the speaker will not state outright.
    * **WhyWrong:** This is true — the poem's dry, downplaying tone conceals a real undertow of regret about how the courtship ended.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem recalls a chemistry-lab incident where the speaker heats scissor blades and hands them over, branding "the two burning rings" into someone's fingers?
    * **Options:** A) I Am Very Bothered, B) The Laboratory, C) On My First Son, D) Long Distance II
    * **Correct:** A
    * **Feedback:** ✓ Correct. Armitage's "I Am Very Bothered" confesses to branding a girl's fingers with heated scissors, later reframed as a clumsy, thirteen-year-old proposal.
    * **Why B:** The Laboratory involves poison prepared by an apothecary, not a schoolboy's scissors.
    * **Why C:** On My First Son is an epitaph for a dead child, with no lab incident.
    * **Why D:** Long Distance II follows a father's grief after his wife's death, not a schoolroom memory.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does Armitage shape "I Am Very Bothered"?
    * **Options:** A) As a distorted, irregular sonnet — fourteen lines pulled out of their usual shape, B) As a strict Petrarchan sonnet with a clean octave and sestet, C) As a villanelle with two refrains, D) As regular rhyming quatrains
    * **Correct:** A
    * **Feedback:** ✓ Correct. The poem keeps a sonnet's fourteen lines but breaks them into uneven stanzas without a settled rhyme scheme, its awkward shape matching the clumsy incident it confesses.
    * **Why B:** It has no clean octave-and-sestet division or regular sonnet rhyme.
    * **Why C:** There are no two recurring refrains, as a villanelle demands.
    * **Why D:** Its stanzas are uneven in length, not the regular four-line units of a quatrain poem.

27. **Type: Fill [Tests Meaning & Effects]**
    @set:2
    * **Question:** In "I Am Very Bothered", the speaker's confession that this was his "butterfingered way... of asking you if you would [BLANK] me" reframes the painful incident as a clumsy declaration of love.
    * **Answer:** marry
    * **Feedback:** ✓ Correct. The final twist recasts childish cruelty as an inarticulate, thirteen-year-old proposal — love expressed as accidental harm.
    * **WhyWrong:** The word is "marry" — the closing line reframes the branding as a clumsy proposal.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem imagines its speaker's mother as a young woman "ten years away", laughing on a street corner in her "polka-dot dress" before her daughter was born?
    * **Options:** A) Before You Were Mine, B) Remember, C) Symptoms of Love, D) Funeral Blues
    * **Correct:** A
    * **Feedback:** ✓ Correct. Duffy's "Before You Were Mine" pictures the mother's carefree youth — dancing, laughing with friends — years before the "loud, possessive yell" of her own birth.
    * **Why B:** Remember is spoken by someone contemplating their own death, not a daughter imagining her mother's youth.
    * **Why C:** Symptoms of Love catalogues love's effects abstractly, without a remembered mother or scene.
    * **Why D:** Funeral Blues mourns a death that has already occurred, not an imagined pre-birth past.

29. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** "Before You Were Mine" is written in free verse, its four uneven stanzas moving between imagined memory and direct address to "you", the mother.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The loose, unrhymed stanzas let the poem drift between scenes of the mother's youth, all voiced as an intimate address to her.
    * **WhyWrong:** This is true — the poem's free verse and direct, second-person address let memory and imagination move freely between stanzas.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning and effect of "Before You Were Mine"?
    * **Options:** A) The daughter imagines her mother's youth with admiration, even envy, for a freedom she never knew, B) The direct address to "you" makes the poem feel like an intimate, loving conversation with the mother, C) The poem suggests that having a child changed and constrained the mother's earlier, carefree life, D) The poem concludes that the mother regretted having children
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Duffy admires the mother's lost freedom, addresses her tenderly throughout, and lets the "loud, possessive yell" of birth mark a real, if loving, loss of that youth.
    * **Why D:** The poem is affectionate and admiring in tone; it never suggests the mother regretted her children.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is an epitaph for a dead child, calling him "Ben Jonson his best piece of poetry"?
    * **Options:** A) On My First Son, B) Remember, C) Long Distance II, D) Clearances 7: In the Last Minutes
    * **Correct:** A
    * **Feedback:** ✓ Correct. Jonson's "On My First Son" mourns his seven-year-old boy, closing with the epitaph that names him the father's finest work.
    * **Why B:** Remember is spoken by someone anticipating their own death, not a father mourning a son.
    * **Why C:** Long Distance II mourns a mother's death from her son's adult perspective, not a father's epitaph for a young child.
    * **Why D:** Clearances 7 recalls a mother's last moments through her husband's words, not a son's death.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does Jonson shape "On My First Son"?
    * **Options:** A) As rhyming couplets in the restrained form of a classical epitaph, B) As a rhyming ballad with a refrain, C) As a villanelle, D) As free verse with no rhyme
    * **Correct:** A
    * **Feedback:** ✓ Correct. The controlled rhyming couplets and inscription-like form hold steady, a classical epitaph's restraint containing a father's raw grief.
    * **Why B:** There is no song-like refrain; the poem is a continuous, controlled address.
    * **Why C:** It carries no two recurring refrains, as a villanelle demands.
    * **Why D:** The poem is tightly rhymed in couplets, not unrhymed free verse.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** How do the restrained rhyming couplets of "On My First Son" serve its meaning?
    * **Options:** A) Their measured, classical control strains against a father's raw grief as he calls the boy his "best piece of poetry", B) They create a light, playful mood, C) They tell a heroic adventure, D) They leave the poem loose and formless
    * **Correct:** A
    * **Feedback:** ✓ Correct. The controlled couplets and the graveside inscription hold their shape while the tenderness beneath them resists the consolation the argument offers.
    * **Why B:** The poem mourns a dead child; its mood is grief, not playfulness.
    * **Why C:** It is a private epitaph, not a heroic narrative.
    * **Why D:** The poem is tightly ordered in paired rhymes, not loose or formless.

34. **Type: Fill [Tests Recognising the Poem]**
    @set:3
    * **Question:** "[BLANK]" by Christina Rossetti begins "Remember me when I am gone away, / Gone far away into the silent land".
    * **Answer:** Remember
    * **Feedback:** ✓ Correct. Rossetti's sonnet opens with this plea to be remembered after death, then turns towards releasing the beloved from grief.
    * **WhyWrong:** The title is "Remember" — the sonnet that opens with this plea to be remembered.

35. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "Remember" by Christina Rossetti is written in which form?
    * **Options:** A) A sonnet, turning at "Yet if you should forget me for a while", B) A dramatic monologue, C) An ode, D) A ballad
    * **Correct:** A
    * **Feedback:** ✓ Correct. Its fourteen lines turn from a plea to be remembered towards selfless release, the volta shifting "Yet if you should forget me for a while".
    * **Why B:** There is no silent listener being unwittingly exposed, as in a dramatic monologue.
    * **Why C:** An ode praises its subject outright; this poem quietly releases the beloved from guilt instead.
    * **Why D:** A ballad tells a story in song-like stanzas; this poem is a single fourteen-line address.

36. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** In "Remember", the poem's turn shifts the speaker from wanting to be remembered towards releasing the beloved to "forget and smile" instead.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The volta transforms the plea into a bequest, love proving itself by freeing the beloved from grief: "Better by far you should forget and smile".
    * **WhyWrong:** This is true — the poem's turn moves from a plea for memory towards a selfless release from mourning.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens "Stop all the clocks, cut off the telephone", commanding the world itself to mourn?
    * **Options:** A) Funeral Blues, B) On My First Son, C) Clearances 7: In the Last Minutes, D) Long Distance II
    * **Correct:** A
    * **Feedback:** ✓ Correct. Auden's "Funeral Blues" opens with these imperious commands to silence the world, mourning someone who was "my North, my South, my East and West".
    * **Why B:** On My First Son is a quiet epitaph, not a series of commands to the world.
    * **Why C:** Clearances 7 recalls a mother's death through remembered dialogue, not commands to stop the world.
    * **Why D:** Long Distance II centres on a father's private grief and a disconnected phone number, not commands to the world.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How is "Funeral Blues" structured?
    * **Options:** A) In four rhyming quatrains, its public, commanding tone masking intensely private grief, B) As a fourteen-line sonnet, C) As a villanelle with two refrains, D) In free verse with no rhyme
    * **Correct:** A
    * **Feedback:** ✓ Correct. The four tightly rhymed quatrains give the grief a formal, almost ceremonial shape, even as the feeling inside it grows starkly personal.
    * **Why B:** The poem runs to sixteen lines in four stanzas, not a fourteen-line sonnet.
    * **Why C:** There are no two recurring refrains, as a villanelle demands.
    * **Why D:** The poem is tightly rhymed throughout, not unrhymed free verse.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the effect of the escalating, impossible commands in the final stanza of "Funeral Blues" — "Pack up the moon and dismantle the sun"?
    * **Options:** A) They convey grief so total that the ordered universe itself seems to need dismantling, since "nothing now can ever come to any good", B) They convey that the speaker is indifferent to the loss, C) They celebrate a joyful occasion, D) They suggest the relationship was unimportant
    * **Correct:** A
    * **Feedback:** ✓ Correct. By demanding the moon, sun, ocean and stars themselves be undone, Auden makes personal grief feel world-ending, the loss too vast for any lesser gesture.
    * **Why B:** The escalating demands convey grief's overwhelming force, not indifference.
    * **Why C:** The imagery is one of desolation and mourning, not celebration.
    * **Why D:** The scale of the demands proves just how central this loss was to the speaker.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem describes a father who, two years after his wife's death, still "kept her slippers warming by the gas" and renewed her bus pass?
    * **Options:** A) Long Distance II, B) Clearances 7: In the Last Minutes, C) On My First Son, D) Funeral Blues
    * **Correct:** A
    * **Feedback:** ✓ Correct. Harrison's "Long Distance II" pictures a father maintaining his dead wife's routines, unable to accept "that very soon he'd hear her key" in the door again.
    * **Why B:** Clearances 7 is set at the moment of the mother's death itself, not years of a father's continued routines afterwards.
    * **Why C:** On My First Son mourns a son, not a wife, and contains no routines of denial.
    * **Why D:** Funeral Blues commands the world to stop; it does not describe ongoing domestic routines of denial.

41. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Long Distance II" is built from four rhyming [BLANK]s, its plain, controlled surface holding back the raw grief beneath.
    * **Answer:** quatrains
    * **Feedback:** ✓ Correct. The steady, ABAB-rhymed quatrains keep a calm, ordered surface while the father's — and later the son's — grief quietly breaks through.
    * **WhyWrong:** The unit is the "quatrain" — four rhyming four-line stanzas structure the poem's restrained grief.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the final image of the "disconnected number I still call" reveal about the speaker of "Long Distance II"?
    * **Options:** A) That the son, who once judged his father's denial, now shares the same inability to accept his parents' deaths, B) That the speaker has fully moved on from his grief, C) That the phone was disconnected by mistake, D) That the speaker never knew his parents well
    * **Correct:** A
    * **Feedback:** ✓ Correct. Having seemed to judge his father's superstition, the son admits he still dials a number he knows is dead — grief passed down, and denial proving universal.
    * **Why B:** The final image reveals grief persisting, not resolution or moving on.
    * **Why C:** The disconnection is a fact of death, not an accident to be corrected.
    * **Why D:** The lasting grief shown throughout implies deep attachment, not distance.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem, one of a sequence of sonnets for the poet's mother, recalls the father speaking quietly to her in her final moments, recalling their early life together at "New Row"?
    * **Options:** A) Clearances 7: In the Last Minutes, B) Long Distance II, C) Funeral Blues, D) On My First Son
    * **Correct:** A
    * **Feedback:** ✓ Correct. Heaney's "Clearances 7" recalls his father's few last, tender words to his dying mother, the children sensing they held more feeling than a lifetime of silence.
    * **Why B:** Long Distance II is spoken by the son years after his mother's death, not at the deathbed itself.
    * **Why C:** Funeral Blues is a public-facing lament with no remembered deathbed dialogue.
    * **Why D:** On My First Son mourns a son through epitaph, not a mother's final moments.

44. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** "Clearances 7: In the Last Minutes" is a sonnet, one of a linked sequence of eight sonnets Heaney wrote in memory of his mother.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Heaney's "Clearances" sequence gathers eight sonnets around his mother's life and death; this is the seventh, set at her final moments.
    * **WhyWrong:** This is true — it is a sonnet within Heaney's eight-part "Clearances" sequence for his mother.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning and effect of "Clearances 7: In the Last Minutes"?
    * **Options:** A) The father's brief, quiet words to the dying mother carry more feeling than a lifetime of talk, B) The reserved, undemonstrative manner of the father reflects a habitual reluctance to voice emotion openly, C) The scale of the moment is measured against how little is usually said, making the tenderness stand out, D) The poem portrays a marriage that had grown cold and distant
    * **Correct:** A, B, C
    * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Heaney sets the father's rare, tender last words against a habitual reserve, so a single quiet sentence carries the weight of their whole life together.
    * **Why D:** The moment reveals deep, quiet devotion, not coldness or distance.
