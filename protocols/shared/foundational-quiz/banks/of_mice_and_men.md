# Foundational Quiz Bank — Of Mice and Men

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Of Mice and Men is **tragic social realism** → the `effects` aspect tests the reader's **pathos and
moral discomfort** — sorrow for the powerless and unease at an unjust world that discards the weak — not the
naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`of_mice_and_men.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Of Mice and Men

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how George *changes* across the novella — and what drives the change?
   * **Options:** A) He is a selfish loner from the first page and never really changes, B) He begins a man set apart by companionship and a shared dream, and ends alone — having chosen to shoot the friend he loved to spare him a worse death, C) He stays exactly the same and is simply unlucky, D) He is forced by Slim and the other men to kill Lennie and has no real say
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: George's bond with Lennie once lifted him above the "loneliest guys in the world"; by the end he has made the unbearable choice to end that bond himself, and is left as solitary as the rest.
   * **Why A:** George is defined at the start by looking after Lennie — "I got you... you got me"; the drama lies in losing that, not in fixed selfishness.
   * **Why C:** He does not stay the same — he is transformed by a choice that costs him everything; the fall is self-made, not mere bad luck.
   * **Why D:** No one orders George; the decision to shoot Lennie is his own, and its being his own is exactly what makes it tragic.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes George a *tragic* figure rather than simply a killer or a helpless victim?
   * **Options:** A) He is cruel and heartless throughout, B) He is neither villain nor victim — a decent man driven by love to a terrible act that destroys the very future he lived for, so his ruin moves us, C) He is entirely blameless and the killing is nothing to do with him, D) He walks away happy, his dream intact
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic figure is an in-between one: George's love is real, which is why his mercy-killing of Lennie — and the death of their dream with it — arouses pathos, not disgust.
   * **Why A:** If he were heartless his act would repel rather than move us; the tragedy needs his genuine love for Lennie.
   * **Why C:** He pulls the trigger himself; the choice, and its cost, are his — that is what makes it tragic, not incidental.
   * **Why D:** The dream dies with Lennie and George is left desolate — a tragic figure loses everything, he does not thrive.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows George's evolution from beginning to end?
   * **Options:** A) A lonely drifter at the start → a wealthy landowner at the end, B) A man raised above the drifters by companionship and a shared dream → a solitary man who has killed his friend and buried that dream, C) A cruel bully at the start → a beloved leader at the end, D) A stranger to Lennie at the start → Lennie's blood-brother at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a man made exceptional by his bond with Lennie to a man as alone as any other ranch hand — hollowed out by the choice he made. That arc IS the tragedy.
   * **Why A:** He never gains the farm; the dream collapses, leaving him with nothing — this reverses his actual arc.
   * **Why C:** He is protective and weary, not a bully, at the start, and broken, not beloved, at the close.
   * **Why D:** George and Lennie are already bound as companions from the opening; the change is the *loss* of that bond, not its forming.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** George's transformation is driven above all by his own choice — the danger Lennie is in presses on him, but the decision to shoot his friend is George's own.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Curley's lynch mob creates the crisis, but George weighs it and chooses to act mercifully himself; his agency is what turns a grim situation into tragedy and keeps the loss *his*.
   * **WhyWrong:** No one forces George's hand — Slim only understands him afterwards. Treating him as a puppet of events removes the choice that makes him a tragic figure rather than a bystander.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Lennie's killing of Curley's wife *lead to* George shooting Lennie? (What is the causal link?)
   * **Options:** A) The two events are unconnected and simply happen in order, B) Lennie's accidental killing sets Curley's lynch mob after him — so George kills Lennie gently first, to spare him a crueller death, C) Slim orders George to shoot Lennie, D) George kills at random because he has lost his mind
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the death of Curley's wife guarantees Lennie's capture and torment, and it is that certainty which drives George's mercy-killing. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — reading them as unconnected misses the arc that binds them.
   * **Why C:** Slim comforts George but issues no order; George decides to act himself, out of love.
   * **Why D:** His act is a deliberate, agonised mercy driven by the mob's approach, not random madness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the novella's tragedy — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the men by bad luck, B) Lennie's uncontrolled strength kills soft things he only wants to pet → he accidentally kills Curley's wife → the mob forms → George shoots Lennie and the dream dies, C) The other ranch hands plot each disaster on purpose, D) Fate alone decides everything and no choice makes any difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all rooted in Lennie's tender-but-dangerous nature. That is the tragic arc: a fatal vulnerability → escalating consequence → catastrophe.
   * **Why A:** The ruin is not random misfortune — it is the logical outworking of Lennie's strength and the world's harshness.
   * **Why C:** No one plots it; the horror is that it arises from Lennie's innocence and the pressures of the ranch, not a scheme.
   * **Why D:** Choice is decisive here — George's final choice shapes the ending; a fate-only reading erases the tragedy.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes the catastrophe unavoidable — the point of no return?
   * **Options:** A) George and Lennie arriving at the ranch, B) Lennie accidentally killing Curley's wife in the barn, C) Candy joining the dream with his savings, D) Crooks letting Lennie into his room
   * **Correct:** B
   * **Feedback:** ✓ Correct. The death of Curley's wife is the irreversible act: once it happens, Lennie cannot be saved and the dream cannot survive, and every later event follows from it. That is the tragic turning point.
   * **Why A:** The arrival only sets the scene; nothing is yet irreversible when they reach the ranch.
   * **Why C:** Candy's savings briefly make the dream feel real — a rising hope, not the fatal turn.
   * **Why D:** Crooks's scene deepens the theme of loneliness but does not seal the catastrophe.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Of Mice and Men the later events follow by cause-and-effect — the shooting of Candy's dog even shapes George's later choice — they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: Candy's regret that he "ought to have shot that dog" himself teaches George that a loved one's death is better given by a friend's hand — so the earlier scene causes the later choice.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the plot a tragic arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** George and Lennie dream of "livin' off the fatta the lan'". What does this reveal about the novella's view of the American Dream?
   * **Options:** A) That the Dream is easily won by anyone who works hard, B) That the Dream offers the poor hope and dignity, yet remains tragically out of reach for the dispossessed, C) That the men have no real hopes at all, D) That the Dream matters only to Lennie
   * **Correct:** B
   * **Feedback:** ✓ Correct. The little farm gives the men something to live for, but its collapse argues that for the powerless in Depression America such hope was an illusion the age would not permit.
   * **Why A:** The novella shows the dream slipping away again and again, not easily won.
   * **Why C:** The dream matters intensely — Candy and Crooks are drawn to it too; it is the heart of their hope.
   * **Why D:** George holds the dream as fiercely as Lennie; it belongs to them both, and to the others who reach for it.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Crooks tells Lennie that "a guy needs somebody — to be near him". Which controlling idea does this voice?
   * **Options:** A) That human company is a basic need, and loneliness — bred by the itinerant, unequal world of the ranch — is a kind of slow torment, B) That the ranch hands enjoy being alone, C) That only Crooks is ever lonely, D) That friendship is a weakness to be avoided
   * **Correct:** A
   * **Feedback:** ✓ Correct. Crooks's cry announces the novella's argument that isolation, sharpened by race, age and gender, wounds almost everyone — the very place is named Soledad, "solitude".
   * **Why B:** The men are shown aching for company, not enjoying solitude — Crooks's words are a plea, not contentment.
   * **Why C:** Loneliness reaches across the ranch — Candy, Curley's wife and the drifters all feel it, not Crooks alone.
   * **Why D:** The novella prizes companionship as a lifeline; George and Lennie's bond is its clearest good, not a weakness.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** George says he and Lennie are different because "I got you to look after me, and you got me to look after you." Which idea does the novella most explore through their bond?
   * **Options:** A) That money is what gives a life meaning, B) That companionship gives the drifter purpose and dignity, standing against a world of solitary, rootless men, C) That the two are simply related and stuck together, D) That friendship makes no difference to a hard life
   * **Correct:** B
   * **Feedback:** ✓ Correct. Their chosen loyalty sets them apart from men who are "the loneliest guys in the world", making companionship the novella's fragile answer to isolation.
   * **Why A:** They are as poor as the rest; it is their bond, not money, that gives their lives meaning.
   * **Why C:** They are not related — the loyalty is chosen, which is exactly what makes it meaningful.
   * **Why D:** Their friendship transforms both lives with purpose; the tragedy is measured by what its loss costs.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novella explores how the powerless — Crooks through race, Candy through age and disability, Curley's wife through gender — are pushed to the margins of the ranch world.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Crooks's segregation, Candy's fear of being cast out, and Curley's wife's namelessness dramatise how 1930s society denied the vulnerable a place and a voice.
   * **WhyWrong:** This is true — marginalisation by race, age, disability and gender is one of the novella's central ideas, exposing how the weak are shut out.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Of Mice and Men is tragic social realism. Why do we feel deep *sorrow* at the ending, even though Lennie has killed Curley's wife?
   * **Options:** A) Because we are amused by the twist, B) Because a gentle, innocent man and the fragile dream that lifted two lonely lives are destroyed by a world too harsh to hold them — the loss feels like a waste we grieve, C) Because George escapes with the dream intact and we are glad, D) Because the effect is really the foreshadowing of Candy's dog
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social-realist tragedy makes us mourn the powerless: Lennie means no harm and the dream is decent, so watching both crushed moves us to pathos — sorrow at needless loss, not satisfaction.
   * **Why A:** Amusement belongs to comedy; the ending is written to grieve us, not entertain.
   * **Why C:** George is left desolate and the dream dies — the feeling is sorrow and unease, not relief for him.
   * **Why D:** Foreshadowing is a *technique*; the question asks what we FEEL — the answer is grief, not the name of a device.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A work of tragic social realism such as Of Mice and Men is built to make the reader feel — above all — which response?
   * **Options:** A) Amusement and triumph, B) Pathos and moral discomfort — sorrow for the powerless and unease at an unjust world that discards the weak, C) Confusion and boredom, D) Admiration for how clever the plot is
   * **Correct:** B
   * **Feedback:** ✓ Correct. Steinbeck's realism holds a mirror to a harsh society: it stirs pity for its crushed dreamers and a disquieted anger at the injustice that dooms them — that moral, aching response is its purpose.
   * **Why A:** Amusement and triumph belong to comedy; a social tragedy that merely satisfied us would fail its purpose.
   * **Why C:** Confusion and boredom mark a *failed* work, not the intended effect of this one.
   * **Why D:** We may notice the tight structure, but the intended response is sorrow and moral unease, not admiration for craft.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *moral discomfort* — a troubled unease — as the novella shows the treatment of Crooks, Candy and Curley's wife?
   * **Options:** A) Because we find their situations funny, B) Because their exclusion feels unjust, and we are made uneasily aware that a whole society shuts out the weak — including, perhaps, ourselves, C) Because we are frightened by supernatural events, D) Because we admire the ranch for how it is run
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social realism disturbs the reader's conscience: by making their loneliness and powerlessness so plain, Steinbeck turns our sympathy into a moral discomfort at the injustice we are watching.
   * **Why A:** Their suffering is written to trouble us, not to amuse — laughter would betray the novella's purpose.
   * **Why C:** There is nothing supernatural; the unease is moral and human, rooted in real social injustice.
   * **Why D:** The ranch is shown as unjust and isolating; the intended feeling is discomfort at it, not admiration.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novella we are meant to feel sorrow for the crushed dream and a troubled unease at a world that discards the weak — not amusement or triumph.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pathos for the powerless and moral discomfort at their injustice — is the emotional effect tragic social realism is built to produce.
   * **WhyWrong:** The intended effect is pathos *and* moral unease, not amusement or triumph; the ending is written to leave us grieving and disquieted, not satisfied.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novella's overall *message* about the American Dream for the poor and powerless?
   * **Options:** A) That the Dream is guaranteed to anyone who works hard, B) That the Dream gives the dispossessed hope and dignity, yet in an unjust world it remains, for them, tragically unreachable, C) That dreaming is foolish and should be given up, D) That only money matters and companionship is worthless
   * **Correct:** B
   * **Feedback:** ✓ Correct. George and Lennie's farm makes life bearable, yet its collapse argues that the Depression's dispossessed were promised a dream the society would never let them reach — the novella's enduring "so what".
   * **Why A:** The novella dramatises the opposite — the Dream slips away however hard the men strive.
   * **Why C:** Steinbeck honours the dream even as it fails; it is what gives the men dignity, not foolishness to abandon.
   * **Why D:** The bond between George and Lennie is the novella's clearest good — companionship is shown as precious, not worthless.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human need does the novella affirm through its portrait of loneliness?
   * **Options:** A) That people are better off entirely alone, B) That human beings need companionship to survive with dignity, and a society that isolates the weak inflicts a real and cruel wound, C) That only the strong deserve company, D) That loneliness is easily cured by hard work
   * **Correct:** B
   * **Feedback:** ✓ Correct. From Crooks's "a guy needs somebody" to Candy's grief and Curley's wife's isolation, the novella insists that company is a basic human need — and that denying it to the vulnerable is an injustice.
   * **Why A:** The novella shows solitude as a torment, not a benefit — its whole vision argues against isolation.
   * **Why C:** Steinbeck's sympathy extends to the weakest — Crooks, Candy, Curley's wife — not only the strong.
   * **Why D:** Work does not cure the loneliness; only companionship does, and the society denies the vulnerable even that.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novella's lasting messages is that an unjust society casts aside the weak and vulnerable — the old, the disabled, the marginalised — once they can no longer be useful.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Candy's terror of being "canned" when he is too old to work, and Crooks's segregation, affirm the message that a harsh society discards those it deems worthless.
   * **WhyWrong:** The novella insists that the vulnerable are cast aside once useless — Candy's fear and Crooks's exclusion make that injustice a central part of its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Taking title and ending together, what enduring worldview does the novella ultimately affirm?
   * **Options:** A) That hard work always secures a happy future, B) That even the best-laid dreams of the powerless "gang aft agley" in an unjust world — yet the hope and loyalty they hold are what give a hard life its dignity, C) That the poor deserve their misfortune, D) That friendship and dreams are pointless
   * **Correct:** B
   * **Feedback:** ✓ Correct. Burns's "the best-laid schemes o' mice an' men / Gang aft agley" frames the message: for the dispossessed the dream collapses, yet Steinbeck honours the love and hope that made it precious — a compassionate vision of dignity amid defeat.
   * **Why A:** The novella shows effort defeated by an unjust world, not rewarded with a happy future.
   * **Why C:** Steinbeck's sympathy lies wholly with the poor; the message indicts the society, never blames its victims.
   * **Why D:** Friendship and the dream are shown as what redeems a hard life — precious, not pointless, even as they fail.
