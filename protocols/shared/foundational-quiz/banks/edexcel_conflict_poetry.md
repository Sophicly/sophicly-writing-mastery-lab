# Foundational Quiz Bank — Edexcel Conflict Poetry (Poems)

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**45 questions on the actual ANTHOLOGY POEMS — three per poem** across the three understanding
dimensions: Recognising the Poem · Form & Features · Meaning & Effects. The picker draws a random 5
per round, stratified across categories. Keys + feedback live server-side and are stripped before
questions reach the client. The AI is never the scorekeeper.

**Concept-based (governed by `FQ-QUESTION-STANDARD.md` § POETRY).** Every item tests the CENTRAL
CONCEPT of its dimension, not surface trivia. **Recognising** keys on the poem's *controlling idea /
argument* (anchored by a signature line), not image-matching; **Form & Features** tests how the form
*shapes meaning*, not its label; **Meaning & Effects** tests the controlling idea + the reader's
response. Distractors are plausible CONCEPTUAL MISREADINGS — for Recognising, other anthology poems
whose *argument differs*.

Each question carries an `@set:N` token (N = 1/2/3) staging the poems 5-at-a-time by the
course's reading order (unchanged), so the quiz only serves poems the student has read:
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
   * **Question:** Which poem argues that anger concealed rather than confessed festers and grows until it destroys — ripening at last into a poisoned "apple bright"?
   * **Options:** A) A Poison Tree, B) Cousin Kate, C) Catrin, D) The Class Game
   * **Correct:** A
   * **Feedback:** ✓ Correct. Blake's "A Poison Tree" contrasts wrath told to a friend (which "did end") with wrath hidden from a foe (which "did grow"), until it ripens into a poisoned "apple bright" — an argument that suppressing anger is what makes it deadly.
   * **Why B:** Cousin Kate's argument is about a woman betrayed and cast aside, not the growth of concealed anger.
   * **Why C:** Catrin explores the lifelong pull between a mother and daughter, not buried wrath.
   * **Why D:** The Class Game argues against class prejudice, not the danger of nursed hatred.

2. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "A Poison Tree" is built from short, neatly rhymed couplets that chime almost like a nursery rhyme. What does that tidy, sing-song form achieve?
   * **Options:** A) It makes the poem feel innocent and comforting, so nothing dark is meant, B) Its childlike simplicity jars against a tale of nursed hatred and a gloating death, so the calm surface becomes quietly chilling, C) It shows the speaker has lost all control of his feelings, D) It has no effect on how we read the poem
   * **Correct:** B
   * **Feedback:** ✓ Correct. The gentle, tidy couplets sound almost like a children's rhyme, and that innocence set against nursed hatred and the speaker's satisfaction at a death is exactly what makes the poem so unsettling.
   * **Why A:** The sing-song surface is not the meaning — its innocence is what sharpens the cruelty beneath.
   * **Why C:** The controlled, orderly form suggests a feeling coolly mastered, not one out of control.
   * **Why D:** The clash between gentle form and cruel content is the whole point.

3. **Type: Select All [Tests Meaning & Effects]**
   @set:1
   * **Question:** Which statements correctly describe the meaning and effect of "A Poison Tree" by Blake?
   * **Options:** A) Voicing anger to a friend lets it end, while hiding it from a foe lets it grow, B) The nursed anger is fed with "fears" and "smiles" until it ripens into a poisoned apple, C) The simple, sing-song rhyme heightens the horror of the ending, where the speaker is "glad" to see his foe dead, D) The poem argues that expressing anger openly is always the most dangerous choice
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. Blake shows honest anger dissolving while hidden anger is nursed into poison, its tidy rhyme jarring against the speaker's chilling gladness at his foe's death.
   * **Why D:** The poem argues the opposite — concealing and nursing anger is what proves destructive, not voicing it.

4. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem voices a "cottage-maiden" seduced and discarded by a great lord for her cousin — yet who claims a defiant pride in the son she bore him?
   * **Options:** A) A Poison Tree, B) Cousin Kate, C) Catrin, D) Belfast Confetti
   * **Correct:** B
   * **Feedback:** ✓ Correct. Rossetti's "Cousin Kate" voices a woman shamed as "an unclean thing" after a lord cast her aside for her cousin, yet who insists she has a "gift" — her son — that the married Kate does not.
   * **Why A:** A Poison Tree concerns private, nursed anger, not seduction and betrayal.
   * **Why C:** Catrin explores a living mother-daughter bond, not abandonment by a lord.
   * **Why D:** Belfast Confetti depicts the chaos of a riot, not one woman's betrayal.

5. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Cousin Kate" unfolds in regular, song-like narrative stanzas. How does that ballad shape work on the reader?
   * **Options:** A) It lends her private wrong the weight and reach of a traditional tale of betrayal, sung down the generations, B) Its neat stanzas make the betrayal feel trivial and unimportant, C) The song-like form turns the poem into a cheerful celebration, D) It has no bearing on how we hear her story
   * **Correct:** A
   * **Feedback:** ✓ Correct. The steady, storytelling stanzas give one woman's personal wrong the gravity and universality of a folk tale, so her grievance carries the force of a wrong done to many.
   * **Why B:** The ballad dignifies her grievance; it does not trivialise it.
   * **Why C:** The steady form carries sorrow and defiance, not celebration.
   * **Why D:** The folk-tale shape is exactly what gives one woman's wrong its lasting force.

6. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What complicates any simple view of the speaker as pure victim at the end of "Cousin Kate"?
   * **Options:** A) She regrets everything and is left with nothing, B) Though shamed as "an unclean thing", she claims a defiant pride in her son — a "gift" the married Kate lacks, C) She forgives the lord and blames only herself, D) She and Kate are reconciled as friends
   * **Correct:** B
   * **Feedback:** ✓ Correct. Shamed by society, the speaker still asserts a quiet triumph: she has a "gift" — her son — that childless Kate does not, giving her defiance alongside her grief.
   * **Why A:** Her pride in her son shows she has not lost everything.
   * **Why C:** She indicts the lord's cruelty rather than absolving him.
   * **Why D:** The cousins remain rivals; there is no reconciliation in the poem.

7. **Type: MCQ [Tests Recognising the Poem]**
   @set:1
   * **Question:** Which poem sets the memory of a child's birth against a present-day clash with that same daughter — arguing that a mother's love is a lifelong tug between closeness and the need to be separate?
   * **Options:** A) Catrin, B) Cousin Kate, C) The Class Game, D) A Poison Tree
   * **Correct:** A
   * **Feedback:** ✓ Correct. Clarke's "Catrin" links the "hot, white / Room" of childbirth to a later argument with her daughter, presenting their bond as a continuing struggle to "become / Separate".
   * **Why B:** Cousin Kate is a tale of seduction and betrayal, not a parent-child bond.
   * **Why C:** The Class Game challenges class prejudice, not a mother and daughter.
   * **Why D:** A Poison Tree concerns festering private anger, not family love.

8. **Type: MCQ [Tests Form & Features]**
   @set:1
   * **Question:** "Catrin" falls into two parts — the remembered birth, then the present-day argument — in loose, unrhymed verse. How does that two-part, free-verse shape serve the poem?
   * **Options:** A) It keeps memory and present neatly separate, showing the two conflicts are unrelated, B) It lets the same struggle for separateness echo across the years, so the free, unbound lines mirror a bond that resists being tidied or resolved, C) It proves the mother has forgotten the birth entirely, D) It has no effect on the poem's meaning
   * **Correct:** B
   * **Feedback:** ✓ Correct. The two parts rhyme thematically rather than formally: the same "rope of love" pulls through both, and the loose, unbound lines enact a relationship that never fully settles.
   * **Why A:** The two parts are deeply connected — the same conflict pulls through both, not two unrelated ones.
   * **Why C:** The vivid opening memory shows the birth is anything but forgotten.
   * **Why D:** The unresolved, unrhymed shape enacts a tension that never quite settles — that is the point.

9. **Type: MCQ [Tests Meaning & Effects]**
   @set:1
   * **Question:** What does the recurring image of the "tight red rope of love" convey in "Catrin"?
   * **Options:** A) That mother and daughter share no real connection, B) That their love is a continuing tug-of-war — binding them together even as they pull against one another for independence, C) That the daughter wholly resents her mother, D) That physical strength decides who wins the conflict
   * **Correct:** B
   * **Feedback:** ✓ Correct. The umbilical image returns as a "rope" that once physically joined them and now figures their ongoing pull — close and loving, yet a struggle over control and freedom.
   * **Why A:** The rope image insists on a deep, continuing connection, not its absence.
   * **Why C:** The tension is loving as well as frustrated, not simple resentment.
   * **Why D:** The conflict is emotional and generational, not a matter of physical strength.

10. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem argues that nature is a vast, almost moral power that can awe and humble the human mind — dramatised when a "huge peak, black and huge" seems to stride after a boy who has stolen a boat?
    * **Options:** A) Extract from The Prelude, B) Catrin, C) The Charge of the Light Brigade, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Wordsworth's extract from "The Prelude" recounts stealing a boat, then a "huge peak, black and huge" that seems to pursue him, leaving "huge and mighty forms" in his mind — nature as a sublime power that humbles and shapes the self.
    * **Why B:** Catrin is set between a hospital room and a home, not a night lake.
    * **Why C:** The Charge of the Light Brigade recounts a cavalry charge, not a boy alone on water.
    * **Why D:** Belfast Confetti is set amid a riot, not a solitary night on a lake.

11. **Type: MCQ [Tests Form & Features]**
    @set:1
    * **Question:** Wordsworth casts this childhood memory in the unrhymed blank verse of epic. Why does that choice matter to the poem's meaning?
    * **Options:** A) It makes the poem a light, song-like ballad, B) The grand, epic measure lends one boyhood night a solemn, lasting weight — as if that moment shaped the whole self, C) It shows the boy is too frightened to rhyme, D) It has no bearing on how we read the memory
    * **Correct:** B
    * **Feedback:** ✓ Correct. Blank verse is the measure of epic; using it for a personal memory dignifies that night on the lake, making it feel formative and enduring rather than trivial.
    * **Why A:** The reflective blank verse is the opposite of a song-like ballad.
    * **Why C:** Blank verse is a deliberate, elevated choice, not a sign of fear.
    * **Why D:** The epic form is exactly what dignifies and deepens a private memory.

12. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What does the mountain episode in "The Prelude" make the reader feel about nature and the self?
    * **Options:** A) That nature is harmless and merely decorative, B) Awe and humility — nature is a power greater than us that can teach and unsettle the mind, leaving "huge and mighty forms" in it, C) That nature is wholly indifferent to people, D) That nature exists only to be conquered
    * **Correct:** B
    * **Feedback:** ✓ Correct. The looming peak fills the boy with dread and lasting "huge and mighty forms", so we feel nature as a sublime force that humbles and shapes him.
    * **Why A:** The overwhelming, guilt-inducing peak is the opposite of harmless decoration.
    * **Why C:** Nature acts on him so powerfully that indifference cannot be the point.
    * **Why D:** The boy is humbled, not triumphant — nature masters him.

13. **Type: MCQ [Tests Recognising the Poem]**
    @set:1
    * **Question:** Which poem repeatedly challenges the listener — "How can you tell what class I'm from?" — setting a "corpy" against a "pretty little semi, out Wirral way" to reject class snobbery?
    * **Options:** A) The Class Game, B) A Poison Tree, C) Extract from The Prelude, D) Catrin
    * **Correct:** A
    * **Feedback:** ✓ Correct. Mary Casey's "The Class Game" repeats "How can you tell what class I'm from?", setting her own "corpy" against the "pretty little semi" she is measured beside, to argue that no one can be reduced to their class.
    * **Why B:** A Poison Tree concerns private, nursed anger, not class prejudice.
    * **Why C:** The Prelude extract is a memory of nature and guilt, not a challenge about class.
    * **Why D:** Catrin is about a family bond, not class judgement.

14. **Type: True-False [Tests Form & Features]**
    @set:1
    * **Question:** By spelling her speaker's voice phonetically — "an 'olly in me mouth", "toilet instead of bog" — and confronting the listener directly, "The Class Game" makes its challenge to class prejudice feel like real, spoken defiance rather than a written argument.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The eye-dialect captures a real Liverpool voice, and the direct, repeated "How can you tell what class I'm from?" turns the poem into a spoken confrontation — the form itself asserting the pride the poem argues for.
    * **WhyWrong:** This is true — the phonetic, spoken voice and direct address make the defiance immediate, enacting the self-respect the poem demands.

15. **Type: MCQ [Tests Meaning & Effects]**
    @set:1
    * **Question:** What is the central argument of "The Class Game", shown when the speaker declares "A cleaner is me mother / A docker is me brother" and closes "I'm proud of the class that I come from"?
    * **Options:** A) That class background should be celebrated above all else, B) That a person cannot be reduced to assumptions made from their class, accent or background, C) That class no longer exists in society, D) That only one class ever faces prejudice
    * **Correct:** B
    * **Feedback:** ✓ Correct. The speaker rejects being pre-judged by class, naming her mother a cleaner and brother a docker with defiance, and asserting pride rather than shame in where she comes from.
    * **Why A:** The poem resists class-based judgement altogether, not celebrating any one class.
    * **Why C:** The poem's whole premise is that class prejudice is still very much alive.
    * **Why D:** Its argument is about class prejudice in general, not confined to one group.

