# Foundational Quiz Bank — DNA (Dennis Kelly)

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *DNA* is a **social-realist morality play** → the `effects` aspect tests the audience's **moral
discomfort and complicity** — collective guilt and pathos for the innocent — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`dna.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: DNA

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Phil *changes* across the play — and what drives the change?
   * **Options:** A) He is a cold mastermind from the first scene and never really changes, B) He begins a silent, detached teenager idly eating while others panic, and becomes the ruthless architect of a cover-up and a killing — driven by his own choice to protect the group at any moral cost, C) He stays a harmless, passive boy throughout and is simply swept along, D) He is forced by the group to take charge and has no real say in what he does
   * **Correct:** B
   * **Feedback:** ✓ Correct. The disturbance is the *change*: Phil's detachment hardens into calculated ruthlessness — and the engine is his own decision to prioritise the group's safety over conscience, not chance or coercion.
   * **Why A:** He seems harmless and passive at first — quietly eating, saying little; the drama lies in how far that curdles, not in fixed villainy.
   * **Why C:** He does not stay passive — he actively masterminds the framing of an innocent man and the killing of Adam; reading him as merely swept along erases his agency.
   * **Why D:** No one forces him — the others defer to *his* calm decisions; removing his choice turns the moral engine of the play into a puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Phil a genuinely unsettling figure rather than simply a cartoon villain?
   * **Options:** A) He is obviously monstrous from the very first line, B) He is an ordinary, recognisable teenager whose cold *reasoning* — protect the group, whatever it takes — leads step by step to real cruelty, so his calm is what disturbs us, C) He is completely innocent and does nothing wrong, D) He loses his temper and kills in a blind rage
   * **Correct:** B
   * **Feedback:** ✓ Correct. What chills us is not a monster but a plausible boy applying a cold logic; his very ordinariness makes the cruelty feel possible in anyone, which is the point of a morality play.
   * **Why A:** If he were an obvious monster the play would let us off the hook; his ordinariness is exactly what implicates us.
   * **Why C:** He devises the cover-up and orders Adam's death — he is the opposite of innocent.
   * **Why D:** His cruelty is calm and calculated, not a rage — the composure is what makes it frightening.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Phil's evolution from beginning to end?
   * **Options:** A) A loud, panicking ringleader at the start → a silent bystander at the end, B) A quiet, detached teenager eating while others fall apart → the group's cold strategist who calmly engineers a framing and a killing to keep the secret, C) A guilt-ridden confessor at the start → a broken wreck at the end, D) The victim of the prank at the start → its planner at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from unnerving detachment to unnerving control — the same composure, now turned to organising cruelty. That hardening IS his arc.
   * **Why A:** He is quiet and detached at the opening, not a loud ringleader; this reverses his actual character.
   * **Why C:** Phil never breaks or confesses — his refusal to be moved by guilt is precisely what sets him apart (that is Brian's arc, not his).
   * **Why D:** Adam is the victim; Phil is the planner throughout — this confuses who is who entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Phil's descent into orchestrating a cover-up and a killing is driven above all by his own choice — to protect the group whatever the cost — not by the group forcing his hand.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The others look to Phil and follow; the decisions are his. His agency is what makes his calm so disturbing rather than pitiable — he chooses this path.
   * **WhyWrong:** The group never forces Phil — they defer to him. Treating him as coerced removes the choice that makes his cold pragmatism the moral engine of the play.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the group's presumed killing of Adam *lead to* framing an innocent postman? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen in order, B) Believing they have killed Adam, the group — led by Phil — chooses to hide their guilt rather than confess, and a cover-up needs a false suspect, so they plant DNA evidence pointing to someone else, C) A detective orders them to name a suspect, D) They frame the postman at random because they have panicked completely
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the decision to conceal, not confess, creates the need for a scapegoat — so concealment necessitates a second, deliberate wrong against an innocent man.
   * **Why A:** In a morality plot the events follow by cause, not mere sequence — reading them as unconnected misses how one lie compels the next.
   * **Why C:** No detective directs them; the choice to frame someone is the group's own, flowing from its decision to hide the truth.
   * **Why D:** The framing is not random — it is a calculated plan devised by Phil to divert blame from the group.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the play — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the group by bad luck, B) The bullying escalates → they stone Adam and he falls, presumed dead → they choose cover-up over confession → to sustain the lie they frame an innocent man → when Adam turns up alive he threatens the lie → so the group has him killed, C) A stranger causes each disaster, so nothing is the group's doing, D) Fate alone decides everything, and the group's choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in the choice to conceal rather than own the first wrong. That is the moral arc: one lie forces the next crime.
   * **Why A:** Their ruin is not random misfortune — it is the logical outworking of a choice to cover up.
   * **Why C:** There is no outside villain; the harm comes entirely from the group's own decisions.
   * **Why D:** If choice made no difference there would be no moral weight; the whole arc turns on their decisions.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the discovery that Adam is *alive* lead to his real killing? (What is the causal necessity?)
   * **Options:** A) Adam attacks the group and they defend themselves, B) Adam's survival threatens to expose the lie the group has built, so — to protect the cover-up — Phil has him killed: the first concealment now demands a genuine murder, C) Adam asks to be killed, D) The postman kills Adam to protect himself
   * **Correct:** B
   * **Feedback:** ✓ Correct. This is the play's darkest causal turn: the cover-up has its own logic, and once a living Adam endangers it, protecting the lie requires a real death. Concealing one wrong compels a far greater one.
   * **Why A:** Adam is confused and harmless when found, living rough — there is no self-defence; the killing is to silence him.
   * **Why C:** Adam does not seek his death; he is an innocent victim throughout.
   * **Why D:** The postman is a framed innocent, nowhere near Adam; it is the group, under Phil, who kill him.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In *DNA* the later killing of Adam follows by cause-and-effect from the group's first choice to cover up — it is not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on moral necessity, not mere sequence: each act is *because of* the last, all rooted in the decision to conceal. That causal spine is what makes it a morality play, not a list of happenings.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — one concealment forcing the next crime — that is the whole engine of the play.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which controlling idea lies at the heart of *DNA*, and how does it *work* through the play?
   * **Options:** A) The simple joys of childhood friendship, B) Collective guilt and the diffusion of responsibility — because blame is shared across the group, no single member feels wholly responsible, so together they sanction what none would do alone, C) The rivalry between two wealthy families, D) A detective's hunt for a serial criminal
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's engine is shared responsibility: guilt spread across a group thins to nothing in each person, so the crowd commits — and excuses — cruelty no individual would own.
   * **Why A:** Friendship features, but the play's focus is guilt and moral compromise, not childhood joy.
   * **Why C:** There are no feuding wealthy families; the characters are ordinary teenagers.
   * **Why D:** No detective drives the plot; the pressure comes from the group policing its own secret.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** What does the play's escalating cover-up reveal about its view of wrongdoing?
   * **Options:** A) That a lie, if told confidently, harmlessly makes a problem disappear, B) That concealing a wrong corrupts progressively — each lie demands a larger one, until covering up a death leads to a real murder, C) That the group feels no consequences of any kind, D) That only the ringleader is ever truly to blame
   * **Correct:** B
   * **Feedback:** ✓ Correct. Kelly's argument is that concealment is not containment: the first lie sets a logic in motion that keeps demanding worse, dragging ordinary teenagers from a covered-up accident to deliberate killing.
   * **Why A:** The lie does not make the problem vanish — it multiplies it, which is the whole point.
   * **Why C:** The group is deeply affected — Brian's breakdown, the moral corrosion — even where outward punishment never comes.
   * **Why D:** The play spreads responsibility across the whole group; blaming only Phil reproduces the very diffusion of guilt it exposes.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The contrast between Leah, who agonises aloud, and Phil, who stays coldly silent, dramatises which controlling tension?
   * **Options:** A) Which of them is the funnier character, B) Conscience versus pragmatic self-interest — whether moral feeling can survive under the pressure of group survival, C) Whether Phil can actually speak, D) Which of them is a better friend
   * **Correct:** B
   * **Feedback:** ✓ Correct. Leah's restless moral questioning set against Phil's calculating silence stages the play's central tension: conscience against cold self-preservation — and it is pragmatism, not conscience, that steers the group.
   * **Why A:** The pairing is a moral contrast, not a comic one.
   * **Why C:** Phil chooses silence as control; there is no suggestion he cannot speak.
   * **Why D:** The contrast is about conscience versus pragmatism, not friendship.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** *DNA* explores mob mentality — the unsettling idea that shared guilt can bind a group *more* tightly, so its cohesion grows even as its actions worsen.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Kelly's disturbing suggestion is that a shared secret draws the group closer rather than breaking it apart — the guilt that should divide them instead knits them into complicity.
   * **WhyWrong:** This is true — the play shows the group's cohesion *increasing* under shared guilt, exposing how collective pressure erodes individual conscience.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *DNA* is a social-realist morality play. Why do we feel *moral discomfort*, rather than simple thrill, as the group covers up what they have done?
   * **Options:** A) Because the crime is exciting and we enjoy watching them get away with it, B) Because they are ordinary teenagers "like us", so their easy slide into concealment implicates us — we are left asking whether we would have done the same, C) Because the fragmented dialogue is unusual, D) Because a detective might catch them at any moment
   * **Correct:** B
   * **Feedback:** ✓ Correct. Morality drama makes us *complicit*: because these are recognisable ordinary teenagers, their choices feel disturbingly possible in us, and that self-implication is the discomfort the play is built to produce.
   * **Why A:** The play denies us the thrill of a caper — the emotion is unease, not enjoyment; feeling entertained misreads the genre.
   * **Why C:** Naming the fragmented dialogue names a *technique*, not the *feeling* it creates — the effect is our moral unease, not a device.
   * **Why D:** The tension is moral, not a whodunnit suspense; there is no detective closing in.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A morality play such as *DNA* is designed to leave the audience feeling — above all — what?
   * **Options:** A) Amused and entertained, B) Morally uncomfortable and complicit — disquieted at how easily ordinary people excuse cruelty, C) Triumphant that the group succeeds, D) Bored and detached
   * **Correct:** B
   * **Feedback:** ✓ Correct. The intended response is unease that implicates us — collective guilt made to feel personal — not amusement or triumph; a morality drama that merely entertained would fail its purpose.
   * **Why A:** Amusement belongs to comedy; *DNA*'s discomfort is the opposite of light entertainment.
   * **Why C:** We are not meant to cheer the cover-up — their "success" is exactly what unsettles us.
   * **Why D:** Detachment is the mark of a *failed* effect; the play works precisely by refusing to let us stay detached.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *pathos* — a pang of pity — for Adam and for the framed postman?
   * **Options:** A) Because they are the story's villains getting what they deserve, B) Because they are wholly innocent people destroyed so that a guilty group can protect itself — their suffering exposes the human cost of the cover-up, C) Because we find their misfortune darkly funny, D) Because the play uses a recurring motif of eating
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pathos here comes from undeserved suffering: two innocents are sacrificed to the group's self-preservation, and their ruin is where the play's moral cost becomes unbearably visible.
   * **Why A:** They are innocent victims, not villains — reading them as deserving inverts the play's moral weight.
   * **Why C:** Their suffering is not comic; treating it as amusing misreads the genre's discomfort as delight.
   * **Why D:** The motif of eating is a *technique*; the question asks for the *feeling* — pity for the innocent, not the naming of a device.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel morally uneasy and implicated — pity for the innocent who suffer and disquiet at how ordinary the group's cruelty is — rather than entertained or satisfied.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That uneasy, self-implicating feeling — pathos for the victims and disquiet at complicity — is the emotional effect a morality play is built to produce; it leaves us troubled, not comforted.
   * **WhyWrong:** The intended effect is moral discomfort and pathos, not amusement or triumph; the play deliberately refuses the satisfaction of a tidy, comforting ending.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about how people behave in groups?
   * **Options:** A) That groups always bring out the best in people, B) That when responsibility is shared, ordinary people will commit and excuse cruelty no individual would own alone — conscience dissolves in the crowd, C) That one wicked leader is always solely to blame, D) That guilt has no real effect on anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Kelly's enduring "so what" is that the group is where responsibility evaporates: spread thin across many, guilt stops restraining anyone, and ordinary teenagers slide into terrible acts they each disown.
   * **Why A:** The play shows the opposite — the group licenses cruelty, not virtue.
   * **Why C:** Blaming one leader recreates the diffusion of guilt the play critiques; the message spreads responsibility across the group.
   * **Why D:** Guilt corrodes from within — Brian's breakdown shows it — even where external punishment never comes.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does *DNA* suggest about the nature of evil and ordinary people?
   * **Options:** A) That cruelty is committed only by obvious monsters, quite unlike us, B) That terrible harm needs no monster — ordinary, unremarkable people, under group pressure and cold self-justification, are fully capable of it, C) That children are always innocent and never do real harm, D) That evil is always punished swiftly and completely
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's lasting warning is that evil is ordinary: no monsters here, just recognisable teenagers whose reasoning and group pressure carry them to framing and killing — which is far more disturbing than a villain would be.
   * **Why A:** The whole force of the play is that these are ordinary people, not monsters — that is what implicates us.
   * **Why C:** The teenagers do grievous harm; the message dismantles the comfort of assumed innocence.
   * **Why D:** Justice is bleakly incomplete — an innocent man is framed and the group is not exposed; the ending refuses clean punishment.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that ordinary people, under the pressure of a group and the logic of self-protection, are capable of terrible cruelty — evil need not be monstrous to be real.
   * **Answer:** True
   * **Feedback:** ✓ Correct. *DNA* insists that the capacity for cruelty is ordinary: recognisable teenagers, protecting themselves and each other, carry out framing and killing — a warning all the more chilling because there is no monster in sight.
   * **WhyWrong:** The play's message is precisely that ordinary people are capable of great harm; imagining cruelty as the work of monsters alone is the comforting illusion the play dismantles.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about justice and consequence does the play's ending affirm?
   * **Options:** A) That wrongdoing is always neatly caught and fairly punished, B) That the innocent may suffer while the guilty protect themselves — the group largely escapes external blame even as guilt corrodes it from within, leaving an unresolved, uncomfortable moral, C) That everyone confesses and is forgiven, D) That covering up a crime is a reliable route to a happy life
   * **Correct:** B
   * **Feedback:** ✓ Correct. Like the best social realism, *DNA* refuses tidy justice: an innocent man is framed, the group is not exposed, and the damage surfaces inwardly — Brian's collapse, the corrosion of conscience — leaving us with discomfort rather than resolution.
   * **Why A:** The play deliberately denies neat justice — the true culprits are never brought to account.
   * **Why C:** There is no group confession or forgiveness; the secret is kept, not owned.
   * **Why D:** Concealment brings not happiness but escalating harm and inward ruin — the reverse of the message.
