# Foundational Quiz Bank — Edexcel Belonging Poetry (Poems)

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
45 questions on the actual ANTHOLOGY POEMS (Tier B) — three per poem across Neil's three
understanding dimensions: Recognising the Poem · Form & Features · Meaning & Effects. Unlike
the forms-only bank this file previously held, these are poem-specific, testing what the
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
- **@set:1** — Island Man (Grace Nichols) · The Émigrée (Carol Rumens) · Kumukanda (Kayo Chingonyi) · Mild the Mist Upon the Hill (Emily Brontë) · To My Sister (William Wordsworth)
- **@set:2** — Sunday Dip (John Clare) · Clear and Gentle Stream (Robert Bridges) · I Remember, I Remember (Thomas Hood) · Captain Cook / To My Brother (Letitia Elizabeth Landon) · In Wales, wanting to be Italian (Imtiaz Dharker)
- **@set:3** — We Refugees (Benjamin Zephaniah) · Peckham Rye Lane (A. K. Blakemore) · Us (Zaffar Kunial) · Jamaican British (Raymond Antrobus) · My Mother's Kitchen (Choman Hardi)

The token is kept OUT of the `[Tests …]` stratification key — the current parser ignores it
(live quiz stays category-stratified); only the future set-filter engine reads it via `fq_set=N`
(mirrors Tier A's `@part:N` / `fq_part=N`). Mastery redo-to-100% walks every poem in the
unlocked sets, so per-poem coverage is guaranteed once the engine stratifies the draw by poem.

### Quiz: Belonging Poetry

<!-- ============================ SET 1 ============================ -->

1. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that belonging can be split rather than settled — a man whose Caribbean island still surfaces in him each morning before "Another London day" reclaims him?
   * **Options:** A) Island Man, B) The Émigrée, C) We Refugees, D) I Remember, I Remember
   * **Correct:** A
   * **Feedback:** ✓ Correct. Grace Nichols's "Island Man" presents belonging as divided: the "blue surf" of his "small emerald island" rises in him each dawn before the "North Circular roar" pulls him back to "Another London day."
   * **Why B:** The Émigrée's argument is about an idealised memory of a lost homeland, not a daily waking suspended between two present places.
   * **Why C:** We Refugees argues that anyone could become a refugee, not the split belonging of one settled migrant.
   * **Why D:** I Remember, I Remember mourns lost childhood innocence, not a life lived between two homes.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** What structural choice does Nichols make in "Island Man", and what effect does it create?
   * **Options:** A) Free verse with no punctuation, blurring sleep and waking, memory and present, B) A strict rhyming sonnet, C) A ballad with a repeated refrain, D) Rhyming couplets throughout
   * **Correct:** A
   * **Feedback:** ✓ Correct. The unbroken, unpunctuated free verse lets the island memory and the London morning bleed into one another, mirroring the man's drifting mind — until the closing line, "Another London day", snaps him (and the reader) back into cold reality.
   * **Why B:** The poem has no fixed fourteen-line sonnet shape.
   * **Why C:** There is no song-like refrain driving a narrative.
   * **Why D:** The poem avoids rhyme and regular punctuation entirely.

3. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does "Island Man" suggest about the man's sense of belonging?
   * **Options:** A) He belongs entirely to London and has forgotten his island home, B) His island home still surfaces in him each morning, so he lives suspended between two homes, C) He longs to return and never really left, D) He feels no connection to place at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. Nichols presents belonging as split rather than settled — the island persists as a felt presence even as the man rises into another ordinary London day.
   * **Why A:** The island memory returns vividly every morning; it has not been forgotten.
   * **Why C:** He does rise into his London day — the poem reveals co-existence, not a refusal to leave.
   * **Why D:** The pull of both places is exactly what gives the poem its emotional weight.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that an idealised memory of a lost homeland can stay luminous even when the real place has darkened — insisting on its sunlight though "it may be sick with tyrants"?
   * **Options:** A) The Émigrée, B) Island Man, C) Sunday Dip, D) My Mother's Kitchen
   * **Correct:** A
   * **Feedback:** ✓ Correct. Carol Rumens's "The Émigrée" holds a sunlit memory of a lost homeland undimmed even though "It may be at war, it may be sick with tyrants" — memory outlasting a darkened reality.
   * **Why B:** Island Man concerns a daily waking between sea and city, not a single fixed memory of a homeland at war.
   * **Why C:** Sunday Dip celebrates communal play at a rural river, not a remembered city under tyranny.
   * **Why D:** My Mother's Kitchen holds belonging in domestic objects, not a besieged homeland kept alive in memory.

