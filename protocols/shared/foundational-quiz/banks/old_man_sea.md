# Foundational Quiz Bank — The Old Man and the Sea

Deterministic, code-scored foundational bank (parsed by `SWML_Quiz_Bank`).
**20 questions — 4 variations of each of the 5 aspects.** The picker serves ONE random question per
aspect = a light **5-question round** (`fq_dim_stratified`); depth comes from mastery REPETITION drawing
a fresh variation per aspect each round, not from round length (3–5 is the low-stakes retrieval sweet
spot). Keys + feedback live server-side and are stripped before questions reach the client.

**Concept-based (v7.20.x — governed by `FQ-QUESTION-STANDARD.md`).** Every item tests the CENTRAL
CONCEPT of its aspect, not surface trivia (research: `research/2026-07-11-concept-based-fq-question-design.md`).
Distractors are plausible CONCEPTUAL MISREADINGS a real student holds, so the student must reason to the
answer. The Old Man and the Sea is a **parable of heroic endurance / tragic heroism** ("grace under
pressure") → the `effects` aspect tests the reader's **admiration edged with poignant sorrow (heroic
pathos)**, not the naming of techniques.

Aspects (`@dim` → Conceptual-Notes field via `concept_field_for_dim`):
Protagonist → `cn_section_1` · Plot → `cn_section_3` · Themes → `cn_section_5` ·
Effects → `cn_section_4` (Genre & Emotion) · Message → `cn_section_7`. A correct answer autofills that
aspect's pre-authored note (`old_man_sea.concept-notes.md`) into the CN doc; mastery completes all five.

### Quiz: The Old Man and the Sea

1. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which best captures how Santiago *changes* across the novella — and what drives the change?
   * **Options:** A) He is a broken, defeated man from the first page and stays that way — nothing shifts, B) He begins an ageing fisherman branded "salao" — the unluckiest of all — and, through his own choice to row far out and endure the marlin, reclaims his dignity, proving "a man can be destroyed but not defeated", C) His luck simply turns and the sea rewards him at last, through no doing of his own, D) He grows bitter and vengeful, abandoning the sea forever
   * **Correct:** B
   * **Feedback:** ✓ Correct. The change is inward and self-won: from a man the village pities as unlucky to one who has proved his enduring worth — and the engine is his own resolve to go far out and hold on, not chance.
   * **Why A:** He starts marked as unlucky, but the ordeal transforms his sense of himself; the drama is that reclamation, not fixed defeat.
   * **Why C:** The sea rewards him with nothing material — the marlin is devoured; what he wins he wins through his own endurance, not luck.
   * **Why D:** He returns to sleep and dream of the lions and Manolin vows to fish with him again — the close points to renewal, not bitterness.

2. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** What makes Santiago a *heroic* figure rather than simply an unlucky old man who fails?
   * **Options:** A) He wins outright, returning rich with the great fish, B) He is neither triumphant victor nor mere victim — he loses the marlin yet keeps his courage and dignity intact, so his defeat becomes a kind of victory, C) He is entirely broken by the loss and gives up on life, D) He never truly suffers, so nothing is at stake
   * **Correct:** B
   * **Feedback:** ✓ Correct. Santiago occupies the heroic middle: physically defeated, spiritually undefeated. That his dignity survives the loss is exactly what turns failure into something noble and moving.
   * **Why A:** He returns with only a skeleton — the material prize is gone; his heroism lies in how he bears that loss, not in winning.
   * **Why C:** He endures and dreams again of the lions; he is destroyed in body, not in spirit — the opposite of giving up.
   * **Why D:** He suffers enormously — cramped hands, exhaustion, hunger; that suffering borne with dignity is the source of his heroism.

3. **Type: MCQ [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Which pairing best shows Santiago's evolution from beginning to end?
   * **Options:** A) A wealthy, respected captain → a ruined outcast, B) An old fisherman branded unlucky and pitied by the village → a man who has tested himself against the greatest fish of his life and proved his own indomitable dignity, C) A cowardly landsman → a fearless sailor who never doubts, D) A young apprentice → a retired old man who never fishes again
   * **Correct:** B
   * **Feedback:** ✓ Correct. He travels from marginalised "salao" to a man who has met his ultimate trial and kept his dignity — the same man, but inwardly affirmed by what he chose to endure.
   * **Why A:** He begins poor and unlucky, not wealthy, and ends inwardly affirmed, not ruined — this reverses his arc.
   * **Why C:** He is an experienced master of the sea throughout, not a cowardly landsman; and he does doubt and suffer.
   * **Why D:** He is the old man, not a young apprentice, and the close promises he will fish again with Manolin.

