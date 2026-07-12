# Foundational Quiz Bank — Edexcel IGCSE Non-fiction Anthology

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**5 questions per text — one per aspect** (the 10 Edexcel IGCSE Spec A/B non-fiction anthology texts →
50 Q when complete). The picker serves ONE random question per aspect = a light **5-question round**
(`fq_dim_stratified`); depth comes from mastery REPETITION drawing a fresh variation per aspect each
round. Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (governed by `FQ-QUESTION-STANDARD.md` § NONFICTION).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia. Distractors are plausible CONCEPTUAL MISREADINGS a real student
holds. Content derives from the nonfiction CN protocol (`protocols/shared/nonfiction/modules/conceptual-notes/`).
**HARD gate (nfcn-foundation §0.3): NO modern-ideological framing** (post-colonial / CRT / Marxist /
"patriarchy") — ground every item in the writer's own context + the text's own words.

Aspects (`@dim` → nonfiction Conceptual-Notes field via `concept_field_for_dim`):
Writer's Voice → `nfcn_section_1` · Structure & Text Type → `nfcn_section_4` · Methods & Effect →
`nfcn_section_5` · Themes & Ideas → `nfcn_section_6` · Purpose & Message → `nfcn_section_7`.
Slugs (`voice / form / methods / ideas / purpose`) are DISTINCT from the lit set to avoid the
`concept_field_for_dim` collision (lit `themes`→`cn_section_5`).

Every quote is verbatim from the anthology source
(`Model Answers/Model Answer Resources/iGCSE-Anthology-English-Language-A-and-English-Literature.md`, Part 1).
`@set:N` stages the texts in 5 stages of 2, ALIGNED to the CN staged-delivery (cn_stage 5×2, same roster
pairing) so "Stage N" means the same 2 texts for both the quiz and the notes (Neil 2026-07-12): Stage 1 =
adichie, alagiah · Stage 2 = herbert, morris · Stage 3 = ralston, zephaniah · Stage 4 = levine, zeppa ·
Stage 5 = macdonald, yenmah. `@text:<slug>` names the text for autofill.

### Quiz: Edexcel IGCSE Non-fiction Anthology

1. **Type: MCQ [Tests Writer's Voice]**
   @set:1
   @dim:voice
   @text:adichie
   * **Question:** Whose voice tells *The Danger of a Single Story*, and what is her stance toward her own subject?
   * **Options:** A) A detached outside expert analysing Africa from a distance, B) A first-person storyteller at the centre of her own examples who turns the danger on herself — "I too am just as guilty in the question of the single story" — so she teaches rather than preaches, C) An angry campaigner blaming her audience for their ignorance, D) A neutral reporter with no personal stake in the argument
   * **Correct:** B
   * **Feedback:** ✓ Correct. Adichie speaks as "a storyteller" through her own life, and crucially implicates herself (the Mexico anecdote) — a reflective first-person voice that invites the listener in rather than accusing them.
   * **Why A:** She is not detached; every example is drawn from her own experience, told in the first person.
   * **Why C:** She implicates herself, not the audience — the tone is reflective and confessional, never accusatory.
   * **Why D:** She has a deep personal stake: the single story was told about her, and she admits she has told it about others.

2. **Type: MCQ [Tests Structure & Text Type]**
   @set:1
   @dim:form
   @text:adichie
   * **Question:** *The Danger of a Single Story* is a TED speech. How does its form build its argument?
   * **Options:** A) It states its conclusion first, then lists dry statistics to prove it, B) It stacks a series of personal anecdotes — childhood books, the house boy Fide, her American roommate, Mexico — that each enact the "single story", so the audience reaches the idea through story before she names it, C) It tells one continuous chronological life-story from birth to the present, D) It is a formal written essay with no direct connection to a listening audience
   * **Correct:** B
   * **Feedback:** ✓ Correct. The speech is organised thematically: separate anecdotes each dramatise the single story, so the audience feels the pattern and arrives at the thesis — "Stories matter" — through experience rather than assertion.
   * **Why A:** She builds toward her thesis through story, not a statistics-first proof.
   * **Why C:** It is not one continuous timeline; it jumps between separate episodes chosen to illustrate an idea.
   * **Why D:** It is a spoken speech that directly addresses "you" — its live audience shapes its intimacy and directness.

3. **Type: MCQ [Tests Methods & Effect]**
   @set:1
   @dim:methods
   @text:adichie
   * **Question:** Adichie says the way to create a single story is to "show a people as one thing, as only one thing, over and over again". What does this method DO to the listener?
   * **Options:** A) It simply decorates the speech with a memorable phrase, B) The insistent repetition makes the listener feel how a single story works — by relentless reduction — so its danger is experienced, not just explained, C) It proves a statistical fact about media coverage, D) It names a rhetorical device the audience is meant to identify
   * **Correct:** B
   * **Feedback:** ✓ Correct. The repeated insistence — one thing, only one thing, over and over again — enacts the very flattening it describes, so the listener feels the reductiveness rather than merely being told about it.
   * **Why A:** The repetition is not decoration — it performs the reduction she is warning against.
   * **Why C:** It offers no statistic; its force is rhythmic and emotional, not numerical.
   * **Why D:** The point is the EFFECT — feeling the reduction — not labelling the technique "repetition".

4. **Type: MCQ [Tests Themes & Ideas]**
   @set:1
   @dim:ideas
   @text:adichie
   * **Question:** Which controlling idea does *The Danger of a Single Story* most explore?
   * **Options:** A) That Africa is a place of catastrophe, B) That reducing any people to one story — however true in part — robs them of their full humanity, and that whoever holds power decides which single story gets told, C) That reading foreign books is harmful to children, D) That stories are merely entertainment with no real power
   * **Correct:** B
   * **Feedback:** ✓ Correct. The danger is not that a single story is false but that it is partial — and Adichie shows that power decides whose story is told, which is why stories can be used to "dispossess" or to "empower".
   * **Why A:** That is the stereotype she dismantles, not the idea she argues.
   * **Why C:** She "loved those American and British books"; the danger is a SINGLE story, not foreign books themselves.
   * **Why D:** Her claim is the opposite — stories "can break the dignity of a people, but stories can also repair that broken dignity".

5. **Type: MCQ [Tests Purpose & Message]**
   @set:1
   @dim:purpose
   @text:adichie
   * **Question:** What does Adichie ultimately want her audience to think or do — and what is her enduring message?
   * **Options:** A) To feel guilty about their assumptions and then do nothing, B) To seek out many stories about any place or people, because rejecting the single story is how "we regain a kind of paradise" — a fuller, truer connection as human equals, C) To stop telling stories altogether, since stories cause harm, D) To pity people who have only a single story told about them
   * **Correct:** B
   * **Feedback:** ✓ Correct. She moves past guilt — confessing her own single story of Mexicans — toward action: rejecting the single story is how "we regain a kind of paradise". The aim is more stories and genuine connection, not pity.
   * **Why A:** She models moving beyond guilt to active change, not paralysis.
   * **Why C:** She affirms that stories can "empower and to humanize" — she wants more stories, not fewer.
   * **Why D:** Pity is the trap she exposes — her roommate's "patronizing, well-meaning pity"; she wants connection "as human equals", not pity.

