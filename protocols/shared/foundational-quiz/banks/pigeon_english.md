# Foundational Quiz Bank — Pigeon English

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. *Pigeon English* is a **coming-of-age novel (bildungsroman)** shadowed by tragedy → the `effects`
aspect tests the reader's **empathy, hope and poignancy** — the heartbreak of a bright young life lost —
not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`pigeon_english.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Pigeon English

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Harrison *changes* across the novel — and what drives the change?
   * **Options:** A) He is streetwise and hardened from the first page and never really changes, B) He begins a wide-eyed, hopeful newcomer to London and is drawn ever deeper into the estate's dangers — pulled there by his own curiosity, courage and longing to belong, C) He stays a carefree child, untouched by anything around him, D) He is simply moved about by adults and fate, making no choices of his own
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel's power is the *change*: a hopeful, wondering child grows into someone the estate's violence can reach — and it is partly his own curiosity and courage that carry him toward the danger, not chance alone.
   * **Why A:** He arrives fresh, hopeful and innocent, not hardened; the drama lies in how that innocence meets the world, not in fixed toughness.
   * **Why C:** He is not untouched — his encounters with violence and the gang change him; treating him as unchanged erases his coming-of-age.
   * **Why D:** He makes real choices — to investigate, to be brave, to seek belonging; removing his agency turns a growing child into a passive puppet.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Harrison a *poignant coming-of-age protagonist* rather than simply a passive victim?
   * **Options:** A) He is entirely passive and things merely happen to him, B) He is an active, hopeful child whose own curiosity, warmth and courage carry him toward the danger — so his loss feels like the waste of a bright, growing life, C) He is a hardened criminal who deserves his fate, D) He is untouched by the world and never grows at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. A coming-of-age hero acts and grows; Harrison's hope and courage are his own, so watching a child of such promise overtaken by violence moves us to grief, not indifference.
   * **Why A:** If he were wholly passive his fate would be mere misfortune; the poignancy comes from a child who reaches out and grows before the loss.
   * **Why C:** He is an innocent, curious boy, not a criminal — flattening him into someone who "deserves it" misses the whole tragedy of wasted innocence.
   * **Why D:** He does grow and change; denying that erases the "coming-of-age" that makes his story affecting.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Harrison's evolution from beginning to end?
   * **Options:** A) A cynical gang member at the start → a reformed innocent at the end, B) A hopeful, wondering newcomer who plays at being a detective → a boy drawn into real danger whom the estate's violence finally overtakes, C) A frightened recluse at the start → a fearless adult at the end, D) A wealthy outsider at the start → a poor child at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from playful, hopeful innocence — turning a killing into a detective game — to a child caught in the real violence he was chasing. That arc from wonder to loss IS the heart of the novel.
   * **Why A:** He starts innocent and hopeful, not a cynical gang member; this reverses his actual arc.
   * **Why C:** He is a curious, sociable boy throughout, not a recluse, and he remains a child — he never becomes an adult.
   * **Why D:** His family are poor immigrants from the outset; wealth is not part of his story at either end.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Harrison is not merely a passive victim — it is partly his own curiosity, courage and wish to belong that carry him toward the estate's dangers.
   * **Answer:** True
   * **Feedback:** ✓ Correct. His investigation, his bravery and his longing to fit in are his own; that agency is what turns him from a bystander into a growing child whose choices shape his fate — and what makes the loss so moving.
   * **WhyWrong:** Treating Harrison as a pure victim of chance removes the curiosity and courage that draw him into danger — the very agency that makes his coming-of-age, and its cost, matter.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the killing of the local boy *lead to* Harrison's growing danger? (What is the causal link?)
   * **Options:** A) The two are unconnected events that simply happen in sequence, B) The boy's death moves Harrison to investigate; his amateur detective game draws him ever closer to the estate's dangerous figures, until that world turns on him, C) The gang orders Harrison to solve the crime, D) Harrison is attacked at random, for reasons unconnected to anything he does
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the killing sparks Harrison's investigation, and the investigation entangles him with the very people who are dangerous — so his fate follows by cause, not coincidence.
   * **Why A:** The events are linked by cause, not mere order — "succession is not causation"; reading them as unconnected misses the thread from the killing to Harrison's danger.
   * **Why C:** No one orders Harrison to investigate; he chooses to, out of curiosity and a child's sense of justice.
   * **Why D:** What reaches Harrison is not random — it grows out of his own decision to look into the killing.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* leading to the novel's tragic end — not just the order of events?
   * **Options:** A) A string of unrelated misfortunes that strike Harrison by bad luck, B) A boy is killed → Harrison resolves to investigate → his curiosity and courage entangle him with dangerous people → that world's violence finally reaches him, C) Fate alone decides everything, and Harrison's choices count for nothing, D) The watching pigeon causes each event directly
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the one before, all originating in Harrison's choice to investigate. That causal spine — curiosity leading step by step to danger — is what makes the ending tragic rather than a mere accident.
   * **Why A:** His fate is not random misfortune; it is the outworking of his own decision to pursue the killing.
   * **Why C:** If his choices made no difference there would be no tragedy of a child drawn into danger; the arc turns on what he does.
   * **Why D:** The pigeon watches and comments but causes nothing; making it the cause erases the human causation that is Harrison's own.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that draws Harrison from safe games into real danger?
   * **Options:** A) His family's first arrival in London from Ghana, B) His decision to investigate the local boy's killing, which pulls him from harmless play into the estate's dangerous adult world, C) A school sports day where he races, D) A visit to church
   * **Correct:** B
   * **Feedback:** ✓ Correct. Choosing to investigate the killing is the pivot: it turns his detective *game* into real entanglement with dangerous people, and every later danger follows from it.
   * **Why A:** The arrival only sets the scene; nothing dangerous yet turns on it — the peril begins with his choice to investigate.
   * **Why C:** His running is a source of pride and joy, not the act that draws him into danger.
   * **Why D:** Church is part of his search for safety and meaning, not the turning point that exposes him to violence.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In *Pigeon English* the tragic ending follows by cause-and-effect from Harrison's own choice to investigate the killing — it is not just a random, unconnected event.
   * **Answer:** True
   * **Feedback:** ✓ Correct. His curiosity leads to investigation, investigation leads to entanglement, and entanglement leads the violence to him — a causal chain, not a string of unrelated happenings.
   * **WhyWrong:** Reading the ending as pure bad luck ("it just happened to him") misses the causal thread running from Harrison's curiosity to his fate — the very thing that makes the plot a tragic arc rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Harrison meets a violent world with games, jokes and wonder. What does this reveal about the novel's view of *innocence*?
   * **Options:** A) That innocence is unimportant, B) That childish innocence is precious yet painfully fragile — set against adult violence, it is both touching and terribly vulnerable, C) That children understand everything happening around them, D) That innocence keeps a child perfectly safe
   * **Correct:** B
   * **Feedback:** ✓ Correct. Harrison's playful hope collides with real danger, so his innocence feels both beautiful and heartbreakingly exposed — the novel's central idea about childhood.
   * **Why A:** His innocence is the novel's emotional core, not something unimportant.
   * **Why C:** Much of the tension comes precisely from what Harrison does *not* fully understand.
   * **Why D:** The novel shows the opposite — innocence offers no protection against the estate's violence.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** What controlling idea does the pull of the estate's gang reveal?
   * **Options:** A) That gangs offer safe, harmless fun, B) That children, longing to belong and be respected, are drawn toward real danger in a world that offers them little else, C) That no child is ever tempted by the gang, D) That belonging does not matter to the young
   * **Correct:** B
   * **Feedback:** ✓ Correct. The gang's lure dramatises how a wish to belong and be respected can pull vulnerable children toward menace — a controlling idea about youth, status and danger.
   * **Why A:** The gang world is threatening, not harmless fun.
   * **Why C:** The novel shows children very much drawn toward that world.
   * **Why D:** The longing to belong is exactly what makes the gang dangerous to the young.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Harrison constantly compares London with the Ghana he has left. Which idea does this most explore, and how does it *work*?
   * **Options:** A) That the immigrant outsider's fresh eyes expose both the wonder and the harshness of his new world, B) That geography lessons are important, C) That Ghana and London are essentially identical, D) That Harrison dislikes everyone he meets
   * **Correct:** A
   * **Feedback:** ✓ Correct. Harrison's outsider viewpoint, measuring London against Ghana, lets us see his new world afresh — its marvels and its cruelties both sharpened by a newcomer's eyes.
   * **Why B:** The comparison is about belonging and perspective, not literal geography.
   * **Why C:** The whole point is the *contrast* he feels; treating the places as identical erases the theme.
   * **Why D:** Harrison is warm and curious, not hostile; his outsider's view is affectionate as well as clear-eyed.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novel explores how a frightened child reaches for faith and superstition alike — church belief mixed with lucky charms — to try to find safety and meaning in a dangerous world.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Harrison blends Christian faith with homemade rituals and charms, dramatising a child's attempt to secure protection and sense in a world he cannot control.
   * **WhyWrong:** This is true — Harrison leans on both faith and superstition, and that reaching for safety is one of the novel's controlling ideas about childhood in a frightening world.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *Pigeon English* is a coming-of-age story shadowed by tragedy. Why do we feel such *poignant heartbreak* at Harrison's fate?
   * **Options:** A) Because we are amused by his mistakes, B) Because we have come to love a hopeful, warm-hearted child, so the loss of his bright, growing life feels like a terrible waste, C) Because we admire the cleverness of the narrative structure, D) Because we are frightened by supernatural horror
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novel makes us cherish Harrison's wonder and hope, so when violence reaches him the feeling is grief at wasted promise — the ache of innocence lost, which is the emotional purpose of the whole arc.
   * **Why A:** Amusement is not the aim; his childlike errors endear him to us, so that his loss wounds rather than entertains.
   * **Why C:** Admiring the *structure* names a craft response, not the *feeling* the story is built to produce — which is heartbreak for Harrison.
   * **Why D:** The dread here is human and tender, not the supernatural horror of a gothic tale.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A coming-of-age novel like *Pigeon English* is designed to make us feel, above all, which response to Harrison?
   * **Options:** A) Cold detachment, B) Empathy and hope for a growing child — deepened into poignancy by the cost he pays, C) Triumphant satisfaction at a villain's defeat, D) Disgust
   * **Correct:** B
   * **Feedback:** ✓ Correct. The genre invites us to grow close to a child, to hope for him, and then to feel the poignancy of what that hope costs — empathy sharpened into heartbreak is the intended effect.
   * **Why A:** Detachment is the mark of a *failed* coming-of-age story; this novel works by drawing us near.
   * **Why C:** Harrison is no villain — triumph at a defeat belongs to a different kind of story and misreads the feeling entirely.
   * **Why D:** We are moved to love and grieve for Harrison, not to feel disgust.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does Harrison's warm, hopeful narration make his story so affecting?
   * **Options:** A) Because his slang is simply the name of a clever technique, B) Because his wonder and optimism make us care for him deeply — so the danger closing around him fills us with tender dread on his behalf, C) Because we feel nothing for him at all, D) Because we are meant to laugh at how little he understands
   * **Correct:** B
   * **Feedback:** ✓ Correct. Living inside Harrison's hopeful voice makes us love him, so the peril we can see gathering around him — that he cannot fully see — fills us with anxious tenderness. The feeling, not the device, is the point.
   * **Why A:** Naming the slang as "a technique" describes the craft, not the *feeling* it creates — which is our deep care for Harrison.
   * **Why C:** The whole effect depends on our caring intensely; feeling nothing would mean the novel had failed.
   * **Why D:** We are moved to love, not to mock him; laughing *at* him misreads the tender emotion the voice creates.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the novel's close we are meant to feel empathy and grief — moved by the waste of a hopeful child's life — not amused or merely satisfied.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — deep affection for Harrison and heartbreak at his loss — is the emotional effect a coming-of-age tragedy is built to produce, leaving us moved rather than entertained.
   * **WhyWrong:** The intended effect is poignant empathy and grief, not amusement or triumph; the ending is meant to break our hearts for a wasted young life, not satisfy us.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about childhood and the world Harrison lives in?
   * **Options:** A) That children are safe and the world is kind, B) That a child's innocence and hope are precious yet tragically vulnerable in a world of poverty and violence — and that such young lives are too easily and wastefully lost, C) That violence has no real victims, D) That ambition is the highest virtue
   * **Correct:** B
   * **Feedback:** ✓ Correct. Harrison's brightness set against the estate's danger is the novel's whole argument: innocence and hope are precious, terribly exposed, and their loss is a waste that should trouble us — the enduring "so what".
   * **Why A:** The novel dramatises the opposite — a hopeful child is not kept safe by a kind world.
   * **Why C:** The loss of Harrison is the novel's devastating point; it insists violence has real, grievable victims.
   * **Why D:** The book is not about ambition; it is about the vulnerability of a hopeful child.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel suggest about the society that surrounds Harrison?
   * **Options:** A) That it reliably protects its most hopeful children, B) That it fails its vulnerable young — leaving children exposed to violence a caring world should have shielded them from, C) That the estate is a safe and nurturing place, D) That no adult bears any responsibility because everything is simply fate
   * **Correct:** B
   * **Feedback:** ✓ Correct. Grounded in the real death of a schoolboy, the novel indicts a society that lets poverty and violence reach its children — a failure of protection that its ending forces us to confront.
   * **Why A:** The novel shows the reverse: the world does *not* keep Harrison safe.
   * **Why C:** The estate is menacing and deprived, not nurturing.
   * **Why D:** Blaming "fate" deflects the novel's real charge — that a society's failures, not destiny, expose its children to harm.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that the loss of a hopeful young life is a waste that should trouble us — an indictment of a world that lets such violence reach its children.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Rooted in a real tragedy, the novel makes Harrison's loss impossible to shrug off, insisting that a society which fails to protect its most hopeful young has something to answer for.
   * **WhyWrong:** The novel does not treat Harrison's death as an inevitable or minor event — it presents it as a grievous waste and a moral indictment, and that charge is central to its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human experience does the ending affirm through Harrison's fresh, outsider's eyes?
   * **Options:** A) That we should feel nothing for strangers, B) That every child's inner life is rich and precious, so seeing the world through Harrison's hopeful eyes makes his loss — and all such losses — impossible to ignore, C) That immigrants do not belong, D) That children's viewpoints are worthless
   * **Correct:** B
   * **Feedback:** ✓ Correct. By living inside a hopeful child's mind, the novel affirms that every such life is precious and particular — so his loss stands for all the young lives a hard world wastes, and demands our attention.
   * **Why A:** The novel's whole method — making us love an outsider child — insists we *should* feel for those we might otherwise overlook.
   * **Why C:** Harrison's warmth and wonder argue for his belonging and humanity, not against it.
   * **Why D:** The novel gives a child's viewpoint enormous value; dismissing it inverts the book's central affirmation.