4. **Type: True-False [Tests Protagonist]**
   @dim:protagonist
   * **Question:** Santiago's dignity at the close is something he earns through his own endurance and choice to hold the line — not something luck or the sea hands him.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The sea gives him no material reward; what he gains — the proof that he can be destroyed but not defeated — he wins by his own suffering and resolve.
   * **WhyWrong:** His stripped skeleton shows the sea rewarded him with nothing; treating his dignity as luck's gift removes the very choice and endurance that make him heroic.

5. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Why does hooking the great marlin *lead to* losing it? (What is the causal link?)
   * **Options:** A) The two events are unconnected — he simply has bad luck afterwards, B) His pride drives him far beyond the other boats, so the marlin he hooks is too great to land alone and drags him even farther out; killing it leaves a trail of blood across open sea that draws the sharks, with no help near, C) The sharks were hunting him from the start, regardless of the fish, D) He carelessly lets the fish go and it swims into the sharks
   * **Correct:** B
   * **Feedback:** ✓ Correct. One act *causes* the next: going far out wins him the marlin but strands him in shark waters, and the blood of the kill summons them. The loss is the logical outworking of the catch, not a separate misfortune.
   * **Why A:** Here the loss follows by cause from the catch — the far distance and the blood trail are what doom the fish; reading them as unconnected misses the chain.
   * **Why C:** The sharks come *because of* the blood in the water, drawn by the killed marlin — they are a consequence of the catch, not a prior hunt.
   * **Why D:** He never lets the fish go — he lashes it tightly alongside and fights the sharks to keep it; the loss comes from the blood trail, not carelessness.

6. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Which best describes the *causal chain* of Santiago's ordeal — not just the order of events?
   * **Options:** A) A run of unrelated mishaps that strike him by chance, B) Pride sends him far out → he hooks a marlin too big to land alone → the days-long battle drags him farther still → he kills it and lashes it alongside → its blood draws the sharks → they devour it on the long voyage home, C) The sharks decide everything, so nothing follows from his own choices, D) The sea randomly gives and takes, and his actions make no difference
   * **Correct:** B
   * **Feedback:** ✓ Correct. Each stage flows by necessity from the one before, all originating in his choice to row beyond every other boat. That causal spine — not a list of events — is what gives the ordeal its shape.
   * **Why A:** His loss is not random mishap — it is the logical consequence of rowing so far out for so great a fish.
   * **Why C:** The sharks act only because of the blood his kill spills; making them the sole cause erases the chain that begins with his own choice.
   * **Why D:** His choices decide the arc — how far he rows, that he holds the line, that he kills the fish; without them there is no marlin and no loss.

7. **Type: MCQ [Tests Plot]**
   @dim:plot
   * **Question:** Santiago kills the marlin and lashes it to the skiff — his greatest triumph. Why is this same moment the *turning point* that makes his loss inevitable?
   * **Options:** A) Because the fish was worthless anyway, B) Because the marlin's blood spreads through the water and draws the sharks, so the very act of winning the fish is what dooms it, C) Because Santiago decides to give the fish away, D) Because a storm suddenly wrecks his boat
   * **Correct:** B
   * **Feedback:** ✓ Correct. The kill is triumph and catastrophe in one: the blood that proves his victory is exactly what summons the sharks. Winning the marlin is the act that ensures he cannot keep it — the tragic hinge of the tale.
   * **Why A:** The marlin is the catch of his life, not worthless; its greatness is precisely why the loss cuts so deep.
   * **Why C:** He fights ferociously to keep the fish, never giving it away; the loss comes from the blood trail, not surrender.
   * **Why D:** No storm destroys the boat — it is the sharks, drawn by blood, that strip the marlin.

8. **Type: True-False [Tests Plot]**
   @dim:plot
   * **Question:** In the novella the sharks' destruction of the marlin follows by cause-and-effect from Santiago's own choices — rowing far out and killing the fish — not as a random misfortune tacked on at the end.
   * **Answer:** True
   * **Feedback:** ✓ Correct. The far distance strands him beyond help and the blood of the kill draws the sharks: each disaster is *because of* an earlier choice, all rooted in his decision to go far out. That is causal necessity, not chance.
   * **WhyWrong:** Reading the shark attack as random bad luck ("it just happens on the way back") misses the causal chain — his pride, the distance and the blood are what make the loss inevitable.

9. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Santiago holds to the belief that "a man can be destroyed but not defeated". What controlling idea about the human condition does this announce?
   * **Options:** A) That effort is pointless because loss always comes, B) That dignity and spirit endure through suffering — a person may lose everything material yet remain unbeaten in courage and will, C) That only outright victory can give a life meaning, D) That nature always rewards those who try hardest
   * **Correct:** B
   * **Feedback:** ✓ Correct. The line is the novella's whole argument: worth lies not in the prize but in how one endures its loss. Destroyed in body, Santiago is undefeated in spirit — that is "grace under pressure".
   * **Why A:** The novella honours the struggle as meaningful whatever its outcome — the opposite of pointlessness.
   * **Why C:** Santiago loses the fish yet is not defeated; the book insists meaning survives material defeat.
   * **Why D:** Nature here is indifferent — the sharks take the marlin despite all his labour; effort earns dignity, not reward.

10. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Santiago comes to feel he "went out too far". Which controlling idea does this reveal, and how does it *work* in the story?
   * **Options:** A) That he lacked all ambition and should have tried harder, B) That pride and ambition can drive a person past safe limits — the same daring that lands the great marlin is what exposes it to the sharks, C) That the sea is simply too dangerous to fish at all, D) That pride is always rewarded in the end
   * **Correct:** B
   * **Feedback:** ✓ Correct. His pride is both the source of his triumph and of his loss: rowing beyond every other boat wins him the fish and strands it in shark waters. The theme works by making his greatest strength his undoing.
   * **Why A:** His far-reaching ambition is the point — he is anything but unambitious; the danger is that he reaches too far.
   * **Why C:** He loves and masters the sea; the idea is about his own overreaching pride, not the sea being unfishable.
   * **Why D:** His pride brings both triumph and ruin, not simple reward — the marlin is devoured.

11. **Type: MCQ [Tests Themes]**
   @dim:themes
   * **Question:** Santiago calls the marlin his "brother" even as he must kill it. Which idea about man and nature does this express?
   * **Options:** A) That nature is a mere resource to be used without thought, B) That man and nature are bound in a relationship of kinship and respect, even in the struggle to survive off one another, C) That the natural world is evil and must be conquered, D) That Santiago hates the creatures of the sea
   * **Correct:** B
   * **Feedback:** ✓ Correct. Santiago loves and honours the marlin as a worthy equal even while he must kill it — the novella's vision of humanity and nature as kin locked in a struggle that is also a bond of respect.
   * **Why A:** He treats the marlin with reverence, not as a thing to be used carelessly — the kinship is the point.
   * **Why C:** He calls the fish "brother" and admires its nobility; nature here is worthy, not evil.
   * **Why D:** He loves the sea and pities the marlin; hatred is the reverse of his feeling.

12. **Type: True-False [Tests Themes]**
   @dim:themes
   * **Question:** The devoted friendship between Santiago and the boy Manolin is one of the novella's central ideas, offering a tender counterweight of human love to the old man's solitary struggle.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Manolin brings food, cares for the old man and grieves at his suffering; their loyal bond frames Santiago's lonely ordeal with warmth and gives the ending its note of renewal.
   * **WhyWrong:** This is true — the love between Santiago and Manolin is a central idea, humanising the solitary struggle and promising continuity at the close.

13. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** The Old Man and the Sea is a tale of heroic endurance. Why do we feel deep *admiration* for Santiago by the end, even though he returns with nothing but a skeleton?
   * **Options:** A) Because he wins a great fortune and we are glad for him, B) Because a man of real courage and skill endures crushing loss without surrendering his dignity — his undefeated spirit stirs our admiration, C) Because we find his suffering amusing, D) Because the sharks are frightening monsters
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novella engineers admiration for undefeated dignity: Santiago loses everything material yet keeps his courage whole, and it is that grace under pressure — not any prize — that moves us.
   * **Why A:** He gains no fortune — only bone; our admiration is for how he bears the loss, not for any reward.
   * **Why C:** There is nothing comic in his ordeal; the intended feeling is admiration and poignancy, not amusement.
   * **Why D:** The sharks are agents of loss, but the emotion the book builds is admiration for Santiago's dignity, not horror at monsters.

14. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** A story of heroic endurance such as this is designed to leave us with which feeling above all?
   * **Options:** A) Triumphant delight, as at a clear and total victory, B) Admiration edged with poignant sorrow — we are moved by Santiago's undefeated dignity and by the cost of his struggle, C) Fear and dread, as in a horror story, D) Indifference, since nothing is really at stake
   * **Correct:** B
   * **Feedback:** ✓ Correct. The novella's effect is a double feeling: admiration for a spirit that cannot be defeated, and a tender sorrow at what the struggle costs him. Neither pure triumph nor despair — a moving, dignified pathos.
   * **Why A:** It is not a story of clean victory — he loses the fish; the feeling is admiration mixed with sorrow, not simple delight.
   * **Why C:** There is no horror-story dread here; the emotion is heroic pathos, admiration touched by grief.
   * **Why D:** Everything is at stake — his identity, his dignity, his last great trial; the book is built to move us deeply.