6. **Type: MCQ [Tests Writer's Voice]**
   @set:1
   @dim:voice
   @text:alagiah
   * **Question:** Whose voice tells *A Passage to Africa*, and how does his stance toward his subject change?
   * **Options:** A) A detached foreign correspondent who records the famine from a professional distance and stays unmoved throughout, B) A first-person reporter who begins as a hardened professional observer but is unsettled by a dying man's smile into questioning his own role — how should he feel, standing there so strong and confident? — shifting from watcher to reflective narrator, C) An angry campaigner who blames his viewers back home for ignoring the famine, D) A neutral news-reader with no personal stake, simply relaying facts and figures
   * **Correct:** B
   * **Feedback:** ✓ Correct. Alagiah writes in the first person as a reporter "inured to stories of suffering", but the man's smile "turned the tables" and moved him "beyond pity or revulsion" — carrying him from detached observer to reflective narrator questioning the ethics of his own reporting.
   * **Why A:** He does not stay unmoved — he is unsettled by the smile in a way he had never been before.
   * **Why C:** His reckoning is with himself, not his audience; he turns the man's question onto his own conscience rather than accusing viewers.
   * **Why D:** He has a deep personal stake — he resolves to write the story "with all the power and purpose I could muster" and ends the passage in the man's debt.

7. **Type: MCQ [Tests Structure & Text Type]**
   @set:1
   @dim:form
   @text:alagiah
   * **Question:** *A Passage to Africa* moves through a series of separate encounters. How does this fragmented structure shape the reader's response?
   * **Options:** A) It gives one unbroken minute-by-minute account of a single day, so the reader simply follows events in order, B) It builds through a sequence of distinct, escalating portraits — Amina's dying daughters, the abandoned rotting woman — before narrowing to "the face I will never forget" and its smile, so the reader reaches the turning point already saturated with suffering, C) It opens by stating its argument and then supplies statistics of the dead to prove it, D) It arranges the material as a balanced report giving equal weight to both sides of the conflict
   * **Correct:** B
   * **Feedback:** ✓ Correct. The passage stacks separate, intensifying encounters and repeatedly signals the one unforgettable face, so the fragments converge on the smile — the reader feels the accumulated horror before the single moment that changes everything lands.
   * **Why A:** It is not one continuous timeline; it jumps between discrete encounters chosen for their emotional force.
   * **Why C:** There is no statistics-first proof — Alagiah even calls "Facts and figures ... the easy part of journalism".
   * **Why D:** It is not a balanced two-sided report; it is a personal, selective account of what he witnessed and felt.

8. **Type: MCQ [Tests Methods & Effect]**
   @set:1
   @dim:methods
   @text:alagiah
   * **Question:** Alagiah writes that "The search for the shocking is like the craving for a drug: you require heavier and more frequent doses the longer you're at it." What does this DO to the reader?
   * **Options:** A) It simply adds a vivid, memorable image to brighten the report, B) By likening the hunt for images to addiction, it makes the reader feel the numbing corrosion of the journalists' own compassion — an uncomfortable self-indictment, not a neutral description, C) It proves a documented medical fact about reporters in war zones, D) It flags a rhetorical device the reader is meant to spot and name
   * **Correct:** B
   * **Feedback:** ✓ Correct. The addiction comparison makes the reader feel how relentless exposure blunts pity — "Pictures that stun the editors one day are written off as the same old stuff the next" — so the discomfort of desensitisation is experienced, and Alagiah turns it on himself.
   * **Why A:** It is not decoration — it delivers a troubling moral truth about the reporters' desensitisation.
   * **Why C:** It offers no medical fact; its force is emotional and confessional, not clinical.
   * **Why D:** The point is the FELT effect — the queasy self-implication — not labelling the comparison a "simile".

9. **Type: MCQ [Tests Themes & Ideas]**
   @set:1
   @dim:ideas
   @text:alagiah
   * **Question:** Which controlling idea does *A Passage to Africa* most explore?
   * **Options:** A) That famine in Somalia is simply a distant catastrophe to be recorded, B) That even in utter degradation people "aspire to a dignity that is almost impossible to achieve", and that dignity — caught in one man's ashamed smile — poses a moral question to the comfortable observer about the relationship "between the rich world and the poor world", C) That journalists should not report famine because it is too disturbing a subject, D) That facts and figures are the most important part of reporting a war
   * **Correct:** B
   * **Feedback:** ✓ Correct. "The feeble smile that goes with apology" reverses the gaze — the sufferer feels shame while the well-fed reporter is left to ask how he should feel, standing there so strong and confident. The text's real subject is dignity and the ethics of watching another's suffering.
   * **Why A:** Distant recording is exactly the detached stance the smile shatters — the passage is about being implicated, not merely observing.
   * **Why C:** He resolves the opposite — to write the story "with all the power and purpose I could muster"; the taboo he names is the silence about degradation, not reporting itself.
   * **Why D:** He calls facts and figures the easy part; the hard, important work is "knowing where they sit in the great scheme of things".

10. **Type: MCQ [Tests Purpose & Message]**
   @set:1
   @dim:purpose
   @text:alagiah
   * **Question:** What does Alagiah ultimately want the reader to feel or recognise — and what is his enduring message?
   * **Options:** A) To pity the starving as helpless victims and feel grateful for their own comfort, B) To recognise the full humanity and dignity of those reduced to famine images, and to feel the responsibility the observer owes them — that honest reporting must go "beyond pity or revulsion" to a genuine human reckoning, C) To feel that nothing can be done about famine, so there is no point acting, D) To admire the skill and courage of war reporters above all
   * **Correct:** B
   * **Feedback:** ✓ Correct. Alagiah moves past pity and revulsion to responsibility — he writes the story "with all the power and purpose I could muster" as "the only adequate answer a reporter can give to the man's question", and ends owing his "nameless friend" a debt. The message: truly seeing another's dignity obliges us.
   * **Why A:** Pity is precisely what the smile pushes him beyond — his response "went beyond pity or revulsion"; he seeks recognition, not condescension.
   * **Why C:** He insists on action — resolving "there and then" to tell the story with full purpose, the opposite of passivity.
   * **Why D:** The reporter's discomfort, not his heroism, is the point; Alagiah indicts the journalist's detachment rather than celebrating it.

11. **Type: MCQ [Tests Writer's Voice]**
   @set:2
   @dim:voice
   @text:herbert
   * **Question:** Whose voice tells *The Explorer's Daughter*, and what is her stance toward the hunt she watches?
   * **Options:** A) A detached zoologist cataloguing narwhal biology from the outside, B) A reflective first-person narrator who watches the hunt as an outsider-who-belongs and turns the scene into an examination of her own divided feelings — "at the same time my heart also urged the narwhal to dive, to leave, to survive", C) An angry campaigner condemning the hunters for killing a beautiful creature, D) A neutral reporter recording the day's events with no personal stake
   * **Correct:** B
   * **Feedback:** ✓ Correct. Herbert writes as a reflective first-person narrator: she is present at the lookout but the extract's centre is her inner conflict — "my heart leapt for both hunter and narwhal" — so she reflects on the dilemma rather than reporting or condemning.
   * **Why A:** She does supply facts about the narwhal, but her stance is personal and reflective, not the detached cataloguing of an expert.
   * **Why C:** She never condemns the hunters; she calls the hunter "so brave to attempt what he was about to do" — she is torn, not accusing.
   * **Why D:** She has a deep personal stake — "This dilemma stayed with me the whole time that I was in Greenland" — so the voice is anything but neutral.

