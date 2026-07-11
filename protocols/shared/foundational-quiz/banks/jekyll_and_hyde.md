# Foundational Quiz Bank — The Strange Case of Dr Jekyll and Mr Hyde

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Jekyll and Hyde is a **Gothic novella** → the `effects` aspect tests the reader's **dread,
horror and moral unease**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`jekyll_and_hyde.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Jekyll and Hyde

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Dr Jekyll *changes* across the novella — and what drives the change?
   * **Options:** A) He is a monster from the first page and never really changes, B) He begins a respected, benevolent doctor and ends a man consumed and destroyed by Hyde — driven by his own choice to release and indulge his hidden self, C) He stays a wholly good man throughout and is simply the victim of a faulty potion, D) The potion controls him from the very start, so what he becomes is never his own doing
   * **Correct:** B
   * **Feedback:** ✓ Correct. The change IS the horror: a respected doctor hollowed out until Hyde takes over — and the engine of the fall is his own decision to separate and indulge his darker nature, not an accident.
   * **Why A:** Jekyll is respected and benevolent at the outset; the drama lies in his transformation, not in fixed monstrosity.
   * **Why C:** He is not a passive victim — he brews and drinks the potion to indulge a self he already harbours; the fall is self-caused.
   * **Why D:** The potion only releases what he chooses to release; treating it as controlling him from the start removes the choice that makes the fall his.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Jekyll a *self-destroyed* figure rather than simply an innocent victim of his experiment?
   * **Options:** A) He is wholly evil from the beginning, so nothing is really lost, B) He is neither wholly good nor a helpless victim — a respected man who chooses to indulge his darker self and is ruined by it, so his fall disturbs us, C) He is entirely innocent and does nothing wrong — the potion alone is to blame, D) He suffers no real consequences and lives on contentedly
   * **Correct:** B
   * **Feedback:** ✓ Correct. The story's power comes from an in-between figure: a good man who deliberately frees his worst self and cannot cage it again. That self-authored ruin is what makes the fall morally disturbing, not merely sad or disgusting.
   * **Why A:** If he were wholly evil from the start there would be no fall — the horror needs his early respectability and goodwill.
   * **Why C:** He is not blameless: he creates and repeatedly takes the draught to enjoy Hyde's freedoms; the guilt is his own.
   * **Why D:** He is destroyed — found dead as Hyde; he does not live on contentedly.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Jekyll's evolution from beginning to end?
   * **Options:** A) A hunted criminal at the start → a respected doctor at the end, B) A respected doctor who believes "man is not truly one, but truly two" → a man overwhelmed by Hyde, bringing "the life of that unhappy Henry Jekyll to an end", C) A poor servant at the start → a wealthy master at the end, D) One of Hyde's street victims at the start → his killer at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from a confident, respected experimenter to a self hollowed out and finally erased by the double he freed — the same man, undone by his own choice. That arc IS the story.
   * **Why A:** He begins respected and ends destroyed; this reverses his actual arc.
   * **Why C:** Jekyll is a wealthy doctor throughout — his change is moral, not a change of social station.
   * **Why D:** Jekyll is Hyde's source, not one of his street victims; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Jekyll's downfall is driven above all by his own choice — he creates and drinks the potion to indulge his hidden self; the potion does not force the change upon an unwilling man.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The experiment plants the possibility, but Jekyll chooses to brew it and drink it, again and again, to enjoy Hyde's licence; his agency is what turns a curious experiment into self-destruction.
   * **WhyWrong:** The potion never forces an unwilling man — Jekyll deliberately takes it to free his darker appetites. Treating him as its helpless victim removes the choice that makes the ruin his own.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does creating Hyde *lead to* Jekyll losing control of his own body? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen in order, B) Each indulgence as Hyde strengthens that self, so the evil grows until Jekyll begins transforming involuntarily and can no longer stay himself, C) A rival scientist secretly sabotages the potion, D) Hyde is a separate person who breaks in from outside
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: every time Jekyll becomes Hyde he feeds that self, and the stronger Hyde grows the less Jekyll can contain him. The loss of control is the direct consequence of the indulgence, not a coincidence.
   * **Why A:** In Gothic tragedy events follow by cause, not mere sequence — "succession is not causation"; reading them as unconnected misses how the indulgence breeds the collapse.
   * **Why C:** No rival sabotages him; the ruin comes from within, from his own repeated choice.
   * **Why D:** Hyde is not an outside intruder — he is Jekyll's own released self, which is precisely why the growth is unstoppable.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Jekyll's fall — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike him by bad luck, B) He devises the potion → indulges his darker self as Hyde → Hyde grows stronger with each use → the transformations turn involuntary → Hyde commits murder and takes over → Jekyll is destroyed, C) The potion acts on its own with no choice from Jekyll, so nothing is his doing, D) Fate alone decides everything, and his choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in his first choice to divide and indulge the self. That is the tragic Gothic arc: overreach → escalating consequence → catastrophe.
   * **Why A:** His ruin is not random misfortune — it is the logical, causal outworking of his own first experiment.
   * **Why C:** The potion does nothing until Jekyll chooses to drink it; making it the sole cause erases the causation that is his.
   * **Why D:** If choice made no difference there would be no fall — the whole arc turns on his repeated decision to become Hyde.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that makes Jekyll's catastrophe unavoidable — the point of no return?
   * **Options:** A) Jekyll first mixing the potion in his laboratory, B) The moment Jekyll begins transforming into Hyde involuntarily, without the drug — proof that the evil self has grown beyond his control, C) Utterson first hearing the story of the trampled child, D) Lanyon reading Jekyll's letter
   * **Correct:** B
   * **Feedback:** ✓ Correct. Once Jekyll changes into Hyde without the potion, he can no longer choose to stay himself; from that point his destruction is only a matter of time. That involuntary change is the irreversible turning point.
   * **Why A:** Mixing the potion is the tempting first step; nothing is yet irreversible — Jekyll could still stop.
   * **Why C:** The trampled child is an early warning sign of Hyde's cruelty, a symptom that the fall is beginning — not the point at which it becomes unstoppable.
   * **Why D:** Lanyon's letter reveals the truth to others; it is a *consequence* of the collapse, not the moment that made it inevitable.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Jekyll and Hyde the later disasters follow by cause-and-effect from Jekyll's first choice to take the potion — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Gothic tragic plot is built on necessity, not mere sequence: the murder, the involuntary changes and Jekyll's death are all *because of* the first indulgence. That causal spine is what makes the plot an arc, not a list of happenings.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — each disaster grows directly out of Jekyll's decision to free his darker self.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Jekyll concludes that "man is not truly one, but truly two". What does this reveal about the novella's view of human nature?
   * **Options:** A) That people are simple and single-minded, B) That every person contains two natures — a civilised self and a hidden, savage one — bound together in one body, C) That only wicked men like Hyde have a dark side, D) That human nature does not really matter to the story
   * **Correct:** B
   * **Feedback:** ✓ Correct. The claim is the novella's whole argument: each person houses two selves, good and evil together, and the tragedy comes from trying to split them apart.
   * **Why A:** The line insists on the opposite — that we are double, not single.
   * **Why C:** The point is universal — the dark self lives in the respectable Jekyll, and by implication in everyone, not only in obvious villains.
   * **Why D:** This idea of the divided self is the controlling theme, not a background detail.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Utterson lives by the rule "the more it looks like Queer Street, the less I ask". Which controlling idea does this announce?
   * **Options:** A) That Victorian respectability depends on looking away — appearances are protected by silence, so evil hides beneath a proper surface, B) That Utterson is simply a lazy lawyer, C) That the streets of London are dangerous at night, D) That gossip is always harmless
   * **Correct:** A
   * **Feedback:** ✓ Correct. Utterson's principle dramatises the theme of respectability and repression: a society that refuses to ask questions lets hidden evil flourish behind a clean facade — exactly how Jekyll conceals Hyde.
   * **Why B:** It is not personal laziness but a social code of discretion that shields reputation — the point is thematic, not a character flaw.
   * **Why C:** The line is about moral silence and concealment, not literal street danger.
   * **Why D:** The novella shows the opposite — looking away is what lets real evil grow unchecked.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Through Jekyll's experiment, which idea about science does the novella most explore — and how does it *work*?
   * **Options:** A) That science is always harmless and should be pursued without limit, B) That meddling with nature and the self can release forces beyond human control — knowledge without moral restraint destroys its maker, C) That science has no place in society at all, D) That only chemists are dangerous people
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jekyll's potion frees a self he cannot cage again; the theme works by showing overreaching, unrestrained science unleashing a horror that consumes the very man who pursued it.
   * **Why A:** The story warns against limitless experiment, not for it — the potion brings catastrophe, not benefit.
   * **Why C:** The novella criticises reckless overreach, not the existence of science itself.
   * **Why D:** The danger lies in dividing and indulging the self without restraint, not in a profession.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Jekyll and Hyde, good and evil are shown to coexist in every person — the potion does not create Hyde but merely separates a darkness that was already within Jekyll.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Hyde is not manufactured from nothing; he is the evil already present in Jekyll, set loose. The theme is that the savage self lives inside the respectable man, waiting.
   * **WhyWrong:** The potion separates rather than creates — Hyde is the darkness already within Jekyll, which is exactly why the divided-self theme is so unsettling.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Jekyll and Hyde is a Gothic novella. Why do we feel *dread and horror* at Hyde, rather than simple curiosity?
   * **Options:** A) Because he is a monster from another world with magical powers, B) Because he is the evil hidden inside a respectable, ordinary man — so his horror suggests the same darkness could lurk in anyone, C) Because the language used to describe him is a metaphor, D) Because we find his crimes amusing
   * **Correct:** B
   * **Feedback:** ✓ Correct. Gothic dread here is dread at what lies *within*: Hyde horrifies because he is not an outside monster but Jekyll's own concealed self, warning that respectable people — ourselves included — may harbour the same beast.
   * **Why A:** The horror is not fantasy magic but the far closer fear that the monster grows within an ordinary man.
   * **Why C:** Naming a device ("metaphor") describes technique, not the *feeling*; the effect is dread, not a label.
   * **Why D:** Amusement belongs to comedy; the crimes are meant to disturb and frighten, not entertain.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A Gothic tale such as Jekyll and Hyde is designed to make the reader feel — above all — which response?
   * **Options:** A) Delight and warm reassurance, B) Dread, horror and unease at the darkness hidden beneath a respectable surface, C) Boredom and confusion, D) Admiration for Hyde's cleverness
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Gothic mode exists to arouse dread and moral unease — here, disquiet that evil hides inside respectable men and could hide in anyone. That fearful disturbance is the effect the whole novella is built to produce.
   * **Why A:** Delight and reassurance belong to comedy; a Gothic tale that merely comforted us would fail its purpose.
   * **Why C:** Boredom marks a *failed* Gothic, not its aim; the intent is gripping dread.
   * **Why D:** We may note Hyde's menace, but the intended response is horror and unease, not admiration for cleverness.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel a creeping *unease* about Hyde rather than straightforward disgust?
   * **Options:** A) Because he is a stranger with no connection to anyone we care about, B) Because he is part of Jekyll — of a respectable man like us — so his evil implicates ordinary human nature, including our own, C) Because his crimes are too small to matter, D) Because we are frightened only of the London fog itself
   * **Correct:** B
   * **Feedback:** ✓ Correct. The deepest Gothic unease is self-implicating: Hyde disturbs because he is not a separate villain but the disowned half of a decent man, so his evil whispers that the same darkness sits within us.
   * **Why A:** The unease comes precisely from his closeness to Jekyll — and to us — not from distance.
   * **Why C:** His crimes (trampling a child, murdering Sir Danvers Carew) are appalling, not trivial; disgust deepens into dread because of *who* he is.
   * **Why D:** The fog sets atmosphere, but the true unease is moral — the beast within the respectable man, not the weather itself.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novella we are meant to feel dread and moral disturbance — unease that evil hides within respectable men, and even within ourselves — rather than comfort or amusement.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That disturbed, fearful feeling — horror at the beast concealed in the respectable Jekyll, and the fear that it dwells in everyone — is the emotional effect a Gothic tale is built to produce.
   * **WhyWrong:** The intended effect is dread and moral unease, not comfort or amusement; the ending leaves us disturbed by the evil within, not reassured.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novella's overall *message* about human nature?
   * **Options:** A) That people are wholly good and evil comes only from outside, B) That every person harbours both good and evil, and that trying to sever or deny the darker self only gives it greater power, C) That science can perfect human beings, D) That reputation is the only thing that truly matters
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jekyll's ruin argues that the two selves cannot be safely split: deny or indulge the dark half and it grows until it consumes you — the enduring "so what" about the divided nature in everyone.
   * **Why A:** The novella locates evil *within*, in the respectable Jekyll, not in an outside force.
   * **Why C:** The experiment to purify the self ends in catastrophe — the reverse of the message.
   * **Why D:** The story exposes reputation as a hollow mask that conceals and enables evil, not as what matters most.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring warning does the novella give about science and overreaching?
   * **Options:** A) That scientific knowledge is always safe to pursue, B) That knowledge pursued without moral restraint can release forces that destroy their creator, C) That scientists should be admired whatever they do, D) That curiosity is never dangerous
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jekyll frees a self he cannot recapture; the message is that overreaching science, cut loose from conscience, unleashes a horror that consumes the very man who sought it.
   * **Why A:** The novella dramatises the danger of unrestrained science, not its safety.
   * **Why C:** Jekyll's overreach is presented as a fatal error, not something to admire.
   * **Why D:** Jekyll's curiosity is precisely what destroys him — the warning is that it can be perilous.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novella's lasting messages is that you cannot cut away the darker half of yourself — denying or disowning it only lets it grow stronger, until it takes control.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Jekyll tries to separate and disown his evil self, yet Hyde only strengthens until he dominates — affirming that the dark half cannot be severed, only acknowledged and restrained.
   * **WhyWrong:** The novella insists the dark self cannot be cut away; Jekyll's attempt to disown it is exactly what gives Hyde his growing power.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novella suggest about Victorian respectability and the hiding of one's private self?
   * **Options:** A) That a respectable public reputation should be protected at any cost, B) That a society obsessed with respectable appearances forces its darker desires into secrecy, where — unacknowledged — they fester and grow monstrous, C) That appearances always match reality, D) That respectable gentlemen have no hidden desires
   * **Correct:** B
   * **Feedback:** ✓ Correct. Jekyll hides Hyde to protect his good name, and the very concealment lets his darker self run unchecked; the message is that a culture of respectable surfaces breeds, rather than cures, the evil it refuses to see.
   * **Why A:** The novella shows this instinct to be dangerous — protecting reputation is exactly what lets Hyde flourish in secret.
   * **Why C:** The whole story turns on the gap between respectable surface and hidden evil — appearances deceive.
   * **Why D:** Jekyll, the model of respectability, harbours Hyde — the point is that the respectable conceal such desires, not that they lack them.
