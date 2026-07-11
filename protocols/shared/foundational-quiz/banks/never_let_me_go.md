# Foundational Quiz Bank — Never Let Me Go

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *Never Let Me Go* is a **dystopia** → the `effects` aspect tests the reader's **fear-as-warning,
unease and disquiet at complicity**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`never_let_me_go.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Never Let Me Go

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Kathy *changes* across the novel — and what drives the change?
   * **Options:** A) She is a rebel from the start who is finally crushed into silence, B) She moves from a sheltered Hailsham child who half-understands her fate to a carer who fully knows it — yet chooses to face it through memory and love rather than resistance, C) She never changes at all — she is exactly the same person at the close as at the start, D) She is transformed entirely by forces outside her, with no choice of her own in what she becomes
   * **Correct:** B
   * **Feedback:** ✓ Correct. Kathy's arc is inward and quiet: from innocence to full knowledge of her purpose — and her defining response is her *own* choice to make meaning through remembering and loving, not to run.
   * **Why A:** Kathy is never a rebel; her characteristic is acceptance, so "crushed into silence" mistakes her whole disposition.
   * **Why C:** She does change — she grows from not-quite-understanding to complete knowledge; treating her as static erases the evolution.
   * **Why D:** Her calm is partly conditioned, but she actively chooses memory and love as her answer to her fate — removing that choice turns her into a mere puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Kathy a *tragic* protagonist rather than simply a passive victim?
   * **Options:** A) She is wholly powerless and does nothing that is truly her own, B) Though she cannot escape her fate, she meets it with a dignity she chooses — preserving love and memory — so her quiet acceptance moves us rather than merely appals us, C) She single-handedly overthrows the system, D) She feels nothing at all and so cannot be pitied
   * **Correct:** B
   * **Feedback:** ✓ Correct. The pathos lies between helplessness and heroism: Kathy cannot change her end, but *how* she meets it — with remembered love and gentle care — is genuinely hers, and that is why she moves us.
   * **Why A:** Reading her as wholly powerless misses the one thing that is hers — the chosen dignity of memory and love within an unchosen fate.
   * **Why C:** She never overthrows anything; the novel's disquiet comes precisely from the *absence* of rebellion.
   * **Why D:** Kathy feels deeply — her longing and grief are the heart of the book; the pathos depends on that inner life.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Kathy's evolution from beginning to end?
   * **Options:** A) A carefree child at Hailsham → a violent escapee at the close, B) A sheltered Hailsham pupil who barely grasps her purpose → a knowing "carer" of over eleven years who accepts her coming "completion" and holds her life together through memory, C) A guardian at the start → a free citizen at the end, D) A cruel bully at the start → a kind stranger at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from partial innocence to full knowledge — the same gentle person, now understanding everything — and answers that knowledge with remembrance, not flight. That inward arc is the novel's quiet tragedy.
   * **Why A:** She never escapes; the disturbing truth is that she submits, so "violent escapee" reverses her actual arc.
   * **Why C:** Kathy is a clone raised to donate, never a guardian, and she is never free — this confuses who she is.
   * **Why D:** Kathy is not a bully turned kind; her constancy of feeling, deepening into full knowledge, is the point.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Kathy's development is not a rebellion but a deepening: she moves from half-understanding her fate to fully knowing it, and her own response is to preserve dignity, love and memory rather than to resist.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Her evolution is inward — knowledge, not defiance — and the meaning she makes through remembering is genuinely her own choice, which is exactly what makes her quiet acceptance so affecting.
   * **WhyWrong:** Kathy never rebels; treating her as a fighter, or as someone who simply stays the same, both miss the real arc — a growth into full knowledge answered by chosen dignity.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the students' sheltered upbringing at Hailsham *lead to* their quiet acceptance of donation? (What is the causal link?)
   * **Options:** A) The two things are unconnected — the students would have accepted their fate whatever their upbringing, B) Hailsham raises them gently and reveals their purpose only gradually, conditioning them to see it as normal and inevitable — so acceptance, not rebellion, is what such a childhood produces, C) The guardians openly order them never to resist, D) The students accept only because they are physically imprisoned and cannot leave
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: a childhood that normalises their purpose, drip-fed through euphemism, produces adults who cannot imagine another life. The absence of rebellion is an *effect* of how they were raised.
   * **Why A:** In the novel the conditioning is precisely the cause; reading upbringing and acceptance as unconnected misses the whole design.
   * **Why C:** No one issues orders — the horror is that acceptance is grown, not commanded.
   * **Why D:** They are not locked up; they move freely to the Cottages and beyond, yet still do not run — which is what makes the conditioning, not walls, the real cause.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the guardians' collecting of the students' best art *lead to* the rumour of "deferrals"?
   * **Options:** A) The two are unrelated coincidences, B) Because the students, knowing their art was taken for a special "Gallery", reasoned that it must be used to judge their inner selves — so they inferred that a couple who could prove true love might have their donations postponed, C) Because the guardians promised deferrals in writing, D) Because selling the art funded the deferral scheme
   * **Correct:** B
   * **Feedback:** ✓ Correct. The causal chain is a chain of *inference*: art taken → a mysterious Gallery → the guess that it reads the soul → the hope that proven love earns a reprieve. The rumour grows causally out of the collecting, not by chance.
   * **Why A:** The novel ties them directly — the Gallery is the very seed from which the deferral hope germinates.
   * **Why C:** No promise is ever made; the deferral is a hope the students construct, which is why its falseness wounds so quietly.
   * **Why D:** Money is never the mechanism; the link is the students' reasoning about what the Gallery must be *for*.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the novel — not just the order of events?
   * **Options:** A) A string of unrelated episodes — school, cottages, donations — that simply happen one after another, B) A sheltered upbringing conditions the students to accept their purpose → that acceptance means no one resists → Ruth's pairing with Tommy delays Kathy and Tommy's love → Ruth's dying repentance reunites them → they seek a deferral → and learn it never existed, C) The guardians force each stage directly, so nothing follows from the students' own lives, D) Pure chance decides everything, and nothing causes anything else
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before: conditioning breeds acceptance, delay breeds lost time, repentance opens a fragile hope, and that hope is extinguished. The plot is a causal arc, not a chronicle.
   * **Why A:** The episodes are linked by cause — memory, conditioning and love thread them together; reading them as unrelated misses the arc.
   * **Why C:** The guardians set the frame, but the human drama — Ruth's jealousy, her repentance, the search — is driven by the students' own choices.
   * **Why D:** Chance is not the engine; the sorrow is that everything follows so logically from how the students were made and raised.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** The extinguishing of the deferral hope is the novel's quiet turning point: once Miss Emily explains that deferrals never existed, no possibility of escape remains, and the causal road to "completion" runs on unbroken.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That revelation is the point of no return — not a violent climax but a soft closing of the last door. Everything before builds the hope; everything after is its causal consequence: acceptance and completion.
   * **WhyWrong:** The events are not a random sequence — the discovery that deferrals were never real is the causal hinge that seals the students' fate, the tragic turning point of a dystopian arc.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The guardians gathered the students' finest art for a "Gallery" to prove they "had souls". What does this reveal about one of the novel's controlling ideas?
   * **Options:** A) That art is only worth collecting if it can be sold, B) That the novel questions what makes us human — insisting the clones have inner lives, souls and feelings, so treating them as spare parts is a moral horror, C) That the students had no real talent, D) That creativity is dangerous and should be banned
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Gallery dramatises the book's central question — are the clones fully human? — and answers it: their art proves a rich inner life, which makes the society's use of them monstrous.
   * **Why A:** The purpose is moral, not commercial — the art is evidence of a soul, not merchandise.
   * **Why C:** The point is the opposite: the depth and sensitivity of the work reveals the students' humanity.
   * **Why D:** Art is encouraged, not forbidden — precisely because it was thought to reveal the soul.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Kathy narrates the whole novel by looking back and slowly piecing together her past. Which controlling idea does this foreground?
   * **Options:** A) That memory preserves love and gives a short life its meaning, even as it cannot alter fate, B) That the past is unimportant and best forgotten, C) That Kathy is an unreliable liar, D) That the plot is meant to be confusing
   * **Correct:** A
   * **Feedback:** ✓ Correct. The novel is built from remembering: memory keeps Tommy and Hailsham alive, softens loss and shapes the self — its power to hold what time takes is one of the book's great subjects.
   * **Why B:** For Kathy the past is everything — remembering is how she keeps her losses; the novel treasures it rather than dismissing it.
   * **Why C:** Kathy is tender and honest, not a liar; the theme is memory's *value*, not its falseness.
   * **Why D:** The looping recollection mirrors how memory really works; it deepens meaning rather than sowing confusion.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The students learn to call their deaths "completion" and themselves "donors" and "carers". Which idea do these gentle words most explore?
   * **Options:** A) That soft language can normalise atrocity, letting a whole society accept the unbearable as routine, B) That the characters enjoy inventing nicknames, C) That the students do not really die, D) That vocabulary has no effect on how we think
   * **Correct:** A
   * **Feedback:** ✓ Correct. The euphemisms let characters and reader glide past horror as though it were ordinary — the novel's idea that language can make the monstrous seem normal, and so make complicity easy.
   * **Why B:** These are not playful nicknames but an institutional vocabulary that hides cruelty behind politeness.
   * **Why C:** "Completion" *is* death — softened in word only; the mildness is exactly what disturbs.
   * **Why D:** The whole point is that words shape thought — gentle language dulls resistance to an atrocity.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In *Never Let Me Go*, mortality is a central idea: the clones' shortened, appointed lives hold up a mirror to every human life, which is likewise finite and made precious by love and memory.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The students' condition intensifies a universal truth — that all lives end — so their longing for more time, and for love, speaks to the reader's own mortality.
   * **WhyWrong:** The clones' fate is not a merely alien predicament; it magnifies the ordinary human facts of death, love and the wish for more time — which is why it moves us so.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *Never Let Me Go* is a dystopia. Why does it leave us feeling *uneasy and disquieted* rather than merely sad?
   * **Options:** A) Because the world is wildly alien and could never resemble our own, B) Because the horror is normalised and the world looks like ours — so we sense, uncomfortably, that a society could accept such cruelty, and that we might be complicit in it, C) Because the story is thrilling and exciting, D) Because it ends happily and reassures us
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dystopian unease comes from recognition: an England much like our own quietly tolerating atrocity makes us fear our *own* capacity to accept the unacceptable. The disquiet is a warning turned back on the reader.
   * **Why A:** The dread depends on nearness, not distance — the world is disturbingly *like* ours, which is what unsettles.
   * **Why C:** The tone is quiet and mournful, not thrilling; the feeling is unease, not excitement.
   * **Why D:** The ending offers no reassurance — its refusal to comfort is exactly what leaves us disquieted.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A dystopia such as *Never Let Me Go* is designed, above all, to make the reader feel what?
   * **Options:** A) Delight and amusement, B) Fear as a warning — unease at a society that accepts the monstrous, and a disquieting sense of our own complicity, C) Pride and triumph, D) Curiosity about the science of cloning, and nothing more
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dystopia's purpose is admonitory: it makes us fear *for ourselves and our world*, uneasy that ordinary people — perhaps us — could let such cruelty become routine.
   * **Why A:** Delight belongs to comedy; a dystopia that merely amused us would betray its warning.
   * **Why C:** The novel offers no triumph — the students do not win, and the reader is left unsettled, not proud.
   * **Why D:** The cloning is only the vehicle; the intended effect is moral disquiet, not scientific curiosity.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why is the students' *lack of rebellion* the most disturbing feature of the novel for the reader?
   * **Options:** A) Because it is exciting to watch them plan an escape, B) Because their calm acceptance forces us to ask why no one resists — and to fear that we, too, might quietly submit to an unjust system rather than fight it, C) Because it proves the students are stupid, D) Because it means nothing bad really happens to them
   * **Correct:** B
   * **Feedback:** ✓ Correct. The unease is deepest here: their passivity mirrors our own capacity for compliance, so the absence of rebellion is a warning about how easily people accept the intolerable.
   * **Why A:** There is no escape plan; the *absence* of resistance, not its excitement, is what disturbs.
   * **Why C:** They are not stupid but conditioned — and their compliance implicates the reader, which is far more troubling than mere foolishness.
   * **Why D:** Something terrible does happen — they die; the softness of their submission makes it more harrowing, not less.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** The novel's quiet, understated tone deepens the reader's dread: because the horror is delivered so calmly and made to seem normal, we are left uneasy and disquieted, sensing a warning about complicity rather than merely feeling sad.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That is the dystopian effect: restraint and normalisation make the cruelty land as a warning, leaving the reader unsettled and implicated rather than simply moved to tears.
   * **WhyWrong:** The intended feeling is unease and fear-as-warning, not comfort or excitement; the calm normalising of atrocity is precisely what makes us uneasy about our own capacity for complicity.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about how societies treat those they deem lesser?
   * **Options:** A) That progress justifies any cruelty, so long as it benefits the majority, B) That a society which dehumanises a group for others' benefit — and normalises it through soft language and habit — commits a moral horror, and that the comfortable majority is complicit in it, C) That science should never be studied, D) That the clones deserved their fate
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ishiguro's enduring "so what" is a warning: when a people lets itself accept the unacceptable — hiding it behind gentle words — everyone who benefits shares the guilt. The novel indicts complacency, not just the system.
   * **Why A:** The book argues the *opposite* — that no benefit can justify treating human beings as spare parts.
   * **Why C:** Its target is not science itself but the moral choices a society makes about how to use it.
   * **Why D:** The clones are shown to be fully human and blameless; the message is that their treatment is unjust, not deserved.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Beyond its warning about society, what enduring idea about *human life itself* does the novel affirm?
   * **Options:** A) That life is meaningless because it ends, B) That every life is finite, yet love and memory give even a short, appointed life its meaning and worth, C) That only the powerful lives matter, D) That death can always be escaped if we try hard enough
   * **Correct:** B
   * **Feedback:** ✓ Correct. The clones' shortened lives magnify a universal truth: because all lives end, what we love and remember is what makes them matter — the novel affirms meaning within mortality, not despite of it.
   * **Why A:** The novel resists nihilism — Kathy's remembered love shows that a life's brevity does not empty it of meaning.
   * **Why C:** It insists the opposite — the "lesser", powerless clones have lives as full and valuable as anyone's.
   * **Why D:** No one escapes death here; the message is about meaning *within* mortality, not conquering it.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is a warning about complicity: it is not only those who run the system but the comfortable majority who benefit from it — and who look away — that the book holds morally responsible.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The disquiet is directed outward at society and at the reader: a world that accepts atrocity for its own gain is indicted, and quiet complicity is shown to be its own kind of guilt.
   * **WhyWrong:** The message reaches beyond the guardians to the whole society — and the reader — that permits and profits from the cruelty; complacency, the novel warns, is not innocence.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The students are conditioned to accept their fate through gentle euphemism and sheltered habit. What warning does the novel draw from this?
   * **Options:** A) That kindness in education is always harmful, B) That soft language and gradual habit can make people accept even the monstrous as normal — so we must stay alert to how "civilised" surfaces can hide, and enable, great cruelty, C) That the students should have been told nothing at all, D) That rules and institutions are always good
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's admonition is about how atrocity is normalised: through mild words and slow habituation until no one questions it — a warning to remain vigilant against the comfortable acceptance of injustice.
   * **Why A:** The target is not kindness but the way gentleness can be *used* to dull resistance to cruelty.
   * **Why C:** The problem is not information but conditioning — the students are managed into acceptance, which is what the novel warns against.
   * **Why D:** The book is a caution about how institutions can normalise the unconscionable — the reverse of trusting them blindly.