12. **Type: MCQ [Tests Structure & Text Type]**
   @set:2
   @dim:form
   @text:herbert
   * **Question:** *The Explorer's Daughter* is a piece of travel writing / memoir. How does its form shape the reader's response?
   * **Options:** A) It runs as one continuous adventure story from start to finish, building to a single climax, B) It weaves together lyrical description of the scene, factual explanation of why the narwhal matters, and personal reflection, so the reader is pulled between the beauty of the animal and the necessity of the hunt — the form itself enacts her dilemma, C) It states a thesis and then lists statistics to prove that hunting is justified, D) It is an impersonal field report cataloguing Arctic wildlife
   * **Correct:** B
   * **Feedback:** ✓ Correct. The passage keeps switching register — the "butter-gold" light, the explanation that the narwhal is "an essential contributor to the survival of the hunters in the High Arctic", then her divided heart — so the contrast-driven structure makes the reader feel the pull between beauty and survival that she feels.
   * **Why A:** It is not a straight chronological adventure; it interrupts the hunt with reflection and explanation, and reaches no tidy climax — the tension is left unresolved.
   * **Why C:** She offers no statistics-first proof and takes no single side; the form holds two responses in tension rather than arguing one.
   * **Why D:** It is intensely personal, not an impersonal report — the wildlife facts serve her reflection, not a catalogue.

13. **Type: MCQ [Tests Methods & Effect]**
   @set:2
   @dim:methods
   @text:herbert
   * **Question:** As the hunter takes aim, Herbert writes that she "urged the man on in my head" and yet "at the same time my heart also urged the narwhal to dive, to leave, to survive". What does this method DO to the reader?
   * **Options:** A) It simply decorates the moment with vivid emotion, B) By swinging her allegiance from hunter to narwhal in the same breath, she makes the reader experience the impossibility of choosing a side — the dilemma is felt from the inside, not merely described, C) It proves a fact about how narwhal escape predators, D) It names the balanced structure the reader is meant to identify
   * **Correct:** B
   * **Feedback:** ✓ Correct. The back-and-forth of her divided sympathy — willing the hunter on, then willing the narwhal to survive — forces the reader into the same split-second conflict, so the dilemma is lived rather than explained.
   * **Why A:** The divided feeling is not decoration; it performs the very impossibility of taking one side that the extract is about.
   * **Why C:** There is no fact being proven here; the force is emotional — the reader is caught between two sympathies.
   * **Why D:** The point is the EFFECT — feeling torn — not labelling the technique as "balance" or "juxtaposition".

14. **Type: MCQ [Tests Themes & Ideas]**
   @set:2
   @dim:ideas
   @text:herbert
   * **Question:** Which controlling idea does *The Explorer's Daughter* most explore?
   * **Options:** A) That hunting the narwhal is cruel and ought to be stopped, B) That an outsider's instinct to protect a beautiful creature must be weighed against the reality that the Inughuit depend on the hunt to live — a conflict between feeling and necessity with no easy answer, C) That the Arctic is an unspoilt wilderness untouched by human need, D) That traditional hunting is dying out and imported goods will soon replace it
   * **Correct:** B
   * **Feedback:** ✓ Correct. Herbert holds two truths together: the pull of compassion for the narwhal and the fact that "one cannot afford to be sentimental in the Arctic" because "Hunting is still an absolute necessity in Thule" — the idea IS the unresolved tension between them.
   * **Why A:** That is the reaction she complicates, not the idea she argues — she stresses the hunters "nor do they kill for sport" and hunt only to survive.
   * **Why C:** The extract is precisely about human survival within that landscape, not a wilderness free of human need.
   * **Why D:** She states the opposite — imported goods "can only ever account for part of the food supply", so the hunt remains essential.

15. **Type: MCQ [Tests Purpose & Message]**
   @set:2
   @dim:purpose
   @text:herbert
   * **Question:** What does Herbert ultimately want her reader to think or feel — and what is her enduring message?
   * **Options:** A) To condemn Arctic hunting and campaign to have it banned, B) To move past easy condemnation and understand the hunters' necessity while still feeling the pull of compassion — because in a place where "Hunting is still an absolute necessity in Thule", judging another people's survival by an outsider's sentiment is a luxury we cannot impose, C) To feel guilty for eating meat and then change nothing, D) To pity the hunters for a harsh and primitive way of life
   * **Correct:** B
   * **Feedback:** ✓ Correct. She wants the reader to hold both responses at once — respect for the necessity and compassion for the narwhal — and to see that sentimentality is a luxury the Arctic does not allow; understanding, not condemnation, is the aim.
   * **Why A:** She refuses to condemn the hunters, insisting they "nor do they kill for sport" and hunt only to live — a ban is the opposite of her point.
   * **Why C:** Her message is active understanding, not passive guilt; she asks the reader to rethink, not to feel bad and do nothing.
   * **Why D:** She feels respect, not pity — the hunter's courage "could only inspire respect"; pity would flatten the equals she portrays.

16. **Type: MCQ [Tests Writer's Voice]**
   @set:2
   @dim:voice
   @text:morris
   * **Question:** Whose voice reports *Explorers or boys messing about?*, and what is his stance toward the two adventurers?
   * **Options:** A) A first-person adventurer at the centre of the story, recounting his own near-fatal crash, B) A third-person news reporter who never appears in the story and presents it as straight news — yet through his choice of quotations and the "resentment in some quarters" framing he quietly steers the reader to weigh folly against heroism, C) A reflective narrator looking back years later on an adventure of his own, D) An openly furious campaigner who directly denounces the men as reckless fools
   * **Correct:** B
   * **Feedback:** ✓ Correct. Morris writes as an observer-reporter — he is not on the expedition and keeps himself out of the account — but by leading with the mocking headline, quoting the "resentment in some quarters" and the wife's "boys messing about with a helicopter", he frames the rescue so the reader judges it, without ever stating his own verdict.
   * **Why A:** The voice is not a participant; Morris reports on Brooks and Smith from outside — he never took part in the flight ("Yesterday a new adventure").
   * **Why C:** Nothing is recollected as the writer's own past; this is same-day news reportage of someone else's events.
   * **Why D:** The criticism is never the writer's open rage — it is carried by others' quoted words, so the reporting voice stays ostensibly neutral.

17. **Type: MCQ [Tests Structure & Text Type]**
   @set:2
   @dim:form
   @text:morris
   * **Question:** *Explorers or boys messing about?* is a newspaper article. How does its structure shape the reader's response?
   * **Options:** A) It opens with a clear thesis and then lists dry statistics to prove the rescue was wrong, B) It sets the men's genuine feats — "Both men are experienced adventurers", world champions, expeditions to 70 countries — directly against the cost to taxpayers and the experts' doubts, so the contrast forces the reader to weigh heroism against folly, C) It follows one unbroken chronological life-story of the two men from childhood onward, D) It is a first-person memoir reflecting on the writer's own expedition
   * **Correct:** B
   * **Feedback:** ✓ Correct. The article is built on contrast: the men's real achievements are juxtaposed with the "tens of thousands of pounds" bill and questions about "the wisdom" of the flight, so the reader is pushed to judge — exactly the question the headline poses.
   * **Why A:** It never announces a thesis or argues openly with statistics; its judgement emerges through arrangement, not assertion.
   * **Why C:** The order jumps — the rescue, then the criticism, then the men's backgrounds, then an earlier failed expedition — it is not one continuous timeline.
   * **Why D:** The writer is an outside reporter, not a first-person narrator recalling his own journey.

18. **Type: MCQ [Tests Methods & Effect]**
   @set:2
   @dim:methods
   @text:morris
   * **Question:** Morris reports the wife's description of the pair as "boys messing about with a helicopter" and lets an expert say they were "pushing it to the maximum". What does this method DO to the reader?
   * **Options:** A) It decorates the report with lively quotations to make it more entertaining, B) By letting the wife's diminishing phrase and the experts' doubts carry the criticism, the verdict seems to come from trusted insiders rather than the journalist — so the reader feels the judgement is fair, not the writer's own opinion, C) It statistically proves that the rescue cost too much public money, D) It signals a persuasive device the reader is meant to name
   * **Correct:** B
   * **Feedback:** ✓ Correct. Morris rarely judges in his own voice; he places the criticism in others' mouths — the wife's "boys messing about", the "resentment in some quarters", the expert who says they were "pushing it to the maximum" — so the sceptical verdict lands as reported fact, and the reader trusts it.
   * **Why A:** The quotations are not ornament — they carry the article's argument and steer the reader's judgement.
   * **Why C:** No statistic proves anything; "tens of thousands of pounds" is an impression of waste, not a costed proof.
   * **Why D:** The point is the EFFECT — feeling the criticism as trustworthy — not labelling a technique.

