# Concept-Notes Sidecar — Edexcel IGCSE Non-fiction Anthology

Parsed by `SWML_Quiz_Bank::concept_notes_for('igcse_nonfiction')` into
`[ entity_slug => [ 'note' => text ] ]`. On a CORRECT foundational-quiz answer the FQ autofills the
matching note into the Conceptual-Notes one-doc field **`nf_{text}_{spine_slug}`** (per-answer + on
mastery) — the poetry `pf_{form}_{slot}` pattern, per-text. See `class-rest-api.php` (consumer) and
`class-quiz-bank.php::nf_spine_slug_for_dim()` (dim → spine slug).

**Entity key = composite `{text}_{dim}`** (the FQ @text + @dim tokens), so 10 texts never collapse
onto one dim slug. Heading slug uses the DIM name (voice/form/methods/ideas/purpose) — the parser
slugifies `### adichie_voice` → `adichie_voice`; the doc FIELD uses the spine slug
(voice/texttype/techniques/themes/purpose) resolved in code. FQ seeds 5 of the 8 nf spine slots per
text; the CN walk fills context/structure/message.

**Provenance:** each note is distilled from its bank question's `✓ Correct.` feedback in
`igcse_nonfiction.md` (source-verified at v7.20.33 against the anthology Part 1,
`Model Answers/.../iGCSE-Anthology-English-Language-A-and-English-Literature.md`). Quotes verbatim.
Basic seed notes — Sophia deepens them Socratically in the CN walk (they are a starting scaffold,
never the finished idea).

## Adichie — The Danger of a Single Story

### adichie_voice
- **Note:** Adichie speaks as "a storyteller" through her own life, and crucially implicates herself (the Mexico anecdote) — a reflective, confessional first-person voice that invites the listener in rather than accusing them.

### adichie_form
- **Note:** A TED speech built from stacked personal anecdotes — childhood books, the house boy Fide, her American roommate, Mexico — so the audience reaches the thesis "Stories matter" through story before she names it.

### adichie_methods
- **Note:** Insistent repetition — showing a people "as one thing, as only one thing, over and over again" — enacts the very reduction it describes, so the listener feels the flattening rather than just being told about it.

### adichie_ideas
- **Note:** Reducing any people to one story — however true in part — robs them of their full humanity, and whoever holds power decides which single story gets told: stories can "dispossess" or "empower".

### adichie_purpose
- **Note:** She moves past guilt toward action: rejecting the single story is how "we regain a kind of paradise" — she wants more stories and genuine connection "as human equals", not pity.

## Alagiah — A Passage to Africa

### alagiah_voice
- **Note:** A first-person reporter "inured to stories of suffering" whom a dying man's smile "turned the tables" on — carried "beyond pity or revulsion" from detached observer to reflective narrator questioning the ethics of his own reporting.

### alagiah_form
- **Note:** A fragmented sequence of intensifying encounters — Amina's dying daughters, the rotting woman — narrowing to "the face I will never forget", so the reader reaches the turning point already saturated with suffering.

### alagiah_methods
- **Note:** Likening the hunt for shocking images to "the craving for a drug" makes the reader feel the numbing corrosion of the journalists' own compassion — an uncomfortable self-indictment, not neutral description.

### alagiah_ideas
- **Note:** Even in utter degradation people "aspire to a dignity that is almost impossible to achieve"; that dignity, caught in one man's ashamed smile, poses a moral question about the relationship "between the rich world and the poor world".

### alagiah_purpose
- **Note:** Alagiah moves past pity and revulsion to responsibility — writing the story "with all the power and purpose I could muster" and ending in the man's debt: truly seeing another's dignity obliges us.

## Herbert — The Explorer's Daughter

### herbert_voice
- **Note:** A reflective first-person narrator, an outsider-who-belongs, who turns the hunt into an examination of her own divided feelings — "my heart leapt for both hunter and narwhal" — rather than reporting or condemning.

### herbert_form
- **Note:** Travel writing/memoir that weaves lyrical description, factual explanation and personal reflection, so the contrast-driven form itself enacts her dilemma — the pull between the animal's beauty and the necessity of the hunt.

### herbert_methods
- **Note:** Swinging her allegiance in the same breath — urging "the man on in my head" yet willing "the narwhal to dive, to leave, to survive" — makes the reader live the impossibility of choosing a side from the inside.

