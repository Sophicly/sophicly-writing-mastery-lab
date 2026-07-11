# Foundational Quiz Bank — To Kill a Mockingbird

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *To Kill a Mockingbird* is a **bildungsroman (coming-of-age)** set against social-realist racial
injustice → the `effects` aspect tests the reader's **empathy, poignancy and hope at Scout's growth and
its cost** (the ache of innocence lost, and moral discomfort at injustice), not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`tkam.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: To Kill a Mockingbird

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Scout *changes* across the novel — and what drives the change?
   * **Options:** A) She is a wise, knowing child from the first page and never really changes, B) She grows from an innocent child who judges quickly into a girl who understands injustice and empathy — driven by witnessing Tom's trial and finally seeing Boo, C) She simply gets older but ends thinking exactly as she began, D) She is forced to change by Atticus and has no part in it herself
   * **Correct:** B
   * **Feedback:** ✓ Correct. This is a coming-of-age novel: the whole point is Scout's *growth* — from a child's quick certainties to hard-won moral sight, forged by what she witnesses and by her own choice to see as Atticus teaches.
   * **Why A:** She begins genuinely innocent and quick to judge; the drama lies in her transformation, not in a fixed wisdom.
   * **Why C:** Mere ageing is not the point — a bildungsroman turns on inner change; Scout ends morally transformed, not just older.
   * **Why D:** Atticus guides her, but her growth is her own dawning understanding — removing her agency misses that she chooses to apply his lesson.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Scout's journey a *coming-of-age* (bildungsroman) rather than a child simply growing older?
   * **Options:** A) She learns nothing and stays a naive child, B) She loses her childhood certainties and gains moral understanding — a growth bought at the cost of her innocence, C) She grows physically but her view of the world never shifts, D) She becomes cynical and rejects everything Atticus taught her
   * **Correct:** B
   * **Feedback:** ✓ Correct. The form measures growth by what is *unlearned*: Scout trades the comfort of childhood innocence for the harder clarity of moral sight — the wisdom is real, but it costs her the certainty she began with.
   * **Why A:** She learns a great deal — about prejudice, courage and empathy; the arc is precisely her education.
   * **Why C:** A coming-of-age story is defined by the shift in how she *sees*, not merely by getting taller.
   * **Why D:** She does not reject Atticus's lesson — she grows into it, ending in understanding, not cynicism.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Scout's evolution from beginning to end?
   * **Options:** A) A cruel bully at the start → a frightened recluse at the end, B) A child who imagines Boo Radley a monster and fights over insults → a girl who stands on Boo's porch and sees the world through his eyes, C) A wise adult at the start → a confused child at the end, D) A stranger to Maycomb at the start → its mayor at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from a child's fearful fantasy and quick temper to genuine empathy — literally standing where Boo stood to "see" his world. That arc from innocence to understanding IS the coming-of-age.
   * **Why A:** She is neither a bully nor a recluse; this misreads both ends of her arc.
   * **Why C:** She begins a child and grows *into* understanding — this reverses her actual development.
   * **Why D:** Scout is a Maycomb child throughout; her change is moral, not a change of status.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Scout's growth is driven above all by her own coming-to-see — the trial and meeting Boo force her to unlearn childhood assumptions; she does not merely grow older but becomes morally changed.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The formative experiences test her innocence, but it is Scout's own dawning grasp — her choice to walk in another's skin — that turns experience into growth. That is what makes her the bildungsroman's evolving centre.
   * **WhyWrong:** Treating Scout as unchanged, or as merely older, misses the point of the form: her innocence is dismantled and replaced by moral understanding, and that transformation is her own.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Tom Robinson's trial *lead to* Bob Ewell's attack on the children? (What is the causal link?)
   * **Options:** A) The two events are unconnected and simply happen in that order, B) Atticus exposes Ewell's lie in open court and humiliates him — so the shamed Ewell seeks revenge on Atticus through his children, C) Ewell attacks at random because he has gone mad, D) The sheriff orders Ewell to frighten the children
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: Atticus's defence publicly disgraces Ewell, and that humiliation breeds the vengeance that drives him to attack Jem and Scout. The plot is a causal chain, not a list of events.
   * **Why A:** In a well-built plot events follow by cause, not mere sequence; reading them as unconnected misses the arc.
   * **Why C:** His attack is driven by wounded pride and a thirst for revenge, not random madness.
   * **Why D:** No one orders him; Ewell acts on his own resentment after being shown up in court.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the novel — not just the order of events?
   * **Options:** A) A series of unrelated small-town happenings with no link between them, B) Atticus defends Tom → he dismantles the Ewells' story → the prejudiced jury convicts Tom anyway → the humiliated Ewell takes revenge → Boo Radley saves the children, C) Everything is caused by Boo Radley from the start, D) The events are decided purely by chance and no choice matters
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before: the defence provokes the shame, the shame provokes the revenge, the revenge brings out Boo. That causal spine — rooted in Atticus's principled choice — is what makes it a story, not a chronicle.
   * **Why A:** The events are tightly linked by cause and effect; reading them as unrelated misses the chain.
   * **Why C:** Boo appears only at the climax as a *consequence* of Ewell's revenge; he does not cause the earlier events.
   * **Why D:** Choice is decisive — Atticus's decision to defend Tom sets the whole chain in motion.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that destroys the children's childhood faith in their world — the point of no return in their coming-of-age?
   * **Options:** A) The children first daring each other to touch the Radley house, B) The jury's guilty verdict against Tom Robinson despite his evident innocence, C) Scout's first day at school, D) The snowman the children build in the yard
   * **Correct:** B
   * **Feedback:** ✓ Correct. The unjust verdict is irreversible for the children's innocence: once they watch prejudice defeat clear truth, their faith in Maycomb's fairness cannot be restored. That is the moment innocence gives way to moral sight.
   * **Why A:** The Radley dares are early childhood play — nothing about their view of justice has yet been shaken.
   * **Why C:** School unsettles Scout, but it does not overturn her whole sense of right and wrong.
   * **Why D:** The snowman is a small childhood episode, not the shock that ends their innocence.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novel, Bob Ewell's attack on the children follows by cause-and-effect from the trial — it is not just a later event unconnected to what came before.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: Atticus's courtroom exposure of Ewell's lie humiliates him, and that humiliation is *why* he seeks revenge. The attack is caused by the trial, not merely after it.
   * **WhyWrong:** Reading the attack as an unconnected later happening misses the causal necessity — Ewell strikes *because* he was disgraced in court, which is what makes the plot a chain rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Atticus tells the children it is "a sin to kill a mockingbird", and Miss Maudie explains that mockingbirds "don't do one thing but sing their hearts out for us". What does this reveal about the novel's controlling idea?
   * **Options:** A) That hunting birds is cruel and should be banned, B) That to destroy the harmless and innocent — like Tom Robinson and Boo Radley — is a moral wrong, C) That Atticus dislikes music, D) That the children should stay indoors
   * **Correct:** B
   * **Feedback:** ✓ Correct. The mockingbird, which only sings and harms no one, becomes the novel's symbol for the innocent; to wound Tom or Boo is to "kill a mockingbird" — the destruction of harmless goodness by cruelty and prejudice.
   * **Why A:** The line is a symbol about human innocence, not a literal lesson about hunting.
   * **Why C:** It concerns the sin of harming the innocent, not Atticus's taste in music.
   * **Why D:** It is a moral idea about protecting the vulnerable, not a rule about staying inside.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Atticus tells Scout you never understand a person "until you climb into his skin and walk around in it". Which idea does the novel most explore through this, and how does it *work*?
   * **Options:** A) Revenge — repaying cruelty with cruelty, B) Empathy — that moral understanding comes only from seeing the world through another's eyes, a lesson Scout slowly learns and finally applies to Boo, C) Ambition — the drive to rise above others, D) Greed — the hunger for wealth
   * **Correct:** B
   * **Feedback:** ✓ Correct. Empathy is the novel's moral centre, and it *works* as a lesson Scout is taught early and only truly grasps at the end, when she stands on Boo's porch and sees Maycomb through his eyes.
   * **Why A:** The line urges understanding — the opposite of revenge.
   * **Why C:** It is about compassion for others, not personal ambition.
   * **Why D:** It concerns seeing from another's view, not the hunger for wealth.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** How does the theme of racial prejudice *work* through the novel — what does it do to Maycomb's justice?
   * **Options:** A) It has no real effect on the trial's outcome, B) It blinds an all-white jury to plain evidence, so they convict Tom because he is Black rather than because he is guilty, C) It makes the town treat Black and white citizens equally, D) It matters only to the children's games
   * **Correct:** B
   * **Feedback:** ✓ Correct. Prejudice is shown as a force that overrides truth itself: Atticus proves Tom's innocence, yet racial hatred convicts him anyway — the theme works by exposing how a whole community lets bigotry defeat justice.
   * **Why A:** Prejudice decides the verdict — it is the reason an innocent man is condemned.
   * **Why C:** The novel dramatises deep inequality, not equal treatment.
   * **Why D:** Its reach is a man's life, far beyond the children's world.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novel presents real courage, through Atticus, as pressing on to do what is right even when — as he says of one "licked before you begin" — you know you cannot win.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Atticus defends Tom knowing the verdict is already lost, defining courage not as winning but as doing right in the face of certain defeat — a controlling idea the whole trial dramatises.
   * **WhyWrong:** Courage here is precisely acting rightly despite certain defeat; Atticus takes the case knowing he is "licked", which is the novel's very definition of the virtue.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *To Kill a Mockingbird* is a coming-of-age novel. Why do we feel a poignant ache as Scout loses her childhood innocence?
   * **Options:** A) Because we are amused by the children's games, B) Because the moral understanding she gains is bought by the loss of a childhood certainty that can never be restored — we feel the cost of growing up, C) Because a symbol has been used to represent innocence, D) Because we are thrilled by the danger of the final attack
   * **Correct:** B
   * **Feedback:** ✓ Correct. The bildungsroman moves us by the *exchange*: Scout's new moral sight is real, but it can never give back the innocence it cost. That ache — empathy for the price of growth — is the feeling the form is built to produce.
   * **Why A:** Amusement is not the intended response; the games give way to a sobering education, and the feeling deepens into poignancy.
   * **Why C:** "A symbol is used" names a *technique*, not a feeling — the effect is the ache of lost innocence, not a device.
   * **Why D:** The attack unsettles, but the enduring emotion is the poignancy of Scout's growth, not the thrill of danger.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel such as this is designed to make the reader feel — above all — which response?
   * **Options:** A) Delight and relief as disorder is happily resolved, B) Empathy and poignancy at a child's growth and its cost — the ache of innocence traded for understanding, C) Dread and horror at a supernatural threat, D) Triumphant satisfaction at a hero's total victory
   * **Correct:** B
   * **Feedback:** ✓ Correct. The form's promise is the feeling of growth and its price: we watch a child gain moral sight and feel both empathy for the journey and the poignancy of what innocence it cost — with a fragile hope in the understanding won.
   * **Why A:** Delight at resolved disorder is the effect of *comedy* — the wrong genre-emotion for a coming-of-age story marked by injustice.
   * **Why C:** Dread and horror belong to the gothic; the fear at the Radley house is left behind as understanding replaces it.
   * **Why D:** There is no triumphant victory — Tom is convicted; the feeling is poignant empathy, not triumph.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the guilty verdict make us feel moral discomfort and indignation rather than acceptance?
   * **Options:** A) Because we dislike the courtroom setting, B) Because an evident innocent — a "mockingbird" — is destroyed by prejudice, so we feel the injustice as a wrong done in our own world, C) Because we are pleased to see order upheld, D) Because the trial is exciting to watch
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel makes us share the children's outrage: Tom is plainly innocent, yet bigotry condemns him, and we are made to feel that injustice sharply — moral discomfort is exactly the response the social-realist trial is built to arouse.
   * **Why A:** The discomfort is moral, about injustice, not a dislike of the setting.
   * **Why C:** There is no just order to be pleased by — the verdict is a miscarriage of justice, which is why we feel wronged.
   * **Why D:** We may be gripped, but the intended effect is indignation at injustice, not mere excitement.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel empathy and a tempered hope — moved by Scout's growth into understanding, yet aching at the innocence and the injustice it cost.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — hope in the empathy Scout has learned, poignancy at the price of growth and the injustice witnessed — is the emotional effect a coming-of-age novel set against prejudice is built to produce.
   * **WhyWrong:** The intended effect is empathy and poignant hope, not amusement or triumph; the ending leaves us moved by Scout's understanding and saddened by its cost, not satisfied by a victory.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about prejudice and justice?
   * **Options:** A) That prejudice is harmless and soon fades on its own, B) That prejudice blinds a community and can destroy the innocent — yet moral courage and empathy remain the right response, even when they cannot win, C) That justice always prevails in the end, D) That it is pointless ever to do what is right
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel shows prejudice defeating truth and ruining Tom, yet insists — through Atticus — that empathy and the courage to do right are worth holding to regardless of the outcome. That is its enduring "so what".
   * **Why A:** The novel dramatises prejudice as a destructive force that costs a man his life — the opposite of harmless.
   * **Why C:** Justice does *not* prevail — Tom is wrongly convicted; the message survives that defeat, it does not deny it.
   * **Why D:** Atticus's stand affirms that doing right matters even when you lose; the message is the reverse of futility.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Through the mockingbird symbol, what enduring idea does the novel ultimately affirm?
   * **Options:** A) That the weak deserve their fate, B) That it is a sin to harm the harmless and innocent, and a just society should protect them rather than destroy them, C) That songbirds should be protected by law, D) That children should never grow up
   * **Correct:** B
   * **Feedback:** ✓ Correct. Tom and Boo are the novel's mockingbirds — gentle, harmless, wounded by the cruelty of others. The lasting message is that to destroy such innocence is a moral wrong, and that decency means shielding it.
   * **Why A:** The novel condemns the destruction of the innocent; it never suggests they deserve it.
   * **Why C:** The mockingbird is a symbol for human innocence, not a literal plea about birds.
   * **Why D:** The novel affirms the value of moral growth — it does not wish childhood frozen.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that you never truly understand a person until you see the world from their point of view — empathy is its moral answer to prejudice.
   * **Answer:** True
   * **Feedback:** ✓ Correct. "Climb into his skin and walk around in it" is the moral heart of the book: prejudice comes from refusing to see others, and empathy — Scout's final gift on Boo's porch — is the cure the novel affirms.
   * **WhyWrong:** Empathy is exactly the novel's answer to prejudice; Scout's closing understanding of Boo dramatises the message that seeing from another's view is the beginning of justice.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about growing up does the ending affirm, as Scout — finally understanding Boo — says "he was real nice", and Atticus replies that "most people are... when you finally see them"?
   * **Options:** A) That growing up means becoming hard and suspicious of everyone, B) That moral maturity means learning to see others with empathy — even at the cost of childhood innocence — and doing right regardless of the outcome, C) That it is best never to trust anyone, D) That understanding others brings no reward at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. Atticus's closing reply — that most people are decent "when you finally see them" — crowns Scout's coming-of-age: the empathy she has learned, bought with her lost innocence, lets her at last truly see Boo. That is the novel's final word on growing up.
   * **Why A:** Her growth makes her more understanding, not harder or more suspicious.
   * **Why C:** The ending affirms empathy and trust in others' basic decency, not blanket distrust.
   * **Why D:** The reward is moral understanding itself — the empathy that lets her, at last, truly see Boo.