19. **Type: MCQ [Tests Themes & Ideas]**
   @set:2
   @dim:ideas
   @text:morris
   * **Question:** Which controlling idea does *Explorers or boys messing about?* most explore?
   * **Options:** A) That Antarctic exploration is straightforwardly heroic and deserves celebration, B) That daring adventure sits on a knife-edge between admirable courage and self-indulgent recklessness — and when it goes wrong, the public is left to "pick up the bill", C) That small helicopters are simply too dangerous to fly, D) That the Royal Navy is inefficient at carrying out rescues
   * **Correct:** B
   * **Feedback:** ✓ Correct. The whole article holds the tension of its own headline: the men are genuinely brave and skilled, yet their "adventure had cost the taxpayers of Britain and Chile tens of thousands of pounds" — so the reader is left weighing heroism against folly and its public cost.
   * **Why A:** That is one side the article deliberately complicates, not the idea it settles on.
   * **Why C:** The danger of the R44 is a detail in the argument, not the controlling idea about adventure and responsibility.
   * **Why D:** The rescue services are shown working hard and well; the article's concern is the men's choices and their cost, not naval competence.

20. **Type: MCQ [Tests Purpose & Message]**
   @set:2
   @dim:purpose
   @text:morris
   * **Question:** What does Morris ultimately want the reader to think or feel — and what is the article's enduring message?
   * **Options:** A) To admire the two men as inspiring heroes and wish to follow their example, B) To question the wisdom and cost of such adventures — to ask who should pay when private thrill-seeking goes wrong — since, as the headline insists, "either way, taxpayer gets rescue bill", C) To feel only pity for the men's brush with death and think no further, D) To demand that the two adventurers be punished and prosecuted
   * **Correct:** B
   * **Feedback:** ✓ Correct. Beneath the drama, Morris steers the reader toward a sceptical question — was this courage or carelessness, and why should the public fund the rescue? The headline's "either way, taxpayer gets rescue bill" is the enduring point: personal adventure can carry a public price.
   * **Why A:** The article undercuts pure admiration with "resentment", expert doubt and the wife's mocking "boys messing about" — it invites judgement, not hero-worship.
   * **Why C:** Pity for the near-miss is present, but the article pushes past it to the harder question of wisdom and cost.
   * **Why D:** Nothing in the report calls for punishment — even the wife only jokes they'll "have their bottoms kicked"; the tone is sceptical, not vengeful.

21. **Type: MCQ [Tests Writer's Voice]**
   @set:3
   @dim:voice
   @text:ralston
   * **Question:** Whose voice tells this account of *127 Hours*, and what is his stance as he narrates the accident?
   * **Options:** A) A detached mountaineering expert delivering a calm safety lesson from years afterwards, B) A first-person adventurer at the very centre of his own ordeal, narrating it in the present tense as it happens — "I come to another drop-off" … "the boulder then crushes my right hand" — so the reader is trapped in the moment with him, C) An outside observer describing another climber's accident from a safe distance, D) A reflective narrator looking back with the calm of resolved emotion, the danger long past
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ralston is the central voice, living the catastrophe in real time — the present tense ("crushes", "I'm frantic, and I cry out") keeps us inside the trap with him rather than at the safe remove of hindsight.
   * **Why A:** He is not detached or instructional; every sensation is his own, felt as it happens, not taught from a distance.
   * **Why C:** He is the one the boulder crushes — this is his own arm, not another climber observed from outside.
   * **Why D:** The relentless present tense denies any calm of hindsight; we experience the panic as it unfolds, not recollected in tranquillity.

22. **Type: MCQ [Tests Structure & Text Type]**
   @set:3
   @dim:form
   @text:ralston
   * **Question:** *127 Hours* is an autobiography. How does the way it is organised shape the reader's response?
   * **Options:** A) It opens with the rescue and works backwards, so the suspense comes from explanation rather than events, B) It unfolds moment by moment in real time — each careful action (testing the boulder, lowering himself, dangling from the ledge) leads to the next — so tension mounts step by step and the reader is caught in the present when the rock falls, C) It is organised thematically around separate ideas about risk, with no continuous timeline, D) It is a neutral, factual report that lists what happened at an emotional distance
   * **Correct:** B
   * **Feedback:** ✓ Correct. The account runs chronologically and in the present: we move with him through each deliberate step, so when the stone that "teeters slightly" finally gives way the disaster lands on us in real time, not as a summary after the fact.
   * **Why A:** The events unfold in order from the descent to the crush; there is no reverse-chronology reveal.
   * **Why C:** It is one continuous, unbroken sequence of actions, not separate episodes chosen to illustrate a theme.
   * **Why D:** The organisation delivers mounting panic, not detached listing — the closer the moment comes, the more intense the telling.

23. **Type: MCQ [Tests Methods & Effect]**
   @set:3
   @dim:methods
   @text:ralston
   * **Question:** When the rock falls, Ralston writes that the next three seconds "play out at a tenth of their normal speed" and describes the collision "In slow motion". What does this method DO to the reader?
   * **Options:** A) It simply adds dramatic decoration to an exciting moment, B) By stretching the seconds so "Time dilates", it forces the reader to live the crush frame by frame — each separate blow registered in turn — so a split-second disaster becomes an unbearable, drawn-out ordeal, C) It proves a factual point about how fast rockfalls happen, D) It flags a technique the reader is meant to identify by name
   * **Correct:** B
   * **Feedback:** ✓ Correct. Slowing time to "a tenth of their normal speed" makes us dwell on every stage of the crush — left hand, then right hand, then the tearing skin — so we feel the horror stretched out rather than merely being told an accident was quick.
   * **Why A:** The slowing is not decoration — it performs the agonising prolonging of the moment the reader is made to share.
   * **Why C:** It offers no statistic; its force is experiential and emotional, not a measured fact about rockfalls.
   * **Why D:** The point is the EFFECT — living the moment frame by frame — not labelling the technique.

24. **Type: MCQ [Tests Themes & Ideas]**
   @set:3
   @dim:ideas
   @text:ralston
   * **Question:** Which controlling idea does this extract most explore?
   * **Options:** A) That nature is a benign playground that rewards the skilled adventurer, B) That human control is precarious — despite all his skill and caution, one shifting stone turns mastery into helplessness, exposing how fragile our hold over nature really is, C) That sheer physical strength can overcome any obstacle, D) That the accident was pure bad luck, unconnected to any choice he made
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ralston is expert and careful — he tests the boulder, he stems and chimneys — yet a stone that merely "teeters slightly" traps him in an instant, dramatising how thin the line is between command and catastrophe.
   * **Why A:** Nature here is indifferent and dangerous, not a rewarding playground — his competence does not protect him.
   * **Why C:** Brute force fails him: he braces and thrusts against the boulder and the result is "Nothing".
   * **Why D:** His own choices shape the peril — he trusts a boulder he feels teeter, and he "had not informed anyone of his hiking plans", so he is utterly alone.