### herbert_ideas
- **Note:** An outsider's instinct to protect a beautiful creature must be weighed against the reality that "Hunting is still an absolute necessity in Thule" — the idea IS the unresolved tension between feeling and necessity.

### herbert_purpose
- **Note:** She wants the reader to move past easy condemnation and understand the hunters' necessity while still feeling compassion — because judging another people's survival by an outsider's sentiment is a luxury the Arctic does not allow.

## Morris — Explorers or boys messing about?

### morris_voice
- **Note:** A third-person news reporter who never appears in the story yet, through his chosen quotations and the "resentment in some quarters" framing, quietly steers the reader to weigh folly against heroism without stating his own verdict.

### morris_form
- **Note:** A newspaper article built on contrast — the men's genuine feats set directly against the "tens of thousands of pounds" cost and the experts' doubts — so the arrangement forces the reader to judge, exactly as the headline invites.

### morris_methods
- **Note:** Letting the wife's diminishing "boys messing about with a helicopter" and the experts' "pushing it to the maximum" carry the criticism makes the verdict seem to come from trusted insiders rather than the journalist — so it lands as fair, not opinion.

### morris_ideas
- **Note:** Daring adventure sits on a knife-edge between admirable courage and self-indulgent recklessness — and when it goes wrong, the public is left to "pick up the bill".

### morris_purpose
- **Note:** Morris steers the reader toward a sceptical question — was this courage or carelessness, and why should the public fund the rescue? As the headline insists, "either way, taxpayer gets rescue bill": personal adventure can carry a public price.

## Ralston — 127 Hours

### ralston_voice
- **Note:** A first-person adventurer at the centre of his own ordeal, narrating in the present tense as it happens ("the boulder then crushes my right hand", "I'm frantic, and I cry out"), so the reader is trapped in the moment with him.

### ralston_form
- **Note:** An autobiography that unfolds moment by moment in real time — each careful action leading to the next — so tension mounts step by step and the reader is caught in the present when the rock falls.

### ralston_methods
- **Note:** Stretching the seconds so "Time dilates" — the collision "In slow motion", "a tenth of their normal speed" — forces the reader to live the crush frame by frame, so a split-second disaster becomes an unbearable, drawn-out ordeal.

### ralston_ideas
- **Note:** Human control is precarious — despite all his skill and caution, one shifting stone that merely "teeters slightly" turns mastery into helplessness, exposing how fragile our hold over nature really is.

### ralston_purpose
- **Note:** Ralston puts us inside his panic — "The flaring agony throws me into a panic" — so we grasp how instantly an ordinary life can be overturned: a sobering sense of nature's indifference and the fragility of control.

## Zephaniah — Young and dyslexic? You've got it going on

### zephaniah_voice
- **Note:** A reflective first-person voice who turns a childhood in which "As a child I suffered" into direct encouragement, reframing dyslexia as a strength — "We are the architects, we are the designers" — rather than accusing the teachers who failed him.

### zephaniah_form
- **Note:** A personal essay organised by idea rather than date — school memories, prison and architects, advice to parents, a direct word to dyslexic kids — so the reader arrives at "being dyslexic is a natural way to be" through gathered experience.

### zephaniah_methods
- **Note:** Folding writer and reader into one group — "Us dyslexic people, we've got it going on" — makes a dyslexic reader feel part of a capable, proud company rather than an isolated individual with a problem: belonging is felt, not just argued.

### zephaniah_ideas
- **Note:** Dyslexia is a natural difference and even a creative strength; the fault lies not in the dyslexic person but in a narrow idea of normal — "What's unnatural is the way we read and write".

### zephaniah_purpose
- **Note:** He wants dyslexic readers to stop feeling something is wrong with them and instead use it to their advantage and "see the world differently" — because, as he tells them, "it's not you".

## Levine — A Game of Polo with a Headless Goat

### levine_voice
- **Note:** A first-person traveller-observer inside the action — "perched in the boot" filming — who reports the donkey race as a curious, delighted outsider, conveying its excitement without condemning it (the whips used "energetically, although not cruelly").