<!-- ============================ SET 2 ============================ -->

16. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem honours the courage and obedience of soldiers riding "into the valley of Death", even as it quietly admits "Some one had blunder'd"?
    * **Options:** A) Exposure, B) The Charge of the Light Brigade, C) The Man He Killed, D) The Destruction of Sennacherib
    * **Correct:** B
    * **Feedback:** ✓ Correct. Tennyson's "The Charge of the Light Brigade" celebrates the six hundred who rode "into the valley of Death" — "Their's but to do and die" — while acknowledging that "Some one had blunder'd": heroism and futility held together.
    * **Why A:** Exposure argues war is grinding futility, not heroic honour.
    * **Why C:** The Man He Killed is one soldier's uneasy reflection on a single killing, not a celebration of a charge.
    * **Why D:** The Destruction of Sennacherib recounts an army destroyed by a divine force, not a doomed cavalry charge.

17. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** Tennyson's insistent, galloping metre — "Half a league, half a league, / Half a league onward" — does what to the reader's experience of the poem?
    * **Options:** A) It slows the poem into a quiet, still lament, B) It drives forward like pounding hooves, sweeping the soldiers — and the reader — irresistibly into the charge, C) It makes the poem sound playful and comic, D) It has no link to the poem's meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The pounding, galloping metre gallops like the horses, carrying soldiers and reader alike forward into the charge the poem memorialises — form enacting momentum.
    * **Why A:** The metre gallops urgently; it is not a slow, still lament.
    * **Why C:** The momentum is grave and heroic, not comic.
    * **Why D:** The galloping measure directly enacts the charge — form and meaning are one.

18. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** How does Tennyson want us to feel about the soldiers of the Light Brigade?
    * **Options:** A) That they were cowards who fled, B) Admiration for their courage and obedience — "Their's but to do and die" — mixed with sorrow that a blunder sent them to their deaths, C) That they were villains who caused the war, D) That they won a glorious, uncomplicated victory
    * **Correct:** B
    * **Feedback:** ✓ Correct. We honour their bravery and duty — "Their's but to do and die" — while feeling the tragedy that such courage was spent on a fatal mistake.
    * **Why A:** The poem celebrates their bravery; they charge despite the error.
    * **Why C:** They are the victims of a blunder, not its cause.
    * **Why D:** The charge is a catastrophe to be honoured, not a victory.

19. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that war's real enemy is not the opposing army but cold, waiting and futility — soldiers worn down by the "merciless iced east winds" under the refrain "But nothing happens"?
    * **Options:** A) The Man He Killed, B) Exposure, C) Belfast Confetti, D) The Destruction of Sennacherib
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen's "Exposure" makes the "merciless iced east winds" and endless waiting the true killers, and the numb refrain "But nothing happens" argues that war is grinding futility, not glory.
    * **Why A:** The Man He Killed reflects on a single killing, not a platoon dying of cold.
    * **Why C:** Belfast Confetti is set amid a riot and explosion, not frozen trenches.
    * **Why D:** The Destruction of Sennacherib recounts an ancient army's overnight destruction, not modern trench warfare.

20. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** In "Exposure" Owen uses near-rhymes that never quite chime (pararhyme) and the flat refrain "But nothing happens". What do these unresolved, going-nowhere sounds achieve?
    * **Options:** A) They make the poem feel tidy, resolved and hopeful, B) Their refusal to resolve mirrors the soldiers' suspended, hopeless waiting, so the very sound of the poem enacts its stasis and futility, C) They speed the poem into an exciting battle narrative, D) They have no effect on the meaning
    * **Correct:** B
    * **Feedback:** ✓ Correct. The dissonant near-rhymes refuse to settle and the deadened refrain returns to nothing, so the sound of the poem itself carries the men's going-nowhere despair in the cold.
    * **Why A:** The point is precisely that nothing resolves — the sound denies resolution.
    * **Why C:** The stalled, dissonant sound slows and deadens the poem rather than exciting it.
    * **Why D:** The unresolved sound is central to the poem's sense of futile waiting.

21. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What is the central irony of "Exposure"?
    * **Options:** A) The soldiers win a great battle, B) The men expect combat, but are worn down and killed by cold, boredom and futility rather than by the enemy, C) The soldiers are never in any danger, D) The poem celebrates the glory of war
    * **Correct:** B
    * **Feedback:** ✓ Correct. Owen subverts the expectation of heroic combat: the danger is real but comes from the weather and the waiting, exposing war as attrition, not glory.
    * **Why A:** No battle is won; the poem is one of attrition, not victory.
    * **Why C:** Men die of exposure — the danger is real, just not from bullets.
    * **Why D:** Owen exposes war's misery; he does not glorify it.

22. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem has an ordinary soldier reflect, in plain, conversational speech, that he shot a man he would gladly have bought a drink "By some old ancient inn" had they met anywhere but a battlefield?
    * **Options:** A) The Man He Killed, B) The Charge of the Light Brigade, C) Half-caste, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Hardy's speaker imagines that he and his victim "should have sat us down to wet / Right many a nipperkin" had they met as friends — an argument about how arbitrary war's killing really is.
    * **Why B:** The Charge of the Light Brigade narrates a mass cavalry charge, not one soldier's private reflection.
    * **Why C:** Half-caste confronts prejudice about mixed heritage, not a soldier's guilt.
    * **Why D:** Poppies voices a grieving mother, not a soldier recalling a killing.

23. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** "The Man He Killed" is spoken in a plain, hesitant, conversational voice set in simple ballad-like quatrains. How does that form shape its effect?
    * **Options:** A) A grand, elevated style makes the killing sound noble and justified, B) The ordinary, stumbling speech lets the soldier's confusion surface naturally, sharpening the irony that he killed a man he might have befriended, C) A tightly argued sonnet settles the question with cool logic, D) The form has no bearing on how we judge the killing
    * **Correct:** B
    * **Feedback:** ✓ Correct. The soldier's hesitant, everyday speech ("Because he was my foe, / Just so") lets his unease surface without polish, making the irony of killing a possible friend feel painfully real.
    * **Why A:** The voice is deliberately plain and unsure, the opposite of a grand justification.
    * **Why C:** The poem stumbles and hesitates; it does not resolve into neat sonnet logic.
    * **Why D:** The halting, ordinary voice is exactly what makes the killing feel absurd and human.

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
    * **Question:** Which poem argues that even the mightiest human army can be swept away overnight by a far greater force — describing a host that "came down like the wolf on the fold", then destroyed by the "Angel of Death"?
    * **Options:** A) The Destruction of Sennacherib, B) The Charge of the Light Brigade, C) Exposure, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Byron's poem recounts the Assyrian army's overnight destruction by the "Angel of Death", its might melting "like snow in the glance of the Lord" — earthly power undone in a single night.
    * **Why B:** The Charge of the Light Brigade narrates a doomed but very real cavalry battle, not divine destruction.
    * **Why C:** Exposure reveals soldiers dying slowly of cold, not a single overnight catastrophe.
    * **Why D:** Belfast Confetti is set during a modern riot, not an ancient biblical destruction.

26. **Type: True-False [Tests Form & Features]**
    @set:2
    * **Question:** The galloping, anapestic rhythm of "The Destruction of Sennacherib" drives the narrative forward like charging horses, so its momentum makes the army's sudden, overwhelming destruction feel swift and unstoppable.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Byron's insistent anapestic beat carries the story at a gallop, and that headlong momentum makes the overnight annihilation land with sweeping, unstoppable force — the rhythm itself enacting the speed of the ruin.
    * **WhyWrong:** This is true — the driving anapestic metre gives the poem its galloping momentum, making the destruction feel swift and total.

27. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the destruction of the Assyrian army make the reader feel about earthly power in Byron's poem?
    * **Options:** A) That human military power, however boastful, can be undone overnight by a far greater force, B) That the Assyrians won a great victory, C) That war is always decided by superior weapons, D) That the poem celebrates human conquest
    * **Correct:** A
    * **Feedback:** ✓ Correct. The mighty host, arrayed "gleaming in purple and gold", is annihilated in a single night, leaving us struck by how quickly proud, earthly power can be swept away.
    * **Why B:** The army is utterly destroyed, not victorious.
    * **Why C:** The destruction comes from a divine force, not superior human weaponry.
    * **Why D:** The poem reveals conquest collapsing into ruin, not something to celebrate.

