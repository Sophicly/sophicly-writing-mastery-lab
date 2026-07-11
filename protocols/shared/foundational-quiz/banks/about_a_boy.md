# Foundational Quiz Bank — About a Boy

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. About a Boy is a **comic coming-of-age novel** (Bildungsroman in a comic mode) → the `effects`
aspect tests the reader's **warmth, delight and poignant hope**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`about_a_boy.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: About a Boy

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Will *changes* across the novel — and what drives the change?
   * **Options:** A) He is a warm, caring man from the first page and never really changes, B) He begins a wealthy, idle bachelor who lives as an "island", cynically avoiding all commitment, and becomes a more caring, connected man who takes responsibility for others — driven by his own gradual choice to let people in, C) He stays a selfish drifter throughout and is simply unlucky in love, D) He is forced to change by Marcus and has no real say in it
   * **Correct:** B
   * **Feedback:** ✓ Correct. The heart of the novel is Will's growing-up: the man-child who prized his freedom learns to take responsibility — and the engine is his own slow choice to stop living as an island, not chance or coercion.
   * **Why A:** He starts cynical and commitment-shy, living for trivial pleasures; the whole point is his transformation, not fixed warmth.
   * **Why C:** He does change — decisively — from selfish drifter to a connected man; reading him as static misses the arc.
   * **Why D:** Marcus draws him in, but Will chooses to take responsibility; removing his agency turns a coming-of-age into something that merely happens to him.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** The title "about a boy" points slyly at Will as much as Marcus. What makes Will's story a *coming-of-age*?
   * **Options:** A) He literally ages from a child into an adult during the novel, B) Though a grown man, he is emotionally a "boy" — self-centred and commitment-shy — and must finally mature by learning to care for others, C) He never grows up and stays exactly the same, D) He is already the most mature character and simply teaches everyone else
   * **Correct:** B
   * **Feedback:** ✓ Correct. Will is a man-child: an adult in years but a boy in responsibility. His growing-up — learning to put someone else first — is the coming-of-age the ironic title names.
   * **Why A:** Will is an adult throughout; his "growing up" is emotional and moral, not literal ageing.
   * **Why C:** He does mature — that change is the novel's spine; reading him as static misses it.
   * **Why D:** He begins the least mature of the adults, cynical and idle; his growth is the journey, not a starting virtue.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Will's evolution from beginning to end?
   * **Options:** A) A devoted family man at the start → a lonely recluse at the end, B) A wealthy, idle bachelor living off royalties, an "island" avoiding commitment → a man drawn into a wider web of friendship and responsibility, no longer living alone, C) A struggling single father at the start → a carefree bachelor at the end, D) A schoolteacher at the start → a musician at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Will travels from self-sufficient isolation to connection — the same man, opened up by caring for Marcus. That arc IS the novel.
   * **Why A:** This reverses his actual arc — he begins isolated and ends connected, not the other way round.
   * **Why C:** He is a childless bachelor who only pretends to be a single father, and he ends more committed, not more carefree.
   * **Why D:** He neither teaches nor becomes a musician — he lives off inherited royalties; this mistakes who he is.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Will's growth is driven above all by his own choice to take responsibility for Marcus and others — the boy pulls him in, but the decision to care is his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Marcus latches onto Will, but it is Will who chooses, gradually, to stop drifting and take responsibility; that agency is what makes his change a real coming-of-age rather than an accident.
   * **WhyWrong:** Marcus never forces Will to change — he only opens the door. Treating Will as passively remade removes the choice that makes his maturing his own.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Will's scheme of inventing a fake son *lead to* his becoming a caring, connected man? (What is the causal link?)
   * **Options:** A) The two things are unconnected — his change just happens later by chance, B) He invents a son to join a single-parents' group and meet women without commitment — but the deceit draws him into contact with the real, lonely boy Marcus, whose need pulls him into genuine responsibility, C) The single-parents' group orders him to look after Marcus, D) He changes at random once he grows bored of bachelor life
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the very scheme designed to keep Will free and uncommitted is what entangles him with a real child — and that entanglement, not chance, remakes him. That irony is the causal engine of the plot.
   * **Why A:** In a shaped plot the change follows by cause, not mere sequence; reading them as unconnected misses how his deceit engineers his growth.
   * **Why C:** No one orders Will to care; the group is a con he joins for himself — he is drawn to Marcus and chooses involvement.
   * **Why D:** His change is caused by his growing bond with Marcus, not random boredom.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Will's transformation — not just the order of events?
   * **Options:** A) A series of unrelated events that happen to him by luck, B) Will invents a son to meet women → the deceit connects him to the lonely Marcus → Marcus, anxious about his depressed mother, latches onto Will for stability → Will is pulled into responsibility → caring for others draws the "island" into connection, C) Marcus magically fixes Will with no cause, D) Nothing Will does matters; he is simply lucky in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before, all originating in Will's cynical scheme. That causal spine — deceit → contact → attachment → responsibility → connection — is the arc, not a list of events.
   * **Why A:** His growth is not luck — it is the logical outworking of a bond his own scheme created.
   * **Why C:** Marcus does not fix Will by magic; the change is caused by real, gradual involvement Will chooses.
   * **Why D:** If his choices made no difference there would be no growth; the whole arc turns on them.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which development most decisively binds Will to Marcus, pulling him from detached bachelor into real involvement?
   * **Options:** A) Will buying a new pair of trainers, B) The crisis of Fiona's depression, which deepens Marcus's fear of losing his mother and his need for a steadying adult — drawing Will in as a source of stability, C) Will winning a large sum of money, D) Ellie's love of a favourite band
   * **Correct:** B
   * **Feedback:** ✓ Correct. Fiona's depression and the crisis it brings intensify Marcus's anxiety and his need for support, and it is this that pulls the reluctant Will into genuine responsibility — the point his detachment starts to break.
   * **Why A:** A trivial purchase changes nothing; the turning point is the human crisis that binds Will to Marcus.
   * **Why C:** Will already has money and lives off royalties — wealth is his starting condition, not his turning point.
   * **Why D:** Ellie matters to Marcus's confidence later, but she is not what first pulls Will into responsibility.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In About a Boy the later events follow by cause-and-effect from Will's first scheme — his deceit to avoid commitment is exactly what entangles him in it — they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on ironic causation: the con designed to keep Will free connects him to Marcus, whose need remakes him. Each event is *because of* the last, rooted in that first deceit.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the ironic causal chain — Will's own scheme causing the very commitment he fled.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel's title and epigraph play on Donne's idea that "no man is an island". Which controlling idea does this announce?
   * **Options:** A) That people are better off entirely alone, B) That human beings need connection — no one can truly live cut off from others — and Will must learn this, C) That islands are dangerous places, D) That men should never marry
   * **Correct:** B
   * **Feedback:** ✓ Correct. The "no man is an island" idea is the novel's whole argument: people need one another, and Will's growth is the slow unlearning of his belief that he can live self-sufficiently alone.
   * **Why A:** The novel argues the opposite — isolation is shown to be empty and not enough.
   * **Why C:** The island is a metaphor for human isolation, not a literal dangerous place.
   * **Why D:** It concerns human connection in general, not a rule about marriage.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which controlling idea does the novel most explore, and how does it *work* through the story?
   * **Options:** A) That money guarantees happiness — shown by Will's contentment, B) Loneliness and its cure through unlikely friendship — Will, Marcus and Fiona, each isolated, are drawn out of their solitude by bonds no one would have predicted, C) That growing up is impossible, D) That family must always mean two parents
   * **Correct:** B
   * **Feedback:** ✓ Correct. Loneliness runs through every main character, and the novel works by having improbable friendships — a cynical bachelor and an awkward boy — rescue people the traditional world had left isolated.
   * **Why A:** Will has money and is still empty at the start; the novel denies that wealth brings happiness.
   * **Why C:** Both Will and Marcus do grow up; the theme is that growth is possible, if costly.
   * **Why D:** The novel celebrates chosen, unconventional "families", not only the two-parent model.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Single parents, lonely adults and improvised bonds fill the novel in place of the traditional family. What idea about family does this explore?
   * **Options:** A) That only traditional two-parent families can work, B) That "family" in modern Britain has widened to include single-parent homes and chosen bonds — connection matters more than the conventional shape, C) That families are unnecessary, D) That family life has no place in the novel
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel replaces the traditional family with improvised, chosen bonds, exploring how family had diversified by the 1990s — belonging matters more than the conventional form.
   * **Why A:** It centres on non-traditional households, not conventional ones.
   * **Why C:** It values connection and belonging deeply — the opposite of dismissing family.
   * **Why D:** Family, in its modern forms, is one of the novel's central concerns.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In About a Boy, growing up is shown as learning to take responsibility for others rather than merely ageing — a lesson the adult Will must learn as much as the child Marcus.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The novel's idea of maturity is moral, not chronological: to grow up is to stop living for yourself and take responsibility for others — which is why the grown man Will has as much growing to do as the boy.
   * **WhyWrong:** Growing up here means learning responsibility and connection, not simply getting older — and it is Will, the adult, who has the furthest to travel.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** About a Boy is a comic coming-of-age novel. Why do we feel *warmth and hope* by the end, despite the loneliness and depression it portrays?
   * **Options:** A) Because the comedy mocks its characters and lets us laugh at their misery, B) Because isolated, unhappy people are drawn out of their solitude into connection — their growth moves us and leaves us hopeful that lonely lives can be mended, C) Because we feel dread and pity at an inevitable ruin, D) Because the effect is the novel's use of alternating narration
   * **Correct:** B
   * **Feedback:** ✓ Correct. A comic coming-of-age is built to leave us warmed and hopeful: watching lonely people connect and grow reassures us that isolation can be survived and mended. The feeling is empathy and hope, not mockery or dread.
   * **Why A:** The humour is warm, not cruel — we laugh *with* the characters in relief, not at their misery.
   * **Why C:** Dread and pity belong to tragedy; this novel restores connection and leaves us hopeful, not grieving.
   * **Why D:** Alternating narration is a technique, not a feeling — the effect asked for is the warmth and hope the reader feels.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A comic novel like About a Boy is designed to leave the reader feeling — above all — what?
   * **Options:** A) Dread and horror, B) Warmth, delight and relief — the pleasure of watching folly and isolation give way to connection, C) Confusion and boredom, D) Grief and despair
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy is the genre of social renewal: its intended effect is warmth, delight and relief as division and folly resolve into connection. Here that pleasure carries real feeling as lonely people are drawn together.
   * **Why A:** Dread and horror belong to the Gothic; this is a warm, comic novel.
   * **Why C:** Confusion and boredom are the marks of a *failed* comedy, not its aim.
   * **Why D:** Though it treats depression seriously, the novel restores hope and connection — it does not leave us in despair.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel a tender, poignant hope watching Marcus and Will — not just amusement?
   * **Options:** A) Because they are strangers we never come to know, B) Because they are recognisably lonely and flawed "like us", so their halting growth toward connection touches us and makes us hope for them, C) Because we are frightened of what they might do, D) Because the effect is Hornby's comic tone
   * **Correct:** B
   * **Feedback:** ✓ Correct. The poignancy comes from recognition: Marcus's awkwardness and Will's emptiness are ordinary and human, so their slow growth into connection moves us and makes us hope — comedy edged with real feeling.
   * **Why A:** We come to know them intimately through the shifting viewpoints; the feeling depends on that closeness.
   * **Why C:** The novel evokes warmth and hope, not fear; there is no threat to dread.
   * **Why D:** The "comic tone" is a technique; the effect asked for is the poignant hope the reader feels.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel warmth and hopeful relief — pleasure that lonely, drifting people have been drawn into connection and grown.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That warm, hopeful relief — delight in connection restored and empathy for the growth it cost — is exactly the effect a comic coming-of-age is built to produce.
   * **WhyWrong:** The intended effect is warmth and hopeful relief, not dread, mockery or despair; the novel leaves us moved and reassured that isolation can be mended.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about how people should live?
   * **Options:** A) That self-sufficiency and avoiding commitment are the route to happiness, B) That no one thrives as an island — people need one another, and true growing-up means taking responsibility for others and letting yourself be connected, C) That money and comfort are all anyone needs, D) That people can never really change
   * **Correct:** B
   * **Feedback:** ✓ Correct. Will's journey from isolated bachelor to connected man affirms the novel's enduring "so what": no one flourishes alone; to grow up is to take responsibility and let others in.
   * **Why A:** The novel dramatises the opposite — Will's self-sufficient isolation is empty until he connects.
   * **Why C:** Will has money and comfort and is still lonely; the message is that connection, not comfort, sustains us.
   * **Why D:** The whole novel turns on real change — Will and Marcus both grow; "people can't change" is the reading it refutes.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel suggest about whether a selfish, closed-off person can be remade?
   * **Options:** A) That people are fixed and cannot change, B) That even a cynical, self-centred drifter can be remade through caring for someone else — human error is survivable and people can grow, C) That only children can change, never adults, D) That change always ends in disaster
   * **Correct:** B
   * **Feedback:** ✓ Correct. As a comedy of renewal, the novel insists that folly and isolation are not permanent: Will, the least likely to change, is remade by taking responsibility for Marcus — people can be forgiven and grow.
   * **Why A:** The novel's whole arc refutes this — Will decisively changes.
   * **Why C:** Will, an adult, changes as much as Marcus does; growth is not the child's alone.
   * **Why D:** The change here brings connection and hope, not disaster.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that human connection, not self-sufficiency, is what allows people to flourish — and that taking responsibility for others is the mark of really growing up.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The novel affirms that no one thrives as an island: Will, Marcus and Fiona are pulled from isolation by unlikely bonds, and Will's maturing is measured by the responsibility he learns to take.
   * **WhyWrong:** The novel insists connection and responsibility — not isolation or self-interest — are what let people flourish and mark true maturity.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Through its improvised, unconventional bonds, what enduring idea does the novel affirm about belonging?
   * **Options:** A) That belonging is only possible within a traditional two-parent family, B) That belonging can be built from chosen, unlikely bonds — a "family" made rather than given can rescue lonely people, C) That people are better off keeping to themselves, D) That friendship never lasts
   * **Correct:** B
   * **Feedback:** ✓ Correct. The web of chosen relationships Will, Marcus, Fiona and Ellie build affirms that belonging need not follow the traditional shape — connection freely made can pull people out of isolation.
   * **Why A:** The novel celebrates chosen, unconventional bonds, not only the traditional family.
   * **Why C:** It shows isolation as empty; keeping to oneself is the condition the characters must escape.
   * **Why D:** The lasting bonds formed by the end affirm that connection endures — the opposite of this reading.
