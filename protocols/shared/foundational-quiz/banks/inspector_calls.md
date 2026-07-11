# Foundational Quiz Bank — An Inspector Calls

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. An Inspector Calls is a **social-realism / morality play** → the `effects` aspect tests the
audience's **moral discomfort, shared guilt and pity-and-anger at injustice**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`inspector_calls.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: An Inspector Calls

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Sheila *changes* across the play — and what drives the change?
   * **Options:** A) She is selfish and callous from the first scene and never really changes, B) She begins a sheltered, privileged young woman who has Eva sacked out of vanity, and becomes the play's moral conscience — because she chooses to accept her guilt and learn from it, C) She is morally aware and blameless from the very first scene, D) She only changes because the Inspector forces her to, against her will
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sheila is the character who truly evolves: from complicit, pampered daughter to the household's conscience — and the engine of that change is her own choice to own her guilt, not the Inspector's pressure.
   * **Why A:** She changes profoundly; the drama lies in her transformation, not in fixed callousness.
   * **Why C:** She is complicit — she had Eva dismissed from Milwards — and the change matters precisely because she was guilty.
   * **Why D:** The Inspector exposes what she did, but the decision to accept responsibility is hers; removing her agency erases what separates her from her parents.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Sheila the character who evolves most, rather than simply another guilty member of the family?
   * **Options:** A) She refuses all blame, exactly like her parents, B) Unlike her parents she takes her share of the guilt to heart and is genuinely changed by it — moving from complicity to conscience, C) She was never involved in Eva's story at all, D) She stays the same naive girl she was at the start
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sheila is defined by her willingness to learn: she absorbs her guilt and is remade by it, which is exactly what her unrepentant parents refuse to do.
   * **Why A:** She is the opposite of her parents — she accepts blame while they shrug it off.
   * **Why C:** She is directly involved — she had Eva dismissed from Milwards out of jealousy.
   * **Why D:** She does not stay the same; her change is the play's clearest arc of growth.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Sheila's evolution from beginning to end?
   * **Options:** A) A hardened cynic at the start → a carefree girl at the end, B) A pleased, privileged fiancée admiring her engagement ring → a morally awakened young woman who insists "these girls aren't cheap labour — they're people", C) A grieving widow at the start → a joyful bride at the end, D) A factory worker at the start → a wealthy heiress at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from comfortable, self-absorbed privilege to a clear-eyed sense of others' humanity — the same young woman, woken to responsibility. That awakening IS her arc.
   * **Why A:** She starts pleased and privileged, not cynical, and ends morally serious, not carefree — this reverses her actual arc.
   * **Why C:** She is neither widow nor bride here; this confuses her situation entirely.
   * **Why D:** She is already wealthy; her change is moral, not a change of class.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Sheila's change is driven above all by her own willingness to accept responsibility — the Inspector confronts her, but she chooses to learn where her parents refuse.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Inspector never forces her conscience; he exposes what she did, and it is Sheila's own choice to feel her guilt and change that turns her into the play's moral voice.
   * **WhyWrong:** Treating her as merely pushed by the Inspector removes the choice that makes her the play's conscience rather than one more passive figure — her growth is her own doing.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Mr Birling sacking Eva *lead to* her death? (What is the causal link?)
   * **Options:** A) The events are unconnected and simply happen one after another, B) Losing her job leaves her more vulnerable, and each further rejection — Sheila's, Gerald's, Eric's, Mrs Birling's — pushes her lower, until she has nowhere left to turn, C) Mr Birling kills her directly, D) She dies purely by chance, unrelated to anything the family did
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the sacking begins a chain, and every later rejection removes another foothold, until suicide is all that is left. That causal chain, not mere sequence, is the play's structure.
   * **Why A:** The play insists these are causally linked — a chain — not coincidences that merely happen in order.
   * **Why C:** Birling does not kill her; his sacking sets in motion a chain of consequences others extend.
   * **Why D:** Her death is caused by an accumulation of human choices, not chance.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Eva Smith's destruction — not just the order of events?
   * **Options:** A) A series of unrelated misfortunes that strike her by bad luck, B) Birling's sacking → Sheila's jealous complaint at Milwards → Gerald's abandonment → Eric's exploitation → Mrs Birling's refusal of charity → despair and suicide, C) The Inspector causes each misfortune himself, D) Fate alone decides Eva's death, and no one's choices make a difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each link makes the next harm possible; together the family's separate choices form one chain ending in Eva's death. That is causal necessity, not a list of events.
   * **Why A:** The play shows a linked chain of human choices, not random luck.
   * **Why C:** The Inspector reveals the chain; he does not cause it.
   * **Why D:** The whole play turns on the fact that each person's choice mattered — remove the choices and there is no chain.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the play end with a phone call announcing that a real inspector is on his way? What makes this the turning point of its argument?
   * **Options:** A) To reveal the first Inspector was an ordinary police officer after all, B) Because the older Birlings refuse to learn, the reckoning must begin again — the cycle turns because they chose not to change, C) To show the family have all been forgiven, D) Because the events were meaningless and nothing follows from them
   * **Correct:** B
   * **Feedback:** ✓ Correct. The cyclical ending is caused by the parents' refusal: because they will not accept responsibility, the whole ordeal must return. Consequence follows from choice — that is the causal point of the twist.
   * **Why A:** The mystery is that no such officer existed; the twist's meaning is not that he was real.
   * **Why C:** The unrepentant parents are given no escape — the cycle returns precisely because they will not change.
   * **Why D:** The ending insists consequences DO follow from their refusal; it is the opposite of meaningless.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In An Inspector Calls the family's separate actions form a chain of cause and effect that together drove Eva to suicide — they are not unconnected coincidences.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The Inspector's method exposes causal necessity: each act made the next harm possible, all linked in one chain ending in Eva's death — not a string of happenings that merely involved the same girl.
   * **WhyWrong:** Reading the events as coincidence ("they just happened to involve the same woman") misses the causal chain the Inspector reveals — every choice made the next one's harm possible.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The Inspector insists "We are members of one body". What does this reveal about the play's view of responsibility?
   * **Options:** A) That people should look after only themselves, B) That everyone is connected and responsible for one another — society is one shared body, not a crowd of isolated individuals, C) That only the government is responsible for the poor, D) That responsibility belongs to the young alone
   * **Correct:** B
   * **Feedback:** ✓ Correct. The image of a single shared body is the play's whole argument: private choices ripple outwards, so we are all answerable for one another.
   * **Why A:** That is Birling's creed, the view the play sets out to discredit.
   * **Why C:** The Inspector places responsibility on individuals, not only on the state.
   * **Why D:** He addresses the whole family; responsibility is shown to belong to everyone.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The play sets the older Birlings against Sheila and Eric. Which controlling idea does this generational divide most explore?
   * **Options:** A) That the old are wiser and should always be obeyed, B) That change and hope lie with the young, who can learn responsibility, while the older generation cling to self-interest, C) That young people are careless and should be ignored, D) That the generations always agree in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. Sheila and Eric are changed by the night; their parents are not. Priestley pins the hope of a better society on the young who are willing to learn.
   * **Why A:** The play sides with the young learners, not the entrenched parents.
   * **Why C:** The young are the play's hope, not figures to ignore.
   * **Why D:** The divide is the point — the generations end sharply opposed.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** A working-class woman like Eva has little money and no power against wealthy employers. Which idea does her fate most explore?
   * **Options:** A) That the poor deserve their hardship, B) That a rigid class system lets the privileged exploit the powerless without consequence — until the play forces them to answer for it, C) That class made no real difference in 1912, D) That Eva was simply unlucky
   * **Correct:** B
   * **Feedback:** ✓ Correct. Eva's fate dramatises how class and power let the wealthy use and discard the vulnerable — the injustice the play exists to expose and challenge.
   * **Why A:** The play condemns exploitation, never the poor who suffer it.
   * **Why C:** Class division is central to the play, not incidental.
   * **Why D:** Her fate is caused by others' choices, not chance — that is exactly the play's argument.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In An Inspector Calls, responsibility is shown to be collective — a chain of separate choices by the whole family together destroyed Eva Smith.
   * **Answer:** True
   * **Feedback:** ✓ Correct. No single act killed Eva; each Birling and Gerald added a link, so the guilt is shared. Collective responsibility is the play's central idea.
   * **WhyWrong:** The play's controlling idea is shared responsibility — the Inspector shows a chain of actions for which the whole family is jointly answerable, not one lone culprit.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** An Inspector Calls is a social-morality play. Why are we meant to feel a sense of *moral discomfort* as the Inspector questions the family?
   * **Options:** A) Because the mystery is frightening, like a ghost story, B) Because the play makes us recognise our own capacity for the Birlings' selfishness — the guilt is meant to feel shared, not safely someone else's, C) Because we are amused by the family's embarrassment, D) Because we feel triumphant that the rich are exposed
   * **Correct:** B
   * **Feedback:** ✓ Correct. A morality play turns the accusation on the audience: the discomfort comes from seeing ourselves in the Birlings, so the guilt cannot be kept at a safe distance.
   * **Why A:** The disquiet is moral, not gothic fright; any hint of the ghostly serves the moral point, not horror.
   * **Why C:** The play means to trouble us, not to entertain us at the family's expense.
   * **Why D:** Smug triumph is exactly the response the play refuses — it implicates the watching audience too.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A social-conscience play such as this is designed to make its audience feel — above all — which response?
   * **Options:** A) Delight and relief, B) Moral discomfort and a sense of shared guilt — the urge to change, C) Fear of the supernatural, D) Boredom and detachment
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's whole purpose is to leave us uneasy and implicated, moved to act differently — collective guilt made personal.
   * **Why A:** Delight and relief belong to comedy; this play unsettles us on purpose.
   * **Why C:** Any ghostly suggestion serves the moral argument, not a horror thrill.
   * **Why D:** Detachment is the response the play works hardest to prevent — it wants us involved and answerable.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel both *pity* and *anger* at Eva Smith's fate?
   * **Options:** A) Because she brought her suffering entirely on herself, B) Because a powerless young woman is destroyed by the careless choices of the privileged — we pity her helplessness and are angered by the injustice, C) Because she is a comic figure, D) Because she deserved what happened to her
   * **Correct:** B
   * **Feedback:** ✓ Correct. The double feeling is deliberate: pathos for a helpless victim, and moral anger at a system and a family that used her up. Pity and injustice-anger are the play's intended effect.
   * **Why A:** The play locates the fault in those with power over her, not in Eva.
   * **Why C:** Eva's story is one of pathos, not comedy.
   * **Why D:** The play condemns her treatment as unjust, inviting anger — never approval.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel uncomfortable and implicated — a shared guilt and a call to change — rather than reassured that the trouble is safely over.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The cyclical ending deliberately denies us comfort, leaving unease and shared responsibility ringing in the air — the emotional effect a morality play is built to produce.
   * **WhyWrong:** The intended effect is discomfort and shared guilt, not relief or triumph; the returning reckoning is meant to leave us unsettled and answerable, not reassured.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about how we should live together?
   * **Options:** A) That a man should look after himself and his own, B) That we are responsible for one another, and that a society ignoring this will be taught it "in fire and blood and anguish", C) That the wealthy have earned the right to ignore the poor, D) That guilt has no real consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. The Inspector's final warning affirms the play's enduring "so what": we are members of one body, and a society that denies this heads for catastrophe.
   * **Why A:** That is Birling's creed — the very view the play sets out to demolish.
   * **Why C:** The play condemns such indifference as the cause of Eva's death.
   * **Why D:** The cyclical ending insists that wrongdoing brings consequences.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The Inspector warns that if people will not learn responsibility they will be taught it "in fire and blood and anguish". What enduring idea does this affirm?
   * **Options:** A) That nothing changes and history has no lessons, B) That a society built on selfishness and inequality is heading for catastrophe unless it changes — a warning the 1945 audience knew had come true, C) That war is a reward for the virtuous, D) That only the poor ever suffer consequences
   * **Correct:** B
   * **Feedback:** ✓ Correct. Written after two world wars, the warning affirms that a self-interested society reaps disaster — the "fire and blood and anguish" the audience had just lived through.
   * **Why A:** The warning is precisely that history teaches, and that ignoring it brings ruin.
   * **Why C:** The phrase is a threat of suffering, not a reward.
   * **Why D:** The warning falls above all on the privileged Birlings.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's lasting messages is that no one lives in isolation — our choices affect others, and a society that forgets this brings suffering on itself.
   * **Answer:** True
   * **Feedback:** ✓ Correct. "We are members of one body" is the play's moral spine: deny our interconnection, Priestley warns, and catastrophe follows — the enduring message the whole play affirms.
   * **WhyWrong:** The play's central message is exactly this interconnection and shared responsibility; a world that denies it, Priestley insists, heads for disaster.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Writing in 1945 about 1912, what change in society does Priestley's play ultimately argue for?
   * **Options:** A) A return to rigid class divisions and self-interest, B) A more equal, socially responsible society in which the privileged answer for how they treat the powerless, C) That the young should defer entirely to their elders, D) That charity should be refused to the desperate poor
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's argument is reforming: it calls for collective responsibility and a fairer society, holding the comfortable to account for the vulnerable they exploit.
   * **Why A:** The play attacks class division and self-interest as the cause of Eva's death.
   * **Why C:** The play places its hope in the young, who challenge their elders.
   * **Why D:** Mrs Birling's refusal of charity is condemned, not endorsed.
