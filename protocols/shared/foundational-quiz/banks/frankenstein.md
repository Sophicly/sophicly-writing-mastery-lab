# Foundational Quiz Bank — Frankenstein

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Frankenstein is a **Gothic** novel → the `effects` aspect tests the reader's **dread, horror and
moral unease**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`frankenstein.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Frankenstein

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Victor Frankenstein *changes* across the novel — and what drives the change?
   * **Options:** A) He is reckless and heartless from the first page and never really changes, B) He begins an idealistic young scientist who "ardently desired the acquisition of knowledge" and becomes a guilt-ridden, broken man hunting his own creation across the ice — driven by his choice to overreach and then abandon what he made, C) He stays a wise and careful man throughout and is simply unlucky, D) He is controlled by his creature and has no say in what he becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: an eager, gifted creator falls to a hollowed-out fugitive — and the engine of the fall is his own choice to breach nature's limits and then flee his responsibility, not chance.
   * **Why A:** He is ardent and idealistic at the start, not heartless; the drama lies in his ruin, not in fixed cruelty.
   * **Why C:** He is not merely unlucky — his own overreaching and neglect cause the disaster; the fall is self-caused, which is what makes it tragic.
   * **Why D:** The creature acts only *because* Victor abandons it; making Victor its puppet removes the agency that makes the fall his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Victor a *fallen hero* rather than simply a villain or an innocent victim?
   * **Options:** A) He is wholly evil and cruel from the very beginning, B) He is a gifted man of real promise brought down by his own fatal error — overreaching for forbidden knowledge and refusing responsibility — so his ruin moves us, C) He is entirely blameless and is destroyed only by the creature's wickedness, D) He escapes all consequences and lives happily
   * **Correct:** B
   * **Feedback:** ✓ Correct. A fallen hero is an in-between figure: genuine promise undone by a fatal flaw (hubris + neglect of duty). That middle position is exactly why his ruin disturbs and moves us rather than merely satisfying us.
   * **Why A:** If he were wholly evil his fall would satisfy rather than move us — the tragedy needs his early idealism.
   * **Why C:** He is not blameless — his overreaching and abandonment set the deaths in motion; that guilt is essential.
   * **Why D:** He is destroyed at the close, dying on the ice — a fallen hero falls; he does not thrive.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Victor's evolution from beginning to end?
   * **Options:** A) A timid, incurious student → a celebrated and contented professor, B) An ambitious creator who "ardently desired the acquisition of knowledge" and dreamed of banishing death → a ruined, obsessive fugitive who has lost everyone he loves and pursues his creation to a barren death on the ice, C) A cruel tyrant at the start → a humble, forgiven man at the end, D) The creature at the start → its master at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from soaring ambition to exhausted despair — the same man, hollowed out by his own choices. That arc IS the tragedy.
   * **Why A:** He begins ardent and ambitious, not timid, and ends broken, not celebrated — this reverses his actual arc.
   * **Why C:** He begins an idealist, not a tyrant, and ends destroyed, not forgiven; the pairing misreads both ends.
   * **Why D:** Victor is the creature's maker, not the creature; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Victor's downfall is driven above all by his own choices — to overreach in creating life, and then to abandon what he made; the creature turns violent only in response.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Victor is not a helpless victim: he chooses to breach the boundary of life and death, then chooses to flee the being he creates. That agency is what turns his ambition into tragedy and keeps the ruin *his*.
   * **WhyWrong:** The creature does not act on its own from the start — it is Victor's overreaching and neglect that set everything in motion. Treating him as a mere victim removes the choices that make him a fallen hero rather than an innocent.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does *creating* the creature *lead to* the deaths of those Victor loves? (What is the causal link?)
   * **Options:** A) The creation and the deaths are unconnected events that simply happen in order, B) Victor abandons the creature the moment it lives; rejected and shunned by everyone, it turns to revenge and destroys what Victor loves to punish him for making and forsaking it, C) The creature is born evil and kills at random from the first day, D) Victor orders the creature to kill his family
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: creation without care breeds rejection, rejection breeds a hunger for revenge, and that revenge drives the killings. This causal necessity is what makes the plot a tragic arc, not a list of events.
   * **Why A:** In tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses the arc.
   * **Why C:** The creature is born gentle and becomes murderous only through rejection — its violence is caused, not innate or random.
   * **Why D:** Victor never orders the killings; the creature acts on its own bitterness, which Victor's abandonment created.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Victor's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) He overreaches to create life → abandons the creature in horror → its rejection breeds revenge → it murders William, Clerval and Elizabeth → Victor is broken and hunts it to his death on the ice, C) The creature is simply evil by nature, so nothing Victor does matters, D) Fate alone decides everything, and his choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in Victor's first choice to overreach and then abandon. That is the tragic arc: hamartia → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the logical, causal outworking of his own overreaching and neglect.
   * **Why C:** The creature is not evil by nature; its violence is the caused *result* of Victor's abandonment, which is the point.
   * **Why D:** If choice made no difference it would not be a tragedy; the whole arc turns on his decisions.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act turns the creature's plea for peace into unstoppable revenge — the point of no return after which catastrophe is unavoidable?
   * **Options:** A) The moment the creature first comes to life, B) Victor's destruction of the half-finished female companion he had promised, C) The murder of William, Victor's young brother, D) Walton's discovery of the dying Victor on the ice
   * **Correct:** B
   * **Feedback:** ✓ Correct. The creature offers to leave humankind forever if given a mate; when Victor tears the half-made companion apart, that one hope is destroyed, and the creature vows "I will be with you on your wedding-night". Every final death follows from that choice — the tragic turning point.
   * **Why A:** The creation gives the creature life but not yet a cause for revenge; reconciliation is still possible then.
   * **Why C:** William's murder is an early *consequence* of the abandonment, a sign the ruin is underway, not the point that makes the final catastrophe unavoidable.
   * **Why D:** Walton's discovery comes at the very end, after the catastrophe; it marks the aftermath, not the choice that sealed it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Frankenstein the deaths follow by cause-and-effect from Victor's choices to create and then abandon the creature — they are not just a string of unconnected misfortunes.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Tragic plot is built on necessity, not mere sequence: creation → abandonment → rejection → revenge → the murders, each *because of* the last. That causal spine is what separates tragedy from a list of happenings.
   * **WhyWrong:** Reading the deaths as unconnected bad luck misses the causal necessity — the very thing that makes the plot a tragic arc rather than a chronicle of misfortunes.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The creature explains himself: "I am malicious because I am miserable." What does this reveal about the novel's view of how a person becomes good or evil?
   * **Options:** A) That some beings are simply born evil and cannot change, B) That cruelty is *made*, not born — a being born gentle is turned murderous by rejection and mistreatment (nature versus nurture), C) That misery has no effect on how people behave, D) That only the creature's ugliness matters
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line is the novel's whole argument about nature and nurture: the creature begins benevolent and is *made* malicious by how it is treated. Evil here is a response to rejection, not an inborn fact.
   * **Why A:** The novel insists the opposite — the creature is born gentle and turned cruel by others; nothing about it is innately evil.
   * **Why C:** Misery is precisely the cause the creature names; ignoring it misses the theme.
   * **Why D:** Its appearance triggers the rejection, but the theme is what that rejection *does* to it, not the ugliness itself.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel's subtitle, "The Modern Prometheus", frames Victor's quest for forbidden knowledge. Which controlling idea does it announce?
   * **Options:** A) That knowledge should always be pursued at any cost, B) That reaching beyond the natural limits set on humankind — for knowledge or power — brings ruin on the overreacher, C) That science can never do any harm, D) That only weather and setting matter in the story
   * **Correct:** B
   * **Feedback:** ✓ Correct. Like Prometheus, punished for stealing fire from the gods, Victor is destroyed for seizing a power not meant for man. The subtitle announces the novel's warning against overreaching ambition.
   * **Why A:** Victor's pursuit brings catastrophe, not reward — the opposite of the novel's warning.
   * **Why C:** The whole tragedy shows knowledge without restraint doing terrible harm.
   * **Why D:** The setting deepens the mood, but the controlling idea is the danger of overreaching, not the weather.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The creature tells Victor, "You are my creator, but I am your master." Which controlling idea does this most reveal?
   * **Options:** A) That a creator owes responsibility to what he makes, and abandoning that duty is the true crime that unleashes disaster, B) That creators should make as many creatures as possible, C) That the creature was always going to rule the world, D) That Victor should have run away sooner
   * **Correct:** A
   * **Feedback:** ✓ Correct. The power has inverted: the abandoned creation now holds power over its maker. The line dramatises the novel's theme of creator's responsibility — Victor's failure of duty, not the creature's nature, is what damns him.
   * **Why B:** The novel warns against reckless creation, not for making more; this misses the point entirely.
   * **Why C:** The creature seeks not to rule the world but companionship; its "mastery" is the consequence of Victor's neglect.
   * **Why D:** Fleeing sooner is exactly Victor's failure of responsibility — the abandonment is the crime, not the cure.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Frankenstein, isolation and rejection are shown to be destructive — both Victor, who cuts himself off in his work, and the creature, cast out by all, are ruined by loneliness.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Victor isolates himself to create, and the creature is shunned by everyone it meets; loneliness poisons them both and fuels the revenge that destroys them — a central idea of the novel.
   * **WhyWrong:** Isolation is a controlling theme: Victor's self-chosen seclusion and the creature's forced exile both breed the misery that drives the tragedy — it embitters, it does not spare them.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Frankenstein is a Gothic novel. Why do we feel *dread* as the creature stirs to life on "a dreary night of November", its "dull yellow eye" opening?
   * **Options:** A) Because the description uses pathetic fallacy, B) Because the Gothic gives our buried fears a body — the moment of creation feels monstrous and *wrong*, and something that should be wondrous (making life) becomes horrifying, so we sense a boundary has been broken, C) Because the scene is amusing and playful, D) We feel nothing at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. Gothic dread comes from the familiar made monstrous: a "birth" turned into horror, a limit transgressed. The bleak night and the "dull yellow eye" make us *feel* that Victor's act is unnatural — that is the emotional effect, not the label of a device.
   * **Why A:** "Pathetic fallacy" names a *technique*, not the feeling; the question asks what we FEEL — dread — and how the Gothic produces it.
   * **Why C:** Amusement belongs to comedy; the scene is built to unsettle and horrify, not to entertain.
   * **Why D:** The whole scene is engineered to disturb — indifference would mean the Gothic effect had failed.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A Gothic novel such as Frankenstein is designed to make the reader feel — above all — which response?
   * **Options:** A) Delight and warm amusement, B) Dread, horror and moral unease — fear at what has been unleashed and disturbance at overreaching human ambition, C) Confidence and calm reassurance, D) Boredom and indifference
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Gothic promises dread: it dresses a society's buried fears as monsters and ruins, unsettling us because the horror reflects a darkness we recognise in ourselves. Frankenstein's fear is of ambition and neglect made flesh.
   * **Why A:** Delight belongs to comedy; a Gothic tale that merely charmed us would fail its purpose.
   * **Why C:** The Gothic works by removing reassurance — it makes safe ground give way beneath us.
   * **Why D:** Boredom is the mark of a *failed* Gothic, not its aim.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *unease* rather than simple hatred as we watch the creature — even after the killings?
   * **Options:** A) Because the creature speaks in vivid metaphors, B) Because it is a "sympathetic shadow" — monstrous yet deeply wronged — so we are disturbed to *pity* what should repel us, and the horror turns back on its creator, C) Because we find the creature funny, D) We feel only disgust and nothing else
   * **Correct:** B
   * **Feedback:** ✓ Correct. Gothic unease is moral: the creature is both fearsome and wronged, so our sympathy and our revulsion pull against each other. That discomfort — pitying the "monster" and blaming the maker — is the intended effect.
   * **Why A:** "Metaphor" names a *device*, not a feeling; the question asks what we FEEL — unease — and why.
   * **Why C:** The creature evokes pity and dread, not amusement; comedy is the wrong genre-emotion here.
   * **Why D:** Pure disgust would flatten it; the novel's power lies in the *unease* of sympathising with something monstrous.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** As a Gothic novel, Frankenstein is built to leave us feeling dread and moral unease — horror at what Victor unleashes and disturbance at the darkness in human ambition — not comfort or delight.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Gothic's promise is dread: the horror forces us to confront the fear of overreaching and the darkness we carry within. That unsettling effect, not reassurance or amusement, is what the novel is built to produce.
   * **WhyWrong:** The intended effect is dread and moral unease, not delight or calm; naming a device (Gothic atmosphere, pathetic fallacy) describes *how* the feeling is made, but the feeling itself is horror and disturbance.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about the pursuit of knowledge and power?
   * **Options:** A) That knowledge and power should be pursued at any cost, B) That reaching for knowledge and power without responsibility or moral restraint brings ruin — we must answer for what we create, C) That science can never cause harm, D) That ambition is the highest of all virtues
   * **Correct:** B
   * **Feedback:** ✓ Correct. Victor's unchecked quest to master life destroys everyone he loves and himself; the novel's enduring "so what" is that knowledge and power divorced from responsibility are catastrophic.
   * **Why A:** The novel dramatises the opposite — pursuit at any cost is shown to be self-destructive.
   * **Why C:** The whole tragedy shows science without restraint doing terrible harm.
   * **Why D:** The novel presents unchecked ambition as ruinous, not virtuous.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring message does the novel offer about how monsters are made?
   * **Options:** A) That some beings are simply born evil and deserve to be shunned, B) That monstrosity is *made* by rejection and cruelty — a being denied love and belonging is driven to violence — so we are responsible for how we treat those we create and cast out, C) That appearance always reveals a person's true nature, D) That the creature was doomed to kill no matter what anyone did
   * **Correct:** B
   * **Feedback:** ✓ Correct. Born gentle and turned murderous by rejection, the creature carries the novel's warning: cruelty and neglect create monsters. The indictment falls on the creator and society, not on the creation's nature.
   * **Why A:** The novel argues the reverse — the creature is not born evil; it is *made* so by how it is treated.
   * **Why C:** The creature's frightful appearance hides a gentle nature at first; the novel attacks judging by looks.
   * **Why D:** The creature was not doomed — kindness could have saved it; that "no matter what" reading removes the novel's whole warning about our responsibility.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that it is not the creature's nature but its rejection that makes it a "monster" — the guilt lies with the creator and society, not the creation.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The creature is "malicious because" it is "miserable"; Shelley indicts Victor's abandonment and humankind's cruelty, not any inborn evil — a central part of the novel's moral.
   * **WhyWrong:** The novel insists monstrosity is made, not born: the creature's violence is the fruit of rejection, so the blame rests on those who create and cast out, not on the creation itself.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The subtitle "The Modern Prometheus" likens Victor to the Titan punished for stealing fire from the gods. What enduring warning about human overreaching does this affirm?
   * **Options:** A) That those who defy the natural and moral limits set on humankind are destroyed by their own transgression, B) That stealing power from the gods brings lasting glory, C) That the gods take no interest in what humans do, D) That ambition without limit is always rewarded
   * **Correct:** A
   * **Feedback:** ✓ Correct. Just as Prometheus is punished for his theft, Victor is ruined for seizing the power of creation. The allusion affirms the novel's warning: overreaching beyond human limits carries its own catastrophe.
   * **Why B:** Victor gains no glory — only ruin; the Promethean parallel is one of punishment, not triumph.
   * **Why C:** The point of the myth is precisely that transgression is answered; indifference misses the moral.
   * **Why D:** The novel shows limitless ambition destroying the overreacher, not rewarding him.