5. **Type: Fill [Tests Form & Features]**
   @set:1
   * **Question:** In "The Émigrée", the recurring image of [BLANK] runs through every stanza, keeping the memory of the homeland bright regardless of its darkened present.
   * **Answer:** sunlight
   * **Feedback:** ✓ Correct. The repeated "sunlight" threads through the poem — "branded by an impression of sunlight", "It tastes of sunlight" — its return making the idealised memory feel undimmable, so the structure itself sustains the poem's argument about memory.
   * **WhyWrong:** The image is "sunlight" — its repetition keeps the remembered homeland glowing however dark the reality has become.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What central tension does "The Émigrée" make us feel?
   * **Options:** A) Between an idealised, remembered homeland and the hostility of the speaker's present situation, B) Between two rival explorers, C) Between a mother and her son, D) Between paper documents and stone monuments
   * **Correct:** A
   * **Feedback:** ✓ Correct. The speaker's luminous childhood memory is set against present-day hostility — voices that "accuse me of absence" and "mutter death" — yet she insists the sunlight cannot be taken from her.
   * **Why B:** There is no explorer narrative in this poem.
   * **Why C:** The bond in this poem is with a remembered place, not a family relationship.
   * **Why D:** No paper or stone imagery drives this poem's meaning.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem argues that growing up away from one's heritage leaves an identity unfinished — mourning that the speaker never got "to cross the river boys of our tribe must cross / in order to die and come back grown"?
   * **Options:** A) Kumukanda, B) Us, C) Jamaican British, D) My Mother's Kitchen
   * **Correct:** A
   * **Feedback:** ✓ Correct. Kayo Chingonyi's "Kumukanda" borrows a word for an initiation rite: raised "in a strange land", the speaker fears Tata's people "would think me unfinished", "a child who never sloughed off the childish estate."
   * **Why B:** Us explores mixed heritage through language and wordplay, not a missed initiation rite.
   * **Why C:** Jamaican British weighs two national identities, not a rite of passage never undergone.
   * **Why D:** My Mother's Kitchen holds belonging in domestic memory, not an incomplete passage into manhood.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** How does the free-verse form of "Kumukanda" serve its exploration of a divided self?
   * **Options:** A) It lets the poem move freely between ordinary British memory and an imagined ancestral rite, holding both worlds at once without forcing either into a fixed shape, B) A strict villanelle with fixed refrains locks the poem into one repeating idea, C) A ballad narrates a single dramatic story from start to finish, D) An epic in rhyming couplets keeps the tone grand and impersonal
   * **Correct:** A
   * **Feedback:** ✓ Correct. The open free verse lets Chingonyi slip between British memory — "auntie broke the news" — and an imagined "alternate self" who greets him "in the language of my father / and my father's father and my father's father's father", so the loose form itself holds his divided belonging.
   * **Why B:** The poem carries no repeating villanelle refrains; its openness is the point.
   * **Why C:** It reflects on identity rather than narrating a single dramatic event.
   * **Why D:** Its free verse is intimate and searching, not a grand epic in couplets.

