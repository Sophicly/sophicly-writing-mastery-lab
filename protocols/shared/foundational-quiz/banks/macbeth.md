# Foundational Quiz Bank — Macbeth

Deterministic, code-scored foundational recall bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (learning-science: 3–5 is the low-stakes
retrieval sweet spot; longer fatigues + lowers reliability — Neil + research 2026-07-11). Keys + feedback
live server-side and are stripped before questions reach the client. The AI is never the scorekeeper.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_5_effect` · Message → `cn_section_7`. A correct answer autofills that aspect's
pre-authored note (`macbeth.concept-notes.md`) into the CN doc; mastery completes all five.

**Recognition-led** (low floor so a student can plausibly succeed + keep moving): mostly MCQ / True-False
with strong competitive distractors + why-wrong glosses; fill-in-the-blank ONLY for unmissable iconic
answers. Deeper production-recall is reserved for the later MSQ / MSA stages.

### Quiz: Macbeth

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best describes Macbeth's journey as a tragic hero across the play?
   * **Options:** A) A villain from the very first scene who never changes, B) A brave, honoured general whose choice to act on the prophecy turns him into an isolated, guilt-ridden tyrant, C) An innocent man wrongly accused of Duncan's murder, D) A comic figure who escapes punishment
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth begins as "brave Macbeth", a valued soldier; his decision to murder Duncan — not ambition alone — is the hamartia that drives his fall from hero to tyrant.
   * **Why A:** He is honoured and loyal at the start; the tragedy lies in his change, not in fixed villainy.
   * **Why C:** Macbeth is the murderer, not a wronged innocent — the guilt he suffers is his own.
   * **Why D:** The play is a tragedy; Macbeth is killed, and there is nothing comic in his ruin.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** At the start of the play, how is Macbeth presented before the murder?
   * **Options:** A) As a cowardly traitor, B) As a brave and loyal soldier, honoured by King Duncan for his valour in battle, C) As a weak king already on the throne, D) As one of the witches
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth is introduced as "brave Macbeth", a courageous general rewarded by Duncan — which makes his later betrayal all the more shocking.
   * **Why A:** The traitor at the start is the old Thane of Cawdor; Macbeth is the loyal hero who replaces him.
   * **Why C:** Macbeth is a general, not yet a king, when the play opens.
   * **Why D:** The witches prophesy to Macbeth; he is their subject, not one of them.

3. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Before killing Duncan, Macbeth is torn by conscience — he knows the murder is wrong and hesitates, rather than acting without any doubt.
   * **Answer:** True
   * **Feedback:** ✓ Correct. In his soliloquies Macbeth weighs the horror of the deed and almost pulls back; his ambition overrides a conscience that never fully goes quiet.
   * **WhyWrong:** Macbeth is deeply conflicted — his soliloquies show him wrestling with guilt and fear before he acts, not killing coldly.

4. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** By the end of the play, what has Macbeth become?
   * **Options:** A) A beloved and peaceful king, B) An isolated, feared tyrant, abandoned and weary of life, who dies in battle, C) A repentant man who is forgiven and restored, D) The rightful heir returned to the throne
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth ends alone and hated, his wife dead and his cause lost — "a tale told by an idiot" — before Macduff kills him and order is restored.
   * **Why A:** His reign brings tyranny and fear, not peace or love.
   * **Why C:** There is no repentance or forgiveness — he fights on to the end.
   * **Why D:** Malcolm, not Macbeth, is the rightful heir restored at the close.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Who does Macbeth murder in order to seize the throne of Scotland?
   * **Options:** A) Banquo, B) King Duncan, C) Macduff, D) Malcolm
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth kills King Duncan in his sleep at Inverness, the regicide that begins his bloody reign.
   * **Why A:** Banquo is murdered later, by hired men, because Macbeth fears his descendants.
   * **Why C:** Macbeth has Macduff's family killed, but Macduff himself survives to defeat him.
   * **Why D:** Malcolm, Duncan's son, escapes and returns to reclaim the throne.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** The witches tell Banquo he will "get kings, though thou be none". What do they prophesy for him?
   * **Options:** A) That he will become king himself, B) That his descendants will be kings, though he will not be, C) That he will kill Macbeth, D) That he will never have children
   * **Correct:** B
   * **Feedback:** ✓ Correct. Banquo is promised a line of kings — a prophecy that makes Macbeth see him as a threat and order his murder.
   * **Why A:** The witches say plainly that Banquo himself will not be king.
   * **Why C:** Banquo does not kill Macbeth; he is murdered on Macbeth's orders.
   * **Why D:** The opposite is true — his heirs, through his son Fleance, are promised the throne.

7. **Type: Select All [Tests Plot]**
   @dim:plot
   * **Question:** Which of these follow directly from Macbeth's murder of Duncan?
   * **Options:** A) Macbeth is crowned King of Scotland, B) Duncan's sons Malcolm and Donalbain flee, C) Macbeth is troubled by guilt and cannot sleep, D) The witches are arrested and executed
   * **Correct:** A, B, C
   * **Scoring:** 2 marks for A,B,C. 1 mark if mostly correct.
   * **Feedback:** ✓ Correct. The murder wins Macbeth the crown, drives Duncan's sons into flight, and leaves Macbeth tormented and sleepless.
   * **Why D:** The witches are never caught or punished — they vanish, their work done.

8. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** The prophecy that "none of woman born" shall harm Macbeth is finally defeated by which character?
   * **Options:** A) Banquo, B) Macduff, who was delivered by caesarean rather than natural birth, C) Malcolm, D) Fleance
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macduff reveals he was "from his mother's womb untimely ripp'd", so he was not "of woman born" in the ordinary sense — and he kills Macbeth.
   * **Why A:** Banquo is already dead by this point in the play.
   * **Why C:** Malcolm leads the army and reclaims the crown, but it is Macduff who kills Macbeth.
   * **Why D:** Fleance escapes his father's murderers but does not confront Macbeth.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Macbeth admits he has "no spur" to act except "vaulting ambition, which o'erleaps itself". What does this reveal about the play's view of ambition?
   * **Options:** A) That ambition is always rewarded, B) That unchecked ambition overreaches and destroys the person who indulges it, C) That Macbeth has no ambition at all, D) That ambition matters only to Lady Macbeth
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of a rider leaping too far and falling captures how ambition, pursued without restraint, brings about Macbeth's ruin.
   * **Why A:** Ambition here leads to destruction, not reward.
   * **Why C:** He names ambition as his single driving "spur" — he has it in excess.
   * **Why D:** Macbeth speaks these words about himself; the ambition is his own.

10. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In the play, guilt is shown as something physical and inescapable — it shows itself in blood that cannot be washed away and in the loss of sleep.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Lady Macbeth's "Out, damned spot!" and the cry that "Macbeth does murder sleep" both make guilt a bodily torment that cannot be cleansed.
   * **WhyWrong:** Guilt is intensely physical here — imagined bloodstains that will not wash out and the ruin of sleep both dramatise a conscience that cannot rest.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The play holds fate and free will in tension. What best describes how Macbeth's downfall comes about?
   * **Options:** A) The witches force him to kill Duncan against his will, B) The prophecy tempts him, but he chooses to act on it — the choice is his, C) Duncan orders his own death, D) Lady Macbeth casts a spell that controls him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The witches predict but never compel; Macbeth's own decision to murder is what turns prophecy into tragedy — fate and choice work together.
   * **Why A:** The witches only foretell — they never physically force his hand.
   * **Why C:** Duncan is an innocent victim; he does not seek his death.
   * **Why D:** Lady Macbeth pressures him, but there is no spell — the deed remains his choice.

12. **Type: Fill [Tests Themes]**
   @dim:themes
   * **Question:** The witches' paradox "Fair is foul, and foul is [BLANK]" announces the theme that appearances deceive.
   * **Answer:** fair
   * **Feedback:** ✓ Correct. "Fair is foul, and foul is fair" sets up a world where the good-seeming hides evil — a warning that runs through the whole play.
   * **WhyWrong:** The missing word is "fair" — the chant collapses good and evil into each other, foreshadowing a world of deceptive surfaces.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A speech in which a character, alone on stage, voices their private thoughts to the audience — such as "Is this a dagger which I see before me" — is called a...
   * **Options:** A) Soliloquy, B) Sonnet, C) Stage direction, D) Rhyming couplet
   * **Correct:** A
   * **Feedback:** ✓ Correct. The soliloquy lets us watch Macbeth's conscience at war with his ambition just before the murder.
   * **Why B:** A sonnet is a fourteen-line poem, not a spoken revelation of inner thought.
   * **Why C:** A stage direction is an instruction in the text, not a character's speech.
   * **Why D:** A rhyming couplet is two rhymed lines, not an extended private speech.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** "Will all great Neptune's ocean wash this blood clean from my hand?" is an example of which technique and effect?
   * **Options:** A) Blood imagery presenting guilt as a stain that cannot be cleansed, B) Onomatopoeia imitating running water, C) A pun on the sea-god's name, D) Comic relief
   * **Correct:** A
   * **Feedback:** ✓ Correct. Blood recurs throughout the play as the visible mark of guilt — here even a whole ocean cannot wash Macbeth clean.
   * **Why B:** There is no sound-imitation in the line; the force is visual and moral.
   * **Why C:** The reference to Neptune deepens the scale of the guilt rather than making wordplay.
   * **Why D:** The moment is one of horror and remorse, not comedy.

15. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** The witches use equivocation — language with a double meaning — when they promise that "none of woman born" shall harm Macbeth, leading him to a false sense of safety.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The phrase seems to make him invincible, but its hidden meaning (Macduff was delivered by caesarean) turns the prophecy against him.
   * **WhyWrong:** This is equivocation — the double-edged promise sounds like protection but conceals the truth that destroys him.

16. **Type: Fill [Tests Effects]**
   @dim:effects
   * **Question:** The witches chant "Double, double, toil and trouble; / Fire burn and cauldron [BLANK]", a rhythmic, spell-like rhyme that sets them apart from other characters.
   * **Answer:** bubble
   * **Feedback:** ✓ Correct. The insistent rhyme and chanting rhythm mark the witches' speech as unnatural and incantatory, unlike the blank verse of the human characters.
   * **WhyWrong:** The missing word is "bubble" — the sing-song rhyme of the spell makes the witches sound eerie and otherworldly.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall message about ambition and power?
   * **Options:** A) That ambition should always be pursued at any cost, B) That ambition without moral restraint corrupts and destroys the self, and disorder follows the murder of a king — but rightful order is finally restored, C) That kings can never be defeated, D) That guilt has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Macbeth's unchecked ambition ruins him and throws Scotland into chaos, yet Malcolm's restoration affirms that the moral and natural order ultimately reasserts itself.
   * **Why A:** The play dramatises the opposite — ambition pursued without limit is destructive.
   * **Why C:** Macbeth is defeated by Macduff; the "invincibility" prophecies prove to be equivocations.
   * **Why D:** Guilt is an inescapable torment in the play — sleepless nights and bloodstains that will not wash away.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What does the play suggest happens when the natural, God-given order is violated by killing a king?
   * **Options:** A) Nothing changes; life carries on as normal, B) Chaos and unnatural disorder follow, until the rightful order is restored, C) The murderer is immediately rewarded with a long, happy reign, D) The country becomes a peaceful republic
   * **Correct:** B
   * **Feedback:** ✓ Correct. After the regicide, nature itself recoils — darkness at noon, horses turning wild — and the disorder ends only when Malcolm, the rightful king, is restored.
   * **Why A:** The murder unleashes cosmic and political chaos; nothing stays normal.
   * **Why C:** Macbeth's reign is short, fearful and tormented, not a reward.
   * **Why D:** Order is restored through rightful kingship, not a republic.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's messages is that guilt cannot be escaped — those who commit terrible acts are punished from within, by their own conscience.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Both Macbeth and Lady Macbeth are destroyed less by their enemies than by their own guilt — sleeplessness, madness and despair follow the murder.
   * **WhyWrong:** Guilt is inescapable in the play — the Macbeths are ruined from within by conscience long before their outward defeat.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Written for King James I, the play ultimately affirms which idea?
   * **Options:** A) That murdering a king is a clever route to lasting power, B) That legitimate, rightful kingship is the foundation of a stable and natural order, C) That the witches are the true rulers of Scotland, D) That ambition is the highest virtue
   * **Correct:** B
   * **Feedback:** ✓ Correct. The restoration of Malcolm, Duncan's rightful heir, affirms legitimate kingship and the natural order — a message reassuring to James I, who claimed descent from Banquo.
   * **Why A:** Regicide brings Macbeth only chaos and ruin, not lasting power.
   * **Why C:** The witches tempt and unsettle, but they do not rule; rightful kingship is restored.
   * **Why D:** The play presents unchecked ambition as destructive, not virtuous.