25. **Type: MCQ [Tests Purpose & Message]**
   @set:3
   @dim:purpose
   @text:ralston
   * **Question:** What does Ralston want the reader to feel and understand — and what is the enduring message of the account?
   * **Options:** A) To be entertained by a thrilling adventure with no real stakes, B) To feel the raw panic and helplessness of the moment with him, and to grasp how instantly an ordinary life can be overturned — a sobering sense of nature's indifference and the fragility of our control, C) To admire him as a fearless hero who was never truly afraid, D) To be warned off climbing and the outdoors altogether
   * **Correct:** B
   * **Feedback:** ✓ Correct. By putting us inside his terror — "The flaring agony throws me into a panic", "I'm frantic, and I cry out" — Ralston makes us feel how a single second can upend a life, especially for a man who "had not informed anyone of his hiking plans" and is now entirely alone.
   * **Why A:** The stakes are life-and-death and viscerally real; this is the opposite of weightless entertainment.
   * **Why C:** He shows himself frantic and panicking, not fearless — the honesty about his terror is the point.
   * **Why D:** It is not an anti-adventure lecture; the message concerns human vulnerability and the fragility of control, not a warning to stay indoors.

26. **Type: MCQ [Tests Writer's Voice]**
   @set:3
   @dim:voice
   @text:zephaniah
   * **Question:** Whose voice tells *Young and dyslexic? You've got it going on*, and what is his stance toward his own experience?
   * **Options:** A) A detached expert explaining dyslexia from the outside, with no personal involvement, B) A reflective first-person voice at the centre of his own story — he turns a childhood in which "As a child I suffered" into direct encouragement, reframing dyslexia as a strength: "We are the architects, we are the designers", C) An angry accuser settling scores with the teachers who failed him, D) A neutral reporter presenting balanced evidence on both sides of a debate
   * **Correct:** B
   * **Feedback:** ✓ Correct. Zephaniah writes as the central subject of his own essay, in the first person, and consciously turns his suffering into reassurance for dyslexic readers — a reflective, encouraging voice, not a detached or accusing one.
   * **Why A:** Every point comes from his own life; he is fully inside the essay, not analysing dyslexia from a distance.
   * **Why C:** He explicitly refuses anger — "I don't look back and feel angry with the teachers" — his stance is reflective, not vengeful.
   * **Why D:** He is not neutral; he argues a clear personal case, that dyslexia is a difference to be embraced.

27. **Type: MCQ [Tests Structure & Text Type]**
   @set:3
   @dim:form
   @text:zephaniah
   * **Question:** *Young and dyslexic? You've got it going on* is a personal essay. How does the way it is organised shape the reader's response?
   * **Options:** A) It runs as one unbroken chronological life-story from birth to the present, like a diary, B) It moves between ideas rather than dates — school memories, prison and architects, advice to parents, a direct word to dyslexic kids — each circling one idea, so the reader arrives at the sense that "being dyslexic is a natural way to be" through gathered experience, C) It opens with its thesis and then lists statistics to prove it, D) It is a formal, impersonal report addressed to no one in particular
   * **Correct:** B
   * **Feedback:** ✓ Correct. The essay is organised thematically: it gathers separate memories and reflections around a single reframing of dyslexia and closes on direct encouragement, so the reader feels the idea build rather than being handed a timeline.
   * **Why A:** Though it recalls his past, it is not a continuous timeline; it jumps between memories and ideas chosen to make a point.
   * **Why C:** He does not lead with a thesis-and-statistics proof; the one statistic — prison and architects — sits inside a personal reflection, not a formal argument.
   * **Why D:** It is intimate and direct, speaking straight to a dyslexic "you" — the opposite of an impersonal report.

28. **Type: MCQ [Tests Methods & Effect]**
   @set:3
   @dim:methods
   @text:zephaniah
   * **Question:** Zephaniah folds himself and his reader into one group — "Us dyslexic people, we've got it going on – we are the architects. We are the designers." What does this method DO to a dyslexic reader?
   * **Options:** A) It simply adds a catchy slogan to round off the essay, B) By speaking as "we" and "us", he makes the dyslexic reader feel part of a capable, proud group rather than an isolated individual with a problem — belonging is felt, not just argued, C) It proves statistically that dyslexic people become architects, D) It is there so the reader can identify his use of the first-person plural
   * **Correct:** B
   * **Feedback:** ✓ Correct. The inclusive "we" and "us" gather writer and reader into one proud company, so a dyslexic reader feels included and lifted rather than singled out — the effect is belonging, experienced directly.
   * **Why A:** The collective voice is not decoration; it performs the shared pride the essay wants the reader to feel.
   * **Why C:** The architects line is a claim of pride and identity, not a statistic to be proved.
   * **Why D:** The point is the FELT effect — belonging — not labelling the technique "first-person plural".

29. **Type: MCQ [Tests Themes & Ideas]**
   @set:3
   @dim:ideas
   @text:zephaniah
   * **Question:** Which controlling idea does *Young and dyslexic? You've got it going on* most explore?
   * **Options:** A) That dyslexia is a defect which measures low intelligence and holds a person back, B) That dyslexia is a natural difference and even a creative strength — the fault lies not in the dyslexic person but in a narrow idea of "normal": "What's unnatural is the way we read and write", C) That the teachers of Zephaniah's generation should be blamed for their cruelty, D) That success is mostly a matter of luck and opportunity, not the person
   * **Correct:** B
   * **Feedback:** ✓ Correct. Zephaniah reframes dyslexia as a difference that can feed creativity — "Dyslexia is not a measure of intelligence: you may have a genius on your hands" — and locates the real problem in how we read and write, not in the dyslexic person.
   * **Why A:** That is exactly the belief he dismantles — he urges dyslexic readers not to see it as a defect.
   * **Why C:** He recalls harsh teachers but refuses to blame them — "I don't look back and feel angry"; the essay reframes dyslexia rather than condemning them.
   * **Why D:** He credits self-belief and using dyslexia to his advantage, not luck, as what made the difference.

30. **Type: MCQ [Tests Purpose & Message]**
   @set:3
   @dim:purpose
   @text:zephaniah
   * **Question:** What does Zephaniah ultimately want a dyslexic reader — or their parent — to think, feel or do, and what is his enduring message?
   * **Options:** A) To feel sorry for dyslexic people and the struggles they face, B) To stop feeling that something is wrong with them and instead use it to their advantage and "see the world differently" — because, as he tells them, "it's not you": the problem lies in a narrow idea of normal, not in the dyslexic person, C) To feel guilty about the cruelty of past teachers and leave it at that, D) That dyslexic people should work to overcome their dyslexia and read and write like everyone else
   * **Correct:** B
   * **Feedback:** ✓ Correct. His aim is active and encouraging: dyslexic readers should reject the sense of deficiency and embrace their difference as a creative advantage, and parents should see "a genius on your hands" — the enduring message is "it's not you".
   * **Why A:** He offers pride and encouragement, not pity — he wants readers lifted, not felt sorry for.
   * **Why C:** He explicitly sets aside blame and anger; dwelling on the teachers is not his purpose.
   * **Why D:** He argues the opposite — "What's unnatural is the way we read and write"; he wants the difference embraced, not erased.