9. **Type: True-False [Tests Meaning & Effects]**
   @set:1
   * **Question:** "Kumukanda" suggests that the speaker feels his passage into manhood is incomplete, having grown up away from the initiation rites of his heritage.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The poem's sense of unfinished rite of passage is central — the speaker imagines his "alternate self, who never left" wondering "what would he make of these literary pretensions, / this need to speak with a tongue that isn't mine?"
   * **WhyWrong:** This is the poem's core idea — a felt absence of the initiation his heritage would traditionally have given him, dramatised through the imagined, estranged "alternate self."

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues for a calm acceptance of an unknown future, its speaker drawn out of a rain-washed evening back into childhood — "I am a child once more"?
    * **Options:** A) Mild the Mist Upon the Hill, B) Clear and Gentle Stream, C) Sunday Dip, D) To My Sister
    * **Correct:** A
    * **Feedback:** ✓ Correct. Emily Brontë's "Mild the Mist Upon the Hill" reads the mist as "Telling not of storms to-morrow" and settles into contented memory — "Oh, I'm gone back to the days of youth, / I am a child once more" — a poem about peaceful acceptance and the pull of the past.
    * **Why B:** Clear and Gentle Stream holds onto a stream as a lasting link to home, not an evening meditation that surrenders to memory.
    * **Why C:** Sunday Dip celebrates communal, present-tense play at the water, not quiet reflection on the future and the past.
    * **Why D:** To My Sister urges an active, outdoor embrace of spring, not a still surrender into remembered childhood.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** How do the short, regular rhyming quatrains of "Mild the Mist Upon the Hill" shape its mood as the speaker turns from the misted hill to childhood memory?
    * **Options:** A) The settled, quietly chiming regularity gives the poem a calm, lulling stillness that mirrors the speaker's peaceful surrender to memory, B) The broken, irregular lines enact restless anxiety about the future, C) A galloping, driving metre rushes the poem urgently forward, D) The rhyme has no bearing on the poem's mood
    * **Correct:** A
    * **Feedback:** ✓ Correct. The even, gently chiming quatrains settle the poem into a contemplative calm, so its very regularity carries the speaker's untroubled drift back to "the days of youth" and "my father's sheltering roof."
    * **Why B:** The form is regular and settled, not broken or anxious — the mood is peace, not dread.
    * **Why C:** The measure is slow and reflective, the opposite of a galloping rush.
    * **Why D:** The lulling regularity is exactly what creates the poem's calm — form and mood are one.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What attitude towards the future does "Mild the Mist Upon the Hill" express?
    * **Options:** A) Anxious dread of what is to come, B) A calm willingness to let the future stay unknown, finding peace in the present moment, C) Total indifference to life itself, D) A demand to control fate
    * **Correct:** B
    * **Feedback:** ✓ Correct. The mist is "Telling not of storms to-morrow", and rather than pressing for certainty, the speaker settles into contentment, drawn back by "dreamy scents of fragrance" that "breathe of other years."
    * **Why A:** The tone is settled and calm, not anxious.
    * **Why C:** The poem values the present moment closely; this is not indifference.
    * **Why D:** The speaker accepts uncertainty rather than trying to master it.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that a single day's shared feeling in nature can teach more than "years of toiling reason", as the speaker calls his sister out into "the first mild day of March"?
    * **Options:** A) To My Sister, B) Sunday Dip, C) Clear and Gentle Stream, D) I Remember, I Remember
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth's "To My Sister" prizes the felt lesson of nature over study — "One moment now may give us more / Than years of toiling reason" — summoning his sister into the first spring day to share it.
    * **Why B:** Sunday Dip pictures boys' communal river play, not an argument that nature teaches more than reason.
    * **Why C:** Clear and Gentle Stream addresses a remembered stream as a link to home, not a call to seize a spring day.
    * **Why D:** I Remember, I Remember looks back wistfully on a lost childhood home, not outward to a present day in nature.

14. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** "To My Sister" moves in regular, song-like rhyming stanzas. How does that form serve its call to come out into spring?
    * **Options:** A) The easy, tuneful regularity makes the invitation feel warm, natural and celebratory, as if nature's own harmony is echoed in the verse, B) A jagged, broken form conveys reluctance and unease about going outside, C) A dense, unrhymed argument makes the poem feel coldly intellectual, D) The rhyme scheme has no connection to the poem's meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The gentle, chiming stanzas give the summons — "Come forth and feel the sun" — a light, songlike warmth, so the form itself embodies the joyful harmony with nature the speaker urges.
    * **Why B:** The form is smooth and inviting, not jagged; the mood is welcome, not reluctance.
    * **Why C:** The verse is tuneful and warm, not a cold unrhymed argument.
    * **Why D:** The songlike regularity is what makes the call feel joyful and natural — form serves meaning.

15. **Type: Select All [Tests Meaning & Effects]**
    @set:1
    * **Question:** Which statements correctly describe the meaning of "To My Sister"?
    * **Options:** A) The speaker calls his sister to come outside and feel the first day of spring, B) The poem values what nature can teach in a moment above long hours of study, C) The poem is set deep in winter with no sign of spring, D) The speaker dismisses any bond between people and nature
    * **Correct:** A, B
    * **Scoring:** 2 marks for A,B. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Wordsworth draws his sister outdoors on the first mild day of March, prizing the immediate, felt lesson of nature — "One moment now may give us more / Than years of toiling reason" — over indoor toil.
    * **Why C:** The poem marks the first mild day of March, the turn towards spring, not the depths of winter.
    * **Why D:** The poem's whole purpose is to draw the sister into a shared, restorative bond with nature.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem roots belonging in the shared, open-air joy of a local place — boys thronging "the morning road" to "seek the water for their Sunday joys"?
    * **Options:** A) Sunday Dip, B) Clear and Gentle Stream, C) I Remember, I Remember, D) Kumukanda
    * **Correct:** A
    * **Feedback:** ✓ Correct. John Clare's "Sunday Dip" finds belonging in communal pleasure tied to a particular landscape — boys who "run to seek the shallow pit" and "play about the water half the day."
    * **Why B:** Clear and Gentle Stream is one speaker's solitary address to a remembered stream, not a shared communal scene.
    * **Why C:** I Remember, I Remember recalls a private childhood home, not a communal outdoor gathering.
    * **Why D:** Kumukanda mourns a missed rite of passage, not the shared joy of a local place.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "Sunday Dip" unfolds in steady rhyming couplets packed with concrete, close-up detail. What does that shape achieve?
    * **Options:** A) The brisk, chiming couplets and vivid physical detail make the shared outing feel immediate, lively and rooted in a real place, B) A fractured, disordered form conveys confusion and menace, C) A slow, mournful measure turns the scene into an elegy, D) The form has no effect on how we experience the scene
    * **Correct:** A
    * **Feedback:** ✓ Correct. The bright, regular couplets and closely observed action — boys who "bundle up the rushes for a boat" and ride "beneath the willow trees" — give the poem the busy, joyful immediacy of a real morning shared at the water.
    * **Why B:** The form is orderly and buoyant, not fractured or menacing.
    * **Why C:** The mood is lively and communal, not a slow lament.
    * **Why D:** The tripping couplets and physical detail are exactly what make the scene feel alive and present.

