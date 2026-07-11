# Foundational Quiz Bank — The War of the Worlds

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION.
Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL CONCEPT of its
aspect, not surface trivia. Distractors are plausible CONCEPTUAL MISREADINGS. *The War of the Worlds*
is early **science fiction / invasion narrative** → the `effects` aspect tests the reader's **dread and
fear-as-warning** (cosmic terror + the disquieting recognition that the imperial nation is made prey),
not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`.

### Quiz: The War of the Worlds

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how the narrator *changes* across the novel — and what drives the change?
   * **Options:** A) He stays a calm, confident scientist who is never shaken, B) He begins a rational Victorian who trusts in human progress and ends a humbled survivor who has grasped humanity's fragility — driven by witnessing how helpless mankind truly is, C) He becomes a heroic soldier who leads the fightback, D) He turns into one of the Martians
   * **Correct:** B
   * **Feedback:** ✓ Correct. The narrator's journey is inward: from complacent faith in human supremacy to a shaken humility. The invasion does not make him a hero — it strips away his certainty.
   * **Why A:** He is deeply shaken; the whole point is the collapse of his Victorian confidence.
   * **Why C:** He is a passive survivor, not a soldier — humanity never wins by force.
   * **Why D:** He remains human throughout; his change is one of understanding, not transformation.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Why does it matter that the narrator is an ordinary man rather than a hero?
   * **Options:** A) Because his ordinariness makes his terror and helplessness feel like ours — we experience the invasion through someone "like us", B) Because he is secretly the strongest man in England, C) Because he single-handedly defeats the Martians, D) Because he is a Martian in disguise
   * **Correct:** A
   * **Feedback:** ✓ Correct. Wells makes the narrator a reflective everyman so the reader shares his fear directly — the horror lands because it could be any of us.
   * **Why B:** He has no special power; his helplessness is the point.
   * **Why C:** No human defeats the Martians — they are killed by bacteria, not by heroism.
   * **Why D:** He is a human observer throughout; his ordinariness is essential to the effect.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows the narrator's evolution from beginning to end?
   * **Options:** A) A frightened coward at the start → a fearless conqueror at the end, B) A detached observer confident in human progress at the start → a chastened survivor who knows mankind is not "the master" at the end, C) A Martian at the start → a human at the end, D) A soldier at the start → a scientist at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from Victorian assurance to humbled awareness — the same man, his certainties shattered by what he has seen.
   * **Why A:** He is not a coward at the start nor a conqueror at the end; his change is in understanding.
   * **Why C:** He is human throughout.
   * **Why D:** His arc is a loss of confidence, not a change of profession.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** The narrator's transformation is driven by his own experience of helplessness — he survives the invasion, but he does not defeat the Martians.
   * **Answer:** True
   * **Feedback:** ✓ Correct. His change is earned through witnessing devastation, not through triumph; survival, not victory, is what humbles him.
   * **WhyWrong:** He never overcomes the Martians by his own action — humanity's helplessness, not heroism, is what changes him.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does humanity's military resistance *fail* to stop the Martians? (What is the causal point?)
   * **Options:** A) The soldiers simply did not try hard enough, B) The Martians' technology is so far beyond human weapons that force is futile — human power is shown to be irrelevant, C) The Martians agreed to a truce, D) It was purely a matter of bad luck
   * **Correct:** B
   * **Feedback:** ✓ Correct. The failure is not accidental: Wells builds the plot so that every human effort is causally useless against a vastly superior force — that helplessness is the engine of the story.
   * **Why A:** The army fights hard; the point is that effort is meaningless against such power.
   * **Why C:** There is no truce — the Martians treat humanity as beneath negotiation.
   * **Why D:** The defeat follows by necessity from the gulf in power, not chance.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the invasion — not just the order of events?
   * **Options:** A) A string of unrelated disasters that happen to occur together, B) The Martians land → are underestimated as harmless → unleash overwhelming force → mankind is driven to panic and flight → and they are finally destroyed not by humans but by disease, C) Humans defeat the Martians in open battle, D) The Martians simply leave of their own accord
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows from the last — complacency invites catastrophe, and the ending turns on an irony seeded throughout: force cannot save humanity; the smallest life does.
   * **Why A:** The events form a tight causal sequence, not unconnected mishaps.
   * **Why C:** Humanity never wins a battle; that misreads the whole plot.
   * **Why D:** The Martians do not choose to leave — they die.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** What finally destroys the Martians — the great irony on which the plot turns?
   * **Options:** A) The British army's artillery, B) Earthly bacteria — "the humblest things" — to which humans are immune but the Martians are not, C) The narrator's own courage, D) A secret human weapon
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Martians are "slain, after all man's devices had failed, by the humblest things that God... has put upon this earth." Humanity is saved by nature, not by its own power — the plot's central irony.
   * **Why A:** Human weapons fail utterly; the artillery cannot stop them.
   * **Why C:** No individual defeats them; the narrator merely survives.
   * **Why D:** There is no human weapon that works — that is precisely the point.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** The Martians are defeated not by human strength but by the smallest organisms on Earth — an ironic reversal of humanity's assumed supremacy.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The bacteria succeed where every army failed; the causal irony humbles humanity's pride in its own power.
   * **WhyWrong:** Humanity does not save itself — it is the microbes, "the humblest things", that kill the Martians, overturning our assumed mastery.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The narrator reflects that "before we judge of them too harshly we must remember what ruthless and utter destruction our own species has wrought". What idea does this reveal?
   * **Options:** A) That the Martians are simply misunderstood friends, B) That the invasion mirrors human imperialism — the coloniser is now the colonised, and Wells turns our own cruelty back on us, C) That war is always exciting, D) That the British were blameless victims
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wells makes the mighty empire the prey, holding a mirror to imperial conquest: what the Martians do to Britain is what Britain did to others.
   * **Why A:** The Martians are ruthless; the line is not about friendship but about our own guilt.
   * **Why C:** It is a sober moral reflection on cruelty, not a celebration of war.
   * **Why D:** The whole point is that the "victims" are themselves conquerors being judged.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The Martians regard Earth with "intellects vast and cool and unsympathetic". What does this reveal about the theme of human insignificance?
   * **Options:** A) That humanity is the pinnacle of creation, B) That a higher intelligence can regard mankind as we regard the "beasts that perish" — humanity is not the centre of the universe, C) That the Martians admire human achievement, D) That intelligence always brings kindness
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wells dethrones humanity: to a superior mind we are as insects, and our sense of our own importance is exposed as vanity.
   * **Why A:** The novel argues the opposite — humanity is dethroned, not supreme.
   * **Why C:** The Martians are "unsympathetic"; they do not admire us, they use us.
   * **Why D:** Their vast intellect is "cool and unsympathetic" — intelligence here brings no mercy.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Which idea does the novel most explore about Victorian confidence in science, progress and empire?
   * **Options:** A) That such confidence is fully justified and rewarded, B) That it is complacent and fragile — nature and the cosmos are indifferent to human pride, C) That science is evil and should be abandoned, D) That the Victorians were too modest
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wells punctures the age's faith in its own supremacy: progress and empire offer no protection against a universe that does not care.
   * **Why A:** The invasion shatters that confidence rather than rewarding it.
   * **Why C:** The novel questions arrogance about science, not science itself.
   * **Why D:** The Victorians are shown as over-confident, not modest.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The novel draws on ideas of natural selection and "survival of the fittest" to suggest that humanity's dominance is not guaranteed.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Wells, writing after Darwin, imagines a fitter species preying on humanity — a reminder that we hold no permanent place at the top.
   * **WhyWrong:** The novel uses evolutionary struggle to unsettle human supremacy — a fitter species can make prey of us, so our dominance is not secure.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** *The War of the Worlds* is science fiction built on dread. Why does the novel make us feel *fear* as the Martians advance?
   * **Options:** A) Because we are worried the narrator will lose his job, B) Because a vast, cold, unstoppable intelligence treats humanity as insignificant — the terror is of utter helplessness before something far greater, C) Because the story is comic and light, D) We feel no fear, only boredom
   * **Correct:** B
   * **Feedback:** ✓ Correct. The dread comes from powerlessness: an indifferent, superior force against which nothing we do matters. That helplessness is the intended emotional effect.
   * **Why A:** The fear is existential, not a trivial worry.
   * **Why C:** The tone is one of terror and awe, not comedy.
   * **Why D:** The novel is designed precisely to disturb and frighten.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Beyond fear of the aliens themselves, what deeper unease is the novel designed to provoke?
   * **Options:** A) The comforting feeling that humans always win, B) The disquieting recognition that WE could be the prey — the imperial nation made helpless — a warning that our own arrogance leaves us exposed, C) Amusement at clever gadgets, D) Pride in British power
   * **Correct:** B
   * **Feedback:** ✓ Correct. The lasting effect is a turning of the mirror: the fear is not only of Martians but of what we ourselves are, and how easily the conqueror becomes the conquered.
   * **Why A:** The novel denies that comfort — humanity does not win by its own power.
   * **Why C:** The response aimed for is dread and unease, not amusement.
   * **Why D:** It humbles British pride rather than flattering it.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why is the Martians' *indifference* more frightening than open cruelty would be?
   * **Options:** A) Because indifference is always gentle, B) Because being regarded as "beasts that perish" reduces humanity to insignificance — cold unconcern denies us even the dignity of a true enemy, C) Because the Martians are secretly kind, D) Because it makes the story funnier
   * **Correct:** B
   * **Feedback:** ✓ Correct. To be hated is at least to matter; to be brushed aside by a "cool and unsympathetic" intellect is to be nothing — and that erasure of human worth is the deeper horror.
   * **Why A:** Their indifference is lethal, not gentle.
   * **Why C:** They are "unsympathetic" — the horror is their lack of kindness.
   * **Why D:** The effect is dread, not comedy.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** The novel's effect is not mere excitement but a disquieting dread — a warning that humanity's confidence in its own supremacy is dangerously misplaced.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Wells aims past thrill at unease: we are left frightened for our species and for our pride, not merely entertained.
   * **WhyWrong:** The intended effect is dread and warning, not simple excitement — the fear is meant to make us question human arrogance.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about human arrogance and empire?
   * **Options:** A) That humanity's supremacy is secure and deserved, B) That mankind's complacent belief in its own mastery — and the imperial cruelty that flows from it — is fragile and self-condemning; we are not the masters we imagine, C) That science should be worshipped, D) That the strong are always right
   * **Correct:** B
   * **Feedback:** ✓ Correct. Wells warns against pride: the empire that dominates others is shown how it feels to be dominated, and human mastery is exposed as an illusion.
   * **Why A:** The invasion demolishes any idea of secure supremacy.
   * **Why C:** The novel questions blind faith in progress, not calls for worship of it.
   * **Why D:** It condemns the arrogance of the strong rather than endorsing it.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the ending — humanity saved by bacteria, not by its own power — ultimately suggest?
   * **Options:** A) That human ingenuity triumphed after all, B) That human pride is humbled: survival owes nothing to our supposed superiority — nature, not human mastery, decides, C) That the Martians were never a real threat, D) That Britain's army won the war
   * **Correct:** B
   * **Feedback:** ✓ Correct. Deliverance comes from "the humblest things", not from human greatness — a final humbling that denies mankind the credit for its own survival.
   * **Why A:** Human ingenuity failed entirely; microbes, not ingenuity, prevailed.
   * **Why C:** The Martians devastate everything — the threat is overwhelming.
   * **Why D:** The army is defeated; it wins nothing.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** By making the mighty British Empire the victim of a superior invader, Wells holds a mirror to imperialism — suggesting the conquerors should judge themselves as they judge others.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The novel's political sting is this reversal: the coloniser becomes the colonised, and Britain is asked to see its own conquests in the Martians' ruthlessness.
   * **WhyWrong:** Wells deliberately turns imperial violence back on the empire — the message asks the conqueror to judge itself as harshly as it judges others.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about humanity's place in the universe does the novel affirm?
   * **Options:** A) That humanity rules creation by right, B) That mankind is small and vulnerable within an indifferent cosmos, and that arrogance blinds us to this — a call for humility, C) That the universe exists to serve human needs, D) That progress guarantees safety
   * **Correct:** B
   * **Feedback:** ✓ Correct. The lasting message is humility: we are not the centre of things, and our confidence in our own supremacy is both fragile and dangerous.
   * **Why A:** The novel dethrones humanity rather than crowning it.
   * **Why C:** The cosmos is shown to be indifferent, not made for us.
   * **Why D:** Progress offers no protection — that false security is exactly what Wells attacks.