31. **Type: MCQ [Tests Writer's Voice]**
   @set:4
   @dim:voice
   @text:levine
   * **Question:** Whose voice tells the extract from *A Game of Polo with a Headless Goat*, and what is her stance toward the donkey race she describes?
   * **Options:** A) A detached expert explaining the rules of Pakistani donkey racing from the outside, B) A first-person traveller-observer who is inside the action — "perched in the boot" filming — yet reports the race as a curious, delighted outsider, conveying its excitement without condemning it ("energetically, although not cruelly"), C) A campaigner denouncing the race as cruelty to the animals, D) A local insider to whom this Karachi sport is familiar and unremarkable
   * **Correct:** B
   * **Feedback:** ✓ Correct. Levine writes in the first person from within the chase, but her role is that of an outsider-observer carrying us into an unfamiliar event — her tone is excited and curious, and she pointedly withholds judgement when she notes the whips are used "energetically, although not cruelly".
   * **Why A:** She is not detached — she is physically in the thick of it, hidden in the car boot with a zoom lens as the race roars past.
   * **Why C:** She deliberately withholds condemnation; noting the whips are used "not cruelly" is the opposite of a campaigner's denunciation.
   * **Why D:** Her whole stance is that of the outsider meeting something unfamiliar and thrilling for the first time, not an insider to whom it is ordinary.

32. **Type: MCQ [Tests Structure & Text Type]**
   @set:4
   @dim:form
   @text:levine
   * **Question:** This is travel and sports journalism. How does its form shape the reader's response?
   * **Options:** A) It opens with a thesis about donkey racing and then supports it with statistics, B) It builds the race from a run of vivid, close-up scenes — the long wait on the hill, the roaring convoy, the neck-and-neck chase, the crash, the dispute afterwards — so the armchair reader experiences the unfamiliar sport moment by moment as if present, C) It gives a neutral timetable of the rules and the result, D) It turns inward to reflect on the writer's own emotional life, with the race only a distant background
   * **Correct:** B
   * **Feedback:** ✓ Correct. The passage is built as a sequence of sharply-drawn scenes rather than a summary, placing the reader inside the event so an armchair traveller feels the wait, the noise and the danger unfold in real time.
   * **Why A:** It is experiential narrative, not an argument backed by data — the one speed figure is woven into the scene, not marshalled as proof.
   * **Why C:** It is immersive and sensory, the opposite of a neutral record of rules and results.
   * **Why D:** The event is the foreground throughout; this is outward-looking travel writing, not introspective memoir.

33. **Type: MCQ [Tests Methods & Effect]**
   @set:4
   @dim:methods
   @text:levine
   * **Question:** Levine calls the chase "Formula One without rules, or a city-centre rush hour gone anarchic". What does this method DO to the reader?
   * **Options:** A) It simply decorates the passage with a sporting reference, B) By translating an unfamiliar Karachi donkey-chase into things the reader already knows — Formula One, a jammed rush hour — it lets the armchair reader instantly feel the reckless speed and lawless chaos, so the event is experienced rather than merely explained, C) It proves the race was genuinely as fast as a real Formula One event, D) It names a technique the reader is meant to identify
   * **Correct:** B
   * **Feedback:** ✓ Correct. The comparison anchors the alien in the familiar: the reader who has never seen a donkey race can nonetheless feel its speed and its total flouting of order, because Formula One and rush-hour gridlock supply the sensation for them.
   * **Why A:** The comparison is not ornament — it does the work of making an unfamiliar scene instantly vivid and felt.
   * **Why C:** It is a felt comparison built for effect, not a literal claim that the donkeys matched a racing car.
   * **Why D:** The point is the EFFECT — feeling the speed and anarchy — not labelling the comparison as a device.

34. **Type: MCQ [Tests Themes & Ideas]**
   @set:4
   @dim:ideas
   @text:levine
   * **Question:** Which controlling idea does the extract most explore?
   * **Options:** A) That donkey racing is a cruel sport that ought to be banned, B) The exhilaration — and the real precariousness — of throwing oneself first-hand into an unfamiliar culture's sport: an event that flouts every rule the outsider knows is thrilling, chaotic and genuinely dangerous all at once, C) That Pakistan is a backward and lawless place, D) That the writer's filming trip was a professional failure
   * **Correct:** B
   * **Feedback:** ✓ Correct. Levine's subject is the alive, headlong experience of an unfamiliar event — the wait, the roaring chase and the near pile-up together capture both its thrill and its danger, felt through an outsider's eyes.
   * **Why A:** That is a judgement she pointedly withholds — condemnation of the sport is not the idea the text argues.
   * **Why C:** Her tone is delighted and admiring, not contemptuous; reading the scene as evidence of a "backward" place imports a stereotype the writing never endorses.
   * **Why D:** In experience the trip is a thrilling success — the chaos is the point of the adventure, not a failure of it.

35. **Type: MCQ [Tests Purpose & Message]**
   @set:4
   @dim:purpose
   @text:levine
   * **Question:** What does Levine ultimately want the reader to feel — and what is her enduring message?
   * **Options:** A) To feel superior to a place with "no lane discipline", B) To feel the exhilaration of an unfamiliar sport experienced first-hand — sharing her outsider's thrill — and to sense that stepping beyond the familiar into another culture's way of life, chaos and all, is where the most alive experience is found, C) To be warned off travelling to dangerous or unruly places, D) To pity the donkeys and campaign against the race
   * **Correct:** B
   * **Feedback:** ✓ Correct. Levine's aim is to carry the armchair reader into the thrill of an unfamiliar event and to share, not judge, the excitement — her enduring note is that immersing oneself in another culture on its own terms, disorder included, is richly worth it.
   * **Why A:** Her delight is admiring and self-deprecating — she is the one hiding in a car boot — not a claim of superiority over the "no lane discipline" of the streets.
   * **Why C:** She relishes the danger rather than fearing it; her message invites immersion, not caution.
   * **Why D:** Pity and condemnation are exactly what her tone withholds ("not cruelly"); she wants the reader to share the excitement, not to campaign.

36. **Type: MCQ [Tests Writer's Voice]**
   @set:4
   @dim:voice
   @text:zeppa
   * **Question:** Whose voice tells *Beyond the Sky and the Earth*, and what is her stance toward Bhutan?
   * **Options:** A) A detached travel expert cataloguing Bhutan's facts and history from the outside, B) A first-person traveller at the centre of her own arrival, openly registering her disorientation and shifting perceptions — "I am exhausted, but I cannot sleep" — so we meet Bhutan through her subjective, changing eyes, C) A confident, seasoned traveller who has already mastered the place and guides us calmly through it, D) A neutral reporter with no personal stake in what she sees
   * **Correct:** B
   * **Feedback:** ✓ Correct. Zeppa is a reflective first-person newcomer at the centre of her own experience — even her admiration is earned through her own bewilderment, as when she admits to "hoping to pick up some of their enthusiasm" from the other Canadians.
   * **Why A:** She does relay history and facts, but always filtered through her personal, present-tense response — she is never detached from what she sees.
   * **Why C:** Far from mastering the place, she is exhausted, sleepless and unsure, borrowing others' enthusiasm rather than leading us confidently.
   * **Why D:** Her stake is entirely personal: by the end she is "full of admiration for this small country", the opposite of a neutral observer.

37. **Type: MCQ [Tests Structure & Text Type]**
   @set:4
   @dim:form
   @text:zeppa
   * **Question:** *Beyond the Sky and the Earth* is travel writing / memoir. How does its form shape the reader's response?
   * **Options:** A) It reads like a factual guidebook, listing Bhutan's sights and statistics in order for a tourist to consult, B) It immerses us in her lived, present-tense arrival — "It is my first night in Thimphu" — carrying us from bewildered disorientation toward earned admiration, so we undergo the journey with her rather than being told to admire the place, C) It is a detached historical chronicle marching straight through Bhutan's timeline, D) It is an argumentative essay that states a thesis about Bhutan and then sets out to prove it
   * **Correct:** B
   * **Feedback:** ✓ Correct. The first-person, present-tense memoir places us inside her senses as she arrives, so her closing admiration — reached only after the disorientation of "more mountains and mountains again" — is something we experience alongside her, not a verdict handed to us.
   * **Why A:** It is a personal narrative, not a consultable guide; its facts serve her experience, not a tourist's itinerary.
   * **Why C:** History does appear, but nested inside her personal arrival — it is not the organising frame that marches through a timeline.
   * **Why D:** It narrates an experience rather than arguing a case; there is no thesis-and-proof, only a journey lived and felt.

