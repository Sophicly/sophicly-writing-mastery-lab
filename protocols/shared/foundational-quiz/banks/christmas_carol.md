# Foundational Quiz Bank — A Christmas Carol

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. A Christmas Carol is a **rebirth / redemption** tale → the `effects` aspect tests the reader's
**hope and relief that no one is beyond change** (with compassion for the poor), NOT the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`christmas_carol.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: A Christmas Carol

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Scrooge *changes* across the novella — and what drives the change?
   * **Options:** A) He is a cheerful, kind man all along and only pretends to be cold, B) He begins a cold, "solitary" miser and becomes a generous, warm-hearted benefactor — driven by his own choice to change once the spirits force him to face himself, C) He stays a bitter miser and never really changes, D) The ghosts magically rewrite him, so his transformation is nothing to do with him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The whole story is the *change*: the "squeezing, wrenching, grasping" miser is remade into a man who keeps Christmas with a full heart — and the hinge is his own decision to change after the spirits force self-recognition.
   * **Why A:** He is genuinely cold and unfeeling at the start ("Bah! Humbug!"); the drama lies in his transformation, not in a hidden goodness.
   * **Why C:** He is utterly remade — "I am not the man I was" — so reading him as unchanged misses the point of the redemption arc.
   * **Why D:** The spirits show him the truth, but the choice to reform is his; treating him as magically rewritten removes the human agency that makes his rebirth meaningful.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Scrooge a *redemption* figure rather than simply a villain who gets frightened into good behaviour?
   * **Options:** A) He is wholly evil and only fear changes him for a day, B) A hardened, harmful man genuinely confronts the wound that made him cold and chooses humanity over isolation — proving no one is beyond change, C) He was never really selfish, so there is nothing to redeem, D) He changes only to escape the ghosts and reverts to greed afterwards
   * **Correct:** B
   * **Feedback:** ✓ Correct. Redemption is a real inward turn: Scrooge faces the cause of his coldness and *chooses* to rejoin the community he had wronged. That genuine, chosen change is what makes him a redeemed man, not a scared one.
   * **Why A:** Fear opens his eyes, but the change is lasting and freely chosen — he is remade, not merely startled.
   * **Why C:** He is a genuine miser at the start; without a real flaw there could be no redemption.
   * **Why D:** His change endures — he raises Bob's wages and cares for Tiny Tim; treating it as temporary misreads the redemption as a trick.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Scrooge's evolution from beginning to end?
   * **Options:** A) A generous friend at the start → a lonely miser at the end, B) A "solitary" miser, "hard and sharp as flint" → a warm-hearted man who declares "I am not the man I was" and keeps Christmas all year, C) A poor man at the start → a rich man at the end, D) A ghost at the start → a living man at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from cold, self-imprisoned isolation to open-hearted generosity — the same man, thawed by what the spirits show him. That arc IS the redemption.
   * **Why A:** This reverses his actual arc — he starts the miser and ends the generous man.
   * **Why C:** His change is moral, not financial; he is wealthy throughout — what changes is his heart, not his purse.
   * **Why D:** Scrooge is a living man visited by ghosts, not a ghost himself; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Scrooge's transformation is finally his own choice — the spirits show him the truth, but the decision to change is his.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The visions force self-recognition, but Scrooge weighs them and *chooses* to become "as good a friend, as good a master" — his agency is what turns a haunting into a redemption.
   * **WhyWrong:** The spirits never magically remake him — they only reveal. Treating him as passively transformed removes the choice that makes his rebirth a genuine redemption rather than a spell.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the Ghost of Christmas Yet to Come *lead to* Scrooge's transformation? (What is the causal link?)
   * **Options:** A) The two are unconnected — the ghost simply appears last in order, B) The ghost shows Scrooge his own lonely, unmourned death and Tiny Tim's grave, so terror and grief make change feel urgent and necessary, C) The ghost orders Scrooge to change or be punished, D) Scrooge changes at random, for no reason the story gives
   * **Correct:** B
   * **Feedback:** ✓ Correct. One vision *causes* the turn: confronted with the emptiness of his own end and the loss of Tiny Tim, Scrooge is forced to see what his coldness costs — and that recognition drives the choice to change.
   * **Why A:** In a redemption arc each vision builds on the last by cause, not mere order; reading them as unconnected misses the arc.
   * **Why C:** The ghost is silent and points; it issues no orders — the change comes from what Scrooge *sees*, not a command.
   * **Why D:** His change is the direct effect of the visions, not a random shift; the whole plot exists to make the reform inevitable.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Scrooge's redemption — not just the order of events?
   * **Options:** A) A string of unrelated hauntings that happen to occur on the same night, B) Marley's warning frightens him → the Past reopens the wound that hardened him → the Present shows him the poor and Tiny Tim → the Future shows his own bleak death → so he chooses to change, C) The ghosts force his transformation directly, so nothing is his own doing, D) Nothing causes anything; the events are just a sequence with no link
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before: the warning opens him, the visions build understanding, and the final terror makes reform urgent. That causal spine is what makes it a redemption arc, not a list of hauntings.
   * **Why A:** The visits are tightly linked — each prepares the next — not a random string of scares.
   * **Why C:** The spirits reveal but do not compel; making them the sole cause erases Scrooge's own choice, the heart of the redemption.
   * **Why D:** If nothing linked the events there would be no arc; the whole plot turns on cause building toward his change.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that makes Scrooge's change feel irresistible — the point he can no longer look away?
   * **Options:** A) Marley's first warning about the chains, B) The Ghost of Christmas Yet to Come revealing Scrooge's own neglected grave, C) Scrooge eating gruel alone in Stave One, D) Fred inviting Scrooge to Christmas dinner
   * **Correct:** B
   * **Feedback:** ✓ Correct. Seeing his own unmourned death is the recognition that cannot be escaped: it forces Scrooge to grasp what his selfishness leads to, and from that moment the change becomes inevitable.
   * **Why A:** Marley's warning opens the door, but nothing is yet decided — Scrooge could still refuse.
   * **Why C:** The lonely gruel *shows* his coldness; it is the starting state, not the moment that turns him.
   * **Why D:** Fred's invitation is rejected early on; it sets up Scrooge's isolation rather than breaking it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In A Christmas Carol the spirits' visions follow one another by cause and effect, building toward Scrooge's change — they are not just a random string of unconnected hauntings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity: the warning opens him, the past explains him, the present indicts him, the future terrifies him — each *because of* the last, all driving the redemption.
   * **WhyWrong:** Reading the visions as unconnected ("the ghosts just turn up in order") misses the causal build — the very thing that turns a ghost story into a redemption arc.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Marley's ghost says, "I wear the chain I forged in life." What does this reveal about the novella's view of a selfish life?
   * **Options:** A) That wealth always brings freedom and ease, B) That a life spent on greed and self-interest binds and burdens the soul — our choices forge their own moral consequences, C) That ghosts are simply meant to frighten us, D) That only Marley, not Scrooge, is in any danger
   * **Correct:** B
   * **Feedback:** ✓ Correct. The chain of "cash-boxes, keys, padlocks" makes visible the novella's argument: a life of greed weighs the self down, and we build our own punishment link by link.
   * **Why A:** The chain shows the opposite — money-hoarding imprisons rather than frees.
   * **Why C:** The ghost is a vehicle for a moral idea, not fear for its own sake.
   * **Why D:** Marley's fate is a *warning* to Scrooge — the danger is his too unless he changes.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Scrooge coldly speaks of the poor dying to "decrease the surplus population". Which controlling idea does the novella explore through moments like this?
   * **Options:** A) That the poor deserve no help and society owes them nothing, B) Social responsibility — that we have a moral duty of compassion to the poor, and indifference to their suffering is a sin, C) That poverty is a topic best ignored, D) That charity should be left entirely to the government
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dickens sets Scrooge's cold arithmetic against the plight of the Cratchits and the children Ignorance and Want to argue that "mankind" is our business — society owes the poor compassion and care.
   * **Why A:** The novella attacks exactly this view; it is the misreading Scrooge must be cured of.
   * **Why C:** Far from ignoring poverty, the story forces the comfortable reader to look at it.
   * **Why D:** Dickens presents charity as a personal moral duty for everyone, especially the wealthy — not something to delegate away.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Scrooge's whole journey dramatises which controlling idea, and how does it *work* through the text?
   * **Options:** A) That people are fixed and can never truly change, B) Redemption — that no one is beyond change, shown by a hardened man who confronts himself and is remade, C) That money is the surest route to happiness, D) That the past can never be faced or forgiven
   * **Correct:** B
   * **Feedback:** ✓ Correct. The theme of redemption works through the very structure of the visions: by making Scrooge face past, present and future, the novella proves its faith that even the coldest heart can be reborn.
   * **Why A:** The story exists to disprove this — Scrooge's total change is the whole point.
   * **Why C:** Scrooge is rich yet miserable; the novella argues happiness comes from generosity, not hoarding.
   * **Why D:** Facing his past is exactly what frees Scrooge; the theme is that change and forgiveness are possible.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In A Christmas Carol, charity and generosity are presented as a moral duty that brings joy and redeems the giver, not as a waste of money.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Scrooge's giving at the end brings him a happiness his hoarding never did — the novella's idea that generosity is its own reward and a duty we owe one another.
   * **WhyWrong:** The novella presents charity as enriching and redemptive, not wasteful — Scrooge's joy on Christmas morning proves that generosity remakes the giver.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A Christmas Carol is a redemption tale. Why do we feel *hope and relief* by the end, despite how cold and cruel Scrooge was?
   * **Options:** A) Because we are relieved the frightening ghosts have finally gone, B) Because a hardened, harmful man has genuinely been remade — his rebirth reassures us that no one is beyond change, C) Because Scrooge cleverly outwits the spirits, D) Because the poor are shown to deserve their suffering
   * **Correct:** B
   * **Feedback:** ✓ Correct. A redemption tale is built to make us *hope*: watching even Scrooge become generous tells us that change is possible for anyone, and that leaves us relieved and warmed, not merely entertained.
   * **Why A:** The relief is moral, not a relief that the ghosts left — it comes from Scrooge's genuine change.
   * **Why C:** There is no outwitting; the feeling comes from his surrender to self-knowledge and change, not cleverness.
   * **Why D:** The novella's pathos for the poor is meant to trouble us, not to justify their suffering.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A rebirth-and-redemption story such as A Christmas Carol is designed to leave the reader feeling, above all, which emotion?
   * **Options:** A) Dread and horror at the supernatural, B) Hope and relief that no one is beyond change, C) Amusement at a silly ghost story, D) Triumph that a villain is finally punished
   * **Correct:** B
   * **Feedback:** ✓ Correct. Though ghosts appear, the emotional purpose is not fright but *hope* — the whole arc is engineered so we close the book believing people can be remade and reassured that change is within reach.
   * **Why A:** Dread belongs to gothic tales; here the supernatural serves warmth and hope, not horror.
   * **Why C:** Amusement misreads the moral weight — the ghosts drive a serious redemption, not a joke.
   * **Why D:** Scrooge is redeemed, not punished; triumph over a villain is the wrong feeling for a rebirth story.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the novella make us feel *compassion and moral discomfort* over Tiny Tim and the poor?
   * **Options:** A) Because Dickens wants us to laugh at their misfortune, B) Because their suffering is made vivid so that our own indifference feels shameful — pity for them presses us, like Scrooge, to care and act, C) Because we are meant to feel afraid of poor people, D) Because the poor exist only to describe the setting
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tenderness toward Tiny Tim and the horror of Ignorance and Want are built to prick the comfortable reader's conscience: pity turns into moral discomfort, and that feeling is the reforming pressure the whole story applies.
   * **Why A:** Their plight is drawn to move us, never to amuse.
   * **Why C:** We are moved to *care for* the poor, not to fear them — that fearful coldness is Scrooge's error, not ours to share.
   * **Why D:** The poor are the moral centre of the novella, not mere scenery.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novella we are meant to feel hope and warmth — hope that anyone can change, and warmth at Scrooge's rebirth — not merely entertained by a ghost story.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That glow of hope and relief — "no one is beyond change" — is the emotional effect a redemption tale is built to produce, as the coldest heart is thawed into generosity.
   * **WhyWrong:** The intended effect is hope and warmth, not dread or mere amusement; the ghosts serve a redemption meant to leave us reassured, not frightened.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novella's overall *message* about wealth and how we treat one another?
   * **Options:** A) That hoarding wealth is the wisest way to live, B) That a life of greed without compassion imprisons the self, while generosity and care for others redeem us and bring true joy, C) That the poor should be left to fend for themselves, D) That guilt and selfishness carry no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Marley's chains and Scrooge's rebirth make the point together: selfishness forges its own punishment, and "mankind" — the welfare of others — is the business that redeems a life. That is the novella's enduring "so what".
   * **Why A:** The novella dramatises the opposite — hoarding without humanity leaves Scrooge and Marley wretched.
   * **Why C:** Its whole plea is that the comfortable owe the poor compassion, not neglect.
   * **Why D:** Guilt and greed carry heavy consequences here — Marley's chains prove wrongdoing binds the self.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human nature does Scrooge's rebirth affirm?
   * **Options:** A) That people are fixed by their nature and cannot truly change, B) That no one is beyond redemption — it is never too late to confront ourselves and become better, C) That only the young are capable of change, D) That change, once made, never lasts
   * **Correct:** B
   * **Feedback:** ✓ Correct. By remaking even the coldest miser, Dickens affirms a hopeful faith in human nature: change is always possible, and no heart is past saving.
   * **Why A:** The whole story disproves this — Scrooge's transformation is total.
   * **Why C:** Scrooge is old when he changes; the message is that redemption has no age limit.
   * **Why D:** His change endures into a generous new life — the novella insists genuine change lasts.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novella's lasting messages is that a selfish life brings its own punishment — Marley "forged" his chains himself — while compassion for others brings joy and freedom.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Marley's self-forged chains and Scrooge's joyful rebirth are the two halves of the message: greed imprisons the soul, and generosity releases it.
   * **WhyWrong:** The novella insists selfishness punishes the self — Marley made his own chains — while charity redeems and frees; that moral contrast is central to its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written in the "Hungry Forties", the novella ultimately urges which idea about society?
   * **Options:** A) That the poor are a "surplus" society is right to ignore, B) That we all share a moral responsibility for one another — the comfortable have a duty of compassion and charity toward the poor, C) That charity weakens the poor and should stop, D) That Christmas is merely a holiday from work
   * **Correct:** B
   * **Feedback:** ✓ Correct. Against the cold Malthusian arithmetic of "surplus population", Dickens affirms that "mankind" is our common business — society is bound together by a duty of compassion, especially from those who have wealth.
   * **Why A:** This is the very attitude the novella attacks and cures Scrooge of.
   * **Why C:** Dickens presents charity as redemptive and essential, not harmful.
   * **Why D:** Christmas here carries deep moral meaning — generosity and social duty — far beyond a day off.
