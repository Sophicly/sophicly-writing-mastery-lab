# Foundational Quiz Bank — Animal Farm

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Animal Farm is a **dystopia** (an allegorical political fable) → the `effects` aspect tests the
reader's **fear-as-warning, unease and disquiet at complicity**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`animal_farm.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Animal Farm

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Napoleon *changes* across the novel — and what drives the change?
   * **Options:** A) He is a scheming tyrant from the first page and never really changes, B) He begins as one revolutionary pig among equals and becomes an absolute tyrant indistinguishable from the humans — driven by his own hunger to seize and hoard power, C) He stays a fair and equal leader throughout and is simply misunderstood, D) The other animals force him to take total control against his will
   * **Correct:** B
   * **Feedback:** ✓ Correct. The warning lies in the *change*: a comrade who helped overthrow the tyrant becomes the tyrant — and the engine of that fall is his own choice to grab power, not necessity or accident.
   * **Why A:** At the start he shares the revolution's ideals of equality; the horror is his transformation, not fixed villainy.
   * **Why C:** He does not stay fair — he hoards the milk and apples, rules by force, and betrays every ideal; the change is real.
   * **Why D:** No one forces him — he secretly rears the dogs and seizes power himself; removing his agency misses why the corruption is his own doing.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Napoleon's transformation a genuine *betrayal* rather than a mere failure of leadership?
   * **Options:** A) He was always openly evil, so nothing is betrayed, B) He was a leader of a revolution *for* equality who then chose to become the very oppressor it overthrew — the ideal is betrayed by his own hand, C) He is entirely innocent and the humans are to blame for everything, D) He simply lacks the skill to run a farm well
   * **Correct:** B
   * **Feedback:** ✓ Correct. Betrayal needs a promise first broken: Napoleon rises on the vow of equality, then chooses privilege, terror and human vices — turning the revolution into what it rebelled against.
   * **Why A:** If he were openly evil from the start there would be no ideal to betray; the point is that he corrupts a real hope.
   * **Why C:** He is not innocent — the purges, the lies and the theft are his; the tyranny is home-grown, not imposed by humans.
   * **Why D:** It is not incompetence but a deliberate slide into privilege and cruelty — a moral betrayal, not a lack of skill.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Napoleon's evolution from beginning to end?
   * **Options:** A) A cruel outsider at the start → a beloved liberator at the end, B) A "comrade" pig who helps overthrow Mr Jones under the vow that "All animals are equal" → a whip-carrying, two-legged master toasting with humans, "more equal than others", C) A powerless follower at the start → a humble servant at the end, D) A human farmer at the start → an animal at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from equal comrade to indistinguishable oppressor — the same figure, hollowed of every ideal by his own choices. That arc IS the dystopian warning.
   * **Why A:** He is *inside* the revolution at the start and a hated master at the end — this reverses his actual arc.
   * **Why C:** He gains total power, not humility; he ends ruling by fear, not serving.
   * **Why D:** Napoleon is a pig throughout; the point is that he comes to *resemble* the humans, not that he was ever one.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Napoleon's rise to tyranny is driven above all by his own choice to seize and hoard power — the revolution did not force him to become an oppressor.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The revolution offered a path to shared power; Napoleon *chose* the milk and apples, the private dogs and the purges. His agency is what turns a hopeful rebellion into tyranny.
   * **WhyWrong:** Nothing compelled him — he rears the dogs in secret, expels his rival and rewrites the rules by his own decision. Treating him as a helpless product of events removes the choice that makes the corruption his.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the pigs' quiet seizure of the milk and apples *lead to* the farm's eventual tyranny? (What is the causal link?)
   * **Options:** A) The two things are unconnected events that simply happen in order, B) Taking the milk and apples establishes an unchallenged privilege for the pigs — once inequality is accepted without protest, each further seizure of power meets no resistance, C) The other animals vote to give the pigs everything, D) The milk and apples make the pigs physically stronger than everyone else
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the first unopposed privilege sets the precedent, and every later abuse — dogs, purges, trade, two legs — follows because the principle of equality has already been quietly surrendered.
   * **Why A:** In a dystopian fable events follow by cause, not mere sequence; reading them as unconnected misses how one small surrender enables the rest.
   * **Why C:** The animals do not freely vote it away — the pigs take it and use Squealer's lies to silence protest.
   * **Why D:** The corruption is political, not physical strength — it is the *acceptance* of privilege that opens the door.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the revolution's degeneration — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the farm by bad luck, B) Old Major's vision inspires rebellion → the animals overthrow Jones → the pigs take the leadership and the milk → Napoleon rears dogs and expels Snowball → propaganda rewrites the commandments → terror silences dissent → the pigs become human, C) The humans secretly cause every disaster from outside, so the pigs are blameless, D) Fate alone decides the farm's ruin, and the pigs' choices make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in the pigs' first grab for privilege. That is the dystopian arc: an ideal betrayed step by step until it becomes its opposite.
   * **Why A:** The ruin is not random misfortune — it is the logical outworking of the pigs' seizure of power.
   * **Why C:** The tyranny is home-grown; blaming outside humans erases the internal betrayal the novel is about.
   * **Why D:** If choice made no difference there would be no warning; the whole arc turns on the pigs' decisions and the animals' failure to resist.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes the pigs' tyranny unstoppable — the point of no return?
   * **Options:** A) Old Major's speech about rebellion, B) Napoleon unleashing his secretly reared dogs to drive out Snowball, C) The animals renaming the farm "Animal Farm", D) The final scene where the animals cannot tell pigs from men
   * **Correct:** B
   * **Feedback:** ✓ Correct. Setting the dogs on Snowball is the irreversible act: debate is replaced by force, all rivalry is crushed, and from that moment Napoleon rules unopposed. Everything after follows from it.
   * **Why A:** Old Major's speech sparks hope; nothing is yet lost — the revolution could still keep its ideals.
   * **Why C:** Renaming the farm is the hopeful beginning, not the seizure of power that dooms it.
   * **Why D:** The pigs-and-men scene is the *result* — the completed betrayal — not the turning point that made it inevitable.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Animal Farm the later disasters follow by cause-and-effect from the pigs' first seizure of privilege — they are not just a string of unconnected misfortunes.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: each abuse is possible *because* the last went unchallenged, all rooted in the pigs' first unopposed grab for the milk and apples. That causal spine is the warning.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the very thing that makes the novel a warning about how one surrender enables the next, not a random chronicle of bad luck.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The commandment is finally rewritten as "All animals are equal, but some animals are more equal than others." What does this reveal about the novel's view of equality?
   * **Options:** A) That equality is always achieved once the old rulers are overthrown, B) That the ideal of equality is hollowed out and betrayed — turned into a cover that justifies a new privileged class, C) That the animals never wanted equality at all, D) That equality matters only to the humans
   * **Correct:** B
   * **Feedback:** ✓ Correct. The self-contradicting phrase is the novel's whole argument about equality: proclaimed, then quietly emptied of meaning so the powerful can rule while still claiming the ideal.
   * **Why A:** Overthrowing Jones does *not* secure equality — the pigs simply become the new masters; that is the point.
   * **Why C:** The animals genuinely believed in equality; it is stolen from them, not something they never wanted.
   * **Why D:** The betrayed ideal is the animals' own — the theme is how *their* equality is corrupted from within.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The sheep endlessly bleat "Four legs good, two legs bad." Which controlling idea does this most explore, and how does it *work*?
   * **Options:** A) That simple slogans and propaganda can replace real thought — a chant drowns out debate and keeps the animals from questioning the pigs, B) That the animals enjoy singing together, C) That the farm needs rules about walking, D) That the sheep are the cleverest animals
   * **Correct:** A
   * **Feedback:** ✓ Correct. The reduced slogan works by making thought impossible: an easy chant crowds out reasoning, so the animals cannot hold on to arguments long enough to challenge the pigs. Control of language becomes control of minds.
   * **Why B:** The chant is not harmless song — it is a tool that silences dissent by drowning it out.
   * **Why C:** It is political control disguised as a maxim, not a practical rule about movement.
   * **Why D:** The sheep repeat without understanding; the slogan exploits their thoughtlessness rather than showing cleverness.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel holds power and corruption in tight relation. Which idea best describes how this theme *works* through the pigs?
   * **Options:** A) Power makes leaders wiser and kinder over time, B) Unchecked power corrupts — those who seize it without accountability grow as cruel and greedy as the masters they overthrew, C) Only humans are capable of cruelty, D) The pigs were simply too weak to lead
   * **Correct:** B
   * **Feedback:** ✓ Correct. The theme works by mirroring: the pigs end up walking, drinking and exploiting exactly like Mr Jones. Power without limit does not reform the ruler — it remakes them in the image of the tyranny they replaced.
   * **Why A:** Power makes the pigs crueller, not kinder — the reverse of the theme.
   * **Why C:** The pigs prove animals are just as capable of cruelty; the theme is about power itself, not species.
   * **Why D:** It is not weakness but corruption — they rule effectively *and* ruthlessly, which is precisely the warning.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Animal Farm the corruption of language is a central theme: the Seven Commandments are repeatedly rewritten so the animals can never hold the pigs to the revolution's original promises.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Squealer, who can "turn black into white", alters the commandments overnight; because the past is rewritten, the animals lose the very words they would need to name the betrayal. Controlling language becomes controlling truth.
   * **WhyWrong:** The rewritten commandments are central, not incidental — by editing the record the pigs erase the standard the animals could have judged them by, which is exactly how the tyranny sustains itself.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Animal Farm is a dystopia. Why do we feel *unease and disquiet* — rather than triumph — at the final scene, where the animals look from pig to man and can no longer tell them apart?
   * **Options:** A) Because the humans have won a battle and we are sad for the animals' bruises, B) Because the betrayal crept in gradually, with the animals' own passive complicity — and it warns us that any revolution, or any of us, could be deceived the same way, C) Because we are frightened the pigs will use real magic, D) Because we are delighted to see order finally restored
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dystopian disquiet is *fear as warning*: the horror is how ordinary and gradual the slide was, and how the animals let it happen. The scene unsettles because it holds a mirror to our own capacity to be deceived.
   * **Why A:** The unease is not about a physical fight — it is moral dread at a betrayal completed from within.
   * **Why C:** There is no magic; the fear is human and political — how easily truth and freedom are lost.
   * **Why D:** Order is *not* restored — tyranny has come full circle; feeling delight would miss the warning entirely.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A dystopia such as Animal Farm is designed to make the reader feel, above all, which response?
   * **Options:** A) Amusement and light entertainment at talking animals, B) Fear as a warning — unease and dread that the same corruption of freedom could happen in our own world, C) Pride and patriotic triumph, D) Calm reassurance that things always turn out well
   * **Correct:** B
   * **Feedback:** ✓ Correct. Dystopia works by fear-as-warning: it carries a real tendency to its logical end so that our disquiet becomes a caution. Animal Farm leaves us anxious for the world it mirrors, not entertained.
   * **Why A:** The talking animals are a disguise for a deadly serious warning; amusement misreads the form.
   * **Why C:** There is no triumph — the revolution is betrayed; pride is the opposite of the intended dread.
   * **Why D:** Dystopia unsettles precisely to deny reassurance — its point is that things do *not* turn out well unless we stay vigilant.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *disquiet at our own complicity* as we watch the animals, rather than simple anger at the pigs?
   * **Options:** A) Because we admire how cleverly the pigs trick everyone, B) Because we recognise the animals' passivity, forgetfulness and willingness to be deceived in ourselves — their failure to question implicates the reader, C) Because we are afraid the animals will attack us, D) Because the ending is genuinely funny
   * **Correct:** B
   * **Feedback:** ✓ Correct. The deepest dystopian unease is self-implicating: the animals do not fall only because the pigs are wicked, but because they themselves stop remembering and questioning. That is a warning we cannot hold at arm's length.
   * **Why A:** Admiration for the pigs' cunning mistakes the villain's method for the intended feeling, which is dread, not delight.
   * **Why C:** The fear is not physical threat to the reader but moral warning about how freedom is lost.
   * **Why D:** The ending is bleak, not comic; laughing at it misses the disquiet it is built to produce.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of Animal Farm we are meant to feel unease and warning — fear that hard-won freedom can be betrayed gradually from within — not triumphant satisfaction that a battle has been won.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That disquiet — dread at how ordinary the betrayal was, and how the animals' own passivity enabled it — is the emotional effect a dystopia is built to produce. It leaves us cautioned, not cheered.
   * **WhyWrong:** The intended effect is unease and warning, not triumph or amusement; the ending's completed tyranny is meant to disturb us and put us on guard, not to satisfy us that all is now well.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about revolution and power?
   * **Options:** A) That revolutions always deliver the equality they promise, B) That a revolution's ideals are betrayed when power is left unchecked — the oppressed can become the new oppressors, so freedom must be guarded, not merely won, C) That animals are incapable of governing themselves, D) That the strongest should always rule
   * **Correct:** B
   * **Feedback:** ✓ Correct. Old Major's dream of equality curdles into pig tyranny — Orwell's warning that overthrowing one master achieves nothing lasting if power is not held to account. The revolution is not the end of the danger.
   * **Why A:** The novel dramatises the opposite — the promise of equality is systematically betrayed.
   * **Why C:** The failure is the corruption of a *ruling class*, not the animals' incapacity; the workers' loyalty is real and abused.
   * **Why D:** The novel condemns rule by force, showing it recreates the very tyranny it replaced.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring warning does the novel give about language, truth and propaganda?
   * **Options:** A) That language is harmless and cannot affect power, B) That controlling language and rewriting the truth is how tyranny sustains itself — those who command the words can command what people believe and remember, C) That education always sets people free, D) That slogans have no real influence on anyone
   * **Correct:** B
   * **Feedback:** ✓ Correct. Squealer's endless spin, the edited commandments and the mindless chants show truth being manufactured. The message is that a tyranny survives by owning language — erase the record and you erase the grounds for revolt.
   * **Why A:** The whole novel shows language is a weapon of control, not something harmless.
   * **Why C:** The pigs *withhold* real literacy and use words to enslave — knowledge here is hoarded, not freeing.
   * **Why D:** The slogans are decisively powerful — they drown out thought and keep the animals obedient.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that tyranny returns not only through open force but through complacency, forgetting and manipulated truth — so freedom demands constant vigilance.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The animals lose their revolution partly because they forget the original commandments and stop questioning; Orwell's warning is that liberty is kept only by remembering and challenging those in power.
   * **WhyWrong:** The novel insists tyranny creeps back through the animals' own forgetting and passivity as much as through the dogs — vigilance, not a single victory, is what the message demands.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about power does the ending — the pigs and men grown indistinguishable — affirm?
   * **Options:** A) That murdering or overthrowing the old master is a reliable route to lasting freedom, B) That power without accountability corrupts absolutely — without vigilance the new rulers become indistinguishable from the old, and nothing is truly changed, C) That pigs are naturally superior rulers, D) That equality, once declared, can never be lost
   * **Correct:** B
   * **Feedback:** ✓ Correct. The final image — animals unable to tell pig from man — affirms that unaccountable power reproduces the tyranny it replaced. The revolution comes full circle: the masters have changed, the oppression has not.
   * **Why A:** Overthrowing Jones brings only a new tyranny; the ending proves that removing one master does not secure freedom.
   * **Why C:** The pigs are not fit rulers — they are corrupt ones; their "superiority" is stolen privilege dressed as merit.
   * **Why D:** The ending shows equality *is* lost — proclaimed, then hollowed out — which is exactly the warning.