38. **Type: MCQ [Tests Methods & Effect]**
   @set:4
   @dim:methods
   @text:zeppa
   * **Question:** Flying in, Zeppa writes that "on the other side of mountains are mountains, more mountains and mountains again". What does this method DO to the reader?
   * **Options:** A) It decorates the description with a pleasing turn of phrase, B) The piling repetition makes us FEEL the landscape's overwhelming endlessness — ridge beyond ridge with no resolution — so we share her sense of being dwarfed and disoriented, C) It gives an accurate geographical count of Bhutan's mountain ranges, D) It signals a technique the reader is meant to identify and label
   * **Correct:** B
   * **Feedback:** ✓ Correct. Repeating "mountains" until the word itself seems to multiply enacts the very endlessness it describes, so the reader feels the immensity that overwhelms her — the country that is "all and only mountains" — rather than merely being told it is mountainous.
   * **Why A:** The repetition is not ornament — it performs the endlessness, making us feel the scale it names.
   * **Why C:** It offers no count or statistic; its force is rhythmic and emotional, not numerical.
   * **Why D:** The point is the EFFECT — feeling the endlessness — not naming the device as "repetition".

39. **Type: MCQ [Tests Themes & Ideas]**
   @set:4
   @dim:ideas
   @text:zeppa
   * **Question:** Which controlling idea does *Beyond the Sky and the Earth* most explore?
   * **Options:** A) That Bhutan is a backward, isolated country to be pitied for lacking modern development, B) That an utterly unfamiliar place first disorients the newcomer, but patient, open attention transforms bewilderment into admiration — a country cannot be grasped from facts alone but must be lived and felt, C) That travel is really about seeing famous landmarks and ticking off sights, D) That a traveller must reshape a place to her own standards before she can feel at home in it
   * **Correct:** B
   * **Feedback:** ✓ Correct. Zeppa knows "the technical explanation for the landscape" yet admits "I cannot imagine it", and can "find no single word to hold all of my impressions" — knowledge alone is not enough; only lived attention carries her from disorientation to admiration.
   * **Why A:** The under-developed surface — no traffic lights, stale biscuits — is the first impression she moves BEYOND, not the idea she affirms; she ends in admiration, not pity.
   * **Why C:** The text is about inner transformation, not sightseeing; what changes is how she sees, not which sights she collects.
   * **Why D:** The reverse is true — the place reshapes HER perception; she rejects measuring it against home ("Thimphu will never look like New York to me").

40. **Type: MCQ [Tests Purpose & Message]**
   @set:4
   @dim:purpose
   @text:zeppa
   * **Question:** What does Zeppa ultimately want the reader to feel or do — and what is her enduring message?
   * **Options:** A) To be warned that travelling to remote places is disorienting and best avoided, B) To meet the unfamiliar with humility and open attention rather than measuring it against home — she sets aside the "New York" yardstick and arrives at genuine admiration, so a place reveals itself, and reshapes us, only when we approach it on its own terms, C) To pity Bhutan for its poverty and isolation, D) To conclude that Western comforts are superior and that Bhutan needs modernising
   * **Correct:** B
   * **Feedback:** ✓ Correct. She sets aside the promise that "Thimphu will look like New York" and, by attending to Bhutan on its own terms, ends "full of admiration for this small country that has managed to look after itself so well" — the message is that openness, not comparison, lets a place transform the traveller.
   * **Why A:** Disorientation is where she begins, not her warning; it gives way to admiration, not avoidance.
   * **Why C:** Pity is exactly the reflex she moves past — she is charmed, then full of admiration, never pitying.
   * **Why D:** The opposite — she is drawn to "the Bhutanese-ness of everything else" and quietly rejects the New York comparison.

41. **Type: MCQ [Tests Writer's Voice]**
   @set:5
   @dim:voice
   @text:macdonald
   * **Question:** Whose voice tells this extract from *H is for Hawk*, and what is her stance toward the moment she describes?
   * **Options:** A) A detached expert falconer giving a technical, unemotional account of collecting a captive-bred bird, B) A reflective first-person voice at the very centre of the experience — the "I" whose "My heart jumps sideways" — overwhelmed and raw, with an unspoken weight ("something behind it that was very important") driving her fierce need for this particular bird, C) A calm outside observer who simply watches the man handle the hawk and reports his movements from a distance, D) A cheerful hobbyist delighting in a new pet, with nothing deeper at stake
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macdonald is the experiencing self at the heart of the scene — every image is filtered through her overwhelmed perception, and beneath the surface runs a grief she never names but which makes her plea for the bird more than "a simple one".
   * **Why A:** She is anything but detached; the prose is saturated with her own racing feeling, not neutral technical report.
   * **Why C:** She is not watching from outside — she is inside the moment, the "I" whose heart "jumps sideways" and who ends up pleading on the quayside.
   * **Why D:** The extract signals something far heavier than a hobby — "something behind it that was very important" — the private loss that drove her to the hawk.

42. **Type: MCQ [Tests Structure & Text Type]**
   @set:5
   @dim:form
   @text:macdonald
   * **Question:** How does the FORM of this writing shape the reader's response to the meeting with the hawk?
   * **Options:** A) It is a factual how-to guide to collecting a captive-bred hawk, laid out as neutral step-by-step instructions, B) It is a true remembered experience told with the heightened, image-crammed craft of literature — the syntax fractures into fragments ("Concentration. Infinite caution.", "Thump.") to place us inside the moment as it is lived, so a real event carries the full intensity of art, C) It is an objective news report of an event that puts verified facts before any feeling, D) It is an invented short story shaped purely for dramatic effect
   * **Correct:** B
   * **Feedback:** ✓ Correct. This is a real, lived memory rendered with a novelist's craft: the broken, breathless syntax and rush of imagery make the reader undergo the encounter rather than merely learn of it — art applied to raw experience.
   * **Why A:** It gives no instructions; its clipped fragments dramatise feeling, they do not teach a procedure.
   * **Why C:** A report subordinates feeling to fact; here the facts are drenched in the writer's overwhelmed perception.
   * **Why D:** It is not invented — it is a true remembered experience, which is precisely why its literary intensity carries such weight.

43. **Type: MCQ [Tests Methods & Effect]**
   @set:5
   @dim:methods
   @text:macdonald
   * **Question:** Macdonald piles up clashing images for the hawk — "a conjuring trick. A reptile. A fallen angel" — then "gold falling through water". What does this method DO to the reader?
   * **Options:** A) It decorates the passage with pretty comparisons for their own sake, B) The rush of contradictory images makes the reader feel Macdonald straining to grasp something too strange and overwhelming to fix in any single picture — we feel her awe and disorientation, not a tidy description, C) It gives a precise, factual description so the reader can picture the exact bird, D) It names a rhetorical device the reader is meant to identify
   * **Correct:** B
   * **Feedback:** ✓ Correct. No one image will hold the hawk, so the metaphors multiply and clash — and that very excess makes the reader share her struggle to comprehend a creature that overwhelms her.
   * **Why A:** The images are not ornament — their pile-up performs her failure to pin the hawk down, which is the point.
   * **Why C:** They do the opposite of clarifying: the images contradict each other because no single one suffices.
   * **Why D:** The point is the EFFECT — feeling her awe and disorientation — not labelling the comparisons "metaphor".