18. **Type: True-False [Tests Meaning & Effects]**
    @set:2
    * **Question:** "Sunday Dip" presents belonging as something felt through a shared, joyful connection with a particular local landscape and community.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The boys "duck about, and try to lose their fears, / And laugh to hear the thunder in their ears", and "play about the water half the day" — the pleasure of the shared river outing roots belonging in a specific place and its people.
    * **WhyWrong:** This is the poem's central feeling — belonging grounded in a loved local landscape and the company shared within it.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem makes a remembered stream a lasting thread back to childhood and home, its speaker returning to sing "my old lament" beside the "Clear and gentle stream"?
    * **Options:** A) Clear and Gentle Stream, B) Sunday Dip, C) Us, D) My Mother's Kitchen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Robert Bridges's "Clear and Gentle Stream" speaks straight to the stream "Known and loved so long", using its constancy as an enduring link to "the idle dream / Of my boyish day."
    * **Why B:** Sunday Dip is a communal bathing scene, not one speaker's sustained address to a remembered stream.
    * **Why C:** Us explores mixed heritage through language, not a childhood place revisited.
    * **Why D:** My Mother's Kitchen holds belonging in domestic objects, not in a stream and its banks.

20. **Type: Fill [Tests Form & Features]**
    @set:2
    * **Question:** "Clear and Gentle Stream" speaks straight to the stream, repeatedly hailing it "Clear and gentle stream!" — a use of [BLANK], direct address to something that cannot answer, which makes the poem feel like an intimate, ongoing conversation with a remembered home.
    * **Answer:** apostrophe
    * **Feedback:** ✓ Correct. By addressing the stream directly — "Clear and gentle stream! / Known and loved so long" — the poem becomes a tender, confiding conversation with a loved place, so the very act of address carries its sense of belonging.
    * **WhyWrong:** The term is "apostrophe" — direct address to something that cannot answer; here it turns the stream into a living confidant, deepening the poem's intimacy.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the stream come to represent in "Clear and Gentle Stream"?
    * **Options:** A) A threat to be feared, B) A lasting, comforting link to a remembered home and a settled sense of belonging, C) A symbol of war, D) A barrier the speaker cannot cross
    * **Correct:** B
    * **Feedback:** ✓ Correct. Returning to "Where my old seat was", the speaker finds "the fish lie cool / In their chosen pool" just as before — the stream becomes a steady emblem of home, its constancy offering comfort even as the speaker admits, "Ere again I go / Where thou dost not flow."
    * **Why A:** The stream is treated with affection, not fear.
    * **Why C:** The poem is rooted in peaceful memory, not conflict.
    * **Why D:** The stream connects the speaker to home rather than blocking their way.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem lovingly recalls "The house where I was born" only to mourn how far adulthood has carried the speaker from a child's wonder?
    * **Options:** A) I Remember, I Remember, B) To My Sister, C) Clear and Gentle Stream, D) Sunday Dip
    * **Correct:** A
    * **Feedback:** ✓ Correct. Thomas Hood's "I Remember, I Remember" recalls the house, flowers and fir trees of childhood, then turns to loss — that he is now "farther off from heav'n / Than when I was a boy."
    * **Why B:** To My Sister calls a sibling into a present spring day, not back to a lost childhood home.
    * **Why C:** Clear and Gentle Stream centres on a remembered stream, not a birth house and the ache of growing up.
    * **Why D:** Sunday Dip celebrates present communal play, not nostalgic distance from childhood.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does the repeated opening "I remember, I remember" shape the whole poem?
    * **Options:** A) The refrain tolling at the head of each stanza builds a gentle, incantatory rhythm that makes the poem feel like an act of yearning recollection, B) Unstructured free verse makes the memories feel random and disconnected, C) A dramatic monologue whose speaker betrays himself to a silent listener, D) A tightly argued sonnet building to a single logical turn
    * **Correct:** A
    * **Feedback:** ✓ Correct. The refrain "I remember, I remember" returns at the start of each stanza, and that insistent circling back gives the poem its tender, incantatory movement — memory returning on itself.
    * **Why B:** The poem is tightly rhymed and patterned, not random free verse.
    * **Why C:** There is no self-betraying speaker addressing a listener, as in a dramatic monologue.
    * **Why D:** It unfolds across several stanzas of returning memory, not a single sonnet argument.

24. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How does the poem's final stanza change its tone?
    * **Options:** A) It stays purely joyful throughout, B) It turns wistful, admitting that growing up has left the speaker further from the innocent wonder of childhood, C) It becomes angry at the speaker's parents, D) It rejects the whole memory as false
    * **Correct:** B
    * **Feedback:** ✓ Correct. Hood's closing stanza turns from fond nostalgia to quieter regret — "now 'tis little joy / To know I'm farther off from heav'n / Than when I was a boy" — as adulthood carries him from childhood's wonder.
    * **Why A:** The final stanza tempers the earlier warmth with genuine wistfulness.
    * **Why C:** There is no anger directed at his parents.
    * **Why D:** The memory is treated as precious, not dismissed as false.

25. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that childhood's shared imagination is a lost world, recalling how the speaker and her brother turned "the pond amid the willows" into an ocean of adventure?
    * **Options:** A) Captain Cook / To My Brother, B) Us, C) Kumukanda, D) In Wales, wanting to be Italian
    * **Correct:** A
    * **Feedback:** ✓ Correct. Letitia Elizabeth Landon's "Captain Cook / To My Brother" recalls the siblings who "sail'd with him at sea" and named water-lilies "the South Sea islands, each flower a different isle", only to mourn that "We leave in leaving childhood, life's fairy land behind."
    * **Why B:** Us explores mixed heritage through wordplay, not a lost childhood game shared with a brother.
    * **Why C:** Kumukanda mourns a missed initiation rite, not the vanished imaginative world of childhood.
    * **Why D:** In Wales, wanting to be Italian longs for an imagined foreign self, not a remembered childhood with a sibling.

26. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Landon writes "Captain Cook / To My Brother" as a direct address to her brother throughout. What does speaking straight to him achieve?
    * **Options:** A) It makes the shared reminiscence feel intimate and confiding, as if we overhear two siblings privately recalling a lost childhood world, B) It turns the poem into a formal public debate between opposing voices, C) It distances the reader, keeping the memory cold and impersonal, D) It has no effect on how the memory feels
    * **Correct:** A
    * **Feedback:** ✓ Correct. Addressing her brother directly — "Do you recall the fancies of many years ago" — makes the poem a private, tender act of shared memory, drawing us into the closeness the siblings once had and now mourn.
    * **Why B:** It is one voice confiding in a loved brother, not a debate between rival speakers.
    * **Why C:** Direct address makes the poem warmer and more intimate, not cold or impersonal.
    * **Why D:** The confiding second-person voice is exactly what gives the reminiscence its intimacy.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What feeling does "Captain Cook / To My Brother" finally leave us with as the speaker recalls the siblings' shared games?
    * **Options:** A) A wistful grief that the vivid, shared imagination of childhood — turning a pond into "the South Sea islands" — can never be recovered in adult life, B) Triumphant pride at having grown up and left childish games behind, C) Cold indifference to the past and to her brother, D) Excitement at planning a real voyage of discovery
    * **Correct:** A
    * **Feedback:** ✓ Correct. The golden game of sailing with Cook gives way to the ache that "We leave in leaving childhood, life's fairy land behind" — the poem mourns a shared, imaginative belonging that adulthood cannot restore.
    * **Why B:** The tone is mournful loss, not proud triumph at growing up.
    * **Why C:** The poem is warm and intimate, addressed lovingly to her brother — the opposite of indifference.
    * **Why D:** The voyages are a remembered childhood fantasy, not a real journey the speaker plans.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem explores how the imagination longs to belong somewhere brighter than home — its speaker "being sixteen / in Wales, longing to be Italian", picturing herself "by a Vespa with a cigarette"?
    * **Options:** A) In Wales, wanting to be Italian, B) The Émigrée, C) Peckham Rye Lane, D) My Mother's Kitchen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Imtiaz Dharker's "In Wales, wanting to be Italian" sets the speaker's actual, grey Wales against a glamorous imagined Italian self she can only dream into being.
    * **Why B:** The Émigrée mourns a real, remembered homeland, not an imagined ideal never actually lived in.
    * **Why C:** Peckham Rye Lane is rooted in a specific real London street, not an imagined foreign country.
    * **Why D:** My Mother's Kitchen centres on a family kitchen, not a longing to belong somewhere else.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** How does Dharker structure the contrast in "In Wales, wanting to be Italian", and what does that structure do?
    * **Options:** A) A string of questions presses grey, actual places against a vivid imagined foreign self, so the form itself enacts the restless reaching for an elsewhere, B) A strict Petrarchan sonnet argument resolves the longing neatly, C) The poem is written entirely in Italian, D) The poem refuses to mention Wales at all
    * **Correct:** A
    * **Feedback:** ✓ Correct. Dharker builds the poem from questions — "living in Glasgow, / dying to be French"; "being sixteen / in Wales, longing to be Italian" — pressing dull, real places against a bright imagined self, so the piling-up of longings is the poem's very shape.
    * **Why B:** The poem does not rely on a formal sonnet argument, and it never resolves the longing.
    * **Why C:** The poem is written in English, using Italy as an idea rather than its language.
    * **Why D:** Wales is the poem's actual, present setting throughout.

