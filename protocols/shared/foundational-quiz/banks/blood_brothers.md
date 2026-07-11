# Foundational Quiz Bank — Blood Brothers

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Blood Brothers is a **social-realist tragedy / morality play** → the `effects` aspect tests the
audience's **moral discomfort, injustice-anger and pathos** — not the naming of techniques. Its distinctive
distractor is the reading the play itself stages and then *rejects*: that superstition or fate, rather than
class, is to blame.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`blood_brothers.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Blood Brothers

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Mickey *changes* across the play — and what drives the change?
   * **Options:** A) He is a violent, doomed figure from the first scene and never really changes, B) He begins a lively, imaginative, carefree boy and becomes an unemployed, depressed man who kills his brother — worn down by the grind of class hardship and his own descent into despair and jealousy, C) He stays cheerful throughout and simply grows rich, D) He is destroyed purely by superstition and fate, with no part of his own in it
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: the playful boy is hollowed out into a broken man — ground down by unemployment and class, and finally undone by his own jealousy and the choice to seize a gun.
   * **Why A:** He is warm and full of life at the start, not doomed or violent; the drama lies in his transformation, not in fixed ruin.
   * **Why C:** He sinks into joblessness, prison and depression — the opposite of growing rich; that is Edward's rising path, not his.
   * **Why D:** The play stages superstition only to reject it; erasing both the class forces and his own final choices misses *why* the change is partly his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Mickey a *tragic figure* rather than simply a criminal or a villain?
   * **Options:** A) He is wholly bad from the very beginning, B) He is an ordinary, likeable man destroyed by class forces largely beyond his control and by his own broken choices — so his ruin moves us as waste, not disgust, C) He is completely innocent and plays no part at all in his fall, D) He escapes every consequence and ends up content
   * **Correct:** B
   * **Feedback:** ✓ Correct. A tragic figure is an in-between one: an ordinary man we like, crushed by circumstance and his own despair. That middle position is exactly why his ruin arouses pity and anger, not mere disgust.
   * **Why A:** If he were wholly bad his fall would satisfy rather than move us — the tragedy needs his early warmth and ordinariness.
   * **Why C:** He does take the gun and pull the trigger; flattening him into a blameless victim erases the choices that make him tragic rather than merely pitiable.
   * **Why D:** He is shot dead at the climax — a tragic figure falls; he does not end content.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Mickey's evolution from beginning to end?
   * **Options:** A) A cruel bully at the start → a wealthy, admired man at the end, B) A playful boy who idolises his new friend and longs to be like him → a jobless, pill-dependent man who, at the last, cries "I could have been him!" and shoots his brother, C) A rich boy at the start → a humble labourer at the end, D) A quiet loner at the start → a famous singer at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a boy who wants to be like Edward to a broken man wrecked by the gap between them — "I could have been him!" is the same longing turned to despair. That arc IS the tragedy.
   * **Why A:** He starts warm and playful, not cruel, and ends destroyed, not wealthy — this reverses his actual arc.
   * **Why C:** Mickey is the poor twin from the start; it is his poverty, not wealth, that shapes his fall.
   * **Why D:** His decline is into unemployment, depression and prison, not fame — this invents an arc the play does not give him.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Mickey's downfall is driven both by the class hardship that grinds him down *and* by his own choices — the robbery, the despair, seizing the gun — not by superstition alone.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The play grinds him down with unemployment and class, but he still makes the choices that end in bloodshed; his fall is social AND his own, which is what makes it tragic rather than merely unlucky.
   * **WhyWrong:** The play deliberately raises superstition and then rejects it — blaming "the Devil" or fate alone removes both the social cause and Mickey's own agency, the two forces that actually destroy him.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Mrs Johnstone giving away one twin at birth *lead to* the brothers' deaths at the end? (What is the causal link?)
   * **Options:** A) The two events are unconnected — one just happens years after the other, B) The secret separation raises the twins in opposite classes; their unknowing friendship, the class gulf and Mickey's collapse all flow from it, so when the truth finally erupts both are destroyed, C) The Devil literally kills them because of the superstition, D) They die at random, with no link to how they were parted
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the giving-away sets the twins on opposite class paths, and every later disaster grows from that single decision. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence; reading the separation and the deaths as unconnected misses the whole arc.
   * **Why C:** The superstition is a shadow the play stages and then rejects — the real chain is social, not supernatural.
   * **Why D:** The deaths are the logical outworking of the original separation and the class divide, not a random accident.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Mickey's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) He loses his job in the recession → is drawn into Sammy's robbery → goes to prison → sinks into depression and pills → grows jealous of Edward, who has everything, including Linda's help → seizes a gun → both brothers die, C) Superstition causes each step directly, so nothing is his own or society's doing, D) Fate alone decides everything, and neither his choices nor his class make any difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before — unemployment feeds the robbery, prison feeds the depression, the class gap feeds the jealousy. That is the tragic arc: hardship → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the causal outworking of the recession, the class divide and his own choices.
   * **Why C:** The play rejects superstition as the cause; making it the engine erases the social and personal causation that actually drives the fall.
   * **Why D:** If class and choice made no difference there would be no argument and no tragedy — the whole arc turns on both.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the irreversible turning point from which the whole catastrophe follows — the point of no return?
   * **Options:** A) The twins meeting and becoming friends as boys, B) Mrs Johnstone's secret agreement to give one twin away to Mrs Lyons, C) Mickey losing his job at the factory, D) The final gunshot at the town hall
   * **Correct:** B
   * **Feedback:** ✓ Correct. Giving away one twin is the originating, irreversible act: once done, the brothers are set on opposite class paths and everything else — the friendship, the divide, the deaths — follows from it. That is the tragic turning point.
   * **Why A:** Their friendship is a *consequence* of the separation, not the choice that made the tragedy inevitable.
   * **Why C:** Losing his job deepens Mickey's decline, but the fall was already set in motion by the original giving-away.
   * **Why D:** The gunshot is the catastrophe itself — the arrival of the ruin, not the choice that first made it unavoidable.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Blood Brothers the final deaths follow by cause-and-effect from the original separation and Mickey's class-driven decline — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: the separation causes the opposite upbringings, which cause the divide, which causes the collapse. That causal spine is what makes the play a tragedy rather than a chronicle.
   * **WhyWrong:** Reading the events as unconnected ("they just happen one after another") misses the causal necessity — the very thing that turns the plot into a tragic arc rather than a sequence of happenings.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Comparing himself bitterly to Edward, Mickey says, "I grew up, an' you didn't, because you didn't need to." What does this reveal about the play's view of class and upbringing?
   * **Options:** A) That people are born already destined to succeed or fail, so class makes no difference, B) That upbringing and class — not birth or ability — decide the twins' opposite fates: money let Edward stay carefree while poverty forced Mickey to grow up hard, C) That Mickey is simply lazier than Edward, D) That the two boys are really nothing alike by nature
   * **Correct:** B
   * **Feedback:** ✓ Correct. Two brothers, identical by birth, diverge utterly because of class — Mickey's line captures the play's whole argument that circumstance, not nature or merit, shapes a life.
   * **Why A:** The play argues the opposite of fixed destiny — it is class *after* birth, not birth itself, that divides the twins.
   * **Why C:** His hardship is the product of poverty and unemployment, not laziness — the play blames the system, not the boy.
   * **Why D:** They are twins, born the same; the point is that nurture, not nature, pulls them apart.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Mrs Lyons warns that if either twin learns he was once one of a pair, "they shall both immediately die." Which controlling idea does the superstition introduce?
   * **Options:** A) That an ominous sense of fate and doom hangs over the twins from birth — a foreboding the play exploits but finally reframes as the workings of class, B) That magic is literally real and directly kills the boys, C) That superstition is harmless and has no bearing on the story, D) That Mrs Lyons is simply a kind, protective mother
   * **Correct:** A
   * **Feedback:** ✓ Correct. The curse casts a shadow of doom over the whole play, shaping the mood of inevitability — yet the Narrator's closing question turns that "fate" back into a matter of class, which is where the real cause lies.
   * **Why B:** The play stages superstition as atmosphere and then rejects it — there is no literal magic doing the killing.
   * **Why C:** The superstition is far from harmless: it drives Mrs Lyons's fear and cruelty and colours the audience's dread of the ending.
   * **Why D:** Her superstition makes her fearful and controlling, not simply kind — it is part of the doom, not a comfort.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The boys swear to be "blood brothers" as children. Which idea does the play most explore through their bond, and how does it *work*?
   * **Options:** A) That friendship always conquers every obstacle in the end, B) That even the deepest brotherly bond cannot survive the class divide forced between the twins — love is broken by inequality, C) That the boys never really liked each other, D) That family ties are unimportant to the play
   * **Correct:** B
   * **Feedback:** ✓ Correct. Their vow makes them brothers in feeling as well as in blood, so watching class prise them apart — one to university, one to the dole — dramatises how inequality destroys even love.
   * **Why A:** The play shows the opposite: their friendship is *not* enough to overcome the class gulf, which is precisely its tragedy.
   * **Why C:** Their bond is real and tender; the point is that class, not indifference, tears it apart.
   * **Why D:** The blood tie is central — it is the source of both their closeness and the final catastrophe.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Blood Brothers, class division is shown as the true force shaping the twins' opposite fates — one given wealth, education and prospects, the other unemployment, prison and despair.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The same two boys, split only by class, meet opposite ends — the play's central idea that circumstance, not ability, decides a life.
   * **WhyWrong:** The twins' diverging fates are driven by class, not by any difference in their nature or worth — that is the argument the whole play is built to make.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Blood Brothers is a social-realist tragedy. Why do we feel *moral discomfort and anger at injustice* by the end, rather than simple sorrow?
   * **Options:** A) Because the play is really a comedy and we feel amused and satisfied, B) Because two likeable brothers are destroyed not by their own wickedness but by a class system that hands one everything and the other nothing — so their deaths feel like an injustice we are implicated in, C) Because we feel their deaths are fair and deserved, D) Because the effect comes from the dramatic irony, which is what we are meant to feel
   * **Correct:** B
   * **Feedback:** ✓ Correct. Social tragedy makes us feel the *wrongness* of a preventable, man-made ruin: the twins are ordinary and blameless, so their deaths provoke anger at the unequal society — and unease that we belong to it — not just grief.
   * **Why A:** Amusement and satisfaction belong to comedy; a social tragedy that merely entertained us would fail its purpose.
   * **Why C:** The whole force of the ending is that the deaths are *un*deserved — an injustice; feeling them fair misses the moral anger the play engineers.
   * **Why D:** Dramatic irony is a *device* the play uses; naming it mistakes the technique for the feeling — the intended effect is moral discomfort and anger, not a label.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A social-realist tragedy such as Blood Brothers is designed to make the audience feel — above all — which response?
   * **Options:** A) Amusement and satisfaction, B) Pity for the twins and angry moral discomfort at the injustice of class — a sense of shared responsibility, C) Confusion and boredom, D) Admiration for how cleverly Mickey plans his life
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play aims to arouse *pity* (for two ordinary brothers destroyed) and *moral anger* (that class did the destroying) — leaving us uneasy and questioning, which is the emotional purpose the whole arc serves.
   * **Why A:** Amusement belongs to comedy; a social tragedy that only satisfied us would abandon its warning.
   * **Why C:** Confusion and boredom are the marks of a *failed* play, not the aim of this one.
   * **Why D:** There is no clever scheme to admire — Mickey is ground down by circumstance; the intended response is pity and anger.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *pathos* — grief mixed with anger — as we watch Mickey's fall?
   * **Options:** A) Because we are frightened of the superstition and its curse, B) Because Mickey is an ordinary man "like us", so his ruin by forces beyond his control warns that the same class injustice could crush anyone, C) Because we are afraid Mickey will win and prosper forever, D) We feel nothing but disgust at him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The pathos is *for ourselves too*: because Mickey is recognisably ordinary, not a villain, his destruction feels like a warning that the same social forces could ruin any of us — grief edged with anger.
   * **Why A:** The play rejects superstition as the real cause; the fear it leaves us with is social and moral, not fright at a curse.
   * **Why C:** We know from the opening that he falls; the feeling is grief at *how* he falls and what it exposes, not fear that he will triumph.
   * **Why D:** Mickey is sympathetic, not disgusting — his ordinariness is exactly what turns any disgust into pity and anger.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel both grief for the twins and angry moral discomfort at a class system that destroyed them — not amusement or triumph.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — pity for two ordinary brothers and anger at the injustice that killed them — is the emotional effect a social tragedy is built to produce, leaving us moved and uneasy rather than satisfied.
   * **WhyWrong:** The intended effect is grief *and* moral anger together, not amusement or triumph; the ending is designed to disturb us into questioning class, not to console us.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The Narrator ends by asking whether to "blame superstition for what came to pass" — "Or could it be what we, the English, have come to know as class?" What is the play's overall *message*?
   * **Options:** A) That superstition and fate are the true forces that decide our lives, B) That class, not ability or worth, decides a person's fate — the same child given wealth thrives while the one given poverty is destroyed — an indictment of an unequal society, C) That the poor bring their misfortunes on themselves, D) That individual effort alone determines whether we succeed
   * **Correct:** B
   * **Feedback:** ✓ Correct. The closing question rejects fate and names class: two identical boys meet opposite ends only because one was born rich and one poor. That is the play's enduring "so what" — a protest against class inequality.
   * **Why A:** The Narrator raises superstition only to dismiss it in favour of class — fate is the reading the play refuses.
   * **Why C:** The play argues the opposite — Mickey's ruin is caused by a system stacked against him, not by any fault of his own.
   * **Why D:** The twins prove that effort cannot outrun class: the same boy prospers or is destroyed according to which family raised him.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** By staging the superstition and then asking whether the cause was really "class", what does Russell want the audience to conclude?
   * **Options:** A) That superstition genuinely killed the twins, B) That fate and superstition are a false explanation — the real killer is class inequality, a man-made injustice we should refuse to accept, C) That the two mothers alone are to blame for everything, D) That nothing in particular caused the deaths
   * **Correct:** B
   * **Feedback:** ✓ Correct. Russell uses superstition as a decoy: by dismissing "fate" in the final lines he insists the deaths were social and preventable, forcing the audience to indict class rather than the stars.
   * **Why A:** The superstition is deliberately exposed as a false cause — the play's whole point is to look past it to class.
   * **Why C:** Both mothers are shaped by a class system larger than themselves; the play blames the structure, not two individuals.
   * **Why D:** The play names a very specific cause — class — and builds its whole argument around it.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that the twins' deaths were not fate or bad luck but the product of a class system — a preventable, man-made injustice.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Narrator's final turn from superstition to "class" insists the tragedy was social and avoidable, not written in the stars — a protest against inequality, not a lament at destiny.
   * **WhyWrong:** The play explicitly rejects superstition as the cause, pointing instead to class — the deaths are presented as a man-made injustice, not the work of fate.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about society does the ending of the play affirm?
   * **Options:** A) That class division is natural and just, so the outcome is fair, B) That the inequality of class is a destructive injustice for which society as a whole bears responsibility — the ending leaves us uneasy and questioning, not consoled, C) That the wealthy always earn their advantages through merit, D) That the poor are responsible for their own ruin
   * **Correct:** B
   * **Feedback:** ✓ Correct. The deaths of two blameless brothers, split only by class, are meant to implicate the whole society that allowed it — the play sends us out troubled and questioning inequality, which is its enduring message.
   * **Why A:** The play presents class division as a destructive injustice, not a natural or fair order.
   * **Why C:** Edward's advantages come from being *given* to a rich family by chance, not from merit — the play denies that wealth is earned.
   * **Why D:** Mickey's ruin is caused by a system stacked against him; the play refuses to blame the poor for their own destruction.
