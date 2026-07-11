# Foundational Quiz Bank — Pride and Prejudice

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Pride and Prejudice is a **comedy of manners** → the `effects` aspect tests the reader's
**delight and warm relief** as folly is exposed and order restored, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`pride_and_prejudice.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Pride and Prejudice

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Elizabeth Bennet *changes* across the novel — and what drives the change?
   * **Options:** A) She is prejudiced from the first page and never really changes, B) She begins confident in her own quick judgement and prejudiced against Darcy, and grows into humbled self-knowledge — driven by facing her own error on reading his letter, C) She is right in her judgements throughout and is simply vindicated at the end, D) She is deceived by Wickham, so her mistakes are really his doing, not hers
   * **Correct:** B
   * **Feedback:** ✓ Correct. Elizabeth's arc IS the novel: her pride in her own discernment blinds her, and only when she confronts her misjudgement — "How despicably have I acted!" — does she grow. The engine of the change is her own honesty, not luck.
   * **Why A:** She prides herself on reading people well at the start; the whole point is that this confidence is corrected — she changes profoundly.
   * **Why C:** She discovers she was badly wrong about both Darcy and Wickham; growth, not vindication, is the arc.
   * **Why D:** Wickham lies, but Elizabeth chooses to believe him because it flatters her prejudice; owning that choice is exactly what makes her growth hers.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Elizabeth a heroine who genuinely *develops* rather than one who is simply admirable throughout?
   * **Options:** A) She has no faults, so there is nothing to develop, B) Her cleverness carries a real flaw — a vanity that trusts her own first impressions too far — and she must unlearn it to see truly, C) She changes only because her circumstances change, not because she does, D) She stays exactly the same and the people around her change instead
   * **Correct:** B
   * **Feedback:** ✓ Correct. Elizabeth's wit is real, but so is the pride in her own judgement that misleads her; the novel is the story of her earning truer sight — "Till this moment, I never knew myself."
   * **Why A:** A flawless heroine could not grow; her prejudice is the very fault the title names and the story corrects.
   * **Why C:** Her transformation is inward — a change of judgement and humility — not merely a change of situation.
   * **Why D:** The growth is *hers*; she is the one who revises her view of Darcy, Wickham and herself.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Elizabeth's evolution from beginning to end?
   * **Options:** A) A shy, silent girl at the start → a bold public speaker at the end, B) Quick to judge and sure she reads people rightly → humbled and self-aware, able to admit "Till this moment, I never knew myself", C) A wealthy heiress at the start → an impoverished outcast at the end, D) Devoted to Wickham at the start → indifferent to everyone at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. She travels from confident misjudgement to earned self-knowledge — the same lively mind, now humbled and clear-sighted. That inward journey is the heart of the novel.
   * **Why A:** Elizabeth is spirited and outspoken from the first; the change is in her judgement, not her boldness.
   * **Why C:** Her material situation barely improves until the very end; the real change is moral, not financial.
   * **Why D:** She is briefly charmed by Wickham, but the arc is toward clearer judgement of everyone, not indifference.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Elizabeth's growth is driven above all by her own error — her prejudice is her choice to misjudge, and it is her honesty in facing it that changes her.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Wickham's lies and Darcy's pride give her the excuse, but the prejudice is hers, and so is the courageous self-reckoning that corrects it. That ownership is what makes the growth real.
   * **WhyWrong:** Treating Elizabeth as merely a victim of Wickham's deceit removes the self-knowledge that drives her change — she grows precisely because she admits the fault was her own.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does Elizabeth's *refusal* of Darcy's first proposal *lead to* their eventual union? (What is the causal link?)
   * **Options:** A) The refusal and the union are unconnected events that simply happen in that order, B) Her angry refusal forces Darcy to write the letter that corrects her prejudice and shames his pride — so the rejection is what makes reform, and then love, possible, C) Lady Catherine orders them to marry, so the refusal makes no difference, D) Darcy proposes again at once and she accepts out of pity
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the wounding refusal provokes the explanatory letter, which undoes Elizabeth's false impressions and pricks Darcy's pride. Both must be humbled by that collision before they can unite.
   * **Why A:** In a well-made plot events follow by cause, not mere sequence; reading them as unconnected misses how the refusal reshapes both characters.
   * **Why C:** Lady Catherine tries to *prevent* the match; her interference in fact hardens Darcy's hope, but no one orders it.
   * **Why D:** Reconciliation comes slowly, through changed conduct on both sides — not an instant second proposal accepted from pity.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the central romance — not just the order of events?
   * **Options:** A) A string of unrelated social visits that happen to end in a wedding, B) Darcy's proud slight and Wickham's lies breed Elizabeth's prejudice → she refuses him → his letter opens her eyes → his quiet rescue of Lydia proves his changed character → both reformed, they can love, C) The witches — sorry, fate — decides everything and the characters' choices make no difference, D) Money alone drives every step, so character never changes anything
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before: misjudgement causes refusal, refusal causes revelation, revelation and proven conduct cause reconciliation. That causal spine, not the calendar of balls and visits, is the plot.
   * **Why A:** The events are tightly linked by cause and by the growth of both characters, not a loose sequence of outings.
   * **Why C:** There is no fate here; the plot turns entirely on the characters' choices and revised judgements.
   * **Why D:** Money sets the stakes, but it is changed *character* — humbled pride, corrected prejudice — that resolves the plot.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point that makes the lovers' reconciliation possible — the point at which Elizabeth's judgement reverses?
   * **Options:** A) The first ball, where Darcy calls her only "tolerable", B) Elizabeth reading Darcy's letter and grasping how her vanity misled her — "Till this moment, I never knew myself", C) Lydia's wedding to Wickham, D) Lady Catherine's visit to Longbourn
   * **Correct:** B
   * **Feedback:** ✓ Correct. The letter is the pivot: it overturns her false picture of Darcy and Wickham and forces the self-knowledge on which everything after depends. Reading it, her judgement — and so the plot's direction — reverses.
   * **Why A:** The slight *begins* her prejudice; it sets the problem, it does not turn it around.
   * **Why C:** Lydia's marriage is a *consequence* of Darcy's secret intervention, a sign the reconciliation is already underway, not the turn itself.
   * **Why D:** Lady Catherine's interference comes late and only confirms feelings already changed by the letter's revelation.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novel the later events — Darcy's secret rescue of Lydia, the softening between him and Elizabeth — follow by cause-and-effect from the letter's revelations; they are not just a string of unconnected happenings.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The letter corrects Elizabeth's judgement; her changed view and Darcy's changed conduct then cause the reconciliation. Each event is *because of* the last, all rooted in that revelation.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal necessity — the letter's disclosures are what set the reconciliation in motion.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** How do the twin faults of the title *work* through the novel?
   * **Options:** A) Only Darcy is proud and only Elizabeth is prejudiced, and neither ever changes, B) Both Darcy and Elizabeth carry pride and prejudice, and each must reach self-knowledge before they can judge truly and unite, C) Neither character has any faults; the title is decorative, D) The faults belong only to minor characters like Mr Collins
   * **Correct:** B
   * **Feedback:** ✓ Correct. Pride and prejudice are not one each but shared: Darcy's rank-pride and Elizabeth's wounded-vanity prejudice both mislead them, and both must be humbled. The theme *works* by making self-correction the price of love.
   * **Why A:** Both share both faults, and both genuinely change — that mutual reform is the theme.
   * **Why C:** Their flaws are the engine of the whole story, not ornament.
   * **Why D:** Collins and Lady Catherine caricature the faults, but the theme lives in the two lovers who overcome them.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The novel sets Charlotte's practical match and Lydia's reckless one against Elizabeth and Darcy's union. Which controlling idea does this contrast develop?
   * **Options:** A) That marriage should be founded on love and mutual respect, not on money, security or mere attraction, B) That all marriages are equally happy, C) That love never matters in marriage, D) That women should never marry at all
   * **Correct:** A
   * **Feedback:** ✓ Correct. Charlotte marries Collins for a comfortable home and Lydia elopes on infatuation; against both, Elizabeth and Darcy's understanding models the marriage of esteem the novel prizes. The contrast *works* to define what a true match is.
   * **Why B:** The point of the contrast is that the matches differ sharply in worth — Charlotte's is secure but loveless, Lydia's precarious.
   * **Why C:** The novel argues the opposite: love and respect are exactly what a marriage should rest on.
   * **Why D:** Austen affirms marriage; she only insists it be founded on understanding rather than money or rank.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** After reading Darcy's letter Elizabeth cries, "How despicably have I acted!" Which idea does this moment most explore?
   * **Options:** A) That first impressions can be false, and only honest self-reflection corrects our judgement, B) That reading letters is dangerous, C) That money is all that matters, D) That she was right about Darcy all along
   * **Correct:** A
   * **Feedback:** ✓ Correct. Her self-reproach dramatises the novel's argument that snap judgements must be tested by reflection; truth comes not from first impressions but from the humility to revise them.
   * **Why B:** The letter brings self-knowledge, not danger; it is the instrument of her growth.
   * **Why C:** The theme is judgement and humility, not wealth.
   * **Why D:** The whole force of the line is that she realises she was *wrong* — that is the growth.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** In Pride and Prejudice, the flawed marriages around Elizabeth — Charlotte's for security, Lydia's on infatuation — work to highlight the love and mutual respect at the heart of her union with Darcy.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Austen frames the ideal by its opposites: set against practical and reckless matches, Elizabeth and Darcy's marriage of understanding and esteem stands out as the novel's model.
   * **WhyWrong:** The surrounding matches are not incidental — they are deliberate contrasts that define, by difference, the marriage of respect the novel upholds.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Pride and Prejudice is a comedy of manners. Why do we feel *delight* rather than distress as we watch Elizabeth and Darcy misjudge each other?
   * **Options:** A) Because Austen uses irony and free indirect speech, B) Because we can see through the follies of pride and prejudice and trust they will be mended — the pleasure of watching a tangle we know will be happily undone, C) Because we fear the characters will be destroyed, D) Because we are amused by their cruelty to one another
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy invites a buoyant amusement: we watch clever people trip over their own pride and prejudice, confident the confusion is survivable and will resolve. The delight comes from folly seen clearly and forgiven.
   * **Why A:** Irony and free indirect speech are *techniques* Austen uses; the question asks for the feeling they produce — delight — not the device's name.
   * **Why C:** Dread of destruction belongs to tragedy or the Gothic; here we feel confident the errors will be mended.
   * **Why D:** We laugh with warmth, not at cruelty; the pleasure is in error forgiven, not harm enjoyed.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A comedy of manners such as Pride and Prejudice is designed to leave the reader feeling — above all — what?
   * **Options:** A) Pity and fear at an inevitable fall, B) Delight and warm relief as folly is exposed, forgiven, and order restored in marriage, C) Dread and horror at a buried monstrous self, D) Cold unease at a world ordered against the individual
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy is the genre of social renewal: its promise is amusement that lightens into relief as misunderstandings clear and the right couples unite. That warm satisfaction is the effect the whole arc serves.
   * **Why A:** Pity and fear are the effects of *tragedy*; a comedy that merely dismayed us would fail its purpose.
   * **Why C:** Dread and horror belong to the Gothic; Austen's world is social and comic, not monstrous.
   * **Why D:** Cold unease is the note of dystopia; here the individual is welcomed back into a renewed community.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *warm relief and satisfaction* at the novel's close?
   * **Options:** A) Because a great figure has been destroyed by their own error, B) Because the misunderstandings clear, the follies are forgiven, and the deserving couples — Elizabeth and Darcy, Jane and Bingley — are happily united, C) Because we are unsettled by an ambiguous, threatening ending, D) Because the villain escapes and we are glad for him
   * **Correct:** B
   * **Feedback:** ✓ Correct. The comic ending discharges the tension we have carried: disorder resolves into harmony, pride and prejudice give way to understanding, and marriage seals the reconciliation. Relief and warmth are the intended feelings.
   * **Why A:** Destruction of a great figure is the close of *tragedy*; comedy ends in renewal and union.
   * **Why C:** The ending is settled and harmonious, not ambiguous or threatening.
   * **Why D:** Wickham is quietly contained, not triumphant; our satisfaction is in the good matches, not a villain's escape.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novel we are meant to feel delight and warm relief — the pleasure of watching pride and prejudice give way to understanding, folly forgiven, and the right couples united.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That buoyant, relieved warmth as disorder resolves into harmony is exactly the emotional effect a comedy of manners is built to produce.
   * **WhyWrong:** The intended effect is delight and relief, not pity and fear or dread; the ending's restored order is designed to leave us warmed and satisfied, not grieving.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novel's overall *message* about pride, prejudice and judgement?
   * **Options:** A) That first impressions should always be trusted, B) That pride and prejudice blind us to the truth about others until honest self-knowledge corrects them — and that people can genuinely reform, C) That character can never change, D) That wealth is the only sound basis for judging people
   * **Correct:** B
   * **Feedback:** ✓ Correct. Both Elizabeth and Darcy are led astray by pride and prejudice and are redeemed only by facing themselves. The enduring "so what" is that clear judgement — and love — require humility and self-correction.
   * **Why A:** The novel dramatises the opposite: first impressions mislead both lovers and must be revised.
   * **Why C:** Its whole argument is that character *can* be reformed — Darcy is "properly humbled", Elizabeth learns to know herself.
   * **Why D:** Austen satirises rank-and-wealth judgement (Lady Catherine, Collins); worth lies in character, not fortune.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about marriage does the novel ultimately affirm?
   * **Options:** A) That marriage should be made for money, security or rank above all, B) That a true marriage rests on mutual understanding, respect and love — not on wealth or status, C) That marriage is best avoided entirely, D) That love should be sacrificed to family duty
   * **Correct:** B
   * **Feedback:** ✓ Correct. Against Charlotte's bargain and Lydia's folly, the novel holds up Elizabeth and Darcy's union of esteem and understanding as the model — the "so what" is that marriage should be founded on respect and love.
   * **Why A:** Austen exposes money-and-rank matches (Collins, Lady Catherine's schemes) as hollow, not ideal.
   * **Why C:** The novel affirms marriage; it only insists on the right foundation for it.
   * **Why D:** Elizabeth resists both mercenary and merely dutiful matches in favour of love with respect.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novel's lasting messages is that people can reform through honest self-knowledge — Darcy is "properly humbled" and Elizabeth learns to see herself and others truly.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Both lovers overcome the faults the title names, affirming that pride and prejudice are not fixed but follies that humility and reflection can mend.
   * **WhyWrong:** The novel insists change is possible: Darcy admits Elizabeth "properly humbled" him and she learns to know herself — self-correction is central to its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** Through her irony and her comic snobs — Mr Collins, Lady Catherine — what does Austen's satire ultimately affirm?
   * **Options:** A) That rank and fortune are the true measures of a person, B) That real worth lies in character, sense and integrity rather than in wealth or social standing, C) That the proud and pompous always deserve to win, D) That society's manners should never be questioned
   * **Correct:** B
   * **Feedback:** ✓ Correct. By mocking Collins's servility and Lady Catherine's arrogance, Austen exposes the emptiness of rank-worship and affirms that genuine value lies in character and good judgement — the moral beneath the comedy.
   * **Why A:** The satire ridicules those who prize rank and fortune; it affirms the opposite standard.
   * **Why C:** The pompous are Austen's comic targets, humbled or exposed, not vindicated.
   * **Why D:** The whole force of the satire is to question the snobbery and manners of Regency society.
