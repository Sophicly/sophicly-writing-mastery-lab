# Foundational Quiz Bank — Journey's End

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Journey's End is an **anti-war tragedy** (tragedy of war / tragic realism) → the `effects` aspect
tests the audience's **pity and pathos** — grief at the futile waste of young lives and the dread of
waiting — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`journeys_end.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Journey's End

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Stanhope *changes* across the play — and what drives the change?
   * **Options:** A) He is a hopeless drunkard from the very first scene and never really changes, B) Once a fresh, admired schoolboy hero, three years at the front have worn him into an exhausted, whisky-dependent commander — yet he chooses to master his terror and keep leading his men rather than break, C) He begins strong and by the end deserts the company to save himself, D) The war leaves him untouched — he feels nothing and simply carries on
   * **Correct:** B
   * **Feedback:** ✓ Correct. The tragedy is the *change*: the war has ground a healthy, hero-worshipped young man into a frayed, drink-reliant officer — and what moves us is that he still *chooses* to stay and lead, not that fate broke him.
   * **Why A:** He was a fit, admired schoolboy before the war; the drinking is the mark of how far the strain has worn him, not a fixed trait — reading him as always-broken kills the change.
   * **Why C:** Stanhope never deserts — that is Hibbert's impulse; Stanhope's defining choice is to endure and command to the end.
   * **Why D:** The whole point is how deeply the war *has* changed him — his ruined nerves and dread of Raleigh seeing him prove he is anything but untouched.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Stanhope a figure who *moves* us, rather than simply a broken drunkard?
   * **Options:** A) He is a flawless hero who feels no fear at all, B) He is neither faultless hero nor mere wreck — a decent young man ground down by strain who still holds himself and his company together by sheer will, so his suffering earns our pity, C) He is a selfish coward who cares only for saving his own skin, D) He escapes the war unharmed and thrives afterwards
   * **Correct:** B
   * **Feedback:** ✓ Correct. Stanhope is an in-between figure: real courage and decency, visibly cracking under the cost — that middle position is exactly why his ordeal moves us rather than merely disgusts or impresses.
   * **Why A:** He is terrified throughout; a fearless hero would not move us — it is precisely his fear, mastered, that makes him human.
   * **Why C:** He drinks to keep going *so he can* command; he stays for his men, which is the opposite of caring only for himself.
   * **Why D:** He is destroyed by the strain and left grieving over Raleigh's body — there is no thriving escape.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Stanhope's evolution from before the war to the play's present?
   * **Options:** A) A cowardly shirker at school → a celebrated, decorated general, B) A healthy schoolboy hero whom Raleigh once worshipped → a frayed, whisky-reliant commander who dreads Raleigh seeing how the war has changed him — yet stays at his post, C) A raw new recruit → a calm, untroubled veteran at peace with the front, D) An enemy officer → a loyal British hero
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from admired young athlete to exhausted, drink-dependent officer — the same man, hollowed out by three years of dread — and still chooses to lead. That arc is the play's quiet tragedy.
   * **Why A:** He was admired, not a shirker, and he is worn down, not decorated and thriving — this reverses his actual arc.
   * **Why C:** He is anything but untroubled — his nerves are shattered and he leans on whisky; "at peace" misreads his suffering.
   * **Why D:** Stanhope is a British company commander throughout; this confuses who he is entirely.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Stanhope's endurance is driven above all by his own choice to stay and do his duty — the strain tempts him toward escape, as it does Hibbert, but he chooses to keep leading his men.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The war has worn him terribly, but the decision to remain, command and share the danger is *his* — that choice is what turns a broken man into a figure of quiet heroism rather than a mere victim.
   * **WhyWrong:** The war does not simply crush Stanhope into passivity — he actively chooses endurance and duty over escape, and that choice is what makes him move us.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the high command's order *lead to* Osborne's death? (What is the causal link?)
   * **Options:** A) The order and the death are unconnected events that simply happen in sequence, B) The colonel orders a daylight raid to snatch a German prisoner for information; obedient officers must cross open ground in daylight — near-suicidal — so the raid brings back a prisoner but Osborne is killed carrying out an order he cannot refuse, C) Osborne decides to die heroically for no particular reason, D) Stanhope sends Osborne to his death out of jealousy
   * **Correct:** B
   * **Feedback:** ✓ Correct. One thing *causes* the next: the command wants a prisoner, so a deadly daylight raid is ordered, and men bound to obey pay for it with Osborne's life. The causation flows from the war's demands, not chance.
   * **Why A:** In this tragedy the death follows *because of* the order, not merely after it — reading them as unconnected misses the cruel causal chain.
   * **Why C:** Osborne does not seek death; he goes because he is ordered to, dreading it, which is exactly what makes the loss so bitter.
   * **Why D:** Stanhope has no such motive — he grieves Osborne deeply; the raid is forced from above, not engineered by him.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the play's tragedy — not just the order of events?
   * **Options:** A) A string of unrelated misfortunes that strike the men by bad luck, B) The men wait, powerless, for the coming offensive → high command orders a costly daylight raid → Osborne is killed carrying it out → the long-dreaded attack finally breaks → Raleigh is fatally wounded and dies → the dugout is shelled into darkness, C) The men bring their fate on themselves through their own reckless mistakes, D) Nothing really causes anything; the events are simply random
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage follows by necessity from the machinery of war the men cannot escape — orders, raid, offensive — so the plot is a tightening arc of imposed loss, not a list of happenings.
   * **Why A:** Their ruin is not random luck — it is the logical outworking of the war's demands closing in on them.
   * **Why C:** The pathos is precisely that the men make no fatal error — their doom is *imposed* from above; blaming them misreads where the causation lies.
   * **Why D:** Reading the events as random misses the causal spine — each loss is *because of* the orders and the offensive, not mere sequence.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which event is the turning point that hollows out the company just before the final attack?
   * **Options:** A) Raleigh's arrival at the dugout, B) Osborne's death in the raid — the loss of the steady, fatherly "Uncle" breaks the company's heart at the very moment the offensive arrives, C) Trotter planning to draw a circle for each of the 144 hours in the line, D) Hibbert's claim of neuralgia
   * **Correct:** B
   * **Feedback:** ✓ Correct. Osborne's death is the pivot: the calm centre of the dugout is gone, Stanhope is left desolate, and the men face the attack already grieving. Everything after darkens from that loss.
   * **Why A:** Raleigh's arrival opens the play's tension; it is not the loss that breaks the company.
   * **Why C:** Trotter's circles dramatise the strain of waiting — a detail of the mood, not the turning point.
   * **Why D:** Hibbert's neuralgia is a subplot of fear and duty, not the pivot on which the tragedy turns.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Journey's End the men's fates follow by cause-and-effect from the war's demands — the orders, the raid, the offensive — not from any error of their own; the pathos lies in their powerlessness to change what is coming.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The causal engine is the war itself: each loss is *because of* an order or the offensive, and the men, bound to obey, cannot avert it. That imposed necessity is what makes the plot a tragedy rather than a chronicle.
   * **WhyWrong:** The events are not a random string, nor the men's own fault — they follow inexorably from the machinery of war the men are powerless to resist, which is exactly where the pity comes from.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** How does the play present *true courage*? Which idea does it most explore, and how does it work?
   * **Options:** A) As feeling no fear whatsoever, B) As the endurance of fear rather than its absence — Stanhope is terrified yet keeps leading by sheer force of will, and the play honours that daily struggle to go on, C) As a reckless enjoyment of danger, D) As something only cowards ever feel
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's controlling idea of courage is endurance: the bravest men are the most afraid, and heroism is mastering that terror to do one's duty, not being untouched by it.
   * **Why A:** The play shows the opposite — its bravest men are deeply frightened; courage lies in overcoming fear, not lacking it.
   * **Why C:** Danger is dreaded, not relished; Journey's End rejects the idea of war as a thrill.
   * **Why D:** Fear is universal in the trenches — even the most heroic feel it, so it cannot be the mark of a coward alone.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The officers lean on one another — Osborne steadying the younger men. Which controlling idea does this most explore, and how does it work?
   * **Options:** A) That the men secretly despised one another, B) That comradeship and mutual care are what let men endure the terror of the front — fellowship is a shield against fear, the one warmth in a place of dread, C) That friendship was forbidden between officers, D) That the men never really spoke to each other
   * **Correct:** B
   * **Feedback:** ✓ Correct. The warmth between the officers is the play's answer to the horror: comradeship becomes the vital support that makes the unbearable bearable, an idea woven through every quiet exchange in the dugout.
   * **Why A:** Their loyalty and affection, not hatred, are what sustain them; the bond is the play's core comfort.
   * **Why C:** Fellowship is exactly what keeps them going — it is quietly essential, never against the rules.
   * **Why D:** The dugout is full of shared talk and feeling; the men lean on one another constantly.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Hibbert tries to escape the front by feigning neuralgia. Which idea does this episode most explore?
   * **Options:** A) That all soldiers are secretly cowards, B) The pull between self-preservation and duty — the play understands the terror that makes a man want to flee, yet shows Stanhope bringing Hibbert to stay and share the danger, so duty and comradeship win out, C) That illness always excused a man from the line, D) That Hibbert is simply lazy
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Hibbert scene dramatises the play's tension between the instinct to save oneself and the obligation to one's comrades — and Stanhope's steadying of him shows duty and fellowship prevailing over fear.
   * **Why A:** The play sympathises with fear rather than condemning all men as cowards; it shows how terror can be mastered.
   * **Why C:** Hibbert's illness is a pretext, and Stanhope refuses to let it release him — the point is duty, not medical excuse.
   * **Why D:** Hibbert is not lazy but terrified; reading it as laziness trivialises the genuine fear the scene explores.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** Through the young Stanhope, worn down after three years at the front, the play explores how war destroys the youth and nerves of those who fight it.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Stanhope is still young yet exhausted and frayed, embodying one of the play's central ideas: how the war consumed the youth, health and nerve of a whole generation.
   * **WhyWrong:** This is true — Stanhope's ruined nerves show the terrible cost the war exacted from the young, one of the play's controlling themes.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Journey's End is an anti-war tragedy. Why do we feel deep *pity* as Osborne is killed and Raleigh dies?
   * **Options:** A) Because their deaths are exciting and satisfying to watch, B) Because we have come to love these decent, ordinary men, so their deaths feel like a terrible, needless waste — the play makes their loss ache rather than thrill, C) Because they were villains who had it coming, D) Because we are simply frightened of the German soldiers
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play builds our affection for gentle Osborne and hopeful Raleigh precisely so their deaths wound us; the intended feeling is grief at wasted life, not excitement.
   * **Why A:** An anti-war play is designed to make death *ache*, not thrill — reading it as exciting inverts the whole effect.
   * **Why C:** They are the gentlest and most hopeful of the men, not villains; their innocence is what makes the loss so bitter.
   * **Why D:** The deeper feeling is pity for the men we have grown to love, not mere fright at the enemy — that reduces pathos to shock.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** An anti-war play such as Journey's End is designed to leave the audience feeling — above all — which emotion?
   * **Options:** A) Excitement and pride at a heroic victory, B) Pity and grief at the futile waste of young lives, C) Amusement at the officers' banter, D) Relief and reassurance that the war was worthwhile
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play strips war of glory to leave us mourning the waste of ordinary, decent young men — pity and grief are the emotions the whole arc is built to arouse.
   * **Why A:** Excitement and pride belong to romantic war-writing; Journey's End deliberately refuses that glory.
   * **Why C:** The dugout humour is real, but it only sharpens the tragedy — the intended lasting feeling is grief, not amusement.
   * **Why D:** The play offers no reassurance that the sacrifice was worth it — its bleak close leaves us disquieted, not comforted.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why does the long wait for the German offensive fill us with *dread* rather than excitement?
   * **Options:** A) Because we expect the men to win a glorious victory, B) Because we know, with the men, that the attack is coming and cannot be stopped — the helpless anticipation makes us share their tension and fear for lives we cannot save, C) Because the confined dugout is a soliloquy, D) Because we are bored and simply want it to be over
   * **Correct:** B
   * **Feedback:** ✓ Correct. The suspense is dread, not thrill: we wait powerlessly alongside the officers, knowing the offensive will come, and that shared, helpless fear for men we have grown to love is the effect the waiting produces.
   * **Why A:** We do not anticipate triumph — we anticipate loss, which is why the waiting feels like dread, not hope.
   * **Why C:** "Soliloquy" names a stage device, not a feeling — the question asks what we *feel*, and the answer is dread, not the naming of a technique.
   * **Why D:** The tension is charged with fear for the men, not boredom; reading it as tedium misses the dread the anticipation creates.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close — the dugout shelled into darkness after Raleigh's death — we are meant to feel pity and desolation at the waste of young life, not triumph or relief.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The final descent into darkness is engineered to leave us mourning: pity for the wasted young lives and desolation at the futility, the emotional effect an anti-war tragedy is built to produce.
   * **WhyWrong:** The intended effect is grief and pity at futile waste, not satisfaction at a victory; the closing darkness leaves us mourning, not cheering.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about war?
   * **Options:** A) That war is a glorious adventure well worth its cost, B) That war is not glory but the futile waste of ordinary, decent young lives — and that the real heroism lies in quiet endurance and loyalty to one another, not in celebrated victory, C) That only cowards suffer in war, D) That war leaves no real mark on those who fight it
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sherriff strips away romance to insist that war destroys the best of a generation for little, and that what dignity there is lies in the men's endurance and fellowship — the play's enduring "so what".
   * **Why A:** The play dramatises the opposite — it exposes war's waste, not its glory.
   * **Why C:** Its bravest men suffer most; suffering in the play is universal, not a mark of cowardice.
   * **Why D:** War's mark is everywhere — in Stanhope's ruined nerves and the men's deaths; the message insists on its terrible cost.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the destruction of Osborne and Raleigh — the gentlest and the most hopeful of the men — suggest about Sherriff's view of the conflict?
   * **Options:** A) That the war rewards the most deserving men, B) That the war devours the best and most promising indiscriminately, exposing its cruelty and waste — an anti-heroic, anti-war judgement, C) That such deaths were rare and untypical of the front, D) That the men should simply have fought harder
   * **Correct:** B
   * **Feedback:** ✓ Correct. By killing the kindest and the most hopeful, the play makes its argument: the war spares no one and squanders its finest — a clear anti-war judgement on a pitiless machine.
   * **Why A:** The war rewards no one here — it takes the best, which is precisely the injustice the play condemns.
   * **Why C:** The deaths stand for countless others; treating them as untypical blunts the play's universal indictment.
   * **Why D:** Their deaths follow from orders and the offensive, not any failing of their own — blaming them misreads where the play lays responsibility.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that true courage is not fearlessness but the will to endure terror and stand by one's comrades.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Stanhope's terrified endurance and the officers' loyalty to one another affirm the play's moral: heroism is mastering fear and staying true to those beside you, not feeling no fear at all.
   * **WhyWrong:** The play insists courage means enduring fear and standing by one's comrades — not the absence of fear — which is central to its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written by a man who had himself served as an officer in the trenches, the play ultimately affirms which idea?
   * **Options:** A) That the war was a splendid, romantic adventure, B) That the fear, endurance and loyalty of ordinary soldiers deserve honest witness — stripping away romance to honour the human truth of what they suffered, C) That the officers were incompetent fools, D) That life in the trenches was comfortable and safe
   * **Correct:** B
   * **Feedback:** ✓ Correct. Drawing on his own service, Sherriff refuses glory in order to tell the truth: he honours the ordinary men's fear, endurance and fellowship, insisting their suffering be seen clearly.
   * **Why A:** The play deliberately dismantles the romantic view of war rather than affirming it.
   * **Why C:** The officers are shown as decent men doing their duty under unbearable strain, not as fools.
   * **Why D:** The dugout is cramped, grim and shadowed by imminent death — the reverse of comfortable and safe.