### levine_form
- **Note:** Travel and sports journalism built from vivid close-up scenes — the long wait, the roaring convoy, the neck-and-neck chase, the crash, the dispute — so the armchair reader experiences the unfamiliar sport moment by moment as if present.

### levine_methods
- **Note:** Translating the Karachi chase into "Formula One without rules, or a city-centre rush hour gone anarchic" lets a reader who has never seen it instantly feel the reckless speed and lawless chaos — the event experienced, not just explained.

### levine_ideas
- **Note:** The exhilaration — and the real precariousness — of throwing oneself first-hand into an unfamiliar culture's sport: thrilling, chaotic and genuinely dangerous all at once, felt through an outsider's eyes.

### levine_purpose
- **Note:** Levine wants the reader to share her outsider's thrill and to sense that stepping beyond the familiar into another culture's way of life, chaos and all, is where the most alive experience is found.

## Zeppa — Beyond the Sky and the Earth

### zeppa_voice
- **Note:** A first-person newcomer at the centre of her own arrival, openly registering her disorientation and shifting perceptions — "I am exhausted, but I cannot sleep" — so we meet Bhutan through her subjective, changing eyes.

### zeppa_form
- **Note:** A present-tense memoir — "It is my first night in Thimphu" — that carries us from bewildered disorientation toward earned admiration, so we undergo the journey with her rather than being told to admire the place.

### zeppa_methods
- **Note:** Piling up "on the other side of mountains are mountains, more mountains and mountains again" enacts the landscape's overwhelming endlessness, so we share her sense of being dwarfed and disoriented rather than merely told it is mountainous.

### zeppa_ideas
- **Note:** An utterly unfamiliar place first disorients the newcomer, but patient, open attention transforms bewilderment into admiration — a country cannot be grasped from facts alone but must be lived and felt.

### zeppa_purpose
- **Note:** Zeppa sets aside the "New York" yardstick and arrives at genuine admiration — a place reveals itself, and reshapes us, only when we meet the unfamiliar with humility and open attention rather than comparison.

## Macdonald — H is for Hawk

### macdonald_voice
- **Note:** A reflective first-person voice at the very centre of the experience — the "I" whose "My heart jumps sideways" — overwhelmed and raw, with an unspoken weight ("something behind it that was very important") driving her fierce need for this particular bird.

### macdonald_form
- **Note:** A true remembered experience told with the craft of literature — the syntax fracturing into fragments ("Concentration. Infinite caution.", "Thump.") — so a real event is lived from the inside and carries the full intensity of art.

### macdonald_methods
- **Note:** Piling up clashing images — "a conjuring trick. A reptile. A fallen angel", then "gold falling through water" — makes the reader feel her straining to grasp something too strange to fix in any single picture: awe and disorientation, not tidy description.

### macdonald_ideas
- **Note:** In a state of raw feeling the narrator fastens onto the sheer wildness and otherness of the hawk as something to fix upon, so the encounter is charged with a private grief that presses beneath its surface.

### macdonald_purpose
- **Note:** The memoir makes us live that overwhelming first meeting — "everything is brilliance and fury" — so we sense the unnamed grief beneath it and grasp how, in our rawest moments, we reach for something wild and alive outside ourselves.

## Yen Mah — Chinese Cinderella

### yenmah_voice
- **Note:** The writer as her own younger self at the centre of the memory — a reflective first-person voice full of "dread" that she has done wrong, yet aching for the rare moment her father is "proud of me" — not a detached observer, not an accuser.

### yenmah_form
- **Note:** An autobiography that follows one afternoon in strict order — the summons, the dread-filled drive, the meeting with Father — so we share the child's suspense and feel her mood turn from fear to joy moment by moment.

### yenmah_methods
- **Note:** Comparing the thought of leaving school to "a persistent toothache" makes her anxiety bodily and constant — a dull ache that will not leave — so the reader feels the low, inescapable dread rather than being told she is worried.

### yenmah_ideas
- **Note:** A rejected child's deep hunger for her father's love and for belonging — and how fragile and conditional that approval turns out to be, depending on her having "given him face".

### yenmah_purpose
- **Note:** Yen Mah wants us inside the child's overwhelming hope — how one rare word of pride can make her feel able to "reach the stars" — and to understand how precious, and how conditional, belonging becomes when love is scarce.