28. **Type: MCQ [Tests Recognising the Poem]**
    @set:2
    * **Question:** Which poem argues that violence fractures language, place and identity — turning punctuation into shrapnel, a "fusillade of question-marks", until the speaker can neither finish a sentence nor find his way home?
    * **Options:** A) Belfast Confetti, B) The Man He Killed, C) Cousin Kate, D) A Poison Tree
    * **Correct:** A
    * **Feedback:** ✓ Correct. Carson's "Belfast Confetti" imagines the riot's debris "raining" as punctuation and the streets becoming "a fusillade of question-marks", so the blast unmakes the speaker's very words and sense of place.
    * **Why B:** The Man He Killed is a soldier's quiet monologue, not a scene of urban riot.
    * **Why C:** Cousin Kate is a narrative of personal betrayal, not a riot in Belfast.
    * **Why D:** A Poison Tree concerns private, nursed anger, not a public explosion.

29. **Type: MCQ [Tests Form & Features]**
    @set:2
    * **Question:** What does the broken, fragmented free verse of "Belfast Confetti" — its lines scattered and interrupted — do for the poem?
    * **Options:** A) It creates a calm, orderly sense of control, B) Its shattered lines and disrupted punctuation fall like shrapnel across the page, enacting the chaos and disorientation of the blast and its aftermath, C) It tells a gentle, flowing love story, D) It makes the violence sound comic
    * **Correct:** B
    * **Feedback:** ✓ Correct. Broken lines and stuttering punctuation scatter across the page like debris, so the very shape of the poem enacts the confusion and violence of the explosion.
    * **Why A:** The form conveys chaos, not calm or order.
    * **Why C:** The poem depicts violence and confusion, not romance.
    * **Why D:** The effect is disorientating and threatening, not comic.

30. **Type: MCQ [Tests Meaning & Effects]**
    @set:2
    * **Question:** What does the speaker's confusion at the end of "Belfast Confetti" — unable to find his way or answer "What is / My name?" — make us feel about violence?
    * **Options:** A) That violence disorientates and fractures even someone's sense of their own home and identity, B) That the speaker is simply lost as a tourist, C) That the riot has no lasting effect on him, D) That the poem ends in celebration
    * **Correct:** A
    * **Feedback:** ✓ Correct. The riot doesn't just wreck the streets — it unmakes the speaker's sense of place and self, leaving him unable to answer even basic questions about who he is and where he belongs.
    * **Why B:** This is his own home city, not unfamiliar territory to a visitor.
    * **Why C:** His disorientation reveals the riot's deep, lasting effect on him.
    * **Why D:** The ending is unsettling and fractured, not celebratory.

<!-- ============================ SET 3 ============================ -->

31. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem confronts the listener directly over the word "half-caste", pointing to painters mixing colours and English weather mixing light and shadow to expose how absurd and reductive the label is?
    * **Options:** A) Half-caste, B) No Problem, C) What Were They Like?, D) Poppies
    * **Correct:** A
    * **Feedback:** ✓ Correct. Agard's "Half-caste" turns the insult back — "Explain yuself" — showing that mixing "red an green", or "light an shadow", makes art and weather, not something lesser, and demanding to be seen whole.
    * **Why B:** No Problem rejects being cast as a "problem" or stereotype, not the specific term "half-caste".
    * **Why C:** What Were They Like? mourns a culture destroyed by war, not a racial label.
    * **Why D:** Poppies voices a grieving mother, not a challenge over mixed heritage.

32. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the loose, phonetic, non-standard form of "Half-caste" serve its meaning?
    * **Options:** A) It suggests the speaker cannot write standard English, B) It acts as resistance — using the speaker's own voice and rhythm to refuse a label imposed on him in someone else's terms, C) It has no effect on meaning, D) It makes the poem a traditional sonnet
    * **Correct:** B
    * **Feedback:** ✓ Correct. The dialect spelling and free, conversational rhythm assert the speaker's own identity and voice, so the form itself refuses a reductive label imposed from outside.
    * **Why A:** The non-standard spelling is a deliberate, purposeful choice, not a failing.
    * **Why C:** The form is central to the poem's act of resistance and self-assertion.
    * **Why D:** The poem rejects fixed traditional forms like the sonnet in favour of a free, spoken voice.

33. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does "Half-caste" ultimately demand of the listener?
    * **Options:** A) That they apologise and then say nothing further, B) That they return with "de whole of yu eye… an de whole of yu mind" — seeing the speaker as a complete person, not a fraction, C) That they adopt the speaker's language exactly, D) That they avoid all further contact
    * **Correct:** B
    * **Feedback:** ✓ Correct. The poem ends by demanding full, honest engagement — that the listener come back and see the speaker whole, rather than reduce him to a partial, demeaning label.
    * **Why A:** The poem demands genuine reconsideration, not silence.
    * **Why C:** The demand is for full recognition of the speaker's humanity, not imitation of his speech.
    * **Why D:** The poem insists on renewed, fuller engagement, not avoidance.

34. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem opens each stanza with the refrain "I am not de problem", rejecting being "branded athletic" and put "in a pigeon hole"?
    * **Options:** A) No Problem, B) Half-caste, C) The Class Game, D) Belfast Confetti
    * **Correct:** A
    * **Feedback:** ✓ Correct. Zephaniah's "No Problem" repeats "I am not de problem" as the speaker refuses to be "branded athletic" or filed away "in a pigeon hole" — arguing against reduction to a stereotype.
    * **Why B:** Half-caste challenges the specific term "half-caste" and mixed heritage, a related but distinct target.
    * **Why C:** The Class Game challenges prejudice based on social class, not race.
    * **Why D:** Belfast Confetti describes a riot and its disorientating aftermath, not racial stereotyping.

35. **Type: True-False [Tests Form & Features]**
    @set:3
    * **Question:** By rendering the speaker's voice in patois-influenced spelling — "de problem", "dey got me", "yu give I a chance" — "No Problem" gives its rejection of stereotyping the confident, public force of spoken-word performance.
    * **Answer:** True
    * **Feedback:** ✓ Correct. Zephaniah, rooted in dub and performance poetry, spells the voice phonetically so the poem sounds spoken aloud — that public, rhythmic delivery lends real defiance to its refusal to be a stereotype.
    * **WhyWrong:** This is true — the patois spelling and spoken-word rhythm make the challenge feel confidently public, matching its confrontational stance.

36. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What is the overall stance of the speaker in "No Problem", who declares "I have no chips on me shoulders" and ends "Sum of me best friends are white"?
    * **Options:** A) Apologetic and ashamed of his background, B) Self-assured and defiant, asserting his identity and achievements against those who stereotype him, C) Indifferent to how he is perceived, D) Angry only at other members of his own community
    * **Correct:** B
    * **Feedback:** ✓ Correct. Rather than apologising for who he is, the speaker meets prejudice with pride and self-assurance — insisting he has "no chips on me shoulders" — while standing his ground against being reduced to a stereotype.
    * **Why A:** The tone is confident and unapologetic, not ashamed.
    * **Why C:** The speaker cares enough to confront the stereotyping he faces directly.
    * **Why D:** His challenge is aimed at those who stereotype him, not at his own community.

37. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem is built as questions and answers about a people all but destroyed by war — asking whether they held ceremonies to "reverence the opening of buds" and answering that their "light hearts turned to stone"?
    * **Options:** A) What Were They Like?, B) The Man He Killed, C) Catrin, D) The Class Game
    * **Correct:** A
    * **Feedback:** ✓ Correct. Levertov's poem poses questions about a devastated culture — its ceremonies, laughter and poetry — and answers with quiet devastation, mourning a people whose "light hearts turned to stone".
    * **Why B:** The Man He Killed is a single soldier's monologue, not a question-and-answer elegy for a whole culture.
    * **Why C:** Catrin concerns a personal, family relationship, not a lost civilisation.
    * **Why D:** The Class Game addresses class prejudice through direct address, not a Q&A elegy for a destroyed culture.

38. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the question-and-answer structure of "What Were They Like?" shape its effect?
    * **Options:** A) One voice asks and another answers, giving the poem the feel of an elegy or interrogation for a people who can now only be recalled in fragments, B) A strict rhyming sonnet argues a single case, C) An unbroken narrative tells the story straight through in order, D) A repeated refrain, like a villanelle, celebrates the culture
    * **Correct:** A
    * **Feedback:** ✓ Correct. The question-and-answer form gives the poem the feel of a testimony or elegy, mourning a culture that can now only be recalled in broken, uncertain fragments — if at all.
    * **Why B:** The poem is built from free-verse questions and answers, not a fixed rhyming sonnet.
    * **Why C:** Its Q&A structure interrupts any straightforward narrative telling.
    * **Why D:** There is no celebratory repeated refrain, unlike a villanelle.

39. **Type: MCQ [Tests Meaning & Effects]**
    @set:3
    * **Question:** What does the uncertainty in the answers of "What Were They Like?" — "It is not remembered" — make us feel about the cost of war?
    * **Options:** A) That war has erased not just lives but a whole culture's traditions and memory itself, B) That the culture never had any traditions worth recording, C) That the war caused no lasting damage, D) That the answers are simply forgetful rather than devastating
    * **Correct:** A
    * **Feedback:** ✓ Correct. The hesitant, incomplete answers imply that war has destroyed not just lives but memory itself — a whole way of life reduced to fragments and silence.
    * **Why B:** The questions imply rich traditions once existed; it is their loss that is mourned.
    * **Why C:** The uncertain, broken answers point to devastating, lasting damage.
    * **Why D:** The forgetting is presented as a consequence of destruction, not simple absent-mindedness.

40. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem's speaker admits he "seek[s] out the tragic, the absurd, to make a subject", uneasily set against a caption claiming "even in hell the human spirit / triumphs over all"?
    * **Options:** A) War Photographer, B) Belfast Confetti, C) The Destruction of Sennacherib, D) A Poison Tree
    * **Correct:** A
    * **Feedback:** ✓ Correct. Satyamurti's "War Photographer" has its speaker admit he "seek[s] out the tragic, the absurd, to make a subject", exposing the uneasy gap between witnessing suffering and turning it into a consumable image.
    * **Why B:** Belfast Confetti is the speaker's own first-hand experience of a riot, not a photographer's images of it.
    * **Why C:** Sennacherib recounts an ancient battle narrative, not a modern photographer's work.
    * **Why D:** A Poison Tree concerns private anger, not war photography.

41. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** What does Satyamurti achieve by structuring the poem around contrast — the "peach, sun-gilded girls" laughing at Ascot set against a small girl "staggering down some devastated street"?
    * **Options:** A) It shows the photographer's world of suffering has no connection to any other, B) It juxtaposes the suffering the photographer has witnessed with the comfortable distance of those who later meet only the images, sharpening the poem's unease, C) It makes the poem read as a straightforward celebration of photography, D) It removes any sense of the photographer's own feelings
    * **Correct:** B
    * **Feedback:** ✓ Correct. Holding the carefree "peach, sun-gilded girls" at Ascot against a small girl "staggering down some devastated street" exposes the gulf between comfortable distance and lived suffering — the structure carrying the poem's discomfort.
    * **Why A:** The contrast is the poem's whole point — connecting two very different responses to the same world of suffering.
    * **Why C:** The poem is unsettling rather than celebratory in tone.
    * **Why D:** The photographer's own discomfort and complex feelings run through the poem.

42. **Type: True-False [Tests Meaning & Effects]**
    @set:3
    * **Question:** "War Photographer" by Satyamurti closes on the image that "hell, like heaven, is untidy, its boundaries / arbitrary as a blood stain on a wall", leaving us with the uneasy gap between witnessing suffering directly and encountering it only as a distant image.
    * **Answer:** True
    * **Feedback:** ✓ Correct. The poem probes the difference between the photographer's direct, visceral experience of conflict and the detached way that suffering is later received, closing on the unsettled image of hell's boundaries as "arbitrary as a blood stain on a wall".
    * **WhyWrong:** This is true — the poem's central concern is that unsettling gap between direct witness and distanced reception of suffering.

43. **Type: MCQ [Tests Recognising the Poem]**
    @set:3
    * **Question:** Which poem argues that war's grief belongs to the home front too — voicing a mother, days "before Armistice Sunday", who later traces "the inscriptions on the war memorial" after her son has gone?
    * **Options:** A) Poppies, B) Catrin, C) Cousin Kate, D) What Were They Like?
    * **Correct:** A
    * **Feedback:** ✓ Correct. Weir's "Poppies" follows a mother pinning a poppy to her son's blazer and later tracing "the inscriptions on the war memorial" in his absence — arguing that war's grief is felt by those left at home.
    * **Why B:** Catrin is about a mother and a living daughter's push for independence, not a son gone to war.
    * **Why C:** Cousin Kate concerns betrayal by a lord, not a mother's grief for a son.
    * **Why D:** What Were They Like? mourns a whole vanished culture, not one mother's personal loss.

44. **Type: MCQ [Tests Form & Features]**
    @set:3
    * **Question:** How does the free-verse, interior-monologue form of "Poppies" by Weir suit its subject?
    * **Options:** A) A strict sonnet argues a case, B) The loose free verse and inward, drifting voice let a mother's private grief wander naturally between memory and present, like an elegy, C) A ballad refrain tells a heroic story, D) A villanelle's repetition celebrates victory
    * **Correct:** B
    * **Feedback:** ✓ Correct. The unstructured, monologue-like voice lets grief move naturally between past and present — the open form mirroring the wandering, inward ache of mourning.
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
    * **Why D:** The poem reveals an enduring, aching bond with her son, not a loss of connection.