30. **Type: Select All [Tests Meaning & Effects]**
    @set:2
    * **Question:** Which statements correctly describe the meaning of "In Wales, wanting to be Italian"?
    * **Options:** A) The poem reveals how imagination can offer an escape from a place that feels unlike home, B) It suggests belonging can be complicated by wishing you were somewhere else entirely, C) The speaker feels completely at home in Wales with no complications, D) It presents Italy as somewhere the speaker has clear, lived memories of
    * **Correct:** A, B
    * **Scoring:** 2 marks for A,B. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. Dharker explores an unsettled sense of belonging: to say aloud, "without embarrassment, Bella! Bella!" is to reach for a brighter elsewhere rather than accepting the place the speaker actually inhabits.
    * **Why C:** The whole poem is driven by a sense of not-quite belonging in Wales.
    * **Why D:** Italy is presented as an imagined ideal, not a place of lived memory.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues, through examples across history and the world, that anyone could become a refugee overnight, however settled they feel now?
    * **Options:** A) We Refugees, B) Us, C) Jamaican British, D) My Mother's Kitchen
    * **Correct:** A
    * **Feedback:** ✓ Correct. Benjamin Zephaniah's "We Refugees" insists that circumstance, not fixed identity, decides who becomes a refugee — "We can all be refugees / Nobody is safe."
    * **Why B:** Us explores heritage through language and wordplay, not the universal risk of displacement.
    * **Why C:** Jamaican British weighs two national identities, not the shared vulnerability to displacement.
    * **Why D:** My Mother's Kitchen centres on family memory, not an argument about who might become a refugee.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** "We Refugees" is built from loose, spoken free verse and an insistent, repeated refrain. How does that form serve its argument?
    * **Options:** A) The chant-like repetition and direct, spoken rhythm hammer the message home and pull the listener into a shared "we", making the warning feel urgent and universal, B) A strict, ornate stanza form keeps the poem distant and decorative, C) The lack of any repetition makes each idea feel isolated and forgettable, D) The spoken style has no bearing on the poem's meaning
    * **Correct:** A
    * **Feedback:** ✓ Correct. The performance-poem drive of "We can all be refugees" and "We all came from refugees" turns the poem into a direct, rhythmic address, so the form itself presses its universal warning on the listener.
    * **Why B:** The form is plain and spoken, not ornate or distancing.
    * **Why C:** The poem's force comes precisely from its insistent repetition, not from its absence.
    * **Why D:** The chant-like refrain and spoken rhythm are central to how the argument lands.

33. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "We Refugees" suggests that being a refugee is a fixed identity that could never apply to the reader themselves.
    * **Answer:** False
    * **Feedback:** ✓ Correct. The poem argues the opposite — "Nobody is safe", and in the wrong circumstances anyone, including the reader, could become a refugee.
    * **WhyWrong:** The poem's whole argument runs the other way: displacement can happen to anyone, so the reader is invited to empathise rather than feel distant from it.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem finds belonging in the crowded, everyday life of one real South London street, crammed with "afro combs and mobile phones in the white heat" and "cornflower scrunchies, liquorice weaves"?
    * **Options:** A) Peckham Rye Lane, B) Us, C) My Mother's Kitchen, D) Sunday Dip
    * **Correct:** A
    * **Feedback:** ✓ Correct. A. K. Blakemore's "Peckham Rye Lane" builds belonging from vivid, everyday detail — "Knickers lie flaccid / in Primark" beside "afro combs and mobile phones" — the texture of one real London street.
    * **Why B:** Us explores identity through language, not a single named street.
    * **Why C:** My Mother's Kitchen is set in a family kitchen, not a public street.
    * **Why D:** Sunday Dip is set at a rural river, not an urban London street.

35. **Type: Fill [Tests Form & Features]**
    @set:3
    * **Question:** "Peckham Rye Lane" builds its picture of the street through a [BLANK] of sensory, concrete details — "afro combs", "cornflower scrunchies, liquorice weaves" — rather than a single continuous story.
    * **Answer:** list
    * **Feedback:** ✓ Correct. The accumulating list of sensory details, piled one on the next, gives the poem the busy, layered, over-crowded feel of a real, lived-in street.
    * **WhyWrong:** The word is "list" — the poem heaps up concrete, sensory details rather than following one continuous narrative, and that accumulation is what makes the street feel alive.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What sense of belonging does "Peckham Rye Lane" suggest?
    * **Options:** A) Belonging can be rooted in the vivid, everyday life of one specific, local place, B) True belonging is only possible in the countryside, C) The street is presented as empty and lifeless, D) The poem rejects any sense of community
    * **Correct:** A
    * **Feedback:** ✓ Correct. Even amid heat and crowding, "Angels gaze from the treetops / like William Blake / and radiate / comfort" — the poem finds belonging in the ordinary, crowded life of a single street, not in any grander or more distant idea of home.
    * **Why B:** The poem's setting is emphatically urban, not rural.
    * **Why C:** The street is presented as full of sensory life and activity.
    * **Why D:** The accumulating detail builds a strong sense of community.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that a mixed heritage can be explored through the layered meanings of a single word — turning over "us" itself, "each wave in the sea, all insides compressed"?
    * **Options:** A) Us, B) Kumukanda, C) Jamaican British, D) Clear and Gentle Stream
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zaffar Kunial's "Us" turns over the meanings folded into a small, shared word — recalling how, as a Midlands child, "us equally meant me" — to explore his hybrid heritage.
    * **Why B:** Kumukanda concerns a missed initiation rite, not wordplay around heritage.
    * **Why C:** Jamaican British weighs national identities directly, rather than through close attention to a single word.
    * **Why D:** Clear and Gentle Stream addresses a stream, not language and etymology.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does "Us" use its method — close attention to language — to explore identity?
    * **Options:** A) By turning over the layered meanings of a single word, the poem lets a hybrid identity sit inside language itself, unforced and unresolved, B) Through a strict ballad narrative that tells a single story, C) Through one unbroken quotation from a historical document, D) Through rhyming couplets celebrating a battle
    * **Correct:** A
    * **Feedback:** ✓ Correct. Kunial's patient attention to a single word — "I, being one, am Liverpool no less / cresting the Mexican wave of we or us" — becomes the way he approaches his own layered, hybrid identity, letting it live in language rather than forcing a resolution.
    * **Why B:** The poem is reflective and exploratory, not a narrated ballad story.
    * **Why C:** It is an original reflection, not a quoted historical document.
    * **Why D:** There is no battle narrative in rhyming couplets here.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Us" suggest about belonging to more than one culture?
    * **Options:** A) It must always be a source of pure conflict, B) It can be explored gently through language itself, without needing to resolve into one single identity, C) It is impossible to hold two heritages at once, D) It has nothing to do with family or heritage
    * **Correct:** B
    * **Feedback:** ✓ Correct. Kunial admits, "colour me unsure. / Something in me, or it, has failed the course", and that "the waves therein are too wide for words" — letting his dual heritage sit within language rather than forcing it into one resolved identity.
    * **Why A:** The poem's tone is reflective and curious, not purely conflicted.
    * **Why C:** The poem reveals both heritages coexisting within the speaker.
    * **Why D:** Heritage and family are exactly what the poem's exploration of language returns to.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem weighs a dual heritage by setting statements like "No way I can be Jamaican British" against "Eat callaloo, plantain, jerk chicken – I'm Jamaican"?
    * **Options:** A) Jamaican British, B) Us, C) Kumukanda, D) In Wales, wanting to be Italian
    * **Correct:** A
    * **Feedback:** ✓ Correct. Raymond Antrobus's "Jamaican British" holds paired statements about each side of his heritage side by side, weighing them against one another rather than choosing.
    * **Why B:** Us approaches heritage through the layered meanings of language, not paired national statements.
    * **Why C:** Kumukanda concerns a missed initiation rite, not paired national identities.
    * **Why D:** In Wales, wanting to be Italian imagines a different country entirely, not a lived dual heritage.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the structure of "Jamaican British" — short, repeatedly paired statements — shape its exploration of identity?
    * **Options:** A) Setting each side of the heritage against the other in clipped, paired lines makes the poem feel like a constant weighing and re-weighing of a divided self, B) One long, unbroken sentence flows without any tension, C) A calm, resolved sonnet settles the question early, D) A heroic ballad narrates a single sequence of events
    * **Correct:** A
    * **Feedback:** ✓ Correct. The insistent pairing — "the English boys at school made me choose: Jamaican, British?" — keeps tipping between the two halves of the speaker's identity, so the very structure enacts the pull of belonging to both at once.
    * **Why B:** The poem works through distinct, weighed pairs, not one smooth unbroken sentence.
    * **Why C:** The form keeps the tension live rather than resolving it in a neat sonnet.
    * **Why D:** There is no narrated sequence of events; the poem weighs identity, it does not tell a ballad.

42. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Jamaican British" ultimately make us feel about the speaker's two heritages?
    * **Options:** A) That neither side can be given up — the poem refuses to choose, holding both together as one whole self, B) That the speaker must finally pick one identity and reject the other, C) That having two heritages is simply a source of pride with no difficulty, D) That the speaker feels no real connection to either heritage
    * **Correct:** A
    * **Feedback:** ✓ Correct. The father's rebuke — "you cannot love sugar and hate your sweetness" — turns the poem away from choosing, insisting the two halves belong together and cannot be divided.
    * **Why B:** The poem's whole movement resists the demand to choose one side.
    * **Why C:** The pairing conveys real strain and pressure, not effortless pride.
    * **Why D:** The speaker is deeply invested in both heritages, not detached from them.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that home and identity are carried in ordinary domestic things — inheriting "rusty pots she doesn't throw away" from a mother who is, at 69, "planning another escape"?
    * **Options:** A) My Mother's Kitchen, B) Clear and Gentle Stream, C) Sunday Dip, D) Peckham Rye Lane
    * **Correct:** A
    * **Feedback:** ✓ Correct. Choman Hardi's "My Mother's Kitchen" uses domestic detail — the mismatched glasses and "rusty pots", the mother's ninth fresh start — to argue that home and belonging survive displacement, held in everyday objects.
    * **Why B:** Clear and Gentle Stream addresses a stream, not a family kitchen and its objects.
    * **Why C:** Sunday Dip describes a communal river scene, not a domestic inheritance.
    * **Why D:** Peckham Rye Lane is set on a public street, not inside a family home.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does "My Mother's Kitchen" use vivid, domestic detail to explore belonging?
    * **Options:** A) The concrete sights of the kitchen become a way into memory and family identity, so ordinary objects carry the weight of home, B) An abstract philosophical argument with no imagery, C) A battle narrative, D) A single technical list of ingredients only
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardi grounds belonging in concrete domestic detail — "her plates, an ugly collection from various sets" and "cups bought in a rush on different occasions" — letting the kitchen carry memory and identity.
    * **Why B:** The poem works through concrete, sensory imagery, not abstract argument.
    * **Why C:** There is no battle narrative in this domestic poem.
    * **Why D:** The kitchen detail serves memory and feeling, not a bare technical list.

45. **Type: Select All [Tests Meaning & Effects]**
    @set:3
    * **Question:** Which statements correctly describe the meaning of "My Mother's Kitchen"?
    * **Options:** A) The kitchen becomes a symbol of home, family and continuity, B) The poem draws on personal, domestic memory to explore identity and belonging, C) The mother is entirely absent from the speaker's memory, D) The poem suggests that home can be carried in memory even after leaving a place behind
    * **Correct:** A, B, D
    * **Scoring:** 2 marks for A,B,D. 1 mark if mostly correct.
    * **Feedback:** ✓ Correct. The mother "never feels regret for things / only for her vine in the front garden" — Hardi's kitchen holds family, continuity, and a portable sense of home that survives repeated displacement, even as the speaker admits, "I know I will never inherit my mother's trees."
    * **Why C:** The mother is the vivid, central presence at the heart of the speaker's memory, not an absence.