44. **Type: MCQ [Tests Themes & Ideas]**
   @set:5
   @dim:ideas
   @text:macdonald
   * **Question:** Which controlling idea does this extract most explore?
   * **Options:** A) That hawks make rewarding pets and falconry is an enjoyable pastime, B) That in a state of raw feeling the narrator fastens onto the sheer wildness and otherness of the hawk — an overwhelming, alien creature — as something to fix upon, so the encounter is charged with a private grief that presses beneath its surface, C) That the captive breeding of rare birds is cruel and ought to be reformed, D) That experts always stay calm while amateurs always panic
   * **Correct:** B
   * **Feedback:** ✓ Correct. The hawk becomes the vessel for feeling Macdonald cannot otherwise face — her sudden fierce love for the father she has lost, her desperate plea for this one bird, all point to a loss the extract never names but everywhere registers.
   * **Why A:** That is the surface event; the writing's intensity signals something far beyond a pastime.
   * **Why C:** The text makes no such argument — it is a personal encounter, not a case for reform.
   * **Why D:** The man's calm is one detail, not the idea; mistaking it for the theme misses the grief driving the narrator.

45. **Type: MCQ [Tests Purpose & Message]**
   @set:5
   @dim:purpose
   @text:macdonald
   * **Question:** What does Macdonald ultimately want the reader to feel — and what is the enduring message of the extract?
   * **Options:** A) To be persuaded to take up falconry themselves, B) To feel, from the inside, how overwhelming that first meeting was — so that we sense the grief pressing beneath it — leaving us with the insight that in our rawest moments we reach for something wild and alive outside ourselves, and that a real, lived experience can hold the full force of art, C) To learn the correct procedure for collecting a captive-bred hawk, D) To pity the writer for her distress and then do nothing with that feeling
   * **Correct:** B
   * **Feedback:** ✓ Correct. This is memoir, not persuasion: its aim is to make us live the moment — "everything is brilliance and fury" — and through it feel the unspoken grief, so we understand how a person in loss fastens onto something fierce and alive.
   * **Why A:** A memoir of raw feeling is not an advertisement; it seeks understanding, not recruitment.
   * **Why C:** The procedure is only the frame; the purpose is emotional truth, not instruction.
   * **Why D:** Pity that leads nowhere misreads the writing — it wants us to inhabit her experience and grasp its meaning, not merely feel sorry.

46. **Type: MCQ [Tests Writer's Voice]**
   @set:5
   @dim:voice
   @text:yenmah
   * **Question:** Whose voice tells this extract from *Chinese Cinderella*, and what is her stance toward the scene she recounts?
   * **Options:** A) A detached adult looking back on the child from a cool distance, with no real stake in what happens, B) The writer herself as the child at the centre of the memory — a reflective first-person voice whose heart is full of dread that she has done something wrong, yet who aches for the rare moment her father is "proud of me", C) A neutral reporter simply recording a family's afternoon without feeling, D) An angry accuser settling scores with the father and stepmother who rejected her
   * **Correct:** B
   * **Feedback:** ✓ Correct. Yen Mah writes as her own younger self, placed at the very centre of the scene — a reflective first-person voice that lets us feel the child's "dread" and her hunger for approval, not a detached observer and not an accuser.
   * **Why A:** She is not detached; every feeling on the page is her own, lived from the inside.
   * **Why C:** The account is saturated with feeling — dread, relief, longing — not a neutral record of events.
   * **Why D:** She does not accuse; she yearns for belonging, and the tone is longing and hope, not anger.

47. **Type: MCQ [Tests Structure & Text Type]**
   @set:5
   @dim:form
   @text:yenmah
   * **Question:** This extract comes from an autobiography. How does the way it is organised shape the reader's response?
   * **Options:** A) It opens with a thesis about family and then lists evidence to prove it, B) It leaps back and forth across many years of her childhood with no single timeline, C) It follows one afternoon in strict order — the summons, the dread-filled drive, the meeting with Father — so we share the child's suspense and feel her mood turn from fear to joy moment by moment, D) It reports the events from the outside, giving no access to what the narrator feels
   * **Correct:** C
   * **Feedback:** ✓ Correct. The extract tracks a single afternoon in chronological order; because we move through it in real time with the child — not knowing, as she does not, what awaits — we feel the reversal from foreboding to elation as it happens.
   * **Why A:** It is a remembered narrative, not an argument built on a thesis and evidence.
   * **Why B:** It does not roam across years; it holds to one continuous afternoon.
   * **Why D:** We are inside her feelings throughout — the dread, the relief, the soaring hope.

48. **Type: MCQ [Tests Methods & Effect]**
   @set:5
   @dim:methods
   @text:yenmah
   * **Question:** The narrator says the thought of leaving school "throbbed at the back of my mind like a persistent toothache". What does this DO to the reader?
   * **Options:** A) It turns her anxiety into a physical, nagging ache, so we feel the low, inescapable dread rather than simply being told she is worried, B) It adds a vivid but purely decorative detail that does not change how we feel, C) It points the reader to a rhetorical device to identify and label, D) It tells us she was genuinely unwell during the game of Monopoly
   * **Correct:** A
   * **Feedback:** ✓ Correct. Comparing the worry to a "persistent toothache" makes the fear bodily and constant — a dull ache that will not leave — so the reader feels the nagging dread instead of merely reading that she is anxious.
   * **Why B:** The comparison is not decoration; it carries the exact quality of her fear — low, continuous, impossible to ignore.
   * **Why C:** The point is the feeling it creates, not naming the technique.
   * **Why D:** There is no real toothache; the ache is the shape of her anxiety, not a physical illness.

49. **Type: MCQ [Tests Themes & Ideas]**
   @set:5
   @dim:ideas
   @text:yenmah
   * **Question:** Which controlling idea does this extract most explore?
   * **Options:** A) That winning prizes is the surest path to success, B) That growing up in a wealthy family guarantees a happy, secure childhood, C) That children should obey their parents without ever questioning them, D) A rejected child's deep hunger for her father's love and for belonging — and how fragile and conditional that approval turns out to be
   * **Correct:** D
   * **Feedback:** ✓ Correct. The whole scene is driven by a child starved of affection reaching for a father's approval; when it finally comes it is real but precarious — his pride depends on her having "given him face", and he at once redirects her future to his own plan.
   * **Why A:** The prize is only the occasion; the extract is about what she longs for from her father, not about success itself.
   * **Why B:** That comfortable assumption is exactly what her life overturns — the family's wealth sits alongside her rejection, it does not cure it.
   * **Why C:** The extract does not preach obedience; her silent agreement is the price she pays for a chance at escape, rendered with feeling rather than approval.

50. **Type: MCQ [Tests Purpose & Message]**
   @set:5
   @dim:purpose
   @text:yenmah
   * **Question:** What does Yen Mah ultimately want the reader to feel or understand — and what is the extract's enduring message?
   * **Options:** A) To pity her as a helpless victim and feel nothing beyond that, B) To feel the intensity of a neglected child's longing for approval — how one rare word of pride can make her feel able to "reach the stars" — and to understand how precious, and how conditional, belonging becomes when love is scarce, C) To warn readers never to trust their parents, D) To celebrate the comforting lesson that hard work is always rewarded in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She wants us inside the child's overwhelming hope — a single approving moment feels like reaching "the stars" — while quietly showing how conditional that approval is, so we grasp the depth of a child's need for belonging rather than merely pitying her.
   * **Why A:** Pity keeps the reader at a distance; she wants us to feel the longing from within, not look down on a victim.
   * **Why C:** The extract does not urge distrust; it renders a child's yearning for love, even from a father who withholds it.
   * **Why D:** Her father overrides her own wish and dictates her future — the moment is bittersweet, not a tidy reward for effort.
