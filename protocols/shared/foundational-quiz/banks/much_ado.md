# Foundational Quiz Bank — Much Ado About Nothing

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. Much Ado About Nothing is a **comedy** → the `effects` aspect tests the audience's **delight,
warmth and relief** — the pleasure of disorder resolved — not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`much_ado.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: Much Ado About Nothing

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Benedick *changes* across the play — and what drives the change?
   * **Options:** A) He is a devoted lover from the first scene and never really changes, B) He begins a witty scorner of love — "a professed tyrant to their sex" — and becomes a man who openly loves Beatrice and defends the wronged Hero, because he chooses to let go of his pride once he learns he is loved, C) His friends' trick forces feelings on him that he never truly had, D) He stays a mocker of marriage to the very end and weds only for show
   * **Correct:** B
   * **Feedback:** ✓ Correct. The comedy is the *change*: the proud bachelor who scorned love chooses to shed his pride and love openly — the gulling only frees a feeling that was already there.
   * **Why A:** He opens as a sworn enemy of love and marriage, not a devoted lover; the delight lies in his transformation, not in constancy.
   * **Why C:** The trick tempts and unmasks him — it cannot manufacture feeling; treating him as its puppet removes the choice that makes his change his own.
   * **Why D:** He ends genuinely in love and married in earnest; reading it as "for show" denies the real change of heart the play stages.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Beatrice *evolves* — and what drives it?
   * **Options:** A) She truly hates Benedick and never softens, B) She moves from proud, self-defended wit — she'd "rather hear my dog bark at a crow than a man swear he loves me" — to openly loving Benedick, because she chooses to answer love with love once her guard is down, C) A trick magically implants a love she never felt, D) She was secretly betrothed to Benedick all along, so nothing really changes
   * **Correct:** B
   * **Feedback:** ✓ Correct. Beatrice travels from defensive mockery to honest love — her sharp wit was a guard, and she chooses to lower it. That self-driven change is the comic heart of her arc.
   * **Why A:** Her scorn is a mask over feeling; the play shows her soften, not stay fixed.
   * **Why C:** The gulling removes her pride — it does not conjure emotion from nothing; the love is hers to own.
   * **Why D:** There is no prior betrothal; reading one in erases the genuine change the trick brings about.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Benedick's evolution from beginning to end?
   * **Options:** A) A devoted husband at the start → a lonely bachelor at the end, B) A sworn bachelor who vows to "die a bachelor" → a husband who admits "when I said I would die a bachelor, I did not think I should live till I were married", C) A timid, silent man at the start → a bitter cynic at the end, D) One of Don John's villains at the start → a free man at the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from scorning marriage to embracing it in his own wry words — the same wit, turned from defence to affection. That reversal IS the comic arc.
   * **Why A:** This inverts his actual journey — he begins the bachelor and ends the husband, not the reverse.
   * **Why C:** He is neither timid nor silent, and he ends warmly reconciled, not embittered.
   * **Why D:** Benedick is Don Pedro's loyal companion, never one of Don John's schemers; this confuses who he is.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Beatrice and Benedick's transformation is driven above all by their own choice to embrace love — the gulling strips away the pride that hid their feelings, but it does not manufacture them.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The staged talk plants belief, but each *chooses* to answer love with love; their agency is what turns a trick into a true change of heart.
   * **WhyWrong:** The friends' trick never forces feeling — it only removes the proud defensiveness. Treating the pair as puppets of the plot misses the choice that makes their change real.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does the gulling — each overhearing a staged conversation — *lead to* Beatrice and Benedick confessing love? (What is the causal link?)
   * **Options:** A) The two events are unconnected — they would have married anyway, so the trick means nothing, B) Each is made to believe the other secretly loves them, which frees them to drop the defensive wit and admit the feelings they already had — so the trick causes the confession, C) The friends cast a spell that compels them to love, D) They fall in love at random, for no reason at all
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: the planted belief dissolves their pride, and once the guard is down the hidden love surfaces. That causal link is what makes it a comic arc, not a coincidence.
   * **Why A:** In a comedy of "noting" the events follow by cause, not mere sequence; reading the trick as meaningless misses the engine of the plot.
   * **Why C:** There is no magic — the pair are moved by belief and their own choice, not compulsion.
   * **Why D:** Their love is drawn out by the trick working on feeling that was already there, not by random chance.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of the near-catastrophe around Hero — not just the order of events?
   * **Options:** A) A string of unlucky coincidences with no connection between them, B) Don John's spite → he stages the window deception → Claudio believes Hero unfaithful → he shames her at the altar → she is hidden as "dead" → the watch exposes the lie → the truth clears her and the marriage is restored, C) Hero brings it on herself by real unfaithfulness, D) Dogberry's bumbling watch causes the whole disaster
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in Don John's malice. That causal spine — deceit, false belief, shame, recovery — is the plot's arc, not a heap of mishaps.
   * **Why A:** The disasters are not random — they are the logical outworking of Don John's single deception.
   * **Why C:** Hero is entirely innocent; the ruin comes from a lie, not from any wrongdoing of hers.
   * **Why D:** The watch in fact *undoes* the plot by exposing it; blaming Dogberry mistakes the resolution for the cause.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which moment is the turning point where the comedy darkens into near-tragedy — the crisis from which everything after flows?
   * **Options:** A) Don John's first sullen appearance, B) Claudio's public denunciation of Hero at the altar, C) Beatrice's demand that Benedick "Kill Claudio", D) The final dance that closes the play
   * **Correct:** B
   * **Feedback:** ✓ Correct. The shaming at the wedding is the crisis: the light comic world tips toward tragedy, and the "death" of Hero, the challenge and the recovery all follow from it.
   * **Why A:** Don John's arrival sets up the threat but nothing has yet broken; the wedding is where disaster strikes.
   * **Why C:** Beatrice's demand is a *consequence* of the shaming, part of the fallout — not the turning point itself.
   * **Why D:** The dance marks the restored harmony at the end, not the crisis that endangered it.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In Much Ado the disasters of the middle acts follow by cause-and-effect from Don John's single deception — they are not just a string of unconnected mishaps.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Comic plot here is built on causal necessity: the lie makes Claudio believe, belief makes him shame Hero, the shame drives the "death" and the recovery — each event *because of* the last.
   * **WhyWrong:** Reading the events as unconnected ("they just happen next") misses the causal chain that springs from Don John's malice — the very thing that shapes the plot's arc.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Deception runs through the whole play. Which controlling idea does it dramatise?
   * **Options:** A) That deception is always and only evil, B) That deception is the play's engine and cuts both ways — kindly trickery unites Beatrice and Benedick, while Don John's malicious lie nearly destroys Hero, C) That deception is always harmless fun, D) That deception plays no real part in the plot
   * **Correct:** B
   * **Feedback:** ✓ Correct. Trickery is the play's central idea, working in two directions: benign plots bring happiness, malicious ones bring ruin — the same tool, opposite ends.
   * **Why A:** Some deceptions here are kindly and bring the sparring pair together; not all trickery is evil.
   * **Why C:** Don John's deception is purely destructive — the theme is not that trickery is harmless.
   * **Why D:** Deception is the very engine of the plot, not absent from it.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** The title puns on "nothing", which sounded like "noting" (observing) in Shakespeare's day. Which controlling idea does this announce?
   * **Options:** A) That nothing of importance happens in the play, B) That the plot turns on "noting" — observing, overhearing and misreading — so appearances constantly deceive and what characters think they see is not the truth, C) That the play is chiefly about music, D) That the title is a printer's mistake
   * **Correct:** B
   * **Feedback:** ✓ Correct. "Noting" — watching and overhearing — drives the whole action, from the gulling scenes to the window trick; appearance and reality pull apart throughout.
   * **Why A:** A great deal happens; the pun is on observing, not idleness.
   * **Why C:** "Noting" here means observing and overhearing, not only music.
   * **Why D:** The pun is deliberate wordplay central to the theme, not an error.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** When Hero's whole standing collapses on a single false accusation, which controlling idea does the play explore?
   * **Options:** A) That wealth mattered more than reputation, B) That a woman's honour hung on her chastity and good name — so fragile that an unproven word could ruin her, C) That such accusations were always ignored, D) That reputation mattered only to the men
   * **Correct:** B
   * **Feedback:** ✓ Correct. Hero is cast off on Don John's lie alone; the play dramatises how a woman's honour rested on reputation and could be destroyed without any proof.
   * **Why A:** Reputation, not wealth, is what is at stake for Hero.
   * **Why C:** The accusation is taken with devastating seriousness, not ignored.
   * **Why D:** The women's honour is exactly what is threatened; it is far from a men-only concern.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** Beneath their "merry war" of wit, the play suggests Beatrice and Benedick's mockery of love masks a real attraction — it is pride, not indifference, that keeps them apart.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Their trading of clever insults is a guard over feeling; the gulling works precisely because the love is already there, hidden behind proud wit.
   * **WhyWrong:** The "merry war" is a mask, not genuine dislike — the play's idea is that pride and self-defence, not real indifference, keep the pair apart.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Much Ado is a comedy. Why do we feel *delight* watching the gulling scenes, where Beatrice and Benedick are tricked?
   * **Options:** A) Because we pity their suffering and fear for their ruin, B) Because we share the secret of the trick and enjoy watching two proud wits fooled into the love we can already see they feel — the warm pleasure of comic disorder, C) Because the scenes fill us with dread and unease, D) Because the effect is what we call dramatic irony
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy delights us by letting us in on the joke: we relish the gap between the pair's proud denials and the love plainly stirring beneath — a warm, knowing pleasure.
   * **Why A:** Pity and fear are the emotions of tragedy; here the mood is affectionate delight, not sorrow.
   * **Why C:** Dread belongs to the gothic; the gulling scenes are playful and warm, not frightening.
   * **Why D:** "Dramatic irony" names the *device* — the question asks for the *feeling* it produces, which is delight.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A comedy such as Much Ado is designed to make the audience feel, above all others, which response?
   * **Options:** A) Pity and fear, B) Delight, warmth and relief, as confusion and disorder are happily resolved, C) Horror and dread, D) Moral discomfort and collective guilt
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comedy aims at the pleasure of disorder untangled — the warmth and relief of misunderstandings cleared and lovers united. That is the emotional purpose its whole shape serves.
   * **Why A:** Pity and fear belong to tragedy; a comedy that left us only grieving would fail its purpose.
   * **Why C:** Horror and dread belong to the gothic, not to this warm, sociable world.
   * **Why D:** Moral discomfort is the aim of social-realist drama; comedy seeks delight, not guilt.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *relief* at the ending, when Hero is cleared and the couples are married?
   * **Options:** A) Because a figure of real greatness has been destroyed, B) Because the threatened disorder — slander, a broken wedding, a "death" — is undone, and the world is restored to harmony in marriage, C) Because the villain triumphs and we are left shocked, D) Because the effect is called a comic subplot
   * **Correct:** B
   * **Feedback:** ✓ Correct. Comic relief comes from resolution: the lie is exposed, the wronged Hero restored, and the confusion resolves happily into marriage — the disorder set right at last.
   * **Why A:** No great figure is destroyed — that is the shape of tragedy, not this comedy's happy close.
   * **Why C:** Don John is caught, not triumphant; the ending brings reconciliation, not shock.
   * **Why D:** "Comic subplot" names a *structure* — the question asks for the *feeling* the ending produces, which is relief.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the play we are meant to feel warmth and relief as the confusion resolves into marriage and reconciliation — the characteristic emotional effect of comedy.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That glow of relief and warmth — threats dissolved, lovers united, harmony restored — is exactly the effect a comedy is built to produce.
   * **WhyWrong:** The intended effect is delight and relief, not pity and fear or dread; comedy leaves us warmed by disorder happily resolved, not shaken.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the play's overall *message* about love and pride?
   * **Options:** A) That love is best avoided altogether, B) That pride and self-deception keep people from love, but honesty, good humour and community can overcome them — love wins out over wit and vanity, C) That deception always destroys in the end, D) That reputation does not really matter
   * **Correct:** B
   * **Feedback:** ✓ Correct. Beatrice and Benedick's proud mockery gives way to open love, and the divided world is reconciled — the play's enduring "so what" is that honesty and warmth outlast pride.
   * **Why A:** The play celebrates love, not its avoidance — the message is affirming, not cynical.
   * **Why C:** Kindly deception here *creates* love and truth wins out; destruction is not the final word.
   * **Why D:** Reputation is shown to matter greatly — its fragility is a central concern, not a trivial one.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about judgement does the play affirm through its patterns of "noting"?
   * **Options:** A) That we should always believe what we see and hear, B) That judging by appearances — hearsay, overheard talk, rash "noting" — leads people badly astray, and truth needs patience and good faith, C) That a ruined reputation can never be restored, D) That women deserve the blame when they are slandered
   * **Correct:** B
   * **Feedback:** ✓ Correct. Almost every disaster springs from misreading appearances; the play warns against hasty judgement and affirms the patient good faith that finally clears Hero.
   * **Why A:** The play shows the opposite — trusting appearances is exactly what misleads Claudio and nearly ruins Hero.
   * **Why C:** Hero's name *is* restored; the message is one of recovery, not permanent ruin.
   * **Why D:** Hero is the innocent victim of a lie; the play blames the slander, not the slandered.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the play's enduring messages is that malice and misunderstanding can be repaired — the community closes ranks, the wronged are restored, and harmony is renewed in marriage.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Don John's spite is exposed, Hero is vindicated and both couples wed; the comedy affirms that reconciliation can heal even a near-tragic breach.
   * **WhyWrong:** The play's close is one of repair, not ruin — malice is undone and harmony restored, which is the heart of its message.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about human relationships does the comedy finally affirm?
   * **Options:** A) That distrust and spite are the natural order of things, B) That however love is threatened by pride, deceit and rash judgement, honesty and reconciliation restore social harmony — disorder gives way to renewed union, C) That marriage is a trap to be escaped, D) That the cleverest schemer always wins in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. The play's lasting worldview is hopeful: pride, lies and misjudgement disrupt the community, but truth and good will knit it back together in marriage.
   * **Why A:** The ending overturns spite and distrust; harmony, not division, is the affirmed order.
   * **Why C:** Marriage is the happy resolution the play moves towards, not a trap.
   * **Why D:** Don John the schemer is caught and defeated; scheming brings ruin, not victory.
