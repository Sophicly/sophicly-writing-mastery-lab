# Foundational Quiz Bank — Lord of the Flies

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Lord of the Flies is a **dystopian allegorical fable** → the `effects` aspect tests the reader's
**fear-as-warning, dread and unease at the savagery within** (disquiet at our own complicity), not the
naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`lord_of_the_flies.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Lord of the Flies

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Ralph *changes* across the novel — and what drives the change?
   * **Options:** A) He is savage and cruel from the first chapter and never really changes, B) He begins a confident boy, elected chief, who trusts in rules and rescue — and becomes a hunted, weeping boy who has learned "the darkness of man's heart", driven by witnessing, and briefly sharing in, the savagery around him, C) He becomes a face-painted hunter exactly like Jack by the end, D) He is unchanged throughout — a passive victim to whom things simply happen
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ralph's arc is a loss of innocence: from a boy who believes order and rescue are natural to one who has seen the savagery in others — and in himself. That descent into knowledge is the point.
   * **Why A:** Ralph opens as the hopeful, order-keeping chief, not a savage; the drama lies in what he *learns*, not in fixed cruelty.
   * **Why C:** Ralph *resists* Jack's savagery to the end; making him Jack's twin erases the very opposition his character stands for.
   * **Why D:** He is not passive — he takes part in the frenzy that kills Simon, and it is that complicity, not mere misfortune, that transforms him.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Ralph the novel's *everyman* protagonist rather than simply a flawless hero or a villain?
   * **Options:** A) He is a spotless hero who stays pure and untouched by the island's evil, B) He is an ordinary boy — neither wholly good nor immune — who strives to hold order yet is drawn into the dance that kills Simon, so his fall into knowledge implicates us all, C) He is the cruellest of the boys and rules through fear, D) He is a helpless innocent who plays no part in any of the violence
   * **Correct:** B
   * **Feedback:** ✓ Correct. Ralph is "one like us": an ordinary boy tested past his limits, good but not exempt. His brief complicity is what makes the darkness *everyone's*, which is the fable's whole point.
   * **Why A:** If he were untouched, the novel's warning would not reach us; his slip into the frenzy is exactly what proves the darkness is universal.
   * **Why C:** That describes Jack (and Roger); Ralph stands for order against them, not for cruelty.
   * **Why D:** He is not blameless — he shares in Simon's killing; treating him as pure innocence misses how the fable implicates even the "good" boy.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Ralph's evolution from beginning to end?
   * **Options:** A) A savage hunter at the start → a gentle peacemaker at the end, B) A confident boy who blows the conch and believes in rescue and rules → a hunted, sobbing boy who weeps "for the end of innocence, the darkness of man's heart", C) The leader of the hunters at the start → a rescued hero, wholly unchanged, D) A silent outsider at the start → the island's tyrant at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from cheerful faith in order to grief-stricken knowledge — the same boy, hollowed by what he has seen and done. That arc IS the loss of innocence.
   * **Why A:** He starts hopeful and civilised, not a savage hunter; this reverses his actual arc.
   * **Why C:** He is profoundly changed by the close — his final weeping shows knowledge gained, not a hero untouched.
   * **Why D:** Ralph is the elected chief and the voice of order, never the tyrant; that role belongs to Jack.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Ralph's transformation is driven not only by what happens to him but by his own discovery that the savagery is in him too — he shares in the frenzied dance that kills Simon.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Ralph's descent into knowledge is partly self-inflicted: his complicity in Simon's death forces him to face the darkness within, not merely around, him — which is what makes his final grief so bitter.
   * **WhyWrong:** Ralph is not a pure bystander — his part in the dance that kills Simon is exactly what teaches him "the darkness of man's heart"; reading him as untouched removes the self-knowledge that transforms him.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the boys' fear of "the beast" *lead to* Jack's rise to power? (What is the causal link?)
   * **Options:** A) The fear and Jack's rise are unconnected events that simply happen in that order, B) The fear creates a craving for protection, and Jack exploits it — offering meat, the hunt and the promise of safety from the beast — so terror drives the boys away from Ralph's order and into Jack's tribe, C) The beast itself orders the boys to follow Jack, D) Jack becomes leader because he wins a calm, fair election
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: fear makes the boys long for a protector, and Jack turns that fear into power. The descent is a causal chain, not a list of events.
   * **Why A:** In a fable events follow by cause, not mere sequence; reading the fear and Jack's rise as unconnected misses the engine of the whole descent.
   * **Why C:** There is no real beast issuing orders — the "beast" is the boys' own fear, which Jack manipulates; the causation is human, not supernatural.
   * **Why D:** Jack seizes power by exploiting terror and breaking away, not by fair election — Ralph was the one democratically chosen.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the island's descent — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike the boys by bad luck, B) Order is set up (conch, fire, shelters) → fear of the beast spreads → Jack exploits the fear and breaks away → face-paint and the hunt free the boys from shame → savagery escalates to the killing of Simon and Piggy, C) The island itself magically turns the boys evil, so nothing is their doing, D) Nothing really causes anything; the boys are rescued before any change occurs
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before: fear feeds Jack's power, the loss of restraint frees the violence, and the killings follow. That causal spine is what makes it a fable, not a chronicle.
   * **Why A:** The collapse is not random misfortune — it is the logical outworking of fear, lost rules and unleashed savagery.
   * **Why C:** The island works no magic; the boys descend through their own fear and choices — blaming the place erases the human causation.
   * **Why D:** The boys change profoundly *before* the rescue — Simon and Piggy are dead and Ralph is being hunted by the time the officer arrives.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which act is the turning point that makes the descent irreversible — the point of no return?
   * **Options:** A) The election of Ralph as chief, B) The frenzied killing of Simon — once the boys murder one of their own, there is no way back to innocence or order, C) The first sighting of a ship on the horizon, D) The building of the first shelter on the beach
   * **Correct:** B
   * **Feedback:** ✓ Correct. Simon's murder is the irreversible act: the boys become killers of their own, and every later horror — Piggy's death, the hunt for Ralph — follows from that crossing.
   * **Why A:** Ralph's election establishes order; nothing is yet lost — it is the opposite of a point of no return.
   * **Why C:** The ship is a missed chance of rescue, a consequence of neglect, not the choice that makes the fall inevitable.
   * **Why D:** Building shelters is part of the boys' early attempt at civilisation, not the act that dooms it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** The disasters on the island follow by cause-and-effect from the boys' fear and the loss of their rules — they are not just a string of unconnected events.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The plot is built on necessity, not mere sequence: fear feeds Jack's power, lost restraint frees the violence, and the killings follow — each event *because of* the last.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal spine — the fear and the collapse of rules *drive* every disaster, which is what makes the story a fable rather than a chronicle.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The hunters chant "Kill the pig. Cut her throat. Spill her blood." What does this reveal about the novel's view of savagery?
   * **Options:** A) That hunting is simply a useful survival skill, B) That once restraint is removed an appetite for violence grows and spreads — the chant's escalating bloodlust is later turned murderously on the boys themselves, C) That the boys are only playing a harmless game, D) That Jack alone, and no one else, is capable of cruelty
   * **Correct:** B
   * **Feedback:** ✓ Correct. The ritual chant tracks the boys' descent: the taste for blood grows until it is turned on Simon. Savagery, once loosed, does not stay contained — that is the theme.
   * **Why A:** The chant is about the *thrill* of killing, not survival; the novel treats the hunt as a slide into savagery, not a life skill.
   * **Why C:** It begins as play but becomes deadly — reading it as harmless misses how the "game" ends in murder.
   * **Why D:** The point is universal, not personal: even the "littluns" and Ralph are drawn in; the darkness is in all the boys, not just Jack.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The boys' terror of "the beast" runs through the novel. Which controlling idea does it announce?
   * **Options:** A) That the real evil is not an outside monster but the savagery within human beings themselves, B) That there is a literal creature on the island that must be hunted and killed, C) That the boys are safe as long as they stay together, D) That the adults left behind would surely keep them safe
   * **Correct:** A
   * **Feedback:** ✓ Correct. The "beast" they hunt outside is the darkness inside them — Simon alone grasps this. The novel's central idea is that evil is internal, a part of human nature, not an external monster.
   * **Why B:** There is no real beast; treating it as a huntable creature is the very misreading that dooms the boys — the danger is in themselves.
   * **Why C:** Togetherness offers no safety here — it is the *group* frenzy that kills Simon; the threat comes from within the community.
   * **Why D:** The adult world is fighting its own savage war; the novel denies that grown-ups are any safer from the darkness.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Civilisation and savagery are held in tension. How does that theme *work* through the conch and Piggy's glasses?
   * **Options:** A) They are just useful objects with no larger meaning, B) The conch (order and fair debate) and the glasses (reason and science) hold savagery back — and as they are seized and shattered, civilisation itself collapses into violence, C) They show the boys are wealthy and well-educated, D) They prove the island is a paradise
   * **Correct:** B
   * **Feedback:** ✓ Correct. The two objects embody the fragile structures of civilisation; the theme *works* by tying their destruction to the descent — when the conch smashes and the glasses are stolen, reason and order die with them.
   * **Why A:** Their whole force is symbolic — the novel makes their fate stand for the fate of civilisation itself.
   * **Why C:** They stand for order and reason, not status or wealth; reading them as class markers misses the theme.
   * **Why D:** They mark civilisation's *fragility*, not paradise — their loss is the collapse of everything holding savagery back.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In the novel the thin "veneer" of civilised behaviour the well-raised boys bring with them proves fragile — once the rules fall away, the darkness inside surfaces.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Golding makes the boys' proper upbringing the point: if even choirboys and schoolboys slide into savagery, civilisation is only a thin crust over an innate human darkness.
   * **WhyWrong:** The boys' good upbringing does *not* protect them — that is exactly Golding's warning: the veneer of civilisation is thin in everyone, and the savagery beneath it surfaces the moment the rules go.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Lord of the Flies is a dystopian fable. Why do we feel a creeping *dread* as the boys descend, rather than simple excitement?
   * **Options:** A) Because we are frightened of a real monster stalking the island, B) Because the horror comes from within ordinary, civilised children — the dread is the fear that this savagery lies in everyone, including us, C) Because we worry the boys will be bored on the island, D) Because the island's storms and weather are frightening
   * **Correct:** B
   * **Feedback:** ✓ Correct. A fable of this kind works by turning our fear inward: the dread is not of a beast but of *ourselves* — the recognition that the same darkness could surface in anyone.
   * **Why A:** There is no real monster; the fear that grips us is moral and human — that the beast is *inside* the boys, and us.
   * **Why C:** The unease is about savagery, not boredom — the descent is horrifying precisely because it is exciting to the boys.
   * **Why D:** Weather is only a backdrop; the true source of dread is the human capacity for evil the novel uncovers.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A cautionary fable such as this is designed to make the reader feel — above all — which response?
   * **Options:** A) Delight and relief that order is happily restored, B) Fear as a warning, and unease at how easily we might be complicit — a disquiet that the savagery is our own, C) Admiration for Jack's strong leadership, D) Amusement at the boys' games and adventures
   * **Correct:** B
   * **Feedback:** ✓ Correct. A dystopian fable aims to disturb, not comfort: it leaves us afraid *for* ourselves — warned that the darkness on the island is a darkness in us all.
   * **Why A:** Delight and relief belong to comedy; this fable withholds any comforting resolution — even the rescue brings no peace.
   * **Why C:** Jack's rule is a warning about demagoguery, not something to admire; feeling admiration mistakes the target of the fable.
   * **Why D:** The "games" curdle into murder; amusement is exactly the response the novel dismantles.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the naval officer's rescue at the end bring no real relief — only a deeper unease?
   * **Options:** A) Because the boys are sad to leave the beautiful island, B) Because nothing about the darkness is undone — Ralph weeps for "the darkness of man's heart", and we realise the adult world the officer represents is fighting its own savage war, C) Because the officer is unkind and refuses to help them, D) Because the boys would rather stay and keep hunting
   * **Correct:** B
   * **Feedback:** ✓ Correct. The rescue rescues no one from the truth: the officer's warship shows the grown-up world at the same savagery, so the ending leaves us uneasy, not relieved — a warning, not a happy escape.
   * **Why A:** Ralph weeps for lost innocence and human darkness, not for the scenery; the sorrow is moral, not sentimental.
   * **Why C:** The officer does rescue Ralph — the unease comes not from his manner but from what his war reveals about all of us.
   * **Why D:** The boys are horrified at what they have become; the disquiet is Golding's, aimed at the reader, not a wish to keep hunting.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** The novel is built to leave us not triumphant but uneasy — afraid that the savagery uncovered on the island lies within all of us, a warning rather than an adventure.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That is the fable's intended effect: dread and unease at our own capacity for savagery, so we leave the book warned about human nature, not cheered by a rescue.
   * **WhyWrong:** The ending is designed to disturb, not satisfy — the rescue offers no comfort because the darkness is in us; feeling triumphant or thrilled misreads a cautionary fable as an adventure story.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about human nature?
   * **Options:** A) That children are innately good and remain innocent whatever happens, B) That beneath the thin veneer of civilisation savagery lies within every human being — remove the rules and ordinary people descend into cruelty; evil is internal, not an outside "beast", C) That only a few uniquely bad individuals cause evil, D) That civilisation, once built, can never break down
   * **Correct:** B
   * **Feedback:** ✓ Correct. Golding's fable insists the darkness is *in us*: strip away society's rules and the capacity for savagery surfaces in anyone — the novel's enduring "so what".
   * **Why A:** The novel dramatises the opposite — even well-raised children slide into violence; innate innocence is the illusion it dismantles.
   * **Why C:** The point is universal, not exceptional: it is *all* the boys, not a few villains, in whom the darkness surfaces.
   * **Why D:** The whole fable shows civilisation collapsing with frightening ease — its fragility is the warning.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the novel suggest keeps human savagery in check?
   * **Options:** A) Nothing keeps it in check; violence is simply present in equal measure at all times, B) Fragile human structures — rules, reason and shared order (the conch, the fire, the glasses) — restrain the darkness, and when they fail, savagery is unleashed, C) The natural, unshakeable goodness of children, D) The mere fact of being isolated on an island
   * **Correct:** B
   * **Feedback:** ✓ Correct. The fable's message is double: the darkness is innate, but *civilisation's rules* hold it back — so their collapse, not the island itself, is what frees the savagery.
   * **Why A:** The novel shows restraint doing real work early on; savagery grows *as the rules fail*, not at a constant level.
   * **Why C:** It denies innate goodness — the children turn cruel; it is external order, not inner virtue, that briefly holds them.
   * **Why D:** Isolation only removes the rules; it is the loss of civilised structures, not the island, that unleashes the darkness.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** A lasting message of the novel is that the "beast" is not an external creature but the evil within human beings — the true danger is our own capacity for savagery.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Simon's insight is the fable's thesis: the beast is inside them. The enduring message is that humanity's real danger is the darkness it carries within, not any monster without.
   * **WhyWrong:** The beast is internal — Golding's central message is that the thing to fear is the savagery within ourselves; treating it as an outside monster is the very error the novel exists to correct.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written after the Second World War, the fable ultimately warns which idea?
   * **Options:** A) That British boys are naturally more civilised than others, B) That the capacity for barbarism is universal and civilisation is fragile — the same darkness that fuels adult wars lives in ordinary people everywhere, C) That war is caused only by a handful of uniquely evil leaders, D) That innocence, once lost, is easily regained
   * **Correct:** B
   * **Feedback:** ✓ Correct. Having seen the war's horrors, Golding wrote to warn that savagery is not foreign or rare but universal — the island's descent mirrors the adult world destroying itself.
   * **Why A:** The novel overturns that comforting idea — its "civilised" British boys descend into savagery; national superiority is the myth it attacks.
   * **Why C:** The warning is that the darkness is in *everyone*, not a few leaders — the same capacity that drives the boys drives the adult war overhead.
   * **Why D:** Ralph weeps for "the end of innocence" precisely because it cannot be regained — the loss is permanent, which is the fable's grief.