15. **Type: MCQ [Tests Effects]**
   @dim:effects
   * **Question:** Why do we feel *poignant sorrow* — not despair — as Santiago sails home with the marlin being stripped to bone?
   * **Options:** A) Because we think Santiago deserves to suffer, B) Because his loss is real and painful, yet his courage and dignity remain unbroken — so grief is lifted by admiration rather than sinking into hopelessness, C) Because we are bored and want the story to end, D) Because we are afraid the sharks will attack the village
   * **Correct:** B
   * **Feedback:** ✓ Correct. The sorrow is genuine — his triumph is being devoured — but it never becomes despair, because his spirit holds firm. That is the novella's characteristic feeling: pathos illuminated by admiration.
   * **Why A:** We do not feel he deserves ruin — his suffering is noble, which is why it moves rather than satisfies us.
   * **Why C:** The passage is one of the book's most affecting; the intended response is poignant admiration, not boredom.
   * **Why D:** The fear-for-the-village reading imports a threat the book does not raise; the feeling is sorrow-with-admiration for Santiago.

16. **Type: True-False [Tests Effects]**
   @dim:effects
   * **Question:** By the close of the novella we are meant to feel admiration for Santiago's undefeated dignity and a poignant sorrow at the cost of his struggle — a moving pathos rather than either simple triumph or despair.
   * **Answer:** True
   * **Feedback:** ✓ Correct. That double feeling — admiration for a spirit that survives ruin, and tender grief at its cost — is the emotional effect the story is built to produce, sealed by the closing image of the old man dreaming of the lions.
   * **WhyWrong:** The intended effect is admiration mixed with poignant sorrow, not triumphant delight or bleak despair; Santiago's dignity lifts the grief without erasing it.

17. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What is the novella's overall *message* about human worth and struggle?
   * **Options:** A) That success is all that matters, and to lose is to fail, B) That a person's worth lies in how they endure and hold their dignity, not in what they win — "a man can be destroyed but not defeated", C) That struggle is pointless because nature always wins, D) That only the lucky deserve respect
   * **Correct:** B
   * **Feedback:** ✓ Correct. Santiago loses the marlin yet keeps his dignity, and the novella affirms that this is what counts: worth is measured by courage and endurance under loss, not by the prize. That is its enduring "so what".
   * **Why A:** The book dramatises the opposite — Santiago "loses" yet is honoured; dignity outweighs material success.
   * **Why C:** Though nature strips the fish, the struggle is shown as meaningful and ennobling — the reverse of pointless.
   * **Why D:** Santiago is branded unlucky yet earns our deepest respect; the message ties worth to endurance, not luck.

18. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** What enduring idea about facing hardship does the novella affirm through Santiago?
   * **Options:** A) That one should give up when the odds are hard, B) That we should meet suffering with courage, skill and grace — "grace under pressure" — so that even in defeat a person remains unbeaten in spirit, C) That hardship should be avoided at all costs, D) That complaining eases suffering
   * **Correct:** B
   * **Feedback:** ✓ Correct. Santiago endures cramp, exhaustion and loss without self-pity or surrender, embodying Hemingway's ideal of grace under pressure: how one bears defeat can be its own victory.
   * **Why A:** Santiago never gives up despite the odds — his refusal to surrender is the very heart of the message.
   * **Why C:** The novella honours the willingness to face hardship, not to avoid it; the struggle is where dignity is proved.
   * **Why D:** Santiago bears his ordeal in near-silence and resolve, not complaint; endurance, not complaint, is the ideal.

19. **Type: True-False [Tests Message]**
   @dim:message
   * **Question:** One of the novella's lasting messages is that a person's dignity and courage can outlast any material defeat — the way one endures loss matters more than whether one wins.
   * **Answer:** True
   * **Feedback:** ✓ Correct. Santiago returns with only a skeleton yet unbroken in spirit, affirming the book's central conviction that a man "can be destroyed but not defeated" — worth lies in how one endures.
   * **WhyWrong:** This is true — the novella insists that dignity survives material loss, and that enduring with courage is itself a kind of victory.

20. **Type: MCQ [Tests Message]**
   @dim:message
   * **Question:** The novella lends Santiago's suffering a Christ-like dignity (he carries the mast up the hill like a cross). What does this suggest about the *message* of his struggle?
   * **Options:** A) That his suffering is meaningless and random, B) That there is a redemptive nobility in suffering borne with dignity — his ordeal, like a sacrifice, gives his endurance a larger, almost sacred meaning, C) That Santiago believes himself to be a god, D) That religion is mocked in the story
   * **Correct:** B
   * **Feedback:** ✓ Correct. The echo of the Passion dignifies Santiago's suffering, framing his endurance as noble and even sacred: the message that human struggle borne with grace carries a redemptive, transcendent worth.
   * **Why A:** The Christ parallel gives his suffering profound meaning — the opposite of random or meaningless.
   * **Why C:** The image lends him dignity, not divinity; Santiago is a humble fisherman, not one who thinks himself a god.
   * **Why D:** The allusion honours his suffering with sacred weight; it reveres rather than mocks.
